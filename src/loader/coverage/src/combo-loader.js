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
if (! _$jscoverage['/combo-loader.js']) {
  _$jscoverage['/combo-loader.js'] = {};
  _$jscoverage['/combo-loader.js'].lineData = [];
  _$jscoverage['/combo-loader.js'].lineData[6] = 0;
  _$jscoverage['/combo-loader.js'].lineData[7] = 0;
  _$jscoverage['/combo-loader.js'].lineData[10] = 0;
  _$jscoverage['/combo-loader.js'].lineData[22] = 0;
  _$jscoverage['/combo-loader.js'].lineData[23] = 0;
  _$jscoverage['/combo-loader.js'].lineData[27] = 0;
  _$jscoverage['/combo-loader.js'].lineData[28] = 0;
  _$jscoverage['/combo-loader.js'].lineData[29] = 0;
  _$jscoverage['/combo-loader.js'].lineData[33] = 0;
  _$jscoverage['/combo-loader.js'].lineData[34] = 0;
  _$jscoverage['/combo-loader.js'].lineData[35] = 0;
  _$jscoverage['/combo-loader.js'].lineData[38] = 0;
  _$jscoverage['/combo-loader.js'].lineData[39] = 0;
  _$jscoverage['/combo-loader.js'].lineData[41] = 0;
  _$jscoverage['/combo-loader.js'].lineData[42] = 0;
  _$jscoverage['/combo-loader.js'].lineData[43] = 0;
  _$jscoverage['/combo-loader.js'].lineData[45] = 0;
  _$jscoverage['/combo-loader.js'].lineData[48] = 0;
  _$jscoverage['/combo-loader.js'].lineData[49] = 0;
  _$jscoverage['/combo-loader.js'].lineData[53] = 0;
  _$jscoverage['/combo-loader.js'].lineData[54] = 0;
  _$jscoverage['/combo-loader.js'].lineData[55] = 0;
  _$jscoverage['/combo-loader.js'].lineData[56] = 0;
  _$jscoverage['/combo-loader.js'].lineData[57] = 0;
  _$jscoverage['/combo-loader.js'].lineData[58] = 0;
  _$jscoverage['/combo-loader.js'].lineData[59] = 0;
  _$jscoverage['/combo-loader.js'].lineData[60] = 0;
  _$jscoverage['/combo-loader.js'].lineData[62] = 0;
  _$jscoverage['/combo-loader.js'].lineData[67] = 0;
  _$jscoverage['/combo-loader.js'].lineData[71] = 0;
  _$jscoverage['/combo-loader.js'].lineData[79] = 0;
  _$jscoverage['/combo-loader.js'].lineData[80] = 0;
  _$jscoverage['/combo-loader.js'].lineData[81] = 0;
  _$jscoverage['/combo-loader.js'].lineData[82] = 0;
  _$jscoverage['/combo-loader.js'].lineData[83] = 0;
  _$jscoverage['/combo-loader.js'].lineData[86] = 0;
  _$jscoverage['/combo-loader.js'].lineData[87] = 0;
  _$jscoverage['/combo-loader.js'].lineData[88] = 0;
  _$jscoverage['/combo-loader.js'].lineData[90] = 0;
  _$jscoverage['/combo-loader.js'].lineData[93] = 0;
  _$jscoverage['/combo-loader.js'].lineData[94] = 0;
  _$jscoverage['/combo-loader.js'].lineData[95] = 0;
  _$jscoverage['/combo-loader.js'].lineData[96] = 0;
  _$jscoverage['/combo-loader.js'].lineData[97] = 0;
  _$jscoverage['/combo-loader.js'].lineData[101] = 0;
  _$jscoverage['/combo-loader.js'].lineData[102] = 0;
  _$jscoverage['/combo-loader.js'].lineData[105] = 0;
  _$jscoverage['/combo-loader.js'].lineData[108] = 0;
  _$jscoverage['/combo-loader.js'].lineData[110] = 0;
  _$jscoverage['/combo-loader.js'].lineData[111] = 0;
  _$jscoverage['/combo-loader.js'].lineData[112] = 0;
  _$jscoverage['/combo-loader.js'].lineData[113] = 0;
  _$jscoverage['/combo-loader.js'].lineData[119] = 0;
  _$jscoverage['/combo-loader.js'].lineData[120] = 0;
  _$jscoverage['/combo-loader.js'].lineData[121] = 0;
  _$jscoverage['/combo-loader.js'].lineData[122] = 0;
  _$jscoverage['/combo-loader.js'].lineData[123] = 0;
  _$jscoverage['/combo-loader.js'].lineData[125] = 0;
  _$jscoverage['/combo-loader.js'].lineData[127] = 0;
  _$jscoverage['/combo-loader.js'].lineData[128] = 0;
  _$jscoverage['/combo-loader.js'].lineData[129] = 0;
  _$jscoverage['/combo-loader.js'].lineData[132] = 0;
  _$jscoverage['/combo-loader.js'].lineData[139] = 0;
  _$jscoverage['/combo-loader.js'].lineData[140] = 0;
  _$jscoverage['/combo-loader.js'].lineData[141] = 0;
  _$jscoverage['/combo-loader.js'].lineData[143] = 0;
  _$jscoverage['/combo-loader.js'].lineData[145] = 0;
  _$jscoverage['/combo-loader.js'].lineData[146] = 0;
  _$jscoverage['/combo-loader.js'].lineData[152] = 0;
  _$jscoverage['/combo-loader.js'].lineData[153] = 0;
  _$jscoverage['/combo-loader.js'].lineData[159] = 0;
  _$jscoverage['/combo-loader.js'].lineData[160] = 0;
  _$jscoverage['/combo-loader.js'].lineData[161] = 0;
  _$jscoverage['/combo-loader.js'].lineData[162] = 0;
  _$jscoverage['/combo-loader.js'].lineData[163] = 0;
  _$jscoverage['/combo-loader.js'].lineData[167] = 0;
  _$jscoverage['/combo-loader.js'].lineData[168] = 0;
  _$jscoverage['/combo-loader.js'].lineData[175] = 0;
  _$jscoverage['/combo-loader.js'].lineData[176] = 0;
  _$jscoverage['/combo-loader.js'].lineData[177] = 0;
  _$jscoverage['/combo-loader.js'].lineData[179] = 0;
  _$jscoverage['/combo-loader.js'].lineData[182] = 0;
  _$jscoverage['/combo-loader.js'].lineData[184] = 0;
  _$jscoverage['/combo-loader.js'].lineData[185] = 0;
  _$jscoverage['/combo-loader.js'].lineData[186] = 0;
  _$jscoverage['/combo-loader.js'].lineData[187] = 0;
  _$jscoverage['/combo-loader.js'].lineData[188] = 0;
  _$jscoverage['/combo-loader.js'].lineData[189] = 0;
  _$jscoverage['/combo-loader.js'].lineData[190] = 0;
  _$jscoverage['/combo-loader.js'].lineData[193] = 0;
  _$jscoverage['/combo-loader.js'].lineData[194] = 0;
  _$jscoverage['/combo-loader.js'].lineData[200] = 0;
  _$jscoverage['/combo-loader.js'].lineData[203] = 0;
  _$jscoverage['/combo-loader.js'].lineData[204] = 0;
  _$jscoverage['/combo-loader.js'].lineData[205] = 0;
  _$jscoverage['/combo-loader.js'].lineData[206] = 0;
  _$jscoverage['/combo-loader.js'].lineData[207] = 0;
  _$jscoverage['/combo-loader.js'].lineData[208] = 0;
  _$jscoverage['/combo-loader.js'].lineData[209] = 0;
  _$jscoverage['/combo-loader.js'].lineData[212] = 0;
  _$jscoverage['/combo-loader.js'].lineData[215] = 0;
  _$jscoverage['/combo-loader.js'].lineData[220] = 0;
  _$jscoverage['/combo-loader.js'].lineData[224] = 0;
  _$jscoverage['/combo-loader.js'].lineData[226] = 0;
  _$jscoverage['/combo-loader.js'].lineData[229] = 0;
  _$jscoverage['/combo-loader.js'].lineData[230] = 0;
  _$jscoverage['/combo-loader.js'].lineData[231] = 0;
  _$jscoverage['/combo-loader.js'].lineData[232] = 0;
  _$jscoverage['/combo-loader.js'].lineData[235] = 0;
  _$jscoverage['/combo-loader.js'].lineData[236] = 0;
  _$jscoverage['/combo-loader.js'].lineData[237] = 0;
  _$jscoverage['/combo-loader.js'].lineData[239] = 0;
  _$jscoverage['/combo-loader.js'].lineData[243] = 0;
  _$jscoverage['/combo-loader.js'].lineData[244] = 0;
  _$jscoverage['/combo-loader.js'].lineData[245] = 0;
  _$jscoverage['/combo-loader.js'].lineData[246] = 0;
  _$jscoverage['/combo-loader.js'].lineData[247] = 0;
  _$jscoverage['/combo-loader.js'].lineData[249] = 0;
  _$jscoverage['/combo-loader.js'].lineData[256] = 0;
  _$jscoverage['/combo-loader.js'].lineData[257] = 0;
  _$jscoverage['/combo-loader.js'].lineData[258] = 0;
  _$jscoverage['/combo-loader.js'].lineData[259] = 0;
  _$jscoverage['/combo-loader.js'].lineData[262] = 0;
  _$jscoverage['/combo-loader.js'].lineData[263] = 0;
  _$jscoverage['/combo-loader.js'].lineData[266] = 0;
  _$jscoverage['/combo-loader.js'].lineData[267] = 0;
  _$jscoverage['/combo-loader.js'].lineData[270] = 0;
  _$jscoverage['/combo-loader.js'].lineData[271] = 0;
  _$jscoverage['/combo-loader.js'].lineData[274] = 0;
  _$jscoverage['/combo-loader.js'].lineData[285] = 0;
  _$jscoverage['/combo-loader.js'].lineData[288] = 0;
  _$jscoverage['/combo-loader.js'].lineData[291] = 0;
  _$jscoverage['/combo-loader.js'].lineData[293] = 0;
  _$jscoverage['/combo-loader.js'].lineData[294] = 0;
  _$jscoverage['/combo-loader.js'].lineData[295] = 0;
  _$jscoverage['/combo-loader.js'].lineData[296] = 0;
  _$jscoverage['/combo-loader.js'].lineData[298] = 0;
  _$jscoverage['/combo-loader.js'].lineData[299] = 0;
  _$jscoverage['/combo-loader.js'].lineData[300] = 0;
  _$jscoverage['/combo-loader.js'].lineData[301] = 0;
  _$jscoverage['/combo-loader.js'].lineData[302] = 0;
  _$jscoverage['/combo-loader.js'].lineData[304] = 0;
  _$jscoverage['/combo-loader.js'].lineData[305] = 0;
  _$jscoverage['/combo-loader.js'].lineData[306] = 0;
  _$jscoverage['/combo-loader.js'].lineData[307] = 0;
  _$jscoverage['/combo-loader.js'].lineData[308] = 0;
  _$jscoverage['/combo-loader.js'].lineData[310] = 0;
  _$jscoverage['/combo-loader.js'].lineData[311] = 0;
  _$jscoverage['/combo-loader.js'].lineData[314] = 0;
  _$jscoverage['/combo-loader.js'].lineData[317] = 0;
  _$jscoverage['/combo-loader.js'].lineData[324] = 0;
  _$jscoverage['/combo-loader.js'].lineData[328] = 0;
  _$jscoverage['/combo-loader.js'].lineData[337] = 0;
  _$jscoverage['/combo-loader.js'].lineData[344] = 0;
  _$jscoverage['/combo-loader.js'].lineData[345] = 0;
  _$jscoverage['/combo-loader.js'].lineData[346] = 0;
  _$jscoverage['/combo-loader.js'].lineData[347] = 0;
  _$jscoverage['/combo-loader.js'].lineData[348] = 0;
  _$jscoverage['/combo-loader.js'].lineData[349] = 0;
  _$jscoverage['/combo-loader.js'].lineData[350] = 0;
  _$jscoverage['/combo-loader.js'].lineData[351] = 0;
  _$jscoverage['/combo-loader.js'].lineData[352] = 0;
  _$jscoverage['/combo-loader.js'].lineData[353] = 0;
  _$jscoverage['/combo-loader.js'].lineData[355] = 0;
  _$jscoverage['/combo-loader.js'].lineData[356] = 0;
  _$jscoverage['/combo-loader.js'].lineData[357] = 0;
  _$jscoverage['/combo-loader.js'].lineData[358] = 0;
  _$jscoverage['/combo-loader.js'].lineData[359] = 0;
  _$jscoverage['/combo-loader.js'].lineData[361] = 0;
  _$jscoverage['/combo-loader.js'].lineData[362] = 0;
  _$jscoverage['/combo-loader.js'].lineData[363] = 0;
  _$jscoverage['/combo-loader.js'].lineData[364] = 0;
  _$jscoverage['/combo-loader.js'].lineData[365] = 0;
  _$jscoverage['/combo-loader.js'].lineData[366] = 0;
  _$jscoverage['/combo-loader.js'].lineData[368] = 0;
  _$jscoverage['/combo-loader.js'].lineData[369] = 0;
  _$jscoverage['/combo-loader.js'].lineData[370] = 0;
  _$jscoverage['/combo-loader.js'].lineData[373] = 0;
  _$jscoverage['/combo-loader.js'].lineData[374] = 0;
  _$jscoverage['/combo-loader.js'].lineData[375] = 0;
  _$jscoverage['/combo-loader.js'].lineData[376] = 0;
  _$jscoverage['/combo-loader.js'].lineData[379] = 0;
  _$jscoverage['/combo-loader.js'].lineData[380] = 0;
  _$jscoverage['/combo-loader.js'].lineData[381] = 0;
  _$jscoverage['/combo-loader.js'].lineData[382] = 0;
  _$jscoverage['/combo-loader.js'].lineData[383] = 0;
  _$jscoverage['/combo-loader.js'].lineData[385] = 0;
  _$jscoverage['/combo-loader.js'].lineData[386] = 0;
  _$jscoverage['/combo-loader.js'].lineData[389] = 0;
  _$jscoverage['/combo-loader.js'].lineData[394] = 0;
  _$jscoverage['/combo-loader.js'].lineData[404] = 0;
  _$jscoverage['/combo-loader.js'].lineData[409] = 0;
  _$jscoverage['/combo-loader.js'].lineData[411] = 0;
  _$jscoverage['/combo-loader.js'].lineData[413] = 0;
  _$jscoverage['/combo-loader.js'].lineData[414] = 0;
  _$jscoverage['/combo-loader.js'].lineData[415] = 0;
  _$jscoverage['/combo-loader.js'].lineData[416] = 0;
  _$jscoverage['/combo-loader.js'].lineData[417] = 0;
  _$jscoverage['/combo-loader.js'].lineData[418] = 0;
  _$jscoverage['/combo-loader.js'].lineData[421] = 0;
  _$jscoverage['/combo-loader.js'].lineData[425] = 0;
  _$jscoverage['/combo-loader.js'].lineData[428] = 0;
  _$jscoverage['/combo-loader.js'].lineData[430] = 0;
  _$jscoverage['/combo-loader.js'].lineData[438] = 0;
  _$jscoverage['/combo-loader.js'].lineData[439] = 0;
  _$jscoverage['/combo-loader.js'].lineData[440] = 0;
  _$jscoverage['/combo-loader.js'].lineData[441] = 0;
  _$jscoverage['/combo-loader.js'].lineData[444] = 0;
  _$jscoverage['/combo-loader.js'].lineData[450] = 0;
  _$jscoverage['/combo-loader.js'].lineData[453] = 0;
  _$jscoverage['/combo-loader.js'].lineData[454] = 0;
  _$jscoverage['/combo-loader.js'].lineData[455] = 0;
  _$jscoverage['/combo-loader.js'].lineData[457] = 0;
  _$jscoverage['/combo-loader.js'].lineData[459] = 0;
  _$jscoverage['/combo-loader.js'].lineData[460] = 0;
  _$jscoverage['/combo-loader.js'].lineData[461] = 0;
  _$jscoverage['/combo-loader.js'].lineData[462] = 0;
  _$jscoverage['/combo-loader.js'].lineData[463] = 0;
  _$jscoverage['/combo-loader.js'].lineData[464] = 0;
  _$jscoverage['/combo-loader.js'].lineData[467] = 0;
  _$jscoverage['/combo-loader.js'].lineData[468] = 0;
  _$jscoverage['/combo-loader.js'].lineData[471] = 0;
  _$jscoverage['/combo-loader.js'].lineData[474] = 0;
  _$jscoverage['/combo-loader.js'].lineData[475] = 0;
  _$jscoverage['/combo-loader.js'].lineData[476] = 0;
  _$jscoverage['/combo-loader.js'].lineData[477] = 0;
  _$jscoverage['/combo-loader.js'].lineData[480] = 0;
  _$jscoverage['/combo-loader.js'].lineData[481] = 0;
  _$jscoverage['/combo-loader.js'].lineData[482] = 0;
  _$jscoverage['/combo-loader.js'].lineData[483] = 0;
  _$jscoverage['/combo-loader.js'].lineData[486] = 0;
  _$jscoverage['/combo-loader.js'].lineData[487] = 0;
  _$jscoverage['/combo-loader.js'].lineData[488] = 0;
  _$jscoverage['/combo-loader.js'].lineData[489] = 0;
  _$jscoverage['/combo-loader.js'].lineData[490] = 0;
  _$jscoverage['/combo-loader.js'].lineData[494] = 0;
  _$jscoverage['/combo-loader.js'].lineData[498] = 0;
  _$jscoverage['/combo-loader.js'].lineData[499] = 0;
  _$jscoverage['/combo-loader.js'].lineData[501] = 0;
  _$jscoverage['/combo-loader.js'].lineData[504] = 0;
  _$jscoverage['/combo-loader.js'].lineData[505] = 0;
  _$jscoverage['/combo-loader.js'].lineData[507] = 0;
  _$jscoverage['/combo-loader.js'].lineData[508] = 0;
  _$jscoverage['/combo-loader.js'].lineData[509] = 0;
  _$jscoverage['/combo-loader.js'].lineData[511] = 0;
  _$jscoverage['/combo-loader.js'].lineData[514] = 0;
  _$jscoverage['/combo-loader.js'].lineData[515] = 0;
  _$jscoverage['/combo-loader.js'].lineData[519] = 0;
  _$jscoverage['/combo-loader.js'].lineData[520] = 0;
  _$jscoverage['/combo-loader.js'].lineData[521] = 0;
  _$jscoverage['/combo-loader.js'].lineData[525] = 0;
  _$jscoverage['/combo-loader.js'].lineData[528] = 0;
  _$jscoverage['/combo-loader.js'].lineData[529] = 0;
  _$jscoverage['/combo-loader.js'].lineData[534] = 0;
}
if (! _$jscoverage['/combo-loader.js'].functionData) {
  _$jscoverage['/combo-loader.js'].functionData = [];
  _$jscoverage['/combo-loader.js'].functionData[0] = 0;
  _$jscoverage['/combo-loader.js'].functionData[1] = 0;
  _$jscoverage['/combo-loader.js'].functionData[2] = 0;
  _$jscoverage['/combo-loader.js'].functionData[3] = 0;
  _$jscoverage['/combo-loader.js'].functionData[4] = 0;
  _$jscoverage['/combo-loader.js'].functionData[5] = 0;
  _$jscoverage['/combo-loader.js'].functionData[6] = 0;
  _$jscoverage['/combo-loader.js'].functionData[7] = 0;
  _$jscoverage['/combo-loader.js'].functionData[8] = 0;
  _$jscoverage['/combo-loader.js'].functionData[9] = 0;
  _$jscoverage['/combo-loader.js'].functionData[10] = 0;
  _$jscoverage['/combo-loader.js'].functionData[11] = 0;
  _$jscoverage['/combo-loader.js'].functionData[12] = 0;
  _$jscoverage['/combo-loader.js'].functionData[13] = 0;
  _$jscoverage['/combo-loader.js'].functionData[14] = 0;
  _$jscoverage['/combo-loader.js'].functionData[15] = 0;
  _$jscoverage['/combo-loader.js'].functionData[16] = 0;
  _$jscoverage['/combo-loader.js'].functionData[17] = 0;
  _$jscoverage['/combo-loader.js'].functionData[18] = 0;
  _$jscoverage['/combo-loader.js'].functionData[19] = 0;
  _$jscoverage['/combo-loader.js'].functionData[20] = 0;
  _$jscoverage['/combo-loader.js'].functionData[21] = 0;
  _$jscoverage['/combo-loader.js'].functionData[22] = 0;
  _$jscoverage['/combo-loader.js'].functionData[23] = 0;
  _$jscoverage['/combo-loader.js'].functionData[24] = 0;
  _$jscoverage['/combo-loader.js'].functionData[25] = 0;
  _$jscoverage['/combo-loader.js'].functionData[26] = 0;
  _$jscoverage['/combo-loader.js'].functionData[27] = 0;
  _$jscoverage['/combo-loader.js'].functionData[28] = 0;
  _$jscoverage['/combo-loader.js'].functionData[29] = 0;
  _$jscoverage['/combo-loader.js'].functionData[30] = 0;
}
if (! _$jscoverage['/combo-loader.js'].branchData) {
  _$jscoverage['/combo-loader.js'].branchData = {};
  _$jscoverage['/combo-loader.js'].branchData['20'] = [];
  _$jscoverage['/combo-loader.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['23'] = [];
  _$jscoverage['/combo-loader.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['28'] = [];
  _$jscoverage['/combo-loader.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['39'] = [];
  _$jscoverage['/combo-loader.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['53'] = [];
  _$jscoverage['/combo-loader.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['55'] = [];
  _$jscoverage['/combo-loader.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['57'] = [];
  _$jscoverage['/combo-loader.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['59'] = [];
  _$jscoverage['/combo-loader.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['93'] = [];
  _$jscoverage['/combo-loader.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['93'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['93'][3] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['93'][4] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['95'] = [];
  _$jscoverage['/combo-loader.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['96'] = [];
  _$jscoverage['/combo-loader.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['101'] = [];
  _$jscoverage['/combo-loader.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['110'] = [];
  _$jscoverage['/combo-loader.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['110'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['119'] = [];
  _$jscoverage['/combo-loader.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['119'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['119'][3] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['123'] = [];
  _$jscoverage['/combo-loader.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['139'] = [];
  _$jscoverage['/combo-loader.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['159'] = [];
  _$jscoverage['/combo-loader.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['161'] = [];
  _$jscoverage['/combo-loader.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['167'] = [];
  _$jscoverage['/combo-loader.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['184'] = [];
  _$jscoverage['/combo-loader.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['189'] = [];
  _$jscoverage['/combo-loader.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['193'] = [];
  _$jscoverage['/combo-loader.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['207'] = [];
  _$jscoverage['/combo-loader.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['208'] = [];
  _$jscoverage['/combo-loader.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['229'] = [];
  _$jscoverage['/combo-loader.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['231'] = [];
  _$jscoverage['/combo-loader.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['256'] = [];
  _$jscoverage['/combo-loader.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['258'] = [];
  _$jscoverage['/combo-loader.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['266'] = [];
  _$jscoverage['/combo-loader.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['288'] = [];
  _$jscoverage['/combo-loader.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['291'] = [];
  _$jscoverage['/combo-loader.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['293'] = [];
  _$jscoverage['/combo-loader.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['295'] = [];
  _$jscoverage['/combo-loader.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['301'] = [];
  _$jscoverage['/combo-loader.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['304'] = [];
  _$jscoverage['/combo-loader.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['305'] = [];
  _$jscoverage['/combo-loader.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['306'] = [];
  _$jscoverage['/combo-loader.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['344'] = [];
  _$jscoverage['/combo-loader.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['355'] = [];
  _$jscoverage['/combo-loader.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['356'] = [];
  _$jscoverage['/combo-loader.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['358'] = [];
  _$jscoverage['/combo-loader.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['362'] = [];
  _$jscoverage['/combo-loader.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['365'] = [];
  _$jscoverage['/combo-loader.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['365'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['373'] = [];
  _$jscoverage['/combo-loader.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['376'] = [];
  _$jscoverage['/combo-loader.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['379'] = [];
  _$jscoverage['/combo-loader.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['380'] = [];
  _$jscoverage['/combo-loader.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['383'] = [];
  _$jscoverage['/combo-loader.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['385'] = [];
  _$jscoverage['/combo-loader.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['385'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['438'] = [];
  _$jscoverage['/combo-loader.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['441'] = [];
  _$jscoverage['/combo-loader.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['457'] = [];
  _$jscoverage['/combo-loader.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['457'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['458'] = [];
  _$jscoverage['/combo-loader.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['467'] = [];
  _$jscoverage['/combo-loader.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['481'] = [];
  _$jscoverage['/combo-loader.js'].branchData['481'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['487'] = [];
  _$jscoverage['/combo-loader.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['498'] = [];
  _$jscoverage['/combo-loader.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['507'] = [];
  _$jscoverage['/combo-loader.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['507'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['507'][3] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['520'] = [];
  _$jscoverage['/combo-loader.js'].branchData['520'][1] = new BranchData();
}
_$jscoverage['/combo-loader.js'].branchData['520'][1].init(46, 10, '!self.head');
function visit71_520_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['507'][3].init(128, 23, 'status === Status.ERROR');
function visit70_507_3(result) {
  _$jscoverage['/combo-loader.js'].branchData['507'][3].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['507'][2].init(101, 23, 'status >= Status.LOADED');
function visit69_507_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['507'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['507'][1].init(101, 50, 'status >= Status.LOADED || status === Status.ERROR');
function visit68_507_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['498'][1].init(17, 14, '!this.callback');
function visit67_498_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['487'][1].init(34, 20, 'comboRes[type] || []');
function visit66_487_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['481'][1].init(34, 20, 'comboRes[type] || []');
function visit65_481_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['467'][1].init(2282, 23, 'currentComboUrls.length');
function visit64_467_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['458'][1].init(64, 72, 'l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength');
function visit63_458_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['457'][2].init(828, 36, 'currentComboUrls.length > maxFileNum');
function visit62_457_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['457'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['457'][1].init(828, 138, 'currentComboUrls.length > maxFileNum || (l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)');
function visit61_457_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['441'][1].init(126, 155, '!currentMod.getPackage().isCombine() || !Utils.startsWith(url, basePrefix)');
function visit60_441_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['438'][1].init(966, 19, 'i < sendMods.length');
function visit59_438_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['385'][2].init(36, 19, 'tag !== tmpMods.tag');
function visit58_385_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['385'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['385'][1].init(29, 26, 'tag && tag !== tmpMods.tag');
function visit57_385_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['383'][1].init(155, 9, 'tag || \'\'');
function visit56_383_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['380'][1].init(102, 37, '!(tmpMods = normalTypes[packageBase])');
function visit55_380_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['379'][1].init(39, 37, 'normals[type] || (normals[type] = {})');
function visit54_379_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['376'][1].init(156, 9, 'tag || \'\'');
function visit53_376_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['373'][1].init(953, 5, '!find');
function visit52_373_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['365'][2].init(169, 19, 'tag !== tmpMods.tag');
function visit51_365_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['365'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['365'][1].init(162, 26, 'tag && tag !== tmpMods.tag');
function visit50_365_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['362'][1].init(29, 41, 'Utils.isSameOriginAs(prefix, packageBase)');
function visit49_362_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['358'][1].init(162, 45, 'typeGroups[group] || (typeGroups[group] = {})');
function visit48_358_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['356'][1].init(38, 35, 'groups[type] || (groups[type] = {})');
function visit47_356_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['355'][1].init(423, 32, 'packageInfo.isCombine() && group');
function visit46_355_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['344'][1].init(574, 5, 'i < l');
function visit45_344_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['306'][1].init(29, 21, 'modStatus !== LOADING');
function visit44_306_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['305'][1].init(25, 19, '!mod.contains(self)');
function visit43_305_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['304'][1].init(353, 20, 'modStatus !== LOADED');
function visit42_304_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['301'][1].init(253, 28, 'modStatus >= READY_TO_ATTACH');
function visit41_301_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['295'][1].init(54, 8, 'cache[m]');
function visit40_295_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['293'][1].init(227, 19, 'i < modNames.length');
function visit39_293_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['291'][1].init(189, 11, 'cache || {}');
function visit38_291_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['288'][1].init(87, 9, 'ret || []');
function visit37_288_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['266'][1].init(150, 12, '!mod.factory');
function visit36_266_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['258'][1].init(25, 9, '\'@DEBUG@\'');
function visit35_258_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['256'][1].init(1384, 12, 'comboUrls.js');
function visit34_256_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['231'][1].init(25, 9, '\'@DEBUG@\'');
function visit33_231_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['229'][1].init(287, 13, 'comboUrls.css');
function visit32_229_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['208'][1].init(17, 19, 'str1[i] !== str2[i]');
function visit31_208_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['207'][1].init(314, 5, 'i < l');
function visit30_207_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['193'][1].init(225, 9, 'ms.length');
function visit29_193_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['189'][1].init(25, 19, 'm.status === LOADED');
function visit28_189_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['184'][1].init(5889, 9, '\'@DEBUG@\'');
function visit27_184_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['167'][1].init(363, 2, 're');
function visit26_167_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['161'][1].init(50, 35, 'script.readyState === \'interactive\'');
function visit25_161_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['159'][1].init(171, 6, 'i >= 0');
function visit24_159_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['139'][1].init(74, 5, 'oldIE');
function visit23_139_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['123'][1].init(132, 5, 'oldIE');
function visit22_123_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['119'][3].init(395, 13, 'argsLen === 1');
function visit21_119_3(result) {
  _$jscoverage['/combo-loader.js'].branchData['119'][3].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['119'][2].init(365, 26, 'typeof name === \'function\'');
function visit20_119_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['119'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['119'][1].init(365, 43, 'typeof name === \'function\' || argsLen === 1');
function visit19_119_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['110'][2].init(57, 13, 'argsLen === 3');
function visit18_110_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['110'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['110'][1].init(57, 39, 'argsLen === 3 && Utils.isArray(factory)');
function visit17_110_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['101'][2].init(80, 30, 'config.requires && !config.cjs');
function visit16_101_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['101'][1].init(70, 40, 'config && config.requires && !config.cjs');
function visit15_101_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['96'][1].init(26, 12, 'config || {}');
function visit14_96_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['95'][1].init(78, 15, 'requires.length');
function visit13_95_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['93'][4].init(151, 18, 'factory.length > 1');
function visit12_93_4(result) {
  _$jscoverage['/combo-loader.js'].branchData['93'][4].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['93'][3].init(118, 29, 'typeof factory === \'function\'');
function visit11_93_3(result) {
  _$jscoverage['/combo-loader.js'].branchData['93'][3].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['93'][2].init(118, 51, 'typeof factory === \'function\' && factory.length > 1');
function visit10_93_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['93'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['93'][1].init(107, 62, '!config && typeof factory === \'function\' && factory.length > 1');
function visit9_93_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['59'][1].init(74, 9, '\'@DEBUG@\'');
function visit8_59_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['57'][1].init(147, 5, 'oldIE');
function visit7_57_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['55'][1].init(55, 23, 'mod.getType() === \'css\'');
function visit6_55_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['53'][1].init(809, 11, '!rs.combine');
function visit5_53_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['39'][1].init(67, 17, 'mod && currentMod');
function visit4_39_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['28'][1].init(17, 10, '!(--count)');
function visit3_28_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['23'][1].init(21, 17, 'rss && rss.length');
function visit2_23_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['20'][1].init(333, 13, 'Utils.ie < 10');
function visit1_20_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/combo-loader.js'].functionData[0]++;
  _$jscoverage['/combo-loader.js'].lineData[7]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/combo-loader.js'].lineData[10]++;
  var Loader = S.Loader, Config = S.Config, Status = Loader.Status, Utils = Loader.Utils, each = Utils.each, getHash = Utils.getHash, LOADING = Status.LOADING, LOADED = Status.LOADED, READY_TO_ATTACH = Status.READY_TO_ATTACH, ERROR = Status.ERROR, oldIE = visit1_20_1(Utils.ie < 10);
  _$jscoverage['/combo-loader.js'].lineData[22]++;
  function loadScripts(rss, callback, timeout) {
    _$jscoverage['/combo-loader.js'].functionData[1]++;
    _$jscoverage['/combo-loader.js'].lineData[23]++;
    var count = visit2_23_1(rss && rss.length), errorList = [], successList = [];
    _$jscoverage['/combo-loader.js'].lineData[27]++;
    function complete() {
      _$jscoverage['/combo-loader.js'].functionData[2]++;
      _$jscoverage['/combo-loader.js'].lineData[28]++;
      if (visit3_28_1(!(--count))) {
        _$jscoverage['/combo-loader.js'].lineData[29]++;
        callback(successList, errorList);
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[33]++;
    each(rss, function(rs) {
  _$jscoverage['/combo-loader.js'].functionData[3]++;
  _$jscoverage['/combo-loader.js'].lineData[34]++;
  var mod;
  _$jscoverage['/combo-loader.js'].lineData[35]++;
  var config = {
  timeout: timeout, 
  success: function() {
  _$jscoverage['/combo-loader.js'].functionData[4]++;
  _$jscoverage['/combo-loader.js'].lineData[38]++;
  successList.push(rs);
  _$jscoverage['/combo-loader.js'].lineData[39]++;
  if (visit4_39_1(mod && currentMod)) {
    _$jscoverage['/combo-loader.js'].lineData[41]++;
    logger.debug('standard browser get mod name after load: ' + mod.name);
    _$jscoverage['/combo-loader.js'].lineData[42]++;
    Utils.registerModule(mod.name, currentMod.factory, currentMod.config);
    _$jscoverage['/combo-loader.js'].lineData[43]++;
    currentMod = undefined;
  }
  _$jscoverage['/combo-loader.js'].lineData[45]++;
  complete();
}, 
  error: function() {
  _$jscoverage['/combo-loader.js'].functionData[5]++;
  _$jscoverage['/combo-loader.js'].lineData[48]++;
  errorList.push(rs);
  _$jscoverage['/combo-loader.js'].lineData[49]++;
  complete();
}, 
  charset: rs.charset};
  _$jscoverage['/combo-loader.js'].lineData[53]++;
  if (visit5_53_1(!rs.combine)) {
    _$jscoverage['/combo-loader.js'].lineData[54]++;
    mod = rs.mods[0];
    _$jscoverage['/combo-loader.js'].lineData[55]++;
    if (visit6_55_1(mod.getType() === 'css')) {
      _$jscoverage['/combo-loader.js'].lineData[56]++;
      mod = undefined;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[57]++;
      if (visit7_57_1(oldIE)) {
        _$jscoverage['/combo-loader.js'].lineData[58]++;
        startLoadModName = mod.name;
        _$jscoverage['/combo-loader.js'].lineData[59]++;
        if (visit8_59_1('@DEBUG@')) {
          _$jscoverage['/combo-loader.js'].lineData[60]++;
          startLoadModTime = +new Date();
        }
        _$jscoverage['/combo-loader.js'].lineData[62]++;
        config.attrs = {
  'data-mod-name': mod.name};
      }
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[67]++;
  Config.loadModsFn(rs, config);
});
  }
  _$jscoverage['/combo-loader.js'].lineData[71]++;
  var loaderId = 0;
  _$jscoverage['/combo-loader.js'].lineData[79]++;
  function ComboLoader(callback) {
    _$jscoverage['/combo-loader.js'].functionData[6]++;
    _$jscoverage['/combo-loader.js'].lineData[80]++;
    this.callback = callback;
    _$jscoverage['/combo-loader.js'].lineData[81]++;
    this.waitMods = {};
    _$jscoverage['/combo-loader.js'].lineData[82]++;
    this.head = this.tail = undefined;
    _$jscoverage['/combo-loader.js'].lineData[83]++;
    this.id = 'loader' + (++loaderId);
  }
  _$jscoverage['/combo-loader.js'].lineData[86]++;
  var currentMod;
  _$jscoverage['/combo-loader.js'].lineData[87]++;
  var startLoadModName;
  _$jscoverage['/combo-loader.js'].lineData[88]++;
  var startLoadModTime;
  _$jscoverage['/combo-loader.js'].lineData[90]++;
  function checkKISSYRequire(config, factory) {
    _$jscoverage['/combo-loader.js'].functionData[7]++;
    _$jscoverage['/combo-loader.js'].lineData[93]++;
    if (visit9_93_1(!config && visit10_93_2(visit11_93_3(typeof factory === 'function') && visit12_93_4(factory.length > 1)))) {
      _$jscoverage['/combo-loader.js'].lineData[94]++;
      var requires = Utils.getRequiresFromFn(factory);
      _$jscoverage['/combo-loader.js'].lineData[95]++;
      if (visit13_95_1(requires.length)) {
        _$jscoverage['/combo-loader.js'].lineData[96]++;
        config = visit14_96_1(config || {});
        _$jscoverage['/combo-loader.js'].lineData[97]++;
        config.requires = requires;
      }
    } else {
      _$jscoverage['/combo-loader.js'].lineData[101]++;
      if (visit15_101_1(config && visit16_101_2(config.requires && !config.cjs))) {
        _$jscoverage['/combo-loader.js'].lineData[102]++;
        config.cjs = 0;
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[105]++;
    return config;
  }
  _$jscoverage['/combo-loader.js'].lineData[108]++;
  ComboLoader.add = function(name, factory, config, argsLen) {
  _$jscoverage['/combo-loader.js'].functionData[8]++;
  _$jscoverage['/combo-loader.js'].lineData[110]++;
  if (visit17_110_1(visit18_110_2(argsLen === 3) && Utils.isArray(factory))) {
    _$jscoverage['/combo-loader.js'].lineData[111]++;
    var tmp = factory;
    _$jscoverage['/combo-loader.js'].lineData[112]++;
    factory = config;
    _$jscoverage['/combo-loader.js'].lineData[113]++;
    config = {
  requires: tmp, 
  cjs: 1};
  }
  _$jscoverage['/combo-loader.js'].lineData[119]++;
  if (visit19_119_1(visit20_119_2(typeof name === 'function') || visit21_119_3(argsLen === 1))) {
    _$jscoverage['/combo-loader.js'].lineData[120]++;
    config = factory;
    _$jscoverage['/combo-loader.js'].lineData[121]++;
    factory = name;
    _$jscoverage['/combo-loader.js'].lineData[122]++;
    config = checkKISSYRequire(config, factory);
    _$jscoverage['/combo-loader.js'].lineData[123]++;
    if (visit22_123_1(oldIE)) {
      _$jscoverage['/combo-loader.js'].lineData[125]++;
      name = findModuleNameByInteractive();
      _$jscoverage['/combo-loader.js'].lineData[127]++;
      Utils.registerModule(name, factory, config);
      _$jscoverage['/combo-loader.js'].lineData[128]++;
      startLoadModName = null;
      _$jscoverage['/combo-loader.js'].lineData[129]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[132]++;
      currentMod = {
  factory: factory, 
  config: config};
    }
  } else {
    _$jscoverage['/combo-loader.js'].lineData[139]++;
    if (visit23_139_1(oldIE)) {
      _$jscoverage['/combo-loader.js'].lineData[140]++;
      startLoadModName = null;
      _$jscoverage['/combo-loader.js'].lineData[141]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[143]++;
      currentMod = undefined;
    }
    _$jscoverage['/combo-loader.js'].lineData[145]++;
    config = checkKISSYRequire(config, factory);
    _$jscoverage['/combo-loader.js'].lineData[146]++;
    Utils.registerModule(name, factory, config);
  }
};
  _$jscoverage['/combo-loader.js'].lineData[152]++;
  function findModuleNameByInteractive() {
    _$jscoverage['/combo-loader.js'].functionData[9]++;
    _$jscoverage['/combo-loader.js'].lineData[153]++;
    var scripts = document.getElementsByTagName('script'), re, i, name, script;
    _$jscoverage['/combo-loader.js'].lineData[159]++;
    for (i = scripts.length - 1; visit24_159_1(i >= 0); i--) {
      _$jscoverage['/combo-loader.js'].lineData[160]++;
      script = scripts[i];
      _$jscoverage['/combo-loader.js'].lineData[161]++;
      if (visit25_161_1(script.readyState === 'interactive')) {
        _$jscoverage['/combo-loader.js'].lineData[162]++;
        re = script;
        _$jscoverage['/combo-loader.js'].lineData[163]++;
        break;
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[167]++;
    if (visit26_167_1(re)) {
      _$jscoverage['/combo-loader.js'].lineData[168]++;
      name = re.getAttribute('data-mod-name');
    } else {
      _$jscoverage['/combo-loader.js'].lineData[175]++;
      logger.debug('can not find interactive script,time diff : ' + (+new Date() - startLoadModTime));
      _$jscoverage['/combo-loader.js'].lineData[176]++;
      logger.debug('old_ie get mod name from cache : ' + startLoadModName);
      _$jscoverage['/combo-loader.js'].lineData[177]++;
      name = startLoadModName;
    }
    _$jscoverage['/combo-loader.js'].lineData[179]++;
    return name;
  }
  _$jscoverage['/combo-loader.js'].lineData[182]++;
  var debugRemoteModules;
  _$jscoverage['/combo-loader.js'].lineData[184]++;
  if (visit27_184_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[185]++;
    debugRemoteModules = function(rss) {
  _$jscoverage['/combo-loader.js'].functionData[10]++;
  _$jscoverage['/combo-loader.js'].lineData[186]++;
  each(rss, function(rs) {
  _$jscoverage['/combo-loader.js'].functionData[11]++;
  _$jscoverage['/combo-loader.js'].lineData[187]++;
  var ms = [];
  _$jscoverage['/combo-loader.js'].lineData[188]++;
  each(rs.mods, function(m) {
  _$jscoverage['/combo-loader.js'].functionData[12]++;
  _$jscoverage['/combo-loader.js'].lineData[189]++;
  if (visit28_189_1(m.status === LOADED)) {
    _$jscoverage['/combo-loader.js'].lineData[190]++;
    ms.push(m.name);
  }
});
  _$jscoverage['/combo-loader.js'].lineData[193]++;
  if (visit29_193_1(ms.length)) {
    _$jscoverage['/combo-loader.js'].lineData[194]++;
    logger.info('load remote modules: "' + ms.join(', ') + '" from: "' + rs.url + '"');
  }
});
};
  }
  _$jscoverage['/combo-loader.js'].lineData[200]++;
  function getCommonPrefix(str1, str2) {
    _$jscoverage['/combo-loader.js'].functionData[13]++;
    _$jscoverage['/combo-loader.js'].lineData[203]++;
    var prefix = str1.substring(0, str1.indexOf('//') + 2);
    _$jscoverage['/combo-loader.js'].lineData[204]++;
    str1 = str1.substring(prefix.length).split(/\//);
    _$jscoverage['/combo-loader.js'].lineData[205]++;
    str2 = str2.substring(prefix.length).split(/\//);
    _$jscoverage['/combo-loader.js'].lineData[206]++;
    var l = Math.min(str1.length, str2.length);
    _$jscoverage['/combo-loader.js'].lineData[207]++;
    for (var i = 0; visit30_207_1(i < l); i++) {
      _$jscoverage['/combo-loader.js'].lineData[208]++;
      if (visit31_208_1(str1[i] !== str2[i])) {
        _$jscoverage['/combo-loader.js'].lineData[209]++;
        break;
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[212]++;
    return prefix + str1.slice(0, i).join('/') + '/';
  }
  _$jscoverage['/combo-loader.js'].lineData[215]++;
  Utils.mix(ComboLoader.prototype, {
  use: function(normalizedModNames) {
  _$jscoverage['/combo-loader.js'].functionData[14]++;
  _$jscoverage['/combo-loader.js'].lineData[220]++;
  var self = this, allMods, comboUrls, timeout = Config.timeout;
  _$jscoverage['/combo-loader.js'].lineData[224]++;
  allMods = self.calculate(normalizedModNames);
  _$jscoverage['/combo-loader.js'].lineData[226]++;
  comboUrls = self.getComboUrls(allMods);
  _$jscoverage['/combo-loader.js'].lineData[229]++;
  if (visit32_229_1(comboUrls.css)) {
    _$jscoverage['/combo-loader.js'].lineData[230]++;
    loadScripts(comboUrls.css, function(success, error) {
  _$jscoverage['/combo-loader.js'].functionData[15]++;
  _$jscoverage['/combo-loader.js'].lineData[231]++;
  if (visit33_231_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[232]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/combo-loader.js'].lineData[235]++;
  each(success, function(one) {
  _$jscoverage['/combo-loader.js'].functionData[16]++;
  _$jscoverage['/combo-loader.js'].lineData[236]++;
  each(one.mods, function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[17]++;
  _$jscoverage['/combo-loader.js'].lineData[237]++;
  Utils.registerModule(mod.name, Utils.noop);
  _$jscoverage['/combo-loader.js'].lineData[239]++;
  mod.flush();
});
});
  _$jscoverage['/combo-loader.js'].lineData[243]++;
  each(error, function(one) {
  _$jscoverage['/combo-loader.js'].functionData[18]++;
  _$jscoverage['/combo-loader.js'].lineData[244]++;
  each(one.mods, function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[19]++;
  _$jscoverage['/combo-loader.js'].lineData[245]++;
  var msg = mod.name + ' is not loaded! can not find module in url : ' + one.url;
  _$jscoverage['/combo-loader.js'].lineData[246]++;
  S.log(msg, 'error');
  _$jscoverage['/combo-loader.js'].lineData[247]++;
  mod.status = ERROR;
  _$jscoverage['/combo-loader.js'].lineData[249]++;
  mod.flush();
});
});
}, timeout);
  }
  _$jscoverage['/combo-loader.js'].lineData[256]++;
  if (visit34_256_1(comboUrls.js)) {
    _$jscoverage['/combo-loader.js'].lineData[257]++;
    loadScripts(comboUrls.js, function(success) {
  _$jscoverage['/combo-loader.js'].functionData[20]++;
  _$jscoverage['/combo-loader.js'].lineData[258]++;
  if (visit35_258_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[259]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/combo-loader.js'].lineData[262]++;
  each(comboUrls.js, function(one) {
  _$jscoverage['/combo-loader.js'].functionData[21]++;
  _$jscoverage['/combo-loader.js'].lineData[263]++;
  each(one.mods, function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[22]++;
  _$jscoverage['/combo-loader.js'].lineData[266]++;
  if (visit36_266_1(!mod.factory)) {
    _$jscoverage['/combo-loader.js'].lineData[267]++;
    var msg = mod.name + ' is not loaded! can not find module in url : ' + one.url;
    _$jscoverage['/combo-loader.js'].lineData[270]++;
    S.log(msg, 'error');
    _$jscoverage['/combo-loader.js'].lineData[271]++;
    mod.status = ERROR;
  }
  _$jscoverage['/combo-loader.js'].lineData[274]++;
  mod.flush();
});
});
}, timeout);
  }
}, 
  calculate: function(modNames, cache, ret) {
  _$jscoverage['/combo-loader.js'].functionData[23]++;
  _$jscoverage['/combo-loader.js'].lineData[285]++;
  var i, m, mod, modStatus, self = this;
  _$jscoverage['/combo-loader.js'].lineData[288]++;
  ret = visit37_288_1(ret || []);
  _$jscoverage['/combo-loader.js'].lineData[291]++;
  cache = visit38_291_1(cache || {});
  _$jscoverage['/combo-loader.js'].lineData[293]++;
  for (i = 0; visit39_293_1(i < modNames.length); i++) {
    _$jscoverage['/combo-loader.js'].lineData[294]++;
    m = modNames[i];
    _$jscoverage['/combo-loader.js'].lineData[295]++;
    if (visit40_295_1(cache[m])) {
      _$jscoverage['/combo-loader.js'].lineData[296]++;
      continue;
    }
    _$jscoverage['/combo-loader.js'].lineData[298]++;
    cache[m] = 1;
    _$jscoverage['/combo-loader.js'].lineData[299]++;
    mod = Utils.createModuleInfo(m);
    _$jscoverage['/combo-loader.js'].lineData[300]++;
    modStatus = mod.status;
    _$jscoverage['/combo-loader.js'].lineData[301]++;
    if (visit41_301_1(modStatus >= READY_TO_ATTACH)) {
      _$jscoverage['/combo-loader.js'].lineData[302]++;
      continue;
    }
    _$jscoverage['/combo-loader.js'].lineData[304]++;
    if (visit42_304_1(modStatus !== LOADED)) {
      _$jscoverage['/combo-loader.js'].lineData[305]++;
      if (visit43_305_1(!mod.contains(self))) {
        _$jscoverage['/combo-loader.js'].lineData[306]++;
        if (visit44_306_1(modStatus !== LOADING)) {
          _$jscoverage['/combo-loader.js'].lineData[307]++;
          mod.status = LOADING;
          _$jscoverage['/combo-loader.js'].lineData[308]++;
          ret.push(mod);
        }
        _$jscoverage['/combo-loader.js'].lineData[310]++;
        mod.add(self);
        _$jscoverage['/combo-loader.js'].lineData[311]++;
        self.wait(mod);
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[314]++;
    self.calculate(mod.getNormalizedRequires(), cache, ret);
  }
  _$jscoverage['/combo-loader.js'].lineData[317]++;
  return ret;
}, 
  getComboMods: function(mods) {
  _$jscoverage['/combo-loader.js'].functionData[24]++;
  _$jscoverage['/combo-loader.js'].lineData[324]++;
  var i, l = mods.length, tmpMods, mod, packageInfo, type, tag, charset, packageBase, packageName, group, modUrl;
  _$jscoverage['/combo-loader.js'].lineData[328]++;
  var groups = {};
  _$jscoverage['/combo-loader.js'].lineData[337]++;
  var normals = {};
  _$jscoverage['/combo-loader.js'].lineData[344]++;
  for (i = 0; visit45_344_1(i < l); ++i) {
    _$jscoverage['/combo-loader.js'].lineData[345]++;
    mod = mods[i];
    _$jscoverage['/combo-loader.js'].lineData[346]++;
    type = mod.getType();
    _$jscoverage['/combo-loader.js'].lineData[347]++;
    modUrl = mod.getUrl();
    _$jscoverage['/combo-loader.js'].lineData[348]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/combo-loader.js'].lineData[349]++;
    packageBase = packageInfo.getBase();
    _$jscoverage['/combo-loader.js'].lineData[350]++;
    packageName = packageInfo.name;
    _$jscoverage['/combo-loader.js'].lineData[351]++;
    charset = packageInfo.getCharset();
    _$jscoverage['/combo-loader.js'].lineData[352]++;
    tag = packageInfo.getTag();
    _$jscoverage['/combo-loader.js'].lineData[353]++;
    group = packageInfo.getGroup();
    _$jscoverage['/combo-loader.js'].lineData[355]++;
    if (visit46_355_1(packageInfo.isCombine() && group)) {
      _$jscoverage['/combo-loader.js'].lineData[356]++;
      var typeGroups = visit47_356_1(groups[type] || (groups[type] = {}));
      _$jscoverage['/combo-loader.js'].lineData[357]++;
      group = group + '-' + charset;
      _$jscoverage['/combo-loader.js'].lineData[358]++;
      var typeGroup = visit48_358_1(typeGroups[group] || (typeGroups[group] = {}));
      _$jscoverage['/combo-loader.js'].lineData[359]++;
      var find = 0;
      _$jscoverage['/combo-loader.js'].lineData[361]++;
      Utils.each(typeGroup, function(tmpMods, prefix) {
  _$jscoverage['/combo-loader.js'].functionData[25]++;
  _$jscoverage['/combo-loader.js'].lineData[362]++;
  if (visit49_362_1(Utils.isSameOriginAs(prefix, packageBase))) {
    _$jscoverage['/combo-loader.js'].lineData[363]++;
    var newPrefix = getCommonPrefix(prefix, packageBase);
    _$jscoverage['/combo-loader.js'].lineData[364]++;
    tmpMods.push(mod);
    _$jscoverage['/combo-loader.js'].lineData[365]++;
    if (visit50_365_1(tag && visit51_365_2(tag !== tmpMods.tag))) {
      _$jscoverage['/combo-loader.js'].lineData[366]++;
      tmpMods.tag = getHash(tmpMods.tag + tag);
    }
    _$jscoverage['/combo-loader.js'].lineData[368]++;
    delete typeGroup[prefix];
    _$jscoverage['/combo-loader.js'].lineData[369]++;
    typeGroup[newPrefix] = tmpMods;
    _$jscoverage['/combo-loader.js'].lineData[370]++;
    find = 1;
  }
});
      _$jscoverage['/combo-loader.js'].lineData[373]++;
      if (visit52_373_1(!find)) {
        _$jscoverage['/combo-loader.js'].lineData[374]++;
        tmpMods = typeGroup[packageBase] = [mod];
        _$jscoverage['/combo-loader.js'].lineData[375]++;
        tmpMods.charset = charset;
        _$jscoverage['/combo-loader.js'].lineData[376]++;
        tmpMods.tag = visit53_376_1(tag || '');
      }
    } else {
      _$jscoverage['/combo-loader.js'].lineData[379]++;
      var normalTypes = visit54_379_1(normals[type] || (normals[type] = {}));
      _$jscoverage['/combo-loader.js'].lineData[380]++;
      if (visit55_380_1(!(tmpMods = normalTypes[packageBase]))) {
        _$jscoverage['/combo-loader.js'].lineData[381]++;
        tmpMods = normalTypes[packageBase] = [];
        _$jscoverage['/combo-loader.js'].lineData[382]++;
        tmpMods.charset = charset;
        _$jscoverage['/combo-loader.js'].lineData[383]++;
        tmpMods.tag = visit56_383_1(tag || '');
      } else {
        _$jscoverage['/combo-loader.js'].lineData[385]++;
        if (visit57_385_1(tag && visit58_385_2(tag !== tmpMods.tag))) {
          _$jscoverage['/combo-loader.js'].lineData[386]++;
          tmpMods.tag = getHash(tmpMods.tag + tag);
        }
      }
      _$jscoverage['/combo-loader.js'].lineData[389]++;
      tmpMods.push(mod);
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[394]++;
  return {
  groups: groups, 
  normals: normals};
}, 
  getComboUrls: function(mods) {
  _$jscoverage['/combo-loader.js'].functionData[26]++;
  _$jscoverage['/combo-loader.js'].lineData[404]++;
  var comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/combo-loader.js'].lineData[409]++;
  var comboMods = this.getComboMods(mods);
  _$jscoverage['/combo-loader.js'].lineData[411]++;
  var comboRes = {};
  _$jscoverage['/combo-loader.js'].lineData[413]++;
  function processSamePrefixUrlMods(type, basePrefix, sendMods) {
    _$jscoverage['/combo-loader.js'].functionData[27]++;
    _$jscoverage['/combo-loader.js'].lineData[414]++;
    var currentComboUrls = [];
    _$jscoverage['/combo-loader.js'].lineData[415]++;
    var currentComboMods = [];
    _$jscoverage['/combo-loader.js'].lineData[416]++;
    var tag = sendMods.tag;
    _$jscoverage['/combo-loader.js'].lineData[417]++;
    var charset = sendMods.charset;
    _$jscoverage['/combo-loader.js'].lineData[418]++;
    var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''), suffixLength = suffix.length;
    _$jscoverage['/combo-loader.js'].lineData[421]++;
    var baseLen = basePrefix.length, prefix = basePrefix + comboPrefix, res = [];
    _$jscoverage['/combo-loader.js'].lineData[425]++;
    var l = prefix.length;
    _$jscoverage['/combo-loader.js'].lineData[428]++;
    var pushComboUrl = function() {
  _$jscoverage['/combo-loader.js'].functionData[28]++;
  _$jscoverage['/combo-loader.js'].lineData[430]++;
  res.push({
  combine: 1, 
  url: prefix + currentComboUrls.join(comboSep) + suffix, 
  charset: charset, 
  mods: currentComboMods});
};
    _$jscoverage['/combo-loader.js'].lineData[438]++;
    for (var i = 0; visit59_438_1(i < sendMods.length); i++) {
      _$jscoverage['/combo-loader.js'].lineData[439]++;
      var currentMod = sendMods[i];
      _$jscoverage['/combo-loader.js'].lineData[440]++;
      var url = currentMod.getUrl();
      _$jscoverage['/combo-loader.js'].lineData[441]++;
      if (visit60_441_1(!currentMod.getPackage().isCombine() || !Utils.startsWith(url, basePrefix))) {
        _$jscoverage['/combo-loader.js'].lineData[444]++;
        res.push({
  combine: 0, 
  url: url, 
  charset: charset, 
  mods: [currentMod]});
        _$jscoverage['/combo-loader.js'].lineData[450]++;
        continue;
      }
      _$jscoverage['/combo-loader.js'].lineData[453]++;
      var subPath = url.slice(baseLen).replace(/\?.*$/, '');
      _$jscoverage['/combo-loader.js'].lineData[454]++;
      currentComboUrls.push(subPath);
      _$jscoverage['/combo-loader.js'].lineData[455]++;
      currentComboMods.push(currentMod);
      _$jscoverage['/combo-loader.js'].lineData[457]++;
      if (visit61_457_1(visit62_457_2(currentComboUrls.length > maxFileNum) || (visit63_458_1(l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)))) {
        _$jscoverage['/combo-loader.js'].lineData[459]++;
        currentComboUrls.pop();
        _$jscoverage['/combo-loader.js'].lineData[460]++;
        currentComboMods.pop();
        _$jscoverage['/combo-loader.js'].lineData[461]++;
        pushComboUrl();
        _$jscoverage['/combo-loader.js'].lineData[462]++;
        currentComboUrls = [];
        _$jscoverage['/combo-loader.js'].lineData[463]++;
        currentComboMods = [];
        _$jscoverage['/combo-loader.js'].lineData[464]++;
        i--;
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[467]++;
    if (visit64_467_1(currentComboUrls.length)) {
      _$jscoverage['/combo-loader.js'].lineData[468]++;
      pushComboUrl();
    }
    _$jscoverage['/combo-loader.js'].lineData[471]++;
    comboRes[type].push.apply(comboRes[type], res);
  }
  _$jscoverage['/combo-loader.js'].lineData[474]++;
  var type, prefix;
  _$jscoverage['/combo-loader.js'].lineData[475]++;
  var normals = comboMods.normals;
  _$jscoverage['/combo-loader.js'].lineData[476]++;
  var groups = comboMods.groups;
  _$jscoverage['/combo-loader.js'].lineData[477]++;
  var group;
  _$jscoverage['/combo-loader.js'].lineData[480]++;
  for (type in normals) {
    _$jscoverage['/combo-loader.js'].lineData[481]++;
    comboRes[type] = visit65_481_1(comboRes[type] || []);
    _$jscoverage['/combo-loader.js'].lineData[482]++;
    for (prefix in normals[type]) {
      _$jscoverage['/combo-loader.js'].lineData[483]++;
      processSamePrefixUrlMods(type, prefix, normals[type][prefix]);
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[486]++;
  for (type in groups) {
    _$jscoverage['/combo-loader.js'].lineData[487]++;
    comboRes[type] = visit66_487_1(comboRes[type] || []);
    _$jscoverage['/combo-loader.js'].lineData[488]++;
    for (group in groups[type]) {
      _$jscoverage['/combo-loader.js'].lineData[489]++;
      for (prefix in groups[type][group]) {
        _$jscoverage['/combo-loader.js'].lineData[490]++;
        processSamePrefixUrlMods(type, prefix, groups[type][group][prefix]);
      }
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[494]++;
  return comboRes;
}, 
  flush: function() {
  _$jscoverage['/combo-loader.js'].functionData[29]++;
  _$jscoverage['/combo-loader.js'].lineData[498]++;
  if (visit67_498_1(!this.callback)) {
    _$jscoverage['/combo-loader.js'].lineData[499]++;
    return;
  }
  _$jscoverage['/combo-loader.js'].lineData[501]++;
  var self = this, head = self.head, callback = self.callback;
  _$jscoverage['/combo-loader.js'].lineData[504]++;
  while (head) {
    _$jscoverage['/combo-loader.js'].lineData[505]++;
    var node = head.node, status = node.status;
    _$jscoverage['/combo-loader.js'].lineData[507]++;
    if (visit68_507_1(visit69_507_2(status >= Status.LOADED) || visit70_507_3(status === Status.ERROR))) {
      _$jscoverage['/combo-loader.js'].lineData[508]++;
      node.remove(self);
      _$jscoverage['/combo-loader.js'].lineData[509]++;
      head = self.head = head.next;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[511]++;
      return;
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[514]++;
  self.callback = null;
  _$jscoverage['/combo-loader.js'].lineData[515]++;
  callback();
}, 
  wait: function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[30]++;
  _$jscoverage['/combo-loader.js'].lineData[519]++;
  var self = this;
  _$jscoverage['/combo-loader.js'].lineData[520]++;
  if (visit71_520_1(!self.head)) {
    _$jscoverage['/combo-loader.js'].lineData[521]++;
    self.tail = self.head = {
  node: mod};
  } else {
    _$jscoverage['/combo-loader.js'].lineData[525]++;
    var newNode = {
  node: mod};
    _$jscoverage['/combo-loader.js'].lineData[528]++;
    self.tail.next = newNode;
    _$jscoverage['/combo-loader.js'].lineData[529]++;
    self.tail = newNode;
  }
}});
  _$jscoverage['/combo-loader.js'].lineData[534]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
