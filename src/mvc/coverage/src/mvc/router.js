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
if (! _$jscoverage['/mvc/router.js']) {
  _$jscoverage['/mvc/router.js'] = {};
  _$jscoverage['/mvc/router.js'].lineData = [];
  _$jscoverage['/mvc/router.js'].lineData[6] = 0;
  _$jscoverage['/mvc/router.js'].lineData[7] = 0;
  _$jscoverage['/mvc/router.js'].lineData[21] = 0;
  _$jscoverage['/mvc/router.js'].lineData[22] = 0;
  _$jscoverage['/mvc/router.js'].lineData[23] = 0;
  _$jscoverage['/mvc/router.js'].lineData[24] = 0;
  _$jscoverage['/mvc/router.js'].lineData[26] = 0;
  _$jscoverage['/mvc/router.js'].lineData[27] = 0;
  _$jscoverage['/mvc/router.js'].lineData[28] = 0;
  _$jscoverage['/mvc/router.js'].lineData[29] = 0;
  _$jscoverage['/mvc/router.js'].lineData[32] = 0;
  _$jscoverage['/mvc/router.js'].lineData[35] = 0;
  _$jscoverage['/mvc/router.js'].lineData[45] = 0;
  _$jscoverage['/mvc/router.js'].lineData[50] = 0;
  _$jscoverage['/mvc/router.js'].lineData[51] = 0;
  _$jscoverage['/mvc/router.js'].lineData[52] = 0;
  _$jscoverage['/mvc/router.js'].lineData[53] = 0;
  _$jscoverage['/mvc/router.js'].lineData[54] = 0;
  _$jscoverage['/mvc/router.js'].lineData[55] = 0;
  _$jscoverage['/mvc/router.js'].lineData[57] = 0;
  _$jscoverage['/mvc/router.js'].lineData[61] = 0;
  _$jscoverage['/mvc/router.js'].lineData[62] = 0;
  _$jscoverage['/mvc/router.js'].lineData[65] = 0;
  _$jscoverage['/mvc/router.js'].lineData[66] = 0;
  _$jscoverage['/mvc/router.js'].lineData[69] = 0;
  _$jscoverage['/mvc/router.js'].lineData[70] = 0;
  _$jscoverage['/mvc/router.js'].lineData[71] = 0;
  _$jscoverage['/mvc/router.js'].lineData[73] = 0;
  _$jscoverage['/mvc/router.js'].lineData[76] = 0;
  _$jscoverage['/mvc/router.js'].lineData[77] = 0;
  _$jscoverage['/mvc/router.js'].lineData[78] = 0;
  _$jscoverage['/mvc/router.js'].lineData[80] = 0;
  _$jscoverage['/mvc/router.js'].lineData[83] = 0;
  _$jscoverage['/mvc/router.js'].lineData[84] = 0;
  _$jscoverage['/mvc/router.js'].lineData[87] = 0;
  _$jscoverage['/mvc/router.js'].lineData[88] = 0;
  _$jscoverage['/mvc/router.js'].lineData[89] = 0;
  _$jscoverage['/mvc/router.js'].lineData[91] = 0;
  _$jscoverage['/mvc/router.js'].lineData[95] = 0;
  _$jscoverage['/mvc/router.js'].lineData[96] = 0;
  _$jscoverage['/mvc/router.js'].lineData[97] = 0;
  _$jscoverage['/mvc/router.js'].lineData[98] = 0;
  _$jscoverage['/mvc/router.js'].lineData[103] = 0;
  _$jscoverage['/mvc/router.js'].lineData[104] = 0;
  _$jscoverage['/mvc/router.js'].lineData[110] = 0;
  _$jscoverage['/mvc/router.js'].lineData[111] = 0;
  _$jscoverage['/mvc/router.js'].lineData[123] = 0;
  _$jscoverage['/mvc/router.js'].lineData[124] = 0;
  _$jscoverage['/mvc/router.js'].lineData[125] = 0;
  _$jscoverage['/mvc/router.js'].lineData[128] = 0;
  _$jscoverage['/mvc/router.js'].lineData[129] = 0;
  _$jscoverage['/mvc/router.js'].lineData[132] = 0;
  _$jscoverage['/mvc/router.js'].lineData[133] = 0;
  _$jscoverage['/mvc/router.js'].lineData[140] = 0;
  _$jscoverage['/mvc/router.js'].lineData[142] = 0;
  _$jscoverage['/mvc/router.js'].lineData[144] = 0;
  _$jscoverage['/mvc/router.js'].lineData[145] = 0;
  _$jscoverage['/mvc/router.js'].lineData[146] = 0;
  _$jscoverage['/mvc/router.js'].lineData[147] = 0;
  _$jscoverage['/mvc/router.js'].lineData[148] = 0;
  _$jscoverage['/mvc/router.js'].lineData[150] = 0;
  _$jscoverage['/mvc/router.js'].lineData[154] = 0;
  _$jscoverage['/mvc/router.js'].lineData[158] = 0;
  _$jscoverage['/mvc/router.js'].lineData[159] = 0;
  _$jscoverage['/mvc/router.js'].lineData[160] = 0;
  _$jscoverage['/mvc/router.js'].lineData[161] = 0;
  _$jscoverage['/mvc/router.js'].lineData[162] = 0;
  _$jscoverage['/mvc/router.js'].lineData[163] = 0;
  _$jscoverage['/mvc/router.js'].lineData[164] = 0;
  _$jscoverage['/mvc/router.js'].lineData[165] = 0;
  _$jscoverage['/mvc/router.js'].lineData[169] = 0;
  _$jscoverage['/mvc/router.js'].lineData[170] = 0;
  _$jscoverage['/mvc/router.js'].lineData[171] = 0;
  _$jscoverage['/mvc/router.js'].lineData[172] = 0;
  _$jscoverage['/mvc/router.js'].lineData[174] = 0;
  _$jscoverage['/mvc/router.js'].lineData[176] = 0;
  _$jscoverage['/mvc/router.js'].lineData[180] = 0;
  _$jscoverage['/mvc/router.js'].lineData[181] = 0;
  _$jscoverage['/mvc/router.js'].lineData[184] = 0;
  _$jscoverage['/mvc/router.js'].lineData[190] = 0;
  _$jscoverage['/mvc/router.js'].lineData[191] = 0;
  _$jscoverage['/mvc/router.js'].lineData[192] = 0;
  _$jscoverage['/mvc/router.js'].lineData[193] = 0;
  _$jscoverage['/mvc/router.js'].lineData[198] = 0;
  _$jscoverage['/mvc/router.js'].lineData[199] = 0;
  _$jscoverage['/mvc/router.js'].lineData[206] = 0;
  _$jscoverage['/mvc/router.js'].lineData[207] = 0;
  _$jscoverage['/mvc/router.js'].lineData[208] = 0;
  _$jscoverage['/mvc/router.js'].lineData[211] = 0;
  _$jscoverage['/mvc/router.js'].lineData[215] = 0;
  _$jscoverage['/mvc/router.js'].lineData[216] = 0;
  _$jscoverage['/mvc/router.js'].lineData[218] = 0;
  _$jscoverage['/mvc/router.js'].lineData[222] = 0;
  _$jscoverage['/mvc/router.js'].lineData[223] = 0;
  _$jscoverage['/mvc/router.js'].lineData[224] = 0;
  _$jscoverage['/mvc/router.js'].lineData[228] = 0;
  _$jscoverage['/mvc/router.js'].lineData[235] = 0;
  _$jscoverage['/mvc/router.js'].lineData[236] = 0;
  _$jscoverage['/mvc/router.js'].lineData[246] = 0;
  _$jscoverage['/mvc/router.js'].lineData[247] = 0;
  _$jscoverage['/mvc/router.js'].lineData[250] = 0;
  _$jscoverage['/mvc/router.js'].lineData[252] = 0;
  _$jscoverage['/mvc/router.js'].lineData[254] = 0;
  _$jscoverage['/mvc/router.js'].lineData[255] = 0;
  _$jscoverage['/mvc/router.js'].lineData[257] = 0;
  _$jscoverage['/mvc/router.js'].lineData[258] = 0;
  _$jscoverage['/mvc/router.js'].lineData[261] = 0;
  _$jscoverage['/mvc/router.js'].lineData[262] = 0;
  _$jscoverage['/mvc/router.js'].lineData[264] = 0;
  _$jscoverage['/mvc/router.js'].lineData[267] = 0;
  _$jscoverage['/mvc/router.js'].lineData[275] = 0;
  _$jscoverage['/mvc/router.js'].lineData[285] = 0;
  _$jscoverage['/mvc/router.js'].lineData[286] = 0;
  _$jscoverage['/mvc/router.js'].lineData[287] = 0;
  _$jscoverage['/mvc/router.js'].lineData[288] = 0;
  _$jscoverage['/mvc/router.js'].lineData[289] = 0;
  _$jscoverage['/mvc/router.js'].lineData[291] = 0;
  _$jscoverage['/mvc/router.js'].lineData[294] = 0;
  _$jscoverage['/mvc/router.js'].lineData[295] = 0;
  _$jscoverage['/mvc/router.js'].lineData[296] = 0;
  _$jscoverage['/mvc/router.js'].lineData[297] = 0;
  _$jscoverage['/mvc/router.js'].lineData[300] = 0;
  _$jscoverage['/mvc/router.js'].lineData[307] = 0;
  _$jscoverage['/mvc/router.js'].lineData[309] = 0;
  _$jscoverage['/mvc/router.js'].lineData[310] = 0;
  _$jscoverage['/mvc/router.js'].lineData[311] = 0;
  _$jscoverage['/mvc/router.js'].lineData[312] = 0;
  _$jscoverage['/mvc/router.js'].lineData[329] = 0;
  _$jscoverage['/mvc/router.js'].lineData[330] = 0;
  _$jscoverage['/mvc/router.js'].lineData[331] = 0;
  _$jscoverage['/mvc/router.js'].lineData[365] = 0;
  _$jscoverage['/mvc/router.js'].lineData[367] = 0;
  _$jscoverage['/mvc/router.js'].lineData[368] = 0;
  _$jscoverage['/mvc/router.js'].lineData[369] = 0;
  _$jscoverage['/mvc/router.js'].lineData[370] = 0;
  _$jscoverage['/mvc/router.js'].lineData[371] = 0;
  _$jscoverage['/mvc/router.js'].lineData[372] = 0;
  _$jscoverage['/mvc/router.js'].lineData[373] = 0;
  _$jscoverage['/mvc/router.js'].lineData[375] = 0;
  _$jscoverage['/mvc/router.js'].lineData[377] = 0;
  _$jscoverage['/mvc/router.js'].lineData[378] = 0;
  _$jscoverage['/mvc/router.js'].lineData[380] = 0;
  _$jscoverage['/mvc/router.js'].lineData[382] = 0;
  _$jscoverage['/mvc/router.js'].lineData[393] = 0;
  _$jscoverage['/mvc/router.js'].lineData[394] = 0;
  _$jscoverage['/mvc/router.js'].lineData[407] = 0;
  _$jscoverage['/mvc/router.js'].lineData[408] = 0;
  _$jscoverage['/mvc/router.js'].lineData[409] = 0;
  _$jscoverage['/mvc/router.js'].lineData[410] = 0;
  _$jscoverage['/mvc/router.js'].lineData[411] = 0;
  _$jscoverage['/mvc/router.js'].lineData[416] = 0;
  _$jscoverage['/mvc/router.js'].lineData[418] = 0;
  _$jscoverage['/mvc/router.js'].lineData[419] = 0;
  _$jscoverage['/mvc/router.js'].lineData[421] = 0;
  _$jscoverage['/mvc/router.js'].lineData[424] = 0;
  _$jscoverage['/mvc/router.js'].lineData[427] = 0;
  _$jscoverage['/mvc/router.js'].lineData[428] = 0;
  _$jscoverage['/mvc/router.js'].lineData[441] = 0;
  _$jscoverage['/mvc/router.js'].lineData[443] = 0;
  _$jscoverage['/mvc/router.js'].lineData[444] = 0;
  _$jscoverage['/mvc/router.js'].lineData[448] = 0;
  _$jscoverage['/mvc/router.js'].lineData[450] = 0;
  _$jscoverage['/mvc/router.js'].lineData[456] = 0;
  _$jscoverage['/mvc/router.js'].lineData[457] = 0;
  _$jscoverage['/mvc/router.js'].lineData[459] = 0;
  _$jscoverage['/mvc/router.js'].lineData[461] = 0;
  _$jscoverage['/mvc/router.js'].lineData[467] = 0;
  _$jscoverage['/mvc/router.js'].lineData[468] = 0;
  _$jscoverage['/mvc/router.js'].lineData[470] = 0;
  _$jscoverage['/mvc/router.js'].lineData[471] = 0;
  _$jscoverage['/mvc/router.js'].lineData[473] = 0;
  _$jscoverage['/mvc/router.js'].lineData[482] = 0;
  _$jscoverage['/mvc/router.js'].lineData[483] = 0;
  _$jscoverage['/mvc/router.js'].lineData[484] = 0;
  _$jscoverage['/mvc/router.js'].lineData[490] = 0;
  _$jscoverage['/mvc/router.js'].lineData[492] = 0;
  _$jscoverage['/mvc/router.js'].lineData[493] = 0;
  _$jscoverage['/mvc/router.js'].lineData[497] = 0;
  _$jscoverage['/mvc/router.js'].lineData[499] = 0;
  _$jscoverage['/mvc/router.js'].lineData[505] = 0;
  _$jscoverage['/mvc/router.js'].lineData[506] = 0;
  _$jscoverage['/mvc/router.js'].lineData[508] = 0;
  _$jscoverage['/mvc/router.js'].lineData[512] = 0;
  _$jscoverage['/mvc/router.js'].lineData[513] = 0;
  _$jscoverage['/mvc/router.js'].lineData[522] = 0;
  _$jscoverage['/mvc/router.js'].lineData[523] = 0;
  _$jscoverage['/mvc/router.js'].lineData[524] = 0;
  _$jscoverage['/mvc/router.js'].lineData[525] = 0;
}
if (! _$jscoverage['/mvc/router.js'].functionData) {
  _$jscoverage['/mvc/router.js'].functionData = [];
  _$jscoverage['/mvc/router.js'].functionData[0] = 0;
  _$jscoverage['/mvc/router.js'].functionData[1] = 0;
  _$jscoverage['/mvc/router.js'].functionData[2] = 0;
  _$jscoverage['/mvc/router.js'].functionData[3] = 0;
  _$jscoverage['/mvc/router.js'].functionData[4] = 0;
  _$jscoverage['/mvc/router.js'].functionData[5] = 0;
  _$jscoverage['/mvc/router.js'].functionData[6] = 0;
  _$jscoverage['/mvc/router.js'].functionData[7] = 0;
  _$jscoverage['/mvc/router.js'].functionData[8] = 0;
  _$jscoverage['/mvc/router.js'].functionData[9] = 0;
  _$jscoverage['/mvc/router.js'].functionData[10] = 0;
  _$jscoverage['/mvc/router.js'].functionData[11] = 0;
  _$jscoverage['/mvc/router.js'].functionData[12] = 0;
  _$jscoverage['/mvc/router.js'].functionData[13] = 0;
  _$jscoverage['/mvc/router.js'].functionData[14] = 0;
  _$jscoverage['/mvc/router.js'].functionData[15] = 0;
  _$jscoverage['/mvc/router.js'].functionData[16] = 0;
  _$jscoverage['/mvc/router.js'].functionData[17] = 0;
  _$jscoverage['/mvc/router.js'].functionData[18] = 0;
  _$jscoverage['/mvc/router.js'].functionData[19] = 0;
  _$jscoverage['/mvc/router.js'].functionData[20] = 0;
  _$jscoverage['/mvc/router.js'].functionData[21] = 0;
  _$jscoverage['/mvc/router.js'].functionData[22] = 0;
  _$jscoverage['/mvc/router.js'].functionData[23] = 0;
  _$jscoverage['/mvc/router.js'].functionData[24] = 0;
  _$jscoverage['/mvc/router.js'].functionData[25] = 0;
  _$jscoverage['/mvc/router.js'].functionData[26] = 0;
  _$jscoverage['/mvc/router.js'].functionData[27] = 0;
  _$jscoverage['/mvc/router.js'].functionData[28] = 0;
  _$jscoverage['/mvc/router.js'].functionData[29] = 0;
  _$jscoverage['/mvc/router.js'].functionData[30] = 0;
  _$jscoverage['/mvc/router.js'].functionData[31] = 0;
  _$jscoverage['/mvc/router.js'].functionData[32] = 0;
}
if (! _$jscoverage['/mvc/router.js'].branchData) {
  _$jscoverage['/mvc/router.js'].branchData = {};
  _$jscoverage['/mvc/router.js'].branchData['16'] = [];
  _$jscoverage['/mvc/router.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['18'] = [];
  _$jscoverage['/mvc/router.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['23'] = [];
  _$jscoverage['/mvc/router.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['26'] = [];
  _$jscoverage['/mvc/router.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['28'] = [];
  _$jscoverage['/mvc/router.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['51'] = [];
  _$jscoverage['/mvc/router.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['52'] = [];
  _$jscoverage['/mvc/router.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['70'] = [];
  _$jscoverage['/mvc/router.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['77'] = [];
  _$jscoverage['/mvc/router.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['88'] = [];
  _$jscoverage['/mvc/router.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['98'] = [];
  _$jscoverage['/mvc/router.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['140'] = [];
  _$jscoverage['/mvc/router.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['145'] = [];
  _$jscoverage['/mvc/router.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['169'] = [];
  _$jscoverage['/mvc/router.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['174'] = [];
  _$jscoverage['/mvc/router.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['180'] = [];
  _$jscoverage['/mvc/router.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['185'] = [];
  _$jscoverage['/mvc/router.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['185'][2] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['186'] = [];
  _$jscoverage['/mvc/router.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['190'] = [];
  _$jscoverage['/mvc/router.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['192'] = [];
  _$jscoverage['/mvc/router.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['198'] = [];
  _$jscoverage['/mvc/router.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['215'] = [];
  _$jscoverage['/mvc/router.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['222'] = [];
  _$jscoverage['/mvc/router.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['250'] = [];
  _$jscoverage['/mvc/router.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['255'] = [];
  _$jscoverage['/mvc/router.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['257'] = [];
  _$jscoverage['/mvc/router.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['261'] = [];
  _$jscoverage['/mvc/router.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['286'] = [];
  _$jscoverage['/mvc/router.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['288'] = [];
  _$jscoverage['/mvc/router.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['371'] = [];
  _$jscoverage['/mvc/router.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['377'] = [];
  _$jscoverage['/mvc/router.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['407'] = [];
  _$jscoverage['/mvc/router.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['409'] = [];
  _$jscoverage['/mvc/router.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['410'] = [];
  _$jscoverage['/mvc/router.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['419'] = [];
  _$jscoverage['/mvc/router.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['422'] = [];
  _$jscoverage['/mvc/router.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['422'][2] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['427'] = [];
  _$jscoverage['/mvc/router.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['441'] = [];
  _$jscoverage['/mvc/router.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['443'] = [];
  _$jscoverage['/mvc/router.js'].branchData['443'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['444'] = [];
  _$jscoverage['/mvc/router.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['448'] = [];
  _$jscoverage['/mvc/router.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['459'] = [];
  _$jscoverage['/mvc/router.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['461'] = [];
  _$jscoverage['/mvc/router.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['467'] = [];
  _$jscoverage['/mvc/router.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['468'] = [];
  _$jscoverage['/mvc/router.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['482'] = [];
  _$jscoverage['/mvc/router.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['492'] = [];
  _$jscoverage['/mvc/router.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['505'] = [];
  _$jscoverage['/mvc/router.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/mvc/router.js'].branchData['508'] = [];
  _$jscoverage['/mvc/router.js'].branchData['508'][1] = new BranchData();
}
_$jscoverage['/mvc/router.js'].branchData['508'][1].init(785, 30, 'opts.success && opts.success()');
function visit99_508_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['505'][1].init(695, 17, 'opts.triggerRoute');
function visit98_505_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['492'][1].init(24, 37, 'nativeHistory && supportNativeHistory');
function visit97_492_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['482'][1].init(946, 36, '!equalsIgnoreSlash(locPath, urlRoot)');
function visit96_482_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['468'][1].init(30, 35, 'equalsIgnoreSlash(locPath, urlRoot)');
function visit95_468_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['467'][1].init(240, 11, 'hashIsValid');
function visit94_467_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['461'][1].init(24, 20, 'supportNativeHistory');
function visit93_461_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['459'][1].init(599, 13, 'nativeHistory');
function visit92_459_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['448'][1].init(207, 18, 'opts.urlRoot || ""');
function visit91_448_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['444'][1].init(25, 30, 'opts.success && opts.success()');
function visit90_444_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['443'][1].init(52, 16, 'Router.__started');
function visit89_443_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['443'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['441'][1].init(21, 10, 'opts || {}');
function visit88_441_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['427'][1].init(1006, 25, 'opts && opts.triggerRoute');
function visit87_427_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['422'][2].init(52, 6, 'ie < 8');
function visit86_422_2(result) {
  _$jscoverage['/mvc/router.js'].branchData['422'][2].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['422'][1].init(46, 12, 'ie && ie < 8');
function visit85_422_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['419'][1].init(77, 14, 'replaceHistory');
function visit84_419_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['410'][1].init(22, 44, 'Router.nativeHistory && supportNativeHistory');
function visit83_410_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['409'][1].init(121, 22, 'getFragment() !== path');
function visit82_409_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['407'][1].init(21, 10, 'opts || {}');
function visit81_407_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['377'][1].init(368, 5, 'match');
function visit80_377_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['371'][1].init(67, 15, 'path.match(reg)');
function visit79_371_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['288'][1].init(99, 27, 'typeof callback == \'string\'');
function visit78_288_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['286'][1].init(14, 30, 'typeof callback === \'function\'');
function visit77_286_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['261'][1].init(209, 2, 'g4');
function visit76_261_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['257'][1].init(92, 2, 'g2');
function visit75_257_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['255'][1].init(34, 8, 'g2 || g4');
function visit74_255_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['250'][1].init(71, 30, 'typeof callback === \'function\'');
function visit73_250_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['222'][1].init(4430, 10, 'finalParam');
function visit72_222_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['215'][1].init(3785, 12, 'exactlyMatch');
function visit71_215_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['198'][1].init(1130, 11, '!finalRoute');
function visit70_198_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['192'][1].init(285, 34, 'regStr.length > finalRegStr.length');
function visit69_192_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['190'][1].init(160, 27, 'm.length < finalMatchLength');
function visit68_190_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['186'][1].init(93, 28, 'finalMatchLength >= m.length');
function visit67_186_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['185'][2].init(436, 53, 'firstCaptureGroupIndex == finalFirstCaptureGroupIndex');
function visit66_185_2(result) {
  _$jscoverage['/mvc/router.js'].branchData['185'][2].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['185'][1].init(37, 122, 'firstCaptureGroupIndex == finalFirstCaptureGroupIndex && finalMatchLength >= m.length');
function visit65_185_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['180'][1].init(227, 52, 'firstCaptureGroupIndex > finalFirstCaptureGroupIndex');
function visit64_180_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['174'][1].init(1506, 6, 'regStr');
function visit63_174_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['169'][1].init(1299, 9, '!m.length');
function visit62_169_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['145'][1].init(34, 10, 'paramNames');
function visit61_145_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['140'][1].init(345, 19, 'm = path.match(reg)');
function visit60_140_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['98'][1].init(93, 12, 'str1 == str2');
function visit59_98_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['88'][1].init(14, 3, 'str');
function visit58_88_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['77'][1].init(14, 19, 'startWithSlash(str)');
function visit57_77_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['70'][1].init(14, 17, 'endWithSlash(str)');
function visit56_70_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['52'][1].init(51, 44, 'Router.nativeHistory && supportNativeHistory');
function visit55_52_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['51'][1].init(16, 20, 'url || location.href');
function visit54_51_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['28'][1].init(156, 8, 'r == "("');
function visit53_28_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['26'][1].init(96, 9, 'r == "\\\\"');
function visit52_26_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['23'][1].init(41, 17, 'i < regStr.length');
function visit51_23_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['18'][1].init(411, 31, 'history && history[\'pushState\']');
function visit50_18_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].branchData['16'][1].init(305, 36, 'win.document.documentMode || S.UA.ie');
function visit49_16_1(result) {
  _$jscoverage['/mvc/router.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/router.js'].lineData[6]++;
KISSY.add('mvc/router', function(S, Node, Base, undefined) {
  _$jscoverage['/mvc/router.js'].functionData[0]++;
  _$jscoverage['/mvc/router.js'].lineData[7]++;
  var each = S.each, BREATH_INTERVAL = 100, grammar = /(:([\w\d]+))|(\\\*([\w\d]+))/g, allRoutes = [], win = S.Env.host, $ = Node.all, $win = $(win), ie = visit49_16_1(win.document.documentMode || S.UA.ie), history = win.history, supportNativeHistory = !!(visit50_18_1(history && history['pushState'])), ROUTER_MAP = "__routerMap";
  _$jscoverage['/mvc/router.js'].lineData[21]++;
  function findFirstCaptureGroupIndex(regStr) {
    _$jscoverage['/mvc/router.js'].functionData[1]++;
    _$jscoverage['/mvc/router.js'].lineData[22]++;
    var r, i;
    _$jscoverage['/mvc/router.js'].lineData[23]++;
    for (i = 0; visit51_23_1(i < regStr.length); i++) {
      _$jscoverage['/mvc/router.js'].lineData[24]++;
      r = regStr.charAt(i);
      _$jscoverage['/mvc/router.js'].lineData[26]++;
      if (visit52_26_1(r == "\\")) {
        _$jscoverage['/mvc/router.js'].lineData[27]++;
        i++;
      } else {
        _$jscoverage['/mvc/router.js'].lineData[28]++;
        if (visit53_28_1(r == "(")) {
          _$jscoverage['/mvc/router.js'].lineData[29]++;
          return i;
        }
      }
    }
    _$jscoverage['/mvc/router.js'].lineData[32]++;
    throw new Error("impossible to not to get capture group in kissy mvc route");
  }
  _$jscoverage['/mvc/router.js'].lineData[35]++;
  function getHash(url) {
    _$jscoverage['/mvc/router.js'].functionData[2]++;
    _$jscoverage['/mvc/router.js'].lineData[45]++;
    return new S.Uri(url).getFragment().replace(/^!/, "");
  }
  _$jscoverage['/mvc/router.js'].lineData[50]++;
  function getFragment(url) {
    _$jscoverage['/mvc/router.js'].functionData[3]++;
    _$jscoverage['/mvc/router.js'].lineData[51]++;
    url = visit54_51_1(url || location.href);
    _$jscoverage['/mvc/router.js'].lineData[52]++;
    if (visit55_52_1(Router.nativeHistory && supportNativeHistory)) {
      _$jscoverage['/mvc/router.js'].lineData[53]++;
      url = new S.Uri(url);
      _$jscoverage['/mvc/router.js'].lineData[54]++;
      var query = url.getQuery().toString();
      _$jscoverage['/mvc/router.js'].lineData[55]++;
      return url.getPath().substr(Router.urlRoot.length) + (query ? ('?' + query) : '');
    } else {
      _$jscoverage['/mvc/router.js'].lineData[57]++;
      return getHash(url);
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[61]++;
  function endWithSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[4]++;
    _$jscoverage['/mvc/router.js'].lineData[62]++;
    return S.endsWith(str, "/");
  }
  _$jscoverage['/mvc/router.js'].lineData[65]++;
  function startWithSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[5]++;
    _$jscoverage['/mvc/router.js'].lineData[66]++;
    return S.startsWith(str, "/");
  }
  _$jscoverage['/mvc/router.js'].lineData[69]++;
  function removeEndSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[6]++;
    _$jscoverage['/mvc/router.js'].lineData[70]++;
    if (visit56_70_1(endWithSlash(str))) {
      _$jscoverage['/mvc/router.js'].lineData[71]++;
      str = str.substring(0, str.length - 1);
    }
    _$jscoverage['/mvc/router.js'].lineData[73]++;
    return str;
  }
  _$jscoverage['/mvc/router.js'].lineData[76]++;
  function removeStartSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[7]++;
    _$jscoverage['/mvc/router.js'].lineData[77]++;
    if (visit57_77_1(startWithSlash(str))) {
      _$jscoverage['/mvc/router.js'].lineData[78]++;
      str = str.substring(1);
    }
    _$jscoverage['/mvc/router.js'].lineData[80]++;
    return str;
  }
  _$jscoverage['/mvc/router.js'].lineData[83]++;
  function addEndSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[8]++;
    _$jscoverage['/mvc/router.js'].lineData[84]++;
    return removeEndSlash(str) + "/";
  }
  _$jscoverage['/mvc/router.js'].lineData[87]++;
  function addStartSlash(str) {
    _$jscoverage['/mvc/router.js'].functionData[9]++;
    _$jscoverage['/mvc/router.js'].lineData[88]++;
    if (visit58_88_1(str)) {
      _$jscoverage['/mvc/router.js'].lineData[89]++;
      return "/" + removeStartSlash(str);
    } else {
      _$jscoverage['/mvc/router.js'].lineData[91]++;
      return str;
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[95]++;
  function equalsIgnoreSlash(str1, str2) {
    _$jscoverage['/mvc/router.js'].functionData[10]++;
    _$jscoverage['/mvc/router.js'].lineData[96]++;
    str1 = removeEndSlash(str1);
    _$jscoverage['/mvc/router.js'].lineData[97]++;
    str2 = removeEndSlash(str2);
    _$jscoverage['/mvc/router.js'].lineData[98]++;
    return visit59_98_1(str1 == str2);
  }
  _$jscoverage['/mvc/router.js'].lineData[103]++;
  function getFullPath(fragment) {
    _$jscoverage['/mvc/router.js'].functionData[11]++;
    _$jscoverage['/mvc/router.js'].lineData[104]++;
    return location.protocol + "//" + location.host + removeEndSlash(Router.urlRoot) + addStartSlash(fragment);
  }
  _$jscoverage['/mvc/router.js'].lineData[110]++;
  function dispatch() {
    _$jscoverage['/mvc/router.js'].functionData[12]++;
    _$jscoverage['/mvc/router.js'].lineData[111]++;
    var query, path, arg, finalRoute = 0, finalMatchLength = -1, finalRegStr = "", finalFirstCaptureGroupIndex = -1, finalCallback = 0, finalRouteName = "", pathUri = new S.Uri(getFragment()), finalParam = 0;
    _$jscoverage['/mvc/router.js'].lineData[123]++;
    path = pathUri.clone();
    _$jscoverage['/mvc/router.js'].lineData[124]++;
    path.query.reset();
    _$jscoverage['/mvc/router.js'].lineData[125]++;
    path = path.toString();
    _$jscoverage['/mvc/router.js'].lineData[128]++;
    each(allRoutes, function(route) {
  _$jscoverage['/mvc/router.js'].functionData[13]++;
  _$jscoverage['/mvc/router.js'].lineData[129]++;
  var routeRegs = route[ROUTER_MAP], exactlyMatch = 0;
  _$jscoverage['/mvc/router.js'].lineData[132]++;
  each(routeRegs, function(desc) {
  _$jscoverage['/mvc/router.js'].functionData[14]++;
  _$jscoverage['/mvc/router.js'].lineData[133]++;
  var reg = desc.reg, regStr = desc.regStr, paramNames = desc.paramNames, firstCaptureGroupIndex = -1, m, name = desc.name, callback = desc.callback;
  _$jscoverage['/mvc/router.js'].lineData[140]++;
  if (visit60_140_1(m = path.match(reg))) {
    _$jscoverage['/mvc/router.js'].lineData[142]++;
    m.shift();
    _$jscoverage['/mvc/router.js'].lineData[144]++;
    function genParam() {
      _$jscoverage['/mvc/router.js'].functionData[15]++;
      _$jscoverage['/mvc/router.js'].lineData[145]++;
      if (visit61_145_1(paramNames)) {
        _$jscoverage['/mvc/router.js'].lineData[146]++;
        var params = {};
        _$jscoverage['/mvc/router.js'].lineData[147]++;
        each(m, function(sm, i) {
  _$jscoverage['/mvc/router.js'].functionData[16]++;
  _$jscoverage['/mvc/router.js'].lineData[148]++;
  params[paramNames[i]] = sm;
});
        _$jscoverage['/mvc/router.js'].lineData[150]++;
        return params;
      } else {
        _$jscoverage['/mvc/router.js'].lineData[154]++;
        return [].concat(m);
      }
    }    _$jscoverage['/mvc/router.js'].lineData[158]++;
    function upToFinal() {
      _$jscoverage['/mvc/router.js'].functionData[17]++;
      _$jscoverage['/mvc/router.js'].lineData[159]++;
      finalRegStr = regStr;
      _$jscoverage['/mvc/router.js'].lineData[160]++;
      finalFirstCaptureGroupIndex = firstCaptureGroupIndex;
      _$jscoverage['/mvc/router.js'].lineData[161]++;
      finalCallback = callback;
      _$jscoverage['/mvc/router.js'].lineData[162]++;
      finalParam = genParam();
      _$jscoverage['/mvc/router.js'].lineData[163]++;
      finalRoute = route;
      _$jscoverage['/mvc/router.js'].lineData[164]++;
      finalRouteName = name;
      _$jscoverage['/mvc/router.js'].lineData[165]++;
      finalMatchLength = m.length;
    }    _$jscoverage['/mvc/router.js'].lineData[169]++;
    if (visit62_169_1(!m.length)) {
      _$jscoverage['/mvc/router.js'].lineData[170]++;
      upToFinal();
      _$jscoverage['/mvc/router.js'].lineData[171]++;
      exactlyMatch = 1;
      _$jscoverage['/mvc/router.js'].lineData[172]++;
      return false;
    } else {
      _$jscoverage['/mvc/router.js'].lineData[174]++;
      if (visit63_174_1(regStr)) {
        _$jscoverage['/mvc/router.js'].lineData[176]++;
        firstCaptureGroupIndex = findFirstCaptureGroupIndex(regStr);
        _$jscoverage['/mvc/router.js'].lineData[180]++;
        if (visit64_180_1(firstCaptureGroupIndex > finalFirstCaptureGroupIndex)) {
          _$jscoverage['/mvc/router.js'].lineData[181]++;
          upToFinal();
        } else {
          _$jscoverage['/mvc/router.js'].lineData[184]++;
          if (visit65_185_1(visit66_185_2(firstCaptureGroupIndex == finalFirstCaptureGroupIndex) && visit67_186_1(finalMatchLength >= m.length))) {
            _$jscoverage['/mvc/router.js'].lineData[190]++;
            if (visit68_190_1(m.length < finalMatchLength)) {
              _$jscoverage['/mvc/router.js'].lineData[191]++;
              upToFinal();
            } else {
              _$jscoverage['/mvc/router.js'].lineData[192]++;
              if (visit69_192_1(regStr.length > finalRegStr.length)) {
                _$jscoverage['/mvc/router.js'].lineData[193]++;
                upToFinal();
              }
            }
          } else {
            _$jscoverage['/mvc/router.js'].lineData[198]++;
            if (visit70_198_1(!finalRoute)) {
              _$jscoverage['/mvc/router.js'].lineData[199]++;
              upToFinal();
            }
          }
        }
      } else {
        _$jscoverage['/mvc/router.js'].lineData[206]++;
        upToFinal();
        _$jscoverage['/mvc/router.js'].lineData[207]++;
        exactlyMatch = 1;
        _$jscoverage['/mvc/router.js'].lineData[208]++;
        return false;
      }
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[211]++;
  return undefined;
});
  _$jscoverage['/mvc/router.js'].lineData[215]++;
  if (visit71_215_1(exactlyMatch)) {
    _$jscoverage['/mvc/router.js'].lineData[216]++;
    return false;
  }
  _$jscoverage['/mvc/router.js'].lineData[218]++;
  return undefined;
});
    _$jscoverage['/mvc/router.js'].lineData[222]++;
    if (visit72_222_1(finalParam)) {
      _$jscoverage['/mvc/router.js'].lineData[223]++;
      query = pathUri.query.get();
      _$jscoverage['/mvc/router.js'].lineData[224]++;
      finalCallback.apply(finalRoute, [finalParam, query, {
  path: path, 
  url: location.href}]);
      _$jscoverage['/mvc/router.js'].lineData[228]++;
      arg = {
  name: finalRouteName, 
  "paths": finalParam, 
  path: path, 
  url: location.href, 
  query: query};
      _$jscoverage['/mvc/router.js'].lineData[235]++;
      finalRoute.fire('route:' + finalRouteName, arg);
      _$jscoverage['/mvc/router.js'].lineData[236]++;
      finalRoute.fire('route', arg);
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[246]++;
  function transformRouterReg(self, str, callback) {
    _$jscoverage['/mvc/router.js'].functionData[18]++;
    _$jscoverage['/mvc/router.js'].lineData[247]++;
    var name = str, paramNames = [];
    _$jscoverage['/mvc/router.js'].lineData[250]++;
    if (visit73_250_1(typeof callback === 'function')) {
      _$jscoverage['/mvc/router.js'].lineData[252]++;
      str = S.escapeRegExp(str);
      _$jscoverage['/mvc/router.js'].lineData[254]++;
      str = str.replace(grammar, function(m, g1, g2, g3, g4) {
  _$jscoverage['/mvc/router.js'].functionData[19]++;
  _$jscoverage['/mvc/router.js'].lineData[255]++;
  paramNames.push(visit74_255_1(g2 || g4));
  _$jscoverage['/mvc/router.js'].lineData[257]++;
  if (visit75_257_1(g2)) {
    _$jscoverage['/mvc/router.js'].lineData[258]++;
    return "([^/]+)";
  } else {
    _$jscoverage['/mvc/router.js'].lineData[261]++;
    if (visit76_261_1(g4)) {
      _$jscoverage['/mvc/router.js'].lineData[262]++;
      return "(.*)";
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[264]++;
  return undefined;
});
      _$jscoverage['/mvc/router.js'].lineData[267]++;
      return {
  name: name, 
  paramNames: paramNames, 
  reg: new RegExp("^" + str + "$"), 
  regStr: str, 
  callback: callback};
    } else {
      _$jscoverage['/mvc/router.js'].lineData[275]++;
      return {
  name: name, 
  reg: callback.reg, 
  callback: normFn(self, callback.callback)};
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[285]++;
  function normFn(self, callback) {
    _$jscoverage['/mvc/router.js'].functionData[20]++;
    _$jscoverage['/mvc/router.js'].lineData[286]++;
    if (visit77_286_1(typeof callback === 'function')) {
      _$jscoverage['/mvc/router.js'].lineData[287]++;
      return callback;
    } else {
      _$jscoverage['/mvc/router.js'].lineData[288]++;
      if (visit78_288_1(typeof callback == 'string')) {
        _$jscoverage['/mvc/router.js'].lineData[289]++;
        return self[callback];
      }
    }
    _$jscoverage['/mvc/router.js'].lineData[291]++;
    return callback;
  }
  _$jscoverage['/mvc/router.js'].lineData[294]++;
  function _afterRoutesChange(e) {
    _$jscoverage['/mvc/router.js'].functionData[21]++;
    _$jscoverage['/mvc/router.js'].lineData[295]++;
    var self = this;
    _$jscoverage['/mvc/router.js'].lineData[296]++;
    self[ROUTER_MAP] = {};
    _$jscoverage['/mvc/router.js'].lineData[297]++;
    self.addRoutes(e.newVal);
  }
  _$jscoverage['/mvc/router.js'].lineData[300]++;
  var Router;
  _$jscoverage['/mvc/router.js'].lineData[307]++;
  return Router = Base.extend({
  initializer: function() {
  _$jscoverage['/mvc/router.js'].functionData[22]++;
  _$jscoverage['/mvc/router.js'].lineData[309]++;
  var self = this;
  _$jscoverage['/mvc/router.js'].lineData[310]++;
  self.on("afterRoutesChange", _afterRoutesChange, self);
  _$jscoverage['/mvc/router.js'].lineData[311]++;
  _afterRoutesChange.call(self, {
  newVal: self.get("routes")});
  _$jscoverage['/mvc/router.js'].lineData[312]++;
  allRoutes.push(self);
}, 
  addRoutes: function(routes) {
  _$jscoverage['/mvc/router.js'].functionData[23]++;
  _$jscoverage['/mvc/router.js'].lineData[329]++;
  var self = this;
  _$jscoverage['/mvc/router.js'].lineData[330]++;
  each(routes, function(callback, name) {
  _$jscoverage['/mvc/router.js'].functionData[24]++;
  _$jscoverage['/mvc/router.js'].lineData[331]++;
  self[ROUTER_MAP][name] = transformRouterReg(self, name, normFn(self, callback));
});
}}, {
  ATTRS: {
  routes: {}}, 
  hasRoute: function(path) {
  _$jscoverage['/mvc/router.js'].functionData[25]++;
  _$jscoverage['/mvc/router.js'].lineData[365]++;
  var match = 0;
  _$jscoverage['/mvc/router.js'].lineData[367]++;
  each(allRoutes, function(route) {
  _$jscoverage['/mvc/router.js'].functionData[26]++;
  _$jscoverage['/mvc/router.js'].lineData[368]++;
  var routeRegs = route[ROUTER_MAP];
  _$jscoverage['/mvc/router.js'].lineData[369]++;
  each(routeRegs, function(desc) {
  _$jscoverage['/mvc/router.js'].functionData[27]++;
  _$jscoverage['/mvc/router.js'].lineData[370]++;
  var reg = desc.reg;
  _$jscoverage['/mvc/router.js'].lineData[371]++;
  if (visit79_371_1(path.match(reg))) {
    _$jscoverage['/mvc/router.js'].lineData[372]++;
    match = 1;
    _$jscoverage['/mvc/router.js'].lineData[373]++;
    return false;
  }
  _$jscoverage['/mvc/router.js'].lineData[375]++;
  return undefined;
});
  _$jscoverage['/mvc/router.js'].lineData[377]++;
  if (visit80_377_1(match)) {
    _$jscoverage['/mvc/router.js'].lineData[378]++;
    return false;
  }
  _$jscoverage['/mvc/router.js'].lineData[380]++;
  return undefined;
});
  _$jscoverage['/mvc/router.js'].lineData[382]++;
  return !!match;
}, 
  removeRoot: function(url) {
  _$jscoverage['/mvc/router.js'].functionData[28]++;
  _$jscoverage['/mvc/router.js'].lineData[393]++;
  var u = new S.Uri(url);
  _$jscoverage['/mvc/router.js'].lineData[394]++;
  return u.getPath().substr(Router.urlRoot.length);
}, 
  navigate: function(path, opts) {
  _$jscoverage['/mvc/router.js'].functionData[29]++;
  _$jscoverage['/mvc/router.js'].lineData[407]++;
  opts = visit81_407_1(opts || {});
  _$jscoverage['/mvc/router.js'].lineData[408]++;
  var replaceHistory = opts.replaceHistory, normalizedPath;
  _$jscoverage['/mvc/router.js'].lineData[409]++;
  if (visit82_409_1(getFragment() !== path)) {
    _$jscoverage['/mvc/router.js'].lineData[410]++;
    if (visit83_410_1(Router.nativeHistory && supportNativeHistory)) {
      _$jscoverage['/mvc/router.js'].lineData[411]++;
      history[replaceHistory ? 'replaceState' : 'pushState']({}, "", getFullPath(path));
      _$jscoverage['/mvc/router.js'].lineData[416]++;
      dispatch();
    } else {
      _$jscoverage['/mvc/router.js'].lineData[418]++;
      normalizedPath = '#!' + path;
      _$jscoverage['/mvc/router.js'].lineData[419]++;
      if (visit84_419_1(replaceHistory)) {
        _$jscoverage['/mvc/router.js'].lineData[421]++;
        location.replace(normalizedPath + (visit85_422_1(ie && visit86_422_2(ie < 8)) ? Node.REPLACE_HISTORY : ''));
      } else {
        _$jscoverage['/mvc/router.js'].lineData[424]++;
        location.hash = normalizedPath;
      }
    }
  } else {
    _$jscoverage['/mvc/router.js'].lineData[427]++;
    if (visit87_427_1(opts && opts.triggerRoute)) {
      _$jscoverage['/mvc/router.js'].lineData[428]++;
      dispatch();
    }
  }
}, 
  start: function(opts) {
  _$jscoverage['/mvc/router.js'].functionData[30]++;
  _$jscoverage['/mvc/router.js'].lineData[441]++;
  opts = visit88_441_1(opts || {});
  _$jscoverage['/mvc/router.js'].lineData[443]++;
  if (visit89_443_1(Router.__started)) {
    _$jscoverage['/mvc/router.js'].lineData[444]++;
    return visit90_444_1(opts.success && opts.success());
  }
  _$jscoverage['/mvc/router.js'].lineData[448]++;
  opts.urlRoot = (visit91_448_1(opts.urlRoot || "")).replace(/\/$/, '');
  _$jscoverage['/mvc/router.js'].lineData[450]++;
  var urlRoot, nativeHistory = opts.nativeHistory, locPath = location.pathname, hash = getFragment(), hashIsValid = location.hash.match(/#!.+/);
  _$jscoverage['/mvc/router.js'].lineData[456]++;
  urlRoot = Router.urlRoot = opts.urlRoot;
  _$jscoverage['/mvc/router.js'].lineData[457]++;
  Router.nativeHistory = nativeHistory;
  _$jscoverage['/mvc/router.js'].lineData[459]++;
  if (visit92_459_1(nativeHistory)) {
    _$jscoverage['/mvc/router.js'].lineData[461]++;
    if (visit93_461_1(supportNativeHistory)) {
      _$jscoverage['/mvc/router.js'].lineData[467]++;
      if (visit94_467_1(hashIsValid)) {
        _$jscoverage['/mvc/router.js'].lineData[468]++;
        if (visit95_468_1(equalsIgnoreSlash(locPath, urlRoot))) {
          _$jscoverage['/mvc/router.js'].lineData[470]++;
          history['replaceState']({}, "", getFullPath(hash));
          _$jscoverage['/mvc/router.js'].lineData[471]++;
          opts.triggerRoute = 1;
        } else {
          _$jscoverage['/mvc/router.js'].lineData[473]++;
          S.error("location path must be same with urlRoot!");
        }
      }
    } else {
      _$jscoverage['/mvc/router.js'].lineData[482]++;
      if (visit96_482_1(!equalsIgnoreSlash(locPath, urlRoot))) {
        _$jscoverage['/mvc/router.js'].lineData[483]++;
        location.replace(addEndSlash(urlRoot) + "#!" + hash);
        _$jscoverage['/mvc/router.js'].lineData[484]++;
        return undefined;
      }
    }
  }
  _$jscoverage['/mvc/router.js'].lineData[490]++;
  setTimeout(function() {
  _$jscoverage['/mvc/router.js'].functionData[31]++;
  _$jscoverage['/mvc/router.js'].lineData[492]++;
  if (visit97_492_1(nativeHistory && supportNativeHistory)) {
    _$jscoverage['/mvc/router.js'].lineData[493]++;
    $win.on('popstate', dispatch);
  } else {
    _$jscoverage['/mvc/router.js'].lineData[497]++;
    $win.on("hashchange", dispatch);
    _$jscoverage['/mvc/router.js'].lineData[499]++;
    opts.triggerRoute = 1;
  }
  _$jscoverage['/mvc/router.js'].lineData[505]++;
  if (visit98_505_1(opts.triggerRoute)) {
    _$jscoverage['/mvc/router.js'].lineData[506]++;
    dispatch();
  }
  _$jscoverage['/mvc/router.js'].lineData[508]++;
  visit99_508_1(opts.success && opts.success());
}, BREATH_INTERVAL);
  _$jscoverage['/mvc/router.js'].lineData[512]++;
  Router.__started = 1;
  _$jscoverage['/mvc/router.js'].lineData[513]++;
  return undefined;
}, 
  stop: function() {
  _$jscoverage['/mvc/router.js'].functionData[32]++;
  _$jscoverage['/mvc/router.js'].lineData[522]++;
  Router.__started = 0;
  _$jscoverage['/mvc/router.js'].lineData[523]++;
  $win.detach('popstate', dispatch);
  _$jscoverage['/mvc/router.js'].lineData[524]++;
  $win.detach("hashchange", dispatch);
  _$jscoverage['/mvc/router.js'].lineData[525]++;
  allRoutes = [];
}});
}, {
  requires: ['node', 'base']});
