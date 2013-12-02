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
if (! _$jscoverage['/mvc/router.js']) {
  _$jscoverage['/mvc/router.js'] = {};
  _$jscoverage['/mvc/router.js'].lineData = [];
  _$jscoverage['/mvc/router.js'].lineData[6] = 0;
  _$jscoverage['/mvc/router.js'].lineData[7] = 0;
  _$jscoverage['/mvc/router.js'].lineData[8] = 0;
  _$jscoverage['/mvc/router.js'].lineData[9] = 0;
  _$jscoverage['/mvc/router.js'].lineData[23] = 0;
  _$jscoverage['/mvc/router.js'].lineData[24] = 0;
  _$jscoverage['/mvc/router.js'].lineData[25] = 0;
  _$jscoverage['/mvc/router.js'].lineData[26] = 0;
  _$jscoverage['/mvc/router.js'].lineData[28] = 0;
  _$jscoverage['/mvc/router.js'].lineData[29] = 0;
  _$jscoverage['/mvc/router.js'].lineData[30] = 0;
  _$jscoverage['/mvc/router.js'].lineData[31] = 0;
  _$jscoverage['/mvc/router.js'].lineData[34] = 0;
  _$jscoverage['/mvc/router.js'].lineData[37] = 0;
  _$jscoverage['/mvc/router.js'].lineData[47] = 0;
  _$jscoverage['/mvc/router.js'].lineData[52] = 0;
  _$jscoverage['/mvc/router.js'].lineData[53] = 0;
  _$jscoverage['/mvc/router.js'].lineData[54] = 0;
  _$jscoverage['/mvc/router.js'].lineData[55] = 0;
  _$jscoverage['/mvc/router.js'].lineData[56] = 0;
  _$jscoverage['/mvc/router.js'].lineData[57] = 0;
  _$jscoverage['/mvc/router.js'].lineData[59] = 0;
  _$jscoverage['/mvc/router.js'].lineData[63] = 0;
  _$jscoverage['/mvc/router.js'].lineData[64] = 0;
  _$jscoverage['/mvc/router.js'].lineData[67] = 0;
  _$jscoverage['/mvc/router.js'].lineData[68] = 0;
  _$jscoverage['/mvc/router.js'].lineData[71] = 0;
  _$jscoverage['/mvc/router.js'].lineData[72] = 0;
  _$jscoverage['/mvc/router.js'].lineData[73] = 0;
  _$jscoverage['/mvc/router.js'].lineData[75] = 0;
  _$jscoverage['/mvc/router.js'].lineData[78] = 0;
  _$jscoverage['/mvc/router.js'].lineData[79] = 0;
  _$jscoverage['/mvc/router.js'].lineData[80] = 0;
  _$jscoverage['/mvc/router.js'].lineData[82] = 0;
  _$jscoverage['/mvc/router.js'].lineData[85] = 0;
  _$jscoverage['/mvc/router.js'].lineData[86] = 0;
  _$jscoverage['/mvc/router.js'].lineData[89] = 0;
  _$jscoverage['/mvc/router.js'].lineData[90] = 0;
  _$jscoverage['/mvc/router.js'].lineData[91] = 0;
  _$jscoverage['/mvc/router.js'].lineData[93] = 0;
  _$jscoverage['/mvc/router.js'].lineData[97] = 0;
  _$jscoverage['/mvc/router.js'].lineData[98] = 0;
  _$jscoverage['/mvc/router.js'].lineData[99] = 0;
  _$jscoverage['/mvc/router.js'].lineData[100] = 0;
  _$jscoverage['/mvc/router.js'].lineData[105] = 0;
  _$jscoverage['/mvc/router.js'].lineData[106] = 0;
  _$jscoverage['/mvc/router.js'].lineData[112] = 0;
  _$jscoverage['/mvc/router.js'].lineData[113] = 0;
  _$jscoverage['/mvc/router.js'].lineData[125] = 0;
  _$jscoverage['/mvc/router.js'].lineData[126] = 0;
  _$jscoverage['/mvc/router.js'].lineData[127] = 0;
  _$jscoverage['/mvc/router.js'].lineData[130] = 0;
  _$jscoverage['/mvc/router.js'].lineData[131] = 0;
  _$jscoverage['/mvc/router.js'].lineData[134] = 0;
  _$jscoverage['/mvc/router.js'].lineData[135] = 0;
  _$jscoverage['/mvc/router.js'].lineData[142] = 0;
  _$jscoverage['/mvc/router.js'].lineData[144] = 0;
  _$jscoverage['/mvc/router.js'].lineData[146] = 0;
  _$jscoverage['/mvc/router.js'].lineData[147] = 0;
  _$jscoverage['/mvc/router.js'].lineData[148] = 0;
  _$jscoverage['/mvc/router.js'].lineData[149] = 0;
  _$jscoverage['/mvc/router.js'].lineData[150] = 0;
  _$jscoverage['/mvc/router.js'].lineData[152] = 0;
  _$jscoverage['/mvc/router.js'].lineData[156] = 0;
  _$jscoverage['/mvc/router.js'].lineData[160] = 0;
  _$jscoverage['/mvc/router.js'].lineData[161] = 0;
  _$jscoverage['/mvc/router.js'].lineData[162] = 0;
  _$jscoverage['/mvc/router.js'].lineData[163] = 0;
  _$jscoverage['/mvc/router.js'].lineData[164] = 0;
  _$jscoverage['/mvc/router.js'].lineData[165] = 0;
  _$jscoverage['/mvc/router.js'].lineData[166] = 0;
  _$jscoverage['/mvc/router.js'].lineData[167] = 0;
  _$jscoverage['/mvc/router.js'].lineData[171] = 0;
  _$jscoverage['/mvc/router.js'].lineData[172] = 0;
  _$jscoverage['/mvc/router.js'].lineData[173] = 0;
  _$jscoverage['/mvc/router.js'].lineData[174] = 0;
  _$jscoverage['/mvc/router.js'].lineData[176] = 0;
  _$jscoverage['/mvc/router.js'].lineData[178] = 0;
  _$jscoverage['/mvc/router.js'].lineData[182] = 0;
  _$jscoverage['/mvc/router.js'].lineData[183] = 0;
  _$jscoverage['/mvc/router.js'].lineData[186] = 0;
  _$jscoverage['/mvc/router.js'].lineData[192] = 0;
  _$jscoverage['/mvc/router.js'].lineData[193] = 0;
  _$jscoverage['/mvc/router.js'].lineData[194] = 0;
  _$jscoverage['/mvc/router.js'].lineData[195] = 0;
  _$jscoverage['/mvc/router.js'].lineData[200] = 0;
  _$jscoverage['/mvc/router.js'].lineData[201] = 0;
  _$jscoverage['/mvc/router.js'].lineData[208] = 0;
  _$jscoverage['/mvc/router.js'].lineData[209] = 0;
  _$jscoverage['/mvc/router.js'].lineData[210] = 0;
  _$jscoverage['/mvc/router.js'].lineData[213] = 0;
  _$jscoverage['/mvc/router.js'].lineData[217] = 0;
  _$jscoverage['/mvc/router.js'].lineData[218] = 0;
  _$jscoverage['/mvc/router.js'].lineData[220] = 0;
  _$jscoverage['/mvc/router.js'].lineData[224] = 0;
  _$jscoverage['/mvc/router.js'].lineData[225] = 0;
  _$jscoverage['/mvc/router.js'].lineData[226] = 0;
  _$jscoverage['/mvc/router.js'].lineData[230] = 0;
  _$jscoverage['/mvc/router.js'].lineData[237] = 0;
  _$jscoverage['/mvc/router.js'].lineData[238] = 0;
  _$jscoverage['/mvc/router.js'].lineData[248] = 0;
  _$jscoverage['/mvc/router.js'].lineData[249] = 0;
  _$jscoverage['/mvc/router.js'].lineData[252] = 0;
  _$jscoverage['/mvc/router.js'].lineData[254] = 0;
  _$jscoverage['/mvc/router.js'].lineData[256] = 0;
  _$jscoverage['/mvc/router.js'].lineData[257] = 0;
  _$jscoverage['/mvc/router.js'].lineData[259] = 0;
  _$jscoverage['/mvc/router.js'].lineData[260] = 0;
  _$jscoverage['/mvc/router.js'].lineData[263] = 0;
  _$jscoverage['/mvc/router.js'].lineData[264] = 0;
  _$jscoverage['/mvc/router.js'].lineData[266] = 0;
  _$jscoverage['/mvc/router.js'].lineData[269] = 0;
  _$jscoverage['/mvc/router.js'].lineData[277] = 0;
  _$jscoverage['/mvc/router.js'].lineData[287] = 0;
  _$jscoverage['/mvc/router.js'].lineData[288] = 0;
  _$jscoverage['/mvc/router.js'].lineData[289] = 0;
  _$jscoverage['/mvc/router.js'].lineData[290] = 0;
  _$jscoverage['/mvc/router.js'].lineData[291] = 0;
  _$jscoverage['/mvc/router.js'].lineData[293] = 0;
  _$jscoverage['/mvc/router.js'].lineData[296] = 0;
  _$jscoverage['/mvc/router.js'].lineData[297] = 0;
  _$jscoverage['/mvc/router.js'].lineData[298] = 0;
  _$jscoverage['/mvc/router.js'].lineData[299] = 0;
  _$jscoverage['/mvc/router.js'].lineData[302] = 0;
  _$jscoverage['/mvc/router.js'].lineData[309] = 0;
  _$jscoverage['/mvc/router.js'].lineData[311] = 0;
  _$jscoverage['/mvc/router.js'].lineData[312] = 0;
  _$jscoverage['/mvc/router.js'].lineData[313] = 0;
  _$jscoverage['/mvc/router.js'].lineData[314] = 0;
  _$jscoverage['/mvc/router.js'].lineData[315] = 0;
  _$jscoverage['/mvc/router.js'].lineData[332] = 0;
  _$jscoverage['/mvc/router.js'].lineData[333] = 0;
  _$jscoverage['/mvc/router.js'].lineData[334] = 0;
  _$jscoverage['/mvc/router.js'].lineData[368] = 0;
  _$jscoverage['/mvc/router.js'].lineData[370] = 0;
  _$jscoverage['/mvc/router.js'].lineData[371] = 0;
  _$jscoverage['/mvc/router.js'].lineData[372] = 0;
  _$jscoverage['/mvc/router.js'].lineData[373] = 0;
  _$jscoverage['/mvc/router.js'].lineData[374] = 0;
  _$jscoverage['/mvc/router.js'].lineData[375] = 0;
  _$jscoverage['/mvc/router.js'].lineData[376] = 0;
  _$jscoverage['/mvc/router.js'].lineData[378] = 0;
  _$jscoverage['/mvc/router.js'].lineData[380] = 0;
  _$jscoverage['/mvc/router.js'].lineData[381] = 0;
  _$jscoverage['/mvc/router.js'].lineData[383] = 0;
  _$jscoverage['/mvc/router.js'].lineData[385] = 0;
  _$jscoverage['/mvc/router.js'].lineData[396] = 0;
  _$jscoverage['/mvc/router.js'].lineData[397] = 0;
  _$jscoverage['/mvc/router.js'].lineData[410] = 0;
  _$jscoverage['/mvc/router.js'].lineData[411] = 0;
  _$jscoverage['/mvc/router.js'].lineData[412] = 0;
  _$jscoverage['/mvc/router.js'].lineData[413] = 0;
  _$jscoverage['/mvc/router.js'].lineData[414] = 0;
  _$jscoverage['/mvc/router.js'].lineData[419] = 0;
  _$jscoverage['/mvc/router.js'].lineData[421] = 0;
  _$jscoverage['/mvc/router.js'].lineData[422] = 0;
  _$jscoverage['/mvc/router.js'].lineData[424] = 0;
  _$jscoverage['/mvc/router.js'].lineData[427] = 0;
  _$jscoverage['/mvc/router.js'].lineData[430] = 0;
  _$jscoverage['/mvc/router.js'].lineData[431] = 0;
  _$jscoverage['/mvc/router.js'].lineData[444] = 0;
  _$jscoverage['/mvc/router.js'].lineData[446] = 0;
  _$jscoverage['/mvc/router.js'].lineData[447] = 0;
  _$jscoverage['/mvc/router.js'].lineData[451] = 0;
  _$jscoverage['/mvc/router.js'].lineData[453] = 0;
  _$jscoverage['/mvc/router.js'].lineData[459] = 0;
  _$jscoverage['/mvc/router.js'].lineData[460] = 0;
  _$jscoverage['/mvc/router.js'].lineData[462] = 0;
  _$jscoverage['/mvc/router.js'].lineData[464] = 0;
  _$jscoverage['/mvc/router.js'].lineData[470] = 0;
  _$jscoverage['/mvc/router.js'].lineData[471] = 0;
  _$jscoverage['/mvc/router.js'].lineData[473] = 0;
  _$jscoverage['/mvc/router.js'].lineData[474] = 0;
  _$jscoverage['/mvc/router.js'].lineData[476] = 0;
  _$jscoverage['/mvc/router.js'].lineData[485] = 0;
  _$jscoverage['/mvc/router.js'].lineData[486] = 0;
  _$jscoverage['/mvc/router.js'].lineData[487] = 0;
  _$jscoverage['/mvc/router.js'].lineData[493] = 0;
  _$jscoverage['/mvc/router.js'].lineData[495] = 0;
  _$jscoverage['/mvc/router.js'].lineData[496] = 0;
  _$jscoverage['/mvc/router.js'].lineData[500] = 0;
  _$jscoverage['/mvc/router.js'].lineData[502] = 0;
  _$jscoverage['/mvc/router.js'].lineData[508] = 0;
  _$jscoverage['/mvc/router.js'].lineData[509] = 0;
  _$jscoverage['/mvc/router.js'].lineData[511] = 0;
  _$jscoverage['/mvc/router.js'].lineData[512] = 0;
  _$jscoverage['/mvc/router.js'].lineData[517] = 0;
  _$jscoverage['/mvc/router.js'].lineData[518] = 0;
  _$jscoverage['/mvc/router.js'].lineData[527] = 0;
  _$jscoverage['/mvc/router.js'].lineData[528] = 0;
  _$jscoverage['/mvc/router.js'].lineData[529] = 0;
  _$jscoverage['/mvc/router.js'].lineData[530] = 0;
  _$jscoverage['/mvc/router.js'].lineData[534] = 0;
}
if (! _$jscoverage['/mvc/router.js'].functionData) {
  _$jscoverage['/mvc/router.js'].functionData = [];
  _$jscoverage['/mvc/router.js'].functionData[0] = 0;
  _$jscoverage['/mvc/router.js'].functionData[1] = 0;
  _$jscoverage['/mvc/router.js'].functionData[2] = 0;
  _$jscoverage['/mvc/router.js'].functionData[3] = 0;
  _$jscoverage['/mvc/router.js'].functionData[4] = 0;
  _$jscoverage['/mvc/router.js'].functionData[5] = 0;
  _$jscoverage['/mvc/router.js'].functionData[6] = 0;
  _$jscoverage['/mvc/router.js'].functionData[7] = 0;
  _$jscoverage['/mvc/router.js'].functionData[8] = 0;
  _$jscoverage['/mvc/router.js'].functionData[9] = 0;
  _$jscoverage['/mvc/router.js'].functionData[10] = 0;
  _$jscoverage['/mvc/router.js'].functionData[11] = 0;
  _$jscoverage['/mvc/router.js'].functionData[12] = 0;
  _$jscoverage['/mvc/router.js'].functionData[13] = 0;
  _$jscoverage['/mvc/router.js'].functionData[14] = 0;
  _$jscoverage['/mvc/router.js'].functionData[15] = 0;
  _$jscoverage['/mvc/router.js'].functionData[16] = 0;
  _$jscoverage['/mvc/router.js'].functionData[17] = 0;
  _$jscoverage['/mvc/router.js'].functionData[18] = 0;
  _$jscoverage['/mvc/router.js'].functionData[19] = 0;
  _$jscoverage['/mvc/router.js'].functionData[20] = 0;
  _$jscoverage['/mvc/router.js'].functionData[21] = 0;
  _$jscoverage['/mvc/router.js'].functionData[22] = 0;
  _$jscoverage['/mvc/router.js'].functionData[23] = 0;
  _$jscoverage['/mvc/router.js'].functionData[24] = 0;
  _$jscoverage['/mvc/router.js'].functionData[25] = 0;
  _$jscoverage['/mvc/router.js'].functionData[26] = 0;
  _$jscoverage['/mvc/router.js'].functionData[27] = 0;
  _$jscoverage['/mvc/router.js'].functionData[28] = 0;
  _$jscoverage['/mvc/router.js'].functionData[29] = 0;
  _$jscoverage['/mvc/router.js'].functionData[30] = 0;
  _$jscoverage['/mvc/router.js'].functionData[31] = 0;
  _$jscoverage['/mvc/router.js'].functionData[32] = 0;
}
if (! _$jscoverage['/mvc/router.js'].branchData) {
  _$jscoverage['/mvc/router.js'].branchData = {};
  _$jscoverage['/mvc/router.js'].branchData['20'] = [];
  _$jscoverage['/mvc/router.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['25'] = [];
  _$jscoverage['/mvc/router.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['28'] = [];
  _$jscoverage['/mvc/router.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['30'] = [];
  _$jscoverage['/mvc/router.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['53'] = [];
  _$jscoverage['/mvc/router.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['54'] = [];
  _$jscoverage['/mvc/router.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['72'] = [];
  _$jscoverage['/mvc/router.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['79'] = [];
  _$jscoverage['/mvc/router.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['90'] = [];
  _$jscoverage['/mvc/router.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['100'] = [];
  _$jscoverage['/mvc/router.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['147'] = [];
  _$jscoverage['/mvc/router.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['171'] = [];
  _$jscoverage['/mvc/router.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['176'] = [];
  _$jscoverage['/mvc/router.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['182'] = [];
  _$jscoverage['/mvc/router.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['187'] = [];
  _$jscoverage['/mvc/router.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['187'][2] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['188'] = [];
  _$jscoverage['/mvc/router.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['192'] = [];
  _$jscoverage['/mvc/router.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['194'] = [];
  _$jscoverage['/mvc/router.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['200'] = [];
  _$jscoverage['/mvc/router.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['217'] = [];
  _$jscoverage['/mvc/router.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['224'] = [];
  _$jscoverage['/mvc/router.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['252'] = [];
  _$jscoverage['/mvc/router.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['257'] = [];
  _$jscoverage['/mvc/router.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['259'] = [];
  _$jscoverage['/mvc/router.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['263'] = [];
  _$jscoverage['/mvc/router.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['288'] = [];
  _$jscoverage['/mvc/router.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['290'] = [];
  _$jscoverage['/mvc/router.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['374'] = [];
  _$jscoverage['/mvc/router.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['380'] = [];
  _$jscoverage['/mvc/router.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['410'] = [];
  _$jscoverage['/mvc/router.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['412'] = [];
  _$jscoverage['/mvc/router.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['413'] = [];
  _$jscoverage['/mvc/router.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['422'] = [];
  _$jscoverage['/mvc/router.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['425'] = [];
  _$jscoverage['/mvc/router.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['425'][2] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['430'] = [];
  _$jscoverage['/mvc/router.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['444'] = [];
  _$jscoverage['/mvc/router.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['446'] = [];
  _$jscoverage['/mvc/router.js'].branchData['446'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['447'] = [];
  _$jscoverage['/mvc/router.js'].branchData['447'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['451'] = [];
  _$jscoverage['/mvc/router.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['462'] = [];
  _$jscoverage['/mvc/router.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['464'] = [];
  _$jscoverage['/mvc/router.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['470'] = [];
  _$jscoverage['/mvc/router.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['471'] = [];
  _$jscoverage['/mvc/router.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['485'] = [];
  _$jscoverage['/mvc/router.js'].branchData['485'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['495'] = [];
  _$jscoverage['/mvc/router.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['508'] = [];
  _$jscoverage['/mvc/router.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['511'] = [];
  _$jscoverage['/mvc/router.js'].branchData['511'][1] = new BranchData();
}
_$jscoverage['/mvc/router.js'].branchData['511'][1].init(770, 12, 'opts.success');
function visit98_511_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['508'][1].init(680, 17, 'opts.triggerRoute');
function visit97_508_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['495'][1].init(22, 37, 'nativeHistory && supportNativeHistory');
function visit96_495_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['485'][1].init(920, 36, '!equalsIgnoreSlash(locPath, urlRoot)');
function visit95_485_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['485'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['471'][1].init(29, 35, 'equalsIgnoreSlash(locPath, urlRoot)');
function visit94_471_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['470'][1].init(234, 11, 'hashIsValid');
function visit93_470_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['464'][1].init(22, 20, 'supportNativeHistory');
function visit92_464_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['462'][1].init(580, 13, 'nativeHistory');
function visit91_462_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['451'][1].init(199, 18, 'opts.urlRoot || \'\'');
function visit90_451_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['447'][1].init(24, 30, 'opts.success && opts.success()');
function visit89_447_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['447'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['446'][1].init(49, 16, 'Router.__started');
function visit88_446_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['446'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['444'][1].init(20, 10, 'opts || {}');
function visit87_444_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['430'][1].init(985, 25, 'opts && opts.triggerRoute');
function visit86_430_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['425'][2].init(51, 6, 'ie < 8');
function visit85_425_2(result) {
  _$jscoverage['/mvc/router.js'].branchData['425'][2].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['425'][1].init(45, 12, 'ie && ie < 8');
function visit84_425_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['422'][1].init(75, 14, 'replaceHistory');
function visit83_422_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['413'][1].init(21, 44, 'Router.nativeHistory && supportNativeHistory');
function visit82_413_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['412'][1].init(118, 22, 'getFragment() !== path');
function visit81_412_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['410'][1].init(20, 10, 'opts || {}');
function visit80_410_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['380'][1].init(358, 5, 'match');
function visit79_380_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['374'][1].init(65, 15, 'path.match(reg)');
function visit78_374_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['290'][1].init(96, 28, 'typeof callback === \'string\'');
function visit77_290_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['288'][1].init(13, 30, 'typeof callback === \'function\'');
function visit76_288_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['263'][1].init(202, 2, 'g4');
function visit75_263_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['259'][1].init(89, 2, 'g2');
function visit74_259_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['257'][1].init(33, 8, 'g2 || g4');
function visit73_257_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['252'][1].init(67, 30, 'typeof callback === \'function\'');
function visit72_252_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['224'][1].init(4338, 10, 'finalParam');
function visit71_224_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['217'][1].init(3718, 12, 'exactlyMatch');
function visit70_217_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['200'][1].init(1108, 11, '!finalRoute');
function visit69_200_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['194'][1].init(281, 34, 'regStr.length > finalRegStr.length');
function visit68_194_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['192'][1].init(157, 27, 'm.length < finalMatchLength');
function visit67_192_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['188'][1].init(93, 28, 'finalMatchLength >= m.length');
function visit66_188_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['187'][2].init(425, 54, 'firstCaptureGroupIndex === finalFirstCaptureGroupIndex');
function visit65_187_2(result) {
  _$jscoverage['/mvc/router.js'].branchData['187'][2].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['187'][1].init(36, 122, 'firstCaptureGroupIndex === finalFirstCaptureGroupIndex && finalMatchLength >= m.length');
function visit64_187_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['182'][1].init(221, 52, 'firstCaptureGroupIndex > finalFirstCaptureGroupIndex');
function visit63_182_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['176'][1].init(1488, 6, 'regStr');
function visit62_176_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['171'][1].init(1286, 9, '!m.length');
function visit61_171_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['147'][1].init(33, 10, 'paramNames');
function visit60_147_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['100'][1].init(90, 13, 'str1 === str2');
function visit59_100_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['90'][1].init(13, 3, 'str');
function visit58_90_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['79'][1].init(13, 19, 'startWithSlash(str)');
function visit57_79_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['72'][1].init(13, 17, 'endWithSlash(str)');
function visit56_72_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['54'][1].init(49, 44, 'Router.nativeHistory && supportNativeHistory');
function visit55_54_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['53'][1].init(15, 20, 'url || location.href');
function visit54_53_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['30'][1].init(152, 9, 'r === \'(\'');
function visit53_30_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['28'][1].init(93, 10, 'r === \'\\\\\'');
function visit52_28_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['25'][1].init(39, 17, 'i < regStr.length');
function visit51_25_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['20'][1].init(375, 28, 'history && history.pushState');
function visit50_20_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/mvc/router.js'].functionData[0]++;
  _$jscoverage['/mvc/router.js'].lineData[7]++;
  var Attribute = require('attribute');
  _$jscoverage['/mvc/router.js'].lineData[8]++;
  var Node = require('node');
  _$jscoverage['/mvc/router.js'].lineData[9]++;
  var each = S.each, BREATH_INTERVAL = 100, grammar = /(:([\w\d]+))|(\\\*([\w\d]+))/g, allRoutes = [], win = S.Env.host, $ = Node.all, $win = $(win), ie = S.UA.ieMode, history = win.history, supportNativeHistory = !!(visit50_20_1(history && history.pushState)), ROUTER_MAP = '__routerMap';
  _$jscoverage['/mvc/router.js'].lineData[23]++;
  function findFirstCaptureGroupIndex(regStr) {
    _$jscoverage['/mvc/router.js'].functionData[1]++;
    _$jscoverage['/mvc/router.js'].lineData[24]++;
    var r, i;
    _$jscoverage['/mvc/router.js'].lineData[25]++;
    for (i = 0; visit51_25_1(i < regStr.length); i++) {
      _$jscoverage['/mvc/router.js'].lineData[26]++;
      r = regStr.charAt(i);
      _$jscoverage['/mvc/router.js'].lineData[28]++;
      if (visit52_28_1(r === '\\')) {
        _$jscoverage['/mvc/router.js'].lineData[29]++;
        i++;
      } else {
        _$jscoverage['/mvc/router.js'].lineData[30]++;
        if (visit53_30_1(r === '(')) {
          _$jscoverage['/mvc/router.js'].lineData[31]++;
          return i;
        }
      }
    }
    _$jscoverage['/mvc/router.js'].lineData[34]++;
    throw new Error('impossible to not to get capture group in kissy mvc route');
  }
  _$jscoverage['/mvc/router.js'].lineData[37]++;
  function getHash(url) {
    _$jscoverage['/mvc/router.js'].functionData[2]++;
    _$jscoverage['/mvc/router.js'].lineData[47]++;
    return new S.Uri(url).getFragment().replace(/^!/, '');
  }
  _$jscoverage['/mvc/router.js'].lineData[52]++;
  function getFragment(url) {
    _$jscoverage['/mvc/router.js'].functionData[3]++;
    _$jscoverage['/mvc/router.js'].lineData[53]++;
    url = visit54_53_1(url || location.href);
    _$jscoverage['/mvc/router.js'].lineData[54]++;
    if (visit55_54_1(Router.nativeHistory && supportNativeHistory)) {
      _$jscoverage['/mvc/router.js'].lineData[55]++;
      url = new S.Uri(url);
      _$jscoverage['/mvc/router.js'].lineData[56]++;
      var query = url.getQuery().toString();
      _$jscoverage['/mvc/router.js'].lineData[57]++;
      return url.getPath().substr(Router.urlRoot.length) + (query ? ('?' + query) : '');
    } else {
      _$jscoverage['/mvc/router.js'].lineData[59]++;
      return getHash(url);
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[63]++;
  function endWithSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[4]++;
    _$jscoverage['/mvc/router.js'].lineData[64]++;
    return S.endsWith(str, '/');
  }
  _$jscoverage['/mvc/router.js'].lineData[67]++;
  function startWithSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[5]++;
    _$jscoverage['/mvc/router.js'].lineData[68]++;
    return S.startsWith(str, '/');
  }
  _$jscoverage['/mvc/router.js'].lineData[71]++;
  function removeEndSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[6]++;
    _$jscoverage['/mvc/router.js'].lineData[72]++;
    if (visit56_72_1(endWithSlash(str))) {
      _$jscoverage['/mvc/router.js'].lineData[73]++;
      str = str.substring(0, str.length - 1);
    }
    _$jscoverage['/mvc/router.js'].lineData[75]++;
    return str;
  }
  _$jscoverage['/mvc/router.js'].lineData[78]++;
  function removeStartSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[7]++;
    _$jscoverage['/mvc/router.js'].lineData[79]++;
    if (visit57_79_1(startWithSlash(str))) {
      _$jscoverage['/mvc/router.js'].lineData[80]++;
      str = str.substring(1);
    }
    _$jscoverage['/mvc/router.js'].lineData[82]++;
    return str;
  }
  _$jscoverage['/mvc/router.js'].lineData[85]++;
  function addEndSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[8]++;
    _$jscoverage['/mvc/router.js'].lineData[86]++;
    return removeEndSlash(str) + '/';
  }
  _$jscoverage['/mvc/router.js'].lineData[89]++;
  function addStartSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[9]++;
    _$jscoverage['/mvc/router.js'].lineData[90]++;
    if (visit58_90_1(str)) {
      _$jscoverage['/mvc/router.js'].lineData[91]++;
      return '/' + removeStartSlash(str);
    } else {
      _$jscoverage['/mvc/router.js'].lineData[93]++;
      return str;
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[97]++;
  function equalsIgnoreSlash(str1, str2) {
    _$jscoverage['/mvc/router.js'].functionData[10]++;
    _$jscoverage['/mvc/router.js'].lineData[98]++;
    str1 = removeEndSlash(str1);
    _$jscoverage['/mvc/router.js'].lineData[99]++;
    str2 = removeEndSlash(str2);
    _$jscoverage['/mvc/router.js'].lineData[100]++;
    return visit59_100_1(str1 === str2);
  }
  _$jscoverage['/mvc/router.js'].lineData[105]++;
  function getFullPath(fragment) {
    _$jscoverage['/mvc/router.js'].functionData[11]++;
    _$jscoverage['/mvc/router.js'].lineData[106]++;
    return location.protocol + '//' + location.host + removeEndSlash(Router.urlRoot) + addStartSlash(fragment);
  }
  _$jscoverage['/mvc/router.js'].lineData[112]++;
  function dispatch() {
    _$jscoverage['/mvc/router.js'].functionData[12]++;
    _$jscoverage['/mvc/router.js'].lineData[113]++;
    var query, path, arg, finalRoute = 0, finalMatchLength = -1, finalRegStr = '', finalFirstCaptureGroupIndex = -1, finalCallback = 0, finalRouteName = '', pathUri = new S.Uri(getFragment()), finalParam = 0;
    _$jscoverage['/mvc/router.js'].lineData[125]++;
    path = pathUri.clone();
    _$jscoverage['/mvc/router.js'].lineData[126]++;
    path.query.reset();
    _$jscoverage['/mvc/router.js'].lineData[127]++;
    path = path.toString();
    _$jscoverage['/mvc/router.js'].lineData[130]++;
    each(allRoutes, function(route) {
  _$jscoverage['/mvc/router.js'].functionData[13]++;
  _$jscoverage['/mvc/router.js'].lineData[131]++;
  var routeRegs = route[ROUTER_MAP], exactlyMatch = 0;
  _$jscoverage['/mvc/router.js'].lineData[134]++;
  each(routeRegs, function(desc) {
  _$jscoverage['/mvc/router.js'].functionData[14]++;
  _$jscoverage['/mvc/router.js'].lineData[135]++;
  var reg = desc.reg, regStr = desc.regStr, paramNames = desc.paramNames, firstCaptureGroupIndex = -1, m, name = desc.name, callback = desc.callback;
  _$jscoverage['/mvc/router.js'].lineData[142]++;
  if ((m = path.match(reg))) {
    _$jscoverage['/mvc/router.js'].lineData[144]++;
    m.shift();
    _$jscoverage['/mvc/router.js'].lineData[146]++;
    var genParam = function() {
  _$jscoverage['/mvc/router.js'].functionData[15]++;
  _$jscoverage['/mvc/router.js'].lineData[147]++;
  if (visit60_147_1(paramNames)) {
    _$jscoverage['/mvc/router.js'].lineData[148]++;
    var params = {};
    _$jscoverage['/mvc/router.js'].lineData[149]++;
    each(m, function(sm, i) {
  _$jscoverage['/mvc/router.js'].functionData[16]++;
  _$jscoverage['/mvc/router.js'].lineData[150]++;
  params[paramNames[i]] = sm;
});
    _$jscoverage['/mvc/router.js'].lineData[152]++;
    return params;
  } else {
    _$jscoverage['/mvc/router.js'].lineData[156]++;
    return [].concat(m);
  }
};
    _$jscoverage['/mvc/router.js'].lineData[160]++;
    var upToFinal = function() {
  _$jscoverage['/mvc/router.js'].functionData[17]++;
  _$jscoverage['/mvc/router.js'].lineData[161]++;
  finalRegStr = regStr;
  _$jscoverage['/mvc/router.js'].lineData[162]++;
  finalFirstCaptureGroupIndex = firstCaptureGroupIndex;
  _$jscoverage['/mvc/router.js'].lineData[163]++;
  finalCallback = callback;
  _$jscoverage['/mvc/router.js'].lineData[164]++;
  finalParam = genParam();
  _$jscoverage['/mvc/router.js'].lineData[165]++;
  finalRoute = route;
  _$jscoverage['/mvc/router.js'].lineData[166]++;
  finalRouteName = name;
  _$jscoverage['/mvc/router.js'].lineData[167]++;
  finalMatchLength = m.length;
};
    _$jscoverage['/mvc/router.js'].lineData[171]++;
    if (visit61_171_1(!m.length)) {
      _$jscoverage['/mvc/router.js'].lineData[172]++;
      upToFinal();
      _$jscoverage['/mvc/router.js'].lineData[173]++;
      exactlyMatch = 1;
      _$jscoverage['/mvc/router.js'].lineData[174]++;
      return false;
    } else {
      _$jscoverage['/mvc/router.js'].lineData[176]++;
      if (visit62_176_1(regStr)) {
        _$jscoverage['/mvc/router.js'].lineData[178]++;
        firstCaptureGroupIndex = findFirstCaptureGroupIndex(regStr);
        _$jscoverage['/mvc/router.js'].lineData[182]++;
        if (visit63_182_1(firstCaptureGroupIndex > finalFirstCaptureGroupIndex)) {
          _$jscoverage['/mvc/router.js'].lineData[183]++;
          upToFinal();
        } else {
          _$jscoverage['/mvc/router.js'].lineData[186]++;
          if (visit64_187_1(visit65_187_2(firstCaptureGroupIndex === finalFirstCaptureGroupIndex) && visit66_188_1(finalMatchLength >= m.length))) {
            _$jscoverage['/mvc/router.js'].lineData[192]++;
            if (visit67_192_1(m.length < finalMatchLength)) {
              _$jscoverage['/mvc/router.js'].lineData[193]++;
              upToFinal();
            } else {
              _$jscoverage['/mvc/router.js'].lineData[194]++;
              if (visit68_194_1(regStr.length > finalRegStr.length)) {
                _$jscoverage['/mvc/router.js'].lineData[195]++;
                upToFinal();
              }
            }
          } else {
            _$jscoverage['/mvc/router.js'].lineData[200]++;
            if (visit69_200_1(!finalRoute)) {
              _$jscoverage['/mvc/router.js'].lineData[201]++;
              upToFinal();
            }
          }
        }
      } else {
        _$jscoverage['/mvc/router.js'].lineData[208]++;
        upToFinal();
        _$jscoverage['/mvc/router.js'].lineData[209]++;
        exactlyMatch = 1;
        _$jscoverage['/mvc/router.js'].lineData[210]++;
        return false;
      }
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[213]++;
  return undefined;
});
  _$jscoverage['/mvc/router.js'].lineData[217]++;
  if (visit70_217_1(exactlyMatch)) {
    _$jscoverage['/mvc/router.js'].lineData[218]++;
    return false;
  }
  _$jscoverage['/mvc/router.js'].lineData[220]++;
  return undefined;
});
    _$jscoverage['/mvc/router.js'].lineData[224]++;
    if (visit71_224_1(finalParam)) {
      _$jscoverage['/mvc/router.js'].lineData[225]++;
      query = pathUri.query.get();
      _$jscoverage['/mvc/router.js'].lineData[226]++;
      finalCallback.apply(finalRoute, [finalParam, query, {
  path: path, 
  url: location.href}]);
      _$jscoverage['/mvc/router.js'].lineData[230]++;
      arg = {
  name: finalRouteName, 
  'paths': finalParam, 
  path: path, 
  url: location.href, 
  query: query};
      _$jscoverage['/mvc/router.js'].lineData[237]++;
      finalRoute.fire('route:' + finalRouteName, arg);
      _$jscoverage['/mvc/router.js'].lineData[238]++;
      finalRoute.fire('route', arg);
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[248]++;
  function transformRouterReg(self, str, callback) {
    _$jscoverage['/mvc/router.js'].functionData[18]++;
    _$jscoverage['/mvc/router.js'].lineData[249]++;
    var name = str, paramNames = [];
    _$jscoverage['/mvc/router.js'].lineData[252]++;
    if (visit72_252_1(typeof callback === 'function')) {
      _$jscoverage['/mvc/router.js'].lineData[254]++;
      str = S.escapeRegExp(str);
      _$jscoverage['/mvc/router.js'].lineData[256]++;
      str = str.replace(grammar, function(m, g1, g2, g3, g4) {
  _$jscoverage['/mvc/router.js'].functionData[19]++;
  _$jscoverage['/mvc/router.js'].lineData[257]++;
  paramNames.push(visit73_257_1(g2 || g4));
  _$jscoverage['/mvc/router.js'].lineData[259]++;
  if (visit74_259_1(g2)) {
    _$jscoverage['/mvc/router.js'].lineData[260]++;
    return '([^/]+)';
  } else {
    _$jscoverage['/mvc/router.js'].lineData[263]++;
    if (visit75_263_1(g4)) {
      _$jscoverage['/mvc/router.js'].lineData[264]++;
      return '(.*)';
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[266]++;
  return undefined;
});
      _$jscoverage['/mvc/router.js'].lineData[269]++;
      return {
  name: name, 
  paramNames: paramNames, 
  reg: new RegExp('^' + str + '$'), 
  regStr: str, 
  callback: callback};
    } else {
      _$jscoverage['/mvc/router.js'].lineData[277]++;
      return {
  name: name, 
  reg: callback.reg, 
  callback: normFn(self, callback.callback)};
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[287]++;
  function normFn(self, callback) {
    _$jscoverage['/mvc/router.js'].functionData[20]++;
    _$jscoverage['/mvc/router.js'].lineData[288]++;
    if (visit76_288_1(typeof callback === 'function')) {
      _$jscoverage['/mvc/router.js'].lineData[289]++;
      return callback;
    } else {
      _$jscoverage['/mvc/router.js'].lineData[290]++;
      if (visit77_290_1(typeof callback === 'string')) {
        _$jscoverage['/mvc/router.js'].lineData[291]++;
        return self[callback];
      }
    }
    _$jscoverage['/mvc/router.js'].lineData[293]++;
    return callback;
  }
  _$jscoverage['/mvc/router.js'].lineData[296]++;
  function _afterRoutesChange(e) {
    _$jscoverage['/mvc/router.js'].functionData[21]++;
    _$jscoverage['/mvc/router.js'].lineData[297]++;
    var self = this;
    _$jscoverage['/mvc/router.js'].lineData[298]++;
    self[ROUTER_MAP] = {};
    _$jscoverage['/mvc/router.js'].lineData[299]++;
    self.addRoutes(e.newVal);
  }
  _$jscoverage['/mvc/router.js'].lineData[302]++;
  var Router;
  _$jscoverage['/mvc/router.js'].lineData[309]++;
  Router = Attribute.extend({
  constructor: function() {
  _$jscoverage['/mvc/router.js'].functionData[22]++;
  _$jscoverage['/mvc/router.js'].lineData[311]++;
  var self = this;
  _$jscoverage['/mvc/router.js'].lineData[312]++;
  self.callSuper.apply(self, arguments);
  _$jscoverage['/mvc/router.js'].lineData[313]++;
  self.on('afterRoutesChange', _afterRoutesChange, self);
  _$jscoverage['/mvc/router.js'].lineData[314]++;
  _afterRoutesChange.call(self, {
  newVal: self.get('routes')});
  _$jscoverage['/mvc/router.js'].lineData[315]++;
  allRoutes.push(self);
}, 
  addRoutes: function(routes) {
  _$jscoverage['/mvc/router.js'].functionData[23]++;
  _$jscoverage['/mvc/router.js'].lineData[332]++;
  var self = this;
  _$jscoverage['/mvc/router.js'].lineData[333]++;
  each(routes, function(callback, name) {
  _$jscoverage['/mvc/router.js'].functionData[24]++;
  _$jscoverage['/mvc/router.js'].lineData[334]++;
  self[ROUTER_MAP][name] = transformRouterReg(self, name, normFn(self, callback));
});
}}, {
  ATTRS: {
  routes: {}}, 
  hasRoute: function(path) {
  _$jscoverage['/mvc/router.js'].functionData[25]++;
  _$jscoverage['/mvc/router.js'].lineData[368]++;
  var match = 0;
  _$jscoverage['/mvc/router.js'].lineData[370]++;
  each(allRoutes, function(route) {
  _$jscoverage['/mvc/router.js'].functionData[26]++;
  _$jscoverage['/mvc/router.js'].lineData[371]++;
  var routeRegs = route[ROUTER_MAP];
  _$jscoverage['/mvc/router.js'].lineData[372]++;
  each(routeRegs, function(desc) {
  _$jscoverage['/mvc/router.js'].functionData[27]++;
  _$jscoverage['/mvc/router.js'].lineData[373]++;
  var reg = desc.reg;
  _$jscoverage['/mvc/router.js'].lineData[374]++;
  if (visit78_374_1(path.match(reg))) {
    _$jscoverage['/mvc/router.js'].lineData[375]++;
    match = 1;
    _$jscoverage['/mvc/router.js'].lineData[376]++;
    return false;
  }
  _$jscoverage['/mvc/router.js'].lineData[378]++;
  return undefined;
});
  _$jscoverage['/mvc/router.js'].lineData[380]++;
  if (visit79_380_1(match)) {
    _$jscoverage['/mvc/router.js'].lineData[381]++;
    return false;
  }
  _$jscoverage['/mvc/router.js'].lineData[383]++;
  return undefined;
});
  _$jscoverage['/mvc/router.js'].lineData[385]++;
  return !!match;
}, 
  removeRoot: function(url) {
  _$jscoverage['/mvc/router.js'].functionData[28]++;
  _$jscoverage['/mvc/router.js'].lineData[396]++;
  var u = new S.Uri(url);
  _$jscoverage['/mvc/router.js'].lineData[397]++;
  return u.getPath().substr(Router.urlRoot.length);
}, 
  navigate: function(path, opts) {
  _$jscoverage['/mvc/router.js'].functionData[29]++;
  _$jscoverage['/mvc/router.js'].lineData[410]++;
  opts = visit80_410_1(opts || {});
  _$jscoverage['/mvc/router.js'].lineData[411]++;
  var replaceHistory = opts.replaceHistory, normalizedPath;
  _$jscoverage['/mvc/router.js'].lineData[412]++;
  if (visit81_412_1(getFragment() !== path)) {
    _$jscoverage['/mvc/router.js'].lineData[413]++;
    if (visit82_413_1(Router.nativeHistory && supportNativeHistory)) {
      _$jscoverage['/mvc/router.js'].lineData[414]++;
      history[replaceHistory ? 'replaceState' : 'pushState']({}, '', getFullPath(path));
      _$jscoverage['/mvc/router.js'].lineData[419]++;
      dispatch();
    } else {
      _$jscoverage['/mvc/router.js'].lineData[421]++;
      normalizedPath = '#!' + path;
      _$jscoverage['/mvc/router.js'].lineData[422]++;
      if (visit83_422_1(replaceHistory)) {
        _$jscoverage['/mvc/router.js'].lineData[424]++;
        location.replace(normalizedPath + (visit84_425_1(ie && visit85_425_2(ie < 8)) ? Node.REPLACE_HISTORY : ''));
      } else {
        _$jscoverage['/mvc/router.js'].lineData[427]++;
        location.hash = normalizedPath;
      }
    }
  } else {
    _$jscoverage['/mvc/router.js'].lineData[430]++;
    if (visit86_430_1(opts && opts.triggerRoute)) {
      _$jscoverage['/mvc/router.js'].lineData[431]++;
      dispatch();
    }
  }
}, 
  start: function(opts) {
  _$jscoverage['/mvc/router.js'].functionData[30]++;
  _$jscoverage['/mvc/router.js'].lineData[444]++;
  opts = visit87_444_1(opts || {});
  _$jscoverage['/mvc/router.js'].lineData[446]++;
  if (visit88_446_1(Router.__started)) {
    _$jscoverage['/mvc/router.js'].lineData[447]++;
    return visit89_447_1(opts.success && opts.success());
  }
  _$jscoverage['/mvc/router.js'].lineData[451]++;
  opts.urlRoot = (visit90_451_1(opts.urlRoot || '')).replace(/\/$/, '');
  _$jscoverage['/mvc/router.js'].lineData[453]++;
  var urlRoot, nativeHistory = opts.nativeHistory, locPath = location.pathname, hash = getFragment(), hashIsValid = location.hash.match(/#!.+/);
  _$jscoverage['/mvc/router.js'].lineData[459]++;
  urlRoot = Router.urlRoot = opts.urlRoot;
  _$jscoverage['/mvc/router.js'].lineData[460]++;
  Router.nativeHistory = nativeHistory;
  _$jscoverage['/mvc/router.js'].lineData[462]++;
  if (visit91_462_1(nativeHistory)) {
    _$jscoverage['/mvc/router.js'].lineData[464]++;
    if (visit92_464_1(supportNativeHistory)) {
      _$jscoverage['/mvc/router.js'].lineData[470]++;
      if (visit93_470_1(hashIsValid)) {
        _$jscoverage['/mvc/router.js'].lineData[471]++;
        if (visit94_471_1(equalsIgnoreSlash(locPath, urlRoot))) {
          _$jscoverage['/mvc/router.js'].lineData[473]++;
          history.replaceState({}, '', getFullPath(hash));
          _$jscoverage['/mvc/router.js'].lineData[474]++;
          opts.triggerRoute = 1;
        } else {
          _$jscoverage['/mvc/router.js'].lineData[476]++;
          S.error('location path must be same with urlRoot!');
        }
      }
    } else {
      _$jscoverage['/mvc/router.js'].lineData[485]++;
      if (visit95_485_1(!equalsIgnoreSlash(locPath, urlRoot))) {
        _$jscoverage['/mvc/router.js'].lineData[486]++;
        location.replace(addEndSlash(urlRoot) + '#!' + hash);
        _$jscoverage['/mvc/router.js'].lineData[487]++;
        return undefined;
      }
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[493]++;
  setTimeout(function() {
  _$jscoverage['/mvc/router.js'].functionData[31]++;
  _$jscoverage['/mvc/router.js'].lineData[495]++;
  if (visit96_495_1(nativeHistory && supportNativeHistory)) {
    _$jscoverage['/mvc/router.js'].lineData[496]++;
    $win.on('popstate', dispatch);
  } else {
    _$jscoverage['/mvc/router.js'].lineData[500]++;
    $win.on('hashchange', dispatch);
    _$jscoverage['/mvc/router.js'].lineData[502]++;
    opts.triggerRoute = 1;
  }
  _$jscoverage['/mvc/router.js'].lineData[508]++;
  if (visit97_508_1(opts.triggerRoute)) {
    _$jscoverage['/mvc/router.js'].lineData[509]++;
    dispatch();
  }
  _$jscoverage['/mvc/router.js'].lineData[511]++;
  if (visit98_511_1(opts.success)) {
    _$jscoverage['/mvc/router.js'].lineData[512]++;
    opts.success();
  }
}, BREATH_INTERVAL);
  _$jscoverage['/mvc/router.js'].lineData[517]++;
  Router.__started = 1;
  _$jscoverage['/mvc/router.js'].lineData[518]++;
  return undefined;
}, 
  stop: function() {
  _$jscoverage['/mvc/router.js'].functionData[32]++;
  _$jscoverage['/mvc/router.js'].lineData[527]++;
  Router.__started = 0;
  _$jscoverage['/mvc/router.js'].lineData[528]++;
  $win.detach('popstate', dispatch);
  _$jscoverage['/mvc/router.js'].lineData[529]++;
  $win.detach('hashchange', dispatch);
  _$jscoverage['/mvc/router.js'].lineData[530]++;
  allRoutes = [];
}});
  _$jscoverage['/mvc/router.js'].lineData[534]++;
  return Router;
});
