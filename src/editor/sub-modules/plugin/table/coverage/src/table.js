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
            + ','src':' + jscoverage_quote(this.src)
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
  _$jscoverage['/table.js'].lineData[6] = 0;
  _$jscoverage['/table.js'].lineData[7] = 0;
  _$jscoverage['/table.js'].lineData[8] = 0;
  _$jscoverage['/table.js'].lineData[9] = 0;
  _$jscoverage['/table.js'].lineData[10] = 0;
  _$jscoverage['/table.js'].lineData[11] = 0;
  _$jscoverage['/table.js'].lineData[12] = 0;
  _$jscoverage['/table.js'].lineData[18] = 0;
  _$jscoverage['/table.js'].lineData[21] = 0;
  _$jscoverage['/table.js'].lineData[26] = 0;
  _$jscoverage['/table.js'].lineData[28] = 0;
  _$jscoverage['/table.js'].lineData[29] = 0;
  _$jscoverage['/table.js'].lineData[33] = 0;
  _$jscoverage['/table.js'].lineData[35] = 0;
  _$jscoverage['/table.js'].lineData[36] = 0;
  _$jscoverage['/table.js'].lineData[40] = 0;
  _$jscoverage['/table.js'].lineData[41] = 0;
  _$jscoverage['/table.js'].lineData[43] = 0;
  _$jscoverage['/table.js'].lineData[45] = 0;
  _$jscoverage['/table.js'].lineData[48] = 0;
  _$jscoverage['/table.js'].lineData[49] = 0;
  _$jscoverage['/table.js'].lineData[51] = 0;
  _$jscoverage['/table.js'].lineData[53] = 0;
  _$jscoverage['/table.js'].lineData[55] = 0;
  _$jscoverage['/table.js'].lineData[63] = 0;
  _$jscoverage['/table.js'].lineData[64] = 0;
  _$jscoverage['/table.js'].lineData[65] = 0;
  _$jscoverage['/table.js'].lineData[66] = 0;
  _$jscoverage['/table.js'].lineData[72] = 0;
  _$jscoverage['/table.js'].lineData[74] = 0;
  _$jscoverage['/table.js'].lineData[76] = 0;
  _$jscoverage['/table.js'].lineData[79] = 0;
  _$jscoverage['/table.js'].lineData[81] = 0;
  _$jscoverage['/table.js'].lineData[83] = 0;
  _$jscoverage['/table.js'].lineData[84] = 0;
  _$jscoverage['/table.js'].lineData[85] = 0;
  _$jscoverage['/table.js'].lineData[86] = 0;
  _$jscoverage['/table.js'].lineData[90] = 0;
  _$jscoverage['/table.js'].lineData[92] = 0;
  _$jscoverage['/table.js'].lineData[93] = 0;
  _$jscoverage['/table.js'].lineData[94] = 0;
  _$jscoverage['/table.js'].lineData[97] = 0;
  _$jscoverage['/table.js'].lineData[99] = 0;
  _$jscoverage['/table.js'].lineData[103] = 0;
  _$jscoverage['/table.js'].lineData[106] = 0;
  _$jscoverage['/table.js'].lineData[107] = 0;
  _$jscoverage['/table.js'].lineData[108] = 0;
  _$jscoverage['/table.js'].lineData[117] = 0;
  _$jscoverage['/table.js'].lineData[118] = 0;
  _$jscoverage['/table.js'].lineData[121] = 0;
  _$jscoverage['/table.js'].lineData[122] = 0;
  _$jscoverage['/table.js'].lineData[123] = 0;
  _$jscoverage['/table.js'].lineData[126] = 0;
  _$jscoverage['/table.js'].lineData[134] = 0;
  _$jscoverage['/table.js'].lineData[139] = 0;
  _$jscoverage['/table.js'].lineData[140] = 0;
  _$jscoverage['/table.js'].lineData[141] = 0;
  _$jscoverage['/table.js'].lineData[144] = 0;
  _$jscoverage['/table.js'].lineData[146] = 0;
  _$jscoverage['/table.js'].lineData[147] = 0;
  _$jscoverage['/table.js'].lineData[149] = 0;
  _$jscoverage['/table.js'].lineData[150] = 0;
  _$jscoverage['/table.js'].lineData[152] = 0;
  _$jscoverage['/table.js'].lineData[155] = 0;
  _$jscoverage['/table.js'].lineData[158] = 0;
  _$jscoverage['/table.js'].lineData[160] = 0;
  _$jscoverage['/table.js'].lineData[164] = 0;
  _$jscoverage['/table.js'].lineData[165] = 0;
  _$jscoverage['/table.js'].lineData[169] = 0;
  _$jscoverage['/table.js'].lineData[172] = 0;
  _$jscoverage['/table.js'].lineData[173] = 0;
  _$jscoverage['/table.js'].lineData[175] = 0;
  _$jscoverage['/table.js'].lineData[176] = 0;
  _$jscoverage['/table.js'].lineData[177] = 0;
  _$jscoverage['/table.js'].lineData[179] = 0;
  _$jscoverage['/table.js'].lineData[180] = 0;
  _$jscoverage['/table.js'].lineData[182] = 0;
  _$jscoverage['/table.js'].lineData[183] = 0;
  _$jscoverage['/table.js'].lineData[184] = 0;
  _$jscoverage['/table.js'].lineData[186] = 0;
  _$jscoverage['/table.js'].lineData[190] = 0;
  _$jscoverage['/table.js'].lineData[191] = 0;
  _$jscoverage['/table.js'].lineData[197] = 0;
  _$jscoverage['/table.js'].lineData[198] = 0;
  _$jscoverage['/table.js'].lineData[202] = 0;
  _$jscoverage['/table.js'].lineData[203] = 0;
  _$jscoverage['/table.js'].lineData[205] = 0;
  _$jscoverage['/table.js'].lineData[206] = 0;
  _$jscoverage['/table.js'].lineData[207] = 0;
  _$jscoverage['/table.js'].lineData[211] = 0;
  _$jscoverage['/table.js'].lineData[212] = 0;
  _$jscoverage['/table.js'].lineData[217] = 0;
  _$jscoverage['/table.js'].lineData[218] = 0;
  _$jscoverage['/table.js'].lineData[220] = 0;
  _$jscoverage['/table.js'].lineData[221] = 0;
  _$jscoverage['/table.js'].lineData[222] = 0;
  _$jscoverage['/table.js'].lineData[226] = 0;
  _$jscoverage['/table.js'].lineData[229] = 0;
  _$jscoverage['/table.js'].lineData[230] = 0;
  _$jscoverage['/table.js'].lineData[231] = 0;
  _$jscoverage['/table.js'].lineData[234] = 0;
  _$jscoverage['/table.js'].lineData[236] = 0;
  _$jscoverage['/table.js'].lineData[237] = 0;
  _$jscoverage['/table.js'].lineData[241] = 0;
  _$jscoverage['/table.js'].lineData[242] = 0;
  _$jscoverage['/table.js'].lineData[244] = 0;
  _$jscoverage['/table.js'].lineData[247] = 0;
  _$jscoverage['/table.js'].lineData[248] = 0;
  _$jscoverage['/table.js'].lineData[251] = 0;
  _$jscoverage['/table.js'].lineData[258] = 0;
  _$jscoverage['/table.js'].lineData[260] = 0;
  _$jscoverage['/table.js'].lineData[264] = 0;
  _$jscoverage['/table.js'].lineData[265] = 0;
  _$jscoverage['/table.js'].lineData[266] = 0;
  _$jscoverage['/table.js'].lineData[270] = 0;
  _$jscoverage['/table.js'].lineData[271] = 0;
  _$jscoverage['/table.js'].lineData[275] = 0;
  _$jscoverage['/table.js'].lineData[278] = 0;
  _$jscoverage['/table.js'].lineData[279] = 0;
  _$jscoverage['/table.js'].lineData[280] = 0;
  _$jscoverage['/table.js'].lineData[282] = 0;
  _$jscoverage['/table.js'].lineData[283] = 0;
  _$jscoverage['/table.js'].lineData[285] = 0;
  _$jscoverage['/table.js'].lineData[288] = 0;
  _$jscoverage['/table.js'].lineData[289] = 0;
  _$jscoverage['/table.js'].lineData[292] = 0;
  _$jscoverage['/table.js'].lineData[293] = 0;
  _$jscoverage['/table.js'].lineData[294] = 0;
  _$jscoverage['/table.js'].lineData[295] = 0;
  _$jscoverage['/table.js'].lineData[296] = 0;
  _$jscoverage['/table.js'].lineData[298] = 0;
  _$jscoverage['/table.js'].lineData[299] = 0;
  _$jscoverage['/table.js'].lineData[300] = 0;
  _$jscoverage['/table.js'].lineData[302] = 0;
  _$jscoverage['/table.js'].lineData[309] = 0;
  _$jscoverage['/table.js'].lineData[310] = 0;
  _$jscoverage['/table.js'].lineData[311] = 0;
  _$jscoverage['/table.js'].lineData[315] = 0;
  _$jscoverage['/table.js'].lineData[316] = 0;
  _$jscoverage['/table.js'].lineData[317] = 0;
  _$jscoverage['/table.js'].lineData[320] = 0;
  _$jscoverage['/table.js'].lineData[332] = 0;
  _$jscoverage['/table.js'].lineData[360] = 0;
  _$jscoverage['/table.js'].lineData[363] = 0;
  _$jscoverage['/table.js'].lineData[364] = 0;
  _$jscoverage['/table.js'].lineData[374] = 0;
  _$jscoverage['/table.js'].lineData[376] = 0;
  _$jscoverage['/table.js'].lineData[377] = 0;
  _$jscoverage['/table.js'].lineData[378] = 0;
  _$jscoverage['/table.js'].lineData[379] = 0;
  _$jscoverage['/table.js'].lineData[381] = 0;
  _$jscoverage['/table.js'].lineData[391] = 0;
  _$jscoverage['/table.js'].lineData[392] = 0;
  _$jscoverage['/table.js'].lineData[395] = 0;
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
  _$jscoverage['/table.js'].branchData['8'] = [];
  _$jscoverage['/table.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['28'] = [];
  _$jscoverage['/table.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['33'] = [];
  _$jscoverage['/table.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['33'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['34'] = [];
  _$jscoverage['/table.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['40'] = [];
  _$jscoverage['/table.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['43'] = [];
  _$jscoverage['/table.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['46'] = [];
  _$jscoverage['/table.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['48'] = [];
  _$jscoverage['/table.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['64'] = [];
  _$jscoverage['/table.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['64'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['83'] = [];
  _$jscoverage['/table.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['85'] = [];
  _$jscoverage['/table.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['93'] = [];
  _$jscoverage['/table.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['107'] = [];
  _$jscoverage['/table.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['117'] = [];
  _$jscoverage['/table.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['121'] = [];
  _$jscoverage['/table.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['123'] = [];
  _$jscoverage['/table.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['123'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['135'] = [];
  _$jscoverage['/table.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['135'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['135'][3] = new BranchData();
  _$jscoverage['/table.js'].branchData['136'] = [];
  _$jscoverage['/table.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['136'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['136'][3] = new BranchData();
  _$jscoverage['/table.js'].branchData['139'] = [];
  _$jscoverage['/table.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['140'] = [];
  _$jscoverage['/table.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['146'] = [];
  _$jscoverage['/table.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['149'] = [];
  _$jscoverage['/table.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['161'] = [];
  _$jscoverage['/table.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['164'] = [];
  _$jscoverage['/table.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['172'] = [];
  _$jscoverage['/table.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['175'] = [];
  _$jscoverage['/table.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['179'] = [];
  _$jscoverage['/table.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['183'] = [];
  _$jscoverage['/table.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['192'] = [];
  _$jscoverage['/table.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['197'] = [];
  _$jscoverage['/table.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['204'] = [];
  _$jscoverage['/table.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['205'] = [];
  _$jscoverage['/table.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['211'] = [];
  _$jscoverage['/table.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['212'] = [];
  _$jscoverage['/table.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['219'] = [];
  _$jscoverage['/table.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['221'] = [];
  _$jscoverage['/table.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['230'] = [];
  _$jscoverage['/table.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['234'] = [];
  _$jscoverage['/table.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['236'] = [];
  _$jscoverage['/table.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['242'] = [];
  _$jscoverage['/table.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['247'] = [];
  _$jscoverage['/table.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['258'] = [];
  _$jscoverage['/table.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['264'] = [];
  _$jscoverage['/table.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['264'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['270'] = [];
  _$jscoverage['/table.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['280'] = [];
  _$jscoverage['/table.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['290'] = [];
  _$jscoverage['/table.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['291'] = [];
  _$jscoverage['/table.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['292'] = [];
  _$jscoverage['/table.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['296'] = [];
  _$jscoverage['/table.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['296'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['296'][3] = new BranchData();
  _$jscoverage['/table.js'].branchData['296'][4] = new BranchData();
  _$jscoverage['/table.js'].branchData['300'] = [];
  _$jscoverage['/table.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['300'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['311'] = [];
  _$jscoverage['/table.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['317'] = [];
  _$jscoverage['/table.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['336'] = [];
  _$jscoverage['/table.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['363'] = [];
  _$jscoverage['/table.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['363'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['364'] = [];
  _$jscoverage['/table.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['376'] = [];
  _$jscoverage['/table.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['378'] = [];
  _$jscoverage['/table.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['392'] = [];
  _$jscoverage['/table.js'].branchData['392'][1] = new BranchData();
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
_$jscoverage['/table.js'].branchData['532'][1].init(101, 104, '!statusChecker[content] || statusChecker[content].call(self, editor)');
function visit87_532_1(result) {
  _$jscoverage['/table.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['527'][1].init(29, 8, 'e.newVal');
function visit86_527_1(result) {
  _$jscoverage['/table.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['521'][1].init(92, 17, 'handlers[content]');
function visit85_521_1(result) {
  _$jscoverage['/table.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['512'][1].init(21, 41, 'S.inArray(Dom.nodeName(node), tableRules)');
function visit84_512_1(result) {
  _$jscoverage['/table.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['467'][1].init(241, 43, 'element && placeCursorInCell(element, true)');
function visit83_467_1(result) {
  _$jscoverage['/table.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['446'][1].init(58, 25, 'parent.nodeName() != \'td\'');
function visit82_446_1(result) {
  _$jscoverage['/table.js'].branchData['446'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['445'][2].init(1026, 27, 'parent.nodeName() != \'body\'');
function visit81_445_2(result) {
  _$jscoverage['/table.js'].branchData['445'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['445'][1].init(63, 84, 'parent.nodeName() != \'body\' && parent.nodeName() != \'td\'');
function visit80_445_1(result) {
  _$jscoverage['/table.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['444'][2].init(960, 32, 'parent[0].childNodes.length == 1');
function visit79_444_2(result) {
  _$jscoverage['/table.js'].branchData['444'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['444'][1].init(960, 148, 'parent[0].childNodes.length == 1 && parent.nodeName() != \'body\' && parent.nodeName() != \'td\'');
function visit78_444_1(result) {
  _$jscoverage['/table.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['429'][1].init(309, 6, '!table');
function visit77_429_1(result) {
  _$jscoverage['/table.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['427'][1].init(159, 56, 'startElement && startElement.closest(\'table\', undefined)');
function visit76_427_1(result) {
  _$jscoverage['/table.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['426'][1].init(81, 40, 'selection && selection.getStartElement()');
function visit75_426_1(result) {
  _$jscoverage['/table.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['413'][1].init(117, 4, 'info');
function visit74_413_1(result) {
  _$jscoverage['/table.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['402'][1].init(146, 41, 'dataProcessor && dataProcessor.htmlFilter');
function visit73_402_1(result) {
  _$jscoverage['/table.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['401'][1].init(74, 41, 'dataProcessor && dataProcessor.dataFilter');
function visit72_401_1(result) {
  _$jscoverage['/table.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['392'][1].init(23, 12, 'config || {}');
function visit71_392_1(result) {
  _$jscoverage['/table.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['378'][1].init(108, 1, 'v');
function visit70_378_1(result) {
  _$jscoverage['/table.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['376'][1].init(93, 8, 'cssClass');
function visit69_376_1(result) {
  _$jscoverage['/table.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['364'][1].init(63, 14, 'cssClass || ""');
function visit68_364_1(result) {
  _$jscoverage['/table.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['363'][2].init(182, 11, 'border <= 0');
function visit67_363_2(result) {
  _$jscoverage['/table.js'].branchData['363'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['363'][1].init(171, 22, '!border || border <= 0');
function visit66_363_1(result) {
  _$jscoverage['/table.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['336'][1].init(-1, 14, 'UA[\'ie\'] === 6');
function visit65_336_1(result) {
  _$jscoverage['/table.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['317'][1].init(51, 15, 'info && info.tr');
function visit64_317_1(result) {
  _$jscoverage['/table.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['311'][1].init(51, 15, 'info && info.td');
function visit63_311_1(result) {
  _$jscoverage['/table.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['300'][2].init(81, 12, 'name == "tr"');
function visit62_300_2(result) {
  _$jscoverage['/table.js'].branchData['300'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['300'][1].init(60, 33, 'table.contains(n) && name == "tr"');
function visit61_300_1(result) {
  _$jscoverage['/table.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['296'][4].init(98, 12, 'name == "th"');
function visit60_296_4(result) {
  _$jscoverage['/table.js'].branchData['296'][4].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['296'][3].init(82, 12, 'name == "td"');
function visit59_296_3(result) {
  _$jscoverage['/table.js'].branchData['296'][3].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['296'][2].init(82, 28, 'name == "td" || name == "th"');
function visit58_296_2(result) {
  _$jscoverage['/table.js'].branchData['296'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['296'][1].init(60, 51, 'table.contains(n) && (name == "td" || name == "th")');
function visit57_296_1(result) {
  _$jscoverage['/table.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['292'][1].init(207, 6, '!table');
function visit56_292_1(result) {
  _$jscoverage['/table.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['291'][1].init(127, 56, 'startElement && startElement.closest(\'table\', undefined)');
function visit55_291_1(result) {
  _$jscoverage['/table.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['290'][1].init(65, 40, 'selection && selection.getStartElement()');
function visit54_290_1(result) {
  _$jscoverage['/table.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['280'][1].init(74, 88, '!range[\'moveToElementEditablePosition\'](cell, placeAtEnd ? true : undefined)');
function visit53_280_1(result) {
  _$jscoverage['/table.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['270'][1].init(418, 25, 'row[0].cells[cellIndex]');
function visit52_270_1(result) {
  _$jscoverage['/table.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['264'][2].init(237, 24, 'row[0].cells.length == 1');
function visit51_264_2(result) {
  _$jscoverage['/table.js'].branchData['264'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['264'][1].init(223, 38, '!cellIndex && row[0].cells.length == 1');
function visit50_264_1(result) {
  _$jscoverage['/table.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['258'][1].init(486, 6, 'i >= 0');
function visit49_258_1(result) {
  _$jscoverage['/table.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['247'][1].init(141, 6, '!table');
function visit48_247_1(result) {
  _$jscoverage['/table.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['242'][1].init(499, 31, 'selectionOrCell instanceof Node');
function visit47_242_1(result) {
  _$jscoverage['/table.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['236'][1].init(71, 17, 'colsToDelete[i]');
function visit46_236_1(result) {
  _$jscoverage['/table.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['234'][1].init(194, 6, 'i >= 0');
function visit45_234_1(result) {
  _$jscoverage['/table.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['230'][1].init(13, 43, 'selectionOrCell instanceof Editor.Selection');
function visit44_230_1(result) {
  _$jscoverage['/table.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['221'][1].init(74, 10, 'targetCell');
function visit43_221_1(result) {
  _$jscoverage['/table.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['219'][1].init(46, 10, 'i < length');
function visit42_219_1(result) {
  _$jscoverage['/table.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['212'][1].init(27, 22, 'cellIndexList[0] > 0');
function visit41_212_1(result) {
  _$jscoverage['/table.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['211'][1].init(674, 12, '!targetIndex');
function visit40_211_1(result) {
  _$jscoverage['/table.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['205'][1].init(17, 47, 'cellIndexList[i] - cellIndexList[i - 1] > 1');
function visit39_205_1(result) {
  _$jscoverage['/table.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['204'][1].init(55, 10, 'i < length');
function visit38_204_1(result) {
  _$jscoverage['/table.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['197'][1].init(249, 10, 'i < length');
function visit37_197_1(result) {
  _$jscoverage['/table.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['192'][1].init(43, 40, 'cells[0] && cells[0].parent(\'table\')');
function visit36_192_1(result) {
  _$jscoverage['/table.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['183'][1].init(470, 12, 'insertBefore');
function visit35_183_1(result) {
  _$jscoverage['/table.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['179'][1].init(281, 7, '!OLD_IE');
function visit34_179_1(result) {
  _$jscoverage['/table.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['175'][1].init(124, 37, '$row.cells.length < (cellIndex + 1)');
function visit33_175_1(result) {
  _$jscoverage['/table.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['172'][1].init(482, 24, 'i < table[0].rows.length');
function visit32_172_1(result) {
  _$jscoverage['/table.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['164'][1].init(243, 5, '!cell');
function visit31_164_1(result) {
  _$jscoverage['/table.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['161'][1].init(66, 94, 'startElement.closest(\'td\', undefined) || startElement.closest(\'th\', undefined)');
function visit30_161_1(result) {
  _$jscoverage['/table.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['149'][1].init(70, 25, 'table[0].rows.length == 1');
function visit29_149_1(result) {
  _$jscoverage['/table.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['146'][1].init(1558, 30, 'selectionOrRow instanceof Node');
function visit28_146_1(result) {
  _$jscoverage['/table.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['140'][1].init(21, 17, 'rowsToDelete[i]');
function visit27_140_1(result) {
  _$jscoverage['/table.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['139'][1].init(1317, 6, 'i >= 0');
function visit26_139_1(result) {
  _$jscoverage['/table.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['136'][3].init(125, 20, 'previousRowIndex > 0');
function visit25_136_3(result) {
  _$jscoverage['/table.js'].branchData['136'][3].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['136'][2].init(124, 57, 'previousRowIndex > 0 && table[0].rows[previousRowIndex]');
function visit24_136_2(result) {
  _$jscoverage['/table.js'].branchData['136'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['136'][1].init(79, 100, 'previousRowIndex > 0 && table[0].rows[previousRowIndex] || table[0].parentNode');
function visit23_136_1(result) {
  _$jscoverage['/table.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['135'][3].init(44, 23, 'nextRowIndex < rowCount');
function visit22_135_3(result) {
  _$jscoverage['/table.js'].branchData['135'][3].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['135'][2].init(43, 56, 'nextRowIndex < rowCount && table[0].rows[nextRowIndex]');
function visit21_135_2(result) {
  _$jscoverage['/table.js'].branchData['135'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['135'][1].init(25, 180, 'nextRowIndex < rowCount && table[0].rows[nextRowIndex] || previousRowIndex > 0 && table[0].rows[previousRowIndex] || table[0].parentNode');
function visit20_135_1(result) {
  _$jscoverage['/table.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['123'][2].init(220, 19, 'i == cellsCount - 1');
function visit19_123_2(result) {
  _$jscoverage['/table.js'].branchData['123'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['123'][1].init(220, 54, 'i == cellsCount - 1 && (nextRowIndex = rowIndex + 1)');
function visit18_123_1(result) {
  _$jscoverage['/table.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['121'][1].init(113, 41, '!i && (previousRowIndex = rowIndex - 1)');
function visit17_121_1(result) {
  _$jscoverage['/table.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['117'][1].init(362, 14, 'i < cellsCount');
function visit16_117_1(result) {
  _$jscoverage['/table.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['107'][1].init(13, 42, 'selectionOrRow instanceof Editor.Selection');
function visit15_107_1(result) {
  _$jscoverage['/table.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['93'][1].init(130, 4, '!row');
function visit14_93_1(result) {
  _$jscoverage['/table.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['85'][1].init(57, 7, '!OLD_IE');
function visit13_85_1(result) {
  _$jscoverage['/table.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['83'][1].init(126, 17, 'i < $cells.length');
function visit12_83_1(result) {
  _$jscoverage['/table.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['64'][2].init(428, 70, 'cellNodeRegex.test(parent.nodeName()) && !parent.data(\'selected_cell\')');
function visit11_64_2(result) {
  _$jscoverage['/table.js'].branchData['64'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['64'][1].init(418, 80, 'parent && cellNodeRegex.test(parent.nodeName()) && !parent.data(\'selected_cell\')');
function visit10_64_1(result) {
  _$jscoverage['/table.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['48'][1].init(299, 11, 'nearestCell');
function visit9_48_1(result) {
  _$jscoverage['/table.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['46'][1].init(76, 96, 'startNode.closest(\'td\', undefined) || startNode.closest(\'th\', undefined)');
function visit8_46_1(result) {
  _$jscoverage['/table.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['43'][1].init(55, 15, 'range.collapsed');
function visit7_43_1(result) {
  _$jscoverage['/table.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['40'][1].init(890, 17, 'i < ranges.length');
function visit6_40_1(result) {
  _$jscoverage['/table.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['34'][1].init(64, 66, 'cellNodeRegex.test(node.nodeName()) && !node.data(\'selected_cell\')');
function visit5_34_1(result) {
  _$jscoverage['/table.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['33'][2].init(250, 45, 'node[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit4_33_2(result) {
  _$jscoverage['/table.js'].branchData['33'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['33'][1].init(250, 131, 'node[0].nodeType == Dom.NodeType.ELEMENT_NODE && cellNodeRegex.test(node.nodeName()) && !node.data(\'selected_cell\')');
function visit3_33_1(result) {
  _$jscoverage['/table.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['28'][1].init(62, 17, 'retval.length > 0');
function visit2_28_1(result) {
  _$jscoverage['/table.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['8'][1].init(54, 16, 'S.UA.ieMode < 11');
function visit1_8_1(result) {
  _$jscoverage['/table.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/table.js'].functionData[0]++;
  _$jscoverage['/table.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/table.js'].lineData[8]++;
  var OLD_IE = visit1_8_1(S.UA.ieMode < 11);
  _$jscoverage['/table.js'].lineData[9]++;
  var DialogLoader = require('./dialog-loader');
  _$jscoverage['/table.js'].lineData[10]++;
  require('./contextmenu');
  _$jscoverage['/table.js'].lineData[11]++;
  require('./button');
  _$jscoverage['/table.js'].lineData[12]++;
  var UA = S.UA, Dom = S.DOM, Node = S.Node, tableRules = ["tr", "th", "td", "tbody", "table"], cellNodeRegex = /^(?:td|th)$/;
  _$jscoverage['/table.js'].lineData[18]++;
  function getSelectedCells(selection) {
    _$jscoverage['/table.js'].functionData[1]++;
    _$jscoverage['/table.js'].lineData[21]++;
    var bookmarks = selection.createBookmarks(), ranges = selection.getRanges(), retval = [], database = {};
    _$jscoverage['/table.js'].lineData[26]++;
    function moveOutOfCellGuard(node) {
      _$jscoverage['/table.js'].functionData[2]++;
      _$jscoverage['/table.js'].lineData[28]++;
      if (visit2_28_1(retval.length > 0)) {
        _$jscoverage['/table.js'].lineData[29]++;
        return;
      }
      _$jscoverage['/table.js'].lineData[33]++;
      if (visit3_33_1(visit4_33_2(node[0].nodeType == Dom.NodeType.ELEMENT_NODE) && visit5_34_1(cellNodeRegex.test(node.nodeName()) && !node.data('selected_cell')))) {
        _$jscoverage['/table.js'].lineData[35]++;
        node._4eSetMarker(database, 'selected_cell', true, undefined);
        _$jscoverage['/table.js'].lineData[36]++;
        retval.push(node);
      }
    }
    _$jscoverage['/table.js'].lineData[40]++;
    for (var i = 0; visit6_40_1(i < ranges.length); i++) {
      _$jscoverage['/table.js'].lineData[41]++;
      var range = ranges[i];
      _$jscoverage['/table.js'].lineData[43]++;
      if (visit7_43_1(range.collapsed)) {
        _$jscoverage['/table.js'].lineData[45]++;
        var startNode = range.getCommonAncestor(), nearestCell = visit8_46_1(startNode.closest('td', undefined) || startNode.closest('th', undefined));
        _$jscoverage['/table.js'].lineData[48]++;
        if (visit9_48_1(nearestCell)) {
          _$jscoverage['/table.js'].lineData[49]++;
          retval.push(nearestCell);
        }
      } else {
        _$jscoverage['/table.js'].lineData[51]++;
        var walker = new Walker(range), node;
        _$jscoverage['/table.js'].lineData[53]++;
        walker.guard = moveOutOfCellGuard;
        _$jscoverage['/table.js'].lineData[55]++;
        while ((node = walker.next())) {
          _$jscoverage['/table.js'].lineData[63]++;
          var parent = node.parent();
          _$jscoverage['/table.js'].lineData[64]++;
          if (visit10_64_1(parent && visit11_64_2(cellNodeRegex.test(parent.nodeName()) && !parent.data('selected_cell')))) {
            _$jscoverage['/table.js'].lineData[65]++;
            parent._4eSetMarker(database, 'selected_cell', true, undefined);
            _$jscoverage['/table.js'].lineData[66]++;
            retval.push(parent);
          }
        }
      }
    }
    _$jscoverage['/table.js'].lineData[72]++;
    Editor.Utils.clearAllMarkers(database);
    _$jscoverage['/table.js'].lineData[74]++;
    selection.selectBookmarks(bookmarks);
    _$jscoverage['/table.js'].lineData[76]++;
    return retval;
  }
  _$jscoverage['/table.js'].lineData[79]++;
  function clearRow($tr) {
    _$jscoverage['/table.js'].functionData[3]++;
    _$jscoverage['/table.js'].lineData[81]++;
    var $cells = $tr.cells;
    _$jscoverage['/table.js'].lineData[83]++;
    for (var i = 0; visit12_83_1(i < $cells.length); i++) {
      _$jscoverage['/table.js'].lineData[84]++;
      $cells[i].innerHTML = '';
      _$jscoverage['/table.js'].lineData[85]++;
      if (visit13_85_1(!OLD_IE)) {
        _$jscoverage['/table.js'].lineData[86]++;
        (new Node($cells[i]))._4eAppendBogus(undefined);
      }
    }
  }
  _$jscoverage['/table.js'].lineData[90]++;
  function insertRow(selection, insertBefore) {
    _$jscoverage['/table.js'].functionData[4]++;
    _$jscoverage['/table.js'].lineData[92]++;
    var row = selection.getStartElement().parent('tr');
    _$jscoverage['/table.js'].lineData[93]++;
    if (visit14_93_1(!row)) {
      _$jscoverage['/table.js'].lineData[94]++;
      return;
    }
    _$jscoverage['/table.js'].lineData[97]++;
    var newRow = row.clone(true);
    _$jscoverage['/table.js'].lineData[99]++;
    newRow.insertBefore(row);
    _$jscoverage['/table.js'].lineData[103]++;
    clearRow(insertBefore ? newRow[0] : row[0]);
  }
  _$jscoverage['/table.js'].lineData[106]++;
  function deleteRows(selectionOrRow) {
    _$jscoverage['/table.js'].functionData[5]++;
    _$jscoverage['/table.js'].lineData[107]++;
    if (visit15_107_1(selectionOrRow instanceof Editor.Selection)) {
      _$jscoverage['/table.js'].lineData[108]++;
      var cells = getSelectedCells(selectionOrRow), cellsCount = cells.length, rowsToDelete = [], cursorPosition, previousRowIndex, nextRowIndex;
      _$jscoverage['/table.js'].lineData[117]++;
      for (var i = 0; visit16_117_1(i < cellsCount); i++) {
        _$jscoverage['/table.js'].lineData[118]++;
        var row = cells[i].parent(), rowIndex = row[0].rowIndex;
        _$jscoverage['/table.js'].lineData[121]++;
        visit17_121_1(!i && (previousRowIndex = rowIndex - 1));
        _$jscoverage['/table.js'].lineData[122]++;
        rowsToDelete[rowIndex] = row;
        _$jscoverage['/table.js'].lineData[123]++;
        visit18_123_1(visit19_123_2(i == cellsCount - 1) && (nextRowIndex = rowIndex + 1));
      }
      _$jscoverage['/table.js'].lineData[126]++;
      var table = row.parent('table'), rows = table[0].rows, rowCount = rows.length;
      _$jscoverage['/table.js'].lineData[134]++;
      cursorPosition = new Node(visit20_135_1(visit21_135_2(visit22_135_3(nextRowIndex < rowCount) && table[0].rows[nextRowIndex]) || visit23_136_1(visit24_136_2(visit25_136_3(previousRowIndex > 0) && table[0].rows[previousRowIndex]) || table[0].parentNode)));
      _$jscoverage['/table.js'].lineData[139]++;
      for (i = rowsToDelete.length; visit26_139_1(i >= 0); i--) {
        _$jscoverage['/table.js'].lineData[140]++;
        if (visit27_140_1(rowsToDelete[i])) {
          _$jscoverage['/table.js'].lineData[141]++;
          deleteRows(rowsToDelete[i]);
        }
      }
      _$jscoverage['/table.js'].lineData[144]++;
      return cursorPosition;
    } else {
      _$jscoverage['/table.js'].lineData[146]++;
      if (visit28_146_1(selectionOrRow instanceof Node)) {
        _$jscoverage['/table.js'].lineData[147]++;
        table = selectionOrRow.parent('table');
        _$jscoverage['/table.js'].lineData[149]++;
        if (visit29_149_1(table[0].rows.length == 1)) {
          _$jscoverage['/table.js'].lineData[150]++;
          table.remove();
        } else {
          _$jscoverage['/table.js'].lineData[152]++;
          selectionOrRow.remove();
        }
      }
    }
    _$jscoverage['/table.js'].lineData[155]++;
    return 0;
  }
  _$jscoverage['/table.js'].lineData[158]++;
  function insertColumn(selection, insertBefore) {
    _$jscoverage['/table.js'].functionData[6]++;
    _$jscoverage['/table.js'].lineData[160]++;
    var startElement = selection.getStartElement(), cell = visit30_161_1(startElement.closest('td', undefined) || startElement.closest('th', undefined));
    _$jscoverage['/table.js'].lineData[164]++;
    if (visit31_164_1(!cell)) {
      _$jscoverage['/table.js'].lineData[165]++;
      return;
    }
    _$jscoverage['/table.js'].lineData[169]++;
    var table = cell.parent('table'), cellIndex = cell[0].cellIndex;
    _$jscoverage['/table.js'].lineData[172]++;
    for (var i = 0; visit32_172_1(i < table[0].rows.length); i++) {
      _$jscoverage['/table.js'].lineData[173]++;
      var $row = table[0].rows[i];
      _$jscoverage['/table.js'].lineData[175]++;
      if (visit33_175_1($row.cells.length < (cellIndex + 1))) {
        _$jscoverage['/table.js'].lineData[176]++;
        continue;
      }
      _$jscoverage['/table.js'].lineData[177]++;
      cell = new Node($row.cells[cellIndex].cloneNode(undefined));
      _$jscoverage['/table.js'].lineData[179]++;
      if (visit34_179_1(!OLD_IE)) {
        _$jscoverage['/table.js'].lineData[180]++;
        cell._4eAppendBogus(undefined);
      }
      _$jscoverage['/table.js'].lineData[182]++;
      var baseCell = new Node($row.cells[cellIndex]);
      _$jscoverage['/table.js'].lineData[183]++;
      if (visit35_183_1(insertBefore)) {
        _$jscoverage['/table.js'].lineData[184]++;
        cell.insertBefore(baseCell);
      } else {
        _$jscoverage['/table.js'].lineData[186]++;
        cell.insertAfter(baseCell);
      }
    }
  }
  _$jscoverage['/table.js'].lineData[190]++;
  function getFocusElementAfterDelCols(cells) {
    _$jscoverage['/table.js'].functionData[7]++;
    _$jscoverage['/table.js'].lineData[191]++;
    var cellIndexList = [], table = visit36_192_1(cells[0] && cells[0].parent('table')), i, length, targetIndex, targetCell;
    _$jscoverage['/table.js'].lineData[197]++;
    for (i = 0 , length = cells.length; visit37_197_1(i < length); i++) {
      _$jscoverage['/table.js'].lineData[198]++;
      cellIndexList.push(cells[i][0].cellIndex);
    }
    _$jscoverage['/table.js'].lineData[202]++;
    cellIndexList.sort();
    _$jscoverage['/table.js'].lineData[203]++;
    for (i = 1 , length = cellIndexList.length; visit38_204_1(i < length); i++) {
      _$jscoverage['/table.js'].lineData[205]++;
      if (visit39_205_1(cellIndexList[i] - cellIndexList[i - 1] > 1)) {
        _$jscoverage['/table.js'].lineData[206]++;
        targetIndex = cellIndexList[i - 1] + 1;
        _$jscoverage['/table.js'].lineData[207]++;
        break;
      }
    }
    _$jscoverage['/table.js'].lineData[211]++;
    if (visit40_211_1(!targetIndex)) {
      _$jscoverage['/table.js'].lineData[212]++;
      targetIndex = visit41_212_1(cellIndexList[0] > 0) ? (cellIndexList[0] - 1) : (cellIndexList[cellIndexList.length - 1] + 1);
    }
    _$jscoverage['/table.js'].lineData[217]++;
    var rows = table[0].rows;
    _$jscoverage['/table.js'].lineData[218]++;
    for (i = 0 , length = rows.length; visit42_219_1(i < length); i++) {
      _$jscoverage['/table.js'].lineData[220]++;
      targetCell = rows[i].cells[targetIndex];
      _$jscoverage['/table.js'].lineData[221]++;
      if (visit43_221_1(targetCell)) {
        _$jscoverage['/table.js'].lineData[222]++;
        break;
      }
    }
    _$jscoverage['/table.js'].lineData[226]++;
    return targetCell ? new Node(targetCell) : table.prev();
  }
  _$jscoverage['/table.js'].lineData[229]++;
  function deleteColumns(selectionOrCell) {
    _$jscoverage['/table.js'].functionData[8]++;
    _$jscoverage['/table.js'].lineData[230]++;
    if (visit44_230_1(selectionOrCell instanceof Editor.Selection)) {
      _$jscoverage['/table.js'].lineData[231]++;
      var colsToDelete = getSelectedCells(selectionOrCell), elementToFocus = getFocusElementAfterDelCols(colsToDelete);
      _$jscoverage['/table.js'].lineData[234]++;
      for (var i = colsToDelete.length - 1; visit45_234_1(i >= 0); i--) {
        _$jscoverage['/table.js'].lineData[236]++;
        if (visit46_236_1(colsToDelete[i])) {
          _$jscoverage['/table.js'].lineData[237]++;
          deleteColumns(colsToDelete[i]);
        }
      }
      _$jscoverage['/table.js'].lineData[241]++;
      return elementToFocus;
    } else {
      _$jscoverage['/table.js'].lineData[242]++;
      if (visit47_242_1(selectionOrCell instanceof Node)) {
        _$jscoverage['/table.js'].lineData[244]++;
        var table = selectionOrCell.parent('table');
        _$jscoverage['/table.js'].lineData[247]++;
        if (visit48_247_1(!table)) {
          _$jscoverage['/table.js'].lineData[248]++;
          return null;
        }
        _$jscoverage['/table.js'].lineData[251]++;
        var cellIndex = selectionOrCell[0].cellIndex;
        _$jscoverage['/table.js'].lineData[258]++;
        for (i = table[0].rows.length - 1; visit49_258_1(i >= 0); i--) {
          _$jscoverage['/table.js'].lineData[260]++;
          var row = new Node(table[0].rows[i]);
          _$jscoverage['/table.js'].lineData[264]++;
          if (visit50_264_1(!cellIndex && visit51_264_2(row[0].cells.length == 1))) {
            _$jscoverage['/table.js'].lineData[265]++;
            deleteRows(row);
            _$jscoverage['/table.js'].lineData[266]++;
            continue;
          }
          _$jscoverage['/table.js'].lineData[270]++;
          if (visit52_270_1(row[0].cells[cellIndex])) {
            _$jscoverage['/table.js'].lineData[271]++;
            row[0].removeChild(row[0].cells[cellIndex]);
          }
        }
      }
    }
    _$jscoverage['/table.js'].lineData[275]++;
    return null;
  }
  _$jscoverage['/table.js'].lineData[278]++;
  function placeCursorInCell(cell, placeAtEnd) {
    _$jscoverage['/table.js'].functionData[9]++;
    _$jscoverage['/table.js'].lineData[279]++;
    var range = new Editor.Range(cell[0].ownerDocument);
    _$jscoverage['/table.js'].lineData[280]++;
    if (visit53_280_1(!range.moveToElementEditablePosition(cell, placeAtEnd ? true : undefined))) {
      _$jscoverage['/table.js'].lineData[282]++;
      range.selectNodeContents(cell);
      _$jscoverage['/table.js'].lineData[283]++;
      range.collapse(placeAtEnd ? false : true);
    }
    _$jscoverage['/table.js'].lineData[285]++;
    range.select(true);
  }
  _$jscoverage['/table.js'].lineData[288]++;
  function getSel(editor) {
    _$jscoverage['/table.js'].functionData[10]++;
    _$jscoverage['/table.js'].lineData[289]++;
    var selection = editor.getSelection(), startElement = visit54_290_1(selection && selection.getStartElement()), table = visit55_291_1(startElement && startElement.closest('table', undefined));
    _$jscoverage['/table.js'].lineData[292]++;
    if (visit56_292_1(!table)) {
      _$jscoverage['/table.js'].lineData[293]++;
      return undefined;
    }
    _$jscoverage['/table.js'].lineData[294]++;
    var td = startElement.closest(function(n) {
  _$jscoverage['/table.js'].functionData[11]++;
  _$jscoverage['/table.js'].lineData[295]++;
  var name = Dom.nodeName(n);
  _$jscoverage['/table.js'].lineData[296]++;
  return visit57_296_1(table.contains(n) && (visit58_296_2(visit59_296_3(name == "td") || visit60_296_4(name == "th"))));
}, undefined);
    _$jscoverage['/table.js'].lineData[298]++;
    var tr = startElement.closest(function(n) {
  _$jscoverage['/table.js'].functionData[12]++;
  _$jscoverage['/table.js'].lineData[299]++;
  var name = Dom.nodeName(n);
  _$jscoverage['/table.js'].lineData[300]++;
  return visit61_300_1(table.contains(n) && visit62_300_2(name == "tr"));
}, undefined);
    _$jscoverage['/table.js'].lineData[302]++;
    return {
  table: table, 
  td: td, 
  tr: tr};
  }
  _$jscoverage['/table.js'].lineData[309]++;
  function ensureTd(editor) {
    _$jscoverage['/table.js'].functionData[13]++;
    _$jscoverage['/table.js'].lineData[310]++;
    var info = getSel(editor);
    _$jscoverage['/table.js'].lineData[311]++;
    return visit63_311_1(info && info.td);
  }
  _$jscoverage['/table.js'].lineData[315]++;
  function ensureTr(editor) {
    _$jscoverage['/table.js'].functionData[14]++;
    _$jscoverage['/table.js'].lineData[316]++;
    var info = getSel(editor);
    _$jscoverage['/table.js'].lineData[317]++;
    return visit64_317_1(info && info.tr);
  }
  _$jscoverage['/table.js'].lineData[320]++;
  var statusChecker = {
  "\u8868\u683c\u5c5e\u6027": getSel, 
  "\u5220\u9664\u8868\u683c": ensureTd, 
  "\u5220\u9664\u5217": ensureTd, 
  "\u5220\u9664\u884c": ensureTr, 
  '\u5728\u4e0a\u65b9\u63d2\u5165\u884c': ensureTr, 
  '\u5728\u4e0b\u65b9\u63d2\u5165\u884c': ensureTr, 
  '\u5728\u5de6\u4fa7\u63d2\u5165\u5217': ensureTd, 
  '\u5728\u53f3\u4fa7\u63d2\u5165\u5217': ensureTd};
  _$jscoverage['/table.js'].lineData[332]++;
  var showBorderClassName = 'ke_show_border', cssTemplate = (visit65_336_1(UA.ie === 6) ? ['table.%2,', 'table.%2 td, table.%2 th,', '{', 'border : #d3d3d3 1px dotted', '}'] : [' table.%2,', ' table.%2 > tr > td,  table.%2 > tr > th,', ' table.%2 > tbody > tr > td,  table.%2 > tbody > tr > th,', ' table.%2 > thead > tr > td,  table.%2 > thead > tr > th,', ' table.%2 > tfoot > tr > td,  table.%2 > tfoot > tr > th', '{', 'border : #d3d3d3 1px dotted', '}']).join(''), cssStyleText = cssTemplate.replace(/%2/g, showBorderClassName), extraDataFilter = {
  tags: {
  'table': function(element) {
  _$jscoverage['/table.js'].functionData[15]++;
  _$jscoverage['/table.js'].lineData[360]++;
  var cssClass = element.getAttribute("class"), border = parseInt(element.getAttribute("border"), 10);
  _$jscoverage['/table.js'].lineData[363]++;
  if (visit66_363_1(!border || visit67_363_2(border <= 0))) {
    _$jscoverage['/table.js'].lineData[364]++;
    element.setAttribute("class", S.trim((visit68_364_1(cssClass || "")) + ' ' + showBorderClassName));
  }
}}}, extraHTMLFilter = {
  tags: {
  'table': function(table) {
  _$jscoverage['/table.js'].functionData[16]++;
  _$jscoverage['/table.js'].lineData[374]++;
  var cssClass = table.getAttribute("class"), v;
  _$jscoverage['/table.js'].lineData[376]++;
  if (visit69_376_1(cssClass)) {
    _$jscoverage['/table.js'].lineData[377]++;
    v = S.trim(cssClass.replace(showBorderClassName, ""));
    _$jscoverage['/table.js'].lineData[378]++;
    if (visit70_378_1(v)) {
      _$jscoverage['/table.js'].lineData[379]++;
      table.setAttribute("class", v);
    } else {
      _$jscoverage['/table.js'].lineData[381]++;
      table.removeAttribute("class");
    }
  }
}}};
  _$jscoverage['/table.js'].lineData[391]++;
  function TablePlugin(config) {
    _$jscoverage['/table.js'].functionData[17]++;
    _$jscoverage['/table.js'].lineData[392]++;
    this.config = visit71_392_1(config || {});
  }
  _$jscoverage['/table.js'].lineData[395]++;
  S.augment(TablePlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/table.js'].functionData[18]++;
  _$jscoverage['/table.js'].lineData[398]++;
  editor.addCustomStyle(cssStyleText);
  _$jscoverage['/table.js'].lineData[400]++;
  var dataProcessor = editor.htmlDataProcessor, dataFilter = visit72_401_1(dataProcessor && dataProcessor.dataFilter), htmlFilter = visit73_402_1(dataProcessor && dataProcessor.htmlFilter);
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
  if (visit74_413_1(info)) {
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
  var selection = editor.getSelection(), startElement = visit75_426_1(selection && selection.getStartElement()), table = visit76_427_1(startElement && startElement.closest('table', undefined));
  _$jscoverage['/table.js'].lineData[429]++;
  if (visit77_429_1(!table)) {
    _$jscoverage['/table.js'].lineData[430]++;
    return;
  }
  _$jscoverage['/table.js'].lineData[433]++;
  editor.execCommand('save');
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
  if (visit78_444_1(visit79_444_2(parent[0].childNodes.length == 1) && visit80_445_1(visit81_445_2(parent.nodeName() != 'body') && visit82_446_1(parent.nodeName() != 'td')))) {
    _$jscoverage['/table.js'].lineData[447]++;
    parent.remove();
  } else {
    _$jscoverage['/table.js'].lineData[449]++;
    table.remove();
  }
  _$jscoverage['/table.js'].lineData[451]++;
  editor.execCommand('save');
}, 
  '\u5220\u9664\u884c ': function() {
  _$jscoverage['/table.js'].functionData[21]++;
  _$jscoverage['/table.js'].lineData[455]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[456]++;
  editor.execCommand('save');
  _$jscoverage['/table.js'].lineData[457]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[458]++;
  placeCursorInCell(deleteRows(selection), undefined);
  _$jscoverage['/table.js'].lineData[459]++;
  editor.execCommand('save');
}, 
  '\u5220\u9664\u5217 ': function() {
  _$jscoverage['/table.js'].functionData[22]++;
  _$jscoverage['/table.js'].lineData[463]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[464]++;
  editor.execCommand('save');
  _$jscoverage['/table.js'].lineData[465]++;
  var selection = editor.getSelection(), element = deleteColumns(selection);
  _$jscoverage['/table.js'].lineData[467]++;
  visit83_467_1(element && placeCursorInCell(element, true));
  _$jscoverage['/table.js'].lineData[468]++;
  editor.execCommand('save');
}, 
  '\u5728\u4e0a\u65b9\u63d2\u5165\u884c': function() {
  _$jscoverage['/table.js'].functionData[23]++;
  _$jscoverage['/table.js'].lineData[472]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[473]++;
  editor.execCommand('save');
  _$jscoverage['/table.js'].lineData[474]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[475]++;
  insertRow(selection, true);
  _$jscoverage['/table.js'].lineData[476]++;
  editor.execCommand('save');
}, 
  '\u5728\u4e0b\u65b9\u63d2\u5165\u884c': function() {
  _$jscoverage['/table.js'].functionData[24]++;
  _$jscoverage['/table.js'].lineData[480]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[481]++;
  editor.execCommand('save');
  _$jscoverage['/table.js'].lineData[482]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[483]++;
  insertRow(selection, undefined);
  _$jscoverage['/table.js'].lineData[484]++;
  editor.execCommand('save');
}, 
  '\u5728\u5de6\u4fa7\u63d2\u5165\u5217': function() {
  _$jscoverage['/table.js'].functionData[25]++;
  _$jscoverage['/table.js'].lineData[488]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[489]++;
  editor.execCommand('save');
  _$jscoverage['/table.js'].lineData[490]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[491]++;
  insertColumn(selection, true);
  _$jscoverage['/table.js'].lineData[492]++;
  editor.execCommand('save');
}, 
  '\u5728\u53f3\u4fa7\u63d2\u5165\u5217': function() {
  _$jscoverage['/table.js'].functionData[26]++;
  _$jscoverage['/table.js'].lineData[496]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[497]++;
  editor.execCommand('save');
  _$jscoverage['/table.js'].lineData[498]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[499]++;
  insertColumn(selection, undefined);
  _$jscoverage['/table.js'].lineData[500]++;
  editor.execCommand('save');
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
  if (visit84_512_1(S.inArray(Dom.nodeName(node), tableRules))) {
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
  var content = e.target.get('content');
  _$jscoverage['/table.js'].lineData[521]++;
  if (visit85_521_1(handlers[content])) {
    _$jscoverage['/table.js'].lineData[522]++;
    handlers[content].apply(this);
  }
}, 
  beforeVisibleChange: function(e) {
  _$jscoverage['/table.js'].functionData[30]++;
  _$jscoverage['/table.js'].lineData[527]++;
  if (visit86_527_1(e.newVal)) {
    _$jscoverage['/table.js'].lineData[528]++;
    var self = this, children = self.get('children');
    _$jscoverage['/table.js'].lineData[529]++;
    var editor = self.get('editor');
    _$jscoverage['/table.js'].lineData[530]++;
    S.each(children, function(c) {
  _$jscoverage['/table.js'].functionData[31]++;
  _$jscoverage['/table.js'].lineData[531]++;
  var content = c.get('content');
  _$jscoverage['/table.js'].lineData[532]++;
  if (visit87_532_1(!statusChecker[content] || statusChecker[content].call(self, editor))) {
    _$jscoverage['/table.js'].lineData[534]++;
    c.set('disabled', false);
  } else {
    _$jscoverage['/table.js'].lineData[536]++;
    c.set('disabled', true);
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
});
