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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[8] = 0;
  _$jscoverage['/base.js'].lineData[9] = 0;
  _$jscoverage['/base.js'].lineData[10] = 0;
  _$jscoverage['/base.js'].lineData[12] = 0;
  _$jscoverage['/base.js'].lineData[18] = 0;
  _$jscoverage['/base.js'].lineData[19] = 0;
  _$jscoverage['/base.js'].lineData[22] = 0;
  _$jscoverage['/base.js'].lineData[23] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[27] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[36] = 0;
  _$jscoverage['/base.js'].lineData[37] = 0;
  _$jscoverage['/base.js'].lineData[38] = 0;
  _$jscoverage['/base.js'].lineData[40] = 0;
  _$jscoverage['/base.js'].lineData[41] = 0;
  _$jscoverage['/base.js'].lineData[42] = 0;
  _$jscoverage['/base.js'].lineData[44] = 0;
  _$jscoverage['/base.js'].lineData[61] = 0;
  _$jscoverage['/base.js'].lineData[62] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[79] = 0;
  _$jscoverage['/base.js'].lineData[81] = 0;
  _$jscoverage['/base.js'].lineData[82] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[89] = 0;
  _$jscoverage['/base.js'].lineData[97] = 0;
  _$jscoverage['/base.js'].lineData[101] = 0;
  _$jscoverage['/base.js'].lineData[102] = 0;
  _$jscoverage['/base.js'].lineData[103] = 0;
  _$jscoverage['/base.js'].lineData[104] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[107] = 0;
  _$jscoverage['/base.js'].lineData[108] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[114] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[132] = 0;
  _$jscoverage['/base.js'].lineData[136] = 0;
  _$jscoverage['/base.js'].lineData[137] = 0;
  _$jscoverage['/base.js'].lineData[138] = 0;
  _$jscoverage['/base.js'].lineData[140] = 0;
  _$jscoverage['/base.js'].lineData[150] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[157] = 0;
  _$jscoverage['/base.js'].lineData[158] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[164] = 0;
  _$jscoverage['/base.js'].lineData[165] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[167] = 0;
  _$jscoverage['/base.js'].lineData[168] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[190] = 0;
  _$jscoverage['/base.js'].lineData[191] = 0;
  _$jscoverage['/base.js'].lineData[192] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[196] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[225] = 0;
  _$jscoverage['/base.js'].lineData[226] = 0;
  _$jscoverage['/base.js'].lineData[231] = 0;
  _$jscoverage['/base.js'].lineData[232] = 0;
  _$jscoverage['/base.js'].lineData[236] = 0;
  _$jscoverage['/base.js'].lineData[237] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[247] = 0;
  _$jscoverage['/base.js'].lineData[249] = 0;
  _$jscoverage['/base.js'].lineData[250] = 0;
  _$jscoverage['/base.js'].lineData[251] = 0;
  _$jscoverage['/base.js'].lineData[252] = 0;
  _$jscoverage['/base.js'].lineData[254] = 0;
  _$jscoverage['/base.js'].lineData[256] = 0;
  _$jscoverage['/base.js'].lineData[262] = 0;
  _$jscoverage['/base.js'].lineData[263] = 0;
  _$jscoverage['/base.js'].lineData[264] = 0;
  _$jscoverage['/base.js'].lineData[265] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[267] = 0;
  _$jscoverage['/base.js'].lineData[268] = 0;
  _$jscoverage['/base.js'].lineData[273] = 0;
  _$jscoverage['/base.js'].lineData[345] = 0;
  _$jscoverage['/base.js'].lineData[348] = 0;
  _$jscoverage['/base.js'].lineData[349] = 0;
  _$jscoverage['/base.js'].lineData[350] = 0;
  _$jscoverage['/base.js'].lineData[352] = 0;
  _$jscoverage['/base.js'].lineData[354] = 0;
  _$jscoverage['/base.js'].lineData[355] = 0;
  _$jscoverage['/base.js'].lineData[356] = 0;
  _$jscoverage['/base.js'].lineData[357] = 0;
  _$jscoverage['/base.js'].lineData[358] = 0;
  _$jscoverage['/base.js'].lineData[362] = 0;
  _$jscoverage['/base.js'].lineData[363] = 0;
  _$jscoverage['/base.js'].lineData[366] = 0;
  _$jscoverage['/base.js'].lineData[367] = 0;
  _$jscoverage['/base.js'].lineData[371] = 0;
  _$jscoverage['/base.js'].lineData[373] = 0;
  _$jscoverage['/base.js'].lineData[374] = 0;
  _$jscoverage['/base.js'].lineData[375] = 0;
  _$jscoverage['/base.js'].lineData[377] = 0;
  _$jscoverage['/base.js'].lineData[378] = 0;
  _$jscoverage['/base.js'].lineData[379] = 0;
  _$jscoverage['/base.js'].lineData[381] = 0;
  _$jscoverage['/base.js'].lineData[382] = 0;
  _$jscoverage['/base.js'].lineData[383] = 0;
  _$jscoverage['/base.js'].lineData[385] = 0;
  _$jscoverage['/base.js'].lineData[386] = 0;
  _$jscoverage['/base.js'].lineData[388] = 0;
  _$jscoverage['/base.js'].lineData[390] = 0;
  _$jscoverage['/base.js'].lineData[392] = 0;
  _$jscoverage['/base.js'].lineData[393] = 0;
  _$jscoverage['/base.js'].lineData[397] = 0;
  _$jscoverage['/base.js'].lineData[398] = 0;
  _$jscoverage['/base.js'].lineData[408] = 0;
  _$jscoverage['/base.js'].lineData[409] = 0;
  _$jscoverage['/base.js'].lineData[410] = 0;
  _$jscoverage['/base.js'].lineData[413] = 0;
  _$jscoverage['/base.js'].lineData[415] = 0;
  _$jscoverage['/base.js'].lineData[417] = 0;
  _$jscoverage['/base.js'].lineData[418] = 0;
  _$jscoverage['/base.js'].lineData[423] = 0;
  _$jscoverage['/base.js'].lineData[424] = 0;
  _$jscoverage['/base.js'].lineData[425] = 0;
  _$jscoverage['/base.js'].lineData[427] = 0;
  _$jscoverage['/base.js'].lineData[428] = 0;
  _$jscoverage['/base.js'].lineData[429] = 0;
  _$jscoverage['/base.js'].lineData[433] = 0;
  _$jscoverage['/base.js'].lineData[434] = 0;
  _$jscoverage['/base.js'].lineData[435] = 0;
  _$jscoverage['/base.js'].lineData[436] = 0;
  _$jscoverage['/base.js'].lineData[463] = 0;
  _$jscoverage['/base.js'].lineData[464] = 0;
  _$jscoverage['/base.js'].lineData[467] = 0;
  _$jscoverage['/base.js'].lineData[468] = 0;
  _$jscoverage['/base.js'].lineData[469] = 0;
  _$jscoverage['/base.js'].lineData[473] = 0;
  _$jscoverage['/base.js'].lineData[474] = 0;
  _$jscoverage['/base.js'].lineData[475] = 0;
  _$jscoverage['/base.js'].lineData[483] = 0;
  _$jscoverage['/base.js'].lineData[488] = 0;
  _$jscoverage['/base.js'].lineData[489] = 0;
  _$jscoverage['/base.js'].lineData[490] = 0;
  _$jscoverage['/base.js'].lineData[492] = 0;
  _$jscoverage['/base.js'].lineData[497] = 0;
  _$jscoverage['/base.js'].lineData[498] = 0;
  _$jscoverage['/base.js'].lineData[499] = 0;
  _$jscoverage['/base.js'].lineData[500] = 0;
  _$jscoverage['/base.js'].lineData[501] = 0;
  _$jscoverage['/base.js'].lineData[506] = 0;
  _$jscoverage['/base.js'].lineData[507] = 0;
  _$jscoverage['/base.js'].lineData[508] = 0;
  _$jscoverage['/base.js'].lineData[512] = 0;
  _$jscoverage['/base.js'].lineData[513] = 0;
  _$jscoverage['/base.js'].lineData[514] = 0;
  _$jscoverage['/base.js'].lineData[515] = 0;
  _$jscoverage['/base.js'].lineData[516] = 0;
  _$jscoverage['/base.js'].lineData[520] = 0;
  _$jscoverage['/base.js'].lineData[521] = 0;
  _$jscoverage['/base.js'].lineData[522] = 0;
  _$jscoverage['/base.js'].lineData[525] = 0;
  _$jscoverage['/base.js'].lineData[526] = 0;
  _$jscoverage['/base.js'].lineData[527] = 0;
  _$jscoverage['/base.js'].lineData[528] = 0;
  _$jscoverage['/base.js'].lineData[529] = 0;
  _$jscoverage['/base.js'].lineData[530] = 0;
  _$jscoverage['/base.js'].lineData[531] = 0;
  _$jscoverage['/base.js'].lineData[532] = 0;
  _$jscoverage['/base.js'].lineData[533] = 0;
  _$jscoverage['/base.js'].lineData[534] = 0;
  _$jscoverage['/base.js'].lineData[535] = 0;
  _$jscoverage['/base.js'].lineData[536] = 0;
  _$jscoverage['/base.js'].lineData[537] = 0;
  _$jscoverage['/base.js'].lineData[538] = 0;
  _$jscoverage['/base.js'].lineData[540] = 0;
  _$jscoverage['/base.js'].lineData[541] = 0;
  _$jscoverage['/base.js'].lineData[543] = 0;
  _$jscoverage['/base.js'].lineData[544] = 0;
  _$jscoverage['/base.js'].lineData[549] = 0;
  _$jscoverage['/base.js'].lineData[550] = 0;
  _$jscoverage['/base.js'].lineData[553] = 0;
  _$jscoverage['/base.js'].lineData[554] = 0;
  _$jscoverage['/base.js'].lineData[555] = 0;
  _$jscoverage['/base.js'].lineData[560] = 0;
  _$jscoverage['/base.js'].lineData[561] = 0;
  _$jscoverage['/base.js'].lineData[562] = 0;
  _$jscoverage['/base.js'].lineData[563] = 0;
  _$jscoverage['/base.js'].lineData[564] = 0;
  _$jscoverage['/base.js'].lineData[569] = 0;
  _$jscoverage['/base.js'].lineData[570] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
  _$jscoverage['/base.js'].functionData[17] = 0;
  _$jscoverage['/base.js'].functionData[18] = 0;
  _$jscoverage['/base.js'].functionData[19] = 0;
  _$jscoverage['/base.js'].functionData[20] = 0;
  _$jscoverage['/base.js'].functionData[21] = 0;
  _$jscoverage['/base.js'].functionData[22] = 0;
  _$jscoverage['/base.js'].functionData[23] = 0;
  _$jscoverage['/base.js'].functionData[24] = 0;
  _$jscoverage['/base.js'].functionData[25] = 0;
  _$jscoverage['/base.js'].functionData[26] = 0;
  _$jscoverage['/base.js'].functionData[27] = 0;
  _$jscoverage['/base.js'].functionData[28] = 0;
  _$jscoverage['/base.js'].functionData[29] = 0;
  _$jscoverage['/base.js'].functionData[30] = 0;
  _$jscoverage['/base.js'].functionData[31] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['30'] = [];
  _$jscoverage['/base.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['36'] = [];
  _$jscoverage['/base.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['37'] = [];
  _$jscoverage['/base.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['41'] = [];
  _$jscoverage['/base.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['101'] = [];
  _$jscoverage['/base.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['107'] = [];
  _$jscoverage['/base.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['114'] = [];
  _$jscoverage['/base.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['119'] = [];
  _$jscoverage['/base.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['124'] = [];
  _$jscoverage['/base.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['138'] = [];
  _$jscoverage['/base.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['158'] = [];
  _$jscoverage['/base.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['164'] = [];
  _$jscoverage['/base.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['165'] = [];
  _$jscoverage['/base.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['167'] = [];
  _$jscoverage['/base.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['172'] = [];
  _$jscoverage['/base.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['175'] = [];
  _$jscoverage['/base.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['175'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['176'] = [];
  _$jscoverage['/base.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['191'] = [];
  _$jscoverage['/base.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['195'] = [];
  _$jscoverage['/base.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['211'] = [];
  _$jscoverage['/base.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['215'] = [];
  _$jscoverage['/base.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['216'] = [];
  _$jscoverage['/base.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['218'] = [];
  _$jscoverage['/base.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['218'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['219'] = [];
  _$jscoverage['/base.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['224'] = [];
  _$jscoverage['/base.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['231'] = [];
  _$jscoverage['/base.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['249'] = [];
  _$jscoverage['/base.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['249'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['250'] = [];
  _$jscoverage['/base.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['263'] = [];
  _$jscoverage['/base.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['348'] = [];
  _$jscoverage['/base.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['354'] = [];
  _$jscoverage['/base.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['355'] = [];
  _$jscoverage['/base.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['357'] = [];
  _$jscoverage['/base.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['362'] = [];
  _$jscoverage['/base.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['374'] = [];
  _$jscoverage['/base.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['378'] = [];
  _$jscoverage['/base.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['381'] = [];
  _$jscoverage['/base.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['382'] = [];
  _$jscoverage['/base.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['382'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['385'] = [];
  _$jscoverage['/base.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['392'] = [];
  _$jscoverage['/base.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['398'] = [];
  _$jscoverage['/base.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['409'] = [];
  _$jscoverage['/base.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['417'] = [];
  _$jscoverage['/base.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['427'] = [];
  _$jscoverage['/base.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['435'] = [];
  _$jscoverage['/base.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['467'] = [];
  _$jscoverage['/base.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['474'] = [];
  _$jscoverage['/base.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['489'] = [];
  _$jscoverage['/base.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['500'] = [];
  _$jscoverage['/base.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['514'] = [];
  _$jscoverage['/base.js'].branchData['514'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['516'] = [];
  _$jscoverage['/base.js'].branchData['516'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['521'] = [];
  _$jscoverage['/base.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['526'] = [];
  _$jscoverage['/base.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['528'] = [];
  _$jscoverage['/base.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['537'] = [];
  _$jscoverage['/base.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['540'] = [];
  _$jscoverage['/base.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['553'] = [];
  _$jscoverage['/base.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['554'] = [];
  _$jscoverage['/base.js'].branchData['554'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['555'] = [];
  _$jscoverage['/base.js'].branchData['555'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['562'] = [];
  _$jscoverage['/base.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['562'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['563'] = [];
  _$jscoverage['/base.js'].branchData['563'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['564'] = [];
  _$jscoverage['/base.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['569'] = [];
  _$jscoverage['/base.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['570'] = [];
  _$jscoverage['/base.js'].branchData['570'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['570'][1].init(36, 10, 'args || []');
function visit70_570_1(result) {
  _$jscoverage['/base.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['569'][1].init(214, 2, 'fn');
function visit69_569_1(result) {
  _$jscoverage['/base.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['564'][1].init(26, 166, 'extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method])');
function visit68_564_1(result) {
  _$jscoverage['/base.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['563'][1].init(29, 7, 'i < len');
function visit67_563_1(result) {
  _$jscoverage['/base.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['562'][2].init(36, 31, 'extensions && extensions.length');
function visit66_562_2(result) {
  _$jscoverage['/base.js'].branchData['562'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['562'][1].init(30, 37, 'len = extensions && extensions.length');
function visit65_562_1(result) {
  _$jscoverage['/base.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['555'][1].init(17, 46, 'plugins[i][method] && plugins[i][method](self)');
function visit64_555_1(result) {
  _$jscoverage['/base.js'].branchData['555'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['554'][1].init(29, 7, 'i < len');
function visit63_554_1(result) {
  _$jscoverage['/base.js'].branchData['554'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['553'][1].init(98, 20, 'len = plugins.length');
function visit62_553_1(result) {
  _$jscoverage['/base.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['540'][1].init(554, 7, 'wrapped');
function visit61_540_1(result) {
  _$jscoverage['/base.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['537'][1].init(467, 13, 'v.__wrapped__');
function visit60_537_1(result) {
  _$jscoverage['/base.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['528'][1].init(54, 11, 'v.__owner__');
function visit59_528_1(result) {
  _$jscoverage['/base.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['526'][1].init(17, 22, 'typeof v == \'function\'');
function visit58_526_1(result) {
  _$jscoverage['/base.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['521'][1].init(17, 7, 'p in px');
function visit57_521_1(result) {
  _$jscoverage['/base.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['516'][1].init(25, 13, 'px[p] || noop');
function visit56_516_1(result) {
  _$jscoverage['/base.js'].branchData['516'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['514'][1].init(63, 17, 'extensions.length');
function visit55_514_1(result) {
  _$jscoverage['/base.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['500'][1].init(17, 28, 'typeof plugin === \'function\'');
function visit54_500_1(result) {
  _$jscoverage['/base.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['489'][1].init(13, 6, 'config');
function visit53_489_1(result) {
  _$jscoverage['/base.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['474'][1].init(13, 5, 'attrs');
function visit52_474_1(result) {
  _$jscoverage['/base.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['467'][1].init(85, 16, 'e.target == self');
function visit51_467_1(result) {
  _$jscoverage['/base.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['435'][1].init(70, 24, 'SubClass.__hooks__ || {}');
function visit50_435_1(result) {
  _$jscoverage['/base.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['427'][1].init(3517, 25, 'SubClass.extend || extend');
function visit49_427_1(result) {
  _$jscoverage['/base.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['417'][1].init(94, 21, 'exp.hasOwnProperty(p)');
function visit48_417_1(result) {
  _$jscoverage['/base.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['409'][1].init(52, 17, 'attrs[name] || {}');
function visit47_409_1(result) {
  _$jscoverage['/base.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['398'][1].init(25, 3, 'ext');
function visit46_398_1(result) {
  _$jscoverage['/base.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['392'][1].init(1972, 17, 'extensions.length');
function visit45_392_1(result) {
  _$jscoverage['/base.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['385'][1].init(1722, 16, 'inheritedStatics');
function visit44_385_1(result) {
  _$jscoverage['/base.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['382'][2].init(1580, 43, 'inheritedStatics !== sx[\'inheritedStatics\']');
function visit43_382_2(result) {
  _$jscoverage['/base.js'].branchData['382'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['382'][1].init(1554, 69, 'sx[\'inheritedStatics\'] && inheritedStatics !== sx[\'inheritedStatics\']');
function visit42_382_1(result) {
  _$jscoverage['/base.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['381'][1].init(1484, 52, 'sp[\'__inheritedStatics__\'] || sx[\'inheritedStatics\']');
function visit41_381_1(result) {
  _$jscoverage['/base.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['378'][1].init(1316, 18, 'sx.__hooks__ || {}');
function visit40_378_1(result) {
  _$jscoverage['/base.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['374'][1].init(1138, 5, 'hooks');
function visit39_374_1(result) {
  _$jscoverage['/base.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['362'][1].init(150, 9, '\'@DEBUG@\'');
function visit38_362_1(result) {
  _$jscoverage['/base.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['357'][1].init(393, 32, 'px.hasOwnProperty(\'constructor\')');
function visit37_357_1(result) {
  _$jscoverage['/base.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['355'][1].init(321, 24, 'sx.name || \'BaseDerived\'');
function visit36_355_1(result) {
  _$jscoverage['/base.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['354'][1].init(292, 8, 'sx || {}');
function visit35_354_1(result) {
  _$jscoverage['/base.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['348'][1].init(100, 22, '!S.isArray(extensions)');
function visit34_348_1(result) {
  _$jscoverage['/base.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['263'][1].init(46, 22, '!self.get(\'destroyed\')');
function visit33_263_1(result) {
  _$jscoverage['/base.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['250'][1].init(141, 14, 'pluginId == id');
function visit32_250_1(result) {
  _$jscoverage['/base.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['249'][2].init(79, 26, 'p.get && p.get(\'pluginId\')');
function visit31_249_2(result) {
  _$jscoverage['/base.js'].branchData['249'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['249'][1].init(79, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit30_249_1(result) {
  _$jscoverage['/base.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['231'][1].init(640, 5, '!keep');
function visit29_231_1(result) {
  _$jscoverage['/base.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['224'][1].init(29, 11, 'p != plugin');
function visit28_224_1(result) {
  _$jscoverage['/base.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['219'][1].init(161, 18, 'pluginId != plugin');
function visit27_219_1(result) {
  _$jscoverage['/base.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['218'][2].init(91, 26, 'p.get && p.get(\'pluginId\')');
function visit26_218_2(result) {
  _$jscoverage['/base.js'].branchData['218'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['218'][1].init(91, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit25_218_1(result) {
  _$jscoverage['/base.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['216'][1].init(25, 8, 'isString');
function visit24_216_1(result) {
  _$jscoverage['/base.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['215'][1].init(61, 6, 'plugin');
function visit23_215_1(result) {
  _$jscoverage['/base.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['211'][1].init(73, 25, 'typeof plugin == \'string\'');
function visit22_211_1(result) {
  _$jscoverage['/base.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['195'][1].init(180, 27, 'plugin[\'pluginInitializer\']');
function visit21_195_1(result) {
  _$jscoverage['/base.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['191'][1].init(46, 28, 'typeof plugin === \'function\'');
function visit20_191_1(result) {
  _$jscoverage['/base.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['176'][1].init(63, 55, '(attributeValue = self.get(attributeName)) !== undefined');
function visit19_176_1(result) {
  _$jscoverage['/base.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['175'][2].init(427, 31, 'attrs[attributeName].sync !== 0');
function visit18_175_2(result) {
  _$jscoverage['/base.js'].branchData['175'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['175'][1].init(174, 119, 'attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit17_175_1(result) {
  _$jscoverage['/base.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['172'][1].init(250, 294, '(onSetMethod = self[onSetMethodName]) && attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit16_172_1(result) {
  _$jscoverage['/base.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['167'][1].init(25, 22, 'attributeName in attrs');
function visit15_167_1(result) {
  _$jscoverage['/base.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['165'][1].init(29, 17, 'cs[i].ATTRS || {}');
function visit14_165_1(result) {
  _$jscoverage['/base.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['164'][1].init(379, 13, 'i < cs.length');
function visit13_164_1(result) {
  _$jscoverage['/base.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['158'][1].init(49, 40, 'c.superclass && c.superclass.constructor');
function visit12_158_1(result) {
  _$jscoverage['/base.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['138'][1].init(65, 7, 'self[m]');
function visit11_138_1(result) {
  _$jscoverage['/base.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['124'][1].init(1006, 10, 'args || []');
function visit10_124_1(result) {
  _$jscoverage['/base.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['119'][1].init(806, 7, '!member');
function visit9_119_1(result) {
  _$jscoverage['/base.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['114'][1].init(552, 5, '!name');
function visit8_114_1(result) {
  _$jscoverage['/base.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['107'][1].init(71, 18, 'method.__wrapped__');
function visit7_107_1(result) {
  _$jscoverage['/base.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['101'][2].init(110, 25, 'typeof self == \'function\'');
function visit6_101_2(result) {
  _$jscoverage['/base.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['101'][1].init(110, 42, 'typeof self == \'function\' && self.__name__');
function visit5_101_1(result) {
  _$jscoverage['/base.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['41'][1].init(532, 7, 'reverse');
function visit4_41_1(result) {
  _$jscoverage['/base.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['37'][1].init(366, 7, 'reverse');
function visit3_37_1(result) {
  _$jscoverage['/base.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['36'][1].init(297, 47, 'arguments.callee.__owner__.__extensions__ || []');
function visit2_36_1(result) {
  _$jscoverage['/base.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['30'][1].init(54, 7, 'reverse');
function visit1_30_1(result) {
  _$jscoverage['/base.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var module = this;
  _$jscoverage['/base.js'].lineData[8]++;
  var Attribute = module.require('attribute');
  _$jscoverage['/base.js'].lineData[9]++;
  var CustomEvent = module.require('event/custom');
  _$jscoverage['/base.js'].lineData[10]++;
  module.exports = Base;
  _$jscoverage['/base.js'].lineData[12]++;
  var ATTRS = 'ATTRS', ucfirst = S.ucfirst, ON_SET = '_onSet', noop = S.noop, RE_DASH = /(?:^|-)([a-z])/ig;
  _$jscoverage['/base.js'].lineData[18]++;
  function replaceToUpper() {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[19]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/base.js'].lineData[22]++;
  function CamelCase(name) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[23]++;
    return name.replace(RE_DASH, replaceToUpper);
  }
  _$jscoverage['/base.js'].lineData[26]++;
  function __getHook(method, reverse) {
    _$jscoverage['/base.js'].functionData[3]++;
    _$jscoverage['/base.js'].lineData[27]++;
    return function(origFn) {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[28]++;
  return function wrap() {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[29]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[30]++;
  if (visit1_30_1(reverse)) {
    _$jscoverage['/base.js'].lineData[31]++;
    origFn.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[33]++;
    self.callSuper.apply(self, arguments);
  }
  _$jscoverage['/base.js'].lineData[36]++;
  var extensions = visit2_36_1(arguments.callee.__owner__.__extensions__ || []);
  _$jscoverage['/base.js'].lineData[37]++;
  if (visit3_37_1(reverse)) {
    _$jscoverage['/base.js'].lineData[38]++;
    extensions.reverse();
  }
  _$jscoverage['/base.js'].lineData[40]++;
  callExtensionsMethod(self, extensions, method, arguments);
  _$jscoverage['/base.js'].lineData[41]++;
  if (visit4_41_1(reverse)) {
    _$jscoverage['/base.js'].lineData[42]++;
    self.callSuper.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[44]++;
    origFn.apply(self, arguments);
  }
};
};
  }
  _$jscoverage['/base.js'].lineData[61]++;
  function Base(config) {
    _$jscoverage['/base.js'].functionData[6]++;
    _$jscoverage['/base.js'].lineData[62]++;
    var self = this, c = self.constructor;
    _$jscoverage['/base.js'].lineData[65]++;
    self.userConfig = config;
    _$jscoverage['/base.js'].lineData[67]++;
    while (c) {
      _$jscoverage['/base.js'].lineData[68]++;
      addAttrs(self, c[ATTRS]);
      _$jscoverage['/base.js'].lineData[69]++;
      c = c.superclass ? c.superclass.constructor : null;
    }
    _$jscoverage['/base.js'].lineData[72]++;
    initAttrs(self, config);
    _$jscoverage['/base.js'].lineData[74]++;
    var listeners = self.get("listeners");
    _$jscoverage['/base.js'].lineData[75]++;
    for (var n in listeners) {
      _$jscoverage['/base.js'].lineData[76]++;
      self.on(n, listeners[n]);
    }
    _$jscoverage['/base.js'].lineData[79]++;
    self.initializer();
    _$jscoverage['/base.js'].lineData[81]++;
    constructPlugins(self);
    _$jscoverage['/base.js'].lineData[82]++;
    callPluginsMethod.call(self, 'pluginInitializer');
    _$jscoverage['/base.js'].lineData[84]++;
    self.bindInternal();
    _$jscoverage['/base.js'].lineData[86]++;
    self.syncInternal();
  }
  _$jscoverage['/base.js'].lineData[89]++;
  S.augment(Base, Attribute, CustomEvent.Target, {
  initializer: noop, 
  '__getHook': __getHook, 
  __callPluginsMethod: callPluginsMethod, 
  'callSuper': function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[97]++;
  var method, obj, self = this, args = arguments;
  _$jscoverage['/base.js'].lineData[101]++;
  if (visit5_101_1(visit6_101_2(typeof self == 'function') && self.__name__)) {
    _$jscoverage['/base.js'].lineData[102]++;
    method = self;
    _$jscoverage['/base.js'].lineData[103]++;
    obj = args[0];
    _$jscoverage['/base.js'].lineData[104]++;
    args = Array.prototype.slice.call(args, 1);
  } else {
    _$jscoverage['/base.js'].lineData[106]++;
    method = arguments.callee.caller;
    _$jscoverage['/base.js'].lineData[107]++;
    if (visit7_107_1(method.__wrapped__)) {
      _$jscoverage['/base.js'].lineData[108]++;
      method = method.caller;
    }
    _$jscoverage['/base.js'].lineData[110]++;
    obj = self;
  }
  _$jscoverage['/base.js'].lineData[113]++;
  var name = method.__name__;
  _$jscoverage['/base.js'].lineData[114]++;
  if (visit8_114_1(!name)) {
    _$jscoverage['/base.js'].lineData[116]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[118]++;
  var member = method.__owner__.superclass[name];
  _$jscoverage['/base.js'].lineData[119]++;
  if (visit9_119_1(!member)) {
    _$jscoverage['/base.js'].lineData[121]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[124]++;
  return member.apply(obj, visit10_124_1(args || []));
}, 
  bindInternal: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[132]++;
  var self = this, attrs = self['getAttrs'](), attr, m;
  _$jscoverage['/base.js'].lineData[136]++;
  for (attr in attrs) {
    _$jscoverage['/base.js'].lineData[137]++;
    m = ON_SET + ucfirst(attr);
    _$jscoverage['/base.js'].lineData[138]++;
    if (visit11_138_1(self[m])) {
      _$jscoverage['/base.js'].lineData[140]++;
      self.on('after' + ucfirst(attr) + 'Change', onSetAttrChange);
    }
  }
}, 
  syncInternal: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[150]++;
  var self = this, cs = [], i, c = self.constructor, attrs = self.getAttrs();
  _$jscoverage['/base.js'].lineData[156]++;
  while (c) {
    _$jscoverage['/base.js'].lineData[157]++;
    cs.push(c);
    _$jscoverage['/base.js'].lineData[158]++;
    c = visit12_158_1(c.superclass && c.superclass.constructor);
  }
  _$jscoverage['/base.js'].lineData[161]++;
  cs.reverse();
  _$jscoverage['/base.js'].lineData[164]++;
  for (i = 0; visit13_164_1(i < cs.length); i++) {
    _$jscoverage['/base.js'].lineData[165]++;
    var ATTRS = visit14_165_1(cs[i].ATTRS || {});
    _$jscoverage['/base.js'].lineData[166]++;
    for (var attributeName in ATTRS) {
      _$jscoverage['/base.js'].lineData[167]++;
      if (visit15_167_1(attributeName in attrs)) {
        _$jscoverage['/base.js'].lineData[168]++;
        var attributeValue, onSetMethod;
        _$jscoverage['/base.js'].lineData[170]++;
        var onSetMethodName = ON_SET + ucfirst(attributeName);
        _$jscoverage['/base.js'].lineData[172]++;
        if (visit16_172_1((onSetMethod = self[onSetMethodName]) && visit17_175_1(visit18_175_2(attrs[attributeName].sync !== 0) && visit19_176_1((attributeValue = self.get(attributeName)) !== undefined)))) {
          _$jscoverage['/base.js'].lineData[177]++;
          onSetMethod.call(self, attributeValue);
        }
      }
    }
  }
}, 
  'plug': function(plugin) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[190]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[191]++;
  if (visit20_191_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[192]++;
    plugin = new plugin();
  }
  _$jscoverage['/base.js'].lineData[195]++;
  if (visit21_195_1(plugin['pluginInitializer'])) {
    _$jscoverage['/base.js'].lineData[196]++;
    plugin['pluginInitializer'](self);
  }
  _$jscoverage['/base.js'].lineData[198]++;
  self.get('plugins').push(plugin);
  _$jscoverage['/base.js'].lineData[199]++;
  return self;
}, 
  'unplug': function(plugin) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[209]++;
  var plugins = [], self = this, isString = visit22_211_1(typeof plugin == 'string');
  _$jscoverage['/base.js'].lineData[213]++;
  S.each(self.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[214]++;
  var keep = 0, pluginId;
  _$jscoverage['/base.js'].lineData[215]++;
  if (visit23_215_1(plugin)) {
    _$jscoverage['/base.js'].lineData[216]++;
    if (visit24_216_1(isString)) {
      _$jscoverage['/base.js'].lineData[218]++;
      pluginId = visit25_218_1(visit26_218_2(p.get && p.get('pluginId')) || p.pluginId);
      _$jscoverage['/base.js'].lineData[219]++;
      if (visit27_219_1(pluginId != plugin)) {
        _$jscoverage['/base.js'].lineData[220]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[221]++;
        keep = 1;
      }
    } else {
      _$jscoverage['/base.js'].lineData[224]++;
      if (visit28_224_1(p != plugin)) {
        _$jscoverage['/base.js'].lineData[225]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[226]++;
        keep = 1;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[231]++;
  if (visit29_231_1(!keep)) {
    _$jscoverage['/base.js'].lineData[232]++;
    p.pluginDestructor(self);
  }
});
  _$jscoverage['/base.js'].lineData[236]++;
  self.setInternal('plugins', plugins);
  _$jscoverage['/base.js'].lineData[237]++;
  return self;
}, 
  'getPlugin': function(id) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[246]++;
  var plugin = null;
  _$jscoverage['/base.js'].lineData[247]++;
  S.each(this.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[249]++;
  var pluginId = visit30_249_1(visit31_249_2(p.get && p.get('pluginId')) || p.pluginId);
  _$jscoverage['/base.js'].lineData[250]++;
  if (visit32_250_1(pluginId == id)) {
    _$jscoverage['/base.js'].lineData[251]++;
    plugin = p;
    _$jscoverage['/base.js'].lineData[252]++;
    return false;
  }
  _$jscoverage['/base.js'].lineData[254]++;
  return undefined;
});
  _$jscoverage['/base.js'].lineData[256]++;
  return plugin;
}, 
  destructor: S.noop, 
  destroy: function() {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[262]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[263]++;
  if (visit33_263_1(!self.get('destroyed'))) {
    _$jscoverage['/base.js'].lineData[264]++;
    callPluginsMethod.call(self, 'pluginDestructor');
    _$jscoverage['/base.js'].lineData[265]++;
    self.destructor();
    _$jscoverage['/base.js'].lineData[266]++;
    self.set('destroyed', true);
    _$jscoverage['/base.js'].lineData[267]++;
    self.fire('destroy');
    _$jscoverage['/base.js'].lineData[268]++;
    self.detach();
  }
}});
  _$jscoverage['/base.js'].lineData[273]++;
  S.mix(Base, {
  __hooks__: {
  initializer: __getHook(), 
  destructor: __getHook('__destructor', true)}, 
  ATTRS: {
  plugins: {
  value: []}, 
  destroyed: {
  value: false}, 
  listeners: {
  value: []}}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[345]++;
  var SuperClass = this, name, SubClass;
  _$jscoverage['/base.js'].lineData[348]++;
  if (visit34_348_1(!S.isArray(extensions))) {
    _$jscoverage['/base.js'].lineData[349]++;
    sx = px;
    _$jscoverage['/base.js'].lineData[350]++;
    px = extensions;
    _$jscoverage['/base.js'].lineData[352]++;
    extensions = [];
  }
  _$jscoverage['/base.js'].lineData[354]++;
  sx = visit35_354_1(sx || {});
  _$jscoverage['/base.js'].lineData[355]++;
  name = visit36_355_1(sx.name || 'BaseDerived');
  _$jscoverage['/base.js'].lineData[356]++;
  px = S.merge(px);
  _$jscoverage['/base.js'].lineData[357]++;
  if (visit37_357_1(px.hasOwnProperty('constructor'))) {
    _$jscoverage['/base.js'].lineData[358]++;
    SubClass = px.constructor;
  } else {
    _$jscoverage['/base.js'].lineData[362]++;
    if (visit38_362_1('@DEBUG@')) {
      _$jscoverage['/base.js'].lineData[363]++;
      eval("SubClass = function " + CamelCase(name) + "(){ " + "this.callSuper.apply(this, arguments);}");
    } else {
      _$jscoverage['/base.js'].lineData[366]++;
      SubClass = function() {
  _$jscoverage['/base.js'].functionData[17]++;
  _$jscoverage['/base.js'].lineData[367]++;
  this.callSuper.apply(this, arguments);
};
    }
  }
  _$jscoverage['/base.js'].lineData[371]++;
  px.constructor = SubClass;
  _$jscoverage['/base.js'].lineData[373]++;
  var hooks = SuperClass.__hooks__;
  _$jscoverage['/base.js'].lineData[374]++;
  if (visit39_374_1(hooks)) {
    _$jscoverage['/base.js'].lineData[375]++;
    sx.__hooks__ = S.merge(hooks, sx.__hooks__);
  }
  _$jscoverage['/base.js'].lineData[377]++;
  SubClass.__extensions__ = extensions;
  _$jscoverage['/base.js'].lineData[378]++;
  wrapProtoForSuper(px, SubClass, visit40_378_1(sx.__hooks__ || {}));
  _$jscoverage['/base.js'].lineData[379]++;
  var sp = SuperClass.prototype;
  _$jscoverage['/base.js'].lineData[381]++;
  var inheritedStatics = sp['__inheritedStatics__'] = visit41_381_1(sp['__inheritedStatics__'] || sx['inheritedStatics']);
  _$jscoverage['/base.js'].lineData[382]++;
  if (visit42_382_1(sx['inheritedStatics'] && visit43_382_2(inheritedStatics !== sx['inheritedStatics']))) {
    _$jscoverage['/base.js'].lineData[383]++;
    S.mix(inheritedStatics, sx['inheritedStatics']);
  }
  _$jscoverage['/base.js'].lineData[385]++;
  if (visit44_385_1(inheritedStatics)) {
    _$jscoverage['/base.js'].lineData[386]++;
    S.mix(SubClass, inheritedStatics);
  }
  _$jscoverage['/base.js'].lineData[388]++;
  delete sx['inheritedStatics'];
  _$jscoverage['/base.js'].lineData[390]++;
  S.extend(SubClass, SuperClass, px, sx);
  _$jscoverage['/base.js'].lineData[392]++;
  if (visit45_392_1(extensions.length)) {
    _$jscoverage['/base.js'].lineData[393]++;
    var attrs = {}, prototype = {};
    _$jscoverage['/base.js'].lineData[397]++;
    S.each(extensions['concat'](SubClass), function(ext) {
  _$jscoverage['/base.js'].functionData[18]++;
  _$jscoverage['/base.js'].lineData[398]++;
  if (visit46_398_1(ext)) {
    _$jscoverage['/base.js'].lineData[408]++;
    S.each(ext[ATTRS], function(v, name) {
  _$jscoverage['/base.js'].functionData[19]++;
  _$jscoverage['/base.js'].lineData[409]++;
  var av = attrs[name] = visit47_409_1(attrs[name] || {});
  _$jscoverage['/base.js'].lineData[410]++;
  S.mix(av, v);
});
    _$jscoverage['/base.js'].lineData[413]++;
    var exp = ext.prototype, p;
    _$jscoverage['/base.js'].lineData[415]++;
    for (p in exp) {
      _$jscoverage['/base.js'].lineData[417]++;
      if (visit48_417_1(exp.hasOwnProperty(p))) {
        _$jscoverage['/base.js'].lineData[418]++;
        prototype[p] = exp[p];
      }
    }
  }
});
    _$jscoverage['/base.js'].lineData[423]++;
    SubClass[ATTRS] = attrs;
    _$jscoverage['/base.js'].lineData[424]++;
    prototype.constructor = SubClass;
    _$jscoverage['/base.js'].lineData[425]++;
    S.augment(SubClass, prototype);
  }
  _$jscoverage['/base.js'].lineData[427]++;
  SubClass.extend = visit49_427_1(SubClass.extend || extend);
  _$jscoverage['/base.js'].lineData[428]++;
  SubClass.addMembers = addMembers;
  _$jscoverage['/base.js'].lineData[429]++;
  return SubClass;
}});
  _$jscoverage['/base.js'].lineData[433]++;
  function addMembers(px) {
    _$jscoverage['/base.js'].functionData[20]++;
    _$jscoverage['/base.js'].lineData[434]++;
    var SubClass = this;
    _$jscoverage['/base.js'].lineData[435]++;
    wrapProtoForSuper(px, SubClass, visit50_435_1(SubClass.__hooks__ || {}));
    _$jscoverage['/base.js'].lineData[436]++;
    S.mix(SubClass.prototype, px);
  }
  _$jscoverage['/base.js'].lineData[463]++;
  function onSetAttrChange(e) {
    _$jscoverage['/base.js'].functionData[21]++;
    _$jscoverage['/base.js'].lineData[464]++;
    var self = this, method;
    _$jscoverage['/base.js'].lineData[467]++;
    if (visit51_467_1(e.target == self)) {
      _$jscoverage['/base.js'].lineData[468]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/base.js'].lineData[469]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/base.js'].lineData[473]++;
  function addAttrs(host, attrs) {
    _$jscoverage['/base.js'].functionData[22]++;
    _$jscoverage['/base.js'].lineData[474]++;
    if (visit52_474_1(attrs)) {
      _$jscoverage['/base.js'].lineData[475]++;
      for (var attr in attrs) {
        _$jscoverage['/base.js'].lineData[483]++;
        host.addAttr(attr, attrs[attr], false);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[488]++;
  function initAttrs(host, config) {
    _$jscoverage['/base.js'].functionData[23]++;
    _$jscoverage['/base.js'].lineData[489]++;
    if (visit53_489_1(config)) {
      _$jscoverage['/base.js'].lineData[490]++;
      for (var attr in config) {
        _$jscoverage['/base.js'].lineData[492]++;
        host.setInternal(attr, config[attr]);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[497]++;
  function constructPlugins(self) {
    _$jscoverage['/base.js'].functionData[24]++;
    _$jscoverage['/base.js'].lineData[498]++;
    var plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[499]++;
    S.each(plugins, function(plugin, i) {
  _$jscoverage['/base.js'].functionData[25]++;
  _$jscoverage['/base.js'].lineData[500]++;
  if (visit54_500_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[501]++;
    plugins[i] = new plugin();
  }
});
  }
  _$jscoverage['/base.js'].lineData[506]++;
  function wrapper(fn) {
    _$jscoverage['/base.js'].functionData[26]++;
    _$jscoverage['/base.js'].lineData[507]++;
    return function() {
  _$jscoverage['/base.js'].functionData[27]++;
  _$jscoverage['/base.js'].lineData[508]++;
  return fn.apply(this, arguments);
};
  }
  _$jscoverage['/base.js'].lineData[512]++;
  function wrapProtoForSuper(px, SubClass, hooks) {
    _$jscoverage['/base.js'].functionData[28]++;
    _$jscoverage['/base.js'].lineData[513]++;
    var extensions = SubClass.__extensions__;
    _$jscoverage['/base.js'].lineData[514]++;
    if (visit55_514_1(extensions.length)) {
      _$jscoverage['/base.js'].lineData[515]++;
      for (p in hooks) {
        _$jscoverage['/base.js'].lineData[516]++;
        px[p] = visit56_516_1(px[p] || noop);
      }
    }
    _$jscoverage['/base.js'].lineData[520]++;
    for (var p in hooks) {
      _$jscoverage['/base.js'].lineData[521]++;
      if (visit57_521_1(p in px)) {
        _$jscoverage['/base.js'].lineData[522]++;
        px[p] = hooks[p](px[p]);
      }
    }
    _$jscoverage['/base.js'].lineData[525]++;
    S.each(px, function(v, p) {
  _$jscoverage['/base.js'].functionData[29]++;
  _$jscoverage['/base.js'].lineData[526]++;
  if (visit58_526_1(typeof v == 'function')) {
    _$jscoverage['/base.js'].lineData[527]++;
    var wrapped = 0;
    _$jscoverage['/base.js'].lineData[528]++;
    if (visit59_528_1(v.__owner__)) {
      _$jscoverage['/base.js'].lineData[529]++;
      var originalOwner = v.__owner__;
      _$jscoverage['/base.js'].lineData[530]++;
      delete v.__owner__;
      _$jscoverage['/base.js'].lineData[531]++;
      delete v.__name__;
      _$jscoverage['/base.js'].lineData[532]++;
      wrapped = v.__wrapped__ = 1;
      _$jscoverage['/base.js'].lineData[533]++;
      var newV = wrapper(v);
      _$jscoverage['/base.js'].lineData[534]++;
      newV.__owner__ = originalOwner;
      _$jscoverage['/base.js'].lineData[535]++;
      newV.__name__ = p;
      _$jscoverage['/base.js'].lineData[536]++;
      originalOwner.prototype[p] = newV;
    } else {
      _$jscoverage['/base.js'].lineData[537]++;
      if (visit60_537_1(v.__wrapped__)) {
        _$jscoverage['/base.js'].lineData[538]++;
        wrapped = 1;
      }
    }
    _$jscoverage['/base.js'].lineData[540]++;
    if (visit61_540_1(wrapped)) {
      _$jscoverage['/base.js'].lineData[541]++;
      px[p] = v = wrapper(v);
    }
    _$jscoverage['/base.js'].lineData[543]++;
    v.__owner__ = SubClass;
    _$jscoverage['/base.js'].lineData[544]++;
    v.__name__ = p;
  }
});
  }
  _$jscoverage['/base.js'].lineData[549]++;
  function callPluginsMethod(method) {
    _$jscoverage['/base.js'].functionData[30]++;
    _$jscoverage['/base.js'].lineData[550]++;
    var len, self = this, plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[553]++;
    if (visit62_553_1(len = plugins.length)) {
      _$jscoverage['/base.js'].lineData[554]++;
      for (var i = 0; visit63_554_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[555]++;
        visit64_555_1(plugins[i][method] && plugins[i][method](self));
      }
    }
  }
  _$jscoverage['/base.js'].lineData[560]++;
  function callExtensionsMethod(self, extensions, method, args) {
    _$jscoverage['/base.js'].functionData[31]++;
    _$jscoverage['/base.js'].lineData[561]++;
    var len;
    _$jscoverage['/base.js'].lineData[562]++;
    if (visit65_562_1(len = visit66_562_2(extensions && extensions.length))) {
      _$jscoverage['/base.js'].lineData[563]++;
      for (var i = 0; visit67_563_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[564]++;
        var fn = visit68_564_1(extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method]));
        _$jscoverage['/base.js'].lineData[569]++;
        if (visit69_569_1(fn)) {
          _$jscoverage['/base.js'].lineData[570]++;
          fn.apply(self, visit70_570_1(args || []));
        }
      }
    }
  }
});
