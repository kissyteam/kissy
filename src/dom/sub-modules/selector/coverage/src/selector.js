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
if (! _$jscoverage['/selector.js']) {
  _$jscoverage['/selector.js'] = {};
  _$jscoverage['/selector.js'].lineData = [];
  _$jscoverage['/selector.js'].lineData[6] = 0;
  _$jscoverage['/selector.js'].lineData[7] = 0;
  _$jscoverage['/selector.js'].lineData[8] = 0;
  _$jscoverage['/selector.js'].lineData[9] = 0;
  _$jscoverage['/selector.js'].lineData[10] = 0;
  _$jscoverage['/selector.js'].lineData[14] = 0;
  _$jscoverage['/selector.js'].lineData[21] = 0;
  _$jscoverage['/selector.js'].lineData[22] = 0;
  _$jscoverage['/selector.js'].lineData[24] = 0;
  _$jscoverage['/selector.js'].lineData[32] = 0;
  _$jscoverage['/selector.js'].lineData[34] = 0;
  _$jscoverage['/selector.js'].lineData[36] = 0;
  _$jscoverage['/selector.js'].lineData[45] = 0;
  _$jscoverage['/selector.js'].lineData[46] = 0;
  _$jscoverage['/selector.js'].lineData[49] = 0;
  _$jscoverage['/selector.js'].lineData[52] = 0;
  _$jscoverage['/selector.js'].lineData[56] = 0;
  _$jscoverage['/selector.js'].lineData[57] = 0;
  _$jscoverage['/selector.js'].lineData[60] = 0;
  _$jscoverage['/selector.js'].lineData[61] = 0;
  _$jscoverage['/selector.js'].lineData[62] = 0;
  _$jscoverage['/selector.js'].lineData[64] = 0;
  _$jscoverage['/selector.js'].lineData[67] = 0;
  _$jscoverage['/selector.js'].lineData[68] = 0;
  _$jscoverage['/selector.js'].lineData[71] = 0;
  _$jscoverage['/selector.js'].lineData[72] = 0;
  _$jscoverage['/selector.js'].lineData[73] = 0;
  _$jscoverage['/selector.js'].lineData[74] = 0;
  _$jscoverage['/selector.js'].lineData[75] = 0;
  _$jscoverage['/selector.js'].lineData[76] = 0;
  _$jscoverage['/selector.js'].lineData[77] = 0;
  _$jscoverage['/selector.js'].lineData[78] = 0;
  _$jscoverage['/selector.js'].lineData[79] = 0;
  _$jscoverage['/selector.js'].lineData[80] = 0;
  _$jscoverage['/selector.js'].lineData[81] = 0;
  _$jscoverage['/selector.js'].lineData[82] = 0;
  _$jscoverage['/selector.js'].lineData[83] = 0;
  _$jscoverage['/selector.js'].lineData[84] = 0;
  _$jscoverage['/selector.js'].lineData[86] = 0;
  _$jscoverage['/selector.js'].lineData[90] = 0;
  _$jscoverage['/selector.js'].lineData[92] = 0;
  _$jscoverage['/selector.js'].lineData[94] = 0;
  _$jscoverage['/selector.js'].lineData[100] = 0;
  _$jscoverage['/selector.js'].lineData[101] = 0;
  _$jscoverage['/selector.js'].lineData[102] = 0;
  _$jscoverage['/selector.js'].lineData[103] = 0;
  _$jscoverage['/selector.js'].lineData[106] = 0;
  _$jscoverage['/selector.js'].lineData[107] = 0;
  _$jscoverage['/selector.js'].lineData[110] = 0;
  _$jscoverage['/selector.js'].lineData[113] = 0;
  _$jscoverage['/selector.js'].lineData[114] = 0;
  _$jscoverage['/selector.js'].lineData[115] = 0;
  _$jscoverage['/selector.js'].lineData[118] = 0;
  _$jscoverage['/selector.js'].lineData[120] = 0;
  _$jscoverage['/selector.js'].lineData[123] = 0;
  _$jscoverage['/selector.js'].lineData[124] = 0;
  _$jscoverage['/selector.js'].lineData[126] = 0;
  _$jscoverage['/selector.js'].lineData[128] = 0;
  _$jscoverage['/selector.js'].lineData[129] = 0;
  _$jscoverage['/selector.js'].lineData[134] = 0;
  _$jscoverage['/selector.js'].lineData[135] = 0;
  _$jscoverage['/selector.js'].lineData[136] = 0;
  _$jscoverage['/selector.js'].lineData[137] = 0;
  _$jscoverage['/selector.js'].lineData[138] = 0;
  _$jscoverage['/selector.js'].lineData[139] = 0;
  _$jscoverage['/selector.js'].lineData[140] = 0;
  _$jscoverage['/selector.js'].lineData[145] = 0;
  _$jscoverage['/selector.js'].lineData[148] = 0;
  _$jscoverage['/selector.js'].lineData[151] = 0;
  _$jscoverage['/selector.js'].lineData[152] = 0;
  _$jscoverage['/selector.js'].lineData[154] = 0;
  _$jscoverage['/selector.js'].lineData[156] = 0;
  _$jscoverage['/selector.js'].lineData[157] = 0;
  _$jscoverage['/selector.js'].lineData[162] = 0;
  _$jscoverage['/selector.js'].lineData[163] = 0;
  _$jscoverage['/selector.js'].lineData[164] = 0;
  _$jscoverage['/selector.js'].lineData[165] = 0;
  _$jscoverage['/selector.js'].lineData[166] = 0;
  _$jscoverage['/selector.js'].lineData[167] = 0;
  _$jscoverage['/selector.js'].lineData[168] = 0;
  _$jscoverage['/selector.js'].lineData[173] = 0;
  _$jscoverage['/selector.js'].lineData[176] = 0;
  _$jscoverage['/selector.js'].lineData[179] = 0;
  _$jscoverage['/selector.js'].lineData[180] = 0;
  _$jscoverage['/selector.js'].lineData[182] = 0;
  _$jscoverage['/selector.js'].lineData[184] = 0;
  _$jscoverage['/selector.js'].lineData[185] = 0;
  _$jscoverage['/selector.js'].lineData[191] = 0;
  _$jscoverage['/selector.js'].lineData[192] = 0;
  _$jscoverage['/selector.js'].lineData[193] = 0;
  _$jscoverage['/selector.js'].lineData[194] = 0;
  _$jscoverage['/selector.js'].lineData[195] = 0;
  _$jscoverage['/selector.js'].lineData[196] = 0;
  _$jscoverage['/selector.js'].lineData[197] = 0;
  _$jscoverage['/selector.js'].lineData[202] = 0;
  _$jscoverage['/selector.js'].lineData[205] = 0;
  _$jscoverage['/selector.js'].lineData[208] = 0;
  _$jscoverage['/selector.js'].lineData[209] = 0;
  _$jscoverage['/selector.js'].lineData[211] = 0;
  _$jscoverage['/selector.js'].lineData[213] = 0;
  _$jscoverage['/selector.js'].lineData[214] = 0;
  _$jscoverage['/selector.js'].lineData[220] = 0;
  _$jscoverage['/selector.js'].lineData[221] = 0;
  _$jscoverage['/selector.js'].lineData[222] = 0;
  _$jscoverage['/selector.js'].lineData[223] = 0;
  _$jscoverage['/selector.js'].lineData[224] = 0;
  _$jscoverage['/selector.js'].lineData[225] = 0;
  _$jscoverage['/selector.js'].lineData[226] = 0;
  _$jscoverage['/selector.js'].lineData[231] = 0;
  _$jscoverage['/selector.js'].lineData[234] = 0;
  _$jscoverage['/selector.js'].lineData[235] = 0;
  _$jscoverage['/selector.js'].lineData[236] = 0;
  _$jscoverage['/selector.js'].lineData[237] = 0;
  _$jscoverage['/selector.js'].lineData[240] = 0;
  _$jscoverage['/selector.js'].lineData[241] = 0;
  _$jscoverage['/selector.js'].lineData[244] = 0;
  _$jscoverage['/selector.js'].lineData[247] = 0;
  _$jscoverage['/selector.js'].lineData[251] = 0;
  _$jscoverage['/selector.js'].lineData[253] = 0;
  _$jscoverage['/selector.js'].lineData[258] = 0;
  _$jscoverage['/selector.js'].lineData[259] = 0;
  _$jscoverage['/selector.js'].lineData[260] = 0;
  _$jscoverage['/selector.js'].lineData[264] = 0;
  _$jscoverage['/selector.js'].lineData[265] = 0;
  _$jscoverage['/selector.js'].lineData[268] = 0;
  _$jscoverage['/selector.js'].lineData[271] = 0;
  _$jscoverage['/selector.js'].lineData[275] = 0;
  _$jscoverage['/selector.js'].lineData[278] = 0;
  _$jscoverage['/selector.js'].lineData[281] = 0;
  _$jscoverage['/selector.js'].lineData[284] = 0;
  _$jscoverage['/selector.js'].lineData[287] = 0;
  _$jscoverage['/selector.js'].lineData[291] = 0;
  _$jscoverage['/selector.js'].lineData[295] = 0;
  _$jscoverage['/selector.js'].lineData[296] = 0;
  _$jscoverage['/selector.js'].lineData[300] = 0;
  _$jscoverage['/selector.js'].lineData[301] = 0;
  _$jscoverage['/selector.js'].lineData[304] = 0;
  _$jscoverage['/selector.js'].lineData[307] = 0;
  _$jscoverage['/selector.js'].lineData[310] = 0;
  _$jscoverage['/selector.js'].lineData[311] = 0;
  _$jscoverage['/selector.js'].lineData[316] = 0;
  _$jscoverage['/selector.js'].lineData[318] = 0;
  _$jscoverage['/selector.js'].lineData[319] = 0;
  _$jscoverage['/selector.js'].lineData[321] = 0;
  _$jscoverage['/selector.js'].lineData[324] = 0;
  _$jscoverage['/selector.js'].lineData[327] = 0;
  _$jscoverage['/selector.js'].lineData[330] = 0;
  _$jscoverage['/selector.js'].lineData[333] = 0;
  _$jscoverage['/selector.js'].lineData[336] = 0;
  _$jscoverage['/selector.js'].lineData[340] = 0;
  _$jscoverage['/selector.js'].lineData[344] = 0;
  _$jscoverage['/selector.js'].lineData[347] = 0;
  _$jscoverage['/selector.js'].lineData[348] = 0;
  _$jscoverage['/selector.js'].lineData[349] = 0;
  _$jscoverage['/selector.js'].lineData[351] = 0;
  _$jscoverage['/selector.js'].lineData[352] = 0;
  _$jscoverage['/selector.js'].lineData[353] = 0;
  _$jscoverage['/selector.js'].lineData[354] = 0;
  _$jscoverage['/selector.js'].lineData[355] = 0;
  _$jscoverage['/selector.js'].lineData[356] = 0;
  _$jscoverage['/selector.js'].lineData[357] = 0;
  _$jscoverage['/selector.js'].lineData[359] = 0;
  _$jscoverage['/selector.js'].lineData[360] = 0;
  _$jscoverage['/selector.js'].lineData[361] = 0;
  _$jscoverage['/selector.js'].lineData[364] = 0;
  _$jscoverage['/selector.js'].lineData[367] = 0;
  _$jscoverage['/selector.js'].lineData[368] = 0;
  _$jscoverage['/selector.js'].lineData[369] = 0;
  _$jscoverage['/selector.js'].lineData[370] = 0;
  _$jscoverage['/selector.js'].lineData[372] = 0;
  _$jscoverage['/selector.js'].lineData[374] = 0;
  _$jscoverage['/selector.js'].lineData[375] = 0;
  _$jscoverage['/selector.js'].lineData[376] = 0;
  _$jscoverage['/selector.js'].lineData[378] = 0;
  _$jscoverage['/selector.js'].lineData[380] = 0;
  _$jscoverage['/selector.js'].lineData[384] = 0;
  _$jscoverage['/selector.js'].lineData[401] = 0;
  _$jscoverage['/selector.js'].lineData[402] = 0;
  _$jscoverage['/selector.js'].lineData[403] = 0;
  _$jscoverage['/selector.js'].lineData[407] = 0;
  _$jscoverage['/selector.js'].lineData[408] = 0;
  _$jscoverage['/selector.js'].lineData[411] = 0;
  _$jscoverage['/selector.js'].lineData[413] = 0;
  _$jscoverage['/selector.js'].lineData[414] = 0;
  _$jscoverage['/selector.js'].lineData[415] = 0;
  _$jscoverage['/selector.js'].lineData[417] = 0;
  _$jscoverage['/selector.js'].lineData[418] = 0;
  _$jscoverage['/selector.js'].lineData[421] = 0;
  _$jscoverage['/selector.js'].lineData[422] = 0;
  _$jscoverage['/selector.js'].lineData[425] = 0;
  _$jscoverage['/selector.js'].lineData[430] = 0;
  _$jscoverage['/selector.js'].lineData[431] = 0;
  _$jscoverage['/selector.js'].lineData[434] = 0;
  _$jscoverage['/selector.js'].lineData[435] = 0;
  _$jscoverage['/selector.js'].lineData[436] = 0;
  _$jscoverage['/selector.js'].lineData[437] = 0;
  _$jscoverage['/selector.js'].lineData[438] = 0;
  _$jscoverage['/selector.js'].lineData[440] = 0;
  _$jscoverage['/selector.js'].lineData[441] = 0;
  _$jscoverage['/selector.js'].lineData[446] = 0;
  _$jscoverage['/selector.js'].lineData[450] = 0;
  _$jscoverage['/selector.js'].lineData[451] = 0;
  _$jscoverage['/selector.js'].lineData[456] = 0;
  _$jscoverage['/selector.js'].lineData[457] = 0;
  _$jscoverage['/selector.js'].lineData[458] = 0;
  _$jscoverage['/selector.js'].lineData[460] = 0;
  _$jscoverage['/selector.js'].lineData[461] = 0;
  _$jscoverage['/selector.js'].lineData[462] = 0;
  _$jscoverage['/selector.js'].lineData[464] = 0;
  _$jscoverage['/selector.js'].lineData[465] = 0;
  _$jscoverage['/selector.js'].lineData[466] = 0;
  _$jscoverage['/selector.js'].lineData[467] = 0;
  _$jscoverage['/selector.js'].lineData[474] = 0;
  _$jscoverage['/selector.js'].lineData[475] = 0;
  _$jscoverage['/selector.js'].lineData[477] = 0;
  _$jscoverage['/selector.js'].lineData[483] = 0;
  _$jscoverage['/selector.js'].lineData[492] = 0;
  _$jscoverage['/selector.js'].lineData[499] = 0;
  _$jscoverage['/selector.js'].lineData[500] = 0;
  _$jscoverage['/selector.js'].lineData[503] = 0;
  _$jscoverage['/selector.js'].lineData[504] = 0;
  _$jscoverage['/selector.js'].lineData[505] = 0;
  _$jscoverage['/selector.js'].lineData[507] = 0;
  _$jscoverage['/selector.js'].lineData[508] = 0;
  _$jscoverage['/selector.js'].lineData[509] = 0;
  _$jscoverage['/selector.js'].lineData[511] = 0;
  _$jscoverage['/selector.js'].lineData[512] = 0;
  _$jscoverage['/selector.js'].lineData[514] = 0;
  _$jscoverage['/selector.js'].lineData[515] = 0;
  _$jscoverage['/selector.js'].lineData[517] = 0;
  _$jscoverage['/selector.js'].lineData[523] = 0;
  _$jscoverage['/selector.js'].lineData[524] = 0;
  _$jscoverage['/selector.js'].lineData[526] = 0;
  _$jscoverage['/selector.js'].lineData[527] = 0;
  _$jscoverage['/selector.js'].lineData[528] = 0;
  _$jscoverage['/selector.js'].lineData[531] = 0;
  _$jscoverage['/selector.js'].lineData[532] = 0;
  _$jscoverage['/selector.js'].lineData[536] = 0;
  _$jscoverage['/selector.js'].lineData[539] = 0;
  _$jscoverage['/selector.js'].lineData[540] = 0;
  _$jscoverage['/selector.js'].lineData[542] = 0;
  _$jscoverage['/selector.js'].lineData[543] = 0;
  _$jscoverage['/selector.js'].lineData[544] = 0;
  _$jscoverage['/selector.js'].lineData[546] = 0;
  _$jscoverage['/selector.js'].lineData[547] = 0;
  _$jscoverage['/selector.js'].lineData[552] = 0;
  _$jscoverage['/selector.js'].lineData[553] = 0;
  _$jscoverage['/selector.js'].lineData[554] = 0;
  _$jscoverage['/selector.js'].lineData[555] = 0;
  _$jscoverage['/selector.js'].lineData[557] = 0;
  _$jscoverage['/selector.js'].lineData[558] = 0;
  _$jscoverage['/selector.js'].lineData[559] = 0;
  _$jscoverage['/selector.js'].lineData[560] = 0;
  _$jscoverage['/selector.js'].lineData[561] = 0;
  _$jscoverage['/selector.js'].lineData[563] = 0;
  _$jscoverage['/selector.js'].lineData[565] = 0;
  _$jscoverage['/selector.js'].lineData[569] = 0;
  _$jscoverage['/selector.js'].lineData[570] = 0;
  _$jscoverage['/selector.js'].lineData[571] = 0;
  _$jscoverage['/selector.js'].lineData[574] = 0;
  _$jscoverage['/selector.js'].lineData[581] = 0;
  _$jscoverage['/selector.js'].lineData[582] = 0;
  _$jscoverage['/selector.js'].lineData[585] = 0;
  _$jscoverage['/selector.js'].lineData[587] = 0;
  _$jscoverage['/selector.js'].lineData[589] = 0;
  _$jscoverage['/selector.js'].lineData[591] = 0;
  _$jscoverage['/selector.js'].lineData[592] = 0;
  _$jscoverage['/selector.js'].lineData[594] = 0;
  _$jscoverage['/selector.js'].lineData[596] = 0;
  _$jscoverage['/selector.js'].lineData[604] = 0;
  _$jscoverage['/selector.js'].lineData[605] = 0;
  _$jscoverage['/selector.js'].lineData[606] = 0;
  _$jscoverage['/selector.js'].lineData[607] = 0;
  _$jscoverage['/selector.js'].lineData[608] = 0;
  _$jscoverage['/selector.js'].lineData[609] = 0;
  _$jscoverage['/selector.js'].lineData[610] = 0;
  _$jscoverage['/selector.js'].lineData[611] = 0;
  _$jscoverage['/selector.js'].lineData[612] = 0;
  _$jscoverage['/selector.js'].lineData[617] = 0;
  _$jscoverage['/selector.js'].lineData[619] = 0;
  _$jscoverage['/selector.js'].lineData[628] = 0;
  _$jscoverage['/selector.js'].lineData[629] = 0;
  _$jscoverage['/selector.js'].lineData[632] = 0;
  _$jscoverage['/selector.js'].lineData[633] = 0;
  _$jscoverage['/selector.js'].lineData[634] = 0;
  _$jscoverage['/selector.js'].lineData[635] = 0;
  _$jscoverage['/selector.js'].lineData[636] = 0;
  _$jscoverage['/selector.js'].lineData[639] = 0;
  _$jscoverage['/selector.js'].lineData[640] = 0;
  _$jscoverage['/selector.js'].lineData[643] = 0;
  _$jscoverage['/selector.js'].lineData[644] = 0;
  _$jscoverage['/selector.js'].lineData[646] = 0;
  _$jscoverage['/selector.js'].lineData[649] = 0;
  _$jscoverage['/selector.js'].lineData[653] = 0;
  _$jscoverage['/selector.js'].lineData[654] = 0;
  _$jscoverage['/selector.js'].lineData[656] = 0;
  _$jscoverage['/selector.js'].lineData[657] = 0;
  _$jscoverage['/selector.js'].lineData[660] = 0;
  _$jscoverage['/selector.js'].lineData[661] = 0;
  _$jscoverage['/selector.js'].lineData[662] = 0;
  _$jscoverage['/selector.js'].lineData[663] = 0;
  _$jscoverage['/selector.js'].lineData[664] = 0;
  _$jscoverage['/selector.js'].lineData[665] = 0;
  _$jscoverage['/selector.js'].lineData[666] = 0;
  _$jscoverage['/selector.js'].lineData[667] = 0;
  _$jscoverage['/selector.js'].lineData[673] = 0;
  _$jscoverage['/selector.js'].lineData[674] = 0;
  _$jscoverage['/selector.js'].lineData[677] = 0;
  _$jscoverage['/selector.js'].lineData[680] = 0;
  _$jscoverage['/selector.js'].lineData[682] = 0;
  _$jscoverage['/selector.js'].lineData[684] = 0;
}
if (! _$jscoverage['/selector.js'].functionData) {
  _$jscoverage['/selector.js'].functionData = [];
  _$jscoverage['/selector.js'].functionData[0] = 0;
  _$jscoverage['/selector.js'].functionData[1] = 0;
  _$jscoverage['/selector.js'].functionData[2] = 0;
  _$jscoverage['/selector.js'].functionData[3] = 0;
  _$jscoverage['/selector.js'].functionData[4] = 0;
  _$jscoverage['/selector.js'].functionData[5] = 0;
  _$jscoverage['/selector.js'].functionData[6] = 0;
  _$jscoverage['/selector.js'].functionData[7] = 0;
  _$jscoverage['/selector.js'].functionData[8] = 0;
  _$jscoverage['/selector.js'].functionData[9] = 0;
  _$jscoverage['/selector.js'].functionData[10] = 0;
  _$jscoverage['/selector.js'].functionData[11] = 0;
  _$jscoverage['/selector.js'].functionData[12] = 0;
  _$jscoverage['/selector.js'].functionData[13] = 0;
  _$jscoverage['/selector.js'].functionData[14] = 0;
  _$jscoverage['/selector.js'].functionData[15] = 0;
  _$jscoverage['/selector.js'].functionData[16] = 0;
  _$jscoverage['/selector.js'].functionData[17] = 0;
  _$jscoverage['/selector.js'].functionData[18] = 0;
  _$jscoverage['/selector.js'].functionData[19] = 0;
  _$jscoverage['/selector.js'].functionData[20] = 0;
  _$jscoverage['/selector.js'].functionData[21] = 0;
  _$jscoverage['/selector.js'].functionData[22] = 0;
  _$jscoverage['/selector.js'].functionData[23] = 0;
  _$jscoverage['/selector.js'].functionData[24] = 0;
  _$jscoverage['/selector.js'].functionData[25] = 0;
  _$jscoverage['/selector.js'].functionData[26] = 0;
  _$jscoverage['/selector.js'].functionData[27] = 0;
  _$jscoverage['/selector.js'].functionData[28] = 0;
  _$jscoverage['/selector.js'].functionData[29] = 0;
  _$jscoverage['/selector.js'].functionData[30] = 0;
  _$jscoverage['/selector.js'].functionData[31] = 0;
  _$jscoverage['/selector.js'].functionData[32] = 0;
  _$jscoverage['/selector.js'].functionData[33] = 0;
  _$jscoverage['/selector.js'].functionData[34] = 0;
  _$jscoverage['/selector.js'].functionData[35] = 0;
  _$jscoverage['/selector.js'].functionData[36] = 0;
  _$jscoverage['/selector.js'].functionData[37] = 0;
  _$jscoverage['/selector.js'].functionData[38] = 0;
  _$jscoverage['/selector.js'].functionData[39] = 0;
  _$jscoverage['/selector.js'].functionData[40] = 0;
  _$jscoverage['/selector.js'].functionData[41] = 0;
  _$jscoverage['/selector.js'].functionData[42] = 0;
  _$jscoverage['/selector.js'].functionData[43] = 0;
  _$jscoverage['/selector.js'].functionData[44] = 0;
  _$jscoverage['/selector.js'].functionData[45] = 0;
  _$jscoverage['/selector.js'].functionData[46] = 0;
  _$jscoverage['/selector.js'].functionData[47] = 0;
}
if (! _$jscoverage['/selector.js'].branchData) {
  _$jscoverage['/selector.js'].branchData = {};
  _$jscoverage['/selector.js'].branchData['21'] = [];
  _$jscoverage['/selector.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['39'] = [];
  _$jscoverage['/selector.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['63'] = [];
  _$jscoverage['/selector.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['63'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['71'] = [];
  _$jscoverage['/selector.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['73'] = [];
  _$jscoverage['/selector.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['76'] = [];
  _$jscoverage['/selector.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['80'] = [];
  _$jscoverage['/selector.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['82'] = [];
  _$jscoverage['/selector.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['83'] = [];
  _$jscoverage['/selector.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['92'] = [];
  _$jscoverage['/selector.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['101'] = [];
  _$jscoverage['/selector.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['102'] = [];
  _$jscoverage['/selector.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['106'] = [];
  _$jscoverage['/selector.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['106'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['106'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['106'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['114'] = [];
  _$jscoverage['/selector.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['114'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['115'] = [];
  _$jscoverage['/selector.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['123'] = [];
  _$jscoverage['/selector.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['123'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['123'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['128'] = [];
  _$jscoverage['/selector.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['134'] = [];
  _$jscoverage['/selector.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['136'] = [];
  _$jscoverage['/selector.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['138'] = [];
  _$jscoverage['/selector.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['139'] = [];
  _$jscoverage['/selector.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['151'] = [];
  _$jscoverage['/selector.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['151'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['151'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['156'] = [];
  _$jscoverage['/selector.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['162'] = [];
  _$jscoverage['/selector.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['164'] = [];
  _$jscoverage['/selector.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['166'] = [];
  _$jscoverage['/selector.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['167'] = [];
  _$jscoverage['/selector.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['179'] = [];
  _$jscoverage['/selector.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['179'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['179'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['184'] = [];
  _$jscoverage['/selector.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['191'] = [];
  _$jscoverage['/selector.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['193'] = [];
  _$jscoverage['/selector.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['195'] = [];
  _$jscoverage['/selector.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['196'] = [];
  _$jscoverage['/selector.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['208'] = [];
  _$jscoverage['/selector.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['208'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['208'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['213'] = [];
  _$jscoverage['/selector.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['220'] = [];
  _$jscoverage['/selector.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['222'] = [];
  _$jscoverage['/selector.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['224'] = [];
  _$jscoverage['/selector.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['225'] = [];
  _$jscoverage['/selector.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['238'] = [];
  _$jscoverage['/selector.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['241'] = [];
  _$jscoverage['/selector.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['241'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['241'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['243'] = [];
  _$jscoverage['/selector.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['243'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['258'] = [];
  _$jscoverage['/selector.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['264'] = [];
  _$jscoverage['/selector.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['264'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['264'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['264'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['264'][5] = new BranchData();
  _$jscoverage['/selector.js'].branchData['264'][6] = new BranchData();
  _$jscoverage['/selector.js'].branchData['264'][7] = new BranchData();
  _$jscoverage['/selector.js'].branchData['271'] = [];
  _$jscoverage['/selector.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['272'] = [];
  _$jscoverage['/selector.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['287'] = [];
  _$jscoverage['/selector.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['291'] = [];
  _$jscoverage['/selector.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['296'] = [];
  _$jscoverage['/selector.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['296'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['296'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['297'] = [];
  _$jscoverage['/selector.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['297'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['297'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['297'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['297'][5] = new BranchData();
  _$jscoverage['/selector.js'].branchData['301'] = [];
  _$jscoverage['/selector.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['301'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['311'] = [];
  _$jscoverage['/selector.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['311'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['311'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['312'] = [];
  _$jscoverage['/selector.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['312'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['318'] = [];
  _$jscoverage['/selector.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['318'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['321'] = [];
  _$jscoverage['/selector.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['324'] = [];
  _$jscoverage['/selector.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['327'] = [];
  _$jscoverage['/selector.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['330'] = [];
  _$jscoverage['/selector.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['333'] = [];
  _$jscoverage['/selector.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['333'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['336'] = [];
  _$jscoverage['/selector.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['344'] = [];
  _$jscoverage['/selector.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['348'] = [];
  _$jscoverage['/selector.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['353'] = [];
  _$jscoverage['/selector.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['353'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['355'] = [];
  _$jscoverage['/selector.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['356'] = [];
  _$jscoverage['/selector.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['360'] = [];
  _$jscoverage['/selector.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['369'] = [];
  _$jscoverage['/selector.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['375'] = [];
  _$jscoverage['/selector.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['401'] = [];
  _$jscoverage['/selector.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['414'] = [];
  _$jscoverage['/selector.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['417'] = [];
  _$jscoverage['/selector.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['421'] = [];
  _$jscoverage['/selector.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['430'] = [];
  _$jscoverage['/selector.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['434'] = [];
  _$jscoverage['/selector.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['437'] = [];
  _$jscoverage['/selector.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['437'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['440'] = [];
  _$jscoverage['/selector.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['458'] = [];
  _$jscoverage['/selector.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['460'] = [];
  _$jscoverage['/selector.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['461'] = [];
  _$jscoverage['/selector.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['466'] = [];
  _$jscoverage['/selector.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['475'] = [];
  _$jscoverage['/selector.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['484'] = [];
  _$jscoverage['/selector.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['504'] = [];
  _$jscoverage['/selector.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['508'] = [];
  _$jscoverage['/selector.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['513'] = [];
  _$jscoverage['/selector.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['514'] = [];
  _$jscoverage['/selector.js'].branchData['514'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['526'] = [];
  _$jscoverage['/selector.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['527'] = [];
  _$jscoverage['/selector.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['531'] = [];
  _$jscoverage['/selector.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['542'] = [];
  _$jscoverage['/selector.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['543'] = [];
  _$jscoverage['/selector.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['554'] = [];
  _$jscoverage['/selector.js'].branchData['554'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['560'] = [];
  _$jscoverage['/selector.js'].branchData['560'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['570'] = [];
  _$jscoverage['/selector.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['581'] = [];
  _$jscoverage['/selector.js'].branchData['581'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['582'] = [];
  _$jscoverage['/selector.js'].branchData['582'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['585'] = [];
  _$jscoverage['/selector.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['585'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['587'] = [];
  _$jscoverage['/selector.js'].branchData['587'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['591'] = [];
  _$jscoverage['/selector.js'].branchData['591'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['604'] = [];
  _$jscoverage['/selector.js'].branchData['604'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['605'] = [];
  _$jscoverage['/selector.js'].branchData['605'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['608'] = [];
  _$jscoverage['/selector.js'].branchData['608'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['610'] = [];
  _$jscoverage['/selector.js'].branchData['610'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['617'] = [];
  _$jscoverage['/selector.js'].branchData['617'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['628'] = [];
  _$jscoverage['/selector.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['628'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['628'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['628'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['632'] = [];
  _$jscoverage['/selector.js'].branchData['632'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['634'] = [];
  _$jscoverage['/selector.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['639'] = [];
  _$jscoverage['/selector.js'].branchData['639'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['643'] = [];
  _$jscoverage['/selector.js'].branchData['643'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['643'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['643'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['649'] = [];
  _$jscoverage['/selector.js'].branchData['649'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['656'] = [];
  _$jscoverage['/selector.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['660'] = [];
  _$jscoverage['/selector.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['663'] = [];
  _$jscoverage['/selector.js'].branchData['663'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['665'] = [];
  _$jscoverage['/selector.js'].branchData['665'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['666'] = [];
  _$jscoverage['/selector.js'].branchData['666'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['673'] = [];
  _$jscoverage['/selector.js'].branchData['673'][1] = new BranchData();
}
_$jscoverage['/selector.js'].branchData['673'][1].init(3792, 12, 'groupLen > 1');
function visit193_673_1(result) {
  _$jscoverage['/selector.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['666'][1].init(26, 39, 'matchSub(matchHead.el, matchHead.match)');
function visit192_666_1(result) {
  _$jscoverage['/selector.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['665'][1].init(229, 9, 'matchHead');
function visit191_665_1(result) {
  _$jscoverage['/selector.js'].branchData['665'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['663'][1].init(141, 18, 'matchHead === true');
function visit190_663_1(result) {
  _$jscoverage['/selector.js'].branchData['663'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['660'][1].init(2737, 21, 'seedsIndex < seedsLen');
function visit189_660_1(result) {
  _$jscoverage['/selector.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['656'][1].init(2660, 9, '!seedsLen');
function visit188_656_1(result) {
  _$jscoverage['/selector.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['649'][1].init(58, 18, 'group.value || \'*\'');
function visit187_649_1(result) {
  _$jscoverage['/selector.js'].branchData['649'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['643'][3].init(53, 27, 'context !== contextDocument');
function visit186_643_3(result) {
  _$jscoverage['/selector.js'].branchData['643'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['643'][2].init(46, 34, 'tmp && context !== contextDocument');
function visit185_643_2(result) {
  _$jscoverage['/selector.js'].branchData['643'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['643'][1].init(30, 50, 'contextInDom && tmp && context !== contextDocument');
function visit184_643_1(result) {
  _$jscoverage['/selector.js'].branchData['643'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['639'][1].init(511, 15, 'tmpI === tmpLen');
function visit183_639_1(result) {
  _$jscoverage['/selector.js'].branchData['639'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['634'][1].init(81, 25, 'getAttr(tmp, \'id\') === id');
function visit182_634_1(result) {
  _$jscoverage['/selector.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['632'][1].init(200, 13, 'tmpI < tmpLen');
function visit181_632_1(result) {
  _$jscoverage['/selector.js'].branchData['632'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['628'][4].init(667, 25, 'getAttr(tmp, \'id\') !== id');
function visit180_628_4(result) {
  _$jscoverage['/selector.js'].branchData['628'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['628'][3].init(660, 32, 'tmp && getAttr(tmp, \'id\') !== id');
function visit179_628_3(result) {
  _$jscoverage['/selector.js'].branchData['628'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['628'][2].init(634, 22, '!tmp && doesNotHasById');
function visit178_628_2(result) {
  _$jscoverage['/selector.js'].branchData['628'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['628'][1].init(634, 58, '!tmp && doesNotHasById || tmp && getAttr(tmp, \'id\') !== id');
function visit177_628_1(result) {
  _$jscoverage['/selector.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['617'][1].init(508, 2, 'id');
function visit176_617_1(result) {
  _$jscoverage['/selector.js'].branchData['617'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['610'][1].init(95, 23, 'singleSuffix.t === \'id\'');
function visit175_610_1(result) {
  _$jscoverage['/selector.js'].branchData['610'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['608'][1].init(115, 23, 'suffixIndex < suffixLen');
function visit174_608_1(result) {
  _$jscoverage['/selector.js'].branchData['608'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['605'][1].init(22, 23, 'suffix && !isContextXML');
function visit173_605_1(result) {
  _$jscoverage['/selector.js'].branchData['605'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['604'][1].init(311, 8, '!mySeeds');
function visit172_604_1(result) {
  _$jscoverage['/selector.js'].branchData['604'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['591'][1].init(546, 21, 'groupIndex < groupLen');
function visit171_591_1(result) {
  _$jscoverage['/selector.js'].branchData['591'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['587'][1].init(458, 26, 'context || contextDocument');
function visit170_587_1(result) {
  _$jscoverage['/selector.js'].branchData['587'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['585'][2].init(391, 32, 'context && context.ownerDocument');
function visit169_585_2(result) {
  _$jscoverage['/selector.js'].branchData['585'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['585'][1].init(391, 44, 'context && context.ownerDocument || document');
function visit168_585_1(result) {
  _$jscoverage['/selector.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['582'][1].init(24, 33, 'context || seeds[0].ownerDocument');
function visit167_582_1(result) {
  _$jscoverage['/selector.js'].branchData['582'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['581'][1].init(284, 5, 'seeds');
function visit166_581_1(result) {
  _$jscoverage['/selector.js'].branchData['581'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['570'][1].init(14, 12, '!caches[str]');
function visit165_570_1(result) {
  _$jscoverage['/selector.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['560'][1].init(22, 19, 'matchSub(el, match)');
function visit164_560_1(result) {
  _$jscoverage['/selector.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['554'][1].init(74, 26, 'matchImmediateRet === true');
function visit163_554_1(result) {
  _$jscoverage['/selector.js'].branchData['554'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['543'][1].init(133, 27, 'matchKey in subMatchesCache');
function visit162_543_1(result) {
  _$jscoverage['/selector.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['542'][1].init(101, 16, 'match.order || 0');
function visit161_542_1(result) {
  _$jscoverage['/selector.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['531'][1].init(18, 40, '!(selectorId = el[EXPANDO_SELECTOR_KEY])');
function visit160_531_1(result) {
  _$jscoverage['/selector.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['527'][1].init(18, 53, '!(selectorId = el.getAttribute(EXPANDO_SELECTOR_KEY))');
function visit159_527_1(result) {
  _$jscoverage['/selector.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['526'][1].init(41, 12, 'isContextXML');
function visit158_526_1(result) {
  _$jscoverage['/selector.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['514'][1].init(416, 3, '!el');
function visit157_514_1(result) {
  _$jscoverage['/selector.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['513'][1].init(311, 26, 'el && relativeOp.immediate');
function visit156_513_1(result) {
  _$jscoverage['/selector.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['508'][1].init(134, 4, '!cur');
function visit155_508_1(result) {
  _$jscoverage['/selector.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['504'][1].init(18, 21, '!singleMatch(el, cur)');
function visit154_504_1(result) {
  _$jscoverage['/selector.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['484'][1].init(30, 29, 'el && dir(el, relativeOp.dir)');
function visit153_484_1(result) {
  _$jscoverage['/selector.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['475'][1].init(88, 20, 'relativeOp.immediate');
function visit152_475_1(result) {
  _$jscoverage['/selector.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['466'][1].init(293, 21, '!relativeOp.immediate');
function visit151_466_1(result) {
  _$jscoverage['/selector.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['461'][1].init(96, 6, '!match');
function visit150_461_1(result) {
  _$jscoverage['/selector.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['460'][1].init(54, 19, 'match && match.prev');
function visit149_460_1(result) {
  _$jscoverage['/selector.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['458'][1].init(66, 7, 'matched');
function visit148_458_1(result) {
  _$jscoverage['/selector.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['440'][1].init(160, 32, 'matchExpr[singleMatchSuffixType]');
function visit147_440_1(result) {
  _$jscoverage['/selector.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['437'][2].init(117, 33, 'matchSuffixIndex < matchSuffixLen');
function visit146_437_2(result) {
  _$jscoverage['/selector.js'].branchData['437'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['437'][1].init(106, 44, 'matched && matchSuffixIndex < matchSuffixLen');
function visit145_437_1(result) {
  _$jscoverage['/selector.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['434'][1].init(440, 22, 'matched && matchSuffix');
function visit144_434_1(result) {
  _$jscoverage['/selector.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['430'][1].init(337, 17, 'match.t === \'tag\'');
function visit143_430_1(result) {
  _$jscoverage['/selector.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['421'][1].init(134, 17, 'el.nodeType === 9');
function visit142_421_1(result) {
  _$jscoverage['/selector.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['417'][1].init(74, 3, '!el');
function visit141_417_1(result) {
  _$jscoverage['/selector.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['414'][1].init(14, 6, '!match');
function visit140_414_1(result) {
  _$jscoverage['/selector.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['401'][1].init(13018, 41, '\'sourceIndex\' in document.documentElement');
function visit139_401_1(result) {
  _$jscoverage['/selector.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['375'][1].init(22, 23, '!pseudoIdentExpr[ident]');
function visit138_375_1(result) {
  _$jscoverage['/selector.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['369'][1].init(22, 27, '!(fn = pseudoFnExpr[fnStr])');
function visit137_369_1(result) {
  _$jscoverage['/selector.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['360'][1].init(171, 7, 'matchFn');
function visit136_360_1(result) {
  _$jscoverage['/selector.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['356'][1].init(22, 21, 'elValue === undefined');
function visit135_356_1(result) {
  _$jscoverage['/selector.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['355'][1].init(319, 5, 'match');
function visit134_355_1(result) {
  _$jscoverage['/selector.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['353'][2].init(242, 21, 'elValue !== undefined');
function visit133_353_2(result) {
  _$jscoverage['/selector.js'].branchData['353'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['353'][1].init(232, 31, '!match && elValue !== undefined');
function visit132_353_1(result) {
  _$jscoverage['/selector.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['348'][1].init(55, 13, '!isContextXML');
function visit131_348_1(result) {
  _$jscoverage['/selector.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['344'][1].init(21, 27, 'getAttr(el, \'id\') === value');
function visit130_344_1(result) {
  _$jscoverage['/selector.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['336'][1].init(21, 17, 'elValue === value');
function visit129_336_1(result) {
  _$jscoverage['/selector.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['333'][2].init(30, 29, 'elValue.indexOf(value) !== -1');
function visit128_333_2(result) {
  _$jscoverage['/selector.js'].branchData['333'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['333'][1].init(21, 38, 'value && elValue.indexOf(value) !== -1');
function visit127_333_1(result) {
  _$jscoverage['/selector.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['330'][1].init(21, 35, 'value && S.endsWith(elValue, value)');
function visit126_330_1(result) {
  _$jscoverage['/selector.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['327'][1].init(21, 37, 'value && S.startsWith(elValue, value)');
function visit125_327_1(result) {
  _$jscoverage['/selector.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['324'][1].init(22, 48, '(\' \' + elValue).indexOf(\' \' + value + \'-\') !== -1');
function visit124_324_1(result) {
  _$jscoverage['/selector.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['321'][1].init(118, 54, '(\' \' + elValue + \' \').indexOf(\' \' + value + \' \') !== -1');
function visit123_321_1(result) {
  _$jscoverage['/selector.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['318'][2].init(28, 23, 'value.indexOf(\' \') > -1');
function visit122_318_2(result) {
  _$jscoverage['/selector.js'].branchData['318'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['318'][1].init(18, 33, '!value || value.indexOf(\' \') > -1');
function visit121_318_1(result) {
  _$jscoverage['/selector.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['312'][2].init(56, 21, 'nodeName === \'option\'');
function visit120_312_2(result) {
  _$jscoverage['/selector.js'].branchData['312'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['312'][1].init(56, 36, 'nodeName === \'option\' && el.selected');
function visit119_312_1(result) {
  _$jscoverage['/selector.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['311'][3].init(77, 20, 'nodeName === \'input\'');
function visit118_311_3(result) {
  _$jscoverage['/selector.js'].branchData['311'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['311'][2].init(77, 34, 'nodeName === \'input\' && el.checked');
function visit117_311_2(result) {
  _$jscoverage['/selector.js'].branchData['311'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['311'][1].init(77, 94, '(nodeName === \'input\' && el.checked) || (nodeName === \'option\' && el.selected)');
function visit116_311_1(result) {
  _$jscoverage['/selector.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['301'][2].init(68, 35, 'hash.slice(1) === getAttr(el, \'id\')');
function visit115_301_2(result) {
  _$jscoverage['/selector.js'].branchData['301'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['301'][1].init(60, 43, 'hash && hash.slice(1) === getAttr(el, \'id\')');
function visit114_301_1(result) {
  _$jscoverage['/selector.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['297'][5].init(179, 16, 'el.tabIndex >= 0');
function visit113_297_5(result) {
  _$jscoverage['/selector.js'].branchData['297'][5].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['297'][4].init(168, 27, 'el.href || el.tabIndex >= 0');
function visit112_297_4(result) {
  _$jscoverage['/selector.js'].branchData['297'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['297'][3].init(157, 38, 'el.type || el.href || el.tabIndex >= 0');
function visit111_297_3(result) {
  _$jscoverage['/selector.js'].branchData['297'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['297'][2].init(118, 31, '!doc.hasFocus || doc.hasFocus()');
function visit110_297_2(result) {
  _$jscoverage['/selector.js'].branchData['297'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['297'][1].init(45, 78, '(!doc.hasFocus || doc.hasFocus()) && !!(el.type || el.href || el.tabIndex >= 0)');
function visit109_297_1(result) {
  _$jscoverage['/selector.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['296'][3].init(69, 24, 'el === doc.activeElement');
function visit108_296_3(result) {
  _$jscoverage['/selector.js'].branchData['296'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['296'][2].init(69, 124, 'el === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(el.type || el.href || el.tabIndex >= 0)');
function visit107_296_2(result) {
  _$jscoverage['/selector.js'].branchData['296'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['296'][1].init(62, 131, 'doc && el === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(el.type || el.href || el.tabIndex >= 0)');
function visit106_296_1(result) {
  _$jscoverage['/selector.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['291'][1].init(21, 92, 'pseudoIdentExpr[\'first-of-type\'](el) && pseudoIdentExpr[\'last-of-type\'](el)');
function visit105_291_1(result) {
  _$jscoverage['/selector.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['287'][1].init(21, 88, 'pseudoIdentExpr[\'first-child\'](el) && pseudoIdentExpr[\'last-child\'](el)');
function visit104_287_1(result) {
  _$jscoverage['/selector.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['272'][1].init(36, 39, 'el === el.ownerDocument.documentElement');
function visit103_272_1(result) {
  _$jscoverage['/selector.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['271'][1].init(21, 76, 'el.ownerDocument && el === el.ownerDocument.documentElement');
function visit102_271_1(result) {
  _$jscoverage['/selector.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['264'][7].init(340, 14, 'nodeType === 5');
function visit101_264_7(result) {
  _$jscoverage['/selector.js'].branchData['264'][7].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['264'][6].init(322, 14, 'nodeType === 4');
function visit100_264_6(result) {
  _$jscoverage['/selector.js'].branchData['264'][6].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['264'][5].init(322, 32, 'nodeType === 4 || nodeType === 5');
function visit99_264_5(result) {
  _$jscoverage['/selector.js'].branchData['264'][5].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['264'][4].init(304, 14, 'nodeType === 3');
function visit98_264_4(result) {
  _$jscoverage['/selector.js'].branchData['264'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['264'][3].init(304, 50, 'nodeType === 3 || nodeType === 4 || nodeType === 5');
function visit97_264_3(result) {
  _$jscoverage['/selector.js'].branchData['264'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['264'][2].init(286, 14, 'nodeType === 1');
function visit96_264_2(result) {
  _$jscoverage['/selector.js'].branchData['264'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['264'][1].init(286, 68, 'nodeType === 1 || nodeType === 3 || nodeType === 4 || nodeType === 5');
function visit95_264_1(result) {
  _$jscoverage['/selector.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['258'][1].init(191, 11, 'index < len');
function visit94_258_1(result) {
  _$jscoverage['/selector.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['243'][2].init(452, 17, 'el.nodeType === 1');
function visit93_243_2(result) {
  _$jscoverage['/selector.js'].branchData['243'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['243'][1].init(338, 40, '(el = el.parentNode) && el.nodeType === 1');
function visit92_243_1(result) {
  _$jscoverage['/selector.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['241'][3].init(100, 32, 'elLang.indexOf(lang + \'-\') === 0');
function visit91_241_3(result) {
  _$jscoverage['/selector.js'].branchData['241'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['241'][2].init(81, 15, 'elLang === lang');
function visit90_241_2(result) {
  _$jscoverage['/selector.js'].branchData['241'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['241'][1].init(81, 51, 'elLang === lang || elLang.indexOf(lang + \'-\') === 0');
function visit89_241_1(result) {
  _$jscoverage['/selector.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['238'][1].init(35, 54, 'el.getAttribute(\'xml:lang\') || el.getAttribute(\'lang\')');
function visit88_238_1(result) {
  _$jscoverage['/selector.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['225'][1].init(138, 17, 'ret !== undefined');
function visit87_225_1(result) {
  _$jscoverage['/selector.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['224'][1].init(94, 12, 'child === el');
function visit86_224_1(result) {
  _$jscoverage['/selector.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['222'][1].init(74, 24, 'child.tagName === elType');
function visit85_222_1(result) {
  _$jscoverage['/selector.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['220'][1].init(258, 10, 'count >= 0');
function visit84_220_1(result) {
  _$jscoverage['/selector.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['213'][1].init(258, 6, 'parent');
function visit83_213_1(result) {
  _$jscoverage['/selector.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['208'][3].init(119, 7, 'b === 0');
function visit82_208_3(result) {
  _$jscoverage['/selector.js'].branchData['208'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['208'][2].init(108, 7, 'a === 0');
function visit81_208_2(result) {
  _$jscoverage['/selector.js'].branchData['208'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['208'][1].init(108, 18, 'a === 0 && b === 0');
function visit80_208_1(result) {
  _$jscoverage['/selector.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['196'][1].init(138, 17, 'ret !== undefined');
function visit79_196_1(result) {
  _$jscoverage['/selector.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['195'][1].init(94, 12, 'child === el');
function visit78_195_1(result) {
  _$jscoverage['/selector.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['193'][1].init(74, 24, 'child.tagName === elType');
function visit77_193_1(result) {
  _$jscoverage['/selector.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['191'][1].init(252, 11, 'count < len');
function visit76_191_1(result) {
  _$jscoverage['/selector.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['184'][1].init(258, 6, 'parent');
function visit75_184_1(result) {
  _$jscoverage['/selector.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['179'][3].init(119, 7, 'b === 0');
function visit74_179_3(result) {
  _$jscoverage['/selector.js'].branchData['179'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['179'][2].init(108, 7, 'a === 0');
function visit73_179_2(result) {
  _$jscoverage['/selector.js'].branchData['179'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['179'][1].init(108, 18, 'a === 0 && b === 0');
function visit72_179_1(result) {
  _$jscoverage['/selector.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['167'][1].init(138, 17, 'ret !== undefined');
function visit71_167_1(result) {
  _$jscoverage['/selector.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['166'][1].init(94, 12, 'child === el');
function visit70_166_1(result) {
  _$jscoverage['/selector.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['164'][1].init(74, 20, 'child.nodeType === 1');
function visit69_164_1(result) {
  _$jscoverage['/selector.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['162'][1].init(216, 10, 'count >= 0');
function visit68_162_1(result) {
  _$jscoverage['/selector.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['156'][1].init(258, 6, 'parent');
function visit67_156_1(result) {
  _$jscoverage['/selector.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['151'][3].init(119, 7, 'b === 0');
function visit66_151_3(result) {
  _$jscoverage['/selector.js'].branchData['151'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['151'][2].init(108, 7, 'a === 0');
function visit65_151_2(result) {
  _$jscoverage['/selector.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['151'][1].init(108, 18, 'a === 0 && b === 0');
function visit64_151_1(result) {
  _$jscoverage['/selector.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['139'][1].init(138, 17, 'ret !== undefined');
function visit63_139_1(result) {
  _$jscoverage['/selector.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['138'][1].init(94, 12, 'child === el');
function visit62_138_1(result) {
  _$jscoverage['/selector.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['136'][1].init(74, 20, 'child.nodeType === 1');
function visit61_136_1(result) {
  _$jscoverage['/selector.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['134'][1].init(210, 11, 'count < len');
function visit60_134_1(result) {
  _$jscoverage['/selector.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['128'][1].init(258, 6, 'parent');
function visit59_128_1(result) {
  _$jscoverage['/selector.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['123'][3].init(119, 7, 'b === 0');
function visit58_123_3(result) {
  _$jscoverage['/selector.js'].branchData['123'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['123'][2].init(108, 7, 'a === 0');
function visit57_123_2(result) {
  _$jscoverage['/selector.js'].branchData['123'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['123'][1].init(108, 18, 'a === 0 && b === 0');
function visit56_123_1(result) {
  _$jscoverage['/selector.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['115'][1].init(120, 49, 'documentElement.nodeName.toLowerCase() !== \'html\'');
function visit55_115_1(result) {
  _$jscoverage['/selector.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['114'][2].init(41, 26, 'elem.ownerDocument || elem');
function visit54_114_2(result) {
  _$jscoverage['/selector.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['114'][1].init(32, 52, 'elem && (elem.ownerDocument || elem).documentElement');
function visit53_114_1(result) {
  _$jscoverage['/selector.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['106'][4].init(43, 20, '(index - b) % a === 0');
function visit52_106_4(result) {
  _$jscoverage['/selector.js'].branchData['106'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['106'][3].init(43, 26, '(index - b) % a === 0 && eq');
function visit51_106_3(result) {
  _$jscoverage['/selector.js'].branchData['106'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['106'][2].init(19, 19, '(index - b) / a >= 0');
function visit50_106_2(result) {
  _$jscoverage['/selector.js'].branchData['106'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['106'][1].init(19, 50, '(index - b) / a >= 0 && (index - b) % a === 0 && eq');
function visit49_106_1(result) {
  _$jscoverage['/selector.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['102'][1].init(18, 11, 'index === b');
function visit48_102_1(result) {
  _$jscoverage['/selector.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['101'][1].init(14, 7, 'a === 0');
function visit47_101_1(result) {
  _$jscoverage['/selector.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['92'][1].init(367, 26, 'parseInt(match[3], 10) || 0');
function visit46_92_1(result) {
  _$jscoverage['/selector.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['83'][1].init(26, 16, 'match[2] === \'-\'');
function visit45_83_1(result) {
  _$jscoverage['/selector.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['82'][1].init(66, 8, 'isNaN(a)');
function visit44_82_1(result) {
  _$jscoverage['/selector.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['80'][1].init(18, 8, 'match[1]');
function visit43_80_1(result) {
  _$jscoverage['/selector.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['76'][1].init(228, 16, 'param === \'even\'');
function visit42_76_1(result) {
  _$jscoverage['/selector.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['73'][1].init(148, 15, 'param === \'odd\'');
function visit41_73_1(result) {
  _$jscoverage['/selector.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['71'][1].init(74, 25, 'typeof param === \'number\'');
function visit40_71_1(result) {
  _$jscoverage['/selector.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['63'][2].init(73, 17, 'el.nodeType !== 1');
function visit39_63_2(result) {
  _$jscoverage['/selector.js'].branchData['63'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['63'][1].init(55, 23, 'el && el.nodeType !== 1');
function visit38_63_1(result) {
  _$jscoverage['/selector.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['39'][1].init(91, 8, 'high < 0');
function visit37_39_1(result) {
  _$jscoverage['/selector.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['21'][1].init(18, 12, 'isContextXML');
function visit36_21_1(result) {
  _$jscoverage['/selector.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/selector.js'].functionData[0]++;
  _$jscoverage['/selector.js'].lineData[7]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/selector.js'].lineData[8]++;
  var parser = require('./selector/parser');
  _$jscoverage['/selector.js'].lineData[9]++;
  var Dom = require('dom/basic');
  _$jscoverage['/selector.js'].lineData[10]++;
  logger.info('use KISSY css3 selector');
  _$jscoverage['/selector.js'].lineData[14]++;
  var document = S.Env.host.document, EXPANDO_SELECTOR_KEY = '_ks_data_selector_id_', caches = {}, isContextXML, uuid = 0, subMatchesCache = {}, getAttr = function(el, name) {
  _$jscoverage['/selector.js'].functionData[1]++;
  _$jscoverage['/selector.js'].lineData[21]++;
  if (visit36_21_1(isContextXML)) {
    _$jscoverage['/selector.js'].lineData[22]++;
    return Dom._getSimpleAttr(el, name);
  } else {
    _$jscoverage['/selector.js'].lineData[24]++;
    return Dom.attr(el, name);
  }
}, hasSingleClass = Dom._hasSingleClass, isTag = Dom._isTag, aNPlusB = /^(([+-]?(?:\d+)?)?n)?([+-]?\d+)?$/;
  _$jscoverage['/selector.js'].lineData[32]++;
  var unescape = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g, unescapeFn = function(_, escaped) {
  _$jscoverage['/selector.js'].functionData[2]++;
  _$jscoverage['/selector.js'].lineData[34]++;
  var high = '0x' + escaped - 0x10000;
  _$jscoverage['/selector.js'].lineData[36]++;
  return isNaN(high) ? escaped : visit37_39_1(high < 0) ? String.fromCharCode(high + 0x10000) : String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
};
  _$jscoverage['/selector.js'].lineData[45]++;
  function unEscape(str) {
    _$jscoverage['/selector.js'].functionData[3]++;
    _$jscoverage['/selector.js'].lineData[46]++;
    return str.replace(unescape, unescapeFn);
  }
  _$jscoverage['/selector.js'].lineData[49]++;
  parser.lexer.yy = {
  unEscape: unEscape, 
  unEscapeStr: function(str) {
  _$jscoverage['/selector.js'].functionData[4]++;
  _$jscoverage['/selector.js'].lineData[52]++;
  return this.unEscape(str.slice(1, -1));
}};
  _$jscoverage['/selector.js'].lineData[56]++;
  function resetStatus() {
    _$jscoverage['/selector.js'].functionData[5]++;
    _$jscoverage['/selector.js'].lineData[57]++;
    subMatchesCache = {};
  }
  _$jscoverage['/selector.js'].lineData[60]++;
  function dir(el, direction) {
    _$jscoverage['/selector.js'].functionData[6]++;
    _$jscoverage['/selector.js'].lineData[61]++;
    do {
      _$jscoverage['/selector.js'].lineData[62]++;
      el = el[direction];
    } while (visit38_63_1(el && visit39_63_2(el.nodeType !== 1)));
    _$jscoverage['/selector.js'].lineData[64]++;
    return el;
  }
  _$jscoverage['/selector.js'].lineData[67]++;
  function getAb(param) {
    _$jscoverage['/selector.js'].functionData[7]++;
    _$jscoverage['/selector.js'].lineData[68]++;
    var a = 0, match, b = 0;
    _$jscoverage['/selector.js'].lineData[71]++;
    if (visit40_71_1(typeof param === 'number')) {
      _$jscoverage['/selector.js'].lineData[72]++;
      b = param;
    } else {
      _$jscoverage['/selector.js'].lineData[73]++;
      if (visit41_73_1(param === 'odd')) {
        _$jscoverage['/selector.js'].lineData[74]++;
        a = 2;
        _$jscoverage['/selector.js'].lineData[75]++;
        b = 1;
      } else {
        _$jscoverage['/selector.js'].lineData[76]++;
        if (visit42_76_1(param === 'even')) {
          _$jscoverage['/selector.js'].lineData[77]++;
          a = 2;
          _$jscoverage['/selector.js'].lineData[78]++;
          b = 0;
        } else {
          _$jscoverage['/selector.js'].lineData[79]++;
          if ((match = param.replace(/\s/g, '').match(aNPlusB))) {
            _$jscoverage['/selector.js'].lineData[80]++;
            if (visit43_80_1(match[1])) {
              _$jscoverage['/selector.js'].lineData[81]++;
              a = parseInt(match[2], 10);
              _$jscoverage['/selector.js'].lineData[82]++;
              if (visit44_82_1(isNaN(a))) {
                _$jscoverage['/selector.js'].lineData[83]++;
                if (visit45_83_1(match[2] === '-')) {
                  _$jscoverage['/selector.js'].lineData[84]++;
                  a = -1;
                } else {
                  _$jscoverage['/selector.js'].lineData[86]++;
                  a = 1;
                }
              }
            } else {
              _$jscoverage['/selector.js'].lineData[90]++;
              a = 0;
            }
            _$jscoverage['/selector.js'].lineData[92]++;
            b = visit46_92_1(parseInt(match[3], 10) || 0);
          }
        }
      }
    }
    _$jscoverage['/selector.js'].lineData[94]++;
    return {
  a: a, 
  b: b};
  }
  _$jscoverage['/selector.js'].lineData[100]++;
  function matchIndexByAb(index, a, b, eq) {
    _$jscoverage['/selector.js'].functionData[8]++;
    _$jscoverage['/selector.js'].lineData[101]++;
    if (visit47_101_1(a === 0)) {
      _$jscoverage['/selector.js'].lineData[102]++;
      if (visit48_102_1(index === b)) {
        _$jscoverage['/selector.js'].lineData[103]++;
        return eq;
      }
    } else {
      _$jscoverage['/selector.js'].lineData[106]++;
      if (visit49_106_1(visit50_106_2((index - b) / a >= 0) && visit51_106_3(visit52_106_4((index - b) % a === 0) && eq))) {
        _$jscoverage['/selector.js'].lineData[107]++;
        return 1;
      }
    }
    _$jscoverage['/selector.js'].lineData[110]++;
    return undefined;
  }
  _$jscoverage['/selector.js'].lineData[113]++;
  function isXML(elem) {
    _$jscoverage['/selector.js'].functionData[9]++;
    _$jscoverage['/selector.js'].lineData[114]++;
    var documentElement = visit53_114_1(elem && (visit54_114_2(elem.ownerDocument || elem)).documentElement);
    _$jscoverage['/selector.js'].lineData[115]++;
    return documentElement ? visit55_115_1(documentElement.nodeName.toLowerCase() !== 'html') : false;
  }
  _$jscoverage['/selector.js'].lineData[118]++;
  var pseudoFnExpr = {
  'nth-child': function(el, param) {
  _$jscoverage['/selector.js'].functionData[10]++;
  _$jscoverage['/selector.js'].lineData[120]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[123]++;
  if (visit56_123_1(visit57_123_2(a === 0) && visit58_123_3(b === 0))) {
    _$jscoverage['/selector.js'].lineData[124]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[126]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[128]++;
  if (visit59_128_1(parent)) {
    _$jscoverage['/selector.js'].lineData[129]++;
    var childNodes = parent.childNodes, count = 0, child, ret, len = childNodes.length;
    _$jscoverage['/selector.js'].lineData[134]++;
    for (; visit60_134_1(count < len); count++) {
      _$jscoverage['/selector.js'].lineData[135]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[136]++;
      if (visit61_136_1(child.nodeType === 1)) {
        _$jscoverage['/selector.js'].lineData[137]++;
        index++;
        _$jscoverage['/selector.js'].lineData[138]++;
        ret = matchIndexByAb(index, a, b, visit62_138_1(child === el));
        _$jscoverage['/selector.js'].lineData[139]++;
        if (visit63_139_1(ret !== undefined)) {
          _$jscoverage['/selector.js'].lineData[140]++;
          return ret;
        }
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[145]++;
  return 0;
}, 
  'nth-last-child': function(el, param) {
  _$jscoverage['/selector.js'].functionData[11]++;
  _$jscoverage['/selector.js'].lineData[148]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[151]++;
  if (visit64_151_1(visit65_151_2(a === 0) && visit66_151_3(b === 0))) {
    _$jscoverage['/selector.js'].lineData[152]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[154]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[156]++;
  if (visit67_156_1(parent)) {
    _$jscoverage['/selector.js'].lineData[157]++;
    var childNodes = parent.childNodes, len = childNodes.length, count = len - 1, child, ret;
    _$jscoverage['/selector.js'].lineData[162]++;
    for (; visit68_162_1(count >= 0); count--) {
      _$jscoverage['/selector.js'].lineData[163]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[164]++;
      if (visit69_164_1(child.nodeType === 1)) {
        _$jscoverage['/selector.js'].lineData[165]++;
        index++;
        _$jscoverage['/selector.js'].lineData[166]++;
        ret = matchIndexByAb(index, a, b, visit70_166_1(child === el));
        _$jscoverage['/selector.js'].lineData[167]++;
        if (visit71_167_1(ret !== undefined)) {
          _$jscoverage['/selector.js'].lineData[168]++;
          return ret;
        }
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[173]++;
  return 0;
}, 
  'nth-of-type': function(el, param) {
  _$jscoverage['/selector.js'].functionData[12]++;
  _$jscoverage['/selector.js'].lineData[176]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[179]++;
  if (visit72_179_1(visit73_179_2(a === 0) && visit74_179_3(b === 0))) {
    _$jscoverage['/selector.js'].lineData[180]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[182]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[184]++;
  if (visit75_184_1(parent)) {
    _$jscoverage['/selector.js'].lineData[185]++;
    var childNodes = parent.childNodes, elType = el.tagName, count = 0, child, ret, len = childNodes.length;
    _$jscoverage['/selector.js'].lineData[191]++;
    for (; visit76_191_1(count < len); count++) {
      _$jscoverage['/selector.js'].lineData[192]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[193]++;
      if (visit77_193_1(child.tagName === elType)) {
        _$jscoverage['/selector.js'].lineData[194]++;
        index++;
        _$jscoverage['/selector.js'].lineData[195]++;
        ret = matchIndexByAb(index, a, b, visit78_195_1(child === el));
        _$jscoverage['/selector.js'].lineData[196]++;
        if (visit79_196_1(ret !== undefined)) {
          _$jscoverage['/selector.js'].lineData[197]++;
          return ret;
        }
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[202]++;
  return 0;
}, 
  'nth-last-of-type': function(el, param) {
  _$jscoverage['/selector.js'].functionData[13]++;
  _$jscoverage['/selector.js'].lineData[205]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[208]++;
  if (visit80_208_1(visit81_208_2(a === 0) && visit82_208_3(b === 0))) {
    _$jscoverage['/selector.js'].lineData[209]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[211]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[213]++;
  if (visit83_213_1(parent)) {
    _$jscoverage['/selector.js'].lineData[214]++;
    var childNodes = parent.childNodes, len = childNodes.length, elType = el.tagName, count = len - 1, child, ret;
    _$jscoverage['/selector.js'].lineData[220]++;
    for (; visit84_220_1(count >= 0); count--) {
      _$jscoverage['/selector.js'].lineData[221]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[222]++;
      if (visit85_222_1(child.tagName === elType)) {
        _$jscoverage['/selector.js'].lineData[223]++;
        index++;
        _$jscoverage['/selector.js'].lineData[224]++;
        ret = matchIndexByAb(index, a, b, visit86_224_1(child === el));
        _$jscoverage['/selector.js'].lineData[225]++;
        if (visit87_225_1(ret !== undefined)) {
          _$jscoverage['/selector.js'].lineData[226]++;
          return ret;
        }
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[231]++;
  return 0;
}, 
  lang: function(el, lang) {
  _$jscoverage['/selector.js'].functionData[14]++;
  _$jscoverage['/selector.js'].lineData[234]++;
  var elLang;
  _$jscoverage['/selector.js'].lineData[235]++;
  lang = unEscape(lang.toLowerCase());
  _$jscoverage['/selector.js'].lineData[236]++;
  do {
    _$jscoverage['/selector.js'].lineData[237]++;
    if ((elLang = (isContextXML ? visit88_238_1(el.getAttribute('xml:lang') || el.getAttribute('lang')) : el.lang))) {
      _$jscoverage['/selector.js'].lineData[240]++;
      elLang = elLang.toLowerCase();
      _$jscoverage['/selector.js'].lineData[241]++;
      return visit89_241_1(visit90_241_2(elLang === lang) || visit91_241_3(elLang.indexOf(lang + '-') === 0));
    }
  } while (visit92_243_1((el = el.parentNode) && visit93_243_2(el.nodeType === 1)));
  _$jscoverage['/selector.js'].lineData[244]++;
  return false;
}, 
  not: function(el, negationArg) {
  _$jscoverage['/selector.js'].functionData[15]++;
  _$jscoverage['/selector.js'].lineData[247]++;
  return !matchExpr[negationArg.t](el, negationArg.value);
}};
  _$jscoverage['/selector.js'].lineData[251]++;
  var pseudoIdentExpr = {
  empty: function(el) {
  _$jscoverage['/selector.js'].functionData[16]++;
  _$jscoverage['/selector.js'].lineData[253]++;
  var childNodes = el.childNodes, index = 0, len = childNodes.length - 1, child, nodeType;
  _$jscoverage['/selector.js'].lineData[258]++;
  for (; visit94_258_1(index < len); index++) {
    _$jscoverage['/selector.js'].lineData[259]++;
    child = childNodes[index];
    _$jscoverage['/selector.js'].lineData[260]++;
    nodeType = child.nodeType;
    _$jscoverage['/selector.js'].lineData[264]++;
    if (visit95_264_1(visit96_264_2(nodeType === 1) || visit97_264_3(visit98_264_4(nodeType === 3) || visit99_264_5(visit100_264_6(nodeType === 4) || visit101_264_7(nodeType === 5))))) {
      _$jscoverage['/selector.js'].lineData[265]++;
      return 0;
    }
  }
  _$jscoverage['/selector.js'].lineData[268]++;
  return 1;
}, 
  root: function(el) {
  _$jscoverage['/selector.js'].functionData[17]++;
  _$jscoverage['/selector.js'].lineData[271]++;
  return visit102_271_1(el.ownerDocument && visit103_272_1(el === el.ownerDocument.documentElement));
}, 
  'first-child': function(el) {
  _$jscoverage['/selector.js'].functionData[18]++;
  _$jscoverage['/selector.js'].lineData[275]++;
  return pseudoFnExpr['nth-child'](el, 1);
}, 
  'last-child': function(el) {
  _$jscoverage['/selector.js'].functionData[19]++;
  _$jscoverage['/selector.js'].lineData[278]++;
  return pseudoFnExpr['nth-last-child'](el, 1);
}, 
  'first-of-type': function(el) {
  _$jscoverage['/selector.js'].functionData[20]++;
  _$jscoverage['/selector.js'].lineData[281]++;
  return pseudoFnExpr['nth-of-type'](el, 1);
}, 
  'last-of-type': function(el) {
  _$jscoverage['/selector.js'].functionData[21]++;
  _$jscoverage['/selector.js'].lineData[284]++;
  return pseudoFnExpr['nth-last-of-type'](el, 1);
}, 
  'only-child': function(el) {
  _$jscoverage['/selector.js'].functionData[22]++;
  _$jscoverage['/selector.js'].lineData[287]++;
  return visit104_287_1(pseudoIdentExpr['first-child'](el) && pseudoIdentExpr['last-child'](el));
}, 
  'only-of-type': function(el) {
  _$jscoverage['/selector.js'].functionData[23]++;
  _$jscoverage['/selector.js'].lineData[291]++;
  return visit105_291_1(pseudoIdentExpr['first-of-type'](el) && pseudoIdentExpr['last-of-type'](el));
}, 
  focus: function(el) {
  _$jscoverage['/selector.js'].functionData[24]++;
  _$jscoverage['/selector.js'].lineData[295]++;
  var doc = el.ownerDocument;
  _$jscoverage['/selector.js'].lineData[296]++;
  return visit106_296_1(doc && visit107_296_2(visit108_296_3(el === doc.activeElement) && visit109_297_1((visit110_297_2(!doc.hasFocus || doc.hasFocus())) && !!(visit111_297_3(el.type || visit112_297_4(el.href || visit113_297_5(el.tabIndex >= 0)))))));
}, 
  target: function(el) {
  _$jscoverage['/selector.js'].functionData[25]++;
  _$jscoverage['/selector.js'].lineData[300]++;
  var hash = location.hash;
  _$jscoverage['/selector.js'].lineData[301]++;
  return visit114_301_1(hash && visit115_301_2(hash.slice(1) === getAttr(el, 'id')));
}, 
  enabled: function(el) {
  _$jscoverage['/selector.js'].functionData[26]++;
  _$jscoverage['/selector.js'].lineData[304]++;
  return !el.disabled;
}, 
  disabled: function(el) {
  _$jscoverage['/selector.js'].functionData[27]++;
  _$jscoverage['/selector.js'].lineData[307]++;
  return el.disabled;
}, 
  checked: function(el) {
  _$jscoverage['/selector.js'].functionData[28]++;
  _$jscoverage['/selector.js'].lineData[310]++;
  var nodeName = el.nodeName.toLowerCase();
  _$jscoverage['/selector.js'].lineData[311]++;
  return visit116_311_1((visit117_311_2(visit118_311_3(nodeName === 'input') && el.checked)) || (visit119_312_1(visit120_312_2(nodeName === 'option') && el.selected)));
}};
  _$jscoverage['/selector.js'].lineData[316]++;
  var attributeExpr = {
  '~=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[29]++;
  _$jscoverage['/selector.js'].lineData[318]++;
  if (visit121_318_1(!value || visit122_318_2(value.indexOf(' ') > -1))) {
    _$jscoverage['/selector.js'].lineData[319]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[321]++;
  return visit123_321_1((' ' + elValue + ' ').indexOf(' ' + value + ' ') !== -1);
}, 
  '|=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[30]++;
  _$jscoverage['/selector.js'].lineData[324]++;
  return visit124_324_1((' ' + elValue).indexOf(' ' + value + '-') !== -1);
}, 
  '^=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[31]++;
  _$jscoverage['/selector.js'].lineData[327]++;
  return visit125_327_1(value && S.startsWith(elValue, value));
}, 
  '$=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[32]++;
  _$jscoverage['/selector.js'].lineData[330]++;
  return visit126_330_1(value && S.endsWith(elValue, value));
}, 
  '*=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[33]++;
  _$jscoverage['/selector.js'].lineData[333]++;
  return visit127_333_1(value && visit128_333_2(elValue.indexOf(value) !== -1));
}, 
  '=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[34]++;
  _$jscoverage['/selector.js'].lineData[336]++;
  return visit129_336_1(elValue === value);
}};
  _$jscoverage['/selector.js'].lineData[340]++;
  var matchExpr = {
  tag: isTag, 
  cls: hasSingleClass, 
  id: function(el, value) {
  _$jscoverage['/selector.js'].functionData[35]++;
  _$jscoverage['/selector.js'].lineData[344]++;
  return visit130_344_1(getAttr(el, 'id') === value);
}, 
  attrib: function(el, value) {
  _$jscoverage['/selector.js'].functionData[36]++;
  _$jscoverage['/selector.js'].lineData[347]++;
  var name = value.ident;
  _$jscoverage['/selector.js'].lineData[348]++;
  if (visit131_348_1(!isContextXML)) {
    _$jscoverage['/selector.js'].lineData[349]++;
    name = name.toLowerCase();
  }
  _$jscoverage['/selector.js'].lineData[351]++;
  var elValue = getAttr(el, name);
  _$jscoverage['/selector.js'].lineData[352]++;
  var match = value.match;
  _$jscoverage['/selector.js'].lineData[353]++;
  if (visit132_353_1(!match && visit133_353_2(elValue !== undefined))) {
    _$jscoverage['/selector.js'].lineData[354]++;
    return 1;
  } else {
    _$jscoverage['/selector.js'].lineData[355]++;
    if (visit134_355_1(match)) {
      _$jscoverage['/selector.js'].lineData[356]++;
      if (visit135_356_1(elValue === undefined)) {
        _$jscoverage['/selector.js'].lineData[357]++;
        return 0;
      }
      _$jscoverage['/selector.js'].lineData[359]++;
      var matchFn = attributeExpr[match];
      _$jscoverage['/selector.js'].lineData[360]++;
      if (visit136_360_1(matchFn)) {
        _$jscoverage['/selector.js'].lineData[361]++;
        return matchFn(elValue + '', value.value + '');
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[364]++;
  return 0;
}, 
  pseudo: function(el, value) {
  _$jscoverage['/selector.js'].functionData[37]++;
  _$jscoverage['/selector.js'].lineData[367]++;
  var fn, fnStr, ident;
  _$jscoverage['/selector.js'].lineData[368]++;
  if ((fnStr = value.fn)) {
    _$jscoverage['/selector.js'].lineData[369]++;
    if (visit137_369_1(!(fn = pseudoFnExpr[fnStr]))) {
      _$jscoverage['/selector.js'].lineData[370]++;
      throw new SyntaxError('Syntax error: not support pseudo: ' + fnStr);
    }
    _$jscoverage['/selector.js'].lineData[372]++;
    return fn(el, value.param);
  }
  _$jscoverage['/selector.js'].lineData[374]++;
  if ((ident = value.ident)) {
    _$jscoverage['/selector.js'].lineData[375]++;
    if (visit138_375_1(!pseudoIdentExpr[ident])) {
      _$jscoverage['/selector.js'].lineData[376]++;
      throw new SyntaxError('Syntax error: not support pseudo: ' + ident);
    }
    _$jscoverage['/selector.js'].lineData[378]++;
    return pseudoIdentExpr[ident](el);
  }
  _$jscoverage['/selector.js'].lineData[380]++;
  return 0;
}};
  _$jscoverage['/selector.js'].lineData[384]++;
  var relativeExpr = {
  '>': {
  dir: 'parentNode', 
  immediate: 1}, 
  ' ': {
  dir: 'parentNode'}, 
  '+': {
  dir: 'previousSibling', 
  immediate: 1}, 
  '~': {
  dir: 'previousSibling'}};
  _$jscoverage['/selector.js'].lineData[401]++;
  if (visit139_401_1('sourceIndex' in document.documentElement)) {
    _$jscoverage['/selector.js'].lineData[402]++;
    Dom._compareNodeOrder = function(a, b) {
  _$jscoverage['/selector.js'].functionData[38]++;
  _$jscoverage['/selector.js'].lineData[403]++;
  return a.sourceIndex - b.sourceIndex;
};
  }
  _$jscoverage['/selector.js'].lineData[407]++;
  function matches(str, seeds) {
    _$jscoverage['/selector.js'].functionData[39]++;
    _$jscoverage['/selector.js'].lineData[408]++;
    return Dom._selectInternal(str, null, seeds);
  }
  _$jscoverage['/selector.js'].lineData[411]++;
  Dom._matchesInternal = matches;
  _$jscoverage['/selector.js'].lineData[413]++;
  function singleMatch(el, match) {
    _$jscoverage['/selector.js'].functionData[40]++;
    _$jscoverage['/selector.js'].lineData[414]++;
    if (visit140_414_1(!match)) {
      _$jscoverage['/selector.js'].lineData[415]++;
      return true;
    }
    _$jscoverage['/selector.js'].lineData[417]++;
    if (visit141_417_1(!el)) {
      _$jscoverage['/selector.js'].lineData[418]++;
      return false;
    }
    _$jscoverage['/selector.js'].lineData[421]++;
    if (visit142_421_1(el.nodeType === 9)) {
      _$jscoverage['/selector.js'].lineData[422]++;
      return false;
    }
    _$jscoverage['/selector.js'].lineData[425]++;
    var matched = 1, matchSuffix = match.suffix, matchSuffixLen, matchSuffixIndex;
    _$jscoverage['/selector.js'].lineData[430]++;
    if (visit143_430_1(match.t === 'tag')) {
      _$jscoverage['/selector.js'].lineData[431]++;
      matched &= matchExpr.tag(el, match.value);
    }
    _$jscoverage['/selector.js'].lineData[434]++;
    if (visit144_434_1(matched && matchSuffix)) {
      _$jscoverage['/selector.js'].lineData[435]++;
      matchSuffixLen = matchSuffix.length;
      _$jscoverage['/selector.js'].lineData[436]++;
      matchSuffixIndex = 0;
      _$jscoverage['/selector.js'].lineData[437]++;
      for (; visit145_437_1(matched && visit146_437_2(matchSuffixIndex < matchSuffixLen)); matchSuffixIndex++) {
        _$jscoverage['/selector.js'].lineData[438]++;
        var singleMatchSuffix = matchSuffix[matchSuffixIndex], singleMatchSuffixType = singleMatchSuffix.t;
        _$jscoverage['/selector.js'].lineData[440]++;
        if (visit147_440_1(matchExpr[singleMatchSuffixType])) {
          _$jscoverage['/selector.js'].lineData[441]++;
          matched &= matchExpr[singleMatchSuffixType](el, singleMatchSuffix.value);
        }
      }
    }
    _$jscoverage['/selector.js'].lineData[446]++;
    return matched;
  }
  _$jscoverage['/selector.js'].lineData[450]++;
  function matchImmediate(el, match) {
    _$jscoverage['/selector.js'].functionData[41]++;
    _$jscoverage['/selector.js'].lineData[451]++;
    var matched = 1, startEl = el, relativeOp, startMatch = match;
    _$jscoverage['/selector.js'].lineData[456]++;
    do {
      _$jscoverage['/selector.js'].lineData[457]++;
      matched &= singleMatch(el, match);
      _$jscoverage['/selector.js'].lineData[458]++;
      if (visit148_458_1(matched)) {
        _$jscoverage['/selector.js'].lineData[460]++;
        match = visit149_460_1(match && match.prev);
        _$jscoverage['/selector.js'].lineData[461]++;
        if (visit150_461_1(!match)) {
          _$jscoverage['/selector.js'].lineData[462]++;
          return true;
        }
        _$jscoverage['/selector.js'].lineData[464]++;
        relativeOp = relativeExpr[match.nextCombinator];
        _$jscoverage['/selector.js'].lineData[465]++;
        el = dir(el, relativeOp.dir);
        _$jscoverage['/selector.js'].lineData[466]++;
        if (visit151_466_1(!relativeOp.immediate)) {
          _$jscoverage['/selector.js'].lineData[467]++;
          return {
  el: el, 
  match: match};
        }
      } else {
        _$jscoverage['/selector.js'].lineData[474]++;
        relativeOp = relativeExpr[match.nextCombinator];
        _$jscoverage['/selector.js'].lineData[475]++;
        if (visit152_475_1(relativeOp.immediate)) {
          _$jscoverage['/selector.js'].lineData[477]++;
          return {
  el: dir(startEl, relativeExpr[startMatch.nextCombinator].dir), 
  match: startMatch};
        } else {
          _$jscoverage['/selector.js'].lineData[483]++;
          return {
  el: visit153_484_1(el && dir(el, relativeOp.dir)), 
  match: match};
        }
      }
    } while (el);
    _$jscoverage['/selector.js'].lineData[492]++;
    return {
  el: dir(startEl, relativeExpr[startMatch.nextCombinator].dir), 
  match: startMatch};
  }
  _$jscoverage['/selector.js'].lineData[499]++;
  function findFixedMatchFromHead(el, head) {
    _$jscoverage['/selector.js'].functionData[42]++;
    _$jscoverage['/selector.js'].lineData[500]++;
    var relativeOp, cur = head;
    _$jscoverage['/selector.js'].lineData[503]++;
    do {
      _$jscoverage['/selector.js'].lineData[504]++;
      if (visit154_504_1(!singleMatch(el, cur))) {
        _$jscoverage['/selector.js'].lineData[505]++;
        return null;
      }
      _$jscoverage['/selector.js'].lineData[507]++;
      cur = cur.prev;
      _$jscoverage['/selector.js'].lineData[508]++;
      if (visit155_508_1(!cur)) {
        _$jscoverage['/selector.js'].lineData[509]++;
        return true;
      }
      _$jscoverage['/selector.js'].lineData[511]++;
      relativeOp = relativeExpr[cur.nextCombinator];
      _$jscoverage['/selector.js'].lineData[512]++;
      el = dir(el, relativeOp.dir);
    } while (visit156_513_1(el && relativeOp.immediate));
    _$jscoverage['/selector.js'].lineData[514]++;
    if (visit157_514_1(!el)) {
      _$jscoverage['/selector.js'].lineData[515]++;
      return null;
    }
    _$jscoverage['/selector.js'].lineData[517]++;
    return {
  el: el, 
  match: cur};
  }
  _$jscoverage['/selector.js'].lineData[523]++;
  function genId(el) {
    _$jscoverage['/selector.js'].functionData[43]++;
    _$jscoverage['/selector.js'].lineData[524]++;
    var selectorId;
    _$jscoverage['/selector.js'].lineData[526]++;
    if (visit158_526_1(isContextXML)) {
      _$jscoverage['/selector.js'].lineData[527]++;
      if (visit159_527_1(!(selectorId = el.getAttribute(EXPANDO_SELECTOR_KEY)))) {
        _$jscoverage['/selector.js'].lineData[528]++;
        el.setAttribute(EXPANDO_SELECTOR_KEY, selectorId = (+new Date() + '_' + (++uuid)));
      }
    } else {
      _$jscoverage['/selector.js'].lineData[531]++;
      if (visit160_531_1(!(selectorId = el[EXPANDO_SELECTOR_KEY]))) {
        _$jscoverage['/selector.js'].lineData[532]++;
        selectorId = el[EXPANDO_SELECTOR_KEY] = (+new Date()) + '_' + (++uuid);
      }
    }
    _$jscoverage['/selector.js'].lineData[536]++;
    return selectorId;
  }
  _$jscoverage['/selector.js'].lineData[539]++;
  function matchSub(el, match) {
    _$jscoverage['/selector.js'].functionData[44]++;
    _$jscoverage['/selector.js'].lineData[540]++;
    var selectorId = genId(el), matchKey;
    _$jscoverage['/selector.js'].lineData[542]++;
    matchKey = selectorId + '_' + (visit161_542_1(match.order || 0));
    _$jscoverage['/selector.js'].lineData[543]++;
    if (visit162_543_1(matchKey in subMatchesCache)) {
      _$jscoverage['/selector.js'].lineData[544]++;
      return subMatchesCache[matchKey];
    }
    _$jscoverage['/selector.js'].lineData[546]++;
    subMatchesCache[matchKey] = matchSubInternal(el, match);
    _$jscoverage['/selector.js'].lineData[547]++;
    return subMatchesCache[matchKey];
  }
  _$jscoverage['/selector.js'].lineData[552]++;
  function matchSubInternal(el, match) {
    _$jscoverage['/selector.js'].functionData[45]++;
    _$jscoverage['/selector.js'].lineData[553]++;
    var matchImmediateRet = matchImmediate(el, match);
    _$jscoverage['/selector.js'].lineData[554]++;
    if (visit163_554_1(matchImmediateRet === true)) {
      _$jscoverage['/selector.js'].lineData[555]++;
      return true;
    } else {
      _$jscoverage['/selector.js'].lineData[557]++;
      el = matchImmediateRet.el;
      _$jscoverage['/selector.js'].lineData[558]++;
      match = matchImmediateRet.match;
      _$jscoverage['/selector.js'].lineData[559]++;
      while (el) {
        _$jscoverage['/selector.js'].lineData[560]++;
        if (visit164_560_1(matchSub(el, match))) {
          _$jscoverage['/selector.js'].lineData[561]++;
          return true;
        }
        _$jscoverage['/selector.js'].lineData[563]++;
        el = dir(el, relativeExpr[match.nextCombinator].dir);
      }
      _$jscoverage['/selector.js'].lineData[565]++;
      return false;
    }
  }
  _$jscoverage['/selector.js'].lineData[569]++;
  function select(str, context, seeds) {
    _$jscoverage['/selector.js'].functionData[46]++;
    _$jscoverage['/selector.js'].lineData[570]++;
    if (visit165_570_1(!caches[str])) {
      _$jscoverage['/selector.js'].lineData[571]++;
      caches[str] = parser.parse(str);
    }
    _$jscoverage['/selector.js'].lineData[574]++;
    var selector = caches[str], groupIndex = 0, groupLen = selector.length, contextDocument, group, ret = [];
    _$jscoverage['/selector.js'].lineData[581]++;
    if (visit166_581_1(seeds)) {
      _$jscoverage['/selector.js'].lineData[582]++;
      context = visit167_582_1(context || seeds[0].ownerDocument);
    }
    _$jscoverage['/selector.js'].lineData[585]++;
    contextDocument = visit168_585_1(visit169_585_2(context && context.ownerDocument) || document);
    _$jscoverage['/selector.js'].lineData[587]++;
    context = visit170_587_1(context || contextDocument);
    _$jscoverage['/selector.js'].lineData[589]++;
    isContextXML = isXML(context);
    _$jscoverage['/selector.js'].lineData[591]++;
    for (; visit171_591_1(groupIndex < groupLen); groupIndex++) {
      _$jscoverage['/selector.js'].lineData[592]++;
      resetStatus();
      _$jscoverage['/selector.js'].lineData[594]++;
      group = selector[groupIndex];
      _$jscoverage['/selector.js'].lineData[596]++;
      var suffix = group.suffix, suffixIndex, suffixLen, seedsIndex, mySeeds = seeds, seedsLen, id = null;
      _$jscoverage['/selector.js'].lineData[604]++;
      if (visit172_604_1(!mySeeds)) {
        _$jscoverage['/selector.js'].lineData[605]++;
        if (visit173_605_1(suffix && !isContextXML)) {
          _$jscoverage['/selector.js'].lineData[606]++;
          suffixIndex = 0;
          _$jscoverage['/selector.js'].lineData[607]++;
          suffixLen = suffix.length;
          _$jscoverage['/selector.js'].lineData[608]++;
          for (; visit174_608_1(suffixIndex < suffixLen); suffixIndex++) {
            _$jscoverage['/selector.js'].lineData[609]++;
            var singleSuffix = suffix[suffixIndex];
            _$jscoverage['/selector.js'].lineData[610]++;
            if (visit175_610_1(singleSuffix.t === 'id')) {
              _$jscoverage['/selector.js'].lineData[611]++;
              id = singleSuffix.value;
              _$jscoverage['/selector.js'].lineData[612]++;
              break;
            }
          }
        }
        _$jscoverage['/selector.js'].lineData[617]++;
        if (visit176_617_1(id)) {
          _$jscoverage['/selector.js'].lineData[619]++;
          var doesNotHasById = !context.getElementById, contextInDom = Dom._contains(contextDocument, context), tmp = doesNotHasById ? (contextInDom ? contextDocument.getElementById(id) : null) : context.getElementById(id);
          _$jscoverage['/selector.js'].lineData[628]++;
          if (visit177_628_1(visit178_628_2(!tmp && doesNotHasById) || visit179_628_3(tmp && visit180_628_4(getAttr(tmp, 'id') !== id)))) {
            _$jscoverage['/selector.js'].lineData[629]++;
            var tmps = Dom._getElementsByTagName('*', context), tmpLen = tmps.length, tmpI = 0;
            _$jscoverage['/selector.js'].lineData[632]++;
            for (; visit181_632_1(tmpI < tmpLen); tmpI++) {
              _$jscoverage['/selector.js'].lineData[633]++;
              tmp = tmps[tmpI];
              _$jscoverage['/selector.js'].lineData[634]++;
              if (visit182_634_1(getAttr(tmp, 'id') === id)) {
                _$jscoverage['/selector.js'].lineData[635]++;
                mySeeds = [tmp];
                _$jscoverage['/selector.js'].lineData[636]++;
                break;
              }
            }
            _$jscoverage['/selector.js'].lineData[639]++;
            if (visit183_639_1(tmpI === tmpLen)) {
              _$jscoverage['/selector.js'].lineData[640]++;
              mySeeds = [];
            }
          } else {
            _$jscoverage['/selector.js'].lineData[643]++;
            if (visit184_643_1(contextInDom && visit185_643_2(tmp && visit186_643_3(context !== contextDocument)))) {
              _$jscoverage['/selector.js'].lineData[644]++;
              tmp = Dom._contains(context, tmp) ? tmp : null;
            }
            _$jscoverage['/selector.js'].lineData[646]++;
            mySeeds = tmp ? [tmp] : [];
          }
        } else {
          _$jscoverage['/selector.js'].lineData[649]++;
          mySeeds = Dom._getElementsByTagName(visit187_649_1(group.value || '*'), context);
        }
      }
      _$jscoverage['/selector.js'].lineData[653]++;
      seedsIndex = 0;
      _$jscoverage['/selector.js'].lineData[654]++;
      seedsLen = mySeeds.length;
      _$jscoverage['/selector.js'].lineData[656]++;
      if (visit188_656_1(!seedsLen)) {
        _$jscoverage['/selector.js'].lineData[657]++;
        continue;
      }
      _$jscoverage['/selector.js'].lineData[660]++;
      for (; visit189_660_1(seedsIndex < seedsLen); seedsIndex++) {
        _$jscoverage['/selector.js'].lineData[661]++;
        var seed = mySeeds[seedsIndex];
        _$jscoverage['/selector.js'].lineData[662]++;
        var matchHead = findFixedMatchFromHead(seed, group);
        _$jscoverage['/selector.js'].lineData[663]++;
        if (visit190_663_1(matchHead === true)) {
          _$jscoverage['/selector.js'].lineData[664]++;
          ret.push(seed);
        } else {
          _$jscoverage['/selector.js'].lineData[665]++;
          if (visit191_665_1(matchHead)) {
            _$jscoverage['/selector.js'].lineData[666]++;
            if (visit192_666_1(matchSub(matchHead.el, matchHead.match))) {
              _$jscoverage['/selector.js'].lineData[667]++;
              ret.push(seed);
            }
          }
        }
      }
    }
    _$jscoverage['/selector.js'].lineData[673]++;
    if (visit193_673_1(groupLen > 1)) {
      _$jscoverage['/selector.js'].lineData[674]++;
      ret = Dom.unique(ret);
    }
    _$jscoverage['/selector.js'].lineData[677]++;
    return ret;
  }
  _$jscoverage['/selector.js'].lineData[680]++;
  Dom._selectInternal = select;
  _$jscoverage['/selector.js'].lineData[682]++;
  return {
  parse: function(str) {
  _$jscoverage['/selector.js'].functionData[47]++;
  _$jscoverage['/selector.js'].lineData[684]++;
  return parser.parse(str);
}, 
  select: select, 
  matches: matches};
});
