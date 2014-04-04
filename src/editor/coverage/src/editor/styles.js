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
if (! _$jscoverage['/editor/styles.js']) {
  _$jscoverage['/editor/styles.js'] = {};
  _$jscoverage['/editor/styles.js'].lineData = [];
  _$jscoverage['/editor/styles.js'].lineData[10] = 0;
  _$jscoverage['/editor/styles.js'].lineData[11] = 0;
  _$jscoverage['/editor/styles.js'].lineData[12] = 0;
  _$jscoverage['/editor/styles.js'].lineData[13] = 0;
  _$jscoverage['/editor/styles.js'].lineData[14] = 0;
  _$jscoverage['/editor/styles.js'].lineData[15] = 0;
  _$jscoverage['/editor/styles.js'].lineData[17] = 0;
  _$jscoverage['/editor/styles.js'].lineData[65] = 0;
  _$jscoverage['/editor/styles.js'].lineData[80] = 0;
  _$jscoverage['/editor/styles.js'].lineData[83] = 0;
  _$jscoverage['/editor/styles.js'].lineData[86] = 0;
  _$jscoverage['/editor/styles.js'].lineData[87] = 0;
  _$jscoverage['/editor/styles.js'].lineData[88] = 0;
  _$jscoverage['/editor/styles.js'].lineData[90] = 0;
  _$jscoverage['/editor/styles.js'].lineData[91] = 0;
  _$jscoverage['/editor/styles.js'].lineData[94] = 0;
  _$jscoverage['/editor/styles.js'].lineData[105] = 0;
  _$jscoverage['/editor/styles.js'].lineData[106] = 0;
  _$jscoverage['/editor/styles.js'].lineData[107] = 0;
  _$jscoverage['/editor/styles.js'].lineData[108] = 0;
  _$jscoverage['/editor/styles.js'].lineData[111] = 0;
  _$jscoverage['/editor/styles.js'].lineData[113] = 0;
  _$jscoverage['/editor/styles.js'].lineData[118] = 0;
  _$jscoverage['/editor/styles.js'].lineData[123] = 0;
  _$jscoverage['/editor/styles.js'].lineData[125] = 0;
  _$jscoverage['/editor/styles.js'].lineData[129] = 0;
  _$jscoverage['/editor/styles.js'].lineData[131] = 0;
  _$jscoverage['/editor/styles.js'].lineData[133] = 0;
  _$jscoverage['/editor/styles.js'].lineData[134] = 0;
  _$jscoverage['/editor/styles.js'].lineData[136] = 0;
  _$jscoverage['/editor/styles.js'].lineData[138] = 0;
  _$jscoverage['/editor/styles.js'].lineData[141] = 0;
  _$jscoverage['/editor/styles.js'].lineData[145] = 0;
  _$jscoverage['/editor/styles.js'].lineData[149] = 0;
  _$jscoverage['/editor/styles.js'].lineData[153] = 0;
  _$jscoverage['/editor/styles.js'].lineData[154] = 0;
  _$jscoverage['/editor/styles.js'].lineData[167] = 0;
  _$jscoverage['/editor/styles.js'].lineData[168] = 0;
  _$jscoverage['/editor/styles.js'].lineData[177] = 0;
  _$jscoverage['/editor/styles.js'].lineData[178] = 0;
  _$jscoverage['/editor/styles.js'].lineData[180] = 0;
  _$jscoverage['/editor/styles.js'].lineData[181] = 0;
  _$jscoverage['/editor/styles.js'].lineData[185] = 0;
  _$jscoverage['/editor/styles.js'].lineData[187] = 0;
  _$jscoverage['/editor/styles.js'].lineData[188] = 0;
  _$jscoverage['/editor/styles.js'].lineData[191] = 0;
  _$jscoverage['/editor/styles.js'].lineData[193] = 0;
  _$jscoverage['/editor/styles.js'].lineData[194] = 0;
  _$jscoverage['/editor/styles.js'].lineData[196] = 0;
  _$jscoverage['/editor/styles.js'].lineData[197] = 0;
  _$jscoverage['/editor/styles.js'].lineData[200] = 0;
  _$jscoverage['/editor/styles.js'].lineData[201] = 0;
  _$jscoverage['/editor/styles.js'].lineData[205] = 0;
  _$jscoverage['/editor/styles.js'].lineData[206] = 0;
  _$jscoverage['/editor/styles.js'].lineData[208] = 0;
  _$jscoverage['/editor/styles.js'].lineData[209] = 0;
  _$jscoverage['/editor/styles.js'].lineData[213] = 0;
  _$jscoverage['/editor/styles.js'].lineData[214] = 0;
  _$jscoverage['/editor/styles.js'].lineData[217] = 0;
  _$jscoverage['/editor/styles.js'].lineData[222] = 0;
  _$jscoverage['/editor/styles.js'].lineData[226] = 0;
  _$jscoverage['/editor/styles.js'].lineData[228] = 0;
  _$jscoverage['/editor/styles.js'].lineData[229] = 0;
  _$jscoverage['/editor/styles.js'].lineData[231] = 0;
  _$jscoverage['/editor/styles.js'].lineData[232] = 0;
  _$jscoverage['/editor/styles.js'].lineData[233] = 0;
  _$jscoverage['/editor/styles.js'].lineData[234] = 0;
  _$jscoverage['/editor/styles.js'].lineData[235] = 0;
  _$jscoverage['/editor/styles.js'].lineData[236] = 0;
  _$jscoverage['/editor/styles.js'].lineData[243] = 0;
  _$jscoverage['/editor/styles.js'].lineData[246] = 0;
  _$jscoverage['/editor/styles.js'].lineData[251] = 0;
  _$jscoverage['/editor/styles.js'].lineData[252] = 0;
  _$jscoverage['/editor/styles.js'].lineData[253] = 0;
  _$jscoverage['/editor/styles.js'].lineData[254] = 0;
  _$jscoverage['/editor/styles.js'].lineData[255] = 0;
  _$jscoverage['/editor/styles.js'].lineData[256] = 0;
  _$jscoverage['/editor/styles.js'].lineData[257] = 0;
  _$jscoverage['/editor/styles.js'].lineData[259] = 0;
  _$jscoverage['/editor/styles.js'].lineData[265] = 0;
  _$jscoverage['/editor/styles.js'].lineData[273] = 0;
  _$jscoverage['/editor/styles.js'].lineData[275] = 0;
  _$jscoverage['/editor/styles.js'].lineData[280] = 0;
  _$jscoverage['/editor/styles.js'].lineData[282] = 0;
  _$jscoverage['/editor/styles.js'].lineData[283] = 0;
  _$jscoverage['/editor/styles.js'].lineData[285] = 0;
  _$jscoverage['/editor/styles.js'].lineData[287] = 0;
  _$jscoverage['/editor/styles.js'].lineData[290] = 0;
  _$jscoverage['/editor/styles.js'].lineData[291] = 0;
  _$jscoverage['/editor/styles.js'].lineData[294] = 0;
  _$jscoverage['/editor/styles.js'].lineData[295] = 0;
  _$jscoverage['/editor/styles.js'].lineData[299] = 0;
  _$jscoverage['/editor/styles.js'].lineData[304] = 0;
  _$jscoverage['/editor/styles.js'].lineData[306] = 0;
  _$jscoverage['/editor/styles.js'].lineData[307] = 0;
  _$jscoverage['/editor/styles.js'].lineData[308] = 0;
  _$jscoverage['/editor/styles.js'].lineData[311] = 0;
  _$jscoverage['/editor/styles.js'].lineData[314] = 0;
  _$jscoverage['/editor/styles.js'].lineData[317] = 0;
  _$jscoverage['/editor/styles.js'].lineData[318] = 0;
  _$jscoverage['/editor/styles.js'].lineData[321] = 0;
  _$jscoverage['/editor/styles.js'].lineData[323] = 0;
  _$jscoverage['/editor/styles.js'].lineData[327] = 0;
  _$jscoverage['/editor/styles.js'].lineData[328] = 0;
  _$jscoverage['/editor/styles.js'].lineData[330] = 0;
  _$jscoverage['/editor/styles.js'].lineData[337] = 0;
  _$jscoverage['/editor/styles.js'].lineData[338] = 0;
  _$jscoverage['/editor/styles.js'].lineData[341] = 0;
  _$jscoverage['/editor/styles.js'].lineData[344] = 0;
  _$jscoverage['/editor/styles.js'].lineData[345] = 0;
  _$jscoverage['/editor/styles.js'].lineData[348] = 0;
  _$jscoverage['/editor/styles.js'].lineData[349] = 0;
  _$jscoverage['/editor/styles.js'].lineData[354] = 0;
  _$jscoverage['/editor/styles.js'].lineData[355] = 0;
  _$jscoverage['/editor/styles.js'].lineData[359] = 0;
  _$jscoverage['/editor/styles.js'].lineData[362] = 0;
  _$jscoverage['/editor/styles.js'].lineData[363] = 0;
  _$jscoverage['/editor/styles.js'].lineData[366] = 0;
  _$jscoverage['/editor/styles.js'].lineData[369] = 0;
  _$jscoverage['/editor/styles.js'].lineData[370] = 0;
  _$jscoverage['/editor/styles.js'].lineData[375] = 0;
  _$jscoverage['/editor/styles.js'].lineData[376] = 0;
  _$jscoverage['/editor/styles.js'].lineData[377] = 0;
  _$jscoverage['/editor/styles.js'].lineData[383] = 0;
  _$jscoverage['/editor/styles.js'].lineData[384] = 0;
  _$jscoverage['/editor/styles.js'].lineData[387] = 0;
  _$jscoverage['/editor/styles.js'].lineData[390] = 0;
  _$jscoverage['/editor/styles.js'].lineData[393] = 0;
  _$jscoverage['/editor/styles.js'].lineData[395] = 0;
  _$jscoverage['/editor/styles.js'].lineData[399] = 0;
  _$jscoverage['/editor/styles.js'].lineData[401] = 0;
  _$jscoverage['/editor/styles.js'].lineData[403] = 0;
  _$jscoverage['/editor/styles.js'].lineData[404] = 0;
  _$jscoverage['/editor/styles.js'].lineData[405] = 0;
  _$jscoverage['/editor/styles.js'].lineData[407] = 0;
  _$jscoverage['/editor/styles.js'].lineData[411] = 0;
  _$jscoverage['/editor/styles.js'].lineData[412] = 0;
  _$jscoverage['/editor/styles.js'].lineData[415] = 0;
  _$jscoverage['/editor/styles.js'].lineData[417] = 0;
  _$jscoverage['/editor/styles.js'].lineData[418] = 0;
  _$jscoverage['/editor/styles.js'].lineData[420] = 0;
  _$jscoverage['/editor/styles.js'].lineData[421] = 0;
  _$jscoverage['/editor/styles.js'].lineData[423] = 0;
  _$jscoverage['/editor/styles.js'].lineData[425] = 0;
  _$jscoverage['/editor/styles.js'].lineData[431] = 0;
  _$jscoverage['/editor/styles.js'].lineData[433] = 0;
  _$jscoverage['/editor/styles.js'].lineData[436] = 0;
  _$jscoverage['/editor/styles.js'].lineData[439] = 0;
  _$jscoverage['/editor/styles.js'].lineData[443] = 0;
  _$jscoverage['/editor/styles.js'].lineData[446] = 0;
  _$jscoverage['/editor/styles.js'].lineData[449] = 0;
  _$jscoverage['/editor/styles.js'].lineData[450] = 0;
  _$jscoverage['/editor/styles.js'].lineData[451] = 0;
  _$jscoverage['/editor/styles.js'].lineData[452] = 0;
  _$jscoverage['/editor/styles.js'].lineData[453] = 0;
  _$jscoverage['/editor/styles.js'].lineData[454] = 0;
  _$jscoverage['/editor/styles.js'].lineData[456] = 0;
  _$jscoverage['/editor/styles.js'].lineData[459] = 0;
  _$jscoverage['/editor/styles.js'].lineData[463] = 0;
  _$jscoverage['/editor/styles.js'].lineData[466] = 0;
  _$jscoverage['/editor/styles.js'].lineData[471] = 0;
  _$jscoverage['/editor/styles.js'].lineData[474] = 0;
  _$jscoverage['/editor/styles.js'].lineData[475] = 0;
  _$jscoverage['/editor/styles.js'].lineData[477] = 0;
  _$jscoverage['/editor/styles.js'].lineData[479] = 0;
  _$jscoverage['/editor/styles.js'].lineData[485] = 0;
  _$jscoverage['/editor/styles.js'].lineData[486] = 0;
  _$jscoverage['/editor/styles.js'].lineData[491] = 0;
  _$jscoverage['/editor/styles.js'].lineData[492] = 0;
  _$jscoverage['/editor/styles.js'].lineData[493] = 0;
  _$jscoverage['/editor/styles.js'].lineData[495] = 0;
  _$jscoverage['/editor/styles.js'].lineData[497] = 0;
  _$jscoverage['/editor/styles.js'].lineData[500] = 0;
  _$jscoverage['/editor/styles.js'].lineData[501] = 0;
  _$jscoverage['/editor/styles.js'].lineData[503] = 0;
  _$jscoverage['/editor/styles.js'].lineData[508] = 0;
  _$jscoverage['/editor/styles.js'].lineData[509] = 0;
  _$jscoverage['/editor/styles.js'].lineData[510] = 0;
  _$jscoverage['/editor/styles.js'].lineData[512] = 0;
  _$jscoverage['/editor/styles.js'].lineData[522] = 0;
  _$jscoverage['/editor/styles.js'].lineData[526] = 0;
  _$jscoverage['/editor/styles.js'].lineData[527] = 0;
  _$jscoverage['/editor/styles.js'].lineData[529] = 0;
  _$jscoverage['/editor/styles.js'].lineData[532] = 0;
  _$jscoverage['/editor/styles.js'].lineData[536] = 0;
  _$jscoverage['/editor/styles.js'].lineData[537] = 0;
  _$jscoverage['/editor/styles.js'].lineData[538] = 0;
  _$jscoverage['/editor/styles.js'].lineData[539] = 0;
  _$jscoverage['/editor/styles.js'].lineData[543] = 0;
  _$jscoverage['/editor/styles.js'].lineData[544] = 0;
  _$jscoverage['/editor/styles.js'].lineData[545] = 0;
  _$jscoverage['/editor/styles.js'].lineData[548] = 0;
  _$jscoverage['/editor/styles.js'].lineData[549] = 0;
  _$jscoverage['/editor/styles.js'].lineData[550] = 0;
  _$jscoverage['/editor/styles.js'].lineData[551] = 0;
  _$jscoverage['/editor/styles.js'].lineData[552] = 0;
  _$jscoverage['/editor/styles.js'].lineData[554] = 0;
  _$jscoverage['/editor/styles.js'].lineData[560] = 0;
  _$jscoverage['/editor/styles.js'].lineData[561] = 0;
  _$jscoverage['/editor/styles.js'].lineData[563] = 0;
  _$jscoverage['/editor/styles.js'].lineData[566] = 0;
  _$jscoverage['/editor/styles.js'].lineData[567] = 0;
  _$jscoverage['/editor/styles.js'].lineData[568] = 0;
  _$jscoverage['/editor/styles.js'].lineData[570] = 0;
  _$jscoverage['/editor/styles.js'].lineData[573] = 0;
  _$jscoverage['/editor/styles.js'].lineData[574] = 0;
  _$jscoverage['/editor/styles.js'].lineData[577] = 0;
  _$jscoverage['/editor/styles.js'].lineData[579] = 0;
  _$jscoverage['/editor/styles.js'].lineData[581] = 0;
  _$jscoverage['/editor/styles.js'].lineData[583] = 0;
  _$jscoverage['/editor/styles.js'].lineData[584] = 0;
  _$jscoverage['/editor/styles.js'].lineData[586] = 0;
  _$jscoverage['/editor/styles.js'].lineData[591] = 0;
  _$jscoverage['/editor/styles.js'].lineData[592] = 0;
  _$jscoverage['/editor/styles.js'].lineData[593] = 0;
  _$jscoverage['/editor/styles.js'].lineData[597] = 0;
  _$jscoverage['/editor/styles.js'].lineData[600] = 0;
  _$jscoverage['/editor/styles.js'].lineData[601] = 0;
  _$jscoverage['/editor/styles.js'].lineData[605] = 0;
  _$jscoverage['/editor/styles.js'].lineData[611] = 0;
  _$jscoverage['/editor/styles.js'].lineData[612] = 0;
  _$jscoverage['/editor/styles.js'].lineData[614] = 0;
  _$jscoverage['/editor/styles.js'].lineData[615] = 0;
  _$jscoverage['/editor/styles.js'].lineData[616] = 0;
  _$jscoverage['/editor/styles.js'].lineData[618] = 0;
  _$jscoverage['/editor/styles.js'].lineData[622] = 0;
  _$jscoverage['/editor/styles.js'].lineData[623] = 0;
  _$jscoverage['/editor/styles.js'].lineData[624] = 0;
  _$jscoverage['/editor/styles.js'].lineData[628] = 0;
  _$jscoverage['/editor/styles.js'].lineData[638] = 0;
  _$jscoverage['/editor/styles.js'].lineData[648] = 0;
  _$jscoverage['/editor/styles.js'].lineData[651] = 0;
  _$jscoverage['/editor/styles.js'].lineData[652] = 0;
  _$jscoverage['/editor/styles.js'].lineData[653] = 0;
  _$jscoverage['/editor/styles.js'].lineData[654] = 0;
  _$jscoverage['/editor/styles.js'].lineData[655] = 0;
  _$jscoverage['/editor/styles.js'].lineData[664] = 0;
  _$jscoverage['/editor/styles.js'].lineData[673] = 0;
  _$jscoverage['/editor/styles.js'].lineData[674] = 0;
  _$jscoverage['/editor/styles.js'].lineData[679] = 0;
  _$jscoverage['/editor/styles.js'].lineData[681] = 0;
  _$jscoverage['/editor/styles.js'].lineData[694] = 0;
  _$jscoverage['/editor/styles.js'].lineData[704] = 0;
  _$jscoverage['/editor/styles.js'].lineData[707] = 0;
  _$jscoverage['/editor/styles.js'].lineData[711] = 0;
  _$jscoverage['/editor/styles.js'].lineData[714] = 0;
  _$jscoverage['/editor/styles.js'].lineData[718] = 0;
  _$jscoverage['/editor/styles.js'].lineData[722] = 0;
  _$jscoverage['/editor/styles.js'].lineData[724] = 0;
  _$jscoverage['/editor/styles.js'].lineData[728] = 0;
  _$jscoverage['/editor/styles.js'].lineData[737] = 0;
  _$jscoverage['/editor/styles.js'].lineData[741] = 0;
  _$jscoverage['/editor/styles.js'].lineData[742] = 0;
  _$jscoverage['/editor/styles.js'].lineData[743] = 0;
  _$jscoverage['/editor/styles.js'].lineData[745] = 0;
  _$jscoverage['/editor/styles.js'].lineData[746] = 0;
  _$jscoverage['/editor/styles.js'].lineData[749] = 0;
  _$jscoverage['/editor/styles.js'].lineData[751] = 0;
  _$jscoverage['/editor/styles.js'].lineData[753] = 0;
  _$jscoverage['/editor/styles.js'].lineData[761] = 0;
  _$jscoverage['/editor/styles.js'].lineData[763] = 0;
  _$jscoverage['/editor/styles.js'].lineData[764] = 0;
  _$jscoverage['/editor/styles.js'].lineData[767] = 0;
  _$jscoverage['/editor/styles.js'].lineData[769] = 0;
  _$jscoverage['/editor/styles.js'].lineData[771] = 0;
  _$jscoverage['/editor/styles.js'].lineData[776] = 0;
  _$jscoverage['/editor/styles.js'].lineData[777] = 0;
  _$jscoverage['/editor/styles.js'].lineData[778] = 0;
  _$jscoverage['/editor/styles.js'].lineData[782] = 0;
  _$jscoverage['/editor/styles.js'].lineData[785] = 0;
  _$jscoverage['/editor/styles.js'].lineData[787] = 0;
  _$jscoverage['/editor/styles.js'].lineData[791] = 0;
  _$jscoverage['/editor/styles.js'].lineData[795] = 0;
  _$jscoverage['/editor/styles.js'].lineData[798] = 0;
  _$jscoverage['/editor/styles.js'].lineData[806] = 0;
  _$jscoverage['/editor/styles.js'].lineData[807] = 0;
  _$jscoverage['/editor/styles.js'].lineData[820] = 0;
  _$jscoverage['/editor/styles.js'].lineData[821] = 0;
  _$jscoverage['/editor/styles.js'].lineData[822] = 0;
  _$jscoverage['/editor/styles.js'].lineData[823] = 0;
  _$jscoverage['/editor/styles.js'].lineData[824] = 0;
  _$jscoverage['/editor/styles.js'].lineData[829] = 0;
  _$jscoverage['/editor/styles.js'].lineData[833] = 0;
  _$jscoverage['/editor/styles.js'].lineData[834] = 0;
  _$jscoverage['/editor/styles.js'].lineData[835] = 0;
  _$jscoverage['/editor/styles.js'].lineData[837] = 0;
  _$jscoverage['/editor/styles.js'].lineData[841] = 0;
  _$jscoverage['/editor/styles.js'].lineData[846] = 0;
  _$jscoverage['/editor/styles.js'].lineData[848] = 0;
  _$jscoverage['/editor/styles.js'].lineData[851] = 0;
  _$jscoverage['/editor/styles.js'].lineData[852] = 0;
  _$jscoverage['/editor/styles.js'].lineData[856] = 0;
  _$jscoverage['/editor/styles.js'].lineData[864] = 0;
  _$jscoverage['/editor/styles.js'].lineData[865] = 0;
  _$jscoverage['/editor/styles.js'].lineData[867] = 0;
  _$jscoverage['/editor/styles.js'].lineData[868] = 0;
  _$jscoverage['/editor/styles.js'].lineData[871] = 0;
  _$jscoverage['/editor/styles.js'].lineData[872] = 0;
  _$jscoverage['/editor/styles.js'].lineData[873] = 0;
  _$jscoverage['/editor/styles.js'].lineData[881] = 0;
  _$jscoverage['/editor/styles.js'].lineData[885] = 0;
  _$jscoverage['/editor/styles.js'].lineData[886] = 0;
  _$jscoverage['/editor/styles.js'].lineData[887] = 0;
  _$jscoverage['/editor/styles.js'].lineData[890] = 0;
  _$jscoverage['/editor/styles.js'].lineData[900] = 0;
  _$jscoverage['/editor/styles.js'].lineData[901] = 0;
  _$jscoverage['/editor/styles.js'].lineData[902] = 0;
  _$jscoverage['/editor/styles.js'].lineData[903] = 0;
  _$jscoverage['/editor/styles.js'].lineData[904] = 0;
  _$jscoverage['/editor/styles.js'].lineData[905] = 0;
  _$jscoverage['/editor/styles.js'].lineData[906] = 0;
  _$jscoverage['/editor/styles.js'].lineData[908] = 0;
  _$jscoverage['/editor/styles.js'].lineData[910] = 0;
  _$jscoverage['/editor/styles.js'].lineData[912] = 0;
  _$jscoverage['/editor/styles.js'].lineData[913] = 0;
  _$jscoverage['/editor/styles.js'].lineData[919] = 0;
  _$jscoverage['/editor/styles.js'].lineData[922] = 0;
  _$jscoverage['/editor/styles.js'].lineData[923] = 0;
  _$jscoverage['/editor/styles.js'].lineData[926] = 0;
  _$jscoverage['/editor/styles.js'].lineData[927] = 0;
  _$jscoverage['/editor/styles.js'].lineData[929] = 0;
  _$jscoverage['/editor/styles.js'].lineData[937] = 0;
  _$jscoverage['/editor/styles.js'].lineData[944] = 0;
  _$jscoverage['/editor/styles.js'].lineData[945] = 0;
  _$jscoverage['/editor/styles.js'].lineData[950] = 0;
  _$jscoverage['/editor/styles.js'].lineData[951] = 0;
  _$jscoverage['/editor/styles.js'].lineData[953] = 0;
  _$jscoverage['/editor/styles.js'].lineData[955] = 0;
  _$jscoverage['/editor/styles.js'].lineData[958] = 0;
  _$jscoverage['/editor/styles.js'].lineData[959] = 0;
  _$jscoverage['/editor/styles.js'].lineData[962] = 0;
  _$jscoverage['/editor/styles.js'].lineData[963] = 0;
  _$jscoverage['/editor/styles.js'].lineData[965] = 0;
  _$jscoverage['/editor/styles.js'].lineData[967] = 0;
  _$jscoverage['/editor/styles.js'].lineData[970] = 0;
  _$jscoverage['/editor/styles.js'].lineData[971] = 0;
  _$jscoverage['/editor/styles.js'].lineData[975] = 0;
  _$jscoverage['/editor/styles.js'].lineData[976] = 0;
  _$jscoverage['/editor/styles.js'].lineData[978] = 0;
  _$jscoverage['/editor/styles.js'].lineData[979] = 0;
  _$jscoverage['/editor/styles.js'].lineData[983] = 0;
  _$jscoverage['/editor/styles.js'].lineData[986] = 0;
  _$jscoverage['/editor/styles.js'].lineData[987] = 0;
  _$jscoverage['/editor/styles.js'].lineData[992] = 0;
  _$jscoverage['/editor/styles.js'].lineData[993] = 0;
  _$jscoverage['/editor/styles.js'].lineData[997] = 0;
  _$jscoverage['/editor/styles.js'].lineData[998] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1000] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1001] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1012] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1014] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1015] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1018] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1021] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1025] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1026] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1027] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1029] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1031] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1033] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1036] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1037] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1038] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1040] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1041] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1043] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1047] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1050] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1054] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1057] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1058] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1059] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1062] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1063] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1065] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1067] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1072] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1082] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1084] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1085] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1086] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1088] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1090] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1094] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1095] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1097] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1098] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1104] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1105] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1106] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1107] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1109] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1114] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1117] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1118] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1126] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1127] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1128] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1131] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1134] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1137] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1138] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1142] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1143] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1144] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1145] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1146] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1149] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1150] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1152] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1155] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1156] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1162] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1165] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1169] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1171] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1175] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1179] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1183] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1185] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1189] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1195] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1199] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1200] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1211] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1214] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1216] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1218] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1219] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1223] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1226] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1228] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1231] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1233] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1239] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1242] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1243] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1244] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1245] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1249] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1250] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1256] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1257] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1262] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1264] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1265] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1266] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1267] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1268] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1281] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1282] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1285] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1286] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1287] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1289] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1290] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1298] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1301] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1307] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1309] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1310] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1311] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1313] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1314] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1315] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1319] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1325] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1329] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1332] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1335] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1338] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1340] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1342] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1343] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1346] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1347] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1353] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1355] = 0;
}
if (! _$jscoverage['/editor/styles.js'].functionData) {
  _$jscoverage['/editor/styles.js'].functionData = [];
  _$jscoverage['/editor/styles.js'].functionData[0] = 0;
  _$jscoverage['/editor/styles.js'].functionData[1] = 0;
  _$jscoverage['/editor/styles.js'].functionData[2] = 0;
  _$jscoverage['/editor/styles.js'].functionData[3] = 0;
  _$jscoverage['/editor/styles.js'].functionData[4] = 0;
  _$jscoverage['/editor/styles.js'].functionData[5] = 0;
  _$jscoverage['/editor/styles.js'].functionData[6] = 0;
  _$jscoverage['/editor/styles.js'].functionData[7] = 0;
  _$jscoverage['/editor/styles.js'].functionData[8] = 0;
  _$jscoverage['/editor/styles.js'].functionData[9] = 0;
  _$jscoverage['/editor/styles.js'].functionData[10] = 0;
  _$jscoverage['/editor/styles.js'].functionData[11] = 0;
  _$jscoverage['/editor/styles.js'].functionData[12] = 0;
  _$jscoverage['/editor/styles.js'].functionData[13] = 0;
  _$jscoverage['/editor/styles.js'].functionData[14] = 0;
  _$jscoverage['/editor/styles.js'].functionData[15] = 0;
  _$jscoverage['/editor/styles.js'].functionData[16] = 0;
  _$jscoverage['/editor/styles.js'].functionData[17] = 0;
  _$jscoverage['/editor/styles.js'].functionData[18] = 0;
  _$jscoverage['/editor/styles.js'].functionData[19] = 0;
  _$jscoverage['/editor/styles.js'].functionData[20] = 0;
  _$jscoverage['/editor/styles.js'].functionData[21] = 0;
  _$jscoverage['/editor/styles.js'].functionData[22] = 0;
  _$jscoverage['/editor/styles.js'].functionData[23] = 0;
  _$jscoverage['/editor/styles.js'].functionData[24] = 0;
  _$jscoverage['/editor/styles.js'].functionData[25] = 0;
  _$jscoverage['/editor/styles.js'].functionData[26] = 0;
  _$jscoverage['/editor/styles.js'].functionData[27] = 0;
  _$jscoverage['/editor/styles.js'].functionData[28] = 0;
  _$jscoverage['/editor/styles.js'].functionData[29] = 0;
  _$jscoverage['/editor/styles.js'].functionData[30] = 0;
  _$jscoverage['/editor/styles.js'].functionData[31] = 0;
  _$jscoverage['/editor/styles.js'].functionData[32] = 0;
  _$jscoverage['/editor/styles.js'].functionData[33] = 0;
  _$jscoverage['/editor/styles.js'].functionData[34] = 0;
  _$jscoverage['/editor/styles.js'].functionData[35] = 0;
  _$jscoverage['/editor/styles.js'].functionData[36] = 0;
  _$jscoverage['/editor/styles.js'].functionData[37] = 0;
  _$jscoverage['/editor/styles.js'].functionData[38] = 0;
  _$jscoverage['/editor/styles.js'].functionData[39] = 0;
  _$jscoverage['/editor/styles.js'].functionData[40] = 0;
}
if (! _$jscoverage['/editor/styles.js'].branchData) {
  _$jscoverage['/editor/styles.js'].branchData = {};
  _$jscoverage['/editor/styles.js'].branchData['88'] = [];
  _$jscoverage['/editor/styles.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['106'] = [];
  _$jscoverage['/editor/styles.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['111'] = [];
  _$jscoverage['/editor/styles.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['113'] = [];
  _$jscoverage['/editor/styles.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['113'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['134'] = [];
  _$jscoverage['/editor/styles.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['155'] = [];
  _$jscoverage['/editor/styles.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['157'] = [];
  _$jscoverage['/editor/styles.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['159'] = [];
  _$jscoverage['/editor/styles.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['169'] = [];
  _$jscoverage['/editor/styles.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['177'] = [];
  _$jscoverage['/editor/styles.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['185'] = [];
  _$jscoverage['/editor/styles.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['187'] = [];
  _$jscoverage['/editor/styles.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['193'] = [];
  _$jscoverage['/editor/styles.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['196'] = [];
  _$jscoverage['/editor/styles.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['200'] = [];
  _$jscoverage['/editor/styles.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['201'] = [];
  _$jscoverage['/editor/styles.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['201'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['204'] = [];
  _$jscoverage['/editor/styles.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['205'] = [];
  _$jscoverage['/editor/styles.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['208'] = [];
  _$jscoverage['/editor/styles.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['213'] = [];
  _$jscoverage['/editor/styles.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['224'] = [];
  _$jscoverage['/editor/styles.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['226'] = [];
  _$jscoverage['/editor/styles.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['228'] = [];
  _$jscoverage['/editor/styles.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['231'] = [];
  _$jscoverage['/editor/styles.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['232'] = [];
  _$jscoverage['/editor/styles.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['235'] = [];
  _$jscoverage['/editor/styles.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['243'] = [];
  _$jscoverage['/editor/styles.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['243'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['244'] = [];
  _$jscoverage['/editor/styles.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['244'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['244'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['244'][4] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['245'] = [];
  _$jscoverage['/editor/styles.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['251'] = [];
  _$jscoverage['/editor/styles.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['252'] = [];
  _$jscoverage['/editor/styles.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['255'] = [];
  _$jscoverage['/editor/styles.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['257'] = [];
  _$jscoverage['/editor/styles.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['257'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['257'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['257'][4] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['257'][5] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['257'][6] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['258'] = [];
  _$jscoverage['/editor/styles.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['275'] = [];
  _$jscoverage['/editor/styles.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['282'] = [];
  _$jscoverage['/editor/styles.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['285'] = [];
  _$jscoverage['/editor/styles.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['285'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['285'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['290'] = [];
  _$jscoverage['/editor/styles.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['290'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['294'] = [];
  _$jscoverage['/editor/styles.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['307'] = [];
  _$jscoverage['/editor/styles.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['314'] = [];
  _$jscoverage['/editor/styles.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['314'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['317'] = [];
  _$jscoverage['/editor/styles.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['327'] = [];
  _$jscoverage['/editor/styles.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['337'] = [];
  _$jscoverage['/editor/styles.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['354'] = [];
  _$jscoverage['/editor/styles.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['362'] = [];
  _$jscoverage['/editor/styles.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['375'] = [];
  _$jscoverage['/editor/styles.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['383'] = [];
  _$jscoverage['/editor/styles.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['417'] = [];
  _$jscoverage['/editor/styles.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['420'] = [];
  _$jscoverage['/editor/styles.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['449'] = [];
  _$jscoverage['/editor/styles.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['486'] = [];
  _$jscoverage['/editor/styles.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['487'] = [];
  _$jscoverage['/editor/styles.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['488'] = [];
  _$jscoverage['/editor/styles.js'].branchData['488'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['489'] = [];
  _$jscoverage['/editor/styles.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['491'] = [];
  _$jscoverage['/editor/styles.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['493'] = [];
  _$jscoverage['/editor/styles.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['501'] = [];
  _$jscoverage['/editor/styles.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['510'] = [];
  _$jscoverage['/editor/styles.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['510'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['511'] = [];
  _$jscoverage['/editor/styles.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['526'] = [];
  _$jscoverage['/editor/styles.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['538'] = [];
  _$jscoverage['/editor/styles.js'].branchData['538'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['549'] = [];
  _$jscoverage['/editor/styles.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['551'] = [];
  _$jscoverage['/editor/styles.js'].branchData['551'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['577'] = [];
  _$jscoverage['/editor/styles.js'].branchData['577'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['591'] = [];
  _$jscoverage['/editor/styles.js'].branchData['591'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['611'] = [];
  _$jscoverage['/editor/styles.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['614'] = [];
  _$jscoverage['/editor/styles.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['619'] = [];
  _$jscoverage['/editor/styles.js'].branchData['619'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['622'] = [];
  _$jscoverage['/editor/styles.js'].branchData['622'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['628'] = [];
  _$jscoverage['/editor/styles.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['629'] = [];
  _$jscoverage['/editor/styles.js'].branchData['629'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['630'] = [];
  _$jscoverage['/editor/styles.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['630'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['636'] = [];
  _$jscoverage['/editor/styles.js'].branchData['636'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['648'] = [];
  _$jscoverage['/editor/styles.js'].branchData['648'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['649'] = [];
  _$jscoverage['/editor/styles.js'].branchData['649'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['649'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['650'] = [];
  _$jscoverage['/editor/styles.js'].branchData['650'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['655'] = [];
  _$jscoverage['/editor/styles.js'].branchData['655'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['655'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['655'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['655'][4] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['656'] = [];
  _$jscoverage['/editor/styles.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['657'] = [];
  _$jscoverage['/editor/styles.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['664'] = [];
  _$jscoverage['/editor/styles.js'].branchData['664'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['665'] = [];
  _$jscoverage['/editor/styles.js'].branchData['665'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['665'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['665'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['679'] = [];
  _$jscoverage['/editor/styles.js'].branchData['679'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['679'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['680'] = [];
  _$jscoverage['/editor/styles.js'].branchData['680'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['680'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['695'] = [];
  _$jscoverage['/editor/styles.js'].branchData['695'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['696'] = [];
  _$jscoverage['/editor/styles.js'].branchData['696'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['696'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['698'] = [];
  _$jscoverage['/editor/styles.js'].branchData['698'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['698'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['703'] = [];
  _$jscoverage['/editor/styles.js'].branchData['703'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['722'] = [];
  _$jscoverage['/editor/styles.js'].branchData['722'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['722'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['741'] = [];
  _$jscoverage['/editor/styles.js'].branchData['741'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['741'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['741'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['742'] = [];
  _$jscoverage['/editor/styles.js'].branchData['742'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['745'] = [];
  _$jscoverage['/editor/styles.js'].branchData['745'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['749'] = [];
  _$jscoverage['/editor/styles.js'].branchData['749'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['763'] = [];
  _$jscoverage['/editor/styles.js'].branchData['763'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['767'] = [];
  _$jscoverage['/editor/styles.js'].branchData['767'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['776'] = [];
  _$jscoverage['/editor/styles.js'].branchData['776'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['785'] = [];
  _$jscoverage['/editor/styles.js'].branchData['785'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['806'] = [];
  _$jscoverage['/editor/styles.js'].branchData['806'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['851'] = [];
  _$jscoverage['/editor/styles.js'].branchData['851'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['856'] = [];
  _$jscoverage['/editor/styles.js'].branchData['856'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['856'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['864'] = [];
  _$jscoverage['/editor/styles.js'].branchData['864'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['864'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['864'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['867'] = [];
  _$jscoverage['/editor/styles.js'].branchData['867'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['869'] = [];
  _$jscoverage['/editor/styles.js'].branchData['869'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['871'] = [];
  _$jscoverage['/editor/styles.js'].branchData['871'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['885'] = [];
  _$jscoverage['/editor/styles.js'].branchData['885'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['888'] = [];
  _$jscoverage['/editor/styles.js'].branchData['888'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['900'] = [];
  _$jscoverage['/editor/styles.js'].branchData['900'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['904'] = [];
  _$jscoverage['/editor/styles.js'].branchData['904'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['906'] = [];
  _$jscoverage['/editor/styles.js'].branchData['906'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['918'] = [];
  _$jscoverage['/editor/styles.js'].branchData['918'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['923'] = [];
  _$jscoverage['/editor/styles.js'].branchData['923'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['925'] = [];
  _$jscoverage['/editor/styles.js'].branchData['925'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['927'] = [];
  _$jscoverage['/editor/styles.js'].branchData['927'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['950'] = [];
  _$jscoverage['/editor/styles.js'].branchData['950'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['953'] = [];
  _$jscoverage['/editor/styles.js'].branchData['953'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['953'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['954'] = [];
  _$jscoverage['/editor/styles.js'].branchData['954'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['958'] = [];
  _$jscoverage['/editor/styles.js'].branchData['958'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['962'] = [];
  _$jscoverage['/editor/styles.js'].branchData['962'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['965'] = [];
  _$jscoverage['/editor/styles.js'].branchData['965'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['965'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['966'] = [];
  _$jscoverage['/editor/styles.js'].branchData['966'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['970'] = [];
  _$jscoverage['/editor/styles.js'].branchData['970'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['975'] = [];
  _$jscoverage['/editor/styles.js'].branchData['975'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['978'] = [];
  _$jscoverage['/editor/styles.js'].branchData['978'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['987'] = [];
  _$jscoverage['/editor/styles.js'].branchData['987'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['993'] = [];
  _$jscoverage['/editor/styles.js'].branchData['993'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['994'] = [];
  _$jscoverage['/editor/styles.js'].branchData['994'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['994'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['997'] = [];
  _$jscoverage['/editor/styles.js'].branchData['997'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1002'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1002'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1012'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1012'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1012'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1037'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1037'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1040'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1040'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1047'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1047'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1047'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1048'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1048'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1048'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1049'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1049'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1049'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1049'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1059'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1059'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1065'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1065'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1085'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1085'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1094'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1094'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1105'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1105'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1106'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1106'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1127'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1127'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1134'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1134'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1137'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1137'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1142'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1142'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1149'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1149'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1162'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1162'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1165'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1165'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1170'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1170'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1179'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1179'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1184'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1184'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1203'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1203'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1203'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1205'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1205'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1205'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1207'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1207'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1214'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1214'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1214'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1214'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1214'][4] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1218'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1218'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1226'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1226'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1227'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1227'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1231'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1231'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1256'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1256'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1264'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1264'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1266'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1266'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1283'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1283'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1285'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1285'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1286'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1286'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1298'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1298'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1298'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1299'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1299'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1299'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1300'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1300'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1300'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1300'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1307'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1307'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1309'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1309'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1310'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1310'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1315'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1315'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1315'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1317'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1317'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1317'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1318'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1318'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1318'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1318'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1332'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1332'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1340'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1340'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1342'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1342'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1346'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1346'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1346'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1346'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1346'][4] = new BranchData();
}
_$jscoverage['/editor/styles.js'].branchData['1346'][4].init(262, 48, 'lastChild.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit1053_1346_4(result) {
  _$jscoverage['/editor/styles.js'].branchData['1346'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1346'][3].init(234, 24, 'firstChild !== lastChild');
function visit1052_1346_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1346'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1346'][2].init(234, 76, 'firstChild !== lastChild && lastChild.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit1051_1346_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1346'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1346'][1].init(221, 89, 'lastChild && firstChild !== lastChild && lastChild.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit1050_1346_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1346'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1342'][1].init(76, 49, 'firstChild.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit1049_1342_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1342'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1340'][1].init(309, 10, 'firstChild');
function visit1048_1340_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1340'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1332'][1].init(115, 27, '!element._4eHasAttributes()');
function visit1047_1332_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1332'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1318'][3].init(114, 31, 'actualStyleValue === styleValue');
function visit1046_1318_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1318'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1318'][2].init(80, 30, 'typeof styleValue === \'string\'');
function visit1045_1318_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1318'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1318'][1].init(80, 65, 'typeof styleValue === \'string\' && actualStyleValue === styleValue');
function visit1044_1318_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1318'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1317'][2].init(180, 51, 'styleValue.test && styleValue.test(actualAttrValue)');
function visit1043_1317_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1317'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1317'][1].init(101, 147, '(styleValue.test && styleValue.test(actualAttrValue)) || (typeof styleValue === \'string\' && actualStyleValue === styleValue)');
function visit1042_1317_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1317'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1315'][2].init(76, 19, 'styleValue === NULL');
function visit1041_1315_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1315'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1315'][1].init(76, 249, 'styleValue === NULL || (styleValue.test && styleValue.test(actualAttrValue)) || (typeof styleValue === \'string\' && actualStyleValue === styleValue)');
function visit1040_1315_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1315'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1310'][1].init(25, 17, 'i < styles.length');
function visit1039_1310_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1310'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1309'][1].init(1139, 6, 'styles');
function visit1038_1309_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1309'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1307'][1].init(1095, 29, 'overrides && overrides.styles');
function visit1037_1307_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1307'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1300'][3].init(108, 28, 'actualAttrValue === attValue');
function visit1036_1300_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1300'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1300'][2].init(76, 28, 'typeof attValue === \'string\'');
function visit1035_1300_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1300'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1300'][1].init(76, 60, 'typeof attValue === \'string\' && actualAttrValue === attValue');
function visit1034_1300_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1300'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1299'][2].init(521, 47, 'attValue.test && attValue.test(actualAttrValue)');
function visit1033_1299_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1299'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1299'][1].init(45, 138, '(attValue.test && attValue.test(actualAttrValue)) || (typeof attValue === \'string\' && actualAttrValue === attValue)');
function visit1032_1299_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1299'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1298'][2].init(473, 17, 'attValue === NULL');
function visit1031_1298_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1298'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1298'][1].init(473, 184, 'attValue === NULL || (attValue.test && attValue.test(actualAttrValue)) || (typeof attValue === \'string\' && actualAttrValue === attValue)');
function visit1030_1298_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1298'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1286'][1].init(25, 21, 'i < attributes.length');
function visit1029_1286_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1286'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1285'][1].init(106, 10, 'attributes');
function visit1028_1285_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1285'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1283'][1].init(48, 33, 'overrides && overrides.attributes');
function visit1027_1283_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1283'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1266'][1].init(114, 6, 'i >= 0');
function visit1026_1266_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1266'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1264'][1].init(18, 33, 'overrideElement !== style.element');
function visit1025_1264_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1264'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1256'][1].init(253, 8, '--i >= 0');
function visit1024_1256_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1256'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1231'][1].init(295, 41, 'removeEmpty || !!element.style(styleName)');
function visit1023_1231_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1231'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1227'][1].init(47, 82, 'element.style(styleName) !== normalizeProperty(styleName, styles[styleName], TRUE)');
function visit1022_1227_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1227'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1226'][1].init(94, 130, 'style._.definition.fullMatch && element.style(styleName) !== normalizeProperty(styleName, styles[styleName], TRUE)');
function visit1021_1226_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1218'][1].init(295, 41, 'removeEmpty || !!element.hasAttr(attName)');
function visit1020_1218_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1218'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1214'][4].init(136, 89, 'element.attr(attName) !== normalizeProperty(attName, attributes[attName])');
function visit1019_1214_4(result) {
  _$jscoverage['/editor/styles.js'].branchData['1214'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1214'][3].init(80, 19, 'attName === \'class\'');
function visit1018_1214_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1214'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1214'][2].init(80, 51, 'attName === \'class\' || style._.definition.fullMatch');
function visit1017_1214_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1214'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1214'][1].init(80, 145, '(attName === \'class\' || style._.definition.fullMatch) && element.attr(attName) !== normalizeProperty(attName, attributes[attName])');
function visit1016_1214_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1214'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1207'][1].init(445, 70, 'S.isEmptyObject(attributes) && S.isEmptyObject(styles)');
function visit1015_1207_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1207'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1205'][2].init(69, 20, 'overrides[\'*\'] || {}');
function visit1014_1205_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1205'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1205'][1].init(36, 53, 'overrides[element.nodeName()] || overrides[\'*\'] || {}');
function visit1013_1205_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1205'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1203'][2].init(73, 20, 'overrides[\'*\'] || {}');
function visit1012_1203_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1203'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1203'][1].init(40, 53, 'overrides[element.nodeName()] || overrides[\'*\'] || {}');
function visit1011_1203_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1203'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1184'][1].init(43, 23, 'overrideEl.styles || []');
function visit1010_1184_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1184'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1179'][1].init(1648, 6, 'styles');
function visit1009_1179_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1179'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1170'][1].init(47, 27, 'overrideEl.attributes || []');
function visit1008_1170_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1170'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1165'][1].init(935, 5, 'attrs');
function visit1007_1165_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1165'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1162'][1].init(837, 75, 'overrides[elementName] || (overrides[elementName] = {})');
function visit1006_1162_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1162'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1149'][1].init(229, 28, 'typeof override === \'string\'');
function visit1005_1149_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1149'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1142'][1].init(336, 21, 'i < definition.length');
function visit1004_1142_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1142'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1137'][1].init(170, 22, '!S.isArray(definition)');
function visit1003_1137_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1134'][1].init(201, 10, 'definition');
function visit1002_1134_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1134'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1127'][1].init(13, 17, 'style._.overrides');
function visit1001_1127_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1127'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1106'][1].init(17, 14, '!attribs.style');
function visit1000_1106_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1106'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1105'][1].init(623, 9, 'styleText');
function visit999_1105_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1105'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1094'][1].init(327, 12, 'styleAttribs');
function visit998_1094_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1094'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1085'][1].init(115, 7, 'attribs');
function visit997_1085_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1085'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1065'][1].init(320, 24, 'temp.style.cssText || \'\'');
function visit996_1065_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1065'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1059'][1].init(41, 25, 'nativeNormalize !== FALSE');
function visit995_1059_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1059'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1049'][3].init(29, 26, 'target[name] === \'inherit\'');
function visit994_1049_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1049'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1049'][2].init(89, 26, 'source[name] === \'inherit\'');
function visit993_1049_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1049'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1049'][1].init(52, 56, 'source[name] === \'inherit\' || target[name] === \'inherit\'');
function visit992_1049_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1049'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1048'][2].init(34, 29, 'target[name] === source[name]');
function visit991_1048_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1048'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1048'][1].init(34, 109, 'target[name] === source[name] || source[name] === \'inherit\' || target[name] === \'inherit\'');
function visit990_1048_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1048'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1047'][2].init(121, 145, 'name in target && (target[name] === source[name] || source[name] === \'inherit\' || target[name] === \'inherit\')');
function visit989_1047_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1047'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1047'][1].init(119, 148, '!(name in target && (target[name] === source[name] || source[name] === \'inherit\' || target[name] === \'inherit\'))');
function visit988_1047_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1047'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1040'][1].init(110, 19, 'target === \'string\'');
function visit987_1040_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1040'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1037'][1].init(13, 26, 'typeof source === \'string\'');
function visit986_1037_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1037'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1012'][2].init(874, 50, 'nextNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit985_1012_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1012'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1012'][1].init(874, 106, 'nextNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && nextNode.contains(startNode)');
function visit984_1012_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1012'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1002'][1].init(56, 51, 'overrides[currentNode.nodeName()] || overrides[\'*\']');
function visit983_1002_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1002'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['997'][1].init(97, 39, 'currentNode.nodeName() === this.element');
function visit982_997_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['997'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['994'][2].init(305, 53, 'currentNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit981_994_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['994'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['994'][1].init(37, 116, 'currentNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && this.checkElementRemovable(currentNode)');
function visit980_994_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['994'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['993'][1].init(265, 154, 'currentNode[0] && currentNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && this.checkElementRemovable(currentNode)');
function visit979_993_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['993'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['987'][1].init(1931, 29, 'currentNode[0] !== endNode[0]');
function visit978_987_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['987'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['978'][1].init(1235, 10, 'breakStart');
function visit977_978_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['978'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['975'][1].init(1131, 8, 'breakEnd');
function visit976_975_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['975'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['970'][1].init(242, 35, 'self.checkElementRemovable(element)');
function visit975_970_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['970'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['966'][1].init(52, 30, 'element === endPath.blockLimit');
function visit974_966_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['966'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['965'][2].init(77, 25, 'element === endPath.block');
function visit973_965_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['965'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['965'][1].init(77, 83, 'element === endPath.block || element === endPath.blockLimit');
function visit972_965_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['965'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['962'][1].init(710, 27, 'i < endPath.elements.length');
function visit971_962_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['962'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['958'][1].init(248, 35, 'self.checkElementRemovable(element)');
function visit970_958_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['958'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['954'][1].init(54, 32, 'element === startPath.blockLimit');
function visit969_954_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['954'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['953'][2].init(79, 27, 'element === startPath.block');
function visit968_953_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['953'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['953'][1].init(79, 87, 'element === startPath.block || element === startPath.blockLimit');
function visit967_953_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['953'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['950'][1].init(272, 29, 'i < startPath.elements.length');
function visit966_950_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['950'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['927'][1].init(1197, 9, 'UA.webkit');
function visit965_927_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['927'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['925'][1].init(63, 16, 'tmp === \'\\u200b\'');
function visit964_925_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['925'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['923'][1].init(1039, 80, '!tmp || tmp === \'\\u200b\'');
function visit963_923_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['923'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['918'][1].init(13, 33, 'boundaryElement.match === \'start\'');
function visit962_918_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['918'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['906'][1].init(186, 16, 'newElement.match');
function visit961_906_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['906'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['904'][1].init(85, 34, 'newElement.equals(boundaryElement)');
function visit960_904_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['904'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['900'][1].init(2568, 15, 'boundaryElement');
function visit959_900_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['900'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['888'][1].init(56, 49, '_overrides[element.nodeName()] || _overrides[\'*\']');
function visit958_888_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['888'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['885'][1].init(644, 35, 'element.nodeName() !== this.element');
function visit957_885_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['885'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['871'][1].init(248, 30, 'startOfElement || endOfElement');
function visit956_871_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['871'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['869'][1].init(107, 93, '!endOfElement && range.checkBoundaryOfElement(element, KER.START)');
function visit955_869_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['869'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['867'][1].init(540, 35, 'this.checkElementRemovable(element)');
function visit954_867_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['867'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['864'][3].init(439, 32, 'element === startPath.blockLimit');
function visit953_864_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['864'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['864'][2].init(408, 27, 'element === startPath.block');
function visit952_864_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['864'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['864'][1].init(408, 63, 'element === startPath.block || element === startPath.blockLimit');
function visit951_864_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['864'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['856'][2].init(218, 29, 'i < startPath.elements.length');
function visit950_856_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['856'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['856'][1].init(218, 66, 'i < startPath.elements.length && (element = startPath.elements[i])');
function visit949_856_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['856'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['851'][1].init(304, 15, 'range.collapsed');
function visit948_851_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['851'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['806'][1].init(1163, 6, '!UA.ie');
function visit947_806_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['806'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['785'][1].init(2628, 9, 'styleNode');
function visit946_785_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['785'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['776'][1].init(1489, 29, '!styleNode._4eHasAttributes()');
function visit945_776_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['776'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['767'][1].init(216, 36, 'styleNode.style(styleName) === value');
function visit944_767_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['767'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['763'][1].init(34, 73, 'removeList.blockedStyles[styleName] || !(value = parent.style(styleName))');
function visit943_763_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['763'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['749'][1].init(212, 33, 'styleNode.attr(attName) === value');
function visit942_749_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['749'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['745'][1].init(34, 69, 'removeList.blockedAttrs[attName] || !(value = parent.attr(styleName))');
function visit941_745_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['745'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['742'][1].init(25, 33, 'parent.nodeName() === elementName');
function visit940_742_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['742'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['741'][3].init(802, 25, 'styleNode[0] && parent[0]');
function visit939_741_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['741'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['741'][2].init(792, 35, 'parent && styleNode[0] && parent[0]');
function visit938_741_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['741'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['741'][1].init(779, 48, 'styleNode && parent && styleNode[0] && parent[0]');
function visit937_741_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['741'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['722'][2].init(6116, 35, 'styleRange && !styleRange.collapsed');
function visit936_722_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['722'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['722'][1].init(6102, 49, 'applyStyle && styleRange && !styleRange.collapsed');
function visit935_722_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['722'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['703'][1].init(398, 43, '!def.childRule || def.childRule(parentNode)');
function visit934_703_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['703'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['698'][2].init(1123, 394, '(parentNode._4ePosition(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) === (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit933_698_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['698'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['698'][1].init(146, 443, '(parentNode._4ePosition(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) === (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(parentNode))');
function visit932_698_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['698'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['696'][2].init(975, 105, '(parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]');
function visit931_696_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['696'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['696'][1].init(89, 590, '((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]) && (parentNode._4ePosition(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) === (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(parentNode))');
function visit930_696_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['696'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['695'][1].init(40, 680, '(applyStyle = !includedNode.next(notBookmark, 1)) && ((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]) && (parentNode._4ePosition(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) === (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(parentNode))');
function visit929_695_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['695'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['680'][2].init(67, 38, 'nodeType === Dom.NodeType.ELEMENT_NODE');
function visit928_680_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['680'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['680'][1].init(67, 75, 'nodeType === Dom.NodeType.ELEMENT_NODE && !currentNode[0].childNodes.length');
function visit927_680_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['680'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['679'][2].init(1351, 35, 'nodeType === Dom.NodeType.TEXT_NODE');
function visit926_679_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['679'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['679'][1].init(1351, 144, 'nodeType === Dom.NodeType.TEXT_NODE || (nodeType === Dom.NodeType.ELEMENT_NODE && !currentNode[0].childNodes.length)');
function visit925_679_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['679'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['665'][3].init(88, 404, '(currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit924_665_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['665'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['665'][2].init(56, 436, '!DTD.$removeEmpty[nodeName] || (currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit923_665_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['665'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['665'][1].init(43, 449, '!nodeName || !DTD.$removeEmpty[nodeName] || (currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit922_665_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['665'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['664'][1].init(505, 526, '!styleRange && (!nodeName || !DTD.$removeEmpty[nodeName] || (currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED))');
function visit921_664_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['664'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['657'][1].init(128, 48, '!def.parentRule || def.parentRule(currentParent)');
function visit920_657_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['655'][4].init(-1, 65, 'DTD[currentParent.nodeName()] || DTD.span');
function visit919_655_4(result) {
  _$jscoverage['/editor/styles.js'].branchData['655'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['656'][1].init(-1, 123, '(DTD[currentParent.nodeName()] || DTD.span)[elementName] || isUnknownElement');
function visit918_656_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['655'][3].init(1102, 178, '((DTD[currentParent.nodeName()] || DTD.span)[elementName] || isUnknownElement) && (!def.parentRule || def.parentRule(currentParent))');
function visit917_655_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['655'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['655'][2].init(1080, 200, 'currentParent[0] && ((DTD[currentParent.nodeName()] || DTD.span)[elementName] || isUnknownElement) && (!def.parentRule || def.parentRule(currentParent))');
function visit916_655_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['655'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['655'][1].init(1063, 217, 'currentParent && currentParent[0] && ((DTD[currentParent.nodeName()] || DTD.span)[elementName] || isUnknownElement) && (!def.parentRule || def.parentRule(currentParent))');
function visit915_655_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['655'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['650'][1].init(46, 40, 'currentParent.nodeName() === elementName');
function visit914_650_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['650'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['649'][2].init(649, 19, 'elementName === \'a\'');
function visit913_649_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['649'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['649'][1].init(40, 87, 'elementName === \'a\' && currentParent.nodeName() === elementName');
function visit912_649_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['649'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['648'][1].init(606, 128, 'currentParent && elementName === \'a\' && currentParent.nodeName() === elementName');
function visit911_648_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['648'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['636'][1].init(372, 44, '!def.childRule || def.childRule(currentNode)');
function visit910_636_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['636'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['630'][2].init(78, 344, '(currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit909_630_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['630'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['630'][1].init(41, 418, '(currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(currentNode))');
function visit908_630_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['629'][1].init(-1, 460, 'dtd[nodeName] && (currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(currentNode))');
function visit907_629_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['629'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['628'][1].init(475, 516, '!nodeName || (dtd[nodeName] && (currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(currentNode)))');
function visit906_628_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['622'][1].init(205, 44, 'nodeName && currentNode.attr(\'_ke_bookmark\')');
function visit905_622_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['619'][1].init(70, 38, 'nodeType === Dom.NodeType.ELEMENT_NODE');
function visit904_619_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['619'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['614'][1].init(54, 33, 'Dom.equals(currentNode, lastNode)');
function visit903_614_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['611'][1].init(1382, 29, 'currentNode && currentNode[0]');
function visit902_611_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['591'][1].init(756, 4, '!dtd');
function visit901_591_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['591'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['577'][1].init(78, 15, 'range.collapsed');
function visit900_577_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['551'][1].init(133, 7, '!offset');
function visit899_551_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['551'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['549'][1].init(21, 18, 'match.length === 1');
function visit898_549_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['538'][1].init(99, 19, 'i < preHTMLs.length');
function visit897_538_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['538'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['526'][1].init(803, 5, 'UA.ie');
function visit896_526_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['511'][1].init(95, 34, 'previousBlock.nodeName() === \'pre\'');
function visit895_511_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['510'][2].init(43, 130, '(previousBlock = preBlock._4ePreviousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && previousBlock.nodeName() === \'pre\'');
function visit894_510_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['510'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['510'][1].init(40, 134, '!((previousBlock = preBlock._4ePreviousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && previousBlock.nodeName() === \'pre\')');
function visit893_510_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['501'][1].init(605, 13, 'newBlockIsPre');
function visit892_501_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['493'][1].init(310, 9, 'isFromPre');
function visit891_493_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['491'][1].init(232, 7, 'isToPre');
function visit890_491_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['489'][1].init(179, 28, '!newBlockIsPre && blockIsPre');
function visit889_489_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['488'][1].init(125, 28, 'newBlockIsPre && !blockIsPre');
function visit888_488_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['488'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['487'][1].init(75, 26, 'block.nodeName === (\'pre\')');
function visit887_487_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['486'][1].init(29, 29, 'newBlock.nodeName === (\'pre\')');
function visit886_486_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['449'][1].init(939, 5, 'UA.ie');
function visit885_449_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['420'][1].init(104, 2, 'm2');
function visit884_420_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['417'][1].init(21, 2, 'm1');
function visit883_417_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['383'][1].init(362, 6, 'styles');
function visit882_383_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['375'][1].init(183, 10, 'attributes');
function visit881_375_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['362'][1].init(436, 7, 'element');
function visit880_362_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['354'][1].init(180, 19, 'elementName === \'*\'');
function visit879_354_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['337'][1].init(1069, 17, 'stylesText.length');
function visit878_337_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['327'][1].init(241, 22, 'styleVal === \'inherit\'');
function visit877_327_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['317'][1].init(395, 17, 'stylesText.length');
function visit876_317_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['314'][2].init(275, 62, 'styleDefinition.attributes && styleDefinition.attributes.style');
function visit875_314_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['314'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['314'][1].init(275, 69, '(styleDefinition.attributes && styleDefinition.attributes.style) || \'\'');
function visit874_314_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['307'][1].init(117, 9, 'stylesDef');
function visit873_307_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['294'][1].init(495, 41, 'this.checkElementRemovable(element, TRUE)');
function visit872_294_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['290'][2].init(324, 31, 'this.type === KEST.STYLE_OBJECT');
function visit871_290_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['290'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['290'][1].init(324, 74, 'this.type === KEST.STYLE_OBJECT && !(element.nodeName() in objectElements)');
function visit870_290_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['285'][3].init(113, 113, 'Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit)');
function visit869_285_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['285'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['285'][2].init(77, 31, 'this.type === KEST.STYLE_INLINE');
function visit868_285_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['285'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['285'][1].init(77, 150, 'this.type === KEST.STYLE_INLINE && (Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit))');
function visit867_285_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['282'][1].init(128, 19, 'i < elements.length');
function visit866_282_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['275'][1].init(77, 43, 'elementPath.block || elementPath.blockLimit');
function visit865_275_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['258'][1].init(101, 52, 'styleValue.test && styleValue.test(actualStyleValue)');
function visit864_258_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['257'][6].init(150, 31, 'actualStyleValue === styleValue');
function visit863_257_6(result) {
  _$jscoverage['/editor/styles.js'].branchData['257'][6].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['257'][5].init(116, 30, 'typeof styleValue === \'string\'');
function visit862_257_5(result) {
  _$jscoverage['/editor/styles.js'].branchData['257'][5].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['257'][4].init(116, 65, 'typeof styleValue === \'string\' && actualStyleValue === styleValue');
function visit861_257_4(result) {
  _$jscoverage['/editor/styles.js'].branchData['257'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['257'][3].init(116, 154, '(typeof styleValue === \'string\' && actualStyleValue === styleValue) || styleValue.test && styleValue.test(actualStyleValue)');
function visit860_257_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['257'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['257'][2].init(92, 19, 'styleValue === NULL');
function visit859_257_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['257'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['257'][1].init(92, 178, 'styleValue === NULL || (typeof styleValue === \'string\' && actualStyleValue === styleValue) || styleValue.test && styleValue.test(actualStyleValue)');
function visit858_257_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['255'][1].init(154, 16, 'actualStyleValue');
function visit857_255_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['252'][1].init(33, 17, 'i < styles.length');
function visit856_252_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['251'][1].init(1363, 6, 'styles');
function visit855_251_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['245'][1].init(96, 47, 'attValue.test && attValue.test(actualAttrValue)');
function visit854_245_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['244'][4].init(620, 28, 'actualAttrValue === attValue');
function visit853_244_4(result) {
  _$jscoverage['/editor/styles.js'].branchData['244'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['244'][3].init(588, 28, 'typeof attValue === \'string\'');
function visit852_244_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['244'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['244'][2].init(588, 60, 'typeof attValue === \'string\' && actualAttrValue === attValue');
function visit851_244_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['244'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['244'][1].init(53, 144, '(typeof attValue === \'string\' && actualAttrValue === attValue) || attValue.test && attValue.test(actualAttrValue)');
function visit850_244_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['243'][2].init(532, 17, 'attValue === NULL');
function visit849_243_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['243'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['243'][1].init(532, 198, 'attValue === NULL || (typeof attValue === \'string\' && actualAttrValue === attValue) || attValue.test && attValue.test(actualAttrValue)');
function visit848_243_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['235'][1].init(147, 15, 'actualAttrValue');
function visit847_235_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['232'][1].init(33, 18, 'i < attribs.length');
function visit846_232_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['231'][1].init(234, 7, 'attribs');
function visit845_231_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['228'][1].init(96, 63, '!(attribs = override.attributes) && !(styles = override.styles)');
function visit844_228_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['226'][1].init(1727, 8, 'override');
function visit843_226_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['224'][1].init(81, 47, 'overrides[element.nodeName()] || overrides[\'*\']');
function visit842_224_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['213'][1].init(769, 9, 'fullMatch');
function visit841_213_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['208'][1].init(595, 9, 'fullMatch');
function visit840_208_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['205'][1].init(33, 10, '!fullMatch');
function visit839_205_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['204'][1].init(182, 32, 'attribs[attName] === elementAttr');
function visit838_204_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['201'][2].init(219, 19, 'attName === \'style\'');
function visit837_201_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['201'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['201'][1].init(219, 215, 'attName === \'style\' ? compareCssText(attribs[attName], normalizeCssText(elementAttr, FALSE)) : attribs[attName] === elementAttr');
function visit836_201_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['200'][1].init(162, 27, 'element.attr(attName) || \'\'');
function visit835_200_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['196'][1].init(30, 21, 'attName === \'_length\'');
function visit834_196_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['193'][1].init(262, 15, 'attribs._length');
function visit833_193_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['187'][1].init(85, 41, '!fullMatch && !element._4eHasAttributes()');
function visit832_187_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['185'][1].init(255, 35, 'element.nodeName() === this.element');
function visit831_185_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['177'][1].init(17, 8, '!element');
function visit830_177_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['169'][1].init(38, 31, 'self.type === KEST.STYLE_INLINE');
function visit829_169_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['159'][1].init(90, 31, 'self.type === KEST.STYLE_OBJECT');
function visit828_159_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['157'][1].init(92, 30, 'self.type === KEST.STYLE_BLOCK');
function visit827_157_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['155'][1].init(35, 31, 'this.type === KEST.STYLE_INLINE');
function visit826_155_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['134'][1].init(447, 17, 'i < ranges.length');
function visit825_134_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['113'][2].init(297, 19, 'element === \'#text\'');
function visit824_113_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['113'][1].init(297, 45, 'element === \'#text\' || blockElements[element]');
function visit823_113_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['111'][1].init(216, 30, 'styleDefinition.element || \'*\'');
function visit822_111_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['106'][1].init(13, 15, 'variablesValues');
function visit821_106_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['88'][1].init(17, 32, 'typeof (list[item]) === \'string\'');
function visit820_88_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/styles.js'].functionData[0]++;
  _$jscoverage['/editor/styles.js'].lineData[11]++;
  var Node = require('node');
  _$jscoverage['/editor/styles.js'].lineData[12]++;
  var KESelection = require('./selection');
  _$jscoverage['/editor/styles.js'].lineData[13]++;
  var KERange = require('./range');
  _$jscoverage['/editor/styles.js'].lineData[14]++;
  var Editor = require('./base');
  _$jscoverage['/editor/styles.js'].lineData[15]++;
  var ElementPath = require('./elementPath');
  _$jscoverage['/editor/styles.js'].lineData[17]++;
  var TRUE = true, FALSE = false, NULL = null, $ = S.all, Dom = S.require('dom'), KER = Editor.RangeType, KEP = Editor.PositionType, KEST, UA = S.UA, blockElements = {
  address: 1, 
  div: 1, 
  h1: 1, 
  h2: 1, 
  h3: 1, 
  h4: 1, 
  h5: 1, 
  h6: 1, 
  p: 1, 
  pre: 1}, DTD = Editor.XHTML_DTD, objectElements = {
  embed: 1, 
  hr: 1, 
  img: 1, 
  li: 1, 
  object: 1, 
  ol: 1, 
  table: 1, 
  td: 1, 
  tr: 1, 
  th: 1, 
  ul: 1, 
  dl: 1, 
  dt: 1, 
  dd: 1, 
  form: 1}, semicolonFixRegex = /\s*(?:;\s*|$)/g, varRegex = /#\((.+?)\)/g;
  _$jscoverage['/editor/styles.js'].lineData[65]++;
  Editor.StyleType = KEST = {
  STYLE_BLOCK: 1, 
  STYLE_INLINE: 2, 
  STYLE_OBJECT: 3};
  _$jscoverage['/editor/styles.js'].lineData[80]++;
  function notBookmark(node) {
    _$jscoverage['/editor/styles.js'].functionData[1]++;
    _$jscoverage['/editor/styles.js'].lineData[83]++;
    return !Dom.attr(node, '_ke_bookmark');
  }
  _$jscoverage['/editor/styles.js'].lineData[86]++;
  function replaceVariables(list, variablesValues) {
    _$jscoverage['/editor/styles.js'].functionData[2]++;
    _$jscoverage['/editor/styles.js'].lineData[87]++;
    for (var item in list) {
      _$jscoverage['/editor/styles.js'].lineData[88]++;
      if (visit820_88_1(typeof (list[item]) === 'string')) {
        _$jscoverage['/editor/styles.js'].lineData[90]++;
        list[item] = list[item].replace(varRegex, function(match, varName) {
  _$jscoverage['/editor/styles.js'].functionData[3]++;
  _$jscoverage['/editor/styles.js'].lineData[91]++;
  return variablesValues[varName];
});
      } else {
        _$jscoverage['/editor/styles.js'].lineData[94]++;
        replaceVariables(list[item], variablesValues);
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[105]++;
  function KEStyle(styleDefinition, variablesValues) {
    _$jscoverage['/editor/styles.js'].functionData[4]++;
    _$jscoverage['/editor/styles.js'].lineData[106]++;
    if (visit821_106_1(variablesValues)) {
      _$jscoverage['/editor/styles.js'].lineData[107]++;
      styleDefinition = S.clone(styleDefinition);
      _$jscoverage['/editor/styles.js'].lineData[108]++;
      replaceVariables(styleDefinition, variablesValues);
    }
    _$jscoverage['/editor/styles.js'].lineData[111]++;
    var element = this.element = this.element = (visit822_111_1(styleDefinition.element || '*')).toLowerCase();
    _$jscoverage['/editor/styles.js'].lineData[113]++;
    this.type = this.type = (visit823_113_1(visit824_113_2(element === '#text') || blockElements[element])) ? KEST.STYLE_BLOCK : objectElements[element] ? KEST.STYLE_OBJECT : KEST.STYLE_INLINE;
    _$jscoverage['/editor/styles.js'].lineData[118]++;
    this._ = {
  definition: styleDefinition};
  }
  _$jscoverage['/editor/styles.js'].lineData[123]++;
  function applyStyle(document, remove) {
    _$jscoverage['/editor/styles.js'].functionData[5]++;
    _$jscoverage['/editor/styles.js'].lineData[125]++;
    var self = this, func = remove ? self.removeFromRange : self.applyToRange;
    _$jscoverage['/editor/styles.js'].lineData[129]++;
    document.body.focus();
    _$jscoverage['/editor/styles.js'].lineData[131]++;
    var selection = new KESelection(document);
    _$jscoverage['/editor/styles.js'].lineData[133]++;
    var ranges = selection.getRanges();
    _$jscoverage['/editor/styles.js'].lineData[134]++;
    for (var i = 0; visit825_134_1(i < ranges.length); i++) {
      _$jscoverage['/editor/styles.js'].lineData[136]++;
      func.call(self, ranges[i]);
    }
    _$jscoverage['/editor/styles.js'].lineData[138]++;
    selection.selectRanges(ranges);
  }
  _$jscoverage['/editor/styles.js'].lineData[141]++;
  KEStyle.prototype = {
  constructor: KEStyle, 
  apply: function(document) {
  _$jscoverage['/editor/styles.js'].functionData[6]++;
  _$jscoverage['/editor/styles.js'].lineData[145]++;
  applyStyle.call(this, document, FALSE);
}, 
  remove: function(document) {
  _$jscoverage['/editor/styles.js'].functionData[7]++;
  _$jscoverage['/editor/styles.js'].lineData[149]++;
  applyStyle.call(this, document, TRUE);
}, 
  applyToRange: function(range) {
  _$jscoverage['/editor/styles.js'].functionData[8]++;
  _$jscoverage['/editor/styles.js'].lineData[153]++;
  var self = this;
  _$jscoverage['/editor/styles.js'].lineData[154]++;
  return (self.applyToRange = visit826_155_1(this.type === KEST.STYLE_INLINE) ? applyInlineStyle : visit827_157_1(self.type === KEST.STYLE_BLOCK) ? applyBlockStyle : visit828_159_1(self.type === KEST.STYLE_OBJECT) ? NULL : NULL).call(self, range);
}, 
  removeFromRange: function(range) {
  _$jscoverage['/editor/styles.js'].functionData[9]++;
  _$jscoverage['/editor/styles.js'].lineData[167]++;
  var self = this;
  _$jscoverage['/editor/styles.js'].lineData[168]++;
  return (self.removeFromRange = visit829_169_1(self.type === KEST.STYLE_INLINE) ? removeInlineStyle : NULL).call(self, range);
}, 
  checkElementRemovable: function(element, fullMatch) {
  _$jscoverage['/editor/styles.js'].functionData[10]++;
  _$jscoverage['/editor/styles.js'].lineData[177]++;
  if (visit830_177_1(!element)) {
    _$jscoverage['/editor/styles.js'].lineData[178]++;
    return FALSE;
  }
  _$jscoverage['/editor/styles.js'].lineData[180]++;
  var attName;
  _$jscoverage['/editor/styles.js'].lineData[181]++;
  var def = this._.definition, attribs, styles;
  _$jscoverage['/editor/styles.js'].lineData[185]++;
  if (visit831_185_1(element.nodeName() === this.element)) {
    _$jscoverage['/editor/styles.js'].lineData[187]++;
    if (visit832_187_1(!fullMatch && !element._4eHasAttributes())) {
      _$jscoverage['/editor/styles.js'].lineData[188]++;
      return TRUE;
    }
    _$jscoverage['/editor/styles.js'].lineData[191]++;
    attribs = getAttributesForComparison(def);
    _$jscoverage['/editor/styles.js'].lineData[193]++;
    if (visit833_193_1(attribs._length)) {
      _$jscoverage['/editor/styles.js'].lineData[194]++;
      for (attName in attribs) {
        _$jscoverage['/editor/styles.js'].lineData[196]++;
        if (visit834_196_1(attName === '_length')) {
          _$jscoverage['/editor/styles.js'].lineData[197]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[200]++;
        var elementAttr = visit835_200_1(element.attr(attName) || '');
        _$jscoverage['/editor/styles.js'].lineData[201]++;
        if (visit836_201_1(visit837_201_2(attName === 'style') ? compareCssText(attribs[attName], normalizeCssText(elementAttr, FALSE)) : visit838_204_1(attribs[attName] === elementAttr))) {
          _$jscoverage['/editor/styles.js'].lineData[205]++;
          if (visit839_205_1(!fullMatch)) {
            _$jscoverage['/editor/styles.js'].lineData[206]++;
            return TRUE;
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[208]++;
          if (visit840_208_1(fullMatch)) {
            _$jscoverage['/editor/styles.js'].lineData[209]++;
            return FALSE;
          }
        }
      }
      _$jscoverage['/editor/styles.js'].lineData[213]++;
      if (visit841_213_1(fullMatch)) {
        _$jscoverage['/editor/styles.js'].lineData[214]++;
        return TRUE;
      }
    } else {
      _$jscoverage['/editor/styles.js'].lineData[217]++;
      return TRUE;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[222]++;
  var overrides = getOverrides(this), i, override = visit842_224_1(overrides[element.nodeName()] || overrides['*']);
  _$jscoverage['/editor/styles.js'].lineData[226]++;
  if (visit843_226_1(override)) {
    _$jscoverage['/editor/styles.js'].lineData[228]++;
    if (visit844_228_1(!(attribs = override.attributes) && !(styles = override.styles))) {
      _$jscoverage['/editor/styles.js'].lineData[229]++;
      return TRUE;
    }
    _$jscoverage['/editor/styles.js'].lineData[231]++;
    if (visit845_231_1(attribs)) {
      _$jscoverage['/editor/styles.js'].lineData[232]++;
      for (i = 0; visit846_232_1(i < attribs.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[233]++;
        attName = attribs[i][0];
        _$jscoverage['/editor/styles.js'].lineData[234]++;
        var actualAttrValue = element.attr(attName);
        _$jscoverage['/editor/styles.js'].lineData[235]++;
        if (visit847_235_1(actualAttrValue)) {
          _$jscoverage['/editor/styles.js'].lineData[236]++;
          var attValue = attribs[i][1];
          _$jscoverage['/editor/styles.js'].lineData[243]++;
          if (visit848_243_1(visit849_243_2(attValue === NULL) || visit850_244_1((visit851_244_2(visit852_244_3(typeof attValue === 'string') && visit853_244_4(actualAttrValue === attValue))) || visit854_245_1(attValue.test && attValue.test(actualAttrValue))))) {
            _$jscoverage['/editor/styles.js'].lineData[246]++;
            return TRUE;
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[251]++;
    if (visit855_251_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[252]++;
      for (i = 0; visit856_252_1(i < styles.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[253]++;
        var styleName = styles[i][0];
        _$jscoverage['/editor/styles.js'].lineData[254]++;
        var actualStyleValue = element.css(styleName);
        _$jscoverage['/editor/styles.js'].lineData[255]++;
        if (visit857_255_1(actualStyleValue)) {
          _$jscoverage['/editor/styles.js'].lineData[256]++;
          var styleValue = styles[i][1];
          _$jscoverage['/editor/styles.js'].lineData[257]++;
          if (visit858_257_1(visit859_257_2(styleValue === NULL) || visit860_257_3((visit861_257_4(visit862_257_5(typeof styleValue === 'string') && visit863_257_6(actualStyleValue === styleValue))) || visit864_258_1(styleValue.test && styleValue.test(actualStyleValue))))) {
            _$jscoverage['/editor/styles.js'].lineData[259]++;
            return TRUE;
          }
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[265]++;
  return FALSE;
}, 
  checkActive: function(elementPath) {
  _$jscoverage['/editor/styles.js'].functionData[11]++;
  _$jscoverage['/editor/styles.js'].lineData[273]++;
  switch (this.type) {
    case KEST.STYLE_BLOCK:
      _$jscoverage['/editor/styles.js'].lineData[275]++;
      return this.checkElementRemovable(visit865_275_1(elementPath.block || elementPath.blockLimit), TRUE);
    case KEST.STYLE_OBJECT:
    case KEST.STYLE_INLINE:
      _$jscoverage['/editor/styles.js'].lineData[280]++;
      var elements = elementPath.elements;
      _$jscoverage['/editor/styles.js'].lineData[282]++;
      for (var i = 0, element; visit866_282_1(i < elements.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[283]++;
        element = elements[i];
        _$jscoverage['/editor/styles.js'].lineData[285]++;
        if (visit867_285_1(visit868_285_2(this.type === KEST.STYLE_INLINE) && (visit869_285_3(Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit))))) {
          _$jscoverage['/editor/styles.js'].lineData[287]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[290]++;
        if (visit870_290_1(visit871_290_2(this.type === KEST.STYLE_OBJECT) && !(element.nodeName() in objectElements))) {
          _$jscoverage['/editor/styles.js'].lineData[291]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[294]++;
        if (visit872_294_1(this.checkElementRemovable(element, TRUE))) {
          _$jscoverage['/editor/styles.js'].lineData[295]++;
          return TRUE;
        }
      }
  }
  _$jscoverage['/editor/styles.js'].lineData[299]++;
  return FALSE;
}};
  _$jscoverage['/editor/styles.js'].lineData[304]++;
  KEStyle.getStyleText = function(styleDefinition) {
  _$jscoverage['/editor/styles.js'].functionData[12]++;
  _$jscoverage['/editor/styles.js'].lineData[306]++;
  var stylesDef = styleDefinition._ST;
  _$jscoverage['/editor/styles.js'].lineData[307]++;
  if (visit873_307_1(stylesDef)) {
    _$jscoverage['/editor/styles.js'].lineData[308]++;
    return stylesDef;
  }
  _$jscoverage['/editor/styles.js'].lineData[311]++;
  stylesDef = styleDefinition.styles;
  _$jscoverage['/editor/styles.js'].lineData[314]++;
  var stylesText = visit874_314_1((visit875_314_2(styleDefinition.attributes && styleDefinition.attributes.style)) || ''), specialStylesText = '';
  _$jscoverage['/editor/styles.js'].lineData[317]++;
  if (visit876_317_1(stylesText.length)) {
    _$jscoverage['/editor/styles.js'].lineData[318]++;
    stylesText = stylesText.replace(semicolonFixRegex, ';');
  }
  _$jscoverage['/editor/styles.js'].lineData[321]++;
  for (var style in stylesDef) {
    _$jscoverage['/editor/styles.js'].lineData[323]++;
    var styleVal = stylesDef[style], text = (style + ':' + styleVal).replace(semicolonFixRegex, ';');
    _$jscoverage['/editor/styles.js'].lineData[327]++;
    if (visit877_327_1(styleVal === 'inherit')) {
      _$jscoverage['/editor/styles.js'].lineData[328]++;
      specialStylesText += text;
    } else {
      _$jscoverage['/editor/styles.js'].lineData[330]++;
      stylesText += text;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[337]++;
  if (visit878_337_1(stylesText.length)) {
    _$jscoverage['/editor/styles.js'].lineData[338]++;
    stylesText = normalizeCssText(stylesText);
  }
  _$jscoverage['/editor/styles.js'].lineData[341]++;
  stylesText += specialStylesText;
  _$jscoverage['/editor/styles.js'].lineData[344]++;
  styleDefinition._ST = stylesText;
  _$jscoverage['/editor/styles.js'].lineData[345]++;
  return stylesText;
};
  _$jscoverage['/editor/styles.js'].lineData[348]++;
  function getElement(style, targetDocument, element) {
    _$jscoverage['/editor/styles.js'].functionData[13]++;
    _$jscoverage['/editor/styles.js'].lineData[349]++;
    var el, elementName = style.element;
    _$jscoverage['/editor/styles.js'].lineData[354]++;
    if (visit879_354_1(elementName === '*')) {
      _$jscoverage['/editor/styles.js'].lineData[355]++;
      elementName = 'span';
    }
    _$jscoverage['/editor/styles.js'].lineData[359]++;
    el = new Node(targetDocument.createElement(elementName));
    _$jscoverage['/editor/styles.js'].lineData[362]++;
    if (visit880_362_1(element)) {
      _$jscoverage['/editor/styles.js'].lineData[363]++;
      element._4eCopyAttributes(el);
    }
    _$jscoverage['/editor/styles.js'].lineData[366]++;
    return setupElement(el, style);
  }
  _$jscoverage['/editor/styles.js'].lineData[369]++;
  function setupElement(el, style) {
    _$jscoverage['/editor/styles.js'].functionData[14]++;
    _$jscoverage['/editor/styles.js'].lineData[370]++;
    var def = style._.definition, attributes = def.attributes, styles = KEStyle.getStyleText(def);
    _$jscoverage['/editor/styles.js'].lineData[375]++;
    if (visit881_375_1(attributes)) {
      _$jscoverage['/editor/styles.js'].lineData[376]++;
      for (var att in attributes) {
        _$jscoverage['/editor/styles.js'].lineData[377]++;
        el.attr(att, attributes[att]);
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[383]++;
    if (visit882_383_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[384]++;
      el[0].style.cssText = styles;
    }
    _$jscoverage['/editor/styles.js'].lineData[387]++;
    return el;
  }
  _$jscoverage['/editor/styles.js'].lineData[390]++;
  function applyBlockStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[15]++;
    _$jscoverage['/editor/styles.js'].lineData[393]++;
    var bookmark = range.createBookmark(TRUE), iterator = range.createIterator();
    _$jscoverage['/editor/styles.js'].lineData[395]++;
    iterator.enforceRealBlocks = TRUE;
    _$jscoverage['/editor/styles.js'].lineData[399]++;
    iterator.enlargeBr = TRUE;
    _$jscoverage['/editor/styles.js'].lineData[401]++;
    var block, doc = range.document;
    _$jscoverage['/editor/styles.js'].lineData[403]++;
    while ((block = iterator.getNextParagraph())) {
      _$jscoverage['/editor/styles.js'].lineData[404]++;
      var newBlock = getElement(this, doc, block);
      _$jscoverage['/editor/styles.js'].lineData[405]++;
      replaceBlock(block, newBlock);
    }
    _$jscoverage['/editor/styles.js'].lineData[407]++;
    range.moveToBookmark(bookmark);
  }
  _$jscoverage['/editor/styles.js'].lineData[411]++;
  function replace(str, regexp, replacement) {
    _$jscoverage['/editor/styles.js'].functionData[16]++;
    _$jscoverage['/editor/styles.js'].lineData[412]++;
    var headBookmark = '', tailBookmark = '';
    _$jscoverage['/editor/styles.js'].lineData[415]++;
    str = str.replace(/(^<span[^>]+_ke_bookmark.*?\/span>)|(<span[^>]+_ke_bookmark.*?\/span>$)/gi, function(str, m1, m2) {
  _$jscoverage['/editor/styles.js'].functionData[17]++;
  _$jscoverage['/editor/styles.js'].lineData[417]++;
  if (visit883_417_1(m1)) {
    _$jscoverage['/editor/styles.js'].lineData[418]++;
    headBookmark = m1;
  }
  _$jscoverage['/editor/styles.js'].lineData[420]++;
  if (visit884_420_1(m2)) {
    _$jscoverage['/editor/styles.js'].lineData[421]++;
    tailBookmark = m2;
  }
  _$jscoverage['/editor/styles.js'].lineData[423]++;
  return '';
});
    _$jscoverage['/editor/styles.js'].lineData[425]++;
    return headBookmark + str.replace(regexp, replacement) + tailBookmark;
  }
  _$jscoverage['/editor/styles.js'].lineData[431]++;
  function toPre(block, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[18]++;
    _$jscoverage['/editor/styles.js'].lineData[433]++;
    var preHTML = block.html();
    _$jscoverage['/editor/styles.js'].lineData[436]++;
    preHTML = replace(preHTML, /(?:^[\t\n\r]+)|(?:[\t\n\r]+$)/g, '');
    _$jscoverage['/editor/styles.js'].lineData[439]++;
    preHTML = preHTML.replace(/[\t\r\n]*(<br[^>]*>)[\t\r\n]*/gi, '$1');
    _$jscoverage['/editor/styles.js'].lineData[443]++;
    preHTML = preHTML.replace(/([\t\n\r]+|&nbsp;)/g, ' ');
    _$jscoverage['/editor/styles.js'].lineData[446]++;
    preHTML = preHTML.replace(/<br\b[^>]*>/gi, '\n');
    _$jscoverage['/editor/styles.js'].lineData[449]++;
    if (visit885_449_1(UA.ie)) {
      _$jscoverage['/editor/styles.js'].lineData[450]++;
      var temp = block[0].ownerDocument.createElement('div');
      _$jscoverage['/editor/styles.js'].lineData[451]++;
      temp.appendChild(newBlock[0]);
      _$jscoverage['/editor/styles.js'].lineData[452]++;
      newBlock.outerHtml('<pre>' + preHTML + '</pre>');
      _$jscoverage['/editor/styles.js'].lineData[453]++;
      newBlock = new Node(temp.firstChild);
      _$jscoverage['/editor/styles.js'].lineData[454]++;
      newBlock._4eRemove();
    } else {
      _$jscoverage['/editor/styles.js'].lineData[456]++;
      newBlock.html(preHTML);
    }
    _$jscoverage['/editor/styles.js'].lineData[459]++;
    return newBlock;
  }
  _$jscoverage['/editor/styles.js'].lineData[463]++;
  function splitIntoPres(preBlock) {
    _$jscoverage['/editor/styles.js'].functionData[19]++;
    _$jscoverage['/editor/styles.js'].lineData[466]++;
    var duoBrRegex = /(\S\s*)\n(?:\s|(<span[^>]+_ck_bookmark.*?\/span>))*\n(?!$)/gi, splittedHTML = replace(preBlock.outerHtml(), duoBrRegex, function(match, charBefore, bookmark) {
  _$jscoverage['/editor/styles.js'].functionData[20]++;
  _$jscoverage['/editor/styles.js'].lineData[471]++;
  return charBefore + '</pre>' + bookmark + '<pre>';
});
    _$jscoverage['/editor/styles.js'].lineData[474]++;
    var pres = [];
    _$jscoverage['/editor/styles.js'].lineData[475]++;
    splittedHTML.replace(/<pre\b.*?>([\s\S]*?)<\/pre>/gi, function(match, preContent) {
  _$jscoverage['/editor/styles.js'].functionData[21]++;
  _$jscoverage['/editor/styles.js'].lineData[477]++;
  pres.push(preContent);
});
    _$jscoverage['/editor/styles.js'].lineData[479]++;
    return pres;
  }
  _$jscoverage['/editor/styles.js'].lineData[485]++;
  function replaceBlock(block, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[22]++;
    _$jscoverage['/editor/styles.js'].lineData[486]++;
    var newBlockIsPre = visit886_486_1(newBlock.nodeName === ('pre')), blockIsPre = visit887_487_1(block.nodeName === ('pre')), isToPre = visit888_488_1(newBlockIsPre && !blockIsPre), isFromPre = visit889_489_1(!newBlockIsPre && blockIsPre);
    _$jscoverage['/editor/styles.js'].lineData[491]++;
    if (visit890_491_1(isToPre)) {
      _$jscoverage['/editor/styles.js'].lineData[492]++;
      newBlock = toPre(block, newBlock);
    } else {
      _$jscoverage['/editor/styles.js'].lineData[493]++;
      if (visit891_493_1(isFromPre)) {
        _$jscoverage['/editor/styles.js'].lineData[495]++;
        newBlock = fromPres(splitIntoPres(block), newBlock);
      } else {
        _$jscoverage['/editor/styles.js'].lineData[497]++;
        block._4eMoveChildren(newBlock);
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[500]++;
    block[0].parentNode.replaceChild(newBlock[0], block[0]);
    _$jscoverage['/editor/styles.js'].lineData[501]++;
    if (visit892_501_1(newBlockIsPre)) {
      _$jscoverage['/editor/styles.js'].lineData[503]++;
      mergePre(newBlock);
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[508]++;
  function mergePre(preBlock) {
    _$jscoverage['/editor/styles.js'].functionData[23]++;
    _$jscoverage['/editor/styles.js'].lineData[509]++;
    var previousBlock;
    _$jscoverage['/editor/styles.js'].lineData[510]++;
    if (visit893_510_1(!(visit894_510_2((previousBlock = preBlock._4ePreviousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && visit895_511_1(previousBlock.nodeName() === 'pre'))))) {
      _$jscoverage['/editor/styles.js'].lineData[512]++;
      return;
    }
    _$jscoverage['/editor/styles.js'].lineData[522]++;
    var mergedHTML = replace(previousBlock.html(), /\n$/, '') + '\n\n' + replace(preBlock.html(), /^\n/, '');
    _$jscoverage['/editor/styles.js'].lineData[526]++;
    if (visit896_526_1(UA.ie)) {
      _$jscoverage['/editor/styles.js'].lineData[527]++;
      preBlock.outerHtml('<pre>' + mergedHTML + '</pre>');
    } else {
      _$jscoverage['/editor/styles.js'].lineData[529]++;
      preBlock.html(mergedHTML);
    }
    _$jscoverage['/editor/styles.js'].lineData[532]++;
    previousBlock._4eRemove();
  }
  _$jscoverage['/editor/styles.js'].lineData[536]++;
  function fromPres(preHTMLs, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[24]++;
    _$jscoverage['/editor/styles.js'].lineData[537]++;
    var docFrag = newBlock[0].ownerDocument.createDocumentFragment();
    _$jscoverage['/editor/styles.js'].lineData[538]++;
    for (var i = 0; visit897_538_1(i < preHTMLs.length); i++) {
      _$jscoverage['/editor/styles.js'].lineData[539]++;
      var blockHTML = preHTMLs[i];
      _$jscoverage['/editor/styles.js'].lineData[543]++;
      blockHTML = blockHTML.replace(/(\r\n|\r)/g, '\n');
      _$jscoverage['/editor/styles.js'].lineData[544]++;
      blockHTML = replace(blockHTML, /^[\t]*\n/, '');
      _$jscoverage['/editor/styles.js'].lineData[545]++;
      blockHTML = replace(blockHTML, /\n$/, '');
      _$jscoverage['/editor/styles.js'].lineData[548]++;
      blockHTML = replace(blockHTML, /^[\t]+|[\t]+$/g, function(match, offset) {
  _$jscoverage['/editor/styles.js'].functionData[25]++;
  _$jscoverage['/editor/styles.js'].lineData[549]++;
  if (visit898_549_1(match.length === 1)) {
    _$jscoverage['/editor/styles.js'].lineData[550]++;
    return '&nbsp;';
  } else {
    _$jscoverage['/editor/styles.js'].lineData[551]++;
    if (visit899_551_1(!offset)) {
      _$jscoverage['/editor/styles.js'].lineData[552]++;
      return new Array(match.length).join('&nbsp;') + ' ';
    } else {
      _$jscoverage['/editor/styles.js'].lineData[554]++;
      return ' ' + new Array(match.length).join('&nbsp;');
    }
  }
});
      _$jscoverage['/editor/styles.js'].lineData[560]++;
      blockHTML = blockHTML.replace(/\n/g, '<br>');
      _$jscoverage['/editor/styles.js'].lineData[561]++;
      blockHTML = blockHTML.replace(/[\t]{2,}/g, function(match) {
  _$jscoverage['/editor/styles.js'].functionData[26]++;
  _$jscoverage['/editor/styles.js'].lineData[563]++;
  return new Array(match.length).join('&nbsp;') + ' ';
});
      _$jscoverage['/editor/styles.js'].lineData[566]++;
      var newBlockClone = newBlock.clone();
      _$jscoverage['/editor/styles.js'].lineData[567]++;
      newBlockClone.html(blockHTML);
      _$jscoverage['/editor/styles.js'].lineData[568]++;
      docFrag.appendChild(newBlockClone[0]);
    }
    _$jscoverage['/editor/styles.js'].lineData[570]++;
    return docFrag;
  }
  _$jscoverage['/editor/styles.js'].lineData[573]++;
  function applyInlineStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[27]++;
    _$jscoverage['/editor/styles.js'].lineData[574]++;
    var self = this, document = range.document;
    _$jscoverage['/editor/styles.js'].lineData[577]++;
    if (visit900_577_1(range.collapsed)) {
      _$jscoverage['/editor/styles.js'].lineData[579]++;
      var collapsedElement = getElement(this, document, undefined);
      _$jscoverage['/editor/styles.js'].lineData[581]++;
      range.insertNode(collapsedElement);
      _$jscoverage['/editor/styles.js'].lineData[583]++;
      range.moveToPosition(collapsedElement, KER.POSITION_BEFORE_END);
      _$jscoverage['/editor/styles.js'].lineData[584]++;
      return;
    }
    _$jscoverage['/editor/styles.js'].lineData[586]++;
    var elementName = this.element, def = this._.definition, isUnknownElement, dtd = DTD[elementName];
    _$jscoverage['/editor/styles.js'].lineData[591]++;
    if (visit901_591_1(!dtd)) {
      _$jscoverage['/editor/styles.js'].lineData[592]++;
      isUnknownElement = TRUE;
      _$jscoverage['/editor/styles.js'].lineData[593]++;
      dtd = DTD.span;
    }
    _$jscoverage['/editor/styles.js'].lineData[597]++;
    var bookmark = range.createBookmark();
    _$jscoverage['/editor/styles.js'].lineData[600]++;
    range.enlarge(KER.ENLARGE_ELEMENT);
    _$jscoverage['/editor/styles.js'].lineData[601]++;
    range.trim();
    _$jscoverage['/editor/styles.js'].lineData[605]++;
    var boundaryNodes = range.createBookmark(), firstNode = boundaryNodes.startNode, lastNode = boundaryNodes.endNode, currentNode = firstNode, styleRange;
    _$jscoverage['/editor/styles.js'].lineData[611]++;
    while (visit902_611_1(currentNode && currentNode[0])) {
      _$jscoverage['/editor/styles.js'].lineData[612]++;
      var applyStyle = FALSE;
      _$jscoverage['/editor/styles.js'].lineData[614]++;
      if (visit903_614_1(Dom.equals(currentNode, lastNode))) {
        _$jscoverage['/editor/styles.js'].lineData[615]++;
        currentNode = NULL;
        _$jscoverage['/editor/styles.js'].lineData[616]++;
        applyStyle = TRUE;
      } else {
        _$jscoverage['/editor/styles.js'].lineData[618]++;
        var nodeType = currentNode[0].nodeType, nodeName = visit904_619_1(nodeType === Dom.NodeType.ELEMENT_NODE) ? currentNode.nodeName() : NULL;
        _$jscoverage['/editor/styles.js'].lineData[622]++;
        if (visit905_622_1(nodeName && currentNode.attr('_ke_bookmark'))) {
          _$jscoverage['/editor/styles.js'].lineData[623]++;
          currentNode = currentNode._4eNextSourceNode(TRUE);
          _$jscoverage['/editor/styles.js'].lineData[624]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[628]++;
        if (visit906_628_1(!nodeName || (visit907_629_1(dtd[nodeName] && visit908_630_1(visit909_630_2((currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)) && (visit910_636_1(!def.childRule || def.childRule(currentNode)))))))) {
          _$jscoverage['/editor/styles.js'].lineData[638]++;
          var currentParent = currentNode.parent();
          _$jscoverage['/editor/styles.js'].lineData[648]++;
          if (visit911_648_1(currentParent && visit912_649_1(visit913_649_2(elementName === 'a') && visit914_650_1(currentParent.nodeName() === elementName)))) {
            _$jscoverage['/editor/styles.js'].lineData[651]++;
            var tmpANode = getElement(self, document, undefined);
            _$jscoverage['/editor/styles.js'].lineData[652]++;
            currentParent._4eMoveChildren(tmpANode);
            _$jscoverage['/editor/styles.js'].lineData[653]++;
            currentParent[0].parentNode.replaceChild(tmpANode[0], currentParent[0]);
            _$jscoverage['/editor/styles.js'].lineData[654]++;
            tmpANode._4eMergeSiblings();
          } else {
            _$jscoverage['/editor/styles.js'].lineData[655]++;
            if (visit915_655_1(currentParent && visit916_655_2(currentParent[0] && visit917_655_3((visit918_656_1((visit919_655_4(DTD[currentParent.nodeName()] || DTD.span))[elementName] || isUnknownElement)) && (visit920_657_1(!def.parentRule || def.parentRule(currentParent))))))) {
              _$jscoverage['/editor/styles.js'].lineData[664]++;
              if (visit921_664_1(!styleRange && (visit922_665_1(!nodeName || visit923_665_2(!DTD.$removeEmpty[nodeName] || visit924_665_3((currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED))))))) {
                _$jscoverage['/editor/styles.js'].lineData[673]++;
                styleRange = new KERange(document);
                _$jscoverage['/editor/styles.js'].lineData[674]++;
                styleRange.setStartBefore(currentNode);
              }
              _$jscoverage['/editor/styles.js'].lineData[679]++;
              if (visit925_679_1(visit926_679_2(nodeType === Dom.NodeType.TEXT_NODE) || (visit927_680_1(visit928_680_2(nodeType === Dom.NodeType.ELEMENT_NODE) && !currentNode[0].childNodes.length)))) {
                _$jscoverage['/editor/styles.js'].lineData[681]++;
                var includedNode = currentNode, parentNode = null;
                _$jscoverage['/editor/styles.js'].lineData[694]++;
                while (visit929_695_1((applyStyle = !includedNode.next(notBookmark, 1)) && visit930_696_1((visit931_696_2((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()])) && visit932_698_1(visit933_698_2((parentNode._4ePosition(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) === (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)) && (visit934_703_1(!def.childRule || def.childRule(parentNode))))))) {
                  _$jscoverage['/editor/styles.js'].lineData[704]++;
                  includedNode = parentNode;
                }
                _$jscoverage['/editor/styles.js'].lineData[707]++;
                styleRange.setEndAfter(includedNode);
              }
            } else {
              _$jscoverage['/editor/styles.js'].lineData[711]++;
              applyStyle = TRUE;
            }
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[714]++;
          applyStyle = TRUE;
        }
        _$jscoverage['/editor/styles.js'].lineData[718]++;
        currentNode = currentNode._4eNextSourceNode();
      }
      _$jscoverage['/editor/styles.js'].lineData[722]++;
      if (visit935_722_1(applyStyle && visit936_722_2(styleRange && !styleRange.collapsed))) {
        _$jscoverage['/editor/styles.js'].lineData[724]++;
        var styleNode = getElement(self, document, undefined), parent = styleRange.getCommonAncestor();
        _$jscoverage['/editor/styles.js'].lineData[728]++;
        var removeList = {
  styles: {}, 
  attrs: {}, 
  blockedStyles: {}, 
  blockedAttrs: {}};
        _$jscoverage['/editor/styles.js'].lineData[737]++;
        var attName, styleName = null, value;
        _$jscoverage['/editor/styles.js'].lineData[741]++;
        while (visit937_741_1(styleNode && visit938_741_2(parent && visit939_741_3(styleNode[0] && parent[0])))) {
          _$jscoverage['/editor/styles.js'].lineData[742]++;
          if (visit940_742_1(parent.nodeName() === elementName)) {
            _$jscoverage['/editor/styles.js'].lineData[743]++;
            for (attName in def.attributes) {
              _$jscoverage['/editor/styles.js'].lineData[745]++;
              if (visit941_745_1(removeList.blockedAttrs[attName] || !(value = parent.attr(styleName)))) {
                _$jscoverage['/editor/styles.js'].lineData[746]++;
                continue;
              }
              _$jscoverage['/editor/styles.js'].lineData[749]++;
              if (visit942_749_1(styleNode.attr(attName) === value)) {
                _$jscoverage['/editor/styles.js'].lineData[751]++;
                styleNode.removeAttr(attName);
              } else {
                _$jscoverage['/editor/styles.js'].lineData[753]++;
                removeList.blockedAttrs[attName] = 1;
              }
            }
            _$jscoverage['/editor/styles.js'].lineData[761]++;
            for (styleName in def.styles) {
              _$jscoverage['/editor/styles.js'].lineData[763]++;
              if (visit943_763_1(removeList.blockedStyles[styleName] || !(value = parent.style(styleName)))) {
                _$jscoverage['/editor/styles.js'].lineData[764]++;
                continue;
              }
              _$jscoverage['/editor/styles.js'].lineData[767]++;
              if (visit944_767_1(styleNode.style(styleName) === value)) {
                _$jscoverage['/editor/styles.js'].lineData[769]++;
                styleNode.style(styleName, '');
              } else {
                _$jscoverage['/editor/styles.js'].lineData[771]++;
                removeList.blockedStyles[styleName] = 1;
              }
            }
            _$jscoverage['/editor/styles.js'].lineData[776]++;
            if (visit945_776_1(!styleNode._4eHasAttributes())) {
              _$jscoverage['/editor/styles.js'].lineData[777]++;
              styleNode = NULL;
              _$jscoverage['/editor/styles.js'].lineData[778]++;
              break;
            }
          }
          _$jscoverage['/editor/styles.js'].lineData[782]++;
          parent = parent.parent();
        }
        _$jscoverage['/editor/styles.js'].lineData[785]++;
        if (visit946_785_1(styleNode)) {
          _$jscoverage['/editor/styles.js'].lineData[787]++;
          styleNode[0].appendChild(styleRange.extractContents());
          _$jscoverage['/editor/styles.js'].lineData[791]++;
          removeFromInsideElement(self, styleNode);
          _$jscoverage['/editor/styles.js'].lineData[795]++;
          styleRange.insertNode(styleNode);
          _$jscoverage['/editor/styles.js'].lineData[798]++;
          styleNode._4eMergeSiblings();
          _$jscoverage['/editor/styles.js'].lineData[806]++;
          if (visit947_806_1(!UA.ie)) {
            _$jscoverage['/editor/styles.js'].lineData[807]++;
            styleNode[0].normalize();
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[820]++;
          styleNode = new Node(document.createElement('span'));
          _$jscoverage['/editor/styles.js'].lineData[821]++;
          styleNode[0].appendChild(styleRange.extractContents());
          _$jscoverage['/editor/styles.js'].lineData[822]++;
          styleRange.insertNode(styleNode);
          _$jscoverage['/editor/styles.js'].lineData[823]++;
          removeFromInsideElement(self, styleNode);
          _$jscoverage['/editor/styles.js'].lineData[824]++;
          styleNode._4eRemove(true);
        }
        _$jscoverage['/editor/styles.js'].lineData[829]++;
        styleRange = NULL;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[833]++;
    firstNode._4eRemove();
    _$jscoverage['/editor/styles.js'].lineData[834]++;
    lastNode._4eRemove();
    _$jscoverage['/editor/styles.js'].lineData[835]++;
    range.moveToBookmark(bookmark);
    _$jscoverage['/editor/styles.js'].lineData[837]++;
    range.shrink(KER.SHRINK_TEXT);
  }
  _$jscoverage['/editor/styles.js'].lineData[841]++;
  function removeInlineStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[28]++;
    _$jscoverage['/editor/styles.js'].lineData[846]++;
    range.enlarge(KER.ENLARGE_ELEMENT);
    _$jscoverage['/editor/styles.js'].lineData[848]++;
    var bookmark = range.createBookmark(), startNode = bookmark.startNode;
    _$jscoverage['/editor/styles.js'].lineData[851]++;
    if (visit948_851_1(range.collapsed)) {
      _$jscoverage['/editor/styles.js'].lineData[852]++;
      var startPath = new ElementPath(startNode.parent()), boundaryElement;
      _$jscoverage['/editor/styles.js'].lineData[856]++;
      for (var i = 0, element; visit949_856_1(visit950_856_2(i < startPath.elements.length) && (element = startPath.elements[i])); i++) {
        _$jscoverage['/editor/styles.js'].lineData[864]++;
        if (visit951_864_1(visit952_864_2(element === startPath.block) || visit953_864_3(element === startPath.blockLimit))) {
          _$jscoverage['/editor/styles.js'].lineData[865]++;
          break;
        }
        _$jscoverage['/editor/styles.js'].lineData[867]++;
        if (visit954_867_1(this.checkElementRemovable(element))) {
          _$jscoverage['/editor/styles.js'].lineData[868]++;
          var endOfElement = range.checkBoundaryOfElement(element, KER.END), startOfElement = visit955_869_1(!endOfElement && range.checkBoundaryOfElement(element, KER.START));
          _$jscoverage['/editor/styles.js'].lineData[871]++;
          if (visit956_871_1(startOfElement || endOfElement)) {
            _$jscoverage['/editor/styles.js'].lineData[872]++;
            boundaryElement = element;
            _$jscoverage['/editor/styles.js'].lineData[873]++;
            boundaryElement.match = startOfElement ? 'start' : 'end';
          } else {
            _$jscoverage['/editor/styles.js'].lineData[881]++;
            element._4eMergeSiblings();
            _$jscoverage['/editor/styles.js'].lineData[885]++;
            if (visit957_885_1(element.nodeName() !== this.element)) {
              _$jscoverage['/editor/styles.js'].lineData[886]++;
              var _overrides = getOverrides(this);
              _$jscoverage['/editor/styles.js'].lineData[887]++;
              removeOverrides(element, visit958_888_1(_overrides[element.nodeName()] || _overrides['*']));
            } else {
              _$jscoverage['/editor/styles.js'].lineData[890]++;
              removeFromElement(this, element);
            }
          }
        }
      }
      _$jscoverage['/editor/styles.js'].lineData[900]++;
      if (visit959_900_1(boundaryElement)) {
        _$jscoverage['/editor/styles.js'].lineData[901]++;
        var clonedElement = startNode;
        _$jscoverage['/editor/styles.js'].lineData[902]++;
        for (i = 0; ; i++) {
          _$jscoverage['/editor/styles.js'].lineData[903]++;
          var newElement = startPath.elements[i];
          _$jscoverage['/editor/styles.js'].lineData[904]++;
          if (visit960_904_1(newElement.equals(boundaryElement))) {
            _$jscoverage['/editor/styles.js'].lineData[905]++;
            break;
          } else {
            _$jscoverage['/editor/styles.js'].lineData[906]++;
            if (visit961_906_1(newElement.match)) {
              _$jscoverage['/editor/styles.js'].lineData[908]++;
              continue;
            } else {
              _$jscoverage['/editor/styles.js'].lineData[910]++;
              newElement = newElement.clone();
            }
          }
          _$jscoverage['/editor/styles.js'].lineData[912]++;
          newElement[0].appendChild(clonedElement[0]);
          _$jscoverage['/editor/styles.js'].lineData[913]++;
          clonedElement = newElement;
        }
        _$jscoverage['/editor/styles.js'].lineData[919]++;
        clonedElement[visit962_918_1(boundaryElement.match === 'start') ? 'insertBefore' : 'insertAfter'](boundaryElement);
        _$jscoverage['/editor/styles.js'].lineData[922]++;
        var tmp = boundaryElement.html();
        _$jscoverage['/editor/styles.js'].lineData[923]++;
        if (visit963_923_1(!tmp || visit964_925_1(tmp === '\u200b'))) {
          _$jscoverage['/editor/styles.js'].lineData[926]++;
          boundaryElement.remove();
        } else {
          _$jscoverage['/editor/styles.js'].lineData[927]++;
          if (visit965_927_1(UA.webkit)) {
            _$jscoverage['/editor/styles.js'].lineData[929]++;
            $(range.document.createTextNode('\u200b')).insertBefore(clonedElement);
          }
        }
      }
    } else {
      _$jscoverage['/editor/styles.js'].lineData[937]++;
      var endNode = bookmark.endNode, self = this;
      _$jscoverage['/editor/styles.js'].lineData[944]++;
      var breakNodes = function() {
  _$jscoverage['/editor/styles.js'].functionData[29]++;
  _$jscoverage['/editor/styles.js'].lineData[945]++;
  var startPath = new ElementPath(startNode.parent()), endPath = new ElementPath(endNode.parent()), breakStart = NULL, element, breakEnd = NULL;
  _$jscoverage['/editor/styles.js'].lineData[950]++;
  for (var i = 0; visit966_950_1(i < startPath.elements.length); i++) {
    _$jscoverage['/editor/styles.js'].lineData[951]++;
    element = startPath.elements[i];
    _$jscoverage['/editor/styles.js'].lineData[953]++;
    if (visit967_953_1(visit968_953_2(element === startPath.block) || visit969_954_1(element === startPath.blockLimit))) {
      _$jscoverage['/editor/styles.js'].lineData[955]++;
      break;
    }
    _$jscoverage['/editor/styles.js'].lineData[958]++;
    if (visit970_958_1(self.checkElementRemovable(element))) {
      _$jscoverage['/editor/styles.js'].lineData[959]++;
      breakStart = element;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[962]++;
  for (i = 0; visit971_962_1(i < endPath.elements.length); i++) {
    _$jscoverage['/editor/styles.js'].lineData[963]++;
    element = endPath.elements[i];
    _$jscoverage['/editor/styles.js'].lineData[965]++;
    if (visit972_965_1(visit973_965_2(element === endPath.block) || visit974_966_1(element === endPath.blockLimit))) {
      _$jscoverage['/editor/styles.js'].lineData[967]++;
      break;
    }
    _$jscoverage['/editor/styles.js'].lineData[970]++;
    if (visit975_970_1(self.checkElementRemovable(element))) {
      _$jscoverage['/editor/styles.js'].lineData[971]++;
      breakEnd = element;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[975]++;
  if (visit976_975_1(breakEnd)) {
    _$jscoverage['/editor/styles.js'].lineData[976]++;
    endNode._4eBreakParent(breakEnd);
  }
  _$jscoverage['/editor/styles.js'].lineData[978]++;
  if (visit977_978_1(breakStart)) {
    _$jscoverage['/editor/styles.js'].lineData[979]++;
    startNode._4eBreakParent(breakStart);
  }
};
      _$jscoverage['/editor/styles.js'].lineData[983]++;
      breakNodes();
      _$jscoverage['/editor/styles.js'].lineData[986]++;
      var currentNode = new Node(startNode[0].nextSibling);
      _$jscoverage['/editor/styles.js'].lineData[987]++;
      while (visit978_987_1(currentNode[0] !== endNode[0])) {
        _$jscoverage['/editor/styles.js'].lineData[992]++;
        var nextNode = currentNode._4eNextSourceNode();
        _$jscoverage['/editor/styles.js'].lineData[993]++;
        if (visit979_993_1(currentNode[0] && visit980_994_1(visit981_994_2(currentNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) && this.checkElementRemovable(currentNode)))) {
          _$jscoverage['/editor/styles.js'].lineData[997]++;
          if (visit982_997_1(currentNode.nodeName() === this.element)) {
            _$jscoverage['/editor/styles.js'].lineData[998]++;
            removeFromElement(this, currentNode);
          } else {
            _$jscoverage['/editor/styles.js'].lineData[1000]++;
            var overrides = getOverrides(this);
            _$jscoverage['/editor/styles.js'].lineData[1001]++;
            removeOverrides(currentNode, visit983_1002_1(overrides[currentNode.nodeName()] || overrides['*']));
          }
          _$jscoverage['/editor/styles.js'].lineData[1012]++;
          if (visit984_1012_1(visit985_1012_2(nextNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) && nextNode.contains(startNode))) {
            _$jscoverage['/editor/styles.js'].lineData[1014]++;
            breakNodes();
            _$jscoverage['/editor/styles.js'].lineData[1015]++;
            nextNode = new Node(startNode[0].nextSibling);
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[1018]++;
        currentNode = nextNode;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1021]++;
    range.moveToBookmark(bookmark);
  }
  _$jscoverage['/editor/styles.js'].lineData[1025]++;
  function parseStyleText(styleText) {
    _$jscoverage['/editor/styles.js'].functionData[30]++;
    _$jscoverage['/editor/styles.js'].lineData[1026]++;
    styleText = String(styleText);
    _$jscoverage['/editor/styles.js'].lineData[1027]++;
    var retval = {};
    _$jscoverage['/editor/styles.js'].lineData[1029]++;
    styleText.replace(/&quot;/g, '"').replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g, function(match, name, value) {
  _$jscoverage['/editor/styles.js'].functionData[31]++;
  _$jscoverage['/editor/styles.js'].lineData[1031]++;
  retval[name] = value;
});
    _$jscoverage['/editor/styles.js'].lineData[1033]++;
    return retval;
  }
  _$jscoverage['/editor/styles.js'].lineData[1036]++;
  function compareCssText(source, target) {
    _$jscoverage['/editor/styles.js'].functionData[32]++;
    _$jscoverage['/editor/styles.js'].lineData[1037]++;
    if (visit986_1037_1(typeof source === 'string')) {
      _$jscoverage['/editor/styles.js'].lineData[1038]++;
      source = parseStyleText(source);
    }
    _$jscoverage['/editor/styles.js'].lineData[1040]++;
    if (visit987_1040_1(target === 'string')) {
      _$jscoverage['/editor/styles.js'].lineData[1041]++;
      target = parseStyleText(target);
    }
    _$jscoverage['/editor/styles.js'].lineData[1043]++;
    for (var name in source) {
      _$jscoverage['/editor/styles.js'].lineData[1047]++;
      if (visit988_1047_1(!(visit989_1047_2(name in target && (visit990_1048_1(visit991_1048_2(target[name] === source[name]) || visit992_1049_1(visit993_1049_2(source[name] === 'inherit') || visit994_1049_3(target[name] === 'inherit')))))))) {
        _$jscoverage['/editor/styles.js'].lineData[1050]++;
        return FALSE;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1054]++;
    return TRUE;
  }
  _$jscoverage['/editor/styles.js'].lineData[1057]++;
  function normalizeCssText(unParsedCssText, nativeNormalize) {
    _$jscoverage['/editor/styles.js'].functionData[33]++;
    _$jscoverage['/editor/styles.js'].lineData[1058]++;
    var styleText = '';
    _$jscoverage['/editor/styles.js'].lineData[1059]++;
    if (visit995_1059_1(nativeNormalize !== FALSE)) {
      _$jscoverage['/editor/styles.js'].lineData[1062]++;
      var temp = document.createElement('span');
      _$jscoverage['/editor/styles.js'].lineData[1063]++;
      temp.style.cssText = unParsedCssText;
      _$jscoverage['/editor/styles.js'].lineData[1065]++;
      styleText = visit996_1065_1(temp.style.cssText || '');
    } else {
      _$jscoverage['/editor/styles.js'].lineData[1067]++;
      styleText = unParsedCssText;
    }
    _$jscoverage['/editor/styles.js'].lineData[1072]++;
    return styleText.replace(/\s*([;:])\s*/, '$1').replace(/([^\s;])$/, '$1;').replace(/,\s+/g, ',').toLowerCase();
  }
  _$jscoverage['/editor/styles.js'].lineData[1082]++;
  function getAttributesForComparison(styleDefinition) {
    _$jscoverage['/editor/styles.js'].functionData[34]++;
    _$jscoverage['/editor/styles.js'].lineData[1084]++;
    var attribs = styleDefinition._AC;
    _$jscoverage['/editor/styles.js'].lineData[1085]++;
    if (visit997_1085_1(attribs)) {
      _$jscoverage['/editor/styles.js'].lineData[1086]++;
      return attribs;
    }
    _$jscoverage['/editor/styles.js'].lineData[1088]++;
    attribs = {};
    _$jscoverage['/editor/styles.js'].lineData[1090]++;
    var length = 0, styleAttribs = styleDefinition.attributes;
    _$jscoverage['/editor/styles.js'].lineData[1094]++;
    if (visit998_1094_1(styleAttribs)) {
      _$jscoverage['/editor/styles.js'].lineData[1095]++;
      for (var styleAtt in styleAttribs) {
        _$jscoverage['/editor/styles.js'].lineData[1097]++;
        length++;
        _$jscoverage['/editor/styles.js'].lineData[1098]++;
        attribs[styleAtt] = styleAttribs[styleAtt];
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1104]++;
    var styleText = KEStyle.getStyleText(styleDefinition);
    _$jscoverage['/editor/styles.js'].lineData[1105]++;
    if (visit999_1105_1(styleText)) {
      _$jscoverage['/editor/styles.js'].lineData[1106]++;
      if (visit1000_1106_1(!attribs.style)) {
        _$jscoverage['/editor/styles.js'].lineData[1107]++;
        length++;
      }
      _$jscoverage['/editor/styles.js'].lineData[1109]++;
      attribs.style = styleText;
    }
    _$jscoverage['/editor/styles.js'].lineData[1114]++;
    attribs._length = length;
    _$jscoverage['/editor/styles.js'].lineData[1117]++;
    styleDefinition._AC = attribs;
    _$jscoverage['/editor/styles.js'].lineData[1118]++;
    return attribs;
  }
  _$jscoverage['/editor/styles.js'].lineData[1126]++;
  function getOverrides(style) {
    _$jscoverage['/editor/styles.js'].functionData[35]++;
    _$jscoverage['/editor/styles.js'].lineData[1127]++;
    if (visit1001_1127_1(style._.overrides)) {
      _$jscoverage['/editor/styles.js'].lineData[1128]++;
      return style._.overrides;
    }
    _$jscoverage['/editor/styles.js'].lineData[1131]++;
    var overrides = (style._.overrides = {}), definition = style._.definition.overrides;
    _$jscoverage['/editor/styles.js'].lineData[1134]++;
    if (visit1002_1134_1(definition)) {
      _$jscoverage['/editor/styles.js'].lineData[1137]++;
      if (visit1003_1137_1(!S.isArray(definition))) {
        _$jscoverage['/editor/styles.js'].lineData[1138]++;
        definition = [definition];
      }
      _$jscoverage['/editor/styles.js'].lineData[1142]++;
      for (var i = 0; visit1004_1142_1(i < definition.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1143]++;
        var override = definition[i];
        _$jscoverage['/editor/styles.js'].lineData[1144]++;
        var elementName;
        _$jscoverage['/editor/styles.js'].lineData[1145]++;
        var overrideEl;
        _$jscoverage['/editor/styles.js'].lineData[1146]++;
        var attrs, styles;
        _$jscoverage['/editor/styles.js'].lineData[1149]++;
        if (visit1005_1149_1(typeof override === 'string')) {
          _$jscoverage['/editor/styles.js'].lineData[1150]++;
          elementName = override.toLowerCase();
        } else {
          _$jscoverage['/editor/styles.js'].lineData[1152]++;
          elementName = override.element ? override.element.toLowerCase() : style.element;
          _$jscoverage['/editor/styles.js'].lineData[1155]++;
          attrs = override.attributes;
          _$jscoverage['/editor/styles.js'].lineData[1156]++;
          styles = override.styles;
        }
        _$jscoverage['/editor/styles.js'].lineData[1162]++;
        overrideEl = visit1006_1162_1(overrides[elementName] || (overrides[elementName] = {}));
        _$jscoverage['/editor/styles.js'].lineData[1165]++;
        if (visit1007_1165_1(attrs)) {
          _$jscoverage['/editor/styles.js'].lineData[1169]++;
          var overrideAttrs = (overrideEl.attributes = visit1008_1170_1(overrideEl.attributes || []));
          _$jscoverage['/editor/styles.js'].lineData[1171]++;
          for (var attName in attrs) {
            _$jscoverage['/editor/styles.js'].lineData[1175]++;
            overrideAttrs.push([attName.toLowerCase(), attrs[attName]]);
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[1179]++;
        if (visit1009_1179_1(styles)) {
          _$jscoverage['/editor/styles.js'].lineData[1183]++;
          var overrideStyles = (overrideEl.styles = visit1010_1184_1(overrideEl.styles || []));
          _$jscoverage['/editor/styles.js'].lineData[1185]++;
          for (var styleName in styles) {
            _$jscoverage['/editor/styles.js'].lineData[1189]++;
            overrideStyles.push([styleName.toLowerCase(), styles[styleName]]);
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1195]++;
    return overrides;
  }
  _$jscoverage['/editor/styles.js'].lineData[1199]++;
  function removeFromElement(style, element) {
    _$jscoverage['/editor/styles.js'].functionData[36]++;
    _$jscoverage['/editor/styles.js'].lineData[1200]++;
    var def = style._.definition, overrides = getOverrides(style), attributes = S.merge(def.attributes, (visit1011_1203_1(overrides[element.nodeName()] || visit1012_1203_2(overrides['*'] || {}))).attributes), styles = S.merge(def.styles, (visit1013_1205_1(overrides[element.nodeName()] || visit1014_1205_2(overrides['*'] || {}))).styles), removeEmpty = visit1015_1207_1(S.isEmptyObject(attributes) && S.isEmptyObject(styles));
    _$jscoverage['/editor/styles.js'].lineData[1211]++;
    for (var attName in attributes) {
      _$jscoverage['/editor/styles.js'].lineData[1214]++;
      if (visit1016_1214_1((visit1017_1214_2(visit1018_1214_3(attName === 'class') || style._.definition.fullMatch)) && visit1019_1214_4(element.attr(attName) !== normalizeProperty(attName, attributes[attName])))) {
        _$jscoverage['/editor/styles.js'].lineData[1216]++;
        continue;
      }
      _$jscoverage['/editor/styles.js'].lineData[1218]++;
      removeEmpty = visit1020_1218_1(removeEmpty || !!element.hasAttr(attName));
      _$jscoverage['/editor/styles.js'].lineData[1219]++;
      element.removeAttr(attName);
    }
    _$jscoverage['/editor/styles.js'].lineData[1223]++;
    for (var styleName in styles) {
      _$jscoverage['/editor/styles.js'].lineData[1226]++;
      if (visit1021_1226_1(style._.definition.fullMatch && visit1022_1227_1(element.style(styleName) !== normalizeProperty(styleName, styles[styleName], TRUE)))) {
        _$jscoverage['/editor/styles.js'].lineData[1228]++;
        continue;
      }
      _$jscoverage['/editor/styles.js'].lineData[1231]++;
      removeEmpty = visit1023_1231_1(removeEmpty || !!element.style(styleName));
      _$jscoverage['/editor/styles.js'].lineData[1233]++;
      element.style(styleName, '');
    }
    _$jscoverage['/editor/styles.js'].lineData[1239]++;
    removeNoAttribsElement(element);
  }
  _$jscoverage['/editor/styles.js'].lineData[1242]++;
  function normalizeProperty(name, value, isStyle) {
    _$jscoverage['/editor/styles.js'].functionData[37]++;
    _$jscoverage['/editor/styles.js'].lineData[1243]++;
    var temp = new Node('<span>');
    _$jscoverage['/editor/styles.js'].lineData[1244]++;
    temp[isStyle ? 'style' : 'attr'](name, value);
    _$jscoverage['/editor/styles.js'].lineData[1245]++;
    return temp[isStyle ? 'style' : 'attr'](name);
  }
  _$jscoverage['/editor/styles.js'].lineData[1249]++;
  function removeFromInsideElement(style, element) {
    _$jscoverage['/editor/styles.js'].functionData[38]++;
    _$jscoverage['/editor/styles.js'].lineData[1250]++;
    var overrides = getOverrides(style), innerElements = element.all(style.element);
    _$jscoverage['/editor/styles.js'].lineData[1256]++;
    for (var i = innerElements.length; visit1024_1256_1(--i >= 0); ) {
      _$jscoverage['/editor/styles.js'].lineData[1257]++;
      removeFromElement(style, new Node(innerElements[i]));
    }
    _$jscoverage['/editor/styles.js'].lineData[1262]++;
    for (var overrideElement in overrides) {
      _$jscoverage['/editor/styles.js'].lineData[1264]++;
      if (visit1025_1264_1(overrideElement !== style.element)) {
        _$jscoverage['/editor/styles.js'].lineData[1265]++;
        innerElements = element.all(overrideElement);
        _$jscoverage['/editor/styles.js'].lineData[1266]++;
        for (i = innerElements.length - 1; visit1026_1266_1(i >= 0); i--) {
          _$jscoverage['/editor/styles.js'].lineData[1267]++;
          var innerElement = new Node(innerElements[i]);
          _$jscoverage['/editor/styles.js'].lineData[1268]++;
          removeOverrides(innerElement, overrides[overrideElement]);
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[1281]++;
  function removeOverrides(element, overrides) {
    _$jscoverage['/editor/styles.js'].functionData[39]++;
    _$jscoverage['/editor/styles.js'].lineData[1282]++;
    var i, actualAttrValue, attributes = visit1027_1283_1(overrides && overrides.attributes);
    _$jscoverage['/editor/styles.js'].lineData[1285]++;
    if (visit1028_1285_1(attributes)) {
      _$jscoverage['/editor/styles.js'].lineData[1286]++;
      for (i = 0; visit1029_1286_1(i < attributes.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1287]++;
        var attName = attributes[i][0];
        _$jscoverage['/editor/styles.js'].lineData[1289]++;
        if ((actualAttrValue = element.attr(attName))) {
          _$jscoverage['/editor/styles.js'].lineData[1290]++;
          var attValue = attributes[i][1];
          _$jscoverage['/editor/styles.js'].lineData[1298]++;
          if (visit1030_1298_1(visit1031_1298_2(attValue === NULL) || visit1032_1299_1((visit1033_1299_2(attValue.test && attValue.test(actualAttrValue))) || (visit1034_1300_1(visit1035_1300_2(typeof attValue === 'string') && visit1036_1300_3(actualAttrValue === attValue)))))) {
            _$jscoverage['/editor/styles.js'].lineData[1301]++;
            element[0].removeAttribute(attName);
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1307]++;
    var styles = visit1037_1307_1(overrides && overrides.styles);
    _$jscoverage['/editor/styles.js'].lineData[1309]++;
    if (visit1038_1309_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[1310]++;
      for (i = 0; visit1039_1310_1(i < styles.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1311]++;
        var styleName = styles[i][0], actualStyleValue;
        _$jscoverage['/editor/styles.js'].lineData[1313]++;
        if ((actualStyleValue = element.css(styleName))) {
          _$jscoverage['/editor/styles.js'].lineData[1314]++;
          var styleValue = styles[i][1];
          _$jscoverage['/editor/styles.js'].lineData[1315]++;
          if (visit1040_1315_1(visit1041_1315_2(styleValue === NULL) || visit1042_1317_1((visit1043_1317_2(styleValue.test && styleValue.test(actualAttrValue))) || (visit1044_1318_1(visit1045_1318_2(typeof styleValue === 'string') && visit1046_1318_3(actualStyleValue === styleValue)))))) {
            _$jscoverage['/editor/styles.js'].lineData[1319]++;
            element.css(styleName, '');
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1325]++;
    removeNoAttribsElement(element);
  }
  _$jscoverage['/editor/styles.js'].lineData[1329]++;
  function removeNoAttribsElement(element) {
    _$jscoverage['/editor/styles.js'].functionData[40]++;
    _$jscoverage['/editor/styles.js'].lineData[1332]++;
    if (visit1047_1332_1(!element._4eHasAttributes())) {
      _$jscoverage['/editor/styles.js'].lineData[1335]++;
      var firstChild = element[0].firstChild, lastChild = element[0].lastChild;
      _$jscoverage['/editor/styles.js'].lineData[1338]++;
      element._4eRemove(TRUE);
      _$jscoverage['/editor/styles.js'].lineData[1340]++;
      if (visit1048_1340_1(firstChild)) {
        _$jscoverage['/editor/styles.js'].lineData[1342]++;
        if (visit1049_1342_1(firstChild.nodeType === Dom.NodeType.ELEMENT_NODE)) {
          _$jscoverage['/editor/styles.js'].lineData[1343]++;
          Dom._4eMergeSiblings(firstChild);
        }
        _$jscoverage['/editor/styles.js'].lineData[1346]++;
        if (visit1050_1346_1(lastChild && visit1051_1346_2(visit1052_1346_3(firstChild !== lastChild) && visit1053_1346_4(lastChild.nodeType === Dom.NodeType.ELEMENT_NODE)))) {
          _$jscoverage['/editor/styles.js'].lineData[1347]++;
          Dom._4eMergeSiblings(lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[1353]++;
  Editor.Style = KEStyle;
  _$jscoverage['/editor/styles.js'].lineData[1355]++;
  return KEStyle;
});
