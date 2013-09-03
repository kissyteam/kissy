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
  _$jscoverage['/base/style.js'].lineData[42] = 0;
  _$jscoverage['/base/style.js'].lineData[43] = 0;
  _$jscoverage['/base/style.js'].lineData[44] = 0;
  _$jscoverage['/base/style.js'].lineData[45] = 0;
  _$jscoverage['/base/style.js'].lineData[48] = 0;
  _$jscoverage['/base/style.js'].lineData[49] = 0;
  _$jscoverage['/base/style.js'].lineData[52] = 0;
  _$jscoverage['/base/style.js'].lineData[53] = 0;
  _$jscoverage['/base/style.js'].lineData[56] = 0;
  _$jscoverage['/base/style.js'].lineData[58] = 0;
  _$jscoverage['/base/style.js'].lineData[61] = 0;
  _$jscoverage['/base/style.js'].lineData[62] = 0;
  _$jscoverage['/base/style.js'].lineData[65] = 0;
  _$jscoverage['/base/style.js'].lineData[66] = 0;
  _$jscoverage['/base/style.js'].lineData[67] = 0;
  _$jscoverage['/base/style.js'].lineData[69] = 0;
  _$jscoverage['/base/style.js'].lineData[70] = 0;
  _$jscoverage['/base/style.js'].lineData[71] = 0;
  _$jscoverage['/base/style.js'].lineData[73] = 0;
  _$jscoverage['/base/style.js'].lineData[75] = 0;
  _$jscoverage['/base/style.js'].lineData[78] = 0;
  _$jscoverage['/base/style.js'].lineData[92] = 0;
  _$jscoverage['/base/style.js'].lineData[100] = 0;
  _$jscoverage['/base/style.js'].lineData[103] = 0;
  _$jscoverage['/base/style.js'].lineData[104] = 0;
  _$jscoverage['/base/style.js'].lineData[108] = 0;
  _$jscoverage['/base/style.js'].lineData[109] = 0;
  _$jscoverage['/base/style.js'].lineData[113] = 0;
  _$jscoverage['/base/style.js'].lineData[114] = 0;
  _$jscoverage['/base/style.js'].lineData[115] = 0;
  _$jscoverage['/base/style.js'].lineData[116] = 0;
  _$jscoverage['/base/style.js'].lineData[117] = 0;
  _$jscoverage['/base/style.js'].lineData[119] = 0;
  _$jscoverage['/base/style.js'].lineData[120] = 0;
  _$jscoverage['/base/style.js'].lineData[122] = 0;
  _$jscoverage['/base/style.js'].lineData[123] = 0;
  _$jscoverage['/base/style.js'].lineData[124] = 0;
  _$jscoverage['/base/style.js'].lineData[127] = 0;
  _$jscoverage['/base/style.js'].lineData[140] = 0;
  _$jscoverage['/base/style.js'].lineData[145] = 0;
  _$jscoverage['/base/style.js'].lineData[146] = 0;
  _$jscoverage['/base/style.js'].lineData[147] = 0;
  _$jscoverage['/base/style.js'].lineData[148] = 0;
  _$jscoverage['/base/style.js'].lineData[151] = 0;
  _$jscoverage['/base/style.js'].lineData[153] = 0;
  _$jscoverage['/base/style.js'].lineData[154] = 0;
  _$jscoverage['/base/style.js'].lineData[155] = 0;
  _$jscoverage['/base/style.js'].lineData[156] = 0;
  _$jscoverage['/base/style.js'].lineData[158] = 0;
  _$jscoverage['/base/style.js'].lineData[160] = 0;
  _$jscoverage['/base/style.js'].lineData[161] = 0;
  _$jscoverage['/base/style.js'].lineData[164] = 0;
  _$jscoverage['/base/style.js'].lineData[177] = 0;
  _$jscoverage['/base/style.js'].lineData[184] = 0;
  _$jscoverage['/base/style.js'].lineData[185] = 0;
  _$jscoverage['/base/style.js'].lineData[186] = 0;
  _$jscoverage['/base/style.js'].lineData[187] = 0;
  _$jscoverage['/base/style.js'].lineData[190] = 0;
  _$jscoverage['/base/style.js'].lineData[193] = 0;
  _$jscoverage['/base/style.js'].lineData[194] = 0;
  _$jscoverage['/base/style.js'].lineData[196] = 0;
  _$jscoverage['/base/style.js'].lineData[198] = 0;
  _$jscoverage['/base/style.js'].lineData[199] = 0;
  _$jscoverage['/base/style.js'].lineData[201] = 0;
  _$jscoverage['/base/style.js'].lineData[203] = 0;
  _$jscoverage['/base/style.js'].lineData[206] = 0;
  _$jscoverage['/base/style.js'].lineData[210] = 0;
  _$jscoverage['/base/style.js'].lineData[211] = 0;
  _$jscoverage['/base/style.js'].lineData[214] = 0;
  _$jscoverage['/base/style.js'].lineData[222] = 0;
  _$jscoverage['/base/style.js'].lineData[226] = 0;
  _$jscoverage['/base/style.js'].lineData[227] = 0;
  _$jscoverage['/base/style.js'].lineData[228] = 0;
  _$jscoverage['/base/style.js'].lineData[230] = 0;
  _$jscoverage['/base/style.js'].lineData[231] = 0;
  _$jscoverage['/base/style.js'].lineData[232] = 0;
  _$jscoverage['/base/style.js'].lineData[233] = 0;
  _$jscoverage['/base/style.js'].lineData[234] = 0;
  _$jscoverage['/base/style.js'].lineData[244] = 0;
  _$jscoverage['/base/style.js'].lineData[246] = 0;
  _$jscoverage['/base/style.js'].lineData[247] = 0;
  _$jscoverage['/base/style.js'].lineData[248] = 0;
  _$jscoverage['/base/style.js'].lineData[250] = 0;
  _$jscoverage['/base/style.js'].lineData[251] = 0;
  _$jscoverage['/base/style.js'].lineData[252] = 0;
  _$jscoverage['/base/style.js'].lineData[254] = 0;
  _$jscoverage['/base/style.js'].lineData[264] = 0;
  _$jscoverage['/base/style.js'].lineData[266] = 0;
  _$jscoverage['/base/style.js'].lineData[267] = 0;
  _$jscoverage['/base/style.js'].lineData[268] = 0;
  _$jscoverage['/base/style.js'].lineData[269] = 0;
  _$jscoverage['/base/style.js'].lineData[271] = 0;
  _$jscoverage['/base/style.js'].lineData[285] = 0;
  _$jscoverage['/base/style.js'].lineData[286] = 0;
  _$jscoverage['/base/style.js'].lineData[287] = 0;
  _$jscoverage['/base/style.js'].lineData[289] = 0;
  _$jscoverage['/base/style.js'].lineData[292] = 0;
  _$jscoverage['/base/style.js'].lineData[295] = 0;
  _$jscoverage['/base/style.js'].lineData[296] = 0;
  _$jscoverage['/base/style.js'].lineData[300] = 0;
  _$jscoverage['/base/style.js'].lineData[301] = 0;
  _$jscoverage['/base/style.js'].lineData[304] = 0;
  _$jscoverage['/base/style.js'].lineData[307] = 0;
  _$jscoverage['/base/style.js'].lineData[309] = 0;
  _$jscoverage['/base/style.js'].lineData[310] = 0;
  _$jscoverage['/base/style.js'].lineData[312] = 0;
  _$jscoverage['/base/style.js'].lineData[321] = 0;
  _$jscoverage['/base/style.js'].lineData[329] = 0;
  _$jscoverage['/base/style.js'].lineData[330] = 0;
  _$jscoverage['/base/style.js'].lineData[331] = 0;
  _$jscoverage['/base/style.js'].lineData[332] = 0;
  _$jscoverage['/base/style.js'].lineData[333] = 0;
  _$jscoverage['/base/style.js'].lineData[334] = 0;
  _$jscoverage['/base/style.js'].lineData[335] = 0;
  _$jscoverage['/base/style.js'].lineData[336] = 0;
  _$jscoverage['/base/style.js'].lineData[337] = 0;
  _$jscoverage['/base/style.js'].lineData[338] = 0;
  _$jscoverage['/base/style.js'].lineData[339] = 0;
  _$jscoverage['/base/style.js'].lineData[340] = 0;
  _$jscoverage['/base/style.js'].lineData[341] = 0;
  _$jscoverage['/base/style.js'].lineData[342] = 0;
  _$jscoverage['/base/style.js'].lineData[343] = 0;
  _$jscoverage['/base/style.js'].lineData[404] = 0;
  _$jscoverage['/base/style.js'].lineData[405] = 0;
  _$jscoverage['/base/style.js'].lineData[406] = 0;
  _$jscoverage['/base/style.js'].lineData[407] = 0;
  _$jscoverage['/base/style.js'].lineData[410] = 0;
  _$jscoverage['/base/style.js'].lineData[411] = 0;
  _$jscoverage['/base/style.js'].lineData[412] = 0;
  _$jscoverage['/base/style.js'].lineData[415] = 0;
  _$jscoverage['/base/style.js'].lineData[416] = 0;
  _$jscoverage['/base/style.js'].lineData[417] = 0;
  _$jscoverage['/base/style.js'].lineData[418] = 0;
  _$jscoverage['/base/style.js'].lineData[420] = 0;
  _$jscoverage['/base/style.js'].lineData[426] = 0;
  _$jscoverage['/base/style.js'].lineData[431] = 0;
  _$jscoverage['/base/style.js'].lineData[432] = 0;
  _$jscoverage['/base/style.js'].lineData[433] = 0;
  _$jscoverage['/base/style.js'].lineData[435] = 0;
  _$jscoverage['/base/style.js'].lineData[440] = 0;
  _$jscoverage['/base/style.js'].lineData[442] = 0;
  _$jscoverage['/base/style.js'].lineData[443] = 0;
  _$jscoverage['/base/style.js'].lineData[445] = 0;
  _$jscoverage['/base/style.js'].lineData[448] = 0;
  _$jscoverage['/base/style.js'].lineData[449] = 0;
  _$jscoverage['/base/style.js'].lineData[450] = 0;
  _$jscoverage['/base/style.js'].lineData[451] = 0;
  _$jscoverage['/base/style.js'].lineData[453] = 0;
  _$jscoverage['/base/style.js'].lineData[454] = 0;
  _$jscoverage['/base/style.js'].lineData[455] = 0;
  _$jscoverage['/base/style.js'].lineData[456] = 0;
  _$jscoverage['/base/style.js'].lineData[458] = 0;
  _$jscoverage['/base/style.js'].lineData[459] = 0;
  _$jscoverage['/base/style.js'].lineData[462] = 0;
  _$jscoverage['/base/style.js'].lineData[467] = 0;
  _$jscoverage['/base/style.js'].lineData[468] = 0;
  _$jscoverage['/base/style.js'].lineData[473] = 0;
  _$jscoverage['/base/style.js'].lineData[474] = 0;
  _$jscoverage['/base/style.js'].lineData[475] = 0;
  _$jscoverage['/base/style.js'].lineData[478] = 0;
  _$jscoverage['/base/style.js'].lineData[481] = 0;
  _$jscoverage['/base/style.js'].lineData[482] = 0;
  _$jscoverage['/base/style.js'].lineData[486] = 0;
  _$jscoverage['/base/style.js'].lineData[487] = 0;
  _$jscoverage['/base/style.js'].lineData[490] = 0;
  _$jscoverage['/base/style.js'].lineData[492] = 0;
  _$jscoverage['/base/style.js'].lineData[494] = 0;
  _$jscoverage['/base/style.js'].lineData[495] = 0;
  _$jscoverage['/base/style.js'].lineData[496] = 0;
  _$jscoverage['/base/style.js'].lineData[498] = 0;
  _$jscoverage['/base/style.js'].lineData[500] = 0;
  _$jscoverage['/base/style.js'].lineData[501] = 0;
  _$jscoverage['/base/style.js'].lineData[504] = 0;
  _$jscoverage['/base/style.js'].lineData[505] = 0;
  _$jscoverage['/base/style.js'].lineData[507] = 0;
  _$jscoverage['/base/style.js'].lineData[508] = 0;
  _$jscoverage['/base/style.js'].lineData[510] = 0;
  _$jscoverage['/base/style.js'].lineData[512] = 0;
  _$jscoverage['/base/style.js'].lineData[514] = 0;
  _$jscoverage['/base/style.js'].lineData[516] = 0;
  _$jscoverage['/base/style.js'].lineData[519] = 0;
  _$jscoverage['/base/style.js'].lineData[520] = 0;
  _$jscoverage['/base/style.js'].lineData[523] = 0;
  _$jscoverage['/base/style.js'].lineData[526] = 0;
  _$jscoverage['/base/style.js'].lineData[527] = 0;
  _$jscoverage['/base/style.js'].lineData[529] = 0;
  _$jscoverage['/base/style.js'].lineData[534] = 0;
  _$jscoverage['/base/style.js'].lineData[538] = 0;
  _$jscoverage['/base/style.js'].lineData[540] = 0;
  _$jscoverage['/base/style.js'].lineData[545] = 0;
  _$jscoverage['/base/style.js'].lineData[546] = 0;
  _$jscoverage['/base/style.js'].lineData[549] = 0;
  _$jscoverage['/base/style.js'].lineData[550] = 0;
  _$jscoverage['/base/style.js'].lineData[552] = 0;
  _$jscoverage['/base/style.js'].lineData[553] = 0;
  _$jscoverage['/base/style.js'].lineData[556] = 0;
  _$jscoverage['/base/style.js'].lineData[568] = 0;
  _$jscoverage['/base/style.js'].lineData[569] = 0;
  _$jscoverage['/base/style.js'].lineData[570] = 0;
  _$jscoverage['/base/style.js'].lineData[571] = 0;
  _$jscoverage['/base/style.js'].lineData[572] = 0;
  _$jscoverage['/base/style.js'].lineData[574] = 0;
  _$jscoverage['/base/style.js'].lineData[577] = 0;
  _$jscoverage['/base/style.js'].lineData[578] = 0;
  _$jscoverage['/base/style.js'].lineData[579] = 0;
  _$jscoverage['/base/style.js'].lineData[580] = 0;
  _$jscoverage['/base/style.js'].lineData[581] = 0;
  _$jscoverage['/base/style.js'].lineData[583] = 0;
  _$jscoverage['/base/style.js'].lineData[584] = 0;
  _$jscoverage['/base/style.js'].lineData[586] = 0;
  _$jscoverage['/base/style.js'].lineData[591] = 0;
  _$jscoverage['/base/style.js'].lineData[595] = 0;
  _$jscoverage['/base/style.js'].lineData[596] = 0;
  _$jscoverage['/base/style.js'].lineData[597] = 0;
  _$jscoverage['/base/style.js'].lineData[600] = 0;
  _$jscoverage['/base/style.js'].lineData[603] = 0;
  _$jscoverage['/base/style.js'].lineData[604] = 0;
  _$jscoverage['/base/style.js'].lineData[605] = 0;
  _$jscoverage['/base/style.js'].lineData[606] = 0;
  _$jscoverage['/base/style.js'].lineData[607] = 0;
  _$jscoverage['/base/style.js'].lineData[609] = 0;
  _$jscoverage['/base/style.js'].lineData[610] = 0;
  _$jscoverage['/base/style.js'].lineData[615] = 0;
  _$jscoverage['/base/style.js'].lineData[618] = 0;
  _$jscoverage['/base/style.js'].lineData[620] = 0;
  _$jscoverage['/base/style.js'].lineData[621] = 0;
  _$jscoverage['/base/style.js'].lineData[625] = 0;
  _$jscoverage['/base/style.js'].lineData[626] = 0;
  _$jscoverage['/base/style.js'].lineData[631] = 0;
  _$jscoverage['/base/style.js'].lineData[632] = 0;
  _$jscoverage['/base/style.js'].lineData[633] = 0;
  _$jscoverage['/base/style.js'].lineData[634] = 0;
  _$jscoverage['/base/style.js'].lineData[635] = 0;
  _$jscoverage['/base/style.js'].lineData[638] = 0;
  _$jscoverage['/base/style.js'].lineData[639] = 0;
  _$jscoverage['/base/style.js'].lineData[643] = 0;
  _$jscoverage['/base/style.js'].lineData[649] = 0;
  _$jscoverage['/base/style.js'].lineData[650] = 0;
  _$jscoverage['/base/style.js'].lineData[651] = 0;
  _$jscoverage['/base/style.js'].lineData[653] = 0;
  _$jscoverage['/base/style.js'].lineData[655] = 0;
  _$jscoverage['/base/style.js'].lineData[658] = 0;
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
}
if (! _$jscoverage['/base/style.js'].branchData) {
  _$jscoverage['/base/style.js'].branchData = {};
  _$jscoverage['/base/style.js'].branchData['42'] = [];
  _$jscoverage['/base/style.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['48'] = [];
  _$jscoverage['/base/style.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['65'] = [];
  _$jscoverage['/base/style.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['66'] = [];
  _$jscoverage['/base/style.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['100'] = [];
  _$jscoverage['/base/style.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['103'] = [];
  _$jscoverage['/base/style.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['104'] = [];
  _$jscoverage['/base/style.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['108'] = [];
  _$jscoverage['/base/style.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['108'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['113'] = [];
  _$jscoverage['/base/style.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['145'] = [];
  _$jscoverage['/base/style.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['147'] = [];
  _$jscoverage['/base/style.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['153'] = [];
  _$jscoverage['/base/style.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['155'] = [];
  _$jscoverage['/base/style.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['160'] = [];
  _$jscoverage['/base/style.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['184'] = [];
  _$jscoverage['/base/style.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['186'] = [];
  _$jscoverage['/base/style.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['196'] = [];
  _$jscoverage['/base/style.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['199'] = [];
  _$jscoverage['/base/style.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['201'] = [];
  _$jscoverage['/base/style.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['201'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['201'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['206'] = [];
  _$jscoverage['/base/style.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['210'] = [];
  _$jscoverage['/base/style.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['226'] = [];
  _$jscoverage['/base/style.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['228'] = [];
  _$jscoverage['/base/style.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['230'] = [];
  _$jscoverage['/base/style.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['246'] = [];
  _$jscoverage['/base/style.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['250'] = [];
  _$jscoverage['/base/style.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['251'] = [];
  _$jscoverage['/base/style.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['266'] = [];
  _$jscoverage['/base/style.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['268'] = [];
  _$jscoverage['/base/style.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['285'] = [];
  _$jscoverage['/base/style.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['295'] = [];
  _$jscoverage['/base/style.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['300'] = [];
  _$jscoverage['/base/style.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['309'] = [];
  _$jscoverage['/base/style.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['329'] = [];
  _$jscoverage['/base/style.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['333'] = [];
  _$jscoverage['/base/style.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['335'] = [];
  _$jscoverage['/base/style.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['337'] = [];
  _$jscoverage['/base/style.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['342'] = [];
  _$jscoverage['/base/style.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['407'] = [];
  _$jscoverage['/base/style.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['412'] = [];
  _$jscoverage['/base/style.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['417'] = [];
  _$jscoverage['/base/style.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['432'] = [];
  _$jscoverage['/base/style.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['448'] = [];
  _$jscoverage['/base/style.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['450'] = [];
  _$jscoverage['/base/style.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['454'] = [];
  _$jscoverage['/base/style.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['455'] = [];
  _$jscoverage['/base/style.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['455'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['458'] = [];
  _$jscoverage['/base/style.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['490'] = [];
  _$jscoverage['/base/style.js'].branchData['490'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['490'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['491'] = [];
  _$jscoverage['/base/style.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['491'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['496'] = [];
  _$jscoverage['/base/style.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['498'] = [];
  _$jscoverage['/base/style.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['500'] = [];
  _$jscoverage['/base/style.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['500'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['500'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['504'] = [];
  _$jscoverage['/base/style.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['507'] = [];
  _$jscoverage['/base/style.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['510'] = [];
  _$jscoverage['/base/style.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['519'] = [];
  _$jscoverage['/base/style.js'].branchData['519'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['519'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['523'] = [];
  _$jscoverage['/base/style.js'].branchData['523'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['526'] = [];
  _$jscoverage['/base/style.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['534'] = [];
  _$jscoverage['/base/style.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['534'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['534'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['540'] = [];
  _$jscoverage['/base/style.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['549'] = [];
  _$jscoverage['/base/style.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['569'] = [];
  _$jscoverage['/base/style.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['570'] = [];
  _$jscoverage['/base/style.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['571'] = [];
  _$jscoverage['/base/style.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['572'] = [];
  _$jscoverage['/base/style.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['574'] = [];
  _$jscoverage['/base/style.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['575'] = [];
  _$jscoverage['/base/style.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['577'] = [];
  _$jscoverage['/base/style.js'].branchData['577'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['578'] = [];
  _$jscoverage['/base/style.js'].branchData['578'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['580'] = [];
  _$jscoverage['/base/style.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['581'] = [];
  _$jscoverage['/base/style.js'].branchData['581'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['583'] = [];
  _$jscoverage['/base/style.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['584'] = [];
  _$jscoverage['/base/style.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['586'] = [];
  _$jscoverage['/base/style.js'].branchData['586'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['596'] = [];
  _$jscoverage['/base/style.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['596'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['596'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['597'] = [];
  _$jscoverage['/base/style.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['600'] = [];
  _$jscoverage['/base/style.js'].branchData['600'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['603'] = [];
  _$jscoverage['/base/style.js'].branchData['603'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['605'] = [];
  _$jscoverage['/base/style.js'].branchData['605'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['606'] = [];
  _$jscoverage['/base/style.js'].branchData['606'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['607'] = [];
  _$jscoverage['/base/style.js'].branchData['607'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['609'] = [];
  _$jscoverage['/base/style.js'].branchData['609'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['610'] = [];
  _$jscoverage['/base/style.js'].branchData['610'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['625'] = [];
  _$jscoverage['/base/style.js'].branchData['625'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['634'] = [];
  _$jscoverage['/base/style.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['635'] = [];
  _$jscoverage['/base/style.js'].branchData['635'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['638'] = [];
  _$jscoverage['/base/style.js'].branchData['638'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['639'] = [];
  _$jscoverage['/base/style.js'].branchData['639'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['650'] = [];
  _$jscoverage['/base/style.js'].branchData['650'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['650'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['651'] = [];
  _$jscoverage['/base/style.js'].branchData['651'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['651'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['652'] = [];
  _$jscoverage['/base/style.js'].branchData['652'][1] = new BranchData();
}
_$jscoverage['/base/style.js'].branchData['652'][1].init(53, 46, 'Dom.css(offsetParent, "position") === "static"');
function visit496_652_1(result) {
  _$jscoverage['/base/style.js'].branchData['652'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['651'][2].init(113, 100, '!ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, "position") === "static"');
function visit495_651_2(result) {
  _$jscoverage['/base/style.js'].branchData['651'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['651'][1].init(97, 116, 'offsetParent && !ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, "position") === "static"');
function visit494_651_1(result) {
  _$jscoverage['/base/style.js'].branchData['651'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['650'][2].init(50, 23, 'el.ownerDocument || doc');
function visit493_650_2(result) {
  _$jscoverage['/base/style.js'].branchData['650'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['650'][1].init(29, 50, 'el.offsetParent || (el.ownerDocument || doc).body');
function visit492_650_1(result) {
  _$jscoverage['/base/style.js'].branchData['650'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['639'][1].init(826, 42, 'parseFloat(Dom.css(el, "marginLeft")) || 0');
function visit491_639_1(result) {
  _$jscoverage['/base/style.js'].branchData['639'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['638'][1].init(759, 41, 'parseFloat(Dom.css(el, "marginTop")) || 0');
function visit490_638_1(result) {
  _$jscoverage['/base/style.js'].branchData['638'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['635'][1].init(446, 57, 'parseFloat(Dom.css(offsetParent, "borderLeftWidth")) || 0');
function visit489_635_1(result) {
  _$jscoverage['/base/style.js'].branchData['635'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['634'][1].init(354, 56, 'parseFloat(Dom.css(offsetParent, "borderTopWidth")) || 0');
function visit488_634_1(result) {
  _$jscoverage['/base/style.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['625'][1].init(113, 34, 'Dom.css(el, \'position\') == \'fixed\'');
function visit487_625_1(result) {
  _$jscoverage['/base/style.js'].branchData['625'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['610'][1].init(29, 41, 'parseFloat(Dom.css(elem, extra + w)) || 0');
function visit486_610_1(result) {
  _$jscoverage['/base/style.js'].branchData['610'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['609'][1].init(240, 18, 'extra === \'margin\'');
function visit485_609_1(result) {
  _$jscoverage['/base/style.js'].branchData['609'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['607'][1].init(29, 54, 'parseFloat(Dom.css(elem, \'border\' + w + \'Width\')) || 0');
function visit484_607_1(result) {
  _$jscoverage['/base/style.js'].branchData['607'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['606'][1].init(93, 19, 'extra !== \'padding\'');
function visit483_606_1(result) {
  _$jscoverage['/base/style.js'].branchData['606'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['605'][1].init(25, 45, 'parseFloat(Dom.css(elem, \'padding\' + w)) || 0');
function visit482_605_1(result) {
  _$jscoverage['/base/style.js'].branchData['605'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['603'][1].init(1359, 5, 'extra');
function visit481_603_1(result) {
  _$jscoverage['/base/style.js'].branchData['603'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['600'][1].init(1282, 20, 'parseFloat(val) || 0');
function visit480_600_1(result) {
  _$jscoverage['/base/style.js'].branchData['600'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['597'][1].init(20, 23, 'elem.style[name] || 0');
function visit479_597_1(result) {
  _$jscoverage['/base/style.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['596'][3].init(1138, 16, '(Number(val)) < 0');
function visit478_596_3(result) {
  _$jscoverage['/base/style.js'].branchData['596'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['596'][2].init(1122, 11, 'val == null');
function visit477_596_2(result) {
  _$jscoverage['/base/style.js'].branchData['596'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['596'][1].init(1122, 32, 'val == null || (Number(val)) < 0');
function visit476_596_1(result) {
  _$jscoverage['/base/style.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['586'][1].init(33, 54, 'parseFloat(Dom.css(elem, \'border\' + w + \'Width\')) || 0');
function visit475_586_1(result) {
  _$jscoverage['/base/style.js'].branchData['586'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['584'][1].init(33, 41, 'parseFloat(Dom.css(elem, extra + w)) || 0');
function visit474_584_1(result) {
  _$jscoverage['/base/style.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['583'][1].init(163, 18, 'extra === \'margin\'');
function visit473_583_1(result) {
  _$jscoverage['/base/style.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['581'][1].init(33, 45, 'parseFloat(Dom.css(elem, \'padding\' + w)) || 0');
function visit472_581_1(result) {
  _$jscoverage['/base/style.js'].branchData['581'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['580'][1].init(26, 6, '!extra');
function visit471_580_1(result) {
  _$jscoverage['/base/style.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['578'][1].init(18, 18, 'extra !== \'border\'');
function visit470_578_1(result) {
  _$jscoverage['/base/style.js'].branchData['578'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['577'][1].init(419, 7, 'val > 0');
function visit469_577_1(result) {
  _$jscoverage['/base/style.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['575'][1].init(86, 14, 'name === WIDTH');
function visit468_575_1(result) {
  _$jscoverage['/base/style.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['574'][1].init(274, 14, 'name === WIDTH');
function visit467_574_1(result) {
  _$jscoverage['/base/style.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['572'][1].init(21, 13, 'name == WIDTH');
function visit466_572_1(result) {
  _$jscoverage['/base/style.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['571'][1].init(143, 18, 'elem.nodeType == 9');
function visit465_571_1(result) {
  _$jscoverage['/base/style.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['570'][1].init(21, 13, 'name == WIDTH');
function visit464_570_1(result) {
  _$jscoverage['/base/style.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['569'][1].init(14, 16, 'S.isWindow(elem)');
function visit463_569_1(result) {
  _$jscoverage['/base/style.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['549'][1].init(128, 22, 'elem.offsetWidth !== 0');
function visit462_549_1(result) {
  _$jscoverage['/base/style.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['540'][1].init(335, 17, 'ret === undefined');
function visit461_540_1(result) {
  _$jscoverage['/base/style.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['534'][3].init(121, 42, '(ret = hook.get(elem, false)) !== undefined');
function visit460_534_3(result) {
  _$jscoverage['/base/style.js'].branchData['534'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['534'][2].init(103, 60, '\'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit459_534_2(result) {
  _$jscoverage['/base/style.js'].branchData['534'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['534'][1].init(95, 68, 'hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit458_534_1(result) {
  _$jscoverage['/base/style.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['526'][1].init(136, 37, 'UA.webkit && (style = elem.outerHTML)');
function visit457_526_1(result) {
  _$jscoverage['/base/style.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['523'][1].init(871, 14, '!style.cssText');
function visit456_523_1(result) {
  _$jscoverage['/base/style.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['519'][2].init(303, 13, 'val === EMPTY');
function visit455_519_2(result) {
  _$jscoverage['/base/style.js'].branchData['519'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['519'][1].init(303, 38, 'val === EMPTY && style.removeAttribute');
function visit454_519_1(result) {
  _$jscoverage['/base/style.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['510'][1].init(405, 17, 'val !== undefined');
function visit453_510_1(result) {
  _$jscoverage['/base/style.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['507'][1].init(309, 16, 'hook && hook.set');
function visit452_507_1(result) {
  _$jscoverage['/base/style.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['504'][1].init(197, 39, '!isNaN(Number(val)) && !cssNumber[name]');
function visit451_504_1(result) {
  _$jscoverage['/base/style.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['500'][3].init(66, 13, 'val === EMPTY');
function visit450_500_3(result) {
  _$jscoverage['/base/style.js'].branchData['500'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['500'][2].init(50, 12, 'val === null');
function visit449_500_2(result) {
  _$jscoverage['/base/style.js'].branchData['500'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['500'][1].init(50, 29, 'val === null || val === EMPTY');
function visit448_500_1(result) {
  _$jscoverage['/base/style.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['498'][1].init(334, 17, 'val !== undefined');
function visit447_498_1(result) {
  _$jscoverage['/base/style.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['496'][1].init(278, 22, 'cssProps[name] || name');
function visit446_496_1(result) {
  _$jscoverage['/base/style.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['491'][2].init(109, 19, 'elem.nodeType === 8');
function visit445_491_2(result) {
  _$jscoverage['/base/style.js'].branchData['491'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['491'][1].init(35, 44, 'elem.nodeType === 8 || !(style = elem.style)');
function visit444_491_1(result) {
  _$jscoverage['/base/style.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['490'][2].init(71, 19, 'elem.nodeType === 3');
function visit443_490_2(result) {
  _$jscoverage['/base/style.js'].branchData['490'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['490'][1].init(71, 80, 'elem.nodeType === 3 || elem.nodeType === 8 || !(style = elem.style)');
function visit442_490_1(result) {
  _$jscoverage['/base/style.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['458'][1].init(442, 37, 'isAutoPosition || NO_PX_REG.test(val)');
function visit441_458_1(result) {
  _$jscoverage['/base/style.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['455'][2].init(328, 23, 'position === "relative"');
function visit440_455_2(result) {
  _$jscoverage['/base/style.js'].branchData['455'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['455'][1].init(310, 41, 'isAutoPosition && position === "relative"');
function visit439_455_1(result) {
  _$jscoverage['/base/style.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['454'][1].init(269, 14, 'val === "auto"');
function visit438_454_1(result) {
  _$jscoverage['/base/style.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['450'][1].init(83, 21, 'position === "static"');
function visit437_450_1(result) {
  _$jscoverage['/base/style.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['448'][1].init(116, 8, 'computed');
function visit436_448_1(result) {
  _$jscoverage['/base/style.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['432'][1].init(48, 8, 'computed');
function visit435_432_1(result) {
  _$jscoverage['/base/style.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['417'][1].init(71, 3, 'ret');
function visit434_417_1(result) {
  _$jscoverage['/base/style.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['412'][1].init(62, 71, 'el && getWHIgnoreDisplay(el, name, includeMargin ? \'margin\' : \'border\')');
function visit433_412_1(result) {
  _$jscoverage['/base/style.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['407'][1].init(62, 45, 'el && getWHIgnoreDisplay(el, name, \'padding\')');
function visit432_407_1(result) {
  _$jscoverage['/base/style.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['342'][1].init(34, 36, '!S.inArray(getNodeName(e), excludes)');
function visit431_342_1(result) {
  _$jscoverage['/base/style.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['337'][1].init(371, 23, 'UA[\'ie\'] || UA[\'opera\']');
function visit430_337_1(result) {
  _$jscoverage['/base/style.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['335'][1].init(261, 12, 'UA[\'webkit\']');
function visit429_335_1(result) {
  _$jscoverage['/base/style.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['333'][1].init(155, 11, 'UA[\'gecko\']');
function visit428_333_1(result) {
  _$jscoverage['/base/style.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['329'][1].init(281, 6, 'j >= 0');
function visit427_329_1(result) {
  _$jscoverage['/base/style.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['309'][1].init(764, 15, 'elem.styleSheet');
function visit426_309_1(result) {
  _$jscoverage['/base/style.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['300'][1].init(498, 4, 'elem');
function visit425_300_1(result) {
  _$jscoverage['/base/style.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['295'][1].init(333, 35, 'id && (id = id.replace(\'#\', EMPTY))');
function visit424_295_1(result) {
  _$jscoverage['/base/style.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['285'][1].init(22, 25, 'typeof refWin == \'string\'');
function visit423_285_1(result) {
  _$jscoverage['/base/style.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['268'][1].init(62, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit422_268_1(result) {
  _$jscoverage['/base/style.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['266'][1].init(121, 6, 'i >= 0');
function visit421_266_1(result) {
  _$jscoverage['/base/style.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['251'][1].init(30, 3, 'old');
function visit420_251_1(result) {
  _$jscoverage['/base/style.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['250'][1].init(154, 12, 'old !== NONE');
function visit419_250_1(result) {
  _$jscoverage['/base/style.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['246'][1].init(121, 6, 'i >= 0');
function visit418_246_1(result) {
  _$jscoverage['/base/style.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['230'][1].init(205, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit417_230_1(result) {
  _$jscoverage['/base/style.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['228'][1].init(80, 36, 'Dom.data(elem, OLD_DISPLAY) || EMPTY');
function visit416_228_1(result) {
  _$jscoverage['/base/style.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['226'][1].init(177, 6, 'i >= 0');
function visit415_226_1(result) {
  _$jscoverage['/base/style.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['210'][1].init(47, 6, 'i >= 0');
function visit414_210_1(result) {
  _$jscoverage['/base/style.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['206'][1].init(493, 25, 'typeof ret == \'undefined\'');
function visit413_206_1(result) {
  _$jscoverage['/base/style.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['201'][3].init(141, 41, '(ret = hook.get(elem, true)) !== undefined');
function visit412_201_3(result) {
  _$jscoverage['/base/style.js'].branchData['201'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['201'][2].init(123, 59, '\'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit411_201_2(result) {
  _$jscoverage['/base/style.js'].branchData['201'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['201'][1].init(115, 67, 'hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit410_201_1(result) {
  _$jscoverage['/base/style.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['199'][1].init(117, 4, 'elem');
function visit409_199_1(result) {
  _$jscoverage['/base/style.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['196'][1].init(665, 17, 'val === undefined');
function visit408_196_1(result) {
  _$jscoverage['/base/style.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['186'][1].init(51, 6, 'i >= 0');
function visit407_186_1(result) {
  _$jscoverage['/base/style.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['184'][1].init(241, 21, 'S.isPlainObject(name)');
function visit406_184_1(result) {
  _$jscoverage['/base/style.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['160'][1].init(47, 6, 'i >= 0');
function visit405_160_1(result) {
  _$jscoverage['/base/style.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['155'][1].init(57, 4, 'elem');
function visit404_155_1(result) {
  _$jscoverage['/base/style.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['153'][1].init(507, 17, 'val === undefined');
function visit403_153_1(result) {
  _$jscoverage['/base/style.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['147'][1].init(51, 6, 'i >= 0');
function visit402_147_1(result) {
  _$jscoverage['/base/style.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['145'][1].init(193, 21, 'S.isPlainObject(name)');
function visit401_145_1(result) {
  _$jscoverage['/base/style.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['113'][1].init(790, 51, 'Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)');
function visit400_113_1(result) {
  _$jscoverage['/base/style.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['108'][2].init(602, 10, 'val === \'\'');
function visit399_108_2(result) {
  _$jscoverage['/base/style.js'].branchData['108'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['108'][1].init(602, 36, 'val === \'\' && !Dom.contains(d, elem)');
function visit398_108_1(result) {
  _$jscoverage['/base/style.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['104'][1].init(28, 59, 'computedStyle.getPropertyValue(name) || computedStyle[name]');
function visit397_104_1(result) {
  _$jscoverage['/base/style.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['103'][1].init(369, 58, 'computedStyle = d.defaultView.getComputedStyle(elem, null)');
function visit396_103_1(result) {
  _$jscoverage['/base/style.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['100'][1].init(257, 22, 'cssProps[name] || name');
function visit395_100_1(result) {
  _$jscoverage['/base/style.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['66'][1].init(21, 31, 'doc.body || doc.documentElement');
function visit394_66_1(result) {
  _$jscoverage['/base/style.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['65'][1].init(105, 26, '!defaultDisplay[tagName]');
function visit393_65_1(result) {
  _$jscoverage['/base/style.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['48'][1].init(1144, 32, 'Features.isTransitionSupported()');
function visit392_48_1(result) {
  _$jscoverage['/base/style.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['42'][1].init(934, 31, 'Features.isTransformSupported()');
function visit391_42_1(result) {
  _$jscoverage['/base/style.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].lineData[6]++;
KISSY.add('dom/base/style', function(S, Dom, undefined) {
  _$jscoverage['/base/style.js'].functionData[0]++;
  _$jscoverage['/base/style.js'].lineData[7]++;
  var WINDOW = S.Env.host, UA = S.UA, Features = S.Features, getNodeName = Dom.nodeName, doc = WINDOW.document, RE_MARGIN = /^margin/, WIDTH = 'width', HEIGHT = 'height', DISPLAY = 'display', OLD_DISPLAY = DISPLAY + S.now(), NONE = 'none', cssNumber = {
  'fillOpacity': 1, 
  'fontWeight': 1, 
  'lineHeight': 1, 
  'opacity': 1, 
  'orphans': 1, 
  'widows': 1, 
  'zIndex': 1, 
  'zoom': 1}, rmsPrefix = /^-ms-/, EMPTY = '', DEFAULT_UNIT = 'px', NO_PX_REG = /\d(?!px)[a-z%]+$/i, cssHooks = {}, cssProps = {
  'float': 'cssFloat'}, defaultDisplay = {}, RE_DASH = /-([a-z])/ig;
  _$jscoverage['/base/style.js'].lineData[42]++;
  if (visit391_42_1(Features.isTransformSupported())) {
    _$jscoverage['/base/style.js'].lineData[43]++;
    var transform;
    _$jscoverage['/base/style.js'].lineData[44]++;
    transform = cssProps.transform = Features.getTransformProperty();
    _$jscoverage['/base/style.js'].lineData[45]++;
    cssProps.transformOrigin = transform + 'Origin';
  }
  _$jscoverage['/base/style.js'].lineData[48]++;
  if (visit392_48_1(Features.isTransitionSupported())) {
    _$jscoverage['/base/style.js'].lineData[49]++;
    cssProps.transition = Features.getTransitionProperty();
  }
  _$jscoverage['/base/style.js'].lineData[52]++;
  function upperCase() {
    _$jscoverage['/base/style.js'].functionData[1]++;
    _$jscoverage['/base/style.js'].lineData[53]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/base/style.js'].lineData[56]++;
  function camelCase(name) {
    _$jscoverage['/base/style.js'].functionData[2]++;
    _$jscoverage['/base/style.js'].lineData[58]++;
    return name.replace(rmsPrefix, 'ms-').replace(RE_DASH, upperCase);
  }
  _$jscoverage['/base/style.js'].lineData[61]++;
  function getDefaultDisplay(tagName) {
    _$jscoverage['/base/style.js'].functionData[3]++;
    _$jscoverage['/base/style.js'].lineData[62]++;
    var body, oldDisplay = defaultDisplay[tagName], elem;
    _$jscoverage['/base/style.js'].lineData[65]++;
    if (visit393_65_1(!defaultDisplay[tagName])) {
      _$jscoverage['/base/style.js'].lineData[66]++;
      body = visit394_66_1(doc.body || doc.documentElement);
      _$jscoverage['/base/style.js'].lineData[67]++;
      elem = doc.createElement(tagName);
      _$jscoverage['/base/style.js'].lineData[69]++;
      Dom.prepend(elem, body);
      _$jscoverage['/base/style.js'].lineData[70]++;
      oldDisplay = Dom.css(elem, 'display');
      _$jscoverage['/base/style.js'].lineData[71]++;
      body.removeChild(elem);
      _$jscoverage['/base/style.js'].lineData[73]++;
      defaultDisplay[tagName] = oldDisplay;
    }
    _$jscoverage['/base/style.js'].lineData[75]++;
    return oldDisplay;
  }
  _$jscoverage['/base/style.js'].lineData[78]++;
  S.mix(Dom, {
  _camelCase: camelCase, 
  _cssHooks: cssHooks, 
  _cssProps: cssProps, 
  _getComputedStyle: function(elem, name) {
  _$jscoverage['/base/style.js'].functionData[4]++;
  _$jscoverage['/base/style.js'].lineData[92]++;
  var val = '', computedStyle, width, minWidth, maxWidth, style, d = elem.ownerDocument;
  _$jscoverage['/base/style.js'].lineData[100]++;
  name = visit395_100_1(cssProps[name] || name);
  _$jscoverage['/base/style.js'].lineData[103]++;
  if (visit396_103_1(computedStyle = d.defaultView.getComputedStyle(elem, null))) {
    _$jscoverage['/base/style.js'].lineData[104]++;
    val = visit397_104_1(computedStyle.getPropertyValue(name) || computedStyle[name]);
  }
  _$jscoverage['/base/style.js'].lineData[108]++;
  if (visit398_108_1(visit399_108_2(val === '') && !Dom.contains(d, elem))) {
    _$jscoverage['/base/style.js'].lineData[109]++;
    val = elem.style[name];
  }
  _$jscoverage['/base/style.js'].lineData[113]++;
  if (visit400_113_1(Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name))) {
    _$jscoverage['/base/style.js'].lineData[114]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[115]++;
    width = style.width;
    _$jscoverage['/base/style.js'].lineData[116]++;
    minWidth = style.minWidth;
    _$jscoverage['/base/style.js'].lineData[117]++;
    maxWidth = style.maxWidth;
    _$jscoverage['/base/style.js'].lineData[119]++;
    style.minWidth = style.maxWidth = style.width = val;
    _$jscoverage['/base/style.js'].lineData[120]++;
    val = computedStyle.width;
    _$jscoverage['/base/style.js'].lineData[122]++;
    style.width = width;
    _$jscoverage['/base/style.js'].lineData[123]++;
    style.minWidth = minWidth;
    _$jscoverage['/base/style.js'].lineData[124]++;
    style.maxWidth = maxWidth;
  }
  _$jscoverage['/base/style.js'].lineData[127]++;
  return val;
}, 
  style: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[5]++;
  _$jscoverage['/base/style.js'].lineData[140]++;
  var els = Dom.query(selector), k, ret, elem = els[0], i;
  _$jscoverage['/base/style.js'].lineData[145]++;
  if (visit401_145_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[146]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[147]++;
      for (i = els.length - 1; visit402_147_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[148]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[151]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[153]++;
  if (visit403_153_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[154]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[155]++;
    if (visit404_155_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[156]++;
      ret = style(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[158]++;
    return ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[160]++;
    for (i = els.length - 1; visit405_160_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[161]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[164]++;
  return undefined;
}, 
  css: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[6]++;
  _$jscoverage['/base/style.js'].lineData[177]++;
  var els = Dom.query(selector), elem = els[0], k, hook, ret, i;
  _$jscoverage['/base/style.js'].lineData[184]++;
  if (visit406_184_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[185]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[186]++;
      for (i = els.length - 1; visit407_186_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[187]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[190]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[193]++;
  name = camelCase(name);
  _$jscoverage['/base/style.js'].lineData[194]++;
  hook = cssHooks[name];
  _$jscoverage['/base/style.js'].lineData[196]++;
  if (visit408_196_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[198]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[199]++;
    if (visit409_199_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[201]++;
      if (visit410_201_1(hook && visit411_201_2('get' in hook && visit412_201_3((ret = hook.get(elem, true)) !== undefined)))) {
      } else {
        _$jscoverage['/base/style.js'].lineData[203]++;
        ret = Dom._getComputedStyle(elem, name);
      }
    }
    _$jscoverage['/base/style.js'].lineData[206]++;
    return (visit413_206_1(typeof ret == 'undefined')) ? '' : ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[210]++;
    for (i = els.length - 1; visit414_210_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[211]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[214]++;
  return undefined;
}, 
  show: function(selector) {
  _$jscoverage['/base/style.js'].functionData[7]++;
  _$jscoverage['/base/style.js'].lineData[222]++;
  var els = Dom.query(selector), tagName, old, elem, i;
  _$jscoverage['/base/style.js'].lineData[226]++;
  for (i = els.length - 1; visit415_226_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[227]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[228]++;
    elem.style[DISPLAY] = visit416_228_1(Dom.data(elem, OLD_DISPLAY) || EMPTY);
    _$jscoverage['/base/style.js'].lineData[230]++;
    if (visit417_230_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[231]++;
      tagName = elem.tagName.toLowerCase();
      _$jscoverage['/base/style.js'].lineData[232]++;
      old = getDefaultDisplay(tagName);
      _$jscoverage['/base/style.js'].lineData[233]++;
      Dom.data(elem, OLD_DISPLAY, old);
      _$jscoverage['/base/style.js'].lineData[234]++;
      elem.style[DISPLAY] = old;
    }
  }
}, 
  hide: function(selector) {
  _$jscoverage['/base/style.js'].functionData[8]++;
  _$jscoverage['/base/style.js'].lineData[244]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[246]++;
  for (i = els.length - 1; visit418_246_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[247]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[248]++;
    var style = elem.style, old = style[DISPLAY];
    _$jscoverage['/base/style.js'].lineData[250]++;
    if (visit419_250_1(old !== NONE)) {
      _$jscoverage['/base/style.js'].lineData[251]++;
      if (visit420_251_1(old)) {
        _$jscoverage['/base/style.js'].lineData[252]++;
        Dom.data(elem, OLD_DISPLAY, old);
      }
      _$jscoverage['/base/style.js'].lineData[254]++;
      style[DISPLAY] = NONE;
    }
  }
}, 
  toggle: function(selector) {
  _$jscoverage['/base/style.js'].functionData[9]++;
  _$jscoverage['/base/style.js'].lineData[264]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[266]++;
  for (i = els.length - 1; visit421_266_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[267]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[268]++;
    if (visit422_268_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[269]++;
      Dom.show(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[271]++;
      Dom.hide(elem);
    }
  }
}, 
  addStyleSheet: function(refWin, cssText, id) {
  _$jscoverage['/base/style.js'].functionData[10]++;
  _$jscoverage['/base/style.js'].lineData[285]++;
  if (visit423_285_1(typeof refWin == 'string')) {
    _$jscoverage['/base/style.js'].lineData[286]++;
    id = cssText;
    _$jscoverage['/base/style.js'].lineData[287]++;
    cssText = refWin;
    _$jscoverage['/base/style.js'].lineData[289]++;
    refWin = WINDOW;
  }
  _$jscoverage['/base/style.js'].lineData[292]++;
  var doc = Dom.getDocument(refWin), elem;
  _$jscoverage['/base/style.js'].lineData[295]++;
  if (visit424_295_1(id && (id = id.replace('#', EMPTY)))) {
    _$jscoverage['/base/style.js'].lineData[296]++;
    elem = Dom.get('#' + id, doc);
  }
  _$jscoverage['/base/style.js'].lineData[300]++;
  if (visit425_300_1(elem)) {
    _$jscoverage['/base/style.js'].lineData[301]++;
    return;
  }
  _$jscoverage['/base/style.js'].lineData[304]++;
  elem = Dom.create('<style>', {
  id: id}, doc);
  _$jscoverage['/base/style.js'].lineData[307]++;
  Dom.get('head', doc).appendChild(elem);
  _$jscoverage['/base/style.js'].lineData[309]++;
  if (visit426_309_1(elem.styleSheet)) {
    _$jscoverage['/base/style.js'].lineData[310]++;
    elem.styleSheet.cssText = cssText;
  } else {
    _$jscoverage['/base/style.js'].lineData[312]++;
    elem.appendChild(doc.createTextNode(cssText));
  }
}, 
  unselectable: function(selector) {
  _$jscoverage['/base/style.js'].functionData[11]++;
  _$jscoverage['/base/style.js'].lineData[321]++;
  var _els = Dom.query(selector), elem, j, e, i = 0, excludes, style, els;
  _$jscoverage['/base/style.js'].lineData[329]++;
  for (j = _els.length - 1; visit427_329_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[330]++;
    elem = _els[j];
    _$jscoverage['/base/style.js'].lineData[331]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[332]++;
    style['UserSelect'] = 'none';
    _$jscoverage['/base/style.js'].lineData[333]++;
    if (visit428_333_1(UA['gecko'])) {
      _$jscoverage['/base/style.js'].lineData[334]++;
      style['MozUserSelect'] = 'none';
    } else {
      _$jscoverage['/base/style.js'].lineData[335]++;
      if (visit429_335_1(UA['webkit'])) {
        _$jscoverage['/base/style.js'].lineData[336]++;
        style['WebkitUserSelect'] = 'none';
      } else {
        _$jscoverage['/base/style.js'].lineData[337]++;
        if (visit430_337_1(UA['ie'] || UA['opera'])) {
          _$jscoverage['/base/style.js'].lineData[338]++;
          els = elem.getElementsByTagName('*');
          _$jscoverage['/base/style.js'].lineData[339]++;
          elem.setAttribute('unselectable', 'on');
          _$jscoverage['/base/style.js'].lineData[340]++;
          excludes = ['iframe', 'textarea', 'input', 'select'];
          _$jscoverage['/base/style.js'].lineData[341]++;
          while (e = els[i++]) {
            _$jscoverage['/base/style.js'].lineData[342]++;
            if (visit431_342_1(!S.inArray(getNodeName(e), excludes))) {
              _$jscoverage['/base/style.js'].lineData[343]++;
              e.setAttribute('unselectable', 'on');
            }
          }
        }
      }
    }
  }
}, 
  innerWidth: 0, 
  innerHeight: 0, 
  outerWidth: 0, 
  outerHeight: 0, 
  width: 0, 
  height: 0});
  _$jscoverage['/base/style.js'].lineData[404]++;
  S.each([WIDTH, HEIGHT], function(name) {
  _$jscoverage['/base/style.js'].functionData[12]++;
  _$jscoverage['/base/style.js'].lineData[405]++;
  Dom['inner' + S.ucfirst(name)] = function(selector) {
  _$jscoverage['/base/style.js'].functionData[13]++;
  _$jscoverage['/base/style.js'].lineData[406]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[407]++;
  return visit432_407_1(el && getWHIgnoreDisplay(el, name, 'padding'));
};
  _$jscoverage['/base/style.js'].lineData[410]++;
  Dom['outer' + S.ucfirst(name)] = function(selector, includeMargin) {
  _$jscoverage['/base/style.js'].functionData[14]++;
  _$jscoverage['/base/style.js'].lineData[411]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[412]++;
  return visit433_412_1(el && getWHIgnoreDisplay(el, name, includeMargin ? 'margin' : 'border'));
};
  _$jscoverage['/base/style.js'].lineData[415]++;
  Dom[name] = function(selector, val) {
  _$jscoverage['/base/style.js'].functionData[15]++;
  _$jscoverage['/base/style.js'].lineData[416]++;
  var ret = Dom.css(selector, name, val);
  _$jscoverage['/base/style.js'].lineData[417]++;
  if (visit434_417_1(ret)) {
    _$jscoverage['/base/style.js'].lineData[418]++;
    ret = parseFloat(ret);
  }
  _$jscoverage['/base/style.js'].lineData[420]++;
  return ret;
};
  _$jscoverage['/base/style.js'].lineData[426]++;
  cssHooks[name] = {
  get: function(elem, computed) {
  _$jscoverage['/base/style.js'].functionData[16]++;
  _$jscoverage['/base/style.js'].lineData[431]++;
  var val;
  _$jscoverage['/base/style.js'].lineData[432]++;
  if (visit435_432_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[433]++;
    val = getWHIgnoreDisplay(elem, name) + 'px';
  }
  _$jscoverage['/base/style.js'].lineData[435]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[440]++;
  var cssShow = {
  position: 'absolute', 
  visibility: 'hidden', 
  display: 'block'};
  _$jscoverage['/base/style.js'].lineData[442]++;
  S.each(['left', 'top'], function(name) {
  _$jscoverage['/base/style.js'].functionData[17]++;
  _$jscoverage['/base/style.js'].lineData[443]++;
  cssHooks[name] = {
  get: function(el, computed) {
  _$jscoverage['/base/style.js'].functionData[18]++;
  _$jscoverage['/base/style.js'].lineData[445]++;
  var val, isAutoPosition, position;
  _$jscoverage['/base/style.js'].lineData[448]++;
  if (visit436_448_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[449]++;
    position = Dom.css(el, 'position');
    _$jscoverage['/base/style.js'].lineData[450]++;
    if (visit437_450_1(position === "static")) {
      _$jscoverage['/base/style.js'].lineData[451]++;
      return "auto";
    }
    _$jscoverage['/base/style.js'].lineData[453]++;
    val = Dom._getComputedStyle(el, name);
    _$jscoverage['/base/style.js'].lineData[454]++;
    isAutoPosition = visit438_454_1(val === "auto");
    _$jscoverage['/base/style.js'].lineData[455]++;
    if (visit439_455_1(isAutoPosition && visit440_455_2(position === "relative"))) {
      _$jscoverage['/base/style.js'].lineData[456]++;
      return "0px";
    }
    _$jscoverage['/base/style.js'].lineData[458]++;
    if (visit441_458_1(isAutoPosition || NO_PX_REG.test(val))) {
      _$jscoverage['/base/style.js'].lineData[459]++;
      val = getPosition(el)[name] + 'px';
    }
  }
  _$jscoverage['/base/style.js'].lineData[462]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[467]++;
  function swap(elem, options, callback) {
    _$jscoverage['/base/style.js'].functionData[19]++;
    _$jscoverage['/base/style.js'].lineData[468]++;
    var old = {}, style = elem.style, name;
    _$jscoverage['/base/style.js'].lineData[473]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[474]++;
      old[name] = style[name];
      _$jscoverage['/base/style.js'].lineData[475]++;
      style[name] = options[name];
    }
    _$jscoverage['/base/style.js'].lineData[478]++;
    callback.call(elem);
    _$jscoverage['/base/style.js'].lineData[481]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[482]++;
      style[name] = old[name];
    }
  }
  _$jscoverage['/base/style.js'].lineData[486]++;
  function style(elem, name, val) {
    _$jscoverage['/base/style.js'].functionData[20]++;
    _$jscoverage['/base/style.js'].lineData[487]++;
    var style, ret, hook;
    _$jscoverage['/base/style.js'].lineData[490]++;
    if (visit442_490_1(visit443_490_2(elem.nodeType === 3) || visit444_491_1(visit445_491_2(elem.nodeType === 8) || !(style = elem.style)))) {
      _$jscoverage['/base/style.js'].lineData[492]++;
      return undefined;
    }
    _$jscoverage['/base/style.js'].lineData[494]++;
    name = camelCase(name);
    _$jscoverage['/base/style.js'].lineData[495]++;
    hook = cssHooks[name];
    _$jscoverage['/base/style.js'].lineData[496]++;
    name = visit446_496_1(cssProps[name] || name);
    _$jscoverage['/base/style.js'].lineData[498]++;
    if (visit447_498_1(val !== undefined)) {
      _$jscoverage['/base/style.js'].lineData[500]++;
      if (visit448_500_1(visit449_500_2(val === null) || visit450_500_3(val === EMPTY))) {
        _$jscoverage['/base/style.js'].lineData[501]++;
        val = EMPTY;
      } else {
        _$jscoverage['/base/style.js'].lineData[504]++;
        if (visit451_504_1(!isNaN(Number(val)) && !cssNumber[name])) {
          _$jscoverage['/base/style.js'].lineData[505]++;
          val += DEFAULT_UNIT;
        }
      }
      _$jscoverage['/base/style.js'].lineData[507]++;
      if (visit452_507_1(hook && hook.set)) {
        _$jscoverage['/base/style.js'].lineData[508]++;
        val = hook.set(elem, val);
      }
      _$jscoverage['/base/style.js'].lineData[510]++;
      if (visit453_510_1(val !== undefined)) {
        _$jscoverage['/base/style.js'].lineData[512]++;
        try {
          _$jscoverage['/base/style.js'].lineData[514]++;
          style[name] = val;
        }        catch (e) {
  _$jscoverage['/base/style.js'].lineData[516]++;
  S.log('css set error :' + e);
}
        _$jscoverage['/base/style.js'].lineData[519]++;
        if (visit454_519_1(visit455_519_2(val === EMPTY) && style.removeAttribute)) {
          _$jscoverage['/base/style.js'].lineData[520]++;
          style.removeAttribute(name);
        }
      }
      _$jscoverage['/base/style.js'].lineData[523]++;
      if (visit456_523_1(!style.cssText)) {
        _$jscoverage['/base/style.js'].lineData[526]++;
        visit457_526_1(UA.webkit && (style = elem.outerHTML));
        _$jscoverage['/base/style.js'].lineData[527]++;
        elem.removeAttribute('style');
      }
      _$jscoverage['/base/style.js'].lineData[529]++;
      return undefined;
    } else {
      _$jscoverage['/base/style.js'].lineData[534]++;
      if (visit458_534_1(hook && visit459_534_2('get' in hook && visit460_534_3((ret = hook.get(elem, false)) !== undefined)))) {
      } else {
        _$jscoverage['/base/style.js'].lineData[538]++;
        ret = style[name];
      }
      _$jscoverage['/base/style.js'].lineData[540]++;
      return visit461_540_1(ret === undefined) ? '' : ret;
    }
  }
  _$jscoverage['/base/style.js'].lineData[545]++;
  function getWHIgnoreDisplay(elem) {
    _$jscoverage['/base/style.js'].functionData[21]++;
    _$jscoverage['/base/style.js'].lineData[546]++;
    var val, args = arguments;
    _$jscoverage['/base/style.js'].lineData[549]++;
    if (visit462_549_1(elem.offsetWidth !== 0)) {
      _$jscoverage['/base/style.js'].lineData[550]++;
      val = getWH.apply(undefined, args);
    } else {
      _$jscoverage['/base/style.js'].lineData[552]++;
      swap(elem, cssShow, function() {
  _$jscoverage['/base/style.js'].functionData[22]++;
  _$jscoverage['/base/style.js'].lineData[553]++;
  val = getWH.apply(undefined, args);
});
    }
    _$jscoverage['/base/style.js'].lineData[556]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[568]++;
  function getWH(elem, name, extra) {
    _$jscoverage['/base/style.js'].functionData[23]++;
    _$jscoverage['/base/style.js'].lineData[569]++;
    if (visit463_569_1(S.isWindow(elem))) {
      _$jscoverage['/base/style.js'].lineData[570]++;
      return visit464_570_1(name == WIDTH) ? Dom.viewportWidth(elem) : Dom.viewportHeight(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[571]++;
      if (visit465_571_1(elem.nodeType == 9)) {
        _$jscoverage['/base/style.js'].lineData[572]++;
        return visit466_572_1(name == WIDTH) ? Dom.docWidth(elem) : Dom.docHeight(elem);
      }
    }
    _$jscoverage['/base/style.js'].lineData[574]++;
    var which = visit467_574_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'], val = visit468_575_1(name === WIDTH) ? elem.offsetWidth : elem.offsetHeight;
    _$jscoverage['/base/style.js'].lineData[577]++;
    if (visit469_577_1(val > 0)) {
      _$jscoverage['/base/style.js'].lineData[578]++;
      if (visit470_578_1(extra !== 'border')) {
        _$jscoverage['/base/style.js'].lineData[579]++;
        S.each(which, function(w) {
  _$jscoverage['/base/style.js'].functionData[24]++;
  _$jscoverage['/base/style.js'].lineData[580]++;
  if (visit471_580_1(!extra)) {
    _$jscoverage['/base/style.js'].lineData[581]++;
    val -= visit472_581_1(parseFloat(Dom.css(elem, 'padding' + w)) || 0);
  }
  _$jscoverage['/base/style.js'].lineData[583]++;
  if (visit473_583_1(extra === 'margin')) {
    _$jscoverage['/base/style.js'].lineData[584]++;
    val += visit474_584_1(parseFloat(Dom.css(elem, extra + w)) || 0);
  } else {
    _$jscoverage['/base/style.js'].lineData[586]++;
    val -= visit475_586_1(parseFloat(Dom.css(elem, 'border' + w + 'Width')) || 0);
  }
});
      }
      _$jscoverage['/base/style.js'].lineData[591]++;
      return val;
    }
    _$jscoverage['/base/style.js'].lineData[595]++;
    val = Dom._getComputedStyle(elem, name);
    _$jscoverage['/base/style.js'].lineData[596]++;
    if (visit476_596_1(visit477_596_2(val == null) || visit478_596_3((Number(val)) < 0))) {
      _$jscoverage['/base/style.js'].lineData[597]++;
      val = visit479_597_1(elem.style[name] || 0);
    }
    _$jscoverage['/base/style.js'].lineData[600]++;
    val = visit480_600_1(parseFloat(val) || 0);
    _$jscoverage['/base/style.js'].lineData[603]++;
    if (visit481_603_1(extra)) {
      _$jscoverage['/base/style.js'].lineData[604]++;
      S.each(which, function(w) {
  _$jscoverage['/base/style.js'].functionData[25]++;
  _$jscoverage['/base/style.js'].lineData[605]++;
  val += visit482_605_1(parseFloat(Dom.css(elem, 'padding' + w)) || 0);
  _$jscoverage['/base/style.js'].lineData[606]++;
  if (visit483_606_1(extra !== 'padding')) {
    _$jscoverage['/base/style.js'].lineData[607]++;
    val += visit484_607_1(parseFloat(Dom.css(elem, 'border' + w + 'Width')) || 0);
  }
  _$jscoverage['/base/style.js'].lineData[609]++;
  if (visit485_609_1(extra === 'margin')) {
    _$jscoverage['/base/style.js'].lineData[610]++;
    val += visit486_610_1(parseFloat(Dom.css(elem, extra + w)) || 0);
  }
});
    }
    _$jscoverage['/base/style.js'].lineData[615]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[618]++;
  var ROOT_REG = /^(?:body|html)$/i;
  _$jscoverage['/base/style.js'].lineData[620]++;
  function getPosition(el) {
    _$jscoverage['/base/style.js'].functionData[26]++;
    _$jscoverage['/base/style.js'].lineData[621]++;
    var offsetParent, offset, parentOffset = {
  top: 0, 
  left: 0};
    _$jscoverage['/base/style.js'].lineData[625]++;
    if (visit487_625_1(Dom.css(el, 'position') == 'fixed')) {
      _$jscoverage['/base/style.js'].lineData[626]++;
      offset = el.getBoundingClientRect();
    } else {
      _$jscoverage['/base/style.js'].lineData[631]++;
      offsetParent = getOffsetParent(el);
      _$jscoverage['/base/style.js'].lineData[632]++;
      offset = Dom.offset(el);
      _$jscoverage['/base/style.js'].lineData[633]++;
      parentOffset = Dom.offset(offsetParent);
      _$jscoverage['/base/style.js'].lineData[634]++;
      parentOffset.top += visit488_634_1(parseFloat(Dom.css(offsetParent, "borderTopWidth")) || 0);
      _$jscoverage['/base/style.js'].lineData[635]++;
      parentOffset.left += visit489_635_1(parseFloat(Dom.css(offsetParent, "borderLeftWidth")) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[638]++;
    offset.top -= visit490_638_1(parseFloat(Dom.css(el, "marginTop")) || 0);
    _$jscoverage['/base/style.js'].lineData[639]++;
    offset.left -= visit491_639_1(parseFloat(Dom.css(el, "marginLeft")) || 0);
    _$jscoverage['/base/style.js'].lineData[643]++;
    return {
  top: offset.top - parentOffset.top, 
  left: offset.left - parentOffset.left};
  }
  _$jscoverage['/base/style.js'].lineData[649]++;
  function getOffsetParent(el) {
    _$jscoverage['/base/style.js'].functionData[27]++;
    _$jscoverage['/base/style.js'].lineData[650]++;
    var offsetParent = visit492_650_1(el.offsetParent || (visit493_650_2(el.ownerDocument || doc)).body);
    _$jscoverage['/base/style.js'].lineData[651]++;
    while (visit494_651_1(offsetParent && visit495_651_2(!ROOT_REG.test(offsetParent.nodeName) && visit496_652_1(Dom.css(offsetParent, "position") === "static")))) {
      _$jscoverage['/base/style.js'].lineData[653]++;
      offsetParent = offsetParent.offsetParent;
    }
    _$jscoverage['/base/style.js'].lineData[655]++;
    return offsetParent;
  }
  _$jscoverage['/base/style.js'].lineData[658]++;
  return Dom;
}, {
  requires: ['./api']});
