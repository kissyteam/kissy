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
  _$jscoverage['/attribute.js'].lineData[433] = 0;
  _$jscoverage['/attribute.js'].lineData[434] = 0;
  _$jscoverage['/attribute.js'].lineData[435] = 0;
  _$jscoverage['/attribute.js'].lineData[437] = 0;
  _$jscoverage['/attribute.js'].lineData[438] = 0;
  _$jscoverage['/attribute.js'].lineData[440] = 0;
  _$jscoverage['/attribute.js'].lineData[442] = 0;
  _$jscoverage['/attribute.js'].lineData[452] = 0;
  _$jscoverage['/attribute.js'].lineData[453] = 0;
  _$jscoverage['/attribute.js'].lineData[454] = 0;
  _$jscoverage['/attribute.js'].lineData[456] = 0;
  _$jscoverage['/attribute.js'].lineData[457] = 0;
  _$jscoverage['/attribute.js'].lineData[459] = 0;
  _$jscoverage['/attribute.js'].lineData[468] = 0;
  _$jscoverage['/attribute.js'].lineData[476] = 0;
  _$jscoverage['/attribute.js'].lineData[477] = 0;
  _$jscoverage['/attribute.js'].lineData[478] = 0;
  _$jscoverage['/attribute.js'].lineData[480] = 0;
  _$jscoverage['/attribute.js'].lineData[481] = 0;
  _$jscoverage['/attribute.js'].lineData[482] = 0;
  _$jscoverage['/attribute.js'].lineData[485] = 0;
  _$jscoverage['/attribute.js'].lineData[498] = 0;
  _$jscoverage['/attribute.js'].lineData[499] = 0;
  _$jscoverage['/attribute.js'].lineData[500] = 0;
  _$jscoverage['/attribute.js'].lineData[501] = 0;
  _$jscoverage['/attribute.js'].lineData[502] = 0;
  _$jscoverage['/attribute.js'].lineData[505] = 0;
  _$jscoverage['/attribute.js'].lineData[508] = 0;
  _$jscoverage['/attribute.js'].lineData[509] = 0;
  _$jscoverage['/attribute.js'].lineData[512] = 0;
  _$jscoverage['/attribute.js'].lineData[513] = 0;
  _$jscoverage['/attribute.js'].lineData[514] = 0;
  _$jscoverage['/attribute.js'].lineData[516] = 0;
  _$jscoverage['/attribute.js'].lineData[518] = 0;
  _$jscoverage['/attribute.js'].lineData[519] = 0;
  _$jscoverage['/attribute.js'].lineData[521] = 0;
  _$jscoverage['/attribute.js'].lineData[525] = 0;
  _$jscoverage['/attribute.js'].lineData[526] = 0;
  _$jscoverage['/attribute.js'].lineData[527] = 0;
  _$jscoverage['/attribute.js'].lineData[528] = 0;
  _$jscoverage['/attribute.js'].lineData[529] = 0;
  _$jscoverage['/attribute.js'].lineData[531] = 0;
  _$jscoverage['/attribute.js'].lineData[532] = 0;
  _$jscoverage['/attribute.js'].lineData[541] = 0;
  _$jscoverage['/attribute.js'].lineData[543] = 0;
  _$jscoverage['/attribute.js'].lineData[545] = 0;
  _$jscoverage['/attribute.js'].lineData[547] = 0;
  _$jscoverage['/attribute.js'].lineData[548] = 0;
  _$jscoverage['/attribute.js'].lineData[549] = 0;
  _$jscoverage['/attribute.js'].lineData[551] = 0;
  _$jscoverage['/attribute.js'].lineData[553] = 0;
  _$jscoverage['/attribute.js'].lineData[562] = 0;
  _$jscoverage['/attribute.js'].lineData[571] = 0;
  _$jscoverage['/attribute.js'].lineData[572] = 0;
  _$jscoverage['/attribute.js'].lineData[575] = 0;
  _$jscoverage['/attribute.js'].lineData[576] = 0;
  _$jscoverage['/attribute.js'].lineData[579] = 0;
  _$jscoverage['/attribute.js'].lineData[580] = 0;
  _$jscoverage['/attribute.js'].lineData[584] = 0;
  _$jscoverage['/attribute.js'].lineData[586] = 0;
  _$jscoverage['/attribute.js'].lineData[595] = 0;
  _$jscoverage['/attribute.js'].lineData[602] = 0;
  _$jscoverage['/attribute.js'].lineData[603] = 0;
  _$jscoverage['/attribute.js'].lineData[604] = 0;
  _$jscoverage['/attribute.js'].lineData[607] = 0;
  _$jscoverage['/attribute.js'].lineData[608] = 0;
  _$jscoverage['/attribute.js'].lineData[612] = 0;
  _$jscoverage['/attribute.js'].lineData[617] = 0;
  _$jscoverage['/attribute.js'].lineData[618] = 0;
  _$jscoverage['/attribute.js'].lineData[621] = 0;
  _$jscoverage['/attribute.js'].lineData[622] = 0;
  _$jscoverage['/attribute.js'].lineData[625] = 0;
  _$jscoverage['/attribute.js'].lineData[626] = 0;
  _$jscoverage['/attribute.js'].lineData[629] = 0;
  _$jscoverage['/attribute.js'].lineData[641] = 0;
  _$jscoverage['/attribute.js'].lineData[643] = 0;
  _$jscoverage['/attribute.js'].lineData[644] = 0;
  _$jscoverage['/attribute.js'].lineData[646] = 0;
  _$jscoverage['/attribute.js'].lineData[648] = 0;
  _$jscoverage['/attribute.js'].lineData[652] = 0;
  _$jscoverage['/attribute.js'].lineData[655] = 0;
  _$jscoverage['/attribute.js'].lineData[659] = 0;
  _$jscoverage['/attribute.js'].lineData[660] = 0;
  _$jscoverage['/attribute.js'].lineData[663] = 0;
  _$jscoverage['/attribute.js'].lineData[664] = 0;
  _$jscoverage['/attribute.js'].lineData[669] = 0;
  _$jscoverage['/attribute.js'].lineData[670] = 0;
  _$jscoverage['/attribute.js'].lineData[675] = 0;
  _$jscoverage['/attribute.js'].lineData[676] = 0;
  _$jscoverage['/attribute.js'].lineData[677] = 0;
  _$jscoverage['/attribute.js'].lineData[678] = 0;
  _$jscoverage['/attribute.js'].lineData[680] = 0;
  _$jscoverage['/attribute.js'].lineData[681] = 0;
  _$jscoverage['/attribute.js'].lineData[684] = 0;
  _$jscoverage['/attribute.js'].lineData[687] = 0;
  _$jscoverage['/attribute.js'].lineData[688] = 0;
  _$jscoverage['/attribute.js'].lineData[690] = 0;
  _$jscoverage['/attribute.js'].lineData[692] = 0;
  _$jscoverage['/attribute.js'].lineData[693] = 0;
  _$jscoverage['/attribute.js'].lineData[695] = 0;
  _$jscoverage['/attribute.js'].lineData[696] = 0;
  _$jscoverage['/attribute.js'].lineData[697] = 0;
  _$jscoverage['/attribute.js'].lineData[699] = 0;
  _$jscoverage['/attribute.js'].lineData[702] = 0;
  _$jscoverage['/attribute.js'].lineData[703] = 0;
  _$jscoverage['/attribute.js'].lineData[705] = 0;
  _$jscoverage['/attribute.js'].lineData[706] = 0;
  _$jscoverage['/attribute.js'].lineData[709] = 0;
  _$jscoverage['/attribute.js'].lineData[712] = 0;
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
  _$jscoverage['/attribute.js'].branchData['433'] = [];
  _$jscoverage['/attribute.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['433'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['456'] = [];
  _$jscoverage['/attribute.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['480'] = [];
  _$jscoverage['/attribute.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['499'] = [];
  _$jscoverage['/attribute.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['501'] = [];
  _$jscoverage['/attribute.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['508'] = [];
  _$jscoverage['/attribute.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['512'] = [];
  _$jscoverage['/attribute.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['513'] = [];
  _$jscoverage['/attribute.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['531'] = [];
  _$jscoverage['/attribute.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['543'] = [];
  _$jscoverage['/attribute.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['547'] = [];
  _$jscoverage['/attribute.js'].branchData['547'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['548'] = [];
  _$jscoverage['/attribute.js'].branchData['548'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['571'] = [];
  _$jscoverage['/attribute.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['575'] = [];
  _$jscoverage['/attribute.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['579'] = [];
  _$jscoverage['/attribute.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['602'] = [];
  _$jscoverage['/attribute.js'].branchData['602'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['617'] = [];
  _$jscoverage['/attribute.js'].branchData['617'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['621'] = [];
  _$jscoverage['/attribute.js'].branchData['621'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['621'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['625'] = [];
  _$jscoverage['/attribute.js'].branchData['625'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['643'] = [];
  _$jscoverage['/attribute.js'].branchData['643'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['644'] = [];
  _$jscoverage['/attribute.js'].branchData['644'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['675'] = [];
  _$jscoverage['/attribute.js'].branchData['675'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['677'] = [];
  _$jscoverage['/attribute.js'].branchData['677'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['695'] = [];
  _$jscoverage['/attribute.js'].branchData['695'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['702'] = [];
  _$jscoverage['/attribute.js'].branchData['702'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['705'] = [];
  _$jscoverage['/attribute.js'].branchData['705'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['705'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['705'][3] = new BranchData();
}
_$jscoverage['/attribute.js'].branchData['705'][3].init(151, 10, 'e !== true');
function visit80_705_3(result) {
  _$jscoverage['/attribute.js'].branchData['705'][3].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['705'][2].init(132, 15, 'e !== undefined');
function visit79_705_2(result) {
  _$jscoverage['/attribute.js'].branchData['705'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['705'][1].init(132, 29, 'e !== undefined && e !== true');
function visit78_705_1(result) {
  _$jscoverage['/attribute.js'].branchData['705'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['702'][1].init(441, 52, 'validator && (validator = normalFn(self, validator))');
function visit77_702_1(result) {
  _$jscoverage['/attribute.js'].branchData['702'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['695'][1].init(179, 4, 'path');
function visit76_695_1(result) {
  _$jscoverage['/attribute.js'].branchData['695'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['677'][1].init(55, 17, 'val !== undefined');
function visit75_677_1(result) {
  _$jscoverage['/attribute.js'].branchData['677'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['675'][1].init(171, 40, 'valFn && (valFn = normalFn(self, valFn))');
function visit74_675_1(result) {
  _$jscoverage['/attribute.js'].branchData['675'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['644'][1].init(22, 18, 'self.hasAttr(name)');
function visit73_644_1(result) {
  _$jscoverage['/attribute.js'].branchData['644'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['643'][1].init(50, 24, 'typeof name === \'string\'');
function visit72_643_1(result) {
  _$jscoverage['/attribute.js'].branchData['643'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['625'][1].init(975, 4, 'path');
function visit71_625_1(result) {
  _$jscoverage['/attribute.js'].branchData['625'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['621'][2].init(881, 17, 'ret !== undefined');
function visit70_621_2(result) {
  _$jscoverage['/attribute.js'].branchData['621'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['621'][1].init(858, 40, '!(name in attrVals) && ret !== undefined');
function visit69_621_1(result) {
  _$jscoverage['/attribute.js'].branchData['621'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['617'][1].init(724, 43, 'getter && (getter = normalFn(self, getter))');
function visit68_617_1(result) {
  _$jscoverage['/attribute.js'].branchData['617'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['602'][1].init(207, 24, 'name.indexOf(dot) !== -1');
function visit67_602_1(result) {
  _$jscoverage['/attribute.js'].branchData['602'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['579'][1].init(687, 22, 'setValue !== undefined');
function visit66_579_1(result) {
  _$jscoverage['/attribute.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['575'][1].init(598, 20, 'setValue === INVALID');
function visit65_575_1(result) {
  _$jscoverage['/attribute.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['571'][1].init(457, 43, 'setter && (setter = normalFn(self, setter))');
function visit64_571_1(result) {
  _$jscoverage['/attribute.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['548'][1].init(22, 10, 'opts.error');
function visit63_548_1(result) {
  _$jscoverage['/attribute.js'].branchData['548'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['547'][1].init(1836, 15, 'e !== undefined');
function visit62_547_1(result) {
  _$jscoverage['/attribute.js'].branchData['547'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['543'][1].init(1727, 10, 'opts || {}');
function visit61_543_1(result) {
  _$jscoverage['/attribute.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['531'][1].init(1261, 16, 'attrNames.length');
function visit60_531_1(result) {
  _$jscoverage['/attribute.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['513'][1].init(26, 10, 'opts.error');
function visit59_513_1(result) {
  _$jscoverage['/attribute.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['512'][1].init(507, 13, 'errors.length');
function visit58_512_1(result) {
  _$jscoverage['/attribute.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['508'][1].init(132, 55, '(e = validate(self, name, all[name], all)) !== undefined');
function visit57_508_1(result) {
  _$jscoverage['/attribute.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['501'][1].init(56, 10, 'opts || {}');
function visit56_501_1(result) {
  _$jscoverage['/attribute.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['499'][1].init(51, 24, 'typeof name !== \'string\'');
function visit55_499_1(result) {
  _$jscoverage['/attribute.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['480'][1].init(143, 18, 'self.hasAttr(name)');
function visit54_480_1(result) {
  _$jscoverage['/attribute.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['456'][1].init(180, 13, 'initialValues');
function visit53_456_1(result) {
  _$jscoverage['/attribute.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['433'][2].init(202, 29, 'typeof cfg.value === \'object\'');
function visit52_433_2(result) {
  _$jscoverage['/attribute.js'].branchData['433'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['433'][1].init(189, 42, 'cfg.value && typeof cfg.value === \'object\'');
function visit51_433_1(result) {
  _$jscoverage['/attribute.js'].branchData['433'][1].ranCondition(result);
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
}_$jscoverage['/attribute.js'].branchData['322'][1].init(1606, 19, 'sx.extend || extend');
function visit41_322_1(result) {
  _$jscoverage['/attribute.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['319'][1].init(1493, 18, 'sxInheritedStatics');
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
}_$jscoverage['/attribute.js'].branchData['294'][1].init(426, 32, 'px.hasOwnProperty(\'constructor\')');
function visit37_294_1(result) {
  _$jscoverage['/attribute.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['293'][1].init(382, 29, 'sx.name || \'AttributeDerived\'');
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
}_$jscoverage['/attribute.js'].branchData['171'][1].init(1076, 11, 'opts.silent');
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
}_$jscoverage['/attribute.js'].branchData['12'][1].init(14, 15, 'v === util.noop');
function visit1_12_1(result) {
  _$jscoverage['/attribute.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/attribute.js'].functionData[0]++;
  _$jscoverage['/attribute.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/attribute.js'].lineData[9]++;
  var CustomEvent = require('event/custom');
  _$jscoverage['/attribute.js'].lineData[11]++;
  function bind(v) {
    _$jscoverage['/attribute.js'].functionData[1]++;
    _$jscoverage['/attribute.js'].lineData[12]++;
    if (visit1_12_1(v === util.noop)) {
      _$jscoverage['/attribute.js'].lineData[13]++;
      return function() {
  _$jscoverage['/attribute.js'].functionData[2]++;
};
    } else {
      _$jscoverage['/attribute.js'].lineData[16]++;
      return util.bind(v);
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
    return when + util.ucfirst(name) + 'Change';
  }
  _$jscoverage['/attribute.js'].lineData[41]++;
  function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName, data) {
    _$jscoverage['/attribute.js'].functionData[6]++;
    _$jscoverage['/attribute.js'].lineData[42]++;
    attrName = visit4_42_1(attrName || name);
    _$jscoverage['/attribute.js'].lineData[43]++;
    return self.fire(whenAttrChangeEventName(when, name), util.mix({
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
        tmp = util.clone(prevVal);
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
    var beforeEventObject = util.mix({
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
    util.each(px, function(v, p) {
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
    util.mix(self.prototype, px);
  }
  _$jscoverage['/attribute.js'].lineData[281]++;
  Attribute.extend = function extend(px, sx) {
  _$jscoverage['/attribute.js'].functionData[19]++;
  _$jscoverage['/attribute.js'].lineData[282]++;
  var SubClass, self = this;
  _$jscoverage['/attribute.js'].lineData[284]++;
  sx = util.merge(sx);
  _$jscoverage['/attribute.js'].lineData[286]++;
  px = util.merge(px);
  _$jscoverage['/attribute.js'].lineData[287]++;
  var hooks, sxHooks = sx.__hooks__;
  _$jscoverage['/attribute.js'].lineData[289]++;
  if ((hooks = self.__hooks__)) {
    _$jscoverage['/attribute.js'].lineData[290]++;
    sxHooks = sx.__hooks__ = visit35_290_1(sx.__hooks__ || {});
    _$jscoverage['/attribute.js'].lineData[291]++;
    util.mix(sxHooks, hooks, false);
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
      SubClass = new Function('return function ' + util.camelCase(name) + '(){ ' + 'this.callSuper.apply(this, arguments);' + '}')();
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
    util.mix(sxInheritedStatics, inheritedStatics, false);
  }
  _$jscoverage['/attribute.js'].lineData[318]++;
  util.extend(SubClass, self, px, sx);
  _$jscoverage['/attribute.js'].lineData[319]++;
  if (visit40_319_1(sxInheritedStatics)) {
    _$jscoverage['/attribute.js'].lineData[320]++;
    util.mix(SubClass, sxInheritedStatics);
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
  util.augment(Attribute, CustomEvent.Target, {
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
  var self = this, attrs = self.getAttrs(), attr, cfg = util.merge(attrConfig);
  _$jscoverage['/attribute.js'].lineData[433]++;
  if (visit51_433_1(cfg.value && visit52_433_2(typeof cfg.value === 'object'))) {
    _$jscoverage['/attribute.js'].lineData[434]++;
    cfg.value = util.clone(cfg.value);
    _$jscoverage['/attribute.js'].lineData[435]++;
    S.log('please use valueFn instead of value for ' + name + ' attribute', 'warn');
  }
  _$jscoverage['/attribute.js'].lineData[437]++;
  if ((attr = attrs[name])) {
    _$jscoverage['/attribute.js'].lineData[438]++;
    util.mix(attr, cfg, override);
  } else {
    _$jscoverage['/attribute.js'].lineData[440]++;
    attrs[name] = cfg;
  }
  _$jscoverage['/attribute.js'].lineData[442]++;
  return self;
}, 
  addAttrs: function(attrConfigs, initialValues) {
  _$jscoverage['/attribute.js'].functionData[27]++;
  _$jscoverage['/attribute.js'].lineData[452]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[453]++;
  util.each(attrConfigs, function(attrConfig, name) {
  _$jscoverage['/attribute.js'].functionData[28]++;
  _$jscoverage['/attribute.js'].lineData[454]++;
  self.addAttr(name, attrConfig);
});
  _$jscoverage['/attribute.js'].lineData[456]++;
  if (visit53_456_1(initialValues)) {
    _$jscoverage['/attribute.js'].lineData[457]++;
    self.set(initialValues);
  }
  _$jscoverage['/attribute.js'].lineData[459]++;
  return self;
}, 
  hasAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[29]++;
  _$jscoverage['/attribute.js'].lineData[468]++;
  return this.getAttrs().hasOwnProperty(name);
}, 
  removeAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[30]++;
  _$jscoverage['/attribute.js'].lineData[476]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[477]++;
  var __attrVals = getAttrVals(self);
  _$jscoverage['/attribute.js'].lineData[478]++;
  var __attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[480]++;
  if (visit54_480_1(self.hasAttr(name))) {
    _$jscoverage['/attribute.js'].lineData[481]++;
    delete __attrs[name];
    _$jscoverage['/attribute.js'].lineData[482]++;
    delete __attrVals[name];
  }
  _$jscoverage['/attribute.js'].lineData[485]++;
  return self;
}, 
  set: function(name, value, opts) {
  _$jscoverage['/attribute.js'].functionData[31]++;
  _$jscoverage['/attribute.js'].lineData[498]++;
  var self = this, e;
  _$jscoverage['/attribute.js'].lineData[499]++;
  if (visit55_499_1(typeof name !== 'string')) {
    _$jscoverage['/attribute.js'].lineData[500]++;
    opts = value;
    _$jscoverage['/attribute.js'].lineData[501]++;
    opts = visit56_501_1(opts || {});
    _$jscoverage['/attribute.js'].lineData[502]++;
    var all = Object(name), attrs = [], errors = [];
    _$jscoverage['/attribute.js'].lineData[505]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[508]++;
      if (visit57_508_1((e = validate(self, name, all[name], all)) !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[509]++;
        errors.push(e);
      }
    }
    _$jscoverage['/attribute.js'].lineData[512]++;
    if (visit58_512_1(errors.length)) {
      _$jscoverage['/attribute.js'].lineData[513]++;
      if (visit59_513_1(opts.error)) {
        _$jscoverage['/attribute.js'].lineData[514]++;
        opts.error(errors);
      }
      _$jscoverage['/attribute.js'].lineData[516]++;
      return FALSE;
    }
    _$jscoverage['/attribute.js'].lineData[518]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[519]++;
      setInternal(self, name, all[name], opts, attrs);
    }
    _$jscoverage['/attribute.js'].lineData[521]++;
    var attrNames = [], prevVals = [], newVals = [], subAttrNames = [];
    _$jscoverage['/attribute.js'].lineData[525]++;
    util.each(attrs, function(attr) {
  _$jscoverage['/attribute.js'].functionData[32]++;
  _$jscoverage['/attribute.js'].lineData[526]++;
  prevVals.push(attr.prevVal);
  _$jscoverage['/attribute.js'].lineData[527]++;
  newVals.push(attr.newVal);
  _$jscoverage['/attribute.js'].lineData[528]++;
  attrNames.push(attr.attrName);
  _$jscoverage['/attribute.js'].lineData[529]++;
  subAttrNames.push(attr.subAttrName);
});
    _$jscoverage['/attribute.js'].lineData[531]++;
    if (visit60_531_1(attrNames.length)) {
      _$jscoverage['/attribute.js'].lineData[532]++;
      __fireAttrChange(self, '', '*', prevVals, newVals, subAttrNames, attrNames, opts.data);
    }
    _$jscoverage['/attribute.js'].lineData[541]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[543]++;
  opts = visit61_543_1(opts || {});
  _$jscoverage['/attribute.js'].lineData[545]++;
  e = validate(self, name, value);
  _$jscoverage['/attribute.js'].lineData[547]++;
  if (visit62_547_1(e !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[548]++;
    if (visit63_548_1(opts.error)) {
      _$jscoverage['/attribute.js'].lineData[549]++;
      opts.error(e);
    }
    _$jscoverage['/attribute.js'].lineData[551]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[553]++;
  return setInternal(self, name, value, opts);
}, 
  setInternal: function(name, value) {
  _$jscoverage['/attribute.js'].functionData[33]++;
  _$jscoverage['/attribute.js'].lineData[562]++;
  var self = this, setValue, attrConfig = ensureNonEmpty(self.getAttrs(), name), setter = attrConfig.setter;
  _$jscoverage['/attribute.js'].lineData[571]++;
  if (visit64_571_1(setter && (setter = normalFn(self, setter)))) {
    _$jscoverage['/attribute.js'].lineData[572]++;
    setValue = setter.call(self, value, name);
  }
  _$jscoverage['/attribute.js'].lineData[575]++;
  if (visit65_575_1(setValue === INVALID)) {
    _$jscoverage['/attribute.js'].lineData[576]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[579]++;
  if (visit66_579_1(setValue !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[580]++;
    value = setValue;
  }
  _$jscoverage['/attribute.js'].lineData[584]++;
  getAttrVals(self)[name] = value;
  _$jscoverage['/attribute.js'].lineData[586]++;
  return undefined;
}, 
  get: function(name) {
  _$jscoverage['/attribute.js'].functionData[34]++;
  _$jscoverage['/attribute.js'].lineData[595]++;
  var self = this, dot = '.', path, attrVals = getAttrVals(self), attrConfig, getter, ret;
  _$jscoverage['/attribute.js'].lineData[602]++;
  if (visit67_602_1(name.indexOf(dot) !== -1)) {
    _$jscoverage['/attribute.js'].lineData[603]++;
    path = name.split(dot);
    _$jscoverage['/attribute.js'].lineData[604]++;
    name = path.shift();
  }
  _$jscoverage['/attribute.js'].lineData[607]++;
  attrConfig = ensureNonEmpty(self.getAttrs(), name, 1);
  _$jscoverage['/attribute.js'].lineData[608]++;
  getter = attrConfig.getter;
  _$jscoverage['/attribute.js'].lineData[612]++;
  ret = name in attrVals ? attrVals[name] : getDefAttrVal(self, name);
  _$jscoverage['/attribute.js'].lineData[617]++;
  if (visit68_617_1(getter && (getter = normalFn(self, getter)))) {
    _$jscoverage['/attribute.js'].lineData[618]++;
    ret = getter.call(self, ret, name);
  }
  _$jscoverage['/attribute.js'].lineData[621]++;
  if (visit69_621_1(!(name in attrVals) && visit70_621_2(ret !== undefined))) {
    _$jscoverage['/attribute.js'].lineData[622]++;
    attrVals[name] = ret;
  }
  _$jscoverage['/attribute.js'].lineData[625]++;
  if (visit71_625_1(path)) {
    _$jscoverage['/attribute.js'].lineData[626]++;
    ret = getValueByPath(ret, path);
  }
  _$jscoverage['/attribute.js'].lineData[629]++;
  return ret;
}, 
  reset: function(name, opts) {
  _$jscoverage['/attribute.js'].functionData[35]++;
  _$jscoverage['/attribute.js'].lineData[641]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[643]++;
  if (visit72_643_1(typeof name === 'string')) {
    _$jscoverage['/attribute.js'].lineData[644]++;
    if (visit73_644_1(self.hasAttr(name))) {
      _$jscoverage['/attribute.js'].lineData[646]++;
      return self.set(name, getDefAttrVal(self, name), opts);
    } else {
      _$jscoverage['/attribute.js'].lineData[648]++;
      return self;
    }
  }
  _$jscoverage['/attribute.js'].lineData[652]++;
  opts = (name);
  _$jscoverage['/attribute.js'].lineData[655]++;
  var attrs = self.getAttrs(), values = {};
  _$jscoverage['/attribute.js'].lineData[659]++;
  for (name in attrs) {
    _$jscoverage['/attribute.js'].lineData[660]++;
    values[name] = getDefAttrVal(self, name);
  }
  _$jscoverage['/attribute.js'].lineData[663]++;
  self.set(values, opts);
  _$jscoverage['/attribute.js'].lineData[664]++;
  return self;
}});
  _$jscoverage['/attribute.js'].lineData[669]++;
  function getDefAttrVal(self, name) {
    _$jscoverage['/attribute.js'].functionData[36]++;
    _$jscoverage['/attribute.js'].lineData[670]++;
    var attrs = self.getAttrs(), attrConfig = ensureNonEmpty(attrs, name, 1), valFn = attrConfig.valueFn, val;
    _$jscoverage['/attribute.js'].lineData[675]++;
    if (visit74_675_1(valFn && (valFn = normalFn(self, valFn)))) {
      _$jscoverage['/attribute.js'].lineData[676]++;
      val = valFn.call(self);
      _$jscoverage['/attribute.js'].lineData[677]++;
      if (visit75_677_1(val !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[678]++;
        attrConfig.value = val;
      }
      _$jscoverage['/attribute.js'].lineData[680]++;
      delete attrConfig.valueFn;
      _$jscoverage['/attribute.js'].lineData[681]++;
      attrs[name] = attrConfig;
    }
    _$jscoverage['/attribute.js'].lineData[684]++;
    return attrConfig.value;
  }
  _$jscoverage['/attribute.js'].lineData[687]++;
  function validate(self, name, value, all) {
    _$jscoverage['/attribute.js'].functionData[37]++;
    _$jscoverage['/attribute.js'].lineData[688]++;
    var path, prevVal, pathNamePair;
    _$jscoverage['/attribute.js'].lineData[690]++;
    pathNamePair = getPathNamePair(name);
    _$jscoverage['/attribute.js'].lineData[692]++;
    name = pathNamePair.name;
    _$jscoverage['/attribute.js'].lineData[693]++;
    path = pathNamePair.path;
    _$jscoverage['/attribute.js'].lineData[695]++;
    if (visit76_695_1(path)) {
      _$jscoverage['/attribute.js'].lineData[696]++;
      prevVal = self.get(name);
      _$jscoverage['/attribute.js'].lineData[697]++;
      value = getValueBySubValue(prevVal, path, value);
    }
    _$jscoverage['/attribute.js'].lineData[699]++;
    var attrConfig = ensureNonEmpty(self.getAttrs(), name), e, validator = attrConfig.validator;
    _$jscoverage['/attribute.js'].lineData[702]++;
    if (visit77_702_1(validator && (validator = normalFn(self, validator)))) {
      _$jscoverage['/attribute.js'].lineData[703]++;
      e = validator.call(self, value, name, all);
      _$jscoverage['/attribute.js'].lineData[705]++;
      if (visit78_705_1(visit79_705_2(e !== undefined) && visit80_705_3(e !== true))) {
        _$jscoverage['/attribute.js'].lineData[706]++;
        return e;
      }
    }
    _$jscoverage['/attribute.js'].lineData[709]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[712]++;
  return Attribute;
});
