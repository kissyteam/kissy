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
  _$jscoverage['/drag.js'].lineData[15] = 0;
  _$jscoverage['/drag.js'].lineData[17] = 0;
  _$jscoverage['/drag.js'].lineData[18] = 0;
  _$jscoverage['/drag.js'].lineData[19] = 0;
  _$jscoverage['/drag.js'].lineData[22] = 0;
  _$jscoverage['/drag.js'].lineData[23] = 0;
  _$jscoverage['/drag.js'].lineData[24] = 0;
  _$jscoverage['/drag.js'].lineData[26] = 0;
  _$jscoverage['/drag.js'].lineData[30] = 0;
  _$jscoverage['/drag.js'].lineData[32] = 0;
  _$jscoverage['/drag.js'].lineData[43] = 0;
  _$jscoverage['/drag.js'].lineData[44] = 0;
  _$jscoverage['/drag.js'].lineData[45] = 0;
  _$jscoverage['/drag.js'].lineData[48] = 0;
  _$jscoverage['/drag.js'].lineData[49] = 0;
  _$jscoverage['/drag.js'].lineData[52] = 0;
  _$jscoverage['/drag.js'].lineData[53] = 0;
  _$jscoverage['/drag.js'].lineData[54] = 0;
  _$jscoverage['/drag.js'].lineData[55] = 0;
  _$jscoverage['/drag.js'].lineData[56] = 0;
  _$jscoverage['/drag.js'].lineData[57] = 0;
  _$jscoverage['/drag.js'].lineData[58] = 0;
  _$jscoverage['/drag.js'].lineData[59] = 0;
  _$jscoverage['/drag.js'].lineData[62] = 0;
  _$jscoverage['/drag.js'].lineData[65] = 0;
  _$jscoverage['/drag.js'].lineData[67] = 0;
  _$jscoverage['/drag.js'].lineData[68] = 0;
  _$jscoverage['/drag.js'].lineData[72] = 0;
  _$jscoverage['/drag.js'].lineData[73] = 0;
  _$jscoverage['/drag.js'].lineData[75] = 0;
  _$jscoverage['/drag.js'].lineData[78] = 0;
  _$jscoverage['/drag.js'].lineData[79] = 0;
  _$jscoverage['/drag.js'].lineData[80] = 0;
  _$jscoverage['/drag.js'].lineData[81] = 0;
  _$jscoverage['/drag.js'].lineData[83] = 0;
  _$jscoverage['/drag.js'].lineData[86] = 0;
  _$jscoverage['/drag.js'].lineData[87] = 0;
  _$jscoverage['/drag.js'].lineData[88] = 0;
  _$jscoverage['/drag.js'].lineData[89] = 0;
  _$jscoverage['/drag.js'].lineData[91] = 0;
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
  _$jscoverage['/drag.js'].lineData[150] = 0;
  _$jscoverage['/drag.js'].lineData[157] = 0;
  _$jscoverage['/drag.js'].lineData[158] = 0;
  _$jscoverage['/drag.js'].lineData[159] = 0;
  _$jscoverage['/drag.js'].lineData[160] = 0;
  _$jscoverage['/drag.js'].lineData[161] = 0;
  _$jscoverage['/drag.js'].lineData[163] = 0;
  _$jscoverage['/drag.js'].lineData[165] = 0;
  _$jscoverage['/drag.js'].lineData[166] = 0;
  _$jscoverage['/drag.js'].lineData[167] = 0;
  _$jscoverage['/drag.js'].lineData[168] = 0;
  _$jscoverage['/drag.js'].lineData[169] = 0;
  _$jscoverage['/drag.js'].lineData[174] = 0;
  _$jscoverage['/drag.js'].lineData[175] = 0;
  _$jscoverage['/drag.js'].lineData[179] = 0;
  _$jscoverage['/drag.js'].lineData[181] = 0;
  _$jscoverage['/drag.js'].lineData[182] = 0;
  _$jscoverage['/drag.js'].lineData[184] = 0;
  _$jscoverage['/drag.js'].lineData[185] = 0;
  _$jscoverage['/drag.js'].lineData[187] = 0;
  _$jscoverage['/drag.js'].lineData[188] = 0;
  _$jscoverage['/drag.js'].lineData[189] = 0;
  _$jscoverage['/drag.js'].lineData[191] = 0;
  _$jscoverage['/drag.js'].lineData[192] = 0;
  _$jscoverage['/drag.js'].lineData[198] = 0;
  _$jscoverage['/drag.js'].lineData[200] = 0;
  _$jscoverage['/drag.js'].lineData[202] = 0;
  _$jscoverage['/drag.js'].lineData[204] = 0;
  _$jscoverage['/drag.js'].lineData[208] = 0;
  _$jscoverage['/drag.js'].lineData[209] = 0;
  _$jscoverage['/drag.js'].lineData[210] = 0;
  _$jscoverage['/drag.js'].lineData[212] = 0;
  _$jscoverage['/drag.js'].lineData[217] = 0;
  _$jscoverage['/drag.js'].lineData[219] = 0;
  _$jscoverage['/drag.js'].lineData[220] = 0;
  _$jscoverage['/drag.js'].lineData[221] = 0;
  _$jscoverage['/drag.js'].lineData[223] = 0;
  _$jscoverage['/drag.js'].lineData[227] = 0;
  _$jscoverage['/drag.js'].lineData[228] = 0;
  _$jscoverage['/drag.js'].lineData[229] = 0;
  _$jscoverage['/drag.js'].lineData[230] = 0;
  _$jscoverage['/drag.js'].lineData[231] = 0;
  _$jscoverage['/drag.js'].lineData[236] = 0;
  _$jscoverage['/drag.js'].lineData[237] = 0;
  _$jscoverage['/drag.js'].lineData[238] = 0;
  _$jscoverage['/drag.js'].lineData[239] = 0;
  _$jscoverage['/drag.js'].lineData[240] = 0;
  _$jscoverage['/drag.js'].lineData[241] = 0;
  _$jscoverage['/drag.js'].lineData[244] = 0;
  _$jscoverage['/drag.js'].lineData[245] = 0;
  _$jscoverage['/drag.js'].lineData[248] = 0;
  _$jscoverage['/drag.js'].lineData[249] = 0;
  _$jscoverage['/drag.js'].lineData[252] = 0;
  _$jscoverage['/drag.js'].lineData[255] = 0;
  _$jscoverage['/drag.js'].lineData[261] = 0;
  _$jscoverage['/drag.js'].lineData[262] = 0;
  _$jscoverage['/drag.js'].lineData[264] = 0;
  _$jscoverage['/drag.js'].lineData[265] = 0;
  _$jscoverage['/drag.js'].lineData[272] = 0;
  _$jscoverage['/drag.js'].lineData[273] = 0;
  _$jscoverage['/drag.js'].lineData[274] = 0;
  _$jscoverage['/drag.js'].lineData[277] = 0;
  _$jscoverage['/drag.js'].lineData[278] = 0;
  _$jscoverage['/drag.js'].lineData[279] = 0;
  _$jscoverage['/drag.js'].lineData[283] = 0;
  _$jscoverage['/drag.js'].lineData[285] = 0;
  _$jscoverage['/drag.js'].lineData[286] = 0;
  _$jscoverage['/drag.js'].lineData[289] = 0;
  _$jscoverage['/drag.js'].lineData[292] = 0;
  _$jscoverage['/drag.js'].lineData[293] = 0;
  _$jscoverage['/drag.js'].lineData[294] = 0;
  _$jscoverage['/drag.js'].lineData[295] = 0;
  _$jscoverage['/drag.js'].lineData[296] = 0;
  _$jscoverage['/drag.js'].lineData[297] = 0;
  _$jscoverage['/drag.js'].lineData[299] = 0;
  _$jscoverage['/drag.js'].lineData[300] = 0;
  _$jscoverage['/drag.js'].lineData[301] = 0;
  _$jscoverage['/drag.js'].lineData[302] = 0;
  _$jscoverage['/drag.js'].lineData[303] = 0;
  _$jscoverage['/drag.js'].lineData[305] = 0;
  _$jscoverage['/drag.js'].lineData[310] = 0;
  _$jscoverage['/drag.js'].lineData[311] = 0;
  _$jscoverage['/drag.js'].lineData[312] = 0;
  _$jscoverage['/drag.js'].lineData[313] = 0;
  _$jscoverage['/drag.js'].lineData[314] = 0;
  _$jscoverage['/drag.js'].lineData[315] = 0;
  _$jscoverage['/drag.js'].lineData[323] = 0;
  _$jscoverage['/drag.js'].lineData[324] = 0;
  _$jscoverage['/drag.js'].lineData[325] = 0;
  _$jscoverage['/drag.js'].lineData[328] = 0;
  _$jscoverage['/drag.js'].lineData[329] = 0;
  _$jscoverage['/drag.js'].lineData[330] = 0;
  _$jscoverage['/drag.js'].lineData[331] = 0;
  _$jscoverage['/drag.js'].lineData[332] = 0;
  _$jscoverage['/drag.js'].lineData[333] = 0;
  _$jscoverage['/drag.js'].lineData[335] = 0;
  _$jscoverage['/drag.js'].lineData[341] = 0;
  _$jscoverage['/drag.js'].lineData[343] = 0;
  _$jscoverage['/drag.js'].lineData[345] = 0;
  _$jscoverage['/drag.js'].lineData[346] = 0;
  _$jscoverage['/drag.js'].lineData[347] = 0;
  _$jscoverage['/drag.js'].lineData[349] = 0;
  _$jscoverage['/drag.js'].lineData[353] = 0;
  _$jscoverage['/drag.js'].lineData[354] = 0;
  _$jscoverage['/drag.js'].lineData[355] = 0;
  _$jscoverage['/drag.js'].lineData[357] = 0;
  _$jscoverage['/drag.js'].lineData[358] = 0;
  _$jscoverage['/drag.js'].lineData[359] = 0;
  _$jscoverage['/drag.js'].lineData[360] = 0;
  _$jscoverage['/drag.js'].lineData[363] = 0;
  _$jscoverage['/drag.js'].lineData[364] = 0;
  _$jscoverage['/drag.js'].lineData[365] = 0;
  _$jscoverage['/drag.js'].lineData[366] = 0;
  _$jscoverage['/drag.js'].lineData[367] = 0;
  _$jscoverage['/drag.js'].lineData[368] = 0;
  _$jscoverage['/drag.js'].lineData[369] = 0;
  _$jscoverage['/drag.js'].lineData[370] = 0;
  _$jscoverage['/drag.js'].lineData[375] = 0;
  _$jscoverage['/drag.js'].lineData[376] = 0;
  _$jscoverage['/drag.js'].lineData[377] = 0;
  _$jscoverage['/drag.js'].lineData[378] = 0;
  _$jscoverage['/drag.js'].lineData[379] = 0;
  _$jscoverage['/drag.js'].lineData[380] = 0;
  _$jscoverage['/drag.js'].lineData[385] = 0;
  _$jscoverage['/drag.js'].lineData[386] = 0;
  _$jscoverage['/drag.js'].lineData[387] = 0;
  _$jscoverage['/drag.js'].lineData[389] = 0;
  _$jscoverage['/drag.js'].lineData[390] = 0;
  _$jscoverage['/drag.js'].lineData[393] = 0;
  _$jscoverage['/drag.js'].lineData[396] = 0;
  _$jscoverage['/drag.js'].lineData[397] = 0;
  _$jscoverage['/drag.js'].lineData[400] = 0;
  _$jscoverage['/drag.js'].lineData[402] = 0;
  _$jscoverage['/drag.js'].lineData[403] = 0;
  _$jscoverage['/drag.js'].lineData[410] = 0;
  _$jscoverage['/drag.js'].lineData[411] = 0;
  _$jscoverage['/drag.js'].lineData[414] = 0;
  _$jscoverage['/drag.js'].lineData[415] = 0;
  _$jscoverage['/drag.js'].lineData[417] = 0;
  _$jscoverage['/drag.js'].lineData[419] = 0;
  _$jscoverage['/drag.js'].lineData[424] = 0;
  _$jscoverage['/drag.js'].lineData[426] = 0;
  _$jscoverage['/drag.js'].lineData[428] = 0;
  _$jscoverage['/drag.js'].lineData[431] = 0;
  _$jscoverage['/drag.js'].lineData[432] = 0;
  _$jscoverage['/drag.js'].lineData[435] = 0;
  _$jscoverage['/drag.js'].lineData[437] = 0;
  _$jscoverage['/drag.js'].lineData[441] = 0;
  _$jscoverage['/drag.js'].lineData[445] = 0;
  _$jscoverage['/drag.js'].lineData[449] = 0;
  _$jscoverage['/drag.js'].lineData[453] = 0;
  _$jscoverage['/drag.js'].lineData[454] = 0;
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
  _$jscoverage['/drag.js'].branchData['23'] = [];
  _$jscoverage['/drag.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['30'] = [];
  _$jscoverage['/drag.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['43'] = [];
  _$jscoverage['/drag.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['44'] = [];
  _$jscoverage['/drag.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['45'] = [];
  _$jscoverage['/drag.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['48'] = [];
  _$jscoverage['/drag.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['52'] = [];
  _$jscoverage['/drag.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['56'] = [];
  _$jscoverage['/drag.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['65'] = [];
  _$jscoverage['/drag.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['65'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['65'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['65'][4] = new BranchData();
  _$jscoverage['/drag.js'].branchData['66'] = [];
  _$jscoverage['/drag.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['66'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['79'] = [];
  _$jscoverage['/drag.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['80'] = [];
  _$jscoverage['/drag.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['87'] = [];
  _$jscoverage['/drag.js'].branchData['87'][1] = new BranchData();
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
  _$jscoverage['/drag.js'].branchData['198'] = [];
  _$jscoverage['/drag.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['209'] = [];
  _$jscoverage['/drag.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['220'] = [];
  _$jscoverage['/drag.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['229'] = [];
  _$jscoverage['/drag.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['248'] = [];
  _$jscoverage['/drag.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['261'] = [];
  _$jscoverage['/drag.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['264'] = [];
  _$jscoverage['/drag.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['265'] = [];
  _$jscoverage['/drag.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['272'] = [];
  _$jscoverage['/drag.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['272'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['272'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['277'] = [];
  _$jscoverage['/drag.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['277'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['277'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['296'] = [];
  _$jscoverage['/drag.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['302'] = [];
  _$jscoverage['/drag.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['303'] = [];
  _$jscoverage['/drag.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['303'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['312'] = [];
  _$jscoverage['/drag.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['323'] = [];
  _$jscoverage['/drag.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['345'] = [];
  _$jscoverage['/drag.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['346'] = [];
  _$jscoverage['/drag.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['354'] = [];
  _$jscoverage['/drag.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['357'] = [];
  _$jscoverage['/drag.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['357'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['357'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['359'] = [];
  _$jscoverage['/drag.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['359'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['359'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['364'] = [];
  _$jscoverage['/drag.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['367'] = [];
  _$jscoverage['/drag.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['368'] = [];
  _$jscoverage['/drag.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['377'] = [];
  _$jscoverage['/drag.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['378'] = [];
  _$jscoverage['/drag.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['385'] = [];
  _$jscoverage['/drag.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['386'] = [];
  _$jscoverage['/drag.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['396'] = [];
  _$jscoverage['/drag.js'].branchData['396'][1] = new BranchData();
}
_$jscoverage['/drag.js'].branchData['396'][1].init(30, 16, 'allowX || allowY');
function visit67_396_1(result) {
  _$jscoverage['/drag.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['386'][1].init(34, 25, 'newPageIndex != pageIndex');
function visit66_386_1(result) {
  _$jscoverage['/drag.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['385'][1].init(1908, 25, 'newPageIndex != undefined');
function visit65_385_1(result) {
  _$jscoverage['/drag.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['378'][1].init(42, 23, 'min < nowXY.top - x.top');
function visit64_378_1(result) {
  _$jscoverage['/drag.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['377'][1].init(38, 17, 'x.top < nowXY.top');
function visit63_377_1(result) {
  _$jscoverage['/drag.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['368'][1].init(42, 23, 'min < x.top - nowXY.top');
function visit62_368_1(result) {
  _$jscoverage['/drag.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['367'][1].init(38, 17, 'x.top > nowXY.top');
function visit61_367_1(result) {
  _$jscoverage['/drag.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['364'][1].init(833, 11, 'offsetY > 0');
function visit60_364_1(result) {
  _$jscoverage['/drag.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['359'][3].init(305, 24, 'offset.left < nowXY.left');
function visit59_359_3(result) {
  _$jscoverage['/drag.js'].branchData['359'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['359'][2].init(290, 11, 'offsetX < 0');
function visit58_359_2(result) {
  _$jscoverage['/drag.js'].branchData['359'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['359'][1].init(290, 39, 'offsetX < 0 && offset.left < nowXY.left');
function visit57_359_1(result) {
  _$jscoverage['/drag.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['357'][3].init(165, 24, 'offset.left > nowXY.left');
function visit56_357_3(result) {
  _$jscoverage['/drag.js'].branchData['357'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['357'][2].init(150, 11, 'offsetX > 0');
function visit55_357_2(result) {
  _$jscoverage['/drag.js'].branchData['357'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['357'][1].init(150, 39, 'offsetX > 0 && offset.left > nowXY.left');
function visit54_357_1(result) {
  _$jscoverage['/drag.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['354'][1].init(34, 7, '!offset');
function visit53_354_1(result) {
  _$jscoverage['/drag.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['346'][1].init(26, 16, 'allowX && allowY');
function visit52_346_1(result) {
  _$jscoverage['/drag.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['345'][1].init(1159, 16, 'allowX || allowY');
function visit51_345_1(result) {
  _$jscoverage['/drag.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['323'][1].init(388, 17, '!self.pagesOffset');
function visit50_323_1(result) {
  _$jscoverage['/drag.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['312'][1].init(40, 10, 'count == 2');
function visit49_312_1(result) {
  _$jscoverage['/drag.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['303'][2].init(476, 33, 'Math.abs(offsetY) > snapThreshold');
function visit48_303_2(result) {
  _$jscoverage['/drag.js'].branchData['303'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['303'][1].init(452, 57, 'self.allowScroll.top && Math.abs(offsetY) > snapThreshold');
function visit47_303_1(result) {
  _$jscoverage['/drag.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['302'][2].init(395, 33, 'Math.abs(offsetX) > snapThreshold');
function visit46_302_2(result) {
  _$jscoverage['/drag.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['302'][1].init(370, 58, 'self.allowScroll.left && Math.abs(offsetX) > snapThreshold');
function visit45_302_1(result) {
  _$jscoverage['/drag.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['296'][1].init(113, 35, '!startMousePos || !self.isScrolling');
function visit44_296_1(result) {
  _$jscoverage['/drag.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['277'][3].init(572, 26, 'dragInitDirection == \'top\'');
function visit43_277_3(result) {
  _$jscoverage['/drag.js'].branchData['277'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['277'][2].init(572, 66, 'dragInitDirection == \'top\' && !self.allowScroll[dragInitDirection]');
function visit42_277_2(result) {
  _$jscoverage['/drag.js'].branchData['277'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['277'][1].init(563, 75, 'lockY && dragInitDirection == \'top\' && !self.allowScroll[dragInitDirection]');
function visit41_277_1(result) {
  _$jscoverage['/drag.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['272'][3].init(394, 27, 'dragInitDirection == \'left\'');
function visit40_272_3(result) {
  _$jscoverage['/drag.js'].branchData['272'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['272'][2].init(394, 67, 'dragInitDirection == \'left\' && !self.allowScroll[dragInitDirection]');
function visit39_272_2(result) {
  _$jscoverage['/drag.js'].branchData['272'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['272'][1].init(385, 76, 'lockX && dragInitDirection == \'left\' && !self.allowScroll[dragInitDirection]');
function visit38_272_1(result) {
  _$jscoverage['/drag.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['265'][1].init(-1, 165, 'Math.abs(pos.pageX - startMousePos.pageX) > Math.abs(pos.pageY - startMousePos.pageY)');
function visit37_265_1(result) {
  _$jscoverage['/drag.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['264'][1].init(56, 45, '!(dragInitDirection = self.dragInitDirection)');
function visit36_264_1(result) {
  _$jscoverage['/drag.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['261'][1].init(455, 14, 'lockX || lockY');
function visit35_261_1(result) {
  _$jscoverage['/drag.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['248'][1].init(91, 35, '!startMousePos || !self.isScrolling');
function visit34_248_1(result) {
  _$jscoverage['/drag.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['229'][1].init(345, 11, 'isScrolling');
function visit33_229_1(result) {
  _$jscoverage['/drag.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['220'][1].init(88, 20, 'self.get(\'disabled\')');
function visit32_220_1(result) {
  _$jscoverage['/drag.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['209'][1].init(351, 11, 'value === 0');
function visit31_209_1(result) {
  _$jscoverage['/drag.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['198'][1].init(1149, 18, 'value <= minScroll');
function visit30_198_1(result) {
  _$jscoverage['/drag.js'].branchData['198'][1].ranCondition(result);
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
}_$jscoverage['/drag.js'].branchData['174'][1].init(132, 7, 'inertia');
function visit25_174_1(result) {
  _$jscoverage['/drag.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['127'][3].init(1317, 13, 'distance == 0');
function visit24_127_3(result) {
  _$jscoverage['/drag.js'].branchData['127'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['127'][2].init(1300, 13, 'duration == 0');
function visit23_127_2(result) {
  _$jscoverage['/drag.js'].branchData['127'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['127'][1].init(1300, 30, 'duration == 0 || distance == 0');
function visit22_127_1(result) {
  _$jscoverage['/drag.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['117'][1].init(1037, 16, 'self.pagesOffset');
function visit21_117_1(result) {
  _$jscoverage['/drag.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['105'][1].init(657, 19, 'bound !== undefined');
function visit20_105_1(result) {
  _$jscoverage['/drag.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['102'][1].init(556, 30, 'scroll > maxScroll[scrollType]');
function visit19_102_1(result) {
  _$jscoverage['/drag.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['100'][1].init(457, 30, 'scroll < minScroll[scrollType]');
function visit18_100_1(result) {
  _$jscoverage['/drag.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['87'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit17_87_1(result) {
  _$jscoverage['/drag.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['80'][1].init(78, 49, '!self.allowScroll[scrollType] && self.get(lockXY)');
function visit16_80_1(result) {
  _$jscoverage['/drag.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['79'][1].init(23, 20, 'scrollType == \'left\'');
function visit15_79_1(result) {
  _$jscoverage['/drag.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['66'][2].init(118, 32, 'timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit14_66_2(result) {
  _$jscoverage['/drag.js'].branchData['66'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['66'][1].init(55, 39, 'lastDirection[scrollType] !== direction');
function visit13_66_1(result) {
  _$jscoverage['/drag.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['65'][4].init(1676, 39, 'lastDirection[scrollType] !== undefined');
function visit12_65_4(result) {
  _$jscoverage['/drag.js'].branchData['65'][4].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['65'][3].init(1676, 95, 'lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit11_65_3(result) {
  _$jscoverage['/drag.js'].branchData['65'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['65'][2].init(1656, 115, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit10_65_2(result) {
  _$jscoverage['/drag.js'].branchData['65'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['65'][1].init(1656, 151, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction || timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit9_65_1(result) {
  _$jscoverage['/drag.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['56'][1].init(1360, 30, 'scroll > maxScroll[scrollType]');
function visit8_56_1(result) {
  _$jscoverage['/drag.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['52'][1].init(1156, 30, 'scroll < minScroll[scrollType]');
function visit7_52_1(result) {
  _$jscoverage['/drag.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['48'][1].init(1011, 19, '!self.get(\'bounce\')');
function visit6_48_1(result) {
  _$jscoverage['/drag.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['45'][1].init(118, 61, '(pos[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0');
function visit5_45_1(result) {
  _$jscoverage['/drag.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['44'][1].init(32, 57, 'pos[pageOffsetProperty] == lastPageXY[pageOffsetProperty]');
function visit4_44_1(result) {
  _$jscoverage['/drag.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['43'][1].init(771, 30, 'lastPageXY[pageOffsetProperty]');
function visit3_43_1(result) {
  _$jscoverage['/drag.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['30'][1].init(224, 20, 'scrollType == \'left\'');
function visit2_30_1(result) {
  _$jscoverage['/drag.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['23'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit1_23_1(result) {
  _$jscoverage['/drag.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].lineData[5]++;
KISSY.add('scroll-view/drag', function(S, ScrollViewBase, Node) {
  _$jscoverage['/drag.js'].functionData[0]++;
  _$jscoverage['/drag.js'].lineData[6]++;
  var OUT_OF_BOUND_FACTOR = 0.5;
  _$jscoverage['/drag.js'].lineData[8]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/drag.js'].lineData[10]++;
  var SWIPE_SAMPLE_INTERVAL = 300;
  _$jscoverage['/drag.js'].lineData[12]++;
  var MAX_SWIPE_VELOCITY = 6;
  _$jscoverage['/drag.js'].lineData[14]++;
  function onDragStart(self, e, scrollType) {
    _$jscoverage['/drag.js'].functionData[1]++;
    _$jscoverage['/drag.js'].lineData[15]++;
    var now = e.timeStamp, scroll = self.get('scroll' + S.ucfirst(scrollType));
    _$jscoverage['/drag.js'].lineData[17]++;
    self.startScroll[scrollType] = scroll;
    _$jscoverage['/drag.js'].lineData[18]++;
    self.swipe[scrollType].startTime = now;
    _$jscoverage['/drag.js'].lineData[19]++;
    self.swipe[scrollType].scroll = scroll;
  }
  _$jscoverage['/drag.js'].lineData[22]++;
  function onDragScroll(self, e, scrollType, startMousePos) {
    _$jscoverage['/drag.js'].functionData[2]++;
    _$jscoverage['/drag.js'].lineData[23]++;
    if (visit1_23_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/drag.js'].lineData[24]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[26]++;
    var pos = {
  pageX: e.touches[0].pageX, 
  pageY: e.touches[0].pageY};
    _$jscoverage['/drag.js'].lineData[30]++;
    var pageOffsetProperty = visit2_30_1(scrollType == 'left') ? 'pageX' : 'pageY', lastPageXY = self.lastPageXY;
    _$jscoverage['/drag.js'].lineData[32]++;
    var diff = pos[pageOffsetProperty] - startMousePos[pageOffsetProperty], eqWithLastPoint, scroll = self.startScroll[scrollType] - diff, bound, now = e.timeStamp, minScroll = self.minScroll, maxScroll = self.maxScroll, lastDirection = self.lastDirection, swipe = self.swipe, direction;
    _$jscoverage['/drag.js'].lineData[43]++;
    if (visit3_43_1(lastPageXY[pageOffsetProperty])) {
      _$jscoverage['/drag.js'].lineData[44]++;
      eqWithLastPoint = visit4_44_1(pos[pageOffsetProperty] == lastPageXY[pageOffsetProperty]);
      _$jscoverage['/drag.js'].lineData[45]++;
      direction = visit5_45_1((pos[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0);
    }
    _$jscoverage['/drag.js'].lineData[48]++;
    if (visit6_48_1(!self.get('bounce'))) {
      _$jscoverage['/drag.js'].lineData[49]++;
      scroll = Math.min(Math.max(scroll, minScroll[scrollType]), maxScroll[scrollType]);
    }
    _$jscoverage['/drag.js'].lineData[52]++;
    if (visit7_52_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/drag.js'].lineData[53]++;
      bound = minScroll[scrollType] - scroll;
      _$jscoverage['/drag.js'].lineData[54]++;
      bound *= OUT_OF_BOUND_FACTOR;
      _$jscoverage['/drag.js'].lineData[55]++;
      scroll = minScroll[scrollType] - bound;
    } else {
      _$jscoverage['/drag.js'].lineData[56]++;
      if (visit8_56_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/drag.js'].lineData[57]++;
        bound = scroll - maxScroll[scrollType];
        _$jscoverage['/drag.js'].lineData[58]++;
        bound *= OUT_OF_BOUND_FACTOR;
        _$jscoverage['/drag.js'].lineData[59]++;
        scroll = maxScroll[scrollType] + bound;
      }
    }
    _$jscoverage['/drag.js'].lineData[62]++;
    var timeDiff = (now - swipe[scrollType].startTime);
    _$jscoverage['/drag.js'].lineData[65]++;
    if (visit9_65_1(visit10_65_2(!eqWithLastPoint && visit11_65_3(visit12_65_4(lastDirection[scrollType] !== undefined) && visit13_66_1(lastDirection[scrollType] !== direction))) || visit14_66_2(timeDiff > SWIPE_SAMPLE_INTERVAL))) {
      _$jscoverage['/drag.js'].lineData[67]++;
      swipe[scrollType].startTime = now;
      _$jscoverage['/drag.js'].lineData[68]++;
      swipe[scrollType].scroll = scroll;
    }
    _$jscoverage['/drag.js'].lineData[72]++;
    self.set('scroll' + S.ucfirst(scrollType), scroll);
    _$jscoverage['/drag.js'].lineData[73]++;
    lastDirection[scrollType] = direction;
    _$jscoverage['/drag.js'].lineData[75]++;
    lastPageXY[pageOffsetProperty] = e[pageOffsetProperty];
  }
  _$jscoverage['/drag.js'].lineData[78]++;
  function forbidDrag(self, scrollType) {
    _$jscoverage['/drag.js'].functionData[3]++;
    _$jscoverage['/drag.js'].lineData[79]++;
    var lockXY = visit15_79_1(scrollType == 'left') ? 'lockX' : 'lockY';
    _$jscoverage['/drag.js'].lineData[80]++;
    if (visit16_80_1(!self.allowScroll[scrollType] && self.get(lockXY))) {
      _$jscoverage['/drag.js'].lineData[81]++;
      return 1;
    }
    _$jscoverage['/drag.js'].lineData[83]++;
    return 0;
  }
  _$jscoverage['/drag.js'].lineData[86]++;
  function onDragEndAxis(self, e, scrollType, endCallback) {
    _$jscoverage['/drag.js'].functionData[4]++;
    _$jscoverage['/drag.js'].lineData[87]++;
    if (visit17_87_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/drag.js'].lineData[88]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[89]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[91]++;
    var scrollAxis = 'scroll' + S.ucfirst(scrollType), $contentEl = self.$contentEl, scroll = self.get(scrollAxis), anim = {}, minScroll = self.minScroll, maxScroll = self.maxScroll, now = e.timeStamp, swipe = self.swipe, bound;
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
    anim[scrollType] = {
  fx: {
  frame: makeMomentumFx(self, velocity, scroll, scrollAxis, maxScroll[scrollType], minScroll[scrollType])}};
    _$jscoverage['/drag.js'].lineData[150]++;
    $contentEl.animate(anim, {
  duration: 9999, 
  queue: false, 
  complete: endCallback});
  }
  _$jscoverage['/drag.js'].lineData[157]++;
  var FRICTION = 0.5;
  _$jscoverage['/drag.js'].lineData[158]++;
  var ACCELERATION = 20;
  _$jscoverage['/drag.js'].lineData[159]++;
  var THETA = Math.log(1 - (FRICTION / 10));
  _$jscoverage['/drag.js'].lineData[160]++;
  var ALPHA = THETA / ACCELERATION;
  _$jscoverage['/drag.js'].lineData[161]++;
  var SPRING_TENSION = 0.3;
  _$jscoverage['/drag.js'].lineData[163]++;
  function makeMomentumFx(self, startVelocity, startScroll, scrollAxis, maxScroll, minScroll) {
    _$jscoverage['/drag.js'].functionData[5]++;
    _$jscoverage['/drag.js'].lineData[165]++;
    var velocity = startVelocity * ACCELERATION;
    _$jscoverage['/drag.js'].lineData[166]++;
    var inertia = 1;
    _$jscoverage['/drag.js'].lineData[167]++;
    var bounceStartTime = 0;
    _$jscoverage['/drag.js'].lineData[168]++;
    return function(anim) {
  _$jscoverage['/drag.js'].functionData[6]++;
  _$jscoverage['/drag.js'].lineData[169]++;
  var now = S.now(), fx = this, deltaTime, value;
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
        fx.finished = 1;
      }
      _$jscoverage['/drag.js'].lineData[187]++;
      fx.lastValue = value;
      _$jscoverage['/drag.js'].lineData[188]++;
      self.set(scrollAxis, value);
      _$jscoverage['/drag.js'].lineData[189]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[191]++;
    inertia = 0;
    _$jscoverage['/drag.js'].lineData[192]++;
    velocity = velocity * frictionFactor;
    _$jscoverage['/drag.js'].lineData[198]++;
    startScroll = visit30_198_1(value <= minScroll) ? minScroll : maxScroll;
    _$jscoverage['/drag.js'].lineData[200]++;
    bounceStartTime = now;
  } else {
    _$jscoverage['/drag.js'].lineData[202]++;
    deltaTime = now - bounceStartTime;
    _$jscoverage['/drag.js'].lineData[204]++;
    var theta = (deltaTime / ACCELERATION), powTime = theta * Math.exp(-SPRING_TENSION * theta);
    _$jscoverage['/drag.js'].lineData[208]++;
    value = parseInt(velocity * powTime);
    _$jscoverage['/drag.js'].lineData[209]++;
    if (visit31_209_1(value === 0)) {
      _$jscoverage['/drag.js'].lineData[210]++;
      fx.finished = 1;
    }
    _$jscoverage['/drag.js'].lineData[212]++;
    self.set(scrollAxis, startScroll + value);
  }
};
  }
  _$jscoverage['/drag.js'].lineData[217]++;
  function onDragStartHandler(e) {
    _$jscoverage['/drag.js'].functionData[7]++;
    _$jscoverage['/drag.js'].lineData[219]++;
    var self = this;
    _$jscoverage['/drag.js'].lineData[220]++;
    if (visit32_220_1(self.get('disabled'))) {
      _$jscoverage['/drag.js'].lineData[221]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[223]++;
    var pos = {
  pageX: e.touches[0].pageX, 
  pageY: e.touches[0].pageY};
    _$jscoverage['/drag.js'].lineData[227]++;
    var isScrolling = self.isScrolling;
    _$jscoverage['/drag.js'].lineData[228]++;
    self.stopAnimation();
    _$jscoverage['/drag.js'].lineData[229]++;
    if (visit33_229_1(isScrolling)) {
      _$jscoverage['/drag.js'].lineData[230]++;
      var pageIndex = self.get('pageIndex');
      _$jscoverage['/drag.js'].lineData[231]++;
      self.fire('scrollEnd', S.mix({
  fromPageIndex: pageIndex, 
  pageIndex: pageIndex}, pos));
    }
    _$jscoverage['/drag.js'].lineData[236]++;
    initStates(self);
    _$jscoverage['/drag.js'].lineData[237]++;
    self.startMousePos = pos;
    _$jscoverage['/drag.js'].lineData[238]++;
    onDragStart(self, e, 'left');
    _$jscoverage['/drag.js'].lineData[239]++;
    onDragStart(self, e, 'top');
    _$jscoverage['/drag.js'].lineData[240]++;
    self.fire('scrollStart', pos);
    _$jscoverage['/drag.js'].lineData[241]++;
    self.isScrolling = 1;
  }
  _$jscoverage['/drag.js'].lineData[244]++;
  function onDragHandler(e) {
    _$jscoverage['/drag.js'].functionData[8]++;
    _$jscoverage['/drag.js'].lineData[245]++;
    var self = this, startMousePos = self.startMousePos;
    _$jscoverage['/drag.js'].lineData[248]++;
    if (visit34_248_1(!startMousePos || !self.isScrolling)) {
      _$jscoverage['/drag.js'].lineData[249]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[252]++;
    var lockX = self.get('lockX'), lockY = self.get('lockY');
    _$jscoverage['/drag.js'].lineData[255]++;
    var pos = {
  pageX: e.touches[0].pageX, 
  pageY: e.touches[0].pageY};
    _$jscoverage['/drag.js'].lineData[261]++;
    if (visit35_261_1(lockX || lockY)) {
      _$jscoverage['/drag.js'].lineData[262]++;
      var dragInitDirection;
      _$jscoverage['/drag.js'].lineData[264]++;
      if (visit36_264_1(!(dragInitDirection = self.dragInitDirection))) {
        _$jscoverage['/drag.js'].lineData[265]++;
        self.dragInitDirection = dragInitDirection = visit37_265_1(Math.abs(pos.pageX - startMousePos.pageX) > Math.abs(pos.pageY - startMousePos.pageY)) ? 'left' : 'top';
      }
      _$jscoverage['/drag.js'].lineData[272]++;
      if (visit38_272_1(lockX && visit39_272_2(visit40_272_3(dragInitDirection == 'left') && !self.allowScroll[dragInitDirection]))) {
        _$jscoverage['/drag.js'].lineData[273]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[274]++;
        return;
      }
      _$jscoverage['/drag.js'].lineData[277]++;
      if (visit41_277_1(lockY && visit42_277_2(visit43_277_3(dragInitDirection == 'top') && !self.allowScroll[dragInitDirection]))) {
        _$jscoverage['/drag.js'].lineData[278]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[279]++;
        return;
      }
    }
    _$jscoverage['/drag.js'].lineData[283]++;
    e.preventDefault();
    _$jscoverage['/drag.js'].lineData[285]++;
    onDragScroll(self, e, 'left', startMousePos);
    _$jscoverage['/drag.js'].lineData[286]++;
    onDragScroll(self, e, 'top', startMousePos);
    _$jscoverage['/drag.js'].lineData[289]++;
    self.fire('scrollMove', pos);
  }
  _$jscoverage['/drag.js'].lineData[292]++;
  function onDragEndHandler(e) {
    _$jscoverage['/drag.js'].functionData[9]++;
    _$jscoverage['/drag.js'].lineData[293]++;
    var self = this;
    _$jscoverage['/drag.js'].lineData[294]++;
    var count = 0;
    _$jscoverage['/drag.js'].lineData[295]++;
    var startMousePos = self.startMousePos;
    _$jscoverage['/drag.js'].lineData[296]++;
    if (visit44_296_1(!startMousePos || !self.isScrolling)) {
      _$jscoverage['/drag.js'].lineData[297]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[299]++;
    var offsetX = startMousePos.pageX - e.pageX;
    _$jscoverage['/drag.js'].lineData[300]++;
    var offsetY = startMousePos.pageY - e.pageY;
    _$jscoverage['/drag.js'].lineData[301]++;
    var snapThreshold = self.get('snapThreshold');
    _$jscoverage['/drag.js'].lineData[302]++;
    var allowX = visit45_302_1(self.allowScroll.left && visit46_302_2(Math.abs(offsetX) > snapThreshold));
    _$jscoverage['/drag.js'].lineData[303]++;
    var allowY = visit47_303_1(self.allowScroll.top && visit48_303_2(Math.abs(offsetY) > snapThreshold));
    _$jscoverage['/drag.js'].lineData[305]++;
    self.fire('dragend', {
  pageX: e.pageX, 
  pageY: e.pageY});
    _$jscoverage['/drag.js'].lineData[310]++;
    function endCallback() {
      _$jscoverage['/drag.js'].functionData[10]++;
      _$jscoverage['/drag.js'].lineData[311]++;
      count++;
      _$jscoverage['/drag.js'].lineData[312]++;
      if (visit49_312_1(count == 2)) {
        _$jscoverage['/drag.js'].lineData[313]++;
        function scrollEnd() {
          _$jscoverage['/drag.js'].functionData[11]++;
          _$jscoverage['/drag.js'].lineData[314]++;
          self.isScrolling = 0;
          _$jscoverage['/drag.js'].lineData[315]++;
          self.fire('scrollEnd', {
  pageX: e.pageX, 
  pageY: e.pageY, 
  fromPageIndex: pageIndex, 
  pageIndex: self.get('pageIndex')});
        }        _$jscoverage['/drag.js'].lineData[323]++;
        if (visit50_323_1(!self.pagesOffset)) {
          _$jscoverage['/drag.js'].lineData[324]++;
          scrollEnd();
          _$jscoverage['/drag.js'].lineData[325]++;
          return;
        }
        _$jscoverage['/drag.js'].lineData[328]++;
        var snapThreshold = self.get('snapThreshold');
        _$jscoverage['/drag.js'].lineData[329]++;
        var snapDuration = self.get('snapDuration');
        _$jscoverage['/drag.js'].lineData[330]++;
        var snapEasing = self.get('snapEasing');
        _$jscoverage['/drag.js'].lineData[331]++;
        var pageIndex = self.get('pageIndex');
        _$jscoverage['/drag.js'].lineData[332]++;
        var scrollLeft = self.get('scrollLeft');
        _$jscoverage['/drag.js'].lineData[333]++;
        var scrollTop = self.get('scrollTop');
        _$jscoverage['/drag.js'].lineData[335]++;
        var animCfg = {
  duration: snapDuration, 
  easing: snapEasing, 
  complete: scrollEnd};
        _$jscoverage['/drag.js'].lineData[341]++;
        var pagesOffset = self.pagesOffset.concat([]);
        _$jscoverage['/drag.js'].lineData[343]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[345]++;
        if (visit51_345_1(allowX || allowY)) {
          _$jscoverage['/drag.js'].lineData[346]++;
          if (visit52_346_1(allowX && allowY)) {
            _$jscoverage['/drag.js'].lineData[347]++;
            var prepareX = [], newPageIndex = undefined;
            _$jscoverage['/drag.js'].lineData[349]++;
            var nowXY = {
  left: scrollLeft, 
  top: scrollTop};
            _$jscoverage['/drag.js'].lineData[353]++;
            S.each(pagesOffset, function(offset) {
  _$jscoverage['/drag.js'].functionData[12]++;
  _$jscoverage['/drag.js'].lineData[354]++;
  if (visit53_354_1(!offset)) {
    _$jscoverage['/drag.js'].lineData[355]++;
    return;
  }
  _$jscoverage['/drag.js'].lineData[357]++;
  if (visit54_357_1(visit55_357_2(offsetX > 0) && visit56_357_3(offset.left > nowXY.left))) {
    _$jscoverage['/drag.js'].lineData[358]++;
    prepareX.push(offset);
  } else {
    _$jscoverage['/drag.js'].lineData[359]++;
    if (visit57_359_1(visit58_359_2(offsetX < 0) && visit59_359_3(offset.left < nowXY.left))) {
      _$jscoverage['/drag.js'].lineData[360]++;
      prepareX.push(offset);
    }
  }
});
            _$jscoverage['/drag.js'].lineData[363]++;
            var min;
            _$jscoverage['/drag.js'].lineData[364]++;
            if (visit60_364_1(offsetY > 0)) {
              _$jscoverage['/drag.js'].lineData[365]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/drag.js'].lineData[366]++;
              S.each(prepareX, function(x) {
  _$jscoverage['/drag.js'].functionData[13]++;
  _$jscoverage['/drag.js'].lineData[367]++;
  if (visit61_367_1(x.top > nowXY.top)) {
    _$jscoverage['/drag.js'].lineData[368]++;
    if (visit62_368_1(min < x.top - nowXY.top)) {
      _$jscoverage['/drag.js'].lineData[369]++;
      min = x.top - nowXY.top;
      _$jscoverage['/drag.js'].lineData[370]++;
      newPageIndex = prepareX.index;
    }
  }
});
            } else {
              _$jscoverage['/drag.js'].lineData[375]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/drag.js'].lineData[376]++;
              S.each(prepareX, function(x) {
  _$jscoverage['/drag.js'].functionData[14]++;
  _$jscoverage['/drag.js'].lineData[377]++;
  if (visit63_377_1(x.top < nowXY.top)) {
    _$jscoverage['/drag.js'].lineData[378]++;
    if (visit64_378_1(min < nowXY.top - x.top)) {
      _$jscoverage['/drag.js'].lineData[379]++;
      min = nowXY.top - x.top;
      _$jscoverage['/drag.js'].lineData[380]++;
      newPageIndex = prepareX.index;
    }
  }
});
            }
            _$jscoverage['/drag.js'].lineData[385]++;
            if (visit65_385_1(newPageIndex != undefined)) {
              _$jscoverage['/drag.js'].lineData[386]++;
              if (visit66_386_1(newPageIndex != pageIndex)) {
                _$jscoverage['/drag.js'].lineData[387]++;
                self.scrollToPage(newPageIndex, animCfg);
              } else {
                _$jscoverage['/drag.js'].lineData[389]++;
                self.scrollToPage(newPageIndex);
                _$jscoverage['/drag.js'].lineData[390]++;
                scrollEnd();
              }
            } else {
              _$jscoverage['/drag.js'].lineData[393]++;
              scrollEnd();
            }
          } else {
            _$jscoverage['/drag.js'].lineData[396]++;
            if (visit67_396_1(allowX || allowY)) {
              _$jscoverage['/drag.js'].lineData[397]++;
              var toPageIndex = self._getPageIndexFromXY(allowX ? scrollLeft : scrollTop, allowX, allowX ? offsetX : offsetY);
              _$jscoverage['/drag.js'].lineData[400]++;
              self.scrollToPage(toPageIndex, animCfg);
            } else {
              _$jscoverage['/drag.js'].lineData[402]++;
              self.scrollToPage(self.get('pageIndex'));
              _$jscoverage['/drag.js'].lineData[403]++;
              scrollEnd();
            }
          }
        }
      }
    }
    _$jscoverage['/drag.js'].lineData[410]++;
    onDragEndAxis(self, e, 'left', endCallback);
    _$jscoverage['/drag.js'].lineData[411]++;
    onDragEndAxis(self, e, 'top', endCallback);
  }
  _$jscoverage['/drag.js'].lineData[414]++;
  function initStates(self) {
    _$jscoverage['/drag.js'].functionData[15]++;
    _$jscoverage['/drag.js'].lineData[415]++;
    self.lastPageXY = {};
    _$jscoverage['/drag.js'].lineData[417]++;
    self.lastDirection = {};
    _$jscoverage['/drag.js'].lineData[419]++;
    self.swipe = {
  left: {}, 
  top: {}};
    _$jscoverage['/drag.js'].lineData[424]++;
    self.startMousePos = null;
    _$jscoverage['/drag.js'].lineData[426]++;
    self.startScroll = {};
    _$jscoverage['/drag.js'].lineData[428]++;
    self.dragInitDirection = null;
  }
  _$jscoverage['/drag.js'].lineData[431]++;
  function preventDefault(e) {
    _$jscoverage['/drag.js'].functionData[16]++;
    _$jscoverage['/drag.js'].lineData[432]++;
    e.preventDefault();
  }
  _$jscoverage['/drag.js'].lineData[435]++;
  return ScrollViewBase.extend({
  bindUI: function() {
  _$jscoverage['/drag.js'].functionData[17]++;
  _$jscoverage['/drag.js'].lineData[437]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[441]++;
  self.$contentEl.on('dragstart', preventDefault).on(Gesture.start, onDragStartHandler, self).on(Gesture.move, onDragHandler, self).on(Gesture.end, onDragEndHandler, self);
}, 
  syncUI: function() {
  _$jscoverage['/drag.js'].functionData[18]++;
  _$jscoverage['/drag.js'].lineData[445]++;
  initStates(this);
}, 
  destructor: function() {
  _$jscoverage['/drag.js'].functionData[19]++;
  _$jscoverage['/drag.js'].lineData[449]++;
  this.stopAnimation();
}, 
  stopAnimation: function() {
  _$jscoverage['/drag.js'].functionData[20]++;
  _$jscoverage['/drag.js'].lineData[453]++;
  this.callSuper();
  _$jscoverage['/drag.js'].lineData[454]++;
  self.isScrolling = 0;
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
  requires: ['./base', 'node']});
