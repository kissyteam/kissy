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
if (! _$jscoverage['/utils.js']) {
  _$jscoverage['/utils.js'] = {};
  _$jscoverage['/utils.js'].lineData = [];
  _$jscoverage['/utils.js'].lineData[6] = 0;
  _$jscoverage['/utils.js'].lineData[7] = 0;
  _$jscoverage['/utils.js'].lineData[29] = 0;
  _$jscoverage['/utils.js'].lineData[30] = 0;
  _$jscoverage['/utils.js'].lineData[31] = 0;
  _$jscoverage['/utils.js'].lineData[33] = 0;
  _$jscoverage['/utils.js'].lineData[36] = 0;
  _$jscoverage['/utils.js'].lineData[37] = 0;
  _$jscoverage['/utils.js'].lineData[39] = 0;
  _$jscoverage['/utils.js'].lineData[43] = 0;
  _$jscoverage['/utils.js'].lineData[45] = 0;
  _$jscoverage['/utils.js'].lineData[46] = 0;
  _$jscoverage['/utils.js'].lineData[48] = 0;
  _$jscoverage['/utils.js'].lineData[49] = 0;
  _$jscoverage['/utils.js'].lineData[51] = 0;
  _$jscoverage['/utils.js'].lineData[54] = 0;
  _$jscoverage['/utils.js'].lineData[55] = 0;
  _$jscoverage['/utils.js'].lineData[56] = 0;
  _$jscoverage['/utils.js'].lineData[57] = 0;
  _$jscoverage['/utils.js'].lineData[58] = 0;
  _$jscoverage['/utils.js'].lineData[59] = 0;
  _$jscoverage['/utils.js'].lineData[62] = 0;
  _$jscoverage['/utils.js'].lineData[64] = 0;
  _$jscoverage['/utils.js'].lineData[69] = 0;
  _$jscoverage['/utils.js'].lineData[72] = 0;
  _$jscoverage['/utils.js'].lineData[73] = 0;
  _$jscoverage['/utils.js'].lineData[75] = 0;
  _$jscoverage['/utils.js'].lineData[76] = 0;
  _$jscoverage['/utils.js'].lineData[80] = 0;
  _$jscoverage['/utils.js'].lineData[81] = 0;
  _$jscoverage['/utils.js'].lineData[82] = 0;
  _$jscoverage['/utils.js'].lineData[84] = 0;
  _$jscoverage['/utils.js'].lineData[86] = 0;
  _$jscoverage['/utils.js'].lineData[89] = 0;
  _$jscoverage['/utils.js'].lineData[90] = 0;
  _$jscoverage['/utils.js'].lineData[91] = 0;
  _$jscoverage['/utils.js'].lineData[95] = 0;
  _$jscoverage['/utils.js'].lineData[99] = 0;
  _$jscoverage['/utils.js'].lineData[100] = 0;
  _$jscoverage['/utils.js'].lineData[103] = 0;
  _$jscoverage['/utils.js'].lineData[105] = 0;
  _$jscoverage['/utils.js'].lineData[106] = 0;
  _$jscoverage['/utils.js'].lineData[108] = 0;
  _$jscoverage['/utils.js'].lineData[109] = 0;
  _$jscoverage['/utils.js'].lineData[110] = 0;
  _$jscoverage['/utils.js'].lineData[111] = 0;
  _$jscoverage['/utils.js'].lineData[112] = 0;
  _$jscoverage['/utils.js'].lineData[116] = 0;
  _$jscoverage['/utils.js'].lineData[117] = 0;
  _$jscoverage['/utils.js'].lineData[118] = 0;
  _$jscoverage['/utils.js'].lineData[119] = 0;
  _$jscoverage['/utils.js'].lineData[120] = 0;
  _$jscoverage['/utils.js'].lineData[126] = 0;
  _$jscoverage['/utils.js'].lineData[127] = 0;
  _$jscoverage['/utils.js'].lineData[128] = 0;
  _$jscoverage['/utils.js'].lineData[129] = 0;
  _$jscoverage['/utils.js'].lineData[131] = 0;
  _$jscoverage['/utils.js'].lineData[134] = 0;
  _$jscoverage['/utils.js'].lineData[135] = 0;
  _$jscoverage['/utils.js'].lineData[138] = 0;
  _$jscoverage['/utils.js'].lineData[139] = 0;
  _$jscoverage['/utils.js'].lineData[140] = 0;
  _$jscoverage['/utils.js'].lineData[142] = 0;
  _$jscoverage['/utils.js'].lineData[146] = 0;
  _$jscoverage['/utils.js'].lineData[153] = 0;
  _$jscoverage['/utils.js'].lineData[157] = 0;
  _$jscoverage['/utils.js'].lineData[158] = 0;
  _$jscoverage['/utils.js'].lineData[159] = 0;
  _$jscoverage['/utils.js'].lineData[162] = 0;
  _$jscoverage['/utils.js'].lineData[166] = 0;
  _$jscoverage['/utils.js'].lineData[167] = 0;
  _$jscoverage['/utils.js'].lineData[171] = 0;
  _$jscoverage['/utils.js'].lineData[181] = 0;
  _$jscoverage['/utils.js'].lineData[182] = 0;
  _$jscoverage['/utils.js'].lineData[183] = 0;
  _$jscoverage['/utils.js'].lineData[185] = 0;
  _$jscoverage['/utils.js'].lineData[186] = 0;
  _$jscoverage['/utils.js'].lineData[187] = 0;
  _$jscoverage['/utils.js'].lineData[188] = 0;
  _$jscoverage['/utils.js'].lineData[189] = 0;
  _$jscoverage['/utils.js'].lineData[190] = 0;
  _$jscoverage['/utils.js'].lineData[191] = 0;
  _$jscoverage['/utils.js'].lineData[192] = 0;
  _$jscoverage['/utils.js'].lineData[194] = 0;
  _$jscoverage['/utils.js'].lineData[197] = 0;
  _$jscoverage['/utils.js'].lineData[201] = 0;
  _$jscoverage['/utils.js'].lineData[202] = 0;
  _$jscoverage['/utils.js'].lineData[203] = 0;
  _$jscoverage['/utils.js'].lineData[213] = 0;
  _$jscoverage['/utils.js'].lineData[223] = 0;
  _$jscoverage['/utils.js'].lineData[224] = 0;
  _$jscoverage['/utils.js'].lineData[227] = 0;
  _$jscoverage['/utils.js'].lineData[229] = 0;
  _$jscoverage['/utils.js'].lineData[230] = 0;
  _$jscoverage['/utils.js'].lineData[232] = 0;
  _$jscoverage['/utils.js'].lineData[240] = 0;
  _$jscoverage['/utils.js'].lineData[241] = 0;
  _$jscoverage['/utils.js'].lineData[242] = 0;
  _$jscoverage['/utils.js'].lineData[244] = 0;
  _$jscoverage['/utils.js'].lineData[254] = 0;
  _$jscoverage['/utils.js'].lineData[256] = 0;
  _$jscoverage['/utils.js'].lineData[259] = 0;
  _$jscoverage['/utils.js'].lineData[260] = 0;
  _$jscoverage['/utils.js'].lineData[264] = 0;
  _$jscoverage['/utils.js'].lineData[268] = 0;
  _$jscoverage['/utils.js'].lineData[277] = 0;
  _$jscoverage['/utils.js'].lineData[283] = 0;
  _$jscoverage['/utils.js'].lineData[284] = 0;
  _$jscoverage['/utils.js'].lineData[285] = 0;
  _$jscoverage['/utils.js'].lineData[286] = 0;
  _$jscoverage['/utils.js'].lineData[287] = 0;
  _$jscoverage['/utils.js'].lineData[288] = 0;
  _$jscoverage['/utils.js'].lineData[289] = 0;
  _$jscoverage['/utils.js'].lineData[291] = 0;
  _$jscoverage['/utils.js'].lineData[293] = 0;
  _$jscoverage['/utils.js'].lineData[294] = 0;
  _$jscoverage['/utils.js'].lineData[296] = 0;
  _$jscoverage['/utils.js'].lineData[299] = 0;
  _$jscoverage['/utils.js'].lineData[303] = 0;
  _$jscoverage['/utils.js'].lineData[311] = 0;
  _$jscoverage['/utils.js'].lineData[313] = 0;
  _$jscoverage['/utils.js'].lineData[314] = 0;
  _$jscoverage['/utils.js'].lineData[320] = 0;
  _$jscoverage['/utils.js'].lineData[322] = 0;
  _$jscoverage['/utils.js'].lineData[323] = 0;
  _$jscoverage['/utils.js'].lineData[327] = 0;
  _$jscoverage['/utils.js'].lineData[328] = 0;
  _$jscoverage['/utils.js'].lineData[329] = 0;
  _$jscoverage['/utils.js'].lineData[331] = 0;
  _$jscoverage['/utils.js'].lineData[332] = 0;
  _$jscoverage['/utils.js'].lineData[334] = 0;
  _$jscoverage['/utils.js'].lineData[338] = 0;
  _$jscoverage['/utils.js'].lineData[341] = 0;
  _$jscoverage['/utils.js'].lineData[342] = 0;
  _$jscoverage['/utils.js'].lineData[344] = 0;
  _$jscoverage['/utils.js'].lineData[345] = 0;
  _$jscoverage['/utils.js'].lineData[346] = 0;
  _$jscoverage['/utils.js'].lineData[348] = 0;
  _$jscoverage['/utils.js'].lineData[349] = 0;
  _$jscoverage['/utils.js'].lineData[350] = 0;
  _$jscoverage['/utils.js'].lineData[351] = 0;
  _$jscoverage['/utils.js'].lineData[352] = 0;
  _$jscoverage['/utils.js'].lineData[354] = 0;
  _$jscoverage['/utils.js'].lineData[355] = 0;
  _$jscoverage['/utils.js'].lineData[356] = 0;
  _$jscoverage['/utils.js'].lineData[358] = 0;
  _$jscoverage['/utils.js'].lineData[359] = 0;
  _$jscoverage['/utils.js'].lineData[360] = 0;
  _$jscoverage['/utils.js'].lineData[362] = 0;
  _$jscoverage['/utils.js'].lineData[363] = 0;
  _$jscoverage['/utils.js'].lineData[364] = 0;
  _$jscoverage['/utils.js'].lineData[366] = 0;
  _$jscoverage['/utils.js'].lineData[369] = 0;
  _$jscoverage['/utils.js'].lineData[370] = 0;
  _$jscoverage['/utils.js'].lineData[371] = 0;
  _$jscoverage['/utils.js'].lineData[374] = 0;
  _$jscoverage['/utils.js'].lineData[377] = 0;
  _$jscoverage['/utils.js'].lineData[378] = 0;
  _$jscoverage['/utils.js'].lineData[379] = 0;
  _$jscoverage['/utils.js'].lineData[380] = 0;
  _$jscoverage['/utils.js'].lineData[383] = 0;
  _$jscoverage['/utils.js'].lineData[384] = 0;
  _$jscoverage['/utils.js'].lineData[392] = 0;
  _$jscoverage['/utils.js'].lineData[395] = 0;
  _$jscoverage['/utils.js'].lineData[397] = 0;
  _$jscoverage['/utils.js'].lineData[398] = 0;
  _$jscoverage['/utils.js'].lineData[400] = 0;
  _$jscoverage['/utils.js'].lineData[401] = 0;
  _$jscoverage['/utils.js'].lineData[403] = 0;
  _$jscoverage['/utils.js'].lineData[405] = 0;
  _$jscoverage['/utils.js'].lineData[406] = 0;
  _$jscoverage['/utils.js'].lineData[415] = 0;
  _$jscoverage['/utils.js'].lineData[418] = 0;
  _$jscoverage['/utils.js'].lineData[421] = 0;
  _$jscoverage['/utils.js'].lineData[422] = 0;
  _$jscoverage['/utils.js'].lineData[423] = 0;
  _$jscoverage['/utils.js'].lineData[428] = 0;
  _$jscoverage['/utils.js'].lineData[432] = 0;
  _$jscoverage['/utils.js'].lineData[434] = 0;
  _$jscoverage['/utils.js'].lineData[438] = 0;
  _$jscoverage['/utils.js'].lineData[441] = 0;
  _$jscoverage['/utils.js'].lineData[450] = 0;
  _$jscoverage['/utils.js'].lineData[451] = 0;
  _$jscoverage['/utils.js'].lineData[453] = 0;
  _$jscoverage['/utils.js'].lineData[467] = 0;
  _$jscoverage['/utils.js'].lineData[476] = 0;
  _$jscoverage['/utils.js'].lineData[482] = 0;
  _$jscoverage['/utils.js'].lineData[483] = 0;
  _$jscoverage['/utils.js'].lineData[484] = 0;
  _$jscoverage['/utils.js'].lineData[485] = 0;
  _$jscoverage['/utils.js'].lineData[486] = 0;
  _$jscoverage['/utils.js'].lineData[487] = 0;
  _$jscoverage['/utils.js'].lineData[488] = 0;
  _$jscoverage['/utils.js'].lineData[490] = 0;
  _$jscoverage['/utils.js'].lineData[491] = 0;
  _$jscoverage['/utils.js'].lineData[492] = 0;
  _$jscoverage['/utils.js'].lineData[495] = 0;
  _$jscoverage['/utils.js'].lineData[499] = 0;
  _$jscoverage['/utils.js'].lineData[509] = 0;
  _$jscoverage['/utils.js'].lineData[510] = 0;
  _$jscoverage['/utils.js'].lineData[512] = 0;
  _$jscoverage['/utils.js'].lineData[515] = 0;
  _$jscoverage['/utils.js'].lineData[516] = 0;
  _$jscoverage['/utils.js'].lineData[521] = 0;
  _$jscoverage['/utils.js'].lineData[522] = 0;
  _$jscoverage['/utils.js'].lineData[524] = 0;
  _$jscoverage['/utils.js'].lineData[534] = 0;
  _$jscoverage['/utils.js'].lineData[536] = 0;
  _$jscoverage['/utils.js'].lineData[539] = 0;
  _$jscoverage['/utils.js'].lineData[540] = 0;
  _$jscoverage['/utils.js'].lineData[541] = 0;
  _$jscoverage['/utils.js'].lineData[545] = 0;
  _$jscoverage['/utils.js'].lineData[547] = 0;
  _$jscoverage['/utils.js'].lineData[551] = 0;
  _$jscoverage['/utils.js'].lineData[557] = 0;
  _$jscoverage['/utils.js'].lineData[566] = 0;
  _$jscoverage['/utils.js'].lineData[568] = 0;
  _$jscoverage['/utils.js'].lineData[569] = 0;
  _$jscoverage['/utils.js'].lineData[572] = 0;
  _$jscoverage['/utils.js'].lineData[576] = 0;
  _$jscoverage['/utils.js'].lineData[582] = 0;
  _$jscoverage['/utils.js'].lineData[583] = 0;
  _$jscoverage['/utils.js'].lineData[585] = 0;
  _$jscoverage['/utils.js'].lineData[589] = 0;
  _$jscoverage['/utils.js'].lineData[592] = 0;
  _$jscoverage['/utils.js'].lineData[593] = 0;
  _$jscoverage['/utils.js'].lineData[595] = 0;
  _$jscoverage['/utils.js'].lineData[596] = 0;
  _$jscoverage['/utils.js'].lineData[598] = 0;
}
if (! _$jscoverage['/utils.js'].functionData) {
  _$jscoverage['/utils.js'].functionData = [];
  _$jscoverage['/utils.js'].functionData[0] = 0;
  _$jscoverage['/utils.js'].functionData[1] = 0;
  _$jscoverage['/utils.js'].functionData[2] = 0;
  _$jscoverage['/utils.js'].functionData[3] = 0;
  _$jscoverage['/utils.js'].functionData[4] = 0;
  _$jscoverage['/utils.js'].functionData[5] = 0;
  _$jscoverage['/utils.js'].functionData[6] = 0;
  _$jscoverage['/utils.js'].functionData[7] = 0;
  _$jscoverage['/utils.js'].functionData[8] = 0;
  _$jscoverage['/utils.js'].functionData[9] = 0;
  _$jscoverage['/utils.js'].functionData[10] = 0;
  _$jscoverage['/utils.js'].functionData[11] = 0;
  _$jscoverage['/utils.js'].functionData[12] = 0;
  _$jscoverage['/utils.js'].functionData[13] = 0;
  _$jscoverage['/utils.js'].functionData[14] = 0;
  _$jscoverage['/utils.js'].functionData[15] = 0;
  _$jscoverage['/utils.js'].functionData[16] = 0;
  _$jscoverage['/utils.js'].functionData[17] = 0;
  _$jscoverage['/utils.js'].functionData[18] = 0;
  _$jscoverage['/utils.js'].functionData[19] = 0;
  _$jscoverage['/utils.js'].functionData[20] = 0;
  _$jscoverage['/utils.js'].functionData[21] = 0;
  _$jscoverage['/utils.js'].functionData[22] = 0;
  _$jscoverage['/utils.js'].functionData[23] = 0;
  _$jscoverage['/utils.js'].functionData[24] = 0;
  _$jscoverage['/utils.js'].functionData[25] = 0;
  _$jscoverage['/utils.js'].functionData[26] = 0;
  _$jscoverage['/utils.js'].functionData[27] = 0;
  _$jscoverage['/utils.js'].functionData[28] = 0;
  _$jscoverage['/utils.js'].functionData[29] = 0;
  _$jscoverage['/utils.js'].functionData[30] = 0;
  _$jscoverage['/utils.js'].functionData[31] = 0;
  _$jscoverage['/utils.js'].functionData[32] = 0;
  _$jscoverage['/utils.js'].functionData[33] = 0;
  _$jscoverage['/utils.js'].functionData[34] = 0;
  _$jscoverage['/utils.js'].functionData[35] = 0;
  _$jscoverage['/utils.js'].functionData[36] = 0;
  _$jscoverage['/utils.js'].functionData[37] = 0;
  _$jscoverage['/utils.js'].functionData[38] = 0;
  _$jscoverage['/utils.js'].functionData[39] = 0;
  _$jscoverage['/utils.js'].functionData[40] = 0;
  _$jscoverage['/utils.js'].functionData[41] = 0;
}
if (! _$jscoverage['/utils.js'].branchData) {
  _$jscoverage['/utils.js'].branchData = {};
  _$jscoverage['/utils.js'].branchData['30'] = [];
  _$jscoverage['/utils.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['36'] = [];
  _$jscoverage['/utils.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['45'] = [];
  _$jscoverage['/utils.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['48'] = [];
  _$jscoverage['/utils.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['56'] = [];
  _$jscoverage['/utils.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['62'] = [];
  _$jscoverage['/utils.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['76'] = [];
  _$jscoverage['/utils.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['82'] = [];
  _$jscoverage['/utils.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['83'] = [];
  _$jscoverage['/utils.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['96'] = [];
  _$jscoverage['/utils.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['99'] = [];
  _$jscoverage['/utils.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['108'] = [];
  _$jscoverage['/utils.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['110'] = [];
  _$jscoverage['/utils.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['111'] = [];
  _$jscoverage['/utils.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['118'] = [];
  _$jscoverage['/utils.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['119'] = [];
  _$jscoverage['/utils.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['134'] = [];
  _$jscoverage['/utils.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['135'] = [];
  _$jscoverage['/utils.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['153'] = [];
  _$jscoverage['/utils.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['158'] = [];
  _$jscoverage['/utils.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['167'] = [];
  _$jscoverage['/utils.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['167'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['167'][3] = new BranchData();
  _$jscoverage['/utils.js'].branchData['170'] = [];
  _$jscoverage['/utils.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['182'] = [];
  _$jscoverage['/utils.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['188'] = [];
  _$jscoverage['/utils.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['190'] = [];
  _$jscoverage['/utils.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['191'] = [];
  _$jscoverage['/utils.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['203'] = [];
  _$jscoverage['/utils.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['213'] = [];
  _$jscoverage['/utils.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['223'] = [];
  _$jscoverage['/utils.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['229'] = [];
  _$jscoverage['/utils.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['259'] = [];
  _$jscoverage['/utils.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['285'] = [];
  _$jscoverage['/utils.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['285'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['288'] = [];
  _$jscoverage['/utils.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['288'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['291'] = [];
  _$jscoverage['/utils.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['291'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['293'] = [];
  _$jscoverage['/utils.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['313'] = [];
  _$jscoverage['/utils.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['320'] = [];
  _$jscoverage['/utils.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['322'] = [];
  _$jscoverage['/utils.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['327'] = [];
  _$jscoverage['/utils.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['328'] = [];
  _$jscoverage['/utils.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['341'] = [];
  _$jscoverage['/utils.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['344'] = [];
  _$jscoverage['/utils.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['349'] = [];
  _$jscoverage['/utils.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['354'] = [];
  _$jscoverage['/utils.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['358'] = [];
  _$jscoverage['/utils.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['362'] = [];
  _$jscoverage['/utils.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['363'] = [];
  _$jscoverage['/utils.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['369'] = [];
  _$jscoverage['/utils.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['377'] = [];
  _$jscoverage['/utils.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['397'] = [];
  _$jscoverage['/utils.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['401'] = [];
  _$jscoverage['/utils.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['418'] = [];
  _$jscoverage['/utils.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['422'] = [];
  _$jscoverage['/utils.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['422'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['432'] = [];
  _$jscoverage['/utils.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['450'] = [];
  _$jscoverage['/utils.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['484'] = [];
  _$jscoverage['/utils.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['485'] = [];
  _$jscoverage['/utils.js'].branchData['485'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['485'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['487'] = [];
  _$jscoverage['/utils.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['490'] = [];
  _$jscoverage['/utils.js'].branchData['490'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['491'] = [];
  _$jscoverage['/utils.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['510'] = [];
  _$jscoverage['/utils.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['512'] = [];
  _$jscoverage['/utils.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['515'] = [];
  _$jscoverage['/utils.js'].branchData['515'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['521'] = [];
  _$jscoverage['/utils.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['539'] = [];
  _$jscoverage['/utils.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['539'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['568'] = [];
  _$jscoverage['/utils.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['595'] = [];
  _$jscoverage['/utils.js'].branchData['595'][1] = new BranchData();
}
_$jscoverage['/utils.js'].branchData['595'][1].init(56, 46, '!(m = str.match(/^\\s*["\']([^\'"\\s]+)["\']\\s*$/))');
function visit300_595_1(result) {
  _$jscoverage['/utils.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['568'][1].init(85, 8, '--i > -1');
function visit299_568_1(result) {
  _$jscoverage['/utils.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['539'][2].init(162, 28, 'module.factory !== undefined');
function visit298_539_2(result) {
  _$jscoverage['/utils.js'].branchData['539'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['539'][1].init(152, 38, 'module && module.factory !== undefined');
function visit297_539_1(result) {
  _$jscoverage['/utils.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['521'][1].init(527, 10, 'refModName');
function visit296_521_1(result) {
  _$jscoverage['/utils.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['515'][1].init(143, 11, 'modNames[i]');
function visit295_515_1(result) {
  _$jscoverage['/utils.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['512'][1].init(84, 5, 'i < l');
function visit294_512_1(result) {
  _$jscoverage['/utils.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['510'][1].init(51, 8, 'modNames');
function visit293_510_1(result) {
  _$jscoverage['/utils.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['491'][1].init(34, 9, '!alias[j]');
function visit292_491_1(result) {
  _$jscoverage['/utils.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['490'][1].init(217, 6, 'j >= 0');
function visit291_490_1(result) {
  _$jscoverage['/utils.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['487'][1].init(63, 25, 'typeof alias === \'string\'');
function visit290_487_1(result) {
  _$jscoverage['/utils.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['485'][2].init(68, 35, '(alias = m.getAlias()) !== undefined');
function visit289_485_2(result) {
  _$jscoverage['/utils.js'].branchData['485'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['485'][1].init(27, 77, '(m = Utils.createModuleInfo(ret[i])) && ((alias = m.getAlias()) !== undefined)');
function visit288_485_1(result) {
  _$jscoverage['/utils.js'].branchData['485'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['484'][1].init(68, 6, 'i >= 0');
function visit287_484_1(result) {
  _$jscoverage['/utils.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['450'][1].init(18, 28, 'typeof modNames === \'string\'');
function visit286_450_1(result) {
  _$jscoverage['/utils.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['432'][1].init(720, 21, 'exports !== undefined');
function visit285_432_1(result) {
  _$jscoverage['/utils.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['422'][2].init(172, 36, 'module.requires.length && module.cjs');
function visit284_422_2(result) {
  _$jscoverage['/utils.js'].branchData['422'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['422'][1].init(153, 55, 'module.requires && module.requires.length && module.cjs');
function visit283_422_1(result) {
  _$jscoverage['/utils.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['418'][1].init(89, 29, 'typeof factory === \'function\'');
function visit282_418_1(result) {
  _$jscoverage['/utils.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['401'][1].init(308, 5, 'm.cjs');
function visit281_401_1(result) {
  _$jscoverage['/utils.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['397'][1].init(193, 19, 'status >= ATTACHING');
function visit280_397_1(result) {
  _$jscoverage['/utils.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['377'][1].init(1241, 82, 'Utils.checkModsLoadRecursively(m.getNormalizedRequires(), stack, errorList, cache)');
function visit279_377_1(result) {
  _$jscoverage['/utils.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['369'][1].init(1019, 14, 'stack[modName]');
function visit278_369_1(result) {
  _$jscoverage['/utils.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['363'][1].init(22, 14, 'stack[modName]');
function visit277_363_1(result) {
  _$jscoverage['/utils.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['362'][1].init(763, 9, '\'@DEBUG@\'');
function visit276_362_1(result) {
  _$jscoverage['/utils.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['358'][1].init(638, 17, 'status !== LOADED');
function visit275_358_1(result) {
  _$jscoverage['/utils.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['354'][1].init(507, 25, 'status >= READY_TO_ATTACH');
function visit274_354_1(result) {
  _$jscoverage['/utils.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['349'][1].init(347, 16, 'status === ERROR');
function visit273_349_1(result) {
  _$jscoverage['/utils.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['344'][1].init(205, 2, '!m');
function visit272_344_1(result) {
  _$jscoverage['/utils.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['341'][1].init(113, 16, 'modName in cache');
function visit271_341_1(result) {
  _$jscoverage['/utils.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['328'][1].init(22, 2, '!s');
function visit270_328_1(result) {
  _$jscoverage['/utils.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['327'][1].init(340, 5, 'i < l');
function visit269_327_1(result) {
  _$jscoverage['/utils.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['322'][1].init(176, 11, 'cache || {}');
function visit268_322_1(result) {
  _$jscoverage['/utils.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['320'][1].init(77, 11, 'stack || []');
function visit267_320_1(result) {
  _$jscoverage['/utils.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['313'][1].init(84, 5, 'i < l');
function visit266_313_1(result) {
  _$jscoverage['/utils.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['293'][1].init(398, 5, 'allOk');
function visit265_293_1(result) {
  _$jscoverage['/utils.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['291'][2].init(164, 21, 'm.status >= ATTACHING');
function visit264_291_2(result) {
  _$jscoverage['/utils.js'].branchData['291'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['291'][1].init(159, 26, 'm && m.status >= ATTACHING');
function visit263_291_1(result) {
  _$jscoverage['/utils.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['288'][2].init(137, 18, 'i < unalias.length');
function visit262_288_2(result) {
  _$jscoverage['/utils.js'].branchData['288'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['288'][1].init(128, 27, 'allOk && i < unalias.length');
function visit261_288_1(result) {
  _$jscoverage['/utils.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['285'][2].init(81, 26, 'module.getType() !== \'css\'');
function visit260_285_2(result) {
  _$jscoverage['/utils.js'].branchData['285'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['285'][1].init(70, 37, '!module || module.getType() !== \'css\'');
function visit259_285_1(result) {
  _$jscoverage['/utils.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['259'][1].init(161, 6, 'module');
function visit258_259_1(result) {
  _$jscoverage['/utils.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['229'][1].init(199, 5, 'i < l');
function visit257_229_1(result) {
  _$jscoverage['/utils.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['223'][1].init(18, 27, 'typeof depName === \'string\'');
function visit256_223_1(result) {
  _$jscoverage['/utils.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['213'][1].init(21, 58, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit255_213_1(result) {
  _$jscoverage['/utils.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['203'][1].init(119, 29, 'urlParts1[0] === urlParts2[0]');
function visit254_203_1(result) {
  _$jscoverage['/utils.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['191'][1].init(114, 16, 'subPart === \'..\'');
function visit253_191_1(result) {
  _$jscoverage['/utils.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['190'][1].init(66, 15, 'subPart === \'.\'');
function visit252_190_1(result) {
  _$jscoverage['/utils.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['188'][1].init(307, 5, 'i < l');
function visit251_188_1(result) {
  _$jscoverage['/utils.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['182'][1].init(66, 17, 'firstChar !== \'.\'');
function visit250_182_1(result) {
  _$jscoverage['/utils.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['170'][1].init(588, 69, 'Date.now || function() {\n  return +new Date();\n}');
function visit249_170_1(result) {
  _$jscoverage['/utils.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['167'][3].init(84, 32, 'str.indexOf(suffix, ind) === ind');
function visit248_167_3(result) {
  _$jscoverage['/utils.js'].branchData['167'][3].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['167'][2].init(72, 8, 'ind >= 0');
function visit247_167_2(result) {
  _$jscoverage['/utils.js'].branchData['167'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['167'][1].init(72, 44, 'ind >= 0 && str.indexOf(suffix, ind) === ind');
function visit246_167_1(result) {
  _$jscoverage['/utils.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['158'][1].init(22, 15, 'p !== undefined');
function visit245_158_1(result) {
  _$jscoverage['/utils.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['153'][1].init(21, 32, 'str.lastIndexOf(prefix, 0) === 0');
function visit244_153_1(result) {
  _$jscoverage['/utils.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['135'][1].init(17, 56, 'Object.prototype.toString.call(obj) === \'[object Array]\'');
function visit243_135_1(result) {
  _$jscoverage['/utils.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['134'][1].init(3570, 114, 'Array.isArray || function(obj) {\n  return Object.prototype.toString.call(obj) === \'[object Array]\';\n}');
function visit242_134_1(result) {
  _$jscoverage['/utils.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['119'][1].init(22, 44, 'fn(obj[myKeys[i]], myKeys[i], obj) === false');
function visit241_119_1(result) {
  _$jscoverage['/utils.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['118'][1].init(86, 5, 'i < l');
function visit240_118_1(result) {
  _$jscoverage['/utils.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['111'][1].init(22, 28, 'fn(obj[i], i, obj) === false');
function visit239_111_1(result) {
  _$jscoverage['/utils.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['110'][1].init(50, 5, 'i < l');
function visit238_110_1(result) {
  _$jscoverage['/utils.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['108'][1].init(58, 12, 'isArray(obj)');
function visit237_108_1(result) {
  _$jscoverage['/utils.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['99'][2].init(2658, 76, '(m = ua.match(/AppleWebKit\\/([\\d.]*)/)) || (m = ua.match(/Safari\\/([\\d.]*)/))');
function visit236_99_2(result) {
  _$jscoverage['/utils.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['99'][1].init(2658, 85, '((m = ua.match(/AppleWebKit\\/([\\d.]*)/)) || (m = ua.match(/Safari\\/([\\d.]*)/))) && m[1]');
function visit235_99_1(result) {
  _$jscoverage['/utils.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['96'][2].init(21, 20, 'host.navigator || {}');
function visit234_96_2(result) {
  _$jscoverage['/utils.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['96'][1].init(21, 37, '(host.navigator || {}).userAgent || \'\'');
function visit233_96_1(result) {
  _$jscoverage['/utils.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['83'][1].init(83, 12, 'm[1] || m[2]');
function visit232_83_1(result) {
  _$jscoverage['/utils.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['82'][1].init(34, 98, '(m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\\s|:)?([0-9.]+)/)) && (v = (m[1] || m[2]))');
function visit231_82_1(result) {
  _$jscoverage['/utils.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['76'][1].init(22, 9, 'c++ === 0');
function visit230_76_1(result) {
  _$jscoverage['/utils.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['62'][1].init(26, 12, 'Plugin.alias');
function visit229_62_1(result) {
  _$jscoverage['/utils.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['56'][1].init(54, 12, 'index !== -1');
function visit228_56_1(result) {
  _$jscoverage['/utils.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['48'][1].init(134, 27, 'Utils.endsWith(name, \'.js\')');
function visit227_48_1(result) {
  _$jscoverage['/utils.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['45'][1].init(40, 36, 'name.charAt(name.length - 1) === \'/\'');
function visit226_45_1(result) {
  _$jscoverage['/utils.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['36'][1].init(103, 5, 'i < l');
function visit225_36_1(result) {
  _$jscoverage['/utils.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['30'][1].init(14, 21, 'typeof s === \'string\'');
function visit224_30_1(result) {
  _$jscoverage['/utils.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/utils.js'].functionData[0]++;
  _$jscoverage['/utils.js'].lineData[7]++;
  var Loader = S.Loader, Env = S.Env, host = Env.host, TRUE = !0, FALSE = !1, data = Loader.Status, ATTACHED = data.ATTACHED, READY_TO_ATTACH = data.READY_TO_ATTACH, LOADED = data.LOADED, ATTACHING = data.ATTACHING, ERROR = data.ERROR, Utils = Loader.Utils = {}, doc = host.document;
  _$jscoverage['/utils.js'].lineData[29]++;
  function addIndexAndRemoveJsExt(s) {
    _$jscoverage['/utils.js'].functionData[1]++;
    _$jscoverage['/utils.js'].lineData[30]++;
    if (visit224_30_1(typeof s === 'string')) {
      _$jscoverage['/utils.js'].lineData[31]++;
      return addIndexAndRemoveJsExtFromName(s);
    } else {
      _$jscoverage['/utils.js'].lineData[33]++;
      var ret = [], i = 0, l = s.length;
      _$jscoverage['/utils.js'].lineData[36]++;
      for (; visit225_36_1(i < l); i++) {
        _$jscoverage['/utils.js'].lineData[37]++;
        ret[i] = addIndexAndRemoveJsExtFromName(s[i]);
      }
      _$jscoverage['/utils.js'].lineData[39]++;
      return ret;
    }
  }
  _$jscoverage['/utils.js'].lineData[43]++;
  function addIndexAndRemoveJsExtFromName(name) {
    _$jscoverage['/utils.js'].functionData[2]++;
    _$jscoverage['/utils.js'].lineData[45]++;
    if (visit226_45_1(name.charAt(name.length - 1) === '/')) {
      _$jscoverage['/utils.js'].lineData[46]++;
      name += 'index';
    }
    _$jscoverage['/utils.js'].lineData[48]++;
    if (visit227_48_1(Utils.endsWith(name, '.js'))) {
      _$jscoverage['/utils.js'].lineData[49]++;
      name = name.slice(0, -3);
    }
    _$jscoverage['/utils.js'].lineData[51]++;
    return name;
  }
  _$jscoverage['/utils.js'].lineData[54]++;
  function pluginAlias(name) {
    _$jscoverage['/utils.js'].functionData[3]++;
    _$jscoverage['/utils.js'].lineData[55]++;
    var index = name.indexOf('!');
    _$jscoverage['/utils.js'].lineData[56]++;
    if (visit228_56_1(index !== -1)) {
      _$jscoverage['/utils.js'].lineData[57]++;
      var pluginName = name.substring(0, index);
      _$jscoverage['/utils.js'].lineData[58]++;
      name = name.substring(index + 1);
      _$jscoverage['/utils.js'].lineData[59]++;
      S.use(pluginName, {
  sync: true, 
  success: function(S, Plugin) {
  _$jscoverage['/utils.js'].functionData[4]++;
  _$jscoverage['/utils.js'].lineData[62]++;
  if (visit229_62_1(Plugin.alias)) {
    _$jscoverage['/utils.js'].lineData[64]++;
    name = Plugin.alias(S, name, pluginName);
  }
}});
    }
    _$jscoverage['/utils.js'].lineData[69]++;
    return name;
  }
  _$jscoverage['/utils.js'].lineData[72]++;
  function numberify(s) {
    _$jscoverage['/utils.js'].functionData[5]++;
    _$jscoverage['/utils.js'].lineData[73]++;
    var c = 0;
    _$jscoverage['/utils.js'].lineData[75]++;
    return parseFloat(s.replace(/\./g, function() {
  _$jscoverage['/utils.js'].functionData[6]++;
  _$jscoverage['/utils.js'].lineData[76]++;
  return (visit230_76_1(c++ === 0)) ? '.' : '';
}));
  }
  _$jscoverage['/utils.js'].lineData[80]++;
  function getIEVersion() {
    _$jscoverage['/utils.js'].functionData[7]++;
    _$jscoverage['/utils.js'].lineData[81]++;
    var m, v;
    _$jscoverage['/utils.js'].lineData[82]++;
    if (visit231_82_1((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) && (v = (visit232_83_1(m[1] || m[2]))))) {
      _$jscoverage['/utils.js'].lineData[84]++;
      return numberify(v);
    }
    _$jscoverage['/utils.js'].lineData[86]++;
    return undefined;
  }
  _$jscoverage['/utils.js'].lineData[89]++;
  function bind(fn, context) {
    _$jscoverage['/utils.js'].functionData[8]++;
    _$jscoverage['/utils.js'].lineData[90]++;
    return function() {
  _$jscoverage['/utils.js'].functionData[9]++;
  _$jscoverage['/utils.js'].lineData[91]++;
  return fn.apply(context, arguments);
};
  }
  _$jscoverage['/utils.js'].lineData[95]++;
  var m, ua = visit233_96_1((visit234_96_2(host.navigator || {})).userAgent || '');
  _$jscoverage['/utils.js'].lineData[99]++;
  if (visit235_99_1((visit236_99_2((m = ua.match(/AppleWebKit\/([\d.]*)/)) || (m = ua.match(/Safari\/([\d.]*)/)))) && m[1])) {
    _$jscoverage['/utils.js'].lineData[100]++;
    Utils.webkit = numberify(m[1]);
  }
  _$jscoverage['/utils.js'].lineData[103]++;
  var urlReg = /http(s)?:\/\/([^/]+)(?::(\d+))?/;
  _$jscoverage['/utils.js'].lineData[105]++;
  function each(obj, fn) {
    _$jscoverage['/utils.js'].functionData[10]++;
    _$jscoverage['/utils.js'].lineData[106]++;
    var i = 0, myKeys, l;
    _$jscoverage['/utils.js'].lineData[108]++;
    if (visit237_108_1(isArray(obj))) {
      _$jscoverage['/utils.js'].lineData[109]++;
      l = obj.length;
      _$jscoverage['/utils.js'].lineData[110]++;
      for (; visit238_110_1(i < l); i++) {
        _$jscoverage['/utils.js'].lineData[111]++;
        if (visit239_111_1(fn(obj[i], i, obj) === false)) {
          _$jscoverage['/utils.js'].lineData[112]++;
          break;
        }
      }
    } else {
      _$jscoverage['/utils.js'].lineData[116]++;
      myKeys = keys(obj);
      _$jscoverage['/utils.js'].lineData[117]++;
      l = myKeys.length;
      _$jscoverage['/utils.js'].lineData[118]++;
      for (; visit240_118_1(i < l); i++) {
        _$jscoverage['/utils.js'].lineData[119]++;
        if (visit241_119_1(fn(obj[myKeys[i]], myKeys[i], obj) === false)) {
          _$jscoverage['/utils.js'].lineData[120]++;
          break;
        }
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[126]++;
  function keys(obj) {
    _$jscoverage['/utils.js'].functionData[11]++;
    _$jscoverage['/utils.js'].lineData[127]++;
    var ret = [];
    _$jscoverage['/utils.js'].lineData[128]++;
    for (var key in obj) {
      _$jscoverage['/utils.js'].lineData[129]++;
      ret.push(key);
    }
    _$jscoverage['/utils.js'].lineData[131]++;
    return ret;
  }
  _$jscoverage['/utils.js'].lineData[134]++;
  var isArray = visit242_134_1(Array.isArray || function(obj) {
  _$jscoverage['/utils.js'].functionData[12]++;
  _$jscoverage['/utils.js'].lineData[135]++;
  return visit243_135_1(Object.prototype.toString.call(obj) === '[object Array]');
});
  _$jscoverage['/utils.js'].lineData[138]++;
  function mix(to, from) {
    _$jscoverage['/utils.js'].functionData[13]++;
    _$jscoverage['/utils.js'].lineData[139]++;
    for (var i in from) {
      _$jscoverage['/utils.js'].lineData[140]++;
      to[i] = from[i];
    }
    _$jscoverage['/utils.js'].lineData[142]++;
    return to;
  }
  _$jscoverage['/utils.js'].lineData[146]++;
  mix(Utils, {
  mix: mix, 
  noop: function() {
  _$jscoverage['/utils.js'].functionData[14]++;
}, 
  startsWith: function(str, prefix) {
  _$jscoverage['/utils.js'].functionData[15]++;
  _$jscoverage['/utils.js'].lineData[153]++;
  return visit244_153_1(str.lastIndexOf(prefix, 0) === 0);
}, 
  isEmptyObject: function(o) {
  _$jscoverage['/utils.js'].functionData[16]++;
  _$jscoverage['/utils.js'].lineData[157]++;
  for (var p in o) {
    _$jscoverage['/utils.js'].lineData[158]++;
    if (visit245_158_1(p !== undefined)) {
      _$jscoverage['/utils.js'].lineData[159]++;
      return false;
    }
  }
  _$jscoverage['/utils.js'].lineData[162]++;
  return true;
}, 
  endsWith: function(str, suffix) {
  _$jscoverage['/utils.js'].functionData[17]++;
  _$jscoverage['/utils.js'].lineData[166]++;
  var ind = str.length - suffix.length;
  _$jscoverage['/utils.js'].lineData[167]++;
  return visit246_167_1(visit247_167_2(ind >= 0) && visit248_167_3(str.indexOf(suffix, ind) === ind));
}, 
  now: visit249_170_1(Date.now || function() {
  _$jscoverage['/utils.js'].functionData[18]++;
  _$jscoverage['/utils.js'].lineData[171]++;
  return +new Date();
}), 
  each: each, 
  keys: keys, 
  isArray: isArray, 
  normalizePath: function(parentPath, subPath) {
  _$jscoverage['/utils.js'].functionData[19]++;
  _$jscoverage['/utils.js'].lineData[181]++;
  var firstChar = subPath.charAt(0);
  _$jscoverage['/utils.js'].lineData[182]++;
  if (visit250_182_1(firstChar !== '.')) {
    _$jscoverage['/utils.js'].lineData[183]++;
    return subPath;
  }
  _$jscoverage['/utils.js'].lineData[185]++;
  var parts = parentPath.split('/');
  _$jscoverage['/utils.js'].lineData[186]++;
  var subParts = subPath.split('/');
  _$jscoverage['/utils.js'].lineData[187]++;
  parts.pop();
  _$jscoverage['/utils.js'].lineData[188]++;
  for (var i = 0, l = subParts.length; visit251_188_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[189]++;
    var subPart = subParts[i];
    _$jscoverage['/utils.js'].lineData[190]++;
    if (visit252_190_1(subPart === '.')) {
    } else {
      _$jscoverage['/utils.js'].lineData[191]++;
      if (visit253_191_1(subPart === '..')) {
        _$jscoverage['/utils.js'].lineData[192]++;
        parts.pop();
      } else {
        _$jscoverage['/utils.js'].lineData[194]++;
        parts.push(subPart);
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[197]++;
  return parts.join('/');
}, 
  isSameOriginAs: function(url1, url2) {
  _$jscoverage['/utils.js'].functionData[20]++;
  _$jscoverage['/utils.js'].lineData[201]++;
  var urlParts1 = url1.match(urlReg);
  _$jscoverage['/utils.js'].lineData[202]++;
  var urlParts2 = url2.match(urlReg);
  _$jscoverage['/utils.js'].lineData[203]++;
  return visit254_203_1(urlParts1[0] === urlParts2[0]);
}, 
  ie: getIEVersion(), 
  docHead: function() {
  _$jscoverage['/utils.js'].functionData[21]++;
  _$jscoverage['/utils.js'].lineData[213]++;
  return visit255_213_1(doc.getElementsByTagName('head')[0] || doc.documentElement);
}, 
  normalDepModuleName: function(moduleName, depName) {
  _$jscoverage['/utils.js'].functionData[22]++;
  _$jscoverage['/utils.js'].lineData[223]++;
  if (visit256_223_1(typeof depName === 'string')) {
    _$jscoverage['/utils.js'].lineData[224]++;
    return Utils.normalizePath(moduleName, depName);
  }
  _$jscoverage['/utils.js'].lineData[227]++;
  var i = 0, l;
  _$jscoverage['/utils.js'].lineData[229]++;
  for (l = depName.length; visit257_229_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[230]++;
    depName[i] = Utils.normalizePath(moduleName, depName[i]);
  }
  _$jscoverage['/utils.js'].lineData[232]++;
  return depName;
}, 
  createModulesInfo: function(modNames) {
  _$jscoverage['/utils.js'].functionData[23]++;
  _$jscoverage['/utils.js'].lineData[240]++;
  var ret = [];
  _$jscoverage['/utils.js'].lineData[241]++;
  Utils.each(modNames, function(m, i) {
  _$jscoverage['/utils.js'].functionData[24]++;
  _$jscoverage['/utils.js'].lineData[242]++;
  ret[i] = Utils.createModuleInfo(m);
});
  _$jscoverage['/utils.js'].lineData[244]++;
  return ret;
}, 
  createModuleInfo: function(modName, cfg) {
  _$jscoverage['/utils.js'].functionData[25]++;
  _$jscoverage['/utils.js'].lineData[254]++;
  modName = addIndexAndRemoveJsExtFromName(modName);
  _$jscoverage['/utils.js'].lineData[256]++;
  var mods = Env.mods, module = mods[modName];
  _$jscoverage['/utils.js'].lineData[259]++;
  if (visit258_259_1(module)) {
    _$jscoverage['/utils.js'].lineData[260]++;
    return module;
  }
  _$jscoverage['/utils.js'].lineData[264]++;
  mods[modName] = module = new Loader.Module(mix({
  name: modName}, cfg));
  _$jscoverage['/utils.js'].lineData[268]++;
  return module;
}, 
  getModules: function(modNames) {
  _$jscoverage['/utils.js'].functionData[26]++;
  _$jscoverage['/utils.js'].lineData[277]++;
  var mods = [S], module, unalias, allOk, m, runtimeMods = Env.mods;
  _$jscoverage['/utils.js'].lineData[283]++;
  Utils.each(modNames, function(modName) {
  _$jscoverage['/utils.js'].functionData[27]++;
  _$jscoverage['/utils.js'].lineData[284]++;
  module = runtimeMods[modName];
  _$jscoverage['/utils.js'].lineData[285]++;
  if (visit259_285_1(!module || visit260_285_2(module.getType() !== 'css'))) {
    _$jscoverage['/utils.js'].lineData[286]++;
    unalias = Utils.unalias(modName);
    _$jscoverage['/utils.js'].lineData[287]++;
    allOk = true;
    _$jscoverage['/utils.js'].lineData[288]++;
    for (var i = 0; visit261_288_1(allOk && visit262_288_2(i < unalias.length)); i++) {
      _$jscoverage['/utils.js'].lineData[289]++;
      m = runtimeMods[unalias[i]];
      _$jscoverage['/utils.js'].lineData[291]++;
      allOk = visit263_291_1(m && visit264_291_2(m.status >= ATTACHING));
    }
    _$jscoverage['/utils.js'].lineData[293]++;
    if (visit265_293_1(allOk)) {
      _$jscoverage['/utils.js'].lineData[294]++;
      mods.push(runtimeMods[unalias[0]].exports);
    } else {
      _$jscoverage['/utils.js'].lineData[296]++;
      mods.push(null);
    }
  } else {
    _$jscoverage['/utils.js'].lineData[299]++;
    mods.push(undefined);
  }
});
  _$jscoverage['/utils.js'].lineData[303]++;
  return mods;
}, 
  attachModsRecursively: function(modNames) {
  _$jscoverage['/utils.js'].functionData[28]++;
  _$jscoverage['/utils.js'].lineData[311]++;
  var i, l = modNames.length;
  _$jscoverage['/utils.js'].lineData[313]++;
  for (i = 0; visit266_313_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[314]++;
    Utils.attachModRecursively(modNames[i]);
  }
}, 
  checkModsLoadRecursively: function(modNames, stack, errorList, cache) {
  _$jscoverage['/utils.js'].functionData[29]++;
  _$jscoverage['/utils.js'].lineData[320]++;
  stack = visit267_320_1(stack || []);
  _$jscoverage['/utils.js'].lineData[322]++;
  cache = visit268_322_1(cache || {});
  _$jscoverage['/utils.js'].lineData[323]++;
  var i, s = 1, l = modNames.length, stackDepth = stack.length;
  _$jscoverage['/utils.js'].lineData[327]++;
  for (i = 0; visit269_327_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[328]++;
    if (visit270_328_1(!s)) {
      _$jscoverage['/utils.js'].lineData[329]++;
      return !!s;
    }
    _$jscoverage['/utils.js'].lineData[331]++;
    s = Utils.checkModLoadRecursively(modNames[i], stack, errorList, cache);
    _$jscoverage['/utils.js'].lineData[332]++;
    stack.length = stackDepth;
  }
  _$jscoverage['/utils.js'].lineData[334]++;
  return !!s;
}, 
  checkModLoadRecursively: function(modName, stack, errorList, cache) {
  _$jscoverage['/utils.js'].functionData[30]++;
  _$jscoverage['/utils.js'].lineData[338]++;
  var mods = Env.mods, status, m = mods[modName];
  _$jscoverage['/utils.js'].lineData[341]++;
  if (visit271_341_1(modName in cache)) {
    _$jscoverage['/utils.js'].lineData[342]++;
    return cache[modName];
  }
  _$jscoverage['/utils.js'].lineData[344]++;
  if (visit272_344_1(!m)) {
    _$jscoverage['/utils.js'].lineData[345]++;
    cache[modName] = FALSE;
    _$jscoverage['/utils.js'].lineData[346]++;
    return FALSE;
  }
  _$jscoverage['/utils.js'].lineData[348]++;
  status = m.status;
  _$jscoverage['/utils.js'].lineData[349]++;
  if (visit273_349_1(status === ERROR)) {
    _$jscoverage['/utils.js'].lineData[350]++;
    errorList.push(m);
    _$jscoverage['/utils.js'].lineData[351]++;
    cache[modName] = FALSE;
    _$jscoverage['/utils.js'].lineData[352]++;
    return FALSE;
  }
  _$jscoverage['/utils.js'].lineData[354]++;
  if (visit274_354_1(status >= READY_TO_ATTACH)) {
    _$jscoverage['/utils.js'].lineData[355]++;
    cache[modName] = TRUE;
    _$jscoverage['/utils.js'].lineData[356]++;
    return TRUE;
  }
  _$jscoverage['/utils.js'].lineData[358]++;
  if (visit275_358_1(status !== LOADED)) {
    _$jscoverage['/utils.js'].lineData[359]++;
    cache[modName] = FALSE;
    _$jscoverage['/utils.js'].lineData[360]++;
    return FALSE;
  }
  _$jscoverage['/utils.js'].lineData[362]++;
  if (visit276_362_1('@DEBUG@')) {
    _$jscoverage['/utils.js'].lineData[363]++;
    if (visit277_363_1(stack[modName])) {
      _$jscoverage['/utils.js'].lineData[364]++;
      S.log('find cyclic dependency between mods: ' + stack, 'warn');
    } else {
      _$jscoverage['/utils.js'].lineData[366]++;
      stack.push(modName);
    }
  }
  _$jscoverage['/utils.js'].lineData[369]++;
  if (visit278_369_1(stack[modName])) {
    _$jscoverage['/utils.js'].lineData[370]++;
    cache[modName] = TRUE;
    _$jscoverage['/utils.js'].lineData[371]++;
    return TRUE;
  } else {
    _$jscoverage['/utils.js'].lineData[374]++;
    stack[modName] = 1;
  }
  _$jscoverage['/utils.js'].lineData[377]++;
  if (visit279_377_1(Utils.checkModsLoadRecursively(m.getNormalizedRequires(), stack, errorList, cache))) {
    _$jscoverage['/utils.js'].lineData[378]++;
    m.status = READY_TO_ATTACH;
    _$jscoverage['/utils.js'].lineData[379]++;
    cache[modName] = TRUE;
    _$jscoverage['/utils.js'].lineData[380]++;
    return TRUE;
  }
  _$jscoverage['/utils.js'].lineData[383]++;
  cache[modName] = FALSE;
  _$jscoverage['/utils.js'].lineData[384]++;
  return FALSE;
}, 
  attachModRecursively: function(modName) {
  _$jscoverage['/utils.js'].functionData[31]++;
  _$jscoverage['/utils.js'].lineData[392]++;
  var mods = Env.mods, status, m = mods[modName];
  _$jscoverage['/utils.js'].lineData[395]++;
  status = m.status;
  _$jscoverage['/utils.js'].lineData[397]++;
  if (visit280_397_1(status >= ATTACHING)) {
    _$jscoverage['/utils.js'].lineData[398]++;
    return;
  }
  _$jscoverage['/utils.js'].lineData[400]++;
  m.status = ATTACHING;
  _$jscoverage['/utils.js'].lineData[401]++;
  if (visit281_401_1(m.cjs)) {
    _$jscoverage['/utils.js'].lineData[403]++;
    Utils.attachMod(m);
  } else {
    _$jscoverage['/utils.js'].lineData[405]++;
    Utils.attachModsRecursively(m.getNormalizedRequires());
    _$jscoverage['/utils.js'].lineData[406]++;
    Utils.attachMod(m);
  }
}, 
  attachMod: function(module) {
  _$jscoverage['/utils.js'].functionData[32]++;
  _$jscoverage['/utils.js'].lineData[415]++;
  var factory = module.factory, exports;
  _$jscoverage['/utils.js'].lineData[418]++;
  if (visit282_418_1(typeof factory === 'function')) {
    _$jscoverage['/utils.js'].lineData[421]++;
    var require;
    _$jscoverage['/utils.js'].lineData[422]++;
    if (visit283_422_1(module.requires && visit284_422_2(module.requires.length && module.cjs))) {
      _$jscoverage['/utils.js'].lineData[423]++;
      require = bind(module.require, module);
    }
    _$jscoverage['/utils.js'].lineData[428]++;
    exports = factory.apply(module, (module.cjs ? [S, require, module.exports, module] : Utils.getModules(module.getRequiresWithAlias())));
    _$jscoverage['/utils.js'].lineData[432]++;
    if (visit285_432_1(exports !== undefined)) {
      _$jscoverage['/utils.js'].lineData[434]++;
      module.exports = exports;
    }
  } else {
    _$jscoverage['/utils.js'].lineData[438]++;
    module.exports = factory;
  }
  _$jscoverage['/utils.js'].lineData[441]++;
  module.status = ATTACHED;
}, 
  getModNamesAsArray: function(modNames) {
  _$jscoverage['/utils.js'].functionData[33]++;
  _$jscoverage['/utils.js'].lineData[450]++;
  if (visit286_450_1(typeof modNames === 'string')) {
    _$jscoverage['/utils.js'].lineData[451]++;
    modNames = modNames.replace(/\s+/g, '').split(',');
  }
  _$jscoverage['/utils.js'].lineData[453]++;
  return modNames;
}, 
  normalizeModNames: function(modNames, refModName) {
  _$jscoverage['/utils.js'].functionData[34]++;
  _$jscoverage['/utils.js'].lineData[467]++;
  return Utils.unalias(Utils.normalizeModNamesWithAlias(modNames, refModName));
}, 
  unalias: function(names) {
  _$jscoverage['/utils.js'].functionData[35]++;
  _$jscoverage['/utils.js'].lineData[476]++;
  var ret = [].concat(names), i, m, alias, ok = 0, j;
  _$jscoverage['/utils.js'].lineData[482]++;
  while (!ok) {
    _$jscoverage['/utils.js'].lineData[483]++;
    ok = 1;
    _$jscoverage['/utils.js'].lineData[484]++;
    for (i = ret.length - 1; visit287_484_1(i >= 0); i--) {
      _$jscoverage['/utils.js'].lineData[485]++;
      if (visit288_485_1((m = Utils.createModuleInfo(ret[i])) && (visit289_485_2((alias = m.getAlias()) !== undefined)))) {
        _$jscoverage['/utils.js'].lineData[486]++;
        ok = 0;
        _$jscoverage['/utils.js'].lineData[487]++;
        if (visit290_487_1(typeof alias === 'string')) {
          _$jscoverage['/utils.js'].lineData[488]++;
          alias = [alias];
        }
        _$jscoverage['/utils.js'].lineData[490]++;
        for (j = alias.length - 1; visit291_490_1(j >= 0); j--) {
          _$jscoverage['/utils.js'].lineData[491]++;
          if (visit292_491_1(!alias[j])) {
            _$jscoverage['/utils.js'].lineData[492]++;
            alias.splice(j, 1);
          }
        }
        _$jscoverage['/utils.js'].lineData[495]++;
        ret.splice.apply(ret, [i, 1].concat(addIndexAndRemoveJsExt(alias)));
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[499]++;
  return ret;
}, 
  normalizeModNamesWithAlias: function(modNames, refModName) {
  _$jscoverage['/utils.js'].functionData[36]++;
  _$jscoverage['/utils.js'].lineData[509]++;
  var ret = [], i, l;
  _$jscoverage['/utils.js'].lineData[510]++;
  if (visit293_510_1(modNames)) {
    _$jscoverage['/utils.js'].lineData[512]++;
    for (i = 0 , l = modNames.length; visit294_512_1(i < l); i++) {
      _$jscoverage['/utils.js'].lineData[515]++;
      if (visit295_515_1(modNames[i])) {
        _$jscoverage['/utils.js'].lineData[516]++;
        ret.push(pluginAlias(addIndexAndRemoveJsExt(modNames[i])));
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[521]++;
  if (visit296_521_1(refModName)) {
    _$jscoverage['/utils.js'].lineData[522]++;
    ret = Utils.normalDepModuleName(refModName, ret);
  }
  _$jscoverage['/utils.js'].lineData[524]++;
  return ret;
}, 
  registerModule: function(name, factory, config) {
  _$jscoverage['/utils.js'].functionData[37]++;
  _$jscoverage['/utils.js'].lineData[534]++;
  name = addIndexAndRemoveJsExtFromName(name);
  _$jscoverage['/utils.js'].lineData[536]++;
  var mods = Env.mods, module = mods[name];
  _$jscoverage['/utils.js'].lineData[539]++;
  if (visit297_539_1(module && visit298_539_2(module.factory !== undefined))) {
    _$jscoverage['/utils.js'].lineData[540]++;
    S.log(name + ' is defined more than once', 'warn');
    _$jscoverage['/utils.js'].lineData[541]++;
    return;
  }
  _$jscoverage['/utils.js'].lineData[545]++;
  Utils.createModuleInfo(name);
  _$jscoverage['/utils.js'].lineData[547]++;
  module = mods[name];
  _$jscoverage['/utils.js'].lineData[551]++;
  mix(module, {
  name: name, 
  status: LOADED, 
  factory: factory});
  _$jscoverage['/utils.js'].lineData[557]++;
  mix(module, config);
}, 
  getHash: function(str) {
  _$jscoverage['/utils.js'].functionData[38]++;
  _$jscoverage['/utils.js'].lineData[566]++;
  var hash = 5381, i;
  _$jscoverage['/utils.js'].lineData[568]++;
  for (i = str.length; visit299_568_1(--i > -1); ) {
    _$jscoverage['/utils.js'].lineData[569]++;
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  _$jscoverage['/utils.js'].lineData[572]++;
  return hash + '';
}, 
  getRequiresFromFn: function(fn) {
  _$jscoverage['/utils.js'].functionData[39]++;
  _$jscoverage['/utils.js'].lineData[576]++;
  var requires = [];
  _$jscoverage['/utils.js'].lineData[582]++;
  fn.toString().replace(commentRegExp, '').replace(requireRegExp, function(match, dep) {
  _$jscoverage['/utils.js'].functionData[40]++;
  _$jscoverage['/utils.js'].lineData[583]++;
  requires.push(getRequireVal(dep));
});
  _$jscoverage['/utils.js'].lineData[585]++;
  return requires;
}});
  _$jscoverage['/utils.js'].lineData[589]++;
  var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, requireRegExp = /[^.'"]\s*require\s*\(([^)]+)\)/g;
  _$jscoverage['/utils.js'].lineData[592]++;
  function getRequireVal(str) {
    _$jscoverage['/utils.js'].functionData[41]++;
    _$jscoverage['/utils.js'].lineData[593]++;
    var m;
    _$jscoverage['/utils.js'].lineData[595]++;
    if (visit300_595_1(!(m = str.match(/^\s*["']([^'"\s]+)["']\s*$/)))) {
      _$jscoverage['/utils.js'].lineData[596]++;
      S.error('can not find required mod in require call: ' + str);
    }
    _$jscoverage['/utils.js'].lineData[598]++;
    return m[1];
  }
})(KISSY);
