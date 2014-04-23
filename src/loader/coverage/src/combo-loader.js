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
  _$jscoverage['/combo-loader.js'].lineData[10] = 0;
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
  _$jscoverage['/combo-loader.js'].lineData[150] = 0;
  _$jscoverage['/combo-loader.js'].lineData[151] = 0;
  _$jscoverage['/combo-loader.js'].lineData[157] = 0;
  _$jscoverage['/combo-loader.js'].lineData[158] = 0;
  _$jscoverage['/combo-loader.js'].lineData[159] = 0;
  _$jscoverage['/combo-loader.js'].lineData[160] = 0;
  _$jscoverage['/combo-loader.js'].lineData[161] = 0;
  _$jscoverage['/combo-loader.js'].lineData[165] = 0;
  _$jscoverage['/combo-loader.js'].lineData[166] = 0;
  _$jscoverage['/combo-loader.js'].lineData[173] = 0;
  _$jscoverage['/combo-loader.js'].lineData[174] = 0;
  _$jscoverage['/combo-loader.js'].lineData[175] = 0;
  _$jscoverage['/combo-loader.js'].lineData[177] = 0;
  _$jscoverage['/combo-loader.js'].lineData[180] = 0;
  _$jscoverage['/combo-loader.js'].lineData[182] = 0;
  _$jscoverage['/combo-loader.js'].lineData[183] = 0;
  _$jscoverage['/combo-loader.js'].lineData[184] = 0;
  _$jscoverage['/combo-loader.js'].lineData[185] = 0;
  _$jscoverage['/combo-loader.js'].lineData[186] = 0;
  _$jscoverage['/combo-loader.js'].lineData[187] = 0;
  _$jscoverage['/combo-loader.js'].lineData[188] = 0;
  _$jscoverage['/combo-loader.js'].lineData[191] = 0;
  _$jscoverage['/combo-loader.js'].lineData[192] = 0;
  _$jscoverage['/combo-loader.js'].lineData[198] = 0;
  _$jscoverage['/combo-loader.js'].lineData[201] = 0;
  _$jscoverage['/combo-loader.js'].lineData[202] = 0;
  _$jscoverage['/combo-loader.js'].lineData[203] = 0;
  _$jscoverage['/combo-loader.js'].lineData[204] = 0;
  _$jscoverage['/combo-loader.js'].lineData[206] = 0;
  _$jscoverage['/combo-loader.js'].lineData[207] = 0;
  _$jscoverage['/combo-loader.js'].lineData[208] = 0;
  _$jscoverage['/combo-loader.js'].lineData[209] = 0;
  _$jscoverage['/combo-loader.js'].lineData[210] = 0;
  _$jscoverage['/combo-loader.js'].lineData[211] = 0;
  _$jscoverage['/combo-loader.js'].lineData[214] = 0;
  _$jscoverage['/combo-loader.js'].lineData[220] = 0;
  _$jscoverage['/combo-loader.js'].lineData[221] = 0;
  _$jscoverage['/combo-loader.js'].lineData[222] = 0;
  _$jscoverage['/combo-loader.js'].lineData[223] = 0;
  _$jscoverage['/combo-loader.js'].lineData[224] = 0;
  _$jscoverage['/combo-loader.js'].lineData[225] = 0;
  _$jscoverage['/combo-loader.js'].lineData[227] = 0;
  _$jscoverage['/combo-loader.js'].lineData[229] = 0;
  _$jscoverage['/combo-loader.js'].lineData[233] = 0;
  _$jscoverage['/combo-loader.js'].lineData[238] = 0;
  _$jscoverage['/combo-loader.js'].lineData[242] = 0;
  _$jscoverage['/combo-loader.js'].lineData[245] = 0;
  _$jscoverage['/combo-loader.js'].lineData[246] = 0;
  _$jscoverage['/combo-loader.js'].lineData[247] = 0;
  _$jscoverage['/combo-loader.js'].lineData[248] = 0;
  _$jscoverage['/combo-loader.js'].lineData[251] = 0;
  _$jscoverage['/combo-loader.js'].lineData[252] = 0;
  _$jscoverage['/combo-loader.js'].lineData[253] = 0;
  _$jscoverage['/combo-loader.js'].lineData[255] = 0;
  _$jscoverage['/combo-loader.js'].lineData[259] = 0;
  _$jscoverage['/combo-loader.js'].lineData[260] = 0;
  _$jscoverage['/combo-loader.js'].lineData[261] = 0;
  _$jscoverage['/combo-loader.js'].lineData[262] = 0;
  _$jscoverage['/combo-loader.js'].lineData[263] = 0;
  _$jscoverage['/combo-loader.js'].lineData[265] = 0;
  _$jscoverage['/combo-loader.js'].lineData[272] = 0;
  _$jscoverage['/combo-loader.js'].lineData[273] = 0;
  _$jscoverage['/combo-loader.js'].lineData[274] = 0;
  _$jscoverage['/combo-loader.js'].lineData[275] = 0;
  _$jscoverage['/combo-loader.js'].lineData[278] = 0;
  _$jscoverage['/combo-loader.js'].lineData[279] = 0;
  _$jscoverage['/combo-loader.js'].lineData[282] = 0;
  _$jscoverage['/combo-loader.js'].lineData[283] = 0;
  _$jscoverage['/combo-loader.js'].lineData[286] = 0;
  _$jscoverage['/combo-loader.js'].lineData[287] = 0;
  _$jscoverage['/combo-loader.js'].lineData[290] = 0;
  _$jscoverage['/combo-loader.js'].lineData[301] = 0;
  _$jscoverage['/combo-loader.js'].lineData[302] = 0;
  _$jscoverage['/combo-loader.js'].lineData[305] = 0;
  _$jscoverage['/combo-loader.js'].lineData[308] = 0;
  _$jscoverage['/combo-loader.js'].lineData[309] = 0;
  _$jscoverage['/combo-loader.js'].lineData[311] = 0;
  _$jscoverage['/combo-loader.js'].lineData[314] = 0;
  _$jscoverage['/combo-loader.js'].lineData[315] = 0;
  _$jscoverage['/combo-loader.js'].lineData[316] = 0;
  _$jscoverage['/combo-loader.js'].lineData[318] = 0;
  _$jscoverage['/combo-loader.js'].lineData[319] = 0;
  _$jscoverage['/combo-loader.js'].lineData[320] = 0;
  _$jscoverage['/combo-loader.js'].lineData[321] = 0;
  _$jscoverage['/combo-loader.js'].lineData[323] = 0;
  _$jscoverage['/combo-loader.js'].lineData[324] = 0;
  _$jscoverage['/combo-loader.js'].lineData[325] = 0;
  _$jscoverage['/combo-loader.js'].lineData[326] = 0;
  _$jscoverage['/combo-loader.js'].lineData[327] = 0;
  _$jscoverage['/combo-loader.js'].lineData[328] = 0;
  _$jscoverage['/combo-loader.js'].lineData[330] = 0;
  _$jscoverage['/combo-loader.js'].lineData[331] = 0;
  _$jscoverage['/combo-loader.js'].lineData[332] = 0;
  _$jscoverage['/combo-loader.js'].lineData[333] = 0;
  _$jscoverage['/combo-loader.js'].lineData[334] = 0;
  _$jscoverage['/combo-loader.js'].lineData[335] = 0;
  _$jscoverage['/combo-loader.js'].lineData[336] = 0;
  _$jscoverage['/combo-loader.js'].lineData[338] = 0;
  _$jscoverage['/combo-loader.js'].lineData[339] = 0;
  _$jscoverage['/combo-loader.js'].lineData[342] = 0;
  _$jscoverage['/combo-loader.js'].lineData[343] = 0;
  _$jscoverage['/combo-loader.js'].lineData[344] = 0;
  _$jscoverage['/combo-loader.js'].lineData[345] = 0;
  _$jscoverage['/combo-loader.js'].lineData[346] = 0;
  _$jscoverage['/combo-loader.js'].lineData[348] = 0;
  _$jscoverage['/combo-loader.js'].lineData[352] = 0;
  _$jscoverage['/combo-loader.js'].lineData[353] = 0;
  _$jscoverage['/combo-loader.js'].lineData[356] = 0;
  _$jscoverage['/combo-loader.js'].lineData[357] = 0;
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
  _$jscoverage['/combo-loader.js'].lineData[437] = 0;
  _$jscoverage['/combo-loader.js'].lineData[447] = 0;
  _$jscoverage['/combo-loader.js'].lineData[452] = 0;
  _$jscoverage['/combo-loader.js'].lineData[454] = 0;
  _$jscoverage['/combo-loader.js'].lineData[456] = 0;
  _$jscoverage['/combo-loader.js'].lineData[457] = 0;
  _$jscoverage['/combo-loader.js'].lineData[458] = 0;
  _$jscoverage['/combo-loader.js'].lineData[459] = 0;
  _$jscoverage['/combo-loader.js'].lineData[460] = 0;
  _$jscoverage['/combo-loader.js'].lineData[461] = 0;
  _$jscoverage['/combo-loader.js'].lineData[463] = 0;
  _$jscoverage['/combo-loader.js'].lineData[468] = 0;
  _$jscoverage['/combo-loader.js'].lineData[470] = 0;
  _$jscoverage['/combo-loader.js'].lineData[478] = 0;
  _$jscoverage['/combo-loader.js'].lineData[479] = 0;
  _$jscoverage['/combo-loader.js'].lineData[483] = 0;
  _$jscoverage['/combo-loader.js'].lineData[484] = 0;
  _$jscoverage['/combo-loader.js'].lineData[485] = 0;
  _$jscoverage['/combo-loader.js'].lineData[486] = 0;
  _$jscoverage['/combo-loader.js'].lineData[489] = 0;
  _$jscoverage['/combo-loader.js'].lineData[495] = 0;
  _$jscoverage['/combo-loader.js'].lineData[499] = 0;
  _$jscoverage['/combo-loader.js'].lineData[500] = 0;
  _$jscoverage['/combo-loader.js'].lineData[501] = 0;
  _$jscoverage['/combo-loader.js'].lineData[503] = 0;
  _$jscoverage['/combo-loader.js'].lineData[504] = 0;
  _$jscoverage['/combo-loader.js'].lineData[505] = 0;
  _$jscoverage['/combo-loader.js'].lineData[506] = 0;
  _$jscoverage['/combo-loader.js'].lineData[507] = 0;
  _$jscoverage['/combo-loader.js'].lineData[508] = 0;
  _$jscoverage['/combo-loader.js'].lineData[512] = 0;
  _$jscoverage['/combo-loader.js'].lineData[513] = 0;
  _$jscoverage['/combo-loader.js'].lineData[514] = 0;
  _$jscoverage['/combo-loader.js'].lineData[515] = 0;
  _$jscoverage['/combo-loader.js'].lineData[516] = 0;
  _$jscoverage['/combo-loader.js'].lineData[517] = 0;
  _$jscoverage['/combo-loader.js'].lineData[518] = 0;
  _$jscoverage['/combo-loader.js'].lineData[519] = 0;
  _$jscoverage['/combo-loader.js'].lineData[522] = 0;
  _$jscoverage['/combo-loader.js'].lineData[523] = 0;
  _$jscoverage['/combo-loader.js'].lineData[526] = 0;
  _$jscoverage['/combo-loader.js'].lineData[529] = 0;
  _$jscoverage['/combo-loader.js'].lineData[530] = 0;
  _$jscoverage['/combo-loader.js'].lineData[531] = 0;
  _$jscoverage['/combo-loader.js'].lineData[532] = 0;
  _$jscoverage['/combo-loader.js'].lineData[535] = 0;
  _$jscoverage['/combo-loader.js'].lineData[536] = 0;
  _$jscoverage['/combo-loader.js'].lineData[537] = 0;
  _$jscoverage['/combo-loader.js'].lineData[538] = 0;
  _$jscoverage['/combo-loader.js'].lineData[541] = 0;
  _$jscoverage['/combo-loader.js'].lineData[542] = 0;
  _$jscoverage['/combo-loader.js'].lineData[543] = 0;
  _$jscoverage['/combo-loader.js'].lineData[544] = 0;
  _$jscoverage['/combo-loader.js'].lineData[545] = 0;
  _$jscoverage['/combo-loader.js'].lineData[549] = 0;
  _$jscoverage['/combo-loader.js'].lineData[553] = 0;
  _$jscoverage['/combo-loader.js'].lineData[554] = 0;
  _$jscoverage['/combo-loader.js'].lineData[556] = 0;
  _$jscoverage['/combo-loader.js'].lineData[559] = 0;
  _$jscoverage['/combo-loader.js'].lineData[560] = 0;
  _$jscoverage['/combo-loader.js'].lineData[562] = 0;
  _$jscoverage['/combo-loader.js'].lineData[563] = 0;
  _$jscoverage['/combo-loader.js'].lineData[564] = 0;
  _$jscoverage['/combo-loader.js'].lineData[566] = 0;
  _$jscoverage['/combo-loader.js'].lineData[569] = 0;
  _$jscoverage['/combo-loader.js'].lineData[570] = 0;
  _$jscoverage['/combo-loader.js'].lineData[574] = 0;
  _$jscoverage['/combo-loader.js'].lineData[578] = 0;
  _$jscoverage['/combo-loader.js'].lineData[579] = 0;
  _$jscoverage['/combo-loader.js'].lineData[580] = 0;
  _$jscoverage['/combo-loader.js'].lineData[584] = 0;
  _$jscoverage['/combo-loader.js'].lineData[587] = 0;
  _$jscoverage['/combo-loader.js'].lineData[588] = 0;
  _$jscoverage['/combo-loader.js'].lineData[593] = 0;
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
  _$jscoverage['/combo-loader.js'].branchData['157'] = [];
  _$jscoverage['/combo-loader.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['159'] = [];
  _$jscoverage['/combo-loader.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['165'] = [];
  _$jscoverage['/combo-loader.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['182'] = [];
  _$jscoverage['/combo-loader.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['187'] = [];
  _$jscoverage['/combo-loader.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['191'] = [];
  _$jscoverage['/combo-loader.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['203'] = [];
  _$jscoverage['/combo-loader.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['209'] = [];
  _$jscoverage['/combo-loader.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['210'] = [];
  _$jscoverage['/combo-loader.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['221'] = [];
  _$jscoverage['/combo-loader.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['221'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['224'] = [];
  _$jscoverage['/combo-loader.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['245'] = [];
  _$jscoverage['/combo-loader.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['247'] = [];
  _$jscoverage['/combo-loader.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['272'] = [];
  _$jscoverage['/combo-loader.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['274'] = [];
  _$jscoverage['/combo-loader.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['282'] = [];
  _$jscoverage['/combo-loader.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['301'] = [];
  _$jscoverage['/combo-loader.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['308'] = [];
  _$jscoverage['/combo-loader.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['309'] = [];
  _$jscoverage['/combo-loader.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['311'] = [];
  _$jscoverage['/combo-loader.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['314'] = [];
  _$jscoverage['/combo-loader.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['315'] = [];
  _$jscoverage['/combo-loader.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['318'] = [];
  _$jscoverage['/combo-loader.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['320'] = [];
  _$jscoverage['/combo-loader.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['325'] = [];
  _$jscoverage['/combo-loader.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['330'] = [];
  _$jscoverage['/combo-loader.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['333'] = [];
  _$jscoverage['/combo-loader.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['333'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['334'] = [];
  _$jscoverage['/combo-loader.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['342'] = [];
  _$jscoverage['/combo-loader.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['343'] = [];
  _$jscoverage['/combo-loader.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['356'] = [];
  _$jscoverage['/combo-loader.js'].branchData['356'][1] = new BranchData();
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
  _$jscoverage['/combo-loader.js'].branchData['483'] = [];
  _$jscoverage['/combo-loader.js'].branchData['483'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['486'] = [];
  _$jscoverage['/combo-loader.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['503'] = [];
  _$jscoverage['/combo-loader.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['504'] = [];
  _$jscoverage['/combo-loader.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['505'] = [];
  _$jscoverage['/combo-loader.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['507'] = [];
  _$jscoverage['/combo-loader.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['512'] = [];
  _$jscoverage['/combo-loader.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['512'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['512'][3] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['522'] = [];
  _$jscoverage['/combo-loader.js'].branchData['522'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['536'] = [];
  _$jscoverage['/combo-loader.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['542'] = [];
  _$jscoverage['/combo-loader.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['553'] = [];
  _$jscoverage['/combo-loader.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['562'] = [];
  _$jscoverage['/combo-loader.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['562'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['562'][3] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['579'] = [];
  _$jscoverage['/combo-loader.js'].branchData['579'][1] = new BranchData();
}
_$jscoverage['/combo-loader.js'].branchData['579'][1].init(48, 10, '!self.head');
function visit87_579_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['562'][3].init(131, 23, 'status === Status.ERROR');
function visit86_562_3(result) {
  _$jscoverage['/combo-loader.js'].branchData['562'][3].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['562'][2].init(104, 23, 'status >= Status.LOADED');
function visit85_562_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['562'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['562'][1].init(104, 50, 'status >= Status.LOADED || status === Status.ERROR');
function visit84_562_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['553'][1].init(18, 14, '!this.callback');
function visit83_553_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['542'][1].init(35, 20, 'comboRes[type] || []');
function visit82_542_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['536'][1].init(35, 20, 'comboRes[type] || []');
function visit81_536_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['522'][1].init(2828, 23, 'currentComboUrls.length');
function visit80_522_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['522'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['512'][3].init(1320, 34, 'getSentUrl().length > maxUrlLength');
function visit79_512_3(result) {
  _$jscoverage['/combo-loader.js'].branchData['512'][3].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['512'][2].init(1280, 36, 'currentComboUrls.length > maxFileNum');
function visit78_512_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['512'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['512'][1].init(1280, 74, 'currentComboUrls.length > maxFileNum || getSentUrl().length > maxUrlLength');
function visit77_512_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['507'][1].init(114, 20, 'commonPrefix === \'/\'');
function visit76_507_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['505'][1].init(996, 19, 'commonPrefix !== \'\'');
function visit75_505_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['504'][1].init(41, 27, 'subPath.indexOf(\'/\') !== -1');
function visit74_504_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['503'][1].init(849, 26, 'commonPrefix === undefined');
function visit73_503_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['486'][1].init(129, 157, '!currentMod.getPackage().isCombine() || !Utils.startsWith(url, basePrefix)');
function visit72_486_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['483'][1].init(1052, 19, 'i < sendMods.length');
function visit71_483_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['483'][1].ranCondition(result);
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
}_$jscoverage['/combo-loader.js'].branchData['356'][1].init(1909, 9, '\'@DEBUG@\'');
function visit56_356_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['343'][1].init(26, 23, 'stack.indexOf(m) !== -1');
function visit55_343_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['342'][1].init(851, 26, '\'@DEBUG@\' && stack.indexOf');
function visit54_342_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['334'][1].init(26, 21, 'modStatus !== LOADING');
function visit53_334_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['333'][2].init(530, 20, 'modStatus !== LOADED');
function visit52_333_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['333'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['333'][1].init(530, 43, 'modStatus !== LOADED && !mod.contains(self)');
function visit51_333_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['330'][1].init(413, 18, 'modStatus > LOADED');
function visit50_330_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['325'][1].init(235, 26, 'modStatus === Status.ERROR');
function visit49_325_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['320'][1].init(56, 8, 'cache[m]');
function visit48_320_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['318'][1].init(515, 19, 'i < modNames.length');
function visit47_318_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['315'][1].init(418, 9, '\'@DEBUG@\'');
function visit46_315_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['314'][1].init(388, 11, 'cache || {}');
function visit45_314_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['311'][1].init(283, 9, 'ret || []');
function visit44_311_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['309'][1].init(26, 11, 'stack || []');
function visit43_309_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['308'][1].init(198, 9, '\'@DEBUG@\'');
function visit42_308_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['301'][1].init(18, 16, '!modNames.length');
function visit41_301_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['282'][1].init(153, 12, '!mod.factory');
function visit40_282_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['274'][1].init(26, 9, '\'@DEBUG@\'');
function visit39_274_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['272'][1].init(1351, 12, 'comboUrls.js');
function visit38_272_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['247'][1].init(26, 9, '\'@DEBUG@\'');
function visit37_247_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['245'][1].init(227, 13, 'comboUrls.css');
function visit36_245_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['224'][1].init(121, 27, 'i < currentComboUrls.length');
function visit35_224_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['221'][2].init(30, 27, 'currentComboUrls.length > 1');
function visit34_221_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['221'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['221'][1].init(14, 43, 'commonPrefix && currentComboUrls.length > 1');
function visit33_221_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['210'][1].init(18, 19, 'str1[i] !== str2[i]');
function visit32_210_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['209'][1].init(444, 5, 'i < l');
function visit31_209_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['203'][1].init(148, 20, 'protocolIndex !== -1');
function visit30_203_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['191'][1].init(232, 9, 'ms.length');
function visit29_191_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['187'][1].init(26, 19, 'm.status === LOADED');
function visit28_187_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['182'][1].init(5987, 9, '\'@DEBUG@\'');
function visit27_182_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['165'][1].init(378, 2, 're');
function visit26_165_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['159'][1].init(52, 35, 'script.readyState === \'interactive\'');
function visit25_159_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['157'][1].init(178, 6, 'i >= 0');
function visit24_157_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['157'][1].ranCondition(result);
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
}_$jscoverage['/combo-loader.js'].branchData['52'][1].init(829, 11, '!rs.combine');
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
}_$jscoverage['/combo-loader.js'].branchData['19'][1].init(292, 13, 'Utils.ie < 10');
function visit1_19_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/combo-loader.js'].functionData[0]++;
  _$jscoverage['/combo-loader.js'].lineData[7]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/combo-loader.js'].lineData[10]++;
  var Loader = S.Loader, Config = S.Config, Status = Loader.Status, Utils = Loader.Utils, each = Utils.each, getHash = Utils.getHash, LOADING = Status.LOADING, LOADED = Status.LOADED, ERROR = Status.ERROR, oldIE = visit1_19_1(Utils.ie < 10);
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
    Utils.registerModule(mod.name, currentMod.factory, currentMod.config);
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
      Utils.registerModule(name, factory, config);
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
    Utils.registerModule(name, factory, config);
  }
};
  _$jscoverage['/combo-loader.js'].lineData[150]++;
  function findModuleNameByInteractive() {
    _$jscoverage['/combo-loader.js'].functionData[9]++;
    _$jscoverage['/combo-loader.js'].lineData[151]++;
    var scripts = document.getElementsByTagName('script'), re, i, name, script;
    _$jscoverage['/combo-loader.js'].lineData[157]++;
    for (i = scripts.length - 1; visit24_157_1(i >= 0); i--) {
      _$jscoverage['/combo-loader.js'].lineData[158]++;
      script = scripts[i];
      _$jscoverage['/combo-loader.js'].lineData[159]++;
      if (visit25_159_1(script.readyState === 'interactive')) {
        _$jscoverage['/combo-loader.js'].lineData[160]++;
        re = script;
        _$jscoverage['/combo-loader.js'].lineData[161]++;
        break;
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[165]++;
    if (visit26_165_1(re)) {
      _$jscoverage['/combo-loader.js'].lineData[166]++;
      name = re.getAttribute('data-mod-name');
    } else {
      _$jscoverage['/combo-loader.js'].lineData[173]++;
      logger.debug('can not find interactive script,time diff : ' + (+new Date() - startLoadModTime));
      _$jscoverage['/combo-loader.js'].lineData[174]++;
      logger.debug('old_ie get mod name from cache : ' + startLoadModName);
      _$jscoverage['/combo-loader.js'].lineData[175]++;
      name = startLoadModName;
    }
    _$jscoverage['/combo-loader.js'].lineData[177]++;
    return name;
  }
  _$jscoverage['/combo-loader.js'].lineData[180]++;
  var debugRemoteModules;
  _$jscoverage['/combo-loader.js'].lineData[182]++;
  if (visit27_182_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[183]++;
    debugRemoteModules = function(rss) {
  _$jscoverage['/combo-loader.js'].functionData[10]++;
  _$jscoverage['/combo-loader.js'].lineData[184]++;
  each(rss, function(rs) {
  _$jscoverage['/combo-loader.js'].functionData[11]++;
  _$jscoverage['/combo-loader.js'].lineData[185]++;
  var ms = [];
  _$jscoverage['/combo-loader.js'].lineData[186]++;
  each(rs.mods, function(m) {
  _$jscoverage['/combo-loader.js'].functionData[12]++;
  _$jscoverage['/combo-loader.js'].lineData[187]++;
  if (visit28_187_1(m.status === LOADED)) {
    _$jscoverage['/combo-loader.js'].lineData[188]++;
    ms.push(m.name);
  }
});
  _$jscoverage['/combo-loader.js'].lineData[191]++;
  if (visit29_191_1(ms.length)) {
    _$jscoverage['/combo-loader.js'].lineData[192]++;
    logger.info('load remote modules: "' + ms.join(', ') + '" from: "' + rs.url + '"');
  }
});
};
  }
  _$jscoverage['/combo-loader.js'].lineData[198]++;
  function getCommonPathPrefix(str1, str2) {
    _$jscoverage['/combo-loader.js'].functionData[13]++;
    _$jscoverage['/combo-loader.js'].lineData[201]++;
    var protocolIndex = str1.indexOf('//');
    _$jscoverage['/combo-loader.js'].lineData[202]++;
    var prefix = '';
    _$jscoverage['/combo-loader.js'].lineData[203]++;
    if (visit30_203_1(protocolIndex !== -1)) {
      _$jscoverage['/combo-loader.js'].lineData[204]++;
      prefix = str1.substring(0, str1.indexOf('//') + 2);
    }
    _$jscoverage['/combo-loader.js'].lineData[206]++;
    str1 = str1.substring(prefix.length).split(/\//);
    _$jscoverage['/combo-loader.js'].lineData[207]++;
    str2 = str2.substring(prefix.length).split(/\//);
    _$jscoverage['/combo-loader.js'].lineData[208]++;
    var l = Math.min(str1.length, str2.length);
    _$jscoverage['/combo-loader.js'].lineData[209]++;
    for (var i = 0; visit31_209_1(i < l); i++) {
      _$jscoverage['/combo-loader.js'].lineData[210]++;
      if (visit32_210_1(str1[i] !== str2[i])) {
        _$jscoverage['/combo-loader.js'].lineData[211]++;
        break;
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[214]++;
    return prefix + str1.slice(0, i).join('/') + '/';
  }
  _$jscoverage['/combo-loader.js'].lineData[220]++;
  function getUrlConsiderCommonPrefix(commonPrefix, currentComboUrls, basePrefix, comboPrefix, comboSep, suffix) {
    _$jscoverage['/combo-loader.js'].functionData[14]++;
    _$jscoverage['/combo-loader.js'].lineData[221]++;
    if (visit33_221_1(commonPrefix && visit34_221_2(currentComboUrls.length > 1))) {
      _$jscoverage['/combo-loader.js'].lineData[222]++;
      var commonPrefixLen = commonPrefix.length;
      _$jscoverage['/combo-loader.js'].lineData[223]++;
      var currentUrls = [];
      _$jscoverage['/combo-loader.js'].lineData[224]++;
      for (var i = 0; visit35_224_1(i < currentComboUrls.length); i++) {
        _$jscoverage['/combo-loader.js'].lineData[225]++;
        currentUrls[i] = currentComboUrls[i].substring(commonPrefixLen);
      }
      _$jscoverage['/combo-loader.js'].lineData[227]++;
      return basePrefix + commonPrefix + comboPrefix + currentUrls.join(comboSep) + suffix;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[229]++;
      return basePrefix + comboPrefix + currentComboUrls.join(comboSep) + suffix;
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[233]++;
  Utils.mix(ComboLoader.prototype, {
  use: function(allMods) {
  _$jscoverage['/combo-loader.js'].functionData[15]++;
  _$jscoverage['/combo-loader.js'].lineData[238]++;
  var self = this, comboUrls, timeout = Config.timeout;
  _$jscoverage['/combo-loader.js'].lineData[242]++;
  comboUrls = self.getComboUrls(allMods);
  _$jscoverage['/combo-loader.js'].lineData[245]++;
  if (visit36_245_1(comboUrls.css)) {
    _$jscoverage['/combo-loader.js'].lineData[246]++;
    loadScripts(comboUrls.css, function(success, error) {
  _$jscoverage['/combo-loader.js'].functionData[16]++;
  _$jscoverage['/combo-loader.js'].lineData[247]++;
  if (visit37_247_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[248]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/combo-loader.js'].lineData[251]++;
  each(success, function(one) {
  _$jscoverage['/combo-loader.js'].functionData[17]++;
  _$jscoverage['/combo-loader.js'].lineData[252]++;
  each(one.mods, function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[18]++;
  _$jscoverage['/combo-loader.js'].lineData[253]++;
  Utils.registerModule(mod.name, Utils.noop);
  _$jscoverage['/combo-loader.js'].lineData[255]++;
  mod.flush();
});
});
  _$jscoverage['/combo-loader.js'].lineData[259]++;
  each(error, function(one) {
  _$jscoverage['/combo-loader.js'].functionData[19]++;
  _$jscoverage['/combo-loader.js'].lineData[260]++;
  each(one.mods, function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[20]++;
  _$jscoverage['/combo-loader.js'].lineData[261]++;
  var msg = mod.name + ' is not loaded! can not find module in url : ' + one.url;
  _$jscoverage['/combo-loader.js'].lineData[262]++;
  S.log(msg, 'error');
  _$jscoverage['/combo-loader.js'].lineData[263]++;
  mod.status = ERROR;
  _$jscoverage['/combo-loader.js'].lineData[265]++;
  mod.flush();
});
});
}, timeout);
  }
  _$jscoverage['/combo-loader.js'].lineData[272]++;
  if (visit38_272_1(comboUrls.js)) {
    _$jscoverage['/combo-loader.js'].lineData[273]++;
    loadScripts(comboUrls.js, function(success) {
  _$jscoverage['/combo-loader.js'].functionData[21]++;
  _$jscoverage['/combo-loader.js'].lineData[274]++;
  if (visit39_274_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[275]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/combo-loader.js'].lineData[278]++;
  each(comboUrls.js, function(one) {
  _$jscoverage['/combo-loader.js'].functionData[22]++;
  _$jscoverage['/combo-loader.js'].lineData[279]++;
  each(one.mods, function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[23]++;
  _$jscoverage['/combo-loader.js'].lineData[282]++;
  if (visit40_282_1(!mod.factory)) {
    _$jscoverage['/combo-loader.js'].lineData[283]++;
    var msg = mod.name + ' is not loaded! can not find module in url : ' + one.url;
    _$jscoverage['/combo-loader.js'].lineData[286]++;
    S.log(msg, 'error');
    _$jscoverage['/combo-loader.js'].lineData[287]++;
    mod.status = ERROR;
  }
  _$jscoverage['/combo-loader.js'].lineData[290]++;
  mod.flush();
});
});
}, timeout);
  }
}, 
  calculate: function(modNames, errorList, stack, cache, ret) {
  _$jscoverage['/combo-loader.js'].functionData[24]++;
  _$jscoverage['/combo-loader.js'].lineData[301]++;
  if (visit41_301_1(!modNames.length)) {
    _$jscoverage['/combo-loader.js'].lineData[302]++;
    return [];
  }
  _$jscoverage['/combo-loader.js'].lineData[305]++;
  var i, m, mod, modStatus, stackDepth, self = this;
  _$jscoverage['/combo-loader.js'].lineData[308]++;
  if (visit42_308_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[309]++;
    stack = visit43_309_1(stack || []);
  }
  _$jscoverage['/combo-loader.js'].lineData[311]++;
  ret = visit44_311_1(ret || []);
  _$jscoverage['/combo-loader.js'].lineData[314]++;
  cache = visit45_314_1(cache || {});
  _$jscoverage['/combo-loader.js'].lineData[315]++;
  if (visit46_315_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[316]++;
    stackDepth = stack.length;
  }
  _$jscoverage['/combo-loader.js'].lineData[318]++;
  for (i = 0; visit47_318_1(i < modNames.length); i++) {
    _$jscoverage['/combo-loader.js'].lineData[319]++;
    m = modNames[i];
    _$jscoverage['/combo-loader.js'].lineData[320]++;
    if (visit48_320_1(cache[m])) {
      _$jscoverage['/combo-loader.js'].lineData[321]++;
      continue;
    }
    _$jscoverage['/combo-loader.js'].lineData[323]++;
    mod = Utils.getOrCreateModuleInfo(m);
    _$jscoverage['/combo-loader.js'].lineData[324]++;
    modStatus = mod.status;
    _$jscoverage['/combo-loader.js'].lineData[325]++;
    if (visit49_325_1(modStatus === Status.ERROR)) {
      _$jscoverage['/combo-loader.js'].lineData[326]++;
      errorList.push(mod);
      _$jscoverage['/combo-loader.js'].lineData[327]++;
      cache[m] = 1;
      _$jscoverage['/combo-loader.js'].lineData[328]++;
      continue;
    }
    _$jscoverage['/combo-loader.js'].lineData[330]++;
    if (visit50_330_1(modStatus > LOADED)) {
      _$jscoverage['/combo-loader.js'].lineData[331]++;
      cache[m] = 1;
      _$jscoverage['/combo-loader.js'].lineData[332]++;
      continue;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[333]++;
      if (visit51_333_1(visit52_333_2(modStatus !== LOADED) && !mod.contains(self))) {
        _$jscoverage['/combo-loader.js'].lineData[334]++;
        if (visit53_334_1(modStatus !== LOADING)) {
          _$jscoverage['/combo-loader.js'].lineData[335]++;
          mod.status = LOADING;
          _$jscoverage['/combo-loader.js'].lineData[336]++;
          ret.push(mod);
        }
        _$jscoverage['/combo-loader.js'].lineData[338]++;
        mod.add(self);
        _$jscoverage['/combo-loader.js'].lineData[339]++;
        self.wait(mod);
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[342]++;
    if (visit54_342_1('@DEBUG@' && stack.indexOf)) {
      _$jscoverage['/combo-loader.js'].lineData[343]++;
      if (visit55_343_1(stack.indexOf(m) !== -1)) {
        _$jscoverage['/combo-loader.js'].lineData[344]++;
        S.log('find cyclic dependency between mods: ' + stack, 'warn');
        _$jscoverage['/combo-loader.js'].lineData[345]++;
        cache[m] = 1;
        _$jscoverage['/combo-loader.js'].lineData[346]++;
        continue;
      } else {
        _$jscoverage['/combo-loader.js'].lineData[348]++;
        stack.push(m);
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[352]++;
    self.calculate(mod.getNormalizedRequires(), errorList, stack, cache, ret);
    _$jscoverage['/combo-loader.js'].lineData[353]++;
    cache[m] = 1;
  }
  _$jscoverage['/combo-loader.js'].lineData[356]++;
  if (visit56_356_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[357]++;
    stack.length = stackDepth;
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
  _$jscoverage['/combo-loader.js'].lineData[437]++;
  return {
  groups: groups, 
  normals: normals};
}, 
  getComboUrls: function(mods) {
  _$jscoverage['/combo-loader.js'].functionData[27]++;
  _$jscoverage['/combo-loader.js'].lineData[447]++;
  var comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/combo-loader.js'].lineData[452]++;
  var comboMods = this.getComboMods(mods);
  _$jscoverage['/combo-loader.js'].lineData[454]++;
  var comboRes = {};
  _$jscoverage['/combo-loader.js'].lineData[456]++;
  function processSamePrefixUrlMods(type, basePrefix, sendMods) {
    _$jscoverage['/combo-loader.js'].functionData[28]++;
    _$jscoverage['/combo-loader.js'].lineData[457]++;
    var currentComboUrls = [];
    _$jscoverage['/combo-loader.js'].lineData[458]++;
    var currentComboMods = [];
    _$jscoverage['/combo-loader.js'].lineData[459]++;
    var tag = sendMods.tag;
    _$jscoverage['/combo-loader.js'].lineData[460]++;
    var charset = sendMods.charset;
    _$jscoverage['/combo-loader.js'].lineData[461]++;
    var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : '');
    _$jscoverage['/combo-loader.js'].lineData[463]++;
    var baseLen = basePrefix.length, commonPrefix, res = [];
    _$jscoverage['/combo-loader.js'].lineData[468]++;
    function pushComboUrl(sentUrl) {
      _$jscoverage['/combo-loader.js'].functionData[29]++;
      _$jscoverage['/combo-loader.js'].lineData[470]++;
      res.push({
  combine: 1, 
  url: sentUrl, 
  charset: charset, 
  mods: currentComboMods});
    }
    _$jscoverage['/combo-loader.js'].lineData[478]++;
    function getSentUrl() {
      _$jscoverage['/combo-loader.js'].functionData[30]++;
      _$jscoverage['/combo-loader.js'].lineData[479]++;
      return getUrlConsiderCommonPrefix(commonPrefix, currentComboUrls, basePrefix, comboPrefix, comboSep, suffix);
    }
    _$jscoverage['/combo-loader.js'].lineData[483]++;
    for (var i = 0; visit71_483_1(i < sendMods.length); i++) {
      _$jscoverage['/combo-loader.js'].lineData[484]++;
      var currentMod = sendMods[i];
      _$jscoverage['/combo-loader.js'].lineData[485]++;
      var url = currentMod.getUrl();
      _$jscoverage['/combo-loader.js'].lineData[486]++;
      if (visit72_486_1(!currentMod.getPackage().isCombine() || !Utils.startsWith(url, basePrefix))) {
        _$jscoverage['/combo-loader.js'].lineData[489]++;
        res.push({
  combine: 0, 
  url: url, 
  charset: charset, 
  mods: [currentMod]});
        _$jscoverage['/combo-loader.js'].lineData[495]++;
        continue;
      }
      _$jscoverage['/combo-loader.js'].lineData[499]++;
      var subPath = url.slice(baseLen).replace(/\?.*$/, '');
      _$jscoverage['/combo-loader.js'].lineData[500]++;
      currentComboUrls.push(subPath);
      _$jscoverage['/combo-loader.js'].lineData[501]++;
      currentComboMods.push(currentMod);
      _$jscoverage['/combo-loader.js'].lineData[503]++;
      if (visit73_503_1(commonPrefix === undefined)) {
        _$jscoverage['/combo-loader.js'].lineData[504]++;
        commonPrefix = visit74_504_1(subPath.indexOf('/') !== -1) ? subPath : '';
      } else {
        _$jscoverage['/combo-loader.js'].lineData[505]++;
        if (visit75_505_1(commonPrefix !== '')) {
          _$jscoverage['/combo-loader.js'].lineData[506]++;
          commonPrefix = getCommonPathPrefix(commonPrefix, subPath);
          _$jscoverage['/combo-loader.js'].lineData[507]++;
          if (visit76_507_1(commonPrefix === '/')) {
            _$jscoverage['/combo-loader.js'].lineData[508]++;
            commonPrefix = '';
          }
        }
      }
      _$jscoverage['/combo-loader.js'].lineData[512]++;
      if (visit77_512_1(visit78_512_2(currentComboUrls.length > maxFileNum) || visit79_512_3(getSentUrl().length > maxUrlLength))) {
        _$jscoverage['/combo-loader.js'].lineData[513]++;
        currentComboUrls.pop();
        _$jscoverage['/combo-loader.js'].lineData[514]++;
        currentComboMods.pop();
        _$jscoverage['/combo-loader.js'].lineData[515]++;
        pushComboUrl(getSentUrl());
        _$jscoverage['/combo-loader.js'].lineData[516]++;
        currentComboUrls = [];
        _$jscoverage['/combo-loader.js'].lineData[517]++;
        currentComboMods = [];
        _$jscoverage['/combo-loader.js'].lineData[518]++;
        commonPrefix = undefined;
        _$jscoverage['/combo-loader.js'].lineData[519]++;
        i--;
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[522]++;
    if (visit80_522_1(currentComboUrls.length)) {
      _$jscoverage['/combo-loader.js'].lineData[523]++;
      pushComboUrl(getSentUrl());
    }
    _$jscoverage['/combo-loader.js'].lineData[526]++;
    comboRes[type].push.apply(comboRes[type], res);
  }
  _$jscoverage['/combo-loader.js'].lineData[529]++;
  var type, prefix;
  _$jscoverage['/combo-loader.js'].lineData[530]++;
  var normals = comboMods.normals;
  _$jscoverage['/combo-loader.js'].lineData[531]++;
  var groups = comboMods.groups;
  _$jscoverage['/combo-loader.js'].lineData[532]++;
  var group;
  _$jscoverage['/combo-loader.js'].lineData[535]++;
  for (type in normals) {
    _$jscoverage['/combo-loader.js'].lineData[536]++;
    comboRes[type] = visit81_536_1(comboRes[type] || []);
    _$jscoverage['/combo-loader.js'].lineData[537]++;
    for (prefix in normals[type]) {
      _$jscoverage['/combo-loader.js'].lineData[538]++;
      processSamePrefixUrlMods(type, prefix, normals[type][prefix]);
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[541]++;
  for (type in groups) {
    _$jscoverage['/combo-loader.js'].lineData[542]++;
    comboRes[type] = visit82_542_1(comboRes[type] || []);
    _$jscoverage['/combo-loader.js'].lineData[543]++;
    for (group in groups[type]) {
      _$jscoverage['/combo-loader.js'].lineData[544]++;
      for (prefix in groups[type][group]) {
        _$jscoverage['/combo-loader.js'].lineData[545]++;
        processSamePrefixUrlMods(type, prefix, groups[type][group][prefix]);
      }
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[549]++;
  return comboRes;
}, 
  flush: function() {
  _$jscoverage['/combo-loader.js'].functionData[31]++;
  _$jscoverage['/combo-loader.js'].lineData[553]++;
  if (visit83_553_1(!this.callback)) {
    _$jscoverage['/combo-loader.js'].lineData[554]++;
    return;
  }
  _$jscoverage['/combo-loader.js'].lineData[556]++;
  var self = this, head = self.head, callback = self.callback;
  _$jscoverage['/combo-loader.js'].lineData[559]++;
  while (head) {
    _$jscoverage['/combo-loader.js'].lineData[560]++;
    var node = head.node, status = node.status;
    _$jscoverage['/combo-loader.js'].lineData[562]++;
    if (visit84_562_1(visit85_562_2(status >= Status.LOADED) || visit86_562_3(status === Status.ERROR))) {
      _$jscoverage['/combo-loader.js'].lineData[563]++;
      node.remove(self);
      _$jscoverage['/combo-loader.js'].lineData[564]++;
      head = self.head = head.next;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[566]++;
      return;
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[569]++;
  self.callback = null;
  _$jscoverage['/combo-loader.js'].lineData[570]++;
  callback();
}, 
  isCompleteLoading: function() {
  _$jscoverage['/combo-loader.js'].functionData[32]++;
  _$jscoverage['/combo-loader.js'].lineData[574]++;
  return !this.head;
}, 
  wait: function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[33]++;
  _$jscoverage['/combo-loader.js'].lineData[578]++;
  var self = this;
  _$jscoverage['/combo-loader.js'].lineData[579]++;
  if (visit87_579_1(!self.head)) {
    _$jscoverage['/combo-loader.js'].lineData[580]++;
    self.tail = self.head = {
  node: mod};
  } else {
    _$jscoverage['/combo-loader.js'].lineData[584]++;
    var newNode = {
  node: mod};
    _$jscoverage['/combo-loader.js'].lineData[587]++;
    self.tail.next = newNode;
    _$jscoverage['/combo-loader.js'].lineData[588]++;
    self.tail = newNode;
  }
}});
  _$jscoverage['/combo-loader.js'].lineData[593]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
