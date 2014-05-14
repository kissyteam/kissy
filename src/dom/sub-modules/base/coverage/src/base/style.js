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
  _$jscoverage['/base/style.js'].lineData[10] = 0;
  _$jscoverage['/base/style.js'].lineData[46] = 0;
  _$jscoverage['/base/style.js'].lineData[48] = 0;
  _$jscoverage['/base/style.js'].lineData[49] = 0;
  _$jscoverage['/base/style.js'].lineData[50] = 0;
  _$jscoverage['/base/style.js'].lineData[52] = 0;
  _$jscoverage['/base/style.js'].lineData[53] = 0;
  _$jscoverage['/base/style.js'].lineData[56] = 0;
  _$jscoverage['/base/style.js'].lineData[57] = 0;
  _$jscoverage['/base/style.js'].lineData[60] = 0;
  _$jscoverage['/base/style.js'].lineData[61] = 0;
  _$jscoverage['/base/style.js'].lineData[62] = 0;
  _$jscoverage['/base/style.js'].lineData[64] = 0;
  _$jscoverage['/base/style.js'].lineData[65] = 0;
  _$jscoverage['/base/style.js'].lineData[66] = 0;
  _$jscoverage['/base/style.js'].lineData[68] = 0;
  _$jscoverage['/base/style.js'].lineData[70] = 0;
  _$jscoverage['/base/style.js'].lineData[73] = 0;
  _$jscoverage['/base/style.js'].lineData[85] = 0;
  _$jscoverage['/base/style.js'].lineData[92] = 0;
  _$jscoverage['/base/style.js'].lineData[95] = 0;
  _$jscoverage['/base/style.js'].lineData[96] = 0;
  _$jscoverage['/base/style.js'].lineData[100] = 0;
  _$jscoverage['/base/style.js'].lineData[101] = 0;
  _$jscoverage['/base/style.js'].lineData[105] = 0;
  _$jscoverage['/base/style.js'].lineData[106] = 0;
  _$jscoverage['/base/style.js'].lineData[107] = 0;
  _$jscoverage['/base/style.js'].lineData[108] = 0;
  _$jscoverage['/base/style.js'].lineData[109] = 0;
  _$jscoverage['/base/style.js'].lineData[111] = 0;
  _$jscoverage['/base/style.js'].lineData[112] = 0;
  _$jscoverage['/base/style.js'].lineData[114] = 0;
  _$jscoverage['/base/style.js'].lineData[115] = 0;
  _$jscoverage['/base/style.js'].lineData[116] = 0;
  _$jscoverage['/base/style.js'].lineData[119] = 0;
  _$jscoverage['/base/style.js'].lineData[132] = 0;
  _$jscoverage['/base/style.js'].lineData[137] = 0;
  _$jscoverage['/base/style.js'].lineData[138] = 0;
  _$jscoverage['/base/style.js'].lineData[139] = 0;
  _$jscoverage['/base/style.js'].lineData[140] = 0;
  _$jscoverage['/base/style.js'].lineData[143] = 0;
  _$jscoverage['/base/style.js'].lineData[145] = 0;
  _$jscoverage['/base/style.js'].lineData[146] = 0;
  _$jscoverage['/base/style.js'].lineData[147] = 0;
  _$jscoverage['/base/style.js'].lineData[148] = 0;
  _$jscoverage['/base/style.js'].lineData[150] = 0;
  _$jscoverage['/base/style.js'].lineData[152] = 0;
  _$jscoverage['/base/style.js'].lineData[153] = 0;
  _$jscoverage['/base/style.js'].lineData[156] = 0;
  _$jscoverage['/base/style.js'].lineData[169] = 0;
  _$jscoverage['/base/style.js'].lineData[176] = 0;
  _$jscoverage['/base/style.js'].lineData[177] = 0;
  _$jscoverage['/base/style.js'].lineData[178] = 0;
  _$jscoverage['/base/style.js'].lineData[179] = 0;
  _$jscoverage['/base/style.js'].lineData[182] = 0;
  _$jscoverage['/base/style.js'].lineData[185] = 0;
  _$jscoverage['/base/style.js'].lineData[186] = 0;
  _$jscoverage['/base/style.js'].lineData[188] = 0;
  _$jscoverage['/base/style.js'].lineData[190] = 0;
  _$jscoverage['/base/style.js'].lineData[191] = 0;
  _$jscoverage['/base/style.js'].lineData[193] = 0;
  _$jscoverage['/base/style.js'].lineData[196] = 0;
  _$jscoverage['/base/style.js'].lineData[199] = 0;
  _$jscoverage['/base/style.js'].lineData[201] = 0;
  _$jscoverage['/base/style.js'].lineData[202] = 0;
  _$jscoverage['/base/style.js'].lineData[205] = 0;
  _$jscoverage['/base/style.js'].lineData[213] = 0;
  _$jscoverage['/base/style.js'].lineData[217] = 0;
  _$jscoverage['/base/style.js'].lineData[218] = 0;
  _$jscoverage['/base/style.js'].lineData[219] = 0;
  _$jscoverage['/base/style.js'].lineData[221] = 0;
  _$jscoverage['/base/style.js'].lineData[222] = 0;
  _$jscoverage['/base/style.js'].lineData[223] = 0;
  _$jscoverage['/base/style.js'].lineData[224] = 0;
  _$jscoverage['/base/style.js'].lineData[225] = 0;
  _$jscoverage['/base/style.js'].lineData[235] = 0;
  _$jscoverage['/base/style.js'].lineData[237] = 0;
  _$jscoverage['/base/style.js'].lineData[238] = 0;
  _$jscoverage['/base/style.js'].lineData[239] = 0;
  _$jscoverage['/base/style.js'].lineData[241] = 0;
  _$jscoverage['/base/style.js'].lineData[242] = 0;
  _$jscoverage['/base/style.js'].lineData[243] = 0;
  _$jscoverage['/base/style.js'].lineData[245] = 0;
  _$jscoverage['/base/style.js'].lineData[255] = 0;
  _$jscoverage['/base/style.js'].lineData[257] = 0;
  _$jscoverage['/base/style.js'].lineData[258] = 0;
  _$jscoverage['/base/style.js'].lineData[259] = 0;
  _$jscoverage['/base/style.js'].lineData[260] = 0;
  _$jscoverage['/base/style.js'].lineData[262] = 0;
  _$jscoverage['/base/style.js'].lineData[276] = 0;
  _$jscoverage['/base/style.js'].lineData[277] = 0;
  _$jscoverage['/base/style.js'].lineData[278] = 0;
  _$jscoverage['/base/style.js'].lineData[280] = 0;
  _$jscoverage['/base/style.js'].lineData[283] = 0;
  _$jscoverage['/base/style.js'].lineData[286] = 0;
  _$jscoverage['/base/style.js'].lineData[287] = 0;
  _$jscoverage['/base/style.js'].lineData[291] = 0;
  _$jscoverage['/base/style.js'].lineData[292] = 0;
  _$jscoverage['/base/style.js'].lineData[295] = 0;
  _$jscoverage['/base/style.js'].lineData[298] = 0;
  _$jscoverage['/base/style.js'].lineData[300] = 0;
  _$jscoverage['/base/style.js'].lineData[301] = 0;
  _$jscoverage['/base/style.js'].lineData[303] = 0;
  _$jscoverage['/base/style.js'].lineData[312] = 0;
  _$jscoverage['/base/style.js'].lineData[320] = 0;
  _$jscoverage['/base/style.js'].lineData[321] = 0;
  _$jscoverage['/base/style.js'].lineData[322] = 0;
  _$jscoverage['/base/style.js'].lineData[323] = 0;
  _$jscoverage['/base/style.js'].lineData[324] = 0;
  _$jscoverage['/base/style.js'].lineData[325] = 0;
  _$jscoverage['/base/style.js'].lineData[326] = 0;
  _$jscoverage['/base/style.js'].lineData[327] = 0;
  _$jscoverage['/base/style.js'].lineData[328] = 0;
  _$jscoverage['/base/style.js'].lineData[333] = 0;
  _$jscoverage['/base/style.js'].lineData[334] = 0;
  _$jscoverage['/base/style.js'].lineData[335] = 0;
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
  _$jscoverage['/base/style.js'].functionData[28] = 0;
}
if (! _$jscoverage['/base/style.js'].branchData) {
  _$jscoverage['/base/style.js'].branchData = {};
  _$jscoverage['/base/style.js'].branchData['19'] = [];
  _$jscoverage['/base/style.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['43'] = [];
  _$jscoverage['/base/style.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['49'] = [];
  _$jscoverage['/base/style.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['53'] = [];
  _$jscoverage['/base/style.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['53'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['60'] = [];
  _$jscoverage['/base/style.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['61'] = [];
  _$jscoverage['/base/style.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['95'] = [];
  _$jscoverage['/base/style.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['96'] = [];
  _$jscoverage['/base/style.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['100'] = [];
  _$jscoverage['/base/style.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['105'] = [];
  _$jscoverage['/base/style.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['137'] = [];
  _$jscoverage['/base/style.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['139'] = [];
  _$jscoverage['/base/style.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['145'] = [];
  _$jscoverage['/base/style.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['147'] = [];
  _$jscoverage['/base/style.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['152'] = [];
  _$jscoverage['/base/style.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['176'] = [];
  _$jscoverage['/base/style.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['178'] = [];
  _$jscoverage['/base/style.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['188'] = [];
  _$jscoverage['/base/style.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['191'] = [];
  _$jscoverage['/base/style.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['193'] = [];
  _$jscoverage['/base/style.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['193'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['193'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['194'] = [];
  _$jscoverage['/base/style.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['199'] = [];
  _$jscoverage['/base/style.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['201'] = [];
  _$jscoverage['/base/style.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['217'] = [];
  _$jscoverage['/base/style.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['219'] = [];
  _$jscoverage['/base/style.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['221'] = [];
  _$jscoverage['/base/style.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['237'] = [];
  _$jscoverage['/base/style.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['241'] = [];
  _$jscoverage['/base/style.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['242'] = [];
  _$jscoverage['/base/style.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['257'] = [];
  _$jscoverage['/base/style.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['259'] = [];
  _$jscoverage['/base/style.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['276'] = [];
  _$jscoverage['/base/style.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['286'] = [];
  _$jscoverage['/base/style.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['291'] = [];
  _$jscoverage['/base/style.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['300'] = [];
  _$jscoverage['/base/style.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['320'] = [];
  _$jscoverage['/base/style.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['327'] = [];
  _$jscoverage['/base/style.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['334'] = [];
  _$jscoverage['/base/style.js'].branchData['334'][1] = new BranchData();
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
_$jscoverage['/base/style.js'].branchData['675'][1].init(53, 46, 'Dom.css(offsetParent, \'position\') === \'static\'');
function visit520_675_1(result) {
  _$jscoverage['/base/style.js'].branchData['675'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['674'][2].init(112, 100, '!ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit519_674_2(result) {
  _$jscoverage['/base/style.js'].branchData['674'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['674'][1].init(96, 116, 'offsetParent && !ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit518_674_1(result) {
  _$jscoverage['/base/style.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['673'][2].init(49, 23, 'el.ownerDocument || doc');
function visit517_673_2(result) {
  _$jscoverage['/base/style.js'].branchData['673'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['673'][1].init(29, 49, 'el.offsetParent || (el.ownerDocument || doc).body');
function visit516_673_1(result) {
  _$jscoverage['/base/style.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['662'][1].init(825, 42, 'parseFloat(Dom.css(el, \'marginLeft\')) || 0');
function visit515_662_1(result) {
  _$jscoverage['/base/style.js'].branchData['662'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['661'][1].init(758, 41, 'parseFloat(Dom.css(el, \'marginTop\')) || 0');
function visit514_661_1(result) {
  _$jscoverage['/base/style.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['658'][1].init(446, 57, 'parseFloat(Dom.css(offsetParent, \'borderLeftWidth\')) || 0');
function visit513_658_1(result) {
  _$jscoverage['/base/style.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['657'][1].init(354, 56, 'parseFloat(Dom.css(offsetParent, \'borderTopWidth\')) || 0');
function visit512_657_1(result) {
  _$jscoverage['/base/style.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['648'][1].init(111, 35, 'Dom.css(el, \'position\') === \'fixed\'');
function visit511_648_1(result) {
  _$jscoverage['/base/style.js'].branchData['648'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['632'][1].init(46, 23, 'extra === PADDING_INDEX');
function visit510_632_1(result) {
  _$jscoverage['/base/style.js'].branchData['632'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['631'][1].init(28, 22, 'extra === BORDER_INDEX');
function visit509_631_1(result) {
  _$jscoverage['/base/style.js'].branchData['631'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['630'][1].init(1633, 27, 'borderBoxValueOrIsBorderBox');
function visit508_630_1(result) {
  _$jscoverage['/base/style.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['624'][1].init(18, 27, 'borderBoxValueOrIsBorderBox');
function visit507_624_1(result) {
  _$jscoverage['/base/style.js'].branchData['624'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['623'][1].init(1348, 23, 'extra === CONTENT_INDEX');
function visit506_623_1(result) {
  _$jscoverage['/base/style.js'].branchData['623'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['622'][1].init(1304, 29, 'borderBoxValue || cssBoxValue');
function visit505_622_1(result) {
  _$jscoverage['/base/style.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['621'][2].init(1240, 28, 'borderBoxValue !== undefined');
function visit504_621_2(result) {
  _$jscoverage['/base/style.js'].branchData['621'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['621'][1].init(1240, 43, 'borderBoxValue !== undefined || isBorderBox');
function visit503_621_1(result) {
  _$jscoverage['/base/style.js'].branchData['621'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['618'][1].init(1098, 19, 'extra === undefined');
function visit502_618_1(result) {
  _$jscoverage['/base/style.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['616'][1].init(416, 28, 'parseFloat(cssBoxValue) || 0');
function visit501_616_1(result) {
  _$jscoverage['/base/style.js'].branchData['616'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['613'][1].init(32, 23, 'elem.style[name] || 0');
function visit500_613_1(result) {
  _$jscoverage['/base/style.js'].branchData['613'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['612'][3].init(232, 24, '(Number(cssBoxValue)) < 0');
function visit499_612_3(result) {
  _$jscoverage['/base/style.js'].branchData['612'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['612'][2].init(208, 19, 'cssBoxValue == null');
function visit498_612_2(result) {
  _$jscoverage['/base/style.js'].branchData['612'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['612'][1].init(208, 48, 'cssBoxValue == null || (Number(cssBoxValue)) < 0');
function visit497_612_1(result) {
  _$jscoverage['/base/style.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['608'][3].init(606, 19, 'borderBoxValue <= 0');
function visit496_608_3(result) {
  _$jscoverage['/base/style.js'].branchData['608'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['608'][2].init(580, 22, 'borderBoxValue == null');
function visit495_608_2(result) {
  _$jscoverage['/base/style.js'].branchData['608'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['608'][1].init(580, 45, 'borderBoxValue == null || borderBoxValue <= 0');
function visit494_608_1(result) {
  _$jscoverage['/base/style.js'].branchData['608'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['604'][1].init(97, 14, 'name === WIDTH');
function visit493_604_1(result) {
  _$jscoverage['/base/style.js'].branchData['604'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['603'][1].init(280, 14, 'name === WIDTH');
function visit492_603_1(result) {
  _$jscoverage['/base/style.js'].branchData['603'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['601'][1].init(21, 14, 'name === WIDTH');
function visit491_601_1(result) {
  _$jscoverage['/base/style.js'].branchData['601'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['600'][1].init(147, 19, 'elem.nodeType === 9');
function visit490_600_1(result) {
  _$jscoverage['/base/style.js'].branchData['600'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['599'][1].init(21, 14, 'name === WIDTH');
function visit489_599_1(result) {
  _$jscoverage['/base/style.js'].branchData['599'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['598'][1].init(14, 19, 'util.isWindow(elem)');
function visit488_598_1(result) {
  _$jscoverage['/base/style.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['582'][1].init(81, 15, 'doc.defaultView');
function visit487_582_1(result) {
  _$jscoverage['/base/style.js'].branchData['582'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['576'][1].init(17, 72, 'Dom._getComputedStyle(elem, \'boxSizing\', computedStyle) === \'border-box\'');
function visit486_576_1(result) {
  _$jscoverage['/base/style.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['568'][1].init(278, 68, 'parseFloat(Dom._getComputedStyle(elem, cssProp, computedStyle)) || 0');
function visit485_568_1(result) {
  _$jscoverage['/base/style.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['563'][1].init(60, 17, 'prop === \'border\'');
function visit484_563_1(result) {
  _$jscoverage['/base/style.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['561'][1].init(30, 16, 'i < which.length');
function visit483_561_1(result) {
  _$jscoverage['/base/style.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['560'][1].init(48, 4, 'prop');
function visit482_560_1(result) {
  _$jscoverage['/base/style.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['558'][1].init(58, 16, 'j < props.length');
function visit481_558_1(result) {
  _$jscoverage['/base/style.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['546'][1].init(128, 22, 'elem.offsetWidth !== 0');
function visit480_546_1(result) {
  _$jscoverage['/base/style.js'].branchData['546'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['537'][1].init(333, 17, 'ret === undefined');
function visit479_537_1(result) {
  _$jscoverage['/base/style.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['533'][1].init(34, 42, '(ret = hook.get(elem, false)) !== undefined');
function visit478_533_1(result) {
  _$jscoverage['/base/style.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['532'][3].init(105, 77, '\'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit477_532_3(result) {
  _$jscoverage['/base/style.js'].branchData['532'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['532'][2].init(97, 85, 'hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit476_532_2(result) {
  _$jscoverage['/base/style.js'].branchData['532'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['532'][1].init(95, 88, '!(hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined)');
function visit475_532_1(result) {
  _$jscoverage['/base/style.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['524'][1].init(140, 9, 'UA.webkit');
function visit474_524_1(result) {
  _$jscoverage['/base/style.js'].branchData['524'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['521'][1].init(873, 16, '!elStyle.cssText');
function visit473_521_1(result) {
  _$jscoverage['/base/style.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['517'][2].init(310, 13, 'val === EMPTY');
function visit472_517_2(result) {
  _$jscoverage['/base/style.js'].branchData['517'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['517'][1].init(310, 40, 'val === EMPTY && elStyle.removeAttribute');
function visit471_517_1(result) {
  _$jscoverage['/base/style.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['508'][1].init(396, 17, 'val !== undefined');
function visit470_508_1(result) {
  _$jscoverage['/base/style.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['505'][1].init(300, 16, 'hook && hook.set');
function visit469_505_1(result) {
  _$jscoverage['/base/style.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['501'][1].init(138, 39, '!isNaN(Number(val)) && !cssNumber[name]');
function visit468_501_1(result) {
  _$jscoverage['/base/style.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['499'][3].init(66, 13, 'val === EMPTY');
function visit467_499_3(result) {
  _$jscoverage['/base/style.js'].branchData['499'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['499'][2].init(50, 12, 'val === null');
function visit466_499_2(result) {
  _$jscoverage['/base/style.js'].branchData['499'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['499'][1].init(50, 29, 'val === null || val === EMPTY');
function visit465_499_1(result) {
  _$jscoverage['/base/style.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['497'][1].init(342, 17, 'val !== undefined');
function visit464_497_1(result) {
  _$jscoverage['/base/style.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['490'][2].init(111, 19, 'elem.nodeType === 8');
function visit463_490_2(result) {
  _$jscoverage['/base/style.js'].branchData['490'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['490'][1].init(35, 46, 'elem.nodeType === 8 || !(elStyle = elem.style)');
function visit462_490_1(result) {
  _$jscoverage['/base/style.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['489'][2].init(73, 19, 'elem.nodeType === 3');
function visit461_489_2(result) {
  _$jscoverage['/base/style.js'].branchData['489'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['489'][1].init(73, 82, 'elem.nodeType === 3 || elem.nodeType === 8 || !(elStyle = elem.style)');
function visit460_489_1(result) {
  _$jscoverage['/base/style.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['457'][1].init(512, 37, 'isAutoPosition || NO_PX_REG.test(val)');
function visit459_457_1(result) {
  _$jscoverage['/base/style.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['453'][2].init(328, 23, 'position === \'relative\'');
function visit458_453_2(result) {
  _$jscoverage['/base/style.js'].branchData['453'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['453'][1].init(310, 41, 'isAutoPosition && position === \'relative\'');
function visit457_453_1(result) {
  _$jscoverage['/base/style.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['452'][1].init(269, 14, 'val === \'auto\'');
function visit456_452_1(result) {
  _$jscoverage['/base/style.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['448'][1].init(83, 21, 'position === \'static\'');
function visit455_448_1(result) {
  _$jscoverage['/base/style.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['446'][1].init(116, 8, 'computed');
function visit454_446_1(result) {
  _$jscoverage['/base/style.js'].branchData['446'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['430'][1].init(48, 8, 'computed');
function visit453_430_1(result) {
  _$jscoverage['/base/style.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['418'][1].init(553, 53, 'elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX)');
function visit452_418_1(result) {
  _$jscoverage['/base/style.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['411'][1].init(166, 11, 'isBorderBox');
function visit451_411_1(result) {
  _$jscoverage['/base/style.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['408'][1].init(22, 4, 'elem');
function visit450_408_1(result) {
  _$jscoverage['/base/style.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['407'][1].init(61, 17, 'val !== undefined');
function visit449_407_1(result) {
  _$jscoverage['/base/style.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['403'][1].init(451, 14, 'name === WIDTH');
function visit448_403_1(result) {
  _$jscoverage['/base/style.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['401'][1].init(62, 79, 'el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX)');
function visit447_401_1(result) {
  _$jscoverage['/base/style.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['396'][1].init(62, 49, 'el && getWHIgnoreDisplay(el, name, PADDING_INDEX)');
function visit446_396_1(result) {
  _$jscoverage['/base/style.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['334'][1].init(95, 6, 'j >= 0');
function visit445_334_1(result) {
  _$jscoverage['/base/style.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['327'][1].init(30, 39, '!util.inArray(getNodeName(e), excludes)');
function visit444_327_1(result) {
  _$jscoverage['/base/style.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['320'][1].init(281, 6, 'j >= 0');
function visit443_320_1(result) {
  _$jscoverage['/base/style.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['300'][1].init(769, 15, 'elem.styleSheet');
function visit442_300_1(result) {
  _$jscoverage['/base/style.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['291'][1].init(505, 4, 'elem');
function visit441_291_1(result) {
  _$jscoverage['/base/style.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['286'][1].init(340, 35, 'id && (id = id.replace(\'#\', EMPTY))');
function visit440_286_1(result) {
  _$jscoverage['/base/style.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['276'][1].init(22, 26, 'typeof refWin === \'string\'');
function visit439_276_1(result) {
  _$jscoverage['/base/style.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['259'][1].init(62, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit438_259_1(result) {
  _$jscoverage['/base/style.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['257'][1].init(121, 6, 'i >= 0');
function visit437_257_1(result) {
  _$jscoverage['/base/style.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['242'][1].init(30, 3, 'old');
function visit436_242_1(result) {
  _$jscoverage['/base/style.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['241'][1].init(154, 12, 'old !== NONE');
function visit435_241_1(result) {
  _$jscoverage['/base/style.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['237'][1].init(121, 6, 'i >= 0');
function visit434_237_1(result) {
  _$jscoverage['/base/style.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['221'][1].init(205, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit433_221_1(result) {
  _$jscoverage['/base/style.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['219'][1].init(80, 36, 'Dom.data(elem, OLD_DISPLAY) || EMPTY');
function visit432_219_1(result) {
  _$jscoverage['/base/style.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['217'][1].init(177, 6, 'i >= 0');
function visit431_217_1(result) {
  _$jscoverage['/base/style.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['201'][1].init(47, 6, 'i >= 0');
function visit430_201_1(result) {
  _$jscoverage['/base/style.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['199'][1].init(493, 26, 'typeof ret === \'undefined\'');
function visit429_199_1(result) {
  _$jscoverage['/base/style.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['194'][1].init(46, 41, '(ret = hook.get(elem, true)) !== undefined');
function visit428_194_1(result) {
  _$jscoverage['/base/style.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['193'][3].init(125, 88, '\'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit427_193_3(result) {
  _$jscoverage['/base/style.js'].branchData['193'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['193'][2].init(117, 96, 'hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit426_193_2(result) {
  _$jscoverage['/base/style.js'].branchData['193'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['193'][1].init(115, 99, '!(hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined)');
function visit425_193_1(result) {
  _$jscoverage['/base/style.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['191'][1].init(117, 4, 'elem');
function visit424_191_1(result) {
  _$jscoverage['/base/style.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['188'][1].init(668, 17, 'val === undefined');
function visit423_188_1(result) {
  _$jscoverage['/base/style.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['178'][1].init(51, 6, 'i >= 0');
function visit422_178_1(result) {
  _$jscoverage['/base/style.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['176'][1].init(241, 24, 'util.isPlainObject(name)');
function visit421_176_1(result) {
  _$jscoverage['/base/style.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['152'][1].init(47, 6, 'i >= 0');
function visit420_152_1(result) {
  _$jscoverage['/base/style.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['147'][1].init(57, 4, 'elem');
function visit419_147_1(result) {
  _$jscoverage['/base/style.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['145'][1].init(510, 17, 'val === undefined');
function visit418_145_1(result) {
  _$jscoverage['/base/style.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['139'][1].init(51, 6, 'i >= 0');
function visit417_139_1(result) {
  _$jscoverage['/base/style.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['137'][1].init(193, 24, 'util.isPlainObject(name)');
function visit416_137_1(result) {
  _$jscoverage['/base/style.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['105'][1].init(779, 51, 'Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)');
function visit415_105_1(result) {
  _$jscoverage['/base/style.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['100'][2].init(591, 10, 'val === \'\'');
function visit414_100_2(result) {
  _$jscoverage['/base/style.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['100'][1].init(591, 36, 'val === \'\' && !Dom.contains(d, elem)');
function visit413_100_1(result) {
  _$jscoverage['/base/style.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['96'][1].init(28, 59, 'computedStyle.getPropertyValue(name) || computedStyle[name]');
function visit412_96_1(result) {
  _$jscoverage['/base/style.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['95'][1].init(355, 59, 'computedStyle || d.defaultView.getComputedStyle(elem, null)');
function visit411_95_1(result) {
  _$jscoverage['/base/style.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['61'][1].init(21, 31, 'doc.body || doc.documentElement');
function visit410_61_1(result) {
  _$jscoverage['/base/style.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['60'][1].init(105, 26, '!defaultDisplay[tagName]');
function visit409_60_1(result) {
  _$jscoverage['/base/style.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['53'][2].init(141, 29, 'vendor && vendor.propertyName');
function visit408_53_2(result) {
  _$jscoverage['/base/style.js'].branchData['53'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['53'][1].init(141, 37, 'vendor && vendor.propertyName || name');
function visit407_53_1(result) {
  _$jscoverage['/base/style.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['49'][1].init(14, 14, 'cssProps[name]');
function visit406_49_1(result) {
  _$jscoverage['/base/style.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['43'][1].init(1060, 57, 'userSelectVendorInfo && userSelectVendorInfo.propertyName');
function visit405_43_1(result) {
  _$jscoverage['/base/style.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['19'][1].init(342, 27, 'globalWindow.document || {}');
function visit404_19_1(result) {
  _$jscoverage['/base/style.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/style.js'].functionData[0]++;
  _$jscoverage['/base/style.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/base/style.js'].lineData[8]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/base/style.js'].lineData[9]++;
  var Dom = require('./api');
  _$jscoverage['/base/style.js'].lineData[10]++;
  var globalWindow = S.Env.host, getCssVendorInfo = require('feature').getCssVendorInfo, UA = require('ua'), BOX_MODELS = ['margin', 'border', 'padding'], CONTENT_INDEX = -1, PADDING_INDEX = 2, BORDER_INDEX = 1, MARGIN_INDEX = 0, getNodeName = Dom.nodeName, doc = visit404_19_1(globalWindow.document || {}), RE_MARGIN = /^margin/, WIDTH = 'width', HEIGHT = 'height', DISPLAY = 'display', OLD_DISPLAY = DISPLAY + util.now(), NONE = 'none', cssNumber = {
  fillOpacity: 1, 
  fontWeight: 1, 
  lineHeight: 1, 
  opacity: 1, 
  orphans: 1, 
  widows: 1, 
  zIndex: 1, 
  zoom: 1}, EMPTY = '', DEFAULT_UNIT = 'px', NO_PX_REG = /\d(?!px)[a-z%]+$/i, cssHooks = {}, cssProps = {}, defaultDisplay = {}, userSelectVendorInfo = getCssVendorInfo('userSelect'), userSelectProperty = visit405_43_1(userSelectVendorInfo && userSelectVendorInfo.propertyName), camelCase = util.camelCase;
  _$jscoverage['/base/style.js'].lineData[46]++;
  cssProps['float'] = 'cssFloat';
  _$jscoverage['/base/style.js'].lineData[48]++;
  function normalizeCssPropName(name) {
    _$jscoverage['/base/style.js'].functionData[1]++;
    _$jscoverage['/base/style.js'].lineData[49]++;
    if (visit406_49_1(cssProps[name])) {
      _$jscoverage['/base/style.js'].lineData[50]++;
      return cssProps[name];
    }
    _$jscoverage['/base/style.js'].lineData[52]++;
    var vendor = getCssVendorInfo(name);
    _$jscoverage['/base/style.js'].lineData[53]++;
    return visit407_53_1(visit408_53_2(vendor && vendor.propertyName) || name);
  }
  _$jscoverage['/base/style.js'].lineData[56]++;
  function getDefaultDisplay(tagName) {
    _$jscoverage['/base/style.js'].functionData[2]++;
    _$jscoverage['/base/style.js'].lineData[57]++;
    var body, oldDisplay = defaultDisplay[tagName], elem;
    _$jscoverage['/base/style.js'].lineData[60]++;
    if (visit409_60_1(!defaultDisplay[tagName])) {
      _$jscoverage['/base/style.js'].lineData[61]++;
      body = visit410_61_1(doc.body || doc.documentElement);
      _$jscoverage['/base/style.js'].lineData[62]++;
      elem = doc.createElement(tagName);
      _$jscoverage['/base/style.js'].lineData[64]++;
      Dom.prepend(elem, body);
      _$jscoverage['/base/style.js'].lineData[65]++;
      oldDisplay = Dom.css(elem, 'display');
      _$jscoverage['/base/style.js'].lineData[66]++;
      body.removeChild(elem);
      _$jscoverage['/base/style.js'].lineData[68]++;
      defaultDisplay[tagName] = oldDisplay;
    }
    _$jscoverage['/base/style.js'].lineData[70]++;
    return oldDisplay;
  }
  _$jscoverage['/base/style.js'].lineData[73]++;
  util.mix(Dom, {
  _cssHooks: cssHooks, 
  _cssProps: cssProps, 
  _getComputedStyle: function(elem, name, computedStyle) {
  _$jscoverage['/base/style.js'].functionData[3]++;
  _$jscoverage['/base/style.js'].lineData[85]++;
  var val = '', width, minWidth, maxWidth, style, d = elem.ownerDocument;
  _$jscoverage['/base/style.js'].lineData[92]++;
  name = normalizeCssPropName(name);
  _$jscoverage['/base/style.js'].lineData[95]++;
  if ((computedStyle = (visit411_95_1(computedStyle || d.defaultView.getComputedStyle(elem, null))))) {
    _$jscoverage['/base/style.js'].lineData[96]++;
    val = visit412_96_1(computedStyle.getPropertyValue(name) || computedStyle[name]);
  }
  _$jscoverage['/base/style.js'].lineData[100]++;
  if (visit413_100_1(visit414_100_2(val === '') && !Dom.contains(d, elem))) {
    _$jscoverage['/base/style.js'].lineData[101]++;
    val = elem.style[name];
  }
  _$jscoverage['/base/style.js'].lineData[105]++;
  if (visit415_105_1(Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name))) {
    _$jscoverage['/base/style.js'].lineData[106]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[107]++;
    width = style.width;
    _$jscoverage['/base/style.js'].lineData[108]++;
    minWidth = style.minWidth;
    _$jscoverage['/base/style.js'].lineData[109]++;
    maxWidth = style.maxWidth;
    _$jscoverage['/base/style.js'].lineData[111]++;
    style.minWidth = style.maxWidth = style.width = val;
    _$jscoverage['/base/style.js'].lineData[112]++;
    val = computedStyle.width;
    _$jscoverage['/base/style.js'].lineData[114]++;
    style.width = width;
    _$jscoverage['/base/style.js'].lineData[115]++;
    style.minWidth = minWidth;
    _$jscoverage['/base/style.js'].lineData[116]++;
    style.maxWidth = maxWidth;
  }
  _$jscoverage['/base/style.js'].lineData[119]++;
  return val;
}, 
  style: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[4]++;
  _$jscoverage['/base/style.js'].lineData[132]++;
  var els = Dom.query(selector), k, ret, elem = els[0], i;
  _$jscoverage['/base/style.js'].lineData[137]++;
  if (visit416_137_1(util.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[138]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[139]++;
      for (i = els.length - 1; visit417_139_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[140]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[143]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[145]++;
  if (visit418_145_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[146]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[147]++;
    if (visit419_147_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[148]++;
      ret = style(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[150]++;
    return ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[152]++;
    for (i = els.length - 1; visit420_152_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[153]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[156]++;
  return undefined;
}, 
  css: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[5]++;
  _$jscoverage['/base/style.js'].lineData[169]++;
  var els = Dom.query(selector), elem = els[0], k, hook, ret, i;
  _$jscoverage['/base/style.js'].lineData[176]++;
  if (visit421_176_1(util.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[177]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[178]++;
      for (i = els.length - 1; visit422_178_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[179]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[182]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[185]++;
  name = camelCase(name);
  _$jscoverage['/base/style.js'].lineData[186]++;
  hook = cssHooks[name];
  _$jscoverage['/base/style.js'].lineData[188]++;
  if (visit423_188_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[190]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[191]++;
    if (visit424_191_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[193]++;
      if (visit425_193_1(!(visit426_193_2(hook && visit427_193_3('get' in hook && visit428_194_1((ret = hook.get(elem, true)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[196]++;
        ret = Dom._getComputedStyle(elem, name);
      }
    }
    _$jscoverage['/base/style.js'].lineData[199]++;
    return (visit429_199_1(typeof ret === 'undefined')) ? '' : ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[201]++;
    for (i = els.length - 1; visit430_201_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[202]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[205]++;
  return undefined;
}, 
  show: function(selector) {
  _$jscoverage['/base/style.js'].functionData[6]++;
  _$jscoverage['/base/style.js'].lineData[213]++;
  var els = Dom.query(selector), tagName, old, elem, i;
  _$jscoverage['/base/style.js'].lineData[217]++;
  for (i = els.length - 1; visit431_217_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[218]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[219]++;
    elem.style[DISPLAY] = visit432_219_1(Dom.data(elem, OLD_DISPLAY) || EMPTY);
    _$jscoverage['/base/style.js'].lineData[221]++;
    if (visit433_221_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[222]++;
      tagName = elem.tagName.toLowerCase();
      _$jscoverage['/base/style.js'].lineData[223]++;
      old = getDefaultDisplay(tagName);
      _$jscoverage['/base/style.js'].lineData[224]++;
      Dom.data(elem, OLD_DISPLAY, old);
      _$jscoverage['/base/style.js'].lineData[225]++;
      elem.style[DISPLAY] = old;
    }
  }
}, 
  hide: function(selector) {
  _$jscoverage['/base/style.js'].functionData[7]++;
  _$jscoverage['/base/style.js'].lineData[235]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[237]++;
  for (i = els.length - 1; visit434_237_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[238]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[239]++;
    var style = elem.style, old = style[DISPLAY];
    _$jscoverage['/base/style.js'].lineData[241]++;
    if (visit435_241_1(old !== NONE)) {
      _$jscoverage['/base/style.js'].lineData[242]++;
      if (visit436_242_1(old)) {
        _$jscoverage['/base/style.js'].lineData[243]++;
        Dom.data(elem, OLD_DISPLAY, old);
      }
      _$jscoverage['/base/style.js'].lineData[245]++;
      style[DISPLAY] = NONE;
    }
  }
}, 
  toggle: function(selector) {
  _$jscoverage['/base/style.js'].functionData[8]++;
  _$jscoverage['/base/style.js'].lineData[255]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[257]++;
  for (i = els.length - 1; visit437_257_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[258]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[259]++;
    if (visit438_259_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[260]++;
      Dom.show(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[262]++;
      Dom.hide(elem);
    }
  }
}, 
  addStyleSheet: function(refWin, cssText, id) {
  _$jscoverage['/base/style.js'].functionData[9]++;
  _$jscoverage['/base/style.js'].lineData[276]++;
  if (visit439_276_1(typeof refWin === 'string')) {
    _$jscoverage['/base/style.js'].lineData[277]++;
    id = cssText;
    _$jscoverage['/base/style.js'].lineData[278]++;
    cssText = refWin;
    _$jscoverage['/base/style.js'].lineData[280]++;
    refWin = globalWindow;
  }
  _$jscoverage['/base/style.js'].lineData[283]++;
  var doc = Dom.getDocument(refWin), elem;
  _$jscoverage['/base/style.js'].lineData[286]++;
  if (visit440_286_1(id && (id = id.replace('#', EMPTY)))) {
    _$jscoverage['/base/style.js'].lineData[287]++;
    elem = Dom.get('#' + id, doc);
  }
  _$jscoverage['/base/style.js'].lineData[291]++;
  if (visit441_291_1(elem)) {
    _$jscoverage['/base/style.js'].lineData[292]++;
    return;
  }
  _$jscoverage['/base/style.js'].lineData[295]++;
  elem = Dom.create('<style>', {
  id: id}, doc);
  _$jscoverage['/base/style.js'].lineData[298]++;
  Dom.get('head', doc).appendChild(elem);
  _$jscoverage['/base/style.js'].lineData[300]++;
  if (visit442_300_1(elem.styleSheet)) {
    _$jscoverage['/base/style.js'].lineData[301]++;
    elem.styleSheet.cssText = cssText;
  } else {
    _$jscoverage['/base/style.js'].lineData[303]++;
    elem.appendChild(doc.createTextNode(cssText));
  }
}, 
  unselectable: userSelectProperty ? function(selector) {
  _$jscoverage['/base/style.js'].functionData[10]++;
  _$jscoverage['/base/style.js'].lineData[312]++;
  var _els = Dom.query(selector), elem, j, e, i = 0, excludes, style, els;
  _$jscoverage['/base/style.js'].lineData[320]++;
  for (j = _els.length - 1; visit443_320_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[321]++;
    elem = _els[j];
    _$jscoverage['/base/style.js'].lineData[322]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[323]++;
    els = elem.getElementsByTagName('*');
    _$jscoverage['/base/style.js'].lineData[324]++;
    elem.setAttribute('unselectable', 'on');
    _$jscoverage['/base/style.js'].lineData[325]++;
    excludes = ['iframe', 'textarea', 'input', 'select'];
    _$jscoverage['/base/style.js'].lineData[326]++;
    while ((e = els[i++])) {
      _$jscoverage['/base/style.js'].lineData[327]++;
      if (visit444_327_1(!util.inArray(getNodeName(e), excludes))) {
        _$jscoverage['/base/style.js'].lineData[328]++;
        e.setAttribute('unselectable', 'on');
      }
    }
  }
} : function(selector) {
  _$jscoverage['/base/style.js'].functionData[11]++;
  _$jscoverage['/base/style.js'].lineData[333]++;
  var els = Dom.query(selector);
  _$jscoverage['/base/style.js'].lineData[334]++;
  for (var j = els.length - 1; visit445_334_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[335]++;
    els[j].style[userSelectProperty] = 'none';
  }
}, 
  innerWidth: 0, 
  innerHeight: 0, 
  outerWidth: 0, 
  outerHeight: 0, 
  width: 0, 
  height: 0});
  _$jscoverage['/base/style.js'].lineData[393]++;
  util.each([WIDTH, HEIGHT], function(name) {
  _$jscoverage['/base/style.js'].functionData[12]++;
  _$jscoverage['/base/style.js'].lineData[394]++;
  Dom['inner' + util.ucfirst(name)] = function(selector) {
  _$jscoverage['/base/style.js'].functionData[13]++;
  _$jscoverage['/base/style.js'].lineData[395]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[396]++;
  return visit446_396_1(el && getWHIgnoreDisplay(el, name, PADDING_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[399]++;
  Dom['outer' + util.ucfirst(name)] = function(selector, includeMargin) {
  _$jscoverage['/base/style.js'].functionData[14]++;
  _$jscoverage['/base/style.js'].lineData[400]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[401]++;
  return visit447_401_1(el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[403]++;
  var which = visit448_403_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'];
  _$jscoverage['/base/style.js'].lineData[405]++;
  Dom[name] = function(selector, val) {
  _$jscoverage['/base/style.js'].functionData[15]++;
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
  _$jscoverage['/base/style.js'].functionData[16]++;
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
  util.each(['left', 'top'], function(name) {
  _$jscoverage['/base/style.js'].functionData[17]++;
  _$jscoverage['/base/style.js'].lineData[441]++;
  cssHooks[name] = {
  get: function(el, computed) {
  _$jscoverage['/base/style.js'].functionData[18]++;
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
    _$jscoverage['/base/style.js'].functionData[19]++;
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
    _$jscoverage['/base/style.js'].functionData[20]++;
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
    _$jscoverage['/base/style.js'].functionData[21]++;
    _$jscoverage['/base/style.js'].lineData[543]++;
    var val, args = arguments;
    _$jscoverage['/base/style.js'].lineData[546]++;
    if (visit480_546_1(elem.offsetWidth !== 0)) {
      _$jscoverage['/base/style.js'].lineData[547]++;
      val = getWH.apply(undefined, args);
    } else {
      _$jscoverage['/base/style.js'].lineData[549]++;
      swap(elem, cssShow, function() {
  _$jscoverage['/base/style.js'].functionData[22]++;
  _$jscoverage['/base/style.js'].lineData[550]++;
  val = getWH.apply(undefined, args);
});
    }
    _$jscoverage['/base/style.js'].lineData[553]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[556]++;
  function getPBMWidth(elem, props, which, computedStyle) {
    _$jscoverage['/base/style.js'].functionData[23]++;
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
    _$jscoverage['/base/style.js'].functionData[24]++;
    _$jscoverage['/base/style.js'].lineData[576]++;
    return visit486_576_1(Dom._getComputedStyle(elem, 'boxSizing', computedStyle) === 'border-box');
  }
  _$jscoverage['/base/style.js'].lineData[579]++;
  function getComputedStyle(elem) {
    _$jscoverage['/base/style.js'].functionData[25]++;
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
    _$jscoverage['/base/style.js'].functionData[26]++;
    _$jscoverage['/base/style.js'].lineData[598]++;
    if (visit488_598_1(util.isWindow(elem))) {
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
    _$jscoverage['/base/style.js'].functionData[27]++;
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
    _$jscoverage['/base/style.js'].functionData[28]++;
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
