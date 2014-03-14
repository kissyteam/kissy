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
if (! _$jscoverage['/base/style.js']) {
  _$jscoverage['/base/style.js'] = {};
  _$jscoverage['/base/style.js'].lineData = [];
  _$jscoverage['/base/style.js'].lineData[6] = 0;
  _$jscoverage['/base/style.js'].lineData[7] = 0;
  _$jscoverage['/base/style.js'].lineData[8] = 0;
  _$jscoverage['/base/style.js'].lineData[9] = 0;
  _$jscoverage['/base/style.js'].lineData[44] = 0;
  _$jscoverage['/base/style.js'].lineData[46] = 0;
  _$jscoverage['/base/style.js'].lineData[47] = 0;
  _$jscoverage['/base/style.js'].lineData[48] = 0;
  _$jscoverage['/base/style.js'].lineData[50] = 0;
  _$jscoverage['/base/style.js'].lineData[51] = 0;
  _$jscoverage['/base/style.js'].lineData[54] = 0;
  _$jscoverage['/base/style.js'].lineData[55] = 0;
  _$jscoverage['/base/style.js'].lineData[58] = 0;
  _$jscoverage['/base/style.js'].lineData[59] = 0;
  _$jscoverage['/base/style.js'].lineData[60] = 0;
  _$jscoverage['/base/style.js'].lineData[62] = 0;
  _$jscoverage['/base/style.js'].lineData[63] = 0;
  _$jscoverage['/base/style.js'].lineData[64] = 0;
  _$jscoverage['/base/style.js'].lineData[66] = 0;
  _$jscoverage['/base/style.js'].lineData[68] = 0;
  _$jscoverage['/base/style.js'].lineData[71] = 0;
  _$jscoverage['/base/style.js'].lineData[83] = 0;
  _$jscoverage['/base/style.js'].lineData[90] = 0;
  _$jscoverage['/base/style.js'].lineData[93] = 0;
  _$jscoverage['/base/style.js'].lineData[94] = 0;
  _$jscoverage['/base/style.js'].lineData[98] = 0;
  _$jscoverage['/base/style.js'].lineData[99] = 0;
  _$jscoverage['/base/style.js'].lineData[103] = 0;
  _$jscoverage['/base/style.js'].lineData[104] = 0;
  _$jscoverage['/base/style.js'].lineData[105] = 0;
  _$jscoverage['/base/style.js'].lineData[106] = 0;
  _$jscoverage['/base/style.js'].lineData[107] = 0;
  _$jscoverage['/base/style.js'].lineData[109] = 0;
  _$jscoverage['/base/style.js'].lineData[110] = 0;
  _$jscoverage['/base/style.js'].lineData[112] = 0;
  _$jscoverage['/base/style.js'].lineData[113] = 0;
  _$jscoverage['/base/style.js'].lineData[114] = 0;
  _$jscoverage['/base/style.js'].lineData[117] = 0;
  _$jscoverage['/base/style.js'].lineData[130] = 0;
  _$jscoverage['/base/style.js'].lineData[135] = 0;
  _$jscoverage['/base/style.js'].lineData[136] = 0;
  _$jscoverage['/base/style.js'].lineData[137] = 0;
  _$jscoverage['/base/style.js'].lineData[138] = 0;
  _$jscoverage['/base/style.js'].lineData[141] = 0;
  _$jscoverage['/base/style.js'].lineData[143] = 0;
  _$jscoverage['/base/style.js'].lineData[144] = 0;
  _$jscoverage['/base/style.js'].lineData[145] = 0;
  _$jscoverage['/base/style.js'].lineData[146] = 0;
  _$jscoverage['/base/style.js'].lineData[148] = 0;
  _$jscoverage['/base/style.js'].lineData[150] = 0;
  _$jscoverage['/base/style.js'].lineData[151] = 0;
  _$jscoverage['/base/style.js'].lineData[154] = 0;
  _$jscoverage['/base/style.js'].lineData[167] = 0;
  _$jscoverage['/base/style.js'].lineData[174] = 0;
  _$jscoverage['/base/style.js'].lineData[175] = 0;
  _$jscoverage['/base/style.js'].lineData[176] = 0;
  _$jscoverage['/base/style.js'].lineData[177] = 0;
  _$jscoverage['/base/style.js'].lineData[180] = 0;
  _$jscoverage['/base/style.js'].lineData[183] = 0;
  _$jscoverage['/base/style.js'].lineData[184] = 0;
  _$jscoverage['/base/style.js'].lineData[186] = 0;
  _$jscoverage['/base/style.js'].lineData[188] = 0;
  _$jscoverage['/base/style.js'].lineData[189] = 0;
  _$jscoverage['/base/style.js'].lineData[191] = 0;
  _$jscoverage['/base/style.js'].lineData[194] = 0;
  _$jscoverage['/base/style.js'].lineData[197] = 0;
  _$jscoverage['/base/style.js'].lineData[199] = 0;
  _$jscoverage['/base/style.js'].lineData[200] = 0;
  _$jscoverage['/base/style.js'].lineData[203] = 0;
  _$jscoverage['/base/style.js'].lineData[211] = 0;
  _$jscoverage['/base/style.js'].lineData[215] = 0;
  _$jscoverage['/base/style.js'].lineData[216] = 0;
  _$jscoverage['/base/style.js'].lineData[217] = 0;
  _$jscoverage['/base/style.js'].lineData[219] = 0;
  _$jscoverage['/base/style.js'].lineData[220] = 0;
  _$jscoverage['/base/style.js'].lineData[221] = 0;
  _$jscoverage['/base/style.js'].lineData[222] = 0;
  _$jscoverage['/base/style.js'].lineData[223] = 0;
  _$jscoverage['/base/style.js'].lineData[233] = 0;
  _$jscoverage['/base/style.js'].lineData[235] = 0;
  _$jscoverage['/base/style.js'].lineData[236] = 0;
  _$jscoverage['/base/style.js'].lineData[237] = 0;
  _$jscoverage['/base/style.js'].lineData[239] = 0;
  _$jscoverage['/base/style.js'].lineData[240] = 0;
  _$jscoverage['/base/style.js'].lineData[241] = 0;
  _$jscoverage['/base/style.js'].lineData[243] = 0;
  _$jscoverage['/base/style.js'].lineData[253] = 0;
  _$jscoverage['/base/style.js'].lineData[255] = 0;
  _$jscoverage['/base/style.js'].lineData[256] = 0;
  _$jscoverage['/base/style.js'].lineData[257] = 0;
  _$jscoverage['/base/style.js'].lineData[258] = 0;
  _$jscoverage['/base/style.js'].lineData[260] = 0;
  _$jscoverage['/base/style.js'].lineData[274] = 0;
  _$jscoverage['/base/style.js'].lineData[275] = 0;
  _$jscoverage['/base/style.js'].lineData[276] = 0;
  _$jscoverage['/base/style.js'].lineData[278] = 0;
  _$jscoverage['/base/style.js'].lineData[281] = 0;
  _$jscoverage['/base/style.js'].lineData[284] = 0;
  _$jscoverage['/base/style.js'].lineData[285] = 0;
  _$jscoverage['/base/style.js'].lineData[289] = 0;
  _$jscoverage['/base/style.js'].lineData[290] = 0;
  _$jscoverage['/base/style.js'].lineData[293] = 0;
  _$jscoverage['/base/style.js'].lineData[296] = 0;
  _$jscoverage['/base/style.js'].lineData[298] = 0;
  _$jscoverage['/base/style.js'].lineData[299] = 0;
  _$jscoverage['/base/style.js'].lineData[301] = 0;
  _$jscoverage['/base/style.js'].lineData[310] = 0;
  _$jscoverage['/base/style.js'].lineData[318] = 0;
  _$jscoverage['/base/style.js'].lineData[319] = 0;
  _$jscoverage['/base/style.js'].lineData[321] = 0;
  _$jscoverage['/base/style.js'].lineData[322] = 0;
  _$jscoverage['/base/style.js'].lineData[323] = 0;
  _$jscoverage['/base/style.js'].lineData[324] = 0;
  _$jscoverage['/base/style.js'].lineData[325] = 0;
  _$jscoverage['/base/style.js'].lineData[326] = 0;
  _$jscoverage['/base/style.js'].lineData[327] = 0;
  _$jscoverage['/base/style.js'].lineData[328] = 0;
  _$jscoverage['/base/style.js'].lineData[329] = 0;
  _$jscoverage['/base/style.js'].lineData[330] = 0;
  _$jscoverage['/base/style.js'].lineData[331] = 0;
  _$jscoverage['/base/style.js'].lineData[332] = 0;
  _$jscoverage['/base/style.js'].lineData[393] = 0;
  _$jscoverage['/base/style.js'].lineData[394] = 0;
  _$jscoverage['/base/style.js'].lineData[395] = 0;
  _$jscoverage['/base/style.js'].lineData[396] = 0;
  _$jscoverage['/base/style.js'].lineData[399] = 0;
  _$jscoverage['/base/style.js'].lineData[400] = 0;
  _$jscoverage['/base/style.js'].lineData[401] = 0;
  _$jscoverage['/base/style.js'].lineData[403] = 0;
  _$jscoverage['/base/style.js'].lineData[405] = 0;
  _$jscoverage['/base/style.js'].lineData[406] = 0;
  _$jscoverage['/base/style.js'].lineData[407] = 0;
  _$jscoverage['/base/style.js'].lineData[408] = 0;
  _$jscoverage['/base/style.js'].lineData[409] = 0;
  _$jscoverage['/base/style.js'].lineData[410] = 0;
  _$jscoverage['/base/style.js'].lineData[411] = 0;
  _$jscoverage['/base/style.js'].lineData[412] = 0;
  _$jscoverage['/base/style.js'].lineData[414] = 0;
  _$jscoverage['/base/style.js'].lineData[416] = 0;
  _$jscoverage['/base/style.js'].lineData[418] = 0;
  _$jscoverage['/base/style.js'].lineData[424] = 0;
  _$jscoverage['/base/style.js'].lineData[429] = 0;
  _$jscoverage['/base/style.js'].lineData[430] = 0;
  _$jscoverage['/base/style.js'].lineData[431] = 0;
  _$jscoverage['/base/style.js'].lineData[433] = 0;
  _$jscoverage['/base/style.js'].lineData[438] = 0;
  _$jscoverage['/base/style.js'].lineData[440] = 0;
  _$jscoverage['/base/style.js'].lineData[441] = 0;
  _$jscoverage['/base/style.js'].lineData[443] = 0;
  _$jscoverage['/base/style.js'].lineData[446] = 0;
  _$jscoverage['/base/style.js'].lineData[447] = 0;
  _$jscoverage['/base/style.js'].lineData[448] = 0;
  _$jscoverage['/base/style.js'].lineData[449] = 0;
  _$jscoverage['/base/style.js'].lineData[451] = 0;
  _$jscoverage['/base/style.js'].lineData[452] = 0;
  _$jscoverage['/base/style.js'].lineData[453] = 0;
  _$jscoverage['/base/style.js'].lineData[454] = 0;
  _$jscoverage['/base/style.js'].lineData[457] = 0;
  _$jscoverage['/base/style.js'].lineData[458] = 0;
  _$jscoverage['/base/style.js'].lineData[461] = 0;
  _$jscoverage['/base/style.js'].lineData[466] = 0;
  _$jscoverage['/base/style.js'].lineData[467] = 0;
  _$jscoverage['/base/style.js'].lineData[472] = 0;
  _$jscoverage['/base/style.js'].lineData[473] = 0;
  _$jscoverage['/base/style.js'].lineData[474] = 0;
  _$jscoverage['/base/style.js'].lineData[477] = 0;
  _$jscoverage['/base/style.js'].lineData[480] = 0;
  _$jscoverage['/base/style.js'].lineData[481] = 0;
  _$jscoverage['/base/style.js'].lineData[485] = 0;
  _$jscoverage['/base/style.js'].lineData[486] = 0;
  _$jscoverage['/base/style.js'].lineData[489] = 0;
  _$jscoverage['/base/style.js'].lineData[491] = 0;
  _$jscoverage['/base/style.js'].lineData[493] = 0;
  _$jscoverage['/base/style.js'].lineData[494] = 0;
  _$jscoverage['/base/style.js'].lineData[495] = 0;
  _$jscoverage['/base/style.js'].lineData[497] = 0;
  _$jscoverage['/base/style.js'].lineData[499] = 0;
  _$jscoverage['/base/style.js'].lineData[500] = 0;
  _$jscoverage['/base/style.js'].lineData[501] = 0;
  _$jscoverage['/base/style.js'].lineData[503] = 0;
  _$jscoverage['/base/style.js'].lineData[505] = 0;
  _$jscoverage['/base/style.js'].lineData[506] = 0;
  _$jscoverage['/base/style.js'].lineData[508] = 0;
  _$jscoverage['/base/style.js'].lineData[510] = 0;
  _$jscoverage['/base/style.js'].lineData[512] = 0;
  _$jscoverage['/base/style.js'].lineData[514] = 0;
  _$jscoverage['/base/style.js'].lineData[517] = 0;
  _$jscoverage['/base/style.js'].lineData[518] = 0;
  _$jscoverage['/base/style.js'].lineData[521] = 0;
  _$jscoverage['/base/style.js'].lineData[524] = 0;
  _$jscoverage['/base/style.js'].lineData[525] = 0;
  _$jscoverage['/base/style.js'].lineData[527] = 0;
  _$jscoverage['/base/style.js'].lineData[529] = 0;
  _$jscoverage['/base/style.js'].lineData[532] = 0;
  _$jscoverage['/base/style.js'].lineData[535] = 0;
  _$jscoverage['/base/style.js'].lineData[537] = 0;
  _$jscoverage['/base/style.js'].lineData[542] = 0;
  _$jscoverage['/base/style.js'].lineData[543] = 0;
  _$jscoverage['/base/style.js'].lineData[546] = 0;
  _$jscoverage['/base/style.js'].lineData[547] = 0;
  _$jscoverage['/base/style.js'].lineData[549] = 0;
  _$jscoverage['/base/style.js'].lineData[550] = 0;
  _$jscoverage['/base/style.js'].lineData[553] = 0;
  _$jscoverage['/base/style.js'].lineData[556] = 0;
  _$jscoverage['/base/style.js'].lineData[557] = 0;
  _$jscoverage['/base/style.js'].lineData[558] = 0;
  _$jscoverage['/base/style.js'].lineData[559] = 0;
  _$jscoverage['/base/style.js'].lineData[560] = 0;
  _$jscoverage['/base/style.js'].lineData[561] = 0;
  _$jscoverage['/base/style.js'].lineData[562] = 0;
  _$jscoverage['/base/style.js'].lineData[563] = 0;
  _$jscoverage['/base/style.js'].lineData[564] = 0;
  _$jscoverage['/base/style.js'].lineData[566] = 0;
  _$jscoverage['/base/style.js'].lineData[568] = 0;
  _$jscoverage['/base/style.js'].lineData[572] = 0;
  _$jscoverage['/base/style.js'].lineData[575] = 0;
  _$jscoverage['/base/style.js'].lineData[576] = 0;
  _$jscoverage['/base/style.js'].lineData[579] = 0;
  _$jscoverage['/base/style.js'].lineData[580] = 0;
  _$jscoverage['/base/style.js'].lineData[582] = 0;
  _$jscoverage['/base/style.js'].lineData[584] = 0;
  _$jscoverage['/base/style.js'].lineData[586] = 0;
  _$jscoverage['/base/style.js'].lineData[597] = 0;
  _$jscoverage['/base/style.js'].lineData[598] = 0;
  _$jscoverage['/base/style.js'].lineData[599] = 0;
  _$jscoverage['/base/style.js'].lineData[600] = 0;
  _$jscoverage['/base/style.js'].lineData[601] = 0;
  _$jscoverage['/base/style.js'].lineData[603] = 0;
  _$jscoverage['/base/style.js'].lineData[605] = 0;
  _$jscoverage['/base/style.js'].lineData[606] = 0;
  _$jscoverage['/base/style.js'].lineData[607] = 0;
  _$jscoverage['/base/style.js'].lineData[608] = 0;
  _$jscoverage['/base/style.js'].lineData[609] = 0;
  _$jscoverage['/base/style.js'].lineData[611] = 0;
  _$jscoverage['/base/style.js'].lineData[612] = 0;
  _$jscoverage['/base/style.js'].lineData[613] = 0;
  _$jscoverage['/base/style.js'].lineData[616] = 0;
  _$jscoverage['/base/style.js'].lineData[618] = 0;
  _$jscoverage['/base/style.js'].lineData[619] = 0;
  _$jscoverage['/base/style.js'].lineData[621] = 0;
  _$jscoverage['/base/style.js'].lineData[622] = 0;
  _$jscoverage['/base/style.js'].lineData[623] = 0;
  _$jscoverage['/base/style.js'].lineData[624] = 0;
  _$jscoverage['/base/style.js'].lineData[625] = 0;
  _$jscoverage['/base/style.js'].lineData[628] = 0;
  _$jscoverage['/base/style.js'].lineData[630] = 0;
  _$jscoverage['/base/style.js'].lineData[631] = 0;
  _$jscoverage['/base/style.js'].lineData[636] = 0;
  _$jscoverage['/base/style.js'].lineData[641] = 0;
  _$jscoverage['/base/style.js'].lineData[643] = 0;
  _$jscoverage['/base/style.js'].lineData[644] = 0;
  _$jscoverage['/base/style.js'].lineData[648] = 0;
  _$jscoverage['/base/style.js'].lineData[649] = 0;
  _$jscoverage['/base/style.js'].lineData[654] = 0;
  _$jscoverage['/base/style.js'].lineData[655] = 0;
  _$jscoverage['/base/style.js'].lineData[656] = 0;
  _$jscoverage['/base/style.js'].lineData[657] = 0;
  _$jscoverage['/base/style.js'].lineData[658] = 0;
  _$jscoverage['/base/style.js'].lineData[661] = 0;
  _$jscoverage['/base/style.js'].lineData[662] = 0;
  _$jscoverage['/base/style.js'].lineData[666] = 0;
  _$jscoverage['/base/style.js'].lineData[672] = 0;
  _$jscoverage['/base/style.js'].lineData[673] = 0;
  _$jscoverage['/base/style.js'].lineData[674] = 0;
  _$jscoverage['/base/style.js'].lineData[676] = 0;
  _$jscoverage['/base/style.js'].lineData[678] = 0;
  _$jscoverage['/base/style.js'].lineData[681] = 0;
}
if (! _$jscoverage['/base/style.js'].functionData) {
  _$jscoverage['/base/style.js'].functionData = [];
  _$jscoverage['/base/style.js'].functionData[0] = 0;
  _$jscoverage['/base/style.js'].functionData[1] = 0;
  _$jscoverage['/base/style.js'].functionData[2] = 0;
  _$jscoverage['/base/style.js'].functionData[3] = 0;
  _$jscoverage['/base/style.js'].functionData[4] = 0;
  _$jscoverage['/base/style.js'].functionData[5] = 0;
  _$jscoverage['/base/style.js'].functionData[6] = 0;
  _$jscoverage['/base/style.js'].functionData[7] = 0;
  _$jscoverage['/base/style.js'].functionData[8] = 0;
  _$jscoverage['/base/style.js'].functionData[9] = 0;
  _$jscoverage['/base/style.js'].functionData[10] = 0;
  _$jscoverage['/base/style.js'].functionData[11] = 0;
  _$jscoverage['/base/style.js'].functionData[12] = 0;
  _$jscoverage['/base/style.js'].functionData[13] = 0;
  _$jscoverage['/base/style.js'].functionData[14] = 0;
  _$jscoverage['/base/style.js'].functionData[15] = 0;
  _$jscoverage['/base/style.js'].functionData[16] = 0;
  _$jscoverage['/base/style.js'].functionData[17] = 0;
  _$jscoverage['/base/style.js'].functionData[18] = 0;
  _$jscoverage['/base/style.js'].functionData[19] = 0;
  _$jscoverage['/base/style.js'].functionData[20] = 0;
  _$jscoverage['/base/style.js'].functionData[21] = 0;
  _$jscoverage['/base/style.js'].functionData[22] = 0;
  _$jscoverage['/base/style.js'].functionData[23] = 0;
  _$jscoverage['/base/style.js'].functionData[24] = 0;
  _$jscoverage['/base/style.js'].functionData[25] = 0;
  _$jscoverage['/base/style.js'].functionData[26] = 0;
  _$jscoverage['/base/style.js'].functionData[27] = 0;
}
if (! _$jscoverage['/base/style.js'].branchData) {
  _$jscoverage['/base/style.js'].branchData = {};
  _$jscoverage['/base/style.js'].branchData['18'] = [];
  _$jscoverage['/base/style.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['47'] = [];
  _$jscoverage['/base/style.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['51'] = [];
  _$jscoverage['/base/style.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['51'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['58'] = [];
  _$jscoverage['/base/style.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['59'] = [];
  _$jscoverage['/base/style.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['93'] = [];
  _$jscoverage['/base/style.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['94'] = [];
  _$jscoverage['/base/style.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['98'] = [];
  _$jscoverage['/base/style.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['98'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['103'] = [];
  _$jscoverage['/base/style.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['135'] = [];
  _$jscoverage['/base/style.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['137'] = [];
  _$jscoverage['/base/style.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['143'] = [];
  _$jscoverage['/base/style.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['145'] = [];
  _$jscoverage['/base/style.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['150'] = [];
  _$jscoverage['/base/style.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['174'] = [];
  _$jscoverage['/base/style.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['176'] = [];
  _$jscoverage['/base/style.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['186'] = [];
  _$jscoverage['/base/style.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['189'] = [];
  _$jscoverage['/base/style.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['191'] = [];
  _$jscoverage['/base/style.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['191'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['191'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['192'] = [];
  _$jscoverage['/base/style.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['197'] = [];
  _$jscoverage['/base/style.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['199'] = [];
  _$jscoverage['/base/style.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['215'] = [];
  _$jscoverage['/base/style.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['217'] = [];
  _$jscoverage['/base/style.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['219'] = [];
  _$jscoverage['/base/style.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['235'] = [];
  _$jscoverage['/base/style.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['239'] = [];
  _$jscoverage['/base/style.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['240'] = [];
  _$jscoverage['/base/style.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['255'] = [];
  _$jscoverage['/base/style.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['257'] = [];
  _$jscoverage['/base/style.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['274'] = [];
  _$jscoverage['/base/style.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['284'] = [];
  _$jscoverage['/base/style.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['289'] = [];
  _$jscoverage['/base/style.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['298'] = [];
  _$jscoverage['/base/style.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['318'] = [];
  _$jscoverage['/base/style.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['321'] = [];
  _$jscoverage['/base/style.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['324'] = [];
  _$jscoverage['/base/style.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['326'] = [];
  _$jscoverage['/base/style.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['331'] = [];
  _$jscoverage['/base/style.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['396'] = [];
  _$jscoverage['/base/style.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['401'] = [];
  _$jscoverage['/base/style.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['403'] = [];
  _$jscoverage['/base/style.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['407'] = [];
  _$jscoverage['/base/style.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['408'] = [];
  _$jscoverage['/base/style.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['411'] = [];
  _$jscoverage['/base/style.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['418'] = [];
  _$jscoverage['/base/style.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['430'] = [];
  _$jscoverage['/base/style.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['446'] = [];
  _$jscoverage['/base/style.js'].branchData['446'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['448'] = [];
  _$jscoverage['/base/style.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['452'] = [];
  _$jscoverage['/base/style.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['453'] = [];
  _$jscoverage['/base/style.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['453'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['457'] = [];
  _$jscoverage['/base/style.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['489'] = [];
  _$jscoverage['/base/style.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['489'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['490'] = [];
  _$jscoverage['/base/style.js'].branchData['490'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['490'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['497'] = [];
  _$jscoverage['/base/style.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['499'] = [];
  _$jscoverage['/base/style.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['499'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['499'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['501'] = [];
  _$jscoverage['/base/style.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['505'] = [];
  _$jscoverage['/base/style.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['508'] = [];
  _$jscoverage['/base/style.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['517'] = [];
  _$jscoverage['/base/style.js'].branchData['517'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['517'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['521'] = [];
  _$jscoverage['/base/style.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['524'] = [];
  _$jscoverage['/base/style.js'].branchData['524'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['532'] = [];
  _$jscoverage['/base/style.js'].branchData['532'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['532'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['532'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['533'] = [];
  _$jscoverage['/base/style.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['537'] = [];
  _$jscoverage['/base/style.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['546'] = [];
  _$jscoverage['/base/style.js'].branchData['546'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['558'] = [];
  _$jscoverage['/base/style.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['560'] = [];
  _$jscoverage['/base/style.js'].branchData['560'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['561'] = [];
  _$jscoverage['/base/style.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['563'] = [];
  _$jscoverage['/base/style.js'].branchData['563'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['568'] = [];
  _$jscoverage['/base/style.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['576'] = [];
  _$jscoverage['/base/style.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['582'] = [];
  _$jscoverage['/base/style.js'].branchData['582'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['598'] = [];
  _$jscoverage['/base/style.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['599'] = [];
  _$jscoverage['/base/style.js'].branchData['599'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['600'] = [];
  _$jscoverage['/base/style.js'].branchData['600'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['601'] = [];
  _$jscoverage['/base/style.js'].branchData['601'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['603'] = [];
  _$jscoverage['/base/style.js'].branchData['603'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['604'] = [];
  _$jscoverage['/base/style.js'].branchData['604'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['608'] = [];
  _$jscoverage['/base/style.js'].branchData['608'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['608'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['608'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['612'] = [];
  _$jscoverage['/base/style.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['612'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['612'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['613'] = [];
  _$jscoverage['/base/style.js'].branchData['613'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['616'] = [];
  _$jscoverage['/base/style.js'].branchData['616'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['618'] = [];
  _$jscoverage['/base/style.js'].branchData['618'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['621'] = [];
  _$jscoverage['/base/style.js'].branchData['621'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['621'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['622'] = [];
  _$jscoverage['/base/style.js'].branchData['622'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['623'] = [];
  _$jscoverage['/base/style.js'].branchData['623'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['624'] = [];
  _$jscoverage['/base/style.js'].branchData['624'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['630'] = [];
  _$jscoverage['/base/style.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['631'] = [];
  _$jscoverage['/base/style.js'].branchData['631'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['632'] = [];
  _$jscoverage['/base/style.js'].branchData['632'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['648'] = [];
  _$jscoverage['/base/style.js'].branchData['648'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['657'] = [];
  _$jscoverage['/base/style.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['658'] = [];
  _$jscoverage['/base/style.js'].branchData['658'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['661'] = [];
  _$jscoverage['/base/style.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['662'] = [];
  _$jscoverage['/base/style.js'].branchData['662'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['673'] = [];
  _$jscoverage['/base/style.js'].branchData['673'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['673'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['674'] = [];
  _$jscoverage['/base/style.js'].branchData['674'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['674'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['675'] = [];
  _$jscoverage['/base/style.js'].branchData['675'][1] = new BranchData();
}
_$jscoverage['/base/style.js'].branchData['675'][1].init(52, 46, 'Dom.css(offsetParent, \'position\') === \'static\'');
function visit520_675_1(result) {
  _$jscoverage['/base/style.js'].branchData['675'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['674'][2].init(110, 99, '!ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit519_674_2(result) {
  _$jscoverage['/base/style.js'].branchData['674'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['674'][1].init(94, 115, 'offsetParent && !ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit518_674_1(result) {
  _$jscoverage['/base/style.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['673'][2].init(48, 23, 'el.ownerDocument || doc');
function visit517_673_2(result) {
  _$jscoverage['/base/style.js'].branchData['673'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['673'][1].init(28, 49, 'el.offsetParent || (el.ownerDocument || doc).body');
function visit516_673_1(result) {
  _$jscoverage['/base/style.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['662'][1].init(806, 42, 'parseFloat(Dom.css(el, \'marginLeft\')) || 0');
function visit515_662_1(result) {
  _$jscoverage['/base/style.js'].branchData['662'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['661'][1].init(740, 41, 'parseFloat(Dom.css(el, \'marginTop\')) || 0');
function visit514_661_1(result) {
  _$jscoverage['/base/style.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['658'][1].init(438, 57, 'parseFloat(Dom.css(offsetParent, \'borderLeftWidth\')) || 0');
function visit513_658_1(result) {
  _$jscoverage['/base/style.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['657'][1].init(347, 56, 'parseFloat(Dom.css(offsetParent, \'borderTopWidth\')) || 0');
function visit512_657_1(result) {
  _$jscoverage['/base/style.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['648'][1].init(106, 35, 'Dom.css(el, \'position\') === \'fixed\'');
function visit511_648_1(result) {
  _$jscoverage['/base/style.js'].branchData['648'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['632'][1].init(45, 23, 'extra === PADDING_INDEX');
function visit510_632_1(result) {
  _$jscoverage['/base/style.js'].branchData['632'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['631'][1].init(27, 22, 'extra === BORDER_INDEX');
function visit509_631_1(result) {
  _$jscoverage['/base/style.js'].branchData['631'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['630'][1].init(1597, 27, 'borderBoxValueOrIsBorderBox');
function visit508_630_1(result) {
  _$jscoverage['/base/style.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['624'][1].init(17, 27, 'borderBoxValueOrIsBorderBox');
function visit507_624_1(result) {
  _$jscoverage['/base/style.js'].branchData['624'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['623'][1].init(1319, 23, 'extra === CONTENT_INDEX');
function visit506_623_1(result) {
  _$jscoverage['/base/style.js'].branchData['623'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['622'][1].init(1276, 29, 'borderBoxValue || cssBoxValue');
function visit505_622_1(result) {
  _$jscoverage['/base/style.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['621'][2].init(1213, 28, 'borderBoxValue !== undefined');
function visit504_621_2(result) {
  _$jscoverage['/base/style.js'].branchData['621'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['621'][1].init(1213, 43, 'borderBoxValue !== undefined || isBorderBox');
function visit503_621_1(result) {
  _$jscoverage['/base/style.js'].branchData['621'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['618'][1].init(1074, 19, 'extra === undefined');
function visit502_618_1(result) {
  _$jscoverage['/base/style.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['616'][1].init(408, 28, 'parseFloat(cssBoxValue) || 0');
function visit501_616_1(result) {
  _$jscoverage['/base/style.js'].branchData['616'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['613'][1].init(31, 23, 'elem.style[name] || 0');
function visit500_613_1(result) {
  _$jscoverage['/base/style.js'].branchData['613'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['612'][3].init(228, 24, '(Number(cssBoxValue)) < 0');
function visit499_612_3(result) {
  _$jscoverage['/base/style.js'].branchData['612'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['612'][2].init(204, 19, 'cssBoxValue == null');
function visit498_612_2(result) {
  _$jscoverage['/base/style.js'].branchData['612'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['612'][1].init(204, 48, 'cssBoxValue == null || (Number(cssBoxValue)) < 0');
function visit497_612_1(result) {
  _$jscoverage['/base/style.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['608'][3].init(592, 19, 'borderBoxValue <= 0');
function visit496_608_3(result) {
  _$jscoverage['/base/style.js'].branchData['608'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['608'][2].init(566, 22, 'borderBoxValue == null');
function visit495_608_2(result) {
  _$jscoverage['/base/style.js'].branchData['608'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['608'][1].init(566, 45, 'borderBoxValue == null || borderBoxValue <= 0');
function visit494_608_1(result) {
  _$jscoverage['/base/style.js'].branchData['608'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['604'][1].init(96, 14, 'name === WIDTH');
function visit493_604_1(result) {
  _$jscoverage['/base/style.js'].branchData['604'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['603'][1].init(271, 14, 'name === WIDTH');
function visit492_603_1(result) {
  _$jscoverage['/base/style.js'].branchData['603'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['601'][1].init(20, 14, 'name === WIDTH');
function visit491_601_1(result) {
  _$jscoverage['/base/style.js'].branchData['601'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['600'][1].init(141, 19, 'elem.nodeType === 9');
function visit490_600_1(result) {
  _$jscoverage['/base/style.js'].branchData['600'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['599'][1].init(20, 14, 'name === WIDTH');
function visit489_599_1(result) {
  _$jscoverage['/base/style.js'].branchData['599'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['598'][1].init(13, 16, 'S.isWindow(elem)');
function visit488_598_1(result) {
  _$jscoverage['/base/style.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['582'][1].init(78, 15, 'doc.defaultView');
function visit487_582_1(result) {
  _$jscoverage['/base/style.js'].branchData['582'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['576'][1].init(16, 72, 'Dom._getComputedStyle(elem, \'boxSizing\', computedStyle) === \'border-box\'');
function visit486_576_1(result) {
  _$jscoverage['/base/style.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['568'][1].init(271, 68, 'parseFloat(Dom._getComputedStyle(elem, cssProp, computedStyle)) || 0');
function visit485_568_1(result) {
  _$jscoverage['/base/style.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['563'][1].init(58, 17, 'prop === \'border\'');
function visit484_563_1(result) {
  _$jscoverage['/base/style.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['561'][1].init(29, 16, 'i < which.length');
function visit483_561_1(result) {
  _$jscoverage['/base/style.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['560'][1].init(46, 4, 'prop');
function visit482_560_1(result) {
  _$jscoverage['/base/style.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['558'][1].init(56, 16, 'j < props.length');
function visit481_558_1(result) {
  _$jscoverage['/base/style.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['546'][1].init(124, 22, 'elem.offsetWidth !== 0');
function visit480_546_1(result) {
  _$jscoverage['/base/style.js'].branchData['546'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['537'][1].init(326, 17, 'ret === undefined');
function visit479_537_1(result) {
  _$jscoverage['/base/style.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['533'][1].init(33, 42, '(ret = hook.get(elem, false)) !== undefined');
function visit478_533_1(result) {
  _$jscoverage['/base/style.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['532'][3].init(103, 76, '\'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit477_532_3(result) {
  _$jscoverage['/base/style.js'].branchData['532'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['532'][2].init(95, 84, 'hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit476_532_2(result) {
  _$jscoverage['/base/style.js'].branchData['532'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['532'][1].init(93, 87, '!(hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined)');
function visit475_532_1(result) {
  _$jscoverage['/base/style.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['524'][1].init(137, 9, 'UA.webkit');
function visit474_524_1(result) {
  _$jscoverage['/base/style.js'].branchData['524'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['521'][1].init(849, 16, '!elStyle.cssText');
function visit473_521_1(result) {
  _$jscoverage['/base/style.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['517'][2].init(301, 13, 'val === EMPTY');
function visit472_517_2(result) {
  _$jscoverage['/base/style.js'].branchData['517'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['517'][1].init(301, 40, 'val === EMPTY && elStyle.removeAttribute');
function visit471_517_1(result) {
  _$jscoverage['/base/style.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['508'][1].init(385, 17, 'val !== undefined');
function visit470_508_1(result) {
  _$jscoverage['/base/style.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['505'][1].init(292, 16, 'hook && hook.set');
function visit469_505_1(result) {
  _$jscoverage['/base/style.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['501'][1].init(134, 39, '!isNaN(Number(val)) && !cssNumber[name]');
function visit468_501_1(result) {
  _$jscoverage['/base/style.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['499'][3].init(64, 13, 'val === EMPTY');
function visit467_499_3(result) {
  _$jscoverage['/base/style.js'].branchData['499'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['499'][2].init(48, 12, 'val === null');
function visit466_499_2(result) {
  _$jscoverage['/base/style.js'].branchData['499'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['499'][1].init(48, 29, 'val === null || val === EMPTY');
function visit465_499_1(result) {
  _$jscoverage['/base/style.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['497'][1].init(330, 17, 'val !== undefined');
function visit464_497_1(result) {
  _$jscoverage['/base/style.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['490'][2].init(106, 19, 'elem.nodeType === 8');
function visit463_490_2(result) {
  _$jscoverage['/base/style.js'].branchData['490'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['490'][1].init(34, 46, 'elem.nodeType === 8 || !(elStyle = elem.style)');
function visit462_490_1(result) {
  _$jscoverage['/base/style.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['489'][2].init(69, 19, 'elem.nodeType === 3');
function visit461_489_2(result) {
  _$jscoverage['/base/style.js'].branchData['489'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['489'][1].init(69, 81, 'elem.nodeType === 3 || elem.nodeType === 8 || !(elStyle = elem.style)');
function visit460_489_1(result) {
  _$jscoverage['/base/style.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['457'][1].init(501, 37, 'isAutoPosition || NO_PX_REG.test(val)');
function visit459_457_1(result) {
  _$jscoverage['/base/style.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['453'][2].init(321, 23, 'position === \'relative\'');
function visit458_453_2(result) {
  _$jscoverage['/base/style.js'].branchData['453'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['453'][1].init(303, 41, 'isAutoPosition && position === \'relative\'');
function visit457_453_1(result) {
  _$jscoverage['/base/style.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['452'][1].init(263, 14, 'val === \'auto\'');
function visit456_452_1(result) {
  _$jscoverage['/base/style.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['448'][1].init(81, 21, 'position === \'static\'');
function visit455_448_1(result) {
  _$jscoverage['/base/style.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['446'][1].init(112, 8, 'computed');
function visit454_446_1(result) {
  _$jscoverage['/base/style.js'].branchData['446'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['430'][1].init(46, 8, 'computed');
function visit453_430_1(result) {
  _$jscoverage['/base/style.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['418'][1].init(540, 53, 'elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX)');
function visit452_418_1(result) {
  _$jscoverage['/base/style.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['411'][1].init(163, 11, 'isBorderBox');
function visit451_411_1(result) {
  _$jscoverage['/base/style.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['408'][1].init(21, 4, 'elem');
function visit450_408_1(result) {
  _$jscoverage['/base/style.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['407'][1].init(59, 17, 'val !== undefined');
function visit449_407_1(result) {
  _$jscoverage['/base/style.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['403'][1].init(435, 14, 'name === WIDTH');
function visit448_403_1(result) {
  _$jscoverage['/base/style.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['401'][1].init(60, 79, 'el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX)');
function visit447_401_1(result) {
  _$jscoverage['/base/style.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['396'][1].init(60, 49, 'el && getWHIgnoreDisplay(el, name, PADDING_INDEX)');
function visit446_396_1(result) {
  _$jscoverage['/base/style.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['331'][1].init(33, 36, '!S.inArray(getNodeName(e), excludes)');
function visit445_331_1(result) {
  _$jscoverage['/base/style.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['326'][1].init(224, 5, 'UA.ie');
function visit444_326_1(result) {
  _$jscoverage['/base/style.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['324'][1].init(101, 27, 'userSelectProperty in style');
function visit443_324_1(result) {
  _$jscoverage['/base/style.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['321'][1].init(432, 6, 'j >= 0');
function visit442_321_1(result) {
  _$jscoverage['/base/style.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['318'][1].init(250, 32, 'userSelectProperty === undefined');
function visit441_318_1(result) {
  _$jscoverage['/base/style.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['298'][1].init(744, 15, 'elem.styleSheet');
function visit440_298_1(result) {
  _$jscoverage['/base/style.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['289'][1].init(489, 4, 'elem');
function visit439_289_1(result) {
  _$jscoverage['/base/style.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['284'][1].init(329, 35, 'id && (id = id.replace(\'#\', EMPTY))');
function visit438_284_1(result) {
  _$jscoverage['/base/style.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['274'][1].init(21, 26, 'typeof refWin === \'string\'');
function visit437_274_1(result) {
  _$jscoverage['/base/style.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['257'][1].init(60, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit436_257_1(result) {
  _$jscoverage['/base/style.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['255'][1].init(118, 6, 'i >= 0');
function visit435_255_1(result) {
  _$jscoverage['/base/style.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['240'][1].init(29, 3, 'old');
function visit434_240_1(result) {
  _$jscoverage['/base/style.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['239'][1].init(150, 12, 'old !== NONE');
function visit433_239_1(result) {
  _$jscoverage['/base/style.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['235'][1].init(118, 6, 'i >= 0');
function visit432_235_1(result) {
  _$jscoverage['/base/style.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['219'][1].init(201, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit431_219_1(result) {
  _$jscoverage['/base/style.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['217'][1].init(78, 36, 'Dom.data(elem, OLD_DISPLAY) || EMPTY');
function visit430_217_1(result) {
  _$jscoverage['/base/style.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['215'][1].init(172, 6, 'i >= 0');
function visit429_215_1(result) {
  _$jscoverage['/base/style.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['199'][1].init(46, 6, 'i >= 0');
function visit428_199_1(result) {
  _$jscoverage['/base/style.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['197'][1].init(482, 26, 'typeof ret === \'undefined\'');
function visit427_197_1(result) {
  _$jscoverage['/base/style.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['192'][1].init(45, 41, '(ret = hook.get(elem, true)) !== undefined');
function visit426_192_1(result) {
  _$jscoverage['/base/style.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['191'][3].init(123, 87, '\'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit425_191_3(result) {
  _$jscoverage['/base/style.js'].branchData['191'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['191'][2].init(115, 95, 'hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit424_191_2(result) {
  _$jscoverage['/base/style.js'].branchData['191'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['191'][1].init(113, 98, '!(hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined)');
function visit423_191_1(result) {
  _$jscoverage['/base/style.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['189'][1].init(114, 4, 'elem');
function visit422_189_1(result) {
  _$jscoverage['/base/style.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['186'][1].init(645, 17, 'val === undefined');
function visit421_186_1(result) {
  _$jscoverage['/base/style.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['176'][1].init(50, 6, 'i >= 0');
function visit420_176_1(result) {
  _$jscoverage['/base/style.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['174'][1].init(233, 21, 'S.isPlainObject(name)');
function visit419_174_1(result) {
  _$jscoverage['/base/style.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['150'][1].init(46, 6, 'i >= 0');
function visit418_150_1(result) {
  _$jscoverage['/base/style.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['145'][1].init(55, 4, 'elem');
function visit417_145_1(result) {
  _$jscoverage['/base/style.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['143'][1].init(493, 17, 'val === undefined');
function visit416_143_1(result) {
  _$jscoverage['/base/style.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['137'][1].init(50, 6, 'i >= 0');
function visit415_137_1(result) {
  _$jscoverage['/base/style.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['135'][1].init(187, 21, 'S.isPlainObject(name)');
function visit414_135_1(result) {
  _$jscoverage['/base/style.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['103'][1].init(758, 51, 'Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)');
function visit413_103_1(result) {
  _$jscoverage['/base/style.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['98'][2].init(575, 10, 'val === \'\'');
function visit412_98_2(result) {
  _$jscoverage['/base/style.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['98'][1].init(575, 36, 'val === \'\' && !Dom.contains(d, elem)');
function visit411_98_1(result) {
  _$jscoverage['/base/style.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['94'][1].init(27, 59, 'computedStyle.getPropertyValue(name) || computedStyle[name]');
function visit410_94_1(result) {
  _$jscoverage['/base/style.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['93'][1].init(344, 59, 'computedStyle || d.defaultView.getComputedStyle(elem, null)');
function visit409_93_1(result) {
  _$jscoverage['/base/style.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['59'][1].init(20, 31, 'doc.body || doc.documentElement');
function visit408_59_1(result) {
  _$jscoverage['/base/style.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['58'][1].init(101, 26, '!defaultDisplay[tagName]');
function visit407_58_1(result) {
  _$jscoverage['/base/style.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['51'][2].init(136, 29, 'vendor && vendor.propertyName');
function visit406_51_2(result) {
  _$jscoverage['/base/style.js'].branchData['51'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['51'][1].init(136, 37, 'vendor && vendor.propertyName || name');
function visit405_51_1(result) {
  _$jscoverage['/base/style.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['47'][1].init(13, 14, 'cssProps[name]');
function visit404_47_1(result) {
  _$jscoverage['/base/style.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['18'][1].init(315, 27, 'globalWindow.document || {}');
function visit403_18_1(result) {
  _$jscoverage['/base/style.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/style.js'].functionData[0]++;
  _$jscoverage['/base/style.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/style.js'].lineData[8]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/base/style.js'].lineData[9]++;
  var globalWindow = S.Env.host, getCssVendorInfo = S.Feature.getCssVendorInfo, UA = S.UA, BOX_MODELS = ['margin', 'border', 'padding'], CONTENT_INDEX = -1, PADDING_INDEX = 2, BORDER_INDEX = 1, MARGIN_INDEX = 0, getNodeName = Dom.nodeName, doc = visit403_18_1(globalWindow.document || {}), RE_MARGIN = /^margin/, WIDTH = 'width', HEIGHT = 'height', DISPLAY = 'display', OLD_DISPLAY = DISPLAY + S.now(), NONE = 'none', cssNumber = {
  fillOpacity: 1, 
  fontWeight: 1, 
  lineHeight: 1, 
  opacity: 1, 
  orphans: 1, 
  widows: 1, 
  zIndex: 1, 
  zoom: 1}, EMPTY = '', DEFAULT_UNIT = 'px', NO_PX_REG = /\d(?!px)[a-z%]+$/i, cssHooks = {}, cssProps = {}, userSelectProperty, defaultDisplay = {}, camelCase = S.camelCase;
  _$jscoverage['/base/style.js'].lineData[44]++;
  cssProps['float'] = 'cssFloat';
  _$jscoverage['/base/style.js'].lineData[46]++;
  function normalizeCssPropName(name) {
    _$jscoverage['/base/style.js'].functionData[1]++;
    _$jscoverage['/base/style.js'].lineData[47]++;
    if (visit404_47_1(cssProps[name])) {
      _$jscoverage['/base/style.js'].lineData[48]++;
      return cssProps[name];
    }
    _$jscoverage['/base/style.js'].lineData[50]++;
    var vendor = getCssVendorInfo(name);
    _$jscoverage['/base/style.js'].lineData[51]++;
    return visit405_51_1(visit406_51_2(vendor && vendor.propertyName) || name);
  }
  _$jscoverage['/base/style.js'].lineData[54]++;
  function getDefaultDisplay(tagName) {
    _$jscoverage['/base/style.js'].functionData[2]++;
    _$jscoverage['/base/style.js'].lineData[55]++;
    var body, oldDisplay = defaultDisplay[tagName], elem;
    _$jscoverage['/base/style.js'].lineData[58]++;
    if (visit407_58_1(!defaultDisplay[tagName])) {
      _$jscoverage['/base/style.js'].lineData[59]++;
      body = visit408_59_1(doc.body || doc.documentElement);
      _$jscoverage['/base/style.js'].lineData[60]++;
      elem = doc.createElement(tagName);
      _$jscoverage['/base/style.js'].lineData[62]++;
      Dom.prepend(elem, body);
      _$jscoverage['/base/style.js'].lineData[63]++;
      oldDisplay = Dom.css(elem, 'display');
      _$jscoverage['/base/style.js'].lineData[64]++;
      body.removeChild(elem);
      _$jscoverage['/base/style.js'].lineData[66]++;
      defaultDisplay[tagName] = oldDisplay;
    }
    _$jscoverage['/base/style.js'].lineData[68]++;
    return oldDisplay;
  }
  _$jscoverage['/base/style.js'].lineData[71]++;
  S.mix(Dom, {
  _cssHooks: cssHooks, 
  _cssProps: cssProps, 
  _getComputedStyle: function(elem, name, computedStyle) {
  _$jscoverage['/base/style.js'].functionData[3]++;
  _$jscoverage['/base/style.js'].lineData[83]++;
  var val = '', width, minWidth, maxWidth, style, d = elem.ownerDocument;
  _$jscoverage['/base/style.js'].lineData[90]++;
  name = normalizeCssPropName(name);
  _$jscoverage['/base/style.js'].lineData[93]++;
  if ((computedStyle = (visit409_93_1(computedStyle || d.defaultView.getComputedStyle(elem, null))))) {
    _$jscoverage['/base/style.js'].lineData[94]++;
    val = visit410_94_1(computedStyle.getPropertyValue(name) || computedStyle[name]);
  }
  _$jscoverage['/base/style.js'].lineData[98]++;
  if (visit411_98_1(visit412_98_2(val === '') && !Dom.contains(d, elem))) {
    _$jscoverage['/base/style.js'].lineData[99]++;
    val = elem.style[name];
  }
  _$jscoverage['/base/style.js'].lineData[103]++;
  if (visit413_103_1(Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name))) {
    _$jscoverage['/base/style.js'].lineData[104]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[105]++;
    width = style.width;
    _$jscoverage['/base/style.js'].lineData[106]++;
    minWidth = style.minWidth;
    _$jscoverage['/base/style.js'].lineData[107]++;
    maxWidth = style.maxWidth;
    _$jscoverage['/base/style.js'].lineData[109]++;
    style.minWidth = style.maxWidth = style.width = val;
    _$jscoverage['/base/style.js'].lineData[110]++;
    val = computedStyle.width;
    _$jscoverage['/base/style.js'].lineData[112]++;
    style.width = width;
    _$jscoverage['/base/style.js'].lineData[113]++;
    style.minWidth = minWidth;
    _$jscoverage['/base/style.js'].lineData[114]++;
    style.maxWidth = maxWidth;
  }
  _$jscoverage['/base/style.js'].lineData[117]++;
  return val;
}, 
  style: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[4]++;
  _$jscoverage['/base/style.js'].lineData[130]++;
  var els = Dom.query(selector), k, ret, elem = els[0], i;
  _$jscoverage['/base/style.js'].lineData[135]++;
  if (visit414_135_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[136]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[137]++;
      for (i = els.length - 1; visit415_137_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[138]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[141]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[143]++;
  if (visit416_143_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[144]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[145]++;
    if (visit417_145_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[146]++;
      ret = style(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[148]++;
    return ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[150]++;
    for (i = els.length - 1; visit418_150_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[151]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[154]++;
  return undefined;
}, 
  css: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[5]++;
  _$jscoverage['/base/style.js'].lineData[167]++;
  var els = Dom.query(selector), elem = els[0], k, hook, ret, i;
  _$jscoverage['/base/style.js'].lineData[174]++;
  if (visit419_174_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[175]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[176]++;
      for (i = els.length - 1; visit420_176_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[177]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[180]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[183]++;
  name = camelCase(name);
  _$jscoverage['/base/style.js'].lineData[184]++;
  hook = cssHooks[name];
  _$jscoverage['/base/style.js'].lineData[186]++;
  if (visit421_186_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[188]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[189]++;
    if (visit422_189_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[191]++;
      if (visit423_191_1(!(visit424_191_2(hook && visit425_191_3('get' in hook && visit426_192_1((ret = hook.get(elem, true)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[194]++;
        ret = Dom._getComputedStyle(elem, name);
      }
    }
    _$jscoverage['/base/style.js'].lineData[197]++;
    return (visit427_197_1(typeof ret === 'undefined')) ? '' : ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[199]++;
    for (i = els.length - 1; visit428_199_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[200]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[203]++;
  return undefined;
}, 
  show: function(selector) {
  _$jscoverage['/base/style.js'].functionData[6]++;
  _$jscoverage['/base/style.js'].lineData[211]++;
  var els = Dom.query(selector), tagName, old, elem, i;
  _$jscoverage['/base/style.js'].lineData[215]++;
  for (i = els.length - 1; visit429_215_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[216]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[217]++;
    elem.style[DISPLAY] = visit430_217_1(Dom.data(elem, OLD_DISPLAY) || EMPTY);
    _$jscoverage['/base/style.js'].lineData[219]++;
    if (visit431_219_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[220]++;
      tagName = elem.tagName.toLowerCase();
      _$jscoverage['/base/style.js'].lineData[221]++;
      old = getDefaultDisplay(tagName);
      _$jscoverage['/base/style.js'].lineData[222]++;
      Dom.data(elem, OLD_DISPLAY, old);
      _$jscoverage['/base/style.js'].lineData[223]++;
      elem.style[DISPLAY] = old;
    }
  }
}, 
  hide: function(selector) {
  _$jscoverage['/base/style.js'].functionData[7]++;
  _$jscoverage['/base/style.js'].lineData[233]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[235]++;
  for (i = els.length - 1; visit432_235_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[236]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[237]++;
    var style = elem.style, old = style[DISPLAY];
    _$jscoverage['/base/style.js'].lineData[239]++;
    if (visit433_239_1(old !== NONE)) {
      _$jscoverage['/base/style.js'].lineData[240]++;
      if (visit434_240_1(old)) {
        _$jscoverage['/base/style.js'].lineData[241]++;
        Dom.data(elem, OLD_DISPLAY, old);
      }
      _$jscoverage['/base/style.js'].lineData[243]++;
      style[DISPLAY] = NONE;
    }
  }
}, 
  toggle: function(selector) {
  _$jscoverage['/base/style.js'].functionData[8]++;
  _$jscoverage['/base/style.js'].lineData[253]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[255]++;
  for (i = els.length - 1; visit435_255_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[256]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[257]++;
    if (visit436_257_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[258]++;
      Dom.show(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[260]++;
      Dom.hide(elem);
    }
  }
}, 
  addStyleSheet: function(refWin, cssText, id) {
  _$jscoverage['/base/style.js'].functionData[9]++;
  _$jscoverage['/base/style.js'].lineData[274]++;
  if (visit437_274_1(typeof refWin === 'string')) {
    _$jscoverage['/base/style.js'].lineData[275]++;
    id = cssText;
    _$jscoverage['/base/style.js'].lineData[276]++;
    cssText = refWin;
    _$jscoverage['/base/style.js'].lineData[278]++;
    refWin = globalWindow;
  }
  _$jscoverage['/base/style.js'].lineData[281]++;
  var doc = Dom.getDocument(refWin), elem;
  _$jscoverage['/base/style.js'].lineData[284]++;
  if (visit438_284_1(id && (id = id.replace('#', EMPTY)))) {
    _$jscoverage['/base/style.js'].lineData[285]++;
    elem = Dom.get('#' + id, doc);
  }
  _$jscoverage['/base/style.js'].lineData[289]++;
  if (visit439_289_1(elem)) {
    _$jscoverage['/base/style.js'].lineData[290]++;
    return;
  }
  _$jscoverage['/base/style.js'].lineData[293]++;
  elem = Dom.create('<style>', {
  id: id}, doc);
  _$jscoverage['/base/style.js'].lineData[296]++;
  Dom.get('head', doc).appendChild(elem);
  _$jscoverage['/base/style.js'].lineData[298]++;
  if (visit440_298_1(elem.styleSheet)) {
    _$jscoverage['/base/style.js'].lineData[299]++;
    elem.styleSheet.cssText = cssText;
  } else {
    _$jscoverage['/base/style.js'].lineData[301]++;
    elem.appendChild(doc.createTextNode(cssText));
  }
}, 
  unselectable: function(selector) {
  _$jscoverage['/base/style.js'].functionData[10]++;
  _$jscoverage['/base/style.js'].lineData[310]++;
  var _els = Dom.query(selector), elem, j, e, i = 0, excludes, style, els;
  _$jscoverage['/base/style.js'].lineData[318]++;
  if (visit441_318_1(userSelectProperty === undefined)) {
    _$jscoverage['/base/style.js'].lineData[319]++;
    userSelectProperty = getCssVendorInfo('userSelect').propertyName;
  }
  _$jscoverage['/base/style.js'].lineData[321]++;
  for (j = _els.length - 1; visit442_321_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[322]++;
    elem = _els[j];
    _$jscoverage['/base/style.js'].lineData[323]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[324]++;
    if (visit443_324_1(userSelectProperty in style)) {
      _$jscoverage['/base/style.js'].lineData[325]++;
      style[userSelectProperty] = 'none';
    } else {
      _$jscoverage['/base/style.js'].lineData[326]++;
      if (visit444_326_1(UA.ie)) {
        _$jscoverage['/base/style.js'].lineData[327]++;
        els = elem.getElementsByTagName('*');
        _$jscoverage['/base/style.js'].lineData[328]++;
        elem.setAttribute('unselectable', 'on');
        _$jscoverage['/base/style.js'].lineData[329]++;
        excludes = ['iframe', 'textarea', 'input', 'select'];
        _$jscoverage['/base/style.js'].lineData[330]++;
        while ((e = els[i++])) {
          _$jscoverage['/base/style.js'].lineData[331]++;
          if (visit445_331_1(!S.inArray(getNodeName(e), excludes))) {
            _$jscoverage['/base/style.js'].lineData[332]++;
            e.setAttribute('unselectable', 'on');
          }
        }
      }
    }
  }
}, 
  innerWidth: 0, 
  innerHeight: 0, 
  outerWidth: 0, 
  outerHeight: 0, 
  width: 0, 
  height: 0});
  _$jscoverage['/base/style.js'].lineData[393]++;
  S.each([WIDTH, HEIGHT], function(name) {
  _$jscoverage['/base/style.js'].functionData[11]++;
  _$jscoverage['/base/style.js'].lineData[394]++;
  Dom['inner' + S.ucfirst(name)] = function(selector) {
  _$jscoverage['/base/style.js'].functionData[12]++;
  _$jscoverage['/base/style.js'].lineData[395]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[396]++;
  return visit446_396_1(el && getWHIgnoreDisplay(el, name, PADDING_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[399]++;
  Dom['outer' + S.ucfirst(name)] = function(selector, includeMargin) {
  _$jscoverage['/base/style.js'].functionData[13]++;
  _$jscoverage['/base/style.js'].lineData[400]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[401]++;
  return visit447_401_1(el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[403]++;
  var which = visit448_403_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'];
  _$jscoverage['/base/style.js'].lineData[405]++;
  Dom[name] = function(selector, val) {
  _$jscoverage['/base/style.js'].functionData[14]++;
  _$jscoverage['/base/style.js'].lineData[406]++;
  var elem = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[407]++;
  if (visit449_407_1(val !== undefined)) {
    _$jscoverage['/base/style.js'].lineData[408]++;
    if (visit450_408_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[409]++;
      var computedStyle = getComputedStyle(elem);
      _$jscoverage['/base/style.js'].lineData[410]++;
      var isBorderBox = isBorderBoxFn(elem, computedStyle);
      _$jscoverage['/base/style.js'].lineData[411]++;
      if (visit451_411_1(isBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[412]++;
        val += getPBMWidth(elem, ['padding', 'border'], which, computedStyle);
      }
      _$jscoverage['/base/style.js'].lineData[414]++;
      return Dom.css(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[416]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[418]++;
  return visit452_418_1(elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[424]++;
  cssHooks[name] = {
  get: function(elem, computed) {
  _$jscoverage['/base/style.js'].functionData[15]++;
  _$jscoverage['/base/style.js'].lineData[429]++;
  var val;
  _$jscoverage['/base/style.js'].lineData[430]++;
  if (visit453_430_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[431]++;
    val = getWHIgnoreDisplay(elem, name) + 'px';
  }
  _$jscoverage['/base/style.js'].lineData[433]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[438]++;
  var cssShow = {
  position: 'absolute', 
  visibility: 'hidden', 
  display: 'block'};
  _$jscoverage['/base/style.js'].lineData[440]++;
  S.each(['left', 'top'], function(name) {
  _$jscoverage['/base/style.js'].functionData[16]++;
  _$jscoverage['/base/style.js'].lineData[441]++;
  cssHooks[name] = {
  get: function(el, computed) {
  _$jscoverage['/base/style.js'].functionData[17]++;
  _$jscoverage['/base/style.js'].lineData[443]++;
  var val, isAutoPosition, position;
  _$jscoverage['/base/style.js'].lineData[446]++;
  if (visit454_446_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[447]++;
    position = Dom.css(el, 'position');
    _$jscoverage['/base/style.js'].lineData[448]++;
    if (visit455_448_1(position === 'static')) {
      _$jscoverage['/base/style.js'].lineData[449]++;
      return 'auto';
    }
    _$jscoverage['/base/style.js'].lineData[451]++;
    val = Dom._getComputedStyle(el, name);
    _$jscoverage['/base/style.js'].lineData[452]++;
    isAutoPosition = visit456_452_1(val === 'auto');
    _$jscoverage['/base/style.js'].lineData[453]++;
    if (visit457_453_1(isAutoPosition && visit458_453_2(position === 'relative'))) {
      _$jscoverage['/base/style.js'].lineData[454]++;
      return '0px';
    }
    _$jscoverage['/base/style.js'].lineData[457]++;
    if (visit459_457_1(isAutoPosition || NO_PX_REG.test(val))) {
      _$jscoverage['/base/style.js'].lineData[458]++;
      val = getPosition(el)[name] + 'px';
    }
  }
  _$jscoverage['/base/style.js'].lineData[461]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[466]++;
  function swap(elem, options, callback) {
    _$jscoverage['/base/style.js'].functionData[18]++;
    _$jscoverage['/base/style.js'].lineData[467]++;
    var old = {}, style = elem.style, name;
    _$jscoverage['/base/style.js'].lineData[472]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[473]++;
      old[name] = style[name];
      _$jscoverage['/base/style.js'].lineData[474]++;
      style[name] = options[name];
    }
    _$jscoverage['/base/style.js'].lineData[477]++;
    callback.call(elem);
    _$jscoverage['/base/style.js'].lineData[480]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[481]++;
      style[name] = old[name];
    }
  }
  _$jscoverage['/base/style.js'].lineData[485]++;
  function style(elem, name, val) {
    _$jscoverage['/base/style.js'].functionData[19]++;
    _$jscoverage['/base/style.js'].lineData[486]++;
    var elStyle, ret, hook;
    _$jscoverage['/base/style.js'].lineData[489]++;
    if (visit460_489_1(visit461_489_2(elem.nodeType === 3) || visit462_490_1(visit463_490_2(elem.nodeType === 8) || !(elStyle = elem.style)))) {
      _$jscoverage['/base/style.js'].lineData[491]++;
      return undefined;
    }
    _$jscoverage['/base/style.js'].lineData[493]++;
    name = camelCase(name);
    _$jscoverage['/base/style.js'].lineData[494]++;
    hook = cssHooks[name];
    _$jscoverage['/base/style.js'].lineData[495]++;
    name = normalizeCssPropName(name);
    _$jscoverage['/base/style.js'].lineData[497]++;
    if (visit464_497_1(val !== undefined)) {
      _$jscoverage['/base/style.js'].lineData[499]++;
      if (visit465_499_1(visit466_499_2(val === null) || visit467_499_3(val === EMPTY))) {
        _$jscoverage['/base/style.js'].lineData[500]++;
        val = EMPTY;
      } else {
        _$jscoverage['/base/style.js'].lineData[501]++;
        if (visit468_501_1(!isNaN(Number(val)) && !cssNumber[name])) {
          _$jscoverage['/base/style.js'].lineData[503]++;
          val += DEFAULT_UNIT;
        }
      }
      _$jscoverage['/base/style.js'].lineData[505]++;
      if (visit469_505_1(hook && hook.set)) {
        _$jscoverage['/base/style.js'].lineData[506]++;
        val = hook.set(elem, val);
      }
      _$jscoverage['/base/style.js'].lineData[508]++;
      if (visit470_508_1(val !== undefined)) {
        _$jscoverage['/base/style.js'].lineData[510]++;
        try {
          _$jscoverage['/base/style.js'].lineData[512]++;
          elStyle[name] = val;
        }        catch (e) {
  _$jscoverage['/base/style.js'].lineData[514]++;
  logger.warn('css set error:' + e);
}
        _$jscoverage['/base/style.js'].lineData[517]++;
        if (visit471_517_1(visit472_517_2(val === EMPTY) && elStyle.removeAttribute)) {
          _$jscoverage['/base/style.js'].lineData[518]++;
          elStyle.removeAttribute(name);
        }
      }
      _$jscoverage['/base/style.js'].lineData[521]++;
      if (visit473_521_1(!elStyle.cssText)) {
        _$jscoverage['/base/style.js'].lineData[524]++;
        if (visit474_524_1(UA.webkit)) {
          _$jscoverage['/base/style.js'].lineData[525]++;
          elStyle = elem.outerHTML;
        }
        _$jscoverage['/base/style.js'].lineData[527]++;
        elem.removeAttribute('style');
      }
      _$jscoverage['/base/style.js'].lineData[529]++;
      return undefined;
    } else {
      _$jscoverage['/base/style.js'].lineData[532]++;
      if (visit475_532_1(!(visit476_532_2(hook && visit477_532_3('get' in hook && visit478_533_1((ret = hook.get(elem, false)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[535]++;
        ret = elStyle[name];
      }
      _$jscoverage['/base/style.js'].lineData[537]++;
      return visit479_537_1(ret === undefined) ? '' : ret;
    }
  }
  _$jscoverage['/base/style.js'].lineData[542]++;
  function getWHIgnoreDisplay(elem) {
    _$jscoverage['/base/style.js'].functionData[20]++;
    _$jscoverage['/base/style.js'].lineData[543]++;
    var val, args = arguments;
    _$jscoverage['/base/style.js'].lineData[546]++;
    if (visit480_546_1(elem.offsetWidth !== 0)) {
      _$jscoverage['/base/style.js'].lineData[547]++;
      val = getWH.apply(undefined, args);
    } else {
      _$jscoverage['/base/style.js'].lineData[549]++;
      swap(elem, cssShow, function() {
  _$jscoverage['/base/style.js'].functionData[21]++;
  _$jscoverage['/base/style.js'].lineData[550]++;
  val = getWH.apply(undefined, args);
});
    }
    _$jscoverage['/base/style.js'].lineData[553]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[556]++;
  function getPBMWidth(elem, props, which, computedStyle) {
    _$jscoverage['/base/style.js'].functionData[22]++;
    _$jscoverage['/base/style.js'].lineData[557]++;
    var value = 0, prop, j, i;
    _$jscoverage['/base/style.js'].lineData[558]++;
    for (j = 0; visit481_558_1(j < props.length); j++) {
      _$jscoverage['/base/style.js'].lineData[559]++;
      prop = props[j];
      _$jscoverage['/base/style.js'].lineData[560]++;
      if (visit482_560_1(prop)) {
        _$jscoverage['/base/style.js'].lineData[561]++;
        for (i = 0; visit483_561_1(i < which.length); i++) {
          _$jscoverage['/base/style.js'].lineData[562]++;
          var cssProp;
          _$jscoverage['/base/style.js'].lineData[563]++;
          if (visit484_563_1(prop === 'border')) {
            _$jscoverage['/base/style.js'].lineData[564]++;
            cssProp = prop + which[i] + 'Width';
          } else {
            _$jscoverage['/base/style.js'].lineData[566]++;
            cssProp = prop + which[i];
          }
          _$jscoverage['/base/style.js'].lineData[568]++;
          value += visit485_568_1(parseFloat(Dom._getComputedStyle(elem, cssProp, computedStyle)) || 0);
        }
      }
    }
    _$jscoverage['/base/style.js'].lineData[572]++;
    return value;
  }
  _$jscoverage['/base/style.js'].lineData[575]++;
  function isBorderBoxFn(elem, computedStyle) {
    _$jscoverage['/base/style.js'].functionData[23]++;
    _$jscoverage['/base/style.js'].lineData[576]++;
    return visit486_576_1(Dom._getComputedStyle(elem, 'boxSizing', computedStyle) === 'border-box');
  }
  _$jscoverage['/base/style.js'].lineData[579]++;
  function getComputedStyle(elem) {
    _$jscoverage['/base/style.js'].functionData[24]++;
    _$jscoverage['/base/style.js'].lineData[580]++;
    var doc = elem.ownerDocument, computedStyle;
    _$jscoverage['/base/style.js'].lineData[582]++;
    if (visit487_582_1(doc.defaultView)) {
      _$jscoverage['/base/style.js'].lineData[584]++;
      computedStyle = doc.defaultView.getComputedStyle(elem, null);
    }
    _$jscoverage['/base/style.js'].lineData[586]++;
    return computedStyle;
  }
  _$jscoverage['/base/style.js'].lineData[597]++;
  function getWH(elem, name, extra) {
    _$jscoverage['/base/style.js'].functionData[25]++;
    _$jscoverage['/base/style.js'].lineData[598]++;
    if (visit488_598_1(S.isWindow(elem))) {
      _$jscoverage['/base/style.js'].lineData[599]++;
      return visit489_599_1(name === WIDTH) ? Dom.viewportWidth(elem) : Dom.viewportHeight(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[600]++;
      if (visit490_600_1(elem.nodeType === 9)) {
        _$jscoverage['/base/style.js'].lineData[601]++;
        return visit491_601_1(name === WIDTH) ? Dom.docWidth(elem) : Dom.docHeight(elem);
      }
    }
    _$jscoverage['/base/style.js'].lineData[603]++;
    var which = visit492_603_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'], borderBoxValue = visit493_604_1(name === WIDTH) ? elem.offsetWidth : elem.offsetHeight;
    _$jscoverage['/base/style.js'].lineData[605]++;
    var computedStyle = getComputedStyle(elem);
    _$jscoverage['/base/style.js'].lineData[606]++;
    var isBorderBox = isBorderBoxFn(elem, computedStyle);
    _$jscoverage['/base/style.js'].lineData[607]++;
    var cssBoxValue = 0;
    _$jscoverage['/base/style.js'].lineData[608]++;
    if (visit494_608_1(visit495_608_2(borderBoxValue == null) || visit496_608_3(borderBoxValue <= 0))) {
      _$jscoverage['/base/style.js'].lineData[609]++;
      borderBoxValue = undefined;
      _$jscoverage['/base/style.js'].lineData[611]++;
      cssBoxValue = Dom._getComputedStyle(elem, name, computedStyle);
      _$jscoverage['/base/style.js'].lineData[612]++;
      if (visit497_612_1(visit498_612_2(cssBoxValue == null) || visit499_612_3((Number(cssBoxValue)) < 0))) {
        _$jscoverage['/base/style.js'].lineData[613]++;
        cssBoxValue = visit500_613_1(elem.style[name] || 0);
      }
      _$jscoverage['/base/style.js'].lineData[616]++;
      cssBoxValue = visit501_616_1(parseFloat(cssBoxValue) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[618]++;
    if (visit502_618_1(extra === undefined)) {
      _$jscoverage['/base/style.js'].lineData[619]++;
      extra = isBorderBox ? BORDER_INDEX : CONTENT_INDEX;
    }
    _$jscoverage['/base/style.js'].lineData[621]++;
    var borderBoxValueOrIsBorderBox = visit503_621_1(visit504_621_2(borderBoxValue !== undefined) || isBorderBox);
    _$jscoverage['/base/style.js'].lineData[622]++;
    var val = visit505_622_1(borderBoxValue || cssBoxValue);
    _$jscoverage['/base/style.js'].lineData[623]++;
    if (visit506_623_1(extra === CONTENT_INDEX)) {
      _$jscoverage['/base/style.js'].lineData[624]++;
      if (visit507_624_1(borderBoxValueOrIsBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[625]++;
        return val - getPBMWidth(elem, ['border', 'padding'], which, computedStyle);
      } else {
        _$jscoverage['/base/style.js'].lineData[628]++;
        return cssBoxValue;
      }
    } else {
      _$jscoverage['/base/style.js'].lineData[630]++;
      if (visit508_630_1(borderBoxValueOrIsBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[631]++;
        return val + (visit509_631_1(extra === BORDER_INDEX) ? 0 : (visit510_632_1(extra === PADDING_INDEX) ? -getPBMWidth(elem, ['border'], which, computedStyle) : getPBMWidth(elem, ['margin'], which, computedStyle)));
      } else {
        _$jscoverage['/base/style.js'].lineData[636]++;
        return cssBoxValue + getPBMWidth(elem, BOX_MODELS.slice(extra), which, computedStyle);
      }
    }
  }
  _$jscoverage['/base/style.js'].lineData[641]++;
  var ROOT_REG = /^(?:body|html)$/i;
  _$jscoverage['/base/style.js'].lineData[643]++;
  function getPosition(el) {
    _$jscoverage['/base/style.js'].functionData[26]++;
    _$jscoverage['/base/style.js'].lineData[644]++;
    var offsetParent, offset, parentOffset = {
  top: 0, 
  left: 0};
    _$jscoverage['/base/style.js'].lineData[648]++;
    if (visit511_648_1(Dom.css(el, 'position') === 'fixed')) {
      _$jscoverage['/base/style.js'].lineData[649]++;
      offset = el.getBoundingClientRect();
    } else {
      _$jscoverage['/base/style.js'].lineData[654]++;
      offsetParent = getOffsetParent(el);
      _$jscoverage['/base/style.js'].lineData[655]++;
      offset = Dom.offset(el);
      _$jscoverage['/base/style.js'].lineData[656]++;
      parentOffset = Dom.offset(offsetParent);
      _$jscoverage['/base/style.js'].lineData[657]++;
      parentOffset.top += visit512_657_1(parseFloat(Dom.css(offsetParent, 'borderTopWidth')) || 0);
      _$jscoverage['/base/style.js'].lineData[658]++;
      parentOffset.left += visit513_658_1(parseFloat(Dom.css(offsetParent, 'borderLeftWidth')) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[661]++;
    offset.top -= visit514_661_1(parseFloat(Dom.css(el, 'marginTop')) || 0);
    _$jscoverage['/base/style.js'].lineData[662]++;
    offset.left -= visit515_662_1(parseFloat(Dom.css(el, 'marginLeft')) || 0);
    _$jscoverage['/base/style.js'].lineData[666]++;
    return {
  top: offset.top - parentOffset.top, 
  left: offset.left - parentOffset.left};
  }
  _$jscoverage['/base/style.js'].lineData[672]++;
  function getOffsetParent(el) {
    _$jscoverage['/base/style.js'].functionData[27]++;
    _$jscoverage['/base/style.js'].lineData[673]++;
    var offsetParent = visit516_673_1(el.offsetParent || (visit517_673_2(el.ownerDocument || doc)).body);
    _$jscoverage['/base/style.js'].lineData[674]++;
    while (visit518_674_1(offsetParent && visit519_674_2(!ROOT_REG.test(offsetParent.nodeName) && visit520_675_1(Dom.css(offsetParent, 'position') === 'static')))) {
      _$jscoverage['/base/style.js'].lineData[676]++;
      offsetParent = offsetParent.offsetParent;
    }
    _$jscoverage['/base/style.js'].lineData[678]++;
    return offsetParent;
  }
  _$jscoverage['/base/style.js'].lineData[681]++;
  return Dom;
});
