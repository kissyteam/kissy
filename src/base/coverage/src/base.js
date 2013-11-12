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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[8] = 0;
  _$jscoverage['/base.js'].lineData[9] = 0;
  _$jscoverage['/base.js'].lineData[10] = 0;
  _$jscoverage['/base.js'].lineData[12] = 0;
  _$jscoverage['/base.js'].lineData[18] = 0;
  _$jscoverage['/base.js'].lineData[19] = 0;
  _$jscoverage['/base.js'].lineData[22] = 0;
  _$jscoverage['/base.js'].lineData[23] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[27] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[36] = 0;
  _$jscoverage['/base.js'].lineData[37] = 0;
  _$jscoverage['/base.js'].lineData[38] = 0;
  _$jscoverage['/base.js'].lineData[40] = 0;
  _$jscoverage['/base.js'].lineData[41] = 0;
  _$jscoverage['/base.js'].lineData[42] = 0;
  _$jscoverage['/base.js'].lineData[44] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[61] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[78] = 0;
  _$jscoverage['/base.js'].lineData[81] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[88] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[101] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[107] = 0;
  _$jscoverage['/base.js'].lineData[108] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[111] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[114] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[123] = 0;
  _$jscoverage['/base.js'].lineData[125] = 0;
  _$jscoverage['/base.js'].lineData[128] = 0;
  _$jscoverage['/base.js'].lineData[136] = 0;
  _$jscoverage['/base.js'].lineData[140] = 0;
  _$jscoverage['/base.js'].lineData[141] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[144] = 0;
  _$jscoverage['/base.js'].lineData[154] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[162] = 0;
  _$jscoverage['/base.js'].lineData[165] = 0;
  _$jscoverage['/base.js'].lineData[168] = 0;
  _$jscoverage['/base.js'].lineData[169] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[171] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[181] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[196] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[200] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[203] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[222] = 0;
  _$jscoverage['/base.js'].lineData[223] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[225] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[229] = 0;
  _$jscoverage['/base.js'].lineData[230] = 0;
  _$jscoverage['/base.js'].lineData[235] = 0;
  _$jscoverage['/base.js'].lineData[236] = 0;
  _$jscoverage['/base.js'].lineData[240] = 0;
  _$jscoverage['/base.js'].lineData[241] = 0;
  _$jscoverage['/base.js'].lineData[250] = 0;
  _$jscoverage['/base.js'].lineData[251] = 0;
  _$jscoverage['/base.js'].lineData[253] = 0;
  _$jscoverage['/base.js'].lineData[254] = 0;
  _$jscoverage['/base.js'].lineData[255] = 0;
  _$jscoverage['/base.js'].lineData[256] = 0;
  _$jscoverage['/base.js'].lineData[258] = 0;
  _$jscoverage['/base.js'].lineData[260] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[267] = 0;
  _$jscoverage['/base.js'].lineData[268] = 0;
  _$jscoverage['/base.js'].lineData[269] = 0;
  _$jscoverage['/base.js'].lineData[270] = 0;
  _$jscoverage['/base.js'].lineData[271] = 0;
  _$jscoverage['/base.js'].lineData[272] = 0;
  _$jscoverage['/base.js'].lineData[277] = 0;
  _$jscoverage['/base.js'].lineData[349] = 0;
  _$jscoverage['/base.js'].lineData[352] = 0;
  _$jscoverage['/base.js'].lineData[353] = 0;
  _$jscoverage['/base.js'].lineData[354] = 0;
  _$jscoverage['/base.js'].lineData[356] = 0;
  _$jscoverage['/base.js'].lineData[358] = 0;
  _$jscoverage['/base.js'].lineData[359] = 0;
  _$jscoverage['/base.js'].lineData[360] = 0;
  _$jscoverage['/base.js'].lineData[361] = 0;
  _$jscoverage['/base.js'].lineData[362] = 0;
  _$jscoverage['/base.js'].lineData[366] = 0;
  _$jscoverage['/base.js'].lineData[367] = 0;
  _$jscoverage['/base.js'].lineData[370] = 0;
  _$jscoverage['/base.js'].lineData[371] = 0;
  _$jscoverage['/base.js'].lineData[375] = 0;
  _$jscoverage['/base.js'].lineData[377] = 0;
  _$jscoverage['/base.js'].lineData[378] = 0;
  _$jscoverage['/base.js'].lineData[379] = 0;
  _$jscoverage['/base.js'].lineData[381] = 0;
  _$jscoverage['/base.js'].lineData[382] = 0;
  _$jscoverage['/base.js'].lineData[383] = 0;
  _$jscoverage['/base.js'].lineData[385] = 0;
  _$jscoverage['/base.js'].lineData[386] = 0;
  _$jscoverage['/base.js'].lineData[387] = 0;
  _$jscoverage['/base.js'].lineData[389] = 0;
  _$jscoverage['/base.js'].lineData[390] = 0;
  _$jscoverage['/base.js'].lineData[392] = 0;
  _$jscoverage['/base.js'].lineData[394] = 0;
  _$jscoverage['/base.js'].lineData[396] = 0;
  _$jscoverage['/base.js'].lineData[397] = 0;
  _$jscoverage['/base.js'].lineData[401] = 0;
  _$jscoverage['/base.js'].lineData[402] = 0;
  _$jscoverage['/base.js'].lineData[412] = 0;
  _$jscoverage['/base.js'].lineData[413] = 0;
  _$jscoverage['/base.js'].lineData[414] = 0;
  _$jscoverage['/base.js'].lineData[417] = 0;
  _$jscoverage['/base.js'].lineData[419] = 0;
  _$jscoverage['/base.js'].lineData[421] = 0;
  _$jscoverage['/base.js'].lineData[422] = 0;
  _$jscoverage['/base.js'].lineData[427] = 0;
  _$jscoverage['/base.js'].lineData[428] = 0;
  _$jscoverage['/base.js'].lineData[429] = 0;
  _$jscoverage['/base.js'].lineData[431] = 0;
  _$jscoverage['/base.js'].lineData[432] = 0;
  _$jscoverage['/base.js'].lineData[433] = 0;
  _$jscoverage['/base.js'].lineData[437] = 0;
  _$jscoverage['/base.js'].lineData[438] = 0;
  _$jscoverage['/base.js'].lineData[439] = 0;
  _$jscoverage['/base.js'].lineData[440] = 0;
  _$jscoverage['/base.js'].lineData[467] = 0;
  _$jscoverage['/base.js'].lineData[468] = 0;
  _$jscoverage['/base.js'].lineData[471] = 0;
  _$jscoverage['/base.js'].lineData[472] = 0;
  _$jscoverage['/base.js'].lineData[473] = 0;
  _$jscoverage['/base.js'].lineData[477] = 0;
  _$jscoverage['/base.js'].lineData[478] = 0;
  _$jscoverage['/base.js'].lineData[479] = 0;
  _$jscoverage['/base.js'].lineData[487] = 0;
  _$jscoverage['/base.js'].lineData[492] = 0;
  _$jscoverage['/base.js'].lineData[493] = 0;
  _$jscoverage['/base.js'].lineData[494] = 0;
  _$jscoverage['/base.js'].lineData[496] = 0;
  _$jscoverage['/base.js'].lineData[501] = 0;
  _$jscoverage['/base.js'].lineData[502] = 0;
  _$jscoverage['/base.js'].lineData[503] = 0;
  _$jscoverage['/base.js'].lineData[504] = 0;
  _$jscoverage['/base.js'].lineData[505] = 0;
  _$jscoverage['/base.js'].lineData[510] = 0;
  _$jscoverage['/base.js'].lineData[511] = 0;
  _$jscoverage['/base.js'].lineData[512] = 0;
  _$jscoverage['/base.js'].lineData[516] = 0;
  _$jscoverage['/base.js'].lineData[517] = 0;
  _$jscoverage['/base.js'].lineData[518] = 0;
  _$jscoverage['/base.js'].lineData[519] = 0;
  _$jscoverage['/base.js'].lineData[520] = 0;
  _$jscoverage['/base.js'].lineData[524] = 0;
  _$jscoverage['/base.js'].lineData[525] = 0;
  _$jscoverage['/base.js'].lineData[526] = 0;
  _$jscoverage['/base.js'].lineData[529] = 0;
  _$jscoverage['/base.js'].lineData[530] = 0;
  _$jscoverage['/base.js'].lineData[531] = 0;
  _$jscoverage['/base.js'].lineData[532] = 0;
  _$jscoverage['/base.js'].lineData[533] = 0;
  _$jscoverage['/base.js'].lineData[534] = 0;
  _$jscoverage['/base.js'].lineData[535] = 0;
  _$jscoverage['/base.js'].lineData[536] = 0;
  _$jscoverage['/base.js'].lineData[537] = 0;
  _$jscoverage['/base.js'].lineData[538] = 0;
  _$jscoverage['/base.js'].lineData[539] = 0;
  _$jscoverage['/base.js'].lineData[540] = 0;
  _$jscoverage['/base.js'].lineData[541] = 0;
  _$jscoverage['/base.js'].lineData[542] = 0;
  _$jscoverage['/base.js'].lineData[544] = 0;
  _$jscoverage['/base.js'].lineData[545] = 0;
  _$jscoverage['/base.js'].lineData[547] = 0;
  _$jscoverage['/base.js'].lineData[548] = 0;
  _$jscoverage['/base.js'].lineData[553] = 0;
  _$jscoverage['/base.js'].lineData[554] = 0;
  _$jscoverage['/base.js'].lineData[557] = 0;
  _$jscoverage['/base.js'].lineData[558] = 0;
  _$jscoverage['/base.js'].lineData[559] = 0;
  _$jscoverage['/base.js'].lineData[564] = 0;
  _$jscoverage['/base.js'].lineData[565] = 0;
  _$jscoverage['/base.js'].lineData[566] = 0;
  _$jscoverage['/base.js'].lineData[567] = 0;
  _$jscoverage['/base.js'].lineData[568] = 0;
  _$jscoverage['/base.js'].lineData[573] = 0;
  _$jscoverage['/base.js'].lineData[574] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
  _$jscoverage['/base.js'].functionData[17] = 0;
  _$jscoverage['/base.js'].functionData[18] = 0;
  _$jscoverage['/base.js'].functionData[19] = 0;
  _$jscoverage['/base.js'].functionData[20] = 0;
  _$jscoverage['/base.js'].functionData[21] = 0;
  _$jscoverage['/base.js'].functionData[22] = 0;
  _$jscoverage['/base.js'].functionData[23] = 0;
  _$jscoverage['/base.js'].functionData[24] = 0;
  _$jscoverage['/base.js'].functionData[25] = 0;
  _$jscoverage['/base.js'].functionData[26] = 0;
  _$jscoverage['/base.js'].functionData[27] = 0;
  _$jscoverage['/base.js'].functionData[28] = 0;
  _$jscoverage['/base.js'].functionData[29] = 0;
  _$jscoverage['/base.js'].functionData[30] = 0;
  _$jscoverage['/base.js'].functionData[31] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['30'] = [];
  _$jscoverage['/base.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['36'] = [];
  _$jscoverage['/base.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['37'] = [];
  _$jscoverage['/base.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['41'] = [];
  _$jscoverage['/base.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['105'] = [];
  _$jscoverage['/base.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['105'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['111'] = [];
  _$jscoverage['/base.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['118'] = [];
  _$jscoverage['/base.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['123'] = [];
  _$jscoverage['/base.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['128'] = [];
  _$jscoverage['/base.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['142'] = [];
  _$jscoverage['/base.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['162'] = [];
  _$jscoverage['/base.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['168'] = [];
  _$jscoverage['/base.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['169'] = [];
  _$jscoverage['/base.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['171'] = [];
  _$jscoverage['/base.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['176'] = [];
  _$jscoverage['/base.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['179'] = [];
  _$jscoverage['/base.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['179'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['180'] = [];
  _$jscoverage['/base.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['195'] = [];
  _$jscoverage['/base.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['199'] = [];
  _$jscoverage['/base.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['215'] = [];
  _$jscoverage['/base.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['219'] = [];
  _$jscoverage['/base.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['220'] = [];
  _$jscoverage['/base.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['222'] = [];
  _$jscoverage['/base.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['222'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['223'] = [];
  _$jscoverage['/base.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['228'] = [];
  _$jscoverage['/base.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['235'] = [];
  _$jscoverage['/base.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['253'] = [];
  _$jscoverage['/base.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['253'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['254'] = [];
  _$jscoverage['/base.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['267'] = [];
  _$jscoverage['/base.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['352'] = [];
  _$jscoverage['/base.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['358'] = [];
  _$jscoverage['/base.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['359'] = [];
  _$jscoverage['/base.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['361'] = [];
  _$jscoverage['/base.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['366'] = [];
  _$jscoverage['/base.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['378'] = [];
  _$jscoverage['/base.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['382'] = [];
  _$jscoverage['/base.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['385'] = [];
  _$jscoverage['/base.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['386'] = [];
  _$jscoverage['/base.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['386'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['389'] = [];
  _$jscoverage['/base.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['396'] = [];
  _$jscoverage['/base.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['402'] = [];
  _$jscoverage['/base.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['413'] = [];
  _$jscoverage['/base.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['421'] = [];
  _$jscoverage['/base.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['431'] = [];
  _$jscoverage['/base.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['439'] = [];
  _$jscoverage['/base.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['471'] = [];
  _$jscoverage['/base.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['478'] = [];
  _$jscoverage['/base.js'].branchData['478'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['493'] = [];
  _$jscoverage['/base.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['504'] = [];
  _$jscoverage['/base.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['518'] = [];
  _$jscoverage['/base.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['520'] = [];
  _$jscoverage['/base.js'].branchData['520'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['525'] = [];
  _$jscoverage['/base.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['530'] = [];
  _$jscoverage['/base.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['532'] = [];
  _$jscoverage['/base.js'].branchData['532'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['541'] = [];
  _$jscoverage['/base.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['544'] = [];
  _$jscoverage['/base.js'].branchData['544'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['557'] = [];
  _$jscoverage['/base.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['558'] = [];
  _$jscoverage['/base.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['559'] = [];
  _$jscoverage['/base.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['566'] = [];
  _$jscoverage['/base.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['566'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['567'] = [];
  _$jscoverage['/base.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['568'] = [];
  _$jscoverage['/base.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['573'] = [];
  _$jscoverage['/base.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['574'] = [];
  _$jscoverage['/base.js'].branchData['574'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['574'][1].init(36, 10, 'args || []');
function visit126_574_1(result) {
  _$jscoverage['/base.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['573'][1].init(214, 2, 'fn');
function visit125_573_1(result) {
  _$jscoverage['/base.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['568'][1].init(26, 166, 'extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method])');
function visit124_568_1(result) {
  _$jscoverage['/base.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['567'][1].init(29, 7, 'i < len');
function visit123_567_1(result) {
  _$jscoverage['/base.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['566'][2].init(36, 31, 'extensions && extensions.length');
function visit122_566_2(result) {
  _$jscoverage['/base.js'].branchData['566'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['566'][1].init(30, 37, 'len = extensions && extensions.length');
function visit121_566_1(result) {
  _$jscoverage['/base.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['559'][1].init(17, 46, 'plugins[i][method] && plugins[i][method](self)');
function visit120_559_1(result) {
  _$jscoverage['/base.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['558'][1].init(29, 7, 'i < len');
function visit119_558_1(result) {
  _$jscoverage['/base.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['557'][1].init(98, 20, 'len = plugins.length');
function visit118_557_1(result) {
  _$jscoverage['/base.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['544'][1].init(554, 7, 'wrapped');
function visit117_544_1(result) {
  _$jscoverage['/base.js'].branchData['544'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['541'][1].init(467, 13, 'v.__wrapped__');
function visit116_541_1(result) {
  _$jscoverage['/base.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['532'][1].init(54, 11, 'v.__owner__');
function visit115_532_1(result) {
  _$jscoverage['/base.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['530'][1].init(17, 22, 'typeof v == \'function\'');
function visit114_530_1(result) {
  _$jscoverage['/base.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['525'][1].init(17, 7, 'p in px');
function visit113_525_1(result) {
  _$jscoverage['/base.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['520'][1].init(25, 13, 'px[p] || noop');
function visit112_520_1(result) {
  _$jscoverage['/base.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['518'][1].init(63, 17, 'extensions.length');
function visit111_518_1(result) {
  _$jscoverage['/base.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['504'][1].init(17, 28, 'typeof plugin === \'function\'');
function visit110_504_1(result) {
  _$jscoverage['/base.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['493'][1].init(13, 6, 'config');
function visit109_493_1(result) {
  _$jscoverage['/base.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['478'][1].init(13, 5, 'attrs');
function visit108_478_1(result) {
  _$jscoverage['/base.js'].branchData['478'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['471'][1].init(85, 16, 'e.target == self');
function visit107_471_1(result) {
  _$jscoverage['/base.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['439'][1].init(70, 24, 'SubClass.__hooks__ || {}');
function visit106_439_1(result) {
  _$jscoverage['/base.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['431'][1].init(3517, 25, 'SubClass.extend || extend');
function visit105_431_1(result) {
  _$jscoverage['/base.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['421'][1].init(94, 21, 'exp.hasOwnProperty(p)');
function visit104_421_1(result) {
  _$jscoverage['/base.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['413'][1].init(52, 17, 'attrs[name] || {}');
function visit103_413_1(result) {
  _$jscoverage['/base.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['402'][1].init(25, 3, 'ext');
function visit102_402_1(result) {
  _$jscoverage['/base.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['396'][1].init(1972, 17, 'extensions.length');
function visit101_396_1(result) {
  _$jscoverage['/base.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['389'][1].init(1722, 16, 'inheritedStatics');
function visit100_389_1(result) {
  _$jscoverage['/base.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['386'][2].init(1580, 43, 'inheritedStatics !== sx[\'inheritedStatics\']');
function visit99_386_2(result) {
  _$jscoverage['/base.js'].branchData['386'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['386'][1].init(1554, 69, 'sx[\'inheritedStatics\'] && inheritedStatics !== sx[\'inheritedStatics\']');
function visit98_386_1(result) {
  _$jscoverage['/base.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['385'][1].init(1484, 52, 'sp[\'__inheritedStatics__\'] || sx[\'inheritedStatics\']');
function visit97_385_1(result) {
  _$jscoverage['/base.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['382'][1].init(1316, 18, 'sx.__hooks__ || {}');
function visit96_382_1(result) {
  _$jscoverage['/base.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['378'][1].init(1138, 5, 'hooks');
function visit95_378_1(result) {
  _$jscoverage['/base.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['366'][1].init(150, 9, '\'@DEBUG@\'');
function visit94_366_1(result) {
  _$jscoverage['/base.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['361'][1].init(393, 32, 'px.hasOwnProperty(\'constructor\')');
function visit93_361_1(result) {
  _$jscoverage['/base.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['359'][1].init(321, 24, 'sx.name || \'BaseDerived\'');
function visit92_359_1(result) {
  _$jscoverage['/base.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['358'][1].init(292, 8, 'sx || {}');
function visit91_358_1(result) {
  _$jscoverage['/base.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['352'][1].init(100, 22, '!S.isArray(extensions)');
function visit90_352_1(result) {
  _$jscoverage['/base.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['267'][1].init(46, 22, '!self.get(\'destroyed\')');
function visit89_267_1(result) {
  _$jscoverage['/base.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['254'][1].init(141, 14, 'pluginId == id');
function visit88_254_1(result) {
  _$jscoverage['/base.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['253'][2].init(79, 26, 'p.get && p.get(\'pluginId\')');
function visit87_253_2(result) {
  _$jscoverage['/base.js'].branchData['253'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['253'][1].init(79, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit86_253_1(result) {
  _$jscoverage['/base.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['235'][1].init(640, 5, '!keep');
function visit85_235_1(result) {
  _$jscoverage['/base.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['228'][1].init(29, 11, 'p != plugin');
function visit84_228_1(result) {
  _$jscoverage['/base.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['223'][1].init(161, 18, 'pluginId != plugin');
function visit83_223_1(result) {
  _$jscoverage['/base.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['222'][2].init(91, 26, 'p.get && p.get(\'pluginId\')');
function visit82_222_2(result) {
  _$jscoverage['/base.js'].branchData['222'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['222'][1].init(91, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit81_222_1(result) {
  _$jscoverage['/base.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['220'][1].init(25, 8, 'isString');
function visit80_220_1(result) {
  _$jscoverage['/base.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['219'][1].init(61, 6, 'plugin');
function visit79_219_1(result) {
  _$jscoverage['/base.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['215'][1].init(73, 25, 'typeof plugin == \'string\'');
function visit78_215_1(result) {
  _$jscoverage['/base.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['199'][1].init(180, 27, 'plugin[\'pluginInitializer\']');
function visit77_199_1(result) {
  _$jscoverage['/base.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['195'][1].init(46, 28, 'typeof plugin === \'function\'');
function visit76_195_1(result) {
  _$jscoverage['/base.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['180'][1].init(63, 55, '(attributeValue = self.get(attributeName)) !== undefined');
function visit75_180_1(result) {
  _$jscoverage['/base.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['179'][2].init(427, 31, 'attrs[attributeName].sync !== 0');
function visit74_179_2(result) {
  _$jscoverage['/base.js'].branchData['179'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['179'][1].init(174, 119, 'attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit73_179_1(result) {
  _$jscoverage['/base.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['176'][1].init(250, 294, '(onSetMethod = self[onSetMethodName]) && attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit72_176_1(result) {
  _$jscoverage['/base.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['171'][1].init(25, 22, 'attributeName in attrs');
function visit71_171_1(result) {
  _$jscoverage['/base.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['169'][1].init(29, 17, 'cs[i].ATTRS || {}');
function visit70_169_1(result) {
  _$jscoverage['/base.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['168'][1].init(379, 13, 'i < cs.length');
function visit69_168_1(result) {
  _$jscoverage['/base.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['162'][1].init(49, 40, 'c.superclass && c.superclass.constructor');
function visit68_162_1(result) {
  _$jscoverage['/base.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['142'][1].init(65, 7, 'self[m]');
function visit67_142_1(result) {
  _$jscoverage['/base.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['128'][1].init(1006, 10, 'args || []');
function visit66_128_1(result) {
  _$jscoverage['/base.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['123'][1].init(806, 7, '!member');
function visit65_123_1(result) {
  _$jscoverage['/base.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['118'][1].init(552, 5, '!name');
function visit64_118_1(result) {
  _$jscoverage['/base.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['111'][1].init(71, 18, 'method.__wrapped__');
function visit63_111_1(result) {
  _$jscoverage['/base.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['105'][2].init(110, 25, 'typeof self == \'function\'');
function visit62_105_2(result) {
  _$jscoverage['/base.js'].branchData['105'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['105'][1].init(110, 42, 'typeof self == \'function\' && self.__name__');
function visit61_105_1(result) {
  _$jscoverage['/base.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['41'][1].init(532, 7, 'reverse');
function visit60_41_1(result) {
  _$jscoverage['/base.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['37'][1].init(366, 7, 'reverse');
function visit59_37_1(result) {
  _$jscoverage['/base.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['36'][1].init(297, 47, 'arguments.callee.__owner__.__extensions__ || []');
function visit58_36_1(result) {
  _$jscoverage['/base.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['30'][1].init(54, 7, 'reverse');
function visit57_30_1(result) {
  _$jscoverage['/base.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var module = this;
  _$jscoverage['/base.js'].lineData[8]++;
  var Attribute = module.require('base/attribute');
  _$jscoverage['/base.js'].lineData[9]++;
  var CustomEvent = module.require('event/custom');
  _$jscoverage['/base.js'].lineData[10]++;
  module.exports = Base;
  _$jscoverage['/base.js'].lineData[12]++;
  var ATTRS = 'ATTRS', ucfirst = S.ucfirst, ON_SET = '_onSet', noop = S.noop, RE_DASH = /(?:^|-)([a-z])/ig;
  _$jscoverage['/base.js'].lineData[18]++;
  function replaceToUpper() {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[19]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/base.js'].lineData[22]++;
  function CamelCase(name) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[23]++;
    return name.replace(RE_DASH, replaceToUpper);
  }
  _$jscoverage['/base.js'].lineData[26]++;
  function __getHook(method, reverse) {
    _$jscoverage['/base.js'].functionData[3]++;
    _$jscoverage['/base.js'].lineData[27]++;
    return function(origFn) {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[28]++;
  return function wrap() {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[29]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[30]++;
  if (visit57_30_1(reverse)) {
    _$jscoverage['/base.js'].lineData[31]++;
    origFn.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[33]++;
    self.callSuper.apply(self, arguments);
  }
  _$jscoverage['/base.js'].lineData[36]++;
  var extensions = visit58_36_1(arguments.callee.__owner__.__extensions__ || []);
  _$jscoverage['/base.js'].lineData[37]++;
  if (visit59_37_1(reverse)) {
    _$jscoverage['/base.js'].lineData[38]++;
    extensions.reverse();
  }
  _$jscoverage['/base.js'].lineData[40]++;
  callExtensionsMethod(self, extensions, method, arguments);
  _$jscoverage['/base.js'].lineData[41]++;
  if (visit60_41_1(reverse)) {
    _$jscoverage['/base.js'].lineData[42]++;
    self.callSuper.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[44]++;
    origFn.apply(self, arguments);
  }
};
};
  }
  _$jscoverage['/base.js'].lineData[60]++;
  function Base(config) {
    _$jscoverage['/base.js'].functionData[6]++;
    _$jscoverage['/base.js'].lineData[61]++;
    var self = this, c = self.constructor;
    _$jscoverage['/base.js'].lineData[63]++;
    Base.superclass.constructor.apply(this, arguments);
    _$jscoverage['/base.js'].lineData[64]++;
    self.__attrs = {};
    _$jscoverage['/base.js'].lineData[65]++;
    self.__attrVals = {};
    _$jscoverage['/base.js'].lineData[67]++;
    self.userConfig = config;
    _$jscoverage['/base.js'].lineData[69]++;
    while (c) {
      _$jscoverage['/base.js'].lineData[70]++;
      addAttrs(self, c[ATTRS]);
      _$jscoverage['/base.js'].lineData[71]++;
      c = c.superclass ? c.superclass.constructor : null;
    }
    _$jscoverage['/base.js'].lineData[74]++;
    initAttrs(self, config);
    _$jscoverage['/base.js'].lineData[76]++;
    var listeners = self.get("listeners");
    _$jscoverage['/base.js'].lineData[77]++;
    for (var n in listeners) {
      _$jscoverage['/base.js'].lineData[78]++;
      self.on(n, listeners[n]);
    }
    _$jscoverage['/base.js'].lineData[81]++;
    self.initializer();
    _$jscoverage['/base.js'].lineData[83]++;
    constructPlugins(self);
    _$jscoverage['/base.js'].lineData[84]++;
    callPluginsMethod.call(self, 'pluginInitializer');
    _$jscoverage['/base.js'].lineData[86]++;
    self.bindInternal();
    _$jscoverage['/base.js'].lineData[88]++;
    self.syncInternal();
  }
  _$jscoverage['/base.js'].lineData[91]++;
  S.augment(Base, Attribute);
  _$jscoverage['/base.js'].lineData[93]++;
  S.extend(Base, CustomEvent.Target, {
  initializer: noop, 
  '__getHook': __getHook, 
  __callPluginsMethod: callPluginsMethod, 
  'callSuper': function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[101]++;
  var method, obj, self = this, args = arguments;
  _$jscoverage['/base.js'].lineData[105]++;
  if (visit61_105_1(visit62_105_2(typeof self == 'function') && self.__name__)) {
    _$jscoverage['/base.js'].lineData[106]++;
    method = self;
    _$jscoverage['/base.js'].lineData[107]++;
    obj = args[0];
    _$jscoverage['/base.js'].lineData[108]++;
    args = Array.prototype.slice.call(args, 1);
  } else {
    _$jscoverage['/base.js'].lineData[110]++;
    method = arguments.callee.caller;
    _$jscoverage['/base.js'].lineData[111]++;
    if (visit63_111_1(method.__wrapped__)) {
      _$jscoverage['/base.js'].lineData[112]++;
      method = method.caller;
    }
    _$jscoverage['/base.js'].lineData[114]++;
    obj = self;
  }
  _$jscoverage['/base.js'].lineData[117]++;
  var name = method.__name__;
  _$jscoverage['/base.js'].lineData[118]++;
  if (visit64_118_1(!name)) {
    _$jscoverage['/base.js'].lineData[120]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[122]++;
  var member = method.__owner__.superclass[name];
  _$jscoverage['/base.js'].lineData[123]++;
  if (visit65_123_1(!member)) {
    _$jscoverage['/base.js'].lineData[125]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[128]++;
  return member.apply(obj, visit66_128_1(args || []));
}, 
  bindInternal: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[136]++;
  var self = this, attrs = self['getAttrs'](), attr, m;
  _$jscoverage['/base.js'].lineData[140]++;
  for (attr in attrs) {
    _$jscoverage['/base.js'].lineData[141]++;
    m = ON_SET + ucfirst(attr);
    _$jscoverage['/base.js'].lineData[142]++;
    if (visit67_142_1(self[m])) {
      _$jscoverage['/base.js'].lineData[144]++;
      self.on('after' + ucfirst(attr) + 'Change', onSetAttrChange);
    }
  }
}, 
  syncInternal: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[154]++;
  var self = this, cs = [], i, c = self.constructor, attrs = self.getAttrs();
  _$jscoverage['/base.js'].lineData[160]++;
  while (c) {
    _$jscoverage['/base.js'].lineData[161]++;
    cs.push(c);
    _$jscoverage['/base.js'].lineData[162]++;
    c = visit68_162_1(c.superclass && c.superclass.constructor);
  }
  _$jscoverage['/base.js'].lineData[165]++;
  cs.reverse();
  _$jscoverage['/base.js'].lineData[168]++;
  for (i = 0; visit69_168_1(i < cs.length); i++) {
    _$jscoverage['/base.js'].lineData[169]++;
    var ATTRS = visit70_169_1(cs[i].ATTRS || {});
    _$jscoverage['/base.js'].lineData[170]++;
    for (var attributeName in ATTRS) {
      _$jscoverage['/base.js'].lineData[171]++;
      if (visit71_171_1(attributeName in attrs)) {
        _$jscoverage['/base.js'].lineData[172]++;
        var attributeValue, onSetMethod;
        _$jscoverage['/base.js'].lineData[174]++;
        var onSetMethodName = ON_SET + ucfirst(attributeName);
        _$jscoverage['/base.js'].lineData[176]++;
        if (visit72_176_1((onSetMethod = self[onSetMethodName]) && visit73_179_1(visit74_179_2(attrs[attributeName].sync !== 0) && visit75_180_1((attributeValue = self.get(attributeName)) !== undefined)))) {
          _$jscoverage['/base.js'].lineData[181]++;
          onSetMethod.call(self, attributeValue);
        }
      }
    }
  }
}, 
  'plug': function(plugin) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[194]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[195]++;
  if (visit76_195_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[196]++;
    plugin = new plugin();
  }
  _$jscoverage['/base.js'].lineData[199]++;
  if (visit77_199_1(plugin['pluginInitializer'])) {
    _$jscoverage['/base.js'].lineData[200]++;
    plugin['pluginInitializer'](self);
  }
  _$jscoverage['/base.js'].lineData[202]++;
  self.get('plugins').push(plugin);
  _$jscoverage['/base.js'].lineData[203]++;
  return self;
}, 
  'unplug': function(plugin) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[213]++;
  var plugins = [], self = this, isString = visit78_215_1(typeof plugin == 'string');
  _$jscoverage['/base.js'].lineData[217]++;
  S.each(self.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[218]++;
  var keep = 0, pluginId;
  _$jscoverage['/base.js'].lineData[219]++;
  if (visit79_219_1(plugin)) {
    _$jscoverage['/base.js'].lineData[220]++;
    if (visit80_220_1(isString)) {
      _$jscoverage['/base.js'].lineData[222]++;
      pluginId = visit81_222_1(visit82_222_2(p.get && p.get('pluginId')) || p.pluginId);
      _$jscoverage['/base.js'].lineData[223]++;
      if (visit83_223_1(pluginId != plugin)) {
        _$jscoverage['/base.js'].lineData[224]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[225]++;
        keep = 1;
      }
    } else {
      _$jscoverage['/base.js'].lineData[228]++;
      if (visit84_228_1(p != plugin)) {
        _$jscoverage['/base.js'].lineData[229]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[230]++;
        keep = 1;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[235]++;
  if (visit85_235_1(!keep)) {
    _$jscoverage['/base.js'].lineData[236]++;
    p.pluginDestructor(self);
  }
});
  _$jscoverage['/base.js'].lineData[240]++;
  self.setInternal('plugins', plugins);
  _$jscoverage['/base.js'].lineData[241]++;
  return self;
}, 
  'getPlugin': function(id) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[250]++;
  var plugin = null;
  _$jscoverage['/base.js'].lineData[251]++;
  S.each(this.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[253]++;
  var pluginId = visit86_253_1(visit87_253_2(p.get && p.get('pluginId')) || p.pluginId);
  _$jscoverage['/base.js'].lineData[254]++;
  if (visit88_254_1(pluginId == id)) {
    _$jscoverage['/base.js'].lineData[255]++;
    plugin = p;
    _$jscoverage['/base.js'].lineData[256]++;
    return false;
  }
  _$jscoverage['/base.js'].lineData[258]++;
  return undefined;
});
  _$jscoverage['/base.js'].lineData[260]++;
  return plugin;
}, 
  destructor: S.noop, 
  destroy: function() {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[266]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[267]++;
  if (visit89_267_1(!self.get('destroyed'))) {
    _$jscoverage['/base.js'].lineData[268]++;
    callPluginsMethod.call(self, 'pluginDestructor');
    _$jscoverage['/base.js'].lineData[269]++;
    self.destructor();
    _$jscoverage['/base.js'].lineData[270]++;
    self.set('destroyed', true);
    _$jscoverage['/base.js'].lineData[271]++;
    self.fire('destroy');
    _$jscoverage['/base.js'].lineData[272]++;
    self.detach();
  }
}});
  _$jscoverage['/base.js'].lineData[277]++;
  S.mix(Base, {
  __hooks__: {
  initializer: __getHook(), 
  destructor: __getHook('__destructor', true)}, 
  ATTRS: {
  plugins: {
  value: []}, 
  destroyed: {
  value: false}, 
  listeners: {
  value: []}}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[349]++;
  var SuperClass = this, name, SubClass;
  _$jscoverage['/base.js'].lineData[352]++;
  if (visit90_352_1(!S.isArray(extensions))) {
    _$jscoverage['/base.js'].lineData[353]++;
    sx = px;
    _$jscoverage['/base.js'].lineData[354]++;
    px = extensions;
    _$jscoverage['/base.js'].lineData[356]++;
    extensions = [];
  }
  _$jscoverage['/base.js'].lineData[358]++;
  sx = visit91_358_1(sx || {});
  _$jscoverage['/base.js'].lineData[359]++;
  name = visit92_359_1(sx.name || 'BaseDerived');
  _$jscoverage['/base.js'].lineData[360]++;
  px = S.merge(px);
  _$jscoverage['/base.js'].lineData[361]++;
  if (visit93_361_1(px.hasOwnProperty('constructor'))) {
    _$jscoverage['/base.js'].lineData[362]++;
    SubClass = px.constructor;
  } else {
    _$jscoverage['/base.js'].lineData[366]++;
    if (visit94_366_1('@DEBUG@')) {
      _$jscoverage['/base.js'].lineData[367]++;
      eval("SubClass = function " + CamelCase(name) + "(){ " + "this.callSuper.apply(this, arguments);}");
    } else {
      _$jscoverage['/base.js'].lineData[370]++;
      SubClass = function() {
  _$jscoverage['/base.js'].functionData[17]++;
  _$jscoverage['/base.js'].lineData[371]++;
  this.callSuper.apply(this, arguments);
};
    }
  }
  _$jscoverage['/base.js'].lineData[375]++;
  px.constructor = SubClass;
  _$jscoverage['/base.js'].lineData[377]++;
  var hooks = SuperClass.__hooks__;
  _$jscoverage['/base.js'].lineData[378]++;
  if (visit95_378_1(hooks)) {
    _$jscoverage['/base.js'].lineData[379]++;
    sx.__hooks__ = S.merge(hooks, sx.__hooks__);
  }
  _$jscoverage['/base.js'].lineData[381]++;
  SubClass.__extensions__ = extensions;
  _$jscoverage['/base.js'].lineData[382]++;
  wrapProtoForSuper(px, SubClass, visit96_382_1(sx.__hooks__ || {}));
  _$jscoverage['/base.js'].lineData[383]++;
  var sp = SuperClass.prototype;
  _$jscoverage['/base.js'].lineData[385]++;
  var inheritedStatics = sp['__inheritedStatics__'] = visit97_385_1(sp['__inheritedStatics__'] || sx['inheritedStatics']);
  _$jscoverage['/base.js'].lineData[386]++;
  if (visit98_386_1(sx['inheritedStatics'] && visit99_386_2(inheritedStatics !== sx['inheritedStatics']))) {
    _$jscoverage['/base.js'].lineData[387]++;
    S.mix(inheritedStatics, sx['inheritedStatics']);
  }
  _$jscoverage['/base.js'].lineData[389]++;
  if (visit100_389_1(inheritedStatics)) {
    _$jscoverage['/base.js'].lineData[390]++;
    S.mix(SubClass, inheritedStatics);
  }
  _$jscoverage['/base.js'].lineData[392]++;
  delete sx['inheritedStatics'];
  _$jscoverage['/base.js'].lineData[394]++;
  S.extend(SubClass, SuperClass, px, sx);
  _$jscoverage['/base.js'].lineData[396]++;
  if (visit101_396_1(extensions.length)) {
    _$jscoverage['/base.js'].lineData[397]++;
    var attrs = {}, prototype = {};
    _$jscoverage['/base.js'].lineData[401]++;
    S.each(extensions['concat'](SubClass), function(ext) {
  _$jscoverage['/base.js'].functionData[18]++;
  _$jscoverage['/base.js'].lineData[402]++;
  if (visit102_402_1(ext)) {
    _$jscoverage['/base.js'].lineData[412]++;
    S.each(ext[ATTRS], function(v, name) {
  _$jscoverage['/base.js'].functionData[19]++;
  _$jscoverage['/base.js'].lineData[413]++;
  var av = attrs[name] = visit103_413_1(attrs[name] || {});
  _$jscoverage['/base.js'].lineData[414]++;
  S.mix(av, v);
});
    _$jscoverage['/base.js'].lineData[417]++;
    var exp = ext.prototype, p;
    _$jscoverage['/base.js'].lineData[419]++;
    for (p in exp) {
      _$jscoverage['/base.js'].lineData[421]++;
      if (visit104_421_1(exp.hasOwnProperty(p))) {
        _$jscoverage['/base.js'].lineData[422]++;
        prototype[p] = exp[p];
      }
    }
  }
});
    _$jscoverage['/base.js'].lineData[427]++;
    SubClass[ATTRS] = attrs;
    _$jscoverage['/base.js'].lineData[428]++;
    prototype.constructor = SubClass;
    _$jscoverage['/base.js'].lineData[429]++;
    S.augment(SubClass, prototype);
  }
  _$jscoverage['/base.js'].lineData[431]++;
  SubClass.extend = visit105_431_1(SubClass.extend || extend);
  _$jscoverage['/base.js'].lineData[432]++;
  SubClass.addMembers = addMembers;
  _$jscoverage['/base.js'].lineData[433]++;
  return SubClass;
}});
  _$jscoverage['/base.js'].lineData[437]++;
  function addMembers(px) {
    _$jscoverage['/base.js'].functionData[20]++;
    _$jscoverage['/base.js'].lineData[438]++;
    var SubClass = this;
    _$jscoverage['/base.js'].lineData[439]++;
    wrapProtoForSuper(px, SubClass, visit106_439_1(SubClass.__hooks__ || {}));
    _$jscoverage['/base.js'].lineData[440]++;
    S.mix(SubClass.prototype, px);
  }
  _$jscoverage['/base.js'].lineData[467]++;
  function onSetAttrChange(e) {
    _$jscoverage['/base.js'].functionData[21]++;
    _$jscoverage['/base.js'].lineData[468]++;
    var self = this, method;
    _$jscoverage['/base.js'].lineData[471]++;
    if (visit107_471_1(e.target == self)) {
      _$jscoverage['/base.js'].lineData[472]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/base.js'].lineData[473]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/base.js'].lineData[477]++;
  function addAttrs(host, attrs) {
    _$jscoverage['/base.js'].functionData[22]++;
    _$jscoverage['/base.js'].lineData[478]++;
    if (visit108_478_1(attrs)) {
      _$jscoverage['/base.js'].lineData[479]++;
      for (var attr in attrs) {
        _$jscoverage['/base.js'].lineData[487]++;
        host.addAttr(attr, attrs[attr], false);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[492]++;
  function initAttrs(host, config) {
    _$jscoverage['/base.js'].functionData[23]++;
    _$jscoverage['/base.js'].lineData[493]++;
    if (visit109_493_1(config)) {
      _$jscoverage['/base.js'].lineData[494]++;
      for (var attr in config) {
        _$jscoverage['/base.js'].lineData[496]++;
        host.setInternal(attr, config[attr]);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[501]++;
  function constructPlugins(self) {
    _$jscoverage['/base.js'].functionData[24]++;
    _$jscoverage['/base.js'].lineData[502]++;
    var plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[503]++;
    S.each(plugins, function(plugin, i) {
  _$jscoverage['/base.js'].functionData[25]++;
  _$jscoverage['/base.js'].lineData[504]++;
  if (visit110_504_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[505]++;
    plugins[i] = new plugin();
  }
});
  }
  _$jscoverage['/base.js'].lineData[510]++;
  function wrapper(fn) {
    _$jscoverage['/base.js'].functionData[26]++;
    _$jscoverage['/base.js'].lineData[511]++;
    return function() {
  _$jscoverage['/base.js'].functionData[27]++;
  _$jscoverage['/base.js'].lineData[512]++;
  return fn.apply(this, arguments);
};
  }
  _$jscoverage['/base.js'].lineData[516]++;
  function wrapProtoForSuper(px, SubClass, hooks) {
    _$jscoverage['/base.js'].functionData[28]++;
    _$jscoverage['/base.js'].lineData[517]++;
    var extensions = SubClass.__extensions__;
    _$jscoverage['/base.js'].lineData[518]++;
    if (visit111_518_1(extensions.length)) {
      _$jscoverage['/base.js'].lineData[519]++;
      for (p in hooks) {
        _$jscoverage['/base.js'].lineData[520]++;
        px[p] = visit112_520_1(px[p] || noop);
      }
    }
    _$jscoverage['/base.js'].lineData[524]++;
    for (var p in hooks) {
      _$jscoverage['/base.js'].lineData[525]++;
      if (visit113_525_1(p in px)) {
        _$jscoverage['/base.js'].lineData[526]++;
        px[p] = hooks[p](px[p]);
      }
    }
    _$jscoverage['/base.js'].lineData[529]++;
    S.each(px, function(v, p) {
  _$jscoverage['/base.js'].functionData[29]++;
  _$jscoverage['/base.js'].lineData[530]++;
  if (visit114_530_1(typeof v == 'function')) {
    _$jscoverage['/base.js'].lineData[531]++;
    var wrapped = 0;
    _$jscoverage['/base.js'].lineData[532]++;
    if (visit115_532_1(v.__owner__)) {
      _$jscoverage['/base.js'].lineData[533]++;
      var originalOwner = v.__owner__;
      _$jscoverage['/base.js'].lineData[534]++;
      delete v.__owner__;
      _$jscoverage['/base.js'].lineData[535]++;
      delete v.__name__;
      _$jscoverage['/base.js'].lineData[536]++;
      wrapped = v.__wrapped__ = 1;
      _$jscoverage['/base.js'].lineData[537]++;
      var newV = wrapper(v);
      _$jscoverage['/base.js'].lineData[538]++;
      newV.__owner__ = originalOwner;
      _$jscoverage['/base.js'].lineData[539]++;
      newV.__name__ = p;
      _$jscoverage['/base.js'].lineData[540]++;
      originalOwner.prototype[p] = newV;
    } else {
      _$jscoverage['/base.js'].lineData[541]++;
      if (visit116_541_1(v.__wrapped__)) {
        _$jscoverage['/base.js'].lineData[542]++;
        wrapped = 1;
      }
    }
    _$jscoverage['/base.js'].lineData[544]++;
    if (visit117_544_1(wrapped)) {
      _$jscoverage['/base.js'].lineData[545]++;
      px[p] = v = wrapper(v);
    }
    _$jscoverage['/base.js'].lineData[547]++;
    v.__owner__ = SubClass;
    _$jscoverage['/base.js'].lineData[548]++;
    v.__name__ = p;
  }
});
  }
  _$jscoverage['/base.js'].lineData[553]++;
  function callPluginsMethod(method) {
    _$jscoverage['/base.js'].functionData[30]++;
    _$jscoverage['/base.js'].lineData[554]++;
    var len, self = this, plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[557]++;
    if (visit118_557_1(len = plugins.length)) {
      _$jscoverage['/base.js'].lineData[558]++;
      for (var i = 0; visit119_558_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[559]++;
        visit120_559_1(plugins[i][method] && plugins[i][method](self));
      }
    }
  }
  _$jscoverage['/base.js'].lineData[564]++;
  function callExtensionsMethod(self, extensions, method, args) {
    _$jscoverage['/base.js'].functionData[31]++;
    _$jscoverage['/base.js'].lineData[565]++;
    var len;
    _$jscoverage['/base.js'].lineData[566]++;
    if (visit121_566_1(len = visit122_566_2(extensions && extensions.length))) {
      _$jscoverage['/base.js'].lineData[567]++;
      for (var i = 0; visit123_567_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[568]++;
        var fn = visit124_568_1(extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method]));
        _$jscoverage['/base.js'].lineData[573]++;
        if (visit125_573_1(fn)) {
          _$jscoverage['/base.js'].lineData[574]++;
          fn.apply(self, visit126_574_1(args || []));
        }
      }
    }
  }
});
