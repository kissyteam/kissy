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
if (! _$jscoverage['/editor/clipboard.js']) {
  _$jscoverage['/editor/clipboard.js'] = {};
  _$jscoverage['/editor/clipboard.js'].lineData = [];
  _$jscoverage['/editor/clipboard.js'].lineData[6] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[7] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[13] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[14] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[15] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[16] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[19] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[21] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[26] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[29] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[31] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[32] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[33] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[34] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[35] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[36] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[37] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[41] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[42] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[47] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[48] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[58] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[60] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[61] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[62] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[63] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[64] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[65] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[66] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[71] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[72] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[73] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[77] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[79] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[80] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[83] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[86] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[91] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[92] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[93] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[95] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[99] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[100] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[101] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[104] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[108] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[110] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[113] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[117] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[118] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[119] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[121] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[122] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[123] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[131] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[133] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[139] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[142] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[143] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[147] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[148] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[151] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[153] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[158] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[159] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[160] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[163] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[167] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[172] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[174] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[175] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[178] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[180] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[192] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[194] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[197] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[198] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[199] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[201] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[207] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[208] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[210] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[215] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[217] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[219] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[221] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[225] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[228] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[230] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[235] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[236] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[239] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[240] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[244] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[246] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[247] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[250] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[258] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[259] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[263] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[270] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[273] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[275] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[277] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[281] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[283] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[287] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[289] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[292] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[296] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[303] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[304] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[305] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[306] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[307] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[309] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[310] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[311] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[312] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[313] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[314] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[317] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[319] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[320] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[321] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[327] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[328] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[330] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[331] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[332] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[334] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[335] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[336] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[338] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[339] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[341] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[343] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[347] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[348] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[353] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[354] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[358] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[360] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[361] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[362] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[364] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[370] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[371] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[377] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[379] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[380] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[382] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[383] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[384] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[388] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[391] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[392] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[393] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[394] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[396] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[397] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[399] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[401] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[402] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[403] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[405] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[408] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[409] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[412] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[415] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[421] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[424] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[426] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[427] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[431] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[432] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[435] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[436] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[437] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[438] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[439] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[440] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[441] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[442] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[443] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[452] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[457] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[461] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[462] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[464] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[466] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[467] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[468] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[469] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[475] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[476] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[477] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[478] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[481] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[482] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[483] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[484] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[485] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[492] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[495] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[496] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[497] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[498] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[499] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[501] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[503] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[504] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[505] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[506] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[507] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[509] = 0;
}
if (! _$jscoverage['/editor/clipboard.js'].functionData) {
  _$jscoverage['/editor/clipboard.js'].functionData = [];
  _$jscoverage['/editor/clipboard.js'].functionData[0] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[1] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[2] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[3] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[4] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[5] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[6] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[7] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[8] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[9] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[10] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[11] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[12] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[13] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[14] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[15] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[16] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[17] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[18] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[19] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[20] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[21] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[22] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[23] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[24] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[25] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[26] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[27] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[28] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[29] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[30] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[31] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[32] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[33] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[34] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[35] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[36] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[37] = 0;
}
if (! _$jscoverage['/editor/clipboard.js'].branchData) {
  _$jscoverage['/editor/clipboard.js'].branchData = {};
  _$jscoverage['/editor/clipboard.js'].branchData['34'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['35'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['37'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['47'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['60'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['79'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['83'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['83'][3] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['85'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['85'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['95'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['109'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['110'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['110'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['110'][3] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['118'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['133'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['147'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['158'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['174'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['210'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['211'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['221'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['235'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['239'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['244'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['273'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['307'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['307'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['319'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['328'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['330'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['332'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['334'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['336'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['338'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['353'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['358'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['358'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['360'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['370'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['377'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['379'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['382'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['394'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['401'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['408'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['431'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['464'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['468'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['477'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['495'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['498'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['504'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['506'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['506'][1] = new BranchData();
}
_$jscoverage['/editor/clipboard.js'].branchData['506'][1].init(104, 5, 'c.set');
function visit56_506_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['506'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['504'][1].init(310, 24, 'clipboardCommands[value]');
function visit55_504_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['498'][1].init(104, 5, 'c.get');
function visit54_498_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['495'][1].init(1449, 6, 'i >= 0');
function visit53_495_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['477'][1].init(90, 24, 'clipboardCommands[value]');
function visit52_477_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['468'][1].init(112, 32, 'i < clipboardCommandsList.length');
function visit51_468_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['464'][1].init(75, 23, '!contextmenu.__copy_fix');
function visit50_464_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['431'][1].init(204, 1, '0');
function visit49_431_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['408'][1].init(872, 30, '!htmlMode && isPlainText(html)');
function visit48_408_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['401'][1].init(422, 59, 'html.indexOf(\'<br class="Apple-interchange-newline">\') > -1');
function visit47_401_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['394'][1].init(126, 28, 'html.indexOf(\'Apple-\') != -1');
function visit46_394_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['382'][1].init(150, 29, 'html.indexOf(\'<br><br>\') > -1');
function visit45_382_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['379'][1].init(46, 8, 'UA.gecko');
function visit44_379_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['377'][1].init(1096, 20, 'UA.gecko || UA.opera');
function visit43_377_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['370'][1].init(509, 26, 'html.match(/<\\/div><div>/)');
function visit42_370_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['360'][1].init(82, 35, 'html.match(/<div>(?:<br>)?<\\/div>/)');
function visit41_360_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['358'][2].init(269, 26, 'html.indexOf(\'<div>\') > -1');
function visit40_358_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['358'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['358'][1].init(256, 39, 'UA.webkit && html.indexOf(\'<div>\') > -1');
function visit39_358_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['353'][1].init(160, 20, 'html.match(/^[^<]$/)');
function visit38_353_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['338'][1].init(48, 38, '!html.match(/^([^<]|<br( ?\\/)?>)*$/gi)');
function visit37_338_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['336'][1].init(532, 20, 'UA.gecko || UA.opera');
function visit36_336_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['334'][1].init(119, 98, '!html.match(/^([^<]|<br( ?\\/)?>)*$/gi) && !html.match(/^(<p>([^<]|<br( ?\\/)?>)*<\\/p>|(\\r\\n))*$/gi)');
function visit35_334_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['332'][1].init(257, 5, 'UA.ie');
function visit34_332_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['330'][1].init(91, 90, '!html.match(/^[^<]*$/g) && !html.match(/^(<div><br( ?\\/)?><\\/div>|<div>[^<]*<\\/div>)*$/gi)');
function visit33_330_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['328'][1].init(14, 9, 'UA.webkit');
function visit32_328_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['319'][1].init(64, 16, 'control.parent()');
function visit31_319_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['307'][2].init(132, 38, 'sel.getType() == KES.SELECTION_ELEMENT');
function visit30_307_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['307'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['307'][1].init(132, 95, '(sel.getType() == KES.SELECTION_ELEMENT) && (control = sel.getSelectedElement())');
function visit29_307_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['273'][1].init(587, 12, 'UA[\'ie\'] > 7');
function visit28_273_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['244'][1].init(1374, 61, '/(class="?Mso|style="[^"]*\\bmso\\-|w:WordDocument)/.test(html)');
function visit27_244_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['239'][1].init(1235, 16, 're !== undefined');
function visit26_239_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['235'][1].init(1148, 12, 're === false');
function visit25_235_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['221'][1].init(717, 27, '!(html = cleanPaste(html))');
function visit24_221_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['211'][1].init(38, 96, '(bogusSpan = pasteBin.first()) && (bogusSpan.hasClass(\'Apple-style-span\'))');
function visit23_211_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['210'][1].init(-1, 135, 'UA[\'webkit\'] && (bogusSpan = pasteBin.first()) && (bogusSpan.hasClass(\'Apple-style-span\'))');
function visit22_210_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['174'][1].init(1018, 12, 'UA[\'webkit\']');
function visit21_174_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['158'][1].init(388, 34, 'doc.getElementById(\'ke-paste-bin\')');
function visit20_158_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['147'][1].init(18, 26, 'this._isPreventBeforePaste');
function visit19_147_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['133'][1].init(87, 20, 'self._isPreventPaste');
function visit18_133_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['118'][1].init(48, 23, 'self._preventPasteTimer');
function visit17_118_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['110'][3].init(141, 18, 'ranges.length == 1');
function visit16_110_3(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['110'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['110'][2].init(141, 43, 'ranges.length == 1 && ranges[0].collapsed');
function visit15_110_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['110'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['110'][1].init(128, 58, 'ranges && !(ranges.length == 1 && ranges[0].collapsed)');
function visit14_110_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['109'][1].init(62, 22, 'sel && sel.getRanges()');
function visit13_109_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['95'][1].init(111, 18, 'command == \'paste\'');
function visit12_95_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['85'][2].init(315, 15, 'e.keyCode == 45');
function visit11_85_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['85'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['85'][1].init(81, 29, 'e.shiftKey && e.keyCode == 45');
function visit10_85_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['83'][3].init(230, 15, 'e.keyCode == 86');
function visit9_83_3(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['83'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['83'][2].init(217, 28, 'e.ctrlKey && e.keyCode == 86');
function visit8_83_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['83'][1].init(217, 111, 'e.ctrlKey && e.keyCode == 86 || e.shiftKey && e.keyCode == 45');
function visit7_83_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['79'][1].init(87, 46, 'editor.get(\'mode\') != Editor.Mode.WYSIWYG_MODE');
function visit6_79_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['60'][1].init(1793, 5, 'UA.ie');
function visit5_60_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['47'][1].init(722, 32, '!tryToCutCopyPaste(editor, type)');
function visit4_47_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['37'][1].init(141, 15, 'type == \'paste\'');
function visit3_37_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['35'][1].init(34, 13, 'type == \'cut\'');
function visit2_35_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['34'][1].init(30, 5, 'UA.ie');
function visit1_34_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].lineData[6]++;
KISSY.add("editor/clipboard", function(S, Editor, KERange, KES) {
  _$jscoverage['/editor/clipboard.js'].functionData[0]++;
  _$jscoverage['/editor/clipboard.js'].lineData[7]++;
  var $ = S.all, UA = S.UA, logger = S.getLogger('s/editor'), pasteEvent = UA.ie ? 'beforepaste' : 'paste', KER = Editor.RangeType;
  _$jscoverage['/editor/clipboard.js'].lineData[13]++;
  function Paste(editor) {
    _$jscoverage['/editor/clipboard.js'].functionData[1]++;
    _$jscoverage['/editor/clipboard.js'].lineData[14]++;
    var self = this;
    _$jscoverage['/editor/clipboard.js'].lineData[15]++;
    self.editor = editor;
    _$jscoverage['/editor/clipboard.js'].lineData[16]++;
    self._init();
  }
  _$jscoverage['/editor/clipboard.js'].lineData[19]++;
  S.augment(Paste, {
  _init: function() {
  _$jscoverage['/editor/clipboard.js'].functionData[2]++;
  _$jscoverage['/editor/clipboard.js'].lineData[21]++;
  var self = this, editor = self.editor, editorDoc = editor.get("document"), editorBody = editorDoc.one('body'), CutCopyPasteCmd = function(type) {
  _$jscoverage['/editor/clipboard.js'].functionData[3]++;
  _$jscoverage['/editor/clipboard.js'].lineData[26]++;
  this.type = type;
};
  _$jscoverage['/editor/clipboard.js'].lineData[29]++;
  CutCopyPasteCmd.prototype = {
  exec: function(editor) {
  _$jscoverage['/editor/clipboard.js'].functionData[4]++;
  _$jscoverage['/editor/clipboard.js'].lineData[31]++;
  var type = this.type;
  _$jscoverage['/editor/clipboard.js'].lineData[32]++;
  editor.focus();
  _$jscoverage['/editor/clipboard.js'].lineData[33]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[5]++;
  _$jscoverage['/editor/clipboard.js'].lineData[34]++;
  if (visit1_34_1(UA.ie)) {
    _$jscoverage['/editor/clipboard.js'].lineData[35]++;
    if (visit2_35_1(type == 'cut')) {
      _$jscoverage['/editor/clipboard.js'].lineData[36]++;
      fixCut(editor);
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[37]++;
      if (visit3_37_1(type == 'paste')) {
        _$jscoverage['/editor/clipboard.js'].lineData[41]++;
        self._preventPasteEvent();
        _$jscoverage['/editor/clipboard.js'].lineData[42]++;
        self._getClipboardDataFromPasteBin();
      }
    }
  }
  _$jscoverage['/editor/clipboard.js'].lineData[47]++;
  if (visit4_47_1(!tryToCutCopyPaste(editor, type))) {
    _$jscoverage['/editor/clipboard.js'].lineData[48]++;
    alert(error_types[type]);
  }
}, 0);
}};
  _$jscoverage['/editor/clipboard.js'].lineData[58]++;
  editorBody.on(pasteEvent, self._getClipboardDataFromPasteBin, self);
  _$jscoverage['/editor/clipboard.js'].lineData[60]++;
  if (visit5_60_1(UA.ie)) {
    _$jscoverage['/editor/clipboard.js'].lineData[61]++;
    editorBody.on('paste', self._iePaste, self);
    _$jscoverage['/editor/clipboard.js'].lineData[62]++;
    editorDoc.on('keydown', self._onKeyDown, self);
    _$jscoverage['/editor/clipboard.js'].lineData[63]++;
    editorDoc.on('contextmenu', function() {
  _$jscoverage['/editor/clipboard.js'].functionData[6]++;
  _$jscoverage['/editor/clipboard.js'].lineData[64]++;
  self._isPreventBeforePaste = 1;
  _$jscoverage['/editor/clipboard.js'].lineData[65]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[7]++;
  _$jscoverage['/editor/clipboard.js'].lineData[66]++;
  self._isPreventBeforePaste = 0;
}, 0);
});
  }
  _$jscoverage['/editor/clipboard.js'].lineData[71]++;
  editor.addCommand("copy", new CutCopyPasteCmd("copy"));
  _$jscoverage['/editor/clipboard.js'].lineData[72]++;
  editor.addCommand("cut", new CutCopyPasteCmd("cut"));
  _$jscoverage['/editor/clipboard.js'].lineData[73]++;
  editor.addCommand("paste", new CutCopyPasteCmd("paste"));
}, 
  '_onKeyDown': function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[8]++;
  _$jscoverage['/editor/clipboard.js'].lineData[77]++;
  var self = this, editor = self.editor;
  _$jscoverage['/editor/clipboard.js'].lineData[79]++;
  if (visit6_79_1(editor.get('mode') != Editor.Mode.WYSIWYG_MODE)) {
    _$jscoverage['/editor/clipboard.js'].lineData[80]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[83]++;
  if (visit7_83_1(visit8_83_2(e.ctrlKey && visit9_83_3(e.keyCode == 86)) || visit10_85_1(e.shiftKey && visit11_85_2(e.keyCode == 45)))) {
    _$jscoverage['/editor/clipboard.js'].lineData[86]++;
    self._preventPasteEvent();
  }
}, 
  _stateFromNamedCommand: function(command) {
  _$jscoverage['/editor/clipboard.js'].functionData[9]++;
  _$jscoverage['/editor/clipboard.js'].lineData[91]++;
  var ret;
  _$jscoverage['/editor/clipboard.js'].lineData[92]++;
  var self = this;
  _$jscoverage['/editor/clipboard.js'].lineData[93]++;
  var editor = self.editor;
  _$jscoverage['/editor/clipboard.js'].lineData[95]++;
  if (visit12_95_1(command == 'paste')) {
    _$jscoverage['/editor/clipboard.js'].lineData[99]++;
    self._isPreventBeforePaste = 1;
    _$jscoverage['/editor/clipboard.js'].lineData[100]++;
    try {
      _$jscoverage['/editor/clipboard.js'].lineData[101]++;
      ret = editor.get('document')[0].queryCommandEnabled(command);
    }    catch (e) {
}
    _$jscoverage['/editor/clipboard.js'].lineData[104]++;
    self._isPreventBeforePaste = 0;
  } else {
    _$jscoverage['/editor/clipboard.js'].lineData[108]++;
    var sel = editor.getSelection(), ranges = visit13_109_1(sel && sel.getRanges());
    _$jscoverage['/editor/clipboard.js'].lineData[110]++;
    ret = visit14_110_1(ranges && !(visit15_110_2(visit16_110_3(ranges.length == 1) && ranges[0].collapsed)));
  }
  _$jscoverage['/editor/clipboard.js'].lineData[113]++;
  return ret;
}, 
  '_preventPasteEvent': function() {
  _$jscoverage['/editor/clipboard.js'].functionData[10]++;
  _$jscoverage['/editor/clipboard.js'].lineData[117]++;
  var self = this;
  _$jscoverage['/editor/clipboard.js'].lineData[118]++;
  if (visit17_118_1(self._preventPasteTimer)) {
    _$jscoverage['/editor/clipboard.js'].lineData[119]++;
    clearTimeout(self._preventPasteTimer);
  }
  _$jscoverage['/editor/clipboard.js'].lineData[121]++;
  self._isPreventPaste = 1;
  _$jscoverage['/editor/clipboard.js'].lineData[122]++;
  self._preventPasteTimer = setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[11]++;
  _$jscoverage['/editor/clipboard.js'].lineData[123]++;
  self._isPreventPaste = 0;
}, 70);
}, 
  _iePaste: function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[12]++;
  _$jscoverage['/editor/clipboard.js'].lineData[131]++;
  var self = this, editor = self.editor;
  _$jscoverage['/editor/clipboard.js'].lineData[133]++;
  if (visit18_133_1(self._isPreventPaste)) {
    _$jscoverage['/editor/clipboard.js'].lineData[139]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[142]++;
  e.preventDefault();
  _$jscoverage['/editor/clipboard.js'].lineData[143]++;
  editor.execCommand('paste');
}, 
  _getClipboardDataFromPasteBin: function() {
  _$jscoverage['/editor/clipboard.js'].functionData[13]++;
  _$jscoverage['/editor/clipboard.js'].lineData[147]++;
  if (visit19_147_1(this._isPreventBeforePaste)) {
    _$jscoverage['/editor/clipboard.js'].lineData[148]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[151]++;
  logger.debug(pasteEvent + ": " + " paste event happen");
  _$jscoverage['/editor/clipboard.js'].lineData[153]++;
  var self = this, editor = self.editor, doc = editor.get("document")[0];
  _$jscoverage['/editor/clipboard.js'].lineData[158]++;
  if (visit20_158_1(doc.getElementById('ke-paste-bin'))) {
    _$jscoverage['/editor/clipboard.js'].lineData[159]++;
    logger.debug(pasteEvent + ": trigger more than once ...");
    _$jscoverage['/editor/clipboard.js'].lineData[160]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[163]++;
  var sel = editor.getSelection(), range = new KERange(doc);
  _$jscoverage['/editor/clipboard.js'].lineData[167]++;
  var pasteBin = $(UA['webkit'] ? '<body></body>' : '<div></div>', doc);
  _$jscoverage['/editor/clipboard.js'].lineData[172]++;
  pasteBin.attr('id', 'ke-paste-bin');
  _$jscoverage['/editor/clipboard.js'].lineData[174]++;
  if (visit21_174_1(UA['webkit'])) {
    _$jscoverage['/editor/clipboard.js'].lineData[175]++;
    pasteBin[0].appendChild(doc.createTextNode('\u200b'));
  }
  _$jscoverage['/editor/clipboard.js'].lineData[178]++;
  doc.body.appendChild(pasteBin[0]);
  _$jscoverage['/editor/clipboard.js'].lineData[180]++;
  pasteBin.css({
  position: 'absolute', 
  top: sel.getStartElement().offset().top + 'px', 
  width: '1px', 
  height: '1px', 
  overflow: 'hidden'});
  _$jscoverage['/editor/clipboard.js'].lineData[192]++;
  pasteBin.css('left', '-1000px');
  _$jscoverage['/editor/clipboard.js'].lineData[194]++;
  var bms = sel.createBookmarks();
  _$jscoverage['/editor/clipboard.js'].lineData[197]++;
  range.setStartAt(pasteBin, KER.POSITION_AFTER_START);
  _$jscoverage['/editor/clipboard.js'].lineData[198]++;
  range.setEndAt(pasteBin, KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/clipboard.js'].lineData[199]++;
  range.select(true);
  _$jscoverage['/editor/clipboard.js'].lineData[201]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[14]++;
  _$jscoverage['/editor/clipboard.js'].lineData[207]++;
  var bogusSpan;
  _$jscoverage['/editor/clipboard.js'].lineData[208]++;
  var oldPasteBin = pasteBin;
  _$jscoverage['/editor/clipboard.js'].lineData[210]++;
  pasteBin = (visit22_210_1(UA['webkit'] && visit23_211_1((bogusSpan = pasteBin.first()) && (bogusSpan.hasClass('Apple-style-span')))) ? bogusSpan : pasteBin);
  _$jscoverage['/editor/clipboard.js'].lineData[215]++;
  sel.selectBookmarks(bms);
  _$jscoverage['/editor/clipboard.js'].lineData[217]++;
  var html = pasteBin.html();
  _$jscoverage['/editor/clipboard.js'].lineData[219]++;
  oldPasteBin.remove();
  _$jscoverage['/editor/clipboard.js'].lineData[221]++;
  if (visit24_221_1(!(html = cleanPaste(html)))) {
    _$jscoverage['/editor/clipboard.js'].lineData[225]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[228]++;
  logger.debug("paste " + html);
  _$jscoverage['/editor/clipboard.js'].lineData[230]++;
  var re = editor.fire("paste", {
  html: html});
  _$jscoverage['/editor/clipboard.js'].lineData[235]++;
  if (visit25_235_1(re === false)) {
    _$jscoverage['/editor/clipboard.js'].lineData[236]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[239]++;
  if (visit26_239_1(re !== undefined)) {
    _$jscoverage['/editor/clipboard.js'].lineData[240]++;
    html = re;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[244]++;
  if (visit27_244_1(/(class="?Mso|style="[^"]*\bmso\-|w:WordDocument)/.test(html))) {
    _$jscoverage['/editor/clipboard.js'].lineData[246]++;
    S.use("editor/plugin/word-filter", function(S, wordFilter) {
  _$jscoverage['/editor/clipboard.js'].functionData[15]++;
  _$jscoverage['/editor/clipboard.js'].lineData[247]++;
  editor.insertHtml(wordFilter.toDataFormat(html, editor));
});
  } else {
    _$jscoverage['/editor/clipboard.js'].lineData[250]++;
    editor.insertHtml(html);
  }
}, 0);
}});
  _$jscoverage['/editor/clipboard.js'].lineData[258]++;
  var execIECommand = function(editor, command) {
  _$jscoverage['/editor/clipboard.js'].functionData[16]++;
  _$jscoverage['/editor/clipboard.js'].lineData[259]++;
  var doc = editor.get("document")[0], body = $(doc.body), enabled = false, onExec = function() {
  _$jscoverage['/editor/clipboard.js'].functionData[17]++;
  _$jscoverage['/editor/clipboard.js'].lineData[263]++;
  enabled = true;
};
  _$jscoverage['/editor/clipboard.js'].lineData[270]++;
  body.on(command, onExec);
  _$jscoverage['/editor/clipboard.js'].lineData[273]++;
  (visit28_273_1(UA['ie'] > 7) ? doc : doc.selection.createRange())['execCommand'](command);
  _$jscoverage['/editor/clipboard.js'].lineData[275]++;
  body.detach(command, onExec);
  _$jscoverage['/editor/clipboard.js'].lineData[277]++;
  return enabled;
};
  _$jscoverage['/editor/clipboard.js'].lineData[281]++;
  var tryToCutCopyPaste = UA['ie'] ? function(editor, type) {
  _$jscoverage['/editor/clipboard.js'].functionData[18]++;
  _$jscoverage['/editor/clipboard.js'].lineData[283]++;
  return execIECommand(editor, type);
} : function(editor, type) {
  _$jscoverage['/editor/clipboard.js'].functionData[19]++;
  _$jscoverage['/editor/clipboard.js'].lineData[287]++;
  try {
    _$jscoverage['/editor/clipboard.js'].lineData[289]++;
    return editor.get("document")[0].execCommand(type);
  }  catch (e) {
  _$jscoverage['/editor/clipboard.js'].lineData[292]++;
  return false;
}
};
  _$jscoverage['/editor/clipboard.js'].lineData[296]++;
  var error_types = {
  "cut": "\u60a8\u7684\u6d4f\u89c8\u5668\u5b89\u5168\u8bbe\u7f6e\u4e0d\u5141\u8bb8\u7f16\u8f91\u5668\u81ea\u52a8\u6267\u884c\u526a\u5207\u64cd\u4f5c\uff0c\u8bf7\u4f7f\u7528\u952e\u76d8\u5feb\u6377\u952e(Ctrl/Cmd+X)\u6765\u5b8c\u6210", 
  "copy": "\u60a8\u7684\u6d4f\u89c8\u5668\u5b89\u5168\u8bbe\u7f6e\u4e0d\u5141\u8bb8\u7f16\u8f91\u5668\u81ea\u52a8\u6267\u884c\u590d\u5236\u64cd\u4f5c\uff0c\u8bf7\u4f7f\u7528\u952e\u76d8\u5feb\u6377\u952e(Ctrl/Cmd+C)\u6765\u5b8c\u6210", 
  "paste": "\u60a8\u7684\u6d4f\u89c8\u5668\u5b89\u5168\u8bbe\u7f6e\u4e0d\u5141\u8bb8\u7f16\u8f91\u5668\u81ea\u52a8\u6267\u884c\u7c98\u8d34\u64cd\u4f5c\uff0c\u8bf7\u4f7f\u7528\u952e\u76d8\u5feb\u6377\u952e(Ctrl/Cmd+V)\u6765\u5b8c\u6210"};
  _$jscoverage['/editor/clipboard.js'].lineData[303]++;
  function fixCut(editor) {
    _$jscoverage['/editor/clipboard.js'].functionData[20]++;
    _$jscoverage['/editor/clipboard.js'].lineData[304]++;
    var editorDoc = editor.get("document")[0];
    _$jscoverage['/editor/clipboard.js'].lineData[305]++;
    var sel = editor.getSelection();
    _$jscoverage['/editor/clipboard.js'].lineData[306]++;
    var control;
    _$jscoverage['/editor/clipboard.js'].lineData[307]++;
    if (visit29_307_1((visit30_307_2(sel.getType() == KES.SELECTION_ELEMENT)) && (control = sel.getSelectedElement()))) {
      _$jscoverage['/editor/clipboard.js'].lineData[309]++;
      var range = sel.getRanges()[0];
      _$jscoverage['/editor/clipboard.js'].lineData[310]++;
      var dummy = $(editorDoc.createTextNode(''));
      _$jscoverage['/editor/clipboard.js'].lineData[311]++;
      dummy.insertBefore(control);
      _$jscoverage['/editor/clipboard.js'].lineData[312]++;
      range.setStartBefore(dummy);
      _$jscoverage['/editor/clipboard.js'].lineData[313]++;
      range.setEndAfter(control);
      _$jscoverage['/editor/clipboard.js'].lineData[314]++;
      sel.selectRanges([range]);
      _$jscoverage['/editor/clipboard.js'].lineData[317]++;
      setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[21]++;
  _$jscoverage['/editor/clipboard.js'].lineData[319]++;
  if (visit31_319_1(control.parent())) {
    _$jscoverage['/editor/clipboard.js'].lineData[320]++;
    dummy.remove();
    _$jscoverage['/editor/clipboard.js'].lineData[321]++;
    sel.selectElement(control);
  }
}, 0);
    }
  }
  _$jscoverage['/editor/clipboard.js'].lineData[327]++;
  function isPlainText(html) {
    _$jscoverage['/editor/clipboard.js'].functionData[22]++;
    _$jscoverage['/editor/clipboard.js'].lineData[328]++;
    if (visit32_328_1(UA.webkit)) {
      _$jscoverage['/editor/clipboard.js'].lineData[330]++;
      if (visit33_330_1(!html.match(/^[^<]*$/g) && !html.match(/^(<div><br( ?\/)?><\/div>|<div>[^<]*<\/div>)*$/gi))) {
        _$jscoverage['/editor/clipboard.js'].lineData[331]++;
        return 0;
      }
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[332]++;
      if (visit34_332_1(UA.ie)) {
        _$jscoverage['/editor/clipboard.js'].lineData[334]++;
        if (visit35_334_1(!html.match(/^([^<]|<br( ?\/)?>)*$/gi) && !html.match(/^(<p>([^<]|<br( ?\/)?>)*<\/p>|(\r\n))*$/gi))) {
          _$jscoverage['/editor/clipboard.js'].lineData[335]++;
          return 0;
        }
      } else {
        _$jscoverage['/editor/clipboard.js'].lineData[336]++;
        if (visit36_336_1(UA.gecko || UA.opera)) {
          _$jscoverage['/editor/clipboard.js'].lineData[338]++;
          if (visit37_338_1(!html.match(/^([^<]|<br( ?\/)?>)*$/gi))) {
            _$jscoverage['/editor/clipboard.js'].lineData[339]++;
            return 0;
          }
        } else {
          _$jscoverage['/editor/clipboard.js'].lineData[341]++;
          return 0;
        }
      }
    }
    _$jscoverage['/editor/clipboard.js'].lineData[343]++;
    return 1;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[347]++;
  function plainTextToHtml(html) {
    _$jscoverage['/editor/clipboard.js'].functionData[23]++;
    _$jscoverage['/editor/clipboard.js'].lineData[348]++;
    html = html.replace(/\s+/g, ' ').replace(/> +</g, '><').replace(/<br ?\/>/gi, '<br>');
    _$jscoverage['/editor/clipboard.js'].lineData[353]++;
    if (visit38_353_1(html.match(/^[^<]$/))) {
      _$jscoverage['/editor/clipboard.js'].lineData[354]++;
      return html;
    }
    _$jscoverage['/editor/clipboard.js'].lineData[358]++;
    if (visit39_358_1(UA.webkit && visit40_358_2(html.indexOf('<div>') > -1))) {
      _$jscoverage['/editor/clipboard.js'].lineData[360]++;
      if (visit41_360_1(html.match(/<div>(?:<br>)?<\/div>/))) {
        _$jscoverage['/editor/clipboard.js'].lineData[361]++;
        html = html.replace(/<div>(?:<br>)?<\/div>/g, function() {
  _$jscoverage['/editor/clipboard.js'].functionData[24]++;
  _$jscoverage['/editor/clipboard.js'].lineData[362]++;
  return '<p></p>';
});
        _$jscoverage['/editor/clipboard.js'].lineData[364]++;
        html = html.replace(/<\/p><div>/g, '</p><p>').replace(/<\/div><p>/g, '</p><p>').replace(/^<div>/, '<p>').replace(/^<\/div>/, '</p>');
      }
      _$jscoverage['/editor/clipboard.js'].lineData[370]++;
      if (visit42_370_1(html.match(/<\/div><div>/))) {
        _$jscoverage['/editor/clipboard.js'].lineData[371]++;
        html = html.replace(/<\/div><div>/g, '</p><p>').replace(/^<div>/, '<p>').replace(/^<\/div>/, '</p>');
      }
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[377]++;
      if (visit43_377_1(UA.gecko || UA.opera)) {
        _$jscoverage['/editor/clipboard.js'].lineData[379]++;
        if (visit44_379_1(UA.gecko)) {
          _$jscoverage['/editor/clipboard.js'].lineData[380]++;
          html = html.replace(/^<br><br>$/, '<br>');
        }
        _$jscoverage['/editor/clipboard.js'].lineData[382]++;
        if (visit45_382_1(html.indexOf('<br><br>') > -1)) {
          _$jscoverage['/editor/clipboard.js'].lineData[383]++;
          html = '<p>' + html.replace(/<br><br>/g, function() {
  _$jscoverage['/editor/clipboard.js'].functionData[25]++;
  _$jscoverage['/editor/clipboard.js'].lineData[384]++;
  return '</p><p>';
}) + '</p>';
        }
      }
    }
    _$jscoverage['/editor/clipboard.js'].lineData[388]++;
    return html;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[391]++;
  function cleanPaste(html) {
    _$jscoverage['/editor/clipboard.js'].functionData[26]++;
    _$jscoverage['/editor/clipboard.js'].lineData[392]++;
    var htmlMode = 0;
    _$jscoverage['/editor/clipboard.js'].lineData[393]++;
    html = html.replace(/<span[^>]+_ke_bookmark[^<]*?<\/span>(&nbsp;)*/ig, '');
    _$jscoverage['/editor/clipboard.js'].lineData[394]++;
    if (visit46_394_1(html.indexOf('Apple-') != -1)) {
      _$jscoverage['/editor/clipboard.js'].lineData[396]++;
      html = html.replace(/<span class="Apple-converted-space">&nbsp;<\/span>/gi, ' ');
      _$jscoverage['/editor/clipboard.js'].lineData[397]++;
      html = html.replace(/<span class="Apple-tab-span"[^>]*>([^<]*)<\/span>/gi, function(all, spaces) {
  _$jscoverage['/editor/clipboard.js'].functionData[27]++;
  _$jscoverage['/editor/clipboard.js'].lineData[399]++;
  return spaces.replace(/\t/g, new Array(5).join('&nbsp;'));
});
      _$jscoverage['/editor/clipboard.js'].lineData[401]++;
      if (visit47_401_1(html.indexOf('<br class="Apple-interchange-newline">') > -1)) {
        _$jscoverage['/editor/clipboard.js'].lineData[402]++;
        htmlMode = 1;
        _$jscoverage['/editor/clipboard.js'].lineData[403]++;
        html = html.replace(/<br class="Apple-interchange-newline">/, '');
      }
      _$jscoverage['/editor/clipboard.js'].lineData[405]++;
      html = html.replace(/(<[^>]+) class="Apple-[^"]*"/gi, '$1');
    }
    _$jscoverage['/editor/clipboard.js'].lineData[408]++;
    if (visit48_408_1(!htmlMode && isPlainText(html))) {
      _$jscoverage['/editor/clipboard.js'].lineData[409]++;
      html = plainTextToHtml(html);
    }
    _$jscoverage['/editor/clipboard.js'].lineData[412]++;
    return html;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[415]++;
  var lang = {
  "copy": "\u590d\u5236", 
  "paste": "\u7c98\u8d34", 
  "cut": "\u526a\u5207"};
  _$jscoverage['/editor/clipboard.js'].lineData[421]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/clipboard.js'].functionData[28]++;
  _$jscoverage['/editor/clipboard.js'].lineData[424]++;
  var currentPaste;
  _$jscoverage['/editor/clipboard.js'].lineData[426]++;
  editor.docReady(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[29]++;
  _$jscoverage['/editor/clipboard.js'].lineData[427]++;
  currentPaste = new Paste(editor);
});
  _$jscoverage['/editor/clipboard.js'].lineData[431]++;
  if (visit49_431_1(0)) {
    _$jscoverage['/editor/clipboard.js'].lineData[432]++;
    var defaultContextMenuFn;
    _$jscoverage['/editor/clipboard.js'].lineData[435]++;
    editor.docReady(defaultContextMenuFn = function() {
  _$jscoverage['/editor/clipboard.js'].functionData[30]++;
  _$jscoverage['/editor/clipboard.js'].lineData[436]++;
  editor.detach('docReady', defaultContextMenuFn);
  _$jscoverage['/editor/clipboard.js'].lineData[437]++;
  var firstFn;
  _$jscoverage['/editor/clipboard.js'].lineData[438]++;
  editor.get('document').on('contextmenu', firstFn = function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[31]++;
  _$jscoverage['/editor/clipboard.js'].lineData[439]++;
  e.preventDefault();
  _$jscoverage['/editor/clipboard.js'].lineData[440]++;
  editor.get('document').detach('contextmenu', firstFn);
  _$jscoverage['/editor/clipboard.js'].lineData[441]++;
  S.use('editor/plugin/contextmenu', function() {
  _$jscoverage['/editor/clipboard.js'].functionData[32]++;
  _$jscoverage['/editor/clipboard.js'].lineData[442]++;
  editor.addContextMenu('default', function() {
  _$jscoverage['/editor/clipboard.js'].functionData[33]++;
  _$jscoverage['/editor/clipboard.js'].lineData[443]++;
  return 1;
}, {
  event: e});
});
});
});
  }
  _$jscoverage['/editor/clipboard.js'].lineData[452]++;
  var clipboardCommands = {
  "copy": 1, 
  "cut": 1, 
  "paste": 1};
  _$jscoverage['/editor/clipboard.js'].lineData[457]++;
  var clipboardCommandsList = ["copy", "cut", "paste"];
  _$jscoverage['/editor/clipboard.js'].lineData[461]++;
  editor.on("contextmenu", function(ev) {
  _$jscoverage['/editor/clipboard.js'].functionData[34]++;
  _$jscoverage['/editor/clipboard.js'].lineData[462]++;
  var contextmenu = ev.contextmenu;
  _$jscoverage['/editor/clipboard.js'].lineData[464]++;
  if (visit50_464_1(!contextmenu.__copy_fix)) {
    _$jscoverage['/editor/clipboard.js'].lineData[466]++;
    contextmenu.__copy_fix = 1;
    _$jscoverage['/editor/clipboard.js'].lineData[467]++;
    var i = 0;
    _$jscoverage['/editor/clipboard.js'].lineData[468]++;
    for (; visit51_468_1(i < clipboardCommandsList.length); i++) {
      _$jscoverage['/editor/clipboard.js'].lineData[469]++;
      contextmenu.addChild({
  content: lang[clipboardCommandsList[i]], 
  value: clipboardCommandsList[i]});
    }
    _$jscoverage['/editor/clipboard.js'].lineData[475]++;
    contextmenu.on('click', function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[35]++;
  _$jscoverage['/editor/clipboard.js'].lineData[476]++;
  var value = e.target.get("value");
  _$jscoverage['/editor/clipboard.js'].lineData[477]++;
  if (visit52_477_1(clipboardCommands[value])) {
    _$jscoverage['/editor/clipboard.js'].lineData[478]++;
    contextmenu.hide();
    _$jscoverage['/editor/clipboard.js'].lineData[481]++;
    setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[36]++;
  _$jscoverage['/editor/clipboard.js'].lineData[482]++;
  editor.execCommand('save');
  _$jscoverage['/editor/clipboard.js'].lineData[483]++;
  editor.execCommand(value);
  _$jscoverage['/editor/clipboard.js'].lineData[484]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[37]++;
  _$jscoverage['/editor/clipboard.js'].lineData[485]++;
  editor.execCommand('save');
}, 10);
}, 30);
  }
});
  }
  _$jscoverage['/editor/clipboard.js'].lineData[492]++;
  var menuChildren = contextmenu.get('children');
  _$jscoverage['/editor/clipboard.js'].lineData[495]++;
  for (i = menuChildren.length - 1; visit53_495_1(i >= 0); i >= 0) {
    _$jscoverage['/editor/clipboard.js'].lineData[496]++;
    var c = menuChildren[i];
    _$jscoverage['/editor/clipboard.js'].lineData[497]++;
    var value;
    _$jscoverage['/editor/clipboard.js'].lineData[498]++;
    if (visit54_498_1(c.get)) {
      _$jscoverage['/editor/clipboard.js'].lineData[499]++;
      value = c.get("value");
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[501]++;
      value = c.value;
    }
    _$jscoverage['/editor/clipboard.js'].lineData[503]++;
    var v;
    _$jscoverage['/editor/clipboard.js'].lineData[504]++;
    if (visit55_504_1(clipboardCommands[value])) {
      _$jscoverage['/editor/clipboard.js'].lineData[505]++;
      v = !currentPaste._stateFromNamedCommand(value);
      _$jscoverage['/editor/clipboard.js'].lineData[506]++;
      if (visit56_506_1(c.set)) {
        _$jscoverage['/editor/clipboard.js'].lineData[507]++;
        c.set('disabled', v);
      } else {
        _$jscoverage['/editor/clipboard.js'].lineData[509]++;
        c.disabled = v;
      }
    }
  }
});
}};
}, {
  requires: ['./base', './range', './selection', 'node']});
