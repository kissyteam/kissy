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
  _$jscoverage['/utils.js'].lineData[145] = 0;
  _$jscoverage['/utils.js'].lineData[152] = 0;
  _$jscoverage['/utils.js'].lineData[156] = 0;
  _$jscoverage['/utils.js'].lineData[157] = 0;
  _$jscoverage['/utils.js'].lineData[158] = 0;
  _$jscoverage['/utils.js'].lineData[161] = 0;
  _$jscoverage['/utils.js'].lineData[165] = 0;
  _$jscoverage['/utils.js'].lineData[166] = 0;
  _$jscoverage['/utils.js'].lineData[170] = 0;
  _$jscoverage['/utils.js'].lineData[180] = 0;
  _$jscoverage['/utils.js'].lineData[181] = 0;
  _$jscoverage['/utils.js'].lineData[182] = 0;
  _$jscoverage['/utils.js'].lineData[184] = 0;
  _$jscoverage['/utils.js'].lineData[185] = 0;
  _$jscoverage['/utils.js'].lineData[186] = 0;
  _$jscoverage['/utils.js'].lineData[187] = 0;
  _$jscoverage['/utils.js'].lineData[188] = 0;
  _$jscoverage['/utils.js'].lineData[189] = 0;
  _$jscoverage['/utils.js'].lineData[190] = 0;
  _$jscoverage['/utils.js'].lineData[191] = 0;
  _$jscoverage['/utils.js'].lineData[193] = 0;
  _$jscoverage['/utils.js'].lineData[196] = 0;
  _$jscoverage['/utils.js'].lineData[200] = 0;
  _$jscoverage['/utils.js'].lineData[201] = 0;
  _$jscoverage['/utils.js'].lineData[202] = 0;
  _$jscoverage['/utils.js'].lineData[212] = 0;
  _$jscoverage['/utils.js'].lineData[222] = 0;
  _$jscoverage['/utils.js'].lineData[223] = 0;
  _$jscoverage['/utils.js'].lineData[226] = 0;
  _$jscoverage['/utils.js'].lineData[228] = 0;
  _$jscoverage['/utils.js'].lineData[229] = 0;
  _$jscoverage['/utils.js'].lineData[231] = 0;
  _$jscoverage['/utils.js'].lineData[239] = 0;
  _$jscoverage['/utils.js'].lineData[240] = 0;
  _$jscoverage['/utils.js'].lineData[241] = 0;
  _$jscoverage['/utils.js'].lineData[243] = 0;
  _$jscoverage['/utils.js'].lineData[253] = 0;
  _$jscoverage['/utils.js'].lineData[255] = 0;
  _$jscoverage['/utils.js'].lineData[258] = 0;
  _$jscoverage['/utils.js'].lineData[259] = 0;
  _$jscoverage['/utils.js'].lineData[263] = 0;
  _$jscoverage['/utils.js'].lineData[267] = 0;
  _$jscoverage['/utils.js'].lineData[276] = 0;
  _$jscoverage['/utils.js'].lineData[282] = 0;
  _$jscoverage['/utils.js'].lineData[283] = 0;
  _$jscoverage['/utils.js'].lineData[284] = 0;
  _$jscoverage['/utils.js'].lineData[285] = 0;
  _$jscoverage['/utils.js'].lineData[286] = 0;
  _$jscoverage['/utils.js'].lineData[287] = 0;
  _$jscoverage['/utils.js'].lineData[288] = 0;
  _$jscoverage['/utils.js'].lineData[290] = 0;
  _$jscoverage['/utils.js'].lineData[292] = 0;
  _$jscoverage['/utils.js'].lineData[293] = 0;
  _$jscoverage['/utils.js'].lineData[295] = 0;
  _$jscoverage['/utils.js'].lineData[298] = 0;
  _$jscoverage['/utils.js'].lineData[302] = 0;
  _$jscoverage['/utils.js'].lineData[310] = 0;
  _$jscoverage['/utils.js'].lineData[312] = 0;
  _$jscoverage['/utils.js'].lineData[313] = 0;
  _$jscoverage['/utils.js'].lineData[319] = 0;
  _$jscoverage['/utils.js'].lineData[321] = 0;
  _$jscoverage['/utils.js'].lineData[322] = 0;
  _$jscoverage['/utils.js'].lineData[326] = 0;
  _$jscoverage['/utils.js'].lineData[327] = 0;
  _$jscoverage['/utils.js'].lineData[328] = 0;
  _$jscoverage['/utils.js'].lineData[330] = 0;
  _$jscoverage['/utils.js'].lineData[331] = 0;
  _$jscoverage['/utils.js'].lineData[333] = 0;
  _$jscoverage['/utils.js'].lineData[337] = 0;
  _$jscoverage['/utils.js'].lineData[340] = 0;
  _$jscoverage['/utils.js'].lineData[341] = 0;
  _$jscoverage['/utils.js'].lineData[343] = 0;
  _$jscoverage['/utils.js'].lineData[344] = 0;
  _$jscoverage['/utils.js'].lineData[345] = 0;
  _$jscoverage['/utils.js'].lineData[347] = 0;
  _$jscoverage['/utils.js'].lineData[348] = 0;
  _$jscoverage['/utils.js'].lineData[349] = 0;
  _$jscoverage['/utils.js'].lineData[350] = 0;
  _$jscoverage['/utils.js'].lineData[351] = 0;
  _$jscoverage['/utils.js'].lineData[353] = 0;
  _$jscoverage['/utils.js'].lineData[354] = 0;
  _$jscoverage['/utils.js'].lineData[355] = 0;
  _$jscoverage['/utils.js'].lineData[357] = 0;
  _$jscoverage['/utils.js'].lineData[358] = 0;
  _$jscoverage['/utils.js'].lineData[359] = 0;
  _$jscoverage['/utils.js'].lineData[361] = 0;
  _$jscoverage['/utils.js'].lineData[362] = 0;
  _$jscoverage['/utils.js'].lineData[363] = 0;
  _$jscoverage['/utils.js'].lineData[365] = 0;
  _$jscoverage['/utils.js'].lineData[368] = 0;
  _$jscoverage['/utils.js'].lineData[369] = 0;
  _$jscoverage['/utils.js'].lineData[370] = 0;
  _$jscoverage['/utils.js'].lineData[373] = 0;
  _$jscoverage['/utils.js'].lineData[376] = 0;
  _$jscoverage['/utils.js'].lineData[377] = 0;
  _$jscoverage['/utils.js'].lineData[378] = 0;
  _$jscoverage['/utils.js'].lineData[379] = 0;
  _$jscoverage['/utils.js'].lineData[382] = 0;
  _$jscoverage['/utils.js'].lineData[383] = 0;
  _$jscoverage['/utils.js'].lineData[391] = 0;
  _$jscoverage['/utils.js'].lineData[394] = 0;
  _$jscoverage['/utils.js'].lineData[396] = 0;
  _$jscoverage['/utils.js'].lineData[397] = 0;
  _$jscoverage['/utils.js'].lineData[399] = 0;
  _$jscoverage['/utils.js'].lineData[400] = 0;
  _$jscoverage['/utils.js'].lineData[402] = 0;
  _$jscoverage['/utils.js'].lineData[404] = 0;
  _$jscoverage['/utils.js'].lineData[405] = 0;
  _$jscoverage['/utils.js'].lineData[414] = 0;
  _$jscoverage['/utils.js'].lineData[417] = 0;
  _$jscoverage['/utils.js'].lineData[420] = 0;
  _$jscoverage['/utils.js'].lineData[421] = 0;
  _$jscoverage['/utils.js'].lineData[422] = 0;
  _$jscoverage['/utils.js'].lineData[427] = 0;
  _$jscoverage['/utils.js'].lineData[431] = 0;
  _$jscoverage['/utils.js'].lineData[433] = 0;
  _$jscoverage['/utils.js'].lineData[437] = 0;
  _$jscoverage['/utils.js'].lineData[440] = 0;
  _$jscoverage['/utils.js'].lineData[449] = 0;
  _$jscoverage['/utils.js'].lineData[450] = 0;
  _$jscoverage['/utils.js'].lineData[452] = 0;
  _$jscoverage['/utils.js'].lineData[466] = 0;
  _$jscoverage['/utils.js'].lineData[475] = 0;
  _$jscoverage['/utils.js'].lineData[481] = 0;
  _$jscoverage['/utils.js'].lineData[482] = 0;
  _$jscoverage['/utils.js'].lineData[483] = 0;
  _$jscoverage['/utils.js'].lineData[484] = 0;
  _$jscoverage['/utils.js'].lineData[485] = 0;
  _$jscoverage['/utils.js'].lineData[486] = 0;
  _$jscoverage['/utils.js'].lineData[487] = 0;
  _$jscoverage['/utils.js'].lineData[489] = 0;
  _$jscoverage['/utils.js'].lineData[490] = 0;
  _$jscoverage['/utils.js'].lineData[491] = 0;
  _$jscoverage['/utils.js'].lineData[494] = 0;
  _$jscoverage['/utils.js'].lineData[498] = 0;
  _$jscoverage['/utils.js'].lineData[508] = 0;
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
  _$jscoverage['/utils.js'].branchData['152'] = [];
  _$jscoverage['/utils.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['157'] = [];
  _$jscoverage['/utils.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['166'] = [];
  _$jscoverage['/utils.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['166'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['166'][3] = new BranchData();
  _$jscoverage['/utils.js'].branchData['169'] = [];
  _$jscoverage['/utils.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['181'] = [];
  _$jscoverage['/utils.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['187'] = [];
  _$jscoverage['/utils.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['189'] = [];
  _$jscoverage['/utils.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['190'] = [];
  _$jscoverage['/utils.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['202'] = [];
  _$jscoverage['/utils.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['212'] = [];
  _$jscoverage['/utils.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['222'] = [];
  _$jscoverage['/utils.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['228'] = [];
  _$jscoverage['/utils.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['258'] = [];
  _$jscoverage['/utils.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['284'] = [];
  _$jscoverage['/utils.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['284'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['287'] = [];
  _$jscoverage['/utils.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['287'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['290'] = [];
  _$jscoverage['/utils.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['290'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['292'] = [];
  _$jscoverage['/utils.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['312'] = [];
  _$jscoverage['/utils.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['319'] = [];
  _$jscoverage['/utils.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['321'] = [];
  _$jscoverage['/utils.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['326'] = [];
  _$jscoverage['/utils.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['327'] = [];
  _$jscoverage['/utils.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['340'] = [];
  _$jscoverage['/utils.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['343'] = [];
  _$jscoverage['/utils.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['348'] = [];
  _$jscoverage['/utils.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['353'] = [];
  _$jscoverage['/utils.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['357'] = [];
  _$jscoverage['/utils.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['361'] = [];
  _$jscoverage['/utils.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['362'] = [];
  _$jscoverage['/utils.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['368'] = [];
  _$jscoverage['/utils.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['376'] = [];
  _$jscoverage['/utils.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['396'] = [];
  _$jscoverage['/utils.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['400'] = [];
  _$jscoverage['/utils.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['417'] = [];
  _$jscoverage['/utils.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['421'] = [];
  _$jscoverage['/utils.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['421'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['431'] = [];
  _$jscoverage['/utils.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['449'] = [];
  _$jscoverage['/utils.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['483'] = [];
  _$jscoverage['/utils.js'].branchData['483'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['484'] = [];
  _$jscoverage['/utils.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['484'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['486'] = [];
  _$jscoverage['/utils.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['489'] = [];
  _$jscoverage['/utils.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['490'] = [];
  _$jscoverage['/utils.js'].branchData['490'][1] = new BranchData();
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
function visit302_595_1(result) {
  _$jscoverage['/utils.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['568'][1].init(85, 8, '--i > -1');
function visit301_568_1(result) {
  _$jscoverage['/utils.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['539'][2].init(162, 28, 'module.factory !== undefined');
function visit300_539_2(result) {
  _$jscoverage['/utils.js'].branchData['539'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['539'][1].init(152, 38, 'module && module.factory !== undefined');
function visit299_539_1(result) {
  _$jscoverage['/utils.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['521'][1].init(544, 10, 'refModName');
function visit298_521_1(result) {
  _$jscoverage['/utils.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['515'][1].init(143, 11, 'modNames[i]');
function visit297_515_1(result) {
  _$jscoverage['/utils.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['512'][1].init(84, 5, 'i < l');
function visit296_512_1(result) {
  _$jscoverage['/utils.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['510'][1].init(68, 8, 'modNames');
function visit295_510_1(result) {
  _$jscoverage['/utils.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['490'][1].init(34, 9, '!alias[j]');
function visit294_490_1(result) {
  _$jscoverage['/utils.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['489'][1].init(217, 6, 'j >= 0');
function visit293_489_1(result) {
  _$jscoverage['/utils.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['486'][1].init(63, 25, 'typeof alias === \'string\'');
function visit292_486_1(result) {
  _$jscoverage['/utils.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['484'][2].init(68, 35, '(alias = m.getAlias()) !== undefined');
function visit291_484_2(result) {
  _$jscoverage['/utils.js'].branchData['484'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['484'][1].init(27, 77, '(m = Utils.createModuleInfo(ret[i])) && ((alias = m.getAlias()) !== undefined)');
function visit290_484_1(result) {
  _$jscoverage['/utils.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['483'][1].init(68, 6, 'i >= 0');
function visit289_483_1(result) {
  _$jscoverage['/utils.js'].branchData['483'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['449'][1].init(18, 28, 'typeof modNames === \'string\'');
function visit288_449_1(result) {
  _$jscoverage['/utils.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['431'][1].init(720, 21, 'exports !== undefined');
function visit287_431_1(result) {
  _$jscoverage['/utils.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['421'][2].init(172, 36, 'module.requires.length && module.cjs');
function visit286_421_2(result) {
  _$jscoverage['/utils.js'].branchData['421'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['421'][1].init(153, 55, 'module.requires && module.requires.length && module.cjs');
function visit285_421_1(result) {
  _$jscoverage['/utils.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['417'][1].init(89, 29, 'typeof factory === \'function\'');
function visit284_417_1(result) {
  _$jscoverage['/utils.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['400'][1].init(308, 5, 'm.cjs');
function visit283_400_1(result) {
  _$jscoverage['/utils.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['396'][1].init(193, 19, 'status >= ATTACHING');
function visit282_396_1(result) {
  _$jscoverage['/utils.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['376'][1].init(1241, 82, 'Utils.checkModsLoadRecursively(m.getNormalizedRequires(), stack, errorList, cache)');
function visit281_376_1(result) {
  _$jscoverage['/utils.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['368'][1].init(1019, 14, 'stack[modName]');
function visit280_368_1(result) {
  _$jscoverage['/utils.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['362'][1].init(22, 14, 'stack[modName]');
function visit279_362_1(result) {
  _$jscoverage['/utils.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['361'][1].init(763, 9, '\'@DEBUG@\'');
function visit278_361_1(result) {
  _$jscoverage['/utils.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['357'][1].init(638, 17, 'status !== LOADED');
function visit277_357_1(result) {
  _$jscoverage['/utils.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['353'][1].init(507, 25, 'status >= READY_TO_ATTACH');
function visit276_353_1(result) {
  _$jscoverage['/utils.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['348'][1].init(347, 16, 'status === ERROR');
function visit275_348_1(result) {
  _$jscoverage['/utils.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['343'][1].init(205, 2, '!m');
function visit274_343_1(result) {
  _$jscoverage['/utils.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['340'][1].init(113, 16, 'modName in cache');
function visit273_340_1(result) {
  _$jscoverage['/utils.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['327'][1].init(22, 2, '!s');
function visit272_327_1(result) {
  _$jscoverage['/utils.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['326'][1].init(340, 5, 'i < l');
function visit271_326_1(result) {
  _$jscoverage['/utils.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['321'][1].init(176, 11, 'cache || {}');
function visit270_321_1(result) {
  _$jscoverage['/utils.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['319'][1].init(77, 11, 'stack || []');
function visit269_319_1(result) {
  _$jscoverage['/utils.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['312'][1].init(84, 5, 'i < l');
function visit268_312_1(result) {
  _$jscoverage['/utils.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['292'][1].init(398, 5, 'allOk');
function visit267_292_1(result) {
  _$jscoverage['/utils.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['290'][2].init(164, 21, 'm.status >= ATTACHING');
function visit266_290_2(result) {
  _$jscoverage['/utils.js'].branchData['290'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['290'][1].init(159, 26, 'm && m.status >= ATTACHING');
function visit265_290_1(result) {
  _$jscoverage['/utils.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['287'][2].init(137, 18, 'i < unalias.length');
function visit264_287_2(result) {
  _$jscoverage['/utils.js'].branchData['287'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['287'][1].init(128, 27, 'allOk && i < unalias.length');
function visit263_287_1(result) {
  _$jscoverage['/utils.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['284'][2].init(81, 26, 'module.getType() !== \'css\'');
function visit262_284_2(result) {
  _$jscoverage['/utils.js'].branchData['284'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['284'][1].init(70, 37, '!module || module.getType() !== \'css\'');
function visit261_284_1(result) {
  _$jscoverage['/utils.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['258'][1].init(161, 6, 'module');
function visit260_258_1(result) {
  _$jscoverage['/utils.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['228'][1].init(199, 5, 'i < l');
function visit259_228_1(result) {
  _$jscoverage['/utils.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['222'][1].init(18, 27, 'typeof depName === \'string\'');
function visit258_222_1(result) {
  _$jscoverage['/utils.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['212'][1].init(21, 58, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit257_212_1(result) {
  _$jscoverage['/utils.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['202'][1].init(119, 29, 'urlParts1[0] === urlParts2[0]');
function visit256_202_1(result) {
  _$jscoverage['/utils.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['190'][1].init(114, 16, 'subPart === \'..\'');
function visit255_190_1(result) {
  _$jscoverage['/utils.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['189'][1].init(66, 15, 'subPart === \'.\'');
function visit254_189_1(result) {
  _$jscoverage['/utils.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['187'][1].init(307, 5, 'i < l');
function visit253_187_1(result) {
  _$jscoverage['/utils.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['181'][1].init(66, 17, 'firstChar !== \'.\'');
function visit252_181_1(result) {
  _$jscoverage['/utils.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['169'][1].init(588, 69, 'Date.now || function() {\n  return +new Date();\n}');
function visit251_169_1(result) {
  _$jscoverage['/utils.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['166'][3].init(84, 32, 'str.indexOf(suffix, ind) === ind');
function visit250_166_3(result) {
  _$jscoverage['/utils.js'].branchData['166'][3].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['166'][2].init(72, 8, 'ind >= 0');
function visit249_166_2(result) {
  _$jscoverage['/utils.js'].branchData['166'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['166'][1].init(72, 44, 'ind >= 0 && str.indexOf(suffix, ind) === ind');
function visit248_166_1(result) {
  _$jscoverage['/utils.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['157'][1].init(22, 15, 'p !== undefined');
function visit247_157_1(result) {
  _$jscoverage['/utils.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['152'][1].init(21, 32, 'str.lastIndexOf(prefix, 0) === 0');
function visit246_152_1(result) {
  _$jscoverage['/utils.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['135'][1].init(17, 56, 'Object.prototype.toString.call(obj) === \'[object Array]\'');
function visit245_135_1(result) {
  _$jscoverage['/utils.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['134'][1].init(3570, 114, 'Array.isArray || function(obj) {\n  return Object.prototype.toString.call(obj) === \'[object Array]\';\n}');
function visit244_134_1(result) {
  _$jscoverage['/utils.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['119'][1].init(22, 44, 'fn(obj[myKeys[i]], myKeys[i], obj) === false');
function visit243_119_1(result) {
  _$jscoverage['/utils.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['118'][1].init(86, 5, 'i < l');
function visit242_118_1(result) {
  _$jscoverage['/utils.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['111'][1].init(22, 28, 'fn(obj[i], i, obj) === false');
function visit241_111_1(result) {
  _$jscoverage['/utils.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['110'][1].init(50, 5, 'i < l');
function visit240_110_1(result) {
  _$jscoverage['/utils.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['108'][1].init(58, 12, 'isArray(obj)');
function visit239_108_1(result) {
  _$jscoverage['/utils.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['99'][2].init(2658, 76, '(m = ua.match(/AppleWebKit\\/([\\d.]*)/)) || (m = ua.match(/Safari\\/([\\d.]*)/))');
function visit238_99_2(result) {
  _$jscoverage['/utils.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['99'][1].init(2658, 85, '((m = ua.match(/AppleWebKit\\/([\\d.]*)/)) || (m = ua.match(/Safari\\/([\\d.]*)/))) && m[1]');
function visit237_99_1(result) {
  _$jscoverage['/utils.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['96'][2].init(21, 20, 'host.navigator || {}');
function visit236_96_2(result) {
  _$jscoverage['/utils.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['96'][1].init(21, 37, '(host.navigator || {}).userAgent || \'\'');
function visit235_96_1(result) {
  _$jscoverage['/utils.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['83'][1].init(83, 12, 'm[1] || m[2]');
function visit234_83_1(result) {
  _$jscoverage['/utils.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['82'][1].init(34, 98, '(m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\\s|:)?([0-9.]+)/)) && (v = (m[1] || m[2]))');
function visit233_82_1(result) {
  _$jscoverage['/utils.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['76'][1].init(22, 9, 'c++ === 0');
function visit232_76_1(result) {
  _$jscoverage['/utils.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['62'][1].init(26, 12, 'Plugin.alias');
function visit231_62_1(result) {
  _$jscoverage['/utils.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['56'][1].init(54, 12, 'index !== -1');
function visit230_56_1(result) {
  _$jscoverage['/utils.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['48'][1].init(134, 27, 'Utils.endsWith(name, \'.js\')');
function visit229_48_1(result) {
  _$jscoverage['/utils.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['45'][1].init(40, 36, 'name.charAt(name.length - 1) === \'/\'');
function visit228_45_1(result) {
  _$jscoverage['/utils.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['36'][1].init(103, 5, 'i < l');
function visit227_36_1(result) {
  _$jscoverage['/utils.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['30'][1].init(14, 21, 'typeof s === \'string\'');
function visit226_30_1(result) {
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
    if (visit226_30_1(typeof s === 'string')) {
      _$jscoverage['/utils.js'].lineData[31]++;
      return addIndexAndRemoveJsExtFromName(s);
    } else {
      _$jscoverage['/utils.js'].lineData[33]++;
      var ret = [], i = 0, l = s.length;
      _$jscoverage['/utils.js'].lineData[36]++;
      for (; visit227_36_1(i < l); i++) {
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
    if (visit228_45_1(name.charAt(name.length - 1) === '/')) {
      _$jscoverage['/utils.js'].lineData[46]++;
      name += 'index';
    }
    _$jscoverage['/utils.js'].lineData[48]++;
    if (visit229_48_1(Utils.endsWith(name, '.js'))) {
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
    if (visit230_56_1(index !== -1)) {
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
  if (visit231_62_1(Plugin.alias)) {
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
  return (visit232_76_1(c++ === 0)) ? '.' : '';
}));
  }
  _$jscoverage['/utils.js'].lineData[80]++;
  function getIEVersion() {
    _$jscoverage['/utils.js'].functionData[7]++;
    _$jscoverage['/utils.js'].lineData[81]++;
    var m, v;
    _$jscoverage['/utils.js'].lineData[82]++;
    if (visit233_82_1((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) && (v = (visit234_83_1(m[1] || m[2]))))) {
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
  var m, ua = visit235_96_1((visit236_96_2(host.navigator || {})).userAgent || '');
  _$jscoverage['/utils.js'].lineData[99]++;
  if (visit237_99_1((visit238_99_2((m = ua.match(/AppleWebKit\/([\d.]*)/)) || (m = ua.match(/Safari\/([\d.]*)/)))) && m[1])) {
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
    if (visit239_108_1(isArray(obj))) {
      _$jscoverage['/utils.js'].lineData[109]++;
      l = obj.length;
      _$jscoverage['/utils.js'].lineData[110]++;
      for (; visit240_110_1(i < l); i++) {
        _$jscoverage['/utils.js'].lineData[111]++;
        if (visit241_111_1(fn(obj[i], i, obj) === false)) {
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
      for (; visit242_118_1(i < l); i++) {
        _$jscoverage['/utils.js'].lineData[119]++;
        if (visit243_119_1(fn(obj[myKeys[i]], myKeys[i], obj) === false)) {
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
  var isArray = visit244_134_1(Array.isArray || function(obj) {
  _$jscoverage['/utils.js'].functionData[12]++;
  _$jscoverage['/utils.js'].lineData[135]++;
  return visit245_135_1(Object.prototype.toString.call(obj) === '[object Array]');
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
  _$jscoverage['/utils.js'].lineData[145]++;
  mix(Utils, {
  mix: mix, 
  noop: function() {
  _$jscoverage['/utils.js'].functionData[14]++;
}, 
  startsWith: function(str, prefix) {
  _$jscoverage['/utils.js'].functionData[15]++;
  _$jscoverage['/utils.js'].lineData[152]++;
  return visit246_152_1(str.lastIndexOf(prefix, 0) === 0);
}, 
  isEmptyObject: function(o) {
  _$jscoverage['/utils.js'].functionData[16]++;
  _$jscoverage['/utils.js'].lineData[156]++;
  for (var p in o) {
    _$jscoverage['/utils.js'].lineData[157]++;
    if (visit247_157_1(p !== undefined)) {
      _$jscoverage['/utils.js'].lineData[158]++;
      return false;
    }
  }
  _$jscoverage['/utils.js'].lineData[161]++;
  return true;
}, 
  endsWith: function(str, suffix) {
  _$jscoverage['/utils.js'].functionData[17]++;
  _$jscoverage['/utils.js'].lineData[165]++;
  var ind = str.length - suffix.length;
  _$jscoverage['/utils.js'].lineData[166]++;
  return visit248_166_1(visit249_166_2(ind >= 0) && visit250_166_3(str.indexOf(suffix, ind) === ind));
}, 
  now: visit251_169_1(Date.now || function() {
  _$jscoverage['/utils.js'].functionData[18]++;
  _$jscoverage['/utils.js'].lineData[170]++;
  return +new Date();
}), 
  each: each, 
  keys: keys, 
  isArray: isArray, 
  normalizePath: function(parentPath, subPath) {
  _$jscoverage['/utils.js'].functionData[19]++;
  _$jscoverage['/utils.js'].lineData[180]++;
  var firstChar = subPath.charAt(0);
  _$jscoverage['/utils.js'].lineData[181]++;
  if (visit252_181_1(firstChar !== '.')) {
    _$jscoverage['/utils.js'].lineData[182]++;
    return subPath;
  }
  _$jscoverage['/utils.js'].lineData[184]++;
  var parts = parentPath.split('/');
  _$jscoverage['/utils.js'].lineData[185]++;
  var subParts = subPath.split('/');
  _$jscoverage['/utils.js'].lineData[186]++;
  parts.pop();
  _$jscoverage['/utils.js'].lineData[187]++;
  for (var i = 0, l = subParts.length; visit253_187_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[188]++;
    var subPart = subParts[i];
    _$jscoverage['/utils.js'].lineData[189]++;
    if (visit254_189_1(subPart === '.')) {
    } else {
      _$jscoverage['/utils.js'].lineData[190]++;
      if (visit255_190_1(subPart === '..')) {
        _$jscoverage['/utils.js'].lineData[191]++;
        parts.pop();
      } else {
        _$jscoverage['/utils.js'].lineData[193]++;
        parts.push(subPart);
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[196]++;
  return parts.join('/');
}, 
  isSameOriginAs: function(url1, url2) {
  _$jscoverage['/utils.js'].functionData[20]++;
  _$jscoverage['/utils.js'].lineData[200]++;
  var urlParts1 = url1.match(urlReg);
  _$jscoverage['/utils.js'].lineData[201]++;
  var urlParts2 = url2.match(urlReg);
  _$jscoverage['/utils.js'].lineData[202]++;
  return visit256_202_1(urlParts1[0] === urlParts2[0]);
}, 
  ie: getIEVersion(), 
  docHead: function() {
  _$jscoverage['/utils.js'].functionData[21]++;
  _$jscoverage['/utils.js'].lineData[212]++;
  return visit257_212_1(doc.getElementsByTagName('head')[0] || doc.documentElement);
}, 
  normalDepModuleName: function(moduleName, depName) {
  _$jscoverage['/utils.js'].functionData[22]++;
  _$jscoverage['/utils.js'].lineData[222]++;
  if (visit258_222_1(typeof depName === 'string')) {
    _$jscoverage['/utils.js'].lineData[223]++;
    return Utils.normalizePath(moduleName, depName);
  }
  _$jscoverage['/utils.js'].lineData[226]++;
  var i = 0, l;
  _$jscoverage['/utils.js'].lineData[228]++;
  for (l = depName.length; visit259_228_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[229]++;
    depName[i] = Utils.normalizePath(moduleName, depName[i]);
  }
  _$jscoverage['/utils.js'].lineData[231]++;
  return depName;
}, 
  createModulesInfo: function(modNames) {
  _$jscoverage['/utils.js'].functionData[23]++;
  _$jscoverage['/utils.js'].lineData[239]++;
  var ret = [];
  _$jscoverage['/utils.js'].lineData[240]++;
  Utils.each(modNames, function(m, i) {
  _$jscoverage['/utils.js'].functionData[24]++;
  _$jscoverage['/utils.js'].lineData[241]++;
  ret[i] = Utils.createModuleInfo(m);
});
  _$jscoverage['/utils.js'].lineData[243]++;
  return ret;
}, 
  createModuleInfo: function(modName, cfg) {
  _$jscoverage['/utils.js'].functionData[25]++;
  _$jscoverage['/utils.js'].lineData[253]++;
  modName = addIndexAndRemoveJsExtFromName(modName);
  _$jscoverage['/utils.js'].lineData[255]++;
  var mods = Env.mods, module = mods[modName];
  _$jscoverage['/utils.js'].lineData[258]++;
  if (visit260_258_1(module)) {
    _$jscoverage['/utils.js'].lineData[259]++;
    return module;
  }
  _$jscoverage['/utils.js'].lineData[263]++;
  mods[modName] = module = new Loader.Module(mix({
  name: modName}, cfg));
  _$jscoverage['/utils.js'].lineData[267]++;
  return module;
}, 
  getModules: function(modNames) {
  _$jscoverage['/utils.js'].functionData[26]++;
  _$jscoverage['/utils.js'].lineData[276]++;
  var mods = [S], module, unalias, allOk, m, runtimeMods = Env.mods;
  _$jscoverage['/utils.js'].lineData[282]++;
  Utils.each(modNames, function(modName) {
  _$jscoverage['/utils.js'].functionData[27]++;
  _$jscoverage['/utils.js'].lineData[283]++;
  module = runtimeMods[modName];
  _$jscoverage['/utils.js'].lineData[284]++;
  if (visit261_284_1(!module || visit262_284_2(module.getType() !== 'css'))) {
    _$jscoverage['/utils.js'].lineData[285]++;
    unalias = Utils.unalias(modName);
    _$jscoverage['/utils.js'].lineData[286]++;
    allOk = true;
    _$jscoverage['/utils.js'].lineData[287]++;
    for (var i = 0; visit263_287_1(allOk && visit264_287_2(i < unalias.length)); i++) {
      _$jscoverage['/utils.js'].lineData[288]++;
      m = runtimeMods[unalias[i]];
      _$jscoverage['/utils.js'].lineData[290]++;
      allOk = visit265_290_1(m && visit266_290_2(m.status >= ATTACHING));
    }
    _$jscoverage['/utils.js'].lineData[292]++;
    if (visit267_292_1(allOk)) {
      _$jscoverage['/utils.js'].lineData[293]++;
      mods.push(runtimeMods[unalias[0]].exports);
    } else {
      _$jscoverage['/utils.js'].lineData[295]++;
      mods.push(null);
    }
  } else {
    _$jscoverage['/utils.js'].lineData[298]++;
    mods.push(undefined);
  }
});
  _$jscoverage['/utils.js'].lineData[302]++;
  return mods;
}, 
  attachModsRecursively: function(modNames) {
  _$jscoverage['/utils.js'].functionData[28]++;
  _$jscoverage['/utils.js'].lineData[310]++;
  var i, l = modNames.length;
  _$jscoverage['/utils.js'].lineData[312]++;
  for (i = 0; visit268_312_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[313]++;
    Utils.attachModRecursively(modNames[i]);
  }
}, 
  checkModsLoadRecursively: function(modNames, stack, errorList, cache) {
  _$jscoverage['/utils.js'].functionData[29]++;
  _$jscoverage['/utils.js'].lineData[319]++;
  stack = visit269_319_1(stack || []);
  _$jscoverage['/utils.js'].lineData[321]++;
  cache = visit270_321_1(cache || {});
  _$jscoverage['/utils.js'].lineData[322]++;
  var i, s = 1, l = modNames.length, stackDepth = stack.length;
  _$jscoverage['/utils.js'].lineData[326]++;
  for (i = 0; visit271_326_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[327]++;
    if (visit272_327_1(!s)) {
      _$jscoverage['/utils.js'].lineData[328]++;
      return !!s;
    }
    _$jscoverage['/utils.js'].lineData[330]++;
    s = Utils.checkModLoadRecursively(modNames[i], stack, errorList, cache);
    _$jscoverage['/utils.js'].lineData[331]++;
    stack.length = stackDepth;
  }
  _$jscoverage['/utils.js'].lineData[333]++;
  return !!s;
}, 
  checkModLoadRecursively: function(modName, stack, errorList, cache) {
  _$jscoverage['/utils.js'].functionData[30]++;
  _$jscoverage['/utils.js'].lineData[337]++;
  var mods = Env.mods, status, m = mods[modName];
  _$jscoverage['/utils.js'].lineData[340]++;
  if (visit273_340_1(modName in cache)) {
    _$jscoverage['/utils.js'].lineData[341]++;
    return cache[modName];
  }
  _$jscoverage['/utils.js'].lineData[343]++;
  if (visit274_343_1(!m)) {
    _$jscoverage['/utils.js'].lineData[344]++;
    cache[modName] = FALSE;
    _$jscoverage['/utils.js'].lineData[345]++;
    return FALSE;
  }
  _$jscoverage['/utils.js'].lineData[347]++;
  status = m.status;
  _$jscoverage['/utils.js'].lineData[348]++;
  if (visit275_348_1(status === ERROR)) {
    _$jscoverage['/utils.js'].lineData[349]++;
    errorList.push(m);
    _$jscoverage['/utils.js'].lineData[350]++;
    cache[modName] = FALSE;
    _$jscoverage['/utils.js'].lineData[351]++;
    return FALSE;
  }
  _$jscoverage['/utils.js'].lineData[353]++;
  if (visit276_353_1(status >= READY_TO_ATTACH)) {
    _$jscoverage['/utils.js'].lineData[354]++;
    cache[modName] = TRUE;
    _$jscoverage['/utils.js'].lineData[355]++;
    return TRUE;
  }
  _$jscoverage['/utils.js'].lineData[357]++;
  if (visit277_357_1(status !== LOADED)) {
    _$jscoverage['/utils.js'].lineData[358]++;
    cache[modName] = FALSE;
    _$jscoverage['/utils.js'].lineData[359]++;
    return FALSE;
  }
  _$jscoverage['/utils.js'].lineData[361]++;
  if (visit278_361_1('@DEBUG@')) {
    _$jscoverage['/utils.js'].lineData[362]++;
    if (visit279_362_1(stack[modName])) {
      _$jscoverage['/utils.js'].lineData[363]++;
      S.log('find cyclic dependency between mods: ' + stack, 'warn');
    } else {
      _$jscoverage['/utils.js'].lineData[365]++;
      stack.push(modName);
    }
  }
  _$jscoverage['/utils.js'].lineData[368]++;
  if (visit280_368_1(stack[modName])) {
    _$jscoverage['/utils.js'].lineData[369]++;
    cache[modName] = TRUE;
    _$jscoverage['/utils.js'].lineData[370]++;
    return TRUE;
  } else {
    _$jscoverage['/utils.js'].lineData[373]++;
    stack[modName] = 1;
  }
  _$jscoverage['/utils.js'].lineData[376]++;
  if (visit281_376_1(Utils.checkModsLoadRecursively(m.getNormalizedRequires(), stack, errorList, cache))) {
    _$jscoverage['/utils.js'].lineData[377]++;
    m.status = READY_TO_ATTACH;
    _$jscoverage['/utils.js'].lineData[378]++;
    cache[modName] = TRUE;
    _$jscoverage['/utils.js'].lineData[379]++;
    return TRUE;
  }
  _$jscoverage['/utils.js'].lineData[382]++;
  cache[modName] = FALSE;
  _$jscoverage['/utils.js'].lineData[383]++;
  return FALSE;
}, 
  attachModRecursively: function(modName) {
  _$jscoverage['/utils.js'].functionData[31]++;
  _$jscoverage['/utils.js'].lineData[391]++;
  var mods = Env.mods, status, m = mods[modName];
  _$jscoverage['/utils.js'].lineData[394]++;
  status = m.status;
  _$jscoverage['/utils.js'].lineData[396]++;
  if (visit282_396_1(status >= ATTACHING)) {
    _$jscoverage['/utils.js'].lineData[397]++;
    return;
  }
  _$jscoverage['/utils.js'].lineData[399]++;
  m.status = ATTACHING;
  _$jscoverage['/utils.js'].lineData[400]++;
  if (visit283_400_1(m.cjs)) {
    _$jscoverage['/utils.js'].lineData[402]++;
    Utils.attachMod(m);
  } else {
    _$jscoverage['/utils.js'].lineData[404]++;
    Utils.attachModsRecursively(m.getNormalizedRequires());
    _$jscoverage['/utils.js'].lineData[405]++;
    Utils.attachMod(m);
  }
}, 
  attachMod: function(module) {
  _$jscoverage['/utils.js'].functionData[32]++;
  _$jscoverage['/utils.js'].lineData[414]++;
  var factory = module.factory, exports;
  _$jscoverage['/utils.js'].lineData[417]++;
  if (visit284_417_1(typeof factory === 'function')) {
    _$jscoverage['/utils.js'].lineData[420]++;
    var require;
    _$jscoverage['/utils.js'].lineData[421]++;
    if (visit285_421_1(module.requires && visit286_421_2(module.requires.length && module.cjs))) {
      _$jscoverage['/utils.js'].lineData[422]++;
      require = bind(module.require, module);
    }
    _$jscoverage['/utils.js'].lineData[427]++;
    exports = factory.apply(module, (module.cjs ? [S, require, module.exports, module] : Utils.getModules(module.getRequiresWithAlias())));
    _$jscoverage['/utils.js'].lineData[431]++;
    if (visit287_431_1(exports !== undefined)) {
      _$jscoverage['/utils.js'].lineData[433]++;
      module.exports = exports;
    }
  } else {
    _$jscoverage['/utils.js'].lineData[437]++;
    module.exports = factory;
  }
  _$jscoverage['/utils.js'].lineData[440]++;
  module.status = ATTACHED;
}, 
  getModNamesAsArray: function(modNames) {
  _$jscoverage['/utils.js'].functionData[33]++;
  _$jscoverage['/utils.js'].lineData[449]++;
  if (visit288_449_1(typeof modNames === 'string')) {
    _$jscoverage['/utils.js'].lineData[450]++;
    modNames = modNames.replace(/\s+/g, '').split(',');
  }
  _$jscoverage['/utils.js'].lineData[452]++;
  return modNames;
}, 
  normalizeModNames: function(modNames, refModName) {
  _$jscoverage['/utils.js'].functionData[34]++;
  _$jscoverage['/utils.js'].lineData[466]++;
  return Utils.unalias(Utils.normalizeModNamesWithAlias(modNames, refModName));
}, 
  unalias: function(names) {
  _$jscoverage['/utils.js'].functionData[35]++;
  _$jscoverage['/utils.js'].lineData[475]++;
  var ret = [].concat(names), i, m, alias, ok = 0, j;
  _$jscoverage['/utils.js'].lineData[481]++;
  while (!ok) {
    _$jscoverage['/utils.js'].lineData[482]++;
    ok = 1;
    _$jscoverage['/utils.js'].lineData[483]++;
    for (i = ret.length - 1; visit289_483_1(i >= 0); i--) {
      _$jscoverage['/utils.js'].lineData[484]++;
      if (visit290_484_1((m = Utils.createModuleInfo(ret[i])) && (visit291_484_2((alias = m.getAlias()) !== undefined)))) {
        _$jscoverage['/utils.js'].lineData[485]++;
        ok = 0;
        _$jscoverage['/utils.js'].lineData[486]++;
        if (visit292_486_1(typeof alias === 'string')) {
          _$jscoverage['/utils.js'].lineData[487]++;
          alias = [alias];
        }
        _$jscoverage['/utils.js'].lineData[489]++;
        for (j = alias.length - 1; visit293_489_1(j >= 0); j--) {
          _$jscoverage['/utils.js'].lineData[490]++;
          if (visit294_490_1(!alias[j])) {
            _$jscoverage['/utils.js'].lineData[491]++;
            alias.splice(j, 1);
          }
        }
        _$jscoverage['/utils.js'].lineData[494]++;
        ret.splice.apply(ret, [i, 1].concat(addIndexAndRemoveJsExt(alias)));
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[498]++;
  return ret;
}, 
  normalizeModNamesWithAlias: function(modNames, refModName) {
  _$jscoverage['/utils.js'].functionData[36]++;
  _$jscoverage['/utils.js'].lineData[508]++;
  var ret = [], i, l;
  _$jscoverage['/utils.js'].lineData[510]++;
  if (visit295_510_1(modNames)) {
    _$jscoverage['/utils.js'].lineData[512]++;
    for (i = 0 , l = modNames.length; visit296_512_1(i < l); i++) {
      _$jscoverage['/utils.js'].lineData[515]++;
      if (visit297_515_1(modNames[i])) {
        _$jscoverage['/utils.js'].lineData[516]++;
        ret.push(pluginAlias(addIndexAndRemoveJsExt(modNames[i])));
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[521]++;
  if (visit298_521_1(refModName)) {
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
  if (visit299_539_1(module && visit300_539_2(module.factory !== undefined))) {
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
  for (i = str.length; visit301_568_1(--i > -1); ) {
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
    if (visit302_595_1(!(m = str.match(/^\s*["']([^'"\s]+)["']\s*$/)))) {
      _$jscoverage['/utils.js'].lineData[596]++;
      S.error('can not find required mod in require call: ' + str);
    }
    _$jscoverage['/utils.js'].lineData[598]++;
    return m[1];
  }
})(KISSY);
