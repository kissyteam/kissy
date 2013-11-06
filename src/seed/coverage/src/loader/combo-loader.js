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
  _$jscoverage['/loader/combo-loader.js'].lineData[90] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[91] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[92] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[93] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[95] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[97] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[98] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[99] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[102] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[108] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[109] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[110] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[112] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[114] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[120] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[121] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[127] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[128] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[129] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[130] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[131] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[134] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[135] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[142] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[143] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[144] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[146] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[149] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[150] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[151] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[152] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[153] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[154] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[157] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[158] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[163] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[164] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[165] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[166] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[167] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[168] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[169] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[172] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[175] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[180] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[186] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[188] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[190] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[193] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[194] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[195] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[196] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[199] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[200] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[201] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[203] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[207] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[208] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[209] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[212] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[213] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[215] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[222] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[223] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[224] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[225] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[228] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[229] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[232] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[233] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[236] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[237] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[240] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[251] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[259] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[262] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[264] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[265] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[266] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[267] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[269] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[270] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[271] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[272] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[273] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[275] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[276] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[277] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[278] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[279] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[281] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[282] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[284] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[286] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[289] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[292] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[299] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[308] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[309] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[310] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[311] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[312] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[313] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[314] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[315] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[316] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[317] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[318] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[319] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[321] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[323] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[326] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[328] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[329] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[330] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[331] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[334] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[335] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[338] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[341] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[344] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[345] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[346] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[347] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[348] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[350] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[353] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[356] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[359] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[366] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[373] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[375] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[377] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[380] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[381] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[382] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[383] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[384] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[385] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[386] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[387] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[389] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[396] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[397] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[398] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[400] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[403] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[412] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[413] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[414] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[416] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[417] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[418] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[423] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[426] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[427] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[428] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[430] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[432] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[433] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[434] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[435] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[436] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[437] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[440] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[441] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[445] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[449] = 0;
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
  _$jscoverage['/loader/combo-loader.js'].branchData['90'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['93'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['108'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['127'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['129'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['134'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['153'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['157'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['167'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['168'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['195'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['224'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['232'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['259'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['262'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['264'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['266'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['272'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['272'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['272'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['275'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['276'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['277'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['308'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['323'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['323'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['329'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['330'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['344'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['345'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['350'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['350'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['350'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['387'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['412'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['417'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['430'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['430'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['431'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['440'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['440'][1] = new BranchData();
}
_$jscoverage['/loader/combo-loader.js'].branchData['440'][1].init(2808, 23, 'currentComboUrls.length');
function visit351_440_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['431'][1].init(69, 72, 'l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength');
function visit350_431_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['430'][2].init(845, 36, 'currentComboUrls.length > maxFileNum');
function visit349_430_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['430'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['430'][1].init(845, 143, 'currentComboUrls.length > maxFileNum || (l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)');
function visit348_430_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['417'][1].init(249, 25, '!currentMod.canBeCombined');
function visit347_417_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['412'][1].init(1429, 15, 'i < mods.length');
function visit346_412_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['387'][1].init(231, 15, 'tags.length > 1');
function visit345_387_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['350'][3].init(51, 19, 'mods.tags[0] == tag');
function visit344_350_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['350'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['350'][2].init(26, 21, 'mods.tags.length == 1');
function visit343_350_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['350'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['350'][1].init(26, 44, 'mods.tags.length == 1 && mods.tags[0] == tag');
function visit342_350_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['345'][1].init(1830, 32, '!(mods = typedCombos[comboName])');
function visit341_345_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['344'][1].init(1786, 21, 'comboMods[type] || {}');
function visit340_344_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['330'][1].init(30, 41, 'groupPrefixUri.isSameOriginAs(packageUri)');
function visit339_330_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['329'][1].init(188, 41, 'groupPrefixUri = comboPrefixes[comboName]');
function visit338_329_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['323'][2].init(764, 83, 'packageInfo.isCombine() && S.startsWith(fullpath, packagePath)');
function visit337_323_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['323'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['323'][1].init(744, 113, '(mod.canBeCombined = packageInfo.isCombine() && S.startsWith(fullpath, packagePath)) && group');
function visit336_323_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['308'][1].init(348, 5, 'i < l');
function visit335_308_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['277'][1].init(30, 20, 'modStatus != LOADING');
function visit334_277_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['276'][1].init(26, 27, '!waitingModules.contains(m)');
function visit333_276_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['275'][1].init(390, 19, 'modStatus != LOADED');
function visit332_275_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['272'][3].init(293, 22, 'modStatus === ATTACHED');
function visit331_272_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['272'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['272'][2].init(270, 19, 'modStatus === ERROR');
function visit330_272_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['272'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['272'][1].init(270, 45, 'modStatus === ERROR || modStatus === ATTACHED');
function visit329_272_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['266'][1].init(56, 8, 'cache[m]');
function visit328_266_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['264'][1].init(383, 19, 'i < modNames.length');
function visit327_264_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['262'][1].init(343, 11, 'cache || {}');
function visit326_262_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['259'][1].init(238, 9, 'ret || {}');
function visit325_259_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['232'][1].init(153, 7, '!mod.fn');
function visit324_232_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['224'][1].init(26, 9, '\'@DEBUG@\'');
function visit323_224_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['195'][1].init(26, 9, '\'@DEBUG@\'');
function visit322_195_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['168'][1].init(18, 19, 'str1[i] !== str2[i]');
function visit321_168_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['167'][1].init(147, 5, 'i < l');
function visit320_167_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['157'][1].init(205, 9, 'ms.length');
function visit319_157_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['153'][1].init(22, 18, 'm.status == LOADED');
function visit318_153_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['134'][1].init(386, 2, 're');
function visit317_134_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['129'][1].init(52, 34, 'script.readyState == \'interactive\'');
function visit316_129_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['127'][1].init(189, 6, 'i >= 0');
function visit315_127_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['108'][1].init(18, 5, 'oldIE');
function visit314_108_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['93'][1].init(68, 5, 'oldIE');
function visit313_93_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['90'][1].init(14, 26, 'typeof name === \'function\'');
function visit312_90_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['90'][1].ranCondition(result);
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
  ComboLoader.add = function(name, fn, config, runtime) {
  _$jscoverage['/loader/combo-loader.js'].functionData[7]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[90]++;
  if (visit312_90_1(typeof name === 'function')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[91]++;
    config = fn;
    _$jscoverage['/loader/combo-loader.js'].lineData[92]++;
    fn = name;
    _$jscoverage['/loader/combo-loader.js'].lineData[93]++;
    if (visit313_93_1(oldIE)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[95]++;
      name = findModuleNameByInteractive();
      _$jscoverage['/loader/combo-loader.js'].lineData[97]++;
      Utils.registerModule(runtime, name, fn, config);
      _$jscoverage['/loader/combo-loader.js'].lineData[98]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[99]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[102]++;
      currentMod = {
  fn: fn, 
  config: config};
    }
  } else {
    _$jscoverage['/loader/combo-loader.js'].lineData[108]++;
    if (visit314_108_1(oldIE)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[109]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[110]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[112]++;
      currentMod = undefined;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[114]++;
    Utils.registerModule(runtime, name, fn, config);
  }
};
  _$jscoverage['/loader/combo-loader.js'].lineData[120]++;
  function findModuleNameByInteractive() {
    _$jscoverage['/loader/combo-loader.js'].functionData[8]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[121]++;
    var scripts = S.Env.host.document.getElementsByTagName('script'), re, i, name, script;
    _$jscoverage['/loader/combo-loader.js'].lineData[127]++;
    for (i = scripts.length - 1; visit315_127_1(i >= 0); i--) {
      _$jscoverage['/loader/combo-loader.js'].lineData[128]++;
      script = scripts[i];
      _$jscoverage['/loader/combo-loader.js'].lineData[129]++;
      if (visit316_129_1(script.readyState == 'interactive')) {
        _$jscoverage['/loader/combo-loader.js'].lineData[130]++;
        re = script;
        _$jscoverage['/loader/combo-loader.js'].lineData[131]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[134]++;
    if (visit317_134_1(re)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[135]++;
      name = re.getAttribute('data-mod-name');
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[142]++;
      logger.debug('can not find interactive script,time diff : ' + (S.now() - startLoadModTime));
      _$jscoverage['/loader/combo-loader.js'].lineData[143]++;
      logger.debug('old_ie get mod name from cache : ' + startLoadModName);
      _$jscoverage['/loader/combo-loader.js'].lineData[144]++;
      name = startLoadModName;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[146]++;
    return name;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[149]++;
  function debugRemoteModules(rss) {
    _$jscoverage['/loader/combo-loader.js'].functionData[9]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[150]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[10]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[151]++;
  var ms = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[152]++;
  S.each(rs.mods, function(m) {
  _$jscoverage['/loader/combo-loader.js'].functionData[11]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[153]++;
  if (visit318_153_1(m.status == LOADED)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[154]++;
    ms.push(m.name);
  }
});
  _$jscoverage['/loader/combo-loader.js'].lineData[157]++;
  if (visit319_157_1(ms.length)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[158]++;
    logger.info('load remote modules: "' + ms.join(', ') + '" from: "' + rs.fullpath + '"');
  }
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[163]++;
  function getCommonPrefix(str1, str2) {
    _$jscoverage['/loader/combo-loader.js'].functionData[12]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[164]++;
    str1 = str1.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[165]++;
    str2 = str2.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[166]++;
    var l = Math.min(str1.length, str2.length);
    _$jscoverage['/loader/combo-loader.js'].lineData[167]++;
    for (var i = 0; visit320_167_1(i < l); i++) {
      _$jscoverage['/loader/combo-loader.js'].lineData[168]++;
      if (visit321_168_1(str1[i] !== str2[i])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[169]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[172]++;
    return str1.slice(0, i).join('/') + '/';
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[175]++;
  S.augment(ComboLoader, {
  use: function(normalizedModNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[13]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[180]++;
  var self = this, allModNames, comboUrls, timeout = S.Config.timeout, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[186]++;
  allModNames = S.keys(self.calculate(normalizedModNames));
  _$jscoverage['/loader/combo-loader.js'].lineData[188]++;
  Utils.createModulesInfo(runtime, allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[190]++;
  comboUrls = self.getComboUrls(allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[193]++;
  S.each(comboUrls.css, function(cssOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[14]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[194]++;
  loadScripts(runtime, cssOne, function(success, error) {
  _$jscoverage['/loader/combo-loader.js'].functionData[15]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[195]++;
  if (visit322_195_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[196]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[199]++;
  S.each(success, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[16]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[200]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[17]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[201]++;
  Utils.registerModule(runtime, mod.getName(), S.noop);
  _$jscoverage['/loader/combo-loader.js'].lineData[203]++;
  mod.notifyAll();
});
});
  _$jscoverage['/loader/combo-loader.js'].lineData[207]++;
  S.each(error, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[18]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[208]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[19]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[209]++;
  var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[212]++;
  S.log(msg, 'error');
  _$jscoverage['/loader/combo-loader.js'].lineData[213]++;
  mod.status = ERROR;
  _$jscoverage['/loader/combo-loader.js'].lineData[215]++;
  mod.notifyAll();
});
});
}, cssOne.charset, timeout);
});
  _$jscoverage['/loader/combo-loader.js'].lineData[222]++;
  S.each(comboUrls['js'], function(jsOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[20]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[223]++;
  loadScripts(runtime, jsOne, function(success) {
  _$jscoverage['/loader/combo-loader.js'].functionData[21]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[224]++;
  if (visit323_224_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[225]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[228]++;
  S.each(jsOne, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[22]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[229]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[23]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[232]++;
  if (visit324_232_1(!mod.fn)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[233]++;
    var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
    _$jscoverage['/loader/combo-loader.js'].lineData[236]++;
    S.log(msg, 'error');
    _$jscoverage['/loader/combo-loader.js'].lineData[237]++;
    mod.status = ERROR;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[240]++;
  mod.notifyAll();
});
});
}, jsOne.charset, timeout);
});
}, 
  calculate: function(modNames, cache, ret) {
  _$jscoverage['/loader/combo-loader.js'].functionData[24]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[251]++;
  var i, m, mod, modStatus, self = this, waitingModules = self.waitingModules, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[259]++;
  ret = visit325_259_1(ret || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[262]++;
  cache = visit326_262_1(cache || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[264]++;
  for (i = 0; visit327_264_1(i < modNames.length); i++) {
    _$jscoverage['/loader/combo-loader.js'].lineData[265]++;
    m = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[266]++;
    if (visit328_266_1(cache[m])) {
      _$jscoverage['/loader/combo-loader.js'].lineData[267]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[269]++;
    cache[m] = 1;
    _$jscoverage['/loader/combo-loader.js'].lineData[270]++;
    mod = Utils.createModuleInfo(runtime, m);
    _$jscoverage['/loader/combo-loader.js'].lineData[271]++;
    modStatus = mod.status;
    _$jscoverage['/loader/combo-loader.js'].lineData[272]++;
    if (visit329_272_1(visit330_272_2(modStatus === ERROR) || visit331_272_3(modStatus === ATTACHED))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[273]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[275]++;
    if (visit332_275_1(modStatus != LOADED)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[276]++;
      if (visit333_276_1(!waitingModules.contains(m))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[277]++;
        if (visit334_277_1(modStatus != LOADING)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[278]++;
          mod.status = LOADING;
          _$jscoverage['/loader/combo-loader.js'].lineData[279]++;
          ret[m] = 1;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[281]++;
        mod.wait(function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[25]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[282]++;
  waitingModules.remove(mod.getName());
  _$jscoverage['/loader/combo-loader.js'].lineData[284]++;
  waitingModules.notifyAll();
});
        _$jscoverage['/loader/combo-loader.js'].lineData[286]++;
        waitingModules.add(m);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[289]++;
    self.calculate(mod.getNormalizedRequires(), cache, ret);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[292]++;
  return ret;
}, 
  getComboMods: function(modNames, comboPrefixes) {
  _$jscoverage['/loader/combo-loader.js'].functionData[26]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[299]++;
  var comboMods = {}, packageUri, runtime = this.runtime, i = 0, l = modNames.length, modName, mod, packageInfo, type, typedCombos, mods, tag, charset, packagePath, packageName, group, fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[308]++;
  for (; visit335_308_1(i < l); ++i) {
    _$jscoverage['/loader/combo-loader.js'].lineData[309]++;
    modName = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[310]++;
    mod = Utils.createModuleInfo(runtime, modName);
    _$jscoverage['/loader/combo-loader.js'].lineData[311]++;
    type = mod.getType();
    _$jscoverage['/loader/combo-loader.js'].lineData[312]++;
    fullpath = mod.getFullPath();
    _$jscoverage['/loader/combo-loader.js'].lineData[313]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/loader/combo-loader.js'].lineData[314]++;
    packageName = packageInfo.getName();
    _$jscoverage['/loader/combo-loader.js'].lineData[315]++;
    charset = packageInfo.getCharset();
    _$jscoverage['/loader/combo-loader.js'].lineData[316]++;
    tag = packageInfo.getTag();
    _$jscoverage['/loader/combo-loader.js'].lineData[317]++;
    group = packageInfo.getGroup();
    _$jscoverage['/loader/combo-loader.js'].lineData[318]++;
    packagePath = packageInfo.getPrefixUriForCombo();
    _$jscoverage['/loader/combo-loader.js'].lineData[319]++;
    packageUri = packageInfo.getPackageUri();
    _$jscoverage['/loader/combo-loader.js'].lineData[321]++;
    var comboName = packageName;
    _$jscoverage['/loader/combo-loader.js'].lineData[323]++;
    if (visit336_323_1((mod.canBeCombined = visit337_323_2(packageInfo.isCombine() && S.startsWith(fullpath, packagePath))) && group)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[326]++;
      comboName = group + '_' + charset + '_' + groupTag;
      _$jscoverage['/loader/combo-loader.js'].lineData[328]++;
      var groupPrefixUri;
      _$jscoverage['/loader/combo-loader.js'].lineData[329]++;
      if (visit338_329_1(groupPrefixUri = comboPrefixes[comboName])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[330]++;
        if (visit339_330_1(groupPrefixUri.isSameOriginAs(packageUri))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[331]++;
          groupPrefixUri.setPath(getCommonPrefix(groupPrefixUri.getPath(), packageUri.getPath()));
        } else {
          _$jscoverage['/loader/combo-loader.js'].lineData[334]++;
          comboName = packageName;
          _$jscoverage['/loader/combo-loader.js'].lineData[335]++;
          comboPrefixes[packageName] = packageUri;
        }
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[338]++;
        comboPrefixes[comboName] = packageUri.clone();
      }
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[341]++;
      comboPrefixes[packageName] = packageUri;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[344]++;
    typedCombos = comboMods[type] = visit340_344_1(comboMods[type] || {});
    _$jscoverage['/loader/combo-loader.js'].lineData[345]++;
    if (visit341_345_1(!(mods = typedCombos[comboName]))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[346]++;
      mods = typedCombos[comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[347]++;
      mods.charset = charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[348]++;
      mods.tags = [tag];
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[350]++;
      if (visit342_350_1(visit343_350_2(mods.tags.length == 1) && visit344_350_3(mods.tags[0] == tag))) {
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[353]++;
        mods.tags.push(tag);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[356]++;
    mods.push(mod);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[359]++;
  return comboMods;
}, 
  getComboUrls: function(modNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[27]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[366]++;
  var runtime = this.runtime, Config = runtime.Config, comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/loader/combo-loader.js'].lineData[373]++;
  var comboPrefixes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[375]++;
  var comboMods = this.getComboMods(modNames, comboPrefixes);
  _$jscoverage['/loader/combo-loader.js'].lineData[377]++;
  var comboRes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[380]++;
  for (var type in comboMods) {
    _$jscoverage['/loader/combo-loader.js'].lineData[381]++;
    comboRes[type] = {};
    _$jscoverage['/loader/combo-loader.js'].lineData[382]++;
    for (var comboName in comboMods[type]) {
      _$jscoverage['/loader/combo-loader.js'].lineData[383]++;
      var currentComboUrls = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[384]++;
      var currentComboMods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[385]++;
      var mods = comboMods[type][comboName];
      _$jscoverage['/loader/combo-loader.js'].lineData[386]++;
      var tags = mods.tags;
      _$jscoverage['/loader/combo-loader.js'].lineData[387]++;
      var tag = visit345_387_1(tags.length > 1) ? getHash(tags.join('')) : tags[0];
      _$jscoverage['/loader/combo-loader.js'].lineData[389]++;
      var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''), suffixLength = suffix.length, basePrefix = comboPrefixes[comboName].toString(), baseLen = basePrefix.length, prefix = basePrefix + comboPrefix, res = comboRes[type][comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[396]++;
      var l = prefix.length;
      _$jscoverage['/loader/combo-loader.js'].lineData[397]++;
      res.charset = mods.charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[398]++;
      res.mods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[400]++;
      function pushComboUrl() {
        _$jscoverage['/loader/combo-loader.js'].functionData[28]++;
        _$jscoverage['/loader/combo-loader.js'].lineData[403]++;
        res.push({
  combine: 1, 
  fullpath: Utils.getMappedPath(runtime, prefix + currentComboUrls.join(comboSep) + suffix, Config.mappedComboRules), 
  mods: currentComboMods});
      }      _$jscoverage['/loader/combo-loader.js'].lineData[412]++;
      for (var i = 0; visit346_412_1(i < mods.length); i++) {
        _$jscoverage['/loader/combo-loader.js'].lineData[413]++;
        var currentMod = mods[i];
        _$jscoverage['/loader/combo-loader.js'].lineData[414]++;
        res.mods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[416]++;
        var fullpath = currentMod.getFullPath();
        _$jscoverage['/loader/combo-loader.js'].lineData[417]++;
        if (visit347_417_1(!currentMod.canBeCombined)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[418]++;
          res.push({
  combine: 0, 
  fullpath: fullpath, 
  mods: [currentMod]});
          _$jscoverage['/loader/combo-loader.js'].lineData[423]++;
          continue;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[426]++;
        var path = fullpath.slice(baseLen).replace(/\?.*$/, '');
        _$jscoverage['/loader/combo-loader.js'].lineData[427]++;
        currentComboUrls.push(path);
        _$jscoverage['/loader/combo-loader.js'].lineData[428]++;
        currentComboMods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[430]++;
        if (visit348_430_1(visit349_430_2(currentComboUrls.length > maxFileNum) || (visit350_431_1(l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[432]++;
          currentComboUrls.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[433]++;
          currentComboMods.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[434]++;
          pushComboUrl();
          _$jscoverage['/loader/combo-loader.js'].lineData[435]++;
          currentComboUrls = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[436]++;
          currentComboMods = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[437]++;
          i--;
        }
      }
      _$jscoverage['/loader/combo-loader.js'].lineData[440]++;
      if (visit351_440_1(currentComboUrls.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[441]++;
        pushComboUrl();
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[445]++;
  return comboRes;
}});
  _$jscoverage['/loader/combo-loader.js'].lineData[449]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
