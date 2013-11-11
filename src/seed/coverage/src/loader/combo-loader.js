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
  _$jscoverage['/loader/combo-loader.js'].lineData[46] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[47] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[48] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[49] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[54] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[58] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[69] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[78] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[79] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[85] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[86] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[87] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[89] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[92] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[93] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[95] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[96] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[99] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[103] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[105] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[106] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[112] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[113] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[115] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[116] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[117] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[120] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[123] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[124] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[127] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[128] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[129] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[130] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[132] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[134] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[135] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[136] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[139] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[145] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[146] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[147] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[149] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[151] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[152] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[158] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[159] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[165] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[166] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[167] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[168] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[169] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[172] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[173] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[180] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[181] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[182] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[184] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[187] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[188] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[189] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[190] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[191] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[192] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[195] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[196] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[201] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[202] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[203] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[204] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[205] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[206] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[207] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[210] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[213] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[218] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[224] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[226] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[228] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[231] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[232] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[233] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[234] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[237] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[238] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[239] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[241] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[245] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[246] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[247] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[250] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[251] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[253] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[260] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[261] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[262] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[263] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[266] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[267] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[270] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[271] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[274] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[275] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[278] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[289] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[297] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[300] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[302] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[303] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[304] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[305] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[307] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[308] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[309] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[310] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[311] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[313] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[314] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[315] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[316] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[317] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[319] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[320] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[322] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[324] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[327] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[330] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[337] = 0;
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
  _$jscoverage['/loader/combo-loader.js'].lineData[356] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[357] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[359] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[361] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[364] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[366] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[367] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[368] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[369] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[372] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[373] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[376] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[379] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[382] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[383] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[384] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[385] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[386] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[388] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[391] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[394] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[397] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[404] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[411] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[413] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[415] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[418] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[419] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[420] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[421] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[422] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[423] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[424] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[425] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[427] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[434] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[435] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[436] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[438] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[441] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[450] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[451] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[452] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[454] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[455] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[456] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[461] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[464] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[465] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[466] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[468] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[470] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[471] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[472] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[473] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[474] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[475] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[478] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[479] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[483] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[487] = 0;
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
  _$jscoverage['/loader/combo-loader.js'].functionData[30] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[31] = 0;
}
if (! _$jscoverage['/loader/combo-loader.js'].branchData) {
  _$jscoverage['/loader/combo-loader.js'].branchData = {};
  _$jscoverage['/loader/combo-loader.js'].branchData['8'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][2] = new BranchData();
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
  _$jscoverage['/loader/combo-loader.js'].branchData['46'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['95'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['105'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['105'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['105'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['115'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['116'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['124'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['124'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['126'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['130'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['145'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['165'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['167'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['172'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['191'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['195'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['205'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['206'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['233'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['262'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['270'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['297'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['300'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['302'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['304'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['310'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['310'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['310'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['313'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['314'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['315'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['346'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['361'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['361'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['367'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['368'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['382'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['383'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['388'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['388'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['388'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['425'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['450'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['455'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['468'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['468'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['469'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['478'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['478'][1] = new BranchData();
}
_$jscoverage['/loader/combo-loader.js'].branchData['478'][1].init(2808, 23, 'currentComboUrls.length');
function visit359_478_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['478'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['469'][1].init(69, 72, 'l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength');
function visit358_469_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['468'][2].init(845, 36, 'currentComboUrls.length > maxFileNum');
function visit357_468_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['468'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['468'][1].init(845, 143, 'currentComboUrls.length > maxFileNum || (l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)');
function visit356_468_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['455'][1].init(249, 25, '!currentMod.canBeCombined');
function visit355_455_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['450'][1].init(1429, 15, 'i < mods.length');
function visit354_450_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['425'][1].init(231, 15, 'tags.length > 1');
function visit353_425_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['388'][3].init(51, 19, 'mods.tags[0] == tag');
function visit352_388_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['388'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['388'][2].init(26, 21, 'mods.tags.length == 1');
function visit351_388_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['388'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['388'][1].init(26, 44, 'mods.tags.length == 1 && mods.tags[0] == tag');
function visit350_388_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['383'][1].init(1830, 32, '!(mods = typedCombos[comboName])');
function visit349_383_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['382'][1].init(1786, 21, 'comboMods[type] || {}');
function visit348_382_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['368'][1].init(30, 41, 'groupPrefixUri.isSameOriginAs(packageUri)');
function visit347_368_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['367'][1].init(188, 41, 'groupPrefixUri = comboPrefixes[comboName]');
function visit346_367_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['361'][2].init(764, 83, 'packageInfo.isCombine() && S.startsWith(fullpath, packagePath)');
function visit345_361_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['361'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['361'][1].init(744, 113, '(mod.canBeCombined = packageInfo.isCombine() && S.startsWith(fullpath, packagePath)) && group');
function visit344_361_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['346'][1].init(348, 5, 'i < l');
function visit343_346_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['315'][1].init(30, 20, 'modStatus != LOADING');
function visit342_315_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['314'][1].init(26, 27, '!waitingModules.contains(m)');
function visit341_314_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['313'][1].init(390, 19, 'modStatus != LOADED');
function visit340_313_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['310'][3].init(293, 22, 'modStatus === ATTACHED');
function visit339_310_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['310'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['310'][2].init(270, 19, 'modStatus === ERROR');
function visit338_310_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['310'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['310'][1].init(270, 45, 'modStatus === ERROR || modStatus === ATTACHED');
function visit337_310_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['304'][1].init(56, 8, 'cache[m]');
function visit336_304_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['302'][1].init(383, 19, 'i < modNames.length');
function visit335_302_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['300'][1].init(343, 11, 'cache || {}');
function visit334_300_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['297'][1].init(238, 9, 'ret || {}');
function visit333_297_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['270'][1].init(153, 7, '!mod.fn');
function visit332_270_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['262'][1].init(26, 9, '\'@DEBUG@\'');
function visit331_262_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['233'][1].init(26, 9, '\'@DEBUG@\'');
function visit330_233_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['206'][1].init(18, 19, 'str1[i] !== str2[i]');
function visit329_206_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['205'][1].init(147, 5, 'i < l');
function visit328_205_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['195'][1].init(205, 9, 'ms.length');
function visit327_195_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['191'][1].init(22, 18, 'm.status == LOADED');
function visit326_191_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['172'][1].init(386, 2, 're');
function visit325_172_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['167'][1].init(52, 34, 'script.readyState == \'interactive\'');
function visit324_167_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['165'][1].init(189, 6, 'i >= 0');
function visit323_165_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['145'][1].init(18, 5, 'oldIE');
function visit322_145_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['130'][1].init(121, 5, 'oldIE');
function visit321_130_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['126'][1].init(75, 21, 'arguments.length == 1');
function visit320_126_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['124'][2].init(14, 26, 'typeof name === \'function\'');
function visit319_124_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['124'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['124'][1].init(14, 97, 'typeof name === \'function\' || arguments.length == 1');
function visit318_124_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['116'][1].init(27, 12, 'config || {}');
function visit317_116_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['115'][1].init(452, 15, 'requires.length');
function visit316_115_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['105'][3].init(97, 23, 'typeof fn == \'function\'');
function visit315_105_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['105'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['105'][2].init(65, 27, '!config || !config.requires');
function visit314_105_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['105'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['105'][1].init(65, 55, '(!config || !config.requires) && typeof fn == \'function\'');
function visit313_105_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['95'][1].init(56, 43, 'm = str.match(/^\\s*["\']([^\'"\\s]+)["\']\\s*$/)');
function visit312_95_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['46'][1].init(167, 5, 'oldIE');
function visit311_46_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['43'][1].init(57, 22, 'mod.getType() == \'css\'');
function visit310_43_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['41'][1].init(831, 11, '!rs.combine');
function visit309_41_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['27'][1].init(69, 17, 'mod && currentMod');
function visit308_27_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['16'][1].init(18, 10, '!(--count)');
function visit307_16_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['11'][1].init(22, 17, 'rss && rss.length');
function visit306_11_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['8'][2].init(56, 12, 'S.UA.ie < 10');
function visit305_8_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['8'][1].init(45, 23, 'S.UA.ie && S.UA.ie < 10');
function visit304_8_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/combo-loader.js'].functionData[0]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[8]++;
  var oldIE = visit304_8_1(S.UA.ie && visit305_8_2(S.UA.ie < 10));
  _$jscoverage['/loader/combo-loader.js'].lineData[10]++;
  function loadScripts(runtime, rss, callback, charset, timeout) {
    _$jscoverage['/loader/combo-loader.js'].functionData[1]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[11]++;
    var count = visit306_11_1(rss && rss.length), errorList = [], successList = [];
    _$jscoverage['/loader/combo-loader.js'].lineData[15]++;
    function complete() {
      _$jscoverage['/loader/combo-loader.js'].functionData[2]++;
      _$jscoverage['/loader/combo-loader.js'].lineData[16]++;
      if (visit307_16_1(!(--count))) {
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
  if (visit308_27_1(mod && currentMod)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[29]++;
    logger.debug('standard browser get mod name after load : ' + mod.name);
    _$jscoverage['/loader/combo-loader.js'].lineData[30]++;
    Utils.registerModule(runtime, mod.name, currentMod.fn, currentMod.config);
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
  if (visit309_41_1(!rs.combine)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[42]++;
    mod = rs.mods[0];
    _$jscoverage['/loader/combo-loader.js'].lineData[43]++;
    if (visit310_43_1(mod.getType() == 'css')) {
      _$jscoverage['/loader/combo-loader.js'].lineData[44]++;
      mod = undefined;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[46]++;
      if (visit311_46_1(oldIE)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[47]++;
        startLoadModName = mod.name;
        _$jscoverage['/loader/combo-loader.js'].lineData[48]++;
        startLoadModTime = S.now();
        _$jscoverage['/loader/combo-loader.js'].lineData[49]++;
        config.attrs = {
  'data-mod-name': mod.name};
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[54]++;
  S.Config.loadModsFn(rs, config);
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[58]++;
  var Loader = S.Loader, logger = S.getLogger('s/loader'), Status = Loader.Status, Utils = Loader.Utils, getHash = Utils.getHash, LOADING = Status.LOADING, LOADED = Status.LOADED, ERROR = Status.ERROR, groupTag = S.now(), ATTACHED = Status.ATTACHED;
  _$jscoverage['/loader/combo-loader.js'].lineData[69]++;
  ComboLoader.groupTag = groupTag;
  _$jscoverage['/loader/combo-loader.js'].lineData[78]++;
  function ComboLoader(runtime, waitingModules) {
    _$jscoverage['/loader/combo-loader.js'].functionData[6]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[79]++;
    S.mix(this, {
  runtime: runtime, 
  waitingModules: waitingModules});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[85]++;
  var currentMod;
  _$jscoverage['/loader/combo-loader.js'].lineData[86]++;
  var startLoadModName;
  _$jscoverage['/loader/combo-loader.js'].lineData[87]++;
  var startLoadModTime;
  _$jscoverage['/loader/combo-loader.js'].lineData[89]++;
  var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, requireRegExp = /[^.'"]\s*KISSY.require\s*\((.+)\);/g;
  _$jscoverage['/loader/combo-loader.js'].lineData[92]++;
  function getRequireVal(str) {
    _$jscoverage['/loader/combo-loader.js'].functionData[7]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[93]++;
    var m;
    _$jscoverage['/loader/combo-loader.js'].lineData[95]++;
    if (visit312_95_1(m = str.match(/^\s*["']([^'"\s]+)["']\s*$/))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[96]++;
      return m[1];
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[99]++;
      return new Function('return (' + str + ')')();
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[103]++;
  function checkKISSYRequire(config, fn) {
    _$jscoverage['/loader/combo-loader.js'].functionData[8]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[105]++;
    if (visit313_105_1((visit314_105_2(!config || !config.requires)) && visit315_105_3(typeof fn == 'function'))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[106]++;
      var requires = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[112]++;
      fn.toString().replace(commentRegExp, '').replace(requireRegExp, function(match, dep) {
  _$jscoverage['/loader/combo-loader.js'].functionData[9]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[113]++;
  requires.push(getRequireVal(dep));
});
      _$jscoverage['/loader/combo-loader.js'].lineData[115]++;
      if (visit316_115_1(requires.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[116]++;
        config = visit317_116_1(config || {});
        _$jscoverage['/loader/combo-loader.js'].lineData[117]++;
        config.requires = requires;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[120]++;
    return config;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[123]++;
  ComboLoader.add = function(name, fn, config, runtime) {
  _$jscoverage['/loader/combo-loader.js'].functionData[10]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[124]++;
  if (visit318_124_1(visit319_124_2(typeof name === 'function') || visit320_126_1(arguments.length == 1))) {
    _$jscoverage['/loader/combo-loader.js'].lineData[127]++;
    config = fn;
    _$jscoverage['/loader/combo-loader.js'].lineData[128]++;
    fn = name;
    _$jscoverage['/loader/combo-loader.js'].lineData[129]++;
    config = checkKISSYRequire(config, fn);
    _$jscoverage['/loader/combo-loader.js'].lineData[130]++;
    if (visit321_130_1(oldIE)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[132]++;
      name = findModuleNameByInteractive();
      _$jscoverage['/loader/combo-loader.js'].lineData[134]++;
      Utils.registerModule(runtime, name, fn, config);
      _$jscoverage['/loader/combo-loader.js'].lineData[135]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[136]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[139]++;
      currentMod = {
  fn: fn, 
  config: config};
    }
  } else {
    _$jscoverage['/loader/combo-loader.js'].lineData[145]++;
    if (visit322_145_1(oldIE)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[146]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[147]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[149]++;
      currentMod = undefined;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[151]++;
    config = checkKISSYRequire(config, fn);
    _$jscoverage['/loader/combo-loader.js'].lineData[152]++;
    Utils.registerModule(runtime, name, fn, config);
  }
};
  _$jscoverage['/loader/combo-loader.js'].lineData[158]++;
  function findModuleNameByInteractive() {
    _$jscoverage['/loader/combo-loader.js'].functionData[11]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[159]++;
    var scripts = S.Env.host.document.getElementsByTagName('script'), re, i, name, script;
    _$jscoverage['/loader/combo-loader.js'].lineData[165]++;
    for (i = scripts.length - 1; visit323_165_1(i >= 0); i--) {
      _$jscoverage['/loader/combo-loader.js'].lineData[166]++;
      script = scripts[i];
      _$jscoverage['/loader/combo-loader.js'].lineData[167]++;
      if (visit324_167_1(script.readyState == 'interactive')) {
        _$jscoverage['/loader/combo-loader.js'].lineData[168]++;
        re = script;
        _$jscoverage['/loader/combo-loader.js'].lineData[169]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[172]++;
    if (visit325_172_1(re)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[173]++;
      name = re.getAttribute('data-mod-name');
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[180]++;
      logger.debug('can not find interactive script,time diff : ' + (S.now() - startLoadModTime));
      _$jscoverage['/loader/combo-loader.js'].lineData[181]++;
      logger.debug('old_ie get mod name from cache : ' + startLoadModName);
      _$jscoverage['/loader/combo-loader.js'].lineData[182]++;
      name = startLoadModName;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[184]++;
    return name;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[187]++;
  function debugRemoteModules(rss) {
    _$jscoverage['/loader/combo-loader.js'].functionData[12]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[188]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[13]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[189]++;
  var ms = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[190]++;
  S.each(rs.mods, function(m) {
  _$jscoverage['/loader/combo-loader.js'].functionData[14]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[191]++;
  if (visit326_191_1(m.status == LOADED)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[192]++;
    ms.push(m.name);
  }
});
  _$jscoverage['/loader/combo-loader.js'].lineData[195]++;
  if (visit327_195_1(ms.length)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[196]++;
    logger.info('load remote modules: "' + ms.join(', ') + '" from: "' + rs.fullpath + '"');
  }
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[201]++;
  function getCommonPrefix(str1, str2) {
    _$jscoverage['/loader/combo-loader.js'].functionData[15]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[202]++;
    str1 = str1.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[203]++;
    str2 = str2.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[204]++;
    var l = Math.min(str1.length, str2.length);
    _$jscoverage['/loader/combo-loader.js'].lineData[205]++;
    for (var i = 0; visit328_205_1(i < l); i++) {
      _$jscoverage['/loader/combo-loader.js'].lineData[206]++;
      if (visit329_206_1(str1[i] !== str2[i])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[207]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[210]++;
    return str1.slice(0, i).join('/') + '/';
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[213]++;
  S.augment(ComboLoader, {
  use: function(normalizedModNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[16]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[218]++;
  var self = this, allModNames, comboUrls, timeout = S.Config.timeout, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[224]++;
  allModNames = S.keys(self.calculate(normalizedModNames));
  _$jscoverage['/loader/combo-loader.js'].lineData[226]++;
  Utils.createModulesInfo(runtime, allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[228]++;
  comboUrls = self.getComboUrls(allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[231]++;
  S.each(comboUrls.css, function(cssOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[17]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[232]++;
  loadScripts(runtime, cssOne, function(success, error) {
  _$jscoverage['/loader/combo-loader.js'].functionData[18]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[233]++;
  if (visit330_233_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[234]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[237]++;
  S.each(success, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[19]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[238]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[20]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[239]++;
  Utils.registerModule(runtime, mod.getName(), S.noop);
  _$jscoverage['/loader/combo-loader.js'].lineData[241]++;
  mod.notifyAll();
});
});
  _$jscoverage['/loader/combo-loader.js'].lineData[245]++;
  S.each(error, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[21]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[246]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[22]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[247]++;
  var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[250]++;
  S.log(msg, 'error');
  _$jscoverage['/loader/combo-loader.js'].lineData[251]++;
  mod.status = ERROR;
  _$jscoverage['/loader/combo-loader.js'].lineData[253]++;
  mod.notifyAll();
});
});
}, cssOne.charset, timeout);
});
  _$jscoverage['/loader/combo-loader.js'].lineData[260]++;
  S.each(comboUrls['js'], function(jsOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[23]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[261]++;
  loadScripts(runtime, jsOne, function(success) {
  _$jscoverage['/loader/combo-loader.js'].functionData[24]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[262]++;
  if (visit331_262_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[263]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[266]++;
  S.each(jsOne, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[25]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[267]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[26]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[270]++;
  if (visit332_270_1(!mod.fn)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[271]++;
    var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
    _$jscoverage['/loader/combo-loader.js'].lineData[274]++;
    S.log(msg, 'error');
    _$jscoverage['/loader/combo-loader.js'].lineData[275]++;
    mod.status = ERROR;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[278]++;
  mod.notifyAll();
});
});
}, jsOne.charset, timeout);
});
}, 
  calculate: function(modNames, cache, ret) {
  _$jscoverage['/loader/combo-loader.js'].functionData[27]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[289]++;
  var i, m, mod, modStatus, self = this, waitingModules = self.waitingModules, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[297]++;
  ret = visit333_297_1(ret || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[300]++;
  cache = visit334_300_1(cache || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[302]++;
  for (i = 0; visit335_302_1(i < modNames.length); i++) {
    _$jscoverage['/loader/combo-loader.js'].lineData[303]++;
    m = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[304]++;
    if (visit336_304_1(cache[m])) {
      _$jscoverage['/loader/combo-loader.js'].lineData[305]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[307]++;
    cache[m] = 1;
    _$jscoverage['/loader/combo-loader.js'].lineData[308]++;
    mod = Utils.createModuleInfo(runtime, m);
    _$jscoverage['/loader/combo-loader.js'].lineData[309]++;
    modStatus = mod.status;
    _$jscoverage['/loader/combo-loader.js'].lineData[310]++;
    if (visit337_310_1(visit338_310_2(modStatus === ERROR) || visit339_310_3(modStatus === ATTACHED))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[311]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[313]++;
    if (visit340_313_1(modStatus != LOADED)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[314]++;
      if (visit341_314_1(!waitingModules.contains(m))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[315]++;
        if (visit342_315_1(modStatus != LOADING)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[316]++;
          mod.status = LOADING;
          _$jscoverage['/loader/combo-loader.js'].lineData[317]++;
          ret[m] = 1;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[319]++;
        mod.wait(function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[28]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[320]++;
  waitingModules.remove(mod.getName());
  _$jscoverage['/loader/combo-loader.js'].lineData[322]++;
  waitingModules.notifyAll();
});
        _$jscoverage['/loader/combo-loader.js'].lineData[324]++;
        waitingModules.add(m);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[327]++;
    self.calculate(mod.getNormalizedRequires(), cache, ret);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[330]++;
  return ret;
}, 
  getComboMods: function(modNames, comboPrefixes) {
  _$jscoverage['/loader/combo-loader.js'].functionData[29]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[337]++;
  var comboMods = {}, packageUri, runtime = this.runtime, i = 0, l = modNames.length, modName, mod, packageInfo, type, typedCombos, mods, tag, charset, packagePath, packageName, group, fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[346]++;
  for (; visit343_346_1(i < l); ++i) {
    _$jscoverage['/loader/combo-loader.js'].lineData[347]++;
    modName = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[348]++;
    mod = Utils.createModuleInfo(runtime, modName);
    _$jscoverage['/loader/combo-loader.js'].lineData[349]++;
    type = mod.getType();
    _$jscoverage['/loader/combo-loader.js'].lineData[350]++;
    fullpath = mod.getFullPath();
    _$jscoverage['/loader/combo-loader.js'].lineData[351]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/loader/combo-loader.js'].lineData[352]++;
    packageName = packageInfo.getName();
    _$jscoverage['/loader/combo-loader.js'].lineData[353]++;
    charset = packageInfo.getCharset();
    _$jscoverage['/loader/combo-loader.js'].lineData[354]++;
    tag = packageInfo.getTag();
    _$jscoverage['/loader/combo-loader.js'].lineData[355]++;
    group = packageInfo.getGroup();
    _$jscoverage['/loader/combo-loader.js'].lineData[356]++;
    packagePath = packageInfo.getPrefixUriForCombo();
    _$jscoverage['/loader/combo-loader.js'].lineData[357]++;
    packageUri = packageInfo.getPackageUri();
    _$jscoverage['/loader/combo-loader.js'].lineData[359]++;
    var comboName = packageName;
    _$jscoverage['/loader/combo-loader.js'].lineData[361]++;
    if (visit344_361_1((mod.canBeCombined = visit345_361_2(packageInfo.isCombine() && S.startsWith(fullpath, packagePath))) && group)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[364]++;
      comboName = group + '_' + charset + '_' + groupTag;
      _$jscoverage['/loader/combo-loader.js'].lineData[366]++;
      var groupPrefixUri;
      _$jscoverage['/loader/combo-loader.js'].lineData[367]++;
      if (visit346_367_1(groupPrefixUri = comboPrefixes[comboName])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[368]++;
        if (visit347_368_1(groupPrefixUri.isSameOriginAs(packageUri))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[369]++;
          groupPrefixUri.setPath(getCommonPrefix(groupPrefixUri.getPath(), packageUri.getPath()));
        } else {
          _$jscoverage['/loader/combo-loader.js'].lineData[372]++;
          comboName = packageName;
          _$jscoverage['/loader/combo-loader.js'].lineData[373]++;
          comboPrefixes[packageName] = packageUri;
        }
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[376]++;
        comboPrefixes[comboName] = packageUri.clone();
      }
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[379]++;
      comboPrefixes[packageName] = packageUri;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[382]++;
    typedCombos = comboMods[type] = visit348_382_1(comboMods[type] || {});
    _$jscoverage['/loader/combo-loader.js'].lineData[383]++;
    if (visit349_383_1(!(mods = typedCombos[comboName]))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[384]++;
      mods = typedCombos[comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[385]++;
      mods.charset = charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[386]++;
      mods.tags = [tag];
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[388]++;
      if (visit350_388_1(visit351_388_2(mods.tags.length == 1) && visit352_388_3(mods.tags[0] == tag))) {
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[391]++;
        mods.tags.push(tag);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[394]++;
    mods.push(mod);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[397]++;
  return comboMods;
}, 
  getComboUrls: function(modNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[30]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[404]++;
  var runtime = this.runtime, Config = runtime.Config, comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/loader/combo-loader.js'].lineData[411]++;
  var comboPrefixes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[413]++;
  var comboMods = this.getComboMods(modNames, comboPrefixes);
  _$jscoverage['/loader/combo-loader.js'].lineData[415]++;
  var comboRes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[418]++;
  for (var type in comboMods) {
    _$jscoverage['/loader/combo-loader.js'].lineData[419]++;
    comboRes[type] = {};
    _$jscoverage['/loader/combo-loader.js'].lineData[420]++;
    for (var comboName in comboMods[type]) {
      _$jscoverage['/loader/combo-loader.js'].lineData[421]++;
      var currentComboUrls = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[422]++;
      var currentComboMods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[423]++;
      var mods = comboMods[type][comboName];
      _$jscoverage['/loader/combo-loader.js'].lineData[424]++;
      var tags = mods.tags;
      _$jscoverage['/loader/combo-loader.js'].lineData[425]++;
      var tag = visit353_425_1(tags.length > 1) ? getHash(tags.join('')) : tags[0];
      _$jscoverage['/loader/combo-loader.js'].lineData[427]++;
      var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''), suffixLength = suffix.length, basePrefix = comboPrefixes[comboName].toString(), baseLen = basePrefix.length, prefix = basePrefix + comboPrefix, res = comboRes[type][comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[434]++;
      var l = prefix.length;
      _$jscoverage['/loader/combo-loader.js'].lineData[435]++;
      res.charset = mods.charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[436]++;
      res.mods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[438]++;
      function pushComboUrl() {
        _$jscoverage['/loader/combo-loader.js'].functionData[31]++;
        _$jscoverage['/loader/combo-loader.js'].lineData[441]++;
        res.push({
  combine: 1, 
  fullpath: Utils.getMappedPath(runtime, prefix + currentComboUrls.join(comboSep) + suffix, Config.mappedComboRules), 
  mods: currentComboMods});
      }      _$jscoverage['/loader/combo-loader.js'].lineData[450]++;
      for (var i = 0; visit354_450_1(i < mods.length); i++) {
        _$jscoverage['/loader/combo-loader.js'].lineData[451]++;
        var currentMod = mods[i];
        _$jscoverage['/loader/combo-loader.js'].lineData[452]++;
        res.mods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[454]++;
        var fullpath = currentMod.getFullPath();
        _$jscoverage['/loader/combo-loader.js'].lineData[455]++;
        if (visit355_455_1(!currentMod.canBeCombined)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[456]++;
          res.push({
  combine: 0, 
  fullpath: fullpath, 
  mods: [currentMod]});
          _$jscoverage['/loader/combo-loader.js'].lineData[461]++;
          continue;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[464]++;
        var path = fullpath.slice(baseLen).replace(/\?.*$/, '');
        _$jscoverage['/loader/combo-loader.js'].lineData[465]++;
        currentComboUrls.push(path);
        _$jscoverage['/loader/combo-loader.js'].lineData[466]++;
        currentComboMods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[468]++;
        if (visit356_468_1(visit357_468_2(currentComboUrls.length > maxFileNum) || (visit358_469_1(l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[470]++;
          currentComboUrls.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[471]++;
          currentComboMods.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[472]++;
          pushComboUrl();
          _$jscoverage['/loader/combo-loader.js'].lineData[473]++;
          currentComboUrls = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[474]++;
          currentComboMods = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[475]++;
          i--;
        }
      }
      _$jscoverage['/loader/combo-loader.js'].lineData[478]++;
      if (visit359_478_1(currentComboUrls.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[479]++;
        pushComboUrl();
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[483]++;
  return comboRes;
}});
  _$jscoverage['/loader/combo-loader.js'].lineData[487]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
