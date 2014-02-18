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
if (! _$jscoverage['/drag.js']) {
  _$jscoverage['/drag.js'] = {};
  _$jscoverage['/drag.js'].lineData = [];
  _$jscoverage['/drag.js'].lineData[6] = 0;
  _$jscoverage['/drag.js'].lineData[7] = 0;
  _$jscoverage['/drag.js'].lineData[8] = 0;
  _$jscoverage['/drag.js'].lineData[9] = 0;
  _$jscoverage['/drag.js'].lineData[11] = 0;
  _$jscoverage['/drag.js'].lineData[13] = 0;
  _$jscoverage['/drag.js'].lineData[15] = 0;
  _$jscoverage['/drag.js'].lineData[17] = 0;
  _$jscoverage['/drag.js'].lineData[19] = 0;
  _$jscoverage['/drag.js'].lineData[21] = 0;
  _$jscoverage['/drag.js'].lineData[23] = 0;
  _$jscoverage['/drag.js'].lineData[24] = 0;
  _$jscoverage['/drag.js'].lineData[26] = 0;
  _$jscoverage['/drag.js'].lineData[27] = 0;
  _$jscoverage['/drag.js'].lineData[28] = 0;
  _$jscoverage['/drag.js'].lineData[31] = 0;
  _$jscoverage['/drag.js'].lineData[32] = 0;
  _$jscoverage['/drag.js'].lineData[33] = 0;
  _$jscoverage['/drag.js'].lineData[35] = 0;
  _$jscoverage['/drag.js'].lineData[39] = 0;
  _$jscoverage['/drag.js'].lineData[41] = 0;
  _$jscoverage['/drag.js'].lineData[52] = 0;
  _$jscoverage['/drag.js'].lineData[53] = 0;
  _$jscoverage['/drag.js'].lineData[54] = 0;
  _$jscoverage['/drag.js'].lineData[57] = 0;
  _$jscoverage['/drag.js'].lineData[58] = 0;
  _$jscoverage['/drag.js'].lineData[61] = 0;
  _$jscoverage['/drag.js'].lineData[62] = 0;
  _$jscoverage['/drag.js'].lineData[63] = 0;
  _$jscoverage['/drag.js'].lineData[64] = 0;
  _$jscoverage['/drag.js'].lineData[65] = 0;
  _$jscoverage['/drag.js'].lineData[66] = 0;
  _$jscoverage['/drag.js'].lineData[67] = 0;
  _$jscoverage['/drag.js'].lineData[68] = 0;
  _$jscoverage['/drag.js'].lineData[71] = 0;
  _$jscoverage['/drag.js'].lineData[74] = 0;
  _$jscoverage['/drag.js'].lineData[76] = 0;
  _$jscoverage['/drag.js'].lineData[77] = 0;
  _$jscoverage['/drag.js'].lineData[81] = 0;
  _$jscoverage['/drag.js'].lineData[82] = 0;
  _$jscoverage['/drag.js'].lineData[84] = 0;
  _$jscoverage['/drag.js'].lineData[87] = 0;
  _$jscoverage['/drag.js'].lineData[88] = 0;
  _$jscoverage['/drag.js'].lineData[89] = 0;
  _$jscoverage['/drag.js'].lineData[90] = 0;
  _$jscoverage['/drag.js'].lineData[92] = 0;
  _$jscoverage['/drag.js'].lineData[95] = 0;
  _$jscoverage['/drag.js'].lineData[96] = 0;
  _$jscoverage['/drag.js'].lineData[97] = 0;
  _$jscoverage['/drag.js'].lineData[98] = 0;
  _$jscoverage['/drag.js'].lineData[100] = 0;
  _$jscoverage['/drag.js'].lineData[107] = 0;
  _$jscoverage['/drag.js'].lineData[108] = 0;
  _$jscoverage['/drag.js'].lineData[109] = 0;
  _$jscoverage['/drag.js'].lineData[110] = 0;
  _$jscoverage['/drag.js'].lineData[112] = 0;
  _$jscoverage['/drag.js'].lineData[113] = 0;
  _$jscoverage['/drag.js'].lineData[114] = 0;
  _$jscoverage['/drag.js'].lineData[115] = 0;
  _$jscoverage['/drag.js'].lineData[121] = 0;
  _$jscoverage['/drag.js'].lineData[124] = 0;
  _$jscoverage['/drag.js'].lineData[125] = 0;
  _$jscoverage['/drag.js'].lineData[126] = 0;
  _$jscoverage['/drag.js'].lineData[129] = 0;
  _$jscoverage['/drag.js'].lineData[130] = 0;
  _$jscoverage['/drag.js'].lineData[134] = 0;
  _$jscoverage['/drag.js'].lineData[135] = 0;
  _$jscoverage['/drag.js'].lineData[136] = 0;
  _$jscoverage['/drag.js'].lineData[142] = 0;
  _$jscoverage['/drag.js'].lineData[144] = 0;
  _$jscoverage['/drag.js'].lineData[149] = 0;
  _$jscoverage['/drag.js'].lineData[160] = 0;
  _$jscoverage['/drag.js'].lineData[161] = 0;
  _$jscoverage['/drag.js'].lineData[163] = 0;
  _$jscoverage['/drag.js'].lineData[166] = 0;
  _$jscoverage['/drag.js'].lineData[167] = 0;
  _$jscoverage['/drag.js'].lineData[168] = 0;
  _$jscoverage['/drag.js'].lineData[169] = 0;
  _$jscoverage['/drag.js'].lineData[170] = 0;
  _$jscoverage['/drag.js'].lineData[172] = 0;
  _$jscoverage['/drag.js'].lineData[174] = 0;
  _$jscoverage['/drag.js'].lineData[175] = 0;
  _$jscoverage['/drag.js'].lineData[176] = 0;
  _$jscoverage['/drag.js'].lineData[177] = 0;
  _$jscoverage['/drag.js'].lineData[178] = 0;
  _$jscoverage['/drag.js'].lineData[181] = 0;
  _$jscoverage['/drag.js'].lineData[182] = 0;
  _$jscoverage['/drag.js'].lineData[186] = 0;
  _$jscoverage['/drag.js'].lineData[188] = 0;
  _$jscoverage['/drag.js'].lineData[189] = 0;
  _$jscoverage['/drag.js'].lineData[191] = 0;
  _$jscoverage['/drag.js'].lineData[192] = 0;
  _$jscoverage['/drag.js'].lineData[193] = 0;
  _$jscoverage['/drag.js'].lineData[195] = 0;
  _$jscoverage['/drag.js'].lineData[196] = 0;
  _$jscoverage['/drag.js'].lineData[197] = 0;
  _$jscoverage['/drag.js'].lineData[199] = 0;
  _$jscoverage['/drag.js'].lineData[200] = 0;
  _$jscoverage['/drag.js'].lineData[206] = 0;
  _$jscoverage['/drag.js'].lineData[208] = 0;
  _$jscoverage['/drag.js'].lineData[210] = 0;
  _$jscoverage['/drag.js'].lineData[212] = 0;
  _$jscoverage['/drag.js'].lineData[216] = 0;
  _$jscoverage['/drag.js'].lineData[217] = 0;
  _$jscoverage['/drag.js'].lineData[218] = 0;
  _$jscoverage['/drag.js'].lineData[220] = 0;
  _$jscoverage['/drag.js'].lineData[225] = 0;
  _$jscoverage['/drag.js'].lineData[227] = 0;
  _$jscoverage['/drag.js'].lineData[228] = 0;
  _$jscoverage['/drag.js'].lineData[230] = 0;
  _$jscoverage['/drag.js'].lineData[232] = 0;
  _$jscoverage['/drag.js'].lineData[233] = 0;
  _$jscoverage['/drag.js'].lineData[235] = 0;
  _$jscoverage['/drag.js'].lineData[236] = 0;
  _$jscoverage['/drag.js'].lineData[240] = 0;
  _$jscoverage['/drag.js'].lineData[241] = 0;
  _$jscoverage['/drag.js'].lineData[242] = 0;
  _$jscoverage['/drag.js'].lineData[243] = 0;
  _$jscoverage['/drag.js'].lineData[248] = 0;
  _$jscoverage['/drag.js'].lineData[249] = 0;
  _$jscoverage['/drag.js'].lineData[251] = 0;
  _$jscoverage['/drag.js'].lineData[252] = 0;
  _$jscoverage['/drag.js'].lineData[253] = 0;
  _$jscoverage['/drag.js'].lineData[254] = 0;
  _$jscoverage['/drag.js'].lineData[257] = 0;
  _$jscoverage['/drag.js'].lineData[260] = 0;
  _$jscoverage['/drag.js'].lineData[261] = 0;
  _$jscoverage['/drag.js'].lineData[262] = 0;
  _$jscoverage['/drag.js'].lineData[264] = 0;
  _$jscoverage['/drag.js'].lineData[267] = 0;
  _$jscoverage['/drag.js'].lineData[268] = 0;
  _$jscoverage['/drag.js'].lineData[271] = 0;
  _$jscoverage['/drag.js'].lineData[276] = 0;
  _$jscoverage['/drag.js'].lineData[277] = 0;
  _$jscoverage['/drag.js'].lineData[280] = 0;
  _$jscoverage['/drag.js'].lineData[281] = 0;
  _$jscoverage['/drag.js'].lineData[283] = 0;
  _$jscoverage['/drag.js'].lineData[284] = 0;
  _$jscoverage['/drag.js'].lineData[285] = 0;
  _$jscoverage['/drag.js'].lineData[289] = 0;
  _$jscoverage['/drag.js'].lineData[293] = 0;
  _$jscoverage['/drag.js'].lineData[294] = 0;
  _$jscoverage['/drag.js'].lineData[296] = 0;
  _$jscoverage['/drag.js'].lineData[297] = 0;
  _$jscoverage['/drag.js'].lineData[300] = 0;
  _$jscoverage['/drag.js'].lineData[302] = 0;
  _$jscoverage['/drag.js'].lineData[303] = 0;
  _$jscoverage['/drag.js'].lineData[304] = 0;
  _$jscoverage['/drag.js'].lineData[306] = 0;
  _$jscoverage['/drag.js'].lineData[309] = 0;
  _$jscoverage['/drag.js'].lineData[311] = 0;
  _$jscoverage['/drag.js'].lineData[312] = 0;
  _$jscoverage['/drag.js'].lineData[313] = 0;
  _$jscoverage['/drag.js'].lineData[315] = 0;
  _$jscoverage['/drag.js'].lineData[319] = 0;
  _$jscoverage['/drag.js'].lineData[320] = 0;
  _$jscoverage['/drag.js'].lineData[323] = 0;
  _$jscoverage['/drag.js'].lineData[324] = 0;
  _$jscoverage['/drag.js'].lineData[327] = 0;
  _$jscoverage['/drag.js'].lineData[330] = 0;
  _$jscoverage['/drag.js'].lineData[331] = 0;
  _$jscoverage['/drag.js'].lineData[334] = 0;
  _$jscoverage['/drag.js'].lineData[335] = 0;
  _$jscoverage['/drag.js'].lineData[336] = 0;
  _$jscoverage['/drag.js'].lineData[338] = 0;
  _$jscoverage['/drag.js'].lineData[339] = 0;
  _$jscoverage['/drag.js'].lineData[341] = 0;
  _$jscoverage['/drag.js'].lineData[342] = 0;
  _$jscoverage['/drag.js'].lineData[343] = 0;
  _$jscoverage['/drag.js'].lineData[345] = 0;
  _$jscoverage['/drag.js'].lineData[346] = 0;
  _$jscoverage['/drag.js'].lineData[347] = 0;
  _$jscoverage['/drag.js'].lineData[356] = 0;
  _$jscoverage['/drag.js'].lineData[357] = 0;
  _$jscoverage['/drag.js'].lineData[358] = 0;
  _$jscoverage['/drag.js'].lineData[359] = 0;
  _$jscoverage['/drag.js'].lineData[360] = 0;
  _$jscoverage['/drag.js'].lineData[361] = 0;
  _$jscoverage['/drag.js'].lineData[362] = 0;
  _$jscoverage['/drag.js'].lineData[363] = 0;
  _$jscoverage['/drag.js'].lineData[365] = 0;
  _$jscoverage['/drag.js'].lineData[366] = 0;
  _$jscoverage['/drag.js'].lineData[367] = 0;
  _$jscoverage['/drag.js'].lineData[368] = 0;
  _$jscoverage['/drag.js'].lineData[369] = 0;
  _$jscoverage['/drag.js'].lineData[370] = 0;
  _$jscoverage['/drag.js'].lineData[380] = 0;
  _$jscoverage['/drag.js'].lineData[381] = 0;
  _$jscoverage['/drag.js'].lineData[382] = 0;
  _$jscoverage['/drag.js'].lineData[385] = 0;
  _$jscoverage['/drag.js'].lineData[386] = 0;
  _$jscoverage['/drag.js'].lineData[387] = 0;
  _$jscoverage['/drag.js'].lineData[388] = 0;
  _$jscoverage['/drag.js'].lineData[389] = 0;
  _$jscoverage['/drag.js'].lineData[391] = 0;
  _$jscoverage['/drag.js'].lineData[397] = 0;
  _$jscoverage['/drag.js'].lineData[398] = 0;
  _$jscoverage['/drag.js'].lineData[400] = 0;
  _$jscoverage['/drag.js'].lineData[402] = 0;
  _$jscoverage['/drag.js'].lineData[403] = 0;
  _$jscoverage['/drag.js'].lineData[404] = 0;
  _$jscoverage['/drag.js'].lineData[407] = 0;
  _$jscoverage['/drag.js'].lineData[411] = 0;
  _$jscoverage['/drag.js'].lineData[412] = 0;
  _$jscoverage['/drag.js'].lineData[413] = 0;
  _$jscoverage['/drag.js'].lineData[414] = 0;
  _$jscoverage['/drag.js'].lineData[415] = 0;
  _$jscoverage['/drag.js'].lineData[416] = 0;
  _$jscoverage['/drag.js'].lineData[417] = 0;
  _$jscoverage['/drag.js'].lineData[421] = 0;
  _$jscoverage['/drag.js'].lineData[422] = 0;
  _$jscoverage['/drag.js'].lineData[423] = 0;
  _$jscoverage['/drag.js'].lineData[424] = 0;
  _$jscoverage['/drag.js'].lineData[425] = 0;
  _$jscoverage['/drag.js'].lineData[426] = 0;
  _$jscoverage['/drag.js'].lineData[427] = 0;
  _$jscoverage['/drag.js'].lineData[428] = 0;
  _$jscoverage['/drag.js'].lineData[429] = 0;
  _$jscoverage['/drag.js'].lineData[430] = 0;
  _$jscoverage['/drag.js'].lineData[431] = 0;
  _$jscoverage['/drag.js'].lineData[436] = 0;
  _$jscoverage['/drag.js'].lineData[437] = 0;
  _$jscoverage['/drag.js'].lineData[438] = 0;
  _$jscoverage['/drag.js'].lineData[439] = 0;
  _$jscoverage['/drag.js'].lineData[440] = 0;
  _$jscoverage['/drag.js'].lineData[441] = 0;
  _$jscoverage['/drag.js'].lineData[442] = 0;
  _$jscoverage['/drag.js'].lineData[447] = 0;
  _$jscoverage['/drag.js'].lineData[448] = 0;
  _$jscoverage['/drag.js'].lineData[449] = 0;
  _$jscoverage['/drag.js'].lineData[451] = 0;
  _$jscoverage['/drag.js'].lineData[452] = 0;
  _$jscoverage['/drag.js'].lineData[455] = 0;
  _$jscoverage['/drag.js'].lineData[458] = 0;
  _$jscoverage['/drag.js'].lineData[459] = 0;
  _$jscoverage['/drag.js'].lineData[462] = 0;
  _$jscoverage['/drag.js'].lineData[464] = 0;
  _$jscoverage['/drag.js'].lineData[465] = 0;
  _$jscoverage['/drag.js'].lineData[472] = 0;
  _$jscoverage['/drag.js'].lineData[473] = 0;
  _$jscoverage['/drag.js'].lineData[476] = 0;
  _$jscoverage['/drag.js'].lineData[477] = 0;
  _$jscoverage['/drag.js'].lineData[478] = 0;
  _$jscoverage['/drag.js'].lineData[479] = 0;
  _$jscoverage['/drag.js'].lineData[483] = 0;
  _$jscoverage['/drag.js'].lineData[484] = 0;
  _$jscoverage['/drag.js'].lineData[485] = 0;
  _$jscoverage['/drag.js'].lineData[488] = 0;
  _$jscoverage['/drag.js'].lineData[489] = 0;
  _$jscoverage['/drag.js'].lineData[498] = 0;
  _$jscoverage['/drag.js'].lineData[500] = 0;
  _$jscoverage['/drag.js'].lineData[501] = 0;
  _$jscoverage['/drag.js'].lineData[502] = 0;
  _$jscoverage['/drag.js'].lineData[503] = 0;
  _$jscoverage['/drag.js'].lineData[504] = 0;
  _$jscoverage['/drag.js'].lineData[512] = 0;
  _$jscoverage['/drag.js'].lineData[514] = 0;
  _$jscoverage['/drag.js'].lineData[518] = 0;
  _$jscoverage['/drag.js'].lineData[522] = 0;
  _$jscoverage['/drag.js'].lineData[526] = 0;
  _$jscoverage['/drag.js'].lineData[527] = 0;
}
if (! _$jscoverage['/drag.js'].functionData) {
  _$jscoverage['/drag.js'].functionData = [];
  _$jscoverage['/drag.js'].functionData[0] = 0;
  _$jscoverage['/drag.js'].functionData[1] = 0;
  _$jscoverage['/drag.js'].functionData[2] = 0;
  _$jscoverage['/drag.js'].functionData[3] = 0;
  _$jscoverage['/drag.js'].functionData[4] = 0;
  _$jscoverage['/drag.js'].functionData[5] = 0;
  _$jscoverage['/drag.js'].functionData[6] = 0;
  _$jscoverage['/drag.js'].functionData[7] = 0;
  _$jscoverage['/drag.js'].functionData[8] = 0;
  _$jscoverage['/drag.js'].functionData[9] = 0;
  _$jscoverage['/drag.js'].functionData[10] = 0;
  _$jscoverage['/drag.js'].functionData[11] = 0;
  _$jscoverage['/drag.js'].functionData[12] = 0;
  _$jscoverage['/drag.js'].functionData[13] = 0;
  _$jscoverage['/drag.js'].functionData[14] = 0;
  _$jscoverage['/drag.js'].functionData[15] = 0;
  _$jscoverage['/drag.js'].functionData[16] = 0;
  _$jscoverage['/drag.js'].functionData[17] = 0;
  _$jscoverage['/drag.js'].functionData[18] = 0;
  _$jscoverage['/drag.js'].functionData[19] = 0;
}
if (! _$jscoverage['/drag.js'].branchData) {
  _$jscoverage['/drag.js'].branchData = {};
  _$jscoverage['/drag.js'].branchData['32'] = [];
  _$jscoverage['/drag.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['39'] = [];
  _$jscoverage['/drag.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['52'] = [];
  _$jscoverage['/drag.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['53'] = [];
  _$jscoverage['/drag.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['54'] = [];
  _$jscoverage['/drag.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['57'] = [];
  _$jscoverage['/drag.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['61'] = [];
  _$jscoverage['/drag.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['65'] = [];
  _$jscoverage['/drag.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['74'] = [];
  _$jscoverage['/drag.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['74'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['74'][4] = new BranchData();
  _$jscoverage['/drag.js'].branchData['75'] = [];
  _$jscoverage['/drag.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['88'] = [];
  _$jscoverage['/drag.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['89'] = [];
  _$jscoverage['/drag.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['96'] = [];
  _$jscoverage['/drag.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['107'] = [];
  _$jscoverage['/drag.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['109'] = [];
  _$jscoverage['/drag.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['112'] = [];
  _$jscoverage['/drag.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['124'] = [];
  _$jscoverage['/drag.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['134'] = [];
  _$jscoverage['/drag.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['134'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['134'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['181'] = [];
  _$jscoverage['/drag.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['189'] = [];
  _$jscoverage['/drag.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['189'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['189'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['191'] = [];
  _$jscoverage['/drag.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['206'] = [];
  _$jscoverage['/drag.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['217'] = [];
  _$jscoverage['/drag.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['227'] = [];
  _$jscoverage['/drag.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['232'] = [];
  _$jscoverage['/drag.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['241'] = [];
  _$jscoverage['/drag.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['248'] = [];
  _$jscoverage['/drag.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['261'] = [];
  _$jscoverage['/drag.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['267'] = [];
  _$jscoverage['/drag.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['280'] = [];
  _$jscoverage['/drag.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['283'] = [];
  _$jscoverage['/drag.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['293'] = [];
  _$jscoverage['/drag.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['296'] = [];
  _$jscoverage['/drag.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['297'] = [];
  _$jscoverage['/drag.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['300'] = [];
  _$jscoverage['/drag.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['300'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['300'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['303'] = [];
  _$jscoverage['/drag.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['309'] = [];
  _$jscoverage['/drag.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['309'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['309'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['312'] = [];
  _$jscoverage['/drag.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['319'] = [];
  _$jscoverage['/drag.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['330'] = [];
  _$jscoverage['/drag.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['335'] = [];
  _$jscoverage['/drag.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['342'] = [];
  _$jscoverage['/drag.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['362'] = [];
  _$jscoverage['/drag.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['362'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['363'] = [];
  _$jscoverage['/drag.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['363'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['367'] = [];
  _$jscoverage['/drag.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['380'] = [];
  _$jscoverage['/drag.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['402'] = [];
  _$jscoverage['/drag.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['403'] = [];
  _$jscoverage['/drag.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['411'] = [];
  _$jscoverage['/drag.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['413'] = [];
  _$jscoverage['/drag.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['414'] = [];
  _$jscoverage['/drag.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['414'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['414'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['416'] = [];
  _$jscoverage['/drag.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['416'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['416'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['424'] = [];
  _$jscoverage['/drag.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['426'] = [];
  _$jscoverage['/drag.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['428'] = [];
  _$jscoverage['/drag.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['429'] = [];
  _$jscoverage['/drag.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['437'] = [];
  _$jscoverage['/drag.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['439'] = [];
  _$jscoverage['/drag.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['440'] = [];
  _$jscoverage['/drag.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['447'] = [];
  _$jscoverage['/drag.js'].branchData['447'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['448'] = [];
  _$jscoverage['/drag.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['458'] = [];
  _$jscoverage['/drag.js'].branchData['458'][1] = new BranchData();
}
_$jscoverage['/drag.js'].branchData['458'][1].init(29, 16, 'allowX || allowY');
function visit80_458_1(result) {
  _$jscoverage['/drag.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['448'][1].init(33, 26, 'newPageIndex !== pageIndex');
function visit79_448_1(result) {
  _$jscoverage['/drag.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['447'][1].init(2113, 26, 'newPageIndex !== undefined');
function visit78_447_1(result) {
  _$jscoverage['/drag.js'].branchData['447'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['440'][1].init(41, 23, 'min < nowXY.top - x.top');
function visit77_440_1(result) {
  _$jscoverage['/drag.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['439'][1].init(86, 17, 'x.top < nowXY.top');
function visit76_439_1(result) {
  _$jscoverage['/drag.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['437'][1].init(93, 15, 'i < prepareXLen');
function visit75_437_1(result) {
  _$jscoverage['/drag.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['429'][1].init(41, 23, 'min < x.top - nowXY.top');
function visit74_429_1(result) {
  _$jscoverage['/drag.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['428'][1].init(86, 17, 'x.top > nowXY.top');
function visit73_428_1(result) {
  _$jscoverage['/drag.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['426'][1].init(93, 15, 'i < prepareXLen');
function visit72_426_1(result) {
  _$jscoverage['/drag.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['424'][1].init(957, 11, 'offsetY > 0');
function visit71_424_1(result) {
  _$jscoverage['/drag.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['416'][3].init(198, 24, 'offset.left < nowXY.left');
function visit70_416_3(result) {
  _$jscoverage['/drag.js'].branchData['416'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['416'][2].init(183, 11, 'offsetX < 0');
function visit69_416_2(result) {
  _$jscoverage['/drag.js'].branchData['416'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['416'][1].init(183, 39, 'offsetX < 0 && offset.left < nowXY.left');
function visit68_416_1(result) {
  _$jscoverage['/drag.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['414'][3].init(52, 24, 'offset.left > nowXY.left');
function visit67_414_3(result) {
  _$jscoverage['/drag.js'].branchData['414'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['414'][2].init(37, 11, 'offsetX > 0');
function visit66_414_2(result) {
  _$jscoverage['/drag.js'].branchData['414'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['414'][1].init(37, 39, 'offsetX > 0 && offset.left > nowXY.left');
function visit65_414_1(result) {
  _$jscoverage['/drag.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['413'][1].init(90, 6, 'offset');
function visit64_413_1(result) {
  _$jscoverage['/drag.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['411'][1].init(307, 18, 'i < pagesOffsetLen');
function visit63_411_1(result) {
  _$jscoverage['/drag.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['403'][1].init(25, 16, 'allowX && allowY');
function visit62_403_1(result) {
  _$jscoverage['/drag.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['402'][1].init(1195, 16, 'allowX || allowY');
function visit61_402_1(result) {
  _$jscoverage['/drag.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['380'][1].init(469, 17, '!self.pagesOffset');
function visit60_380_1(result) {
  _$jscoverage['/drag.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['367'][1].init(38, 11, 'count === 2');
function visit59_367_1(result) {
  _$jscoverage['/drag.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['363'][2].init(293, 33, 'Math.abs(offsetY) > snapThreshold');
function visit58_363_2(result) {
  _$jscoverage['/drag.js'].branchData['363'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['363'][1].init(269, 57, 'self.allowScroll.top && Math.abs(offsetY) > snapThreshold');
function visit57_363_1(result) {
  _$jscoverage['/drag.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['362'][2].init(213, 33, 'Math.abs(offsetX) > snapThreshold');
function visit56_362_2(result) {
  _$jscoverage['/drag.js'].branchData['362'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['362'][1].init(188, 58, 'self.allowScroll.left && Math.abs(offsetX) > snapThreshold');
function visit55_362_1(result) {
  _$jscoverage['/drag.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['342'][1].init(260, 35, '!startMousePos || !self.isScrolling');
function visit54_342_1(result) {
  _$jscoverage['/drag.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['335'][1].init(13, 10, '!e.isTouch');
function visit53_335_1(result) {
  _$jscoverage['/drag.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['330'][1].init(10717, 7, 'S.UA.ie');
function visit52_330_1(result) {
  _$jscoverage['/drag.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['319'][1].init(1765, 33, 'S.Feature.isTouchEventSupported()');
function visit51_319_1(result) {
  _$jscoverage['/drag.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['312'][1].init(110, 27, 'self.get(\'preventDefaultY\')');
function visit50_312_1(result) {
  _$jscoverage['/drag.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['309'][3].init(569, 27, 'dragInitDirection === \'top\'');
function visit49_309_3(result) {
  _$jscoverage['/drag.js'].branchData['309'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['309'][2].init(569, 67, 'dragInitDirection === \'top\' && !self.allowScroll[dragInitDirection]');
function visit48_309_2(result) {
  _$jscoverage['/drag.js'].branchData['309'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['309'][1].init(560, 76, 'lockY && dragInitDirection === \'top\' && !self.allowScroll[dragInitDirection]');
function visit47_309_1(result) {
  _$jscoverage['/drag.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['303'][1].init(110, 27, 'self.get(\'preventDefaultX\')');
function visit46_303_1(result) {
  _$jscoverage['/drag.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['300'][3].init(235, 28, 'dragInitDirection === \'left\'');
function visit45_300_3(result) {
  _$jscoverage['/drag.js'].branchData['300'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['300'][2].init(235, 68, 'dragInitDirection === \'left\' && !self.allowScroll[dragInitDirection]');
function visit44_300_2(result) {
  _$jscoverage['/drag.js'].branchData['300'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['300'][1].init(226, 77, 'lockX && dragInitDirection === \'left\' && !self.allowScroll[dragInitDirection]');
function visit43_300_1(result) {
  _$jscoverage['/drag.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['297'][1].init(62, 13, 'xDiff > yDiff');
function visit42_297_1(result) {
  _$jscoverage['/drag.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['296'][1].init(53, 45, '!(dragInitDirection = self.dragInitDirection)');
function visit41_296_1(result) {
  _$jscoverage['/drag.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['293'][1].init(849, 14, 'lockX || lockY');
function visit40_293_1(result) {
  _$jscoverage['/drag.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['283'][1].init(17, 17, '!self.isScrolling');
function visit39_283_1(result) {
  _$jscoverage['/drag.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['280'][1].init(452, 37, 'Math.max(xDiff, yDiff) < PIXEL_THRESH');
function visit38_280_1(result) {
  _$jscoverage['/drag.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['267'][1].init(143, 14, '!startMousePos');
function visit37_267_1(result) {
  _$jscoverage['/drag.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['261'][1].init(13, 10, '!e.isTouch');
function visit36_261_1(result) {
  _$jscoverage['/drag.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['248'][1].init(646, 18, 'touches.length > 1');
function visit35_248_1(result) {
  _$jscoverage['/drag.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['241'][1].init(414, 11, 'isScrolling');
function visit34_241_1(result) {
  _$jscoverage['/drag.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['232'][1].init(188, 20, 'self.get(\'disabled\')');
function visit33_232_1(result) {
  _$jscoverage['/drag.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['227'][1].init(74, 10, '!e.isTouch');
function visit32_227_1(result) {
  _$jscoverage['/drag.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['217'][1].init(347, 11, 'value === 0');
function visit31_217_1(result) {
  _$jscoverage['/drag.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['206'][1].init(1156, 18, 'value <= minScroll');
function visit30_206_1(result) {
  _$jscoverage['/drag.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['191'][1].init(56, 22, 'fx.lastValue === value');
function visit29_191_1(result) {
  _$jscoverage['/drag.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['189'][3].init(392, 17, 'value < maxScroll');
function visit28_189_3(result) {
  _$jscoverage['/drag.js'].branchData['189'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['189'][2].init(371, 17, 'value > minScroll');
function visit27_189_2(result) {
  _$jscoverage['/drag.js'].branchData['189'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['189'][1].init(371, 38, 'value > minScroll && value < maxScroll');
function visit26_189_1(result) {
  _$jscoverage['/drag.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['181'][1].init(98, 7, 'inertia');
function visit25_181_1(result) {
  _$jscoverage['/drag.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['134'][3].init(1212, 14, 'distance === 0');
function visit24_134_3(result) {
  _$jscoverage['/drag.js'].branchData['134'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['134'][2].init(1194, 14, 'duration === 0');
function visit23_134_2(result) {
  _$jscoverage['/drag.js'].branchData['134'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['134'][1].init(1194, 32, 'duration === 0 || distance === 0');
function visit22_134_1(result) {
  _$jscoverage['/drag.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['124'][1].init(941, 16, 'self.pagesOffset');
function visit21_124_1(result) {
  _$jscoverage['/drag.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['112'][1].init(573, 19, 'bound !== undefined');
function visit20_112_1(result) {
  _$jscoverage['/drag.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['109'][1].init(475, 30, 'scroll > maxScroll[scrollType]');
function visit19_109_1(result) {
  _$jscoverage['/drag.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['107'][1].init(378, 30, 'scroll < minScroll[scrollType]');
function visit18_107_1(result) {
  _$jscoverage['/drag.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['96'][1].init(13, 28, 'forbidDrag(self, scrollType)');
function visit17_96_1(result) {
  _$jscoverage['/drag.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['89'][1].init(77, 49, '!self.allowScroll[scrollType] && self.get(lockXY)');
function visit16_89_1(result) {
  _$jscoverage['/drag.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['88'][1].init(22, 21, 'scrollType === \'left\'');
function visit15_88_1(result) {
  _$jscoverage['/drag.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['75'][2].init(117, 32, 'timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit14_75_2(result) {
  _$jscoverage['/drag.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['75'][1].init(54, 39, 'lastDirection[scrollType] !== direction');
function visit13_75_1(result) {
  _$jscoverage['/drag.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['74'][4].init(1613, 39, 'lastDirection[scrollType] !== undefined');
function visit12_74_4(result) {
  _$jscoverage['/drag.js'].branchData['74'][4].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['74'][3].init(1613, 94, 'lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit11_74_3(result) {
  _$jscoverage['/drag.js'].branchData['74'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['74'][2].init(1593, 114, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit10_74_2(result) {
  _$jscoverage['/drag.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['74'][1].init(1593, 150, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction || timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit9_74_1(result) {
  _$jscoverage['/drag.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['65'][1].init(1306, 30, 'scroll > maxScroll[scrollType]');
function visit8_65_1(result) {
  _$jscoverage['/drag.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['61'][1].init(1106, 30, 'scroll < minScroll[scrollType]');
function visit7_61_1(result) {
  _$jscoverage['/drag.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['57'][1].init(965, 19, '!self.get(\'bounce\')');
function visit6_57_1(result) {
  _$jscoverage['/drag.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['54'][1].init(117, 61, '(pos[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0');
function visit5_54_1(result) {
  _$jscoverage['/drag.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['53'][1].init(31, 58, 'pos[pageOffsetProperty] === lastPageXY[pageOffsetProperty]');
function visit4_53_1(result) {
  _$jscoverage['/drag.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['52'][1].init(729, 30, 'lastPageXY[pageOffsetProperty]');
function visit3_52_1(result) {
  _$jscoverage['/drag.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['39'][1].init(194, 21, 'scrollType === \'left\'');
function visit2_39_1(result) {
  _$jscoverage['/drag.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['32'][1].init(13, 28, 'forbidDrag(self, scrollType)');
function visit1_32_1(result) {
  _$jscoverage['/drag.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/drag.js'].functionData[0]++;
  _$jscoverage['/drag.js'].lineData[7]++;
  var ScrollViewBase = require('./base');
  _$jscoverage['/drag.js'].lineData[8]++;
  var Node = require('node');
  _$jscoverage['/drag.js'].lineData[9]++;
  var Anim = require('anim');
  _$jscoverage['/drag.js'].lineData[11]++;
  var OUT_OF_BOUND_FACTOR = 0.5;
  _$jscoverage['/drag.js'].lineData[13]++;
  var PIXEL_THRESH = 3;
  _$jscoverage['/drag.js'].lineData[15]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/drag.js'].lineData[17]++;
  var SWIPE_SAMPLE_INTERVAL = 300;
  _$jscoverage['/drag.js'].lineData[19]++;
  var MAX_SWIPE_VELOCITY = 6;
  _$jscoverage['/drag.js'].lineData[21]++;
  var $document = Node.all(document);
  _$jscoverage['/drag.js'].lineData[23]++;
  function onDragStart(self, e, scrollType) {
    _$jscoverage['/drag.js'].functionData[1]++;
    _$jscoverage['/drag.js'].lineData[24]++;
    var now = e.timeStamp, scroll = self.get('scroll' + S.ucfirst(scrollType));
    _$jscoverage['/drag.js'].lineData[26]++;
    self.startScroll[scrollType] = scroll;
    _$jscoverage['/drag.js'].lineData[27]++;
    self.swipe[scrollType].startTime = now;
    _$jscoverage['/drag.js'].lineData[28]++;
    self.swipe[scrollType].scroll = scroll;
  }
  _$jscoverage['/drag.js'].lineData[31]++;
  function onDragScroll(self, e, scrollType, startMousePos) {
    _$jscoverage['/drag.js'].functionData[2]++;
    _$jscoverage['/drag.js'].lineData[32]++;
    if (visit1_32_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/drag.js'].lineData[33]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[35]++;
    var pos = {
  pageX: e.pageX, 
  pageY: e.pageY};
    _$jscoverage['/drag.js'].lineData[39]++;
    var pageOffsetProperty = visit2_39_1(scrollType === 'left') ? 'pageX' : 'pageY', lastPageXY = self.lastPageXY;
    _$jscoverage['/drag.js'].lineData[41]++;
    var diff = pos[pageOffsetProperty] - startMousePos[pageOffsetProperty], eqWithLastPoint, scroll = self.startScroll[scrollType] - diff, bound, now = e.timeStamp, minScroll = self.minScroll, maxScroll = self.maxScroll, lastDirection = self.lastDirection, swipe = self.swipe, direction;
    _$jscoverage['/drag.js'].lineData[52]++;
    if (visit3_52_1(lastPageXY[pageOffsetProperty])) {
      _$jscoverage['/drag.js'].lineData[53]++;
      eqWithLastPoint = visit4_53_1(pos[pageOffsetProperty] === lastPageXY[pageOffsetProperty]);
      _$jscoverage['/drag.js'].lineData[54]++;
      direction = visit5_54_1((pos[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0);
    }
    _$jscoverage['/drag.js'].lineData[57]++;
    if (visit6_57_1(!self.get('bounce'))) {
      _$jscoverage['/drag.js'].lineData[58]++;
      scroll = Math.min(Math.max(scroll, minScroll[scrollType]), maxScroll[scrollType]);
    }
    _$jscoverage['/drag.js'].lineData[61]++;
    if (visit7_61_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/drag.js'].lineData[62]++;
      bound = minScroll[scrollType] - scroll;
      _$jscoverage['/drag.js'].lineData[63]++;
      bound *= OUT_OF_BOUND_FACTOR;
      _$jscoverage['/drag.js'].lineData[64]++;
      scroll = minScroll[scrollType] - bound;
    } else {
      _$jscoverage['/drag.js'].lineData[65]++;
      if (visit8_65_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/drag.js'].lineData[66]++;
        bound = scroll - maxScroll[scrollType];
        _$jscoverage['/drag.js'].lineData[67]++;
        bound *= OUT_OF_BOUND_FACTOR;
        _$jscoverage['/drag.js'].lineData[68]++;
        scroll = maxScroll[scrollType] + bound;
      }
    }
    _$jscoverage['/drag.js'].lineData[71]++;
    var timeDiff = (now - swipe[scrollType].startTime);
    _$jscoverage['/drag.js'].lineData[74]++;
    if (visit9_74_1(visit10_74_2(!eqWithLastPoint && visit11_74_3(visit12_74_4(lastDirection[scrollType] !== undefined) && visit13_75_1(lastDirection[scrollType] !== direction))) || visit14_75_2(timeDiff > SWIPE_SAMPLE_INTERVAL))) {
      _$jscoverage['/drag.js'].lineData[76]++;
      swipe[scrollType].startTime = now;
      _$jscoverage['/drag.js'].lineData[77]++;
      swipe[scrollType].scroll = scroll;
    }
    _$jscoverage['/drag.js'].lineData[81]++;
    self.set('scroll' + S.ucfirst(scrollType), scroll);
    _$jscoverage['/drag.js'].lineData[82]++;
    lastDirection[scrollType] = direction;
    _$jscoverage['/drag.js'].lineData[84]++;
    lastPageXY[pageOffsetProperty] = e[pageOffsetProperty];
  }
  _$jscoverage['/drag.js'].lineData[87]++;
  function forbidDrag(self, scrollType) {
    _$jscoverage['/drag.js'].functionData[3]++;
    _$jscoverage['/drag.js'].lineData[88]++;
    var lockXY = visit15_88_1(scrollType === 'left') ? 'lockX' : 'lockY';
    _$jscoverage['/drag.js'].lineData[89]++;
    if (visit16_89_1(!self.allowScroll[scrollType] && self.get(lockXY))) {
      _$jscoverage['/drag.js'].lineData[90]++;
      return 1;
    }
    _$jscoverage['/drag.js'].lineData[92]++;
    return 0;
  }
  _$jscoverage['/drag.js'].lineData[95]++;
  function onDragEndAxis(self, e, scrollType, endCallback) {
    _$jscoverage['/drag.js'].functionData[4]++;
    _$jscoverage['/drag.js'].lineData[96]++;
    if (visit17_96_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/drag.js'].lineData[97]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[98]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[100]++;
    var scrollAxis = 'scroll' + S.ucfirst(scrollType), scroll = self.get(scrollAxis), minScroll = self.minScroll, maxScroll = self.maxScroll, now = e.timeStamp, swipe = self.swipe, bound;
    _$jscoverage['/drag.js'].lineData[107]++;
    if (visit18_107_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/drag.js'].lineData[108]++;
      bound = minScroll[scrollType];
    } else {
      _$jscoverage['/drag.js'].lineData[109]++;
      if (visit19_109_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/drag.js'].lineData[110]++;
        bound = maxScroll[scrollType];
      }
    }
    _$jscoverage['/drag.js'].lineData[112]++;
    if (visit20_112_1(bound !== undefined)) {
      _$jscoverage['/drag.js'].lineData[113]++;
      var scrollCfg = {};
      _$jscoverage['/drag.js'].lineData[114]++;
      scrollCfg[scrollType] = bound;
      _$jscoverage['/drag.js'].lineData[115]++;
      self.scrollTo(scrollCfg, {
  duration: self.get('bounceDuration'), 
  easing: self.get('bounceEasing'), 
  queue: false, 
  complete: endCallback});
      _$jscoverage['/drag.js'].lineData[121]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[124]++;
    if (visit21_124_1(self.pagesOffset)) {
      _$jscoverage['/drag.js'].lineData[125]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[126]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[129]++;
    var duration = now - swipe[scrollType].startTime;
    _$jscoverage['/drag.js'].lineData[130]++;
    var distance = (scroll - swipe[scrollType].scroll);
    _$jscoverage['/drag.js'].lineData[134]++;
    if (visit22_134_1(visit23_134_2(duration === 0) || visit24_134_3(distance === 0))) {
      _$jscoverage['/drag.js'].lineData[135]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[136]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[142]++;
    var velocity = distance / duration;
    _$jscoverage['/drag.js'].lineData[144]++;
    velocity = Math.min(Math.max(velocity, -MAX_SWIPE_VELOCITY), MAX_SWIPE_VELOCITY);
    _$jscoverage['/drag.js'].lineData[149]++;
    var animCfg = {
  node: {}, 
  to: {}, 
  duration: 9999, 
  queue: false, 
  complete: endCallback, 
  frame: makeMomentumFx(self, velocity, scroll, scrollAxis, maxScroll[scrollType], minScroll[scrollType])};
    _$jscoverage['/drag.js'].lineData[160]++;
    animCfg.node[scrollType] = scroll;
    _$jscoverage['/drag.js'].lineData[161]++;
    animCfg.to[scrollType] = null;
    _$jscoverage['/drag.js'].lineData[163]++;
    self.scrollAnims.push(new Anim(animCfg).run());
  }
  _$jscoverage['/drag.js'].lineData[166]++;
  var FRICTION = 0.5;
  _$jscoverage['/drag.js'].lineData[167]++;
  var ACCELERATION = 20;
  _$jscoverage['/drag.js'].lineData[168]++;
  var THETA = Math.log(1 - (FRICTION / 10));
  _$jscoverage['/drag.js'].lineData[169]++;
  var ALPHA = THETA / ACCELERATION;
  _$jscoverage['/drag.js'].lineData[170]++;
  var SPRING_TENSION = 0.3;
  _$jscoverage['/drag.js'].lineData[172]++;
  function makeMomentumFx(self, startVelocity, startScroll, scrollAxis, maxScroll, minScroll) {
    _$jscoverage['/drag.js'].functionData[5]++;
    _$jscoverage['/drag.js'].lineData[174]++;
    var velocity = startVelocity * ACCELERATION;
    _$jscoverage['/drag.js'].lineData[175]++;
    var inertia = 1;
    _$jscoverage['/drag.js'].lineData[176]++;
    var bounceStartTime = 0;
    _$jscoverage['/drag.js'].lineData[177]++;
    return function(anim, fx) {
  _$jscoverage['/drag.js'].functionData[6]++;
  _$jscoverage['/drag.js'].lineData[178]++;
  var now = S.now(), deltaTime, value;
  _$jscoverage['/drag.js'].lineData[181]++;
  if (visit25_181_1(inertia)) {
    _$jscoverage['/drag.js'].lineData[182]++;
    deltaTime = now - anim.startTime;
    _$jscoverage['/drag.js'].lineData[186]++;
    var frictionFactor = Math.exp(deltaTime * ALPHA);
    _$jscoverage['/drag.js'].lineData[188]++;
    value = parseInt(startScroll + velocity * (1 - frictionFactor) / (-THETA), 10);
    _$jscoverage['/drag.js'].lineData[189]++;
    if (visit26_189_1(visit27_189_2(value > minScroll) && visit28_189_3(value < maxScroll))) {
      _$jscoverage['/drag.js'].lineData[191]++;
      if (visit29_191_1(fx.lastValue === value)) {
        _$jscoverage['/drag.js'].lineData[192]++;
        fx.pos = 1;
        _$jscoverage['/drag.js'].lineData[193]++;
        return;
      }
      _$jscoverage['/drag.js'].lineData[195]++;
      fx.lastValue = value;
      _$jscoverage['/drag.js'].lineData[196]++;
      self.set(scrollAxis, value);
      _$jscoverage['/drag.js'].lineData[197]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[199]++;
    inertia = 0;
    _$jscoverage['/drag.js'].lineData[200]++;
    velocity = velocity * frictionFactor;
    _$jscoverage['/drag.js'].lineData[206]++;
    startScroll = visit30_206_1(value <= minScroll) ? minScroll : maxScroll;
    _$jscoverage['/drag.js'].lineData[208]++;
    bounceStartTime = now;
  } else {
    _$jscoverage['/drag.js'].lineData[210]++;
    deltaTime = now - bounceStartTime;
    _$jscoverage['/drag.js'].lineData[212]++;
    var theta = (deltaTime / ACCELERATION), powTime = theta * Math.exp(-SPRING_TENSION * theta);
    _$jscoverage['/drag.js'].lineData[216]++;
    value = parseInt(velocity * powTime, 10);
    _$jscoverage['/drag.js'].lineData[217]++;
    if (visit31_217_1(value === 0)) {
      _$jscoverage['/drag.js'].lineData[218]++;
      fx.pos = 1;
    }
    _$jscoverage['/drag.js'].lineData[220]++;
    self.set(scrollAxis, startScroll + value);
  }
};
  }
  _$jscoverage['/drag.js'].lineData[225]++;
  function onDragStartHandler(e) {
    _$jscoverage['/drag.js'].functionData[7]++;
    _$jscoverage['/drag.js'].lineData[227]++;
    if (visit32_227_1(!e.isTouch)) {
      _$jscoverage['/drag.js'].lineData[228]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[230]++;
    var self = this, touches = e.touches;
    _$jscoverage['/drag.js'].lineData[232]++;
    if (visit33_232_1(self.get('disabled'))) {
      _$jscoverage['/drag.js'].lineData[233]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[235]++;
    self.stopAnimation();
    _$jscoverage['/drag.js'].lineData[236]++;
    var pos = {
  pageX: e.pageX, 
  pageY: e.pageY};
    _$jscoverage['/drag.js'].lineData[240]++;
    var isScrolling = self.isScrolling;
    _$jscoverage['/drag.js'].lineData[241]++;
    if (visit34_241_1(isScrolling)) {
      _$jscoverage['/drag.js'].lineData[242]++;
      var pageIndex = self.get('pageIndex');
      _$jscoverage['/drag.js'].lineData[243]++;
      self.fire('scrollEnd', S.mix({
  fromPageIndex: pageIndex, 
  pageIndex: pageIndex}, pos));
    }
    _$jscoverage['/drag.js'].lineData[248]++;
    if (visit35_248_1(touches.length > 1)) {
      _$jscoverage['/drag.js'].lineData[249]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[251]++;
    initStates(self);
    _$jscoverage['/drag.js'].lineData[252]++;
    self.startMousePos = pos;
    _$jscoverage['/drag.js'].lineData[253]++;
    onDragStart(self, e, 'left');
    _$jscoverage['/drag.js'].lineData[254]++;
    onDragStart(self, e, 'top');
    _$jscoverage['/drag.js'].lineData[257]++;
    $document.on(Gesture.move, onDragHandler, self).on(Gesture.end, onDragEndHandler, self);
  }
  _$jscoverage['/drag.js'].lineData[260]++;
  var onDragHandler = function(e) {
  _$jscoverage['/drag.js'].functionData[8]++;
  _$jscoverage['/drag.js'].lineData[261]++;
  if (visit36_261_1(!e.isTouch)) {
    _$jscoverage['/drag.js'].lineData[262]++;
    return;
  }
  _$jscoverage['/drag.js'].lineData[264]++;
  var self = this, startMousePos = self.startMousePos;
  _$jscoverage['/drag.js'].lineData[267]++;
  if (visit37_267_1(!startMousePos)) {
    _$jscoverage['/drag.js'].lineData[268]++;
    return;
  }
  _$jscoverage['/drag.js'].lineData[271]++;
  var pos = {
  pageX: e.pageX, 
  pageY: e.pageY};
  _$jscoverage['/drag.js'].lineData[276]++;
  var xDiff = Math.abs(pos.pageX - startMousePos.pageX);
  _$jscoverage['/drag.js'].lineData[277]++;
  var yDiff = Math.abs(pos.pageY - startMousePos.pageY);
  _$jscoverage['/drag.js'].lineData[280]++;
  if (visit38_280_1(Math.max(xDiff, yDiff) < PIXEL_THRESH)) {
    _$jscoverage['/drag.js'].lineData[281]++;
    return;
  } else {
    _$jscoverage['/drag.js'].lineData[283]++;
    if (visit39_283_1(!self.isScrolling)) {
      _$jscoverage['/drag.js'].lineData[284]++;
      self.fire('scrollStart', pos);
      _$jscoverage['/drag.js'].lineData[285]++;
      self.isScrolling = 1;
    }
  }
  _$jscoverage['/drag.js'].lineData[289]++;
  var lockX = self.get('lockX'), lockY = self.get('lockY');
  _$jscoverage['/drag.js'].lineData[293]++;
  if (visit40_293_1(lockX || lockY)) {
    _$jscoverage['/drag.js'].lineData[294]++;
    var dragInitDirection;
    _$jscoverage['/drag.js'].lineData[296]++;
    if (visit41_296_1(!(dragInitDirection = self.dragInitDirection))) {
      _$jscoverage['/drag.js'].lineData[297]++;
      self.dragInitDirection = dragInitDirection = visit42_297_1(xDiff > yDiff) ? 'left' : 'top';
    }
    _$jscoverage['/drag.js'].lineData[300]++;
    if (visit43_300_1(lockX && visit44_300_2(visit45_300_3(dragInitDirection === 'left') && !self.allowScroll[dragInitDirection]))) {
      _$jscoverage['/drag.js'].lineData[302]++;
      self.isScrolling = 0;
      _$jscoverage['/drag.js'].lineData[303]++;
      if (visit46_303_1(self.get('preventDefaultX'))) {
        _$jscoverage['/drag.js'].lineData[304]++;
        e.preventDefault();
      }
      _$jscoverage['/drag.js'].lineData[306]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[309]++;
    if (visit47_309_1(lockY && visit48_309_2(visit49_309_3(dragInitDirection === 'top') && !self.allowScroll[dragInitDirection]))) {
      _$jscoverage['/drag.js'].lineData[311]++;
      self.isScrolling = 0;
      _$jscoverage['/drag.js'].lineData[312]++;
      if (visit50_312_1(self.get('preventDefaultY'))) {
        _$jscoverage['/drag.js'].lineData[313]++;
        e.preventDefault();
      }
      _$jscoverage['/drag.js'].lineData[315]++;
      return;
    }
  }
  _$jscoverage['/drag.js'].lineData[319]++;
  if (visit51_319_1(S.Feature.isTouchEventSupported())) {
    _$jscoverage['/drag.js'].lineData[320]++;
    e.preventDefault();
  }
  _$jscoverage['/drag.js'].lineData[323]++;
  onDragScroll(self, e, 'left', startMousePos);
  _$jscoverage['/drag.js'].lineData[324]++;
  onDragScroll(self, e, 'top', startMousePos);
  _$jscoverage['/drag.js'].lineData[327]++;
  self.fire('scrollMove', pos);
};
  _$jscoverage['/drag.js'].lineData[330]++;
  if (visit52_330_1(S.UA.ie)) {
    _$jscoverage['/drag.js'].lineData[331]++;
    onDragHandler = S.throttle(onDragHandler, 30);
  }
  _$jscoverage['/drag.js'].lineData[334]++;
  function onDragEndHandler(e) {
    _$jscoverage['/drag.js'].functionData[9]++;
    _$jscoverage['/drag.js'].lineData[335]++;
    if (visit53_335_1(!e.isTouch)) {
      _$jscoverage['/drag.js'].lineData[336]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[338]++;
    var self = this;
    _$jscoverage['/drag.js'].lineData[339]++;
    var startMousePos = self.startMousePos;
    _$jscoverage['/drag.js'].lineData[341]++;
    $document.detach(Gesture.move, onDragHandler, self).detach(Gesture.end, onDragEndHandler, self);
    _$jscoverage['/drag.js'].lineData[342]++;
    if (visit54_342_1(!startMousePos || !self.isScrolling)) {
      _$jscoverage['/drag.js'].lineData[343]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[345]++;
    var offsetX = startMousePos.pageX - e.pageX;
    _$jscoverage['/drag.js'].lineData[346]++;
    var offsetY = startMousePos.pageY - e.pageY;
    _$jscoverage['/drag.js'].lineData[347]++;
    self.fire('dragend', {
  pageX: e.pageX, 
  deltaX: -offsetX, 
  deltaY: -offsetY, 
  pageY: e.pageY});
  }
  _$jscoverage['/drag.js'].lineData[356]++;
  function defaultDragEndFn(e) {
    _$jscoverage['/drag.js'].functionData[10]++;
    _$jscoverage['/drag.js'].lineData[357]++;
    var self = this;
    _$jscoverage['/drag.js'].lineData[358]++;
    var count = 0;
    _$jscoverage['/drag.js'].lineData[359]++;
    var offsetX = -e.deltaX;
    _$jscoverage['/drag.js'].lineData[360]++;
    var offsetY = -e.deltaY;
    _$jscoverage['/drag.js'].lineData[361]++;
    var snapThreshold = self._snapThresholdCfg;
    _$jscoverage['/drag.js'].lineData[362]++;
    var allowX = visit55_362_1(self.allowScroll.left && visit56_362_2(Math.abs(offsetX) > snapThreshold));
    _$jscoverage['/drag.js'].lineData[363]++;
    var allowY = visit57_363_1(self.allowScroll.top && visit58_363_2(Math.abs(offsetY) > snapThreshold));
    _$jscoverage['/drag.js'].lineData[365]++;
    function endCallback() {
      _$jscoverage['/drag.js'].functionData[11]++;
      _$jscoverage['/drag.js'].lineData[366]++;
      count++;
      _$jscoverage['/drag.js'].lineData[367]++;
      if (visit59_367_1(count === 2)) {
        _$jscoverage['/drag.js'].lineData[368]++;
        var scrollEnd = function() {
  _$jscoverage['/drag.js'].functionData[12]++;
  _$jscoverage['/drag.js'].lineData[369]++;
  self.isScrolling = 0;
  _$jscoverage['/drag.js'].lineData[370]++;
  self.fire('scrollEnd', {
  pageX: e.pageX, 
  pageY: e.pageY, 
  deltaX: -offsetX, 
  deltaY: -offsetY, 
  fromPageIndex: pageIndex, 
  pageIndex: self.get('pageIndex')});
};
        _$jscoverage['/drag.js'].lineData[380]++;
        if (visit60_380_1(!self.pagesOffset)) {
          _$jscoverage['/drag.js'].lineData[381]++;
          scrollEnd();
          _$jscoverage['/drag.js'].lineData[382]++;
          return;
        }
        _$jscoverage['/drag.js'].lineData[385]++;
        var snapDuration = self._snapDurationCfg;
        _$jscoverage['/drag.js'].lineData[386]++;
        var snapEasing = self._snapEasingCfg;
        _$jscoverage['/drag.js'].lineData[387]++;
        var pageIndex = self.get('pageIndex');
        _$jscoverage['/drag.js'].lineData[388]++;
        var scrollLeft = self.get('scrollLeft');
        _$jscoverage['/drag.js'].lineData[389]++;
        var scrollTop = self.get('scrollTop');
        _$jscoverage['/drag.js'].lineData[391]++;
        var animCfg = {
  duration: snapDuration, 
  easing: snapEasing, 
  complete: scrollEnd};
        _$jscoverage['/drag.js'].lineData[397]++;
        var pagesOffset = self.pagesOffset;
        _$jscoverage['/drag.js'].lineData[398]++;
        var pagesOffsetLen = pagesOffset.length;
        _$jscoverage['/drag.js'].lineData[400]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[402]++;
        if (visit61_402_1(allowX || allowY)) {
          _$jscoverage['/drag.js'].lineData[403]++;
          if (visit62_403_1(allowX && allowY)) {
            _$jscoverage['/drag.js'].lineData[404]++;
            var prepareX = [], i, newPageIndex;
            _$jscoverage['/drag.js'].lineData[407]++;
            var nowXY = {
  left: scrollLeft, 
  top: scrollTop};
            _$jscoverage['/drag.js'].lineData[411]++;
            for (i = 0; visit63_411_1(i < pagesOffsetLen); i++) {
              _$jscoverage['/drag.js'].lineData[412]++;
              var offset = pagesOffset[i];
              _$jscoverage['/drag.js'].lineData[413]++;
              if (visit64_413_1(offset)) {
                _$jscoverage['/drag.js'].lineData[414]++;
                if (visit65_414_1(visit66_414_2(offsetX > 0) && visit67_414_3(offset.left > nowXY.left))) {
                  _$jscoverage['/drag.js'].lineData[415]++;
                  prepareX.push(offset);
                } else {
                  _$jscoverage['/drag.js'].lineData[416]++;
                  if (visit68_416_1(visit69_416_2(offsetX < 0) && visit70_416_3(offset.left < nowXY.left))) {
                    _$jscoverage['/drag.js'].lineData[417]++;
                    prepareX.push(offset);
                  }
                }
              }
            }
            _$jscoverage['/drag.js'].lineData[421]++;
            var min;
            _$jscoverage['/drag.js'].lineData[422]++;
            var prepareXLen = prepareX.length;
            _$jscoverage['/drag.js'].lineData[423]++;
            var x;
            _$jscoverage['/drag.js'].lineData[424]++;
            if (visit71_424_1(offsetY > 0)) {
              _$jscoverage['/drag.js'].lineData[425]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/drag.js'].lineData[426]++;
              for (i = 0; visit72_426_1(i < prepareXLen); i++) {
                _$jscoverage['/drag.js'].lineData[427]++;
                x = prepareX[i];
                _$jscoverage['/drag.js'].lineData[428]++;
                if (visit73_428_1(x.top > nowXY.top)) {
                  _$jscoverage['/drag.js'].lineData[429]++;
                  if (visit74_429_1(min < x.top - nowXY.top)) {
                    _$jscoverage['/drag.js'].lineData[430]++;
                    min = x.top - nowXY.top;
                    _$jscoverage['/drag.js'].lineData[431]++;
                    newPageIndex = prepareX.index;
                  }
                }
              }
            } else {
              _$jscoverage['/drag.js'].lineData[436]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/drag.js'].lineData[437]++;
              for (i = 0; visit75_437_1(i < prepareXLen); i++) {
                _$jscoverage['/drag.js'].lineData[438]++;
                x = prepareX[i];
                _$jscoverage['/drag.js'].lineData[439]++;
                if (visit76_439_1(x.top < nowXY.top)) {
                  _$jscoverage['/drag.js'].lineData[440]++;
                  if (visit77_440_1(min < nowXY.top - x.top)) {
                    _$jscoverage['/drag.js'].lineData[441]++;
                    min = nowXY.top - x.top;
                    _$jscoverage['/drag.js'].lineData[442]++;
                    newPageIndex = prepareX.index;
                  }
                }
              }
            }
            _$jscoverage['/drag.js'].lineData[447]++;
            if (visit78_447_1(newPageIndex !== undefined)) {
              _$jscoverage['/drag.js'].lineData[448]++;
              if (visit79_448_1(newPageIndex !== pageIndex)) {
                _$jscoverage['/drag.js'].lineData[449]++;
                self.scrollToPage(newPageIndex, animCfg);
              } else {
                _$jscoverage['/drag.js'].lineData[451]++;
                self.scrollToPage(newPageIndex);
                _$jscoverage['/drag.js'].lineData[452]++;
                scrollEnd();
              }
            } else {
              _$jscoverage['/drag.js'].lineData[455]++;
              scrollEnd();
            }
          } else {
            _$jscoverage['/drag.js'].lineData[458]++;
            if (visit80_458_1(allowX || allowY)) {
              _$jscoverage['/drag.js'].lineData[459]++;
              var toPageIndex = self._getPageIndexFromXY(allowX ? scrollLeft : scrollTop, allowX, allowX ? offsetX : offsetY);
              _$jscoverage['/drag.js'].lineData[462]++;
              self.scrollToPage(toPageIndex, animCfg);
            } else {
              _$jscoverage['/drag.js'].lineData[464]++;
              self.scrollToPage(pageIndex);
              _$jscoverage['/drag.js'].lineData[465]++;
              scrollEnd();
            }
          }
        }
      }
    }
    _$jscoverage['/drag.js'].lineData[472]++;
    onDragEndAxis(self, e, 'left', endCallback);
    _$jscoverage['/drag.js'].lineData[473]++;
    onDragEndAxis(self, e, 'top', endCallback);
  }
  _$jscoverage['/drag.js'].lineData[476]++;
  function initStates(self) {
    _$jscoverage['/drag.js'].functionData[13]++;
    _$jscoverage['/drag.js'].lineData[477]++;
    self.lastPageXY = {};
    _$jscoverage['/drag.js'].lineData[478]++;
    self.lastDirection = {};
    _$jscoverage['/drag.js'].lineData[479]++;
    self.swipe = {
  left: {}, 
  top: {}};
    _$jscoverage['/drag.js'].lineData[483]++;
    self.startMousePos = null;
    _$jscoverage['/drag.js'].lineData[484]++;
    self.startScroll = {};
    _$jscoverage['/drag.js'].lineData[485]++;
    self.dragInitDirection = null;
  }
  _$jscoverage['/drag.js'].lineData[488]++;
  function preventDefault(e) {
    _$jscoverage['/drag.js'].functionData[14]++;
    _$jscoverage['/drag.js'].lineData[489]++;
    e.preventDefault();
  }
  _$jscoverage['/drag.js'].lineData[498]++;
  return ScrollViewBase.extend({
  initializer: function() {
  _$jscoverage['/drag.js'].functionData[15]++;
  _$jscoverage['/drag.js'].lineData[500]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[501]++;
  self._snapThresholdCfg = self.get('snapThreshold');
  _$jscoverage['/drag.js'].lineData[502]++;
  self._snapDurationCfg = self.get('snapDuration');
  _$jscoverage['/drag.js'].lineData[503]++;
  self._snapEasingCfg = self.get('snapEasing');
  _$jscoverage['/drag.js'].lineData[504]++;
  self.publish('dragend', {
  defaultFn: defaultDragEndFn, 
  defaultTargetOnly: true});
}, 
  bindUI: function() {
  _$jscoverage['/drag.js'].functionData[16]++;
  _$jscoverage['/drag.js'].lineData[512]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[514]++;
  self.$contentEl.on('dragstart', preventDefault).on(Gesture.start, onDragStartHandler, self);
}, 
  syncUI: function() {
  _$jscoverage['/drag.js'].functionData[17]++;
  _$jscoverage['/drag.js'].lineData[518]++;
  initStates(this);
}, 
  destructor: function() {
  _$jscoverage['/drag.js'].functionData[18]++;
  _$jscoverage['/drag.js'].lineData[522]++;
  this.stopAnimation();
}, 
  stopAnimation: function() {
  _$jscoverage['/drag.js'].functionData[19]++;
  _$jscoverage['/drag.js'].lineData[526]++;
  this.callSuper();
  _$jscoverage['/drag.js'].lineData[527]++;
  this.isScrolling = 0;
}}, {
  ATTRS: {
  lockX: {
  value: true}, 
  preventDefaultX: {
  value: true}, 
  lockY: {
  value: false}, 
  preventDefaultY: {
  value: false}, 
  snapDuration: {
  value: 0.3}, 
  snapEasing: {
  value: 'easeOut'}, 
  snapThreshold: {
  value: 5}, 
  bounce: {
  value: true}, 
  bounceDuration: {
  value: 0.4}, 
  bounceEasing: {
  value: 'easeOut'}}});
});
