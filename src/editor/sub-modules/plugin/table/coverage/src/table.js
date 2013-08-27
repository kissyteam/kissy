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
if (! _$jscoverage['/table.js']) {
  _$jscoverage['/table.js'] = {};
  _$jscoverage['/table.js'].lineData = [];
  _$jscoverage['/table.js'].lineData[5] = 0;
  _$jscoverage['/table.js'].lineData[6] = 0;
  _$jscoverage['/table.js'].lineData[12] = 0;
  _$jscoverage['/table.js'].lineData[15] = 0;
  _$jscoverage['/table.js'].lineData[20] = 0;
  _$jscoverage['/table.js'].lineData[22] = 0;
  _$jscoverage['/table.js'].lineData[23] = 0;
  _$jscoverage['/table.js'].lineData[27] = 0;
  _$jscoverage['/table.js'].lineData[30] = 0;
  _$jscoverage['/table.js'].lineData[31] = 0;
  _$jscoverage['/table.js'].lineData[35] = 0;
  _$jscoverage['/table.js'].lineData[36] = 0;
  _$jscoverage['/table.js'].lineData[38] = 0;
  _$jscoverage['/table.js'].lineData[40] = 0;
  _$jscoverage['/table.js'].lineData[43] = 0;
  _$jscoverage['/table.js'].lineData[44] = 0;
  _$jscoverage['/table.js'].lineData[46] = 0;
  _$jscoverage['/table.js'].lineData[48] = 0;
  _$jscoverage['/table.js'].lineData[50] = 0;
  _$jscoverage['/table.js'].lineData[58] = 0;
  _$jscoverage['/table.js'].lineData[59] = 0;
  _$jscoverage['/table.js'].lineData[61] = 0;
  _$jscoverage['/table.js'].lineData[62] = 0;
  _$jscoverage['/table.js'].lineData[68] = 0;
  _$jscoverage['/table.js'].lineData[70] = 0;
  _$jscoverage['/table.js'].lineData[72] = 0;
  _$jscoverage['/table.js'].lineData[75] = 0;
  _$jscoverage['/table.js'].lineData[77] = 0;
  _$jscoverage['/table.js'].lineData[79] = 0;
  _$jscoverage['/table.js'].lineData[80] = 0;
  _$jscoverage['/table.js'].lineData[81] = 0;
  _$jscoverage['/table.js'].lineData[82] = 0;
  _$jscoverage['/table.js'].lineData[86] = 0;
  _$jscoverage['/table.js'].lineData[88] = 0;
  _$jscoverage['/table.js'].lineData[89] = 0;
  _$jscoverage['/table.js'].lineData[90] = 0;
  _$jscoverage['/table.js'].lineData[93] = 0;
  _$jscoverage['/table.js'].lineData[95] = 0;
  _$jscoverage['/table.js'].lineData[99] = 0;
  _$jscoverage['/table.js'].lineData[102] = 0;
  _$jscoverage['/table.js'].lineData[103] = 0;
  _$jscoverage['/table.js'].lineData[104] = 0;
  _$jscoverage['/table.js'].lineData[113] = 0;
  _$jscoverage['/table.js'].lineData[114] = 0;
  _$jscoverage['/table.js'].lineData[117] = 0;
  _$jscoverage['/table.js'].lineData[118] = 0;
  _$jscoverage['/table.js'].lineData[119] = 0;
  _$jscoverage['/table.js'].lineData[122] = 0;
  _$jscoverage['/table.js'].lineData[130] = 0;
  _$jscoverage['/table.js'].lineData[135] = 0;
  _$jscoverage['/table.js'].lineData[136] = 0;
  _$jscoverage['/table.js'].lineData[137] = 0;
  _$jscoverage['/table.js'].lineData[140] = 0;
  _$jscoverage['/table.js'].lineData[142] = 0;
  _$jscoverage['/table.js'].lineData[143] = 0;
  _$jscoverage['/table.js'].lineData[145] = 0;
  _$jscoverage['/table.js'].lineData[146] = 0;
  _$jscoverage['/table.js'].lineData[148] = 0;
  _$jscoverage['/table.js'].lineData[151] = 0;
  _$jscoverage['/table.js'].lineData[154] = 0;
  _$jscoverage['/table.js'].lineData[156] = 0;
  _$jscoverage['/table.js'].lineData[160] = 0;
  _$jscoverage['/table.js'].lineData[161] = 0;
  _$jscoverage['/table.js'].lineData[165] = 0;
  _$jscoverage['/table.js'].lineData[168] = 0;
  _$jscoverage['/table.js'].lineData[169] = 0;
  _$jscoverage['/table.js'].lineData[171] = 0;
  _$jscoverage['/table.js'].lineData[172] = 0;
  _$jscoverage['/table.js'].lineData[173] = 0;
  _$jscoverage['/table.js'].lineData[175] = 0;
  _$jscoverage['/table.js'].lineData[176] = 0;
  _$jscoverage['/table.js'].lineData[178] = 0;
  _$jscoverage['/table.js'].lineData[179] = 0;
  _$jscoverage['/table.js'].lineData[180] = 0;
  _$jscoverage['/table.js'].lineData[182] = 0;
  _$jscoverage['/table.js'].lineData[186] = 0;
  _$jscoverage['/table.js'].lineData[187] = 0;
  _$jscoverage['/table.js'].lineData[193] = 0;
  _$jscoverage['/table.js'].lineData[194] = 0;
  _$jscoverage['/table.js'].lineData[198] = 0;
  _$jscoverage['/table.js'].lineData[199] = 0;
  _$jscoverage['/table.js'].lineData[201] = 0;
  _$jscoverage['/table.js'].lineData[202] = 0;
  _$jscoverage['/table.js'].lineData[203] = 0;
  _$jscoverage['/table.js'].lineData[207] = 0;
  _$jscoverage['/table.js'].lineData[208] = 0;
  _$jscoverage['/table.js'].lineData[213] = 0;
  _$jscoverage['/table.js'].lineData[214] = 0;
  _$jscoverage['/table.js'].lineData[216] = 0;
  _$jscoverage['/table.js'].lineData[217] = 0;
  _$jscoverage['/table.js'].lineData[218] = 0;
  _$jscoverage['/table.js'].lineData[222] = 0;
  _$jscoverage['/table.js'].lineData[225] = 0;
  _$jscoverage['/table.js'].lineData[226] = 0;
  _$jscoverage['/table.js'].lineData[227] = 0;
  _$jscoverage['/table.js'].lineData[230] = 0;
  _$jscoverage['/table.js'].lineData[232] = 0;
  _$jscoverage['/table.js'].lineData[233] = 0;
  _$jscoverage['/table.js'].lineData[237] = 0;
  _$jscoverage['/table.js'].lineData[238] = 0;
  _$jscoverage['/table.js'].lineData[240] = 0;
  _$jscoverage['/table.js'].lineData[243] = 0;
  _$jscoverage['/table.js'].lineData[244] = 0;
  _$jscoverage['/table.js'].lineData[247] = 0;
  _$jscoverage['/table.js'].lineData[254] = 0;
  _$jscoverage['/table.js'].lineData[256] = 0;
  _$jscoverage['/table.js'].lineData[260] = 0;
  _$jscoverage['/table.js'].lineData[261] = 0;
  _$jscoverage['/table.js'].lineData[262] = 0;
  _$jscoverage['/table.js'].lineData[266] = 0;
  _$jscoverage['/table.js'].lineData[267] = 0;
  _$jscoverage['/table.js'].lineData[271] = 0;
  _$jscoverage['/table.js'].lineData[274] = 0;
  _$jscoverage['/table.js'].lineData[275] = 0;
  _$jscoverage['/table.js'].lineData[276] = 0;
  _$jscoverage['/table.js'].lineData[278] = 0;
  _$jscoverage['/table.js'].lineData[279] = 0;
  _$jscoverage['/table.js'].lineData[281] = 0;
  _$jscoverage['/table.js'].lineData[284] = 0;
  _$jscoverage['/table.js'].lineData[285] = 0;
  _$jscoverage['/table.js'].lineData[288] = 0;
  _$jscoverage['/table.js'].lineData[289] = 0;
  _$jscoverage['/table.js'].lineData[290] = 0;
  _$jscoverage['/table.js'].lineData[291] = 0;
  _$jscoverage['/table.js'].lineData[292] = 0;
  _$jscoverage['/table.js'].lineData[294] = 0;
  _$jscoverage['/table.js'].lineData[295] = 0;
  _$jscoverage['/table.js'].lineData[296] = 0;
  _$jscoverage['/table.js'].lineData[298] = 0;
  _$jscoverage['/table.js'].lineData[305] = 0;
  _$jscoverage['/table.js'].lineData[306] = 0;
  _$jscoverage['/table.js'].lineData[307] = 0;
  _$jscoverage['/table.js'].lineData[311] = 0;
  _$jscoverage['/table.js'].lineData[312] = 0;
  _$jscoverage['/table.js'].lineData[313] = 0;
  _$jscoverage['/table.js'].lineData[316] = 0;
  _$jscoverage['/table.js'].lineData[330] = 0;
  _$jscoverage['/table.js'].lineData[358] = 0;
  _$jscoverage['/table.js'].lineData[361] = 0;
  _$jscoverage['/table.js'].lineData[362] = 0;
  _$jscoverage['/table.js'].lineData[372] = 0;
  _$jscoverage['/table.js'].lineData[374] = 0;
  _$jscoverage['/table.js'].lineData[375] = 0;
  _$jscoverage['/table.js'].lineData[376] = 0;
  _$jscoverage['/table.js'].lineData[377] = 0;
  _$jscoverage['/table.js'].lineData[379] = 0;
  _$jscoverage['/table.js'].lineData[389] = 0;
  _$jscoverage['/table.js'].lineData[390] = 0;
  _$jscoverage['/table.js'].lineData[393] = 0;
  _$jscoverage['/table.js'].lineData[398] = 0;
  _$jscoverage['/table.js'].lineData[400] = 0;
  _$jscoverage['/table.js'].lineData[404] = 0;
  _$jscoverage['/table.js'].lineData[405] = 0;
  _$jscoverage['/table.js'].lineData[407] = 0;
  _$jscoverage['/table.js'].lineData[411] = 0;
  _$jscoverage['/table.js'].lineData[412] = 0;
  _$jscoverage['/table.js'].lineData[413] = 0;
  _$jscoverage['/table.js'].lineData[414] = 0;
  _$jscoverage['/table.js'].lineData[424] = 0;
  _$jscoverage['/table.js'].lineData[425] = 0;
  _$jscoverage['/table.js'].lineData[429] = 0;
  _$jscoverage['/table.js'].lineData[430] = 0;
  _$jscoverage['/table.js'].lineData[433] = 0;
  _$jscoverage['/table.js'].lineData[436] = 0;
  _$jscoverage['/table.js'].lineData[437] = 0;
  _$jscoverage['/table.js'].lineData[438] = 0;
  _$jscoverage['/table.js'].lineData[439] = 0;
  _$jscoverage['/table.js'].lineData[443] = 0;
  _$jscoverage['/table.js'].lineData[444] = 0;
  _$jscoverage['/table.js'].lineData[447] = 0;
  _$jscoverage['/table.js'].lineData[449] = 0;
  _$jscoverage['/table.js'].lineData[451] = 0;
  _$jscoverage['/table.js'].lineData[455] = 0;
  _$jscoverage['/table.js'].lineData[456] = 0;
  _$jscoverage['/table.js'].lineData[457] = 0;
  _$jscoverage['/table.js'].lineData[458] = 0;
  _$jscoverage['/table.js'].lineData[459] = 0;
  _$jscoverage['/table.js'].lineData[463] = 0;
  _$jscoverage['/table.js'].lineData[464] = 0;
  _$jscoverage['/table.js'].lineData[465] = 0;
  _$jscoverage['/table.js'].lineData[467] = 0;
  _$jscoverage['/table.js'].lineData[468] = 0;
  _$jscoverage['/table.js'].lineData[472] = 0;
  _$jscoverage['/table.js'].lineData[473] = 0;
  _$jscoverage['/table.js'].lineData[474] = 0;
  _$jscoverage['/table.js'].lineData[475] = 0;
  _$jscoverage['/table.js'].lineData[476] = 0;
  _$jscoverage['/table.js'].lineData[480] = 0;
  _$jscoverage['/table.js'].lineData[481] = 0;
  _$jscoverage['/table.js'].lineData[482] = 0;
  _$jscoverage['/table.js'].lineData[483] = 0;
  _$jscoverage['/table.js'].lineData[484] = 0;
  _$jscoverage['/table.js'].lineData[488] = 0;
  _$jscoverage['/table.js'].lineData[489] = 0;
  _$jscoverage['/table.js'].lineData[490] = 0;
  _$jscoverage['/table.js'].lineData[491] = 0;
  _$jscoverage['/table.js'].lineData[492] = 0;
  _$jscoverage['/table.js'].lineData[496] = 0;
  _$jscoverage['/table.js'].lineData[497] = 0;
  _$jscoverage['/table.js'].lineData[498] = 0;
  _$jscoverage['/table.js'].lineData[499] = 0;
  _$jscoverage['/table.js'].lineData[500] = 0;
  _$jscoverage['/table.js'].lineData[504] = 0;
  _$jscoverage['/table.js'].lineData[505] = 0;
  _$jscoverage['/table.js'].lineData[506] = 0;
  _$jscoverage['/table.js'].lineData[511] = 0;
  _$jscoverage['/table.js'].lineData[512] = 0;
  _$jscoverage['/table.js'].lineData[513] = 0;
  _$jscoverage['/table.js'].lineData[520] = 0;
  _$jscoverage['/table.js'].lineData[521] = 0;
  _$jscoverage['/table.js'].lineData[522] = 0;
  _$jscoverage['/table.js'].lineData[527] = 0;
  _$jscoverage['/table.js'].lineData[528] = 0;
  _$jscoverage['/table.js'].lineData[529] = 0;
  _$jscoverage['/table.js'].lineData[530] = 0;
  _$jscoverage['/table.js'].lineData[531] = 0;
  _$jscoverage['/table.js'].lineData[532] = 0;
  _$jscoverage['/table.js'].lineData[534] = 0;
  _$jscoverage['/table.js'].lineData[536] = 0;
  _$jscoverage['/table.js'].lineData[545] = 0;
  _$jscoverage['/table.js'].lineData[549] = 0;
  _$jscoverage['/table.js'].lineData[564] = 0;
}
if (! _$jscoverage['/table.js'].functionData) {
  _$jscoverage['/table.js'].functionData = [];
  _$jscoverage['/table.js'].functionData[0] = 0;
  _$jscoverage['/table.js'].functionData[1] = 0;
  _$jscoverage['/table.js'].functionData[2] = 0;
  _$jscoverage['/table.js'].functionData[3] = 0;
  _$jscoverage['/table.js'].functionData[4] = 0;
  _$jscoverage['/table.js'].functionData[5] = 0;
  _$jscoverage['/table.js'].functionData[6] = 0;
  _$jscoverage['/table.js'].functionData[7] = 0;
  _$jscoverage['/table.js'].functionData[8] = 0;
  _$jscoverage['/table.js'].functionData[9] = 0;
  _$jscoverage['/table.js'].functionData[10] = 0;
  _$jscoverage['/table.js'].functionData[11] = 0;
  _$jscoverage['/table.js'].functionData[12] = 0;
  _$jscoverage['/table.js'].functionData[13] = 0;
  _$jscoverage['/table.js'].functionData[14] = 0;
  _$jscoverage['/table.js'].functionData[15] = 0;
  _$jscoverage['/table.js'].functionData[16] = 0;
  _$jscoverage['/table.js'].functionData[17] = 0;
  _$jscoverage['/table.js'].functionData[18] = 0;
  _$jscoverage['/table.js'].functionData[19] = 0;
  _$jscoverage['/table.js'].functionData[20] = 0;
  _$jscoverage['/table.js'].functionData[21] = 0;
  _$jscoverage['/table.js'].functionData[22] = 0;
  _$jscoverage['/table.js'].functionData[23] = 0;
  _$jscoverage['/table.js'].functionData[24] = 0;
  _$jscoverage['/table.js'].functionData[25] = 0;
  _$jscoverage['/table.js'].functionData[26] = 0;
  _$jscoverage['/table.js'].functionData[27] = 0;
  _$jscoverage['/table.js'].functionData[28] = 0;
  _$jscoverage['/table.js'].functionData[29] = 0;
  _$jscoverage['/table.js'].functionData[30] = 0;
  _$jscoverage['/table.js'].functionData[31] = 0;
  _$jscoverage['/table.js'].functionData[32] = 0;
}
if (! _$jscoverage['/table.js'].branchData) {
  _$jscoverage['/table.js'].branchData = {};
  _$jscoverage['/table.js'].branchData['22'] = [];
  _$jscoverage['/table.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['27'] = [];
  _$jscoverage['/table.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['27'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['28'] = [];
  _$jscoverage['/table.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['35'] = [];
  _$jscoverage['/table.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['38'] = [];
  _$jscoverage['/table.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['41'] = [];
  _$jscoverage['/table.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['43'] = [];
  _$jscoverage['/table.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['59'] = [];
  _$jscoverage['/table.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['59'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['79'] = [];
  _$jscoverage['/table.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['81'] = [];
  _$jscoverage['/table.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['89'] = [];
  _$jscoverage['/table.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['103'] = [];
  _$jscoverage['/table.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['113'] = [];
  _$jscoverage['/table.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['117'] = [];
  _$jscoverage['/table.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['119'] = [];
  _$jscoverage['/table.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['119'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['131'] = [];
  _$jscoverage['/table.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['131'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['131'][3] = new BranchData();
  _$jscoverage['/table.js'].branchData['132'] = [];
  _$jscoverage['/table.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['132'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['132'][3] = new BranchData();
  _$jscoverage['/table.js'].branchData['135'] = [];
  _$jscoverage['/table.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['136'] = [];
  _$jscoverage['/table.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['142'] = [];
  _$jscoverage['/table.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['145'] = [];
  _$jscoverage['/table.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['157'] = [];
  _$jscoverage['/table.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['160'] = [];
  _$jscoverage['/table.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['168'] = [];
  _$jscoverage['/table.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['171'] = [];
  _$jscoverage['/table.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['175'] = [];
  _$jscoverage['/table.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['179'] = [];
  _$jscoverage['/table.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['188'] = [];
  _$jscoverage['/table.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['193'] = [];
  _$jscoverage['/table.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['200'] = [];
  _$jscoverage['/table.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['201'] = [];
  _$jscoverage['/table.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['207'] = [];
  _$jscoverage['/table.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['208'] = [];
  _$jscoverage['/table.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['215'] = [];
  _$jscoverage['/table.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['217'] = [];
  _$jscoverage['/table.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['226'] = [];
  _$jscoverage['/table.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['230'] = [];
  _$jscoverage['/table.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['232'] = [];
  _$jscoverage['/table.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['238'] = [];
  _$jscoverage['/table.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['243'] = [];
  _$jscoverage['/table.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['254'] = [];
  _$jscoverage['/table.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['260'] = [];
  _$jscoverage['/table.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['260'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['266'] = [];
  _$jscoverage['/table.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['276'] = [];
  _$jscoverage['/table.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['286'] = [];
  _$jscoverage['/table.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['287'] = [];
  _$jscoverage['/table.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['288'] = [];
  _$jscoverage['/table.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['292'] = [];
  _$jscoverage['/table.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['292'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['292'][3] = new BranchData();
  _$jscoverage['/table.js'].branchData['292'][4] = new BranchData();
  _$jscoverage['/table.js'].branchData['296'] = [];
  _$jscoverage['/table.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['296'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['307'] = [];
  _$jscoverage['/table.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['313'] = [];
  _$jscoverage['/table.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['334'] = [];
  _$jscoverage['/table.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['361'] = [];
  _$jscoverage['/table.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['361'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['362'] = [];
  _$jscoverage['/table.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['374'] = [];
  _$jscoverage['/table.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['376'] = [];
  _$jscoverage['/table.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['390'] = [];
  _$jscoverage['/table.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['401'] = [];
  _$jscoverage['/table.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['402'] = [];
  _$jscoverage['/table.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['413'] = [];
  _$jscoverage['/table.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['426'] = [];
  _$jscoverage['/table.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['427'] = [];
  _$jscoverage['/table.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['429'] = [];
  _$jscoverage['/table.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['444'] = [];
  _$jscoverage['/table.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['444'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['445'] = [];
  _$jscoverage['/table.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['445'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['446'] = [];
  _$jscoverage['/table.js'].branchData['446'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['467'] = [];
  _$jscoverage['/table.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['512'] = [];
  _$jscoverage['/table.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['521'] = [];
  _$jscoverage['/table.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['527'] = [];
  _$jscoverage['/table.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['532'] = [];
  _$jscoverage['/table.js'].branchData['532'][1] = new BranchData();
}
_$jscoverage['/table.js'].branchData['532'][1].init(103, 105, '!statusChecker[content] || statusChecker[content].call(self, editor)');
function visit86_532_1(result) {
  _$jscoverage['/table.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['527'][1].init(30, 8, 'e.newVal');
function visit85_527_1(result) {
  _$jscoverage['/table.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['521'][1].init(94, 17, 'handlers[content]');
function visit84_521_1(result) {
  _$jscoverage['/table.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['512'][1].init(22, 41, 'S.inArray(Dom.nodeName(node), tableRules)');
function visit83_512_1(result) {
  _$jscoverage['/table.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['467'][1].init(246, 43, 'element && placeCursorInCell(element, true)');
function visit82_467_1(result) {
  _$jscoverage['/table.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['446'][1].init(59, 25, 'parent.nodeName() != \'td\'');
function visit81_446_1(result) {
  _$jscoverage['/table.js'].branchData['446'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['445'][2].init(1048, 27, 'parent.nodeName() != \'body\'');
function visit80_445_2(result) {
  _$jscoverage['/table.js'].branchData['445'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['445'][1].init(64, 85, 'parent.nodeName() != \'body\' && parent.nodeName() != \'td\'');
function visit79_445_1(result) {
  _$jscoverage['/table.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['444'][2].init(981, 32, 'parent[0].childNodes.length == 1');
function visit78_444_2(result) {
  _$jscoverage['/table.js'].branchData['444'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['444'][1].init(981, 150, 'parent[0].childNodes.length == 1 && parent.nodeName() != \'body\' && parent.nodeName() != \'td\'');
function visit77_444_1(result) {
  _$jscoverage['/table.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['429'][1].init(315, 6, '!table');
function visit76_429_1(result) {
  _$jscoverage['/table.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['427'][1].init(161, 56, 'startElement && startElement.closest(\'table\', undefined)');
function visit75_427_1(result) {
  _$jscoverage['/table.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['426'][1].init(82, 40, 'selection && selection.getStartElement()');
function visit74_426_1(result) {
  _$jscoverage['/table.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['413'][1].init(120, 4, 'info');
function visit73_413_1(result) {
  _$jscoverage['/table.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['402'][1].init(148, 41, 'dataProcessor && dataProcessor.htmlFilter');
function visit72_402_1(result) {
  _$jscoverage['/table.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['401'][1].init(75, 41, 'dataProcessor && dataProcessor.dataFilter');
function visit71_401_1(result) {
  _$jscoverage['/table.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['390'][1].init(24, 12, 'config || {}');
function visit70_390_1(result) {
  _$jscoverage['/table.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['376'][1].init(110, 1, 'v');
function visit69_376_1(result) {
  _$jscoverage['/table.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['374'][1].init(96, 8, 'cssClass');
function visit68_374_1(result) {
  _$jscoverage['/table.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['362'][1].init(64, 14, 'cssClass || ""');
function visit67_362_1(result) {
  _$jscoverage['/table.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['361'][2].init(186, 11, 'border <= 0');
function visit66_361_2(result) {
  _$jscoverage['/table.js'].branchData['361'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['361'][1].init(175, 22, '!border || border <= 0');
function visit65_361_1(result) {
  _$jscoverage['/table.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['334'][1].init(-1, 14, 'UA[\'ie\'] === 6');
function visit64_334_1(result) {
  _$jscoverage['/table.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['313'][1].init(53, 15, 'info && info.tr');
function visit63_313_1(result) {
  _$jscoverage['/table.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['307'][1].init(53, 15, 'info && info.td');
function visit62_307_1(result) {
  _$jscoverage['/table.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['296'][2].init(83, 12, 'name == "tr"');
function visit61_296_2(result) {
  _$jscoverage['/table.js'].branchData['296'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['296'][1].init(62, 33, 'table.contains(n) && name == "tr"');
function visit60_296_1(result) {
  _$jscoverage['/table.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['292'][4].init(100, 12, 'name == "th"');
function visit59_292_4(result) {
  _$jscoverage['/table.js'].branchData['292'][4].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['292'][3].init(84, 12, 'name == "td"');
function visit58_292_3(result) {
  _$jscoverage['/table.js'].branchData['292'][3].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['292'][2].init(84, 28, 'name == "td" || name == "th"');
function visit57_292_2(result) {
  _$jscoverage['/table.js'].branchData['292'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['292'][1].init(62, 51, 'table.contains(n) && (name == "td" || name == "th")');
function visit56_292_1(result) {
  _$jscoverage['/table.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['288'][1].init(211, 6, '!table');
function visit55_288_1(result) {
  _$jscoverage['/table.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['287'][1].init(129, 56, 'startElement && startElement.closest(\'table\', undefined)');
function visit54_287_1(result) {
  _$jscoverage['/table.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['286'][1].init(66, 40, 'selection && selection.getStartElement()');
function visit53_286_1(result) {
  _$jscoverage['/table.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['276'][1].init(76, 89, '!range[\'moveToElementEditablePosition\'](cell, placeAtEnd ? true : undefined)');
function visit52_276_1(result) {
  _$jscoverage['/table.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['266'][1].init(430, 25, 'row[0].cells[cellIndex]');
function visit51_266_1(result) {
  _$jscoverage['/table.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['260'][2].init(243, 24, 'row[0].cells.length == 1');
function visit50_260_2(result) {
  _$jscoverage['/table.js'].branchData['260'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['260'][1].init(229, 38, '!cellIndex && row[0].cells.length == 1');
function visit49_260_1(result) {
  _$jscoverage['/table.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['254'][1].init(502, 6, 'i >= 0');
function visit48_254_1(result) {
  _$jscoverage['/table.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['243'][1].init(146, 6, '!table');
function visit47_243_1(result) {
  _$jscoverage['/table.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['238'][1].init(512, 31, 'selectionOrCell instanceof Node');
function visit46_238_1(result) {
  _$jscoverage['/table.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['232'][1].init(73, 17, 'colsToDelete[i]');
function visit45_232_1(result) {
  _$jscoverage['/table.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['230'][1].init(198, 6, 'i >= 0');
function visit44_230_1(result) {
  _$jscoverage['/table.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['226'][1].init(14, 43, 'selectionOrCell instanceof Editor.Selection');
function visit43_226_1(result) {
  _$jscoverage['/table.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['217'][1].init(76, 10, 'targetCell');
function visit42_217_1(result) {
  _$jscoverage['/table.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['215'][1].init(47, 10, 'i < length');
function visit41_215_1(result) {
  _$jscoverage['/table.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['208'][1].init(28, 22, 'cellIndexList[0] > 0');
function visit40_208_1(result) {
  _$jscoverage['/table.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['207'][1].init(695, 12, '!targetIndex');
function visit39_207_1(result) {
  _$jscoverage['/table.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['201'][1].init(18, 47, 'cellIndexList[i] - cellIndexList[i - 1] > 1');
function visit38_201_1(result) {
  _$jscoverage['/table.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['200'][1].init(56, 10, 'i < length');
function visit37_200_1(result) {
  _$jscoverage['/table.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['193'][1].init(256, 10, 'i < length');
function visit36_193_1(result) {
  _$jscoverage['/table.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['188'][1].init(44, 40, 'cells[0] && cells[0].parent(\'table\')');
function visit35_188_1(result) {
  _$jscoverage['/table.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['179'][1].init(483, 12, 'insertBefore');
function visit34_179_1(result) {
  _$jscoverage['/table.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['175'][1].init(288, 9, '!UA[\'ie\']');
function visit33_175_1(result) {
  _$jscoverage['/table.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['171'][1].init(127, 37, '$row.cells.length < (cellIndex + 1)');
function visit32_171_1(result) {
  _$jscoverage['/table.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['168'][1].init(496, 24, 'i < table[0].rows.length');
function visit31_168_1(result) {
  _$jscoverage['/table.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['160'][1].init(249, 5, '!cell');
function visit30_160_1(result) {
  _$jscoverage['/table.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['157'][1].init(67, 95, 'startElement.closest(\'td\', undefined) || startElement.closest(\'th\', undefined)');
function visit29_157_1(result) {
  _$jscoverage['/table.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['145'][1].init(73, 25, 'table[0].rows.length == 1');
function visit28_145_1(result) {
  _$jscoverage['/table.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['142'][1].init(1598, 30, 'selectionOrRow instanceof Node');
function visit27_142_1(result) {
  _$jscoverage['/table.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['136'][1].init(22, 17, 'rowsToDelete[i]');
function visit26_136_1(result) {
  _$jscoverage['/table.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['135'][1].init(1349, 6, 'i >= 0');
function visit25_135_1(result) {
  _$jscoverage['/table.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['132'][3].init(127, 20, 'previousRowIndex > 0');
function visit24_132_3(result) {
  _$jscoverage['/table.js'].branchData['132'][3].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['132'][2].init(126, 57, 'previousRowIndex > 0 && table[0].rows[previousRowIndex]');
function visit23_132_2(result) {
  _$jscoverage['/table.js'].branchData['132'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['132'][1].init(80, 101, 'previousRowIndex > 0 && table[0].rows[previousRowIndex] || table[0].parentNode');
function visit22_132_1(result) {
  _$jscoverage['/table.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['131'][3].init(45, 23, 'nextRowIndex < rowCount');
function visit21_131_3(result) {
  _$jscoverage['/table.js'].branchData['131'][3].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['131'][2].init(44, 56, 'nextRowIndex < rowCount && table[0].rows[nextRowIndex]');
function visit20_131_2(result) {
  _$jscoverage['/table.js'].branchData['131'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['131'][1].init(26, 182, 'nextRowIndex < rowCount && table[0].rows[nextRowIndex] || previousRowIndex > 0 && table[0].rows[previousRowIndex] || table[0].parentNode');
function visit19_131_1(result) {
  _$jscoverage['/table.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['119'][2].init(226, 19, 'i == cellsCount - 1');
function visit18_119_2(result) {
  _$jscoverage['/table.js'].branchData['119'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['119'][1].init(226, 54, 'i == cellsCount - 1 && (nextRowIndex = rowIndex + 1)');
function visit17_119_1(result) {
  _$jscoverage['/table.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['117'][1].init(117, 41, '!i && (previousRowIndex = rowIndex - 1)');
function visit16_117_1(result) {
  _$jscoverage['/table.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['113'][1].init(372, 14, 'i < cellsCount');
function visit15_113_1(result) {
  _$jscoverage['/table.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['103'][1].init(14, 42, 'selectionOrRow instanceof Editor.Selection');
function visit14_103_1(result) {
  _$jscoverage['/table.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['89'][1].init(133, 4, '!row');
function visit13_89_1(result) {
  _$jscoverage['/table.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['81'][1].init(59, 9, '!UA[\'ie\']');
function visit12_81_1(result) {
  _$jscoverage['/table.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['79'][1].init(130, 17, 'i < $cells.length');
function visit11_79_1(result) {
  _$jscoverage['/table.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['59'][2].init(437, 95, 'cellNodeRegex.test(parent.nodeName()) && !parent.data(\'selected_cell\')');
function visit10_59_2(result) {
  _$jscoverage['/table.js'].branchData['59'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['59'][1].init(427, 105, 'parent && cellNodeRegex.test(parent.nodeName()) && !parent.data(\'selected_cell\')');
function visit9_59_1(result) {
  _$jscoverage['/table.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['43'][1].init(304, 11, 'nearestCell');
function visit8_43_1(result) {
  _$jscoverage['/table.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['41'][1].init(77, 97, 'startNode.closest(\'td\', undefined) || startNode.closest(\'th\', undefined)');
function visit7_41_1(result) {
  _$jscoverage['/table.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['38'][1].init(58, 15, 'range.collapsed');
function visit6_38_1(result) {
  _$jscoverage['/table.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['35'][1].init(929, 17, 'i < ranges.length');
function visit5_35_1(result) {
  _$jscoverage['/table.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['28'][1].init(65, 83, 'cellNodeRegex.test(node.nodeName()) && !node.data(\'selected_cell\')');
function visit4_28_1(result) {
  _$jscoverage['/table.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['27'][2].init(257, 45, 'node[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit3_27_2(result) {
  _$jscoverage['/table.js'].branchData['27'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['27'][1].init(257, 149, 'node[0].nodeType == Dom.NodeType.ELEMENT_NODE && cellNodeRegex.test(node.nodeName()) && !node.data(\'selected_cell\')');
function visit2_27_1(result) {
  _$jscoverage['/table.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['22'][1].init(64, 17, 'retval.length > 0');
function visit1_22_1(result) {
  _$jscoverage['/table.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].lineData[5]++;
KISSY.add("editor/plugin/table", function(S, Editor, DialogLoader) {
  _$jscoverage['/table.js'].functionData[0]++;
  _$jscoverage['/table.js'].lineData[6]++;
  var UA = S.UA, Dom = S.DOM, Node = S.Node, tableRules = ["tr", "th", "td", "tbody", "table"], cellNodeRegex = /^(?:td|th)$/;
  _$jscoverage['/table.js'].lineData[12]++;
  function getSelectedCells(selection) {
    _$jscoverage['/table.js'].functionData[1]++;
    _$jscoverage['/table.js'].lineData[15]++;
    var bookmarks = selection.createBookmarks(), ranges = selection.getRanges(), retval = [], database = {};
    _$jscoverage['/table.js'].lineData[20]++;
    function moveOutOfCellGuard(node) {
      _$jscoverage['/table.js'].functionData[2]++;
      _$jscoverage['/table.js'].lineData[22]++;
      if (visit1_22_1(retval.length > 0)) {
        _$jscoverage['/table.js'].lineData[23]++;
        return;
      }
      _$jscoverage['/table.js'].lineData[27]++;
      if (visit2_27_1(visit3_27_2(node[0].nodeType == Dom.NodeType.ELEMENT_NODE) && visit4_28_1(cellNodeRegex.test(node.nodeName()) && !node.data('selected_cell')))) {
        _$jscoverage['/table.js'].lineData[30]++;
        node._4e_setMarker(database, 'selected_cell', true, undefined);
        _$jscoverage['/table.js'].lineData[31]++;
        retval.push(node);
      }
    }
    _$jscoverage['/table.js'].lineData[35]++;
    for (var i = 0; visit5_35_1(i < ranges.length); i++) {
      _$jscoverage['/table.js'].lineData[36]++;
      var range = ranges[i];
      _$jscoverage['/table.js'].lineData[38]++;
      if (visit6_38_1(range.collapsed)) {
        _$jscoverage['/table.js'].lineData[40]++;
        var startNode = range.getCommonAncestor(), nearestCell = visit7_41_1(startNode.closest('td', undefined) || startNode.closest('th', undefined));
        _$jscoverage['/table.js'].lineData[43]++;
        if (visit8_43_1(nearestCell)) {
          _$jscoverage['/table.js'].lineData[44]++;
          retval.push(nearestCell);
        }
      } else {
        _$jscoverage['/table.js'].lineData[46]++;
        var walker = new Walker(range), node;
        _$jscoverage['/table.js'].lineData[48]++;
        walker.guard = moveOutOfCellGuard;
        _$jscoverage['/table.js'].lineData[50]++;
        while ((node = walker.next())) {
          _$jscoverage['/table.js'].lineData[58]++;
          var parent = node.parent();
          _$jscoverage['/table.js'].lineData[59]++;
          if (visit9_59_1(parent && visit10_59_2(cellNodeRegex.test(parent.nodeName()) && !parent.data('selected_cell')))) {
            _$jscoverage['/table.js'].lineData[61]++;
            parent._4e_setMarker(database, 'selected_cell', true, undefined);
            _$jscoverage['/table.js'].lineData[62]++;
            retval.push(parent);
          }
        }
      }
    }
    _$jscoverage['/table.js'].lineData[68]++;
    Editor.Utils.clearAllMarkers(database);
    _$jscoverage['/table.js'].lineData[70]++;
    selection.selectBookmarks(bookmarks);
    _$jscoverage['/table.js'].lineData[72]++;
    return retval;
  }
  _$jscoverage['/table.js'].lineData[75]++;
  function clearRow($tr) {
    _$jscoverage['/table.js'].functionData[3]++;
    _$jscoverage['/table.js'].lineData[77]++;
    var $cells = $tr.cells;
    _$jscoverage['/table.js'].lineData[79]++;
    for (var i = 0; visit11_79_1(i < $cells.length); i++) {
      _$jscoverage['/table.js'].lineData[80]++;
      $cells[i].innerHTML = '';
      _$jscoverage['/table.js'].lineData[81]++;
      if (visit12_81_1(!UA['ie'])) {
        _$jscoverage['/table.js'].lineData[82]++;
        (new Node($cells[i]))._4e_appendBogus(undefined);
      }
    }
  }
  _$jscoverage['/table.js'].lineData[86]++;
  function insertRow(selection, insertBefore) {
    _$jscoverage['/table.js'].functionData[4]++;
    _$jscoverage['/table.js'].lineData[88]++;
    var row = selection.getStartElement().parent('tr');
    _$jscoverage['/table.js'].lineData[89]++;
    if (visit13_89_1(!row)) {
      _$jscoverage['/table.js'].lineData[90]++;
      return;
    }
    _$jscoverage['/table.js'].lineData[93]++;
    var newRow = row.clone(true);
    _$jscoverage['/table.js'].lineData[95]++;
    newRow.insertBefore(row);
    _$jscoverage['/table.js'].lineData[99]++;
    clearRow(insertBefore ? newRow[0] : row[0]);
  }
  _$jscoverage['/table.js'].lineData[102]++;
  function deleteRows(selectionOrRow) {
    _$jscoverage['/table.js'].functionData[5]++;
    _$jscoverage['/table.js'].lineData[103]++;
    if (visit14_103_1(selectionOrRow instanceof Editor.Selection)) {
      _$jscoverage['/table.js'].lineData[104]++;
      var cells = getSelectedCells(selectionOrRow), cellsCount = cells.length, rowsToDelete = [], cursorPosition, previousRowIndex, nextRowIndex;
      _$jscoverage['/table.js'].lineData[113]++;
      for (var i = 0; visit15_113_1(i < cellsCount); i++) {
        _$jscoverage['/table.js'].lineData[114]++;
        var row = cells[i].parent(), rowIndex = row[0].rowIndex;
        _$jscoverage['/table.js'].lineData[117]++;
        visit16_117_1(!i && (previousRowIndex = rowIndex - 1));
        _$jscoverage['/table.js'].lineData[118]++;
        rowsToDelete[rowIndex] = row;
        _$jscoverage['/table.js'].lineData[119]++;
        visit17_119_1(visit18_119_2(i == cellsCount - 1) && (nextRowIndex = rowIndex + 1));
      }
      _$jscoverage['/table.js'].lineData[122]++;
      var table = row.parent('table'), rows = table[0].rows, rowCount = rows.length;
      _$jscoverage['/table.js'].lineData[130]++;
      cursorPosition = new Node(visit19_131_1(visit20_131_2(visit21_131_3(nextRowIndex < rowCount) && table[0].rows[nextRowIndex]) || visit22_132_1(visit23_132_2(visit24_132_3(previousRowIndex > 0) && table[0].rows[previousRowIndex]) || table[0].parentNode)));
      _$jscoverage['/table.js'].lineData[135]++;
      for (i = rowsToDelete.length; visit25_135_1(i >= 0); i--) {
        _$jscoverage['/table.js'].lineData[136]++;
        if (visit26_136_1(rowsToDelete[i])) {
          _$jscoverage['/table.js'].lineData[137]++;
          deleteRows(rowsToDelete[i]);
        }
      }
      _$jscoverage['/table.js'].lineData[140]++;
      return cursorPosition;
    } else {
      _$jscoverage['/table.js'].lineData[142]++;
      if (visit27_142_1(selectionOrRow instanceof Node)) {
        _$jscoverage['/table.js'].lineData[143]++;
        table = selectionOrRow.parent('table');
        _$jscoverage['/table.js'].lineData[145]++;
        if (visit28_145_1(table[0].rows.length == 1)) {
          _$jscoverage['/table.js'].lineData[146]++;
          table.remove();
        } else {
          _$jscoverage['/table.js'].lineData[148]++;
          selectionOrRow.remove();
        }
      }
    }
    _$jscoverage['/table.js'].lineData[151]++;
    return 0;
  }
  _$jscoverage['/table.js'].lineData[154]++;
  function insertColumn(selection, insertBefore) {
    _$jscoverage['/table.js'].functionData[6]++;
    _$jscoverage['/table.js'].lineData[156]++;
    var startElement = selection.getStartElement(), cell = visit29_157_1(startElement.closest('td', undefined) || startElement.closest('th', undefined));
    _$jscoverage['/table.js'].lineData[160]++;
    if (visit30_160_1(!cell)) {
      _$jscoverage['/table.js'].lineData[161]++;
      return;
    }
    _$jscoverage['/table.js'].lineData[165]++;
    var table = cell.parent('table'), cellIndex = cell[0].cellIndex;
    _$jscoverage['/table.js'].lineData[168]++;
    for (var i = 0; visit31_168_1(i < table[0].rows.length); i++) {
      _$jscoverage['/table.js'].lineData[169]++;
      var $row = table[0].rows[i];
      _$jscoverage['/table.js'].lineData[171]++;
      if (visit32_171_1($row.cells.length < (cellIndex + 1))) {
        _$jscoverage['/table.js'].lineData[172]++;
        continue;
      }
      _$jscoverage['/table.js'].lineData[173]++;
      cell = new Node($row.cells[cellIndex].cloneNode(undefined));
      _$jscoverage['/table.js'].lineData[175]++;
      if (visit33_175_1(!UA['ie'])) {
        _$jscoverage['/table.js'].lineData[176]++;
        cell._4e_appendBogus(undefined);
      }
      _$jscoverage['/table.js'].lineData[178]++;
      var baseCell = new Node($row.cells[cellIndex]);
      _$jscoverage['/table.js'].lineData[179]++;
      if (visit34_179_1(insertBefore)) {
        _$jscoverage['/table.js'].lineData[180]++;
        cell.insertBefore(baseCell);
      } else {
        _$jscoverage['/table.js'].lineData[182]++;
        cell.insertAfter(baseCell);
      }
    }
  }
  _$jscoverage['/table.js'].lineData[186]++;
  function getFocusElementAfterDelCols(cells) {
    _$jscoverage['/table.js'].functionData[7]++;
    _$jscoverage['/table.js'].lineData[187]++;
    var cellIndexList = [], table = visit35_188_1(cells[0] && cells[0].parent('table')), i, length, targetIndex, targetCell;
    _$jscoverage['/table.js'].lineData[193]++;
    for (i = 0 , length = cells.length; visit36_193_1(i < length); i++) {
      _$jscoverage['/table.js'].lineData[194]++;
      cellIndexList.push(cells[i][0].cellIndex);
    }
    _$jscoverage['/table.js'].lineData[198]++;
    cellIndexList.sort();
    _$jscoverage['/table.js'].lineData[199]++;
    for (i = 1 , length = cellIndexList.length; visit37_200_1(i < length); i++) {
      _$jscoverage['/table.js'].lineData[201]++;
      if (visit38_201_1(cellIndexList[i] - cellIndexList[i - 1] > 1)) {
        _$jscoverage['/table.js'].lineData[202]++;
        targetIndex = cellIndexList[i - 1] + 1;
        _$jscoverage['/table.js'].lineData[203]++;
        break;
      }
    }
    _$jscoverage['/table.js'].lineData[207]++;
    if (visit39_207_1(!targetIndex)) {
      _$jscoverage['/table.js'].lineData[208]++;
      targetIndex = visit40_208_1(cellIndexList[0] > 0) ? (cellIndexList[0] - 1) : (cellIndexList[cellIndexList.length - 1] + 1);
    }
    _$jscoverage['/table.js'].lineData[213]++;
    var rows = table[0].rows;
    _$jscoverage['/table.js'].lineData[214]++;
    for (i = 0 , length = rows.length; visit41_215_1(i < length); i++) {
      _$jscoverage['/table.js'].lineData[216]++;
      targetCell = rows[i].cells[targetIndex];
      _$jscoverage['/table.js'].lineData[217]++;
      if (visit42_217_1(targetCell)) {
        _$jscoverage['/table.js'].lineData[218]++;
        break;
      }
    }
    _$jscoverage['/table.js'].lineData[222]++;
    return targetCell ? new Node(targetCell) : table.prev();
  }
  _$jscoverage['/table.js'].lineData[225]++;
  function deleteColumns(selectionOrCell) {
    _$jscoverage['/table.js'].functionData[8]++;
    _$jscoverage['/table.js'].lineData[226]++;
    if (visit43_226_1(selectionOrCell instanceof Editor.Selection)) {
      _$jscoverage['/table.js'].lineData[227]++;
      var colsToDelete = getSelectedCells(selectionOrCell), elementToFocus = getFocusElementAfterDelCols(colsToDelete);
      _$jscoverage['/table.js'].lineData[230]++;
      for (var i = colsToDelete.length - 1; visit44_230_1(i >= 0); i--) {
        _$jscoverage['/table.js'].lineData[232]++;
        if (visit45_232_1(colsToDelete[i])) {
          _$jscoverage['/table.js'].lineData[233]++;
          deleteColumns(colsToDelete[i]);
        }
      }
      _$jscoverage['/table.js'].lineData[237]++;
      return elementToFocus;
    } else {
      _$jscoverage['/table.js'].lineData[238]++;
      if (visit46_238_1(selectionOrCell instanceof Node)) {
        _$jscoverage['/table.js'].lineData[240]++;
        var table = selectionOrCell.parent('table');
        _$jscoverage['/table.js'].lineData[243]++;
        if (visit47_243_1(!table)) {
          _$jscoverage['/table.js'].lineData[244]++;
          return null;
        }
        _$jscoverage['/table.js'].lineData[247]++;
        var cellIndex = selectionOrCell[0].cellIndex;
        _$jscoverage['/table.js'].lineData[254]++;
        for (i = table[0].rows.length - 1; visit48_254_1(i >= 0); i--) {
          _$jscoverage['/table.js'].lineData[256]++;
          var row = new Node(table[0].rows[i]);
          _$jscoverage['/table.js'].lineData[260]++;
          if (visit49_260_1(!cellIndex && visit50_260_2(row[0].cells.length == 1))) {
            _$jscoverage['/table.js'].lineData[261]++;
            deleteRows(row);
            _$jscoverage['/table.js'].lineData[262]++;
            continue;
          }
          _$jscoverage['/table.js'].lineData[266]++;
          if (visit51_266_1(row[0].cells[cellIndex])) {
            _$jscoverage['/table.js'].lineData[267]++;
            row[0].removeChild(row[0].cells[cellIndex]);
          }
        }
      }
    }
    _$jscoverage['/table.js'].lineData[271]++;
    return null;
  }
  _$jscoverage['/table.js'].lineData[274]++;
  function placeCursorInCell(cell, placeAtEnd) {
    _$jscoverage['/table.js'].functionData[9]++;
    _$jscoverage['/table.js'].lineData[275]++;
    var range = new Editor.Range(cell[0].ownerDocument);
    _$jscoverage['/table.js'].lineData[276]++;
    if (visit52_276_1(!range['moveToElementEditablePosition'](cell, placeAtEnd ? true : undefined))) {
      _$jscoverage['/table.js'].lineData[278]++;
      range.selectNodeContents(cell);
      _$jscoverage['/table.js'].lineData[279]++;
      range.collapse(placeAtEnd ? false : true);
    }
    _$jscoverage['/table.js'].lineData[281]++;
    range.select(true);
  }
  _$jscoverage['/table.js'].lineData[284]++;
  function getSel(editor) {
    _$jscoverage['/table.js'].functionData[10]++;
    _$jscoverage['/table.js'].lineData[285]++;
    var selection = editor.getSelection(), startElement = visit53_286_1(selection && selection.getStartElement()), table = visit54_287_1(startElement && startElement.closest('table', undefined));
    _$jscoverage['/table.js'].lineData[288]++;
    if (visit55_288_1(!table)) {
      _$jscoverage['/table.js'].lineData[289]++;
      return undefined;
    }
    _$jscoverage['/table.js'].lineData[290]++;
    var td = startElement.closest(function(n) {
  _$jscoverage['/table.js'].functionData[11]++;
  _$jscoverage['/table.js'].lineData[291]++;
  var name = Dom.nodeName(n);
  _$jscoverage['/table.js'].lineData[292]++;
  return visit56_292_1(table.contains(n) && (visit57_292_2(visit58_292_3(name == "td") || visit59_292_4(name == "th"))));
}, undefined);
    _$jscoverage['/table.js'].lineData[294]++;
    var tr = startElement.closest(function(n) {
  _$jscoverage['/table.js'].functionData[12]++;
  _$jscoverage['/table.js'].lineData[295]++;
  var name = Dom.nodeName(n);
  _$jscoverage['/table.js'].lineData[296]++;
  return visit60_296_1(table.contains(n) && visit61_296_2(name == "tr"));
}, undefined);
    _$jscoverage['/table.js'].lineData[298]++;
    return {
  table: table, 
  td: td, 
  tr: tr};
  }
  _$jscoverage['/table.js'].lineData[305]++;
  function ensureTd(editor) {
    _$jscoverage['/table.js'].functionData[13]++;
    _$jscoverage['/table.js'].lineData[306]++;
    var info = getSel(editor);
    _$jscoverage['/table.js'].lineData[307]++;
    return visit62_307_1(info && info.td);
  }
  _$jscoverage['/table.js'].lineData[311]++;
  function ensureTr(editor) {
    _$jscoverage['/table.js'].functionData[14]++;
    _$jscoverage['/table.js'].lineData[312]++;
    var info = getSel(editor);
    _$jscoverage['/table.js'].lineData[313]++;
    return visit63_313_1(info && info.tr);
  }
  _$jscoverage['/table.js'].lineData[316]++;
  var statusChecker = {
  "\u8868\u683c\u5c5e\u6027": getSel, 
  "\u5220\u9664\u8868\u683c": ensureTd, 
  "\u5220\u9664\u5217": ensureTd, 
  "\u5220\u9664\u884c": ensureTr, 
  '\u5728\u4e0a\u65b9\u63d2\u5165\u884c': ensureTr, 
  '\u5728\u4e0b\u65b9\u63d2\u5165\u884c': ensureTr, 
  '\u5728\u5de6\u4fa7\u63d2\u5165\u5217': ensureTd, 
  '\u5728\u53f3\u4fa7\u63d2\u5165\u5217': ensureTd};
  _$jscoverage['/table.js'].lineData[330]++;
  var showBorderClassName = 'ke_show_border', cssTemplate = (visit64_334_1(UA['ie'] === 6) ? ['table.%2,', 'table.%2 td, table.%2 th,', '{', 'border : #d3d3d3 1px dotted', '}'] : [' table.%2,', ' table.%2 > tr > td,  table.%2 > tr > th,', ' table.%2 > tbody > tr > td,  table.%2 > tbody > tr > th,', ' table.%2 > thead > tr > td,  table.%2 > thead > tr > th,', ' table.%2 > tfoot > tr > td,  table.%2 > tfoot > tr > th', '{', 'border : #d3d3d3 1px dotted', '}']).join(''), cssStyleText = cssTemplate.replace(/%2/g, showBorderClassName), extraDataFilter = {
  tags: {
  'table': function(element) {
  _$jscoverage['/table.js'].functionData[15]++;
  _$jscoverage['/table.js'].lineData[358]++;
  var cssClass = element.getAttribute("class"), border = parseInt(element.getAttribute("border"), 10);
  _$jscoverage['/table.js'].lineData[361]++;
  if (visit65_361_1(!border || visit66_361_2(border <= 0))) {
    _$jscoverage['/table.js'].lineData[362]++;
    element.setAttribute("class", S.trim((visit67_362_1(cssClass || "")) + ' ' + showBorderClassName));
  }
}}}, extraHTMLFilter = {
  tags: {
  'table': function(table) {
  _$jscoverage['/table.js'].functionData[16]++;
  _$jscoverage['/table.js'].lineData[372]++;
  var cssClass = table.getAttribute("class"), v;
  _$jscoverage['/table.js'].lineData[374]++;
  if (visit68_374_1(cssClass)) {
    _$jscoverage['/table.js'].lineData[375]++;
    v = S.trim(cssClass.replace(showBorderClassName, ""));
    _$jscoverage['/table.js'].lineData[376]++;
    if (visit69_376_1(v)) {
      _$jscoverage['/table.js'].lineData[377]++;
      table.setAttribute("class", v);
    } else {
      _$jscoverage['/table.js'].lineData[379]++;
      table.removeAttribute("class");
    }
  }
}}};
  _$jscoverage['/table.js'].lineData[389]++;
  function TablePlugin(config) {
    _$jscoverage['/table.js'].functionData[17]++;
    _$jscoverage['/table.js'].lineData[390]++;
    this.config = visit70_390_1(config || {});
  }
  _$jscoverage['/table.js'].lineData[393]++;
  S.augment(TablePlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/table.js'].functionData[18]++;
  _$jscoverage['/table.js'].lineData[398]++;
  editor.addCustomStyle(cssStyleText);
  _$jscoverage['/table.js'].lineData[400]++;
  var dataProcessor = editor.htmlDataProcessor, dataFilter = visit71_401_1(dataProcessor && dataProcessor.dataFilter), htmlFilter = visit72_402_1(dataProcessor && dataProcessor.htmlFilter);
  _$jscoverage['/table.js'].lineData[404]++;
  dataFilter.addRules(extraDataFilter);
  _$jscoverage['/table.js'].lineData[405]++;
  htmlFilter.addRules(extraHTMLFilter);
  _$jscoverage['/table.js'].lineData[407]++;
  var self = this, handlers = {
  "\u8868\u683c\u5c5e\u6027": function() {
  _$jscoverage['/table.js'].functionData[19]++;
  _$jscoverage['/table.js'].lineData[411]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[412]++;
  var info = getSel(editor);
  _$jscoverage['/table.js'].lineData[413]++;
  if (visit73_413_1(info)) {
    _$jscoverage['/table.js'].lineData[414]++;
    DialogLoader.useDialog(editor, "table", self.config, {
  selectedTable: info.table, 
  selectedTd: info.td});
  }
}, 
  "\u5220\u9664\u8868\u683c": function() {
  _$jscoverage['/table.js'].functionData[20]++;
  _$jscoverage['/table.js'].lineData[424]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[425]++;
  var selection = editor.getSelection(), startElement = visit74_426_1(selection && selection.getStartElement()), table = visit75_427_1(startElement && startElement.closest('table', undefined));
  _$jscoverage['/table.js'].lineData[429]++;
  if (visit76_429_1(!table)) {
    _$jscoverage['/table.js'].lineData[430]++;
    return;
  }
  _$jscoverage['/table.js'].lineData[433]++;
  editor.execCommand("save");
  _$jscoverage['/table.js'].lineData[436]++;
  selection.selectElement(table);
  _$jscoverage['/table.js'].lineData[437]++;
  var range = selection.getRanges()[0];
  _$jscoverage['/table.js'].lineData[438]++;
  range.collapse();
  _$jscoverage['/table.js'].lineData[439]++;
  selection.selectRanges([range]);
  _$jscoverage['/table.js'].lineData[443]++;
  var parent = table.parent();
  _$jscoverage['/table.js'].lineData[444]++;
  if (visit77_444_1(visit78_444_2(parent[0].childNodes.length == 1) && visit79_445_1(visit80_445_2(parent.nodeName() != 'body') && visit81_446_1(parent.nodeName() != 'td')))) {
    _$jscoverage['/table.js'].lineData[447]++;
    parent.remove();
  } else {
    _$jscoverage['/table.js'].lineData[449]++;
    table.remove();
  }
  _$jscoverage['/table.js'].lineData[451]++;
  editor.execCommand("save");
}, 
  '\u5220\u9664\u884c ': function() {
  _$jscoverage['/table.js'].functionData[21]++;
  _$jscoverage['/table.js'].lineData[455]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[456]++;
  editor.execCommand("save");
  _$jscoverage['/table.js'].lineData[457]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[458]++;
  placeCursorInCell(deleteRows(selection), undefined);
  _$jscoverage['/table.js'].lineData[459]++;
  editor.execCommand("save");
}, 
  '\u5220\u9664\u5217 ': function() {
  _$jscoverage['/table.js'].functionData[22]++;
  _$jscoverage['/table.js'].lineData[463]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[464]++;
  editor.execCommand("save");
  _$jscoverage['/table.js'].lineData[465]++;
  var selection = editor.getSelection(), element = deleteColumns(selection);
  _$jscoverage['/table.js'].lineData[467]++;
  visit82_467_1(element && placeCursorInCell(element, true));
  _$jscoverage['/table.js'].lineData[468]++;
  editor.execCommand("save");
}, 
  '\u5728\u4e0a\u65b9\u63d2\u5165\u884c': function() {
  _$jscoverage['/table.js'].functionData[23]++;
  _$jscoverage['/table.js'].lineData[472]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[473]++;
  editor.execCommand("save");
  _$jscoverage['/table.js'].lineData[474]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[475]++;
  insertRow(selection, true);
  _$jscoverage['/table.js'].lineData[476]++;
  editor.execCommand("save");
}, 
  '\u5728\u4e0b\u65b9\u63d2\u5165\u884c': function() {
  _$jscoverage['/table.js'].functionData[24]++;
  _$jscoverage['/table.js'].lineData[480]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[481]++;
  editor.execCommand("save");
  _$jscoverage['/table.js'].lineData[482]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[483]++;
  insertRow(selection, undefined);
  _$jscoverage['/table.js'].lineData[484]++;
  editor.execCommand("save");
}, 
  '\u5728\u5de6\u4fa7\u63d2\u5165\u5217': function() {
  _$jscoverage['/table.js'].functionData[25]++;
  _$jscoverage['/table.js'].lineData[488]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[489]++;
  editor.execCommand("save");
  _$jscoverage['/table.js'].lineData[490]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[491]++;
  insertColumn(selection, true);
  _$jscoverage['/table.js'].lineData[492]++;
  editor.execCommand("save");
}, 
  '\u5728\u53f3\u4fa7\u63d2\u5165\u5217': function() {
  _$jscoverage['/table.js'].functionData[26]++;
  _$jscoverage['/table.js'].lineData[496]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[497]++;
  editor.execCommand("save");
  _$jscoverage['/table.js'].lineData[498]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[499]++;
  insertColumn(selection, undefined);
  _$jscoverage['/table.js'].lineData[500]++;
  editor.execCommand("save");
}};
  _$jscoverage['/table.js'].lineData[504]++;
  var children = [];
  _$jscoverage['/table.js'].lineData[505]++;
  S.each(handlers, function(h, name) {
  _$jscoverage['/table.js'].functionData[27]++;
  _$jscoverage['/table.js'].lineData[506]++;
  children.push({
  content: name});
});
  _$jscoverage['/table.js'].lineData[511]++;
  editor.addContextMenu("table", function(node) {
  _$jscoverage['/table.js'].functionData[28]++;
  _$jscoverage['/table.js'].lineData[512]++;
  if (visit83_512_1(S.inArray(Dom.nodeName(node), tableRules))) {
    _$jscoverage['/table.js'].lineData[513]++;
    return true;
  }
}, {
  width: "120px", 
  children: children, 
  listeners: {
  click: function(e) {
  _$jscoverage['/table.js'].functionData[29]++;
  _$jscoverage['/table.js'].lineData[520]++;
  var content = e.target.get("content");
  _$jscoverage['/table.js'].lineData[521]++;
  if (visit84_521_1(handlers[content])) {
    _$jscoverage['/table.js'].lineData[522]++;
    handlers[content].apply(this);
  }
}, 
  beforeVisibleChange: function(e) {
  _$jscoverage['/table.js'].functionData[30]++;
  _$jscoverage['/table.js'].lineData[527]++;
  if (visit85_527_1(e.newVal)) {
    _$jscoverage['/table.js'].lineData[528]++;
    var self = this, children = self.get("children");
    _$jscoverage['/table.js'].lineData[529]++;
    var editor = self.get("editor");
    _$jscoverage['/table.js'].lineData[530]++;
    S.each(children, function(c) {
  _$jscoverage['/table.js'].functionData[31]++;
  _$jscoverage['/table.js'].lineData[531]++;
  var content = c.get("content");
  _$jscoverage['/table.js'].lineData[532]++;
  if (visit86_532_1(!statusChecker[content] || statusChecker[content].call(self, editor))) {
    _$jscoverage['/table.js'].lineData[534]++;
    c.set("disabled", false);
  } else {
    _$jscoverage['/table.js'].lineData[536]++;
    c.set("disabled", true);
  }
});
  }
}}});
  _$jscoverage['/table.js'].lineData[545]++;
  editor.addButton("table", {
  mode: Editor.Mode.WYSIWYG_MODE, 
  listeners: {
  click: function() {
  _$jscoverage['/table.js'].functionData[32]++;
  _$jscoverage['/table.js'].lineData[549]++;
  DialogLoader.useDialog(editor, "table", self.config, {
  selectedTable: 0, 
  selectedTd: 0});
}}, 
  tooltip: "\u63d2\u5165\u8868\u683c"});
}});
  _$jscoverage['/table.js'].lineData[564]++;
  return TablePlugin;
}, {
  requires: ['editor', './dialog-loader', './contextmenu']});
