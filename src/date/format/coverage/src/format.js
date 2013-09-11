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
  _$jscoverage['/format.js'].lineData[35] = 0;
  _$jscoverage['/format.js'].lineData[38] = 0;
  _$jscoverage['/format.js'].lineData[40] = 0;
  _$jscoverage['/format.js'].lineData[42] = 0;
  _$jscoverage['/format.js'].lineData[43] = 0;
  _$jscoverage['/format.js'].lineData[44] = 0;
  _$jscoverage['/format.js'].lineData[45] = 0;
  _$jscoverage['/format.js'].lineData[46] = 0;
  _$jscoverage['/format.js'].lineData[47] = 0;
  _$jscoverage['/format.js'].lineData[48] = 0;
  _$jscoverage['/format.js'].lineData[49] = 0;
  _$jscoverage['/format.js'].lineData[50] = 0;
  _$jscoverage['/format.js'].lineData[51] = 0;
  _$jscoverage['/format.js'].lineData[52] = 0;
  _$jscoverage['/format.js'].lineData[53] = 0;
  _$jscoverage['/format.js'].lineData[54] = 0;
  _$jscoverage['/format.js'].lineData[56] = 0;
  _$jscoverage['/format.js'].lineData[57] = 0;
  _$jscoverage['/format.js'].lineData[60] = 0;
  _$jscoverage['/format.js'].lineData[65] = 0;
  _$jscoverage['/format.js'].lineData[66] = 0;
  _$jscoverage['/format.js'].lineData[72] = 0;
  _$jscoverage['/format.js'].lineData[73] = 0;
  _$jscoverage['/format.js'].lineData[74] = 0;
  _$jscoverage['/format.js'].lineData[75] = 0;
  _$jscoverage['/format.js'].lineData[76] = 0;
  _$jscoverage['/format.js'].lineData[77] = 0;
  _$jscoverage['/format.js'].lineData[78] = 0;
  _$jscoverage['/format.js'].lineData[80] = 0;
  _$jscoverage['/format.js'].lineData[81] = 0;
  _$jscoverage['/format.js'].lineData[83] = 0;
  _$jscoverage['/format.js'].lineData[86] = 0;
  _$jscoverage['/format.js'].lineData[87] = 0;
  _$jscoverage['/format.js'].lineData[88] = 0;
  _$jscoverage['/format.js'].lineData[89] = 0;
  _$jscoverage['/format.js'].lineData[90] = 0;
  _$jscoverage['/format.js'].lineData[91] = 0;
  _$jscoverage['/format.js'].lineData[92] = 0;
  _$jscoverage['/format.js'].lineData[93] = 0;
  _$jscoverage['/format.js'].lineData[95] = 0;
  _$jscoverage['/format.js'].lineData[96] = 0;
  _$jscoverage['/format.js'].lineData[98] = 0;
  _$jscoverage['/format.js'].lineData[101] = 0;
  _$jscoverage['/format.js'].lineData[102] = 0;
  _$jscoverage['/format.js'].lineData[103] = 0;
  _$jscoverage['/format.js'].lineData[104] = 0;
  _$jscoverage['/format.js'].lineData[105] = 0;
  _$jscoverage['/format.js'].lineData[107] = 0;
  _$jscoverage['/format.js'].lineData[108] = 0;
  _$jscoverage['/format.js'].lineData[110] = 0;
  _$jscoverage['/format.js'].lineData[113] = 0;
  _$jscoverage['/format.js'].lineData[115] = 0;
  _$jscoverage['/format.js'].lineData[117] = 0;
  _$jscoverage['/format.js'].lineData[118] = 0;
  _$jscoverage['/format.js'].lineData[119] = 0;
  _$jscoverage['/format.js'].lineData[121] = 0;
  _$jscoverage['/format.js'].lineData[122] = 0;
  _$jscoverage['/format.js'].lineData[123] = 0;
  _$jscoverage['/format.js'].lineData[124] = 0;
  _$jscoverage['/format.js'].lineData[125] = 0;
  _$jscoverage['/format.js'].lineData[127] = 0;
  _$jscoverage['/format.js'].lineData[130] = 0;
  _$jscoverage['/format.js'].lineData[133] = 0;
  _$jscoverage['/format.js'].lineData[134] = 0;
  _$jscoverage['/format.js'].lineData[138] = 0;
  _$jscoverage['/format.js'].lineData[139] = 0;
  _$jscoverage['/format.js'].lineData[140] = 0;
  _$jscoverage['/format.js'].lineData[141] = 0;
  _$jscoverage['/format.js'].lineData[143] = 0;
  _$jscoverage['/format.js'].lineData[144] = 0;
  _$jscoverage['/format.js'].lineData[145] = 0;
  _$jscoverage['/format.js'].lineData[148] = 0;
  _$jscoverage['/format.js'].lineData[149] = 0;
  _$jscoverage['/format.js'].lineData[152] = 0;
  _$jscoverage['/format.js'].lineData[153] = 0;
  _$jscoverage['/format.js'].lineData[156] = 0;
  _$jscoverage['/format.js'].lineData[159] = 0;
  _$jscoverage['/format.js'].lineData[162] = 0;
  _$jscoverage['/format.js'].lineData[167] = 0;
  _$jscoverage['/format.js'].lineData[168] = 0;
  _$jscoverage['/format.js'].lineData[169] = 0;
  _$jscoverage['/format.js'].lineData[170] = 0;
  _$jscoverage['/format.js'].lineData[171] = 0;
  _$jscoverage['/format.js'].lineData[172] = 0;
  _$jscoverage['/format.js'].lineData[174] = 0;
  _$jscoverage['/format.js'].lineData[175] = 0;
  _$jscoverage['/format.js'].lineData[176] = 0;
  _$jscoverage['/format.js'].lineData[177] = 0;
  _$jscoverage['/format.js'].lineData[178] = 0;
  _$jscoverage['/format.js'].lineData[179] = 0;
  _$jscoverage['/format.js'].lineData[181] = 0;
  _$jscoverage['/format.js'].lineData[182] = 0;
  _$jscoverage['/format.js'].lineData[186] = 0;
  _$jscoverage['/format.js'].lineData[187] = 0;
  _$jscoverage['/format.js'].lineData[190] = 0;
  _$jscoverage['/format.js'].lineData[191] = 0;
  _$jscoverage['/format.js'].lineData[192] = 0;
  _$jscoverage['/format.js'].lineData[193] = 0;
  _$jscoverage['/format.js'].lineData[196] = 0;
  _$jscoverage['/format.js'].lineData[197] = 0;
  _$jscoverage['/format.js'].lineData[199] = 0;
  _$jscoverage['/format.js'].lineData[201] = 0;
  _$jscoverage['/format.js'].lineData[202] = 0;
  _$jscoverage['/format.js'].lineData[203] = 0;
  _$jscoverage['/format.js'].lineData[205] = 0;
  _$jscoverage['/format.js'].lineData[206] = 0;
  _$jscoverage['/format.js'].lineData[207] = 0;
  _$jscoverage['/format.js'].lineData[209] = 0;
  _$jscoverage['/format.js'].lineData[210] = 0;
  _$jscoverage['/format.js'].lineData[212] = 0;
  _$jscoverage['/format.js'].lineData[213] = 0;
  _$jscoverage['/format.js'].lineData[214] = 0;
  _$jscoverage['/format.js'].lineData[215] = 0;
  _$jscoverage['/format.js'].lineData[216] = 0;
  _$jscoverage['/format.js'].lineData[218] = 0;
  _$jscoverage['/format.js'].lineData[220] = 0;
  _$jscoverage['/format.js'].lineData[222] = 0;
  _$jscoverage['/format.js'].lineData[224] = 0;
  _$jscoverage['/format.js'].lineData[226] = 0;
  _$jscoverage['/format.js'].lineData[227] = 0;
  _$jscoverage['/format.js'].lineData[230] = 0;
  _$jscoverage['/format.js'].lineData[232] = 0;
  _$jscoverage['/format.js'].lineData[235] = 0;
  _$jscoverage['/format.js'].lineData[237] = 0;
  _$jscoverage['/format.js'].lineData[239] = 0;
  _$jscoverage['/format.js'].lineData[241] = 0;
  _$jscoverage['/format.js'].lineData[243] = 0;
  _$jscoverage['/format.js'].lineData[245] = 0;
  _$jscoverage['/format.js'].lineData[246] = 0;
  _$jscoverage['/format.js'].lineData[247] = 0;
  _$jscoverage['/format.js'].lineData[248] = 0;
  _$jscoverage['/format.js'].lineData[250] = 0;
  _$jscoverage['/format.js'].lineData[251] = 0;
  _$jscoverage['/format.js'].lineData[262] = 0;
  _$jscoverage['/format.js'].lineData[263] = 0;
  _$jscoverage['/format.js'].lineData[264] = 0;
  _$jscoverage['/format.js'].lineData[266] = 0;
  _$jscoverage['/format.js'].lineData[269] = 0;
  _$jscoverage['/format.js'].lineData[270] = 0;
  _$jscoverage['/format.js'].lineData[274] = 0;
  _$jscoverage['/format.js'].lineData[275] = 0;
  _$jscoverage['/format.js'].lineData[276] = 0;
  _$jscoverage['/format.js'].lineData[277] = 0;
  _$jscoverage['/format.js'].lineData[279] = 0;
  _$jscoverage['/format.js'].lineData[280] = 0;
  _$jscoverage['/format.js'].lineData[283] = 0;
  _$jscoverage['/format.js'].lineData[289] = 0;
  _$jscoverage['/format.js'].lineData[290] = 0;
  _$jscoverage['/format.js'].lineData[291] = 0;
  _$jscoverage['/format.js'].lineData[292] = 0;
  _$jscoverage['/format.js'].lineData[295] = 0;
  _$jscoverage['/format.js'].lineData[298] = 0;
  _$jscoverage['/format.js'].lineData[299] = 0;
  _$jscoverage['/format.js'].lineData[301] = 0;
  _$jscoverage['/format.js'].lineData[302] = 0;
  _$jscoverage['/format.js'].lineData[303] = 0;
  _$jscoverage['/format.js'].lineData[304] = 0;
  _$jscoverage['/format.js'].lineData[307] = 0;
  _$jscoverage['/format.js'].lineData[310] = 0;
  _$jscoverage['/format.js'].lineData[311] = 0;
  _$jscoverage['/format.js'].lineData[312] = 0;
  _$jscoverage['/format.js'].lineData[313] = 0;
  _$jscoverage['/format.js'].lineData[314] = 0;
  _$jscoverage['/format.js'].lineData[316] = 0;
  _$jscoverage['/format.js'].lineData[317] = 0;
  _$jscoverage['/format.js'].lineData[318] = 0;
  _$jscoverage['/format.js'].lineData[321] = 0;
  _$jscoverage['/format.js'].lineData[323] = 0;
  _$jscoverage['/format.js'].lineData[324] = 0;
  _$jscoverage['/format.js'].lineData[325] = 0;
  _$jscoverage['/format.js'].lineData[327] = 0;
  _$jscoverage['/format.js'].lineData[333] = 0;
  _$jscoverage['/format.js'].lineData[334] = 0;
  _$jscoverage['/format.js'].lineData[335] = 0;
  _$jscoverage['/format.js'].lineData[336] = 0;
  _$jscoverage['/format.js'].lineData[338] = 0;
  _$jscoverage['/format.js'].lineData[340] = 0;
  _$jscoverage['/format.js'].lineData[341] = 0;
  _$jscoverage['/format.js'].lineData[342] = 0;
  _$jscoverage['/format.js'].lineData[343] = 0;
  _$jscoverage['/format.js'].lineData[344] = 0;
  _$jscoverage['/format.js'].lineData[347] = 0;
  _$jscoverage['/format.js'].lineData[350] = 0;
  _$jscoverage['/format.js'].lineData[352] = 0;
  _$jscoverage['/format.js'].lineData[353] = 0;
  _$jscoverage['/format.js'].lineData[354] = 0;
  _$jscoverage['/format.js'].lineData[355] = 0;
  _$jscoverage['/format.js'].lineData[356] = 0;
  _$jscoverage['/format.js'].lineData[359] = 0;
  _$jscoverage['/format.js'].lineData[361] = 0;
  _$jscoverage['/format.js'].lineData[363] = 0;
  _$jscoverage['/format.js'].lineData[364] = 0;
  _$jscoverage['/format.js'].lineData[365] = 0;
  _$jscoverage['/format.js'].lineData[367] = 0;
  _$jscoverage['/format.js'].lineData[370] = 0;
  _$jscoverage['/format.js'].lineData[371] = 0;
  _$jscoverage['/format.js'].lineData[374] = 0;
  _$jscoverage['/format.js'].lineData[375] = 0;
  _$jscoverage['/format.js'].lineData[377] = 0;
  _$jscoverage['/format.js'].lineData[379] = 0;
  _$jscoverage['/format.js'].lineData[380] = 0;
  _$jscoverage['/format.js'].lineData[382] = 0;
  _$jscoverage['/format.js'].lineData[384] = 0;
  _$jscoverage['/format.js'].lineData[387] = 0;
  _$jscoverage['/format.js'].lineData[389] = 0;
  _$jscoverage['/format.js'].lineData[391] = 0;
  _$jscoverage['/format.js'].lineData[392] = 0;
  _$jscoverage['/format.js'].lineData[393] = 0;
  _$jscoverage['/format.js'].lineData[394] = 0;
  _$jscoverage['/format.js'].lineData[395] = 0;
  _$jscoverage['/format.js'].lineData[396] = 0;
  _$jscoverage['/format.js'].lineData[400] = 0;
  _$jscoverage['/format.js'].lineData[403] = 0;
  _$jscoverage['/format.js'].lineData[405] = 0;
  _$jscoverage['/format.js'].lineData[406] = 0;
  _$jscoverage['/format.js'].lineData[407] = 0;
  _$jscoverage['/format.js'].lineData[408] = 0;
  _$jscoverage['/format.js'].lineData[410] = 0;
  _$jscoverage['/format.js'].lineData[412] = 0;
  _$jscoverage['/format.js'].lineData[414] = 0;
  _$jscoverage['/format.js'].lineData[415] = 0;
  _$jscoverage['/format.js'].lineData[416] = 0;
  _$jscoverage['/format.js'].lineData[417] = 0;
  _$jscoverage['/format.js'].lineData[419] = 0;
  _$jscoverage['/format.js'].lineData[421] = 0;
  _$jscoverage['/format.js'].lineData[423] = 0;
  _$jscoverage['/format.js'].lineData[424] = 0;
  _$jscoverage['/format.js'].lineData[426] = 0;
  _$jscoverage['/format.js'].lineData[427] = 0;
  _$jscoverage['/format.js'].lineData[428] = 0;
  _$jscoverage['/format.js'].lineData[429] = 0;
  _$jscoverage['/format.js'].lineData[430] = 0;
  _$jscoverage['/format.js'].lineData[432] = 0;
  _$jscoverage['/format.js'].lineData[434] = 0;
  _$jscoverage['/format.js'].lineData[435] = 0;
  _$jscoverage['/format.js'].lineData[436] = 0;
  _$jscoverage['/format.js'].lineData[437] = 0;
  _$jscoverage['/format.js'].lineData[438] = 0;
  _$jscoverage['/format.js'].lineData[440] = 0;
  _$jscoverage['/format.js'].lineData[442] = 0;
  _$jscoverage['/format.js'].lineData[453] = 0;
  _$jscoverage['/format.js'].lineData[454] = 0;
  _$jscoverage['/format.js'].lineData[455] = 0;
  _$jscoverage['/format.js'].lineData[458] = 0;
  _$jscoverage['/format.js'].lineData[459] = 0;
  _$jscoverage['/format.js'].lineData[461] = 0;
  _$jscoverage['/format.js'].lineData[464] = 0;
  _$jscoverage['/format.js'].lineData[466] = 0;
  _$jscoverage['/format.js'].lineData[467] = 0;
  _$jscoverage['/format.js'].lineData[468] = 0;
  _$jscoverage['/format.js'].lineData[469] = 0;
  _$jscoverage['/format.js'].lineData[473] = 0;
  _$jscoverage['/format.js'].lineData[474] = 0;
  _$jscoverage['/format.js'].lineData[475] = 0;
  _$jscoverage['/format.js'].lineData[476] = 0;
  _$jscoverage['/format.js'].lineData[477] = 0;
  _$jscoverage['/format.js'].lineData[478] = 0;
  _$jscoverage['/format.js'].lineData[481] = 0;
  _$jscoverage['/format.js'].lineData[485] = 0;
  _$jscoverage['/format.js'].lineData[497] = 0;
  _$jscoverage['/format.js'].lineData[498] = 0;
  _$jscoverage['/format.js'].lineData[499] = 0;
  _$jscoverage['/format.js'].lineData[500] = 0;
  _$jscoverage['/format.js'].lineData[501] = 0;
  _$jscoverage['/format.js'].lineData[502] = 0;
  _$jscoverage['/format.js'].lineData[503] = 0;
  _$jscoverage['/format.js'].lineData[504] = 0;
  _$jscoverage['/format.js'].lineData[506] = 0;
  _$jscoverage['/format.js'].lineData[507] = 0;
  _$jscoverage['/format.js'].lineData[508] = 0;
  _$jscoverage['/format.js'].lineData[509] = 0;
  _$jscoverage['/format.js'].lineData[512] = 0;
  _$jscoverage['/format.js'].lineData[514] = 0;
  _$jscoverage['/format.js'].lineData[515] = 0;
  _$jscoverage['/format.js'].lineData[516] = 0;
  _$jscoverage['/format.js'].lineData[517] = 0;
  _$jscoverage['/format.js'].lineData[518] = 0;
  _$jscoverage['/format.js'].lineData[519] = 0;
  _$jscoverage['/format.js'].lineData[521] = 0;
  _$jscoverage['/format.js'].lineData[522] = 0;
  _$jscoverage['/format.js'].lineData[523] = 0;
  _$jscoverage['/format.js'].lineData[527] = 0;
  _$jscoverage['/format.js'].lineData[535] = 0;
  _$jscoverage['/format.js'].lineData[536] = 0;
  _$jscoverage['/format.js'].lineData[542] = 0;
  _$jscoverage['/format.js'].lineData[543] = 0;
  _$jscoverage['/format.js'].lineData[544] = 0;
  _$jscoverage['/format.js'].lineData[545] = 0;
  _$jscoverage['/format.js'].lineData[546] = 0;
  _$jscoverage['/format.js'].lineData[548] = 0;
  _$jscoverage['/format.js'].lineData[552] = 0;
  _$jscoverage['/format.js'].lineData[559] = 0;
  _$jscoverage['/format.js'].lineData[561] = 0;
  _$jscoverage['/format.js'].lineData[564] = 0;
  _$jscoverage['/format.js'].lineData[567] = 0;
  _$jscoverage['/format.js'].lineData[568] = 0;
  _$jscoverage['/format.js'].lineData[569] = 0;
  _$jscoverage['/format.js'].lineData[570] = 0;
  _$jscoverage['/format.js'].lineData[572] = 0;
  _$jscoverage['/format.js'].lineData[573] = 0;
  _$jscoverage['/format.js'].lineData[574] = 0;
  _$jscoverage['/format.js'].lineData[576] = 0;
  _$jscoverage['/format.js'].lineData[577] = 0;
  _$jscoverage['/format.js'].lineData[578] = 0;
  _$jscoverage['/format.js'].lineData[579] = 0;
  _$jscoverage['/format.js'].lineData[584] = 0;
  _$jscoverage['/format.js'].lineData[587] = 0;
  _$jscoverage['/format.js'].lineData[590] = 0;
  _$jscoverage['/format.js'].lineData[594] = 0;
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
  _$jscoverage['/format.js'].branchData['80'] = [];
  _$jscoverage['/format.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['83'] = [];
  _$jscoverage['/format.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['86'] = [];
  _$jscoverage['/format.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['88'] = [];
  _$jscoverage['/format.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['90'] = [];
  _$jscoverage['/format.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['95'] = [];
  _$jscoverage['/format.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['101'] = [];
  _$jscoverage['/format.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['102'] = [];
  _$jscoverage['/format.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['117'] = [];
  _$jscoverage['/format.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['121'] = [];
  _$jscoverage['/format.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['121'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['121'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['121'][4] = new BranchData();
  _$jscoverage['/format.js'].branchData['121'][5] = new BranchData();
  _$jscoverage['/format.js'].branchData['121'][6] = new BranchData();
  _$jscoverage['/format.js'].branchData['121'][7] = new BranchData();
  _$jscoverage['/format.js'].branchData['121'][8] = new BranchData();
  _$jscoverage['/format.js'].branchData['122'] = [];
  _$jscoverage['/format.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['133'] = [];
  _$jscoverage['/format.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['138'] = [];
  _$jscoverage['/format.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['138'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['138'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['148'] = [];
  _$jscoverage['/format.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['152'] = [];
  _$jscoverage['/format.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['167'] = [];
  _$jscoverage['/format.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['168'] = [];
  _$jscoverage['/format.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['169'] = [];
  _$jscoverage['/format.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['170'] = [];
  _$jscoverage['/format.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['170'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['170'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['170'][4] = new BranchData();
  _$jscoverage['/format.js'].branchData['170'][5] = new BranchData();
  _$jscoverage['/format.js'].branchData['171'] = [];
  _$jscoverage['/format.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['171'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['171'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['176'] = [];
  _$jscoverage['/format.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['176'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['176'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['177'] = [];
  _$jscoverage['/format.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['181'] = [];
  _$jscoverage['/format.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['181'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['181'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['191'] = [];
  _$jscoverage['/format.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['201'] = [];
  _$jscoverage['/format.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['206'] = [];
  _$jscoverage['/format.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['209'] = [];
  _$jscoverage['/format.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['213'] = [];
  _$jscoverage['/format.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['215'] = [];
  _$jscoverage['/format.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['222'] = [];
  _$jscoverage['/format.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['227'] = [];
  _$jscoverage['/format.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['232'] = [];
  _$jscoverage['/format.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['238'] = [];
  _$jscoverage['/format.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['246'] = [];
  _$jscoverage['/format.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['274'] = [];
  _$jscoverage['/format.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['277'] = [];
  _$jscoverage['/format.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['277'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['283'] = [];
  _$jscoverage['/format.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['290'] = [];
  _$jscoverage['/format.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['291'] = [];
  _$jscoverage['/format.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['301'] = [];
  _$jscoverage['/format.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['303'] = [];
  _$jscoverage['/format.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['303'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['303'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['312'] = [];
  _$jscoverage['/format.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['313'] = [];
  _$jscoverage['/format.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['317'] = [];
  _$jscoverage['/format.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['324'] = [];
  _$jscoverage['/format.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['335'] = [];
  _$jscoverage['/format.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['340'] = [];
  _$jscoverage['/format.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['341'] = [];
  _$jscoverage['/format.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['342'] = [];
  _$jscoverage['/format.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['352'] = [];
  _$jscoverage['/format.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['354'] = [];
  _$jscoverage['/format.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['355'] = [];
  _$jscoverage['/format.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['364'] = [];
  _$jscoverage['/format.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['365'] = [];
  _$jscoverage['/format.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['365'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['370'] = [];
  _$jscoverage['/format.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['374'] = [];
  _$jscoverage['/format.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['379'] = [];
  _$jscoverage['/format.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['384'] = [];
  _$jscoverage['/format.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['384'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['391'] = [];
  _$jscoverage['/format.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['392'] = [];
  _$jscoverage['/format.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['393'] = [];
  _$jscoverage['/format.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['395'] = [];
  _$jscoverage['/format.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['405'] = [];
  _$jscoverage['/format.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['407'] = [];
  _$jscoverage['/format.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['414'] = [];
  _$jscoverage['/format.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['416'] = [];
  _$jscoverage['/format.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['423'] = [];
  _$jscoverage['/format.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['426'] = [];
  _$jscoverage['/format.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['429'] = [];
  _$jscoverage['/format.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['434'] = [];
  _$jscoverage['/format.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['437'] = [];
  _$jscoverage['/format.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['453'] = [];
  _$jscoverage['/format.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['458'] = [];
  _$jscoverage['/format.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['473'] = [];
  _$jscoverage['/format.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['475'] = [];
  _$jscoverage['/format.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['477'] = [];
  _$jscoverage['/format.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['498'] = [];
  _$jscoverage['/format.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['498'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['498'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['501'] = [];
  _$jscoverage['/format.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['503'] = [];
  _$jscoverage['/format.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['506'] = [];
  _$jscoverage['/format.js'].branchData['506'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['507'] = [];
  _$jscoverage['/format.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['514'] = [];
  _$jscoverage['/format.js'].branchData['514'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['517'] = [];
  _$jscoverage['/format.js'].branchData['517'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['518'] = [];
  _$jscoverage['/format.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['522'] = [];
  _$jscoverage['/format.js'].branchData['522'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['522'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['522'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['535'] = [];
  _$jscoverage['/format.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['542'] = [];
  _$jscoverage['/format.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['567'] = [];
  _$jscoverage['/format.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['569'] = [];
  _$jscoverage['/format.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['573'] = [];
  _$jscoverage['/format.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['577'] = [];
  _$jscoverage['/format.js'].branchData['577'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['578'] = [];
  _$jscoverage['/format.js'].branchData['578'][1] = new BranchData();
}
_$jscoverage['/format.js'].branchData['578'][1].init(22, 11, 'datePattern');
function visit120_578_1(result) {
  _$jscoverage['/format.js'].branchData['578'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['577'][1].init(419, 11, 'timePattern');
function visit119_577_1(result) {
  _$jscoverage['/format.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['573'][1].init(257, 23, 'timeStyle !== undefined');
function visit118_573_1(result) {
  _$jscoverage['/format.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['569'][1].init(100, 23, 'dateStyle !== undefined');
function visit117_569_1(result) {
  _$jscoverage['/format.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['567'][1].init(23, 23, 'locale || defaultLocale');
function visit116_567_1(result) {
  _$jscoverage['/format.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['542'][1].init(2447, 15, 'errorIndex >= 0');
function visit115_542_1(result) {
  _$jscoverage['/format.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['535'][1].init(928, 27, 'startIndex == oldStartIndex');
function visit114_535_1(result) {
  _$jscoverage['/format.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['522'][3].init(116, 8, 'c <= \'9\'');
function visit113_522_3(result) {
  _$jscoverage['/format.js'].branchData['522'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['522'][2].init(104, 8, 'c >= \'0\'');
function visit112_522_2(result) {
  _$jscoverage['/format.js'].branchData['522'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['522'][1].init(104, 20, 'c >= \'0\' && c <= \'9\'');
function visit111_522_1(result) {
  _$jscoverage['/format.js'].branchData['522'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['518'][1].init(34, 19, '\'field\' in nextComp');
function visit110_518_1(result) {
  _$jscoverage['/format.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['517'][1].init(130, 8, 'nextComp');
function visit109_517_1(result) {
  _$jscoverage['/format.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['514'][1].init(804, 15, '\'field\' in comp');
function visit108_514_1(result) {
  _$jscoverage['/format.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['507'][1].init(38, 48, 'text.charAt(j) != dateStr.charAt(j + startIndex)');
function visit107_507_1(result) {
  _$jscoverage['/format.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['506'][1].init(42, 11, 'j < textLen');
function visit106_506_1(result) {
  _$jscoverage['/format.js'].branchData['506'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['503'][1].init(79, 34, '(textLen + startIndex) > dateStrLen');
function visit105_503_1(result) {
  _$jscoverage['/format.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['501'][1].init(134, 16, 'text = comp.text');
function visit104_501_1(result) {
  _$jscoverage['/format.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['498'][3].init(48, 7, 'i < len');
function visit103_498_3(result) {
  _$jscoverage['/format.js'].branchData['498'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['498'][2].init(30, 14, 'errorIndex < 0');
function visit102_498_2(result) {
  _$jscoverage['/format.js'].branchData['498'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['498'][1].init(30, 25, 'errorIndex < 0 && i < len');
function visit101_498_1(result) {
  _$jscoverage['/format.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['477'][1].init(146, 15, '\'field\' in comp');
function visit100_477_1(result) {
  _$jscoverage['/format.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['475'][1].init(62, 9, 'comp.text');
function visit99_475_1(result) {
  _$jscoverage['/format.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['473'][1].init(315, 7, 'i < len');
function visit98_473_1(result) {
  _$jscoverage['/format.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['458'][1].init(4803, 5, 'match');
function visit97_458_1(result) {
  _$jscoverage['/format.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['453'][1].init(299, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit96_453_1(result) {
  _$jscoverage['/format.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['437'][1].init(134, 49, 'match = matchNumber(dateStr, startIndex, 2, true)');
function visit95_437_1(result) {
  _$jscoverage['/format.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['434'][1].init(421, 49, 'match = matchNumber(dateStr, startIndex, 2, true)');
function visit94_434_1(result) {
  _$jscoverage['/format.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['429'][1].init(274, 15, 'zoneChar == \'+\'');
function visit93_429_1(result) {
  _$jscoverage['/format.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['426'][1].init(159, 15, 'zoneChar == \'-\'');
function visit92_426_1(result) {
  _$jscoverage['/format.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['423'][1].init(30, 7, 'dateStr');
function visit91_423_1(result) {
  _$jscoverage['/format.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['416'][1].init(67, 8, 'tmp.ampm');
function visit90_416_1(result) {
  _$jscoverage['/format.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['414'][1].init(30, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit89_414_1(result) {
  _$jscoverage['/format.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['407'][1].init(73, 8, 'tmp.ampm');
function visit88_407_1(result) {
  _$jscoverage['/format.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['405'][1].init(30, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit87_405_1(result) {
  _$jscoverage['/format.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['395'][1].init(95, 9, 'hour < 12');
function visit86_395_1(result) {
  _$jscoverage['/format.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['393'][1].init(30, 11, 'match.value');
function visit85_393_1(result) {
  _$jscoverage['/format.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['392'][1].init(26, 25, 'calendar.isSetHourOfDay()');
function visit84_392_1(result) {
  _$jscoverage['/format.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['391'][1].init(30, 53, 'match = matchField(dateStr, startIndex, locale.ampms)');
function visit83_391_1(result) {
  _$jscoverage['/format.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['384'][2].init(77, 9, 'count > 3');
function visit82_384_2(result) {
  _$jscoverage['/format.js'].branchData['384'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['384'][1].init(30, 131, 'match = matchField(dateStr, startIndex, locale[count > 3 ? \'weekdays\' : \'shortWeekdays\'])');
function visit81_384_1(result) {
  _$jscoverage['/format.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['379'][1].init(30, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit80_379_1(result) {
  _$jscoverage['/format.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['374'][1].init(505, 5, 'match');
function visit79_374_1(result) {
  _$jscoverage['/format.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['370'][1].init(26, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit78_370_1(result) {
  _$jscoverage['/format.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['365'][2].init(73, 10, 'count == 3');
function visit77_365_2(result) {
  _$jscoverage['/format.js'].branchData['365'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['365'][1].init(26, 111, 'match = matchField(dateStr, startIndex, locale[count == 3 ? \'shortMonths\' : \'months\'])');
function visit76_365_1(result) {
  _$jscoverage['/format.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['364'][1].init(58, 10, 'count >= 3');
function visit75_364_1(result) {
  _$jscoverage['/format.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['355'][1].init(30, 13, 'tmp.era === 0');
function visit74_355_1(result) {
  _$jscoverage['/format.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['354'][1].init(67, 12, '\'era\' in tmp');
function visit73_354_1(result) {
  _$jscoverage['/format.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['352'][1].init(30, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit72_352_1(result) {
  _$jscoverage['/format.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['342'][1].init(30, 16, 'match.value == 0');
function visit71_342_1(result) {
  _$jscoverage['/format.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['341'][1].init(26, 20, 'calendar.isSetYear()');
function visit70_341_1(result) {
  _$jscoverage['/format.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['340'][1].init(30, 52, 'match = matchField(dateStr, startIndex, locale.eras)');
function visit69_340_1(result) {
  _$jscoverage['/format.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['335'][1].init(46, 28, 'dateStr.length <= startIndex');
function visit68_335_1(result) {
  _$jscoverage['/format.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['324'][1].init(423, 8, 'isNaN(n)');
function visit67_324_1(result) {
  _$jscoverage['/format.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['317'][1].init(177, 19, '!str.match(/^\\d+$/)');
function visit66_317_1(result) {
  _$jscoverage['/format.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['313'][1].init(18, 36, 'dateStr.length <= startIndex + count');
function visit65_313_1(result) {
  _$jscoverage['/format.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['312'][1].init(46, 9, 'obeyCount');
function visit64_312_1(result) {
  _$jscoverage['/format.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['303'][3].init(61, 7, 'c > \'9\'');
function visit63_303_3(result) {
  _$jscoverage['/format.js'].branchData['303'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['303'][2].init(50, 7, 'c < \'0\'');
function visit62_303_2(result) {
  _$jscoverage['/format.js'].branchData['303'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['303'][1].init(50, 18, 'c < \'0\' || c > \'9\'');
function visit61_303_1(result) {
  _$jscoverage['/format.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['301'][1].init(72, 7, 'i < len');
function visit60_301_1(result) {
  _$jscoverage['/format.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['291'][1].init(18, 49, 'dateStr.charAt(startIndex + i) != match.charAt(i)');
function visit59_291_1(result) {
  _$jscoverage['/format.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['290'][1].init(26, 8, 'i < mLen');
function visit58_290_1(result) {
  _$jscoverage['/format.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['283'][1].init(421, 10, 'index >= 0');
function visit57_283_1(result) {
  _$jscoverage['/format.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['277'][2].init(85, 17, 'mLen > matchedLen');
function visit56_277_2(result) {
  _$jscoverage['/format.js'].branchData['277'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['277'][1].init(85, 83, 'mLen > matchedLen && matchPartString(dateStr, startIndex, m, mLen)');
function visit55_277_1(result) {
  _$jscoverage['/format.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['274'][1].init(128, 7, 'i < len');
function visit54_274_1(result) {
  _$jscoverage['/format.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['246'][1].init(99, 10, 'offset < 0');
function visit53_246_1(result) {
  _$jscoverage['/format.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['238'][1].init(17, 56, 'calendar.getHourOfDay() % 12 || 12');
function visit52_238_1(result) {
  _$jscoverage['/format.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['232'][1].init(49, 29, 'calendar.getHourOfDay() >= 12');
function visit51_232_1(result) {
  _$jscoverage['/format.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['227'][1].init(86, 10, 'count >= 4');
function visit50_227_1(result) {
  _$jscoverage['/format.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['222'][1].init(54, 28, 'calendar.getHourOfDay() || 24');
function visit49_222_1(result) {
  _$jscoverage['/format.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['215'][1].init(172, 10, 'count == 3');
function visit48_215_1(result) {
  _$jscoverage['/format.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['213'][1].init(76, 10, 'count >= 4');
function visit47_213_1(result) {
  _$jscoverage['/format.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['209'][1].init(204, 10, 'count != 2');
function visit46_209_1(result) {
  _$jscoverage['/format.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['206'][1].init(75, 10, 'value <= 0');
function visit45_206_1(result) {
  _$jscoverage['/format.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['201'][1].init(34, 22, 'calendar.getYear() > 0');
function visit44_201_1(result) {
  _$jscoverage['/format.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['191'][1].init(24, 23, 'locale || defaultLocale');
function visit43_191_1(result) {
  _$jscoverage['/format.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['181'][3].init(184, 14, 'maxDigits == 2');
function visit42_181_3(result) {
  _$jscoverage['/format.js'].branchData['181'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['181'][2].init(166, 14, 'minDigits == 2');
function visit41_181_2(result) {
  _$jscoverage['/format.js'].branchData['181'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['181'][1].init(166, 32, 'minDigits == 2 && maxDigits == 2');
function visit40_181_1(result) {
  _$jscoverage['/format.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['177'][1].init(22, 14, 'minDigits == 4');
function visit39_177_1(result) {
  _$jscoverage['/format.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['176'][3].init(306, 13, 'value < 10000');
function visit38_176_3(result) {
  _$jscoverage['/format.js'].branchData['176'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['176'][2].init(289, 13, 'value >= 1000');
function visit37_176_2(result) {
  _$jscoverage['/format.js'].branchData['176'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['176'][1].init(289, 30, 'value >= 1000 && value < 10000');
function visit36_176_1(result) {
  _$jscoverage['/format.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['171'][3].init(36, 14, 'minDigits == 2');
function visit35_171_3(result) {
  _$jscoverage['/format.js'].branchData['171'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['171'][2].init(22, 10, 'value < 10');
function visit34_171_2(result) {
  _$jscoverage['/format.js'].branchData['171'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['171'][1].init(22, 28, 'value < 10 && minDigits == 2');
function visit33_171_1(result) {
  _$jscoverage['/format.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['170'][5].init(51, 14, 'minDigits <= 2');
function visit32_170_5(result) {
  _$jscoverage['/format.js'].branchData['170'][5].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['170'][4].init(33, 14, 'minDigits >= 1');
function visit31_170_4(result) {
  _$jscoverage['/format.js'].branchData['170'][4].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['170'][3].init(33, 32, 'minDigits >= 1 && minDigits <= 2');
function visit30_170_3(result) {
  _$jscoverage['/format.js'].branchData['170'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['170'][2].init(18, 11, 'value < 100');
function visit29_170_2(result) {
  _$jscoverage['/format.js'].branchData['170'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['170'][1].init(18, 47, 'value < 100 && minDigits >= 1 && minDigits <= 2');
function visit28_170_1(result) {
  _$jscoverage['/format.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['169'][1].init(362, 10, 'value >= 0');
function visit27_169_1(result) {
  _$jscoverage['/format.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['168'][1].init(325, 22, 'maxDigits || MAX_VALUE');
function visit26_168_1(result) {
  _$jscoverage['/format.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['167'][1].init(290, 12, 'buffer || []');
function visit25_167_1(result) {
  _$jscoverage['/format.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['152'][1].init(2577, 10, 'count != 0');
function visit24_152_1(result) {
  _$jscoverage['/format.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['148'][1].init(2488, 7, 'inQuote');
function visit23_148_1(result) {
  _$jscoverage['/format.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['138'][3].init(2003, 14, 'lastField == c');
function visit22_138_3(result) {
  _$jscoverage['/format.js'].branchData['138'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['138'][2].init(1984, 15, 'lastField == -1');
function visit21_138_2(result) {
  _$jscoverage['/format.js'].branchData['138'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['138'][1].init(1984, 33, 'lastField == -1 || lastField == c');
function visit20_138_1(result) {
  _$jscoverage['/format.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['133'][1].init(1816, 29, 'patternChars.indexOf(c) == -1');
function visit19_133_1(result) {
  _$jscoverage['/format.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['122'][1].init(22, 10, 'count != 0');
function visit18_122_1(result) {
  _$jscoverage['/format.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['121'][8].init(1465, 8, 'c <= \'Z\'');
function visit17_121_8(result) {
  _$jscoverage['/format.js'].branchData['121'][8].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['121'][7].init(1453, 8, 'c >= \'A\'');
function visit16_121_7(result) {
  _$jscoverage['/format.js'].branchData['121'][7].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['121'][6].init(1453, 20, 'c >= \'A\' && c <= \'Z\'');
function visit15_121_6(result) {
  _$jscoverage['/format.js'].branchData['121'][6].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['121'][5].init(1441, 8, 'c <= \'z\'');
function visit14_121_5(result) {
  _$jscoverage['/format.js'].branchData['121'][5].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['121'][4].init(1429, 8, 'c >= \'a\'');
function visit13_121_4(result) {
  _$jscoverage['/format.js'].branchData['121'][4].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['121'][3].init(1429, 20, 'c >= \'a\' && c <= \'z\'');
function visit12_121_3(result) {
  _$jscoverage['/format.js'].branchData['121'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['121'][2].init(1429, 44, 'c >= \'a\' && c <= \'z\' || c >= \'A\' && c <= \'Z\'');
function visit11_121_2(result) {
  _$jscoverage['/format.js'].branchData['121'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['121'][1].init(1427, 47, '!(c >= \'a\' && c <= \'z\' || c >= \'A\' && c <= \'Z\')');
function visit10_121_1(result) {
  _$jscoverage['/format.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['117'][1].init(1324, 7, 'inQuote');
function visit9_117_1(result) {
  _$jscoverage['/format.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['102'][1].init(26, 10, 'count != 0');
function visit8_102_1(result) {
  _$jscoverage['/format.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['101'][1].init(708, 8, '!inQuote');
function visit7_101_1(result) {
  _$jscoverage['/format.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['95'][1].init(287, 7, 'inQuote');
function visit6_95_1(result) {
  _$jscoverage['/format.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['90'][1].init(60, 10, 'count != 0');
function visit5_90_1(result) {
  _$jscoverage['/format.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['88'][1].init(74, 9, 'c == \'\\\'\'');
function visit4_88_1(result) {
  _$jscoverage['/format.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['86'][1].init(136, 15, '(i + 1) < length');
function visit3_86_1(result) {
  _$jscoverage['/format.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['83'][1].init(60, 8, 'c == "\'"');
function visit2_83_1(result) {
  _$jscoverage['/format.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['80'][1].init(215, 10, 'i < length');
function visit1_80_1(result) {
  _$jscoverage['/format.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].lineData[7]++;
KISSY.add('date/format', function(S, GregorianCalendar, defaultLocale) {
  _$jscoverage['/format.js'].functionData[0]++;
  _$jscoverage['/format.js'].lineData[8]++;
  var MAX_VALUE = Number.MAX_VALUE;
  _$jscoverage['/format.js'].lineData[9]++;
  var logger = S.getLogger('s/date/format');
  _$jscoverage['/format.js'].lineData[35]++;
  var patternChars = new Array(GregorianCalendar.DAY_OF_WEEK_IN_MONTH + 2).join('1');
  _$jscoverage['/format.js'].lineData[38]++;
  var ERA = 0;
  _$jscoverage['/format.js'].lineData[40]++;
  var calendarIndexMap = {};
  _$jscoverage['/format.js'].lineData[42]++;
  patternChars = patternChars.split('');
  _$jscoverage['/format.js'].lineData[43]++;
  patternChars[ERA] = 'G';
  _$jscoverage['/format.js'].lineData[44]++;
  patternChars[GregorianCalendar.YEAR] = 'y';
  _$jscoverage['/format.js'].lineData[45]++;
  patternChars[GregorianCalendar.MONTH] = 'M';
  _$jscoverage['/format.js'].lineData[46]++;
  patternChars[GregorianCalendar.DAY_OF_MONTH] = 'd';
  _$jscoverage['/format.js'].lineData[47]++;
  patternChars[GregorianCalendar.HOUR_OF_DAY] = 'H';
  _$jscoverage['/format.js'].lineData[48]++;
  patternChars[GregorianCalendar.MINUTES] = 'm';
  _$jscoverage['/format.js'].lineData[49]++;
  patternChars[GregorianCalendar.SECONDS] = 's';
  _$jscoverage['/format.js'].lineData[50]++;
  patternChars[GregorianCalendar.MILLISECONDS] = 'S';
  _$jscoverage['/format.js'].lineData[51]++;
  patternChars[GregorianCalendar.WEEK_OF_YEAR] = 'w';
  _$jscoverage['/format.js'].lineData[52]++;
  patternChars[GregorianCalendar.WEEK_OF_MONTH] = 'W';
  _$jscoverage['/format.js'].lineData[53]++;
  patternChars[GregorianCalendar.DAY_OF_YEAR] = 'D';
  _$jscoverage['/format.js'].lineData[54]++;
  patternChars[GregorianCalendar.DAY_OF_WEEK_IN_MONTH] = 'F';
  _$jscoverage['/format.js'].lineData[56]++;
  S.each(patternChars, function(v, index) {
  _$jscoverage['/format.js'].functionData[1]++;
  _$jscoverage['/format.js'].lineData[57]++;
  calendarIndexMap[v] = index;
});
  _$jscoverage['/format.js'].lineData[60]++;
  patternChars = patternChars.join('') + 'ahkKZE';
  _$jscoverage['/format.js'].lineData[65]++;
  function encode(lastField, count, compiledPattern) {
    _$jscoverage['/format.js'].functionData[2]++;
    _$jscoverage['/format.js'].lineData[66]++;
    compiledPattern.push({
  field: lastField, 
  count: count});
  }
  _$jscoverage['/format.js'].lineData[72]++;
  function compile(pattern) {
    _$jscoverage['/format.js'].functionData[3]++;
    _$jscoverage['/format.js'].lineData[73]++;
    var length = pattern.length;
    _$jscoverage['/format.js'].lineData[74]++;
    var inQuote = false;
    _$jscoverage['/format.js'].lineData[75]++;
    var compiledPattern = [];
    _$jscoverage['/format.js'].lineData[76]++;
    var tmpBuffer = null;
    _$jscoverage['/format.js'].lineData[77]++;
    var count = 0;
    _$jscoverage['/format.js'].lineData[78]++;
    var lastField = -1;
    _$jscoverage['/format.js'].lineData[80]++;
    for (var i = 0; visit1_80_1(i < length); i++) {
      _$jscoverage['/format.js'].lineData[81]++;
      var c = pattern.charAt(i);
      _$jscoverage['/format.js'].lineData[83]++;
      if (visit2_83_1(c == "'")) {
        _$jscoverage['/format.js'].lineData[86]++;
        if (visit3_86_1((i + 1) < length)) {
          _$jscoverage['/format.js'].lineData[87]++;
          c = pattern.charAt(i + 1);
          _$jscoverage['/format.js'].lineData[88]++;
          if (visit4_88_1(c == '\'')) {
            _$jscoverage['/format.js'].lineData[89]++;
            i++;
            _$jscoverage['/format.js'].lineData[90]++;
            if (visit5_90_1(count != 0)) {
              _$jscoverage['/format.js'].lineData[91]++;
              encode(lastField, count, compiledPattern);
              _$jscoverage['/format.js'].lineData[92]++;
              lastField = -1;
              _$jscoverage['/format.js'].lineData[93]++;
              count = 0;
            }
            _$jscoverage['/format.js'].lineData[95]++;
            if (visit6_95_1(inQuote)) {
              _$jscoverage['/format.js'].lineData[96]++;
              tmpBuffer += c;
            }
            _$jscoverage['/format.js'].lineData[98]++;
            continue;
          }
        }
        _$jscoverage['/format.js'].lineData[101]++;
        if (visit7_101_1(!inQuote)) {
          _$jscoverage['/format.js'].lineData[102]++;
          if (visit8_102_1(count != 0)) {
            _$jscoverage['/format.js'].lineData[103]++;
            encode(lastField, count, compiledPattern);
            _$jscoverage['/format.js'].lineData[104]++;
            lastField = -1;
            _$jscoverage['/format.js'].lineData[105]++;
            count = 0;
          }
          _$jscoverage['/format.js'].lineData[107]++;
          tmpBuffer = '';
          _$jscoverage['/format.js'].lineData[108]++;
          inQuote = true;
        } else {
          _$jscoverage['/format.js'].lineData[110]++;
          compiledPattern.push({
  text: tmpBuffer});
          _$jscoverage['/format.js'].lineData[113]++;
          inQuote = false;
        }
        _$jscoverage['/format.js'].lineData[115]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[117]++;
      if (visit9_117_1(inQuote)) {
        _$jscoverage['/format.js'].lineData[118]++;
        tmpBuffer += c;
        _$jscoverage['/format.js'].lineData[119]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[121]++;
      if (visit10_121_1(!(visit11_121_2(visit12_121_3(visit13_121_4(c >= 'a') && visit14_121_5(c <= 'z')) || visit15_121_6(visit16_121_7(c >= 'A') && visit17_121_8(c <= 'Z')))))) {
        _$jscoverage['/format.js'].lineData[122]++;
        if (visit18_122_1(count != 0)) {
          _$jscoverage['/format.js'].lineData[123]++;
          encode(lastField, count, compiledPattern);
          _$jscoverage['/format.js'].lineData[124]++;
          lastField = -1;
          _$jscoverage['/format.js'].lineData[125]++;
          count = 0;
        }
        _$jscoverage['/format.js'].lineData[127]++;
        compiledPattern.push({
  text: c});
        _$jscoverage['/format.js'].lineData[130]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[133]++;
      if (visit19_133_1(patternChars.indexOf(c) == -1)) {
        _$jscoverage['/format.js'].lineData[134]++;
        throw new Error("Illegal pattern character " + "'" + c + "'");
      }
      _$jscoverage['/format.js'].lineData[138]++;
      if (visit20_138_1(visit21_138_2(lastField == -1) || visit22_138_3(lastField == c))) {
        _$jscoverage['/format.js'].lineData[139]++;
        lastField = c;
        _$jscoverage['/format.js'].lineData[140]++;
        count++;
        _$jscoverage['/format.js'].lineData[141]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[143]++;
      encode(lastField, count, compiledPattern);
      _$jscoverage['/format.js'].lineData[144]++;
      lastField = c;
      _$jscoverage['/format.js'].lineData[145]++;
      count = 1;
    }
    _$jscoverage['/format.js'].lineData[148]++;
    if (visit23_148_1(inQuote)) {
      _$jscoverage['/format.js'].lineData[149]++;
      throw new Error("Unterminated quote");
    }
    _$jscoverage['/format.js'].lineData[152]++;
    if (visit24_152_1(count != 0)) {
      _$jscoverage['/format.js'].lineData[153]++;
      encode(lastField, count, compiledPattern);
    }
    _$jscoverage['/format.js'].lineData[156]++;
    return compiledPattern;
  }
  _$jscoverage['/format.js'].lineData[159]++;
  var zeroDigit = '0';
  _$jscoverage['/format.js'].lineData[162]++;
  function zeroPaddingNumber(value, minDigits, maxDigits, buffer) {
    _$jscoverage['/format.js'].functionData[4]++;
    _$jscoverage['/format.js'].lineData[167]++;
    buffer = visit25_167_1(buffer || []);
    _$jscoverage['/format.js'].lineData[168]++;
    maxDigits = visit26_168_1(maxDigits || MAX_VALUE);
    _$jscoverage['/format.js'].lineData[169]++;
    if (visit27_169_1(value >= 0)) {
      _$jscoverage['/format.js'].lineData[170]++;
      if (visit28_170_1(visit29_170_2(value < 100) && visit30_170_3(visit31_170_4(minDigits >= 1) && visit32_170_5(minDigits <= 2)))) {
        _$jscoverage['/format.js'].lineData[171]++;
        if (visit33_171_1(visit34_171_2(value < 10) && visit35_171_3(minDigits == 2))) {
          _$jscoverage['/format.js'].lineData[172]++;
          buffer.push(zeroDigit);
        }
        _$jscoverage['/format.js'].lineData[174]++;
        buffer.push(value);
        _$jscoverage['/format.js'].lineData[175]++;
        return buffer.join('');
      } else {
        _$jscoverage['/format.js'].lineData[176]++;
        if (visit36_176_1(visit37_176_2(value >= 1000) && visit38_176_3(value < 10000))) {
          _$jscoverage['/format.js'].lineData[177]++;
          if (visit39_177_1(minDigits == 4)) {
            _$jscoverage['/format.js'].lineData[178]++;
            buffer.push(value);
            _$jscoverage['/format.js'].lineData[179]++;
            return buffer.join('');
          }
          _$jscoverage['/format.js'].lineData[181]++;
          if (visit40_181_1(visit41_181_2(minDigits == 2) && visit42_181_3(maxDigits == 2))) {
            _$jscoverage['/format.js'].lineData[182]++;
            return zeroPaddingNumber(value % 100, 2, 2, buffer);
          }
        }
      }
    }
    _$jscoverage['/format.js'].lineData[186]++;
    buffer.push(value + '');
    _$jscoverage['/format.js'].lineData[187]++;
    return buffer.join('');
  }
  _$jscoverage['/format.js'].lineData[190]++;
  function DateTimeFormat(pattern, locale, timeZoneOffset) {
    _$jscoverage['/format.js'].functionData[5]++;
    _$jscoverage['/format.js'].lineData[191]++;
    this.locale = visit43_191_1(locale || defaultLocale);
    _$jscoverage['/format.js'].lineData[192]++;
    this.pattern = compile(pattern);
    _$jscoverage['/format.js'].lineData[193]++;
    this.timezoneOffset = timeZoneOffset;
  }
  _$jscoverage['/format.js'].lineData[196]++;
  function formatField(field, count, locale, calendar) {
    _$jscoverage['/format.js'].functionData[6]++;
    _$jscoverage['/format.js'].lineData[197]++;
    var current, value;
    _$jscoverage['/format.js'].lineData[199]++;
    switch (field) {
      case 'G':
        _$jscoverage['/format.js'].lineData[201]++;
        value = visit44_201_1(calendar.getYear() > 0) ? 1 : 0;
        _$jscoverage['/format.js'].lineData[202]++;
        current = locale.eras[value];
        _$jscoverage['/format.js'].lineData[203]++;
        break;
      case 'y':
        _$jscoverage['/format.js'].lineData[205]++;
        value = calendar.getYear();
        _$jscoverage['/format.js'].lineData[206]++;
        if (visit45_206_1(value <= 0)) {
          _$jscoverage['/format.js'].lineData[207]++;
          value = 1 - value;
        }
        _$jscoverage['/format.js'].lineData[209]++;
        current = (zeroPaddingNumber(value, 2, visit46_209_1(count != 2) ? MAX_VALUE : 2));
        _$jscoverage['/format.js'].lineData[210]++;
        break;
      case 'M':
        _$jscoverage['/format.js'].lineData[212]++;
        value = calendar.getMonth();
        _$jscoverage['/format.js'].lineData[213]++;
        if (visit47_213_1(count >= 4)) {
          _$jscoverage['/format.js'].lineData[214]++;
          current = locale.months[value];
        } else {
          _$jscoverage['/format.js'].lineData[215]++;
          if (visit48_215_1(count == 3)) {
            _$jscoverage['/format.js'].lineData[216]++;
            current = locale.shortMonths[value];
          } else {
            _$jscoverage['/format.js'].lineData[218]++;
            current = zeroPaddingNumber(value + 1, count);
          }
        }
        _$jscoverage['/format.js'].lineData[220]++;
        break;
      case 'k':
        _$jscoverage['/format.js'].lineData[222]++;
        current = zeroPaddingNumber(visit49_222_1(calendar.getHourOfDay() || 24), count);
        _$jscoverage['/format.js'].lineData[224]++;
        break;
      case 'E':
        _$jscoverage['/format.js'].lineData[226]++;
        value = calendar.getDayOfWeek();
        _$jscoverage['/format.js'].lineData[227]++;
        current = visit50_227_1(count >= 4) ? locale.weekdays[value] : locale.shortWeekdays[value];
        _$jscoverage['/format.js'].lineData[230]++;
        break;
      case 'a':
        _$jscoverage['/format.js'].lineData[232]++;
        current = locale.ampms[visit51_232_1(calendar.getHourOfDay() >= 12) ? 1 : 0];
        _$jscoverage['/format.js'].lineData[235]++;
        break;
      case 'h':
        _$jscoverage['/format.js'].lineData[237]++;
        current = zeroPaddingNumber(visit52_238_1(calendar.getHourOfDay() % 12 || 12), count);
        _$jscoverage['/format.js'].lineData[239]++;
        break;
      case 'K':
        _$jscoverage['/format.js'].lineData[241]++;
        current = zeroPaddingNumber(calendar.getHourOfDay() % 12, count);
        _$jscoverage['/format.js'].lineData[243]++;
        break;
      case 'Z':
        _$jscoverage['/format.js'].lineData[245]++;
        var offset = calendar.getTimezoneOffset();
        _$jscoverage['/format.js'].lineData[246]++;
        var parts = [visit53_246_1(offset < 0) ? '-' : '+'];
        _$jscoverage['/format.js'].lineData[247]++;
        offset = Math.abs(offset);
        _$jscoverage['/format.js'].lineData[248]++;
        parts.push(zeroPaddingNumber(Math.floor(offset / 60) % 100, 2), zeroPaddingNumber(offset % 60, 2));
        _$jscoverage['/format.js'].lineData[250]++;
        current = parts.join('');
        _$jscoverage['/format.js'].lineData[251]++;
        break;
      default:
        _$jscoverage['/format.js'].lineData[262]++;
        var index = calendarIndexMap[field];
        _$jscoverage['/format.js'].lineData[263]++;
        value = calendar.get(index);
        _$jscoverage['/format.js'].lineData[264]++;
        current = zeroPaddingNumber(value, count);
    }
    _$jscoverage['/format.js'].lineData[266]++;
    return current;
  }
  _$jscoverage['/format.js'].lineData[269]++;
  function matchField(dateStr, startIndex, matches) {
    _$jscoverage['/format.js'].functionData[7]++;
    _$jscoverage['/format.js'].lineData[270]++;
    var matchedLen = -1, index = -1, i, len = matches.length;
    _$jscoverage['/format.js'].lineData[274]++;
    for (i = 0; visit54_274_1(i < len); i++) {
      _$jscoverage['/format.js'].lineData[275]++;
      var m = matches[i];
      _$jscoverage['/format.js'].lineData[276]++;
      var mLen = m.length;
      _$jscoverage['/format.js'].lineData[277]++;
      if (visit55_277_1(visit56_277_2(mLen > matchedLen) && matchPartString(dateStr, startIndex, m, mLen))) {
        _$jscoverage['/format.js'].lineData[279]++;
        matchedLen = mLen;
        _$jscoverage['/format.js'].lineData[280]++;
        index = i;
      }
    }
    _$jscoverage['/format.js'].lineData[283]++;
    return visit57_283_1(index >= 0) ? {
  value: index, 
  startIndex: startIndex + matchedLen} : null;
  }
  _$jscoverage['/format.js'].lineData[289]++;
  function matchPartString(dateStr, startIndex, match, mLen) {
    _$jscoverage['/format.js'].functionData[8]++;
    _$jscoverage['/format.js'].lineData[290]++;
    for (var i = 0; visit58_290_1(i < mLen); i++) {
      _$jscoverage['/format.js'].lineData[291]++;
      if (visit59_291_1(dateStr.charAt(startIndex + i) != match.charAt(i))) {
        _$jscoverage['/format.js'].lineData[292]++;
        return false;
      }
    }
    _$jscoverage['/format.js'].lineData[295]++;
    return true;
  }
  _$jscoverage['/format.js'].lineData[298]++;
  function getLeadingNumberLen(str) {
    _$jscoverage['/format.js'].functionData[9]++;
    _$jscoverage['/format.js'].lineData[299]++;
    var i, c, len = str.length;
    _$jscoverage['/format.js'].lineData[301]++;
    for (i = 0; visit60_301_1(i < len); i++) {
      _$jscoverage['/format.js'].lineData[302]++;
      c = str.charAt(i);
      _$jscoverage['/format.js'].lineData[303]++;
      if (visit61_303_1(visit62_303_2(c < '0') || visit63_303_3(c > '9'))) {
        _$jscoverage['/format.js'].lineData[304]++;
        break;
      }
    }
    _$jscoverage['/format.js'].lineData[307]++;
    return i;
  }
  _$jscoverage['/format.js'].lineData[310]++;
  function matchNumber(dateStr, startIndex, count, obeyCount) {
    _$jscoverage['/format.js'].functionData[10]++;
    _$jscoverage['/format.js'].lineData[311]++;
    var str = dateStr, n;
    _$jscoverage['/format.js'].lineData[312]++;
    if (visit64_312_1(obeyCount)) {
      _$jscoverage['/format.js'].lineData[313]++;
      if (visit65_313_1(dateStr.length <= startIndex + count)) {
        _$jscoverage['/format.js'].lineData[314]++;
        return null;
      }
      _$jscoverage['/format.js'].lineData[316]++;
      str = dateStr.substring(startIndex, count);
      _$jscoverage['/format.js'].lineData[317]++;
      if (visit66_317_1(!str.match(/^\d+$/))) {
        _$jscoverage['/format.js'].lineData[318]++;
        return null;
      }
    } else {
      _$jscoverage['/format.js'].lineData[321]++;
      str = str.substring(startIndex);
    }
    _$jscoverage['/format.js'].lineData[323]++;
    n = parseInt(str, 10);
    _$jscoverage['/format.js'].lineData[324]++;
    if (visit67_324_1(isNaN(n))) {
      _$jscoverage['/format.js'].lineData[325]++;
      return null;
    }
    _$jscoverage['/format.js'].lineData[327]++;
    return {
  value: n, 
  startIndex: startIndex + getLeadingNumberLen(str)};
  }
  _$jscoverage['/format.js'].lineData[333]++;
  function parseField(calendar, dateStr, startIndex, field, count, locale, obeyCount, tmp) {
    _$jscoverage['/format.js'].functionData[11]++;
    _$jscoverage['/format.js'].lineData[334]++;
    var match, year, hour;
    _$jscoverage['/format.js'].lineData[335]++;
    if (visit68_335_1(dateStr.length <= startIndex)) {
      _$jscoverage['/format.js'].lineData[336]++;
      return startIndex;
    }
    _$jscoverage['/format.js'].lineData[338]++;
    switch (field) {
      case 'G':
        _$jscoverage['/format.js'].lineData[340]++;
        if (visit69_340_1(match = matchField(dateStr, startIndex, locale.eras))) {
          _$jscoverage['/format.js'].lineData[341]++;
          if (visit70_341_1(calendar.isSetYear())) {
            _$jscoverage['/format.js'].lineData[342]++;
            if (visit71_342_1(match.value == 0)) {
              _$jscoverage['/format.js'].lineData[343]++;
              year = calendar.getYear();
              _$jscoverage['/format.js'].lineData[344]++;
              calendar.setYear(1 - year);
            }
          } else {
            _$jscoverage['/format.js'].lineData[347]++;
            tmp.era = match.value;
          }
        }
        _$jscoverage['/format.js'].lineData[350]++;
        break;
      case 'y':
        _$jscoverage['/format.js'].lineData[352]++;
        if (visit72_352_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[353]++;
          year = match.value;
          _$jscoverage['/format.js'].lineData[354]++;
          if (visit73_354_1('era' in tmp)) {
            _$jscoverage['/format.js'].lineData[355]++;
            if (visit74_355_1(tmp.era === 0)) {
              _$jscoverage['/format.js'].lineData[356]++;
              year = 1 - year;
            }
          }
          _$jscoverage['/format.js'].lineData[359]++;
          calendar.setYear(year);
        }
        _$jscoverage['/format.js'].lineData[361]++;
        break;
      case 'M':
        _$jscoverage['/format.js'].lineData[363]++;
        var month;
        _$jscoverage['/format.js'].lineData[364]++;
        if (visit75_364_1(count >= 3)) {
          _$jscoverage['/format.js'].lineData[365]++;
          if (visit76_365_1(match = matchField(dateStr, startIndex, locale[visit77_365_2(count == 3) ? 'shortMonths' : 'months']))) {
            _$jscoverage['/format.js'].lineData[367]++;
            month = match.value;
          }
        } else {
          _$jscoverage['/format.js'].lineData[370]++;
          if (visit78_370_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
            _$jscoverage['/format.js'].lineData[371]++;
            month = match.value - 1;
          }
        }
        _$jscoverage['/format.js'].lineData[374]++;
        if (visit79_374_1(match)) {
          _$jscoverage['/format.js'].lineData[375]++;
          calendar.setMonth(month);
        }
        _$jscoverage['/format.js'].lineData[377]++;
        break;
      case 'k':
        _$jscoverage['/format.js'].lineData[379]++;
        if (visit80_379_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[380]++;
          calendar.setHourOfDay(match.value % 24);
        }
        _$jscoverage['/format.js'].lineData[382]++;
        break;
      case 'E':
        _$jscoverage['/format.js'].lineData[384]++;
        if (visit81_384_1(match = matchField(dateStr, startIndex, locale[visit82_384_2(count > 3) ? 'weekdays' : 'shortWeekdays']))) {
          _$jscoverage['/format.js'].lineData[387]++;
          calendar.setDayOfWeek(match.value);
        }
        _$jscoverage['/format.js'].lineData[389]++;
        break;
      case 'a':
        _$jscoverage['/format.js'].lineData[391]++;
        if (visit83_391_1(match = matchField(dateStr, startIndex, locale.ampms))) {
          _$jscoverage['/format.js'].lineData[392]++;
          if (visit84_392_1(calendar.isSetHourOfDay())) {
            _$jscoverage['/format.js'].lineData[393]++;
            if (visit85_393_1(match.value)) {
              _$jscoverage['/format.js'].lineData[394]++;
              hour = calendar.getHourOfDay();
              _$jscoverage['/format.js'].lineData[395]++;
              if (visit86_395_1(hour < 12)) {
                _$jscoverage['/format.js'].lineData[396]++;
                calendar.setHourOfDay((hour + 12) % 24);
              }
            }
          } else {
            _$jscoverage['/format.js'].lineData[400]++;
            tmp.ampm = match.value;
          }
        }
        _$jscoverage['/format.js'].lineData[403]++;
        break;
      case 'h':
        _$jscoverage['/format.js'].lineData[405]++;
        if (visit87_405_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[406]++;
          hour = match.value %= 12;
          _$jscoverage['/format.js'].lineData[407]++;
          if (visit88_407_1(tmp.ampm)) {
            _$jscoverage['/format.js'].lineData[408]++;
            hour += 12;
          }
          _$jscoverage['/format.js'].lineData[410]++;
          calendar.setHourOfDay(hour);
        }
        _$jscoverage['/format.js'].lineData[412]++;
        break;
      case 'K':
        _$jscoverage['/format.js'].lineData[414]++;
        if (visit89_414_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[415]++;
          hour = match.value;
          _$jscoverage['/format.js'].lineData[416]++;
          if (visit90_416_1(tmp.ampm)) {
            _$jscoverage['/format.js'].lineData[417]++;
            hour += 12;
          }
          _$jscoverage['/format.js'].lineData[419]++;
          calendar.setHourOfDay(hour);
        }
        _$jscoverage['/format.js'].lineData[421]++;
        break;
      case 'Z':
        _$jscoverage['/format.js'].lineData[423]++;
        if (visit91_423_1(dateStr)) {
          _$jscoverage['/format.js'].lineData[424]++;
          var sign = 1, zoneChar = dateStr.charAt(startIndex);
        }
        _$jscoverage['/format.js'].lineData[426]++;
        if (visit92_426_1(zoneChar == '-')) {
          _$jscoverage['/format.js'].lineData[427]++;
          sign = -1;
          _$jscoverage['/format.js'].lineData[428]++;
          startIndex++;
        } else {
          _$jscoverage['/format.js'].lineData[429]++;
          if (visit93_429_1(zoneChar == '+')) {
            _$jscoverage['/format.js'].lineData[430]++;
            startIndex++;
          } else {
            _$jscoverage['/format.js'].lineData[432]++;
            break;
          }
        }
        _$jscoverage['/format.js'].lineData[434]++;
        if (visit94_434_1(match = matchNumber(dateStr, startIndex, 2, true))) {
          _$jscoverage['/format.js'].lineData[435]++;
          var zoneOffset = match.value * 60;
          _$jscoverage['/format.js'].lineData[436]++;
          startIndex = match.startIndex;
          _$jscoverage['/format.js'].lineData[437]++;
          if (visit95_437_1(match = matchNumber(dateStr, startIndex, 2, true))) {
            _$jscoverage['/format.js'].lineData[438]++;
            zoneOffset += match.value;
          }
          _$jscoverage['/format.js'].lineData[440]++;
          calendar.setTimezoneOffset(zoneOffset);
        }
        _$jscoverage['/format.js'].lineData[442]++;
        break;
      default:
        _$jscoverage['/format.js'].lineData[453]++;
        if (visit96_453_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[454]++;
          var index = calendarIndexMap[field];
          _$jscoverage['/format.js'].lineData[455]++;
          calendar.set(index, match.value);
        }
    }
    _$jscoverage['/format.js'].lineData[458]++;
    if (visit97_458_1(match)) {
      _$jscoverage['/format.js'].lineData[459]++;
      startIndex = match.startIndex;
    }
    _$jscoverage['/format.js'].lineData[461]++;
    return startIndex;
  }
  _$jscoverage['/format.js'].lineData[464]++;
  DateTimeFormat.prototype = {
  format: function(calendar) {
  _$jscoverage['/format.js'].functionData[12]++;
  _$jscoverage['/format.js'].lineData[466]++;
  var time = calendar.getTime();
  _$jscoverage['/format.js'].lineData[467]++;
  calendar = new GregorianCalendar(this.timezoneOffset, this.locale);
  _$jscoverage['/format.js'].lineData[468]++;
  calendar.setTime(time);
  _$jscoverage['/format.js'].lineData[469]++;
  var i, ret = [], pattern = this.pattern, len = pattern.length;
  _$jscoverage['/format.js'].lineData[473]++;
  for (i = 0; visit98_473_1(i < len); i++) {
    _$jscoverage['/format.js'].lineData[474]++;
    var comp = pattern[i];
    _$jscoverage['/format.js'].lineData[475]++;
    if (visit99_475_1(comp.text)) {
      _$jscoverage['/format.js'].lineData[476]++;
      ret.push(comp.text);
    } else {
      _$jscoverage['/format.js'].lineData[477]++;
      if (visit100_477_1('field' in comp)) {
        _$jscoverage['/format.js'].lineData[478]++;
        ret.push(formatField(comp.field, comp.count, this.locale, calendar));
      }
    }
  }
  _$jscoverage['/format.js'].lineData[481]++;
  return ret.join('');
}, 
  parse: function(dateStr) {
  _$jscoverage['/format.js'].functionData[13]++;
  _$jscoverage['/format.js'].lineData[485]++;
  var calendar = new GregorianCalendar(this.timezoneOffset, this.locale), i, j, tmp = {}, obeyCount = false, dateStrLen = dateStr.length, errorIndex = -1, startIndex = 0, oldStartIndex = 0, pattern = this.pattern, len = pattern.length;
  _$jscoverage['/format.js'].lineData[497]++;
  loopPattern:
    {
      _$jscoverage['/format.js'].lineData[498]++;
      for (i = 0; visit101_498_1(visit102_498_2(errorIndex < 0) && visit103_498_3(i < len)); i++) {
        _$jscoverage['/format.js'].lineData[499]++;
        var comp = pattern[i], text, textLen;
        _$jscoverage['/format.js'].lineData[500]++;
        oldStartIndex = startIndex;
        _$jscoverage['/format.js'].lineData[501]++;
        if (visit104_501_1(text = comp.text)) {
          _$jscoverage['/format.js'].lineData[502]++;
          textLen = text.length;
          _$jscoverage['/format.js'].lineData[503]++;
          if (visit105_503_1((textLen + startIndex) > dateStrLen)) {
            _$jscoverage['/format.js'].lineData[504]++;
            errorIndex = startIndex;
          } else {
            _$jscoverage['/format.js'].lineData[506]++;
            for (j = 0; visit106_506_1(j < textLen); j++) {
              _$jscoverage['/format.js'].lineData[507]++;
              if (visit107_507_1(text.charAt(j) != dateStr.charAt(j + startIndex))) {
                _$jscoverage['/format.js'].lineData[508]++;
                errorIndex = startIndex;
                _$jscoverage['/format.js'].lineData[509]++;
                break loopPattern;
              }
            }
            _$jscoverage['/format.js'].lineData[512]++;
            startIndex += textLen;
          }
        } else {
          _$jscoverage['/format.js'].lineData[514]++;
          if (visit108_514_1('field' in comp)) {
            _$jscoverage['/format.js'].lineData[515]++;
            obeyCount = false;
            _$jscoverage['/format.js'].lineData[516]++;
            var nextComp = pattern[i + 1];
            _$jscoverage['/format.js'].lineData[517]++;
            if (visit109_517_1(nextComp)) {
              _$jscoverage['/format.js'].lineData[518]++;
              if (visit110_518_1('field' in nextComp)) {
                _$jscoverage['/format.js'].lineData[519]++;
                obeyCount = true;
              } else {
                _$jscoverage['/format.js'].lineData[521]++;
                var c = nextComp.text.charAt(0);
                _$jscoverage['/format.js'].lineData[522]++;
                if (visit111_522_1(visit112_522_2(c >= '0') && visit113_522_3(c <= '9'))) {
                  _$jscoverage['/format.js'].lineData[523]++;
                  obeyCount = true;
                }
              }
            }
            _$jscoverage['/format.js'].lineData[527]++;
            startIndex = parseField(calendar, dateStr, startIndex, comp.field, comp.count, this.locale, obeyCount, tmp);
            _$jscoverage['/format.js'].lineData[535]++;
            if (visit114_535_1(startIndex == oldStartIndex)) {
              _$jscoverage['/format.js'].lineData[536]++;
              errorIndex = startIndex;
            }
          }
        }
      }
    }
  _$jscoverage['/format.js'].lineData[542]++;
  if (visit115_542_1(errorIndex >= 0)) {
    _$jscoverage['/format.js'].lineData[543]++;
    logger.error('error when parsing date');
    _$jscoverage['/format.js'].lineData[544]++;
    logger.error(dateStr);
    _$jscoverage['/format.js'].lineData[545]++;
    logger.error(dateStr.substring(0, errorIndex) + '^');
    _$jscoverage['/format.js'].lineData[546]++;
    return undefined;
  }
  _$jscoverage['/format.js'].lineData[548]++;
  return calendar;
}};
  _$jscoverage['/format.js'].lineData[552]++;
  var DateTimeStyle = DateTimeFormat.Style = {
  FULL: 0, 
  LONG: 1, 
  MEDIUM: 2, 
  SHORT: 3};
  _$jscoverage['/format.js'].lineData[559]++;
  S.mix(DateTimeFormat, {
  getInstance: function(locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[14]++;
  _$jscoverage['/format.js'].lineData[561]++;
  return this.getDateTimeInstance(DateTimeStyle.SHORT, DateTimeStyle.SHORT, locale, timeZoneOffset);
}, 
  'getDateInstance': function(dateStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[15]++;
  _$jscoverage['/format.js'].lineData[564]++;
  return this.getDateTimeInstance(dateStyle, undefined, locale, timeZoneOffset);
}, 
  getDateTimeInstance: function(dateStyle, timeStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[16]++;
  _$jscoverage['/format.js'].lineData[567]++;
  locale = visit116_567_1(locale || defaultLocale);
  _$jscoverage['/format.js'].lineData[568]++;
  var datePattern = '';
  _$jscoverage['/format.js'].lineData[569]++;
  if (visit117_569_1(dateStyle !== undefined)) {
    _$jscoverage['/format.js'].lineData[570]++;
    datePattern = locale.datePatterns[dateStyle];
  }
  _$jscoverage['/format.js'].lineData[572]++;
  var timePattern = '';
  _$jscoverage['/format.js'].lineData[573]++;
  if (visit118_573_1(timeStyle !== undefined)) {
    _$jscoverage['/format.js'].lineData[574]++;
    timePattern = locale.timePatterns[timeStyle];
  }
  _$jscoverage['/format.js'].lineData[576]++;
  var pattern = datePattern;
  _$jscoverage['/format.js'].lineData[577]++;
  if (visit119_577_1(timePattern)) {
    _$jscoverage['/format.js'].lineData[578]++;
    if (visit120_578_1(datePattern)) {
      _$jscoverage['/format.js'].lineData[579]++;
      pattern = S.substitute(locale.dateTimePattern, {
  date: datePattern, 
  time: timePattern});
    } else {
      _$jscoverage['/format.js'].lineData[584]++;
      pattern = timePattern;
    }
  }
  _$jscoverage['/format.js'].lineData[587]++;
  return new DateTimeFormat(pattern, locale, timeZoneOffset);
}, 
  'getTimeInstance': function(timeStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[17]++;
  _$jscoverage['/format.js'].lineData[590]++;
  return this.getDateTimeInstance(undefined, timeStyle, locale, timeZoneOffset);
}});
  _$jscoverage['/format.js'].lineData[594]++;
  return DateTimeFormat;
}, {
  requires: ['date/gregorian', 'i18n!date']});
