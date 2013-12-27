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
if (! _$jscoverage['/loader/combo-loader.js']) {
  _$jscoverage['/loader/combo-loader.js'] = {};
  _$jscoverage['/loader/combo-loader.js'].lineData = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[6] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[8] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[10] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[11] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[15] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[16] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[17] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[21] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[22] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[23] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[26] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[27] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[29] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[30] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[31] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[33] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[36] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[37] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[41] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[42] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[43] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[44] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[45] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[46] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[47] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[48] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[53] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[57] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[58] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[68] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[77] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[78] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[84] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[85] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[86] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[88] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[91] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[92] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[93] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[94] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[95] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[99] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[100] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[103] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[106] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[108] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[109] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[110] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[111] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[117] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[118] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[119] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[120] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[121] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[123] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[125] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[126] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[127] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[130] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[137] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[138] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[139] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[141] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[143] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[144] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[150] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[151] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[157] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[158] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[159] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[160] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[161] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[164] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[165] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[172] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[173] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[174] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[176] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[179] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[181] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[182] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[183] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[184] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[185] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[186] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[187] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[190] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[191] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[197] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[198] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[199] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[200] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[201] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[202] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[203] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[206] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[209] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[214] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[220] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[222] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[224] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[227] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[228] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[229] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[230] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[233] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[234] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[235] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[237] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[241] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[242] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[243] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[246] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[247] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[249] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[256] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[257] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[258] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[259] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[262] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[263] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[266] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[267] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[270] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[271] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[274] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[285] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[293] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[296] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[298] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[299] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[300] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[301] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[303] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[304] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[305] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[306] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[307] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[309] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[310] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[311] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[312] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[313] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[316] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[317] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[319] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[321] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[324] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[327] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[334] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[343] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[344] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[345] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[346] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[347] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[348] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[349] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[350] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[351] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[352] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[353] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[354] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[355] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[357] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[360] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[361] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[362] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[363] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[367] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[368] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[371] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[374] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[377] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[378] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[379] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[380] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[381] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[383] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[384] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[387] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[390] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[397] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[404] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[406] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[408] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[411] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[412] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[413] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[414] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[415] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[416] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[417] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[418] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[420] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[427] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[428] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[429] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[432] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[434] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[441] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[442] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[443] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[444] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[445] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[446] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[451] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[454] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[455] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[456] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[458] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[460] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[461] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[462] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[463] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[464] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[465] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[468] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[469] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[473] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[477] = 0;
}
if (! _$jscoverage['/loader/combo-loader.js'].functionData) {
  _$jscoverage['/loader/combo-loader.js'].functionData = [];
  _$jscoverage['/loader/combo-loader.js'].functionData[0] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[1] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[2] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[3] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[4] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[5] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[6] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[7] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[8] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[9] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[10] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[11] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[12] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[13] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[14] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[15] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[16] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[17] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[18] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[19] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[20] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[21] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[22] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[23] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[24] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[25] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[26] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[27] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[28] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[29] = 0;
}
if (! _$jscoverage['/loader/combo-loader.js'].branchData) {
  _$jscoverage['/loader/combo-loader.js'].branchData = {};
  _$jscoverage['/loader/combo-loader.js'].branchData['8'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['11'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['16'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['27'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['41'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['43'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['45'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['91'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][4] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['93'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['94'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['99'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['108'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['108'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['117'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['117'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['117'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['121'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['137'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['157'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['159'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['164'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['181'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['186'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['190'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['201'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['202'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['229'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['258'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['266'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['293'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['296'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['298'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['300'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['306'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['309'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['310'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['311'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['343'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['357'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['357'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['362'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['377'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['378'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['383'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['383'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['383'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['383'][4] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['418'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['441'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['445'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['458'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['458'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['459'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['468'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['468'][1] = new BranchData();
}
_$jscoverage['/loader/combo-loader.js'].branchData['468'][1].init(2565, 23, 'currentComboUrls.length');
function visit371_468_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['459'][1].init(68, 72, 'l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength');
function visit370_459_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['458'][2].init(764, 36, 'currentComboUrls.length > maxFileNum');
function visit369_458_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['458'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['458'][1].init(764, 142, 'currentComboUrls.length > maxFileNum || (l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)');
function visit368_458_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['445'][1].init(187, 25, '!currentMod.canBeCombined');
function visit367_445_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['441'][1].init(1277, 15, 'i < mods.length');
function visit366_441_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['418'][1].init(226, 15, 'tags.length > 1');
function visit365_418_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['383'][4].init(53, 20, 'mods.tags[0] === tag');
function visit364_383_4(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['383'][4].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['383'][3].init(27, 22, 'mods.tags.length === 1');
function visit363_383_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['383'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['383'][2].init(27, 46, 'mods.tags.length === 1 && mods.tags[0] === tag');
function visit362_383_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['383'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['383'][1].init(25, 49, '!(mods.tags.length === 1 && mods.tags[0] === tag)');
function visit361_383_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['378'][1].init(1748, 32, '!(mods = typedCombos[comboName])');
function visit360_378_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['377'][1].init(1705, 21, 'comboMods[type] || {}');
function visit359_377_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['362'][1].init(29, 41, 'groupPrefixUri.isSameOriginAs(packageUri)');
function visit358_362_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['357'][2].init(714, 81, 'packageInfo.isCombine() && S.startsWith(modPath, packagePath)');
function visit357_357_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['357'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['357'][1].init(694, 111, '(mod.canBeCombined = packageInfo.isCombine() && S.startsWith(modPath, packagePath)) && group');
function visit356_357_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['343'][1].init(364, 5, 'i < l');
function visit355_343_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['311'][1].init(29, 21, 'modStatus !== LOADING');
function visit354_311_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['310'][1].init(25, 27, '!waitingModules.contains(m)');
function visit353_310_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['309'][1].init(362, 20, 'modStatus !== LOADED');
function visit352_309_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['306'][1].init(262, 28, 'modStatus >= READY_TO_ATTACH');
function visit351_306_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['300'][1].init(54, 8, 'cache[m]');
function visit350_300_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['298'][1].init(369, 19, 'i < modNames.length');
function visit349_298_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['296'][1].init(331, 11, 'cache || {}');
function visit348_296_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['293'][1].init(229, 9, 'ret || {}');
function visit347_293_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['266'][1].init(150, 12, '!mod.factory');
function visit346_266_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['258'][1].init(25, 9, '\'@DEBUG@\'');
function visit345_258_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['229'][1].init(25, 9, '\'@DEBUG@\'');
function visit344_229_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['202'][1].init(17, 19, 'str1[i] !== str2[i]');
function visit343_202_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['201'][1].init(143, 5, 'i < l');
function visit342_201_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['190'][1].init(227, 9, 'ms.length');
function visit341_190_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['186'][1].init(25, 19, 'm.status === LOADED');
function visit340_186_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['181'][1].init(5877, 9, '\'@DEBUG@\'');
function visit339_181_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['164'][1].init(373, 2, 're');
function visit338_164_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['159'][1].init(50, 35, 'script.readyState === \'interactive\'');
function visit337_159_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['157'][1].init(182, 6, 'i >= 0');
function visit336_157_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['137'][1].init(74, 5, 'oldIE');
function visit335_137_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['121'][1].init(132, 5, 'oldIE');
function visit334_121_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['117'][3].init(391, 13, 'argsLen === 1');
function visit333_117_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['117'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['117'][2].init(361, 26, 'typeof name === \'function\'');
function visit332_117_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['117'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['117'][1].init(361, 43, 'typeof name === \'function\' || argsLen === 1');
function visit331_117_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['108'][2].init(57, 13, 'argsLen === 3');
function visit330_108_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['108'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['108'][1].init(57, 35, 'argsLen === 3 && S.isArray(factory)');
function visit329_108_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['99'][2].init(80, 30, 'config.requires && !config.cjs');
function visit328_99_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['99'][1].init(70, 40, 'config && config.requires && !config.cjs');
function visit327_99_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['94'][1].init(26, 12, 'config || {}');
function visit326_94_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['93'][1].init(78, 15, 'requires.length');
function visit325_93_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['91'][4].init(148, 18, 'factory.length > 1');
function visit324_91_4(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][4].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['91'][3].init(115, 29, 'typeof factory === \'function\'');
function visit323_91_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['91'][2].init(115, 51, 'typeof factory === \'function\' && factory.length > 1');
function visit322_91_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['91'][1].init(104, 62, '!config && typeof factory === \'function\' && factory.length > 1');
function visit321_91_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['45'][1].init(147, 5, 'oldIE');
function visit320_45_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['43'][1].init(55, 23, 'mod.getType() === \'css\'');
function visit319_43_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['41'][1].init(816, 11, '!rs.combine');
function visit318_41_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['27'][1].init(67, 17, 'mod && currentMod');
function visit317_27_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['16'][1].init(17, 10, '!(--count)');
function visit316_16_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['11'][1].init(21, 17, 'rss && rss.length');
function visit315_11_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['8'][1].init(43, 16, 'S.UA.ieMode < 10');
function visit314_8_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/combo-loader.js'].functionData[0]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[8]++;
  var oldIE = visit314_8_1(S.UA.ieMode < 10);
  _$jscoverage['/loader/combo-loader.js'].lineData[10]++;
  function loadScripts(runtime, rss, callback, charset, timeout) {
    _$jscoverage['/loader/combo-loader.js'].functionData[1]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[11]++;
    var count = visit315_11_1(rss && rss.length), errorList = [], successList = [];
    _$jscoverage['/loader/combo-loader.js'].lineData[15]++;
    function complete() {
      _$jscoverage['/loader/combo-loader.js'].functionData[2]++;
      _$jscoverage['/loader/combo-loader.js'].lineData[16]++;
      if (visit316_16_1(!(--count))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[17]++;
        callback(successList, errorList);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[21]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[3]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[22]++;
  var mod;
  _$jscoverage['/loader/combo-loader.js'].lineData[23]++;
  var config = {
  timeout: timeout, 
  success: function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[4]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[26]++;
  successList.push(rs);
  _$jscoverage['/loader/combo-loader.js'].lineData[27]++;
  if (visit317_27_1(mod && currentMod)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[29]++;
    logger.debug('standard browser get mod name after load : ' + mod.name);
    _$jscoverage['/loader/combo-loader.js'].lineData[30]++;
    Utils.registerModule(runtime, mod.name, currentMod.factory, currentMod.config);
    _$jscoverage['/loader/combo-loader.js'].lineData[31]++;
    currentMod = undefined;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[33]++;
  complete();
}, 
  error: function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[5]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[36]++;
  errorList.push(rs);
  _$jscoverage['/loader/combo-loader.js'].lineData[37]++;
  complete();
}, 
  charset: charset};
  _$jscoverage['/loader/combo-loader.js'].lineData[41]++;
  if (visit318_41_1(!rs.combine)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[42]++;
    mod = rs.mods[0];
    _$jscoverage['/loader/combo-loader.js'].lineData[43]++;
    if (visit319_43_1(mod.getType() === 'css')) {
      _$jscoverage['/loader/combo-loader.js'].lineData[44]++;
      mod = undefined;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[45]++;
      if (visit320_45_1(oldIE)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[46]++;
        startLoadModName = mod.name;
        _$jscoverage['/loader/combo-loader.js'].lineData[47]++;
        startLoadModTime = S.now();
        _$jscoverage['/loader/combo-loader.js'].lineData[48]++;
        config.attrs = {
  'data-mod-name': mod.name};
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[53]++;
  S.Config.loadModsFn(rs, config);
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[57]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/loader/combo-loader.js'].lineData[58]++;
  var Loader = S.Loader, Status = Loader.Status, Utils = Loader.Utils, getHash = Utils.getHash, LOADING = Status.LOADING, LOADED = Status.LOADED, READY_TO_ATTACH = Status.READY_TO_ATTACH, ERROR = Status.ERROR, groupTag = S.now();
  _$jscoverage['/loader/combo-loader.js'].lineData[68]++;
  ComboLoader.groupTag = groupTag;
  _$jscoverage['/loader/combo-loader.js'].lineData[77]++;
  function ComboLoader(runtime, waitingModules) {
    _$jscoverage['/loader/combo-loader.js'].functionData[6]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[78]++;
    S.mix(this, {
  runtime: runtime, 
  waitingModules: waitingModules});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[84]++;
  var currentMod;
  _$jscoverage['/loader/combo-loader.js'].lineData[85]++;
  var startLoadModName;
  _$jscoverage['/loader/combo-loader.js'].lineData[86]++;
  var startLoadModTime;
  _$jscoverage['/loader/combo-loader.js'].lineData[88]++;
  function checkKISSYRequire(config, factory) {
    _$jscoverage['/loader/combo-loader.js'].functionData[7]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[91]++;
    if (visit321_91_1(!config && visit322_91_2(visit323_91_3(typeof factory === 'function') && visit324_91_4(factory.length > 1)))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[92]++;
      var requires = Utils.getRequiresFromFn(factory);
      _$jscoverage['/loader/combo-loader.js'].lineData[93]++;
      if (visit325_93_1(requires.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[94]++;
        config = visit326_94_1(config || {});
        _$jscoverage['/loader/combo-loader.js'].lineData[95]++;
        config.requires = requires;
      }
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[99]++;
      if (visit327_99_1(config && visit328_99_2(config.requires && !config.cjs))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[100]++;
        config.cjs = 0;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[103]++;
    return config;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[106]++;
  ComboLoader.add = function(name, factory, config, runtime, argsLen) {
  _$jscoverage['/loader/combo-loader.js'].functionData[8]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[108]++;
  if (visit329_108_1(visit330_108_2(argsLen === 3) && S.isArray(factory))) {
    _$jscoverage['/loader/combo-loader.js'].lineData[109]++;
    var tmp = factory;
    _$jscoverage['/loader/combo-loader.js'].lineData[110]++;
    factory = config;
    _$jscoverage['/loader/combo-loader.js'].lineData[111]++;
    config = {
  requires: tmp, 
  cjs: 1};
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[117]++;
  if (visit331_117_1(visit332_117_2(typeof name === 'function') || visit333_117_3(argsLen === 1))) {
    _$jscoverage['/loader/combo-loader.js'].lineData[118]++;
    config = factory;
    _$jscoverage['/loader/combo-loader.js'].lineData[119]++;
    factory = name;
    _$jscoverage['/loader/combo-loader.js'].lineData[120]++;
    config = checkKISSYRequire(config, factory);
    _$jscoverage['/loader/combo-loader.js'].lineData[121]++;
    if (visit334_121_1(oldIE)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[123]++;
      name = findModuleNameByInteractive();
      _$jscoverage['/loader/combo-loader.js'].lineData[125]++;
      Utils.registerModule(runtime, name, factory, config);
      _$jscoverage['/loader/combo-loader.js'].lineData[126]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[127]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[130]++;
      currentMod = {
  factory: factory, 
  config: config};
    }
  } else {
    _$jscoverage['/loader/combo-loader.js'].lineData[137]++;
    if (visit335_137_1(oldIE)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[138]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[139]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[141]++;
      currentMod = undefined;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[143]++;
    config = checkKISSYRequire(config, factory);
    _$jscoverage['/loader/combo-loader.js'].lineData[144]++;
    Utils.registerModule(runtime, name, factory, config);
  }
};
  _$jscoverage['/loader/combo-loader.js'].lineData[150]++;
  function findModuleNameByInteractive() {
    _$jscoverage['/loader/combo-loader.js'].functionData[9]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[151]++;
    var scripts = S.Env.host.document.getElementsByTagName('script'), re, i, name, script;
    _$jscoverage['/loader/combo-loader.js'].lineData[157]++;
    for (i = scripts.length - 1; visit336_157_1(i >= 0); i--) {
      _$jscoverage['/loader/combo-loader.js'].lineData[158]++;
      script = scripts[i];
      _$jscoverage['/loader/combo-loader.js'].lineData[159]++;
      if (visit337_159_1(script.readyState === 'interactive')) {
        _$jscoverage['/loader/combo-loader.js'].lineData[160]++;
        re = script;
        _$jscoverage['/loader/combo-loader.js'].lineData[161]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[164]++;
    if (visit338_164_1(re)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[165]++;
      name = re.getAttribute('data-mod-name');
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[172]++;
      logger.debug('can not find interactive script,time diff : ' + (S.now() - startLoadModTime));
      _$jscoverage['/loader/combo-loader.js'].lineData[173]++;
      logger.debug('old_ie get mod name from cache : ' + startLoadModName);
      _$jscoverage['/loader/combo-loader.js'].lineData[174]++;
      name = startLoadModName;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[176]++;
    return name;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[179]++;
  var debugRemoteModules;
  _$jscoverage['/loader/combo-loader.js'].lineData[181]++;
  if (visit339_181_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[182]++;
    debugRemoteModules = function(rss) {
  _$jscoverage['/loader/combo-loader.js'].functionData[10]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[183]++;
  S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[11]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[184]++;
  var ms = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[185]++;
  S.each(rs.mods, function(m) {
  _$jscoverage['/loader/combo-loader.js'].functionData[12]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[186]++;
  if (visit340_186_1(m.status === LOADED)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[187]++;
    ms.push(m.name);
  }
});
  _$jscoverage['/loader/combo-loader.js'].lineData[190]++;
  if (visit341_190_1(ms.length)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[191]++;
    logger.info('load remote modules: "' + ms.join(', ') + '" from: "' + rs.modPath + '"');
  }
});
};
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[197]++;
  function getCommonPrefix(str1, str2) {
    _$jscoverage['/loader/combo-loader.js'].functionData[13]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[198]++;
    str1 = str1.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[199]++;
    str2 = str2.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[200]++;
    var l = Math.min(str1.length, str2.length);
    _$jscoverage['/loader/combo-loader.js'].lineData[201]++;
    for (var i = 0; visit342_201_1(i < l); i++) {
      _$jscoverage['/loader/combo-loader.js'].lineData[202]++;
      if (visit343_202_1(str1[i] !== str2[i])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[203]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[206]++;
    return str1.slice(0, i).join('/') + '/';
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[209]++;
  S.augment(ComboLoader, {
  use: function(normalizedModNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[14]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[214]++;
  var self = this, allModNames, comboUrls, timeout = S.Config.timeout, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[220]++;
  allModNames = S.keys(self.calculate(normalizedModNames));
  _$jscoverage['/loader/combo-loader.js'].lineData[222]++;
  Utils.createModulesInfo(runtime, allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[224]++;
  comboUrls = self.getComboUrls(allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[227]++;
  S.each(comboUrls.css, function(cssOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[15]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[228]++;
  loadScripts(runtime, cssOne, function(success, error) {
  _$jscoverage['/loader/combo-loader.js'].functionData[16]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[229]++;
  if (visit344_229_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[230]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[233]++;
  S.each(success, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[17]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[234]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[18]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[235]++;
  Utils.registerModule(runtime, mod.name, S.noop);
  _$jscoverage['/loader/combo-loader.js'].lineData[237]++;
  mod.notifyAll();
});
});
  _$jscoverage['/loader/combo-loader.js'].lineData[241]++;
  S.each(error, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[19]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[242]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[20]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[243]++;
  var msg = mod.name + ' is not loaded! can not find module in path : ' + one.path;
  _$jscoverage['/loader/combo-loader.js'].lineData[246]++;
  S.log(msg, 'error');
  _$jscoverage['/loader/combo-loader.js'].lineData[247]++;
  mod.status = ERROR;
  _$jscoverage['/loader/combo-loader.js'].lineData[249]++;
  mod.notifyAll();
});
});
}, cssOne.charset, timeout);
});
  _$jscoverage['/loader/combo-loader.js'].lineData[256]++;
  S.each(comboUrls.js, function(jsOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[21]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[257]++;
  loadScripts(runtime, jsOne, function(success) {
  _$jscoverage['/loader/combo-loader.js'].functionData[22]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[258]++;
  if (visit345_258_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[259]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[262]++;
  S.each(jsOne, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[23]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[263]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[24]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[266]++;
  if (visit346_266_1(!mod.factory)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[267]++;
    var msg = mod.name + ' is not loaded! can not find module in path : ' + one.path;
    _$jscoverage['/loader/combo-loader.js'].lineData[270]++;
    S.log(msg, 'error');
    _$jscoverage['/loader/combo-loader.js'].lineData[271]++;
    mod.status = ERROR;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[274]++;
  mod.notifyAll();
});
});
}, jsOne.charset, timeout);
});
}, 
  calculate: function(modNames, cache, ret) {
  _$jscoverage['/loader/combo-loader.js'].functionData[25]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[285]++;
  var i, m, mod, modStatus, self = this, waitingModules = self.waitingModules, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[293]++;
  ret = visit347_293_1(ret || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[296]++;
  cache = visit348_296_1(cache || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[298]++;
  for (i = 0; visit349_298_1(i < modNames.length); i++) {
    _$jscoverage['/loader/combo-loader.js'].lineData[299]++;
    m = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[300]++;
    if (visit350_300_1(cache[m])) {
      _$jscoverage['/loader/combo-loader.js'].lineData[301]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[303]++;
    cache[m] = 1;
    _$jscoverage['/loader/combo-loader.js'].lineData[304]++;
    mod = Utils.createModuleInfo(runtime, m);
    _$jscoverage['/loader/combo-loader.js'].lineData[305]++;
    modStatus = mod.status;
    _$jscoverage['/loader/combo-loader.js'].lineData[306]++;
    if (visit351_306_1(modStatus >= READY_TO_ATTACH)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[307]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[309]++;
    if (visit352_309_1(modStatus !== LOADED)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[310]++;
      if (visit353_310_1(!waitingModules.contains(m))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[311]++;
        if (visit354_311_1(modStatus !== LOADING)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[312]++;
          mod.status = LOADING;
          _$jscoverage['/loader/combo-loader.js'].lineData[313]++;
          ret[m] = 1;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[316]++;
        mod.wait(function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[26]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[317]++;
  waitingModules.remove(mod.name);
  _$jscoverage['/loader/combo-loader.js'].lineData[319]++;
  waitingModules.notifyAll();
});
        _$jscoverage['/loader/combo-loader.js'].lineData[321]++;
        waitingModules.add(m);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[324]++;
    self.calculate(mod.getNormalizedRequires(), cache, ret);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[327]++;
  return ret;
}, 
  getComboMods: function(modNames, comboPrefixes) {
  _$jscoverage['/loader/combo-loader.js'].functionData[27]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[334]++;
  var comboMods = {}, packageUri, runtime = this.runtime, i = 0, l = modNames.length, modName, mod, packageInfo, type, typedCombos, mods, tag, charset, packagePath, groupPrefixUri, comboName, packageName, group, modPath;
  _$jscoverage['/loader/combo-loader.js'].lineData[343]++;
  for (; visit355_343_1(i < l); ++i) {
    _$jscoverage['/loader/combo-loader.js'].lineData[344]++;
    modName = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[345]++;
    mod = Utils.createModuleInfo(runtime, modName);
    _$jscoverage['/loader/combo-loader.js'].lineData[346]++;
    type = mod.getType();
    _$jscoverage['/loader/combo-loader.js'].lineData[347]++;
    modPath = mod.getPath();
    _$jscoverage['/loader/combo-loader.js'].lineData[348]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/loader/combo-loader.js'].lineData[349]++;
    packageName = packageInfo.name;
    _$jscoverage['/loader/combo-loader.js'].lineData[350]++;
    charset = packageInfo.getCharset();
    _$jscoverage['/loader/combo-loader.js'].lineData[351]++;
    tag = packageInfo.getTag();
    _$jscoverage['/loader/combo-loader.js'].lineData[352]++;
    group = packageInfo.getGroup();
    _$jscoverage['/loader/combo-loader.js'].lineData[353]++;
    packagePath = packageInfo.getPath();
    _$jscoverage['/loader/combo-loader.js'].lineData[354]++;
    packageUri = packageInfo.getUri();
    _$jscoverage['/loader/combo-loader.js'].lineData[355]++;
    comboName = packageName;
    _$jscoverage['/loader/combo-loader.js'].lineData[357]++;
    if (visit356_357_1((mod.canBeCombined = visit357_357_2(packageInfo.isCombine() && S.startsWith(modPath, packagePath))) && group)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[360]++;
      comboName = group + '_' + charset + '_' + groupTag;
      _$jscoverage['/loader/combo-loader.js'].lineData[361]++;
      if ((groupPrefixUri = comboPrefixes[comboName])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[362]++;
        if (visit358_362_1(groupPrefixUri.isSameOriginAs(packageUri))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[363]++;
          groupPrefixUri.setPath(getCommonPrefix(groupPrefixUri.getPath(), packageUri.getPath()));
        } else {
          _$jscoverage['/loader/combo-loader.js'].lineData[367]++;
          comboName = packageName;
          _$jscoverage['/loader/combo-loader.js'].lineData[368]++;
          comboPrefixes[packageName] = packageUri;
        }
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[371]++;
        comboPrefixes[comboName] = packageUri.clone();
      }
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[374]++;
      comboPrefixes[packageName] = packageUri;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[377]++;
    typedCombos = comboMods[type] = visit359_377_1(comboMods[type] || {});
    _$jscoverage['/loader/combo-loader.js'].lineData[378]++;
    if (visit360_378_1(!(mods = typedCombos[comboName]))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[379]++;
      mods = typedCombos[comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[380]++;
      mods.charset = charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[381]++;
      mods.tags = [tag];
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[383]++;
      if (visit361_383_1(!(visit362_383_2(visit363_383_3(mods.tags.length === 1) && visit364_383_4(mods.tags[0] === tag))))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[384]++;
        mods.tags.push(tag);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[387]++;
    mods.push(mod);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[390]++;
  return comboMods;
}, 
  getComboUrls: function(modNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[28]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[397]++;
  var runtime = this.runtime, Config = runtime.Config, comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/loader/combo-loader.js'].lineData[404]++;
  var comboPrefixes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[406]++;
  var comboMods = this.getComboMods(modNames, comboPrefixes);
  _$jscoverage['/loader/combo-loader.js'].lineData[408]++;
  var comboRes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[411]++;
  for (var type in comboMods) {
    _$jscoverage['/loader/combo-loader.js'].lineData[412]++;
    comboRes[type] = {};
    _$jscoverage['/loader/combo-loader.js'].lineData[413]++;
    for (var comboName in comboMods[type]) {
      _$jscoverage['/loader/combo-loader.js'].lineData[414]++;
      var currentComboUrls = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[415]++;
      var currentComboMods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[416]++;
      var mods = comboMods[type][comboName];
      _$jscoverage['/loader/combo-loader.js'].lineData[417]++;
      var tags = mods.tags;
      _$jscoverage['/loader/combo-loader.js'].lineData[418]++;
      var tag = visit365_418_1(tags.length > 1) ? getHash(tags.join('')) : tags[0];
      _$jscoverage['/loader/combo-loader.js'].lineData[420]++;
      var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''), suffixLength = suffix.length, basePrefix = comboPrefixes[comboName].toString(), baseLen = basePrefix.length, prefix = basePrefix + comboPrefix, res = comboRes[type][comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[427]++;
      var l = prefix.length;
      _$jscoverage['/loader/combo-loader.js'].lineData[428]++;
      res.charset = mods.charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[429]++;
      res.mods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[432]++;
      var pushComboUrl = function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[29]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[434]++;
  res.push({
  combine: 1, 
  path: prefix + currentComboUrls.join(comboSep) + suffix, 
  mods: currentComboMods});
};
      _$jscoverage['/loader/combo-loader.js'].lineData[441]++;
      for (var i = 0; visit366_441_1(i < mods.length); i++) {
        _$jscoverage['/loader/combo-loader.js'].lineData[442]++;
        var currentMod = mods[i];
        _$jscoverage['/loader/combo-loader.js'].lineData[443]++;
        res.mods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[444]++;
        var path = currentMod.getPath();
        _$jscoverage['/loader/combo-loader.js'].lineData[445]++;
        if (visit367_445_1(!currentMod.canBeCombined)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[446]++;
          res.push({
  combine: 0, 
  path: path, 
  mods: [currentMod]});
          _$jscoverage['/loader/combo-loader.js'].lineData[451]++;
          continue;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[454]++;
        var subPath = path.slice(baseLen).replace(/\?.*$/, '');
        _$jscoverage['/loader/combo-loader.js'].lineData[455]++;
        currentComboUrls.push(subPath);
        _$jscoverage['/loader/combo-loader.js'].lineData[456]++;
        currentComboMods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[458]++;
        if (visit368_458_1(visit369_458_2(currentComboUrls.length > maxFileNum) || (visit370_459_1(l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[460]++;
          currentComboUrls.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[461]++;
          currentComboMods.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[462]++;
          pushComboUrl();
          _$jscoverage['/loader/combo-loader.js'].lineData[463]++;
          currentComboUrls = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[464]++;
          currentComboMods = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[465]++;
          i--;
        }
      }
      _$jscoverage['/loader/combo-loader.js'].lineData[468]++;
      if (visit371_468_1(currentComboUrls.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[469]++;
        pushComboUrl();
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[473]++;
  return comboRes;
}});
  _$jscoverage['/loader/combo-loader.js'].lineData[477]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
