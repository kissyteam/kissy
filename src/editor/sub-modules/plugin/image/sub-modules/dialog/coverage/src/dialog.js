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
if (! _$jscoverage['/dialog.js']) {
  _$jscoverage['/dialog.js'] = {};
  _$jscoverage['/dialog.js'].lineData = [];
  _$jscoverage['/dialog.js'].lineData[6] = 0;
  _$jscoverage['/dialog.js'].lineData[8] = 0;
  _$jscoverage['/dialog.js'].lineData[9] = 0;
  _$jscoverage['/dialog.js'].lineData[10] = 0;
  _$jscoverage['/dialog.js'].lineData[11] = 0;
  _$jscoverage['/dialog.js'].lineData[12] = 0;
  _$jscoverage['/dialog.js'].lineData[13] = 0;
  _$jscoverage['/dialog.js'].lineData[14] = 0;
  _$jscoverage['/dialog.js'].lineData[35] = 0;
  _$jscoverage['/dialog.js'].lineData[36] = 0;
  _$jscoverage['/dialog.js'].lineData[37] = 0;
  _$jscoverage['/dialog.js'].lineData[38] = 0;
  _$jscoverage['/dialog.js'].lineData[39] = 0;
  _$jscoverage['/dialog.js'].lineData[40] = 0;
  _$jscoverage['/dialog.js'].lineData[42] = 0;
  _$jscoverage['/dialog.js'].lineData[43] = 0;
  _$jscoverage['/dialog.js'].lineData[45] = 0;
  _$jscoverage['/dialog.js'].lineData[47] = 0;
  _$jscoverage['/dialog.js'].lineData[50] = 0;
  _$jscoverage['/dialog.js'].lineData[51] = 0;
  _$jscoverage['/dialog.js'].lineData[52] = 0;
  _$jscoverage['/dialog.js'].lineData[53] = 0;
  _$jscoverage['/dialog.js'].lineData[54] = 0;
  _$jscoverage['/dialog.js'].lineData[55] = 0;
  _$jscoverage['/dialog.js'].lineData[57] = 0;
  _$jscoverage['/dialog.js'].lineData[58] = 0;
  _$jscoverage['/dialog.js'].lineData[61] = 0;
  _$jscoverage['/dialog.js'].lineData[63] = 0;
  _$jscoverage['/dialog.js'].lineData[64] = 0;
  _$jscoverage['/dialog.js'].lineData[66] = 0;
  _$jscoverage['/dialog.js'].lineData[78] = 0;
  _$jscoverage['/dialog.js'].lineData[83] = 0;
  _$jscoverage['/dialog.js'].lineData[84] = 0;
  _$jscoverage['/dialog.js'].lineData[85] = 0;
  _$jscoverage['/dialog.js'].lineData[89] = 0;
  _$jscoverage['/dialog.js'].lineData[90] = 0;
  _$jscoverage['/dialog.js'].lineData[91] = 0;
  _$jscoverage['/dialog.js'].lineData[92] = 0;
  _$jscoverage['/dialog.js'].lineData[93] = 0;
  _$jscoverage['/dialog.js'].lineData[94] = 0;
  _$jscoverage['/dialog.js'].lineData[102] = 0;
  _$jscoverage['/dialog.js'].lineData[103] = 0;
  _$jscoverage['/dialog.js'].lineData[104] = 0;
  _$jscoverage['/dialog.js'].lineData[105] = 0;
  _$jscoverage['/dialog.js'].lineData[106] = 0;
  _$jscoverage['/dialog.js'].lineData[107] = 0;
  _$jscoverage['/dialog.js'].lineData[108] = 0;
  _$jscoverage['/dialog.js'].lineData[109] = 0;
  _$jscoverage['/dialog.js'].lineData[111] = 0;
  _$jscoverage['/dialog.js'].lineData[112] = 0;
  _$jscoverage['/dialog.js'].lineData[113] = 0;
  _$jscoverage['/dialog.js'].lineData[115] = 0;
  _$jscoverage['/dialog.js'].lineData[117] = 0;
  _$jscoverage['/dialog.js'].lineData[120] = 0;
  _$jscoverage['/dialog.js'].lineData[121] = 0;
  _$jscoverage['/dialog.js'].lineData[122] = 0;
  _$jscoverage['/dialog.js'].lineData[124] = 0;
  _$jscoverage['/dialog.js'].lineData[126] = 0;
  _$jscoverage['/dialog.js'].lineData[129] = 0;
  _$jscoverage['/dialog.js'].lineData[130] = 0;
  _$jscoverage['/dialog.js'].lineData[131] = 0;
  _$jscoverage['/dialog.js'].lineData[134] = 0;
  _$jscoverage['/dialog.js'].lineData[142] = 0;
  _$jscoverage['/dialog.js'].lineData[144] = 0;
  _$jscoverage['/dialog.js'].lineData[145] = 0;
  _$jscoverage['/dialog.js'].lineData[146] = 0;
  _$jscoverage['/dialog.js'].lineData[155] = 0;
  _$jscoverage['/dialog.js'].lineData[158] = 0;
  _$jscoverage['/dialog.js'].lineData[159] = 0;
  _$jscoverage['/dialog.js'].lineData[160] = 0;
  _$jscoverage['/dialog.js'].lineData[164] = 0;
  _$jscoverage['/dialog.js'].lineData[165] = 0;
  _$jscoverage['/dialog.js'].lineData[168] = 0;
  _$jscoverage['/dialog.js'].lineData[169] = 0;
  _$jscoverage['/dialog.js'].lineData[170] = 0;
  _$jscoverage['/dialog.js'].lineData[173] = 0;
  _$jscoverage['/dialog.js'].lineData[174] = 0;
  _$jscoverage['/dialog.js'].lineData[176] = 0;
  _$jscoverage['/dialog.js'].lineData[177] = 0;
  _$jscoverage['/dialog.js'].lineData[178] = 0;
  _$jscoverage['/dialog.js'].lineData[181] = 0;
  _$jscoverage['/dialog.js'].lineData[183] = 0;
  _$jscoverage['/dialog.js'].lineData[184] = 0;
  _$jscoverage['/dialog.js'].lineData[185] = 0;
  _$jscoverage['/dialog.js'].lineData[188] = 0;
  _$jscoverage['/dialog.js'].lineData[191] = 0;
  _$jscoverage['/dialog.js'].lineData[192] = 0;
  _$jscoverage['/dialog.js'].lineData[193] = 0;
  _$jscoverage['/dialog.js'].lineData[196] = 0;
  _$jscoverage['/dialog.js'].lineData[199] = 0;
  _$jscoverage['/dialog.js'].lineData[201] = 0;
  _$jscoverage['/dialog.js'].lineData[208] = 0;
  _$jscoverage['/dialog.js'].lineData[212] = 0;
  _$jscoverage['/dialog.js'].lineData[213] = 0;
  _$jscoverage['/dialog.js'].lineData[214] = 0;
  _$jscoverage['/dialog.js'].lineData[216] = 0;
  _$jscoverage['/dialog.js'].lineData[217] = 0;
  _$jscoverage['/dialog.js'].lineData[219] = 0;
  _$jscoverage['/dialog.js'].lineData[220] = 0;
  _$jscoverage['/dialog.js'].lineData[221] = 0;
  _$jscoverage['/dialog.js'].lineData[223] = 0;
  _$jscoverage['/dialog.js'].lineData[226] = 0;
  _$jscoverage['/dialog.js'].lineData[227] = 0;
  _$jscoverage['/dialog.js'].lineData[231] = 0;
  _$jscoverage['/dialog.js'].lineData[236] = 0;
  _$jscoverage['/dialog.js'].lineData[242] = 0;
  _$jscoverage['/dialog.js'].lineData[243] = 0;
  _$jscoverage['/dialog.js'].lineData[245] = 0;
  _$jscoverage['/dialog.js'].lineData[249] = 0;
  _$jscoverage['/dialog.js'].lineData[250] = 0;
  _$jscoverage['/dialog.js'].lineData[252] = 0;
  _$jscoverage['/dialog.js'].lineData[254] = 0;
  _$jscoverage['/dialog.js'].lineData[257] = 0;
  _$jscoverage['/dialog.js'].lineData[270] = 0;
  _$jscoverage['/dialog.js'].lineData[271] = 0;
  _$jscoverage['/dialog.js'].lineData[273] = 0;
  _$jscoverage['/dialog.js'].lineData[274] = 0;
  _$jscoverage['/dialog.js'].lineData[275] = 0;
  _$jscoverage['/dialog.js'].lineData[276] = 0;
  _$jscoverage['/dialog.js'].lineData[278] = 0;
  _$jscoverage['/dialog.js'].lineData[279] = 0;
  _$jscoverage['/dialog.js'].lineData[281] = 0;
  _$jscoverage['/dialog.js'].lineData[282] = 0;
  _$jscoverage['/dialog.js'].lineData[284] = 0;
  _$jscoverage['/dialog.js'].lineData[287] = 0;
  _$jscoverage['/dialog.js'].lineData[288] = 0;
  _$jscoverage['/dialog.js'].lineData[292] = 0;
  _$jscoverage['/dialog.js'].lineData[295] = 0;
  _$jscoverage['/dialog.js'].lineData[299] = 0;
  _$jscoverage['/dialog.js'].lineData[308] = 0;
  _$jscoverage['/dialog.js'].lineData[309] = 0;
  _$jscoverage['/dialog.js'].lineData[311] = 0;
  _$jscoverage['/dialog.js'].lineData[312] = 0;
  _$jscoverage['/dialog.js'].lineData[314] = 0;
  _$jscoverage['/dialog.js'].lineData[315] = 0;
  _$jscoverage['/dialog.js'].lineData[317] = 0;
  _$jscoverage['/dialog.js'].lineData[318] = 0;
  _$jscoverage['/dialog.js'].lineData[321] = 0;
  _$jscoverage['/dialog.js'].lineData[328] = 0;
  _$jscoverage['/dialog.js'].lineData[329] = 0;
  _$jscoverage['/dialog.js'].lineData[330] = 0;
  _$jscoverage['/dialog.js'].lineData[331] = 0;
  _$jscoverage['/dialog.js'].lineData[338] = 0;
  _$jscoverage['/dialog.js'].lineData[348] = 0;
  _$jscoverage['/dialog.js'].lineData[353] = 0;
  _$jscoverage['/dialog.js'].lineData[354] = 0;
  _$jscoverage['/dialog.js'].lineData[364] = 0;
  _$jscoverage['/dialog.js'].lineData[365] = 0;
  _$jscoverage['/dialog.js'].lineData[366] = 0;
  _$jscoverage['/dialog.js'].lineData[367] = 0;
  _$jscoverage['/dialog.js'].lineData[368] = 0;
  _$jscoverage['/dialog.js'].lineData[369] = 0;
  _$jscoverage['/dialog.js'].lineData[372] = 0;
  _$jscoverage['/dialog.js'].lineData[373] = 0;
  _$jscoverage['/dialog.js'].lineData[376] = 0;
  _$jscoverage['/dialog.js'].lineData[380] = 0;
  _$jscoverage['/dialog.js'].lineData[382] = 0;
  _$jscoverage['/dialog.js'].lineData[383] = 0;
  _$jscoverage['/dialog.js'].lineData[385] = 0;
  _$jscoverage['/dialog.js'].lineData[388] = 0;
  _$jscoverage['/dialog.js'].lineData[389] = 0;
  _$jscoverage['/dialog.js'].lineData[390] = 0;
  _$jscoverage['/dialog.js'].lineData[391] = 0;
  _$jscoverage['/dialog.js'].lineData[394] = 0;
  _$jscoverage['/dialog.js'].lineData[395] = 0;
  _$jscoverage['/dialog.js'].lineData[397] = 0;
  _$jscoverage['/dialog.js'].lineData[398] = 0;
  _$jscoverage['/dialog.js'].lineData[400] = 0;
  _$jscoverage['/dialog.js'].lineData[401] = 0;
  _$jscoverage['/dialog.js'].lineData[407] = 0;
  _$jscoverage['/dialog.js'].lineData[411] = 0;
  _$jscoverage['/dialog.js'].lineData[412] = 0;
  _$jscoverage['/dialog.js'].lineData[413] = 0;
  _$jscoverage['/dialog.js'].lineData[414] = 0;
  _$jscoverage['/dialog.js'].lineData[416] = 0;
  _$jscoverage['/dialog.js'].lineData[417] = 0;
  _$jscoverage['/dialog.js'].lineData[419] = 0;
  _$jscoverage['/dialog.js'].lineData[421] = 0;
  _$jscoverage['/dialog.js'].lineData[422] = 0;
  _$jscoverage['/dialog.js'].lineData[424] = 0;
  _$jscoverage['/dialog.js'].lineData[426] = 0;
  _$jscoverage['/dialog.js'].lineData[427] = 0;
  _$jscoverage['/dialog.js'].lineData[428] = 0;
  _$jscoverage['/dialog.js'].lineData[429] = 0;
  _$jscoverage['/dialog.js'].lineData[430] = 0;
  _$jscoverage['/dialog.js'].lineData[431] = 0;
  _$jscoverage['/dialog.js'].lineData[433] = 0;
  _$jscoverage['/dialog.js'].lineData[434] = 0;
  _$jscoverage['/dialog.js'].lineData[435] = 0;
  _$jscoverage['/dialog.js'].lineData[436] = 0;
  _$jscoverage['/dialog.js'].lineData[437] = 0;
  _$jscoverage['/dialog.js'].lineData[439] = 0;
  _$jscoverage['/dialog.js'].lineData[440] = 0;
  _$jscoverage['/dialog.js'].lineData[441] = 0;
  _$jscoverage['/dialog.js'].lineData[443] = 0;
  _$jscoverage['/dialog.js'].lineData[444] = 0;
  _$jscoverage['/dialog.js'].lineData[446] = 0;
  _$jscoverage['/dialog.js'].lineData[447] = 0;
  _$jscoverage['/dialog.js'].lineData[448] = 0;
  _$jscoverage['/dialog.js'].lineData[449] = 0;
  _$jscoverage['/dialog.js'].lineData[450] = 0;
  _$jscoverage['/dialog.js'].lineData[451] = 0;
  _$jscoverage['/dialog.js'].lineData[452] = 0;
  _$jscoverage['/dialog.js'].lineData[453] = 0;
  _$jscoverage['/dialog.js'].lineData[454] = 0;
  _$jscoverage['/dialog.js'].lineData[456] = 0;
  _$jscoverage['/dialog.js'].lineData[457] = 0;
  _$jscoverage['/dialog.js'].lineData[458] = 0;
  _$jscoverage['/dialog.js'].lineData[460] = 0;
  _$jscoverage['/dialog.js'].lineData[461] = 0;
  _$jscoverage['/dialog.js'].lineData[463] = 0;
  _$jscoverage['/dialog.js'].lineData[464] = 0;
  _$jscoverage['/dialog.js'].lineData[465] = 0;
  _$jscoverage['/dialog.js'].lineData[466] = 0;
  _$jscoverage['/dialog.js'].lineData[469] = 0;
  _$jscoverage['/dialog.js'].lineData[470] = 0;
  _$jscoverage['/dialog.js'].lineData[471] = 0;
  _$jscoverage['/dialog.js'].lineData[472] = 0;
  _$jscoverage['/dialog.js'].lineData[475] = 0;
  _$jscoverage['/dialog.js'].lineData[476] = 0;
  _$jscoverage['/dialog.js'].lineData[477] = 0;
  _$jscoverage['/dialog.js'].lineData[478] = 0;
  _$jscoverage['/dialog.js'].lineData[479] = 0;
  _$jscoverage['/dialog.js'].lineData[481] = 0;
  _$jscoverage['/dialog.js'].lineData[482] = 0;
  _$jscoverage['/dialog.js'].lineData[487] = 0;
}
if (! _$jscoverage['/dialog.js'].functionData) {
  _$jscoverage['/dialog.js'].functionData = [];
  _$jscoverage['/dialog.js'].functionData[0] = 0;
  _$jscoverage['/dialog.js'].functionData[1] = 0;
  _$jscoverage['/dialog.js'].functionData[2] = 0;
  _$jscoverage['/dialog.js'].functionData[3] = 0;
  _$jscoverage['/dialog.js'].functionData[4] = 0;
  _$jscoverage['/dialog.js'].functionData[5] = 0;
  _$jscoverage['/dialog.js'].functionData[6] = 0;
  _$jscoverage['/dialog.js'].functionData[7] = 0;
  _$jscoverage['/dialog.js'].functionData[8] = 0;
  _$jscoverage['/dialog.js'].functionData[9] = 0;
  _$jscoverage['/dialog.js'].functionData[10] = 0;
  _$jscoverage['/dialog.js'].functionData[11] = 0;
  _$jscoverage['/dialog.js'].functionData[12] = 0;
  _$jscoverage['/dialog.js'].functionData[13] = 0;
  _$jscoverage['/dialog.js'].functionData[14] = 0;
  _$jscoverage['/dialog.js'].functionData[15] = 0;
  _$jscoverage['/dialog.js'].functionData[16] = 0;
  _$jscoverage['/dialog.js'].functionData[17] = 0;
  _$jscoverage['/dialog.js'].functionData[18] = 0;
}
if (! _$jscoverage['/dialog.js'].branchData) {
  _$jscoverage['/dialog.js'].branchData = {};
  _$jscoverage['/dialog.js'].branchData['39'] = [];
  _$jscoverage['/dialog.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['42'] = [];
  _$jscoverage['/dialog.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['53'] = [];
  _$jscoverage['/dialog.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['54'] = [];
  _$jscoverage['/dialog.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['55'] = [];
  _$jscoverage['/dialog.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['113'] = [];
  _$jscoverage['/dialog.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['113'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['114'] = [];
  _$jscoverage['/dialog.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['122'] = [];
  _$jscoverage['/dialog.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['122'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['123'] = [];
  _$jscoverage['/dialog.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['145'] = [];
  _$jscoverage['/dialog.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['160'] = [];
  _$jscoverage['/dialog.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['160'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['160'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['161'] = [];
  _$jscoverage['/dialog.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['164'] = [];
  _$jscoverage['/dialog.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['168'] = [];
  _$jscoverage['/dialog.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['173'] = [];
  _$jscoverage['/dialog.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['183'] = [];
  _$jscoverage['/dialog.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['183'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['196'] = [];
  _$jscoverage['/dialog.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['213'] = [];
  _$jscoverage['/dialog.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['216'] = [];
  _$jscoverage['/dialog.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['219'] = [];
  _$jscoverage['/dialog.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['242'] = [];
  _$jscoverage['/dialog.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['249'] = [];
  _$jscoverage['/dialog.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['250'] = [];
  _$jscoverage['/dialog.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['255'] = [];
  _$jscoverage['/dialog.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['268'] = [];
  _$jscoverage['/dialog.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['270'] = [];
  _$jscoverage['/dialog.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['287'] = [];
  _$jscoverage['/dialog.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['308'] = [];
  _$jscoverage['/dialog.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['311'] = [];
  _$jscoverage['/dialog.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['314'] = [];
  _$jscoverage['/dialog.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['317'] = [];
  _$jscoverage['/dialog.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['317'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['328'] = [];
  _$jscoverage['/dialog.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['364'] = [];
  _$jscoverage['/dialog.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['365'] = [];
  _$jscoverage['/dialog.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['366'] = [];
  _$jscoverage['/dialog.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['366'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['366'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['368'] = [];
  _$jscoverage['/dialog.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['368'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['368'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['372'] = [];
  _$jscoverage['/dialog.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['372'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['372'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['380'] = [];
  _$jscoverage['/dialog.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['382'] = [];
  _$jscoverage['/dialog.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['394'] = [];
  _$jscoverage['/dialog.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['397'] = [];
  _$jscoverage['/dialog.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['400'] = [];
  _$jscoverage['/dialog.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['412'] = [];
  _$jscoverage['/dialog.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['412'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['416'] = [];
  _$jscoverage['/dialog.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['421'] = [];
  _$jscoverage['/dialog.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['426'] = [];
  _$jscoverage['/dialog.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['427'] = [];
  _$jscoverage['/dialog.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['435'] = [];
  _$jscoverage['/dialog.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['436'] = [];
  _$jscoverage['/dialog.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['440'] = [];
  _$jscoverage['/dialog.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['443'] = [];
  _$jscoverage['/dialog.js'].branchData['443'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['456'] = [];
  _$jscoverage['/dialog.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['457'] = [];
  _$jscoverage['/dialog.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['458'] = [];
  _$jscoverage['/dialog.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['478'] = [];
  _$jscoverage['/dialog.js'].branchData['478'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['481'] = [];
  _$jscoverage['/dialog.js'].branchData['481'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['481'][1].init(205, 13, 'self.imgAlign');
function visit70_481_1(result) {
  _$jscoverage['/dialog.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['478'][1].init(108, 18, 'self.loadingCancel');
function visit69_478_1(result) {
  _$jscoverage['/dialog.js'].branchData['478'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['458'][1].init(141, 32, 'link.attr(\'target\') === \'_blank\'');
function visit68_458_1(result) {
  _$jscoverage['/dialog.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['457'][1].init(40, 48, 'link.attr(\'_ke_saved_href\') || link.attr(\'href\')');
function visit67_457_1(result) {
  _$jscoverage['/dialog.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['456'][1].init(2183, 4, 'link');
function visit66_456_1(result) {
  _$jscoverage['/dialog.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['443'][1].init(501, 48, 'self.tab.get(\'bar\').get(\'children\').length === 2');
function visit65_443_1(result) {
  _$jscoverage['/dialog.js'].branchData['443'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['440'][1].init(380, 27, 'defaultMargin === undefined');
function visit64_440_1(result) {
  _$jscoverage['/dialog.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['436'][1].init(212, 9, 'inElement');
function visit63_436_1(result) {
  _$jscoverage['/dialog.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['435'][1].init(136, 54, 'editorSelection && editorSelection.getCommonAncestor()');
function visit62_435_1(result) {
  _$jscoverage['/dialog.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['427'][1].init(633, 45, 'parseInt(selectedEl.style(\'margin\'), 10) || 0');
function visit61_427_1(result) {
  _$jscoverage['/dialog.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['426'][1].init(566, 35, 'selectedEl.style(\'float\') || \'none\'');
function visit60_426_1(result) {
  _$jscoverage['/dialog.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['421'][1].init(380, 1, 'w');
function visit59_421_1(result) {
  _$jscoverage['/dialog.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['416'][1].init(215, 1, 'h');
function visit58_416_1(result) {
  _$jscoverage['/dialog.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['412'][2].init(206, 30, 'self.imageCfg.remote !== false');
function visit57_412_2(result) {
  _$jscoverage['/dialog.js'].branchData['412'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['412'][1].init(192, 44, 'selectedEl && self.imageCfg.remote !== false');
function visit56_412_1(result) {
  _$jscoverage['/dialog.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['400'][1].init(1878, 5, '!skip');
function visit55_400_1(result) {
  _$jscoverage['/dialog.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['397'][1].init(1743, 15, 'self.selectedEl');
function visit54_397_1(result) {
  _$jscoverage['/dialog.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['394'][1].init(1648, 2, 'bs');
function visit53_394_1(result) {
  _$jscoverage['/dialog.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['382'][1].init(65, 16, '!self.selectedEl');
function visit52_382_1(result) {
  _$jscoverage['/dialog.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['380'][1].init(1099, 16, '!skip && linkVal');
function visit51_380_1(result) {
  _$jscoverage['/dialog.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['372'][3].init(285, 23, 'next.nodeName() === \'a\'');
function visit50_372_3(result) {
  _$jscoverage['/dialog.js'].branchData['372'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['372'][2].init(285, 56, '(next.nodeName() === \'a\') && !(next[0].childNodes.length)');
function visit49_372_2(result) {
  _$jscoverage['/dialog.js'].branchData['372'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['372'][1].init(262, 79, '(next = img.next()) && (next.nodeName() === \'a\') && !(next[0].childNodes.length)');
function visit48_372_1(result) {
  _$jscoverage['/dialog.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['368'][3].init(103, 23, 'prev.nodeName() === \'a\'');
function visit47_368_3(result) {
  _$jscoverage['/dialog.js'].branchData['368'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['368'][2].init(103, 56, '(prev.nodeName() === \'a\') && !(prev[0].childNodes.length)');
function visit46_368_2(result) {
  _$jscoverage['/dialog.js'].branchData['368'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['368'][1].init(80, 79, '(prev = img.prev()) && (prev.nodeName() === \'a\') && !(prev[0].childNodes.length)');
function visit45_368_1(result) {
  _$jscoverage['/dialog.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['366'][3].init(123, 21, 'linkTarget !== target');
function visit44_366_3(result) {
  _$jscoverage['/dialog.js'].branchData['366'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['366'][2].init(90, 29, 'linkVal !== link.attr(\'href\')');
function visit43_366_2(result) {
  _$jscoverage['/dialog.js'].branchData['366'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['366'][1].init(90, 54, 'linkVal !== link.attr(\'href\') || linkTarget !== target');
function visit42_366_1(result) {
  _$jscoverage['/dialog.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['365'][1].init(34, 30, 'link.attr(\'target\') || \'_self\'');
function visit41_365_1(result) {
  _$jscoverage['/dialog.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['364'][1].init(407, 4, 'link');
function visit40_364_1(result) {
  _$jscoverage['/dialog.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['328'][1].init(999, 15, 'self.selectedEl');
function visit39_328_1(result) {
  _$jscoverage['/dialog.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['317'][2].init(682, 12, 'margin !== 0');
function visit38_317_2(result) {
  _$jscoverage['/dialog.js'].branchData['317'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['317'][1].init(664, 30, '!isNaN(margin) && margin !== 0');
function visit37_317_1(result) {
  _$jscoverage['/dialog.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['314'][1].init(565, 16, 'align !== \'none\'');
function visit36_314_1(result) {
  _$jscoverage['/dialog.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['311'][1].init(475, 5, 'width');
function visit35_311_1(result) {
  _$jscoverage['/dialog.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['308'][1].init(382, 6, 'height');
function visit34_308_1(result) {
  _$jscoverage['/dialog.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['287'][1].init(1675, 30, 'self.imageCfg.remote === false');
function visit33_287_1(result) {
  _$jscoverage['/dialog.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['270'][1].init(915, 9, 'sizeLimit');
function visit32_270_1(result) {
  _$jscoverage['/dialog.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['268'][1].init(437, 32, 'self.cfg.fileInput || \'Filedata\'');
function visit31_268_1(result) {
  _$jscoverage['/dialog.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['255'][1].init(88, 30, 'self.cfg && self.cfg.sizeLimit');
function visit30_255_1(result) {
  _$jscoverage['/dialog.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['250'][1].init(21, 18, 'self.cfg.extraHTML');
function visit29_250_1(result) {
  _$jscoverage['/dialog.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['249'][1].init(7736, 8, 'self.cfg');
function visit28_249_1(result) {
  _$jscoverage['/dialog.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['242'][1].init(25, 35, '!verifyInputs(content.all(\'input\'))');
function visit27_242_1(result) {
  _$jscoverage['/dialog.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['219'][1].init(505, 10, 'data.error');
function visit26_219_1(result) {
  _$jscoverage['/dialog.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['216'][1].init(373, 5, '!data');
function visit25_216_1(result) {
  _$jscoverage['/dialog.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['213'][1].init(249, 18, 'status === \'abort\'');
function visit24_213_1(result) {
  _$jscoverage['/dialog.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['196'][1].init(1158, 52, 'Editor.Utils.normParams(self.cfg.serverParams) || {}');
function visit23_196_1(result) {
  _$jscoverage['/dialog.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['183'][2].init(728, 25, 'sizeLimit < (size / 1000)');
function visit22_183_2(result) {
  _$jscoverage['/dialog.js'].branchData['183'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['183'][1].init(715, 38, 'sizeLimit && sizeLimit < (size / 1000)');
function visit21_183_1(result) {
  _$jscoverage['/dialog.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['173'][1].init(314, 44, '!self.suffixReg.test(self.imgLocalUrl.val())');
function visit20_173_1(result) {
  _$jscoverage['/dialog.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['168'][1].init(155, 34, 'self.imgLocalUrl.val() === warning');
function visit19_168_1(result) {
  _$jscoverage['/dialog.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['164'][1].init(26, 46, '!verifyInputs(commonSettingTable.all(\'input\'))');
function visit18_164_1(result) {
  _$jscoverage['/dialog.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['161'][1].init(53, 62, 'S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) === 1');
function visit17_161_1(result) {
  _$jscoverage['/dialog.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['160'][3].init(49, 30, 'self.imageCfg.remote === false');
function visit16_160_3(result) {
  _$jscoverage['/dialog.js'].branchData['160'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['160'][2].init(49, 116, 'self.imageCfg.remote === false || S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) === 1');
function visit15_160_2(result) {
  _$jscoverage['/dialog.js'].branchData['160'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['160'][1].init(49, 149, '(self.imageCfg.remote === false || S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) === 1) && self.cfg');
function visit14_160_1(result) {
  _$jscoverage['/dialog.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['145'][1].init(21, 10, 'file.files');
function visit13_145_1(result) {
  _$jscoverage['/dialog.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['123'][1].init(48, 48, 'self.imgRatio[0].disabled || !self.imgRatioValue');
function visit12_123_1(result) {
  _$jscoverage['/dialog.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['122'][2].init(90, 97, '!self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit11_122_2(result) {
  _$jscoverage['/dialog.js'].branchData['122'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['122'][1].init(84, 103, '!v || !self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit10_122_1(result) {
  _$jscoverage['/dialog.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['114'][1].init(48, 48, 'self.imgRatio[0].disabled || !self.imgRatioValue');
function visit9_114_1(result) {
  _$jscoverage['/dialog.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['113'][2].init(91, 97, '!self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit8_113_2(result) {
  _$jscoverage['/dialog.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['113'][1].init(85, 103, '!v || !self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit7_113_1(result) {
  _$jscoverage['/dialog.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['55'][2].init(165, 27, 'self.cfg && self.cfg.suffix');
function visit6_55_2(result) {
  _$jscoverage['/dialog.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['55'][1].init(165, 49, 'self.cfg && self.cfg.suffix || \'png,jpg,jpeg,gif\'');
function visit5_55_1(result) {
  _$jscoverage['/dialog.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['54'][1].init(113, 28, 'self.imageCfg.upload || null');
function visit4_54_1(result) {
  _$jscoverage['/dialog.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['53'][1].init(80, 12, 'config || {}');
function visit3_53_1(result) {
  _$jscoverage['/dialog.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['42'][1].init(130, 41, 'dtd.$block[name] || dtd.$blockLimit[name]');
function visit2_42_1(result) {
  _$jscoverage['/dialog.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['39'][1].init(56, 12, 'name === \'a\'');
function visit1_39_1(result) {
  _$jscoverage['/dialog.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[8]++;
  var Editor = require('editor');
  _$jscoverage['/dialog.js'].lineData[9]++;
  var IO = require('io');
  _$jscoverage['/dialog.js'].lineData[10]++;
  var Dialog4E = require('../dialog');
  _$jscoverage['/dialog.js'].lineData[11]++;
  var Tabs = require('tabs');
  _$jscoverage['/dialog.js'].lineData[12]++;
  var MenuButton = require('../menubutton');
  _$jscoverage['/dialog.js'].lineData[13]++;
  var bodyTpl = require('./dialog/dialog-tpl');
  _$jscoverage['/dialog.js'].lineData[14]++;
  var dtd = Editor.XHTML_DTD, UA = S.UA, Node = require('node'), HTTP_TIP = 'http://', AUTOMATIC_TIP = '\u81ea\u52a8', MARGIN_DEFAULT = 10, IMAGE_DIALOG_BODY_HTML = bodyTpl, IMAGE_DIALOG_FOOT_HTML = '<div style="padding:5px 20px 20px;">' + '<a ' + 'href="javascript:void(\'\u786e\u5b9a\')" ' + 'class="{prefixCls}img-insert {prefixCls}button ks-inline-block" ' + 'style="margin-right:30px;">\u786e\u5b9a</a> ' + '<a  ' + 'href="javascript:void(\'\u53d6\u6d88\')" ' + 'class="{prefixCls}img-cancel {prefixCls}button ks-inline-block">\u53d6\u6d88</a></div>', warning = '\u8bf7\u70b9\u51fb\u6d4f\u89c8\u4e0a\u4f20\u56fe\u7247', valInput = Editor.Utils.valInput;
  _$jscoverage['/dialog.js'].lineData[35]++;
  function findAWithImg(img) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[36]++;
    var ret = img;
    _$jscoverage['/dialog.js'].lineData[37]++;
    while (ret) {
      _$jscoverage['/dialog.js'].lineData[38]++;
      var name = ret.nodeName();
      _$jscoverage['/dialog.js'].lineData[39]++;
      if (visit1_39_1(name === 'a')) {
        _$jscoverage['/dialog.js'].lineData[40]++;
        return ret;
      }
      _$jscoverage['/dialog.js'].lineData[42]++;
      if (visit2_42_1(dtd.$block[name] || dtd.$blockLimit[name])) {
        _$jscoverage['/dialog.js'].lineData[43]++;
        return null;
      }
      _$jscoverage['/dialog.js'].lineData[45]++;
      ret = ret.parent();
    }
    _$jscoverage['/dialog.js'].lineData[47]++;
    return null;
  }
  _$jscoverage['/dialog.js'].lineData[50]++;
  function ImageDialog(editor, config) {
    _$jscoverage['/dialog.js'].functionData[2]++;
    _$jscoverage['/dialog.js'].lineData[51]++;
    var self = this;
    _$jscoverage['/dialog.js'].lineData[52]++;
    self.editor = editor;
    _$jscoverage['/dialog.js'].lineData[53]++;
    self.imageCfg = visit3_53_1(config || {});
    _$jscoverage['/dialog.js'].lineData[54]++;
    self.cfg = visit4_54_1(self.imageCfg.upload || null);
    _$jscoverage['/dialog.js'].lineData[55]++;
    self.suffix = visit5_55_1(visit6_55_2(self.cfg && self.cfg.suffix) || 'png,jpg,jpeg,gif');
    _$jscoverage['/dialog.js'].lineData[57]++;
    self.suffixReg = new RegExp(self.suffix.split(/,/).join('|') + '$', 'i');
    _$jscoverage['/dialog.js'].lineData[58]++;
    self.suffixWarning = '\u53ea\u5141\u8bb8\u540e\u7f00\u540d\u4e3a' + self.suffix + '\u7684\u56fe\u7247';
  }
  _$jscoverage['/dialog.js'].lineData[61]++;
  S.augment(ImageDialog, {
  _prepare: function() {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[63]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[64]++;
  var editor = self.editor, prefixCls = editor.get('prefixCls') + 'editor-';
  _$jscoverage['/dialog.js'].lineData[66]++;
  self.dialog = self.d = new Dialog4E({
  width: 500, 
  headerContent: '\u56fe\u7247', 
  bodyContent: S.substitute(IMAGE_DIALOG_BODY_HTML, {
  prefixCls: prefixCls}), 
  footerContent: S.substitute(IMAGE_DIALOG_FOOT_HTML, {
  prefixCls: prefixCls}), 
  mask: true}).render();
  _$jscoverage['/dialog.js'].lineData[78]++;
  var content = self.d.get('el'), cancel = content.one('.' + prefixCls + 'img-cancel'), ok = content.one('.' + prefixCls + 'img-insert'), verifyInputs = Editor.Utils.verifyInputs, commonSettingTable = content.one('.' + prefixCls + 'img-setting');
  _$jscoverage['/dialog.js'].lineData[83]++;
  self.uploadForm = content.one('.' + prefixCls + 'img-upload-form');
  _$jscoverage['/dialog.js'].lineData[84]++;
  self.imgLocalUrl = content.one('.' + prefixCls + 'img-local-url');
  _$jscoverage['/dialog.js'].lineData[85]++;
  self.tab = new Tabs({
  'srcNode': self.d.get('body').one('.' + prefixCls + 'img-tabs'), 
  prefixCls: prefixCls + 'img-'}).render();
  _$jscoverage['/dialog.js'].lineData[89]++;
  self.imgLocalUrl.val(warning);
  _$jscoverage['/dialog.js'].lineData[90]++;
  self.imgUrl = content.one('.' + prefixCls + 'img-url');
  _$jscoverage['/dialog.js'].lineData[91]++;
  self.imgHeight = content.one('.' + prefixCls + 'img-height');
  _$jscoverage['/dialog.js'].lineData[92]++;
  self.imgWidth = content.one('.' + prefixCls + 'img-width');
  _$jscoverage['/dialog.js'].lineData[93]++;
  self.imgRatio = content.one('.' + prefixCls + 'img-ratio');
  _$jscoverage['/dialog.js'].lineData[94]++;
  self.imgAlign = MenuButton.Select.decorate(content.one('.' + prefixCls + 'img-align'), {
  prefixCls: prefixCls + 'big-', 
  width: 80, 
  menuCfg: {
  prefixCls: prefixCls + '', 
  render: content}});
  _$jscoverage['/dialog.js'].lineData[102]++;
  self.imgMargin = content.one('.' + prefixCls + 'img-margin');
  _$jscoverage['/dialog.js'].lineData[103]++;
  self.imgLink = content.one('.' + prefixCls + 'img-link');
  _$jscoverage['/dialog.js'].lineData[104]++;
  self.imgLinkBlank = content.one('.' + prefixCls + 'img-link-blank');
  _$jscoverage['/dialog.js'].lineData[105]++;
  var placeholder = Editor.Utils.placeholder;
  _$jscoverage['/dialog.js'].lineData[106]++;
  placeholder(self.imgUrl, HTTP_TIP);
  _$jscoverage['/dialog.js'].lineData[107]++;
  placeholder(self.imgHeight, AUTOMATIC_TIP);
  _$jscoverage['/dialog.js'].lineData[108]++;
  placeholder(self.imgWidth, AUTOMATIC_TIP);
  _$jscoverage['/dialog.js'].lineData[109]++;
  placeholder(self.imgLink, 'http://');
  _$jscoverage['/dialog.js'].lineData[111]++;
  self.imgHeight.on('keyup', function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[112]++;
  var v = parseInt(valInput(self.imgHeight), 10);
  _$jscoverage['/dialog.js'].lineData[113]++;
  if (visit7_113_1(!v || visit8_113_2(!self.imgRatio[0].checked || visit9_114_1(self.imgRatio[0].disabled || !self.imgRatioValue)))) {
    _$jscoverage['/dialog.js'].lineData[115]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[117]++;
  valInput(self.imgWidth, Math.floor(v * self.imgRatioValue));
});
  _$jscoverage['/dialog.js'].lineData[120]++;
  self.imgWidth.on('keyup', function() {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[121]++;
  var v = parseInt(valInput(self.imgWidth), 10);
  _$jscoverage['/dialog.js'].lineData[122]++;
  if (visit10_122_1(!v || visit11_122_2(!self.imgRatio[0].checked || visit12_123_1(self.imgRatio[0].disabled || !self.imgRatioValue)))) {
    _$jscoverage['/dialog.js'].lineData[124]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[126]++;
  valInput(self.imgHeight, Math.floor(v / self.imgRatioValue));
});
  _$jscoverage['/dialog.js'].lineData[129]++;
  cancel.on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[130]++;
  self.d.hide();
  _$jscoverage['/dialog.js'].lineData[131]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[134]++;
  var loadingCancel = new Node('<a class="' + prefixCls + 'button ks-inline-block" ' + 'style="position:absolute;' + 'z-index:' + Editor.baseZIndex(Editor.ZIndexManager.LOADING_CANCEL) + ';' + 'left:-9999px;' + 'top:-9999px;' + '">\u53d6\u6d88\u4e0a\u4f20</a>').appendTo(document.body, undefined);
  _$jscoverage['/dialog.js'].lineData[142]++;
  self.loadingCancel = loadingCancel;
  _$jscoverage['/dialog.js'].lineData[144]++;
  function getFileSize(file) {
    _$jscoverage['/dialog.js'].functionData[7]++;
    _$jscoverage['/dialog.js'].lineData[145]++;
    if (visit13_145_1(file.files)) {
      _$jscoverage['/dialog.js'].lineData[146]++;
      return file.files[0].size;
    }
    _$jscoverage['/dialog.js'].lineData[155]++;
    return 0;
  }
  _$jscoverage['/dialog.js'].lineData[158]++;
  ok.on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[159]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[160]++;
  if (visit14_160_1((visit15_160_2(visit16_160_3(self.imageCfg.remote === false) || visit17_161_1(S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) === 1))) && self.cfg)) {
    _$jscoverage['/dialog.js'].lineData[164]++;
    if (visit18_164_1(!verifyInputs(commonSettingTable.all('input')))) {
      _$jscoverage['/dialog.js'].lineData[165]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[168]++;
    if (visit19_168_1(self.imgLocalUrl.val() === warning)) {
      _$jscoverage['/dialog.js'].lineData[169]++;
      alert('\u8bf7\u5148\u9009\u62e9\u6587\u4ef6!');
      _$jscoverage['/dialog.js'].lineData[170]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[173]++;
    if (visit20_173_1(!self.suffixReg.test(self.imgLocalUrl.val()))) {
      _$jscoverage['/dialog.js'].lineData[174]++;
      alert(self.suffixWarning);
      _$jscoverage['/dialog.js'].lineData[176]++;
      self.uploadForm[0].reset();
      _$jscoverage['/dialog.js'].lineData[177]++;
      self.imgLocalUrl.val(warning);
      _$jscoverage['/dialog.js'].lineData[178]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[181]++;
    var size = (getFileSize(self.fileInput[0]));
    _$jscoverage['/dialog.js'].lineData[183]++;
    if (visit21_183_1(sizeLimit && visit22_183_2(sizeLimit < (size / 1000)))) {
      _$jscoverage['/dialog.js'].lineData[184]++;
      alert('\u4e0a\u4f20\u56fe\u7247\u6700\u5927\uff1a' + sizeLimit / 1000 + 'M');
      _$jscoverage['/dialog.js'].lineData[185]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[188]++;
    self.d.loading();
    _$jscoverage['/dialog.js'].lineData[191]++;
    loadingCancel.on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[9]++;
  _$jscoverage['/dialog.js'].lineData[192]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[193]++;
  uploadIO.abort();
});
    _$jscoverage['/dialog.js'].lineData[196]++;
    var serverParams = visit23_196_1(Editor.Utils.normParams(self.cfg.serverParams) || {});
    _$jscoverage['/dialog.js'].lineData[199]++;
    serverParams['document-domain'] = document.domain;
    _$jscoverage['/dialog.js'].lineData[201]++;
    var uploadIO = IO({
  data: serverParams, 
  url: self.cfg.serverUrl, 
  form: self.uploadForm[0], 
  dataType: 'json', 
  type: 'post', 
  complete: function(data, status) {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[208]++;
  loadingCancel.css({
  left: -9999, 
  top: -9999});
  _$jscoverage['/dialog.js'].lineData[212]++;
  self.d.unloading();
  _$jscoverage['/dialog.js'].lineData[213]++;
  if (visit24_213_1(status === 'abort')) {
    _$jscoverage['/dialog.js'].lineData[214]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[216]++;
  if (visit25_216_1(!data)) {
    _$jscoverage['/dialog.js'].lineData[217]++;
    data = {
  error: '\u670d\u52a1\u5668\u51fa\u9519\uff0c\u8bf7\u91cd\u8bd5'};
  }
  _$jscoverage['/dialog.js'].lineData[219]++;
  if (visit26_219_1(data.error)) {
    _$jscoverage['/dialog.js'].lineData[220]++;
    alert(data.error);
    _$jscoverage['/dialog.js'].lineData[221]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[223]++;
  valInput(self.imgUrl, data.imgUrl);
  _$jscoverage['/dialog.js'].lineData[226]++;
  new Image().src = data.imgUrl;
  _$jscoverage['/dialog.js'].lineData[227]++;
  self._insert();
}});
    _$jscoverage['/dialog.js'].lineData[231]++;
    var loadingMaskEl = self.d.get('el'), offset = loadingMaskEl.offset(), width = loadingMaskEl[0].offsetWidth, height = loadingMaskEl[0].offsetHeight;
    _$jscoverage['/dialog.js'].lineData[236]++;
    loadingCancel.css({
  left: (offset.left + width / 2.5), 
  top: (offset.top + height / 1.5)});
  } else {
    _$jscoverage['/dialog.js'].lineData[242]++;
    if (visit27_242_1(!verifyInputs(content.all('input')))) {
      _$jscoverage['/dialog.js'].lineData[243]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[245]++;
    self._insert();
  }
});
  _$jscoverage['/dialog.js'].lineData[249]++;
  if (visit28_249_1(self.cfg)) {
    _$jscoverage['/dialog.js'].lineData[250]++;
    if (visit29_250_1(self.cfg.extraHTML)) {
      _$jscoverage['/dialog.js'].lineData[252]++;
      content.one('.' + prefixCls + 'img-up-extraHTML').html(self.cfg.extraHTML);
    }
    _$jscoverage['/dialog.js'].lineData[254]++;
    var imageUp = content.one('.' + prefixCls + 'image-up'), sizeLimit = visit30_255_1(self.cfg && self.cfg.sizeLimit);
    _$jscoverage['/dialog.js'].lineData[257]++;
    self.fileInput = new Node('<input ' + 'type="file" ' + 'style="position:absolute;' + 'cursor:pointer;' + 'left:' + (UA.ie ? '360' : (UA.chrome ? '319' : '369')) + 'px;' + 'z-index:2;' + 'top:0px;' + 'height:26px;" ' + 'size="1" ' + 'name="' + (visit31_268_1(self.cfg.fileInput || 'Filedata')) + '"/>').insertAfter(self.imgLocalUrl);
    _$jscoverage['/dialog.js'].lineData[270]++;
    if (visit32_270_1(sizeLimit)) {
      _$jscoverage['/dialog.js'].lineData[271]++;
      warning = '\u5355\u5f20\u56fe\u7247\u5bb9\u91cf\u4e0d\u8d85\u8fc7 ' + (sizeLimit / 1000) + ' M';
    }
    _$jscoverage['/dialog.js'].lineData[273]++;
    self.imgLocalUrl.val(warning);
    _$jscoverage['/dialog.js'].lineData[274]++;
    self.fileInput.css('opacity', 0);
    _$jscoverage['/dialog.js'].lineData[275]++;
    self.fileInput.on('mouseenter', function() {
  _$jscoverage['/dialog.js'].functionData[11]++;
  _$jscoverage['/dialog.js'].lineData[276]++;
  imageUp.addClass('' + prefixCls + 'button-hover');
});
    _$jscoverage['/dialog.js'].lineData[278]++;
    self.fileInput.on('mouseleave', function() {
  _$jscoverage['/dialog.js'].functionData[12]++;
  _$jscoverage['/dialog.js'].lineData[279]++;
  imageUp.removeClass('' + prefixCls + 'button-hover');
});
    _$jscoverage['/dialog.js'].lineData[281]++;
    self.fileInput.on('change', function() {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[282]++;
  var file = self.fileInput.val();
  _$jscoverage['/dialog.js'].lineData[284]++;
  self.imgLocalUrl.val(file.replace(/.+[\/\\]/, ''));
});
    _$jscoverage['/dialog.js'].lineData[287]++;
    if (visit33_287_1(self.imageCfg.remote === false)) {
      _$jscoverage['/dialog.js'].lineData[288]++;
      self.tab.removeItemAt(0, 1);
    }
  } else {
    _$jscoverage['/dialog.js'].lineData[292]++;
    self.tab.removeItemAt(1, 1);
  }
  _$jscoverage['/dialog.js'].lineData[295]++;
  self._prepare = S.noop;
}, 
  _insert: function() {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[299]++;
  var self = this, url = valInput(self.imgUrl), img, height = parseInt(valInput(self.imgHeight), 10), width = parseInt(valInput(self.imgWidth), 10), align = self.imgAlign.get('value'), margin = parseInt(self.imgMargin.val(), 10), style = '';
  _$jscoverage['/dialog.js'].lineData[308]++;
  if (visit34_308_1(height)) {
    _$jscoverage['/dialog.js'].lineData[309]++;
    style += 'height:' + height + 'px;';
  }
  _$jscoverage['/dialog.js'].lineData[311]++;
  if (visit35_311_1(width)) {
    _$jscoverage['/dialog.js'].lineData[312]++;
    style += 'width:' + width + 'px;';
  }
  _$jscoverage['/dialog.js'].lineData[314]++;
  if (visit36_314_1(align !== 'none')) {
    _$jscoverage['/dialog.js'].lineData[315]++;
    style += 'float:' + align + ';';
  }
  _$jscoverage['/dialog.js'].lineData[317]++;
  if (visit37_317_1(!isNaN(margin) && visit38_317_2(margin !== 0))) {
    _$jscoverage['/dialog.js'].lineData[318]++;
    style += 'margin:' + margin + 'px;';
  }
  _$jscoverage['/dialog.js'].lineData[321]++;
  self.d.hide();
  _$jscoverage['/dialog.js'].lineData[328]++;
  if (visit39_328_1(self.selectedEl)) {
    _$jscoverage['/dialog.js'].lineData[329]++;
    img = self.selectedEl;
    _$jscoverage['/dialog.js'].lineData[330]++;
    self.editor.execCommand('save');
    _$jscoverage['/dialog.js'].lineData[331]++;
    self.selectedEl.attr({
  'src': url, 
  '_ke_saved_src': url, 
  'style': style});
  } else {
    _$jscoverage['/dialog.js'].lineData[338]++;
    img = new Node('<img ' + (style ? ('style="' + style + '"') : '') + ' src="' + url + '" ' + '_ke_saved_src="' + url + '" alt="" />', null, self.editor.get('document')[0]);
    _$jscoverage['/dialog.js'].lineData[348]++;
    self.editor.insertElement(img);
  }
  _$jscoverage['/dialog.js'].lineData[353]++;
  setTimeout(function() {
  _$jscoverage['/dialog.js'].functionData[15]++;
  _$jscoverage['/dialog.js'].lineData[354]++;
  var link = findAWithImg(img), linkVal = S.trim(valInput(self.imgLink)), sel = self.editor.getSelection(), target = self.imgLinkBlank.attr('checked') ? '_blank' : '_self', linkTarget, skip = 0, prev, next, bs;
  _$jscoverage['/dialog.js'].lineData[364]++;
  if (visit40_364_1(link)) {
    _$jscoverage['/dialog.js'].lineData[365]++;
    linkTarget = visit41_365_1(link.attr('target') || '_self');
    _$jscoverage['/dialog.js'].lineData[366]++;
    if (visit42_366_1(visit43_366_2(linkVal !== link.attr('href')) || visit44_366_3(linkTarget !== target))) {
      _$jscoverage['/dialog.js'].lineData[367]++;
      img._4eBreakParent(link);
      _$jscoverage['/dialog.js'].lineData[368]++;
      if (visit45_368_1((prev = img.prev()) && visit46_368_2((visit47_368_3(prev.nodeName() === 'a')) && !(prev[0].childNodes.length)))) {
        _$jscoverage['/dialog.js'].lineData[369]++;
        prev.remove();
      }
      _$jscoverage['/dialog.js'].lineData[372]++;
      if (visit48_372_1((next = img.next()) && visit49_372_2((visit50_372_3(next.nodeName() === 'a')) && !(next[0].childNodes.length)))) {
        _$jscoverage['/dialog.js'].lineData[373]++;
        next.remove();
      }
    } else {
      _$jscoverage['/dialog.js'].lineData[376]++;
      skip = 1;
    }
  }
  _$jscoverage['/dialog.js'].lineData[380]++;
  if (visit51_380_1(!skip && linkVal)) {
    _$jscoverage['/dialog.js'].lineData[382]++;
    if (visit52_382_1(!self.selectedEl)) {
      _$jscoverage['/dialog.js'].lineData[383]++;
      bs = sel.createBookmarks();
    }
    _$jscoverage['/dialog.js'].lineData[385]++;
    link = new Node('<a></a>');
    _$jscoverage['/dialog.js'].lineData[388]++;
    link.attr('_ke_saved_href', linkVal).attr('href', linkVal).attr('target', target);
    _$jscoverage['/dialog.js'].lineData[389]++;
    var t = img[0];
    _$jscoverage['/dialog.js'].lineData[390]++;
    t.parentNode.replaceChild(link[0], t);
    _$jscoverage['/dialog.js'].lineData[391]++;
    link.append(t);
  }
  _$jscoverage['/dialog.js'].lineData[394]++;
  if (visit53_394_1(bs)) {
    _$jscoverage['/dialog.js'].lineData[395]++;
    sel.selectBookmarks(bs);
  } else {
    _$jscoverage['/dialog.js'].lineData[397]++;
    if (visit54_397_1(self.selectedEl)) {
      _$jscoverage['/dialog.js'].lineData[398]++;
      self.editor.getSelection().selectElement(self.selectedEl);
    }
  }
  _$jscoverage['/dialog.js'].lineData[400]++;
  if (visit55_400_1(!skip)) {
    _$jscoverage['/dialog.js'].lineData[401]++;
    self.editor.execCommand('save');
  }
}, 100);
}, 
  _update: function(selectedEl) {
  _$jscoverage['/dialog.js'].functionData[16]++;
  _$jscoverage['/dialog.js'].lineData[407]++;
  var self = this, active = 0, link, resetInput = Editor.Utils.resetInput;
  _$jscoverage['/dialog.js'].lineData[411]++;
  self.selectedEl = selectedEl;
  _$jscoverage['/dialog.js'].lineData[412]++;
  if (visit56_412_1(selectedEl && visit57_412_2(self.imageCfg.remote !== false))) {
    _$jscoverage['/dialog.js'].lineData[413]++;
    valInput(self.imgUrl, selectedEl.attr('src'));
    _$jscoverage['/dialog.js'].lineData[414]++;
    var w = parseInt(selectedEl.style('width'), 10), h = parseInt(selectedEl.style('height'), 10);
    _$jscoverage['/dialog.js'].lineData[416]++;
    if (visit58_416_1(h)) {
      _$jscoverage['/dialog.js'].lineData[417]++;
      valInput(self.imgHeight, h);
    } else {
      _$jscoverage['/dialog.js'].lineData[419]++;
      resetInput(self.imgHeight);
    }
    _$jscoverage['/dialog.js'].lineData[421]++;
    if (visit59_421_1(w)) {
      _$jscoverage['/dialog.js'].lineData[422]++;
      valInput(self.imgWidth, w);
    } else {
      _$jscoverage['/dialog.js'].lineData[424]++;
      resetInput(self.imgWidth);
    }
    _$jscoverage['/dialog.js'].lineData[426]++;
    self.imgAlign.set('value', visit60_426_1(selectedEl.style('float') || 'none'));
    _$jscoverage['/dialog.js'].lineData[427]++;
    var margin = visit61_427_1(parseInt(selectedEl.style('margin'), 10) || 0);
    _$jscoverage['/dialog.js'].lineData[428]++;
    self.imgMargin.val(margin);
    _$jscoverage['/dialog.js'].lineData[429]++;
    self.imgRatio[0].disabled = false;
    _$jscoverage['/dialog.js'].lineData[430]++;
    self.imgRatioValue = w / h;
    _$jscoverage['/dialog.js'].lineData[431]++;
    link = findAWithImg(selectedEl);
  } else {
    _$jscoverage['/dialog.js'].lineData[433]++;
    var editor = self.editor;
    _$jscoverage['/dialog.js'].lineData[434]++;
    var editorSelection = editor.getSelection();
    _$jscoverage['/dialog.js'].lineData[435]++;
    var inElement = visit62_435_1(editorSelection && editorSelection.getCommonAncestor());
    _$jscoverage['/dialog.js'].lineData[436]++;
    if (visit63_436_1(inElement)) {
      _$jscoverage['/dialog.js'].lineData[437]++;
      link = findAWithImg(inElement);
    }
    _$jscoverage['/dialog.js'].lineData[439]++;
    var defaultMargin = self.imageCfg.defaultMargin;
    _$jscoverage['/dialog.js'].lineData[440]++;
    if (visit64_440_1(defaultMargin === undefined)) {
      _$jscoverage['/dialog.js'].lineData[441]++;
      defaultMargin = MARGIN_DEFAULT;
    }
    _$jscoverage['/dialog.js'].lineData[443]++;
    if (visit65_443_1(self.tab.get('bar').get('children').length === 2)) {
      _$jscoverage['/dialog.js'].lineData[444]++;
      active = 1;
    }
    _$jscoverage['/dialog.js'].lineData[446]++;
    self.imgLinkBlank.attr('checked', true);
    _$jscoverage['/dialog.js'].lineData[447]++;
    resetInput(self.imgUrl);
    _$jscoverage['/dialog.js'].lineData[448]++;
    resetInput(self.imgLink);
    _$jscoverage['/dialog.js'].lineData[449]++;
    resetInput(self.imgHeight);
    _$jscoverage['/dialog.js'].lineData[450]++;
    resetInput(self.imgWidth);
    _$jscoverage['/dialog.js'].lineData[451]++;
    self.imgAlign.set('value', 'none');
    _$jscoverage['/dialog.js'].lineData[452]++;
    self.imgMargin.val(defaultMargin);
    _$jscoverage['/dialog.js'].lineData[453]++;
    self.imgRatio[0].disabled = true;
    _$jscoverage['/dialog.js'].lineData[454]++;
    self.imgRatioValue = null;
  }
  _$jscoverage['/dialog.js'].lineData[456]++;
  if (visit66_456_1(link)) {
    _$jscoverage['/dialog.js'].lineData[457]++;
    valInput(self.imgLink, visit67_457_1(link.attr('_ke_saved_href') || link.attr('href')));
    _$jscoverage['/dialog.js'].lineData[458]++;
    self.imgLinkBlank.attr('checked', visit68_458_1(link.attr('target') === '_blank'));
  } else {
    _$jscoverage['/dialog.js'].lineData[460]++;
    resetInput(self.imgLink);
    _$jscoverage['/dialog.js'].lineData[461]++;
    self.imgLinkBlank.attr('checked', true);
  }
  _$jscoverage['/dialog.js'].lineData[463]++;
  self.uploadForm[0].reset();
  _$jscoverage['/dialog.js'].lineData[464]++;
  self.imgLocalUrl.val(warning);
  _$jscoverage['/dialog.js'].lineData[465]++;
  var tab = self.tab;
  _$jscoverage['/dialog.js'].lineData[466]++;
  tab.setSelectedTab(tab.getTabAt(active));
}, 
  show: function(_selectedEl) {
  _$jscoverage['/dialog.js'].functionData[17]++;
  _$jscoverage['/dialog.js'].lineData[469]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[470]++;
  self._prepare();
  _$jscoverage['/dialog.js'].lineData[471]++;
  self._update(_selectedEl);
  _$jscoverage['/dialog.js'].lineData[472]++;
  self.d.show();
}, 
  destroy: function() {
  _$jscoverage['/dialog.js'].functionData[18]++;
  _$jscoverage['/dialog.js'].lineData[475]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[476]++;
  self.d.destroy();
  _$jscoverage['/dialog.js'].lineData[477]++;
  self.tab.destroy();
  _$jscoverage['/dialog.js'].lineData[478]++;
  if (visit69_478_1(self.loadingCancel)) {
    _$jscoverage['/dialog.js'].lineData[479]++;
    self.loadingCancel.remove();
  }
  _$jscoverage['/dialog.js'].lineData[481]++;
  if (visit70_481_1(self.imgAlign)) {
    _$jscoverage['/dialog.js'].lineData[482]++;
    self.imgAlign.destroy();
  }
}});
  _$jscoverage['/dialog.js'].lineData[487]++;
  return ImageDialog;
});
