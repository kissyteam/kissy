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
if (! _$jscoverage['/kison/grammar.js']) {
  _$jscoverage['/kison/grammar.js'] = {};
  _$jscoverage['/kison/grammar.js'].lineData = [];
  _$jscoverage['/kison/grammar.js'].lineData[5] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[6] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[20] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[21] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[22] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[23] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[25] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[28] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[29] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[30] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[31] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[34] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[37] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[38] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[40] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[41] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[43] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[44] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[46] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[47] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[49] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[50] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[51] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[53] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[55] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[56] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[57] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[59] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[63] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[66] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[70] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[75] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[76] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[77] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[78] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[79] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[81] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[84] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[85] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[86] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[87] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[88] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[89] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[90] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[94] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[98] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[99] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[100] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[101] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[102] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[108] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[113] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[114] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[117] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[118] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[123] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[125] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[126] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[127] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[136] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[148] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[149] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[154] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[155] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[156] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[157] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[158] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[159] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[162] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[163] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[169] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[171] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[172] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[173] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[174] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[175] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[176] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[186] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[189] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[190] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[191] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[192] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[195] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[197] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[198] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[201] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[206] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[212] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[213] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[214] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[215] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[217] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[219] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[220] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[222] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[224] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[225] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[228] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[233] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[241] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[242] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[250] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[251] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[252] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[253] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[254] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[258] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[260] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[261] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[262] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[263] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[265] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[266] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[267] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[275] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[280] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[281] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[282] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[284] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[291] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[292] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[293] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[294] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[297] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[298] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[300] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[314] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[315] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[316] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[318] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[319] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[320] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[329] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[333] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[335] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[336] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[339] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[340] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[346] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[347] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[348] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[350] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[351] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[355] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[359] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[360] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[361] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[362] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[365] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[374] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[380] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[382] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[392] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[394] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[397] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[399] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[400] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[401] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[402] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[403] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[405] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[406] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[410] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[411] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[414] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[416] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[418] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[419] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[422] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[424] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[425] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[427] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[428] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[431] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[432] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[440] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[443] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[444] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[445] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[446] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[447] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[449] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[451] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[455] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[457] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[458] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[459] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[462] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[463] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[464] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[465] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[469] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[476] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[490] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[491] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[492] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[494] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[496] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[498] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[499] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[500] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[501] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[502] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[503] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[504] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[505] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[506] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[507] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[508] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[509] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[510] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[512] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[513] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[514] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[515] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[516] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[517] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[519] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[522] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[527] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[528] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[529] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[530] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[531] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[532] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[533] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[534] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[536] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[537] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[538] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[539] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[540] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[541] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[543] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[550] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[551] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[552] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[553] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[554] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[555] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[556] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[557] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[558] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[559] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[560] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[562] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[563] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[564] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[565] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[566] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[567] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[568] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[569] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[570] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[571] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[573] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[575] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[576] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[577] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[578] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[579] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[580] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[582] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[583] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[584] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[585] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[586] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[587] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[588] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[589] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[590] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[591] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[593] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[601] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[608] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[609] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[610] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[611] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[614] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[616] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[618] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[619] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[620] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[621] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[622] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[623] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[624] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[625] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[627] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[628] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[630] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[634] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[636] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[637] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[638] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[642] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[646] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[648] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[653] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[655] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[657] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[658] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[660] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[661] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[663] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[666] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[668] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[670] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[675] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[677] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[679] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[680] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[683] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[684] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[685] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[686] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[687] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[706] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[707] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[709] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[710] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[721] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[722] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[734] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[736] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[738] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[740] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[741] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[744] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[745] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[746] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[750] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[752] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[753] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[754] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[755] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[756] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[759] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[762] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[763] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[766] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[768] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[770] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[773] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[776] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[778] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[781] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[790] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[792] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[793] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[796] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[797] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[800] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[801] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[803] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[806] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[807] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[808] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[811] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[813] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[815] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[817] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[819] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[822] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[827] = 0;
}
if (! _$jscoverage['/kison/grammar.js'].functionData) {
  _$jscoverage['/kison/grammar.js'].functionData = [];
  _$jscoverage['/kison/grammar.js'].functionData[0] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[1] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[2] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[3] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[4] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[5] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[6] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[7] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[8] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[9] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[10] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[11] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[12] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[13] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[14] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[15] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[16] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[17] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[18] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[19] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[20] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[21] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[22] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[23] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[24] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[25] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[26] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[27] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[28] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[29] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[30] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[31] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[32] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[33] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[34] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[35] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[36] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[37] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[38] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[39] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[40] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[41] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[42] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[43] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[44] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[45] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[46] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[47] = 0;
}
if (! _$jscoverage['/kison/grammar.js'].branchData) {
  _$jscoverage['/kison/grammar.js'].branchData = {};
  _$jscoverage['/kison/grammar.js'].branchData['29'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['30'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['50'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['56'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['96'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['100'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['101'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['117'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['126'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['155'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['158'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['162'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['171'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['174'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['189'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['191'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['197'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['212'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['214'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['219'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['224'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['252'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['265'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['298'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['314'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['316'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['339'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['346'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['360'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['361'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['405'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['410'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['418'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['424'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['443'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['443'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['445'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['447'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['447'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['449'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['494'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['501'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['502'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['503'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['504'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['508'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['508'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['522'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['522'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['532'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['532'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['532'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['552'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['552'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['553'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['558'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['558'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['575'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['578'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['578'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['578'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['621'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['621'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['623'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['623'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['627'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['627'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['646'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['646'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['660'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['679'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['679'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['706'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['706'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['740'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['740'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['744'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['744'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['750'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['750'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['752'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['752'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['754'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['754'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['782'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['782'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['783'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['783'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['784'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['784'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['792'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['792'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['796'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['796'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['800'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['800'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['806'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['806'][1] = new BranchData();
}
_$jscoverage['/kison/grammar.js'].branchData['806'][1].init(1078, 3, 'len');
function visit74_806_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['806'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['800'][1].init(903, 17, 'ret !== undefined');
function visit73_800_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['800'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['796'][1].init(779, 13, 'reducedAction');
function visit72_796_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['796'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['792'][1].init(625, 7, 'i < len');
function visit71_792_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['792'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['784'][1].init(260, 31, 'production.rhs || production[1]');
function visit70_784_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['784'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['783'][1].init(186, 34, 'production.action || production[2]');
function visit69_783_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['783'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['782'][1].init(109, 34, 'production.symbol || production[0]');
function visit68_782_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['782'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['754'][1].init(65, 18, 'tableAction[state]');
function visit67_754_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['754'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['752'][1].init(488, 7, '!action');
function visit66_752_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['752'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['750'][1].init(419, 48, 'tableAction[state] && tableAction[state][symbol]');
function visit65_750_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['750'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['744'][1].init(206, 7, '!symbol');
function visit64_744_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['744'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['740'][1].init(122, 7, '!symbol');
function visit63_740_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['740'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['706'][1].init(26, 22, '!(v instanceof Lexer)');
function visit62_706_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['706'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['679'][1].init(953, 18, 'cfg.compressSymbol');
function visit61_679_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['679'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['660'][1].init(129, 6, 'action');
function visit60_660_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['646'][1].init(20, 9, 'cfg || {}');
function visit59_646_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['646'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['627'][1].init(489, 31, 'type == GrammarConst.SHIFT_TYPE');
function visit58_627_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['627'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['623'][1].init(197, 32, 'type == GrammarConst.REDUCE_TYPE');
function visit57_623_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['623'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['621'][1].init(91, 32, 'type == GrammarConst.ACCEPT_TYPE');
function visit56_621_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['621'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['578'][2].init(200, 8, 'val != t');
function visit55_578_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['578'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['578'][1].init(195, 13, 't && val != t');
function visit54_578_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['578'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['575'][1].init(37, 14, 'gotos[i] || {}');
function visit53_575_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['558'][2].init(342, 30, 't.toString() != val.toString()');
function visit52_558_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['558'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['558'][1].init(337, 35, 't && t.toString() != val.toString()');
function visit51_558_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['553'][1].init(38, 15, 'action[i] || {}');
function visit50_553_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['552'][1].init(56, 21, '!nonTerminals[symbol]');
function visit49_552_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['552'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['532'][2].init(333, 30, 't.toString() != val.toString()');
function visit48_532_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['532'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['532'][1].init(328, 35, 't && t.toString() != val.toString()');
function visit47_532_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['522'][1].init(42, 15, 'action[i] || {}');
function visit46_522_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['522'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['508'][2].init(300, 30, 't.toString() != val.toString()');
function visit45_508_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['508'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['508'][1].init(295, 35, 't && t.toString() != val.toString()');
function visit44_508_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['504'][1].init(46, 15, 'action[i] || {}');
function visit43_504_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['503'][1].init(34, 35, 'item.get("lookAhead")[mappedEndTag]');
function visit42_503_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['502'][1].init(30, 42, 'production.get("symbol") == mappedStartTag');
function visit41_502_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['501'][1].init(118, 55, 'item.get("dotPosition") == production.get("rhs").length');
function visit40_501_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['494'][1].init(647, 19, 'i < itemSets.length');
function visit39_494_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['449'][1].init(44, 27, 'k < one.get("items").length');
function visit38_449_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['447'][1].init(66, 21, 'one.equals(two, true)');
function visit37_447_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['447'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['445'][1].init(70, 19, 'j < itemSets.length');
function visit36_445_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['443'][1].init(111, 19, 'i < itemSets.length');
function visit35_443_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['443'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['424'][1].init(678, 10, 'index > -1');
function visit34_424_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['418'][1].init(483, 22, 'itemSetNew.size() == 0');
function visit33_418_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['410'][1].init(232, 23, 'itemSet.__cache[symbol]');
function visit32_410_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['405'][1].init(32, 16, '!itemSet.__cache');
function visit31_405_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['361'][1].init(22, 27, 'itemSets[i].equals(itemSet)');
function visit30_361_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['360'][1].init(79, 19, 'i < itemSets.length');
function visit29_360_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['346'][1].init(293, 15, 'itemIndex != -1');
function visit28_346_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['339'][1].init(210, 15, 'markSymbol == x');
function visit27_339_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['316'][1].init(115, 46, 'cont || (!!findItem.addLookAhead(finalFirsts))');
function visit26_316_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['314'][1].init(629, 15, 'itemIndex != -1');
function visit25_314_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['298'][1].init(30, 29, 'p2.get("symbol") == dotSymbol');
function visit24_298_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['265'][1].init(292, 54, 'setSize(firsts) !== setSize(nonTerminal.get("firsts"))');
function visit23_265_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['252'][1].init(99, 53, 'setSize(firsts) !== setSize(production.get("firsts"))');
function visit22_252_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['224'][1].init(664, 21, '!nonTerminals[symbol]');
function visit21_224_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['219'][1].init(233, 19, '!self.isNullable(t)');
function visit20_219_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['214'][1].init(26, 16, '!nonTerminals[t]');
function visit19_214_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['212'][1].init(196, 23, 'symbol instanceof Array');
function visit18_212_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['197'][1].init(424, 21, '!nonTerminals[symbol]');
function visit17_197_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['191'][1].init(26, 19, '!self.isNullable(t)');
function visit16_191_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['189'][1].init(126, 23, 'symbol instanceof Array');
function visit15_189_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['174'][1].init(34, 26, 'production.get("nullable")');
function visit14_174_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['171'][1].init(28, 37, '!nonTerminals[symbol].get("nullable")');
function visit13_171_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['162'][1].init(298, 7, 'n === i');
function visit12_162_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['158'][1].init(34, 18, 'self.isNullable(t)');
function visit11_158_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['155'][1].init(26, 27, '!production.get("nullable")');
function visit10_155_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['126'][1].init(26, 43, '!terminals[handle] && !nonTerminals[handle]');
function visit9_126_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['117'][1].init(137, 12, '!nonTerminal');
function visit8_117_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['101'][1].init(74, 5, 'token');
function visit7_101_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['100'][1].init(30, 21, 'rule.token || rule[0]');
function visit6_100_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['96'][1].init(85, 20, 'lexer && lexer.rules');
function visit5_96_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['56'][1].init(703, 42, 'action[GrammarConst.TO_INDEX] != undefined');
function visit4_56_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['50'][1].init(445, 50, 'action[GrammarConst.PRODUCTION_INDEX] != undefined');
function visit3_50_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['30'][1].init(18, 20, 'obj.equals(array[i])');
function visit2_30_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['29'][1].init(26, 16, 'i < array.length');
function visit1_29_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].lineData[5]++;
KISSY.add("kison/grammar", function(S, Base, Utils, Item, ItemSet, NonTerminal, Lexer, Production) {
  _$jscoverage['/kison/grammar.js'].functionData[0]++;
  _$jscoverage['/kison/grammar.js'].lineData[6]++;
  var GrammarConst = {
  SHIFT_TYPE: 1, 
  REDUCE_TYPE: 2, 
  ACCEPT_TYPE: 0, 
  TYPE_INDEX: 0, 
  PRODUCTION_INDEX: 1, 
  TO_INDEX: 2}, logger = S.getLogger('s/kison'), serializeObject = Utils.serializeObject, mix = S.mix, END_TAG = Lexer.STATIC.END_TAG, START_TAG = '$START';
  _$jscoverage['/kison/grammar.js'].lineData[20]++;
  function setSize(set3) {
    _$jscoverage['/kison/grammar.js'].functionData[1]++;
    _$jscoverage['/kison/grammar.js'].lineData[21]++;
    var count = 0, i;
    _$jscoverage['/kison/grammar.js'].lineData[22]++;
    for (i in set3) {
      _$jscoverage['/kison/grammar.js'].lineData[23]++;
      count++;
    }
    _$jscoverage['/kison/grammar.js'].lineData[25]++;
    return count;
  }
  _$jscoverage['/kison/grammar.js'].lineData[28]++;
  function indexOf(obj, array) {
    _$jscoverage['/kison/grammar.js'].functionData[2]++;
    _$jscoverage['/kison/grammar.js'].lineData[29]++;
    for (var i = 0; visit1_29_1(i < array.length); i++) {
      _$jscoverage['/kison/grammar.js'].lineData[30]++;
      if (visit2_30_1(obj.equals(array[i]))) {
        _$jscoverage['/kison/grammar.js'].lineData[31]++;
        return i;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[34]++;
    return -1;
  }
  _$jscoverage['/kison/grammar.js'].lineData[37]++;
  function visualizeAction(action, productions, itemSets) {
    _$jscoverage['/kison/grammar.js'].functionData[3]++;
    _$jscoverage['/kison/grammar.js'].lineData[38]++;
    switch (action[GrammarConst.TYPE_INDEX]) {
      case GrammarConst.SHIFT_TYPE:
        _$jscoverage['/kison/grammar.js'].lineData[40]++;
        logger.debug('shift');
        _$jscoverage['/kison/grammar.js'].lineData[41]++;
        break;
      case GrammarConst.REDUCE_TYPE:
        _$jscoverage['/kison/grammar.js'].lineData[43]++;
        logger.debug('reduce');
        _$jscoverage['/kison/grammar.js'].lineData[44]++;
        break;
      case GrammarConst.ACCEPT_TYPE:
        _$jscoverage['/kison/grammar.js'].lineData[46]++;
        logger.debug('accept');
        _$jscoverage['/kison/grammar.js'].lineData[47]++;
        break;
    }
    _$jscoverage['/kison/grammar.js'].lineData[49]++;
    logger.debug('from production:');
    _$jscoverage['/kison/grammar.js'].lineData[50]++;
    if (visit3_50_1(action[GrammarConst.PRODUCTION_INDEX] != undefined)) {
      _$jscoverage['/kison/grammar.js'].lineData[51]++;
      logger.debug(productions[action[GrammarConst.PRODUCTION_INDEX]] + '');
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[53]++;
      logger.debug('undefined');
    }
    _$jscoverage['/kison/grammar.js'].lineData[55]++;
    logger.debug('to itemSet:');
    _$jscoverage['/kison/grammar.js'].lineData[56]++;
    if (visit4_56_1(action[GrammarConst.TO_INDEX] != undefined)) {
      _$jscoverage['/kison/grammar.js'].lineData[57]++;
      logger.debug(itemSets[action[GrammarConst.TO_INDEX]].toString(1));
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[59]++;
      logger.debug('undefined');
    }
  }
  _$jscoverage['/kison/grammar.js'].lineData[63]++;
  return Base.extend({
  build: function() {
  _$jscoverage['/kison/grammar.js'].functionData[4]++;
  _$jscoverage['/kison/grammar.js'].lineData[66]++;
  var self = this, lexer = self.lexer, vs = self.get('productions');
  _$jscoverage['/kison/grammar.js'].lineData[70]++;
  vs.unshift({
  symbol: START_TAG, 
  rhs: [vs[0].symbol]});
  _$jscoverage['/kison/grammar.js'].lineData[75]++;
  S.each(vs, function(v, index) {
  _$jscoverage['/kison/grammar.js'].functionData[5]++;
  _$jscoverage['/kison/grammar.js'].lineData[76]++;
  v.symbol = lexer.mapSymbol(v.symbol);
  _$jscoverage['/kison/grammar.js'].lineData[77]++;
  var rhs = v.rhs;
  _$jscoverage['/kison/grammar.js'].lineData[78]++;
  S.each(rhs, function(r, index) {
  _$jscoverage['/kison/grammar.js'].functionData[6]++;
  _$jscoverage['/kison/grammar.js'].lineData[79]++;
  rhs[index] = lexer.mapSymbol(r);
});
  _$jscoverage['/kison/grammar.js'].lineData[81]++;
  vs[index] = new Production(v);
});
  _$jscoverage['/kison/grammar.js'].lineData[84]++;
  self.buildTerminals();
  _$jscoverage['/kison/grammar.js'].lineData[85]++;
  self.buildNonTerminals();
  _$jscoverage['/kison/grammar.js'].lineData[86]++;
  self.buildNullable();
  _$jscoverage['/kison/grammar.js'].lineData[87]++;
  self.buildFirsts();
  _$jscoverage['/kison/grammar.js'].lineData[88]++;
  self.buildItemSet();
  _$jscoverage['/kison/grammar.js'].lineData[89]++;
  self.buildLalrItemSets();
  _$jscoverage['/kison/grammar.js'].lineData[90]++;
  self.buildTable();
}, 
  buildTerminals: function() {
  _$jscoverage['/kison/grammar.js'].functionData[7]++;
  _$jscoverage['/kison/grammar.js'].lineData[94]++;
  var self = this, lexer = self.get("lexer"), rules = visit5_96_1(lexer && lexer.rules), terminals = self.get("terminals");
  _$jscoverage['/kison/grammar.js'].lineData[98]++;
  terminals[lexer.mapSymbol(END_TAG)] = 1;
  _$jscoverage['/kison/grammar.js'].lineData[99]++;
  S.each(rules, function(rule) {
  _$jscoverage['/kison/grammar.js'].functionData[8]++;
  _$jscoverage['/kison/grammar.js'].lineData[100]++;
  var token = visit6_100_1(rule.token || rule[0]);
  _$jscoverage['/kison/grammar.js'].lineData[101]++;
  if (visit7_101_1(token)) {
    _$jscoverage['/kison/grammar.js'].lineData[102]++;
    terminals[token] = 1;
  }
});
}, 
  buildNonTerminals: function() {
  _$jscoverage['/kison/grammar.js'].functionData[9]++;
  _$jscoverage['/kison/grammar.js'].lineData[108]++;
  var self = this, terminals = self.get("terminals"), nonTerminals = self.get("nonTerminals"), productions = self.get("productions");
  _$jscoverage['/kison/grammar.js'].lineData[113]++;
  S.each(productions, function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[10]++;
  _$jscoverage['/kison/grammar.js'].lineData[114]++;
  var symbol = production.get("symbol"), nonTerminal = nonTerminals[symbol];
  _$jscoverage['/kison/grammar.js'].lineData[117]++;
  if (visit8_117_1(!nonTerminal)) {
    _$jscoverage['/kison/grammar.js'].lineData[118]++;
    nonTerminal = nonTerminals[symbol] = new NonTerminal({
  symbol: symbol});
  }
  _$jscoverage['/kison/grammar.js'].lineData[123]++;
  nonTerminal.get("productions").push(production);
  _$jscoverage['/kison/grammar.js'].lineData[125]++;
  S.each(production.get("handles"), function(handle) {
  _$jscoverage['/kison/grammar.js'].functionData[11]++;
  _$jscoverage['/kison/grammar.js'].lineData[126]++;
  if (visit9_126_1(!terminals[handle] && !nonTerminals[handle])) {
    _$jscoverage['/kison/grammar.js'].lineData[127]++;
    nonTerminals[handle] = new NonTerminal({
  symbol: handle});
  }
});
});
}, 
  buildNullable: function() {
  _$jscoverage['/kison/grammar.js'].functionData[12]++;
  _$jscoverage['/kison/grammar.js'].lineData[136]++;
  var self = this, i, rhs, n, symbol, t, production, productions, nonTerminals = self.get("nonTerminals"), cont = true;
  _$jscoverage['/kison/grammar.js'].lineData[148]++;
  while (cont) {
    _$jscoverage['/kison/grammar.js'].lineData[149]++;
    cont = false;
    _$jscoverage['/kison/grammar.js'].lineData[154]++;
    S.each(self.get("productions"), function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[13]++;
  _$jscoverage['/kison/grammar.js'].lineData[155]++;
  if (visit10_155_1(!production.get("nullable"))) {
    _$jscoverage['/kison/grammar.js'].lineData[156]++;
    rhs = production.get("rhs");
    _$jscoverage['/kison/grammar.js'].lineData[157]++;
    for (i = 0 , n = 0; t = rhs[i]; ++i) {
      _$jscoverage['/kison/grammar.js'].lineData[158]++;
      if (visit11_158_1(self.isNullable(t))) {
        _$jscoverage['/kison/grammar.js'].lineData[159]++;
        n++;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[162]++;
    if (visit12_162_1(n === i)) {
      _$jscoverage['/kison/grammar.js'].lineData[163]++;
      production.set("nullable", cont = true);
    }
  }
});
    _$jscoverage['/kison/grammar.js'].lineData[169]++;
    for (symbol in nonTerminals) {
      _$jscoverage['/kison/grammar.js'].lineData[171]++;
      if (visit13_171_1(!nonTerminals[symbol].get("nullable"))) {
        _$jscoverage['/kison/grammar.js'].lineData[172]++;
        productions = nonTerminals[symbol].get("productions");
        _$jscoverage['/kison/grammar.js'].lineData[173]++;
        for (i = 0; production = productions[i]; i++) {
          _$jscoverage['/kison/grammar.js'].lineData[174]++;
          if (visit14_174_1(production.get("nullable"))) {
            _$jscoverage['/kison/grammar.js'].lineData[175]++;
            nonTerminals[symbol].set("nullable", cont = true);
            _$jscoverage['/kison/grammar.js'].lineData[176]++;
            break;
          }
        }
      }
    }
  }
}, 
  isNullable: function(symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[14]++;
  _$jscoverage['/kison/grammar.js'].lineData[186]++;
  var self = this, nonTerminals = self.get("nonTerminals");
  _$jscoverage['/kison/grammar.js'].lineData[189]++;
  if (visit15_189_1(symbol instanceof Array)) {
    _$jscoverage['/kison/grammar.js'].lineData[190]++;
    for (var i = 0, t; t = symbol[i]; ++i) {
      _$jscoverage['/kison/grammar.js'].lineData[191]++;
      if (visit16_191_1(!self.isNullable(t))) {
        _$jscoverage['/kison/grammar.js'].lineData[192]++;
        return false;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[195]++;
    return true;
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[197]++;
    if (visit17_197_1(!nonTerminals[symbol])) {
      _$jscoverage['/kison/grammar.js'].lineData[198]++;
      return false;
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[201]++;
      return nonTerminals[symbol].get("nullable");
    }
  }
}, 
  findFirst: function(symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[15]++;
  _$jscoverage['/kison/grammar.js'].lineData[206]++;
  var self = this, firsts = {}, t, i, nonTerminals = self.get("nonTerminals");
  _$jscoverage['/kison/grammar.js'].lineData[212]++;
  if (visit18_212_1(symbol instanceof Array)) {
    _$jscoverage['/kison/grammar.js'].lineData[213]++;
    for (i = 0; t = symbol[i]; ++i) {
      _$jscoverage['/kison/grammar.js'].lineData[214]++;
      if (visit19_214_1(!nonTerminals[t])) {
        _$jscoverage['/kison/grammar.js'].lineData[215]++;
        firsts[t] = 1;
      } else {
        _$jscoverage['/kison/grammar.js'].lineData[217]++;
        mix(firsts, nonTerminals[t].get("firsts"));
      }
      _$jscoverage['/kison/grammar.js'].lineData[219]++;
      if (visit20_219_1(!self.isNullable(t))) {
        _$jscoverage['/kison/grammar.js'].lineData[220]++;
        break;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[222]++;
    return firsts;
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[224]++;
    if (visit21_224_1(!nonTerminals[symbol])) {
      _$jscoverage['/kison/grammar.js'].lineData[225]++;
      return [symbol];
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[228]++;
      return nonTerminals[symbol].get("firsts");
    }
  }
}, 
  buildFirsts: function() {
  _$jscoverage['/kison/grammar.js'].functionData[16]++;
  _$jscoverage['/kison/grammar.js'].lineData[233]++;
  var self = this, nonTerminal, productions = self.get("productions"), nonTerminals = self.get("nonTerminals"), cont = true, symbol, firsts;
  _$jscoverage['/kison/grammar.js'].lineData[241]++;
  while (cont) {
    _$jscoverage['/kison/grammar.js'].lineData[242]++;
    cont = false;
    _$jscoverage['/kison/grammar.js'].lineData[250]++;
    S.each(self.get("productions"), function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[17]++;
  _$jscoverage['/kison/grammar.js'].lineData[251]++;
  var firsts = self.findFirst(production.get("rhs"));
  _$jscoverage['/kison/grammar.js'].lineData[252]++;
  if (visit22_252_1(setSize(firsts) !== setSize(production.get("firsts")))) {
    _$jscoverage['/kison/grammar.js'].lineData[253]++;
    production.set("firsts", firsts);
    _$jscoverage['/kison/grammar.js'].lineData[254]++;
    cont = true;
  }
});
    _$jscoverage['/kison/grammar.js'].lineData[258]++;
    for (symbol in nonTerminals) {
      _$jscoverage['/kison/grammar.js'].lineData[260]++;
      nonTerminal = nonTerminals[symbol];
      _$jscoverage['/kison/grammar.js'].lineData[261]++;
      firsts = {};
      _$jscoverage['/kison/grammar.js'].lineData[262]++;
      S.each(nonTerminal.get("productions"), function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[18]++;
  _$jscoverage['/kison/grammar.js'].lineData[263]++;
  mix(firsts, production.get("firsts"));
});
      _$jscoverage['/kison/grammar.js'].lineData[265]++;
      if (visit23_265_1(setSize(firsts) !== setSize(nonTerminal.get("firsts")))) {
        _$jscoverage['/kison/grammar.js'].lineData[266]++;
        nonTerminal.set("firsts", firsts);
        _$jscoverage['/kison/grammar.js'].lineData[267]++;
        cont = true;
      }
    }
  }
}, 
  closure: function(itemSet) {
  _$jscoverage['/kison/grammar.js'].functionData[19]++;
  _$jscoverage['/kison/grammar.js'].lineData[275]++;
  var self = this, items = itemSet.get("items"), productions = self.get("productions"), cont = 1;
  _$jscoverage['/kison/grammar.js'].lineData[280]++;
  while (cont) {
    _$jscoverage['/kison/grammar.js'].lineData[281]++;
    cont = false;
    _$jscoverage['/kison/grammar.js'].lineData[282]++;
    S.each(items, function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[20]++;
  _$jscoverage['/kison/grammar.js'].lineData[284]++;
  var dotPosition = item.get("dotPosition"), production = item.get("production"), rhs = production.get("rhs"), dotSymbol = rhs[dotPosition], lookAhead = item.get("lookAhead"), finalFirsts = {};
  _$jscoverage['/kison/grammar.js'].lineData[291]++;
  S.each(lookAhead, function(_, ahead) {
  _$jscoverage['/kison/grammar.js'].functionData[21]++;
  _$jscoverage['/kison/grammar.js'].lineData[292]++;
  var rightRhs = rhs.slice(dotPosition + 1);
  _$jscoverage['/kison/grammar.js'].lineData[293]++;
  rightRhs.push(ahead);
  _$jscoverage['/kison/grammar.js'].lineData[294]++;
  S.mix(finalFirsts, self.findFirst(rightRhs));
});
  _$jscoverage['/kison/grammar.js'].lineData[297]++;
  S.each(productions, function(p2) {
  _$jscoverage['/kison/grammar.js'].functionData[22]++;
  _$jscoverage['/kison/grammar.js'].lineData[298]++;
  if (visit24_298_1(p2.get("symbol") == dotSymbol)) {
    _$jscoverage['/kison/grammar.js'].lineData[300]++;
    var newItem = new Item({
  production: p2}), itemIndex = itemSet.findItemIndex(newItem, true), findItem;
    _$jscoverage['/kison/grammar.js'].lineData[314]++;
    if (visit25_314_1(itemIndex != -1)) {
      _$jscoverage['/kison/grammar.js'].lineData[315]++;
      findItem = itemSet.getItemAt(itemIndex);
      _$jscoverage['/kison/grammar.js'].lineData[316]++;
      cont = visit26_316_1(cont || (!!findItem.addLookAhead(finalFirsts)));
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[318]++;
      newItem.addLookAhead(finalFirsts);
      _$jscoverage['/kison/grammar.js'].lineData[319]++;
      itemSet.addItem(newItem);
      _$jscoverage['/kison/grammar.js'].lineData[320]++;
      cont = true;
    }
  }
});
});
  }
  _$jscoverage['/kison/grammar.js'].lineData[329]++;
  return itemSet;
}, 
  gotos: function(i, x) {
  _$jscoverage['/kison/grammar.js'].functionData[23]++;
  _$jscoverage['/kison/grammar.js'].lineData[333]++;
  var j = new ItemSet(), iItems = i.get("items");
  _$jscoverage['/kison/grammar.js'].lineData[335]++;
  S.each(iItems, function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[24]++;
  _$jscoverage['/kison/grammar.js'].lineData[336]++;
  var production = item.get("production"), dotPosition = item.get("dotPosition"), markSymbol = production.get("rhs")[dotPosition];
  _$jscoverage['/kison/grammar.js'].lineData[339]++;
  if (visit27_339_1(markSymbol == x)) {
    _$jscoverage['/kison/grammar.js'].lineData[340]++;
    var newItem = new Item({
  production: production, 
  dotPosition: dotPosition + 1}), itemIndex = j.findItemIndex(newItem, true), findItem;
    _$jscoverage['/kison/grammar.js'].lineData[346]++;
    if (visit28_346_1(itemIndex != -1)) {
      _$jscoverage['/kison/grammar.js'].lineData[347]++;
      findItem = j.getItemAt(itemIndex);
      _$jscoverage['/kison/grammar.js'].lineData[348]++;
      findItem.addLookAhead(item.get("lookAhead"));
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[350]++;
      newItem.addLookAhead(item.get("lookAhead"));
      _$jscoverage['/kison/grammar.js'].lineData[351]++;
      j.addItem(newItem);
    }
  }
});
  _$jscoverage['/kison/grammar.js'].lineData[355]++;
  return this.closure(j);
}, 
  findItemSetIndex: function(itemSet) {
  _$jscoverage['/kison/grammar.js'].functionData[25]++;
  _$jscoverage['/kison/grammar.js'].lineData[359]++;
  var itemSets = this.get("itemSets"), i;
  _$jscoverage['/kison/grammar.js'].lineData[360]++;
  for (i = 0; visit29_360_1(i < itemSets.length); i++) {
    _$jscoverage['/kison/grammar.js'].lineData[361]++;
    if (visit30_361_1(itemSets[i].equals(itemSet))) {
      _$jscoverage['/kison/grammar.js'].lineData[362]++;
      return i;
    }
  }
  _$jscoverage['/kison/grammar.js'].lineData[365]++;
  return -1;
}, 
  buildItemSet: function() {
  _$jscoverage['/kison/grammar.js'].functionData[26]++;
  _$jscoverage['/kison/grammar.js'].lineData[374]++;
  var self = this, lexer = self.lexer, itemSets = self.get("itemSets"), lookAheadTmp = {}, productions = self.get("productions");
  _$jscoverage['/kison/grammar.js'].lineData[380]++;
  lookAheadTmp[lexer.mapSymbol(END_TAG)] = 1;
  _$jscoverage['/kison/grammar.js'].lineData[382]++;
  var initItemSet = self.closure(new ItemSet({
  items: [new Item({
  production: productions[0], 
  lookAhead: lookAheadTmp})]}));
  _$jscoverage['/kison/grammar.js'].lineData[392]++;
  itemSets.push(initItemSet);
  _$jscoverage['/kison/grammar.js'].lineData[394]++;
  var condition = true, symbols = S.merge(self.get("terminals"), self.get("nonTerminals"));
  _$jscoverage['/kison/grammar.js'].lineData[397]++;
  delete symbols[lexer.mapSymbol(END_TAG)];
  _$jscoverage['/kison/grammar.js'].lineData[399]++;
  while (condition) {
    _$jscoverage['/kison/grammar.js'].lineData[400]++;
    condition = false;
    _$jscoverage['/kison/grammar.js'].lineData[401]++;
    var itemSets2 = itemSets.concat();
    _$jscoverage['/kison/grammar.js'].lineData[402]++;
    S.each(itemSets2, function(itemSet) {
  _$jscoverage['/kison/grammar.js'].functionData[27]++;
  _$jscoverage['/kison/grammar.js'].lineData[403]++;
  S.each(symbols, function(v, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[28]++;
  _$jscoverage['/kison/grammar.js'].lineData[405]++;
  if (visit31_405_1(!itemSet.__cache)) {
    _$jscoverage['/kison/grammar.js'].lineData[406]++;
    itemSet.__cache = {};
  }
  _$jscoverage['/kison/grammar.js'].lineData[410]++;
  if (visit32_410_1(itemSet.__cache[symbol])) {
    _$jscoverage['/kison/grammar.js'].lineData[411]++;
    return;
  }
  _$jscoverage['/kison/grammar.js'].lineData[414]++;
  var itemSetNew = self.gotos(itemSet, symbol);
  _$jscoverage['/kison/grammar.js'].lineData[416]++;
  itemSet.__cache[symbol] = 1;
  _$jscoverage['/kison/grammar.js'].lineData[418]++;
  if (visit33_418_1(itemSetNew.size() == 0)) {
    _$jscoverage['/kison/grammar.js'].lineData[419]++;
    return;
  }
  _$jscoverage['/kison/grammar.js'].lineData[422]++;
  var index = self.findItemSetIndex(itemSetNew);
  _$jscoverage['/kison/grammar.js'].lineData[424]++;
  if (visit34_424_1(index > -1)) {
    _$jscoverage['/kison/grammar.js'].lineData[425]++;
    itemSetNew = itemSets[index];
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[427]++;
    itemSets.push(itemSetNew);
    _$jscoverage['/kison/grammar.js'].lineData[428]++;
    condition = true;
  }
  _$jscoverage['/kison/grammar.js'].lineData[431]++;
  itemSet.get("gotos")[symbol] = itemSetNew;
  _$jscoverage['/kison/grammar.js'].lineData[432]++;
  itemSetNew.addReverseGoto(symbol, itemSet);
});
});
  }
}, 
  buildLalrItemSets: function() {
  _$jscoverage['/kison/grammar.js'].functionData[29]++;
  _$jscoverage['/kison/grammar.js'].lineData[440]++;
  var itemSets = this.get("itemSets"), i, j, one, two;
  _$jscoverage['/kison/grammar.js'].lineData[443]++;
  for (i = 0; visit35_443_1(i < itemSets.length); i++) {
    _$jscoverage['/kison/grammar.js'].lineData[444]++;
    one = itemSets[i];
    _$jscoverage['/kison/grammar.js'].lineData[445]++;
    for (j = i + 1; visit36_445_1(j < itemSets.length); j++) {
      _$jscoverage['/kison/grammar.js'].lineData[446]++;
      two = itemSets[j];
      _$jscoverage['/kison/grammar.js'].lineData[447]++;
      if (visit37_447_1(one.equals(two, true))) {
        _$jscoverage['/kison/grammar.js'].lineData[449]++;
        for (var k = 0; visit38_449_1(k < one.get("items").length); k++) {
          _$jscoverage['/kison/grammar.js'].lineData[451]++;
          one.get("items")[k].addLookAhead(two.get("items")[k].get("lookAhead"));
        }
        _$jscoverage['/kison/grammar.js'].lineData[455]++;
        var oneGotos = one.get("gotos");
        _$jscoverage['/kison/grammar.js'].lineData[457]++;
        S.each(two.get("gotos"), function(item, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[30]++;
  _$jscoverage['/kison/grammar.js'].lineData[458]++;
  oneGotos[symbol] = item;
  _$jscoverage['/kison/grammar.js'].lineData[459]++;
  item.addReverseGoto(symbol, one);
});
        _$jscoverage['/kison/grammar.js'].lineData[462]++;
        S.each(two.get("reverseGotos"), function(items, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[31]++;
  _$jscoverage['/kison/grammar.js'].lineData[463]++;
  S.each(items, function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[32]++;
  _$jscoverage['/kison/grammar.js'].lineData[464]++;
  item.get("gotos")[symbol] = one;
  _$jscoverage['/kison/grammar.js'].lineData[465]++;
  one.addReverseGoto(symbol, item);
});
});
        _$jscoverage['/kison/grammar.js'].lineData[469]++;
        itemSets.splice(j--, 1);
      }
    }
  }
}, 
  buildTable: function() {
  _$jscoverage['/kison/grammar.js'].functionData[33]++;
  _$jscoverage['/kison/grammar.js'].lineData[476]++;
  var self = this, lexer = self.lexer, table = self.get("table"), itemSets = self.get("itemSets"), productions = self.get("productions"), mappedStartTag = lexer.mapSymbol(START_TAG), mappedEndTag = lexer.mapSymbol(END_TAG), gotos = {}, action = {}, nonTerminals, i, itemSet, t;
  _$jscoverage['/kison/grammar.js'].lineData[490]++;
  table.gotos = gotos;
  _$jscoverage['/kison/grammar.js'].lineData[491]++;
  table.action = action;
  _$jscoverage['/kison/grammar.js'].lineData[492]++;
  nonTerminals = self.get("nonTerminals");
  _$jscoverage['/kison/grammar.js'].lineData[494]++;
  for (i = 0; visit39_494_1(i < itemSets.length); i++) {
    _$jscoverage['/kison/grammar.js'].lineData[496]++;
    itemSet = itemSets[i];
    _$jscoverage['/kison/grammar.js'].lineData[498]++;
    S.each(itemSet.get("items"), function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[34]++;
  _$jscoverage['/kison/grammar.js'].lineData[499]++;
  var production = item.get("production");
  _$jscoverage['/kison/grammar.js'].lineData[500]++;
  var val;
  _$jscoverage['/kison/grammar.js'].lineData[501]++;
  if (visit40_501_1(item.get("dotPosition") == production.get("rhs").length)) {
    _$jscoverage['/kison/grammar.js'].lineData[502]++;
    if (visit41_502_1(production.get("symbol") == mappedStartTag)) {
      _$jscoverage['/kison/grammar.js'].lineData[503]++;
      if (visit42_503_1(item.get("lookAhead")[mappedEndTag])) {
        _$jscoverage['/kison/grammar.js'].lineData[504]++;
        action[i] = visit43_504_1(action[i] || {});
        _$jscoverage['/kison/grammar.js'].lineData[505]++;
        t = action[i][mappedEndTag];
        _$jscoverage['/kison/grammar.js'].lineData[506]++;
        val = [];
        _$jscoverage['/kison/grammar.js'].lineData[507]++;
        val[GrammarConst.TYPE_INDEX] = GrammarConst.ACCEPT_TYPE;
        _$jscoverage['/kison/grammar.js'].lineData[508]++;
        if (visit44_508_1(t && visit45_508_2(t.toString() != val.toString()))) {
          _$jscoverage['/kison/grammar.js'].lineData[509]++;
          logger.debug(new Array(29).join('*'));
          _$jscoverage['/kison/grammar.js'].lineData[510]++;
          logger.debug('***** conflict in reduce: action already defined ->', 'warn');
          _$jscoverage['/kison/grammar.js'].lineData[512]++;
          logger.debug('***** current item:', 'info');
          _$jscoverage['/kison/grammar.js'].lineData[513]++;
          logger.debug(item.toString());
          _$jscoverage['/kison/grammar.js'].lineData[514]++;
          logger.debug('***** current action:', 'info');
          _$jscoverage['/kison/grammar.js'].lineData[515]++;
          visualizeAction(t, productions, itemSets);
          _$jscoverage['/kison/grammar.js'].lineData[516]++;
          logger.debug('***** will be overwritten ->', 'info');
          _$jscoverage['/kison/grammar.js'].lineData[517]++;
          visualizeAction(val, productions, itemSets);
        }
        _$jscoverage['/kison/grammar.js'].lineData[519]++;
        action[i][mappedEndTag] = val;
      }
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[522]++;
      action[i] = visit46_522_1(action[i] || {});
      _$jscoverage['/kison/grammar.js'].lineData[527]++;
      S.each(item.get("lookAhead"), function(_, l) {
  _$jscoverage['/kison/grammar.js'].functionData[35]++;
  _$jscoverage['/kison/grammar.js'].lineData[528]++;
  t = action[i][l];
  _$jscoverage['/kison/grammar.js'].lineData[529]++;
  val = [];
  _$jscoverage['/kison/grammar.js'].lineData[530]++;
  val[GrammarConst.TYPE_INDEX] = GrammarConst.REDUCE_TYPE;
  _$jscoverage['/kison/grammar.js'].lineData[531]++;
  val[GrammarConst.PRODUCTION_INDEX] = S.indexOf(production, productions);
  _$jscoverage['/kison/grammar.js'].lineData[532]++;
  if (visit47_532_1(t && visit48_532_2(t.toString() != val.toString()))) {
    _$jscoverage['/kison/grammar.js'].lineData[533]++;
    logger.debug(new Array(29).join('*'));
    _$jscoverage['/kison/grammar.js'].lineData[534]++;
    logger.debug('conflict in reduce: action already defined ->', 'warn');
    _$jscoverage['/kison/grammar.js'].lineData[536]++;
    logger.debug('***** current item:', 'info');
    _$jscoverage['/kison/grammar.js'].lineData[537]++;
    logger.debug(item.toString());
    _$jscoverage['/kison/grammar.js'].lineData[538]++;
    logger.debug('***** current action:', 'info');
    _$jscoverage['/kison/grammar.js'].lineData[539]++;
    visualizeAction(t, productions, itemSets);
    _$jscoverage['/kison/grammar.js'].lineData[540]++;
    logger.debug('***** will be overwritten ->', 'info');
    _$jscoverage['/kison/grammar.js'].lineData[541]++;
    visualizeAction(val, productions, itemSets);
  }
  _$jscoverage['/kison/grammar.js'].lineData[543]++;
  action[i][l] = val;
});
    }
  }
});
    _$jscoverage['/kison/grammar.js'].lineData[550]++;
    S.each(itemSet.get("gotos"), function(anotherItemSet, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[36]++;
  _$jscoverage['/kison/grammar.js'].lineData[551]++;
  var val;
  _$jscoverage['/kison/grammar.js'].lineData[552]++;
  if (visit49_552_1(!nonTerminals[symbol])) {
    _$jscoverage['/kison/grammar.js'].lineData[553]++;
    action[i] = visit50_553_1(action[i] || {});
    _$jscoverage['/kison/grammar.js'].lineData[554]++;
    val = [];
    _$jscoverage['/kison/grammar.js'].lineData[555]++;
    val[GrammarConst.TYPE_INDEX] = GrammarConst.SHIFT_TYPE;
    _$jscoverage['/kison/grammar.js'].lineData[556]++;
    val[GrammarConst.TO_INDEX] = indexOf(anotherItemSet, itemSets);
    _$jscoverage['/kison/grammar.js'].lineData[557]++;
    t = action[i][symbol];
    _$jscoverage['/kison/grammar.js'].lineData[558]++;
    if (visit51_558_1(t && visit52_558_2(t.toString() != val.toString()))) {
      _$jscoverage['/kison/grammar.js'].lineData[559]++;
      logger.debug(new Array(29).join('*'));
      _$jscoverage['/kison/grammar.js'].lineData[560]++;
      logger.debug('conflict in shift: action already defined ->', 'warn');
      _$jscoverage['/kison/grammar.js'].lineData[562]++;
      logger.debug('***** current itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[563]++;
      logger.debug(itemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[564]++;
      logger.debug('***** current symbol:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[565]++;
      logger.debug(symbol);
      _$jscoverage['/kison/grammar.js'].lineData[566]++;
      logger.debug('***** goto itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[567]++;
      logger.debug(anotherItemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[568]++;
      logger.debug('***** current action:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[569]++;
      visualizeAction(t, productions, itemSets);
      _$jscoverage['/kison/grammar.js'].lineData[570]++;
      logger.debug('***** will be overwritten ->', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[571]++;
      visualizeAction(val, productions, itemSets);
    }
    _$jscoverage['/kison/grammar.js'].lineData[573]++;
    action[i][symbol] = val;
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[575]++;
    gotos[i] = visit53_575_1(gotos[i] || {});
    _$jscoverage['/kison/grammar.js'].lineData[576]++;
    t = gotos[i][symbol];
    _$jscoverage['/kison/grammar.js'].lineData[577]++;
    val = indexOf(anotherItemSet, itemSets);
    _$jscoverage['/kison/grammar.js'].lineData[578]++;
    if (visit54_578_1(t && visit55_578_2(val != t))) {
      _$jscoverage['/kison/grammar.js'].lineData[579]++;
      logger.debug(new Array(29).join('*'));
      _$jscoverage['/kison/grammar.js'].lineData[580]++;
      logger.debug('conflict in shift: goto already defined ->', 'warn');
      _$jscoverage['/kison/grammar.js'].lineData[582]++;
      logger.debug('***** current itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[583]++;
      logger.debug(itemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[584]++;
      logger.debug('***** current symbol:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[585]++;
      logger.debug(symbol);
      _$jscoverage['/kison/grammar.js'].lineData[586]++;
      logger.debug('***** goto itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[587]++;
      logger.debug(anotherItemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[588]++;
      logger.debug('***** current goto state:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[589]++;
      logger.debug(t);
      _$jscoverage['/kison/grammar.js'].lineData[590]++;
      logger.debug('***** will be overwritten ->', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[591]++;
      logger.debug(val);
    }
    _$jscoverage['/kison/grammar.js'].lineData[593]++;
    gotos[i][symbol] = val;
  }
});
  }
}, 
  visualizeTable: function() {
  _$jscoverage['/kison/grammar.js'].functionData[37]++;
  _$jscoverage['/kison/grammar.js'].lineData[601]++;
  var self = this, table = self.get("table"), gotos = table.gotos, action = table.action, productions = self.get("productions"), ret = [];
  _$jscoverage['/kison/grammar.js'].lineData[608]++;
  S.each(self.get("itemSets"), function(itemSet, i) {
  _$jscoverage['/kison/grammar.js'].functionData[38]++;
  _$jscoverage['/kison/grammar.js'].lineData[609]++;
  ret.push(new Array(70).join("*") + " itemSet : " + i);
  _$jscoverage['/kison/grammar.js'].lineData[610]++;
  ret.push(itemSet.toString());
  _$jscoverage['/kison/grammar.js'].lineData[611]++;
  ret.push("");
});
  _$jscoverage['/kison/grammar.js'].lineData[614]++;
  ret.push("");
  _$jscoverage['/kison/grammar.js'].lineData[616]++;
  ret.push(new Array(70).join("*") + " table : ");
  _$jscoverage['/kison/grammar.js'].lineData[618]++;
  S.each(action, function(av, index) {
  _$jscoverage['/kison/grammar.js'].functionData[39]++;
  _$jscoverage['/kison/grammar.js'].lineData[619]++;
  S.each(av, function(v, s) {
  _$jscoverage['/kison/grammar.js'].functionData[40]++;
  _$jscoverage['/kison/grammar.js'].lineData[620]++;
  var str, type = v[GrammarConst.TYPE_INDEX];
  _$jscoverage['/kison/grammar.js'].lineData[621]++;
  if (visit56_621_1(type == GrammarConst.ACCEPT_TYPE)) {
    _$jscoverage['/kison/grammar.js'].lineData[622]++;
    str = "acc";
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[623]++;
    if (visit57_623_1(type == GrammarConst.REDUCE_TYPE)) {
      _$jscoverage['/kison/grammar.js'].lineData[624]++;
      var production = productions[v[GrammarConst.PRODUCTION_INDEX]];
      _$jscoverage['/kison/grammar.js'].lineData[625]++;
      str = "r, " + production.get("symbol") + "=" + production.get("rhs").join(" ");
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[627]++;
      if (visit58_627_1(type == GrammarConst.SHIFT_TYPE)) {
        _$jscoverage['/kison/grammar.js'].lineData[628]++;
        str = "s, " + v[GrammarConst.TO_INDEX];
      }
    }
  }
  _$jscoverage['/kison/grammar.js'].lineData[630]++;
  ret.push("action[" + index + "]" + "[" + s + "] = " + str);
});
});
  _$jscoverage['/kison/grammar.js'].lineData[634]++;
  ret.push("");
  _$jscoverage['/kison/grammar.js'].lineData[636]++;
  S.each(gotos, function(sv, index) {
  _$jscoverage['/kison/grammar.js'].functionData[41]++;
  _$jscoverage['/kison/grammar.js'].lineData[637]++;
  S.each(sv, function(v, s) {
  _$jscoverage['/kison/grammar.js'].functionData[42]++;
  _$jscoverage['/kison/grammar.js'].lineData[638]++;
  ret.push("goto[" + index + "]" + "[" + s + "] = " + v);
});
});
  _$jscoverage['/kison/grammar.js'].lineData[642]++;
  return ret;
}, 
  genCode: function(cfg) {
  _$jscoverage['/kison/grammar.js'].functionData[43]++;
  _$jscoverage['/kison/grammar.js'].lineData[646]++;
  cfg = visit59_646_1(cfg || {});
  _$jscoverage['/kison/grammar.js'].lineData[648]++;
  var self = this, table = self.get("table"), lexer = self.get("lexer"), lexerCode = lexer.genCode(cfg);
  _$jscoverage['/kison/grammar.js'].lineData[653]++;
  self.build();
  _$jscoverage['/kison/grammar.js'].lineData[655]++;
  var productions = [];
  _$jscoverage['/kison/grammar.js'].lineData[657]++;
  S.each(self.get("productions"), function(p) {
  _$jscoverage['/kison/grammar.js'].functionData[44]++;
  _$jscoverage['/kison/grammar.js'].lineData[658]++;
  var action = p.get("action"), ret = [p.get('symbol'), p.get('rhs')];
  _$jscoverage['/kison/grammar.js'].lineData[660]++;
  if (visit60_660_1(action)) {
    _$jscoverage['/kison/grammar.js'].lineData[661]++;
    ret.push(action);
  }
  _$jscoverage['/kison/grammar.js'].lineData[663]++;
  productions.push(ret);
});
  _$jscoverage['/kison/grammar.js'].lineData[666]++;
  var code = [];
  _$jscoverage['/kison/grammar.js'].lineData[668]++;
  code.push("/* Generated by kison from KISSY */");
  _$jscoverage['/kison/grammar.js'].lineData[670]++;
  code.push("var parser = {}," + "S = KISSY," + "GrammarConst = " + serializeObject(GrammarConst) + ";");
  _$jscoverage['/kison/grammar.js'].lineData[675]++;
  code.push(lexerCode);
  _$jscoverage['/kison/grammar.js'].lineData[677]++;
  code.push("parser.lexer = lexer;");
  _$jscoverage['/kison/grammar.js'].lineData[679]++;
  if (visit61_679_1(cfg.compressSymbol)) {
    _$jscoverage['/kison/grammar.js'].lineData[680]++;
    code.push("lexer.symbolMap = " + serializeObject(lexer.symbolMap) + ";");
  }
  _$jscoverage['/kison/grammar.js'].lineData[683]++;
  code.push('parser.productions = ' + serializeObject(productions) + ";");
  _$jscoverage['/kison/grammar.js'].lineData[684]++;
  code.push("parser.table = " + serializeObject(table) + ";");
  _$jscoverage['/kison/grammar.js'].lineData[685]++;
  code.push("parser.parse = " + parse.toString() + ";");
  _$jscoverage['/kison/grammar.js'].lineData[686]++;
  code.push("return parser;");
  _$jscoverage['/kison/grammar.js'].lineData[687]++;
  return code.join("\n");
}}, {
  ATTRS: {
  table: {
  value: {}}, 
  itemSets: {
  value: []}, 
  productions: {
  value: []}, 
  nonTerminals: {
  value: {}}, 
  lexer: {
  setter: function(v) {
  _$jscoverage['/kison/grammar.js'].functionData[45]++;
  _$jscoverage['/kison/grammar.js'].lineData[706]++;
  if (visit62_706_1(!(v instanceof Lexer))) {
    _$jscoverage['/kison/grammar.js'].lineData[707]++;
    v = new Lexer(v);
  }
  _$jscoverage['/kison/grammar.js'].lineData[709]++;
  this.lexer = v;
  _$jscoverage['/kison/grammar.js'].lineData[710]++;
  return v;
}}, 
  terminals: {
  value: {}}}});
  _$jscoverage['/kison/grammar.js'].lineData[721]++;
  function parse(input) {
    _$jscoverage['/kison/grammar.js'].functionData[46]++;
    _$jscoverage['/kison/grammar.js'].lineData[722]++;
    var self = this, lexer = self.lexer, state, symbol, action, table = self.table, gotos = table.gotos, tableAction = table.action, productions = self.productions, valueStack = [null], stack = [0];
    _$jscoverage['/kison/grammar.js'].lineData[734]++;
    lexer.resetInput(input);
    _$jscoverage['/kison/grammar.js'].lineData[736]++;
    while (1) {
      _$jscoverage['/kison/grammar.js'].lineData[738]++;
      state = stack[stack.length - 1];
      _$jscoverage['/kison/grammar.js'].lineData[740]++;
      if (visit63_740_1(!symbol)) {
        _$jscoverage['/kison/grammar.js'].lineData[741]++;
        symbol = lexer.lex();
      }
      _$jscoverage['/kison/grammar.js'].lineData[744]++;
      if (visit64_744_1(!symbol)) {
        _$jscoverage['/kison/grammar.js'].lineData[745]++;
        S.log("it is not a valid input: " + input, 'error');
        _$jscoverage['/kison/grammar.js'].lineData[746]++;
        return false;
      }
      _$jscoverage['/kison/grammar.js'].lineData[750]++;
      action = visit65_750_1(tableAction[state] && tableAction[state][symbol]);
      _$jscoverage['/kison/grammar.js'].lineData[752]++;
      if (visit66_752_1(!action)) {
        _$jscoverage['/kison/grammar.js'].lineData[753]++;
        var expected = [], error;
        _$jscoverage['/kison/grammar.js'].lineData[754]++;
        if (visit67_754_1(tableAction[state])) {
          _$jscoverage['/kison/grammar.js'].lineData[755]++;
          S.each(tableAction[state], function(_, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[47]++;
  _$jscoverage['/kison/grammar.js'].lineData[756]++;
  expected.push(self.lexer.mapReverseSymbol(symbol));
});
        }
        _$jscoverage['/kison/grammar.js'].lineData[759]++;
        error = "Syntax error at line " + lexer.lineNumber + ":\n" + lexer.showDebugInfo() + "\n" + "expect " + expected.join(", ");
        _$jscoverage['/kison/grammar.js'].lineData[762]++;
        S.error(error);
        _$jscoverage['/kison/grammar.js'].lineData[763]++;
        return false;
      }
      _$jscoverage['/kison/grammar.js'].lineData[766]++;
      switch (action[GrammarConst.TYPE_INDEX]) {
        case GrammarConst.SHIFT_TYPE:
          _$jscoverage['/kison/grammar.js'].lineData[768]++;
          stack.push(symbol);
          _$jscoverage['/kison/grammar.js'].lineData[770]++;
          valueStack.push(lexer.text);
          _$jscoverage['/kison/grammar.js'].lineData[773]++;
          stack.push(action[GrammarConst.TO_INDEX]);
          _$jscoverage['/kison/grammar.js'].lineData[776]++;
          symbol = null;
          _$jscoverage['/kison/grammar.js'].lineData[778]++;
          break;
        case GrammarConst.REDUCE_TYPE:
          _$jscoverage['/kison/grammar.js'].lineData[781]++;
          var production = productions[action[GrammarConst.PRODUCTION_INDEX]], reducedSymbol = visit68_782_1(production.symbol || production[0]), reducedAction = visit69_783_1(production.action || production[2]), reducedRhs = visit70_784_1(production.rhs || production[1]), len = reducedRhs.length, i = 0, ret = undefined, $$ = valueStack[valueStack.length - len];
          _$jscoverage['/kison/grammar.js'].lineData[790]++;
          self.$$ = $$;
          _$jscoverage['/kison/grammar.js'].lineData[792]++;
          for (; visit71_792_1(i < len); i++) {
            _$jscoverage['/kison/grammar.js'].lineData[793]++;
            self["$" + (len - i)] = valueStack[valueStack.length - 1 - i];
          }
          _$jscoverage['/kison/grammar.js'].lineData[796]++;
          if (visit72_796_1(reducedAction)) {
            _$jscoverage['/kison/grammar.js'].lineData[797]++;
            ret = reducedAction.call(self);
          }
          _$jscoverage['/kison/grammar.js'].lineData[800]++;
          if (visit73_800_1(ret !== undefined)) {
            _$jscoverage['/kison/grammar.js'].lineData[801]++;
            $$ = ret;
          } else {
            _$jscoverage['/kison/grammar.js'].lineData[803]++;
            $$ = self.$$;
          }
          _$jscoverage['/kison/grammar.js'].lineData[806]++;
          if (visit74_806_1(len)) {
            _$jscoverage['/kison/grammar.js'].lineData[807]++;
            stack = stack.slice(0, -1 * len * 2);
            _$jscoverage['/kison/grammar.js'].lineData[808]++;
            valueStack = valueStack.slice(0, -1 * len);
          }
          _$jscoverage['/kison/grammar.js'].lineData[811]++;
          stack.push(reducedSymbol);
          _$jscoverage['/kison/grammar.js'].lineData[813]++;
          valueStack.push($$);
          _$jscoverage['/kison/grammar.js'].lineData[815]++;
          var newState = gotos[stack[stack.length - 2]][stack[stack.length - 1]];
          _$jscoverage['/kison/grammar.js'].lineData[817]++;
          stack.push(newState);
          _$jscoverage['/kison/grammar.js'].lineData[819]++;
          break;
        case GrammarConst.ACCEPT_TYPE:
          _$jscoverage['/kison/grammar.js'].lineData[822]++;
          return $$;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[827]++;
    return undefined;
  }
}, {
  requires: ['base', './utils', './item', './item-set', './non-terminal', './lexer', './production']});
