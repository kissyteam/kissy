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
if (! _$jscoverage['/editor/clipboard.js']) {
  _$jscoverage['/editor/clipboard.js'] = {};
  _$jscoverage['/editor/clipboard.js'].lineData = [];
  _$jscoverage['/editor/clipboard.js'].lineData[6] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[7] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[8] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[9] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[10] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[11] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[12] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[18] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[19] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[20] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[21] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[24] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[26] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[31] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[34] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[36] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[37] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[38] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[39] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[40] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[41] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[42] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[46] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[47] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[52] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[54] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[64] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[66] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[67] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[68] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[69] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[70] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[71] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[72] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[77] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[78] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[79] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[83] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[85] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[86] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[89] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[92] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[97] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[98] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[99] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[101] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[105] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[106] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[107] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[110] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[113] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[115] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[118] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[122] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[123] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[124] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[126] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[127] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[128] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[136] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[138] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[144] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[147] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[148] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[152] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[153] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[156] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[158] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[163] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[164] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[165] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[168] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[172] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[177] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[179] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[180] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[183] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[185] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[197] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[199] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[202] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[203] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[204] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[206] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[211] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[212] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[214] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[218] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[220] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[222] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[224] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[228] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[231] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[233] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[238] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[239] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[242] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[243] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[246] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[248] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[249] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[252] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[260] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[261] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[265] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[272] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[275] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[277] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[279] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[283] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[285] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[289] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[291] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[294] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[298] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[305] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[306] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[307] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[308] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[309] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[311] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[312] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[313] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[314] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[315] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[316] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[319] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[321] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[322] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[323] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[329] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[330] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[332] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[333] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[335] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[337] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[338] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[340] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[342] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[343] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[346] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[349] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[353] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[354] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[359] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[360] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[364] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[366] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[367] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[368] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[370] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[376] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[377] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[381] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[384] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[385] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[387] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[388] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[389] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[393] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[396] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[397] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[398] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[399] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[401] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[402] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[404] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[406] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[407] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[408] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[410] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[413] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[414] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[417] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[420] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[426] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[428] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[430] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[431] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[435] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[436] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[439] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[440] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[441] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[442] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[443] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[444] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[445] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[446] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[447] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[456] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[461] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[464] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[465] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[467] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[468] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[469] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[470] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[471] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[477] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[478] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[479] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[480] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[483] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[484] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[485] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[486] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[487] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[494] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[497] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[498] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[499] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[500] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[501] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[503] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[505] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[506] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[507] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[508] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[509] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[511] = 0;
}
if (! _$jscoverage['/editor/clipboard.js'].functionData) {
  _$jscoverage['/editor/clipboard.js'].functionData = [];
  _$jscoverage['/editor/clipboard.js'].functionData[0] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[1] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[2] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[3] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[4] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[5] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[6] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[7] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[8] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[9] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[10] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[11] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[12] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[13] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[14] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[15] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[16] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[17] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[18] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[19] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[20] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[21] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[22] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[23] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[24] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[25] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[26] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[27] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[28] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[29] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[30] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[31] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[32] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[33] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[34] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[35] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[36] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[37] = 0;
}
if (! _$jscoverage['/editor/clipboard.js'].branchData) {
  _$jscoverage['/editor/clipboard.js'].branchData = {};
  _$jscoverage['/editor/clipboard.js'].branchData['14'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['39'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['40'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['42'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['52'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['66'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['85'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['89'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['89'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['89'][3] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['91'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['101'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['114'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['115'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['115'][3] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['123'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['138'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['152'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['163'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['179'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['214'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['214'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['224'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['238'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['242'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['246'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['275'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['309'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['309'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['321'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['330'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['332'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['335'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['337'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['340'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['342'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['359'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['364'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['364'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['366'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['376'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['381'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['384'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['387'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['399'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['406'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['413'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['435'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['467'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['470'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['479'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['497'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['500'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['506'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['506'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['508'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['508'][1] = new BranchData();
}
_$jscoverage['/editor/clipboard.js'].branchData['508'][1].init(104, 5, 'c.set');
function visit57_508_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['506'][1].init(310, 24, 'clipboardCommands[value]');
function visit56_506_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['506'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['500'][1].init(104, 5, 'c.get');
function visit55_500_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['497'][1].init(1463, 6, 'i >= 0');
function visit54_497_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['479'][1].init(90, 24, 'clipboardCommands[value]');
function visit53_479_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['470'][1].init(105, 32, 'i < clipboardCommandsList.length');
function visit52_470_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['467'][1].init(97, 22, '!contextmenu.__copyFix');
function visit51_467_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['435'][1].init(202, 1, '0');
function visit50_435_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['413'][1].init(873, 30, '!htmlMode && isPlainText(html)');
function visit49_413_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['406'][1].init(422, 59, 'html.indexOf(\'<br class="Apple-interchange-newline">\') > -1');
function visit48_406_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['399'][1].init(126, 29, 'html.indexOf(\'Apple-\') !== -1');
function visit47_399_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['387'][1].init(206, 29, 'html.indexOf(\'<br><br>\') > -1');
function visit46_387_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['384'][1].init(102, 8, 'UA.gecko');
function visit45_384_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['381'][1].init(1036, 8, 'UA.gecko');
function visit44_381_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['376'][1].init(509, 26, 'html.match(/<\\/div><div>/)');
function visit43_376_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['366'][1].init(82, 35, 'html.match(/<div>(?:<br>)?<\\/div>/)');
function visit42_366_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['364'][2].init(269, 26, 'html.indexOf(\'<div>\') > -1');
function visit41_364_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['364'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['364'][1].init(256, 39, 'UA.webkit && html.indexOf(\'<div>\') > -1');
function visit40_364_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['359'][1].init(160, 20, 'html.match(/^[^<]$/)');
function visit39_359_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['342'][1].init(48, 38, '!html.match(/^([^<]|<br( ?\\/)?>)*$/gi)');
function visit38_342_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['340'][1].init(566, 8, 'UA.gecko');
function visit37_340_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['337'][1].init(119, 98, '!html.match(/^([^<]|<br( ?\\/)?>)*$/gi) && !html.match(/^(<p>([^<]|<br( ?\\/)?>)*<\\/p>|(\\r\\n))*$/gi)');
function visit36_337_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['335'][1].init(274, 5, 'UA.ie');
function visit35_335_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['332'][1].init(91, 90, '!html.match(/^[^<]*$/g) && !html.match(/^(<div><br( ?\\/)?><\\/div>|<div>[^<]*<\\/div>)*$/gi)');
function visit34_332_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['330'][1].init(14, 9, 'UA.webkit');
function visit33_330_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['321'][1].init(64, 16, 'control.parent()');
function visit32_321_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['309'][2].init(131, 39, 'sel.getType() === KES.SELECTION_ELEMENT');
function visit31_309_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['309'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['309'][1].init(131, 93, '(sel.getType() === KES.SELECTION_ELEMENT) && (control = sel.getSelectedElement())');
function visit30_309_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['275'][1].init(586, 13, 'UA.ieMode > 7');
function visit29_275_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['246'][1].init(1340, 61, '/(class="?Mso|style="[^"]*\\bmso\\-|w:WordDocument)/.test(html)');
function visit28_246_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['242'][1].init(1203, 16, 're !== undefined');
function visit27_242_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['238'][1].init(1116, 12, 're === false');
function visit26_238_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['224'][1].init(686, 26, '!(html = cleanPaste(html))');
function visit25_224_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['214'][2].init(14, 94, '(bogusSpan = pasteBin.first()) && (bogusSpan.hasClass(\'Apple-style-span\'))');
function visit24_214_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['214'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['214'][1].init(-1, 108, 'UA.webkit && (bogusSpan = pasteBin.first()) && (bogusSpan.hasClass(\'Apple-style-span\'))');
function visit23_214_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['179'][1].init(1015, 9, 'UA.webkit');
function visit22_179_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['163'][1].init(388, 34, 'doc.getElementById(\'ke-paste-bin\')');
function visit21_163_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['152'][1].init(18, 26, 'this._isPreventBeforePaste');
function visit20_152_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['138'][1].init(87, 20, 'self._isPreventPaste');
function visit19_138_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['123'][1].init(48, 23, 'self._preventPasteTimer');
function visit18_123_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['115'][3].init(208, 19, 'ranges.length === 1');
function visit17_115_3(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['115'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['115'][2].init(208, 44, 'ranges.length === 1 && ranges[0].collapsed');
function visit16_115_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['115'][1].init(196, 57, 'ranges && !(ranges.length === 1 && ranges[0].collapsed)');
function visit15_115_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['114'][1].init(62, 22, 'sel && sel.getRanges()');
function visit14_114_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['101'][1].init(111, 19, 'command === \'paste\'');
function visit13_101_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['91'][2].init(317, 16, 'e.keyCode === 45');
function visit12_91_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['91'][1].init(82, 30, 'e.shiftKey && e.keyCode === 45');
function visit11_91_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['89'][3].init(231, 16, 'e.keyCode === 86');
function visit10_89_3(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['89'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['89'][2].init(218, 29, 'e.ctrlKey && e.keyCode === 86');
function visit9_89_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['89'][1].init(218, 113, 'e.ctrlKey && e.keyCode === 86 || e.shiftKey && e.keyCode === 45');
function visit8_89_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['85'][1].init(87, 47, 'editor.get(\'mode\') !== Editor.Mode.WYSIWYG_MODE');
function visit7_85_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['66'][1].init(1841, 6, 'OLD_IE');
function visit6_66_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['52'][1].init(725, 32, '!tryToCutCopyPaste(editor, type)');
function visit5_52_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['42'][1].init(142, 16, 'type === \'paste\'');
function visit4_42_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['40'][1].init(34, 14, 'type === \'cut\'');
function visit3_40_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['39'][1].init(30, 6, 'OLD_IE');
function visit2_39_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['14'][1].init(55, 14, 'UA.ieMode < 11');
function visit1_14_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/clipboard.js'].functionData[0]++;
  _$jscoverage['/editor/clipboard.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/editor/clipboard.js'].lineData[8]++;
  var Editor = require('./base');
  _$jscoverage['/editor/clipboard.js'].lineData[9]++;
  var KERange = require('./range');
  _$jscoverage['/editor/clipboard.js'].lineData[10]++;
  var KES = require('./selection');
  _$jscoverage['/editor/clipboard.js'].lineData[11]++;
  var logger = S.getLogger('s/editor');
  _$jscoverage['/editor/clipboard.js'].lineData[12]++;
  var $ = Node.all, UA = S.UA, OLD_IE = visit1_14_1(UA.ieMode < 11), pasteEvent = OLD_IE ? 'beforepaste' : 'paste', KER = Editor.RangeType;
  _$jscoverage['/editor/clipboard.js'].lineData[18]++;
  function Paste(editor) {
    _$jscoverage['/editor/clipboard.js'].functionData[1]++;
    _$jscoverage['/editor/clipboard.js'].lineData[19]++;
    var self = this;
    _$jscoverage['/editor/clipboard.js'].lineData[20]++;
    self.editor = editor;
    _$jscoverage['/editor/clipboard.js'].lineData[21]++;
    self._init();
  }
  _$jscoverage['/editor/clipboard.js'].lineData[24]++;
  S.augment(Paste, {
  _init: function() {
  _$jscoverage['/editor/clipboard.js'].functionData[2]++;
  _$jscoverage['/editor/clipboard.js'].lineData[26]++;
  var self = this, editor = self.editor, editorDoc = editor.get('document'), editorBody = editorDoc.one('body'), CutCopyPasteCmd = function(type) {
  _$jscoverage['/editor/clipboard.js'].functionData[3]++;
  _$jscoverage['/editor/clipboard.js'].lineData[31]++;
  this.type = type;
};
  _$jscoverage['/editor/clipboard.js'].lineData[34]++;
  CutCopyPasteCmd.prototype = {
  exec: function(editor) {
  _$jscoverage['/editor/clipboard.js'].functionData[4]++;
  _$jscoverage['/editor/clipboard.js'].lineData[36]++;
  var type = this.type;
  _$jscoverage['/editor/clipboard.js'].lineData[37]++;
  editor.focus();
  _$jscoverage['/editor/clipboard.js'].lineData[38]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[5]++;
  _$jscoverage['/editor/clipboard.js'].lineData[39]++;
  if (visit2_39_1(OLD_IE)) {
    _$jscoverage['/editor/clipboard.js'].lineData[40]++;
    if (visit3_40_1(type === 'cut')) {
      _$jscoverage['/editor/clipboard.js'].lineData[41]++;
      fixCut(editor);
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[42]++;
      if (visit4_42_1(type === 'paste')) {
        _$jscoverage['/editor/clipboard.js'].lineData[46]++;
        self._preventPasteEvent();
        _$jscoverage['/editor/clipboard.js'].lineData[47]++;
        self._getClipboardDataFromPasteBin();
      }
    }
  }
  _$jscoverage['/editor/clipboard.js'].lineData[52]++;
  if (visit5_52_1(!tryToCutCopyPaste(editor, type))) {
    _$jscoverage['/editor/clipboard.js'].lineData[54]++;
    alert(errorTypes[type]);
  }
}, 0);
}};
  _$jscoverage['/editor/clipboard.js'].lineData[64]++;
  editorBody.on(pasteEvent, self._getClipboardDataFromPasteBin, self);
  _$jscoverage['/editor/clipboard.js'].lineData[66]++;
  if (visit6_66_1(OLD_IE)) {
    _$jscoverage['/editor/clipboard.js'].lineData[67]++;
    editorBody.on('paste', self._iePaste, self);
    _$jscoverage['/editor/clipboard.js'].lineData[68]++;
    editorDoc.on('keydown', self._onKeyDown, self);
    _$jscoverage['/editor/clipboard.js'].lineData[69]++;
    editorDoc.on('contextmenu', function() {
  _$jscoverage['/editor/clipboard.js'].functionData[6]++;
  _$jscoverage['/editor/clipboard.js'].lineData[70]++;
  self._isPreventBeforePaste = 1;
  _$jscoverage['/editor/clipboard.js'].lineData[71]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[7]++;
  _$jscoverage['/editor/clipboard.js'].lineData[72]++;
  self._isPreventBeforePaste = 0;
}, 0);
});
  }
  _$jscoverage['/editor/clipboard.js'].lineData[77]++;
  editor.addCommand('copy', new CutCopyPasteCmd('copy'));
  _$jscoverage['/editor/clipboard.js'].lineData[78]++;
  editor.addCommand('cut', new CutCopyPasteCmd('cut'));
  _$jscoverage['/editor/clipboard.js'].lineData[79]++;
  editor.addCommand('paste', new CutCopyPasteCmd('paste'));
}, 
  _onKeyDown: function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[8]++;
  _$jscoverage['/editor/clipboard.js'].lineData[83]++;
  var self = this, editor = self.editor;
  _$jscoverage['/editor/clipboard.js'].lineData[85]++;
  if (visit7_85_1(editor.get('mode') !== Editor.Mode.WYSIWYG_MODE)) {
    _$jscoverage['/editor/clipboard.js'].lineData[86]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[89]++;
  if (visit8_89_1(visit9_89_2(e.ctrlKey && visit10_89_3(e.keyCode === 86)) || visit11_91_1(e.shiftKey && visit12_91_2(e.keyCode === 45)))) {
    _$jscoverage['/editor/clipboard.js'].lineData[92]++;
    self._preventPasteEvent();
  }
}, 
  _stateFromNamedCommand: function(command) {
  _$jscoverage['/editor/clipboard.js'].functionData[9]++;
  _$jscoverage['/editor/clipboard.js'].lineData[97]++;
  var ret;
  _$jscoverage['/editor/clipboard.js'].lineData[98]++;
  var self = this;
  _$jscoverage['/editor/clipboard.js'].lineData[99]++;
  var editor = self.editor;
  _$jscoverage['/editor/clipboard.js'].lineData[101]++;
  if (visit13_101_1(command === 'paste')) {
    _$jscoverage['/editor/clipboard.js'].lineData[105]++;
    self._isPreventBeforePaste = 1;
    _$jscoverage['/editor/clipboard.js'].lineData[106]++;
    try {
      _$jscoverage['/editor/clipboard.js'].lineData[107]++;
      ret = editor.get('document')[0].queryCommandEnabled(command);
    }    catch (e) {
}
    _$jscoverage['/editor/clipboard.js'].lineData[110]++;
    self._isPreventBeforePaste = 0;
  } else {
    _$jscoverage['/editor/clipboard.js'].lineData[113]++;
    var sel = editor.getSelection(), ranges = visit14_114_1(sel && sel.getRanges());
    _$jscoverage['/editor/clipboard.js'].lineData[115]++;
    ret = visit15_115_1(ranges && !(visit16_115_2(visit17_115_3(ranges.length === 1) && ranges[0].collapsed)));
  }
  _$jscoverage['/editor/clipboard.js'].lineData[118]++;
  return ret;
}, 
  _preventPasteEvent: function() {
  _$jscoverage['/editor/clipboard.js'].functionData[10]++;
  _$jscoverage['/editor/clipboard.js'].lineData[122]++;
  var self = this;
  _$jscoverage['/editor/clipboard.js'].lineData[123]++;
  if (visit18_123_1(self._preventPasteTimer)) {
    _$jscoverage['/editor/clipboard.js'].lineData[124]++;
    clearTimeout(self._preventPasteTimer);
  }
  _$jscoverage['/editor/clipboard.js'].lineData[126]++;
  self._isPreventPaste = 1;
  _$jscoverage['/editor/clipboard.js'].lineData[127]++;
  self._preventPasteTimer = setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[11]++;
  _$jscoverage['/editor/clipboard.js'].lineData[128]++;
  self._isPreventPaste = 0;
}, 70);
}, 
  _iePaste: function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[12]++;
  _$jscoverage['/editor/clipboard.js'].lineData[136]++;
  var self = this, editor = self.editor;
  _$jscoverage['/editor/clipboard.js'].lineData[138]++;
  if (visit19_138_1(self._isPreventPaste)) {
    _$jscoverage['/editor/clipboard.js'].lineData[144]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[147]++;
  e.preventDefault();
  _$jscoverage['/editor/clipboard.js'].lineData[148]++;
  editor.execCommand('paste');
}, 
  _getClipboardDataFromPasteBin: function() {
  _$jscoverage['/editor/clipboard.js'].functionData[13]++;
  _$jscoverage['/editor/clipboard.js'].lineData[152]++;
  if (visit20_152_1(this._isPreventBeforePaste)) {
    _$jscoverage['/editor/clipboard.js'].lineData[153]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[156]++;
  logger.debug(pasteEvent + ': ' + ' paste event happen');
  _$jscoverage['/editor/clipboard.js'].lineData[158]++;
  var self = this, editor = self.editor, doc = editor.get('document')[0];
  _$jscoverage['/editor/clipboard.js'].lineData[163]++;
  if (visit21_163_1(doc.getElementById('ke-paste-bin'))) {
    _$jscoverage['/editor/clipboard.js'].lineData[164]++;
    logger.debug(pasteEvent + ': trigger more than once ...');
    _$jscoverage['/editor/clipboard.js'].lineData[165]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[168]++;
  var sel = editor.getSelection(), range = new KERange(doc);
  _$jscoverage['/editor/clipboard.js'].lineData[172]++;
  var pasteBin = $(UA.webkit ? '<body></body>' : '<div></div>', doc);
  _$jscoverage['/editor/clipboard.js'].lineData[177]++;
  pasteBin.attr('id', 'ke-paste-bin');
  _$jscoverage['/editor/clipboard.js'].lineData[179]++;
  if (visit22_179_1(UA.webkit)) {
    _$jscoverage['/editor/clipboard.js'].lineData[180]++;
    pasteBin[0].appendChild(doc.createTextNode('\u200b'));
  }
  _$jscoverage['/editor/clipboard.js'].lineData[183]++;
  doc.body.appendChild(pasteBin[0]);
  _$jscoverage['/editor/clipboard.js'].lineData[185]++;
  pasteBin.css({
  position: 'absolute', 
  top: sel.getStartElement().offset().top + 'px', 
  width: '1px', 
  height: '1px', 
  overflow: 'hidden'});
  _$jscoverage['/editor/clipboard.js'].lineData[197]++;
  pasteBin.css('left', '-1000px');
  _$jscoverage['/editor/clipboard.js'].lineData[199]++;
  var bms = sel.createBookmarks();
  _$jscoverage['/editor/clipboard.js'].lineData[202]++;
  range.setStartAt(pasteBin, KER.POSITION_AFTER_START);
  _$jscoverage['/editor/clipboard.js'].lineData[203]++;
  range.setEndAt(pasteBin, KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/clipboard.js'].lineData[204]++;
  range.select(true);
  _$jscoverage['/editor/clipboard.js'].lineData[206]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[14]++;
  _$jscoverage['/editor/clipboard.js'].lineData[211]++;
  var bogusSpan;
  _$jscoverage['/editor/clipboard.js'].lineData[212]++;
  var oldPasteBin = pasteBin;
  _$jscoverage['/editor/clipboard.js'].lineData[214]++;
  pasteBin = (visit23_214_1(UA.webkit && visit24_214_2((bogusSpan = pasteBin.first()) && (bogusSpan.hasClass('Apple-style-span')))) ? bogusSpan : pasteBin);
  _$jscoverage['/editor/clipboard.js'].lineData[218]++;
  sel.selectBookmarks(bms);
  _$jscoverage['/editor/clipboard.js'].lineData[220]++;
  var html = pasteBin.html();
  _$jscoverage['/editor/clipboard.js'].lineData[222]++;
  oldPasteBin.remove();
  _$jscoverage['/editor/clipboard.js'].lineData[224]++;
  if (visit25_224_1(!(html = cleanPaste(html)))) {
    _$jscoverage['/editor/clipboard.js'].lineData[228]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[231]++;
  logger.debug('paste ' + html);
  _$jscoverage['/editor/clipboard.js'].lineData[233]++;
  var re = editor.fire('paste', {
  html: html});
  _$jscoverage['/editor/clipboard.js'].lineData[238]++;
  if (visit26_238_1(re === false)) {
    _$jscoverage['/editor/clipboard.js'].lineData[239]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[242]++;
  if (visit27_242_1(re !== undefined)) {
    _$jscoverage['/editor/clipboard.js'].lineData[243]++;
    html = re;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[246]++;
  if (visit28_246_1(/(class="?Mso|style="[^"]*\bmso\-|w:WordDocument)/.test(html))) {
    _$jscoverage['/editor/clipboard.js'].lineData[248]++;
    S.use('editor/plugin/word-filter', function(S, wordFilter) {
  _$jscoverage['/editor/clipboard.js'].functionData[15]++;
  _$jscoverage['/editor/clipboard.js'].lineData[249]++;
  editor.insertHtml(wordFilter.toDataFormat(html, editor));
});
  } else {
    _$jscoverage['/editor/clipboard.js'].lineData[252]++;
    editor.insertHtml(html);
  }
}, 0);
}});
  _$jscoverage['/editor/clipboard.js'].lineData[260]++;
  var execIECommand = function(editor, command) {
  _$jscoverage['/editor/clipboard.js'].functionData[16]++;
  _$jscoverage['/editor/clipboard.js'].lineData[261]++;
  var doc = editor.get('document')[0], body = $(doc.body), enabled = false, onExec = function() {
  _$jscoverage['/editor/clipboard.js'].functionData[17]++;
  _$jscoverage['/editor/clipboard.js'].lineData[265]++;
  enabled = true;
};
  _$jscoverage['/editor/clipboard.js'].lineData[272]++;
  body.on(command, onExec);
  _$jscoverage['/editor/clipboard.js'].lineData[275]++;
  (visit29_275_1(UA.ieMode > 7) ? doc : doc.selection.createRange()).execCommand(command);
  _$jscoverage['/editor/clipboard.js'].lineData[277]++;
  body.detach(command, onExec);
  _$jscoverage['/editor/clipboard.js'].lineData[279]++;
  return enabled;
};
  _$jscoverage['/editor/clipboard.js'].lineData[283]++;
  var tryToCutCopyPaste = OLD_IE ? function(editor, type) {
  _$jscoverage['/editor/clipboard.js'].functionData[18]++;
  _$jscoverage['/editor/clipboard.js'].lineData[285]++;
  return execIECommand(editor, type);
} : function(editor, type) {
  _$jscoverage['/editor/clipboard.js'].functionData[19]++;
  _$jscoverage['/editor/clipboard.js'].lineData[289]++;
  try {
    _$jscoverage['/editor/clipboard.js'].lineData[291]++;
    return editor.get('document')[0].execCommand(type);
  }  catch (e) {
  _$jscoverage['/editor/clipboard.js'].lineData[294]++;
  return false;
}
};
  _$jscoverage['/editor/clipboard.js'].lineData[298]++;
  var errorTypes = {
  cut: '\u60a8\u7684\u6d4f\u89c8\u5668\u5b89\u5168\u8bbe\u7f6e\u4e0d\u5141\u8bb8\u7f16\u8f91\u5668\u81ea\u52a8\u6267\u884c\u526a\u5207\u64cd\u4f5c\uff0c\u8bf7\u4f7f\u7528\u952e\u76d8\u5feb\u6377\u952e(Ctrl/Cmd+X)\u6765\u5b8c\u6210', 
  copy: '\u60a8\u7684\u6d4f\u89c8\u5668\u5b89\u5168\u8bbe\u7f6e\u4e0d\u5141\u8bb8\u7f16\u8f91\u5668\u81ea\u52a8\u6267\u884c\u590d\u5236\u64cd\u4f5c\uff0c\u8bf7\u4f7f\u7528\u952e\u76d8\u5feb\u6377\u952e(Ctrl/Cmd+C)\u6765\u5b8c\u6210', 
  paste: '\u60a8\u7684\u6d4f\u89c8\u5668\u5b89\u5168\u8bbe\u7f6e\u4e0d\u5141\u8bb8\u7f16\u8f91\u5668\u81ea\u52a8\u6267\u884c\u7c98\u8d34\u64cd\u4f5c\uff0c\u8bf7\u4f7f\u7528\u952e\u76d8\u5feb\u6377\u952e(Ctrl/Cmd+V)\u6765\u5b8c\u6210'};
  _$jscoverage['/editor/clipboard.js'].lineData[305]++;
  function fixCut(editor) {
    _$jscoverage['/editor/clipboard.js'].functionData[20]++;
    _$jscoverage['/editor/clipboard.js'].lineData[306]++;
    var editorDoc = editor.get('document')[0];
    _$jscoverage['/editor/clipboard.js'].lineData[307]++;
    var sel = editor.getSelection();
    _$jscoverage['/editor/clipboard.js'].lineData[308]++;
    var control;
    _$jscoverage['/editor/clipboard.js'].lineData[309]++;
    if (visit30_309_1((visit31_309_2(sel.getType() === KES.SELECTION_ELEMENT)) && (control = sel.getSelectedElement()))) {
      _$jscoverage['/editor/clipboard.js'].lineData[311]++;
      var range = sel.getRanges()[0];
      _$jscoverage['/editor/clipboard.js'].lineData[312]++;
      var dummy = $(editorDoc.createTextNode(''));
      _$jscoverage['/editor/clipboard.js'].lineData[313]++;
      dummy.insertBefore(control);
      _$jscoverage['/editor/clipboard.js'].lineData[314]++;
      range.setStartBefore(dummy);
      _$jscoverage['/editor/clipboard.js'].lineData[315]++;
      range.setEndAfter(control);
      _$jscoverage['/editor/clipboard.js'].lineData[316]++;
      sel.selectRanges([range]);
      _$jscoverage['/editor/clipboard.js'].lineData[319]++;
      setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[21]++;
  _$jscoverage['/editor/clipboard.js'].lineData[321]++;
  if (visit32_321_1(control.parent())) {
    _$jscoverage['/editor/clipboard.js'].lineData[322]++;
    dummy.remove();
    _$jscoverage['/editor/clipboard.js'].lineData[323]++;
    sel.selectElement(control);
  }
}, 0);
    }
  }
  _$jscoverage['/editor/clipboard.js'].lineData[329]++;
  function isPlainText(html) {
    _$jscoverage['/editor/clipboard.js'].functionData[22]++;
    _$jscoverage['/editor/clipboard.js'].lineData[330]++;
    if (visit33_330_1(UA.webkit)) {
      _$jscoverage['/editor/clipboard.js'].lineData[332]++;
      if (visit34_332_1(!html.match(/^[^<]*$/g) && !html.match(/^(<div><br( ?\/)?><\/div>|<div>[^<]*<\/div>)*$/gi))) {
        _$jscoverage['/editor/clipboard.js'].lineData[333]++;
        return 0;
      }
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[335]++;
      if (visit35_335_1(UA.ie)) {
        _$jscoverage['/editor/clipboard.js'].lineData[337]++;
        if (visit36_337_1(!html.match(/^([^<]|<br( ?\/)?>)*$/gi) && !html.match(/^(<p>([^<]|<br( ?\/)?>)*<\/p>|(\r\n))*$/gi))) {
          _$jscoverage['/editor/clipboard.js'].lineData[338]++;
          return 0;
        }
      } else {
        _$jscoverage['/editor/clipboard.js'].lineData[340]++;
        if (visit37_340_1(UA.gecko)) {
          _$jscoverage['/editor/clipboard.js'].lineData[342]++;
          if (visit38_342_1(!html.match(/^([^<]|<br( ?\/)?>)*$/gi))) {
            _$jscoverage['/editor/clipboard.js'].lineData[343]++;
            return 0;
          }
        } else {
          _$jscoverage['/editor/clipboard.js'].lineData[346]++;
          return 0;
        }
      }
    }
    _$jscoverage['/editor/clipboard.js'].lineData[349]++;
    return 1;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[353]++;
  function plainTextToHtml(html) {
    _$jscoverage['/editor/clipboard.js'].functionData[23]++;
    _$jscoverage['/editor/clipboard.js'].lineData[354]++;
    html = html.replace(/\s+/g, ' ').replace(/> +</g, '><').replace(/<br ?\/>/gi, '<br>');
    _$jscoverage['/editor/clipboard.js'].lineData[359]++;
    if (visit39_359_1(html.match(/^[^<]$/))) {
      _$jscoverage['/editor/clipboard.js'].lineData[360]++;
      return html;
    }
    _$jscoverage['/editor/clipboard.js'].lineData[364]++;
    if (visit40_364_1(UA.webkit && visit41_364_2(html.indexOf('<div>') > -1))) {
      _$jscoverage['/editor/clipboard.js'].lineData[366]++;
      if (visit42_366_1(html.match(/<div>(?:<br>)?<\/div>/))) {
        _$jscoverage['/editor/clipboard.js'].lineData[367]++;
        html = html.replace(/<div>(?:<br>)?<\/div>/g, function() {
  _$jscoverage['/editor/clipboard.js'].functionData[24]++;
  _$jscoverage['/editor/clipboard.js'].lineData[368]++;
  return '<p></p>';
});
        _$jscoverage['/editor/clipboard.js'].lineData[370]++;
        html = html.replace(/<\/p><div>/g, '</p><p>').replace(/<\/div><p>/g, '</p><p>').replace(/^<div>/, '<p>').replace(/^<\/div>/, '</p>');
      }
      _$jscoverage['/editor/clipboard.js'].lineData[376]++;
      if (visit43_376_1(html.match(/<\/div><div>/))) {
        _$jscoverage['/editor/clipboard.js'].lineData[377]++;
        html = html.replace(/<\/div><div>/g, '</p><p>').replace(/^<div>/, '<p>').replace(/^<\/div>/, '</p>');
      }
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[381]++;
      if (visit44_381_1(UA.gecko)) {
        _$jscoverage['/editor/clipboard.js'].lineData[384]++;
        if (visit45_384_1(UA.gecko)) {
          _$jscoverage['/editor/clipboard.js'].lineData[385]++;
          html = html.replace(/^<br><br>$/, '<br>');
        }
        _$jscoverage['/editor/clipboard.js'].lineData[387]++;
        if (visit46_387_1(html.indexOf('<br><br>') > -1)) {
          _$jscoverage['/editor/clipboard.js'].lineData[388]++;
          html = '<p>' + html.replace(/<br><br>/g, function() {
  _$jscoverage['/editor/clipboard.js'].functionData[25]++;
  _$jscoverage['/editor/clipboard.js'].lineData[389]++;
  return '</p><p>';
}) + '</p>';
        }
      }
    }
    _$jscoverage['/editor/clipboard.js'].lineData[393]++;
    return html;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[396]++;
  function cleanPaste(html) {
    _$jscoverage['/editor/clipboard.js'].functionData[26]++;
    _$jscoverage['/editor/clipboard.js'].lineData[397]++;
    var htmlMode = 0;
    _$jscoverage['/editor/clipboard.js'].lineData[398]++;
    html = html.replace(/<span[^>]+_ke_bookmark[^<]*?<\/span>(&nbsp;)*/ig, '');
    _$jscoverage['/editor/clipboard.js'].lineData[399]++;
    if (visit47_399_1(html.indexOf('Apple-') !== -1)) {
      _$jscoverage['/editor/clipboard.js'].lineData[401]++;
      html = html.replace(/<span class="Apple-converted-space">&nbsp;<\/span>/gi, ' ');
      _$jscoverage['/editor/clipboard.js'].lineData[402]++;
      html = html.replace(/<span class="Apple-tab-span"[^>]*>([^<]*)<\/span>/gi, function(all, spaces) {
  _$jscoverage['/editor/clipboard.js'].functionData[27]++;
  _$jscoverage['/editor/clipboard.js'].lineData[404]++;
  return spaces.replace(/\t/g, new Array(5).join('&nbsp;'));
});
      _$jscoverage['/editor/clipboard.js'].lineData[406]++;
      if (visit48_406_1(html.indexOf('<br class="Apple-interchange-newline">') > -1)) {
        _$jscoverage['/editor/clipboard.js'].lineData[407]++;
        htmlMode = 1;
        _$jscoverage['/editor/clipboard.js'].lineData[408]++;
        html = html.replace(/<br class="Apple-interchange-newline">/, '');
      }
      _$jscoverage['/editor/clipboard.js'].lineData[410]++;
      html = html.replace(/(<[^>]+) class="Apple-[^"]*"/gi, '$1');
    }
    _$jscoverage['/editor/clipboard.js'].lineData[413]++;
    if (visit49_413_1(!htmlMode && isPlainText(html))) {
      _$jscoverage['/editor/clipboard.js'].lineData[414]++;
      html = plainTextToHtml(html);
    }
    _$jscoverage['/editor/clipboard.js'].lineData[417]++;
    return html;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[420]++;
  var lang = {
  copy: '\u590d\u5236', 
  paste: '\u7c98\u8d34', 
  cut: '\u526a\u5207'};
  _$jscoverage['/editor/clipboard.js'].lineData[426]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/clipboard.js'].functionData[28]++;
  _$jscoverage['/editor/clipboard.js'].lineData[428]++;
  var currentPaste;
  _$jscoverage['/editor/clipboard.js'].lineData[430]++;
  editor.docReady(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[29]++;
  _$jscoverage['/editor/clipboard.js'].lineData[431]++;
  currentPaste = new Paste(editor);
});
  _$jscoverage['/editor/clipboard.js'].lineData[435]++;
  if (visit50_435_1(0)) {
    _$jscoverage['/editor/clipboard.js'].lineData[436]++;
    var defaultContextMenuFn;
    _$jscoverage['/editor/clipboard.js'].lineData[439]++;
    editor.docReady(defaultContextMenuFn = function() {
  _$jscoverage['/editor/clipboard.js'].functionData[30]++;
  _$jscoverage['/editor/clipboard.js'].lineData[440]++;
  editor.detach('docReady', defaultContextMenuFn);
  _$jscoverage['/editor/clipboard.js'].lineData[441]++;
  var firstFn;
  _$jscoverage['/editor/clipboard.js'].lineData[442]++;
  editor.get('document').on('contextmenu', firstFn = function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[31]++;
  _$jscoverage['/editor/clipboard.js'].lineData[443]++;
  e.preventDefault();
  _$jscoverage['/editor/clipboard.js'].lineData[444]++;
  editor.get('document').detach('contextmenu', firstFn);
  _$jscoverage['/editor/clipboard.js'].lineData[445]++;
  S.use('editor/plugin/contextmenu', function() {
  _$jscoverage['/editor/clipboard.js'].functionData[32]++;
  _$jscoverage['/editor/clipboard.js'].lineData[446]++;
  editor.addContextMenu('default', function() {
  _$jscoverage['/editor/clipboard.js'].functionData[33]++;
  _$jscoverage['/editor/clipboard.js'].lineData[447]++;
  return 1;
}, {
  event: e});
});
});
});
  }
  _$jscoverage['/editor/clipboard.js'].lineData[456]++;
  var clipboardCommands = {
  copy: 1, 
  cut: 1, 
  paste: 1};
  _$jscoverage['/editor/clipboard.js'].lineData[461]++;
  var clipboardCommandsList = ['copy', 'cut', 'paste'];
  _$jscoverage['/editor/clipboard.js'].lineData[464]++;
  editor.on('contextmenu', function(ev) {
  _$jscoverage['/editor/clipboard.js'].functionData[34]++;
  _$jscoverage['/editor/clipboard.js'].lineData[465]++;
  var contextmenu = ev.contextmenu, i;
  _$jscoverage['/editor/clipboard.js'].lineData[467]++;
  if (visit51_467_1(!contextmenu.__copyFix)) {
    _$jscoverage['/editor/clipboard.js'].lineData[468]++;
    contextmenu.__copyFix = 1;
    _$jscoverage['/editor/clipboard.js'].lineData[469]++;
    i = 0;
    _$jscoverage['/editor/clipboard.js'].lineData[470]++;
    for (; visit52_470_1(i < clipboardCommandsList.length); i++) {
      _$jscoverage['/editor/clipboard.js'].lineData[471]++;
      contextmenu.addChild({
  content: lang[clipboardCommandsList[i]], 
  value: clipboardCommandsList[i]});
    }
    _$jscoverage['/editor/clipboard.js'].lineData[477]++;
    contextmenu.on('click', function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[35]++;
  _$jscoverage['/editor/clipboard.js'].lineData[478]++;
  var value = e.target.get('value');
  _$jscoverage['/editor/clipboard.js'].lineData[479]++;
  if (visit53_479_1(clipboardCommands[value])) {
    _$jscoverage['/editor/clipboard.js'].lineData[480]++;
    contextmenu.hide();
    _$jscoverage['/editor/clipboard.js'].lineData[483]++;
    setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[36]++;
  _$jscoverage['/editor/clipboard.js'].lineData[484]++;
  editor.execCommand('save');
  _$jscoverage['/editor/clipboard.js'].lineData[485]++;
  editor.execCommand(value);
  _$jscoverage['/editor/clipboard.js'].lineData[486]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[37]++;
  _$jscoverage['/editor/clipboard.js'].lineData[487]++;
  editor.execCommand('save');
}, 10);
}, 30);
  }
});
  }
  _$jscoverage['/editor/clipboard.js'].lineData[494]++;
  var menuChildren = contextmenu.get('children');
  _$jscoverage['/editor/clipboard.js'].lineData[497]++;
  for (i = menuChildren.length - 1; visit54_497_1(i >= 0); i >= 0) {
    _$jscoverage['/editor/clipboard.js'].lineData[498]++;
    var c = menuChildren[i];
    _$jscoverage['/editor/clipboard.js'].lineData[499]++;
    var value;
    _$jscoverage['/editor/clipboard.js'].lineData[500]++;
    if (visit55_500_1(c.get)) {
      _$jscoverage['/editor/clipboard.js'].lineData[501]++;
      value = c.get('value');
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[503]++;
      value = c.value;
    }
    _$jscoverage['/editor/clipboard.js'].lineData[505]++;
    var v;
    _$jscoverage['/editor/clipboard.js'].lineData[506]++;
    if (visit56_506_1(clipboardCommands[value])) {
      _$jscoverage['/editor/clipboard.js'].lineData[507]++;
      v = !currentPaste._stateFromNamedCommand(value);
      _$jscoverage['/editor/clipboard.js'].lineData[508]++;
      if (visit57_508_1(c.set)) {
        _$jscoverage['/editor/clipboard.js'].lineData[509]++;
        c.set('disabled', v);
      } else {
        _$jscoverage['/editor/clipboard.js'].lineData[511]++;
        c.disabled = v;
      }
    }
  }
});
}};
});
