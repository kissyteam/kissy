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
  _$jscoverage['/combo-loader.js'].lineData[316] = 0;
  _$jscoverage['/combo-loader.js'].lineData[317] = 0;
  _$jscoverage['/combo-loader.js'].lineData[320] = 0;
  _$jscoverage['/combo-loader.js'].lineData[321] = 0;
  _$jscoverage['/combo-loader.js'].lineData[322] = 0;
  _$jscoverage['/combo-loader.js'].lineData[323] = 0;
  _$jscoverage['/combo-loader.js'].lineData[324] = 0;
  _$jscoverage['/combo-loader.js'].lineData[326] = 0;
  _$jscoverage['/combo-loader.js'].lineData[327] = 0;
  _$jscoverage['/combo-loader.js'].lineData[328] = 0;
  _$jscoverage['/combo-loader.js'].lineData[329] = 0;
  _$jscoverage['/combo-loader.js'].lineData[330] = 0;
  _$jscoverage['/combo-loader.js'].lineData[331] = 0;
  _$jscoverage['/combo-loader.js'].lineData[332] = 0;
  _$jscoverage['/combo-loader.js'].lineData[334] = 0;
  _$jscoverage['/combo-loader.js'].lineData[335] = 0;
  _$jscoverage['/combo-loader.js'].lineData[338] = 0;
  _$jscoverage['/combo-loader.js'].lineData[340] = 0;
  _$jscoverage['/combo-loader.js'].lineData[341] = 0;
  _$jscoverage['/combo-loader.js'].lineData[342] = 0;
  _$jscoverage['/combo-loader.js'].lineData[343] = 0;
  _$jscoverage['/combo-loader.js'].lineData[345] = 0;
  _$jscoverage['/combo-loader.js'].lineData[346] = 0;
  _$jscoverage['/combo-loader.js'].lineData[350] = 0;
  _$jscoverage['/combo-loader.js'].lineData[351] = 0;
  _$jscoverage['/combo-loader.js'].lineData[352] = 0;
  _$jscoverage['/combo-loader.js'].lineData[353] = 0;
  _$jscoverage['/combo-loader.js'].lineData[354] = 0;
  _$jscoverage['/combo-loader.js'].lineData[356] = 0;
  _$jscoverage['/combo-loader.js'].lineData[360] = 0;
  _$jscoverage['/combo-loader.js'].lineData[367] = 0;
  _$jscoverage['/combo-loader.js'].lineData[371] = 0;
  _$jscoverage['/combo-loader.js'].lineData[380] = 0;
  _$jscoverage['/combo-loader.js'].lineData[387] = 0;
  _$jscoverage['/combo-loader.js'].lineData[388] = 0;
  _$jscoverage['/combo-loader.js'].lineData[389] = 0;
  _$jscoverage['/combo-loader.js'].lineData[390] = 0;
  _$jscoverage['/combo-loader.js'].lineData[391] = 0;
  _$jscoverage['/combo-loader.js'].lineData[392] = 0;
  _$jscoverage['/combo-loader.js'].lineData[393] = 0;
  _$jscoverage['/combo-loader.js'].lineData[394] = 0;
  _$jscoverage['/combo-loader.js'].lineData[395] = 0;
  _$jscoverage['/combo-loader.js'].lineData[396] = 0;
  _$jscoverage['/combo-loader.js'].lineData[398] = 0;
  _$jscoverage['/combo-loader.js'].lineData[399] = 0;
  _$jscoverage['/combo-loader.js'].lineData[400] = 0;
  _$jscoverage['/combo-loader.js'].lineData[401] = 0;
  _$jscoverage['/combo-loader.js'].lineData[402] = 0;
  _$jscoverage['/combo-loader.js'].lineData[404] = 0;
  _$jscoverage['/combo-loader.js'].lineData[405] = 0;
  _$jscoverage['/combo-loader.js'].lineData[406] = 0;
  _$jscoverage['/combo-loader.js'].lineData[407] = 0;
  _$jscoverage['/combo-loader.js'].lineData[408] = 0;
  _$jscoverage['/combo-loader.js'].lineData[409] = 0;
  _$jscoverage['/combo-loader.js'].lineData[411] = 0;
  _$jscoverage['/combo-loader.js'].lineData[412] = 0;
  _$jscoverage['/combo-loader.js'].lineData[413] = 0;
  _$jscoverage['/combo-loader.js'].lineData[416] = 0;
  _$jscoverage['/combo-loader.js'].lineData[417] = 0;
  _$jscoverage['/combo-loader.js'].lineData[418] = 0;
  _$jscoverage['/combo-loader.js'].lineData[419] = 0;
  _$jscoverage['/combo-loader.js'].lineData[422] = 0;
  _$jscoverage['/combo-loader.js'].lineData[423] = 0;
  _$jscoverage['/combo-loader.js'].lineData[424] = 0;
  _$jscoverage['/combo-loader.js'].lineData[425] = 0;
  _$jscoverage['/combo-loader.js'].lineData[426] = 0;
  _$jscoverage['/combo-loader.js'].lineData[428] = 0;
  _$jscoverage['/combo-loader.js'].lineData[429] = 0;
  _$jscoverage['/combo-loader.js'].lineData[432] = 0;
  _$jscoverage['/combo-loader.js'].lineData[436] = 0;
  _$jscoverage['/combo-loader.js'].lineData[446] = 0;
  _$jscoverage['/combo-loader.js'].lineData[452] = 0;
  _$jscoverage['/combo-loader.js'].lineData[454] = 0;
  _$jscoverage['/combo-loader.js'].lineData[455] = 0;
  _$jscoverage['/combo-loader.js'].lineData[456] = 0;
  _$jscoverage['/combo-loader.js'].lineData[457] = 0;
  _$jscoverage['/combo-loader.js'].lineData[458] = 0;
  _$jscoverage['/combo-loader.js'].lineData[459] = 0;
  _$jscoverage['/combo-loader.js'].lineData[461] = 0;
  _$jscoverage['/combo-loader.js'].lineData[466] = 0;
  _$jscoverage['/combo-loader.js'].lineData[468] = 0;
  _$jscoverage['/combo-loader.js'].lineData[476] = 0;
  _$jscoverage['/combo-loader.js'].lineData[477] = 0;
  _$jscoverage['/combo-loader.js'].lineData[481] = 0;
  _$jscoverage['/combo-loader.js'].lineData[482] = 0;
  _$jscoverage['/combo-loader.js'].lineData[483] = 0;
  _$jscoverage['/combo-loader.js'].lineData[484] = 0;
  _$jscoverage['/combo-loader.js'].lineData[487] = 0;
  _$jscoverage['/combo-loader.js'].lineData[493] = 0;
  _$jscoverage['/combo-loader.js'].lineData[497] = 0;
  _$jscoverage['/combo-loader.js'].lineData[498] = 0;
  _$jscoverage['/combo-loader.js'].lineData[499] = 0;
  _$jscoverage['/combo-loader.js'].lineData[501] = 0;
  _$jscoverage['/combo-loader.js'].lineData[502] = 0;
  _$jscoverage['/combo-loader.js'].lineData[503] = 0;
  _$jscoverage['/combo-loader.js'].lineData[504] = 0;
  _$jscoverage['/combo-loader.js'].lineData[505] = 0;
  _$jscoverage['/combo-loader.js'].lineData[506] = 0;
  _$jscoverage['/combo-loader.js'].lineData[510] = 0;
  _$jscoverage['/combo-loader.js'].lineData[511] = 0;
  _$jscoverage['/combo-loader.js'].lineData[512] = 0;
  _$jscoverage['/combo-loader.js'].lineData[513] = 0;
  _$jscoverage['/combo-loader.js'].lineData[514] = 0;
  _$jscoverage['/combo-loader.js'].lineData[515] = 0;
  _$jscoverage['/combo-loader.js'].lineData[516] = 0;
  _$jscoverage['/combo-loader.js'].lineData[517] = 0;
  _$jscoverage['/combo-loader.js'].lineData[520] = 0;
  _$jscoverage['/combo-loader.js'].lineData[521] = 0;
  _$jscoverage['/combo-loader.js'].lineData[524] = 0;
  _$jscoverage['/combo-loader.js'].lineData[527] = 0;
  _$jscoverage['/combo-loader.js'].lineData[528] = 0;
  _$jscoverage['/combo-loader.js'].lineData[529] = 0;
  _$jscoverage['/combo-loader.js'].lineData[530] = 0;
  _$jscoverage['/combo-loader.js'].lineData[533] = 0;
  _$jscoverage['/combo-loader.js'].lineData[534] = 0;
  _$jscoverage['/combo-loader.js'].lineData[535] = 0;
  _$jscoverage['/combo-loader.js'].lineData[536] = 0;
  _$jscoverage['/combo-loader.js'].lineData[539] = 0;
  _$jscoverage['/combo-loader.js'].lineData[540] = 0;
  _$jscoverage['/combo-loader.js'].lineData[541] = 0;
  _$jscoverage['/combo-loader.js'].lineData[542] = 0;
  _$jscoverage['/combo-loader.js'].lineData[543] = 0;
  _$jscoverage['/combo-loader.js'].lineData[547] = 0;
  _$jscoverage['/combo-loader.js'].lineData[551] = 0;
  _$jscoverage['/combo-loader.js'].lineData[552] = 0;
  _$jscoverage['/combo-loader.js'].lineData[554] = 0;
  _$jscoverage['/combo-loader.js'].lineData[557] = 0;
  _$jscoverage['/combo-loader.js'].lineData[558] = 0;
  _$jscoverage['/combo-loader.js'].lineData[560] = 0;
  _$jscoverage['/combo-loader.js'].lineData[561] = 0;
  _$jscoverage['/combo-loader.js'].lineData[562] = 0;
  _$jscoverage['/combo-loader.js'].lineData[564] = 0;
  _$jscoverage['/combo-loader.js'].lineData[567] = 0;
  _$jscoverage['/combo-loader.js'].lineData[568] = 0;
  _$jscoverage['/combo-loader.js'].lineData[572] = 0;
  _$jscoverage['/combo-loader.js'].lineData[576] = 0;
  _$jscoverage['/combo-loader.js'].lineData[577] = 0;
  _$jscoverage['/combo-loader.js'].lineData[578] = 0;
  _$jscoverage['/combo-loader.js'].lineData[582] = 0;
  _$jscoverage['/combo-loader.js'].lineData[585] = 0;
  _$jscoverage['/combo-loader.js'].lineData[586] = 0;
  _$jscoverage['/combo-loader.js'].lineData[591] = 0;
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
  _$jscoverage['/combo-loader.js'].branchData['312'] = [];
  _$jscoverage['/combo-loader.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['316'] = [];
  _$jscoverage['/combo-loader.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['321'] = [];
  _$jscoverage['/combo-loader.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['326'] = [];
  _$jscoverage['/combo-loader.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['329'] = [];
  _$jscoverage['/combo-loader.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['329'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['330'] = [];
  _$jscoverage['/combo-loader.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['338'] = [];
  _$jscoverage['/combo-loader.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['340'] = [];
  _$jscoverage['/combo-loader.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['352'] = [];
  _$jscoverage['/combo-loader.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['353'] = [];
  _$jscoverage['/combo-loader.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['387'] = [];
  _$jscoverage['/combo-loader.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['398'] = [];
  _$jscoverage['/combo-loader.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['399'] = [];
  _$jscoverage['/combo-loader.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['401'] = [];
  _$jscoverage['/combo-loader.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['405'] = [];
  _$jscoverage['/combo-loader.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['408'] = [];
  _$jscoverage['/combo-loader.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['408'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['416'] = [];
  _$jscoverage['/combo-loader.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['419'] = [];
  _$jscoverage['/combo-loader.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['422'] = [];
  _$jscoverage['/combo-loader.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['423'] = [];
  _$jscoverage['/combo-loader.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['426'] = [];
  _$jscoverage['/combo-loader.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['428'] = [];
  _$jscoverage['/combo-loader.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['428'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['481'] = [];
  _$jscoverage['/combo-loader.js'].branchData['481'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['484'] = [];
  _$jscoverage['/combo-loader.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['501'] = [];
  _$jscoverage['/combo-loader.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['502'] = [];
  _$jscoverage['/combo-loader.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['503'] = [];
  _$jscoverage['/combo-loader.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['505'] = [];
  _$jscoverage['/combo-loader.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['510'] = [];
  _$jscoverage['/combo-loader.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['510'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['510'][3] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['520'] = [];
  _$jscoverage['/combo-loader.js'].branchData['520'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['534'] = [];
  _$jscoverage['/combo-loader.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['540'] = [];
  _$jscoverage['/combo-loader.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['551'] = [];
  _$jscoverage['/combo-loader.js'].branchData['551'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['560'] = [];
  _$jscoverage['/combo-loader.js'].branchData['560'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['560'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['560'][3] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['577'] = [];
  _$jscoverage['/combo-loader.js'].branchData['577'][1] = new BranchData();
}
_$jscoverage['/combo-loader.js'].branchData['577'][1].init(48, 10, '!self.head');
function visit87_577_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['560'][3].init(124, 16, 'status === ERROR');
function visit86_560_3(result) {
  _$jscoverage['/combo-loader.js'].branchData['560'][3].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['560'][2].init(104, 16, 'status >= LOADED');
function visit85_560_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['560'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['560'][1].init(104, 36, 'status >= LOADED || status === ERROR');
function visit84_560_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['551'][1].init(18, 14, '!this.callback');
function visit83_551_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['551'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['540'][1].init(35, 20, 'comboRes[type] || []');
function visit82_540_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['534'][1].init(35, 20, 'comboRes[type] || []');
function visit81_534_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['520'][1].init(2828, 23, 'currentComboUrls.length');
function visit80_520_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['510'][3].init(1320, 34, 'getSentUrl().length > maxUrlLength');
function visit79_510_3(result) {
  _$jscoverage['/combo-loader.js'].branchData['510'][3].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['510'][2].init(1280, 36, 'currentComboUrls.length > maxFileNum');
function visit78_510_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['510'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['510'][1].init(1280, 74, 'currentComboUrls.length > maxFileNum || getSentUrl().length > maxUrlLength');
function visit77_510_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['505'][1].init(114, 20, 'commonPrefix === \'/\'');
function visit76_505_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['503'][1].init(996, 19, 'commonPrefix !== \'\'');
function visit75_503_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['502'][1].init(41, 27, 'subPath.indexOf(\'/\') !== -1');
function visit74_502_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['501'][1].init(849, 26, 'commonPrefix === undefined');
function visit73_501_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['484'][1].init(129, 157, '!currentMod.getPackage().isCombine() || !Utils.startsWith(url, basePrefix)');
function visit72_484_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['481'][1].init(1052, 19, 'i < sendMods.length');
function visit71_481_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['428'][2].init(37, 19, 'tag !== tmpMods.tag');
function visit70_428_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['428'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['428'][1].init(30, 26, 'tag && tag !== tmpMods.tag');
function visit69_428_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['426'][1].init(158, 9, 'tag || \'\'');
function visit68_426_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['423'][1].init(104, 37, '!(tmpMods = normalTypes[packageBase])');
function visit67_423_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['422'][1].init(40, 37, 'normals[type] || (normals[type] = {})');
function visit66_422_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['419'][1].init(159, 9, 'tag || \'\'');
function visit65_419_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['416'][1].init(975, 5, '!find');
function visit64_416_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['408'][2].init(176, 19, 'tag !== tmpMods.tag');
function visit63_408_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['408'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['408'][1].init(169, 26, 'tag && tag !== tmpMods.tag');
function visit62_408_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['405'][1].init(30, 41, 'Utils.isSameOriginAs(prefix, packageBase)');
function visit61_405_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['401'][1].init(165, 45, 'typeGroups[group] || (typeGroups[group] = {})');
function visit60_401_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['399'][1].init(39, 35, 'groups[type] || (groups[type] = {})');
function visit59_399_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['398'][1].init(434, 32, 'packageInfo.isCombine() && group');
function visit58_398_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['387'][1].init(595, 5, 'i < l');
function visit57_387_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['353'][1].init(48, 17, 'si < stack.length');
function visit56_353_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['352'][1].init(1518, 9, '\'@DEBUG@\'');
function visit55_352_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['340'][1].init(94, 8, 'stack[m]');
function visit54_340_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['338'][1].init(933, 9, '\'@DEBUG@\'');
function visit53_338_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['330'][1].init(26, 21, 'modStatus !== LOADING');
function visit52_330_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['329'][2].init(612, 20, 'modStatus !== LOADED');
function visit51_329_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['329'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['329'][1].init(612, 43, 'modStatus !== LOADED && !mod.contains(self)');
function visit50_329_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['326'][1].init(495, 18, 'modStatus > LOADED');
function visit49_326_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['321'][1].init(324, 19, 'modStatus === ERROR');
function visit48_321_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['316'][1].init(180, 9, '\'@DEBUG@\'');
function visit47_316_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['312'][1].init(95, 8, 'cache[m]');
function visit46_312_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['312'][1].ranCondition(result);
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
    mod = unloadedMods[i];
    _$jscoverage['/combo-loader.js'].lineData[310]++;
    m = mod.name;
    _$jscoverage['/combo-loader.js'].lineData[312]++;
    if (visit46_312_1(cache[m])) {
      _$jscoverage['/combo-loader.js'].lineData[313]++;
      continue;
    }
    _$jscoverage['/combo-loader.js'].lineData[316]++;
    if (visit47_316_1('@DEBUG@')) {
      _$jscoverage['/combo-loader.js'].lineData[317]++;
      stackDepth = stack.length;
    }
    _$jscoverage['/combo-loader.js'].lineData[320]++;
    modStatus = mod.status;
    _$jscoverage['/combo-loader.js'].lineData[321]++;
    if (visit48_321_1(modStatus === ERROR)) {
      _$jscoverage['/combo-loader.js'].lineData[322]++;
      errorList.push(mod);
      _$jscoverage['/combo-loader.js'].lineData[323]++;
      cache[m] = 1;
      _$jscoverage['/combo-loader.js'].lineData[324]++;
      continue;
    }
    _$jscoverage['/combo-loader.js'].lineData[326]++;
    if (visit49_326_1(modStatus > LOADED)) {
      _$jscoverage['/combo-loader.js'].lineData[327]++;
      cache[m] = 1;
      _$jscoverage['/combo-loader.js'].lineData[328]++;
      continue;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[329]++;
      if (visit50_329_1(visit51_329_2(modStatus !== LOADED) && !mod.contains(self))) {
        _$jscoverage['/combo-loader.js'].lineData[330]++;
        if (visit52_330_1(modStatus !== LOADING)) {
          _$jscoverage['/combo-loader.js'].lineData[331]++;
          mod.status = LOADING;
          _$jscoverage['/combo-loader.js'].lineData[332]++;
          ret.push(mod);
        }
        _$jscoverage['/combo-loader.js'].lineData[334]++;
        mod.add(self);
        _$jscoverage['/combo-loader.js'].lineData[335]++;
        self.wait(mod);
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[338]++;
    if (visit53_338_1('@DEBUG@')) {
      _$jscoverage['/combo-loader.js'].lineData[340]++;
      if (visit54_340_1(stack[m])) {
        _$jscoverage['/combo-loader.js'].lineData[341]++;
        S.log('find cyclic dependency between mods: ' + stack, 'warn');
        _$jscoverage['/combo-loader.js'].lineData[342]++;
        cache[m] = 1;
        _$jscoverage['/combo-loader.js'].lineData[343]++;
        continue;
      } else {
        _$jscoverage['/combo-loader.js'].lineData[345]++;
        stack[m] = 1;
        _$jscoverage['/combo-loader.js'].lineData[346]++;
        stack.push(m);
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[350]++;
    self.calculate(mod.getNormalizedRequiredModules(), errorList, stack, cache, ret);
    _$jscoverage['/combo-loader.js'].lineData[351]++;
    cache[m] = 1;
    _$jscoverage['/combo-loader.js'].lineData[352]++;
    if (visit55_352_1('@DEBUG@')) {
      _$jscoverage['/combo-loader.js'].lineData[353]++;
      for (var si = stackDepth; visit56_353_1(si < stack.length); si++) {
        _$jscoverage['/combo-loader.js'].lineData[354]++;
        stack[stack[si]] = 0;
      }
      _$jscoverage['/combo-loader.js'].lineData[356]++;
      stack.length = stackDepth;
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[360]++;
  return ret;
}, 
  getComboMods: function(mods) {
  _$jscoverage['/combo-loader.js'].functionData[25]++;
  _$jscoverage['/combo-loader.js'].lineData[367]++;
  var i, l = mods.length, tmpMods, mod, packageInfo, type, tag, charset, packageBase, packageName, group, modUrl;
  _$jscoverage['/combo-loader.js'].lineData[371]++;
  var groups = {};
  _$jscoverage['/combo-loader.js'].lineData[380]++;
  var normals = {};
  _$jscoverage['/combo-loader.js'].lineData[387]++;
  for (i = 0; visit57_387_1(i < l); ++i) {
    _$jscoverage['/combo-loader.js'].lineData[388]++;
    mod = mods[i];
    _$jscoverage['/combo-loader.js'].lineData[389]++;
    type = mod.getType();
    _$jscoverage['/combo-loader.js'].lineData[390]++;
    modUrl = mod.getUrl();
    _$jscoverage['/combo-loader.js'].lineData[391]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/combo-loader.js'].lineData[392]++;
    packageBase = packageInfo.getBase();
    _$jscoverage['/combo-loader.js'].lineData[393]++;
    packageName = packageInfo.name;
    _$jscoverage['/combo-loader.js'].lineData[394]++;
    charset = packageInfo.getCharset();
    _$jscoverage['/combo-loader.js'].lineData[395]++;
    tag = packageInfo.getTag();
    _$jscoverage['/combo-loader.js'].lineData[396]++;
    group = packageInfo.getGroup();
    _$jscoverage['/combo-loader.js'].lineData[398]++;
    if (visit58_398_1(packageInfo.isCombine() && group)) {
      _$jscoverage['/combo-loader.js'].lineData[399]++;
      var typeGroups = visit59_399_1(groups[type] || (groups[type] = {}));
      _$jscoverage['/combo-loader.js'].lineData[400]++;
      group = group + '-' + charset;
      _$jscoverage['/combo-loader.js'].lineData[401]++;
      var typeGroup = visit60_401_1(typeGroups[group] || (typeGroups[group] = {}));
      _$jscoverage['/combo-loader.js'].lineData[402]++;
      var find = 0;
      _$jscoverage['/combo-loader.js'].lineData[404]++;
      Utils.each(typeGroup, function(tmpMods, prefix) {
  _$jscoverage['/combo-loader.js'].functionData[26]++;
  _$jscoverage['/combo-loader.js'].lineData[405]++;
  if (visit61_405_1(Utils.isSameOriginAs(prefix, packageBase))) {
    _$jscoverage['/combo-loader.js'].lineData[406]++;
    var newPrefix = getCommonPathPrefix(prefix, packageBase);
    _$jscoverage['/combo-loader.js'].lineData[407]++;
    tmpMods.push(mod);
    _$jscoverage['/combo-loader.js'].lineData[408]++;
    if (visit62_408_1(tag && visit63_408_2(tag !== tmpMods.tag))) {
      _$jscoverage['/combo-loader.js'].lineData[409]++;
      tmpMods.tag = getHash(tmpMods.tag + tag);
    }
    _$jscoverage['/combo-loader.js'].lineData[411]++;
    delete typeGroup[prefix];
    _$jscoverage['/combo-loader.js'].lineData[412]++;
    typeGroup[newPrefix] = tmpMods;
    _$jscoverage['/combo-loader.js'].lineData[413]++;
    find = 1;
  }
});
      _$jscoverage['/combo-loader.js'].lineData[416]++;
      if (visit64_416_1(!find)) {
        _$jscoverage['/combo-loader.js'].lineData[417]++;
        tmpMods = typeGroup[packageBase] = [mod];
        _$jscoverage['/combo-loader.js'].lineData[418]++;
        tmpMods.charset = charset;
        _$jscoverage['/combo-loader.js'].lineData[419]++;
        tmpMods.tag = visit65_419_1(tag || '');
      }
    } else {
      _$jscoverage['/combo-loader.js'].lineData[422]++;
      var normalTypes = visit66_422_1(normals[type] || (normals[type] = {}));
      _$jscoverage['/combo-loader.js'].lineData[423]++;
      if (visit67_423_1(!(tmpMods = normalTypes[packageBase]))) {
        _$jscoverage['/combo-loader.js'].lineData[424]++;
        tmpMods = normalTypes[packageBase] = [];
        _$jscoverage['/combo-loader.js'].lineData[425]++;
        tmpMods.charset = charset;
        _$jscoverage['/combo-loader.js'].lineData[426]++;
        tmpMods.tag = visit68_426_1(tag || '');
      } else {
        _$jscoverage['/combo-loader.js'].lineData[428]++;
        if (visit69_428_1(tag && visit70_428_2(tag !== tmpMods.tag))) {
          _$jscoverage['/combo-loader.js'].lineData[429]++;
          tmpMods.tag = getHash(tmpMods.tag + tag);
        }
      }
      _$jscoverage['/combo-loader.js'].lineData[432]++;
      tmpMods.push(mod);
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[436]++;
  return {
  groups: groups, 
  normals: normals};
}, 
  getComboUrls: function(mods) {
  _$jscoverage['/combo-loader.js'].functionData[27]++;
  _$jscoverage['/combo-loader.js'].lineData[446]++;
  var comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, comboRes = {}, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/combo-loader.js'].lineData[452]++;
  var comboMods = this.getComboMods(mods);
  _$jscoverage['/combo-loader.js'].lineData[454]++;
  function processSamePrefixUrlMods(type, basePrefix, sendMods) {
    _$jscoverage['/combo-loader.js'].functionData[28]++;
    _$jscoverage['/combo-loader.js'].lineData[455]++;
    var currentComboUrls = [];
    _$jscoverage['/combo-loader.js'].lineData[456]++;
    var currentComboMods = [];
    _$jscoverage['/combo-loader.js'].lineData[457]++;
    var tag = sendMods.tag;
    _$jscoverage['/combo-loader.js'].lineData[458]++;
    var charset = sendMods.charset;
    _$jscoverage['/combo-loader.js'].lineData[459]++;
    var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : '');
    _$jscoverage['/combo-loader.js'].lineData[461]++;
    var baseLen = basePrefix.length, commonPrefix, res = [];
    _$jscoverage['/combo-loader.js'].lineData[466]++;
    function pushComboUrl(sentUrl) {
      _$jscoverage['/combo-loader.js'].functionData[29]++;
      _$jscoverage['/combo-loader.js'].lineData[468]++;
      res.push({
  combine: 1, 
  url: sentUrl, 
  charset: charset, 
  mods: currentComboMods});
    }
    _$jscoverage['/combo-loader.js'].lineData[476]++;
    function getSentUrl() {
      _$jscoverage['/combo-loader.js'].functionData[30]++;
      _$jscoverage['/combo-loader.js'].lineData[477]++;
      return getUrlConsiderCommonPrefix(commonPrefix, currentComboUrls, basePrefix, comboPrefix, comboSep, suffix);
    }
    _$jscoverage['/combo-loader.js'].lineData[481]++;
    for (var i = 0; visit71_481_1(i < sendMods.length); i++) {
      _$jscoverage['/combo-loader.js'].lineData[482]++;
      var currentMod = sendMods[i];
      _$jscoverage['/combo-loader.js'].lineData[483]++;
      var url = currentMod.getUrl();
      _$jscoverage['/combo-loader.js'].lineData[484]++;
      if (visit72_484_1(!currentMod.getPackage().isCombine() || !Utils.startsWith(url, basePrefix))) {
        _$jscoverage['/combo-loader.js'].lineData[487]++;
        res.push({
  combine: 0, 
  url: url, 
  charset: charset, 
  mods: [currentMod]});
        _$jscoverage['/combo-loader.js'].lineData[493]++;
        continue;
      }
      _$jscoverage['/combo-loader.js'].lineData[497]++;
      var subPath = url.slice(baseLen).replace(/\?.*$/, '');
      _$jscoverage['/combo-loader.js'].lineData[498]++;
      currentComboUrls.push(subPath);
      _$jscoverage['/combo-loader.js'].lineData[499]++;
      currentComboMods.push(currentMod);
      _$jscoverage['/combo-loader.js'].lineData[501]++;
      if (visit73_501_1(commonPrefix === undefined)) {
        _$jscoverage['/combo-loader.js'].lineData[502]++;
        commonPrefix = visit74_502_1(subPath.indexOf('/') !== -1) ? subPath : '';
      } else {
        _$jscoverage['/combo-loader.js'].lineData[503]++;
        if (visit75_503_1(commonPrefix !== '')) {
          _$jscoverage['/combo-loader.js'].lineData[504]++;
          commonPrefix = getCommonPathPrefix(commonPrefix, subPath);
          _$jscoverage['/combo-loader.js'].lineData[505]++;
          if (visit76_505_1(commonPrefix === '/')) {
            _$jscoverage['/combo-loader.js'].lineData[506]++;
            commonPrefix = '';
          }
        }
      }
      _$jscoverage['/combo-loader.js'].lineData[510]++;
      if (visit77_510_1(visit78_510_2(currentComboUrls.length > maxFileNum) || visit79_510_3(getSentUrl().length > maxUrlLength))) {
        _$jscoverage['/combo-loader.js'].lineData[511]++;
        currentComboUrls.pop();
        _$jscoverage['/combo-loader.js'].lineData[512]++;
        currentComboMods.pop();
        _$jscoverage['/combo-loader.js'].lineData[513]++;
        pushComboUrl(getSentUrl());
        _$jscoverage['/combo-loader.js'].lineData[514]++;
        currentComboUrls = [];
        _$jscoverage['/combo-loader.js'].lineData[515]++;
        currentComboMods = [];
        _$jscoverage['/combo-loader.js'].lineData[516]++;
        commonPrefix = undefined;
        _$jscoverage['/combo-loader.js'].lineData[517]++;
        i--;
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[520]++;
    if (visit80_520_1(currentComboUrls.length)) {
      _$jscoverage['/combo-loader.js'].lineData[521]++;
      pushComboUrl(getSentUrl());
    }
    _$jscoverage['/combo-loader.js'].lineData[524]++;
    comboRes[type].push.apply(comboRes[type], res);
  }
  _$jscoverage['/combo-loader.js'].lineData[527]++;
  var type, prefix;
  _$jscoverage['/combo-loader.js'].lineData[528]++;
  var normals = comboMods.normals;
  _$jscoverage['/combo-loader.js'].lineData[529]++;
  var groups = comboMods.groups;
  _$jscoverage['/combo-loader.js'].lineData[530]++;
  var group;
  _$jscoverage['/combo-loader.js'].lineData[533]++;
  for (type in normals) {
    _$jscoverage['/combo-loader.js'].lineData[534]++;
    comboRes[type] = visit81_534_1(comboRes[type] || []);
    _$jscoverage['/combo-loader.js'].lineData[535]++;
    for (prefix in normals[type]) {
      _$jscoverage['/combo-loader.js'].lineData[536]++;
      processSamePrefixUrlMods(type, prefix, normals[type][prefix]);
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[539]++;
  for (type in groups) {
    _$jscoverage['/combo-loader.js'].lineData[540]++;
    comboRes[type] = visit82_540_1(comboRes[type] || []);
    _$jscoverage['/combo-loader.js'].lineData[541]++;
    for (group in groups[type]) {
      _$jscoverage['/combo-loader.js'].lineData[542]++;
      for (prefix in groups[type][group]) {
        _$jscoverage['/combo-loader.js'].lineData[543]++;
        processSamePrefixUrlMods(type, prefix, groups[type][group][prefix]);
      }
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[547]++;
  return comboRes;
}, 
  flush: function() {
  _$jscoverage['/combo-loader.js'].functionData[31]++;
  _$jscoverage['/combo-loader.js'].lineData[551]++;
  if (visit83_551_1(!this.callback)) {
    _$jscoverage['/combo-loader.js'].lineData[552]++;
    return;
  }
  _$jscoverage['/combo-loader.js'].lineData[554]++;
  var self = this, head = self.head, callback = self.callback;
  _$jscoverage['/combo-loader.js'].lineData[557]++;
  while (head) {
    _$jscoverage['/combo-loader.js'].lineData[558]++;
    var node = head.node, status = node.status;
    _$jscoverage['/combo-loader.js'].lineData[560]++;
    if (visit84_560_1(visit85_560_2(status >= LOADED) || visit86_560_3(status === ERROR))) {
      _$jscoverage['/combo-loader.js'].lineData[561]++;
      node.remove(self);
      _$jscoverage['/combo-loader.js'].lineData[562]++;
      head = self.head = head.next;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[564]++;
      return;
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[567]++;
  self.callback = null;
  _$jscoverage['/combo-loader.js'].lineData[568]++;
  callback();
}, 
  isCompleteLoading: function() {
  _$jscoverage['/combo-loader.js'].functionData[32]++;
  _$jscoverage['/combo-loader.js'].lineData[572]++;
  return !this.head;
}, 
  wait: function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[33]++;
  _$jscoverage['/combo-loader.js'].lineData[576]++;
  var self = this;
  _$jscoverage['/combo-loader.js'].lineData[577]++;
  if (visit87_577_1(!self.head)) {
    _$jscoverage['/combo-loader.js'].lineData[578]++;
    self.tail = self.head = {
  node: mod};
  } else {
    _$jscoverage['/combo-loader.js'].lineData[582]++;
    var newNode = {
  node: mod};
    _$jscoverage['/combo-loader.js'].lineData[585]++;
    self.tail.next = newNode;
    _$jscoverage['/combo-loader.js'].lineData[586]++;
    self.tail = newNode;
  }
}});
  _$jscoverage['/combo-loader.js'].lineData[591]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
