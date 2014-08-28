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
  _$jscoverage['/base/style.js'].lineData[13] = 0;
  _$jscoverage['/base/style.js'].lineData[14] = 0;
  _$jscoverage['/base/style.js'].lineData[18] = 0;
  _$jscoverage['/base/style.js'].lineData[19] = 0;
  _$jscoverage['/base/style.js'].lineData[20] = 0;
  _$jscoverage['/base/style.js'].lineData[22] = 0;
  _$jscoverage['/base/style.js'].lineData[23] = 0;
  _$jscoverage['/base/style.js'].lineData[26] = 0;
  _$jscoverage['/base/style.js'].lineData[27] = 0;
  _$jscoverage['/base/style.js'].lineData[32] = 0;
  _$jscoverage['/base/style.js'].lineData[35] = 0;
  _$jscoverage['/base/style.js'].lineData[36] = 0;
  _$jscoverage['/base/style.js'].lineData[37] = 0;
  _$jscoverage['/base/style.js'].lineData[38] = 0;
  _$jscoverage['/base/style.js'].lineData[39] = 0;
  _$jscoverage['/base/style.js'].lineData[46] = 0;
  _$jscoverage['/base/style.js'].lineData[48] = 0;
  _$jscoverage['/base/style.js'].lineData[51] = 0;
  _$jscoverage['/base/style.js'].lineData[52] = 0;
  _$jscoverage['/base/style.js'].lineData[53] = 0;
  _$jscoverage['/base/style.js'].lineData[54] = 0;
  _$jscoverage['/base/style.js'].lineData[99] = 0;
  _$jscoverage['/base/style.js'].lineData[101] = 0;
  _$jscoverage['/base/style.js'].lineData[102] = 0;
  _$jscoverage['/base/style.js'].lineData[103] = 0;
  _$jscoverage['/base/style.js'].lineData[105] = 0;
  _$jscoverage['/base/style.js'].lineData[106] = 0;
  _$jscoverage['/base/style.js'].lineData[109] = 0;
  _$jscoverage['/base/style.js'].lineData[110] = 0;
  _$jscoverage['/base/style.js'].lineData[113] = 0;
  _$jscoverage['/base/style.js'].lineData[114] = 0;
  _$jscoverage['/base/style.js'].lineData[115] = 0;
  _$jscoverage['/base/style.js'].lineData[117] = 0;
  _$jscoverage['/base/style.js'].lineData[118] = 0;
  _$jscoverage['/base/style.js'].lineData[119] = 0;
  _$jscoverage['/base/style.js'].lineData[121] = 0;
  _$jscoverage['/base/style.js'].lineData[123] = 0;
  _$jscoverage['/base/style.js'].lineData[126] = 0;
  _$jscoverage['/base/style.js'].lineData[138] = 0;
  _$jscoverage['/base/style.js'].lineData[145] = 0;
  _$jscoverage['/base/style.js'].lineData[148] = 0;
  _$jscoverage['/base/style.js'].lineData[149] = 0;
  _$jscoverage['/base/style.js'].lineData[153] = 0;
  _$jscoverage['/base/style.js'].lineData[154] = 0;
  _$jscoverage['/base/style.js'].lineData[158] = 0;
  _$jscoverage['/base/style.js'].lineData[159] = 0;
  _$jscoverage['/base/style.js'].lineData[160] = 0;
  _$jscoverage['/base/style.js'].lineData[161] = 0;
  _$jscoverage['/base/style.js'].lineData[162] = 0;
  _$jscoverage['/base/style.js'].lineData[164] = 0;
  _$jscoverage['/base/style.js'].lineData[165] = 0;
  _$jscoverage['/base/style.js'].lineData[167] = 0;
  _$jscoverage['/base/style.js'].lineData[168] = 0;
  _$jscoverage['/base/style.js'].lineData[169] = 0;
  _$jscoverage['/base/style.js'].lineData[172] = 0;
  _$jscoverage['/base/style.js'].lineData[185] = 0;
  _$jscoverage['/base/style.js'].lineData[190] = 0;
  _$jscoverage['/base/style.js'].lineData[191] = 0;
  _$jscoverage['/base/style.js'].lineData[192] = 0;
  _$jscoverage['/base/style.js'].lineData[193] = 0;
  _$jscoverage['/base/style.js'].lineData[196] = 0;
  _$jscoverage['/base/style.js'].lineData[198] = 0;
  _$jscoverage['/base/style.js'].lineData[199] = 0;
  _$jscoverage['/base/style.js'].lineData[200] = 0;
  _$jscoverage['/base/style.js'].lineData[201] = 0;
  _$jscoverage['/base/style.js'].lineData[203] = 0;
  _$jscoverage['/base/style.js'].lineData[205] = 0;
  _$jscoverage['/base/style.js'].lineData[206] = 0;
  _$jscoverage['/base/style.js'].lineData[209] = 0;
  _$jscoverage['/base/style.js'].lineData[222] = 0;
  _$jscoverage['/base/style.js'].lineData[229] = 0;
  _$jscoverage['/base/style.js'].lineData[230] = 0;
  _$jscoverage['/base/style.js'].lineData[231] = 0;
  _$jscoverage['/base/style.js'].lineData[232] = 0;
  _$jscoverage['/base/style.js'].lineData[235] = 0;
  _$jscoverage['/base/style.js'].lineData[238] = 0;
  _$jscoverage['/base/style.js'].lineData[239] = 0;
  _$jscoverage['/base/style.js'].lineData[241] = 0;
  _$jscoverage['/base/style.js'].lineData[243] = 0;
  _$jscoverage['/base/style.js'].lineData[244] = 0;
  _$jscoverage['/base/style.js'].lineData[246] = 0;
  _$jscoverage['/base/style.js'].lineData[249] = 0;
  _$jscoverage['/base/style.js'].lineData[252] = 0;
  _$jscoverage['/base/style.js'].lineData[254] = 0;
  _$jscoverage['/base/style.js'].lineData[255] = 0;
  _$jscoverage['/base/style.js'].lineData[258] = 0;
  _$jscoverage['/base/style.js'].lineData[266] = 0;
  _$jscoverage['/base/style.js'].lineData[270] = 0;
  _$jscoverage['/base/style.js'].lineData[271] = 0;
  _$jscoverage['/base/style.js'].lineData[272] = 0;
  _$jscoverage['/base/style.js'].lineData[274] = 0;
  _$jscoverage['/base/style.js'].lineData[275] = 0;
  _$jscoverage['/base/style.js'].lineData[276] = 0;
  _$jscoverage['/base/style.js'].lineData[277] = 0;
  _$jscoverage['/base/style.js'].lineData[278] = 0;
  _$jscoverage['/base/style.js'].lineData[288] = 0;
  _$jscoverage['/base/style.js'].lineData[290] = 0;
  _$jscoverage['/base/style.js'].lineData[291] = 0;
  _$jscoverage['/base/style.js'].lineData[292] = 0;
  _$jscoverage['/base/style.js'].lineData[294] = 0;
  _$jscoverage['/base/style.js'].lineData[295] = 0;
  _$jscoverage['/base/style.js'].lineData[296] = 0;
  _$jscoverage['/base/style.js'].lineData[298] = 0;
  _$jscoverage['/base/style.js'].lineData[308] = 0;
  _$jscoverage['/base/style.js'].lineData[310] = 0;
  _$jscoverage['/base/style.js'].lineData[311] = 0;
  _$jscoverage['/base/style.js'].lineData[312] = 0;
  _$jscoverage['/base/style.js'].lineData[313] = 0;
  _$jscoverage['/base/style.js'].lineData[315] = 0;
  _$jscoverage['/base/style.js'].lineData[329] = 0;
  _$jscoverage['/base/style.js'].lineData[330] = 0;
  _$jscoverage['/base/style.js'].lineData[331] = 0;
  _$jscoverage['/base/style.js'].lineData[333] = 0;
  _$jscoverage['/base/style.js'].lineData[336] = 0;
  _$jscoverage['/base/style.js'].lineData[339] = 0;
  _$jscoverage['/base/style.js'].lineData[340] = 0;
  _$jscoverage['/base/style.js'].lineData[344] = 0;
  _$jscoverage['/base/style.js'].lineData[345] = 0;
  _$jscoverage['/base/style.js'].lineData[348] = 0;
  _$jscoverage['/base/style.js'].lineData[351] = 0;
  _$jscoverage['/base/style.js'].lineData[353] = 0;
  _$jscoverage['/base/style.js'].lineData[354] = 0;
  _$jscoverage['/base/style.js'].lineData[356] = 0;
  _$jscoverage['/base/style.js'].lineData[365] = 0;
  _$jscoverage['/base/style.js'].lineData[373] = 0;
  _$jscoverage['/base/style.js'].lineData[374] = 0;
  _$jscoverage['/base/style.js'].lineData[375] = 0;
  _$jscoverage['/base/style.js'].lineData[376] = 0;
  _$jscoverage['/base/style.js'].lineData[377] = 0;
  _$jscoverage['/base/style.js'].lineData[378] = 0;
  _$jscoverage['/base/style.js'].lineData[379] = 0;
  _$jscoverage['/base/style.js'].lineData[380] = 0;
  _$jscoverage['/base/style.js'].lineData[381] = 0;
  _$jscoverage['/base/style.js'].lineData[386] = 0;
  _$jscoverage['/base/style.js'].lineData[387] = 0;
  _$jscoverage['/base/style.js'].lineData[388] = 0;
  _$jscoverage['/base/style.js'].lineData[446] = 0;
  _$jscoverage['/base/style.js'].lineData[447] = 0;
  _$jscoverage['/base/style.js'].lineData[448] = 0;
  _$jscoverage['/base/style.js'].lineData[449] = 0;
  _$jscoverage['/base/style.js'].lineData[452] = 0;
  _$jscoverage['/base/style.js'].lineData[453] = 0;
  _$jscoverage['/base/style.js'].lineData[454] = 0;
  _$jscoverage['/base/style.js'].lineData[456] = 0;
  _$jscoverage['/base/style.js'].lineData[458] = 0;
  _$jscoverage['/base/style.js'].lineData[459] = 0;
  _$jscoverage['/base/style.js'].lineData[460] = 0;
  _$jscoverage['/base/style.js'].lineData[461] = 0;
  _$jscoverage['/base/style.js'].lineData[462] = 0;
  _$jscoverage['/base/style.js'].lineData[463] = 0;
  _$jscoverage['/base/style.js'].lineData[464] = 0;
  _$jscoverage['/base/style.js'].lineData[465] = 0;
  _$jscoverage['/base/style.js'].lineData[467] = 0;
  _$jscoverage['/base/style.js'].lineData[469] = 0;
  _$jscoverage['/base/style.js'].lineData[471] = 0;
  _$jscoverage['/base/style.js'].lineData[477] = 0;
  _$jscoverage['/base/style.js'].lineData[482] = 0;
  _$jscoverage['/base/style.js'].lineData[483] = 0;
  _$jscoverage['/base/style.js'].lineData[484] = 0;
  _$jscoverage['/base/style.js'].lineData[486] = 0;
  _$jscoverage['/base/style.js'].lineData[491] = 0;
  _$jscoverage['/base/style.js'].lineData[493] = 0;
  _$jscoverage['/base/style.js'].lineData[494] = 0;
  _$jscoverage['/base/style.js'].lineData[496] = 0;
  _$jscoverage['/base/style.js'].lineData[499] = 0;
  _$jscoverage['/base/style.js'].lineData[500] = 0;
  _$jscoverage['/base/style.js'].lineData[501] = 0;
  _$jscoverage['/base/style.js'].lineData[502] = 0;
  _$jscoverage['/base/style.js'].lineData[504] = 0;
  _$jscoverage['/base/style.js'].lineData[505] = 0;
  _$jscoverage['/base/style.js'].lineData[506] = 0;
  _$jscoverage['/base/style.js'].lineData[507] = 0;
  _$jscoverage['/base/style.js'].lineData[510] = 0;
  _$jscoverage['/base/style.js'].lineData[511] = 0;
  _$jscoverage['/base/style.js'].lineData[514] = 0;
  _$jscoverage['/base/style.js'].lineData[519] = 0;
  _$jscoverage['/base/style.js'].lineData[520] = 0;
  _$jscoverage['/base/style.js'].lineData[525] = 0;
  _$jscoverage['/base/style.js'].lineData[526] = 0;
  _$jscoverage['/base/style.js'].lineData[527] = 0;
  _$jscoverage['/base/style.js'].lineData[530] = 0;
  _$jscoverage['/base/style.js'].lineData[533] = 0;
  _$jscoverage['/base/style.js'].lineData[534] = 0;
  _$jscoverage['/base/style.js'].lineData[538] = 0;
  _$jscoverage['/base/style.js'].lineData[539] = 0;
  _$jscoverage['/base/style.js'].lineData[542] = 0;
  _$jscoverage['/base/style.js'].lineData[544] = 0;
  _$jscoverage['/base/style.js'].lineData[546] = 0;
  _$jscoverage['/base/style.js'].lineData[547] = 0;
  _$jscoverage['/base/style.js'].lineData[548] = 0;
  _$jscoverage['/base/style.js'].lineData[550] = 0;
  _$jscoverage['/base/style.js'].lineData[552] = 0;
  _$jscoverage['/base/style.js'].lineData[553] = 0;
  _$jscoverage['/base/style.js'].lineData[554] = 0;
  _$jscoverage['/base/style.js'].lineData[556] = 0;
  _$jscoverage['/base/style.js'].lineData[558] = 0;
  _$jscoverage['/base/style.js'].lineData[559] = 0;
  _$jscoverage['/base/style.js'].lineData[561] = 0;
  _$jscoverage['/base/style.js'].lineData[563] = 0;
  _$jscoverage['/base/style.js'].lineData[565] = 0;
  _$jscoverage['/base/style.js'].lineData[567] = 0;
  _$jscoverage['/base/style.js'].lineData[570] = 0;
  _$jscoverage['/base/style.js'].lineData[571] = 0;
  _$jscoverage['/base/style.js'].lineData[574] = 0;
  _$jscoverage['/base/style.js'].lineData[577] = 0;
  _$jscoverage['/base/style.js'].lineData[578] = 0;
  _$jscoverage['/base/style.js'].lineData[580] = 0;
  _$jscoverage['/base/style.js'].lineData[582] = 0;
  _$jscoverage['/base/style.js'].lineData[585] = 0;
  _$jscoverage['/base/style.js'].lineData[588] = 0;
  _$jscoverage['/base/style.js'].lineData[590] = 0;
  _$jscoverage['/base/style.js'].lineData[595] = 0;
  _$jscoverage['/base/style.js'].lineData[596] = 0;
  _$jscoverage['/base/style.js'].lineData[599] = 0;
  _$jscoverage['/base/style.js'].lineData[600] = 0;
  _$jscoverage['/base/style.js'].lineData[602] = 0;
  _$jscoverage['/base/style.js'].lineData[603] = 0;
  _$jscoverage['/base/style.js'].lineData[606] = 0;
  _$jscoverage['/base/style.js'].lineData[609] = 0;
  _$jscoverage['/base/style.js'].lineData[610] = 0;
  _$jscoverage['/base/style.js'].lineData[611] = 0;
  _$jscoverage['/base/style.js'].lineData[612] = 0;
  _$jscoverage['/base/style.js'].lineData[613] = 0;
  _$jscoverage['/base/style.js'].lineData[614] = 0;
  _$jscoverage['/base/style.js'].lineData[615] = 0;
  _$jscoverage['/base/style.js'].lineData[616] = 0;
  _$jscoverage['/base/style.js'].lineData[617] = 0;
  _$jscoverage['/base/style.js'].lineData[619] = 0;
  _$jscoverage['/base/style.js'].lineData[621] = 0;
  _$jscoverage['/base/style.js'].lineData[625] = 0;
  _$jscoverage['/base/style.js'].lineData[628] = 0;
  _$jscoverage['/base/style.js'].lineData[629] = 0;
  _$jscoverage['/base/style.js'].lineData[632] = 0;
  _$jscoverage['/base/style.js'].lineData[633] = 0;
  _$jscoverage['/base/style.js'].lineData[635] = 0;
  _$jscoverage['/base/style.js'].lineData[637] = 0;
  _$jscoverage['/base/style.js'].lineData[639] = 0;
  _$jscoverage['/base/style.js'].lineData[650] = 0;
  _$jscoverage['/base/style.js'].lineData[651] = 0;
  _$jscoverage['/base/style.js'].lineData[652] = 0;
  _$jscoverage['/base/style.js'].lineData[653] = 0;
  _$jscoverage['/base/style.js'].lineData[654] = 0;
  _$jscoverage['/base/style.js'].lineData[656] = 0;
  _$jscoverage['/base/style.js'].lineData[658] = 0;
  _$jscoverage['/base/style.js'].lineData[659] = 0;
  _$jscoverage['/base/style.js'].lineData[660] = 0;
  _$jscoverage['/base/style.js'].lineData[661] = 0;
  _$jscoverage['/base/style.js'].lineData[662] = 0;
  _$jscoverage['/base/style.js'].lineData[664] = 0;
  _$jscoverage['/base/style.js'].lineData[665] = 0;
  _$jscoverage['/base/style.js'].lineData[666] = 0;
  _$jscoverage['/base/style.js'].lineData[669] = 0;
  _$jscoverage['/base/style.js'].lineData[671] = 0;
  _$jscoverage['/base/style.js'].lineData[672] = 0;
  _$jscoverage['/base/style.js'].lineData[674] = 0;
  _$jscoverage['/base/style.js'].lineData[675] = 0;
  _$jscoverage['/base/style.js'].lineData[676] = 0;
  _$jscoverage['/base/style.js'].lineData[677] = 0;
  _$jscoverage['/base/style.js'].lineData[678] = 0;
  _$jscoverage['/base/style.js'].lineData[681] = 0;
  _$jscoverage['/base/style.js'].lineData[683] = 0;
  _$jscoverage['/base/style.js'].lineData[684] = 0;
  _$jscoverage['/base/style.js'].lineData[689] = 0;
  _$jscoverage['/base/style.js'].lineData[694] = 0;
  _$jscoverage['/base/style.js'].lineData[696] = 0;
  _$jscoverage['/base/style.js'].lineData[697] = 0;
  _$jscoverage['/base/style.js'].lineData[701] = 0;
  _$jscoverage['/base/style.js'].lineData[702] = 0;
  _$jscoverage['/base/style.js'].lineData[707] = 0;
  _$jscoverage['/base/style.js'].lineData[708] = 0;
  _$jscoverage['/base/style.js'].lineData[709] = 0;
  _$jscoverage['/base/style.js'].lineData[710] = 0;
  _$jscoverage['/base/style.js'].lineData[711] = 0;
  _$jscoverage['/base/style.js'].lineData[714] = 0;
  _$jscoverage['/base/style.js'].lineData[715] = 0;
  _$jscoverage['/base/style.js'].lineData[719] = 0;
  _$jscoverage['/base/style.js'].lineData[725] = 0;
  _$jscoverage['/base/style.js'].lineData[726] = 0;
  _$jscoverage['/base/style.js'].lineData[727] = 0;
  _$jscoverage['/base/style.js'].lineData[729] = 0;
  _$jscoverage['/base/style.js'].lineData[731] = 0;
  _$jscoverage['/base/style.js'].lineData[734] = 0;
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
  _$jscoverage['/base/style.js'].functionData[31] = 0;
}
if (! _$jscoverage['/base/style.js'].branchData) {
  _$jscoverage['/base/style.js'].branchData = {};
  _$jscoverage['/base/style.js'].branchData['19'] = [];
  _$jscoverage['/base/style.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['22'] = [];
  _$jscoverage['/base/style.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['26'] = [];
  _$jscoverage['/base/style.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['35'] = [];
  _$jscoverage['/base/style.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['38'] = [];
  _$jscoverage['/base/style.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['46'] = [];
  _$jscoverage['/base/style.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['64'] = [];
  _$jscoverage['/base/style.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['65'] = [];
  _$jscoverage['/base/style.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['97'] = [];
  _$jscoverage['/base/style.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['102'] = [];
  _$jscoverage['/base/style.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['106'] = [];
  _$jscoverage['/base/style.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['106'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['113'] = [];
  _$jscoverage['/base/style.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['114'] = [];
  _$jscoverage['/base/style.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['148'] = [];
  _$jscoverage['/base/style.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['149'] = [];
  _$jscoverage['/base/style.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['153'] = [];
  _$jscoverage['/base/style.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['153'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['158'] = [];
  _$jscoverage['/base/style.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['190'] = [];
  _$jscoverage['/base/style.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['192'] = [];
  _$jscoverage['/base/style.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['198'] = [];
  _$jscoverage['/base/style.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['200'] = [];
  _$jscoverage['/base/style.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['205'] = [];
  _$jscoverage['/base/style.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['229'] = [];
  _$jscoverage['/base/style.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['231'] = [];
  _$jscoverage['/base/style.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['241'] = [];
  _$jscoverage['/base/style.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['244'] = [];
  _$jscoverage['/base/style.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['246'] = [];
  _$jscoverage['/base/style.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['246'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['246'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['247'] = [];
  _$jscoverage['/base/style.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['252'] = [];
  _$jscoverage['/base/style.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['254'] = [];
  _$jscoverage['/base/style.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['270'] = [];
  _$jscoverage['/base/style.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['272'] = [];
  _$jscoverage['/base/style.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['274'] = [];
  _$jscoverage['/base/style.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['290'] = [];
  _$jscoverage['/base/style.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['294'] = [];
  _$jscoverage['/base/style.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['295'] = [];
  _$jscoverage['/base/style.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['310'] = [];
  _$jscoverage['/base/style.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['312'] = [];
  _$jscoverage['/base/style.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['329'] = [];
  _$jscoverage['/base/style.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['339'] = [];
  _$jscoverage['/base/style.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['344'] = [];
  _$jscoverage['/base/style.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['353'] = [];
  _$jscoverage['/base/style.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['373'] = [];
  _$jscoverage['/base/style.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['380'] = [];
  _$jscoverage['/base/style.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['387'] = [];
  _$jscoverage['/base/style.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['449'] = [];
  _$jscoverage['/base/style.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['454'] = [];
  _$jscoverage['/base/style.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['456'] = [];
  _$jscoverage['/base/style.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['460'] = [];
  _$jscoverage['/base/style.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['461'] = [];
  _$jscoverage['/base/style.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['464'] = [];
  _$jscoverage['/base/style.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['471'] = [];
  _$jscoverage['/base/style.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['483'] = [];
  _$jscoverage['/base/style.js'].branchData['483'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['499'] = [];
  _$jscoverage['/base/style.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['501'] = [];
  _$jscoverage['/base/style.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['505'] = [];
  _$jscoverage['/base/style.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['506'] = [];
  _$jscoverage['/base/style.js'].branchData['506'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['506'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['510'] = [];
  _$jscoverage['/base/style.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['542'] = [];
  _$jscoverage['/base/style.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['542'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['543'] = [];
  _$jscoverage['/base/style.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['543'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['550'] = [];
  _$jscoverage['/base/style.js'].branchData['550'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['552'] = [];
  _$jscoverage['/base/style.js'].branchData['552'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['552'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['552'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['554'] = [];
  _$jscoverage['/base/style.js'].branchData['554'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['558'] = [];
  _$jscoverage['/base/style.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['561'] = [];
  _$jscoverage['/base/style.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['570'] = [];
  _$jscoverage['/base/style.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['570'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['574'] = [];
  _$jscoverage['/base/style.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['577'] = [];
  _$jscoverage['/base/style.js'].branchData['577'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['585'] = [];
  _$jscoverage['/base/style.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['585'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['585'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['586'] = [];
  _$jscoverage['/base/style.js'].branchData['586'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['590'] = [];
  _$jscoverage['/base/style.js'].branchData['590'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['599'] = [];
  _$jscoverage['/base/style.js'].branchData['599'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['611'] = [];
  _$jscoverage['/base/style.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['613'] = [];
  _$jscoverage['/base/style.js'].branchData['613'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['614'] = [];
  _$jscoverage['/base/style.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['616'] = [];
  _$jscoverage['/base/style.js'].branchData['616'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['621'] = [];
  _$jscoverage['/base/style.js'].branchData['621'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['629'] = [];
  _$jscoverage['/base/style.js'].branchData['629'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['635'] = [];
  _$jscoverage['/base/style.js'].branchData['635'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['651'] = [];
  _$jscoverage['/base/style.js'].branchData['651'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['652'] = [];
  _$jscoverage['/base/style.js'].branchData['652'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['653'] = [];
  _$jscoverage['/base/style.js'].branchData['653'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['654'] = [];
  _$jscoverage['/base/style.js'].branchData['654'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['656'] = [];
  _$jscoverage['/base/style.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['657'] = [];
  _$jscoverage['/base/style.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['661'] = [];
  _$jscoverage['/base/style.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['661'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['661'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['665'] = [];
  _$jscoverage['/base/style.js'].branchData['665'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['665'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['665'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['666'] = [];
  _$jscoverage['/base/style.js'].branchData['666'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['669'] = [];
  _$jscoverage['/base/style.js'].branchData['669'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['671'] = [];
  _$jscoverage['/base/style.js'].branchData['671'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['674'] = [];
  _$jscoverage['/base/style.js'].branchData['674'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['674'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['675'] = [];
  _$jscoverage['/base/style.js'].branchData['675'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['676'] = [];
  _$jscoverage['/base/style.js'].branchData['676'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['677'] = [];
  _$jscoverage['/base/style.js'].branchData['677'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['683'] = [];
  _$jscoverage['/base/style.js'].branchData['683'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['684'] = [];
  _$jscoverage['/base/style.js'].branchData['684'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['685'] = [];
  _$jscoverage['/base/style.js'].branchData['685'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['701'] = [];
  _$jscoverage['/base/style.js'].branchData['701'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['710'] = [];
  _$jscoverage['/base/style.js'].branchData['710'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['711'] = [];
  _$jscoverage['/base/style.js'].branchData['711'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['714'] = [];
  _$jscoverage['/base/style.js'].branchData['714'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['715'] = [];
  _$jscoverage['/base/style.js'].branchData['715'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['726'] = [];
  _$jscoverage['/base/style.js'].branchData['726'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['726'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['727'] = [];
  _$jscoverage['/base/style.js'].branchData['727'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['727'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['728'] = [];
  _$jscoverage['/base/style.js'].branchData['728'][1] = new BranchData();
}
_$jscoverage['/base/style.js'].branchData['728'][1].init(52, 46, 'Dom.css(offsetParent, \'position\') === \'static\'');
function visit525_728_1(result) {
  _$jscoverage['/base/style.js'].branchData['728'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['727'][2].init(110, 99, '!ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit524_727_2(result) {
  _$jscoverage['/base/style.js'].branchData['727'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['727'][1].init(94, 115, 'offsetParent && !ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit523_727_1(result) {
  _$jscoverage['/base/style.js'].branchData['727'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['726'][2].init(48, 23, 'el.ownerDocument || doc');
function visit522_726_2(result) {
  _$jscoverage['/base/style.js'].branchData['726'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['726'][1].init(28, 49, 'el.offsetParent || (el.ownerDocument || doc).body');
function visit521_726_1(result) {
  _$jscoverage['/base/style.js'].branchData['726'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['715'][1].init(806, 42, 'parseFloat(Dom.css(el, \'marginLeft\')) || 0');
function visit520_715_1(result) {
  _$jscoverage['/base/style.js'].branchData['715'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['714'][1].init(740, 41, 'parseFloat(Dom.css(el, \'marginTop\')) || 0');
function visit519_714_1(result) {
  _$jscoverage['/base/style.js'].branchData['714'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['711'][1].init(438, 57, 'parseFloat(Dom.css(offsetParent, \'borderLeftWidth\')) || 0');
function visit518_711_1(result) {
  _$jscoverage['/base/style.js'].branchData['711'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['710'][1].init(347, 56, 'parseFloat(Dom.css(offsetParent, \'borderTopWidth\')) || 0');
function visit517_710_1(result) {
  _$jscoverage['/base/style.js'].branchData['710'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['701'][1].init(106, 35, 'Dom.css(el, \'position\') === \'fixed\'');
function visit516_701_1(result) {
  _$jscoverage['/base/style.js'].branchData['701'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['685'][1].init(45, 23, 'extra === PADDING_INDEX');
function visit515_685_1(result) {
  _$jscoverage['/base/style.js'].branchData['685'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['684'][1].init(27, 22, 'extra === BORDER_INDEX');
function visit514_684_1(result) {
  _$jscoverage['/base/style.js'].branchData['684'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['683'][1].init(1600, 27, 'borderBoxValueOrIsBorderBox');
function visit513_683_1(result) {
  _$jscoverage['/base/style.js'].branchData['683'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['677'][1].init(17, 27, 'borderBoxValueOrIsBorderBox');
function visit512_677_1(result) {
  _$jscoverage['/base/style.js'].branchData['677'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['676'][1].init(1322, 23, 'extra === CONTENT_INDEX');
function visit511_676_1(result) {
  _$jscoverage['/base/style.js'].branchData['676'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['675'][1].init(1279, 29, 'borderBoxValue || cssBoxValue');
function visit510_675_1(result) {
  _$jscoverage['/base/style.js'].branchData['675'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['674'][2].init(1216, 28, 'borderBoxValue !== undefined');
function visit509_674_2(result) {
  _$jscoverage['/base/style.js'].branchData['674'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['674'][1].init(1216, 43, 'borderBoxValue !== undefined || isBorderBox');
function visit508_674_1(result) {
  _$jscoverage['/base/style.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['671'][1].init(1077, 19, 'extra === undefined');
function visit507_671_1(result) {
  _$jscoverage['/base/style.js'].branchData['671'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['669'][1].init(408, 28, 'parseFloat(cssBoxValue) || 0');
function visit506_669_1(result) {
  _$jscoverage['/base/style.js'].branchData['669'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['666'][1].init(31, 23, 'elem.style[name] || 0');
function visit505_666_1(result) {
  _$jscoverage['/base/style.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['665'][3].init(228, 24, '(Number(cssBoxValue)) < 0');
function visit504_665_3(result) {
  _$jscoverage['/base/style.js'].branchData['665'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['665'][2].init(204, 19, 'cssBoxValue == null');
function visit503_665_2(result) {
  _$jscoverage['/base/style.js'].branchData['665'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['665'][1].init(204, 48, 'cssBoxValue == null || (Number(cssBoxValue)) < 0');
function visit502_665_1(result) {
  _$jscoverage['/base/style.js'].branchData['665'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['661'][3].init(595, 19, 'borderBoxValue <= 0');
function visit501_661_3(result) {
  _$jscoverage['/base/style.js'].branchData['661'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['661'][2].init(569, 22, 'borderBoxValue == null');
function visit500_661_2(result) {
  _$jscoverage['/base/style.js'].branchData['661'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['661'][1].init(569, 45, 'borderBoxValue == null || borderBoxValue <= 0');
function visit499_661_1(result) {
  _$jscoverage['/base/style.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['657'][1].init(96, 14, 'name === WIDTH');
function visit498_657_1(result) {
  _$jscoverage['/base/style.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['656'][1].init(274, 14, 'name === WIDTH');
function visit497_656_1(result) {
  _$jscoverage['/base/style.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['654'][1].init(20, 14, 'name === WIDTH');
function visit496_654_1(result) {
  _$jscoverage['/base/style.js'].branchData['654'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['653'][1].init(144, 19, 'elem.nodeType === 9');
function visit495_653_1(result) {
  _$jscoverage['/base/style.js'].branchData['653'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['652'][1].init(20, 14, 'name === WIDTH');
function visit494_652_1(result) {
  _$jscoverage['/base/style.js'].branchData['652'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['651'][1].init(13, 19, 'util.isWindow(elem)');
function visit493_651_1(result) {
  _$jscoverage['/base/style.js'].branchData['651'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['635'][1].init(78, 15, 'doc.defaultView');
function visit492_635_1(result) {
  _$jscoverage['/base/style.js'].branchData['635'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['629'][1].init(16, 72, 'Dom._getComputedStyle(elem, \'boxSizing\', computedStyle) === \'border-box\'');
function visit491_629_1(result) {
  _$jscoverage['/base/style.js'].branchData['629'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['621'][1].init(271, 68, 'parseFloat(Dom._getComputedStyle(elem, cssProp, computedStyle)) || 0');
function visit490_621_1(result) {
  _$jscoverage['/base/style.js'].branchData['621'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['616'][1].init(58, 17, 'prop === \'border\'');
function visit489_616_1(result) {
  _$jscoverage['/base/style.js'].branchData['616'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['614'][1].init(29, 16, 'i < which.length');
function visit488_614_1(result) {
  _$jscoverage['/base/style.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['613'][1].init(46, 4, 'prop');
function visit487_613_1(result) {
  _$jscoverage['/base/style.js'].branchData['613'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['611'][1].init(56, 16, 'j < props.length');
function visit486_611_1(result) {
  _$jscoverage['/base/style.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['599'][1].init(124, 22, 'elem.offsetWidth !== 0');
function visit485_599_1(result) {
  _$jscoverage['/base/style.js'].branchData['599'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['590'][1].init(326, 17, 'ret === undefined');
function visit484_590_1(result) {
  _$jscoverage['/base/style.js'].branchData['590'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['586'][1].init(33, 42, '(ret = hook.get(elem, false)) !== undefined');
function visit483_586_1(result) {
  _$jscoverage['/base/style.js'].branchData['586'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['585'][3].init(103, 76, '\'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit482_585_3(result) {
  _$jscoverage['/base/style.js'].branchData['585'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['585'][2].init(95, 84, 'hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit481_585_2(result) {
  _$jscoverage['/base/style.js'].branchData['585'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['585'][1].init(93, 87, '!(hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined)');
function visit480_585_1(result) {
  _$jscoverage['/base/style.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['577'][1].init(137, 9, 'UA.webkit');
function visit479_577_1(result) {
  _$jscoverage['/base/style.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['574'][1].init(849, 16, '!elStyle.cssText');
function visit478_574_1(result) {
  _$jscoverage['/base/style.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['570'][2].init(301, 13, 'val === EMPTY');
function visit477_570_2(result) {
  _$jscoverage['/base/style.js'].branchData['570'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['570'][1].init(301, 40, 'val === EMPTY && elStyle.removeAttribute');
function visit476_570_1(result) {
  _$jscoverage['/base/style.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['561'][1].init(385, 17, 'val !== undefined');
function visit475_561_1(result) {
  _$jscoverage['/base/style.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['558'][1].init(292, 16, 'hook && hook.set');
function visit474_558_1(result) {
  _$jscoverage['/base/style.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['554'][1].init(134, 39, '!isNaN(Number(val)) && !cssNumber[name]');
function visit473_554_1(result) {
  _$jscoverage['/base/style.js'].branchData['554'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['552'][3].init(64, 13, 'val === EMPTY');
function visit472_552_3(result) {
  _$jscoverage['/base/style.js'].branchData['552'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['552'][2].init(48, 12, 'val === null');
function visit471_552_2(result) {
  _$jscoverage['/base/style.js'].branchData['552'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['552'][1].init(48, 29, 'val === null || val === EMPTY');
function visit470_552_1(result) {
  _$jscoverage['/base/style.js'].branchData['552'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['550'][1].init(330, 17, 'val !== undefined');
function visit469_550_1(result) {
  _$jscoverage['/base/style.js'].branchData['550'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['543'][2].init(106, 19, 'elem.nodeType === 8');
function visit468_543_2(result) {
  _$jscoverage['/base/style.js'].branchData['543'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['543'][1].init(34, 46, 'elem.nodeType === 8 || !(elStyle = elem.style)');
function visit467_543_1(result) {
  _$jscoverage['/base/style.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['542'][2].init(69, 19, 'elem.nodeType === 3');
function visit466_542_2(result) {
  _$jscoverage['/base/style.js'].branchData['542'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['542'][1].init(69, 81, 'elem.nodeType === 3 || elem.nodeType === 8 || !(elStyle = elem.style)');
function visit465_542_1(result) {
  _$jscoverage['/base/style.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['510'][1].init(501, 37, 'isAutoPosition || NO_PX_REG.test(val)');
function visit464_510_1(result) {
  _$jscoverage['/base/style.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['506'][2].init(321, 23, 'position === \'relative\'');
function visit463_506_2(result) {
  _$jscoverage['/base/style.js'].branchData['506'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['506'][1].init(303, 41, 'isAutoPosition && position === \'relative\'');
function visit462_506_1(result) {
  _$jscoverage['/base/style.js'].branchData['506'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['505'][1].init(263, 14, 'val === \'auto\'');
function visit461_505_1(result) {
  _$jscoverage['/base/style.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['501'][1].init(81, 21, 'position === \'static\'');
function visit460_501_1(result) {
  _$jscoverage['/base/style.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['499'][1].init(112, 8, 'computed');
function visit459_499_1(result) {
  _$jscoverage['/base/style.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['483'][1].init(46, 8, 'computed');
function visit458_483_1(result) {
  _$jscoverage['/base/style.js'].branchData['483'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['471'][1].init(540, 53, 'elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX)');
function visit457_471_1(result) {
  _$jscoverage['/base/style.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['464'][1].init(163, 11, 'isBorderBox');
function visit456_464_1(result) {
  _$jscoverage['/base/style.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['461'][1].init(21, 4, 'elem');
function visit455_461_1(result) {
  _$jscoverage['/base/style.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['460'][1].init(59, 17, 'val !== undefined');
function visit454_460_1(result) {
  _$jscoverage['/base/style.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['456'][1].init(441, 14, 'name === WIDTH');
function visit453_456_1(result) {
  _$jscoverage['/base/style.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['454'][1].init(60, 79, 'el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX)');
function visit452_454_1(result) {
  _$jscoverage['/base/style.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['449'][1].init(60, 49, 'el && getWHIgnoreDisplay(el, name, PADDING_INDEX)');
function visit451_449_1(result) {
  _$jscoverage['/base/style.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['387'][1].init(93, 6, 'j >= 0');
function visit450_387_1(result) {
  _$jscoverage['/base/style.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['380'][1].init(29, 39, '!util.inArray(getNodeName(e), excludes)');
function visit449_380_1(result) {
  _$jscoverage['/base/style.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['373'][1].init(272, 6, 'j >= 0');
function visit448_373_1(result) {
  _$jscoverage['/base/style.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['353'][1].init(744, 15, 'elem.styleSheet');
function visit447_353_1(result) {
  _$jscoverage['/base/style.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['344'][1].init(489, 4, 'elem');
function visit446_344_1(result) {
  _$jscoverage['/base/style.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['339'][1].init(329, 35, 'id && (id = id.replace(\'#\', EMPTY))');
function visit445_339_1(result) {
  _$jscoverage['/base/style.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['329'][1].init(21, 26, 'typeof refWin === \'string\'');
function visit444_329_1(result) {
  _$jscoverage['/base/style.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['312'][1].init(60, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit443_312_1(result) {
  _$jscoverage['/base/style.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['310'][1].init(118, 6, 'i >= 0');
function visit442_310_1(result) {
  _$jscoverage['/base/style.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['295'][1].init(29, 3, 'old');
function visit441_295_1(result) {
  _$jscoverage['/base/style.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['294'][1].init(150, 12, 'old !== NONE');
function visit440_294_1(result) {
  _$jscoverage['/base/style.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['290'][1].init(118, 6, 'i >= 0');
function visit439_290_1(result) {
  _$jscoverage['/base/style.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['274'][1].init(201, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit438_274_1(result) {
  _$jscoverage['/base/style.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['272'][1].init(78, 36, 'Dom.data(elem, OLD_DISPLAY) || EMPTY');
function visit437_272_1(result) {
  _$jscoverage['/base/style.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['270'][1].init(172, 6, 'i >= 0');
function visit436_270_1(result) {
  _$jscoverage['/base/style.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['254'][1].init(46, 6, 'i >= 0');
function visit435_254_1(result) {
  _$jscoverage['/base/style.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['252'][1].init(482, 26, 'typeof ret === \'undefined\'');
function visit434_252_1(result) {
  _$jscoverage['/base/style.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['247'][1].init(45, 41, '(ret = hook.get(elem, true)) !== undefined');
function visit433_247_1(result) {
  _$jscoverage['/base/style.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['246'][3].init(123, 87, '\'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit432_246_3(result) {
  _$jscoverage['/base/style.js'].branchData['246'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['246'][2].init(115, 95, 'hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit431_246_2(result) {
  _$jscoverage['/base/style.js'].branchData['246'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['246'][1].init(113, 98, '!(hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined)');
function visit430_246_1(result) {
  _$jscoverage['/base/style.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['244'][1].init(114, 4, 'elem');
function visit429_244_1(result) {
  _$jscoverage['/base/style.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['241'][1].init(648, 17, 'val === undefined');
function visit428_241_1(result) {
  _$jscoverage['/base/style.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['231'][1].init(50, 6, 'i >= 0');
function visit427_231_1(result) {
  _$jscoverage['/base/style.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['229'][1].init(233, 24, 'util.isPlainObject(name)');
function visit426_229_1(result) {
  _$jscoverage['/base/style.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['205'][1].init(46, 6, 'i >= 0');
function visit425_205_1(result) {
  _$jscoverage['/base/style.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['200'][1].init(55, 4, 'elem');
function visit424_200_1(result) {
  _$jscoverage['/base/style.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['198'][1].init(496, 17, 'val === undefined');
function visit423_198_1(result) {
  _$jscoverage['/base/style.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['192'][1].init(50, 6, 'i >= 0');
function visit422_192_1(result) {
  _$jscoverage['/base/style.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['190'][1].init(187, 24, 'util.isPlainObject(name)');
function visit421_190_1(result) {
  _$jscoverage['/base/style.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['158'][1].init(758, 51, 'Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)');
function visit420_158_1(result) {
  _$jscoverage['/base/style.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['153'][2].init(575, 10, 'val === \'\'');
function visit419_153_2(result) {
  _$jscoverage['/base/style.js'].branchData['153'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['153'][1].init(575, 36, 'val === \'\' && !Dom.contains(d, elem)');
function visit418_153_1(result) {
  _$jscoverage['/base/style.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['149'][1].init(27, 59, 'computedStyle.getPropertyValue(name) || computedStyle[name]');
function visit417_149_1(result) {
  _$jscoverage['/base/style.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['148'][1].init(344, 59, 'computedStyle || d.defaultView.getComputedStyle(elem, null)');
function visit416_148_1(result) {
  _$jscoverage['/base/style.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['114'][1].init(20, 31, 'doc.body || doc.documentElement');
function visit415_114_1(result) {
  _$jscoverage['/base/style.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['113'][1].init(101, 26, '!defaultDisplay[tagName]');
function visit414_113_1(result) {
  _$jscoverage['/base/style.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['106'][2].init(136, 29, 'vendor && vendor.propertyName');
function visit413_106_2(result) {
  _$jscoverage['/base/style.js'].branchData['106'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['106'][1].init(136, 37, 'vendor && vendor.propertyName || name');
function visit412_106_1(result) {
  _$jscoverage['/base/style.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['102'][1].init(13, 14, 'cssProps[name]');
function visit411_102_1(result) {
  _$jscoverage['/base/style.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['97'][1].init(1306, 57, 'userSelectVendorInfo && userSelectVendorInfo.propertyName');
function visit410_97_1(result) {
  _$jscoverage['/base/style.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['65'][1].init(334, 26, 'doc && doc.documentElement');
function visit409_65_1(result) {
  _$jscoverage['/base/style.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['64'][1].init(279, 27, 'globalWindow.document || {}');
function visit408_64_1(result) {
  _$jscoverage['/base/style.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['46'][1].init(601, 25, 'vendorInfos[name] || null');
function visit407_46_1(result) {
  _$jscoverage['/base/style.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['38'][1].init(149, 34, 'vendorName in documentElementStyle');
function visit406_38_1(result) {
  _$jscoverage['/base/style.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['35'][1].init(137, 26, 'i < propertyPrefixesLength');
function visit405_35_1(result) {
  _$jscoverage['/base/style.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['26'][1].init(252, 53, '!documentElementStyle || name in documentElementStyle');
function visit404_26_1(result) {
  _$jscoverage['/base/style.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['22'][1].init(116, 19, 'name in vendorInfos');
function visit403_22_1(result) {
  _$jscoverage['/base/style.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['19'][1].init(13, 24, 'name.indexOf(\'-\') !== -1');
function visit402_19_1(result) {
  _$jscoverage['/base/style.js'].branchData['19'][1].ranCondition(result);
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
  _$jscoverage['/base/style.js'].lineData[13]++;
  function camelCase(name) {
    _$jscoverage['/base/style.js'].functionData[2]++;
    _$jscoverage['/base/style.js'].lineData[14]++;
    return name.replace(RE_DASH, upperCase);
  }
  _$jscoverage['/base/style.js'].lineData[18]++;
  function getCssVendorInfo(name) {
    _$jscoverage['/base/style.js'].functionData[3]++;
    _$jscoverage['/base/style.js'].lineData[19]++;
    if (visit402_19_1(name.indexOf('-') !== -1)) {
      _$jscoverage['/base/style.js'].lineData[20]++;
      name = name.replace(RE_DASH, upperCase);
    }
    _$jscoverage['/base/style.js'].lineData[22]++;
    if (visit403_22_1(name in vendorInfos)) {
      _$jscoverage['/base/style.js'].lineData[23]++;
      return vendorInfos[name];
    }
    _$jscoverage['/base/style.js'].lineData[26]++;
    if (visit404_26_1(!documentElementStyle || name in documentElementStyle)) {
      _$jscoverage['/base/style.js'].lineData[27]++;
      vendorInfos[name] = {
  propertyName: name, 
  propertyNamePrefix: ''};
    } else {
      _$jscoverage['/base/style.js'].lineData[32]++;
      var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1), vendorName;
      _$jscoverage['/base/style.js'].lineData[35]++;
      for (var i = 0; visit405_35_1(i < propertyPrefixesLength); i++) {
        _$jscoverage['/base/style.js'].lineData[36]++;
        var propertyNamePrefix = propertyPrefixes[i];
        _$jscoverage['/base/style.js'].lineData[37]++;
        vendorName = propertyNamePrefix + upperFirstName;
        _$jscoverage['/base/style.js'].lineData[38]++;
        if (visit406_38_1(vendorName in documentElementStyle)) {
          _$jscoverage['/base/style.js'].lineData[39]++;
          vendorInfos[name] = {
  propertyName: vendorName, 
  propertyNamePrefix: propertyNamePrefix};
        }
      }
      _$jscoverage['/base/style.js'].lineData[46]++;
      vendorInfos[name] = visit407_46_1(vendorInfos[name] || null);
    }
    _$jscoverage['/base/style.js'].lineData[48]++;
    return vendorInfos[name];
  }
  _$jscoverage['/base/style.js'].lineData[51]++;
  var util = S;
  _$jscoverage['/base/style.js'].lineData[52]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/base/style.js'].lineData[53]++;
  var Dom = require('./api');
  _$jscoverage['/base/style.js'].lineData[54]++;
  var globalWindow = S.Env.host, vendorInfos = {}, propertyPrefixes = ['Webkit', 'Moz', 'O', 'ms'], propertyPrefixesLength = propertyPrefixes.length, doc = visit408_64_1(globalWindow.document || {}), documentElement = visit409_65_1(doc && doc.documentElement), documentElementStyle = documentElement.style, UA = require('ua'), BOX_MODELS = ['margin', 'border', 'padding'], CONTENT_INDEX = -1, PADDING_INDEX = 2, BORDER_INDEX = 1, MARGIN_INDEX = 0, getNodeName = Dom.nodeName, RE_MARGIN = /^margin/, WIDTH = 'width', HEIGHT = 'height', DISPLAY = 'display', OLD_DISPLAY = DISPLAY + util.now(), NONE = 'none', cssNumber = {
  fillOpacity: 1, 
  fontWeight: 1, 
  lineHeight: 1, 
  opacity: 1, 
  orphans: 1, 
  widows: 1, 
  zIndex: 1, 
  zoom: 1}, EMPTY = '', DEFAULT_UNIT = 'px', NO_PX_REG = /\d(?!px)[a-z%]+$/i, cssHooks = {}, cssProps = {}, defaultDisplay = {}, userSelectVendorInfo = getCssVendorInfo('userSelect'), userSelectProperty = visit410_97_1(userSelectVendorInfo && userSelectVendorInfo.propertyName);
  _$jscoverage['/base/style.js'].lineData[99]++;
  cssProps['float'] = 'cssFloat';
  _$jscoverage['/base/style.js'].lineData[101]++;
  function normalizeCssPropName(name) {
    _$jscoverage['/base/style.js'].functionData[4]++;
    _$jscoverage['/base/style.js'].lineData[102]++;
    if (visit411_102_1(cssProps[name])) {
      _$jscoverage['/base/style.js'].lineData[103]++;
      return cssProps[name];
    }
    _$jscoverage['/base/style.js'].lineData[105]++;
    var vendor = getCssVendorInfo(name);
    _$jscoverage['/base/style.js'].lineData[106]++;
    return visit412_106_1(visit413_106_2(vendor && vendor.propertyName) || name);
  }
  _$jscoverage['/base/style.js'].lineData[109]++;
  function getDefaultDisplay(tagName) {
    _$jscoverage['/base/style.js'].functionData[5]++;
    _$jscoverage['/base/style.js'].lineData[110]++;
    var body, oldDisplay = defaultDisplay[tagName], elem;
    _$jscoverage['/base/style.js'].lineData[113]++;
    if (visit414_113_1(!defaultDisplay[tagName])) {
      _$jscoverage['/base/style.js'].lineData[114]++;
      body = visit415_114_1(doc.body || doc.documentElement);
      _$jscoverage['/base/style.js'].lineData[115]++;
      elem = doc.createElement(tagName);
      _$jscoverage['/base/style.js'].lineData[117]++;
      Dom.prepend(elem, body);
      _$jscoverage['/base/style.js'].lineData[118]++;
      oldDisplay = Dom.css(elem, 'display');
      _$jscoverage['/base/style.js'].lineData[119]++;
      body.removeChild(elem);
      _$jscoverage['/base/style.js'].lineData[121]++;
      defaultDisplay[tagName] = oldDisplay;
    }
    _$jscoverage['/base/style.js'].lineData[123]++;
    return oldDisplay;
  }
  _$jscoverage['/base/style.js'].lineData[126]++;
  util.mix(Dom, {
  _cssHooks: cssHooks, 
  _cssProps: cssProps, 
  _getComputedStyle: function(elem, name, computedStyle) {
  _$jscoverage['/base/style.js'].functionData[6]++;
  _$jscoverage['/base/style.js'].lineData[138]++;
  var val = '', width, minWidth, maxWidth, style, d = elem.ownerDocument;
  _$jscoverage['/base/style.js'].lineData[145]++;
  name = normalizeCssPropName(name);
  _$jscoverage['/base/style.js'].lineData[148]++;
  if ((computedStyle = (visit416_148_1(computedStyle || d.defaultView.getComputedStyle(elem, null))))) {
    _$jscoverage['/base/style.js'].lineData[149]++;
    val = visit417_149_1(computedStyle.getPropertyValue(name) || computedStyle[name]);
  }
  _$jscoverage['/base/style.js'].lineData[153]++;
  if (visit418_153_1(visit419_153_2(val === '') && !Dom.contains(d, elem))) {
    _$jscoverage['/base/style.js'].lineData[154]++;
    val = elem.style[name];
  }
  _$jscoverage['/base/style.js'].lineData[158]++;
  if (visit420_158_1(Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name))) {
    _$jscoverage['/base/style.js'].lineData[159]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[160]++;
    width = style.width;
    _$jscoverage['/base/style.js'].lineData[161]++;
    minWidth = style.minWidth;
    _$jscoverage['/base/style.js'].lineData[162]++;
    maxWidth = style.maxWidth;
    _$jscoverage['/base/style.js'].lineData[164]++;
    style.minWidth = style.maxWidth = style.width = val;
    _$jscoverage['/base/style.js'].lineData[165]++;
    val = computedStyle.width;
    _$jscoverage['/base/style.js'].lineData[167]++;
    style.width = width;
    _$jscoverage['/base/style.js'].lineData[168]++;
    style.minWidth = minWidth;
    _$jscoverage['/base/style.js'].lineData[169]++;
    style.maxWidth = maxWidth;
  }
  _$jscoverage['/base/style.js'].lineData[172]++;
  return val;
}, 
  style: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[7]++;
  _$jscoverage['/base/style.js'].lineData[185]++;
  var els = Dom.query(selector), k, ret, elem = els[0], i;
  _$jscoverage['/base/style.js'].lineData[190]++;
  if (visit421_190_1(util.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[191]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[192]++;
      for (i = els.length - 1; visit422_192_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[193]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[196]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[198]++;
  if (visit423_198_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[199]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[200]++;
    if (visit424_200_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[201]++;
      ret = style(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[203]++;
    return ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[205]++;
    for (i = els.length - 1; visit425_205_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[206]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[209]++;
  return undefined;
}, 
  css: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[8]++;
  _$jscoverage['/base/style.js'].lineData[222]++;
  var els = Dom.query(selector), elem = els[0], k, hook, ret, i;
  _$jscoverage['/base/style.js'].lineData[229]++;
  if (visit426_229_1(util.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[230]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[231]++;
      for (i = els.length - 1; visit427_231_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[232]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[235]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[238]++;
  name = camelCase(name);
  _$jscoverage['/base/style.js'].lineData[239]++;
  hook = cssHooks[name];
  _$jscoverage['/base/style.js'].lineData[241]++;
  if (visit428_241_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[243]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[244]++;
    if (visit429_244_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[246]++;
      if (visit430_246_1(!(visit431_246_2(hook && visit432_246_3('get' in hook && visit433_247_1((ret = hook.get(elem, true)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[249]++;
        ret = Dom._getComputedStyle(elem, name);
      }
    }
    _$jscoverage['/base/style.js'].lineData[252]++;
    return (visit434_252_1(typeof ret === 'undefined')) ? '' : ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[254]++;
    for (i = els.length - 1; visit435_254_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[255]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[258]++;
  return undefined;
}, 
  show: function(selector) {
  _$jscoverage['/base/style.js'].functionData[9]++;
  _$jscoverage['/base/style.js'].lineData[266]++;
  var els = Dom.query(selector), tagName, old, elem, i;
  _$jscoverage['/base/style.js'].lineData[270]++;
  for (i = els.length - 1; visit436_270_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[271]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[272]++;
    elem.style[DISPLAY] = visit437_272_1(Dom.data(elem, OLD_DISPLAY) || EMPTY);
    _$jscoverage['/base/style.js'].lineData[274]++;
    if (visit438_274_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[275]++;
      tagName = elem.tagName.toLowerCase();
      _$jscoverage['/base/style.js'].lineData[276]++;
      old = getDefaultDisplay(tagName);
      _$jscoverage['/base/style.js'].lineData[277]++;
      Dom.data(elem, OLD_DISPLAY, old);
      _$jscoverage['/base/style.js'].lineData[278]++;
      elem.style[DISPLAY] = old;
    }
  }
}, 
  hide: function(selector) {
  _$jscoverage['/base/style.js'].functionData[10]++;
  _$jscoverage['/base/style.js'].lineData[288]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[290]++;
  for (i = els.length - 1; visit439_290_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[291]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[292]++;
    var style = elem.style, old = style[DISPLAY];
    _$jscoverage['/base/style.js'].lineData[294]++;
    if (visit440_294_1(old !== NONE)) {
      _$jscoverage['/base/style.js'].lineData[295]++;
      if (visit441_295_1(old)) {
        _$jscoverage['/base/style.js'].lineData[296]++;
        Dom.data(elem, OLD_DISPLAY, old);
      }
      _$jscoverage['/base/style.js'].lineData[298]++;
      style[DISPLAY] = NONE;
    }
  }
}, 
  toggle: function(selector) {
  _$jscoverage['/base/style.js'].functionData[11]++;
  _$jscoverage['/base/style.js'].lineData[308]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[310]++;
  for (i = els.length - 1; visit442_310_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[311]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[312]++;
    if (visit443_312_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[313]++;
      Dom.show(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[315]++;
      Dom.hide(elem);
    }
  }
}, 
  addStyleSheet: function(refWin, cssText, id) {
  _$jscoverage['/base/style.js'].functionData[12]++;
  _$jscoverage['/base/style.js'].lineData[329]++;
  if (visit444_329_1(typeof refWin === 'string')) {
    _$jscoverage['/base/style.js'].lineData[330]++;
    id = cssText;
    _$jscoverage['/base/style.js'].lineData[331]++;
    cssText = refWin;
    _$jscoverage['/base/style.js'].lineData[333]++;
    refWin = globalWindow;
  }
  _$jscoverage['/base/style.js'].lineData[336]++;
  var doc = Dom.getDocument(refWin), elem;
  _$jscoverage['/base/style.js'].lineData[339]++;
  if (visit445_339_1(id && (id = id.replace('#', EMPTY)))) {
    _$jscoverage['/base/style.js'].lineData[340]++;
    elem = Dom.get('#' + id, doc);
  }
  _$jscoverage['/base/style.js'].lineData[344]++;
  if (visit446_344_1(elem)) {
    _$jscoverage['/base/style.js'].lineData[345]++;
    return;
  }
  _$jscoverage['/base/style.js'].lineData[348]++;
  elem = Dom.create('<style>', {
  id: id}, doc);
  _$jscoverage['/base/style.js'].lineData[351]++;
  Dom.get('head', doc).appendChild(elem);
  _$jscoverage['/base/style.js'].lineData[353]++;
  if (visit447_353_1(elem.styleSheet)) {
    _$jscoverage['/base/style.js'].lineData[354]++;
    elem.styleSheet.cssText = cssText;
  } else {
    _$jscoverage['/base/style.js'].lineData[356]++;
    elem.appendChild(doc.createTextNode(cssText));
  }
}, 
  unselectable: !userSelectProperty ? function(selector) {
  _$jscoverage['/base/style.js'].functionData[13]++;
  _$jscoverage['/base/style.js'].lineData[365]++;
  var _els = Dom.query(selector), elem, j, e, i = 0, excludes, style, els;
  _$jscoverage['/base/style.js'].lineData[373]++;
  for (j = _els.length - 1; visit448_373_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[374]++;
    elem = _els[j];
    _$jscoverage['/base/style.js'].lineData[375]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[376]++;
    els = elem.getElementsByTagName('*');
    _$jscoverage['/base/style.js'].lineData[377]++;
    elem.setAttribute('unselectable', 'on');
    _$jscoverage['/base/style.js'].lineData[378]++;
    excludes = ['iframe', 'textarea', 'input', 'select'];
    _$jscoverage['/base/style.js'].lineData[379]++;
    while ((e = els[i++])) {
      _$jscoverage['/base/style.js'].lineData[380]++;
      if (visit449_380_1(!util.inArray(getNodeName(e), excludes))) {
        _$jscoverage['/base/style.js'].lineData[381]++;
        e.setAttribute('unselectable', 'on');
      }
    }
  }
} : function(selector) {
  _$jscoverage['/base/style.js'].functionData[14]++;
  _$jscoverage['/base/style.js'].lineData[386]++;
  var els = Dom.query(selector);
  _$jscoverage['/base/style.js'].lineData[387]++;
  for (var j = els.length - 1; visit450_387_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[388]++;
    els[j].style[userSelectProperty] = 'none';
  }
}, 
  innerWidth: 0, 
  innerHeight: 0, 
  outerWidth: 0, 
  outerHeight: 0, 
  width: 0, 
  height: 0});
  _$jscoverage['/base/style.js'].lineData[446]++;
  util.each([WIDTH, HEIGHT], function(name) {
  _$jscoverage['/base/style.js'].functionData[15]++;
  _$jscoverage['/base/style.js'].lineData[447]++;
  Dom['inner' + util.ucfirst(name)] = function(selector) {
  _$jscoverage['/base/style.js'].functionData[16]++;
  _$jscoverage['/base/style.js'].lineData[448]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[449]++;
  return visit451_449_1(el && getWHIgnoreDisplay(el, name, PADDING_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[452]++;
  Dom['outer' + util.ucfirst(name)] = function(selector, includeMargin) {
  _$jscoverage['/base/style.js'].functionData[17]++;
  _$jscoverage['/base/style.js'].lineData[453]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[454]++;
  return visit452_454_1(el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[456]++;
  var which = visit453_456_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'];
  _$jscoverage['/base/style.js'].lineData[458]++;
  Dom[name] = function(selector, val) {
  _$jscoverage['/base/style.js'].functionData[18]++;
  _$jscoverage['/base/style.js'].lineData[459]++;
  var elem = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[460]++;
  if (visit454_460_1(val !== undefined)) {
    _$jscoverage['/base/style.js'].lineData[461]++;
    if (visit455_461_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[462]++;
      var computedStyle = getComputedStyle(elem);
      _$jscoverage['/base/style.js'].lineData[463]++;
      var isBorderBox = isBorderBoxFn(elem, computedStyle);
      _$jscoverage['/base/style.js'].lineData[464]++;
      if (visit456_464_1(isBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[465]++;
        val += getPBMWidth(elem, ['padding', 'border'], which, computedStyle);
      }
      _$jscoverage['/base/style.js'].lineData[467]++;
      return Dom.css(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[469]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[471]++;
  return visit457_471_1(elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[477]++;
  cssHooks[name] = {
  get: function(elem, computed) {
  _$jscoverage['/base/style.js'].functionData[19]++;
  _$jscoverage['/base/style.js'].lineData[482]++;
  var val;
  _$jscoverage['/base/style.js'].lineData[483]++;
  if (visit458_483_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[484]++;
    val = getWHIgnoreDisplay(elem, name) + 'px';
  }
  _$jscoverage['/base/style.js'].lineData[486]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[491]++;
  var cssShow = {
  position: 'absolute', 
  visibility: 'hidden', 
  display: 'block'};
  _$jscoverage['/base/style.js'].lineData[493]++;
  util.each(['left', 'top'], function(name) {
  _$jscoverage['/base/style.js'].functionData[20]++;
  _$jscoverage['/base/style.js'].lineData[494]++;
  cssHooks[name] = {
  get: function(el, computed) {
  _$jscoverage['/base/style.js'].functionData[21]++;
  _$jscoverage['/base/style.js'].lineData[496]++;
  var val, isAutoPosition, position;
  _$jscoverage['/base/style.js'].lineData[499]++;
  if (visit459_499_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[500]++;
    position = Dom.css(el, 'position');
    _$jscoverage['/base/style.js'].lineData[501]++;
    if (visit460_501_1(position === 'static')) {
      _$jscoverage['/base/style.js'].lineData[502]++;
      return 'auto';
    }
    _$jscoverage['/base/style.js'].lineData[504]++;
    val = Dom._getComputedStyle(el, name);
    _$jscoverage['/base/style.js'].lineData[505]++;
    isAutoPosition = visit461_505_1(val === 'auto');
    _$jscoverage['/base/style.js'].lineData[506]++;
    if (visit462_506_1(isAutoPosition && visit463_506_2(position === 'relative'))) {
      _$jscoverage['/base/style.js'].lineData[507]++;
      return '0px';
    }
    _$jscoverage['/base/style.js'].lineData[510]++;
    if (visit464_510_1(isAutoPosition || NO_PX_REG.test(val))) {
      _$jscoverage['/base/style.js'].lineData[511]++;
      val = getPosition(el)[name] + 'px';
    }
  }
  _$jscoverage['/base/style.js'].lineData[514]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[519]++;
  function swap(elem, options, callback) {
    _$jscoverage['/base/style.js'].functionData[22]++;
    _$jscoverage['/base/style.js'].lineData[520]++;
    var old = {}, style = elem.style, name;
    _$jscoverage['/base/style.js'].lineData[525]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[526]++;
      old[name] = style[name];
      _$jscoverage['/base/style.js'].lineData[527]++;
      style[name] = options[name];
    }
    _$jscoverage['/base/style.js'].lineData[530]++;
    callback.call(elem);
    _$jscoverage['/base/style.js'].lineData[533]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[534]++;
      style[name] = old[name];
    }
  }
  _$jscoverage['/base/style.js'].lineData[538]++;
  function style(elem, name, val) {
    _$jscoverage['/base/style.js'].functionData[23]++;
    _$jscoverage['/base/style.js'].lineData[539]++;
    var elStyle, ret, hook;
    _$jscoverage['/base/style.js'].lineData[542]++;
    if (visit465_542_1(visit466_542_2(elem.nodeType === 3) || visit467_543_1(visit468_543_2(elem.nodeType === 8) || !(elStyle = elem.style)))) {
      _$jscoverage['/base/style.js'].lineData[544]++;
      return undefined;
    }
    _$jscoverage['/base/style.js'].lineData[546]++;
    name = camelCase(name);
    _$jscoverage['/base/style.js'].lineData[547]++;
    hook = cssHooks[name];
    _$jscoverage['/base/style.js'].lineData[548]++;
    name = normalizeCssPropName(name);
    _$jscoverage['/base/style.js'].lineData[550]++;
    if (visit469_550_1(val !== undefined)) {
      _$jscoverage['/base/style.js'].lineData[552]++;
      if (visit470_552_1(visit471_552_2(val === null) || visit472_552_3(val === EMPTY))) {
        _$jscoverage['/base/style.js'].lineData[553]++;
        val = EMPTY;
      } else {
        _$jscoverage['/base/style.js'].lineData[554]++;
        if (visit473_554_1(!isNaN(Number(val)) && !cssNumber[name])) {
          _$jscoverage['/base/style.js'].lineData[556]++;
          val += DEFAULT_UNIT;
        }
      }
      _$jscoverage['/base/style.js'].lineData[558]++;
      if (visit474_558_1(hook && hook.set)) {
        _$jscoverage['/base/style.js'].lineData[559]++;
        val = hook.set(elem, val);
      }
      _$jscoverage['/base/style.js'].lineData[561]++;
      if (visit475_561_1(val !== undefined)) {
        _$jscoverage['/base/style.js'].lineData[563]++;
        try {
          _$jscoverage['/base/style.js'].lineData[565]++;
          elStyle[name] = val;
        }        catch (e) {
  _$jscoverage['/base/style.js'].lineData[567]++;
  logger.warn('css set error:' + e);
}
        _$jscoverage['/base/style.js'].lineData[570]++;
        if (visit476_570_1(visit477_570_2(val === EMPTY) && elStyle.removeAttribute)) {
          _$jscoverage['/base/style.js'].lineData[571]++;
          elStyle.removeAttribute(name);
        }
      }
      _$jscoverage['/base/style.js'].lineData[574]++;
      if (visit478_574_1(!elStyle.cssText)) {
        _$jscoverage['/base/style.js'].lineData[577]++;
        if (visit479_577_1(UA.webkit)) {
          _$jscoverage['/base/style.js'].lineData[578]++;
          elStyle = elem.outerHTML;
        }
        _$jscoverage['/base/style.js'].lineData[580]++;
        elem.removeAttribute('style');
      }
      _$jscoverage['/base/style.js'].lineData[582]++;
      return undefined;
    } else {
      _$jscoverage['/base/style.js'].lineData[585]++;
      if (visit480_585_1(!(visit481_585_2(hook && visit482_585_3('get' in hook && visit483_586_1((ret = hook.get(elem, false)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[588]++;
        ret = elStyle[name];
      }
      _$jscoverage['/base/style.js'].lineData[590]++;
      return visit484_590_1(ret === undefined) ? '' : ret;
    }
  }
  _$jscoverage['/base/style.js'].lineData[595]++;
  function getWHIgnoreDisplay(elem) {
    _$jscoverage['/base/style.js'].functionData[24]++;
    _$jscoverage['/base/style.js'].lineData[596]++;
    var val, args = arguments;
    _$jscoverage['/base/style.js'].lineData[599]++;
    if (visit485_599_1(elem.offsetWidth !== 0)) {
      _$jscoverage['/base/style.js'].lineData[600]++;
      val = getWH.apply(undefined, args);
    } else {
      _$jscoverage['/base/style.js'].lineData[602]++;
      swap(elem, cssShow, function() {
  _$jscoverage['/base/style.js'].functionData[25]++;
  _$jscoverage['/base/style.js'].lineData[603]++;
  val = getWH.apply(undefined, args);
});
    }
    _$jscoverage['/base/style.js'].lineData[606]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[609]++;
  function getPBMWidth(elem, props, which, computedStyle) {
    _$jscoverage['/base/style.js'].functionData[26]++;
    _$jscoverage['/base/style.js'].lineData[610]++;
    var value = 0, prop, j, i;
    _$jscoverage['/base/style.js'].lineData[611]++;
    for (j = 0; visit486_611_1(j < props.length); j++) {
      _$jscoverage['/base/style.js'].lineData[612]++;
      prop = props[j];
      _$jscoverage['/base/style.js'].lineData[613]++;
      if (visit487_613_1(prop)) {
        _$jscoverage['/base/style.js'].lineData[614]++;
        for (i = 0; visit488_614_1(i < which.length); i++) {
          _$jscoverage['/base/style.js'].lineData[615]++;
          var cssProp;
          _$jscoverage['/base/style.js'].lineData[616]++;
          if (visit489_616_1(prop === 'border')) {
            _$jscoverage['/base/style.js'].lineData[617]++;
            cssProp = prop + which[i] + 'Width';
          } else {
            _$jscoverage['/base/style.js'].lineData[619]++;
            cssProp = prop + which[i];
          }
          _$jscoverage['/base/style.js'].lineData[621]++;
          value += visit490_621_1(parseFloat(Dom._getComputedStyle(elem, cssProp, computedStyle)) || 0);
        }
      }
    }
    _$jscoverage['/base/style.js'].lineData[625]++;
    return value;
  }
  _$jscoverage['/base/style.js'].lineData[628]++;
  function isBorderBoxFn(elem, computedStyle) {
    _$jscoverage['/base/style.js'].functionData[27]++;
    _$jscoverage['/base/style.js'].lineData[629]++;
    return visit491_629_1(Dom._getComputedStyle(elem, 'boxSizing', computedStyle) === 'border-box');
  }
  _$jscoverage['/base/style.js'].lineData[632]++;
  function getComputedStyle(elem) {
    _$jscoverage['/base/style.js'].functionData[28]++;
    _$jscoverage['/base/style.js'].lineData[633]++;
    var doc = elem.ownerDocument, computedStyle;
    _$jscoverage['/base/style.js'].lineData[635]++;
    if (visit492_635_1(doc.defaultView)) {
      _$jscoverage['/base/style.js'].lineData[637]++;
      computedStyle = doc.defaultView.getComputedStyle(elem, null);
    }
    _$jscoverage['/base/style.js'].lineData[639]++;
    return computedStyle;
  }
  _$jscoverage['/base/style.js'].lineData[650]++;
  function getWH(elem, name, extra) {
    _$jscoverage['/base/style.js'].functionData[29]++;
    _$jscoverage['/base/style.js'].lineData[651]++;
    if (visit493_651_1(util.isWindow(elem))) {
      _$jscoverage['/base/style.js'].lineData[652]++;
      return visit494_652_1(name === WIDTH) ? Dom.viewportWidth(elem) : Dom.viewportHeight(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[653]++;
      if (visit495_653_1(elem.nodeType === 9)) {
        _$jscoverage['/base/style.js'].lineData[654]++;
        return visit496_654_1(name === WIDTH) ? Dom.docWidth(elem) : Dom.docHeight(elem);
      }
    }
    _$jscoverage['/base/style.js'].lineData[656]++;
    var which = visit497_656_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'], borderBoxValue = visit498_657_1(name === WIDTH) ? elem.offsetWidth : elem.offsetHeight;
    _$jscoverage['/base/style.js'].lineData[658]++;
    var computedStyle = getComputedStyle(elem);
    _$jscoverage['/base/style.js'].lineData[659]++;
    var isBorderBox = isBorderBoxFn(elem, computedStyle);
    _$jscoverage['/base/style.js'].lineData[660]++;
    var cssBoxValue = 0;
    _$jscoverage['/base/style.js'].lineData[661]++;
    if (visit499_661_1(visit500_661_2(borderBoxValue == null) || visit501_661_3(borderBoxValue <= 0))) {
      _$jscoverage['/base/style.js'].lineData[662]++;
      borderBoxValue = undefined;
      _$jscoverage['/base/style.js'].lineData[664]++;
      cssBoxValue = Dom._getComputedStyle(elem, name, computedStyle);
      _$jscoverage['/base/style.js'].lineData[665]++;
      if (visit502_665_1(visit503_665_2(cssBoxValue == null) || visit504_665_3((Number(cssBoxValue)) < 0))) {
        _$jscoverage['/base/style.js'].lineData[666]++;
        cssBoxValue = visit505_666_1(elem.style[name] || 0);
      }
      _$jscoverage['/base/style.js'].lineData[669]++;
      cssBoxValue = visit506_669_1(parseFloat(cssBoxValue) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[671]++;
    if (visit507_671_1(extra === undefined)) {
      _$jscoverage['/base/style.js'].lineData[672]++;
      extra = isBorderBox ? BORDER_INDEX : CONTENT_INDEX;
    }
    _$jscoverage['/base/style.js'].lineData[674]++;
    var borderBoxValueOrIsBorderBox = visit508_674_1(visit509_674_2(borderBoxValue !== undefined) || isBorderBox);
    _$jscoverage['/base/style.js'].lineData[675]++;
    var val = visit510_675_1(borderBoxValue || cssBoxValue);
    _$jscoverage['/base/style.js'].lineData[676]++;
    if (visit511_676_1(extra === CONTENT_INDEX)) {
      _$jscoverage['/base/style.js'].lineData[677]++;
      if (visit512_677_1(borderBoxValueOrIsBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[678]++;
        return val - getPBMWidth(elem, ['border', 'padding'], which, computedStyle);
      } else {
        _$jscoverage['/base/style.js'].lineData[681]++;
        return cssBoxValue;
      }
    } else {
      _$jscoverage['/base/style.js'].lineData[683]++;
      if (visit513_683_1(borderBoxValueOrIsBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[684]++;
        return val + (visit514_684_1(extra === BORDER_INDEX) ? 0 : (visit515_685_1(extra === PADDING_INDEX) ? -getPBMWidth(elem, ['border'], which, computedStyle) : getPBMWidth(elem, ['margin'], which, computedStyle)));
      } else {
        _$jscoverage['/base/style.js'].lineData[689]++;
        return cssBoxValue + getPBMWidth(elem, BOX_MODELS.slice(extra), which, computedStyle);
      }
    }
  }
  _$jscoverage['/base/style.js'].lineData[694]++;
  var ROOT_REG = /^(?:body|html)$/i;
  _$jscoverage['/base/style.js'].lineData[696]++;
  function getPosition(el) {
    _$jscoverage['/base/style.js'].functionData[30]++;
    _$jscoverage['/base/style.js'].lineData[697]++;
    var offsetParent, offset, parentOffset = {
  top: 0, 
  left: 0};
    _$jscoverage['/base/style.js'].lineData[701]++;
    if (visit516_701_1(Dom.css(el, 'position') === 'fixed')) {
      _$jscoverage['/base/style.js'].lineData[702]++;
      offset = el.getBoundingClientRect();
    } else {
      _$jscoverage['/base/style.js'].lineData[707]++;
      offsetParent = getOffsetParent(el);
      _$jscoverage['/base/style.js'].lineData[708]++;
      offset = Dom.offset(el);
      _$jscoverage['/base/style.js'].lineData[709]++;
      parentOffset = Dom.offset(offsetParent);
      _$jscoverage['/base/style.js'].lineData[710]++;
      parentOffset.top += visit517_710_1(parseFloat(Dom.css(offsetParent, 'borderTopWidth')) || 0);
      _$jscoverage['/base/style.js'].lineData[711]++;
      parentOffset.left += visit518_711_1(parseFloat(Dom.css(offsetParent, 'borderLeftWidth')) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[714]++;
    offset.top -= visit519_714_1(parseFloat(Dom.css(el, 'marginTop')) || 0);
    _$jscoverage['/base/style.js'].lineData[715]++;
    offset.left -= visit520_715_1(parseFloat(Dom.css(el, 'marginLeft')) || 0);
    _$jscoverage['/base/style.js'].lineData[719]++;
    return {
  top: offset.top - parentOffset.top, 
  left: offset.left - parentOffset.left};
  }
  _$jscoverage['/base/style.js'].lineData[725]++;
  function getOffsetParent(el) {
    _$jscoverage['/base/style.js'].functionData[31]++;
    _$jscoverage['/base/style.js'].lineData[726]++;
    var offsetParent = visit521_726_1(el.offsetParent || (visit522_726_2(el.ownerDocument || doc)).body);
    _$jscoverage['/base/style.js'].lineData[727]++;
    while (visit523_727_1(offsetParent && visit524_727_2(!ROOT_REG.test(offsetParent.nodeName) && visit525_728_1(Dom.css(offsetParent, 'position') === 'static')))) {
      _$jscoverage['/base/style.js'].lineData[729]++;
      offsetParent = offsetParent.offsetParent;
    }
    _$jscoverage['/base/style.js'].lineData[731]++;
    return offsetParent;
  }
  _$jscoverage['/base/style.js'].lineData[734]++;
  return Dom;
});
