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
if (! _$jscoverage['/compiler.js']) {
  _$jscoverage['/compiler.js'] = {};
  _$jscoverage['/compiler.js'].lineData = [];
  _$jscoverage['/compiler.js'].lineData[6] = 0;
  _$jscoverage['/compiler.js'].lineData[7] = 0;
  _$jscoverage['/compiler.js'].lineData[8] = 0;
  _$jscoverage['/compiler.js'].lineData[10] = 0;
  _$jscoverage['/compiler.js'].lineData[12] = 0;
  _$jscoverage['/compiler.js'].lineData[18] = 0;
  _$jscoverage['/compiler.js'].lineData[19] = 0;
  _$jscoverage['/compiler.js'].lineData[22] = 0;
  _$jscoverage['/compiler.js'].lineData[23] = 0;
  _$jscoverage['/compiler.js'].lineData[24] = 0;
  _$jscoverage['/compiler.js'].lineData[26] = 0;
  _$jscoverage['/compiler.js'].lineData[28] = 0;
  _$jscoverage['/compiler.js'].lineData[30] = 0;
  _$jscoverage['/compiler.js'].lineData[33] = 0;
  _$jscoverage['/compiler.js'].lineData[34] = 0;
  _$jscoverage['/compiler.js'].lineData[36] = 0;
  _$jscoverage['/compiler.js'].lineData[37] = 0;
  _$jscoverage['/compiler.js'].lineData[39] = 0;
  _$jscoverage['/compiler.js'].lineData[43] = 0;
  _$jscoverage['/compiler.js'].lineData[44] = 0;
  _$jscoverage['/compiler.js'].lineData[47] = 0;
  _$jscoverage['/compiler.js'].lineData[48] = 0;
  _$jscoverage['/compiler.js'].lineData[51] = 0;
  _$jscoverage['/compiler.js'].lineData[54] = 0;
  _$jscoverage['/compiler.js'].lineData[55] = 0;
  _$jscoverage['/compiler.js'].lineData[56] = 0;
  _$jscoverage['/compiler.js'].lineData[58] = 0;
  _$jscoverage['/compiler.js'].lineData[59] = 0;
  _$jscoverage['/compiler.js'].lineData[60] = 0;
  _$jscoverage['/compiler.js'].lineData[66] = 0;
  _$jscoverage['/compiler.js'].lineData[70] = 0;
  _$jscoverage['/compiler.js'].lineData[74] = 0;
  _$jscoverage['/compiler.js'].lineData[75] = 0;
  _$jscoverage['/compiler.js'].lineData[78] = 0;
  _$jscoverage['/compiler.js'].lineData[79] = 0;
  _$jscoverage['/compiler.js'].lineData[82] = 0;
  _$jscoverage['/compiler.js'].lineData[83] = 0;
  _$jscoverage['/compiler.js'].lineData[84] = 0;
  _$jscoverage['/compiler.js'].lineData[87] = 0;
  _$jscoverage['/compiler.js'].lineData[88] = 0;
  _$jscoverage['/compiler.js'].lineData[89] = 0;
  _$jscoverage['/compiler.js'].lineData[90] = 0;
  _$jscoverage['/compiler.js'].lineData[92] = 0;
  _$jscoverage['/compiler.js'].lineData[100] = 0;
  _$jscoverage['/compiler.js'].lineData[108] = 0;
  _$jscoverage['/compiler.js'].lineData[109] = 0;
  _$jscoverage['/compiler.js'].lineData[110] = 0;
  _$jscoverage['/compiler.js'].lineData[111] = 0;
  _$jscoverage['/compiler.js'].lineData[112] = 0;
  _$jscoverage['/compiler.js'].lineData[113] = 0;
  _$jscoverage['/compiler.js'].lineData[118] = 0;
  _$jscoverage['/compiler.js'].lineData[121] = 0;
  _$jscoverage['/compiler.js'].lineData[123] = 0;
  _$jscoverage['/compiler.js'].lineData[128] = 0;
  _$jscoverage['/compiler.js'].lineData[136] = 0;
  _$jscoverage['/compiler.js'].lineData[140] = 0;
  _$jscoverage['/compiler.js'].lineData[146] = 0;
  _$jscoverage['/compiler.js'].lineData[147] = 0;
  _$jscoverage['/compiler.js'].lineData[149] = 0;
  _$jscoverage['/compiler.js'].lineData[150] = 0;
  _$jscoverage['/compiler.js'].lineData[151] = 0;
  _$jscoverage['/compiler.js'].lineData[152] = 0;
  _$jscoverage['/compiler.js'].lineData[153] = 0;
  _$jscoverage['/compiler.js'].lineData[156] = 0;
  _$jscoverage['/compiler.js'].lineData[157] = 0;
  _$jscoverage['/compiler.js'].lineData[158] = 0;
  _$jscoverage['/compiler.js'].lineData[159] = 0;
  _$jscoverage['/compiler.js'].lineData[164] = 0;
  _$jscoverage['/compiler.js'].lineData[167] = 0;
  _$jscoverage['/compiler.js'].lineData[168] = 0;
  _$jscoverage['/compiler.js'].lineData[169] = 0;
  _$jscoverage['/compiler.js'].lineData[170] = 0;
  _$jscoverage['/compiler.js'].lineData[174] = 0;
  _$jscoverage['/compiler.js'].lineData[177] = 0;
  _$jscoverage['/compiler.js'].lineData[178] = 0;
  _$jscoverage['/compiler.js'].lineData[179] = 0;
  _$jscoverage['/compiler.js'].lineData[180] = 0;
  _$jscoverage['/compiler.js'].lineData[184] = 0;
  _$jscoverage['/compiler.js'].lineData[187] = 0;
  _$jscoverage['/compiler.js'].lineData[191] = 0;
  _$jscoverage['/compiler.js'].lineData[197] = 0;
  _$jscoverage['/compiler.js'].lineData[198] = 0;
  _$jscoverage['/compiler.js'].lineData[199] = 0;
  _$jscoverage['/compiler.js'].lineData[201] = 0;
  _$jscoverage['/compiler.js'].lineData[202] = 0;
  _$jscoverage['/compiler.js'].lineData[203] = 0;
  _$jscoverage['/compiler.js'].lineData[206] = 0;
  _$jscoverage['/compiler.js'].lineData[207] = 0;
  _$jscoverage['/compiler.js'].lineData[208] = 0;
  _$jscoverage['/compiler.js'].lineData[209] = 0;
  _$jscoverage['/compiler.js'].lineData[210] = 0;
  _$jscoverage['/compiler.js'].lineData[211] = 0;
  _$jscoverage['/compiler.js'].lineData[212] = 0;
  _$jscoverage['/compiler.js'].lineData[213] = 0;
  _$jscoverage['/compiler.js'].lineData[215] = 0;
  _$jscoverage['/compiler.js'].lineData[216] = 0;
  _$jscoverage['/compiler.js'].lineData[219] = 0;
  _$jscoverage['/compiler.js'].lineData[222] = 0;
  _$jscoverage['/compiler.js'].lineData[223] = 0;
  _$jscoverage['/compiler.js'].lineData[224] = 0;
  _$jscoverage['/compiler.js'].lineData[225] = 0;
  _$jscoverage['/compiler.js'].lineData[226] = 0;
  _$jscoverage['/compiler.js'].lineData[227] = 0;
  _$jscoverage['/compiler.js'].lineData[228] = 0;
  _$jscoverage['/compiler.js'].lineData[229] = 0;
  _$jscoverage['/compiler.js'].lineData[231] = 0;
  _$jscoverage['/compiler.js'].lineData[232] = 0;
  _$jscoverage['/compiler.js'].lineData[235] = 0;
  _$jscoverage['/compiler.js'].lineData[239] = 0;
  _$jscoverage['/compiler.js'].lineData[244] = 0;
  _$jscoverage['/compiler.js'].lineData[248] = 0;
  _$jscoverage['/compiler.js'].lineData[252] = 0;
  _$jscoverage['/compiler.js'].lineData[256] = 0;
  _$jscoverage['/compiler.js'].lineData[260] = 0;
  _$jscoverage['/compiler.js'].lineData[264] = 0;
  _$jscoverage['/compiler.js'].lineData[268] = 0;
  _$jscoverage['/compiler.js'].lineData[271] = 0;
  _$jscoverage['/compiler.js'].lineData[272] = 0;
  _$jscoverage['/compiler.js'].lineData[273] = 0;
  _$jscoverage['/compiler.js'].lineData[275] = 0;
  _$jscoverage['/compiler.js'].lineData[277] = 0;
  _$jscoverage['/compiler.js'].lineData[282] = 0;
  _$jscoverage['/compiler.js'].lineData[286] = 0;
  _$jscoverage['/compiler.js'].lineData[290] = 0;
  _$jscoverage['/compiler.js'].lineData[295] = 0;
  _$jscoverage['/compiler.js'].lineData[299] = 0;
  _$jscoverage['/compiler.js'].lineData[309] = 0;
  _$jscoverage['/compiler.js'].lineData[311] = 0;
  _$jscoverage['/compiler.js'].lineData[312] = 0;
  _$jscoverage['/compiler.js'].lineData[313] = 0;
  _$jscoverage['/compiler.js'].lineData[316] = 0;
  _$jscoverage['/compiler.js'].lineData[319] = 0;
  _$jscoverage['/compiler.js'].lineData[320] = 0;
  _$jscoverage['/compiler.js'].lineData[321] = 0;
  _$jscoverage['/compiler.js'].lineData[326] = 0;
  _$jscoverage['/compiler.js'].lineData[327] = 0;
  _$jscoverage['/compiler.js'].lineData[328] = 0;
  _$jscoverage['/compiler.js'].lineData[329] = 0;
  _$jscoverage['/compiler.js'].lineData[330] = 0;
  _$jscoverage['/compiler.js'].lineData[333] = 0;
  _$jscoverage['/compiler.js'].lineData[334] = 0;
  _$jscoverage['/compiler.js'].lineData[335] = 0;
  _$jscoverage['/compiler.js'].lineData[337] = 0;
  _$jscoverage['/compiler.js'].lineData[338] = 0;
  _$jscoverage['/compiler.js'].lineData[339] = 0;
  _$jscoverage['/compiler.js'].lineData[344] = 0;
  _$jscoverage['/compiler.js'].lineData[348] = 0;
  _$jscoverage['/compiler.js'].lineData[352] = 0;
  _$jscoverage['/compiler.js'].lineData[356] = 0;
  _$jscoverage['/compiler.js'].lineData[358] = 0;
  _$jscoverage['/compiler.js'].lineData[359] = 0;
  _$jscoverage['/compiler.js'].lineData[360] = 0;
  _$jscoverage['/compiler.js'].lineData[364] = 0;
  _$jscoverage['/compiler.js'].lineData[367] = 0;
  _$jscoverage['/compiler.js'].lineData[368] = 0;
  _$jscoverage['/compiler.js'].lineData[369] = 0;
  _$jscoverage['/compiler.js'].lineData[370] = 0;
  _$jscoverage['/compiler.js'].lineData[372] = 0;
  _$jscoverage['/compiler.js'].lineData[373] = 0;
  _$jscoverage['/compiler.js'].lineData[375] = 0;
  _$jscoverage['/compiler.js'].lineData[376] = 0;
  _$jscoverage['/compiler.js'].lineData[381] = 0;
  _$jscoverage['/compiler.js'].lineData[388] = 0;
  _$jscoverage['/compiler.js'].lineData[389] = 0;
  _$jscoverage['/compiler.js'].lineData[390] = 0;
  _$jscoverage['/compiler.js'].lineData[391] = 0;
  _$jscoverage['/compiler.js'].lineData[392] = 0;
  _$jscoverage['/compiler.js'].lineData[394] = 0;
  _$jscoverage['/compiler.js'].lineData[395] = 0;
  _$jscoverage['/compiler.js'].lineData[396] = 0;
  _$jscoverage['/compiler.js'].lineData[397] = 0;
  _$jscoverage['/compiler.js'].lineData[398] = 0;
  _$jscoverage['/compiler.js'].lineData[399] = 0;
  _$jscoverage['/compiler.js'].lineData[403] = 0;
  _$jscoverage['/compiler.js'].lineData[404] = 0;
  _$jscoverage['/compiler.js'].lineData[407] = 0;
  _$jscoverage['/compiler.js'].lineData[411] = 0;
  _$jscoverage['/compiler.js'].lineData[418] = 0;
  _$jscoverage['/compiler.js'].lineData[425] = 0;
  _$jscoverage['/compiler.js'].lineData[433] = 0;
  _$jscoverage['/compiler.js'].lineData[434] = 0;
  _$jscoverage['/compiler.js'].lineData[444] = 0;
  _$jscoverage['/compiler.js'].lineData[445] = 0;
  _$jscoverage['/compiler.js'].lineData[446] = 0;
  _$jscoverage['/compiler.js'].lineData[456] = 0;
  _$jscoverage['/compiler.js'].lineData[457] = 0;
  _$jscoverage['/compiler.js'].lineData[458] = 0;
  _$jscoverage['/compiler.js'].lineData[463] = 0;
}
if (! _$jscoverage['/compiler.js'].functionData) {
  _$jscoverage['/compiler.js'].functionData = [];
  _$jscoverage['/compiler.js'].functionData[0] = 0;
  _$jscoverage['/compiler.js'].functionData[1] = 0;
  _$jscoverage['/compiler.js'].functionData[2] = 0;
  _$jscoverage['/compiler.js'].functionData[3] = 0;
  _$jscoverage['/compiler.js'].functionData[4] = 0;
  _$jscoverage['/compiler.js'].functionData[5] = 0;
  _$jscoverage['/compiler.js'].functionData[6] = 0;
  _$jscoverage['/compiler.js'].functionData[7] = 0;
  _$jscoverage['/compiler.js'].functionData[8] = 0;
  _$jscoverage['/compiler.js'].functionData[9] = 0;
  _$jscoverage['/compiler.js'].functionData[10] = 0;
  _$jscoverage['/compiler.js'].functionData[11] = 0;
  _$jscoverage['/compiler.js'].functionData[12] = 0;
  _$jscoverage['/compiler.js'].functionData[13] = 0;
  _$jscoverage['/compiler.js'].functionData[14] = 0;
  _$jscoverage['/compiler.js'].functionData[15] = 0;
  _$jscoverage['/compiler.js'].functionData[16] = 0;
  _$jscoverage['/compiler.js'].functionData[17] = 0;
  _$jscoverage['/compiler.js'].functionData[18] = 0;
  _$jscoverage['/compiler.js'].functionData[19] = 0;
  _$jscoverage['/compiler.js'].functionData[20] = 0;
  _$jscoverage['/compiler.js'].functionData[21] = 0;
  _$jscoverage['/compiler.js'].functionData[22] = 0;
  _$jscoverage['/compiler.js'].functionData[23] = 0;
  _$jscoverage['/compiler.js'].functionData[24] = 0;
  _$jscoverage['/compiler.js'].functionData[25] = 0;
  _$jscoverage['/compiler.js'].functionData[26] = 0;
  _$jscoverage['/compiler.js'].functionData[27] = 0;
  _$jscoverage['/compiler.js'].functionData[28] = 0;
  _$jscoverage['/compiler.js'].functionData[29] = 0;
  _$jscoverage['/compiler.js'].functionData[30] = 0;
  _$jscoverage['/compiler.js'].functionData[31] = 0;
  _$jscoverage['/compiler.js'].functionData[32] = 0;
}
if (! _$jscoverage['/compiler.js'].branchData) {
  _$jscoverage['/compiler.js'].branchData = {};
  _$jscoverage['/compiler.js'].branchData['23'] = [];
  _$jscoverage['/compiler.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['36'] = [];
  _$jscoverage['/compiler.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['55'] = [];
  _$jscoverage['/compiler.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['59'] = [];
  _$jscoverage['/compiler.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['78'] = [];
  _$jscoverage['/compiler.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['82'] = [];
  _$jscoverage['/compiler.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['83'] = [];
  _$jscoverage['/compiler.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['88'] = [];
  _$jscoverage['/compiler.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['108'] = [];
  _$jscoverage['/compiler.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['109'] = [];
  _$jscoverage['/compiler.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['111'] = [];
  _$jscoverage['/compiler.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['121'] = [];
  _$jscoverage['/compiler.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['130'] = [];
  _$jscoverage['/compiler.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['133'] = [];
  _$jscoverage['/compiler.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['149'] = [];
  _$jscoverage['/compiler.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['156'] = [];
  _$jscoverage['/compiler.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['167'] = [];
  _$jscoverage['/compiler.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['177'] = [];
  _$jscoverage['/compiler.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['197'] = [];
  _$jscoverage['/compiler.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['201'] = [];
  _$jscoverage['/compiler.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['206'] = [];
  _$jscoverage['/compiler.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['211'] = [];
  _$jscoverage['/compiler.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['222'] = [];
  _$jscoverage['/compiler.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['227'] = [];
  _$jscoverage['/compiler.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['272'] = [];
  _$jscoverage['/compiler.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['311'] = [];
  _$jscoverage['/compiler.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['319'] = [];
  _$jscoverage['/compiler.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['326'] = [];
  _$jscoverage['/compiler.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['333'] = [];
  _$jscoverage['/compiler.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['335'] = [];
  _$jscoverage['/compiler.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['337'] = [];
  _$jscoverage['/compiler.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['368'] = [];
  _$jscoverage['/compiler.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['388'] = [];
  _$jscoverage['/compiler.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['391'] = [];
  _$jscoverage['/compiler.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['394'] = [];
  _$jscoverage['/compiler.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['396'] = [];
  _$jscoverage['/compiler.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['457'] = [];
  _$jscoverage['/compiler.js'].branchData['457'][1] = new BranchData();
}
_$jscoverage['/compiler.js'].branchData['457'][1].init(68, 12, 'config || {}');
function visit79_457_1(result) {
  _$jscoverage['/compiler.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['396'][1].init(88, 17, 'nextIdNameCode[0]');
function visit78_396_1(result) {
  _$jscoverage['/compiler.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['394'][1].init(185, 10, 'idPartType');
function visit77_394_1(result) {
  _$jscoverage['/compiler.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['391'][1].init(100, 6, '!first');
function visit76_391_1(result) {
  _$jscoverage['/compiler.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['388'][1].init(218, 18, 'i < idParts.length');
function visit75_388_1(result) {
  _$jscoverage['/compiler.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['368'][1].init(186, 7, 'code[0]');
function visit74_368_1(result) {
  _$jscoverage['/compiler.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['337'][1].init(57, 27, 'typeof parts[i] != \'string\'');
function visit73_337_1(result) {
  _$jscoverage['/compiler.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['335'][1].init(76, 16, 'i < parts.length');
function visit72_335_1(result) {
  _$jscoverage['/compiler.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['333'][1].init(1293, 32, '!tplNode.hash && !tplNode.params');
function visit71_333_1(result) {
  _$jscoverage['/compiler.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['326'][1].init(978, 18, 'tplNode.isInverted');
function visit70_326_1(result) {
  _$jscoverage['/compiler.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['319'][1].init(706, 19, 'programNode.inverse');
function visit69_319_1(result) {
  _$jscoverage['/compiler.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['311'][1].init(429, 11, '!configName');
function visit68_311_1(result) {
  _$jscoverage['/compiler.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['272'][1].init(166, 14, 'name = code[0]');
function visit67_272_1(result) {
  _$jscoverage['/compiler.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['227'][1].init(91, 17, 'nextIdNameCode[0]');
function visit66_227_1(result) {
  _$jscoverage['/compiler.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['222'][1].init(1113, 4, 'hash');
function visit65_222_1(result) {
  _$jscoverage['/compiler.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['211'][1].init(99, 17, 'nextIdNameCode[0]');
function visit64_211_1(result) {
  _$jscoverage['/compiler.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['206'][1].init(271, 6, 'params');
function visit63_206_1(result) {
  _$jscoverage['/compiler.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['201'][1].init(100, 14, 'params || hash');
function visit62_201_1(result) {
  _$jscoverage['/compiler.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['197'][1].init(150, 7, 'tplNode');
function visit61_197_1(result) {
  _$jscoverage['/compiler.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['177'][1].init(1211, 15, '!name1 && name2');
function visit60_177_1(result) {
  _$jscoverage['/compiler.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['167'][1].init(878, 15, 'name1 && !name2');
function visit59_167_1(result) {
  _$jscoverage['/compiler.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['156'][1].init(483, 16, '!name1 && !name2');
function visit58_156_1(result) {
  _$jscoverage['/compiler.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['149'][1].init(252, 14, 'name1 && name2');
function visit57_149_1(result) {
  _$jscoverage['/compiler.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['133'][1].init(236, 26, 'tplNode && tplNode.escaped');
function visit56_133_1(result) {
  _$jscoverage['/compiler.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['130'][1].init(100, 18, 'configName || \'{}\'');
function visit55_130_1(result) {
  _$jscoverage['/compiler.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['121'][1].init(745, 21, 'idString == \'include\'');
function visit54_121_1(result) {
  _$jscoverage['/compiler.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['111'][1].init(126, 14, 'configNameCode');
function visit53_111_1(result) {
  _$jscoverage['/compiler.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['109'][1].init(38, 34, 'tplNode && self.genConfig(tplNode)');
function visit52_109_1(result) {
  _$jscoverage['/compiler.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['108'][1].init(265, 10, 'depth == 0');
function visit51_108_1(result) {
  _$jscoverage['/compiler.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['88'][1].init(1248, 7, '!global');
function visit50_88_1(result) {
  _$jscoverage['/compiler.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['83'][1].init(58, 7, 'i < len');
function visit49_83_1(result) {
  _$jscoverage['/compiler.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['82'][1].init(988, 10, 'statements');
function visit48_82_1(result) {
  _$jscoverage['/compiler.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['78'][1].init(629, 7, 'natives');
function visit47_78_1(result) {
  _$jscoverage['/compiler.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['59'][1].init(205, 6, 'global');
function visit46_59_1(result) {
  _$jscoverage['/compiler.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['55'][1].init(46, 7, '!global');
function visit45_55_1(result) {
  _$jscoverage['/compiler.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['36'][1].init(87, 12, 'm.length % 2');
function visit44_36_1(result) {
  _$jscoverage['/compiler.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['23'][1].init(13, 6, 'isCode');
function visit43_23_1(result) {
  _$jscoverage['/compiler.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/compiler.js'].functionData[0]++;
  _$jscoverage['/compiler.js'].lineData[7]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/compiler.js'].lineData[8]++;
  var parser = require('./compiler/parser');
  _$jscoverage['/compiler.js'].lineData[10]++;
  parser.yy = require('./compiler/ast');
  _$jscoverage['/compiler.js'].lineData[12]++;
  var doubleReg = /\\*"/g, singleReg = /\\*'/g, arrayPush = [].push, variableId = 0, xtemplateId = 0;
  _$jscoverage['/compiler.js'].lineData[18]++;
  function guid(str) {
    _$jscoverage['/compiler.js'].functionData[1]++;
    _$jscoverage['/compiler.js'].lineData[19]++;
    return str + (variableId++);
  }
  _$jscoverage['/compiler.js'].lineData[22]++;
  function escapeString(str, isCode) {
    _$jscoverage['/compiler.js'].functionData[2]++;
    _$jscoverage['/compiler.js'].lineData[23]++;
    if (visit43_23_1(isCode)) {
      _$jscoverage['/compiler.js'].lineData[24]++;
      str = escapeSingleQuoteInCodeString(str, false);
    } else {
      _$jscoverage['/compiler.js'].lineData[26]++;
      str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    _$jscoverage['/compiler.js'].lineData[28]++;
    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    _$jscoverage['/compiler.js'].lineData[30]++;
    return str;
  }
  _$jscoverage['/compiler.js'].lineData[33]++;
  function escapeSingleQuoteInCodeString(str, isDouble) {
    _$jscoverage['/compiler.js'].functionData[3]++;
    _$jscoverage['/compiler.js'].lineData[34]++;
    return str.replace(isDouble ? doubleReg : singleReg, function(m) {
  _$jscoverage['/compiler.js'].functionData[4]++;
  _$jscoverage['/compiler.js'].lineData[36]++;
  if (visit44_36_1(m.length % 2)) {
    _$jscoverage['/compiler.js'].lineData[37]++;
    m = '\\' + m;
  }
  _$jscoverage['/compiler.js'].lineData[39]++;
  return m;
});
  }
  _$jscoverage['/compiler.js'].lineData[43]++;
  function pushToArray(to, from) {
    _$jscoverage['/compiler.js'].functionData[5]++;
    _$jscoverage['/compiler.js'].lineData[44]++;
    arrayPush.apply(to, from);
  }
  _$jscoverage['/compiler.js'].lineData[47]++;
  function lastOfArray(arr) {
    _$jscoverage['/compiler.js'].functionData[6]++;
    _$jscoverage['/compiler.js'].lineData[48]++;
    return arr[arr.length - 1];
  }
  _$jscoverage['/compiler.js'].lineData[51]++;
  var gen = {
  genFunction: function(statements, global) {
  _$jscoverage['/compiler.js'].functionData[7]++;
  _$jscoverage['/compiler.js'].lineData[54]++;
  var source = [];
  _$jscoverage['/compiler.js'].lineData[55]++;
  if (visit45_55_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[56]++;
    source.push('function(scopes) {');
  }
  _$jscoverage['/compiler.js'].lineData[58]++;
  source.push('var buffer = ""' + (global ? ',' : ';'));
  _$jscoverage['/compiler.js'].lineData[59]++;
  if (visit46_59_1(global)) {
    _$jscoverage['/compiler.js'].lineData[60]++;
    source.push('config = this.config,' + 'engine = this,' + 'moduleWrap, ' + 'utils = config.utils;');
    _$jscoverage['/compiler.js'].lineData[66]++;
    source.push('if (typeof module !== "undefined" && module.kissy) {' + 'moduleWrap = module;' + '}');
    _$jscoverage['/compiler.js'].lineData[70]++;
    var natives = '', c, utils = XTemplateRuntime.utils;
    _$jscoverage['/compiler.js'].lineData[74]++;
    for (c in utils) {
      _$jscoverage['/compiler.js'].lineData[75]++;
      natives += c + 'Util = utils.' + c + ',';
    }
    _$jscoverage['/compiler.js'].lineData[78]++;
    if (visit47_78_1(natives)) {
      _$jscoverage['/compiler.js'].lineData[79]++;
      source.push('var ' + natives.slice(0, natives.length - 1) + ';');
    }
  }
  _$jscoverage['/compiler.js'].lineData[82]++;
  if (visit48_82_1(statements)) {
    _$jscoverage['/compiler.js'].lineData[83]++;
    for (var i = 0, len = statements.length; visit49_83_1(i < len); i++) {
      _$jscoverage['/compiler.js'].lineData[84]++;
      pushToArray(source, this[statements[i].type](statements[i]));
    }
  }
  _$jscoverage['/compiler.js'].lineData[87]++;
  source.push('return buffer;');
  _$jscoverage['/compiler.js'].lineData[88]++;
  if (visit50_88_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[89]++;
    source.push('}');
    _$jscoverage['/compiler.js'].lineData[90]++;
    return source;
  } else {
    _$jscoverage['/compiler.js'].lineData[92]++;
    return {
  params: ['scopes', 'S', 'undefined'], 
  source: source};
  }
}, 
  genId: function(idNode, tplNode, preserveUndefined) {
  _$jscoverage['/compiler.js'].functionData[8]++;
  _$jscoverage['/compiler.js'].lineData[100]++;
  var source = [], depth = idNode.depth, idParts = idNode.parts, idName = guid('id'), self = this;
  _$jscoverage['/compiler.js'].lineData[108]++;
  if (visit51_108_1(depth == 0)) {
    _$jscoverage['/compiler.js'].lineData[109]++;
    var configNameCode = visit52_109_1(tplNode && self.genConfig(tplNode));
    _$jscoverage['/compiler.js'].lineData[110]++;
    var configName;
    _$jscoverage['/compiler.js'].lineData[111]++;
    if (visit53_111_1(configNameCode)) {
      _$jscoverage['/compiler.js'].lineData[112]++;
      configName = configNameCode[0];
      _$jscoverage['/compiler.js'].lineData[113]++;
      pushToArray(source, configNameCode[1]);
    }
  }
  _$jscoverage['/compiler.js'].lineData[118]++;
  var idString = self.getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[121]++;
  if (visit54_121_1(idString == 'include')) {
    _$jscoverage['/compiler.js'].lineData[123]++;
    source.push('if(moduleWrap) {re' + 'quire("' + tplNode.params[0].value + '");' + configName + '.params[0]=moduleWrap.resolveByName(' + configName + '.params[0]);' + '}');
  }
  _$jscoverage['/compiler.js'].lineData[128]++;
  source.push('var ' + idName + ' = getPropertyOrRunCommandUtil(engine,scopes,' + (visit55_130_1(configName || '{}')) + ',"' + idString + '",' + depth + ',' + idNode.lineNumber + ',' + (visit56_133_1(tplNode && tplNode.escaped)) + ',' + preserveUndefined + ');');
  _$jscoverage['/compiler.js'].lineData[136]++;
  return [idName, source];
}, 
  genOpExpression: function(e, type) {
  _$jscoverage['/compiler.js'].functionData[9]++;
  _$jscoverage['/compiler.js'].lineData[140]++;
  var source = [], name1, name2, code1 = this[e.op1.type](e.op1), code2 = this[e.op2.type](e.op2);
  _$jscoverage['/compiler.js'].lineData[146]++;
  name1 = code1[0];
  _$jscoverage['/compiler.js'].lineData[147]++;
  name2 = code2[0];
  _$jscoverage['/compiler.js'].lineData[149]++;
  if (visit57_149_1(name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[150]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[151]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[152]++;
    source.push(name1 + type + name2);
    _$jscoverage['/compiler.js'].lineData[153]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[156]++;
  if (visit58_156_1(!name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[157]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[158]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[159]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[164]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[167]++;
  if (visit59_167_1(name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[168]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[169]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[170]++;
    source.push(name1 + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[174]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[177]++;
  if (visit60_177_1(!name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[178]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[179]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[180]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + name2);
    _$jscoverage['/compiler.js'].lineData[184]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[187]++;
  return undefined;
}, 
  genConfig: function(tplNode) {
  _$jscoverage['/compiler.js'].functionData[10]++;
  _$jscoverage['/compiler.js'].lineData[191]++;
  var source = [], configName, params, hash, self = this;
  _$jscoverage['/compiler.js'].lineData[197]++;
  if (visit61_197_1(tplNode)) {
    _$jscoverage['/compiler.js'].lineData[198]++;
    params = tplNode.params;
    _$jscoverage['/compiler.js'].lineData[199]++;
    hash = tplNode.hash;
    _$jscoverage['/compiler.js'].lineData[201]++;
    if (visit62_201_1(params || hash)) {
      _$jscoverage['/compiler.js'].lineData[202]++;
      configName = guid('config');
      _$jscoverage['/compiler.js'].lineData[203]++;
      source.push('var ' + configName + ' = {};');
    }
    _$jscoverage['/compiler.js'].lineData[206]++;
    if (visit63_206_1(params)) {
      _$jscoverage['/compiler.js'].lineData[207]++;
      var paramsName = guid('params');
      _$jscoverage['/compiler.js'].lineData[208]++;
      source.push('var ' + paramsName + ' = [];');
      _$jscoverage['/compiler.js'].lineData[209]++;
      S.each(params, function(param) {
  _$jscoverage['/compiler.js'].functionData[11]++;
  _$jscoverage['/compiler.js'].lineData[210]++;
  var nextIdNameCode = self[param.type](param);
  _$jscoverage['/compiler.js'].lineData[211]++;
  if (visit64_211_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[212]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[213]++;
    source.push(paramsName + '.push(' + nextIdNameCode[0] + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[215]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[216]++;
    source.push(paramsName + '.push(' + lastOfArray(nextIdNameCode[1]) + ');');
  }
});
      _$jscoverage['/compiler.js'].lineData[219]++;
      source.push(configName + '.params=' + paramsName + ';');
    }
    _$jscoverage['/compiler.js'].lineData[222]++;
    if (visit65_222_1(hash)) {
      _$jscoverage['/compiler.js'].lineData[223]++;
      var hashName = guid('hash');
      _$jscoverage['/compiler.js'].lineData[224]++;
      source.push('var ' + hashName + ' = {};');
      _$jscoverage['/compiler.js'].lineData[225]++;
      S.each(hash.value, function(v, key) {
  _$jscoverage['/compiler.js'].functionData[12]++;
  _$jscoverage['/compiler.js'].lineData[226]++;
  var nextIdNameCode = self[v.type](v);
  _$jscoverage['/compiler.js'].lineData[227]++;
  if (visit66_227_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[228]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[229]++;
    source.push(hashName + '["' + key + '"] = ' + nextIdNameCode[0] + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[231]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[232]++;
    source.push(hashName + '["' + key + '"] = ' + lastOfArray(nextIdNameCode[1]) + ';');
  }
});
      _$jscoverage['/compiler.js'].lineData[235]++;
      source.push(configName + '.hash=' + hashName + ';');
    }
  }
  _$jscoverage['/compiler.js'].lineData[239]++;
  return [configName, source];
}, 
  conditionalOrExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[13]++;
  _$jscoverage['/compiler.js'].lineData[244]++;
  return this.genOpExpression(e, '||');
}, 
  conditionalAndExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[14]++;
  _$jscoverage['/compiler.js'].lineData[248]++;
  return this.genOpExpression(e, '&&');
}, 
  relationalExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[15]++;
  _$jscoverage['/compiler.js'].lineData[252]++;
  return this.genOpExpression(e, e.opType);
}, 
  equalityExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[16]++;
  _$jscoverage['/compiler.js'].lineData[256]++;
  return this.genOpExpression(e, e.opType);
}, 
  additiveExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[17]++;
  _$jscoverage['/compiler.js'].lineData[260]++;
  return this.genOpExpression(e, e.opType);
}, 
  multiplicativeExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[18]++;
  _$jscoverage['/compiler.js'].lineData[264]++;
  return this.genOpExpression(e, e.opType);
}, 
  unaryExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[19]++;
  _$jscoverage['/compiler.js'].lineData[268]++;
  var source = [], name, code = this[e.value.type](e.value);
  _$jscoverage['/compiler.js'].lineData[271]++;
  arrayPush.apply(source, code[1]);
  _$jscoverage['/compiler.js'].lineData[272]++;
  if (visit67_272_1(name = code[0])) {
    _$jscoverage['/compiler.js'].lineData[273]++;
    source.push(name + '=!' + name + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[275]++;
    source[source.length - 1] = '!' + lastOfArray(source);
  }
  _$jscoverage['/compiler.js'].lineData[277]++;
  return [name, source];
}, 
  'string': function(e) {
  _$jscoverage['/compiler.js'].functionData[20]++;
  _$jscoverage['/compiler.js'].lineData[282]++;
  return ['', ["'" + escapeString(e.value, true) + "'"]];
}, 
  'number': function(e) {
  _$jscoverage['/compiler.js'].functionData[21]++;
  _$jscoverage['/compiler.js'].lineData[286]++;
  return ['', [e.value]];
}, 
  'boolean': function(e) {
  _$jscoverage['/compiler.js'].functionData[22]++;
  _$jscoverage['/compiler.js'].lineData[290]++;
  return ['', [e.value]];
}, 
  'id': function(e, topLevel) {
  _$jscoverage['/compiler.js'].functionData[23]++;
  _$jscoverage['/compiler.js'].lineData[295]++;
  return this.genId(e, undefined, !topLevel);
}, 
  'block': function(block) {
  _$jscoverage['/compiler.js'].functionData[24]++;
  _$jscoverage['/compiler.js'].lineData[299]++;
  var programNode = block.program, source = [], self = this, tplNode = block.tpl, configNameCode = self.genConfig(tplNode), configName = configNameCode[0], tplPath = tplNode.path, pathString = tplPath.string, inverseFn;
  _$jscoverage['/compiler.js'].lineData[309]++;
  pushToArray(source, configNameCode[1]);
  _$jscoverage['/compiler.js'].lineData[311]++;
  if (visit68_311_1(!configName)) {
    _$jscoverage['/compiler.js'].lineData[312]++;
    configName = S.guid('config');
    _$jscoverage['/compiler.js'].lineData[313]++;
    source.push('var ' + configName + ' = {};');
  }
  _$jscoverage['/compiler.js'].lineData[316]++;
  source.push(configName + '.fn=' + self.genFunction(programNode.statements).join('\n') + ';');
  _$jscoverage['/compiler.js'].lineData[319]++;
  if (visit69_319_1(programNode.inverse)) {
    _$jscoverage['/compiler.js'].lineData[320]++;
    inverseFn = self.genFunction(programNode.inverse).join('\n');
    _$jscoverage['/compiler.js'].lineData[321]++;
    source.push(configName + '.inverse=' + inverseFn + ';');
  }
  _$jscoverage['/compiler.js'].lineData[326]++;
  if (visit70_326_1(tplNode.isInverted)) {
    _$jscoverage['/compiler.js'].lineData[327]++;
    var tmp = guid('inverse');
    _$jscoverage['/compiler.js'].lineData[328]++;
    source.push('var ' + tmp + '=' + configName + '.fn;');
    _$jscoverage['/compiler.js'].lineData[329]++;
    source.push(configName + '.fn = ' + configName + '.inverse;');
    _$jscoverage['/compiler.js'].lineData[330]++;
    source.push(configName + '.inverse = ' + tmp + ';');
  }
  _$jscoverage['/compiler.js'].lineData[333]++;
  if (visit71_333_1(!tplNode.hash && !tplNode.params)) {
    _$jscoverage['/compiler.js'].lineData[334]++;
    var parts = tplPath.parts;
    _$jscoverage['/compiler.js'].lineData[335]++;
    for (var i = 0; visit72_335_1(i < parts.length); i++) {
      _$jscoverage['/compiler.js'].lineData[337]++;
      if (visit73_337_1(typeof parts[i] != 'string')) {
        _$jscoverage['/compiler.js'].lineData[338]++;
        pathString = self.getIdStringFromIdParts(source, parts);
        _$jscoverage['/compiler.js'].lineData[339]++;
        break;
      }
    }
  }
  _$jscoverage['/compiler.js'].lineData[344]++;
  source.push('buffer += runBlockCommandUtil(engine, scopes, ' + configName + ', ' + '"' + pathString + '", ' + tplPath.lineNumber + ');');
  _$jscoverage['/compiler.js'].lineData[348]++;
  return source;
}, 
  'content': function(contentNode) {
  _$jscoverage['/compiler.js'].functionData[25]++;
  _$jscoverage['/compiler.js'].lineData[352]++;
  return ['buffer += \'' + escapeString(contentNode.value, false) + '\';'];
}, 
  'tpl': function(tplNode) {
  _$jscoverage['/compiler.js'].functionData[26]++;
  _$jscoverage['/compiler.js'].lineData[356]++;
  var source = [], genIdCode = this.genId(tplNode.path, tplNode);
  _$jscoverage['/compiler.js'].lineData[358]++;
  pushToArray(source, genIdCode[1]);
  _$jscoverage['/compiler.js'].lineData[359]++;
  source.push('buffer += ' + genIdCode[0] + ';');
  _$jscoverage['/compiler.js'].lineData[360]++;
  return source;
}, 
  'tplExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[27]++;
  _$jscoverage['/compiler.js'].lineData[364]++;
  var source = [], escaped = e.escaped, expressionOrVariable;
  _$jscoverage['/compiler.js'].lineData[367]++;
  var code = this[e.expression.type](e.expression, 1);
  _$jscoverage['/compiler.js'].lineData[368]++;
  if (visit74_368_1(code[0])) {
    _$jscoverage['/compiler.js'].lineData[369]++;
    pushToArray(source, code[1]);
    _$jscoverage['/compiler.js'].lineData[370]++;
    expressionOrVariable = code[0];
  } else {
    _$jscoverage['/compiler.js'].lineData[372]++;
    pushToArray(source, code[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[373]++;
    expressionOrVariable = lastOfArray(code[1]);
  }
  _$jscoverage['/compiler.js'].lineData[375]++;
  source.push('buffer += getExpressionUtil(' + expressionOrVariable + ',' + escaped + ');');
  _$jscoverage['/compiler.js'].lineData[376]++;
  return source;
}, 
  'getIdStringFromIdParts': function(source, idParts) {
  _$jscoverage['/compiler.js'].functionData[28]++;
  _$jscoverage['/compiler.js'].lineData[381]++;
  var idString = '', self = this, i, idPart, idPartType, nextIdNameCode, first = true;
  _$jscoverage['/compiler.js'].lineData[388]++;
  for (i = 0; visit75_388_1(i < idParts.length); i++) {
    _$jscoverage['/compiler.js'].lineData[389]++;
    idPart = idParts[i];
    _$jscoverage['/compiler.js'].lineData[390]++;
    idPartType = idPart.type;
    _$jscoverage['/compiler.js'].lineData[391]++;
    if (visit76_391_1(!first)) {
      _$jscoverage['/compiler.js'].lineData[392]++;
      idString += '.';
    }
    _$jscoverage['/compiler.js'].lineData[394]++;
    if (visit77_394_1(idPartType)) {
      _$jscoverage['/compiler.js'].lineData[395]++;
      nextIdNameCode = self[idPartType](idPart);
      _$jscoverage['/compiler.js'].lineData[396]++;
      if (visit78_396_1(nextIdNameCode[0])) {
        _$jscoverage['/compiler.js'].lineData[397]++;
        pushToArray(source, nextIdNameCode[1]);
        _$jscoverage['/compiler.js'].lineData[398]++;
        idString += '"+' + nextIdNameCode[0] + '+"';
        _$jscoverage['/compiler.js'].lineData[399]++;
        first = true;
      }
    } else {
      _$jscoverage['/compiler.js'].lineData[403]++;
      idString += idPart;
      _$jscoverage['/compiler.js'].lineData[404]++;
      first = false;
    }
  }
  _$jscoverage['/compiler.js'].lineData[407]++;
  return idString;
}};
  _$jscoverage['/compiler.js'].lineData[411]++;
  var compiler;
  _$jscoverage['/compiler.js'].lineData[418]++;
  return compiler = {
  parse: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[29]++;
  _$jscoverage['/compiler.js'].lineData[425]++;
  return parser.parse(tpl);
}, 
  compileToStr: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[30]++;
  _$jscoverage['/compiler.js'].lineData[433]++;
  var func = this.compile(tpl);
  _$jscoverage['/compiler.js'].lineData[434]++;
  return 'function(' + func.params.join(',') + '){\n' + func.source.join('\n') + '}';
}, 
  compile: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[31]++;
  _$jscoverage['/compiler.js'].lineData[444]++;
  var root = this.parse(tpl);
  _$jscoverage['/compiler.js'].lineData[445]++;
  variableId = 0;
  _$jscoverage['/compiler.js'].lineData[446]++;
  return gen.genFunction(root.statements, true);
}, 
  compileToFn: function(tpl, config) {
  _$jscoverage['/compiler.js'].functionData[32]++;
  _$jscoverage['/compiler.js'].lineData[456]++;
  var code = compiler.compile(tpl);
  _$jscoverage['/compiler.js'].lineData[457]++;
  config = visit79_457_1(config || {});
  _$jscoverage['/compiler.js'].lineData[458]++;
  var sourceURL = 'sourceURL=' + (config.name ? config.name : ('xtemplate' + (xtemplateId++))) + '.js';
  _$jscoverage['/compiler.js'].lineData[463]++;
  return Function.apply(null, [].concat(code.params).concat(code.source.join('\n') + '\n//@ ' + sourceURL + '\n//# ' + sourceURL));
}};
});
