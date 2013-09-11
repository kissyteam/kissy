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
if (! _$jscoverage['/editor/range.js']) {
  _$jscoverage['/editor/range.js'] = {};
  _$jscoverage['/editor/range.js'].lineData = [];
  _$jscoverage['/editor/range.js'].lineData[10] = 0;
  _$jscoverage['/editor/range.js'].lineData[15] = 0;
  _$jscoverage['/editor/range.js'].lineData[29] = 0;
  _$jscoverage['/editor/range.js'].lineData[49] = 0;
  _$jscoverage['/editor/range.js'].lineData[54] = 0;
  _$jscoverage['/editor/range.js'].lineData[65] = 0;
  _$jscoverage['/editor/range.js'].lineData[69] = 0;
  _$jscoverage['/editor/range.js'].lineData[75] = 0;
  _$jscoverage['/editor/range.js'].lineData[78] = 0;
  _$jscoverage['/editor/range.js'].lineData[80] = 0;
  _$jscoverage['/editor/range.js'].lineData[83] = 0;
  _$jscoverage['/editor/range.js'].lineData[84] = 0;
  _$jscoverage['/editor/range.js'].lineData[85] = 0;
  _$jscoverage['/editor/range.js'].lineData[87] = 0;
  _$jscoverage['/editor/range.js'].lineData[88] = 0;
  _$jscoverage['/editor/range.js'].lineData[90] = 0;
  _$jscoverage['/editor/range.js'].lineData[92] = 0;
  _$jscoverage['/editor/range.js'].lineData[93] = 0;
  _$jscoverage['/editor/range.js'].lineData[95] = 0;
  _$jscoverage['/editor/range.js'].lineData[96] = 0;
  _$jscoverage['/editor/range.js'].lineData[99] = 0;
  _$jscoverage['/editor/range.js'].lineData[102] = 0;
  _$jscoverage['/editor/range.js'].lineData[103] = 0;
  _$jscoverage['/editor/range.js'].lineData[105] = 0;
  _$jscoverage['/editor/range.js'].lineData[109] = 0;
  _$jscoverage['/editor/range.js'].lineData[122] = 0;
  _$jscoverage['/editor/range.js'].lineData[123] = 0;
  _$jscoverage['/editor/range.js'].lineData[135] = 0;
  _$jscoverage['/editor/range.js'].lineData[136] = 0;
  _$jscoverage['/editor/range.js'].lineData[139] = 0;
  _$jscoverage['/editor/range.js'].lineData[140] = 0;
  _$jscoverage['/editor/range.js'].lineData[144] = 0;
  _$jscoverage['/editor/range.js'].lineData[152] = 0;
  _$jscoverage['/editor/range.js'].lineData[153] = 0;
  _$jscoverage['/editor/range.js'].lineData[154] = 0;
  _$jscoverage['/editor/range.js'].lineData[158] = 0;
  _$jscoverage['/editor/range.js'].lineData[160] = 0;
  _$jscoverage['/editor/range.js'].lineData[162] = 0;
  _$jscoverage['/editor/range.js'].lineData[165] = 0;
  _$jscoverage['/editor/range.js'].lineData[167] = 0;
  _$jscoverage['/editor/range.js'].lineData[176] = 0;
  _$jscoverage['/editor/range.js'].lineData[177] = 0;
  _$jscoverage['/editor/range.js'].lineData[178] = 0;
  _$jscoverage['/editor/range.js'].lineData[185] = 0;
  _$jscoverage['/editor/range.js'].lineData[187] = 0;
  _$jscoverage['/editor/range.js'].lineData[188] = 0;
  _$jscoverage['/editor/range.js'].lineData[189] = 0;
  _$jscoverage['/editor/range.js'].lineData[190] = 0;
  _$jscoverage['/editor/range.js'].lineData[192] = 0;
  _$jscoverage['/editor/range.js'].lineData[194] = 0;
  _$jscoverage['/editor/range.js'].lineData[196] = 0;
  _$jscoverage['/editor/range.js'].lineData[198] = 0;
  _$jscoverage['/editor/range.js'].lineData[205] = 0;
  _$jscoverage['/editor/range.js'].lineData[208] = 0;
  _$jscoverage['/editor/range.js'].lineData[209] = 0;
  _$jscoverage['/editor/range.js'].lineData[212] = 0;
  _$jscoverage['/editor/range.js'].lineData[213] = 0;
  _$jscoverage['/editor/range.js'].lineData[218] = 0;
  _$jscoverage['/editor/range.js'].lineData[220] = 0;
  _$jscoverage['/editor/range.js'].lineData[221] = 0;
  _$jscoverage['/editor/range.js'].lineData[222] = 0;
  _$jscoverage['/editor/range.js'].lineData[228] = 0;
  _$jscoverage['/editor/range.js'].lineData[229] = 0;
  _$jscoverage['/editor/range.js'].lineData[233] = 0;
  _$jscoverage['/editor/range.js'].lineData[241] = 0;
  _$jscoverage['/editor/range.js'].lineData[242] = 0;
  _$jscoverage['/editor/range.js'].lineData[245] = 0;
  _$jscoverage['/editor/range.js'].lineData[247] = 0;
  _$jscoverage['/editor/range.js'].lineData[249] = 0;
  _$jscoverage['/editor/range.js'].lineData[253] = 0;
  _$jscoverage['/editor/range.js'].lineData[255] = 0;
  _$jscoverage['/editor/range.js'].lineData[259] = 0;
  _$jscoverage['/editor/range.js'].lineData[262] = 0;
  _$jscoverage['/editor/range.js'].lineData[263] = 0;
  _$jscoverage['/editor/range.js'].lineData[267] = 0;
  _$jscoverage['/editor/range.js'].lineData[270] = 0;
  _$jscoverage['/editor/range.js'].lineData[272] = 0;
  _$jscoverage['/editor/range.js'].lineData[277] = 0;
  _$jscoverage['/editor/range.js'].lineData[278] = 0;
  _$jscoverage['/editor/range.js'].lineData[279] = 0;
  _$jscoverage['/editor/range.js'].lineData[280] = 0;
  _$jscoverage['/editor/range.js'].lineData[283] = 0;
  _$jscoverage['/editor/range.js'].lineData[287] = 0;
  _$jscoverage['/editor/range.js'].lineData[289] = 0;
  _$jscoverage['/editor/range.js'].lineData[293] = 0;
  _$jscoverage['/editor/range.js'].lineData[296] = 0;
  _$jscoverage['/editor/range.js'].lineData[297] = 0;
  _$jscoverage['/editor/range.js'].lineData[301] = 0;
  _$jscoverage['/editor/range.js'].lineData[305] = 0;
  _$jscoverage['/editor/range.js'].lineData[306] = 0;
  _$jscoverage['/editor/range.js'].lineData[309] = 0;
  _$jscoverage['/editor/range.js'].lineData[312] = 0;
  _$jscoverage['/editor/range.js'].lineData[314] = 0;
  _$jscoverage['/editor/range.js'].lineData[318] = 0;
  _$jscoverage['/editor/range.js'].lineData[323] = 0;
  _$jscoverage['/editor/range.js'].lineData[324] = 0;
  _$jscoverage['/editor/range.js'].lineData[326] = 0;
  _$jscoverage['/editor/range.js'].lineData[329] = 0;
  _$jscoverage['/editor/range.js'].lineData[330] = 0;
  _$jscoverage['/editor/range.js'].lineData[334] = 0;
  _$jscoverage['/editor/range.js'].lineData[337] = 0;
  _$jscoverage['/editor/range.js'].lineData[339] = 0;
  _$jscoverage['/editor/range.js'].lineData[343] = 0;
  _$jscoverage['/editor/range.js'].lineData[347] = 0;
  _$jscoverage['/editor/range.js'].lineData[348] = 0;
  _$jscoverage['/editor/range.js'].lineData[352] = 0;
  _$jscoverage['/editor/range.js'].lineData[356] = 0;
  _$jscoverage['/editor/range.js'].lineData[357] = 0;
  _$jscoverage['/editor/range.js'].lineData[358] = 0;
  _$jscoverage['/editor/range.js'].lineData[362] = 0;
  _$jscoverage['/editor/range.js'].lineData[363] = 0;
  _$jscoverage['/editor/range.js'].lineData[367] = 0;
  _$jscoverage['/editor/range.js'].lineData[368] = 0;
  _$jscoverage['/editor/range.js'].lineData[369] = 0;
  _$jscoverage['/editor/range.js'].lineData[372] = 0;
  _$jscoverage['/editor/range.js'].lineData[373] = 0;
  _$jscoverage['/editor/range.js'].lineData[383] = 0;
  _$jscoverage['/editor/range.js'].lineData[390] = 0;
  _$jscoverage['/editor/range.js'].lineData[394] = 0;
  _$jscoverage['/editor/range.js'].lineData[397] = 0;
  _$jscoverage['/editor/range.js'].lineData[400] = 0;
  _$jscoverage['/editor/range.js'].lineData[404] = 0;
  _$jscoverage['/editor/range.js'].lineData[409] = 0;
  _$jscoverage['/editor/range.js'].lineData[410] = 0;
  _$jscoverage['/editor/range.js'].lineData[413] = 0;
  _$jscoverage['/editor/range.js'].lineData[414] = 0;
  _$jscoverage['/editor/range.js'].lineData[417] = 0;
  _$jscoverage['/editor/range.js'].lineData[420] = 0;
  _$jscoverage['/editor/range.js'].lineData[421] = 0;
  _$jscoverage['/editor/range.js'].lineData[434] = 0;
  _$jscoverage['/editor/range.js'].lineData[435] = 0;
  _$jscoverage['/editor/range.js'].lineData[436] = 0;
  _$jscoverage['/editor/range.js'].lineData[437] = 0;
  _$jscoverage['/editor/range.js'].lineData[438] = 0;
  _$jscoverage['/editor/range.js'].lineData[439] = 0;
  _$jscoverage['/editor/range.js'].lineData[440] = 0;
  _$jscoverage['/editor/range.js'].lineData[441] = 0;
  _$jscoverage['/editor/range.js'].lineData[444] = 0;
  _$jscoverage['/editor/range.js'].lineData[450] = 0;
  _$jscoverage['/editor/range.js'].lineData[454] = 0;
  _$jscoverage['/editor/range.js'].lineData[455] = 0;
  _$jscoverage['/editor/range.js'].lineData[456] = 0;
  _$jscoverage['/editor/range.js'].lineData[466] = 0;
  _$jscoverage['/editor/range.js'].lineData[470] = 0;
  _$jscoverage['/editor/range.js'].lineData[471] = 0;
  _$jscoverage['/editor/range.js'].lineData[472] = 0;
  _$jscoverage['/editor/range.js'].lineData[473] = 0;
  _$jscoverage['/editor/range.js'].lineData[474] = 0;
  _$jscoverage['/editor/range.js'].lineData[478] = 0;
  _$jscoverage['/editor/range.js'].lineData[479] = 0;
  _$jscoverage['/editor/range.js'].lineData[481] = 0;
  _$jscoverage['/editor/range.js'].lineData[482] = 0;
  _$jscoverage['/editor/range.js'].lineData[483] = 0;
  _$jscoverage['/editor/range.js'].lineData[484] = 0;
  _$jscoverage['/editor/range.js'].lineData[485] = 0;
  _$jscoverage['/editor/range.js'].lineData[495] = 0;
  _$jscoverage['/editor/range.js'].lineData[502] = 0;
  _$jscoverage['/editor/range.js'].lineData[509] = 0;
  _$jscoverage['/editor/range.js'].lineData[516] = 0;
  _$jscoverage['/editor/range.js'].lineData[523] = 0;
  _$jscoverage['/editor/range.js'].lineData[527] = 0;
  _$jscoverage['/editor/range.js'].lineData[530] = 0;
  _$jscoverage['/editor/range.js'].lineData[532] = 0;
  _$jscoverage['/editor/range.js'].lineData[535] = 0;
  _$jscoverage['/editor/range.js'].lineData[553] = 0;
  _$jscoverage['/editor/range.js'].lineData[554] = 0;
  _$jscoverage['/editor/range.js'].lineData[555] = 0;
  _$jscoverage['/editor/range.js'].lineData[556] = 0;
  _$jscoverage['/editor/range.js'].lineData[559] = 0;
  _$jscoverage['/editor/range.js'].lineData[560] = 0;
  _$jscoverage['/editor/range.js'].lineData[562] = 0;
  _$jscoverage['/editor/range.js'].lineData[563] = 0;
  _$jscoverage['/editor/range.js'].lineData[564] = 0;
  _$jscoverage['/editor/range.js'].lineData[567] = 0;
  _$jscoverage['/editor/range.js'].lineData[584] = 0;
  _$jscoverage['/editor/range.js'].lineData[585] = 0;
  _$jscoverage['/editor/range.js'].lineData[586] = 0;
  _$jscoverage['/editor/range.js'].lineData[587] = 0;
  _$jscoverage['/editor/range.js'].lineData[590] = 0;
  _$jscoverage['/editor/range.js'].lineData[591] = 0;
  _$jscoverage['/editor/range.js'].lineData[593] = 0;
  _$jscoverage['/editor/range.js'].lineData[594] = 0;
  _$jscoverage['/editor/range.js'].lineData[595] = 0;
  _$jscoverage['/editor/range.js'].lineData[598] = 0;
  _$jscoverage['/editor/range.js'].lineData[607] = 0;
  _$jscoverage['/editor/range.js'].lineData[608] = 0;
  _$jscoverage['/editor/range.js'].lineData[610] = 0;
  _$jscoverage['/editor/range.js'].lineData[611] = 0;
  _$jscoverage['/editor/range.js'].lineData[614] = 0;
  _$jscoverage['/editor/range.js'].lineData[615] = 0;
  _$jscoverage['/editor/range.js'].lineData[617] = 0;
  _$jscoverage['/editor/range.js'].lineData[619] = 0;
  _$jscoverage['/editor/range.js'].lineData[622] = 0;
  _$jscoverage['/editor/range.js'].lineData[623] = 0;
  _$jscoverage['/editor/range.js'].lineData[626] = 0;
  _$jscoverage['/editor/range.js'].lineData[629] = 0;
  _$jscoverage['/editor/range.js'].lineData[638] = 0;
  _$jscoverage['/editor/range.js'].lineData[639] = 0;
  _$jscoverage['/editor/range.js'].lineData[641] = 0;
  _$jscoverage['/editor/range.js'].lineData[642] = 0;
  _$jscoverage['/editor/range.js'].lineData[645] = 0;
  _$jscoverage['/editor/range.js'].lineData[646] = 0;
  _$jscoverage['/editor/range.js'].lineData[648] = 0;
  _$jscoverage['/editor/range.js'].lineData[650] = 0;
  _$jscoverage['/editor/range.js'].lineData[653] = 0;
  _$jscoverage['/editor/range.js'].lineData[654] = 0;
  _$jscoverage['/editor/range.js'].lineData[657] = 0;
  _$jscoverage['/editor/range.js'].lineData[660] = 0;
  _$jscoverage['/editor/range.js'].lineData[667] = 0;
  _$jscoverage['/editor/range.js'].lineData[674] = 0;
  _$jscoverage['/editor/range.js'].lineData[681] = 0;
  _$jscoverage['/editor/range.js'].lineData[689] = 0;
  _$jscoverage['/editor/range.js'].lineData[690] = 0;
  _$jscoverage['/editor/range.js'].lineData[691] = 0;
  _$jscoverage['/editor/range.js'].lineData[692] = 0;
  _$jscoverage['/editor/range.js'].lineData[694] = 0;
  _$jscoverage['/editor/range.js'].lineData[695] = 0;
  _$jscoverage['/editor/range.js'].lineData[697] = 0;
  _$jscoverage['/editor/range.js'].lineData[705] = 0;
  _$jscoverage['/editor/range.js'].lineData[708] = 0;
  _$jscoverage['/editor/range.js'].lineData[709] = 0;
  _$jscoverage['/editor/range.js'].lineData[710] = 0;
  _$jscoverage['/editor/range.js'].lineData[711] = 0;
  _$jscoverage['/editor/range.js'].lineData[712] = 0;
  _$jscoverage['/editor/range.js'].lineData[714] = 0;
  _$jscoverage['/editor/range.js'].lineData[726] = 0;
  _$jscoverage['/editor/range.js'].lineData[729] = 0;
  _$jscoverage['/editor/range.js'].lineData[731] = 0;
  _$jscoverage['/editor/range.js'].lineData[733] = 0;
  _$jscoverage['/editor/range.js'].lineData[736] = 0;
  _$jscoverage['/editor/range.js'].lineData[739] = 0;
  _$jscoverage['/editor/range.js'].lineData[740] = 0;
  _$jscoverage['/editor/range.js'].lineData[747] = 0;
  _$jscoverage['/editor/range.js'].lineData[748] = 0;
  _$jscoverage['/editor/range.js'].lineData[749] = 0;
  _$jscoverage['/editor/range.js'].lineData[751] = 0;
  _$jscoverage['/editor/range.js'].lineData[761] = 0;
  _$jscoverage['/editor/range.js'].lineData[762] = 0;
  _$jscoverage['/editor/range.js'].lineData[763] = 0;
  _$jscoverage['/editor/range.js'].lineData[765] = 0;
  _$jscoverage['/editor/range.js'].lineData[776] = 0;
  _$jscoverage['/editor/range.js'].lineData[778] = 0;
  _$jscoverage['/editor/range.js'].lineData[779] = 0;
  _$jscoverage['/editor/range.js'].lineData[780] = 0;
  _$jscoverage['/editor/range.js'].lineData[781] = 0;
  _$jscoverage['/editor/range.js'].lineData[785] = 0;
  _$jscoverage['/editor/range.js'].lineData[786] = 0;
  _$jscoverage['/editor/range.js'].lineData[790] = 0;
  _$jscoverage['/editor/range.js'].lineData[792] = 0;
  _$jscoverage['/editor/range.js'].lineData[793] = 0;
  _$jscoverage['/editor/range.js'].lineData[794] = 0;
  _$jscoverage['/editor/range.js'].lineData[795] = 0;
  _$jscoverage['/editor/range.js'].lineData[797] = 0;
  _$jscoverage['/editor/range.js'].lineData[798] = 0;
  _$jscoverage['/editor/range.js'].lineData[802] = 0;
  _$jscoverage['/editor/range.js'].lineData[804] = 0;
  _$jscoverage['/editor/range.js'].lineData[806] = 0;
  _$jscoverage['/editor/range.js'].lineData[807] = 0;
  _$jscoverage['/editor/range.js'].lineData[811] = 0;
  _$jscoverage['/editor/range.js'].lineData[813] = 0;
  _$jscoverage['/editor/range.js'].lineData[815] = 0;
  _$jscoverage['/editor/range.js'].lineData[818] = 0;
  _$jscoverage['/editor/range.js'].lineData[819] = 0;
  _$jscoverage['/editor/range.js'].lineData[821] = 0;
  _$jscoverage['/editor/range.js'].lineData[822] = 0;
  _$jscoverage['/editor/range.js'].lineData[824] = 0;
  _$jscoverage['/editor/range.js'].lineData[829] = 0;
  _$jscoverage['/editor/range.js'].lineData[830] = 0;
  _$jscoverage['/editor/range.js'].lineData[831] = 0;
  _$jscoverage['/editor/range.js'].lineData[832] = 0;
  _$jscoverage['/editor/range.js'].lineData[836] = 0;
  _$jscoverage['/editor/range.js'].lineData[837] = 0;
  _$jscoverage['/editor/range.js'].lineData[838] = 0;
  _$jscoverage['/editor/range.js'].lineData[839] = 0;
  _$jscoverage['/editor/range.js'].lineData[840] = 0;
  _$jscoverage['/editor/range.js'].lineData[844] = 0;
  _$jscoverage['/editor/range.js'].lineData[854] = 0;
  _$jscoverage['/editor/range.js'].lineData[864] = 0;
  _$jscoverage['/editor/range.js'].lineData[865] = 0;
  _$jscoverage['/editor/range.js'].lineData[871] = 0;
  _$jscoverage['/editor/range.js'].lineData[874] = 0;
  _$jscoverage['/editor/range.js'].lineData[875] = 0;
  _$jscoverage['/editor/range.js'].lineData[879] = 0;
  _$jscoverage['/editor/range.js'].lineData[881] = 0;
  _$jscoverage['/editor/range.js'].lineData[882] = 0;
  _$jscoverage['/editor/range.js'].lineData[888] = 0;
  _$jscoverage['/editor/range.js'].lineData[891] = 0;
  _$jscoverage['/editor/range.js'].lineData[892] = 0;
  _$jscoverage['/editor/range.js'].lineData[896] = 0;
  _$jscoverage['/editor/range.js'].lineData[899] = 0;
  _$jscoverage['/editor/range.js'].lineData[900] = 0;
  _$jscoverage['/editor/range.js'].lineData[904] = 0;
  _$jscoverage['/editor/range.js'].lineData[907] = 0;
  _$jscoverage['/editor/range.js'].lineData[908] = 0;
  _$jscoverage['/editor/range.js'].lineData[913] = 0;
  _$jscoverage['/editor/range.js'].lineData[916] = 0;
  _$jscoverage['/editor/range.js'].lineData[917] = 0;
  _$jscoverage['/editor/range.js'].lineData[922] = 0;
  _$jscoverage['/editor/range.js'].lineData[936] = 0;
  _$jscoverage['/editor/range.js'].lineData[942] = 0;
  _$jscoverage['/editor/range.js'].lineData[943] = 0;
  _$jscoverage['/editor/range.js'].lineData[944] = 0;
  _$jscoverage['/editor/range.js'].lineData[948] = 0;
  _$jscoverage['/editor/range.js'].lineData[950] = 0;
  _$jscoverage['/editor/range.js'].lineData[951] = 0;
  _$jscoverage['/editor/range.js'].lineData[952] = 0;
  _$jscoverage['/editor/range.js'].lineData[956] = 0;
  _$jscoverage['/editor/range.js'].lineData[957] = 0;
  _$jscoverage['/editor/range.js'].lineData[958] = 0;
  _$jscoverage['/editor/range.js'].lineData[960] = 0;
  _$jscoverage['/editor/range.js'].lineData[961] = 0;
  _$jscoverage['/editor/range.js'].lineData[964] = 0;
  _$jscoverage['/editor/range.js'].lineData[965] = 0;
  _$jscoverage['/editor/range.js'].lineData[966] = 0;
  _$jscoverage['/editor/range.js'].lineData[969] = 0;
  _$jscoverage['/editor/range.js'].lineData[970] = 0;
  _$jscoverage['/editor/range.js'].lineData[971] = 0;
  _$jscoverage['/editor/range.js'].lineData[974] = 0;
  _$jscoverage['/editor/range.js'].lineData[975] = 0;
  _$jscoverage['/editor/range.js'].lineData[976] = 0;
  _$jscoverage['/editor/range.js'].lineData[978] = 0;
  _$jscoverage['/editor/range.js'].lineData[981] = 0;
  _$jscoverage['/editor/range.js'].lineData[995] = 0;
  _$jscoverage['/editor/range.js'].lineData[996] = 0;
  _$jscoverage['/editor/range.js'].lineData[997] = 0;
  _$jscoverage['/editor/range.js'].lineData[1006] = 0;
  _$jscoverage['/editor/range.js'].lineData[1011] = 0;
  _$jscoverage['/editor/range.js'].lineData[1016] = 0;
  _$jscoverage['/editor/range.js'].lineData[1017] = 0;
  _$jscoverage['/editor/range.js'].lineData[1018] = 0;
  _$jscoverage['/editor/range.js'].lineData[1022] = 0;
  _$jscoverage['/editor/range.js'].lineData[1023] = 0;
  _$jscoverage['/editor/range.js'].lineData[1024] = 0;
  _$jscoverage['/editor/range.js'].lineData[1029] = 0;
  _$jscoverage['/editor/range.js'].lineData[1031] = 0;
  _$jscoverage['/editor/range.js'].lineData[1032] = 0;
  _$jscoverage['/editor/range.js'].lineData[1035] = 0;
  _$jscoverage['/editor/range.js'].lineData[1036] = 0;
  _$jscoverage['/editor/range.js'].lineData[1037] = 0;
  _$jscoverage['/editor/range.js'].lineData[1038] = 0;
  _$jscoverage['/editor/range.js'].lineData[1042] = 0;
  _$jscoverage['/editor/range.js'].lineData[1044] = 0;
  _$jscoverage['/editor/range.js'].lineData[1045] = 0;
  _$jscoverage['/editor/range.js'].lineData[1046] = 0;
  _$jscoverage['/editor/range.js'].lineData[1050] = 0;
  _$jscoverage['/editor/range.js'].lineData[1053] = 0;
  _$jscoverage['/editor/range.js'].lineData[1057] = 0;
  _$jscoverage['/editor/range.js'].lineData[1058] = 0;
  _$jscoverage['/editor/range.js'].lineData[1059] = 0;
  _$jscoverage['/editor/range.js'].lineData[1063] = 0;
  _$jscoverage['/editor/range.js'].lineData[1064] = 0;
  _$jscoverage['/editor/range.js'].lineData[1065] = 0;
  _$jscoverage['/editor/range.js'].lineData[1070] = 0;
  _$jscoverage['/editor/range.js'].lineData[1072] = 0;
  _$jscoverage['/editor/range.js'].lineData[1073] = 0;
  _$jscoverage['/editor/range.js'].lineData[1076] = 0;
  _$jscoverage['/editor/range.js'].lineData[1084] = 0;
  _$jscoverage['/editor/range.js'].lineData[1085] = 0;
  _$jscoverage['/editor/range.js'].lineData[1086] = 0;
  _$jscoverage['/editor/range.js'].lineData[1087] = 0;
  _$jscoverage['/editor/range.js'].lineData[1091] = 0;
  _$jscoverage['/editor/range.js'].lineData[1093] = 0;
  _$jscoverage['/editor/range.js'].lineData[1094] = 0;
  _$jscoverage['/editor/range.js'].lineData[1097] = 0;
  _$jscoverage['/editor/range.js'].lineData[1105] = 0;
  _$jscoverage['/editor/range.js'].lineData[1107] = 0;
  _$jscoverage['/editor/range.js'].lineData[1109] = 0;
  _$jscoverage['/editor/range.js'].lineData[1115] = 0;
  _$jscoverage['/editor/range.js'].lineData[1118] = 0;
  _$jscoverage['/editor/range.js'].lineData[1119] = 0;
  _$jscoverage['/editor/range.js'].lineData[1121] = 0;
  _$jscoverage['/editor/range.js'].lineData[1125] = 0;
  _$jscoverage['/editor/range.js'].lineData[1132] = 0;
  _$jscoverage['/editor/range.js'].lineData[1135] = 0;
  _$jscoverage['/editor/range.js'].lineData[1139] = 0;
  _$jscoverage['/editor/range.js'].lineData[1140] = 0;
  _$jscoverage['/editor/range.js'].lineData[1141] = 0;
  _$jscoverage['/editor/range.js'].lineData[1143] = 0;
  _$jscoverage['/editor/range.js'].lineData[1154] = 0;
  _$jscoverage['/editor/range.js'].lineData[1159] = 0;
  _$jscoverage['/editor/range.js'].lineData[1160] = 0;
  _$jscoverage['/editor/range.js'].lineData[1163] = 0;
  _$jscoverage['/editor/range.js'].lineData[1165] = 0;
  _$jscoverage['/editor/range.js'].lineData[1168] = 0;
  _$jscoverage['/editor/range.js'].lineData[1171] = 0;
  _$jscoverage['/editor/range.js'].lineData[1185] = 0;
  _$jscoverage['/editor/range.js'].lineData[1186] = 0;
  _$jscoverage['/editor/range.js'].lineData[1194] = 0;
  _$jscoverage['/editor/range.js'].lineData[1195] = 0;
  _$jscoverage['/editor/range.js'].lineData[1197] = 0;
  _$jscoverage['/editor/range.js'].lineData[1198] = 0;
  _$jscoverage['/editor/range.js'].lineData[1201] = 0;
  _$jscoverage['/editor/range.js'].lineData[1202] = 0;
  _$jscoverage['/editor/range.js'].lineData[1207] = 0;
  _$jscoverage['/editor/range.js'].lineData[1209] = 0;
  _$jscoverage['/editor/range.js'].lineData[1212] = 0;
  _$jscoverage['/editor/range.js'].lineData[1214] = 0;
  _$jscoverage['/editor/range.js'].lineData[1217] = 0;
  _$jscoverage['/editor/range.js'].lineData[1219] = 0;
  _$jscoverage['/editor/range.js'].lineData[1220] = 0;
  _$jscoverage['/editor/range.js'].lineData[1221] = 0;
  _$jscoverage['/editor/range.js'].lineData[1223] = 0;
  _$jscoverage['/editor/range.js'].lineData[1228] = 0;
  _$jscoverage['/editor/range.js'].lineData[1230] = 0;
  _$jscoverage['/editor/range.js'].lineData[1232] = 0;
  _$jscoverage['/editor/range.js'].lineData[1234] = 0;
  _$jscoverage['/editor/range.js'].lineData[1241] = 0;
  _$jscoverage['/editor/range.js'].lineData[1243] = 0;
  _$jscoverage['/editor/range.js'].lineData[1244] = 0;
  _$jscoverage['/editor/range.js'].lineData[1247] = 0;
  _$jscoverage['/editor/range.js'].lineData[1248] = 0;
  _$jscoverage['/editor/range.js'].lineData[1249] = 0;
  _$jscoverage['/editor/range.js'].lineData[1252] = 0;
  _$jscoverage['/editor/range.js'].lineData[1255] = 0;
  _$jscoverage['/editor/range.js'].lineData[1256] = 0;
  _$jscoverage['/editor/range.js'].lineData[1261] = 0;
  _$jscoverage['/editor/range.js'].lineData[1262] = 0;
  _$jscoverage['/editor/range.js'].lineData[1263] = 0;
  _$jscoverage['/editor/range.js'].lineData[1266] = 0;
  _$jscoverage['/editor/range.js'].lineData[1267] = 0;
  _$jscoverage['/editor/range.js'].lineData[1270] = 0;
  _$jscoverage['/editor/range.js'].lineData[1273] = 0;
  _$jscoverage['/editor/range.js'].lineData[1274] = 0;
  _$jscoverage['/editor/range.js'].lineData[1276] = 0;
  _$jscoverage['/editor/range.js'].lineData[1277] = 0;
  _$jscoverage['/editor/range.js'].lineData[1278] = 0;
  _$jscoverage['/editor/range.js'].lineData[1279] = 0;
  _$jscoverage['/editor/range.js'].lineData[1282] = 0;
  _$jscoverage['/editor/range.js'].lineData[1288] = 0;
  _$jscoverage['/editor/range.js'].lineData[1289] = 0;
  _$jscoverage['/editor/range.js'].lineData[1291] = 0;
  _$jscoverage['/editor/range.js'].lineData[1292] = 0;
  _$jscoverage['/editor/range.js'].lineData[1294] = 0;
  _$jscoverage['/editor/range.js'].lineData[1302] = 0;
  _$jscoverage['/editor/range.js'].lineData[1303] = 0;
  _$jscoverage['/editor/range.js'].lineData[1304] = 0;
  _$jscoverage['/editor/range.js'].lineData[1306] = 0;
  _$jscoverage['/editor/range.js'].lineData[1310] = 0;
  _$jscoverage['/editor/range.js'].lineData[1311] = 0;
  _$jscoverage['/editor/range.js'].lineData[1312] = 0;
  _$jscoverage['/editor/range.js'].lineData[1314] = 0;
  _$jscoverage['/editor/range.js'].lineData[1317] = 0;
  _$jscoverage['/editor/range.js'].lineData[1319] = 0;
  _$jscoverage['/editor/range.js'].lineData[1322] = 0;
  _$jscoverage['/editor/range.js'].lineData[1326] = 0;
  _$jscoverage['/editor/range.js'].lineData[1342] = 0;
  _$jscoverage['/editor/range.js'].lineData[1343] = 0;
  _$jscoverage['/editor/range.js'].lineData[1344] = 0;
  _$jscoverage['/editor/range.js'].lineData[1345] = 0;
  _$jscoverage['/editor/range.js'].lineData[1348] = 0;
  _$jscoverage['/editor/range.js'].lineData[1350] = 0;
  _$jscoverage['/editor/range.js'].lineData[1353] = 0;
  _$jscoverage['/editor/range.js'].lineData[1356] = 0;
  _$jscoverage['/editor/range.js'].lineData[1360] = 0;
  _$jscoverage['/editor/range.js'].lineData[1368] = 0;
  _$jscoverage['/editor/range.js'].lineData[1369] = 0;
  _$jscoverage['/editor/range.js'].lineData[1380] = 0;
  _$jscoverage['/editor/range.js'].lineData[1386] = 0;
  _$jscoverage['/editor/range.js'].lineData[1387] = 0;
  _$jscoverage['/editor/range.js'].lineData[1388] = 0;
  _$jscoverage['/editor/range.js'].lineData[1389] = 0;
  _$jscoverage['/editor/range.js'].lineData[1396] = 0;
  _$jscoverage['/editor/range.js'].lineData[1400] = 0;
  _$jscoverage['/editor/range.js'].lineData[1403] = 0;
  _$jscoverage['/editor/range.js'].lineData[1404] = 0;
  _$jscoverage['/editor/range.js'].lineData[1405] = 0;
  _$jscoverage['/editor/range.js'].lineData[1407] = 0;
  _$jscoverage['/editor/range.js'].lineData[1408] = 0;
  _$jscoverage['/editor/range.js'].lineData[1410] = 0;
  _$jscoverage['/editor/range.js'].lineData[1418] = 0;
  _$jscoverage['/editor/range.js'].lineData[1423] = 0;
  _$jscoverage['/editor/range.js'].lineData[1424] = 0;
  _$jscoverage['/editor/range.js'].lineData[1425] = 0;
  _$jscoverage['/editor/range.js'].lineData[1426] = 0;
  _$jscoverage['/editor/range.js'].lineData[1433] = 0;
  _$jscoverage['/editor/range.js'].lineData[1437] = 0;
  _$jscoverage['/editor/range.js'].lineData[1440] = 0;
  _$jscoverage['/editor/range.js'].lineData[1441] = 0;
  _$jscoverage['/editor/range.js'].lineData[1442] = 0;
  _$jscoverage['/editor/range.js'].lineData[1444] = 0;
  _$jscoverage['/editor/range.js'].lineData[1445] = 0;
  _$jscoverage['/editor/range.js'].lineData[1447] = 0;
  _$jscoverage['/editor/range.js'].lineData[1456] = 0;
  _$jscoverage['/editor/range.js'].lineData[1460] = 0;
  _$jscoverage['/editor/range.js'].lineData[1464] = 0;
  _$jscoverage['/editor/range.js'].lineData[1466] = 0;
  _$jscoverage['/editor/range.js'].lineData[1467] = 0;
  _$jscoverage['/editor/range.js'].lineData[1476] = 0;
  _$jscoverage['/editor/range.js'].lineData[1483] = 0;
  _$jscoverage['/editor/range.js'].lineData[1484] = 0;
  _$jscoverage['/editor/range.js'].lineData[1485] = 0;
  _$jscoverage['/editor/range.js'].lineData[1486] = 0;
  _$jscoverage['/editor/range.js'].lineData[1487] = 0;
  _$jscoverage['/editor/range.js'].lineData[1489] = 0;
  _$jscoverage['/editor/range.js'].lineData[1493] = 0;
  _$jscoverage['/editor/range.js'].lineData[1494] = 0;
  _$jscoverage['/editor/range.js'].lineData[1495] = 0;
  _$jscoverage['/editor/range.js'].lineData[1498] = 0;
  _$jscoverage['/editor/range.js'].lineData[1503] = 0;
  _$jscoverage['/editor/range.js'].lineData[1507] = 0;
  _$jscoverage['/editor/range.js'].lineData[1508] = 0;
  _$jscoverage['/editor/range.js'].lineData[1509] = 0;
  _$jscoverage['/editor/range.js'].lineData[1510] = 0;
  _$jscoverage['/editor/range.js'].lineData[1513] = 0;
  _$jscoverage['/editor/range.js'].lineData[1514] = 0;
  _$jscoverage['/editor/range.js'].lineData[1518] = 0;
  _$jscoverage['/editor/range.js'].lineData[1519] = 0;
  _$jscoverage['/editor/range.js'].lineData[1520] = 0;
  _$jscoverage['/editor/range.js'].lineData[1521] = 0;
  _$jscoverage['/editor/range.js'].lineData[1527] = 0;
  _$jscoverage['/editor/range.js'].lineData[1528] = 0;
  _$jscoverage['/editor/range.js'].lineData[1531] = 0;
  _$jscoverage['/editor/range.js'].lineData[1542] = 0;
  _$jscoverage['/editor/range.js'].lineData[1545] = 0;
  _$jscoverage['/editor/range.js'].lineData[1546] = 0;
  _$jscoverage['/editor/range.js'].lineData[1547] = 0;
  _$jscoverage['/editor/range.js'].lineData[1548] = 0;
  _$jscoverage['/editor/range.js'].lineData[1549] = 0;
  _$jscoverage['/editor/range.js'].lineData[1550] = 0;
  _$jscoverage['/editor/range.js'].lineData[1552] = 0;
  _$jscoverage['/editor/range.js'].lineData[1553] = 0;
  _$jscoverage['/editor/range.js'].lineData[1554] = 0;
  _$jscoverage['/editor/range.js'].lineData[1563] = 0;
  _$jscoverage['/editor/range.js'].lineData[1573] = 0;
  _$jscoverage['/editor/range.js'].lineData[1574] = 0;
  _$jscoverage['/editor/range.js'].lineData[1578] = 0;
  _$jscoverage['/editor/range.js'].lineData[1579] = 0;
  _$jscoverage['/editor/range.js'].lineData[1580] = 0;
  _$jscoverage['/editor/range.js'].lineData[1581] = 0;
  _$jscoverage['/editor/range.js'].lineData[1584] = 0;
  _$jscoverage['/editor/range.js'].lineData[1585] = 0;
  _$jscoverage['/editor/range.js'].lineData[1590] = 0;
  _$jscoverage['/editor/range.js'].lineData[1594] = 0;
  _$jscoverage['/editor/range.js'].lineData[1596] = 0;
  _$jscoverage['/editor/range.js'].lineData[1597] = 0;
  _$jscoverage['/editor/range.js'].lineData[1598] = 0;
  _$jscoverage['/editor/range.js'].lineData[1599] = 0;
  _$jscoverage['/editor/range.js'].lineData[1600] = 0;
  _$jscoverage['/editor/range.js'].lineData[1602] = 0;
  _$jscoverage['/editor/range.js'].lineData[1603] = 0;
  _$jscoverage['/editor/range.js'].lineData[1604] = 0;
  _$jscoverage['/editor/range.js'].lineData[1605] = 0;
  _$jscoverage['/editor/range.js'].lineData[1608] = 0;
  _$jscoverage['/editor/range.js'].lineData[1612] = 0;
  _$jscoverage['/editor/range.js'].lineData[1613] = 0;
  _$jscoverage['/editor/range.js'].lineData[1618] = 0;
  _$jscoverage['/editor/range.js'].lineData[1633] = 0;
  _$jscoverage['/editor/range.js'].lineData[1634] = 0;
  _$jscoverage['/editor/range.js'].lineData[1635] = 0;
  _$jscoverage['/editor/range.js'].lineData[1639] = 0;
  _$jscoverage['/editor/range.js'].lineData[1640] = 0;
  _$jscoverage['/editor/range.js'].lineData[1645] = 0;
  _$jscoverage['/editor/range.js'].lineData[1647] = 0;
  _$jscoverage['/editor/range.js'].lineData[1648] = 0;
  _$jscoverage['/editor/range.js'].lineData[1649] = 0;
  _$jscoverage['/editor/range.js'].lineData[1661] = 0;
  _$jscoverage['/editor/range.js'].lineData[1662] = 0;
  _$jscoverage['/editor/range.js'].lineData[1664] = 0;
  _$jscoverage['/editor/range.js'].lineData[1666] = 0;
  _$jscoverage['/editor/range.js'].lineData[1669] = 0;
  _$jscoverage['/editor/range.js'].lineData[1670] = 0;
  _$jscoverage['/editor/range.js'].lineData[1673] = 0;
  _$jscoverage['/editor/range.js'].lineData[1676] = 0;
  _$jscoverage['/editor/range.js'].lineData[1678] = 0;
  _$jscoverage['/editor/range.js'].lineData[1680] = 0;
  _$jscoverage['/editor/range.js'].lineData[1681] = 0;
  _$jscoverage['/editor/range.js'].lineData[1684] = 0;
  _$jscoverage['/editor/range.js'].lineData[1685] = 0;
  _$jscoverage['/editor/range.js'].lineData[1689] = 0;
  _$jscoverage['/editor/range.js'].lineData[1690] = 0;
  _$jscoverage['/editor/range.js'].lineData[1693] = 0;
  _$jscoverage['/editor/range.js'].lineData[1696] = 0;
  _$jscoverage['/editor/range.js'].lineData[1699] = 0;
  _$jscoverage['/editor/range.js'].lineData[1707] = 0;
  _$jscoverage['/editor/range.js'].lineData[1708] = 0;
  _$jscoverage['/editor/range.js'].lineData[1709] = 0;
  _$jscoverage['/editor/range.js'].lineData[1719] = 0;
  _$jscoverage['/editor/range.js'].lineData[1725] = 0;
  _$jscoverage['/editor/range.js'].lineData[1726] = 0;
  _$jscoverage['/editor/range.js'].lineData[1727] = 0;
  _$jscoverage['/editor/range.js'].lineData[1728] = 0;
  _$jscoverage['/editor/range.js'].lineData[1729] = 0;
  _$jscoverage['/editor/range.js'].lineData[1732] = 0;
  _$jscoverage['/editor/range.js'].lineData[1733] = 0;
  _$jscoverage['/editor/range.js'].lineData[1734] = 0;
  _$jscoverage['/editor/range.js'].lineData[1735] = 0;
  _$jscoverage['/editor/range.js'].lineData[1737] = 0;
  _$jscoverage['/editor/range.js'].lineData[1739] = 0;
  _$jscoverage['/editor/range.js'].lineData[1742] = 0;
  _$jscoverage['/editor/range.js'].lineData[1743] = 0;
  _$jscoverage['/editor/range.js'].lineData[1747] = 0;
  _$jscoverage['/editor/range.js'].lineData[1751] = 0;
  _$jscoverage['/editor/range.js'].lineData[1753] = 0;
  _$jscoverage['/editor/range.js'].lineData[1754] = 0;
  _$jscoverage['/editor/range.js'].lineData[1756] = 0;
  _$jscoverage['/editor/range.js'].lineData[1762] = 0;
  _$jscoverage['/editor/range.js'].lineData[1763] = 0;
  _$jscoverage['/editor/range.js'].lineData[1766] = 0;
  _$jscoverage['/editor/range.js'].lineData[1769] = 0;
  _$jscoverage['/editor/range.js'].lineData[1772] = 0;
  _$jscoverage['/editor/range.js'].lineData[1776] = 0;
  _$jscoverage['/editor/range.js'].lineData[1778] = 0;
}
if (! _$jscoverage['/editor/range.js'].functionData) {
  _$jscoverage['/editor/range.js'].functionData = [];
  _$jscoverage['/editor/range.js'].functionData[0] = 0;
  _$jscoverage['/editor/range.js'].functionData[1] = 0;
  _$jscoverage['/editor/range.js'].functionData[2] = 0;
  _$jscoverage['/editor/range.js'].functionData[3] = 0;
  _$jscoverage['/editor/range.js'].functionData[4] = 0;
  _$jscoverage['/editor/range.js'].functionData[5] = 0;
  _$jscoverage['/editor/range.js'].functionData[6] = 0;
  _$jscoverage['/editor/range.js'].functionData[7] = 0;
  _$jscoverage['/editor/range.js'].functionData[8] = 0;
  _$jscoverage['/editor/range.js'].functionData[9] = 0;
  _$jscoverage['/editor/range.js'].functionData[10] = 0;
  _$jscoverage['/editor/range.js'].functionData[11] = 0;
  _$jscoverage['/editor/range.js'].functionData[12] = 0;
  _$jscoverage['/editor/range.js'].functionData[13] = 0;
  _$jscoverage['/editor/range.js'].functionData[14] = 0;
  _$jscoverage['/editor/range.js'].functionData[15] = 0;
  _$jscoverage['/editor/range.js'].functionData[16] = 0;
  _$jscoverage['/editor/range.js'].functionData[17] = 0;
  _$jscoverage['/editor/range.js'].functionData[18] = 0;
  _$jscoverage['/editor/range.js'].functionData[19] = 0;
  _$jscoverage['/editor/range.js'].functionData[20] = 0;
  _$jscoverage['/editor/range.js'].functionData[21] = 0;
  _$jscoverage['/editor/range.js'].functionData[22] = 0;
  _$jscoverage['/editor/range.js'].functionData[23] = 0;
  _$jscoverage['/editor/range.js'].functionData[24] = 0;
  _$jscoverage['/editor/range.js'].functionData[25] = 0;
  _$jscoverage['/editor/range.js'].functionData[26] = 0;
  _$jscoverage['/editor/range.js'].functionData[27] = 0;
  _$jscoverage['/editor/range.js'].functionData[28] = 0;
  _$jscoverage['/editor/range.js'].functionData[29] = 0;
  _$jscoverage['/editor/range.js'].functionData[30] = 0;
  _$jscoverage['/editor/range.js'].functionData[31] = 0;
  _$jscoverage['/editor/range.js'].functionData[32] = 0;
  _$jscoverage['/editor/range.js'].functionData[33] = 0;
  _$jscoverage['/editor/range.js'].functionData[34] = 0;
  _$jscoverage['/editor/range.js'].functionData[35] = 0;
  _$jscoverage['/editor/range.js'].functionData[36] = 0;
  _$jscoverage['/editor/range.js'].functionData[37] = 0;
  _$jscoverage['/editor/range.js'].functionData[38] = 0;
  _$jscoverage['/editor/range.js'].functionData[39] = 0;
  _$jscoverage['/editor/range.js'].functionData[40] = 0;
  _$jscoverage['/editor/range.js'].functionData[41] = 0;
  _$jscoverage['/editor/range.js'].functionData[42] = 0;
  _$jscoverage['/editor/range.js'].functionData[43] = 0;
  _$jscoverage['/editor/range.js'].functionData[44] = 0;
  _$jscoverage['/editor/range.js'].functionData[45] = 0;
  _$jscoverage['/editor/range.js'].functionData[46] = 0;
  _$jscoverage['/editor/range.js'].functionData[47] = 0;
  _$jscoverage['/editor/range.js'].functionData[48] = 0;
  _$jscoverage['/editor/range.js'].functionData[49] = 0;
  _$jscoverage['/editor/range.js'].functionData[50] = 0;
  _$jscoverage['/editor/range.js'].functionData[51] = 0;
  _$jscoverage['/editor/range.js'].functionData[52] = 0;
  _$jscoverage['/editor/range.js'].functionData[53] = 0;
  _$jscoverage['/editor/range.js'].functionData[54] = 0;
}
if (! _$jscoverage['/editor/range.js'].branchData) {
  _$jscoverage['/editor/range.js'].branchData = {};
  _$jscoverage['/editor/range.js'].branchData['69'] = [];
  _$jscoverage['/editor/range.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['69'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['72'] = [];
  _$jscoverage['/editor/range.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['72'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['75'] = [];
  _$jscoverage['/editor/range.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['80'] = [];
  _$jscoverage['/editor/range.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['87'] = [];
  _$jscoverage['/editor/range.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['90'] = [];
  _$jscoverage['/editor/range.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['92'] = [];
  _$jscoverage['/editor/range.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['95'] = [];
  _$jscoverage['/editor/range.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['99'] = [];
  _$jscoverage['/editor/range.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['102'] = [];
  _$jscoverage['/editor/range.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['102'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['102'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['102'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['135'] = [];
  _$jscoverage['/editor/range.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['139'] = [];
  _$jscoverage['/editor/range.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['152'] = [];
  _$jscoverage['/editor/range.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['158'] = [];
  _$jscoverage['/editor/range.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['160'] = [];
  _$jscoverage['/editor/range.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['176'] = [];
  _$jscoverage['/editor/range.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['185'] = [];
  _$jscoverage['/editor/range.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['192'] = [];
  _$jscoverage['/editor/range.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['220'] = [];
  _$jscoverage['/editor/range.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['228'] = [];
  _$jscoverage['/editor/range.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['241'] = [];
  _$jscoverage['/editor/range.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['245'] = [];
  _$jscoverage['/editor/range.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['245'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['257'] = [];
  _$jscoverage['/editor/range.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['262'] = [];
  _$jscoverage['/editor/range.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['262'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['262'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['270'] = [];
  _$jscoverage['/editor/range.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['277'] = [];
  _$jscoverage['/editor/range.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['287'] = [];
  _$jscoverage['/editor/range.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['296'] = [];
  _$jscoverage['/editor/range.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['305'] = [];
  _$jscoverage['/editor/range.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['309'] = [];
  _$jscoverage['/editor/range.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['309'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['319'] = [];
  _$jscoverage['/editor/range.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['329'] = [];
  _$jscoverage['/editor/range.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['337'] = [];
  _$jscoverage['/editor/range.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['347'] = [];
  _$jscoverage['/editor/range.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['352'] = [];
  _$jscoverage['/editor/range.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['356'] = [];
  _$jscoverage['/editor/range.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['358'] = [];
  _$jscoverage['/editor/range.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['358'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['359'] = [];
  _$jscoverage['/editor/range.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['361'] = [];
  _$jscoverage['/editor/range.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['367'] = [];
  _$jscoverage['/editor/range.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['369'] = [];
  _$jscoverage['/editor/range.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['369'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['370'] = [];
  _$jscoverage['/editor/range.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['371'] = [];
  _$jscoverage['/editor/range.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['384'] = [];
  _$jscoverage['/editor/range.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['384'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['386'] = [];
  _$jscoverage['/editor/range.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['394'] = [];
  _$jscoverage['/editor/range.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['409'] = [];
  _$jscoverage['/editor/range.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['413'] = [];
  _$jscoverage['/editor/range.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['422'] = [];
  _$jscoverage['/editor/range.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['423'] = [];
  _$jscoverage['/editor/range.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['424'] = [];
  _$jscoverage['/editor/range.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['424'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['425'] = [];
  _$jscoverage['/editor/range.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['454'] = [];
  _$jscoverage['/editor/range.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['455'] = [];
  _$jscoverage['/editor/range.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['470'] = [];
  _$jscoverage['/editor/range.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['471'] = [];
  _$jscoverage['/editor/range.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['473'] = [];
  _$jscoverage['/editor/range.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['481'] = [];
  _$jscoverage['/editor/range.js'].branchData['481'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['482'] = [];
  _$jscoverage['/editor/range.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['484'] = [];
  _$jscoverage['/editor/range.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['527'] = [];
  _$jscoverage['/editor/range.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['528'] = [];
  _$jscoverage['/editor/range.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['528'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['532'] = [];
  _$jscoverage['/editor/range.js'].branchData['532'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['533'] = [];
  _$jscoverage['/editor/range.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['533'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['554'] = [];
  _$jscoverage['/editor/range.js'].branchData['554'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['554'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['562'] = [];
  _$jscoverage['/editor/range.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['585'] = [];
  _$jscoverage['/editor/range.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['585'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['593'] = [];
  _$jscoverage['/editor/range.js'].branchData['593'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['614'] = [];
  _$jscoverage['/editor/range.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['645'] = [];
  _$jscoverage['/editor/range.js'].branchData['645'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['690'] = [];
  _$jscoverage['/editor/range.js'].branchData['690'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['731'] = [];
  _$jscoverage['/editor/range.js'].branchData['731'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['731'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['732'] = [];
  _$jscoverage['/editor/range.js'].branchData['732'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['740'] = [];
  _$jscoverage['/editor/range.js'].branchData['740'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['751'] = [];
  _$jscoverage['/editor/range.js'].branchData['751'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['762'] = [];
  _$jscoverage['/editor/range.js'].branchData['762'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['763'] = [];
  _$jscoverage['/editor/range.js'].branchData['763'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['776'] = [];
  _$jscoverage['/editor/range.js'].branchData['776'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['777'] = [];
  _$jscoverage['/editor/range.js'].branchData['777'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['778'] = [];
  _$jscoverage['/editor/range.js'].branchData['778'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['780'] = [];
  _$jscoverage['/editor/range.js'].branchData['780'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['790'] = [];
  _$jscoverage['/editor/range.js'].branchData['790'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['791'] = [];
  _$jscoverage['/editor/range.js'].branchData['791'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['792'] = [];
  _$jscoverage['/editor/range.js'].branchData['792'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['794'] = [];
  _$jscoverage['/editor/range.js'].branchData['794'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['802'] = [];
  _$jscoverage['/editor/range.js'].branchData['802'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['807'] = [];
  _$jscoverage['/editor/range.js'].branchData['807'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['807'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['813'] = [];
  _$jscoverage['/editor/range.js'].branchData['813'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['813'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['814'] = [];
  _$jscoverage['/editor/range.js'].branchData['814'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['818'] = [];
  _$jscoverage['/editor/range.js'].branchData['818'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['818'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['821'] = [];
  _$jscoverage['/editor/range.js'].branchData['821'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['821'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['829'] = [];
  _$jscoverage['/editor/range.js'].branchData['829'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['830'] = [];
  _$jscoverage['/editor/range.js'].branchData['830'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['831'] = [];
  _$jscoverage['/editor/range.js'].branchData['831'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['836'] = [];
  _$jscoverage['/editor/range.js'].branchData['836'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['838'] = [];
  _$jscoverage['/editor/range.js'].branchData['838'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['839'] = [];
  _$jscoverage['/editor/range.js'].branchData['839'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['844'] = [];
  _$jscoverage['/editor/range.js'].branchData['844'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['864'] = [];
  _$jscoverage['/editor/range.js'].branchData['864'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['871'] = [];
  _$jscoverage['/editor/range.js'].branchData['871'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['874'] = [];
  _$jscoverage['/editor/range.js'].branchData['874'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['879'] = [];
  _$jscoverage['/editor/range.js'].branchData['879'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['879'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['879'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['879'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['880'] = [];
  _$jscoverage['/editor/range.js'].branchData['880'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['880'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['880'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['888'] = [];
  _$jscoverage['/editor/range.js'].branchData['888'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['888'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['889'] = [];
  _$jscoverage['/editor/range.js'].branchData['889'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['890'] = [];
  _$jscoverage['/editor/range.js'].branchData['890'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['896'] = [];
  _$jscoverage['/editor/range.js'].branchData['896'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['899'] = [];
  _$jscoverage['/editor/range.js'].branchData['899'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['904'] = [];
  _$jscoverage['/editor/range.js'].branchData['904'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['904'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['905'] = [];
  _$jscoverage['/editor/range.js'].branchData['905'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['905'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['905'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['905'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['906'] = [];
  _$jscoverage['/editor/range.js'].branchData['906'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['913'] = [];
  _$jscoverage['/editor/range.js'].branchData['913'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['913'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['914'] = [];
  _$jscoverage['/editor/range.js'].branchData['914'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['915'] = [];
  _$jscoverage['/editor/range.js'].branchData['915'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['950'] = [];
  _$jscoverage['/editor/range.js'].branchData['950'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['956'] = [];
  _$jscoverage['/editor/range.js'].branchData['956'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['960'] = [];
  _$jscoverage['/editor/range.js'].branchData['960'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['974'] = [];
  _$jscoverage['/editor/range.js'].branchData['974'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1011'] = [];
  _$jscoverage['/editor/range.js'].branchData['1011'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1011'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1012'] = [];
  _$jscoverage['/editor/range.js'].branchData['1012'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1013'] = [];
  _$jscoverage['/editor/range.js'].branchData['1013'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1016'] = [];
  _$jscoverage['/editor/range.js'].branchData['1016'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1022'] = [];
  _$jscoverage['/editor/range.js'].branchData['1022'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1035'] = [];
  _$jscoverage['/editor/range.js'].branchData['1035'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1037'] = [];
  _$jscoverage['/editor/range.js'].branchData['1037'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1044'] = [];
  _$jscoverage['/editor/range.js'].branchData['1044'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1053'] = [];
  _$jscoverage['/editor/range.js'].branchData['1053'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1053'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1054'] = [];
  _$jscoverage['/editor/range.js'].branchData['1054'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1054'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1057'] = [];
  _$jscoverage['/editor/range.js'].branchData['1057'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1063'] = [];
  _$jscoverage['/editor/range.js'].branchData['1063'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1089'] = [];
  _$jscoverage['/editor/range.js'].branchData['1089'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1093'] = [];
  _$jscoverage['/editor/range.js'].branchData['1093'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1107'] = [];
  _$jscoverage['/editor/range.js'].branchData['1107'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1111'] = [];
  _$jscoverage['/editor/range.js'].branchData['1111'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1118'] = [];
  _$jscoverage['/editor/range.js'].branchData['1118'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1139'] = [];
  _$jscoverage['/editor/range.js'].branchData['1139'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1159'] = [];
  _$jscoverage['/editor/range.js'].branchData['1159'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1160'] = [];
  _$jscoverage['/editor/range.js'].branchData['1160'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1161'] = [];
  _$jscoverage['/editor/range.js'].branchData['1161'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1161'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1162'] = [];
  _$jscoverage['/editor/range.js'].branchData['1162'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1171'] = [];
  _$jscoverage['/editor/range.js'].branchData['1171'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1171'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1194'] = [];
  _$jscoverage['/editor/range.js'].branchData['1194'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1195'] = [];
  _$jscoverage['/editor/range.js'].branchData['1195'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1197'] = [];
  _$jscoverage['/editor/range.js'].branchData['1197'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1201'] = [];
  _$jscoverage['/editor/range.js'].branchData['1201'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1212'] = [];
  _$jscoverage['/editor/range.js'].branchData['1212'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1220'] = [];
  _$jscoverage['/editor/range.js'].branchData['1220'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1228'] = [];
  _$jscoverage['/editor/range.js'].branchData['1228'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1230'] = [];
  _$jscoverage['/editor/range.js'].branchData['1230'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1243'] = [];
  _$jscoverage['/editor/range.js'].branchData['1243'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1247'] = [];
  _$jscoverage['/editor/range.js'].branchData['1247'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1266'] = [];
  _$jscoverage['/editor/range.js'].branchData['1266'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1276'] = [];
  _$jscoverage['/editor/range.js'].branchData['1276'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1298'] = [];
  _$jscoverage['/editor/range.js'].branchData['1298'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1303'] = [];
  _$jscoverage['/editor/range.js'].branchData['1303'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1311'] = [];
  _$jscoverage['/editor/range.js'].branchData['1311'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1311'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1322'] = [];
  _$jscoverage['/editor/range.js'].branchData['1322'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1328'] = [];
  _$jscoverage['/editor/range.js'].branchData['1328'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1328'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1336'] = [];
  _$jscoverage['/editor/range.js'].branchData['1336'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1336'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1337'] = [];
  _$jscoverage['/editor/range.js'].branchData['1337'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1348'] = [];
  _$jscoverage['/editor/range.js'].branchData['1348'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1356'] = [];
  _$jscoverage['/editor/range.js'].branchData['1356'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1362'] = [];
  _$jscoverage['/editor/range.js'].branchData['1362'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1362'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1363'] = [];
  _$jscoverage['/editor/range.js'].branchData['1363'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1368'] = [];
  _$jscoverage['/editor/range.js'].branchData['1368'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1386'] = [];
  _$jscoverage['/editor/range.js'].branchData['1386'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1386'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1388'] = [];
  _$jscoverage['/editor/range.js'].branchData['1388'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1405'] = [];
  _$jscoverage['/editor/range.js'].branchData['1405'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1423'] = [];
  _$jscoverage['/editor/range.js'].branchData['1423'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1425'] = [];
  _$jscoverage['/editor/range.js'].branchData['1425'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1442'] = [];
  _$jscoverage['/editor/range.js'].branchData['1442'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1458'] = [];
  _$jscoverage['/editor/range.js'].branchData['1458'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1460'] = [];
  _$jscoverage['/editor/range.js'].branchData['1460'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1467'] = [];
  _$jscoverage['/editor/range.js'].branchData['1467'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1483'] = [];
  _$jscoverage['/editor/range.js'].branchData['1483'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1485'] = [];
  _$jscoverage['/editor/range.js'].branchData['1485'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1487'] = [];
  _$jscoverage['/editor/range.js'].branchData['1487'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1503'] = [];
  _$jscoverage['/editor/range.js'].branchData['1503'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1507'] = [];
  _$jscoverage['/editor/range.js'].branchData['1507'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1509'] = [];
  _$jscoverage['/editor/range.js'].branchData['1509'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1513'] = [];
  _$jscoverage['/editor/range.js'].branchData['1513'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1527'] = [];
  _$jscoverage['/editor/range.js'].branchData['1527'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1549'] = [];
  _$jscoverage['/editor/range.js'].branchData['1549'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1573'] = [];
  _$jscoverage['/editor/range.js'].branchData['1573'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1578'] = [];
  _$jscoverage['/editor/range.js'].branchData['1578'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1579'] = [];
  _$jscoverage['/editor/range.js'].branchData['1579'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1584'] = [];
  _$jscoverage['/editor/range.js'].branchData['1584'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1590'] = [];
  _$jscoverage['/editor/range.js'].branchData['1590'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1591'] = [];
  _$jscoverage['/editor/range.js'].branchData['1591'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1596'] = [];
  _$jscoverage['/editor/range.js'].branchData['1596'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1596'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1597'] = [];
  _$jscoverage['/editor/range.js'].branchData['1597'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1602'] = [];
  _$jscoverage['/editor/range.js'].branchData['1602'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1612'] = [];
  _$jscoverage['/editor/range.js'].branchData['1612'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1634'] = [];
  _$jscoverage['/editor/range.js'].branchData['1634'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1664'] = [];
  _$jscoverage['/editor/range.js'].branchData['1664'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1664'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1669'] = [];
  _$jscoverage['/editor/range.js'].branchData['1669'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1680'] = [];
  _$jscoverage['/editor/range.js'].branchData['1680'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1689'] = [];
  _$jscoverage['/editor/range.js'].branchData['1689'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1689'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1709'] = [];
  _$jscoverage['/editor/range.js'].branchData['1709'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1726'] = [];
  _$jscoverage['/editor/range.js'].branchData['1726'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1728'] = [];
  _$jscoverage['/editor/range.js'].branchData['1728'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1728'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1732'] = [];
  _$jscoverage['/editor/range.js'].branchData['1732'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1742'] = [];
  _$jscoverage['/editor/range.js'].branchData['1742'][1] = new BranchData();
}
_$jscoverage['/editor/range.js'].branchData['1742'][1].init(780, 4, 'last');
function visit620_1742_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1742'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1732'][1].init(236, 50, 'self.checkStartOfBlock() && self.checkEndOfBlock()');
function visit619_1732_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1732'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1728'][2].init(134, 32, 'tmpDtd && tmpDtd[elementName]');
function visit618_1728_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1728'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1728'][1].init(91, 77, '(tmpDtd = dtd[current.nodeName()]) && !(tmpDtd && tmpDtd[elementName])');
function visit617_1728_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1728'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1726'][1].init(269, 7, 'isBlock');
function visit616_1726_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1726'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1709'][1].init(118, 42, 'domNode.nodeType == Dom.NodeType.TEXT_NODE');
function visit615_1709_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1709'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1689'][2].init(492, 43, 'el[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit614_1689_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1689'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1689'][1].init(492, 66, 'el[0].nodeType == Dom.NodeType.ELEMENT_NODE && el._4e_isEditable()');
function visit613_1689_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1689'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1680'][1].init(87, 40, 'el[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit612_1680_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1680'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1669'][1].init(286, 19, '!childOnly && !next');
function visit611_1669_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1669'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1664'][2].init(51, 45, 'node[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit610_1664_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1664'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1664'][1].init(51, 91, 'node[0].nodeType == Dom.NodeType.ELEMENT_NODE && node._4e_isEditable()');
function visit609_1664_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1664'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1634'][1].init(48, 15, '!self.collapsed');
function visit608_1634_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1634'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1612'][1].init(301, 60, '!UA[\'ie\'] && !S.inArray(startBlock.nodeName(), [\'ul\', \'ol\'])');
function visit607_1612_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1612'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1602'][1].init(271, 14, 'isStartOfBlock');
function visit606_1602_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1602'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1597'][1].init(22, 12, 'isEndOfBlock');
function visit605_1597_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1597'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1596'][2].init(1290, 28, 'startBlock[0] == endBlock[0]');
function visit604_1596_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1596'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1596'][1].init(1276, 42, 'startBlock && startBlock[0] == endBlock[0]');
function visit603_1596_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1596'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1591'][1].init(92, 34, 'endBlock && self.checkEndOfBlock()');
function visit602_1591_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1591'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1590'][1].init(1066, 38, 'startBlock && self.checkStartOfBlock()');
function visit601_1590_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1590'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1584'][1].init(218, 9, '!endBlock');
function visit600_1584_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1584'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1579'][1].init(22, 11, '!startBlock');
function visit599_1579_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1579'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1578'][1].init(642, 16, 'blockTag != \'br\'');
function visit598_1578_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1578'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1573'][1].init(493, 38, '!startBlockLimit.equals(endBlockLimit)');
function visit597_1573_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1573'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1549'][1].init(363, 9, '!UA[\'ie\']');
function visit596_1549_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1549'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1527'][1].init(2382, 56, 'startNode._4e_position(endNode) & KEP.POSITION_FOLLOWING');
function visit595_1527_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1527'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1513'][1].init(311, 15, 'childCount == 0');
function visit594_1513_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1513'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1509'][1].init(82, 22, 'childCount > endOffset');
function visit593_1509_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1509'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1507'][1].init(1396, 48, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit592_1507_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1507'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1503'][1].init(612, 43, 'startNode._4e_nextSourceNode() || startNode');
function visit591_1503_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1503'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1487'][1].init(215, 15, 'childCount == 0');
function visit590_1487_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1487'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1485'][1].init(84, 24, 'childCount > startOffset');
function visit589_1485_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1485'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1483'][1].init(269, 50, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit588_1483_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1483'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1467'][1].init(7, 22, 'checkType == KER.START');
function visit587_1467_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1467'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1460'][1].init(223, 22, 'checkType == KER.START');
function visit586_1460_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1460'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1458'][1].init(12, 22, 'checkType == KER.START');
function visit585_1458_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1458'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1442'][1].init(1137, 29, 'path.block || path.blockLimit');
function visit584_1442_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1442'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1425'][1].init(111, 16, 'textAfter.length');
function visit583_1425_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1425'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1423'][1].init(271, 50, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit582_1423_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1423'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1405'][1].init(1196, 29, 'path.block || path.blockLimit');
function visit581_1405_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1405'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1388'][1].init(119, 17, 'textBefore.length');
function visit580_1388_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1388'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1386'][2].init(316, 52, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit579_1386_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1386'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1386'][1].init(301, 67, 'startOffset && startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit578_1386_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1386'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1368'][1].init(4532, 6, 'tailBr');
function visit577_1368_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1368'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1363'][1].init(74, 50, 'enlargeable && blockBoundary.contains(enlargeable)');
function visit576_1363_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1363'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1362'][2].init(-1, 38, '!enlargeable && self.checkEndOfBlock()');
function visit575_1362_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1362'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1362'][1].init(-1, 125, '!enlargeable && self.checkEndOfBlock() || enlargeable && blockBoundary.contains(enlargeable)');
function visit574_1362_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1362'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1356'][1].init(3798, 21, 'blockBoundary || body');
function visit573_1356_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1356'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1348'][1].init(3365, 38, 'unit == KER.ENLARGE_LIST_ITEM_CONTENTS');
function visit572_1348_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1348'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1337'][1].init(80, 50, 'enlargeable && blockBoundary.contains(enlargeable)');
function visit571_1337_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1337'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1336'][2].init(462, 40, '!enlargeable && self.checkStartOfBlock()');
function visit570_1336_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1336'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1336'][1].init(462, 131, '!enlargeable && self.checkStartOfBlock() || enlargeable && blockBoundary.contains(enlargeable)');
function visit569_1336_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1336'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1328'][2].init(90, 32, 'blockBoundary.nodeName() != \'br\'');
function visit568_1328_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1328'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1328'][1].init(-1, 596, 'blockBoundary.nodeName() != \'br\' && (!enlargeable && self.checkStartOfBlock() || enlargeable && blockBoundary.contains(enlargeable))');
function visit567_1328_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1328'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1322'][1].init(1939, 21, 'blockBoundary || body');
function visit566_1322_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1322'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1311'][2].init(116, 26, 'Dom.nodeName(node) == \'br\'');
function visit565_1311_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1311'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1311'][1].init(105, 37, '!retVal && Dom.nodeName(node) == \'br\'');
function visit564_1311_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1311'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1303'][1].init(104, 7, '!retVal');
function visit563_1303_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1303'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1298'][1].init(56, 38, 'unit == KER.ENLARGE_LIST_ITEM_CONTENTS');
function visit562_1298_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1298'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1276'][1].init(430, 18, 'stop[0] && stop[1]');
function visit561_1276_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1276'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1266'][1].init(57, 14, 'self.collapsed');
function visit560_1266_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1266'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1247'][1].init(990, 47, 'commonReached || enlarge.equals(commonAncestor)');
function visit559_1247_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1247'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1243'][1].init(875, 28, 'enlarge.nodeName() == "body"');
function visit558_1243_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1243'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1230'][1].init(69, 14, '!commonReached');
function visit557_1230_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1230'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1228'][1].init(396, 7, 'sibling');
function visit556_1228_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1228'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1220'][1].init(30, 44, 'isWhitespace(sibling) || isBookmark(sibling)');
function visit555_1220_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1220'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1212'][1].init(66, 57, 'container[0].childNodes[offset + (left ? -1 : 1)] || null');
function visit554_1212_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1212'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1201'][1].init(30, 38, 'offset < container[0].nodeValue.length');
function visit553_1201_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1201'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1197'][1].init(70, 6, 'offset');
function visit552_1197_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1197'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1195'][1].init(26, 4, 'left');
function visit551_1195_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1195'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1194'][1].init(395, 47, 'container[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit550_1194_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1194'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1171'][2].init(25, 46, 'ancestor[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit549_1171_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1171'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1171'][1].init(-1, 64, 'ignoreTextNode && ancestor[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit548_1171_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1171'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1162'][1].init(70, 38, 'self.startOffset == self.endOffset - 1');
function visit547_1162_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1162'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1161'][2].init(60, 46, 'start[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit546_1161_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1161'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1161'][1].init(35, 109, 'start[0].nodeType == Dom.NodeType.ELEMENT_NODE && self.startOffset == self.endOffset - 1');
function visit545_1161_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1161'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1160'][1].init(22, 145, 'includeSelf && start[0].nodeType == Dom.NodeType.ELEMENT_NODE && self.startOffset == self.endOffset - 1');
function visit544_1160_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1160'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1159'][1].init(165, 18, 'start[0] == end[0]');
function visit543_1159_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1159'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1139'][1].init(784, 21, 'endNode && endNode[0]');
function visit542_1139_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1139'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1118'][1].init(567, 12, 'endContainer');
function visit541_1118_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1111'][1].init(172, 71, 'bookmark.end && doc._4e_getByAddress(bookmark.end, bookmark.normalized)');
function visit540_1111_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1111'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1107'][1].init(89, 12, 'bookmark.is2');
function visit539_1107_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1107'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1093'][1].init(433, 41, 'startContainer[0] == self.endContainer[0]');
function visit538_1093_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1093'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1089'][1].init(118, 49, 'startContainer[0].childNodes[startOffset] || null');
function visit537_1089_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1089'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1063'][1].init(415, 45, 'endOffset >= endContainer[0].nodeValue.length');
function visit536_1063_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1063'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1057'][1].init(131, 10, '!endOffset');
function visit535_1057_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1057'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1054'][2].init(2122, 50, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit534_1054_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1054'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1054'][1].init(47, 69, 'endContainer[0] && endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit533_1054_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1054'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1053'][2].init(2056, 22, 'ignoreEnd || collapsed');
function visit532_1053_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1053'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1053'][1].init(2053, 117, '!(ignoreEnd || collapsed) && endContainer[0] && endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit531_1053_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1053'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1044'][1].init(1476, 9, 'collapsed');
function visit530_1044_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1044'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1037'][1].init(483, 45, 'Dom.equals(startContainer, self.endContainer)');
function visit529_1037_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1037'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1035'][1].init(313, 50, 'Dom.equals(self.startContainer, self.endContainer)');
function visit528_1035_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1035'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1022'][1].init(425, 49, 'startOffset >= startContainer[0].nodeValue.length');
function visit527_1022_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1022'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1016'][1].init(131, 12, '!startOffset');
function visit526_1016_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1016'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1013'][1].init(37, 52, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit525_1013_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1013'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1012'][1].init(47, 90, 'startContainer[0] && startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit524_1012_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1012'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1011'][2].init(201, 25, '!ignoreStart || collapsed');
function visit523_1011_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1011'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1011'][1].init(201, 138, '(!ignoreStart || collapsed) && startContainer[0] && startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit522_1011_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1011'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['974'][1].init(1257, 7, 'endNode');
function visit521_974_1(result) {
  _$jscoverage['/editor/range.js'].branchData['974'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['960'][1].init(111, 12, 'serializable');
function visit520_960_1(result) {
  _$jscoverage['/editor/range.js'].branchData['960'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['956'][1].init(732, 10, '!collapsed');
function visit519_956_1(result) {
  _$jscoverage['/editor/range.js'].branchData['956'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['950'][1].init(522, 12, 'serializable');
function visit518_950_1(result) {
  _$jscoverage['/editor/range.js'].branchData['950'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['915'][1].init(72, 46, 'previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit517_915_1(result) {
  _$jscoverage['/editor/range.js'].branchData['915'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['914'][1].init(80, 119, '(previous = endContainer.prev(undefined, 1)) && previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit516_914_1(result) {
  _$jscoverage['/editor/range.js'].branchData['914'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['913'][2].init(858, 50, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit515_913_2(result) {
  _$jscoverage['/editor/range.js'].branchData['913'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['913'][1].init(858, 200, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE && (previous = endContainer.prev(undefined, 1)) && previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit514_913_1(result) {
  _$jscoverage['/editor/range.js'].branchData['913'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['906'][1].init(45, 59, 'child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit513_906_1(result) {
  _$jscoverage['/editor/range.js'].branchData['906'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['905'][4].init(331, 13, 'endOffset > 0');
function visit512_905_4(result) {
  _$jscoverage['/editor/range.js'].branchData['905'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['905'][3].init(46, 105, 'endOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit511_905_3(result) {
  _$jscoverage['/editor/range.js'].branchData['905'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['905'][2].init(283, 43, 'child[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit510_905_2(result) {
  _$jscoverage['/editor/range.js'].branchData['905'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['905'][1].init(40, 152, 'child[0].nodeType == Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit509_905_1(result) {
  _$jscoverage['/editor/range.js'].branchData['905'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['904'][2].init(239, 193, 'child[0] && child[0].nodeType == Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit508_904_2(result) {
  _$jscoverage['/editor/range.js'].branchData['904'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['904'][1].init(230, 202, 'child && child[0] && child[0].nodeType == Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit507_904_1(result) {
  _$jscoverage['/editor/range.js'].branchData['904'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['899'][1].init(148, 53, 'endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit506_899_1(result) {
  _$jscoverage['/editor/range.js'].branchData['899'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['896'][1].init(1205, 15, '!self.collapsed');
function visit505_896_1(result) {
  _$jscoverage['/editor/range.js'].branchData['896'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['890'][1].init(70, 46, 'previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit504_890_1(result) {
  _$jscoverage['/editor/range.js'].branchData['890'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['889'][1].init(78, 117, '(previous = startContainer.prev(undefined, 1)) && previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit503_889_1(result) {
  _$jscoverage['/editor/range.js'].branchData['889'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['888'][2].init(789, 52, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit502_888_2(result) {
  _$jscoverage['/editor/range.js'].branchData['888'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['888'][1].init(789, 196, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE && (previous = startContainer.prev(undefined, 1)) && previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit501_888_1(result) {
  _$jscoverage['/editor/range.js'].branchData['888'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['880'][3].init(18, 59, 'child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit500_880_3(result) {
  _$jscoverage['/editor/range.js'].branchData['880'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['880'][2].init(315, 15, 'startOffset > 0');
function visit499_880_2(result) {
  _$jscoverage['/editor/range.js'].branchData['880'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['880'][1].init(71, 78, 'startOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit498_880_1(result) {
  _$jscoverage['/editor/range.js'].branchData['880'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['879'][4].init(239, 43, 'child[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit497_879_4(result) {
  _$jscoverage['/editor/range.js'].branchData['879'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['879'][3].init(239, 150, 'child[0].nodeType == Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit496_879_3(result) {
  _$jscoverage['/editor/range.js'].branchData['879'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['879'][2].init(227, 162, 'child[0] && child[0].nodeType == Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit495_879_2(result) {
  _$jscoverage['/editor/range.js'].branchData['879'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['879'][1].init(218, 171, 'child && child[0] && child[0].nodeType == Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit494_879_1(result) {
  _$jscoverage['/editor/range.js'].branchData['879'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['874'][1].init(136, 55, 'startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit493_874_1(result) {
  _$jscoverage['/editor/range.js'].branchData['874'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['871'][1].init(640, 10, 'normalized');
function visit492_871_1(result) {
  _$jscoverage['/editor/range.js'].branchData['871'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['864'][1].init(465, 32, '!startContainer || !endContainer');
function visit491_864_1(result) {
  _$jscoverage['/editor/range.js'].branchData['864'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['844'][1].init(3710, 20, 'moveStart || moveEnd');
function visit490_844_1(result) {
  _$jscoverage['/editor/range.js'].branchData['844'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['839'][1].init(166, 7, 'textEnd');
function visit489_839_1(result) {
  _$jscoverage['/editor/range.js'].branchData['839'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['838'][1].init(80, 26, 'mode == KER.SHRINK_ELEMENT');
function visit488_838_1(result) {
  _$jscoverage['/editor/range.js'].branchData['838'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['836'][1].init(3339, 7, 'moveEnd');
function visit487_836_1(result) {
  _$jscoverage['/editor/range.js'].branchData['836'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['831'][1].init(126, 9, 'textStart');
function visit486_831_1(result) {
  _$jscoverage['/editor/range.js'].branchData['831'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['830'][1].init(45, 26, 'mode == KER.SHRINK_ELEMENT');
function visit485_830_1(result) {
  _$jscoverage['/editor/range.js'].branchData['830'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['829'][1].init(2999, 9, 'moveStart');
function visit484_829_1(result) {
  _$jscoverage['/editor/range.js'].branchData['829'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['821'][2].init(563, 42, 'node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit483_821_2(result) {
  _$jscoverage['/editor/range.js'].branchData['821'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['821'][1].init(549, 56, '!movingOut && node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit482_821_1(result) {
  _$jscoverage['/editor/range.js'].branchData['821'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['818'][2].init(424, 22, 'node == currentElement');
function visit481_818_2(result) {
  _$jscoverage['/editor/range.js'].branchData['818'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['818'][1].init(411, 35, 'movingOut && node == currentElement');
function visit480_818_1(result) {
  _$jscoverage['/editor/range.js'].branchData['818'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['814'][1].init(58, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit479_814_1(result) {
  _$jscoverage['/editor/range.js'].branchData['814'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['813'][2].init(129, 26, 'mode == KER.SHRINK_ELEMENT');
function visit478_813_2(result) {
  _$jscoverage['/editor/range.js'].branchData['813'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['813'][1].init(129, 98, 'mode == KER.SHRINK_ELEMENT && node.nodeType == Dom.NodeType.TEXT_NODE');
function visit477_813_1(result) {
  _$jscoverage['/editor/range.js'].branchData['813'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['807'][2].init(52, 26, 'mode == KER.SHRINK_ELEMENT');
function visit476_807_2(result) {
  _$jscoverage['/editor/range.js'].branchData['807'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['807'][1].init(33, 129, 'node.nodeType == (mode == KER.SHRINK_ELEMENT ? Dom.NodeType.ELEMENT_NODE : Dom.NodeType.TEXT_NODE)');
function visit475_807_1(result) {
  _$jscoverage['/editor/range.js'].branchData['807'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['802'][1].init(1811, 20, 'moveStart || moveEnd');
function visit474_802_1(result) {
  _$jscoverage['/editor/range.js'].branchData['802'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['794'][1].init(138, 45, 'endOffset >= endContainer[0].nodeValue.length');
function visit473_794_1(result) {
  _$jscoverage['/editor/range.js'].branchData['794'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['792'][1].init(26, 10, '!endOffset');
function visit472_792_1(result) {
  _$jscoverage['/editor/range.js'].branchData['792'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['791'][1].init(36, 50, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit471_791_1(result) {
  _$jscoverage['/editor/range.js'].branchData['791'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['790'][1].init(1270, 87, 'endContainer && endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit470_790_1(result) {
  _$jscoverage['/editor/range.js'].branchData['790'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['780'][1].init(144, 49, 'startOffset >= startContainer[0].nodeValue.length');
function visit469_780_1(result) {
  _$jscoverage['/editor/range.js'].branchData['780'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['778'][1].init(26, 12, '!startOffset');
function visit468_778_1(result) {
  _$jscoverage['/editor/range.js'].branchData['778'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['777'][1].init(38, 52, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit467_777_1(result) {
  _$jscoverage['/editor/range.js'].branchData['777'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['776'][1].init(545, 91, 'startContainer && startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit466_776_1(result) {
  _$jscoverage['/editor/range.js'].branchData['776'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['763'][1].init(25, 23, 'mode || KER.SHRINK_TEXT');
function visit465_763_1(result) {
  _$jscoverage['/editor/range.js'].branchData['763'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['762'][1].init(100, 15, '!self.collapsed');
function visit464_762_1(result) {
  _$jscoverage['/editor/range.js'].branchData['762'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['751'][1].init(882, 24, 'node && node.equals(pre)');
function visit463_751_1(result) {
  _$jscoverage['/editor/range.js'].branchData['751'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['740'][1].init(25, 46, 'isNotWhitespaces(node) && isNotBookmarks(node)');
function visit462_740_1(result) {
  _$jscoverage['/editor/range.js'].branchData['740'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['732'][1].init(87, 65, 'walkerRange.endContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit461_732_1(result) {
  _$jscoverage['/editor/range.js'].branchData['732'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['731'][2].init(194, 67, 'walkerRange.startContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit460_731_2(result) {
  _$jscoverage['/editor/range.js'].branchData['731'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['731'][1].init(194, 153, 'walkerRange.startContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE || walkerRange.endContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit459_731_1(result) {
  _$jscoverage['/editor/range.js'].branchData['731'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['690'][1].init(48, 7, 'toStart');
function visit458_690_1(result) {
  _$jscoverage['/editor/range.js'].branchData['690'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['645'][1].init(55, 42, 'node[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit457_645_1(result) {
  _$jscoverage['/editor/range.js'].branchData['645'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['614'][1].init(55, 42, 'node[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit456_614_1(result) {
  _$jscoverage['/editor/range.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['593'][1].init(700, 20, '!self.startContainer');
function visit455_593_1(result) {
  _$jscoverage['/editor/range.js'].branchData['593'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['585'][2].init(399, 48, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit454_585_2(result) {
  _$jscoverage['/editor/range.js'].branchData['585'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['585'][1].init(399, 79, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && EMPTY[endNode.nodeName()]');
function visit453_585_1(result) {
  _$jscoverage['/editor/range.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['562'][1].init(717, 18, '!self.endContainer');
function visit452_562_1(result) {
  _$jscoverage['/editor/range.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['554'][2].init(400, 50, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit451_554_2(result) {
  _$jscoverage['/editor/range.js'].branchData['554'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['554'][1].init(400, 83, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && EMPTY[startNode.nodeName()]');
function visit450_554_1(result) {
  _$jscoverage['/editor/range.js'].branchData['554'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['533'][2].init(372, 28, 'endNode.nodeName() == \'span\'');
function visit449_533_2(result) {
  _$jscoverage['/editor/range.js'].branchData['533'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['533'][1].init(27, 77, 'endNode.nodeName() == \'span\' && endNode.attr(\'_ke_bookmark\')');
function visit448_533_1(result) {
  _$jscoverage['/editor/range.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['532'][1].init(342, 105, 'endNode && endNode.nodeName() == \'span\' && endNode.attr(\'_ke_bookmark\')');
function visit447_532_1(result) {
  _$jscoverage['/editor/range.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['528'][2].init(178, 30, 'startNode.nodeName() == \'span\'');
function visit446_528_2(result) {
  _$jscoverage['/editor/range.js'].branchData['528'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['528'][1].init(29, 81, 'startNode.nodeName() == \'span\' && startNode.attr(\'_ke_bookmark\')');
function visit445_528_1(result) {
  _$jscoverage['/editor/range.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['527'][1].init(146, 111, 'startNode && startNode.nodeName() == \'span\' && startNode.attr(\'_ke_bookmark\')');
function visit444_527_1(result) {
  _$jscoverage['/editor/range.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['484'][1].init(113, 39, 'offset >= container[0].nodeValue.length');
function visit443_484_1(result) {
  _$jscoverage['/editor/range.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['482'][1].init(22, 7, '!offset');
function visit442_482_1(result) {
  _$jscoverage['/editor/range.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['481'][1].init(543, 50, 'container[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit441_481_1(result) {
  _$jscoverage['/editor/range.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['473'][1].init(115, 39, 'offset >= container[0].nodeValue.length');
function visit440_473_1(result) {
  _$jscoverage['/editor/range.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['471'][1].init(22, 7, '!offset');
function visit439_471_1(result) {
  _$jscoverage['/editor/range.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['470'][1].init(144, 50, 'container[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit438_470_1(result) {
  _$jscoverage['/editor/range.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['455'][1].init(283, 40, 'endContainer.id || endContainer.nodeName');
function visit437_455_1(result) {
  _$jscoverage['/editor/range.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['454'][1].init(189, 44, 'startContainer.id || startContainer.nodeName');
function visit436_454_1(result) {
  _$jscoverage['/editor/range.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['425'][1].init(66, 34, 'self.startOffset == self.endOffset');
function visit435_425_1(result) {
  _$jscoverage['/editor/range.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['424'][2].init(112, 46, 'self.startContainer[0] == self.endContainer[0]');
function visit434_424_2(result) {
  _$jscoverage['/editor/range.js'].branchData['424'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['424'][1].init(37, 101, 'self.startContainer[0] == self.endContainer[0] && self.startOffset == self.endOffset');
function visit433_424_1(result) {
  _$jscoverage['/editor/range.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['423'][1].init(39, 139, 'self.endContainer && self.startContainer[0] == self.endContainer[0] && self.startOffset == self.endOffset');
function visit432_423_1(result) {
  _$jscoverage['/editor/range.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['422'][1].init(-1, 179, 'self.startContainer && self.endContainer && self.startContainer[0] == self.endContainer[0] && self.startOffset == self.endOffset');
function visit431_422_1(result) {
  _$jscoverage['/editor/range.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['413'][1].init(11077, 13, 'removeEndNode');
function visit430_413_1(result) {
  _$jscoverage['/editor/range.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['409'][1].init(10999, 15, 'removeStartNode');
function visit429_409_1(result) {
  _$jscoverage['/editor/range.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['394'][1].init(206, 123, 'removeStartNode && (topStart._4e_sameLevel(startNode))');
function visit428_394_1(result) {
  _$jscoverage['/editor/range.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['386'][1].init(-1, 97, '!startNode._4e_sameLevel(topStart) || !endNode._4e_sameLevel(topEnd)');
function visit427_386_1(result) {
  _$jscoverage['/editor/range.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['384'][2].init(279, 182, 'topEnd && (!startNode._4e_sameLevel(topStart) || !endNode._4e_sameLevel(topEnd))');
function visit426_384_2(result) {
  _$jscoverage['/editor/range.js'].branchData['384'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['384'][1].init(21, 194, 'topStart && topEnd && (!startNode._4e_sameLevel(topStart) || !endNode._4e_sameLevel(topEnd))');
function visit425_384_1(result) {
  _$jscoverage['/editor/range.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['371'][1].init(51, 62, 'endTextNode.previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit424_371_1(result) {
  _$jscoverage['/editor/range.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['370'][1].init(70, 114, 'endTextNode.previousSibling && endTextNode.previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit423_370_1(result) {
  _$jscoverage['/editor/range.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['369'][2].init(69, 46, 'endTextNode.nodeType == Dom.NodeType.TEXT_NODE');
function visit422_369_2(result) {
  _$jscoverage['/editor/range.js'].branchData['369'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['369'][1].init(69, 185, 'endTextNode.nodeType == Dom.NodeType.TEXT_NODE && endTextNode.previousSibling && endTextNode.previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit421_369_1(result) {
  _$jscoverage['/editor/range.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['367'][1].init(664, 11, 'hasSplitEnd');
function visit420_367_1(result) {
  _$jscoverage['/editor/range.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['361'][1].init(115, 60, 'startTextNode.nextSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit419_361_1(result) {
  _$jscoverage['/editor/range.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['359'][1].init(72, 176, 'startTextNode.nextSibling && startTextNode.nextSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit418_359_1(result) {
  _$jscoverage['/editor/range.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['358'][2].init(73, 48, 'startTextNode.nodeType == Dom.NodeType.TEXT_NODE');
function visit417_358_2(result) {
  _$jscoverage['/editor/range.js'].branchData['358'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['358'][1].init(73, 249, 'startTextNode.nodeType == Dom.NodeType.TEXT_NODE && startTextNode.nextSibling && startTextNode.nextSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit416_358_1(result) {
  _$jscoverage['/editor/range.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['356'][1].init(108, 13, 'hasSplitStart');
function visit415_356_1(result) {
  _$jscoverage['/editor/range.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['352'][1].init(8756, 11, 'action == 2');
function visit414_352_1(result) {
  _$jscoverage['/editor/range.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['347'][1].init(1695, 10, 'levelClone');
function visit413_347_1(result) {
  _$jscoverage['/editor/range.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['337'][1].init(243, 11, 'action == 1');
function visit412_337_1(result) {
  _$jscoverage['/editor/range.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['329'][1].init(194, 11, 'action == 2');
function visit411_329_1(result) {
  _$jscoverage['/editor/range.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['319'][1].init(21, 140, '!startParents[k] || !levelStartNode._4e_sameLevel(startParents[k])');
function visit410_319_1(result) {
  _$jscoverage['/editor/range.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['309'][2].init(132, 10, 'action > 0');
function visit409_309_2(result) {
  _$jscoverage['/editor/range.js'].branchData['309'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['309'][1].init(132, 45, 'action > 0 && !levelStartNode.equals(endNode)');
function visit408_309_1(result) {
  _$jscoverage['/editor/range.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['305'][1].init(6919, 21, 'k < endParents.length');
function visit407_305_1(result) {
  _$jscoverage['/editor/range.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['296'][1].init(2234, 10, 'levelClone');
function visit406_296_1(result) {
  _$jscoverage['/editor/range.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['287'][1].init(657, 11, 'action == 1');
function visit405_287_1(result) {
  _$jscoverage['/editor/range.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['277'][1].init(159, 48, 'UN_REMOVABLE[currentNode.nodeName.toLowerCase()]');
function visit404_277_1(result) {
  _$jscoverage['/editor/range.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['270'][1].init(446, 11, 'action == 2');
function visit403_270_1(result) {
  _$jscoverage['/editor/range.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['262'][3].init(195, 25, 'domEndNode == currentNode');
function visit402_262_3(result) {
  _$jscoverage['/editor/range.js'].branchData['262'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['262'][2].init(163, 28, 'domEndParentJ == currentNode');
function visit401_262_2(result) {
  _$jscoverage['/editor/range.js'].branchData['262'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['262'][1].init(163, 57, 'domEndParentJ == currentNode || domEndNode == currentNode');
function visit400_262_1(result) {
  _$jscoverage['/editor/range.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['257'][1].init(108, 27, 'endParentJ && endParentJ[0]');
function visit399_257_1(result) {
  _$jscoverage['/editor/range.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['245'][2].init(132, 10, 'action > 0');
function visit398_245_2(result) {
  _$jscoverage['/editor/range.js'].branchData['245'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['245'][1].init(132, 47, 'action > 0 && !levelStartNode.equals(startNode)');
function visit397_245_1(result) {
  _$jscoverage['/editor/range.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['241'][1].init(4425, 23, 'j < startParents.length');
function visit396_241_1(result) {
  _$jscoverage['/editor/range.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['228'][1].init(348, 24, '!topStart.equals(topEnd)');
function visit395_228_1(result) {
  _$jscoverage['/editor/range.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['220'][1].init(3699, 23, 'i < startParents.length');
function visit394_220_1(result) {
  _$jscoverage['/editor/range.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['192'][1].init(621, 45, 'startOffset >= startNode[0].childNodes.length');
function visit393_192_1(result) {
  _$jscoverage['/editor/range.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['185'][1].init(325, 12, '!startOffset');
function visit392_185_1(result) {
  _$jscoverage['/editor/range.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['176'][1].init(1990, 47, 'startNode[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit391_176_1(result) {
  _$jscoverage['/editor/range.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['160'][1].init(84, 41, 'endOffset >= endNode[0].childNodes.length');
function visit390_160_1(result) {
  _$jscoverage['/editor/range.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['158'][1].init(153, 32, 'endNode[0].childNodes.length > 0');
function visit389_158_1(result) {
  _$jscoverage['/editor/range.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['152'][1].init(904, 45, 'endNode[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit388_152_1(result) {
  _$jscoverage['/editor/range.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['139'][1].init(495, 14, 'self.collapsed');
function visit387_139_1(result) {
  _$jscoverage['/editor/range.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['135'][1].init(402, 10, 'action > 0');
function visit386_135_1(result) {
  _$jscoverage['/editor/range.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['102'][4].init(182, 16, 'nodeName == \'br\'');
function visit385_102_4(result) {
  _$jscoverage['/editor/range.js'].branchData['102'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['102'][3].init(182, 26, 'nodeName == \'br\' && !hadBr');
function visit384_102_3(result) {
  _$jscoverage['/editor/range.js'].branchData['102'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['102'][2].init(169, 39, '!UA[\'ie\'] && nodeName == \'br\' && !hadBr');
function visit383_102_2(result) {
  _$jscoverage['/editor/range.js'].branchData['102'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['102'][1].init(157, 51, '!isStart && !UA[\'ie\'] && nodeName == \'br\' && !hadBr');
function visit382_102_1(result) {
  _$jscoverage['/editor/range.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['99'][1].init(198, 35, '!inlineChildReqElements[nodeName]');
function visit381_99_1(result) {
  _$jscoverage['/editor/range.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['95'][1].init(384, 42, 'node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit380_95_1(result) {
  _$jscoverage['/editor/range.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['92'][1].init(100, 29, 'S.trim(node.nodeValue).length');
function visit379_92_1(result) {
  _$jscoverage['/editor/range.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['90'][1].init(130, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit378_90_1(result) {
  _$jscoverage['/editor/range.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['87'][1].init(63, 16, 'isBookmark(node)');
function visit377_87_1(result) {
  _$jscoverage['/editor/range.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['80'][1].init(79, 40, '!isWhitespace(node) && !isBookmark(node)');
function visit376_80_1(result) {
  _$jscoverage['/editor/range.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['75'][2].init(491, 8, 'c2 || c3');
function visit375_75_2(result) {
  _$jscoverage['/editor/range.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['75'][1].init(485, 14, 'c1 || c2 || c3');
function visit374_75_1(result) {
  _$jscoverage['/editor/range.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['72'][2].init(156, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit373_72_2(result) {
  _$jscoverage['/editor/range.js'].branchData['72'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['72'][1].init(156, 66, 'node.nodeType == Dom.NodeType.TEXT_NODE && !S.trim(node.nodeValue)');
function visit372_72_1(result) {
  _$jscoverage['/editor/range.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['69'][2].init(154, 39, 'node.nodeType != Dom.NodeType.TEXT_NODE');
function visit371_69_2(result) {
  _$jscoverage['/editor/range.js'].branchData['69'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['69'][1].init(154, 98, 'node.nodeType != Dom.NodeType.TEXT_NODE && Dom.nodeName(node) in dtd.$removeEmpty');
function visit370_69_1(result) {
  _$jscoverage['/editor/range.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].lineData[10]++;
KISSY.add("editor/range", function(S, Editor, Utils, Walker, ElementPath) {
  _$jscoverage['/editor/range.js'].functionData[0]++;
  _$jscoverage['/editor/range.js'].lineData[15]++;
  Editor.RangeType = {
  POSITION_AFTER_START: 1, 
  POSITION_BEFORE_END: 2, 
  POSITION_BEFORE_START: 3, 
  POSITION_AFTER_END: 4, 
  ENLARGE_ELEMENT: 1, 
  ENLARGE_BLOCK_CONTENTS: 2, 
  ENLARGE_LIST_ITEM_CONTENTS: 3, 
  START: 1, 
  END: 2, 
  SHRINK_ELEMENT: 1, 
  SHRINK_TEXT: 2};
  _$jscoverage['/editor/range.js'].lineData[29]++;
  var TRUE = true, FALSE = false, NULL = null, KER = Editor.RangeType, KEP = Editor.PositionType, Dom = S.DOM, UA = S.UA, dtd = Editor.XHTML_DTD, Node = S.Node, $ = Node.all, UN_REMOVABLE = {
  'td': 1}, EMPTY = {
  "area": 1, 
  "base": 1, 
  "br": 1, 
  "col": 1, 
  "hr": 1, 
  "img": 1, 
  "input": 1, 
  "link": 1, 
  "meta": 1, 
  "param": 1};
  _$jscoverage['/editor/range.js'].lineData[49]++;
  var isWhitespace = new Walker.whitespaces(), isBookmark = new Walker.bookmark(), isNotWhitespaces = Walker.whitespaces(TRUE), isNotBookmarks = Walker.bookmark(false, true);
  _$jscoverage['/editor/range.js'].lineData[54]++;
  var inlineChildReqElements = {
  "abbr": 1, 
  "acronym": 1, 
  "b": 1, 
  "bdo": 1, 
  "big": 1, 
  "cite": 1, 
  "code": 1, 
  "del": 1, 
  "dfn": 1, 
  "em": 1, 
  "font": 1, 
  "i": 1, 
  "ins": 1, 
  "label": 1, 
  "kbd": 1, 
  "q": 1, 
  "samp": 1, 
  "small": 1, 
  "span": 1, 
  "strike": 1, 
  "strong": 1, 
  "sub": 1, 
  "sup": 1, 
  "tt": 1, 
  "u": 1, 
  'var': 1};
  _$jscoverage['/editor/range.js'].lineData[65]++;
  function elementBoundaryEval(node) {
    _$jscoverage['/editor/range.js'].functionData[1]++;
    _$jscoverage['/editor/range.js'].lineData[69]++;
    var c1 = visit370_69_1(visit371_69_2(node.nodeType != Dom.NodeType.TEXT_NODE) && Dom.nodeName(node) in dtd.$removeEmpty), c2 = visit372_72_1(visit373_72_2(node.nodeType == Dom.NodeType.TEXT_NODE) && !S.trim(node.nodeValue)), c3 = !!node.parentNode.getAttribute('_ke_bookmark');
    _$jscoverage['/editor/range.js'].lineData[75]++;
    return visit374_75_1(c1 || visit375_75_2(c2 || c3));
  }
  _$jscoverage['/editor/range.js'].lineData[78]++;
  function nonWhitespaceOrIsBookmark(node) {
    _$jscoverage['/editor/range.js'].functionData[2]++;
    _$jscoverage['/editor/range.js'].lineData[80]++;
    return visit376_80_1(!isWhitespace(node) && !isBookmark(node));
  }
  _$jscoverage['/editor/range.js'].lineData[83]++;
  function getCheckStartEndBlockEvalFunction(isStart) {
    _$jscoverage['/editor/range.js'].functionData[3]++;
    _$jscoverage['/editor/range.js'].lineData[84]++;
    var hadBr = FALSE;
    _$jscoverage['/editor/range.js'].lineData[85]++;
    return function(node) {
  _$jscoverage['/editor/range.js'].functionData[4]++;
  _$jscoverage['/editor/range.js'].lineData[87]++;
  if (visit377_87_1(isBookmark(node))) {
    _$jscoverage['/editor/range.js'].lineData[88]++;
    return TRUE;
  }
  _$jscoverage['/editor/range.js'].lineData[90]++;
  if (visit378_90_1(node.nodeType == Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[92]++;
    if (visit379_92_1(S.trim(node.nodeValue).length)) {
      _$jscoverage['/editor/range.js'].lineData[93]++;
      return FALSE;
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[95]++;
    if (visit380_95_1(node.nodeType == Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[96]++;
      var nodeName = Dom.nodeName(node);
      _$jscoverage['/editor/range.js'].lineData[99]++;
      if (visit381_99_1(!inlineChildReqElements[nodeName])) {
        _$jscoverage['/editor/range.js'].lineData[102]++;
        if (visit382_102_1(!isStart && visit383_102_2(!UA['ie'] && visit384_102_3(visit385_102_4(nodeName == 'br') && !hadBr)))) {
          _$jscoverage['/editor/range.js'].lineData[103]++;
          hadBr = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[105]++;
          return FALSE;
        }
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[109]++;
  return TRUE;
};
  }
  _$jscoverage['/editor/range.js'].lineData[122]++;
  function execContentsAction(self, action) {
    _$jscoverage['/editor/range.js'].functionData[5]++;
    _$jscoverage['/editor/range.js'].lineData[123]++;
    var startNode = self.startContainer, endNode = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, removeStartNode, hasSplitStart = FALSE, hasSplitEnd = FALSE, t, docFrag = undefined, doc = self.document, removeEndNode;
    _$jscoverage['/editor/range.js'].lineData[135]++;
    if (visit386_135_1(action > 0)) {
      _$jscoverage['/editor/range.js'].lineData[136]++;
      docFrag = doc.createDocumentFragment();
    }
    _$jscoverage['/editor/range.js'].lineData[139]++;
    if (visit387_139_1(self.collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[140]++;
      return docFrag;
    }
    _$jscoverage['/editor/range.js'].lineData[144]++;
    self.optimizeBookmark();
    _$jscoverage['/editor/range.js'].lineData[152]++;
    if (visit388_152_1(endNode[0].nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[153]++;
      hasSplitEnd = TRUE;
      _$jscoverage['/editor/range.js'].lineData[154]++;
      endNode = endNode._4e_splitText(endOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[158]++;
      if (visit389_158_1(endNode[0].childNodes.length > 0)) {
        _$jscoverage['/editor/range.js'].lineData[160]++;
        if (visit390_160_1(endOffset >= endNode[0].childNodes.length)) {
          _$jscoverage['/editor/range.js'].lineData[162]++;
          endNode = new Node(endNode[0].appendChild(doc.createTextNode("")));
          _$jscoverage['/editor/range.js'].lineData[165]++;
          removeEndNode = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[167]++;
          endNode = new Node(endNode[0].childNodes[endOffset]);
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[176]++;
    if (visit391_176_1(startNode[0].nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[177]++;
      hasSplitStart = TRUE;
      _$jscoverage['/editor/range.js'].lineData[178]++;
      startNode._4e_splitText(startOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[185]++;
      if (visit392_185_1(!startOffset)) {
        _$jscoverage['/editor/range.js'].lineData[187]++;
        t = new Node(doc.createTextNode(""));
        _$jscoverage['/editor/range.js'].lineData[188]++;
        startNode.prepend(t);
        _$jscoverage['/editor/range.js'].lineData[189]++;
        startNode = t;
        _$jscoverage['/editor/range.js'].lineData[190]++;
        removeStartNode = TRUE;
      } else {
        _$jscoverage['/editor/range.js'].lineData[192]++;
        if (visit393_192_1(startOffset >= startNode[0].childNodes.length)) {
          _$jscoverage['/editor/range.js'].lineData[194]++;
          startNode = new Node(startNode[0].appendChild(doc.createTextNode('')));
          _$jscoverage['/editor/range.js'].lineData[196]++;
          removeStartNode = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[198]++;
          startNode = new Node(startNode[0].childNodes[startOffset].previousSibling);
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[205]++;
    var startParents = startNode._4e_parents(), endParents = endNode._4e_parents();
    _$jscoverage['/editor/range.js'].lineData[208]++;
    startParents.each(function(n, i) {
  _$jscoverage['/editor/range.js'].functionData[6]++;
  _$jscoverage['/editor/range.js'].lineData[209]++;
  startParents[i] = n;
});
    _$jscoverage['/editor/range.js'].lineData[212]++;
    endParents.each(function(n, i) {
  _$jscoverage['/editor/range.js'].functionData[7]++;
  _$jscoverage['/editor/range.js'].lineData[213]++;
  endParents[i] = n;
});
    _$jscoverage['/editor/range.js'].lineData[218]++;
    var i, topStart, topEnd;
    _$jscoverage['/editor/range.js'].lineData[220]++;
    for (i = 0; visit394_220_1(i < startParents.length); i++) {
      _$jscoverage['/editor/range.js'].lineData[221]++;
      topStart = startParents[i];
      _$jscoverage['/editor/range.js'].lineData[222]++;
      topEnd = endParents[i];
      _$jscoverage['/editor/range.js'].lineData[228]++;
      if (visit395_228_1(!topStart.equals(topEnd))) {
        _$jscoverage['/editor/range.js'].lineData[229]++;
        break;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[233]++;
    var clone = docFrag, levelStartNode, levelClone, currentNode, currentSibling;
    _$jscoverage['/editor/range.js'].lineData[241]++;
    for (var j = i; visit396_241_1(j < startParents.length); j++) {
      _$jscoverage['/editor/range.js'].lineData[242]++;
      levelStartNode = startParents[j];
      _$jscoverage['/editor/range.js'].lineData[245]++;
      if (visit397_245_1(visit398_245_2(action > 0) && !levelStartNode.equals(startNode))) {
        _$jscoverage['/editor/range.js'].lineData[247]++;
        levelClone = clone.appendChild(levelStartNode.clone()[0]);
      } else {
        _$jscoverage['/editor/range.js'].lineData[249]++;
        levelClone = null;
      }
      _$jscoverage['/editor/range.js'].lineData[253]++;
      currentNode = levelStartNode[0].nextSibling;
      _$jscoverage['/editor/range.js'].lineData[255]++;
      var endParentJ = endParents[j], domEndNode = endNode[0], domEndParentJ = visit399_257_1(endParentJ && endParentJ[0]);
      _$jscoverage['/editor/range.js'].lineData[259]++;
      while (currentNode) {
        _$jscoverage['/editor/range.js'].lineData[262]++;
        if (visit400_262_1(visit401_262_2(domEndParentJ == currentNode) || visit402_262_3(domEndNode == currentNode))) {
          _$jscoverage['/editor/range.js'].lineData[263]++;
          break;
        }
        _$jscoverage['/editor/range.js'].lineData[267]++;
        currentSibling = currentNode.nextSibling;
        _$jscoverage['/editor/range.js'].lineData[270]++;
        if (visit403_270_1(action == 2)) {
          _$jscoverage['/editor/range.js'].lineData[272]++;
          clone.appendChild(currentNode.cloneNode(TRUE));
        } else {
          _$jscoverage['/editor/range.js'].lineData[277]++;
          if (visit404_277_1(UN_REMOVABLE[currentNode.nodeName.toLowerCase()])) {
            _$jscoverage['/editor/range.js'].lineData[278]++;
            var tmp = currentNode.cloneNode(TRUE);
            _$jscoverage['/editor/range.js'].lineData[279]++;
            currentNode.innerHTML = '';
            _$jscoverage['/editor/range.js'].lineData[280]++;
            currentNode = tmp;
          } else {
            _$jscoverage['/editor/range.js'].lineData[283]++;
            Dom._4e_remove(currentNode);
          }
          _$jscoverage['/editor/range.js'].lineData[287]++;
          if (visit405_287_1(action == 1)) {
            _$jscoverage['/editor/range.js'].lineData[289]++;
            clone.appendChild(currentNode);
          }
        }
        _$jscoverage['/editor/range.js'].lineData[293]++;
        currentNode = currentSibling;
      }
      _$jscoverage['/editor/range.js'].lineData[296]++;
      if (visit406_296_1(levelClone)) {
        _$jscoverage['/editor/range.js'].lineData[297]++;
        clone = levelClone;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[301]++;
    clone = docFrag;
    _$jscoverage['/editor/range.js'].lineData[305]++;
    for (var k = i; visit407_305_1(k < endParents.length); k++) {
      _$jscoverage['/editor/range.js'].lineData[306]++;
      levelStartNode = endParents[k];
      _$jscoverage['/editor/range.js'].lineData[309]++;
      if (visit408_309_1(visit409_309_2(action > 0) && !levelStartNode.equals(endNode))) {
        _$jscoverage['/editor/range.js'].lineData[312]++;
        levelClone = clone.appendChild(levelStartNode.clone()[0]);
      } else {
        _$jscoverage['/editor/range.js'].lineData[314]++;
        levelClone = null;
      }
      _$jscoverage['/editor/range.js'].lineData[318]++;
      if (visit410_319_1(!startParents[k] || !levelStartNode._4e_sameLevel(startParents[k]))) {
        _$jscoverage['/editor/range.js'].lineData[323]++;
        currentNode = levelStartNode[0].previousSibling;
        _$jscoverage['/editor/range.js'].lineData[324]++;
        while (currentNode) {
          _$jscoverage['/editor/range.js'].lineData[326]++;
          currentSibling = currentNode.previousSibling;
          _$jscoverage['/editor/range.js'].lineData[329]++;
          if (visit411_329_1(action == 2)) {
            _$jscoverage['/editor/range.js'].lineData[330]++;
            clone.insertBefore(currentNode.cloneNode(TRUE), clone.firstChild);
          } else {
            _$jscoverage['/editor/range.js'].lineData[334]++;
            Dom._4e_remove(currentNode);
            _$jscoverage['/editor/range.js'].lineData[337]++;
            if (visit412_337_1(action == 1)) {
              _$jscoverage['/editor/range.js'].lineData[339]++;
              clone.insertBefore(currentNode, clone.firstChild);
            }
          }
          _$jscoverage['/editor/range.js'].lineData[343]++;
          currentNode = currentSibling;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[347]++;
      if (visit413_347_1(levelClone)) {
        _$jscoverage['/editor/range.js'].lineData[348]++;
        clone = levelClone;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[352]++;
    if (visit414_352_1(action == 2)) {
      _$jscoverage['/editor/range.js'].lineData[356]++;
      if (visit415_356_1(hasSplitStart)) {
        _$jscoverage['/editor/range.js'].lineData[357]++;
        var startTextNode = startNode[0];
        _$jscoverage['/editor/range.js'].lineData[358]++;
        if (visit416_358_1(visit417_358_2(startTextNode.nodeType == Dom.NodeType.TEXT_NODE) && visit418_359_1(startTextNode.nextSibling && visit419_361_1(startTextNode.nextSibling.nodeType == Dom.NodeType.TEXT_NODE)))) {
          _$jscoverage['/editor/range.js'].lineData[362]++;
          startTextNode.data += startTextNode.nextSibling.data;
          _$jscoverage['/editor/range.js'].lineData[363]++;
          startTextNode.parentNode.removeChild(startTextNode.nextSibling);
        }
      }
      _$jscoverage['/editor/range.js'].lineData[367]++;
      if (visit420_367_1(hasSplitEnd)) {
        _$jscoverage['/editor/range.js'].lineData[368]++;
        var endTextNode = endNode[0];
        _$jscoverage['/editor/range.js'].lineData[369]++;
        if (visit421_369_1(visit422_369_2(endTextNode.nodeType == Dom.NodeType.TEXT_NODE) && visit423_370_1(endTextNode.previousSibling && visit424_371_1(endTextNode.previousSibling.nodeType == Dom.NodeType.TEXT_NODE)))) {
          _$jscoverage['/editor/range.js'].lineData[372]++;
          endTextNode.previousSibling.data += endTextNode.data;
          _$jscoverage['/editor/range.js'].lineData[373]++;
          endTextNode.parentNode.removeChild(endTextNode);
        }
      }
    } else {
      _$jscoverage['/editor/range.js'].lineData[383]++;
      if (visit425_384_1(topStart && visit426_384_2(topEnd && (visit427_386_1(!startNode._4e_sameLevel(topStart) || !endNode._4e_sameLevel(topEnd)))))) {
        _$jscoverage['/editor/range.js'].lineData[390]++;
        var startIndex = topStart._4e_index();
        _$jscoverage['/editor/range.js'].lineData[394]++;
        if (visit428_394_1(removeStartNode && (topStart._4e_sameLevel(startNode)))) {
          _$jscoverage['/editor/range.js'].lineData[397]++;
          startIndex--;
        }
        _$jscoverage['/editor/range.js'].lineData[400]++;
        self.setStart(topStart.parent(), startIndex + 1);
      }
      _$jscoverage['/editor/range.js'].lineData[404]++;
      self.collapse(TRUE);
    }
    _$jscoverage['/editor/range.js'].lineData[409]++;
    if (visit429_409_1(removeStartNode)) {
      _$jscoverage['/editor/range.js'].lineData[410]++;
      startNode.remove();
    }
    _$jscoverage['/editor/range.js'].lineData[413]++;
    if (visit430_413_1(removeEndNode)) {
      _$jscoverage['/editor/range.js'].lineData[414]++;
      endNode.remove();
    }
    _$jscoverage['/editor/range.js'].lineData[417]++;
    return docFrag;
  }
  _$jscoverage['/editor/range.js'].lineData[420]++;
  function updateCollapsed(self) {
    _$jscoverage['/editor/range.js'].functionData[8]++;
    _$jscoverage['/editor/range.js'].lineData[421]++;
    self.collapsed = (visit431_422_1(self.startContainer && visit432_423_1(self.endContainer && visit433_424_1(visit434_424_2(self.startContainer[0] == self.endContainer[0]) && visit435_425_1(self.startOffset == self.endOffset)))));
  }
  _$jscoverage['/editor/range.js'].lineData[434]++;
  function KERange(document) {
    _$jscoverage['/editor/range.js'].functionData[9]++;
    _$jscoverage['/editor/range.js'].lineData[435]++;
    var self = this;
    _$jscoverage['/editor/range.js'].lineData[436]++;
    self.startContainer = NULL;
    _$jscoverage['/editor/range.js'].lineData[437]++;
    self.startOffset = NULL;
    _$jscoverage['/editor/range.js'].lineData[438]++;
    self.endContainer = NULL;
    _$jscoverage['/editor/range.js'].lineData[439]++;
    self.endOffset = NULL;
    _$jscoverage['/editor/range.js'].lineData[440]++;
    self.collapsed = TRUE;
    _$jscoverage['/editor/range.js'].lineData[441]++;
    self.document = document;
  }
  _$jscoverage['/editor/range.js'].lineData[444]++;
  S.augment(KERange, {
  toString: function() {
  _$jscoverage['/editor/range.js'].functionData[10]++;
  _$jscoverage['/editor/range.js'].lineData[450]++;
  var s = [], self = this, startContainer = self.startContainer[0], endContainer = self.endContainer[0];
  _$jscoverage['/editor/range.js'].lineData[454]++;
  s.push((visit436_454_1(startContainer.id || startContainer.nodeName)) + ":" + self.startOffset);
  _$jscoverage['/editor/range.js'].lineData[455]++;
  s.push((visit437_455_1(endContainer.id || endContainer.nodeName)) + ":" + self.endOffset);
  _$jscoverage['/editor/range.js'].lineData[456]++;
  return s.join("<br/>");
}, 
  optimize: function() {
  _$jscoverage['/editor/range.js'].functionData[11]++;
  _$jscoverage['/editor/range.js'].lineData[466]++;
  var self = this, container = self.startContainer, offset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[470]++;
  if (visit438_470_1(container[0].nodeType != Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[471]++;
    if (visit439_471_1(!offset)) {
      _$jscoverage['/editor/range.js'].lineData[472]++;
      self.setStartBefore(container);
    } else {
      _$jscoverage['/editor/range.js'].lineData[473]++;
      if (visit440_473_1(offset >= container[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[474]++;
        self.setStartAfter(container);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[478]++;
  container = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[479]++;
  offset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[481]++;
  if (visit441_481_1(container[0].nodeType != Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[482]++;
    if (visit442_482_1(!offset)) {
      _$jscoverage['/editor/range.js'].lineData[483]++;
      self.setEndBefore(container);
    } else {
      _$jscoverage['/editor/range.js'].lineData[484]++;
      if (visit443_484_1(offset >= container[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[485]++;
        self.setEndAfter(container);
      }
    }
  }
}, 
  setStartAfter: function(node) {
  _$jscoverage['/editor/range.js'].functionData[12]++;
  _$jscoverage['/editor/range.js'].lineData[495]++;
  this.setStart(node.parent(), node._4e_index() + 1);
}, 
  setStartBefore: function(node) {
  _$jscoverage['/editor/range.js'].functionData[13]++;
  _$jscoverage['/editor/range.js'].lineData[502]++;
  this.setStart(node.parent(), node._4e_index());
}, 
  setEndAfter: function(node) {
  _$jscoverage['/editor/range.js'].functionData[14]++;
  _$jscoverage['/editor/range.js'].lineData[509]++;
  this.setEnd(node.parent(), node._4e_index() + 1);
}, 
  setEndBefore: function(node) {
  _$jscoverage['/editor/range.js'].functionData[15]++;
  _$jscoverage['/editor/range.js'].lineData[516]++;
  this.setEnd(node.parent(), node._4e_index());
}, 
  optimizeBookmark: function() {
  _$jscoverage['/editor/range.js'].functionData[16]++;
  _$jscoverage['/editor/range.js'].lineData[523]++;
  var self = this, startNode = self.startContainer, endNode = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[527]++;
  if (visit444_527_1(startNode && visit445_528_1(visit446_528_2(startNode.nodeName() == 'span') && startNode.attr('_ke_bookmark')))) {
    _$jscoverage['/editor/range.js'].lineData[530]++;
    self.setStartBefore(startNode);
  }
  _$jscoverage['/editor/range.js'].lineData[532]++;
  if (visit447_532_1(endNode && visit448_533_1(visit449_533_2(endNode.nodeName() == 'span') && endNode.attr('_ke_bookmark')))) {
    _$jscoverage['/editor/range.js'].lineData[535]++;
    self.setEndAfter(endNode);
  }
}, 
  setStart: function(startNode, startOffset) {
  _$jscoverage['/editor/range.js'].functionData[17]++;
  _$jscoverage['/editor/range.js'].lineData[553]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[554]++;
  if (visit450_554_1(visit451_554_2(startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && EMPTY[startNode.nodeName()])) {
    _$jscoverage['/editor/range.js'].lineData[555]++;
    startNode = startNode.parent();
    _$jscoverage['/editor/range.js'].lineData[556]++;
    startOffset = startNode._4e_index();
  }
  _$jscoverage['/editor/range.js'].lineData[559]++;
  self.startContainer = startNode;
  _$jscoverage['/editor/range.js'].lineData[560]++;
  self.startOffset = startOffset;
  _$jscoverage['/editor/range.js'].lineData[562]++;
  if (visit452_562_1(!self.endContainer)) {
    _$jscoverage['/editor/range.js'].lineData[563]++;
    self.endContainer = startNode;
    _$jscoverage['/editor/range.js'].lineData[564]++;
    self.endOffset = startOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[567]++;
  updateCollapsed(self);
}, 
  setEnd: function(endNode, endOffset) {
  _$jscoverage['/editor/range.js'].functionData[18]++;
  _$jscoverage['/editor/range.js'].lineData[584]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[585]++;
  if (visit453_585_1(visit454_585_2(endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && EMPTY[endNode.nodeName()])) {
    _$jscoverage['/editor/range.js'].lineData[586]++;
    endNode = endNode.parent();
    _$jscoverage['/editor/range.js'].lineData[587]++;
    endOffset = endNode._4e_index() + 1;
  }
  _$jscoverage['/editor/range.js'].lineData[590]++;
  self.endContainer = endNode;
  _$jscoverage['/editor/range.js'].lineData[591]++;
  self.endOffset = endOffset;
  _$jscoverage['/editor/range.js'].lineData[593]++;
  if (visit455_593_1(!self.startContainer)) {
    _$jscoverage['/editor/range.js'].lineData[594]++;
    self.startContainer = endNode;
    _$jscoverage['/editor/range.js'].lineData[595]++;
    self.startOffset = endOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[598]++;
  updateCollapsed(self);
}, 
  setStartAt: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[19]++;
  _$jscoverage['/editor/range.js'].lineData[607]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[608]++;
  switch (position) {
    case KER.POSITION_AFTER_START:
      _$jscoverage['/editor/range.js'].lineData[610]++;
      self.setStart(node, 0);
      _$jscoverage['/editor/range.js'].lineData[611]++;
      break;
    case KER.POSITION_BEFORE_END:
      _$jscoverage['/editor/range.js'].lineData[614]++;
      if (visit456_614_1(node[0].nodeType == Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[615]++;
        self.setStart(node, node[0].nodeValue.length);
      } else {
        _$jscoverage['/editor/range.js'].lineData[617]++;
        self.setStart(node, node[0].childNodes.length);
      }
      _$jscoverage['/editor/range.js'].lineData[619]++;
      break;
    case KER.POSITION_BEFORE_START:
      _$jscoverage['/editor/range.js'].lineData[622]++;
      self.setStartBefore(node);
      _$jscoverage['/editor/range.js'].lineData[623]++;
      break;
    case KER.POSITION_AFTER_END:
      _$jscoverage['/editor/range.js'].lineData[626]++;
      self.setStartAfter(node);
  }
  _$jscoverage['/editor/range.js'].lineData[629]++;
  updateCollapsed(self);
}, 
  setEndAt: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[20]++;
  _$jscoverage['/editor/range.js'].lineData[638]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[639]++;
  switch (position) {
    case KER.POSITION_AFTER_START:
      _$jscoverage['/editor/range.js'].lineData[641]++;
      self.setEnd(node, 0);
      _$jscoverage['/editor/range.js'].lineData[642]++;
      break;
    case KER.POSITION_BEFORE_END:
      _$jscoverage['/editor/range.js'].lineData[645]++;
      if (visit457_645_1(node[0].nodeType == Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[646]++;
        self.setEnd(node, node[0].nodeValue.length);
      } else {
        _$jscoverage['/editor/range.js'].lineData[648]++;
        self.setEnd(node, node[0].childNodes.length);
      }
      _$jscoverage['/editor/range.js'].lineData[650]++;
      break;
    case KER.POSITION_BEFORE_START:
      _$jscoverage['/editor/range.js'].lineData[653]++;
      self.setEndBefore(node);
      _$jscoverage['/editor/range.js'].lineData[654]++;
      break;
    case KER.POSITION_AFTER_END:
      _$jscoverage['/editor/range.js'].lineData[657]++;
      self.setEndAfter(node);
  }
  _$jscoverage['/editor/range.js'].lineData[660]++;
  updateCollapsed(self);
}, 
  cloneContents: function() {
  _$jscoverage['/editor/range.js'].functionData[21]++;
  _$jscoverage['/editor/range.js'].lineData[667]++;
  return execContentsAction(this, 2);
}, 
  deleteContents: function() {
  _$jscoverage['/editor/range.js'].functionData[22]++;
  _$jscoverage['/editor/range.js'].lineData[674]++;
  return execContentsAction(this, 0);
}, 
  extractContents: function() {
  _$jscoverage['/editor/range.js'].functionData[23]++;
  _$jscoverage['/editor/range.js'].lineData[681]++;
  return execContentsAction(this, 1);
}, 
  collapse: function(toStart) {
  _$jscoverage['/editor/range.js'].functionData[24]++;
  _$jscoverage['/editor/range.js'].lineData[689]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[690]++;
  if (visit458_690_1(toStart)) {
    _$jscoverage['/editor/range.js'].lineData[691]++;
    self.endContainer = self.startContainer;
    _$jscoverage['/editor/range.js'].lineData[692]++;
    self.endOffset = self.startOffset;
  } else {
    _$jscoverage['/editor/range.js'].lineData[694]++;
    self.startContainer = self.endContainer;
    _$jscoverage['/editor/range.js'].lineData[695]++;
    self.startOffset = self.endOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[697]++;
  self.collapsed = TRUE;
}, 
  clone: function() {
  _$jscoverage['/editor/range.js'].functionData[25]++;
  _$jscoverage['/editor/range.js'].lineData[705]++;
  var self = this, clone = new KERange(self.document);
  _$jscoverage['/editor/range.js'].lineData[708]++;
  clone.startContainer = self.startContainer;
  _$jscoverage['/editor/range.js'].lineData[709]++;
  clone.startOffset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[710]++;
  clone.endContainer = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[711]++;
  clone.endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[712]++;
  clone.collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[714]++;
  return clone;
}, 
  getEnclosedNode: function() {
  _$jscoverage['/editor/range.js'].functionData[26]++;
  _$jscoverage['/editor/range.js'].lineData[726]++;
  var walkerRange = this.clone();
  _$jscoverage['/editor/range.js'].lineData[729]++;
  walkerRange.optimize();
  _$jscoverage['/editor/range.js'].lineData[731]++;
  if (visit459_731_1(visit460_731_2(walkerRange.startContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE) || visit461_732_1(walkerRange.endContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[733]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[736]++;
  var walker = new Walker(walkerRange), node, pre;
  _$jscoverage['/editor/range.js'].lineData[739]++;
  walker.evaluator = function(node) {
  _$jscoverage['/editor/range.js'].functionData[27]++;
  _$jscoverage['/editor/range.js'].lineData[740]++;
  return visit462_740_1(isNotWhitespaces(node) && isNotBookmarks(node));
};
  _$jscoverage['/editor/range.js'].lineData[747]++;
  node = walker.next();
  _$jscoverage['/editor/range.js'].lineData[748]++;
  walker.reset();
  _$jscoverage['/editor/range.js'].lineData[749]++;
  pre = walker.previous();
  _$jscoverage['/editor/range.js'].lineData[751]++;
  return visit463_751_1(node && node.equals(pre)) ? node : NULL;
}, 
  shrink: function(mode, selectContents) {
  _$jscoverage['/editor/range.js'].functionData[28]++;
  _$jscoverage['/editor/range.js'].lineData[761]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[762]++;
  if (visit464_762_1(!self.collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[763]++;
    mode = visit465_763_1(mode || KER.SHRINK_TEXT);
    _$jscoverage['/editor/range.js'].lineData[765]++;
    var walkerRange = self.clone(), startContainer = self.startContainer, endContainer = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, moveStart = TRUE, currentElement, walker, moveEnd = TRUE;
    _$jscoverage['/editor/range.js'].lineData[776]++;
    if (visit466_776_1(startContainer && visit467_777_1(startContainer[0].nodeType == Dom.NodeType.TEXT_NODE))) {
      _$jscoverage['/editor/range.js'].lineData[778]++;
      if (visit468_778_1(!startOffset)) {
        _$jscoverage['/editor/range.js'].lineData[779]++;
        walkerRange.setStartBefore(startContainer);
      } else {
        _$jscoverage['/editor/range.js'].lineData[780]++;
        if (visit469_780_1(startOffset >= startContainer[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[781]++;
          walkerRange.setStartAfter(startContainer);
        } else {
          _$jscoverage['/editor/range.js'].lineData[785]++;
          walkerRange.setStartBefore(startContainer);
          _$jscoverage['/editor/range.js'].lineData[786]++;
          moveStart = FALSE;
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[790]++;
    if (visit470_790_1(endContainer && visit471_791_1(endContainer[0].nodeType == Dom.NodeType.TEXT_NODE))) {
      _$jscoverage['/editor/range.js'].lineData[792]++;
      if (visit472_792_1(!endOffset)) {
        _$jscoverage['/editor/range.js'].lineData[793]++;
        walkerRange.setEndBefore(endContainer);
      } else {
        _$jscoverage['/editor/range.js'].lineData[794]++;
        if (visit473_794_1(endOffset >= endContainer[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[795]++;
          walkerRange.setEndAfter(endContainer);
        } else {
          _$jscoverage['/editor/range.js'].lineData[797]++;
          walkerRange.setEndAfter(endContainer);
          _$jscoverage['/editor/range.js'].lineData[798]++;
          moveEnd = FALSE;
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[802]++;
    if (visit474_802_1(moveStart || moveEnd)) {
      _$jscoverage['/editor/range.js'].lineData[804]++;
      walker = new Walker(walkerRange);
      _$jscoverage['/editor/range.js'].lineData[806]++;
      walker.evaluator = function(node) {
  _$jscoverage['/editor/range.js'].functionData[29]++;
  _$jscoverage['/editor/range.js'].lineData[807]++;
  return visit475_807_1(node.nodeType == (visit476_807_2(mode == KER.SHRINK_ELEMENT) ? Dom.NodeType.ELEMENT_NODE : Dom.NodeType.TEXT_NODE));
};
      _$jscoverage['/editor/range.js'].lineData[811]++;
      walker.guard = function(node, movingOut) {
  _$jscoverage['/editor/range.js'].functionData[30]++;
  _$jscoverage['/editor/range.js'].lineData[813]++;
  if (visit477_813_1(visit478_813_2(mode == KER.SHRINK_ELEMENT) && visit479_814_1(node.nodeType == Dom.NodeType.TEXT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[815]++;
    return FALSE;
  }
  _$jscoverage['/editor/range.js'].lineData[818]++;
  if (visit480_818_1(movingOut && visit481_818_2(node == currentElement))) {
    _$jscoverage['/editor/range.js'].lineData[819]++;
    return FALSE;
  }
  _$jscoverage['/editor/range.js'].lineData[821]++;
  if (visit482_821_1(!movingOut && visit483_821_2(node.nodeType == Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[822]++;
    currentElement = node;
  }
  _$jscoverage['/editor/range.js'].lineData[824]++;
  return TRUE;
};
    }
    _$jscoverage['/editor/range.js'].lineData[829]++;
    if (visit484_829_1(moveStart)) {
      _$jscoverage['/editor/range.js'].lineData[830]++;
      var textStart = walker[visit485_830_1(mode == KER.SHRINK_ELEMENT) ? 'lastForward' : 'next']();
      _$jscoverage['/editor/range.js'].lineData[831]++;
      if (visit486_831_1(textStart)) {
        _$jscoverage['/editor/range.js'].lineData[832]++;
        self.setStartAt(textStart, selectContents ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_START);
      }
    }
    _$jscoverage['/editor/range.js'].lineData[836]++;
    if (visit487_836_1(moveEnd)) {
      _$jscoverage['/editor/range.js'].lineData[837]++;
      walker.reset();
      _$jscoverage['/editor/range.js'].lineData[838]++;
      var textEnd = walker[visit488_838_1(mode == KER.SHRINK_ELEMENT) ? 'lastBackward' : 'previous']();
      _$jscoverage['/editor/range.js'].lineData[839]++;
      if (visit489_839_1(textEnd)) {
        _$jscoverage['/editor/range.js'].lineData[840]++;
        self.setEndAt(textEnd, selectContents ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_END);
      }
    }
    _$jscoverage['/editor/range.js'].lineData[844]++;
    return visit490_844_1(moveStart || moveEnd);
  }
}, 
  createBookmark2: function(normalized) {
  _$jscoverage['/editor/range.js'].functionData[31]++;
  _$jscoverage['/editor/range.js'].lineData[854]++;
  var self = this, startContainer = self.startContainer, endContainer = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, child, previous;
  _$jscoverage['/editor/range.js'].lineData[864]++;
  if (visit491_864_1(!startContainer || !endContainer)) {
    _$jscoverage['/editor/range.js'].lineData[865]++;
    return {
  start: 0, 
  end: 0};
  }
  _$jscoverage['/editor/range.js'].lineData[871]++;
  if (visit492_871_1(normalized)) {
    _$jscoverage['/editor/range.js'].lineData[874]++;
    if (visit493_874_1(startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[875]++;
      child = new Node(startContainer[0].childNodes[startOffset]);
      _$jscoverage['/editor/range.js'].lineData[879]++;
      if (visit494_879_1(child && visit495_879_2(child[0] && visit496_879_3(visit497_879_4(child[0].nodeType == Dom.NodeType.TEXT_NODE) && visit498_880_1(visit499_880_2(startOffset > 0) && visit500_880_3(child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE)))))) {
        _$jscoverage['/editor/range.js'].lineData[881]++;
        startContainer = child;
        _$jscoverage['/editor/range.js'].lineData[882]++;
        startOffset = 0;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[888]++;
    while (visit501_888_1(visit502_888_2(startContainer[0].nodeType == Dom.NodeType.TEXT_NODE) && visit503_889_1((previous = startContainer.prev(undefined, 1)) && visit504_890_1(previous[0].nodeType == Dom.NodeType.TEXT_NODE)))) {
      _$jscoverage['/editor/range.js'].lineData[891]++;
      startContainer = previous;
      _$jscoverage['/editor/range.js'].lineData[892]++;
      startOffset += previous[0].nodeValue.length;
    }
    _$jscoverage['/editor/range.js'].lineData[896]++;
    if (visit505_896_1(!self.collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[899]++;
      if (visit506_899_1(endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[900]++;
        child = new Node(endContainer[0].childNodes[endOffset]);
        _$jscoverage['/editor/range.js'].lineData[904]++;
        if (visit507_904_1(child && visit508_904_2(child[0] && visit509_905_1(visit510_905_2(child[0].nodeType == Dom.NodeType.TEXT_NODE) && visit511_905_3(visit512_905_4(endOffset > 0) && visit513_906_1(child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE)))))) {
          _$jscoverage['/editor/range.js'].lineData[907]++;
          endContainer = child;
          _$jscoverage['/editor/range.js'].lineData[908]++;
          endOffset = 0;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[913]++;
      while (visit514_913_1(visit515_913_2(endContainer[0].nodeType == Dom.NodeType.TEXT_NODE) && visit516_914_1((previous = endContainer.prev(undefined, 1)) && visit517_915_1(previous[0].nodeType == Dom.NodeType.TEXT_NODE)))) {
        _$jscoverage['/editor/range.js'].lineData[916]++;
        endContainer = previous;
        _$jscoverage['/editor/range.js'].lineData[917]++;
        endOffset += previous[0].nodeValue.length;
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[922]++;
  return {
  start: startContainer._4e_address(normalized), 
  end: self.collapsed ? NULL : endContainer._4e_address(normalized), 
  startOffset: startOffset, 
  endOffset: endOffset, 
  normalized: normalized, 
  is2: TRUE};
}, 
  createBookmark: function(serializable) {
  _$jscoverage['/editor/range.js'].functionData[32]++;
  _$jscoverage['/editor/range.js'].lineData[936]++;
  var startNode, endNode, baseId, clone, self = this, collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[942]++;
  startNode = new Node("<span>", NULL, self.document);
  _$jscoverage['/editor/range.js'].lineData[943]++;
  startNode.attr('_ke_bookmark', 1);
  _$jscoverage['/editor/range.js'].lineData[944]++;
  startNode.css('display', 'none');
  _$jscoverage['/editor/range.js'].lineData[948]++;
  startNode.html('&nbsp;');
  _$jscoverage['/editor/range.js'].lineData[950]++;
  if (visit518_950_1(serializable)) {
    _$jscoverage['/editor/range.js'].lineData[951]++;
    baseId = S.guid('ke_bm_');
    _$jscoverage['/editor/range.js'].lineData[952]++;
    startNode.attr('id', baseId + 'S');
  }
  _$jscoverage['/editor/range.js'].lineData[956]++;
  if (visit519_956_1(!collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[957]++;
    endNode = startNode.clone();
    _$jscoverage['/editor/range.js'].lineData[958]++;
    endNode.html('&nbsp;');
    _$jscoverage['/editor/range.js'].lineData[960]++;
    if (visit520_960_1(serializable)) {
      _$jscoverage['/editor/range.js'].lineData[961]++;
      endNode.attr('id', baseId + 'E');
    }
    _$jscoverage['/editor/range.js'].lineData[964]++;
    clone = self.clone();
    _$jscoverage['/editor/range.js'].lineData[965]++;
    clone.collapse();
    _$jscoverage['/editor/range.js'].lineData[966]++;
    clone.insertNode(endNode);
  }
  _$jscoverage['/editor/range.js'].lineData[969]++;
  clone = self.clone();
  _$jscoverage['/editor/range.js'].lineData[970]++;
  clone.collapse(TRUE);
  _$jscoverage['/editor/range.js'].lineData[971]++;
  clone.insertNode(startNode);
  _$jscoverage['/editor/range.js'].lineData[974]++;
  if (visit521_974_1(endNode)) {
    _$jscoverage['/editor/range.js'].lineData[975]++;
    self.setStartAfter(startNode);
    _$jscoverage['/editor/range.js'].lineData[976]++;
    self.setEndBefore(endNode);
  } else {
    _$jscoverage['/editor/range.js'].lineData[978]++;
    self.moveToPosition(startNode, KER.POSITION_AFTER_END);
  }
  _$jscoverage['/editor/range.js'].lineData[981]++;
  return {
  startNode: serializable ? baseId + 'S' : startNode, 
  endNode: serializable ? baseId + 'E' : endNode, 
  serializable: serializable, 
  collapsed: collapsed};
}, 
  moveToPosition: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[33]++;
  _$jscoverage['/editor/range.js'].lineData[995]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[996]++;
  self.setStartAt(node, position);
  _$jscoverage['/editor/range.js'].lineData[997]++;
  self.collapse(TRUE);
}, 
  trim: function(ignoreStart, ignoreEnd) {
  _$jscoverage['/editor/range.js'].functionData[34]++;
  _$jscoverage['/editor/range.js'].lineData[1006]++;
  var self = this, startContainer = self.startContainer, startOffset = self.startOffset, collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[1011]++;
  if (visit522_1011_1((visit523_1011_2(!ignoreStart || collapsed)) && visit524_1012_1(startContainer[0] && visit525_1013_1(startContainer[0].nodeType == Dom.NodeType.TEXT_NODE)))) {
    _$jscoverage['/editor/range.js'].lineData[1016]++;
    if (visit526_1016_1(!startOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1017]++;
      startOffset = startContainer._4e_index();
      _$jscoverage['/editor/range.js'].lineData[1018]++;
      startContainer = startContainer.parent();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1022]++;
      if (visit527_1022_1(startOffset >= startContainer[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[1023]++;
        startOffset = startContainer._4e_index() + 1;
        _$jscoverage['/editor/range.js'].lineData[1024]++;
        startContainer = startContainer.parent();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1029]++;
        var nextText = startContainer._4e_splitText(startOffset);
        _$jscoverage['/editor/range.js'].lineData[1031]++;
        startOffset = startContainer._4e_index() + 1;
        _$jscoverage['/editor/range.js'].lineData[1032]++;
        startContainer = startContainer.parent();
        _$jscoverage['/editor/range.js'].lineData[1035]++;
        if (visit528_1035_1(Dom.equals(self.startContainer, self.endContainer))) {
          _$jscoverage['/editor/range.js'].lineData[1036]++;
          self.setEnd(nextText, self.endOffset - self.startOffset);
        } else {
          _$jscoverage['/editor/range.js'].lineData[1037]++;
          if (visit529_1037_1(Dom.equals(startContainer, self.endContainer))) {
            _$jscoverage['/editor/range.js'].lineData[1038]++;
            self.endOffset += 1;
          }
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[1042]++;
    self.setStart(startContainer, startOffset);
    _$jscoverage['/editor/range.js'].lineData[1044]++;
    if (visit530_1044_1(collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[1045]++;
      self.collapse(TRUE);
      _$jscoverage['/editor/range.js'].lineData[1046]++;
      return;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1050]++;
  var endContainer = self.endContainer, endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[1053]++;
  if (visit531_1053_1(!(visit532_1053_2(ignoreEnd || collapsed)) && visit533_1054_1(endContainer[0] && visit534_1054_2(endContainer[0].nodeType == Dom.NodeType.TEXT_NODE)))) {
    _$jscoverage['/editor/range.js'].lineData[1057]++;
    if (visit535_1057_1(!endOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1058]++;
      endOffset = endContainer._4e_index();
      _$jscoverage['/editor/range.js'].lineData[1059]++;
      endContainer = endContainer.parent();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1063]++;
      if (visit536_1063_1(endOffset >= endContainer[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[1064]++;
        endOffset = endContainer._4e_index() + 1;
        _$jscoverage['/editor/range.js'].lineData[1065]++;
        endContainer = endContainer.parent();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1070]++;
        endContainer._4e_splitText(endOffset);
        _$jscoverage['/editor/range.js'].lineData[1072]++;
        endOffset = endContainer._4e_index() + 1;
        _$jscoverage['/editor/range.js'].lineData[1073]++;
        endContainer = endContainer.parent();
      }
    }
    _$jscoverage['/editor/range.js'].lineData[1076]++;
    self.setEnd(endContainer, endOffset);
  }
}, 
  insertNode: function(node) {
  _$jscoverage['/editor/range.js'].functionData[35]++;
  _$jscoverage['/editor/range.js'].lineData[1084]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1085]++;
  self.optimizeBookmark();
  _$jscoverage['/editor/range.js'].lineData[1086]++;
  self.trim(FALSE, TRUE);
  _$jscoverage['/editor/range.js'].lineData[1087]++;
  var startContainer = self.startContainer, startOffset = self.startOffset, nextNode = visit537_1089_1(startContainer[0].childNodes[startOffset] || null);
  _$jscoverage['/editor/range.js'].lineData[1091]++;
  startContainer[0].insertBefore(node[0], nextNode);
  _$jscoverage['/editor/range.js'].lineData[1093]++;
  if (visit538_1093_1(startContainer[0] == self.endContainer[0])) {
    _$jscoverage['/editor/range.js'].lineData[1094]++;
    self.endOffset++;
  }
  _$jscoverage['/editor/range.js'].lineData[1097]++;
  self.setStartBefore(node);
}, 
  moveToBookmark: function(bookmark) {
  _$jscoverage['/editor/range.js'].functionData[36]++;
  _$jscoverage['/editor/range.js'].lineData[1105]++;
  var self = this, doc = $(self.document);
  _$jscoverage['/editor/range.js'].lineData[1107]++;
  if (visit539_1107_1(bookmark.is2)) {
    _$jscoverage['/editor/range.js'].lineData[1109]++;
    var startContainer = doc._4e_getByAddress(bookmark.start, bookmark.normalized), startOffset = bookmark.startOffset, endContainer = visit540_1111_1(bookmark.end && doc._4e_getByAddress(bookmark.end, bookmark.normalized)), endOffset = bookmark.endOffset;
    _$jscoverage['/editor/range.js'].lineData[1115]++;
    self.setStart(startContainer, startOffset);
    _$jscoverage['/editor/range.js'].lineData[1118]++;
    if (visit541_1118_1(endContainer)) {
      _$jscoverage['/editor/range.js'].lineData[1119]++;
      self.setEnd(endContainer, endOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1121]++;
      self.collapse(TRUE);
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[1125]++;
    var serializable = bookmark.serializable, startNode = serializable ? S.one("#" + bookmark.startNode, doc) : bookmark.startNode, endNode = serializable ? S.one("#" + bookmark.endNode, doc) : bookmark.endNode;
    _$jscoverage['/editor/range.js'].lineData[1132]++;
    self.setStartBefore(startNode);
    _$jscoverage['/editor/range.js'].lineData[1135]++;
    startNode._4e_remove();
    _$jscoverage['/editor/range.js'].lineData[1139]++;
    if (visit542_1139_1(endNode && endNode[0])) {
      _$jscoverage['/editor/range.js'].lineData[1140]++;
      self.setEndBefore(endNode);
      _$jscoverage['/editor/range.js'].lineData[1141]++;
      endNode._4e_remove();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1143]++;
      self.collapse(TRUE);
    }
  }
}, 
  getCommonAncestor: function(includeSelf, ignoreTextNode) {
  _$jscoverage['/editor/range.js'].functionData[37]++;
  _$jscoverage['/editor/range.js'].lineData[1154]++;
  var self = this, start = self.startContainer, end = self.endContainer, ancestor;
  _$jscoverage['/editor/range.js'].lineData[1159]++;
  if (visit543_1159_1(start[0] == end[0])) {
    _$jscoverage['/editor/range.js'].lineData[1160]++;
    if (visit544_1160_1(includeSelf && visit545_1161_1(visit546_1161_2(start[0].nodeType == Dom.NodeType.ELEMENT_NODE) && visit547_1162_1(self.startOffset == self.endOffset - 1)))) {
      _$jscoverage['/editor/range.js'].lineData[1163]++;
      ancestor = new Node(start[0].childNodes[self.startOffset]);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1165]++;
      ancestor = start;
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[1168]++;
    ancestor = start._4e_commonAncestor(end);
  }
  _$jscoverage['/editor/range.js'].lineData[1171]++;
  return visit548_1171_1(ignoreTextNode && visit549_1171_2(ancestor[0].nodeType == Dom.NodeType.TEXT_NODE)) ? ancestor.parent() : ancestor;
}, 
  enlarge: (function() {
  _$jscoverage['/editor/range.js'].functionData[38]++;
  _$jscoverage['/editor/range.js'].lineData[1185]++;
  function enlargeElement(self, left, stop, commonAncestor) {
    _$jscoverage['/editor/range.js'].functionData[39]++;
    _$jscoverage['/editor/range.js'].lineData[1186]++;
    var container = self[left ? 'startContainer' : 'endContainer'], enlarge, sibling, index = left ? 0 : 1, commonReached = 0, direction = left ? "previousSibling" : "nextSibling", offset = self[left ? 'startOffset' : 'endOffset'];
    _$jscoverage['/editor/range.js'].lineData[1194]++;
    if (visit550_1194_1(container[0].nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[1195]++;
      if (visit551_1195_1(left)) {
        _$jscoverage['/editor/range.js'].lineData[1197]++;
        if (visit552_1197_1(offset)) {
          _$jscoverage['/editor/range.js'].lineData[1198]++;
          return;
        }
      } else {
        _$jscoverage['/editor/range.js'].lineData[1201]++;
        if (visit553_1201_1(offset < container[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[1202]++;
          return;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[1207]++;
      sibling = container[0][direction];
      _$jscoverage['/editor/range.js'].lineData[1209]++;
      enlarge = container[0].parentNode;
    } else {
      _$jscoverage['/editor/range.js'].lineData[1212]++;
      sibling = visit554_1212_1(container[0].childNodes[offset + (left ? -1 : 1)] || null);
      _$jscoverage['/editor/range.js'].lineData[1214]++;
      enlarge = container[0];
    }
    _$jscoverage['/editor/range.js'].lineData[1217]++;
    while (enlarge) {
      _$jscoverage['/editor/range.js'].lineData[1219]++;
      while (sibling) {
        _$jscoverage['/editor/range.js'].lineData[1220]++;
        if (visit555_1220_1(isWhitespace(sibling) || isBookmark(sibling))) {
          _$jscoverage['/editor/range.js'].lineData[1221]++;
          sibling = sibling[direction];
        } else {
          _$jscoverage['/editor/range.js'].lineData[1223]++;
          break;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[1228]++;
      if (visit556_1228_1(sibling)) {
        _$jscoverage['/editor/range.js'].lineData[1230]++;
        if (visit557_1230_1(!commonReached)) {
          _$jscoverage['/editor/range.js'].lineData[1232]++;
          self[left ? 'setStartAfter' : 'setEndBefore']($(sibling));
        }
        _$jscoverage['/editor/range.js'].lineData[1234]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1241]++;
      enlarge = $(enlarge);
      _$jscoverage['/editor/range.js'].lineData[1243]++;
      if (visit558_1243_1(enlarge.nodeName() == "body")) {
        _$jscoverage['/editor/range.js'].lineData[1244]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1247]++;
      if (visit559_1247_1(commonReached || enlarge.equals(commonAncestor))) {
        _$jscoverage['/editor/range.js'].lineData[1248]++;
        stop[index] = enlarge;
        _$jscoverage['/editor/range.js'].lineData[1249]++;
        commonReached = 1;
      } else {
        _$jscoverage['/editor/range.js'].lineData[1252]++;
        self[left ? 'setStartBefore' : 'setEndAfter'](enlarge);
      }
      _$jscoverage['/editor/range.js'].lineData[1255]++;
      sibling = enlarge[0][direction];
      _$jscoverage['/editor/range.js'].lineData[1256]++;
      enlarge = enlarge[0].parentNode;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1261]++;
  return function(unit) {
  _$jscoverage['/editor/range.js'].functionData[40]++;
  _$jscoverage['/editor/range.js'].lineData[1262]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1263]++;
  switch (unit) {
    case KER.ENLARGE_ELEMENT:
      _$jscoverage['/editor/range.js'].lineData[1266]++;
      if (visit560_1266_1(self.collapsed)) {
        _$jscoverage['/editor/range.js'].lineData[1267]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1270]++;
      var commonAncestor = self.getCommonAncestor(), stop = [];
      _$jscoverage['/editor/range.js'].lineData[1273]++;
      enlargeElement(self, 1, stop, commonAncestor);
      _$jscoverage['/editor/range.js'].lineData[1274]++;
      enlargeElement(self, 0, stop, commonAncestor);
      _$jscoverage['/editor/range.js'].lineData[1276]++;
      if (visit561_1276_1(stop[0] && stop[1])) {
        _$jscoverage['/editor/range.js'].lineData[1277]++;
        var commonStop = stop[0].contains(stop[1]) ? stop[1] : stop[0];
        _$jscoverage['/editor/range.js'].lineData[1278]++;
        self.setStartBefore(commonStop);
        _$jscoverage['/editor/range.js'].lineData[1279]++;
        self.setEndAfter(commonStop);
      }
      _$jscoverage['/editor/range.js'].lineData[1282]++;
      break;
    case KER.ENLARGE_BLOCK_CONTENTS:
    case KER.ENLARGE_LIST_ITEM_CONTENTS:
      _$jscoverage['/editor/range.js'].lineData[1288]++;
      var walkerRange = new KERange(self.document);
      _$jscoverage['/editor/range.js'].lineData[1289]++;
      var body = new Node(self.document.body);
      _$jscoverage['/editor/range.js'].lineData[1291]++;
      walkerRange.setStartAt(body, KER.POSITION_AFTER_START);
      _$jscoverage['/editor/range.js'].lineData[1292]++;
      walkerRange.setEnd(self.startContainer, self.startOffset);
      _$jscoverage['/editor/range.js'].lineData[1294]++;
      var walker = new Walker(walkerRange), blockBoundary, tailBr, defaultGuard = Walker.blockBoundary((visit562_1298_1(unit == KER.ENLARGE_LIST_ITEM_CONTENTS)) ? {
  br: 1} : NULL), boundaryGuard = function(node) {
  _$jscoverage['/editor/range.js'].functionData[41]++;
  _$jscoverage['/editor/range.js'].lineData[1302]++;
  var retVal = defaultGuard(node);
  _$jscoverage['/editor/range.js'].lineData[1303]++;
  if (visit563_1303_1(!retVal)) {
    _$jscoverage['/editor/range.js'].lineData[1304]++;
    blockBoundary = $(node);
  }
  _$jscoverage['/editor/range.js'].lineData[1306]++;
  return retVal;
}, tailBrGuard = function(node) {
  _$jscoverage['/editor/range.js'].functionData[42]++;
  _$jscoverage['/editor/range.js'].lineData[1310]++;
  var retVal = boundaryGuard(node);
  _$jscoverage['/editor/range.js'].lineData[1311]++;
  if (visit564_1311_1(!retVal && visit565_1311_2(Dom.nodeName(node) == 'br'))) {
    _$jscoverage['/editor/range.js'].lineData[1312]++;
    tailBr = $(node);
  }
  _$jscoverage['/editor/range.js'].lineData[1314]++;
  return retVal;
};
      _$jscoverage['/editor/range.js'].lineData[1317]++;
      walker.guard = boundaryGuard;
      _$jscoverage['/editor/range.js'].lineData[1319]++;
      enlargeable = walker.lastBackward();
      _$jscoverage['/editor/range.js'].lineData[1322]++;
      blockBoundary = visit566_1322_1(blockBoundary || body);
      _$jscoverage['/editor/range.js'].lineData[1326]++;
      self.setStartAt(blockBoundary, visit567_1328_1(visit568_1328_2(blockBoundary.nodeName() != 'br') && (visit569_1336_1(visit570_1336_2(!enlargeable && self.checkStartOfBlock()) || visit571_1337_1(enlargeable && blockBoundary.contains(enlargeable))))) ? KER.POSITION_AFTER_START : KER.POSITION_AFTER_END);
      _$jscoverage['/editor/range.js'].lineData[1342]++;
      walkerRange = self.clone();
      _$jscoverage['/editor/range.js'].lineData[1343]++;
      walkerRange.collapse();
      _$jscoverage['/editor/range.js'].lineData[1344]++;
      walkerRange.setEndAt(body, KER.POSITION_BEFORE_END);
      _$jscoverage['/editor/range.js'].lineData[1345]++;
      walker = new Walker(walkerRange);
      _$jscoverage['/editor/range.js'].lineData[1348]++;
      walker.guard = (visit572_1348_1(unit == KER.ENLARGE_LIST_ITEM_CONTENTS)) ? tailBrGuard : boundaryGuard;
      _$jscoverage['/editor/range.js'].lineData[1350]++;
      blockBoundary = NULL;
      _$jscoverage['/editor/range.js'].lineData[1353]++;
      var enlargeable = walker.lastForward();
      _$jscoverage['/editor/range.js'].lineData[1356]++;
      blockBoundary = visit573_1356_1(blockBoundary || body);
      _$jscoverage['/editor/range.js'].lineData[1360]++;
      self.setEndAt(blockBoundary, (visit574_1362_1(visit575_1362_2(!enlargeable && self.checkEndOfBlock()) || visit576_1363_1(enlargeable && blockBoundary.contains(enlargeable)))) ? KER.POSITION_BEFORE_END : KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/range.js'].lineData[1368]++;
      if (visit577_1368_1(tailBr)) {
        _$jscoverage['/editor/range.js'].lineData[1369]++;
        self.setEndAfter(tailBr);
      }
  }
};
})(), 
  checkStartOfBlock: function() {
  _$jscoverage['/editor/range.js'].functionData[43]++;
  _$jscoverage['/editor/range.js'].lineData[1380]++;
  var self = this, startContainer = self.startContainer, startOffset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[1386]++;
  if (visit578_1386_1(startOffset && visit579_1386_2(startContainer[0].nodeType == Dom.NodeType.TEXT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[1387]++;
    var textBefore = S.trim(startContainer[0].nodeValue.substring(0, startOffset));
    _$jscoverage['/editor/range.js'].lineData[1388]++;
    if (visit580_1388_1(textBefore.length)) {
      _$jscoverage['/editor/range.js'].lineData[1389]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1396]++;
  self.trim();
  _$jscoverage['/editor/range.js'].lineData[1400]++;
  var path = new ElementPath(self.startContainer);
  _$jscoverage['/editor/range.js'].lineData[1403]++;
  var walkerRange = self.clone();
  _$jscoverage['/editor/range.js'].lineData[1404]++;
  walkerRange.collapse(TRUE);
  _$jscoverage['/editor/range.js'].lineData[1405]++;
  walkerRange.setStartAt(visit581_1405_1(path.block || path.blockLimit), KER.POSITION_AFTER_START);
  _$jscoverage['/editor/range.js'].lineData[1407]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1408]++;
  walker.evaluator = getCheckStartEndBlockEvalFunction(TRUE);
  _$jscoverage['/editor/range.js'].lineData[1410]++;
  return walker.checkBackward();
}, 
  checkEndOfBlock: function() {
  _$jscoverage['/editor/range.js'].functionData[44]++;
  _$jscoverage['/editor/range.js'].lineData[1418]++;
  var self = this, endContainer = self.endContainer, endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[1423]++;
  if (visit582_1423_1(endContainer[0].nodeType == Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1424]++;
    var textAfter = S.trim(endContainer[0].nodeValue.substring(endOffset));
    _$jscoverage['/editor/range.js'].lineData[1425]++;
    if (visit583_1425_1(textAfter.length)) {
      _$jscoverage['/editor/range.js'].lineData[1426]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1433]++;
  self.trim();
  _$jscoverage['/editor/range.js'].lineData[1437]++;
  var path = new ElementPath(self.endContainer);
  _$jscoverage['/editor/range.js'].lineData[1440]++;
  var walkerRange = self.clone();
  _$jscoverage['/editor/range.js'].lineData[1441]++;
  walkerRange.collapse(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1442]++;
  walkerRange.setEndAt(visit584_1442_1(path.block || path.blockLimit), KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1444]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1445]++;
  walker.evaluator = getCheckStartEndBlockEvalFunction(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1447]++;
  return walker.checkForward();
}, 
  checkBoundaryOfElement: function(element, checkType) {
  _$jscoverage['/editor/range.js'].functionData[45]++;
  _$jscoverage['/editor/range.js'].lineData[1456]++;
  var walkerRange = this.clone();
  _$jscoverage['/editor/range.js'].lineData[1460]++;
  walkerRange[visit585_1458_1(checkType == KER.START) ? 'setStartAt' : 'setEndAt'](element, visit586_1460_1(checkType == KER.START) ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1464]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1466]++;
  walker.evaluator = elementBoundaryEval;
  _$jscoverage['/editor/range.js'].lineData[1467]++;
  return walker[visit587_1467_1(checkType == KER.START) ? 'checkBackward' : 'checkForward']();
}, 
  getBoundaryNodes: function() {
  _$jscoverage['/editor/range.js'].functionData[46]++;
  _$jscoverage['/editor/range.js'].lineData[1476]++;
  var self = this, startNode = self.startContainer, endNode = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, childCount;
  _$jscoverage['/editor/range.js'].lineData[1483]++;
  if (visit588_1483_1(startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1484]++;
    childCount = startNode[0].childNodes.length;
    _$jscoverage['/editor/range.js'].lineData[1485]++;
    if (visit589_1485_1(childCount > startOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1486]++;
      startNode = $(startNode[0].childNodes[startOffset]);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1487]++;
      if (visit590_1487_1(childCount == 0)) {
        _$jscoverage['/editor/range.js'].lineData[1489]++;
        startNode = startNode._4e_previousSourceNode();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1493]++;
        startNode = startNode[0];
        _$jscoverage['/editor/range.js'].lineData[1494]++;
        while (startNode.lastChild) {
          _$jscoverage['/editor/range.js'].lineData[1495]++;
          startNode = startNode.lastChild;
        }
        _$jscoverage['/editor/range.js'].lineData[1498]++;
        startNode = $(startNode);
        _$jscoverage['/editor/range.js'].lineData[1503]++;
        startNode = visit591_1503_1(startNode._4e_nextSourceNode() || startNode);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1507]++;
  if (visit592_1507_1(endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1508]++;
    childCount = endNode[0].childNodes.length;
    _$jscoverage['/editor/range.js'].lineData[1509]++;
    if (visit593_1509_1(childCount > endOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1510]++;
      endNode = $(endNode[0].childNodes[endOffset])._4e_previousSourceNode(TRUE);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1513]++;
      if (visit594_1513_1(childCount == 0)) {
        _$jscoverage['/editor/range.js'].lineData[1514]++;
        endNode = endNode._4e_previousSourceNode();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1518]++;
        endNode = endNode[0];
        _$jscoverage['/editor/range.js'].lineData[1519]++;
        while (endNode.lastChild) {
          _$jscoverage['/editor/range.js'].lineData[1520]++;
          endNode = endNode.lastChild;
        }
        _$jscoverage['/editor/range.js'].lineData[1521]++;
        endNode = $(endNode);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1527]++;
  if (visit595_1527_1(startNode._4e_position(endNode) & KEP.POSITION_FOLLOWING)) {
    _$jscoverage['/editor/range.js'].lineData[1528]++;
    startNode = endNode;
  }
  _$jscoverage['/editor/range.js'].lineData[1531]++;
  return {
  startNode: startNode, 
  endNode: endNode};
}, 
  fixBlock: function(isStart, blockTag) {
  _$jscoverage['/editor/range.js'].functionData[47]++;
  _$jscoverage['/editor/range.js'].lineData[1542]++;
  var self = this, bookmark = self.createBookmark(), fixedBlock = $(self.document.createElement(blockTag));
  _$jscoverage['/editor/range.js'].lineData[1545]++;
  self.collapse(isStart);
  _$jscoverage['/editor/range.js'].lineData[1546]++;
  self.enlarge(KER.ENLARGE_BLOCK_CONTENTS);
  _$jscoverage['/editor/range.js'].lineData[1547]++;
  fixedBlock[0].appendChild(self.extractContents());
  _$jscoverage['/editor/range.js'].lineData[1548]++;
  fixedBlock._4e_trim();
  _$jscoverage['/editor/range.js'].lineData[1549]++;
  if (visit596_1549_1(!UA['ie'])) {
    _$jscoverage['/editor/range.js'].lineData[1550]++;
    fixedBlock._4e_appendBogus();
  }
  _$jscoverage['/editor/range.js'].lineData[1552]++;
  self.insertNode(fixedBlock);
  _$jscoverage['/editor/range.js'].lineData[1553]++;
  self.moveToBookmark(bookmark);
  _$jscoverage['/editor/range.js'].lineData[1554]++;
  return fixedBlock;
}, 
  splitBlock: function(blockTag) {
  _$jscoverage['/editor/range.js'].functionData[48]++;
  _$jscoverage['/editor/range.js'].lineData[1563]++;
  var self = this, startPath = new ElementPath(self.startContainer), endPath = new ElementPath(self.endContainer), startBlockLimit = startPath.blockLimit, endBlockLimit = endPath.blockLimit, startBlock = startPath.block, endBlock = endPath.block, elementPath = NULL;
  _$jscoverage['/editor/range.js'].lineData[1573]++;
  if (visit597_1573_1(!startBlockLimit.equals(endBlockLimit))) {
    _$jscoverage['/editor/range.js'].lineData[1574]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[1578]++;
  if (visit598_1578_1(blockTag != 'br')) {
    _$jscoverage['/editor/range.js'].lineData[1579]++;
    if (visit599_1579_1(!startBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1580]++;
      startBlock = self.fixBlock(TRUE, blockTag);
      _$jscoverage['/editor/range.js'].lineData[1581]++;
      endBlock = new ElementPath(self.endContainer).block;
    }
    _$jscoverage['/editor/range.js'].lineData[1584]++;
    if (visit600_1584_1(!endBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1585]++;
      endBlock = self.fixBlock(FALSE, blockTag);
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1590]++;
  var isStartOfBlock = visit601_1590_1(startBlock && self.checkStartOfBlock()), isEndOfBlock = visit602_1591_1(endBlock && self.checkEndOfBlock());
  _$jscoverage['/editor/range.js'].lineData[1594]++;
  self.deleteContents();
  _$jscoverage['/editor/range.js'].lineData[1596]++;
  if (visit603_1596_1(startBlock && visit604_1596_2(startBlock[0] == endBlock[0]))) {
    _$jscoverage['/editor/range.js'].lineData[1597]++;
    if (visit605_1597_1(isEndOfBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1598]++;
      elementPath = new ElementPath(self.startContainer);
      _$jscoverage['/editor/range.js'].lineData[1599]++;
      self.moveToPosition(endBlock, KER.POSITION_AFTER_END);
      _$jscoverage['/editor/range.js'].lineData[1600]++;
      endBlock = NULL;
    } else {
      _$jscoverage['/editor/range.js'].lineData[1602]++;
      if (visit606_1602_1(isStartOfBlock)) {
        _$jscoverage['/editor/range.js'].lineData[1603]++;
        elementPath = new ElementPath(self.startContainer);
        _$jscoverage['/editor/range.js'].lineData[1604]++;
        self.moveToPosition(startBlock, KER.POSITION_BEFORE_START);
        _$jscoverage['/editor/range.js'].lineData[1605]++;
        startBlock = NULL;
      } else {
        _$jscoverage['/editor/range.js'].lineData[1608]++;
        endBlock = self.splitElement(startBlock);
        _$jscoverage['/editor/range.js'].lineData[1612]++;
        if (visit607_1612_1(!UA['ie'] && !S.inArray(startBlock.nodeName(), ['ul', 'ol']))) {
          _$jscoverage['/editor/range.js'].lineData[1613]++;
          startBlock._4e_appendBogus();
        }
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1618]++;
  return {
  previousBlock: startBlock, 
  nextBlock: endBlock, 
  wasStartOfBlock: isStartOfBlock, 
  wasEndOfBlock: isEndOfBlock, 
  elementPath: elementPath};
}, 
  splitElement: function(toSplit) {
  _$jscoverage['/editor/range.js'].functionData[49]++;
  _$jscoverage['/editor/range.js'].lineData[1633]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1634]++;
  if (visit608_1634_1(!self.collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[1635]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[1639]++;
  self.setEndAt(toSplit, KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1640]++;
  var documentFragment = self.extractContents(), clone = toSplit.clone(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1645]++;
  clone[0].appendChild(documentFragment);
  _$jscoverage['/editor/range.js'].lineData[1647]++;
  clone.insertAfter(toSplit);
  _$jscoverage['/editor/range.js'].lineData[1648]++;
  self.moveToPosition(toSplit, KER.POSITION_AFTER_END);
  _$jscoverage['/editor/range.js'].lineData[1649]++;
  return clone;
}, 
  moveToElementEditablePosition: function(el, isMoveToEnd) {
  _$jscoverage['/editor/range.js'].functionData[50]++;
  _$jscoverage['/editor/range.js'].lineData[1661]++;
  function nextDFS(node, childOnly) {
    _$jscoverage['/editor/range.js'].functionData[51]++;
    _$jscoverage['/editor/range.js'].lineData[1662]++;
    var next;
    _$jscoverage['/editor/range.js'].lineData[1664]++;
    if (visit609_1664_1(visit610_1664_2(node[0].nodeType == Dom.NodeType.ELEMENT_NODE) && node._4e_isEditable())) {
      _$jscoverage['/editor/range.js'].lineData[1666]++;
      next = node[isMoveToEnd ? 'last' : 'first'](nonWhitespaceOrIsBookmark, 1);
    }
    _$jscoverage['/editor/range.js'].lineData[1669]++;
    if (visit611_1669_1(!childOnly && !next)) {
      _$jscoverage['/editor/range.js'].lineData[1670]++;
      next = node[isMoveToEnd ? 'prev' : 'next'](nonWhitespaceOrIsBookmark, 1);
    }
    _$jscoverage['/editor/range.js'].lineData[1673]++;
    return next;
  }
  _$jscoverage['/editor/range.js'].lineData[1676]++;
  var found = 0, self = this;
  _$jscoverage['/editor/range.js'].lineData[1678]++;
  while (el) {
    _$jscoverage['/editor/range.js'].lineData[1680]++;
    if (visit612_1680_1(el[0].nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[1681]++;
      self.moveToPosition(el, isMoveToEnd ? KER.POSITION_AFTER_END : KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/range.js'].lineData[1684]++;
      found = 1;
      _$jscoverage['/editor/range.js'].lineData[1685]++;
      break;
    }
    _$jscoverage['/editor/range.js'].lineData[1689]++;
    if (visit613_1689_1(visit614_1689_2(el[0].nodeType == Dom.NodeType.ELEMENT_NODE) && el._4e_isEditable())) {
      _$jscoverage['/editor/range.js'].lineData[1690]++;
      self.moveToPosition(el, isMoveToEnd ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_START);
      _$jscoverage['/editor/range.js'].lineData[1693]++;
      found = 1;
    }
    _$jscoverage['/editor/range.js'].lineData[1696]++;
    el = nextDFS(el, found);
  }
  _$jscoverage['/editor/range.js'].lineData[1699]++;
  return !!found;
}, 
  selectNodeContents: function(node) {
  _$jscoverage['/editor/range.js'].functionData[52]++;
  _$jscoverage['/editor/range.js'].lineData[1707]++;
  var self = this, domNode = node[0];
  _$jscoverage['/editor/range.js'].lineData[1708]++;
  self.setStart(node, 0);
  _$jscoverage['/editor/range.js'].lineData[1709]++;
  self.setEnd(node, visit615_1709_1(domNode.nodeType == Dom.NodeType.TEXT_NODE) ? domNode.nodeValue.length : domNode.childNodes.length);
}, 
  insertNodeByDtd: function(element) {
  _$jscoverage['/editor/range.js'].functionData[53]++;
  _$jscoverage['/editor/range.js'].lineData[1719]++;
  var current, self = this, tmpDtd, last, elementName = element['nodeName'](), isBlock = dtd['$block'][elementName];
  _$jscoverage['/editor/range.js'].lineData[1725]++;
  self.deleteContents();
  _$jscoverage['/editor/range.js'].lineData[1726]++;
  if (visit616_1726_1(isBlock)) {
    _$jscoverage['/editor/range.js'].lineData[1727]++;
    current = self.getCommonAncestor(FALSE, TRUE);
    _$jscoverage['/editor/range.js'].lineData[1728]++;
    while (visit617_1728_1((tmpDtd = dtd[current.nodeName()]) && !(visit618_1728_2(tmpDtd && tmpDtd[elementName])))) {
      _$jscoverage['/editor/range.js'].lineData[1729]++;
      var parent = current.parent();
      _$jscoverage['/editor/range.js'].lineData[1732]++;
      if (visit619_1732_1(self.checkStartOfBlock() && self.checkEndOfBlock())) {
        _$jscoverage['/editor/range.js'].lineData[1733]++;
        self.setStartBefore(current);
        _$jscoverage['/editor/range.js'].lineData[1734]++;
        self.collapse(TRUE);
        _$jscoverage['/editor/range.js'].lineData[1735]++;
        current.remove();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1737]++;
        last = current;
      }
      _$jscoverage['/editor/range.js'].lineData[1739]++;
      current = parent;
    }
    _$jscoverage['/editor/range.js'].lineData[1742]++;
    if (visit620_1742_1(last)) {
      _$jscoverage['/editor/range.js'].lineData[1743]++;
      self.splitElement(last);
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1747]++;
  self.insertNode(element);
}});
  _$jscoverage['/editor/range.js'].lineData[1751]++;
  Utils.injectDom({
  _4e_breakParent: function(el, parent) {
  _$jscoverage['/editor/range.js'].functionData[54]++;
  _$jscoverage['/editor/range.js'].lineData[1753]++;
  parent = $(parent);
  _$jscoverage['/editor/range.js'].lineData[1754]++;
  el = $(el);
  _$jscoverage['/editor/range.js'].lineData[1756]++;
  var KERange = Editor.Range, docFrag, range = new KERange(el[0].ownerDocument);
  _$jscoverage['/editor/range.js'].lineData[1762]++;
  range.setStartAfter(el);
  _$jscoverage['/editor/range.js'].lineData[1763]++;
  range.setEndAfter(parent);
  _$jscoverage['/editor/range.js'].lineData[1766]++;
  docFrag = range.extractContents();
  _$jscoverage['/editor/range.js'].lineData[1769]++;
  range.insertNode(el.remove());
  _$jscoverage['/editor/range.js'].lineData[1772]++;
  el.after(docFrag);
}});
  _$jscoverage['/editor/range.js'].lineData[1776]++;
  Editor.Range = KERange;
  _$jscoverage['/editor/range.js'].lineData[1778]++;
  return KERange;
}, {
  requires: ['./base', './utils', './walker', './elementPath', './dom', 'node']});
