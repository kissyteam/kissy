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
  _$jscoverage['/combo-loader.js'].lineData[22] = 0;
  _$jscoverage['/combo-loader.js'].lineData[24] = 0;
  _$jscoverage['/combo-loader.js'].lineData[25] = 0;
  _$jscoverage['/combo-loader.js'].lineData[29] = 0;
  _$jscoverage['/combo-loader.js'].lineData[30] = 0;
  _$jscoverage['/combo-loader.js'].lineData[31] = 0;
  _$jscoverage['/combo-loader.js'].lineData[35] = 0;
  _$jscoverage['/combo-loader.js'].lineData[36] = 0;
  _$jscoverage['/combo-loader.js'].lineData[37] = 0;
  _$jscoverage['/combo-loader.js'].lineData[40] = 0;
  _$jscoverage['/combo-loader.js'].lineData[41] = 0;
  _$jscoverage['/combo-loader.js'].lineData[43] = 0;
  _$jscoverage['/combo-loader.js'].lineData[44] = 0;
  _$jscoverage['/combo-loader.js'].lineData[45] = 0;
  _$jscoverage['/combo-loader.js'].lineData[47] = 0;
  _$jscoverage['/combo-loader.js'].lineData[50] = 0;
  _$jscoverage['/combo-loader.js'].lineData[51] = 0;
  _$jscoverage['/combo-loader.js'].lineData[55] = 0;
  _$jscoverage['/combo-loader.js'].lineData[56] = 0;
  _$jscoverage['/combo-loader.js'].lineData[57] = 0;
  _$jscoverage['/combo-loader.js'].lineData[58] = 0;
  _$jscoverage['/combo-loader.js'].lineData[59] = 0;
  _$jscoverage['/combo-loader.js'].lineData[60] = 0;
  _$jscoverage['/combo-loader.js'].lineData[61] = 0;
  _$jscoverage['/combo-loader.js'].lineData[62] = 0;
  _$jscoverage['/combo-loader.js'].lineData[64] = 0;
  _$jscoverage['/combo-loader.js'].lineData[69] = 0;
  _$jscoverage['/combo-loader.js'].lineData[73] = 0;
  _$jscoverage['/combo-loader.js'].lineData[81] = 0;
  _$jscoverage['/combo-loader.js'].lineData[82] = 0;
  _$jscoverage['/combo-loader.js'].lineData[85] = 0;
  _$jscoverage['/combo-loader.js'].lineData[86] = 0;
  _$jscoverage['/combo-loader.js'].lineData[87] = 0;
  _$jscoverage['/combo-loader.js'].lineData[89] = 0;
  _$jscoverage['/combo-loader.js'].lineData[92] = 0;
  _$jscoverage['/combo-loader.js'].lineData[93] = 0;
  _$jscoverage['/combo-loader.js'].lineData[94] = 0;
  _$jscoverage['/combo-loader.js'].lineData[95] = 0;
  _$jscoverage['/combo-loader.js'].lineData[96] = 0;
  _$jscoverage['/combo-loader.js'].lineData[100] = 0;
  _$jscoverage['/combo-loader.js'].lineData[101] = 0;
  _$jscoverage['/combo-loader.js'].lineData[104] = 0;
  _$jscoverage['/combo-loader.js'].lineData[107] = 0;
  _$jscoverage['/combo-loader.js'].lineData[109] = 0;
  _$jscoverage['/combo-loader.js'].lineData[110] = 0;
  _$jscoverage['/combo-loader.js'].lineData[111] = 0;
  _$jscoverage['/combo-loader.js'].lineData[112] = 0;
  _$jscoverage['/combo-loader.js'].lineData[118] = 0;
  _$jscoverage['/combo-loader.js'].lineData[119] = 0;
  _$jscoverage['/combo-loader.js'].lineData[120] = 0;
  _$jscoverage['/combo-loader.js'].lineData[121] = 0;
  _$jscoverage['/combo-loader.js'].lineData[122] = 0;
  _$jscoverage['/combo-loader.js'].lineData[124] = 0;
  _$jscoverage['/combo-loader.js'].lineData[126] = 0;
  _$jscoverage['/combo-loader.js'].lineData[127] = 0;
  _$jscoverage['/combo-loader.js'].lineData[128] = 0;
  _$jscoverage['/combo-loader.js'].lineData[131] = 0;
  _$jscoverage['/combo-loader.js'].lineData[138] = 0;
  _$jscoverage['/combo-loader.js'].lineData[139] = 0;
  _$jscoverage['/combo-loader.js'].lineData[140] = 0;
  _$jscoverage['/combo-loader.js'].lineData[142] = 0;
  _$jscoverage['/combo-loader.js'].lineData[144] = 0;
  _$jscoverage['/combo-loader.js'].lineData[145] = 0;
  _$jscoverage['/combo-loader.js'].lineData[151] = 0;
  _$jscoverage['/combo-loader.js'].lineData[152] = 0;
  _$jscoverage['/combo-loader.js'].lineData[158] = 0;
  _$jscoverage['/combo-loader.js'].lineData[159] = 0;
  _$jscoverage['/combo-loader.js'].lineData[160] = 0;
  _$jscoverage['/combo-loader.js'].lineData[161] = 0;
  _$jscoverage['/combo-loader.js'].lineData[162] = 0;
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
  _$jscoverage['/combo-loader.js'].lineData[199] = 0;
  _$jscoverage['/combo-loader.js'].lineData[200] = 0;
  _$jscoverage['/combo-loader.js'].lineData[201] = 0;
  _$jscoverage['/combo-loader.js'].lineData[202] = 0;
  _$jscoverage['/combo-loader.js'].lineData[203] = 0;
  _$jscoverage['/combo-loader.js'].lineData[204] = 0;
  _$jscoverage['/combo-loader.js'].lineData[207] = 0;
  _$jscoverage['/combo-loader.js'].lineData[210] = 0;
  _$jscoverage['/combo-loader.js'].lineData[215] = 0;
  _$jscoverage['/combo-loader.js'].lineData[220] = 0;
  _$jscoverage['/combo-loader.js'].lineData[222] = 0;
  _$jscoverage['/combo-loader.js'].lineData[224] = 0;
  _$jscoverage['/combo-loader.js'].lineData[227] = 0;
  _$jscoverage['/combo-loader.js'].lineData[228] = 0;
  _$jscoverage['/combo-loader.js'].lineData[229] = 0;
  _$jscoverage['/combo-loader.js'].lineData[230] = 0;
  _$jscoverage['/combo-loader.js'].lineData[233] = 0;
  _$jscoverage['/combo-loader.js'].lineData[234] = 0;
  _$jscoverage['/combo-loader.js'].lineData[235] = 0;
  _$jscoverage['/combo-loader.js'].lineData[237] = 0;
  _$jscoverage['/combo-loader.js'].lineData[241] = 0;
  _$jscoverage['/combo-loader.js'].lineData[242] = 0;
  _$jscoverage['/combo-loader.js'].lineData[243] = 0;
  _$jscoverage['/combo-loader.js'].lineData[246] = 0;
  _$jscoverage['/combo-loader.js'].lineData[247] = 0;
  _$jscoverage['/combo-loader.js'].lineData[249] = 0;
  _$jscoverage['/combo-loader.js'].lineData[256] = 0;
  _$jscoverage['/combo-loader.js'].lineData[257] = 0;
  _$jscoverage['/combo-loader.js'].lineData[258] = 0;
  _$jscoverage['/combo-loader.js'].lineData[259] = 0;
  _$jscoverage['/combo-loader.js'].lineData[262] = 0;
  _$jscoverage['/combo-loader.js'].lineData[263] = 0;
  _$jscoverage['/combo-loader.js'].lineData[266] = 0;
  _$jscoverage['/combo-loader.js'].lineData[267] = 0;
  _$jscoverage['/combo-loader.js'].lineData[270] = 0;
  _$jscoverage['/combo-loader.js'].lineData[271] = 0;
  _$jscoverage['/combo-loader.js'].lineData[274] = 0;
  _$jscoverage['/combo-loader.js'].lineData[285] = 0;
  _$jscoverage['/combo-loader.js'].lineData[292] = 0;
  _$jscoverage['/combo-loader.js'].lineData[295] = 0;
  _$jscoverage['/combo-loader.js'].lineData[297] = 0;
  _$jscoverage['/combo-loader.js'].lineData[298] = 0;
  _$jscoverage['/combo-loader.js'].lineData[299] = 0;
  _$jscoverage['/combo-loader.js'].lineData[300] = 0;
  _$jscoverage['/combo-loader.js'].lineData[302] = 0;
  _$jscoverage['/combo-loader.js'].lineData[303] = 0;
  _$jscoverage['/combo-loader.js'].lineData[304] = 0;
  _$jscoverage['/combo-loader.js'].lineData[305] = 0;
  _$jscoverage['/combo-loader.js'].lineData[306] = 0;
  _$jscoverage['/combo-loader.js'].lineData[308] = 0;
  _$jscoverage['/combo-loader.js'].lineData[309] = 0;
  _$jscoverage['/combo-loader.js'].lineData[310] = 0;
  _$jscoverage['/combo-loader.js'].lineData[311] = 0;
  _$jscoverage['/combo-loader.js'].lineData[312] = 0;
  _$jscoverage['/combo-loader.js'].lineData[315] = 0;
  _$jscoverage['/combo-loader.js'].lineData[316] = 0;
  _$jscoverage['/combo-loader.js'].lineData[318] = 0;
  _$jscoverage['/combo-loader.js'].lineData[320] = 0;
  _$jscoverage['/combo-loader.js'].lineData[323] = 0;
  _$jscoverage['/combo-loader.js'].lineData[326] = 0;
  _$jscoverage['/combo-loader.js'].lineData[333] = 0;
  _$jscoverage['/combo-loader.js'].lineData[341] = 0;
  _$jscoverage['/combo-loader.js'].lineData[342] = 0;
  _$jscoverage['/combo-loader.js'].lineData[343] = 0;
  _$jscoverage['/combo-loader.js'].lineData[344] = 0;
  _$jscoverage['/combo-loader.js'].lineData[345] = 0;
  _$jscoverage['/combo-loader.js'].lineData[346] = 0;
  _$jscoverage['/combo-loader.js'].lineData[347] = 0;
  _$jscoverage['/combo-loader.js'].lineData[348] = 0;
  _$jscoverage['/combo-loader.js'].lineData[349] = 0;
  _$jscoverage['/combo-loader.js'].lineData[350] = 0;
  _$jscoverage['/combo-loader.js'].lineData[351] = 0;
  _$jscoverage['/combo-loader.js'].lineData[352] = 0;
  _$jscoverage['/combo-loader.js'].lineData[353] = 0;
  _$jscoverage['/combo-loader.js'].lineData[355] = 0;
  _$jscoverage['/combo-loader.js'].lineData[358] = 0;
  _$jscoverage['/combo-loader.js'].lineData[359] = 0;
  _$jscoverage['/combo-loader.js'].lineData[360] = 0;
  _$jscoverage['/combo-loader.js'].lineData[361] = 0;
  _$jscoverage['/combo-loader.js'].lineData[365] = 0;
  _$jscoverage['/combo-loader.js'].lineData[366] = 0;
  _$jscoverage['/combo-loader.js'].lineData[369] = 0;
  _$jscoverage['/combo-loader.js'].lineData[372] = 0;
  _$jscoverage['/combo-loader.js'].lineData[375] = 0;
  _$jscoverage['/combo-loader.js'].lineData[376] = 0;
  _$jscoverage['/combo-loader.js'].lineData[377] = 0;
  _$jscoverage['/combo-loader.js'].lineData[378] = 0;
  _$jscoverage['/combo-loader.js'].lineData[379] = 0;
  _$jscoverage['/combo-loader.js'].lineData[381] = 0;
  _$jscoverage['/combo-loader.js'].lineData[382] = 0;
  _$jscoverage['/combo-loader.js'].lineData[385] = 0;
  _$jscoverage['/combo-loader.js'].lineData[388] = 0;
  _$jscoverage['/combo-loader.js'].lineData[395] = 0;
  _$jscoverage['/combo-loader.js'].lineData[400] = 0;
  _$jscoverage['/combo-loader.js'].lineData[402] = 0;
  _$jscoverage['/combo-loader.js'].lineData[404] = 0;
  _$jscoverage['/combo-loader.js'].lineData[407] = 0;
  _$jscoverage['/combo-loader.js'].lineData[408] = 0;
  _$jscoverage['/combo-loader.js'].lineData[409] = 0;
  _$jscoverage['/combo-loader.js'].lineData[410] = 0;
  _$jscoverage['/combo-loader.js'].lineData[411] = 0;
  _$jscoverage['/combo-loader.js'].lineData[412] = 0;
  _$jscoverage['/combo-loader.js'].lineData[413] = 0;
  _$jscoverage['/combo-loader.js'].lineData[414] = 0;
  _$jscoverage['/combo-loader.js'].lineData[416] = 0;
  _$jscoverage['/combo-loader.js'].lineData[423] = 0;
  _$jscoverage['/combo-loader.js'].lineData[424] = 0;
  _$jscoverage['/combo-loader.js'].lineData[425] = 0;
  _$jscoverage['/combo-loader.js'].lineData[428] = 0;
  _$jscoverage['/combo-loader.js'].lineData[430] = 0;
  _$jscoverage['/combo-loader.js'].lineData[437] = 0;
  _$jscoverage['/combo-loader.js'].lineData[438] = 0;
  _$jscoverage['/combo-loader.js'].lineData[439] = 0;
  _$jscoverage['/combo-loader.js'].lineData[440] = 0;
  _$jscoverage['/combo-loader.js'].lineData[441] = 0;
  _$jscoverage['/combo-loader.js'].lineData[442] = 0;
  _$jscoverage['/combo-loader.js'].lineData[447] = 0;
  _$jscoverage['/combo-loader.js'].lineData[450] = 0;
  _$jscoverage['/combo-loader.js'].lineData[451] = 0;
  _$jscoverage['/combo-loader.js'].lineData[452] = 0;
  _$jscoverage['/combo-loader.js'].lineData[454] = 0;
  _$jscoverage['/combo-loader.js'].lineData[456] = 0;
  _$jscoverage['/combo-loader.js'].lineData[457] = 0;
  _$jscoverage['/combo-loader.js'].lineData[458] = 0;
  _$jscoverage['/combo-loader.js'].lineData[459] = 0;
  _$jscoverage['/combo-loader.js'].lineData[460] = 0;
  _$jscoverage['/combo-loader.js'].lineData[461] = 0;
  _$jscoverage['/combo-loader.js'].lineData[464] = 0;
  _$jscoverage['/combo-loader.js'].lineData[465] = 0;
  _$jscoverage['/combo-loader.js'].lineData[469] = 0;
  _$jscoverage['/combo-loader.js'].lineData[473] = 0;
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
}
if (! _$jscoverage['/combo-loader.js'].branchData) {
  _$jscoverage['/combo-loader.js'].branchData = {};
  _$jscoverage['/combo-loader.js'].branchData['22'] = [];
  _$jscoverage['/combo-loader.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['25'] = [];
  _$jscoverage['/combo-loader.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['30'] = [];
  _$jscoverage['/combo-loader.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['41'] = [];
  _$jscoverage['/combo-loader.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['55'] = [];
  _$jscoverage['/combo-loader.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['57'] = [];
  _$jscoverage['/combo-loader.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['59'] = [];
  _$jscoverage['/combo-loader.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['61'] = [];
  _$jscoverage['/combo-loader.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['92'] = [];
  _$jscoverage['/combo-loader.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['92'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['92'][3] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['92'][4] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['94'] = [];
  _$jscoverage['/combo-loader.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['95'] = [];
  _$jscoverage['/combo-loader.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['100'] = [];
  _$jscoverage['/combo-loader.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['109'] = [];
  _$jscoverage['/combo-loader.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['109'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['118'] = [];
  _$jscoverage['/combo-loader.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['118'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['118'][3] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['122'] = [];
  _$jscoverage['/combo-loader.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['138'] = [];
  _$jscoverage['/combo-loader.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['158'] = [];
  _$jscoverage['/combo-loader.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['160'] = [];
  _$jscoverage['/combo-loader.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['165'] = [];
  _$jscoverage['/combo-loader.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['182'] = [];
  _$jscoverage['/combo-loader.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['187'] = [];
  _$jscoverage['/combo-loader.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['191'] = [];
  _$jscoverage['/combo-loader.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['202'] = [];
  _$jscoverage['/combo-loader.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['203'] = [];
  _$jscoverage['/combo-loader.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['229'] = [];
  _$jscoverage['/combo-loader.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['258'] = [];
  _$jscoverage['/combo-loader.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['266'] = [];
  _$jscoverage['/combo-loader.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['292'] = [];
  _$jscoverage['/combo-loader.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['295'] = [];
  _$jscoverage['/combo-loader.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['297'] = [];
  _$jscoverage['/combo-loader.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['299'] = [];
  _$jscoverage['/combo-loader.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['305'] = [];
  _$jscoverage['/combo-loader.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['308'] = [];
  _$jscoverage['/combo-loader.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['309'] = [];
  _$jscoverage['/combo-loader.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['310'] = [];
  _$jscoverage['/combo-loader.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['341'] = [];
  _$jscoverage['/combo-loader.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['355'] = [];
  _$jscoverage['/combo-loader.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['355'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['360'] = [];
  _$jscoverage['/combo-loader.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['375'] = [];
  _$jscoverage['/combo-loader.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['376'] = [];
  _$jscoverage['/combo-loader.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['381'] = [];
  _$jscoverage['/combo-loader.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['381'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['381'][3] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['381'][4] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['414'] = [];
  _$jscoverage['/combo-loader.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['437'] = [];
  _$jscoverage['/combo-loader.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['441'] = [];
  _$jscoverage['/combo-loader.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['454'] = [];
  _$jscoverage['/combo-loader.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['454'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['455'] = [];
  _$jscoverage['/combo-loader.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['464'] = [];
  _$jscoverage['/combo-loader.js'].branchData['464'][1] = new BranchData();
}
_$jscoverage['/combo-loader.js'].branchData['464'][1].init(2565, 23, 'currentComboUrls.length');
function visit59_464_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['455'][1].init(68, 72, 'l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength');
function visit58_455_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['454'][2].init(764, 36, 'currentComboUrls.length > maxFileNum');
function visit57_454_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['454'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['454'][1].init(764, 142, 'currentComboUrls.length > maxFileNum || (l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)');
function visit56_454_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['441'][1].init(187, 25, '!currentMod.canBeCombined');
function visit55_441_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['437'][1].init(1277, 15, 'i < mods.length');
function visit54_437_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['414'][1].init(226, 15, 'tags.length > 1');
function visit53_414_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['381'][4].init(53, 20, 'mods.tags[0] === tag');
function visit52_381_4(result) {
  _$jscoverage['/combo-loader.js'].branchData['381'][4].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['381'][3].init(27, 22, 'mods.tags.length === 1');
function visit51_381_3(result) {
  _$jscoverage['/combo-loader.js'].branchData['381'][3].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['381'][2].init(27, 46, 'mods.tags.length === 1 && mods.tags[0] === tag');
function visit50_381_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['381'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['381'][1].init(25, 49, '!(mods.tags.length === 1 && mods.tags[0] === tag)');
function visit49_381_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['376'][1].init(1739, 32, '!(mods = typedCombos[comboName])');
function visit48_376_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['375'][1].init(1696, 21, 'comboMods[type] || {}');
function visit47_375_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['360'][1].init(29, 41, 'groupPrefixUri.isSameOriginAs(packageUri)');
function visit46_360_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['355'][2].init(705, 81, 'packageInfo.isCombine() && S.startsWith(modPath, packagePath)');
function visit45_355_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['355'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['355'][1].init(685, 111, '(mod.canBeCombined = packageInfo.isCombine() && S.startsWith(modPath, packagePath)) && group');
function visit44_355_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['341'][1].init(324, 5, 'i < l');
function visit43_341_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['310'][1].init(29, 21, 'modStatus !== LOADING');
function visit42_310_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['309'][1].init(25, 27, '!waitingModules.contains(m)');
function visit41_309_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['308'][1].init(353, 20, 'modStatus !== LOADED');
function visit40_308_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['305'][1].init(253, 28, 'modStatus >= READY_TO_ATTACH');
function visit39_305_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['299'][1].init(54, 8, 'cache[m]');
function visit38_299_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['297'][1].init(329, 19, 'i < modNames.length');
function visit37_297_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['295'][1].init(291, 11, 'cache || {}');
function visit36_295_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['292'][1].init(189, 9, 'ret || {}');
function visit35_292_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['266'][1].init(150, 12, '!mod.factory');
function visit34_266_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['258'][1].init(25, 9, '\'@DEBUG@\'');
function visit33_258_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['229'][1].init(25, 9, '\'@DEBUG@\'');
function visit32_229_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['203'][1].init(17, 19, 'str1[i] !== str2[i]');
function visit31_203_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['202'][1].init(143, 5, 'i < l');
function visit30_202_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['191'][1].init(225, 9, 'ms.length');
function visit29_191_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['187'][1].init(25, 19, 'm.status === LOADED');
function visit28_187_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['182'][1].init(5837, 9, '\'@DEBUG@\'');
function visit27_182_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['165'][1].init(362, 2, 're');
function visit26_165_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['160'][1].init(50, 35, 'script.readyState === \'interactive\'');
function visit25_160_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['158'][1].init(171, 6, 'i >= 0');
function visit24_158_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['138'][1].init(74, 5, 'oldIE');
function visit23_138_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['122'][1].init(132, 5, 'oldIE');
function visit22_122_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['118'][3].init(391, 13, 'argsLen === 1');
function visit21_118_3(result) {
  _$jscoverage['/combo-loader.js'].branchData['118'][3].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['118'][2].init(361, 26, 'typeof name === \'function\'');
function visit20_118_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['118'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['118'][1].init(361, 43, 'typeof name === \'function\' || argsLen === 1');
function visit19_118_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['109'][2].init(57, 13, 'argsLen === 3');
function visit18_109_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['109'][1].init(57, 35, 'argsLen === 3 && S.isArray(factory)');
function visit17_109_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['100'][2].init(80, 30, 'config.requires && !config.cjs');
function visit16_100_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['100'][1].init(70, 40, 'config && config.requires && !config.cjs');
function visit15_100_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['95'][1].init(26, 12, 'config || {}');
function visit14_95_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['94'][1].init(78, 15, 'requires.length');
function visit13_94_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['92'][4].init(148, 18, 'factory.length > 1');
function visit12_92_4(result) {
  _$jscoverage['/combo-loader.js'].branchData['92'][4].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['92'][3].init(115, 29, 'typeof factory === \'function\'');
function visit11_92_3(result) {
  _$jscoverage['/combo-loader.js'].branchData['92'][3].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['92'][2].init(115, 51, 'typeof factory === \'function\' && factory.length > 1');
function visit10_92_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['92'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['92'][1].init(104, 62, '!config && typeof factory === \'function\' && factory.length > 1');
function visit9_92_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['61'][1].init(74, 9, '\'@DEBUG@\'');
function visit8_61_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['59'][1].init(147, 5, 'oldIE');
function visit7_59_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['57'][1].init(55, 23, 'mod.getType() === \'css\'');
function visit6_57_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['55'][1].init(806, 11, '!rs.combine');
function visit5_55_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['41'][1].init(67, 17, 'mod && currentMod');
function visit4_41_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['30'][1].init(17, 10, '!(--count)');
function visit3_30_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['25'][1].init(21, 17, 'rss && rss.length');
function visit2_25_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['22'][1].init(433, 13, 'Utils.ie < 10');
function visit1_22_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/combo-loader.js'].functionData[0]++;
  _$jscoverage['/combo-loader.js'].lineData[7]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/combo-loader.js'].lineData[9]++;
  var Loader = S.Loader, Config = S.Config, each = S.each, Status = Loader.Status, Utils = Loader.Utils, getHash = Utils.getHash, LOADING = Status.LOADING, LOADED = Status.LOADED, READY_TO_ATTACH = Status.READY_TO_ATTACH, ERROR = Status.ERROR, groupTag = S.now();
  _$jscoverage['/combo-loader.js'].lineData[22]++;
  var oldIE = visit1_22_1(Utils.ie < 10);
  _$jscoverage['/combo-loader.js'].lineData[24]++;
  function loadScripts(rss, callback, charset, timeout) {
    _$jscoverage['/combo-loader.js'].functionData[1]++;
    _$jscoverage['/combo-loader.js'].lineData[25]++;
    var count = visit2_25_1(rss && rss.length), errorList = [], successList = [];
    _$jscoverage['/combo-loader.js'].lineData[29]++;
    function complete() {
      _$jscoverage['/combo-loader.js'].functionData[2]++;
      _$jscoverage['/combo-loader.js'].lineData[30]++;
      if (visit3_30_1(!(--count))) {
        _$jscoverage['/combo-loader.js'].lineData[31]++;
        callback(successList, errorList);
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[35]++;
    each(rss, function(rs) {
  _$jscoverage['/combo-loader.js'].functionData[3]++;
  _$jscoverage['/combo-loader.js'].lineData[36]++;
  var mod;
  _$jscoverage['/combo-loader.js'].lineData[37]++;
  var config = {
  timeout: timeout, 
  success: function() {
  _$jscoverage['/combo-loader.js'].functionData[4]++;
  _$jscoverage['/combo-loader.js'].lineData[40]++;
  successList.push(rs);
  _$jscoverage['/combo-loader.js'].lineData[41]++;
  if (visit4_41_1(mod && currentMod)) {
    _$jscoverage['/combo-loader.js'].lineData[43]++;
    logger.debug('standard browser get mod name after load: ' + mod.name);
    _$jscoverage['/combo-loader.js'].lineData[44]++;
    Utils.registerModule(mod.name, currentMod.factory, currentMod.config);
    _$jscoverage['/combo-loader.js'].lineData[45]++;
    currentMod = undefined;
  }
  _$jscoverage['/combo-loader.js'].lineData[47]++;
  complete();
}, 
  error: function() {
  _$jscoverage['/combo-loader.js'].functionData[5]++;
  _$jscoverage['/combo-loader.js'].lineData[50]++;
  errorList.push(rs);
  _$jscoverage['/combo-loader.js'].lineData[51]++;
  complete();
}, 
  charset: charset};
  _$jscoverage['/combo-loader.js'].lineData[55]++;
  if (visit5_55_1(!rs.combine)) {
    _$jscoverage['/combo-loader.js'].lineData[56]++;
    mod = rs.mods[0];
    _$jscoverage['/combo-loader.js'].lineData[57]++;
    if (visit6_57_1(mod.getType() === 'css')) {
      _$jscoverage['/combo-loader.js'].lineData[58]++;
      mod = undefined;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[59]++;
      if (visit7_59_1(oldIE)) {
        _$jscoverage['/combo-loader.js'].lineData[60]++;
        startLoadModName = mod.name;
        _$jscoverage['/combo-loader.js'].lineData[61]++;
        if (visit8_61_1('@DEBUG@')) {
          _$jscoverage['/combo-loader.js'].lineData[62]++;
          startLoadModTime = +new Date();
        }
        _$jscoverage['/combo-loader.js'].lineData[64]++;
        config.attrs = {
  'data-mod-name': mod.name};
      }
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[69]++;
  Config.loadModsFn(rs, config);
});
  }
  _$jscoverage['/combo-loader.js'].lineData[73]++;
  ComboLoader.groupTag = groupTag;
  _$jscoverage['/combo-loader.js'].lineData[81]++;
  function ComboLoader(waitingModules) {
    _$jscoverage['/combo-loader.js'].functionData[6]++;
    _$jscoverage['/combo-loader.js'].lineData[82]++;
    this.waitingModules = waitingModules;
  }
  _$jscoverage['/combo-loader.js'].lineData[85]++;
  var currentMod;
  _$jscoverage['/combo-loader.js'].lineData[86]++;
  var startLoadModName;
  _$jscoverage['/combo-loader.js'].lineData[87]++;
  var startLoadModTime;
  _$jscoverage['/combo-loader.js'].lineData[89]++;
  function checkKISSYRequire(config, factory) {
    _$jscoverage['/combo-loader.js'].functionData[7]++;
    _$jscoverage['/combo-loader.js'].lineData[92]++;
    if (visit9_92_1(!config && visit10_92_2(visit11_92_3(typeof factory === 'function') && visit12_92_4(factory.length > 1)))) {
      _$jscoverage['/combo-loader.js'].lineData[93]++;
      var requires = Utils.getRequiresFromFn(factory);
      _$jscoverage['/combo-loader.js'].lineData[94]++;
      if (visit13_94_1(requires.length)) {
        _$jscoverage['/combo-loader.js'].lineData[95]++;
        config = visit14_95_1(config || {});
        _$jscoverage['/combo-loader.js'].lineData[96]++;
        config.requires = requires;
      }
    } else {
      _$jscoverage['/combo-loader.js'].lineData[100]++;
      if (visit15_100_1(config && visit16_100_2(config.requires && !config.cjs))) {
        _$jscoverage['/combo-loader.js'].lineData[101]++;
        config.cjs = 0;
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[104]++;
    return config;
  }
  _$jscoverage['/combo-loader.js'].lineData[107]++;
  ComboLoader.add = function(name, factory, config, argsLen) {
  _$jscoverage['/combo-loader.js'].functionData[8]++;
  _$jscoverage['/combo-loader.js'].lineData[109]++;
  if (visit17_109_1(visit18_109_2(argsLen === 3) && S.isArray(factory))) {
    _$jscoverage['/combo-loader.js'].lineData[110]++;
    var tmp = factory;
    _$jscoverage['/combo-loader.js'].lineData[111]++;
    factory = config;
    _$jscoverage['/combo-loader.js'].lineData[112]++;
    config = {
  requires: tmp, 
  cjs: 1};
  }
  _$jscoverage['/combo-loader.js'].lineData[118]++;
  if (visit19_118_1(visit20_118_2(typeof name === 'function') || visit21_118_3(argsLen === 1))) {
    _$jscoverage['/combo-loader.js'].lineData[119]++;
    config = factory;
    _$jscoverage['/combo-loader.js'].lineData[120]++;
    factory = name;
    _$jscoverage['/combo-loader.js'].lineData[121]++;
    config = checkKISSYRequire(config, factory);
    _$jscoverage['/combo-loader.js'].lineData[122]++;
    if (visit22_122_1(oldIE)) {
      _$jscoverage['/combo-loader.js'].lineData[124]++;
      name = findModuleNameByInteractive();
      _$jscoverage['/combo-loader.js'].lineData[126]++;
      Utils.registerModule(name, factory, config);
      _$jscoverage['/combo-loader.js'].lineData[127]++;
      startLoadModName = null;
      _$jscoverage['/combo-loader.js'].lineData[128]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[131]++;
      currentMod = {
  factory: factory, 
  config: config};
    }
  } else {
    _$jscoverage['/combo-loader.js'].lineData[138]++;
    if (visit23_138_1(oldIE)) {
      _$jscoverage['/combo-loader.js'].lineData[139]++;
      startLoadModName = null;
      _$jscoverage['/combo-loader.js'].lineData[140]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[142]++;
      currentMod = undefined;
    }
    _$jscoverage['/combo-loader.js'].lineData[144]++;
    config = checkKISSYRequire(config, factory);
    _$jscoverage['/combo-loader.js'].lineData[145]++;
    Utils.registerModule(name, factory, config);
  }
};
  _$jscoverage['/combo-loader.js'].lineData[151]++;
  function findModuleNameByInteractive() {
    _$jscoverage['/combo-loader.js'].functionData[9]++;
    _$jscoverage['/combo-loader.js'].lineData[152]++;
    var scripts = document.getElementsByTagName('script'), re, i, name, script;
    _$jscoverage['/combo-loader.js'].lineData[158]++;
    for (i = scripts.length - 1; visit24_158_1(i >= 0); i--) {
      _$jscoverage['/combo-loader.js'].lineData[159]++;
      script = scripts[i];
      _$jscoverage['/combo-loader.js'].lineData[160]++;
      if (visit25_160_1(script.readyState === 'interactive')) {
        _$jscoverage['/combo-loader.js'].lineData[161]++;
        re = script;
        _$jscoverage['/combo-loader.js'].lineData[162]++;
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
    logger.info('load remote modules: "' + ms.join(', ') + '" from: "' + rs.modPath + '"');
  }
});
};
  }
  _$jscoverage['/combo-loader.js'].lineData[198]++;
  function getCommonPrefix(str1, str2) {
    _$jscoverage['/combo-loader.js'].functionData[13]++;
    _$jscoverage['/combo-loader.js'].lineData[199]++;
    str1 = str1.split(/\//);
    _$jscoverage['/combo-loader.js'].lineData[200]++;
    str2 = str2.split(/\//);
    _$jscoverage['/combo-loader.js'].lineData[201]++;
    var l = Math.min(str1.length, str2.length);
    _$jscoverage['/combo-loader.js'].lineData[202]++;
    for (var i = 0; visit30_202_1(i < l); i++) {
      _$jscoverage['/combo-loader.js'].lineData[203]++;
      if (visit31_203_1(str1[i] !== str2[i])) {
        _$jscoverage['/combo-loader.js'].lineData[204]++;
        break;
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[207]++;
    return str1.slice(0, i).join('/') + '/';
  }
  _$jscoverage['/combo-loader.js'].lineData[210]++;
  S.mix(ComboLoader.prototype, {
  use: function(normalizedModNames) {
  _$jscoverage['/combo-loader.js'].functionData[14]++;
  _$jscoverage['/combo-loader.js'].lineData[215]++;
  var self = this, allModNames, comboUrls, timeout = Config.timeout;
  _$jscoverage['/combo-loader.js'].lineData[220]++;
  allModNames = S.keys(self.calculate(normalizedModNames));
  _$jscoverage['/combo-loader.js'].lineData[222]++;
  Utils.createModulesInfo(allModNames);
  _$jscoverage['/combo-loader.js'].lineData[224]++;
  comboUrls = self.getComboUrls(allModNames);
  _$jscoverage['/combo-loader.js'].lineData[227]++;
  each(comboUrls.css, function(cssOne) {
  _$jscoverage['/combo-loader.js'].functionData[15]++;
  _$jscoverage['/combo-loader.js'].lineData[228]++;
  loadScripts(cssOne, function(success, error) {
  _$jscoverage['/combo-loader.js'].functionData[16]++;
  _$jscoverage['/combo-loader.js'].lineData[229]++;
  if (visit32_229_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[230]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/combo-loader.js'].lineData[233]++;
  each(success, function(one) {
  _$jscoverage['/combo-loader.js'].functionData[17]++;
  _$jscoverage['/combo-loader.js'].lineData[234]++;
  each(one.mods, function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[18]++;
  _$jscoverage['/combo-loader.js'].lineData[235]++;
  Utils.registerModule(mod.name, S.noop);
  _$jscoverage['/combo-loader.js'].lineData[237]++;
  mod.notifyAll();
});
});
  _$jscoverage['/combo-loader.js'].lineData[241]++;
  each(error, function(one) {
  _$jscoverage['/combo-loader.js'].functionData[19]++;
  _$jscoverage['/combo-loader.js'].lineData[242]++;
  each(one.mods, function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[20]++;
  _$jscoverage['/combo-loader.js'].lineData[243]++;
  var msg = mod.name + ' is not loaded! can not find module in path : ' + one.path;
  _$jscoverage['/combo-loader.js'].lineData[246]++;
  S.log(msg, 'error');
  _$jscoverage['/combo-loader.js'].lineData[247]++;
  mod.status = ERROR;
  _$jscoverage['/combo-loader.js'].lineData[249]++;
  mod.notifyAll();
});
});
}, cssOne.charset, timeout);
});
  _$jscoverage['/combo-loader.js'].lineData[256]++;
  each(comboUrls.js, function(jsOne) {
  _$jscoverage['/combo-loader.js'].functionData[21]++;
  _$jscoverage['/combo-loader.js'].lineData[257]++;
  loadScripts(jsOne, function(success) {
  _$jscoverage['/combo-loader.js'].functionData[22]++;
  _$jscoverage['/combo-loader.js'].lineData[258]++;
  if (visit33_258_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[259]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/combo-loader.js'].lineData[262]++;
  each(jsOne, function(one) {
  _$jscoverage['/combo-loader.js'].functionData[23]++;
  _$jscoverage['/combo-loader.js'].lineData[263]++;
  each(one.mods, function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[24]++;
  _$jscoverage['/combo-loader.js'].lineData[266]++;
  if (visit34_266_1(!mod.factory)) {
    _$jscoverage['/combo-loader.js'].lineData[267]++;
    var msg = mod.name + ' is not loaded! can not find module in path : ' + one.path;
    _$jscoverage['/combo-loader.js'].lineData[270]++;
    S.log(msg, 'error');
    _$jscoverage['/combo-loader.js'].lineData[271]++;
    mod.status = ERROR;
  }
  _$jscoverage['/combo-loader.js'].lineData[274]++;
  mod.notifyAll();
});
});
}, jsOne.charset, timeout);
});
}, 
  calculate: function(modNames, cache, ret) {
  _$jscoverage['/combo-loader.js'].functionData[25]++;
  _$jscoverage['/combo-loader.js'].lineData[285]++;
  var i, m, mod, modStatus, self = this, waitingModules = self.waitingModules;
  _$jscoverage['/combo-loader.js'].lineData[292]++;
  ret = visit35_292_1(ret || {});
  _$jscoverage['/combo-loader.js'].lineData[295]++;
  cache = visit36_295_1(cache || {});
  _$jscoverage['/combo-loader.js'].lineData[297]++;
  for (i = 0; visit37_297_1(i < modNames.length); i++) {
    _$jscoverage['/combo-loader.js'].lineData[298]++;
    m = modNames[i];
    _$jscoverage['/combo-loader.js'].lineData[299]++;
    if (visit38_299_1(cache[m])) {
      _$jscoverage['/combo-loader.js'].lineData[300]++;
      continue;
    }
    _$jscoverage['/combo-loader.js'].lineData[302]++;
    cache[m] = 1;
    _$jscoverage['/combo-loader.js'].lineData[303]++;
    mod = Utils.createModuleInfo(m);
    _$jscoverage['/combo-loader.js'].lineData[304]++;
    modStatus = mod.status;
    _$jscoverage['/combo-loader.js'].lineData[305]++;
    if (visit39_305_1(modStatus >= READY_TO_ATTACH)) {
      _$jscoverage['/combo-loader.js'].lineData[306]++;
      continue;
    }
    _$jscoverage['/combo-loader.js'].lineData[308]++;
    if (visit40_308_1(modStatus !== LOADED)) {
      _$jscoverage['/combo-loader.js'].lineData[309]++;
      if (visit41_309_1(!waitingModules.contains(m))) {
        _$jscoverage['/combo-loader.js'].lineData[310]++;
        if (visit42_310_1(modStatus !== LOADING)) {
          _$jscoverage['/combo-loader.js'].lineData[311]++;
          mod.status = LOADING;
          _$jscoverage['/combo-loader.js'].lineData[312]++;
          ret[m] = 1;
        }
        _$jscoverage['/combo-loader.js'].lineData[315]++;
        mod.wait(function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[26]++;
  _$jscoverage['/combo-loader.js'].lineData[316]++;
  waitingModules.remove(mod.name);
  _$jscoverage['/combo-loader.js'].lineData[318]++;
  waitingModules.notifyAll();
});
        _$jscoverage['/combo-loader.js'].lineData[320]++;
        waitingModules.add(m);
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[323]++;
    self.calculate(mod.getNormalizedRequires(), cache, ret);
  }
  _$jscoverage['/combo-loader.js'].lineData[326]++;
  return ret;
}, 
  getComboMods: function(modNames, comboPrefixes) {
  _$jscoverage['/combo-loader.js'].functionData[27]++;
  _$jscoverage['/combo-loader.js'].lineData[333]++;
  var comboMods = {}, packageUri, i = 0, l = modNames.length, modName, mod, packageInfo, type, typedCombos, mods, tag, charset, packagePath, groupPrefixUri, comboName, packageName, group, modPath;
  _$jscoverage['/combo-loader.js'].lineData[341]++;
  for (; visit43_341_1(i < l); ++i) {
    _$jscoverage['/combo-loader.js'].lineData[342]++;
    modName = modNames[i];
    _$jscoverage['/combo-loader.js'].lineData[343]++;
    mod = Utils.createModuleInfo(modName);
    _$jscoverage['/combo-loader.js'].lineData[344]++;
    type = mod.getType();
    _$jscoverage['/combo-loader.js'].lineData[345]++;
    modPath = mod.getPath();
    _$jscoverage['/combo-loader.js'].lineData[346]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/combo-loader.js'].lineData[347]++;
    packageName = packageInfo.name;
    _$jscoverage['/combo-loader.js'].lineData[348]++;
    charset = packageInfo.getCharset();
    _$jscoverage['/combo-loader.js'].lineData[349]++;
    tag = packageInfo.getTag();
    _$jscoverage['/combo-loader.js'].lineData[350]++;
    group = packageInfo.getGroup();
    _$jscoverage['/combo-loader.js'].lineData[351]++;
    packagePath = packageInfo.getPath();
    _$jscoverage['/combo-loader.js'].lineData[352]++;
    packageUri = packageInfo.getUri();
    _$jscoverage['/combo-loader.js'].lineData[353]++;
    comboName = packageName;
    _$jscoverage['/combo-loader.js'].lineData[355]++;
    if (visit44_355_1((mod.canBeCombined = visit45_355_2(packageInfo.isCombine() && S.startsWith(modPath, packagePath))) && group)) {
      _$jscoverage['/combo-loader.js'].lineData[358]++;
      comboName = group + '_' + charset + '_' + groupTag;
      _$jscoverage['/combo-loader.js'].lineData[359]++;
      if ((groupPrefixUri = comboPrefixes[comboName])) {
        _$jscoverage['/combo-loader.js'].lineData[360]++;
        if (visit46_360_1(groupPrefixUri.isSameOriginAs(packageUri))) {
          _$jscoverage['/combo-loader.js'].lineData[361]++;
          groupPrefixUri.setPath(getCommonPrefix(groupPrefixUri.getPath(), packageUri.getPath()));
        } else {
          _$jscoverage['/combo-loader.js'].lineData[365]++;
          comboName = packageName;
          _$jscoverage['/combo-loader.js'].lineData[366]++;
          comboPrefixes[packageName] = packageUri;
        }
      } else {
        _$jscoverage['/combo-loader.js'].lineData[369]++;
        comboPrefixes[comboName] = packageUri.clone();
      }
    } else {
      _$jscoverage['/combo-loader.js'].lineData[372]++;
      comboPrefixes[packageName] = packageUri;
    }
    _$jscoverage['/combo-loader.js'].lineData[375]++;
    typedCombos = comboMods[type] = visit47_375_1(comboMods[type] || {});
    _$jscoverage['/combo-loader.js'].lineData[376]++;
    if (visit48_376_1(!(mods = typedCombos[comboName]))) {
      _$jscoverage['/combo-loader.js'].lineData[377]++;
      mods = typedCombos[comboName] = [];
      _$jscoverage['/combo-loader.js'].lineData[378]++;
      mods.charset = charset;
      _$jscoverage['/combo-loader.js'].lineData[379]++;
      mods.tags = [tag];
    } else {
      _$jscoverage['/combo-loader.js'].lineData[381]++;
      if (visit49_381_1(!(visit50_381_2(visit51_381_3(mods.tags.length === 1) && visit52_381_4(mods.tags[0] === tag))))) {
        _$jscoverage['/combo-loader.js'].lineData[382]++;
        mods.tags.push(tag);
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[385]++;
    mods.push(mod);
  }
  _$jscoverage['/combo-loader.js'].lineData[388]++;
  return comboMods;
}, 
  getComboUrls: function(modNames) {
  _$jscoverage['/combo-loader.js'].functionData[28]++;
  _$jscoverage['/combo-loader.js'].lineData[395]++;
  var comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/combo-loader.js'].lineData[400]++;
  var comboPrefixes = {};
  _$jscoverage['/combo-loader.js'].lineData[402]++;
  var comboMods = this.getComboMods(modNames, comboPrefixes);
  _$jscoverage['/combo-loader.js'].lineData[404]++;
  var comboRes = {};
  _$jscoverage['/combo-loader.js'].lineData[407]++;
  for (var type in comboMods) {
    _$jscoverage['/combo-loader.js'].lineData[408]++;
    comboRes[type] = {};
    _$jscoverage['/combo-loader.js'].lineData[409]++;
    for (var comboName in comboMods[type]) {
      _$jscoverage['/combo-loader.js'].lineData[410]++;
      var currentComboUrls = [];
      _$jscoverage['/combo-loader.js'].lineData[411]++;
      var currentComboMods = [];
      _$jscoverage['/combo-loader.js'].lineData[412]++;
      var mods = comboMods[type][comboName];
      _$jscoverage['/combo-loader.js'].lineData[413]++;
      var tags = mods.tags;
      _$jscoverage['/combo-loader.js'].lineData[414]++;
      var tag = visit53_414_1(tags.length > 1) ? getHash(tags.join('')) : tags[0];
      _$jscoverage['/combo-loader.js'].lineData[416]++;
      var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''), suffixLength = suffix.length, basePrefix = comboPrefixes[comboName].toString(), baseLen = basePrefix.length, prefix = basePrefix + comboPrefix, res = comboRes[type][comboName] = [];
      _$jscoverage['/combo-loader.js'].lineData[423]++;
      var l = prefix.length;
      _$jscoverage['/combo-loader.js'].lineData[424]++;
      res.charset = mods.charset;
      _$jscoverage['/combo-loader.js'].lineData[425]++;
      res.mods = [];
      _$jscoverage['/combo-loader.js'].lineData[428]++;
      var pushComboUrl = function() {
  _$jscoverage['/combo-loader.js'].functionData[29]++;
  _$jscoverage['/combo-loader.js'].lineData[430]++;
  res.push({
  combine: 1, 
  path: prefix + currentComboUrls.join(comboSep) + suffix, 
  mods: currentComboMods});
};
      _$jscoverage['/combo-loader.js'].lineData[437]++;
      for (var i = 0; visit54_437_1(i < mods.length); i++) {
        _$jscoverage['/combo-loader.js'].lineData[438]++;
        var currentMod = mods[i];
        _$jscoverage['/combo-loader.js'].lineData[439]++;
        res.mods.push(currentMod);
        _$jscoverage['/combo-loader.js'].lineData[440]++;
        var path = currentMod.getPath();
        _$jscoverage['/combo-loader.js'].lineData[441]++;
        if (visit55_441_1(!currentMod.canBeCombined)) {
          _$jscoverage['/combo-loader.js'].lineData[442]++;
          res.push({
  combine: 0, 
  path: path, 
  mods: [currentMod]});
          _$jscoverage['/combo-loader.js'].lineData[447]++;
          continue;
        }
        _$jscoverage['/combo-loader.js'].lineData[450]++;
        var subPath = path.slice(baseLen).replace(/\?.*$/, '');
        _$jscoverage['/combo-loader.js'].lineData[451]++;
        currentComboUrls.push(subPath);
        _$jscoverage['/combo-loader.js'].lineData[452]++;
        currentComboMods.push(currentMod);
        _$jscoverage['/combo-loader.js'].lineData[454]++;
        if (visit56_454_1(visit57_454_2(currentComboUrls.length > maxFileNum) || (visit58_455_1(l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)))) {
          _$jscoverage['/combo-loader.js'].lineData[456]++;
          currentComboUrls.pop();
          _$jscoverage['/combo-loader.js'].lineData[457]++;
          currentComboMods.pop();
          _$jscoverage['/combo-loader.js'].lineData[458]++;
          pushComboUrl();
          _$jscoverage['/combo-loader.js'].lineData[459]++;
          currentComboUrls = [];
          _$jscoverage['/combo-loader.js'].lineData[460]++;
          currentComboMods = [];
          _$jscoverage['/combo-loader.js'].lineData[461]++;
          i--;
        }
      }
      _$jscoverage['/combo-loader.js'].lineData[464]++;
      if (visit59_464_1(currentComboUrls.length)) {
        _$jscoverage['/combo-loader.js'].lineData[465]++;
        pushComboUrl();
      }
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[469]++;
  return comboRes;
}});
  _$jscoverage['/combo-loader.js'].lineData[473]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
