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
if (! _$jscoverage['/base/style.js']) {
  _$jscoverage['/base/style.js'] = {};
  _$jscoverage['/base/style.js'].lineData = [];
  _$jscoverage['/base/style.js'].lineData[6] = 0;
  _$jscoverage['/base/style.js'].lineData[7] = 0;
  _$jscoverage['/base/style.js'].lineData[9] = 0;
  _$jscoverage['/base/style.js'].lineData[10] = 0;
  _$jscoverage['/base/style.js'].lineData[14] = 0;
  _$jscoverage['/base/style.js'].lineData[15] = 0;
  _$jscoverage['/base/style.js'].lineData[16] = 0;
  _$jscoverage['/base/style.js'].lineData[18] = 0;
  _$jscoverage['/base/style.js'].lineData[19] = 0;
  _$jscoverage['/base/style.js'].lineData[22] = 0;
  _$jscoverage['/base/style.js'].lineData[23] = 0;
  _$jscoverage['/base/style.js'].lineData[28] = 0;
  _$jscoverage['/base/style.js'].lineData[31] = 0;
  _$jscoverage['/base/style.js'].lineData[32] = 0;
  _$jscoverage['/base/style.js'].lineData[33] = 0;
  _$jscoverage['/base/style.js'].lineData[34] = 0;
  _$jscoverage['/base/style.js'].lineData[35] = 0;
  _$jscoverage['/base/style.js'].lineData[42] = 0;
  _$jscoverage['/base/style.js'].lineData[44] = 0;
  _$jscoverage['/base/style.js'].lineData[47] = 0;
  _$jscoverage['/base/style.js'].lineData[48] = 0;
  _$jscoverage['/base/style.js'].lineData[49] = 0;
  _$jscoverage['/base/style.js'].lineData[50] = 0;
  _$jscoverage['/base/style.js'].lineData[96] = 0;
  _$jscoverage['/base/style.js'].lineData[98] = 0;
  _$jscoverage['/base/style.js'].lineData[99] = 0;
  _$jscoverage['/base/style.js'].lineData[100] = 0;
  _$jscoverage['/base/style.js'].lineData[102] = 0;
  _$jscoverage['/base/style.js'].lineData[103] = 0;
  _$jscoverage['/base/style.js'].lineData[106] = 0;
  _$jscoverage['/base/style.js'].lineData[107] = 0;
  _$jscoverage['/base/style.js'].lineData[110] = 0;
  _$jscoverage['/base/style.js'].lineData[111] = 0;
  _$jscoverage['/base/style.js'].lineData[112] = 0;
  _$jscoverage['/base/style.js'].lineData[114] = 0;
  _$jscoverage['/base/style.js'].lineData[115] = 0;
  _$jscoverage['/base/style.js'].lineData[116] = 0;
  _$jscoverage['/base/style.js'].lineData[118] = 0;
  _$jscoverage['/base/style.js'].lineData[120] = 0;
  _$jscoverage['/base/style.js'].lineData[123] = 0;
  _$jscoverage['/base/style.js'].lineData[135] = 0;
  _$jscoverage['/base/style.js'].lineData[142] = 0;
  _$jscoverage['/base/style.js'].lineData[145] = 0;
  _$jscoverage['/base/style.js'].lineData[146] = 0;
  _$jscoverage['/base/style.js'].lineData[150] = 0;
  _$jscoverage['/base/style.js'].lineData[151] = 0;
  _$jscoverage['/base/style.js'].lineData[155] = 0;
  _$jscoverage['/base/style.js'].lineData[156] = 0;
  _$jscoverage['/base/style.js'].lineData[157] = 0;
  _$jscoverage['/base/style.js'].lineData[158] = 0;
  _$jscoverage['/base/style.js'].lineData[159] = 0;
  _$jscoverage['/base/style.js'].lineData[161] = 0;
  _$jscoverage['/base/style.js'].lineData[162] = 0;
  _$jscoverage['/base/style.js'].lineData[164] = 0;
  _$jscoverage['/base/style.js'].lineData[165] = 0;
  _$jscoverage['/base/style.js'].lineData[166] = 0;
  _$jscoverage['/base/style.js'].lineData[169] = 0;
  _$jscoverage['/base/style.js'].lineData[182] = 0;
  _$jscoverage['/base/style.js'].lineData[187] = 0;
  _$jscoverage['/base/style.js'].lineData[188] = 0;
  _$jscoverage['/base/style.js'].lineData[189] = 0;
  _$jscoverage['/base/style.js'].lineData[190] = 0;
  _$jscoverage['/base/style.js'].lineData[193] = 0;
  _$jscoverage['/base/style.js'].lineData[195] = 0;
  _$jscoverage['/base/style.js'].lineData[196] = 0;
  _$jscoverage['/base/style.js'].lineData[197] = 0;
  _$jscoverage['/base/style.js'].lineData[198] = 0;
  _$jscoverage['/base/style.js'].lineData[200] = 0;
  _$jscoverage['/base/style.js'].lineData[202] = 0;
  _$jscoverage['/base/style.js'].lineData[203] = 0;
  _$jscoverage['/base/style.js'].lineData[206] = 0;
  _$jscoverage['/base/style.js'].lineData[219] = 0;
  _$jscoverage['/base/style.js'].lineData[226] = 0;
  _$jscoverage['/base/style.js'].lineData[227] = 0;
  _$jscoverage['/base/style.js'].lineData[228] = 0;
  _$jscoverage['/base/style.js'].lineData[229] = 0;
  _$jscoverage['/base/style.js'].lineData[232] = 0;
  _$jscoverage['/base/style.js'].lineData[235] = 0;
  _$jscoverage['/base/style.js'].lineData[236] = 0;
  _$jscoverage['/base/style.js'].lineData[238] = 0;
  _$jscoverage['/base/style.js'].lineData[240] = 0;
  _$jscoverage['/base/style.js'].lineData[241] = 0;
  _$jscoverage['/base/style.js'].lineData[243] = 0;
  _$jscoverage['/base/style.js'].lineData[246] = 0;
  _$jscoverage['/base/style.js'].lineData[249] = 0;
  _$jscoverage['/base/style.js'].lineData[251] = 0;
  _$jscoverage['/base/style.js'].lineData[252] = 0;
  _$jscoverage['/base/style.js'].lineData[255] = 0;
  _$jscoverage['/base/style.js'].lineData[263] = 0;
  _$jscoverage['/base/style.js'].lineData[267] = 0;
  _$jscoverage['/base/style.js'].lineData[268] = 0;
  _$jscoverage['/base/style.js'].lineData[269] = 0;
  _$jscoverage['/base/style.js'].lineData[271] = 0;
  _$jscoverage['/base/style.js'].lineData[272] = 0;
  _$jscoverage['/base/style.js'].lineData[273] = 0;
  _$jscoverage['/base/style.js'].lineData[274] = 0;
  _$jscoverage['/base/style.js'].lineData[275] = 0;
  _$jscoverage['/base/style.js'].lineData[285] = 0;
  _$jscoverage['/base/style.js'].lineData[287] = 0;
  _$jscoverage['/base/style.js'].lineData[288] = 0;
  _$jscoverage['/base/style.js'].lineData[289] = 0;
  _$jscoverage['/base/style.js'].lineData[291] = 0;
  _$jscoverage['/base/style.js'].lineData[292] = 0;
  _$jscoverage['/base/style.js'].lineData[293] = 0;
  _$jscoverage['/base/style.js'].lineData[295] = 0;
  _$jscoverage['/base/style.js'].lineData[305] = 0;
  _$jscoverage['/base/style.js'].lineData[307] = 0;
  _$jscoverage['/base/style.js'].lineData[308] = 0;
  _$jscoverage['/base/style.js'].lineData[309] = 0;
  _$jscoverage['/base/style.js'].lineData[310] = 0;
  _$jscoverage['/base/style.js'].lineData[312] = 0;
  _$jscoverage['/base/style.js'].lineData[326] = 0;
  _$jscoverage['/base/style.js'].lineData[327] = 0;
  _$jscoverage['/base/style.js'].lineData[328] = 0;
  _$jscoverage['/base/style.js'].lineData[330] = 0;
  _$jscoverage['/base/style.js'].lineData[333] = 0;
  _$jscoverage['/base/style.js'].lineData[336] = 0;
  _$jscoverage['/base/style.js'].lineData[337] = 0;
  _$jscoverage['/base/style.js'].lineData[341] = 0;
  _$jscoverage['/base/style.js'].lineData[342] = 0;
  _$jscoverage['/base/style.js'].lineData[345] = 0;
  _$jscoverage['/base/style.js'].lineData[348] = 0;
  _$jscoverage['/base/style.js'].lineData[350] = 0;
  _$jscoverage['/base/style.js'].lineData[351] = 0;
  _$jscoverage['/base/style.js'].lineData[353] = 0;
  _$jscoverage['/base/style.js'].lineData[362] = 0;
  _$jscoverage['/base/style.js'].lineData[370] = 0;
  _$jscoverage['/base/style.js'].lineData[371] = 0;
  _$jscoverage['/base/style.js'].lineData[372] = 0;
  _$jscoverage['/base/style.js'].lineData[373] = 0;
  _$jscoverage['/base/style.js'].lineData[374] = 0;
  _$jscoverage['/base/style.js'].lineData[375] = 0;
  _$jscoverage['/base/style.js'].lineData[376] = 0;
  _$jscoverage['/base/style.js'].lineData[377] = 0;
  _$jscoverage['/base/style.js'].lineData[378] = 0;
  _$jscoverage['/base/style.js'].lineData[383] = 0;
  _$jscoverage['/base/style.js'].lineData[384] = 0;
  _$jscoverage['/base/style.js'].lineData[385] = 0;
  _$jscoverage['/base/style.js'].lineData[443] = 0;
  _$jscoverage['/base/style.js'].lineData[444] = 0;
  _$jscoverage['/base/style.js'].lineData[445] = 0;
  _$jscoverage['/base/style.js'].lineData[446] = 0;
  _$jscoverage['/base/style.js'].lineData[449] = 0;
  _$jscoverage['/base/style.js'].lineData[450] = 0;
  _$jscoverage['/base/style.js'].lineData[451] = 0;
  _$jscoverage['/base/style.js'].lineData[453] = 0;
  _$jscoverage['/base/style.js'].lineData[455] = 0;
  _$jscoverage['/base/style.js'].lineData[456] = 0;
  _$jscoverage['/base/style.js'].lineData[457] = 0;
  _$jscoverage['/base/style.js'].lineData[458] = 0;
  _$jscoverage['/base/style.js'].lineData[459] = 0;
  _$jscoverage['/base/style.js'].lineData[460] = 0;
  _$jscoverage['/base/style.js'].lineData[461] = 0;
  _$jscoverage['/base/style.js'].lineData[462] = 0;
  _$jscoverage['/base/style.js'].lineData[464] = 0;
  _$jscoverage['/base/style.js'].lineData[466] = 0;
  _$jscoverage['/base/style.js'].lineData[468] = 0;
  _$jscoverage['/base/style.js'].lineData[474] = 0;
  _$jscoverage['/base/style.js'].lineData[479] = 0;
  _$jscoverage['/base/style.js'].lineData[480] = 0;
  _$jscoverage['/base/style.js'].lineData[481] = 0;
  _$jscoverage['/base/style.js'].lineData[483] = 0;
  _$jscoverage['/base/style.js'].lineData[488] = 0;
  _$jscoverage['/base/style.js'].lineData[490] = 0;
  _$jscoverage['/base/style.js'].lineData[491] = 0;
  _$jscoverage['/base/style.js'].lineData[493] = 0;
  _$jscoverage['/base/style.js'].lineData[496] = 0;
  _$jscoverage['/base/style.js'].lineData[497] = 0;
  _$jscoverage['/base/style.js'].lineData[498] = 0;
  _$jscoverage['/base/style.js'].lineData[499] = 0;
  _$jscoverage['/base/style.js'].lineData[501] = 0;
  _$jscoverage['/base/style.js'].lineData[502] = 0;
  _$jscoverage['/base/style.js'].lineData[503] = 0;
  _$jscoverage['/base/style.js'].lineData[504] = 0;
  _$jscoverage['/base/style.js'].lineData[507] = 0;
  _$jscoverage['/base/style.js'].lineData[508] = 0;
  _$jscoverage['/base/style.js'].lineData[511] = 0;
  _$jscoverage['/base/style.js'].lineData[516] = 0;
  _$jscoverage['/base/style.js'].lineData[517] = 0;
  _$jscoverage['/base/style.js'].lineData[522] = 0;
  _$jscoverage['/base/style.js'].lineData[523] = 0;
  _$jscoverage['/base/style.js'].lineData[524] = 0;
  _$jscoverage['/base/style.js'].lineData[527] = 0;
  _$jscoverage['/base/style.js'].lineData[530] = 0;
  _$jscoverage['/base/style.js'].lineData[531] = 0;
  _$jscoverage['/base/style.js'].lineData[535] = 0;
  _$jscoverage['/base/style.js'].lineData[536] = 0;
  _$jscoverage['/base/style.js'].lineData[539] = 0;
  _$jscoverage['/base/style.js'].lineData[541] = 0;
  _$jscoverage['/base/style.js'].lineData[543] = 0;
  _$jscoverage['/base/style.js'].lineData[544] = 0;
  _$jscoverage['/base/style.js'].lineData[545] = 0;
  _$jscoverage['/base/style.js'].lineData[547] = 0;
  _$jscoverage['/base/style.js'].lineData[549] = 0;
  _$jscoverage['/base/style.js'].lineData[550] = 0;
  _$jscoverage['/base/style.js'].lineData[551] = 0;
  _$jscoverage['/base/style.js'].lineData[553] = 0;
  _$jscoverage['/base/style.js'].lineData[555] = 0;
  _$jscoverage['/base/style.js'].lineData[556] = 0;
  _$jscoverage['/base/style.js'].lineData[558] = 0;
  _$jscoverage['/base/style.js'].lineData[560] = 0;
  _$jscoverage['/base/style.js'].lineData[562] = 0;
  _$jscoverage['/base/style.js'].lineData[564] = 0;
  _$jscoverage['/base/style.js'].lineData[567] = 0;
  _$jscoverage['/base/style.js'].lineData[568] = 0;
  _$jscoverage['/base/style.js'].lineData[571] = 0;
  _$jscoverage['/base/style.js'].lineData[574] = 0;
  _$jscoverage['/base/style.js'].lineData[575] = 0;
  _$jscoverage['/base/style.js'].lineData[577] = 0;
  _$jscoverage['/base/style.js'].lineData[579] = 0;
  _$jscoverage['/base/style.js'].lineData[582] = 0;
  _$jscoverage['/base/style.js'].lineData[585] = 0;
  _$jscoverage['/base/style.js'].lineData[587] = 0;
  _$jscoverage['/base/style.js'].lineData[592] = 0;
  _$jscoverage['/base/style.js'].lineData[593] = 0;
  _$jscoverage['/base/style.js'].lineData[596] = 0;
  _$jscoverage['/base/style.js'].lineData[597] = 0;
  _$jscoverage['/base/style.js'].lineData[599] = 0;
  _$jscoverage['/base/style.js'].lineData[600] = 0;
  _$jscoverage['/base/style.js'].lineData[603] = 0;
  _$jscoverage['/base/style.js'].lineData[606] = 0;
  _$jscoverage['/base/style.js'].lineData[607] = 0;
  _$jscoverage['/base/style.js'].lineData[608] = 0;
  _$jscoverage['/base/style.js'].lineData[609] = 0;
  _$jscoverage['/base/style.js'].lineData[610] = 0;
  _$jscoverage['/base/style.js'].lineData[611] = 0;
  _$jscoverage['/base/style.js'].lineData[612] = 0;
  _$jscoverage['/base/style.js'].lineData[613] = 0;
  _$jscoverage['/base/style.js'].lineData[614] = 0;
  _$jscoverage['/base/style.js'].lineData[616] = 0;
  _$jscoverage['/base/style.js'].lineData[618] = 0;
  _$jscoverage['/base/style.js'].lineData[622] = 0;
  _$jscoverage['/base/style.js'].lineData[625] = 0;
  _$jscoverage['/base/style.js'].lineData[626] = 0;
  _$jscoverage['/base/style.js'].lineData[629] = 0;
  _$jscoverage['/base/style.js'].lineData[630] = 0;
  _$jscoverage['/base/style.js'].lineData[632] = 0;
  _$jscoverage['/base/style.js'].lineData[634] = 0;
  _$jscoverage['/base/style.js'].lineData[636] = 0;
  _$jscoverage['/base/style.js'].lineData[647] = 0;
  _$jscoverage['/base/style.js'].lineData[648] = 0;
  _$jscoverage['/base/style.js'].lineData[649] = 0;
  _$jscoverage['/base/style.js'].lineData[650] = 0;
  _$jscoverage['/base/style.js'].lineData[651] = 0;
  _$jscoverage['/base/style.js'].lineData[653] = 0;
  _$jscoverage['/base/style.js'].lineData[655] = 0;
  _$jscoverage['/base/style.js'].lineData[656] = 0;
  _$jscoverage['/base/style.js'].lineData[657] = 0;
  _$jscoverage['/base/style.js'].lineData[658] = 0;
  _$jscoverage['/base/style.js'].lineData[659] = 0;
  _$jscoverage['/base/style.js'].lineData[661] = 0;
  _$jscoverage['/base/style.js'].lineData[662] = 0;
  _$jscoverage['/base/style.js'].lineData[663] = 0;
  _$jscoverage['/base/style.js'].lineData[666] = 0;
  _$jscoverage['/base/style.js'].lineData[668] = 0;
  _$jscoverage['/base/style.js'].lineData[669] = 0;
  _$jscoverage['/base/style.js'].lineData[671] = 0;
  _$jscoverage['/base/style.js'].lineData[672] = 0;
  _$jscoverage['/base/style.js'].lineData[673] = 0;
  _$jscoverage['/base/style.js'].lineData[674] = 0;
  _$jscoverage['/base/style.js'].lineData[675] = 0;
  _$jscoverage['/base/style.js'].lineData[678] = 0;
  _$jscoverage['/base/style.js'].lineData[680] = 0;
  _$jscoverage['/base/style.js'].lineData[681] = 0;
  _$jscoverage['/base/style.js'].lineData[686] = 0;
  _$jscoverage['/base/style.js'].lineData[691] = 0;
  _$jscoverage['/base/style.js'].lineData[693] = 0;
  _$jscoverage['/base/style.js'].lineData[694] = 0;
  _$jscoverage['/base/style.js'].lineData[698] = 0;
  _$jscoverage['/base/style.js'].lineData[699] = 0;
  _$jscoverage['/base/style.js'].lineData[704] = 0;
  _$jscoverage['/base/style.js'].lineData[705] = 0;
  _$jscoverage['/base/style.js'].lineData[706] = 0;
  _$jscoverage['/base/style.js'].lineData[707] = 0;
  _$jscoverage['/base/style.js'].lineData[708] = 0;
  _$jscoverage['/base/style.js'].lineData[711] = 0;
  _$jscoverage['/base/style.js'].lineData[712] = 0;
  _$jscoverage['/base/style.js'].lineData[716] = 0;
  _$jscoverage['/base/style.js'].lineData[722] = 0;
  _$jscoverage['/base/style.js'].lineData[723] = 0;
  _$jscoverage['/base/style.js'].lineData[724] = 0;
  _$jscoverage['/base/style.js'].lineData[726] = 0;
  _$jscoverage['/base/style.js'].lineData[728] = 0;
  _$jscoverage['/base/style.js'].lineData[731] = 0;
}
if (! _$jscoverage['/base/style.js'].functionData) {
  _$jscoverage['/base/style.js'].functionData = [];
  _$jscoverage['/base/style.js'].functionData[0] = 0;
  _$jscoverage['/base/style.js'].functionData[1] = 0;
  _$jscoverage['/base/style.js'].functionData[2] = 0;
  _$jscoverage['/base/style.js'].functionData[3] = 0;
  _$jscoverage['/base/style.js'].functionData[4] = 0;
  _$jscoverage['/base/style.js'].functionData[5] = 0;
  _$jscoverage['/base/style.js'].functionData[6] = 0;
  _$jscoverage['/base/style.js'].functionData[7] = 0;
  _$jscoverage['/base/style.js'].functionData[8] = 0;
  _$jscoverage['/base/style.js'].functionData[9] = 0;
  _$jscoverage['/base/style.js'].functionData[10] = 0;
  _$jscoverage['/base/style.js'].functionData[11] = 0;
  _$jscoverage['/base/style.js'].functionData[12] = 0;
  _$jscoverage['/base/style.js'].functionData[13] = 0;
  _$jscoverage['/base/style.js'].functionData[14] = 0;
  _$jscoverage['/base/style.js'].functionData[15] = 0;
  _$jscoverage['/base/style.js'].functionData[16] = 0;
  _$jscoverage['/base/style.js'].functionData[17] = 0;
  _$jscoverage['/base/style.js'].functionData[18] = 0;
  _$jscoverage['/base/style.js'].functionData[19] = 0;
  _$jscoverage['/base/style.js'].functionData[20] = 0;
  _$jscoverage['/base/style.js'].functionData[21] = 0;
  _$jscoverage['/base/style.js'].functionData[22] = 0;
  _$jscoverage['/base/style.js'].functionData[23] = 0;
  _$jscoverage['/base/style.js'].functionData[24] = 0;
  _$jscoverage['/base/style.js'].functionData[25] = 0;
  _$jscoverage['/base/style.js'].functionData[26] = 0;
  _$jscoverage['/base/style.js'].functionData[27] = 0;
  _$jscoverage['/base/style.js'].functionData[28] = 0;
  _$jscoverage['/base/style.js'].functionData[29] = 0;
  _$jscoverage['/base/style.js'].functionData[30] = 0;
}
if (! _$jscoverage['/base/style.js'].branchData) {
  _$jscoverage['/base/style.js'].branchData = {};
  _$jscoverage['/base/style.js'].branchData['15'] = [];
  _$jscoverage['/base/style.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['18'] = [];
  _$jscoverage['/base/style.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['22'] = [];
  _$jscoverage['/base/style.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['31'] = [];
  _$jscoverage['/base/style.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['34'] = [];
  _$jscoverage['/base/style.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['42'] = [];
  _$jscoverage['/base/style.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['60'] = [];
  _$jscoverage['/base/style.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['61'] = [];
  _$jscoverage['/base/style.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['93'] = [];
  _$jscoverage['/base/style.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['99'] = [];
  _$jscoverage['/base/style.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['103'] = [];
  _$jscoverage['/base/style.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['103'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['110'] = [];
  _$jscoverage['/base/style.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['111'] = [];
  _$jscoverage['/base/style.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['145'] = [];
  _$jscoverage['/base/style.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['146'] = [];
  _$jscoverage['/base/style.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['150'] = [];
  _$jscoverage['/base/style.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['150'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['155'] = [];
  _$jscoverage['/base/style.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['187'] = [];
  _$jscoverage['/base/style.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['189'] = [];
  _$jscoverage['/base/style.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['195'] = [];
  _$jscoverage['/base/style.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['197'] = [];
  _$jscoverage['/base/style.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['202'] = [];
  _$jscoverage['/base/style.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['226'] = [];
  _$jscoverage['/base/style.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['228'] = [];
  _$jscoverage['/base/style.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['238'] = [];
  _$jscoverage['/base/style.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['241'] = [];
  _$jscoverage['/base/style.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['243'] = [];
  _$jscoverage['/base/style.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['243'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['243'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['244'] = [];
  _$jscoverage['/base/style.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['249'] = [];
  _$jscoverage['/base/style.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['251'] = [];
  _$jscoverage['/base/style.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['267'] = [];
  _$jscoverage['/base/style.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['269'] = [];
  _$jscoverage['/base/style.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['271'] = [];
  _$jscoverage['/base/style.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['287'] = [];
  _$jscoverage['/base/style.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['291'] = [];
  _$jscoverage['/base/style.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['292'] = [];
  _$jscoverage['/base/style.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['307'] = [];
  _$jscoverage['/base/style.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['309'] = [];
  _$jscoverage['/base/style.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['326'] = [];
  _$jscoverage['/base/style.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['336'] = [];
  _$jscoverage['/base/style.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['341'] = [];
  _$jscoverage['/base/style.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['350'] = [];
  _$jscoverage['/base/style.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['370'] = [];
  _$jscoverage['/base/style.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['377'] = [];
  _$jscoverage['/base/style.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['384'] = [];
  _$jscoverage['/base/style.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['446'] = [];
  _$jscoverage['/base/style.js'].branchData['446'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['451'] = [];
  _$jscoverage['/base/style.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['453'] = [];
  _$jscoverage['/base/style.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['457'] = [];
  _$jscoverage['/base/style.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['458'] = [];
  _$jscoverage['/base/style.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['461'] = [];
  _$jscoverage['/base/style.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['468'] = [];
  _$jscoverage['/base/style.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['480'] = [];
  _$jscoverage['/base/style.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['496'] = [];
  _$jscoverage['/base/style.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['498'] = [];
  _$jscoverage['/base/style.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['502'] = [];
  _$jscoverage['/base/style.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['503'] = [];
  _$jscoverage['/base/style.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['503'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['507'] = [];
  _$jscoverage['/base/style.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['539'] = [];
  _$jscoverage['/base/style.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['539'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['540'] = [];
  _$jscoverage['/base/style.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['540'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['547'] = [];
  _$jscoverage['/base/style.js'].branchData['547'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['549'] = [];
  _$jscoverage['/base/style.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['549'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['549'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['551'] = [];
  _$jscoverage['/base/style.js'].branchData['551'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['555'] = [];
  _$jscoverage['/base/style.js'].branchData['555'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['558'] = [];
  _$jscoverage['/base/style.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['567'] = [];
  _$jscoverage['/base/style.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['567'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['571'] = [];
  _$jscoverage['/base/style.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['574'] = [];
  _$jscoverage['/base/style.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['582'] = [];
  _$jscoverage['/base/style.js'].branchData['582'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['582'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['582'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['583'] = [];
  _$jscoverage['/base/style.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['587'] = [];
  _$jscoverage['/base/style.js'].branchData['587'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['596'] = [];
  _$jscoverage['/base/style.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['608'] = [];
  _$jscoverage['/base/style.js'].branchData['608'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['610'] = [];
  _$jscoverage['/base/style.js'].branchData['610'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['611'] = [];
  _$jscoverage['/base/style.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['613'] = [];
  _$jscoverage['/base/style.js'].branchData['613'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['618'] = [];
  _$jscoverage['/base/style.js'].branchData['618'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['626'] = [];
  _$jscoverage['/base/style.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['632'] = [];
  _$jscoverage['/base/style.js'].branchData['632'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['648'] = [];
  _$jscoverage['/base/style.js'].branchData['648'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['649'] = [];
  _$jscoverage['/base/style.js'].branchData['649'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['650'] = [];
  _$jscoverage['/base/style.js'].branchData['650'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['651'] = [];
  _$jscoverage['/base/style.js'].branchData['651'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['653'] = [];
  _$jscoverage['/base/style.js'].branchData['653'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['654'] = [];
  _$jscoverage['/base/style.js'].branchData['654'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['658'] = [];
  _$jscoverage['/base/style.js'].branchData['658'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['658'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['658'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['662'] = [];
  _$jscoverage['/base/style.js'].branchData['662'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['662'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['662'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['663'] = [];
  _$jscoverage['/base/style.js'].branchData['663'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['666'] = [];
  _$jscoverage['/base/style.js'].branchData['666'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['668'] = [];
  _$jscoverage['/base/style.js'].branchData['668'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['671'] = [];
  _$jscoverage['/base/style.js'].branchData['671'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['671'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['672'] = [];
  _$jscoverage['/base/style.js'].branchData['672'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['673'] = [];
  _$jscoverage['/base/style.js'].branchData['673'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['674'] = [];
  _$jscoverage['/base/style.js'].branchData['674'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['680'] = [];
  _$jscoverage['/base/style.js'].branchData['680'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['681'] = [];
  _$jscoverage['/base/style.js'].branchData['681'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['682'] = [];
  _$jscoverage['/base/style.js'].branchData['682'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['698'] = [];
  _$jscoverage['/base/style.js'].branchData['698'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['707'] = [];
  _$jscoverage['/base/style.js'].branchData['707'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['708'] = [];
  _$jscoverage['/base/style.js'].branchData['708'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['711'] = [];
  _$jscoverage['/base/style.js'].branchData['711'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['712'] = [];
  _$jscoverage['/base/style.js'].branchData['712'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['723'] = [];
  _$jscoverage['/base/style.js'].branchData['723'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['723'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['724'] = [];
  _$jscoverage['/base/style.js'].branchData['724'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['724'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['725'] = [];
  _$jscoverage['/base/style.js'].branchData['725'][1] = new BranchData();
}
_$jscoverage['/base/style.js'].branchData['725'][1].init(52, 46, 'Dom.css(offsetParent, \'position\') === \'static\'');
function visit518_725_1(result) {
  _$jscoverage['/base/style.js'].branchData['725'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['724'][2].init(110, 99, '!ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit517_724_2(result) {
  _$jscoverage['/base/style.js'].branchData['724'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['724'][1].init(94, 115, 'offsetParent && !ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit516_724_1(result) {
  _$jscoverage['/base/style.js'].branchData['724'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['723'][2].init(48, 23, 'el.ownerDocument || doc');
function visit515_723_2(result) {
  _$jscoverage['/base/style.js'].branchData['723'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['723'][1].init(28, 49, 'el.offsetParent || (el.ownerDocument || doc).body');
function visit514_723_1(result) {
  _$jscoverage['/base/style.js'].branchData['723'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['712'][1].init(806, 42, 'parseFloat(Dom.css(el, \'marginLeft\')) || 0');
function visit513_712_1(result) {
  _$jscoverage['/base/style.js'].branchData['712'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['711'][1].init(740, 41, 'parseFloat(Dom.css(el, \'marginTop\')) || 0');
function visit512_711_1(result) {
  _$jscoverage['/base/style.js'].branchData['711'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['708'][1].init(438, 57, 'parseFloat(Dom.css(offsetParent, \'borderLeftWidth\')) || 0');
function visit511_708_1(result) {
  _$jscoverage['/base/style.js'].branchData['708'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['707'][1].init(347, 56, 'parseFloat(Dom.css(offsetParent, \'borderTopWidth\')) || 0');
function visit510_707_1(result) {
  _$jscoverage['/base/style.js'].branchData['707'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['698'][1].init(106, 35, 'Dom.css(el, \'position\') === \'fixed\'');
function visit509_698_1(result) {
  _$jscoverage['/base/style.js'].branchData['698'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['682'][1].init(45, 23, 'extra === PADDING_INDEX');
function visit508_682_1(result) {
  _$jscoverage['/base/style.js'].branchData['682'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['681'][1].init(27, 22, 'extra === BORDER_INDEX');
function visit507_681_1(result) {
  _$jscoverage['/base/style.js'].branchData['681'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['680'][1].init(1600, 27, 'borderBoxValueOrIsBorderBox');
function visit506_680_1(result) {
  _$jscoverage['/base/style.js'].branchData['680'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['674'][1].init(17, 27, 'borderBoxValueOrIsBorderBox');
function visit505_674_1(result) {
  _$jscoverage['/base/style.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['673'][1].init(1322, 23, 'extra === CONTENT_INDEX');
function visit504_673_1(result) {
  _$jscoverage['/base/style.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['672'][1].init(1279, 29, 'borderBoxValue || cssBoxValue');
function visit503_672_1(result) {
  _$jscoverage['/base/style.js'].branchData['672'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['671'][2].init(1216, 28, 'borderBoxValue !== undefined');
function visit502_671_2(result) {
  _$jscoverage['/base/style.js'].branchData['671'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['671'][1].init(1216, 43, 'borderBoxValue !== undefined || isBorderBox');
function visit501_671_1(result) {
  _$jscoverage['/base/style.js'].branchData['671'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['668'][1].init(1077, 19, 'extra === undefined');
function visit500_668_1(result) {
  _$jscoverage['/base/style.js'].branchData['668'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['666'][1].init(408, 28, 'parseFloat(cssBoxValue) || 0');
function visit499_666_1(result) {
  _$jscoverage['/base/style.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['663'][1].init(31, 23, 'elem.style[name] || 0');
function visit498_663_1(result) {
  _$jscoverage['/base/style.js'].branchData['663'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['662'][3].init(228, 24, '(Number(cssBoxValue)) < 0');
function visit497_662_3(result) {
  _$jscoverage['/base/style.js'].branchData['662'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['662'][2].init(204, 19, 'cssBoxValue == null');
function visit496_662_2(result) {
  _$jscoverage['/base/style.js'].branchData['662'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['662'][1].init(204, 48, 'cssBoxValue == null || (Number(cssBoxValue)) < 0');
function visit495_662_1(result) {
  _$jscoverage['/base/style.js'].branchData['662'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['658'][3].init(595, 19, 'borderBoxValue <= 0');
function visit494_658_3(result) {
  _$jscoverage['/base/style.js'].branchData['658'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['658'][2].init(569, 22, 'borderBoxValue == null');
function visit493_658_2(result) {
  _$jscoverage['/base/style.js'].branchData['658'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['658'][1].init(569, 45, 'borderBoxValue == null || borderBoxValue <= 0');
function visit492_658_1(result) {
  _$jscoverage['/base/style.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['654'][1].init(96, 14, 'name === WIDTH');
function visit491_654_1(result) {
  _$jscoverage['/base/style.js'].branchData['654'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['653'][1].init(274, 14, 'name === WIDTH');
function visit490_653_1(result) {
  _$jscoverage['/base/style.js'].branchData['653'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['651'][1].init(20, 14, 'name === WIDTH');
function visit489_651_1(result) {
  _$jscoverage['/base/style.js'].branchData['651'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['650'][1].init(144, 19, 'elem.nodeType === 9');
function visit488_650_1(result) {
  _$jscoverage['/base/style.js'].branchData['650'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['649'][1].init(20, 14, 'name === WIDTH');
function visit487_649_1(result) {
  _$jscoverage['/base/style.js'].branchData['649'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['648'][1].init(13, 19, 'util.isWindow(elem)');
function visit486_648_1(result) {
  _$jscoverage['/base/style.js'].branchData['648'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['632'][1].init(78, 15, 'doc.defaultView');
function visit485_632_1(result) {
  _$jscoverage['/base/style.js'].branchData['632'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['626'][1].init(16, 72, 'Dom._getComputedStyle(elem, \'boxSizing\', computedStyle) === \'border-box\'');
function visit484_626_1(result) {
  _$jscoverage['/base/style.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['618'][1].init(271, 68, 'parseFloat(Dom._getComputedStyle(elem, cssProp, computedStyle)) || 0');
function visit483_618_1(result) {
  _$jscoverage['/base/style.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['613'][1].init(58, 17, 'prop === \'border\'');
function visit482_613_1(result) {
  _$jscoverage['/base/style.js'].branchData['613'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['611'][1].init(29, 16, 'i < which.length');
function visit481_611_1(result) {
  _$jscoverage['/base/style.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['610'][1].init(46, 4, 'prop');
function visit480_610_1(result) {
  _$jscoverage['/base/style.js'].branchData['610'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['608'][1].init(56, 16, 'j < props.length');
function visit479_608_1(result) {
  _$jscoverage['/base/style.js'].branchData['608'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['596'][1].init(124, 22, 'elem.offsetWidth !== 0');
function visit478_596_1(result) {
  _$jscoverage['/base/style.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['587'][1].init(326, 17, 'ret === undefined');
function visit477_587_1(result) {
  _$jscoverage['/base/style.js'].branchData['587'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['583'][1].init(33, 42, '(ret = hook.get(elem, false)) !== undefined');
function visit476_583_1(result) {
  _$jscoverage['/base/style.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['582'][3].init(103, 76, '\'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit475_582_3(result) {
  _$jscoverage['/base/style.js'].branchData['582'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['582'][2].init(95, 84, 'hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit474_582_2(result) {
  _$jscoverage['/base/style.js'].branchData['582'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['582'][1].init(93, 87, '!(hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined)');
function visit473_582_1(result) {
  _$jscoverage['/base/style.js'].branchData['582'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['574'][1].init(137, 9, 'UA.webkit');
function visit472_574_1(result) {
  _$jscoverage['/base/style.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['571'][1].init(849, 16, '!elStyle.cssText');
function visit471_571_1(result) {
  _$jscoverage['/base/style.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['567'][2].init(301, 13, 'val === EMPTY');
function visit470_567_2(result) {
  _$jscoverage['/base/style.js'].branchData['567'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['567'][1].init(301, 40, 'val === EMPTY && elStyle.removeAttribute');
function visit469_567_1(result) {
  _$jscoverage['/base/style.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['558'][1].init(385, 17, 'val !== undefined');
function visit468_558_1(result) {
  _$jscoverage['/base/style.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['555'][1].init(292, 16, 'hook && hook.set');
function visit467_555_1(result) {
  _$jscoverage['/base/style.js'].branchData['555'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['551'][1].init(134, 39, '!isNaN(Number(val)) && !cssNumber[name]');
function visit466_551_1(result) {
  _$jscoverage['/base/style.js'].branchData['551'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['549'][3].init(64, 13, 'val === EMPTY');
function visit465_549_3(result) {
  _$jscoverage['/base/style.js'].branchData['549'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['549'][2].init(48, 12, 'val === null');
function visit464_549_2(result) {
  _$jscoverage['/base/style.js'].branchData['549'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['549'][1].init(48, 29, 'val === null || val === EMPTY');
function visit463_549_1(result) {
  _$jscoverage['/base/style.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['547'][1].init(330, 17, 'val !== undefined');
function visit462_547_1(result) {
  _$jscoverage['/base/style.js'].branchData['547'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['540'][2].init(106, 19, 'elem.nodeType === 8');
function visit461_540_2(result) {
  _$jscoverage['/base/style.js'].branchData['540'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['540'][1].init(34, 46, 'elem.nodeType === 8 || !(elStyle = elem.style)');
function visit460_540_1(result) {
  _$jscoverage['/base/style.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['539'][2].init(69, 19, 'elem.nodeType === 3');
function visit459_539_2(result) {
  _$jscoverage['/base/style.js'].branchData['539'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['539'][1].init(69, 81, 'elem.nodeType === 3 || elem.nodeType === 8 || !(elStyle = elem.style)');
function visit458_539_1(result) {
  _$jscoverage['/base/style.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['507'][1].init(501, 37, 'isAutoPosition || NO_PX_REG.test(val)');
function visit457_507_1(result) {
  _$jscoverage['/base/style.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['503'][2].init(321, 23, 'position === \'relative\'');
function visit456_503_2(result) {
  _$jscoverage['/base/style.js'].branchData['503'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['503'][1].init(303, 41, 'isAutoPosition && position === \'relative\'');
function visit455_503_1(result) {
  _$jscoverage['/base/style.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['502'][1].init(263, 14, 'val === \'auto\'');
function visit454_502_1(result) {
  _$jscoverage['/base/style.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['498'][1].init(81, 21, 'position === \'static\'');
function visit453_498_1(result) {
  _$jscoverage['/base/style.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['496'][1].init(112, 8, 'computed');
function visit452_496_1(result) {
  _$jscoverage['/base/style.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['480'][1].init(46, 8, 'computed');
function visit451_480_1(result) {
  _$jscoverage['/base/style.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['468'][1].init(540, 53, 'elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX)');
function visit450_468_1(result) {
  _$jscoverage['/base/style.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['461'][1].init(163, 11, 'isBorderBox');
function visit449_461_1(result) {
  _$jscoverage['/base/style.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['458'][1].init(21, 4, 'elem');
function visit448_458_1(result) {
  _$jscoverage['/base/style.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['457'][1].init(59, 17, 'val !== undefined');
function visit447_457_1(result) {
  _$jscoverage['/base/style.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['453'][1].init(441, 14, 'name === WIDTH');
function visit446_453_1(result) {
  _$jscoverage['/base/style.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['451'][1].init(60, 79, 'el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX)');
function visit445_451_1(result) {
  _$jscoverage['/base/style.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['446'][1].init(60, 49, 'el && getWHIgnoreDisplay(el, name, PADDING_INDEX)');
function visit444_446_1(result) {
  _$jscoverage['/base/style.js'].branchData['446'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['384'][1].init(93, 6, 'j >= 0');
function visit443_384_1(result) {
  _$jscoverage['/base/style.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['377'][1].init(29, 39, '!util.inArray(getNodeName(e), excludes)');
function visit442_377_1(result) {
  _$jscoverage['/base/style.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['370'][1].init(272, 6, 'j >= 0');
function visit441_370_1(result) {
  _$jscoverage['/base/style.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['350'][1].init(744, 15, 'elem.styleSheet');
function visit440_350_1(result) {
  _$jscoverage['/base/style.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['341'][1].init(489, 4, 'elem');
function visit439_341_1(result) {
  _$jscoverage['/base/style.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['336'][1].init(329, 35, 'id && (id = id.replace(\'#\', EMPTY))');
function visit438_336_1(result) {
  _$jscoverage['/base/style.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['326'][1].init(21, 26, 'typeof refWin === \'string\'');
function visit437_326_1(result) {
  _$jscoverage['/base/style.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['309'][1].init(60, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit436_309_1(result) {
  _$jscoverage['/base/style.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['307'][1].init(118, 6, 'i >= 0');
function visit435_307_1(result) {
  _$jscoverage['/base/style.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['292'][1].init(29, 3, 'old');
function visit434_292_1(result) {
  _$jscoverage['/base/style.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['291'][1].init(150, 12, 'old !== NONE');
function visit433_291_1(result) {
  _$jscoverage['/base/style.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['287'][1].init(118, 6, 'i >= 0');
function visit432_287_1(result) {
  _$jscoverage['/base/style.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['271'][1].init(201, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit431_271_1(result) {
  _$jscoverage['/base/style.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['269'][1].init(78, 36, 'Dom.data(elem, OLD_DISPLAY) || EMPTY');
function visit430_269_1(result) {
  _$jscoverage['/base/style.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['267'][1].init(172, 6, 'i >= 0');
function visit429_267_1(result) {
  _$jscoverage['/base/style.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['251'][1].init(46, 6, 'i >= 0');
function visit428_251_1(result) {
  _$jscoverage['/base/style.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['249'][1].init(482, 26, 'typeof ret === \'undefined\'');
function visit427_249_1(result) {
  _$jscoverage['/base/style.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['244'][1].init(45, 41, '(ret = hook.get(elem, true)) !== undefined');
function visit426_244_1(result) {
  _$jscoverage['/base/style.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['243'][3].init(123, 87, '\'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit425_243_3(result) {
  _$jscoverage['/base/style.js'].branchData['243'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['243'][2].init(115, 95, 'hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit424_243_2(result) {
  _$jscoverage['/base/style.js'].branchData['243'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['243'][1].init(113, 98, '!(hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined)');
function visit423_243_1(result) {
  _$jscoverage['/base/style.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['241'][1].init(114, 4, 'elem');
function visit422_241_1(result) {
  _$jscoverage['/base/style.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['238'][1].init(648, 17, 'val === undefined');
function visit421_238_1(result) {
  _$jscoverage['/base/style.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['228'][1].init(50, 6, 'i >= 0');
function visit420_228_1(result) {
  _$jscoverage['/base/style.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['226'][1].init(233, 24, 'util.isPlainObject(name)');
function visit419_226_1(result) {
  _$jscoverage['/base/style.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['202'][1].init(46, 6, 'i >= 0');
function visit418_202_1(result) {
  _$jscoverage['/base/style.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['197'][1].init(55, 4, 'elem');
function visit417_197_1(result) {
  _$jscoverage['/base/style.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['195'][1].init(496, 17, 'val === undefined');
function visit416_195_1(result) {
  _$jscoverage['/base/style.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['189'][1].init(50, 6, 'i >= 0');
function visit415_189_1(result) {
  _$jscoverage['/base/style.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['187'][1].init(187, 24, 'util.isPlainObject(name)');
function visit414_187_1(result) {
  _$jscoverage['/base/style.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['155'][1].init(758, 51, 'Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)');
function visit413_155_1(result) {
  _$jscoverage['/base/style.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['150'][2].init(575, 10, 'val === \'\'');
function visit412_150_2(result) {
  _$jscoverage['/base/style.js'].branchData['150'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['150'][1].init(575, 36, 'val === \'\' && !Dom.contains(d, elem)');
function visit411_150_1(result) {
  _$jscoverage['/base/style.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['146'][1].init(27, 59, 'computedStyle.getPropertyValue(name) || computedStyle[name]');
function visit410_146_1(result) {
  _$jscoverage['/base/style.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['145'][1].init(344, 59, 'computedStyle || d.defaultView.getComputedStyle(elem, null)');
function visit409_145_1(result) {
  _$jscoverage['/base/style.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['111'][1].init(20, 31, 'doc.body || doc.documentElement');
function visit408_111_1(result) {
  _$jscoverage['/base/style.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['110'][1].init(101, 26, '!defaultDisplay[tagName]');
function visit407_110_1(result) {
  _$jscoverage['/base/style.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['103'][2].init(136, 29, 'vendor && vendor.propertyName');
function visit406_103_2(result) {
  _$jscoverage['/base/style.js'].branchData['103'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['103'][1].init(136, 37, 'vendor && vendor.propertyName || name');
function visit405_103_1(result) {
  _$jscoverage['/base/style.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['99'][1].init(13, 14, 'cssProps[name]');
function visit404_99_1(result) {
  _$jscoverage['/base/style.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['93'][1].init(1306, 57, 'userSelectVendorInfo && userSelectVendorInfo.propertyName');
function visit403_93_1(result) {
  _$jscoverage['/base/style.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['61'][1].init(334, 26, 'doc && doc.documentElement');
function visit402_61_1(result) {
  _$jscoverage['/base/style.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['60'][1].init(279, 27, 'globalWindow.document || {}');
function visit401_60_1(result) {
  _$jscoverage['/base/style.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['42'][1].init(601, 25, 'vendorInfos[name] || null');
function visit400_42_1(result) {
  _$jscoverage['/base/style.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['34'][1].init(149, 34, 'vendorName in documentElementStyle');
function visit399_34_1(result) {
  _$jscoverage['/base/style.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['31'][1].init(137, 26, 'i < propertyPrefixesLength');
function visit398_31_1(result) {
  _$jscoverage['/base/style.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['22'][1].init(252, 53, '!documentElementStyle || name in documentElementStyle');
function visit397_22_1(result) {
  _$jscoverage['/base/style.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['18'][1].init(116, 19, 'name in vendorInfos');
function visit396_18_1(result) {
  _$jscoverage['/base/style.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['15'][1].init(13, 24, 'name.indexOf(\'-\') !== -1');
function visit395_15_1(result) {
  _$jscoverage['/base/style.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/style.js'].functionData[0]++;
  _$jscoverage['/base/style.js'].lineData[7]++;
  var RE_DASH = /-([a-z])/ig;
  _$jscoverage['/base/style.js'].lineData[9]++;
  function upperCase() {
    _$jscoverage['/base/style.js'].functionData[1]++;
    _$jscoverage['/base/style.js'].lineData[10]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/base/style.js'].lineData[14]++;
  function getCssVendorInfo(name) {
    _$jscoverage['/base/style.js'].functionData[2]++;
    _$jscoverage['/base/style.js'].lineData[15]++;
    if (visit395_15_1(name.indexOf('-') !== -1)) {
      _$jscoverage['/base/style.js'].lineData[16]++;
      name = name.replace(RE_DASH, upperCase);
    }
    _$jscoverage['/base/style.js'].lineData[18]++;
    if (visit396_18_1(name in vendorInfos)) {
      _$jscoverage['/base/style.js'].lineData[19]++;
      return vendorInfos[name];
    }
    _$jscoverage['/base/style.js'].lineData[22]++;
    if (visit397_22_1(!documentElementStyle || name in documentElementStyle)) {
      _$jscoverage['/base/style.js'].lineData[23]++;
      vendorInfos[name] = {
  propertyName: name, 
  propertyNamePrefix: ''};
    } else {
      _$jscoverage['/base/style.js'].lineData[28]++;
      var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1), vendorName;
      _$jscoverage['/base/style.js'].lineData[31]++;
      for (var i = 0; visit398_31_1(i < propertyPrefixesLength); i++) {
        _$jscoverage['/base/style.js'].lineData[32]++;
        var propertyNamePrefix = propertyPrefixes[i];
        _$jscoverage['/base/style.js'].lineData[33]++;
        vendorName = propertyNamePrefix + upperFirstName;
        _$jscoverage['/base/style.js'].lineData[34]++;
        if (visit399_34_1(vendorName in documentElementStyle)) {
          _$jscoverage['/base/style.js'].lineData[35]++;
          vendorInfos[name] = {
  propertyName: vendorName, 
  propertyNamePrefix: propertyNamePrefix};
        }
      }
      _$jscoverage['/base/style.js'].lineData[42]++;
      vendorInfos[name] = visit400_42_1(vendorInfos[name] || null);
    }
    _$jscoverage['/base/style.js'].lineData[44]++;
    return vendorInfos[name];
  }
  _$jscoverage['/base/style.js'].lineData[47]++;
  var util = S;
  _$jscoverage['/base/style.js'].lineData[48]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/base/style.js'].lineData[49]++;
  var Dom = require('./api');
  _$jscoverage['/base/style.js'].lineData[50]++;
  var globalWindow = S.Env.host, vendorInfos = {}, propertyPrefixes = ['Webkit', 'Moz', 'O', 'ms'], propertyPrefixesLength = propertyPrefixes.length, doc = visit401_60_1(globalWindow.document || {}), documentElement = visit402_61_1(doc && doc.documentElement), documentElementStyle = documentElement.style, UA = require('ua'), BOX_MODELS = ['margin', 'border', 'padding'], CONTENT_INDEX = -1, PADDING_INDEX = 2, BORDER_INDEX = 1, MARGIN_INDEX = 0, getNodeName = Dom.nodeName, RE_MARGIN = /^margin/, WIDTH = 'width', HEIGHT = 'height', DISPLAY = 'display', OLD_DISPLAY = DISPLAY + util.now(), NONE = 'none', cssNumber = {
  fillOpacity: 1, 
  fontWeight: 1, 
  lineHeight: 1, 
  opacity: 1, 
  orphans: 1, 
  widows: 1, 
  zIndex: 1, 
  zoom: 1}, EMPTY = '', DEFAULT_UNIT = 'px', NO_PX_REG = /\d(?!px)[a-z%]+$/i, cssHooks = {}, cssProps = {}, defaultDisplay = {}, userSelectVendorInfo = getCssVendorInfo('userSelect'), userSelectProperty = visit403_93_1(userSelectVendorInfo && userSelectVendorInfo.propertyName), camelCase = util.camelCase;
  _$jscoverage['/base/style.js'].lineData[96]++;
  cssProps['float'] = 'cssFloat';
  _$jscoverage['/base/style.js'].lineData[98]++;
  function normalizeCssPropName(name) {
    _$jscoverage['/base/style.js'].functionData[3]++;
    _$jscoverage['/base/style.js'].lineData[99]++;
    if (visit404_99_1(cssProps[name])) {
      _$jscoverage['/base/style.js'].lineData[100]++;
      return cssProps[name];
    }
    _$jscoverage['/base/style.js'].lineData[102]++;
    var vendor = getCssVendorInfo(name);
    _$jscoverage['/base/style.js'].lineData[103]++;
    return visit405_103_1(visit406_103_2(vendor && vendor.propertyName) || name);
  }
  _$jscoverage['/base/style.js'].lineData[106]++;
  function getDefaultDisplay(tagName) {
    _$jscoverage['/base/style.js'].functionData[4]++;
    _$jscoverage['/base/style.js'].lineData[107]++;
    var body, oldDisplay = defaultDisplay[tagName], elem;
    _$jscoverage['/base/style.js'].lineData[110]++;
    if (visit407_110_1(!defaultDisplay[tagName])) {
      _$jscoverage['/base/style.js'].lineData[111]++;
      body = visit408_111_1(doc.body || doc.documentElement);
      _$jscoverage['/base/style.js'].lineData[112]++;
      elem = doc.createElement(tagName);
      _$jscoverage['/base/style.js'].lineData[114]++;
      Dom.prepend(elem, body);
      _$jscoverage['/base/style.js'].lineData[115]++;
      oldDisplay = Dom.css(elem, 'display');
      _$jscoverage['/base/style.js'].lineData[116]++;
      body.removeChild(elem);
      _$jscoverage['/base/style.js'].lineData[118]++;
      defaultDisplay[tagName] = oldDisplay;
    }
    _$jscoverage['/base/style.js'].lineData[120]++;
    return oldDisplay;
  }
  _$jscoverage['/base/style.js'].lineData[123]++;
  util.mix(Dom, {
  _cssHooks: cssHooks, 
  _cssProps: cssProps, 
  _getComputedStyle: function(elem, name, computedStyle) {
  _$jscoverage['/base/style.js'].functionData[5]++;
  _$jscoverage['/base/style.js'].lineData[135]++;
  var val = '', width, minWidth, maxWidth, style, d = elem.ownerDocument;
  _$jscoverage['/base/style.js'].lineData[142]++;
  name = normalizeCssPropName(name);
  _$jscoverage['/base/style.js'].lineData[145]++;
  if ((computedStyle = (visit409_145_1(computedStyle || d.defaultView.getComputedStyle(elem, null))))) {
    _$jscoverage['/base/style.js'].lineData[146]++;
    val = visit410_146_1(computedStyle.getPropertyValue(name) || computedStyle[name]);
  }
  _$jscoverage['/base/style.js'].lineData[150]++;
  if (visit411_150_1(visit412_150_2(val === '') && !Dom.contains(d, elem))) {
    _$jscoverage['/base/style.js'].lineData[151]++;
    val = elem.style[name];
  }
  _$jscoverage['/base/style.js'].lineData[155]++;
  if (visit413_155_1(Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name))) {
    _$jscoverage['/base/style.js'].lineData[156]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[157]++;
    width = style.width;
    _$jscoverage['/base/style.js'].lineData[158]++;
    minWidth = style.minWidth;
    _$jscoverage['/base/style.js'].lineData[159]++;
    maxWidth = style.maxWidth;
    _$jscoverage['/base/style.js'].lineData[161]++;
    style.minWidth = style.maxWidth = style.width = val;
    _$jscoverage['/base/style.js'].lineData[162]++;
    val = computedStyle.width;
    _$jscoverage['/base/style.js'].lineData[164]++;
    style.width = width;
    _$jscoverage['/base/style.js'].lineData[165]++;
    style.minWidth = minWidth;
    _$jscoverage['/base/style.js'].lineData[166]++;
    style.maxWidth = maxWidth;
  }
  _$jscoverage['/base/style.js'].lineData[169]++;
  return val;
}, 
  style: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[6]++;
  _$jscoverage['/base/style.js'].lineData[182]++;
  var els = Dom.query(selector), k, ret, elem = els[0], i;
  _$jscoverage['/base/style.js'].lineData[187]++;
  if (visit414_187_1(util.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[188]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[189]++;
      for (i = els.length - 1; visit415_189_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[190]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[193]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[195]++;
  if (visit416_195_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[196]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[197]++;
    if (visit417_197_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[198]++;
      ret = style(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[200]++;
    return ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[202]++;
    for (i = els.length - 1; visit418_202_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[203]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[206]++;
  return undefined;
}, 
  css: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[7]++;
  _$jscoverage['/base/style.js'].lineData[219]++;
  var els = Dom.query(selector), elem = els[0], k, hook, ret, i;
  _$jscoverage['/base/style.js'].lineData[226]++;
  if (visit419_226_1(util.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[227]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[228]++;
      for (i = els.length - 1; visit420_228_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[229]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[232]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[235]++;
  name = camelCase(name);
  _$jscoverage['/base/style.js'].lineData[236]++;
  hook = cssHooks[name];
  _$jscoverage['/base/style.js'].lineData[238]++;
  if (visit421_238_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[240]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[241]++;
    if (visit422_241_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[243]++;
      if (visit423_243_1(!(visit424_243_2(hook && visit425_243_3('get' in hook && visit426_244_1((ret = hook.get(elem, true)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[246]++;
        ret = Dom._getComputedStyle(elem, name);
      }
    }
    _$jscoverage['/base/style.js'].lineData[249]++;
    return (visit427_249_1(typeof ret === 'undefined')) ? '' : ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[251]++;
    for (i = els.length - 1; visit428_251_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[252]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[255]++;
  return undefined;
}, 
  show: function(selector) {
  _$jscoverage['/base/style.js'].functionData[8]++;
  _$jscoverage['/base/style.js'].lineData[263]++;
  var els = Dom.query(selector), tagName, old, elem, i;
  _$jscoverage['/base/style.js'].lineData[267]++;
  for (i = els.length - 1; visit429_267_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[268]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[269]++;
    elem.style[DISPLAY] = visit430_269_1(Dom.data(elem, OLD_DISPLAY) || EMPTY);
    _$jscoverage['/base/style.js'].lineData[271]++;
    if (visit431_271_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[272]++;
      tagName = elem.tagName.toLowerCase();
      _$jscoverage['/base/style.js'].lineData[273]++;
      old = getDefaultDisplay(tagName);
      _$jscoverage['/base/style.js'].lineData[274]++;
      Dom.data(elem, OLD_DISPLAY, old);
      _$jscoverage['/base/style.js'].lineData[275]++;
      elem.style[DISPLAY] = old;
    }
  }
}, 
  hide: function(selector) {
  _$jscoverage['/base/style.js'].functionData[9]++;
  _$jscoverage['/base/style.js'].lineData[285]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[287]++;
  for (i = els.length - 1; visit432_287_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[288]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[289]++;
    var style = elem.style, old = style[DISPLAY];
    _$jscoverage['/base/style.js'].lineData[291]++;
    if (visit433_291_1(old !== NONE)) {
      _$jscoverage['/base/style.js'].lineData[292]++;
      if (visit434_292_1(old)) {
        _$jscoverage['/base/style.js'].lineData[293]++;
        Dom.data(elem, OLD_DISPLAY, old);
      }
      _$jscoverage['/base/style.js'].lineData[295]++;
      style[DISPLAY] = NONE;
    }
  }
}, 
  toggle: function(selector) {
  _$jscoverage['/base/style.js'].functionData[10]++;
  _$jscoverage['/base/style.js'].lineData[305]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[307]++;
  for (i = els.length - 1; visit435_307_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[308]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[309]++;
    if (visit436_309_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[310]++;
      Dom.show(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[312]++;
      Dom.hide(elem);
    }
  }
}, 
  addStyleSheet: function(refWin, cssText, id) {
  _$jscoverage['/base/style.js'].functionData[11]++;
  _$jscoverage['/base/style.js'].lineData[326]++;
  if (visit437_326_1(typeof refWin === 'string')) {
    _$jscoverage['/base/style.js'].lineData[327]++;
    id = cssText;
    _$jscoverage['/base/style.js'].lineData[328]++;
    cssText = refWin;
    _$jscoverage['/base/style.js'].lineData[330]++;
    refWin = globalWindow;
  }
  _$jscoverage['/base/style.js'].lineData[333]++;
  var doc = Dom.getDocument(refWin), elem;
  _$jscoverage['/base/style.js'].lineData[336]++;
  if (visit438_336_1(id && (id = id.replace('#', EMPTY)))) {
    _$jscoverage['/base/style.js'].lineData[337]++;
    elem = Dom.get('#' + id, doc);
  }
  _$jscoverage['/base/style.js'].lineData[341]++;
  if (visit439_341_1(elem)) {
    _$jscoverage['/base/style.js'].lineData[342]++;
    return;
  }
  _$jscoverage['/base/style.js'].lineData[345]++;
  elem = Dom.create('<style>', {
  id: id}, doc);
  _$jscoverage['/base/style.js'].lineData[348]++;
  Dom.get('head', doc).appendChild(elem);
  _$jscoverage['/base/style.js'].lineData[350]++;
  if (visit440_350_1(elem.styleSheet)) {
    _$jscoverage['/base/style.js'].lineData[351]++;
    elem.styleSheet.cssText = cssText;
  } else {
    _$jscoverage['/base/style.js'].lineData[353]++;
    elem.appendChild(doc.createTextNode(cssText));
  }
}, 
  unselectable: userSelectProperty ? function(selector) {
  _$jscoverage['/base/style.js'].functionData[12]++;
  _$jscoverage['/base/style.js'].lineData[362]++;
  var _els = Dom.query(selector), elem, j, e, i = 0, excludes, style, els;
  _$jscoverage['/base/style.js'].lineData[370]++;
  for (j = _els.length - 1; visit441_370_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[371]++;
    elem = _els[j];
    _$jscoverage['/base/style.js'].lineData[372]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[373]++;
    els = elem.getElementsByTagName('*');
    _$jscoverage['/base/style.js'].lineData[374]++;
    elem.setAttribute('unselectable', 'on');
    _$jscoverage['/base/style.js'].lineData[375]++;
    excludes = ['iframe', 'textarea', 'input', 'select'];
    _$jscoverage['/base/style.js'].lineData[376]++;
    while ((e = els[i++])) {
      _$jscoverage['/base/style.js'].lineData[377]++;
      if (visit442_377_1(!util.inArray(getNodeName(e), excludes))) {
        _$jscoverage['/base/style.js'].lineData[378]++;
        e.setAttribute('unselectable', 'on');
      }
    }
  }
} : function(selector) {
  _$jscoverage['/base/style.js'].functionData[13]++;
  _$jscoverage['/base/style.js'].lineData[383]++;
  var els = Dom.query(selector);
  _$jscoverage['/base/style.js'].lineData[384]++;
  for (var j = els.length - 1; visit443_384_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[385]++;
    els[j].style[userSelectProperty] = 'none';
  }
}, 
  innerWidth: 0, 
  innerHeight: 0, 
  outerWidth: 0, 
  outerHeight: 0, 
  width: 0, 
  height: 0});
  _$jscoverage['/base/style.js'].lineData[443]++;
  util.each([WIDTH, HEIGHT], function(name) {
  _$jscoverage['/base/style.js'].functionData[14]++;
  _$jscoverage['/base/style.js'].lineData[444]++;
  Dom['inner' + util.ucfirst(name)] = function(selector) {
  _$jscoverage['/base/style.js'].functionData[15]++;
  _$jscoverage['/base/style.js'].lineData[445]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[446]++;
  return visit444_446_1(el && getWHIgnoreDisplay(el, name, PADDING_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[449]++;
  Dom['outer' + util.ucfirst(name)] = function(selector, includeMargin) {
  _$jscoverage['/base/style.js'].functionData[16]++;
  _$jscoverage['/base/style.js'].lineData[450]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[451]++;
  return visit445_451_1(el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[453]++;
  var which = visit446_453_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'];
  _$jscoverage['/base/style.js'].lineData[455]++;
  Dom[name] = function(selector, val) {
  _$jscoverage['/base/style.js'].functionData[17]++;
  _$jscoverage['/base/style.js'].lineData[456]++;
  var elem = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[457]++;
  if (visit447_457_1(val !== undefined)) {
    _$jscoverage['/base/style.js'].lineData[458]++;
    if (visit448_458_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[459]++;
      var computedStyle = getComputedStyle(elem);
      _$jscoverage['/base/style.js'].lineData[460]++;
      var isBorderBox = isBorderBoxFn(elem, computedStyle);
      _$jscoverage['/base/style.js'].lineData[461]++;
      if (visit449_461_1(isBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[462]++;
        val += getPBMWidth(elem, ['padding', 'border'], which, computedStyle);
      }
      _$jscoverage['/base/style.js'].lineData[464]++;
      return Dom.css(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[466]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[468]++;
  return visit450_468_1(elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[474]++;
  cssHooks[name] = {
  get: function(elem, computed) {
  _$jscoverage['/base/style.js'].functionData[18]++;
  _$jscoverage['/base/style.js'].lineData[479]++;
  var val;
  _$jscoverage['/base/style.js'].lineData[480]++;
  if (visit451_480_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[481]++;
    val = getWHIgnoreDisplay(elem, name) + 'px';
  }
  _$jscoverage['/base/style.js'].lineData[483]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[488]++;
  var cssShow = {
  position: 'absolute', 
  visibility: 'hidden', 
  display: 'block'};
  _$jscoverage['/base/style.js'].lineData[490]++;
  util.each(['left', 'top'], function(name) {
  _$jscoverage['/base/style.js'].functionData[19]++;
  _$jscoverage['/base/style.js'].lineData[491]++;
  cssHooks[name] = {
  get: function(el, computed) {
  _$jscoverage['/base/style.js'].functionData[20]++;
  _$jscoverage['/base/style.js'].lineData[493]++;
  var val, isAutoPosition, position;
  _$jscoverage['/base/style.js'].lineData[496]++;
  if (visit452_496_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[497]++;
    position = Dom.css(el, 'position');
    _$jscoverage['/base/style.js'].lineData[498]++;
    if (visit453_498_1(position === 'static')) {
      _$jscoverage['/base/style.js'].lineData[499]++;
      return 'auto';
    }
    _$jscoverage['/base/style.js'].lineData[501]++;
    val = Dom._getComputedStyle(el, name);
    _$jscoverage['/base/style.js'].lineData[502]++;
    isAutoPosition = visit454_502_1(val === 'auto');
    _$jscoverage['/base/style.js'].lineData[503]++;
    if (visit455_503_1(isAutoPosition && visit456_503_2(position === 'relative'))) {
      _$jscoverage['/base/style.js'].lineData[504]++;
      return '0px';
    }
    _$jscoverage['/base/style.js'].lineData[507]++;
    if (visit457_507_1(isAutoPosition || NO_PX_REG.test(val))) {
      _$jscoverage['/base/style.js'].lineData[508]++;
      val = getPosition(el)[name] + 'px';
    }
  }
  _$jscoverage['/base/style.js'].lineData[511]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[516]++;
  function swap(elem, options, callback) {
    _$jscoverage['/base/style.js'].functionData[21]++;
    _$jscoverage['/base/style.js'].lineData[517]++;
    var old = {}, style = elem.style, name;
    _$jscoverage['/base/style.js'].lineData[522]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[523]++;
      old[name] = style[name];
      _$jscoverage['/base/style.js'].lineData[524]++;
      style[name] = options[name];
    }
    _$jscoverage['/base/style.js'].lineData[527]++;
    callback.call(elem);
    _$jscoverage['/base/style.js'].lineData[530]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[531]++;
      style[name] = old[name];
    }
  }
  _$jscoverage['/base/style.js'].lineData[535]++;
  function style(elem, name, val) {
    _$jscoverage['/base/style.js'].functionData[22]++;
    _$jscoverage['/base/style.js'].lineData[536]++;
    var elStyle, ret, hook;
    _$jscoverage['/base/style.js'].lineData[539]++;
    if (visit458_539_1(visit459_539_2(elem.nodeType === 3) || visit460_540_1(visit461_540_2(elem.nodeType === 8) || !(elStyle = elem.style)))) {
      _$jscoverage['/base/style.js'].lineData[541]++;
      return undefined;
    }
    _$jscoverage['/base/style.js'].lineData[543]++;
    name = camelCase(name);
    _$jscoverage['/base/style.js'].lineData[544]++;
    hook = cssHooks[name];
    _$jscoverage['/base/style.js'].lineData[545]++;
    name = normalizeCssPropName(name);
    _$jscoverage['/base/style.js'].lineData[547]++;
    if (visit462_547_1(val !== undefined)) {
      _$jscoverage['/base/style.js'].lineData[549]++;
      if (visit463_549_1(visit464_549_2(val === null) || visit465_549_3(val === EMPTY))) {
        _$jscoverage['/base/style.js'].lineData[550]++;
        val = EMPTY;
      } else {
        _$jscoverage['/base/style.js'].lineData[551]++;
        if (visit466_551_1(!isNaN(Number(val)) && !cssNumber[name])) {
          _$jscoverage['/base/style.js'].lineData[553]++;
          val += DEFAULT_UNIT;
        }
      }
      _$jscoverage['/base/style.js'].lineData[555]++;
      if (visit467_555_1(hook && hook.set)) {
        _$jscoverage['/base/style.js'].lineData[556]++;
        val = hook.set(elem, val);
      }
      _$jscoverage['/base/style.js'].lineData[558]++;
      if (visit468_558_1(val !== undefined)) {
        _$jscoverage['/base/style.js'].lineData[560]++;
        try {
          _$jscoverage['/base/style.js'].lineData[562]++;
          elStyle[name] = val;
        }        catch (e) {
  _$jscoverage['/base/style.js'].lineData[564]++;
  logger.warn('css set error:' + e);
}
        _$jscoverage['/base/style.js'].lineData[567]++;
        if (visit469_567_1(visit470_567_2(val === EMPTY) && elStyle.removeAttribute)) {
          _$jscoverage['/base/style.js'].lineData[568]++;
          elStyle.removeAttribute(name);
        }
      }
      _$jscoverage['/base/style.js'].lineData[571]++;
      if (visit471_571_1(!elStyle.cssText)) {
        _$jscoverage['/base/style.js'].lineData[574]++;
        if (visit472_574_1(UA.webkit)) {
          _$jscoverage['/base/style.js'].lineData[575]++;
          elStyle = elem.outerHTML;
        }
        _$jscoverage['/base/style.js'].lineData[577]++;
        elem.removeAttribute('style');
      }
      _$jscoverage['/base/style.js'].lineData[579]++;
      return undefined;
    } else {
      _$jscoverage['/base/style.js'].lineData[582]++;
      if (visit473_582_1(!(visit474_582_2(hook && visit475_582_3('get' in hook && visit476_583_1((ret = hook.get(elem, false)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[585]++;
        ret = elStyle[name];
      }
      _$jscoverage['/base/style.js'].lineData[587]++;
      return visit477_587_1(ret === undefined) ? '' : ret;
    }
  }
  _$jscoverage['/base/style.js'].lineData[592]++;
  function getWHIgnoreDisplay(elem) {
    _$jscoverage['/base/style.js'].functionData[23]++;
    _$jscoverage['/base/style.js'].lineData[593]++;
    var val, args = arguments;
    _$jscoverage['/base/style.js'].lineData[596]++;
    if (visit478_596_1(elem.offsetWidth !== 0)) {
      _$jscoverage['/base/style.js'].lineData[597]++;
      val = getWH.apply(undefined, args);
    } else {
      _$jscoverage['/base/style.js'].lineData[599]++;
      swap(elem, cssShow, function() {
  _$jscoverage['/base/style.js'].functionData[24]++;
  _$jscoverage['/base/style.js'].lineData[600]++;
  val = getWH.apply(undefined, args);
});
    }
    _$jscoverage['/base/style.js'].lineData[603]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[606]++;
  function getPBMWidth(elem, props, which, computedStyle) {
    _$jscoverage['/base/style.js'].functionData[25]++;
    _$jscoverage['/base/style.js'].lineData[607]++;
    var value = 0, prop, j, i;
    _$jscoverage['/base/style.js'].lineData[608]++;
    for (j = 0; visit479_608_1(j < props.length); j++) {
      _$jscoverage['/base/style.js'].lineData[609]++;
      prop = props[j];
      _$jscoverage['/base/style.js'].lineData[610]++;
      if (visit480_610_1(prop)) {
        _$jscoverage['/base/style.js'].lineData[611]++;
        for (i = 0; visit481_611_1(i < which.length); i++) {
          _$jscoverage['/base/style.js'].lineData[612]++;
          var cssProp;
          _$jscoverage['/base/style.js'].lineData[613]++;
          if (visit482_613_1(prop === 'border')) {
            _$jscoverage['/base/style.js'].lineData[614]++;
            cssProp = prop + which[i] + 'Width';
          } else {
            _$jscoverage['/base/style.js'].lineData[616]++;
            cssProp = prop + which[i];
          }
          _$jscoverage['/base/style.js'].lineData[618]++;
          value += visit483_618_1(parseFloat(Dom._getComputedStyle(elem, cssProp, computedStyle)) || 0);
        }
      }
    }
    _$jscoverage['/base/style.js'].lineData[622]++;
    return value;
  }
  _$jscoverage['/base/style.js'].lineData[625]++;
  function isBorderBoxFn(elem, computedStyle) {
    _$jscoverage['/base/style.js'].functionData[26]++;
    _$jscoverage['/base/style.js'].lineData[626]++;
    return visit484_626_1(Dom._getComputedStyle(elem, 'boxSizing', computedStyle) === 'border-box');
  }
  _$jscoverage['/base/style.js'].lineData[629]++;
  function getComputedStyle(elem) {
    _$jscoverage['/base/style.js'].functionData[27]++;
    _$jscoverage['/base/style.js'].lineData[630]++;
    var doc = elem.ownerDocument, computedStyle;
    _$jscoverage['/base/style.js'].lineData[632]++;
    if (visit485_632_1(doc.defaultView)) {
      _$jscoverage['/base/style.js'].lineData[634]++;
      computedStyle = doc.defaultView.getComputedStyle(elem, null);
    }
    _$jscoverage['/base/style.js'].lineData[636]++;
    return computedStyle;
  }
  _$jscoverage['/base/style.js'].lineData[647]++;
  function getWH(elem, name, extra) {
    _$jscoverage['/base/style.js'].functionData[28]++;
    _$jscoverage['/base/style.js'].lineData[648]++;
    if (visit486_648_1(util.isWindow(elem))) {
      _$jscoverage['/base/style.js'].lineData[649]++;
      return visit487_649_1(name === WIDTH) ? Dom.viewportWidth(elem) : Dom.viewportHeight(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[650]++;
      if (visit488_650_1(elem.nodeType === 9)) {
        _$jscoverage['/base/style.js'].lineData[651]++;
        return visit489_651_1(name === WIDTH) ? Dom.docWidth(elem) : Dom.docHeight(elem);
      }
    }
    _$jscoverage['/base/style.js'].lineData[653]++;
    var which = visit490_653_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'], borderBoxValue = visit491_654_1(name === WIDTH) ? elem.offsetWidth : elem.offsetHeight;
    _$jscoverage['/base/style.js'].lineData[655]++;
    var computedStyle = getComputedStyle(elem);
    _$jscoverage['/base/style.js'].lineData[656]++;
    var isBorderBox = isBorderBoxFn(elem, computedStyle);
    _$jscoverage['/base/style.js'].lineData[657]++;
    var cssBoxValue = 0;
    _$jscoverage['/base/style.js'].lineData[658]++;
    if (visit492_658_1(visit493_658_2(borderBoxValue == null) || visit494_658_3(borderBoxValue <= 0))) {
      _$jscoverage['/base/style.js'].lineData[659]++;
      borderBoxValue = undefined;
      _$jscoverage['/base/style.js'].lineData[661]++;
      cssBoxValue = Dom._getComputedStyle(elem, name, computedStyle);
      _$jscoverage['/base/style.js'].lineData[662]++;
      if (visit495_662_1(visit496_662_2(cssBoxValue == null) || visit497_662_3((Number(cssBoxValue)) < 0))) {
        _$jscoverage['/base/style.js'].lineData[663]++;
        cssBoxValue = visit498_663_1(elem.style[name] || 0);
      }
      _$jscoverage['/base/style.js'].lineData[666]++;
      cssBoxValue = visit499_666_1(parseFloat(cssBoxValue) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[668]++;
    if (visit500_668_1(extra === undefined)) {
      _$jscoverage['/base/style.js'].lineData[669]++;
      extra = isBorderBox ? BORDER_INDEX : CONTENT_INDEX;
    }
    _$jscoverage['/base/style.js'].lineData[671]++;
    var borderBoxValueOrIsBorderBox = visit501_671_1(visit502_671_2(borderBoxValue !== undefined) || isBorderBox);
    _$jscoverage['/base/style.js'].lineData[672]++;
    var val = visit503_672_1(borderBoxValue || cssBoxValue);
    _$jscoverage['/base/style.js'].lineData[673]++;
    if (visit504_673_1(extra === CONTENT_INDEX)) {
      _$jscoverage['/base/style.js'].lineData[674]++;
      if (visit505_674_1(borderBoxValueOrIsBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[675]++;
        return val - getPBMWidth(elem, ['border', 'padding'], which, computedStyle);
      } else {
        _$jscoverage['/base/style.js'].lineData[678]++;
        return cssBoxValue;
      }
    } else {
      _$jscoverage['/base/style.js'].lineData[680]++;
      if (visit506_680_1(borderBoxValueOrIsBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[681]++;
        return val + (visit507_681_1(extra === BORDER_INDEX) ? 0 : (visit508_682_1(extra === PADDING_INDEX) ? -getPBMWidth(elem, ['border'], which, computedStyle) : getPBMWidth(elem, ['margin'], which, computedStyle)));
      } else {
        _$jscoverage['/base/style.js'].lineData[686]++;
        return cssBoxValue + getPBMWidth(elem, BOX_MODELS.slice(extra), which, computedStyle);
      }
    }
  }
  _$jscoverage['/base/style.js'].lineData[691]++;
  var ROOT_REG = /^(?:body|html)$/i;
  _$jscoverage['/base/style.js'].lineData[693]++;
  function getPosition(el) {
    _$jscoverage['/base/style.js'].functionData[29]++;
    _$jscoverage['/base/style.js'].lineData[694]++;
    var offsetParent, offset, parentOffset = {
  top: 0, 
  left: 0};
    _$jscoverage['/base/style.js'].lineData[698]++;
    if (visit509_698_1(Dom.css(el, 'position') === 'fixed')) {
      _$jscoverage['/base/style.js'].lineData[699]++;
      offset = el.getBoundingClientRect();
    } else {
      _$jscoverage['/base/style.js'].lineData[704]++;
      offsetParent = getOffsetParent(el);
      _$jscoverage['/base/style.js'].lineData[705]++;
      offset = Dom.offset(el);
      _$jscoverage['/base/style.js'].lineData[706]++;
      parentOffset = Dom.offset(offsetParent);
      _$jscoverage['/base/style.js'].lineData[707]++;
      parentOffset.top += visit510_707_1(parseFloat(Dom.css(offsetParent, 'borderTopWidth')) || 0);
      _$jscoverage['/base/style.js'].lineData[708]++;
      parentOffset.left += visit511_708_1(parseFloat(Dom.css(offsetParent, 'borderLeftWidth')) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[711]++;
    offset.top -= visit512_711_1(parseFloat(Dom.css(el, 'marginTop')) || 0);
    _$jscoverage['/base/style.js'].lineData[712]++;
    offset.left -= visit513_712_1(parseFloat(Dom.css(el, 'marginLeft')) || 0);
    _$jscoverage['/base/style.js'].lineData[716]++;
    return {
  top: offset.top - parentOffset.top, 
  left: offset.left - parentOffset.left};
  }
  _$jscoverage['/base/style.js'].lineData[722]++;
  function getOffsetParent(el) {
    _$jscoverage['/base/style.js'].functionData[30]++;
    _$jscoverage['/base/style.js'].lineData[723]++;
    var offsetParent = visit514_723_1(el.offsetParent || (visit515_723_2(el.ownerDocument || doc)).body);
    _$jscoverage['/base/style.js'].lineData[724]++;
    while (visit516_724_1(offsetParent && visit517_724_2(!ROOT_REG.test(offsetParent.nodeName) && visit518_725_1(Dom.css(offsetParent, 'position') === 'static')))) {
      _$jscoverage['/base/style.js'].lineData[726]++;
      offsetParent = offsetParent.offsetParent;
    }
    _$jscoverage['/base/style.js'].lineData[728]++;
    return offsetParent;
  }
  _$jscoverage['/base/style.js'].lineData[731]++;
  return Dom;
});
