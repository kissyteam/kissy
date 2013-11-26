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
if (! _$jscoverage['/selector.js']) {
  _$jscoverage['/selector.js'] = {};
  _$jscoverage['/selector.js'].lineData = [];
  _$jscoverage['/selector.js'].lineData[6] = 0;
  _$jscoverage['/selector.js'].lineData[7] = 0;
  _$jscoverage['/selector.js'].lineData[8] = 0;
  _$jscoverage['/selector.js'].lineData[10] = 0;
  _$jscoverage['/selector.js'].lineData[12] = 0;
  _$jscoverage['/selector.js'].lineData[16] = 0;
  _$jscoverage['/selector.js'].lineData[24] = 0;
  _$jscoverage['/selector.js'].lineData[25] = 0;
  _$jscoverage['/selector.js'].lineData[27] = 0;
  _$jscoverage['/selector.js'].lineData[35] = 0;
  _$jscoverage['/selector.js'].lineData[37] = 0;
  _$jscoverage['/selector.js'].lineData[39] = 0;
  _$jscoverage['/selector.js'].lineData[48] = 0;
  _$jscoverage['/selector.js'].lineData[49] = 0;
  _$jscoverage['/selector.js'].lineData[52] = 0;
  _$jscoverage['/selector.js'].lineData[55] = 0;
  _$jscoverage['/selector.js'].lineData[59] = 0;
  _$jscoverage['/selector.js'].lineData[60] = 0;
  _$jscoverage['/selector.js'].lineData[63] = 0;
  _$jscoverage['/selector.js'].lineData[64] = 0;
  _$jscoverage['/selector.js'].lineData[65] = 0;
  _$jscoverage['/selector.js'].lineData[67] = 0;
  _$jscoverage['/selector.js'].lineData[70] = 0;
  _$jscoverage['/selector.js'].lineData[71] = 0;
  _$jscoverage['/selector.js'].lineData[74] = 0;
  _$jscoverage['/selector.js'].lineData[75] = 0;
  _$jscoverage['/selector.js'].lineData[77] = 0;
  _$jscoverage['/selector.js'].lineData[78] = 0;
  _$jscoverage['/selector.js'].lineData[79] = 0;
  _$jscoverage['/selector.js'].lineData[80] = 0;
  _$jscoverage['/selector.js'].lineData[81] = 0;
  _$jscoverage['/selector.js'].lineData[82] = 0;
  _$jscoverage['/selector.js'].lineData[83] = 0;
  _$jscoverage['/selector.js'].lineData[84] = 0;
  _$jscoverage['/selector.js'].lineData[85] = 0;
  _$jscoverage['/selector.js'].lineData[86] = 0;
  _$jscoverage['/selector.js'].lineData[87] = 0;
  _$jscoverage['/selector.js'].lineData[88] = 0;
  _$jscoverage['/selector.js'].lineData[90] = 0;
  _$jscoverage['/selector.js'].lineData[94] = 0;
  _$jscoverage['/selector.js'].lineData[96] = 0;
  _$jscoverage['/selector.js'].lineData[98] = 0;
  _$jscoverage['/selector.js'].lineData[104] = 0;
  _$jscoverage['/selector.js'].lineData[105] = 0;
  _$jscoverage['/selector.js'].lineData[106] = 0;
  _$jscoverage['/selector.js'].lineData[107] = 0;
  _$jscoverage['/selector.js'].lineData[110] = 0;
  _$jscoverage['/selector.js'].lineData[111] = 0;
  _$jscoverage['/selector.js'].lineData[114] = 0;
  _$jscoverage['/selector.js'].lineData[117] = 0;
  _$jscoverage['/selector.js'].lineData[118] = 0;
  _$jscoverage['/selector.js'].lineData[119] = 0;
  _$jscoverage['/selector.js'].lineData[122] = 0;
  _$jscoverage['/selector.js'].lineData[124] = 0;
  _$jscoverage['/selector.js'].lineData[127] = 0;
  _$jscoverage['/selector.js'].lineData[128] = 0;
  _$jscoverage['/selector.js'].lineData[130] = 0;
  _$jscoverage['/selector.js'].lineData[132] = 0;
  _$jscoverage['/selector.js'].lineData[133] = 0;
  _$jscoverage['/selector.js'].lineData[138] = 0;
  _$jscoverage['/selector.js'].lineData[139] = 0;
  _$jscoverage['/selector.js'].lineData[140] = 0;
  _$jscoverage['/selector.js'].lineData[141] = 0;
  _$jscoverage['/selector.js'].lineData[142] = 0;
  _$jscoverage['/selector.js'].lineData[143] = 0;
  _$jscoverage['/selector.js'].lineData[144] = 0;
  _$jscoverage['/selector.js'].lineData[149] = 0;
  _$jscoverage['/selector.js'].lineData[152] = 0;
  _$jscoverage['/selector.js'].lineData[155] = 0;
  _$jscoverage['/selector.js'].lineData[156] = 0;
  _$jscoverage['/selector.js'].lineData[158] = 0;
  _$jscoverage['/selector.js'].lineData[160] = 0;
  _$jscoverage['/selector.js'].lineData[161] = 0;
  _$jscoverage['/selector.js'].lineData[166] = 0;
  _$jscoverage['/selector.js'].lineData[167] = 0;
  _$jscoverage['/selector.js'].lineData[168] = 0;
  _$jscoverage['/selector.js'].lineData[169] = 0;
  _$jscoverage['/selector.js'].lineData[170] = 0;
  _$jscoverage['/selector.js'].lineData[171] = 0;
  _$jscoverage['/selector.js'].lineData[172] = 0;
  _$jscoverage['/selector.js'].lineData[177] = 0;
  _$jscoverage['/selector.js'].lineData[180] = 0;
  _$jscoverage['/selector.js'].lineData[183] = 0;
  _$jscoverage['/selector.js'].lineData[184] = 0;
  _$jscoverage['/selector.js'].lineData[186] = 0;
  _$jscoverage['/selector.js'].lineData[188] = 0;
  _$jscoverage['/selector.js'].lineData[189] = 0;
  _$jscoverage['/selector.js'].lineData[195] = 0;
  _$jscoverage['/selector.js'].lineData[196] = 0;
  _$jscoverage['/selector.js'].lineData[197] = 0;
  _$jscoverage['/selector.js'].lineData[198] = 0;
  _$jscoverage['/selector.js'].lineData[199] = 0;
  _$jscoverage['/selector.js'].lineData[200] = 0;
  _$jscoverage['/selector.js'].lineData[201] = 0;
  _$jscoverage['/selector.js'].lineData[206] = 0;
  _$jscoverage['/selector.js'].lineData[209] = 0;
  _$jscoverage['/selector.js'].lineData[212] = 0;
  _$jscoverage['/selector.js'].lineData[213] = 0;
  _$jscoverage['/selector.js'].lineData[215] = 0;
  _$jscoverage['/selector.js'].lineData[217] = 0;
  _$jscoverage['/selector.js'].lineData[218] = 0;
  _$jscoverage['/selector.js'].lineData[224] = 0;
  _$jscoverage['/selector.js'].lineData[225] = 0;
  _$jscoverage['/selector.js'].lineData[226] = 0;
  _$jscoverage['/selector.js'].lineData[227] = 0;
  _$jscoverage['/selector.js'].lineData[228] = 0;
  _$jscoverage['/selector.js'].lineData[229] = 0;
  _$jscoverage['/selector.js'].lineData[230] = 0;
  _$jscoverage['/selector.js'].lineData[235] = 0;
  _$jscoverage['/selector.js'].lineData[238] = 0;
  _$jscoverage['/selector.js'].lineData[239] = 0;
  _$jscoverage['/selector.js'].lineData[240] = 0;
  _$jscoverage['/selector.js'].lineData[241] = 0;
  _$jscoverage['/selector.js'].lineData[244] = 0;
  _$jscoverage['/selector.js'].lineData[245] = 0;
  _$jscoverage['/selector.js'].lineData[248] = 0;
  _$jscoverage['/selector.js'].lineData[251] = 0;
  _$jscoverage['/selector.js'].lineData[255] = 0;
  _$jscoverage['/selector.js'].lineData[257] = 0;
  _$jscoverage['/selector.js'].lineData[262] = 0;
  _$jscoverage['/selector.js'].lineData[263] = 0;
  _$jscoverage['/selector.js'].lineData[264] = 0;
  _$jscoverage['/selector.js'].lineData[268] = 0;
  _$jscoverage['/selector.js'].lineData[269] = 0;
  _$jscoverage['/selector.js'].lineData[272] = 0;
  _$jscoverage['/selector.js'].lineData[275] = 0;
  _$jscoverage['/selector.js'].lineData[279] = 0;
  _$jscoverage['/selector.js'].lineData[282] = 0;
  _$jscoverage['/selector.js'].lineData[285] = 0;
  _$jscoverage['/selector.js'].lineData[288] = 0;
  _$jscoverage['/selector.js'].lineData[291] = 0;
  _$jscoverage['/selector.js'].lineData[295] = 0;
  _$jscoverage['/selector.js'].lineData[299] = 0;
  _$jscoverage['/selector.js'].lineData[300] = 0;
  _$jscoverage['/selector.js'].lineData[304] = 0;
  _$jscoverage['/selector.js'].lineData[305] = 0;
  _$jscoverage['/selector.js'].lineData[308] = 0;
  _$jscoverage['/selector.js'].lineData[311] = 0;
  _$jscoverage['/selector.js'].lineData[314] = 0;
  _$jscoverage['/selector.js'].lineData[315] = 0;
  _$jscoverage['/selector.js'].lineData[320] = 0;
  _$jscoverage['/selector.js'].lineData[322] = 0;
  _$jscoverage['/selector.js'].lineData[323] = 0;
  _$jscoverage['/selector.js'].lineData[325] = 0;
  _$jscoverage['/selector.js'].lineData[328] = 0;
  _$jscoverage['/selector.js'].lineData[331] = 0;
  _$jscoverage['/selector.js'].lineData[334] = 0;
  _$jscoverage['/selector.js'].lineData[337] = 0;
  _$jscoverage['/selector.js'].lineData[340] = 0;
  _$jscoverage['/selector.js'].lineData[344] = 0;
  _$jscoverage['/selector.js'].lineData[348] = 0;
  _$jscoverage['/selector.js'].lineData[351] = 0;
  _$jscoverage['/selector.js'].lineData[352] = 0;
  _$jscoverage['/selector.js'].lineData[353] = 0;
  _$jscoverage['/selector.js'].lineData[355] = 0;
  _$jscoverage['/selector.js'].lineData[356] = 0;
  _$jscoverage['/selector.js'].lineData[357] = 0;
  _$jscoverage['/selector.js'].lineData[358] = 0;
  _$jscoverage['/selector.js'].lineData[359] = 0;
  _$jscoverage['/selector.js'].lineData[360] = 0;
  _$jscoverage['/selector.js'].lineData[361] = 0;
  _$jscoverage['/selector.js'].lineData[363] = 0;
  _$jscoverage['/selector.js'].lineData[364] = 0;
  _$jscoverage['/selector.js'].lineData[365] = 0;
  _$jscoverage['/selector.js'].lineData[368] = 0;
  _$jscoverage['/selector.js'].lineData[371] = 0;
  _$jscoverage['/selector.js'].lineData[372] = 0;
  _$jscoverage['/selector.js'].lineData[373] = 0;
  _$jscoverage['/selector.js'].lineData[374] = 0;
  _$jscoverage['/selector.js'].lineData[376] = 0;
  _$jscoverage['/selector.js'].lineData[378] = 0;
  _$jscoverage['/selector.js'].lineData[379] = 0;
  _$jscoverage['/selector.js'].lineData[380] = 0;
  _$jscoverage['/selector.js'].lineData[382] = 0;
  _$jscoverage['/selector.js'].lineData[384] = 0;
  _$jscoverage['/selector.js'].lineData[388] = 0;
  _$jscoverage['/selector.js'].lineData[405] = 0;
  _$jscoverage['/selector.js'].lineData[406] = 0;
  _$jscoverage['/selector.js'].lineData[407] = 0;
  _$jscoverage['/selector.js'].lineData[411] = 0;
  _$jscoverage['/selector.js'].lineData[412] = 0;
  _$jscoverage['/selector.js'].lineData[415] = 0;
  _$jscoverage['/selector.js'].lineData[417] = 0;
  _$jscoverage['/selector.js'].lineData[418] = 0;
  _$jscoverage['/selector.js'].lineData[419] = 0;
  _$jscoverage['/selector.js'].lineData[421] = 0;
  _$jscoverage['/selector.js'].lineData[422] = 0;
  _$jscoverage['/selector.js'].lineData[425] = 0;
  _$jscoverage['/selector.js'].lineData[426] = 0;
  _$jscoverage['/selector.js'].lineData[429] = 0;
  _$jscoverage['/selector.js'].lineData[434] = 0;
  _$jscoverage['/selector.js'].lineData[435] = 0;
  _$jscoverage['/selector.js'].lineData[438] = 0;
  _$jscoverage['/selector.js'].lineData[439] = 0;
  _$jscoverage['/selector.js'].lineData[440] = 0;
  _$jscoverage['/selector.js'].lineData[441] = 0;
  _$jscoverage['/selector.js'].lineData[442] = 0;
  _$jscoverage['/selector.js'].lineData[444] = 0;
  _$jscoverage['/selector.js'].lineData[445] = 0;
  _$jscoverage['/selector.js'].lineData[450] = 0;
  _$jscoverage['/selector.js'].lineData[454] = 0;
  _$jscoverage['/selector.js'].lineData[455] = 0;
  _$jscoverage['/selector.js'].lineData[460] = 0;
  _$jscoverage['/selector.js'].lineData[461] = 0;
  _$jscoverage['/selector.js'].lineData[462] = 0;
  _$jscoverage['/selector.js'].lineData[464] = 0;
  _$jscoverage['/selector.js'].lineData[465] = 0;
  _$jscoverage['/selector.js'].lineData[466] = 0;
  _$jscoverage['/selector.js'].lineData[468] = 0;
  _$jscoverage['/selector.js'].lineData[469] = 0;
  _$jscoverage['/selector.js'].lineData[470] = 0;
  _$jscoverage['/selector.js'].lineData[471] = 0;
  _$jscoverage['/selector.js'].lineData[478] = 0;
  _$jscoverage['/selector.js'].lineData[479] = 0;
  _$jscoverage['/selector.js'].lineData[481] = 0;
  _$jscoverage['/selector.js'].lineData[487] = 0;
  _$jscoverage['/selector.js'].lineData[496] = 0;
  _$jscoverage['/selector.js'].lineData[503] = 0;
  _$jscoverage['/selector.js'].lineData[504] = 0;
  _$jscoverage['/selector.js'].lineData[507] = 0;
  _$jscoverage['/selector.js'].lineData[508] = 0;
  _$jscoverage['/selector.js'].lineData[509] = 0;
  _$jscoverage['/selector.js'].lineData[511] = 0;
  _$jscoverage['/selector.js'].lineData[512] = 0;
  _$jscoverage['/selector.js'].lineData[513] = 0;
  _$jscoverage['/selector.js'].lineData[515] = 0;
  _$jscoverage['/selector.js'].lineData[516] = 0;
  _$jscoverage['/selector.js'].lineData[518] = 0;
  _$jscoverage['/selector.js'].lineData[519] = 0;
  _$jscoverage['/selector.js'].lineData[521] = 0;
  _$jscoverage['/selector.js'].lineData[527] = 0;
  _$jscoverage['/selector.js'].lineData[528] = 0;
  _$jscoverage['/selector.js'].lineData[530] = 0;
  _$jscoverage['/selector.js'].lineData[531] = 0;
  _$jscoverage['/selector.js'].lineData[532] = 0;
  _$jscoverage['/selector.js'].lineData[535] = 0;
  _$jscoverage['/selector.js'].lineData[536] = 0;
  _$jscoverage['/selector.js'].lineData[540] = 0;
  _$jscoverage['/selector.js'].lineData[543] = 0;
  _$jscoverage['/selector.js'].lineData[544] = 0;
  _$jscoverage['/selector.js'].lineData[546] = 0;
  _$jscoverage['/selector.js'].lineData[547] = 0;
  _$jscoverage['/selector.js'].lineData[548] = 0;
  _$jscoverage['/selector.js'].lineData[550] = 0;
  _$jscoverage['/selector.js'].lineData[555] = 0;
  _$jscoverage['/selector.js'].lineData[556] = 0;
  _$jscoverage['/selector.js'].lineData[557] = 0;
  _$jscoverage['/selector.js'].lineData[558] = 0;
  _$jscoverage['/selector.js'].lineData[560] = 0;
  _$jscoverage['/selector.js'].lineData[561] = 0;
  _$jscoverage['/selector.js'].lineData[562] = 0;
  _$jscoverage['/selector.js'].lineData[563] = 0;
  _$jscoverage['/selector.js'].lineData[564] = 0;
  _$jscoverage['/selector.js'].lineData[566] = 0;
  _$jscoverage['/selector.js'].lineData[568] = 0;
  _$jscoverage['/selector.js'].lineData[572] = 0;
  _$jscoverage['/selector.js'].lineData[573] = 0;
  _$jscoverage['/selector.js'].lineData[574] = 0;
  _$jscoverage['/selector.js'].lineData[577] = 0;
  _$jscoverage['/selector.js'].lineData[584] = 0;
  _$jscoverage['/selector.js'].lineData[585] = 0;
  _$jscoverage['/selector.js'].lineData[588] = 0;
  _$jscoverage['/selector.js'].lineData[590] = 0;
  _$jscoverage['/selector.js'].lineData[592] = 0;
  _$jscoverage['/selector.js'].lineData[594] = 0;
  _$jscoverage['/selector.js'].lineData[595] = 0;
  _$jscoverage['/selector.js'].lineData[597] = 0;
  _$jscoverage['/selector.js'].lineData[599] = 0;
  _$jscoverage['/selector.js'].lineData[607] = 0;
  _$jscoverage['/selector.js'].lineData[608] = 0;
  _$jscoverage['/selector.js'].lineData[609] = 0;
  _$jscoverage['/selector.js'].lineData[610] = 0;
  _$jscoverage['/selector.js'].lineData[611] = 0;
  _$jscoverage['/selector.js'].lineData[612] = 0;
  _$jscoverage['/selector.js'].lineData[613] = 0;
  _$jscoverage['/selector.js'].lineData[614] = 0;
  _$jscoverage['/selector.js'].lineData[615] = 0;
  _$jscoverage['/selector.js'].lineData[620] = 0;
  _$jscoverage['/selector.js'].lineData[622] = 0;
  _$jscoverage['/selector.js'].lineData[631] = 0;
  _$jscoverage['/selector.js'].lineData[632] = 0;
  _$jscoverage['/selector.js'].lineData[635] = 0;
  _$jscoverage['/selector.js'].lineData[636] = 0;
  _$jscoverage['/selector.js'].lineData[637] = 0;
  _$jscoverage['/selector.js'].lineData[638] = 0;
  _$jscoverage['/selector.js'].lineData[639] = 0;
  _$jscoverage['/selector.js'].lineData[642] = 0;
  _$jscoverage['/selector.js'].lineData[643] = 0;
  _$jscoverage['/selector.js'].lineData[646] = 0;
  _$jscoverage['/selector.js'].lineData[647] = 0;
  _$jscoverage['/selector.js'].lineData[649] = 0;
  _$jscoverage['/selector.js'].lineData[652] = 0;
  _$jscoverage['/selector.js'].lineData[656] = 0;
  _$jscoverage['/selector.js'].lineData[657] = 0;
  _$jscoverage['/selector.js'].lineData[659] = 0;
  _$jscoverage['/selector.js'].lineData[660] = 0;
  _$jscoverage['/selector.js'].lineData[663] = 0;
  _$jscoverage['/selector.js'].lineData[664] = 0;
  _$jscoverage['/selector.js'].lineData[665] = 0;
  _$jscoverage['/selector.js'].lineData[666] = 0;
  _$jscoverage['/selector.js'].lineData[667] = 0;
  _$jscoverage['/selector.js'].lineData[668] = 0;
  _$jscoverage['/selector.js'].lineData[669] = 0;
  _$jscoverage['/selector.js'].lineData[670] = 0;
  _$jscoverage['/selector.js'].lineData[676] = 0;
  _$jscoverage['/selector.js'].lineData[677] = 0;
  _$jscoverage['/selector.js'].lineData[680] = 0;
  _$jscoverage['/selector.js'].lineData[683] = 0;
  _$jscoverage['/selector.js'].lineData[685] = 0;
  _$jscoverage['/selector.js'].lineData[687] = 0;
}
if (! _$jscoverage['/selector.js'].functionData) {
  _$jscoverage['/selector.js'].functionData = [];
  _$jscoverage['/selector.js'].functionData[0] = 0;
  _$jscoverage['/selector.js'].functionData[1] = 0;
  _$jscoverage['/selector.js'].functionData[2] = 0;
  _$jscoverage['/selector.js'].functionData[3] = 0;
  _$jscoverage['/selector.js'].functionData[4] = 0;
  _$jscoverage['/selector.js'].functionData[5] = 0;
  _$jscoverage['/selector.js'].functionData[6] = 0;
  _$jscoverage['/selector.js'].functionData[7] = 0;
  _$jscoverage['/selector.js'].functionData[8] = 0;
  _$jscoverage['/selector.js'].functionData[9] = 0;
  _$jscoverage['/selector.js'].functionData[10] = 0;
  _$jscoverage['/selector.js'].functionData[11] = 0;
  _$jscoverage['/selector.js'].functionData[12] = 0;
  _$jscoverage['/selector.js'].functionData[13] = 0;
  _$jscoverage['/selector.js'].functionData[14] = 0;
  _$jscoverage['/selector.js'].functionData[15] = 0;
  _$jscoverage['/selector.js'].functionData[16] = 0;
  _$jscoverage['/selector.js'].functionData[17] = 0;
  _$jscoverage['/selector.js'].functionData[18] = 0;
  _$jscoverage['/selector.js'].functionData[19] = 0;
  _$jscoverage['/selector.js'].functionData[20] = 0;
  _$jscoverage['/selector.js'].functionData[21] = 0;
  _$jscoverage['/selector.js'].functionData[22] = 0;
  _$jscoverage['/selector.js'].functionData[23] = 0;
  _$jscoverage['/selector.js'].functionData[24] = 0;
  _$jscoverage['/selector.js'].functionData[25] = 0;
  _$jscoverage['/selector.js'].functionData[26] = 0;
  _$jscoverage['/selector.js'].functionData[27] = 0;
  _$jscoverage['/selector.js'].functionData[28] = 0;
  _$jscoverage['/selector.js'].functionData[29] = 0;
  _$jscoverage['/selector.js'].functionData[30] = 0;
  _$jscoverage['/selector.js'].functionData[31] = 0;
  _$jscoverage['/selector.js'].functionData[32] = 0;
  _$jscoverage['/selector.js'].functionData[33] = 0;
  _$jscoverage['/selector.js'].functionData[34] = 0;
  _$jscoverage['/selector.js'].functionData[35] = 0;
  _$jscoverage['/selector.js'].functionData[36] = 0;
  _$jscoverage['/selector.js'].functionData[37] = 0;
  _$jscoverage['/selector.js'].functionData[38] = 0;
  _$jscoverage['/selector.js'].functionData[39] = 0;
  _$jscoverage['/selector.js'].functionData[40] = 0;
  _$jscoverage['/selector.js'].functionData[41] = 0;
  _$jscoverage['/selector.js'].functionData[42] = 0;
  _$jscoverage['/selector.js'].functionData[43] = 0;
  _$jscoverage['/selector.js'].functionData[44] = 0;
  _$jscoverage['/selector.js'].functionData[45] = 0;
  _$jscoverage['/selector.js'].functionData[46] = 0;
  _$jscoverage['/selector.js'].functionData[47] = 0;
}
if (! _$jscoverage['/selector.js'].branchData) {
  _$jscoverage['/selector.js'].branchData = {};
  _$jscoverage['/selector.js'].branchData['24'] = [];
  _$jscoverage['/selector.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['42'] = [];
  _$jscoverage['/selector.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['66'] = [];
  _$jscoverage['/selector.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['66'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['74'] = [];
  _$jscoverage['/selector.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['77'] = [];
  _$jscoverage['/selector.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['80'] = [];
  _$jscoverage['/selector.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['83'] = [];
  _$jscoverage['/selector.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['84'] = [];
  _$jscoverage['/selector.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['86'] = [];
  _$jscoverage['/selector.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['87'] = [];
  _$jscoverage['/selector.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['96'] = [];
  _$jscoverage['/selector.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['105'] = [];
  _$jscoverage['/selector.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['106'] = [];
  _$jscoverage['/selector.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['110'] = [];
  _$jscoverage['/selector.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['110'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['110'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['110'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['118'] = [];
  _$jscoverage['/selector.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['118'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['119'] = [];
  _$jscoverage['/selector.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['127'] = [];
  _$jscoverage['/selector.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['127'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['127'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['132'] = [];
  _$jscoverage['/selector.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['138'] = [];
  _$jscoverage['/selector.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['140'] = [];
  _$jscoverage['/selector.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['142'] = [];
  _$jscoverage['/selector.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['143'] = [];
  _$jscoverage['/selector.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['155'] = [];
  _$jscoverage['/selector.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['155'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['155'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['160'] = [];
  _$jscoverage['/selector.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['166'] = [];
  _$jscoverage['/selector.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['168'] = [];
  _$jscoverage['/selector.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['170'] = [];
  _$jscoverage['/selector.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['171'] = [];
  _$jscoverage['/selector.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['183'] = [];
  _$jscoverage['/selector.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['183'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['183'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['188'] = [];
  _$jscoverage['/selector.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['195'] = [];
  _$jscoverage['/selector.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['197'] = [];
  _$jscoverage['/selector.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['199'] = [];
  _$jscoverage['/selector.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['200'] = [];
  _$jscoverage['/selector.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['212'] = [];
  _$jscoverage['/selector.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['212'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['212'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['217'] = [];
  _$jscoverage['/selector.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['224'] = [];
  _$jscoverage['/selector.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['226'] = [];
  _$jscoverage['/selector.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['228'] = [];
  _$jscoverage['/selector.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['229'] = [];
  _$jscoverage['/selector.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['241'] = [];
  _$jscoverage['/selector.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['242'] = [];
  _$jscoverage['/selector.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['245'] = [];
  _$jscoverage['/selector.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['245'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['245'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['247'] = [];
  _$jscoverage['/selector.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['247'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['262'] = [];
  _$jscoverage['/selector.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['268'] = [];
  _$jscoverage['/selector.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['268'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['268'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['268'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['268'][5] = new BranchData();
  _$jscoverage['/selector.js'].branchData['268'][6] = new BranchData();
  _$jscoverage['/selector.js'].branchData['268'][7] = new BranchData();
  _$jscoverage['/selector.js'].branchData['275'] = [];
  _$jscoverage['/selector.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['276'] = [];
  _$jscoverage['/selector.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['291'] = [];
  _$jscoverage['/selector.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['295'] = [];
  _$jscoverage['/selector.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['300'] = [];
  _$jscoverage['/selector.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['300'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['300'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['301'] = [];
  _$jscoverage['/selector.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['301'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['301'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['301'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['301'][5] = new BranchData();
  _$jscoverage['/selector.js'].branchData['305'] = [];
  _$jscoverage['/selector.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['305'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['315'] = [];
  _$jscoverage['/selector.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['315'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['315'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['316'] = [];
  _$jscoverage['/selector.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['316'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['322'] = [];
  _$jscoverage['/selector.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['322'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['325'] = [];
  _$jscoverage['/selector.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['328'] = [];
  _$jscoverage['/selector.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['331'] = [];
  _$jscoverage['/selector.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['334'] = [];
  _$jscoverage['/selector.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['337'] = [];
  _$jscoverage['/selector.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['337'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['340'] = [];
  _$jscoverage['/selector.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['348'] = [];
  _$jscoverage['/selector.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['352'] = [];
  _$jscoverage['/selector.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['357'] = [];
  _$jscoverage['/selector.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['357'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['359'] = [];
  _$jscoverage['/selector.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['360'] = [];
  _$jscoverage['/selector.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['364'] = [];
  _$jscoverage['/selector.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['372'] = [];
  _$jscoverage['/selector.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['373'] = [];
  _$jscoverage['/selector.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['378'] = [];
  _$jscoverage['/selector.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['379'] = [];
  _$jscoverage['/selector.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['405'] = [];
  _$jscoverage['/selector.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['418'] = [];
  _$jscoverage['/selector.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['421'] = [];
  _$jscoverage['/selector.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['425'] = [];
  _$jscoverage['/selector.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['434'] = [];
  _$jscoverage['/selector.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['438'] = [];
  _$jscoverage['/selector.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['441'] = [];
  _$jscoverage['/selector.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['441'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['444'] = [];
  _$jscoverage['/selector.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['462'] = [];
  _$jscoverage['/selector.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['464'] = [];
  _$jscoverage['/selector.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['465'] = [];
  _$jscoverage['/selector.js'].branchData['465'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['470'] = [];
  _$jscoverage['/selector.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['479'] = [];
  _$jscoverage['/selector.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['488'] = [];
  _$jscoverage['/selector.js'].branchData['488'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['508'] = [];
  _$jscoverage['/selector.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['512'] = [];
  _$jscoverage['/selector.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['517'] = [];
  _$jscoverage['/selector.js'].branchData['517'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['518'] = [];
  _$jscoverage['/selector.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['530'] = [];
  _$jscoverage['/selector.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['531'] = [];
  _$jscoverage['/selector.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['535'] = [];
  _$jscoverage['/selector.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['546'] = [];
  _$jscoverage['/selector.js'].branchData['546'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['547'] = [];
  _$jscoverage['/selector.js'].branchData['547'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['557'] = [];
  _$jscoverage['/selector.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['563'] = [];
  _$jscoverage['/selector.js'].branchData['563'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['573'] = [];
  _$jscoverage['/selector.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['584'] = [];
  _$jscoverage['/selector.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['585'] = [];
  _$jscoverage['/selector.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['588'] = [];
  _$jscoverage['/selector.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['588'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['590'] = [];
  _$jscoverage['/selector.js'].branchData['590'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['594'] = [];
  _$jscoverage['/selector.js'].branchData['594'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['607'] = [];
  _$jscoverage['/selector.js'].branchData['607'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['608'] = [];
  _$jscoverage['/selector.js'].branchData['608'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['611'] = [];
  _$jscoverage['/selector.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['613'] = [];
  _$jscoverage['/selector.js'].branchData['613'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['620'] = [];
  _$jscoverage['/selector.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['631'] = [];
  _$jscoverage['/selector.js'].branchData['631'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['631'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['631'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['631'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['635'] = [];
  _$jscoverage['/selector.js'].branchData['635'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['637'] = [];
  _$jscoverage['/selector.js'].branchData['637'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['642'] = [];
  _$jscoverage['/selector.js'].branchData['642'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['646'] = [];
  _$jscoverage['/selector.js'].branchData['646'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['646'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['646'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['652'] = [];
  _$jscoverage['/selector.js'].branchData['652'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['659'] = [];
  _$jscoverage['/selector.js'].branchData['659'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['663'] = [];
  _$jscoverage['/selector.js'].branchData['663'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['666'] = [];
  _$jscoverage['/selector.js'].branchData['666'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['668'] = [];
  _$jscoverage['/selector.js'].branchData['668'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['669'] = [];
  _$jscoverage['/selector.js'].branchData['669'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['676'] = [];
  _$jscoverage['/selector.js'].branchData['676'][1] = new BranchData();
}
_$jscoverage['/selector.js'].branchData['676'][1].init(3685, 12, 'groupLen > 1');
function visit198_676_1(result) {
  _$jscoverage['/selector.js'].branchData['676'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['669'][1].init(25, 39, 'matchSub(matchHead.el, matchHead.match)');
function visit197_669_1(result) {
  _$jscoverage['/selector.js'].branchData['669'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['668'][1].init(224, 9, 'matchHead');
function visit196_668_1(result) {
  _$jscoverage['/selector.js'].branchData['668'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['666'][1].init(138, 18, 'matchHead === true');
function visit195_666_1(result) {
  _$jscoverage['/selector.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['663'][1].init(2665, 21, 'seedsIndex < seedsLen');
function visit194_663_1(result) {
  _$jscoverage['/selector.js'].branchData['663'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['659'][1].init(2592, 9, '!seedsLen');
function visit193_659_1(result) {
  _$jscoverage['/selector.js'].branchData['659'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['652'][1].init(57, 18, 'group.value || \'*\'');
function visit192_652_1(result) {
  _$jscoverage['/selector.js'].branchData['652'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['646'][3].init(52, 27, 'context !== contextDocument');
function visit191_646_3(result) {
  _$jscoverage['/selector.js'].branchData['646'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['646'][2].init(45, 34, 'tmp && context !== contextDocument');
function visit190_646_2(result) {
  _$jscoverage['/selector.js'].branchData['646'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['646'][1].init(29, 50, 'contextInDom && tmp && context !== contextDocument');
function visit189_646_1(result) {
  _$jscoverage['/selector.js'].branchData['646'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['642'][1].init(499, 15, 'tmpI === tmpLen');
function visit188_642_1(result) {
  _$jscoverage['/selector.js'].branchData['642'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['637'][1].init(79, 24, 'getAttr(tmp, \'id\') == id');
function visit187_637_1(result) {
  _$jscoverage['/selector.js'].branchData['637'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['635'][1].init(196, 13, 'tmpI < tmpLen');
function visit186_635_1(result) {
  _$jscoverage['/selector.js'].branchData['635'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['631'][4].init(656, 24, 'getAttr(tmp, \'id\') != id');
function visit185_631_4(result) {
  _$jscoverage['/selector.js'].branchData['631'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['631'][3].init(649, 31, 'tmp && getAttr(tmp, \'id\') != id');
function visit184_631_3(result) {
  _$jscoverage['/selector.js'].branchData['631'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['631'][2].init(623, 22, '!tmp && doesNotHasById');
function visit183_631_2(result) {
  _$jscoverage['/selector.js'].branchData['631'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['631'][1].init(623, 57, '!tmp && doesNotHasById || tmp && getAttr(tmp, \'id\') != id');
function visit182_631_1(result) {
  _$jscoverage['/selector.js'].branchData['631'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['620'][1].init(494, 2, 'id');
function visit181_620_1(result) {
  _$jscoverage['/selector.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['613'][1].init(93, 22, 'singleSuffix.t == \'id\'');
function visit180_613_1(result) {
  _$jscoverage['/selector.js'].branchData['613'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['611'][1].init(112, 23, 'suffixIndex < suffixLen');
function visit179_611_1(result) {
  _$jscoverage['/selector.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['608'][1].init(21, 23, 'suffix && !isContextXML');
function visit178_608_1(result) {
  _$jscoverage['/selector.js'].branchData['608'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['607'][1].init(298, 8, '!mySeeds');
function visit177_607_1(result) {
  _$jscoverage['/selector.js'].branchData['607'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['594'][1].init(524, 21, 'groupIndex < groupLen');
function visit176_594_1(result) {
  _$jscoverage['/selector.js'].branchData['594'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['590'][1].init(440, 26, 'context || contextDocument');
function visit175_590_1(result) {
  _$jscoverage['/selector.js'].branchData['590'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['588'][2].init(375, 32, 'context && context.ownerDocument');
function visit174_588_2(result) {
  _$jscoverage['/selector.js'].branchData['588'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['588'][1].init(375, 44, 'context && context.ownerDocument || document');
function visit173_588_1(result) {
  _$jscoverage['/selector.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['585'][1].init(23, 33, 'context || seeds[0].ownerDocument');
function visit172_585_1(result) {
  _$jscoverage['/selector.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['584'][1].init(272, 5, 'seeds');
function visit171_584_1(result) {
  _$jscoverage['/selector.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['573'][1].init(13, 12, '!caches[str]');
function visit170_573_1(result) {
  _$jscoverage['/selector.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['563'][1].init(21, 19, 'matchSub(el, match)');
function visit169_563_1(result) {
  _$jscoverage['/selector.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['557'][1].init(72, 26, 'matchImmediateRet === true');
function visit168_557_1(result) {
  _$jscoverage['/selector.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['547'][1].init(129, 27, 'matchKey in subMatchesCache');
function visit167_547_1(result) {
  _$jscoverage['/selector.js'].branchData['547'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['546'][1].init(98, 16, 'match.order || 0');
function visit166_546_1(result) {
  _$jscoverage['/selector.js'].branchData['546'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['535'][1].init(17, 40, '!(selectorId = el[EXPANDO_SELECTOR_KEY])');
function visit165_535_1(result) {
  _$jscoverage['/selector.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['531'][1].init(17, 53, '!(selectorId = el.getAttribute(EXPANDO_SELECTOR_KEY))');
function visit164_531_1(result) {
  _$jscoverage['/selector.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['530'][1].init(38, 12, 'isContextXML');
function visit163_530_1(result) {
  _$jscoverage['/selector.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['518'][1].init(401, 3, '!el');
function visit162_518_1(result) {
  _$jscoverage['/selector.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['517'][1].init(301, 26, 'el && relativeOp.immediate');
function visit161_517_1(result) {
  _$jscoverage['/selector.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['512'][1].init(129, 4, '!cur');
function visit160_512_1(result) {
  _$jscoverage['/selector.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['508'][1].init(17, 21, '!singleMatch(el, cur)');
function visit159_508_1(result) {
  _$jscoverage['/selector.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['488'][1].init(29, 29, 'el && dir(el, relativeOp.dir)');
function visit158_488_1(result) {
  _$jscoverage['/selector.js'].branchData['488'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['479'][1].init(86, 20, 'relativeOp.immediate');
function visit157_479_1(result) {
  _$jscoverage['/selector.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['470'][1].init(285, 21, '!relativeOp.immediate');
function visit156_470_1(result) {
  _$jscoverage['/selector.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['465'][1].init(93, 6, '!match');
function visit155_465_1(result) {
  _$jscoverage['/selector.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['464'][1].init(52, 19, 'match && match.prev');
function visit154_464_1(result) {
  _$jscoverage['/selector.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['462'][1].init(64, 7, 'matched');
function visit153_462_1(result) {
  _$jscoverage['/selector.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['444'][1].init(157, 32, 'matchExpr[singleMatchSuffixType]');
function visit152_444_1(result) {
  _$jscoverage['/selector.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['441'][2].init(114, 33, 'matchSuffixIndex < matchSuffixLen');
function visit151_441_2(result) {
  _$jscoverage['/selector.js'].branchData['441'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['441'][1].init(103, 44, 'matched && matchSuffixIndex < matchSuffixLen');
function visit150_441_1(result) {
  _$jscoverage['/selector.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['438'][1].init(421, 22, 'matched && matchSuffix');
function visit149_438_1(result) {
  _$jscoverage['/selector.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['434'][1].init(320, 16, 'match.t == \'tag\'');
function visit148_434_1(result) {
  _$jscoverage['/selector.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['425'][1].init(126, 17, 'el.nodeType === 9');
function visit147_425_1(result) {
  _$jscoverage['/selector.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['421'][1].init(70, 3, '!el');
function visit146_421_1(result) {
  _$jscoverage['/selector.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['418'][1].init(13, 6, '!match');
function visit145_418_1(result) {
  _$jscoverage['/selector.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['405'][1].init(12640, 41, '\'sourceIndex\' in document.documentElement');
function visit144_405_1(result) {
  _$jscoverage['/selector.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['379'][1].init(21, 23, '!pseudoIdentExpr[ident]');
function visit143_379_1(result) {
  _$jscoverage['/selector.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['378'][1].init(302, 19, 'ident = value.ident');
function visit142_378_1(result) {
  _$jscoverage['/selector.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['373'][1].init(21, 27, '!(fn = pseudoFnExpr[fnStr])');
function visit141_373_1(result) {
  _$jscoverage['/selector.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['372'][1].init(51, 16, 'fnStr = value.fn');
function visit140_372_1(result) {
  _$jscoverage['/selector.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['364'][1].init(163, 7, 'matchFn');
function visit139_364_1(result) {
  _$jscoverage['/selector.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['360'][1].init(21, 21, 'elValue === undefined');
function visit138_360_1(result) {
  _$jscoverage['/selector.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['359'][1].init(310, 5, 'match');
function visit137_359_1(result) {
  _$jscoverage['/selector.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['357'][2].init(235, 21, 'elValue !== undefined');
function visit136_357_2(result) {
  _$jscoverage['/selector.js'].branchData['357'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['357'][1].init(225, 31, '!match && elValue !== undefined');
function visit135_357_1(result) {
  _$jscoverage['/selector.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['352'][1].init(53, 13, '!isContextXML');
function visit134_352_1(result) {
  _$jscoverage['/selector.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['348'][1].init(20, 27, 'getAttr(el, \'id\') === value');
function visit133_348_1(result) {
  _$jscoverage['/selector.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['340'][1].init(20, 17, 'elValue === value');
function visit132_340_1(result) {
  _$jscoverage['/selector.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['337'][2].init(29, 28, 'elValue.indexOf(value) != -1');
function visit131_337_2(result) {
  _$jscoverage['/selector.js'].branchData['337'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['337'][1].init(20, 37, 'value && elValue.indexOf(value) != -1');
function visit130_337_1(result) {
  _$jscoverage['/selector.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['334'][1].init(20, 35, 'value && S.endsWith(elValue, value)');
function visit129_334_1(result) {
  _$jscoverage['/selector.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['331'][1].init(20, 37, 'value && S.startsWith(elValue, value)');
function visit128_331_1(result) {
  _$jscoverage['/selector.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['328'][1].init(21, 47, '(\' \' + elValue).indexOf(\' \' + value + \'-\') != -1');
function visit127_328_1(result) {
  _$jscoverage['/selector.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['325'][1].init(114, 53, '(\' \' + elValue + \' \').indexOf(\' \' + value + \' \') != -1');
function visit126_325_1(result) {
  _$jscoverage['/selector.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['322'][2].init(27, 23, 'value.indexOf(\' \') > -1');
function visit125_322_2(result) {
  _$jscoverage['/selector.js'].branchData['322'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['322'][1].init(17, 33, '!value || value.indexOf(\' \') > -1');
function visit124_322_1(result) {
  _$jscoverage['/selector.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['316'][2].init(55, 21, 'nodeName === "option"');
function visit123_316_2(result) {
  _$jscoverage['/selector.js'].branchData['316'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['316'][1].init(55, 36, 'nodeName === "option" && el.selected');
function visit122_316_1(result) {
  _$jscoverage['/selector.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['315'][3].init(75, 20, 'nodeName === "input"');
function visit121_315_3(result) {
  _$jscoverage['/selector.js'].branchData['315'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['315'][2].init(75, 34, 'nodeName === "input" && el.checked');
function visit120_315_2(result) {
  _$jscoverage['/selector.js'].branchData['315'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['315'][1].init(75, 93, '(nodeName === "input" && el.checked) || (nodeName === "option" && el.selected)');
function visit119_315_1(result) {
  _$jscoverage['/selector.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['305'][2].init(66, 35, 'hash.slice(1) === getAttr(el, \'id\')');
function visit118_305_2(result) {
  _$jscoverage['/selector.js'].branchData['305'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['305'][1].init(58, 43, 'hash && hash.slice(1) === getAttr(el, \'id\')');
function visit117_305_1(result) {
  _$jscoverage['/selector.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['301'][5].init(182, 16, 'el.tabIndex >= 0');
function visit116_301_5(result) {
  _$jscoverage['/selector.js'].branchData['301'][5].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['301'][4].init(171, 27, 'el.href || el.tabIndex >= 0');
function visit115_301_4(result) {
  _$jscoverage['/selector.js'].branchData['301'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['301'][3].init(160, 38, 'el.type || el.href || el.tabIndex >= 0');
function visit114_301_3(result) {
  _$jscoverage['/selector.js'].branchData['301'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['301'][2].init(115, 37, '!doc[\'hasFocus\'] || doc[\'hasFocus\']()');
function visit113_301_2(result) {
  _$jscoverage['/selector.js'].branchData['301'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['301'][1].init(44, 84, '(!doc[\'hasFocus\'] || doc[\'hasFocus\']()) && !!(el.type || el.href || el.tabIndex >= 0)');
function visit112_301_1(result) {
  _$jscoverage['/selector.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['300'][3].init(67, 24, 'el === doc.activeElement');
function visit111_300_3(result) {
  _$jscoverage['/selector.js'].branchData['300'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['300'][2].init(67, 129, 'el === doc.activeElement && (!doc[\'hasFocus\'] || doc[\'hasFocus\']()) && !!(el.type || el.href || el.tabIndex >= 0)');
function visit110_300_2(result) {
  _$jscoverage['/selector.js'].branchData['300'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['300'][1].init(60, 136, 'doc && el === doc.activeElement && (!doc[\'hasFocus\'] || doc[\'hasFocus\']()) && !!(el.type || el.href || el.tabIndex >= 0)');
function visit109_300_1(result) {
  _$jscoverage['/selector.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['295'][1].init(20, 91, 'pseudoIdentExpr[\'first-of-type\'](el) && pseudoIdentExpr[\'last-of-type\'](el)');
function visit108_295_1(result) {
  _$jscoverage['/selector.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['291'][1].init(20, 87, 'pseudoIdentExpr[\'first-child\'](el) && pseudoIdentExpr[\'last-child\'](el)');
function visit107_291_1(result) {
  _$jscoverage['/selector.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['276'][1].init(35, 39, 'el === el.ownerDocument.documentElement');
function visit106_276_1(result) {
  _$jscoverage['/selector.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['275'][1].init(20, 75, 'el.ownerDocument && el === el.ownerDocument.documentElement');
function visit105_275_1(result) {
  _$jscoverage['/selector.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['268'][7].init(331, 13, 'nodeType == 5');
function visit104_268_7(result) {
  _$jscoverage['/selector.js'].branchData['268'][7].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['268'][6].init(314, 13, 'nodeType == 4');
function visit103_268_6(result) {
  _$jscoverage['/selector.js'].branchData['268'][6].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['268'][5].init(314, 30, 'nodeType == 4 || nodeType == 5');
function visit102_268_5(result) {
  _$jscoverage['/selector.js'].branchData['268'][5].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['268'][4].init(297, 13, 'nodeType == 3');
function visit101_268_4(result) {
  _$jscoverage['/selector.js'].branchData['268'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['268'][3].init(297, 47, 'nodeType == 3 || nodeType == 4 || nodeType == 5');
function visit100_268_3(result) {
  _$jscoverage['/selector.js'].branchData['268'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['268'][2].init(280, 13, 'nodeType == 1');
function visit99_268_2(result) {
  _$jscoverage['/selector.js'].branchData['268'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['268'][1].init(280, 64, 'nodeType == 1 || nodeType == 3 || nodeType == 4 || nodeType == 5');
function visit98_268_1(result) {
  _$jscoverage['/selector.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['262'][1].init(185, 11, 'index < len');
function visit97_262_1(result) {
  _$jscoverage['/selector.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['247'][2].init(440, 17, 'el.nodeType === 1');
function visit96_247_2(result) {
  _$jscoverage['/selector.js'].branchData['247'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['247'][1].init(329, 40, '(el = el.parentNode) && el.nodeType === 1');
function visit95_247_1(result) {
  _$jscoverage['/selector.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['245'][3].init(98, 32, 'elLang.indexOf(lang + "-") === 0');
function visit94_245_3(result) {
  _$jscoverage['/selector.js'].branchData['245'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['245'][2].init(79, 15, 'elLang === lang');
function visit93_245_2(result) {
  _$jscoverage['/selector.js'].branchData['245'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['245'][1].init(79, 51, 'elLang === lang || elLang.indexOf(lang + "-") === 0');
function visit92_245_1(result) {
  _$jscoverage['/selector.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['242'][1].init(34, 54, 'el.getAttribute("xml:lang") || el.getAttribute("lang")');
function visit91_242_1(result) {
  _$jscoverage['/selector.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['241'][1].init(21, 130, 'elLang = (isContextXML ? el.getAttribute("xml:lang") || el.getAttribute("lang") : el.lang)');
function visit90_241_1(result) {
  _$jscoverage['/selector.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['229'][1].init(135, 17, 'ret !== undefined');
function visit89_229_1(result) {
  _$jscoverage['/selector.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['228'][1].init(92, 12, 'child === el');
function visit88_228_1(result) {
  _$jscoverage['/selector.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['226'][1].init(72, 23, 'child.tagName == elType');
function visit87_226_1(result) {
  _$jscoverage['/selector.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['224'][1].init(251, 10, 'count >= 0');
function visit86_224_1(result) {
  _$jscoverage['/selector.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['217'][1].init(247, 6, 'parent');
function visit85_217_1(result) {
  _$jscoverage['/selector.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['212'][3].init(114, 6, 'b == 0');
function visit84_212_3(result) {
  _$jscoverage['/selector.js'].branchData['212'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['212'][2].init(104, 6, 'a == 0');
function visit83_212_2(result) {
  _$jscoverage['/selector.js'].branchData['212'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['212'][1].init(104, 16, 'a == 0 && b == 0');
function visit82_212_1(result) {
  _$jscoverage['/selector.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['200'][1].init(135, 17, 'ret !== undefined');
function visit81_200_1(result) {
  _$jscoverage['/selector.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['199'][1].init(92, 12, 'child === el');
function visit80_199_1(result) {
  _$jscoverage['/selector.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['197'][1].init(72, 23, 'child.tagName == elType');
function visit79_197_1(result) {
  _$jscoverage['/selector.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['195'][1].init(245, 11, 'count < len');
function visit78_195_1(result) {
  _$jscoverage['/selector.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['188'][1].init(247, 6, 'parent');
function visit77_188_1(result) {
  _$jscoverage['/selector.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['183'][3].init(114, 6, 'b == 0');
function visit76_183_3(result) {
  _$jscoverage['/selector.js'].branchData['183'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['183'][2].init(104, 6, 'a == 0');
function visit75_183_2(result) {
  _$jscoverage['/selector.js'].branchData['183'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['183'][1].init(104, 16, 'a == 0 && b == 0');
function visit74_183_1(result) {
  _$jscoverage['/selector.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['171'][1].init(135, 17, 'ret !== undefined');
function visit73_171_1(result) {
  _$jscoverage['/selector.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['170'][1].init(92, 12, 'child === el');
function visit72_170_1(result) {
  _$jscoverage['/selector.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['168'][1].init(72, 19, 'child.nodeType == 1');
function visit71_168_1(result) {
  _$jscoverage['/selector.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['166'][1].init(210, 10, 'count >= 0');
function visit70_166_1(result) {
  _$jscoverage['/selector.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['160'][1].init(247, 6, 'parent');
function visit69_160_1(result) {
  _$jscoverage['/selector.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['155'][3].init(114, 6, 'b == 0');
function visit68_155_3(result) {
  _$jscoverage['/selector.js'].branchData['155'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['155'][2].init(104, 6, 'a == 0');
function visit67_155_2(result) {
  _$jscoverage['/selector.js'].branchData['155'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['155'][1].init(104, 16, 'a == 0 && b == 0');
function visit66_155_1(result) {
  _$jscoverage['/selector.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['143'][1].init(135, 17, 'ret !== undefined');
function visit65_143_1(result) {
  _$jscoverage['/selector.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['142'][1].init(92, 12, 'child === el');
function visit64_142_1(result) {
  _$jscoverage['/selector.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['140'][1].init(72, 19, 'child.nodeType == 1');
function visit63_140_1(result) {
  _$jscoverage['/selector.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['138'][1].init(204, 11, 'count < len');
function visit62_138_1(result) {
  _$jscoverage['/selector.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['132'][1].init(247, 6, 'parent');
function visit61_132_1(result) {
  _$jscoverage['/selector.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['127'][3].init(114, 6, 'b == 0');
function visit60_127_3(result) {
  _$jscoverage['/selector.js'].branchData['127'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['127'][2].init(104, 6, 'a == 0');
function visit59_127_2(result) {
  _$jscoverage['/selector.js'].branchData['127'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['127'][1].init(104, 16, 'a == 0 && b == 0');
function visit58_127_1(result) {
  _$jscoverage['/selector.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['119'][1].init(118, 49, 'documentElement.nodeName.toLowerCase() !== "html"');
function visit57_119_1(result) {
  _$jscoverage['/selector.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['118'][2].init(40, 26, 'elem.ownerDocument || elem');
function visit56_118_2(result) {
  _$jscoverage['/selector.js'].branchData['118'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['118'][1].init(31, 52, 'elem && (elem.ownerDocument || elem).documentElement');
function visit55_118_1(result) {
  _$jscoverage['/selector.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['110'][4].init(42, 19, '(index - b) % a == 0');
function visit54_110_4(result) {
  _$jscoverage['/selector.js'].branchData['110'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['110'][3].init(42, 25, '(index - b) % a == 0 && eq');
function visit53_110_3(result) {
  _$jscoverage['/selector.js'].branchData['110'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['110'][2].init(18, 19, '(index - b) / a >= 0');
function visit52_110_2(result) {
  _$jscoverage['/selector.js'].branchData['110'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['110'][1].init(18, 49, '(index - b) / a >= 0 && (index - b) % a == 0 && eq');
function visit51_110_1(result) {
  _$jscoverage['/selector.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['106'][1].init(17, 10, 'index == b');
function visit50_106_1(result) {
  _$jscoverage['/selector.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['105'][1].init(13, 6, 'a == 0');
function visit49_105_1(result) {
  _$jscoverage['/selector.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['96'][1].init(350, 23, 'parseInt(match[3]) || 0');
function visit48_96_1(result) {
  _$jscoverage['/selector.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['87'][1].init(25, 15, 'match[2] == \'-\'');
function visit47_87_1(result) {
  _$jscoverage['/selector.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['86'][1].init(61, 8, 'isNaN(a)');
function visit46_86_1(result) {
  _$jscoverage['/selector.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['84'][1].init(17, 8, 'match[1]');
function visit45_84_1(result) {
  _$jscoverage['/selector.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['83'][1].init(302, 47, 'match = param.replace(/\\s/g, \'\').match(aNPlusB)');
function visit44_83_1(result) {
  _$jscoverage['/selector.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['80'][1].init(225, 15, 'param == \'even\'');
function visit43_80_1(result) {
  _$jscoverage['/selector.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['77'][1].init(149, 14, 'param == \'odd\'');
function visit42_77_1(result) {
  _$jscoverage['/selector.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['74'][1].init(70, 24, 'typeof param == \'number\'');
function visit41_74_1(result) {
  _$jscoverage['/selector.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['66'][2].init(64, 16, 'el.nodeType != 1');
function visit40_66_2(result) {
  _$jscoverage['/selector.js'].branchData['66'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['66'][1].init(47, 22, 'el && el.nodeType != 1');
function visit39_66_1(result) {
  _$jscoverage['/selector.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['42'][1].init(88, 8, 'high < 0');
function visit38_42_1(result) {
  _$jscoverage['/selector.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['24'][1].init(17, 12, 'isContextXML');
function visit37_24_1(result) {
  _$jscoverage['/selector.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/selector.js'].functionData[0]++;
  _$jscoverage['/selector.js'].lineData[7]++;
  var Dom = require('dom/basic');
  _$jscoverage['/selector.js'].lineData[8]++;
  var parser = require('./selector/parser');
  _$jscoverage['/selector.js'].lineData[10]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/selector.js'].lineData[12]++;
  logger.info('use KISSY css3 selector');
  _$jscoverage['/selector.js'].lineData[16]++;
  var document = S.Env.host.document, undefined = undefined, EXPANDO_SELECTOR_KEY = '_ks_data_selector_id_', caches = {}, isContextXML, uuid = 0, subMatchesCache = {}, getAttr = function(el, name) {
  _$jscoverage['/selector.js'].functionData[1]++;
  _$jscoverage['/selector.js'].lineData[24]++;
  if (visit37_24_1(isContextXML)) {
    _$jscoverage['/selector.js'].lineData[25]++;
    return Dom._getSimpleAttr(el, name);
  } else {
    _$jscoverage['/selector.js'].lineData[27]++;
    return Dom.attr(el, name);
  }
}, hasSingleClass = Dom._hasSingleClass, isTag = Dom._isTag, aNPlusB = /^(([+-]?(?:\d+)?)?n)?([+-]?\d+)?$/;
  _$jscoverage['/selector.js'].lineData[35]++;
  var unescape = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g, unescapeFn = function(_, escaped) {
  _$jscoverage['/selector.js'].functionData[2]++;
  _$jscoverage['/selector.js'].lineData[37]++;
  var high = "0x" + escaped - 0x10000;
  _$jscoverage['/selector.js'].lineData[39]++;
  return isNaN(high) ? escaped : visit38_42_1(high < 0) ? String.fromCharCode(high + 0x10000) : String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
};
  _$jscoverage['/selector.js'].lineData[48]++;
  function unEscape(str) {
    _$jscoverage['/selector.js'].functionData[3]++;
    _$jscoverage['/selector.js'].lineData[49]++;
    return str.replace(unescape, unescapeFn);
  }
  _$jscoverage['/selector.js'].lineData[52]++;
  parser.lexer.yy = {
  unEscape: unEscape, 
  unEscapeStr: function(str) {
  _$jscoverage['/selector.js'].functionData[4]++;
  _$jscoverage['/selector.js'].lineData[55]++;
  return this.unEscape(str.slice(1, -1));
}};
  _$jscoverage['/selector.js'].lineData[59]++;
  function resetStatus() {
    _$jscoverage['/selector.js'].functionData[5]++;
    _$jscoverage['/selector.js'].lineData[60]++;
    subMatchesCache = {};
  }
  _$jscoverage['/selector.js'].lineData[63]++;
  function dir(el, dir) {
    _$jscoverage['/selector.js'].functionData[6]++;
    _$jscoverage['/selector.js'].lineData[64]++;
    do {
      _$jscoverage['/selector.js'].lineData[65]++;
      el = el[dir];
    } while (visit39_66_1(el && visit40_66_2(el.nodeType != 1)));
    _$jscoverage['/selector.js'].lineData[67]++;
    return el;
  }
  _$jscoverage['/selector.js'].lineData[70]++;
  function getAb(param) {
    _$jscoverage['/selector.js'].functionData[7]++;
    _$jscoverage['/selector.js'].lineData[71]++;
    var a = 0, match, b = 0;
    _$jscoverage['/selector.js'].lineData[74]++;
    if (visit41_74_1(typeof param == 'number')) {
      _$jscoverage['/selector.js'].lineData[75]++;
      b = param;
    } else {
      _$jscoverage['/selector.js'].lineData[77]++;
      if (visit42_77_1(param == 'odd')) {
        _$jscoverage['/selector.js'].lineData[78]++;
        a = 2;
        _$jscoverage['/selector.js'].lineData[79]++;
        b = 1;
      } else {
        _$jscoverage['/selector.js'].lineData[80]++;
        if (visit43_80_1(param == 'even')) {
          _$jscoverage['/selector.js'].lineData[81]++;
          a = 2;
          _$jscoverage['/selector.js'].lineData[82]++;
          b = 0;
        } else {
          _$jscoverage['/selector.js'].lineData[83]++;
          if (visit44_83_1(match = param.replace(/\s/g, '').match(aNPlusB))) {
            _$jscoverage['/selector.js'].lineData[84]++;
            if (visit45_84_1(match[1])) {
              _$jscoverage['/selector.js'].lineData[85]++;
              a = parseInt(match[2]);
              _$jscoverage['/selector.js'].lineData[86]++;
              if (visit46_86_1(isNaN(a))) {
                _$jscoverage['/selector.js'].lineData[87]++;
                if (visit47_87_1(match[2] == '-')) {
                  _$jscoverage['/selector.js'].lineData[88]++;
                  a = -1;
                } else {
                  _$jscoverage['/selector.js'].lineData[90]++;
                  a = 1;
                }
              }
            } else {
              _$jscoverage['/selector.js'].lineData[94]++;
              a = 0;
            }
            _$jscoverage['/selector.js'].lineData[96]++;
            b = visit48_96_1(parseInt(match[3]) || 0);
          }
        }
      }
    }
    _$jscoverage['/selector.js'].lineData[98]++;
    return {
  a: a, 
  b: b};
  }
  _$jscoverage['/selector.js'].lineData[104]++;
  function matchIndexByAb(index, a, b, eq) {
    _$jscoverage['/selector.js'].functionData[8]++;
    _$jscoverage['/selector.js'].lineData[105]++;
    if (visit49_105_1(a == 0)) {
      _$jscoverage['/selector.js'].lineData[106]++;
      if (visit50_106_1(index == b)) {
        _$jscoverage['/selector.js'].lineData[107]++;
        return eq;
      }
    } else {
      _$jscoverage['/selector.js'].lineData[110]++;
      if (visit51_110_1(visit52_110_2((index - b) / a >= 0) && visit53_110_3(visit54_110_4((index - b) % a == 0) && eq))) {
        _$jscoverage['/selector.js'].lineData[111]++;
        return 1;
      }
    }
    _$jscoverage['/selector.js'].lineData[114]++;
    return undefined;
  }
  _$jscoverage['/selector.js'].lineData[117]++;
  function isXML(elem) {
    _$jscoverage['/selector.js'].functionData[9]++;
    _$jscoverage['/selector.js'].lineData[118]++;
    var documentElement = visit55_118_1(elem && (visit56_118_2(elem.ownerDocument || elem)).documentElement);
    _$jscoverage['/selector.js'].lineData[119]++;
    return documentElement ? visit57_119_1(documentElement.nodeName.toLowerCase() !== "html") : false;
  }
  _$jscoverage['/selector.js'].lineData[122]++;
  var pseudoFnExpr = {
  'nth-child': function(el, param) {
  _$jscoverage['/selector.js'].functionData[10]++;
  _$jscoverage['/selector.js'].lineData[124]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[127]++;
  if (visit58_127_1(visit59_127_2(a == 0) && visit60_127_3(b == 0))) {
    _$jscoverage['/selector.js'].lineData[128]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[130]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[132]++;
  if (visit61_132_1(parent)) {
    _$jscoverage['/selector.js'].lineData[133]++;
    var childNodes = parent.childNodes, count = 0, child, ret, len = childNodes.length;
    _$jscoverage['/selector.js'].lineData[138]++;
    for (; visit62_138_1(count < len); count++) {
      _$jscoverage['/selector.js'].lineData[139]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[140]++;
      if (visit63_140_1(child.nodeType == 1)) {
        _$jscoverage['/selector.js'].lineData[141]++;
        index++;
        _$jscoverage['/selector.js'].lineData[142]++;
        ret = matchIndexByAb(index, a, b, visit64_142_1(child === el));
        _$jscoverage['/selector.js'].lineData[143]++;
        if (visit65_143_1(ret !== undefined)) {
          _$jscoverage['/selector.js'].lineData[144]++;
          return ret;
        }
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[149]++;
  return 0;
}, 
  'nth-last-child': function(el, param) {
  _$jscoverage['/selector.js'].functionData[11]++;
  _$jscoverage['/selector.js'].lineData[152]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[155]++;
  if (visit66_155_1(visit67_155_2(a == 0) && visit68_155_3(b == 0))) {
    _$jscoverage['/selector.js'].lineData[156]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[158]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[160]++;
  if (visit69_160_1(parent)) {
    _$jscoverage['/selector.js'].lineData[161]++;
    var childNodes = parent.childNodes, len = childNodes.length, count = len - 1, child, ret;
    _$jscoverage['/selector.js'].lineData[166]++;
    for (; visit70_166_1(count >= 0); count--) {
      _$jscoverage['/selector.js'].lineData[167]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[168]++;
      if (visit71_168_1(child.nodeType == 1)) {
        _$jscoverage['/selector.js'].lineData[169]++;
        index++;
        _$jscoverage['/selector.js'].lineData[170]++;
        ret = matchIndexByAb(index, a, b, visit72_170_1(child === el));
        _$jscoverage['/selector.js'].lineData[171]++;
        if (visit73_171_1(ret !== undefined)) {
          _$jscoverage['/selector.js'].lineData[172]++;
          return ret;
        }
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[177]++;
  return 0;
}, 
  'nth-of-type': function(el, param) {
  _$jscoverage['/selector.js'].functionData[12]++;
  _$jscoverage['/selector.js'].lineData[180]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[183]++;
  if (visit74_183_1(visit75_183_2(a == 0) && visit76_183_3(b == 0))) {
    _$jscoverage['/selector.js'].lineData[184]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[186]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[188]++;
  if (visit77_188_1(parent)) {
    _$jscoverage['/selector.js'].lineData[189]++;
    var childNodes = parent.childNodes, elType = el.tagName, count = 0, child, ret, len = childNodes.length;
    _$jscoverage['/selector.js'].lineData[195]++;
    for (; visit78_195_1(count < len); count++) {
      _$jscoverage['/selector.js'].lineData[196]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[197]++;
      if (visit79_197_1(child.tagName == elType)) {
        _$jscoverage['/selector.js'].lineData[198]++;
        index++;
        _$jscoverage['/selector.js'].lineData[199]++;
        ret = matchIndexByAb(index, a, b, visit80_199_1(child === el));
        _$jscoverage['/selector.js'].lineData[200]++;
        if (visit81_200_1(ret !== undefined)) {
          _$jscoverage['/selector.js'].lineData[201]++;
          return ret;
        }
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[206]++;
  return 0;
}, 
  'nth-last-of-type': function(el, param) {
  _$jscoverage['/selector.js'].functionData[13]++;
  _$jscoverage['/selector.js'].lineData[209]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[212]++;
  if (visit82_212_1(visit83_212_2(a == 0) && visit84_212_3(b == 0))) {
    _$jscoverage['/selector.js'].lineData[213]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[215]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[217]++;
  if (visit85_217_1(parent)) {
    _$jscoverage['/selector.js'].lineData[218]++;
    var childNodes = parent.childNodes, len = childNodes.length, elType = el.tagName, count = len - 1, child, ret;
    _$jscoverage['/selector.js'].lineData[224]++;
    for (; visit86_224_1(count >= 0); count--) {
      _$jscoverage['/selector.js'].lineData[225]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[226]++;
      if (visit87_226_1(child.tagName == elType)) {
        _$jscoverage['/selector.js'].lineData[227]++;
        index++;
        _$jscoverage['/selector.js'].lineData[228]++;
        ret = matchIndexByAb(index, a, b, visit88_228_1(child === el));
        _$jscoverage['/selector.js'].lineData[229]++;
        if (visit89_229_1(ret !== undefined)) {
          _$jscoverage['/selector.js'].lineData[230]++;
          return ret;
        }
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[235]++;
  return 0;
}, 
  'lang': function(el, lang) {
  _$jscoverage['/selector.js'].functionData[14]++;
  _$jscoverage['/selector.js'].lineData[238]++;
  var elLang;
  _$jscoverage['/selector.js'].lineData[239]++;
  lang = unEscape(lang.toLowerCase());
  _$jscoverage['/selector.js'].lineData[240]++;
  do {
    _$jscoverage['/selector.js'].lineData[241]++;
    if (visit90_241_1(elLang = (isContextXML ? visit91_242_1(el.getAttribute("xml:lang") || el.getAttribute("lang")) : el.lang))) {
      _$jscoverage['/selector.js'].lineData[244]++;
      elLang = elLang.toLowerCase();
      _$jscoverage['/selector.js'].lineData[245]++;
      return visit92_245_1(visit93_245_2(elLang === lang) || visit94_245_3(elLang.indexOf(lang + "-") === 0));
    }
  } while (visit95_247_1((el = el.parentNode) && visit96_247_2(el.nodeType === 1)));
  _$jscoverage['/selector.js'].lineData[248]++;
  return false;
}, 
  'not': function(el, negation_arg) {
  _$jscoverage['/selector.js'].functionData[15]++;
  _$jscoverage['/selector.js'].lineData[251]++;
  return !matchExpr[negation_arg.t](el, negation_arg.value);
}};
  _$jscoverage['/selector.js'].lineData[255]++;
  var pseudoIdentExpr = {
  'empty': function(el) {
  _$jscoverage['/selector.js'].functionData[16]++;
  _$jscoverage['/selector.js'].lineData[257]++;
  var childNodes = el.childNodes, index = 0, len = childNodes.length - 1, child, nodeType;
  _$jscoverage['/selector.js'].lineData[262]++;
  for (; visit97_262_1(index < len); index++) {
    _$jscoverage['/selector.js'].lineData[263]++;
    child = childNodes[index];
    _$jscoverage['/selector.js'].lineData[264]++;
    nodeType = child.nodeType;
    _$jscoverage['/selector.js'].lineData[268]++;
    if (visit98_268_1(visit99_268_2(nodeType == 1) || visit100_268_3(visit101_268_4(nodeType == 3) || visit102_268_5(visit103_268_6(nodeType == 4) || visit104_268_7(nodeType == 5))))) {
      _$jscoverage['/selector.js'].lineData[269]++;
      return 0;
    }
  }
  _$jscoverage['/selector.js'].lineData[272]++;
  return 1;
}, 
  'root': function(el) {
  _$jscoverage['/selector.js'].functionData[17]++;
  _$jscoverage['/selector.js'].lineData[275]++;
  return visit105_275_1(el.ownerDocument && visit106_276_1(el === el.ownerDocument.documentElement));
}, 
  'first-child': function(el) {
  _$jscoverage['/selector.js'].functionData[18]++;
  _$jscoverage['/selector.js'].lineData[279]++;
  return pseudoFnExpr['nth-child'](el, 1);
}, 
  'last-child': function(el) {
  _$jscoverage['/selector.js'].functionData[19]++;
  _$jscoverage['/selector.js'].lineData[282]++;
  return pseudoFnExpr['nth-last-child'](el, 1);
}, 
  'first-of-type': function(el) {
  _$jscoverage['/selector.js'].functionData[20]++;
  _$jscoverage['/selector.js'].lineData[285]++;
  return pseudoFnExpr['nth-of-type'](el, 1);
}, 
  'last-of-type': function(el) {
  _$jscoverage['/selector.js'].functionData[21]++;
  _$jscoverage['/selector.js'].lineData[288]++;
  return pseudoFnExpr['nth-last-of-type'](el, 1);
}, 
  'only-child': function(el) {
  _$jscoverage['/selector.js'].functionData[22]++;
  _$jscoverage['/selector.js'].lineData[291]++;
  return visit107_291_1(pseudoIdentExpr['first-child'](el) && pseudoIdentExpr['last-child'](el));
}, 
  'only-of-type': function(el) {
  _$jscoverage['/selector.js'].functionData[23]++;
  _$jscoverage['/selector.js'].lineData[295]++;
  return visit108_295_1(pseudoIdentExpr['first-of-type'](el) && pseudoIdentExpr['last-of-type'](el));
}, 
  'focus': function(el) {
  _$jscoverage['/selector.js'].functionData[24]++;
  _$jscoverage['/selector.js'].lineData[299]++;
  var doc = el.ownerDocument;
  _$jscoverage['/selector.js'].lineData[300]++;
  return visit109_300_1(doc && visit110_300_2(visit111_300_3(el === doc.activeElement) && visit112_301_1((visit113_301_2(!doc['hasFocus'] || doc['hasFocus']())) && !!(visit114_301_3(el.type || visit115_301_4(el.href || visit116_301_5(el.tabIndex >= 0)))))));
}, 
  'target': function(el) {
  _$jscoverage['/selector.js'].functionData[25]++;
  _$jscoverage['/selector.js'].lineData[304]++;
  var hash = location.hash;
  _$jscoverage['/selector.js'].lineData[305]++;
  return visit117_305_1(hash && visit118_305_2(hash.slice(1) === getAttr(el, 'id')));
}, 
  'enabled': function(el) {
  _$jscoverage['/selector.js'].functionData[26]++;
  _$jscoverage['/selector.js'].lineData[308]++;
  return !el.disabled;
}, 
  'disabled': function(el) {
  _$jscoverage['/selector.js'].functionData[27]++;
  _$jscoverage['/selector.js'].lineData[311]++;
  return el.disabled;
}, 
  'checked': function(el) {
  _$jscoverage['/selector.js'].functionData[28]++;
  _$jscoverage['/selector.js'].lineData[314]++;
  var nodeName = el.nodeName.toLowerCase();
  _$jscoverage['/selector.js'].lineData[315]++;
  return visit119_315_1((visit120_315_2(visit121_315_3(nodeName === "input") && el.checked)) || (visit122_316_1(visit123_316_2(nodeName === "option") && el.selected)));
}};
  _$jscoverage['/selector.js'].lineData[320]++;
  var attribExpr = {
  '~=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[29]++;
  _$jscoverage['/selector.js'].lineData[322]++;
  if (visit124_322_1(!value || visit125_322_2(value.indexOf(' ') > -1))) {
    _$jscoverage['/selector.js'].lineData[323]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[325]++;
  return visit126_325_1((' ' + elValue + ' ').indexOf(' ' + value + ' ') != -1);
}, 
  '|=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[30]++;
  _$jscoverage['/selector.js'].lineData[328]++;
  return visit127_328_1((' ' + elValue).indexOf(' ' + value + '-') != -1);
}, 
  '^=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[31]++;
  _$jscoverage['/selector.js'].lineData[331]++;
  return visit128_331_1(value && S.startsWith(elValue, value));
}, 
  '$=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[32]++;
  _$jscoverage['/selector.js'].lineData[334]++;
  return visit129_334_1(value && S.endsWith(elValue, value));
}, 
  '*=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[33]++;
  _$jscoverage['/selector.js'].lineData[337]++;
  return visit130_337_1(value && visit131_337_2(elValue.indexOf(value) != -1));
}, 
  '=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[34]++;
  _$jscoverage['/selector.js'].lineData[340]++;
  return visit132_340_1(elValue === value);
}};
  _$jscoverage['/selector.js'].lineData[344]++;
  var matchExpr = {
  'tag': isTag, 
  'cls': hasSingleClass, 
  'id': function(el, value) {
  _$jscoverage['/selector.js'].functionData[35]++;
  _$jscoverage['/selector.js'].lineData[348]++;
  return visit133_348_1(getAttr(el, 'id') === value);
}, 
  'attrib': function(el, value) {
  _$jscoverage['/selector.js'].functionData[36]++;
  _$jscoverage['/selector.js'].lineData[351]++;
  var name = value.ident;
  _$jscoverage['/selector.js'].lineData[352]++;
  if (visit134_352_1(!isContextXML)) {
    _$jscoverage['/selector.js'].lineData[353]++;
    name = name.toLowerCase();
  }
  _$jscoverage['/selector.js'].lineData[355]++;
  var elValue = getAttr(el, name);
  _$jscoverage['/selector.js'].lineData[356]++;
  var match = value.match;
  _$jscoverage['/selector.js'].lineData[357]++;
  if (visit135_357_1(!match && visit136_357_2(elValue !== undefined))) {
    _$jscoverage['/selector.js'].lineData[358]++;
    return 1;
  } else {
    _$jscoverage['/selector.js'].lineData[359]++;
    if (visit137_359_1(match)) {
      _$jscoverage['/selector.js'].lineData[360]++;
      if (visit138_360_1(elValue === undefined)) {
        _$jscoverage['/selector.js'].lineData[361]++;
        return 0;
      }
      _$jscoverage['/selector.js'].lineData[363]++;
      var matchFn = attribExpr[match];
      _$jscoverage['/selector.js'].lineData[364]++;
      if (visit139_364_1(matchFn)) {
        _$jscoverage['/selector.js'].lineData[365]++;
        return matchFn(elValue + '', value.value + '');
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[368]++;
  return 0;
}, 
  'pseudo': function(el, value) {
  _$jscoverage['/selector.js'].functionData[37]++;
  _$jscoverage['/selector.js'].lineData[371]++;
  var fn, fnStr, ident;
  _$jscoverage['/selector.js'].lineData[372]++;
  if (visit140_372_1(fnStr = value.fn)) {
    _$jscoverage['/selector.js'].lineData[373]++;
    if (visit141_373_1(!(fn = pseudoFnExpr[fnStr]))) {
      _$jscoverage['/selector.js'].lineData[374]++;
      throw new SyntaxError('Syntax error: not support pseudo: ' + fnStr);
    }
    _$jscoverage['/selector.js'].lineData[376]++;
    return fn(el, value.param);
  }
  _$jscoverage['/selector.js'].lineData[378]++;
  if (visit142_378_1(ident = value.ident)) {
    _$jscoverage['/selector.js'].lineData[379]++;
    if (visit143_379_1(!pseudoIdentExpr[ident])) {
      _$jscoverage['/selector.js'].lineData[380]++;
      throw new SyntaxError('Syntax error: not support pseudo: ' + ident);
    }
    _$jscoverage['/selector.js'].lineData[382]++;
    return pseudoIdentExpr[ident](el);
  }
  _$jscoverage['/selector.js'].lineData[384]++;
  return 0;
}};
  _$jscoverage['/selector.js'].lineData[388]++;
  var relativeExpr = {
  '>': {
  dir: 'parentNode', 
  immediate: 1}, 
  ' ': {
  dir: 'parentNode'}, 
  '+': {
  dir: 'previousSibling', 
  immediate: 1}, 
  '~': {
  dir: 'previousSibling'}};
  _$jscoverage['/selector.js'].lineData[405]++;
  if (visit144_405_1('sourceIndex' in document.documentElement)) {
    _$jscoverage['/selector.js'].lineData[406]++;
    Dom._compareNodeOrder = function(a, b) {
  _$jscoverage['/selector.js'].functionData[38]++;
  _$jscoverage['/selector.js'].lineData[407]++;
  return a.sourceIndex - b.sourceIndex;
};
  }
  _$jscoverage['/selector.js'].lineData[411]++;
  function matches(str, seeds) {
    _$jscoverage['/selector.js'].functionData[39]++;
    _$jscoverage['/selector.js'].lineData[412]++;
    return Dom._selectInternal(str, null, seeds);
  }
  _$jscoverage['/selector.js'].lineData[415]++;
  Dom._matchesInternal = matches;
  _$jscoverage['/selector.js'].lineData[417]++;
  function singleMatch(el, match) {
    _$jscoverage['/selector.js'].functionData[40]++;
    _$jscoverage['/selector.js'].lineData[418]++;
    if (visit145_418_1(!match)) {
      _$jscoverage['/selector.js'].lineData[419]++;
      return true;
    }
    _$jscoverage['/selector.js'].lineData[421]++;
    if (visit146_421_1(!el)) {
      _$jscoverage['/selector.js'].lineData[422]++;
      return false;
    }
    _$jscoverage['/selector.js'].lineData[425]++;
    if (visit147_425_1(el.nodeType === 9)) {
      _$jscoverage['/selector.js'].lineData[426]++;
      return false;
    }
    _$jscoverage['/selector.js'].lineData[429]++;
    var matched = 1, matchSuffix = match.suffix, matchSuffixLen, matchSuffixIndex;
    _$jscoverage['/selector.js'].lineData[434]++;
    if (visit148_434_1(match.t == 'tag')) {
      _$jscoverage['/selector.js'].lineData[435]++;
      matched &= matchExpr['tag'](el, match.value);
    }
    _$jscoverage['/selector.js'].lineData[438]++;
    if (visit149_438_1(matched && matchSuffix)) {
      _$jscoverage['/selector.js'].lineData[439]++;
      matchSuffixLen = matchSuffix.length;
      _$jscoverage['/selector.js'].lineData[440]++;
      matchSuffixIndex = 0;
      _$jscoverage['/selector.js'].lineData[441]++;
      for (; visit150_441_1(matched && visit151_441_2(matchSuffixIndex < matchSuffixLen)); matchSuffixIndex++) {
        _$jscoverage['/selector.js'].lineData[442]++;
        var singleMatchSuffix = matchSuffix[matchSuffixIndex], singleMatchSuffixType = singleMatchSuffix.t;
        _$jscoverage['/selector.js'].lineData[444]++;
        if (visit152_444_1(matchExpr[singleMatchSuffixType])) {
          _$jscoverage['/selector.js'].lineData[445]++;
          matched &= matchExpr[singleMatchSuffixType](el, singleMatchSuffix.value);
        }
      }
    }
    _$jscoverage['/selector.js'].lineData[450]++;
    return matched;
  }
  _$jscoverage['/selector.js'].lineData[454]++;
  function matchImmediate(el, match) {
    _$jscoverage['/selector.js'].functionData[41]++;
    _$jscoverage['/selector.js'].lineData[455]++;
    var matched = 1, startEl = el, relativeOp, startMatch = match;
    _$jscoverage['/selector.js'].lineData[460]++;
    do {
      _$jscoverage['/selector.js'].lineData[461]++;
      matched &= singleMatch(el, match);
      _$jscoverage['/selector.js'].lineData[462]++;
      if (visit153_462_1(matched)) {
        _$jscoverage['/selector.js'].lineData[464]++;
        match = visit154_464_1(match && match.prev);
        _$jscoverage['/selector.js'].lineData[465]++;
        if (visit155_465_1(!match)) {
          _$jscoverage['/selector.js'].lineData[466]++;
          return true;
        }
        _$jscoverage['/selector.js'].lineData[468]++;
        relativeOp = relativeExpr[match.nextCombinator];
        _$jscoverage['/selector.js'].lineData[469]++;
        el = dir(el, relativeOp.dir);
        _$jscoverage['/selector.js'].lineData[470]++;
        if (visit156_470_1(!relativeOp.immediate)) {
          _$jscoverage['/selector.js'].lineData[471]++;
          return {
  el: el, 
  match: match};
        }
      } else {
        _$jscoverage['/selector.js'].lineData[478]++;
        relativeOp = relativeExpr[match.nextCombinator];
        _$jscoverage['/selector.js'].lineData[479]++;
        if (visit157_479_1(relativeOp.immediate)) {
          _$jscoverage['/selector.js'].lineData[481]++;
          return {
  el: dir(startEl, relativeExpr[startMatch.nextCombinator].dir), 
  match: startMatch};
        } else {
          _$jscoverage['/selector.js'].lineData[487]++;
          return {
  el: visit158_488_1(el && dir(el, relativeOp.dir)), 
  match: match};
        }
      }
    } while (el);
    _$jscoverage['/selector.js'].lineData[496]++;
    return {
  el: dir(startEl, relativeExpr[startMatch.nextCombinator].dir), 
  match: startMatch};
  }
  _$jscoverage['/selector.js'].lineData[503]++;
  function findFixedMatchFromHead(el, head) {
    _$jscoverage['/selector.js'].functionData[42]++;
    _$jscoverage['/selector.js'].lineData[504]++;
    var relativeOp, cur = head;
    _$jscoverage['/selector.js'].lineData[507]++;
    do {
      _$jscoverage['/selector.js'].lineData[508]++;
      if (visit159_508_1(!singleMatch(el, cur))) {
        _$jscoverage['/selector.js'].lineData[509]++;
        return null;
      }
      _$jscoverage['/selector.js'].lineData[511]++;
      cur = cur.prev;
      _$jscoverage['/selector.js'].lineData[512]++;
      if (visit160_512_1(!cur)) {
        _$jscoverage['/selector.js'].lineData[513]++;
        return true;
      }
      _$jscoverage['/selector.js'].lineData[515]++;
      relativeOp = relativeExpr[cur.nextCombinator];
      _$jscoverage['/selector.js'].lineData[516]++;
      el = dir(el, relativeOp.dir);
    } while (visit161_517_1(el && relativeOp.immediate));
    _$jscoverage['/selector.js'].lineData[518]++;
    if (visit162_518_1(!el)) {
      _$jscoverage['/selector.js'].lineData[519]++;
      return null;
    }
    _$jscoverage['/selector.js'].lineData[521]++;
    return {
  el: el, 
  match: cur};
  }
  _$jscoverage['/selector.js'].lineData[527]++;
  function genId(el) {
    _$jscoverage['/selector.js'].functionData[43]++;
    _$jscoverage['/selector.js'].lineData[528]++;
    var selectorId;
    _$jscoverage['/selector.js'].lineData[530]++;
    if (visit163_530_1(isContextXML)) {
      _$jscoverage['/selector.js'].lineData[531]++;
      if (visit164_531_1(!(selectorId = el.getAttribute(EXPANDO_SELECTOR_KEY)))) {
        _$jscoverage['/selector.js'].lineData[532]++;
        el.setAttribute(EXPANDO_SELECTOR_KEY, selectorId = (+new Date() + '_' + (++uuid)));
      }
    } else {
      _$jscoverage['/selector.js'].lineData[535]++;
      if (visit165_535_1(!(selectorId = el[EXPANDO_SELECTOR_KEY]))) {
        _$jscoverage['/selector.js'].lineData[536]++;
        selectorId = el[EXPANDO_SELECTOR_KEY] = (+new Date()) + '_' + (++uuid);
      }
    }
    _$jscoverage['/selector.js'].lineData[540]++;
    return selectorId;
  }
  _$jscoverage['/selector.js'].lineData[543]++;
  function matchSub(el, match) {
    _$jscoverage['/selector.js'].functionData[44]++;
    _$jscoverage['/selector.js'].lineData[544]++;
    var selectorId = genId(el), matchKey;
    _$jscoverage['/selector.js'].lineData[546]++;
    matchKey = selectorId + '_' + (visit166_546_1(match.order || 0));
    _$jscoverage['/selector.js'].lineData[547]++;
    if (visit167_547_1(matchKey in subMatchesCache)) {
      _$jscoverage['/selector.js'].lineData[548]++;
      return subMatchesCache[matchKey];
    }
    _$jscoverage['/selector.js'].lineData[550]++;
    return subMatchesCache[matchKey] = matchSubInternal(el, match);
  }
  _$jscoverage['/selector.js'].lineData[555]++;
  function matchSubInternal(el, match) {
    _$jscoverage['/selector.js'].functionData[45]++;
    _$jscoverage['/selector.js'].lineData[556]++;
    var matchImmediateRet = matchImmediate(el, match);
    _$jscoverage['/selector.js'].lineData[557]++;
    if (visit168_557_1(matchImmediateRet === true)) {
      _$jscoverage['/selector.js'].lineData[558]++;
      return true;
    } else {
      _$jscoverage['/selector.js'].lineData[560]++;
      el = matchImmediateRet.el;
      _$jscoverage['/selector.js'].lineData[561]++;
      match = matchImmediateRet.match;
      _$jscoverage['/selector.js'].lineData[562]++;
      while (el) {
        _$jscoverage['/selector.js'].lineData[563]++;
        if (visit169_563_1(matchSub(el, match))) {
          _$jscoverage['/selector.js'].lineData[564]++;
          return true;
        }
        _$jscoverage['/selector.js'].lineData[566]++;
        el = dir(el, relativeExpr[match.nextCombinator].dir);
      }
      _$jscoverage['/selector.js'].lineData[568]++;
      return false;
    }
  }
  _$jscoverage['/selector.js'].lineData[572]++;
  function select(str, context, seeds) {
    _$jscoverage['/selector.js'].functionData[46]++;
    _$jscoverage['/selector.js'].lineData[573]++;
    if (visit170_573_1(!caches[str])) {
      _$jscoverage['/selector.js'].lineData[574]++;
      caches[str] = parser.parse(str);
    }
    _$jscoverage['/selector.js'].lineData[577]++;
    var selector = caches[str], groupIndex = 0, groupLen = selector.length, contextDocument, group, ret = [];
    _$jscoverage['/selector.js'].lineData[584]++;
    if (visit171_584_1(seeds)) {
      _$jscoverage['/selector.js'].lineData[585]++;
      context = visit172_585_1(context || seeds[0].ownerDocument);
    }
    _$jscoverage['/selector.js'].lineData[588]++;
    contextDocument = visit173_588_1(visit174_588_2(context && context.ownerDocument) || document);
    _$jscoverage['/selector.js'].lineData[590]++;
    context = visit175_590_1(context || contextDocument);
    _$jscoverage['/selector.js'].lineData[592]++;
    isContextXML = isXML(context);
    _$jscoverage['/selector.js'].lineData[594]++;
    for (; visit176_594_1(groupIndex < groupLen); groupIndex++) {
      _$jscoverage['/selector.js'].lineData[595]++;
      resetStatus();
      _$jscoverage['/selector.js'].lineData[597]++;
      group = selector[groupIndex];
      _$jscoverage['/selector.js'].lineData[599]++;
      var suffix = group.suffix, suffixIndex, suffixLen, seedsIndex, mySeeds = seeds, seedsLen, id = null;
      _$jscoverage['/selector.js'].lineData[607]++;
      if (visit177_607_1(!mySeeds)) {
        _$jscoverage['/selector.js'].lineData[608]++;
        if (visit178_608_1(suffix && !isContextXML)) {
          _$jscoverage['/selector.js'].lineData[609]++;
          suffixIndex = 0;
          _$jscoverage['/selector.js'].lineData[610]++;
          suffixLen = suffix.length;
          _$jscoverage['/selector.js'].lineData[611]++;
          for (; visit179_611_1(suffixIndex < suffixLen); suffixIndex++) {
            _$jscoverage['/selector.js'].lineData[612]++;
            var singleSuffix = suffix[suffixIndex];
            _$jscoverage['/selector.js'].lineData[613]++;
            if (visit180_613_1(singleSuffix.t == 'id')) {
              _$jscoverage['/selector.js'].lineData[614]++;
              id = singleSuffix.value;
              _$jscoverage['/selector.js'].lineData[615]++;
              break;
            }
          }
        }
        _$jscoverage['/selector.js'].lineData[620]++;
        if (visit181_620_1(id)) {
          _$jscoverage['/selector.js'].lineData[622]++;
          var doesNotHasById = !context.getElementById, contextInDom = Dom._contains(contextDocument, context), tmp = doesNotHasById ? (contextInDom ? contextDocument.getElementById(id) : null) : context.getElementById(id);
          _$jscoverage['/selector.js'].lineData[631]++;
          if (visit182_631_1(visit183_631_2(!tmp && doesNotHasById) || visit184_631_3(tmp && visit185_631_4(getAttr(tmp, 'id') != id)))) {
            _$jscoverage['/selector.js'].lineData[632]++;
            var tmps = Dom._getElementsByTagName('*', context), tmpLen = tmps.length, tmpI = 0;
            _$jscoverage['/selector.js'].lineData[635]++;
            for (; visit186_635_1(tmpI < tmpLen); tmpI++) {
              _$jscoverage['/selector.js'].lineData[636]++;
              tmp = tmps[tmpI];
              _$jscoverage['/selector.js'].lineData[637]++;
              if (visit187_637_1(getAttr(tmp, 'id') == id)) {
                _$jscoverage['/selector.js'].lineData[638]++;
                mySeeds = [tmp];
                _$jscoverage['/selector.js'].lineData[639]++;
                break;
              }
            }
            _$jscoverage['/selector.js'].lineData[642]++;
            if (visit188_642_1(tmpI === tmpLen)) {
              _$jscoverage['/selector.js'].lineData[643]++;
              mySeeds = [];
            }
          } else {
            _$jscoverage['/selector.js'].lineData[646]++;
            if (visit189_646_1(contextInDom && visit190_646_2(tmp && visit191_646_3(context !== contextDocument)))) {
              _$jscoverage['/selector.js'].lineData[647]++;
              tmp = Dom._contains(context, tmp) ? tmp : null;
            }
            _$jscoverage['/selector.js'].lineData[649]++;
            mySeeds = tmp ? [tmp] : [];
          }
        } else {
          _$jscoverage['/selector.js'].lineData[652]++;
          mySeeds = Dom._getElementsByTagName(visit192_652_1(group.value || '*'), context);
        }
      }
      _$jscoverage['/selector.js'].lineData[656]++;
      seedsIndex = 0;
      _$jscoverage['/selector.js'].lineData[657]++;
      seedsLen = mySeeds.length;
      _$jscoverage['/selector.js'].lineData[659]++;
      if (visit193_659_1(!seedsLen)) {
        _$jscoverage['/selector.js'].lineData[660]++;
        continue;
      }
      _$jscoverage['/selector.js'].lineData[663]++;
      for (; visit194_663_1(seedsIndex < seedsLen); seedsIndex++) {
        _$jscoverage['/selector.js'].lineData[664]++;
        var seed = mySeeds[seedsIndex];
        _$jscoverage['/selector.js'].lineData[665]++;
        var matchHead = findFixedMatchFromHead(seed, group);
        _$jscoverage['/selector.js'].lineData[666]++;
        if (visit195_666_1(matchHead === true)) {
          _$jscoverage['/selector.js'].lineData[667]++;
          ret.push(seed);
        } else {
          _$jscoverage['/selector.js'].lineData[668]++;
          if (visit196_668_1(matchHead)) {
            _$jscoverage['/selector.js'].lineData[669]++;
            if (visit197_669_1(matchSub(matchHead.el, matchHead.match))) {
              _$jscoverage['/selector.js'].lineData[670]++;
              ret.push(seed);
            }
          }
        }
      }
    }
    _$jscoverage['/selector.js'].lineData[676]++;
    if (visit198_676_1(groupLen > 1)) {
      _$jscoverage['/selector.js'].lineData[677]++;
      ret = Dom.unique(ret);
    }
    _$jscoverage['/selector.js'].lineData[680]++;
    return ret;
  }
  _$jscoverage['/selector.js'].lineData[683]++;
  Dom._selectInternal = select;
  _$jscoverage['/selector.js'].lineData[685]++;
  return {
  parse: function(str) {
  _$jscoverage['/selector.js'].functionData[47]++;
  _$jscoverage['/selector.js'].lineData[687]++;
  return parser.parse(str);
}, 
  select: select, 
  matches: matches};
});
