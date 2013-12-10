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
if (! _$jscoverage['/attribute.js']) {
  _$jscoverage['/attribute.js'] = {};
  _$jscoverage['/attribute.js'].lineData = [];
  _$jscoverage['/attribute.js'].lineData[6] = 0;
  _$jscoverage['/attribute.js'].lineData[7] = 0;
  _$jscoverage['/attribute.js'].lineData[8] = 0;
  _$jscoverage['/attribute.js'].lineData[9] = 0;
  _$jscoverage['/attribute.js'].lineData[11] = 0;
  _$jscoverage['/attribute.js'].lineData[13] = 0;
  _$jscoverage['/attribute.js'].lineData[15] = 0;
  _$jscoverage['/attribute.js'].lineData[16] = 0;
  _$jscoverage['/attribute.js'].lineData[19] = 0;
  _$jscoverage['/attribute.js'].lineData[20] = 0;
  _$jscoverage['/attribute.js'].lineData[24] = 0;
  _$jscoverage['/attribute.js'].lineData[26] = 0;
  _$jscoverage['/attribute.js'].lineData[28] = 0;
  _$jscoverage['/attribute.js'].lineData[29] = 0;
  _$jscoverage['/attribute.js'].lineData[30] = 0;
  _$jscoverage['/attribute.js'].lineData[32] = 0;
  _$jscoverage['/attribute.js'].lineData[35] = 0;
  _$jscoverage['/attribute.js'].lineData[36] = 0;
  _$jscoverage['/attribute.js'].lineData[39] = 0;
  _$jscoverage['/attribute.js'].lineData[40] = 0;
  _$jscoverage['/attribute.js'].lineData[44] = 0;
  _$jscoverage['/attribute.js'].lineData[45] = 0;
  _$jscoverage['/attribute.js'].lineData[46] = 0;
  _$jscoverage['/attribute.js'].lineData[54] = 0;
  _$jscoverage['/attribute.js'].lineData[55] = 0;
  _$jscoverage['/attribute.js'].lineData[56] = 0;
  _$jscoverage['/attribute.js'].lineData[57] = 0;
  _$jscoverage['/attribute.js'].lineData[59] = 0;
  _$jscoverage['/attribute.js'].lineData[65] = 0;
  _$jscoverage['/attribute.js'].lineData[66] = 0;
  _$jscoverage['/attribute.js'].lineData[69] = 0;
  _$jscoverage['/attribute.js'].lineData[71] = 0;
  _$jscoverage['/attribute.js'].lineData[77] = 0;
  _$jscoverage['/attribute.js'].lineData[78] = 0;
  _$jscoverage['/attribute.js'].lineData[80] = 0;
  _$jscoverage['/attribute.js'].lineData[81] = 0;
  _$jscoverage['/attribute.js'].lineData[82] = 0;
  _$jscoverage['/attribute.js'].lineData[84] = 0;
  _$jscoverage['/attribute.js'].lineData[85] = 0;
  _$jscoverage['/attribute.js'].lineData[87] = 0;
  _$jscoverage['/attribute.js'].lineData[90] = 0;
  _$jscoverage['/attribute.js'].lineData[93] = 0;
  _$jscoverage['/attribute.js'].lineData[94] = 0;
  _$jscoverage['/attribute.js'].lineData[96] = 0;
  _$jscoverage['/attribute.js'].lineData[97] = 0;
  _$jscoverage['/attribute.js'].lineData[98] = 0;
  _$jscoverage['/attribute.js'].lineData[101] = 0;
  _$jscoverage['/attribute.js'].lineData[107] = 0;
  _$jscoverage['/attribute.js'].lineData[108] = 0;
  _$jscoverage['/attribute.js'].lineData[109] = 0;
  _$jscoverage['/attribute.js'].lineData[110] = 0;
  _$jscoverage['/attribute.js'].lineData[111] = 0;
  _$jscoverage['/attribute.js'].lineData[113] = 0;
  _$jscoverage['/attribute.js'].lineData[115] = 0;
  _$jscoverage['/attribute.js'].lineData[117] = 0;
  _$jscoverage['/attribute.js'].lineData[120] = 0;
  _$jscoverage['/attribute.js'].lineData[121] = 0;
  _$jscoverage['/attribute.js'].lineData[122] = 0;
  _$jscoverage['/attribute.js'].lineData[123] = 0;
  _$jscoverage['/attribute.js'].lineData[125] = 0;
  _$jscoverage['/attribute.js'].lineData[126] = 0;
  _$jscoverage['/attribute.js'].lineData[127] = 0;
  _$jscoverage['/attribute.js'].lineData[132] = 0;
  _$jscoverage['/attribute.js'].lineData[133] = 0;
  _$jscoverage['/attribute.js'].lineData[139] = 0;
  _$jscoverage['/attribute.js'].lineData[140] = 0;
  _$jscoverage['/attribute.js'].lineData[141] = 0;
  _$jscoverage['/attribute.js'].lineData[143] = 0;
  _$jscoverage['/attribute.js'].lineData[145] = 0;
  _$jscoverage['/attribute.js'].lineData[146] = 0;
  _$jscoverage['/attribute.js'].lineData[151] = 0;
  _$jscoverage['/attribute.js'].lineData[152] = 0;
  _$jscoverage['/attribute.js'].lineData[153] = 0;
  _$jscoverage['/attribute.js'].lineData[154] = 0;
  _$jscoverage['/attribute.js'].lineData[155] = 0;
  _$jscoverage['/attribute.js'].lineData[159] = 0;
  _$jscoverage['/attribute.js'].lineData[161] = 0;
  _$jscoverage['/attribute.js'].lineData[172] = 0;
  _$jscoverage['/attribute.js'].lineData[173] = 0;
  _$jscoverage['/attribute.js'].lineData[174] = 0;
  _$jscoverage['/attribute.js'].lineData[177] = 0;
  _$jscoverage['/attribute.js'].lineData[178] = 0;
  _$jscoverage['/attribute.js'].lineData[182] = 0;
  _$jscoverage['/attribute.js'].lineData[185] = 0;
  _$jscoverage['/attribute.js'].lineData[187] = 0;
  _$jscoverage['/attribute.js'].lineData[188] = 0;
  _$jscoverage['/attribute.js'].lineData[190] = 0;
  _$jscoverage['/attribute.js'].lineData[199] = 0;
  _$jscoverage['/attribute.js'].lineData[201] = 0;
  _$jscoverage['/attribute.js'].lineData[202] = 0;
  _$jscoverage['/attribute.js'].lineData[206] = 0;
  _$jscoverage['/attribute.js'].lineData[207] = 0;
  _$jscoverage['/attribute.js'].lineData[208] = 0;
  _$jscoverage['/attribute.js'].lineData[209] = 0;
  _$jscoverage['/attribute.js'].lineData[210] = 0;
  _$jscoverage['/attribute.js'].lineData[217] = 0;
  _$jscoverage['/attribute.js'].lineData[225] = 0;
  _$jscoverage['/attribute.js'].lineData[232] = 0;
  _$jscoverage['/attribute.js'].lineData[233] = 0;
  _$jscoverage['/attribute.js'].lineData[236] = 0;
  _$jscoverage['/attribute.js'].lineData[238] = 0;
  _$jscoverage['/attribute.js'].lineData[239] = 0;
  _$jscoverage['/attribute.js'].lineData[240] = 0;
  _$jscoverage['/attribute.js'].lineData[243] = 0;
  _$jscoverage['/attribute.js'].lineData[246] = 0;
  _$jscoverage['/attribute.js'].lineData[247] = 0;
  _$jscoverage['/attribute.js'].lineData[249] = 0;
  _$jscoverage['/attribute.js'].lineData[250] = 0;
  _$jscoverage['/attribute.js'].lineData[251] = 0;
  _$jscoverage['/attribute.js'].lineData[254] = 0;
  _$jscoverage['/attribute.js'].lineData[255] = 0;
  _$jscoverage['/attribute.js'].lineData[256] = 0;
  _$jscoverage['/attribute.js'].lineData[257] = 0;
  _$jscoverage['/attribute.js'].lineData[258] = 0;
  _$jscoverage['/attribute.js'].lineData[259] = 0;
  _$jscoverage['/attribute.js'].lineData[260] = 0;
  _$jscoverage['/attribute.js'].lineData[261] = 0;
  _$jscoverage['/attribute.js'].lineData[262] = 0;
  _$jscoverage['/attribute.js'].lineData[263] = 0;
  _$jscoverage['/attribute.js'].lineData[264] = 0;
  _$jscoverage['/attribute.js'].lineData[265] = 0;
  _$jscoverage['/attribute.js'].lineData[266] = 0;
  _$jscoverage['/attribute.js'].lineData[267] = 0;
  _$jscoverage['/attribute.js'].lineData[269] = 0;
  _$jscoverage['/attribute.js'].lineData[270] = 0;
  _$jscoverage['/attribute.js'].lineData[272] = 0;
  _$jscoverage['/attribute.js'].lineData[273] = 0;
  _$jscoverage['/attribute.js'].lineData[278] = 0;
  _$jscoverage['/attribute.js'].lineData[279] = 0;
  _$jscoverage['/attribute.js'].lineData[280] = 0;
  _$jscoverage['/attribute.js'].lineData[281] = 0;
  _$jscoverage['/attribute.js'].lineData[284] = 0;
  _$jscoverage['/attribute.js'].lineData[285] = 0;
  _$jscoverage['/attribute.js'].lineData[287] = 0;
  _$jscoverage['/attribute.js'].lineData[288] = 0;
  _$jscoverage['/attribute.js'].lineData[289] = 0;
  _$jscoverage['/attribute.js'].lineData[291] = 0;
  _$jscoverage['/attribute.js'].lineData[292] = 0;
  _$jscoverage['/attribute.js'].lineData[293] = 0;
  _$jscoverage['/attribute.js'].lineData[295] = 0;
  _$jscoverage['/attribute.js'].lineData[296] = 0;
  _$jscoverage['/attribute.js'].lineData[297] = 0;
  _$jscoverage['/attribute.js'].lineData[301] = 0;
  _$jscoverage['/attribute.js'].lineData[303] = 0;
  _$jscoverage['/attribute.js'].lineData[307] = 0;
  _$jscoverage['/attribute.js'].lineData[308] = 0;
  _$jscoverage['/attribute.js'].lineData[312] = 0;
  _$jscoverage['/attribute.js'].lineData[313] = 0;
  _$jscoverage['/attribute.js'].lineData[314] = 0;
  _$jscoverage['/attribute.js'].lineData[315] = 0;
  _$jscoverage['/attribute.js'].lineData[317] = 0;
  _$jscoverage['/attribute.js'].lineData[318] = 0;
  _$jscoverage['/attribute.js'].lineData[319] = 0;
  _$jscoverage['/attribute.js'].lineData[321] = 0;
  _$jscoverage['/attribute.js'].lineData[322] = 0;
  _$jscoverage['/attribute.js'].lineData[323] = 0;
  _$jscoverage['/attribute.js'].lineData[325] = 0;
  _$jscoverage['/attribute.js'].lineData[326] = 0;
  _$jscoverage['/attribute.js'].lineData[327] = 0;
  _$jscoverage['/attribute.js'].lineData[330] = 0;
  _$jscoverage['/attribute.js'].lineData[331] = 0;
  _$jscoverage['/attribute.js'].lineData[332] = 0;
  _$jscoverage['/attribute.js'].lineData[340] = 0;
  _$jscoverage['/attribute.js'].lineData[345] = 0;
  _$jscoverage['/attribute.js'].lineData[346] = 0;
  _$jscoverage['/attribute.js'].lineData[347] = 0;
  _$jscoverage['/attribute.js'].lineData[349] = 0;
  _$jscoverage['/attribute.js'].lineData[354] = 0;
  _$jscoverage['/attribute.js'].lineData[358] = 0;
  _$jscoverage['/attribute.js'].lineData[362] = 0;
  _$jscoverage['/attribute.js'].lineData[363] = 0;
  _$jscoverage['/attribute.js'].lineData[364] = 0;
  _$jscoverage['/attribute.js'].lineData[365] = 0;
  _$jscoverage['/attribute.js'].lineData[368] = 0;
  _$jscoverage['/attribute.js'].lineData[369] = 0;
  _$jscoverage['/attribute.js'].lineData[370] = 0;
  _$jscoverage['/attribute.js'].lineData[372] = 0;
  _$jscoverage['/attribute.js'].lineData[375] = 0;
  _$jscoverage['/attribute.js'].lineData[376] = 0;
  _$jscoverage['/attribute.js'].lineData[378] = 0;
  _$jscoverage['/attribute.js'].lineData[380] = 0;
  _$jscoverage['/attribute.js'].lineData[381] = 0;
  _$jscoverage['/attribute.js'].lineData[383] = 0;
  _$jscoverage['/attribute.js'].lineData[386] = 0;
  _$jscoverage['/attribute.js'].lineData[395] = 0;
  _$jscoverage['/attribute.js'].lineData[403] = 0;
  _$jscoverage['/attribute.js'].lineData[407] = 0;
  _$jscoverage['/attribute.js'].lineData[408] = 0;
  _$jscoverage['/attribute.js'].lineData[410] = 0;
  _$jscoverage['/attribute.js'].lineData[431] = 0;
  _$jscoverage['/attribute.js'].lineData[435] = 0;
  _$jscoverage['/attribute.js'].lineData[436] = 0;
  _$jscoverage['/attribute.js'].lineData[438] = 0;
  _$jscoverage['/attribute.js'].lineData[440] = 0;
  _$jscoverage['/attribute.js'].lineData[450] = 0;
  _$jscoverage['/attribute.js'].lineData[451] = 0;
  _$jscoverage['/attribute.js'].lineData[452] = 0;
  _$jscoverage['/attribute.js'].lineData[454] = 0;
  _$jscoverage['/attribute.js'].lineData[455] = 0;
  _$jscoverage['/attribute.js'].lineData[457] = 0;
  _$jscoverage['/attribute.js'].lineData[466] = 0;
  _$jscoverage['/attribute.js'].lineData[474] = 0;
  _$jscoverage['/attribute.js'].lineData[475] = 0;
  _$jscoverage['/attribute.js'].lineData[476] = 0;
  _$jscoverage['/attribute.js'].lineData[478] = 0;
  _$jscoverage['/attribute.js'].lineData[479] = 0;
  _$jscoverage['/attribute.js'].lineData[480] = 0;
  _$jscoverage['/attribute.js'].lineData[483] = 0;
  _$jscoverage['/attribute.js'].lineData[497] = 0;
  _$jscoverage['/attribute.js'].lineData[498] = 0;
  _$jscoverage['/attribute.js'].lineData[499] = 0;
  _$jscoverage['/attribute.js'].lineData[500] = 0;
  _$jscoverage['/attribute.js'].lineData[501] = 0;
  _$jscoverage['/attribute.js'].lineData[504] = 0;
  _$jscoverage['/attribute.js'].lineData[507] = 0;
  _$jscoverage['/attribute.js'].lineData[508] = 0;
  _$jscoverage['/attribute.js'].lineData[511] = 0;
  _$jscoverage['/attribute.js'].lineData[512] = 0;
  _$jscoverage['/attribute.js'].lineData[513] = 0;
  _$jscoverage['/attribute.js'].lineData[515] = 0;
  _$jscoverage['/attribute.js'].lineData[517] = 0;
  _$jscoverage['/attribute.js'].lineData[518] = 0;
  _$jscoverage['/attribute.js'].lineData[520] = 0;
  _$jscoverage['/attribute.js'].lineData[524] = 0;
  _$jscoverage['/attribute.js'].lineData[525] = 0;
  _$jscoverage['/attribute.js'].lineData[526] = 0;
  _$jscoverage['/attribute.js'].lineData[527] = 0;
  _$jscoverage['/attribute.js'].lineData[528] = 0;
  _$jscoverage['/attribute.js'].lineData[530] = 0;
  _$jscoverage['/attribute.js'].lineData[531] = 0;
  _$jscoverage['/attribute.js'].lineData[540] = 0;
  _$jscoverage['/attribute.js'].lineData[542] = 0;
  _$jscoverage['/attribute.js'].lineData[544] = 0;
  _$jscoverage['/attribute.js'].lineData[546] = 0;
  _$jscoverage['/attribute.js'].lineData[547] = 0;
  _$jscoverage['/attribute.js'].lineData[548] = 0;
  _$jscoverage['/attribute.js'].lineData[550] = 0;
  _$jscoverage['/attribute.js'].lineData[552] = 0;
  _$jscoverage['/attribute.js'].lineData[561] = 0;
  _$jscoverage['/attribute.js'].lineData[570] = 0;
  _$jscoverage['/attribute.js'].lineData[571] = 0;
  _$jscoverage['/attribute.js'].lineData[574] = 0;
  _$jscoverage['/attribute.js'].lineData[575] = 0;
  _$jscoverage['/attribute.js'].lineData[578] = 0;
  _$jscoverage['/attribute.js'].lineData[579] = 0;
  _$jscoverage['/attribute.js'].lineData[583] = 0;
  _$jscoverage['/attribute.js'].lineData[585] = 0;
  _$jscoverage['/attribute.js'].lineData[594] = 0;
  _$jscoverage['/attribute.js'].lineData[601] = 0;
  _$jscoverage['/attribute.js'].lineData[602] = 0;
  _$jscoverage['/attribute.js'].lineData[603] = 0;
  _$jscoverage['/attribute.js'].lineData[606] = 0;
  _$jscoverage['/attribute.js'].lineData[607] = 0;
  _$jscoverage['/attribute.js'].lineData[611] = 0;
  _$jscoverage['/attribute.js'].lineData[616] = 0;
  _$jscoverage['/attribute.js'].lineData[617] = 0;
  _$jscoverage['/attribute.js'].lineData[620] = 0;
  _$jscoverage['/attribute.js'].lineData[621] = 0;
  _$jscoverage['/attribute.js'].lineData[624] = 0;
  _$jscoverage['/attribute.js'].lineData[625] = 0;
  _$jscoverage['/attribute.js'].lineData[628] = 0;
  _$jscoverage['/attribute.js'].lineData[640] = 0;
  _$jscoverage['/attribute.js'].lineData[642] = 0;
  _$jscoverage['/attribute.js'].lineData[643] = 0;
  _$jscoverage['/attribute.js'].lineData[645] = 0;
  _$jscoverage['/attribute.js'].lineData[648] = 0;
  _$jscoverage['/attribute.js'].lineData[652] = 0;
  _$jscoverage['/attribute.js'].lineData[655] = 0;
  _$jscoverage['/attribute.js'].lineData[659] = 0;
  _$jscoverage['/attribute.js'].lineData[660] = 0;
  _$jscoverage['/attribute.js'].lineData[663] = 0;
  _$jscoverage['/attribute.js'].lineData[664] = 0;
  _$jscoverage['/attribute.js'].lineData[669] = 0;
  _$jscoverage['/attribute.js'].lineData[670] = 0;
  _$jscoverage['/attribute.js'].lineData[675] = 0;
  _$jscoverage['/attribute.js'].lineData[676] = 0;
  _$jscoverage['/attribute.js'].lineData[677] = 0;
  _$jscoverage['/attribute.js'].lineData[681] = 0;
  _$jscoverage['/attribute.js'].lineData[683] = 0;
  _$jscoverage['/attribute.js'].lineData[684] = 0;
  _$jscoverage['/attribute.js'].lineData[687] = 0;
  _$jscoverage['/attribute.js'].lineData[690] = 0;
  _$jscoverage['/attribute.js'].lineData[691] = 0;
  _$jscoverage['/attribute.js'].lineData[693] = 0;
  _$jscoverage['/attribute.js'].lineData[695] = 0;
  _$jscoverage['/attribute.js'].lineData[696] = 0;
  _$jscoverage['/attribute.js'].lineData[698] = 0;
  _$jscoverage['/attribute.js'].lineData[699] = 0;
  _$jscoverage['/attribute.js'].lineData[700] = 0;
  _$jscoverage['/attribute.js'].lineData[702] = 0;
  _$jscoverage['/attribute.js'].lineData[705] = 0;
  _$jscoverage['/attribute.js'].lineData[706] = 0;
  _$jscoverage['/attribute.js'].lineData[708] = 0;
  _$jscoverage['/attribute.js'].lineData[709] = 0;
  _$jscoverage['/attribute.js'].lineData[712] = 0;
}
if (! _$jscoverage['/attribute.js'].functionData) {
  _$jscoverage['/attribute.js'].functionData = [];
  _$jscoverage['/attribute.js'].functionData[0] = 0;
  _$jscoverage['/attribute.js'].functionData[1] = 0;
  _$jscoverage['/attribute.js'].functionData[2] = 0;
  _$jscoverage['/attribute.js'].functionData[3] = 0;
  _$jscoverage['/attribute.js'].functionData[4] = 0;
  _$jscoverage['/attribute.js'].functionData[5] = 0;
  _$jscoverage['/attribute.js'].functionData[6] = 0;
  _$jscoverage['/attribute.js'].functionData[7] = 0;
  _$jscoverage['/attribute.js'].functionData[8] = 0;
  _$jscoverage['/attribute.js'].functionData[9] = 0;
  _$jscoverage['/attribute.js'].functionData[10] = 0;
  _$jscoverage['/attribute.js'].functionData[11] = 0;
  _$jscoverage['/attribute.js'].functionData[12] = 0;
  _$jscoverage['/attribute.js'].functionData[13] = 0;
  _$jscoverage['/attribute.js'].functionData[14] = 0;
  _$jscoverage['/attribute.js'].functionData[15] = 0;
  _$jscoverage['/attribute.js'].functionData[16] = 0;
  _$jscoverage['/attribute.js'].functionData[17] = 0;
  _$jscoverage['/attribute.js'].functionData[18] = 0;
  _$jscoverage['/attribute.js'].functionData[19] = 0;
  _$jscoverage['/attribute.js'].functionData[20] = 0;
  _$jscoverage['/attribute.js'].functionData[21] = 0;
  _$jscoverage['/attribute.js'].functionData[22] = 0;
  _$jscoverage['/attribute.js'].functionData[23] = 0;
  _$jscoverage['/attribute.js'].functionData[24] = 0;
  _$jscoverage['/attribute.js'].functionData[25] = 0;
  _$jscoverage['/attribute.js'].functionData[26] = 0;
  _$jscoverage['/attribute.js'].functionData[27] = 0;
  _$jscoverage['/attribute.js'].functionData[28] = 0;
  _$jscoverage['/attribute.js'].functionData[29] = 0;
  _$jscoverage['/attribute.js'].functionData[30] = 0;
  _$jscoverage['/attribute.js'].functionData[31] = 0;
  _$jscoverage['/attribute.js'].functionData[32] = 0;
  _$jscoverage['/attribute.js'].functionData[33] = 0;
  _$jscoverage['/attribute.js'].functionData[34] = 0;
  _$jscoverage['/attribute.js'].functionData[35] = 0;
  _$jscoverage['/attribute.js'].functionData[36] = 0;
  _$jscoverage['/attribute.js'].functionData[37] = 0;
}
if (! _$jscoverage['/attribute.js'].branchData) {
  _$jscoverage['/attribute.js'].branchData = {};
  _$jscoverage['/attribute.js'].branchData['29'] = [];
  _$jscoverage['/attribute.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['36'] = [];
  _$jscoverage['/attribute.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['45'] = [];
  _$jscoverage['/attribute.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['56'] = [];
  _$jscoverage['/attribute.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['59'] = [];
  _$jscoverage['/attribute.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['67'] = [];
  _$jscoverage['/attribute.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['67'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['67'][3] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['80'] = [];
  _$jscoverage['/attribute.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['81'] = [];
  _$jscoverage['/attribute.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['84'] = [];
  _$jscoverage['/attribute.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['96'] = [];
  _$jscoverage['/attribute.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['109'] = [];
  _$jscoverage['/attribute.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['110'] = [];
  _$jscoverage['/attribute.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['122'] = [];
  _$jscoverage['/attribute.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['145'] = [];
  _$jscoverage['/attribute.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['151'] = [];
  _$jscoverage['/attribute.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['152'] = [];
  _$jscoverage['/attribute.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['152'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['154'] = [];
  _$jscoverage['/attribute.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['154'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['172'] = [];
  _$jscoverage['/attribute.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['173'] = [];
  _$jscoverage['/attribute.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['177'] = [];
  _$jscoverage['/attribute.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['187'] = [];
  _$jscoverage['/attribute.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['201'] = [];
  _$jscoverage['/attribute.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['206'] = [];
  _$jscoverage['/attribute.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['209'] = [];
  _$jscoverage['/attribute.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['247'] = [];
  _$jscoverage['/attribute.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['250'] = [];
  _$jscoverage['/attribute.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['255'] = [];
  _$jscoverage['/attribute.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['257'] = [];
  _$jscoverage['/attribute.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['266'] = [];
  _$jscoverage['/attribute.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['269'] = [];
  _$jscoverage['/attribute.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['287'] = [];
  _$jscoverage['/attribute.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['288'] = [];
  _$jscoverage['/attribute.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['292'] = [];
  _$jscoverage['/attribute.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['295'] = [];
  _$jscoverage['/attribute.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['296'] = [];
  _$jscoverage['/attribute.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['301'] = [];
  _$jscoverage['/attribute.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['318'] = [];
  _$jscoverage['/attribute.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['322'] = [];
  _$jscoverage['/attribute.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['325'] = [];
  _$jscoverage['/attribute.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['331'] = [];
  _$jscoverage['/attribute.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['346'] = [];
  _$jscoverage['/attribute.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['362'] = [];
  _$jscoverage['/attribute.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['362'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['369'] = [];
  _$jscoverage['/attribute.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['376'] = [];
  _$jscoverage['/attribute.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['381'] = [];
  _$jscoverage['/attribute.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['386'] = [];
  _$jscoverage['/attribute.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['395'] = [];
  _$jscoverage['/attribute.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['454'] = [];
  _$jscoverage['/attribute.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['478'] = [];
  _$jscoverage['/attribute.js'].branchData['478'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['498'] = [];
  _$jscoverage['/attribute.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['500'] = [];
  _$jscoverage['/attribute.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['507'] = [];
  _$jscoverage['/attribute.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['511'] = [];
  _$jscoverage['/attribute.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['512'] = [];
  _$jscoverage['/attribute.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['530'] = [];
  _$jscoverage['/attribute.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['542'] = [];
  _$jscoverage['/attribute.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['546'] = [];
  _$jscoverage['/attribute.js'].branchData['546'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['547'] = [];
  _$jscoverage['/attribute.js'].branchData['547'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['570'] = [];
  _$jscoverage['/attribute.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['574'] = [];
  _$jscoverage['/attribute.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['578'] = [];
  _$jscoverage['/attribute.js'].branchData['578'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['601'] = [];
  _$jscoverage['/attribute.js'].branchData['601'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['616'] = [];
  _$jscoverage['/attribute.js'].branchData['616'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['620'] = [];
  _$jscoverage['/attribute.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['620'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['624'] = [];
  _$jscoverage['/attribute.js'].branchData['624'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['642'] = [];
  _$jscoverage['/attribute.js'].branchData['642'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['643'] = [];
  _$jscoverage['/attribute.js'].branchData['643'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['675'] = [];
  _$jscoverage['/attribute.js'].branchData['675'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['677'] = [];
  _$jscoverage['/attribute.js'].branchData['677'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['698'] = [];
  _$jscoverage['/attribute.js'].branchData['698'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['705'] = [];
  _$jscoverage['/attribute.js'].branchData['705'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['708'] = [];
  _$jscoverage['/attribute.js'].branchData['708'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['708'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['708'][3] = new BranchData();
}
_$jscoverage['/attribute.js'].branchData['708'][3].init(148, 10, 'e !== true');
function visit80_708_3(result) {
  _$jscoverage['/attribute.js'].branchData['708'][3].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['708'][2].init(129, 15, 'e !== undefined');
function visit79_708_2(result) {
  _$jscoverage['/attribute.js'].branchData['708'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['708'][1].init(129, 29, 'e !== undefined && e !== true');
function visit78_708_1(result) {
  _$jscoverage['/attribute.js'].branchData['708'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['705'][1].init(426, 52, 'validator && (validator = normalFn(self, validator))');
function visit77_705_1(result) {
  _$jscoverage['/attribute.js'].branchData['705'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['698'][1].init(171, 4, 'path');
function visit76_698_1(result) {
  _$jscoverage['/attribute.js'].branchData['698'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['677'][1].init(53, 85, 'val !== undefined');
function visit75_677_1(result) {
  _$jscoverage['/attribute.js'].branchData['677'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['675'][1].init(165, 40, 'valFn && (valFn = normalFn(self, valFn))');
function visit74_675_1(result) {
  _$jscoverage['/attribute.js'].branchData['675'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['643'][1].init(21, 18, 'self.hasAttr(name)');
function visit73_643_1(result) {
  _$jscoverage['/attribute.js'].branchData['643'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['642'][1].init(47, 24, 'typeof name === \'string\'');
function visit72_642_1(result) {
  _$jscoverage['/attribute.js'].branchData['642'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['624'][1].init(944, 4, 'path');
function visit71_624_1(result) {
  _$jscoverage['/attribute.js'].branchData['624'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['620'][2].init(854, 17, 'ret !== undefined');
function visit70_620_2(result) {
  _$jscoverage['/attribute.js'].branchData['620'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['620'][1].init(831, 40, '!(name in attrVals) && ret !== undefined');
function visit69_620_1(result) {
  _$jscoverage['/attribute.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['616'][1].init(701, 43, 'getter && (getter = normalFn(self, getter))');
function visit68_616_1(result) {
  _$jscoverage['/attribute.js'].branchData['616'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['601'][1].init(199, 24, 'name.indexOf(dot) !== -1');
function visit67_601_1(result) {
  _$jscoverage['/attribute.js'].branchData['601'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['578'][1].init(669, 22, 'setValue !== undefined');
function visit66_578_1(result) {
  _$jscoverage['/attribute.js'].branchData['578'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['574'][1].init(584, 20, 'setValue === INVALID');
function visit65_574_1(result) {
  _$jscoverage['/attribute.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['570'][1].init(447, 43, 'setter && (setter = normalFn(self, setter))');
function visit64_570_1(result) {
  _$jscoverage['/attribute.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['547'][1].init(21, 10, 'opts.error');
function visit63_547_1(result) {
  _$jscoverage['/attribute.js'].branchData['547'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['546'][1].init(1780, 15, 'e !== undefined');
function visit62_546_1(result) {
  _$jscoverage['/attribute.js'].branchData['546'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['542'][1].init(1675, 10, 'opts || {}');
function visit61_542_1(result) {
  _$jscoverage['/attribute.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['530'][1].init(1226, 16, 'attrNames.length');
function visit60_530_1(result) {
  _$jscoverage['/attribute.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['512'][1].init(25, 10, 'opts.error');
function visit59_512_1(result) {
  _$jscoverage['/attribute.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['511'][1].init(494, 13, 'errors.length');
function visit58_511_1(result) {
  _$jscoverage['/attribute.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['507'][1].init(129, 55, '(e = validate(self, name, all[name], all)) !== undefined');
function visit57_507_1(result) {
  _$jscoverage['/attribute.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['500'][1].init(54, 10, 'opts || {}');
function visit56_500_1(result) {
  _$jscoverage['/attribute.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['498'][1].init(49, 21, 'S.isPlainObject(name)');
function visit55_498_1(result) {
  _$jscoverage['/attribute.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['478'][1].init(138, 18, 'self.hasAttr(name)');
function visit54_478_1(result) {
  _$jscoverage['/attribute.js'].branchData['478'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['454'][1].init(172, 13, 'initialValues');
function visit53_454_1(result) {
  _$jscoverage['/attribute.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['395'][1].init(20, 35, 'this.__attrs || (this.__attrs = {})');
function visit52_395_1(result) {
  _$jscoverage['/attribute.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['386'][1].init(1047, 10, 'args || []');
function visit51_386_1(result) {
  _$jscoverage['/attribute.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['381'][1].init(847, 7, '!member');
function visit50_381_1(result) {
  _$jscoverage['/attribute.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['376'][1].init(593, 5, '!name');
function visit49_376_1(result) {
  _$jscoverage['/attribute.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['369'][1].init(111, 18, 'method.__wrapped__');
function visit48_369_1(result) {
  _$jscoverage['/attribute.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['362'][2].init(110, 26, 'typeof self === \'function\'');
function visit47_362_2(result) {
  _$jscoverage['/attribute.js'].branchData['362'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['362'][1].init(110, 43, 'typeof self === \'function\' && self.__name__');
function visit46_362_1(result) {
  _$jscoverage['/attribute.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['346'][1].init(13, 6, 'config');
function visit45_346_1(result) {
  _$jscoverage['/attribute.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['331'][1].init(13, 5, 'attrs');
function visit44_331_1(result) {
  _$jscoverage['/attribute.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['325'][1].init(1581, 19, 'sx.extend || extend');
function visit43_325_1(result) {
  _$jscoverage['/attribute.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['322'][1].init(1474, 18, 'sxInheritedStatics');
function visit42_322_1(result) {
  _$jscoverage['/attribute.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['318'][1].init(56, 25, 'sx.inheritedStatics || {}');
function visit41_318_1(result) {
  _$jscoverage['/attribute.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['301'][1].init(138, 9, '\'@DEBUG@\'');
function visit40_301_1(result) {
  _$jscoverage['/attribute.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['296'][1].init(373, 32, 'px.hasOwnProperty(\'constructor\')');
function visit39_296_1(result) {
  _$jscoverage['/attribute.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['295'][1].init(330, 29, 'sx.name || \'AttributeDerived\'');
function visit38_295_1(result) {
  _$jscoverage['/attribute.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['292'][1].init(38, 18, 'sx.__hooks__ || {}');
function visit37_292_1(result) {
  _$jscoverage['/attribute.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['288'][1].init(90, 8, 'px || {}');
function visit36_288_1(result) {
  _$jscoverage['/attribute.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['287'][1].init(67, 8, 'sx || {}');
function visit35_287_1(result) {
  _$jscoverage['/attribute.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['269'][1].init(551, 7, 'wrapped');
function visit34_269_1(result) {
  _$jscoverage['/attribute.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['266'][1].init(464, 13, 'v.__wrapped__');
function visit33_266_1(result) {
  _$jscoverage['/attribute.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['257'][1].init(54, 11, 'v.__owner__');
function visit32_257_1(result) {
  _$jscoverage['/attribute.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['255'][1].init(17, 23, 'typeof v === \'function\'');
function visit31_255_1(result) {
  _$jscoverage['/attribute.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['250'][1].init(17, 7, 'p in px');
function visit30_250_1(result) {
  _$jscoverage['/attribute.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['247'][1].init(21, 24, 'SubClass.__hooks__ || {}');
function visit29_247_1(result) {
  _$jscoverage['/attribute.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['209'][1].init(156, 5, 'attrs');
function visit28_209_1(result) {
  _$jscoverage['/attribute.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['206'][1].init(509, 12, '!opts.silent');
function visit27_206_1(result) {
  _$jscoverage['/attribute.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['201'][1].init(417, 13, 'ret === FALSE');
function visit26_201_1(result) {
  _$jscoverage['/attribute.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['187'][1].init(60, 17, 'e.target !== this');
function visit25_187_1(result) {
  _$jscoverage['/attribute.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['177'][1].init(17, 79, 'FALSE === self.fire(whenAttrChangeEventName(\'before\', name), beforeEventObject)');
function visit24_177_1(result) {
  _$jscoverage['/attribute.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['173'][1].init(17, 52, 'FALSE === defaultSetFn.call(self, beforeEventObject)');
function visit23_173_1(result) {
  _$jscoverage['/attribute.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['172'][1].init(1033, 11, 'opts.silent');
function visit22_172_1(result) {
  _$jscoverage['/attribute.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['154'][2].init(113, 16, 'subVal === value');
function visit21_154_2(result) {
  _$jscoverage['/attribute.js'].branchData['154'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['154'][1].init(105, 24, 'path && subVal === value');
function visit20_154_1(result) {
  _$jscoverage['/attribute.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['152'][2].init(26, 17, 'prevVal === value');
function visit19_152_2(result) {
  _$jscoverage['/attribute.js'].branchData['152'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['152'][1].init(17, 26, '!path && prevVal === value');
function visit18_152_1(result) {
  _$jscoverage['/attribute.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['151'][1].init(466, 11, '!opts.force');
function visit17_151_1(result) {
  _$jscoverage['/attribute.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['145'][1].init(297, 4, 'path');
function visit16_145_1(result) {
  _$jscoverage['/attribute.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['122'][1].init(88, 22, 'defaultBeforeFns[name]');
function visit15_122_1(result) {
  _$jscoverage['/attribute.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['110'][1].init(17, 21, 'prevVal === undefined');
function visit14_110_1(result) {
  _$jscoverage['/attribute.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['109'][1].init(38, 4, 'path');
function visit13_109_1(result) {
  _$jscoverage['/attribute.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['96'][1].init(32, 24, 'name.indexOf(\'.\') !== -1');
function visit12_96_1(result) {
  _$jscoverage['/attribute.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['84'][1].init(107, 15, 'o !== undefined');
function visit11_84_1(result) {
  _$jscoverage['/attribute.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['81'][1].init(29, 7, 'i < len');
function visit10_81_1(result) {
  _$jscoverage['/attribute.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['80'][1].init(67, 8, 'len >= 0');
function visit9_80_1(result) {
  _$jscoverage['/attribute.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['67'][3].init(18, 7, 'i < len');
function visit8_67_3(result) {
  _$jscoverage['/attribute.js'].branchData['67'][3].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['67'][2].init(58, 15, 'o !== undefined');
function visit7_67_2(result) {
  _$jscoverage['/attribute.js'].branchData['67'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['67'][1].init(47, 26, 'o !== undefined && i < len');
function visit6_67_1(result) {
  _$jscoverage['/attribute.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['59'][1].init(125, 9, 'ret || {}');
function visit5_59_1(result) {
  _$jscoverage['/attribute.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['56'][1].init(42, 20, '!doNotCreate && !ret');
function visit4_56_1(result) {
  _$jscoverage['/attribute.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['45'][1].init(20, 16, 'attrName || name');
function visit3_45_1(result) {
  _$jscoverage['/attribute.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['36'][1].init(16, 41, 'self.__attrVals || (self.__attrVals = {})');
function visit2_36_1(result) {
  _$jscoverage['/attribute.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['29'][1].init(13, 26, 'typeof method === \'string\'');
function visit1_29_1(result) {
  _$jscoverage['/attribute.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].lineData[6]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/attribute.js'].functionData[0]++;
  _$jscoverage['/attribute.js'].lineData[7]++;
  var RE_DASH = /(?:^|-)([a-z])/ig;
  _$jscoverage['/attribute.js'].lineData[8]++;
  var CustomEvent = require('event/custom');
  _$jscoverage['/attribute.js'].lineData[9]++;
  module.exports = Attribute;
  _$jscoverage['/attribute.js'].lineData[11]++;
  x.float = 1;
  _$jscoverage['/attribute.js'].lineData[13]++;
  var bind = S.bind;
  _$jscoverage['/attribute.js'].lineData[15]++;
  function replaceToUpper() {
    _$jscoverage['/attribute.js'].functionData[1]++;
    _$jscoverage['/attribute.js'].lineData[16]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/attribute.js'].lineData[19]++;
  function camelCase(name) {
    _$jscoverage['/attribute.js'].functionData[2]++;
    _$jscoverage['/attribute.js'].lineData[20]++;
    return name.replace(RE_DASH, replaceToUpper);
  }
  _$jscoverage['/attribute.js'].lineData[24]++;
  var INVALID = {};
  _$jscoverage['/attribute.js'].lineData[26]++;
  var FALSE = false;
  _$jscoverage['/attribute.js'].lineData[28]++;
  function normalFn(host, method) {
    _$jscoverage['/attribute.js'].functionData[3]++;
    _$jscoverage['/attribute.js'].lineData[29]++;
    if (visit1_29_1(typeof method === 'string')) {
      _$jscoverage['/attribute.js'].lineData[30]++;
      return host[method];
    }
    _$jscoverage['/attribute.js'].lineData[32]++;
    return method;
  }
  _$jscoverage['/attribute.js'].lineData[35]++;
  function getAttrVals(self) {
    _$jscoverage['/attribute.js'].functionData[4]++;
    _$jscoverage['/attribute.js'].lineData[36]++;
    return visit2_36_1(self.__attrVals || (self.__attrVals = {}));
  }
  _$jscoverage['/attribute.js'].lineData[39]++;
  function whenAttrChangeEventName(when, name) {
    _$jscoverage['/attribute.js'].functionData[5]++;
    _$jscoverage['/attribute.js'].lineData[40]++;
    return when + S.ucfirst(name) + 'Change';
  }
  _$jscoverage['/attribute.js'].lineData[44]++;
  function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName, data) {
    _$jscoverage['/attribute.js'].functionData[6]++;
    _$jscoverage['/attribute.js'].lineData[45]++;
    attrName = visit3_45_1(attrName || name);
    _$jscoverage['/attribute.js'].lineData[46]++;
    return self.fire(whenAttrChangeEventName(when, name), S.mix({
  attrName: attrName, 
  subAttrName: subAttrName, 
  prevVal: prevVal, 
  newVal: newVal}, data));
  }
  _$jscoverage['/attribute.js'].lineData[54]++;
  function ensureNonEmpty(obj, name, doNotCreate) {
    _$jscoverage['/attribute.js'].functionData[7]++;
    _$jscoverage['/attribute.js'].lineData[55]++;
    var ret = obj[name];
    _$jscoverage['/attribute.js'].lineData[56]++;
    if (visit4_56_1(!doNotCreate && !ret)) {
      _$jscoverage['/attribute.js'].lineData[57]++;
      obj[name] = ret = {};
    }
    _$jscoverage['/attribute.js'].lineData[59]++;
    return visit5_59_1(ret || {});
  }
  _$jscoverage['/attribute.js'].lineData[65]++;
  function getValueByPath(o, path) {
    _$jscoverage['/attribute.js'].functionData[8]++;
    _$jscoverage['/attribute.js'].lineData[66]++;
    for (var i = 0, len = path.length; visit6_67_1(visit7_67_2(o !== undefined) && visit8_67_3(i < len)); i++) {
      _$jscoverage['/attribute.js'].lineData[69]++;
      o = o[path[i]];
    }
    _$jscoverage['/attribute.js'].lineData[71]++;
    return o;
  }
  _$jscoverage['/attribute.js'].lineData[77]++;
  function setValueByPath(o, path, val) {
    _$jscoverage['/attribute.js'].functionData[9]++;
    _$jscoverage['/attribute.js'].lineData[78]++;
    var len = path.length - 1, s = o;
    _$jscoverage['/attribute.js'].lineData[80]++;
    if (visit9_80_1(len >= 0)) {
      _$jscoverage['/attribute.js'].lineData[81]++;
      for (var i = 0; visit10_81_1(i < len); i++) {
        _$jscoverage['/attribute.js'].lineData[82]++;
        o = o[path[i]];
      }
      _$jscoverage['/attribute.js'].lineData[84]++;
      if (visit11_84_1(o !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[85]++;
        o[path[i]] = val;
      } else {
        _$jscoverage['/attribute.js'].lineData[87]++;
        s = undefined;
      }
    }
    _$jscoverage['/attribute.js'].lineData[90]++;
    return s;
  }
  _$jscoverage['/attribute.js'].lineData[93]++;
  function getPathNamePair(name) {
    _$jscoverage['/attribute.js'].functionData[10]++;
    _$jscoverage['/attribute.js'].lineData[94]++;
    var path;
    _$jscoverage['/attribute.js'].lineData[96]++;
    if (visit12_96_1(name.indexOf('.') !== -1)) {
      _$jscoverage['/attribute.js'].lineData[97]++;
      path = name.split('.');
      _$jscoverage['/attribute.js'].lineData[98]++;
      name = path.shift();
    }
    _$jscoverage['/attribute.js'].lineData[101]++;
    return {
  path: path, 
  name: name};
  }
  _$jscoverage['/attribute.js'].lineData[107]++;
  function getValueBySubValue(prevVal, path, value) {
    _$jscoverage['/attribute.js'].functionData[11]++;
    _$jscoverage['/attribute.js'].lineData[108]++;
    var tmp = value;
    _$jscoverage['/attribute.js'].lineData[109]++;
    if (visit13_109_1(path)) {
      _$jscoverage['/attribute.js'].lineData[110]++;
      if (visit14_110_1(prevVal === undefined)) {
        _$jscoverage['/attribute.js'].lineData[111]++;
        tmp = {};
      } else {
        _$jscoverage['/attribute.js'].lineData[113]++;
        tmp = S.clone(prevVal);
      }
      _$jscoverage['/attribute.js'].lineData[115]++;
      setValueByPath(tmp, path, value);
    }
    _$jscoverage['/attribute.js'].lineData[117]++;
    return tmp;
  }
  _$jscoverage['/attribute.js'].lineData[120]++;
  function prepareDefaultSetFn(self, name) {
    _$jscoverage['/attribute.js'].functionData[12]++;
    _$jscoverage['/attribute.js'].lineData[121]++;
    var defaultBeforeFns = ensureNonEmpty(self, '__defaultBeforeFns');
    _$jscoverage['/attribute.js'].lineData[122]++;
    if (visit15_122_1(defaultBeforeFns[name])) {
      _$jscoverage['/attribute.js'].lineData[123]++;
      return;
    }
    _$jscoverage['/attribute.js'].lineData[125]++;
    defaultBeforeFns[name] = 1;
    _$jscoverage['/attribute.js'].lineData[126]++;
    var beforeChangeEventName = whenAttrChangeEventName('before', name);
    _$jscoverage['/attribute.js'].lineData[127]++;
    self.publish(beforeChangeEventName, {
  defaultFn: defaultSetFn});
  }
  _$jscoverage['/attribute.js'].lineData[132]++;
  function setInternal(self, name, value, opts, attrs) {
    _$jscoverage['/attribute.js'].functionData[13]++;
    _$jscoverage['/attribute.js'].lineData[133]++;
    var path, subVal, prevVal, pathNamePair = getPathNamePair(name), fullName = name;
    _$jscoverage['/attribute.js'].lineData[139]++;
    name = pathNamePair.name;
    _$jscoverage['/attribute.js'].lineData[140]++;
    path = pathNamePair.path;
    _$jscoverage['/attribute.js'].lineData[141]++;
    prevVal = self.get(name);
    _$jscoverage['/attribute.js'].lineData[143]++;
    prepareDefaultSetFn(self, name);
    _$jscoverage['/attribute.js'].lineData[145]++;
    if (visit16_145_1(path)) {
      _$jscoverage['/attribute.js'].lineData[146]++;
      subVal = getValueByPath(prevVal, path);
    }
    _$jscoverage['/attribute.js'].lineData[151]++;
    if (visit17_151_1(!opts.force)) {
      _$jscoverage['/attribute.js'].lineData[152]++;
      if (visit18_152_1(!path && visit19_152_2(prevVal === value))) {
        _$jscoverage['/attribute.js'].lineData[153]++;
        return undefined;
      } else {
        _$jscoverage['/attribute.js'].lineData[154]++;
        if (visit20_154_1(path && visit21_154_2(subVal === value))) {
          _$jscoverage['/attribute.js'].lineData[155]++;
          return undefined;
        }
      }
    }
    _$jscoverage['/attribute.js'].lineData[159]++;
    value = getValueBySubValue(prevVal, path, value);
    _$jscoverage['/attribute.js'].lineData[161]++;
    var beforeEventObject = S.mix({
  attrName: name, 
  subAttrName: fullName, 
  prevVal: prevVal, 
  newVal: value, 
  _opts: opts, 
  _attrs: attrs, 
  target: self}, opts.data);
    _$jscoverage['/attribute.js'].lineData[172]++;
    if (visit22_172_1(opts.silent)) {
      _$jscoverage['/attribute.js'].lineData[173]++;
      if (visit23_173_1(FALSE === defaultSetFn.call(self, beforeEventObject))) {
        _$jscoverage['/attribute.js'].lineData[174]++;
        return FALSE;
      }
    } else {
      _$jscoverage['/attribute.js'].lineData[177]++;
      if (visit24_177_1(FALSE === self.fire(whenAttrChangeEventName('before', name), beforeEventObject))) {
        _$jscoverage['/attribute.js'].lineData[178]++;
        return FALSE;
      }
    }
    _$jscoverage['/attribute.js'].lineData[182]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[185]++;
  function defaultSetFn(e) {
    _$jscoverage['/attribute.js'].functionData[14]++;
    _$jscoverage['/attribute.js'].lineData[187]++;
    if (visit25_187_1(e.target !== this)) {
      _$jscoverage['/attribute.js'].lineData[188]++;
      return undefined;
    }
    _$jscoverage['/attribute.js'].lineData[190]++;
    var self = this, value = e.newVal, prevVal = e.prevVal, name = e.attrName, fullName = e.subAttrName, attrs = e._attrs, opts = e._opts;
    _$jscoverage['/attribute.js'].lineData[199]++;
    var ret = self.setInternal(name, value);
    _$jscoverage['/attribute.js'].lineData[201]++;
    if (visit26_201_1(ret === FALSE)) {
      _$jscoverage['/attribute.js'].lineData[202]++;
      return ret;
    }
    _$jscoverage['/attribute.js'].lineData[206]++;
    if (visit27_206_1(!opts.silent)) {
      _$jscoverage['/attribute.js'].lineData[207]++;
      value = getAttrVals(self)[name];
      _$jscoverage['/attribute.js'].lineData[208]++;
      __fireAttrChange(self, 'after', name, prevVal, value, fullName, null, opts.data);
      _$jscoverage['/attribute.js'].lineData[209]++;
      if (visit28_209_1(attrs)) {
        _$jscoverage['/attribute.js'].lineData[210]++;
        attrs.push({
  prevVal: prevVal, 
  newVal: value, 
  attrName: name, 
  subAttrName: fullName});
      } else {
        _$jscoverage['/attribute.js'].lineData[217]++;
        __fireAttrChange(self, '', '*', [prevVal], [value], [fullName], [name], opts.data);
      }
    }
    _$jscoverage['/attribute.js'].lineData[225]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[232]++;
  function Attribute(config) {
    _$jscoverage['/attribute.js'].functionData[15]++;
    _$jscoverage['/attribute.js'].lineData[233]++;
    var self = this, c = self.constructor;
    _$jscoverage['/attribute.js'].lineData[236]++;
    self.userConfig = config;
    _$jscoverage['/attribute.js'].lineData[238]++;
    while (c) {
      _$jscoverage['/attribute.js'].lineData[239]++;
      addAttrs(self, c.ATTRS);
      _$jscoverage['/attribute.js'].lineData[240]++;
      c = c.superclass ? c.superclass.constructor : null;
    }
    _$jscoverage['/attribute.js'].lineData[243]++;
    initAttrs(self, config);
  }
  _$jscoverage['/attribute.js'].lineData[246]++;
  function wrapProtoForSuper(px, SubClass) {
    _$jscoverage['/attribute.js'].functionData[16]++;
    _$jscoverage['/attribute.js'].lineData[247]++;
    var hooks = visit29_247_1(SubClass.__hooks__ || {});
    _$jscoverage['/attribute.js'].lineData[249]++;
    for (var p in hooks) {
      _$jscoverage['/attribute.js'].lineData[250]++;
      if (visit30_250_1(p in px)) {
        _$jscoverage['/attribute.js'].lineData[251]++;
        px[p] = hooks[p](px[p]);
      }
    }
    _$jscoverage['/attribute.js'].lineData[254]++;
    S.each(px, function(v, p) {
  _$jscoverage['/attribute.js'].functionData[17]++;
  _$jscoverage['/attribute.js'].lineData[255]++;
  if (visit31_255_1(typeof v === 'function')) {
    _$jscoverage['/attribute.js'].lineData[256]++;
    var wrapped = 0;
    _$jscoverage['/attribute.js'].lineData[257]++;
    if (visit32_257_1(v.__owner__)) {
      _$jscoverage['/attribute.js'].lineData[258]++;
      var originalOwner = v.__owner__;
      _$jscoverage['/attribute.js'].lineData[259]++;
      delete v.__owner__;
      _$jscoverage['/attribute.js'].lineData[260]++;
      delete v.__name__;
      _$jscoverage['/attribute.js'].lineData[261]++;
      wrapped = v.__wrapped__ = 1;
      _$jscoverage['/attribute.js'].lineData[262]++;
      var newV = bind(v);
      _$jscoverage['/attribute.js'].lineData[263]++;
      newV.__owner__ = originalOwner;
      _$jscoverage['/attribute.js'].lineData[264]++;
      newV.__name__ = p;
      _$jscoverage['/attribute.js'].lineData[265]++;
      originalOwner.prototype[p] = newV;
    } else {
      _$jscoverage['/attribute.js'].lineData[266]++;
      if (visit33_266_1(v.__wrapped__)) {
        _$jscoverage['/attribute.js'].lineData[267]++;
        wrapped = 1;
      }
    }
    _$jscoverage['/attribute.js'].lineData[269]++;
    if (visit34_269_1(wrapped)) {
      _$jscoverage['/attribute.js'].lineData[270]++;
      px[p] = v = bind(v);
    }
    _$jscoverage['/attribute.js'].lineData[272]++;
    v.__owner__ = SubClass;
    _$jscoverage['/attribute.js'].lineData[273]++;
    v.__name__ = p;
  }
});
  }
  _$jscoverage['/attribute.js'].lineData[278]++;
  function addMembers(px) {
    _$jscoverage['/attribute.js'].functionData[18]++;
    _$jscoverage['/attribute.js'].lineData[279]++;
    var SubClass = this;
    _$jscoverage['/attribute.js'].lineData[280]++;
    wrapProtoForSuper(px, SubClass);
    _$jscoverage['/attribute.js'].lineData[281]++;
    S.mix(SubClass.prototype, px);
  }
  _$jscoverage['/attribute.js'].lineData[284]++;
  Attribute.extend = function extend(px, sx) {
  _$jscoverage['/attribute.js'].functionData[19]++;
  _$jscoverage['/attribute.js'].lineData[285]++;
  var SubClass, SuperClass = this;
  _$jscoverage['/attribute.js'].lineData[287]++;
  sx = visit35_287_1(sx || {});
  _$jscoverage['/attribute.js'].lineData[288]++;
  px = visit36_288_1(px || {});
  _$jscoverage['/attribute.js'].lineData[289]++;
  var hooks, sxHooks = sx.__hooks__;
  _$jscoverage['/attribute.js'].lineData[291]++;
  if ((hooks = SuperClass.__hooks__)) {
    _$jscoverage['/attribute.js'].lineData[292]++;
    sxHooks = sx.__hooks__ = visit37_292_1(sx.__hooks__ || {});
    _$jscoverage['/attribute.js'].lineData[293]++;
    S.mix(sxHooks, hooks, false);
  }
  _$jscoverage['/attribute.js'].lineData[295]++;
  var name = visit38_295_1(sx.name || 'AttributeDerived');
  _$jscoverage['/attribute.js'].lineData[296]++;
  if (visit39_296_1(px.hasOwnProperty('constructor'))) {
    _$jscoverage['/attribute.js'].lineData[297]++;
    SubClass = px.constructor;
  } else {
    _$jscoverage['/attribute.js'].lineData[301]++;
    if (visit40_301_1('@DEBUG@')) {
      _$jscoverage['/attribute.js'].lineData[303]++;
      SubClass = new Function('return function ' + camelCase(name) + '(){ ' + 'this.callSuper.apply(this, arguments);' + '}')();
    } else {
      _$jscoverage['/attribute.js'].lineData[307]++;
      SubClass = function() {
  _$jscoverage['/attribute.js'].functionData[20]++;
  _$jscoverage['/attribute.js'].lineData[308]++;
  this.callSuper.apply(this, arguments);
};
    }
  }
  _$jscoverage['/attribute.js'].lineData[312]++;
  px.constructor = SubClass;
  _$jscoverage['/attribute.js'].lineData[313]++;
  SubClass.__hooks__ = sxHooks;
  _$jscoverage['/attribute.js'].lineData[314]++;
  wrapProtoForSuper(px, SubClass);
  _$jscoverage['/attribute.js'].lineData[315]++;
  var inheritedStatics, sxInheritedStatics = sx.inheritedStatics;
  _$jscoverage['/attribute.js'].lineData[317]++;
  if ((inheritedStatics = SuperClass.inheritedStatics)) {
    _$jscoverage['/attribute.js'].lineData[318]++;
    sxInheritedStatics = sx.inheritedStatics = visit41_318_1(sx.inheritedStatics || {});
    _$jscoverage['/attribute.js'].lineData[319]++;
    S.mix(sxInheritedStatics, inheritedStatics, false);
  }
  _$jscoverage['/attribute.js'].lineData[321]++;
  S.extend(SubClass, SuperClass, px, sx);
  _$jscoverage['/attribute.js'].lineData[322]++;
  if (visit42_322_1(sxInheritedStatics)) {
    _$jscoverage['/attribute.js'].lineData[323]++;
    S.mix(SubClass, sxInheritedStatics);
  }
  _$jscoverage['/attribute.js'].lineData[325]++;
  SubClass.extend = visit43_325_1(sx.extend || extend);
  _$jscoverage['/attribute.js'].lineData[326]++;
  SubClass.addMembers = addMembers;
  _$jscoverage['/attribute.js'].lineData[327]++;
  return SubClass;
};
  _$jscoverage['/attribute.js'].lineData[330]++;
  function addAttrs(host, attrs) {
    _$jscoverage['/attribute.js'].functionData[21]++;
    _$jscoverage['/attribute.js'].lineData[331]++;
    if (visit44_331_1(attrs)) {
      _$jscoverage['/attribute.js'].lineData[332]++;
      for (var attr in attrs) {
        _$jscoverage['/attribute.js'].lineData[340]++;
        host.addAttr(attr, attrs[attr], false);
      }
    }
  }
  _$jscoverage['/attribute.js'].lineData[345]++;
  function initAttrs(host, config) {
    _$jscoverage['/attribute.js'].functionData[22]++;
    _$jscoverage['/attribute.js'].lineData[346]++;
    if (visit45_346_1(config)) {
      _$jscoverage['/attribute.js'].lineData[347]++;
      for (var attr in config) {
        _$jscoverage['/attribute.js'].lineData[349]++;
        host.setInternal(attr, config[attr]);
      }
    }
  }
  _$jscoverage['/attribute.js'].lineData[354]++;
  S.augment(Attribute, CustomEvent.Target, {
  INVALID: INVALID, 
  'callSuper': function() {
  _$jscoverage['/attribute.js'].functionData[23]++;
  _$jscoverage['/attribute.js'].lineData[358]++;
  var method, obj, self = this, args = arguments;
  _$jscoverage['/attribute.js'].lineData[362]++;
  if (visit46_362_1(visit47_362_2(typeof self === 'function') && self.__name__)) {
    _$jscoverage['/attribute.js'].lineData[363]++;
    method = self;
    _$jscoverage['/attribute.js'].lineData[364]++;
    obj = args[0];
    _$jscoverage['/attribute.js'].lineData[365]++;
    args = Array.prototype.slice.call(args, 1);
  } else {
    _$jscoverage['/attribute.js'].lineData[368]++;
    method = arguments.callee.caller;
    _$jscoverage['/attribute.js'].lineData[369]++;
    if (visit48_369_1(method.__wrapped__)) {
      _$jscoverage['/attribute.js'].lineData[370]++;
      method = method.caller;
    }
    _$jscoverage['/attribute.js'].lineData[372]++;
    obj = self;
  }
  _$jscoverage['/attribute.js'].lineData[375]++;
  var name = method.__name__;
  _$jscoverage['/attribute.js'].lineData[376]++;
  if (visit49_376_1(!name)) {
    _$jscoverage['/attribute.js'].lineData[378]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[380]++;
  var member = method.__owner__.superclass[name];
  _$jscoverage['/attribute.js'].lineData[381]++;
  if (visit50_381_1(!member)) {
    _$jscoverage['/attribute.js'].lineData[383]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[386]++;
  return member.apply(obj, visit51_386_1(args || []));
}, 
  getAttrs: function() {
  _$jscoverage['/attribute.js'].functionData[24]++;
  _$jscoverage['/attribute.js'].lineData[395]++;
  return visit52_395_1(this.__attrs || (this.__attrs = {}));
}, 
  getAttrVals: function() {
  _$jscoverage['/attribute.js'].functionData[25]++;
  _$jscoverage['/attribute.js'].lineData[403]++;
  var self = this, o = {}, a, attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[407]++;
  for (a in attrs) {
    _$jscoverage['/attribute.js'].lineData[408]++;
    o[a] = self.get(a);
  }
  _$jscoverage['/attribute.js'].lineData[410]++;
  return o;
}, 
  addAttr: function(name, attrConfig, override) {
  _$jscoverage['/attribute.js'].functionData[26]++;
  _$jscoverage['/attribute.js'].lineData[431]++;
  var self = this, attrs = self.getAttrs(), attr, cfg = S.clone(attrConfig);
  _$jscoverage['/attribute.js'].lineData[435]++;
  if ((attr = attrs[name])) {
    _$jscoverage['/attribute.js'].lineData[436]++;
    S.mix(attr, cfg, override);
  } else {
    _$jscoverage['/attribute.js'].lineData[438]++;
    attrs[name] = cfg;
  }
  _$jscoverage['/attribute.js'].lineData[440]++;
  return self;
}, 
  addAttrs: function(attrConfigs, initialValues) {
  _$jscoverage['/attribute.js'].functionData[27]++;
  _$jscoverage['/attribute.js'].lineData[450]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[451]++;
  S.each(attrConfigs, function(attrConfig, name) {
  _$jscoverage['/attribute.js'].functionData[28]++;
  _$jscoverage['/attribute.js'].lineData[452]++;
  self.addAttr(name, attrConfig);
});
  _$jscoverage['/attribute.js'].lineData[454]++;
  if (visit53_454_1(initialValues)) {
    _$jscoverage['/attribute.js'].lineData[455]++;
    self.set(initialValues);
  }
  _$jscoverage['/attribute.js'].lineData[457]++;
  return self;
}, 
  hasAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[29]++;
  _$jscoverage['/attribute.js'].lineData[466]++;
  return this.getAttrs().hasOwnProperty(name);
}, 
  removeAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[30]++;
  _$jscoverage['/attribute.js'].lineData[474]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[475]++;
  var __attrVals = getAttrVals(self);
  _$jscoverage['/attribute.js'].lineData[476]++;
  var __attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[478]++;
  if (visit54_478_1(self.hasAttr(name))) {
    _$jscoverage['/attribute.js'].lineData[479]++;
    delete __attrs[name];
    _$jscoverage['/attribute.js'].lineData[480]++;
    delete __attrVals[name];
  }
  _$jscoverage['/attribute.js'].lineData[483]++;
  return self;
}, 
  set: function(name, value, opts) {
  _$jscoverage['/attribute.js'].functionData[31]++;
  _$jscoverage['/attribute.js'].lineData[497]++;
  var self = this, e;
  _$jscoverage['/attribute.js'].lineData[498]++;
  if (visit55_498_1(S.isPlainObject(name))) {
    _$jscoverage['/attribute.js'].lineData[499]++;
    opts = value;
    _$jscoverage['/attribute.js'].lineData[500]++;
    opts = visit56_500_1(opts || {});
    _$jscoverage['/attribute.js'].lineData[501]++;
    var all = Object(name), attrs = [], errors = [];
    _$jscoverage['/attribute.js'].lineData[504]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[507]++;
      if (visit57_507_1((e = validate(self, name, all[name], all)) !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[508]++;
        errors.push(e);
      }
    }
    _$jscoverage['/attribute.js'].lineData[511]++;
    if (visit58_511_1(errors.length)) {
      _$jscoverage['/attribute.js'].lineData[512]++;
      if (visit59_512_1(opts.error)) {
        _$jscoverage['/attribute.js'].lineData[513]++;
        opts.error(errors);
      }
      _$jscoverage['/attribute.js'].lineData[515]++;
      return FALSE;
    }
    _$jscoverage['/attribute.js'].lineData[517]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[518]++;
      setInternal(self, name, all[name], opts, attrs);
    }
    _$jscoverage['/attribute.js'].lineData[520]++;
    var attrNames = [], prevVals = [], newVals = [], subAttrNames = [];
    _$jscoverage['/attribute.js'].lineData[524]++;
    S.each(attrs, function(attr) {
  _$jscoverage['/attribute.js'].functionData[32]++;
  _$jscoverage['/attribute.js'].lineData[525]++;
  prevVals.push(attr.prevVal);
  _$jscoverage['/attribute.js'].lineData[526]++;
  newVals.push(attr.newVal);
  _$jscoverage['/attribute.js'].lineData[527]++;
  attrNames.push(attr.attrName);
  _$jscoverage['/attribute.js'].lineData[528]++;
  subAttrNames.push(attr.subAttrName);
});
    _$jscoverage['/attribute.js'].lineData[530]++;
    if (visit60_530_1(attrNames.length)) {
      _$jscoverage['/attribute.js'].lineData[531]++;
      __fireAttrChange(self, '', '*', prevVals, newVals, subAttrNames, attrNames, opts.data);
    }
    _$jscoverage['/attribute.js'].lineData[540]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[542]++;
  opts = visit61_542_1(opts || {});
  _$jscoverage['/attribute.js'].lineData[544]++;
  e = validate(self, name, value);
  _$jscoverage['/attribute.js'].lineData[546]++;
  if (visit62_546_1(e !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[547]++;
    if (visit63_547_1(opts.error)) {
      _$jscoverage['/attribute.js'].lineData[548]++;
      opts.error(e);
    }
    _$jscoverage['/attribute.js'].lineData[550]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[552]++;
  return setInternal(self, name, value, opts);
}, 
  setInternal: function(name, value) {
  _$jscoverage['/attribute.js'].functionData[33]++;
  _$jscoverage['/attribute.js'].lineData[561]++;
  var self = this, setValue, attrConfig = ensureNonEmpty(self.getAttrs(), name), setter = attrConfig.setter;
  _$jscoverage['/attribute.js'].lineData[570]++;
  if (visit64_570_1(setter && (setter = normalFn(self, setter)))) {
    _$jscoverage['/attribute.js'].lineData[571]++;
    setValue = setter.call(self, value, name);
  }
  _$jscoverage['/attribute.js'].lineData[574]++;
  if (visit65_574_1(setValue === INVALID)) {
    _$jscoverage['/attribute.js'].lineData[575]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[578]++;
  if (visit66_578_1(setValue !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[579]++;
    value = setValue;
  }
  _$jscoverage['/attribute.js'].lineData[583]++;
  getAttrVals(self)[name] = value;
  _$jscoverage['/attribute.js'].lineData[585]++;
  return undefined;
}, 
  get: function(name) {
  _$jscoverage['/attribute.js'].functionData[34]++;
  _$jscoverage['/attribute.js'].lineData[594]++;
  var self = this, dot = '.', path, attrVals = getAttrVals(self), attrConfig, getter, ret;
  _$jscoverage['/attribute.js'].lineData[601]++;
  if (visit67_601_1(name.indexOf(dot) !== -1)) {
    _$jscoverage['/attribute.js'].lineData[602]++;
    path = name.split(dot);
    _$jscoverage['/attribute.js'].lineData[603]++;
    name = path.shift();
  }
  _$jscoverage['/attribute.js'].lineData[606]++;
  attrConfig = ensureNonEmpty(self.getAttrs(), name, 1);
  _$jscoverage['/attribute.js'].lineData[607]++;
  getter = attrConfig.getter;
  _$jscoverage['/attribute.js'].lineData[611]++;
  ret = name in attrVals ? attrVals[name] : getDefAttrVal(self, name);
  _$jscoverage['/attribute.js'].lineData[616]++;
  if (visit68_616_1(getter && (getter = normalFn(self, getter)))) {
    _$jscoverage['/attribute.js'].lineData[617]++;
    ret = getter.call(self, ret, name);
  }
  _$jscoverage['/attribute.js'].lineData[620]++;
  if (visit69_620_1(!(name in attrVals) && visit70_620_2(ret !== undefined))) {
    _$jscoverage['/attribute.js'].lineData[621]++;
    attrVals[name] = ret;
  }
  _$jscoverage['/attribute.js'].lineData[624]++;
  if (visit71_624_1(path)) {
    _$jscoverage['/attribute.js'].lineData[625]++;
    ret = getValueByPath(ret, path);
  }
  _$jscoverage['/attribute.js'].lineData[628]++;
  return ret;
}, 
  reset: function(name, opts) {
  _$jscoverage['/attribute.js'].functionData[35]++;
  _$jscoverage['/attribute.js'].lineData[640]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[642]++;
  if (visit72_642_1(typeof name === 'string')) {
    _$jscoverage['/attribute.js'].lineData[643]++;
    if (visit73_643_1(self.hasAttr(name))) {
      _$jscoverage['/attribute.js'].lineData[645]++;
      return self.set(name, getDefAttrVal(self, name), opts);
    } else {
      _$jscoverage['/attribute.js'].lineData[648]++;
      return self;
    }
  }
  _$jscoverage['/attribute.js'].lineData[652]++;
  opts = (name);
  _$jscoverage['/attribute.js'].lineData[655]++;
  var attrs = self.getAttrs(), values = {};
  _$jscoverage['/attribute.js'].lineData[659]++;
  for (name in attrs) {
    _$jscoverage['/attribute.js'].lineData[660]++;
    values[name] = getDefAttrVal(self, name);
  }
  _$jscoverage['/attribute.js'].lineData[663]++;
  self.set(values, opts);
  _$jscoverage['/attribute.js'].lineData[664]++;
  return self;
}});
  _$jscoverage['/attribute.js'].lineData[669]++;
  function getDefAttrVal(self, name) {
    _$jscoverage['/attribute.js'].functionData[36]++;
    _$jscoverage['/attribute.js'].lineData[670]++;
    var attrs = self.getAttrs(), attrConfig = ensureNonEmpty(attrs, name, 1), valFn = attrConfig.valueFn, val;
    _$jscoverage['/attribute.js'].lineData[675]++;
    if (visit74_675_1(valFn && (valFn = normalFn(self, valFn)))) {
      _$jscoverage['/attribute.js'].lineData[676]++;
      val = valFn.call(self);
      _$jscoverage['/attribute.js'].lineData[677]++;
      if (visit75_677_1(val !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[681]++;
        attrConfig.value = val;
      }
      _$jscoverage['/attribute.js'].lineData[683]++;
      delete attrConfig.valueFn;
      _$jscoverage['/attribute.js'].lineData[684]++;
      attrs[name] = attrConfig;
    }
    _$jscoverage['/attribute.js'].lineData[687]++;
    return attrConfig.value;
  }
  _$jscoverage['/attribute.js'].lineData[690]++;
  function validate(self, name, value, all) {
    _$jscoverage['/attribute.js'].functionData[37]++;
    _$jscoverage['/attribute.js'].lineData[691]++;
    var path, prevVal, pathNamePair;
    _$jscoverage['/attribute.js'].lineData[693]++;
    pathNamePair = getPathNamePair(name);
    _$jscoverage['/attribute.js'].lineData[695]++;
    name = pathNamePair.name;
    _$jscoverage['/attribute.js'].lineData[696]++;
    path = pathNamePair.path;
    _$jscoverage['/attribute.js'].lineData[698]++;
    if (visit76_698_1(path)) {
      _$jscoverage['/attribute.js'].lineData[699]++;
      prevVal = self.get(name);
      _$jscoverage['/attribute.js'].lineData[700]++;
      value = getValueBySubValue(prevVal, path, value);
    }
    _$jscoverage['/attribute.js'].lineData[702]++;
    var attrConfig = ensureNonEmpty(self.getAttrs(), name), e, validator = attrConfig.validator;
    _$jscoverage['/attribute.js'].lineData[705]++;
    if (visit77_705_1(validator && (validator = normalFn(self, validator)))) {
      _$jscoverage['/attribute.js'].lineData[706]++;
      e = validator.call(self, value, name, all);
      _$jscoverage['/attribute.js'].lineData[708]++;
      if (visit78_708_1(visit79_708_2(e !== undefined) && visit80_708_3(e !== true))) {
        _$jscoverage['/attribute.js'].lineData[709]++;
        return e;
      }
    }
    _$jscoverage['/attribute.js'].lineData[712]++;
    return undefined;
  }
});
