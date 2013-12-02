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
  _$jscoverage['/attribute.js'].lineData[9] = 0;
  _$jscoverage['/attribute.js'].lineData[11] = 0;
  _$jscoverage['/attribute.js'].lineData[13] = 0;
  _$jscoverage['/attribute.js'].lineData[14] = 0;
  _$jscoverage['/attribute.js'].lineData[17] = 0;
  _$jscoverage['/attribute.js'].lineData[18] = 0;
  _$jscoverage['/attribute.js'].lineData[22] = 0;
  _$jscoverage['/attribute.js'].lineData[24] = 0;
  _$jscoverage['/attribute.js'].lineData[26] = 0;
  _$jscoverage['/attribute.js'].lineData[27] = 0;
  _$jscoverage['/attribute.js'].lineData[28] = 0;
  _$jscoverage['/attribute.js'].lineData[30] = 0;
  _$jscoverage['/attribute.js'].lineData[33] = 0;
  _$jscoverage['/attribute.js'].lineData[34] = 0;
  _$jscoverage['/attribute.js'].lineData[37] = 0;
  _$jscoverage['/attribute.js'].lineData[38] = 0;
  _$jscoverage['/attribute.js'].lineData[42] = 0;
  _$jscoverage['/attribute.js'].lineData[43] = 0;
  _$jscoverage['/attribute.js'].lineData[44] = 0;
  _$jscoverage['/attribute.js'].lineData[52] = 0;
  _$jscoverage['/attribute.js'].lineData[53] = 0;
  _$jscoverage['/attribute.js'].lineData[54] = 0;
  _$jscoverage['/attribute.js'].lineData[55] = 0;
  _$jscoverage['/attribute.js'].lineData[57] = 0;
  _$jscoverage['/attribute.js'].lineData[63] = 0;
  _$jscoverage['/attribute.js'].lineData[64] = 0;
  _$jscoverage['/attribute.js'].lineData[67] = 0;
  _$jscoverage['/attribute.js'].lineData[69] = 0;
  _$jscoverage['/attribute.js'].lineData[75] = 0;
  _$jscoverage['/attribute.js'].lineData[76] = 0;
  _$jscoverage['/attribute.js'].lineData[78] = 0;
  _$jscoverage['/attribute.js'].lineData[79] = 0;
  _$jscoverage['/attribute.js'].lineData[80] = 0;
  _$jscoverage['/attribute.js'].lineData[82] = 0;
  _$jscoverage['/attribute.js'].lineData[83] = 0;
  _$jscoverage['/attribute.js'].lineData[85] = 0;
  _$jscoverage['/attribute.js'].lineData[88] = 0;
  _$jscoverage['/attribute.js'].lineData[91] = 0;
  _$jscoverage['/attribute.js'].lineData[92] = 0;
  _$jscoverage['/attribute.js'].lineData[94] = 0;
  _$jscoverage['/attribute.js'].lineData[95] = 0;
  _$jscoverage['/attribute.js'].lineData[96] = 0;
  _$jscoverage['/attribute.js'].lineData[99] = 0;
  _$jscoverage['/attribute.js'].lineData[105] = 0;
  _$jscoverage['/attribute.js'].lineData[106] = 0;
  _$jscoverage['/attribute.js'].lineData[107] = 0;
  _$jscoverage['/attribute.js'].lineData[108] = 0;
  _$jscoverage['/attribute.js'].lineData[109] = 0;
  _$jscoverage['/attribute.js'].lineData[111] = 0;
  _$jscoverage['/attribute.js'].lineData[113] = 0;
  _$jscoverage['/attribute.js'].lineData[115] = 0;
  _$jscoverage['/attribute.js'].lineData[118] = 0;
  _$jscoverage['/attribute.js'].lineData[119] = 0;
  _$jscoverage['/attribute.js'].lineData[120] = 0;
  _$jscoverage['/attribute.js'].lineData[121] = 0;
  _$jscoverage['/attribute.js'].lineData[123] = 0;
  _$jscoverage['/attribute.js'].lineData[124] = 0;
  _$jscoverage['/attribute.js'].lineData[125] = 0;
  _$jscoverage['/attribute.js'].lineData[130] = 0;
  _$jscoverage['/attribute.js'].lineData[131] = 0;
  _$jscoverage['/attribute.js'].lineData[137] = 0;
  _$jscoverage['/attribute.js'].lineData[138] = 0;
  _$jscoverage['/attribute.js'].lineData[139] = 0;
  _$jscoverage['/attribute.js'].lineData[141] = 0;
  _$jscoverage['/attribute.js'].lineData[143] = 0;
  _$jscoverage['/attribute.js'].lineData[144] = 0;
  _$jscoverage['/attribute.js'].lineData[149] = 0;
  _$jscoverage['/attribute.js'].lineData[150] = 0;
  _$jscoverage['/attribute.js'].lineData[151] = 0;
  _$jscoverage['/attribute.js'].lineData[152] = 0;
  _$jscoverage['/attribute.js'].lineData[153] = 0;
  _$jscoverage['/attribute.js'].lineData[157] = 0;
  _$jscoverage['/attribute.js'].lineData[159] = 0;
  _$jscoverage['/attribute.js'].lineData[170] = 0;
  _$jscoverage['/attribute.js'].lineData[171] = 0;
  _$jscoverage['/attribute.js'].lineData[172] = 0;
  _$jscoverage['/attribute.js'].lineData[175] = 0;
  _$jscoverage['/attribute.js'].lineData[176] = 0;
  _$jscoverage['/attribute.js'].lineData[180] = 0;
  _$jscoverage['/attribute.js'].lineData[183] = 0;
  _$jscoverage['/attribute.js'].lineData[185] = 0;
  _$jscoverage['/attribute.js'].lineData[186] = 0;
  _$jscoverage['/attribute.js'].lineData[188] = 0;
  _$jscoverage['/attribute.js'].lineData[197] = 0;
  _$jscoverage['/attribute.js'].lineData[199] = 0;
  _$jscoverage['/attribute.js'].lineData[200] = 0;
  _$jscoverage['/attribute.js'].lineData[204] = 0;
  _$jscoverage['/attribute.js'].lineData[205] = 0;
  _$jscoverage['/attribute.js'].lineData[206] = 0;
  _$jscoverage['/attribute.js'].lineData[207] = 0;
  _$jscoverage['/attribute.js'].lineData[208] = 0;
  _$jscoverage['/attribute.js'].lineData[215] = 0;
  _$jscoverage['/attribute.js'].lineData[223] = 0;
  _$jscoverage['/attribute.js'].lineData[230] = 0;
  _$jscoverage['/attribute.js'].lineData[231] = 0;
  _$jscoverage['/attribute.js'].lineData[234] = 0;
  _$jscoverage['/attribute.js'].lineData[236] = 0;
  _$jscoverage['/attribute.js'].lineData[237] = 0;
  _$jscoverage['/attribute.js'].lineData[238] = 0;
  _$jscoverage['/attribute.js'].lineData[241] = 0;
  _$jscoverage['/attribute.js'].lineData[244] = 0;
  _$jscoverage['/attribute.js'].lineData[245] = 0;
  _$jscoverage['/attribute.js'].lineData[247] = 0;
  _$jscoverage['/attribute.js'].lineData[248] = 0;
  _$jscoverage['/attribute.js'].lineData[249] = 0;
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
  _$jscoverage['/attribute.js'].lineData[263] = 0;
  _$jscoverage['/attribute.js'].lineData[264] = 0;
  _$jscoverage['/attribute.js'].lineData[265] = 0;
  _$jscoverage['/attribute.js'].lineData[267] = 0;
  _$jscoverage['/attribute.js'].lineData[268] = 0;
  _$jscoverage['/attribute.js'].lineData[270] = 0;
  _$jscoverage['/attribute.js'].lineData[271] = 0;
  _$jscoverage['/attribute.js'].lineData[276] = 0;
  _$jscoverage['/attribute.js'].lineData[277] = 0;
  _$jscoverage['/attribute.js'].lineData[278] = 0;
  _$jscoverage['/attribute.js'].lineData[279] = 0;
  _$jscoverage['/attribute.js'].lineData[282] = 0;
  _$jscoverage['/attribute.js'].lineData[283] = 0;
  _$jscoverage['/attribute.js'].lineData[285] = 0;
  _$jscoverage['/attribute.js'].lineData[286] = 0;
  _$jscoverage['/attribute.js'].lineData[287] = 0;
  _$jscoverage['/attribute.js'].lineData[289] = 0;
  _$jscoverage['/attribute.js'].lineData[290] = 0;
  _$jscoverage['/attribute.js'].lineData[291] = 0;
  _$jscoverage['/attribute.js'].lineData[293] = 0;
  _$jscoverage['/attribute.js'].lineData[294] = 0;
  _$jscoverage['/attribute.js'].lineData[295] = 0;
  _$jscoverage['/attribute.js'].lineData[299] = 0;
  _$jscoverage['/attribute.js'].lineData[301] = 0;
  _$jscoverage['/attribute.js'].lineData[305] = 0;
  _$jscoverage['/attribute.js'].lineData[306] = 0;
  _$jscoverage['/attribute.js'].lineData[310] = 0;
  _$jscoverage['/attribute.js'].lineData[311] = 0;
  _$jscoverage['/attribute.js'].lineData[312] = 0;
  _$jscoverage['/attribute.js'].lineData[313] = 0;
  _$jscoverage['/attribute.js'].lineData[315] = 0;
  _$jscoverage['/attribute.js'].lineData[316] = 0;
  _$jscoverage['/attribute.js'].lineData[317] = 0;
  _$jscoverage['/attribute.js'].lineData[319] = 0;
  _$jscoverage['/attribute.js'].lineData[320] = 0;
  _$jscoverage['/attribute.js'].lineData[321] = 0;
  _$jscoverage['/attribute.js'].lineData[323] = 0;
  _$jscoverage['/attribute.js'].lineData[324] = 0;
  _$jscoverage['/attribute.js'].lineData[325] = 0;
  _$jscoverage['/attribute.js'].lineData[328] = 0;
  _$jscoverage['/attribute.js'].lineData[329] = 0;
  _$jscoverage['/attribute.js'].lineData[330] = 0;
  _$jscoverage['/attribute.js'].lineData[338] = 0;
  _$jscoverage['/attribute.js'].lineData[343] = 0;
  _$jscoverage['/attribute.js'].lineData[344] = 0;
  _$jscoverage['/attribute.js'].lineData[345] = 0;
  _$jscoverage['/attribute.js'].lineData[347] = 0;
  _$jscoverage['/attribute.js'].lineData[352] = 0;
  _$jscoverage['/attribute.js'].lineData[356] = 0;
  _$jscoverage['/attribute.js'].lineData[360] = 0;
  _$jscoverage['/attribute.js'].lineData[361] = 0;
  _$jscoverage['/attribute.js'].lineData[362] = 0;
  _$jscoverage['/attribute.js'].lineData[363] = 0;
  _$jscoverage['/attribute.js'].lineData[366] = 0;
  _$jscoverage['/attribute.js'].lineData[367] = 0;
  _$jscoverage['/attribute.js'].lineData[368] = 0;
  _$jscoverage['/attribute.js'].lineData[370] = 0;
  _$jscoverage['/attribute.js'].lineData[373] = 0;
  _$jscoverage['/attribute.js'].lineData[374] = 0;
  _$jscoverage['/attribute.js'].lineData[376] = 0;
  _$jscoverage['/attribute.js'].lineData[378] = 0;
  _$jscoverage['/attribute.js'].lineData[379] = 0;
  _$jscoverage['/attribute.js'].lineData[381] = 0;
  _$jscoverage['/attribute.js'].lineData[384] = 0;
  _$jscoverage['/attribute.js'].lineData[393] = 0;
  _$jscoverage['/attribute.js'].lineData[401] = 0;
  _$jscoverage['/attribute.js'].lineData[405] = 0;
  _$jscoverage['/attribute.js'].lineData[406] = 0;
  _$jscoverage['/attribute.js'].lineData[408] = 0;
  _$jscoverage['/attribute.js'].lineData[429] = 0;
  _$jscoverage['/attribute.js'].lineData[433] = 0;
  _$jscoverage['/attribute.js'].lineData[434] = 0;
  _$jscoverage['/attribute.js'].lineData[436] = 0;
  _$jscoverage['/attribute.js'].lineData[438] = 0;
  _$jscoverage['/attribute.js'].lineData[448] = 0;
  _$jscoverage['/attribute.js'].lineData[449] = 0;
  _$jscoverage['/attribute.js'].lineData[450] = 0;
  _$jscoverage['/attribute.js'].lineData[452] = 0;
  _$jscoverage['/attribute.js'].lineData[453] = 0;
  _$jscoverage['/attribute.js'].lineData[455] = 0;
  _$jscoverage['/attribute.js'].lineData[464] = 0;
  _$jscoverage['/attribute.js'].lineData[472] = 0;
  _$jscoverage['/attribute.js'].lineData[473] = 0;
  _$jscoverage['/attribute.js'].lineData[474] = 0;
  _$jscoverage['/attribute.js'].lineData[476] = 0;
  _$jscoverage['/attribute.js'].lineData[477] = 0;
  _$jscoverage['/attribute.js'].lineData[478] = 0;
  _$jscoverage['/attribute.js'].lineData[481] = 0;
  _$jscoverage['/attribute.js'].lineData[495] = 0;
  _$jscoverage['/attribute.js'].lineData[496] = 0;
  _$jscoverage['/attribute.js'].lineData[497] = 0;
  _$jscoverage['/attribute.js'].lineData[498] = 0;
  _$jscoverage['/attribute.js'].lineData[499] = 0;
  _$jscoverage['/attribute.js'].lineData[502] = 0;
  _$jscoverage['/attribute.js'].lineData[505] = 0;
  _$jscoverage['/attribute.js'].lineData[506] = 0;
  _$jscoverage['/attribute.js'].lineData[509] = 0;
  _$jscoverage['/attribute.js'].lineData[510] = 0;
  _$jscoverage['/attribute.js'].lineData[511] = 0;
  _$jscoverage['/attribute.js'].lineData[513] = 0;
  _$jscoverage['/attribute.js'].lineData[515] = 0;
  _$jscoverage['/attribute.js'].lineData[516] = 0;
  _$jscoverage['/attribute.js'].lineData[518] = 0;
  _$jscoverage['/attribute.js'].lineData[522] = 0;
  _$jscoverage['/attribute.js'].lineData[523] = 0;
  _$jscoverage['/attribute.js'].lineData[524] = 0;
  _$jscoverage['/attribute.js'].lineData[525] = 0;
  _$jscoverage['/attribute.js'].lineData[526] = 0;
  _$jscoverage['/attribute.js'].lineData[528] = 0;
  _$jscoverage['/attribute.js'].lineData[529] = 0;
  _$jscoverage['/attribute.js'].lineData[538] = 0;
  _$jscoverage['/attribute.js'].lineData[540] = 0;
  _$jscoverage['/attribute.js'].lineData[542] = 0;
  _$jscoverage['/attribute.js'].lineData[544] = 0;
  _$jscoverage['/attribute.js'].lineData[545] = 0;
  _$jscoverage['/attribute.js'].lineData[546] = 0;
  _$jscoverage['/attribute.js'].lineData[548] = 0;
  _$jscoverage['/attribute.js'].lineData[550] = 0;
  _$jscoverage['/attribute.js'].lineData[559] = 0;
  _$jscoverage['/attribute.js'].lineData[568] = 0;
  _$jscoverage['/attribute.js'].lineData[569] = 0;
  _$jscoverage['/attribute.js'].lineData[572] = 0;
  _$jscoverage['/attribute.js'].lineData[573] = 0;
  _$jscoverage['/attribute.js'].lineData[576] = 0;
  _$jscoverage['/attribute.js'].lineData[577] = 0;
  _$jscoverage['/attribute.js'].lineData[581] = 0;
  _$jscoverage['/attribute.js'].lineData[583] = 0;
  _$jscoverage['/attribute.js'].lineData[592] = 0;
  _$jscoverage['/attribute.js'].lineData[599] = 0;
  _$jscoverage['/attribute.js'].lineData[600] = 0;
  _$jscoverage['/attribute.js'].lineData[601] = 0;
  _$jscoverage['/attribute.js'].lineData[604] = 0;
  _$jscoverage['/attribute.js'].lineData[605] = 0;
  _$jscoverage['/attribute.js'].lineData[609] = 0;
  _$jscoverage['/attribute.js'].lineData[614] = 0;
  _$jscoverage['/attribute.js'].lineData[615] = 0;
  _$jscoverage['/attribute.js'].lineData[618] = 0;
  _$jscoverage['/attribute.js'].lineData[619] = 0;
  _$jscoverage['/attribute.js'].lineData[622] = 0;
  _$jscoverage['/attribute.js'].lineData[623] = 0;
  _$jscoverage['/attribute.js'].lineData[626] = 0;
  _$jscoverage['/attribute.js'].lineData[638] = 0;
  _$jscoverage['/attribute.js'].lineData[640] = 0;
  _$jscoverage['/attribute.js'].lineData[641] = 0;
  _$jscoverage['/attribute.js'].lineData[643] = 0;
  _$jscoverage['/attribute.js'].lineData[646] = 0;
  _$jscoverage['/attribute.js'].lineData[650] = 0;
  _$jscoverage['/attribute.js'].lineData[653] = 0;
  _$jscoverage['/attribute.js'].lineData[657] = 0;
  _$jscoverage['/attribute.js'].lineData[658] = 0;
  _$jscoverage['/attribute.js'].lineData[661] = 0;
  _$jscoverage['/attribute.js'].lineData[662] = 0;
  _$jscoverage['/attribute.js'].lineData[667] = 0;
  _$jscoverage['/attribute.js'].lineData[668] = 0;
  _$jscoverage['/attribute.js'].lineData[673] = 0;
  _$jscoverage['/attribute.js'].lineData[674] = 0;
  _$jscoverage['/attribute.js'].lineData[675] = 0;
  _$jscoverage['/attribute.js'].lineData[679] = 0;
  _$jscoverage['/attribute.js'].lineData[681] = 0;
  _$jscoverage['/attribute.js'].lineData[682] = 0;
  _$jscoverage['/attribute.js'].lineData[685] = 0;
  _$jscoverage['/attribute.js'].lineData[688] = 0;
  _$jscoverage['/attribute.js'].lineData[689] = 0;
  _$jscoverage['/attribute.js'].lineData[691] = 0;
  _$jscoverage['/attribute.js'].lineData[693] = 0;
  _$jscoverage['/attribute.js'].lineData[694] = 0;
  _$jscoverage['/attribute.js'].lineData[696] = 0;
  _$jscoverage['/attribute.js'].lineData[697] = 0;
  _$jscoverage['/attribute.js'].lineData[698] = 0;
  _$jscoverage['/attribute.js'].lineData[700] = 0;
  _$jscoverage['/attribute.js'].lineData[703] = 0;
  _$jscoverage['/attribute.js'].lineData[704] = 0;
  _$jscoverage['/attribute.js'].lineData[706] = 0;
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
  _$jscoverage['/attribute.js'].branchData['27'] = [];
  _$jscoverage['/attribute.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['34'] = [];
  _$jscoverage['/attribute.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['43'] = [];
  _$jscoverage['/attribute.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['54'] = [];
  _$jscoverage['/attribute.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['57'] = [];
  _$jscoverage['/attribute.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['65'] = [];
  _$jscoverage['/attribute.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['65'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['65'][3] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['78'] = [];
  _$jscoverage['/attribute.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['79'] = [];
  _$jscoverage['/attribute.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['82'] = [];
  _$jscoverage['/attribute.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['94'] = [];
  _$jscoverage['/attribute.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['107'] = [];
  _$jscoverage['/attribute.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['108'] = [];
  _$jscoverage['/attribute.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['120'] = [];
  _$jscoverage['/attribute.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['143'] = [];
  _$jscoverage['/attribute.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['149'] = [];
  _$jscoverage['/attribute.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['150'] = [];
  _$jscoverage['/attribute.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['150'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['152'] = [];
  _$jscoverage['/attribute.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['152'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['170'] = [];
  _$jscoverage['/attribute.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['171'] = [];
  _$jscoverage['/attribute.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['175'] = [];
  _$jscoverage['/attribute.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['185'] = [];
  _$jscoverage['/attribute.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['199'] = [];
  _$jscoverage['/attribute.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['204'] = [];
  _$jscoverage['/attribute.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['207'] = [];
  _$jscoverage['/attribute.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['245'] = [];
  _$jscoverage['/attribute.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['248'] = [];
  _$jscoverage['/attribute.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['253'] = [];
  _$jscoverage['/attribute.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['255'] = [];
  _$jscoverage['/attribute.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['264'] = [];
  _$jscoverage['/attribute.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['267'] = [];
  _$jscoverage['/attribute.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['285'] = [];
  _$jscoverage['/attribute.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['286'] = [];
  _$jscoverage['/attribute.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['290'] = [];
  _$jscoverage['/attribute.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['293'] = [];
  _$jscoverage['/attribute.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['294'] = [];
  _$jscoverage['/attribute.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['299'] = [];
  _$jscoverage['/attribute.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['316'] = [];
  _$jscoverage['/attribute.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['320'] = [];
  _$jscoverage['/attribute.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['323'] = [];
  _$jscoverage['/attribute.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['329'] = [];
  _$jscoverage['/attribute.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['344'] = [];
  _$jscoverage['/attribute.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['360'] = [];
  _$jscoverage['/attribute.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['360'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['367'] = [];
  _$jscoverage['/attribute.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['374'] = [];
  _$jscoverage['/attribute.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['379'] = [];
  _$jscoverage['/attribute.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['384'] = [];
  _$jscoverage['/attribute.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['393'] = [];
  _$jscoverage['/attribute.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['452'] = [];
  _$jscoverage['/attribute.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['476'] = [];
  _$jscoverage['/attribute.js'].branchData['476'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['496'] = [];
  _$jscoverage['/attribute.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['498'] = [];
  _$jscoverage['/attribute.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['505'] = [];
  _$jscoverage['/attribute.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['509'] = [];
  _$jscoverage['/attribute.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['510'] = [];
  _$jscoverage['/attribute.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['528'] = [];
  _$jscoverage['/attribute.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['540'] = [];
  _$jscoverage['/attribute.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['544'] = [];
  _$jscoverage['/attribute.js'].branchData['544'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['545'] = [];
  _$jscoverage['/attribute.js'].branchData['545'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['568'] = [];
  _$jscoverage['/attribute.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['572'] = [];
  _$jscoverage['/attribute.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['576'] = [];
  _$jscoverage['/attribute.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['599'] = [];
  _$jscoverage['/attribute.js'].branchData['599'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['614'] = [];
  _$jscoverage['/attribute.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['618'] = [];
  _$jscoverage['/attribute.js'].branchData['618'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['618'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['622'] = [];
  _$jscoverage['/attribute.js'].branchData['622'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['640'] = [];
  _$jscoverage['/attribute.js'].branchData['640'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['641'] = [];
  _$jscoverage['/attribute.js'].branchData['641'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['673'] = [];
  _$jscoverage['/attribute.js'].branchData['673'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['675'] = [];
  _$jscoverage['/attribute.js'].branchData['675'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['696'] = [];
  _$jscoverage['/attribute.js'].branchData['696'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['703'] = [];
  _$jscoverage['/attribute.js'].branchData['703'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['706'] = [];
  _$jscoverage['/attribute.js'].branchData['706'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['706'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['706'][3] = new BranchData();
}
_$jscoverage['/attribute.js'].branchData['706'][3].init(148, 10, 'e !== true');
function visit80_706_3(result) {
  _$jscoverage['/attribute.js'].branchData['706'][3].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['706'][2].init(129, 15, 'e !== undefined');
function visit79_706_2(result) {
  _$jscoverage['/attribute.js'].branchData['706'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['706'][1].init(129, 29, 'e !== undefined && e !== true');
function visit78_706_1(result) {
  _$jscoverage['/attribute.js'].branchData['706'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['703'][1].init(426, 52, 'validator && (validator = normalFn(self, validator))');
function visit77_703_1(result) {
  _$jscoverage['/attribute.js'].branchData['703'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['696'][1].init(171, 4, 'path');
function visit76_696_1(result) {
  _$jscoverage['/attribute.js'].branchData['696'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['675'][1].init(53, 85, 'val !== undefined');
function visit75_675_1(result) {
  _$jscoverage['/attribute.js'].branchData['675'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['673'][1].init(165, 40, 'valFn && (valFn = normalFn(self, valFn))');
function visit74_673_1(result) {
  _$jscoverage['/attribute.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['641'][1].init(21, 18, 'self.hasAttr(name)');
function visit73_641_1(result) {
  _$jscoverage['/attribute.js'].branchData['641'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['640'][1].init(47, 24, 'typeof name === \'string\'');
function visit72_640_1(result) {
  _$jscoverage['/attribute.js'].branchData['640'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['622'][1].init(944, 4, 'path');
function visit71_622_1(result) {
  _$jscoverage['/attribute.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['618'][2].init(854, 17, 'ret !== undefined');
function visit70_618_2(result) {
  _$jscoverage['/attribute.js'].branchData['618'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['618'][1].init(831, 40, '!(name in attrVals) && ret !== undefined');
function visit69_618_1(result) {
  _$jscoverage['/attribute.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['614'][1].init(701, 43, 'getter && (getter = normalFn(self, getter))');
function visit68_614_1(result) {
  _$jscoverage['/attribute.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['599'][1].init(199, 24, 'name.indexOf(dot) !== -1');
function visit67_599_1(result) {
  _$jscoverage['/attribute.js'].branchData['599'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['576'][1].init(669, 22, 'setValue !== undefined');
function visit66_576_1(result) {
  _$jscoverage['/attribute.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['572'][1].init(584, 20, 'setValue === INVALID');
function visit65_572_1(result) {
  _$jscoverage['/attribute.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['568'][1].init(447, 43, 'setter && (setter = normalFn(self, setter))');
function visit64_568_1(result) {
  _$jscoverage['/attribute.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['545'][1].init(21, 10, 'opts.error');
function visit63_545_1(result) {
  _$jscoverage['/attribute.js'].branchData['545'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['544'][1].init(1780, 15, 'e !== undefined');
function visit62_544_1(result) {
  _$jscoverage['/attribute.js'].branchData['544'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['540'][1].init(1675, 10, 'opts || {}');
function visit61_540_1(result) {
  _$jscoverage['/attribute.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['528'][1].init(1226, 16, 'attrNames.length');
function visit60_528_1(result) {
  _$jscoverage['/attribute.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['510'][1].init(25, 10, 'opts.error');
function visit59_510_1(result) {
  _$jscoverage['/attribute.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['509'][1].init(494, 13, 'errors.length');
function visit58_509_1(result) {
  _$jscoverage['/attribute.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['505'][1].init(129, 55, '(e = validate(self, name, all[name], all)) !== undefined');
function visit57_505_1(result) {
  _$jscoverage['/attribute.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['498'][1].init(54, 10, 'opts || {}');
function visit56_498_1(result) {
  _$jscoverage['/attribute.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['496'][1].init(49, 21, 'S.isPlainObject(name)');
function visit55_496_1(result) {
  _$jscoverage['/attribute.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['476'][1].init(138, 18, 'self.hasAttr(name)');
function visit54_476_1(result) {
  _$jscoverage['/attribute.js'].branchData['476'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['452'][1].init(172, 13, 'initialValues');
function visit53_452_1(result) {
  _$jscoverage['/attribute.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['393'][1].init(20, 35, 'this.__attrs || (this.__attrs = {})');
function visit52_393_1(result) {
  _$jscoverage['/attribute.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['384'][1].init(1047, 10, 'args || []');
function visit51_384_1(result) {
  _$jscoverage['/attribute.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['379'][1].init(847, 7, '!member');
function visit50_379_1(result) {
  _$jscoverage['/attribute.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['374'][1].init(593, 5, '!name');
function visit49_374_1(result) {
  _$jscoverage['/attribute.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['367'][1].init(111, 18, 'method.__wrapped__');
function visit48_367_1(result) {
  _$jscoverage['/attribute.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['360'][2].init(110, 26, 'typeof self === \'function\'');
function visit47_360_2(result) {
  _$jscoverage['/attribute.js'].branchData['360'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['360'][1].init(110, 43, 'typeof self === \'function\' && self.__name__');
function visit46_360_1(result) {
  _$jscoverage['/attribute.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['344'][1].init(13, 6, 'config');
function visit45_344_1(result) {
  _$jscoverage['/attribute.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['329'][1].init(13, 5, 'attrs');
function visit44_329_1(result) {
  _$jscoverage['/attribute.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['323'][1].init(1581, 19, 'sx.extend || extend');
function visit43_323_1(result) {
  _$jscoverage['/attribute.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['320'][1].init(1474, 18, 'sxInheritedStatics');
function visit42_320_1(result) {
  _$jscoverage['/attribute.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['316'][1].init(56, 25, 'sx.inheritedStatics || {}');
function visit41_316_1(result) {
  _$jscoverage['/attribute.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['299'][1].init(138, 9, '\'@DEBUG@\'');
function visit40_299_1(result) {
  _$jscoverage['/attribute.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['294'][1].init(373, 32, 'px.hasOwnProperty(\'constructor\')');
function visit39_294_1(result) {
  _$jscoverage['/attribute.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['293'][1].init(330, 29, 'sx.name || \'AttributeDerived\'');
function visit38_293_1(result) {
  _$jscoverage['/attribute.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['290'][1].init(38, 18, 'sx.__hooks__ || {}');
function visit37_290_1(result) {
  _$jscoverage['/attribute.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['286'][1].init(90, 8, 'px || {}');
function visit36_286_1(result) {
  _$jscoverage['/attribute.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['285'][1].init(67, 8, 'sx || {}');
function visit35_285_1(result) {
  _$jscoverage['/attribute.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['267'][1].init(551, 7, 'wrapped');
function visit34_267_1(result) {
  _$jscoverage['/attribute.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['264'][1].init(464, 13, 'v.__wrapped__');
function visit33_264_1(result) {
  _$jscoverage['/attribute.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['255'][1].init(54, 11, 'v.__owner__');
function visit32_255_1(result) {
  _$jscoverage['/attribute.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['253'][1].init(17, 23, 'typeof v === \'function\'');
function visit31_253_1(result) {
  _$jscoverage['/attribute.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['248'][1].init(17, 7, 'p in px');
function visit30_248_1(result) {
  _$jscoverage['/attribute.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['245'][1].init(21, 24, 'SubClass.__hooks__ || {}');
function visit29_245_1(result) {
  _$jscoverage['/attribute.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['207'][1].init(156, 5, 'attrs');
function visit28_207_1(result) {
  _$jscoverage['/attribute.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['204'][1].init(509, 12, '!opts.silent');
function visit27_204_1(result) {
  _$jscoverage['/attribute.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['199'][1].init(417, 13, 'ret === FALSE');
function visit26_199_1(result) {
  _$jscoverage['/attribute.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['185'][1].init(60, 17, 'e.target !== this');
function visit25_185_1(result) {
  _$jscoverage['/attribute.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['175'][1].init(17, 79, 'FALSE === self.fire(whenAttrChangeEventName(\'before\', name), beforeEventObject)');
function visit24_175_1(result) {
  _$jscoverage['/attribute.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['171'][1].init(17, 52, 'FALSE === defaultSetFn.call(self, beforeEventObject)');
function visit23_171_1(result) {
  _$jscoverage['/attribute.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['170'][1].init(1033, 11, 'opts.silent');
function visit22_170_1(result) {
  _$jscoverage['/attribute.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['152'][2].init(113, 16, 'subVal === value');
function visit21_152_2(result) {
  _$jscoverage['/attribute.js'].branchData['152'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['152'][1].init(105, 24, 'path && subVal === value');
function visit20_152_1(result) {
  _$jscoverage['/attribute.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['150'][2].init(26, 17, 'prevVal === value');
function visit19_150_2(result) {
  _$jscoverage['/attribute.js'].branchData['150'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['150'][1].init(17, 26, '!path && prevVal === value');
function visit18_150_1(result) {
  _$jscoverage['/attribute.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['149'][1].init(466, 11, '!opts.force');
function visit17_149_1(result) {
  _$jscoverage['/attribute.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['143'][1].init(297, 4, 'path');
function visit16_143_1(result) {
  _$jscoverage['/attribute.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['120'][1].init(88, 22, 'defaultBeforeFns[name]');
function visit15_120_1(result) {
  _$jscoverage['/attribute.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['108'][1].init(17, 21, 'prevVal === undefined');
function visit14_108_1(result) {
  _$jscoverage['/attribute.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['107'][1].init(38, 4, 'path');
function visit13_107_1(result) {
  _$jscoverage['/attribute.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['94'][1].init(32, 24, 'name.indexOf(\'.\') !== -1');
function visit12_94_1(result) {
  _$jscoverage['/attribute.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['82'][1].init(107, 15, 'o !== undefined');
function visit11_82_1(result) {
  _$jscoverage['/attribute.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['79'][1].init(29, 7, 'i < len');
function visit10_79_1(result) {
  _$jscoverage['/attribute.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['78'][1].init(67, 8, 'len >= 0');
function visit9_78_1(result) {
  _$jscoverage['/attribute.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['65'][3].init(18, 7, 'i < len');
function visit8_65_3(result) {
  _$jscoverage['/attribute.js'].branchData['65'][3].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['65'][2].init(58, 15, 'o !== undefined');
function visit7_65_2(result) {
  _$jscoverage['/attribute.js'].branchData['65'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['65'][1].init(47, 26, 'o !== undefined && i < len');
function visit6_65_1(result) {
  _$jscoverage['/attribute.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['57'][1].init(125, 9, 'ret || {}');
function visit5_57_1(result) {
  _$jscoverage['/attribute.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['54'][1].init(42, 20, '!doNotCreate && !ret');
function visit4_54_1(result) {
  _$jscoverage['/attribute.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['43'][1].init(20, 16, 'attrName || name');
function visit3_43_1(result) {
  _$jscoverage['/attribute.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['34'][1].init(16, 41, 'self.__attrVals || (self.__attrVals = {})');
function visit2_34_1(result) {
  _$jscoverage['/attribute.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['27'][1].init(13, 26, 'typeof method === \'string\'');
function visit1_27_1(result) {
  _$jscoverage['/attribute.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].lineData[6]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/attribute.js'].functionData[0]++;
  _$jscoverage['/attribute.js'].lineData[7]++;
  var RE_DASH = /(?:^|-)([a-z])/ig;
  _$jscoverage['/attribute.js'].lineData[8]++;
  var CustomEvent = require('event/custom');
  _$jscoverage['/attribute.js'].lineData[9]++;
  module.exports = Attribute;
  _$jscoverage['/attribute.js'].lineData[11]++;
  var bind = S.bind;
  _$jscoverage['/attribute.js'].lineData[13]++;
  function replaceToUpper() {
    _$jscoverage['/attribute.js'].functionData[1]++;
    _$jscoverage['/attribute.js'].lineData[14]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/attribute.js'].lineData[17]++;
  function camelCase(name) {
    _$jscoverage['/attribute.js'].functionData[2]++;
    _$jscoverage['/attribute.js'].lineData[18]++;
    return name.replace(RE_DASH, replaceToUpper);
  }
  _$jscoverage['/attribute.js'].lineData[22]++;
  var INVALID = {};
  _$jscoverage['/attribute.js'].lineData[24]++;
  var FALSE = false;
  _$jscoverage['/attribute.js'].lineData[26]++;
  function normalFn(host, method) {
    _$jscoverage['/attribute.js'].functionData[3]++;
    _$jscoverage['/attribute.js'].lineData[27]++;
    if (visit1_27_1(typeof method === 'string')) {
      _$jscoverage['/attribute.js'].lineData[28]++;
      return host[method];
    }
    _$jscoverage['/attribute.js'].lineData[30]++;
    return method;
  }
  _$jscoverage['/attribute.js'].lineData[33]++;
  function getAttrVals(self) {
    _$jscoverage['/attribute.js'].functionData[4]++;
    _$jscoverage['/attribute.js'].lineData[34]++;
    return visit2_34_1(self.__attrVals || (self.__attrVals = {}));
  }
  _$jscoverage['/attribute.js'].lineData[37]++;
  function whenAttrChangeEventName(when, name) {
    _$jscoverage['/attribute.js'].functionData[5]++;
    _$jscoverage['/attribute.js'].lineData[38]++;
    return when + S.ucfirst(name) + 'Change';
  }
  _$jscoverage['/attribute.js'].lineData[42]++;
  function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName, data) {
    _$jscoverage['/attribute.js'].functionData[6]++;
    _$jscoverage['/attribute.js'].lineData[43]++;
    attrName = visit3_43_1(attrName || name);
    _$jscoverage['/attribute.js'].lineData[44]++;
    return self.fire(whenAttrChangeEventName(when, name), S.mix({
  attrName: attrName, 
  subAttrName: subAttrName, 
  prevVal: prevVal, 
  newVal: newVal}, data));
  }
  _$jscoverage['/attribute.js'].lineData[52]++;
  function ensureNonEmpty(obj, name, doNotCreate) {
    _$jscoverage['/attribute.js'].functionData[7]++;
    _$jscoverage['/attribute.js'].lineData[53]++;
    var ret = obj[name];
    _$jscoverage['/attribute.js'].lineData[54]++;
    if (visit4_54_1(!doNotCreate && !ret)) {
      _$jscoverage['/attribute.js'].lineData[55]++;
      obj[name] = ret = {};
    }
    _$jscoverage['/attribute.js'].lineData[57]++;
    return visit5_57_1(ret || {});
  }
  _$jscoverage['/attribute.js'].lineData[63]++;
  function getValueByPath(o, path) {
    _$jscoverage['/attribute.js'].functionData[8]++;
    _$jscoverage['/attribute.js'].lineData[64]++;
    for (var i = 0, len = path.length; visit6_65_1(visit7_65_2(o !== undefined) && visit8_65_3(i < len)); i++) {
      _$jscoverage['/attribute.js'].lineData[67]++;
      o = o[path[i]];
    }
    _$jscoverage['/attribute.js'].lineData[69]++;
    return o;
  }
  _$jscoverage['/attribute.js'].lineData[75]++;
  function setValueByPath(o, path, val) {
    _$jscoverage['/attribute.js'].functionData[9]++;
    _$jscoverage['/attribute.js'].lineData[76]++;
    var len = path.length - 1, s = o;
    _$jscoverage['/attribute.js'].lineData[78]++;
    if (visit9_78_1(len >= 0)) {
      _$jscoverage['/attribute.js'].lineData[79]++;
      for (var i = 0; visit10_79_1(i < len); i++) {
        _$jscoverage['/attribute.js'].lineData[80]++;
        o = o[path[i]];
      }
      _$jscoverage['/attribute.js'].lineData[82]++;
      if (visit11_82_1(o !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[83]++;
        o[path[i]] = val;
      } else {
        _$jscoverage['/attribute.js'].lineData[85]++;
        s = undefined;
      }
    }
    _$jscoverage['/attribute.js'].lineData[88]++;
    return s;
  }
  _$jscoverage['/attribute.js'].lineData[91]++;
  function getPathNamePair(name) {
    _$jscoverage['/attribute.js'].functionData[10]++;
    _$jscoverage['/attribute.js'].lineData[92]++;
    var path;
    _$jscoverage['/attribute.js'].lineData[94]++;
    if (visit12_94_1(name.indexOf('.') !== -1)) {
      _$jscoverage['/attribute.js'].lineData[95]++;
      path = name.split('.');
      _$jscoverage['/attribute.js'].lineData[96]++;
      name = path.shift();
    }
    _$jscoverage['/attribute.js'].lineData[99]++;
    return {
  path: path, 
  name: name};
  }
  _$jscoverage['/attribute.js'].lineData[105]++;
  function getValueBySubValue(prevVal, path, value) {
    _$jscoverage['/attribute.js'].functionData[11]++;
    _$jscoverage['/attribute.js'].lineData[106]++;
    var tmp = value;
    _$jscoverage['/attribute.js'].lineData[107]++;
    if (visit13_107_1(path)) {
      _$jscoverage['/attribute.js'].lineData[108]++;
      if (visit14_108_1(prevVal === undefined)) {
        _$jscoverage['/attribute.js'].lineData[109]++;
        tmp = {};
      } else {
        _$jscoverage['/attribute.js'].lineData[111]++;
        tmp = S.clone(prevVal);
      }
      _$jscoverage['/attribute.js'].lineData[113]++;
      setValueByPath(tmp, path, value);
    }
    _$jscoverage['/attribute.js'].lineData[115]++;
    return tmp;
  }
  _$jscoverage['/attribute.js'].lineData[118]++;
  function prepareDefaultSetFn(self, name) {
    _$jscoverage['/attribute.js'].functionData[12]++;
    _$jscoverage['/attribute.js'].lineData[119]++;
    var defaultBeforeFns = ensureNonEmpty(self, '__defaultBeforeFns');
    _$jscoverage['/attribute.js'].lineData[120]++;
    if (visit15_120_1(defaultBeforeFns[name])) {
      _$jscoverage['/attribute.js'].lineData[121]++;
      return;
    }
    _$jscoverage['/attribute.js'].lineData[123]++;
    defaultBeforeFns[name] = 1;
    _$jscoverage['/attribute.js'].lineData[124]++;
    var beforeChangeEventName = whenAttrChangeEventName('before', name);
    _$jscoverage['/attribute.js'].lineData[125]++;
    self.publish(beforeChangeEventName, {
  defaultFn: defaultSetFn});
  }
  _$jscoverage['/attribute.js'].lineData[130]++;
  function setInternal(self, name, value, opts, attrs) {
    _$jscoverage['/attribute.js'].functionData[13]++;
    _$jscoverage['/attribute.js'].lineData[131]++;
    var path, subVal, prevVal, pathNamePair = getPathNamePair(name), fullName = name;
    _$jscoverage['/attribute.js'].lineData[137]++;
    name = pathNamePair.name;
    _$jscoverage['/attribute.js'].lineData[138]++;
    path = pathNamePair.path;
    _$jscoverage['/attribute.js'].lineData[139]++;
    prevVal = self.get(name);
    _$jscoverage['/attribute.js'].lineData[141]++;
    prepareDefaultSetFn(self, name);
    _$jscoverage['/attribute.js'].lineData[143]++;
    if (visit16_143_1(path)) {
      _$jscoverage['/attribute.js'].lineData[144]++;
      subVal = getValueByPath(prevVal, path);
    }
    _$jscoverage['/attribute.js'].lineData[149]++;
    if (visit17_149_1(!opts.force)) {
      _$jscoverage['/attribute.js'].lineData[150]++;
      if (visit18_150_1(!path && visit19_150_2(prevVal === value))) {
        _$jscoverage['/attribute.js'].lineData[151]++;
        return undefined;
      } else {
        _$jscoverage['/attribute.js'].lineData[152]++;
        if (visit20_152_1(path && visit21_152_2(subVal === value))) {
          _$jscoverage['/attribute.js'].lineData[153]++;
          return undefined;
        }
      }
    }
    _$jscoverage['/attribute.js'].lineData[157]++;
    value = getValueBySubValue(prevVal, path, value);
    _$jscoverage['/attribute.js'].lineData[159]++;
    var beforeEventObject = S.mix({
  attrName: name, 
  subAttrName: fullName, 
  prevVal: prevVal, 
  newVal: value, 
  _opts: opts, 
  _attrs: attrs, 
  target: self}, opts.data);
    _$jscoverage['/attribute.js'].lineData[170]++;
    if (visit22_170_1(opts.silent)) {
      _$jscoverage['/attribute.js'].lineData[171]++;
      if (visit23_171_1(FALSE === defaultSetFn.call(self, beforeEventObject))) {
        _$jscoverage['/attribute.js'].lineData[172]++;
        return FALSE;
      }
    } else {
      _$jscoverage['/attribute.js'].lineData[175]++;
      if (visit24_175_1(FALSE === self.fire(whenAttrChangeEventName('before', name), beforeEventObject))) {
        _$jscoverage['/attribute.js'].lineData[176]++;
        return FALSE;
      }
    }
    _$jscoverage['/attribute.js'].lineData[180]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[183]++;
  function defaultSetFn(e) {
    _$jscoverage['/attribute.js'].functionData[14]++;
    _$jscoverage['/attribute.js'].lineData[185]++;
    if (visit25_185_1(e.target !== this)) {
      _$jscoverage['/attribute.js'].lineData[186]++;
      return undefined;
    }
    _$jscoverage['/attribute.js'].lineData[188]++;
    var self = this, value = e.newVal, prevVal = e.prevVal, name = e.attrName, fullName = e.subAttrName, attrs = e._attrs, opts = e._opts;
    _$jscoverage['/attribute.js'].lineData[197]++;
    var ret = self.setInternal(name, value);
    _$jscoverage['/attribute.js'].lineData[199]++;
    if (visit26_199_1(ret === FALSE)) {
      _$jscoverage['/attribute.js'].lineData[200]++;
      return ret;
    }
    _$jscoverage['/attribute.js'].lineData[204]++;
    if (visit27_204_1(!opts.silent)) {
      _$jscoverage['/attribute.js'].lineData[205]++;
      value = getAttrVals(self)[name];
      _$jscoverage['/attribute.js'].lineData[206]++;
      __fireAttrChange(self, 'after', name, prevVal, value, fullName, null, opts.data);
      _$jscoverage['/attribute.js'].lineData[207]++;
      if (visit28_207_1(attrs)) {
        _$jscoverage['/attribute.js'].lineData[208]++;
        attrs.push({
  prevVal: prevVal, 
  newVal: value, 
  attrName: name, 
  subAttrName: fullName});
      } else {
        _$jscoverage['/attribute.js'].lineData[215]++;
        __fireAttrChange(self, '', '*', [prevVal], [value], [fullName], [name], opts.data);
      }
    }
    _$jscoverage['/attribute.js'].lineData[223]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[230]++;
  function Attribute(config) {
    _$jscoverage['/attribute.js'].functionData[15]++;
    _$jscoverage['/attribute.js'].lineData[231]++;
    var self = this, c = self.constructor;
    _$jscoverage['/attribute.js'].lineData[234]++;
    self.userConfig = config;
    _$jscoverage['/attribute.js'].lineData[236]++;
    while (c) {
      _$jscoverage['/attribute.js'].lineData[237]++;
      addAttrs(self, c.ATTRS);
      _$jscoverage['/attribute.js'].lineData[238]++;
      c = c.superclass ? c.superclass.constructor : null;
    }
    _$jscoverage['/attribute.js'].lineData[241]++;
    initAttrs(self, config);
  }
  _$jscoverage['/attribute.js'].lineData[244]++;
  function wrapProtoForSuper(px, SubClass) {
    _$jscoverage['/attribute.js'].functionData[16]++;
    _$jscoverage['/attribute.js'].lineData[245]++;
    var hooks = visit29_245_1(SubClass.__hooks__ || {});
    _$jscoverage['/attribute.js'].lineData[247]++;
    for (var p in hooks) {
      _$jscoverage['/attribute.js'].lineData[248]++;
      if (visit30_248_1(p in px)) {
        _$jscoverage['/attribute.js'].lineData[249]++;
        px[p] = hooks[p](px[p]);
      }
    }
    _$jscoverage['/attribute.js'].lineData[252]++;
    S.each(px, function(v, p) {
  _$jscoverage['/attribute.js'].functionData[17]++;
  _$jscoverage['/attribute.js'].lineData[253]++;
  if (visit31_253_1(typeof v === 'function')) {
    _$jscoverage['/attribute.js'].lineData[254]++;
    var wrapped = 0;
    _$jscoverage['/attribute.js'].lineData[255]++;
    if (visit32_255_1(v.__owner__)) {
      _$jscoverage['/attribute.js'].lineData[256]++;
      var originalOwner = v.__owner__;
      _$jscoverage['/attribute.js'].lineData[257]++;
      delete v.__owner__;
      _$jscoverage['/attribute.js'].lineData[258]++;
      delete v.__name__;
      _$jscoverage['/attribute.js'].lineData[259]++;
      wrapped = v.__wrapped__ = 1;
      _$jscoverage['/attribute.js'].lineData[260]++;
      var newV = bind(v);
      _$jscoverage['/attribute.js'].lineData[261]++;
      newV.__owner__ = originalOwner;
      _$jscoverage['/attribute.js'].lineData[262]++;
      newV.__name__ = p;
      _$jscoverage['/attribute.js'].lineData[263]++;
      originalOwner.prototype[p] = newV;
    } else {
      _$jscoverage['/attribute.js'].lineData[264]++;
      if (visit33_264_1(v.__wrapped__)) {
        _$jscoverage['/attribute.js'].lineData[265]++;
        wrapped = 1;
      }
    }
    _$jscoverage['/attribute.js'].lineData[267]++;
    if (visit34_267_1(wrapped)) {
      _$jscoverage['/attribute.js'].lineData[268]++;
      px[p] = v = bind(v);
    }
    _$jscoverage['/attribute.js'].lineData[270]++;
    v.__owner__ = SubClass;
    _$jscoverage['/attribute.js'].lineData[271]++;
    v.__name__ = p;
  }
});
  }
  _$jscoverage['/attribute.js'].lineData[276]++;
  function addMembers(px) {
    _$jscoverage['/attribute.js'].functionData[18]++;
    _$jscoverage['/attribute.js'].lineData[277]++;
    var SubClass = this;
    _$jscoverage['/attribute.js'].lineData[278]++;
    wrapProtoForSuper(px, SubClass);
    _$jscoverage['/attribute.js'].lineData[279]++;
    S.mix(SubClass.prototype, px);
  }
  _$jscoverage['/attribute.js'].lineData[282]++;
  Attribute.extend = function extend(px, sx) {
  _$jscoverage['/attribute.js'].functionData[19]++;
  _$jscoverage['/attribute.js'].lineData[283]++;
  var SubClass, SuperClass = this;
  _$jscoverage['/attribute.js'].lineData[285]++;
  sx = visit35_285_1(sx || {});
  _$jscoverage['/attribute.js'].lineData[286]++;
  px = visit36_286_1(px || {});
  _$jscoverage['/attribute.js'].lineData[287]++;
  var hooks, sxHooks = sx.__hooks__;
  _$jscoverage['/attribute.js'].lineData[289]++;
  if ((hooks = SuperClass.__hooks__)) {
    _$jscoverage['/attribute.js'].lineData[290]++;
    sxHooks = sx.__hooks__ = visit37_290_1(sx.__hooks__ || {});
    _$jscoverage['/attribute.js'].lineData[291]++;
    S.mix(sxHooks, hooks, false);
  }
  _$jscoverage['/attribute.js'].lineData[293]++;
  var name = visit38_293_1(sx.name || 'AttributeDerived');
  _$jscoverage['/attribute.js'].lineData[294]++;
  if (visit39_294_1(px.hasOwnProperty('constructor'))) {
    _$jscoverage['/attribute.js'].lineData[295]++;
    SubClass = px.constructor;
  } else {
    _$jscoverage['/attribute.js'].lineData[299]++;
    if (visit40_299_1('@DEBUG@')) {
      _$jscoverage['/attribute.js'].lineData[301]++;
      SubClass = new Function('return function ' + camelCase(name) + '(){ ' + 'this.callSuper.apply(this, arguments);' + '}')();
    } else {
      _$jscoverage['/attribute.js'].lineData[305]++;
      SubClass = function() {
  _$jscoverage['/attribute.js'].functionData[20]++;
  _$jscoverage['/attribute.js'].lineData[306]++;
  this.callSuper.apply(this, arguments);
};
    }
  }
  _$jscoverage['/attribute.js'].lineData[310]++;
  px.constructor = SubClass;
  _$jscoverage['/attribute.js'].lineData[311]++;
  SubClass.__hooks__ = sxHooks;
  _$jscoverage['/attribute.js'].lineData[312]++;
  wrapProtoForSuper(px, SubClass);
  _$jscoverage['/attribute.js'].lineData[313]++;
  var inheritedStatics, sxInheritedStatics = sx.inheritedStatics;
  _$jscoverage['/attribute.js'].lineData[315]++;
  if ((inheritedStatics = SuperClass.inheritedStatics)) {
    _$jscoverage['/attribute.js'].lineData[316]++;
    sxInheritedStatics = sx.inheritedStatics = visit41_316_1(sx.inheritedStatics || {});
    _$jscoverage['/attribute.js'].lineData[317]++;
    S.mix(sxInheritedStatics, inheritedStatics, false);
  }
  _$jscoverage['/attribute.js'].lineData[319]++;
  S.extend(SubClass, SuperClass, px, sx);
  _$jscoverage['/attribute.js'].lineData[320]++;
  if (visit42_320_1(sxInheritedStatics)) {
    _$jscoverage['/attribute.js'].lineData[321]++;
    S.mix(SubClass, sxInheritedStatics);
  }
  _$jscoverage['/attribute.js'].lineData[323]++;
  SubClass.extend = visit43_323_1(sx.extend || extend);
  _$jscoverage['/attribute.js'].lineData[324]++;
  SubClass.addMembers = addMembers;
  _$jscoverage['/attribute.js'].lineData[325]++;
  return SubClass;
};
  _$jscoverage['/attribute.js'].lineData[328]++;
  function addAttrs(host, attrs) {
    _$jscoverage['/attribute.js'].functionData[21]++;
    _$jscoverage['/attribute.js'].lineData[329]++;
    if (visit44_329_1(attrs)) {
      _$jscoverage['/attribute.js'].lineData[330]++;
      for (var attr in attrs) {
        _$jscoverage['/attribute.js'].lineData[338]++;
        host.addAttr(attr, attrs[attr], false);
      }
    }
  }
  _$jscoverage['/attribute.js'].lineData[343]++;
  function initAttrs(host, config) {
    _$jscoverage['/attribute.js'].functionData[22]++;
    _$jscoverage['/attribute.js'].lineData[344]++;
    if (visit45_344_1(config)) {
      _$jscoverage['/attribute.js'].lineData[345]++;
      for (var attr in config) {
        _$jscoverage['/attribute.js'].lineData[347]++;
        host.setInternal(attr, config[attr]);
      }
    }
  }
  _$jscoverage['/attribute.js'].lineData[352]++;
  S.augment(Attribute, CustomEvent.Target, {
  INVALID: INVALID, 
  'callSuper': function() {
  _$jscoverage['/attribute.js'].functionData[23]++;
  _$jscoverage['/attribute.js'].lineData[356]++;
  var method, obj, self = this, args = arguments;
  _$jscoverage['/attribute.js'].lineData[360]++;
  if (visit46_360_1(visit47_360_2(typeof self === 'function') && self.__name__)) {
    _$jscoverage['/attribute.js'].lineData[361]++;
    method = self;
    _$jscoverage['/attribute.js'].lineData[362]++;
    obj = args[0];
    _$jscoverage['/attribute.js'].lineData[363]++;
    args = Array.prototype.slice.call(args, 1);
  } else {
    _$jscoverage['/attribute.js'].lineData[366]++;
    method = arguments.callee.caller;
    _$jscoverage['/attribute.js'].lineData[367]++;
    if (visit48_367_1(method.__wrapped__)) {
      _$jscoverage['/attribute.js'].lineData[368]++;
      method = method.caller;
    }
    _$jscoverage['/attribute.js'].lineData[370]++;
    obj = self;
  }
  _$jscoverage['/attribute.js'].lineData[373]++;
  var name = method.__name__;
  _$jscoverage['/attribute.js'].lineData[374]++;
  if (visit49_374_1(!name)) {
    _$jscoverage['/attribute.js'].lineData[376]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[378]++;
  var member = method.__owner__.superclass[name];
  _$jscoverage['/attribute.js'].lineData[379]++;
  if (visit50_379_1(!member)) {
    _$jscoverage['/attribute.js'].lineData[381]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[384]++;
  return member.apply(obj, visit51_384_1(args || []));
}, 
  getAttrs: function() {
  _$jscoverage['/attribute.js'].functionData[24]++;
  _$jscoverage['/attribute.js'].lineData[393]++;
  return visit52_393_1(this.__attrs || (this.__attrs = {}));
}, 
  getAttrVals: function() {
  _$jscoverage['/attribute.js'].functionData[25]++;
  _$jscoverage['/attribute.js'].lineData[401]++;
  var self = this, o = {}, a, attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[405]++;
  for (a in attrs) {
    _$jscoverage['/attribute.js'].lineData[406]++;
    o[a] = self.get(a);
  }
  _$jscoverage['/attribute.js'].lineData[408]++;
  return o;
}, 
  addAttr: function(name, attrConfig, override) {
  _$jscoverage['/attribute.js'].functionData[26]++;
  _$jscoverage['/attribute.js'].lineData[429]++;
  var self = this, attrs = self.getAttrs(), attr, cfg = S.clone(attrConfig);
  _$jscoverage['/attribute.js'].lineData[433]++;
  if ((attr = attrs[name])) {
    _$jscoverage['/attribute.js'].lineData[434]++;
    S.mix(attr, cfg, override);
  } else {
    _$jscoverage['/attribute.js'].lineData[436]++;
    attrs[name] = cfg;
  }
  _$jscoverage['/attribute.js'].lineData[438]++;
  return self;
}, 
  addAttrs: function(attrConfigs, initialValues) {
  _$jscoverage['/attribute.js'].functionData[27]++;
  _$jscoverage['/attribute.js'].lineData[448]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[449]++;
  S.each(attrConfigs, function(attrConfig, name) {
  _$jscoverage['/attribute.js'].functionData[28]++;
  _$jscoverage['/attribute.js'].lineData[450]++;
  self.addAttr(name, attrConfig);
});
  _$jscoverage['/attribute.js'].lineData[452]++;
  if (visit53_452_1(initialValues)) {
    _$jscoverage['/attribute.js'].lineData[453]++;
    self.set(initialValues);
  }
  _$jscoverage['/attribute.js'].lineData[455]++;
  return self;
}, 
  hasAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[29]++;
  _$jscoverage['/attribute.js'].lineData[464]++;
  return this.getAttrs().hasOwnProperty(name);
}, 
  removeAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[30]++;
  _$jscoverage['/attribute.js'].lineData[472]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[473]++;
  var __attrVals = getAttrVals(self);
  _$jscoverage['/attribute.js'].lineData[474]++;
  var __attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[476]++;
  if (visit54_476_1(self.hasAttr(name))) {
    _$jscoverage['/attribute.js'].lineData[477]++;
    delete __attrs[name];
    _$jscoverage['/attribute.js'].lineData[478]++;
    delete __attrVals[name];
  }
  _$jscoverage['/attribute.js'].lineData[481]++;
  return self;
}, 
  set: function(name, value, opts) {
  _$jscoverage['/attribute.js'].functionData[31]++;
  _$jscoverage['/attribute.js'].lineData[495]++;
  var self = this, e;
  _$jscoverage['/attribute.js'].lineData[496]++;
  if (visit55_496_1(S.isPlainObject(name))) {
    _$jscoverage['/attribute.js'].lineData[497]++;
    opts = value;
    _$jscoverage['/attribute.js'].lineData[498]++;
    opts = visit56_498_1(opts || {});
    _$jscoverage['/attribute.js'].lineData[499]++;
    var all = Object(name), attrs = [], errors = [];
    _$jscoverage['/attribute.js'].lineData[502]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[505]++;
      if (visit57_505_1((e = validate(self, name, all[name], all)) !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[506]++;
        errors.push(e);
      }
    }
    _$jscoverage['/attribute.js'].lineData[509]++;
    if (visit58_509_1(errors.length)) {
      _$jscoverage['/attribute.js'].lineData[510]++;
      if (visit59_510_1(opts.error)) {
        _$jscoverage['/attribute.js'].lineData[511]++;
        opts.error(errors);
      }
      _$jscoverage['/attribute.js'].lineData[513]++;
      return FALSE;
    }
    _$jscoverage['/attribute.js'].lineData[515]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[516]++;
      setInternal(self, name, all[name], opts, attrs);
    }
    _$jscoverage['/attribute.js'].lineData[518]++;
    var attrNames = [], prevVals = [], newVals = [], subAttrNames = [];
    _$jscoverage['/attribute.js'].lineData[522]++;
    S.each(attrs, function(attr) {
  _$jscoverage['/attribute.js'].functionData[32]++;
  _$jscoverage['/attribute.js'].lineData[523]++;
  prevVals.push(attr.prevVal);
  _$jscoverage['/attribute.js'].lineData[524]++;
  newVals.push(attr.newVal);
  _$jscoverage['/attribute.js'].lineData[525]++;
  attrNames.push(attr.attrName);
  _$jscoverage['/attribute.js'].lineData[526]++;
  subAttrNames.push(attr.subAttrName);
});
    _$jscoverage['/attribute.js'].lineData[528]++;
    if (visit60_528_1(attrNames.length)) {
      _$jscoverage['/attribute.js'].lineData[529]++;
      __fireAttrChange(self, '', '*', prevVals, newVals, subAttrNames, attrNames, opts.data);
    }
    _$jscoverage['/attribute.js'].lineData[538]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[540]++;
  opts = visit61_540_1(opts || {});
  _$jscoverage['/attribute.js'].lineData[542]++;
  e = validate(self, name, value);
  _$jscoverage['/attribute.js'].lineData[544]++;
  if (visit62_544_1(e !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[545]++;
    if (visit63_545_1(opts.error)) {
      _$jscoverage['/attribute.js'].lineData[546]++;
      opts.error(e);
    }
    _$jscoverage['/attribute.js'].lineData[548]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[550]++;
  return setInternal(self, name, value, opts);
}, 
  setInternal: function(name, value) {
  _$jscoverage['/attribute.js'].functionData[33]++;
  _$jscoverage['/attribute.js'].lineData[559]++;
  var self = this, setValue, attrConfig = ensureNonEmpty(self.getAttrs(), name), setter = attrConfig.setter;
  _$jscoverage['/attribute.js'].lineData[568]++;
  if (visit64_568_1(setter && (setter = normalFn(self, setter)))) {
    _$jscoverage['/attribute.js'].lineData[569]++;
    setValue = setter.call(self, value, name);
  }
  _$jscoverage['/attribute.js'].lineData[572]++;
  if (visit65_572_1(setValue === INVALID)) {
    _$jscoverage['/attribute.js'].lineData[573]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[576]++;
  if (visit66_576_1(setValue !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[577]++;
    value = setValue;
  }
  _$jscoverage['/attribute.js'].lineData[581]++;
  getAttrVals(self)[name] = value;
  _$jscoverage['/attribute.js'].lineData[583]++;
  return undefined;
}, 
  get: function(name) {
  _$jscoverage['/attribute.js'].functionData[34]++;
  _$jscoverage['/attribute.js'].lineData[592]++;
  var self = this, dot = '.', path, attrVals = getAttrVals(self), attrConfig, getter, ret;
  _$jscoverage['/attribute.js'].lineData[599]++;
  if (visit67_599_1(name.indexOf(dot) !== -1)) {
    _$jscoverage['/attribute.js'].lineData[600]++;
    path = name.split(dot);
    _$jscoverage['/attribute.js'].lineData[601]++;
    name = path.shift();
  }
  _$jscoverage['/attribute.js'].lineData[604]++;
  attrConfig = ensureNonEmpty(self.getAttrs(), name, 1);
  _$jscoverage['/attribute.js'].lineData[605]++;
  getter = attrConfig.getter;
  _$jscoverage['/attribute.js'].lineData[609]++;
  ret = name in attrVals ? attrVals[name] : getDefAttrVal(self, name);
  _$jscoverage['/attribute.js'].lineData[614]++;
  if (visit68_614_1(getter && (getter = normalFn(self, getter)))) {
    _$jscoverage['/attribute.js'].lineData[615]++;
    ret = getter.call(self, ret, name);
  }
  _$jscoverage['/attribute.js'].lineData[618]++;
  if (visit69_618_1(!(name in attrVals) && visit70_618_2(ret !== undefined))) {
    _$jscoverage['/attribute.js'].lineData[619]++;
    attrVals[name] = ret;
  }
  _$jscoverage['/attribute.js'].lineData[622]++;
  if (visit71_622_1(path)) {
    _$jscoverage['/attribute.js'].lineData[623]++;
    ret = getValueByPath(ret, path);
  }
  _$jscoverage['/attribute.js'].lineData[626]++;
  return ret;
}, 
  reset: function(name, opts) {
  _$jscoverage['/attribute.js'].functionData[35]++;
  _$jscoverage['/attribute.js'].lineData[638]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[640]++;
  if (visit72_640_1(typeof name === 'string')) {
    _$jscoverage['/attribute.js'].lineData[641]++;
    if (visit73_641_1(self.hasAttr(name))) {
      _$jscoverage['/attribute.js'].lineData[643]++;
      return self.set(name, getDefAttrVal(self, name), opts);
    } else {
      _$jscoverage['/attribute.js'].lineData[646]++;
      return self;
    }
  }
  _$jscoverage['/attribute.js'].lineData[650]++;
  opts = (name);
  _$jscoverage['/attribute.js'].lineData[653]++;
  var attrs = self.getAttrs(), values = {};
  _$jscoverage['/attribute.js'].lineData[657]++;
  for (name in attrs) {
    _$jscoverage['/attribute.js'].lineData[658]++;
    values[name] = getDefAttrVal(self, name);
  }
  _$jscoverage['/attribute.js'].lineData[661]++;
  self.set(values, opts);
  _$jscoverage['/attribute.js'].lineData[662]++;
  return self;
}});
  _$jscoverage['/attribute.js'].lineData[667]++;
  function getDefAttrVal(self, name) {
    _$jscoverage['/attribute.js'].functionData[36]++;
    _$jscoverage['/attribute.js'].lineData[668]++;
    var attrs = self.getAttrs(), attrConfig = ensureNonEmpty(attrs, name, 1), valFn = attrConfig.valueFn, val;
    _$jscoverage['/attribute.js'].lineData[673]++;
    if (visit74_673_1(valFn && (valFn = normalFn(self, valFn)))) {
      _$jscoverage['/attribute.js'].lineData[674]++;
      val = valFn.call(self);
      _$jscoverage['/attribute.js'].lineData[675]++;
      if (visit75_675_1(val !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[679]++;
        attrConfig.value = val;
      }
      _$jscoverage['/attribute.js'].lineData[681]++;
      delete attrConfig.valueFn;
      _$jscoverage['/attribute.js'].lineData[682]++;
      attrs[name] = attrConfig;
    }
    _$jscoverage['/attribute.js'].lineData[685]++;
    return attrConfig.value;
  }
  _$jscoverage['/attribute.js'].lineData[688]++;
  function validate(self, name, value, all) {
    _$jscoverage['/attribute.js'].functionData[37]++;
    _$jscoverage['/attribute.js'].lineData[689]++;
    var path, prevVal, pathNamePair;
    _$jscoverage['/attribute.js'].lineData[691]++;
    pathNamePair = getPathNamePair(name);
    _$jscoverage['/attribute.js'].lineData[693]++;
    name = pathNamePair.name;
    _$jscoverage['/attribute.js'].lineData[694]++;
    path = pathNamePair.path;
    _$jscoverage['/attribute.js'].lineData[696]++;
    if (visit76_696_1(path)) {
      _$jscoverage['/attribute.js'].lineData[697]++;
      prevVal = self.get(name);
      _$jscoverage['/attribute.js'].lineData[698]++;
      value = getValueBySubValue(prevVal, path, value);
    }
    _$jscoverage['/attribute.js'].lineData[700]++;
    var attrConfig = ensureNonEmpty(self.getAttrs(), name), e, validator = attrConfig.validator;
    _$jscoverage['/attribute.js'].lineData[703]++;
    if (visit77_703_1(validator && (validator = normalFn(self, validator)))) {
      _$jscoverage['/attribute.js'].lineData[704]++;
      e = validator.call(self, value, name, all);
      _$jscoverage['/attribute.js'].lineData[706]++;
      if (visit78_706_1(visit79_706_2(e !== undefined) && visit80_706_3(e !== true))) {
        _$jscoverage['/attribute.js'].lineData[707]++;
        return e;
      }
    }
    _$jscoverage['/attribute.js'].lineData[710]++;
    return undefined;
  }
});
