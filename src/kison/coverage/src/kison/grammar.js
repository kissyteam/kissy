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
  _$jscoverage['/kison/grammar.js'].lineData[6] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[7] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[8] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[9] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[10] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[11] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[12] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[13] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[15] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[29] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[30] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[31] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[32] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[34] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[37] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[38] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[39] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[40] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[43] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[46] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[47] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[49] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[50] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[52] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[53] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[55] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[56] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[58] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[59] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[60] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[62] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[64] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[65] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[66] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[68] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[76] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[78] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[82] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[87] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[88] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[89] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[90] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[91] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[93] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[96] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[97] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[98] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[99] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[100] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[101] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[102] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[106] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[110] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[111] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[112] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[113] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[114] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[120] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[125] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[126] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[129] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[130] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[135] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[137] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[138] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[139] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[148] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[160] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[161] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[166] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[167] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[168] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[169] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[170] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[171] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[174] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[175] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[181] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[183] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[184] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[185] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[186] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[187] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[188] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[198] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[201] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[202] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[203] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[204] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[207] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[209] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[210] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[213] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[218] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[224] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[225] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[226] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[227] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[229] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[231] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[232] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[234] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[236] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[237] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[240] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[245] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[253] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[254] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[262] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[263] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[264] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[265] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[266] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[270] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[272] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[273] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[274] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[275] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[277] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[278] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[279] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[287] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[292] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[293] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[294] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[296] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[303] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[304] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[305] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[306] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[309] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[310] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[312] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[326] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[327] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[328] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[330] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[331] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[332] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[341] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[345] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[347] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[348] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[351] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[352] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[358] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[359] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[360] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[362] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[363] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[367] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[371] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[372] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[373] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[374] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[377] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[383] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[389] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[391] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[401] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[403] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[406] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[408] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[409] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[410] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[411] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[412] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[414] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[415] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[419] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[420] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[423] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[425] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[427] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[428] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[431] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[433] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[434] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[436] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[437] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[440] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[441] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[449] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[452] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[453] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[454] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[455] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[456] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[458] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[460] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[464] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[466] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[467] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[468] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[471] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[472] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[473] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[474] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[478] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[485] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[499] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[500] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[501] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[503] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[505] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[507] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[508] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[509] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[510] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[511] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[512] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[513] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[514] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[515] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[516] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[517] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[518] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[519] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[521] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[522] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[523] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[524] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[525] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[526] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[528] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[531] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[536] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[537] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[538] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[539] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[540] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[541] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[542] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[543] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[545] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[546] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[547] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[548] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[549] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[550] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[552] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[559] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[560] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[561] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[562] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[563] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[564] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[565] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[566] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[567] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[568] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[569] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[571] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[572] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[573] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[574] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[575] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[576] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[577] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[578] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[579] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[580] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[582] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[584] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[585] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[586] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[587] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[588] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[589] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[591] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[592] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[593] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[594] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[595] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[596] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[597] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[598] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[599] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[600] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[602] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[610] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[617] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[618] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[619] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[620] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[623] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[625] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[627] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[628] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[629] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[630] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[631] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[632] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[633] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[634] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[636] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[637] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[639] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[643] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[645] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[646] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[647] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[651] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[655] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[657] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[662] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[664] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[666] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[667] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[669] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[670] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[672] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[675] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[677] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[679] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[684] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[686] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[688] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[689] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[692] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[693] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[694] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[695] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[696] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[715] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[716] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[718] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[719] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[730] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[731] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[743] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[745] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[747] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[749] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[750] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[753] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[754] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[755] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[759] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[761] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[762] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[763] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[764] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[765] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[768] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[771] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[772] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[775] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[777] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[779] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[782] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[785] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[787] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[790] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[799] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[801] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[802] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[805] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[806] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[809] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[810] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[812] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[815] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[816] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[817] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[820] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[822] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[824] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[826] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[828] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[831] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[836] = 0;
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
  _$jscoverage['/kison/grammar.js'].branchData['38'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['39'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['59'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['65'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['108'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['112'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['113'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['129'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['138'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['167'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['170'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['174'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['183'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['186'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['201'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['203'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['209'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['224'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['226'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['231'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['236'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['264'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['277'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['310'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['326'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['328'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['351'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['358'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['372'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['373'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['414'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['419'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['427'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['433'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['452'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['454'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['456'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['458'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['503'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['510'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['511'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['512'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['513'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['517'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['517'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['517'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['531'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['541'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['541'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['561'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['562'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['567'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['567'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['584'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['587'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['587'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['587'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['630'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['632'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['632'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['636'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['636'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['655'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['655'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['669'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['669'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['688'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['688'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['715'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['715'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['749'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['749'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['753'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['753'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['759'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['759'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['761'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['761'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['763'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['763'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['791'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['791'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['792'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['792'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['793'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['793'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['801'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['801'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['805'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['805'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['809'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['809'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['815'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['815'][1] = new BranchData();
}
_$jscoverage['/kison/grammar.js'].branchData['815'][1].init(1052, 3, 'len');
function visit74_815_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['815'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['809'][1].init(883, 17, 'ret !== undefined');
function visit73_809_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['809'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['805'][1].init(763, 13, 'reducedAction');
function visit72_805_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['805'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['801'][1].init(613, 7, 'i < len');
function visit71_801_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['801'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['793'][1].init(257, 31, 'production.rhs || production[1]');
function visit70_793_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['793'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['792'][1].init(184, 34, 'production.action || production[2]');
function visit69_792_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['792'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['791'][1].init(108, 34, 'production.symbol || production[0]');
function visit68_791_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['791'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['763'][1].init(63, 18, 'tableAction[state]');
function visit67_763_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['763'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['761'][1].init(472, 7, '!action');
function visit66_761_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['761'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['759'][1].init(405, 48, 'tableAction[state] && tableAction[state][symbol]');
function visit65_759_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['759'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['753'][1].init(198, 7, '!symbol');
function visit64_753_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['753'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['749'][1].init(118, 7, '!symbol');
function visit63_749_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['749'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['715'][1].init(25, 22, '!(v instanceof Lexer)');
function visit62_715_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['715'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['688'][1].init(919, 18, 'cfg.compressSymbol');
function visit61_688_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['688'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['669'][1].init(126, 6, 'action');
function visit60_669_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['669'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['655'][1].init(19, 9, 'cfg || {}');
function visit59_655_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['655'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['636'][1].init(481, 31, 'type == GrammarConst.SHIFT_TYPE');
function visit58_636_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['636'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['632'][1].init(193, 32, 'type == GrammarConst.REDUCE_TYPE');
function visit57_632_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['632'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['630'][1].init(89, 32, 'type == GrammarConst.ACCEPT_TYPE');
function visit56_630_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['587'][2].init(196, 8, 'val != t');
function visit55_587_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['587'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['587'][1].init(191, 13, 't && val != t');
function visit54_587_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['587'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['584'][1].init(36, 14, 'gotos[i] || {}');
function visit53_584_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['567'][2].init(336, 30, 't.toString() != val.toString()');
function visit52_567_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['567'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['567'][1].init(331, 35, 't && t.toString() != val.toString()');
function visit51_567_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['562'][1].init(37, 15, 'action[i] || {}');
function visit50_562_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['561'][1].init(54, 21, '!nonTerminals[symbol]');
function visit49_561_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['541'][2].init(328, 30, 't.toString() != val.toString()');
function visit48_541_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['541'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['541'][1].init(323, 35, 't && t.toString() != val.toString()');
function visit47_541_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['531'][1].init(41, 15, 'action[i] || {}');
function visit46_531_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['517'][2].init(295, 30, 't.toString() != val.toString()');
function visit45_517_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['517'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['517'][1].init(290, 35, 't && t.toString() != val.toString()');
function visit44_517_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['513'][1].init(45, 15, 'action[i] || {}');
function visit43_513_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['512'][1].init(33, 35, 'item.get("lookAhead")[mappedEndTag]');
function visit42_512_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['511'][1].init(29, 42, 'production.get("symbol") == mappedStartTag');
function visit41_511_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['510'][1].init(115, 55, 'item.get("dotPosition") == production.get("rhs").length');
function visit40_510_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['503'][1].init(628, 19, 'i < itemSets.length');
function visit39_503_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['458'][1].init(42, 27, 'k < one.get("items").length');
function visit38_458_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['456'][1].init(64, 21, 'one.equals(two, true)');
function visit37_456_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['454'][1].init(68, 19, 'j < itemSets.length');
function visit36_454_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['452'][1].init(107, 19, 'i < itemSets.length');
function visit35_452_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['433'][1].init(657, 10, 'index > -1');
function visit34_433_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['427'][1].init(468, 22, 'itemSetNew.size() == 0');
function visit33_427_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['419'][1].init(225, 23, 'itemSet.__cache[symbol]');
function visit32_419_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['414'][1].init(30, 16, '!itemSet.__cache');
function visit31_414_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['373'][1].init(21, 27, 'itemSets[i].equals(itemSet)');
function visit30_373_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['372'][1].init(77, 19, 'i < itemSets.length');
function visit29_372_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['358'][1].init(286, 15, 'itemIndex != -1');
function visit28_358_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['351'][1].init(206, 15, 'markSymbol == x');
function visit27_351_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['328'][1].init(113, 46, 'cont || (!!findItem.addLookAhead(finalFirsts))');
function visit26_328_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['326'][1].init(613, 15, 'itemIndex != -1');
function visit25_326_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['310'][1].init(29, 29, 'p2.get("symbol") == dotSymbol');
function visit24_310_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['277'][1].init(285, 54, 'setSize(firsts) !== setSize(nonTerminal.get("firsts"))');
function visit23_277_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['264'][1].init(97, 53, 'setSize(firsts) !== setSize(production.get("firsts"))');
function visit22_264_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['236'][1].init(645, 21, '!nonTerminals[symbol]');
function visit21_236_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['231'][1].init(227, 19, '!self.isNullable(t)');
function visit20_231_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['226'][1].init(25, 16, '!nonTerminals[t]');
function visit19_226_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['224'][1].init(189, 23, 'symbol instanceof Array');
function visit18_224_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['209'][1].init(412, 21, '!nonTerminals[symbol]');
function visit17_209_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['203'][1].init(25, 19, '!self.isNullable(t)');
function visit16_203_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['201'][1].init(122, 23, 'symbol instanceof Array');
function visit15_201_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['186'][1].init(33, 26, 'production.get("nullable")');
function visit14_186_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['183'][1].init(26, 37, '!nonTerminals[symbol].get("nullable")');
function visit13_183_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['174'][1].init(291, 7, 'n === i');
function visit12_174_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['170'][1].init(33, 18, 'self.isNullable(t)');
function visit11_170_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['167'][1].init(25, 27, '!production.get("nullable")');
function visit10_167_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['138'][1].init(25, 43, '!terminals[handle] && !nonTerminals[handle]');
function visit9_138_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['129'][1].init(133, 12, '!nonTerminal');
function visit8_129_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['113'][1].init(72, 5, 'token');
function visit7_113_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['112'][1].init(29, 21, 'rule.token || rule[0]');
function visit6_112_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['108'][1].init(83, 20, 'lexer && lexer.rules');
function visit5_108_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['65'][1].init(684, 42, 'action[GrammarConst.TO_INDEX] != undefined');
function visit4_65_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['59'][1].init(432, 50, 'action[GrammarConst.PRODUCTION_INDEX] != undefined');
function visit3_59_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['39'][1].init(17, 20, 'obj.equals(array[i])');
function visit2_39_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['38'][1].init(25, 16, 'i < array.length');
function visit1_38_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/kison/grammar.js'].functionData[0]++;
  _$jscoverage['/kison/grammar.js'].lineData[7]++;
  var Base = require('base');
  _$jscoverage['/kison/grammar.js'].lineData[8]++;
  var Utils = require('./utils');
  _$jscoverage['/kison/grammar.js'].lineData[9]++;
  var Item = require('./item');
  _$jscoverage['/kison/grammar.js'].lineData[10]++;
  var ItemSet = require('./item-set');
  _$jscoverage['/kison/grammar.js'].lineData[11]++;
  var NonTerminal = require('./non-terminal');
  _$jscoverage['/kison/grammar.js'].lineData[12]++;
  var Lexer = require('./lexer');
  _$jscoverage['/kison/grammar.js'].lineData[13]++;
  var Production = require('./production');
  _$jscoverage['/kison/grammar.js'].lineData[15]++;
  var GrammarConst = {
  SHIFT_TYPE: 1, 
  REDUCE_TYPE: 2, 
  ACCEPT_TYPE: 0, 
  TYPE_INDEX: 0, 
  PRODUCTION_INDEX: 1, 
  TO_INDEX: 2}, logger = S.getLogger('s/kison'), serializeObject = Utils.serializeObject, mix = S.mix, END_TAG = Lexer.STATIC.END_TAG, START_TAG = '$START';
  _$jscoverage['/kison/grammar.js'].lineData[29]++;
  function setSize(set3) {
    _$jscoverage['/kison/grammar.js'].functionData[1]++;
    _$jscoverage['/kison/grammar.js'].lineData[30]++;
    var count = 0, i;
    _$jscoverage['/kison/grammar.js'].lineData[31]++;
    for (i in set3) {
      _$jscoverage['/kison/grammar.js'].lineData[32]++;
      count++;
    }
    _$jscoverage['/kison/grammar.js'].lineData[34]++;
    return count;
  }
  _$jscoverage['/kison/grammar.js'].lineData[37]++;
  function indexOf(obj, array) {
    _$jscoverage['/kison/grammar.js'].functionData[2]++;
    _$jscoverage['/kison/grammar.js'].lineData[38]++;
    for (var i = 0; visit1_38_1(i < array.length); i++) {
      _$jscoverage['/kison/grammar.js'].lineData[39]++;
      if (visit2_39_1(obj.equals(array[i]))) {
        _$jscoverage['/kison/grammar.js'].lineData[40]++;
        return i;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[43]++;
    return -1;
  }
  _$jscoverage['/kison/grammar.js'].lineData[46]++;
  function visualizeAction(action, productions, itemSets) {
    _$jscoverage['/kison/grammar.js'].functionData[3]++;
    _$jscoverage['/kison/grammar.js'].lineData[47]++;
    switch (action[GrammarConst.TYPE_INDEX]) {
      case GrammarConst.SHIFT_TYPE:
        _$jscoverage['/kison/grammar.js'].lineData[49]++;
        logger.debug('shift');
        _$jscoverage['/kison/grammar.js'].lineData[50]++;
        break;
      case GrammarConst.REDUCE_TYPE:
        _$jscoverage['/kison/grammar.js'].lineData[52]++;
        logger.debug('reduce');
        _$jscoverage['/kison/grammar.js'].lineData[53]++;
        break;
      case GrammarConst.ACCEPT_TYPE:
        _$jscoverage['/kison/grammar.js'].lineData[55]++;
        logger.debug('accept');
        _$jscoverage['/kison/grammar.js'].lineData[56]++;
        break;
    }
    _$jscoverage['/kison/grammar.js'].lineData[58]++;
    logger.debug('from production:');
    _$jscoverage['/kison/grammar.js'].lineData[59]++;
    if (visit3_59_1(action[GrammarConst.PRODUCTION_INDEX] != undefined)) {
      _$jscoverage['/kison/grammar.js'].lineData[60]++;
      logger.debug(productions[action[GrammarConst.PRODUCTION_INDEX]] + '');
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[62]++;
      logger.debug('undefined');
    }
    _$jscoverage['/kison/grammar.js'].lineData[64]++;
    logger.debug('to itemSet:');
    _$jscoverage['/kison/grammar.js'].lineData[65]++;
    if (visit4_65_1(action[GrammarConst.TO_INDEX] != undefined)) {
      _$jscoverage['/kison/grammar.js'].lineData[66]++;
      logger.debug(itemSets[action[GrammarConst.TO_INDEX]].toString(1));
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[68]++;
      logger.debug('undefined');
    }
  }
  _$jscoverage['/kison/grammar.js'].lineData[76]++;
  return Base.extend({
  build: function() {
  _$jscoverage['/kison/grammar.js'].functionData[4]++;
  _$jscoverage['/kison/grammar.js'].lineData[78]++;
  var self = this, lexer = self.lexer, vs = self.get('productions');
  _$jscoverage['/kison/grammar.js'].lineData[82]++;
  vs.unshift({
  symbol: START_TAG, 
  rhs: [vs[0].symbol]});
  _$jscoverage['/kison/grammar.js'].lineData[87]++;
  S.each(vs, function(v, index) {
  _$jscoverage['/kison/grammar.js'].functionData[5]++;
  _$jscoverage['/kison/grammar.js'].lineData[88]++;
  v.symbol = lexer.mapSymbol(v.symbol);
  _$jscoverage['/kison/grammar.js'].lineData[89]++;
  var rhs = v.rhs;
  _$jscoverage['/kison/grammar.js'].lineData[90]++;
  S.each(rhs, function(r, index) {
  _$jscoverage['/kison/grammar.js'].functionData[6]++;
  _$jscoverage['/kison/grammar.js'].lineData[91]++;
  rhs[index] = lexer.mapSymbol(r);
});
  _$jscoverage['/kison/grammar.js'].lineData[93]++;
  vs[index] = new Production(v);
});
  _$jscoverage['/kison/grammar.js'].lineData[96]++;
  self.buildTerminals();
  _$jscoverage['/kison/grammar.js'].lineData[97]++;
  self.buildNonTerminals();
  _$jscoverage['/kison/grammar.js'].lineData[98]++;
  self.buildNullable();
  _$jscoverage['/kison/grammar.js'].lineData[99]++;
  self.buildFirsts();
  _$jscoverage['/kison/grammar.js'].lineData[100]++;
  self.buildItemSet();
  _$jscoverage['/kison/grammar.js'].lineData[101]++;
  self.buildLalrItemSets();
  _$jscoverage['/kison/grammar.js'].lineData[102]++;
  self.buildTable();
}, 
  buildTerminals: function() {
  _$jscoverage['/kison/grammar.js'].functionData[7]++;
  _$jscoverage['/kison/grammar.js'].lineData[106]++;
  var self = this, lexer = self.get("lexer"), rules = visit5_108_1(lexer && lexer.rules), terminals = self.get("terminals");
  _$jscoverage['/kison/grammar.js'].lineData[110]++;
  terminals[lexer.mapSymbol(END_TAG)] = 1;
  _$jscoverage['/kison/grammar.js'].lineData[111]++;
  S.each(rules, function(rule) {
  _$jscoverage['/kison/grammar.js'].functionData[8]++;
  _$jscoverage['/kison/grammar.js'].lineData[112]++;
  var token = visit6_112_1(rule.token || rule[0]);
  _$jscoverage['/kison/grammar.js'].lineData[113]++;
  if (visit7_113_1(token)) {
    _$jscoverage['/kison/grammar.js'].lineData[114]++;
    terminals[token] = 1;
  }
});
}, 
  buildNonTerminals: function() {
  _$jscoverage['/kison/grammar.js'].functionData[9]++;
  _$jscoverage['/kison/grammar.js'].lineData[120]++;
  var self = this, terminals = self.get("terminals"), nonTerminals = self.get("nonTerminals"), productions = self.get("productions");
  _$jscoverage['/kison/grammar.js'].lineData[125]++;
  S.each(productions, function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[10]++;
  _$jscoverage['/kison/grammar.js'].lineData[126]++;
  var symbol = production.get("symbol"), nonTerminal = nonTerminals[symbol];
  _$jscoverage['/kison/grammar.js'].lineData[129]++;
  if (visit8_129_1(!nonTerminal)) {
    _$jscoverage['/kison/grammar.js'].lineData[130]++;
    nonTerminal = nonTerminals[symbol] = new NonTerminal({
  symbol: symbol});
  }
  _$jscoverage['/kison/grammar.js'].lineData[135]++;
  nonTerminal.get("productions").push(production);
  _$jscoverage['/kison/grammar.js'].lineData[137]++;
  S.each(production.get("handles"), function(handle) {
  _$jscoverage['/kison/grammar.js'].functionData[11]++;
  _$jscoverage['/kison/grammar.js'].lineData[138]++;
  if (visit9_138_1(!terminals[handle] && !nonTerminals[handle])) {
    _$jscoverage['/kison/grammar.js'].lineData[139]++;
    nonTerminals[handle] = new NonTerminal({
  symbol: handle});
  }
});
});
}, 
  buildNullable: function() {
  _$jscoverage['/kison/grammar.js'].functionData[12]++;
  _$jscoverage['/kison/grammar.js'].lineData[148]++;
  var self = this, i, rhs, n, symbol, t, production, productions, nonTerminals = self.get("nonTerminals"), cont = true;
  _$jscoverage['/kison/grammar.js'].lineData[160]++;
  while (cont) {
    _$jscoverage['/kison/grammar.js'].lineData[161]++;
    cont = false;
    _$jscoverage['/kison/grammar.js'].lineData[166]++;
    S.each(self.get("productions"), function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[13]++;
  _$jscoverage['/kison/grammar.js'].lineData[167]++;
  if (visit10_167_1(!production.get("nullable"))) {
    _$jscoverage['/kison/grammar.js'].lineData[168]++;
    rhs = production.get("rhs");
    _$jscoverage['/kison/grammar.js'].lineData[169]++;
    for (i = 0 , n = 0; t = rhs[i]; ++i) {
      _$jscoverage['/kison/grammar.js'].lineData[170]++;
      if (visit11_170_1(self.isNullable(t))) {
        _$jscoverage['/kison/grammar.js'].lineData[171]++;
        n++;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[174]++;
    if (visit12_174_1(n === i)) {
      _$jscoverage['/kison/grammar.js'].lineData[175]++;
      production.set("nullable", cont = true);
    }
  }
});
    _$jscoverage['/kison/grammar.js'].lineData[181]++;
    for (symbol in nonTerminals) {
      _$jscoverage['/kison/grammar.js'].lineData[183]++;
      if (visit13_183_1(!nonTerminals[symbol].get("nullable"))) {
        _$jscoverage['/kison/grammar.js'].lineData[184]++;
        productions = nonTerminals[symbol].get("productions");
        _$jscoverage['/kison/grammar.js'].lineData[185]++;
        for (i = 0; production = productions[i]; i++) {
          _$jscoverage['/kison/grammar.js'].lineData[186]++;
          if (visit14_186_1(production.get("nullable"))) {
            _$jscoverage['/kison/grammar.js'].lineData[187]++;
            nonTerminals[symbol].set("nullable", cont = true);
            _$jscoverage['/kison/grammar.js'].lineData[188]++;
            break;
          }
        }
      }
    }
  }
}, 
  isNullable: function(symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[14]++;
  _$jscoverage['/kison/grammar.js'].lineData[198]++;
  var self = this, nonTerminals = self.get("nonTerminals");
  _$jscoverage['/kison/grammar.js'].lineData[201]++;
  if (visit15_201_1(symbol instanceof Array)) {
    _$jscoverage['/kison/grammar.js'].lineData[202]++;
    for (var i = 0, t; t = symbol[i]; ++i) {
      _$jscoverage['/kison/grammar.js'].lineData[203]++;
      if (visit16_203_1(!self.isNullable(t))) {
        _$jscoverage['/kison/grammar.js'].lineData[204]++;
        return false;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[207]++;
    return true;
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[209]++;
    if (visit17_209_1(!nonTerminals[symbol])) {
      _$jscoverage['/kison/grammar.js'].lineData[210]++;
      return false;
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[213]++;
      return nonTerminals[symbol].get("nullable");
    }
  }
}, 
  findFirst: function(symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[15]++;
  _$jscoverage['/kison/grammar.js'].lineData[218]++;
  var self = this, firsts = {}, t, i, nonTerminals = self.get("nonTerminals");
  _$jscoverage['/kison/grammar.js'].lineData[224]++;
  if (visit18_224_1(symbol instanceof Array)) {
    _$jscoverage['/kison/grammar.js'].lineData[225]++;
    for (i = 0; t = symbol[i]; ++i) {
      _$jscoverage['/kison/grammar.js'].lineData[226]++;
      if (visit19_226_1(!nonTerminals[t])) {
        _$jscoverage['/kison/grammar.js'].lineData[227]++;
        firsts[t] = 1;
      } else {
        _$jscoverage['/kison/grammar.js'].lineData[229]++;
        mix(firsts, nonTerminals[t].get("firsts"));
      }
      _$jscoverage['/kison/grammar.js'].lineData[231]++;
      if (visit20_231_1(!self.isNullable(t))) {
        _$jscoverage['/kison/grammar.js'].lineData[232]++;
        break;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[234]++;
    return firsts;
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[236]++;
    if (visit21_236_1(!nonTerminals[symbol])) {
      _$jscoverage['/kison/grammar.js'].lineData[237]++;
      return [symbol];
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[240]++;
      return nonTerminals[symbol].get("firsts");
    }
  }
}, 
  buildFirsts: function() {
  _$jscoverage['/kison/grammar.js'].functionData[16]++;
  _$jscoverage['/kison/grammar.js'].lineData[245]++;
  var self = this, nonTerminal, productions = self.get("productions"), nonTerminals = self.get("nonTerminals"), cont = true, symbol, firsts;
  _$jscoverage['/kison/grammar.js'].lineData[253]++;
  while (cont) {
    _$jscoverage['/kison/grammar.js'].lineData[254]++;
    cont = false;
    _$jscoverage['/kison/grammar.js'].lineData[262]++;
    S.each(self.get("productions"), function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[17]++;
  _$jscoverage['/kison/grammar.js'].lineData[263]++;
  var firsts = self.findFirst(production.get("rhs"));
  _$jscoverage['/kison/grammar.js'].lineData[264]++;
  if (visit22_264_1(setSize(firsts) !== setSize(production.get("firsts")))) {
    _$jscoverage['/kison/grammar.js'].lineData[265]++;
    production.set("firsts", firsts);
    _$jscoverage['/kison/grammar.js'].lineData[266]++;
    cont = true;
  }
});
    _$jscoverage['/kison/grammar.js'].lineData[270]++;
    for (symbol in nonTerminals) {
      _$jscoverage['/kison/grammar.js'].lineData[272]++;
      nonTerminal = nonTerminals[symbol];
      _$jscoverage['/kison/grammar.js'].lineData[273]++;
      firsts = {};
      _$jscoverage['/kison/grammar.js'].lineData[274]++;
      S.each(nonTerminal.get("productions"), function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[18]++;
  _$jscoverage['/kison/grammar.js'].lineData[275]++;
  mix(firsts, production.get("firsts"));
});
      _$jscoverage['/kison/grammar.js'].lineData[277]++;
      if (visit23_277_1(setSize(firsts) !== setSize(nonTerminal.get("firsts")))) {
        _$jscoverage['/kison/grammar.js'].lineData[278]++;
        nonTerminal.set("firsts", firsts);
        _$jscoverage['/kison/grammar.js'].lineData[279]++;
        cont = true;
      }
    }
  }
}, 
  closure: function(itemSet) {
  _$jscoverage['/kison/grammar.js'].functionData[19]++;
  _$jscoverage['/kison/grammar.js'].lineData[287]++;
  var self = this, items = itemSet.get("items"), productions = self.get("productions"), cont = 1;
  _$jscoverage['/kison/grammar.js'].lineData[292]++;
  while (cont) {
    _$jscoverage['/kison/grammar.js'].lineData[293]++;
    cont = false;
    _$jscoverage['/kison/grammar.js'].lineData[294]++;
    S.each(items, function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[20]++;
  _$jscoverage['/kison/grammar.js'].lineData[296]++;
  var dotPosition = item.get("dotPosition"), production = item.get("production"), rhs = production.get("rhs"), dotSymbol = rhs[dotPosition], lookAhead = item.get("lookAhead"), finalFirsts = {};
  _$jscoverage['/kison/grammar.js'].lineData[303]++;
  S.each(lookAhead, function(_, ahead) {
  _$jscoverage['/kison/grammar.js'].functionData[21]++;
  _$jscoverage['/kison/grammar.js'].lineData[304]++;
  var rightRhs = rhs.slice(dotPosition + 1);
  _$jscoverage['/kison/grammar.js'].lineData[305]++;
  rightRhs.push(ahead);
  _$jscoverage['/kison/grammar.js'].lineData[306]++;
  S.mix(finalFirsts, self.findFirst(rightRhs));
});
  _$jscoverage['/kison/grammar.js'].lineData[309]++;
  S.each(productions, function(p2) {
  _$jscoverage['/kison/grammar.js'].functionData[22]++;
  _$jscoverage['/kison/grammar.js'].lineData[310]++;
  if (visit24_310_1(p2.get("symbol") == dotSymbol)) {
    _$jscoverage['/kison/grammar.js'].lineData[312]++;
    var newItem = new Item({
  production: p2}), itemIndex = itemSet.findItemIndex(newItem, true), findItem;
    _$jscoverage['/kison/grammar.js'].lineData[326]++;
    if (visit25_326_1(itemIndex != -1)) {
      _$jscoverage['/kison/grammar.js'].lineData[327]++;
      findItem = itemSet.getItemAt(itemIndex);
      _$jscoverage['/kison/grammar.js'].lineData[328]++;
      cont = visit26_328_1(cont || (!!findItem.addLookAhead(finalFirsts)));
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[330]++;
      newItem.addLookAhead(finalFirsts);
      _$jscoverage['/kison/grammar.js'].lineData[331]++;
      itemSet.addItem(newItem);
      _$jscoverage['/kison/grammar.js'].lineData[332]++;
      cont = true;
    }
  }
});
});
  }
  _$jscoverage['/kison/grammar.js'].lineData[341]++;
  return itemSet;
}, 
  gotos: function(i, x) {
  _$jscoverage['/kison/grammar.js'].functionData[23]++;
  _$jscoverage['/kison/grammar.js'].lineData[345]++;
  var j = new ItemSet(), iItems = i.get("items");
  _$jscoverage['/kison/grammar.js'].lineData[347]++;
  S.each(iItems, function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[24]++;
  _$jscoverage['/kison/grammar.js'].lineData[348]++;
  var production = item.get("production"), dotPosition = item.get("dotPosition"), markSymbol = production.get("rhs")[dotPosition];
  _$jscoverage['/kison/grammar.js'].lineData[351]++;
  if (visit27_351_1(markSymbol == x)) {
    _$jscoverage['/kison/grammar.js'].lineData[352]++;
    var newItem = new Item({
  production: production, 
  dotPosition: dotPosition + 1}), itemIndex = j.findItemIndex(newItem, true), findItem;
    _$jscoverage['/kison/grammar.js'].lineData[358]++;
    if (visit28_358_1(itemIndex != -1)) {
      _$jscoverage['/kison/grammar.js'].lineData[359]++;
      findItem = j.getItemAt(itemIndex);
      _$jscoverage['/kison/grammar.js'].lineData[360]++;
      findItem.addLookAhead(item.get("lookAhead"));
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[362]++;
      newItem.addLookAhead(item.get("lookAhead"));
      _$jscoverage['/kison/grammar.js'].lineData[363]++;
      j.addItem(newItem);
    }
  }
});
  _$jscoverage['/kison/grammar.js'].lineData[367]++;
  return this.closure(j);
}, 
  findItemSetIndex: function(itemSet) {
  _$jscoverage['/kison/grammar.js'].functionData[25]++;
  _$jscoverage['/kison/grammar.js'].lineData[371]++;
  var itemSets = this.get("itemSets"), i;
  _$jscoverage['/kison/grammar.js'].lineData[372]++;
  for (i = 0; visit29_372_1(i < itemSets.length); i++) {
    _$jscoverage['/kison/grammar.js'].lineData[373]++;
    if (visit30_373_1(itemSets[i].equals(itemSet))) {
      _$jscoverage['/kison/grammar.js'].lineData[374]++;
      return i;
    }
  }
  _$jscoverage['/kison/grammar.js'].lineData[377]++;
  return -1;
}, 
  buildItemSet: function() {
  _$jscoverage['/kison/grammar.js'].functionData[26]++;
  _$jscoverage['/kison/grammar.js'].lineData[383]++;
  var self = this, lexer = self.lexer, itemSets = self.get("itemSets"), lookAheadTmp = {}, productions = self.get("productions");
  _$jscoverage['/kison/grammar.js'].lineData[389]++;
  lookAheadTmp[lexer.mapSymbol(END_TAG)] = 1;
  _$jscoverage['/kison/grammar.js'].lineData[391]++;
  var initItemSet = self.closure(new ItemSet({
  items: [new Item({
  production: productions[0], 
  lookAhead: lookAheadTmp})]}));
  _$jscoverage['/kison/grammar.js'].lineData[401]++;
  itemSets.push(initItemSet);
  _$jscoverage['/kison/grammar.js'].lineData[403]++;
  var condition = true, symbols = S.merge(self.get("terminals"), self.get("nonTerminals"));
  _$jscoverage['/kison/grammar.js'].lineData[406]++;
  delete symbols[lexer.mapSymbol(END_TAG)];
  _$jscoverage['/kison/grammar.js'].lineData[408]++;
  while (condition) {
    _$jscoverage['/kison/grammar.js'].lineData[409]++;
    condition = false;
    _$jscoverage['/kison/grammar.js'].lineData[410]++;
    var itemSets2 = itemSets.concat();
    _$jscoverage['/kison/grammar.js'].lineData[411]++;
    S.each(itemSets2, function(itemSet) {
  _$jscoverage['/kison/grammar.js'].functionData[27]++;
  _$jscoverage['/kison/grammar.js'].lineData[412]++;
  S.each(symbols, function(v, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[28]++;
  _$jscoverage['/kison/grammar.js'].lineData[414]++;
  if (visit31_414_1(!itemSet.__cache)) {
    _$jscoverage['/kison/grammar.js'].lineData[415]++;
    itemSet.__cache = {};
  }
  _$jscoverage['/kison/grammar.js'].lineData[419]++;
  if (visit32_419_1(itemSet.__cache[symbol])) {
    _$jscoverage['/kison/grammar.js'].lineData[420]++;
    return;
  }
  _$jscoverage['/kison/grammar.js'].lineData[423]++;
  var itemSetNew = self.gotos(itemSet, symbol);
  _$jscoverage['/kison/grammar.js'].lineData[425]++;
  itemSet.__cache[symbol] = 1;
  _$jscoverage['/kison/grammar.js'].lineData[427]++;
  if (visit33_427_1(itemSetNew.size() == 0)) {
    _$jscoverage['/kison/grammar.js'].lineData[428]++;
    return;
  }
  _$jscoverage['/kison/grammar.js'].lineData[431]++;
  var index = self.findItemSetIndex(itemSetNew);
  _$jscoverage['/kison/grammar.js'].lineData[433]++;
  if (visit34_433_1(index > -1)) {
    _$jscoverage['/kison/grammar.js'].lineData[434]++;
    itemSetNew = itemSets[index];
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[436]++;
    itemSets.push(itemSetNew);
    _$jscoverage['/kison/grammar.js'].lineData[437]++;
    condition = true;
  }
  _$jscoverage['/kison/grammar.js'].lineData[440]++;
  itemSet.get("gotos")[symbol] = itemSetNew;
  _$jscoverage['/kison/grammar.js'].lineData[441]++;
  itemSetNew.addReverseGoto(symbol, itemSet);
});
});
  }
}, 
  buildLalrItemSets: function() {
  _$jscoverage['/kison/grammar.js'].functionData[29]++;
  _$jscoverage['/kison/grammar.js'].lineData[449]++;
  var itemSets = this.get("itemSets"), i, j, one, two;
  _$jscoverage['/kison/grammar.js'].lineData[452]++;
  for (i = 0; visit35_452_1(i < itemSets.length); i++) {
    _$jscoverage['/kison/grammar.js'].lineData[453]++;
    one = itemSets[i];
    _$jscoverage['/kison/grammar.js'].lineData[454]++;
    for (j = i + 1; visit36_454_1(j < itemSets.length); j++) {
      _$jscoverage['/kison/grammar.js'].lineData[455]++;
      two = itemSets[j];
      _$jscoverage['/kison/grammar.js'].lineData[456]++;
      if (visit37_456_1(one.equals(two, true))) {
        _$jscoverage['/kison/grammar.js'].lineData[458]++;
        for (var k = 0; visit38_458_1(k < one.get("items").length); k++) {
          _$jscoverage['/kison/grammar.js'].lineData[460]++;
          one.get("items")[k].addLookAhead(two.get("items")[k].get("lookAhead"));
        }
        _$jscoverage['/kison/grammar.js'].lineData[464]++;
        var oneGotos = one.get("gotos");
        _$jscoverage['/kison/grammar.js'].lineData[466]++;
        S.each(two.get("gotos"), function(item, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[30]++;
  _$jscoverage['/kison/grammar.js'].lineData[467]++;
  oneGotos[symbol] = item;
  _$jscoverage['/kison/grammar.js'].lineData[468]++;
  item.addReverseGoto(symbol, one);
});
        _$jscoverage['/kison/grammar.js'].lineData[471]++;
        S.each(two.get("reverseGotos"), function(items, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[31]++;
  _$jscoverage['/kison/grammar.js'].lineData[472]++;
  S.each(items, function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[32]++;
  _$jscoverage['/kison/grammar.js'].lineData[473]++;
  item.get("gotos")[symbol] = one;
  _$jscoverage['/kison/grammar.js'].lineData[474]++;
  one.addReverseGoto(symbol, item);
});
});
        _$jscoverage['/kison/grammar.js'].lineData[478]++;
        itemSets.splice(j--, 1);
      }
    }
  }
}, 
  buildTable: function() {
  _$jscoverage['/kison/grammar.js'].functionData[33]++;
  _$jscoverage['/kison/grammar.js'].lineData[485]++;
  var self = this, lexer = self.lexer, table = self.get("table"), itemSets = self.get("itemSets"), productions = self.get("productions"), mappedStartTag = lexer.mapSymbol(START_TAG), mappedEndTag = lexer.mapSymbol(END_TAG), gotos = {}, action = {}, nonTerminals, i, itemSet, t;
  _$jscoverage['/kison/grammar.js'].lineData[499]++;
  table.gotos = gotos;
  _$jscoverage['/kison/grammar.js'].lineData[500]++;
  table.action = action;
  _$jscoverage['/kison/grammar.js'].lineData[501]++;
  nonTerminals = self.get("nonTerminals");
  _$jscoverage['/kison/grammar.js'].lineData[503]++;
  for (i = 0; visit39_503_1(i < itemSets.length); i++) {
    _$jscoverage['/kison/grammar.js'].lineData[505]++;
    itemSet = itemSets[i];
    _$jscoverage['/kison/grammar.js'].lineData[507]++;
    S.each(itemSet.get("items"), function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[34]++;
  _$jscoverage['/kison/grammar.js'].lineData[508]++;
  var production = item.get("production");
  _$jscoverage['/kison/grammar.js'].lineData[509]++;
  var val;
  _$jscoverage['/kison/grammar.js'].lineData[510]++;
  if (visit40_510_1(item.get("dotPosition") == production.get("rhs").length)) {
    _$jscoverage['/kison/grammar.js'].lineData[511]++;
    if (visit41_511_1(production.get("symbol") == mappedStartTag)) {
      _$jscoverage['/kison/grammar.js'].lineData[512]++;
      if (visit42_512_1(item.get("lookAhead")[mappedEndTag])) {
        _$jscoverage['/kison/grammar.js'].lineData[513]++;
        action[i] = visit43_513_1(action[i] || {});
        _$jscoverage['/kison/grammar.js'].lineData[514]++;
        t = action[i][mappedEndTag];
        _$jscoverage['/kison/grammar.js'].lineData[515]++;
        val = [];
        _$jscoverage['/kison/grammar.js'].lineData[516]++;
        val[GrammarConst.TYPE_INDEX] = GrammarConst.ACCEPT_TYPE;
        _$jscoverage['/kison/grammar.js'].lineData[517]++;
        if (visit44_517_1(t && visit45_517_2(t.toString() != val.toString()))) {
          _$jscoverage['/kison/grammar.js'].lineData[518]++;
          logger.debug(new Array(29).join('*'));
          _$jscoverage['/kison/grammar.js'].lineData[519]++;
          logger.debug('***** conflict in reduce: action already defined ->', 'warn');
          _$jscoverage['/kison/grammar.js'].lineData[521]++;
          logger.debug('***** current item:', 'info');
          _$jscoverage['/kison/grammar.js'].lineData[522]++;
          logger.debug(item.toString());
          _$jscoverage['/kison/grammar.js'].lineData[523]++;
          logger.debug('***** current action:', 'info');
          _$jscoverage['/kison/grammar.js'].lineData[524]++;
          visualizeAction(t, productions, itemSets);
          _$jscoverage['/kison/grammar.js'].lineData[525]++;
          logger.debug('***** will be overwritten ->', 'info');
          _$jscoverage['/kison/grammar.js'].lineData[526]++;
          visualizeAction(val, productions, itemSets);
        }
        _$jscoverage['/kison/grammar.js'].lineData[528]++;
        action[i][mappedEndTag] = val;
      }
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[531]++;
      action[i] = visit46_531_1(action[i] || {});
      _$jscoverage['/kison/grammar.js'].lineData[536]++;
      S.each(item.get("lookAhead"), function(_, l) {
  _$jscoverage['/kison/grammar.js'].functionData[35]++;
  _$jscoverage['/kison/grammar.js'].lineData[537]++;
  t = action[i][l];
  _$jscoverage['/kison/grammar.js'].lineData[538]++;
  val = [];
  _$jscoverage['/kison/grammar.js'].lineData[539]++;
  val[GrammarConst.TYPE_INDEX] = GrammarConst.REDUCE_TYPE;
  _$jscoverage['/kison/grammar.js'].lineData[540]++;
  val[GrammarConst.PRODUCTION_INDEX] = S.indexOf(production, productions);
  _$jscoverage['/kison/grammar.js'].lineData[541]++;
  if (visit47_541_1(t && visit48_541_2(t.toString() != val.toString()))) {
    _$jscoverage['/kison/grammar.js'].lineData[542]++;
    logger.debug(new Array(29).join('*'));
    _$jscoverage['/kison/grammar.js'].lineData[543]++;
    logger.debug('conflict in reduce: action already defined ->', 'warn');
    _$jscoverage['/kison/grammar.js'].lineData[545]++;
    logger.debug('***** current item:', 'info');
    _$jscoverage['/kison/grammar.js'].lineData[546]++;
    logger.debug(item.toString());
    _$jscoverage['/kison/grammar.js'].lineData[547]++;
    logger.debug('***** current action:', 'info');
    _$jscoverage['/kison/grammar.js'].lineData[548]++;
    visualizeAction(t, productions, itemSets);
    _$jscoverage['/kison/grammar.js'].lineData[549]++;
    logger.debug('***** will be overwritten ->', 'info');
    _$jscoverage['/kison/grammar.js'].lineData[550]++;
    visualizeAction(val, productions, itemSets);
  }
  _$jscoverage['/kison/grammar.js'].lineData[552]++;
  action[i][l] = val;
});
    }
  }
});
    _$jscoverage['/kison/grammar.js'].lineData[559]++;
    S.each(itemSet.get("gotos"), function(anotherItemSet, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[36]++;
  _$jscoverage['/kison/grammar.js'].lineData[560]++;
  var val;
  _$jscoverage['/kison/grammar.js'].lineData[561]++;
  if (visit49_561_1(!nonTerminals[symbol])) {
    _$jscoverage['/kison/grammar.js'].lineData[562]++;
    action[i] = visit50_562_1(action[i] || {});
    _$jscoverage['/kison/grammar.js'].lineData[563]++;
    val = [];
    _$jscoverage['/kison/grammar.js'].lineData[564]++;
    val[GrammarConst.TYPE_INDEX] = GrammarConst.SHIFT_TYPE;
    _$jscoverage['/kison/grammar.js'].lineData[565]++;
    val[GrammarConst.TO_INDEX] = indexOf(anotherItemSet, itemSets);
    _$jscoverage['/kison/grammar.js'].lineData[566]++;
    t = action[i][symbol];
    _$jscoverage['/kison/grammar.js'].lineData[567]++;
    if (visit51_567_1(t && visit52_567_2(t.toString() != val.toString()))) {
      _$jscoverage['/kison/grammar.js'].lineData[568]++;
      logger.debug(new Array(29).join('*'));
      _$jscoverage['/kison/grammar.js'].lineData[569]++;
      logger.debug('conflict in shift: action already defined ->', 'warn');
      _$jscoverage['/kison/grammar.js'].lineData[571]++;
      logger.debug('***** current itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[572]++;
      logger.debug(itemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[573]++;
      logger.debug('***** current symbol:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[574]++;
      logger.debug(symbol);
      _$jscoverage['/kison/grammar.js'].lineData[575]++;
      logger.debug('***** goto itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[576]++;
      logger.debug(anotherItemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[577]++;
      logger.debug('***** current action:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[578]++;
      visualizeAction(t, productions, itemSets);
      _$jscoverage['/kison/grammar.js'].lineData[579]++;
      logger.debug('***** will be overwritten ->', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[580]++;
      visualizeAction(val, productions, itemSets);
    }
    _$jscoverage['/kison/grammar.js'].lineData[582]++;
    action[i][symbol] = val;
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[584]++;
    gotos[i] = visit53_584_1(gotos[i] || {});
    _$jscoverage['/kison/grammar.js'].lineData[585]++;
    t = gotos[i][symbol];
    _$jscoverage['/kison/grammar.js'].lineData[586]++;
    val = indexOf(anotherItemSet, itemSets);
    _$jscoverage['/kison/grammar.js'].lineData[587]++;
    if (visit54_587_1(t && visit55_587_2(val != t))) {
      _$jscoverage['/kison/grammar.js'].lineData[588]++;
      logger.debug(new Array(29).join('*'));
      _$jscoverage['/kison/grammar.js'].lineData[589]++;
      logger.debug('conflict in shift: goto already defined ->', 'warn');
      _$jscoverage['/kison/grammar.js'].lineData[591]++;
      logger.debug('***** current itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[592]++;
      logger.debug(itemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[593]++;
      logger.debug('***** current symbol:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[594]++;
      logger.debug(symbol);
      _$jscoverage['/kison/grammar.js'].lineData[595]++;
      logger.debug('***** goto itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[596]++;
      logger.debug(anotherItemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[597]++;
      logger.debug('***** current goto state:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[598]++;
      logger.debug(t);
      _$jscoverage['/kison/grammar.js'].lineData[599]++;
      logger.debug('***** will be overwritten ->', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[600]++;
      logger.debug(val);
    }
    _$jscoverage['/kison/grammar.js'].lineData[602]++;
    gotos[i][symbol] = val;
  }
});
  }
}, 
  visualizeTable: function() {
  _$jscoverage['/kison/grammar.js'].functionData[37]++;
  _$jscoverage['/kison/grammar.js'].lineData[610]++;
  var self = this, table = self.get("table"), gotos = table.gotos, action = table.action, productions = self.get("productions"), ret = [];
  _$jscoverage['/kison/grammar.js'].lineData[617]++;
  S.each(self.get("itemSets"), function(itemSet, i) {
  _$jscoverage['/kison/grammar.js'].functionData[38]++;
  _$jscoverage['/kison/grammar.js'].lineData[618]++;
  ret.push(new Array(70).join("*") + " itemSet : " + i);
  _$jscoverage['/kison/grammar.js'].lineData[619]++;
  ret.push(itemSet.toString());
  _$jscoverage['/kison/grammar.js'].lineData[620]++;
  ret.push("");
});
  _$jscoverage['/kison/grammar.js'].lineData[623]++;
  ret.push("");
  _$jscoverage['/kison/grammar.js'].lineData[625]++;
  ret.push(new Array(70).join("*") + " table : ");
  _$jscoverage['/kison/grammar.js'].lineData[627]++;
  S.each(action, function(av, index) {
  _$jscoverage['/kison/grammar.js'].functionData[39]++;
  _$jscoverage['/kison/grammar.js'].lineData[628]++;
  S.each(av, function(v, s) {
  _$jscoverage['/kison/grammar.js'].functionData[40]++;
  _$jscoverage['/kison/grammar.js'].lineData[629]++;
  var str, type = v[GrammarConst.TYPE_INDEX];
  _$jscoverage['/kison/grammar.js'].lineData[630]++;
  if (visit56_630_1(type == GrammarConst.ACCEPT_TYPE)) {
    _$jscoverage['/kison/grammar.js'].lineData[631]++;
    str = "acc";
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[632]++;
    if (visit57_632_1(type == GrammarConst.REDUCE_TYPE)) {
      _$jscoverage['/kison/grammar.js'].lineData[633]++;
      var production = productions[v[GrammarConst.PRODUCTION_INDEX]];
      _$jscoverage['/kison/grammar.js'].lineData[634]++;
      str = "r, " + production.get("symbol") + "=" + production.get("rhs").join(" ");
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[636]++;
      if (visit58_636_1(type == GrammarConst.SHIFT_TYPE)) {
        _$jscoverage['/kison/grammar.js'].lineData[637]++;
        str = "s, " + v[GrammarConst.TO_INDEX];
      }
    }
  }
  _$jscoverage['/kison/grammar.js'].lineData[639]++;
  ret.push("action[" + index + "]" + "[" + s + "] = " + str);
});
});
  _$jscoverage['/kison/grammar.js'].lineData[643]++;
  ret.push("");
  _$jscoverage['/kison/grammar.js'].lineData[645]++;
  S.each(gotos, function(sv, index) {
  _$jscoverage['/kison/grammar.js'].functionData[41]++;
  _$jscoverage['/kison/grammar.js'].lineData[646]++;
  S.each(sv, function(v, s) {
  _$jscoverage['/kison/grammar.js'].functionData[42]++;
  _$jscoverage['/kison/grammar.js'].lineData[647]++;
  ret.push("goto[" + index + "]" + "[" + s + "] = " + v);
});
});
  _$jscoverage['/kison/grammar.js'].lineData[651]++;
  return ret;
}, 
  genCode: function(cfg) {
  _$jscoverage['/kison/grammar.js'].functionData[43]++;
  _$jscoverage['/kison/grammar.js'].lineData[655]++;
  cfg = visit59_655_1(cfg || {});
  _$jscoverage['/kison/grammar.js'].lineData[657]++;
  var self = this, table = self.get("table"), lexer = self.get("lexer"), lexerCode = lexer.genCode(cfg);
  _$jscoverage['/kison/grammar.js'].lineData[662]++;
  self.build();
  _$jscoverage['/kison/grammar.js'].lineData[664]++;
  var productions = [];
  _$jscoverage['/kison/grammar.js'].lineData[666]++;
  S.each(self.get("productions"), function(p) {
  _$jscoverage['/kison/grammar.js'].functionData[44]++;
  _$jscoverage['/kison/grammar.js'].lineData[667]++;
  var action = p.get("action"), ret = [p.get('symbol'), p.get('rhs')];
  _$jscoverage['/kison/grammar.js'].lineData[669]++;
  if (visit60_669_1(action)) {
    _$jscoverage['/kison/grammar.js'].lineData[670]++;
    ret.push(action);
  }
  _$jscoverage['/kison/grammar.js'].lineData[672]++;
  productions.push(ret);
});
  _$jscoverage['/kison/grammar.js'].lineData[675]++;
  var code = [];
  _$jscoverage['/kison/grammar.js'].lineData[677]++;
  code.push("/* Generated by kison from KISSY */");
  _$jscoverage['/kison/grammar.js'].lineData[679]++;
  code.push("var parser = {}," + "S = KISSY," + "GrammarConst = " + serializeObject(GrammarConst) + ";");
  _$jscoverage['/kison/grammar.js'].lineData[684]++;
  code.push(lexerCode);
  _$jscoverage['/kison/grammar.js'].lineData[686]++;
  code.push("parser.lexer = lexer;");
  _$jscoverage['/kison/grammar.js'].lineData[688]++;
  if (visit61_688_1(cfg.compressSymbol)) {
    _$jscoverage['/kison/grammar.js'].lineData[689]++;
    code.push("lexer.symbolMap = " + serializeObject(lexer.symbolMap) + ";");
  }
  _$jscoverage['/kison/grammar.js'].lineData[692]++;
  code.push('parser.productions = ' + serializeObject(productions) + ";");
  _$jscoverage['/kison/grammar.js'].lineData[693]++;
  code.push("parser.table = " + serializeObject(table) + ";");
  _$jscoverage['/kison/grammar.js'].lineData[694]++;
  code.push("parser.parse = " + parse.toString() + ";");
  _$jscoverage['/kison/grammar.js'].lineData[695]++;
  code.push("return parser;");
  _$jscoverage['/kison/grammar.js'].lineData[696]++;
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
  _$jscoverage['/kison/grammar.js'].lineData[715]++;
  if (visit62_715_1(!(v instanceof Lexer))) {
    _$jscoverage['/kison/grammar.js'].lineData[716]++;
    v = new Lexer(v);
  }
  _$jscoverage['/kison/grammar.js'].lineData[718]++;
  this.lexer = v;
  _$jscoverage['/kison/grammar.js'].lineData[719]++;
  return v;
}}, 
  terminals: {
  value: {}}}});
  _$jscoverage['/kison/grammar.js'].lineData[730]++;
  function parse(input) {
    _$jscoverage['/kison/grammar.js'].functionData[46]++;
    _$jscoverage['/kison/grammar.js'].lineData[731]++;
    var self = this, lexer = self.lexer, state, symbol, action, table = self.table, gotos = table.gotos, tableAction = table.action, productions = self.productions, valueStack = [null], stack = [0];
    _$jscoverage['/kison/grammar.js'].lineData[743]++;
    lexer.resetInput(input);
    _$jscoverage['/kison/grammar.js'].lineData[745]++;
    while (1) {
      _$jscoverage['/kison/grammar.js'].lineData[747]++;
      state = stack[stack.length - 1];
      _$jscoverage['/kison/grammar.js'].lineData[749]++;
      if (visit63_749_1(!symbol)) {
        _$jscoverage['/kison/grammar.js'].lineData[750]++;
        symbol = lexer.lex();
      }
      _$jscoverage['/kison/grammar.js'].lineData[753]++;
      if (visit64_753_1(!symbol)) {
        _$jscoverage['/kison/grammar.js'].lineData[754]++;
        S.log("it is not a valid input: " + input, 'error');
        _$jscoverage['/kison/grammar.js'].lineData[755]++;
        return false;
      }
      _$jscoverage['/kison/grammar.js'].lineData[759]++;
      action = visit65_759_1(tableAction[state] && tableAction[state][symbol]);
      _$jscoverage['/kison/grammar.js'].lineData[761]++;
      if (visit66_761_1(!action)) {
        _$jscoverage['/kison/grammar.js'].lineData[762]++;
        var expected = [], error;
        _$jscoverage['/kison/grammar.js'].lineData[763]++;
        if (visit67_763_1(tableAction[state])) {
          _$jscoverage['/kison/grammar.js'].lineData[764]++;
          S.each(tableAction[state], function(_, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[47]++;
  _$jscoverage['/kison/grammar.js'].lineData[765]++;
  expected.push(self.lexer.mapReverseSymbol(symbol));
});
        }
        _$jscoverage['/kison/grammar.js'].lineData[768]++;
        error = "Syntax error at line " + lexer.lineNumber + ":\n" + lexer.showDebugInfo() + "\n" + "expect " + expected.join(", ");
        _$jscoverage['/kison/grammar.js'].lineData[771]++;
        S.error(error);
        _$jscoverage['/kison/grammar.js'].lineData[772]++;
        return false;
      }
      _$jscoverage['/kison/grammar.js'].lineData[775]++;
      switch (action[GrammarConst.TYPE_INDEX]) {
        case GrammarConst.SHIFT_TYPE:
          _$jscoverage['/kison/grammar.js'].lineData[777]++;
          stack.push(symbol);
          _$jscoverage['/kison/grammar.js'].lineData[779]++;
          valueStack.push(lexer.text);
          _$jscoverage['/kison/grammar.js'].lineData[782]++;
          stack.push(action[GrammarConst.TO_INDEX]);
          _$jscoverage['/kison/grammar.js'].lineData[785]++;
          symbol = null;
          _$jscoverage['/kison/grammar.js'].lineData[787]++;
          break;
        case GrammarConst.REDUCE_TYPE:
          _$jscoverage['/kison/grammar.js'].lineData[790]++;
          var production = productions[action[GrammarConst.PRODUCTION_INDEX]], reducedSymbol = visit68_791_1(production.symbol || production[0]), reducedAction = visit69_792_1(production.action || production[2]), reducedRhs = visit70_793_1(production.rhs || production[1]), len = reducedRhs.length, i = 0, ret = undefined, $$ = valueStack[valueStack.length - len];
          _$jscoverage['/kison/grammar.js'].lineData[799]++;
          self.$$ = $$;
          _$jscoverage['/kison/grammar.js'].lineData[801]++;
          for (; visit71_801_1(i < len); i++) {
            _$jscoverage['/kison/grammar.js'].lineData[802]++;
            self["$" + (len - i)] = valueStack[valueStack.length - 1 - i];
          }
          _$jscoverage['/kison/grammar.js'].lineData[805]++;
          if (visit72_805_1(reducedAction)) {
            _$jscoverage['/kison/grammar.js'].lineData[806]++;
            ret = reducedAction.call(self);
          }
          _$jscoverage['/kison/grammar.js'].lineData[809]++;
          if (visit73_809_1(ret !== undefined)) {
            _$jscoverage['/kison/grammar.js'].lineData[810]++;
            $$ = ret;
          } else {
            _$jscoverage['/kison/grammar.js'].lineData[812]++;
            $$ = self.$$;
          }
          _$jscoverage['/kison/grammar.js'].lineData[815]++;
          if (visit74_815_1(len)) {
            _$jscoverage['/kison/grammar.js'].lineData[816]++;
            stack = stack.slice(0, -1 * len * 2);
            _$jscoverage['/kison/grammar.js'].lineData[817]++;
            valueStack = valueStack.slice(0, -1 * len);
          }
          _$jscoverage['/kison/grammar.js'].lineData[820]++;
          stack.push(reducedSymbol);
          _$jscoverage['/kison/grammar.js'].lineData[822]++;
          valueStack.push($$);
          _$jscoverage['/kison/grammar.js'].lineData[824]++;
          var newState = gotos[stack[stack.length - 2]][stack[stack.length - 1]];
          _$jscoverage['/kison/grammar.js'].lineData[826]++;
          stack.push(newState);
          _$jscoverage['/kison/grammar.js'].lineData[828]++;
          break;
        case GrammarConst.ACCEPT_TYPE:
          _$jscoverage['/kison/grammar.js'].lineData[831]++;
          return $$;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[836]++;
    return undefined;
  }
});
