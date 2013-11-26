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
  _$jscoverage['/dialog.js'].lineData[7] = 0;
  _$jscoverage['/dialog.js'].lineData[8] = 0;
  _$jscoverage['/dialog.js'].lineData[9] = 0;
  _$jscoverage['/dialog.js'].lineData[10] = 0;
  _$jscoverage['/dialog.js'].lineData[11] = 0;
  _$jscoverage['/dialog.js'].lineData[12] = 0;
  _$jscoverage['/dialog.js'].lineData[13] = 0;
  _$jscoverage['/dialog.js'].lineData[34] = 0;
  _$jscoverage['/dialog.js'].lineData[35] = 0;
  _$jscoverage['/dialog.js'].lineData[36] = 0;
  _$jscoverage['/dialog.js'].lineData[37] = 0;
  _$jscoverage['/dialog.js'].lineData[38] = 0;
  _$jscoverage['/dialog.js'].lineData[39] = 0;
  _$jscoverage['/dialog.js'].lineData[41] = 0;
  _$jscoverage['/dialog.js'].lineData[42] = 0;
  _$jscoverage['/dialog.js'].lineData[44] = 0;
  _$jscoverage['/dialog.js'].lineData[46] = 0;
  _$jscoverage['/dialog.js'].lineData[49] = 0;
  _$jscoverage['/dialog.js'].lineData[50] = 0;
  _$jscoverage['/dialog.js'].lineData[51] = 0;
  _$jscoverage['/dialog.js'].lineData[52] = 0;
  _$jscoverage['/dialog.js'].lineData[53] = 0;
  _$jscoverage['/dialog.js'].lineData[54] = 0;
  _$jscoverage['/dialog.js'].lineData[56] = 0;
  _$jscoverage['/dialog.js'].lineData[57] = 0;
  _$jscoverage['/dialog.js'].lineData[60] = 0;
  _$jscoverage['/dialog.js'].lineData[62] = 0;
  _$jscoverage['/dialog.js'].lineData[63] = 0;
  _$jscoverage['/dialog.js'].lineData[65] = 0;
  _$jscoverage['/dialog.js'].lineData[77] = 0;
  _$jscoverage['/dialog.js'].lineData[82] = 0;
  _$jscoverage['/dialog.js'].lineData[83] = 0;
  _$jscoverage['/dialog.js'].lineData[84] = 0;
  _$jscoverage['/dialog.js'].lineData[88] = 0;
  _$jscoverage['/dialog.js'].lineData[89] = 0;
  _$jscoverage['/dialog.js'].lineData[90] = 0;
  _$jscoverage['/dialog.js'].lineData[91] = 0;
  _$jscoverage['/dialog.js'].lineData[92] = 0;
  _$jscoverage['/dialog.js'].lineData[93] = 0;
  _$jscoverage['/dialog.js'].lineData[101] = 0;
  _$jscoverage['/dialog.js'].lineData[102] = 0;
  _$jscoverage['/dialog.js'].lineData[103] = 0;
  _$jscoverage['/dialog.js'].lineData[104] = 0;
  _$jscoverage['/dialog.js'].lineData[105] = 0;
  _$jscoverage['/dialog.js'].lineData[106] = 0;
  _$jscoverage['/dialog.js'].lineData[107] = 0;
  _$jscoverage['/dialog.js'].lineData[108] = 0;
  _$jscoverage['/dialog.js'].lineData[110] = 0;
  _$jscoverage['/dialog.js'].lineData[111] = 0;
  _$jscoverage['/dialog.js'].lineData[112] = 0;
  _$jscoverage['/dialog.js'].lineData[114] = 0;
  _$jscoverage['/dialog.js'].lineData[116] = 0;
  _$jscoverage['/dialog.js'].lineData[119] = 0;
  _$jscoverage['/dialog.js'].lineData[120] = 0;
  _$jscoverage['/dialog.js'].lineData[121] = 0;
  _$jscoverage['/dialog.js'].lineData[123] = 0;
  _$jscoverage['/dialog.js'].lineData[125] = 0;
  _$jscoverage['/dialog.js'].lineData[128] = 0;
  _$jscoverage['/dialog.js'].lineData[129] = 0;
  _$jscoverage['/dialog.js'].lineData[130] = 0;
  _$jscoverage['/dialog.js'].lineData[133] = 0;
  _$jscoverage['/dialog.js'].lineData[141] = 0;
  _$jscoverage['/dialog.js'].lineData[143] = 0;
  _$jscoverage['/dialog.js'].lineData[144] = 0;
  _$jscoverage['/dialog.js'].lineData[145] = 0;
  _$jscoverage['/dialog.js'].lineData[146] = 0;
  _$jscoverage['/dialog.js'].lineData[148] = 0;
  _$jscoverage['/dialog.js'].lineData[149] = 0;
  _$jscoverage['/dialog.js'].lineData[151] = 0;
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
  _$jscoverage['/dialog.js'].lineData[244] = 0;
  _$jscoverage['/dialog.js'].lineData[248] = 0;
  _$jscoverage['/dialog.js'].lineData[249] = 0;
  _$jscoverage['/dialog.js'].lineData[251] = 0;
  _$jscoverage['/dialog.js'].lineData[253] = 0;
  _$jscoverage['/dialog.js'].lineData[256] = 0;
  _$jscoverage['/dialog.js'].lineData[269] = 0;
  _$jscoverage['/dialog.js'].lineData[270] = 0;
  _$jscoverage['/dialog.js'].lineData[271] = 0;
  _$jscoverage['/dialog.js'].lineData[272] = 0;
  _$jscoverage['/dialog.js'].lineData[273] = 0;
  _$jscoverage['/dialog.js'].lineData[274] = 0;
  _$jscoverage['/dialog.js'].lineData[276] = 0;
  _$jscoverage['/dialog.js'].lineData[277] = 0;
  _$jscoverage['/dialog.js'].lineData[279] = 0;
  _$jscoverage['/dialog.js'].lineData[280] = 0;
  _$jscoverage['/dialog.js'].lineData[282] = 0;
  _$jscoverage['/dialog.js'].lineData[285] = 0;
  _$jscoverage['/dialog.js'].lineData[286] = 0;
  _$jscoverage['/dialog.js'].lineData[290] = 0;
  _$jscoverage['/dialog.js'].lineData[293] = 0;
  _$jscoverage['/dialog.js'].lineData[297] = 0;
  _$jscoverage['/dialog.js'].lineData[306] = 0;
  _$jscoverage['/dialog.js'].lineData[307] = 0;
  _$jscoverage['/dialog.js'].lineData[309] = 0;
  _$jscoverage['/dialog.js'].lineData[310] = 0;
  _$jscoverage['/dialog.js'].lineData[312] = 0;
  _$jscoverage['/dialog.js'].lineData[313] = 0;
  _$jscoverage['/dialog.js'].lineData[315] = 0;
  _$jscoverage['/dialog.js'].lineData[316] = 0;
  _$jscoverage['/dialog.js'].lineData[319] = 0;
  _$jscoverage['/dialog.js'].lineData[326] = 0;
  _$jscoverage['/dialog.js'].lineData[327] = 0;
  _$jscoverage['/dialog.js'].lineData[328] = 0;
  _$jscoverage['/dialog.js'].lineData[329] = 0;
  _$jscoverage['/dialog.js'].lineData[336] = 0;
  _$jscoverage['/dialog.js'].lineData[346] = 0;
  _$jscoverage['/dialog.js'].lineData[351] = 0;
  _$jscoverage['/dialog.js'].lineData[352] = 0;
  _$jscoverage['/dialog.js'].lineData[362] = 0;
  _$jscoverage['/dialog.js'].lineData[363] = 0;
  _$jscoverage['/dialog.js'].lineData[364] = 0;
  _$jscoverage['/dialog.js'].lineData[365] = 0;
  _$jscoverage['/dialog.js'].lineData[366] = 0;
  _$jscoverage['/dialog.js'].lineData[367] = 0;
  _$jscoverage['/dialog.js'].lineData[370] = 0;
  _$jscoverage['/dialog.js'].lineData[371] = 0;
  _$jscoverage['/dialog.js'].lineData[374] = 0;
  _$jscoverage['/dialog.js'].lineData[378] = 0;
  _$jscoverage['/dialog.js'].lineData[380] = 0;
  _$jscoverage['/dialog.js'].lineData[381] = 0;
  _$jscoverage['/dialog.js'].lineData[383] = 0;
  _$jscoverage['/dialog.js'].lineData[386] = 0;
  _$jscoverage['/dialog.js'].lineData[387] = 0;
  _$jscoverage['/dialog.js'].lineData[388] = 0;
  _$jscoverage['/dialog.js'].lineData[389] = 0;
  _$jscoverage['/dialog.js'].lineData[392] = 0;
  _$jscoverage['/dialog.js'].lineData[393] = 0;
  _$jscoverage['/dialog.js'].lineData[395] = 0;
  _$jscoverage['/dialog.js'].lineData[396] = 0;
  _$jscoverage['/dialog.js'].lineData[398] = 0;
  _$jscoverage['/dialog.js'].lineData[399] = 0;
  _$jscoverage['/dialog.js'].lineData[405] = 0;
  _$jscoverage['/dialog.js'].lineData[409] = 0;
  _$jscoverage['/dialog.js'].lineData[410] = 0;
  _$jscoverage['/dialog.js'].lineData[411] = 0;
  _$jscoverage['/dialog.js'].lineData[412] = 0;
  _$jscoverage['/dialog.js'].lineData[414] = 0;
  _$jscoverage['/dialog.js'].lineData[415] = 0;
  _$jscoverage['/dialog.js'].lineData[417] = 0;
  _$jscoverage['/dialog.js'].lineData[419] = 0;
  _$jscoverage['/dialog.js'].lineData[420] = 0;
  _$jscoverage['/dialog.js'].lineData[422] = 0;
  _$jscoverage['/dialog.js'].lineData[424] = 0;
  _$jscoverage['/dialog.js'].lineData[425] = 0;
  _$jscoverage['/dialog.js'].lineData[427] = 0;
  _$jscoverage['/dialog.js'].lineData[428] = 0;
  _$jscoverage['/dialog.js'].lineData[429] = 0;
  _$jscoverage['/dialog.js'].lineData[430] = 0;
  _$jscoverage['/dialog.js'].lineData[432] = 0;
  _$jscoverage['/dialog.js'].lineData[433] = 0;
  _$jscoverage['/dialog.js'].lineData[434] = 0;
  _$jscoverage['/dialog.js'].lineData[435] = 0;
  _$jscoverage['/dialog.js'].lineData[436] = 0;
  _$jscoverage['/dialog.js'].lineData[438] = 0;
  _$jscoverage['/dialog.js'].lineData[439] = 0;
  _$jscoverage['/dialog.js'].lineData[440] = 0;
  _$jscoverage['/dialog.js'].lineData[442] = 0;
  _$jscoverage['/dialog.js'].lineData[443] = 0;
  _$jscoverage['/dialog.js'].lineData[445] = 0;
  _$jscoverage['/dialog.js'].lineData[446] = 0;
  _$jscoverage['/dialog.js'].lineData[447] = 0;
  _$jscoverage['/dialog.js'].lineData[448] = 0;
  _$jscoverage['/dialog.js'].lineData[449] = 0;
  _$jscoverage['/dialog.js'].lineData[450] = 0;
  _$jscoverage['/dialog.js'].lineData[451] = 0;
  _$jscoverage['/dialog.js'].lineData[452] = 0;
  _$jscoverage['/dialog.js'].lineData[453] = 0;
  _$jscoverage['/dialog.js'].lineData[455] = 0;
  _$jscoverage['/dialog.js'].lineData[456] = 0;
  _$jscoverage['/dialog.js'].lineData[457] = 0;
  _$jscoverage['/dialog.js'].lineData[459] = 0;
  _$jscoverage['/dialog.js'].lineData[460] = 0;
  _$jscoverage['/dialog.js'].lineData[462] = 0;
  _$jscoverage['/dialog.js'].lineData[463] = 0;
  _$jscoverage['/dialog.js'].lineData[464] = 0;
  _$jscoverage['/dialog.js'].lineData[465] = 0;
  _$jscoverage['/dialog.js'].lineData[468] = 0;
  _$jscoverage['/dialog.js'].lineData[469] = 0;
  _$jscoverage['/dialog.js'].lineData[470] = 0;
  _$jscoverage['/dialog.js'].lineData[471] = 0;
  _$jscoverage['/dialog.js'].lineData[474] = 0;
  _$jscoverage['/dialog.js'].lineData[475] = 0;
  _$jscoverage['/dialog.js'].lineData[476] = 0;
  _$jscoverage['/dialog.js'].lineData[477] = 0;
  _$jscoverage['/dialog.js'].lineData[478] = 0;
  _$jscoverage['/dialog.js'].lineData[480] = 0;
  _$jscoverage['/dialog.js'].lineData[481] = 0;
  _$jscoverage['/dialog.js'].lineData[486] = 0;
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
  _$jscoverage['/dialog.js'].branchData['38'] = [];
  _$jscoverage['/dialog.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['41'] = [];
  _$jscoverage['/dialog.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['52'] = [];
  _$jscoverage['/dialog.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['53'] = [];
  _$jscoverage['/dialog.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['54'] = [];
  _$jscoverage['/dialog.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['54'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['112'] = [];
  _$jscoverage['/dialog.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['112'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['113'] = [];
  _$jscoverage['/dialog.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['121'] = [];
  _$jscoverage['/dialog.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['121'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['122'] = [];
  _$jscoverage['/dialog.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['144'] = [];
  _$jscoverage['/dialog.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['146'] = [];
  _$jscoverage['/dialog.js'].branchData['146'][1] = new BranchData();
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
  _$jscoverage['/dialog.js'].branchData['248'] = [];
  _$jscoverage['/dialog.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['249'] = [];
  _$jscoverage['/dialog.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['254'] = [];
  _$jscoverage['/dialog.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['267'] = [];
  _$jscoverage['/dialog.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['269'] = [];
  _$jscoverage['/dialog.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['285'] = [];
  _$jscoverage['/dialog.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['306'] = [];
  _$jscoverage['/dialog.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['309'] = [];
  _$jscoverage['/dialog.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['312'] = [];
  _$jscoverage['/dialog.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['315'] = [];
  _$jscoverage['/dialog.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['315'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['326'] = [];
  _$jscoverage['/dialog.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['362'] = [];
  _$jscoverage['/dialog.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['363'] = [];
  _$jscoverage['/dialog.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['364'] = [];
  _$jscoverage['/dialog.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['364'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['364'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['366'] = [];
  _$jscoverage['/dialog.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['366'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['366'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['370'] = [];
  _$jscoverage['/dialog.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['370'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['370'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['378'] = [];
  _$jscoverage['/dialog.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['380'] = [];
  _$jscoverage['/dialog.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['392'] = [];
  _$jscoverage['/dialog.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['395'] = [];
  _$jscoverage['/dialog.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['398'] = [];
  _$jscoverage['/dialog.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['410'] = [];
  _$jscoverage['/dialog.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['410'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['414'] = [];
  _$jscoverage['/dialog.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['419'] = [];
  _$jscoverage['/dialog.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['424'] = [];
  _$jscoverage['/dialog.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['425'] = [];
  _$jscoverage['/dialog.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['434'] = [];
  _$jscoverage['/dialog.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['435'] = [];
  _$jscoverage['/dialog.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['439'] = [];
  _$jscoverage['/dialog.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['442'] = [];
  _$jscoverage['/dialog.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['455'] = [];
  _$jscoverage['/dialog.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['456'] = [];
  _$jscoverage['/dialog.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['457'] = [];
  _$jscoverage['/dialog.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['477'] = [];
  _$jscoverage['/dialog.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['480'] = [];
  _$jscoverage['/dialog.js'].branchData['480'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['480'][1].init(205, 13, 'self.imgAlign');
function visit71_480_1(result) {
  _$jscoverage['/dialog.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['477'][1].init(108, 18, 'self.loadingCancel');
function visit70_477_1(result) {
  _$jscoverage['/dialog.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['457'][1].init(141, 31, 'link.attr("target") == "_blank"');
function visit69_457_1(result) {
  _$jscoverage['/dialog.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['456'][1].init(40, 48, 'link.attr("_ke_saved_href") || link.attr("href")');
function visit68_456_1(result) {
  _$jscoverage['/dialog.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['455'][1].init(2195, 4, 'link');
function visit67_455_1(result) {
  _$jscoverage['/dialog.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['442'][1].init(503, 47, 'self.tab.get(\'bar\').get(\'children\').length == 2');
function visit66_442_1(result) {
  _$jscoverage['/dialog.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['439'][1].init(383, 26, 'defaultMargin == undefined');
function visit65_439_1(result) {
  _$jscoverage['/dialog.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['435'][1].init(212, 9, 'inElement');
function visit64_435_1(result) {
  _$jscoverage['/dialog.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['434'][1].init(136, 54, 'editorSelection && editorSelection.getCommonAncestor()');
function visit63_434_1(result) {
  _$jscoverage['/dialog.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['425'][1].init(625, 61, 'parseInt(selectedEl.style("margin")) || 0');
function visit62_425_1(result) {
  _$jscoverage['/dialog.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['424'][1].init(558, 35, 'selectedEl.style("float") || "none"');
function visit61_424_1(result) {
  _$jscoverage['/dialog.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['419'][1].init(372, 1, 'w');
function visit60_419_1(result) {
  _$jscoverage['/dialog.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['414'][1].init(207, 1, 'h');
function visit59_414_1(result) {
  _$jscoverage['/dialog.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['410'][2].init(206, 33, 'self.imageCfg[\'remote\'] !== false');
function visit58_410_2(result) {
  _$jscoverage['/dialog.js'].branchData['410'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['410'][1].init(192, 47, 'selectedEl && self.imageCfg[\'remote\'] !== false');
function visit57_410_1(result) {
  _$jscoverage['/dialog.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['398'][1].init(1875, 5, '!skip');
function visit56_398_1(result) {
  _$jscoverage['/dialog.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['395'][1].init(1740, 15, 'self.selectedEl');
function visit55_395_1(result) {
  _$jscoverage['/dialog.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['392'][1].init(1645, 2, 'bs');
function visit54_392_1(result) {
  _$jscoverage['/dialog.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['380'][1].init(65, 16, '!self.selectedEl');
function visit53_380_1(result) {
  _$jscoverage['/dialog.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['378'][1].init(1096, 16, '!skip && linkVal');
function visit52_378_1(result) {
  _$jscoverage['/dialog.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['370'][3].init(285, 22, 'next.nodeName() == \'a\'');
function visit51_370_3(result) {
  _$jscoverage['/dialog.js'].branchData['370'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['370'][2].init(285, 55, '(next.nodeName() == \'a\') && !(next[0].childNodes.length)');
function visit50_370_2(result) {
  _$jscoverage['/dialog.js'].branchData['370'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['370'][1].init(262, 78, '(next = img.next()) && (next.nodeName() == \'a\') && !(next[0].childNodes.length)');
function visit49_370_1(result) {
  _$jscoverage['/dialog.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['366'][3].init(104, 22, 'prev.nodeName() == \'a\'');
function visit48_366_3(result) {
  _$jscoverage['/dialog.js'].branchData['366'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['366'][2].init(104, 55, '(prev.nodeName() == \'a\') && !(prev[0].childNodes.length)');
function visit47_366_2(result) {
  _$jscoverage['/dialog.js'].branchData['366'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['366'][1].init(81, 78, '(prev = img.prev()) && (prev.nodeName() == \'a\') && !(prev[0].childNodes.length)');
function visit46_366_1(result) {
  _$jscoverage['/dialog.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['364'][3].init(122, 20, 'linkTarget != target');
function visit45_364_3(result) {
  _$jscoverage['/dialog.js'].branchData['364'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['364'][2].init(90, 28, 'linkVal != link.attr(\'href\')');
function visit44_364_2(result) {
  _$jscoverage['/dialog.js'].branchData['364'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['364'][1].init(90, 52, 'linkVal != link.attr(\'href\') || linkTarget != target');
function visit43_364_1(result) {
  _$jscoverage['/dialog.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['363'][1].init(34, 30, 'link.attr(\'target\') || "_self"');
function visit42_363_1(result) {
  _$jscoverage['/dialog.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['362'][1].init(407, 4, 'link');
function visit41_362_1(result) {
  _$jscoverage['/dialog.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['326'][1].init(985, 15, 'self.selectedEl');
function visit40_326_1(result) {
  _$jscoverage['/dialog.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['315'][2].init(669, 11, 'margin != 0');
function visit39_315_2(result) {
  _$jscoverage['/dialog.js'].branchData['315'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['315'][1].init(651, 29, '!isNaN(margin) && margin != 0');
function visit38_315_1(result) {
  _$jscoverage['/dialog.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['312'][1].init(553, 15, 'align != \'none\'');
function visit37_312_1(result) {
  _$jscoverage['/dialog.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['309'][1].init(463, 5, 'width');
function visit36_309_1(result) {
  _$jscoverage['/dialog.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['306'][1].init(370, 6, 'height');
function visit35_306_1(result) {
  _$jscoverage['/dialog.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['285'][1].init(1685, 33, 'self.imageCfg[\'remote\'] === false');
function visit34_285_1(result) {
  _$jscoverage['/dialog.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['269'][1].init(937, 9, 'sizeLimit');
function visit33_269_1(result) {
  _$jscoverage['/dialog.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['267'][1].init(443, 35, 'self.cfg[\'fileInput\'] || "Filedata"');
function visit32_267_1(result) {
  _$jscoverage['/dialog.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['254'][1].init(92, 33, 'self.cfg && self.cfg[\'sizeLimit\']');
function visit31_254_1(result) {
  _$jscoverage['/dialog.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['249'][1].init(21, 21, 'self.cfg[\'extraHTML\']');
function visit30_249_1(result) {
  _$jscoverage['/dialog.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['248'][1].init(7748, 8, 'self.cfg');
function visit29_248_1(result) {
  _$jscoverage['/dialog.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['242'][1].init(25, 35, '!verifyInputs(content.all("input"))');
function visit28_242_1(result) {
  _$jscoverage['/dialog.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['219'][1].init(504, 10, 'data.error');
function visit27_219_1(result) {
  _$jscoverage['/dialog.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['216'][1].init(372, 5, '!data');
function visit26_216_1(result) {
  _$jscoverage['/dialog.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['213'][1].init(249, 17, 'status == "abort"');
function visit25_213_1(result) {
  _$jscoverage['/dialog.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['196'][1].init(1159, 55, 'Editor.Utils.normParams(self.cfg[\'serverParams\']) || {}');
function visit24_196_1(result) {
  _$jscoverage['/dialog.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['183'][2].init(729, 25, 'sizeLimit < (size / 1000)');
function visit23_183_2(result) {
  _$jscoverage['/dialog.js'].branchData['183'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['183'][1].init(716, 38, 'sizeLimit && sizeLimit < (size / 1000)');
function visit22_183_1(result) {
  _$jscoverage['/dialog.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['173'][1].init(313, 45, '!self.suffix_reg.test(self.imgLocalUrl.val())');
function visit21_173_1(result) {
  _$jscoverage['/dialog.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['168'][1].init(155, 33, 'self.imgLocalUrl.val() == warning');
function visit20_168_1(result) {
  _$jscoverage['/dialog.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['164'][1].init(26, 46, '!verifyInputs(commonSettingTable.all("input"))');
function visit19_164_1(result) {
  _$jscoverage['/dialog.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['161'][1].init(56, 61, 'S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) == 1');
function visit18_161_1(result) {
  _$jscoverage['/dialog.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['160'][3].init(49, 33, 'self.imageCfg[\'remote\'] === false');
function visit17_160_3(result) {
  _$jscoverage['/dialog.js'].branchData['160'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['160'][2].init(49, 118, 'self.imageCfg[\'remote\'] === false || S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) == 1');
function visit16_160_2(result) {
  _$jscoverage['/dialog.js'].branchData['160'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['160'][1].init(49, 151, '(self.imageCfg[\'remote\'] === false || S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) == 1) && self.cfg');
function visit15_160_1(result) {
  _$jscoverage['/dialog.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['146'][1].init(116, 5, '1 > 2');
function visit14_146_1(result) {
  _$jscoverage['/dialog.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['144'][1].init(21, 13, 'file[\'files\']');
function visit13_144_1(result) {
  _$jscoverage['/dialog.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['122'][1].init(48, 48, 'self.imgRatio[0].disabled || !self.imgRatioValue');
function visit12_122_1(result) {
  _$jscoverage['/dialog.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['121'][2].init(86, 97, '!self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit11_121_2(result) {
  _$jscoverage['/dialog.js'].branchData['121'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['121'][1].init(80, 103, '!v || !self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit10_121_1(result) {
  _$jscoverage['/dialog.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['113'][1].init(48, 48, 'self.imgRatio[0].disabled || !self.imgRatioValue');
function visit9_113_1(result) {
  _$jscoverage['/dialog.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['112'][2].init(87, 97, '!self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit8_112_2(result) {
  _$jscoverage['/dialog.js'].branchData['112'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['112'][1].init(81, 103, '!v || !self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit7_112_1(result) {
  _$jscoverage['/dialog.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['54'][2].init(168, 30, 'self.cfg && self.cfg["suffix"]');
function visit6_54_2(result) {
  _$jscoverage['/dialog.js'].branchData['54'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['54'][1].init(168, 52, 'self.cfg && self.cfg["suffix"] || "png,jpg,jpeg,gif"');
function visit5_54_1(result) {
  _$jscoverage['/dialog.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['53'][1].init(113, 31, 'self.imageCfg["upload"] || null');
function visit4_53_1(result) {
  _$jscoverage['/dialog.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['52'][1].init(80, 12, 'config || {}');
function visit3_52_1(result) {
  _$jscoverage['/dialog.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['41'][1].init(129, 41, 'dtd.$block[name] || dtd.$blockLimit[name]');
function visit2_41_1(result) {
  _$jscoverage['/dialog.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['38'][1].init(56, 11, 'name == "a"');
function visit1_38_1(result) {
  _$jscoverage['/dialog.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/dialog.js'].lineData[8]++;
  var IO = require('io');
  _$jscoverage['/dialog.js'].lineData[9]++;
  var Dialog4E = require('../dialog');
  _$jscoverage['/dialog.js'].lineData[10]++;
  var Tabs = require('tabs');
  _$jscoverage['/dialog.js'].lineData[11]++;
  var MenuButton = require('../menubutton');
  _$jscoverage['/dialog.js'].lineData[12]++;
  var bodyTpl = require('./dialog/dialog-tpl');
  _$jscoverage['/dialog.js'].lineData[13]++;
  var dtd = Editor.XHTML_DTD, UA = S.UA, Node = KISSY.NodeList, HTTP_TIP = "http://", AUTOMATIC_TIP = "\u81ea\u52a8", MARGIN_DEFAULT = 10, IMAGE_DIALOG_BODY_HTML = bodyTpl, IMAGE_DIALOG_FOOT_HTML = "<div style='padding:5px 20px 20px;'>" + "<a " + "href='javascript:void('\u786e\u5b9a')' " + "class='{prefixCls}img-insert {prefixCls}button ks-inline-block' " + "style='margin-right:30px;'>\u786e\u5b9a</a> " + "<a  " + "href='javascript:void('\u53d6\u6d88')' " + "class='{prefixCls}img-cancel {prefixCls}button ks-inline-block'>\u53d6\u6d88</a></div>", warning = "\u8bf7\u70b9\u51fb\u6d4f\u89c8\u4e0a\u4f20\u56fe\u7247", valInput = Editor.Utils.valInput;
  _$jscoverage['/dialog.js'].lineData[34]++;
  function findAWithImg(img) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[35]++;
    var ret = img;
    _$jscoverage['/dialog.js'].lineData[36]++;
    while (ret) {
      _$jscoverage['/dialog.js'].lineData[37]++;
      var name = ret.nodeName();
      _$jscoverage['/dialog.js'].lineData[38]++;
      if (visit1_38_1(name == "a")) {
        _$jscoverage['/dialog.js'].lineData[39]++;
        return ret;
      }
      _$jscoverage['/dialog.js'].lineData[41]++;
      if (visit2_41_1(dtd.$block[name] || dtd.$blockLimit[name])) {
        _$jscoverage['/dialog.js'].lineData[42]++;
        return null;
      }
      _$jscoverage['/dialog.js'].lineData[44]++;
      ret = ret.parent();
    }
    _$jscoverage['/dialog.js'].lineData[46]++;
    return null;
  }
  _$jscoverage['/dialog.js'].lineData[49]++;
  function ImageDialog(editor, config) {
    _$jscoverage['/dialog.js'].functionData[2]++;
    _$jscoverage['/dialog.js'].lineData[50]++;
    var self = this;
    _$jscoverage['/dialog.js'].lineData[51]++;
    self.editor = editor;
    _$jscoverage['/dialog.js'].lineData[52]++;
    self.imageCfg = visit3_52_1(config || {});
    _$jscoverage['/dialog.js'].lineData[53]++;
    self.cfg = visit4_53_1(self.imageCfg["upload"] || null);
    _$jscoverage['/dialog.js'].lineData[54]++;
    self.suffix = visit5_54_1(visit6_54_2(self.cfg && self.cfg["suffix"]) || "png,jpg,jpeg,gif");
    _$jscoverage['/dialog.js'].lineData[56]++;
    self.suffix_reg = new RegExp(self.suffix.split(/,/).join("|") + "$", "i");
    _$jscoverage['/dialog.js'].lineData[57]++;
    self.suffix_warning = "\u53ea\u5141\u8bb8\u540e\u7f00\u540d\u4e3a" + self.suffix + "\u7684\u56fe\u7247";
  }
  _$jscoverage['/dialog.js'].lineData[60]++;
  S.augment(ImageDialog, {
  _prepare: function() {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[62]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[63]++;
  var editor = self.editor, prefixCls = editor.get('prefixCls') + 'editor-';
  _$jscoverage['/dialog.js'].lineData[65]++;
  self.dialog = self.d = new Dialog4E({
  width: 500, 
  headerContent: "\u56fe\u7247", 
  bodyContent: S.substitute(IMAGE_DIALOG_BODY_HTML, {
  prefixCls: prefixCls}), 
  footerContent: S.substitute(IMAGE_DIALOG_FOOT_HTML, {
  prefixCls: prefixCls}), 
  mask: true}).render();
  _$jscoverage['/dialog.js'].lineData[77]++;
  var content = self.d.get("el"), cancel = content.one("." + prefixCls + "img-cancel"), ok = content.one("." + prefixCls + "img-insert"), verifyInputs = Editor.Utils.verifyInputs, commonSettingTable = content.one("." + prefixCls + "img-setting");
  _$jscoverage['/dialog.js'].lineData[82]++;
  self.uploadForm = content.one("." + prefixCls + "img-upload-form");
  _$jscoverage['/dialog.js'].lineData[83]++;
  self.imgLocalUrl = content.one("." + prefixCls + "img-local-url");
  _$jscoverage['/dialog.js'].lineData[84]++;
  self.tab = new Tabs({
  "srcNode": self.d.get("body").one('.' + prefixCls + 'img-tabs'), 
  prefixCls: prefixCls + 'img-'}).render();
  _$jscoverage['/dialog.js'].lineData[88]++;
  self.imgLocalUrl.val(warning);
  _$jscoverage['/dialog.js'].lineData[89]++;
  self.imgUrl = content.one("." + prefixCls + "img-url");
  _$jscoverage['/dialog.js'].lineData[90]++;
  self.imgHeight = content.one("." + prefixCls + "img-height");
  _$jscoverage['/dialog.js'].lineData[91]++;
  self.imgWidth = content.one("." + prefixCls + "img-width");
  _$jscoverage['/dialog.js'].lineData[92]++;
  self.imgRatio = content.one("." + prefixCls + "img-ratio");
  _$jscoverage['/dialog.js'].lineData[93]++;
  self.imgAlign = MenuButton.Select.decorate(content.one("." + prefixCls + "img-align"), {
  prefixCls: prefixCls + 'big-', 
  width: 80, 
  menuCfg: {
  prefixCls: prefixCls + '', 
  render: content}});
  _$jscoverage['/dialog.js'].lineData[101]++;
  self.imgMargin = content.one("." + prefixCls + "img-margin");
  _$jscoverage['/dialog.js'].lineData[102]++;
  self.imgLink = content.one("." + prefixCls + "img-link");
  _$jscoverage['/dialog.js'].lineData[103]++;
  self.imgLinkBlank = content.one("." + prefixCls + "img-link-blank");
  _$jscoverage['/dialog.js'].lineData[104]++;
  var placeholder = Editor.Utils.placeholder;
  _$jscoverage['/dialog.js'].lineData[105]++;
  placeholder(self.imgUrl, HTTP_TIP);
  _$jscoverage['/dialog.js'].lineData[106]++;
  placeholder(self.imgHeight, AUTOMATIC_TIP);
  _$jscoverage['/dialog.js'].lineData[107]++;
  placeholder(self.imgWidth, AUTOMATIC_TIP);
  _$jscoverage['/dialog.js'].lineData[108]++;
  placeholder(self.imgLink, "http://");
  _$jscoverage['/dialog.js'].lineData[110]++;
  self.imgHeight.on("keyup", function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[111]++;
  var v = parseInt(valInput(self.imgHeight));
  _$jscoverage['/dialog.js'].lineData[112]++;
  if (visit7_112_1(!v || visit8_112_2(!self.imgRatio[0].checked || visit9_113_1(self.imgRatio[0].disabled || !self.imgRatioValue)))) {
    _$jscoverage['/dialog.js'].lineData[114]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[116]++;
  valInput(self.imgWidth, Math.floor(v * self.imgRatioValue));
});
  _$jscoverage['/dialog.js'].lineData[119]++;
  self.imgWidth.on("keyup", function() {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[120]++;
  var v = parseInt(valInput(self.imgWidth));
  _$jscoverage['/dialog.js'].lineData[121]++;
  if (visit10_121_1(!v || visit11_121_2(!self.imgRatio[0].checked || visit12_122_1(self.imgRatio[0].disabled || !self.imgRatioValue)))) {
    _$jscoverage['/dialog.js'].lineData[123]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[125]++;
  valInput(self.imgHeight, Math.floor(v / self.imgRatioValue));
});
  _$jscoverage['/dialog.js'].lineData[128]++;
  cancel.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[129]++;
  self.d.hide();
  _$jscoverage['/dialog.js'].lineData[130]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[133]++;
  var loadingCancel = new Node("<a class='" + prefixCls + "button ks-inline-block' " + "style='position:absolute;" + "z-index:" + Editor.baseZIndex(Editor.ZIndexManager.LOADING_CANCEL) + ";" + "left:-9999px;" + "top:-9999px;" + "'>\u53d6\u6d88\u4e0a\u4f20</a>").appendTo(document.body, undefined);
  _$jscoverage['/dialog.js'].lineData[141]++;
  self.loadingCancel = loadingCancel;
  _$jscoverage['/dialog.js'].lineData[143]++;
  function getFileSize(file) {
    _$jscoverage['/dialog.js'].functionData[7]++;
    _$jscoverage['/dialog.js'].lineData[144]++;
    if (visit13_144_1(file['files'])) {
      _$jscoverage['/dialog.js'].lineData[145]++;
      return file['files'][0].size;
    } else {
      _$jscoverage['/dialog.js'].lineData[146]++;
      if (visit14_146_1(1 > 2)) {
        _$jscoverage['/dialog.js'].lineData[148]++;
        try {
          _$jscoverage['/dialog.js'].lineData[149]++;
          var fso = new ActiveXObject("Scripting.FileSystemObject"), file2 = fso['GetFile'](file.value);
          _$jscoverage['/dialog.js'].lineData[151]++;
          return file2.size;
        }        catch (e) {
}
      }
    }
    _$jscoverage['/dialog.js'].lineData[155]++;
    return 0;
  }
  _$jscoverage['/dialog.js'].lineData[158]++;
  ok.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[159]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[160]++;
  if (visit15_160_1((visit16_160_2(visit17_160_3(self.imageCfg['remote'] === false) || visit18_161_1(S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) == 1))) && self.cfg)) {
    _$jscoverage['/dialog.js'].lineData[164]++;
    if (visit19_164_1(!verifyInputs(commonSettingTable.all("input")))) {
      _$jscoverage['/dialog.js'].lineData[165]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[168]++;
    if (visit20_168_1(self.imgLocalUrl.val() == warning)) {
      _$jscoverage['/dialog.js'].lineData[169]++;
      alert("\u8bf7\u5148\u9009\u62e9\u6587\u4ef6!");
      _$jscoverage['/dialog.js'].lineData[170]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[173]++;
    if (visit21_173_1(!self.suffix_reg.test(self.imgLocalUrl.val()))) {
      _$jscoverage['/dialog.js'].lineData[174]++;
      alert(self.suffix_warning);
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
    if (visit22_183_1(sizeLimit && visit23_183_2(sizeLimit < (size / 1000)))) {
      _$jscoverage['/dialog.js'].lineData[184]++;
      alert("\u4e0a\u4f20\u56fe\u7247\u6700\u5927\uff1a" + sizeLimit / 1000 + "M");
      _$jscoverage['/dialog.js'].lineData[185]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[188]++;
    self.d.loading();
    _$jscoverage['/dialog.js'].lineData[191]++;
    loadingCancel.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[9]++;
  _$jscoverage['/dialog.js'].lineData[192]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[193]++;
  uploadIO.abort();
});
    _$jscoverage['/dialog.js'].lineData[196]++;
    var serverParams = visit24_196_1(Editor.Utils.normParams(self.cfg['serverParams']) || {});
    _$jscoverage['/dialog.js'].lineData[199]++;
    serverParams['document-domain'] = document.domain;
    _$jscoverage['/dialog.js'].lineData[201]++;
    var uploadIO = IO({
  data: serverParams, 
  url: self.cfg['serverUrl'], 
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
  if (visit25_213_1(status == "abort")) {
    _$jscoverage['/dialog.js'].lineData[214]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[216]++;
  if (visit26_216_1(!data)) {
    _$jscoverage['/dialog.js'].lineData[217]++;
    data = {
  error: "\u670d\u52a1\u5668\u51fa\u9519\uff0c\u8bf7\u91cd\u8bd5"};
  }
  _$jscoverage['/dialog.js'].lineData[219]++;
  if (visit27_219_1(data.error)) {
    _$jscoverage['/dialog.js'].lineData[220]++;
    alert(data.error);
    _$jscoverage['/dialog.js'].lineData[221]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[223]++;
  valInput(self.imgUrl, data['imgUrl']);
  _$jscoverage['/dialog.js'].lineData[226]++;
  new Image().src = data['imgUrl'];
  _$jscoverage['/dialog.js'].lineData[227]++;
  self._insert();
}});
    _$jscoverage['/dialog.js'].lineData[231]++;
    var loadingMaskEl = self.d.get("el"), offset = loadingMaskEl.offset(), width = loadingMaskEl[0].offsetWidth, height = loadingMaskEl[0].offsetHeight;
    _$jscoverage['/dialog.js'].lineData[236]++;
    loadingCancel.css({
  left: (offset.left + width / 2.5), 
  top: (offset.top + height / 1.5)});
  } else {
    _$jscoverage['/dialog.js'].lineData[242]++;
    if (visit28_242_1(!verifyInputs(content.all("input")))) {
      _$jscoverage['/dialog.js'].lineData[243]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[244]++;
    self._insert();
  }
});
  _$jscoverage['/dialog.js'].lineData[248]++;
  if (visit29_248_1(self.cfg)) {
    _$jscoverage['/dialog.js'].lineData[249]++;
    if (visit30_249_1(self.cfg['extraHTML'])) {
      _$jscoverage['/dialog.js'].lineData[251]++;
      content.one("." + prefixCls + "img-up-extraHTML").html(self.cfg['extraHTML']);
    }
    _$jscoverage['/dialog.js'].lineData[253]++;
    var ke_image_up = content.one("." + prefixCls + "image-up"), sizeLimit = visit31_254_1(self.cfg && self.cfg['sizeLimit']);
    _$jscoverage['/dialog.js'].lineData[256]++;
    self.fileInput = new Node("<input " + "type='file' " + "style='position:absolute;" + "cursor:pointer;" + "left:" + (UA['ie'] ? "360" : (UA["chrome"] ? "319" : "369")) + "px;" + "z-index:2;" + "top:0px;" + "height:26px;' " + "size='1' " + "name='" + (visit32_267_1(self.cfg['fileInput'] || "Filedata")) + "'/>").insertAfter(self.imgLocalUrl);
    _$jscoverage['/dialog.js'].lineData[269]++;
    if (visit33_269_1(sizeLimit)) {
      _$jscoverage['/dialog.js'].lineData[270]++;
      warning = "\u5355\u5f20\u56fe\u7247\u5bb9\u91cf\u4e0d\u8d85\u8fc7 " + (sizeLimit / 1000) + " M";
    }
    _$jscoverage['/dialog.js'].lineData[271]++;
    self.imgLocalUrl.val(warning);
    _$jscoverage['/dialog.js'].lineData[272]++;
    self.fileInput.css("opacity", 0);
    _$jscoverage['/dialog.js'].lineData[273]++;
    self.fileInput.on("mouseenter", function() {
  _$jscoverage['/dialog.js'].functionData[11]++;
  _$jscoverage['/dialog.js'].lineData[274]++;
  ke_image_up.addClass("" + prefixCls + "button-hover");
});
    _$jscoverage['/dialog.js'].lineData[276]++;
    self.fileInput.on("mouseleave", function() {
  _$jscoverage['/dialog.js'].functionData[12]++;
  _$jscoverage['/dialog.js'].lineData[277]++;
  ke_image_up.removeClass("" + prefixCls + "button-hover");
});
    _$jscoverage['/dialog.js'].lineData[279]++;
    self.fileInput.on("change", function() {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[280]++;
  var file = self.fileInput.val();
  _$jscoverage['/dialog.js'].lineData[282]++;
  self.imgLocalUrl.val(file.replace(/.+[\/\\]/, ""));
});
    _$jscoverage['/dialog.js'].lineData[285]++;
    if (visit34_285_1(self.imageCfg['remote'] === false)) {
      _$jscoverage['/dialog.js'].lineData[286]++;
      self.tab.removeItemAt(0, 1);
    }
  } else {
    _$jscoverage['/dialog.js'].lineData[290]++;
    self.tab.removeItemAt(1, 1);
  }
  _$jscoverage['/dialog.js'].lineData[293]++;
  self._prepare = S.noop;
}, 
  _insert: function() {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[297]++;
  var self = this, url = valInput(self.imgUrl), img, height = parseInt(valInput(self.imgHeight)), width = parseInt(valInput(self.imgWidth)), align = self.imgAlign.get("value"), margin = parseInt(self.imgMargin.val()), style = '';
  _$jscoverage['/dialog.js'].lineData[306]++;
  if (visit35_306_1(height)) {
    _$jscoverage['/dialog.js'].lineData[307]++;
    style += "height:" + height + "px;";
  }
  _$jscoverage['/dialog.js'].lineData[309]++;
  if (visit36_309_1(width)) {
    _$jscoverage['/dialog.js'].lineData[310]++;
    style += "width:" + width + "px;";
  }
  _$jscoverage['/dialog.js'].lineData[312]++;
  if (visit37_312_1(align != 'none')) {
    _$jscoverage['/dialog.js'].lineData[313]++;
    style += "float:" + align + ";";
  }
  _$jscoverage['/dialog.js'].lineData[315]++;
  if (visit38_315_1(!isNaN(margin) && visit39_315_2(margin != 0))) {
    _$jscoverage['/dialog.js'].lineData[316]++;
    style += "margin:" + margin + "px;";
  }
  _$jscoverage['/dialog.js'].lineData[319]++;
  self.d.hide();
  _$jscoverage['/dialog.js'].lineData[326]++;
  if (visit40_326_1(self.selectedEl)) {
    _$jscoverage['/dialog.js'].lineData[327]++;
    img = self.selectedEl;
    _$jscoverage['/dialog.js'].lineData[328]++;
    self.editor.execCommand("save");
    _$jscoverage['/dialog.js'].lineData[329]++;
    self.selectedEl.attr({
  "src": url, 
  "_ke_saved_src": url, 
  "style": style});
  } else {
    _$jscoverage['/dialog.js'].lineData[336]++;
    img = new Node("<img " + (style ? ("style='" + style + "'") : "") + " src='" + url + "' " + "_ke_saved_src='" + url + "' alt='' />", null, self.editor.get("document")[0]);
    _$jscoverage['/dialog.js'].lineData[346]++;
    self.editor.insertElement(img);
  }
  _$jscoverage['/dialog.js'].lineData[351]++;
  setTimeout(function() {
  _$jscoverage['/dialog.js'].functionData[15]++;
  _$jscoverage['/dialog.js'].lineData[352]++;
  var link = findAWithImg(img), linkVal = S.trim(valInput(self.imgLink)), sel = self.editor.getSelection(), target = self.imgLinkBlank.attr("checked") ? "_blank" : "_self", linkTarget, skip = 0, prev, next, bs;
  _$jscoverage['/dialog.js'].lineData[362]++;
  if (visit41_362_1(link)) {
    _$jscoverage['/dialog.js'].lineData[363]++;
    linkTarget = visit42_363_1(link.attr('target') || "_self");
    _$jscoverage['/dialog.js'].lineData[364]++;
    if (visit43_364_1(visit44_364_2(linkVal != link.attr('href')) || visit45_364_3(linkTarget != target))) {
      _$jscoverage['/dialog.js'].lineData[365]++;
      img._4e_breakParent(link);
      _$jscoverage['/dialog.js'].lineData[366]++;
      if (visit46_366_1((prev = img.prev()) && visit47_366_2((visit48_366_3(prev.nodeName() == 'a')) && !(prev[0].childNodes.length)))) {
        _$jscoverage['/dialog.js'].lineData[367]++;
        prev.remove();
      }
      _$jscoverage['/dialog.js'].lineData[370]++;
      if (visit49_370_1((next = img.next()) && visit50_370_2((visit51_370_3(next.nodeName() == 'a')) && !(next[0].childNodes.length)))) {
        _$jscoverage['/dialog.js'].lineData[371]++;
        next.remove();
      }
    } else {
      _$jscoverage['/dialog.js'].lineData[374]++;
      skip = 1;
    }
  }
  _$jscoverage['/dialog.js'].lineData[378]++;
  if (visit52_378_1(!skip && linkVal)) {
    _$jscoverage['/dialog.js'].lineData[380]++;
    if (visit53_380_1(!self.selectedEl)) {
      _$jscoverage['/dialog.js'].lineData[381]++;
      bs = sel.createBookmarks();
    }
    _$jscoverage['/dialog.js'].lineData[383]++;
    link = new Node("<a></a>");
    _$jscoverage['/dialog.js'].lineData[386]++;
    link.attr("_ke_saved_href", linkVal).attr("href", linkVal).attr("target", target);
    _$jscoverage['/dialog.js'].lineData[387]++;
    var t = img[0];
    _$jscoverage['/dialog.js'].lineData[388]++;
    t.parentNode.replaceChild(link[0], t);
    _$jscoverage['/dialog.js'].lineData[389]++;
    link.append(t);
  }
  _$jscoverage['/dialog.js'].lineData[392]++;
  if (visit54_392_1(bs)) {
    _$jscoverage['/dialog.js'].lineData[393]++;
    sel.selectBookmarks(bs);
  } else {
    _$jscoverage['/dialog.js'].lineData[395]++;
    if (visit55_395_1(self.selectedEl)) {
      _$jscoverage['/dialog.js'].lineData[396]++;
      self.editor.getSelection().selectElement(self.selectedEl);
    }
  }
  _$jscoverage['/dialog.js'].lineData[398]++;
  if (visit56_398_1(!skip)) {
    _$jscoverage['/dialog.js'].lineData[399]++;
    self.editor.execCommand("save");
  }
}, 100);
}, 
  _update: function(selectedEl) {
  _$jscoverage['/dialog.js'].functionData[16]++;
  _$jscoverage['/dialog.js'].lineData[405]++;
  var self = this, active = 0, link, resetInput = Editor.Utils.resetInput;
  _$jscoverage['/dialog.js'].lineData[409]++;
  self.selectedEl = selectedEl;
  _$jscoverage['/dialog.js'].lineData[410]++;
  if (visit57_410_1(selectedEl && visit58_410_2(self.imageCfg['remote'] !== false))) {
    _$jscoverage['/dialog.js'].lineData[411]++;
    valInput(self.imgUrl, selectedEl.attr("src"));
    _$jscoverage['/dialog.js'].lineData[412]++;
    var w = parseInt(selectedEl.style("width")), h = parseInt(selectedEl.style("height"));
    _$jscoverage['/dialog.js'].lineData[414]++;
    if (visit59_414_1(h)) {
      _$jscoverage['/dialog.js'].lineData[415]++;
      valInput(self.imgHeight, h);
    } else {
      _$jscoverage['/dialog.js'].lineData[417]++;
      resetInput(self.imgHeight);
    }
    _$jscoverage['/dialog.js'].lineData[419]++;
    if (visit60_419_1(w)) {
      _$jscoverage['/dialog.js'].lineData[420]++;
      valInput(self.imgWidth, w);
    } else {
      _$jscoverage['/dialog.js'].lineData[422]++;
      resetInput(self.imgWidth);
    }
    _$jscoverage['/dialog.js'].lineData[424]++;
    self.imgAlign.set("value", visit61_424_1(selectedEl.style("float") || "none"));
    _$jscoverage['/dialog.js'].lineData[425]++;
    var margin = visit62_425_1(parseInt(selectedEl.style("margin")) || 0);
    _$jscoverage['/dialog.js'].lineData[427]++;
    self.imgMargin.val(margin);
    _$jscoverage['/dialog.js'].lineData[428]++;
    self.imgRatio[0].disabled = false;
    _$jscoverage['/dialog.js'].lineData[429]++;
    self.imgRatioValue = w / h;
    _$jscoverage['/dialog.js'].lineData[430]++;
    link = findAWithImg(selectedEl);
  } else {
    _$jscoverage['/dialog.js'].lineData[432]++;
    var editor = self.editor;
    _$jscoverage['/dialog.js'].lineData[433]++;
    var editorSelection = editor.getSelection();
    _$jscoverage['/dialog.js'].lineData[434]++;
    var inElement = visit63_434_1(editorSelection && editorSelection.getCommonAncestor());
    _$jscoverage['/dialog.js'].lineData[435]++;
    if (visit64_435_1(inElement)) {
      _$jscoverage['/dialog.js'].lineData[436]++;
      link = findAWithImg(inElement);
    }
    _$jscoverage['/dialog.js'].lineData[438]++;
    var defaultMargin = self.imageCfg['defaultMargin'];
    _$jscoverage['/dialog.js'].lineData[439]++;
    if (visit65_439_1(defaultMargin == undefined)) {
      _$jscoverage['/dialog.js'].lineData[440]++;
      defaultMargin = MARGIN_DEFAULT;
    }
    _$jscoverage['/dialog.js'].lineData[442]++;
    if (visit66_442_1(self.tab.get('bar').get('children').length == 2)) {
      _$jscoverage['/dialog.js'].lineData[443]++;
      active = 1;
    }
    _$jscoverage['/dialog.js'].lineData[445]++;
    self.imgLinkBlank.attr("checked", true);
    _$jscoverage['/dialog.js'].lineData[446]++;
    resetInput(self.imgUrl);
    _$jscoverage['/dialog.js'].lineData[447]++;
    resetInput(self.imgLink);
    _$jscoverage['/dialog.js'].lineData[448]++;
    resetInput(self.imgHeight);
    _$jscoverage['/dialog.js'].lineData[449]++;
    resetInput(self.imgWidth);
    _$jscoverage['/dialog.js'].lineData[450]++;
    self.imgAlign.set("value", "none");
    _$jscoverage['/dialog.js'].lineData[451]++;
    self.imgMargin.val(defaultMargin);
    _$jscoverage['/dialog.js'].lineData[452]++;
    self.imgRatio[0].disabled = true;
    _$jscoverage['/dialog.js'].lineData[453]++;
    self.imgRatioValue = null;
  }
  _$jscoverage['/dialog.js'].lineData[455]++;
  if (visit67_455_1(link)) {
    _$jscoverage['/dialog.js'].lineData[456]++;
    valInput(self.imgLink, visit68_456_1(link.attr("_ke_saved_href") || link.attr("href")));
    _$jscoverage['/dialog.js'].lineData[457]++;
    self.imgLinkBlank.attr("checked", visit69_457_1(link.attr("target") == "_blank"));
  } else {
    _$jscoverage['/dialog.js'].lineData[459]++;
    resetInput(self.imgLink);
    _$jscoverage['/dialog.js'].lineData[460]++;
    self.imgLinkBlank.attr("checked", true);
  }
  _$jscoverage['/dialog.js'].lineData[462]++;
  self.uploadForm[0].reset();
  _$jscoverage['/dialog.js'].lineData[463]++;
  self.imgLocalUrl.val(warning);
  _$jscoverage['/dialog.js'].lineData[464]++;
  var tab = self.tab;
  _$jscoverage['/dialog.js'].lineData[465]++;
  tab.setSelectedTab(tab.getTabAt(active));
}, 
  show: function(_selectedEl) {
  _$jscoverage['/dialog.js'].functionData[17]++;
  _$jscoverage['/dialog.js'].lineData[468]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[469]++;
  self._prepare();
  _$jscoverage['/dialog.js'].lineData[470]++;
  self._update(_selectedEl);
  _$jscoverage['/dialog.js'].lineData[471]++;
  self.d.show();
}, 
  destroy: function() {
  _$jscoverage['/dialog.js'].functionData[18]++;
  _$jscoverage['/dialog.js'].lineData[474]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[475]++;
  self.d.destroy();
  _$jscoverage['/dialog.js'].lineData[476]++;
  self.tab.destroy();
  _$jscoverage['/dialog.js'].lineData[477]++;
  if (visit70_477_1(self.loadingCancel)) {
    _$jscoverage['/dialog.js'].lineData[478]++;
    self.loadingCancel.remove();
  }
  _$jscoverage['/dialog.js'].lineData[480]++;
  if (visit71_480_1(self.imgAlign)) {
    _$jscoverage['/dialog.js'].lineData[481]++;
    self.imgAlign.destroy();
  }
}});
  _$jscoverage['/dialog.js'].lineData[486]++;
  return ImageDialog;
});
