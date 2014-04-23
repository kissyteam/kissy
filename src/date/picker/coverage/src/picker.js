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
if (! _$jscoverage['/picker.js']) {
  _$jscoverage['/picker.js'] = {};
  _$jscoverage['/picker.js'].lineData = [];
  _$jscoverage['/picker.js'].lineData[6] = 0;
  _$jscoverage['/picker.js'].lineData[7] = 0;
  _$jscoverage['/picker.js'].lineData[12] = 0;
  _$jscoverage['/picker.js'].lineData[13] = 0;
  _$jscoverage['/picker.js'].lineData[14] = 0;
  _$jscoverage['/picker.js'].lineData[15] = 0;
  _$jscoverage['/picker.js'].lineData[17] = 0;
  _$jscoverage['/picker.js'].lineData[19] = 0;
  _$jscoverage['/picker.js'].lineData[20] = 0;
  _$jscoverage['/picker.js'].lineData[21] = 0;
  _$jscoverage['/picker.js'].lineData[22] = 0;
  _$jscoverage['/picker.js'].lineData[23] = 0;
  _$jscoverage['/picker.js'].lineData[32] = 0;
  _$jscoverage['/picker.js'].lineData[33] = 0;
  _$jscoverage['/picker.js'].lineData[35] = 0;
  _$jscoverage['/picker.js'].lineData[36] = 0;
  _$jscoverage['/picker.js'].lineData[41] = 0;
  _$jscoverage['/picker.js'].lineData[42] = 0;
  _$jscoverage['/picker.js'].lineData[47] = 0;
  _$jscoverage['/picker.js'].lineData[48] = 0;
  _$jscoverage['/picker.js'].lineData[52] = 0;
  _$jscoverage['/picker.js'].lineData[53] = 0;
  _$jscoverage['/picker.js'].lineData[54] = 0;
  _$jscoverage['/picker.js'].lineData[56] = 0;
  _$jscoverage['/picker.js'].lineData[60] = 0;
  _$jscoverage['/picker.js'].lineData[61] = 0;
  _$jscoverage['/picker.js'].lineData[62] = 0;
  _$jscoverage['/picker.js'].lineData[64] = 0;
  _$jscoverage['/picker.js'].lineData[68] = 0;
  _$jscoverage['/picker.js'].lineData[69] = 0;
  _$jscoverage['/picker.js'].lineData[72] = 0;
  _$jscoverage['/picker.js'].lineData[73] = 0;
  _$jscoverage['/picker.js'].lineData[74] = 0;
  _$jscoverage['/picker.js'].lineData[75] = 0;
  _$jscoverage['/picker.js'].lineData[78] = 0;
  _$jscoverage['/picker.js'].lineData[79] = 0;
  _$jscoverage['/picker.js'].lineData[80] = 0;
  _$jscoverage['/picker.js'].lineData[81] = 0;
  _$jscoverage['/picker.js'].lineData[84] = 0;
  _$jscoverage['/picker.js'].lineData[85] = 0;
  _$jscoverage['/picker.js'].lineData[86] = 0;
  _$jscoverage['/picker.js'].lineData[87] = 0;
  _$jscoverage['/picker.js'].lineData[90] = 0;
  _$jscoverage['/picker.js'].lineData[91] = 0;
  _$jscoverage['/picker.js'].lineData[92] = 0;
  _$jscoverage['/picker.js'].lineData[93] = 0;
  _$jscoverage['/picker.js'].lineData[96] = 0;
  _$jscoverage['/picker.js'].lineData[97] = 0;
  _$jscoverage['/picker.js'].lineData[98] = 0;
  _$jscoverage['/picker.js'].lineData[99] = 0;
  _$jscoverage['/picker.js'].lineData[102] = 0;
  _$jscoverage['/picker.js'].lineData[103] = 0;
  _$jscoverage['/picker.js'].lineData[104] = 0;
  _$jscoverage['/picker.js'].lineData[105] = 0;
  _$jscoverage['/picker.js'].lineData[108] = 0;
  _$jscoverage['/picker.js'].lineData[109] = 0;
  _$jscoverage['/picker.js'].lineData[110] = 0;
  _$jscoverage['/picker.js'].lineData[113] = 0;
  _$jscoverage['/picker.js'].lineData[114] = 0;
  _$jscoverage['/picker.js'].lineData[115] = 0;
  _$jscoverage['/picker.js'].lineData[118] = 0;
  _$jscoverage['/picker.js'].lineData[119] = 0;
  _$jscoverage['/picker.js'].lineData[120] = 0;
  _$jscoverage['/picker.js'].lineData[123] = 0;
  _$jscoverage['/picker.js'].lineData[124] = 0;
  _$jscoverage['/picker.js'].lineData[125] = 0;
  _$jscoverage['/picker.js'].lineData[128] = 0;
  _$jscoverage['/picker.js'].lineData[129] = 0;
  _$jscoverage['/picker.js'].lineData[130] = 0;
  _$jscoverage['/picker.js'].lineData[131] = 0;
  _$jscoverage['/picker.js'].lineData[132] = 0;
  _$jscoverage['/picker.js'].lineData[133] = 0;
  _$jscoverage['/picker.js'].lineData[134] = 0;
  _$jscoverage['/picker.js'].lineData[135] = 0;
  _$jscoverage['/picker.js'].lineData[136] = 0;
  _$jscoverage['/picker.js'].lineData[139] = 0;
  _$jscoverage['/picker.js'].lineData[140] = 0;
  _$jscoverage['/picker.js'].lineData[141] = 0;
  _$jscoverage['/picker.js'].lineData[147] = 0;
  _$jscoverage['/picker.js'].lineData[148] = 0;
  _$jscoverage['/picker.js'].lineData[149] = 0;
  _$jscoverage['/picker.js'].lineData[150] = 0;
  _$jscoverage['/picker.js'].lineData[151] = 0;
  _$jscoverage['/picker.js'].lineData[154] = 0;
  _$jscoverage['/picker.js'].lineData[155] = 0;
  _$jscoverage['/picker.js'].lineData[156] = 0;
  _$jscoverage['/picker.js'].lineData[160] = 0;
  _$jscoverage['/picker.js'].lineData[161] = 0;
  _$jscoverage['/picker.js'].lineData[164] = 0;
  _$jscoverage['/picker.js'].lineData[165] = 0;
  _$jscoverage['/picker.js'].lineData[166] = 0;
  _$jscoverage['/picker.js'].lineData[169] = 0;
  _$jscoverage['/picker.js'].lineData[170] = 0;
  _$jscoverage['/picker.js'].lineData[171] = 0;
  _$jscoverage['/picker.js'].lineData[172] = 0;
  _$jscoverage['/picker.js'].lineData[173] = 0;
  _$jscoverage['/picker.js'].lineData[174] = 0;
  _$jscoverage['/picker.js'].lineData[177] = 0;
  _$jscoverage['/picker.js'].lineData[178] = 0;
  _$jscoverage['/picker.js'].lineData[180] = 0;
  _$jscoverage['/picker.js'].lineData[181] = 0;
  _$jscoverage['/picker.js'].lineData[182] = 0;
  _$jscoverage['/picker.js'].lineData[183] = 0;
  _$jscoverage['/picker.js'].lineData[185] = 0;
  _$jscoverage['/picker.js'].lineData[189] = 0;
  _$jscoverage['/picker.js'].lineData[190] = 0;
  _$jscoverage['/picker.js'].lineData[191] = 0;
  _$jscoverage['/picker.js'].lineData[192] = 0;
  _$jscoverage['/picker.js'].lineData[194] = 0;
  _$jscoverage['/picker.js'].lineData[204] = 0;
  _$jscoverage['/picker.js'].lineData[206] = 0;
  _$jscoverage['/picker.js'].lineData[207] = 0;
  _$jscoverage['/picker.js'].lineData[208] = 0;
  _$jscoverage['/picker.js'].lineData[209] = 0;
  _$jscoverage['/picker.js'].lineData[210] = 0;
  _$jscoverage['/picker.js'].lineData[211] = 0;
  _$jscoverage['/picker.js'].lineData[212] = 0;
  _$jscoverage['/picker.js'].lineData[213] = 0;
  _$jscoverage['/picker.js'].lineData[214] = 0;
  _$jscoverage['/picker.js'].lineData[215] = 0;
  _$jscoverage['/picker.js'].lineData[216] = 0;
  _$jscoverage['/picker.js'].lineData[218] = 0;
  _$jscoverage['/picker.js'].lineData[231] = 0;
  _$jscoverage['/picker.js'].lineData[235] = 0;
  _$jscoverage['/picker.js'].lineData[239] = 0;
  _$jscoverage['/picker.js'].lineData[240] = 0;
  _$jscoverage['/picker.js'].lineData[241] = 0;
  _$jscoverage['/picker.js'].lineData[242] = 0;
  _$jscoverage['/picker.js'].lineData[243] = 0;
  _$jscoverage['/picker.js'].lineData[244] = 0;
  _$jscoverage['/picker.js'].lineData[250] = 0;
  _$jscoverage['/picker.js'].lineData[251] = 0;
  _$jscoverage['/picker.js'].lineData[252] = 0;
  _$jscoverage['/picker.js'].lineData[256] = 0;
  _$jscoverage['/picker.js'].lineData[257] = 0;
  _$jscoverage['/picker.js'].lineData[258] = 0;
  _$jscoverage['/picker.js'].lineData[259] = 0;
  _$jscoverage['/picker.js'].lineData[260] = 0;
  _$jscoverage['/picker.js'].lineData[264] = 0;
  _$jscoverage['/picker.js'].lineData[265] = 0;
  _$jscoverage['/picker.js'].lineData[266] = 0;
  _$jscoverage['/picker.js'].lineData[267] = 0;
  _$jscoverage['/picker.js'].lineData[268] = 0;
  _$jscoverage['/picker.js'].lineData[269] = 0;
  _$jscoverage['/picker.js'].lineData[270] = 0;
  _$jscoverage['/picker.js'].lineData[274] = 0;
  _$jscoverage['/picker.js'].lineData[296] = 0;
  _$jscoverage['/picker.js'].lineData[297] = 0;
  _$jscoverage['/picker.js'].lineData[298] = 0;
  _$jscoverage['/picker.js'].lineData[299] = 0;
  _$jscoverage['/picker.js'].lineData[300] = 0;
  _$jscoverage['/picker.js'].lineData[302] = 0;
  _$jscoverage['/picker.js'].lineData[303] = 0;
  _$jscoverage['/picker.js'].lineData[304] = 0;
  _$jscoverage['/picker.js'].lineData[305] = 0;
  _$jscoverage['/picker.js'].lineData[306] = 0;
  _$jscoverage['/picker.js'].lineData[307] = 0;
  _$jscoverage['/picker.js'].lineData[308] = 0;
  _$jscoverage['/picker.js'].lineData[309] = 0;
  _$jscoverage['/picker.js'].lineData[310] = 0;
  _$jscoverage['/picker.js'].lineData[312] = 0;
  _$jscoverage['/picker.js'].lineData[313] = 0;
  _$jscoverage['/picker.js'].lineData[316] = 0;
  _$jscoverage['/picker.js'].lineData[317] = 0;
  _$jscoverage['/picker.js'].lineData[318] = 0;
  _$jscoverage['/picker.js'].lineData[319] = 0;
  _$jscoverage['/picker.js'].lineData[320] = 0;
  _$jscoverage['/picker.js'].lineData[321] = 0;
  _$jscoverage['/picker.js'].lineData[326] = 0;
  _$jscoverage['/picker.js'].lineData[327] = 0;
  _$jscoverage['/picker.js'].lineData[328] = 0;
  _$jscoverage['/picker.js'].lineData[329] = 0;
  _$jscoverage['/picker.js'].lineData[330] = 0;
  _$jscoverage['/picker.js'].lineData[332] = 0;
  _$jscoverage['/picker.js'].lineData[333] = 0;
  _$jscoverage['/picker.js'].lineData[335] = 0;
  _$jscoverage['/picker.js'].lineData[336] = 0;
  _$jscoverage['/picker.js'].lineData[337] = 0;
  _$jscoverage['/picker.js'].lineData[339] = 0;
  _$jscoverage['/picker.js'].lineData[340] = 0;
  _$jscoverage['/picker.js'].lineData[342] = 0;
  _$jscoverage['/picker.js'].lineData[343] = 0;
  _$jscoverage['/picker.js'].lineData[345] = 0;
  _$jscoverage['/picker.js'].lineData[346] = 0;
  _$jscoverage['/picker.js'].lineData[347] = 0;
  _$jscoverage['/picker.js'].lineData[350] = 0;
  _$jscoverage['/picker.js'].lineData[351] = 0;
  _$jscoverage['/picker.js'].lineData[352] = 0;
  _$jscoverage['/picker.js'].lineData[360] = 0;
  _$jscoverage['/picker.js'].lineData[366] = 0;
  _$jscoverage['/picker.js'].lineData[368] = 0;
  _$jscoverage['/picker.js'].lineData[370] = 0;
  _$jscoverage['/picker.js'].lineData[371] = 0;
  _$jscoverage['/picker.js'].lineData[375] = 0;
  _$jscoverage['/picker.js'].lineData[376] = 0;
  _$jscoverage['/picker.js'].lineData[377] = 0;
  _$jscoverage['/picker.js'].lineData[378] = 0;
  _$jscoverage['/picker.js'].lineData[379] = 0;
  _$jscoverage['/picker.js'].lineData[380] = 0;
  _$jscoverage['/picker.js'].lineData[381] = 0;
  _$jscoverage['/picker.js'].lineData[382] = 0;
  _$jscoverage['/picker.js'].lineData[383] = 0;
  _$jscoverage['/picker.js'].lineData[385] = 0;
  _$jscoverage['/picker.js'].lineData[386] = 0;
  _$jscoverage['/picker.js'].lineData[387] = 0;
  _$jscoverage['/picker.js'].lineData[393] = 0;
  _$jscoverage['/picker.js'].lineData[394] = 0;
  _$jscoverage['/picker.js'].lineData[395] = 0;
  _$jscoverage['/picker.js'].lineData[396] = 0;
  _$jscoverage['/picker.js'].lineData[397] = 0;
  _$jscoverage['/picker.js'].lineData[398] = 0;
  _$jscoverage['/picker.js'].lineData[399] = 0;
  _$jscoverage['/picker.js'].lineData[400] = 0;
  _$jscoverage['/picker.js'].lineData[401] = 0;
  _$jscoverage['/picker.js'].lineData[402] = 0;
  _$jscoverage['/picker.js'].lineData[403] = 0;
  _$jscoverage['/picker.js'].lineData[404] = 0;
  _$jscoverage['/picker.js'].lineData[407] = 0;
  _$jscoverage['/picker.js'].lineData[408] = 0;
  _$jscoverage['/picker.js'].lineData[409] = 0;
  _$jscoverage['/picker.js'].lineData[410] = 0;
  _$jscoverage['/picker.js'].lineData[411] = 0;
  _$jscoverage['/picker.js'].lineData[412] = 0;
  _$jscoverage['/picker.js'].lineData[414] = 0;
  _$jscoverage['/picker.js'].lineData[418] = 0;
  _$jscoverage['/picker.js'].lineData[419] = 0;
  _$jscoverage['/picker.js'].lineData[420] = 0;
  _$jscoverage['/picker.js'].lineData[421] = 0;
  _$jscoverage['/picker.js'].lineData[423] = 0;
  _$jscoverage['/picker.js'].lineData[424] = 0;
  _$jscoverage['/picker.js'].lineData[426] = 0;
  _$jscoverage['/picker.js'].lineData[427] = 0;
  _$jscoverage['/picker.js'].lineData[432] = 0;
  _$jscoverage['/picker.js'].lineData[433] = 0;
  _$jscoverage['/picker.js'].lineData[435] = 0;
  _$jscoverage['/picker.js'].lineData[437] = 0;
  _$jscoverage['/picker.js'].lineData[438] = 0;
  _$jscoverage['/picker.js'].lineData[439] = 0;
  _$jscoverage['/picker.js'].lineData[441] = 0;
  _$jscoverage['/picker.js'].lineData[442] = 0;
  _$jscoverage['/picker.js'].lineData[443] = 0;
  _$jscoverage['/picker.js'].lineData[445] = 0;
  _$jscoverage['/picker.js'].lineData[448] = 0;
  _$jscoverage['/picker.js'].lineData[451] = 0;
  _$jscoverage['/picker.js'].lineData[453] = 0;
  _$jscoverage['/picker.js'].lineData[454] = 0;
  _$jscoverage['/picker.js'].lineData[456] = 0;
  _$jscoverage['/picker.js'].lineData[457] = 0;
  _$jscoverage['/picker.js'].lineData[459] = 0;
  _$jscoverage['/picker.js'].lineData[460] = 0;
  _$jscoverage['/picker.js'].lineData[462] = 0;
  _$jscoverage['/picker.js'].lineData[464] = 0;
  _$jscoverage['/picker.js'].lineData[466] = 0;
  _$jscoverage['/picker.js'].lineData[467] = 0;
  _$jscoverage['/picker.js'].lineData[469] = 0;
  _$jscoverage['/picker.js'].lineData[471] = 0;
  _$jscoverage['/picker.js'].lineData[473] = 0;
  _$jscoverage['/picker.js'].lineData[474] = 0;
  _$jscoverage['/picker.js'].lineData[476] = 0;
  _$jscoverage['/picker.js'].lineData[477] = 0;
  _$jscoverage['/picker.js'].lineData[479] = 0;
  _$jscoverage['/picker.js'].lineData[480] = 0;
  _$jscoverage['/picker.js'].lineData[482] = 0;
  _$jscoverage['/picker.js'].lineData[483] = 0;
  _$jscoverage['/picker.js'].lineData[485] = 0;
  _$jscoverage['/picker.js'].lineData[488] = 0;
  _$jscoverage['/picker.js'].lineData[490] = 0;
  _$jscoverage['/picker.js'].lineData[513] = 0;
  _$jscoverage['/picker.js'].lineData[514] = 0;
  _$jscoverage['/picker.js'].lineData[515] = 0;
  _$jscoverage['/picker.js'].lineData[520] = 0;
  _$jscoverage['/picker.js'].lineData[525] = 0;
  _$jscoverage['/picker.js'].lineData[530] = 0;
  _$jscoverage['/picker.js'].lineData[535] = 0;
  _$jscoverage['/picker.js'].lineData[540] = 0;
  _$jscoverage['/picker.js'].lineData[548] = 0;
  _$jscoverage['/picker.js'].lineData[553] = 0;
  _$jscoverage['/picker.js'].lineData[558] = 0;
  _$jscoverage['/picker.js'].lineData[563] = 0;
}
if (! _$jscoverage['/picker.js'].functionData) {
  _$jscoverage['/picker.js'].functionData = [];
  _$jscoverage['/picker.js'].functionData[0] = 0;
  _$jscoverage['/picker.js'].functionData[1] = 0;
  _$jscoverage['/picker.js'].functionData[2] = 0;
  _$jscoverage['/picker.js'].functionData[3] = 0;
  _$jscoverage['/picker.js'].functionData[4] = 0;
  _$jscoverage['/picker.js'].functionData[5] = 0;
  _$jscoverage['/picker.js'].functionData[6] = 0;
  _$jscoverage['/picker.js'].functionData[7] = 0;
  _$jscoverage['/picker.js'].functionData[8] = 0;
  _$jscoverage['/picker.js'].functionData[9] = 0;
  _$jscoverage['/picker.js'].functionData[10] = 0;
  _$jscoverage['/picker.js'].functionData[11] = 0;
  _$jscoverage['/picker.js'].functionData[12] = 0;
  _$jscoverage['/picker.js'].functionData[13] = 0;
  _$jscoverage['/picker.js'].functionData[14] = 0;
  _$jscoverage['/picker.js'].functionData[15] = 0;
  _$jscoverage['/picker.js'].functionData[16] = 0;
  _$jscoverage['/picker.js'].functionData[17] = 0;
  _$jscoverage['/picker.js'].functionData[18] = 0;
  _$jscoverage['/picker.js'].functionData[19] = 0;
  _$jscoverage['/picker.js'].functionData[20] = 0;
  _$jscoverage['/picker.js'].functionData[21] = 0;
  _$jscoverage['/picker.js'].functionData[22] = 0;
  _$jscoverage['/picker.js'].functionData[23] = 0;
  _$jscoverage['/picker.js'].functionData[24] = 0;
  _$jscoverage['/picker.js'].functionData[25] = 0;
  _$jscoverage['/picker.js'].functionData[26] = 0;
  _$jscoverage['/picker.js'].functionData[27] = 0;
  _$jscoverage['/picker.js'].functionData[28] = 0;
  _$jscoverage['/picker.js'].functionData[29] = 0;
  _$jscoverage['/picker.js'].functionData[30] = 0;
  _$jscoverage['/picker.js'].functionData[31] = 0;
  _$jscoverage['/picker.js'].functionData[32] = 0;
  _$jscoverage['/picker.js'].functionData[33] = 0;
  _$jscoverage['/picker.js'].functionData[34] = 0;
  _$jscoverage['/picker.js'].functionData[35] = 0;
  _$jscoverage['/picker.js'].functionData[36] = 0;
  _$jscoverage['/picker.js'].functionData[37] = 0;
  _$jscoverage['/picker.js'].functionData[38] = 0;
  _$jscoverage['/picker.js'].functionData[39] = 0;
  _$jscoverage['/picker.js'].functionData[40] = 0;
  _$jscoverage['/picker.js'].functionData[41] = 0;
  _$jscoverage['/picker.js'].functionData[42] = 0;
  _$jscoverage['/picker.js'].functionData[43] = 0;
}
if (! _$jscoverage['/picker.js'].branchData) {
  _$jscoverage['/picker.js'].branchData = {};
  _$jscoverage['/picker.js'].branchData['42'] = [];
  _$jscoverage['/picker.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['42'][2] = new BranchData();
  _$jscoverage['/picker.js'].branchData['43'] = [];
  _$jscoverage['/picker.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['43'][2] = new BranchData();
  _$jscoverage['/picker.js'].branchData['44'] = [];
  _$jscoverage['/picker.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['48'] = [];
  _$jscoverage['/picker.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['48'][2] = new BranchData();
  _$jscoverage['/picker.js'].branchData['49'] = [];
  _$jscoverage['/picker.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['53'] = [];
  _$jscoverage['/picker.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['56'] = [];
  _$jscoverage['/picker.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/picker.js'].branchData['57'] = [];
  _$jscoverage['/picker.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['61'] = [];
  _$jscoverage['/picker.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['64'] = [];
  _$jscoverage['/picker.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['64'][2] = new BranchData();
  _$jscoverage['/picker.js'].branchData['65'] = [];
  _$jscoverage['/picker.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['135'] = [];
  _$jscoverage['/picker.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['180'] = [];
  _$jscoverage['/picker.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['191'] = [];
  _$jscoverage['/picker.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['213'] = [];
  _$jscoverage['/picker.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['305'] = [];
  _$jscoverage['/picker.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['306'] = [];
  _$jscoverage['/picker.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['308'] = [];
  _$jscoverage['/picker.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['318'] = [];
  _$jscoverage['/picker.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['320'] = [];
  _$jscoverage['/picker.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['326'] = [];
  _$jscoverage['/picker.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['332'] = [];
  _$jscoverage['/picker.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['335'] = [];
  _$jscoverage['/picker.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['339'] = [];
  _$jscoverage['/picker.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['342'] = [];
  _$jscoverage['/picker.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['345'] = [];
  _$jscoverage['/picker.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['351'] = [];
  _$jscoverage['/picker.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['351'][2] = new BranchData();
  _$jscoverage['/picker.js'].branchData['380'] = [];
  _$jscoverage['/picker.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['395'] = [];
  _$jscoverage['/picker.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['401'] = [];
  _$jscoverage['/picker.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['401'][2] = new BranchData();
  _$jscoverage['/picker.js'].branchData['426'] = [];
  _$jscoverage['/picker.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['432'] = [];
  _$jscoverage['/picker.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['459'] = [];
  _$jscoverage['/picker.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['466'] = [];
  _$jscoverage['/picker.js'].branchData['466'][1] = new BranchData();
}
_$jscoverage['/picker.js'].branchData['466'][1].init(44, 7, 'ctrlKey');
function visit102_466_1(result) {
  _$jscoverage['/picker.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['459'][1].init(43, 7, 'ctrlKey');
function visit101_459_1(result) {
  _$jscoverage['/picker.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['432'][1].init(48, 8, '!ctrlKey');
function visit100_432_1(result) {
  _$jscoverage['/picker.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['426'][1].init(302, 17, 'this.get(\'clear\')');
function visit99_426_1(result) {
  _$jscoverage['/picker.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['401'][2].init(340, 42, 'disabledDate && disabledDate(value, value)');
function visit98_401_2(result) {
  _$jscoverage['/picker.js'].branchData['401'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['401'][1].init(338, 45, '!(disabledDate && disabledDate(value, value))');
function visit97_401_1(result) {
  _$jscoverage['/picker.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['395'][1].init(87, 28, 'isSameMonth(preValue, value)');
function visit96_395_1(result) {
  _$jscoverage['/picker.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['380'][1].init(253, 1, 'v');
function visit95_380_1(result) {
  _$jscoverage['/picker.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['351'][2].init(1045, 53, 'dateRender && (dateHtml = dateRender(current, value))');
function visit94_351_2(result) {
  _$jscoverage['/picker.js'].branchData['351'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['351'][1].init(1043, 56, '!(dateRender && (dateHtml = dateRender(current, value)))');
function visit93_351_1(result) {
  _$jscoverage['/picker.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['345'][1].init(810, 44, 'disabledDate && disabledDate(current, value)');
function visit92_345_1(result) {
  _$jscoverage['/picker.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['342'][1].init(664, 37, 'afterCurrentMonthYear(current, value)');
function visit91_342_1(result) {
  _$jscoverage['/picker.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['339'][1].init(517, 38, 'beforeCurrentMonthYear(current, value)');
function visit90_339_1(result) {
  _$jscoverage['/picker.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['335'][1].init(333, 37, '!isClear && isSameDay(current, value)');
function visit89_335_1(result) {
  _$jscoverage['/picker.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['332'][1].init(206, 25, 'isSameDay(current, today)');
function visit88_332_1(result) {
  _$jscoverage['/picker.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['326'][1].init(346, 18, 'j < DATE_COL_COUNT');
function visit87_326_1(result) {
  _$jscoverage['/picker.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['320'][1].init(70, 14, 'showWeekNumber');
function visit86_320_1(result) {
  _$jscoverage['/picker.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['318'][1].init(2126, 18, 'i < DATE_ROW_COUNT');
function visit85_318_1(result) {
  _$jscoverage['/picker.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['308'][1].init(69, 6, 'passed');
function visit84_308_1(result) {
  _$jscoverage['/picker.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['306'][1].init(30, 18, 'j < DATE_COL_COUNT');
function visit83_306_1(result) {
  _$jscoverage['/picker.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['305'][1].init(1640, 18, 'i < DATE_ROW_COUNT');
function visit82_305_1(result) {
  _$jscoverage['/picker.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['213'][1].init(333, 18, 'i < DATE_COL_COUNT');
function visit81_213_1(result) {
  _$jscoverage['/picker.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['191'][1].init(43, 18, '!this.get(\'clear\')');
function visit80_191_1(result) {
  _$jscoverage['/picker.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['180'][1].init(77, 2, '!v');
function visit79_180_1(result) {
  _$jscoverage['/picker.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['135'][1].init(270, 54, 'disabledDate && disabledDate(value, self.get(\'value\'))');
function visit78_135_1(result) {
  _$jscoverage['/picker.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['65'][1].init(53, 37, 'current.getMonth() > today.getMonth()');
function visit77_65_1(result) {
  _$jscoverage['/picker.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['64'][2].init(103, 37, 'current.getYear() === today.getYear()');
function visit76_64_2(result) {
  _$jscoverage['/picker.js'].branchData['64'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['64'][1].init(103, 91, 'current.getYear() === today.getYear() && current.getMonth() > today.getMonth()');
function visit75_64_1(result) {
  _$jscoverage['/picker.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['61'][1].init(14, 35, 'current.getYear() > today.getYear()');
function visit74_61_1(result) {
  _$jscoverage['/picker.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['57'][1].init(53, 37, 'current.getMonth() < today.getMonth()');
function visit73_57_1(result) {
  _$jscoverage['/picker.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['56'][2].init(103, 37, 'current.getYear() === today.getYear()');
function visit72_56_2(result) {
  _$jscoverage['/picker.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['56'][1].init(103, 91, 'current.getYear() === today.getYear() && current.getMonth() < today.getMonth()');
function visit71_56_1(result) {
  _$jscoverage['/picker.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['53'][1].init(14, 35, 'current.getYear() < today.getYear()');
function visit70_53_1(result) {
  _$jscoverage['/picker.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['49'][1].init(47, 33, 'one.getMonth() === two.getMonth()');
function visit69_49_1(result) {
  _$jscoverage['/picker.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['48'][2].init(17, 31, 'one.getYear() === two.getYear()');
function visit68_48_2(result) {
  _$jscoverage['/picker.js'].branchData['48'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['48'][1].init(17, 81, 'one.getYear() === two.getYear() && one.getMonth() === two.getMonth()');
function visit67_48_1(result) {
  _$jscoverage['/picker.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['44'][1].init(49, 43, 'one.getDayOfMonth() === two.getDayOfMonth()');
function visit66_44_1(result) {
  _$jscoverage['/picker.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['43'][2].init(67, 33, 'one.getMonth() === two.getMonth()');
function visit65_43_2(result) {
  _$jscoverage['/picker.js'].branchData['43'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['43'][1].init(47, 93, 'one.getMonth() === two.getMonth() && one.getDayOfMonth() === two.getDayOfMonth()');
function visit64_43_1(result) {
  _$jscoverage['/picker.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['42'][2].init(17, 31, 'one.getYear() === two.getYear()');
function visit63_42_2(result) {
  _$jscoverage['/picker.js'].branchData['42'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['42'][1].init(17, 141, 'one.getYear() === two.getYear() && one.getMonth() === two.getMonth() && one.getDayOfMonth() === two.getDayOfMonth()');
function visit62_42_1(result) {
  _$jscoverage['/picker.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/picker.js'].functionData[0]++;
  _$jscoverage['/picker.js'].lineData[7]++;
  var Node = require('node'), GregorianCalendar = require('date/gregorian'), locale = require('i18n!date/picker'), Control = require('component/control'), MonthPanel = require('./picker/month-panel/control');
  _$jscoverage['/picker.js'].lineData[12]++;
  var TapGesture = require('event/gesture/tap');
  _$jscoverage['/picker.js'].lineData[13]++;
  var tap = TapGesture.TAP;
  _$jscoverage['/picker.js'].lineData[14]++;
  var $ = Node.all;
  _$jscoverage['/picker.js'].lineData[15]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/picker.js'].lineData[17]++;
  var DateTimeFormat = require('date/format'), PickerTpl = require('date/picker-xtpl');
  _$jscoverage['/picker.js'].lineData[19]++;
  var dateRowTplStart = '<tr role="row">';
  _$jscoverage['/picker.js'].lineData[20]++;
  var dateRowTplEnd = '</tr>';
  _$jscoverage['/picker.js'].lineData[21]++;
  var dateCellTpl = '<td role="gridcell" data-index="{index}" title="{title}" class="{cls}">{content}</td>';
  _$jscoverage['/picker.js'].lineData[22]++;
  var weekNumberCellTpl = '<td role="gridcell" class="{cls}">{content}</td>';
  _$jscoverage['/picker.js'].lineData[23]++;
  var dateTpl = '<a ' + ' id="{id}" ' + ' hidefocus="on" ' + ' unselectable="on" ' + ' tabindex="-1" ' + ' class="{cls}" ' + ' href="#" ' + ' aria-selected="{selected}" ' + ' aria-disabled="{disabled}">{content}</a>';
  _$jscoverage['/picker.js'].lineData[32]++;
  var DATE_ROW_COUNT = 6;
  _$jscoverage['/picker.js'].lineData[33]++;
  var DATE_COL_COUNT = 7;
  _$jscoverage['/picker.js'].lineData[35]++;
  function getIdFromDate(d) {
    _$jscoverage['/picker.js'].functionData[1]++;
    _$jscoverage['/picker.js'].lineData[36]++;
    return 'ks-date-picker-date-' + d.getYear() + '-' + d.getMonth() + '-' + d.getDayOfMonth();
  }
  _$jscoverage['/picker.js'].lineData[41]++;
  function isSameDay(one, two) {
    _$jscoverage['/picker.js'].functionData[2]++;
    _$jscoverage['/picker.js'].lineData[42]++;
    return visit62_42_1(visit63_42_2(one.getYear() === two.getYear()) && visit64_43_1(visit65_43_2(one.getMonth() === two.getMonth()) && visit66_44_1(one.getDayOfMonth() === two.getDayOfMonth())));
  }
  _$jscoverage['/picker.js'].lineData[47]++;
  function isSameMonth(one, two) {
    _$jscoverage['/picker.js'].functionData[3]++;
    _$jscoverage['/picker.js'].lineData[48]++;
    return visit67_48_1(visit68_48_2(one.getYear() === two.getYear()) && visit69_49_1(one.getMonth() === two.getMonth()));
  }
  _$jscoverage['/picker.js'].lineData[52]++;
  function beforeCurrentMonthYear(current, today) {
    _$jscoverage['/picker.js'].functionData[4]++;
    _$jscoverage['/picker.js'].lineData[53]++;
    if (visit70_53_1(current.getYear() < today.getYear())) {
      _$jscoverage['/picker.js'].lineData[54]++;
      return 1;
    }
    _$jscoverage['/picker.js'].lineData[56]++;
    return visit71_56_1(visit72_56_2(current.getYear() === today.getYear()) && visit73_57_1(current.getMonth() < today.getMonth()));
  }
  _$jscoverage['/picker.js'].lineData[60]++;
  function afterCurrentMonthYear(current, today) {
    _$jscoverage['/picker.js'].functionData[5]++;
    _$jscoverage['/picker.js'].lineData[61]++;
    if (visit74_61_1(current.getYear() > today.getYear())) {
      _$jscoverage['/picker.js'].lineData[62]++;
      return 1;
    }
    _$jscoverage['/picker.js'].lineData[64]++;
    return visit75_64_1(visit76_64_2(current.getYear() === today.getYear()) && visit77_65_1(current.getMonth() > today.getMonth()));
  }
  _$jscoverage['/picker.js'].lineData[68]++;
  function renderDatesCmd() {
    _$jscoverage['/picker.js'].functionData[6]++;
    _$jscoverage['/picker.js'].lineData[69]++;
    return this.config.control.renderDates();
  }
  _$jscoverage['/picker.js'].lineData[72]++;
  function goStartMonth(self) {
    _$jscoverage['/picker.js'].functionData[7]++;
    _$jscoverage['/picker.js'].lineData[73]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker.js'].lineData[74]++;
    next.setDayOfMonth(1);
    _$jscoverage['/picker.js'].lineData[75]++;
    self.set('value', next);
  }
  _$jscoverage['/picker.js'].lineData[78]++;
  function goEndMonth(self) {
    _$jscoverage['/picker.js'].functionData[8]++;
    _$jscoverage['/picker.js'].lineData[79]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker.js'].lineData[80]++;
    next.setDayOfMonth(next.getActualMaximum(GregorianCalendar.MONTH));
    _$jscoverage['/picker.js'].lineData[81]++;
    self.set('value', next);
  }
  _$jscoverage['/picker.js'].lineData[84]++;
  function goMonth(self, direction) {
    _$jscoverage['/picker.js'].functionData[9]++;
    _$jscoverage['/picker.js'].lineData[85]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker.js'].lineData[86]++;
    next.addMonth(direction);
    _$jscoverage['/picker.js'].lineData[87]++;
    self.set('value', next);
  }
  _$jscoverage['/picker.js'].lineData[90]++;
  function goYear(self, direction) {
    _$jscoverage['/picker.js'].functionData[10]++;
    _$jscoverage['/picker.js'].lineData[91]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker.js'].lineData[92]++;
    next.addYear(direction);
    _$jscoverage['/picker.js'].lineData[93]++;
    self.set('value', next);
  }
  _$jscoverage['/picker.js'].lineData[96]++;
  function goWeek(self, direction) {
    _$jscoverage['/picker.js'].functionData[11]++;
    _$jscoverage['/picker.js'].lineData[97]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker.js'].lineData[98]++;
    next.addWeekOfYear(direction);
    _$jscoverage['/picker.js'].lineData[99]++;
    self.set('value', next);
  }
  _$jscoverage['/picker.js'].lineData[102]++;
  function goDay(self, direction) {
    _$jscoverage['/picker.js'].functionData[12]++;
    _$jscoverage['/picker.js'].lineData[103]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker.js'].lineData[104]++;
    next.addDayOfMonth(direction);
    _$jscoverage['/picker.js'].lineData[105]++;
    self.set('value', next);
  }
  _$jscoverage['/picker.js'].lineData[108]++;
  function nextMonth(e) {
    _$jscoverage['/picker.js'].functionData[13]++;
    _$jscoverage['/picker.js'].lineData[109]++;
    e.preventDefault();
    _$jscoverage['/picker.js'].lineData[110]++;
    goMonth(this, 1);
  }
  _$jscoverage['/picker.js'].lineData[113]++;
  function previousMonth(e) {
    _$jscoverage['/picker.js'].functionData[14]++;
    _$jscoverage['/picker.js'].lineData[114]++;
    e.preventDefault();
    _$jscoverage['/picker.js'].lineData[115]++;
    goMonth(this, -1);
  }
  _$jscoverage['/picker.js'].lineData[118]++;
  function nextYear(e) {
    _$jscoverage['/picker.js'].functionData[15]++;
    _$jscoverage['/picker.js'].lineData[119]++;
    e.preventDefault();
    _$jscoverage['/picker.js'].lineData[120]++;
    goYear(this, 1);
  }
  _$jscoverage['/picker.js'].lineData[123]++;
  function previousYear(e) {
    _$jscoverage['/picker.js'].functionData[16]++;
    _$jscoverage['/picker.js'].lineData[124]++;
    e.preventDefault();
    _$jscoverage['/picker.js'].lineData[125]++;
    goYear(this, -1);
  }
  _$jscoverage['/picker.js'].lineData[128]++;
  function chooseCell(e) {
    _$jscoverage['/picker.js'].functionData[17]++;
    _$jscoverage['/picker.js'].lineData[129]++;
    var self = this;
    _$jscoverage['/picker.js'].lineData[130]++;
    self.set('clear', false);
    _$jscoverage['/picker.js'].lineData[131]++;
    var disabledDate = self.get('disabledDate');
    _$jscoverage['/picker.js'].lineData[132]++;
    e.preventDefault();
    _$jscoverage['/picker.js'].lineData[133]++;
    var td = $(e.currentTarget);
    _$jscoverage['/picker.js'].lineData[134]++;
    var value = self.dateTable[parseInt(td.attr('data-index'), 10)];
    _$jscoverage['/picker.js'].lineData[135]++;
    if (visit78_135_1(disabledDate && disabledDate(value, self.get('value')))) {
      _$jscoverage['/picker.js'].lineData[136]++;
      return;
    }
    _$jscoverage['/picker.js'].lineData[139]++;
    setTimeout(function() {
  _$jscoverage['/picker.js'].functionData[18]++;
  _$jscoverage['/picker.js'].lineData[140]++;
  self.set('value', value);
  _$jscoverage['/picker.js'].lineData[141]++;
  self.fire('select', {
  value: value});
}, 0);
  }
  _$jscoverage['/picker.js'].lineData[147]++;
  function showMonthPanel(e) {
    _$jscoverage['/picker.js'].functionData[19]++;
    _$jscoverage['/picker.js'].lineData[148]++;
    e.preventDefault();
    _$jscoverage['/picker.js'].lineData[149]++;
    var monthPanel = this.get('monthPanel');
    _$jscoverage['/picker.js'].lineData[150]++;
    monthPanel.set('value', this.get('value'));
    _$jscoverage['/picker.js'].lineData[151]++;
    monthPanel.show();
  }
  _$jscoverage['/picker.js'].lineData[154]++;
  function setUpMonthPanel() {
    _$jscoverage['/picker.js'].functionData[20]++;
    _$jscoverage['/picker.js'].lineData[155]++;
    var self = this;
    _$jscoverage['/picker.js'].lineData[156]++;
    var monthPanel = new MonthPanel({
  locale: this.get('locale'), 
  render: self.get('el')});
    _$jscoverage['/picker.js'].lineData[160]++;
    monthPanel.on('select', onMonthPanelSelect, self);
    _$jscoverage['/picker.js'].lineData[161]++;
    return monthPanel;
  }
  _$jscoverage['/picker.js'].lineData[164]++;
  function onMonthPanelSelect(e) {
    _$jscoverage['/picker.js'].functionData[21]++;
    _$jscoverage['/picker.js'].lineData[165]++;
    this.set('value', e.value);
    _$jscoverage['/picker.js'].lineData[166]++;
    this.get('monthPanel').hide();
  }
  _$jscoverage['/picker.js'].lineData[169]++;
  function chooseToday(e) {
    _$jscoverage['/picker.js'].functionData[22]++;
    _$jscoverage['/picker.js'].lineData[170]++;
    e.preventDefault();
    _$jscoverage['/picker.js'].lineData[171]++;
    this.set('clear', false);
    _$jscoverage['/picker.js'].lineData[172]++;
    var today = this.get('value').clone();
    _$jscoverage['/picker.js'].lineData[173]++;
    today.setTime(S.now());
    _$jscoverage['/picker.js'].lineData[174]++;
    this.set('value', today);
  }
  _$jscoverage['/picker.js'].lineData[177]++;
  function toggleClear() {
    _$jscoverage['/picker.js'].functionData[23]++;
    _$jscoverage['/picker.js'].lineData[178]++;
    var self = this, v = !self.get('clear');
    _$jscoverage['/picker.js'].lineData[180]++;
    if (visit79_180_1(!v)) {
      _$jscoverage['/picker.js'].lineData[181]++;
      var value = self.get('value');
      _$jscoverage['/picker.js'].lineData[182]++;
      value.setDayOfMonth(1);
      _$jscoverage['/picker.js'].lineData[183]++;
      self.set('clear', false);
    } else {
      _$jscoverage['/picker.js'].lineData[185]++;
      self.set('clear', true);
    }
  }
  _$jscoverage['/picker.js'].lineData[189]++;
  function onClearClick(e) {
    _$jscoverage['/picker.js'].functionData[24]++;
    _$jscoverage['/picker.js'].lineData[190]++;
    e.preventDefault();
    _$jscoverage['/picker.js'].lineData[191]++;
    if (visit80_191_1(!this.get('clear'))) {
      _$jscoverage['/picker.js'].lineData[192]++;
      toggleClear.call(this);
    }
    _$jscoverage['/picker.js'].lineData[194]++;
    this.fire('select', {
  value: null});
  }
  _$jscoverage['/picker.js'].lineData[204]++;
  return Control.extend({
  beforeCreateDom: function(renderData, renderCommands) {
  _$jscoverage['/picker.js'].functionData[25]++;
  _$jscoverage['/picker.js'].lineData[206]++;
  var self = this;
  _$jscoverage['/picker.js'].lineData[207]++;
  var locale = self.get('locale');
  _$jscoverage['/picker.js'].lineData[208]++;
  var value = self.get('value');
  _$jscoverage['/picker.js'].lineData[209]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker.js'].lineData[210]++;
  var veryShortWeekdays = [];
  _$jscoverage['/picker.js'].lineData[211]++;
  var weekDays = [];
  _$jscoverage['/picker.js'].lineData[212]++;
  var firstDayOfWeek = value.getFirstDayOfWeek();
  _$jscoverage['/picker.js'].lineData[213]++;
  for (var i = 0; visit81_213_1(i < DATE_COL_COUNT); i++) {
    _$jscoverage['/picker.js'].lineData[214]++;
    var index = (firstDayOfWeek + i) % DATE_COL_COUNT;
    _$jscoverage['/picker.js'].lineData[215]++;
    veryShortWeekdays[i] = locale.veryShortWeekdays[index];
    _$jscoverage['/picker.js'].lineData[216]++;
    weekDays[i] = dateLocale.weekdays[index];
  }
  _$jscoverage['/picker.js'].lineData[218]++;
  S.mix(renderData, {
  monthSelectLabel: locale.monthSelect, 
  monthYearLabel: self.getMonthYearLabel(), 
  previousMonthLabel: locale.previousMonth, 
  nextMonthLabel: locale.nextMonth, 
  previousYearLabel: locale.previousYear, 
  nextYearLabel: locale.nextYear, 
  weekdays: weekDays, 
  veryShortWeekdays: veryShortWeekdays, 
  todayLabel: locale.today, 
  clearLabel: locale.clear, 
  todayTimeLabel: self.getTodayTimeLabel()});
  _$jscoverage['/picker.js'].lineData[231]++;
  renderCommands.renderDates = renderDatesCmd;
}, 
  createDom: function() {
  _$jscoverage['/picker.js'].functionData[26]++;
  _$jscoverage['/picker.js'].lineData[235]++;
  this.$el.attr('aria-activedescendant', getIdFromDate(this.get('value')));
}, 
  bindUI: function() {
  _$jscoverage['/picker.js'].functionData[27]++;
  _$jscoverage['/picker.js'].lineData[239]++;
  var self = this;
  _$jscoverage['/picker.js'].lineData[240]++;
  self.get('nextMonthBtn').on(tap, nextMonth, self);
  _$jscoverage['/picker.js'].lineData[241]++;
  self.get('previousMonthBtn').on(tap, previousMonth, self);
  _$jscoverage['/picker.js'].lineData[242]++;
  self.get('nextYearBtn').on(tap, nextYear, self);
  _$jscoverage['/picker.js'].lineData[243]++;
  self.get('previousYearBtn').on(tap, previousYear, self);
  _$jscoverage['/picker.js'].lineData[244]++;
  self.get('tbodyEl').delegate(tap, '.' + self.getBaseCssClass('cell'), chooseCell, self);
  _$jscoverage['/picker.js'].lineData[250]++;
  self.get('monthSelectEl').on(tap, showMonthPanel, self);
  _$jscoverage['/picker.js'].lineData[251]++;
  self.get('todayBtnEl').on(tap, chooseToday, self);
  _$jscoverage['/picker.js'].lineData[252]++;
  self.get('clearBtnEl').on(tap, onClearClick, self);
}, 
  getMonthYearLabel: function() {
  _$jscoverage['/picker.js'].functionData[28]++;
  _$jscoverage['/picker.js'].lineData[256]++;
  var self = this;
  _$jscoverage['/picker.js'].lineData[257]++;
  var locale = self.get('locale');
  _$jscoverage['/picker.js'].lineData[258]++;
  var value = self.get('value');
  _$jscoverage['/picker.js'].lineData[259]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker.js'].lineData[260]++;
  return new DateTimeFormat(locale.monthYearFormat, dateLocale).format(value);
}, 
  getTodayTimeLabel: function() {
  _$jscoverage['/picker.js'].functionData[29]++;
  _$jscoverage['/picker.js'].lineData[264]++;
  var self = this;
  _$jscoverage['/picker.js'].lineData[265]++;
  var locale = self.get('locale');
  _$jscoverage['/picker.js'].lineData[266]++;
  var value = self.get('value');
  _$jscoverage['/picker.js'].lineData[267]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker.js'].lineData[268]++;
  var today = value.clone();
  _$jscoverage['/picker.js'].lineData[269]++;
  today.setTime(S.now());
  _$jscoverage['/picker.js'].lineData[270]++;
  return new DateTimeFormat(locale.dateFormat, dateLocale).format(today);
}, 
  renderDates: function() {
  _$jscoverage['/picker.js'].functionData[30]++;
  _$jscoverage['/picker.js'].lineData[274]++;
  var self = this, i, j, dateTable = [], current, isClear = self.get('clear'), showWeekNumber = self.get('showWeekNumber'), locale = self.get('locale'), value = self.get('value'), today = value.clone(), cellClass = self.getBaseCssClasses('cell'), weekNumberCellClass = self.getBaseCssClasses('week-number-cell'), dateClass = self.getBaseCssClasses('date'), dateRender = self.get('dateRender'), disabledDate = self.get('disabledDate'), dateLocale = value.getLocale(), dateFormatter = new DateTimeFormat(locale.dateFormat, dateLocale), todayClass = self.getBaseCssClasses('today'), selectedClass = self.getBaseCssClasses('selected-day'), lastMonthDayClass = self.getBaseCssClasses('last-month-cell'), nextMonthDayClass = self.getBaseCssClasses('next-month-btn-day'), disabledClass = self.getBaseCssClasses('disabled-cell');
  _$jscoverage['/picker.js'].lineData[296]++;
  today.setTime(S.now());
  _$jscoverage['/picker.js'].lineData[297]++;
  var month1 = value.clone();
  _$jscoverage['/picker.js'].lineData[298]++;
  month1.set(value.getYear(), value.getMonth(), 1);
  _$jscoverage['/picker.js'].lineData[299]++;
  var day = month1.getDayOfWeek();
  _$jscoverage['/picker.js'].lineData[300]++;
  var lastMonthDiffDay = (day + 7 - value.getFirstDayOfWeek()) % 7;
  _$jscoverage['/picker.js'].lineData[302]++;
  var lastMonth1 = month1.clone();
  _$jscoverage['/picker.js'].lineData[303]++;
  lastMonth1.addDayOfMonth(0 - lastMonthDiffDay);
  _$jscoverage['/picker.js'].lineData[304]++;
  var passed = 0;
  _$jscoverage['/picker.js'].lineData[305]++;
  for (i = 0; visit82_305_1(i < DATE_ROW_COUNT); i++) {
    _$jscoverage['/picker.js'].lineData[306]++;
    for (j = 0; visit83_306_1(j < DATE_COL_COUNT); j++) {
      _$jscoverage['/picker.js'].lineData[307]++;
      current = lastMonth1;
      _$jscoverage['/picker.js'].lineData[308]++;
      if (visit84_308_1(passed)) {
        _$jscoverage['/picker.js'].lineData[309]++;
        current = current.clone();
        _$jscoverage['/picker.js'].lineData[310]++;
        current.addDayOfMonth(passed);
      }
      _$jscoverage['/picker.js'].lineData[312]++;
      dateTable.push(current);
      _$jscoverage['/picker.js'].lineData[313]++;
      passed++;
    }
  }
  _$jscoverage['/picker.js'].lineData[316]++;
  var tableHtml = '';
  _$jscoverage['/picker.js'].lineData[317]++;
  passed = 0;
  _$jscoverage['/picker.js'].lineData[318]++;
  for (i = 0; visit85_318_1(i < DATE_ROW_COUNT); i++) {
    _$jscoverage['/picker.js'].lineData[319]++;
    var rowHtml = dateRowTplStart;
    _$jscoverage['/picker.js'].lineData[320]++;
    if (visit86_320_1(showWeekNumber)) {
      _$jscoverage['/picker.js'].lineData[321]++;
      rowHtml += S.substitute(weekNumberCellTpl, {
  cls: weekNumberCellClass, 
  content: dateTable[passed].getWeekOfYear()});
    }
    _$jscoverage['/picker.js'].lineData[326]++;
    for (j = 0; visit87_326_1(j < DATE_COL_COUNT); j++) {
      _$jscoverage['/picker.js'].lineData[327]++;
      current = dateTable[passed];
      _$jscoverage['/picker.js'].lineData[328]++;
      var cls = cellClass;
      _$jscoverage['/picker.js'].lineData[329]++;
      var disabled = false;
      _$jscoverage['/picker.js'].lineData[330]++;
      var selected = false;
      _$jscoverage['/picker.js'].lineData[332]++;
      if (visit88_332_1(isSameDay(current, today))) {
        _$jscoverage['/picker.js'].lineData[333]++;
        cls += ' ' + todayClass;
      }
      _$jscoverage['/picker.js'].lineData[335]++;
      if (visit89_335_1(!isClear && isSameDay(current, value))) {
        _$jscoverage['/picker.js'].lineData[336]++;
        cls += ' ' + selectedClass;
        _$jscoverage['/picker.js'].lineData[337]++;
        selected = true;
      }
      _$jscoverage['/picker.js'].lineData[339]++;
      if (visit90_339_1(beforeCurrentMonthYear(current, value))) {
        _$jscoverage['/picker.js'].lineData[340]++;
        cls += ' ' + lastMonthDayClass;
      }
      _$jscoverage['/picker.js'].lineData[342]++;
      if (visit91_342_1(afterCurrentMonthYear(current, value))) {
        _$jscoverage['/picker.js'].lineData[343]++;
        cls += ' ' + nextMonthDayClass;
      }
      _$jscoverage['/picker.js'].lineData[345]++;
      if (visit92_345_1(disabledDate && disabledDate(current, value))) {
        _$jscoverage['/picker.js'].lineData[346]++;
        cls += ' ' + disabledClass;
        _$jscoverage['/picker.js'].lineData[347]++;
        disabled = true;
      }
      _$jscoverage['/picker.js'].lineData[350]++;
      var dateHtml = '';
      _$jscoverage['/picker.js'].lineData[351]++;
      if (visit93_351_1(!(visit94_351_2(dateRender && (dateHtml = dateRender(current, value)))))) {
        _$jscoverage['/picker.js'].lineData[352]++;
        dateHtml = S.substitute(dateTpl, {
  cls: dateClass, 
  id: getIdFromDate(current), 
  selected: selected, 
  disabled: disabled, 
  content: current.getDayOfMonth()});
      }
      _$jscoverage['/picker.js'].lineData[360]++;
      rowHtml += S.substitute(dateCellTpl, {
  cls: cls, 
  index: passed, 
  title: dateFormatter.format(current), 
  content: dateHtml});
      _$jscoverage['/picker.js'].lineData[366]++;
      passed++;
    }
    _$jscoverage['/picker.js'].lineData[368]++;
    tableHtml += rowHtml + dateRowTplEnd;
  }
  _$jscoverage['/picker.js'].lineData[370]++;
  self.dateTable = dateTable;
  _$jscoverage['/picker.js'].lineData[371]++;
  return tableHtml;
}, 
  _onSetClear: function(v) {
  _$jscoverage['/picker.js'].functionData[31]++;
  _$jscoverage['/picker.js'].lineData[375]++;
  var self = this;
  _$jscoverage['/picker.js'].lineData[376]++;
  var value = self.get('value');
  _$jscoverage['/picker.js'].lineData[377]++;
  var selectedCls = this.getBaseCssClasses('selected-day');
  _$jscoverage['/picker.js'].lineData[378]++;
  var id = getIdFromDate(value);
  _$jscoverage['/picker.js'].lineData[379]++;
  var currentA = this.$('#' + id);
  _$jscoverage['/picker.js'].lineData[380]++;
  if (visit95_380_1(v)) {
    _$jscoverage['/picker.js'].lineData[381]++;
    currentA.parent().removeClass(selectedCls);
    _$jscoverage['/picker.js'].lineData[382]++;
    currentA.attr('aria-selected', false);
    _$jscoverage['/picker.js'].lineData[383]++;
    self.$el.attr('aria-activedescendant', '');
  } else {
    _$jscoverage['/picker.js'].lineData[385]++;
    currentA.parent().addClass(selectedCls);
    _$jscoverage['/picker.js'].lineData[386]++;
    currentA.attr('aria-selected', true);
    _$jscoverage['/picker.js'].lineData[387]++;
    self.$el.attr('aria-activedescendant', id);
  }
}, 
  _onSetValue: function(value, e) {
  _$jscoverage['/picker.js'].functionData[32]++;
  _$jscoverage['/picker.js'].lineData[393]++;
  var self = this;
  _$jscoverage['/picker.js'].lineData[394]++;
  var preValue = e.prevVal;
  _$jscoverage['/picker.js'].lineData[395]++;
  if (visit96_395_1(isSameMonth(preValue, value))) {
    _$jscoverage['/picker.js'].lineData[396]++;
    var disabledDate = self.get('disabledDate');
    _$jscoverage['/picker.js'].lineData[397]++;
    var selectedCls = self.getBaseCssClasses('selected-day');
    _$jscoverage['/picker.js'].lineData[398]++;
    var prevA = self.$('#' + getIdFromDate(preValue));
    _$jscoverage['/picker.js'].lineData[399]++;
    prevA.parent().removeClass(selectedCls);
    _$jscoverage['/picker.js'].lineData[400]++;
    prevA.attr('aria-selected', false);
    _$jscoverage['/picker.js'].lineData[401]++;
    if (visit97_401_1(!(visit98_401_2(disabledDate && disabledDate(value, value))))) {
      _$jscoverage['/picker.js'].lineData[402]++;
      var currentA = self.$('#' + getIdFromDate(value));
      _$jscoverage['/picker.js'].lineData[403]++;
      currentA.parent().addClass(selectedCls);
      _$jscoverage['/picker.js'].lineData[404]++;
      currentA.attr('aria-selected', true);
    }
  } else {
    _$jscoverage['/picker.js'].lineData[407]++;
    var tbodyEl = self.get('tbodyEl');
    _$jscoverage['/picker.js'].lineData[408]++;
    var monthSelectContentEl = self.get('monthSelectContentEl');
    _$jscoverage['/picker.js'].lineData[409]++;
    var todayBtnEl = self.get('todayBtnEl');
    _$jscoverage['/picker.js'].lineData[410]++;
    monthSelectContentEl.html(self.getMonthYearLabel());
    _$jscoverage['/picker.js'].lineData[411]++;
    todayBtnEl.attr('title', self.getTodayTimeLabel());
    _$jscoverage['/picker.js'].lineData[412]++;
    tbodyEl.html(self.renderDates());
  }
  _$jscoverage['/picker.js'].lineData[414]++;
  self.$el.attr('aria-activedescendant', getIdFromDate(value));
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/picker.js'].functionData[33]++;
  _$jscoverage['/picker.js'].lineData[418]++;
  var self = this;
  _$jscoverage['/picker.js'].lineData[419]++;
  var keyCode = e.keyCode;
  _$jscoverage['/picker.js'].lineData[420]++;
  var ctrlKey = e.ctrlKey;
  _$jscoverage['/picker.js'].lineData[421]++;
  switch (keyCode) {
    case KeyCode.SPACE:
      _$jscoverage['/picker.js'].lineData[423]++;
      self.set('clear', !self.get('clear'));
      _$jscoverage['/picker.js'].lineData[424]++;
      return true;
  }
  _$jscoverage['/picker.js'].lineData[426]++;
  if (visit99_426_1(this.get('clear'))) {
    _$jscoverage['/picker.js'].lineData[427]++;
    switch (keyCode) {
      case KeyCode.DOWN:
      case KeyCode.UP:
      case KeyCode.LEFT:
      case KeyCode.RIGHT:
        _$jscoverage['/picker.js'].lineData[432]++;
        if (visit100_432_1(!ctrlKey)) {
          _$jscoverage['/picker.js'].lineData[433]++;
          toggleClear.call(self);
        }
        _$jscoverage['/picker.js'].lineData[435]++;
        return true;
      case KeyCode.HOME:
        _$jscoverage['/picker.js'].lineData[437]++;
        toggleClear.call(self);
        _$jscoverage['/picker.js'].lineData[438]++;
        goStartMonth(self);
        _$jscoverage['/picker.js'].lineData[439]++;
        return true;
      case KeyCode.END:
        _$jscoverage['/picker.js'].lineData[441]++;
        toggleClear.call(self);
        _$jscoverage['/picker.js'].lineData[442]++;
        goEndMonth(self);
        _$jscoverage['/picker.js'].lineData[443]++;
        return true;
      case KeyCode.ENTER:
        _$jscoverage['/picker.js'].lineData[445]++;
        self.fire('select', {
  value: null});
        _$jscoverage['/picker.js'].lineData[448]++;
        return true;
    }
  }
  _$jscoverage['/picker.js'].lineData[451]++;
  switch (keyCode) {
    case KeyCode.DOWN:
      _$jscoverage['/picker.js'].lineData[453]++;
      goWeek(self, 1);
      _$jscoverage['/picker.js'].lineData[454]++;
      return true;
    case KeyCode.UP:
      _$jscoverage['/picker.js'].lineData[456]++;
      goWeek(self, -1);
      _$jscoverage['/picker.js'].lineData[457]++;
      return true;
    case KeyCode.LEFT:
      _$jscoverage['/picker.js'].lineData[459]++;
      if (visit101_459_1(ctrlKey)) {
        _$jscoverage['/picker.js'].lineData[460]++;
        goYear(self, -1);
      } else {
        _$jscoverage['/picker.js'].lineData[462]++;
        goDay(self, -1);
      }
      _$jscoverage['/picker.js'].lineData[464]++;
      return true;
    case KeyCode.RIGHT:
      _$jscoverage['/picker.js'].lineData[466]++;
      if (visit102_466_1(ctrlKey)) {
        _$jscoverage['/picker.js'].lineData[467]++;
        goYear(self, 1);
      } else {
        _$jscoverage['/picker.js'].lineData[469]++;
        goDay(self, 1);
      }
      _$jscoverage['/picker.js'].lineData[471]++;
      return true;
    case KeyCode.HOME:
      _$jscoverage['/picker.js'].lineData[473]++;
      goStartMonth(self);
      _$jscoverage['/picker.js'].lineData[474]++;
      return true;
    case KeyCode.END:
      _$jscoverage['/picker.js'].lineData[476]++;
      goEndMonth(self);
      _$jscoverage['/picker.js'].lineData[477]++;
      return true;
    case KeyCode.PAGE_DOWN:
      _$jscoverage['/picker.js'].lineData[479]++;
      goMonth(self, 1);
      _$jscoverage['/picker.js'].lineData[480]++;
      return true;
    case KeyCode.PAGE_UP:
      _$jscoverage['/picker.js'].lineData[482]++;
      goMonth(self, -1);
      _$jscoverage['/picker.js'].lineData[483]++;
      return true;
    case KeyCode.ENTER:
      _$jscoverage['/picker.js'].lineData[485]++;
      self.fire('select', {
  value: self.get('value')});
      _$jscoverage['/picker.js'].lineData[488]++;
      return true;
  }
  _$jscoverage['/picker.js'].lineData[490]++;
  return undefined;
}}, {
  xclass: 'date-picker', 
  ATTRS: {
  contentTpl: {
  value: PickerTpl}, 
  focusable: {
  value: true}, 
  value: {
  render: 1, 
  sync: 0, 
  valueFn: function() {
  _$jscoverage['/picker.js'].functionData[34]++;
  _$jscoverage['/picker.js'].lineData[513]++;
  var date = new GregorianCalendar();
  _$jscoverage['/picker.js'].lineData[514]++;
  date.setTime(S.now());
  _$jscoverage['/picker.js'].lineData[515]++;
  return date;
}}, 
  previousYearBtn: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[35]++;
  _$jscoverage['/picker.js'].lineData[520]++;
  return '.' + this.getBaseCssClass('prev-year-btn');
}}, 
  nextYearBtn: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[36]++;
  _$jscoverage['/picker.js'].lineData[525]++;
  return '.' + this.getBaseCssClass('next-year-btn');
}}, 
  previousMonthBtn: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[37]++;
  _$jscoverage['/picker.js'].lineData[530]++;
  return '.' + this.getBaseCssClass('prev-month-btn');
}}, 
  monthSelectEl: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[38]++;
  _$jscoverage['/picker.js'].lineData[535]++;
  return '.' + this.getBaseCssClass('month-select');
}}, 
  monthSelectContentEl: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[39]++;
  _$jscoverage['/picker.js'].lineData[540]++;
  return '.' + this.getBaseCssClass('month-select-content');
}}, 
  monthPanel: {
  valueFn: setUpMonthPanel}, 
  nextMonthBtn: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[40]++;
  _$jscoverage['/picker.js'].lineData[548]++;
  return '.' + this.getBaseCssClass('next-month-btn');
}}, 
  clearBtnEl: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[41]++;
  _$jscoverage['/picker.js'].lineData[553]++;
  return '.' + this.getBaseCssClass('clear-btn');
}}, 
  tbodyEl: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[42]++;
  _$jscoverage['/picker.js'].lineData[558]++;
  return '.' + this.getBaseCssClass('tbody');
}}, 
  todayBtnEl: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[43]++;
  _$jscoverage['/picker.js'].lineData[563]++;
  return '.' + this.getBaseCssClass('today-btn');
}}, 
  dateRender: {}, 
  disabledDate: {}, 
  locale: {
  value: locale}, 
  showToday: {
  render: 1, 
  value: true}, 
  showClear: {
  render: 1, 
  value: true}, 
  clear: {
  render: 1, 
  value: false}, 
  showWeekNumber: {
  render: 1, 
  value: true}}});
});
