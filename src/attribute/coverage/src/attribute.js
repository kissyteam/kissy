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
  _$jscoverage['/attribute.js'].lineData[11] = 0;
  _$jscoverage['/attribute.js'].lineData[12] = 0;
  _$jscoverage['/attribute.js'].lineData[13] = 0;
  _$jscoverage['/attribute.js'].lineData[16] = 0;
  _$jscoverage['/attribute.js'].lineData[21] = 0;
  _$jscoverage['/attribute.js'].lineData[23] = 0;
  _$jscoverage['/attribute.js'].lineData[25] = 0;
  _$jscoverage['/attribute.js'].lineData[26] = 0;
  _$jscoverage['/attribute.js'].lineData[27] = 0;
  _$jscoverage['/attribute.js'].lineData[29] = 0;
  _$jscoverage['/attribute.js'].lineData[32] = 0;
  _$jscoverage['/attribute.js'].lineData[33] = 0;
  _$jscoverage['/attribute.js'].lineData[36] = 0;
  _$jscoverage['/attribute.js'].lineData[37] = 0;
  _$jscoverage['/attribute.js'].lineData[41] = 0;
  _$jscoverage['/attribute.js'].lineData[42] = 0;
  _$jscoverage['/attribute.js'].lineData[43] = 0;
  _$jscoverage['/attribute.js'].lineData[51] = 0;
  _$jscoverage['/attribute.js'].lineData[52] = 0;
  _$jscoverage['/attribute.js'].lineData[53] = 0;
  _$jscoverage['/attribute.js'].lineData[54] = 0;
  _$jscoverage['/attribute.js'].lineData[56] = 0;
  _$jscoverage['/attribute.js'].lineData[62] = 0;
  _$jscoverage['/attribute.js'].lineData[63] = 0;
  _$jscoverage['/attribute.js'].lineData[66] = 0;
  _$jscoverage['/attribute.js'].lineData[68] = 0;
  _$jscoverage['/attribute.js'].lineData[74] = 0;
  _$jscoverage['/attribute.js'].lineData[75] = 0;
  _$jscoverage['/attribute.js'].lineData[77] = 0;
  _$jscoverage['/attribute.js'].lineData[78] = 0;
  _$jscoverage['/attribute.js'].lineData[79] = 0;
  _$jscoverage['/attribute.js'].lineData[81] = 0;
  _$jscoverage['/attribute.js'].lineData[82] = 0;
  _$jscoverage['/attribute.js'].lineData[84] = 0;
  _$jscoverage['/attribute.js'].lineData[87] = 0;
  _$jscoverage['/attribute.js'].lineData[90] = 0;
  _$jscoverage['/attribute.js'].lineData[91] = 0;
  _$jscoverage['/attribute.js'].lineData[93] = 0;
  _$jscoverage['/attribute.js'].lineData[94] = 0;
  _$jscoverage['/attribute.js'].lineData[95] = 0;
  _$jscoverage['/attribute.js'].lineData[98] = 0;
  _$jscoverage['/attribute.js'].lineData[104] = 0;
  _$jscoverage['/attribute.js'].lineData[105] = 0;
  _$jscoverage['/attribute.js'].lineData[106] = 0;
  _$jscoverage['/attribute.js'].lineData[107] = 0;
  _$jscoverage['/attribute.js'].lineData[108] = 0;
  _$jscoverage['/attribute.js'].lineData[110] = 0;
  _$jscoverage['/attribute.js'].lineData[112] = 0;
  _$jscoverage['/attribute.js'].lineData[114] = 0;
  _$jscoverage['/attribute.js'].lineData[117] = 0;
  _$jscoverage['/attribute.js'].lineData[118] = 0;
  _$jscoverage['/attribute.js'].lineData[119] = 0;
  _$jscoverage['/attribute.js'].lineData[120] = 0;
  _$jscoverage['/attribute.js'].lineData[122] = 0;
  _$jscoverage['/attribute.js'].lineData[123] = 0;
  _$jscoverage['/attribute.js'].lineData[124] = 0;
  _$jscoverage['/attribute.js'].lineData[131] = 0;
  _$jscoverage['/attribute.js'].lineData[132] = 0;
  _$jscoverage['/attribute.js'].lineData[138] = 0;
  _$jscoverage['/attribute.js'].lineData[139] = 0;
  _$jscoverage['/attribute.js'].lineData[140] = 0;
  _$jscoverage['/attribute.js'].lineData[142] = 0;
  _$jscoverage['/attribute.js'].lineData[144] = 0;
  _$jscoverage['/attribute.js'].lineData[145] = 0;
  _$jscoverage['/attribute.js'].lineData[150] = 0;
  _$jscoverage['/attribute.js'].lineData[151] = 0;
  _$jscoverage['/attribute.js'].lineData[152] = 0;
  _$jscoverage['/attribute.js'].lineData[153] = 0;
  _$jscoverage['/attribute.js'].lineData[154] = 0;
  _$jscoverage['/attribute.js'].lineData[158] = 0;
  _$jscoverage['/attribute.js'].lineData[160] = 0;
  _$jscoverage['/attribute.js'].lineData[171] = 0;
  _$jscoverage['/attribute.js'].lineData[172] = 0;
  _$jscoverage['/attribute.js'].lineData[173] = 0;
  _$jscoverage['/attribute.js'].lineData[176] = 0;
  _$jscoverage['/attribute.js'].lineData[177] = 0;
  _$jscoverage['/attribute.js'].lineData[181] = 0;
  _$jscoverage['/attribute.js'].lineData[184] = 0;
  _$jscoverage['/attribute.js'].lineData[185] = 0;
  _$jscoverage['/attribute.js'].lineData[194] = 0;
  _$jscoverage['/attribute.js'].lineData[196] = 0;
  _$jscoverage['/attribute.js'].lineData[197] = 0;
  _$jscoverage['/attribute.js'].lineData[201] = 0;
  _$jscoverage['/attribute.js'].lineData[202] = 0;
  _$jscoverage['/attribute.js'].lineData[203] = 0;
  _$jscoverage['/attribute.js'].lineData[204] = 0;
  _$jscoverage['/attribute.js'].lineData[205] = 0;
  _$jscoverage['/attribute.js'].lineData[212] = 0;
  _$jscoverage['/attribute.js'].lineData[220] = 0;
  _$jscoverage['/attribute.js'].lineData[227] = 0;
  _$jscoverage['/attribute.js'].lineData[228] = 0;
  _$jscoverage['/attribute.js'].lineData[231] = 0;
  _$jscoverage['/attribute.js'].lineData[233] = 0;
  _$jscoverage['/attribute.js'].lineData[234] = 0;
  _$jscoverage['/attribute.js'].lineData[235] = 0;
  _$jscoverage['/attribute.js'].lineData[238] = 0;
  _$jscoverage['/attribute.js'].lineData[241] = 0;
  _$jscoverage['/attribute.js'].lineData[242] = 0;
  _$jscoverage['/attribute.js'].lineData[244] = 0;
  _$jscoverage['/attribute.js'].lineData[245] = 0;
  _$jscoverage['/attribute.js'].lineData[246] = 0;
  _$jscoverage['/attribute.js'].lineData[247] = 0;
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
  _$jscoverage['/attribute.js'].lineData[263] = 0;
  _$jscoverage['/attribute.js'].lineData[264] = 0;
  _$jscoverage['/attribute.js'].lineData[266] = 0;
  _$jscoverage['/attribute.js'].lineData[267] = 0;
  _$jscoverage['/attribute.js'].lineData[269] = 0;
  _$jscoverage['/attribute.js'].lineData[270] = 0;
  _$jscoverage['/attribute.js'].lineData[275] = 0;
  _$jscoverage['/attribute.js'].lineData[276] = 0;
  _$jscoverage['/attribute.js'].lineData[277] = 0;
  _$jscoverage['/attribute.js'].lineData[278] = 0;
  _$jscoverage['/attribute.js'].lineData[281] = 0;
  _$jscoverage['/attribute.js'].lineData[282] = 0;
  _$jscoverage['/attribute.js'].lineData[284] = 0;
  _$jscoverage['/attribute.js'].lineData[286] = 0;
  _$jscoverage['/attribute.js'].lineData[287] = 0;
  _$jscoverage['/attribute.js'].lineData[289] = 0;
  _$jscoverage['/attribute.js'].lineData[290] = 0;
  _$jscoverage['/attribute.js'].lineData[291] = 0;
  _$jscoverage['/attribute.js'].lineData[293] = 0;
  _$jscoverage['/attribute.js'].lineData[294] = 0;
  _$jscoverage['/attribute.js'].lineData[295] = 0;
  _$jscoverage['/attribute.js'].lineData[298] = 0;
  _$jscoverage['/attribute.js'].lineData[300] = 0;
  _$jscoverage['/attribute.js'].lineData[304] = 0;
  _$jscoverage['/attribute.js'].lineData[305] = 0;
  _$jscoverage['/attribute.js'].lineData[309] = 0;
  _$jscoverage['/attribute.js'].lineData[310] = 0;
  _$jscoverage['/attribute.js'].lineData[311] = 0;
  _$jscoverage['/attribute.js'].lineData[312] = 0;
  _$jscoverage['/attribute.js'].lineData[314] = 0;
  _$jscoverage['/attribute.js'].lineData[315] = 0;
  _$jscoverage['/attribute.js'].lineData[316] = 0;
  _$jscoverage['/attribute.js'].lineData[318] = 0;
  _$jscoverage['/attribute.js'].lineData[319] = 0;
  _$jscoverage['/attribute.js'].lineData[320] = 0;
  _$jscoverage['/attribute.js'].lineData[322] = 0;
  _$jscoverage['/attribute.js'].lineData[323] = 0;
  _$jscoverage['/attribute.js'].lineData[324] = 0;
  _$jscoverage['/attribute.js'].lineData[327] = 0;
  _$jscoverage['/attribute.js'].lineData[328] = 0;
  _$jscoverage['/attribute.js'].lineData[329] = 0;
  _$jscoverage['/attribute.js'].lineData[337] = 0;
  _$jscoverage['/attribute.js'].lineData[342] = 0;
  _$jscoverage['/attribute.js'].lineData[343] = 0;
  _$jscoverage['/attribute.js'].lineData[344] = 0;
  _$jscoverage['/attribute.js'].lineData[346] = 0;
  _$jscoverage['/attribute.js'].lineData[351] = 0;
  _$jscoverage['/attribute.js'].lineData[355] = 0;
  _$jscoverage['/attribute.js'].lineData[359] = 0;
  _$jscoverage['/attribute.js'].lineData[360] = 0;
  _$jscoverage['/attribute.js'].lineData[361] = 0;
  _$jscoverage['/attribute.js'].lineData[362] = 0;
  _$jscoverage['/attribute.js'].lineData[365] = 0;
  _$jscoverage['/attribute.js'].lineData[366] = 0;
  _$jscoverage['/attribute.js'].lineData[367] = 0;
  _$jscoverage['/attribute.js'].lineData[369] = 0;
  _$jscoverage['/attribute.js'].lineData[372] = 0;
  _$jscoverage['/attribute.js'].lineData[373] = 0;
  _$jscoverage['/attribute.js'].lineData[375] = 0;
  _$jscoverage['/attribute.js'].lineData[377] = 0;
  _$jscoverage['/attribute.js'].lineData[378] = 0;
  _$jscoverage['/attribute.js'].lineData[380] = 0;
  _$jscoverage['/attribute.js'].lineData[383] = 0;
  _$jscoverage['/attribute.js'].lineData[392] = 0;
  _$jscoverage['/attribute.js'].lineData[400] = 0;
  _$jscoverage['/attribute.js'].lineData[404] = 0;
  _$jscoverage['/attribute.js'].lineData[405] = 0;
  _$jscoverage['/attribute.js'].lineData[407] = 0;
  _$jscoverage['/attribute.js'].lineData[428] = 0;
  _$jscoverage['/attribute.js'].lineData[432] = 0;
  _$jscoverage['/attribute.js'].lineData[433] = 0;
  _$jscoverage['/attribute.js'].lineData[435] = 0;
  _$jscoverage['/attribute.js'].lineData[437] = 0;
  _$jscoverage['/attribute.js'].lineData[447] = 0;
  _$jscoverage['/attribute.js'].lineData[448] = 0;
  _$jscoverage['/attribute.js'].lineData[449] = 0;
  _$jscoverage['/attribute.js'].lineData[451] = 0;
  _$jscoverage['/attribute.js'].lineData[452] = 0;
  _$jscoverage['/attribute.js'].lineData[454] = 0;
  _$jscoverage['/attribute.js'].lineData[463] = 0;
  _$jscoverage['/attribute.js'].lineData[471] = 0;
  _$jscoverage['/attribute.js'].lineData[472] = 0;
  _$jscoverage['/attribute.js'].lineData[473] = 0;
  _$jscoverage['/attribute.js'].lineData[475] = 0;
  _$jscoverage['/attribute.js'].lineData[476] = 0;
  _$jscoverage['/attribute.js'].lineData[477] = 0;
  _$jscoverage['/attribute.js'].lineData[480] = 0;
  _$jscoverage['/attribute.js'].lineData[493] = 0;
  _$jscoverage['/attribute.js'].lineData[494] = 0;
  _$jscoverage['/attribute.js'].lineData[495] = 0;
  _$jscoverage['/attribute.js'].lineData[496] = 0;
  _$jscoverage['/attribute.js'].lineData[497] = 0;
  _$jscoverage['/attribute.js'].lineData[500] = 0;
  _$jscoverage['/attribute.js'].lineData[503] = 0;
  _$jscoverage['/attribute.js'].lineData[504] = 0;
  _$jscoverage['/attribute.js'].lineData[507] = 0;
  _$jscoverage['/attribute.js'].lineData[508] = 0;
  _$jscoverage['/attribute.js'].lineData[509] = 0;
  _$jscoverage['/attribute.js'].lineData[511] = 0;
  _$jscoverage['/attribute.js'].lineData[513] = 0;
  _$jscoverage['/attribute.js'].lineData[514] = 0;
  _$jscoverage['/attribute.js'].lineData[516] = 0;
  _$jscoverage['/attribute.js'].lineData[520] = 0;
  _$jscoverage['/attribute.js'].lineData[521] = 0;
  _$jscoverage['/attribute.js'].lineData[522] = 0;
  _$jscoverage['/attribute.js'].lineData[523] = 0;
  _$jscoverage['/attribute.js'].lineData[524] = 0;
  _$jscoverage['/attribute.js'].lineData[526] = 0;
  _$jscoverage['/attribute.js'].lineData[527] = 0;
  _$jscoverage['/attribute.js'].lineData[536] = 0;
  _$jscoverage['/attribute.js'].lineData[538] = 0;
  _$jscoverage['/attribute.js'].lineData[540] = 0;
  _$jscoverage['/attribute.js'].lineData[542] = 0;
  _$jscoverage['/attribute.js'].lineData[543] = 0;
  _$jscoverage['/attribute.js'].lineData[544] = 0;
  _$jscoverage['/attribute.js'].lineData[546] = 0;
  _$jscoverage['/attribute.js'].lineData[548] = 0;
  _$jscoverage['/attribute.js'].lineData[557] = 0;
  _$jscoverage['/attribute.js'].lineData[566] = 0;
  _$jscoverage['/attribute.js'].lineData[567] = 0;
  _$jscoverage['/attribute.js'].lineData[570] = 0;
  _$jscoverage['/attribute.js'].lineData[571] = 0;
  _$jscoverage['/attribute.js'].lineData[574] = 0;
  _$jscoverage['/attribute.js'].lineData[575] = 0;
  _$jscoverage['/attribute.js'].lineData[579] = 0;
  _$jscoverage['/attribute.js'].lineData[581] = 0;
  _$jscoverage['/attribute.js'].lineData[590] = 0;
  _$jscoverage['/attribute.js'].lineData[597] = 0;
  _$jscoverage['/attribute.js'].lineData[598] = 0;
  _$jscoverage['/attribute.js'].lineData[599] = 0;
  _$jscoverage['/attribute.js'].lineData[602] = 0;
  _$jscoverage['/attribute.js'].lineData[603] = 0;
  _$jscoverage['/attribute.js'].lineData[607] = 0;
  _$jscoverage['/attribute.js'].lineData[612] = 0;
  _$jscoverage['/attribute.js'].lineData[613] = 0;
  _$jscoverage['/attribute.js'].lineData[616] = 0;
  _$jscoverage['/attribute.js'].lineData[617] = 0;
  _$jscoverage['/attribute.js'].lineData[620] = 0;
  _$jscoverage['/attribute.js'].lineData[621] = 0;
  _$jscoverage['/attribute.js'].lineData[624] = 0;
  _$jscoverage['/attribute.js'].lineData[636] = 0;
  _$jscoverage['/attribute.js'].lineData[638] = 0;
  _$jscoverage['/attribute.js'].lineData[639] = 0;
  _$jscoverage['/attribute.js'].lineData[641] = 0;
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
  _$jscoverage['/attribute.js'].branchData['12'] = [];
  _$jscoverage['/attribute.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['26'] = [];
  _$jscoverage['/attribute.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['33'] = [];
  _$jscoverage['/attribute.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['42'] = [];
  _$jscoverage['/attribute.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['53'] = [];
  _$jscoverage['/attribute.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['56'] = [];
  _$jscoverage['/attribute.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['64'] = [];
  _$jscoverage['/attribute.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['64'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['64'][3] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['77'] = [];
  _$jscoverage['/attribute.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['78'] = [];
  _$jscoverage['/attribute.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['81'] = [];
  _$jscoverage['/attribute.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['93'] = [];
  _$jscoverage['/attribute.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['106'] = [];
  _$jscoverage['/attribute.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['107'] = [];
  _$jscoverage['/attribute.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['119'] = [];
  _$jscoverage['/attribute.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['144'] = [];
  _$jscoverage['/attribute.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['150'] = [];
  _$jscoverage['/attribute.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['151'] = [];
  _$jscoverage['/attribute.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['151'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['153'] = [];
  _$jscoverage['/attribute.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['153'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['171'] = [];
  _$jscoverage['/attribute.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['172'] = [];
  _$jscoverage['/attribute.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['176'] = [];
  _$jscoverage['/attribute.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['196'] = [];
  _$jscoverage['/attribute.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['201'] = [];
  _$jscoverage['/attribute.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['204'] = [];
  _$jscoverage['/attribute.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['244'] = [];
  _$jscoverage['/attribute.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['246'] = [];
  _$jscoverage['/attribute.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['252'] = [];
  _$jscoverage['/attribute.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['254'] = [];
  _$jscoverage['/attribute.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['263'] = [];
  _$jscoverage['/attribute.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['266'] = [];
  _$jscoverage['/attribute.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['290'] = [];
  _$jscoverage['/attribute.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['293'] = [];
  _$jscoverage['/attribute.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['294'] = [];
  _$jscoverage['/attribute.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['298'] = [];
  _$jscoverage['/attribute.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['315'] = [];
  _$jscoverage['/attribute.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['319'] = [];
  _$jscoverage['/attribute.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['322'] = [];
  _$jscoverage['/attribute.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['328'] = [];
  _$jscoverage['/attribute.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['343'] = [];
  _$jscoverage['/attribute.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['359'] = [];
  _$jscoverage['/attribute.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['359'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['366'] = [];
  _$jscoverage['/attribute.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['373'] = [];
  _$jscoverage['/attribute.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['378'] = [];
  _$jscoverage['/attribute.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['383'] = [];
  _$jscoverage['/attribute.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['392'] = [];
  _$jscoverage['/attribute.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['451'] = [];
  _$jscoverage['/attribute.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['475'] = [];
  _$jscoverage['/attribute.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['494'] = [];
  _$jscoverage['/attribute.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['496'] = [];
  _$jscoverage['/attribute.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['503'] = [];
  _$jscoverage['/attribute.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['507'] = [];
  _$jscoverage['/attribute.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['508'] = [];
  _$jscoverage['/attribute.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['526'] = [];
  _$jscoverage['/attribute.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['538'] = [];
  _$jscoverage['/attribute.js'].branchData['538'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['542'] = [];
  _$jscoverage['/attribute.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['543'] = [];
  _$jscoverage['/attribute.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['566'] = [];
  _$jscoverage['/attribute.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['570'] = [];
  _$jscoverage['/attribute.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['574'] = [];
  _$jscoverage['/attribute.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['597'] = [];
  _$jscoverage['/attribute.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['612'] = [];
  _$jscoverage['/attribute.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['616'] = [];
  _$jscoverage['/attribute.js'].branchData['616'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['616'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['620'] = [];
  _$jscoverage['/attribute.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['638'] = [];
  _$jscoverage['/attribute.js'].branchData['638'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['639'] = [];
  _$jscoverage['/attribute.js'].branchData['639'][1] = new BranchData();
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
}_$jscoverage['/attribute.js'].branchData['639'][1].init(22, 18, 'self.hasAttr(name)');
function visit71_639_1(result) {
  _$jscoverage['/attribute.js'].branchData['639'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['638'][1].init(50, 24, 'typeof name === \'string\'');
function visit70_638_1(result) {
  _$jscoverage['/attribute.js'].branchData['638'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['620'][1].init(975, 4, 'path');
function visit69_620_1(result) {
  _$jscoverage['/attribute.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['616'][2].init(881, 17, 'ret !== undefined');
function visit68_616_2(result) {
  _$jscoverage['/attribute.js'].branchData['616'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['616'][1].init(858, 40, '!(name in attrVals) && ret !== undefined');
function visit67_616_1(result) {
  _$jscoverage['/attribute.js'].branchData['616'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['612'][1].init(724, 43, 'getter && (getter = normalFn(self, getter))');
function visit66_612_1(result) {
  _$jscoverage['/attribute.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['597'][1].init(207, 24, 'name.indexOf(dot) !== -1');
function visit65_597_1(result) {
  _$jscoverage['/attribute.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['574'][1].init(687, 22, 'setValue !== undefined');
function visit64_574_1(result) {
  _$jscoverage['/attribute.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['570'][1].init(598, 20, 'setValue === INVALID');
function visit63_570_1(result) {
  _$jscoverage['/attribute.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['566'][1].init(457, 43, 'setter && (setter = normalFn(self, setter))');
function visit62_566_1(result) {
  _$jscoverage['/attribute.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['543'][1].init(22, 10, 'opts.error');
function visit61_543_1(result) {
  _$jscoverage['/attribute.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['542'][1].init(1830, 15, 'e !== undefined');
function visit60_542_1(result) {
  _$jscoverage['/attribute.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['538'][1].init(1721, 10, 'opts || {}');
function visit59_538_1(result) {
  _$jscoverage['/attribute.js'].branchData['538'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['526'][1].init(1258, 16, 'attrNames.length');
function visit58_526_1(result) {
  _$jscoverage['/attribute.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['508'][1].init(26, 10, 'opts.error');
function visit57_508_1(result) {
  _$jscoverage['/attribute.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['507'][1].init(507, 13, 'errors.length');
function visit56_507_1(result) {
  _$jscoverage['/attribute.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['503'][1].init(132, 55, '(e = validate(self, name, all[name], all)) !== undefined');
function visit55_503_1(result) {
  _$jscoverage['/attribute.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['496'][1].init(56, 10, 'opts || {}');
function visit54_496_1(result) {
  _$jscoverage['/attribute.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['494'][1].init(51, 21, 'S.isPlainObject(name)');
function visit53_494_1(result) {
  _$jscoverage['/attribute.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['475'][1].init(143, 18, 'self.hasAttr(name)');
function visit52_475_1(result) {
  _$jscoverage['/attribute.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['451'][1].init(177, 13, 'initialValues');
function visit51_451_1(result) {
  _$jscoverage['/attribute.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['392'][1].init(21, 35, 'this.__attrs || (this.__attrs = {})');
function visit50_392_1(result) {
  _$jscoverage['/attribute.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['383'][1].init(1076, 10, 'args || []');
function visit49_383_1(result) {
  _$jscoverage['/attribute.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['378'][1].init(871, 7, '!member');
function visit48_378_1(result) {
  _$jscoverage['/attribute.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['373'][1].init(612, 5, '!name');
function visit47_373_1(result) {
  _$jscoverage['/attribute.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['366'][1].init(114, 18, 'method.__wrapped__');
function visit46_366_1(result) {
  _$jscoverage['/attribute.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['359'][2].init(115, 26, 'typeof self === \'function\'');
function visit45_359_2(result) {
  _$jscoverage['/attribute.js'].branchData['359'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['359'][1].init(115, 43, 'typeof self === \'function\' && self.__name__');
function visit44_359_1(result) {
  _$jscoverage['/attribute.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['343'][1].init(14, 6, 'config');
function visit43_343_1(result) {
  _$jscoverage['/attribute.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['328'][1].init(14, 5, 'attrs');
function visit42_328_1(result) {
  _$jscoverage['/attribute.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['322'][1].init(1585, 19, 'sx.extend || extend');
function visit41_322_1(result) {
  _$jscoverage['/attribute.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['319'][1].init(1475, 18, 'sxInheritedStatics');
function visit40_319_1(result) {
  _$jscoverage['/attribute.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['315'][1].init(57, 25, 'sx.inheritedStatics || {}');
function visit39_315_1(result) {
  _$jscoverage['/attribute.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['298'][1].init(82, 9, '\'@DEBUG@\'');
function visit38_298_1(result) {
  _$jscoverage['/attribute.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['294'][1].init(417, 32, 'px.hasOwnProperty(\'constructor\')');
function visit37_294_1(result) {
  _$jscoverage['/attribute.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['293'][1].init(373, 29, 'sx.name || \'AttributeDerived\'');
function visit36_293_1(result) {
  _$jscoverage['/attribute.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['290'][1].init(39, 18, 'sx.__hooks__ || {}');
function visit35_290_1(result) {
  _$jscoverage['/attribute.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['266'][1].init(565, 7, 'wrapped');
function visit34_266_1(result) {
  _$jscoverage['/attribute.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['263'][1].init(475, 13, 'v.__wrapped__');
function visit33_263_1(result) {
  _$jscoverage['/attribute.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['254'][1].init(56, 11, 'v.__owner__');
function visit32_254_1(result) {
  _$jscoverage['/attribute.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['252'][1].init(18, 23, 'typeof v === \'function\'');
function visit31_252_1(result) {
  _$jscoverage['/attribute.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['246'][1].init(22, 7, 'p in px');
function visit30_246_1(result) {
  _$jscoverage['/attribute.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['244'][1].init(96, 5, 'hooks');
function visit29_244_1(result) {
  _$jscoverage['/attribute.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['204'][1].init(159, 5, 'attrs');
function visit28_204_1(result) {
  _$jscoverage['/attribute.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['201'][1].init(406, 12, '!opts.silent');
function visit27_201_1(result) {
  _$jscoverage['/attribute.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['196'][1].init(309, 13, 'ret === FALSE');
function visit26_196_1(result) {
  _$jscoverage['/attribute.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['176'][1].init(18, 79, 'FALSE === self.fire(whenAttrChangeEventName(\'before\', name), beforeEventObject)');
function visit25_176_1(result) {
  _$jscoverage['/attribute.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['172'][1].init(18, 52, 'FALSE === defaultSetFn.call(self, beforeEventObject)');
function visit24_172_1(result) {
  _$jscoverage['/attribute.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['171'][1].init(1073, 11, 'opts.silent');
function visit23_171_1(result) {
  _$jscoverage['/attribute.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['153'][2].init(116, 16, 'subVal === value');
function visit22_153_2(result) {
  _$jscoverage['/attribute.js'].branchData['153'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['153'][1].init(108, 24, 'path && subVal === value');
function visit21_153_1(result) {
  _$jscoverage['/attribute.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['151'][2].init(27, 17, 'prevVal === value');
function visit20_151_2(result) {
  _$jscoverage['/attribute.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['151'][1].init(18, 26, '!path && prevVal === value');
function visit19_151_1(result) {
  _$jscoverage['/attribute.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['150'][1].init(485, 11, '!opts.force');
function visit18_150_1(result) {
  _$jscoverage['/attribute.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['144'][1].init(310, 4, 'path');
function visit17_144_1(result) {
  _$jscoverage['/attribute.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['119'][1].init(90, 22, 'defaultBeforeFns[name]');
function visit16_119_1(result) {
  _$jscoverage['/attribute.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['107'][1].init(18, 21, 'prevVal === undefined');
function visit15_107_1(result) {
  _$jscoverage['/attribute.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['106'][1].init(40, 4, 'path');
function visit14_106_1(result) {
  _$jscoverage['/attribute.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['93'][1].init(35, 24, 'name.indexOf(\'.\') !== -1');
function visit13_93_1(result) {
  _$jscoverage['/attribute.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['81'][1].init(111, 15, 'o !== undefined');
function visit12_81_1(result) {
  _$jscoverage['/attribute.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['78'][1].init(30, 7, 'i < len');
function visit11_78_1(result) {
  _$jscoverage['/attribute.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['77'][1].init(70, 8, 'len >= 0');
function visit10_77_1(result) {
  _$jscoverage['/attribute.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['64'][3].init(18, 7, 'i < len');
function visit9_64_3(result) {
  _$jscoverage['/attribute.js'].branchData['64'][3].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['64'][2].init(60, 15, 'o !== undefined');
function visit8_64_2(result) {
  _$jscoverage['/attribute.js'].branchData['64'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['64'][1].init(48, 26, 'o !== undefined && i < len');
function visit7_64_1(result) {
  _$jscoverage['/attribute.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['56'][1].init(130, 9, 'ret || {}');
function visit6_56_1(result) {
  _$jscoverage['/attribute.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['53'][1].init(44, 20, '!doNotCreate && !ret');
function visit5_53_1(result) {
  _$jscoverage['/attribute.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['42'][1].init(21, 16, 'attrName || name');
function visit4_42_1(result) {
  _$jscoverage['/attribute.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['33'][1].init(17, 41, 'self.__attrVals || (self.__attrVals = {})');
function visit3_33_1(result) {
  _$jscoverage['/attribute.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['26'][1].init(14, 26, 'typeof method === \'string\'');
function visit2_26_1(result) {
  _$jscoverage['/attribute.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['12'][1].init(14, 12, 'v === S.noop');
function visit1_12_1(result) {
  _$jscoverage['/attribute.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/attribute.js'].functionData[0]++;
  _$jscoverage['/attribute.js'].lineData[7]++;
  require('util');
  _$jscoverage['/attribute.js'].lineData[9]++;
  var CustomEvent = require('event/custom');
  _$jscoverage['/attribute.js'].lineData[11]++;
  function bind(v) {
    _$jscoverage['/attribute.js'].functionData[1]++;
    _$jscoverage['/attribute.js'].lineData[12]++;
    if (visit1_12_1(v === S.noop)) {
      _$jscoverage['/attribute.js'].lineData[13]++;
      return function() {
  _$jscoverage['/attribute.js'].functionData[2]++;
};
    } else {
      _$jscoverage['/attribute.js'].lineData[16]++;
      return S.bind(v);
    }
  }
  _$jscoverage['/attribute.js'].lineData[21]++;
  var INVALID = {};
  _$jscoverage['/attribute.js'].lineData[23]++;
  var FALSE = false;
  _$jscoverage['/attribute.js'].lineData[25]++;
  function normalFn(host, method) {
    _$jscoverage['/attribute.js'].functionData[3]++;
    _$jscoverage['/attribute.js'].lineData[26]++;
    if (visit2_26_1(typeof method === 'string')) {
      _$jscoverage['/attribute.js'].lineData[27]++;
      return host[method];
    }
    _$jscoverage['/attribute.js'].lineData[29]++;
    return method;
  }
  _$jscoverage['/attribute.js'].lineData[32]++;
  function getAttrVals(self) {
    _$jscoverage['/attribute.js'].functionData[4]++;
    _$jscoverage['/attribute.js'].lineData[33]++;
    return visit3_33_1(self.__attrVals || (self.__attrVals = {}));
  }
  _$jscoverage['/attribute.js'].lineData[36]++;
  function whenAttrChangeEventName(when, name) {
    _$jscoverage['/attribute.js'].functionData[5]++;
    _$jscoverage['/attribute.js'].lineData[37]++;
    return when + S.ucfirst(name) + 'Change';
  }
  _$jscoverage['/attribute.js'].lineData[41]++;
  function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName, data) {
    _$jscoverage['/attribute.js'].functionData[6]++;
    _$jscoverage['/attribute.js'].lineData[42]++;
    attrName = visit4_42_1(attrName || name);
    _$jscoverage['/attribute.js'].lineData[43]++;
    return self.fire(whenAttrChangeEventName(when, name), S.mix({
  attrName: attrName, 
  subAttrName: subAttrName, 
  prevVal: prevVal, 
  newVal: newVal}, data));
  }
  _$jscoverage['/attribute.js'].lineData[51]++;
  function ensureNonEmpty(obj, name, doNotCreate) {
    _$jscoverage['/attribute.js'].functionData[7]++;
    _$jscoverage['/attribute.js'].lineData[52]++;
    var ret = obj[name];
    _$jscoverage['/attribute.js'].lineData[53]++;
    if (visit5_53_1(!doNotCreate && !ret)) {
      _$jscoverage['/attribute.js'].lineData[54]++;
      obj[name] = ret = {};
    }
    _$jscoverage['/attribute.js'].lineData[56]++;
    return visit6_56_1(ret || {});
  }
  _$jscoverage['/attribute.js'].lineData[62]++;
  function getValueByPath(o, path) {
    _$jscoverage['/attribute.js'].functionData[8]++;
    _$jscoverage['/attribute.js'].lineData[63]++;
    for (var i = 0, len = path.length; visit7_64_1(visit8_64_2(o !== undefined) && visit9_64_3(i < len)); i++) {
      _$jscoverage['/attribute.js'].lineData[66]++;
      o = o[path[i]];
    }
    _$jscoverage['/attribute.js'].lineData[68]++;
    return o;
  }
  _$jscoverage['/attribute.js'].lineData[74]++;
  function setValueByPath(o, path, val) {
    _$jscoverage['/attribute.js'].functionData[9]++;
    _$jscoverage['/attribute.js'].lineData[75]++;
    var len = path.length - 1, s = o;
    _$jscoverage['/attribute.js'].lineData[77]++;
    if (visit10_77_1(len >= 0)) {
      _$jscoverage['/attribute.js'].lineData[78]++;
      for (var i = 0; visit11_78_1(i < len); i++) {
        _$jscoverage['/attribute.js'].lineData[79]++;
        o = o[path[i]];
      }
      _$jscoverage['/attribute.js'].lineData[81]++;
      if (visit12_81_1(o !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[82]++;
        o[path[i]] = val;
      } else {
        _$jscoverage['/attribute.js'].lineData[84]++;
        s = undefined;
      }
    }
    _$jscoverage['/attribute.js'].lineData[87]++;
    return s;
  }
  _$jscoverage['/attribute.js'].lineData[90]++;
  function getPathNamePair(name) {
    _$jscoverage['/attribute.js'].functionData[10]++;
    _$jscoverage['/attribute.js'].lineData[91]++;
    var path;
    _$jscoverage['/attribute.js'].lineData[93]++;
    if (visit13_93_1(name.indexOf('.') !== -1)) {
      _$jscoverage['/attribute.js'].lineData[94]++;
      path = name.split('.');
      _$jscoverage['/attribute.js'].lineData[95]++;
      name = path.shift();
    }
    _$jscoverage['/attribute.js'].lineData[98]++;
    return {
  path: path, 
  name: name};
  }
  _$jscoverage['/attribute.js'].lineData[104]++;
  function getValueBySubValue(prevVal, path, value) {
    _$jscoverage['/attribute.js'].functionData[11]++;
    _$jscoverage['/attribute.js'].lineData[105]++;
    var tmp = value;
    _$jscoverage['/attribute.js'].lineData[106]++;
    if (visit14_106_1(path)) {
      _$jscoverage['/attribute.js'].lineData[107]++;
      if (visit15_107_1(prevVal === undefined)) {
        _$jscoverage['/attribute.js'].lineData[108]++;
        tmp = {};
      } else {
        _$jscoverage['/attribute.js'].lineData[110]++;
        tmp = S.clone(prevVal);
      }
      _$jscoverage['/attribute.js'].lineData[112]++;
      setValueByPath(tmp, path, value);
    }
    _$jscoverage['/attribute.js'].lineData[114]++;
    return tmp;
  }
  _$jscoverage['/attribute.js'].lineData[117]++;
  function prepareDefaultSetFn(self, name) {
    _$jscoverage['/attribute.js'].functionData[12]++;
    _$jscoverage['/attribute.js'].lineData[118]++;
    var defaultBeforeFns = ensureNonEmpty(self, '__defaultBeforeFns');
    _$jscoverage['/attribute.js'].lineData[119]++;
    if (visit16_119_1(defaultBeforeFns[name])) {
      _$jscoverage['/attribute.js'].lineData[120]++;
      return;
    }
    _$jscoverage['/attribute.js'].lineData[122]++;
    defaultBeforeFns[name] = 1;
    _$jscoverage['/attribute.js'].lineData[123]++;
    var beforeChangeEventName = whenAttrChangeEventName('before', name);
    _$jscoverage['/attribute.js'].lineData[124]++;
    self.publish(beforeChangeEventName, {
  defaultFn: defaultSetFn, 
  defaultTargetOnly: true});
  }
  _$jscoverage['/attribute.js'].lineData[131]++;
  function setInternal(self, name, value, opts, attrs) {
    _$jscoverage['/attribute.js'].functionData[13]++;
    _$jscoverage['/attribute.js'].lineData[132]++;
    var path, subVal, prevVal, pathNamePair = getPathNamePair(name), fullName = name;
    _$jscoverage['/attribute.js'].lineData[138]++;
    name = pathNamePair.name;
    _$jscoverage['/attribute.js'].lineData[139]++;
    path = pathNamePair.path;
    _$jscoverage['/attribute.js'].lineData[140]++;
    prevVal = self.get(name);
    _$jscoverage['/attribute.js'].lineData[142]++;
    prepareDefaultSetFn(self, name);
    _$jscoverage['/attribute.js'].lineData[144]++;
    if (visit17_144_1(path)) {
      _$jscoverage['/attribute.js'].lineData[145]++;
      subVal = getValueByPath(prevVal, path);
    }
    _$jscoverage['/attribute.js'].lineData[150]++;
    if (visit18_150_1(!opts.force)) {
      _$jscoverage['/attribute.js'].lineData[151]++;
      if (visit19_151_1(!path && visit20_151_2(prevVal === value))) {
        _$jscoverage['/attribute.js'].lineData[152]++;
        return undefined;
      } else {
        _$jscoverage['/attribute.js'].lineData[153]++;
        if (visit21_153_1(path && visit22_153_2(subVal === value))) {
          _$jscoverage['/attribute.js'].lineData[154]++;
          return undefined;
        }
      }
    }
    _$jscoverage['/attribute.js'].lineData[158]++;
    value = getValueBySubValue(prevVal, path, value);
    _$jscoverage['/attribute.js'].lineData[160]++;
    var beforeEventObject = S.mix({
  attrName: name, 
  subAttrName: fullName, 
  prevVal: prevVal, 
  newVal: value, 
  _opts: opts, 
  _attrs: attrs, 
  target: self}, opts.data);
    _$jscoverage['/attribute.js'].lineData[171]++;
    if (visit23_171_1(opts.silent)) {
      _$jscoverage['/attribute.js'].lineData[172]++;
      if (visit24_172_1(FALSE === defaultSetFn.call(self, beforeEventObject))) {
        _$jscoverage['/attribute.js'].lineData[173]++;
        return FALSE;
      }
    } else {
      _$jscoverage['/attribute.js'].lineData[176]++;
      if (visit25_176_1(FALSE === self.fire(whenAttrChangeEventName('before', name), beforeEventObject))) {
        _$jscoverage['/attribute.js'].lineData[177]++;
        return FALSE;
      }
    }
    _$jscoverage['/attribute.js'].lineData[181]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[184]++;
  function defaultSetFn(e) {
    _$jscoverage['/attribute.js'].functionData[14]++;
    _$jscoverage['/attribute.js'].lineData[185]++;
    var self = this, value = e.newVal, prevVal = e.prevVal, name = e.attrName, fullName = e.subAttrName, attrs = e._attrs, opts = e._opts;
    _$jscoverage['/attribute.js'].lineData[194]++;
    var ret = self.setInternal(name, value);
    _$jscoverage['/attribute.js'].lineData[196]++;
    if (visit26_196_1(ret === FALSE)) {
      _$jscoverage['/attribute.js'].lineData[197]++;
      return ret;
    }
    _$jscoverage['/attribute.js'].lineData[201]++;
    if (visit27_201_1(!opts.silent)) {
      _$jscoverage['/attribute.js'].lineData[202]++;
      value = getAttrVals(self)[name];
      _$jscoverage['/attribute.js'].lineData[203]++;
      __fireAttrChange(self, 'after', name, prevVal, value, fullName, null, opts.data);
      _$jscoverage['/attribute.js'].lineData[204]++;
      if (visit28_204_1(attrs)) {
        _$jscoverage['/attribute.js'].lineData[205]++;
        attrs.push({
  prevVal: prevVal, 
  newVal: value, 
  attrName: name, 
  subAttrName: fullName});
      } else {
        _$jscoverage['/attribute.js'].lineData[212]++;
        __fireAttrChange(self, '', '*', [prevVal], [value], [fullName], [name], opts.data);
      }
    }
    _$jscoverage['/attribute.js'].lineData[220]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[227]++;
  function Attribute(config) {
    _$jscoverage['/attribute.js'].functionData[15]++;
    _$jscoverage['/attribute.js'].lineData[228]++;
    var self = this, c = self.constructor;
    _$jscoverage['/attribute.js'].lineData[231]++;
    self.userConfig = config;
    _$jscoverage['/attribute.js'].lineData[233]++;
    while (c) {
      _$jscoverage['/attribute.js'].lineData[234]++;
      addAttrs(self, c.ATTRS);
      _$jscoverage['/attribute.js'].lineData[235]++;
      c = c.superclass ? c.superclass.constructor : null;
    }
    _$jscoverage['/attribute.js'].lineData[238]++;
    initAttrs(self, config);
  }
  _$jscoverage['/attribute.js'].lineData[241]++;
  function wrapProtoForSuper(px, SubClass) {
    _$jscoverage['/attribute.js'].functionData[16]++;
    _$jscoverage['/attribute.js'].lineData[242]++;
    var hooks = SubClass.__hooks__;
    _$jscoverage['/attribute.js'].lineData[244]++;
    if (visit29_244_1(hooks)) {
      _$jscoverage['/attribute.js'].lineData[245]++;
      for (var p in hooks) {
        _$jscoverage['/attribute.js'].lineData[246]++;
        if (visit30_246_1(p in px)) {
          _$jscoverage['/attribute.js'].lineData[247]++;
          px[p] = hooks[p](px[p]);
        }
      }
    }
    _$jscoverage['/attribute.js'].lineData[251]++;
    S.each(px, function(v, p) {
  _$jscoverage['/attribute.js'].functionData[17]++;
  _$jscoverage['/attribute.js'].lineData[252]++;
  if (visit31_252_1(typeof v === 'function')) {
    _$jscoverage['/attribute.js'].lineData[253]++;
    var wrapped = 0;
    _$jscoverage['/attribute.js'].lineData[254]++;
    if (visit32_254_1(v.__owner__)) {
      _$jscoverage['/attribute.js'].lineData[255]++;
      var originalOwner = v.__owner__;
      _$jscoverage['/attribute.js'].lineData[256]++;
      delete v.__owner__;
      _$jscoverage['/attribute.js'].lineData[257]++;
      delete v.__name__;
      _$jscoverage['/attribute.js'].lineData[258]++;
      wrapped = v.__wrapped__ = 1;
      _$jscoverage['/attribute.js'].lineData[259]++;
      var newV = bind(v);
      _$jscoverage['/attribute.js'].lineData[260]++;
      newV.__owner__ = originalOwner;
      _$jscoverage['/attribute.js'].lineData[261]++;
      newV.__name__ = p;
      _$jscoverage['/attribute.js'].lineData[262]++;
      originalOwner.prototype[p] = newV;
    } else {
      _$jscoverage['/attribute.js'].lineData[263]++;
      if (visit33_263_1(v.__wrapped__)) {
        _$jscoverage['/attribute.js'].lineData[264]++;
        wrapped = 1;
      }
    }
    _$jscoverage['/attribute.js'].lineData[266]++;
    if (visit34_266_1(wrapped)) {
      _$jscoverage['/attribute.js'].lineData[267]++;
      px[p] = v = bind(v);
    }
    _$jscoverage['/attribute.js'].lineData[269]++;
    v.__owner__ = SubClass;
    _$jscoverage['/attribute.js'].lineData[270]++;
    v.__name__ = p;
  }
});
  }
  _$jscoverage['/attribute.js'].lineData[275]++;
  function addMembers(px) {
    _$jscoverage['/attribute.js'].functionData[18]++;
    _$jscoverage['/attribute.js'].lineData[276]++;
    var self = this;
    _$jscoverage['/attribute.js'].lineData[277]++;
    wrapProtoForSuper(px, self);
    _$jscoverage['/attribute.js'].lineData[278]++;
    S.mix(self.prototype, px);
  }
  _$jscoverage['/attribute.js'].lineData[281]++;
  Attribute.extend = function extend(px, sx) {
  _$jscoverage['/attribute.js'].functionData[19]++;
  _$jscoverage['/attribute.js'].lineData[282]++;
  var SubClass, self = this;
  _$jscoverage['/attribute.js'].lineData[284]++;
  sx = S.merge(sx);
  _$jscoverage['/attribute.js'].lineData[286]++;
  px = S.merge(px);
  _$jscoverage['/attribute.js'].lineData[287]++;
  var hooks, sxHooks = sx.__hooks__;
  _$jscoverage['/attribute.js'].lineData[289]++;
  if ((hooks = self.__hooks__)) {
    _$jscoverage['/attribute.js'].lineData[290]++;
    sxHooks = sx.__hooks__ = visit35_290_1(sx.__hooks__ || {});
    _$jscoverage['/attribute.js'].lineData[291]++;
    S.mix(sxHooks, hooks, false);
  }
  _$jscoverage['/attribute.js'].lineData[293]++;
  var name = visit36_293_1(sx.name || 'AttributeDerived');
  _$jscoverage['/attribute.js'].lineData[294]++;
  if (visit37_294_1(px.hasOwnProperty('constructor'))) {
    _$jscoverage['/attribute.js'].lineData[295]++;
    SubClass = px.constructor;
  } else {
    _$jscoverage['/attribute.js'].lineData[298]++;
    if (visit38_298_1('@DEBUG@')) {
      _$jscoverage['/attribute.js'].lineData[300]++;
      SubClass = new Function('return function ' + S.camelCase(name) + '(){ ' + 'this.callSuper.apply(this, arguments);' + '}')();
    } else {
      _$jscoverage['/attribute.js'].lineData[304]++;
      SubClass = function() {
  _$jscoverage['/attribute.js'].functionData[20]++;
  _$jscoverage['/attribute.js'].lineData[305]++;
  this.callSuper.apply(this, arguments);
};
    }
  }
  _$jscoverage['/attribute.js'].lineData[309]++;
  px.constructor = SubClass;
  _$jscoverage['/attribute.js'].lineData[310]++;
  SubClass.__hooks__ = sxHooks;
  _$jscoverage['/attribute.js'].lineData[311]++;
  wrapProtoForSuper(px, SubClass);
  _$jscoverage['/attribute.js'].lineData[312]++;
  var inheritedStatics, sxInheritedStatics = sx.inheritedStatics;
  _$jscoverage['/attribute.js'].lineData[314]++;
  if ((inheritedStatics = self.inheritedStatics)) {
    _$jscoverage['/attribute.js'].lineData[315]++;
    sxInheritedStatics = sx.inheritedStatics = visit39_315_1(sx.inheritedStatics || {});
    _$jscoverage['/attribute.js'].lineData[316]++;
    S.mix(sxInheritedStatics, inheritedStatics, false);
  }
  _$jscoverage['/attribute.js'].lineData[318]++;
  S.extend(SubClass, self, px, sx);
  _$jscoverage['/attribute.js'].lineData[319]++;
  if (visit40_319_1(sxInheritedStatics)) {
    _$jscoverage['/attribute.js'].lineData[320]++;
    S.mix(SubClass, sxInheritedStatics);
  }
  _$jscoverage['/attribute.js'].lineData[322]++;
  SubClass.extend = visit41_322_1(sx.extend || extend);
  _$jscoverage['/attribute.js'].lineData[323]++;
  SubClass.addMembers = addMembers;
  _$jscoverage['/attribute.js'].lineData[324]++;
  return SubClass;
};
  _$jscoverage['/attribute.js'].lineData[327]++;
  function addAttrs(host, attrs) {
    _$jscoverage['/attribute.js'].functionData[21]++;
    _$jscoverage['/attribute.js'].lineData[328]++;
    if (visit42_328_1(attrs)) {
      _$jscoverage['/attribute.js'].lineData[329]++;
      for (var attr in attrs) {
        _$jscoverage['/attribute.js'].lineData[337]++;
        host.addAttr(attr, attrs[attr], false);
      }
    }
  }
  _$jscoverage['/attribute.js'].lineData[342]++;
  function initAttrs(host, config) {
    _$jscoverage['/attribute.js'].functionData[22]++;
    _$jscoverage['/attribute.js'].lineData[343]++;
    if (visit43_343_1(config)) {
      _$jscoverage['/attribute.js'].lineData[344]++;
      for (var attr in config) {
        _$jscoverage['/attribute.js'].lineData[346]++;
        host.setInternal(attr, config[attr]);
      }
    }
  }
  _$jscoverage['/attribute.js'].lineData[351]++;
  S.augment(Attribute, CustomEvent.Target, {
  INVALID: INVALID, 
  callSuper: function() {
  _$jscoverage['/attribute.js'].functionData[23]++;
  _$jscoverage['/attribute.js'].lineData[355]++;
  var method, obj, self = this, args = arguments;
  _$jscoverage['/attribute.js'].lineData[359]++;
  if (visit44_359_1(visit45_359_2(typeof self === 'function') && self.__name__)) {
    _$jscoverage['/attribute.js'].lineData[360]++;
    method = self;
    _$jscoverage['/attribute.js'].lineData[361]++;
    obj = args[0];
    _$jscoverage['/attribute.js'].lineData[362]++;
    args = Array.prototype.slice.call(args, 1);
  } else {
    _$jscoverage['/attribute.js'].lineData[365]++;
    method = arguments.callee.caller;
    _$jscoverage['/attribute.js'].lineData[366]++;
    if (visit46_366_1(method.__wrapped__)) {
      _$jscoverage['/attribute.js'].lineData[367]++;
      method = method.caller;
    }
    _$jscoverage['/attribute.js'].lineData[369]++;
    obj = self;
  }
  _$jscoverage['/attribute.js'].lineData[372]++;
  var name = method.__name__;
  _$jscoverage['/attribute.js'].lineData[373]++;
  if (visit47_373_1(!name)) {
    _$jscoverage['/attribute.js'].lineData[375]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[377]++;
  var member = method.__owner__.superclass[name];
  _$jscoverage['/attribute.js'].lineData[378]++;
  if (visit48_378_1(!member)) {
    _$jscoverage['/attribute.js'].lineData[380]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[383]++;
  return member.apply(obj, visit49_383_1(args || []));
}, 
  getAttrs: function() {
  _$jscoverage['/attribute.js'].functionData[24]++;
  _$jscoverage['/attribute.js'].lineData[392]++;
  return visit50_392_1(this.__attrs || (this.__attrs = {}));
}, 
  getAttrVals: function() {
  _$jscoverage['/attribute.js'].functionData[25]++;
  _$jscoverage['/attribute.js'].lineData[400]++;
  var self = this, o = {}, a, attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[404]++;
  for (a in attrs) {
    _$jscoverage['/attribute.js'].lineData[405]++;
    o[a] = self.get(a);
  }
  _$jscoverage['/attribute.js'].lineData[407]++;
  return o;
}, 
  addAttr: function(name, attrConfig, override) {
  _$jscoverage['/attribute.js'].functionData[26]++;
  _$jscoverage['/attribute.js'].lineData[428]++;
  var self = this, attrs = self.getAttrs(), attr, cfg = S.clone(attrConfig);
  _$jscoverage['/attribute.js'].lineData[432]++;
  if ((attr = attrs[name])) {
    _$jscoverage['/attribute.js'].lineData[433]++;
    S.mix(attr, cfg, override);
  } else {
    _$jscoverage['/attribute.js'].lineData[435]++;
    attrs[name] = cfg;
  }
  _$jscoverage['/attribute.js'].lineData[437]++;
  return self;
}, 
  addAttrs: function(attrConfigs, initialValues) {
  _$jscoverage['/attribute.js'].functionData[27]++;
  _$jscoverage['/attribute.js'].lineData[447]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[448]++;
  S.each(attrConfigs, function(attrConfig, name) {
  _$jscoverage['/attribute.js'].functionData[28]++;
  _$jscoverage['/attribute.js'].lineData[449]++;
  self.addAttr(name, attrConfig);
});
  _$jscoverage['/attribute.js'].lineData[451]++;
  if (visit51_451_1(initialValues)) {
    _$jscoverage['/attribute.js'].lineData[452]++;
    self.set(initialValues);
  }
  _$jscoverage['/attribute.js'].lineData[454]++;
  return self;
}, 
  hasAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[29]++;
  _$jscoverage['/attribute.js'].lineData[463]++;
  return this.getAttrs().hasOwnProperty(name);
}, 
  removeAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[30]++;
  _$jscoverage['/attribute.js'].lineData[471]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[472]++;
  var __attrVals = getAttrVals(self);
  _$jscoverage['/attribute.js'].lineData[473]++;
  var __attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[475]++;
  if (visit52_475_1(self.hasAttr(name))) {
    _$jscoverage['/attribute.js'].lineData[476]++;
    delete __attrs[name];
    _$jscoverage['/attribute.js'].lineData[477]++;
    delete __attrVals[name];
  }
  _$jscoverage['/attribute.js'].lineData[480]++;
  return self;
}, 
  set: function(name, value, opts) {
  _$jscoverage['/attribute.js'].functionData[31]++;
  _$jscoverage['/attribute.js'].lineData[493]++;
  var self = this, e;
  _$jscoverage['/attribute.js'].lineData[494]++;
  if (visit53_494_1(S.isPlainObject(name))) {
    _$jscoverage['/attribute.js'].lineData[495]++;
    opts = value;
    _$jscoverage['/attribute.js'].lineData[496]++;
    opts = visit54_496_1(opts || {});
    _$jscoverage['/attribute.js'].lineData[497]++;
    var all = Object(name), attrs = [], errors = [];
    _$jscoverage['/attribute.js'].lineData[500]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[503]++;
      if (visit55_503_1((e = validate(self, name, all[name], all)) !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[504]++;
        errors.push(e);
      }
    }
    _$jscoverage['/attribute.js'].lineData[507]++;
    if (visit56_507_1(errors.length)) {
      _$jscoverage['/attribute.js'].lineData[508]++;
      if (visit57_508_1(opts.error)) {
        _$jscoverage['/attribute.js'].lineData[509]++;
        opts.error(errors);
      }
      _$jscoverage['/attribute.js'].lineData[511]++;
      return FALSE;
    }
    _$jscoverage['/attribute.js'].lineData[513]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[514]++;
      setInternal(self, name, all[name], opts, attrs);
    }
    _$jscoverage['/attribute.js'].lineData[516]++;
    var attrNames = [], prevVals = [], newVals = [], subAttrNames = [];
    _$jscoverage['/attribute.js'].lineData[520]++;
    S.each(attrs, function(attr) {
  _$jscoverage['/attribute.js'].functionData[32]++;
  _$jscoverage['/attribute.js'].lineData[521]++;
  prevVals.push(attr.prevVal);
  _$jscoverage['/attribute.js'].lineData[522]++;
  newVals.push(attr.newVal);
  _$jscoverage['/attribute.js'].lineData[523]++;
  attrNames.push(attr.attrName);
  _$jscoverage['/attribute.js'].lineData[524]++;
  subAttrNames.push(attr.subAttrName);
});
    _$jscoverage['/attribute.js'].lineData[526]++;
    if (visit58_526_1(attrNames.length)) {
      _$jscoverage['/attribute.js'].lineData[527]++;
      __fireAttrChange(self, '', '*', prevVals, newVals, subAttrNames, attrNames, opts.data);
    }
    _$jscoverage['/attribute.js'].lineData[536]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[538]++;
  opts = visit59_538_1(opts || {});
  _$jscoverage['/attribute.js'].lineData[540]++;
  e = validate(self, name, value);
  _$jscoverage['/attribute.js'].lineData[542]++;
  if (visit60_542_1(e !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[543]++;
    if (visit61_543_1(opts.error)) {
      _$jscoverage['/attribute.js'].lineData[544]++;
      opts.error(e);
    }
    _$jscoverage['/attribute.js'].lineData[546]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[548]++;
  return setInternal(self, name, value, opts);
}, 
  setInternal: function(name, value) {
  _$jscoverage['/attribute.js'].functionData[33]++;
  _$jscoverage['/attribute.js'].lineData[557]++;
  var self = this, setValue, attrConfig = ensureNonEmpty(self.getAttrs(), name), setter = attrConfig.setter;
  _$jscoverage['/attribute.js'].lineData[566]++;
  if (visit62_566_1(setter && (setter = normalFn(self, setter)))) {
    _$jscoverage['/attribute.js'].lineData[567]++;
    setValue = setter.call(self, value, name);
  }
  _$jscoverage['/attribute.js'].lineData[570]++;
  if (visit63_570_1(setValue === INVALID)) {
    _$jscoverage['/attribute.js'].lineData[571]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[574]++;
  if (visit64_574_1(setValue !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[575]++;
    value = setValue;
  }
  _$jscoverage['/attribute.js'].lineData[579]++;
  getAttrVals(self)[name] = value;
  _$jscoverage['/attribute.js'].lineData[581]++;
  return undefined;
}, 
  get: function(name) {
  _$jscoverage['/attribute.js'].functionData[34]++;
  _$jscoverage['/attribute.js'].lineData[590]++;
  var self = this, dot = '.', path, attrVals = getAttrVals(self), attrConfig, getter, ret;
  _$jscoverage['/attribute.js'].lineData[597]++;
  if (visit65_597_1(name.indexOf(dot) !== -1)) {
    _$jscoverage['/attribute.js'].lineData[598]++;
    path = name.split(dot);
    _$jscoverage['/attribute.js'].lineData[599]++;
    name = path.shift();
  }
  _$jscoverage['/attribute.js'].lineData[602]++;
  attrConfig = ensureNonEmpty(self.getAttrs(), name, 1);
  _$jscoverage['/attribute.js'].lineData[603]++;
  getter = attrConfig.getter;
  _$jscoverage['/attribute.js'].lineData[607]++;
  ret = name in attrVals ? attrVals[name] : getDefAttrVal(self, name);
  _$jscoverage['/attribute.js'].lineData[612]++;
  if (visit66_612_1(getter && (getter = normalFn(self, getter)))) {
    _$jscoverage['/attribute.js'].lineData[613]++;
    ret = getter.call(self, ret, name);
  }
  _$jscoverage['/attribute.js'].lineData[616]++;
  if (visit67_616_1(!(name in attrVals) && visit68_616_2(ret !== undefined))) {
    _$jscoverage['/attribute.js'].lineData[617]++;
    attrVals[name] = ret;
  }
  _$jscoverage['/attribute.js'].lineData[620]++;
  if (visit69_620_1(path)) {
    _$jscoverage['/attribute.js'].lineData[621]++;
    ret = getValueByPath(ret, path);
  }
  _$jscoverage['/attribute.js'].lineData[624]++;
  return ret;
}, 
  reset: function(name, opts) {
  _$jscoverage['/attribute.js'].functionData[35]++;
  _$jscoverage['/attribute.js'].lineData[636]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[638]++;
  if (visit70_638_1(typeof name === 'string')) {
    _$jscoverage['/attribute.js'].lineData[639]++;
    if (visit71_639_1(self.hasAttr(name))) {
      _$jscoverage['/attribute.js'].lineData[641]++;
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
