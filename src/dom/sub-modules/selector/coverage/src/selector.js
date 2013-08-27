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
if (! _$jscoverage['/selector.js']) {
  _$jscoverage['/selector.js'] = {};
  _$jscoverage['/selector.js'].lineData = [];
  _$jscoverage['/selector.js'].lineData[5] = 0;
  _$jscoverage['/selector.js'].lineData[7] = 0;
  _$jscoverage['/selector.js'].lineData[11] = 0;
  _$jscoverage['/selector.js'].lineData[19] = 0;
  _$jscoverage['/selector.js'].lineData[20] = 0;
  _$jscoverage['/selector.js'].lineData[22] = 0;
  _$jscoverage['/selector.js'].lineData[30] = 0;
  _$jscoverage['/selector.js'].lineData[32] = 0;
  _$jscoverage['/selector.js'].lineData[34] = 0;
  _$jscoverage['/selector.js'].lineData[43] = 0;
  _$jscoverage['/selector.js'].lineData[44] = 0;
  _$jscoverage['/selector.js'].lineData[47] = 0;
  _$jscoverage['/selector.js'].lineData[50] = 0;
  _$jscoverage['/selector.js'].lineData[54] = 0;
  _$jscoverage['/selector.js'].lineData[55] = 0;
  _$jscoverage['/selector.js'].lineData[58] = 0;
  _$jscoverage['/selector.js'].lineData[59] = 0;
  _$jscoverage['/selector.js'].lineData[60] = 0;
  _$jscoverage['/selector.js'].lineData[62] = 0;
  _$jscoverage['/selector.js'].lineData[65] = 0;
  _$jscoverage['/selector.js'].lineData[66] = 0;
  _$jscoverage['/selector.js'].lineData[69] = 0;
  _$jscoverage['/selector.js'].lineData[70] = 0;
  _$jscoverage['/selector.js'].lineData[72] = 0;
  _$jscoverage['/selector.js'].lineData[73] = 0;
  _$jscoverage['/selector.js'].lineData[74] = 0;
  _$jscoverage['/selector.js'].lineData[75] = 0;
  _$jscoverage['/selector.js'].lineData[76] = 0;
  _$jscoverage['/selector.js'].lineData[77] = 0;
  _$jscoverage['/selector.js'].lineData[78] = 0;
  _$jscoverage['/selector.js'].lineData[79] = 0;
  _$jscoverage['/selector.js'].lineData[80] = 0;
  _$jscoverage['/selector.js'].lineData[81] = 0;
  _$jscoverage['/selector.js'].lineData[82] = 0;
  _$jscoverage['/selector.js'].lineData[83] = 0;
  _$jscoverage['/selector.js'].lineData[85] = 0;
  _$jscoverage['/selector.js'].lineData[89] = 0;
  _$jscoverage['/selector.js'].lineData[91] = 0;
  _$jscoverage['/selector.js'].lineData[93] = 0;
  _$jscoverage['/selector.js'].lineData[99] = 0;
  _$jscoverage['/selector.js'].lineData[100] = 0;
  _$jscoverage['/selector.js'].lineData[101] = 0;
  _$jscoverage['/selector.js'].lineData[102] = 0;
  _$jscoverage['/selector.js'].lineData[105] = 0;
  _$jscoverage['/selector.js'].lineData[106] = 0;
  _$jscoverage['/selector.js'].lineData[109] = 0;
  _$jscoverage['/selector.js'].lineData[112] = 0;
  _$jscoverage['/selector.js'].lineData[113] = 0;
  _$jscoverage['/selector.js'].lineData[114] = 0;
  _$jscoverage['/selector.js'].lineData[117] = 0;
  _$jscoverage['/selector.js'].lineData[119] = 0;
  _$jscoverage['/selector.js'].lineData[122] = 0;
  _$jscoverage['/selector.js'].lineData[123] = 0;
  _$jscoverage['/selector.js'].lineData[125] = 0;
  _$jscoverage['/selector.js'].lineData[127] = 0;
  _$jscoverage['/selector.js'].lineData[128] = 0;
  _$jscoverage['/selector.js'].lineData[133] = 0;
  _$jscoverage['/selector.js'].lineData[134] = 0;
  _$jscoverage['/selector.js'].lineData[135] = 0;
  _$jscoverage['/selector.js'].lineData[136] = 0;
  _$jscoverage['/selector.js'].lineData[137] = 0;
  _$jscoverage['/selector.js'].lineData[138] = 0;
  _$jscoverage['/selector.js'].lineData[139] = 0;
  _$jscoverage['/selector.js'].lineData[144] = 0;
  _$jscoverage['/selector.js'].lineData[147] = 0;
  _$jscoverage['/selector.js'].lineData[150] = 0;
  _$jscoverage['/selector.js'].lineData[151] = 0;
  _$jscoverage['/selector.js'].lineData[153] = 0;
  _$jscoverage['/selector.js'].lineData[155] = 0;
  _$jscoverage['/selector.js'].lineData[156] = 0;
  _$jscoverage['/selector.js'].lineData[161] = 0;
  _$jscoverage['/selector.js'].lineData[162] = 0;
  _$jscoverage['/selector.js'].lineData[163] = 0;
  _$jscoverage['/selector.js'].lineData[164] = 0;
  _$jscoverage['/selector.js'].lineData[165] = 0;
  _$jscoverage['/selector.js'].lineData[166] = 0;
  _$jscoverage['/selector.js'].lineData[167] = 0;
  _$jscoverage['/selector.js'].lineData[172] = 0;
  _$jscoverage['/selector.js'].lineData[175] = 0;
  _$jscoverage['/selector.js'].lineData[178] = 0;
  _$jscoverage['/selector.js'].lineData[179] = 0;
  _$jscoverage['/selector.js'].lineData[181] = 0;
  _$jscoverage['/selector.js'].lineData[183] = 0;
  _$jscoverage['/selector.js'].lineData[184] = 0;
  _$jscoverage['/selector.js'].lineData[190] = 0;
  _$jscoverage['/selector.js'].lineData[191] = 0;
  _$jscoverage['/selector.js'].lineData[192] = 0;
  _$jscoverage['/selector.js'].lineData[193] = 0;
  _$jscoverage['/selector.js'].lineData[194] = 0;
  _$jscoverage['/selector.js'].lineData[195] = 0;
  _$jscoverage['/selector.js'].lineData[196] = 0;
  _$jscoverage['/selector.js'].lineData[201] = 0;
  _$jscoverage['/selector.js'].lineData[204] = 0;
  _$jscoverage['/selector.js'].lineData[207] = 0;
  _$jscoverage['/selector.js'].lineData[208] = 0;
  _$jscoverage['/selector.js'].lineData[210] = 0;
  _$jscoverage['/selector.js'].lineData[212] = 0;
  _$jscoverage['/selector.js'].lineData[213] = 0;
  _$jscoverage['/selector.js'].lineData[219] = 0;
  _$jscoverage['/selector.js'].lineData[220] = 0;
  _$jscoverage['/selector.js'].lineData[221] = 0;
  _$jscoverage['/selector.js'].lineData[222] = 0;
  _$jscoverage['/selector.js'].lineData[223] = 0;
  _$jscoverage['/selector.js'].lineData[224] = 0;
  _$jscoverage['/selector.js'].lineData[225] = 0;
  _$jscoverage['/selector.js'].lineData[230] = 0;
  _$jscoverage['/selector.js'].lineData[233] = 0;
  _$jscoverage['/selector.js'].lineData[234] = 0;
  _$jscoverage['/selector.js'].lineData[235] = 0;
  _$jscoverage['/selector.js'].lineData[236] = 0;
  _$jscoverage['/selector.js'].lineData[239] = 0;
  _$jscoverage['/selector.js'].lineData[240] = 0;
  _$jscoverage['/selector.js'].lineData[243] = 0;
  _$jscoverage['/selector.js'].lineData[246] = 0;
  _$jscoverage['/selector.js'].lineData[250] = 0;
  _$jscoverage['/selector.js'].lineData[252] = 0;
  _$jscoverage['/selector.js'].lineData[257] = 0;
  _$jscoverage['/selector.js'].lineData[258] = 0;
  _$jscoverage['/selector.js'].lineData[259] = 0;
  _$jscoverage['/selector.js'].lineData[263] = 0;
  _$jscoverage['/selector.js'].lineData[264] = 0;
  _$jscoverage['/selector.js'].lineData[267] = 0;
  _$jscoverage['/selector.js'].lineData[270] = 0;
  _$jscoverage['/selector.js'].lineData[274] = 0;
  _$jscoverage['/selector.js'].lineData[277] = 0;
  _$jscoverage['/selector.js'].lineData[280] = 0;
  _$jscoverage['/selector.js'].lineData[283] = 0;
  _$jscoverage['/selector.js'].lineData[286] = 0;
  _$jscoverage['/selector.js'].lineData[290] = 0;
  _$jscoverage['/selector.js'].lineData[294] = 0;
  _$jscoverage['/selector.js'].lineData[295] = 0;
  _$jscoverage['/selector.js'].lineData[299] = 0;
  _$jscoverage['/selector.js'].lineData[300] = 0;
  _$jscoverage['/selector.js'].lineData[303] = 0;
  _$jscoverage['/selector.js'].lineData[306] = 0;
  _$jscoverage['/selector.js'].lineData[309] = 0;
  _$jscoverage['/selector.js'].lineData[310] = 0;
  _$jscoverage['/selector.js'].lineData[315] = 0;
  _$jscoverage['/selector.js'].lineData[317] = 0;
  _$jscoverage['/selector.js'].lineData[318] = 0;
  _$jscoverage['/selector.js'].lineData[320] = 0;
  _$jscoverage['/selector.js'].lineData[323] = 0;
  _$jscoverage['/selector.js'].lineData[326] = 0;
  _$jscoverage['/selector.js'].lineData[329] = 0;
  _$jscoverage['/selector.js'].lineData[332] = 0;
  _$jscoverage['/selector.js'].lineData[335] = 0;
  _$jscoverage['/selector.js'].lineData[339] = 0;
  _$jscoverage['/selector.js'].lineData[343] = 0;
  _$jscoverage['/selector.js'].lineData[346] = 0;
  _$jscoverage['/selector.js'].lineData[347] = 0;
  _$jscoverage['/selector.js'].lineData[348] = 0;
  _$jscoverage['/selector.js'].lineData[350] = 0;
  _$jscoverage['/selector.js'].lineData[351] = 0;
  _$jscoverage['/selector.js'].lineData[352] = 0;
  _$jscoverage['/selector.js'].lineData[353] = 0;
  _$jscoverage['/selector.js'].lineData[354] = 0;
  _$jscoverage['/selector.js'].lineData[355] = 0;
  _$jscoverage['/selector.js'].lineData[356] = 0;
  _$jscoverage['/selector.js'].lineData[358] = 0;
  _$jscoverage['/selector.js'].lineData[359] = 0;
  _$jscoverage['/selector.js'].lineData[360] = 0;
  _$jscoverage['/selector.js'].lineData[363] = 0;
  _$jscoverage['/selector.js'].lineData[366] = 0;
  _$jscoverage['/selector.js'].lineData[367] = 0;
  _$jscoverage['/selector.js'].lineData[368] = 0;
  _$jscoverage['/selector.js'].lineData[369] = 0;
  _$jscoverage['/selector.js'].lineData[371] = 0;
  _$jscoverage['/selector.js'].lineData[373] = 0;
  _$jscoverage['/selector.js'].lineData[374] = 0;
  _$jscoverage['/selector.js'].lineData[375] = 0;
  _$jscoverage['/selector.js'].lineData[377] = 0;
  _$jscoverage['/selector.js'].lineData[379] = 0;
  _$jscoverage['/selector.js'].lineData[383] = 0;
  _$jscoverage['/selector.js'].lineData[400] = 0;
  _$jscoverage['/selector.js'].lineData[401] = 0;
  _$jscoverage['/selector.js'].lineData[402] = 0;
  _$jscoverage['/selector.js'].lineData[406] = 0;
  _$jscoverage['/selector.js'].lineData[407] = 0;
  _$jscoverage['/selector.js'].lineData[410] = 0;
  _$jscoverage['/selector.js'].lineData[412] = 0;
  _$jscoverage['/selector.js'].lineData[413] = 0;
  _$jscoverage['/selector.js'].lineData[414] = 0;
  _$jscoverage['/selector.js'].lineData[416] = 0;
  _$jscoverage['/selector.js'].lineData[417] = 0;
  _$jscoverage['/selector.js'].lineData[420] = 0;
  _$jscoverage['/selector.js'].lineData[421] = 0;
  _$jscoverage['/selector.js'].lineData[424] = 0;
  _$jscoverage['/selector.js'].lineData[429] = 0;
  _$jscoverage['/selector.js'].lineData[430] = 0;
  _$jscoverage['/selector.js'].lineData[433] = 0;
  _$jscoverage['/selector.js'].lineData[434] = 0;
  _$jscoverage['/selector.js'].lineData[435] = 0;
  _$jscoverage['/selector.js'].lineData[436] = 0;
  _$jscoverage['/selector.js'].lineData[437] = 0;
  _$jscoverage['/selector.js'].lineData[439] = 0;
  _$jscoverage['/selector.js'].lineData[440] = 0;
  _$jscoverage['/selector.js'].lineData[445] = 0;
  _$jscoverage['/selector.js'].lineData[449] = 0;
  _$jscoverage['/selector.js'].lineData[450] = 0;
  _$jscoverage['/selector.js'].lineData[455] = 0;
  _$jscoverage['/selector.js'].lineData[456] = 0;
  _$jscoverage['/selector.js'].lineData[457] = 0;
  _$jscoverage['/selector.js'].lineData[459] = 0;
  _$jscoverage['/selector.js'].lineData[460] = 0;
  _$jscoverage['/selector.js'].lineData[461] = 0;
  _$jscoverage['/selector.js'].lineData[463] = 0;
  _$jscoverage['/selector.js'].lineData[464] = 0;
  _$jscoverage['/selector.js'].lineData[465] = 0;
  _$jscoverage['/selector.js'].lineData[466] = 0;
  _$jscoverage['/selector.js'].lineData[473] = 0;
  _$jscoverage['/selector.js'].lineData[474] = 0;
  _$jscoverage['/selector.js'].lineData[476] = 0;
  _$jscoverage['/selector.js'].lineData[482] = 0;
  _$jscoverage['/selector.js'].lineData[491] = 0;
  _$jscoverage['/selector.js'].lineData[498] = 0;
  _$jscoverage['/selector.js'].lineData[499] = 0;
  _$jscoverage['/selector.js'].lineData[502] = 0;
  _$jscoverage['/selector.js'].lineData[503] = 0;
  _$jscoverage['/selector.js'].lineData[504] = 0;
  _$jscoverage['/selector.js'].lineData[506] = 0;
  _$jscoverage['/selector.js'].lineData[507] = 0;
  _$jscoverage['/selector.js'].lineData[508] = 0;
  _$jscoverage['/selector.js'].lineData[510] = 0;
  _$jscoverage['/selector.js'].lineData[511] = 0;
  _$jscoverage['/selector.js'].lineData[513] = 0;
  _$jscoverage['/selector.js'].lineData[514] = 0;
  _$jscoverage['/selector.js'].lineData[516] = 0;
  _$jscoverage['/selector.js'].lineData[522] = 0;
  _$jscoverage['/selector.js'].lineData[523] = 0;
  _$jscoverage['/selector.js'].lineData[525] = 0;
  _$jscoverage['/selector.js'].lineData[526] = 0;
  _$jscoverage['/selector.js'].lineData[527] = 0;
  _$jscoverage['/selector.js'].lineData[530] = 0;
  _$jscoverage['/selector.js'].lineData[531] = 0;
  _$jscoverage['/selector.js'].lineData[535] = 0;
  _$jscoverage['/selector.js'].lineData[538] = 0;
  _$jscoverage['/selector.js'].lineData[539] = 0;
  _$jscoverage['/selector.js'].lineData[541] = 0;
  _$jscoverage['/selector.js'].lineData[542] = 0;
  _$jscoverage['/selector.js'].lineData[543] = 0;
  _$jscoverage['/selector.js'].lineData[545] = 0;
  _$jscoverage['/selector.js'].lineData[550] = 0;
  _$jscoverage['/selector.js'].lineData[551] = 0;
  _$jscoverage['/selector.js'].lineData[552] = 0;
  _$jscoverage['/selector.js'].lineData[553] = 0;
  _$jscoverage['/selector.js'].lineData[555] = 0;
  _$jscoverage['/selector.js'].lineData[556] = 0;
  _$jscoverage['/selector.js'].lineData[557] = 0;
  _$jscoverage['/selector.js'].lineData[558] = 0;
  _$jscoverage['/selector.js'].lineData[559] = 0;
  _$jscoverage['/selector.js'].lineData[561] = 0;
  _$jscoverage['/selector.js'].lineData[563] = 0;
  _$jscoverage['/selector.js'].lineData[567] = 0;
  _$jscoverage['/selector.js'].lineData[568] = 0;
  _$jscoverage['/selector.js'].lineData[569] = 0;
  _$jscoverage['/selector.js'].lineData[572] = 0;
  _$jscoverage['/selector.js'].lineData[579] = 0;
  _$jscoverage['/selector.js'].lineData[580] = 0;
  _$jscoverage['/selector.js'].lineData[583] = 0;
  _$jscoverage['/selector.js'].lineData[585] = 0;
  _$jscoverage['/selector.js'].lineData[587] = 0;
  _$jscoverage['/selector.js'].lineData[589] = 0;
  _$jscoverage['/selector.js'].lineData[590] = 0;
  _$jscoverage['/selector.js'].lineData[592] = 0;
  _$jscoverage['/selector.js'].lineData[594] = 0;
  _$jscoverage['/selector.js'].lineData[602] = 0;
  _$jscoverage['/selector.js'].lineData[603] = 0;
  _$jscoverage['/selector.js'].lineData[604] = 0;
  _$jscoverage['/selector.js'].lineData[605] = 0;
  _$jscoverage['/selector.js'].lineData[606] = 0;
  _$jscoverage['/selector.js'].lineData[607] = 0;
  _$jscoverage['/selector.js'].lineData[608] = 0;
  _$jscoverage['/selector.js'].lineData[609] = 0;
  _$jscoverage['/selector.js'].lineData[610] = 0;
  _$jscoverage['/selector.js'].lineData[615] = 0;
  _$jscoverage['/selector.js'].lineData[617] = 0;
  _$jscoverage['/selector.js'].lineData[626] = 0;
  _$jscoverage['/selector.js'].lineData[627] = 0;
  _$jscoverage['/selector.js'].lineData[630] = 0;
  _$jscoverage['/selector.js'].lineData[631] = 0;
  _$jscoverage['/selector.js'].lineData[632] = 0;
  _$jscoverage['/selector.js'].lineData[633] = 0;
  _$jscoverage['/selector.js'].lineData[634] = 0;
  _$jscoverage['/selector.js'].lineData[637] = 0;
  _$jscoverage['/selector.js'].lineData[638] = 0;
  _$jscoverage['/selector.js'].lineData[641] = 0;
  _$jscoverage['/selector.js'].lineData[642] = 0;
  _$jscoverage['/selector.js'].lineData[644] = 0;
  _$jscoverage['/selector.js'].lineData[647] = 0;
  _$jscoverage['/selector.js'].lineData[651] = 0;
  _$jscoverage['/selector.js'].lineData[652] = 0;
  _$jscoverage['/selector.js'].lineData[654] = 0;
  _$jscoverage['/selector.js'].lineData[655] = 0;
  _$jscoverage['/selector.js'].lineData[658] = 0;
  _$jscoverage['/selector.js'].lineData[659] = 0;
  _$jscoverage['/selector.js'].lineData[660] = 0;
  _$jscoverage['/selector.js'].lineData[661] = 0;
  _$jscoverage['/selector.js'].lineData[662] = 0;
  _$jscoverage['/selector.js'].lineData[663] = 0;
  _$jscoverage['/selector.js'].lineData[664] = 0;
  _$jscoverage['/selector.js'].lineData[665] = 0;
  _$jscoverage['/selector.js'].lineData[671] = 0;
  _$jscoverage['/selector.js'].lineData[672] = 0;
  _$jscoverage['/selector.js'].lineData[675] = 0;
  _$jscoverage['/selector.js'].lineData[678] = 0;
  _$jscoverage['/selector.js'].lineData[680] = 0;
  _$jscoverage['/selector.js'].lineData[682] = 0;
}
if (! _$jscoverage['/selector.js'].functionData) {
  _$jscoverage['/selector.js'].functionData = [];
  _$jscoverage['/selector.js'].functionData[0] = 0;
  _$jscoverage['/selector.js'].functionData[1] = 0;
  _$jscoverage['/selector.js'].functionData[2] = 0;
  _$jscoverage['/selector.js'].functionData[3] = 0;
  _$jscoverage['/selector.js'].functionData[4] = 0;
  _$jscoverage['/selector.js'].functionData[5] = 0;
  _$jscoverage['/selector.js'].functionData[6] = 0;
  _$jscoverage['/selector.js'].functionData[7] = 0;
  _$jscoverage['/selector.js'].functionData[8] = 0;
  _$jscoverage['/selector.js'].functionData[9] = 0;
  _$jscoverage['/selector.js'].functionData[10] = 0;
  _$jscoverage['/selector.js'].functionData[11] = 0;
  _$jscoverage['/selector.js'].functionData[12] = 0;
  _$jscoverage['/selector.js'].functionData[13] = 0;
  _$jscoverage['/selector.js'].functionData[14] = 0;
  _$jscoverage['/selector.js'].functionData[15] = 0;
  _$jscoverage['/selector.js'].functionData[16] = 0;
  _$jscoverage['/selector.js'].functionData[17] = 0;
  _$jscoverage['/selector.js'].functionData[18] = 0;
  _$jscoverage['/selector.js'].functionData[19] = 0;
  _$jscoverage['/selector.js'].functionData[20] = 0;
  _$jscoverage['/selector.js'].functionData[21] = 0;
  _$jscoverage['/selector.js'].functionData[22] = 0;
  _$jscoverage['/selector.js'].functionData[23] = 0;
  _$jscoverage['/selector.js'].functionData[24] = 0;
  _$jscoverage['/selector.js'].functionData[25] = 0;
  _$jscoverage['/selector.js'].functionData[26] = 0;
  _$jscoverage['/selector.js'].functionData[27] = 0;
  _$jscoverage['/selector.js'].functionData[28] = 0;
  _$jscoverage['/selector.js'].functionData[29] = 0;
  _$jscoverage['/selector.js'].functionData[30] = 0;
  _$jscoverage['/selector.js'].functionData[31] = 0;
  _$jscoverage['/selector.js'].functionData[32] = 0;
  _$jscoverage['/selector.js'].functionData[33] = 0;
  _$jscoverage['/selector.js'].functionData[34] = 0;
  _$jscoverage['/selector.js'].functionData[35] = 0;
  _$jscoverage['/selector.js'].functionData[36] = 0;
  _$jscoverage['/selector.js'].functionData[37] = 0;
  _$jscoverage['/selector.js'].functionData[38] = 0;
  _$jscoverage['/selector.js'].functionData[39] = 0;
  _$jscoverage['/selector.js'].functionData[40] = 0;
  _$jscoverage['/selector.js'].functionData[41] = 0;
  _$jscoverage['/selector.js'].functionData[42] = 0;
  _$jscoverage['/selector.js'].functionData[43] = 0;
  _$jscoverage['/selector.js'].functionData[44] = 0;
  _$jscoverage['/selector.js'].functionData[45] = 0;
  _$jscoverage['/selector.js'].functionData[46] = 0;
  _$jscoverage['/selector.js'].functionData[47] = 0;
}
if (! _$jscoverage['/selector.js'].branchData) {
  _$jscoverage['/selector.js'].branchData = {};
  _$jscoverage['/selector.js'].branchData['19'] = [];
  _$jscoverage['/selector.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['37'] = [];
  _$jscoverage['/selector.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['61'] = [];
  _$jscoverage['/selector.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['61'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['69'] = [];
  _$jscoverage['/selector.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['72'] = [];
  _$jscoverage['/selector.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['75'] = [];
  _$jscoverage['/selector.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['78'] = [];
  _$jscoverage['/selector.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['79'] = [];
  _$jscoverage['/selector.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['81'] = [];
  _$jscoverage['/selector.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['82'] = [];
  _$jscoverage['/selector.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['91'] = [];
  _$jscoverage['/selector.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['100'] = [];
  _$jscoverage['/selector.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['101'] = [];
  _$jscoverage['/selector.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['105'] = [];
  _$jscoverage['/selector.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['105'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['105'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['105'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['113'] = [];
  _$jscoverage['/selector.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['113'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['114'] = [];
  _$jscoverage['/selector.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['122'] = [];
  _$jscoverage['/selector.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['122'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['122'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['127'] = [];
  _$jscoverage['/selector.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['133'] = [];
  _$jscoverage['/selector.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['135'] = [];
  _$jscoverage['/selector.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['137'] = [];
  _$jscoverage['/selector.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['138'] = [];
  _$jscoverage['/selector.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['150'] = [];
  _$jscoverage['/selector.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['150'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['150'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['155'] = [];
  _$jscoverage['/selector.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['161'] = [];
  _$jscoverage['/selector.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['163'] = [];
  _$jscoverage['/selector.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['165'] = [];
  _$jscoverage['/selector.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['166'] = [];
  _$jscoverage['/selector.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['178'] = [];
  _$jscoverage['/selector.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['178'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['178'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['183'] = [];
  _$jscoverage['/selector.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['190'] = [];
  _$jscoverage['/selector.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['192'] = [];
  _$jscoverage['/selector.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['194'] = [];
  _$jscoverage['/selector.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['195'] = [];
  _$jscoverage['/selector.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['207'] = [];
  _$jscoverage['/selector.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['207'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['207'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['212'] = [];
  _$jscoverage['/selector.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['219'] = [];
  _$jscoverage['/selector.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['221'] = [];
  _$jscoverage['/selector.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['223'] = [];
  _$jscoverage['/selector.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['224'] = [];
  _$jscoverage['/selector.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['236'] = [];
  _$jscoverage['/selector.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['237'] = [];
  _$jscoverage['/selector.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['240'] = [];
  _$jscoverage['/selector.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['240'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['240'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['242'] = [];
  _$jscoverage['/selector.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['242'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['257'] = [];
  _$jscoverage['/selector.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['263'] = [];
  _$jscoverage['/selector.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['263'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['263'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['263'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['263'][5] = new BranchData();
  _$jscoverage['/selector.js'].branchData['263'][6] = new BranchData();
  _$jscoverage['/selector.js'].branchData['263'][7] = new BranchData();
  _$jscoverage['/selector.js'].branchData['270'] = [];
  _$jscoverage['/selector.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['271'] = [];
  _$jscoverage['/selector.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['286'] = [];
  _$jscoverage['/selector.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['290'] = [];
  _$jscoverage['/selector.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['295'] = [];
  _$jscoverage['/selector.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['295'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['295'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['296'] = [];
  _$jscoverage['/selector.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['296'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['296'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['296'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['296'][5] = new BranchData();
  _$jscoverage['/selector.js'].branchData['300'] = [];
  _$jscoverage['/selector.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['300'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['310'] = [];
  _$jscoverage['/selector.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['310'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['310'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['311'] = [];
  _$jscoverage['/selector.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['311'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['317'] = [];
  _$jscoverage['/selector.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['317'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['320'] = [];
  _$jscoverage['/selector.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['323'] = [];
  _$jscoverage['/selector.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['326'] = [];
  _$jscoverage['/selector.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['329'] = [];
  _$jscoverage['/selector.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['332'] = [];
  _$jscoverage['/selector.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['332'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['335'] = [];
  _$jscoverage['/selector.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['343'] = [];
  _$jscoverage['/selector.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['347'] = [];
  _$jscoverage['/selector.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['352'] = [];
  _$jscoverage['/selector.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['352'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['354'] = [];
  _$jscoverage['/selector.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['355'] = [];
  _$jscoverage['/selector.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['359'] = [];
  _$jscoverage['/selector.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['367'] = [];
  _$jscoverage['/selector.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['368'] = [];
  _$jscoverage['/selector.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['373'] = [];
  _$jscoverage['/selector.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['374'] = [];
  _$jscoverage['/selector.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['400'] = [];
  _$jscoverage['/selector.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['413'] = [];
  _$jscoverage['/selector.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['416'] = [];
  _$jscoverage['/selector.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['420'] = [];
  _$jscoverage['/selector.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['429'] = [];
  _$jscoverage['/selector.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['433'] = [];
  _$jscoverage['/selector.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['436'] = [];
  _$jscoverage['/selector.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['436'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['439'] = [];
  _$jscoverage['/selector.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['457'] = [];
  _$jscoverage['/selector.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['459'] = [];
  _$jscoverage['/selector.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['460'] = [];
  _$jscoverage['/selector.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['465'] = [];
  _$jscoverage['/selector.js'].branchData['465'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['474'] = [];
  _$jscoverage['/selector.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['483'] = [];
  _$jscoverage['/selector.js'].branchData['483'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['503'] = [];
  _$jscoverage['/selector.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['507'] = [];
  _$jscoverage['/selector.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['512'] = [];
  _$jscoverage['/selector.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['513'] = [];
  _$jscoverage['/selector.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['525'] = [];
  _$jscoverage['/selector.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['526'] = [];
  _$jscoverage['/selector.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['530'] = [];
  _$jscoverage['/selector.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['541'] = [];
  _$jscoverage['/selector.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['542'] = [];
  _$jscoverage['/selector.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['552'] = [];
  _$jscoverage['/selector.js'].branchData['552'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['558'] = [];
  _$jscoverage['/selector.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['568'] = [];
  _$jscoverage['/selector.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['579'] = [];
  _$jscoverage['/selector.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['580'] = [];
  _$jscoverage['/selector.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['583'] = [];
  _$jscoverage['/selector.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['583'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['585'] = [];
  _$jscoverage['/selector.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['589'] = [];
  _$jscoverage['/selector.js'].branchData['589'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['602'] = [];
  _$jscoverage['/selector.js'].branchData['602'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['603'] = [];
  _$jscoverage['/selector.js'].branchData['603'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['606'] = [];
  _$jscoverage['/selector.js'].branchData['606'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['608'] = [];
  _$jscoverage['/selector.js'].branchData['608'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['615'] = [];
  _$jscoverage['/selector.js'].branchData['615'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['626'] = [];
  _$jscoverage['/selector.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['626'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['626'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['626'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['630'] = [];
  _$jscoverage['/selector.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['632'] = [];
  _$jscoverage['/selector.js'].branchData['632'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['637'] = [];
  _$jscoverage['/selector.js'].branchData['637'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['641'] = [];
  _$jscoverage['/selector.js'].branchData['641'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['641'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['641'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['647'] = [];
  _$jscoverage['/selector.js'].branchData['647'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['654'] = [];
  _$jscoverage['/selector.js'].branchData['654'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['658'] = [];
  _$jscoverage['/selector.js'].branchData['658'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['661'] = [];
  _$jscoverage['/selector.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['663'] = [];
  _$jscoverage['/selector.js'].branchData['663'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['664'] = [];
  _$jscoverage['/selector.js'].branchData['664'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['671'] = [];
  _$jscoverage['/selector.js'].branchData['671'][1] = new BranchData();
}
_$jscoverage['/selector.js'].branchData['671'][1].init(3789, 12, 'groupLen > 1');
function visit198_671_1(result) {
  _$jscoverage['/selector.js'].branchData['671'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['664'][1].init(26, 39, 'matchSub(matchHead.el, matchHead.match)');
function visit197_664_1(result) {
  _$jscoverage['/selector.js'].branchData['664'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['663'][1].init(229, 9, 'matchHead');
function visit196_663_1(result) {
  _$jscoverage['/selector.js'].branchData['663'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['661'][1].init(141, 18, 'matchHead === true');
function visit195_661_1(result) {
  _$jscoverage['/selector.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['658'][1].init(2734, 21, 'seedsIndex < seedsLen');
function visit194_658_1(result) {
  _$jscoverage['/selector.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['654'][1].init(2657, 9, '!seedsLen');
function visit193_654_1(result) {
  _$jscoverage['/selector.js'].branchData['654'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['647'][1].init(58, 18, 'group.value || \'*\'');
function visit192_647_1(result) {
  _$jscoverage['/selector.js'].branchData['647'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['641'][3].init(53, 27, 'context !== contextDocument');
function visit191_641_3(result) {
  _$jscoverage['/selector.js'].branchData['641'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['641'][2].init(46, 34, 'tmp && context !== contextDocument');
function visit190_641_2(result) {
  _$jscoverage['/selector.js'].branchData['641'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['641'][1].init(30, 50, 'contextInDom && tmp && context !== contextDocument');
function visit189_641_1(result) {
  _$jscoverage['/selector.js'].branchData['641'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['637'][1].init(510, 15, 'tmpI === tmpLen');
function visit188_637_1(result) {
  _$jscoverage['/selector.js'].branchData['637'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['632'][1].init(81, 24, 'getAttr(tmp, \'id\') == id');
function visit187_632_1(result) {
  _$jscoverage['/selector.js'].branchData['632'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['630'][1].init(200, 13, 'tmpI < tmpLen');
function visit186_630_1(result) {
  _$jscoverage['/selector.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['626'][4].init(667, 24, 'getAttr(tmp, \'id\') != id');
function visit185_626_4(result) {
  _$jscoverage['/selector.js'].branchData['626'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['626'][3].init(660, 31, 'tmp && getAttr(tmp, \'id\') != id');
function visit184_626_3(result) {
  _$jscoverage['/selector.js'].branchData['626'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['626'][2].init(634, 22, '!tmp && doesNotHasById');
function visit183_626_2(result) {
  _$jscoverage['/selector.js'].branchData['626'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['626'][1].init(634, 57, '!tmp && doesNotHasById || tmp && getAttr(tmp, \'id\') != id');
function visit182_626_1(result) {
  _$jscoverage['/selector.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['615'][1].init(507, 2, 'id');
function visit181_615_1(result) {
  _$jscoverage['/selector.js'].branchData['615'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['608'][1].init(95, 22, 'singleSuffix.t == \'id\'');
function visit180_608_1(result) {
  _$jscoverage['/selector.js'].branchData['608'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['606'][1].init(115, 23, 'suffixIndex < suffixLen');
function visit179_606_1(result) {
  _$jscoverage['/selector.js'].branchData['606'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['603'][1].init(22, 23, 'suffix && !isContextXML');
function visit178_603_1(result) {
  _$jscoverage['/selector.js'].branchData['603'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['602'][1].init(311, 8, '!mySeeds');
function visit177_602_1(result) {
  _$jscoverage['/selector.js'].branchData['602'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['589'][1].init(546, 21, 'groupIndex < groupLen');
function visit176_589_1(result) {
  _$jscoverage['/selector.js'].branchData['589'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['585'][1].init(458, 26, 'context || contextDocument');
function visit175_585_1(result) {
  _$jscoverage['/selector.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['583'][2].init(391, 32, 'context && context.ownerDocument');
function visit174_583_2(result) {
  _$jscoverage['/selector.js'].branchData['583'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['583'][1].init(391, 44, 'context && context.ownerDocument || document');
function visit173_583_1(result) {
  _$jscoverage['/selector.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['580'][1].init(24, 33, 'context || seeds[0].ownerDocument');
function visit172_580_1(result) {
  _$jscoverage['/selector.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['579'][1].init(284, 5, 'seeds');
function visit171_579_1(result) {
  _$jscoverage['/selector.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['568'][1].init(14, 12, '!caches[str]');
function visit170_568_1(result) {
  _$jscoverage['/selector.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['558'][1].init(22, 19, 'matchSub(el, match)');
function visit169_558_1(result) {
  _$jscoverage['/selector.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['552'][1].init(74, 26, 'matchImmediateRet === true');
function visit168_552_1(result) {
  _$jscoverage['/selector.js'].branchData['552'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['542'][1].init(133, 27, 'matchKey in subMatchesCache');
function visit167_542_1(result) {
  _$jscoverage['/selector.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['541'][1].init(101, 16, 'match.order || 0');
function visit166_541_1(result) {
  _$jscoverage['/selector.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['530'][1].init(18, 40, '!(selectorId = el[EXPANDO_SELECTOR_KEY])');
function visit165_530_1(result) {
  _$jscoverage['/selector.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['526'][1].init(18, 53, '!(selectorId = el.getAttribute(EXPANDO_SELECTOR_KEY))');
function visit164_526_1(result) {
  _$jscoverage['/selector.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['525'][1].init(41, 12, 'isContextXML');
function visit163_525_1(result) {
  _$jscoverage['/selector.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['513'][1].init(416, 3, '!el');
function visit162_513_1(result) {
  _$jscoverage['/selector.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['512'][1].init(311, 26, 'el && relativeOp.immediate');
function visit161_512_1(result) {
  _$jscoverage['/selector.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['507'][1].init(134, 4, '!cur');
function visit160_507_1(result) {
  _$jscoverage['/selector.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['503'][1].init(18, 21, '!singleMatch(el, cur)');
function visit159_503_1(result) {
  _$jscoverage['/selector.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['483'][1].init(30, 29, 'el && dir(el, relativeOp.dir)');
function visit158_483_1(result) {
  _$jscoverage['/selector.js'].branchData['483'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['474'][1].init(88, 20, 'relativeOp.immediate');
function visit157_474_1(result) {
  _$jscoverage['/selector.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['465'][1].init(293, 21, '!relativeOp.immediate');
function visit156_465_1(result) {
  _$jscoverage['/selector.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['460'][1].init(96, 6, '!match');
function visit155_460_1(result) {
  _$jscoverage['/selector.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['459'][1].init(54, 19, 'match && match.prev');
function visit154_459_1(result) {
  _$jscoverage['/selector.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['457'][1].init(66, 7, 'matched');
function visit153_457_1(result) {
  _$jscoverage['/selector.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['439'][1].init(160, 32, 'matchExpr[singleMatchSuffixType]');
function visit152_439_1(result) {
  _$jscoverage['/selector.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['436'][2].init(117, 33, 'matchSuffixIndex < matchSuffixLen');
function visit151_436_2(result) {
  _$jscoverage['/selector.js'].branchData['436'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['436'][1].init(106, 44, 'matched && matchSuffixIndex < matchSuffixLen');
function visit150_436_1(result) {
  _$jscoverage['/selector.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['433'][1].init(442, 22, 'matched && matchSuffix');
function visit149_433_1(result) {
  _$jscoverage['/selector.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['429'][1].init(337, 16, 'match.t == \'tag\'');
function visit148_429_1(result) {
  _$jscoverage['/selector.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['420'][1].init(134, 17, 'el.nodeType === 9');
function visit147_420_1(result) {
  _$jscoverage['/selector.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['416'][1].init(74, 3, '!el');
function visit146_416_1(result) {
  _$jscoverage['/selector.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['413'][1].init(14, 6, '!match');
function visit145_413_1(result) {
  _$jscoverage['/selector.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['400'][1].init(12907, 41, '\'sourceIndex\' in document.documentElement');
function visit144_400_1(result) {
  _$jscoverage['/selector.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['374'][1].init(22, 23, '!pseudoIdentExpr[ident]');
function visit143_374_1(result) {
  _$jscoverage['/selector.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['373'][1].init(310, 19, 'ident = value.ident');
function visit142_373_1(result) {
  _$jscoverage['/selector.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['368'][1].init(22, 27, '!(fn = pseudoFnExpr[fnStr])');
function visit141_368_1(result) {
  _$jscoverage['/selector.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['367'][1].init(53, 16, 'fnStr = value.fn');
function visit140_367_1(result) {
  _$jscoverage['/selector.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['359'][1].init(168, 7, 'matchFn');
function visit139_359_1(result) {
  _$jscoverage['/selector.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['355'][1].init(22, 21, 'elValue === undefined');
function visit138_355_1(result) {
  _$jscoverage['/selector.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['354'][1].init(319, 5, 'match');
function visit137_354_1(result) {
  _$jscoverage['/selector.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['352'][2].init(242, 21, 'elValue !== undefined');
function visit136_352_2(result) {
  _$jscoverage['/selector.js'].branchData['352'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['352'][1].init(232, 31, '!match && elValue !== undefined');
function visit135_352_1(result) {
  _$jscoverage['/selector.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['347'][1].init(55, 13, '!isContextXML');
function visit134_347_1(result) {
  _$jscoverage['/selector.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['343'][1].init(21, 27, 'getAttr(el, \'id\') === value');
function visit133_343_1(result) {
  _$jscoverage['/selector.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['335'][1].init(21, 17, 'elValue === value');
function visit132_335_1(result) {
  _$jscoverage['/selector.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['332'][2].init(30, 28, 'elValue.indexOf(value) != -1');
function visit131_332_2(result) {
  _$jscoverage['/selector.js'].branchData['332'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['332'][1].init(21, 37, 'value && elValue.indexOf(value) != -1');
function visit130_332_1(result) {
  _$jscoverage['/selector.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['329'][1].init(21, 35, 'value && S.endsWith(elValue, value)');
function visit129_329_1(result) {
  _$jscoverage['/selector.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['326'][1].init(21, 37, 'value && S.startsWith(elValue, value)');
function visit128_326_1(result) {
  _$jscoverage['/selector.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['323'][1].init(22, 47, '(\' \' + elValue).indexOf(\' \' + value + \'-\') != -1');
function visit127_323_1(result) {
  _$jscoverage['/selector.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['320'][1].init(118, 53, '(\' \' + elValue + \' \').indexOf(\' \' + value + \' \') != -1');
function visit126_320_1(result) {
  _$jscoverage['/selector.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['317'][2].init(28, 23, 'value.indexOf(\' \') > -1');
function visit125_317_2(result) {
  _$jscoverage['/selector.js'].branchData['317'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['317'][1].init(18, 33, '!value || value.indexOf(\' \') > -1');
function visit124_317_1(result) {
  _$jscoverage['/selector.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['311'][2].init(56, 21, 'nodeName === "option"');
function visit123_311_2(result) {
  _$jscoverage['/selector.js'].branchData['311'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['311'][1].init(56, 36, 'nodeName === "option" && el.selected');
function visit122_311_1(result) {
  _$jscoverage['/selector.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['310'][3].init(77, 20, 'nodeName === "input"');
function visit121_310_3(result) {
  _$jscoverage['/selector.js'].branchData['310'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['310'][2].init(77, 34, 'nodeName === "input" && el.checked');
function visit120_310_2(result) {
  _$jscoverage['/selector.js'].branchData['310'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['310'][1].init(77, 94, '(nodeName === "input" && el.checked) || (nodeName === "option" && el.selected)');
function visit119_310_1(result) {
  _$jscoverage['/selector.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['300'][2].init(68, 35, 'hash.slice(1) === getAttr(el, \'id\')');
function visit118_300_2(result) {
  _$jscoverage['/selector.js'].branchData['300'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['300'][1].init(60, 43, 'hash && hash.slice(1) === getAttr(el, \'id\')');
function visit117_300_1(result) {
  _$jscoverage['/selector.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['296'][5].init(185, 16, 'el.tabIndex >= 0');
function visit116_296_5(result) {
  _$jscoverage['/selector.js'].branchData['296'][5].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['296'][4].init(174, 27, 'el.href || el.tabIndex >= 0');
function visit115_296_4(result) {
  _$jscoverage['/selector.js'].branchData['296'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['296'][3].init(163, 38, 'el.type || el.href || el.tabIndex >= 0');
function visit114_296_3(result) {
  _$jscoverage['/selector.js'].branchData['296'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['296'][2].init(118, 37, '!doc[\'hasFocus\'] || doc[\'hasFocus\']()');
function visit113_296_2(result) {
  _$jscoverage['/selector.js'].branchData['296'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['296'][1].init(45, 84, '(!doc[\'hasFocus\'] || doc[\'hasFocus\']()) && !!(el.type || el.href || el.tabIndex >= 0)');
function visit112_296_1(result) {
  _$jscoverage['/selector.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['295'][3].init(69, 24, 'el === doc.activeElement');
function visit111_295_3(result) {
  _$jscoverage['/selector.js'].branchData['295'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['295'][2].init(69, 130, 'el === doc.activeElement && (!doc[\'hasFocus\'] || doc[\'hasFocus\']()) && !!(el.type || el.href || el.tabIndex >= 0)');
function visit110_295_2(result) {
  _$jscoverage['/selector.js'].branchData['295'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['295'][1].init(62, 137, 'doc && el === doc.activeElement && (!doc[\'hasFocus\'] || doc[\'hasFocus\']()) && !!(el.type || el.href || el.tabIndex >= 0)');
function visit109_295_1(result) {
  _$jscoverage['/selector.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['290'][1].init(21, 92, 'pseudoIdentExpr[\'first-of-type\'](el) && pseudoIdentExpr[\'last-of-type\'](el)');
function visit108_290_1(result) {
  _$jscoverage['/selector.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['286'][1].init(21, 88, 'pseudoIdentExpr[\'first-child\'](el) && pseudoIdentExpr[\'last-child\'](el)');
function visit107_286_1(result) {
  _$jscoverage['/selector.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['271'][1].init(36, 39, 'el === el.ownerDocument.documentElement');
function visit106_271_1(result) {
  _$jscoverage['/selector.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['270'][1].init(21, 76, 'el.ownerDocument && el === el.ownerDocument.documentElement');
function visit105_270_1(result) {
  _$jscoverage['/selector.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['263'][7].init(337, 13, 'nodeType == 5');
function visit104_263_7(result) {
  _$jscoverage['/selector.js'].branchData['263'][7].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['263'][6].init(320, 13, 'nodeType == 4');
function visit103_263_6(result) {
  _$jscoverage['/selector.js'].branchData['263'][6].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['263'][5].init(320, 30, 'nodeType == 4 || nodeType == 5');
function visit102_263_5(result) {
  _$jscoverage['/selector.js'].branchData['263'][5].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['263'][4].init(303, 13, 'nodeType == 3');
function visit101_263_4(result) {
  _$jscoverage['/selector.js'].branchData['263'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['263'][3].init(303, 47, 'nodeType == 3 || nodeType == 4 || nodeType == 5');
function visit100_263_3(result) {
  _$jscoverage['/selector.js'].branchData['263'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['263'][2].init(286, 13, 'nodeType == 1');
function visit99_263_2(result) {
  _$jscoverage['/selector.js'].branchData['263'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['263'][1].init(286, 64, 'nodeType == 1 || nodeType == 3 || nodeType == 4 || nodeType == 5');
function visit98_263_1(result) {
  _$jscoverage['/selector.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['257'][1].init(191, 11, 'index < len');
function visit97_257_1(result) {
  _$jscoverage['/selector.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['242'][2].init(450, 17, 'el.nodeType === 1');
function visit96_242_2(result) {
  _$jscoverage['/selector.js'].branchData['242'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['242'][1].init(336, 40, '(el = el.parentNode) && el.nodeType === 1');
function visit95_242_1(result) {
  _$jscoverage['/selector.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['240'][3].init(100, 32, 'elLang.indexOf(lang + "-") === 0');
function visit94_240_3(result) {
  _$jscoverage['/selector.js'].branchData['240'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['240'][2].init(81, 15, 'elLang === lang');
function visit93_240_2(result) {
  _$jscoverage['/selector.js'].branchData['240'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['240'][1].init(81, 51, 'elLang === lang || elLang.indexOf(lang + "-") === 0');
function visit92_240_1(result) {
  _$jscoverage['/selector.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['237'][1].init(35, 54, 'el.getAttribute("xml:lang") || el.getAttribute("lang")');
function visit91_237_1(result) {
  _$jscoverage['/selector.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['236'][1].init(22, 132, 'elLang = (isContextXML ? el.getAttribute("xml:lang") || el.getAttribute("lang") : el.lang)');
function visit90_236_1(result) {
  _$jscoverage['/selector.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['224'][1].init(138, 17, 'ret !== undefined');
function visit89_224_1(result) {
  _$jscoverage['/selector.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['223'][1].init(94, 12, 'child === el');
function visit88_223_1(result) {
  _$jscoverage['/selector.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['221'][1].init(74, 23, 'child.tagName == elType');
function visit87_221_1(result) {
  _$jscoverage['/selector.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['219'][1].init(258, 10, 'count >= 0');
function visit86_219_1(result) {
  _$jscoverage['/selector.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['212'][1].init(256, 6, 'parent');
function visit85_212_1(result) {
  _$jscoverage['/selector.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['207'][3].init(118, 6, 'b == 0');
function visit84_207_3(result) {
  _$jscoverage['/selector.js'].branchData['207'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['207'][2].init(108, 6, 'a == 0');
function visit83_207_2(result) {
  _$jscoverage['/selector.js'].branchData['207'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['207'][1].init(108, 16, 'a == 0 && b == 0');
function visit82_207_1(result) {
  _$jscoverage['/selector.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['195'][1].init(138, 17, 'ret !== undefined');
function visit81_195_1(result) {
  _$jscoverage['/selector.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['194'][1].init(94, 12, 'child === el');
function visit80_194_1(result) {
  _$jscoverage['/selector.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['192'][1].init(74, 23, 'child.tagName == elType');
function visit79_192_1(result) {
  _$jscoverage['/selector.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['190'][1].init(252, 11, 'count < len');
function visit78_190_1(result) {
  _$jscoverage['/selector.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['183'][1].init(256, 6, 'parent');
function visit77_183_1(result) {
  _$jscoverage['/selector.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['178'][3].init(118, 6, 'b == 0');
function visit76_178_3(result) {
  _$jscoverage['/selector.js'].branchData['178'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['178'][2].init(108, 6, 'a == 0');
function visit75_178_2(result) {
  _$jscoverage['/selector.js'].branchData['178'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['178'][1].init(108, 16, 'a == 0 && b == 0');
function visit74_178_1(result) {
  _$jscoverage['/selector.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['166'][1].init(138, 17, 'ret !== undefined');
function visit73_166_1(result) {
  _$jscoverage['/selector.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['165'][1].init(94, 12, 'child === el');
function visit72_165_1(result) {
  _$jscoverage['/selector.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['163'][1].init(74, 19, 'child.nodeType == 1');
function visit71_163_1(result) {
  _$jscoverage['/selector.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['161'][1].init(216, 10, 'count >= 0');
function visit70_161_1(result) {
  _$jscoverage['/selector.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['155'][1].init(256, 6, 'parent');
function visit69_155_1(result) {
  _$jscoverage['/selector.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['150'][3].init(118, 6, 'b == 0');
function visit68_150_3(result) {
  _$jscoverage['/selector.js'].branchData['150'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['150'][2].init(108, 6, 'a == 0');
function visit67_150_2(result) {
  _$jscoverage['/selector.js'].branchData['150'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['150'][1].init(108, 16, 'a == 0 && b == 0');
function visit66_150_1(result) {
  _$jscoverage['/selector.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['138'][1].init(138, 17, 'ret !== undefined');
function visit65_138_1(result) {
  _$jscoverage['/selector.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['137'][1].init(94, 12, 'child === el');
function visit64_137_1(result) {
  _$jscoverage['/selector.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['135'][1].init(74, 19, 'child.nodeType == 1');
function visit63_135_1(result) {
  _$jscoverage['/selector.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['133'][1].init(210, 11, 'count < len');
function visit62_133_1(result) {
  _$jscoverage['/selector.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['127'][1].init(256, 6, 'parent');
function visit61_127_1(result) {
  _$jscoverage['/selector.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['122'][3].init(118, 6, 'b == 0');
function visit60_122_3(result) {
  _$jscoverage['/selector.js'].branchData['122'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['122'][2].init(108, 6, 'a == 0');
function visit59_122_2(result) {
  _$jscoverage['/selector.js'].branchData['122'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['122'][1].init(108, 16, 'a == 0 && b == 0');
function visit58_122_1(result) {
  _$jscoverage['/selector.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['114'][1].init(120, 49, 'documentElement.nodeName.toLowerCase() !== "html"');
function visit57_114_1(result) {
  _$jscoverage['/selector.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['113'][2].init(41, 26, 'elem.ownerDocument || elem');
function visit56_113_2(result) {
  _$jscoverage['/selector.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['113'][1].init(32, 52, 'elem && (elem.ownerDocument || elem).documentElement');
function visit55_113_1(result) {
  _$jscoverage['/selector.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['105'][4].init(43, 19, '(index - b) % a == 0');
function visit54_105_4(result) {
  _$jscoverage['/selector.js'].branchData['105'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['105'][3].init(43, 25, '(index - b) % a == 0 && eq');
function visit53_105_3(result) {
  _$jscoverage['/selector.js'].branchData['105'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['105'][2].init(19, 19, '(index - b) / a >= 0');
function visit52_105_2(result) {
  _$jscoverage['/selector.js'].branchData['105'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['105'][1].init(19, 49, '(index - b) / a >= 0 && (index - b) % a == 0 && eq');
function visit51_105_1(result) {
  _$jscoverage['/selector.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['101'][1].init(18, 10, 'index == b');
function visit50_101_1(result) {
  _$jscoverage['/selector.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['100'][1].init(14, 6, 'a == 0');
function visit49_100_1(result) {
  _$jscoverage['/selector.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['91'][1].init(363, 23, 'parseInt(match[3]) || 0');
function visit48_91_1(result) {
  _$jscoverage['/selector.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['82'][1].init(26, 15, 'match[2] == \'-\'');
function visit47_82_1(result) {
  _$jscoverage['/selector.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['81'][1].init(63, 8, 'isNaN(a)');
function visit46_81_1(result) {
  _$jscoverage['/selector.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['79'][1].init(18, 8, 'match[1]');
function visit45_79_1(result) {
  _$jscoverage['/selector.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['78'][1].init(315, 47, 'match = param.replace(/\\s/g, \'\').match(aNPlusB)');
function visit44_78_1(result) {
  _$jscoverage['/selector.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['75'][1].init(235, 15, 'param == \'even\'');
function visit43_75_1(result) {
  _$jscoverage['/selector.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['72'][1].init(156, 14, 'param == \'odd\'');
function visit42_72_1(result) {
  _$jscoverage['/selector.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['69'][1].init(74, 24, 'typeof param == \'number\'');
function visit41_69_1(result) {
  _$jscoverage['/selector.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['61'][2].init(67, 16, 'el.nodeType != 1');
function visit40_61_2(result) {
  _$jscoverage['/selector.js'].branchData['61'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['61'][1].init(49, 22, 'el && el.nodeType != 1');
function visit39_61_1(result) {
  _$jscoverage['/selector.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['37'][1].init(91, 8, 'high < 0');
function visit38_37_1(result) {
  _$jscoverage['/selector.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['19'][1].init(18, 12, 'isContextXML');
function visit37_19_1(result) {
  _$jscoverage['/selector.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].lineData[5]++;
KISSY.add('dom/selector', function(S, parser, Dom) {
  _$jscoverage['/selector.js'].functionData[0]++;
  _$jscoverage['/selector.js'].lineData[7]++;
  S.log('use KISSY css3 selector');
  _$jscoverage['/selector.js'].lineData[11]++;
  var document = S.Env.host.document, undefined = undefined, EXPANDO_SELECTOR_KEY = '_ks_data_selector_id_', caches = {}, isContextXML, uuid = 0, subMatchesCache = {}, getAttr = function(el, name) {
  _$jscoverage['/selector.js'].functionData[1]++;
  _$jscoverage['/selector.js'].lineData[19]++;
  if (visit37_19_1(isContextXML)) {
    _$jscoverage['/selector.js'].lineData[20]++;
    return Dom._getSimpleAttr(el, name);
  } else {
    _$jscoverage['/selector.js'].lineData[22]++;
    return Dom.attr(el, name);
  }
}, hasSingleClass = Dom._hasSingleClass, isTag = Dom._isTag, aNPlusB = /^(([+-]?(?:\d+)?)?n)?([+-]?\d+)?$/;
  _$jscoverage['/selector.js'].lineData[30]++;
  var unescape = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g, unescapeFn = function(_, escaped) {
  _$jscoverage['/selector.js'].functionData[2]++;
  _$jscoverage['/selector.js'].lineData[32]++;
  var high = "0x" + escaped - 0x10000;
  _$jscoverage['/selector.js'].lineData[34]++;
  return isNaN(high) ? escaped : visit38_37_1(high < 0) ? String.fromCharCode(high + 0x10000) : String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
};
  _$jscoverage['/selector.js'].lineData[43]++;
  function unEscape(str) {
    _$jscoverage['/selector.js'].functionData[3]++;
    _$jscoverage['/selector.js'].lineData[44]++;
    return str.replace(unescape, unescapeFn);
  }
  _$jscoverage['/selector.js'].lineData[47]++;
  parser.lexer.yy = {
  unEscape: unEscape, 
  unEscapeStr: function(str) {
  _$jscoverage['/selector.js'].functionData[4]++;
  _$jscoverage['/selector.js'].lineData[50]++;
  return this.unEscape(str.slice(1, -1));
}};
  _$jscoverage['/selector.js'].lineData[54]++;
  function resetStatus() {
    _$jscoverage['/selector.js'].functionData[5]++;
    _$jscoverage['/selector.js'].lineData[55]++;
    subMatchesCache = {};
  }
  _$jscoverage['/selector.js'].lineData[58]++;
  function dir(el, dir) {
    _$jscoverage['/selector.js'].functionData[6]++;
    _$jscoverage['/selector.js'].lineData[59]++;
    do {
      _$jscoverage['/selector.js'].lineData[60]++;
      el = el[dir];
    } while (visit39_61_1(el && visit40_61_2(el.nodeType != 1)));
    _$jscoverage['/selector.js'].lineData[62]++;
    return el;
  }
  _$jscoverage['/selector.js'].lineData[65]++;
  function getAb(param) {
    _$jscoverage['/selector.js'].functionData[7]++;
    _$jscoverage['/selector.js'].lineData[66]++;
    var a = 0, match, b = 0;
    _$jscoverage['/selector.js'].lineData[69]++;
    if (visit41_69_1(typeof param == 'number')) {
      _$jscoverage['/selector.js'].lineData[70]++;
      b = param;
    } else {
      _$jscoverage['/selector.js'].lineData[72]++;
      if (visit42_72_1(param == 'odd')) {
        _$jscoverage['/selector.js'].lineData[73]++;
        a = 2;
        _$jscoverage['/selector.js'].lineData[74]++;
        b = 1;
      } else {
        _$jscoverage['/selector.js'].lineData[75]++;
        if (visit43_75_1(param == 'even')) {
          _$jscoverage['/selector.js'].lineData[76]++;
          a = 2;
          _$jscoverage['/selector.js'].lineData[77]++;
          b = 0;
        } else {
          _$jscoverage['/selector.js'].lineData[78]++;
          if (visit44_78_1(match = param.replace(/\s/g, '').match(aNPlusB))) {
            _$jscoverage['/selector.js'].lineData[79]++;
            if (visit45_79_1(match[1])) {
              _$jscoverage['/selector.js'].lineData[80]++;
              a = parseInt(match[2]);
              _$jscoverage['/selector.js'].lineData[81]++;
              if (visit46_81_1(isNaN(a))) {
                _$jscoverage['/selector.js'].lineData[82]++;
                if (visit47_82_1(match[2] == '-')) {
                  _$jscoverage['/selector.js'].lineData[83]++;
                  a = -1;
                } else {
                  _$jscoverage['/selector.js'].lineData[85]++;
                  a = 1;
                }
              }
            } else {
              _$jscoverage['/selector.js'].lineData[89]++;
              a = 0;
            }
            _$jscoverage['/selector.js'].lineData[91]++;
            b = visit48_91_1(parseInt(match[3]) || 0);
          }
        }
      }
    }
    _$jscoverage['/selector.js'].lineData[93]++;
    return {
  a: a, 
  b: b};
  }
  _$jscoverage['/selector.js'].lineData[99]++;
  function matchIndexByAb(index, a, b, eq) {
    _$jscoverage['/selector.js'].functionData[8]++;
    _$jscoverage['/selector.js'].lineData[100]++;
    if (visit49_100_1(a == 0)) {
      _$jscoverage['/selector.js'].lineData[101]++;
      if (visit50_101_1(index == b)) {
        _$jscoverage['/selector.js'].lineData[102]++;
        return eq;
      }
    } else {
      _$jscoverage['/selector.js'].lineData[105]++;
      if (visit51_105_1(visit52_105_2((index - b) / a >= 0) && visit53_105_3(visit54_105_4((index - b) % a == 0) && eq))) {
        _$jscoverage['/selector.js'].lineData[106]++;
        return 1;
      }
    }
    _$jscoverage['/selector.js'].lineData[109]++;
    return undefined;
  }
  _$jscoverage['/selector.js'].lineData[112]++;
  function isXML(elem) {
    _$jscoverage['/selector.js'].functionData[9]++;
    _$jscoverage['/selector.js'].lineData[113]++;
    var documentElement = visit55_113_1(elem && (visit56_113_2(elem.ownerDocument || elem)).documentElement);
    _$jscoverage['/selector.js'].lineData[114]++;
    return documentElement ? visit57_114_1(documentElement.nodeName.toLowerCase() !== "html") : false;
  }
  _$jscoverage['/selector.js'].lineData[117]++;
  var pseudoFnExpr = {
  'nth-child': function(el, param) {
  _$jscoverage['/selector.js'].functionData[10]++;
  _$jscoverage['/selector.js'].lineData[119]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[122]++;
  if (visit58_122_1(visit59_122_2(a == 0) && visit60_122_3(b == 0))) {
    _$jscoverage['/selector.js'].lineData[123]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[125]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[127]++;
  if (visit61_127_1(parent)) {
    _$jscoverage['/selector.js'].lineData[128]++;
    var childNodes = parent.childNodes, count = 0, child, ret, len = childNodes.length;
    _$jscoverage['/selector.js'].lineData[133]++;
    for (; visit62_133_1(count < len); count++) {
      _$jscoverage['/selector.js'].lineData[134]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[135]++;
      if (visit63_135_1(child.nodeType == 1)) {
        _$jscoverage['/selector.js'].lineData[136]++;
        index++;
        _$jscoverage['/selector.js'].lineData[137]++;
        ret = matchIndexByAb(index, a, b, visit64_137_1(child === el));
        _$jscoverage['/selector.js'].lineData[138]++;
        if (visit65_138_1(ret !== undefined)) {
          _$jscoverage['/selector.js'].lineData[139]++;
          return ret;
        }
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[144]++;
  return 0;
}, 
  'nth-last-child': function(el, param) {
  _$jscoverage['/selector.js'].functionData[11]++;
  _$jscoverage['/selector.js'].lineData[147]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[150]++;
  if (visit66_150_1(visit67_150_2(a == 0) && visit68_150_3(b == 0))) {
    _$jscoverage['/selector.js'].lineData[151]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[153]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[155]++;
  if (visit69_155_1(parent)) {
    _$jscoverage['/selector.js'].lineData[156]++;
    var childNodes = parent.childNodes, len = childNodes.length, count = len - 1, child, ret;
    _$jscoverage['/selector.js'].lineData[161]++;
    for (; visit70_161_1(count >= 0); count--) {
      _$jscoverage['/selector.js'].lineData[162]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[163]++;
      if (visit71_163_1(child.nodeType == 1)) {
        _$jscoverage['/selector.js'].lineData[164]++;
        index++;
        _$jscoverage['/selector.js'].lineData[165]++;
        ret = matchIndexByAb(index, a, b, visit72_165_1(child === el));
        _$jscoverage['/selector.js'].lineData[166]++;
        if (visit73_166_1(ret !== undefined)) {
          _$jscoverage['/selector.js'].lineData[167]++;
          return ret;
        }
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[172]++;
  return 0;
}, 
  'nth-of-type': function(el, param) {
  _$jscoverage['/selector.js'].functionData[12]++;
  _$jscoverage['/selector.js'].lineData[175]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[178]++;
  if (visit74_178_1(visit75_178_2(a == 0) && visit76_178_3(b == 0))) {
    _$jscoverage['/selector.js'].lineData[179]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[181]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[183]++;
  if (visit77_183_1(parent)) {
    _$jscoverage['/selector.js'].lineData[184]++;
    var childNodes = parent.childNodes, elType = el.tagName, count = 0, child, ret, len = childNodes.length;
    _$jscoverage['/selector.js'].lineData[190]++;
    for (; visit78_190_1(count < len); count++) {
      _$jscoverage['/selector.js'].lineData[191]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[192]++;
      if (visit79_192_1(child.tagName == elType)) {
        _$jscoverage['/selector.js'].lineData[193]++;
        index++;
        _$jscoverage['/selector.js'].lineData[194]++;
        ret = matchIndexByAb(index, a, b, visit80_194_1(child === el));
        _$jscoverage['/selector.js'].lineData[195]++;
        if (visit81_195_1(ret !== undefined)) {
          _$jscoverage['/selector.js'].lineData[196]++;
          return ret;
        }
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[201]++;
  return 0;
}, 
  'nth-last-of-type': function(el, param) {
  _$jscoverage['/selector.js'].functionData[13]++;
  _$jscoverage['/selector.js'].lineData[204]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[207]++;
  if (visit82_207_1(visit83_207_2(a == 0) && visit84_207_3(b == 0))) {
    _$jscoverage['/selector.js'].lineData[208]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[210]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[212]++;
  if (visit85_212_1(parent)) {
    _$jscoverage['/selector.js'].lineData[213]++;
    var childNodes = parent.childNodes, len = childNodes.length, elType = el.tagName, count = len - 1, child, ret;
    _$jscoverage['/selector.js'].lineData[219]++;
    for (; visit86_219_1(count >= 0); count--) {
      _$jscoverage['/selector.js'].lineData[220]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[221]++;
      if (visit87_221_1(child.tagName == elType)) {
        _$jscoverage['/selector.js'].lineData[222]++;
        index++;
        _$jscoverage['/selector.js'].lineData[223]++;
        ret = matchIndexByAb(index, a, b, visit88_223_1(child === el));
        _$jscoverage['/selector.js'].lineData[224]++;
        if (visit89_224_1(ret !== undefined)) {
          _$jscoverage['/selector.js'].lineData[225]++;
          return ret;
        }
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[230]++;
  return 0;
}, 
  'lang': function(el, lang) {
  _$jscoverage['/selector.js'].functionData[14]++;
  _$jscoverage['/selector.js'].lineData[233]++;
  var elLang;
  _$jscoverage['/selector.js'].lineData[234]++;
  lang = unEscape(lang.toLowerCase());
  _$jscoverage['/selector.js'].lineData[235]++;
  do {
    _$jscoverage['/selector.js'].lineData[236]++;
    if (visit90_236_1(elLang = (isContextXML ? visit91_237_1(el.getAttribute("xml:lang") || el.getAttribute("lang")) : el.lang))) {
      _$jscoverage['/selector.js'].lineData[239]++;
      elLang = elLang.toLowerCase();
      _$jscoverage['/selector.js'].lineData[240]++;
      return visit92_240_1(visit93_240_2(elLang === lang) || visit94_240_3(elLang.indexOf(lang + "-") === 0));
    }
  } while (visit95_242_1((el = el.parentNode) && visit96_242_2(el.nodeType === 1)));
  _$jscoverage['/selector.js'].lineData[243]++;
  return false;
}, 
  'not': function(el, negation_arg) {
  _$jscoverage['/selector.js'].functionData[15]++;
  _$jscoverage['/selector.js'].lineData[246]++;
  return !matchExpr[negation_arg.t](el, negation_arg.value);
}};
  _$jscoverage['/selector.js'].lineData[250]++;
  var pseudoIdentExpr = {
  'empty': function(el) {
  _$jscoverage['/selector.js'].functionData[16]++;
  _$jscoverage['/selector.js'].lineData[252]++;
  var childNodes = el.childNodes, index = 0, len = childNodes.length - 1, child, nodeType;
  _$jscoverage['/selector.js'].lineData[257]++;
  for (; visit97_257_1(index < len); index++) {
    _$jscoverage['/selector.js'].lineData[258]++;
    child = childNodes[index];
    _$jscoverage['/selector.js'].lineData[259]++;
    nodeType = child.nodeType;
    _$jscoverage['/selector.js'].lineData[263]++;
    if (visit98_263_1(visit99_263_2(nodeType == 1) || visit100_263_3(visit101_263_4(nodeType == 3) || visit102_263_5(visit103_263_6(nodeType == 4) || visit104_263_7(nodeType == 5))))) {
      _$jscoverage['/selector.js'].lineData[264]++;
      return 0;
    }
  }
  _$jscoverage['/selector.js'].lineData[267]++;
  return 1;
}, 
  'root': function(el) {
  _$jscoverage['/selector.js'].functionData[17]++;
  _$jscoverage['/selector.js'].lineData[270]++;
  return visit105_270_1(el.ownerDocument && visit106_271_1(el === el.ownerDocument.documentElement));
}, 
  'first-child': function(el) {
  _$jscoverage['/selector.js'].functionData[18]++;
  _$jscoverage['/selector.js'].lineData[274]++;
  return pseudoFnExpr['nth-child'](el, 1);
}, 
  'last-child': function(el) {
  _$jscoverage['/selector.js'].functionData[19]++;
  _$jscoverage['/selector.js'].lineData[277]++;
  return pseudoFnExpr['nth-last-child'](el, 1);
}, 
  'first-of-type': function(el) {
  _$jscoverage['/selector.js'].functionData[20]++;
  _$jscoverage['/selector.js'].lineData[280]++;
  return pseudoFnExpr['nth-of-type'](el, 1);
}, 
  'last-of-type': function(el) {
  _$jscoverage['/selector.js'].functionData[21]++;
  _$jscoverage['/selector.js'].lineData[283]++;
  return pseudoFnExpr['nth-last-of-type'](el, 1);
}, 
  'only-child': function(el) {
  _$jscoverage['/selector.js'].functionData[22]++;
  _$jscoverage['/selector.js'].lineData[286]++;
  return visit107_286_1(pseudoIdentExpr['first-child'](el) && pseudoIdentExpr['last-child'](el));
}, 
  'only-of-type': function(el) {
  _$jscoverage['/selector.js'].functionData[23]++;
  _$jscoverage['/selector.js'].lineData[290]++;
  return visit108_290_1(pseudoIdentExpr['first-of-type'](el) && pseudoIdentExpr['last-of-type'](el));
}, 
  'focus': function(el) {
  _$jscoverage['/selector.js'].functionData[24]++;
  _$jscoverage['/selector.js'].lineData[294]++;
  var doc = el.ownerDocument;
  _$jscoverage['/selector.js'].lineData[295]++;
  return visit109_295_1(doc && visit110_295_2(visit111_295_3(el === doc.activeElement) && visit112_296_1((visit113_296_2(!doc['hasFocus'] || doc['hasFocus']())) && !!(visit114_296_3(el.type || visit115_296_4(el.href || visit116_296_5(el.tabIndex >= 0)))))));
}, 
  'target': function(el) {
  _$jscoverage['/selector.js'].functionData[25]++;
  _$jscoverage['/selector.js'].lineData[299]++;
  var hash = location.hash;
  _$jscoverage['/selector.js'].lineData[300]++;
  return visit117_300_1(hash && visit118_300_2(hash.slice(1) === getAttr(el, 'id')));
}, 
  'enabled': function(el) {
  _$jscoverage['/selector.js'].functionData[26]++;
  _$jscoverage['/selector.js'].lineData[303]++;
  return !el.disabled;
}, 
  'disabled': function(el) {
  _$jscoverage['/selector.js'].functionData[27]++;
  _$jscoverage['/selector.js'].lineData[306]++;
  return el.disabled;
}, 
  'checked': function(el) {
  _$jscoverage['/selector.js'].functionData[28]++;
  _$jscoverage['/selector.js'].lineData[309]++;
  var nodeName = el.nodeName.toLowerCase();
  _$jscoverage['/selector.js'].lineData[310]++;
  return visit119_310_1((visit120_310_2(visit121_310_3(nodeName === "input") && el.checked)) || (visit122_311_1(visit123_311_2(nodeName === "option") && el.selected)));
}};
  _$jscoverage['/selector.js'].lineData[315]++;
  var attribExpr = {
  '~=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[29]++;
  _$jscoverage['/selector.js'].lineData[317]++;
  if (visit124_317_1(!value || visit125_317_2(value.indexOf(' ') > -1))) {
    _$jscoverage['/selector.js'].lineData[318]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[320]++;
  return visit126_320_1((' ' + elValue + ' ').indexOf(' ' + value + ' ') != -1);
}, 
  '|=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[30]++;
  _$jscoverage['/selector.js'].lineData[323]++;
  return visit127_323_1((' ' + elValue).indexOf(' ' + value + '-') != -1);
}, 
  '^=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[31]++;
  _$jscoverage['/selector.js'].lineData[326]++;
  return visit128_326_1(value && S.startsWith(elValue, value));
}, 
  '$=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[32]++;
  _$jscoverage['/selector.js'].lineData[329]++;
  return visit129_329_1(value && S.endsWith(elValue, value));
}, 
  '*=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[33]++;
  _$jscoverage['/selector.js'].lineData[332]++;
  return visit130_332_1(value && visit131_332_2(elValue.indexOf(value) != -1));
}, 
  '=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[34]++;
  _$jscoverage['/selector.js'].lineData[335]++;
  return visit132_335_1(elValue === value);
}};
  _$jscoverage['/selector.js'].lineData[339]++;
  var matchExpr = {
  'tag': isTag, 
  'cls': hasSingleClass, 
  'id': function(el, value) {
  _$jscoverage['/selector.js'].functionData[35]++;
  _$jscoverage['/selector.js'].lineData[343]++;
  return visit133_343_1(getAttr(el, 'id') === value);
}, 
  'attrib': function(el, value) {
  _$jscoverage['/selector.js'].functionData[36]++;
  _$jscoverage['/selector.js'].lineData[346]++;
  var name = value.ident;
  _$jscoverage['/selector.js'].lineData[347]++;
  if (visit134_347_1(!isContextXML)) {
    _$jscoverage['/selector.js'].lineData[348]++;
    name = name.toLowerCase();
  }
  _$jscoverage['/selector.js'].lineData[350]++;
  var elValue = getAttr(el, name);
  _$jscoverage['/selector.js'].lineData[351]++;
  var match = value.match;
  _$jscoverage['/selector.js'].lineData[352]++;
  if (visit135_352_1(!match && visit136_352_2(elValue !== undefined))) {
    _$jscoverage['/selector.js'].lineData[353]++;
    return 1;
  } else {
    _$jscoverage['/selector.js'].lineData[354]++;
    if (visit137_354_1(match)) {
      _$jscoverage['/selector.js'].lineData[355]++;
      if (visit138_355_1(elValue === undefined)) {
        _$jscoverage['/selector.js'].lineData[356]++;
        return 0;
      }
      _$jscoverage['/selector.js'].lineData[358]++;
      var matchFn = attribExpr[match];
      _$jscoverage['/selector.js'].lineData[359]++;
      if (visit139_359_1(matchFn)) {
        _$jscoverage['/selector.js'].lineData[360]++;
        return matchFn(elValue + '', value.value + '');
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[363]++;
  return 0;
}, 
  'pseudo': function(el, value) {
  _$jscoverage['/selector.js'].functionData[37]++;
  _$jscoverage['/selector.js'].lineData[366]++;
  var fn, fnStr, ident;
  _$jscoverage['/selector.js'].lineData[367]++;
  if (visit140_367_1(fnStr = value.fn)) {
    _$jscoverage['/selector.js'].lineData[368]++;
    if (visit141_368_1(!(fn = pseudoFnExpr[fnStr]))) {
      _$jscoverage['/selector.js'].lineData[369]++;
      throw new SyntaxError('Syntax error: not support pseudo: ' + fnStr);
    }
    _$jscoverage['/selector.js'].lineData[371]++;
    return fn(el, value.param);
  }
  _$jscoverage['/selector.js'].lineData[373]++;
  if (visit142_373_1(ident = value.ident)) {
    _$jscoverage['/selector.js'].lineData[374]++;
    if (visit143_374_1(!pseudoIdentExpr[ident])) {
      _$jscoverage['/selector.js'].lineData[375]++;
      throw new SyntaxError('Syntax error: not support pseudo: ' + ident);
    }
    _$jscoverage['/selector.js'].lineData[377]++;
    return pseudoIdentExpr[ident](el);
  }
  _$jscoverage['/selector.js'].lineData[379]++;
  return 0;
}};
  _$jscoverage['/selector.js'].lineData[383]++;
  var relativeExpr = {
  '>': {
  dir: 'parentNode', 
  immediate: 1}, 
  ' ': {
  dir: 'parentNode'}, 
  '+': {
  dir: 'previousSibling', 
  immediate: 1}, 
  '~': {
  dir: 'previousSibling'}};
  _$jscoverage['/selector.js'].lineData[400]++;
  if (visit144_400_1('sourceIndex' in document.documentElement)) {
    _$jscoverage['/selector.js'].lineData[401]++;
    Dom._compareNodeOrder = function(a, b) {
  _$jscoverage['/selector.js'].functionData[38]++;
  _$jscoverage['/selector.js'].lineData[402]++;
  return a.sourceIndex - b.sourceIndex;
};
  }
  _$jscoverage['/selector.js'].lineData[406]++;
  function matches(str, seeds) {
    _$jscoverage['/selector.js'].functionData[39]++;
    _$jscoverage['/selector.js'].lineData[407]++;
    return Dom._selectInternal(str, null, seeds);
  }
  _$jscoverage['/selector.js'].lineData[410]++;
  Dom._matchesInternal = matches;
  _$jscoverage['/selector.js'].lineData[412]++;
  function singleMatch(el, match) {
    _$jscoverage['/selector.js'].functionData[40]++;
    _$jscoverage['/selector.js'].lineData[413]++;
    if (visit145_413_1(!match)) {
      _$jscoverage['/selector.js'].lineData[414]++;
      return true;
    }
    _$jscoverage['/selector.js'].lineData[416]++;
    if (visit146_416_1(!el)) {
      _$jscoverage['/selector.js'].lineData[417]++;
      return false;
    }
    _$jscoverage['/selector.js'].lineData[420]++;
    if (visit147_420_1(el.nodeType === 9)) {
      _$jscoverage['/selector.js'].lineData[421]++;
      return false;
    }
    _$jscoverage['/selector.js'].lineData[424]++;
    var matched = 1, matchSuffix = match.suffix, matchSuffixLen, matchSuffixIndex;
    _$jscoverage['/selector.js'].lineData[429]++;
    if (visit148_429_1(match.t == 'tag')) {
      _$jscoverage['/selector.js'].lineData[430]++;
      matched &= matchExpr['tag'](el, match.value);
    }
    _$jscoverage['/selector.js'].lineData[433]++;
    if (visit149_433_1(matched && matchSuffix)) {
      _$jscoverage['/selector.js'].lineData[434]++;
      matchSuffixLen = matchSuffix.length;
      _$jscoverage['/selector.js'].lineData[435]++;
      matchSuffixIndex = 0;
      _$jscoverage['/selector.js'].lineData[436]++;
      for (; visit150_436_1(matched && visit151_436_2(matchSuffixIndex < matchSuffixLen)); matchSuffixIndex++) {
        _$jscoverage['/selector.js'].lineData[437]++;
        var singleMatchSuffix = matchSuffix[matchSuffixIndex], singleMatchSuffixType = singleMatchSuffix.t;
        _$jscoverage['/selector.js'].lineData[439]++;
        if (visit152_439_1(matchExpr[singleMatchSuffixType])) {
          _$jscoverage['/selector.js'].lineData[440]++;
          matched &= matchExpr[singleMatchSuffixType](el, singleMatchSuffix.value);
        }
      }
    }
    _$jscoverage['/selector.js'].lineData[445]++;
    return matched;
  }
  _$jscoverage['/selector.js'].lineData[449]++;
  function matchImmediate(el, match) {
    _$jscoverage['/selector.js'].functionData[41]++;
    _$jscoverage['/selector.js'].lineData[450]++;
    var matched = 1, startEl = el, relativeOp, startMatch = match;
    _$jscoverage['/selector.js'].lineData[455]++;
    do {
      _$jscoverage['/selector.js'].lineData[456]++;
      matched &= singleMatch(el, match);
      _$jscoverage['/selector.js'].lineData[457]++;
      if (visit153_457_1(matched)) {
        _$jscoverage['/selector.js'].lineData[459]++;
        match = visit154_459_1(match && match.prev);
        _$jscoverage['/selector.js'].lineData[460]++;
        if (visit155_460_1(!match)) {
          _$jscoverage['/selector.js'].lineData[461]++;
          return true;
        }
        _$jscoverage['/selector.js'].lineData[463]++;
        relativeOp = relativeExpr[match.nextCombinator];
        _$jscoverage['/selector.js'].lineData[464]++;
        el = dir(el, relativeOp.dir);
        _$jscoverage['/selector.js'].lineData[465]++;
        if (visit156_465_1(!relativeOp.immediate)) {
          _$jscoverage['/selector.js'].lineData[466]++;
          return {
  el: el, 
  match: match};
        }
      } else {
        _$jscoverage['/selector.js'].lineData[473]++;
        relativeOp = relativeExpr[match.nextCombinator];
        _$jscoverage['/selector.js'].lineData[474]++;
        if (visit157_474_1(relativeOp.immediate)) {
          _$jscoverage['/selector.js'].lineData[476]++;
          return {
  el: dir(startEl, relativeExpr[startMatch.nextCombinator].dir), 
  match: startMatch};
        } else {
          _$jscoverage['/selector.js'].lineData[482]++;
          return {
  el: visit158_483_1(el && dir(el, relativeOp.dir)), 
  match: match};
        }
      }
    } while (el);
    _$jscoverage['/selector.js'].lineData[491]++;
    return {
  el: dir(startEl, relativeExpr[startMatch.nextCombinator].dir), 
  match: startMatch};
  }
  _$jscoverage['/selector.js'].lineData[498]++;
  function findFixedMatchFromHead(el, head) {
    _$jscoverage['/selector.js'].functionData[42]++;
    _$jscoverage['/selector.js'].lineData[499]++;
    var relativeOp, cur = head;
    _$jscoverage['/selector.js'].lineData[502]++;
    do {
      _$jscoverage['/selector.js'].lineData[503]++;
      if (visit159_503_1(!singleMatch(el, cur))) {
        _$jscoverage['/selector.js'].lineData[504]++;
        return null;
      }
      _$jscoverage['/selector.js'].lineData[506]++;
      cur = cur.prev;
      _$jscoverage['/selector.js'].lineData[507]++;
      if (visit160_507_1(!cur)) {
        _$jscoverage['/selector.js'].lineData[508]++;
        return true;
      }
      _$jscoverage['/selector.js'].lineData[510]++;
      relativeOp = relativeExpr[cur.nextCombinator];
      _$jscoverage['/selector.js'].lineData[511]++;
      el = dir(el, relativeOp.dir);
    } while (visit161_512_1(el && relativeOp.immediate));
    _$jscoverage['/selector.js'].lineData[513]++;
    if (visit162_513_1(!el)) {
      _$jscoverage['/selector.js'].lineData[514]++;
      return null;
    }
    _$jscoverage['/selector.js'].lineData[516]++;
    return {
  el: el, 
  match: cur};
  }
  _$jscoverage['/selector.js'].lineData[522]++;
  function genId(el) {
    _$jscoverage['/selector.js'].functionData[43]++;
    _$jscoverage['/selector.js'].lineData[523]++;
    var selectorId;
    _$jscoverage['/selector.js'].lineData[525]++;
    if (visit163_525_1(isContextXML)) {
      _$jscoverage['/selector.js'].lineData[526]++;
      if (visit164_526_1(!(selectorId = el.getAttribute(EXPANDO_SELECTOR_KEY)))) {
        _$jscoverage['/selector.js'].lineData[527]++;
        el.setAttribute(EXPANDO_SELECTOR_KEY, selectorId = (+new Date() + '_' + (++uuid)));
      }
    } else {
      _$jscoverage['/selector.js'].lineData[530]++;
      if (visit165_530_1(!(selectorId = el[EXPANDO_SELECTOR_KEY]))) {
        _$jscoverage['/selector.js'].lineData[531]++;
        selectorId = el[EXPANDO_SELECTOR_KEY] = (+new Date()) + '_' + (++uuid);
      }
    }
    _$jscoverage['/selector.js'].lineData[535]++;
    return selectorId;
  }
  _$jscoverage['/selector.js'].lineData[538]++;
  function matchSub(el, match) {
    _$jscoverage['/selector.js'].functionData[44]++;
    _$jscoverage['/selector.js'].lineData[539]++;
    var selectorId = genId(el), matchKey;
    _$jscoverage['/selector.js'].lineData[541]++;
    matchKey = selectorId + '_' + (visit166_541_1(match.order || 0));
    _$jscoverage['/selector.js'].lineData[542]++;
    if (visit167_542_1(matchKey in subMatchesCache)) {
      _$jscoverage['/selector.js'].lineData[543]++;
      return subMatchesCache[matchKey];
    }
    _$jscoverage['/selector.js'].lineData[545]++;
    return subMatchesCache[matchKey] = matchSubInternal(el, match);
  }
  _$jscoverage['/selector.js'].lineData[550]++;
  function matchSubInternal(el, match) {
    _$jscoverage['/selector.js'].functionData[45]++;
    _$jscoverage['/selector.js'].lineData[551]++;
    var matchImmediateRet = matchImmediate(el, match);
    _$jscoverage['/selector.js'].lineData[552]++;
    if (visit168_552_1(matchImmediateRet === true)) {
      _$jscoverage['/selector.js'].lineData[553]++;
      return true;
    } else {
      _$jscoverage['/selector.js'].lineData[555]++;
      el = matchImmediateRet.el;
      _$jscoverage['/selector.js'].lineData[556]++;
      match = matchImmediateRet.match;
      _$jscoverage['/selector.js'].lineData[557]++;
      while (el) {
        _$jscoverage['/selector.js'].lineData[558]++;
        if (visit169_558_1(matchSub(el, match))) {
          _$jscoverage['/selector.js'].lineData[559]++;
          return true;
        }
        _$jscoverage['/selector.js'].lineData[561]++;
        el = dir(el, relativeExpr[match.nextCombinator].dir);
      }
      _$jscoverage['/selector.js'].lineData[563]++;
      return false;
    }
  }
  _$jscoverage['/selector.js'].lineData[567]++;
  function select(str, context, seeds) {
    _$jscoverage['/selector.js'].functionData[46]++;
    _$jscoverage['/selector.js'].lineData[568]++;
    if (visit170_568_1(!caches[str])) {
      _$jscoverage['/selector.js'].lineData[569]++;
      caches[str] = parser.parse(str);
    }
    _$jscoverage['/selector.js'].lineData[572]++;
    var selector = caches[str], groupIndex = 0, groupLen = selector.length, contextDocument, group, ret = [];
    _$jscoverage['/selector.js'].lineData[579]++;
    if (visit171_579_1(seeds)) {
      _$jscoverage['/selector.js'].lineData[580]++;
      context = visit172_580_1(context || seeds[0].ownerDocument);
    }
    _$jscoverage['/selector.js'].lineData[583]++;
    contextDocument = visit173_583_1(visit174_583_2(context && context.ownerDocument) || document);
    _$jscoverage['/selector.js'].lineData[585]++;
    context = visit175_585_1(context || contextDocument);
    _$jscoverage['/selector.js'].lineData[587]++;
    isContextXML = isXML(context);
    _$jscoverage['/selector.js'].lineData[589]++;
    for (; visit176_589_1(groupIndex < groupLen); groupIndex++) {
      _$jscoverage['/selector.js'].lineData[590]++;
      resetStatus();
      _$jscoverage['/selector.js'].lineData[592]++;
      group = selector[groupIndex];
      _$jscoverage['/selector.js'].lineData[594]++;
      var suffix = group.suffix, suffixIndex, suffixLen, seedsIndex, mySeeds = seeds, seedsLen, id = null;
      _$jscoverage['/selector.js'].lineData[602]++;
      if (visit177_602_1(!mySeeds)) {
        _$jscoverage['/selector.js'].lineData[603]++;
        if (visit178_603_1(suffix && !isContextXML)) {
          _$jscoverage['/selector.js'].lineData[604]++;
          suffixIndex = 0;
          _$jscoverage['/selector.js'].lineData[605]++;
          suffixLen = suffix.length;
          _$jscoverage['/selector.js'].lineData[606]++;
          for (; visit179_606_1(suffixIndex < suffixLen); suffixIndex++) {
            _$jscoverage['/selector.js'].lineData[607]++;
            var singleSuffix = suffix[suffixIndex];
            _$jscoverage['/selector.js'].lineData[608]++;
            if (visit180_608_1(singleSuffix.t == 'id')) {
              _$jscoverage['/selector.js'].lineData[609]++;
              id = singleSuffix.value;
              _$jscoverage['/selector.js'].lineData[610]++;
              break;
            }
          }
        }
        _$jscoverage['/selector.js'].lineData[615]++;
        if (visit181_615_1(id)) {
          _$jscoverage['/selector.js'].lineData[617]++;
          var doesNotHasById = !context.getElementById, contextInDom = Dom._contains(contextDocument, context), tmp = doesNotHasById ? (contextInDom ? contextDocument.getElementById(id) : null) : context.getElementById(id);
          _$jscoverage['/selector.js'].lineData[626]++;
          if (visit182_626_1(visit183_626_2(!tmp && doesNotHasById) || visit184_626_3(tmp && visit185_626_4(getAttr(tmp, 'id') != id)))) {
            _$jscoverage['/selector.js'].lineData[627]++;
            var tmps = Dom._getElementsByTagName('*', context), tmpLen = tmps.length, tmpI = 0;
            _$jscoverage['/selector.js'].lineData[630]++;
            for (; visit186_630_1(tmpI < tmpLen); tmpI++) {
              _$jscoverage['/selector.js'].lineData[631]++;
              tmp = tmps[tmpI];
              _$jscoverage['/selector.js'].lineData[632]++;
              if (visit187_632_1(getAttr(tmp, 'id') == id)) {
                _$jscoverage['/selector.js'].lineData[633]++;
                mySeeds = [tmp];
                _$jscoverage['/selector.js'].lineData[634]++;
                break;
              }
            }
            _$jscoverage['/selector.js'].lineData[637]++;
            if (visit188_637_1(tmpI === tmpLen)) {
              _$jscoverage['/selector.js'].lineData[638]++;
              mySeeds = [];
            }
          } else {
            _$jscoverage['/selector.js'].lineData[641]++;
            if (visit189_641_1(contextInDom && visit190_641_2(tmp && visit191_641_3(context !== contextDocument)))) {
              _$jscoverage['/selector.js'].lineData[642]++;
              tmp = Dom._contains(context, tmp) ? tmp : null;
            }
            _$jscoverage['/selector.js'].lineData[644]++;
            mySeeds = tmp ? [tmp] : [];
          }
        } else {
          _$jscoverage['/selector.js'].lineData[647]++;
          mySeeds = Dom._getElementsByTagName(visit192_647_1(group.value || '*'), context);
        }
      }
      _$jscoverage['/selector.js'].lineData[651]++;
      seedsIndex = 0;
      _$jscoverage['/selector.js'].lineData[652]++;
      seedsLen = mySeeds.length;
      _$jscoverage['/selector.js'].lineData[654]++;
      if (visit193_654_1(!seedsLen)) {
        _$jscoverage['/selector.js'].lineData[655]++;
        continue;
      }
      _$jscoverage['/selector.js'].lineData[658]++;
      for (; visit194_658_1(seedsIndex < seedsLen); seedsIndex++) {
        _$jscoverage['/selector.js'].lineData[659]++;
        var seed = mySeeds[seedsIndex];
        _$jscoverage['/selector.js'].lineData[660]++;
        var matchHead = findFixedMatchFromHead(seed, group);
        _$jscoverage['/selector.js'].lineData[661]++;
        if (visit195_661_1(matchHead === true)) {
          _$jscoverage['/selector.js'].lineData[662]++;
          ret.push(seed);
        } else {
          _$jscoverage['/selector.js'].lineData[663]++;
          if (visit196_663_1(matchHead)) {
            _$jscoverage['/selector.js'].lineData[664]++;
            if (visit197_664_1(matchSub(matchHead.el, matchHead.match))) {
              _$jscoverage['/selector.js'].lineData[665]++;
              ret.push(seed);
            }
          }
        }
      }
    }
    _$jscoverage['/selector.js'].lineData[671]++;
    if (visit198_671_1(groupLen > 1)) {
      _$jscoverage['/selector.js'].lineData[672]++;
      ret = Dom.unique(ret);
    }
    _$jscoverage['/selector.js'].lineData[675]++;
    return ret;
  }
  _$jscoverage['/selector.js'].lineData[678]++;
  Dom._selectInternal = select;
  _$jscoverage['/selector.js'].lineData[680]++;
  return {
  parse: function(str) {
  _$jscoverage['/selector.js'].functionData[47]++;
  _$jscoverage['/selector.js'].lineData[682]++;
  return parser.parse(str);
}, 
  select: select, 
  matches: matches};
}, {
  requires: ['./selector/parser', 'dom/basic']});
