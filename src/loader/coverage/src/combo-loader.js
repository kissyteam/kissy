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
  _$jscoverage['/combo-loader.js'].lineData[9] = 0;
  _$jscoverage['/combo-loader.js'].lineData[21] = 0;
  _$jscoverage['/combo-loader.js'].lineData[22] = 0;
  _$jscoverage['/combo-loader.js'].lineData[26] = 0;
  _$jscoverage['/combo-loader.js'].lineData[27] = 0;
  _$jscoverage['/combo-loader.js'].lineData[28] = 0;
  _$jscoverage['/combo-loader.js'].lineData[32] = 0;
  _$jscoverage['/combo-loader.js'].lineData[33] = 0;
  _$jscoverage['/combo-loader.js'].lineData[34] = 0;
  _$jscoverage['/combo-loader.js'].lineData[37] = 0;
  _$jscoverage['/combo-loader.js'].lineData[38] = 0;
  _$jscoverage['/combo-loader.js'].lineData[40] = 0;
  _$jscoverage['/combo-loader.js'].lineData[41] = 0;
  _$jscoverage['/combo-loader.js'].lineData[42] = 0;
  _$jscoverage['/combo-loader.js'].lineData[44] = 0;
  _$jscoverage['/combo-loader.js'].lineData[47] = 0;
  _$jscoverage['/combo-loader.js'].lineData[48] = 0;
  _$jscoverage['/combo-loader.js'].lineData[52] = 0;
  _$jscoverage['/combo-loader.js'].lineData[53] = 0;
  _$jscoverage['/combo-loader.js'].lineData[54] = 0;
  _$jscoverage['/combo-loader.js'].lineData[55] = 0;
  _$jscoverage['/combo-loader.js'].lineData[56] = 0;
  _$jscoverage['/combo-loader.js'].lineData[57] = 0;
  _$jscoverage['/combo-loader.js'].lineData[58] = 0;
  _$jscoverage['/combo-loader.js'].lineData[59] = 0;
  _$jscoverage['/combo-loader.js'].lineData[61] = 0;
  _$jscoverage['/combo-loader.js'].lineData[66] = 0;
  _$jscoverage['/combo-loader.js'].lineData[70] = 0;
  _$jscoverage['/combo-loader.js'].lineData[78] = 0;
  _$jscoverage['/combo-loader.js'].lineData[79] = 0;
  _$jscoverage['/combo-loader.js'].lineData[80] = 0;
  _$jscoverage['/combo-loader.js'].lineData[81] = 0;
  _$jscoverage['/combo-loader.js'].lineData[84] = 0;
  _$jscoverage['/combo-loader.js'].lineData[85] = 0;
  _$jscoverage['/combo-loader.js'].lineData[86] = 0;
  _$jscoverage['/combo-loader.js'].lineData[88] = 0;
  _$jscoverage['/combo-loader.js'].lineData[91] = 0;
  _$jscoverage['/combo-loader.js'].lineData[92] = 0;
  _$jscoverage['/combo-loader.js'].lineData[93] = 0;
  _$jscoverage['/combo-loader.js'].lineData[94] = 0;
  _$jscoverage['/combo-loader.js'].lineData[95] = 0;
  _$jscoverage['/combo-loader.js'].lineData[99] = 0;
  _$jscoverage['/combo-loader.js'].lineData[100] = 0;
  _$jscoverage['/combo-loader.js'].lineData[103] = 0;
  _$jscoverage['/combo-loader.js'].lineData[106] = 0;
  _$jscoverage['/combo-loader.js'].lineData[108] = 0;
  _$jscoverage['/combo-loader.js'].lineData[109] = 0;
  _$jscoverage['/combo-loader.js'].lineData[110] = 0;
  _$jscoverage['/combo-loader.js'].lineData[111] = 0;
  _$jscoverage['/combo-loader.js'].lineData[117] = 0;
  _$jscoverage['/combo-loader.js'].lineData[118] = 0;
  _$jscoverage['/combo-loader.js'].lineData[119] = 0;
  _$jscoverage['/combo-loader.js'].lineData[120] = 0;
  _$jscoverage['/combo-loader.js'].lineData[121] = 0;
  _$jscoverage['/combo-loader.js'].lineData[123] = 0;
  _$jscoverage['/combo-loader.js'].lineData[125] = 0;
  _$jscoverage['/combo-loader.js'].lineData[126] = 0;
  _$jscoverage['/combo-loader.js'].lineData[127] = 0;
  _$jscoverage['/combo-loader.js'].lineData[130] = 0;
  _$jscoverage['/combo-loader.js'].lineData[137] = 0;
  _$jscoverage['/combo-loader.js'].lineData[138] = 0;
  _$jscoverage['/combo-loader.js'].lineData[139] = 0;
  _$jscoverage['/combo-loader.js'].lineData[141] = 0;
  _$jscoverage['/combo-loader.js'].lineData[143] = 0;
  _$jscoverage['/combo-loader.js'].lineData[144] = 0;
  _$jscoverage['/combo-loader.js'].lineData[148] = 0;
  _$jscoverage['/combo-loader.js'].lineData[149] = 0;
  _$jscoverage['/combo-loader.js'].lineData[152] = 0;
  _$jscoverage['/combo-loader.js'].lineData[153] = 0;
  _$jscoverage['/combo-loader.js'].lineData[154] = 0;
  _$jscoverage['/combo-loader.js'].lineData[155] = 0;
  _$jscoverage['/combo-loader.js'].lineData[156] = 0;
  _$jscoverage['/combo-loader.js'].lineData[160] = 0;
  _$jscoverage['/combo-loader.js'].lineData[161] = 0;
  _$jscoverage['/combo-loader.js'].lineData[168] = 0;
  _$jscoverage['/combo-loader.js'].lineData[169] = 0;
  _$jscoverage['/combo-loader.js'].lineData[170] = 0;
  _$jscoverage['/combo-loader.js'].lineData[172] = 0;
  _$jscoverage['/combo-loader.js'].lineData[175] = 0;
  _$jscoverage['/combo-loader.js'].lineData[177] = 0;
  _$jscoverage['/combo-loader.js'].lineData[178] = 0;
  _$jscoverage['/combo-loader.js'].lineData[179] = 0;
  _$jscoverage['/combo-loader.js'].lineData[180] = 0;
  _$jscoverage['/combo-loader.js'].lineData[181] = 0;
  _$jscoverage['/combo-loader.js'].lineData[182] = 0;
  _$jscoverage['/combo-loader.js'].lineData[183] = 0;
  _$jscoverage['/combo-loader.js'].lineData[186] = 0;
  _$jscoverage['/combo-loader.js'].lineData[187] = 0;
  _$jscoverage['/combo-loader.js'].lineData[193] = 0;
  _$jscoverage['/combo-loader.js'].lineData[196] = 0;
  _$jscoverage['/combo-loader.js'].lineData[197] = 0;
  _$jscoverage['/combo-loader.js'].lineData[198] = 0;
  _$jscoverage['/combo-loader.js'].lineData[199] = 0;
  _$jscoverage['/combo-loader.js'].lineData[201] = 0;
  _$jscoverage['/combo-loader.js'].lineData[202] = 0;
  _$jscoverage['/combo-loader.js'].lineData[203] = 0;
  _$jscoverage['/combo-loader.js'].lineData[204] = 0;
  _$jscoverage['/combo-loader.js'].lineData[205] = 0;
  _$jscoverage['/combo-loader.js'].lineData[206] = 0;
  _$jscoverage['/combo-loader.js'].lineData[209] = 0;
  _$jscoverage['/combo-loader.js'].lineData[215] = 0;
  _$jscoverage['/combo-loader.js'].lineData[216] = 0;
  _$jscoverage['/combo-loader.js'].lineData[217] = 0;
  _$jscoverage['/combo-loader.js'].lineData[218] = 0;
  _$jscoverage['/combo-loader.js'].lineData[219] = 0;
  _$jscoverage['/combo-loader.js'].lineData[220] = 0;
  _$jscoverage['/combo-loader.js'].lineData[222] = 0;
  _$jscoverage['/combo-loader.js'].lineData[224] = 0;
  _$jscoverage['/combo-loader.js'].lineData[228] = 0;
  _$jscoverage['/combo-loader.js'].lineData[233] = 0;
  _$jscoverage['/combo-loader.js'].lineData[237] = 0;
  _$jscoverage['/combo-loader.js'].lineData[240] = 0;
  _$jscoverage['/combo-loader.js'].lineData[241] = 0;
  _$jscoverage['/combo-loader.js'].lineData[242] = 0;
  _$jscoverage['/combo-loader.js'].lineData[243] = 0;
  _$jscoverage['/combo-loader.js'].lineData[246] = 0;
  _$jscoverage['/combo-loader.js'].lineData[247] = 0;
  _$jscoverage['/combo-loader.js'].lineData[248] = 0;
  _$jscoverage['/combo-loader.js'].lineData[250] = 0;
  _$jscoverage['/combo-loader.js'].lineData[254] = 0;
  _$jscoverage['/combo-loader.js'].lineData[255] = 0;
  _$jscoverage['/combo-loader.js'].lineData[256] = 0;
  _$jscoverage['/combo-loader.js'].lineData[257] = 0;
  _$jscoverage['/combo-loader.js'].lineData[258] = 0;
  _$jscoverage['/combo-loader.js'].lineData[260] = 0;
  _$jscoverage['/combo-loader.js'].lineData[267] = 0;
  _$jscoverage['/combo-loader.js'].lineData[268] = 0;
  _$jscoverage['/combo-loader.js'].lineData[269] = 0;
  _$jscoverage['/combo-loader.js'].lineData[270] = 0;
  _$jscoverage['/combo-loader.js'].lineData[273] = 0;
  _$jscoverage['/combo-loader.js'].lineData[274] = 0;
  _$jscoverage['/combo-loader.js'].lineData[277] = 0;
  _$jscoverage['/combo-loader.js'].lineData[278] = 0;
  _$jscoverage['/combo-loader.js'].lineData[281] = 0;
  _$jscoverage['/combo-loader.js'].lineData[282] = 0;
  _$jscoverage['/combo-loader.js'].lineData[285] = 0;
  _$jscoverage['/combo-loader.js'].lineData[296] = 0;
  _$jscoverage['/combo-loader.js'].lineData[300] = 0;
  _$jscoverage['/combo-loader.js'].lineData[301] = 0;
  _$jscoverage['/combo-loader.js'].lineData[303] = 0;
  _$jscoverage['/combo-loader.js'].lineData[306] = 0;
  _$jscoverage['/combo-loader.js'].lineData[308] = 0;
  _$jscoverage['/combo-loader.js'].lineData[309] = 0;
  _$jscoverage['/combo-loader.js'].lineData[310] = 0;
  _$jscoverage['/combo-loader.js'].lineData[312] = 0;
  _$jscoverage['/combo-loader.js'].lineData[313] = 0;
  _$jscoverage['/combo-loader.js'].lineData[314] = 0;
  _$jscoverage['/combo-loader.js'].lineData[315] = 0;
  _$jscoverage['/combo-loader.js'].lineData[316] = 0;
  _$jscoverage['/combo-loader.js'].lineData[317] = 0;
  _$jscoverage['/combo-loader.js'].lineData[318] = 0;
  _$jscoverage['/combo-loader.js'].lineData[320] = 0;
  _$jscoverage['/combo-loader.js'].lineData[321] = 0;
  _$jscoverage['/combo-loader.js'].lineData[322] = 0;
  _$jscoverage['/combo-loader.js'].lineData[323] = 0;
  _$jscoverage['/combo-loader.js'].lineData[324] = 0;
  _$jscoverage['/combo-loader.js'].lineData[325] = 0;
  _$jscoverage['/combo-loader.js'].lineData[326] = 0;
  _$jscoverage['/combo-loader.js'].lineData[328] = 0;
  _$jscoverage['/combo-loader.js'].lineData[329] = 0;
  _$jscoverage['/combo-loader.js'].lineData[332] = 0;
  _$jscoverage['/combo-loader.js'].lineData[333] = 0;
  _$jscoverage['/combo-loader.js'].lineData[334] = 0;
  _$jscoverage['/combo-loader.js'].lineData[335] = 0;
  _$jscoverage['/combo-loader.js'].lineData[336] = 0;
  _$jscoverage['/combo-loader.js'].lineData[338] = 0;
  _$jscoverage['/combo-loader.js'].lineData[342] = 0;
  _$jscoverage['/combo-loader.js'].lineData[343] = 0;
  _$jscoverage['/combo-loader.js'].lineData[344] = 0;
  _$jscoverage['/combo-loader.js'].lineData[345] = 0;
  _$jscoverage['/combo-loader.js'].lineData[349] = 0;
  _$jscoverage['/combo-loader.js'].lineData[356] = 0;
  _$jscoverage['/combo-loader.js'].lineData[360] = 0;
  _$jscoverage['/combo-loader.js'].lineData[369] = 0;
  _$jscoverage['/combo-loader.js'].lineData[376] = 0;
  _$jscoverage['/combo-loader.js'].lineData[377] = 0;
  _$jscoverage['/combo-loader.js'].lineData[378] = 0;
  _$jscoverage['/combo-loader.js'].lineData[379] = 0;
  _$jscoverage['/combo-loader.js'].lineData[380] = 0;
  _$jscoverage['/combo-loader.js'].lineData[381] = 0;
  _$jscoverage['/combo-loader.js'].lineData[382] = 0;
  _$jscoverage['/combo-loader.js'].lineData[383] = 0;
  _$jscoverage['/combo-loader.js'].lineData[384] = 0;
  _$jscoverage['/combo-loader.js'].lineData[385] = 0;
  _$jscoverage['/combo-loader.js'].lineData[387] = 0;
  _$jscoverage['/combo-loader.js'].lineData[388] = 0;
  _$jscoverage['/combo-loader.js'].lineData[389] = 0;
  _$jscoverage['/combo-loader.js'].lineData[390] = 0;
  _$jscoverage['/combo-loader.js'].lineData[391] = 0;
  _$jscoverage['/combo-loader.js'].lineData[393] = 0;
  _$jscoverage['/combo-loader.js'].lineData[394] = 0;
  _$jscoverage['/combo-loader.js'].lineData[395] = 0;
  _$jscoverage['/combo-loader.js'].lineData[396] = 0;
  _$jscoverage['/combo-loader.js'].lineData[397] = 0;
  _$jscoverage['/combo-loader.js'].lineData[398] = 0;
  _$jscoverage['/combo-loader.js'].lineData[400] = 0;
  _$jscoverage['/combo-loader.js'].lineData[401] = 0;
  _$jscoverage['/combo-loader.js'].lineData[402] = 0;
  _$jscoverage['/combo-loader.js'].lineData[405] = 0;
  _$jscoverage['/combo-loader.js'].lineData[406] = 0;
  _$jscoverage['/combo-loader.js'].lineData[407] = 0;
  _$jscoverage['/combo-loader.js'].lineData[408] = 0;
  _$jscoverage['/combo-loader.js'].lineData[411] = 0;
  _$jscoverage['/combo-loader.js'].lineData[412] = 0;
  _$jscoverage['/combo-loader.js'].lineData[413] = 0;
  _$jscoverage['/combo-loader.js'].lineData[414] = 0;
  _$jscoverage['/combo-loader.js'].lineData[415] = 0;
  _$jscoverage['/combo-loader.js'].lineData[417] = 0;
  _$jscoverage['/combo-loader.js'].lineData[418] = 0;
  _$jscoverage['/combo-loader.js'].lineData[421] = 0;
  _$jscoverage['/combo-loader.js'].lineData[425] = 0;
  _$jscoverage['/combo-loader.js'].lineData[435] = 0;
  _$jscoverage['/combo-loader.js'].lineData[441] = 0;
  _$jscoverage['/combo-loader.js'].lineData[443] = 0;
  _$jscoverage['/combo-loader.js'].lineData[444] = 0;
  _$jscoverage['/combo-loader.js'].lineData[445] = 0;
  _$jscoverage['/combo-loader.js'].lineData[446] = 0;
  _$jscoverage['/combo-loader.js'].lineData[447] = 0;
  _$jscoverage['/combo-loader.js'].lineData[448] = 0;
  _$jscoverage['/combo-loader.js'].lineData[450] = 0;
  _$jscoverage['/combo-loader.js'].lineData[455] = 0;
  _$jscoverage['/combo-loader.js'].lineData[457] = 0;
  _$jscoverage['/combo-loader.js'].lineData[465] = 0;
  _$jscoverage['/combo-loader.js'].lineData[466] = 0;
  _$jscoverage['/combo-loader.js'].lineData[470] = 0;
  _$jscoverage['/combo-loader.js'].lineData[471] = 0;
  _$jscoverage['/combo-loader.js'].lineData[472] = 0;
  _$jscoverage['/combo-loader.js'].lineData[473] = 0;
  _$jscoverage['/combo-loader.js'].lineData[476] = 0;
  _$jscoverage['/combo-loader.js'].lineData[482] = 0;
  _$jscoverage['/combo-loader.js'].lineData[486] = 0;
  _$jscoverage['/combo-loader.js'].lineData[487] = 0;
  _$jscoverage['/combo-loader.js'].lineData[488] = 0;
  _$jscoverage['/combo-loader.js'].lineData[490] = 0;
  _$jscoverage['/combo-loader.js'].lineData[491] = 0;
  _$jscoverage['/combo-loader.js'].lineData[492] = 0;
  _$jscoverage['/combo-loader.js'].lineData[493] = 0;
  _$jscoverage['/combo-loader.js'].lineData[494] = 0;
  _$jscoverage['/combo-loader.js'].lineData[495] = 0;
  _$jscoverage['/combo-loader.js'].lineData[499] = 0;
  _$jscoverage['/combo-loader.js'].lineData[500] = 0;
  _$jscoverage['/combo-loader.js'].lineData[501] = 0;
  _$jscoverage['/combo-loader.js'].lineData[502] = 0;
  _$jscoverage['/combo-loader.js'].lineData[503] = 0;
  _$jscoverage['/combo-loader.js'].lineData[504] = 0;
  _$jscoverage['/combo-loader.js'].lineData[505] = 0;
  _$jscoverage['/combo-loader.js'].lineData[506] = 0;
  _$jscoverage['/combo-loader.js'].lineData[509] = 0;
  _$jscoverage['/combo-loader.js'].lineData[510] = 0;
  _$jscoverage['/combo-loader.js'].lineData[513] = 0;
  _$jscoverage['/combo-loader.js'].lineData[516] = 0;
  _$jscoverage['/combo-loader.js'].lineData[517] = 0;
  _$jscoverage['/combo-loader.js'].lineData[518] = 0;
  _$jscoverage['/combo-loader.js'].lineData[519] = 0;
  _$jscoverage['/combo-loader.js'].lineData[522] = 0;
  _$jscoverage['/combo-loader.js'].lineData[523] = 0;
  _$jscoverage['/combo-loader.js'].lineData[524] = 0;
  _$jscoverage['/combo-loader.js'].lineData[525] = 0;
  _$jscoverage['/combo-loader.js'].lineData[528] = 0;
  _$jscoverage['/combo-loader.js'].lineData[529] = 0;
  _$jscoverage['/combo-loader.js'].lineData[530] = 0;
  _$jscoverage['/combo-loader.js'].lineData[531] = 0;
  _$jscoverage['/combo-loader.js'].lineData[532] = 0;
  _$jscoverage['/combo-loader.js'].lineData[536] = 0;
  _$jscoverage['/combo-loader.js'].lineData[540] = 0;
  _$jscoverage['/combo-loader.js'].lineData[541] = 0;
  _$jscoverage['/combo-loader.js'].lineData[543] = 0;
  _$jscoverage['/combo-loader.js'].lineData[546] = 0;
  _$jscoverage['/combo-loader.js'].lineData[547] = 0;
  _$jscoverage['/combo-loader.js'].lineData[549] = 0;
  _$jscoverage['/combo-loader.js'].lineData[550] = 0;
  _$jscoverage['/combo-loader.js'].lineData[551] = 0;
  _$jscoverage['/combo-loader.js'].lineData[553] = 0;
  _$jscoverage['/combo-loader.js'].lineData[556] = 0;
  _$jscoverage['/combo-loader.js'].lineData[557] = 0;
  _$jscoverage['/combo-loader.js'].lineData[561] = 0;
  _$jscoverage['/combo-loader.js'].lineData[565] = 0;
  _$jscoverage['/combo-loader.js'].lineData[566] = 0;
  _$jscoverage['/combo-loader.js'].lineData[567] = 0;
  _$jscoverage['/combo-loader.js'].lineData[571] = 0;
  _$jscoverage['/combo-loader.js'].lineData[574] = 0;
  _$jscoverage['/combo-loader.js'].lineData[575] = 0;
  _$jscoverage['/combo-loader.js'].lineData[580] = 0;
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
  _$jscoverage['/combo-loader.js'].functionData[31] = 0;
  _$jscoverage['/combo-loader.js'].functionData[32] = 0;
  _$jscoverage['/combo-loader.js'].functionData[33] = 0;
}
if (! _$jscoverage['/combo-loader.js'].branchData) {
  _$jscoverage['/combo-loader.js'].branchData = {};
  _$jscoverage['/combo-loader.js'].branchData['19'] = [];
  _$jscoverage['/combo-loader.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['22'] = [];
  _$jscoverage['/combo-loader.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['27'] = [];
  _$jscoverage['/combo-loader.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['38'] = [];
  _$jscoverage['/combo-loader.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['52'] = [];
  _$jscoverage['/combo-loader.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['54'] = [];
  _$jscoverage['/combo-loader.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['56'] = [];
  _$jscoverage['/combo-loader.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['58'] = [];
  _$jscoverage['/combo-loader.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['91'] = [];
  _$jscoverage['/combo-loader.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['91'][3] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['91'][4] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['93'] = [];
  _$jscoverage['/combo-loader.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['94'] = [];
  _$jscoverage['/combo-loader.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['99'] = [];
  _$jscoverage['/combo-loader.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['108'] = [];
  _$jscoverage['/combo-loader.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['108'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['117'] = [];
  _$jscoverage['/combo-loader.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['117'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['117'][3] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['121'] = [];
  _$jscoverage['/combo-loader.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['137'] = [];
  _$jscoverage['/combo-loader.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['152'] = [];
  _$jscoverage['/combo-loader.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['154'] = [];
  _$jscoverage['/combo-loader.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['160'] = [];
  _$jscoverage['/combo-loader.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['177'] = [];
  _$jscoverage['/combo-loader.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['182'] = [];
  _$jscoverage['/combo-loader.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['186'] = [];
  _$jscoverage['/combo-loader.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['198'] = [];
  _$jscoverage['/combo-loader.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['204'] = [];
  _$jscoverage['/combo-loader.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['205'] = [];
  _$jscoverage['/combo-loader.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['216'] = [];
  _$jscoverage['/combo-loader.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['216'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['219'] = [];
  _$jscoverage['/combo-loader.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['240'] = [];
  _$jscoverage['/combo-loader.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['242'] = [];
  _$jscoverage['/combo-loader.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['267'] = [];
  _$jscoverage['/combo-loader.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['269'] = [];
  _$jscoverage['/combo-loader.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['277'] = [];
  _$jscoverage['/combo-loader.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['300'] = [];
  _$jscoverage['/combo-loader.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['301'] = [];
  _$jscoverage['/combo-loader.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['303'] = [];
  _$jscoverage['/combo-loader.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['306'] = [];
  _$jscoverage['/combo-loader.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['308'] = [];
  _$jscoverage['/combo-loader.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['309'] = [];
  _$jscoverage['/combo-loader.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['315'] = [];
  _$jscoverage['/combo-loader.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['320'] = [];
  _$jscoverage['/combo-loader.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['323'] = [];
  _$jscoverage['/combo-loader.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['323'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['324'] = [];
  _$jscoverage['/combo-loader.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['332'] = [];
  _$jscoverage['/combo-loader.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['333'] = [];
  _$jscoverage['/combo-loader.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['344'] = [];
  _$jscoverage['/combo-loader.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['376'] = [];
  _$jscoverage['/combo-loader.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['387'] = [];
  _$jscoverage['/combo-loader.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['388'] = [];
  _$jscoverage['/combo-loader.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['390'] = [];
  _$jscoverage['/combo-loader.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['394'] = [];
  _$jscoverage['/combo-loader.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['397'] = [];
  _$jscoverage['/combo-loader.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['397'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['405'] = [];
  _$jscoverage['/combo-loader.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['408'] = [];
  _$jscoverage['/combo-loader.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['411'] = [];
  _$jscoverage['/combo-loader.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['412'] = [];
  _$jscoverage['/combo-loader.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['415'] = [];
  _$jscoverage['/combo-loader.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['417'] = [];
  _$jscoverage['/combo-loader.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['417'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['470'] = [];
  _$jscoverage['/combo-loader.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['473'] = [];
  _$jscoverage['/combo-loader.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['490'] = [];
  _$jscoverage['/combo-loader.js'].branchData['490'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['491'] = [];
  _$jscoverage['/combo-loader.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['492'] = [];
  _$jscoverage['/combo-loader.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['494'] = [];
  _$jscoverage['/combo-loader.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['499'] = [];
  _$jscoverage['/combo-loader.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['499'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['499'][3] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['509'] = [];
  _$jscoverage['/combo-loader.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['523'] = [];
  _$jscoverage['/combo-loader.js'].branchData['523'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['529'] = [];
  _$jscoverage['/combo-loader.js'].branchData['529'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['540'] = [];
  _$jscoverage['/combo-loader.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['549'] = [];
  _$jscoverage['/combo-loader.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['549'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['549'][3] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['566'] = [];
  _$jscoverage['/combo-loader.js'].branchData['566'][1] = new BranchData();
}
_$jscoverage['/combo-loader.js'].branchData['566'][1].init(48, 10, '!self.head');
function visit85_566_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['549'][3].init(124, 16, 'status === ERROR');
function visit84_549_3(result) {
  _$jscoverage['/combo-loader.js'].branchData['549'][3].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['549'][2].init(104, 16, 'status >= LOADED');
function visit83_549_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['549'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['549'][1].init(104, 36, 'status >= LOADED || status === ERROR');
function visit82_549_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['540'][1].init(18, 14, '!this.callback');
function visit81_540_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['529'][1].init(35, 20, 'comboRes[type] || []');
function visit80_529_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['529'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['523'][1].init(35, 20, 'comboRes[type] || []');
function visit79_523_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['509'][1].init(2828, 23, 'currentComboUrls.length');
function visit78_509_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['499'][3].init(1320, 34, 'getSentUrl().length > maxUrlLength');
function visit77_499_3(result) {
  _$jscoverage['/combo-loader.js'].branchData['499'][3].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['499'][2].init(1280, 36, 'currentComboUrls.length > maxFileNum');
function visit76_499_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['499'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['499'][1].init(1280, 74, 'currentComboUrls.length > maxFileNum || getSentUrl().length > maxUrlLength');
function visit75_499_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['494'][1].init(114, 20, 'commonPrefix === \'/\'');
function visit74_494_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['492'][1].init(996, 19, 'commonPrefix !== \'\'');
function visit73_492_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['491'][1].init(41, 27, 'subPath.indexOf(\'/\') !== -1');
function visit72_491_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['490'][1].init(849, 26, 'commonPrefix === undefined');
function visit71_490_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['473'][1].init(129, 157, '!currentMod.getPackage().isCombine() || !Utils.startsWith(url, basePrefix)');
function visit70_473_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['470'][1].init(1052, 19, 'i < sendMods.length');
function visit69_470_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['417'][2].init(37, 19, 'tag !== tmpMods.tag');
function visit68_417_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['417'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['417'][1].init(30, 26, 'tag && tag !== tmpMods.tag');
function visit67_417_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['415'][1].init(158, 9, 'tag || \'\'');
function visit66_415_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['412'][1].init(104, 37, '!(tmpMods = normalTypes[packageBase])');
function visit65_412_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['411'][1].init(40, 37, 'normals[type] || (normals[type] = {})');
function visit64_411_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['408'][1].init(159, 9, 'tag || \'\'');
function visit63_408_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['405'][1].init(975, 5, '!find');
function visit62_405_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['397'][2].init(176, 19, 'tag !== tmpMods.tag');
function visit61_397_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['397'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['397'][1].init(169, 26, 'tag && tag !== tmpMods.tag');
function visit60_397_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['394'][1].init(30, 41, 'Utils.isSameOriginAs(prefix, packageBase)');
function visit59_394_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['390'][1].init(165, 45, 'typeGroups[group] || (typeGroups[group] = {})');
function visit58_390_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['388'][1].init(39, 35, 'groups[type] || (groups[type] = {})');
function visit57_388_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['387'][1].init(434, 32, 'packageInfo.isCombine() && group');
function visit56_387_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['376'][1].init(595, 5, 'i < l');
function visit55_376_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['344'][1].init(1344, 9, '\'@DEBUG@\'');
function visit54_344_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['333'][1].init(26, 30, 'Utils.indexOf(m, stack) !== -1');
function visit53_333_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['332'][1].init(844, 9, '\'@DEBUG@\'');
function visit52_332_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['324'][1].init(26, 21, 'modStatus !== LOADING');
function visit51_324_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['323'][2].init(523, 20, 'modStatus !== LOADED');
function visit50_323_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['323'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['323'][1].init(523, 43, 'modStatus !== LOADED && !mod.contains(self)');
function visit49_323_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['320'][1].init(406, 18, 'modStatus > LOADED');
function visit48_320_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['315'][1].init(235, 19, 'modStatus === ERROR');
function visit47_315_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['309'][1].init(22, 9, '\'@DEBUG@\'');
function visit46_309_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['308'][1].init(348, 23, 'i < unloadedMods.length');
function visit45_308_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['306'][1].init(308, 11, 'cache || {}');
function visit44_306_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['303'][1].init(203, 9, 'ret || []');
function visit43_303_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['301'][1].init(26, 11, 'stack || []');
function visit42_301_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['300'][1].init(118, 9, '\'@DEBUG@\'');
function visit41_300_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['277'][1].init(153, 12, '!mod.factory');
function visit40_277_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['269'][1].init(26, 9, '\'@DEBUG@\'');
function visit39_269_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['267'][1].init(1339, 12, 'comboUrls.js');
function visit38_267_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['242'][1].init(26, 9, '\'@DEBUG@\'');
function visit37_242_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['240'][1].init(227, 13, 'comboUrls.css');
function visit36_240_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['219'][1].init(121, 27, 'i < currentComboUrls.length');
function visit35_219_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['216'][2].init(30, 27, 'currentComboUrls.length > 1');
function visit34_216_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['216'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['216'][1].init(14, 43, 'commonPrefix && currentComboUrls.length > 1');
function visit33_216_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['205'][1].init(18, 19, 'str1[i] !== str2[i]');
function visit32_205_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['204'][1].init(444, 5, 'i < l');
function visit31_204_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['198'][1].init(148, 20, 'protocolIndex !== -1');
function visit30_198_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['186'][1].init(232, 9, 'ms.length');
function visit29_186_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['182'][1].init(26, 19, 'm.status === LOADED');
function visit28_182_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['177'][1].init(5897, 9, '\'@DEBUG@\'');
function visit27_177_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['160'][1].init(339, 2, 're');
function visit26_160_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['154'][1].init(52, 35, 'script.readyState === \'interactive\'');
function visit25_154_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['152'][1].init(139, 6, 'i >= 0');
function visit24_152_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['137'][1].init(76, 5, 'oldIE');
function visit23_137_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['121'][1].init(136, 5, 'oldIE');
function visit22_121_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['117'][3].init(406, 13, 'argsLen === 1');
function visit21_117_3(result) {
  _$jscoverage['/combo-loader.js'].branchData['117'][3].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['117'][2].init(376, 26, 'typeof name === \'function\'');
function visit20_117_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['117'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['117'][1].init(376, 43, 'typeof name === \'function\' || argsLen === 1');
function visit19_117_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['108'][2].init(59, 13, 'argsLen === 3');
function visit18_108_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['108'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['108'][1].init(59, 39, 'argsLen === 3 && Utils.isArray(factory)');
function visit17_108_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['99'][2].init(82, 30, 'config.requires && !config.cjs');
function visit16_99_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['99'][1].init(72, 40, 'config && config.requires && !config.cjs');
function visit15_99_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['94'][1].init(27, 12, 'config || {}');
function visit14_94_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['93'][1].init(80, 15, 'requires.length');
function visit13_93_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['91'][4].init(154, 18, 'factory.length > 1');
function visit12_91_4(result) {
  _$jscoverage['/combo-loader.js'].branchData['91'][4].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['91'][3].init(121, 29, 'typeof factory === \'function\'');
function visit11_91_3(result) {
  _$jscoverage['/combo-loader.js'].branchData['91'][3].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['91'][2].init(121, 51, 'typeof factory === \'function\' && factory.length > 1');
function visit10_91_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['91'][1].init(110, 62, '!config && typeof factory === \'function\' && factory.length > 1');
function visit9_91_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['58'][1].init(76, 9, '\'@DEBUG@\'');
function visit8_58_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['56'][1].init(151, 5, 'oldIE');
function visit7_56_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['54'][1].init(57, 23, 'mod.getType() === \'css\'');
function visit6_54_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['52'][1].init(818, 11, '!rs.combine');
function visit5_52_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['38'][1].init(69, 17, 'mod && currentMod');
function visit4_38_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['27'][1].init(18, 10, '!(--count)');
function visit3_27_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['22'][1].init(22, 17, 'rss && rss.length');
function visit2_22_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['19'][1].init(330, 13, 'Utils.ie < 10');
function visit1_19_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/combo-loader.js'].functionData[0]++;
  _$jscoverage['/combo-loader.js'].lineData[7]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/combo-loader.js'].lineData[9]++;
  var Loader = S.Loader, Config = S.Config, Status = Loader.Status, Utils = Loader.Utils, addModule = Utils.addModule, each = Utils.each, getHash = Utils.getHash, LOADING = Status.LOADING, LOADED = Status.LOADED, ERROR = Status.ERROR, oldIE = visit1_19_1(Utils.ie < 10);
  _$jscoverage['/combo-loader.js'].lineData[21]++;
  function loadScripts(rss, callback, timeout) {
    _$jscoverage['/combo-loader.js'].functionData[1]++;
    _$jscoverage['/combo-loader.js'].lineData[22]++;
    var count = visit2_22_1(rss && rss.length), errorList = [], successList = [];
    _$jscoverage['/combo-loader.js'].lineData[26]++;
    function complete() {
      _$jscoverage['/combo-loader.js'].functionData[2]++;
      _$jscoverage['/combo-loader.js'].lineData[27]++;
      if (visit3_27_1(!(--count))) {
        _$jscoverage['/combo-loader.js'].lineData[28]++;
        callback(successList, errorList);
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[32]++;
    each(rss, function(rs) {
  _$jscoverage['/combo-loader.js'].functionData[3]++;
  _$jscoverage['/combo-loader.js'].lineData[33]++;
  var mod;
  _$jscoverage['/combo-loader.js'].lineData[34]++;
  var config = {
  timeout: timeout, 
  success: function() {
  _$jscoverage['/combo-loader.js'].functionData[4]++;
  _$jscoverage['/combo-loader.js'].lineData[37]++;
  successList.push(rs);
  _$jscoverage['/combo-loader.js'].lineData[38]++;
  if (visit4_38_1(mod && currentMod)) {
    _$jscoverage['/combo-loader.js'].lineData[40]++;
    logger.debug('standard browser get mod name after load: ' + mod.name);
    _$jscoverage['/combo-loader.js'].lineData[41]++;
    addModule(mod.name, currentMod.factory, currentMod.config);
    _$jscoverage['/combo-loader.js'].lineData[42]++;
    currentMod = undefined;
  }
  _$jscoverage['/combo-loader.js'].lineData[44]++;
  complete();
}, 
  error: function() {
  _$jscoverage['/combo-loader.js'].functionData[5]++;
  _$jscoverage['/combo-loader.js'].lineData[47]++;
  errorList.push(rs);
  _$jscoverage['/combo-loader.js'].lineData[48]++;
  complete();
}, 
  charset: rs.charset};
  _$jscoverage['/combo-loader.js'].lineData[52]++;
  if (visit5_52_1(!rs.combine)) {
    _$jscoverage['/combo-loader.js'].lineData[53]++;
    mod = rs.mods[0];
    _$jscoverage['/combo-loader.js'].lineData[54]++;
    if (visit6_54_1(mod.getType() === 'css')) {
      _$jscoverage['/combo-loader.js'].lineData[55]++;
      mod = undefined;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[56]++;
      if (visit7_56_1(oldIE)) {
        _$jscoverage['/combo-loader.js'].lineData[57]++;
        startLoadModName = mod.name;
        _$jscoverage['/combo-loader.js'].lineData[58]++;
        if (visit8_58_1('@DEBUG@')) {
          _$jscoverage['/combo-loader.js'].lineData[59]++;
          startLoadModTime = +new Date();
        }
        _$jscoverage['/combo-loader.js'].lineData[61]++;
        config.attrs = {
  'data-mod-name': mod.name};
      }
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[66]++;
  Config.loadModsFn(rs, config);
});
  }
  _$jscoverage['/combo-loader.js'].lineData[70]++;
  var loaderId = 0;
  _$jscoverage['/combo-loader.js'].lineData[78]++;
  function ComboLoader(callback) {
    _$jscoverage['/combo-loader.js'].functionData[6]++;
    _$jscoverage['/combo-loader.js'].lineData[79]++;
    this.callback = callback;
    _$jscoverage['/combo-loader.js'].lineData[80]++;
    this.head = this.tail = undefined;
    _$jscoverage['/combo-loader.js'].lineData[81]++;
    this.id = 'loader' + (++loaderId);
  }
  _$jscoverage['/combo-loader.js'].lineData[84]++;
  var currentMod;
  _$jscoverage['/combo-loader.js'].lineData[85]++;
  var startLoadModName;
  _$jscoverage['/combo-loader.js'].lineData[86]++;
  var startLoadModTime;
  _$jscoverage['/combo-loader.js'].lineData[88]++;
  function checkKISSYRequire(config, factory) {
    _$jscoverage['/combo-loader.js'].functionData[7]++;
    _$jscoverage['/combo-loader.js'].lineData[91]++;
    if (visit9_91_1(!config && visit10_91_2(visit11_91_3(typeof factory === 'function') && visit12_91_4(factory.length > 1)))) {
      _$jscoverage['/combo-loader.js'].lineData[92]++;
      var requires = Utils.getRequiresFromFn(factory);
      _$jscoverage['/combo-loader.js'].lineData[93]++;
      if (visit13_93_1(requires.length)) {
        _$jscoverage['/combo-loader.js'].lineData[94]++;
        config = visit14_94_1(config || {});
        _$jscoverage['/combo-loader.js'].lineData[95]++;
        config.requires = requires;
      }
    } else {
      _$jscoverage['/combo-loader.js'].lineData[99]++;
      if (visit15_99_1(config && visit16_99_2(config.requires && !config.cjs))) {
        _$jscoverage['/combo-loader.js'].lineData[100]++;
        config.cjs = 0;
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[103]++;
    return config;
  }
  _$jscoverage['/combo-loader.js'].lineData[106]++;
  ComboLoader.add = function(name, factory, config, argsLen) {
  _$jscoverage['/combo-loader.js'].functionData[8]++;
  _$jscoverage['/combo-loader.js'].lineData[108]++;
  if (visit17_108_1(visit18_108_2(argsLen === 3) && Utils.isArray(factory))) {
    _$jscoverage['/combo-loader.js'].lineData[109]++;
    var tmp = factory;
    _$jscoverage['/combo-loader.js'].lineData[110]++;
    factory = config;
    _$jscoverage['/combo-loader.js'].lineData[111]++;
    config = {
  requires: tmp, 
  cjs: 1};
  }
  _$jscoverage['/combo-loader.js'].lineData[117]++;
  if (visit19_117_1(visit20_117_2(typeof name === 'function') || visit21_117_3(argsLen === 1))) {
    _$jscoverage['/combo-loader.js'].lineData[118]++;
    config = factory;
    _$jscoverage['/combo-loader.js'].lineData[119]++;
    factory = name;
    _$jscoverage['/combo-loader.js'].lineData[120]++;
    config = checkKISSYRequire(config, factory);
    _$jscoverage['/combo-loader.js'].lineData[121]++;
    if (visit22_121_1(oldIE)) {
      _$jscoverage['/combo-loader.js'].lineData[123]++;
      name = findModuleNameByInteractive();
      _$jscoverage['/combo-loader.js'].lineData[125]++;
      addModule(name, factory, config);
      _$jscoverage['/combo-loader.js'].lineData[126]++;
      startLoadModName = null;
      _$jscoverage['/combo-loader.js'].lineData[127]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[130]++;
      currentMod = {
  factory: factory, 
  config: config};
    }
  } else {
    _$jscoverage['/combo-loader.js'].lineData[137]++;
    if (visit23_137_1(oldIE)) {
      _$jscoverage['/combo-loader.js'].lineData[138]++;
      startLoadModName = null;
      _$jscoverage['/combo-loader.js'].lineData[139]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[141]++;
      currentMod = undefined;
    }
    _$jscoverage['/combo-loader.js'].lineData[143]++;
    config = checkKISSYRequire(config, factory);
    _$jscoverage['/combo-loader.js'].lineData[144]++;
    addModule(name, factory, config);
  }
};
  _$jscoverage['/combo-loader.js'].lineData[148]++;
  function findModuleNameByInteractive() {
    _$jscoverage['/combo-loader.js'].functionData[9]++;
    _$jscoverage['/combo-loader.js'].lineData[149]++;
    var scripts = document.getElementsByTagName('script'), re, i, name, script;
    _$jscoverage['/combo-loader.js'].lineData[152]++;
    for (i = scripts.length - 1; visit24_152_1(i >= 0); i--) {
      _$jscoverage['/combo-loader.js'].lineData[153]++;
      script = scripts[i];
      _$jscoverage['/combo-loader.js'].lineData[154]++;
      if (visit25_154_1(script.readyState === 'interactive')) {
        _$jscoverage['/combo-loader.js'].lineData[155]++;
        re = script;
        _$jscoverage['/combo-loader.js'].lineData[156]++;
        break;
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[160]++;
    if (visit26_160_1(re)) {
      _$jscoverage['/combo-loader.js'].lineData[161]++;
      name = re.getAttribute('data-mod-name');
    } else {
      _$jscoverage['/combo-loader.js'].lineData[168]++;
      logger.debug('can not find interactive script,time diff : ' + (+new Date() - startLoadModTime));
      _$jscoverage['/combo-loader.js'].lineData[169]++;
      logger.debug('old_ie get mod name from cache : ' + startLoadModName);
      _$jscoverage['/combo-loader.js'].lineData[170]++;
      name = startLoadModName;
    }
    _$jscoverage['/combo-loader.js'].lineData[172]++;
    return name;
  }
  _$jscoverage['/combo-loader.js'].lineData[175]++;
  var debugRemoteModules;
  _$jscoverage['/combo-loader.js'].lineData[177]++;
  if (visit27_177_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[178]++;
    debugRemoteModules = function(rss) {
  _$jscoverage['/combo-loader.js'].functionData[10]++;
  _$jscoverage['/combo-loader.js'].lineData[179]++;
  each(rss, function(rs) {
  _$jscoverage['/combo-loader.js'].functionData[11]++;
  _$jscoverage['/combo-loader.js'].lineData[180]++;
  var ms = [];
  _$jscoverage['/combo-loader.js'].lineData[181]++;
  each(rs.mods, function(m) {
  _$jscoverage['/combo-loader.js'].functionData[12]++;
  _$jscoverage['/combo-loader.js'].lineData[182]++;
  if (visit28_182_1(m.status === LOADED)) {
    _$jscoverage['/combo-loader.js'].lineData[183]++;
    ms.push(m.name);
  }
});
  _$jscoverage['/combo-loader.js'].lineData[186]++;
  if (visit29_186_1(ms.length)) {
    _$jscoverage['/combo-loader.js'].lineData[187]++;
    logger.info('load remote modules: "' + ms.join(', ') + '" from: "' + rs.url + '"');
  }
});
};
  }
  _$jscoverage['/combo-loader.js'].lineData[193]++;
  function getCommonPathPrefix(str1, str2) {
    _$jscoverage['/combo-loader.js'].functionData[13]++;
    _$jscoverage['/combo-loader.js'].lineData[196]++;
    var protocolIndex = str1.indexOf('//');
    _$jscoverage['/combo-loader.js'].lineData[197]++;
    var prefix = '';
    _$jscoverage['/combo-loader.js'].lineData[198]++;
    if (visit30_198_1(protocolIndex !== -1)) {
      _$jscoverage['/combo-loader.js'].lineData[199]++;
      prefix = str1.substring(0, str1.indexOf('//') + 2);
    }
    _$jscoverage['/combo-loader.js'].lineData[201]++;
    str1 = str1.substring(prefix.length).split(/\//);
    _$jscoverage['/combo-loader.js'].lineData[202]++;
    str2 = str2.substring(prefix.length).split(/\//);
    _$jscoverage['/combo-loader.js'].lineData[203]++;
    var l = Math.min(str1.length, str2.length);
    _$jscoverage['/combo-loader.js'].lineData[204]++;
    for (var i = 0; visit31_204_1(i < l); i++) {
      _$jscoverage['/combo-loader.js'].lineData[205]++;
      if (visit32_205_1(str1[i] !== str2[i])) {
        _$jscoverage['/combo-loader.js'].lineData[206]++;
        break;
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[209]++;
    return prefix + str1.slice(0, i).join('/') + '/';
  }
  _$jscoverage['/combo-loader.js'].lineData[215]++;
  function getUrlConsiderCommonPrefix(commonPrefix, currentComboUrls, basePrefix, comboPrefix, comboSep, suffix) {
    _$jscoverage['/combo-loader.js'].functionData[14]++;
    _$jscoverage['/combo-loader.js'].lineData[216]++;
    if (visit33_216_1(commonPrefix && visit34_216_2(currentComboUrls.length > 1))) {
      _$jscoverage['/combo-loader.js'].lineData[217]++;
      var commonPrefixLen = commonPrefix.length;
      _$jscoverage['/combo-loader.js'].lineData[218]++;
      var currentUrls = [];
      _$jscoverage['/combo-loader.js'].lineData[219]++;
      for (var i = 0; visit35_219_1(i < currentComboUrls.length); i++) {
        _$jscoverage['/combo-loader.js'].lineData[220]++;
        currentUrls[i] = currentComboUrls[i].substring(commonPrefixLen);
      }
      _$jscoverage['/combo-loader.js'].lineData[222]++;
      return basePrefix + commonPrefix + comboPrefix + currentUrls.join(comboSep) + suffix;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[224]++;
      return basePrefix + comboPrefix + currentComboUrls.join(comboSep) + suffix;
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[228]++;
  Utils.mix(ComboLoader.prototype, {
  use: function(allMods) {
  _$jscoverage['/combo-loader.js'].functionData[15]++;
  _$jscoverage['/combo-loader.js'].lineData[233]++;
  var self = this, comboUrls, timeout = Config.timeout;
  _$jscoverage['/combo-loader.js'].lineData[237]++;
  comboUrls = self.getComboUrls(allMods);
  _$jscoverage['/combo-loader.js'].lineData[240]++;
  if (visit36_240_1(comboUrls.css)) {
    _$jscoverage['/combo-loader.js'].lineData[241]++;
    loadScripts(comboUrls.css, function(success, error) {
  _$jscoverage['/combo-loader.js'].functionData[16]++;
  _$jscoverage['/combo-loader.js'].lineData[242]++;
  if (visit37_242_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[243]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/combo-loader.js'].lineData[246]++;
  each(success, function(one) {
  _$jscoverage['/combo-loader.js'].functionData[17]++;
  _$jscoverage['/combo-loader.js'].lineData[247]++;
  each(one.mods, function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[18]++;
  _$jscoverage['/combo-loader.js'].lineData[248]++;
  addModule(mod.name, Utils.noop);
  _$jscoverage['/combo-loader.js'].lineData[250]++;
  mod.flush();
});
});
  _$jscoverage['/combo-loader.js'].lineData[254]++;
  each(error, function(one) {
  _$jscoverage['/combo-loader.js'].functionData[19]++;
  _$jscoverage['/combo-loader.js'].lineData[255]++;
  each(one.mods, function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[20]++;
  _$jscoverage['/combo-loader.js'].lineData[256]++;
  var msg = mod.name + ' is not loaded! can not find module in url: ' + one.url;
  _$jscoverage['/combo-loader.js'].lineData[257]++;
  S.log(msg, 'error');
  _$jscoverage['/combo-loader.js'].lineData[258]++;
  mod.status = ERROR;
  _$jscoverage['/combo-loader.js'].lineData[260]++;
  mod.flush();
});
});
}, timeout);
  }
  _$jscoverage['/combo-loader.js'].lineData[267]++;
  if (visit38_267_1(comboUrls.js)) {
    _$jscoverage['/combo-loader.js'].lineData[268]++;
    loadScripts(comboUrls.js, function(success) {
  _$jscoverage['/combo-loader.js'].functionData[21]++;
  _$jscoverage['/combo-loader.js'].lineData[269]++;
  if (visit39_269_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[270]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/combo-loader.js'].lineData[273]++;
  each(comboUrls.js, function(one) {
  _$jscoverage['/combo-loader.js'].functionData[22]++;
  _$jscoverage['/combo-loader.js'].lineData[274]++;
  each(one.mods, function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[23]++;
  _$jscoverage['/combo-loader.js'].lineData[277]++;
  if (visit40_277_1(!mod.factory)) {
    _$jscoverage['/combo-loader.js'].lineData[278]++;
    var msg = mod.name + ' is not loaded! can not find module in url: ' + one.url;
    _$jscoverage['/combo-loader.js'].lineData[281]++;
    S.log(msg, 'error');
    _$jscoverage['/combo-loader.js'].lineData[282]++;
    mod.status = ERROR;
  }
  _$jscoverage['/combo-loader.js'].lineData[285]++;
  mod.flush();
});
});
}, timeout);
  }
}, 
  calculate: function(unloadedMods, errorList, stack, cache, ret) {
  _$jscoverage['/combo-loader.js'].functionData[24]++;
  _$jscoverage['/combo-loader.js'].lineData[296]++;
  var i, m, mod, modStatus, stackDepth, self = this;
  _$jscoverage['/combo-loader.js'].lineData[300]++;
  if (visit41_300_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[301]++;
    stack = visit42_301_1(stack || []);
  }
  _$jscoverage['/combo-loader.js'].lineData[303]++;
  ret = visit43_303_1(ret || []);
  _$jscoverage['/combo-loader.js'].lineData[306]++;
  cache = visit44_306_1(cache || {});
  _$jscoverage['/combo-loader.js'].lineData[308]++;
  for (i = 0; visit45_308_1(i < unloadedMods.length); i++) {
    _$jscoverage['/combo-loader.js'].lineData[309]++;
    if (visit46_309_1('@DEBUG@')) {
      _$jscoverage['/combo-loader.js'].lineData[310]++;
      stackDepth = stack.length;
    }
    _$jscoverage['/combo-loader.js'].lineData[312]++;
    mod = unloadedMods[i];
    _$jscoverage['/combo-loader.js'].lineData[313]++;
    m = mod.name;
    _$jscoverage['/combo-loader.js'].lineData[314]++;
    modStatus = mod.status;
    _$jscoverage['/combo-loader.js'].lineData[315]++;
    if (visit47_315_1(modStatus === ERROR)) {
      _$jscoverage['/combo-loader.js'].lineData[316]++;
      errorList.push(mod);
      _$jscoverage['/combo-loader.js'].lineData[317]++;
      cache[m] = 1;
      _$jscoverage['/combo-loader.js'].lineData[318]++;
      continue;
    }
    _$jscoverage['/combo-loader.js'].lineData[320]++;
    if (visit48_320_1(modStatus > LOADED)) {
      _$jscoverage['/combo-loader.js'].lineData[321]++;
      cache[m] = 1;
      _$jscoverage['/combo-loader.js'].lineData[322]++;
      continue;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[323]++;
      if (visit49_323_1(visit50_323_2(modStatus !== LOADED) && !mod.contains(self))) {
        _$jscoverage['/combo-loader.js'].lineData[324]++;
        if (visit51_324_1(modStatus !== LOADING)) {
          _$jscoverage['/combo-loader.js'].lineData[325]++;
          mod.status = LOADING;
          _$jscoverage['/combo-loader.js'].lineData[326]++;
          ret.push(mod);
        }
        _$jscoverage['/combo-loader.js'].lineData[328]++;
        mod.add(self);
        _$jscoverage['/combo-loader.js'].lineData[329]++;
        self.wait(mod);
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[332]++;
    if (visit52_332_1('@DEBUG@')) {
      _$jscoverage['/combo-loader.js'].lineData[333]++;
      if (visit53_333_1(Utils.indexOf(m, stack) !== -1)) {
        _$jscoverage['/combo-loader.js'].lineData[334]++;
        S.log('find cyclic dependency between mods: ' + stack, 'warn');
        _$jscoverage['/combo-loader.js'].lineData[335]++;
        cache[m] = 1;
        _$jscoverage['/combo-loader.js'].lineData[336]++;
        continue;
      } else {
        _$jscoverage['/combo-loader.js'].lineData[338]++;
        stack.push(m);
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[342]++;
    self.calculate(mod.getNormalizedRequiredModules(), errorList, stack, cache, ret);
    _$jscoverage['/combo-loader.js'].lineData[343]++;
    cache[m] = 1;
    _$jscoverage['/combo-loader.js'].lineData[344]++;
    if (visit54_344_1('@DEBUG@')) {
      _$jscoverage['/combo-loader.js'].lineData[345]++;
      stack.length = stackDepth;
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[349]++;
  return ret;
}, 
  getComboMods: function(mods) {
  _$jscoverage['/combo-loader.js'].functionData[25]++;
  _$jscoverage['/combo-loader.js'].lineData[356]++;
  var i, l = mods.length, tmpMods, mod, packageInfo, type, tag, charset, packageBase, packageName, group, modUrl;
  _$jscoverage['/combo-loader.js'].lineData[360]++;
  var groups = {};
  _$jscoverage['/combo-loader.js'].lineData[369]++;
  var normals = {};
  _$jscoverage['/combo-loader.js'].lineData[376]++;
  for (i = 0; visit55_376_1(i < l); ++i) {
    _$jscoverage['/combo-loader.js'].lineData[377]++;
    mod = mods[i];
    _$jscoverage['/combo-loader.js'].lineData[378]++;
    type = mod.getType();
    _$jscoverage['/combo-loader.js'].lineData[379]++;
    modUrl = mod.getUrl();
    _$jscoverage['/combo-loader.js'].lineData[380]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/combo-loader.js'].lineData[381]++;
    packageBase = packageInfo.getBase();
    _$jscoverage['/combo-loader.js'].lineData[382]++;
    packageName = packageInfo.name;
    _$jscoverage['/combo-loader.js'].lineData[383]++;
    charset = packageInfo.getCharset();
    _$jscoverage['/combo-loader.js'].lineData[384]++;
    tag = packageInfo.getTag();
    _$jscoverage['/combo-loader.js'].lineData[385]++;
    group = packageInfo.getGroup();
    _$jscoverage['/combo-loader.js'].lineData[387]++;
    if (visit56_387_1(packageInfo.isCombine() && group)) {
      _$jscoverage['/combo-loader.js'].lineData[388]++;
      var typeGroups = visit57_388_1(groups[type] || (groups[type] = {}));
      _$jscoverage['/combo-loader.js'].lineData[389]++;
      group = group + '-' + charset;
      _$jscoverage['/combo-loader.js'].lineData[390]++;
      var typeGroup = visit58_390_1(typeGroups[group] || (typeGroups[group] = {}));
      _$jscoverage['/combo-loader.js'].lineData[391]++;
      var find = 0;
      _$jscoverage['/combo-loader.js'].lineData[393]++;
      Utils.each(typeGroup, function(tmpMods, prefix) {
  _$jscoverage['/combo-loader.js'].functionData[26]++;
  _$jscoverage['/combo-loader.js'].lineData[394]++;
  if (visit59_394_1(Utils.isSameOriginAs(prefix, packageBase))) {
    _$jscoverage['/combo-loader.js'].lineData[395]++;
    var newPrefix = getCommonPathPrefix(prefix, packageBase);
    _$jscoverage['/combo-loader.js'].lineData[396]++;
    tmpMods.push(mod);
    _$jscoverage['/combo-loader.js'].lineData[397]++;
    if (visit60_397_1(tag && visit61_397_2(tag !== tmpMods.tag))) {
      _$jscoverage['/combo-loader.js'].lineData[398]++;
      tmpMods.tag = getHash(tmpMods.tag + tag);
    }
    _$jscoverage['/combo-loader.js'].lineData[400]++;
    delete typeGroup[prefix];
    _$jscoverage['/combo-loader.js'].lineData[401]++;
    typeGroup[newPrefix] = tmpMods;
    _$jscoverage['/combo-loader.js'].lineData[402]++;
    find = 1;
  }
});
      _$jscoverage['/combo-loader.js'].lineData[405]++;
      if (visit62_405_1(!find)) {
        _$jscoverage['/combo-loader.js'].lineData[406]++;
        tmpMods = typeGroup[packageBase] = [mod];
        _$jscoverage['/combo-loader.js'].lineData[407]++;
        tmpMods.charset = charset;
        _$jscoverage['/combo-loader.js'].lineData[408]++;
        tmpMods.tag = visit63_408_1(tag || '');
      }
    } else {
      _$jscoverage['/combo-loader.js'].lineData[411]++;
      var normalTypes = visit64_411_1(normals[type] || (normals[type] = {}));
      _$jscoverage['/combo-loader.js'].lineData[412]++;
      if (visit65_412_1(!(tmpMods = normalTypes[packageBase]))) {
        _$jscoverage['/combo-loader.js'].lineData[413]++;
        tmpMods = normalTypes[packageBase] = [];
        _$jscoverage['/combo-loader.js'].lineData[414]++;
        tmpMods.charset = charset;
        _$jscoverage['/combo-loader.js'].lineData[415]++;
        tmpMods.tag = visit66_415_1(tag || '');
      } else {
        _$jscoverage['/combo-loader.js'].lineData[417]++;
        if (visit67_417_1(tag && visit68_417_2(tag !== tmpMods.tag))) {
          _$jscoverage['/combo-loader.js'].lineData[418]++;
          tmpMods.tag = getHash(tmpMods.tag + tag);
        }
      }
      _$jscoverage['/combo-loader.js'].lineData[421]++;
      tmpMods.push(mod);
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[425]++;
  return {
  groups: groups, 
  normals: normals};
}, 
  getComboUrls: function(mods) {
  _$jscoverage['/combo-loader.js'].functionData[27]++;
  _$jscoverage['/combo-loader.js'].lineData[435]++;
  var comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, comboRes = {}, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/combo-loader.js'].lineData[441]++;
  var comboMods = this.getComboMods(mods);
  _$jscoverage['/combo-loader.js'].lineData[443]++;
  function processSamePrefixUrlMods(type, basePrefix, sendMods) {
    _$jscoverage['/combo-loader.js'].functionData[28]++;
    _$jscoverage['/combo-loader.js'].lineData[444]++;
    var currentComboUrls = [];
    _$jscoverage['/combo-loader.js'].lineData[445]++;
    var currentComboMods = [];
    _$jscoverage['/combo-loader.js'].lineData[446]++;
    var tag = sendMods.tag;
    _$jscoverage['/combo-loader.js'].lineData[447]++;
    var charset = sendMods.charset;
    _$jscoverage['/combo-loader.js'].lineData[448]++;
    var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : '');
    _$jscoverage['/combo-loader.js'].lineData[450]++;
    var baseLen = basePrefix.length, commonPrefix, res = [];
    _$jscoverage['/combo-loader.js'].lineData[455]++;
    function pushComboUrl(sentUrl) {
      _$jscoverage['/combo-loader.js'].functionData[29]++;
      _$jscoverage['/combo-loader.js'].lineData[457]++;
      res.push({
  combine: 1, 
  url: sentUrl, 
  charset: charset, 
  mods: currentComboMods});
    }
    _$jscoverage['/combo-loader.js'].lineData[465]++;
    function getSentUrl() {
      _$jscoverage['/combo-loader.js'].functionData[30]++;
      _$jscoverage['/combo-loader.js'].lineData[466]++;
      return getUrlConsiderCommonPrefix(commonPrefix, currentComboUrls, basePrefix, comboPrefix, comboSep, suffix);
    }
    _$jscoverage['/combo-loader.js'].lineData[470]++;
    for (var i = 0; visit69_470_1(i < sendMods.length); i++) {
      _$jscoverage['/combo-loader.js'].lineData[471]++;
      var currentMod = sendMods[i];
      _$jscoverage['/combo-loader.js'].lineData[472]++;
      var url = currentMod.getUrl();
      _$jscoverage['/combo-loader.js'].lineData[473]++;
      if (visit70_473_1(!currentMod.getPackage().isCombine() || !Utils.startsWith(url, basePrefix))) {
        _$jscoverage['/combo-loader.js'].lineData[476]++;
        res.push({
  combine: 0, 
  url: url, 
  charset: charset, 
  mods: [currentMod]});
        _$jscoverage['/combo-loader.js'].lineData[482]++;
        continue;
      }
      _$jscoverage['/combo-loader.js'].lineData[486]++;
      var subPath = url.slice(baseLen).replace(/\?.*$/, '');
      _$jscoverage['/combo-loader.js'].lineData[487]++;
      currentComboUrls.push(subPath);
      _$jscoverage['/combo-loader.js'].lineData[488]++;
      currentComboMods.push(currentMod);
      _$jscoverage['/combo-loader.js'].lineData[490]++;
      if (visit71_490_1(commonPrefix === undefined)) {
        _$jscoverage['/combo-loader.js'].lineData[491]++;
        commonPrefix = visit72_491_1(subPath.indexOf('/') !== -1) ? subPath : '';
      } else {
        _$jscoverage['/combo-loader.js'].lineData[492]++;
        if (visit73_492_1(commonPrefix !== '')) {
          _$jscoverage['/combo-loader.js'].lineData[493]++;
          commonPrefix = getCommonPathPrefix(commonPrefix, subPath);
          _$jscoverage['/combo-loader.js'].lineData[494]++;
          if (visit74_494_1(commonPrefix === '/')) {
            _$jscoverage['/combo-loader.js'].lineData[495]++;
            commonPrefix = '';
          }
        }
      }
      _$jscoverage['/combo-loader.js'].lineData[499]++;
      if (visit75_499_1(visit76_499_2(currentComboUrls.length > maxFileNum) || visit77_499_3(getSentUrl().length > maxUrlLength))) {
        _$jscoverage['/combo-loader.js'].lineData[500]++;
        currentComboUrls.pop();
        _$jscoverage['/combo-loader.js'].lineData[501]++;
        currentComboMods.pop();
        _$jscoverage['/combo-loader.js'].lineData[502]++;
        pushComboUrl(getSentUrl());
        _$jscoverage['/combo-loader.js'].lineData[503]++;
        currentComboUrls = [];
        _$jscoverage['/combo-loader.js'].lineData[504]++;
        currentComboMods = [];
        _$jscoverage['/combo-loader.js'].lineData[505]++;
        commonPrefix = undefined;
        _$jscoverage['/combo-loader.js'].lineData[506]++;
        i--;
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[509]++;
    if (visit78_509_1(currentComboUrls.length)) {
      _$jscoverage['/combo-loader.js'].lineData[510]++;
      pushComboUrl(getSentUrl());
    }
    _$jscoverage['/combo-loader.js'].lineData[513]++;
    comboRes[type].push.apply(comboRes[type], res);
  }
  _$jscoverage['/combo-loader.js'].lineData[516]++;
  var type, prefix;
  _$jscoverage['/combo-loader.js'].lineData[517]++;
  var normals = comboMods.normals;
  _$jscoverage['/combo-loader.js'].lineData[518]++;
  var groups = comboMods.groups;
  _$jscoverage['/combo-loader.js'].lineData[519]++;
  var group;
  _$jscoverage['/combo-loader.js'].lineData[522]++;
  for (type in normals) {
    _$jscoverage['/combo-loader.js'].lineData[523]++;
    comboRes[type] = visit79_523_1(comboRes[type] || []);
    _$jscoverage['/combo-loader.js'].lineData[524]++;
    for (prefix in normals[type]) {
      _$jscoverage['/combo-loader.js'].lineData[525]++;
      processSamePrefixUrlMods(type, prefix, normals[type][prefix]);
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[528]++;
  for (type in groups) {
    _$jscoverage['/combo-loader.js'].lineData[529]++;
    comboRes[type] = visit80_529_1(comboRes[type] || []);
    _$jscoverage['/combo-loader.js'].lineData[530]++;
    for (group in groups[type]) {
      _$jscoverage['/combo-loader.js'].lineData[531]++;
      for (prefix in groups[type][group]) {
        _$jscoverage['/combo-loader.js'].lineData[532]++;
        processSamePrefixUrlMods(type, prefix, groups[type][group][prefix]);
      }
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[536]++;
  return comboRes;
}, 
  flush: function() {
  _$jscoverage['/combo-loader.js'].functionData[31]++;
  _$jscoverage['/combo-loader.js'].lineData[540]++;
  if (visit81_540_1(!this.callback)) {
    _$jscoverage['/combo-loader.js'].lineData[541]++;
    return;
  }
  _$jscoverage['/combo-loader.js'].lineData[543]++;
  var self = this, head = self.head, callback = self.callback;
  _$jscoverage['/combo-loader.js'].lineData[546]++;
  while (head) {
    _$jscoverage['/combo-loader.js'].lineData[547]++;
    var node = head.node, status = node.status;
    _$jscoverage['/combo-loader.js'].lineData[549]++;
    if (visit82_549_1(visit83_549_2(status >= LOADED) || visit84_549_3(status === ERROR))) {
      _$jscoverage['/combo-loader.js'].lineData[550]++;
      node.remove(self);
      _$jscoverage['/combo-loader.js'].lineData[551]++;
      head = self.head = head.next;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[553]++;
      return;
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[556]++;
  self.callback = null;
  _$jscoverage['/combo-loader.js'].lineData[557]++;
  callback();
}, 
  isCompleteLoading: function() {
  _$jscoverage['/combo-loader.js'].functionData[32]++;
  _$jscoverage['/combo-loader.js'].lineData[561]++;
  return !this.head;
}, 
  wait: function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[33]++;
  _$jscoverage['/combo-loader.js'].lineData[565]++;
  var self = this;
  _$jscoverage['/combo-loader.js'].lineData[566]++;
  if (visit85_566_1(!self.head)) {
    _$jscoverage['/combo-loader.js'].lineData[567]++;
    self.tail = self.head = {
  node: mod};
  } else {
    _$jscoverage['/combo-loader.js'].lineData[571]++;
    var newNode = {
  node: mod};
    _$jscoverage['/combo-loader.js'].lineData[574]++;
    self.tail.next = newNode;
    _$jscoverage['/combo-loader.js'].lineData[575]++;
    self.tail = newNode;
  }
}});
  _$jscoverage['/combo-loader.js'].lineData[580]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
