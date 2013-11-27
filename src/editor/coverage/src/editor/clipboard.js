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
  _$jscoverage['/editor/clipboard.js'].lineData[53] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[63] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[65] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[66] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[67] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[68] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[69] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[70] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[71] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[76] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[77] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[78] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[82] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[84] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[85] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[88] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[91] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[96] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[97] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[98] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[100] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[104] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[105] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[106] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[109] = 0;
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
  _$jscoverage['/editor/clipboard.js'].lineData[212] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[213] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[215] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[220] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[222] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[224] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[226] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[230] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[233] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[235] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[240] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[241] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[244] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[245] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[249] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[251] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[252] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[255] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[263] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[264] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[268] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[275] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[278] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[280] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[282] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[286] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[288] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[292] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[294] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[297] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[301] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[308] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[309] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[310] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[311] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[312] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[314] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[315] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[316] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[317] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[318] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[319] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[322] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[324] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[325] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[326] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[332] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[333] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[335] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[336] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[337] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[339] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[340] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[341] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[343] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[344] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[346] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[348] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[352] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[353] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[358] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[359] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[363] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[365] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[366] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[367] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[369] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[375] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[376] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[382] = 0;
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
  _$jscoverage['/editor/clipboard.js'].lineData[429] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[431] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[432] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[436] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[437] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[440] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[441] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[442] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[443] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[444] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[445] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[446] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[447] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[448] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[457] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[462] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[466] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[467] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[469] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[471] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[472] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[473] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[474] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[480] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[481] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[482] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[483] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[486] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[487] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[488] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[489] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[490] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[497] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[500] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[501] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[502] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[503] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[504] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[506] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[508] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[509] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[510] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[511] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[512] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[514] = 0;
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
  _$jscoverage['/editor/clipboard.js'].branchData['39'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['40'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['42'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['52'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['65'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['84'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['88'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['88'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['88'][3] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['90'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['90'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['100'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['100'][1] = new BranchData();
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
  _$jscoverage['/editor/clipboard.js'].branchData['215'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['216'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['226'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['240'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['244'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['249'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['278'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['312'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['312'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['324'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['333'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['335'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['337'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['339'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['341'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['343'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['358'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['363'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['363'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['365'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['375'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['382'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['382'][1] = new BranchData();
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
  _$jscoverage['/editor/clipboard.js'].branchData['436'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['469'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['473'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['482'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['500'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['503'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['509'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['511'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['511'][1] = new BranchData();
}
_$jscoverage['/editor/clipboard.js'].branchData['511'][1].init(102, 5, 'c.set');
function visit56_511_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['509'][1].init(301, 24, 'clipboardCommands[value]');
function visit55_509_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['503'][1].init(101, 5, 'c.get');
function visit54_503_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['500'][1].init(1415, 6, 'i >= 0');
function visit53_500_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['482'][1].init(88, 24, 'clipboardCommands[value]');
function visit52_482_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['473'][1].init(108, 32, 'i < clipboardCommandsList.length');
function visit51_473_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['469'][1].init(72, 23, '!contextmenu.__copy_fix');
function visit50_469_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['436'][1].init(195, 1, '0');
function visit49_436_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['413'][1].init(855, 30, '!htmlMode && isPlainText(html)');
function visit48_413_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['406'][1].init(415, 59, 'html.indexOf(\'<br class="Apple-interchange-newline">\') > -1');
function visit47_406_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['399'][1].init(123, 28, 'html.indexOf(\'Apple-\') != -1');
function visit46_399_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['387'][1].init(145, 29, 'html.indexOf(\'<br><br>\') > -1');
function visit45_387_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['384'][1].init(44, 8, 'UA.gecko');
function visit44_384_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['382'][1].init(1066, 20, 'UA.gecko || UA.opera');
function visit43_382_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['375'][1].init(497, 26, 'html.match(/<\\/div><div>/)');
function visit42_375_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['365'][1].init(80, 35, 'html.match(/<div>(?:<br>)?<\\/div>/)');
function visit41_365_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['363'][2].init(258, 26, 'html.indexOf(\'<div>\') > -1');
function visit40_363_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['363'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['363'][1].init(245, 39, 'UA.webkit && html.indexOf(\'<div>\') > -1');
function visit39_363_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['358'][1].init(154, 20, 'html.match(/^[^<]$/)');
function visit38_358_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['343'][1].init(46, 38, '!html.match(/^([^<]|<br( ?\\/)?>)*$/gi)');
function visit37_343_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['341'][1].init(523, 20, 'UA.gecko || UA.opera');
function visit36_341_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['339'][1].init(117, 98, '!html.match(/^([^<]|<br( ?\\/)?>)*$/gi) && !html.match(/^(<p>([^<]|<br( ?\\/)?>)*<\\/p>|(\\r\\n))*$/gi)');
function visit35_339_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['337'][1].init(252, 5, 'UA.ie');
function visit34_337_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['335'][1].init(89, 90, '!html.match(/^[^<]*$/g) && !html.match(/^(<div><br( ?\\/)?><\\/div>|<div>[^<]*<\\/div>)*$/gi)');
function visit33_335_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['333'][1].init(13, 9, 'UA.webkit');
function visit32_333_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['324'][1].init(62, 16, 'control.parent()');
function visit31_324_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['312'][2].init(128, 38, 'sel.getType() == KES.SELECTION_ELEMENT');
function visit30_312_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['312'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['312'][1].init(128, 94, '(sel.getType() == KES.SELECTION_ELEMENT) && (control = sel.getSelectedElement())');
function visit29_312_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['278'][1].init(572, 12, 'UA[\'ie\'] > 7');
function visit28_278_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['249'][1].init(1331, 61, '/(class="?Mso|style="[^"]*\\bmso\\-|w:WordDocument)/.test(html)');
function visit27_249_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['244'][1].init(1197, 16, 're !== undefined');
function visit26_244_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['240'][1].init(1114, 12, 're === false');
function visit25_240_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['226'][1].init(697, 27, '!(html = cleanPaste(html))');
function visit24_226_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['216'][1].init(37, 95, '(bogusSpan = pasteBin.first()) && (bogusSpan.hasClass(\'Apple-style-span\'))');
function visit23_216_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['215'][1].init(-1, 133, 'UA[\'webkit\'] && (bogusSpan = pasteBin.first()) && (bogusSpan.hasClass(\'Apple-style-span\'))');
function visit22_215_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['179'][1].init(990, 12, 'UA[\'webkit\']');
function visit21_179_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['163'][1].init(376, 34, 'doc.getElementById(\'ke-paste-bin\')');
function visit20_163_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['152'][1].init(17, 26, 'this._isPreventBeforePaste');
function visit19_152_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['138'][1].init(84, 20, 'self._isPreventPaste');
function visit18_138_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['123'][1].init(46, 23, 'self._preventPasteTimer');
function visit17_123_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['115'][3].init(138, 18, 'ranges.length == 1');
function visit16_115_3(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['115'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['115'][2].init(138, 43, 'ranges.length == 1 && ranges[0].collapsed');
function visit15_115_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['115'][1].init(125, 58, 'ranges && !(ranges.length == 1 && ranges[0].collapsed)');
function visit14_115_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['114'][1].init(61, 22, 'sel && sel.getRanges()');
function visit13_114_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['100'][1].init(106, 18, 'command == \'paste\'');
function visit12_100_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['90'][2].init(306, 15, 'e.keyCode == 45');
function visit11_90_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['90'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['90'][1].init(79, 29, 'e.shiftKey && e.keyCode == 45');
function visit10_90_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['88'][3].init(223, 15, 'e.keyCode == 86');
function visit9_88_3(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['88'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['88'][2].init(210, 28, 'e.ctrlKey && e.keyCode == 86');
function visit8_88_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['88'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['88'][1].init(210, 109, 'e.ctrlKey && e.keyCode == 86 || e.shiftKey && e.keyCode == 45');
function visit7_88_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['84'][1].init(84, 46, 'editor.get(\'mode\') != Editor.Mode.WYSIWYG_MODE');
function visit6_84_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['65'][1].init(1753, 5, 'UA.ie');
function visit5_65_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['52'][1].init(708, 32, '!tryToCutCopyPaste(editor, type)');
function visit4_52_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['42'][1].init(138, 15, 'type == \'paste\'');
function visit3_42_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['40'][1].init(33, 13, 'type == \'cut\'');
function visit2_40_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['39'][1].init(29, 5, 'UA.ie');
function visit1_39_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['39'][1].ranCondition(result);
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
  var $ = Node.all, UA = S.UA, pasteEvent = UA.ie ? 'beforepaste' : 'paste', KER = Editor.RangeType;
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
  var self = this, editor = self.editor, editorDoc = editor.get("document"), editorBody = editorDoc.one('body'), CutCopyPasteCmd = function(type) {
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
  if (visit1_39_1(UA.ie)) {
    _$jscoverage['/editor/clipboard.js'].lineData[40]++;
    if (visit2_40_1(type == 'cut')) {
      _$jscoverage['/editor/clipboard.js'].lineData[41]++;
      fixCut(editor);
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[42]++;
      if (visit3_42_1(type == 'paste')) {
        _$jscoverage['/editor/clipboard.js'].lineData[46]++;
        self._preventPasteEvent();
        _$jscoverage['/editor/clipboard.js'].lineData[47]++;
        self._getClipboardDataFromPasteBin();
      }
    }
  }
  _$jscoverage['/editor/clipboard.js'].lineData[52]++;
  if (visit4_52_1(!tryToCutCopyPaste(editor, type))) {
    _$jscoverage['/editor/clipboard.js'].lineData[53]++;
    alert(error_types[type]);
  }
}, 0);
}};
  _$jscoverage['/editor/clipboard.js'].lineData[63]++;
  editorBody.on(pasteEvent, self._getClipboardDataFromPasteBin, self);
  _$jscoverage['/editor/clipboard.js'].lineData[65]++;
  if (visit5_65_1(UA.ie)) {
    _$jscoverage['/editor/clipboard.js'].lineData[66]++;
    editorBody.on('paste', self._iePaste, self);
    _$jscoverage['/editor/clipboard.js'].lineData[67]++;
    editorDoc.on('keydown', self._onKeyDown, self);
    _$jscoverage['/editor/clipboard.js'].lineData[68]++;
    editorDoc.on('contextmenu', function() {
  _$jscoverage['/editor/clipboard.js'].functionData[6]++;
  _$jscoverage['/editor/clipboard.js'].lineData[69]++;
  self._isPreventBeforePaste = 1;
  _$jscoverage['/editor/clipboard.js'].lineData[70]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[7]++;
  _$jscoverage['/editor/clipboard.js'].lineData[71]++;
  self._isPreventBeforePaste = 0;
}, 0);
});
  }
  _$jscoverage['/editor/clipboard.js'].lineData[76]++;
  editor.addCommand("copy", new CutCopyPasteCmd("copy"));
  _$jscoverage['/editor/clipboard.js'].lineData[77]++;
  editor.addCommand("cut", new CutCopyPasteCmd("cut"));
  _$jscoverage['/editor/clipboard.js'].lineData[78]++;
  editor.addCommand("paste", new CutCopyPasteCmd("paste"));
}, 
  '_onKeyDown': function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[8]++;
  _$jscoverage['/editor/clipboard.js'].lineData[82]++;
  var self = this, editor = self.editor;
  _$jscoverage['/editor/clipboard.js'].lineData[84]++;
  if (visit6_84_1(editor.get('mode') != Editor.Mode.WYSIWYG_MODE)) {
    _$jscoverage['/editor/clipboard.js'].lineData[85]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[88]++;
  if (visit7_88_1(visit8_88_2(e.ctrlKey && visit9_88_3(e.keyCode == 86)) || visit10_90_1(e.shiftKey && visit11_90_2(e.keyCode == 45)))) {
    _$jscoverage['/editor/clipboard.js'].lineData[91]++;
    self._preventPasteEvent();
  }
}, 
  _stateFromNamedCommand: function(command) {
  _$jscoverage['/editor/clipboard.js'].functionData[9]++;
  _$jscoverage['/editor/clipboard.js'].lineData[96]++;
  var ret;
  _$jscoverage['/editor/clipboard.js'].lineData[97]++;
  var self = this;
  _$jscoverage['/editor/clipboard.js'].lineData[98]++;
  var editor = self.editor;
  _$jscoverage['/editor/clipboard.js'].lineData[100]++;
  if (visit12_100_1(command == 'paste')) {
    _$jscoverage['/editor/clipboard.js'].lineData[104]++;
    self._isPreventBeforePaste = 1;
    _$jscoverage['/editor/clipboard.js'].lineData[105]++;
    try {
      _$jscoverage['/editor/clipboard.js'].lineData[106]++;
      ret = editor.get('document')[0].queryCommandEnabled(command);
    }    catch (e) {
}
    _$jscoverage['/editor/clipboard.js'].lineData[109]++;
    self._isPreventBeforePaste = 0;
  } else {
    _$jscoverage['/editor/clipboard.js'].lineData[113]++;
    var sel = editor.getSelection(), ranges = visit13_114_1(sel && sel.getRanges());
    _$jscoverage['/editor/clipboard.js'].lineData[115]++;
    ret = visit14_115_1(ranges && !(visit15_115_2(visit16_115_3(ranges.length == 1) && ranges[0].collapsed)));
  }
  _$jscoverage['/editor/clipboard.js'].lineData[118]++;
  return ret;
}, 
  '_preventPasteEvent': function() {
  _$jscoverage['/editor/clipboard.js'].functionData[10]++;
  _$jscoverage['/editor/clipboard.js'].lineData[122]++;
  var self = this;
  _$jscoverage['/editor/clipboard.js'].lineData[123]++;
  if (visit17_123_1(self._preventPasteTimer)) {
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
  if (visit18_138_1(self._isPreventPaste)) {
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
  if (visit19_152_1(this._isPreventBeforePaste)) {
    _$jscoverage['/editor/clipboard.js'].lineData[153]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[156]++;
  logger.debug(pasteEvent + ": " + " paste event happen");
  _$jscoverage['/editor/clipboard.js'].lineData[158]++;
  var self = this, editor = self.editor, doc = editor.get("document")[0];
  _$jscoverage['/editor/clipboard.js'].lineData[163]++;
  if (visit20_163_1(doc.getElementById('ke-paste-bin'))) {
    _$jscoverage['/editor/clipboard.js'].lineData[164]++;
    logger.debug(pasteEvent + ": trigger more than once ...");
    _$jscoverage['/editor/clipboard.js'].lineData[165]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[168]++;
  var sel = editor.getSelection(), range = new KERange(doc);
  _$jscoverage['/editor/clipboard.js'].lineData[172]++;
  var pasteBin = $(UA['webkit'] ? '<body></body>' : '<div></div>', doc);
  _$jscoverage['/editor/clipboard.js'].lineData[177]++;
  pasteBin.attr('id', 'ke-paste-bin');
  _$jscoverage['/editor/clipboard.js'].lineData[179]++;
  if (visit21_179_1(UA['webkit'])) {
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
  _$jscoverage['/editor/clipboard.js'].lineData[212]++;
  var bogusSpan;
  _$jscoverage['/editor/clipboard.js'].lineData[213]++;
  var oldPasteBin = pasteBin;
  _$jscoverage['/editor/clipboard.js'].lineData[215]++;
  pasteBin = (visit22_215_1(UA['webkit'] && visit23_216_1((bogusSpan = pasteBin.first()) && (bogusSpan.hasClass('Apple-style-span')))) ? bogusSpan : pasteBin);
  _$jscoverage['/editor/clipboard.js'].lineData[220]++;
  sel.selectBookmarks(bms);
  _$jscoverage['/editor/clipboard.js'].lineData[222]++;
  var html = pasteBin.html();
  _$jscoverage['/editor/clipboard.js'].lineData[224]++;
  oldPasteBin.remove();
  _$jscoverage['/editor/clipboard.js'].lineData[226]++;
  if (visit24_226_1(!(html = cleanPaste(html)))) {
    _$jscoverage['/editor/clipboard.js'].lineData[230]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[233]++;
  logger.debug("paste " + html);
  _$jscoverage['/editor/clipboard.js'].lineData[235]++;
  var re = editor.fire("paste", {
  html: html});
  _$jscoverage['/editor/clipboard.js'].lineData[240]++;
  if (visit25_240_1(re === false)) {
    _$jscoverage['/editor/clipboard.js'].lineData[241]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[244]++;
  if (visit26_244_1(re !== undefined)) {
    _$jscoverage['/editor/clipboard.js'].lineData[245]++;
    html = re;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[249]++;
  if (visit27_249_1(/(class="?Mso|style="[^"]*\bmso\-|w:WordDocument)/.test(html))) {
    _$jscoverage['/editor/clipboard.js'].lineData[251]++;
    S.use("editor/plugin/word-filter", function(S, wordFilter) {
  _$jscoverage['/editor/clipboard.js'].functionData[15]++;
  _$jscoverage['/editor/clipboard.js'].lineData[252]++;
  editor.insertHtml(wordFilter.toDataFormat(html, editor));
});
  } else {
    _$jscoverage['/editor/clipboard.js'].lineData[255]++;
    editor.insertHtml(html);
  }
}, 0);
}});
  _$jscoverage['/editor/clipboard.js'].lineData[263]++;
  var execIECommand = function(editor, command) {
  _$jscoverage['/editor/clipboard.js'].functionData[16]++;
  _$jscoverage['/editor/clipboard.js'].lineData[264]++;
  var doc = editor.get("document")[0], body = $(doc.body), enabled = false, onExec = function() {
  _$jscoverage['/editor/clipboard.js'].functionData[17]++;
  _$jscoverage['/editor/clipboard.js'].lineData[268]++;
  enabled = true;
};
  _$jscoverage['/editor/clipboard.js'].lineData[275]++;
  body.on(command, onExec);
  _$jscoverage['/editor/clipboard.js'].lineData[278]++;
  (visit28_278_1(UA['ie'] > 7) ? doc : doc.selection.createRange())['execCommand'](command);
  _$jscoverage['/editor/clipboard.js'].lineData[280]++;
  body.detach(command, onExec);
  _$jscoverage['/editor/clipboard.js'].lineData[282]++;
  return enabled;
};
  _$jscoverage['/editor/clipboard.js'].lineData[286]++;
  var tryToCutCopyPaste = UA['ie'] ? function(editor, type) {
  _$jscoverage['/editor/clipboard.js'].functionData[18]++;
  _$jscoverage['/editor/clipboard.js'].lineData[288]++;
  return execIECommand(editor, type);
} : function(editor, type) {
  _$jscoverage['/editor/clipboard.js'].functionData[19]++;
  _$jscoverage['/editor/clipboard.js'].lineData[292]++;
  try {
    _$jscoverage['/editor/clipboard.js'].lineData[294]++;
    return editor.get("document")[0].execCommand(type);
  }  catch (e) {
  _$jscoverage['/editor/clipboard.js'].lineData[297]++;
  return false;
}
};
  _$jscoverage['/editor/clipboard.js'].lineData[301]++;
  var error_types = {
  "cut": "\u60a8\u7684\u6d4f\u89c8\u5668\u5b89\u5168\u8bbe\u7f6e\u4e0d\u5141\u8bb8\u7f16\u8f91\u5668\u81ea\u52a8\u6267\u884c\u526a\u5207\u64cd\u4f5c\uff0c\u8bf7\u4f7f\u7528\u952e\u76d8\u5feb\u6377\u952e(Ctrl/Cmd+X)\u6765\u5b8c\u6210", 
  "copy": "\u60a8\u7684\u6d4f\u89c8\u5668\u5b89\u5168\u8bbe\u7f6e\u4e0d\u5141\u8bb8\u7f16\u8f91\u5668\u81ea\u52a8\u6267\u884c\u590d\u5236\u64cd\u4f5c\uff0c\u8bf7\u4f7f\u7528\u952e\u76d8\u5feb\u6377\u952e(Ctrl/Cmd+C)\u6765\u5b8c\u6210", 
  "paste": "\u60a8\u7684\u6d4f\u89c8\u5668\u5b89\u5168\u8bbe\u7f6e\u4e0d\u5141\u8bb8\u7f16\u8f91\u5668\u81ea\u52a8\u6267\u884c\u7c98\u8d34\u64cd\u4f5c\uff0c\u8bf7\u4f7f\u7528\u952e\u76d8\u5feb\u6377\u952e(Ctrl/Cmd+V)\u6765\u5b8c\u6210"};
  _$jscoverage['/editor/clipboard.js'].lineData[308]++;
  function fixCut(editor) {
    _$jscoverage['/editor/clipboard.js'].functionData[20]++;
    _$jscoverage['/editor/clipboard.js'].lineData[309]++;
    var editorDoc = editor.get("document")[0];
    _$jscoverage['/editor/clipboard.js'].lineData[310]++;
    var sel = editor.getSelection();
    _$jscoverage['/editor/clipboard.js'].lineData[311]++;
    var control;
    _$jscoverage['/editor/clipboard.js'].lineData[312]++;
    if (visit29_312_1((visit30_312_2(sel.getType() == KES.SELECTION_ELEMENT)) && (control = sel.getSelectedElement()))) {
      _$jscoverage['/editor/clipboard.js'].lineData[314]++;
      var range = sel.getRanges()[0];
      _$jscoverage['/editor/clipboard.js'].lineData[315]++;
      var dummy = $(editorDoc.createTextNode(''));
      _$jscoverage['/editor/clipboard.js'].lineData[316]++;
      dummy.insertBefore(control);
      _$jscoverage['/editor/clipboard.js'].lineData[317]++;
      range.setStartBefore(dummy);
      _$jscoverage['/editor/clipboard.js'].lineData[318]++;
      range.setEndAfter(control);
      _$jscoverage['/editor/clipboard.js'].lineData[319]++;
      sel.selectRanges([range]);
      _$jscoverage['/editor/clipboard.js'].lineData[322]++;
      setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[21]++;
  _$jscoverage['/editor/clipboard.js'].lineData[324]++;
  if (visit31_324_1(control.parent())) {
    _$jscoverage['/editor/clipboard.js'].lineData[325]++;
    dummy.remove();
    _$jscoverage['/editor/clipboard.js'].lineData[326]++;
    sel.selectElement(control);
  }
}, 0);
    }
  }
  _$jscoverage['/editor/clipboard.js'].lineData[332]++;
  function isPlainText(html) {
    _$jscoverage['/editor/clipboard.js'].functionData[22]++;
    _$jscoverage['/editor/clipboard.js'].lineData[333]++;
    if (visit32_333_1(UA.webkit)) {
      _$jscoverage['/editor/clipboard.js'].lineData[335]++;
      if (visit33_335_1(!html.match(/^[^<]*$/g) && !html.match(/^(<div><br( ?\/)?><\/div>|<div>[^<]*<\/div>)*$/gi))) {
        _$jscoverage['/editor/clipboard.js'].lineData[336]++;
        return 0;
      }
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[337]++;
      if (visit34_337_1(UA.ie)) {
        _$jscoverage['/editor/clipboard.js'].lineData[339]++;
        if (visit35_339_1(!html.match(/^([^<]|<br( ?\/)?>)*$/gi) && !html.match(/^(<p>([^<]|<br( ?\/)?>)*<\/p>|(\r\n))*$/gi))) {
          _$jscoverage['/editor/clipboard.js'].lineData[340]++;
          return 0;
        }
      } else {
        _$jscoverage['/editor/clipboard.js'].lineData[341]++;
        if (visit36_341_1(UA.gecko || UA.opera)) {
          _$jscoverage['/editor/clipboard.js'].lineData[343]++;
          if (visit37_343_1(!html.match(/^([^<]|<br( ?\/)?>)*$/gi))) {
            _$jscoverage['/editor/clipboard.js'].lineData[344]++;
            return 0;
          }
        } else {
          _$jscoverage['/editor/clipboard.js'].lineData[346]++;
          return 0;
        }
      }
    }
    _$jscoverage['/editor/clipboard.js'].lineData[348]++;
    return 1;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[352]++;
  function plainTextToHtml(html) {
    _$jscoverage['/editor/clipboard.js'].functionData[23]++;
    _$jscoverage['/editor/clipboard.js'].lineData[353]++;
    html = html.replace(/\s+/g, ' ').replace(/> +</g, '><').replace(/<br ?\/>/gi, '<br>');
    _$jscoverage['/editor/clipboard.js'].lineData[358]++;
    if (visit38_358_1(html.match(/^[^<]$/))) {
      _$jscoverage['/editor/clipboard.js'].lineData[359]++;
      return html;
    }
    _$jscoverage['/editor/clipboard.js'].lineData[363]++;
    if (visit39_363_1(UA.webkit && visit40_363_2(html.indexOf('<div>') > -1))) {
      _$jscoverage['/editor/clipboard.js'].lineData[365]++;
      if (visit41_365_1(html.match(/<div>(?:<br>)?<\/div>/))) {
        _$jscoverage['/editor/clipboard.js'].lineData[366]++;
        html = html.replace(/<div>(?:<br>)?<\/div>/g, function() {
  _$jscoverage['/editor/clipboard.js'].functionData[24]++;
  _$jscoverage['/editor/clipboard.js'].lineData[367]++;
  return '<p></p>';
});
        _$jscoverage['/editor/clipboard.js'].lineData[369]++;
        html = html.replace(/<\/p><div>/g, '</p><p>').replace(/<\/div><p>/g, '</p><p>').replace(/^<div>/, '<p>').replace(/^<\/div>/, '</p>');
      }
      _$jscoverage['/editor/clipboard.js'].lineData[375]++;
      if (visit42_375_1(html.match(/<\/div><div>/))) {
        _$jscoverage['/editor/clipboard.js'].lineData[376]++;
        html = html.replace(/<\/div><div>/g, '</p><p>').replace(/^<div>/, '<p>').replace(/^<\/div>/, '</p>');
      }
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[382]++;
      if (visit43_382_1(UA.gecko || UA.opera)) {
        _$jscoverage['/editor/clipboard.js'].lineData[384]++;
        if (visit44_384_1(UA.gecko)) {
          _$jscoverage['/editor/clipboard.js'].lineData[385]++;
          html = html.replace(/^<br><br>$/, '<br>');
        }
        _$jscoverage['/editor/clipboard.js'].lineData[387]++;
        if (visit45_387_1(html.indexOf('<br><br>') > -1)) {
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
    if (visit46_399_1(html.indexOf('Apple-') != -1)) {
      _$jscoverage['/editor/clipboard.js'].lineData[401]++;
      html = html.replace(/<span class="Apple-converted-space">&nbsp;<\/span>/gi, ' ');
      _$jscoverage['/editor/clipboard.js'].lineData[402]++;
      html = html.replace(/<span class="Apple-tab-span"[^>]*>([^<]*)<\/span>/gi, function(all, spaces) {
  _$jscoverage['/editor/clipboard.js'].functionData[27]++;
  _$jscoverage['/editor/clipboard.js'].lineData[404]++;
  return spaces.replace(/\t/g, new Array(5).join('&nbsp;'));
});
      _$jscoverage['/editor/clipboard.js'].lineData[406]++;
      if (visit47_406_1(html.indexOf('<br class="Apple-interchange-newline">') > -1)) {
        _$jscoverage['/editor/clipboard.js'].lineData[407]++;
        htmlMode = 1;
        _$jscoverage['/editor/clipboard.js'].lineData[408]++;
        html = html.replace(/<br class="Apple-interchange-newline">/, '');
      }
      _$jscoverage['/editor/clipboard.js'].lineData[410]++;
      html = html.replace(/(<[^>]+) class="Apple-[^"]*"/gi, '$1');
    }
    _$jscoverage['/editor/clipboard.js'].lineData[413]++;
    if (visit48_413_1(!htmlMode && isPlainText(html))) {
      _$jscoverage['/editor/clipboard.js'].lineData[414]++;
      html = plainTextToHtml(html);
    }
    _$jscoverage['/editor/clipboard.js'].lineData[417]++;
    return html;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[420]++;
  var lang = {
  "copy": "\u590d\u5236", 
  "paste": "\u7c98\u8d34", 
  "cut": "\u526a\u5207"};
  _$jscoverage['/editor/clipboard.js'].lineData[426]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/clipboard.js'].functionData[28]++;
  _$jscoverage['/editor/clipboard.js'].lineData[429]++;
  var currentPaste;
  _$jscoverage['/editor/clipboard.js'].lineData[431]++;
  editor.docReady(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[29]++;
  _$jscoverage['/editor/clipboard.js'].lineData[432]++;
  currentPaste = new Paste(editor);
});
  _$jscoverage['/editor/clipboard.js'].lineData[436]++;
  if (visit49_436_1(0)) {
    _$jscoverage['/editor/clipboard.js'].lineData[437]++;
    var defaultContextMenuFn;
    _$jscoverage['/editor/clipboard.js'].lineData[440]++;
    editor.docReady(defaultContextMenuFn = function() {
  _$jscoverage['/editor/clipboard.js'].functionData[30]++;
  _$jscoverage['/editor/clipboard.js'].lineData[441]++;
  editor.detach('docReady', defaultContextMenuFn);
  _$jscoverage['/editor/clipboard.js'].lineData[442]++;
  var firstFn;
  _$jscoverage['/editor/clipboard.js'].lineData[443]++;
  editor.get('document').on('contextmenu', firstFn = function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[31]++;
  _$jscoverage['/editor/clipboard.js'].lineData[444]++;
  e.preventDefault();
  _$jscoverage['/editor/clipboard.js'].lineData[445]++;
  editor.get('document').detach('contextmenu', firstFn);
  _$jscoverage['/editor/clipboard.js'].lineData[446]++;
  S.use('editor/plugin/contextmenu', function() {
  _$jscoverage['/editor/clipboard.js'].functionData[32]++;
  _$jscoverage['/editor/clipboard.js'].lineData[447]++;
  editor.addContextMenu('default', function() {
  _$jscoverage['/editor/clipboard.js'].functionData[33]++;
  _$jscoverage['/editor/clipboard.js'].lineData[448]++;
  return 1;
}, {
  event: e});
});
});
});
  }
  _$jscoverage['/editor/clipboard.js'].lineData[457]++;
  var clipboardCommands = {
  "copy": 1, 
  "cut": 1, 
  "paste": 1};
  _$jscoverage['/editor/clipboard.js'].lineData[462]++;
  var clipboardCommandsList = ["copy", "cut", "paste"];
  _$jscoverage['/editor/clipboard.js'].lineData[466]++;
  editor.on("contextmenu", function(ev) {
  _$jscoverage['/editor/clipboard.js'].functionData[34]++;
  _$jscoverage['/editor/clipboard.js'].lineData[467]++;
  var contextmenu = ev.contextmenu;
  _$jscoverage['/editor/clipboard.js'].lineData[469]++;
  if (visit50_469_1(!contextmenu.__copy_fix)) {
    _$jscoverage['/editor/clipboard.js'].lineData[471]++;
    contextmenu.__copy_fix = 1;
    _$jscoverage['/editor/clipboard.js'].lineData[472]++;
    var i = 0;
    _$jscoverage['/editor/clipboard.js'].lineData[473]++;
    for (; visit51_473_1(i < clipboardCommandsList.length); i++) {
      _$jscoverage['/editor/clipboard.js'].lineData[474]++;
      contextmenu.addChild({
  content: lang[clipboardCommandsList[i]], 
  value: clipboardCommandsList[i]});
    }
    _$jscoverage['/editor/clipboard.js'].lineData[480]++;
    contextmenu.on('click', function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[35]++;
  _$jscoverage['/editor/clipboard.js'].lineData[481]++;
  var value = e.target.get("value");
  _$jscoverage['/editor/clipboard.js'].lineData[482]++;
  if (visit52_482_1(clipboardCommands[value])) {
    _$jscoverage['/editor/clipboard.js'].lineData[483]++;
    contextmenu.hide();
    _$jscoverage['/editor/clipboard.js'].lineData[486]++;
    setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[36]++;
  _$jscoverage['/editor/clipboard.js'].lineData[487]++;
  editor.execCommand('save');
  _$jscoverage['/editor/clipboard.js'].lineData[488]++;
  editor.execCommand(value);
  _$jscoverage['/editor/clipboard.js'].lineData[489]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[37]++;
  _$jscoverage['/editor/clipboard.js'].lineData[490]++;
  editor.execCommand('save');
}, 10);
}, 30);
  }
});
  }
  _$jscoverage['/editor/clipboard.js'].lineData[497]++;
  var menuChildren = contextmenu.get('children');
  _$jscoverage['/editor/clipboard.js'].lineData[500]++;
  for (i = menuChildren.length - 1; visit53_500_1(i >= 0); i >= 0) {
    _$jscoverage['/editor/clipboard.js'].lineData[501]++;
    var c = menuChildren[i];
    _$jscoverage['/editor/clipboard.js'].lineData[502]++;
    var value;
    _$jscoverage['/editor/clipboard.js'].lineData[503]++;
    if (visit54_503_1(c.get)) {
      _$jscoverage['/editor/clipboard.js'].lineData[504]++;
      value = c.get("value");
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[506]++;
      value = c.value;
    }
    _$jscoverage['/editor/clipboard.js'].lineData[508]++;
    var v;
    _$jscoverage['/editor/clipboard.js'].lineData[509]++;
    if (visit55_509_1(clipboardCommands[value])) {
      _$jscoverage['/editor/clipboard.js'].lineData[510]++;
      v = !currentPaste._stateFromNamedCommand(value);
      _$jscoverage['/editor/clipboard.js'].lineData[511]++;
      if (visit56_511_1(c.set)) {
        _$jscoverage['/editor/clipboard.js'].lineData[512]++;
        c.set('disabled', v);
      } else {
        _$jscoverage['/editor/clipboard.js'].lineData[514]++;
        c.disabled = v;
      }
    }
  }
});
}};
});
