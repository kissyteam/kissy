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
  _$jscoverage['/selector.js'].lineData[11] = 0;
  _$jscoverage['/selector.js'].lineData[15] = 0;
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
  _$jscoverage['/selector.js'].lineData[405] = 0;
  _$jscoverage['/selector.js'].lineData[407] = 0;
  _$jscoverage['/selector.js'].lineData[408] = 0;
  _$jscoverage['/selector.js'].lineData[409] = 0;
  _$jscoverage['/selector.js'].lineData[411] = 0;
  _$jscoverage['/selector.js'].lineData[412] = 0;
  _$jscoverage['/selector.js'].lineData[415] = 0;
  _$jscoverage['/selector.js'].lineData[416] = 0;
  _$jscoverage['/selector.js'].lineData[419] = 0;
  _$jscoverage['/selector.js'].lineData[424] = 0;
  _$jscoverage['/selector.js'].lineData[425] = 0;
  _$jscoverage['/selector.js'].lineData[428] = 0;
  _$jscoverage['/selector.js'].lineData[429] = 0;
  _$jscoverage['/selector.js'].lineData[430] = 0;
  _$jscoverage['/selector.js'].lineData[431] = 0;
  _$jscoverage['/selector.js'].lineData[432] = 0;
  _$jscoverage['/selector.js'].lineData[434] = 0;
  _$jscoverage['/selector.js'].lineData[435] = 0;
  _$jscoverage['/selector.js'].lineData[440] = 0;
  _$jscoverage['/selector.js'].lineData[444] = 0;
  _$jscoverage['/selector.js'].lineData[445] = 0;
  _$jscoverage['/selector.js'].lineData[450] = 0;
  _$jscoverage['/selector.js'].lineData[451] = 0;
  _$jscoverage['/selector.js'].lineData[452] = 0;
  _$jscoverage['/selector.js'].lineData[454] = 0;
  _$jscoverage['/selector.js'].lineData[455] = 0;
  _$jscoverage['/selector.js'].lineData[456] = 0;
  _$jscoverage['/selector.js'].lineData[458] = 0;
  _$jscoverage['/selector.js'].lineData[459] = 0;
  _$jscoverage['/selector.js'].lineData[460] = 0;
  _$jscoverage['/selector.js'].lineData[461] = 0;
  _$jscoverage['/selector.js'].lineData[468] = 0;
  _$jscoverage['/selector.js'].lineData[469] = 0;
  _$jscoverage['/selector.js'].lineData[471] = 0;
  _$jscoverage['/selector.js'].lineData[477] = 0;
  _$jscoverage['/selector.js'].lineData[486] = 0;
  _$jscoverage['/selector.js'].lineData[493] = 0;
  _$jscoverage['/selector.js'].lineData[494] = 0;
  _$jscoverage['/selector.js'].lineData[497] = 0;
  _$jscoverage['/selector.js'].lineData[498] = 0;
  _$jscoverage['/selector.js'].lineData[499] = 0;
  _$jscoverage['/selector.js'].lineData[501] = 0;
  _$jscoverage['/selector.js'].lineData[502] = 0;
  _$jscoverage['/selector.js'].lineData[503] = 0;
  _$jscoverage['/selector.js'].lineData[505] = 0;
  _$jscoverage['/selector.js'].lineData[506] = 0;
  _$jscoverage['/selector.js'].lineData[508] = 0;
  _$jscoverage['/selector.js'].lineData[509] = 0;
  _$jscoverage['/selector.js'].lineData[511] = 0;
  _$jscoverage['/selector.js'].lineData[517] = 0;
  _$jscoverage['/selector.js'].lineData[518] = 0;
  _$jscoverage['/selector.js'].lineData[520] = 0;
  _$jscoverage['/selector.js'].lineData[521] = 0;
  _$jscoverage['/selector.js'].lineData[522] = 0;
  _$jscoverage['/selector.js'].lineData[525] = 0;
  _$jscoverage['/selector.js'].lineData[526] = 0;
  _$jscoverage['/selector.js'].lineData[530] = 0;
  _$jscoverage['/selector.js'].lineData[533] = 0;
  _$jscoverage['/selector.js'].lineData[534] = 0;
  _$jscoverage['/selector.js'].lineData[536] = 0;
  _$jscoverage['/selector.js'].lineData[537] = 0;
  _$jscoverage['/selector.js'].lineData[538] = 0;
  _$jscoverage['/selector.js'].lineData[540] = 0;
  _$jscoverage['/selector.js'].lineData[541] = 0;
  _$jscoverage['/selector.js'].lineData[546] = 0;
  _$jscoverage['/selector.js'].lineData[547] = 0;
  _$jscoverage['/selector.js'].lineData[548] = 0;
  _$jscoverage['/selector.js'].lineData[549] = 0;
  _$jscoverage['/selector.js'].lineData[551] = 0;
  _$jscoverage['/selector.js'].lineData[552] = 0;
  _$jscoverage['/selector.js'].lineData[553] = 0;
  _$jscoverage['/selector.js'].lineData[554] = 0;
  _$jscoverage['/selector.js'].lineData[555] = 0;
  _$jscoverage['/selector.js'].lineData[557] = 0;
  _$jscoverage['/selector.js'].lineData[559] = 0;
  _$jscoverage['/selector.js'].lineData[563] = 0;
  _$jscoverage['/selector.js'].lineData[564] = 0;
  _$jscoverage['/selector.js'].lineData[565] = 0;
  _$jscoverage['/selector.js'].lineData[568] = 0;
  _$jscoverage['/selector.js'].lineData[575] = 0;
  _$jscoverage['/selector.js'].lineData[576] = 0;
  _$jscoverage['/selector.js'].lineData[579] = 0;
  _$jscoverage['/selector.js'].lineData[581] = 0;
  _$jscoverage['/selector.js'].lineData[583] = 0;
  _$jscoverage['/selector.js'].lineData[585] = 0;
  _$jscoverage['/selector.js'].lineData[586] = 0;
  _$jscoverage['/selector.js'].lineData[588] = 0;
  _$jscoverage['/selector.js'].lineData[590] = 0;
  _$jscoverage['/selector.js'].lineData[598] = 0;
  _$jscoverage['/selector.js'].lineData[599] = 0;
  _$jscoverage['/selector.js'].lineData[600] = 0;
  _$jscoverage['/selector.js'].lineData[601] = 0;
  _$jscoverage['/selector.js'].lineData[602] = 0;
  _$jscoverage['/selector.js'].lineData[603] = 0;
  _$jscoverage['/selector.js'].lineData[604] = 0;
  _$jscoverage['/selector.js'].lineData[605] = 0;
  _$jscoverage['/selector.js'].lineData[606] = 0;
  _$jscoverage['/selector.js'].lineData[611] = 0;
  _$jscoverage['/selector.js'].lineData[613] = 0;
  _$jscoverage['/selector.js'].lineData[622] = 0;
  _$jscoverage['/selector.js'].lineData[623] = 0;
  _$jscoverage['/selector.js'].lineData[626] = 0;
  _$jscoverage['/selector.js'].lineData[627] = 0;
  _$jscoverage['/selector.js'].lineData[628] = 0;
  _$jscoverage['/selector.js'].lineData[629] = 0;
  _$jscoverage['/selector.js'].lineData[630] = 0;
  _$jscoverage['/selector.js'].lineData[633] = 0;
  _$jscoverage['/selector.js'].lineData[634] = 0;
  _$jscoverage['/selector.js'].lineData[637] = 0;
  _$jscoverage['/selector.js'].lineData[638] = 0;
  _$jscoverage['/selector.js'].lineData[640] = 0;
  _$jscoverage['/selector.js'].lineData[643] = 0;
  _$jscoverage['/selector.js'].lineData[647] = 0;
  _$jscoverage['/selector.js'].lineData[648] = 0;
  _$jscoverage['/selector.js'].lineData[650] = 0;
  _$jscoverage['/selector.js'].lineData[651] = 0;
  _$jscoverage['/selector.js'].lineData[654] = 0;
  _$jscoverage['/selector.js'].lineData[655] = 0;
  _$jscoverage['/selector.js'].lineData[656] = 0;
  _$jscoverage['/selector.js'].lineData[657] = 0;
  _$jscoverage['/selector.js'].lineData[658] = 0;
  _$jscoverage['/selector.js'].lineData[659] = 0;
  _$jscoverage['/selector.js'].lineData[660] = 0;
  _$jscoverage['/selector.js'].lineData[661] = 0;
  _$jscoverage['/selector.js'].lineData[667] = 0;
  _$jscoverage['/selector.js'].lineData[668] = 0;
  _$jscoverage['/selector.js'].lineData[671] = 0;
  _$jscoverage['/selector.js'].lineData[674] = 0;
  _$jscoverage['/selector.js'].lineData[676] = 0;
  _$jscoverage['/selector.js'].lineData[678] = 0;
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
  _$jscoverage['/selector.js'].branchData['408'] = [];
  _$jscoverage['/selector.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['411'] = [];
  _$jscoverage['/selector.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['415'] = [];
  _$jscoverage['/selector.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['424'] = [];
  _$jscoverage['/selector.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['428'] = [];
  _$jscoverage['/selector.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['431'] = [];
  _$jscoverage['/selector.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['431'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['434'] = [];
  _$jscoverage['/selector.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['452'] = [];
  _$jscoverage['/selector.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['454'] = [];
  _$jscoverage['/selector.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['455'] = [];
  _$jscoverage['/selector.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['460'] = [];
  _$jscoverage['/selector.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['469'] = [];
  _$jscoverage['/selector.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['478'] = [];
  _$jscoverage['/selector.js'].branchData['478'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['498'] = [];
  _$jscoverage['/selector.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['502'] = [];
  _$jscoverage['/selector.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['507'] = [];
  _$jscoverage['/selector.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['508'] = [];
  _$jscoverage['/selector.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['520'] = [];
  _$jscoverage['/selector.js'].branchData['520'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['521'] = [];
  _$jscoverage['/selector.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['525'] = [];
  _$jscoverage['/selector.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['536'] = [];
  _$jscoverage['/selector.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['537'] = [];
  _$jscoverage['/selector.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['548'] = [];
  _$jscoverage['/selector.js'].branchData['548'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['554'] = [];
  _$jscoverage['/selector.js'].branchData['554'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['564'] = [];
  _$jscoverage['/selector.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['575'] = [];
  _$jscoverage['/selector.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['576'] = [];
  _$jscoverage['/selector.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['579'] = [];
  _$jscoverage['/selector.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['579'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['581'] = [];
  _$jscoverage['/selector.js'].branchData['581'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['585'] = [];
  _$jscoverage['/selector.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['598'] = [];
  _$jscoverage['/selector.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['599'] = [];
  _$jscoverage['/selector.js'].branchData['599'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['602'] = [];
  _$jscoverage['/selector.js'].branchData['602'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['604'] = [];
  _$jscoverage['/selector.js'].branchData['604'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['611'] = [];
  _$jscoverage['/selector.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['622'] = [];
  _$jscoverage['/selector.js'].branchData['622'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['622'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['622'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['622'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['626'] = [];
  _$jscoverage['/selector.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['628'] = [];
  _$jscoverage['/selector.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['633'] = [];
  _$jscoverage['/selector.js'].branchData['633'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['637'] = [];
  _$jscoverage['/selector.js'].branchData['637'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['637'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['637'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['643'] = [];
  _$jscoverage['/selector.js'].branchData['643'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['650'] = [];
  _$jscoverage['/selector.js'].branchData['650'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['654'] = [];
  _$jscoverage['/selector.js'].branchData['654'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['657'] = [];
  _$jscoverage['/selector.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['659'] = [];
  _$jscoverage['/selector.js'].branchData['659'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['660'] = [];
  _$jscoverage['/selector.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['667'] = [];
  _$jscoverage['/selector.js'].branchData['667'][1] = new BranchData();
}
_$jscoverage['/selector.js'].branchData['667'][1].init(3792, 12, 'groupLen > 1');
function visit198_667_1(result) {
  _$jscoverage['/selector.js'].branchData['667'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['660'][1].init(26, 39, 'matchSub(matchHead.el, matchHead.match)');
function visit197_660_1(result) {
  _$jscoverage['/selector.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['659'][1].init(229, 9, 'matchHead');
function visit196_659_1(result) {
  _$jscoverage['/selector.js'].branchData['659'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['657'][1].init(141, 18, 'matchHead === true');
function visit195_657_1(result) {
  _$jscoverage['/selector.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['654'][1].init(2737, 21, 'seedsIndex < seedsLen');
function visit194_654_1(result) {
  _$jscoverage['/selector.js'].branchData['654'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['650'][1].init(2660, 9, '!seedsLen');
function visit193_650_1(result) {
  _$jscoverage['/selector.js'].branchData['650'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['643'][1].init(58, 18, 'group.value || \'*\'');
function visit192_643_1(result) {
  _$jscoverage['/selector.js'].branchData['643'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['637'][3].init(53, 27, 'context !== contextDocument');
function visit191_637_3(result) {
  _$jscoverage['/selector.js'].branchData['637'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['637'][2].init(46, 34, 'tmp && context !== contextDocument');
function visit190_637_2(result) {
  _$jscoverage['/selector.js'].branchData['637'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['637'][1].init(30, 50, 'contextInDom && tmp && context !== contextDocument');
function visit189_637_1(result) {
  _$jscoverage['/selector.js'].branchData['637'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['633'][1].init(511, 15, 'tmpI === tmpLen');
function visit188_633_1(result) {
  _$jscoverage['/selector.js'].branchData['633'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['628'][1].init(81, 25, 'getAttr(tmp, \'id\') === id');
function visit187_628_1(result) {
  _$jscoverage['/selector.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['626'][1].init(200, 13, 'tmpI < tmpLen');
function visit186_626_1(result) {
  _$jscoverage['/selector.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['622'][4].init(667, 25, 'getAttr(tmp, \'id\') !== id');
function visit185_622_4(result) {
  _$jscoverage['/selector.js'].branchData['622'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['622'][3].init(660, 32, 'tmp && getAttr(tmp, \'id\') !== id');
function visit184_622_3(result) {
  _$jscoverage['/selector.js'].branchData['622'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['622'][2].init(634, 22, '!tmp && doesNotHasById');
function visit183_622_2(result) {
  _$jscoverage['/selector.js'].branchData['622'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['622'][1].init(634, 58, '!tmp && doesNotHasById || tmp && getAttr(tmp, \'id\') !== id');
function visit182_622_1(result) {
  _$jscoverage['/selector.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['611'][1].init(508, 2, 'id');
function visit181_611_1(result) {
  _$jscoverage['/selector.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['604'][1].init(95, 23, 'singleSuffix.t === \'id\'');
function visit180_604_1(result) {
  _$jscoverage['/selector.js'].branchData['604'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['602'][1].init(115, 23, 'suffixIndex < suffixLen');
function visit179_602_1(result) {
  _$jscoverage['/selector.js'].branchData['602'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['599'][1].init(22, 23, 'suffix && !isContextXML');
function visit178_599_1(result) {
  _$jscoverage['/selector.js'].branchData['599'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['598'][1].init(311, 8, '!mySeeds');
function visit177_598_1(result) {
  _$jscoverage['/selector.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['585'][1].init(546, 21, 'groupIndex < groupLen');
function visit176_585_1(result) {
  _$jscoverage['/selector.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['581'][1].init(458, 26, 'context || contextDocument');
function visit175_581_1(result) {
  _$jscoverage['/selector.js'].branchData['581'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['579'][2].init(391, 32, 'context && context.ownerDocument');
function visit174_579_2(result) {
  _$jscoverage['/selector.js'].branchData['579'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['579'][1].init(391, 44, 'context && context.ownerDocument || document');
function visit173_579_1(result) {
  _$jscoverage['/selector.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['576'][1].init(24, 33, 'context || seeds[0].ownerDocument');
function visit172_576_1(result) {
  _$jscoverage['/selector.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['575'][1].init(284, 5, 'seeds');
function visit171_575_1(result) {
  _$jscoverage['/selector.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['564'][1].init(14, 12, '!caches[str]');
function visit170_564_1(result) {
  _$jscoverage['/selector.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['554'][1].init(22, 19, 'matchSub(el, match)');
function visit169_554_1(result) {
  _$jscoverage['/selector.js'].branchData['554'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['548'][1].init(74, 26, 'matchImmediateRet === true');
function visit168_548_1(result) {
  _$jscoverage['/selector.js'].branchData['548'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['537'][1].init(133, 27, 'matchKey in subMatchesCache');
function visit167_537_1(result) {
  _$jscoverage['/selector.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['536'][1].init(101, 16, 'match.order || 0');
function visit166_536_1(result) {
  _$jscoverage['/selector.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['525'][1].init(18, 40, '!(selectorId = el[EXPANDO_SELECTOR_KEY])');
function visit165_525_1(result) {
  _$jscoverage['/selector.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['521'][1].init(18, 53, '!(selectorId = el.getAttribute(EXPANDO_SELECTOR_KEY))');
function visit164_521_1(result) {
  _$jscoverage['/selector.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['520'][1].init(41, 12, 'isContextXML');
function visit163_520_1(result) {
  _$jscoverage['/selector.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['508'][1].init(416, 3, '!el');
function visit162_508_1(result) {
  _$jscoverage['/selector.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['507'][1].init(311, 26, 'el && relativeOp.immediate');
function visit161_507_1(result) {
  _$jscoverage['/selector.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['502'][1].init(134, 4, '!cur');
function visit160_502_1(result) {
  _$jscoverage['/selector.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['498'][1].init(18, 21, '!singleMatch(el, cur)');
function visit159_498_1(result) {
  _$jscoverage['/selector.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['478'][1].init(30, 29, 'el && dir(el, relativeOp.dir)');
function visit158_478_1(result) {
  _$jscoverage['/selector.js'].branchData['478'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['469'][1].init(88, 20, 'relativeOp.immediate');
function visit157_469_1(result) {
  _$jscoverage['/selector.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['460'][1].init(293, 21, '!relativeOp.immediate');
function visit156_460_1(result) {
  _$jscoverage['/selector.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['455'][1].init(96, 6, '!match');
function visit155_455_1(result) {
  _$jscoverage['/selector.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['454'][1].init(54, 19, 'match && match.prev');
function visit154_454_1(result) {
  _$jscoverage['/selector.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['452'][1].init(66, 7, 'matched');
function visit153_452_1(result) {
  _$jscoverage['/selector.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['434'][1].init(160, 32, 'matchExpr[singleMatchSuffixType]');
function visit152_434_1(result) {
  _$jscoverage['/selector.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['431'][2].init(117, 33, 'matchSuffixIndex < matchSuffixLen');
function visit151_431_2(result) {
  _$jscoverage['/selector.js'].branchData['431'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['431'][1].init(106, 44, 'matched && matchSuffixIndex < matchSuffixLen');
function visit150_431_1(result) {
  _$jscoverage['/selector.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['428'][1].init(440, 22, 'matched && matchSuffix');
function visit149_428_1(result) {
  _$jscoverage['/selector.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['424'][1].init(337, 17, 'match.t === \'tag\'');
function visit148_424_1(result) {
  _$jscoverage['/selector.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['415'][1].init(134, 17, 'el.nodeType === 9');
function visit147_415_1(result) {
  _$jscoverage['/selector.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['411'][1].init(74, 3, '!el');
function visit146_411_1(result) {
  _$jscoverage['/selector.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['408'][1].init(14, 6, '!match');
function visit145_408_1(result) {
  _$jscoverage['/selector.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['375'][1].init(22, 23, '!pseudoIdentExpr[ident]');
function visit144_375_1(result) {
  _$jscoverage['/selector.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['369'][1].init(22, 27, '!(fn = pseudoFnExpr[fnStr])');
function visit143_369_1(result) {
  _$jscoverage['/selector.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['360'][1].init(171, 7, 'matchFn');
function visit142_360_1(result) {
  _$jscoverage['/selector.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['356'][1].init(22, 21, 'elValue === undefined');
function visit141_356_1(result) {
  _$jscoverage['/selector.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['355'][1].init(319, 5, 'match');
function visit140_355_1(result) {
  _$jscoverage['/selector.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['353'][2].init(242, 21, 'elValue !== undefined');
function visit139_353_2(result) {
  _$jscoverage['/selector.js'].branchData['353'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['353'][1].init(232, 31, '!match && elValue !== undefined');
function visit138_353_1(result) {
  _$jscoverage['/selector.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['348'][1].init(55, 13, '!isContextXML');
function visit137_348_1(result) {
  _$jscoverage['/selector.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['344'][1].init(21, 27, 'getAttr(el, \'id\') === value');
function visit136_344_1(result) {
  _$jscoverage['/selector.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['336'][1].init(21, 17, 'elValue === value');
function visit135_336_1(result) {
  _$jscoverage['/selector.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['333'][2].init(30, 29, 'elValue.indexOf(value) !== -1');
function visit134_333_2(result) {
  _$jscoverage['/selector.js'].branchData['333'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['333'][1].init(21, 38, 'value && elValue.indexOf(value) !== -1');
function visit133_333_1(result) {
  _$jscoverage['/selector.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['330'][1].init(21, 38, 'value && util.endsWith(elValue, value)');
function visit132_330_1(result) {
  _$jscoverage['/selector.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['327'][1].init(21, 40, 'value && util.startsWith(elValue, value)');
function visit131_327_1(result) {
  _$jscoverage['/selector.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['324'][1].init(22, 48, '(\' \' + elValue).indexOf(\' \' + value + \'-\') !== -1');
function visit130_324_1(result) {
  _$jscoverage['/selector.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['321'][1].init(118, 54, '(\' \' + elValue + \' \').indexOf(\' \' + value + \' \') !== -1');
function visit129_321_1(result) {
  _$jscoverage['/selector.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['318'][2].init(28, 23, 'value.indexOf(\' \') > -1');
function visit128_318_2(result) {
  _$jscoverage['/selector.js'].branchData['318'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['318'][1].init(18, 33, '!value || value.indexOf(\' \') > -1');
function visit127_318_1(result) {
  _$jscoverage['/selector.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['312'][2].init(56, 21, 'nodeName === \'option\'');
function visit126_312_2(result) {
  _$jscoverage['/selector.js'].branchData['312'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['312'][1].init(56, 36, 'nodeName === \'option\' && el.selected');
function visit125_312_1(result) {
  _$jscoverage['/selector.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['311'][3].init(77, 20, 'nodeName === \'input\'');
function visit124_311_3(result) {
  _$jscoverage['/selector.js'].branchData['311'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['311'][2].init(77, 34, 'nodeName === \'input\' && el.checked');
function visit123_311_2(result) {
  _$jscoverage['/selector.js'].branchData['311'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['311'][1].init(77, 94, '(nodeName === \'input\' && el.checked) || (nodeName === \'option\' && el.selected)');
function visit122_311_1(result) {
  _$jscoverage['/selector.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['301'][2].init(68, 35, 'hash.slice(1) === getAttr(el, \'id\')');
function visit121_301_2(result) {
  _$jscoverage['/selector.js'].branchData['301'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['301'][1].init(60, 43, 'hash && hash.slice(1) === getAttr(el, \'id\')');
function visit120_301_1(result) {
  _$jscoverage['/selector.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['297'][5].init(179, 16, 'el.tabIndex >= 0');
function visit119_297_5(result) {
  _$jscoverage['/selector.js'].branchData['297'][5].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['297'][4].init(168, 27, 'el.href || el.tabIndex >= 0');
function visit118_297_4(result) {
  _$jscoverage['/selector.js'].branchData['297'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['297'][3].init(157, 38, 'el.type || el.href || el.tabIndex >= 0');
function visit117_297_3(result) {
  _$jscoverage['/selector.js'].branchData['297'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['297'][2].init(118, 31, '!doc.hasFocus || doc.hasFocus()');
function visit116_297_2(result) {
  _$jscoverage['/selector.js'].branchData['297'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['297'][1].init(45, 78, '(!doc.hasFocus || doc.hasFocus()) && !!(el.type || el.href || el.tabIndex >= 0)');
function visit115_297_1(result) {
  _$jscoverage['/selector.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['296'][3].init(69, 24, 'el === doc.activeElement');
function visit114_296_3(result) {
  _$jscoverage['/selector.js'].branchData['296'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['296'][2].init(69, 124, 'el === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(el.type || el.href || el.tabIndex >= 0)');
function visit113_296_2(result) {
  _$jscoverage['/selector.js'].branchData['296'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['296'][1].init(62, 131, 'doc && el === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(el.type || el.href || el.tabIndex >= 0)');
function visit112_296_1(result) {
  _$jscoverage['/selector.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['291'][1].init(21, 92, 'pseudoIdentExpr[\'first-of-type\'](el) && pseudoIdentExpr[\'last-of-type\'](el)');
function visit111_291_1(result) {
  _$jscoverage['/selector.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['287'][1].init(21, 88, 'pseudoIdentExpr[\'first-child\'](el) && pseudoIdentExpr[\'last-child\'](el)');
function visit110_287_1(result) {
  _$jscoverage['/selector.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['272'][1].init(36, 39, 'el === el.ownerDocument.documentElement');
function visit109_272_1(result) {
  _$jscoverage['/selector.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['271'][1].init(21, 76, 'el.ownerDocument && el === el.ownerDocument.documentElement');
function visit108_271_1(result) {
  _$jscoverage['/selector.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['264'][7].init(340, 14, 'nodeType === 5');
function visit107_264_7(result) {
  _$jscoverage['/selector.js'].branchData['264'][7].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['264'][6].init(322, 14, 'nodeType === 4');
function visit106_264_6(result) {
  _$jscoverage['/selector.js'].branchData['264'][6].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['264'][5].init(322, 32, 'nodeType === 4 || nodeType === 5');
function visit105_264_5(result) {
  _$jscoverage['/selector.js'].branchData['264'][5].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['264'][4].init(304, 14, 'nodeType === 3');
function visit104_264_4(result) {
  _$jscoverage['/selector.js'].branchData['264'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['264'][3].init(304, 50, 'nodeType === 3 || nodeType === 4 || nodeType === 5');
function visit103_264_3(result) {
  _$jscoverage['/selector.js'].branchData['264'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['264'][2].init(286, 14, 'nodeType === 1');
function visit102_264_2(result) {
  _$jscoverage['/selector.js'].branchData['264'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['264'][1].init(286, 68, 'nodeType === 1 || nodeType === 3 || nodeType === 4 || nodeType === 5');
function visit101_264_1(result) {
  _$jscoverage['/selector.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['258'][1].init(191, 11, 'index < len');
function visit100_258_1(result) {
  _$jscoverage['/selector.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['243'][2].init(452, 17, 'el.nodeType === 1');
function visit99_243_2(result) {
  _$jscoverage['/selector.js'].branchData['243'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['243'][1].init(338, 40, '(el = el.parentNode) && el.nodeType === 1');
function visit98_243_1(result) {
  _$jscoverage['/selector.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['241'][3].init(100, 32, 'elLang.indexOf(lang + \'-\') === 0');
function visit97_241_3(result) {
  _$jscoverage['/selector.js'].branchData['241'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['241'][2].init(81, 15, 'elLang === lang');
function visit96_241_2(result) {
  _$jscoverage['/selector.js'].branchData['241'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['241'][1].init(81, 51, 'elLang === lang || elLang.indexOf(lang + \'-\') === 0');
function visit95_241_1(result) {
  _$jscoverage['/selector.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['238'][1].init(35, 54, 'el.getAttribute(\'xml:lang\') || el.getAttribute(\'lang\')');
function visit94_238_1(result) {
  _$jscoverage['/selector.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['225'][1].init(138, 17, 'ret !== undefined');
function visit93_225_1(result) {
  _$jscoverage['/selector.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['224'][1].init(94, 12, 'child === el');
function visit92_224_1(result) {
  _$jscoverage['/selector.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['222'][1].init(74, 24, 'child.tagName === elType');
function visit91_222_1(result) {
  _$jscoverage['/selector.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['220'][1].init(258, 10, 'count >= 0');
function visit90_220_1(result) {
  _$jscoverage['/selector.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['213'][1].init(258, 6, 'parent');
function visit89_213_1(result) {
  _$jscoverage['/selector.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['208'][3].init(119, 7, 'b === 0');
function visit88_208_3(result) {
  _$jscoverage['/selector.js'].branchData['208'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['208'][2].init(108, 7, 'a === 0');
function visit87_208_2(result) {
  _$jscoverage['/selector.js'].branchData['208'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['208'][1].init(108, 18, 'a === 0 && b === 0');
function visit86_208_1(result) {
  _$jscoverage['/selector.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['196'][1].init(138, 17, 'ret !== undefined');
function visit85_196_1(result) {
  _$jscoverage['/selector.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['195'][1].init(94, 12, 'child === el');
function visit84_195_1(result) {
  _$jscoverage['/selector.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['193'][1].init(74, 24, 'child.tagName === elType');
function visit83_193_1(result) {
  _$jscoverage['/selector.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['191'][1].init(252, 11, 'count < len');
function visit82_191_1(result) {
  _$jscoverage['/selector.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['184'][1].init(258, 6, 'parent');
function visit81_184_1(result) {
  _$jscoverage['/selector.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['179'][3].init(119, 7, 'b === 0');
function visit80_179_3(result) {
  _$jscoverage['/selector.js'].branchData['179'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['179'][2].init(108, 7, 'a === 0');
function visit79_179_2(result) {
  _$jscoverage['/selector.js'].branchData['179'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['179'][1].init(108, 18, 'a === 0 && b === 0');
function visit78_179_1(result) {
  _$jscoverage['/selector.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['167'][1].init(138, 17, 'ret !== undefined');
function visit77_167_1(result) {
  _$jscoverage['/selector.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['166'][1].init(94, 12, 'child === el');
function visit76_166_1(result) {
  _$jscoverage['/selector.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['164'][1].init(74, 20, 'child.nodeType === 1');
function visit75_164_1(result) {
  _$jscoverage['/selector.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['162'][1].init(216, 10, 'count >= 0');
function visit74_162_1(result) {
  _$jscoverage['/selector.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['156'][1].init(258, 6, 'parent');
function visit73_156_1(result) {
  _$jscoverage['/selector.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['151'][3].init(119, 7, 'b === 0');
function visit72_151_3(result) {
  _$jscoverage['/selector.js'].branchData['151'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['151'][2].init(108, 7, 'a === 0');
function visit71_151_2(result) {
  _$jscoverage['/selector.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['151'][1].init(108, 18, 'a === 0 && b === 0');
function visit70_151_1(result) {
  _$jscoverage['/selector.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['139'][1].init(138, 17, 'ret !== undefined');
function visit69_139_1(result) {
  _$jscoverage['/selector.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['138'][1].init(94, 12, 'child === el');
function visit68_138_1(result) {
  _$jscoverage['/selector.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['136'][1].init(74, 20, 'child.nodeType === 1');
function visit67_136_1(result) {
  _$jscoverage['/selector.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['134'][1].init(210, 11, 'count < len');
function visit66_134_1(result) {
  _$jscoverage['/selector.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['128'][1].init(258, 6, 'parent');
function visit65_128_1(result) {
  _$jscoverage['/selector.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['123'][3].init(119, 7, 'b === 0');
function visit64_123_3(result) {
  _$jscoverage['/selector.js'].branchData['123'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['123'][2].init(108, 7, 'a === 0');
function visit63_123_2(result) {
  _$jscoverage['/selector.js'].branchData['123'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['123'][1].init(108, 18, 'a === 0 && b === 0');
function visit62_123_1(result) {
  _$jscoverage['/selector.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['115'][1].init(120, 49, 'documentElement.nodeName.toLowerCase() !== \'html\'');
function visit61_115_1(result) {
  _$jscoverage['/selector.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['114'][2].init(41, 26, 'elem.ownerDocument || elem');
function visit60_114_2(result) {
  _$jscoverage['/selector.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['114'][1].init(32, 52, 'elem && (elem.ownerDocument || elem).documentElement');
function visit59_114_1(result) {
  _$jscoverage['/selector.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['106'][4].init(43, 20, '(index - b) % a === 0');
function visit58_106_4(result) {
  _$jscoverage['/selector.js'].branchData['106'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['106'][3].init(43, 26, '(index - b) % a === 0 && eq');
function visit57_106_3(result) {
  _$jscoverage['/selector.js'].branchData['106'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['106'][2].init(19, 19, '(index - b) / a >= 0');
function visit56_106_2(result) {
  _$jscoverage['/selector.js'].branchData['106'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['106'][1].init(19, 50, '(index - b) / a >= 0 && (index - b) % a === 0 && eq');
function visit55_106_1(result) {
  _$jscoverage['/selector.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['102'][1].init(18, 11, 'index === b');
function visit54_102_1(result) {
  _$jscoverage['/selector.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['101'][1].init(14, 7, 'a === 0');
function visit53_101_1(result) {
  _$jscoverage['/selector.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['92'][1].init(367, 26, 'parseInt(match[3], 10) || 0');
function visit52_92_1(result) {
  _$jscoverage['/selector.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['83'][1].init(26, 16, 'match[2] === \'-\'');
function visit51_83_1(result) {
  _$jscoverage['/selector.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['82'][1].init(66, 8, 'isNaN(a)');
function visit50_82_1(result) {
  _$jscoverage['/selector.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['80'][1].init(18, 8, 'match[1]');
function visit49_80_1(result) {
  _$jscoverage['/selector.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['76'][1].init(228, 16, 'param === \'even\'');
function visit48_76_1(result) {
  _$jscoverage['/selector.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['73'][1].init(148, 15, 'param === \'odd\'');
function visit47_73_1(result) {
  _$jscoverage['/selector.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['71'][1].init(74, 25, 'typeof param === \'number\'');
function visit46_71_1(result) {
  _$jscoverage['/selector.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['63'][2].init(73, 17, 'el.nodeType !== 1');
function visit45_63_2(result) {
  _$jscoverage['/selector.js'].branchData['63'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['63'][1].init(55, 23, 'el && el.nodeType !== 1');
function visit44_63_1(result) {
  _$jscoverage['/selector.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['39'][1].init(91, 8, 'high < 0');
function visit43_39_1(result) {
  _$jscoverage['/selector.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['21'][1].init(18, 12, 'isContextXML');
function visit42_21_1(result) {
  _$jscoverage['/selector.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/selector.js'].functionData[0]++;
  _$jscoverage['/selector.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/selector.js'].lineData[8]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/selector.js'].lineData[9]++;
  var parser = require('./selector/parser');
  _$jscoverage['/selector.js'].lineData[10]++;
  var Dom = require('dom/basic');
  _$jscoverage['/selector.js'].lineData[11]++;
  logger.info('use KISSY css3 selector');
  _$jscoverage['/selector.js'].lineData[15]++;
  var EXPANDO_SELECTOR_KEY = '_ks_data_selector_id_', caches = {}, isContextXML, uuid = 0, subMatchesCache = {}, getAttr = function(el, name) {
  _$jscoverage['/selector.js'].functionData[1]++;
  _$jscoverage['/selector.js'].lineData[21]++;
  if (visit42_21_1(isContextXML)) {
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
  return isNaN(high) ? escaped : visit43_39_1(high < 0) ? String.fromCharCode(high + 0x10000) : String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
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
    } while (visit44_63_1(el && visit45_63_2(el.nodeType !== 1)));
    _$jscoverage['/selector.js'].lineData[64]++;
    return el;
  }
  _$jscoverage['/selector.js'].lineData[67]++;
  function getAb(param) {
    _$jscoverage['/selector.js'].functionData[7]++;
    _$jscoverage['/selector.js'].lineData[68]++;
    var a = 0, match, b = 0;
    _$jscoverage['/selector.js'].lineData[71]++;
    if (visit46_71_1(typeof param === 'number')) {
      _$jscoverage['/selector.js'].lineData[72]++;
      b = param;
    } else {
      _$jscoverage['/selector.js'].lineData[73]++;
      if (visit47_73_1(param === 'odd')) {
        _$jscoverage['/selector.js'].lineData[74]++;
        a = 2;
        _$jscoverage['/selector.js'].lineData[75]++;
        b = 1;
      } else {
        _$jscoverage['/selector.js'].lineData[76]++;
        if (visit48_76_1(param === 'even')) {
          _$jscoverage['/selector.js'].lineData[77]++;
          a = 2;
          _$jscoverage['/selector.js'].lineData[78]++;
          b = 0;
        } else {
          _$jscoverage['/selector.js'].lineData[79]++;
          if ((match = param.replace(/\s/g, '').match(aNPlusB))) {
            _$jscoverage['/selector.js'].lineData[80]++;
            if (visit49_80_1(match[1])) {
              _$jscoverage['/selector.js'].lineData[81]++;
              a = parseInt(match[2], 10);
              _$jscoverage['/selector.js'].lineData[82]++;
              if (visit50_82_1(isNaN(a))) {
                _$jscoverage['/selector.js'].lineData[83]++;
                if (visit51_83_1(match[2] === '-')) {
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
            b = visit52_92_1(parseInt(match[3], 10) || 0);
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
    if (visit53_101_1(a === 0)) {
      _$jscoverage['/selector.js'].lineData[102]++;
      if (visit54_102_1(index === b)) {
        _$jscoverage['/selector.js'].lineData[103]++;
        return eq;
      }
    } else {
      _$jscoverage['/selector.js'].lineData[106]++;
      if (visit55_106_1(visit56_106_2((index - b) / a >= 0) && visit57_106_3(visit58_106_4((index - b) % a === 0) && eq))) {
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
    var documentElement = visit59_114_1(elem && (visit60_114_2(elem.ownerDocument || elem)).documentElement);
    _$jscoverage['/selector.js'].lineData[115]++;
    return documentElement ? visit61_115_1(documentElement.nodeName.toLowerCase() !== 'html') : false;
  }
  _$jscoverage['/selector.js'].lineData[118]++;
  var pseudoFnExpr = {
  'nth-child': function(el, param) {
  _$jscoverage['/selector.js'].functionData[10]++;
  _$jscoverage['/selector.js'].lineData[120]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[123]++;
  if (visit62_123_1(visit63_123_2(a === 0) && visit64_123_3(b === 0))) {
    _$jscoverage['/selector.js'].lineData[124]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[126]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[128]++;
  if (visit65_128_1(parent)) {
    _$jscoverage['/selector.js'].lineData[129]++;
    var childNodes = parent.childNodes, count = 0, child, ret, len = childNodes.length;
    _$jscoverage['/selector.js'].lineData[134]++;
    for (; visit66_134_1(count < len); count++) {
      _$jscoverage['/selector.js'].lineData[135]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[136]++;
      if (visit67_136_1(child.nodeType === 1)) {
        _$jscoverage['/selector.js'].lineData[137]++;
        index++;
        _$jscoverage['/selector.js'].lineData[138]++;
        ret = matchIndexByAb(index, a, b, visit68_138_1(child === el));
        _$jscoverage['/selector.js'].lineData[139]++;
        if (visit69_139_1(ret !== undefined)) {
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
  if (visit70_151_1(visit71_151_2(a === 0) && visit72_151_3(b === 0))) {
    _$jscoverage['/selector.js'].lineData[152]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[154]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[156]++;
  if (visit73_156_1(parent)) {
    _$jscoverage['/selector.js'].lineData[157]++;
    var childNodes = parent.childNodes, len = childNodes.length, count = len - 1, child, ret;
    _$jscoverage['/selector.js'].lineData[162]++;
    for (; visit74_162_1(count >= 0); count--) {
      _$jscoverage['/selector.js'].lineData[163]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[164]++;
      if (visit75_164_1(child.nodeType === 1)) {
        _$jscoverage['/selector.js'].lineData[165]++;
        index++;
        _$jscoverage['/selector.js'].lineData[166]++;
        ret = matchIndexByAb(index, a, b, visit76_166_1(child === el));
        _$jscoverage['/selector.js'].lineData[167]++;
        if (visit77_167_1(ret !== undefined)) {
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
  if (visit78_179_1(visit79_179_2(a === 0) && visit80_179_3(b === 0))) {
    _$jscoverage['/selector.js'].lineData[180]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[182]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[184]++;
  if (visit81_184_1(parent)) {
    _$jscoverage['/selector.js'].lineData[185]++;
    var childNodes = parent.childNodes, elType = el.tagName, count = 0, child, ret, len = childNodes.length;
    _$jscoverage['/selector.js'].lineData[191]++;
    for (; visit82_191_1(count < len); count++) {
      _$jscoverage['/selector.js'].lineData[192]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[193]++;
      if (visit83_193_1(child.tagName === elType)) {
        _$jscoverage['/selector.js'].lineData[194]++;
        index++;
        _$jscoverage['/selector.js'].lineData[195]++;
        ret = matchIndexByAb(index, a, b, visit84_195_1(child === el));
        _$jscoverage['/selector.js'].lineData[196]++;
        if (visit85_196_1(ret !== undefined)) {
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
  if (visit86_208_1(visit87_208_2(a === 0) && visit88_208_3(b === 0))) {
    _$jscoverage['/selector.js'].lineData[209]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[211]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[213]++;
  if (visit89_213_1(parent)) {
    _$jscoverage['/selector.js'].lineData[214]++;
    var childNodes = parent.childNodes, len = childNodes.length, elType = el.tagName, count = len - 1, child, ret;
    _$jscoverage['/selector.js'].lineData[220]++;
    for (; visit90_220_1(count >= 0); count--) {
      _$jscoverage['/selector.js'].lineData[221]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[222]++;
      if (visit91_222_1(child.tagName === elType)) {
        _$jscoverage['/selector.js'].lineData[223]++;
        index++;
        _$jscoverage['/selector.js'].lineData[224]++;
        ret = matchIndexByAb(index, a, b, visit92_224_1(child === el));
        _$jscoverage['/selector.js'].lineData[225]++;
        if (visit93_225_1(ret !== undefined)) {
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
    if ((elLang = (isContextXML ? visit94_238_1(el.getAttribute('xml:lang') || el.getAttribute('lang')) : el.lang))) {
      _$jscoverage['/selector.js'].lineData[240]++;
      elLang = elLang.toLowerCase();
      _$jscoverage['/selector.js'].lineData[241]++;
      return visit95_241_1(visit96_241_2(elLang === lang) || visit97_241_3(elLang.indexOf(lang + '-') === 0));
    }
  } while (visit98_243_1((el = el.parentNode) && visit99_243_2(el.nodeType === 1)));
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
  for (; visit100_258_1(index < len); index++) {
    _$jscoverage['/selector.js'].lineData[259]++;
    child = childNodes[index];
    _$jscoverage['/selector.js'].lineData[260]++;
    nodeType = child.nodeType;
    _$jscoverage['/selector.js'].lineData[264]++;
    if (visit101_264_1(visit102_264_2(nodeType === 1) || visit103_264_3(visit104_264_4(nodeType === 3) || visit105_264_5(visit106_264_6(nodeType === 4) || visit107_264_7(nodeType === 5))))) {
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
  return visit108_271_1(el.ownerDocument && visit109_272_1(el === el.ownerDocument.documentElement));
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
  return visit110_287_1(pseudoIdentExpr['first-child'](el) && pseudoIdentExpr['last-child'](el));
}, 
  'only-of-type': function(el) {
  _$jscoverage['/selector.js'].functionData[23]++;
  _$jscoverage['/selector.js'].lineData[291]++;
  return visit111_291_1(pseudoIdentExpr['first-of-type'](el) && pseudoIdentExpr['last-of-type'](el));
}, 
  focus: function(el) {
  _$jscoverage['/selector.js'].functionData[24]++;
  _$jscoverage['/selector.js'].lineData[295]++;
  var doc = el.ownerDocument;
  _$jscoverage['/selector.js'].lineData[296]++;
  return visit112_296_1(doc && visit113_296_2(visit114_296_3(el === doc.activeElement) && visit115_297_1((visit116_297_2(!doc.hasFocus || doc.hasFocus())) && !!(visit117_297_3(el.type || visit118_297_4(el.href || visit119_297_5(el.tabIndex >= 0)))))));
}, 
  target: function(el) {
  _$jscoverage['/selector.js'].functionData[25]++;
  _$jscoverage['/selector.js'].lineData[300]++;
  var hash = location.hash;
  _$jscoverage['/selector.js'].lineData[301]++;
  return visit120_301_1(hash && visit121_301_2(hash.slice(1) === getAttr(el, 'id')));
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
  return visit122_311_1((visit123_311_2(visit124_311_3(nodeName === 'input') && el.checked)) || (visit125_312_1(visit126_312_2(nodeName === 'option') && el.selected)));
}};
  _$jscoverage['/selector.js'].lineData[316]++;
  var attributeExpr = {
  '~=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[29]++;
  _$jscoverage['/selector.js'].lineData[318]++;
  if (visit127_318_1(!value || visit128_318_2(value.indexOf(' ') > -1))) {
    _$jscoverage['/selector.js'].lineData[319]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[321]++;
  return visit129_321_1((' ' + elValue + ' ').indexOf(' ' + value + ' ') !== -1);
}, 
  '|=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[30]++;
  _$jscoverage['/selector.js'].lineData[324]++;
  return visit130_324_1((' ' + elValue).indexOf(' ' + value + '-') !== -1);
}, 
  '^=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[31]++;
  _$jscoverage['/selector.js'].lineData[327]++;
  return visit131_327_1(value && util.startsWith(elValue, value));
}, 
  '$=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[32]++;
  _$jscoverage['/selector.js'].lineData[330]++;
  return visit132_330_1(value && util.endsWith(elValue, value));
}, 
  '*=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[33]++;
  _$jscoverage['/selector.js'].lineData[333]++;
  return visit133_333_1(value && visit134_333_2(elValue.indexOf(value) !== -1));
}, 
  '=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[34]++;
  _$jscoverage['/selector.js'].lineData[336]++;
  return visit135_336_1(elValue === value);
}};
  _$jscoverage['/selector.js'].lineData[340]++;
  var matchExpr = {
  tag: isTag, 
  cls: hasSingleClass, 
  id: function(el, value) {
  _$jscoverage['/selector.js'].functionData[35]++;
  _$jscoverage['/selector.js'].lineData[344]++;
  return visit136_344_1(getAttr(el, 'id') === value);
}, 
  attrib: function(el, value) {
  _$jscoverage['/selector.js'].functionData[36]++;
  _$jscoverage['/selector.js'].lineData[347]++;
  var name = value.ident;
  _$jscoverage['/selector.js'].lineData[348]++;
  if (visit137_348_1(!isContextXML)) {
    _$jscoverage['/selector.js'].lineData[349]++;
    name = name.toLowerCase();
  }
  _$jscoverage['/selector.js'].lineData[351]++;
  var elValue = getAttr(el, name);
  _$jscoverage['/selector.js'].lineData[352]++;
  var match = value.match;
  _$jscoverage['/selector.js'].lineData[353]++;
  if (visit138_353_1(!match && visit139_353_2(elValue !== undefined))) {
    _$jscoverage['/selector.js'].lineData[354]++;
    return 1;
  } else {
    _$jscoverage['/selector.js'].lineData[355]++;
    if (visit140_355_1(match)) {
      _$jscoverage['/selector.js'].lineData[356]++;
      if (visit141_356_1(elValue === undefined)) {
        _$jscoverage['/selector.js'].lineData[357]++;
        return 0;
      }
      _$jscoverage['/selector.js'].lineData[359]++;
      var matchFn = attributeExpr[match];
      _$jscoverage['/selector.js'].lineData[360]++;
      if (visit142_360_1(matchFn)) {
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
    if (visit143_369_1(!(fn = pseudoFnExpr[fnStr]))) {
      _$jscoverage['/selector.js'].lineData[370]++;
      throw new SyntaxError('Syntax error: not support pseudo: ' + fnStr);
    }
    _$jscoverage['/selector.js'].lineData[372]++;
    return fn(el, value.param);
  }
  _$jscoverage['/selector.js'].lineData[374]++;
  if ((ident = value.ident)) {
    _$jscoverage['/selector.js'].lineData[375]++;
    if (visit144_375_1(!pseudoIdentExpr[ident])) {
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
  function matches(str, seeds) {
    _$jscoverage['/selector.js'].functionData[38]++;
    _$jscoverage['/selector.js'].lineData[402]++;
    return Dom._selectInternal(str, null, seeds);
  }
  _$jscoverage['/selector.js'].lineData[405]++;
  Dom._matchesInternal = matches;
  _$jscoverage['/selector.js'].lineData[407]++;
  function singleMatch(el, match) {
    _$jscoverage['/selector.js'].functionData[39]++;
    _$jscoverage['/selector.js'].lineData[408]++;
    if (visit145_408_1(!match)) {
      _$jscoverage['/selector.js'].lineData[409]++;
      return true;
    }
    _$jscoverage['/selector.js'].lineData[411]++;
    if (visit146_411_1(!el)) {
      _$jscoverage['/selector.js'].lineData[412]++;
      return false;
    }
    _$jscoverage['/selector.js'].lineData[415]++;
    if (visit147_415_1(el.nodeType === 9)) {
      _$jscoverage['/selector.js'].lineData[416]++;
      return false;
    }
    _$jscoverage['/selector.js'].lineData[419]++;
    var matched = 1, matchSuffix = match.suffix, matchSuffixLen, matchSuffixIndex;
    _$jscoverage['/selector.js'].lineData[424]++;
    if (visit148_424_1(match.t === 'tag')) {
      _$jscoverage['/selector.js'].lineData[425]++;
      matched &= matchExpr.tag(el, match.value);
    }
    _$jscoverage['/selector.js'].lineData[428]++;
    if (visit149_428_1(matched && matchSuffix)) {
      _$jscoverage['/selector.js'].lineData[429]++;
      matchSuffixLen = matchSuffix.length;
      _$jscoverage['/selector.js'].lineData[430]++;
      matchSuffixIndex = 0;
      _$jscoverage['/selector.js'].lineData[431]++;
      for (; visit150_431_1(matched && visit151_431_2(matchSuffixIndex < matchSuffixLen)); matchSuffixIndex++) {
        _$jscoverage['/selector.js'].lineData[432]++;
        var singleMatchSuffix = matchSuffix[matchSuffixIndex], singleMatchSuffixType = singleMatchSuffix.t;
        _$jscoverage['/selector.js'].lineData[434]++;
        if (visit152_434_1(matchExpr[singleMatchSuffixType])) {
          _$jscoverage['/selector.js'].lineData[435]++;
          matched &= matchExpr[singleMatchSuffixType](el, singleMatchSuffix.value);
        }
      }
    }
    _$jscoverage['/selector.js'].lineData[440]++;
    return matched;
  }
  _$jscoverage['/selector.js'].lineData[444]++;
  function matchImmediate(el, match) {
    _$jscoverage['/selector.js'].functionData[40]++;
    _$jscoverage['/selector.js'].lineData[445]++;
    var matched = 1, startEl = el, relativeOp, startMatch = match;
    _$jscoverage['/selector.js'].lineData[450]++;
    do {
      _$jscoverage['/selector.js'].lineData[451]++;
      matched &= singleMatch(el, match);
      _$jscoverage['/selector.js'].lineData[452]++;
      if (visit153_452_1(matched)) {
        _$jscoverage['/selector.js'].lineData[454]++;
        match = visit154_454_1(match && match.prev);
        _$jscoverage['/selector.js'].lineData[455]++;
        if (visit155_455_1(!match)) {
          _$jscoverage['/selector.js'].lineData[456]++;
          return true;
        }
        _$jscoverage['/selector.js'].lineData[458]++;
        relativeOp = relativeExpr[match.nextCombinator];
        _$jscoverage['/selector.js'].lineData[459]++;
        el = dir(el, relativeOp.dir);
        _$jscoverage['/selector.js'].lineData[460]++;
        if (visit156_460_1(!relativeOp.immediate)) {
          _$jscoverage['/selector.js'].lineData[461]++;
          return {
  el: el, 
  match: match};
        }
      } else {
        _$jscoverage['/selector.js'].lineData[468]++;
        relativeOp = relativeExpr[match.nextCombinator];
        _$jscoverage['/selector.js'].lineData[469]++;
        if (visit157_469_1(relativeOp.immediate)) {
          _$jscoverage['/selector.js'].lineData[471]++;
          return {
  el: dir(startEl, relativeExpr[startMatch.nextCombinator].dir), 
  match: startMatch};
        } else {
          _$jscoverage['/selector.js'].lineData[477]++;
          return {
  el: visit158_478_1(el && dir(el, relativeOp.dir)), 
  match: match};
        }
      }
    } while (el);
    _$jscoverage['/selector.js'].lineData[486]++;
    return {
  el: dir(startEl, relativeExpr[startMatch.nextCombinator].dir), 
  match: startMatch};
  }
  _$jscoverage['/selector.js'].lineData[493]++;
  function findFixedMatchFromHead(el, head) {
    _$jscoverage['/selector.js'].functionData[41]++;
    _$jscoverage['/selector.js'].lineData[494]++;
    var relativeOp, cur = head;
    _$jscoverage['/selector.js'].lineData[497]++;
    do {
      _$jscoverage['/selector.js'].lineData[498]++;
      if (visit159_498_1(!singleMatch(el, cur))) {
        _$jscoverage['/selector.js'].lineData[499]++;
        return null;
      }
      _$jscoverage['/selector.js'].lineData[501]++;
      cur = cur.prev;
      _$jscoverage['/selector.js'].lineData[502]++;
      if (visit160_502_1(!cur)) {
        _$jscoverage['/selector.js'].lineData[503]++;
        return true;
      }
      _$jscoverage['/selector.js'].lineData[505]++;
      relativeOp = relativeExpr[cur.nextCombinator];
      _$jscoverage['/selector.js'].lineData[506]++;
      el = dir(el, relativeOp.dir);
    } while (visit161_507_1(el && relativeOp.immediate));
    _$jscoverage['/selector.js'].lineData[508]++;
    if (visit162_508_1(!el)) {
      _$jscoverage['/selector.js'].lineData[509]++;
      return null;
    }
    _$jscoverage['/selector.js'].lineData[511]++;
    return {
  el: el, 
  match: cur};
  }
  _$jscoverage['/selector.js'].lineData[517]++;
  function genId(el) {
    _$jscoverage['/selector.js'].functionData[42]++;
    _$jscoverage['/selector.js'].lineData[518]++;
    var selectorId;
    _$jscoverage['/selector.js'].lineData[520]++;
    if (visit163_520_1(isContextXML)) {
      _$jscoverage['/selector.js'].lineData[521]++;
      if (visit164_521_1(!(selectorId = el.getAttribute(EXPANDO_SELECTOR_KEY)))) {
        _$jscoverage['/selector.js'].lineData[522]++;
        el.setAttribute(EXPANDO_SELECTOR_KEY, selectorId = (+new Date() + '_' + (++uuid)));
      }
    } else {
      _$jscoverage['/selector.js'].lineData[525]++;
      if (visit165_525_1(!(selectorId = el[EXPANDO_SELECTOR_KEY]))) {
        _$jscoverage['/selector.js'].lineData[526]++;
        selectorId = el[EXPANDO_SELECTOR_KEY] = (+new Date()) + '_' + (++uuid);
      }
    }
    _$jscoverage['/selector.js'].lineData[530]++;
    return selectorId;
  }
  _$jscoverage['/selector.js'].lineData[533]++;
  function matchSub(el, match) {
    _$jscoverage['/selector.js'].functionData[43]++;
    _$jscoverage['/selector.js'].lineData[534]++;
    var selectorId = genId(el), matchKey;
    _$jscoverage['/selector.js'].lineData[536]++;
    matchKey = selectorId + '_' + (visit166_536_1(match.order || 0));
    _$jscoverage['/selector.js'].lineData[537]++;
    if (visit167_537_1(matchKey in subMatchesCache)) {
      _$jscoverage['/selector.js'].lineData[538]++;
      return subMatchesCache[matchKey];
    }
    _$jscoverage['/selector.js'].lineData[540]++;
    subMatchesCache[matchKey] = matchSubInternal(el, match);
    _$jscoverage['/selector.js'].lineData[541]++;
    return subMatchesCache[matchKey];
  }
  _$jscoverage['/selector.js'].lineData[546]++;
  function matchSubInternal(el, match) {
    _$jscoverage['/selector.js'].functionData[44]++;
    _$jscoverage['/selector.js'].lineData[547]++;
    var matchImmediateRet = matchImmediate(el, match);
    _$jscoverage['/selector.js'].lineData[548]++;
    if (visit168_548_1(matchImmediateRet === true)) {
      _$jscoverage['/selector.js'].lineData[549]++;
      return true;
    } else {
      _$jscoverage['/selector.js'].lineData[551]++;
      el = matchImmediateRet.el;
      _$jscoverage['/selector.js'].lineData[552]++;
      match = matchImmediateRet.match;
      _$jscoverage['/selector.js'].lineData[553]++;
      while (el) {
        _$jscoverage['/selector.js'].lineData[554]++;
        if (visit169_554_1(matchSub(el, match))) {
          _$jscoverage['/selector.js'].lineData[555]++;
          return true;
        }
        _$jscoverage['/selector.js'].lineData[557]++;
        el = dir(el, relativeExpr[match.nextCombinator].dir);
      }
      _$jscoverage['/selector.js'].lineData[559]++;
      return false;
    }
  }
  _$jscoverage['/selector.js'].lineData[563]++;
  function select(str, context, seeds) {
    _$jscoverage['/selector.js'].functionData[45]++;
    _$jscoverage['/selector.js'].lineData[564]++;
    if (visit170_564_1(!caches[str])) {
      _$jscoverage['/selector.js'].lineData[565]++;
      caches[str] = parser.parse(str);
    }
    _$jscoverage['/selector.js'].lineData[568]++;
    var selector = caches[str], groupIndex = 0, groupLen = selector.length, contextDocument, group, ret = [];
    _$jscoverage['/selector.js'].lineData[575]++;
    if (visit171_575_1(seeds)) {
      _$jscoverage['/selector.js'].lineData[576]++;
      context = visit172_576_1(context || seeds[0].ownerDocument);
    }
    _$jscoverage['/selector.js'].lineData[579]++;
    contextDocument = visit173_579_1(visit174_579_2(context && context.ownerDocument) || document);
    _$jscoverage['/selector.js'].lineData[581]++;
    context = visit175_581_1(context || contextDocument);
    _$jscoverage['/selector.js'].lineData[583]++;
    isContextXML = isXML(context);
    _$jscoverage['/selector.js'].lineData[585]++;
    for (; visit176_585_1(groupIndex < groupLen); groupIndex++) {
      _$jscoverage['/selector.js'].lineData[586]++;
      resetStatus();
      _$jscoverage['/selector.js'].lineData[588]++;
      group = selector[groupIndex];
      _$jscoverage['/selector.js'].lineData[590]++;
      var suffix = group.suffix, suffixIndex, suffixLen, seedsIndex, mySeeds = seeds, seedsLen, id = null;
      _$jscoverage['/selector.js'].lineData[598]++;
      if (visit177_598_1(!mySeeds)) {
        _$jscoverage['/selector.js'].lineData[599]++;
        if (visit178_599_1(suffix && !isContextXML)) {
          _$jscoverage['/selector.js'].lineData[600]++;
          suffixIndex = 0;
          _$jscoverage['/selector.js'].lineData[601]++;
          suffixLen = suffix.length;
          _$jscoverage['/selector.js'].lineData[602]++;
          for (; visit179_602_1(suffixIndex < suffixLen); suffixIndex++) {
            _$jscoverage['/selector.js'].lineData[603]++;
            var singleSuffix = suffix[suffixIndex];
            _$jscoverage['/selector.js'].lineData[604]++;
            if (visit180_604_1(singleSuffix.t === 'id')) {
              _$jscoverage['/selector.js'].lineData[605]++;
              id = singleSuffix.value;
              _$jscoverage['/selector.js'].lineData[606]++;
              break;
            }
          }
        }
        _$jscoverage['/selector.js'].lineData[611]++;
        if (visit181_611_1(id)) {
          _$jscoverage['/selector.js'].lineData[613]++;
          var doesNotHasById = !context.getElementById, contextInDom = Dom._contains(contextDocument, context), tmp = doesNotHasById ? (contextInDom ? contextDocument.getElementById(id) : null) : context.getElementById(id);
          _$jscoverage['/selector.js'].lineData[622]++;
          if (visit182_622_1(visit183_622_2(!tmp && doesNotHasById) || visit184_622_3(tmp && visit185_622_4(getAttr(tmp, 'id') !== id)))) {
            _$jscoverage['/selector.js'].lineData[623]++;
            var tmps = Dom._getElementsByTagName('*', context), tmpLen = tmps.length, tmpI = 0;
            _$jscoverage['/selector.js'].lineData[626]++;
            for (; visit186_626_1(tmpI < tmpLen); tmpI++) {
              _$jscoverage['/selector.js'].lineData[627]++;
              tmp = tmps[tmpI];
              _$jscoverage['/selector.js'].lineData[628]++;
              if (visit187_628_1(getAttr(tmp, 'id') === id)) {
                _$jscoverage['/selector.js'].lineData[629]++;
                mySeeds = [tmp];
                _$jscoverage['/selector.js'].lineData[630]++;
                break;
              }
            }
            _$jscoverage['/selector.js'].lineData[633]++;
            if (visit188_633_1(tmpI === tmpLen)) {
              _$jscoverage['/selector.js'].lineData[634]++;
              mySeeds = [];
            }
          } else {
            _$jscoverage['/selector.js'].lineData[637]++;
            if (visit189_637_1(contextInDom && visit190_637_2(tmp && visit191_637_3(context !== contextDocument)))) {
              _$jscoverage['/selector.js'].lineData[638]++;
              tmp = Dom._contains(context, tmp) ? tmp : null;
            }
            _$jscoverage['/selector.js'].lineData[640]++;
            mySeeds = tmp ? [tmp] : [];
          }
        } else {
          _$jscoverage['/selector.js'].lineData[643]++;
          mySeeds = Dom._getElementsByTagName(visit192_643_1(group.value || '*'), context);
        }
      }
      _$jscoverage['/selector.js'].lineData[647]++;
      seedsIndex = 0;
      _$jscoverage['/selector.js'].lineData[648]++;
      seedsLen = mySeeds.length;
      _$jscoverage['/selector.js'].lineData[650]++;
      if (visit193_650_1(!seedsLen)) {
        _$jscoverage['/selector.js'].lineData[651]++;
        continue;
      }
      _$jscoverage['/selector.js'].lineData[654]++;
      for (; visit194_654_1(seedsIndex < seedsLen); seedsIndex++) {
        _$jscoverage['/selector.js'].lineData[655]++;
        var seed = mySeeds[seedsIndex];
        _$jscoverage['/selector.js'].lineData[656]++;
        var matchHead = findFixedMatchFromHead(seed, group);
        _$jscoverage['/selector.js'].lineData[657]++;
        if (visit195_657_1(matchHead === true)) {
          _$jscoverage['/selector.js'].lineData[658]++;
          ret.push(seed);
        } else {
          _$jscoverage['/selector.js'].lineData[659]++;
          if (visit196_659_1(matchHead)) {
            _$jscoverage['/selector.js'].lineData[660]++;
            if (visit197_660_1(matchSub(matchHead.el, matchHead.match))) {
              _$jscoverage['/selector.js'].lineData[661]++;
              ret.push(seed);
            }
          }
        }
      }
    }
    _$jscoverage['/selector.js'].lineData[667]++;
    if (visit198_667_1(groupLen > 1)) {
      _$jscoverage['/selector.js'].lineData[668]++;
      ret = Dom.unique(ret);
    }
    _$jscoverage['/selector.js'].lineData[671]++;
    return ret;
  }
  _$jscoverage['/selector.js'].lineData[674]++;
  Dom._selectInternal = select;
  _$jscoverage['/selector.js'].lineData[676]++;
  return {
  parse: function(str) {
  _$jscoverage['/selector.js'].functionData[46]++;
  _$jscoverage['/selector.js'].lineData[678]++;
  return parser.parse(str);
}, 
  select: select, 
  matches: matches};
});
