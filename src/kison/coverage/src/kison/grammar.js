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
if (! _$jscoverage['/kison/grammar.js']) {
  _$jscoverage['/kison/grammar.js'] = {};
  _$jscoverage['/kison/grammar.js'].lineData = [];
  _$jscoverage['/kison/grammar.js'].lineData[6] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[8] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[9] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[10] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[11] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[12] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[13] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[14] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[15] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[16] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[17] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[30] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[31] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[32] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[36] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[37] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[38] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[39] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[41] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[44] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[45] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[46] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[47] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[50] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[53] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[54] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[56] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[57] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[59] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[60] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[62] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[63] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[65] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[66] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[67] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[69] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[71] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[72] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[73] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[75] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[83] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[85] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[89] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[94] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[95] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[96] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[97] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[98] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[100] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[103] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[104] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[105] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[106] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[107] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[108] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[109] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[113] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[117] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[118] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[119] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[120] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[121] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[127] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[132] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[133] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[136] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[137] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[142] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[144] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[145] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[146] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[155] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[167] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[168] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[173] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[174] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[175] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[176] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[177] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[178] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[181] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[182] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[188] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[190] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[191] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[192] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[193] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[194] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[195] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[205] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[208] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[209] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[210] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[211] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[214] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[216] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[217] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[220] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[225] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[231] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[232] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[233] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[234] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[236] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[238] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[239] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[242] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[244] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[245] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[248] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[253] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[260] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[261] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[269] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[270] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[271] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[272] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[273] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[277] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[279] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[280] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[281] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[282] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[284] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[285] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[286] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[294] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[299] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[300] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[302] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[304] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[311] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[312] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[313] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[314] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[317] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[318] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[320] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[334] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[335] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[336] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[338] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[339] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[340] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[349] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[353] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[355] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[356] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[359] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[360] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[366] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[367] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[368] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[370] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[371] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[375] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[379] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[380] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[381] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[382] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[385] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[391] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[397] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[399] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[409] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[411] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[414] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[416] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[417] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[418] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[419] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[420] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[422] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[423] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[427] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[428] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[431] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[433] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[435] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[436] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[439] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[441] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[442] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[444] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[445] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[448] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[449] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[457] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[460] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[461] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[462] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[463] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[464] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[466] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[468] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[472] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[474] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[475] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[476] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[479] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[480] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[481] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[482] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[486] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[493] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[507] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[508] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[509] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[511] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[513] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[515] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[516] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[517] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[518] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[519] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[520] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[521] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[522] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[523] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[524] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[525] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[526] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[527] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[529] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[530] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[531] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[532] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[533] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[534] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[536] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[539] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[544] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[545] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[546] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[547] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[548] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[549] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[550] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[551] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[553] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[554] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[555] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[556] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[557] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[558] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[560] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[567] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[568] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[569] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[570] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[571] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[572] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[573] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[574] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[575] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[576] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[577] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[579] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[580] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[581] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[582] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[583] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[584] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[585] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[586] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[587] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[588] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[590] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[592] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[593] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[594] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[595] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[596] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[597] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[599] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[600] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[601] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[602] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[603] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[604] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[605] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[606] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[607] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[608] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[610] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[618] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[625] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[626] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[627] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[628] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[631] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[633] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[635] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[636] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[637] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[638] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[639] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[640] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[641] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[642] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[644] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[645] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[647] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[651] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[653] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[654] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[655] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[659] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[663] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[665] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[670] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[672] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[674] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[675] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[677] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[678] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[680] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[683] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[685] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[687] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[692] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[694] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[696] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[697] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[700] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[701] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[702] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[703] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[704] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[711] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[716] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[721] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[726] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[731] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[732] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[734] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[735] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[740] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[747] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[748] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[762] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[764] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[766] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[768] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[769] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[772] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[774] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[776] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[779] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[780] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[782] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[783] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[784] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[787] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[790] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[793] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[795] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[797] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[800] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[803] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[805] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[808] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[817] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[819] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[821] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[822] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[825] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[826] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[829] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[830] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[832] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[835] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[836] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[838] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[840] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[842] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[844] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[846] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[849] = 0;
}
if (! _$jscoverage['/kison/grammar.js'].functionData) {
  _$jscoverage['/kison/grammar.js'].functionData = [];
  _$jscoverage['/kison/grammar.js'].functionData[0] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[1] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[2] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[3] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[4] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[5] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[6] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[7] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[8] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[9] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[10] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[11] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[12] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[13] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[14] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[15] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[16] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[17] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[18] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[19] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[20] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[21] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[22] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[23] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[24] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[25] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[26] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[27] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[28] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[29] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[30] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[31] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[32] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[33] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[34] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[35] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[36] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[37] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[38] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[39] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[40] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[41] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[42] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[43] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[44] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[45] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[46] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[47] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[48] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[49] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[50] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[51] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[52] = 0;
}
if (! _$jscoverage['/kison/grammar.js'].branchData) {
  _$jscoverage['/kison/grammar.js'].branchData = {};
  _$jscoverage['/kison/grammar.js'].branchData['45'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['46'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['66'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['72'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['115'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['119'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['120'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['136'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['145'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['174'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['177'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['181'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['190'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['193'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['208'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['210'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['216'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['231'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['233'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['238'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['244'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['271'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['284'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['318'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['334'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['336'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['359'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['366'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['380'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['381'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['422'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['427'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['435'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['441'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['460'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['462'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['464'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['466'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['511'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['518'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['519'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['519'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['520'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['520'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['521'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['525'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['525'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['539'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['549'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['549'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['569'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['570'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['575'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['575'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['592'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['595'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['595'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['638'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['638'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['640'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['640'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['644'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['644'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['663'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['663'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['677'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['677'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['696'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['696'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['731'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['731'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['768'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['768'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['772'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['772'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['774'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['774'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['779'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['779'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['782'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['782'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['809'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['809'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['810'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['810'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['811'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['811'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['821'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['821'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['825'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['825'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['829'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['829'][1] = new BranchData();
}
_$jscoverage['/kison/grammar.js'].branchData['829'][1].init(931, 17, 'ret !== undefined');
function visit73_829_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['829'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['825'][1].init(807, 13, 'reducedAction');
function visit72_825_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['825'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['821'][1].init(653, 7, 'i < len');
function visit71_821_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['821'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['811'][1].init(260, 31, 'production.rhs || production[1]');
function visit70_811_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['811'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['810'][1].init(186, 34, 'production.action || production[2]');
function visit69_810_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['810'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['809'][1].init(109, 34, 'production.symbol || production[0]');
function visit68_809_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['809'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['782'][1].init(99, 18, 'tableAction[state]');
function visit67_782_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['782'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['779'][1].init(446, 7, '!action');
function visit66_779_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['779'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['774'][1].init(93, 48, 'tableAction[state] && tableAction[state][symbol]');
function visit65_774_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['774'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['772'][1].init(206, 6, 'symbol');
function visit64_772_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['772'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['768'][1].init(122, 7, '!symbol');
function visit63_768_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['768'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['731'][1].init(26, 22, '!(v instanceof Lexer)');
function visit62_731_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['731'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['696'][1].init(956, 18, 'cfg.compressSymbol');
function visit61_696_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['696'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['677'][1].init(129, 6, 'action');
function visit60_677_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['677'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['663'][1].init(20, 9, 'cfg || {}');
function visit59_663_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['663'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['644'][1].init(492, 32, 'type === GrammarConst.SHIFT_TYPE');
function visit58_644_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['644'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['640'][1].init(199, 33, 'type === GrammarConst.REDUCE_TYPE');
function visit57_640_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['640'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['638'][1].init(91, 33, 'type === GrammarConst.ACCEPT_TYPE');
function visit56_638_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['638'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['595'][2].init(200, 9, 'val !== t');
function visit55_595_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['595'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['595'][1].init(195, 14, 't && val !== t');
function visit54_595_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['592'][1].init(37, 14, 'gotos[i] || {}');
function visit53_592_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['575'][2].init(342, 31, 't.toString() !== val.toString()');
function visit52_575_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['575'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['575'][1].init(337, 36, 't && t.toString() !== val.toString()');
function visit51_575_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['570'][1].init(38, 15, 'action[i] || {}');
function visit50_570_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['569'][1].init(56, 21, '!nonTerminals[symbol]');
function visit49_569_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['549'][2].init(336, 31, 't.toString() !== val.toString()');
function visit48_549_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['549'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['549'][1].init(331, 36, 't && t.toString() !== val.toString()');
function visit47_549_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['539'][1].init(42, 15, 'action[i] || {}');
function visit46_539_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['525'][2].init(300, 31, 't.toString() !== val.toString()');
function visit45_525_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['525'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['525'][1].init(295, 36, 't && t.toString() !== val.toString()');
function visit44_525_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['521'][1].init(46, 15, 'action[i] || {}');
function visit43_521_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['520'][1].init(34, 35, 'item.get(\'lookAhead\')[mappedEndTag]');
function visit42_520_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['519'][1].init(30, 43, 'production.get(\'symbol\') === mappedStartTag');
function visit41_519_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['518'][1].init(118, 56, 'item.get(\'dotPosition\') === production.get(\'rhs\').length');
function visit40_518_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['511'][1].init(647, 19, 'i < itemSets.length');
function visit39_511_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['466'][1].init(44, 27, 'k < one.get(\'items\').length');
function visit38_466_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['464'][1].init(66, 21, 'one.equals(two, true)');
function visit37_464_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['462'][1].init(70, 19, 'j < itemSets.length');
function visit36_462_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['460'][1].init(111, 19, 'i < itemSets.length');
function visit35_460_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['441'][1].init(679, 10, 'index > -1');
function visit34_441_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['435'][1].init(483, 23, 'itemSetNew.size() === 0');
function visit33_435_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['427'][1].init(232, 23, 'itemSet.__cache[symbol]');
function visit32_427_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['422'][1].init(32, 16, '!itemSet.__cache');
function visit31_422_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['381'][1].init(22, 27, 'itemSets[i].equals(itemSet)');
function visit30_381_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['380'][1].init(79, 19, 'i < itemSets.length');
function visit29_380_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['366'][1].init(293, 16, 'itemIndex !== -1');
function visit28_366_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['359'][1].init(210, 16, 'markSymbol === x');
function visit27_359_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['336'][1].init(115, 46, 'cont || (!!findItem.addLookAhead(finalFirsts))');
function visit26_336_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['334'][1].init(629, 16, 'itemIndex !== -1');
function visit25_334_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['318'][1].init(30, 30, 'p2.get(\'symbol\') === dotSymbol');
function visit24_318_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['284'][1].init(295, 54, 'setSize(firsts) !== setSize(nonTerminal.get(\'firsts\'))');
function visit23_284_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['271'][1].init(99, 53, 'setSize(firsts) !== setSize(production.get(\'firsts\'))');
function visit22_271_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['244'][1].init(691, 21, '!nonTerminals[symbol]');
function visit21_244_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['238'][1].init(233, 19, '!self.isNullable(t)');
function visit20_238_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['233'][1].init(26, 16, '!nonTerminals[t]');
function visit19_233_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['231'][1].init(196, 23, 'symbol instanceof Array');
function visit18_231_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['216'][1].init(426, 21, '!nonTerminals[symbol]');
function visit17_216_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['210'][1].init(26, 19, '!self.isNullable(t)');
function visit16_210_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['208'][1].init(126, 23, 'symbol instanceof Array');
function visit15_208_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['193'][1].init(34, 26, 'production.get(\'nullable\')');
function visit14_193_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['190'][1].init(28, 37, '!nonTerminals[symbol].get(\'nullable\')');
function visit13_190_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['181'][1].init(300, 7, 'n === i');
function visit12_181_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['177'][1].init(34, 18, 'self.isNullable(t)');
function visit11_177_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['174'][1].init(26, 27, '!production.get(\'nullable\')');
function visit10_174_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['145'][1].init(26, 43, '!terminals[handle] && !nonTerminals[handle]');
function visit9_145_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['136'][1].init(137, 12, '!nonTerminal');
function visit8_136_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['120'][1].init(74, 5, 'token');
function visit7_120_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['119'][1].init(30, 21, 'rule.token || rule[0]');
function visit6_119_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['115'][1].init(85, 20, 'lexer && lexer.rules');
function visit5_115_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['72'][1].init(704, 43, 'action[GrammarConst.TO_INDEX] !== undefined');
function visit4_72_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['66'][1].init(445, 51, 'action[GrammarConst.PRODUCTION_INDEX] !== undefined');
function visit3_66_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['46'][1].init(18, 20, 'obj.equals(array[i])');
function visit2_46_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['45'][1].init(26, 16, 'i < array.length');
function visit1_45_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/kison/grammar.js'].functionData[0]++;
  _$jscoverage['/kison/grammar.js'].lineData[8]++;
  var util = require('util');
  _$jscoverage['/kison/grammar.js'].lineData[9]++;
  var Base = require('base');
  _$jscoverage['/kison/grammar.js'].lineData[10]++;
  var Utils = require('./utils');
  _$jscoverage['/kison/grammar.js'].lineData[11]++;
  var Item = require('./item');
  _$jscoverage['/kison/grammar.js'].lineData[12]++;
  var ItemSet = require('./item-set');
  _$jscoverage['/kison/grammar.js'].lineData[13]++;
  var NonTerminal = require('./non-terminal');
  _$jscoverage['/kison/grammar.js'].lineData[14]++;
  var Lexer = require('./lexer');
  _$jscoverage['/kison/grammar.js'].lineData[15]++;
  var Production = require('./production');
  _$jscoverage['/kison/grammar.js'].lineData[16]++;
  var logger = S.getLogger('s/kison');
  _$jscoverage['/kison/grammar.js'].lineData[17]++;
  var GrammarConst = {
  SHIFT_TYPE: 1, 
  REDUCE_TYPE: 2, 
  ACCEPT_TYPE: 0, 
  TYPE_INDEX: 0, 
  PRODUCTION_INDEX: 1, 
  TO_INDEX: 2}, serializeObject = Utils.serializeObject, END_TAG = Lexer.STATIC.END_TAG, START_TAG = '$START';
  _$jscoverage['/kison/grammar.js'].lineData[30]++;
  function mix(to, from) {
    _$jscoverage['/kison/grammar.js'].functionData[1]++;
    _$jscoverage['/kison/grammar.js'].lineData[31]++;
    for (var f in from) {
      _$jscoverage['/kison/grammar.js'].lineData[32]++;
      to[f] = from[f];
    }
  }
  _$jscoverage['/kison/grammar.js'].lineData[36]++;
  function setSize(set3) {
    _$jscoverage['/kison/grammar.js'].functionData[2]++;
    _$jscoverage['/kison/grammar.js'].lineData[37]++;
    var count = 0, i;
    _$jscoverage['/kison/grammar.js'].lineData[38]++;
    for (i in set3) {
      _$jscoverage['/kison/grammar.js'].lineData[39]++;
      count++;
    }
    _$jscoverage['/kison/grammar.js'].lineData[41]++;
    return count;
  }
  _$jscoverage['/kison/grammar.js'].lineData[44]++;
  function indexOf(obj, array) {
    _$jscoverage['/kison/grammar.js'].functionData[3]++;
    _$jscoverage['/kison/grammar.js'].lineData[45]++;
    for (var i = 0; visit1_45_1(i < array.length); i++) {
      _$jscoverage['/kison/grammar.js'].lineData[46]++;
      if (visit2_46_1(obj.equals(array[i]))) {
        _$jscoverage['/kison/grammar.js'].lineData[47]++;
        return i;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[50]++;
    return -1;
  }
  _$jscoverage['/kison/grammar.js'].lineData[53]++;
  function visualizeAction(action, productions, itemSets) {
    _$jscoverage['/kison/grammar.js'].functionData[4]++;
    _$jscoverage['/kison/grammar.js'].lineData[54]++;
    switch (action[GrammarConst.TYPE_INDEX]) {
      case GrammarConst.SHIFT_TYPE:
        _$jscoverage['/kison/grammar.js'].lineData[56]++;
        logger.debug('shift');
        _$jscoverage['/kison/grammar.js'].lineData[57]++;
        break;
      case GrammarConst.REDUCE_TYPE:
        _$jscoverage['/kison/grammar.js'].lineData[59]++;
        logger.debug('reduce');
        _$jscoverage['/kison/grammar.js'].lineData[60]++;
        break;
      case GrammarConst.ACCEPT_TYPE:
        _$jscoverage['/kison/grammar.js'].lineData[62]++;
        logger.debug('accept');
        _$jscoverage['/kison/grammar.js'].lineData[63]++;
        break;
    }
    _$jscoverage['/kison/grammar.js'].lineData[65]++;
    logger.debug('from production:');
    _$jscoverage['/kison/grammar.js'].lineData[66]++;
    if (visit3_66_1(action[GrammarConst.PRODUCTION_INDEX] !== undefined)) {
      _$jscoverage['/kison/grammar.js'].lineData[67]++;
      logger.debug(productions[action[GrammarConst.PRODUCTION_INDEX]] + '');
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[69]++;
      logger.debug('undefined');
    }
    _$jscoverage['/kison/grammar.js'].lineData[71]++;
    logger.debug('to itemSet:');
    _$jscoverage['/kison/grammar.js'].lineData[72]++;
    if (visit4_72_1(action[GrammarConst.TO_INDEX] !== undefined)) {
      _$jscoverage['/kison/grammar.js'].lineData[73]++;
      logger.debug(itemSets[action[GrammarConst.TO_INDEX]].toString(1));
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[75]++;
      logger.debug('undefined');
    }
  }
  _$jscoverage['/kison/grammar.js'].lineData[83]++;
  return Base.extend({
  build: function() {
  _$jscoverage['/kison/grammar.js'].functionData[5]++;
  _$jscoverage['/kison/grammar.js'].lineData[85]++;
  var self = this, lexer = self.lexer, vs = self.get('productions');
  _$jscoverage['/kison/grammar.js'].lineData[89]++;
  vs.unshift({
  symbol: START_TAG, 
  rhs: [vs[0].symbol]});
  _$jscoverage['/kison/grammar.js'].lineData[94]++;
  util.each(vs, function(v, index) {
  _$jscoverage['/kison/grammar.js'].functionData[6]++;
  _$jscoverage['/kison/grammar.js'].lineData[95]++;
  v.symbol = lexer.mapSymbol(v.symbol);
  _$jscoverage['/kison/grammar.js'].lineData[96]++;
  var rhs = v.rhs;
  _$jscoverage['/kison/grammar.js'].lineData[97]++;
  util.each(rhs, function(r, index) {
  _$jscoverage['/kison/grammar.js'].functionData[7]++;
  _$jscoverage['/kison/grammar.js'].lineData[98]++;
  rhs[index] = lexer.mapSymbol(r);
});
  _$jscoverage['/kison/grammar.js'].lineData[100]++;
  vs[index] = new Production(v);
});
  _$jscoverage['/kison/grammar.js'].lineData[103]++;
  self.buildTerminals();
  _$jscoverage['/kison/grammar.js'].lineData[104]++;
  self.buildNonTerminals();
  _$jscoverage['/kison/grammar.js'].lineData[105]++;
  self.buildNullable();
  _$jscoverage['/kison/grammar.js'].lineData[106]++;
  self.buildFirsts();
  _$jscoverage['/kison/grammar.js'].lineData[107]++;
  self.buildItemSet();
  _$jscoverage['/kison/grammar.js'].lineData[108]++;
  self.buildLalrItemSets();
  _$jscoverage['/kison/grammar.js'].lineData[109]++;
  self.buildTable();
}, 
  buildTerminals: function() {
  _$jscoverage['/kison/grammar.js'].functionData[8]++;
  _$jscoverage['/kison/grammar.js'].lineData[113]++;
  var self = this, lexer = self.get('lexer'), rules = visit5_115_1(lexer && lexer.rules), terminals = self.get('terminals');
  _$jscoverage['/kison/grammar.js'].lineData[117]++;
  terminals[lexer.mapSymbol(END_TAG)] = 1;
  _$jscoverage['/kison/grammar.js'].lineData[118]++;
  util.each(rules, function(rule) {
  _$jscoverage['/kison/grammar.js'].functionData[9]++;
  _$jscoverage['/kison/grammar.js'].lineData[119]++;
  var token = visit6_119_1(rule.token || rule[0]);
  _$jscoverage['/kison/grammar.js'].lineData[120]++;
  if (visit7_120_1(token)) {
    _$jscoverage['/kison/grammar.js'].lineData[121]++;
    terminals[token] = 1;
  }
});
}, 
  buildNonTerminals: function() {
  _$jscoverage['/kison/grammar.js'].functionData[10]++;
  _$jscoverage['/kison/grammar.js'].lineData[127]++;
  var self = this, terminals = self.get('terminals'), nonTerminals = self.get('nonTerminals'), productions = self.get('productions');
  _$jscoverage['/kison/grammar.js'].lineData[132]++;
  util.each(productions, function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[11]++;
  _$jscoverage['/kison/grammar.js'].lineData[133]++;
  var symbol = production.get('symbol'), nonTerminal = nonTerminals[symbol];
  _$jscoverage['/kison/grammar.js'].lineData[136]++;
  if (visit8_136_1(!nonTerminal)) {
    _$jscoverage['/kison/grammar.js'].lineData[137]++;
    nonTerminal = nonTerminals[symbol] = new NonTerminal({
  symbol: symbol});
  }
  _$jscoverage['/kison/grammar.js'].lineData[142]++;
  nonTerminal.get('productions').push(production);
  _$jscoverage['/kison/grammar.js'].lineData[144]++;
  util.each(production.get('handles'), function(handle) {
  _$jscoverage['/kison/grammar.js'].functionData[12]++;
  _$jscoverage['/kison/grammar.js'].lineData[145]++;
  if (visit9_145_1(!terminals[handle] && !nonTerminals[handle])) {
    _$jscoverage['/kison/grammar.js'].lineData[146]++;
    nonTerminals[handle] = new NonTerminal({
  symbol: handle});
  }
});
});
}, 
  buildNullable: function() {
  _$jscoverage['/kison/grammar.js'].functionData[13]++;
  _$jscoverage['/kison/grammar.js'].lineData[155]++;
  var self = this, i, rhs, n, symbol, t, production, productions, nonTerminals = self.get('nonTerminals'), cont = true;
  _$jscoverage['/kison/grammar.js'].lineData[167]++;
  while (cont) {
    _$jscoverage['/kison/grammar.js'].lineData[168]++;
    cont = false;
    _$jscoverage['/kison/grammar.js'].lineData[173]++;
    util.each(self.get('productions'), function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[14]++;
  _$jscoverage['/kison/grammar.js'].lineData[174]++;
  if (visit10_174_1(!production.get('nullable'))) {
    _$jscoverage['/kison/grammar.js'].lineData[175]++;
    rhs = production.get('rhs');
    _$jscoverage['/kison/grammar.js'].lineData[176]++;
    for (i = 0 , n = 0; (t = rhs[i]); ++i) {
      _$jscoverage['/kison/grammar.js'].lineData[177]++;
      if (visit11_177_1(self.isNullable(t))) {
        _$jscoverage['/kison/grammar.js'].lineData[178]++;
        n++;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[181]++;
    if (visit12_181_1(n === i)) {
      _$jscoverage['/kison/grammar.js'].lineData[182]++;
      production.set('nullable', cont = true);
    }
  }
});
    _$jscoverage['/kison/grammar.js'].lineData[188]++;
    for (symbol in nonTerminals) {
      _$jscoverage['/kison/grammar.js'].lineData[190]++;
      if (visit13_190_1(!nonTerminals[symbol].get('nullable'))) {
        _$jscoverage['/kison/grammar.js'].lineData[191]++;
        productions = nonTerminals[symbol].get('productions');
        _$jscoverage['/kison/grammar.js'].lineData[192]++;
        for (i = 0; (production = productions[i]); i++) {
          _$jscoverage['/kison/grammar.js'].lineData[193]++;
          if (visit14_193_1(production.get('nullable'))) {
            _$jscoverage['/kison/grammar.js'].lineData[194]++;
            nonTerminals[symbol].set('nullable', cont = true);
            _$jscoverage['/kison/grammar.js'].lineData[195]++;
            break;
          }
        }
      }
    }
  }
}, 
  isNullable: function(symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[15]++;
  _$jscoverage['/kison/grammar.js'].lineData[205]++;
  var self = this, nonTerminals = self.get('nonTerminals');
  _$jscoverage['/kison/grammar.js'].lineData[208]++;
  if (visit15_208_1(symbol instanceof Array)) {
    _$jscoverage['/kison/grammar.js'].lineData[209]++;
    for (var i = 0, t; (t = symbol[i]); ++i) {
      _$jscoverage['/kison/grammar.js'].lineData[210]++;
      if (visit16_210_1(!self.isNullable(t))) {
        _$jscoverage['/kison/grammar.js'].lineData[211]++;
        return false;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[214]++;
    return true;
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[216]++;
    if (visit17_216_1(!nonTerminals[symbol])) {
      _$jscoverage['/kison/grammar.js'].lineData[217]++;
      return false;
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[220]++;
      return nonTerminals[symbol].get('nullable');
    }
  }
}, 
  findFirst: function(symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[16]++;
  _$jscoverage['/kison/grammar.js'].lineData[225]++;
  var self = this, firsts = {}, t, i, nonTerminals = self.get('nonTerminals');
  _$jscoverage['/kison/grammar.js'].lineData[231]++;
  if (visit18_231_1(symbol instanceof Array)) {
    _$jscoverage['/kison/grammar.js'].lineData[232]++;
    for (i = 0; (t = symbol[i]); ++i) {
      _$jscoverage['/kison/grammar.js'].lineData[233]++;
      if (visit19_233_1(!nonTerminals[t])) {
        _$jscoverage['/kison/grammar.js'].lineData[234]++;
        firsts[t] = 1;
      } else {
        _$jscoverage['/kison/grammar.js'].lineData[236]++;
        mix(firsts, nonTerminals[t].get('firsts'));
      }
      _$jscoverage['/kison/grammar.js'].lineData[238]++;
      if (visit20_238_1(!self.isNullable(t))) {
        _$jscoverage['/kison/grammar.js'].lineData[239]++;
        break;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[242]++;
    return firsts;
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[244]++;
    if (visit21_244_1(!nonTerminals[symbol])) {
      _$jscoverage['/kison/grammar.js'].lineData[245]++;
      return [symbol];
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[248]++;
      return nonTerminals[symbol].get('firsts');
    }
  }
}, 
  buildFirsts: function() {
  _$jscoverage['/kison/grammar.js'].functionData[17]++;
  _$jscoverage['/kison/grammar.js'].lineData[253]++;
  var self = this, nonTerminal, nonTerminals = self.get('nonTerminals'), cont = true, symbol, firsts;
  _$jscoverage['/kison/grammar.js'].lineData[260]++;
  while (cont) {
    _$jscoverage['/kison/grammar.js'].lineData[261]++;
    cont = false;
    _$jscoverage['/kison/grammar.js'].lineData[269]++;
    util.each(self.get('productions'), function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[18]++;
  _$jscoverage['/kison/grammar.js'].lineData[270]++;
  var firsts = self.findFirst(production.get('rhs'));
  _$jscoverage['/kison/grammar.js'].lineData[271]++;
  if (visit22_271_1(setSize(firsts) !== setSize(production.get('firsts')))) {
    _$jscoverage['/kison/grammar.js'].lineData[272]++;
    production.set('firsts', firsts);
    _$jscoverage['/kison/grammar.js'].lineData[273]++;
    cont = true;
  }
});
    _$jscoverage['/kison/grammar.js'].lineData[277]++;
    for (symbol in nonTerminals) {
      _$jscoverage['/kison/grammar.js'].lineData[279]++;
      nonTerminal = nonTerminals[symbol];
      _$jscoverage['/kison/grammar.js'].lineData[280]++;
      firsts = {};
      _$jscoverage['/kison/grammar.js'].lineData[281]++;
      util.each(nonTerminal.get('productions'), function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[19]++;
  _$jscoverage['/kison/grammar.js'].lineData[282]++;
  mix(firsts, production.get('firsts'));
});
      _$jscoverage['/kison/grammar.js'].lineData[284]++;
      if (visit23_284_1(setSize(firsts) !== setSize(nonTerminal.get('firsts')))) {
        _$jscoverage['/kison/grammar.js'].lineData[285]++;
        nonTerminal.set('firsts', firsts);
        _$jscoverage['/kison/grammar.js'].lineData[286]++;
        cont = true;
      }
    }
  }
}, 
  closure: function(itemSet) {
  _$jscoverage['/kison/grammar.js'].functionData[20]++;
  _$jscoverage['/kison/grammar.js'].lineData[294]++;
  var self = this, items = itemSet.get('items'), productions = self.get('productions'), cont = 1;
  _$jscoverage['/kison/grammar.js'].lineData[299]++;
  while (cont) {
    _$jscoverage['/kison/grammar.js'].lineData[300]++;
    cont = false;
    _$jscoverage['/kison/grammar.js'].lineData[302]++;
    util.each(items, function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[21]++;
  _$jscoverage['/kison/grammar.js'].lineData[304]++;
  var dotPosition = item.get('dotPosition'), production = item.get('production'), rhs = production.get('rhs'), dotSymbol = rhs[dotPosition], lookAhead = item.get('lookAhead'), finalFirsts = {};
  _$jscoverage['/kison/grammar.js'].lineData[311]++;
  util.each(lookAhead, function(_, ahead) {
  _$jscoverage['/kison/grammar.js'].functionData[22]++;
  _$jscoverage['/kison/grammar.js'].lineData[312]++;
  var rightRhs = rhs.slice(dotPosition + 1);
  _$jscoverage['/kison/grammar.js'].lineData[313]++;
  rightRhs.push(ahead);
  _$jscoverage['/kison/grammar.js'].lineData[314]++;
  util.mix(finalFirsts, self.findFirst(rightRhs));
});
  _$jscoverage['/kison/grammar.js'].lineData[317]++;
  util.each(productions, function(p2) {
  _$jscoverage['/kison/grammar.js'].functionData[23]++;
  _$jscoverage['/kison/grammar.js'].lineData[318]++;
  if (visit24_318_1(p2.get('symbol') === dotSymbol)) {
    _$jscoverage['/kison/grammar.js'].lineData[320]++;
    var newItem = new Item({
  production: p2}), itemIndex = itemSet.findItemIndex(newItem, true), findItem;
    _$jscoverage['/kison/grammar.js'].lineData[334]++;
    if (visit25_334_1(itemIndex !== -1)) {
      _$jscoverage['/kison/grammar.js'].lineData[335]++;
      findItem = itemSet.getItemAt(itemIndex);
      _$jscoverage['/kison/grammar.js'].lineData[336]++;
      cont = visit26_336_1(cont || (!!findItem.addLookAhead(finalFirsts)));
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[338]++;
      newItem.addLookAhead(finalFirsts);
      _$jscoverage['/kison/grammar.js'].lineData[339]++;
      itemSet.addItem(newItem);
      _$jscoverage['/kison/grammar.js'].lineData[340]++;
      cont = true;
    }
  }
});
});
  }
  _$jscoverage['/kison/grammar.js'].lineData[349]++;
  return itemSet;
}, 
  gotos: function(i, x) {
  _$jscoverage['/kison/grammar.js'].functionData[24]++;
  _$jscoverage['/kison/grammar.js'].lineData[353]++;
  var j = new ItemSet(), iItems = i.get('items');
  _$jscoverage['/kison/grammar.js'].lineData[355]++;
  util.each(iItems, function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[25]++;
  _$jscoverage['/kison/grammar.js'].lineData[356]++;
  var production = item.get('production'), dotPosition = item.get('dotPosition'), markSymbol = production.get('rhs')[dotPosition];
  _$jscoverage['/kison/grammar.js'].lineData[359]++;
  if (visit27_359_1(markSymbol === x)) {
    _$jscoverage['/kison/grammar.js'].lineData[360]++;
    var newItem = new Item({
  production: production, 
  dotPosition: dotPosition + 1}), itemIndex = j.findItemIndex(newItem, true), findItem;
    _$jscoverage['/kison/grammar.js'].lineData[366]++;
    if (visit28_366_1(itemIndex !== -1)) {
      _$jscoverage['/kison/grammar.js'].lineData[367]++;
      findItem = j.getItemAt(itemIndex);
      _$jscoverage['/kison/grammar.js'].lineData[368]++;
      findItem.addLookAhead(item.get('lookAhead'));
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[370]++;
      newItem.addLookAhead(item.get('lookAhead'));
      _$jscoverage['/kison/grammar.js'].lineData[371]++;
      j.addItem(newItem);
    }
  }
});
  _$jscoverage['/kison/grammar.js'].lineData[375]++;
  return this.closure(j);
}, 
  findItemSetIndex: function(itemSet) {
  _$jscoverage['/kison/grammar.js'].functionData[26]++;
  _$jscoverage['/kison/grammar.js'].lineData[379]++;
  var itemSets = this.get('itemSets'), i;
  _$jscoverage['/kison/grammar.js'].lineData[380]++;
  for (i = 0; visit29_380_1(i < itemSets.length); i++) {
    _$jscoverage['/kison/grammar.js'].lineData[381]++;
    if (visit30_381_1(itemSets[i].equals(itemSet))) {
      _$jscoverage['/kison/grammar.js'].lineData[382]++;
      return i;
    }
  }
  _$jscoverage['/kison/grammar.js'].lineData[385]++;
  return -1;
}, 
  buildItemSet: function() {
  _$jscoverage['/kison/grammar.js'].functionData[27]++;
  _$jscoverage['/kison/grammar.js'].lineData[391]++;
  var self = this, lexer = self.lexer, itemSets = self.get('itemSets'), lookAheadTmp = {}, productions = self.get('productions');
  _$jscoverage['/kison/grammar.js'].lineData[397]++;
  lookAheadTmp[lexer.mapSymbol(END_TAG)] = 1;
  _$jscoverage['/kison/grammar.js'].lineData[399]++;
  var initItemSet = self.closure(new ItemSet({
  items: [new Item({
  production: productions[0], 
  lookAhead: lookAheadTmp})]}));
  _$jscoverage['/kison/grammar.js'].lineData[409]++;
  itemSets.push(initItemSet);
  _$jscoverage['/kison/grammar.js'].lineData[411]++;
  var condition = true, symbols = util.merge(self.get('terminals'), self.get('nonTerminals'));
  _$jscoverage['/kison/grammar.js'].lineData[414]++;
  delete symbols[lexer.mapSymbol(END_TAG)];
  _$jscoverage['/kison/grammar.js'].lineData[416]++;
  while (condition) {
    _$jscoverage['/kison/grammar.js'].lineData[417]++;
    condition = false;
    _$jscoverage['/kison/grammar.js'].lineData[418]++;
    var itemSets2 = itemSets.concat();
    _$jscoverage['/kison/grammar.js'].lineData[419]++;
    util.each(itemSets2, function(itemSet) {
  _$jscoverage['/kison/grammar.js'].functionData[28]++;
  _$jscoverage['/kison/grammar.js'].lineData[420]++;
  util.each(symbols, function(v, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[29]++;
  _$jscoverage['/kison/grammar.js'].lineData[422]++;
  if (visit31_422_1(!itemSet.__cache)) {
    _$jscoverage['/kison/grammar.js'].lineData[423]++;
    itemSet.__cache = {};
  }
  _$jscoverage['/kison/grammar.js'].lineData[427]++;
  if (visit32_427_1(itemSet.__cache[symbol])) {
    _$jscoverage['/kison/grammar.js'].lineData[428]++;
    return;
  }
  _$jscoverage['/kison/grammar.js'].lineData[431]++;
  var itemSetNew = self.gotos(itemSet, symbol);
  _$jscoverage['/kison/grammar.js'].lineData[433]++;
  itemSet.__cache[symbol] = 1;
  _$jscoverage['/kison/grammar.js'].lineData[435]++;
  if (visit33_435_1(itemSetNew.size() === 0)) {
    _$jscoverage['/kison/grammar.js'].lineData[436]++;
    return;
  }
  _$jscoverage['/kison/grammar.js'].lineData[439]++;
  var index = self.findItemSetIndex(itemSetNew);
  _$jscoverage['/kison/grammar.js'].lineData[441]++;
  if (visit34_441_1(index > -1)) {
    _$jscoverage['/kison/grammar.js'].lineData[442]++;
    itemSetNew = itemSets[index];
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[444]++;
    itemSets.push(itemSetNew);
    _$jscoverage['/kison/grammar.js'].lineData[445]++;
    condition = true;
  }
  _$jscoverage['/kison/grammar.js'].lineData[448]++;
  itemSet.get('gotos')[symbol] = itemSetNew;
  _$jscoverage['/kison/grammar.js'].lineData[449]++;
  itemSetNew.addReverseGoto(symbol, itemSet);
});
});
  }
}, 
  buildLalrItemSets: function() {
  _$jscoverage['/kison/grammar.js'].functionData[30]++;
  _$jscoverage['/kison/grammar.js'].lineData[457]++;
  var itemSets = this.get('itemSets'), i, j, one, two;
  _$jscoverage['/kison/grammar.js'].lineData[460]++;
  for (i = 0; visit35_460_1(i < itemSets.length); i++) {
    _$jscoverage['/kison/grammar.js'].lineData[461]++;
    one = itemSets[i];
    _$jscoverage['/kison/grammar.js'].lineData[462]++;
    for (j = i + 1; visit36_462_1(j < itemSets.length); j++) {
      _$jscoverage['/kison/grammar.js'].lineData[463]++;
      two = itemSets[j];
      _$jscoverage['/kison/grammar.js'].lineData[464]++;
      if (visit37_464_1(one.equals(two, true))) {
        _$jscoverage['/kison/grammar.js'].lineData[466]++;
        for (var k = 0; visit38_466_1(k < one.get('items').length); k++) {
          _$jscoverage['/kison/grammar.js'].lineData[468]++;
          one.get('items')[k].addLookAhead(two.get('items')[k].get('lookAhead'));
        }
        _$jscoverage['/kison/grammar.js'].lineData[472]++;
        var oneGotos = one.get('gotos');
        _$jscoverage['/kison/grammar.js'].lineData[474]++;
        util.each(two.get('gotos'), function(item, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[31]++;
  _$jscoverage['/kison/grammar.js'].lineData[475]++;
  oneGotos[symbol] = item;
  _$jscoverage['/kison/grammar.js'].lineData[476]++;
  item.addReverseGoto(symbol, one);
});
        _$jscoverage['/kison/grammar.js'].lineData[479]++;
        util.each(two.get('reverseGotos'), function(items, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[32]++;
  _$jscoverage['/kison/grammar.js'].lineData[480]++;
  util.each(items, function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[33]++;
  _$jscoverage['/kison/grammar.js'].lineData[481]++;
  item.get('gotos')[symbol] = one;
  _$jscoverage['/kison/grammar.js'].lineData[482]++;
  one.addReverseGoto(symbol, item);
});
});
        _$jscoverage['/kison/grammar.js'].lineData[486]++;
        itemSets.splice(j--, 1);
      }
    }
  }
}, 
  buildTable: function() {
  _$jscoverage['/kison/grammar.js'].functionData[34]++;
  _$jscoverage['/kison/grammar.js'].lineData[493]++;
  var self = this, lexer = self.lexer, table = self.get('table'), itemSets = self.get('itemSets'), productions = self.get('productions'), mappedStartTag = lexer.mapSymbol(START_TAG), mappedEndTag = lexer.mapSymbol(END_TAG), gotos = {}, action = {}, nonTerminals, i, itemSet, t;
  _$jscoverage['/kison/grammar.js'].lineData[507]++;
  table.gotos = gotos;
  _$jscoverage['/kison/grammar.js'].lineData[508]++;
  table.action = action;
  _$jscoverage['/kison/grammar.js'].lineData[509]++;
  nonTerminals = self.get('nonTerminals');
  _$jscoverage['/kison/grammar.js'].lineData[511]++;
  for (i = 0; visit39_511_1(i < itemSets.length); i++) {
    _$jscoverage['/kison/grammar.js'].lineData[513]++;
    itemSet = itemSets[i];
    _$jscoverage['/kison/grammar.js'].lineData[515]++;
    util.each(itemSet.get('items'), function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[35]++;
  _$jscoverage['/kison/grammar.js'].lineData[516]++;
  var production = item.get('production');
  _$jscoverage['/kison/grammar.js'].lineData[517]++;
  var val;
  _$jscoverage['/kison/grammar.js'].lineData[518]++;
  if (visit40_518_1(item.get('dotPosition') === production.get('rhs').length)) {
    _$jscoverage['/kison/grammar.js'].lineData[519]++;
    if (visit41_519_1(production.get('symbol') === mappedStartTag)) {
      _$jscoverage['/kison/grammar.js'].lineData[520]++;
      if (visit42_520_1(item.get('lookAhead')[mappedEndTag])) {
        _$jscoverage['/kison/grammar.js'].lineData[521]++;
        action[i] = visit43_521_1(action[i] || {});
        _$jscoverage['/kison/grammar.js'].lineData[522]++;
        t = action[i][mappedEndTag];
        _$jscoverage['/kison/grammar.js'].lineData[523]++;
        val = [];
        _$jscoverage['/kison/grammar.js'].lineData[524]++;
        val[GrammarConst.TYPE_INDEX] = GrammarConst.ACCEPT_TYPE;
        _$jscoverage['/kison/grammar.js'].lineData[525]++;
        if (visit44_525_1(t && visit45_525_2(t.toString() !== val.toString()))) {
          _$jscoverage['/kison/grammar.js'].lineData[526]++;
          logger.debug(new Array(29).join('*'));
          _$jscoverage['/kison/grammar.js'].lineData[527]++;
          logger.debug('***** conflict in reduce: action already defined ->', 'warn');
          _$jscoverage['/kison/grammar.js'].lineData[529]++;
          logger.debug('***** current item:', 'info');
          _$jscoverage['/kison/grammar.js'].lineData[530]++;
          logger.debug(item.toString());
          _$jscoverage['/kison/grammar.js'].lineData[531]++;
          logger.debug('***** current action:', 'info');
          _$jscoverage['/kison/grammar.js'].lineData[532]++;
          visualizeAction(t, productions, itemSets);
          _$jscoverage['/kison/grammar.js'].lineData[533]++;
          logger.debug('***** will be overwritten ->', 'info');
          _$jscoverage['/kison/grammar.js'].lineData[534]++;
          visualizeAction(val, productions, itemSets);
        }
        _$jscoverage['/kison/grammar.js'].lineData[536]++;
        action[i][mappedEndTag] = val;
      }
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[539]++;
      action[i] = visit46_539_1(action[i] || {});
      _$jscoverage['/kison/grammar.js'].lineData[544]++;
      util.each(item.get('lookAhead'), function(_, l) {
  _$jscoverage['/kison/grammar.js'].functionData[36]++;
  _$jscoverage['/kison/grammar.js'].lineData[545]++;
  t = action[i][l];
  _$jscoverage['/kison/grammar.js'].lineData[546]++;
  val = [];
  _$jscoverage['/kison/grammar.js'].lineData[547]++;
  val[GrammarConst.TYPE_INDEX] = GrammarConst.REDUCE_TYPE;
  _$jscoverage['/kison/grammar.js'].lineData[548]++;
  val[GrammarConst.PRODUCTION_INDEX] = util.indexOf(production, productions);
  _$jscoverage['/kison/grammar.js'].lineData[549]++;
  if (visit47_549_1(t && visit48_549_2(t.toString() !== val.toString()))) {
    _$jscoverage['/kison/grammar.js'].lineData[550]++;
    logger.debug(new Array(29).join('*'));
    _$jscoverage['/kison/grammar.js'].lineData[551]++;
    logger.debug('conflict in reduce: action already defined ->', 'warn');
    _$jscoverage['/kison/grammar.js'].lineData[553]++;
    logger.debug('***** current item:', 'info');
    _$jscoverage['/kison/grammar.js'].lineData[554]++;
    logger.debug(item.toString());
    _$jscoverage['/kison/grammar.js'].lineData[555]++;
    logger.debug('***** current action:', 'info');
    _$jscoverage['/kison/grammar.js'].lineData[556]++;
    visualizeAction(t, productions, itemSets);
    _$jscoverage['/kison/grammar.js'].lineData[557]++;
    logger.debug('***** will be overwritten ->', 'info');
    _$jscoverage['/kison/grammar.js'].lineData[558]++;
    visualizeAction(val, productions, itemSets);
  }
  _$jscoverage['/kison/grammar.js'].lineData[560]++;
  action[i][l] = val;
});
    }
  }
});
    _$jscoverage['/kison/grammar.js'].lineData[567]++;
    util.each(itemSet.get('gotos'), function(anotherItemSet, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[37]++;
  _$jscoverage['/kison/grammar.js'].lineData[568]++;
  var val;
  _$jscoverage['/kison/grammar.js'].lineData[569]++;
  if (visit49_569_1(!nonTerminals[symbol])) {
    _$jscoverage['/kison/grammar.js'].lineData[570]++;
    action[i] = visit50_570_1(action[i] || {});
    _$jscoverage['/kison/grammar.js'].lineData[571]++;
    val = [];
    _$jscoverage['/kison/grammar.js'].lineData[572]++;
    val[GrammarConst.TYPE_INDEX] = GrammarConst.SHIFT_TYPE;
    _$jscoverage['/kison/grammar.js'].lineData[573]++;
    val[GrammarConst.TO_INDEX] = indexOf(anotherItemSet, itemSets);
    _$jscoverage['/kison/grammar.js'].lineData[574]++;
    t = action[i][symbol];
    _$jscoverage['/kison/grammar.js'].lineData[575]++;
    if (visit51_575_1(t && visit52_575_2(t.toString() !== val.toString()))) {
      _$jscoverage['/kison/grammar.js'].lineData[576]++;
      logger.debug(new Array(29).join('*'));
      _$jscoverage['/kison/grammar.js'].lineData[577]++;
      logger.debug('conflict in shift: action already defined ->', 'warn');
      _$jscoverage['/kison/grammar.js'].lineData[579]++;
      logger.debug('***** current itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[580]++;
      logger.debug(itemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[581]++;
      logger.debug('***** current symbol:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[582]++;
      logger.debug(symbol);
      _$jscoverage['/kison/grammar.js'].lineData[583]++;
      logger.debug('***** goto itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[584]++;
      logger.debug(anotherItemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[585]++;
      logger.debug('***** current action:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[586]++;
      visualizeAction(t, productions, itemSets);
      _$jscoverage['/kison/grammar.js'].lineData[587]++;
      logger.debug('***** will be overwritten ->', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[588]++;
      visualizeAction(val, productions, itemSets);
    }
    _$jscoverage['/kison/grammar.js'].lineData[590]++;
    action[i][symbol] = val;
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[592]++;
    gotos[i] = visit53_592_1(gotos[i] || {});
    _$jscoverage['/kison/grammar.js'].lineData[593]++;
    t = gotos[i][symbol];
    _$jscoverage['/kison/grammar.js'].lineData[594]++;
    val = indexOf(anotherItemSet, itemSets);
    _$jscoverage['/kison/grammar.js'].lineData[595]++;
    if (visit54_595_1(t && visit55_595_2(val !== t))) {
      _$jscoverage['/kison/grammar.js'].lineData[596]++;
      logger.debug(new Array(29).join('*'));
      _$jscoverage['/kison/grammar.js'].lineData[597]++;
      logger.debug('conflict in shift: goto already defined ->', 'warn');
      _$jscoverage['/kison/grammar.js'].lineData[599]++;
      logger.debug('***** current itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[600]++;
      logger.debug(itemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[601]++;
      logger.debug('***** current symbol:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[602]++;
      logger.debug(symbol);
      _$jscoverage['/kison/grammar.js'].lineData[603]++;
      logger.debug('***** goto itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[604]++;
      logger.debug(anotherItemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[605]++;
      logger.debug('***** current goto state:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[606]++;
      logger.debug(t);
      _$jscoverage['/kison/grammar.js'].lineData[607]++;
      logger.debug('***** will be overwritten ->', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[608]++;
      logger.debug(val);
    }
    _$jscoverage['/kison/grammar.js'].lineData[610]++;
    gotos[i][symbol] = val;
  }
});
  }
}, 
  visualizeTable: function() {
  _$jscoverage['/kison/grammar.js'].functionData[38]++;
  _$jscoverage['/kison/grammar.js'].lineData[618]++;
  var self = this, table = self.get('table'), gotos = table.gotos, action = table.action, productions = self.get('productions'), ret = [];
  _$jscoverage['/kison/grammar.js'].lineData[625]++;
  util.each(self.get('itemSets'), function(itemSet, i) {
  _$jscoverage['/kison/grammar.js'].functionData[39]++;
  _$jscoverage['/kison/grammar.js'].lineData[626]++;
  ret.push(new Array(70).join('*') + ' itemSet : ' + i);
  _$jscoverage['/kison/grammar.js'].lineData[627]++;
  ret.push(itemSet.toString());
  _$jscoverage['/kison/grammar.js'].lineData[628]++;
  ret.push('');
});
  _$jscoverage['/kison/grammar.js'].lineData[631]++;
  ret.push('');
  _$jscoverage['/kison/grammar.js'].lineData[633]++;
  ret.push(new Array(70).join('*') + ' table : ');
  _$jscoverage['/kison/grammar.js'].lineData[635]++;
  util.each(action, function(av, index) {
  _$jscoverage['/kison/grammar.js'].functionData[40]++;
  _$jscoverage['/kison/grammar.js'].lineData[636]++;
  util.each(av, function(v, s) {
  _$jscoverage['/kison/grammar.js'].functionData[41]++;
  _$jscoverage['/kison/grammar.js'].lineData[637]++;
  var str, type = v[GrammarConst.TYPE_INDEX];
  _$jscoverage['/kison/grammar.js'].lineData[638]++;
  if (visit56_638_1(type === GrammarConst.ACCEPT_TYPE)) {
    _$jscoverage['/kison/grammar.js'].lineData[639]++;
    str = 'acc';
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[640]++;
    if (visit57_640_1(type === GrammarConst.REDUCE_TYPE)) {
      _$jscoverage['/kison/grammar.js'].lineData[641]++;
      var production = productions[v[GrammarConst.PRODUCTION_INDEX]];
      _$jscoverage['/kison/grammar.js'].lineData[642]++;
      str = 'r, ' + production.get('symbol') + '=' + production.get('rhs').join(' ');
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[644]++;
      if (visit58_644_1(type === GrammarConst.SHIFT_TYPE)) {
        _$jscoverage['/kison/grammar.js'].lineData[645]++;
        str = 's, ' + v[GrammarConst.TO_INDEX];
      }
    }
  }
  _$jscoverage['/kison/grammar.js'].lineData[647]++;
  ret.push('action[' + index + ']' + '[' + s + '] = ' + str);
});
});
  _$jscoverage['/kison/grammar.js'].lineData[651]++;
  ret.push('');
  _$jscoverage['/kison/grammar.js'].lineData[653]++;
  util.each(gotos, function(sv, index) {
  _$jscoverage['/kison/grammar.js'].functionData[42]++;
  _$jscoverage['/kison/grammar.js'].lineData[654]++;
  util.each(sv, function(v, s) {
  _$jscoverage['/kison/grammar.js'].functionData[43]++;
  _$jscoverage['/kison/grammar.js'].lineData[655]++;
  ret.push('goto[' + index + ']' + '[' + s + '] = ' + v);
});
});
  _$jscoverage['/kison/grammar.js'].lineData[659]++;
  return ret;
}, 
  genCode: function(cfg) {
  _$jscoverage['/kison/grammar.js'].functionData[44]++;
  _$jscoverage['/kison/grammar.js'].lineData[663]++;
  cfg = visit59_663_1(cfg || {});
  _$jscoverage['/kison/grammar.js'].lineData[665]++;
  var self = this, table = self.get('table'), lexer = self.get('lexer'), lexerCode = lexer.genCode(cfg);
  _$jscoverage['/kison/grammar.js'].lineData[670]++;
  self.build();
  _$jscoverage['/kison/grammar.js'].lineData[672]++;
  var productions = [];
  _$jscoverage['/kison/grammar.js'].lineData[674]++;
  util.each(self.get('productions'), function(p) {
  _$jscoverage['/kison/grammar.js'].functionData[45]++;
  _$jscoverage['/kison/grammar.js'].lineData[675]++;
  var action = p.get('action'), ret = [p.get('symbol'), p.get('rhs')];
  _$jscoverage['/kison/grammar.js'].lineData[677]++;
  if (visit60_677_1(action)) {
    _$jscoverage['/kison/grammar.js'].lineData[678]++;
    ret.push(action);
  }
  _$jscoverage['/kison/grammar.js'].lineData[680]++;
  productions.push(ret);
});
  _$jscoverage['/kison/grammar.js'].lineData[683]++;
  var code = [];
  _$jscoverage['/kison/grammar.js'].lineData[685]++;
  code.push('/* Generated by kison from KISSY */');
  _$jscoverage['/kison/grammar.js'].lineData[687]++;
  code.push('var parser = {},' + 'S = KISSY,' + 'GrammarConst = ' + serializeObject(GrammarConst) + ';');
  _$jscoverage['/kison/grammar.js'].lineData[692]++;
  code.push(lexerCode);
  _$jscoverage['/kison/grammar.js'].lineData[694]++;
  code.push('parser.lexer = lexer;');
  _$jscoverage['/kison/grammar.js'].lineData[696]++;
  if (visit61_696_1(cfg.compressSymbol)) {
    _$jscoverage['/kison/grammar.js'].lineData[697]++;
    code.push('lexer.symbolMap = ' + serializeObject(lexer.symbolMap) + ';');
  }
  _$jscoverage['/kison/grammar.js'].lineData[700]++;
  code.push('parser.productions = ' + serializeObject(productions) + ';');
  _$jscoverage['/kison/grammar.js'].lineData[701]++;
  code.push('parser.table = ' + serializeObject(table) + ';');
  _$jscoverage['/kison/grammar.js'].lineData[702]++;
  code.push('parser.parse = ' + parse.toString() + ';');
  _$jscoverage['/kison/grammar.js'].lineData[703]++;
  code.push('return parser;');
  _$jscoverage['/kison/grammar.js'].lineData[704]++;
  return code.join('\n');
}}, {
  ATTRS: {
  table: {
  valueFn: function() {
  _$jscoverage['/kison/grammar.js'].functionData[46]++;
  _$jscoverage['/kison/grammar.js'].lineData[711]++;
  return {};
}}, 
  itemSets: {
  valueFn: function() {
  _$jscoverage['/kison/grammar.js'].functionData[47]++;
  _$jscoverage['/kison/grammar.js'].lineData[716]++;
  return [];
}}, 
  productions: {
  valueFn: function() {
  _$jscoverage['/kison/grammar.js'].functionData[48]++;
  _$jscoverage['/kison/grammar.js'].lineData[721]++;
  return [];
}}, 
  nonTerminals: {
  valueFn: function() {
  _$jscoverage['/kison/grammar.js'].functionData[49]++;
  _$jscoverage['/kison/grammar.js'].lineData[726]++;
  return {};
}}, 
  lexer: {
  setter: function(v) {
  _$jscoverage['/kison/grammar.js'].functionData[50]++;
  _$jscoverage['/kison/grammar.js'].lineData[731]++;
  if (visit62_731_1(!(v instanceof Lexer))) {
    _$jscoverage['/kison/grammar.js'].lineData[732]++;
    v = new Lexer(v);
  }
  _$jscoverage['/kison/grammar.js'].lineData[734]++;
  this.lexer = v;
  _$jscoverage['/kison/grammar.js'].lineData[735]++;
  return v;
}}, 
  terminals: {
  valueFn: function() {
  _$jscoverage['/kison/grammar.js'].functionData[51]++;
  _$jscoverage['/kison/grammar.js'].lineData[740]++;
  return {};
}}}});
  _$jscoverage['/kison/grammar.js'].lineData[747]++;
  function parse(input, filename) {
    _$jscoverage['/kison/grammar.js'].functionData[52]++;
    _$jscoverage['/kison/grammar.js'].lineData[748]++;
    var self = this, lexer = self.lexer, state, symbol, action, table = self.table, gotos = table.gotos, tableAction = table.action, productions = self.productions, valueStack = [null], prefix = filename ? ('in file: ' + filename + ' ') : '', stack = [0];
    _$jscoverage['/kison/grammar.js'].lineData[762]++;
    lexer.resetInput(input);
    _$jscoverage['/kison/grammar.js'].lineData[764]++;
    while (1) {
      _$jscoverage['/kison/grammar.js'].lineData[766]++;
      state = stack[stack.length - 1];
      _$jscoverage['/kison/grammar.js'].lineData[768]++;
      if (visit63_768_1(!symbol)) {
        _$jscoverage['/kison/grammar.js'].lineData[769]++;
        symbol = lexer.lex();
      }
      _$jscoverage['/kison/grammar.js'].lineData[772]++;
      if (visit64_772_1(symbol)) {
        _$jscoverage['/kison/grammar.js'].lineData[774]++;
        action = visit65_774_1(tableAction[state] && tableAction[state][symbol]);
      } else {
        _$jscoverage['/kison/grammar.js'].lineData[776]++;
        action = null;
      }
      _$jscoverage['/kison/grammar.js'].lineData[779]++;
      if (visit66_779_1(!action)) {
        _$jscoverage['/kison/grammar.js'].lineData[780]++;
        var expected = [], error;
        _$jscoverage['/kison/grammar.js'].lineData[782]++;
        if (visit67_782_1(tableAction[state])) {
          _$jscoverage['/kison/grammar.js'].lineData[783]++;
          for (var symbolForState in tableAction[state]) {
            _$jscoverage['/kison/grammar.js'].lineData[784]++;
            expected.push(self.lexer.mapReverseSymbol(symbolForState));
          }
        }
        _$jscoverage['/kison/grammar.js'].lineData[787]++;
        error = prefix + 'syntax error at line ' + lexer.lineNumber + ':\n' + lexer.showDebugInfo() + '\n' + 'expect ' + expected.join(', ');
        _$jscoverage['/kison/grammar.js'].lineData[790]++;
        throw new Error(error);
      }
      _$jscoverage['/kison/grammar.js'].lineData[793]++;
      switch (action[GrammarConst.TYPE_INDEX]) {
        case GrammarConst.SHIFT_TYPE:
          _$jscoverage['/kison/grammar.js'].lineData[795]++;
          stack.push(symbol);
          _$jscoverage['/kison/grammar.js'].lineData[797]++;
          valueStack.push(lexer.text);
          _$jscoverage['/kison/grammar.js'].lineData[800]++;
          stack.push(action[GrammarConst.TO_INDEX]);
          _$jscoverage['/kison/grammar.js'].lineData[803]++;
          symbol = null;
          _$jscoverage['/kison/grammar.js'].lineData[805]++;
          break;
        case GrammarConst.REDUCE_TYPE:
          _$jscoverage['/kison/grammar.js'].lineData[808]++;
          var production = productions[action[GrammarConst.PRODUCTION_INDEX]], reducedSymbol = visit68_809_1(production.symbol || production[0]), reducedAction = visit69_810_1(production.action || production[2]), reducedRhs = visit70_811_1(production.rhs || production[1]), len = reducedRhs.length, i = 0, ret, $$ = valueStack[valueStack.length - len];
          _$jscoverage['/kison/grammar.js'].lineData[817]++;
          ret = undefined;
          _$jscoverage['/kison/grammar.js'].lineData[819]++;
          self.$$ = $$;
          _$jscoverage['/kison/grammar.js'].lineData[821]++;
          for (; visit71_821_1(i < len); i++) {
            _$jscoverage['/kison/grammar.js'].lineData[822]++;
            self['$' + (len - i)] = valueStack[valueStack.length - 1 - i];
          }
          _$jscoverage['/kison/grammar.js'].lineData[825]++;
          if (visit72_825_1(reducedAction)) {
            _$jscoverage['/kison/grammar.js'].lineData[826]++;
            ret = reducedAction.call(self);
          }
          _$jscoverage['/kison/grammar.js'].lineData[829]++;
          if (visit73_829_1(ret !== undefined)) {
            _$jscoverage['/kison/grammar.js'].lineData[830]++;
            $$ = ret;
          } else {
            _$jscoverage['/kison/grammar.js'].lineData[832]++;
            $$ = self.$$;
          }
          _$jscoverage['/kison/grammar.js'].lineData[835]++;
          stack = stack.slice(0, -1 * len * 2);
          _$jscoverage['/kison/grammar.js'].lineData[836]++;
          valueStack = valueStack.slice(0, -1 * len);
          _$jscoverage['/kison/grammar.js'].lineData[838]++;
          stack.push(reducedSymbol);
          _$jscoverage['/kison/grammar.js'].lineData[840]++;
          valueStack.push($$);
          _$jscoverage['/kison/grammar.js'].lineData[842]++;
          var newState = gotos[stack[stack.length - 2]][stack[stack.length - 1]];
          _$jscoverage['/kison/grammar.js'].lineData[844]++;
          stack.push(newState);
          _$jscoverage['/kison/grammar.js'].lineData[846]++;
          break;
        case GrammarConst.ACCEPT_TYPE:
          _$jscoverage['/kison/grammar.js'].lineData[849]++;
          return $$;
      }
    }
  }
});
