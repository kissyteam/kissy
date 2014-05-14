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
if (! _$jscoverage['/picker.js']) {
  _$jscoverage['/picker.js'] = {};
  _$jscoverage['/picker.js'].lineData = [];
  _$jscoverage['/picker.js'].lineData[6] = 0;
  _$jscoverage['/picker.js'].lineData[7] = 0;
  _$jscoverage['/picker.js'].lineData[8] = 0;
  _$jscoverage['/picker.js'].lineData[13] = 0;
  _$jscoverage['/picker.js'].lineData[14] = 0;
  _$jscoverage['/picker.js'].lineData[15] = 0;
  _$jscoverage['/picker.js'].lineData[16] = 0;
  _$jscoverage['/picker.js'].lineData[18] = 0;
  _$jscoverage['/picker.js'].lineData[20] = 0;
  _$jscoverage['/picker.js'].lineData[21] = 0;
  _$jscoverage['/picker.js'].lineData[22] = 0;
  _$jscoverage['/picker.js'].lineData[23] = 0;
  _$jscoverage['/picker.js'].lineData[24] = 0;
  _$jscoverage['/picker.js'].lineData[33] = 0;
  _$jscoverage['/picker.js'].lineData[34] = 0;
  _$jscoverage['/picker.js'].lineData[36] = 0;
  _$jscoverage['/picker.js'].lineData[37] = 0;
  _$jscoverage['/picker.js'].lineData[42] = 0;
  _$jscoverage['/picker.js'].lineData[43] = 0;
  _$jscoverage['/picker.js'].lineData[48] = 0;
  _$jscoverage['/picker.js'].lineData[49] = 0;
  _$jscoverage['/picker.js'].lineData[53] = 0;
  _$jscoverage['/picker.js'].lineData[54] = 0;
  _$jscoverage['/picker.js'].lineData[55] = 0;
  _$jscoverage['/picker.js'].lineData[57] = 0;
  _$jscoverage['/picker.js'].lineData[61] = 0;
  _$jscoverage['/picker.js'].lineData[62] = 0;
  _$jscoverage['/picker.js'].lineData[63] = 0;
  _$jscoverage['/picker.js'].lineData[65] = 0;
  _$jscoverage['/picker.js'].lineData[69] = 0;
  _$jscoverage['/picker.js'].lineData[70] = 0;
  _$jscoverage['/picker.js'].lineData[73] = 0;
  _$jscoverage['/picker.js'].lineData[74] = 0;
  _$jscoverage['/picker.js'].lineData[75] = 0;
  _$jscoverage['/picker.js'].lineData[76] = 0;
  _$jscoverage['/picker.js'].lineData[79] = 0;
  _$jscoverage['/picker.js'].lineData[80] = 0;
  _$jscoverage['/picker.js'].lineData[81] = 0;
  _$jscoverage['/picker.js'].lineData[82] = 0;
  _$jscoverage['/picker.js'].lineData[85] = 0;
  _$jscoverage['/picker.js'].lineData[86] = 0;
  _$jscoverage['/picker.js'].lineData[87] = 0;
  _$jscoverage['/picker.js'].lineData[88] = 0;
  _$jscoverage['/picker.js'].lineData[91] = 0;
  _$jscoverage['/picker.js'].lineData[92] = 0;
  _$jscoverage['/picker.js'].lineData[93] = 0;
  _$jscoverage['/picker.js'].lineData[94] = 0;
  _$jscoverage['/picker.js'].lineData[97] = 0;
  _$jscoverage['/picker.js'].lineData[98] = 0;
  _$jscoverage['/picker.js'].lineData[99] = 0;
  _$jscoverage['/picker.js'].lineData[100] = 0;
  _$jscoverage['/picker.js'].lineData[103] = 0;
  _$jscoverage['/picker.js'].lineData[104] = 0;
  _$jscoverage['/picker.js'].lineData[105] = 0;
  _$jscoverage['/picker.js'].lineData[106] = 0;
  _$jscoverage['/picker.js'].lineData[109] = 0;
  _$jscoverage['/picker.js'].lineData[110] = 0;
  _$jscoverage['/picker.js'].lineData[111] = 0;
  _$jscoverage['/picker.js'].lineData[114] = 0;
  _$jscoverage['/picker.js'].lineData[115] = 0;
  _$jscoverage['/picker.js'].lineData[116] = 0;
  _$jscoverage['/picker.js'].lineData[119] = 0;
  _$jscoverage['/picker.js'].lineData[120] = 0;
  _$jscoverage['/picker.js'].lineData[121] = 0;
  _$jscoverage['/picker.js'].lineData[124] = 0;
  _$jscoverage['/picker.js'].lineData[125] = 0;
  _$jscoverage['/picker.js'].lineData[126] = 0;
  _$jscoverage['/picker.js'].lineData[129] = 0;
  _$jscoverage['/picker.js'].lineData[130] = 0;
  _$jscoverage['/picker.js'].lineData[131] = 0;
  _$jscoverage['/picker.js'].lineData[132] = 0;
  _$jscoverage['/picker.js'].lineData[133] = 0;
  _$jscoverage['/picker.js'].lineData[134] = 0;
  _$jscoverage['/picker.js'].lineData[135] = 0;
  _$jscoverage['/picker.js'].lineData[136] = 0;
  _$jscoverage['/picker.js'].lineData[137] = 0;
  _$jscoverage['/picker.js'].lineData[140] = 0;
  _$jscoverage['/picker.js'].lineData[141] = 0;
  _$jscoverage['/picker.js'].lineData[142] = 0;
  _$jscoverage['/picker.js'].lineData[148] = 0;
  _$jscoverage['/picker.js'].lineData[149] = 0;
  _$jscoverage['/picker.js'].lineData[150] = 0;
  _$jscoverage['/picker.js'].lineData[151] = 0;
  _$jscoverage['/picker.js'].lineData[152] = 0;
  _$jscoverage['/picker.js'].lineData[155] = 0;
  _$jscoverage['/picker.js'].lineData[156] = 0;
  _$jscoverage['/picker.js'].lineData[157] = 0;
  _$jscoverage['/picker.js'].lineData[161] = 0;
  _$jscoverage['/picker.js'].lineData[162] = 0;
  _$jscoverage['/picker.js'].lineData[165] = 0;
  _$jscoverage['/picker.js'].lineData[166] = 0;
  _$jscoverage['/picker.js'].lineData[167] = 0;
  _$jscoverage['/picker.js'].lineData[170] = 0;
  _$jscoverage['/picker.js'].lineData[171] = 0;
  _$jscoverage['/picker.js'].lineData[172] = 0;
  _$jscoverage['/picker.js'].lineData[173] = 0;
  _$jscoverage['/picker.js'].lineData[174] = 0;
  _$jscoverage['/picker.js'].lineData[175] = 0;
  _$jscoverage['/picker.js'].lineData[178] = 0;
  _$jscoverage['/picker.js'].lineData[179] = 0;
  _$jscoverage['/picker.js'].lineData[181] = 0;
  _$jscoverage['/picker.js'].lineData[182] = 0;
  _$jscoverage['/picker.js'].lineData[183] = 0;
  _$jscoverage['/picker.js'].lineData[184] = 0;
  _$jscoverage['/picker.js'].lineData[186] = 0;
  _$jscoverage['/picker.js'].lineData[190] = 0;
  _$jscoverage['/picker.js'].lineData[191] = 0;
  _$jscoverage['/picker.js'].lineData[192] = 0;
  _$jscoverage['/picker.js'].lineData[193] = 0;
  _$jscoverage['/picker.js'].lineData[195] = 0;
  _$jscoverage['/picker.js'].lineData[205] = 0;
  _$jscoverage['/picker.js'].lineData[207] = 0;
  _$jscoverage['/picker.js'].lineData[208] = 0;
  _$jscoverage['/picker.js'].lineData[209] = 0;
  _$jscoverage['/picker.js'].lineData[210] = 0;
  _$jscoverage['/picker.js'].lineData[211] = 0;
  _$jscoverage['/picker.js'].lineData[212] = 0;
  _$jscoverage['/picker.js'].lineData[213] = 0;
  _$jscoverage['/picker.js'].lineData[214] = 0;
  _$jscoverage['/picker.js'].lineData[215] = 0;
  _$jscoverage['/picker.js'].lineData[216] = 0;
  _$jscoverage['/picker.js'].lineData[217] = 0;
  _$jscoverage['/picker.js'].lineData[219] = 0;
  _$jscoverage['/picker.js'].lineData[232] = 0;
  _$jscoverage['/picker.js'].lineData[236] = 0;
  _$jscoverage['/picker.js'].lineData[240] = 0;
  _$jscoverage['/picker.js'].lineData[241] = 0;
  _$jscoverage['/picker.js'].lineData[242] = 0;
  _$jscoverage['/picker.js'].lineData[243] = 0;
  _$jscoverage['/picker.js'].lineData[244] = 0;
  _$jscoverage['/picker.js'].lineData[245] = 0;
  _$jscoverage['/picker.js'].lineData[251] = 0;
  _$jscoverage['/picker.js'].lineData[252] = 0;
  _$jscoverage['/picker.js'].lineData[253] = 0;
  _$jscoverage['/picker.js'].lineData[257] = 0;
  _$jscoverage['/picker.js'].lineData[258] = 0;
  _$jscoverage['/picker.js'].lineData[259] = 0;
  _$jscoverage['/picker.js'].lineData[260] = 0;
  _$jscoverage['/picker.js'].lineData[261] = 0;
  _$jscoverage['/picker.js'].lineData[265] = 0;
  _$jscoverage['/picker.js'].lineData[266] = 0;
  _$jscoverage['/picker.js'].lineData[267] = 0;
  _$jscoverage['/picker.js'].lineData[268] = 0;
  _$jscoverage['/picker.js'].lineData[269] = 0;
  _$jscoverage['/picker.js'].lineData[270] = 0;
  _$jscoverage['/picker.js'].lineData[271] = 0;
  _$jscoverage['/picker.js'].lineData[275] = 0;
  _$jscoverage['/picker.js'].lineData[297] = 0;
  _$jscoverage['/picker.js'].lineData[298] = 0;
  _$jscoverage['/picker.js'].lineData[299] = 0;
  _$jscoverage['/picker.js'].lineData[300] = 0;
  _$jscoverage['/picker.js'].lineData[301] = 0;
  _$jscoverage['/picker.js'].lineData[303] = 0;
  _$jscoverage['/picker.js'].lineData[304] = 0;
  _$jscoverage['/picker.js'].lineData[305] = 0;
  _$jscoverage['/picker.js'].lineData[306] = 0;
  _$jscoverage['/picker.js'].lineData[307] = 0;
  _$jscoverage['/picker.js'].lineData[308] = 0;
  _$jscoverage['/picker.js'].lineData[309] = 0;
  _$jscoverage['/picker.js'].lineData[310] = 0;
  _$jscoverage['/picker.js'].lineData[311] = 0;
  _$jscoverage['/picker.js'].lineData[313] = 0;
  _$jscoverage['/picker.js'].lineData[314] = 0;
  _$jscoverage['/picker.js'].lineData[317] = 0;
  _$jscoverage['/picker.js'].lineData[318] = 0;
  _$jscoverage['/picker.js'].lineData[319] = 0;
  _$jscoverage['/picker.js'].lineData[320] = 0;
  _$jscoverage['/picker.js'].lineData[321] = 0;
  _$jscoverage['/picker.js'].lineData[322] = 0;
  _$jscoverage['/picker.js'].lineData[327] = 0;
  _$jscoverage['/picker.js'].lineData[328] = 0;
  _$jscoverage['/picker.js'].lineData[329] = 0;
  _$jscoverage['/picker.js'].lineData[330] = 0;
  _$jscoverage['/picker.js'].lineData[331] = 0;
  _$jscoverage['/picker.js'].lineData[333] = 0;
  _$jscoverage['/picker.js'].lineData[334] = 0;
  _$jscoverage['/picker.js'].lineData[336] = 0;
  _$jscoverage['/picker.js'].lineData[337] = 0;
  _$jscoverage['/picker.js'].lineData[338] = 0;
  _$jscoverage['/picker.js'].lineData[340] = 0;
  _$jscoverage['/picker.js'].lineData[341] = 0;
  _$jscoverage['/picker.js'].lineData[343] = 0;
  _$jscoverage['/picker.js'].lineData[344] = 0;
  _$jscoverage['/picker.js'].lineData[346] = 0;
  _$jscoverage['/picker.js'].lineData[347] = 0;
  _$jscoverage['/picker.js'].lineData[348] = 0;
  _$jscoverage['/picker.js'].lineData[351] = 0;
  _$jscoverage['/picker.js'].lineData[352] = 0;
  _$jscoverage['/picker.js'].lineData[353] = 0;
  _$jscoverage['/picker.js'].lineData[361] = 0;
  _$jscoverage['/picker.js'].lineData[367] = 0;
  _$jscoverage['/picker.js'].lineData[369] = 0;
  _$jscoverage['/picker.js'].lineData[371] = 0;
  _$jscoverage['/picker.js'].lineData[372] = 0;
  _$jscoverage['/picker.js'].lineData[376] = 0;
  _$jscoverage['/picker.js'].lineData[377] = 0;
  _$jscoverage['/picker.js'].lineData[378] = 0;
  _$jscoverage['/picker.js'].lineData[379] = 0;
  _$jscoverage['/picker.js'].lineData[380] = 0;
  _$jscoverage['/picker.js'].lineData[381] = 0;
  _$jscoverage['/picker.js'].lineData[382] = 0;
  _$jscoverage['/picker.js'].lineData[383] = 0;
  _$jscoverage['/picker.js'].lineData[384] = 0;
  _$jscoverage['/picker.js'].lineData[386] = 0;
  _$jscoverage['/picker.js'].lineData[387] = 0;
  _$jscoverage['/picker.js'].lineData[388] = 0;
  _$jscoverage['/picker.js'].lineData[394] = 0;
  _$jscoverage['/picker.js'].lineData[395] = 0;
  _$jscoverage['/picker.js'].lineData[396] = 0;
  _$jscoverage['/picker.js'].lineData[397] = 0;
  _$jscoverage['/picker.js'].lineData[398] = 0;
  _$jscoverage['/picker.js'].lineData[399] = 0;
  _$jscoverage['/picker.js'].lineData[400] = 0;
  _$jscoverage['/picker.js'].lineData[401] = 0;
  _$jscoverage['/picker.js'].lineData[402] = 0;
  _$jscoverage['/picker.js'].lineData[403] = 0;
  _$jscoverage['/picker.js'].lineData[404] = 0;
  _$jscoverage['/picker.js'].lineData[405] = 0;
  _$jscoverage['/picker.js'].lineData[408] = 0;
  _$jscoverage['/picker.js'].lineData[409] = 0;
  _$jscoverage['/picker.js'].lineData[410] = 0;
  _$jscoverage['/picker.js'].lineData[411] = 0;
  _$jscoverage['/picker.js'].lineData[412] = 0;
  _$jscoverage['/picker.js'].lineData[413] = 0;
  _$jscoverage['/picker.js'].lineData[415] = 0;
  _$jscoverage['/picker.js'].lineData[419] = 0;
  _$jscoverage['/picker.js'].lineData[420] = 0;
  _$jscoverage['/picker.js'].lineData[421] = 0;
  _$jscoverage['/picker.js'].lineData[422] = 0;
  _$jscoverage['/picker.js'].lineData[424] = 0;
  _$jscoverage['/picker.js'].lineData[425] = 0;
  _$jscoverage['/picker.js'].lineData[427] = 0;
  _$jscoverage['/picker.js'].lineData[428] = 0;
  _$jscoverage['/picker.js'].lineData[433] = 0;
  _$jscoverage['/picker.js'].lineData[434] = 0;
  _$jscoverage['/picker.js'].lineData[436] = 0;
  _$jscoverage['/picker.js'].lineData[438] = 0;
  _$jscoverage['/picker.js'].lineData[439] = 0;
  _$jscoverage['/picker.js'].lineData[440] = 0;
  _$jscoverage['/picker.js'].lineData[442] = 0;
  _$jscoverage['/picker.js'].lineData[443] = 0;
  _$jscoverage['/picker.js'].lineData[444] = 0;
  _$jscoverage['/picker.js'].lineData[446] = 0;
  _$jscoverage['/picker.js'].lineData[449] = 0;
  _$jscoverage['/picker.js'].lineData[452] = 0;
  _$jscoverage['/picker.js'].lineData[454] = 0;
  _$jscoverage['/picker.js'].lineData[455] = 0;
  _$jscoverage['/picker.js'].lineData[457] = 0;
  _$jscoverage['/picker.js'].lineData[458] = 0;
  _$jscoverage['/picker.js'].lineData[460] = 0;
  _$jscoverage['/picker.js'].lineData[461] = 0;
  _$jscoverage['/picker.js'].lineData[463] = 0;
  _$jscoverage['/picker.js'].lineData[465] = 0;
  _$jscoverage['/picker.js'].lineData[467] = 0;
  _$jscoverage['/picker.js'].lineData[468] = 0;
  _$jscoverage['/picker.js'].lineData[470] = 0;
  _$jscoverage['/picker.js'].lineData[472] = 0;
  _$jscoverage['/picker.js'].lineData[474] = 0;
  _$jscoverage['/picker.js'].lineData[475] = 0;
  _$jscoverage['/picker.js'].lineData[477] = 0;
  _$jscoverage['/picker.js'].lineData[478] = 0;
  _$jscoverage['/picker.js'].lineData[480] = 0;
  _$jscoverage['/picker.js'].lineData[481] = 0;
  _$jscoverage['/picker.js'].lineData[483] = 0;
  _$jscoverage['/picker.js'].lineData[484] = 0;
  _$jscoverage['/picker.js'].lineData[486] = 0;
  _$jscoverage['/picker.js'].lineData[489] = 0;
  _$jscoverage['/picker.js'].lineData[491] = 0;
  _$jscoverage['/picker.js'].lineData[514] = 0;
  _$jscoverage['/picker.js'].lineData[515] = 0;
  _$jscoverage['/picker.js'].lineData[516] = 0;
  _$jscoverage['/picker.js'].lineData[521] = 0;
  _$jscoverage['/picker.js'].lineData[526] = 0;
  _$jscoverage['/picker.js'].lineData[531] = 0;
  _$jscoverage['/picker.js'].lineData[536] = 0;
  _$jscoverage['/picker.js'].lineData[541] = 0;
  _$jscoverage['/picker.js'].lineData[549] = 0;
  _$jscoverage['/picker.js'].lineData[554] = 0;
  _$jscoverage['/picker.js'].lineData[559] = 0;
  _$jscoverage['/picker.js'].lineData[564] = 0;
}
if (! _$jscoverage['/picker.js'].functionData) {
  _$jscoverage['/picker.js'].functionData = [];
  _$jscoverage['/picker.js'].functionData[0] = 0;
  _$jscoverage['/picker.js'].functionData[1] = 0;
  _$jscoverage['/picker.js'].functionData[2] = 0;
  _$jscoverage['/picker.js'].functionData[3] = 0;
  _$jscoverage['/picker.js'].functionData[4] = 0;
  _$jscoverage['/picker.js'].functionData[5] = 0;
  _$jscoverage['/picker.js'].functionData[6] = 0;
  _$jscoverage['/picker.js'].functionData[7] = 0;
  _$jscoverage['/picker.js'].functionData[8] = 0;
  _$jscoverage['/picker.js'].functionData[9] = 0;
  _$jscoverage['/picker.js'].functionData[10] = 0;
  _$jscoverage['/picker.js'].functionData[11] = 0;
  _$jscoverage['/picker.js'].functionData[12] = 0;
  _$jscoverage['/picker.js'].functionData[13] = 0;
  _$jscoverage['/picker.js'].functionData[14] = 0;
  _$jscoverage['/picker.js'].functionData[15] = 0;
  _$jscoverage['/picker.js'].functionData[16] = 0;
  _$jscoverage['/picker.js'].functionData[17] = 0;
  _$jscoverage['/picker.js'].functionData[18] = 0;
  _$jscoverage['/picker.js'].functionData[19] = 0;
  _$jscoverage['/picker.js'].functionData[20] = 0;
  _$jscoverage['/picker.js'].functionData[21] = 0;
  _$jscoverage['/picker.js'].functionData[22] = 0;
  _$jscoverage['/picker.js'].functionData[23] = 0;
  _$jscoverage['/picker.js'].functionData[24] = 0;
  _$jscoverage['/picker.js'].functionData[25] = 0;
  _$jscoverage['/picker.js'].functionData[26] = 0;
  _$jscoverage['/picker.js'].functionData[27] = 0;
  _$jscoverage['/picker.js'].functionData[28] = 0;
  _$jscoverage['/picker.js'].functionData[29] = 0;
  _$jscoverage['/picker.js'].functionData[30] = 0;
  _$jscoverage['/picker.js'].functionData[31] = 0;
  _$jscoverage['/picker.js'].functionData[32] = 0;
  _$jscoverage['/picker.js'].functionData[33] = 0;
  _$jscoverage['/picker.js'].functionData[34] = 0;
  _$jscoverage['/picker.js'].functionData[35] = 0;
  _$jscoverage['/picker.js'].functionData[36] = 0;
  _$jscoverage['/picker.js'].functionData[37] = 0;
  _$jscoverage['/picker.js'].functionData[38] = 0;
  _$jscoverage['/picker.js'].functionData[39] = 0;
  _$jscoverage['/picker.js'].functionData[40] = 0;
  _$jscoverage['/picker.js'].functionData[41] = 0;
  _$jscoverage['/picker.js'].functionData[42] = 0;
  _$jscoverage['/picker.js'].functionData[43] = 0;
}
if (! _$jscoverage['/picker.js'].branchData) {
  _$jscoverage['/picker.js'].branchData = {};
  _$jscoverage['/picker.js'].branchData['43'] = [];
  _$jscoverage['/picker.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['43'][2] = new BranchData();
  _$jscoverage['/picker.js'].branchData['44'] = [];
  _$jscoverage['/picker.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/picker.js'].branchData['45'] = [];
  _$jscoverage['/picker.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['49'] = [];
  _$jscoverage['/picker.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['49'][2] = new BranchData();
  _$jscoverage['/picker.js'].branchData['50'] = [];
  _$jscoverage['/picker.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['54'] = [];
  _$jscoverage['/picker.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['57'] = [];
  _$jscoverage['/picker.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['57'][2] = new BranchData();
  _$jscoverage['/picker.js'].branchData['58'] = [];
  _$jscoverage['/picker.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['62'] = [];
  _$jscoverage['/picker.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['65'] = [];
  _$jscoverage['/picker.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['65'][2] = new BranchData();
  _$jscoverage['/picker.js'].branchData['66'] = [];
  _$jscoverage['/picker.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['136'] = [];
  _$jscoverage['/picker.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['181'] = [];
  _$jscoverage['/picker.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['192'] = [];
  _$jscoverage['/picker.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['214'] = [];
  _$jscoverage['/picker.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['306'] = [];
  _$jscoverage['/picker.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['307'] = [];
  _$jscoverage['/picker.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['309'] = [];
  _$jscoverage['/picker.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['319'] = [];
  _$jscoverage['/picker.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['321'] = [];
  _$jscoverage['/picker.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['327'] = [];
  _$jscoverage['/picker.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['333'] = [];
  _$jscoverage['/picker.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['336'] = [];
  _$jscoverage['/picker.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['340'] = [];
  _$jscoverage['/picker.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['343'] = [];
  _$jscoverage['/picker.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['346'] = [];
  _$jscoverage['/picker.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['352'] = [];
  _$jscoverage['/picker.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['352'][2] = new BranchData();
  _$jscoverage['/picker.js'].branchData['381'] = [];
  _$jscoverage['/picker.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['396'] = [];
  _$jscoverage['/picker.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['402'] = [];
  _$jscoverage['/picker.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['402'][2] = new BranchData();
  _$jscoverage['/picker.js'].branchData['427'] = [];
  _$jscoverage['/picker.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['433'] = [];
  _$jscoverage['/picker.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['460'] = [];
  _$jscoverage['/picker.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/picker.js'].branchData['467'] = [];
  _$jscoverage['/picker.js'].branchData['467'][1] = new BranchData();
}
_$jscoverage['/picker.js'].branchData['467'][1].init(44, 7, 'ctrlKey');
function visit96_467_1(result) {
  _$jscoverage['/picker.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['460'][1].init(43, 7, 'ctrlKey');
function visit95_460_1(result) {
  _$jscoverage['/picker.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['433'][1].init(48, 8, '!ctrlKey');
function visit94_433_1(result) {
  _$jscoverage['/picker.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['427'][1].init(302, 17, 'this.get(\'clear\')');
function visit93_427_1(result) {
  _$jscoverage['/picker.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['402'][2].init(340, 42, 'disabledDate && disabledDate(value, value)');
function visit92_402_2(result) {
  _$jscoverage['/picker.js'].branchData['402'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['402'][1].init(338, 45, '!(disabledDate && disabledDate(value, value))');
function visit91_402_1(result) {
  _$jscoverage['/picker.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['396'][1].init(87, 28, 'isSameMonth(preValue, value)');
function visit90_396_1(result) {
  _$jscoverage['/picker.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['381'][1].init(253, 1, 'v');
function visit89_381_1(result) {
  _$jscoverage['/picker.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['352'][2].init(1045, 53, 'dateRender && (dateHtml = dateRender(current, value))');
function visit88_352_2(result) {
  _$jscoverage['/picker.js'].branchData['352'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['352'][1].init(1043, 56, '!(dateRender && (dateHtml = dateRender(current, value)))');
function visit87_352_1(result) {
  _$jscoverage['/picker.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['346'][1].init(810, 44, 'disabledDate && disabledDate(current, value)');
function visit86_346_1(result) {
  _$jscoverage['/picker.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['343'][1].init(664, 37, 'afterCurrentMonthYear(current, value)');
function visit85_343_1(result) {
  _$jscoverage['/picker.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['340'][1].init(517, 38, 'beforeCurrentMonthYear(current, value)');
function visit84_340_1(result) {
  _$jscoverage['/picker.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['336'][1].init(333, 37, '!isClear && isSameDay(current, value)');
function visit83_336_1(result) {
  _$jscoverage['/picker.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['333'][1].init(206, 25, 'isSameDay(current, today)');
function visit82_333_1(result) {
  _$jscoverage['/picker.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['327'][1].init(349, 18, 'j < DATE_COL_COUNT');
function visit81_327_1(result) {
  _$jscoverage['/picker.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['321'][1].init(70, 14, 'showWeekNumber');
function visit80_321_1(result) {
  _$jscoverage['/picker.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['319'][1].init(2129, 18, 'i < DATE_ROW_COUNT');
function visit79_319_1(result) {
  _$jscoverage['/picker.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['309'][1].init(69, 6, 'passed');
function visit78_309_1(result) {
  _$jscoverage['/picker.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['307'][1].init(30, 18, 'j < DATE_COL_COUNT');
function visit77_307_1(result) {
  _$jscoverage['/picker.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['306'][1].init(1643, 18, 'i < DATE_ROW_COUNT');
function visit76_306_1(result) {
  _$jscoverage['/picker.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['214'][1].init(333, 18, 'i < DATE_COL_COUNT');
function visit75_214_1(result) {
  _$jscoverage['/picker.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['192'][1].init(43, 18, '!this.get(\'clear\')');
function visit74_192_1(result) {
  _$jscoverage['/picker.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['181'][1].init(77, 2, '!v');
function visit73_181_1(result) {
  _$jscoverage['/picker.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['136'][1].init(270, 54, 'disabledDate && disabledDate(value, self.get(\'value\'))');
function visit72_136_1(result) {
  _$jscoverage['/picker.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['66'][1].init(53, 37, 'current.getMonth() > today.getMonth()');
function visit71_66_1(result) {
  _$jscoverage['/picker.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['65'][2].init(103, 37, 'current.getYear() === today.getYear()');
function visit70_65_2(result) {
  _$jscoverage['/picker.js'].branchData['65'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['65'][1].init(103, 91, 'current.getYear() === today.getYear() && current.getMonth() > today.getMonth()');
function visit69_65_1(result) {
  _$jscoverage['/picker.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['62'][1].init(14, 35, 'current.getYear() > today.getYear()');
function visit68_62_1(result) {
  _$jscoverage['/picker.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['58'][1].init(53, 37, 'current.getMonth() < today.getMonth()');
function visit67_58_1(result) {
  _$jscoverage['/picker.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['57'][2].init(103, 37, 'current.getYear() === today.getYear()');
function visit66_57_2(result) {
  _$jscoverage['/picker.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['57'][1].init(103, 91, 'current.getYear() === today.getYear() && current.getMonth() < today.getMonth()');
function visit65_57_1(result) {
  _$jscoverage['/picker.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['54'][1].init(14, 35, 'current.getYear() < today.getYear()');
function visit64_54_1(result) {
  _$jscoverage['/picker.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['50'][1].init(47, 33, 'one.getMonth() === two.getMonth()');
function visit63_50_1(result) {
  _$jscoverage['/picker.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['49'][2].init(17, 31, 'one.getYear() === two.getYear()');
function visit62_49_2(result) {
  _$jscoverage['/picker.js'].branchData['49'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['49'][1].init(17, 81, 'one.getYear() === two.getYear() && one.getMonth() === two.getMonth()');
function visit61_49_1(result) {
  _$jscoverage['/picker.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['45'][1].init(49, 43, 'one.getDayOfMonth() === two.getDayOfMonth()');
function visit60_45_1(result) {
  _$jscoverage['/picker.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['44'][2].init(67, 33, 'one.getMonth() === two.getMonth()');
function visit59_44_2(result) {
  _$jscoverage['/picker.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['44'][1].init(47, 93, 'one.getMonth() === two.getMonth() && one.getDayOfMonth() === two.getDayOfMonth()');
function visit58_44_1(result) {
  _$jscoverage['/picker.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['43'][2].init(17, 31, 'one.getYear() === two.getYear()');
function visit57_43_2(result) {
  _$jscoverage['/picker.js'].branchData['43'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].branchData['43'][1].init(17, 141, 'one.getYear() === two.getYear() && one.getMonth() === two.getMonth() && one.getDayOfMonth() === two.getDayOfMonth()');
function visit56_43_1(result) {
  _$jscoverage['/picker.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/picker.js'].functionData[0]++;
  _$jscoverage['/picker.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/picker.js'].lineData[8]++;
  var Node = require('node'), GregorianCalendar = require('date/gregorian'), locale = require('i18n!date/picker'), Control = require('component/control'), MonthPanel = require('./picker/month-panel/control');
  _$jscoverage['/picker.js'].lineData[13]++;
  var TapGesture = require('event/gesture/tap');
  _$jscoverage['/picker.js'].lineData[14]++;
  var tap = TapGesture.TAP;
  _$jscoverage['/picker.js'].lineData[15]++;
  var $ = Node.all;
  _$jscoverage['/picker.js'].lineData[16]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/picker.js'].lineData[18]++;
  var DateTimeFormat = require('date/format'), PickerTpl = require('date/picker-xtpl');
  _$jscoverage['/picker.js'].lineData[20]++;
  var dateRowTplStart = '<tr role="row">';
  _$jscoverage['/picker.js'].lineData[21]++;
  var dateRowTplEnd = '</tr>';
  _$jscoverage['/picker.js'].lineData[22]++;
  var dateCellTpl = '<td role="gridcell" data-index="{index}" title="{title}" class="{cls}">{content}</td>';
  _$jscoverage['/picker.js'].lineData[23]++;
  var weekNumberCellTpl = '<td role="gridcell" class="{cls}">{content}</td>';
  _$jscoverage['/picker.js'].lineData[24]++;
  var dateTpl = '<a ' + ' id="{id}" ' + ' hidefocus="on" ' + ' unselectable="on" ' + ' tabindex="-1" ' + ' class="{cls}" ' + ' href="#" ' + ' aria-selected="{selected}" ' + ' aria-disabled="{disabled}">{content}</a>';
  _$jscoverage['/picker.js'].lineData[33]++;
  var DATE_ROW_COUNT = 6;
  _$jscoverage['/picker.js'].lineData[34]++;
  var DATE_COL_COUNT = 7;
  _$jscoverage['/picker.js'].lineData[36]++;
  function getIdFromDate(d) {
    _$jscoverage['/picker.js'].functionData[1]++;
    _$jscoverage['/picker.js'].lineData[37]++;
    return 'ks-date-picker-date-' + d.getYear() + '-' + d.getMonth() + '-' + d.getDayOfMonth();
  }
  _$jscoverage['/picker.js'].lineData[42]++;
  function isSameDay(one, two) {
    _$jscoverage['/picker.js'].functionData[2]++;
    _$jscoverage['/picker.js'].lineData[43]++;
    return visit56_43_1(visit57_43_2(one.getYear() === two.getYear()) && visit58_44_1(visit59_44_2(one.getMonth() === two.getMonth()) && visit60_45_1(one.getDayOfMonth() === two.getDayOfMonth())));
  }
  _$jscoverage['/picker.js'].lineData[48]++;
  function isSameMonth(one, two) {
    _$jscoverage['/picker.js'].functionData[3]++;
    _$jscoverage['/picker.js'].lineData[49]++;
    return visit61_49_1(visit62_49_2(one.getYear() === two.getYear()) && visit63_50_1(one.getMonth() === two.getMonth()));
  }
  _$jscoverage['/picker.js'].lineData[53]++;
  function beforeCurrentMonthYear(current, today) {
    _$jscoverage['/picker.js'].functionData[4]++;
    _$jscoverage['/picker.js'].lineData[54]++;
    if (visit64_54_1(current.getYear() < today.getYear())) {
      _$jscoverage['/picker.js'].lineData[55]++;
      return 1;
    }
    _$jscoverage['/picker.js'].lineData[57]++;
    return visit65_57_1(visit66_57_2(current.getYear() === today.getYear()) && visit67_58_1(current.getMonth() < today.getMonth()));
  }
  _$jscoverage['/picker.js'].lineData[61]++;
  function afterCurrentMonthYear(current, today) {
    _$jscoverage['/picker.js'].functionData[5]++;
    _$jscoverage['/picker.js'].lineData[62]++;
    if (visit68_62_1(current.getYear() > today.getYear())) {
      _$jscoverage['/picker.js'].lineData[63]++;
      return 1;
    }
    _$jscoverage['/picker.js'].lineData[65]++;
    return visit69_65_1(visit70_65_2(current.getYear() === today.getYear()) && visit71_66_1(current.getMonth() > today.getMonth()));
  }
  _$jscoverage['/picker.js'].lineData[69]++;
  function renderDatesCmd() {
    _$jscoverage['/picker.js'].functionData[6]++;
    _$jscoverage['/picker.js'].lineData[70]++;
    return this.root.config.control.renderDates();
  }
  _$jscoverage['/picker.js'].lineData[73]++;
  function goStartMonth(self) {
    _$jscoverage['/picker.js'].functionData[7]++;
    _$jscoverage['/picker.js'].lineData[74]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker.js'].lineData[75]++;
    next.setDayOfMonth(1);
    _$jscoverage['/picker.js'].lineData[76]++;
    self.set('value', next);
  }
  _$jscoverage['/picker.js'].lineData[79]++;
  function goEndMonth(self) {
    _$jscoverage['/picker.js'].functionData[8]++;
    _$jscoverage['/picker.js'].lineData[80]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker.js'].lineData[81]++;
    next.setDayOfMonth(next.getActualMaximum(GregorianCalendar.MONTH));
    _$jscoverage['/picker.js'].lineData[82]++;
    self.set('value', next);
  }
  _$jscoverage['/picker.js'].lineData[85]++;
  function goMonth(self, direction) {
    _$jscoverage['/picker.js'].functionData[9]++;
    _$jscoverage['/picker.js'].lineData[86]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker.js'].lineData[87]++;
    next.addMonth(direction);
    _$jscoverage['/picker.js'].lineData[88]++;
    self.set('value', next);
  }
  _$jscoverage['/picker.js'].lineData[91]++;
  function goYear(self, direction) {
    _$jscoverage['/picker.js'].functionData[10]++;
    _$jscoverage['/picker.js'].lineData[92]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker.js'].lineData[93]++;
    next.addYear(direction);
    _$jscoverage['/picker.js'].lineData[94]++;
    self.set('value', next);
  }
  _$jscoverage['/picker.js'].lineData[97]++;
  function goWeek(self, direction) {
    _$jscoverage['/picker.js'].functionData[11]++;
    _$jscoverage['/picker.js'].lineData[98]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker.js'].lineData[99]++;
    next.addWeekOfYear(direction);
    _$jscoverage['/picker.js'].lineData[100]++;
    self.set('value', next);
  }
  _$jscoverage['/picker.js'].lineData[103]++;
  function goDay(self, direction) {
    _$jscoverage['/picker.js'].functionData[12]++;
    _$jscoverage['/picker.js'].lineData[104]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker.js'].lineData[105]++;
    next.addDayOfMonth(direction);
    _$jscoverage['/picker.js'].lineData[106]++;
    self.set('value', next);
  }
  _$jscoverage['/picker.js'].lineData[109]++;
  function nextMonth(e) {
    _$jscoverage['/picker.js'].functionData[13]++;
    _$jscoverage['/picker.js'].lineData[110]++;
    e.preventDefault();
    _$jscoverage['/picker.js'].lineData[111]++;
    goMonth(this, 1);
  }
  _$jscoverage['/picker.js'].lineData[114]++;
  function previousMonth(e) {
    _$jscoverage['/picker.js'].functionData[14]++;
    _$jscoverage['/picker.js'].lineData[115]++;
    e.preventDefault();
    _$jscoverage['/picker.js'].lineData[116]++;
    goMonth(this, -1);
  }
  _$jscoverage['/picker.js'].lineData[119]++;
  function nextYear(e) {
    _$jscoverage['/picker.js'].functionData[15]++;
    _$jscoverage['/picker.js'].lineData[120]++;
    e.preventDefault();
    _$jscoverage['/picker.js'].lineData[121]++;
    goYear(this, 1);
  }
  _$jscoverage['/picker.js'].lineData[124]++;
  function previousYear(e) {
    _$jscoverage['/picker.js'].functionData[16]++;
    _$jscoverage['/picker.js'].lineData[125]++;
    e.preventDefault();
    _$jscoverage['/picker.js'].lineData[126]++;
    goYear(this, -1);
  }
  _$jscoverage['/picker.js'].lineData[129]++;
  function chooseCell(e) {
    _$jscoverage['/picker.js'].functionData[17]++;
    _$jscoverage['/picker.js'].lineData[130]++;
    var self = this;
    _$jscoverage['/picker.js'].lineData[131]++;
    self.set('clear', false);
    _$jscoverage['/picker.js'].lineData[132]++;
    var disabledDate = self.get('disabledDate');
    _$jscoverage['/picker.js'].lineData[133]++;
    e.preventDefault();
    _$jscoverage['/picker.js'].lineData[134]++;
    var td = $(e.currentTarget);
    _$jscoverage['/picker.js'].lineData[135]++;
    var value = self.dateTable[parseInt(td.attr('data-index'), 10)];
    _$jscoverage['/picker.js'].lineData[136]++;
    if (visit72_136_1(disabledDate && disabledDate(value, self.get('value')))) {
      _$jscoverage['/picker.js'].lineData[137]++;
      return;
    }
    _$jscoverage['/picker.js'].lineData[140]++;
    setTimeout(function() {
  _$jscoverage['/picker.js'].functionData[18]++;
  _$jscoverage['/picker.js'].lineData[141]++;
  self.set('value', value);
  _$jscoverage['/picker.js'].lineData[142]++;
  self.fire('select', {
  value: value});
}, 0);
  }
  _$jscoverage['/picker.js'].lineData[148]++;
  function showMonthPanel(e) {
    _$jscoverage['/picker.js'].functionData[19]++;
    _$jscoverage['/picker.js'].lineData[149]++;
    e.preventDefault();
    _$jscoverage['/picker.js'].lineData[150]++;
    var monthPanel = this.get('monthPanel');
    _$jscoverage['/picker.js'].lineData[151]++;
    monthPanel.set('value', this.get('value'));
    _$jscoverage['/picker.js'].lineData[152]++;
    monthPanel.show();
  }
  _$jscoverage['/picker.js'].lineData[155]++;
  function setUpMonthPanel() {
    _$jscoverage['/picker.js'].functionData[20]++;
    _$jscoverage['/picker.js'].lineData[156]++;
    var self = this;
    _$jscoverage['/picker.js'].lineData[157]++;
    var monthPanel = new MonthPanel({
  locale: this.get('locale'), 
  render: self.get('el')});
    _$jscoverage['/picker.js'].lineData[161]++;
    monthPanel.on('select', onMonthPanelSelect, self);
    _$jscoverage['/picker.js'].lineData[162]++;
    return monthPanel;
  }
  _$jscoverage['/picker.js'].lineData[165]++;
  function onMonthPanelSelect(e) {
    _$jscoverage['/picker.js'].functionData[21]++;
    _$jscoverage['/picker.js'].lineData[166]++;
    this.set('value', e.value);
    _$jscoverage['/picker.js'].lineData[167]++;
    this.get('monthPanel').hide();
  }
  _$jscoverage['/picker.js'].lineData[170]++;
  function chooseToday(e) {
    _$jscoverage['/picker.js'].functionData[22]++;
    _$jscoverage['/picker.js'].lineData[171]++;
    e.preventDefault();
    _$jscoverage['/picker.js'].lineData[172]++;
    this.set('clear', false);
    _$jscoverage['/picker.js'].lineData[173]++;
    var today = this.get('value').clone();
    _$jscoverage['/picker.js'].lineData[174]++;
    today.setTime(util.now());
    _$jscoverage['/picker.js'].lineData[175]++;
    this.set('value', today);
  }
  _$jscoverage['/picker.js'].lineData[178]++;
  function toggleClear() {
    _$jscoverage['/picker.js'].functionData[23]++;
    _$jscoverage['/picker.js'].lineData[179]++;
    var self = this, v = !self.get('clear');
    _$jscoverage['/picker.js'].lineData[181]++;
    if (visit73_181_1(!v)) {
      _$jscoverage['/picker.js'].lineData[182]++;
      var value = self.get('value');
      _$jscoverage['/picker.js'].lineData[183]++;
      value.setDayOfMonth(1);
      _$jscoverage['/picker.js'].lineData[184]++;
      self.set('clear', false);
    } else {
      _$jscoverage['/picker.js'].lineData[186]++;
      self.set('clear', true);
    }
  }
  _$jscoverage['/picker.js'].lineData[190]++;
  function onClearClick(e) {
    _$jscoverage['/picker.js'].functionData[24]++;
    _$jscoverage['/picker.js'].lineData[191]++;
    e.preventDefault();
    _$jscoverage['/picker.js'].lineData[192]++;
    if (visit74_192_1(!this.get('clear'))) {
      _$jscoverage['/picker.js'].lineData[193]++;
      toggleClear.call(this);
    }
    _$jscoverage['/picker.js'].lineData[195]++;
    this.fire('select', {
  value: null});
  }
  _$jscoverage['/picker.js'].lineData[205]++;
  return Control.extend({
  beforeCreateDom: function(renderData, renderCommands) {
  _$jscoverage['/picker.js'].functionData[25]++;
  _$jscoverage['/picker.js'].lineData[207]++;
  var self = this;
  _$jscoverage['/picker.js'].lineData[208]++;
  var locale = self.get('locale');
  _$jscoverage['/picker.js'].lineData[209]++;
  var value = self.get('value');
  _$jscoverage['/picker.js'].lineData[210]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker.js'].lineData[211]++;
  var veryShortWeekdays = [];
  _$jscoverage['/picker.js'].lineData[212]++;
  var weekDays = [];
  _$jscoverage['/picker.js'].lineData[213]++;
  var firstDayOfWeek = value.getFirstDayOfWeek();
  _$jscoverage['/picker.js'].lineData[214]++;
  for (var i = 0; visit75_214_1(i < DATE_COL_COUNT); i++) {
    _$jscoverage['/picker.js'].lineData[215]++;
    var index = (firstDayOfWeek + i) % DATE_COL_COUNT;
    _$jscoverage['/picker.js'].lineData[216]++;
    veryShortWeekdays[i] = locale.veryShortWeekdays[index];
    _$jscoverage['/picker.js'].lineData[217]++;
    weekDays[i] = dateLocale.weekdays[index];
  }
  _$jscoverage['/picker.js'].lineData[219]++;
  util.mix(renderData, {
  monthSelectLabel: locale.monthSelect, 
  monthYearLabel: self.getMonthYearLabel(), 
  previousMonthLabel: locale.previousMonth, 
  nextMonthLabel: locale.nextMonth, 
  previousYearLabel: locale.previousYear, 
  nextYearLabel: locale.nextYear, 
  weekdays: weekDays, 
  veryShortWeekdays: veryShortWeekdays, 
  todayLabel: locale.today, 
  clearLabel: locale.clear, 
  todayTimeLabel: self.getTodayTimeLabel()});
  _$jscoverage['/picker.js'].lineData[232]++;
  renderCommands.renderDates = renderDatesCmd;
}, 
  createDom: function() {
  _$jscoverage['/picker.js'].functionData[26]++;
  _$jscoverage['/picker.js'].lineData[236]++;
  this.$el.attr('aria-activedescendant', getIdFromDate(this.get('value')));
}, 
  bindUI: function() {
  _$jscoverage['/picker.js'].functionData[27]++;
  _$jscoverage['/picker.js'].lineData[240]++;
  var self = this;
  _$jscoverage['/picker.js'].lineData[241]++;
  self.get('nextMonthBtn').on(tap, nextMonth, self);
  _$jscoverage['/picker.js'].lineData[242]++;
  self.get('previousMonthBtn').on(tap, previousMonth, self);
  _$jscoverage['/picker.js'].lineData[243]++;
  self.get('nextYearBtn').on(tap, nextYear, self);
  _$jscoverage['/picker.js'].lineData[244]++;
  self.get('previousYearBtn').on(tap, previousYear, self);
  _$jscoverage['/picker.js'].lineData[245]++;
  self.get('tbodyEl').delegate(tap, '.' + self.getBaseCssClass('cell'), chooseCell, self);
  _$jscoverage['/picker.js'].lineData[251]++;
  self.get('monthSelectEl').on(tap, showMonthPanel, self);
  _$jscoverage['/picker.js'].lineData[252]++;
  self.get('todayBtnEl').on(tap, chooseToday, self);
  _$jscoverage['/picker.js'].lineData[253]++;
  self.get('clearBtnEl').on(tap, onClearClick, self);
}, 
  getMonthYearLabel: function() {
  _$jscoverage['/picker.js'].functionData[28]++;
  _$jscoverage['/picker.js'].lineData[257]++;
  var self = this;
  _$jscoverage['/picker.js'].lineData[258]++;
  var locale = self.get('locale');
  _$jscoverage['/picker.js'].lineData[259]++;
  var value = self.get('value');
  _$jscoverage['/picker.js'].lineData[260]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker.js'].lineData[261]++;
  return new DateTimeFormat(locale.monthYearFormat, dateLocale).format(value);
}, 
  getTodayTimeLabel: function() {
  _$jscoverage['/picker.js'].functionData[29]++;
  _$jscoverage['/picker.js'].lineData[265]++;
  var self = this;
  _$jscoverage['/picker.js'].lineData[266]++;
  var locale = self.get('locale');
  _$jscoverage['/picker.js'].lineData[267]++;
  var value = self.get('value');
  _$jscoverage['/picker.js'].lineData[268]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker.js'].lineData[269]++;
  var today = value.clone();
  _$jscoverage['/picker.js'].lineData[270]++;
  today.setTime(util.now());
  _$jscoverage['/picker.js'].lineData[271]++;
  return new DateTimeFormat(locale.dateFormat, dateLocale).format(today);
}, 
  renderDates: function() {
  _$jscoverage['/picker.js'].functionData[30]++;
  _$jscoverage['/picker.js'].lineData[275]++;
  var self = this, i, j, dateTable = [], current, isClear = self.get('clear'), showWeekNumber = self.get('showWeekNumber'), locale = self.get('locale'), value = self.get('value'), today = value.clone(), cellClass = self.getBaseCssClasses('cell'), weekNumberCellClass = self.getBaseCssClasses('week-number-cell'), dateClass = self.getBaseCssClasses('date'), dateRender = self.get('dateRender'), disabledDate = self.get('disabledDate'), dateLocale = value.getLocale(), dateFormatter = new DateTimeFormat(locale.dateFormat, dateLocale), todayClass = self.getBaseCssClasses('today'), selectedClass = self.getBaseCssClasses('selected-day'), lastMonthDayClass = self.getBaseCssClasses('last-month-cell'), nextMonthDayClass = self.getBaseCssClasses('next-month-btn-day'), disabledClass = self.getBaseCssClasses('disabled-cell');
  _$jscoverage['/picker.js'].lineData[297]++;
  today.setTime(util.now());
  _$jscoverage['/picker.js'].lineData[298]++;
  var month1 = value.clone();
  _$jscoverage['/picker.js'].lineData[299]++;
  month1.set(value.getYear(), value.getMonth(), 1);
  _$jscoverage['/picker.js'].lineData[300]++;
  var day = month1.getDayOfWeek();
  _$jscoverage['/picker.js'].lineData[301]++;
  var lastMonthDiffDay = (day + 7 - value.getFirstDayOfWeek()) % 7;
  _$jscoverage['/picker.js'].lineData[303]++;
  var lastMonth1 = month1.clone();
  _$jscoverage['/picker.js'].lineData[304]++;
  lastMonth1.addDayOfMonth(0 - lastMonthDiffDay);
  _$jscoverage['/picker.js'].lineData[305]++;
  var passed = 0;
  _$jscoverage['/picker.js'].lineData[306]++;
  for (i = 0; visit76_306_1(i < DATE_ROW_COUNT); i++) {
    _$jscoverage['/picker.js'].lineData[307]++;
    for (j = 0; visit77_307_1(j < DATE_COL_COUNT); j++) {
      _$jscoverage['/picker.js'].lineData[308]++;
      current = lastMonth1;
      _$jscoverage['/picker.js'].lineData[309]++;
      if (visit78_309_1(passed)) {
        _$jscoverage['/picker.js'].lineData[310]++;
        current = current.clone();
        _$jscoverage['/picker.js'].lineData[311]++;
        current.addDayOfMonth(passed);
      }
      _$jscoverage['/picker.js'].lineData[313]++;
      dateTable.push(current);
      _$jscoverage['/picker.js'].lineData[314]++;
      passed++;
    }
  }
  _$jscoverage['/picker.js'].lineData[317]++;
  var tableHtml = '';
  _$jscoverage['/picker.js'].lineData[318]++;
  passed = 0;
  _$jscoverage['/picker.js'].lineData[319]++;
  for (i = 0; visit79_319_1(i < DATE_ROW_COUNT); i++) {
    _$jscoverage['/picker.js'].lineData[320]++;
    var rowHtml = dateRowTplStart;
    _$jscoverage['/picker.js'].lineData[321]++;
    if (visit80_321_1(showWeekNumber)) {
      _$jscoverage['/picker.js'].lineData[322]++;
      rowHtml += util.substitute(weekNumberCellTpl, {
  cls: weekNumberCellClass, 
  content: dateTable[passed].getWeekOfYear()});
    }
    _$jscoverage['/picker.js'].lineData[327]++;
    for (j = 0; visit81_327_1(j < DATE_COL_COUNT); j++) {
      _$jscoverage['/picker.js'].lineData[328]++;
      current = dateTable[passed];
      _$jscoverage['/picker.js'].lineData[329]++;
      var cls = cellClass;
      _$jscoverage['/picker.js'].lineData[330]++;
      var disabled = false;
      _$jscoverage['/picker.js'].lineData[331]++;
      var selected = false;
      _$jscoverage['/picker.js'].lineData[333]++;
      if (visit82_333_1(isSameDay(current, today))) {
        _$jscoverage['/picker.js'].lineData[334]++;
        cls += ' ' + todayClass;
      }
      _$jscoverage['/picker.js'].lineData[336]++;
      if (visit83_336_1(!isClear && isSameDay(current, value))) {
        _$jscoverage['/picker.js'].lineData[337]++;
        cls += ' ' + selectedClass;
        _$jscoverage['/picker.js'].lineData[338]++;
        selected = true;
      }
      _$jscoverage['/picker.js'].lineData[340]++;
      if (visit84_340_1(beforeCurrentMonthYear(current, value))) {
        _$jscoverage['/picker.js'].lineData[341]++;
        cls += ' ' + lastMonthDayClass;
      }
      _$jscoverage['/picker.js'].lineData[343]++;
      if (visit85_343_1(afterCurrentMonthYear(current, value))) {
        _$jscoverage['/picker.js'].lineData[344]++;
        cls += ' ' + nextMonthDayClass;
      }
      _$jscoverage['/picker.js'].lineData[346]++;
      if (visit86_346_1(disabledDate && disabledDate(current, value))) {
        _$jscoverage['/picker.js'].lineData[347]++;
        cls += ' ' + disabledClass;
        _$jscoverage['/picker.js'].lineData[348]++;
        disabled = true;
      }
      _$jscoverage['/picker.js'].lineData[351]++;
      var dateHtml = '';
      _$jscoverage['/picker.js'].lineData[352]++;
      if (visit87_352_1(!(visit88_352_2(dateRender && (dateHtml = dateRender(current, value)))))) {
        _$jscoverage['/picker.js'].lineData[353]++;
        dateHtml = util.substitute(dateTpl, {
  cls: dateClass, 
  id: getIdFromDate(current), 
  selected: selected, 
  disabled: disabled, 
  content: current.getDayOfMonth()});
      }
      _$jscoverage['/picker.js'].lineData[361]++;
      rowHtml += util.substitute(dateCellTpl, {
  cls: cls, 
  index: passed, 
  title: dateFormatter.format(current), 
  content: dateHtml});
      _$jscoverage['/picker.js'].lineData[367]++;
      passed++;
    }
    _$jscoverage['/picker.js'].lineData[369]++;
    tableHtml += rowHtml + dateRowTplEnd;
  }
  _$jscoverage['/picker.js'].lineData[371]++;
  self.dateTable = dateTable;
  _$jscoverage['/picker.js'].lineData[372]++;
  return tableHtml;
}, 
  _onSetClear: function(v) {
  _$jscoverage['/picker.js'].functionData[31]++;
  _$jscoverage['/picker.js'].lineData[376]++;
  var self = this;
  _$jscoverage['/picker.js'].lineData[377]++;
  var value = self.get('value');
  _$jscoverage['/picker.js'].lineData[378]++;
  var selectedCls = this.getBaseCssClasses('selected-day');
  _$jscoverage['/picker.js'].lineData[379]++;
  var id = getIdFromDate(value);
  _$jscoverage['/picker.js'].lineData[380]++;
  var currentA = this.$('#' + id);
  _$jscoverage['/picker.js'].lineData[381]++;
  if (visit89_381_1(v)) {
    _$jscoverage['/picker.js'].lineData[382]++;
    currentA.parent().removeClass(selectedCls);
    _$jscoverage['/picker.js'].lineData[383]++;
    currentA.attr('aria-selected', false);
    _$jscoverage['/picker.js'].lineData[384]++;
    self.$el.attr('aria-activedescendant', '');
  } else {
    _$jscoverage['/picker.js'].lineData[386]++;
    currentA.parent().addClass(selectedCls);
    _$jscoverage['/picker.js'].lineData[387]++;
    currentA.attr('aria-selected', true);
    _$jscoverage['/picker.js'].lineData[388]++;
    self.$el.attr('aria-activedescendant', id);
  }
}, 
  _onSetValue: function(value, e) {
  _$jscoverage['/picker.js'].functionData[32]++;
  _$jscoverage['/picker.js'].lineData[394]++;
  var self = this;
  _$jscoverage['/picker.js'].lineData[395]++;
  var preValue = e.prevVal;
  _$jscoverage['/picker.js'].lineData[396]++;
  if (visit90_396_1(isSameMonth(preValue, value))) {
    _$jscoverage['/picker.js'].lineData[397]++;
    var disabledDate = self.get('disabledDate');
    _$jscoverage['/picker.js'].lineData[398]++;
    var selectedCls = self.getBaseCssClasses('selected-day');
    _$jscoverage['/picker.js'].lineData[399]++;
    var prevA = self.$('#' + getIdFromDate(preValue));
    _$jscoverage['/picker.js'].lineData[400]++;
    prevA.parent().removeClass(selectedCls);
    _$jscoverage['/picker.js'].lineData[401]++;
    prevA.attr('aria-selected', false);
    _$jscoverage['/picker.js'].lineData[402]++;
    if (visit91_402_1(!(visit92_402_2(disabledDate && disabledDate(value, value))))) {
      _$jscoverage['/picker.js'].lineData[403]++;
      var currentA = self.$('#' + getIdFromDate(value));
      _$jscoverage['/picker.js'].lineData[404]++;
      currentA.parent().addClass(selectedCls);
      _$jscoverage['/picker.js'].lineData[405]++;
      currentA.attr('aria-selected', true);
    }
  } else {
    _$jscoverage['/picker.js'].lineData[408]++;
    var tbodyEl = self.get('tbodyEl');
    _$jscoverage['/picker.js'].lineData[409]++;
    var monthSelectContentEl = self.get('monthSelectContentEl');
    _$jscoverage['/picker.js'].lineData[410]++;
    var todayBtnEl = self.get('todayBtnEl');
    _$jscoverage['/picker.js'].lineData[411]++;
    monthSelectContentEl.html(self.getMonthYearLabel());
    _$jscoverage['/picker.js'].lineData[412]++;
    todayBtnEl.attr('title', self.getTodayTimeLabel());
    _$jscoverage['/picker.js'].lineData[413]++;
    tbodyEl.html(self.renderDates());
  }
  _$jscoverage['/picker.js'].lineData[415]++;
  self.$el.attr('aria-activedescendant', getIdFromDate(value));
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/picker.js'].functionData[33]++;
  _$jscoverage['/picker.js'].lineData[419]++;
  var self = this;
  _$jscoverage['/picker.js'].lineData[420]++;
  var keyCode = e.keyCode;
  _$jscoverage['/picker.js'].lineData[421]++;
  var ctrlKey = e.ctrlKey;
  _$jscoverage['/picker.js'].lineData[422]++;
  switch (keyCode) {
    case KeyCode.SPACE:
      _$jscoverage['/picker.js'].lineData[424]++;
      self.set('clear', !self.get('clear'));
      _$jscoverage['/picker.js'].lineData[425]++;
      return true;
  }
  _$jscoverage['/picker.js'].lineData[427]++;
  if (visit93_427_1(this.get('clear'))) {
    _$jscoverage['/picker.js'].lineData[428]++;
    switch (keyCode) {
      case KeyCode.DOWN:
      case KeyCode.UP:
      case KeyCode.LEFT:
      case KeyCode.RIGHT:
        _$jscoverage['/picker.js'].lineData[433]++;
        if (visit94_433_1(!ctrlKey)) {
          _$jscoverage['/picker.js'].lineData[434]++;
          toggleClear.call(self);
        }
        _$jscoverage['/picker.js'].lineData[436]++;
        return true;
      case KeyCode.HOME:
        _$jscoverage['/picker.js'].lineData[438]++;
        toggleClear.call(self);
        _$jscoverage['/picker.js'].lineData[439]++;
        goStartMonth(self);
        _$jscoverage['/picker.js'].lineData[440]++;
        return true;
      case KeyCode.END:
        _$jscoverage['/picker.js'].lineData[442]++;
        toggleClear.call(self);
        _$jscoverage['/picker.js'].lineData[443]++;
        goEndMonth(self);
        _$jscoverage['/picker.js'].lineData[444]++;
        return true;
      case KeyCode.ENTER:
        _$jscoverage['/picker.js'].lineData[446]++;
        self.fire('select', {
  value: null});
        _$jscoverage['/picker.js'].lineData[449]++;
        return true;
    }
  }
  _$jscoverage['/picker.js'].lineData[452]++;
  switch (keyCode) {
    case KeyCode.DOWN:
      _$jscoverage['/picker.js'].lineData[454]++;
      goWeek(self, 1);
      _$jscoverage['/picker.js'].lineData[455]++;
      return true;
    case KeyCode.UP:
      _$jscoverage['/picker.js'].lineData[457]++;
      goWeek(self, -1);
      _$jscoverage['/picker.js'].lineData[458]++;
      return true;
    case KeyCode.LEFT:
      _$jscoverage['/picker.js'].lineData[460]++;
      if (visit95_460_1(ctrlKey)) {
        _$jscoverage['/picker.js'].lineData[461]++;
        goYear(self, -1);
      } else {
        _$jscoverage['/picker.js'].lineData[463]++;
        goDay(self, -1);
      }
      _$jscoverage['/picker.js'].lineData[465]++;
      return true;
    case KeyCode.RIGHT:
      _$jscoverage['/picker.js'].lineData[467]++;
      if (visit96_467_1(ctrlKey)) {
        _$jscoverage['/picker.js'].lineData[468]++;
        goYear(self, 1);
      } else {
        _$jscoverage['/picker.js'].lineData[470]++;
        goDay(self, 1);
      }
      _$jscoverage['/picker.js'].lineData[472]++;
      return true;
    case KeyCode.HOME:
      _$jscoverage['/picker.js'].lineData[474]++;
      goStartMonth(self);
      _$jscoverage['/picker.js'].lineData[475]++;
      return true;
    case KeyCode.END:
      _$jscoverage['/picker.js'].lineData[477]++;
      goEndMonth(self);
      _$jscoverage['/picker.js'].lineData[478]++;
      return true;
    case KeyCode.PAGE_DOWN:
      _$jscoverage['/picker.js'].lineData[480]++;
      goMonth(self, 1);
      _$jscoverage['/picker.js'].lineData[481]++;
      return true;
    case KeyCode.PAGE_UP:
      _$jscoverage['/picker.js'].lineData[483]++;
      goMonth(self, -1);
      _$jscoverage['/picker.js'].lineData[484]++;
      return true;
    case KeyCode.ENTER:
      _$jscoverage['/picker.js'].lineData[486]++;
      self.fire('select', {
  value: self.get('value')});
      _$jscoverage['/picker.js'].lineData[489]++;
      return true;
  }
  _$jscoverage['/picker.js'].lineData[491]++;
  return undefined;
}}, {
  xclass: 'date-picker', 
  ATTRS: {
  contentTpl: {
  value: PickerTpl}, 
  focusable: {
  value: true}, 
  value: {
  render: 1, 
  sync: 0, 
  valueFn: function() {
  _$jscoverage['/picker.js'].functionData[34]++;
  _$jscoverage['/picker.js'].lineData[514]++;
  var date = new GregorianCalendar();
  _$jscoverage['/picker.js'].lineData[515]++;
  date.setTime(util.now());
  _$jscoverage['/picker.js'].lineData[516]++;
  return date;
}}, 
  previousYearBtn: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[35]++;
  _$jscoverage['/picker.js'].lineData[521]++;
  return '.' + this.getBaseCssClass('prev-year-btn');
}}, 
  nextYearBtn: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[36]++;
  _$jscoverage['/picker.js'].lineData[526]++;
  return '.' + this.getBaseCssClass('next-year-btn');
}}, 
  previousMonthBtn: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[37]++;
  _$jscoverage['/picker.js'].lineData[531]++;
  return '.' + this.getBaseCssClass('prev-month-btn');
}}, 
  monthSelectEl: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[38]++;
  _$jscoverage['/picker.js'].lineData[536]++;
  return '.' + this.getBaseCssClass('month-select');
}}, 
  monthSelectContentEl: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[39]++;
  _$jscoverage['/picker.js'].lineData[541]++;
  return '.' + this.getBaseCssClass('month-select-content');
}}, 
  monthPanel: {
  valueFn: setUpMonthPanel}, 
  nextMonthBtn: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[40]++;
  _$jscoverage['/picker.js'].lineData[549]++;
  return '.' + this.getBaseCssClass('next-month-btn');
}}, 
  clearBtnEl: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[41]++;
  _$jscoverage['/picker.js'].lineData[554]++;
  return '.' + this.getBaseCssClass('clear-btn');
}}, 
  tbodyEl: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[42]++;
  _$jscoverage['/picker.js'].lineData[559]++;
  return '.' + this.getBaseCssClass('tbody');
}}, 
  todayBtnEl: {
  selector: function() {
  _$jscoverage['/picker.js'].functionData[43]++;
  _$jscoverage['/picker.js'].lineData[564]++;
  return '.' + this.getBaseCssClass('today-btn');
}}, 
  dateRender: {}, 
  disabledDate: {}, 
  locale: {
  value: locale}, 
  showToday: {
  render: 1, 
  value: true}, 
  showClear: {
  render: 1, 
  value: true}, 
  clear: {
  render: 1, 
  value: false}, 
  showWeekNumber: {
  render: 1, 
  value: true}}});
});
