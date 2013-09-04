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
  _$jscoverage['/drag.js'].lineData[5] = 0;
  _$jscoverage['/drag.js'].lineData[6] = 0;
  _$jscoverage['/drag.js'].lineData[8] = 0;
  _$jscoverage['/drag.js'].lineData[10] = 0;
  _$jscoverage['/drag.js'].lineData[12] = 0;
  _$jscoverage['/drag.js'].lineData[14] = 0;
  _$jscoverage['/drag.js'].lineData[16] = 0;
  _$jscoverage['/drag.js'].lineData[17] = 0;
  _$jscoverage['/drag.js'].lineData[19] = 0;
  _$jscoverage['/drag.js'].lineData[20] = 0;
  _$jscoverage['/drag.js'].lineData[21] = 0;
  _$jscoverage['/drag.js'].lineData[24] = 0;
  _$jscoverage['/drag.js'].lineData[25] = 0;
  _$jscoverage['/drag.js'].lineData[26] = 0;
  _$jscoverage['/drag.js'].lineData[28] = 0;
  _$jscoverage['/drag.js'].lineData[32] = 0;
  _$jscoverage['/drag.js'].lineData[34] = 0;
  _$jscoverage['/drag.js'].lineData[45] = 0;
  _$jscoverage['/drag.js'].lineData[46] = 0;
  _$jscoverage['/drag.js'].lineData[47] = 0;
  _$jscoverage['/drag.js'].lineData[50] = 0;
  _$jscoverage['/drag.js'].lineData[51] = 0;
  _$jscoverage['/drag.js'].lineData[54] = 0;
  _$jscoverage['/drag.js'].lineData[55] = 0;
  _$jscoverage['/drag.js'].lineData[56] = 0;
  _$jscoverage['/drag.js'].lineData[57] = 0;
  _$jscoverage['/drag.js'].lineData[58] = 0;
  _$jscoverage['/drag.js'].lineData[59] = 0;
  _$jscoverage['/drag.js'].lineData[60] = 0;
  _$jscoverage['/drag.js'].lineData[61] = 0;
  _$jscoverage['/drag.js'].lineData[64] = 0;
  _$jscoverage['/drag.js'].lineData[67] = 0;
  _$jscoverage['/drag.js'].lineData[69] = 0;
  _$jscoverage['/drag.js'].lineData[70] = 0;
  _$jscoverage['/drag.js'].lineData[74] = 0;
  _$jscoverage['/drag.js'].lineData[75] = 0;
  _$jscoverage['/drag.js'].lineData[77] = 0;
  _$jscoverage['/drag.js'].lineData[80] = 0;
  _$jscoverage['/drag.js'].lineData[81] = 0;
  _$jscoverage['/drag.js'].lineData[82] = 0;
  _$jscoverage['/drag.js'].lineData[83] = 0;
  _$jscoverage['/drag.js'].lineData[85] = 0;
  _$jscoverage['/drag.js'].lineData[88] = 0;
  _$jscoverage['/drag.js'].lineData[89] = 0;
  _$jscoverage['/drag.js'].lineData[90] = 0;
  _$jscoverage['/drag.js'].lineData[91] = 0;
  _$jscoverage['/drag.js'].lineData[93] = 0;
  _$jscoverage['/drag.js'].lineData[100] = 0;
  _$jscoverage['/drag.js'].lineData[101] = 0;
  _$jscoverage['/drag.js'].lineData[102] = 0;
  _$jscoverage['/drag.js'].lineData[103] = 0;
  _$jscoverage['/drag.js'].lineData[105] = 0;
  _$jscoverage['/drag.js'].lineData[106] = 0;
  _$jscoverage['/drag.js'].lineData[107] = 0;
  _$jscoverage['/drag.js'].lineData[108] = 0;
  _$jscoverage['/drag.js'].lineData[114] = 0;
  _$jscoverage['/drag.js'].lineData[117] = 0;
  _$jscoverage['/drag.js'].lineData[118] = 0;
  _$jscoverage['/drag.js'].lineData[119] = 0;
  _$jscoverage['/drag.js'].lineData[122] = 0;
  _$jscoverage['/drag.js'].lineData[123] = 0;
  _$jscoverage['/drag.js'].lineData[127] = 0;
  _$jscoverage['/drag.js'].lineData[128] = 0;
  _$jscoverage['/drag.js'].lineData[129] = 0;
  _$jscoverage['/drag.js'].lineData[135] = 0;
  _$jscoverage['/drag.js'].lineData[137] = 0;
  _$jscoverage['/drag.js'].lineData[142] = 0;
  _$jscoverage['/drag.js'].lineData[153] = 0;
  _$jscoverage['/drag.js'].lineData[154] = 0;
  _$jscoverage['/drag.js'].lineData[156] = 0;
  _$jscoverage['/drag.js'].lineData[159] = 0;
  _$jscoverage['/drag.js'].lineData[160] = 0;
  _$jscoverage['/drag.js'].lineData[161] = 0;
  _$jscoverage['/drag.js'].lineData[162] = 0;
  _$jscoverage['/drag.js'].lineData[163] = 0;
  _$jscoverage['/drag.js'].lineData[165] = 0;
  _$jscoverage['/drag.js'].lineData[167] = 0;
  _$jscoverage['/drag.js'].lineData[168] = 0;
  _$jscoverage['/drag.js'].lineData[169] = 0;
  _$jscoverage['/drag.js'].lineData[170] = 0;
  _$jscoverage['/drag.js'].lineData[171] = 0;
  _$jscoverage['/drag.js'].lineData[174] = 0;
  _$jscoverage['/drag.js'].lineData[175] = 0;
  _$jscoverage['/drag.js'].lineData[179] = 0;
  _$jscoverage['/drag.js'].lineData[181] = 0;
  _$jscoverage['/drag.js'].lineData[182] = 0;
  _$jscoverage['/drag.js'].lineData[184] = 0;
  _$jscoverage['/drag.js'].lineData[185] = 0;
  _$jscoverage['/drag.js'].lineData[186] = 0;
  _$jscoverage['/drag.js'].lineData[188] = 0;
  _$jscoverage['/drag.js'].lineData[189] = 0;
  _$jscoverage['/drag.js'].lineData[190] = 0;
  _$jscoverage['/drag.js'].lineData[192] = 0;
  _$jscoverage['/drag.js'].lineData[193] = 0;
  _$jscoverage['/drag.js'].lineData[199] = 0;
  _$jscoverage['/drag.js'].lineData[201] = 0;
  _$jscoverage['/drag.js'].lineData[203] = 0;
  _$jscoverage['/drag.js'].lineData[205] = 0;
  _$jscoverage['/drag.js'].lineData[209] = 0;
  _$jscoverage['/drag.js'].lineData[210] = 0;
  _$jscoverage['/drag.js'].lineData[211] = 0;
  _$jscoverage['/drag.js'].lineData[213] = 0;
  _$jscoverage['/drag.js'].lineData[218] = 0;
  _$jscoverage['/drag.js'].lineData[219] = 0;
  _$jscoverage['/drag.js'].lineData[221] = 0;
  _$jscoverage['/drag.js'].lineData[222] = 0;
  _$jscoverage['/drag.js'].lineData[224] = 0;
  _$jscoverage['/drag.js'].lineData[225] = 0;
  _$jscoverage['/drag.js'].lineData[229] = 0;
  _$jscoverage['/drag.js'].lineData[230] = 0;
  _$jscoverage['/drag.js'].lineData[231] = 0;
  _$jscoverage['/drag.js'].lineData[232] = 0;
  _$jscoverage['/drag.js'].lineData[237] = 0;
  _$jscoverage['/drag.js'].lineData[238] = 0;
  _$jscoverage['/drag.js'].lineData[240] = 0;
  _$jscoverage['/drag.js'].lineData[241] = 0;
  _$jscoverage['/drag.js'].lineData[242] = 0;
  _$jscoverage['/drag.js'].lineData[243] = 0;
  _$jscoverage['/drag.js'].lineData[245] = 0;
  _$jscoverage['/drag.js'].lineData[248] = 0;
  _$jscoverage['/drag.js'].lineData[249] = 0;
  _$jscoverage['/drag.js'].lineData[254] = 0;
  _$jscoverage['/drag.js'].lineData[255] = 0;
  _$jscoverage['/drag.js'].lineData[256] = 0;
  _$jscoverage['/drag.js'].lineData[259] = 0;
  _$jscoverage['/drag.js'].lineData[260] = 0;
  _$jscoverage['/drag.js'].lineData[263] = 0;
  _$jscoverage['/drag.js'].lineData[268] = 0;
  _$jscoverage['/drag.js'].lineData[269] = 0;
  _$jscoverage['/drag.js'].lineData[272] = 0;
  _$jscoverage['/drag.js'].lineData[273] = 0;
  _$jscoverage['/drag.js'].lineData[275] = 0;
  _$jscoverage['/drag.js'].lineData[276] = 0;
  _$jscoverage['/drag.js'].lineData[277] = 0;
  _$jscoverage['/drag.js'].lineData[281] = 0;
  _$jscoverage['/drag.js'].lineData[285] = 0;
  _$jscoverage['/drag.js'].lineData[286] = 0;
  _$jscoverage['/drag.js'].lineData[288] = 0;
  _$jscoverage['/drag.js'].lineData[289] = 0;
  _$jscoverage['/drag.js'].lineData[292] = 0;
  _$jscoverage['/drag.js'].lineData[294] = 0;
  _$jscoverage['/drag.js'].lineData[295] = 0;
  _$jscoverage['/drag.js'].lineData[298] = 0;
  _$jscoverage['/drag.js'].lineData[300] = 0;
  _$jscoverage['/drag.js'].lineData[301] = 0;
  _$jscoverage['/drag.js'].lineData[305] = 0;
  _$jscoverage['/drag.js'].lineData[306] = 0;
  _$jscoverage['/drag.js'].lineData[309] = 0;
  _$jscoverage['/drag.js'].lineData[310] = 0;
  _$jscoverage['/drag.js'].lineData[313] = 0;
  _$jscoverage['/drag.js'].lineData[316] = 0;
  _$jscoverage['/drag.js'].lineData[317] = 0;
  _$jscoverage['/drag.js'].lineData[320] = 0;
  _$jscoverage['/drag.js'].lineData[321] = 0;
  _$jscoverage['/drag.js'].lineData[322] = 0;
  _$jscoverage['/drag.js'].lineData[323] = 0;
  _$jscoverage['/drag.js'].lineData[324] = 0;
  _$jscoverage['/drag.js'].lineData[325] = 0;
  _$jscoverage['/drag.js'].lineData[327] = 0;
  _$jscoverage['/drag.js'].lineData[328] = 0;
  _$jscoverage['/drag.js'].lineData[329] = 0;
  _$jscoverage['/drag.js'].lineData[330] = 0;
  _$jscoverage['/drag.js'].lineData[331] = 0;
  _$jscoverage['/drag.js'].lineData[332] = 0;
  _$jscoverage['/drag.js'].lineData[333] = 0;
  _$jscoverage['/drag.js'].lineData[337] = 0;
  _$jscoverage['/drag.js'].lineData[338] = 0;
  _$jscoverage['/drag.js'].lineData[339] = 0;
  _$jscoverage['/drag.js'].lineData[340] = 0;
  _$jscoverage['/drag.js'].lineData[341] = 0;
  _$jscoverage['/drag.js'].lineData[342] = 0;
  _$jscoverage['/drag.js'].lineData[350] = 0;
  _$jscoverage['/drag.js'].lineData[351] = 0;
  _$jscoverage['/drag.js'].lineData[352] = 0;
  _$jscoverage['/drag.js'].lineData[355] = 0;
  _$jscoverage['/drag.js'].lineData[356] = 0;
  _$jscoverage['/drag.js'].lineData[357] = 0;
  _$jscoverage['/drag.js'].lineData[358] = 0;
  _$jscoverage['/drag.js'].lineData[359] = 0;
  _$jscoverage['/drag.js'].lineData[360] = 0;
  _$jscoverage['/drag.js'].lineData[362] = 0;
  _$jscoverage['/drag.js'].lineData[368] = 0;
  _$jscoverage['/drag.js'].lineData[370] = 0;
  _$jscoverage['/drag.js'].lineData[372] = 0;
  _$jscoverage['/drag.js'].lineData[373] = 0;
  _$jscoverage['/drag.js'].lineData[374] = 0;
  _$jscoverage['/drag.js'].lineData[376] = 0;
  _$jscoverage['/drag.js'].lineData[380] = 0;
  _$jscoverage['/drag.js'].lineData[381] = 0;
  _$jscoverage['/drag.js'].lineData[382] = 0;
  _$jscoverage['/drag.js'].lineData[384] = 0;
  _$jscoverage['/drag.js'].lineData[385] = 0;
  _$jscoverage['/drag.js'].lineData[386] = 0;
  _$jscoverage['/drag.js'].lineData[387] = 0;
  _$jscoverage['/drag.js'].lineData[390] = 0;
  _$jscoverage['/drag.js'].lineData[391] = 0;
  _$jscoverage['/drag.js'].lineData[392] = 0;
  _$jscoverage['/drag.js'].lineData[393] = 0;
  _$jscoverage['/drag.js'].lineData[394] = 0;
  _$jscoverage['/drag.js'].lineData[395] = 0;
  _$jscoverage['/drag.js'].lineData[396] = 0;
  _$jscoverage['/drag.js'].lineData[397] = 0;
  _$jscoverage['/drag.js'].lineData[402] = 0;
  _$jscoverage['/drag.js'].lineData[403] = 0;
  _$jscoverage['/drag.js'].lineData[404] = 0;
  _$jscoverage['/drag.js'].lineData[405] = 0;
  _$jscoverage['/drag.js'].lineData[406] = 0;
  _$jscoverage['/drag.js'].lineData[407] = 0;
  _$jscoverage['/drag.js'].lineData[412] = 0;
  _$jscoverage['/drag.js'].lineData[413] = 0;
  _$jscoverage['/drag.js'].lineData[414] = 0;
  _$jscoverage['/drag.js'].lineData[416] = 0;
  _$jscoverage['/drag.js'].lineData[417] = 0;
  _$jscoverage['/drag.js'].lineData[420] = 0;
  _$jscoverage['/drag.js'].lineData[423] = 0;
  _$jscoverage['/drag.js'].lineData[424] = 0;
  _$jscoverage['/drag.js'].lineData[427] = 0;
  _$jscoverage['/drag.js'].lineData[429] = 0;
  _$jscoverage['/drag.js'].lineData[430] = 0;
  _$jscoverage['/drag.js'].lineData[437] = 0;
  _$jscoverage['/drag.js'].lineData[438] = 0;
  _$jscoverage['/drag.js'].lineData[441] = 0;
  _$jscoverage['/drag.js'].lineData[442] = 0;
  _$jscoverage['/drag.js'].lineData[443] = 0;
  _$jscoverage['/drag.js'].lineData[444] = 0;
  _$jscoverage['/drag.js'].lineData[448] = 0;
  _$jscoverage['/drag.js'].lineData[449] = 0;
  _$jscoverage['/drag.js'].lineData[450] = 0;
  _$jscoverage['/drag.js'].lineData[453] = 0;
  _$jscoverage['/drag.js'].lineData[454] = 0;
  _$jscoverage['/drag.js'].lineData[457] = 0;
  _$jscoverage['/drag.js'].lineData[459] = 0;
  _$jscoverage['/drag.js'].lineData[462] = 0;
  _$jscoverage['/drag.js'].lineData[466] = 0;
  _$jscoverage['/drag.js'].lineData[470] = 0;
  _$jscoverage['/drag.js'].lineData[474] = 0;
  _$jscoverage['/drag.js'].lineData[475] = 0;
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
  _$jscoverage['/drag.js'].functionData[20] = 0;
}
if (! _$jscoverage['/drag.js'].branchData) {
  _$jscoverage['/drag.js'].branchData = {};
  _$jscoverage['/drag.js'].branchData['25'] = [];
  _$jscoverage['/drag.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['32'] = [];
  _$jscoverage['/drag.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['45'] = [];
  _$jscoverage['/drag.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['46'] = [];
  _$jscoverage['/drag.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['47'] = [];
  _$jscoverage['/drag.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['50'] = [];
  _$jscoverage['/drag.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['54'] = [];
  _$jscoverage['/drag.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['58'] = [];
  _$jscoverage['/drag.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['67'] = [];
  _$jscoverage['/drag.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['67'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['67'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['67'][4] = new BranchData();
  _$jscoverage['/drag.js'].branchData['68'] = [];
  _$jscoverage['/drag.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['68'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['81'] = [];
  _$jscoverage['/drag.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['82'] = [];
  _$jscoverage['/drag.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['89'] = [];
  _$jscoverage['/drag.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['100'] = [];
  _$jscoverage['/drag.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['102'] = [];
  _$jscoverage['/drag.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['105'] = [];
  _$jscoverage['/drag.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['117'] = [];
  _$jscoverage['/drag.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['127'] = [];
  _$jscoverage['/drag.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['127'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['127'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['174'] = [];
  _$jscoverage['/drag.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['182'] = [];
  _$jscoverage['/drag.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['182'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['182'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['184'] = [];
  _$jscoverage['/drag.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['199'] = [];
  _$jscoverage['/drag.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['210'] = [];
  _$jscoverage['/drag.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['221'] = [];
  _$jscoverage['/drag.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['230'] = [];
  _$jscoverage['/drag.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['237'] = [];
  _$jscoverage['/drag.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['254'] = [];
  _$jscoverage['/drag.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['259'] = [];
  _$jscoverage['/drag.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['272'] = [];
  _$jscoverage['/drag.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['275'] = [];
  _$jscoverage['/drag.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['285'] = [];
  _$jscoverage['/drag.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['288'] = [];
  _$jscoverage['/drag.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['289'] = [];
  _$jscoverage['/drag.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['292'] = [];
  _$jscoverage['/drag.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['292'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['292'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['298'] = [];
  _$jscoverage['/drag.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['298'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['298'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['305'] = [];
  _$jscoverage['/drag.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['316'] = [];
  _$jscoverage['/drag.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['324'] = [];
  _$jscoverage['/drag.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['331'] = [];
  _$jscoverage['/drag.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['331'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['332'] = [];
  _$jscoverage['/drag.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['332'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['339'] = [];
  _$jscoverage['/drag.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['350'] = [];
  _$jscoverage['/drag.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['372'] = [];
  _$jscoverage['/drag.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['373'] = [];
  _$jscoverage['/drag.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['381'] = [];
  _$jscoverage['/drag.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['384'] = [];
  _$jscoverage['/drag.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['384'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['384'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['386'] = [];
  _$jscoverage['/drag.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['386'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['386'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['391'] = [];
  _$jscoverage['/drag.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['394'] = [];
  _$jscoverage['/drag.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['395'] = [];
  _$jscoverage['/drag.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['404'] = [];
  _$jscoverage['/drag.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['405'] = [];
  _$jscoverage['/drag.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['412'] = [];
  _$jscoverage['/drag.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['413'] = [];
  _$jscoverage['/drag.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['423'] = [];
  _$jscoverage['/drag.js'].branchData['423'][1] = new BranchData();
}
_$jscoverage['/drag.js'].branchData['423'][1].init(30, 16, 'allowX || allowY');
function visit73_423_1(result) {
  _$jscoverage['/drag.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['413'][1].init(34, 25, 'newPageIndex != pageIndex');
function visit72_413_1(result) {
  _$jscoverage['/drag.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['412'][1].init(1908, 25, 'newPageIndex != undefined');
function visit71_412_1(result) {
  _$jscoverage['/drag.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['405'][1].init(42, 23, 'min < nowXY.top - x.top');
function visit70_405_1(result) {
  _$jscoverage['/drag.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['404'][1].init(38, 17, 'x.top < nowXY.top');
function visit69_404_1(result) {
  _$jscoverage['/drag.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['395'][1].init(42, 23, 'min < x.top - nowXY.top');
function visit68_395_1(result) {
  _$jscoverage['/drag.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['394'][1].init(38, 17, 'x.top > nowXY.top');
function visit67_394_1(result) {
  _$jscoverage['/drag.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['391'][1].init(833, 11, 'offsetY > 0');
function visit66_391_1(result) {
  _$jscoverage['/drag.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['386'][3].init(305, 24, 'offset.left < nowXY.left');
function visit65_386_3(result) {
  _$jscoverage['/drag.js'].branchData['386'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['386'][2].init(290, 11, 'offsetX < 0');
function visit64_386_2(result) {
  _$jscoverage['/drag.js'].branchData['386'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['386'][1].init(290, 39, 'offsetX < 0 && offset.left < nowXY.left');
function visit63_386_1(result) {
  _$jscoverage['/drag.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['384'][3].init(165, 24, 'offset.left > nowXY.left');
function visit62_384_3(result) {
  _$jscoverage['/drag.js'].branchData['384'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['384'][2].init(150, 11, 'offsetX > 0');
function visit61_384_2(result) {
  _$jscoverage['/drag.js'].branchData['384'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['384'][1].init(150, 39, 'offsetX > 0 && offset.left > nowXY.left');
function visit60_384_1(result) {
  _$jscoverage['/drag.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['381'][1].init(34, 7, '!offset');
function visit59_381_1(result) {
  _$jscoverage['/drag.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['373'][1].init(26, 16, 'allowX && allowY');
function visit58_373_1(result) {
  _$jscoverage['/drag.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['372'][1].init(1159, 16, 'allowX || allowY');
function visit57_372_1(result) {
  _$jscoverage['/drag.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['350'][1].init(388, 17, '!self.pagesOffset');
function visit56_350_1(result) {
  _$jscoverage['/drag.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['339'][1].init(40, 10, 'count == 2');
function visit55_339_1(result) {
  _$jscoverage['/drag.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['332'][2].init(544, 33, 'Math.abs(offsetY) > snapThreshold');
function visit54_332_2(result) {
  _$jscoverage['/drag.js'].branchData['332'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['332'][1].init(520, 57, 'self.allowScroll.top && Math.abs(offsetY) > snapThreshold');
function visit53_332_1(result) {
  _$jscoverage['/drag.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['331'][2].init(463, 33, 'Math.abs(offsetX) > snapThreshold');
function visit52_331_2(result) {
  _$jscoverage['/drag.js'].branchData['331'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['331'][1].init(438, 58, 'self.allowScroll.left && Math.abs(offsetX) > snapThreshold');
function visit51_331_1(result) {
  _$jscoverage['/drag.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['324'][1].init(157, 35, '!startMousePos || !self.isScrolling');
function visit50_324_1(result) {
  _$jscoverage['/drag.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['316'][1].init(10677, 7, 'S.UA.ie');
function visit49_316_1(result) {
  _$jscoverage['/drag.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['305'][1].init(1751, 34, 'S.Features.isTouchEventSupported()');
function visit48_305_1(result) {
  _$jscoverage['/drag.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['298'][3].init(472, 26, 'dragInitDirection == \'top\'');
function visit47_298_3(result) {
  _$jscoverage['/drag.js'].branchData['298'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['298'][2].init(472, 66, 'dragInitDirection == \'top\' && !self.allowScroll[dragInitDirection]');
function visit46_298_2(result) {
  _$jscoverage['/drag.js'].branchData['298'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['298'][1].init(463, 75, 'lockY && dragInitDirection == \'top\' && !self.allowScroll[dragInitDirection]');
function visit45_298_1(result) {
  _$jscoverage['/drag.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['292'][3].init(242, 27, 'dragInitDirection == \'left\'');
function visit44_292_3(result) {
  _$jscoverage['/drag.js'].branchData['292'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['292'][2].init(242, 67, 'dragInitDirection == \'left\' && !self.allowScroll[dragInitDirection]');
function visit43_292_2(result) {
  _$jscoverage['/drag.js'].branchData['292'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['292'][1].init(233, 76, 'lockX && dragInitDirection == \'left\' && !self.allowScroll[dragInitDirection]');
function visit42_292_1(result) {
  _$jscoverage['/drag.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['289'][1].init(63, 13, 'xDiff > yDiff');
function visit41_289_1(result) {
  _$jscoverage['/drag.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['288'][1].init(56, 45, '!(dragInitDirection = self.dragInitDirection)');
function visit40_288_1(result) {
  _$jscoverage['/drag.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['285'][1].init(1035, 14, 'lockX || lockY');
function visit39_285_1(result) {
  _$jscoverage['/drag.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['275'][1].init(18, 17, '!self.isScrolling');
function visit38_275_1(result) {
  _$jscoverage['/drag.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['272'][1].init(625, 37, 'Math.max(xDiff, yDiff) < PIXEL_THRESH');
function visit37_272_1(result) {
  _$jscoverage['/drag.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['259'][1].init(285, 14, '!startMousePos');
function visit36_259_1(result) {
  _$jscoverage['/drag.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['254'][1].init(174, 15, '!touches.length');
function visit35_254_1(result) {
  _$jscoverage['/drag.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['237'][1].init(570, 18, 'touches.length > 1');
function visit34_237_1(result) {
  _$jscoverage['/drag.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['230'][1].init(331, 11, 'isScrolling');
function visit33_230_1(result) {
  _$jscoverage['/drag.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['221'][1].init(74, 20, 'self.get(\'disabled\')');
function visit32_221_1(result) {
  _$jscoverage['/drag.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['210'][1].init(351, 11, 'value === 0');
function visit31_210_1(result) {
  _$jscoverage['/drag.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['199'][1].init(1177, 18, 'value <= minScroll');
function visit30_199_1(result) {
  _$jscoverage['/drag.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['184'][1].init(58, 22, 'fx.lastValue === value');
function visit29_184_1(result) {
  _$jscoverage['/drag.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['182'][3].init(396, 17, 'value < maxScroll');
function visit28_182_3(result) {
  _$jscoverage['/drag.js'].branchData['182'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['182'][2].init(375, 17, 'value > minScroll');
function visit27_182_2(result) {
  _$jscoverage['/drag.js'].branchData['182'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['182'][1].init(375, 38, 'value > minScroll && value < maxScroll');
function visit26_182_1(result) {
  _$jscoverage['/drag.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['174'][1].init(102, 7, 'inertia');
function visit25_174_1(result) {
  _$jscoverage['/drag.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['127'][3].init(1250, 13, 'distance == 0');
function visit24_127_3(result) {
  _$jscoverage['/drag.js'].branchData['127'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['127'][2].init(1233, 13, 'duration == 0');
function visit23_127_2(result) {
  _$jscoverage['/drag.js'].branchData['127'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['127'][1].init(1233, 30, 'duration == 0 || distance == 0');
function visit22_127_1(result) {
  _$jscoverage['/drag.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['117'][1].init(970, 16, 'self.pagesOffset');
function visit21_117_1(result) {
  _$jscoverage['/drag.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['105'][1].init(590, 19, 'bound !== undefined');
function visit20_105_1(result) {
  _$jscoverage['/drag.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['102'][1].init(489, 30, 'scroll > maxScroll[scrollType]');
function visit19_102_1(result) {
  _$jscoverage['/drag.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['100'][1].init(390, 30, 'scroll < minScroll[scrollType]');
function visit18_100_1(result) {
  _$jscoverage['/drag.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['89'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit17_89_1(result) {
  _$jscoverage['/drag.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['82'][1].init(78, 49, '!self.allowScroll[scrollType] && self.get(lockXY)');
function visit16_82_1(result) {
  _$jscoverage['/drag.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['81'][1].init(23, 20, 'scrollType == \'left\'');
function visit15_81_1(result) {
  _$jscoverage['/drag.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['68'][2].init(118, 32, 'timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit14_68_2(result) {
  _$jscoverage['/drag.js'].branchData['68'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['68'][1].init(55, 39, 'lastDirection[scrollType] !== direction');
function visit13_68_1(result) {
  _$jscoverage['/drag.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['67'][4].init(1676, 39, 'lastDirection[scrollType] !== undefined');
function visit12_67_4(result) {
  _$jscoverage['/drag.js'].branchData['67'][4].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['67'][3].init(1676, 95, 'lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit11_67_3(result) {
  _$jscoverage['/drag.js'].branchData['67'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['67'][2].init(1656, 115, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit10_67_2(result) {
  _$jscoverage['/drag.js'].branchData['67'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['67'][1].init(1656, 151, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction || timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit9_67_1(result) {
  _$jscoverage['/drag.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['58'][1].init(1360, 30, 'scroll > maxScroll[scrollType]');
function visit8_58_1(result) {
  _$jscoverage['/drag.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['54'][1].init(1156, 30, 'scroll < minScroll[scrollType]');
function visit7_54_1(result) {
  _$jscoverage['/drag.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['50'][1].init(1011, 19, '!self.get(\'bounce\')');
function visit6_50_1(result) {
  _$jscoverage['/drag.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['47'][1].init(118, 61, '(pos[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0');
function visit5_47_1(result) {
  _$jscoverage['/drag.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['46'][1].init(32, 57, 'pos[pageOffsetProperty] == lastPageXY[pageOffsetProperty]');
function visit4_46_1(result) {
  _$jscoverage['/drag.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['45'][1].init(771, 30, 'lastPageXY[pageOffsetProperty]');
function visit3_45_1(result) {
  _$jscoverage['/drag.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['32'][1].init(224, 20, 'scrollType == \'left\'');
function visit2_32_1(result) {
  _$jscoverage['/drag.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['25'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit1_25_1(result) {
  _$jscoverage['/drag.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].lineData[5]++;
KISSY.add('scroll-view/drag', function(S, ScrollViewBase, Node, Anim) {
  _$jscoverage['/drag.js'].functionData[0]++;
  _$jscoverage['/drag.js'].lineData[6]++;
  var OUT_OF_BOUND_FACTOR = 0.5;
  _$jscoverage['/drag.js'].lineData[8]++;
  var PIXEL_THRESH = 3;
  _$jscoverage['/drag.js'].lineData[10]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/drag.js'].lineData[12]++;
  var SWIPE_SAMPLE_INTERVAL = 300;
  _$jscoverage['/drag.js'].lineData[14]++;
  var MAX_SWIPE_VELOCITY = 6;
  _$jscoverage['/drag.js'].lineData[16]++;
  function onDragStart(self, e, scrollType) {
    _$jscoverage['/drag.js'].functionData[1]++;
    _$jscoverage['/drag.js'].lineData[17]++;
    var now = e.timeStamp, scroll = self.get('scroll' + S.ucfirst(scrollType));
    _$jscoverage['/drag.js'].lineData[19]++;
    self.startScroll[scrollType] = scroll;
    _$jscoverage['/drag.js'].lineData[20]++;
    self.swipe[scrollType].startTime = now;
    _$jscoverage['/drag.js'].lineData[21]++;
    self.swipe[scrollType].scroll = scroll;
  }
  _$jscoverage['/drag.js'].lineData[24]++;
  function onDragScroll(self, e, scrollType, startMousePos) {
    _$jscoverage['/drag.js'].functionData[2]++;
    _$jscoverage['/drag.js'].lineData[25]++;
    if (visit1_25_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/drag.js'].lineData[26]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[28]++;
    var pos = {
  pageX: e.touches[0].pageX, 
  pageY: e.touches[0].pageY};
    _$jscoverage['/drag.js'].lineData[32]++;
    var pageOffsetProperty = visit2_32_1(scrollType == 'left') ? 'pageX' : 'pageY', lastPageXY = self.lastPageXY;
    _$jscoverage['/drag.js'].lineData[34]++;
    var diff = pos[pageOffsetProperty] - startMousePos[pageOffsetProperty], eqWithLastPoint, scroll = self.startScroll[scrollType] - diff, bound, now = e.timeStamp, minScroll = self.minScroll, maxScroll = self.maxScroll, lastDirection = self.lastDirection, swipe = self.swipe, direction;
    _$jscoverage['/drag.js'].lineData[45]++;
    if (visit3_45_1(lastPageXY[pageOffsetProperty])) {
      _$jscoverage['/drag.js'].lineData[46]++;
      eqWithLastPoint = visit4_46_1(pos[pageOffsetProperty] == lastPageXY[pageOffsetProperty]);
      _$jscoverage['/drag.js'].lineData[47]++;
      direction = visit5_47_1((pos[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0);
    }
    _$jscoverage['/drag.js'].lineData[50]++;
    if (visit6_50_1(!self.get('bounce'))) {
      _$jscoverage['/drag.js'].lineData[51]++;
      scroll = Math.min(Math.max(scroll, minScroll[scrollType]), maxScroll[scrollType]);
    }
    _$jscoverage['/drag.js'].lineData[54]++;
    if (visit7_54_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/drag.js'].lineData[55]++;
      bound = minScroll[scrollType] - scroll;
      _$jscoverage['/drag.js'].lineData[56]++;
      bound *= OUT_OF_BOUND_FACTOR;
      _$jscoverage['/drag.js'].lineData[57]++;
      scroll = minScroll[scrollType] - bound;
    } else {
      _$jscoverage['/drag.js'].lineData[58]++;
      if (visit8_58_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/drag.js'].lineData[59]++;
        bound = scroll - maxScroll[scrollType];
        _$jscoverage['/drag.js'].lineData[60]++;
        bound *= OUT_OF_BOUND_FACTOR;
        _$jscoverage['/drag.js'].lineData[61]++;
        scroll = maxScroll[scrollType] + bound;
      }
    }
    _$jscoverage['/drag.js'].lineData[64]++;
    var timeDiff = (now - swipe[scrollType].startTime);
    _$jscoverage['/drag.js'].lineData[67]++;
    if (visit9_67_1(visit10_67_2(!eqWithLastPoint && visit11_67_3(visit12_67_4(lastDirection[scrollType] !== undefined) && visit13_68_1(lastDirection[scrollType] !== direction))) || visit14_68_2(timeDiff > SWIPE_SAMPLE_INTERVAL))) {
      _$jscoverage['/drag.js'].lineData[69]++;
      swipe[scrollType].startTime = now;
      _$jscoverage['/drag.js'].lineData[70]++;
      swipe[scrollType].scroll = scroll;
    }
    _$jscoverage['/drag.js'].lineData[74]++;
    self.set('scroll' + S.ucfirst(scrollType), scroll);
    _$jscoverage['/drag.js'].lineData[75]++;
    lastDirection[scrollType] = direction;
    _$jscoverage['/drag.js'].lineData[77]++;
    lastPageXY[pageOffsetProperty] = e[pageOffsetProperty];
  }
  _$jscoverage['/drag.js'].lineData[80]++;
  function forbidDrag(self, scrollType) {
    _$jscoverage['/drag.js'].functionData[3]++;
    _$jscoverage['/drag.js'].lineData[81]++;
    var lockXY = visit15_81_1(scrollType == 'left') ? 'lockX' : 'lockY';
    _$jscoverage['/drag.js'].lineData[82]++;
    if (visit16_82_1(!self.allowScroll[scrollType] && self.get(lockXY))) {
      _$jscoverage['/drag.js'].lineData[83]++;
      return 1;
    }
    _$jscoverage['/drag.js'].lineData[85]++;
    return 0;
  }
  _$jscoverage['/drag.js'].lineData[88]++;
  function onDragEndAxis(self, e, scrollType, endCallback) {
    _$jscoverage['/drag.js'].functionData[4]++;
    _$jscoverage['/drag.js'].lineData[89]++;
    if (visit17_89_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/drag.js'].lineData[90]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[91]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[93]++;
    var scrollAxis = 'scroll' + S.ucfirst(scrollType), scroll = self.get(scrollAxis), minScroll = self.minScroll, maxScroll = self.maxScroll, now = e.timeStamp, swipe = self.swipe, bound;
    _$jscoverage['/drag.js'].lineData[100]++;
    if (visit18_100_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/drag.js'].lineData[101]++;
      bound = minScroll[scrollType];
    } else {
      _$jscoverage['/drag.js'].lineData[102]++;
      if (visit19_102_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/drag.js'].lineData[103]++;
        bound = maxScroll[scrollType];
      }
    }
    _$jscoverage['/drag.js'].lineData[105]++;
    if (visit20_105_1(bound !== undefined)) {
      _$jscoverage['/drag.js'].lineData[106]++;
      var scrollCfg = {};
      _$jscoverage['/drag.js'].lineData[107]++;
      scrollCfg[scrollType] = bound;
      _$jscoverage['/drag.js'].lineData[108]++;
      self.scrollTo(scrollCfg, {
  duration: self.get('bounceDuration'), 
  easing: self.get('bounceEasing'), 
  queue: false, 
  complete: endCallback});
      _$jscoverage['/drag.js'].lineData[114]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[117]++;
    if (visit21_117_1(self.pagesOffset)) {
      _$jscoverage['/drag.js'].lineData[118]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[119]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[122]++;
    var duration = now - swipe[scrollType].startTime;
    _$jscoverage['/drag.js'].lineData[123]++;
    var distance = (scroll - swipe[scrollType].scroll);
    _$jscoverage['/drag.js'].lineData[127]++;
    if (visit22_127_1(visit23_127_2(duration == 0) || visit24_127_3(distance == 0))) {
      _$jscoverage['/drag.js'].lineData[128]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[129]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[135]++;
    var velocity = distance / duration;
    _$jscoverage['/drag.js'].lineData[137]++;
    velocity = Math.min(Math.max(velocity, -MAX_SWIPE_VELOCITY), MAX_SWIPE_VELOCITY);
    _$jscoverage['/drag.js'].lineData[142]++;
    var animCfg = {
  node: {}, 
  to: {}, 
  duration: 9999, 
  queue: false, 
  complete: endCallback, 
  frame: makeMomentumFx(self, velocity, scroll, scrollAxis, maxScroll[scrollType], minScroll[scrollType])};
    _$jscoverage['/drag.js'].lineData[153]++;
    animCfg.node[scrollType] = scroll;
    _$jscoverage['/drag.js'].lineData[154]++;
    animCfg.to[scrollType] = null;
    _$jscoverage['/drag.js'].lineData[156]++;
    self.scrollAnims.push(new Anim(animCfg).run());
  }
  _$jscoverage['/drag.js'].lineData[159]++;
  var FRICTION = 0.5;
  _$jscoverage['/drag.js'].lineData[160]++;
  var ACCELERATION = 20;
  _$jscoverage['/drag.js'].lineData[161]++;
  var THETA = Math.log(1 - (FRICTION / 10));
  _$jscoverage['/drag.js'].lineData[162]++;
  var ALPHA = THETA / ACCELERATION;
  _$jscoverage['/drag.js'].lineData[163]++;
  var SPRING_TENSION = 0.3;
  _$jscoverage['/drag.js'].lineData[165]++;
  function makeMomentumFx(self, startVelocity, startScroll, scrollAxis, maxScroll, minScroll) {
    _$jscoverage['/drag.js'].functionData[5]++;
    _$jscoverage['/drag.js'].lineData[167]++;
    var velocity = startVelocity * ACCELERATION;
    _$jscoverage['/drag.js'].lineData[168]++;
    var inertia = 1;
    _$jscoverage['/drag.js'].lineData[169]++;
    var bounceStartTime = 0;
    _$jscoverage['/drag.js'].lineData[170]++;
    return function(anim, fx) {
  _$jscoverage['/drag.js'].functionData[6]++;
  _$jscoverage['/drag.js'].lineData[171]++;
  var now = S.now(), deltaTime, value;
  _$jscoverage['/drag.js'].lineData[174]++;
  if (visit25_174_1(inertia)) {
    _$jscoverage['/drag.js'].lineData[175]++;
    deltaTime = now - anim.startTime;
    _$jscoverage['/drag.js'].lineData[179]++;
    var frictionFactor = Math.exp(deltaTime * ALPHA);
    _$jscoverage['/drag.js'].lineData[181]++;
    value = parseInt(startScroll + velocity * (1 - frictionFactor) / (-THETA));
    _$jscoverage['/drag.js'].lineData[182]++;
    if (visit26_182_1(visit27_182_2(value > minScroll) && visit28_182_3(value < maxScroll))) {
      _$jscoverage['/drag.js'].lineData[184]++;
      if (visit29_184_1(fx.lastValue === value)) {
        _$jscoverage['/drag.js'].lineData[185]++;
        fx.pos = 1;
        _$jscoverage['/drag.js'].lineData[186]++;
        return;
      }
      _$jscoverage['/drag.js'].lineData[188]++;
      fx.lastValue = value;
      _$jscoverage['/drag.js'].lineData[189]++;
      self.set(scrollAxis, value);
      _$jscoverage['/drag.js'].lineData[190]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[192]++;
    inertia = 0;
    _$jscoverage['/drag.js'].lineData[193]++;
    velocity = velocity * frictionFactor;
    _$jscoverage['/drag.js'].lineData[199]++;
    startScroll = visit30_199_1(value <= minScroll) ? minScroll : maxScroll;
    _$jscoverage['/drag.js'].lineData[201]++;
    bounceStartTime = now;
  } else {
    _$jscoverage['/drag.js'].lineData[203]++;
    deltaTime = now - bounceStartTime;
    _$jscoverage['/drag.js'].lineData[205]++;
    var theta = (deltaTime / ACCELERATION), powTime = theta * Math.exp(-SPRING_TENSION * theta);
    _$jscoverage['/drag.js'].lineData[209]++;
    value = parseInt(velocity * powTime);
    _$jscoverage['/drag.js'].lineData[210]++;
    if (visit31_210_1(value === 0)) {
      _$jscoverage['/drag.js'].lineData[211]++;
      fx.pos = 1;
    }
    _$jscoverage['/drag.js'].lineData[213]++;
    self.set(scrollAxis, startScroll + value);
  }
};
  }
  _$jscoverage['/drag.js'].lineData[218]++;
  function onDragStartHandler(e) {
    _$jscoverage['/drag.js'].functionData[7]++;
    _$jscoverage['/drag.js'].lineData[219]++;
    var self = this, touches = e.touches;
    _$jscoverage['/drag.js'].lineData[221]++;
    if (visit32_221_1(self.get('disabled'))) {
      _$jscoverage['/drag.js'].lineData[222]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[224]++;
    self.stopAnimation();
    _$jscoverage['/drag.js'].lineData[225]++;
    var pos = {
  pageX: e.touches[0].pageX, 
  pageY: e.touches[0].pageY};
    _$jscoverage['/drag.js'].lineData[229]++;
    var isScrolling = self.isScrolling;
    _$jscoverage['/drag.js'].lineData[230]++;
    if (visit33_230_1(isScrolling)) {
      _$jscoverage['/drag.js'].lineData[231]++;
      var pageIndex = self.get('pageIndex');
      _$jscoverage['/drag.js'].lineData[232]++;
      self.fire('scrollEnd', S.mix({
  fromPageIndex: pageIndex, 
  pageIndex: pageIndex}, pos));
    }
    _$jscoverage['/drag.js'].lineData[237]++;
    if (visit34_237_1(touches.length > 1)) {
      _$jscoverage['/drag.js'].lineData[238]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[240]++;
    initStates(self);
    _$jscoverage['/drag.js'].lineData[241]++;
    self.startMousePos = pos;
    _$jscoverage['/drag.js'].lineData[242]++;
    onDragStart(self, e, 'left');
    _$jscoverage['/drag.js'].lineData[243]++;
    onDragStart(self, e, 'top');
    _$jscoverage['/drag.js'].lineData[245]++;
    self.$contentEl.on(Gesture.move, onDragHandler, self);
  }
  _$jscoverage['/drag.js'].lineData[248]++;
  function onDragHandler(e) {
    _$jscoverage['/drag.js'].functionData[8]++;
    _$jscoverage['/drag.js'].lineData[249]++;
    var self = this, touches = e.touches, startMousePos = self.startMousePos;
    _$jscoverage['/drag.js'].lineData[254]++;
    if (visit35_254_1(!touches.length)) {
      _$jscoverage['/drag.js'].lineData[255]++;
      onDragEndHandler.call(self, e);
      _$jscoverage['/drag.js'].lineData[256]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[259]++;
    if (visit36_259_1(!startMousePos)) {
      _$jscoverage['/drag.js'].lineData[260]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[263]++;
    var pos = {
  pageX: touches[0].pageX, 
  pageY: touches[0].pageY};
    _$jscoverage['/drag.js'].lineData[268]++;
    var xDiff = Math.abs(pos.pageX - startMousePos.pageX);
    _$jscoverage['/drag.js'].lineData[269]++;
    var yDiff = Math.abs(pos.pageY - startMousePos.pageY);
    _$jscoverage['/drag.js'].lineData[272]++;
    if (visit37_272_1(Math.max(xDiff, yDiff) < PIXEL_THRESH)) {
      _$jscoverage['/drag.js'].lineData[273]++;
      return;
    } else {
      _$jscoverage['/drag.js'].lineData[275]++;
      if (visit38_275_1(!self.isScrolling)) {
        _$jscoverage['/drag.js'].lineData[276]++;
        self.fire('scrollStart', pos);
        _$jscoverage['/drag.js'].lineData[277]++;
        self.isScrolling = 1;
      }
    }
    _$jscoverage['/drag.js'].lineData[281]++;
    var lockX = self.get('lockX'), lockY = self.get('lockY');
    _$jscoverage['/drag.js'].lineData[285]++;
    if (visit39_285_1(lockX || lockY)) {
      _$jscoverage['/drag.js'].lineData[286]++;
      var dragInitDirection;
      _$jscoverage['/drag.js'].lineData[288]++;
      if (visit40_288_1(!(dragInitDirection = self.dragInitDirection))) {
        _$jscoverage['/drag.js'].lineData[289]++;
        self.dragInitDirection = dragInitDirection = visit41_289_1(xDiff > yDiff) ? 'left' : 'top';
      }
      _$jscoverage['/drag.js'].lineData[292]++;
      if (visit42_292_1(lockX && visit43_292_2(visit44_292_3(dragInitDirection == 'left') && !self.allowScroll[dragInitDirection]))) {
        _$jscoverage['/drag.js'].lineData[294]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[295]++;
        return;
      }
      _$jscoverage['/drag.js'].lineData[298]++;
      if (visit45_298_1(lockY && visit46_298_2(visit47_298_3(dragInitDirection == 'top') && !self.allowScroll[dragInitDirection]))) {
        _$jscoverage['/drag.js'].lineData[300]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[301]++;
        return;
      }
    }
    _$jscoverage['/drag.js'].lineData[305]++;
    if (visit48_305_1(S.Features.isTouchEventSupported())) {
      _$jscoverage['/drag.js'].lineData[306]++;
      e.preventDefault();
    }
    _$jscoverage['/drag.js'].lineData[309]++;
    onDragScroll(self, e, 'left', startMousePos);
    _$jscoverage['/drag.js'].lineData[310]++;
    onDragScroll(self, e, 'top', startMousePos);
    _$jscoverage['/drag.js'].lineData[313]++;
    self.fire('scrollMove', pos);
  }
  _$jscoverage['/drag.js'].lineData[316]++;
  if (visit49_316_1(S.UA.ie)) {
    _$jscoverage['/drag.js'].lineData[317]++;
    onDragHandler = S.throttle(onDragHandler, 30);
  }
  _$jscoverage['/drag.js'].lineData[320]++;
  function onDragEndHandler(e) {
    _$jscoverage['/drag.js'].functionData[9]++;
    _$jscoverage['/drag.js'].lineData[321]++;
    var self = this;
    _$jscoverage['/drag.js'].lineData[322]++;
    var startMousePos = self.startMousePos;
    _$jscoverage['/drag.js'].lineData[323]++;
    self.$contentEl.detach(Gesture.move, onDragHandler, self);
    _$jscoverage['/drag.js'].lineData[324]++;
    if (visit50_324_1(!startMousePos || !self.isScrolling)) {
      _$jscoverage['/drag.js'].lineData[325]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[327]++;
    var count = 0;
    _$jscoverage['/drag.js'].lineData[328]++;
    var offsetX = startMousePos.pageX - e.pageX;
    _$jscoverage['/drag.js'].lineData[329]++;
    var offsetY = startMousePos.pageY - e.pageY;
    _$jscoverage['/drag.js'].lineData[330]++;
    var snapThreshold = self.get('snapThreshold');
    _$jscoverage['/drag.js'].lineData[331]++;
    var allowX = visit51_331_1(self.allowScroll.left && visit52_331_2(Math.abs(offsetX) > snapThreshold));
    _$jscoverage['/drag.js'].lineData[332]++;
    var allowY = visit53_332_1(self.allowScroll.top && visit54_332_2(Math.abs(offsetY) > snapThreshold));
    _$jscoverage['/drag.js'].lineData[333]++;
    self.fire('dragend', {
  pageX: e.pageX, 
  pageY: e.pageY});
    _$jscoverage['/drag.js'].lineData[337]++;
    function endCallback() {
      _$jscoverage['/drag.js'].functionData[10]++;
      _$jscoverage['/drag.js'].lineData[338]++;
      count++;
      _$jscoverage['/drag.js'].lineData[339]++;
      if (visit55_339_1(count == 2)) {
        _$jscoverage['/drag.js'].lineData[340]++;
        function scrollEnd() {
          _$jscoverage['/drag.js'].functionData[11]++;
          _$jscoverage['/drag.js'].lineData[341]++;
          self.isScrolling = 0;
          _$jscoverage['/drag.js'].lineData[342]++;
          self.fire('scrollEnd', {
  pageX: e.pageX, 
  pageY: e.pageY, 
  fromPageIndex: pageIndex, 
  pageIndex: self.get('pageIndex')});
        }        _$jscoverage['/drag.js'].lineData[350]++;
        if (visit56_350_1(!self.pagesOffset)) {
          _$jscoverage['/drag.js'].lineData[351]++;
          scrollEnd();
          _$jscoverage['/drag.js'].lineData[352]++;
          return;
        }
        _$jscoverage['/drag.js'].lineData[355]++;
        var snapThreshold = self.get('snapThreshold');
        _$jscoverage['/drag.js'].lineData[356]++;
        var snapDuration = self.get('snapDuration');
        _$jscoverage['/drag.js'].lineData[357]++;
        var snapEasing = self.get('snapEasing');
        _$jscoverage['/drag.js'].lineData[358]++;
        var pageIndex = self.get('pageIndex');
        _$jscoverage['/drag.js'].lineData[359]++;
        var scrollLeft = self.get('scrollLeft');
        _$jscoverage['/drag.js'].lineData[360]++;
        var scrollTop = self.get('scrollTop');
        _$jscoverage['/drag.js'].lineData[362]++;
        var animCfg = {
  duration: snapDuration, 
  easing: snapEasing, 
  complete: scrollEnd};
        _$jscoverage['/drag.js'].lineData[368]++;
        var pagesOffset = self.pagesOffset.concat([]);
        _$jscoverage['/drag.js'].lineData[370]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[372]++;
        if (visit57_372_1(allowX || allowY)) {
          _$jscoverage['/drag.js'].lineData[373]++;
          if (visit58_373_1(allowX && allowY)) {
            _$jscoverage['/drag.js'].lineData[374]++;
            var prepareX = [], newPageIndex = undefined;
            _$jscoverage['/drag.js'].lineData[376]++;
            var nowXY = {
  left: scrollLeft, 
  top: scrollTop};
            _$jscoverage['/drag.js'].lineData[380]++;
            S.each(pagesOffset, function(offset) {
  _$jscoverage['/drag.js'].functionData[12]++;
  _$jscoverage['/drag.js'].lineData[381]++;
  if (visit59_381_1(!offset)) {
    _$jscoverage['/drag.js'].lineData[382]++;
    return;
  }
  _$jscoverage['/drag.js'].lineData[384]++;
  if (visit60_384_1(visit61_384_2(offsetX > 0) && visit62_384_3(offset.left > nowXY.left))) {
    _$jscoverage['/drag.js'].lineData[385]++;
    prepareX.push(offset);
  } else {
    _$jscoverage['/drag.js'].lineData[386]++;
    if (visit63_386_1(visit64_386_2(offsetX < 0) && visit65_386_3(offset.left < nowXY.left))) {
      _$jscoverage['/drag.js'].lineData[387]++;
      prepareX.push(offset);
    }
  }
});
            _$jscoverage['/drag.js'].lineData[390]++;
            var min;
            _$jscoverage['/drag.js'].lineData[391]++;
            if (visit66_391_1(offsetY > 0)) {
              _$jscoverage['/drag.js'].lineData[392]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/drag.js'].lineData[393]++;
              S.each(prepareX, function(x) {
  _$jscoverage['/drag.js'].functionData[13]++;
  _$jscoverage['/drag.js'].lineData[394]++;
  if (visit67_394_1(x.top > nowXY.top)) {
    _$jscoverage['/drag.js'].lineData[395]++;
    if (visit68_395_1(min < x.top - nowXY.top)) {
      _$jscoverage['/drag.js'].lineData[396]++;
      min = x.top - nowXY.top;
      _$jscoverage['/drag.js'].lineData[397]++;
      newPageIndex = prepareX.index;
    }
  }
});
            } else {
              _$jscoverage['/drag.js'].lineData[402]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/drag.js'].lineData[403]++;
              S.each(prepareX, function(x) {
  _$jscoverage['/drag.js'].functionData[14]++;
  _$jscoverage['/drag.js'].lineData[404]++;
  if (visit69_404_1(x.top < nowXY.top)) {
    _$jscoverage['/drag.js'].lineData[405]++;
    if (visit70_405_1(min < nowXY.top - x.top)) {
      _$jscoverage['/drag.js'].lineData[406]++;
      min = nowXY.top - x.top;
      _$jscoverage['/drag.js'].lineData[407]++;
      newPageIndex = prepareX.index;
    }
  }
});
            }
            _$jscoverage['/drag.js'].lineData[412]++;
            if (visit71_412_1(newPageIndex != undefined)) {
              _$jscoverage['/drag.js'].lineData[413]++;
              if (visit72_413_1(newPageIndex != pageIndex)) {
                _$jscoverage['/drag.js'].lineData[414]++;
                self.scrollToPage(newPageIndex, animCfg);
              } else {
                _$jscoverage['/drag.js'].lineData[416]++;
                self.scrollToPage(newPageIndex);
                _$jscoverage['/drag.js'].lineData[417]++;
                scrollEnd();
              }
            } else {
              _$jscoverage['/drag.js'].lineData[420]++;
              scrollEnd();
            }
          } else {
            _$jscoverage['/drag.js'].lineData[423]++;
            if (visit73_423_1(allowX || allowY)) {
              _$jscoverage['/drag.js'].lineData[424]++;
              var toPageIndex = self._getPageIndexFromXY(allowX ? scrollLeft : scrollTop, allowX, allowX ? offsetX : offsetY);
              _$jscoverage['/drag.js'].lineData[427]++;
              self.scrollToPage(toPageIndex, animCfg);
            } else {
              _$jscoverage['/drag.js'].lineData[429]++;
              self.scrollToPage(self.get('pageIndex'));
              _$jscoverage['/drag.js'].lineData[430]++;
              scrollEnd();
            }
          }
        }
      }
    }
    _$jscoverage['/drag.js'].lineData[437]++;
    onDragEndAxis(self, e, 'left', endCallback);
    _$jscoverage['/drag.js'].lineData[438]++;
    onDragEndAxis(self, e, 'top', endCallback);
  }
  _$jscoverage['/drag.js'].lineData[441]++;
  function initStates(self) {
    _$jscoverage['/drag.js'].functionData[15]++;
    _$jscoverage['/drag.js'].lineData[442]++;
    self.lastPageXY = {};
    _$jscoverage['/drag.js'].lineData[443]++;
    self.lastDirection = {};
    _$jscoverage['/drag.js'].lineData[444]++;
    self.swipe = {
  left: {}, 
  top: {}};
    _$jscoverage['/drag.js'].lineData[448]++;
    self.startMousePos = null;
    _$jscoverage['/drag.js'].lineData[449]++;
    self.startScroll = {};
    _$jscoverage['/drag.js'].lineData[450]++;
    self.dragInitDirection = null;
  }
  _$jscoverage['/drag.js'].lineData[453]++;
  function preventDefault(e) {
    _$jscoverage['/drag.js'].functionData[16]++;
    _$jscoverage['/drag.js'].lineData[454]++;
    e.preventDefault();
  }
  _$jscoverage['/drag.js'].lineData[457]++;
  return ScrollViewBase.extend({
  bindUI: function() {
  _$jscoverage['/drag.js'].functionData[17]++;
  _$jscoverage['/drag.js'].lineData[459]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[462]++;
  self.$contentEl.on('dragstart', preventDefault).on(Gesture.start, onDragStartHandler, self).on(Gesture.end, onDragEndHandler, self);
}, 
  syncUI: function() {
  _$jscoverage['/drag.js'].functionData[18]++;
  _$jscoverage['/drag.js'].lineData[466]++;
  initStates(this);
}, 
  destructor: function() {
  _$jscoverage['/drag.js'].functionData[19]++;
  _$jscoverage['/drag.js'].lineData[470]++;
  this.stopAnimation();
}, 
  stopAnimation: function() {
  _$jscoverage['/drag.js'].functionData[20]++;
  _$jscoverage['/drag.js'].lineData[474]++;
  this.callSuper();
  _$jscoverage['/drag.js'].lineData[475]++;
  this.isScrolling = 0;
}}, {
  ATTRS: {
  lockX: {
  value: true}, 
  lockY: {
  value: false}, 
  snapThreshold: {
  value: 5}, 
  bounce: {
  value: true}, 
  bounceDuration: {
  value: 0.4}, 
  bounceEasing: {
  value: 'easeOut'}}, 
  xclass: 'scroll-view'});
}, {
  requires: ['./base', 'node', 'anim']});
