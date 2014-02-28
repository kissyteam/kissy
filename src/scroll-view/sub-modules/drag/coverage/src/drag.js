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
if (! _$jscoverage['/drag.js']) {
  _$jscoverage['/drag.js'] = {};
  _$jscoverage['/drag.js'].lineData = [];
  _$jscoverage['/drag.js'].lineData[6] = 0;
  _$jscoverage['/drag.js'].lineData[7] = 0;
  _$jscoverage['/drag.js'].lineData[8] = 0;
  _$jscoverage['/drag.js'].lineData[9] = 0;
  _$jscoverage['/drag.js'].lineData[10] = 0;
  _$jscoverage['/drag.js'].lineData[12] = 0;
  _$jscoverage['/drag.js'].lineData[14] = 0;
  _$jscoverage['/drag.js'].lineData[16] = 0;
  _$jscoverage['/drag.js'].lineData[18] = 0;
  _$jscoverage['/drag.js'].lineData[20] = 0;
  _$jscoverage['/drag.js'].lineData[22] = 0;
  _$jscoverage['/drag.js'].lineData[24] = 0;
  _$jscoverage['/drag.js'].lineData[25] = 0;
  _$jscoverage['/drag.js'].lineData[27] = 0;
  _$jscoverage['/drag.js'].lineData[28] = 0;
  _$jscoverage['/drag.js'].lineData[29] = 0;
  _$jscoverage['/drag.js'].lineData[32] = 0;
  _$jscoverage['/drag.js'].lineData[33] = 0;
  _$jscoverage['/drag.js'].lineData[34] = 0;
  _$jscoverage['/drag.js'].lineData[36] = 0;
  _$jscoverage['/drag.js'].lineData[40] = 0;
  _$jscoverage['/drag.js'].lineData[42] = 0;
  _$jscoverage['/drag.js'].lineData[53] = 0;
  _$jscoverage['/drag.js'].lineData[54] = 0;
  _$jscoverage['/drag.js'].lineData[55] = 0;
  _$jscoverage['/drag.js'].lineData[58] = 0;
  _$jscoverage['/drag.js'].lineData[59] = 0;
  _$jscoverage['/drag.js'].lineData[62] = 0;
  _$jscoverage['/drag.js'].lineData[63] = 0;
  _$jscoverage['/drag.js'].lineData[64] = 0;
  _$jscoverage['/drag.js'].lineData[65] = 0;
  _$jscoverage['/drag.js'].lineData[66] = 0;
  _$jscoverage['/drag.js'].lineData[67] = 0;
  _$jscoverage['/drag.js'].lineData[68] = 0;
  _$jscoverage['/drag.js'].lineData[69] = 0;
  _$jscoverage['/drag.js'].lineData[72] = 0;
  _$jscoverage['/drag.js'].lineData[75] = 0;
  _$jscoverage['/drag.js'].lineData[77] = 0;
  _$jscoverage['/drag.js'].lineData[78] = 0;
  _$jscoverage['/drag.js'].lineData[82] = 0;
  _$jscoverage['/drag.js'].lineData[83] = 0;
  _$jscoverage['/drag.js'].lineData[85] = 0;
  _$jscoverage['/drag.js'].lineData[88] = 0;
  _$jscoverage['/drag.js'].lineData[89] = 0;
  _$jscoverage['/drag.js'].lineData[90] = 0;
  _$jscoverage['/drag.js'].lineData[91] = 0;
  _$jscoverage['/drag.js'].lineData[93] = 0;
  _$jscoverage['/drag.js'].lineData[96] = 0;
  _$jscoverage['/drag.js'].lineData[97] = 0;
  _$jscoverage['/drag.js'].lineData[98] = 0;
  _$jscoverage['/drag.js'].lineData[99] = 0;
  _$jscoverage['/drag.js'].lineData[101] = 0;
  _$jscoverage['/drag.js'].lineData[108] = 0;
  _$jscoverage['/drag.js'].lineData[109] = 0;
  _$jscoverage['/drag.js'].lineData[110] = 0;
  _$jscoverage['/drag.js'].lineData[111] = 0;
  _$jscoverage['/drag.js'].lineData[113] = 0;
  _$jscoverage['/drag.js'].lineData[114] = 0;
  _$jscoverage['/drag.js'].lineData[115] = 0;
  _$jscoverage['/drag.js'].lineData[116] = 0;
  _$jscoverage['/drag.js'].lineData[122] = 0;
  _$jscoverage['/drag.js'].lineData[125] = 0;
  _$jscoverage['/drag.js'].lineData[126] = 0;
  _$jscoverage['/drag.js'].lineData[127] = 0;
  _$jscoverage['/drag.js'].lineData[130] = 0;
  _$jscoverage['/drag.js'].lineData[131] = 0;
  _$jscoverage['/drag.js'].lineData[135] = 0;
  _$jscoverage['/drag.js'].lineData[136] = 0;
  _$jscoverage['/drag.js'].lineData[137] = 0;
  _$jscoverage['/drag.js'].lineData[143] = 0;
  _$jscoverage['/drag.js'].lineData[145] = 0;
  _$jscoverage['/drag.js'].lineData[150] = 0;
  _$jscoverage['/drag.js'].lineData[161] = 0;
  _$jscoverage['/drag.js'].lineData[162] = 0;
  _$jscoverage['/drag.js'].lineData[164] = 0;
  _$jscoverage['/drag.js'].lineData[167] = 0;
  _$jscoverage['/drag.js'].lineData[168] = 0;
  _$jscoverage['/drag.js'].lineData[169] = 0;
  _$jscoverage['/drag.js'].lineData[170] = 0;
  _$jscoverage['/drag.js'].lineData[171] = 0;
  _$jscoverage['/drag.js'].lineData[173] = 0;
  _$jscoverage['/drag.js'].lineData[175] = 0;
  _$jscoverage['/drag.js'].lineData[176] = 0;
  _$jscoverage['/drag.js'].lineData[177] = 0;
  _$jscoverage['/drag.js'].lineData[178] = 0;
  _$jscoverage['/drag.js'].lineData[179] = 0;
  _$jscoverage['/drag.js'].lineData[182] = 0;
  _$jscoverage['/drag.js'].lineData[183] = 0;
  _$jscoverage['/drag.js'].lineData[187] = 0;
  _$jscoverage['/drag.js'].lineData[189] = 0;
  _$jscoverage['/drag.js'].lineData[190] = 0;
  _$jscoverage['/drag.js'].lineData[192] = 0;
  _$jscoverage['/drag.js'].lineData[193] = 0;
  _$jscoverage['/drag.js'].lineData[194] = 0;
  _$jscoverage['/drag.js'].lineData[196] = 0;
  _$jscoverage['/drag.js'].lineData[197] = 0;
  _$jscoverage['/drag.js'].lineData[198] = 0;
  _$jscoverage['/drag.js'].lineData[200] = 0;
  _$jscoverage['/drag.js'].lineData[201] = 0;
  _$jscoverage['/drag.js'].lineData[207] = 0;
  _$jscoverage['/drag.js'].lineData[209] = 0;
  _$jscoverage['/drag.js'].lineData[211] = 0;
  _$jscoverage['/drag.js'].lineData[213] = 0;
  _$jscoverage['/drag.js'].lineData[217] = 0;
  _$jscoverage['/drag.js'].lineData[218] = 0;
  _$jscoverage['/drag.js'].lineData[219] = 0;
  _$jscoverage['/drag.js'].lineData[221] = 0;
  _$jscoverage['/drag.js'].lineData[226] = 0;
  _$jscoverage['/drag.js'].lineData[229] = 0;
  _$jscoverage['/drag.js'].lineData[230] = 0;
  _$jscoverage['/drag.js'].lineData[232] = 0;
  _$jscoverage['/drag.js'].lineData[234] = 0;
  _$jscoverage['/drag.js'].lineData[237] = 0;
  _$jscoverage['/drag.js'].lineData[239] = 0;
  _$jscoverage['/drag.js'].lineData[243] = 0;
  _$jscoverage['/drag.js'].lineData[244] = 0;
  _$jscoverage['/drag.js'].lineData[245] = 0;
  _$jscoverage['/drag.js'].lineData[247] = 0;
  _$jscoverage['/drag.js'].lineData[249] = 0;
  _$jscoverage['/drag.js'].lineData[251] = 0;
  _$jscoverage['/drag.js'].lineData[253] = 0;
  _$jscoverage['/drag.js'].lineData[254] = 0;
  _$jscoverage['/drag.js'].lineData[255] = 0;
  _$jscoverage['/drag.js'].lineData[256] = 0;
  _$jscoverage['/drag.js'].lineData[259] = 0;
  _$jscoverage['/drag.js'].lineData[262] = 0;
  _$jscoverage['/drag.js'].lineData[263] = 0;
  _$jscoverage['/drag.js'].lineData[264] = 0;
  _$jscoverage['/drag.js'].lineData[266] = 0;
  _$jscoverage['/drag.js'].lineData[269] = 0;
  _$jscoverage['/drag.js'].lineData[270] = 0;
  _$jscoverage['/drag.js'].lineData[273] = 0;
  _$jscoverage['/drag.js'].lineData[278] = 0;
  _$jscoverage['/drag.js'].lineData[279] = 0;
  _$jscoverage['/drag.js'].lineData[282] = 0;
  _$jscoverage['/drag.js'].lineData[283] = 0;
  _$jscoverage['/drag.js'].lineData[285] = 0;
  _$jscoverage['/drag.js'].lineData[286] = 0;
  _$jscoverage['/drag.js'].lineData[287] = 0;
  _$jscoverage['/drag.js'].lineData[291] = 0;
  _$jscoverage['/drag.js'].lineData[295] = 0;
  _$jscoverage['/drag.js'].lineData[296] = 0;
  _$jscoverage['/drag.js'].lineData[298] = 0;
  _$jscoverage['/drag.js'].lineData[299] = 0;
  _$jscoverage['/drag.js'].lineData[302] = 0;
  _$jscoverage['/drag.js'].lineData[304] = 0;
  _$jscoverage['/drag.js'].lineData[305] = 0;
  _$jscoverage['/drag.js'].lineData[306] = 0;
  _$jscoverage['/drag.js'].lineData[308] = 0;
  _$jscoverage['/drag.js'].lineData[311] = 0;
  _$jscoverage['/drag.js'].lineData[313] = 0;
  _$jscoverage['/drag.js'].lineData[314] = 0;
  _$jscoverage['/drag.js'].lineData[315] = 0;
  _$jscoverage['/drag.js'].lineData[317] = 0;
  _$jscoverage['/drag.js'].lineData[321] = 0;
  _$jscoverage['/drag.js'].lineData[322] = 0;
  _$jscoverage['/drag.js'].lineData[325] = 0;
  _$jscoverage['/drag.js'].lineData[326] = 0;
  _$jscoverage['/drag.js'].lineData[329] = 0;
  _$jscoverage['/drag.js'].lineData[332] = 0;
  _$jscoverage['/drag.js'].lineData[333] = 0;
  _$jscoverage['/drag.js'].lineData[336] = 0;
  _$jscoverage['/drag.js'].lineData[337] = 0;
  _$jscoverage['/drag.js'].lineData[338] = 0;
  _$jscoverage['/drag.js'].lineData[340] = 0;
  _$jscoverage['/drag.js'].lineData[341] = 0;
  _$jscoverage['/drag.js'].lineData[343] = 0;
  _$jscoverage['/drag.js'].lineData[344] = 0;
  _$jscoverage['/drag.js'].lineData[345] = 0;
  _$jscoverage['/drag.js'].lineData[347] = 0;
  _$jscoverage['/drag.js'].lineData[348] = 0;
  _$jscoverage['/drag.js'].lineData[349] = 0;
  _$jscoverage['/drag.js'].lineData[358] = 0;
  _$jscoverage['/drag.js'].lineData[359] = 0;
  _$jscoverage['/drag.js'].lineData[360] = 0;
  _$jscoverage['/drag.js'].lineData[361] = 0;
  _$jscoverage['/drag.js'].lineData[362] = 0;
  _$jscoverage['/drag.js'].lineData[363] = 0;
  _$jscoverage['/drag.js'].lineData[364] = 0;
  _$jscoverage['/drag.js'].lineData[365] = 0;
  _$jscoverage['/drag.js'].lineData[367] = 0;
  _$jscoverage['/drag.js'].lineData[368] = 0;
  _$jscoverage['/drag.js'].lineData[369] = 0;
  _$jscoverage['/drag.js'].lineData[370] = 0;
  _$jscoverage['/drag.js'].lineData[371] = 0;
  _$jscoverage['/drag.js'].lineData[372] = 0;
  _$jscoverage['/drag.js'].lineData[382] = 0;
  _$jscoverage['/drag.js'].lineData[383] = 0;
  _$jscoverage['/drag.js'].lineData[384] = 0;
  _$jscoverage['/drag.js'].lineData[387] = 0;
  _$jscoverage['/drag.js'].lineData[388] = 0;
  _$jscoverage['/drag.js'].lineData[389] = 0;
  _$jscoverage['/drag.js'].lineData[390] = 0;
  _$jscoverage['/drag.js'].lineData[391] = 0;
  _$jscoverage['/drag.js'].lineData[393] = 0;
  _$jscoverage['/drag.js'].lineData[399] = 0;
  _$jscoverage['/drag.js'].lineData[400] = 0;
  _$jscoverage['/drag.js'].lineData[402] = 0;
  _$jscoverage['/drag.js'].lineData[404] = 0;
  _$jscoverage['/drag.js'].lineData[405] = 0;
  _$jscoverage['/drag.js'].lineData[406] = 0;
  _$jscoverage['/drag.js'].lineData[409] = 0;
  _$jscoverage['/drag.js'].lineData[413] = 0;
  _$jscoverage['/drag.js'].lineData[414] = 0;
  _$jscoverage['/drag.js'].lineData[415] = 0;
  _$jscoverage['/drag.js'].lineData[416] = 0;
  _$jscoverage['/drag.js'].lineData[417] = 0;
  _$jscoverage['/drag.js'].lineData[418] = 0;
  _$jscoverage['/drag.js'].lineData[419] = 0;
  _$jscoverage['/drag.js'].lineData[423] = 0;
  _$jscoverage['/drag.js'].lineData[424] = 0;
  _$jscoverage['/drag.js'].lineData[425] = 0;
  _$jscoverage['/drag.js'].lineData[426] = 0;
  _$jscoverage['/drag.js'].lineData[427] = 0;
  _$jscoverage['/drag.js'].lineData[428] = 0;
  _$jscoverage['/drag.js'].lineData[429] = 0;
  _$jscoverage['/drag.js'].lineData[430] = 0;
  _$jscoverage['/drag.js'].lineData[431] = 0;
  _$jscoverage['/drag.js'].lineData[432] = 0;
  _$jscoverage['/drag.js'].lineData[433] = 0;
  _$jscoverage['/drag.js'].lineData[438] = 0;
  _$jscoverage['/drag.js'].lineData[439] = 0;
  _$jscoverage['/drag.js'].lineData[440] = 0;
  _$jscoverage['/drag.js'].lineData[441] = 0;
  _$jscoverage['/drag.js'].lineData[442] = 0;
  _$jscoverage['/drag.js'].lineData[443] = 0;
  _$jscoverage['/drag.js'].lineData[444] = 0;
  _$jscoverage['/drag.js'].lineData[449] = 0;
  _$jscoverage['/drag.js'].lineData[450] = 0;
  _$jscoverage['/drag.js'].lineData[451] = 0;
  _$jscoverage['/drag.js'].lineData[453] = 0;
  _$jscoverage['/drag.js'].lineData[454] = 0;
  _$jscoverage['/drag.js'].lineData[457] = 0;
  _$jscoverage['/drag.js'].lineData[460] = 0;
  _$jscoverage['/drag.js'].lineData[461] = 0;
  _$jscoverage['/drag.js'].lineData[464] = 0;
  _$jscoverage['/drag.js'].lineData[466] = 0;
  _$jscoverage['/drag.js'].lineData[467] = 0;
  _$jscoverage['/drag.js'].lineData[474] = 0;
  _$jscoverage['/drag.js'].lineData[475] = 0;
  _$jscoverage['/drag.js'].lineData[478] = 0;
  _$jscoverage['/drag.js'].lineData[479] = 0;
  _$jscoverage['/drag.js'].lineData[480] = 0;
  _$jscoverage['/drag.js'].lineData[481] = 0;
  _$jscoverage['/drag.js'].lineData[485] = 0;
  _$jscoverage['/drag.js'].lineData[486] = 0;
  _$jscoverage['/drag.js'].lineData[487] = 0;
  _$jscoverage['/drag.js'].lineData[490] = 0;
  _$jscoverage['/drag.js'].lineData[491] = 0;
  _$jscoverage['/drag.js'].lineData[500] = 0;
  _$jscoverage['/drag.js'].lineData[502] = 0;
  _$jscoverage['/drag.js'].lineData[503] = 0;
  _$jscoverage['/drag.js'].lineData[504] = 0;
  _$jscoverage['/drag.js'].lineData[505] = 0;
  _$jscoverage['/drag.js'].lineData[506] = 0;
  _$jscoverage['/drag.js'].lineData[514] = 0;
  _$jscoverage['/drag.js'].lineData[516] = 0;
  _$jscoverage['/drag.js'].lineData[520] = 0;
  _$jscoverage['/drag.js'].lineData[524] = 0;
  _$jscoverage['/drag.js'].lineData[525] = 0;
}
if (! _$jscoverage['/drag.js'].functionData) {
  _$jscoverage['/drag.js'].functionData = [];
  _$jscoverage['/drag.js'].functionData[0] = 0;
  _$jscoverage['/drag.js'].functionData[1] = 0;
  _$jscoverage['/drag.js'].functionData[2] = 0;
  _$jscoverage['/drag.js'].functionData[3] = 0;
  _$jscoverage['/drag.js'].functionData[4] = 0;
  _$jscoverage['/drag.js'].functionData[5] = 0;
  _$jscoverage['/drag.js'].functionData[6] = 0;
  _$jscoverage['/drag.js'].functionData[7] = 0;
  _$jscoverage['/drag.js'].functionData[8] = 0;
  _$jscoverage['/drag.js'].functionData[9] = 0;
  _$jscoverage['/drag.js'].functionData[10] = 0;
  _$jscoverage['/drag.js'].functionData[11] = 0;
  _$jscoverage['/drag.js'].functionData[12] = 0;
  _$jscoverage['/drag.js'].functionData[13] = 0;
  _$jscoverage['/drag.js'].functionData[14] = 0;
  _$jscoverage['/drag.js'].functionData[15] = 0;
  _$jscoverage['/drag.js'].functionData[16] = 0;
  _$jscoverage['/drag.js'].functionData[17] = 0;
  _$jscoverage['/drag.js'].functionData[18] = 0;
}
if (! _$jscoverage['/drag.js'].branchData) {
  _$jscoverage['/drag.js'].branchData = {};
  _$jscoverage['/drag.js'].branchData['33'] = [];
  _$jscoverage['/drag.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['40'] = [];
  _$jscoverage['/drag.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['53'] = [];
  _$jscoverage['/drag.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['54'] = [];
  _$jscoverage['/drag.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['55'] = [];
  _$jscoverage['/drag.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['58'] = [];
  _$jscoverage['/drag.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['62'] = [];
  _$jscoverage['/drag.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['66'] = [];
  _$jscoverage['/drag.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['75'] = [];
  _$jscoverage['/drag.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['75'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['75'][4] = new BranchData();
  _$jscoverage['/drag.js'].branchData['76'] = [];
  _$jscoverage['/drag.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['89'] = [];
  _$jscoverage['/drag.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['90'] = [];
  _$jscoverage['/drag.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['97'] = [];
  _$jscoverage['/drag.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['108'] = [];
  _$jscoverage['/drag.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['110'] = [];
  _$jscoverage['/drag.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['113'] = [];
  _$jscoverage['/drag.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['125'] = [];
  _$jscoverage['/drag.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['135'] = [];
  _$jscoverage['/drag.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['135'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['135'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['182'] = [];
  _$jscoverage['/drag.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['190'] = [];
  _$jscoverage['/drag.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['190'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['190'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['192'] = [];
  _$jscoverage['/drag.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['207'] = [];
  _$jscoverage['/drag.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['218'] = [];
  _$jscoverage['/drag.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['229'] = [];
  _$jscoverage['/drag.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['234'] = [];
  _$jscoverage['/drag.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['236'] = [];
  _$jscoverage['/drag.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['243'] = [];
  _$jscoverage['/drag.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['247'] = [];
  _$jscoverage['/drag.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['263'] = [];
  _$jscoverage['/drag.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['269'] = [];
  _$jscoverage['/drag.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['282'] = [];
  _$jscoverage['/drag.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['285'] = [];
  _$jscoverage['/drag.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['295'] = [];
  _$jscoverage['/drag.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['298'] = [];
  _$jscoverage['/drag.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['299'] = [];
  _$jscoverage['/drag.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['302'] = [];
  _$jscoverage['/drag.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['302'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['305'] = [];
  _$jscoverage['/drag.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['311'] = [];
  _$jscoverage['/drag.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['311'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['311'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['314'] = [];
  _$jscoverage['/drag.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['321'] = [];
  _$jscoverage['/drag.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['332'] = [];
  _$jscoverage['/drag.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['337'] = [];
  _$jscoverage['/drag.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['344'] = [];
  _$jscoverage['/drag.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['364'] = [];
  _$jscoverage['/drag.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['364'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['365'] = [];
  _$jscoverage['/drag.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['365'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['369'] = [];
  _$jscoverage['/drag.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['382'] = [];
  _$jscoverage['/drag.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['404'] = [];
  _$jscoverage['/drag.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['405'] = [];
  _$jscoverage['/drag.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['413'] = [];
  _$jscoverage['/drag.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['415'] = [];
  _$jscoverage['/drag.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['416'] = [];
  _$jscoverage['/drag.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['416'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['416'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['418'] = [];
  _$jscoverage['/drag.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['418'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['418'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['426'] = [];
  _$jscoverage['/drag.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['428'] = [];
  _$jscoverage['/drag.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['430'] = [];
  _$jscoverage['/drag.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['431'] = [];
  _$jscoverage['/drag.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['439'] = [];
  _$jscoverage['/drag.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['441'] = [];
  _$jscoverage['/drag.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['442'] = [];
  _$jscoverage['/drag.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['449'] = [];
  _$jscoverage['/drag.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['450'] = [];
  _$jscoverage['/drag.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['460'] = [];
  _$jscoverage['/drag.js'].branchData['460'][1] = new BranchData();
}
_$jscoverage['/drag.js'].branchData['460'][1].init(29, 16, 'allowX || allowY');
function visit81_460_1(result) {
  _$jscoverage['/drag.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['450'][1].init(33, 26, 'newPageIndex !== pageIndex');
function visit80_450_1(result) {
  _$jscoverage['/drag.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['449'][1].init(2113, 26, 'newPageIndex !== undefined');
function visit79_449_1(result) {
  _$jscoverage['/drag.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['442'][1].init(41, 23, 'min < nowXY.top - x.top');
function visit78_442_1(result) {
  _$jscoverage['/drag.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['441'][1].init(86, 17, 'x.top < nowXY.top');
function visit77_441_1(result) {
  _$jscoverage['/drag.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['439'][1].init(93, 15, 'i < prepareXLen');
function visit76_439_1(result) {
  _$jscoverage['/drag.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['431'][1].init(41, 23, 'min < x.top - nowXY.top');
function visit75_431_1(result) {
  _$jscoverage['/drag.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['430'][1].init(86, 17, 'x.top > nowXY.top');
function visit74_430_1(result) {
  _$jscoverage['/drag.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['428'][1].init(93, 15, 'i < prepareXLen');
function visit73_428_1(result) {
  _$jscoverage['/drag.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['426'][1].init(957, 11, 'offsetY > 0');
function visit72_426_1(result) {
  _$jscoverage['/drag.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['418'][3].init(198, 24, 'offset.left < nowXY.left');
function visit71_418_3(result) {
  _$jscoverage['/drag.js'].branchData['418'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['418'][2].init(183, 11, 'offsetX < 0');
function visit70_418_2(result) {
  _$jscoverage['/drag.js'].branchData['418'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['418'][1].init(183, 39, 'offsetX < 0 && offset.left < nowXY.left');
function visit69_418_1(result) {
  _$jscoverage['/drag.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['416'][3].init(52, 24, 'offset.left > nowXY.left');
function visit68_416_3(result) {
  _$jscoverage['/drag.js'].branchData['416'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['416'][2].init(37, 11, 'offsetX > 0');
function visit67_416_2(result) {
  _$jscoverage['/drag.js'].branchData['416'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['416'][1].init(37, 39, 'offsetX > 0 && offset.left > nowXY.left');
function visit66_416_1(result) {
  _$jscoverage['/drag.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['415'][1].init(90, 6, 'offset');
function visit65_415_1(result) {
  _$jscoverage['/drag.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['413'][1].init(307, 18, 'i < pagesOffsetLen');
function visit64_413_1(result) {
  _$jscoverage['/drag.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['405'][1].init(25, 16, 'allowX && allowY');
function visit63_405_1(result) {
  _$jscoverage['/drag.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['404'][1].init(1195, 16, 'allowX || allowY');
function visit62_404_1(result) {
  _$jscoverage['/drag.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['382'][1].init(469, 17, '!self.pagesOffset');
function visit61_382_1(result) {
  _$jscoverage['/drag.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['369'][1].init(38, 11, 'count === 2');
function visit60_369_1(result) {
  _$jscoverage['/drag.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['365'][2].init(293, 33, 'Math.abs(offsetY) > snapThreshold');
function visit59_365_2(result) {
  _$jscoverage['/drag.js'].branchData['365'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['365'][1].init(269, 57, 'self.allowScroll.top && Math.abs(offsetY) > snapThreshold');
function visit58_365_1(result) {
  _$jscoverage['/drag.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['364'][2].init(213, 33, 'Math.abs(offsetX) > snapThreshold');
function visit57_364_2(result) {
  _$jscoverage['/drag.js'].branchData['364'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['364'][1].init(188, 58, 'self.allowScroll.left && Math.abs(offsetX) > snapThreshold');
function visit56_364_1(result) {
  _$jscoverage['/drag.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['344'][1].init(260, 35, '!startMousePos || !self.isScrolling');
function visit55_344_1(result) {
  _$jscoverage['/drag.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['337'][1].init(13, 10, '!e.isTouch');
function visit54_337_1(result) {
  _$jscoverage['/drag.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['332'][1].init(10890, 7, 'S.UA.ie');
function visit53_332_1(result) {
  _$jscoverage['/drag.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['321'][1].init(1765, 21, 'isTouchEventSupported');
function visit52_321_1(result) {
  _$jscoverage['/drag.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['314'][1].init(110, 27, 'self.get(\'preventDefaultY\')');
function visit51_314_1(result) {
  _$jscoverage['/drag.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['311'][3].init(569, 27, 'dragInitDirection === \'top\'');
function visit50_311_3(result) {
  _$jscoverage['/drag.js'].branchData['311'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['311'][2].init(569, 67, 'dragInitDirection === \'top\' && !self.allowScroll[dragInitDirection]');
function visit49_311_2(result) {
  _$jscoverage['/drag.js'].branchData['311'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['311'][1].init(560, 76, 'lockY && dragInitDirection === \'top\' && !self.allowScroll[dragInitDirection]');
function visit48_311_1(result) {
  _$jscoverage['/drag.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['305'][1].init(110, 27, 'self.get(\'preventDefaultX\')');
function visit47_305_1(result) {
  _$jscoverage['/drag.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['302'][3].init(235, 28, 'dragInitDirection === \'left\'');
function visit46_302_3(result) {
  _$jscoverage['/drag.js'].branchData['302'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['302'][2].init(235, 68, 'dragInitDirection === \'left\' && !self.allowScroll[dragInitDirection]');
function visit45_302_2(result) {
  _$jscoverage['/drag.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['302'][1].init(226, 77, 'lockX && dragInitDirection === \'left\' && !self.allowScroll[dragInitDirection]');
function visit44_302_1(result) {
  _$jscoverage['/drag.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['299'][1].init(62, 13, 'xDiff > yDiff');
function visit43_299_1(result) {
  _$jscoverage['/drag.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['298'][1].init(53, 45, '!(dragInitDirection = self.dragInitDirection)');
function visit42_298_1(result) {
  _$jscoverage['/drag.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['295'][1].init(849, 14, 'lockX || lockY');
function visit41_295_1(result) {
  _$jscoverage['/drag.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['285'][1].init(17, 17, '!self.isScrolling');
function visit40_285_1(result) {
  _$jscoverage['/drag.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['282'][1].init(452, 37, 'Math.max(xDiff, yDiff) < PIXEL_THRESH');
function visit39_282_1(result) {
  _$jscoverage['/drag.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['269'][1].init(143, 14, '!startMousePos');
function visit38_269_1(result) {
  _$jscoverage['/drag.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['263'][1].init(13, 10, '!e.isTouch');
function visit37_263_1(result) {
  _$jscoverage['/drag.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['247'][1].init(598, 18, 'touches.length > 1');
function visit36_247_1(result) {
  _$jscoverage['/drag.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['243'][1].init(481, 16, 'self.isScrolling');
function visit35_243_1(result) {
  _$jscoverage['/drag.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['236'][1].init(93, 36, 'self.isScrolling && self.pagesOffset');
function visit34_236_1(result) {
  _$jscoverage['/drag.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['234'][1].init(218, 131, 'self.get(\'disabled\') || (self.isScrolling && self.pagesOffset)');
function visit33_234_1(result) {
  _$jscoverage['/drag.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['229'][1].init(104, 10, '!e.isTouch');
function visit32_229_1(result) {
  _$jscoverage['/drag.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['218'][1].init(347, 11, 'value === 0');
function visit31_218_1(result) {
  _$jscoverage['/drag.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['207'][1].init(1156, 18, 'value <= minScroll');
function visit30_207_1(result) {
  _$jscoverage['/drag.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['192'][1].init(56, 22, 'fx.lastValue === value');
function visit29_192_1(result) {
  _$jscoverage['/drag.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['190'][3].init(392, 17, 'value < maxScroll');
function visit28_190_3(result) {
  _$jscoverage['/drag.js'].branchData['190'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['190'][2].init(371, 17, 'value > minScroll');
function visit27_190_2(result) {
  _$jscoverage['/drag.js'].branchData['190'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['190'][1].init(371, 38, 'value > minScroll && value < maxScroll');
function visit26_190_1(result) {
  _$jscoverage['/drag.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['182'][1].init(98, 7, 'inertia');
function visit25_182_1(result) {
  _$jscoverage['/drag.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['135'][3].init(1212, 14, 'distance === 0');
function visit24_135_3(result) {
  _$jscoverage['/drag.js'].branchData['135'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['135'][2].init(1194, 14, 'duration === 0');
function visit23_135_2(result) {
  _$jscoverage['/drag.js'].branchData['135'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['135'][1].init(1194, 32, 'duration === 0 || distance === 0');
function visit22_135_1(result) {
  _$jscoverage['/drag.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['125'][1].init(941, 16, 'self.pagesOffset');
function visit21_125_1(result) {
  _$jscoverage['/drag.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['113'][1].init(573, 19, 'bound !== undefined');
function visit20_113_1(result) {
  _$jscoverage['/drag.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['110'][1].init(475, 30, 'scroll > maxScroll[scrollType]');
function visit19_110_1(result) {
  _$jscoverage['/drag.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['108'][1].init(378, 30, 'scroll < minScroll[scrollType]');
function visit18_108_1(result) {
  _$jscoverage['/drag.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['97'][1].init(13, 28, 'forbidDrag(self, scrollType)');
function visit17_97_1(result) {
  _$jscoverage['/drag.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['90'][1].init(77, 49, '!self.allowScroll[scrollType] && self.get(lockXY)');
function visit16_90_1(result) {
  _$jscoverage['/drag.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['89'][1].init(22, 21, 'scrollType === \'left\'');
function visit15_89_1(result) {
  _$jscoverage['/drag.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['76'][2].init(117, 32, 'timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit14_76_2(result) {
  _$jscoverage['/drag.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['76'][1].init(54, 39, 'lastDirection[scrollType] !== direction');
function visit13_76_1(result) {
  _$jscoverage['/drag.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['75'][4].init(1613, 39, 'lastDirection[scrollType] !== undefined');
function visit12_75_4(result) {
  _$jscoverage['/drag.js'].branchData['75'][4].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['75'][3].init(1613, 94, 'lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit11_75_3(result) {
  _$jscoverage['/drag.js'].branchData['75'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['75'][2].init(1593, 114, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit10_75_2(result) {
  _$jscoverage['/drag.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['75'][1].init(1593, 150, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction || timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit9_75_1(result) {
  _$jscoverage['/drag.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['66'][1].init(1306, 30, 'scroll > maxScroll[scrollType]');
function visit8_66_1(result) {
  _$jscoverage['/drag.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['62'][1].init(1106, 30, 'scroll < minScroll[scrollType]');
function visit7_62_1(result) {
  _$jscoverage['/drag.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['58'][1].init(965, 19, '!self.get(\'bounce\')');
function visit6_58_1(result) {
  _$jscoverage['/drag.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['55'][1].init(117, 61, '(pos[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0');
function visit5_55_1(result) {
  _$jscoverage['/drag.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['54'][1].init(31, 58, 'pos[pageOffsetProperty] === lastPageXY[pageOffsetProperty]');
function visit4_54_1(result) {
  _$jscoverage['/drag.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['53'][1].init(729, 30, 'lastPageXY[pageOffsetProperty]');
function visit3_53_1(result) {
  _$jscoverage['/drag.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['40'][1].init(194, 21, 'scrollType === \'left\'');
function visit2_40_1(result) {
  _$jscoverage['/drag.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['33'][1].init(13, 28, 'forbidDrag(self, scrollType)');
function visit1_33_1(result) {
  _$jscoverage['/drag.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/drag.js'].functionData[0]++;
  _$jscoverage['/drag.js'].lineData[7]++;
  var ScrollViewBase = require('./base');
  _$jscoverage['/drag.js'].lineData[8]++;
  var isTouchEventSupported = S.Features.isTouchEventSupported();
  _$jscoverage['/drag.js'].lineData[9]++;
  var Node = require('node');
  _$jscoverage['/drag.js'].lineData[10]++;
  var Anim = require('anim');
  _$jscoverage['/drag.js'].lineData[12]++;
  var OUT_OF_BOUND_FACTOR = 0.5;
  _$jscoverage['/drag.js'].lineData[14]++;
  var PIXEL_THRESH = 3;
  _$jscoverage['/drag.js'].lineData[16]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/drag.js'].lineData[18]++;
  var SWIPE_SAMPLE_INTERVAL = 300;
  _$jscoverage['/drag.js'].lineData[20]++;
  var MAX_SWIPE_VELOCITY = 6;
  _$jscoverage['/drag.js'].lineData[22]++;
  var $document = Node.all(document);
  _$jscoverage['/drag.js'].lineData[24]++;
  function onDragStart(self, e, scrollType) {
    _$jscoverage['/drag.js'].functionData[1]++;
    _$jscoverage['/drag.js'].lineData[25]++;
    var now = e.timeStamp, scroll = self.get('scroll' + S.ucfirst(scrollType));
    _$jscoverage['/drag.js'].lineData[27]++;
    self.startScroll[scrollType] = scroll;
    _$jscoverage['/drag.js'].lineData[28]++;
    self.swipe[scrollType].startTime = now;
    _$jscoverage['/drag.js'].lineData[29]++;
    self.swipe[scrollType].scroll = scroll;
  }
  _$jscoverage['/drag.js'].lineData[32]++;
  function onDragScroll(self, e, scrollType, startMousePos) {
    _$jscoverage['/drag.js'].functionData[2]++;
    _$jscoverage['/drag.js'].lineData[33]++;
    if (visit1_33_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/drag.js'].lineData[34]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[36]++;
    var pos = {
  pageX: e.pageX, 
  pageY: e.pageY};
    _$jscoverage['/drag.js'].lineData[40]++;
    var pageOffsetProperty = visit2_40_1(scrollType === 'left') ? 'pageX' : 'pageY', lastPageXY = self.lastPageXY;
    _$jscoverage['/drag.js'].lineData[42]++;
    var diff = pos[pageOffsetProperty] - startMousePos[pageOffsetProperty], eqWithLastPoint, scroll = self.startScroll[scrollType] - diff, bound, now = e.timeStamp, minScroll = self.minScroll, maxScroll = self.maxScroll, lastDirection = self.lastDirection, swipe = self.swipe, direction;
    _$jscoverage['/drag.js'].lineData[53]++;
    if (visit3_53_1(lastPageXY[pageOffsetProperty])) {
      _$jscoverage['/drag.js'].lineData[54]++;
      eqWithLastPoint = visit4_54_1(pos[pageOffsetProperty] === lastPageXY[pageOffsetProperty]);
      _$jscoverage['/drag.js'].lineData[55]++;
      direction = visit5_55_1((pos[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0);
    }
    _$jscoverage['/drag.js'].lineData[58]++;
    if (visit6_58_1(!self.get('bounce'))) {
      _$jscoverage['/drag.js'].lineData[59]++;
      scroll = Math.min(Math.max(scroll, minScroll[scrollType]), maxScroll[scrollType]);
    }
    _$jscoverage['/drag.js'].lineData[62]++;
    if (visit7_62_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/drag.js'].lineData[63]++;
      bound = minScroll[scrollType] - scroll;
      _$jscoverage['/drag.js'].lineData[64]++;
      bound *= OUT_OF_BOUND_FACTOR;
      _$jscoverage['/drag.js'].lineData[65]++;
      scroll = minScroll[scrollType] - bound;
    } else {
      _$jscoverage['/drag.js'].lineData[66]++;
      if (visit8_66_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/drag.js'].lineData[67]++;
        bound = scroll - maxScroll[scrollType];
        _$jscoverage['/drag.js'].lineData[68]++;
        bound *= OUT_OF_BOUND_FACTOR;
        _$jscoverage['/drag.js'].lineData[69]++;
        scroll = maxScroll[scrollType] + bound;
      }
    }
    _$jscoverage['/drag.js'].lineData[72]++;
    var timeDiff = (now - swipe[scrollType].startTime);
    _$jscoverage['/drag.js'].lineData[75]++;
    if (visit9_75_1(visit10_75_2(!eqWithLastPoint && visit11_75_3(visit12_75_4(lastDirection[scrollType] !== undefined) && visit13_76_1(lastDirection[scrollType] !== direction))) || visit14_76_2(timeDiff > SWIPE_SAMPLE_INTERVAL))) {
      _$jscoverage['/drag.js'].lineData[77]++;
      swipe[scrollType].startTime = now;
      _$jscoverage['/drag.js'].lineData[78]++;
      swipe[scrollType].scroll = scroll;
    }
    _$jscoverage['/drag.js'].lineData[82]++;
    self.set('scroll' + S.ucfirst(scrollType), scroll);
    _$jscoverage['/drag.js'].lineData[83]++;
    lastDirection[scrollType] = direction;
    _$jscoverage['/drag.js'].lineData[85]++;
    lastPageXY[pageOffsetProperty] = e[pageOffsetProperty];
  }
  _$jscoverage['/drag.js'].lineData[88]++;
  function forbidDrag(self, scrollType) {
    _$jscoverage['/drag.js'].functionData[3]++;
    _$jscoverage['/drag.js'].lineData[89]++;
    var lockXY = visit15_89_1(scrollType === 'left') ? 'lockX' : 'lockY';
    _$jscoverage['/drag.js'].lineData[90]++;
    if (visit16_90_1(!self.allowScroll[scrollType] && self.get(lockXY))) {
      _$jscoverage['/drag.js'].lineData[91]++;
      return 1;
    }
    _$jscoverage['/drag.js'].lineData[93]++;
    return 0;
  }
  _$jscoverage['/drag.js'].lineData[96]++;
  function onDragEndAxis(self, e, scrollType, endCallback) {
    _$jscoverage['/drag.js'].functionData[4]++;
    _$jscoverage['/drag.js'].lineData[97]++;
    if (visit17_97_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/drag.js'].lineData[98]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[99]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[101]++;
    var scrollAxis = 'scroll' + S.ucfirst(scrollType), scroll = self.get(scrollAxis), minScroll = self.minScroll, maxScroll = self.maxScroll, now = e.timeStamp, swipe = self.swipe, bound;
    _$jscoverage['/drag.js'].lineData[108]++;
    if (visit18_108_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/drag.js'].lineData[109]++;
      bound = minScroll[scrollType];
    } else {
      _$jscoverage['/drag.js'].lineData[110]++;
      if (visit19_110_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/drag.js'].lineData[111]++;
        bound = maxScroll[scrollType];
      }
    }
    _$jscoverage['/drag.js'].lineData[113]++;
    if (visit20_113_1(bound !== undefined)) {
      _$jscoverage['/drag.js'].lineData[114]++;
      var scrollCfg = {};
      _$jscoverage['/drag.js'].lineData[115]++;
      scrollCfg[scrollType] = bound;
      _$jscoverage['/drag.js'].lineData[116]++;
      self.scrollTo(scrollCfg, {
  duration: self.get('bounceDuration'), 
  easing: self.get('bounceEasing'), 
  queue: false, 
  complete: endCallback});
      _$jscoverage['/drag.js'].lineData[122]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[125]++;
    if (visit21_125_1(self.pagesOffset)) {
      _$jscoverage['/drag.js'].lineData[126]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[127]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[130]++;
    var duration = now - swipe[scrollType].startTime;
    _$jscoverage['/drag.js'].lineData[131]++;
    var distance = (scroll - swipe[scrollType].scroll);
    _$jscoverage['/drag.js'].lineData[135]++;
    if (visit22_135_1(visit23_135_2(duration === 0) || visit24_135_3(distance === 0))) {
      _$jscoverage['/drag.js'].lineData[136]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[137]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[143]++;
    var velocity = distance / duration;
    _$jscoverage['/drag.js'].lineData[145]++;
    velocity = Math.min(Math.max(velocity, -MAX_SWIPE_VELOCITY), MAX_SWIPE_VELOCITY);
    _$jscoverage['/drag.js'].lineData[150]++;
    var animCfg = {
  node: {}, 
  to: {}, 
  duration: 9999, 
  queue: false, 
  complete: endCallback, 
  frame: makeMomentumFx(self, velocity, scroll, scrollAxis, maxScroll[scrollType], minScroll[scrollType])};
    _$jscoverage['/drag.js'].lineData[161]++;
    animCfg.node[scrollType] = scroll;
    _$jscoverage['/drag.js'].lineData[162]++;
    animCfg.to[scrollType] = null;
    _$jscoverage['/drag.js'].lineData[164]++;
    self.scrollAnims.push(new Anim(animCfg).run());
  }
  _$jscoverage['/drag.js'].lineData[167]++;
  var FRICTION = 0.5;
  _$jscoverage['/drag.js'].lineData[168]++;
  var ACCELERATION = 20;
  _$jscoverage['/drag.js'].lineData[169]++;
  var THETA = Math.log(1 - (FRICTION / 10));
  _$jscoverage['/drag.js'].lineData[170]++;
  var ALPHA = THETA / ACCELERATION;
  _$jscoverage['/drag.js'].lineData[171]++;
  var SPRING_TENSION = 0.3;
  _$jscoverage['/drag.js'].lineData[173]++;
  function makeMomentumFx(self, startVelocity, startScroll, scrollAxis, maxScroll, minScroll) {
    _$jscoverage['/drag.js'].functionData[5]++;
    _$jscoverage['/drag.js'].lineData[175]++;
    var velocity = startVelocity * ACCELERATION;
    _$jscoverage['/drag.js'].lineData[176]++;
    var inertia = 1;
    _$jscoverage['/drag.js'].lineData[177]++;
    var bounceStartTime = 0;
    _$jscoverage['/drag.js'].lineData[178]++;
    return function(anim, fx) {
  _$jscoverage['/drag.js'].functionData[6]++;
  _$jscoverage['/drag.js'].lineData[179]++;
  var now = S.now(), deltaTime, value;
  _$jscoverage['/drag.js'].lineData[182]++;
  if (visit25_182_1(inertia)) {
    _$jscoverage['/drag.js'].lineData[183]++;
    deltaTime = now - anim.startTime;
    _$jscoverage['/drag.js'].lineData[187]++;
    var frictionFactor = Math.exp(deltaTime * ALPHA);
    _$jscoverage['/drag.js'].lineData[189]++;
    value = parseInt(startScroll + velocity * (1 - frictionFactor) / (-THETA), 10);
    _$jscoverage['/drag.js'].lineData[190]++;
    if (visit26_190_1(visit27_190_2(value > minScroll) && visit28_190_3(value < maxScroll))) {
      _$jscoverage['/drag.js'].lineData[192]++;
      if (visit29_192_1(fx.lastValue === value)) {
        _$jscoverage['/drag.js'].lineData[193]++;
        fx.pos = 1;
        _$jscoverage['/drag.js'].lineData[194]++;
        return;
      }
      _$jscoverage['/drag.js'].lineData[196]++;
      fx.lastValue = value;
      _$jscoverage['/drag.js'].lineData[197]++;
      self.set(scrollAxis, value);
      _$jscoverage['/drag.js'].lineData[198]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[200]++;
    inertia = 0;
    _$jscoverage['/drag.js'].lineData[201]++;
    velocity = velocity * frictionFactor;
    _$jscoverage['/drag.js'].lineData[207]++;
    startScroll = visit30_207_1(value <= minScroll) ? minScroll : maxScroll;
    _$jscoverage['/drag.js'].lineData[209]++;
    bounceStartTime = now;
  } else {
    _$jscoverage['/drag.js'].lineData[211]++;
    deltaTime = now - bounceStartTime;
    _$jscoverage['/drag.js'].lineData[213]++;
    var theta = (deltaTime / ACCELERATION), powTime = theta * Math.exp(-SPRING_TENSION * theta);
    _$jscoverage['/drag.js'].lineData[217]++;
    value = parseInt(velocity * powTime, 10);
    _$jscoverage['/drag.js'].lineData[218]++;
    if (visit31_218_1(value === 0)) {
      _$jscoverage['/drag.js'].lineData[219]++;
      fx.pos = 1;
    }
    _$jscoverage['/drag.js'].lineData[221]++;
    self.set(scrollAxis, startScroll + value);
  }
};
  }
  _$jscoverage['/drag.js'].lineData[226]++;
  function onDragStartHandler(e) {
    _$jscoverage['/drag.js'].functionData[7]++;
    _$jscoverage['/drag.js'].lineData[229]++;
    if (visit32_229_1(!e.isTouch)) {
      _$jscoverage['/drag.js'].lineData[230]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[232]++;
    var self = this, touches = e.touches;
    _$jscoverage['/drag.js'].lineData[234]++;
    if (visit33_234_1(self.get('disabled') || (visit34_236_1(self.isScrolling && self.pagesOffset)))) {
      _$jscoverage['/drag.js'].lineData[237]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[239]++;
    var pos = {
  pageX: e.pageX, 
  pageY: e.pageY};
    _$jscoverage['/drag.js'].lineData[243]++;
    if (visit35_243_1(self.isScrolling)) {
      _$jscoverage['/drag.js'].lineData[244]++;
      self.stopAnimation();
      _$jscoverage['/drag.js'].lineData[245]++;
      self.fire('scrollEnd', pos);
    }
    _$jscoverage['/drag.js'].lineData[247]++;
    if (visit36_247_1(touches.length > 1)) {
      _$jscoverage['/drag.js'].lineData[249]++;
      $document.detach(Gesture.move, onDragHandler, self).detach(Gesture.end, onDragEndHandler, self);
      _$jscoverage['/drag.js'].lineData[251]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[253]++;
    initStates(self);
    _$jscoverage['/drag.js'].lineData[254]++;
    self.startMousePos = pos;
    _$jscoverage['/drag.js'].lineData[255]++;
    onDragStart(self, e, 'left');
    _$jscoverage['/drag.js'].lineData[256]++;
    onDragStart(self, e, 'top');
    _$jscoverage['/drag.js'].lineData[259]++;
    $document.on(Gesture.move, onDragHandler, self).on(Gesture.end, onDragEndHandler, self);
  }
  _$jscoverage['/drag.js'].lineData[262]++;
  var onDragHandler = function(e) {
  _$jscoverage['/drag.js'].functionData[8]++;
  _$jscoverage['/drag.js'].lineData[263]++;
  if (visit37_263_1(!e.isTouch)) {
    _$jscoverage['/drag.js'].lineData[264]++;
    return;
  }
  _$jscoverage['/drag.js'].lineData[266]++;
  var self = this, startMousePos = self.startMousePos;
  _$jscoverage['/drag.js'].lineData[269]++;
  if (visit38_269_1(!startMousePos)) {
    _$jscoverage['/drag.js'].lineData[270]++;
    return;
  }
  _$jscoverage['/drag.js'].lineData[273]++;
  var pos = {
  pageX: e.pageX, 
  pageY: e.pageY};
  _$jscoverage['/drag.js'].lineData[278]++;
  var xDiff = Math.abs(pos.pageX - startMousePos.pageX);
  _$jscoverage['/drag.js'].lineData[279]++;
  var yDiff = Math.abs(pos.pageY - startMousePos.pageY);
  _$jscoverage['/drag.js'].lineData[282]++;
  if (visit39_282_1(Math.max(xDiff, yDiff) < PIXEL_THRESH)) {
    _$jscoverage['/drag.js'].lineData[283]++;
    return;
  } else {
    _$jscoverage['/drag.js'].lineData[285]++;
    if (visit40_285_1(!self.isScrolling)) {
      _$jscoverage['/drag.js'].lineData[286]++;
      self.fire('scrollStart', pos);
      _$jscoverage['/drag.js'].lineData[287]++;
      self.isScrolling = 1;
    }
  }
  _$jscoverage['/drag.js'].lineData[291]++;
  var lockX = self.get('lockX'), lockY = self.get('lockY');
  _$jscoverage['/drag.js'].lineData[295]++;
  if (visit41_295_1(lockX || lockY)) {
    _$jscoverage['/drag.js'].lineData[296]++;
    var dragInitDirection;
    _$jscoverage['/drag.js'].lineData[298]++;
    if (visit42_298_1(!(dragInitDirection = self.dragInitDirection))) {
      _$jscoverage['/drag.js'].lineData[299]++;
      self.dragInitDirection = dragInitDirection = visit43_299_1(xDiff > yDiff) ? 'left' : 'top';
    }
    _$jscoverage['/drag.js'].lineData[302]++;
    if (visit44_302_1(lockX && visit45_302_2(visit46_302_3(dragInitDirection === 'left') && !self.allowScroll[dragInitDirection]))) {
      _$jscoverage['/drag.js'].lineData[304]++;
      self.isScrolling = 0;
      _$jscoverage['/drag.js'].lineData[305]++;
      if (visit47_305_1(self.get('preventDefaultX'))) {
        _$jscoverage['/drag.js'].lineData[306]++;
        e.preventDefault();
      }
      _$jscoverage['/drag.js'].lineData[308]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[311]++;
    if (visit48_311_1(lockY && visit49_311_2(visit50_311_3(dragInitDirection === 'top') && !self.allowScroll[dragInitDirection]))) {
      _$jscoverage['/drag.js'].lineData[313]++;
      self.isScrolling = 0;
      _$jscoverage['/drag.js'].lineData[314]++;
      if (visit51_314_1(self.get('preventDefaultY'))) {
        _$jscoverage['/drag.js'].lineData[315]++;
        e.preventDefault();
      }
      _$jscoverage['/drag.js'].lineData[317]++;
      return;
    }
  }
  _$jscoverage['/drag.js'].lineData[321]++;
  if (visit52_321_1(isTouchEventSupported)) {
    _$jscoverage['/drag.js'].lineData[322]++;
    e.preventDefault();
  }
  _$jscoverage['/drag.js'].lineData[325]++;
  onDragScroll(self, e, 'left', startMousePos);
  _$jscoverage['/drag.js'].lineData[326]++;
  onDragScroll(self, e, 'top', startMousePos);
  _$jscoverage['/drag.js'].lineData[329]++;
  self.fire('scrollMove', pos);
};
  _$jscoverage['/drag.js'].lineData[332]++;
  if (visit53_332_1(S.UA.ie)) {
    _$jscoverage['/drag.js'].lineData[333]++;
    onDragHandler = S.throttle(onDragHandler, 30);
  }
  _$jscoverage['/drag.js'].lineData[336]++;
  function onDragEndHandler(e) {
    _$jscoverage['/drag.js'].functionData[9]++;
    _$jscoverage['/drag.js'].lineData[337]++;
    if (visit54_337_1(!e.isTouch)) {
      _$jscoverage['/drag.js'].lineData[338]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[340]++;
    var self = this;
    _$jscoverage['/drag.js'].lineData[341]++;
    var startMousePos = self.startMousePos;
    _$jscoverage['/drag.js'].lineData[343]++;
    $document.detach(Gesture.move, onDragHandler, self).detach(Gesture.end, onDragEndHandler, self);
    _$jscoverage['/drag.js'].lineData[344]++;
    if (visit55_344_1(!startMousePos || !self.isScrolling)) {
      _$jscoverage['/drag.js'].lineData[345]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[347]++;
    var offsetX = startMousePos.pageX - e.pageX;
    _$jscoverage['/drag.js'].lineData[348]++;
    var offsetY = startMousePos.pageY - e.pageY;
    _$jscoverage['/drag.js'].lineData[349]++;
    self.fire('dragend', {
  pageX: e.pageX, 
  deltaX: -offsetX, 
  deltaY: -offsetY, 
  pageY: e.pageY});
  }
  _$jscoverage['/drag.js'].lineData[358]++;
  function defaultDragEndFn(e) {
    _$jscoverage['/drag.js'].functionData[10]++;
    _$jscoverage['/drag.js'].lineData[359]++;
    var self = this;
    _$jscoverage['/drag.js'].lineData[360]++;
    var count = 0;
    _$jscoverage['/drag.js'].lineData[361]++;
    var offsetX = -e.deltaX;
    _$jscoverage['/drag.js'].lineData[362]++;
    var offsetY = -e.deltaY;
    _$jscoverage['/drag.js'].lineData[363]++;
    var snapThreshold = self._snapThresholdCfg;
    _$jscoverage['/drag.js'].lineData[364]++;
    var allowX = visit56_364_1(self.allowScroll.left && visit57_364_2(Math.abs(offsetX) > snapThreshold));
    _$jscoverage['/drag.js'].lineData[365]++;
    var allowY = visit58_365_1(self.allowScroll.top && visit59_365_2(Math.abs(offsetY) > snapThreshold));
    _$jscoverage['/drag.js'].lineData[367]++;
    function endCallback() {
      _$jscoverage['/drag.js'].functionData[11]++;
      _$jscoverage['/drag.js'].lineData[368]++;
      count++;
      _$jscoverage['/drag.js'].lineData[369]++;
      if (visit60_369_1(count === 2)) {
        _$jscoverage['/drag.js'].lineData[370]++;
        var scrollEnd = function() {
  _$jscoverage['/drag.js'].functionData[12]++;
  _$jscoverage['/drag.js'].lineData[371]++;
  self.isScrolling = 0;
  _$jscoverage['/drag.js'].lineData[372]++;
  self.fire('scrollEnd', {
  pageX: e.pageX, 
  pageY: e.pageY, 
  deltaX: -offsetX, 
  deltaY: -offsetY, 
  fromPageIndex: pageIndex, 
  pageIndex: self.get('pageIndex')});
};
        _$jscoverage['/drag.js'].lineData[382]++;
        if (visit61_382_1(!self.pagesOffset)) {
          _$jscoverage['/drag.js'].lineData[383]++;
          scrollEnd();
          _$jscoverage['/drag.js'].lineData[384]++;
          return;
        }
        _$jscoverage['/drag.js'].lineData[387]++;
        var snapDuration = self._snapDurationCfg;
        _$jscoverage['/drag.js'].lineData[388]++;
        var snapEasing = self._snapEasingCfg;
        _$jscoverage['/drag.js'].lineData[389]++;
        var pageIndex = self.get('pageIndex');
        _$jscoverage['/drag.js'].lineData[390]++;
        var scrollLeft = self.get('scrollLeft');
        _$jscoverage['/drag.js'].lineData[391]++;
        var scrollTop = self.get('scrollTop');
        _$jscoverage['/drag.js'].lineData[393]++;
        var animCfg = {
  duration: snapDuration, 
  easing: snapEasing, 
  complete: scrollEnd};
        _$jscoverage['/drag.js'].lineData[399]++;
        var pagesOffset = self.pagesOffset;
        _$jscoverage['/drag.js'].lineData[400]++;
        var pagesOffsetLen = pagesOffset.length;
        _$jscoverage['/drag.js'].lineData[402]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[404]++;
        if (visit62_404_1(allowX || allowY)) {
          _$jscoverage['/drag.js'].lineData[405]++;
          if (visit63_405_1(allowX && allowY)) {
            _$jscoverage['/drag.js'].lineData[406]++;
            var prepareX = [], i, newPageIndex;
            _$jscoverage['/drag.js'].lineData[409]++;
            var nowXY = {
  left: scrollLeft, 
  top: scrollTop};
            _$jscoverage['/drag.js'].lineData[413]++;
            for (i = 0; visit64_413_1(i < pagesOffsetLen); i++) {
              _$jscoverage['/drag.js'].lineData[414]++;
              var offset = pagesOffset[i];
              _$jscoverage['/drag.js'].lineData[415]++;
              if (visit65_415_1(offset)) {
                _$jscoverage['/drag.js'].lineData[416]++;
                if (visit66_416_1(visit67_416_2(offsetX > 0) && visit68_416_3(offset.left > nowXY.left))) {
                  _$jscoverage['/drag.js'].lineData[417]++;
                  prepareX.push(offset);
                } else {
                  _$jscoverage['/drag.js'].lineData[418]++;
                  if (visit69_418_1(visit70_418_2(offsetX < 0) && visit71_418_3(offset.left < nowXY.left))) {
                    _$jscoverage['/drag.js'].lineData[419]++;
                    prepareX.push(offset);
                  }
                }
              }
            }
            _$jscoverage['/drag.js'].lineData[423]++;
            var min;
            _$jscoverage['/drag.js'].lineData[424]++;
            var prepareXLen = prepareX.length;
            _$jscoverage['/drag.js'].lineData[425]++;
            var x;
            _$jscoverage['/drag.js'].lineData[426]++;
            if (visit72_426_1(offsetY > 0)) {
              _$jscoverage['/drag.js'].lineData[427]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/drag.js'].lineData[428]++;
              for (i = 0; visit73_428_1(i < prepareXLen); i++) {
                _$jscoverage['/drag.js'].lineData[429]++;
                x = prepareX[i];
                _$jscoverage['/drag.js'].lineData[430]++;
                if (visit74_430_1(x.top > nowXY.top)) {
                  _$jscoverage['/drag.js'].lineData[431]++;
                  if (visit75_431_1(min < x.top - nowXY.top)) {
                    _$jscoverage['/drag.js'].lineData[432]++;
                    min = x.top - nowXY.top;
                    _$jscoverage['/drag.js'].lineData[433]++;
                    newPageIndex = prepareX.index;
                  }
                }
              }
            } else {
              _$jscoverage['/drag.js'].lineData[438]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/drag.js'].lineData[439]++;
              for (i = 0; visit76_439_1(i < prepareXLen); i++) {
                _$jscoverage['/drag.js'].lineData[440]++;
                x = prepareX[i];
                _$jscoverage['/drag.js'].lineData[441]++;
                if (visit77_441_1(x.top < nowXY.top)) {
                  _$jscoverage['/drag.js'].lineData[442]++;
                  if (visit78_442_1(min < nowXY.top - x.top)) {
                    _$jscoverage['/drag.js'].lineData[443]++;
                    min = nowXY.top - x.top;
                    _$jscoverage['/drag.js'].lineData[444]++;
                    newPageIndex = prepareX.index;
                  }
                }
              }
            }
            _$jscoverage['/drag.js'].lineData[449]++;
            if (visit79_449_1(newPageIndex !== undefined)) {
              _$jscoverage['/drag.js'].lineData[450]++;
              if (visit80_450_1(newPageIndex !== pageIndex)) {
                _$jscoverage['/drag.js'].lineData[451]++;
                self.scrollToPage(newPageIndex, animCfg);
              } else {
                _$jscoverage['/drag.js'].lineData[453]++;
                self.scrollToPage(newPageIndex);
                _$jscoverage['/drag.js'].lineData[454]++;
                scrollEnd();
              }
            } else {
              _$jscoverage['/drag.js'].lineData[457]++;
              scrollEnd();
            }
          } else {
            _$jscoverage['/drag.js'].lineData[460]++;
            if (visit81_460_1(allowX || allowY)) {
              _$jscoverage['/drag.js'].lineData[461]++;
              var toPageIndex = self.getPageIndexFromXY(allowX ? scrollLeft : scrollTop, allowX, allowX ? offsetX : offsetY);
              _$jscoverage['/drag.js'].lineData[464]++;
              self.scrollToPage(toPageIndex, animCfg);
            } else {
              _$jscoverage['/drag.js'].lineData[466]++;
              self.scrollToPage(pageIndex);
              _$jscoverage['/drag.js'].lineData[467]++;
              scrollEnd();
            }
          }
        }
      }
    }
    _$jscoverage['/drag.js'].lineData[474]++;
    onDragEndAxis(self, e, 'left', endCallback);
    _$jscoverage['/drag.js'].lineData[475]++;
    onDragEndAxis(self, e, 'top', endCallback);
  }
  _$jscoverage['/drag.js'].lineData[478]++;
  function initStates(self) {
    _$jscoverage['/drag.js'].functionData[13]++;
    _$jscoverage['/drag.js'].lineData[479]++;
    self.lastPageXY = {};
    _$jscoverage['/drag.js'].lineData[480]++;
    self.lastDirection = {};
    _$jscoverage['/drag.js'].lineData[481]++;
    self.swipe = {
  left: {}, 
  top: {}};
    _$jscoverage['/drag.js'].lineData[485]++;
    self.startMousePos = null;
    _$jscoverage['/drag.js'].lineData[486]++;
    self.startScroll = {};
    _$jscoverage['/drag.js'].lineData[487]++;
    self.dragInitDirection = null;
  }
  _$jscoverage['/drag.js'].lineData[490]++;
  function preventDefault(e) {
    _$jscoverage['/drag.js'].functionData[14]++;
    _$jscoverage['/drag.js'].lineData[491]++;
    e.preventDefault();
  }
  _$jscoverage['/drag.js'].lineData[500]++;
  return ScrollViewBase.extend({
  initializer: function() {
  _$jscoverage['/drag.js'].functionData[15]++;
  _$jscoverage['/drag.js'].lineData[502]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[503]++;
  self._snapThresholdCfg = self.get('snapThreshold');
  _$jscoverage['/drag.js'].lineData[504]++;
  self._snapDurationCfg = self.get('snapDuration');
  _$jscoverage['/drag.js'].lineData[505]++;
  self._snapEasingCfg = self.get('snapEasing');
  _$jscoverage['/drag.js'].lineData[506]++;
  self.publish('dragend', {
  defaultFn: defaultDragEndFn, 
  defaultTargetOnly: true});
}, 
  bindUI: function() {
  _$jscoverage['/drag.js'].functionData[16]++;
  _$jscoverage['/drag.js'].lineData[514]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[516]++;
  self.$contentEl.on('dragstart', preventDefault).on(Gesture.start, onDragStartHandler, self);
}, 
  destructor: function() {
  _$jscoverage['/drag.js'].functionData[17]++;
  _$jscoverage['/drag.js'].lineData[520]++;
  this.stopAnimation();
}, 
  stopAnimation: function() {
  _$jscoverage['/drag.js'].functionData[18]++;
  _$jscoverage['/drag.js'].lineData[524]++;
  this.callSuper();
  _$jscoverage['/drag.js'].lineData[525]++;
  this.isScrolling = 0;
}}, {
  ATTRS: {
  lockX: {
  value: true}, 
  preventDefaultX: {
  value: true}, 
  lockY: {
  value: false}, 
  preventDefaultY: {
  value: false}, 
  snapDuration: {
  value: 0.3}, 
  snapEasing: {
  value: 'easeOut'}, 
  snapThreshold: {
  value: 5}, 
  bounce: {
  value: true}, 
  bounceDuration: {
  value: 0.4}, 
  bounceEasing: {
  value: 'easeOut'}}});
});
