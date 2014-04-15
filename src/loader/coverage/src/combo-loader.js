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
  _$jscoverage['/combo-loader.js'].lineData[205] = 0;
  _$jscoverage['/combo-loader.js'].lineData[206] = 0;
  _$jscoverage['/combo-loader.js'].lineData[207] = 0;
  _$jscoverage['/combo-loader.js'].lineData[210] = 0;
  _$jscoverage['/combo-loader.js'].lineData[213] = 0;
  _$jscoverage['/combo-loader.js'].lineData[218] = 0;
  _$jscoverage['/combo-loader.js'].lineData[222] = 0;
  _$jscoverage['/combo-loader.js'].lineData[225] = 0;
  _$jscoverage['/combo-loader.js'].lineData[226] = 0;
  _$jscoverage['/combo-loader.js'].lineData[227] = 0;
  _$jscoverage['/combo-loader.js'].lineData[228] = 0;
  _$jscoverage['/combo-loader.js'].lineData[231] = 0;
  _$jscoverage['/combo-loader.js'].lineData[232] = 0;
  _$jscoverage['/combo-loader.js'].lineData[233] = 0;
  _$jscoverage['/combo-loader.js'].lineData[235] = 0;
  _$jscoverage['/combo-loader.js'].lineData[239] = 0;
  _$jscoverage['/combo-loader.js'].lineData[240] = 0;
  _$jscoverage['/combo-loader.js'].lineData[241] = 0;
  _$jscoverage['/combo-loader.js'].lineData[242] = 0;
  _$jscoverage['/combo-loader.js'].lineData[243] = 0;
  _$jscoverage['/combo-loader.js'].lineData[245] = 0;
  _$jscoverage['/combo-loader.js'].lineData[252] = 0;
  _$jscoverage['/combo-loader.js'].lineData[253] = 0;
  _$jscoverage['/combo-loader.js'].lineData[254] = 0;
  _$jscoverage['/combo-loader.js'].lineData[255] = 0;
  _$jscoverage['/combo-loader.js'].lineData[258] = 0;
  _$jscoverage['/combo-loader.js'].lineData[259] = 0;
  _$jscoverage['/combo-loader.js'].lineData[262] = 0;
  _$jscoverage['/combo-loader.js'].lineData[263] = 0;
  _$jscoverage['/combo-loader.js'].lineData[266] = 0;
  _$jscoverage['/combo-loader.js'].lineData[267] = 0;
  _$jscoverage['/combo-loader.js'].lineData[270] = 0;
  _$jscoverage['/combo-loader.js'].lineData[281] = 0;
  _$jscoverage['/combo-loader.js'].lineData[282] = 0;
  _$jscoverage['/combo-loader.js'].lineData[285] = 0;
  _$jscoverage['/combo-loader.js'].lineData[288] = 0;
  _$jscoverage['/combo-loader.js'].lineData[289] = 0;
  _$jscoverage['/combo-loader.js'].lineData[291] = 0;
  _$jscoverage['/combo-loader.js'].lineData[294] = 0;
  _$jscoverage['/combo-loader.js'].lineData[295] = 0;
  _$jscoverage['/combo-loader.js'].lineData[296] = 0;
  _$jscoverage['/combo-loader.js'].lineData[298] = 0;
  _$jscoverage['/combo-loader.js'].lineData[299] = 0;
  _$jscoverage['/combo-loader.js'].lineData[300] = 0;
  _$jscoverage['/combo-loader.js'].lineData[301] = 0;
  _$jscoverage['/combo-loader.js'].lineData[303] = 0;
  _$jscoverage['/combo-loader.js'].lineData[304] = 0;
  _$jscoverage['/combo-loader.js'].lineData[305] = 0;
  _$jscoverage['/combo-loader.js'].lineData[306] = 0;
  _$jscoverage['/combo-loader.js'].lineData[307] = 0;
  _$jscoverage['/combo-loader.js'].lineData[308] = 0;
  _$jscoverage['/combo-loader.js'].lineData[310] = 0;
  _$jscoverage['/combo-loader.js'].lineData[311] = 0;
  _$jscoverage['/combo-loader.js'].lineData[312] = 0;
  _$jscoverage['/combo-loader.js'].lineData[313] = 0;
  _$jscoverage['/combo-loader.js'].lineData[314] = 0;
  _$jscoverage['/combo-loader.js'].lineData[315] = 0;
  _$jscoverage['/combo-loader.js'].lineData[316] = 0;
  _$jscoverage['/combo-loader.js'].lineData[318] = 0;
  _$jscoverage['/combo-loader.js'].lineData[319] = 0;
  _$jscoverage['/combo-loader.js'].lineData[322] = 0;
  _$jscoverage['/combo-loader.js'].lineData[323] = 0;
  _$jscoverage['/combo-loader.js'].lineData[324] = 0;
  _$jscoverage['/combo-loader.js'].lineData[325] = 0;
  _$jscoverage['/combo-loader.js'].lineData[326] = 0;
  _$jscoverage['/combo-loader.js'].lineData[328] = 0;
  _$jscoverage['/combo-loader.js'].lineData[332] = 0;
  _$jscoverage['/combo-loader.js'].lineData[333] = 0;
  _$jscoverage['/combo-loader.js'].lineData[336] = 0;
  _$jscoverage['/combo-loader.js'].lineData[337] = 0;
  _$jscoverage['/combo-loader.js'].lineData[340] = 0;
  _$jscoverage['/combo-loader.js'].lineData[347] = 0;
  _$jscoverage['/combo-loader.js'].lineData[351] = 0;
  _$jscoverage['/combo-loader.js'].lineData[360] = 0;
  _$jscoverage['/combo-loader.js'].lineData[367] = 0;
  _$jscoverage['/combo-loader.js'].lineData[368] = 0;
  _$jscoverage['/combo-loader.js'].lineData[369] = 0;
  _$jscoverage['/combo-loader.js'].lineData[370] = 0;
  _$jscoverage['/combo-loader.js'].lineData[371] = 0;
  _$jscoverage['/combo-loader.js'].lineData[372] = 0;
  _$jscoverage['/combo-loader.js'].lineData[373] = 0;
  _$jscoverage['/combo-loader.js'].lineData[374] = 0;
  _$jscoverage['/combo-loader.js'].lineData[375] = 0;
  _$jscoverage['/combo-loader.js'].lineData[376] = 0;
  _$jscoverage['/combo-loader.js'].lineData[378] = 0;
  _$jscoverage['/combo-loader.js'].lineData[379] = 0;
  _$jscoverage['/combo-loader.js'].lineData[380] = 0;
  _$jscoverage['/combo-loader.js'].lineData[381] = 0;
  _$jscoverage['/combo-loader.js'].lineData[382] = 0;
  _$jscoverage['/combo-loader.js'].lineData[384] = 0;
  _$jscoverage['/combo-loader.js'].lineData[385] = 0;
  _$jscoverage['/combo-loader.js'].lineData[386] = 0;
  _$jscoverage['/combo-loader.js'].lineData[387] = 0;
  _$jscoverage['/combo-loader.js'].lineData[388] = 0;
  _$jscoverage['/combo-loader.js'].lineData[389] = 0;
  _$jscoverage['/combo-loader.js'].lineData[391] = 0;
  _$jscoverage['/combo-loader.js'].lineData[392] = 0;
  _$jscoverage['/combo-loader.js'].lineData[393] = 0;
  _$jscoverage['/combo-loader.js'].lineData[396] = 0;
  _$jscoverage['/combo-loader.js'].lineData[397] = 0;
  _$jscoverage['/combo-loader.js'].lineData[398] = 0;
  _$jscoverage['/combo-loader.js'].lineData[399] = 0;
  _$jscoverage['/combo-loader.js'].lineData[402] = 0;
  _$jscoverage['/combo-loader.js'].lineData[403] = 0;
  _$jscoverage['/combo-loader.js'].lineData[404] = 0;
  _$jscoverage['/combo-loader.js'].lineData[405] = 0;
  _$jscoverage['/combo-loader.js'].lineData[406] = 0;
  _$jscoverage['/combo-loader.js'].lineData[408] = 0;
  _$jscoverage['/combo-loader.js'].lineData[409] = 0;
  _$jscoverage['/combo-loader.js'].lineData[412] = 0;
  _$jscoverage['/combo-loader.js'].lineData[417] = 0;
  _$jscoverage['/combo-loader.js'].lineData[427] = 0;
  _$jscoverage['/combo-loader.js'].lineData[432] = 0;
  _$jscoverage['/combo-loader.js'].lineData[434] = 0;
  _$jscoverage['/combo-loader.js'].lineData[436] = 0;
  _$jscoverage['/combo-loader.js'].lineData[437] = 0;
  _$jscoverage['/combo-loader.js'].lineData[438] = 0;
  _$jscoverage['/combo-loader.js'].lineData[439] = 0;
  _$jscoverage['/combo-loader.js'].lineData[440] = 0;
  _$jscoverage['/combo-loader.js'].lineData[441] = 0;
  _$jscoverage['/combo-loader.js'].lineData[444] = 0;
  _$jscoverage['/combo-loader.js'].lineData[448] = 0;
  _$jscoverage['/combo-loader.js'].lineData[451] = 0;
  _$jscoverage['/combo-loader.js'].lineData[453] = 0;
  _$jscoverage['/combo-loader.js'].lineData[461] = 0;
  _$jscoverage['/combo-loader.js'].lineData[462] = 0;
  _$jscoverage['/combo-loader.js'].lineData[463] = 0;
  _$jscoverage['/combo-loader.js'].lineData[464] = 0;
  _$jscoverage['/combo-loader.js'].lineData[467] = 0;
  _$jscoverage['/combo-loader.js'].lineData[473] = 0;
  _$jscoverage['/combo-loader.js'].lineData[476] = 0;
  _$jscoverage['/combo-loader.js'].lineData[477] = 0;
  _$jscoverage['/combo-loader.js'].lineData[478] = 0;
  _$jscoverage['/combo-loader.js'].lineData[480] = 0;
  _$jscoverage['/combo-loader.js'].lineData[482] = 0;
  _$jscoverage['/combo-loader.js'].lineData[483] = 0;
  _$jscoverage['/combo-loader.js'].lineData[484] = 0;
  _$jscoverage['/combo-loader.js'].lineData[485] = 0;
  _$jscoverage['/combo-loader.js'].lineData[486] = 0;
  _$jscoverage['/combo-loader.js'].lineData[487] = 0;
  _$jscoverage['/combo-loader.js'].lineData[490] = 0;
  _$jscoverage['/combo-loader.js'].lineData[491] = 0;
  _$jscoverage['/combo-loader.js'].lineData[494] = 0;
  _$jscoverage['/combo-loader.js'].lineData[497] = 0;
  _$jscoverage['/combo-loader.js'].lineData[498] = 0;
  _$jscoverage['/combo-loader.js'].lineData[499] = 0;
  _$jscoverage['/combo-loader.js'].lineData[500] = 0;
  _$jscoverage['/combo-loader.js'].lineData[503] = 0;
  _$jscoverage['/combo-loader.js'].lineData[504] = 0;
  _$jscoverage['/combo-loader.js'].lineData[505] = 0;
  _$jscoverage['/combo-loader.js'].lineData[506] = 0;
  _$jscoverage['/combo-loader.js'].lineData[509] = 0;
  _$jscoverage['/combo-loader.js'].lineData[510] = 0;
  _$jscoverage['/combo-loader.js'].lineData[511] = 0;
  _$jscoverage['/combo-loader.js'].lineData[512] = 0;
  _$jscoverage['/combo-loader.js'].lineData[513] = 0;
  _$jscoverage['/combo-loader.js'].lineData[517] = 0;
  _$jscoverage['/combo-loader.js'].lineData[521] = 0;
  _$jscoverage['/combo-loader.js'].lineData[522] = 0;
  _$jscoverage['/combo-loader.js'].lineData[524] = 0;
  _$jscoverage['/combo-loader.js'].lineData[527] = 0;
  _$jscoverage['/combo-loader.js'].lineData[528] = 0;
  _$jscoverage['/combo-loader.js'].lineData[530] = 0;
  _$jscoverage['/combo-loader.js'].lineData[531] = 0;
  _$jscoverage['/combo-loader.js'].lineData[532] = 0;
  _$jscoverage['/combo-loader.js'].lineData[534] = 0;
  _$jscoverage['/combo-loader.js'].lineData[537] = 0;
  _$jscoverage['/combo-loader.js'].lineData[538] = 0;
  _$jscoverage['/combo-loader.js'].lineData[542] = 0;
  _$jscoverage['/combo-loader.js'].lineData[546] = 0;
  _$jscoverage['/combo-loader.js'].lineData[547] = 0;
  _$jscoverage['/combo-loader.js'].lineData[548] = 0;
  _$jscoverage['/combo-loader.js'].lineData[552] = 0;
  _$jscoverage['/combo-loader.js'].lineData[555] = 0;
  _$jscoverage['/combo-loader.js'].lineData[556] = 0;
  _$jscoverage['/combo-loader.js'].lineData[561] = 0;
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
  _$jscoverage['/combo-loader.js'].branchData['205'] = [];
  _$jscoverage['/combo-loader.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['206'] = [];
  _$jscoverage['/combo-loader.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['225'] = [];
  _$jscoverage['/combo-loader.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['227'] = [];
  _$jscoverage['/combo-loader.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['252'] = [];
  _$jscoverage['/combo-loader.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['254'] = [];
  _$jscoverage['/combo-loader.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['262'] = [];
  _$jscoverage['/combo-loader.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['281'] = [];
  _$jscoverage['/combo-loader.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['288'] = [];
  _$jscoverage['/combo-loader.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['289'] = [];
  _$jscoverage['/combo-loader.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['291'] = [];
  _$jscoverage['/combo-loader.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['294'] = [];
  _$jscoverage['/combo-loader.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['295'] = [];
  _$jscoverage['/combo-loader.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['298'] = [];
  _$jscoverage['/combo-loader.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['300'] = [];
  _$jscoverage['/combo-loader.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['305'] = [];
  _$jscoverage['/combo-loader.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['310'] = [];
  _$jscoverage['/combo-loader.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['313'] = [];
  _$jscoverage['/combo-loader.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['313'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['314'] = [];
  _$jscoverage['/combo-loader.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['322'] = [];
  _$jscoverage['/combo-loader.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['323'] = [];
  _$jscoverage['/combo-loader.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['336'] = [];
  _$jscoverage['/combo-loader.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['367'] = [];
  _$jscoverage['/combo-loader.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['378'] = [];
  _$jscoverage['/combo-loader.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['379'] = [];
  _$jscoverage['/combo-loader.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['381'] = [];
  _$jscoverage['/combo-loader.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['385'] = [];
  _$jscoverage['/combo-loader.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['388'] = [];
  _$jscoverage['/combo-loader.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['388'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['396'] = [];
  _$jscoverage['/combo-loader.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['399'] = [];
  _$jscoverage['/combo-loader.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['402'] = [];
  _$jscoverage['/combo-loader.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['403'] = [];
  _$jscoverage['/combo-loader.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['406'] = [];
  _$jscoverage['/combo-loader.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['408'] = [];
  _$jscoverage['/combo-loader.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['408'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['461'] = [];
  _$jscoverage['/combo-loader.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['464'] = [];
  _$jscoverage['/combo-loader.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['480'] = [];
  _$jscoverage['/combo-loader.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['480'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['481'] = [];
  _$jscoverage['/combo-loader.js'].branchData['481'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['490'] = [];
  _$jscoverage['/combo-loader.js'].branchData['490'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['504'] = [];
  _$jscoverage['/combo-loader.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['510'] = [];
  _$jscoverage['/combo-loader.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['521'] = [];
  _$jscoverage['/combo-loader.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['530'] = [];
  _$jscoverage['/combo-loader.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['530'][2] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['530'][3] = new BranchData();
  _$jscoverage['/combo-loader.js'].branchData['547'] = [];
  _$jscoverage['/combo-loader.js'].branchData['547'][1] = new BranchData();
}
_$jscoverage['/combo-loader.js'].branchData['547'][1].init(48, 10, '!self.head');
function visit79_547_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['547'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['530'][3].init(131, 23, 'status === Status.ERROR');
function visit78_530_3(result) {
  _$jscoverage['/combo-loader.js'].branchData['530'][3].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['530'][2].init(104, 23, 'status >= Status.LOADED');
function visit77_530_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['530'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['530'][1].init(104, 50, 'status >= Status.LOADED || status === Status.ERROR');
function visit76_530_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['521'][1].init(18, 14, '!this.callback');
function visit75_521_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['510'][1].init(35, 20, 'comboRes[type] || []');
function visit74_510_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['504'][1].init(35, 20, 'comboRes[type] || []');
function visit73_504_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['490'][1].init(2336, 23, 'currentComboUrls.length');
function visit72_490_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['481'][1].init(65, 72, 'l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength');
function visit71_481_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['480'][2].init(847, 36, 'currentComboUrls.length > maxFileNum');
function visit70_480_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['480'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['480'][1].init(847, 139, 'currentComboUrls.length > maxFileNum || (l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)');
function visit69_480_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['464'][1].init(129, 157, '!currentMod.getPackage().isCombine() || !Utils.startsWith(url, basePrefix)');
function visit68_464_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['461'][1].init(991, 19, 'i < sendMods.length');
function visit67_461_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['408'][2].init(37, 19, 'tag !== tmpMods.tag');
function visit66_408_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['408'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['408'][1].init(30, 26, 'tag && tag !== tmpMods.tag');
function visit65_408_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['406'][1].init(158, 9, 'tag || \'\'');
function visit64_406_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['403'][1].init(104, 37, '!(tmpMods = normalTypes[packageBase])');
function visit63_403_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['402'][1].init(40, 37, 'normals[type] || (normals[type] = {})');
function visit62_402_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['399'][1].init(159, 9, 'tag || \'\'');
function visit61_399_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['396'][1].init(971, 5, '!find');
function visit60_396_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['388'][2].init(172, 19, 'tag !== tmpMods.tag');
function visit59_388_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['388'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['388'][1].init(165, 26, 'tag && tag !== tmpMods.tag');
function visit58_388_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['385'][1].init(30, 41, 'Utils.isSameOriginAs(prefix, packageBase)');
function visit57_385_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['381'][1].init(165, 45, 'typeGroups[group] || (typeGroups[group] = {})');
function visit56_381_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['379'][1].init(39, 35, 'groups[type] || (groups[type] = {})');
function visit55_379_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['378'][1].init(434, 32, 'packageInfo.isCombine() && group');
function visit54_378_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['367'][1].init(595, 5, 'i < l');
function visit53_367_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['336'][1].init(1909, 9, '\'@DEBUG@\'');
function visit52_336_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['323'][1].init(26, 23, 'stack.indexOf(m) !== -1');
function visit51_323_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['322'][1].init(851, 26, '\'@DEBUG@\' && stack.indexOf');
function visit50_322_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['314'][1].init(26, 21, 'modStatus !== LOADING');
function visit49_314_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['313'][2].init(530, 20, 'modStatus !== LOADED');
function visit48_313_2(result) {
  _$jscoverage['/combo-loader.js'].branchData['313'][2].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['313'][1].init(530, 43, 'modStatus !== LOADED && !mod.contains(self)');
function visit47_313_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['310'][1].init(413, 18, 'modStatus > LOADED');
function visit46_310_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['305'][1].init(235, 26, 'modStatus === Status.ERROR');
function visit45_305_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['300'][1].init(56, 8, 'cache[m]');
function visit44_300_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['298'][1].init(515, 19, 'i < modNames.length');
function visit43_298_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['295'][1].init(418, 9, '\'@DEBUG@\'');
function visit42_295_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['294'][1].init(388, 11, 'cache || {}');
function visit41_294_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['291'][1].init(283, 9, 'ret || []');
function visit40_291_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['289'][1].init(26, 11, 'stack || []');
function visit39_289_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['288'][1].init(198, 9, '\'@DEBUG@\'');
function visit38_288_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['281'][1].init(18, 16, '!modNames.length');
function visit37_281_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['262'][1].init(153, 12, '!mod.factory');
function visit36_262_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['254'][1].init(26, 9, '\'@DEBUG@\'');
function visit35_254_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['252'][1].init(1351, 12, 'comboUrls.js');
function visit34_252_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['227'][1].init(26, 9, '\'@DEBUG@\'');
function visit33_227_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['225'][1].init(227, 13, 'comboUrls.css');
function visit32_225_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['206'][1].init(18, 19, 'str1[i] !== str2[i]');
function visit31_206_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/combo-loader.js'].branchData['205'][1].init(321, 5, 'i < l');
function visit30_205_1(result) {
  _$jscoverage['/combo-loader.js'].branchData['205'][1].ranCondition(result);
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
  function getCommonPrefix(str1, str2) {
    _$jscoverage['/combo-loader.js'].functionData[13]++;
    _$jscoverage['/combo-loader.js'].lineData[201]++;
    var prefix = str1.substring(0, str1.indexOf('//') + 2);
    _$jscoverage['/combo-loader.js'].lineData[202]++;
    str1 = str1.substring(prefix.length).split(/\//);
    _$jscoverage['/combo-loader.js'].lineData[203]++;
    str2 = str2.substring(prefix.length).split(/\//);
    _$jscoverage['/combo-loader.js'].lineData[204]++;
    var l = Math.min(str1.length, str2.length);
    _$jscoverage['/combo-loader.js'].lineData[205]++;
    for (var i = 0; visit30_205_1(i < l); i++) {
      _$jscoverage['/combo-loader.js'].lineData[206]++;
      if (visit31_206_1(str1[i] !== str2[i])) {
        _$jscoverage['/combo-loader.js'].lineData[207]++;
        break;
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[210]++;
    return prefix + str1.slice(0, i).join('/') + '/';
  }
  _$jscoverage['/combo-loader.js'].lineData[213]++;
  Utils.mix(ComboLoader.prototype, {
  use: function(allMods) {
  _$jscoverage['/combo-loader.js'].functionData[14]++;
  _$jscoverage['/combo-loader.js'].lineData[218]++;
  var self = this, comboUrls, timeout = Config.timeout;
  _$jscoverage['/combo-loader.js'].lineData[222]++;
  comboUrls = self.getComboUrls(allMods);
  _$jscoverage['/combo-loader.js'].lineData[225]++;
  if (visit32_225_1(comboUrls.css)) {
    _$jscoverage['/combo-loader.js'].lineData[226]++;
    loadScripts(comboUrls.css, function(success, error) {
  _$jscoverage['/combo-loader.js'].functionData[15]++;
  _$jscoverage['/combo-loader.js'].lineData[227]++;
  if (visit33_227_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[228]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/combo-loader.js'].lineData[231]++;
  each(success, function(one) {
  _$jscoverage['/combo-loader.js'].functionData[16]++;
  _$jscoverage['/combo-loader.js'].lineData[232]++;
  each(one.mods, function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[17]++;
  _$jscoverage['/combo-loader.js'].lineData[233]++;
  Utils.registerModule(mod.name, Utils.noop);
  _$jscoverage['/combo-loader.js'].lineData[235]++;
  mod.flush();
});
});
  _$jscoverage['/combo-loader.js'].lineData[239]++;
  each(error, function(one) {
  _$jscoverage['/combo-loader.js'].functionData[18]++;
  _$jscoverage['/combo-loader.js'].lineData[240]++;
  each(one.mods, function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[19]++;
  _$jscoverage['/combo-loader.js'].lineData[241]++;
  var msg = mod.name + ' is not loaded! can not find module in url : ' + one.url;
  _$jscoverage['/combo-loader.js'].lineData[242]++;
  S.log(msg, 'error');
  _$jscoverage['/combo-loader.js'].lineData[243]++;
  mod.status = ERROR;
  _$jscoverage['/combo-loader.js'].lineData[245]++;
  mod.flush();
});
});
}, timeout);
  }
  _$jscoverage['/combo-loader.js'].lineData[252]++;
  if (visit34_252_1(comboUrls.js)) {
    _$jscoverage['/combo-loader.js'].lineData[253]++;
    loadScripts(comboUrls.js, function(success) {
  _$jscoverage['/combo-loader.js'].functionData[20]++;
  _$jscoverage['/combo-loader.js'].lineData[254]++;
  if (visit35_254_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[255]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/combo-loader.js'].lineData[258]++;
  each(comboUrls.js, function(one) {
  _$jscoverage['/combo-loader.js'].functionData[21]++;
  _$jscoverage['/combo-loader.js'].lineData[259]++;
  each(one.mods, function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[22]++;
  _$jscoverage['/combo-loader.js'].lineData[262]++;
  if (visit36_262_1(!mod.factory)) {
    _$jscoverage['/combo-loader.js'].lineData[263]++;
    var msg = mod.name + ' is not loaded! can not find module in url : ' + one.url;
    _$jscoverage['/combo-loader.js'].lineData[266]++;
    S.log(msg, 'error');
    _$jscoverage['/combo-loader.js'].lineData[267]++;
    mod.status = ERROR;
  }
  _$jscoverage['/combo-loader.js'].lineData[270]++;
  mod.flush();
});
});
}, timeout);
  }
}, 
  calculate: function(modNames, errorList, stack, cache, ret) {
  _$jscoverage['/combo-loader.js'].functionData[23]++;
  _$jscoverage['/combo-loader.js'].lineData[281]++;
  if (visit37_281_1(!modNames.length)) {
    _$jscoverage['/combo-loader.js'].lineData[282]++;
    return [];
  }
  _$jscoverage['/combo-loader.js'].lineData[285]++;
  var i, m, mod, modStatus, stackDepth, self = this;
  _$jscoverage['/combo-loader.js'].lineData[288]++;
  if (visit38_288_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[289]++;
    stack = visit39_289_1(stack || []);
  }
  _$jscoverage['/combo-loader.js'].lineData[291]++;
  ret = visit40_291_1(ret || []);
  _$jscoverage['/combo-loader.js'].lineData[294]++;
  cache = visit41_294_1(cache || {});
  _$jscoverage['/combo-loader.js'].lineData[295]++;
  if (visit42_295_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[296]++;
    stackDepth = stack.length;
  }
  _$jscoverage['/combo-loader.js'].lineData[298]++;
  for (i = 0; visit43_298_1(i < modNames.length); i++) {
    _$jscoverage['/combo-loader.js'].lineData[299]++;
    m = modNames[i];
    _$jscoverage['/combo-loader.js'].lineData[300]++;
    if (visit44_300_1(cache[m])) {
      _$jscoverage['/combo-loader.js'].lineData[301]++;
      continue;
    }
    _$jscoverage['/combo-loader.js'].lineData[303]++;
    mod = Utils.getOrCreateModuleInfo(m);
    _$jscoverage['/combo-loader.js'].lineData[304]++;
    modStatus = mod.status;
    _$jscoverage['/combo-loader.js'].lineData[305]++;
    if (visit45_305_1(modStatus === Status.ERROR)) {
      _$jscoverage['/combo-loader.js'].lineData[306]++;
      errorList.push(mod);
      _$jscoverage['/combo-loader.js'].lineData[307]++;
      cache[m] = 1;
      _$jscoverage['/combo-loader.js'].lineData[308]++;
      continue;
    }
    _$jscoverage['/combo-loader.js'].lineData[310]++;
    if (visit46_310_1(modStatus > LOADED)) {
      _$jscoverage['/combo-loader.js'].lineData[311]++;
      cache[m] = 1;
      _$jscoverage['/combo-loader.js'].lineData[312]++;
      continue;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[313]++;
      if (visit47_313_1(visit48_313_2(modStatus !== LOADED) && !mod.contains(self))) {
        _$jscoverage['/combo-loader.js'].lineData[314]++;
        if (visit49_314_1(modStatus !== LOADING)) {
          _$jscoverage['/combo-loader.js'].lineData[315]++;
          mod.status = LOADING;
          _$jscoverage['/combo-loader.js'].lineData[316]++;
          ret.push(mod);
        }
        _$jscoverage['/combo-loader.js'].lineData[318]++;
        mod.add(self);
        _$jscoverage['/combo-loader.js'].lineData[319]++;
        self.wait(mod);
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[322]++;
    if (visit50_322_1('@DEBUG@' && stack.indexOf)) {
      _$jscoverage['/combo-loader.js'].lineData[323]++;
      if (visit51_323_1(stack.indexOf(m) !== -1)) {
        _$jscoverage['/combo-loader.js'].lineData[324]++;
        S.log('find cyclic dependency between mods: ' + stack, 'warn');
        _$jscoverage['/combo-loader.js'].lineData[325]++;
        cache[m] = 1;
        _$jscoverage['/combo-loader.js'].lineData[326]++;
        continue;
      } else {
        _$jscoverage['/combo-loader.js'].lineData[328]++;
        stack.push(m);
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[332]++;
    self.calculate(mod.getNormalizedRequires(), errorList, stack, cache, ret);
    _$jscoverage['/combo-loader.js'].lineData[333]++;
    cache[m] = 1;
  }
  _$jscoverage['/combo-loader.js'].lineData[336]++;
  if (visit52_336_1('@DEBUG@')) {
    _$jscoverage['/combo-loader.js'].lineData[337]++;
    stack.length = stackDepth;
  }
  _$jscoverage['/combo-loader.js'].lineData[340]++;
  return ret;
}, 
  getComboMods: function(mods) {
  _$jscoverage['/combo-loader.js'].functionData[24]++;
  _$jscoverage['/combo-loader.js'].lineData[347]++;
  var i, l = mods.length, tmpMods, mod, packageInfo, type, tag, charset, packageBase, packageName, group, modUrl;
  _$jscoverage['/combo-loader.js'].lineData[351]++;
  var groups = {};
  _$jscoverage['/combo-loader.js'].lineData[360]++;
  var normals = {};
  _$jscoverage['/combo-loader.js'].lineData[367]++;
  for (i = 0; visit53_367_1(i < l); ++i) {
    _$jscoverage['/combo-loader.js'].lineData[368]++;
    mod = mods[i];
    _$jscoverage['/combo-loader.js'].lineData[369]++;
    type = mod.getType();
    _$jscoverage['/combo-loader.js'].lineData[370]++;
    modUrl = mod.getUrl();
    _$jscoverage['/combo-loader.js'].lineData[371]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/combo-loader.js'].lineData[372]++;
    packageBase = packageInfo.getBase();
    _$jscoverage['/combo-loader.js'].lineData[373]++;
    packageName = packageInfo.name;
    _$jscoverage['/combo-loader.js'].lineData[374]++;
    charset = packageInfo.getCharset();
    _$jscoverage['/combo-loader.js'].lineData[375]++;
    tag = packageInfo.getTag();
    _$jscoverage['/combo-loader.js'].lineData[376]++;
    group = packageInfo.getGroup();
    _$jscoverage['/combo-loader.js'].lineData[378]++;
    if (visit54_378_1(packageInfo.isCombine() && group)) {
      _$jscoverage['/combo-loader.js'].lineData[379]++;
      var typeGroups = visit55_379_1(groups[type] || (groups[type] = {}));
      _$jscoverage['/combo-loader.js'].lineData[380]++;
      group = group + '-' + charset;
      _$jscoverage['/combo-loader.js'].lineData[381]++;
      var typeGroup = visit56_381_1(typeGroups[group] || (typeGroups[group] = {}));
      _$jscoverage['/combo-loader.js'].lineData[382]++;
      var find = 0;
      _$jscoverage['/combo-loader.js'].lineData[384]++;
      Utils.each(typeGroup, function(tmpMods, prefix) {
  _$jscoverage['/combo-loader.js'].functionData[25]++;
  _$jscoverage['/combo-loader.js'].lineData[385]++;
  if (visit57_385_1(Utils.isSameOriginAs(prefix, packageBase))) {
    _$jscoverage['/combo-loader.js'].lineData[386]++;
    var newPrefix = getCommonPrefix(prefix, packageBase);
    _$jscoverage['/combo-loader.js'].lineData[387]++;
    tmpMods.push(mod);
    _$jscoverage['/combo-loader.js'].lineData[388]++;
    if (visit58_388_1(tag && visit59_388_2(tag !== tmpMods.tag))) {
      _$jscoverage['/combo-loader.js'].lineData[389]++;
      tmpMods.tag = getHash(tmpMods.tag + tag);
    }
    _$jscoverage['/combo-loader.js'].lineData[391]++;
    delete typeGroup[prefix];
    _$jscoverage['/combo-loader.js'].lineData[392]++;
    typeGroup[newPrefix] = tmpMods;
    _$jscoverage['/combo-loader.js'].lineData[393]++;
    find = 1;
  }
});
      _$jscoverage['/combo-loader.js'].lineData[396]++;
      if (visit60_396_1(!find)) {
        _$jscoverage['/combo-loader.js'].lineData[397]++;
        tmpMods = typeGroup[packageBase] = [mod];
        _$jscoverage['/combo-loader.js'].lineData[398]++;
        tmpMods.charset = charset;
        _$jscoverage['/combo-loader.js'].lineData[399]++;
        tmpMods.tag = visit61_399_1(tag || '');
      }
    } else {
      _$jscoverage['/combo-loader.js'].lineData[402]++;
      var normalTypes = visit62_402_1(normals[type] || (normals[type] = {}));
      _$jscoverage['/combo-loader.js'].lineData[403]++;
      if (visit63_403_1(!(tmpMods = normalTypes[packageBase]))) {
        _$jscoverage['/combo-loader.js'].lineData[404]++;
        tmpMods = normalTypes[packageBase] = [];
        _$jscoverage['/combo-loader.js'].lineData[405]++;
        tmpMods.charset = charset;
        _$jscoverage['/combo-loader.js'].lineData[406]++;
        tmpMods.tag = visit64_406_1(tag || '');
      } else {
        _$jscoverage['/combo-loader.js'].lineData[408]++;
        if (visit65_408_1(tag && visit66_408_2(tag !== tmpMods.tag))) {
          _$jscoverage['/combo-loader.js'].lineData[409]++;
          tmpMods.tag = getHash(tmpMods.tag + tag);
        }
      }
      _$jscoverage['/combo-loader.js'].lineData[412]++;
      tmpMods.push(mod);
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[417]++;
  return {
  groups: groups, 
  normals: normals};
}, 
  getComboUrls: function(mods) {
  _$jscoverage['/combo-loader.js'].functionData[26]++;
  _$jscoverage['/combo-loader.js'].lineData[427]++;
  var comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/combo-loader.js'].lineData[432]++;
  var comboMods = this.getComboMods(mods);
  _$jscoverage['/combo-loader.js'].lineData[434]++;
  var comboRes = {};
  _$jscoverage['/combo-loader.js'].lineData[436]++;
  function processSamePrefixUrlMods(type, basePrefix, sendMods) {
    _$jscoverage['/combo-loader.js'].functionData[27]++;
    _$jscoverage['/combo-loader.js'].lineData[437]++;
    var currentComboUrls = [];
    _$jscoverage['/combo-loader.js'].lineData[438]++;
    var currentComboMods = [];
    _$jscoverage['/combo-loader.js'].lineData[439]++;
    var tag = sendMods.tag;
    _$jscoverage['/combo-loader.js'].lineData[440]++;
    var charset = sendMods.charset;
    _$jscoverage['/combo-loader.js'].lineData[441]++;
    var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''), suffixLength = suffix.length;
    _$jscoverage['/combo-loader.js'].lineData[444]++;
    var baseLen = basePrefix.length, prefix = basePrefix + comboPrefix, res = [];
    _$jscoverage['/combo-loader.js'].lineData[448]++;
    var l = prefix.length;
    _$jscoverage['/combo-loader.js'].lineData[451]++;
    var pushComboUrl = function() {
  _$jscoverage['/combo-loader.js'].functionData[28]++;
  _$jscoverage['/combo-loader.js'].lineData[453]++;
  res.push({
  combine: 1, 
  url: prefix + currentComboUrls.join(comboSep) + suffix, 
  charset: charset, 
  mods: currentComboMods});
};
    _$jscoverage['/combo-loader.js'].lineData[461]++;
    for (var i = 0; visit67_461_1(i < sendMods.length); i++) {
      _$jscoverage['/combo-loader.js'].lineData[462]++;
      var currentMod = sendMods[i];
      _$jscoverage['/combo-loader.js'].lineData[463]++;
      var url = currentMod.getUrl();
      _$jscoverage['/combo-loader.js'].lineData[464]++;
      if (visit68_464_1(!currentMod.getPackage().isCombine() || !Utils.startsWith(url, basePrefix))) {
        _$jscoverage['/combo-loader.js'].lineData[467]++;
        res.push({
  combine: 0, 
  url: url, 
  charset: charset, 
  mods: [currentMod]});
        _$jscoverage['/combo-loader.js'].lineData[473]++;
        continue;
      }
      _$jscoverage['/combo-loader.js'].lineData[476]++;
      var subPath = url.slice(baseLen).replace(/\?.*$/, '');
      _$jscoverage['/combo-loader.js'].lineData[477]++;
      currentComboUrls.push(subPath);
      _$jscoverage['/combo-loader.js'].lineData[478]++;
      currentComboMods.push(currentMod);
      _$jscoverage['/combo-loader.js'].lineData[480]++;
      if (visit69_480_1(visit70_480_2(currentComboUrls.length > maxFileNum) || (visit71_481_1(l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)))) {
        _$jscoverage['/combo-loader.js'].lineData[482]++;
        currentComboUrls.pop();
        _$jscoverage['/combo-loader.js'].lineData[483]++;
        currentComboMods.pop();
        _$jscoverage['/combo-loader.js'].lineData[484]++;
        pushComboUrl();
        _$jscoverage['/combo-loader.js'].lineData[485]++;
        currentComboUrls = [];
        _$jscoverage['/combo-loader.js'].lineData[486]++;
        currentComboMods = [];
        _$jscoverage['/combo-loader.js'].lineData[487]++;
        i--;
      }
    }
    _$jscoverage['/combo-loader.js'].lineData[490]++;
    if (visit72_490_1(currentComboUrls.length)) {
      _$jscoverage['/combo-loader.js'].lineData[491]++;
      pushComboUrl();
    }
    _$jscoverage['/combo-loader.js'].lineData[494]++;
    comboRes[type].push.apply(comboRes[type], res);
  }
  _$jscoverage['/combo-loader.js'].lineData[497]++;
  var type, prefix;
  _$jscoverage['/combo-loader.js'].lineData[498]++;
  var normals = comboMods.normals;
  _$jscoverage['/combo-loader.js'].lineData[499]++;
  var groups = comboMods.groups;
  _$jscoverage['/combo-loader.js'].lineData[500]++;
  var group;
  _$jscoverage['/combo-loader.js'].lineData[503]++;
  for (type in normals) {
    _$jscoverage['/combo-loader.js'].lineData[504]++;
    comboRes[type] = visit73_504_1(comboRes[type] || []);
    _$jscoverage['/combo-loader.js'].lineData[505]++;
    for (prefix in normals[type]) {
      _$jscoverage['/combo-loader.js'].lineData[506]++;
      processSamePrefixUrlMods(type, prefix, normals[type][prefix]);
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[509]++;
  for (type in groups) {
    _$jscoverage['/combo-loader.js'].lineData[510]++;
    comboRes[type] = visit74_510_1(comboRes[type] || []);
    _$jscoverage['/combo-loader.js'].lineData[511]++;
    for (group in groups[type]) {
      _$jscoverage['/combo-loader.js'].lineData[512]++;
      for (prefix in groups[type][group]) {
        _$jscoverage['/combo-loader.js'].lineData[513]++;
        processSamePrefixUrlMods(type, prefix, groups[type][group][prefix]);
      }
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[517]++;
  return comboRes;
}, 
  flush: function() {
  _$jscoverage['/combo-loader.js'].functionData[29]++;
  _$jscoverage['/combo-loader.js'].lineData[521]++;
  if (visit75_521_1(!this.callback)) {
    _$jscoverage['/combo-loader.js'].lineData[522]++;
    return;
  }
  _$jscoverage['/combo-loader.js'].lineData[524]++;
  var self = this, head = self.head, callback = self.callback;
  _$jscoverage['/combo-loader.js'].lineData[527]++;
  while (head) {
    _$jscoverage['/combo-loader.js'].lineData[528]++;
    var node = head.node, status = node.status;
    _$jscoverage['/combo-loader.js'].lineData[530]++;
    if (visit76_530_1(visit77_530_2(status >= Status.LOADED) || visit78_530_3(status === Status.ERROR))) {
      _$jscoverage['/combo-loader.js'].lineData[531]++;
      node.remove(self);
      _$jscoverage['/combo-loader.js'].lineData[532]++;
      head = self.head = head.next;
    } else {
      _$jscoverage['/combo-loader.js'].lineData[534]++;
      return;
    }
  }
  _$jscoverage['/combo-loader.js'].lineData[537]++;
  self.callback = null;
  _$jscoverage['/combo-loader.js'].lineData[538]++;
  callback();
}, 
  isCompleteLoading: function() {
  _$jscoverage['/combo-loader.js'].functionData[30]++;
  _$jscoverage['/combo-loader.js'].lineData[542]++;
  return !this.head;
}, 
  wait: function(mod) {
  _$jscoverage['/combo-loader.js'].functionData[31]++;
  _$jscoverage['/combo-loader.js'].lineData[546]++;
  var self = this;
  _$jscoverage['/combo-loader.js'].lineData[547]++;
  if (visit79_547_1(!self.head)) {
    _$jscoverage['/combo-loader.js'].lineData[548]++;
    self.tail = self.head = {
  node: mod};
  } else {
    _$jscoverage['/combo-loader.js'].lineData[552]++;
    var newNode = {
  node: mod};
    _$jscoverage['/combo-loader.js'].lineData[555]++;
    self.tail.next = newNode;
    _$jscoverage['/combo-loader.js'].lineData[556]++;
    self.tail = newNode;
  }
}});
  _$jscoverage['/combo-loader.js'].lineData[561]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
