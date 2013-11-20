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
  _$jscoverage['/attribute.js'].lineData[10] = 0;
  _$jscoverage['/attribute.js'].lineData[12] = 0;
  _$jscoverage['/attribute.js'].lineData[14] = 0;
  _$jscoverage['/attribute.js'].lineData[15] = 0;
  _$jscoverage['/attribute.js'].lineData[18] = 0;
  _$jscoverage['/attribute.js'].lineData[19] = 0;
  _$jscoverage['/attribute.js'].lineData[23] = 0;
  _$jscoverage['/attribute.js'].lineData[25] = 0;
  _$jscoverage['/attribute.js'].lineData[27] = 0;
  _$jscoverage['/attribute.js'].lineData[28] = 0;
  _$jscoverage['/attribute.js'].lineData[29] = 0;
  _$jscoverage['/attribute.js'].lineData[31] = 0;
  _$jscoverage['/attribute.js'].lineData[34] = 0;
  _$jscoverage['/attribute.js'].lineData[35] = 0;
  _$jscoverage['/attribute.js'].lineData[38] = 0;
  _$jscoverage['/attribute.js'].lineData[39] = 0;
  _$jscoverage['/attribute.js'].lineData[43] = 0;
  _$jscoverage['/attribute.js'].lineData[44] = 0;
  _$jscoverage['/attribute.js'].lineData[45] = 0;
  _$jscoverage['/attribute.js'].lineData[53] = 0;
  _$jscoverage['/attribute.js'].lineData[54] = 0;
  _$jscoverage['/attribute.js'].lineData[55] = 0;
  _$jscoverage['/attribute.js'].lineData[56] = 0;
  _$jscoverage['/attribute.js'].lineData[58] = 0;
  _$jscoverage['/attribute.js'].lineData[64] = 0;
  _$jscoverage['/attribute.js'].lineData[65] = 0;
  _$jscoverage['/attribute.js'].lineData[68] = 0;
  _$jscoverage['/attribute.js'].lineData[70] = 0;
  _$jscoverage['/attribute.js'].lineData[76] = 0;
  _$jscoverage['/attribute.js'].lineData[77] = 0;
  _$jscoverage['/attribute.js'].lineData[79] = 0;
  _$jscoverage['/attribute.js'].lineData[80] = 0;
  _$jscoverage['/attribute.js'].lineData[81] = 0;
  _$jscoverage['/attribute.js'].lineData[83] = 0;
  _$jscoverage['/attribute.js'].lineData[84] = 0;
  _$jscoverage['/attribute.js'].lineData[86] = 0;
  _$jscoverage['/attribute.js'].lineData[89] = 0;
  _$jscoverage['/attribute.js'].lineData[92] = 0;
  _$jscoverage['/attribute.js'].lineData[93] = 0;
  _$jscoverage['/attribute.js'].lineData[95] = 0;
  _$jscoverage['/attribute.js'].lineData[96] = 0;
  _$jscoverage['/attribute.js'].lineData[97] = 0;
  _$jscoverage['/attribute.js'].lineData[100] = 0;
  _$jscoverage['/attribute.js'].lineData[106] = 0;
  _$jscoverage['/attribute.js'].lineData[107] = 0;
  _$jscoverage['/attribute.js'].lineData[108] = 0;
  _$jscoverage['/attribute.js'].lineData[109] = 0;
  _$jscoverage['/attribute.js'].lineData[110] = 0;
  _$jscoverage['/attribute.js'].lineData[112] = 0;
  _$jscoverage['/attribute.js'].lineData[114] = 0;
  _$jscoverage['/attribute.js'].lineData[116] = 0;
  _$jscoverage['/attribute.js'].lineData[119] = 0;
  _$jscoverage['/attribute.js'].lineData[120] = 0;
  _$jscoverage['/attribute.js'].lineData[121] = 0;
  _$jscoverage['/attribute.js'].lineData[122] = 0;
  _$jscoverage['/attribute.js'].lineData[124] = 0;
  _$jscoverage['/attribute.js'].lineData[125] = 0;
  _$jscoverage['/attribute.js'].lineData[126] = 0;
  _$jscoverage['/attribute.js'].lineData[131] = 0;
  _$jscoverage['/attribute.js'].lineData[132] = 0;
  _$jscoverage['/attribute.js'].lineData[138] = 0;
  _$jscoverage['/attribute.js'].lineData[139] = 0;
  _$jscoverage['/attribute.js'].lineData[140] = 0;
  _$jscoverage['/attribute.js'].lineData[142] = 0;
  _$jscoverage['/attribute.js'].lineData[144] = 0;
  _$jscoverage['/attribute.js'].lineData[145] = 0;
  _$jscoverage['/attribute.js'].lineData[150] = 0;
  _$jscoverage['/attribute.js'].lineData[151] = 0;
  _$jscoverage['/attribute.js'].lineData[152] = 0;
  _$jscoverage['/attribute.js'].lineData[153] = 0;
  _$jscoverage['/attribute.js'].lineData[154] = 0;
  _$jscoverage['/attribute.js'].lineData[158] = 0;
  _$jscoverage['/attribute.js'].lineData[160] = 0;
  _$jscoverage['/attribute.js'].lineData[171] = 0;
  _$jscoverage['/attribute.js'].lineData[172] = 0;
  _$jscoverage['/attribute.js'].lineData[173] = 0;
  _$jscoverage['/attribute.js'].lineData[176] = 0;
  _$jscoverage['/attribute.js'].lineData[177] = 0;
  _$jscoverage['/attribute.js'].lineData[181] = 0;
  _$jscoverage['/attribute.js'].lineData[184] = 0;
  _$jscoverage['/attribute.js'].lineData[186] = 0;
  _$jscoverage['/attribute.js'].lineData[187] = 0;
  _$jscoverage['/attribute.js'].lineData[189] = 0;
  _$jscoverage['/attribute.js'].lineData[198] = 0;
  _$jscoverage['/attribute.js'].lineData[200] = 0;
  _$jscoverage['/attribute.js'].lineData[201] = 0;
  _$jscoverage['/attribute.js'].lineData[205] = 0;
  _$jscoverage['/attribute.js'].lineData[206] = 0;
  _$jscoverage['/attribute.js'].lineData[207] = 0;
  _$jscoverage['/attribute.js'].lineData[208] = 0;
  _$jscoverage['/attribute.js'].lineData[209] = 0;
  _$jscoverage['/attribute.js'].lineData[216] = 0;
  _$jscoverage['/attribute.js'].lineData[224] = 0;
  _$jscoverage['/attribute.js'].lineData[227] = 0;
  _$jscoverage['/attribute.js'].lineData[228] = 0;
  _$jscoverage['/attribute.js'].lineData[231] = 0;
  _$jscoverage['/attribute.js'].lineData[233] = 0;
  _$jscoverage['/attribute.js'].lineData[234] = 0;
  _$jscoverage['/attribute.js'].lineData[235] = 0;
  _$jscoverage['/attribute.js'].lineData[238] = 0;
  _$jscoverage['/attribute.js'].lineData[241] = 0;
  _$jscoverage['/attribute.js'].lineData[242] = 0;
  _$jscoverage['/attribute.js'].lineData[244] = 0;
  _$jscoverage['/attribute.js'].lineData[245] = 0;
  _$jscoverage['/attribute.js'].lineData[246] = 0;
  _$jscoverage['/attribute.js'].lineData[249] = 0;
  _$jscoverage['/attribute.js'].lineData[250] = 0;
  _$jscoverage['/attribute.js'].lineData[251] = 0;
  _$jscoverage['/attribute.js'].lineData[252] = 0;
  _$jscoverage['/attribute.js'].lineData[253] = 0;
  _$jscoverage['/attribute.js'].lineData[254] = 0;
  _$jscoverage['/attribute.js'].lineData[255] = 0;
  _$jscoverage['/attribute.js'].lineData[256] = 0;
  _$jscoverage['/attribute.js'].lineData[257] = 0;
  _$jscoverage['/attribute.js'].lineData[258] = 0;
  _$jscoverage['/attribute.js'].lineData[259] = 0;
  _$jscoverage['/attribute.js'].lineData[260] = 0;
  _$jscoverage['/attribute.js'].lineData[261] = 0;
  _$jscoverage['/attribute.js'].lineData[262] = 0;
  _$jscoverage['/attribute.js'].lineData[264] = 0;
  _$jscoverage['/attribute.js'].lineData[265] = 0;
  _$jscoverage['/attribute.js'].lineData[267] = 0;
  _$jscoverage['/attribute.js'].lineData[268] = 0;
  _$jscoverage['/attribute.js'].lineData[273] = 0;
  _$jscoverage['/attribute.js'].lineData[274] = 0;
  _$jscoverage['/attribute.js'].lineData[275] = 0;
  _$jscoverage['/attribute.js'].lineData[276] = 0;
  _$jscoverage['/attribute.js'].lineData[279] = 0;
  _$jscoverage['/attribute.js'].lineData[280] = 0;
  _$jscoverage['/attribute.js'].lineData[282] = 0;
  _$jscoverage['/attribute.js'].lineData[283] = 0;
  _$jscoverage['/attribute.js'].lineData[284] = 0;
  _$jscoverage['/attribute.js'].lineData[286] = 0;
  _$jscoverage['/attribute.js'].lineData[287] = 0;
  _$jscoverage['/attribute.js'].lineData[288] = 0;
  _$jscoverage['/attribute.js'].lineData[290] = 0;
  _$jscoverage['/attribute.js'].lineData[291] = 0;
  _$jscoverage['/attribute.js'].lineData[292] = 0;
  _$jscoverage['/attribute.js'].lineData[296] = 0;
  _$jscoverage['/attribute.js'].lineData[297] = 0;
  _$jscoverage['/attribute.js'].lineData[300] = 0;
  _$jscoverage['/attribute.js'].lineData[301] = 0;
  _$jscoverage['/attribute.js'].lineData[305] = 0;
  _$jscoverage['/attribute.js'].lineData[306] = 0;
  _$jscoverage['/attribute.js'].lineData[307] = 0;
  _$jscoverage['/attribute.js'].lineData[308] = 0;
  _$jscoverage['/attribute.js'].lineData[310] = 0;
  _$jscoverage['/attribute.js'].lineData[311] = 0;
  _$jscoverage['/attribute.js'].lineData[312] = 0;
  _$jscoverage['/attribute.js'].lineData[314] = 0;
  _$jscoverage['/attribute.js'].lineData[315] = 0;
  _$jscoverage['/attribute.js'].lineData[316] = 0;
  _$jscoverage['/attribute.js'].lineData[318] = 0;
  _$jscoverage['/attribute.js'].lineData[319] = 0;
  _$jscoverage['/attribute.js'].lineData[320] = 0;
  _$jscoverage['/attribute.js'].lineData[323] = 0;
  _$jscoverage['/attribute.js'].lineData[324] = 0;
  _$jscoverage['/attribute.js'].lineData[325] = 0;
  _$jscoverage['/attribute.js'].lineData[333] = 0;
  _$jscoverage['/attribute.js'].lineData[338] = 0;
  _$jscoverage['/attribute.js'].lineData[339] = 0;
  _$jscoverage['/attribute.js'].lineData[340] = 0;
  _$jscoverage['/attribute.js'].lineData[342] = 0;
  _$jscoverage['/attribute.js'].lineData[347] = 0;
  _$jscoverage['/attribute.js'].lineData[351] = 0;
  _$jscoverage['/attribute.js'].lineData[355] = 0;
  _$jscoverage['/attribute.js'].lineData[356] = 0;
  _$jscoverage['/attribute.js'].lineData[357] = 0;
  _$jscoverage['/attribute.js'].lineData[358] = 0;
  _$jscoverage['/attribute.js'].lineData[360] = 0;
  _$jscoverage['/attribute.js'].lineData[361] = 0;
  _$jscoverage['/attribute.js'].lineData[362] = 0;
  _$jscoverage['/attribute.js'].lineData[364] = 0;
  _$jscoverage['/attribute.js'].lineData[367] = 0;
  _$jscoverage['/attribute.js'].lineData[368] = 0;
  _$jscoverage['/attribute.js'].lineData[370] = 0;
  _$jscoverage['/attribute.js'].lineData[372] = 0;
  _$jscoverage['/attribute.js'].lineData[373] = 0;
  _$jscoverage['/attribute.js'].lineData[375] = 0;
  _$jscoverage['/attribute.js'].lineData[378] = 0;
  _$jscoverage['/attribute.js'].lineData[387] = 0;
  _$jscoverage['/attribute.js'].lineData[395] = 0;
  _$jscoverage['/attribute.js'].lineData[399] = 0;
  _$jscoverage['/attribute.js'].lineData[400] = 0;
  _$jscoverage['/attribute.js'].lineData[402] = 0;
  _$jscoverage['/attribute.js'].lineData[423] = 0;
  _$jscoverage['/attribute.js'].lineData[427] = 0;
  _$jscoverage['/attribute.js'].lineData[428] = 0;
  _$jscoverage['/attribute.js'].lineData[430] = 0;
  _$jscoverage['/attribute.js'].lineData[432] = 0;
  _$jscoverage['/attribute.js'].lineData[442] = 0;
  _$jscoverage['/attribute.js'].lineData[443] = 0;
  _$jscoverage['/attribute.js'].lineData[444] = 0;
  _$jscoverage['/attribute.js'].lineData[446] = 0;
  _$jscoverage['/attribute.js'].lineData[447] = 0;
  _$jscoverage['/attribute.js'].lineData[449] = 0;
  _$jscoverage['/attribute.js'].lineData[458] = 0;
  _$jscoverage['/attribute.js'].lineData[466] = 0;
  _$jscoverage['/attribute.js'].lineData[467] = 0;
  _$jscoverage['/attribute.js'].lineData[468] = 0;
  _$jscoverage['/attribute.js'].lineData[470] = 0;
  _$jscoverage['/attribute.js'].lineData[471] = 0;
  _$jscoverage['/attribute.js'].lineData[472] = 0;
  _$jscoverage['/attribute.js'].lineData[475] = 0;
  _$jscoverage['/attribute.js'].lineData[489] = 0;
  _$jscoverage['/attribute.js'].lineData[490] = 0;
  _$jscoverage['/attribute.js'].lineData[491] = 0;
  _$jscoverage['/attribute.js'].lineData[492] = 0;
  _$jscoverage['/attribute.js'].lineData[493] = 0;
  _$jscoverage['/attribute.js'].lineData[497] = 0;
  _$jscoverage['/attribute.js'].lineData[500] = 0;
  _$jscoverage['/attribute.js'].lineData[501] = 0;
  _$jscoverage['/attribute.js'].lineData[504] = 0;
  _$jscoverage['/attribute.js'].lineData[505] = 0;
  _$jscoverage['/attribute.js'].lineData[506] = 0;
  _$jscoverage['/attribute.js'].lineData[508] = 0;
  _$jscoverage['/attribute.js'].lineData[510] = 0;
  _$jscoverage['/attribute.js'].lineData[511] = 0;
  _$jscoverage['/attribute.js'].lineData[513] = 0;
  _$jscoverage['/attribute.js'].lineData[517] = 0;
  _$jscoverage['/attribute.js'].lineData[518] = 0;
  _$jscoverage['/attribute.js'].lineData[519] = 0;
  _$jscoverage['/attribute.js'].lineData[520] = 0;
  _$jscoverage['/attribute.js'].lineData[521] = 0;
  _$jscoverage['/attribute.js'].lineData[523] = 0;
  _$jscoverage['/attribute.js'].lineData[524] = 0;
  _$jscoverage['/attribute.js'].lineData[533] = 0;
  _$jscoverage['/attribute.js'].lineData[535] = 0;
  _$jscoverage['/attribute.js'].lineData[537] = 0;
  _$jscoverage['/attribute.js'].lineData[539] = 0;
  _$jscoverage['/attribute.js'].lineData[540] = 0;
  _$jscoverage['/attribute.js'].lineData[541] = 0;
  _$jscoverage['/attribute.js'].lineData[543] = 0;
  _$jscoverage['/attribute.js'].lineData[545] = 0;
  _$jscoverage['/attribute.js'].lineData[554] = 0;
  _$jscoverage['/attribute.js'].lineData[564] = 0;
  _$jscoverage['/attribute.js'].lineData[565] = 0;
  _$jscoverage['/attribute.js'].lineData[568] = 0;
  _$jscoverage['/attribute.js'].lineData[569] = 0;
  _$jscoverage['/attribute.js'].lineData[572] = 0;
  _$jscoverage['/attribute.js'].lineData[573] = 0;
  _$jscoverage['/attribute.js'].lineData[577] = 0;
  _$jscoverage['/attribute.js'].lineData[579] = 0;
  _$jscoverage['/attribute.js'].lineData[588] = 0;
  _$jscoverage['/attribute.js'].lineData[595] = 0;
  _$jscoverage['/attribute.js'].lineData[596] = 0;
  _$jscoverage['/attribute.js'].lineData[597] = 0;
  _$jscoverage['/attribute.js'].lineData[600] = 0;
  _$jscoverage['/attribute.js'].lineData[601] = 0;
  _$jscoverage['/attribute.js'].lineData[605] = 0;
  _$jscoverage['/attribute.js'].lineData[610] = 0;
  _$jscoverage['/attribute.js'].lineData[611] = 0;
  _$jscoverage['/attribute.js'].lineData[614] = 0;
  _$jscoverage['/attribute.js'].lineData[615] = 0;
  _$jscoverage['/attribute.js'].lineData[618] = 0;
  _$jscoverage['/attribute.js'].lineData[619] = 0;
  _$jscoverage['/attribute.js'].lineData[622] = 0;
  _$jscoverage['/attribute.js'].lineData[634] = 0;
  _$jscoverage['/attribute.js'].lineData[636] = 0;
  _$jscoverage['/attribute.js'].lineData[637] = 0;
  _$jscoverage['/attribute.js'].lineData[639] = 0;
  _$jscoverage['/attribute.js'].lineData[642] = 0;
  _$jscoverage['/attribute.js'].lineData[646] = 0;
  _$jscoverage['/attribute.js'].lineData[649] = 0;
  _$jscoverage['/attribute.js'].lineData[653] = 0;
  _$jscoverage['/attribute.js'].lineData[654] = 0;
  _$jscoverage['/attribute.js'].lineData[657] = 0;
  _$jscoverage['/attribute.js'].lineData[658] = 0;
  _$jscoverage['/attribute.js'].lineData[663] = 0;
  _$jscoverage['/attribute.js'].lineData[664] = 0;
  _$jscoverage['/attribute.js'].lineData[669] = 0;
  _$jscoverage['/attribute.js'].lineData[670] = 0;
  _$jscoverage['/attribute.js'].lineData[671] = 0;
  _$jscoverage['/attribute.js'].lineData[675] = 0;
  _$jscoverage['/attribute.js'].lineData[677] = 0;
  _$jscoverage['/attribute.js'].lineData[678] = 0;
  _$jscoverage['/attribute.js'].lineData[681] = 0;
  _$jscoverage['/attribute.js'].lineData[684] = 0;
  _$jscoverage['/attribute.js'].lineData[685] = 0;
  _$jscoverage['/attribute.js'].lineData[687] = 0;
  _$jscoverage['/attribute.js'].lineData[689] = 0;
  _$jscoverage['/attribute.js'].lineData[690] = 0;
  _$jscoverage['/attribute.js'].lineData[692] = 0;
  _$jscoverage['/attribute.js'].lineData[693] = 0;
  _$jscoverage['/attribute.js'].lineData[694] = 0;
  _$jscoverage['/attribute.js'].lineData[696] = 0;
  _$jscoverage['/attribute.js'].lineData[699] = 0;
  _$jscoverage['/attribute.js'].lineData[700] = 0;
  _$jscoverage['/attribute.js'].lineData[702] = 0;
  _$jscoverage['/attribute.js'].lineData[703] = 0;
  _$jscoverage['/attribute.js'].lineData[706] = 0;
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
  _$jscoverage['/attribute.js'].branchData['28'] = [];
  _$jscoverage['/attribute.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['35'] = [];
  _$jscoverage['/attribute.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['44'] = [];
  _$jscoverage['/attribute.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['55'] = [];
  _$jscoverage['/attribute.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['58'] = [];
  _$jscoverage['/attribute.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['66'] = [];
  _$jscoverage['/attribute.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['66'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['66'][3] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['79'] = [];
  _$jscoverage['/attribute.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['80'] = [];
  _$jscoverage['/attribute.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['83'] = [];
  _$jscoverage['/attribute.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['95'] = [];
  _$jscoverage['/attribute.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['108'] = [];
  _$jscoverage['/attribute.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['109'] = [];
  _$jscoverage['/attribute.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['121'] = [];
  _$jscoverage['/attribute.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['144'] = [];
  _$jscoverage['/attribute.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['150'] = [];
  _$jscoverage['/attribute.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['151'] = [];
  _$jscoverage['/attribute.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['151'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['153'] = [];
  _$jscoverage['/attribute.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['153'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['171'] = [];
  _$jscoverage['/attribute.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['172'] = [];
  _$jscoverage['/attribute.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['176'] = [];
  _$jscoverage['/attribute.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['186'] = [];
  _$jscoverage['/attribute.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['200'] = [];
  _$jscoverage['/attribute.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['205'] = [];
  _$jscoverage['/attribute.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['208'] = [];
  _$jscoverage['/attribute.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['242'] = [];
  _$jscoverage['/attribute.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['245'] = [];
  _$jscoverage['/attribute.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['250'] = [];
  _$jscoverage['/attribute.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['252'] = [];
  _$jscoverage['/attribute.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['261'] = [];
  _$jscoverage['/attribute.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['264'] = [];
  _$jscoverage['/attribute.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['282'] = [];
  _$jscoverage['/attribute.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['283'] = [];
  _$jscoverage['/attribute.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['286'] = [];
  _$jscoverage['/attribute.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['287'] = [];
  _$jscoverage['/attribute.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['290'] = [];
  _$jscoverage['/attribute.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['291'] = [];
  _$jscoverage['/attribute.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['296'] = [];
  _$jscoverage['/attribute.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['310'] = [];
  _$jscoverage['/attribute.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['311'] = [];
  _$jscoverage['/attribute.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['315'] = [];
  _$jscoverage['/attribute.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['318'] = [];
  _$jscoverage['/attribute.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['324'] = [];
  _$jscoverage['/attribute.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['339'] = [];
  _$jscoverage['/attribute.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['355'] = [];
  _$jscoverage['/attribute.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['355'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['361'] = [];
  _$jscoverage['/attribute.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['368'] = [];
  _$jscoverage['/attribute.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['373'] = [];
  _$jscoverage['/attribute.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['378'] = [];
  _$jscoverage['/attribute.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['387'] = [];
  _$jscoverage['/attribute.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['427'] = [];
  _$jscoverage['/attribute.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['446'] = [];
  _$jscoverage['/attribute.js'].branchData['446'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['470'] = [];
  _$jscoverage['/attribute.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['490'] = [];
  _$jscoverage['/attribute.js'].branchData['490'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['492'] = [];
  _$jscoverage['/attribute.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['500'] = [];
  _$jscoverage['/attribute.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['504'] = [];
  _$jscoverage['/attribute.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['505'] = [];
  _$jscoverage['/attribute.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['523'] = [];
  _$jscoverage['/attribute.js'].branchData['523'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['535'] = [];
  _$jscoverage['/attribute.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['539'] = [];
  _$jscoverage['/attribute.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['540'] = [];
  _$jscoverage['/attribute.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['564'] = [];
  _$jscoverage['/attribute.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['568'] = [];
  _$jscoverage['/attribute.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['572'] = [];
  _$jscoverage['/attribute.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['595'] = [];
  _$jscoverage['/attribute.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['610'] = [];
  _$jscoverage['/attribute.js'].branchData['610'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['614'] = [];
  _$jscoverage['/attribute.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['614'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['618'] = [];
  _$jscoverage['/attribute.js'].branchData['618'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['636'] = [];
  _$jscoverage['/attribute.js'].branchData['636'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['637'] = [];
  _$jscoverage['/attribute.js'].branchData['637'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['669'] = [];
  _$jscoverage['/attribute.js'].branchData['669'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['671'] = [];
  _$jscoverage['/attribute.js'].branchData['671'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['692'] = [];
  _$jscoverage['/attribute.js'].branchData['692'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['699'] = [];
  _$jscoverage['/attribute.js'].branchData['699'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['702'] = [];
  _$jscoverage['/attribute.js'].branchData['702'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['702'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['702'][3] = new BranchData();
}
_$jscoverage['/attribute.js'].branchData['702'][3].init(148, 10, 'e !== true');
function visit83_702_3(result) {
  _$jscoverage['/attribute.js'].branchData['702'][3].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['702'][2].init(129, 15, 'e !== undefined');
function visit82_702_2(result) {
  _$jscoverage['/attribute.js'].branchData['702'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['702'][1].init(129, 29, 'e !== undefined && e !== true');
function visit81_702_1(result) {
  _$jscoverage['/attribute.js'].branchData['702'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['699'][1].init(429, 52, 'validator && (validator = normalFn(self, validator))');
function visit80_699_1(result) {
  _$jscoverage['/attribute.js'].branchData['699'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['692'][1].init(171, 4, 'path');
function visit79_692_1(result) {
  _$jscoverage['/attribute.js'].branchData['692'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['671'][1].init(53, 85, 'val !== undefined');
function visit78_671_1(result) {
  _$jscoverage['/attribute.js'].branchData['671'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['669'][1].init(165, 40, 'valFn && (valFn = normalFn(self, valFn))');
function visit77_669_1(result) {
  _$jscoverage['/attribute.js'].branchData['669'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['637'][1].init(21, 18, 'self.hasAttr(name)');
function visit76_637_1(result) {
  _$jscoverage['/attribute.js'].branchData['637'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['636'][1].init(47, 23, 'typeof name == \'string\'');
function visit75_636_1(result) {
  _$jscoverage['/attribute.js'].branchData['636'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['618'][1].init(947, 4, 'path');
function visit74_618_1(result) {
  _$jscoverage['/attribute.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['614'][2].init(857, 17, 'ret !== undefined');
function visit73_614_2(result) {
  _$jscoverage['/attribute.js'].branchData['614'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['614'][1].init(834, 40, '!(name in attrVals) && ret !== undefined');
function visit72_614_1(result) {
  _$jscoverage['/attribute.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['610'][1].init(704, 43, 'getter && (getter = normalFn(self, getter))');
function visit71_610_1(result) {
  _$jscoverage['/attribute.js'].branchData['610'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['595'][1].init(199, 24, 'name.indexOf(dot) !== -1');
function visit70_595_1(result) {
  _$jscoverage['/attribute.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['572'][1].init(700, 22, 'setValue !== undefined');
function visit69_572_1(result) {
  _$jscoverage['/attribute.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['568'][1].init(615, 20, 'setValue === INVALID');
function visit68_568_1(result) {
  _$jscoverage['/attribute.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['564'][1].init(478, 43, 'setter && (setter = normalFn(self, setter))');
function visit67_564_1(result) {
  _$jscoverage['/attribute.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['540'][1].init(21, 13, 'opts[\'error\']');
function visit66_540_1(result) {
  _$jscoverage['/attribute.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['539'][1].init(1806, 15, 'e !== undefined');
function visit65_539_1(result) {
  _$jscoverage['/attribute.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['535'][1].init(1701, 10, 'opts || {}');
function visit64_535_1(result) {
  _$jscoverage['/attribute.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['523'][1].init(1255, 16, 'attrNames.length');
function visit63_523_1(result) {
  _$jscoverage['/attribute.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['505'][1].init(25, 13, 'opts[\'error\']');
function visit62_505_1(result) {
  _$jscoverage['/attribute.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['504'][1].init(517, 13, 'errors.length');
function visit61_504_1(result) {
  _$jscoverage['/attribute.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['500'][1].init(129, 55, '(e = validate(self, name, all[name], all)) !== undefined');
function visit60_500_1(result) {
  _$jscoverage['/attribute.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['492'][1].init(54, 10, 'opts || {}');
function visit59_492_1(result) {
  _$jscoverage['/attribute.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['490'][1].init(46, 21, 'S.isPlainObject(name)');
function visit58_490_1(result) {
  _$jscoverage['/attribute.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['470'][1].init(138, 18, 'self.hasAttr(name)');
function visit57_470_1(result) {
  _$jscoverage['/attribute.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['446'][1].init(172, 13, 'initialValues');
function visit56_446_1(result) {
  _$jscoverage['/attribute.js'].branchData['446'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['427'][1].init(152, 18, 'attr = attrs[name]');
function visit55_427_1(result) {
  _$jscoverage['/attribute.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['387'][1].init(20, 35, 'this.__attrs || (this.__attrs = {})');
function visit54_387_1(result) {
  _$jscoverage['/attribute.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['378'][1].init(1006, 10, 'args || []');
function visit53_378_1(result) {
  _$jscoverage['/attribute.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['373'][1].init(806, 7, '!member');
function visit52_373_1(result) {
  _$jscoverage['/attribute.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['368'][1].init(552, 5, '!name');
function visit51_368_1(result) {
  _$jscoverage['/attribute.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['361'][1].init(71, 18, 'method.__wrapped__');
function visit50_361_1(result) {
  _$jscoverage['/attribute.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['355'][2].init(110, 25, 'typeof self == \'function\'');
function visit49_355_2(result) {
  _$jscoverage['/attribute.js'].branchData['355'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['355'][1].init(110, 42, 'typeof self == \'function\' && self.__name__');
function visit48_355_1(result) {
  _$jscoverage['/attribute.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['339'][1].init(13, 6, 'config');
function visit47_339_1(result) {
  _$jscoverage['/attribute.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['324'][1].init(13, 5, 'attrs');
function visit46_324_1(result) {
  _$jscoverage['/attribute.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['318'][1].init(1497, 19, 'sx.extend || extend');
function visit45_318_1(result) {
  _$jscoverage['/attribute.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['315'][1].init(1390, 18, 'sxInheritedStatics');
function visit44_315_1(result) {
  _$jscoverage['/attribute.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['311'][1].init(56, 25, 'sx.inheritedStatics || {}');
function visit43_311_1(result) {
  _$jscoverage['/attribute.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['310'][1].init(1124, 46, 'inheritedStatics = SuperClass.inheritedStatics');
function visit42_310_1(result) {
  _$jscoverage['/attribute.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['296'][1].init(138, 9, '\'@DEBUG@\'');
function visit41_296_1(result) {
  _$jscoverage['/attribute.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['291'][1].init(371, 32, 'px.hasOwnProperty(\'constructor\')');
function visit40_291_1(result) {
  _$jscoverage['/attribute.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['290'][1].init(328, 29, 'sx.name || \'AttributeDerived\'');
function visit39_290_1(result) {
  _$jscoverage['/attribute.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['287'][1].init(38, 18, 'sx.__hooks__ || {}');
function visit38_287_1(result) {
  _$jscoverage['/attribute.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['286'][1].init(168, 28, 'hooks = SuperClass.__hooks__');
function visit37_286_1(result) {
  _$jscoverage['/attribute.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['283'][1].init(90, 8, 'px || {}');
function visit36_283_1(result) {
  _$jscoverage['/attribute.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['282'][1].init(67, 8, 'sx || {}');
function visit35_282_1(result) {
  _$jscoverage['/attribute.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['264'][1].init(551, 7, 'wrapped');
function visit34_264_1(result) {
  _$jscoverage['/attribute.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['261'][1].init(464, 13, 'v.__wrapped__');
function visit33_261_1(result) {
  _$jscoverage['/attribute.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['252'][1].init(54, 11, 'v.__owner__');
function visit32_252_1(result) {
  _$jscoverage['/attribute.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['250'][1].init(17, 22, 'typeof v == \'function\'');
function visit31_250_1(result) {
  _$jscoverage['/attribute.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['245'][1].init(17, 7, 'p in px');
function visit30_245_1(result) {
  _$jscoverage['/attribute.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['242'][1].init(21, 24, 'SubClass.__hooks__ || {}');
function visit29_242_1(result) {
  _$jscoverage['/attribute.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['208'][1].init(156, 5, 'attrs');
function visit28_208_1(result) {
  _$jscoverage['/attribute.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['205'][1].init(509, 15, '!opts[\'silent\']');
function visit27_205_1(result) {
  _$jscoverage['/attribute.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['200'][1].init(417, 13, 'ret === FALSE');
function visit26_200_1(result) {
  _$jscoverage['/attribute.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['186'][1].init(60, 17, 'e.target !== this');
function visit25_186_1(result) {
  _$jscoverage['/attribute.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['176'][1].init(17, 79, 'FALSE === self.fire(whenAttrChangeEventName(\'before\', name), beforeEventObject)');
function visit24_176_1(result) {
  _$jscoverage['/attribute.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['172'][1].init(17, 52, 'FALSE === defaultSetFn.call(self, beforeEventObject)');
function visit23_172_1(result) {
  _$jscoverage['/attribute.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['171'][1].init(1033, 14, 'opts[\'silent\']');
function visit22_171_1(result) {
  _$jscoverage['/attribute.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['153'][2].init(113, 16, 'subVal === value');
function visit21_153_2(result) {
  _$jscoverage['/attribute.js'].branchData['153'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['153'][1].init(105, 24, 'path && subVal === value');
function visit20_153_1(result) {
  _$jscoverage['/attribute.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['151'][2].init(26, 17, 'prevVal === value');
function visit19_151_2(result) {
  _$jscoverage['/attribute.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['151'][1].init(17, 26, '!path && prevVal === value');
function visit18_151_1(result) {
  _$jscoverage['/attribute.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['150'][1].init(466, 11, '!opts.force');
function visit17_150_1(result) {
  _$jscoverage['/attribute.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['144'][1].init(297, 4, 'path');
function visit16_144_1(result) {
  _$jscoverage['/attribute.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['121'][1].init(88, 22, 'defaultBeforeFns[name]');
function visit15_121_1(result) {
  _$jscoverage['/attribute.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['109'][1].init(17, 21, 'prevVal === undefined');
function visit14_109_1(result) {
  _$jscoverage['/attribute.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['108'][1].init(38, 4, 'path');
function visit13_108_1(result) {
  _$jscoverage['/attribute.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['95'][1].init(32, 24, 'name.indexOf(\'.\') !== -1');
function visit12_95_1(result) {
  _$jscoverage['/attribute.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['83'][1].init(107, 14, 'o != undefined');
function visit11_83_1(result) {
  _$jscoverage['/attribute.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['80'][1].init(29, 7, 'i < len');
function visit10_80_1(result) {
  _$jscoverage['/attribute.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['79'][1].init(67, 8, 'len >= 0');
function visit9_79_1(result) {
  _$jscoverage['/attribute.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['66'][3].init(17, 7, 'i < len');
function visit8_66_3(result) {
  _$jscoverage['/attribute.js'].branchData['66'][3].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['66'][2].init(58, 14, 'o != undefined');
function visit7_66_2(result) {
  _$jscoverage['/attribute.js'].branchData['66'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['66'][1].init(47, 25, 'o != undefined && i < len');
function visit6_66_1(result) {
  _$jscoverage['/attribute.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['58'][1].init(125, 9, 'ret || {}');
function visit5_58_1(result) {
  _$jscoverage['/attribute.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['55'][1].init(42, 20, '!doNotCreate && !ret');
function visit4_55_1(result) {
  _$jscoverage['/attribute.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['44'][1].init(20, 16, 'attrName || name');
function visit3_44_1(result) {
  _$jscoverage['/attribute.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['35'][1].init(16, 41, 'self.__attrVals || (self.__attrVals = {})');
function visit2_35_1(result) {
  _$jscoverage['/attribute.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['28'][1].init(13, 25, 'typeof method == \'string\'');
function visit1_28_1(result) {
  _$jscoverage['/attribute.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].lineData[6]++;
KISSY.add(function(S, undefined) {
  _$jscoverage['/attribute.js'].functionData[0]++;
  _$jscoverage['/attribute.js'].lineData[7]++;
  var module = this;
  _$jscoverage['/attribute.js'].lineData[8]++;
  var RE_DASH = /(?:^|-)([a-z])/ig;
  _$jscoverage['/attribute.js'].lineData[9]++;
  var CustomEvent = module.require('event/custom');
  _$jscoverage['/attribute.js'].lineData[10]++;
  module.exports = Attribute;
  _$jscoverage['/attribute.js'].lineData[12]++;
  var bind = S.bind;
  _$jscoverage['/attribute.js'].lineData[14]++;
  function replaceToUpper() {
    _$jscoverage['/attribute.js'].functionData[1]++;
    _$jscoverage['/attribute.js'].lineData[15]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/attribute.js'].lineData[18]++;
  function CamelCase(name) {
    _$jscoverage['/attribute.js'].functionData[2]++;
    _$jscoverage['/attribute.js'].lineData[19]++;
    return name.replace(RE_DASH, replaceToUpper);
  }
  _$jscoverage['/attribute.js'].lineData[23]++;
  var INVALID = {};
  _$jscoverage['/attribute.js'].lineData[25]++;
  var FALSE = false;
  _$jscoverage['/attribute.js'].lineData[27]++;
  function normalFn(host, method) {
    _$jscoverage['/attribute.js'].functionData[3]++;
    _$jscoverage['/attribute.js'].lineData[28]++;
    if (visit1_28_1(typeof method == 'string')) {
      _$jscoverage['/attribute.js'].lineData[29]++;
      return host[method];
    }
    _$jscoverage['/attribute.js'].lineData[31]++;
    return method;
  }
  _$jscoverage['/attribute.js'].lineData[34]++;
  function getAttrVals(self) {
    _$jscoverage['/attribute.js'].functionData[4]++;
    _$jscoverage['/attribute.js'].lineData[35]++;
    return visit2_35_1(self.__attrVals || (self.__attrVals = {}));
  }
  _$jscoverage['/attribute.js'].lineData[38]++;
  function whenAttrChangeEventName(when, name) {
    _$jscoverage['/attribute.js'].functionData[5]++;
    _$jscoverage['/attribute.js'].lineData[39]++;
    return when + S.ucfirst(name) + 'Change';
  }
  _$jscoverage['/attribute.js'].lineData[43]++;
  function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName, data) {
    _$jscoverage['/attribute.js'].functionData[6]++;
    _$jscoverage['/attribute.js'].lineData[44]++;
    attrName = visit3_44_1(attrName || name);
    _$jscoverage['/attribute.js'].lineData[45]++;
    return self.fire(whenAttrChangeEventName(when, name), S.mix({
  attrName: attrName, 
  subAttrName: subAttrName, 
  prevVal: prevVal, 
  newVal: newVal}, data));
  }
  _$jscoverage['/attribute.js'].lineData[53]++;
  function ensureNonEmpty(obj, name, doNotCreate) {
    _$jscoverage['/attribute.js'].functionData[7]++;
    _$jscoverage['/attribute.js'].lineData[54]++;
    var ret = obj[name];
    _$jscoverage['/attribute.js'].lineData[55]++;
    if (visit4_55_1(!doNotCreate && !ret)) {
      _$jscoverage['/attribute.js'].lineData[56]++;
      obj[name] = ret = {};
    }
    _$jscoverage['/attribute.js'].lineData[58]++;
    return visit5_58_1(ret || {});
  }
  _$jscoverage['/attribute.js'].lineData[64]++;
  function getValueByPath(o, path) {
    _$jscoverage['/attribute.js'].functionData[8]++;
    _$jscoverage['/attribute.js'].lineData[65]++;
    for (var i = 0, len = path.length; visit6_66_1(visit7_66_2(o != undefined) && visit8_66_3(i < len)); i++) {
      _$jscoverage['/attribute.js'].lineData[68]++;
      o = o[path[i]];
    }
    _$jscoverage['/attribute.js'].lineData[70]++;
    return o;
  }
  _$jscoverage['/attribute.js'].lineData[76]++;
  function setValueByPath(o, path, val) {
    _$jscoverage['/attribute.js'].functionData[9]++;
    _$jscoverage['/attribute.js'].lineData[77]++;
    var len = path.length - 1, s = o;
    _$jscoverage['/attribute.js'].lineData[79]++;
    if (visit9_79_1(len >= 0)) {
      _$jscoverage['/attribute.js'].lineData[80]++;
      for (var i = 0; visit10_80_1(i < len); i++) {
        _$jscoverage['/attribute.js'].lineData[81]++;
        o = o[path[i]];
      }
      _$jscoverage['/attribute.js'].lineData[83]++;
      if (visit11_83_1(o != undefined)) {
        _$jscoverage['/attribute.js'].lineData[84]++;
        o[path[i]] = val;
      } else {
        _$jscoverage['/attribute.js'].lineData[86]++;
        s = undefined;
      }
    }
    _$jscoverage['/attribute.js'].lineData[89]++;
    return s;
  }
  _$jscoverage['/attribute.js'].lineData[92]++;
  function getPathNamePair(name) {
    _$jscoverage['/attribute.js'].functionData[10]++;
    _$jscoverage['/attribute.js'].lineData[93]++;
    var path;
    _$jscoverage['/attribute.js'].lineData[95]++;
    if (visit12_95_1(name.indexOf('.') !== -1)) {
      _$jscoverage['/attribute.js'].lineData[96]++;
      path = name.split('.');
      _$jscoverage['/attribute.js'].lineData[97]++;
      name = path.shift();
    }
    _$jscoverage['/attribute.js'].lineData[100]++;
    return {
  path: path, 
  name: name};
  }
  _$jscoverage['/attribute.js'].lineData[106]++;
  function getValueBySubValue(prevVal, path, value) {
    _$jscoverage['/attribute.js'].functionData[11]++;
    _$jscoverage['/attribute.js'].lineData[107]++;
    var tmp = value;
    _$jscoverage['/attribute.js'].lineData[108]++;
    if (visit13_108_1(path)) {
      _$jscoverage['/attribute.js'].lineData[109]++;
      if (visit14_109_1(prevVal === undefined)) {
        _$jscoverage['/attribute.js'].lineData[110]++;
        tmp = {};
      } else {
        _$jscoverage['/attribute.js'].lineData[112]++;
        tmp = S.clone(prevVal);
      }
      _$jscoverage['/attribute.js'].lineData[114]++;
      setValueByPath(tmp, path, value);
    }
    _$jscoverage['/attribute.js'].lineData[116]++;
    return tmp;
  }
  _$jscoverage['/attribute.js'].lineData[119]++;
  function prepareDefaultSetFn(self, name) {
    _$jscoverage['/attribute.js'].functionData[12]++;
    _$jscoverage['/attribute.js'].lineData[120]++;
    var defaultBeforeFns = ensureNonEmpty(self, '__defaultBeforeFns');
    _$jscoverage['/attribute.js'].lineData[121]++;
    if (visit15_121_1(defaultBeforeFns[name])) {
      _$jscoverage['/attribute.js'].lineData[122]++;
      return;
    }
    _$jscoverage['/attribute.js'].lineData[124]++;
    defaultBeforeFns[name] = 1;
    _$jscoverage['/attribute.js'].lineData[125]++;
    var beforeChangeEventName = whenAttrChangeEventName('before', name);
    _$jscoverage['/attribute.js'].lineData[126]++;
    self.publish(beforeChangeEventName, {
  defaultFn: defaultSetFn});
  }
  _$jscoverage['/attribute.js'].lineData[131]++;
  function setInternal(self, name, value, opts, attrs) {
    _$jscoverage['/attribute.js'].functionData[13]++;
    _$jscoverage['/attribute.js'].lineData[132]++;
    var path, subVal, prevVal, pathNamePair = getPathNamePair(name), fullName = name;
    _$jscoverage['/attribute.js'].lineData[138]++;
    name = pathNamePair.name;
    _$jscoverage['/attribute.js'].lineData[139]++;
    path = pathNamePair.path;
    _$jscoverage['/attribute.js'].lineData[140]++;
    prevVal = self.get(name);
    _$jscoverage['/attribute.js'].lineData[142]++;
    prepareDefaultSetFn(self, name);
    _$jscoverage['/attribute.js'].lineData[144]++;
    if (visit16_144_1(path)) {
      _$jscoverage['/attribute.js'].lineData[145]++;
      subVal = getValueByPath(prevVal, path);
    }
    _$jscoverage['/attribute.js'].lineData[150]++;
    if (visit17_150_1(!opts.force)) {
      _$jscoverage['/attribute.js'].lineData[151]++;
      if (visit18_151_1(!path && visit19_151_2(prevVal === value))) {
        _$jscoverage['/attribute.js'].lineData[152]++;
        return undefined;
      } else {
        _$jscoverage['/attribute.js'].lineData[153]++;
        if (visit20_153_1(path && visit21_153_2(subVal === value))) {
          _$jscoverage['/attribute.js'].lineData[154]++;
          return undefined;
        }
      }
    }
    _$jscoverage['/attribute.js'].lineData[158]++;
    value = getValueBySubValue(prevVal, path, value);
    _$jscoverage['/attribute.js'].lineData[160]++;
    var beforeEventObject = S.mix({
  attrName: name, 
  subAttrName: fullName, 
  prevVal: prevVal, 
  newVal: value, 
  _opts: opts, 
  _attrs: attrs, 
  target: self}, opts.data);
    _$jscoverage['/attribute.js'].lineData[171]++;
    if (visit22_171_1(opts['silent'])) {
      _$jscoverage['/attribute.js'].lineData[172]++;
      if (visit23_172_1(FALSE === defaultSetFn.call(self, beforeEventObject))) {
        _$jscoverage['/attribute.js'].lineData[173]++;
        return FALSE;
      }
    } else {
      _$jscoverage['/attribute.js'].lineData[176]++;
      if (visit24_176_1(FALSE === self.fire(whenAttrChangeEventName('before', name), beforeEventObject))) {
        _$jscoverage['/attribute.js'].lineData[177]++;
        return FALSE;
      }
    }
    _$jscoverage['/attribute.js'].lineData[181]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[184]++;
  function defaultSetFn(e) {
    _$jscoverage['/attribute.js'].functionData[14]++;
    _$jscoverage['/attribute.js'].lineData[186]++;
    if (visit25_186_1(e.target !== this)) {
      _$jscoverage['/attribute.js'].lineData[187]++;
      return undefined;
    }
    _$jscoverage['/attribute.js'].lineData[189]++;
    var self = this, value = e.newVal, prevVal = e.prevVal, name = e.attrName, fullName = e.subAttrName, attrs = e._attrs, opts = e._opts;
    _$jscoverage['/attribute.js'].lineData[198]++;
    var ret = self.setInternal(name, value);
    _$jscoverage['/attribute.js'].lineData[200]++;
    if (visit26_200_1(ret === FALSE)) {
      _$jscoverage['/attribute.js'].lineData[201]++;
      return ret;
    }
    _$jscoverage['/attribute.js'].lineData[205]++;
    if (visit27_205_1(!opts['silent'])) {
      _$jscoverage['/attribute.js'].lineData[206]++;
      value = getAttrVals(self)[name];
      _$jscoverage['/attribute.js'].lineData[207]++;
      __fireAttrChange(self, 'after', name, prevVal, value, fullName, null, opts.data);
      _$jscoverage['/attribute.js'].lineData[208]++;
      if (visit28_208_1(attrs)) {
        _$jscoverage['/attribute.js'].lineData[209]++;
        attrs.push({
  prevVal: prevVal, 
  newVal: value, 
  attrName: name, 
  subAttrName: fullName});
      } else {
        _$jscoverage['/attribute.js'].lineData[216]++;
        __fireAttrChange(self, '', '*', [prevVal], [value], [fullName], [name], opts.data);
      }
    }
    _$jscoverage['/attribute.js'].lineData[224]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[227]++;
  function Attribute(config) {
    _$jscoverage['/attribute.js'].functionData[15]++;
    _$jscoverage['/attribute.js'].lineData[228]++;
    var self = this, c = self.constructor;
    _$jscoverage['/attribute.js'].lineData[231]++;
    self.userConfig = config;
    _$jscoverage['/attribute.js'].lineData[233]++;
    while (c) {
      _$jscoverage['/attribute.js'].lineData[234]++;
      addAttrs(self, c.ATTRS);
      _$jscoverage['/attribute.js'].lineData[235]++;
      c = c.superclass ? c.superclass.constructor : null;
    }
    _$jscoverage['/attribute.js'].lineData[238]++;
    initAttrs(self, config);
  }
  _$jscoverage['/attribute.js'].lineData[241]++;
  function wrapProtoForSuper(px, SubClass) {
    _$jscoverage['/attribute.js'].functionData[16]++;
    _$jscoverage['/attribute.js'].lineData[242]++;
    var hooks = visit29_242_1(SubClass.__hooks__ || {});
    _$jscoverage['/attribute.js'].lineData[244]++;
    for (var p in hooks) {
      _$jscoverage['/attribute.js'].lineData[245]++;
      if (visit30_245_1(p in px)) {
        _$jscoverage['/attribute.js'].lineData[246]++;
        px[p] = hooks[p](px[p]);
      }
    }
    _$jscoverage['/attribute.js'].lineData[249]++;
    S.each(px, function(v, p) {
  _$jscoverage['/attribute.js'].functionData[17]++;
  _$jscoverage['/attribute.js'].lineData[250]++;
  if (visit31_250_1(typeof v == 'function')) {
    _$jscoverage['/attribute.js'].lineData[251]++;
    var wrapped = 0;
    _$jscoverage['/attribute.js'].lineData[252]++;
    if (visit32_252_1(v.__owner__)) {
      _$jscoverage['/attribute.js'].lineData[253]++;
      var originalOwner = v.__owner__;
      _$jscoverage['/attribute.js'].lineData[254]++;
      delete v.__owner__;
      _$jscoverage['/attribute.js'].lineData[255]++;
      delete v.__name__;
      _$jscoverage['/attribute.js'].lineData[256]++;
      wrapped = v.__wrapped__ = 1;
      _$jscoverage['/attribute.js'].lineData[257]++;
      var newV = bind(v);
      _$jscoverage['/attribute.js'].lineData[258]++;
      newV.__owner__ = originalOwner;
      _$jscoverage['/attribute.js'].lineData[259]++;
      newV.__name__ = p;
      _$jscoverage['/attribute.js'].lineData[260]++;
      originalOwner.prototype[p] = newV;
    } else {
      _$jscoverage['/attribute.js'].lineData[261]++;
      if (visit33_261_1(v.__wrapped__)) {
        _$jscoverage['/attribute.js'].lineData[262]++;
        wrapped = 1;
      }
    }
    _$jscoverage['/attribute.js'].lineData[264]++;
    if (visit34_264_1(wrapped)) {
      _$jscoverage['/attribute.js'].lineData[265]++;
      px[p] = v = bind(v);
    }
    _$jscoverage['/attribute.js'].lineData[267]++;
    v.__owner__ = SubClass;
    _$jscoverage['/attribute.js'].lineData[268]++;
    v.__name__ = p;
  }
});
  }
  _$jscoverage['/attribute.js'].lineData[273]++;
  function addMembers(px) {
    _$jscoverage['/attribute.js'].functionData[18]++;
    _$jscoverage['/attribute.js'].lineData[274]++;
    var SubClass = this;
    _$jscoverage['/attribute.js'].lineData[275]++;
    wrapProtoForSuper(px, SubClass);
    _$jscoverage['/attribute.js'].lineData[276]++;
    S.mix(SubClass.prototype, px);
  }
  _$jscoverage['/attribute.js'].lineData[279]++;
  Attribute.extend = function extend(px, sx) {
  _$jscoverage['/attribute.js'].functionData[19]++;
  _$jscoverage['/attribute.js'].lineData[280]++;
  var SubClass, SuperClass = this;
  _$jscoverage['/attribute.js'].lineData[282]++;
  sx = visit35_282_1(sx || {});
  _$jscoverage['/attribute.js'].lineData[283]++;
  px = visit36_283_1(px || {});
  _$jscoverage['/attribute.js'].lineData[284]++;
  var hooks, sxHooks = sx.__hooks__;
  _$jscoverage['/attribute.js'].lineData[286]++;
  if (visit37_286_1(hooks = SuperClass.__hooks__)) {
    _$jscoverage['/attribute.js'].lineData[287]++;
    sxHooks = sx.__hooks__ = visit38_287_1(sx.__hooks__ || {});
    _$jscoverage['/attribute.js'].lineData[288]++;
    S.mix(sxHooks, hooks, false);
  }
  _$jscoverage['/attribute.js'].lineData[290]++;
  var name = visit39_290_1(sx.name || 'AttributeDerived');
  _$jscoverage['/attribute.js'].lineData[291]++;
  if (visit40_291_1(px.hasOwnProperty('constructor'))) {
    _$jscoverage['/attribute.js'].lineData[292]++;
    SubClass = px.constructor;
  } else {
    _$jscoverage['/attribute.js'].lineData[296]++;
    if (visit41_296_1('@DEBUG@')) {
      _$jscoverage['/attribute.js'].lineData[297]++;
      eval("SubClass = function " + CamelCase(name) + "(){ " + "this.callSuper.apply(this, arguments);}");
    } else {
      _$jscoverage['/attribute.js'].lineData[300]++;
      SubClass = function() {
  _$jscoverage['/attribute.js'].functionData[20]++;
  _$jscoverage['/attribute.js'].lineData[301]++;
  this.callSuper.apply(this, arguments);
};
    }
  }
  _$jscoverage['/attribute.js'].lineData[305]++;
  px.constructor = SubClass;
  _$jscoverage['/attribute.js'].lineData[306]++;
  SubClass.__hooks__ = sxHooks;
  _$jscoverage['/attribute.js'].lineData[307]++;
  wrapProtoForSuper(px, SubClass);
  _$jscoverage['/attribute.js'].lineData[308]++;
  var inheritedStatics, sxInheritedStatics = sx.inheritedStatics;
  _$jscoverage['/attribute.js'].lineData[310]++;
  if (visit42_310_1(inheritedStatics = SuperClass.inheritedStatics)) {
    _$jscoverage['/attribute.js'].lineData[311]++;
    sxInheritedStatics = sx.inheritedStatics = visit43_311_1(sx.inheritedStatics || {});
    _$jscoverage['/attribute.js'].lineData[312]++;
    S.mix(sxInheritedStatics, inheritedStatics, false);
  }
  _$jscoverage['/attribute.js'].lineData[314]++;
  S.extend(SubClass, SuperClass, px, sx);
  _$jscoverage['/attribute.js'].lineData[315]++;
  if (visit44_315_1(sxInheritedStatics)) {
    _$jscoverage['/attribute.js'].lineData[316]++;
    S.mix(SubClass, sxInheritedStatics);
  }
  _$jscoverage['/attribute.js'].lineData[318]++;
  SubClass.extend = visit45_318_1(sx.extend || extend);
  _$jscoverage['/attribute.js'].lineData[319]++;
  SubClass.addMembers = addMembers;
  _$jscoverage['/attribute.js'].lineData[320]++;
  return SubClass;
};
  _$jscoverage['/attribute.js'].lineData[323]++;
  function addAttrs(host, attrs) {
    _$jscoverage['/attribute.js'].functionData[21]++;
    _$jscoverage['/attribute.js'].lineData[324]++;
    if (visit46_324_1(attrs)) {
      _$jscoverage['/attribute.js'].lineData[325]++;
      for (var attr in attrs) {
        _$jscoverage['/attribute.js'].lineData[333]++;
        host.addAttr(attr, attrs[attr], false);
      }
    }
  }
  _$jscoverage['/attribute.js'].lineData[338]++;
  function initAttrs(host, config) {
    _$jscoverage['/attribute.js'].functionData[22]++;
    _$jscoverage['/attribute.js'].lineData[339]++;
    if (visit47_339_1(config)) {
      _$jscoverage['/attribute.js'].lineData[340]++;
      for (var attr in config) {
        _$jscoverage['/attribute.js'].lineData[342]++;
        host.setInternal(attr, config[attr]);
      }
    }
  }
  _$jscoverage['/attribute.js'].lineData[347]++;
  S.augment(Attribute, CustomEvent.Target, {
  INVALID: INVALID, 
  'callSuper': function() {
  _$jscoverage['/attribute.js'].functionData[23]++;
  _$jscoverage['/attribute.js'].lineData[351]++;
  var method, obj, self = this, args = arguments;
  _$jscoverage['/attribute.js'].lineData[355]++;
  if (visit48_355_1(visit49_355_2(typeof self == 'function') && self.__name__)) {
    _$jscoverage['/attribute.js'].lineData[356]++;
    method = self;
    _$jscoverage['/attribute.js'].lineData[357]++;
    obj = args[0];
    _$jscoverage['/attribute.js'].lineData[358]++;
    args = Array.prototype.slice.call(args, 1);
  } else {
    _$jscoverage['/attribute.js'].lineData[360]++;
    method = arguments.callee.caller;
    _$jscoverage['/attribute.js'].lineData[361]++;
    if (visit50_361_1(method.__wrapped__)) {
      _$jscoverage['/attribute.js'].lineData[362]++;
      method = method.caller;
    }
    _$jscoverage['/attribute.js'].lineData[364]++;
    obj = self;
  }
  _$jscoverage['/attribute.js'].lineData[367]++;
  var name = method.__name__;
  _$jscoverage['/attribute.js'].lineData[368]++;
  if (visit51_368_1(!name)) {
    _$jscoverage['/attribute.js'].lineData[370]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[372]++;
  var member = method.__owner__.superclass[name];
  _$jscoverage['/attribute.js'].lineData[373]++;
  if (visit52_373_1(!member)) {
    _$jscoverage['/attribute.js'].lineData[375]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[378]++;
  return member.apply(obj, visit53_378_1(args || []));
}, 
  getAttrs: function() {
  _$jscoverage['/attribute.js'].functionData[24]++;
  _$jscoverage['/attribute.js'].lineData[387]++;
  return visit54_387_1(this.__attrs || (this.__attrs = {}));
}, 
  getAttrVals: function() {
  _$jscoverage['/attribute.js'].functionData[25]++;
  _$jscoverage['/attribute.js'].lineData[395]++;
  var self = this, o = {}, a, attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[399]++;
  for (a in attrs) {
    _$jscoverage['/attribute.js'].lineData[400]++;
    o[a] = self.get(a);
  }
  _$jscoverage['/attribute.js'].lineData[402]++;
  return o;
}, 
  addAttr: function(name, attrConfig, override) {
  _$jscoverage['/attribute.js'].functionData[26]++;
  _$jscoverage['/attribute.js'].lineData[423]++;
  var self = this, attrs = self.getAttrs(), attr, cfg = S.clone(attrConfig);
  _$jscoverage['/attribute.js'].lineData[427]++;
  if (visit55_427_1(attr = attrs[name])) {
    _$jscoverage['/attribute.js'].lineData[428]++;
    S.mix(attr, cfg, override);
  } else {
    _$jscoverage['/attribute.js'].lineData[430]++;
    attrs[name] = cfg;
  }
  _$jscoverage['/attribute.js'].lineData[432]++;
  return self;
}, 
  addAttrs: function(attrConfigs, initialValues) {
  _$jscoverage['/attribute.js'].functionData[27]++;
  _$jscoverage['/attribute.js'].lineData[442]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[443]++;
  S.each(attrConfigs, function(attrConfig, name) {
  _$jscoverage['/attribute.js'].functionData[28]++;
  _$jscoverage['/attribute.js'].lineData[444]++;
  self.addAttr(name, attrConfig);
});
  _$jscoverage['/attribute.js'].lineData[446]++;
  if (visit56_446_1(initialValues)) {
    _$jscoverage['/attribute.js'].lineData[447]++;
    self.set(initialValues);
  }
  _$jscoverage['/attribute.js'].lineData[449]++;
  return self;
}, 
  hasAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[29]++;
  _$jscoverage['/attribute.js'].lineData[458]++;
  return this.getAttrs().hasOwnProperty(name);
}, 
  removeAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[30]++;
  _$jscoverage['/attribute.js'].lineData[466]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[467]++;
  var __attrVals = getAttrVals(self);
  _$jscoverage['/attribute.js'].lineData[468]++;
  var __attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[470]++;
  if (visit57_470_1(self.hasAttr(name))) {
    _$jscoverage['/attribute.js'].lineData[471]++;
    delete __attrs[name];
    _$jscoverage['/attribute.js'].lineData[472]++;
    delete __attrVals[name];
  }
  _$jscoverage['/attribute.js'].lineData[475]++;
  return self;
}, 
  set: function(name, value, opts) {
  _$jscoverage['/attribute.js'].functionData[31]++;
  _$jscoverage['/attribute.js'].lineData[489]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[490]++;
  if (visit58_490_1(S.isPlainObject(name))) {
    _$jscoverage['/attribute.js'].lineData[491]++;
    opts = value;
    _$jscoverage['/attribute.js'].lineData[492]++;
    opts = visit59_492_1(opts || {});
    _$jscoverage['/attribute.js'].lineData[493]++;
    var all = Object(name), attrs = [], e, errors = [];
    _$jscoverage['/attribute.js'].lineData[497]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[500]++;
      if (visit60_500_1((e = validate(self, name, all[name], all)) !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[501]++;
        errors.push(e);
      }
    }
    _$jscoverage['/attribute.js'].lineData[504]++;
    if (visit61_504_1(errors.length)) {
      _$jscoverage['/attribute.js'].lineData[505]++;
      if (visit62_505_1(opts['error'])) {
        _$jscoverage['/attribute.js'].lineData[506]++;
        opts['error'](errors);
      }
      _$jscoverage['/attribute.js'].lineData[508]++;
      return FALSE;
    }
    _$jscoverage['/attribute.js'].lineData[510]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[511]++;
      setInternal(self, name, all[name], opts, attrs);
    }
    _$jscoverage['/attribute.js'].lineData[513]++;
    var attrNames = [], prevVals = [], newVals = [], subAttrNames = [];
    _$jscoverage['/attribute.js'].lineData[517]++;
    S.each(attrs, function(attr) {
  _$jscoverage['/attribute.js'].functionData[32]++;
  _$jscoverage['/attribute.js'].lineData[518]++;
  prevVals.push(attr.prevVal);
  _$jscoverage['/attribute.js'].lineData[519]++;
  newVals.push(attr.newVal);
  _$jscoverage['/attribute.js'].lineData[520]++;
  attrNames.push(attr.attrName);
  _$jscoverage['/attribute.js'].lineData[521]++;
  subAttrNames.push(attr.subAttrName);
});
    _$jscoverage['/attribute.js'].lineData[523]++;
    if (visit63_523_1(attrNames.length)) {
      _$jscoverage['/attribute.js'].lineData[524]++;
      __fireAttrChange(self, '', '*', prevVals, newVals, subAttrNames, attrNames, opts.data);
    }
    _$jscoverage['/attribute.js'].lineData[533]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[535]++;
  opts = visit64_535_1(opts || {});
  _$jscoverage['/attribute.js'].lineData[537]++;
  e = validate(self, name, value);
  _$jscoverage['/attribute.js'].lineData[539]++;
  if (visit65_539_1(e !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[540]++;
    if (visit66_540_1(opts['error'])) {
      _$jscoverage['/attribute.js'].lineData[541]++;
      opts['error'](e);
    }
    _$jscoverage['/attribute.js'].lineData[543]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[545]++;
  return setInternal(self, name, value, opts);
}, 
  setInternal: function(name, value) {
  _$jscoverage['/attribute.js'].functionData[33]++;
  _$jscoverage['/attribute.js'].lineData[554]++;
  var self = this, setValue = undefined, attrConfig = ensureNonEmpty(self.getAttrs(), name), setter = attrConfig['setter'];
  _$jscoverage['/attribute.js'].lineData[564]++;
  if (visit67_564_1(setter && (setter = normalFn(self, setter)))) {
    _$jscoverage['/attribute.js'].lineData[565]++;
    setValue = setter.call(self, value, name);
  }
  _$jscoverage['/attribute.js'].lineData[568]++;
  if (visit68_568_1(setValue === INVALID)) {
    _$jscoverage['/attribute.js'].lineData[569]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[572]++;
  if (visit69_572_1(setValue !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[573]++;
    value = setValue;
  }
  _$jscoverage['/attribute.js'].lineData[577]++;
  getAttrVals(self)[name] = value;
  _$jscoverage['/attribute.js'].lineData[579]++;
  return undefined;
}, 
  get: function(name) {
  _$jscoverage['/attribute.js'].functionData[34]++;
  _$jscoverage['/attribute.js'].lineData[588]++;
  var self = this, dot = '.', path, attrVals = getAttrVals(self), attrConfig, getter, ret;
  _$jscoverage['/attribute.js'].lineData[595]++;
  if (visit70_595_1(name.indexOf(dot) !== -1)) {
    _$jscoverage['/attribute.js'].lineData[596]++;
    path = name.split(dot);
    _$jscoverage['/attribute.js'].lineData[597]++;
    name = path.shift();
  }
  _$jscoverage['/attribute.js'].lineData[600]++;
  attrConfig = ensureNonEmpty(self.getAttrs(), name, 1);
  _$jscoverage['/attribute.js'].lineData[601]++;
  getter = attrConfig['getter'];
  _$jscoverage['/attribute.js'].lineData[605]++;
  ret = name in attrVals ? attrVals[name] : getDefAttrVal(self, name);
  _$jscoverage['/attribute.js'].lineData[610]++;
  if (visit71_610_1(getter && (getter = normalFn(self, getter)))) {
    _$jscoverage['/attribute.js'].lineData[611]++;
    ret = getter.call(self, ret, name);
  }
  _$jscoverage['/attribute.js'].lineData[614]++;
  if (visit72_614_1(!(name in attrVals) && visit73_614_2(ret !== undefined))) {
    _$jscoverage['/attribute.js'].lineData[615]++;
    attrVals[name] = ret;
  }
  _$jscoverage['/attribute.js'].lineData[618]++;
  if (visit74_618_1(path)) {
    _$jscoverage['/attribute.js'].lineData[619]++;
    ret = getValueByPath(ret, path);
  }
  _$jscoverage['/attribute.js'].lineData[622]++;
  return ret;
}, 
  reset: function(name, opts) {
  _$jscoverage['/attribute.js'].functionData[35]++;
  _$jscoverage['/attribute.js'].lineData[634]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[636]++;
  if (visit75_636_1(typeof name == 'string')) {
    _$jscoverage['/attribute.js'].lineData[637]++;
    if (visit76_637_1(self.hasAttr(name))) {
      _$jscoverage['/attribute.js'].lineData[639]++;
      return self.set(name, getDefAttrVal(self, name), opts);
    } else {
      _$jscoverage['/attribute.js'].lineData[642]++;
      return self;
    }
  }
  _$jscoverage['/attribute.js'].lineData[646]++;
  opts = (name);
  _$jscoverage['/attribute.js'].lineData[649]++;
  var attrs = self.getAttrs(), values = {};
  _$jscoverage['/attribute.js'].lineData[653]++;
  for (name in attrs) {
    _$jscoverage['/attribute.js'].lineData[654]++;
    values[name] = getDefAttrVal(self, name);
  }
  _$jscoverage['/attribute.js'].lineData[657]++;
  self.set(values, opts);
  _$jscoverage['/attribute.js'].lineData[658]++;
  return self;
}});
  _$jscoverage['/attribute.js'].lineData[663]++;
  function getDefAttrVal(self, name) {
    _$jscoverage['/attribute.js'].functionData[36]++;
    _$jscoverage['/attribute.js'].lineData[664]++;
    var attrs = self.getAttrs(), attrConfig = ensureNonEmpty(attrs, name, 1), valFn = attrConfig.valueFn, val;
    _$jscoverage['/attribute.js'].lineData[669]++;
    if (visit77_669_1(valFn && (valFn = normalFn(self, valFn)))) {
      _$jscoverage['/attribute.js'].lineData[670]++;
      val = valFn.call(self);
      _$jscoverage['/attribute.js'].lineData[671]++;
      if (visit78_671_1(val !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[675]++;
        attrConfig.value = val;
      }
      _$jscoverage['/attribute.js'].lineData[677]++;
      delete attrConfig.valueFn;
      _$jscoverage['/attribute.js'].lineData[678]++;
      attrs[name] = attrConfig;
    }
    _$jscoverage['/attribute.js'].lineData[681]++;
    return attrConfig.value;
  }
  _$jscoverage['/attribute.js'].lineData[684]++;
  function validate(self, name, value, all) {
    _$jscoverage['/attribute.js'].functionData[37]++;
    _$jscoverage['/attribute.js'].lineData[685]++;
    var path, prevVal, pathNamePair;
    _$jscoverage['/attribute.js'].lineData[687]++;
    pathNamePair = getPathNamePair(name);
    _$jscoverage['/attribute.js'].lineData[689]++;
    name = pathNamePair.name;
    _$jscoverage['/attribute.js'].lineData[690]++;
    path = pathNamePair.path;
    _$jscoverage['/attribute.js'].lineData[692]++;
    if (visit79_692_1(path)) {
      _$jscoverage['/attribute.js'].lineData[693]++;
      prevVal = self.get(name);
      _$jscoverage['/attribute.js'].lineData[694]++;
      value = getValueBySubValue(prevVal, path, value);
    }
    _$jscoverage['/attribute.js'].lineData[696]++;
    var attrConfig = ensureNonEmpty(self.getAttrs(), name), e, validator = attrConfig['validator'];
    _$jscoverage['/attribute.js'].lineData[699]++;
    if (visit80_699_1(validator && (validator = normalFn(self, validator)))) {
      _$jscoverage['/attribute.js'].lineData[700]++;
      e = validator.call(self, value, name, all);
      _$jscoverage['/attribute.js'].lineData[702]++;
      if (visit81_702_1(visit82_702_2(e !== undefined) && visit83_702_3(e !== true))) {
        _$jscoverage['/attribute.js'].lineData[703]++;
        return e;
      }
    }
    _$jscoverage['/attribute.js'].lineData[706]++;
    return undefined;
  }
});
