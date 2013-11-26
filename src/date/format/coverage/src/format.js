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
if (! _$jscoverage['/format.js']) {
  _$jscoverage['/format.js'] = {};
  _$jscoverage['/format.js'].lineData = [];
  _$jscoverage['/format.js'].lineData[7] = 0;
  _$jscoverage['/format.js'].lineData[8] = 0;
  _$jscoverage['/format.js'].lineData[9] = 0;
  _$jscoverage['/format.js'].lineData[10] = 0;
  _$jscoverage['/format.js'].lineData[34] = 0;
  _$jscoverage['/format.js'].lineData[59] = 0;
  _$jscoverage['/format.js'].lineData[62] = 0;
  _$jscoverage['/format.js'].lineData[64] = 0;
  _$jscoverage['/format.js'].lineData[66] = 0;
  _$jscoverage['/format.js'].lineData[67] = 0;
  _$jscoverage['/format.js'].lineData[68] = 0;
  _$jscoverage['/format.js'].lineData[69] = 0;
  _$jscoverage['/format.js'].lineData[70] = 0;
  _$jscoverage['/format.js'].lineData[71] = 0;
  _$jscoverage['/format.js'].lineData[72] = 0;
  _$jscoverage['/format.js'].lineData[73] = 0;
  _$jscoverage['/format.js'].lineData[74] = 0;
  _$jscoverage['/format.js'].lineData[75] = 0;
  _$jscoverage['/format.js'].lineData[76] = 0;
  _$jscoverage['/format.js'].lineData[77] = 0;
  _$jscoverage['/format.js'].lineData[78] = 0;
  _$jscoverage['/format.js'].lineData[80] = 0;
  _$jscoverage['/format.js'].lineData[81] = 0;
  _$jscoverage['/format.js'].lineData[84] = 0;
  _$jscoverage['/format.js'].lineData[89] = 0;
  _$jscoverage['/format.js'].lineData[90] = 0;
  _$jscoverage['/format.js'].lineData[96] = 0;
  _$jscoverage['/format.js'].lineData[97] = 0;
  _$jscoverage['/format.js'].lineData[98] = 0;
  _$jscoverage['/format.js'].lineData[99] = 0;
  _$jscoverage['/format.js'].lineData[100] = 0;
  _$jscoverage['/format.js'].lineData[101] = 0;
  _$jscoverage['/format.js'].lineData[102] = 0;
  _$jscoverage['/format.js'].lineData[104] = 0;
  _$jscoverage['/format.js'].lineData[105] = 0;
  _$jscoverage['/format.js'].lineData[107] = 0;
  _$jscoverage['/format.js'].lineData[110] = 0;
  _$jscoverage['/format.js'].lineData[111] = 0;
  _$jscoverage['/format.js'].lineData[112] = 0;
  _$jscoverage['/format.js'].lineData[113] = 0;
  _$jscoverage['/format.js'].lineData[114] = 0;
  _$jscoverage['/format.js'].lineData[115] = 0;
  _$jscoverage['/format.js'].lineData[116] = 0;
  _$jscoverage['/format.js'].lineData[117] = 0;
  _$jscoverage['/format.js'].lineData[119] = 0;
  _$jscoverage['/format.js'].lineData[120] = 0;
  _$jscoverage['/format.js'].lineData[122] = 0;
  _$jscoverage['/format.js'].lineData[125] = 0;
  _$jscoverage['/format.js'].lineData[126] = 0;
  _$jscoverage['/format.js'].lineData[127] = 0;
  _$jscoverage['/format.js'].lineData[128] = 0;
  _$jscoverage['/format.js'].lineData[129] = 0;
  _$jscoverage['/format.js'].lineData[131] = 0;
  _$jscoverage['/format.js'].lineData[132] = 0;
  _$jscoverage['/format.js'].lineData[134] = 0;
  _$jscoverage['/format.js'].lineData[137] = 0;
  _$jscoverage['/format.js'].lineData[139] = 0;
  _$jscoverage['/format.js'].lineData[141] = 0;
  _$jscoverage['/format.js'].lineData[142] = 0;
  _$jscoverage['/format.js'].lineData[143] = 0;
  _$jscoverage['/format.js'].lineData[145] = 0;
  _$jscoverage['/format.js'].lineData[146] = 0;
  _$jscoverage['/format.js'].lineData[147] = 0;
  _$jscoverage['/format.js'].lineData[148] = 0;
  _$jscoverage['/format.js'].lineData[149] = 0;
  _$jscoverage['/format.js'].lineData[151] = 0;
  _$jscoverage['/format.js'].lineData[154] = 0;
  _$jscoverage['/format.js'].lineData[157] = 0;
  _$jscoverage['/format.js'].lineData[158] = 0;
  _$jscoverage['/format.js'].lineData[162] = 0;
  _$jscoverage['/format.js'].lineData[163] = 0;
  _$jscoverage['/format.js'].lineData[164] = 0;
  _$jscoverage['/format.js'].lineData[165] = 0;
  _$jscoverage['/format.js'].lineData[167] = 0;
  _$jscoverage['/format.js'].lineData[168] = 0;
  _$jscoverage['/format.js'].lineData[169] = 0;
  _$jscoverage['/format.js'].lineData[172] = 0;
  _$jscoverage['/format.js'].lineData[173] = 0;
  _$jscoverage['/format.js'].lineData[176] = 0;
  _$jscoverage['/format.js'].lineData[177] = 0;
  _$jscoverage['/format.js'].lineData[180] = 0;
  _$jscoverage['/format.js'].lineData[183] = 0;
  _$jscoverage['/format.js'].lineData[186] = 0;
  _$jscoverage['/format.js'].lineData[191] = 0;
  _$jscoverage['/format.js'].lineData[192] = 0;
  _$jscoverage['/format.js'].lineData[193] = 0;
  _$jscoverage['/format.js'].lineData[194] = 0;
  _$jscoverage['/format.js'].lineData[195] = 0;
  _$jscoverage['/format.js'].lineData[196] = 0;
  _$jscoverage['/format.js'].lineData[198] = 0;
  _$jscoverage['/format.js'].lineData[199] = 0;
  _$jscoverage['/format.js'].lineData[200] = 0;
  _$jscoverage['/format.js'].lineData[201] = 0;
  _$jscoverage['/format.js'].lineData[202] = 0;
  _$jscoverage['/format.js'].lineData[203] = 0;
  _$jscoverage['/format.js'].lineData[205] = 0;
  _$jscoverage['/format.js'].lineData[206] = 0;
  _$jscoverage['/format.js'].lineData[210] = 0;
  _$jscoverage['/format.js'].lineData[211] = 0;
  _$jscoverage['/format.js'].lineData[339] = 0;
  _$jscoverage['/format.js'].lineData[340] = 0;
  _$jscoverage['/format.js'].lineData[341] = 0;
  _$jscoverage['/format.js'].lineData[342] = 0;
  _$jscoverage['/format.js'].lineData[345] = 0;
  _$jscoverage['/format.js'].lineData[346] = 0;
  _$jscoverage['/format.js'].lineData[348] = 0;
  _$jscoverage['/format.js'].lineData[350] = 0;
  _$jscoverage['/format.js'].lineData[351] = 0;
  _$jscoverage['/format.js'].lineData[352] = 0;
  _$jscoverage['/format.js'].lineData[354] = 0;
  _$jscoverage['/format.js'].lineData[355] = 0;
  _$jscoverage['/format.js'].lineData[356] = 0;
  _$jscoverage['/format.js'].lineData[358] = 0;
  _$jscoverage['/format.js'].lineData[359] = 0;
  _$jscoverage['/format.js'].lineData[361] = 0;
  _$jscoverage['/format.js'].lineData[362] = 0;
  _$jscoverage['/format.js'].lineData[363] = 0;
  _$jscoverage['/format.js'].lineData[364] = 0;
  _$jscoverage['/format.js'].lineData[365] = 0;
  _$jscoverage['/format.js'].lineData[367] = 0;
  _$jscoverage['/format.js'].lineData[369] = 0;
  _$jscoverage['/format.js'].lineData[371] = 0;
  _$jscoverage['/format.js'].lineData[373] = 0;
  _$jscoverage['/format.js'].lineData[375] = 0;
  _$jscoverage['/format.js'].lineData[376] = 0;
  _$jscoverage['/format.js'].lineData[379] = 0;
  _$jscoverage['/format.js'].lineData[381] = 0;
  _$jscoverage['/format.js'].lineData[384] = 0;
  _$jscoverage['/format.js'].lineData[386] = 0;
  _$jscoverage['/format.js'].lineData[388] = 0;
  _$jscoverage['/format.js'].lineData[390] = 0;
  _$jscoverage['/format.js'].lineData[392] = 0;
  _$jscoverage['/format.js'].lineData[394] = 0;
  _$jscoverage['/format.js'].lineData[395] = 0;
  _$jscoverage['/format.js'].lineData[396] = 0;
  _$jscoverage['/format.js'].lineData[397] = 0;
  _$jscoverage['/format.js'].lineData[399] = 0;
  _$jscoverage['/format.js'].lineData[400] = 0;
  _$jscoverage['/format.js'].lineData[411] = 0;
  _$jscoverage['/format.js'].lineData[412] = 0;
  _$jscoverage['/format.js'].lineData[413] = 0;
  _$jscoverage['/format.js'].lineData[415] = 0;
  _$jscoverage['/format.js'].lineData[418] = 0;
  _$jscoverage['/format.js'].lineData[419] = 0;
  _$jscoverage['/format.js'].lineData[423] = 0;
  _$jscoverage['/format.js'].lineData[424] = 0;
  _$jscoverage['/format.js'].lineData[425] = 0;
  _$jscoverage['/format.js'].lineData[426] = 0;
  _$jscoverage['/format.js'].lineData[428] = 0;
  _$jscoverage['/format.js'].lineData[429] = 0;
  _$jscoverage['/format.js'].lineData[432] = 0;
  _$jscoverage['/format.js'].lineData[438] = 0;
  _$jscoverage['/format.js'].lineData[439] = 0;
  _$jscoverage['/format.js'].lineData[440] = 0;
  _$jscoverage['/format.js'].lineData[441] = 0;
  _$jscoverage['/format.js'].lineData[444] = 0;
  _$jscoverage['/format.js'].lineData[447] = 0;
  _$jscoverage['/format.js'].lineData[448] = 0;
  _$jscoverage['/format.js'].lineData[450] = 0;
  _$jscoverage['/format.js'].lineData[451] = 0;
  _$jscoverage['/format.js'].lineData[452] = 0;
  _$jscoverage['/format.js'].lineData[453] = 0;
  _$jscoverage['/format.js'].lineData[456] = 0;
  _$jscoverage['/format.js'].lineData[459] = 0;
  _$jscoverage['/format.js'].lineData[460] = 0;
  _$jscoverage['/format.js'].lineData[461] = 0;
  _$jscoverage['/format.js'].lineData[462] = 0;
  _$jscoverage['/format.js'].lineData[463] = 0;
  _$jscoverage['/format.js'].lineData[465] = 0;
  _$jscoverage['/format.js'].lineData[466] = 0;
  _$jscoverage['/format.js'].lineData[467] = 0;
  _$jscoverage['/format.js'].lineData[470] = 0;
  _$jscoverage['/format.js'].lineData[472] = 0;
  _$jscoverage['/format.js'].lineData[473] = 0;
  _$jscoverage['/format.js'].lineData[474] = 0;
  _$jscoverage['/format.js'].lineData[476] = 0;
  _$jscoverage['/format.js'].lineData[482] = 0;
  _$jscoverage['/format.js'].lineData[483] = 0;
  _$jscoverage['/format.js'].lineData[484] = 0;
  _$jscoverage['/format.js'].lineData[485] = 0;
  _$jscoverage['/format.js'].lineData[487] = 0;
  _$jscoverage['/format.js'].lineData[489] = 0;
  _$jscoverage['/format.js'].lineData[490] = 0;
  _$jscoverage['/format.js'].lineData[491] = 0;
  _$jscoverage['/format.js'].lineData[492] = 0;
  _$jscoverage['/format.js'].lineData[493] = 0;
  _$jscoverage['/format.js'].lineData[496] = 0;
  _$jscoverage['/format.js'].lineData[499] = 0;
  _$jscoverage['/format.js'].lineData[501] = 0;
  _$jscoverage['/format.js'].lineData[502] = 0;
  _$jscoverage['/format.js'].lineData[503] = 0;
  _$jscoverage['/format.js'].lineData[504] = 0;
  _$jscoverage['/format.js'].lineData[505] = 0;
  _$jscoverage['/format.js'].lineData[508] = 0;
  _$jscoverage['/format.js'].lineData[510] = 0;
  _$jscoverage['/format.js'].lineData[512] = 0;
  _$jscoverage['/format.js'].lineData[513] = 0;
  _$jscoverage['/format.js'].lineData[514] = 0;
  _$jscoverage['/format.js'].lineData[516] = 0;
  _$jscoverage['/format.js'].lineData[519] = 0;
  _$jscoverage['/format.js'].lineData[520] = 0;
  _$jscoverage['/format.js'].lineData[523] = 0;
  _$jscoverage['/format.js'].lineData[524] = 0;
  _$jscoverage['/format.js'].lineData[526] = 0;
  _$jscoverage['/format.js'].lineData[528] = 0;
  _$jscoverage['/format.js'].lineData[529] = 0;
  _$jscoverage['/format.js'].lineData[531] = 0;
  _$jscoverage['/format.js'].lineData[533] = 0;
  _$jscoverage['/format.js'].lineData[536] = 0;
  _$jscoverage['/format.js'].lineData[538] = 0;
  _$jscoverage['/format.js'].lineData[540] = 0;
  _$jscoverage['/format.js'].lineData[541] = 0;
  _$jscoverage['/format.js'].lineData[542] = 0;
  _$jscoverage['/format.js'].lineData[543] = 0;
  _$jscoverage['/format.js'].lineData[544] = 0;
  _$jscoverage['/format.js'].lineData[545] = 0;
  _$jscoverage['/format.js'].lineData[549] = 0;
  _$jscoverage['/format.js'].lineData[552] = 0;
  _$jscoverage['/format.js'].lineData[554] = 0;
  _$jscoverage['/format.js'].lineData[555] = 0;
  _$jscoverage['/format.js'].lineData[556] = 0;
  _$jscoverage['/format.js'].lineData[557] = 0;
  _$jscoverage['/format.js'].lineData[559] = 0;
  _$jscoverage['/format.js'].lineData[561] = 0;
  _$jscoverage['/format.js'].lineData[563] = 0;
  _$jscoverage['/format.js'].lineData[564] = 0;
  _$jscoverage['/format.js'].lineData[565] = 0;
  _$jscoverage['/format.js'].lineData[566] = 0;
  _$jscoverage['/format.js'].lineData[568] = 0;
  _$jscoverage['/format.js'].lineData[570] = 0;
  _$jscoverage['/format.js'].lineData[572] = 0;
  _$jscoverage['/format.js'].lineData[573] = 0;
  _$jscoverage['/format.js'].lineData[575] = 0;
  _$jscoverage['/format.js'].lineData[576] = 0;
  _$jscoverage['/format.js'].lineData[577] = 0;
  _$jscoverage['/format.js'].lineData[578] = 0;
  _$jscoverage['/format.js'].lineData[579] = 0;
  _$jscoverage['/format.js'].lineData[581] = 0;
  _$jscoverage['/format.js'].lineData[583] = 0;
  _$jscoverage['/format.js'].lineData[584] = 0;
  _$jscoverage['/format.js'].lineData[585] = 0;
  _$jscoverage['/format.js'].lineData[586] = 0;
  _$jscoverage['/format.js'].lineData[587] = 0;
  _$jscoverage['/format.js'].lineData[589] = 0;
  _$jscoverage['/format.js'].lineData[591] = 0;
  _$jscoverage['/format.js'].lineData[602] = 0;
  _$jscoverage['/format.js'].lineData[603] = 0;
  _$jscoverage['/format.js'].lineData[604] = 0;
  _$jscoverage['/format.js'].lineData[607] = 0;
  _$jscoverage['/format.js'].lineData[608] = 0;
  _$jscoverage['/format.js'].lineData[610] = 0;
  _$jscoverage['/format.js'].lineData[613] = 0;
  _$jscoverage['/format.js'].lineData[620] = 0;
  _$jscoverage['/format.js'].lineData[621] = 0;
  _$jscoverage['/format.js'].lineData[623] = 0;
  _$jscoverage['/format.js'].lineData[624] = 0;
  _$jscoverage['/format.js'].lineData[628] = 0;
  _$jscoverage['/format.js'].lineData[629] = 0;
  _$jscoverage['/format.js'].lineData[630] = 0;
  _$jscoverage['/format.js'].lineData[631] = 0;
  _$jscoverage['/format.js'].lineData[632] = 0;
  _$jscoverage['/format.js'].lineData[633] = 0;
  _$jscoverage['/format.js'].lineData[636] = 0;
  _$jscoverage['/format.js'].lineData[645] = 0;
  _$jscoverage['/format.js'].lineData[658] = 0;
  _$jscoverage['/format.js'].lineData[659] = 0;
  _$jscoverage['/format.js'].lineData[660] = 0;
  _$jscoverage['/format.js'].lineData[661] = 0;
  _$jscoverage['/format.js'].lineData[662] = 0;
  _$jscoverage['/format.js'].lineData[663] = 0;
  _$jscoverage['/format.js'].lineData[664] = 0;
  _$jscoverage['/format.js'].lineData[665] = 0;
  _$jscoverage['/format.js'].lineData[667] = 0;
  _$jscoverage['/format.js'].lineData[668] = 0;
  _$jscoverage['/format.js'].lineData[669] = 0;
  _$jscoverage['/format.js'].lineData[670] = 0;
  _$jscoverage['/format.js'].lineData[673] = 0;
  _$jscoverage['/format.js'].lineData[675] = 0;
  _$jscoverage['/format.js'].lineData[676] = 0;
  _$jscoverage['/format.js'].lineData[677] = 0;
  _$jscoverage['/format.js'].lineData[678] = 0;
  _$jscoverage['/format.js'].lineData[679] = 0;
  _$jscoverage['/format.js'].lineData[680] = 0;
  _$jscoverage['/format.js'].lineData[682] = 0;
  _$jscoverage['/format.js'].lineData[683] = 0;
  _$jscoverage['/format.js'].lineData[684] = 0;
  _$jscoverage['/format.js'].lineData[688] = 0;
  _$jscoverage['/format.js'].lineData[696] = 0;
  _$jscoverage['/format.js'].lineData[697] = 0;
  _$jscoverage['/format.js'].lineData[703] = 0;
  _$jscoverage['/format.js'].lineData[704] = 0;
  _$jscoverage['/format.js'].lineData[705] = 0;
  _$jscoverage['/format.js'].lineData[706] = 0;
  _$jscoverage['/format.js'].lineData[707] = 0;
  _$jscoverage['/format.js'].lineData[709] = 0;
  _$jscoverage['/format.js'].lineData[713] = 0;
  _$jscoverage['/format.js'].lineData[726] = 0;
  _$jscoverage['/format.js'].lineData[738] = 0;
  _$jscoverage['/format.js'].lineData[751] = 0;
  _$jscoverage['/format.js'].lineData[752] = 0;
  _$jscoverage['/format.js'].lineData[753] = 0;
  _$jscoverage['/format.js'].lineData[754] = 0;
  _$jscoverage['/format.js'].lineData[756] = 0;
  _$jscoverage['/format.js'].lineData[757] = 0;
  _$jscoverage['/format.js'].lineData[758] = 0;
  _$jscoverage['/format.js'].lineData[760] = 0;
  _$jscoverage['/format.js'].lineData[761] = 0;
  _$jscoverage['/format.js'].lineData[762] = 0;
  _$jscoverage['/format.js'].lineData[763] = 0;
  _$jscoverage['/format.js'].lineData[768] = 0;
  _$jscoverage['/format.js'].lineData[771] = 0;
  _$jscoverage['/format.js'].lineData[783] = 0;
  _$jscoverage['/format.js'].lineData[787] = 0;
}
if (! _$jscoverage['/format.js'].functionData) {
  _$jscoverage['/format.js'].functionData = [];
  _$jscoverage['/format.js'].functionData[0] = 0;
  _$jscoverage['/format.js'].functionData[1] = 0;
  _$jscoverage['/format.js'].functionData[2] = 0;
  _$jscoverage['/format.js'].functionData[3] = 0;
  _$jscoverage['/format.js'].functionData[4] = 0;
  _$jscoverage['/format.js'].functionData[5] = 0;
  _$jscoverage['/format.js'].functionData[6] = 0;
  _$jscoverage['/format.js'].functionData[7] = 0;
  _$jscoverage['/format.js'].functionData[8] = 0;
  _$jscoverage['/format.js'].functionData[9] = 0;
  _$jscoverage['/format.js'].functionData[10] = 0;
  _$jscoverage['/format.js'].functionData[11] = 0;
  _$jscoverage['/format.js'].functionData[12] = 0;
  _$jscoverage['/format.js'].functionData[13] = 0;
  _$jscoverage['/format.js'].functionData[14] = 0;
  _$jscoverage['/format.js'].functionData[15] = 0;
  _$jscoverage['/format.js'].functionData[16] = 0;
  _$jscoverage['/format.js'].functionData[17] = 0;
}
if (! _$jscoverage['/format.js'].branchData) {
  _$jscoverage['/format.js'].branchData = {};
  _$jscoverage['/format.js'].branchData['104'] = [];
  _$jscoverage['/format.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['107'] = [];
  _$jscoverage['/format.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['110'] = [];
  _$jscoverage['/format.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['112'] = [];
  _$jscoverage['/format.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['114'] = [];
  _$jscoverage['/format.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['119'] = [];
  _$jscoverage['/format.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['125'] = [];
  _$jscoverage['/format.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['126'] = [];
  _$jscoverage['/format.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['141'] = [];
  _$jscoverage['/format.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'] = [];
  _$jscoverage['/format.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'][4] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'][5] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'][6] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'][7] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'][8] = new BranchData();
  _$jscoverage['/format.js'].branchData['146'] = [];
  _$jscoverage['/format.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['157'] = [];
  _$jscoverage['/format.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['162'] = [];
  _$jscoverage['/format.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['162'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['162'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['172'] = [];
  _$jscoverage['/format.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['176'] = [];
  _$jscoverage['/format.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['191'] = [];
  _$jscoverage['/format.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['192'] = [];
  _$jscoverage['/format.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['193'] = [];
  _$jscoverage['/format.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['194'] = [];
  _$jscoverage['/format.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['194'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['194'][4] = new BranchData();
  _$jscoverage['/format.js'].branchData['194'][5] = new BranchData();
  _$jscoverage['/format.js'].branchData['195'] = [];
  _$jscoverage['/format.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['195'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['195'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['200'] = [];
  _$jscoverage['/format.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['200'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['200'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['201'] = [];
  _$jscoverage['/format.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['205'] = [];
  _$jscoverage['/format.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['205'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['205'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['340'] = [];
  _$jscoverage['/format.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['350'] = [];
  _$jscoverage['/format.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['355'] = [];
  _$jscoverage['/format.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['358'] = [];
  _$jscoverage['/format.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['362'] = [];
  _$jscoverage['/format.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['364'] = [];
  _$jscoverage['/format.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['371'] = [];
  _$jscoverage['/format.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['376'] = [];
  _$jscoverage['/format.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['381'] = [];
  _$jscoverage['/format.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['387'] = [];
  _$jscoverage['/format.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['395'] = [];
  _$jscoverage['/format.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['423'] = [];
  _$jscoverage['/format.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['426'] = [];
  _$jscoverage['/format.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['426'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['432'] = [];
  _$jscoverage['/format.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['439'] = [];
  _$jscoverage['/format.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['440'] = [];
  _$jscoverage['/format.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['450'] = [];
  _$jscoverage['/format.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['452'] = [];
  _$jscoverage['/format.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['452'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['452'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['461'] = [];
  _$jscoverage['/format.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['462'] = [];
  _$jscoverage['/format.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['466'] = [];
  _$jscoverage['/format.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['473'] = [];
  _$jscoverage['/format.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['484'] = [];
  _$jscoverage['/format.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['489'] = [];
  _$jscoverage['/format.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['490'] = [];
  _$jscoverage['/format.js'].branchData['490'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['491'] = [];
  _$jscoverage['/format.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['501'] = [];
  _$jscoverage['/format.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['503'] = [];
  _$jscoverage['/format.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['504'] = [];
  _$jscoverage['/format.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['513'] = [];
  _$jscoverage['/format.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['514'] = [];
  _$jscoverage['/format.js'].branchData['514'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['514'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['519'] = [];
  _$jscoverage['/format.js'].branchData['519'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['523'] = [];
  _$jscoverage['/format.js'].branchData['523'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['528'] = [];
  _$jscoverage['/format.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['533'] = [];
  _$jscoverage['/format.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['533'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['540'] = [];
  _$jscoverage['/format.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['541'] = [];
  _$jscoverage['/format.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['542'] = [];
  _$jscoverage['/format.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['544'] = [];
  _$jscoverage['/format.js'].branchData['544'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['554'] = [];
  _$jscoverage['/format.js'].branchData['554'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['556'] = [];
  _$jscoverage['/format.js'].branchData['556'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['563'] = [];
  _$jscoverage['/format.js'].branchData['563'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['565'] = [];
  _$jscoverage['/format.js'].branchData['565'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['572'] = [];
  _$jscoverage['/format.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['575'] = [];
  _$jscoverage['/format.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['578'] = [];
  _$jscoverage['/format.js'].branchData['578'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['583'] = [];
  _$jscoverage['/format.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['586'] = [];
  _$jscoverage['/format.js'].branchData['586'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['602'] = [];
  _$jscoverage['/format.js'].branchData['602'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['607'] = [];
  _$jscoverage['/format.js'].branchData['607'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['628'] = [];
  _$jscoverage['/format.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['630'] = [];
  _$jscoverage['/format.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['632'] = [];
  _$jscoverage['/format.js'].branchData['632'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['659'] = [];
  _$jscoverage['/format.js'].branchData['659'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['659'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['659'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['662'] = [];
  _$jscoverage['/format.js'].branchData['662'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['664'] = [];
  _$jscoverage['/format.js'].branchData['664'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['667'] = [];
  _$jscoverage['/format.js'].branchData['667'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['668'] = [];
  _$jscoverage['/format.js'].branchData['668'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['675'] = [];
  _$jscoverage['/format.js'].branchData['675'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['678'] = [];
  _$jscoverage['/format.js'].branchData['678'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['679'] = [];
  _$jscoverage['/format.js'].branchData['679'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['683'] = [];
  _$jscoverage['/format.js'].branchData['683'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['683'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['683'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['696'] = [];
  _$jscoverage['/format.js'].branchData['696'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['703'] = [];
  _$jscoverage['/format.js'].branchData['703'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['751'] = [];
  _$jscoverage['/format.js'].branchData['751'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['753'] = [];
  _$jscoverage['/format.js'].branchData['753'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['757'] = [];
  _$jscoverage['/format.js'].branchData['757'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['761'] = [];
  _$jscoverage['/format.js'].branchData['761'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['762'] = [];
  _$jscoverage['/format.js'].branchData['762'][1] = new BranchData();
}
_$jscoverage['/format.js'].branchData['762'][1].init(21, 11, 'datePattern');
function visit120_762_1(result) {
  _$jscoverage['/format.js'].branchData['762'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['761'][1].init(408, 11, 'timePattern');
function visit119_761_1(result) {
  _$jscoverage['/format.js'].branchData['761'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['757'][1].init(250, 23, 'timeStyle !== undefined');
function visit118_757_1(result) {
  _$jscoverage['/format.js'].branchData['757'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['753'][1].init(97, 23, 'dateStyle !== undefined');
function visit117_753_1(result) {
  _$jscoverage['/format.js'].branchData['753'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['751'][1].init(22, 23, 'locale || defaultLocale');
function visit116_751_1(result) {
  _$jscoverage['/format.js'].branchData['751'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['703'][1].init(2447, 15, 'errorIndex >= 0');
function visit115_703_1(result) {
  _$jscoverage['/format.js'].branchData['703'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['696'][1].init(907, 27, 'startIndex == oldStartIndex');
function visit114_696_1(result) {
  _$jscoverage['/format.js'].branchData['696'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['683'][3].init(114, 8, 'c <= \'9\'');
function visit113_683_3(result) {
  _$jscoverage['/format.js'].branchData['683'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['683'][2].init(102, 8, 'c >= \'0\'');
function visit112_683_2(result) {
  _$jscoverage['/format.js'].branchData['683'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['683'][1].init(102, 20, 'c >= \'0\' && c <= \'9\'');
function visit111_683_1(result) {
  _$jscoverage['/format.js'].branchData['683'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['679'][1].init(33, 19, '\'field\' in nextComp');
function visit110_679_1(result) {
  _$jscoverage['/format.js'].branchData['679'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['678'][1].init(127, 8, 'nextComp');
function visit109_678_1(result) {
  _$jscoverage['/format.js'].branchData['678'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['675'][1].init(788, 15, '\'field\' in comp');
function visit108_675_1(result) {
  _$jscoverage['/format.js'].branchData['675'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['668'][1].init(37, 48, 'text.charAt(j) != dateStr.charAt(j + startIndex)');
function visit107_668_1(result) {
  _$jscoverage['/format.js'].branchData['668'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['667'][1].init(41, 11, 'j < textLen');
function visit106_667_1(result) {
  _$jscoverage['/format.js'].branchData['667'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['664'][1].init(77, 34, '(textLen + startIndex) > dateStrLen');
function visit105_664_1(result) {
  _$jscoverage['/format.js'].branchData['664'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['662'][1].init(131, 16, 'text = comp.text');
function visit104_662_1(result) {
  _$jscoverage['/format.js'].branchData['662'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['659'][3].init(47, 7, 'i < len');
function visit103_659_3(result) {
  _$jscoverage['/format.js'].branchData['659'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['659'][2].init(29, 14, 'errorIndex < 0');
function visit102_659_2(result) {
  _$jscoverage['/format.js'].branchData['659'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['659'][1].init(29, 25, 'errorIndex < 0 && i < len');
function visit101_659_1(result) {
  _$jscoverage['/format.js'].branchData['659'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['632'][1].init(142, 15, '\'field\' in comp');
function visit100_632_1(result) {
  _$jscoverage['/format.js'].branchData['632'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['630'][1].init(60, 9, 'comp.text');
function visit99_630_1(result) {
  _$jscoverage['/format.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['628'][1].init(361, 7, 'i < len');
function visit98_628_1(result) {
  _$jscoverage['/format.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['607'][1].init(4678, 5, 'match');
function visit97_607_1(result) {
  _$jscoverage['/format.js'].branchData['607'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['602'][1].init(289, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit96_602_1(result) {
  _$jscoverage['/format.js'].branchData['602'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['586'][1].init(131, 49, 'match = matchNumber(dateStr, startIndex, 2, true)');
function visit95_586_1(result) {
  _$jscoverage['/format.js'].branchData['586'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['583'][1].init(409, 49, 'match = matchNumber(dateStr, startIndex, 2, true)');
function visit94_583_1(result) {
  _$jscoverage['/format.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['578'][1].init(267, 15, 'zoneChar == \'+\'');
function visit93_578_1(result) {
  _$jscoverage['/format.js'].branchData['578'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['575'][1].init(155, 15, 'zoneChar == \'-\'');
function visit92_575_1(result) {
  _$jscoverage['/format.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['572'][1].init(29, 7, 'dateStr');
function visit91_572_1(result) {
  _$jscoverage['/format.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['565'][1].init(65, 8, 'tmp.ampm');
function visit90_565_1(result) {
  _$jscoverage['/format.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['563'][1].init(29, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit89_563_1(result) {
  _$jscoverage['/format.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['556'][1].init(71, 8, 'tmp.ampm');
function visit88_556_1(result) {
  _$jscoverage['/format.js'].branchData['556'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['554'][1].init(29, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit87_554_1(result) {
  _$jscoverage['/format.js'].branchData['554'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['544'][1].init(93, 9, 'hour < 12');
function visit86_544_1(result) {
  _$jscoverage['/format.js'].branchData['544'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['542'][1].init(29, 11, 'match.value');
function visit85_542_1(result) {
  _$jscoverage['/format.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['541'][1].init(25, 25, 'calendar.isSetHourOfDay()');
function visit84_541_1(result) {
  _$jscoverage['/format.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['540'][1].init(29, 53, 'match = matchField(dateStr, startIndex, locale.ampms)');
function visit83_540_1(result) {
  _$jscoverage['/format.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['533'][2].init(76, 9, 'count > 3');
function visit82_533_2(result) {
  _$jscoverage['/format.js'].branchData['533'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['533'][1].init(29, 129, 'match = matchField(dateStr, startIndex, locale[count > 3 ? \'weekdays\' : \'shortWeekdays\'])');
function visit81_533_1(result) {
  _$jscoverage['/format.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['528'][1].init(29, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit80_528_1(result) {
  _$jscoverage['/format.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['523'][1].init(495, 5, 'match');
function visit79_523_1(result) {
  _$jscoverage['/format.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['519'][1].init(25, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit78_519_1(result) {
  _$jscoverage['/format.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['514'][2].init(72, 10, 'count == 3');
function visit77_514_2(result) {
  _$jscoverage['/format.js'].branchData['514'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['514'][1].init(25, 110, 'match = matchField(dateStr, startIndex, locale[count == 3 ? \'shortMonths\' : \'months\'])');
function visit76_514_1(result) {
  _$jscoverage['/format.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['513'][1].init(56, 10, 'count >= 3');
function visit75_513_1(result) {
  _$jscoverage['/format.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['504'][1].init(29, 13, 'tmp.era === 0');
function visit74_504_1(result) {
  _$jscoverage['/format.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['503'][1].init(65, 12, '\'era\' in tmp');
function visit73_503_1(result) {
  _$jscoverage['/format.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['501'][1].init(29, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit72_501_1(result) {
  _$jscoverage['/format.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['491'][1].init(29, 16, 'match.value == 0');
function visit71_491_1(result) {
  _$jscoverage['/format.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['490'][1].init(25, 20, 'calendar.isSetYear()');
function visit70_490_1(result) {
  _$jscoverage['/format.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['489'][1].init(29, 52, 'match = matchField(dateStr, startIndex, locale.eras)');
function visit69_489_1(result) {
  _$jscoverage['/format.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['484'][1].init(44, 28, 'dateStr.length <= startIndex');
function visit68_484_1(result) {
  _$jscoverage['/format.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['473'][1].init(409, 8, 'isNaN(n)');
function visit67_473_1(result) {
  _$jscoverage['/format.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['466'][1].init(172, 19, '!str.match(/^\\d+$/)');
function visit66_466_1(result) {
  _$jscoverage['/format.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['462'][1].init(17, 36, 'dateStr.length <= startIndex + count');
function visit65_462_1(result) {
  _$jscoverage['/format.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['461'][1].init(44, 9, 'obeyCount');
function visit64_461_1(result) {
  _$jscoverage['/format.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['452'][3].init(59, 7, 'c > \'9\'');
function visit63_452_3(result) {
  _$jscoverage['/format.js'].branchData['452'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['452'][2].init(48, 7, 'c < \'0\'');
function visit62_452_2(result) {
  _$jscoverage['/format.js'].branchData['452'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['452'][1].init(48, 18, 'c < \'0\' || c > \'9\'');
function visit61_452_1(result) {
  _$jscoverage['/format.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['450'][1].init(69, 7, 'i < len');
function visit60_450_1(result) {
  _$jscoverage['/format.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['440'][1].init(17, 49, 'dateStr.charAt(startIndex + i) != match.charAt(i)');
function visit59_440_1(result) {
  _$jscoverage['/format.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['439'][1].init(25, 8, 'i < mLen');
function visit58_439_1(result) {
  _$jscoverage['/format.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['432'][1].init(407, 10, 'index >= 0');
function visit57_432_1(result) {
  _$jscoverage['/format.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['426'][2].init(82, 17, 'mLen > matchedLen');
function visit56_426_2(result) {
  _$jscoverage['/format.js'].branchData['426'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['426'][1].init(82, 82, 'mLen > matchedLen && matchPartString(dateStr, startIndex, m, mLen)');
function visit55_426_1(result) {
  _$jscoverage['/format.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['423'][1].init(123, 7, 'i < len');
function visit54_423_1(result) {
  _$jscoverage['/format.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['395'][1].init(97, 10, 'offset < 0');
function visit53_395_1(result) {
  _$jscoverage['/format.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['387'][1].init(17, 55, 'calendar.getHourOfDay() % 12 || 12');
function visit52_387_1(result) {
  _$jscoverage['/format.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['381'][1].init(48, 29, 'calendar.getHourOfDay() >= 12');
function visit51_381_1(result) {
  _$jscoverage['/format.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['376'][1].init(84, 10, 'count >= 4');
function visit50_376_1(result) {
  _$jscoverage['/format.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['371'][1].init(53, 29, 'calendar.getHourOfDay() || 24');
function visit49_371_1(result) {
  _$jscoverage['/format.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['364'][1].init(168, 10, 'count == 3');
function visit48_364_1(result) {
  _$jscoverage['/format.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['362'][1].init(74, 10, 'count >= 4');
function visit47_362_1(result) {
  _$jscoverage['/format.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['358'][1].init(199, 10, 'count != 2');
function visit46_358_1(result) {
  _$jscoverage['/format.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['355'][1].init(73, 10, 'value <= 0');
function visit45_355_1(result) {
  _$jscoverage['/format.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['350'][1].init(33, 22, 'calendar.getYear() > 0');
function visit44_350_1(result) {
  _$jscoverage['/format.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['340'][1].init(23, 23, 'locale || defaultLocale');
function visit43_340_1(result) {
  _$jscoverage['/format.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['205'][3].init(179, 14, 'maxDigits == 2');
function visit42_205_3(result) {
  _$jscoverage['/format.js'].branchData['205'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['205'][2].init(161, 14, 'minDigits == 2');
function visit41_205_2(result) {
  _$jscoverage['/format.js'].branchData['205'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['205'][1].init(161, 32, 'minDigits == 2 && maxDigits == 2');
function visit40_205_1(result) {
  _$jscoverage['/format.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['201'][1].init(21, 14, 'minDigits == 4');
function visit39_201_1(result) {
  _$jscoverage['/format.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['200'][3].init(299, 13, 'value < 10000');
function visit38_200_3(result) {
  _$jscoverage['/format.js'].branchData['200'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['200'][2].init(282, 13, 'value >= 1000');
function visit37_200_2(result) {
  _$jscoverage['/format.js'].branchData['200'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['200'][1].init(282, 30, 'value >= 1000 && value < 10000');
function visit36_200_1(result) {
  _$jscoverage['/format.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['195'][3].init(35, 14, 'minDigits == 2');
function visit35_195_3(result) {
  _$jscoverage['/format.js'].branchData['195'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['195'][2].init(21, 10, 'value < 10');
function visit34_195_2(result) {
  _$jscoverage['/format.js'].branchData['195'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['195'][1].init(21, 28, 'value < 10 && minDigits == 2');
function visit33_195_1(result) {
  _$jscoverage['/format.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['194'][5].init(50, 14, 'minDigits <= 2');
function visit32_194_5(result) {
  _$jscoverage['/format.js'].branchData['194'][5].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['194'][4].init(32, 14, 'minDigits >= 1');
function visit31_194_4(result) {
  _$jscoverage['/format.js'].branchData['194'][4].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['194'][3].init(32, 32, 'minDigits >= 1 && minDigits <= 2');
function visit30_194_3(result) {
  _$jscoverage['/format.js'].branchData['194'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['194'][2].init(17, 11, 'value < 100');
function visit29_194_2(result) {
  _$jscoverage['/format.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['194'][1].init(17, 47, 'value < 100 && minDigits >= 1 && minDigits <= 2');
function visit28_194_1(result) {
  _$jscoverage['/format.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['193'][1].init(355, 10, 'value >= 0');
function visit27_193_1(result) {
  _$jscoverage['/format.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['192'][1].init(319, 22, 'maxDigits || MAX_VALUE');
function visit26_192_1(result) {
  _$jscoverage['/format.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['191'][1].init(285, 12, 'buffer || []');
function visit25_191_1(result) {
  _$jscoverage['/format.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['176'][1].init(2497, 10, 'count != 0');
function visit24_176_1(result) {
  _$jscoverage['/format.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['172'][1].init(2412, 7, 'inQuote');
function visit23_172_1(result) {
  _$jscoverage['/format.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['162'][3].init(1945, 14, 'lastField == c');
function visit22_162_3(result) {
  _$jscoverage['/format.js'].branchData['162'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['162'][2].init(1926, 15, 'lastField == -1');
function visit21_162_2(result) {
  _$jscoverage['/format.js'].branchData['162'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['162'][1].init(1926, 33, 'lastField == -1 || lastField == c');
function visit20_162_1(result) {
  _$jscoverage['/format.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['157'][1].init(1763, 29, 'patternChars.indexOf(c) == -1');
function visit19_157_1(result) {
  _$jscoverage['/format.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['146'][1].init(21, 10, 'count != 0');
function visit18_146_1(result) {
  _$jscoverage['/format.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][8].init(1424, 8, 'c <= \'Z\'');
function visit17_145_8(result) {
  _$jscoverage['/format.js'].branchData['145'][8].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][7].init(1412, 8, 'c >= \'A\'');
function visit16_145_7(result) {
  _$jscoverage['/format.js'].branchData['145'][7].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][6].init(1412, 20, 'c >= \'A\' && c <= \'Z\'');
function visit15_145_6(result) {
  _$jscoverage['/format.js'].branchData['145'][6].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][5].init(1400, 8, 'c <= \'z\'');
function visit14_145_5(result) {
  _$jscoverage['/format.js'].branchData['145'][5].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][4].init(1388, 8, 'c >= \'a\'');
function visit13_145_4(result) {
  _$jscoverage['/format.js'].branchData['145'][4].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][3].init(1388, 20, 'c >= \'a\' && c <= \'z\'');
function visit12_145_3(result) {
  _$jscoverage['/format.js'].branchData['145'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][2].init(1388, 44, 'c >= \'a\' && c <= \'z\' || c >= \'A\' && c <= \'Z\'');
function visit11_145_2(result) {
  _$jscoverage['/format.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][1].init(1386, 47, '!(c >= \'a\' && c <= \'z\' || c >= \'A\' && c <= \'Z\')');
function visit10_145_1(result) {
  _$jscoverage['/format.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['141'][1].init(1287, 7, 'inQuote');
function visit9_141_1(result) {
  _$jscoverage['/format.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['126'][1].init(25, 10, 'count != 0');
function visit8_126_1(result) {
  _$jscoverage['/format.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['125'][1].init(690, 8, '!inQuote');
function visit7_125_1(result) {
  _$jscoverage['/format.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['119'][1].init(280, 7, 'inQuote');
function visit6_119_1(result) {
  _$jscoverage['/format.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['114'][1].init(58, 10, 'count != 0');
function visit5_114_1(result) {
  _$jscoverage['/format.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['112'][1].init(72, 9, 'c == \'\\\'\'');
function visit4_112_1(result) {
  _$jscoverage['/format.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['110'][1].init(133, 15, '(i + 1) < length');
function visit3_110_1(result) {
  _$jscoverage['/format.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['107'][1].init(57, 8, 'c == "\'"');
function visit2_107_1(result) {
  _$jscoverage['/format.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['104'][1].init(207, 10, 'i < length');
function visit1_104_1(result) {
  _$jscoverage['/format.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].lineData[7]++;
KISSY.add(function(S, require) {
  _$jscoverage['/format.js'].functionData[0]++;
  _$jscoverage['/format.js'].lineData[8]++;
  var GregorianCalendar = require('date/gregorian');
  _$jscoverage['/format.js'].lineData[9]++;
  var defaultLocale = require('i18n!date');
  _$jscoverage['/format.js'].lineData[10]++;
  var MAX_VALUE = Number.MAX_VALUE, undefined = undefined, DateTimeStyle = {
  FULL: 0, 
  LONG: 1, 
  MEDIUM: 2, 
  SHORT: 3};
  _$jscoverage['/format.js'].lineData[34]++;
  var logger = S.getLogger('s/date/format');
  _$jscoverage['/format.js'].lineData[59]++;
  var patternChars = new Array(GregorianCalendar.DAY_OF_WEEK_IN_MONTH + 2).join('1');
  _$jscoverage['/format.js'].lineData[62]++;
  var ERA = 0;
  _$jscoverage['/format.js'].lineData[64]++;
  var calendarIndexMap = {};
  _$jscoverage['/format.js'].lineData[66]++;
  patternChars = patternChars.split('');
  _$jscoverage['/format.js'].lineData[67]++;
  patternChars[ERA] = 'G';
  _$jscoverage['/format.js'].lineData[68]++;
  patternChars[GregorianCalendar.YEAR] = 'y';
  _$jscoverage['/format.js'].lineData[69]++;
  patternChars[GregorianCalendar.MONTH] = 'M';
  _$jscoverage['/format.js'].lineData[70]++;
  patternChars[GregorianCalendar.DAY_OF_MONTH] = 'd';
  _$jscoverage['/format.js'].lineData[71]++;
  patternChars[GregorianCalendar.HOUR_OF_DAY] = 'H';
  _$jscoverage['/format.js'].lineData[72]++;
  patternChars[GregorianCalendar.MINUTES] = 'm';
  _$jscoverage['/format.js'].lineData[73]++;
  patternChars[GregorianCalendar.SECONDS] = 's';
  _$jscoverage['/format.js'].lineData[74]++;
  patternChars[GregorianCalendar.MILLISECONDS] = 'S';
  _$jscoverage['/format.js'].lineData[75]++;
  patternChars[GregorianCalendar.WEEK_OF_YEAR] = 'w';
  _$jscoverage['/format.js'].lineData[76]++;
  patternChars[GregorianCalendar.WEEK_OF_MONTH] = 'W';
  _$jscoverage['/format.js'].lineData[77]++;
  patternChars[GregorianCalendar.DAY_OF_YEAR] = 'D';
  _$jscoverage['/format.js'].lineData[78]++;
  patternChars[GregorianCalendar.DAY_OF_WEEK_IN_MONTH] = 'F';
  _$jscoverage['/format.js'].lineData[80]++;
  S.each(patternChars, function(v, index) {
  _$jscoverage['/format.js'].functionData[1]++;
  _$jscoverage['/format.js'].lineData[81]++;
  calendarIndexMap[v] = index;
});
  _$jscoverage['/format.js'].lineData[84]++;
  patternChars = patternChars.join('') + 'ahkKZE';
  _$jscoverage['/format.js'].lineData[89]++;
  function encode(lastField, count, compiledPattern) {
    _$jscoverage['/format.js'].functionData[2]++;
    _$jscoverage['/format.js'].lineData[90]++;
    compiledPattern.push({
  field: lastField, 
  count: count});
  }
  _$jscoverage['/format.js'].lineData[96]++;
  function compile(pattern) {
    _$jscoverage['/format.js'].functionData[3]++;
    _$jscoverage['/format.js'].lineData[97]++;
    var length = pattern.length;
    _$jscoverage['/format.js'].lineData[98]++;
    var inQuote = false;
    _$jscoverage['/format.js'].lineData[99]++;
    var compiledPattern = [];
    _$jscoverage['/format.js'].lineData[100]++;
    var tmpBuffer = null;
    _$jscoverage['/format.js'].lineData[101]++;
    var count = 0;
    _$jscoverage['/format.js'].lineData[102]++;
    var lastField = -1;
    _$jscoverage['/format.js'].lineData[104]++;
    for (var i = 0; visit1_104_1(i < length); i++) {
      _$jscoverage['/format.js'].lineData[105]++;
      var c = pattern.charAt(i);
      _$jscoverage['/format.js'].lineData[107]++;
      if (visit2_107_1(c == "'")) {
        _$jscoverage['/format.js'].lineData[110]++;
        if (visit3_110_1((i + 1) < length)) {
          _$jscoverage['/format.js'].lineData[111]++;
          c = pattern.charAt(i + 1);
          _$jscoverage['/format.js'].lineData[112]++;
          if (visit4_112_1(c == '\'')) {
            _$jscoverage['/format.js'].lineData[113]++;
            i++;
            _$jscoverage['/format.js'].lineData[114]++;
            if (visit5_114_1(count != 0)) {
              _$jscoverage['/format.js'].lineData[115]++;
              encode(lastField, count, compiledPattern);
              _$jscoverage['/format.js'].lineData[116]++;
              lastField = -1;
              _$jscoverage['/format.js'].lineData[117]++;
              count = 0;
            }
            _$jscoverage['/format.js'].lineData[119]++;
            if (visit6_119_1(inQuote)) {
              _$jscoverage['/format.js'].lineData[120]++;
              tmpBuffer += c;
            }
            _$jscoverage['/format.js'].lineData[122]++;
            continue;
          }
        }
        _$jscoverage['/format.js'].lineData[125]++;
        if (visit7_125_1(!inQuote)) {
          _$jscoverage['/format.js'].lineData[126]++;
          if (visit8_126_1(count != 0)) {
            _$jscoverage['/format.js'].lineData[127]++;
            encode(lastField, count, compiledPattern);
            _$jscoverage['/format.js'].lineData[128]++;
            lastField = -1;
            _$jscoverage['/format.js'].lineData[129]++;
            count = 0;
          }
          _$jscoverage['/format.js'].lineData[131]++;
          tmpBuffer = '';
          _$jscoverage['/format.js'].lineData[132]++;
          inQuote = true;
        } else {
          _$jscoverage['/format.js'].lineData[134]++;
          compiledPattern.push({
  text: tmpBuffer});
          _$jscoverage['/format.js'].lineData[137]++;
          inQuote = false;
        }
        _$jscoverage['/format.js'].lineData[139]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[141]++;
      if (visit9_141_1(inQuote)) {
        _$jscoverage['/format.js'].lineData[142]++;
        tmpBuffer += c;
        _$jscoverage['/format.js'].lineData[143]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[145]++;
      if (visit10_145_1(!(visit11_145_2(visit12_145_3(visit13_145_4(c >= 'a') && visit14_145_5(c <= 'z')) || visit15_145_6(visit16_145_7(c >= 'A') && visit17_145_8(c <= 'Z')))))) {
        _$jscoverage['/format.js'].lineData[146]++;
        if (visit18_146_1(count != 0)) {
          _$jscoverage['/format.js'].lineData[147]++;
          encode(lastField, count, compiledPattern);
          _$jscoverage['/format.js'].lineData[148]++;
          lastField = -1;
          _$jscoverage['/format.js'].lineData[149]++;
          count = 0;
        }
        _$jscoverage['/format.js'].lineData[151]++;
        compiledPattern.push({
  text: c});
        _$jscoverage['/format.js'].lineData[154]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[157]++;
      if (visit19_157_1(patternChars.indexOf(c) == -1)) {
        _$jscoverage['/format.js'].lineData[158]++;
        throw new Error("Illegal pattern character " + "'" + c + "'");
      }
      _$jscoverage['/format.js'].lineData[162]++;
      if (visit20_162_1(visit21_162_2(lastField == -1) || visit22_162_3(lastField == c))) {
        _$jscoverage['/format.js'].lineData[163]++;
        lastField = c;
        _$jscoverage['/format.js'].lineData[164]++;
        count++;
        _$jscoverage['/format.js'].lineData[165]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[167]++;
      encode(lastField, count, compiledPattern);
      _$jscoverage['/format.js'].lineData[168]++;
      lastField = c;
      _$jscoverage['/format.js'].lineData[169]++;
      count = 1;
    }
    _$jscoverage['/format.js'].lineData[172]++;
    if (visit23_172_1(inQuote)) {
      _$jscoverage['/format.js'].lineData[173]++;
      throw new Error("Unterminated quote");
    }
    _$jscoverage['/format.js'].lineData[176]++;
    if (visit24_176_1(count != 0)) {
      _$jscoverage['/format.js'].lineData[177]++;
      encode(lastField, count, compiledPattern);
    }
    _$jscoverage['/format.js'].lineData[180]++;
    return compiledPattern;
  }
  _$jscoverage['/format.js'].lineData[183]++;
  var zeroDigit = '0';
  _$jscoverage['/format.js'].lineData[186]++;
  function zeroPaddingNumber(value, minDigits, maxDigits, buffer) {
    _$jscoverage['/format.js'].functionData[4]++;
    _$jscoverage['/format.js'].lineData[191]++;
    buffer = visit25_191_1(buffer || []);
    _$jscoverage['/format.js'].lineData[192]++;
    maxDigits = visit26_192_1(maxDigits || MAX_VALUE);
    _$jscoverage['/format.js'].lineData[193]++;
    if (visit27_193_1(value >= 0)) {
      _$jscoverage['/format.js'].lineData[194]++;
      if (visit28_194_1(visit29_194_2(value < 100) && visit30_194_3(visit31_194_4(minDigits >= 1) && visit32_194_5(minDigits <= 2)))) {
        _$jscoverage['/format.js'].lineData[195]++;
        if (visit33_195_1(visit34_195_2(value < 10) && visit35_195_3(minDigits == 2))) {
          _$jscoverage['/format.js'].lineData[196]++;
          buffer.push(zeroDigit);
        }
        _$jscoverage['/format.js'].lineData[198]++;
        buffer.push(value);
        _$jscoverage['/format.js'].lineData[199]++;
        return buffer.join('');
      } else {
        _$jscoverage['/format.js'].lineData[200]++;
        if (visit36_200_1(visit37_200_2(value >= 1000) && visit38_200_3(value < 10000))) {
          _$jscoverage['/format.js'].lineData[201]++;
          if (visit39_201_1(minDigits == 4)) {
            _$jscoverage['/format.js'].lineData[202]++;
            buffer.push(value);
            _$jscoverage['/format.js'].lineData[203]++;
            return buffer.join('');
          }
          _$jscoverage['/format.js'].lineData[205]++;
          if (visit40_205_1(visit41_205_2(minDigits == 2) && visit42_205_3(maxDigits == 2))) {
            _$jscoverage['/format.js'].lineData[206]++;
            return zeroPaddingNumber(value % 100, 2, 2, buffer);
          }
        }
      }
    }
    _$jscoverage['/format.js'].lineData[210]++;
    buffer.push(value + '');
    _$jscoverage['/format.js'].lineData[211]++;
    return buffer.join('');
  }
  _$jscoverage['/format.js'].lineData[339]++;
  function DateTimeFormat(pattern, locale, timeZoneOffset) {
    _$jscoverage['/format.js'].functionData[5]++;
    _$jscoverage['/format.js'].lineData[340]++;
    this.locale = visit43_340_1(locale || defaultLocale);
    _$jscoverage['/format.js'].lineData[341]++;
    this.pattern = compile(pattern);
    _$jscoverage['/format.js'].lineData[342]++;
    this.timezoneOffset = timeZoneOffset;
  }
  _$jscoverage['/format.js'].lineData[345]++;
  function formatField(field, count, locale, calendar) {
    _$jscoverage['/format.js'].functionData[6]++;
    _$jscoverage['/format.js'].lineData[346]++;
    var current, value;
    _$jscoverage['/format.js'].lineData[348]++;
    switch (field) {
      case 'G':
        _$jscoverage['/format.js'].lineData[350]++;
        value = visit44_350_1(calendar.getYear() > 0) ? 1 : 0;
        _$jscoverage['/format.js'].lineData[351]++;
        current = locale.eras[value];
        _$jscoverage['/format.js'].lineData[352]++;
        break;
      case 'y':
        _$jscoverage['/format.js'].lineData[354]++;
        value = calendar.getYear();
        _$jscoverage['/format.js'].lineData[355]++;
        if (visit45_355_1(value <= 0)) {
          _$jscoverage['/format.js'].lineData[356]++;
          value = 1 - value;
        }
        _$jscoverage['/format.js'].lineData[358]++;
        current = (zeroPaddingNumber(value, 2, visit46_358_1(count != 2) ? MAX_VALUE : 2));
        _$jscoverage['/format.js'].lineData[359]++;
        break;
      case 'M':
        _$jscoverage['/format.js'].lineData[361]++;
        value = calendar.getMonth();
        _$jscoverage['/format.js'].lineData[362]++;
        if (visit47_362_1(count >= 4)) {
          _$jscoverage['/format.js'].lineData[363]++;
          current = locale.months[value];
        } else {
          _$jscoverage['/format.js'].lineData[364]++;
          if (visit48_364_1(count == 3)) {
            _$jscoverage['/format.js'].lineData[365]++;
            current = locale.shortMonths[value];
          } else {
            _$jscoverage['/format.js'].lineData[367]++;
            current = zeroPaddingNumber(value + 1, count);
          }
        }
        _$jscoverage['/format.js'].lineData[369]++;
        break;
      case 'k':
        _$jscoverage['/format.js'].lineData[371]++;
        current = zeroPaddingNumber(visit49_371_1(calendar.getHourOfDay() || 24), count);
        _$jscoverage['/format.js'].lineData[373]++;
        break;
      case 'E':
        _$jscoverage['/format.js'].lineData[375]++;
        value = calendar.getDayOfWeek();
        _$jscoverage['/format.js'].lineData[376]++;
        current = visit50_376_1(count >= 4) ? locale.weekdays[value] : locale.shortWeekdays[value];
        _$jscoverage['/format.js'].lineData[379]++;
        break;
      case 'a':
        _$jscoverage['/format.js'].lineData[381]++;
        current = locale.ampms[visit51_381_1(calendar.getHourOfDay() >= 12) ? 1 : 0];
        _$jscoverage['/format.js'].lineData[384]++;
        break;
      case 'h':
        _$jscoverage['/format.js'].lineData[386]++;
        current = zeroPaddingNumber(visit52_387_1(calendar.getHourOfDay() % 12 || 12), count);
        _$jscoverage['/format.js'].lineData[388]++;
        break;
      case 'K':
        _$jscoverage['/format.js'].lineData[390]++;
        current = zeroPaddingNumber(calendar.getHourOfDay() % 12, count);
        _$jscoverage['/format.js'].lineData[392]++;
        break;
      case 'Z':
        _$jscoverage['/format.js'].lineData[394]++;
        var offset = calendar.getTimezoneOffset();
        _$jscoverage['/format.js'].lineData[395]++;
        var parts = [visit53_395_1(offset < 0) ? '-' : '+'];
        _$jscoverage['/format.js'].lineData[396]++;
        offset = Math.abs(offset);
        _$jscoverage['/format.js'].lineData[397]++;
        parts.push(zeroPaddingNumber(Math.floor(offset / 60) % 100, 2), zeroPaddingNumber(offset % 60, 2));
        _$jscoverage['/format.js'].lineData[399]++;
        current = parts.join('');
        _$jscoverage['/format.js'].lineData[400]++;
        break;
      default:
        _$jscoverage['/format.js'].lineData[411]++;
        var index = calendarIndexMap[field];
        _$jscoverage['/format.js'].lineData[412]++;
        value = calendar.get(index);
        _$jscoverage['/format.js'].lineData[413]++;
        current = zeroPaddingNumber(value, count);
    }
    _$jscoverage['/format.js'].lineData[415]++;
    return current;
  }
  _$jscoverage['/format.js'].lineData[418]++;
  function matchField(dateStr, startIndex, matches) {
    _$jscoverage['/format.js'].functionData[7]++;
    _$jscoverage['/format.js'].lineData[419]++;
    var matchedLen = -1, index = -1, i, len = matches.length;
    _$jscoverage['/format.js'].lineData[423]++;
    for (i = 0; visit54_423_1(i < len); i++) {
      _$jscoverage['/format.js'].lineData[424]++;
      var m = matches[i];
      _$jscoverage['/format.js'].lineData[425]++;
      var mLen = m.length;
      _$jscoverage['/format.js'].lineData[426]++;
      if (visit55_426_1(visit56_426_2(mLen > matchedLen) && matchPartString(dateStr, startIndex, m, mLen))) {
        _$jscoverage['/format.js'].lineData[428]++;
        matchedLen = mLen;
        _$jscoverage['/format.js'].lineData[429]++;
        index = i;
      }
    }
    _$jscoverage['/format.js'].lineData[432]++;
    return visit57_432_1(index >= 0) ? {
  value: index, 
  startIndex: startIndex + matchedLen} : null;
  }
  _$jscoverage['/format.js'].lineData[438]++;
  function matchPartString(dateStr, startIndex, match, mLen) {
    _$jscoverage['/format.js'].functionData[8]++;
    _$jscoverage['/format.js'].lineData[439]++;
    for (var i = 0; visit58_439_1(i < mLen); i++) {
      _$jscoverage['/format.js'].lineData[440]++;
      if (visit59_440_1(dateStr.charAt(startIndex + i) != match.charAt(i))) {
        _$jscoverage['/format.js'].lineData[441]++;
        return false;
      }
    }
    _$jscoverage['/format.js'].lineData[444]++;
    return true;
  }
  _$jscoverage['/format.js'].lineData[447]++;
  function getLeadingNumberLen(str) {
    _$jscoverage['/format.js'].functionData[9]++;
    _$jscoverage['/format.js'].lineData[448]++;
    var i, c, len = str.length;
    _$jscoverage['/format.js'].lineData[450]++;
    for (i = 0; visit60_450_1(i < len); i++) {
      _$jscoverage['/format.js'].lineData[451]++;
      c = str.charAt(i);
      _$jscoverage['/format.js'].lineData[452]++;
      if (visit61_452_1(visit62_452_2(c < '0') || visit63_452_3(c > '9'))) {
        _$jscoverage['/format.js'].lineData[453]++;
        break;
      }
    }
    _$jscoverage['/format.js'].lineData[456]++;
    return i;
  }
  _$jscoverage['/format.js'].lineData[459]++;
  function matchNumber(dateStr, startIndex, count, obeyCount) {
    _$jscoverage['/format.js'].functionData[10]++;
    _$jscoverage['/format.js'].lineData[460]++;
    var str = dateStr, n;
    _$jscoverage['/format.js'].lineData[461]++;
    if (visit64_461_1(obeyCount)) {
      _$jscoverage['/format.js'].lineData[462]++;
      if (visit65_462_1(dateStr.length <= startIndex + count)) {
        _$jscoverage['/format.js'].lineData[463]++;
        return null;
      }
      _$jscoverage['/format.js'].lineData[465]++;
      str = dateStr.substring(startIndex, count);
      _$jscoverage['/format.js'].lineData[466]++;
      if (visit66_466_1(!str.match(/^\d+$/))) {
        _$jscoverage['/format.js'].lineData[467]++;
        return null;
      }
    } else {
      _$jscoverage['/format.js'].lineData[470]++;
      str = str.substring(startIndex);
    }
    _$jscoverage['/format.js'].lineData[472]++;
    n = parseInt(str, 10);
    _$jscoverage['/format.js'].lineData[473]++;
    if (visit67_473_1(isNaN(n))) {
      _$jscoverage['/format.js'].lineData[474]++;
      return null;
    }
    _$jscoverage['/format.js'].lineData[476]++;
    return {
  value: n, 
  startIndex: startIndex + getLeadingNumberLen(str)};
  }
  _$jscoverage['/format.js'].lineData[482]++;
  function parseField(calendar, dateStr, startIndex, field, count, locale, obeyCount, tmp) {
    _$jscoverage['/format.js'].functionData[11]++;
    _$jscoverage['/format.js'].lineData[483]++;
    var match, year, hour;
    _$jscoverage['/format.js'].lineData[484]++;
    if (visit68_484_1(dateStr.length <= startIndex)) {
      _$jscoverage['/format.js'].lineData[485]++;
      return startIndex;
    }
    _$jscoverage['/format.js'].lineData[487]++;
    switch (field) {
      case 'G':
        _$jscoverage['/format.js'].lineData[489]++;
        if (visit69_489_1(match = matchField(dateStr, startIndex, locale.eras))) {
          _$jscoverage['/format.js'].lineData[490]++;
          if (visit70_490_1(calendar.isSetYear())) {
            _$jscoverage['/format.js'].lineData[491]++;
            if (visit71_491_1(match.value == 0)) {
              _$jscoverage['/format.js'].lineData[492]++;
              year = calendar.getYear();
              _$jscoverage['/format.js'].lineData[493]++;
              calendar.setYear(1 - year);
            }
          } else {
            _$jscoverage['/format.js'].lineData[496]++;
            tmp.era = match.value;
          }
        }
        _$jscoverage['/format.js'].lineData[499]++;
        break;
      case 'y':
        _$jscoverage['/format.js'].lineData[501]++;
        if (visit72_501_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[502]++;
          year = match.value;
          _$jscoverage['/format.js'].lineData[503]++;
          if (visit73_503_1('era' in tmp)) {
            _$jscoverage['/format.js'].lineData[504]++;
            if (visit74_504_1(tmp.era === 0)) {
              _$jscoverage['/format.js'].lineData[505]++;
              year = 1 - year;
            }
          }
          _$jscoverage['/format.js'].lineData[508]++;
          calendar.setYear(year);
        }
        _$jscoverage['/format.js'].lineData[510]++;
        break;
      case 'M':
        _$jscoverage['/format.js'].lineData[512]++;
        var month;
        _$jscoverage['/format.js'].lineData[513]++;
        if (visit75_513_1(count >= 3)) {
          _$jscoverage['/format.js'].lineData[514]++;
          if (visit76_514_1(match = matchField(dateStr, startIndex, locale[visit77_514_2(count == 3) ? 'shortMonths' : 'months']))) {
            _$jscoverage['/format.js'].lineData[516]++;
            month = match.value;
          }
        } else {
          _$jscoverage['/format.js'].lineData[519]++;
          if (visit78_519_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
            _$jscoverage['/format.js'].lineData[520]++;
            month = match.value - 1;
          }
        }
        _$jscoverage['/format.js'].lineData[523]++;
        if (visit79_523_1(match)) {
          _$jscoverage['/format.js'].lineData[524]++;
          calendar.setMonth(month);
        }
        _$jscoverage['/format.js'].lineData[526]++;
        break;
      case 'k':
        _$jscoverage['/format.js'].lineData[528]++;
        if (visit80_528_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[529]++;
          calendar.setHourOfDay(match.value % 24);
        }
        _$jscoverage['/format.js'].lineData[531]++;
        break;
      case 'E':
        _$jscoverage['/format.js'].lineData[533]++;
        if (visit81_533_1(match = matchField(dateStr, startIndex, locale[visit82_533_2(count > 3) ? 'weekdays' : 'shortWeekdays']))) {
          _$jscoverage['/format.js'].lineData[536]++;
          calendar.setDayOfWeek(match.value);
        }
        _$jscoverage['/format.js'].lineData[538]++;
        break;
      case 'a':
        _$jscoverage['/format.js'].lineData[540]++;
        if (visit83_540_1(match = matchField(dateStr, startIndex, locale.ampms))) {
          _$jscoverage['/format.js'].lineData[541]++;
          if (visit84_541_1(calendar.isSetHourOfDay())) {
            _$jscoverage['/format.js'].lineData[542]++;
            if (visit85_542_1(match.value)) {
              _$jscoverage['/format.js'].lineData[543]++;
              hour = calendar.getHourOfDay();
              _$jscoverage['/format.js'].lineData[544]++;
              if (visit86_544_1(hour < 12)) {
                _$jscoverage['/format.js'].lineData[545]++;
                calendar.setHourOfDay((hour + 12) % 24);
              }
            }
          } else {
            _$jscoverage['/format.js'].lineData[549]++;
            tmp.ampm = match.value;
          }
        }
        _$jscoverage['/format.js'].lineData[552]++;
        break;
      case 'h':
        _$jscoverage['/format.js'].lineData[554]++;
        if (visit87_554_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[555]++;
          hour = match.value %= 12;
          _$jscoverage['/format.js'].lineData[556]++;
          if (visit88_556_1(tmp.ampm)) {
            _$jscoverage['/format.js'].lineData[557]++;
            hour += 12;
          }
          _$jscoverage['/format.js'].lineData[559]++;
          calendar.setHourOfDay(hour);
        }
        _$jscoverage['/format.js'].lineData[561]++;
        break;
      case 'K':
        _$jscoverage['/format.js'].lineData[563]++;
        if (visit89_563_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[564]++;
          hour = match.value;
          _$jscoverage['/format.js'].lineData[565]++;
          if (visit90_565_1(tmp.ampm)) {
            _$jscoverage['/format.js'].lineData[566]++;
            hour += 12;
          }
          _$jscoverage['/format.js'].lineData[568]++;
          calendar.setHourOfDay(hour);
        }
        _$jscoverage['/format.js'].lineData[570]++;
        break;
      case 'Z':
        _$jscoverage['/format.js'].lineData[572]++;
        if (visit91_572_1(dateStr)) {
          _$jscoverage['/format.js'].lineData[573]++;
          var sign = 1, zoneChar = dateStr.charAt(startIndex);
        }
        _$jscoverage['/format.js'].lineData[575]++;
        if (visit92_575_1(zoneChar == '-')) {
          _$jscoverage['/format.js'].lineData[576]++;
          sign = -1;
          _$jscoverage['/format.js'].lineData[577]++;
          startIndex++;
        } else {
          _$jscoverage['/format.js'].lineData[578]++;
          if (visit93_578_1(zoneChar == '+')) {
            _$jscoverage['/format.js'].lineData[579]++;
            startIndex++;
          } else {
            _$jscoverage['/format.js'].lineData[581]++;
            break;
          }
        }
        _$jscoverage['/format.js'].lineData[583]++;
        if (visit94_583_1(match = matchNumber(dateStr, startIndex, 2, true))) {
          _$jscoverage['/format.js'].lineData[584]++;
          var zoneOffset = match.value * 60;
          _$jscoverage['/format.js'].lineData[585]++;
          startIndex = match.startIndex;
          _$jscoverage['/format.js'].lineData[586]++;
          if (visit95_586_1(match = matchNumber(dateStr, startIndex, 2, true))) {
            _$jscoverage['/format.js'].lineData[587]++;
            zoneOffset += match.value;
          }
          _$jscoverage['/format.js'].lineData[589]++;
          calendar.setTimezoneOffset(zoneOffset);
        }
        _$jscoverage['/format.js'].lineData[591]++;
        break;
      default:
        _$jscoverage['/format.js'].lineData[602]++;
        if (visit96_602_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[603]++;
          var index = calendarIndexMap[field];
          _$jscoverage['/format.js'].lineData[604]++;
          calendar.set(index, match.value);
        }
    }
    _$jscoverage['/format.js'].lineData[607]++;
    if (visit97_607_1(match)) {
      _$jscoverage['/format.js'].lineData[608]++;
      startIndex = match.startIndex;
    }
    _$jscoverage['/format.js'].lineData[610]++;
    return startIndex;
  }
  _$jscoverage['/format.js'].lineData[613]++;
  DateTimeFormat.prototype = {
  format: function(calendar) {
  _$jscoverage['/format.js'].functionData[12]++;
  _$jscoverage['/format.js'].lineData[620]++;
  var time = calendar.getTime();
  _$jscoverage['/format.js'].lineData[621]++;
  calendar = new GregorianCalendar(this.timezoneOffset, this.locale);
  _$jscoverage['/format.js'].lineData[623]++;
  calendar.setTime(time);
  _$jscoverage['/format.js'].lineData[624]++;
  var i, ret = [], pattern = this.pattern, len = pattern.length;
  _$jscoverage['/format.js'].lineData[628]++;
  for (i = 0; visit98_628_1(i < len); i++) {
    _$jscoverage['/format.js'].lineData[629]++;
    var comp = pattern[i];
    _$jscoverage['/format.js'].lineData[630]++;
    if (visit99_630_1(comp.text)) {
      _$jscoverage['/format.js'].lineData[631]++;
      ret.push(comp.text);
    } else {
      _$jscoverage['/format.js'].lineData[632]++;
      if (visit100_632_1('field' in comp)) {
        _$jscoverage['/format.js'].lineData[633]++;
        ret.push(formatField(comp.field, comp.count, this.locale, calendar));
      }
    }
  }
  _$jscoverage['/format.js'].lineData[636]++;
  return ret.join('');
}, 
  parse: function(dateStr) {
  _$jscoverage['/format.js'].functionData[13]++;
  _$jscoverage['/format.js'].lineData[645]++;
  var calendar = new GregorianCalendar(this.timezoneOffset, this.locale), i, j, tmp = {}, obeyCount = false, dateStrLen = dateStr.length, errorIndex = -1, startIndex = 0, oldStartIndex = 0, pattern = this.pattern, len = pattern.length;
  _$jscoverage['/format.js'].lineData[658]++;
  loopPattern:
    {
      _$jscoverage['/format.js'].lineData[659]++;
      for (i = 0; visit101_659_1(visit102_659_2(errorIndex < 0) && visit103_659_3(i < len)); i++) {
        _$jscoverage['/format.js'].lineData[660]++;
        var comp = pattern[i], text, textLen;
        _$jscoverage['/format.js'].lineData[661]++;
        oldStartIndex = startIndex;
        _$jscoverage['/format.js'].lineData[662]++;
        if (visit104_662_1(text = comp.text)) {
          _$jscoverage['/format.js'].lineData[663]++;
          textLen = text.length;
          _$jscoverage['/format.js'].lineData[664]++;
          if (visit105_664_1((textLen + startIndex) > dateStrLen)) {
            _$jscoverage['/format.js'].lineData[665]++;
            errorIndex = startIndex;
          } else {
            _$jscoverage['/format.js'].lineData[667]++;
            for (j = 0; visit106_667_1(j < textLen); j++) {
              _$jscoverage['/format.js'].lineData[668]++;
              if (visit107_668_1(text.charAt(j) != dateStr.charAt(j + startIndex))) {
                _$jscoverage['/format.js'].lineData[669]++;
                errorIndex = startIndex;
                _$jscoverage['/format.js'].lineData[670]++;
                break loopPattern;
              }
            }
            _$jscoverage['/format.js'].lineData[673]++;
            startIndex += textLen;
          }
        } else {
          _$jscoverage['/format.js'].lineData[675]++;
          if (visit108_675_1('field' in comp)) {
            _$jscoverage['/format.js'].lineData[676]++;
            obeyCount = false;
            _$jscoverage['/format.js'].lineData[677]++;
            var nextComp = pattern[i + 1];
            _$jscoverage['/format.js'].lineData[678]++;
            if (visit109_678_1(nextComp)) {
              _$jscoverage['/format.js'].lineData[679]++;
              if (visit110_679_1('field' in nextComp)) {
                _$jscoverage['/format.js'].lineData[680]++;
                obeyCount = true;
              } else {
                _$jscoverage['/format.js'].lineData[682]++;
                var c = nextComp.text.charAt(0);
                _$jscoverage['/format.js'].lineData[683]++;
                if (visit111_683_1(visit112_683_2(c >= '0') && visit113_683_3(c <= '9'))) {
                  _$jscoverage['/format.js'].lineData[684]++;
                  obeyCount = true;
                }
              }
            }
            _$jscoverage['/format.js'].lineData[688]++;
            startIndex = parseField(calendar, dateStr, startIndex, comp.field, comp.count, this.locale, obeyCount, tmp);
            _$jscoverage['/format.js'].lineData[696]++;
            if (visit114_696_1(startIndex == oldStartIndex)) {
              _$jscoverage['/format.js'].lineData[697]++;
              errorIndex = startIndex;
            }
          }
        }
      }
    }
  _$jscoverage['/format.js'].lineData[703]++;
  if (visit115_703_1(errorIndex >= 0)) {
    _$jscoverage['/format.js'].lineData[704]++;
    logger.error('error when parsing date');
    _$jscoverage['/format.js'].lineData[705]++;
    logger.error(dateStr);
    _$jscoverage['/format.js'].lineData[706]++;
    logger.error(dateStr.substring(0, errorIndex) + '^');
    _$jscoverage['/format.js'].lineData[707]++;
    return undefined;
  }
  _$jscoverage['/format.js'].lineData[709]++;
  return calendar;
}};
  _$jscoverage['/format.js'].lineData[713]++;
  S.mix(DateTimeFormat, {
  Style: DateTimeStyle, 
  getInstance: function(locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[14]++;
  _$jscoverage['/format.js'].lineData[726]++;
  return this.getDateTimeInstance(DateTimeStyle.SHORT, DateTimeStyle.SHORT, locale, timeZoneOffset);
}, 
  'getDateInstance': function(dateStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[15]++;
  _$jscoverage['/format.js'].lineData[738]++;
  return this.getDateTimeInstance(dateStyle, undefined, locale, timeZoneOffset);
}, 
  getDateTimeInstance: function(dateStyle, timeStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[16]++;
  _$jscoverage['/format.js'].lineData[751]++;
  locale = visit116_751_1(locale || defaultLocale);
  _$jscoverage['/format.js'].lineData[752]++;
  var datePattern = '';
  _$jscoverage['/format.js'].lineData[753]++;
  if (visit117_753_1(dateStyle !== undefined)) {
    _$jscoverage['/format.js'].lineData[754]++;
    datePattern = locale.datePatterns[dateStyle];
  }
  _$jscoverage['/format.js'].lineData[756]++;
  var timePattern = '';
  _$jscoverage['/format.js'].lineData[757]++;
  if (visit118_757_1(timeStyle !== undefined)) {
    _$jscoverage['/format.js'].lineData[758]++;
    timePattern = locale.timePatterns[timeStyle];
  }
  _$jscoverage['/format.js'].lineData[760]++;
  var pattern = datePattern;
  _$jscoverage['/format.js'].lineData[761]++;
  if (visit119_761_1(timePattern)) {
    _$jscoverage['/format.js'].lineData[762]++;
    if (visit120_762_1(datePattern)) {
      _$jscoverage['/format.js'].lineData[763]++;
      pattern = S.substitute(locale.dateTimePattern, {
  date: datePattern, 
  time: timePattern});
    } else {
      _$jscoverage['/format.js'].lineData[768]++;
      pattern = timePattern;
    }
  }
  _$jscoverage['/format.js'].lineData[771]++;
  return new DateTimeFormat(pattern, locale, timeZoneOffset);
}, 
  'getTimeInstance': function(timeStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[17]++;
  _$jscoverage['/format.js'].lineData[783]++;
  return this.getDateTimeInstance(undefined, timeStyle, locale, timeZoneOffset);
}});
  _$jscoverage['/format.js'].lineData[787]++;
  return DateTimeFormat;
});
