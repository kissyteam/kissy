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
  _$jscoverage['/drag.js'].lineData[9] = 0;
  _$jscoverage['/drag.js'].lineData[11] = 0;
  _$jscoverage['/drag.js'].lineData[13] = 0;
  _$jscoverage['/drag.js'].lineData[15] = 0;
  _$jscoverage['/drag.js'].lineData[17] = 0;
  _$jscoverage['/drag.js'].lineData[19] = 0;
  _$jscoverage['/drag.js'].lineData[20] = 0;
  _$jscoverage['/drag.js'].lineData[22] = 0;
  _$jscoverage['/drag.js'].lineData[23] = 0;
  _$jscoverage['/drag.js'].lineData[24] = 0;
  _$jscoverage['/drag.js'].lineData[27] = 0;
  _$jscoverage['/drag.js'].lineData[28] = 0;
  _$jscoverage['/drag.js'].lineData[29] = 0;
  _$jscoverage['/drag.js'].lineData[31] = 0;
  _$jscoverage['/drag.js'].lineData[35] = 0;
  _$jscoverage['/drag.js'].lineData[37] = 0;
  _$jscoverage['/drag.js'].lineData[48] = 0;
  _$jscoverage['/drag.js'].lineData[49] = 0;
  _$jscoverage['/drag.js'].lineData[50] = 0;
  _$jscoverage['/drag.js'].lineData[53] = 0;
  _$jscoverage['/drag.js'].lineData[54] = 0;
  _$jscoverage['/drag.js'].lineData[57] = 0;
  _$jscoverage['/drag.js'].lineData[58] = 0;
  _$jscoverage['/drag.js'].lineData[59] = 0;
  _$jscoverage['/drag.js'].lineData[60] = 0;
  _$jscoverage['/drag.js'].lineData[61] = 0;
  _$jscoverage['/drag.js'].lineData[62] = 0;
  _$jscoverage['/drag.js'].lineData[63] = 0;
  _$jscoverage['/drag.js'].lineData[64] = 0;
  _$jscoverage['/drag.js'].lineData[67] = 0;
  _$jscoverage['/drag.js'].lineData[70] = 0;
  _$jscoverage['/drag.js'].lineData[72] = 0;
  _$jscoverage['/drag.js'].lineData[73] = 0;
  _$jscoverage['/drag.js'].lineData[77] = 0;
  _$jscoverage['/drag.js'].lineData[78] = 0;
  _$jscoverage['/drag.js'].lineData[80] = 0;
  _$jscoverage['/drag.js'].lineData[83] = 0;
  _$jscoverage['/drag.js'].lineData[84] = 0;
  _$jscoverage['/drag.js'].lineData[85] = 0;
  _$jscoverage['/drag.js'].lineData[86] = 0;
  _$jscoverage['/drag.js'].lineData[88] = 0;
  _$jscoverage['/drag.js'].lineData[91] = 0;
  _$jscoverage['/drag.js'].lineData[92] = 0;
  _$jscoverage['/drag.js'].lineData[93] = 0;
  _$jscoverage['/drag.js'].lineData[94] = 0;
  _$jscoverage['/drag.js'].lineData[96] = 0;
  _$jscoverage['/drag.js'].lineData[103] = 0;
  _$jscoverage['/drag.js'].lineData[104] = 0;
  _$jscoverage['/drag.js'].lineData[105] = 0;
  _$jscoverage['/drag.js'].lineData[106] = 0;
  _$jscoverage['/drag.js'].lineData[108] = 0;
  _$jscoverage['/drag.js'].lineData[109] = 0;
  _$jscoverage['/drag.js'].lineData[110] = 0;
  _$jscoverage['/drag.js'].lineData[111] = 0;
  _$jscoverage['/drag.js'].lineData[117] = 0;
  _$jscoverage['/drag.js'].lineData[120] = 0;
  _$jscoverage['/drag.js'].lineData[121] = 0;
  _$jscoverage['/drag.js'].lineData[122] = 0;
  _$jscoverage['/drag.js'].lineData[125] = 0;
  _$jscoverage['/drag.js'].lineData[126] = 0;
  _$jscoverage['/drag.js'].lineData[130] = 0;
  _$jscoverage['/drag.js'].lineData[131] = 0;
  _$jscoverage['/drag.js'].lineData[132] = 0;
  _$jscoverage['/drag.js'].lineData[138] = 0;
  _$jscoverage['/drag.js'].lineData[140] = 0;
  _$jscoverage['/drag.js'].lineData[145] = 0;
  _$jscoverage['/drag.js'].lineData[156] = 0;
  _$jscoverage['/drag.js'].lineData[157] = 0;
  _$jscoverage['/drag.js'].lineData[159] = 0;
  _$jscoverage['/drag.js'].lineData[162] = 0;
  _$jscoverage['/drag.js'].lineData[163] = 0;
  _$jscoverage['/drag.js'].lineData[164] = 0;
  _$jscoverage['/drag.js'].lineData[165] = 0;
  _$jscoverage['/drag.js'].lineData[166] = 0;
  _$jscoverage['/drag.js'].lineData[168] = 0;
  _$jscoverage['/drag.js'].lineData[170] = 0;
  _$jscoverage['/drag.js'].lineData[171] = 0;
  _$jscoverage['/drag.js'].lineData[172] = 0;
  _$jscoverage['/drag.js'].lineData[173] = 0;
  _$jscoverage['/drag.js'].lineData[174] = 0;
  _$jscoverage['/drag.js'].lineData[177] = 0;
  _$jscoverage['/drag.js'].lineData[178] = 0;
  _$jscoverage['/drag.js'].lineData[182] = 0;
  _$jscoverage['/drag.js'].lineData[184] = 0;
  _$jscoverage['/drag.js'].lineData[185] = 0;
  _$jscoverage['/drag.js'].lineData[187] = 0;
  _$jscoverage['/drag.js'].lineData[188] = 0;
  _$jscoverage['/drag.js'].lineData[189] = 0;
  _$jscoverage['/drag.js'].lineData[191] = 0;
  _$jscoverage['/drag.js'].lineData[192] = 0;
  _$jscoverage['/drag.js'].lineData[193] = 0;
  _$jscoverage['/drag.js'].lineData[195] = 0;
  _$jscoverage['/drag.js'].lineData[196] = 0;
  _$jscoverage['/drag.js'].lineData[202] = 0;
  _$jscoverage['/drag.js'].lineData[204] = 0;
  _$jscoverage['/drag.js'].lineData[206] = 0;
  _$jscoverage['/drag.js'].lineData[208] = 0;
  _$jscoverage['/drag.js'].lineData[212] = 0;
  _$jscoverage['/drag.js'].lineData[213] = 0;
  _$jscoverage['/drag.js'].lineData[214] = 0;
  _$jscoverage['/drag.js'].lineData[216] = 0;
  _$jscoverage['/drag.js'].lineData[221] = 0;
  _$jscoverage['/drag.js'].lineData[222] = 0;
  _$jscoverage['/drag.js'].lineData[224] = 0;
  _$jscoverage['/drag.js'].lineData[225] = 0;
  _$jscoverage['/drag.js'].lineData[227] = 0;
  _$jscoverage['/drag.js'].lineData[228] = 0;
  _$jscoverage['/drag.js'].lineData[232] = 0;
  _$jscoverage['/drag.js'].lineData[233] = 0;
  _$jscoverage['/drag.js'].lineData[234] = 0;
  _$jscoverage['/drag.js'].lineData[235] = 0;
  _$jscoverage['/drag.js'].lineData[240] = 0;
  _$jscoverage['/drag.js'].lineData[241] = 0;
  _$jscoverage['/drag.js'].lineData[243] = 0;
  _$jscoverage['/drag.js'].lineData[244] = 0;
  _$jscoverage['/drag.js'].lineData[245] = 0;
  _$jscoverage['/drag.js'].lineData[246] = 0;
  _$jscoverage['/drag.js'].lineData[249] = 0;
  _$jscoverage['/drag.js'].lineData[252] = 0;
  _$jscoverage['/drag.js'].lineData[253] = 0;
  _$jscoverage['/drag.js'].lineData[257] = 0;
  _$jscoverage['/drag.js'].lineData[258] = 0;
  _$jscoverage['/drag.js'].lineData[261] = 0;
  _$jscoverage['/drag.js'].lineData[266] = 0;
  _$jscoverage['/drag.js'].lineData[267] = 0;
  _$jscoverage['/drag.js'].lineData[270] = 0;
  _$jscoverage['/drag.js'].lineData[271] = 0;
  _$jscoverage['/drag.js'].lineData[273] = 0;
  _$jscoverage['/drag.js'].lineData[274] = 0;
  _$jscoverage['/drag.js'].lineData[275] = 0;
  _$jscoverage['/drag.js'].lineData[279] = 0;
  _$jscoverage['/drag.js'].lineData[283] = 0;
  _$jscoverage['/drag.js'].lineData[284] = 0;
  _$jscoverage['/drag.js'].lineData[286] = 0;
  _$jscoverage['/drag.js'].lineData[287] = 0;
  _$jscoverage['/drag.js'].lineData[290] = 0;
  _$jscoverage['/drag.js'].lineData[292] = 0;
  _$jscoverage['/drag.js'].lineData[293] = 0;
  _$jscoverage['/drag.js'].lineData[294] = 0;
  _$jscoverage['/drag.js'].lineData[296] = 0;
  _$jscoverage['/drag.js'].lineData[299] = 0;
  _$jscoverage['/drag.js'].lineData[301] = 0;
  _$jscoverage['/drag.js'].lineData[302] = 0;
  _$jscoverage['/drag.js'].lineData[303] = 0;
  _$jscoverage['/drag.js'].lineData[305] = 0;
  _$jscoverage['/drag.js'].lineData[309] = 0;
  _$jscoverage['/drag.js'].lineData[310] = 0;
  _$jscoverage['/drag.js'].lineData[313] = 0;
  _$jscoverage['/drag.js'].lineData[314] = 0;
  _$jscoverage['/drag.js'].lineData[317] = 0;
  _$jscoverage['/drag.js'].lineData[320] = 0;
  _$jscoverage['/drag.js'].lineData[321] = 0;
  _$jscoverage['/drag.js'].lineData[324] = 0;
  _$jscoverage['/drag.js'].lineData[325] = 0;
  _$jscoverage['/drag.js'].lineData[326] = 0;
  _$jscoverage['/drag.js'].lineData[327] = 0;
  _$jscoverage['/drag.js'].lineData[328] = 0;
  _$jscoverage['/drag.js'].lineData[329] = 0;
  _$jscoverage['/drag.js'].lineData[331] = 0;
  _$jscoverage['/drag.js'].lineData[332] = 0;
  _$jscoverage['/drag.js'].lineData[333] = 0;
  _$jscoverage['/drag.js'].lineData[334] = 0;
  _$jscoverage['/drag.js'].lineData[335] = 0;
  _$jscoverage['/drag.js'].lineData[336] = 0;
  _$jscoverage['/drag.js'].lineData[337] = 0;
  _$jscoverage['/drag.js'].lineData[341] = 0;
  _$jscoverage['/drag.js'].lineData[342] = 0;
  _$jscoverage['/drag.js'].lineData[343] = 0;
  _$jscoverage['/drag.js'].lineData[344] = 0;
  _$jscoverage['/drag.js'].lineData[345] = 0;
  _$jscoverage['/drag.js'].lineData[346] = 0;
  _$jscoverage['/drag.js'].lineData[354] = 0;
  _$jscoverage['/drag.js'].lineData[355] = 0;
  _$jscoverage['/drag.js'].lineData[356] = 0;
  _$jscoverage['/drag.js'].lineData[359] = 0;
  _$jscoverage['/drag.js'].lineData[360] = 0;
  _$jscoverage['/drag.js'].lineData[361] = 0;
  _$jscoverage['/drag.js'].lineData[362] = 0;
  _$jscoverage['/drag.js'].lineData[363] = 0;
  _$jscoverage['/drag.js'].lineData[364] = 0;
  _$jscoverage['/drag.js'].lineData[366] = 0;
  _$jscoverage['/drag.js'].lineData[372] = 0;
  _$jscoverage['/drag.js'].lineData[374] = 0;
  _$jscoverage['/drag.js'].lineData[376] = 0;
  _$jscoverage['/drag.js'].lineData[377] = 0;
  _$jscoverage['/drag.js'].lineData[378] = 0;
  _$jscoverage['/drag.js'].lineData[380] = 0;
  _$jscoverage['/drag.js'].lineData[384] = 0;
  _$jscoverage['/drag.js'].lineData[385] = 0;
  _$jscoverage['/drag.js'].lineData[386] = 0;
  _$jscoverage['/drag.js'].lineData[388] = 0;
  _$jscoverage['/drag.js'].lineData[389] = 0;
  _$jscoverage['/drag.js'].lineData[390] = 0;
  _$jscoverage['/drag.js'].lineData[391] = 0;
  _$jscoverage['/drag.js'].lineData[394] = 0;
  _$jscoverage['/drag.js'].lineData[395] = 0;
  _$jscoverage['/drag.js'].lineData[396] = 0;
  _$jscoverage['/drag.js'].lineData[397] = 0;
  _$jscoverage['/drag.js'].lineData[398] = 0;
  _$jscoverage['/drag.js'].lineData[399] = 0;
  _$jscoverage['/drag.js'].lineData[400] = 0;
  _$jscoverage['/drag.js'].lineData[401] = 0;
  _$jscoverage['/drag.js'].lineData[406] = 0;
  _$jscoverage['/drag.js'].lineData[407] = 0;
  _$jscoverage['/drag.js'].lineData[408] = 0;
  _$jscoverage['/drag.js'].lineData[409] = 0;
  _$jscoverage['/drag.js'].lineData[410] = 0;
  _$jscoverage['/drag.js'].lineData[411] = 0;
  _$jscoverage['/drag.js'].lineData[416] = 0;
  _$jscoverage['/drag.js'].lineData[417] = 0;
  _$jscoverage['/drag.js'].lineData[418] = 0;
  _$jscoverage['/drag.js'].lineData[420] = 0;
  _$jscoverage['/drag.js'].lineData[421] = 0;
  _$jscoverage['/drag.js'].lineData[424] = 0;
  _$jscoverage['/drag.js'].lineData[427] = 0;
  _$jscoverage['/drag.js'].lineData[428] = 0;
  _$jscoverage['/drag.js'].lineData[431] = 0;
  _$jscoverage['/drag.js'].lineData[433] = 0;
  _$jscoverage['/drag.js'].lineData[434] = 0;
  _$jscoverage['/drag.js'].lineData[441] = 0;
  _$jscoverage['/drag.js'].lineData[442] = 0;
  _$jscoverage['/drag.js'].lineData[445] = 0;
  _$jscoverage['/drag.js'].lineData[446] = 0;
  _$jscoverage['/drag.js'].lineData[447] = 0;
  _$jscoverage['/drag.js'].lineData[448] = 0;
  _$jscoverage['/drag.js'].lineData[452] = 0;
  _$jscoverage['/drag.js'].lineData[453] = 0;
  _$jscoverage['/drag.js'].lineData[454] = 0;
  _$jscoverage['/drag.js'].lineData[457] = 0;
  _$jscoverage['/drag.js'].lineData[458] = 0;
  _$jscoverage['/drag.js'].lineData[465] = 0;
  _$jscoverage['/drag.js'].lineData[467] = 0;
  _$jscoverage['/drag.js'].lineData[469] = 0;
  _$jscoverage['/drag.js'].lineData[473] = 0;
  _$jscoverage['/drag.js'].lineData[477] = 0;
  _$jscoverage['/drag.js'].lineData[481] = 0;
  _$jscoverage['/drag.js'].lineData[482] = 0;
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
  _$jscoverage['/drag.js'].functionData[19] = 0;
  _$jscoverage['/drag.js'].functionData[20] = 0;
}
if (! _$jscoverage['/drag.js'].branchData) {
  _$jscoverage['/drag.js'].branchData = {};
  _$jscoverage['/drag.js'].branchData['28'] = [];
  _$jscoverage['/drag.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['35'] = [];
  _$jscoverage['/drag.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['48'] = [];
  _$jscoverage['/drag.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['49'] = [];
  _$jscoverage['/drag.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['50'] = [];
  _$jscoverage['/drag.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['53'] = [];
  _$jscoverage['/drag.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['57'] = [];
  _$jscoverage['/drag.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['61'] = [];
  _$jscoverage['/drag.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['70'] = [];
  _$jscoverage['/drag.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['70'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['70'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['70'][4] = new BranchData();
  _$jscoverage['/drag.js'].branchData['71'] = [];
  _$jscoverage['/drag.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['71'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['84'] = [];
  _$jscoverage['/drag.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['85'] = [];
  _$jscoverage['/drag.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['92'] = [];
  _$jscoverage['/drag.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['103'] = [];
  _$jscoverage['/drag.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['105'] = [];
  _$jscoverage['/drag.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['108'] = [];
  _$jscoverage['/drag.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['120'] = [];
  _$jscoverage['/drag.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['130'] = [];
  _$jscoverage['/drag.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['130'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['130'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['177'] = [];
  _$jscoverage['/drag.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['185'] = [];
  _$jscoverage['/drag.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['185'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['185'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['187'] = [];
  _$jscoverage['/drag.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['202'] = [];
  _$jscoverage['/drag.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['213'] = [];
  _$jscoverage['/drag.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['224'] = [];
  _$jscoverage['/drag.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['233'] = [];
  _$jscoverage['/drag.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['240'] = [];
  _$jscoverage['/drag.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['257'] = [];
  _$jscoverage['/drag.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['270'] = [];
  _$jscoverage['/drag.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['273'] = [];
  _$jscoverage['/drag.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['283'] = [];
  _$jscoverage['/drag.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['286'] = [];
  _$jscoverage['/drag.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['287'] = [];
  _$jscoverage['/drag.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['290'] = [];
  _$jscoverage['/drag.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['290'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['290'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['293'] = [];
  _$jscoverage['/drag.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['299'] = [];
  _$jscoverage['/drag.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['299'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['299'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['302'] = [];
  _$jscoverage['/drag.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['309'] = [];
  _$jscoverage['/drag.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['320'] = [];
  _$jscoverage['/drag.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['328'] = [];
  _$jscoverage['/drag.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['335'] = [];
  _$jscoverage['/drag.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['335'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['336'] = [];
  _$jscoverage['/drag.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['336'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['343'] = [];
  _$jscoverage['/drag.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['354'] = [];
  _$jscoverage['/drag.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['376'] = [];
  _$jscoverage['/drag.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['377'] = [];
  _$jscoverage['/drag.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['385'] = [];
  _$jscoverage['/drag.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['388'] = [];
  _$jscoverage['/drag.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['388'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['388'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['390'] = [];
  _$jscoverage['/drag.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['390'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['390'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['395'] = [];
  _$jscoverage['/drag.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['398'] = [];
  _$jscoverage['/drag.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['399'] = [];
  _$jscoverage['/drag.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['408'] = [];
  _$jscoverage['/drag.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['409'] = [];
  _$jscoverage['/drag.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['416'] = [];
  _$jscoverage['/drag.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['417'] = [];
  _$jscoverage['/drag.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['427'] = [];
  _$jscoverage['/drag.js'].branchData['427'][1] = new BranchData();
}
_$jscoverage['/drag.js'].branchData['427'][1].init(30, 16, 'allowX || allowY');
function visit74_427_1(result) {
  _$jscoverage['/drag.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['417'][1].init(34, 25, 'newPageIndex != pageIndex');
function visit73_417_1(result) {
  _$jscoverage['/drag.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['416'][1].init(1908, 25, 'newPageIndex != undefined');
function visit72_416_1(result) {
  _$jscoverage['/drag.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['409'][1].init(42, 23, 'min < nowXY.top - x.top');
function visit71_409_1(result) {
  _$jscoverage['/drag.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['408'][1].init(38, 17, 'x.top < nowXY.top');
function visit70_408_1(result) {
  _$jscoverage['/drag.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['399'][1].init(42, 23, 'min < x.top - nowXY.top');
function visit69_399_1(result) {
  _$jscoverage['/drag.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['398'][1].init(38, 17, 'x.top > nowXY.top');
function visit68_398_1(result) {
  _$jscoverage['/drag.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['395'][1].init(833, 11, 'offsetY > 0');
function visit67_395_1(result) {
  _$jscoverage['/drag.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['390'][3].init(305, 24, 'offset.left < nowXY.left');
function visit66_390_3(result) {
  _$jscoverage['/drag.js'].branchData['390'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['390'][2].init(290, 11, 'offsetX < 0');
function visit65_390_2(result) {
  _$jscoverage['/drag.js'].branchData['390'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['390'][1].init(290, 39, 'offsetX < 0 && offset.left < nowXY.left');
function visit64_390_1(result) {
  _$jscoverage['/drag.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['388'][3].init(165, 24, 'offset.left > nowXY.left');
function visit63_388_3(result) {
  _$jscoverage['/drag.js'].branchData['388'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['388'][2].init(150, 11, 'offsetX > 0');
function visit62_388_2(result) {
  _$jscoverage['/drag.js'].branchData['388'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['388'][1].init(150, 39, 'offsetX > 0 && offset.left > nowXY.left');
function visit61_388_1(result) {
  _$jscoverage['/drag.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['385'][1].init(34, 7, '!offset');
function visit60_385_1(result) {
  _$jscoverage['/drag.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['377'][1].init(26, 16, 'allowX && allowY');
function visit59_377_1(result) {
  _$jscoverage['/drag.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['376'][1].init(1159, 16, 'allowX || allowY');
function visit58_376_1(result) {
  _$jscoverage['/drag.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['354'][1].init(388, 17, '!self.pagesOffset');
function visit57_354_1(result) {
  _$jscoverage['/drag.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['343'][1].init(40, 10, 'count == 2');
function visit56_343_1(result) {
  _$jscoverage['/drag.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['336'][2].init(538, 33, 'Math.abs(offsetY) > snapThreshold');
function visit55_336_2(result) {
  _$jscoverage['/drag.js'].branchData['336'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['336'][1].init(514, 57, 'self.allowScroll.top && Math.abs(offsetY) > snapThreshold');
function visit54_336_1(result) {
  _$jscoverage['/drag.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['335'][2].init(457, 33, 'Math.abs(offsetX) > snapThreshold');
function visit53_335_2(result) {
  _$jscoverage['/drag.js'].branchData['335'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['335'][1].init(432, 58, 'self.allowScroll.left && Math.abs(offsetX) > snapThreshold');
function visit52_335_1(result) {
  _$jscoverage['/drag.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['328'][1].init(151, 35, '!startMousePos || !self.isScrolling');
function visit51_328_1(result) {
  _$jscoverage['/drag.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['320'][1].init(10822, 7, 'S.UA.ie');
function visit50_320_1(result) {
  _$jscoverage['/drag.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['309'][1].init(1815, 34, 'S.Features.isTouchEventSupported()');
function visit49_309_1(result) {
  _$jscoverage['/drag.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['302'][1].init(113, 27, 'self.get(\'preventDefaultY\')');
function visit48_302_1(result) {
  _$jscoverage['/drag.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['299'][3].init(584, 26, 'dragInitDirection == \'top\'');
function visit47_299_3(result) {
  _$jscoverage['/drag.js'].branchData['299'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['299'][2].init(584, 66, 'dragInitDirection == \'top\' && !self.allowScroll[dragInitDirection]');
function visit46_299_2(result) {
  _$jscoverage['/drag.js'].branchData['299'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['299'][1].init(575, 75, 'lockY && dragInitDirection == \'top\' && !self.allowScroll[dragInitDirection]');
function visit45_299_1(result) {
  _$jscoverage['/drag.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['293'][1].init(113, 27, 'self.get(\'preventDefaultX\')');
function visit44_293_1(result) {
  _$jscoverage['/drag.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['290'][3].init(242, 27, 'dragInitDirection == \'left\'');
function visit43_290_3(result) {
  _$jscoverage['/drag.js'].branchData['290'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['290'][2].init(242, 67, 'dragInitDirection == \'left\' && !self.allowScroll[dragInitDirection]');
function visit42_290_2(result) {
  _$jscoverage['/drag.js'].branchData['290'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['290'][1].init(233, 76, 'lockX && dragInitDirection == \'left\' && !self.allowScroll[dragInitDirection]');
function visit41_290_1(result) {
  _$jscoverage['/drag.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['287'][1].init(63, 13, 'xDiff > yDiff');
function visit40_287_1(result) {
  _$jscoverage['/drag.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['286'][1].init(56, 45, '!(dragInitDirection = self.dragInitDirection)');
function visit39_286_1(result) {
  _$jscoverage['/drag.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['283'][1].init(875, 14, 'lockX || lockY');
function visit38_283_1(result) {
  _$jscoverage['/drag.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['273'][1].init(18, 17, '!self.isScrolling');
function visit37_273_1(result) {
  _$jscoverage['/drag.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['270'][1].init(465, 37, 'Math.max(xDiff, yDiff) < PIXEL_THRESH');
function visit36_270_1(result) {
  _$jscoverage['/drag.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['257'][1].init(125, 14, '!startMousePos');
function visit35_257_1(result) {
  _$jscoverage['/drag.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['240'][1].init(570, 18, 'touches.length > 1');
function visit34_240_1(result) {
  _$jscoverage['/drag.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['233'][1].init(331, 11, 'isScrolling');
function visit33_233_1(result) {
  _$jscoverage['/drag.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['224'][1].init(74, 20, 'self.get(\'disabled\')');
function visit32_224_1(result) {
  _$jscoverage['/drag.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['213'][1].init(351, 11, 'value === 0');
function visit31_213_1(result) {
  _$jscoverage['/drag.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['202'][1].init(1177, 18, 'value <= minScroll');
function visit30_202_1(result) {
  _$jscoverage['/drag.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['187'][1].init(58, 22, 'fx.lastValue === value');
function visit29_187_1(result) {
  _$jscoverage['/drag.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['185'][3].init(396, 17, 'value < maxScroll');
function visit28_185_3(result) {
  _$jscoverage['/drag.js'].branchData['185'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['185'][2].init(375, 17, 'value > minScroll');
function visit27_185_2(result) {
  _$jscoverage['/drag.js'].branchData['185'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['185'][1].init(375, 38, 'value > minScroll && value < maxScroll');
function visit26_185_1(result) {
  _$jscoverage['/drag.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['177'][1].init(102, 7, 'inertia');
function visit25_177_1(result) {
  _$jscoverage['/drag.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['130'][3].init(1250, 13, 'distance == 0');
function visit24_130_3(result) {
  _$jscoverage['/drag.js'].branchData['130'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['130'][2].init(1233, 13, 'duration == 0');
function visit23_130_2(result) {
  _$jscoverage['/drag.js'].branchData['130'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['130'][1].init(1233, 30, 'duration == 0 || distance == 0');
function visit22_130_1(result) {
  _$jscoverage['/drag.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['120'][1].init(970, 16, 'self.pagesOffset');
function visit21_120_1(result) {
  _$jscoverage['/drag.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['108'][1].init(590, 19, 'bound !== undefined');
function visit20_108_1(result) {
  _$jscoverage['/drag.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['105'][1].init(489, 30, 'scroll > maxScroll[scrollType]');
function visit19_105_1(result) {
  _$jscoverage['/drag.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['103'][1].init(390, 30, 'scroll < minScroll[scrollType]');
function visit18_103_1(result) {
  _$jscoverage['/drag.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['92'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit17_92_1(result) {
  _$jscoverage['/drag.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['85'][1].init(78, 49, '!self.allowScroll[scrollType] && self.get(lockXY)');
function visit16_85_1(result) {
  _$jscoverage['/drag.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['84'][1].init(23, 20, 'scrollType == \'left\'');
function visit15_84_1(result) {
  _$jscoverage['/drag.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['71'][2].init(118, 32, 'timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit14_71_2(result) {
  _$jscoverage['/drag.js'].branchData['71'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['71'][1].init(55, 39, 'lastDirection[scrollType] !== direction');
function visit13_71_1(result) {
  _$jscoverage['/drag.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['70'][4].init(1676, 39, 'lastDirection[scrollType] !== undefined');
function visit12_70_4(result) {
  _$jscoverage['/drag.js'].branchData['70'][4].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['70'][3].init(1676, 95, 'lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit11_70_3(result) {
  _$jscoverage['/drag.js'].branchData['70'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['70'][2].init(1656, 115, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit10_70_2(result) {
  _$jscoverage['/drag.js'].branchData['70'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['70'][1].init(1656, 151, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction || timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit9_70_1(result) {
  _$jscoverage['/drag.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['61'][1].init(1360, 30, 'scroll > maxScroll[scrollType]');
function visit8_61_1(result) {
  _$jscoverage['/drag.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['57'][1].init(1156, 30, 'scroll < minScroll[scrollType]');
function visit7_57_1(result) {
  _$jscoverage['/drag.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['53'][1].init(1011, 19, '!self.get(\'bounce\')');
function visit6_53_1(result) {
  _$jscoverage['/drag.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['50'][1].init(118, 61, '(pos[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0');
function visit5_50_1(result) {
  _$jscoverage['/drag.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['49'][1].init(32, 57, 'pos[pageOffsetProperty] == lastPageXY[pageOffsetProperty]');
function visit4_49_1(result) {
  _$jscoverage['/drag.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['48'][1].init(771, 30, 'lastPageXY[pageOffsetProperty]');
function visit3_48_1(result) {
  _$jscoverage['/drag.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['35'][1].init(224, 20, 'scrollType == \'left\'');
function visit2_35_1(result) {
  _$jscoverage['/drag.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['28'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit1_28_1(result) {
  _$jscoverage['/drag.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].lineData[6]++;
KISSY.add('scroll-view/drag', function(S, ScrollViewBase, Node, Anim) {
  _$jscoverage['/drag.js'].functionData[0]++;
  _$jscoverage['/drag.js'].lineData[7]++;
  var OUT_OF_BOUND_FACTOR = 0.5;
  _$jscoverage['/drag.js'].lineData[9]++;
  var PIXEL_THRESH = 3;
  _$jscoverage['/drag.js'].lineData[11]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/drag.js'].lineData[13]++;
  var SWIPE_SAMPLE_INTERVAL = 300;
  _$jscoverage['/drag.js'].lineData[15]++;
  var MAX_SWIPE_VELOCITY = 6;
  _$jscoverage['/drag.js'].lineData[17]++;
  var $document = Node.all(document);
  _$jscoverage['/drag.js'].lineData[19]++;
  function onDragStart(self, e, scrollType) {
    _$jscoverage['/drag.js'].functionData[1]++;
    _$jscoverage['/drag.js'].lineData[20]++;
    var now = e.timeStamp, scroll = self.get('scroll' + S.ucfirst(scrollType));
    _$jscoverage['/drag.js'].lineData[22]++;
    self.startScroll[scrollType] = scroll;
    _$jscoverage['/drag.js'].lineData[23]++;
    self.swipe[scrollType].startTime = now;
    _$jscoverage['/drag.js'].lineData[24]++;
    self.swipe[scrollType].scroll = scroll;
  }
  _$jscoverage['/drag.js'].lineData[27]++;
  function onDragScroll(self, e, scrollType, startMousePos) {
    _$jscoverage['/drag.js'].functionData[2]++;
    _$jscoverage['/drag.js'].lineData[28]++;
    if (visit1_28_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/drag.js'].lineData[29]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[31]++;
    var pos = {
  pageX: e.touches[0].pageX, 
  pageY: e.touches[0].pageY};
    _$jscoverage['/drag.js'].lineData[35]++;
    var pageOffsetProperty = visit2_35_1(scrollType == 'left') ? 'pageX' : 'pageY', lastPageXY = self.lastPageXY;
    _$jscoverage['/drag.js'].lineData[37]++;
    var diff = pos[pageOffsetProperty] - startMousePos[pageOffsetProperty], eqWithLastPoint, scroll = self.startScroll[scrollType] - diff, bound, now = e.timeStamp, minScroll = self.minScroll, maxScroll = self.maxScroll, lastDirection = self.lastDirection, swipe = self.swipe, direction;
    _$jscoverage['/drag.js'].lineData[48]++;
    if (visit3_48_1(lastPageXY[pageOffsetProperty])) {
      _$jscoverage['/drag.js'].lineData[49]++;
      eqWithLastPoint = visit4_49_1(pos[pageOffsetProperty] == lastPageXY[pageOffsetProperty]);
      _$jscoverage['/drag.js'].lineData[50]++;
      direction = visit5_50_1((pos[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0);
    }
    _$jscoverage['/drag.js'].lineData[53]++;
    if (visit6_53_1(!self.get('bounce'))) {
      _$jscoverage['/drag.js'].lineData[54]++;
      scroll = Math.min(Math.max(scroll, minScroll[scrollType]), maxScroll[scrollType]);
    }
    _$jscoverage['/drag.js'].lineData[57]++;
    if (visit7_57_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/drag.js'].lineData[58]++;
      bound = minScroll[scrollType] - scroll;
      _$jscoverage['/drag.js'].lineData[59]++;
      bound *= OUT_OF_BOUND_FACTOR;
      _$jscoverage['/drag.js'].lineData[60]++;
      scroll = minScroll[scrollType] - bound;
    } else {
      _$jscoverage['/drag.js'].lineData[61]++;
      if (visit8_61_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/drag.js'].lineData[62]++;
        bound = scroll - maxScroll[scrollType];
        _$jscoverage['/drag.js'].lineData[63]++;
        bound *= OUT_OF_BOUND_FACTOR;
        _$jscoverage['/drag.js'].lineData[64]++;
        scroll = maxScroll[scrollType] + bound;
      }
    }
    _$jscoverage['/drag.js'].lineData[67]++;
    var timeDiff = (now - swipe[scrollType].startTime);
    _$jscoverage['/drag.js'].lineData[70]++;
    if (visit9_70_1(visit10_70_2(!eqWithLastPoint && visit11_70_3(visit12_70_4(lastDirection[scrollType] !== undefined) && visit13_71_1(lastDirection[scrollType] !== direction))) || visit14_71_2(timeDiff > SWIPE_SAMPLE_INTERVAL))) {
      _$jscoverage['/drag.js'].lineData[72]++;
      swipe[scrollType].startTime = now;
      _$jscoverage['/drag.js'].lineData[73]++;
      swipe[scrollType].scroll = scroll;
    }
    _$jscoverage['/drag.js'].lineData[77]++;
    self.set('scroll' + S.ucfirst(scrollType), scroll);
    _$jscoverage['/drag.js'].lineData[78]++;
    lastDirection[scrollType] = direction;
    _$jscoverage['/drag.js'].lineData[80]++;
    lastPageXY[pageOffsetProperty] = e[pageOffsetProperty];
  }
  _$jscoverage['/drag.js'].lineData[83]++;
  function forbidDrag(self, scrollType) {
    _$jscoverage['/drag.js'].functionData[3]++;
    _$jscoverage['/drag.js'].lineData[84]++;
    var lockXY = visit15_84_1(scrollType == 'left') ? 'lockX' : 'lockY';
    _$jscoverage['/drag.js'].lineData[85]++;
    if (visit16_85_1(!self.allowScroll[scrollType] && self.get(lockXY))) {
      _$jscoverage['/drag.js'].lineData[86]++;
      return 1;
    }
    _$jscoverage['/drag.js'].lineData[88]++;
    return 0;
  }
  _$jscoverage['/drag.js'].lineData[91]++;
  function onDragEndAxis(self, e, scrollType, endCallback) {
    _$jscoverage['/drag.js'].functionData[4]++;
    _$jscoverage['/drag.js'].lineData[92]++;
    if (visit17_92_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/drag.js'].lineData[93]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[94]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[96]++;
    var scrollAxis = 'scroll' + S.ucfirst(scrollType), scroll = self.get(scrollAxis), minScroll = self.minScroll, maxScroll = self.maxScroll, now = e.timeStamp, swipe = self.swipe, bound;
    _$jscoverage['/drag.js'].lineData[103]++;
    if (visit18_103_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/drag.js'].lineData[104]++;
      bound = minScroll[scrollType];
    } else {
      _$jscoverage['/drag.js'].lineData[105]++;
      if (visit19_105_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/drag.js'].lineData[106]++;
        bound = maxScroll[scrollType];
      }
    }
    _$jscoverage['/drag.js'].lineData[108]++;
    if (visit20_108_1(bound !== undefined)) {
      _$jscoverage['/drag.js'].lineData[109]++;
      var scrollCfg = {};
      _$jscoverage['/drag.js'].lineData[110]++;
      scrollCfg[scrollType] = bound;
      _$jscoverage['/drag.js'].lineData[111]++;
      self.scrollTo(scrollCfg, {
  duration: self.get('bounceDuration'), 
  easing: self.get('bounceEasing'), 
  queue: false, 
  complete: endCallback});
      _$jscoverage['/drag.js'].lineData[117]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[120]++;
    if (visit21_120_1(self.pagesOffset)) {
      _$jscoverage['/drag.js'].lineData[121]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[122]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[125]++;
    var duration = now - swipe[scrollType].startTime;
    _$jscoverage['/drag.js'].lineData[126]++;
    var distance = (scroll - swipe[scrollType].scroll);
    _$jscoverage['/drag.js'].lineData[130]++;
    if (visit22_130_1(visit23_130_2(duration == 0) || visit24_130_3(distance == 0))) {
      _$jscoverage['/drag.js'].lineData[131]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[132]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[138]++;
    var velocity = distance / duration;
    _$jscoverage['/drag.js'].lineData[140]++;
    velocity = Math.min(Math.max(velocity, -MAX_SWIPE_VELOCITY), MAX_SWIPE_VELOCITY);
    _$jscoverage['/drag.js'].lineData[145]++;
    var animCfg = {
  node: {}, 
  to: {}, 
  duration: 9999, 
  queue: false, 
  complete: endCallback, 
  frame: makeMomentumFx(self, velocity, scroll, scrollAxis, maxScroll[scrollType], minScroll[scrollType])};
    _$jscoverage['/drag.js'].lineData[156]++;
    animCfg.node[scrollType] = scroll;
    _$jscoverage['/drag.js'].lineData[157]++;
    animCfg.to[scrollType] = null;
    _$jscoverage['/drag.js'].lineData[159]++;
    self.scrollAnims.push(new Anim(animCfg).run());
  }
  _$jscoverage['/drag.js'].lineData[162]++;
  var FRICTION = 0.5;
  _$jscoverage['/drag.js'].lineData[163]++;
  var ACCELERATION = 20;
  _$jscoverage['/drag.js'].lineData[164]++;
  var THETA = Math.log(1 - (FRICTION / 10));
  _$jscoverage['/drag.js'].lineData[165]++;
  var ALPHA = THETA / ACCELERATION;
  _$jscoverage['/drag.js'].lineData[166]++;
  var SPRING_TENSION = 0.3;
  _$jscoverage['/drag.js'].lineData[168]++;
  function makeMomentumFx(self, startVelocity, startScroll, scrollAxis, maxScroll, minScroll) {
    _$jscoverage['/drag.js'].functionData[5]++;
    _$jscoverage['/drag.js'].lineData[170]++;
    var velocity = startVelocity * ACCELERATION;
    _$jscoverage['/drag.js'].lineData[171]++;
    var inertia = 1;
    _$jscoverage['/drag.js'].lineData[172]++;
    var bounceStartTime = 0;
    _$jscoverage['/drag.js'].lineData[173]++;
    return function(anim, fx) {
  _$jscoverage['/drag.js'].functionData[6]++;
  _$jscoverage['/drag.js'].lineData[174]++;
  var now = S.now(), deltaTime, value;
  _$jscoverage['/drag.js'].lineData[177]++;
  if (visit25_177_1(inertia)) {
    _$jscoverage['/drag.js'].lineData[178]++;
    deltaTime = now - anim.startTime;
    _$jscoverage['/drag.js'].lineData[182]++;
    var frictionFactor = Math.exp(deltaTime * ALPHA);
    _$jscoverage['/drag.js'].lineData[184]++;
    value = parseInt(startScroll + velocity * (1 - frictionFactor) / (-THETA));
    _$jscoverage['/drag.js'].lineData[185]++;
    if (visit26_185_1(visit27_185_2(value > minScroll) && visit28_185_3(value < maxScroll))) {
      _$jscoverage['/drag.js'].lineData[187]++;
      if (visit29_187_1(fx.lastValue === value)) {
        _$jscoverage['/drag.js'].lineData[188]++;
        fx.pos = 1;
        _$jscoverage['/drag.js'].lineData[189]++;
        return;
      }
      _$jscoverage['/drag.js'].lineData[191]++;
      fx.lastValue = value;
      _$jscoverage['/drag.js'].lineData[192]++;
      self.set(scrollAxis, value);
      _$jscoverage['/drag.js'].lineData[193]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[195]++;
    inertia = 0;
    _$jscoverage['/drag.js'].lineData[196]++;
    velocity = velocity * frictionFactor;
    _$jscoverage['/drag.js'].lineData[202]++;
    startScroll = visit30_202_1(value <= minScroll) ? minScroll : maxScroll;
    _$jscoverage['/drag.js'].lineData[204]++;
    bounceStartTime = now;
  } else {
    _$jscoverage['/drag.js'].lineData[206]++;
    deltaTime = now - bounceStartTime;
    _$jscoverage['/drag.js'].lineData[208]++;
    var theta = (deltaTime / ACCELERATION), powTime = theta * Math.exp(-SPRING_TENSION * theta);
    _$jscoverage['/drag.js'].lineData[212]++;
    value = parseInt(velocity * powTime);
    _$jscoverage['/drag.js'].lineData[213]++;
    if (visit31_213_1(value === 0)) {
      _$jscoverage['/drag.js'].lineData[214]++;
      fx.pos = 1;
    }
    _$jscoverage['/drag.js'].lineData[216]++;
    self.set(scrollAxis, startScroll + value);
  }
};
  }
  _$jscoverage['/drag.js'].lineData[221]++;
  function onDragStartHandler(e) {
    _$jscoverage['/drag.js'].functionData[7]++;
    _$jscoverage['/drag.js'].lineData[222]++;
    var self = this, touches = e.touches;
    _$jscoverage['/drag.js'].lineData[224]++;
    if (visit32_224_1(self.get('disabled'))) {
      _$jscoverage['/drag.js'].lineData[225]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[227]++;
    self.stopAnimation();
    _$jscoverage['/drag.js'].lineData[228]++;
    var pos = {
  pageX: e.touches[0].pageX, 
  pageY: e.touches[0].pageY};
    _$jscoverage['/drag.js'].lineData[232]++;
    var isScrolling = self.isScrolling;
    _$jscoverage['/drag.js'].lineData[233]++;
    if (visit33_233_1(isScrolling)) {
      _$jscoverage['/drag.js'].lineData[234]++;
      var pageIndex = self.get('pageIndex');
      _$jscoverage['/drag.js'].lineData[235]++;
      self.fire('scrollEnd', S.mix({
  fromPageIndex: pageIndex, 
  pageIndex: pageIndex}, pos));
    }
    _$jscoverage['/drag.js'].lineData[240]++;
    if (visit34_240_1(touches.length > 1)) {
      _$jscoverage['/drag.js'].lineData[241]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[243]++;
    initStates(self);
    _$jscoverage['/drag.js'].lineData[244]++;
    self.startMousePos = pos;
    _$jscoverage['/drag.js'].lineData[245]++;
    onDragStart(self, e, 'left');
    _$jscoverage['/drag.js'].lineData[246]++;
    onDragStart(self, e, 'top');
    _$jscoverage['/drag.js'].lineData[249]++;
    $document.on(Gesture.move, onDragHandler, self).on(Gesture.end, onDragEndHandler, self);
  }
  _$jscoverage['/drag.js'].lineData[252]++;
  function onDragHandler(e) {
    _$jscoverage['/drag.js'].functionData[8]++;
    _$jscoverage['/drag.js'].lineData[253]++;
    var self = this, touches = e.touches, startMousePos = self.startMousePos;
    _$jscoverage['/drag.js'].lineData[257]++;
    if (visit35_257_1(!startMousePos)) {
      _$jscoverage['/drag.js'].lineData[258]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[261]++;
    var pos = {
  pageX: touches[0].pageX, 
  pageY: touches[0].pageY};
    _$jscoverage['/drag.js'].lineData[266]++;
    var xDiff = Math.abs(pos.pageX - startMousePos.pageX);
    _$jscoverage['/drag.js'].lineData[267]++;
    var yDiff = Math.abs(pos.pageY - startMousePos.pageY);
    _$jscoverage['/drag.js'].lineData[270]++;
    if (visit36_270_1(Math.max(xDiff, yDiff) < PIXEL_THRESH)) {
      _$jscoverage['/drag.js'].lineData[271]++;
      return;
    } else {
      _$jscoverage['/drag.js'].lineData[273]++;
      if (visit37_273_1(!self.isScrolling)) {
        _$jscoverage['/drag.js'].lineData[274]++;
        self.fire('scrollStart', pos);
        _$jscoverage['/drag.js'].lineData[275]++;
        self.isScrolling = 1;
      }
    }
    _$jscoverage['/drag.js'].lineData[279]++;
    var lockX = self.get('lockX'), lockY = self.get('lockY');
    _$jscoverage['/drag.js'].lineData[283]++;
    if (visit38_283_1(lockX || lockY)) {
      _$jscoverage['/drag.js'].lineData[284]++;
      var dragInitDirection;
      _$jscoverage['/drag.js'].lineData[286]++;
      if (visit39_286_1(!(dragInitDirection = self.dragInitDirection))) {
        _$jscoverage['/drag.js'].lineData[287]++;
        self.dragInitDirection = dragInitDirection = visit40_287_1(xDiff > yDiff) ? 'left' : 'top';
      }
      _$jscoverage['/drag.js'].lineData[290]++;
      if (visit41_290_1(lockX && visit42_290_2(visit43_290_3(dragInitDirection == 'left') && !self.allowScroll[dragInitDirection]))) {
        _$jscoverage['/drag.js'].lineData[292]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[293]++;
        if (visit44_293_1(self.get('preventDefaultX'))) {
          _$jscoverage['/drag.js'].lineData[294]++;
          e.preventDefault();
        }
        _$jscoverage['/drag.js'].lineData[296]++;
        return;
      }
      _$jscoverage['/drag.js'].lineData[299]++;
      if (visit45_299_1(lockY && visit46_299_2(visit47_299_3(dragInitDirection == 'top') && !self.allowScroll[dragInitDirection]))) {
        _$jscoverage['/drag.js'].lineData[301]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[302]++;
        if (visit48_302_1(self.get('preventDefaultY'))) {
          _$jscoverage['/drag.js'].lineData[303]++;
          e.preventDefault();
        }
        _$jscoverage['/drag.js'].lineData[305]++;
        return;
      }
    }
    _$jscoverage['/drag.js'].lineData[309]++;
    if (visit49_309_1(S.Features.isTouchEventSupported())) {
      _$jscoverage['/drag.js'].lineData[310]++;
      e.preventDefault();
    }
    _$jscoverage['/drag.js'].lineData[313]++;
    onDragScroll(self, e, 'left', startMousePos);
    _$jscoverage['/drag.js'].lineData[314]++;
    onDragScroll(self, e, 'top', startMousePos);
    _$jscoverage['/drag.js'].lineData[317]++;
    self.fire('scrollMove', pos);
  }
  _$jscoverage['/drag.js'].lineData[320]++;
  if (visit50_320_1(S.UA.ie)) {
    _$jscoverage['/drag.js'].lineData[321]++;
    onDragHandler = S.throttle(onDragHandler, 30);
  }
  _$jscoverage['/drag.js'].lineData[324]++;
  function onDragEndHandler(e) {
    _$jscoverage['/drag.js'].functionData[9]++;
    _$jscoverage['/drag.js'].lineData[325]++;
    var self = this;
    _$jscoverage['/drag.js'].lineData[326]++;
    var startMousePos = self.startMousePos;
    _$jscoverage['/drag.js'].lineData[327]++;
    $document.detach(Gesture.move, onDragHandler, self);
    _$jscoverage['/drag.js'].lineData[328]++;
    if (visit51_328_1(!startMousePos || !self.isScrolling)) {
      _$jscoverage['/drag.js'].lineData[329]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[331]++;
    var count = 0;
    _$jscoverage['/drag.js'].lineData[332]++;
    var offsetX = startMousePos.pageX - e.pageX;
    _$jscoverage['/drag.js'].lineData[333]++;
    var offsetY = startMousePos.pageY - e.pageY;
    _$jscoverage['/drag.js'].lineData[334]++;
    var snapThreshold = self.get('snapThreshold');
    _$jscoverage['/drag.js'].lineData[335]++;
    var allowX = visit52_335_1(self.allowScroll.left && visit53_335_2(Math.abs(offsetX) > snapThreshold));
    _$jscoverage['/drag.js'].lineData[336]++;
    var allowY = visit54_336_1(self.allowScroll.top && visit55_336_2(Math.abs(offsetY) > snapThreshold));
    _$jscoverage['/drag.js'].lineData[337]++;
    self.fire('dragend', {
  pageX: e.pageX, 
  pageY: e.pageY});
    _$jscoverage['/drag.js'].lineData[341]++;
    function endCallback() {
      _$jscoverage['/drag.js'].functionData[10]++;
      _$jscoverage['/drag.js'].lineData[342]++;
      count++;
      _$jscoverage['/drag.js'].lineData[343]++;
      if (visit56_343_1(count == 2)) {
        _$jscoverage['/drag.js'].lineData[344]++;
        function scrollEnd() {
          _$jscoverage['/drag.js'].functionData[11]++;
          _$jscoverage['/drag.js'].lineData[345]++;
          self.isScrolling = 0;
          _$jscoverage['/drag.js'].lineData[346]++;
          self.fire('scrollEnd', {
  pageX: e.pageX, 
  pageY: e.pageY, 
  fromPageIndex: pageIndex, 
  pageIndex: self.get('pageIndex')});
        }        _$jscoverage['/drag.js'].lineData[354]++;
        if (visit57_354_1(!self.pagesOffset)) {
          _$jscoverage['/drag.js'].lineData[355]++;
          scrollEnd();
          _$jscoverage['/drag.js'].lineData[356]++;
          return;
        }
        _$jscoverage['/drag.js'].lineData[359]++;
        var snapThreshold = self.get('snapThreshold');
        _$jscoverage['/drag.js'].lineData[360]++;
        var snapDuration = self.get('snapDuration');
        _$jscoverage['/drag.js'].lineData[361]++;
        var snapEasing = self.get('snapEasing');
        _$jscoverage['/drag.js'].lineData[362]++;
        var pageIndex = self.get('pageIndex');
        _$jscoverage['/drag.js'].lineData[363]++;
        var scrollLeft = self.get('scrollLeft');
        _$jscoverage['/drag.js'].lineData[364]++;
        var scrollTop = self.get('scrollTop');
        _$jscoverage['/drag.js'].lineData[366]++;
        var animCfg = {
  duration: snapDuration, 
  easing: snapEasing, 
  complete: scrollEnd};
        _$jscoverage['/drag.js'].lineData[372]++;
        var pagesOffset = self.pagesOffset.concat([]);
        _$jscoverage['/drag.js'].lineData[374]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[376]++;
        if (visit58_376_1(allowX || allowY)) {
          _$jscoverage['/drag.js'].lineData[377]++;
          if (visit59_377_1(allowX && allowY)) {
            _$jscoverage['/drag.js'].lineData[378]++;
            var prepareX = [], newPageIndex = undefined;
            _$jscoverage['/drag.js'].lineData[380]++;
            var nowXY = {
  left: scrollLeft, 
  top: scrollTop};
            _$jscoverage['/drag.js'].lineData[384]++;
            S.each(pagesOffset, function(offset) {
  _$jscoverage['/drag.js'].functionData[12]++;
  _$jscoverage['/drag.js'].lineData[385]++;
  if (visit60_385_1(!offset)) {
    _$jscoverage['/drag.js'].lineData[386]++;
    return;
  }
  _$jscoverage['/drag.js'].lineData[388]++;
  if (visit61_388_1(visit62_388_2(offsetX > 0) && visit63_388_3(offset.left > nowXY.left))) {
    _$jscoverage['/drag.js'].lineData[389]++;
    prepareX.push(offset);
  } else {
    _$jscoverage['/drag.js'].lineData[390]++;
    if (visit64_390_1(visit65_390_2(offsetX < 0) && visit66_390_3(offset.left < nowXY.left))) {
      _$jscoverage['/drag.js'].lineData[391]++;
      prepareX.push(offset);
    }
  }
});
            _$jscoverage['/drag.js'].lineData[394]++;
            var min;
            _$jscoverage['/drag.js'].lineData[395]++;
            if (visit67_395_1(offsetY > 0)) {
              _$jscoverage['/drag.js'].lineData[396]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/drag.js'].lineData[397]++;
              S.each(prepareX, function(x) {
  _$jscoverage['/drag.js'].functionData[13]++;
  _$jscoverage['/drag.js'].lineData[398]++;
  if (visit68_398_1(x.top > nowXY.top)) {
    _$jscoverage['/drag.js'].lineData[399]++;
    if (visit69_399_1(min < x.top - nowXY.top)) {
      _$jscoverage['/drag.js'].lineData[400]++;
      min = x.top - nowXY.top;
      _$jscoverage['/drag.js'].lineData[401]++;
      newPageIndex = prepareX.index;
    }
  }
});
            } else {
              _$jscoverage['/drag.js'].lineData[406]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/drag.js'].lineData[407]++;
              S.each(prepareX, function(x) {
  _$jscoverage['/drag.js'].functionData[14]++;
  _$jscoverage['/drag.js'].lineData[408]++;
  if (visit70_408_1(x.top < nowXY.top)) {
    _$jscoverage['/drag.js'].lineData[409]++;
    if (visit71_409_1(min < nowXY.top - x.top)) {
      _$jscoverage['/drag.js'].lineData[410]++;
      min = nowXY.top - x.top;
      _$jscoverage['/drag.js'].lineData[411]++;
      newPageIndex = prepareX.index;
    }
  }
});
            }
            _$jscoverage['/drag.js'].lineData[416]++;
            if (visit72_416_1(newPageIndex != undefined)) {
              _$jscoverage['/drag.js'].lineData[417]++;
              if (visit73_417_1(newPageIndex != pageIndex)) {
                _$jscoverage['/drag.js'].lineData[418]++;
                self.scrollToPage(newPageIndex, animCfg);
              } else {
                _$jscoverage['/drag.js'].lineData[420]++;
                self.scrollToPage(newPageIndex);
                _$jscoverage['/drag.js'].lineData[421]++;
                scrollEnd();
              }
            } else {
              _$jscoverage['/drag.js'].lineData[424]++;
              scrollEnd();
            }
          } else {
            _$jscoverage['/drag.js'].lineData[427]++;
            if (visit74_427_1(allowX || allowY)) {
              _$jscoverage['/drag.js'].lineData[428]++;
              var toPageIndex = self._getPageIndexFromXY(allowX ? scrollLeft : scrollTop, allowX, allowX ? offsetX : offsetY);
              _$jscoverage['/drag.js'].lineData[431]++;
              self.scrollToPage(toPageIndex, animCfg);
            } else {
              _$jscoverage['/drag.js'].lineData[433]++;
              self.scrollToPage(self.get('pageIndex'));
              _$jscoverage['/drag.js'].lineData[434]++;
              scrollEnd();
            }
          }
        }
      }
    }
    _$jscoverage['/drag.js'].lineData[441]++;
    onDragEndAxis(self, e, 'left', endCallback);
    _$jscoverage['/drag.js'].lineData[442]++;
    onDragEndAxis(self, e, 'top', endCallback);
  }
  _$jscoverage['/drag.js'].lineData[445]++;
  function initStates(self) {
    _$jscoverage['/drag.js'].functionData[15]++;
    _$jscoverage['/drag.js'].lineData[446]++;
    self.lastPageXY = {};
    _$jscoverage['/drag.js'].lineData[447]++;
    self.lastDirection = {};
    _$jscoverage['/drag.js'].lineData[448]++;
    self.swipe = {
  left: {}, 
  top: {}};
    _$jscoverage['/drag.js'].lineData[452]++;
    self.startMousePos = null;
    _$jscoverage['/drag.js'].lineData[453]++;
    self.startScroll = {};
    _$jscoverage['/drag.js'].lineData[454]++;
    self.dragInitDirection = null;
  }
  _$jscoverage['/drag.js'].lineData[457]++;
  function preventDefault(e) {
    _$jscoverage['/drag.js'].functionData[16]++;
    _$jscoverage['/drag.js'].lineData[458]++;
    e.preventDefault();
  }
  _$jscoverage['/drag.js'].lineData[465]++;
  return ScrollViewBase.extend({
  bindUI: function() {
  _$jscoverage['/drag.js'].functionData[17]++;
  _$jscoverage['/drag.js'].lineData[467]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[469]++;
  self.$contentEl.on('dragstart', preventDefault).on(Gesture.start, onDragStartHandler, self);
}, 
  syncUI: function() {
  _$jscoverage['/drag.js'].functionData[18]++;
  _$jscoverage['/drag.js'].lineData[473]++;
  initStates(this);
}, 
  destructor: function() {
  _$jscoverage['/drag.js'].functionData[19]++;
  _$jscoverage['/drag.js'].lineData[477]++;
  this.stopAnimation();
}, 
  stopAnimation: function() {
  _$jscoverage['/drag.js'].functionData[20]++;
  _$jscoverage['/drag.js'].lineData[481]++;
  this.callSuper();
  _$jscoverage['/drag.js'].lineData[482]++;
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
  snapThreshold: {
  value: 5}, 
  bounce: {
  value: true}, 
  bounceDuration: {
  value: 0.4}, 
  bounceEasing: {
  value: 'easeOut'}}, 
  xclass: 'scroll-view'});
}, {
  requires: ['./base', 'node', 'anim']});
