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
  _$jscoverage['/loader/combo-loader.js'].lineData[91] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[92] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[93] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[94] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[95] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[98] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[101] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[102] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[105] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[106] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[107] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[108] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[110] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[112] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[113] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[114] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[117] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[123] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[124] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[125] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[127] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[129] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[130] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[136] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[137] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[143] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[144] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[145] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[146] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[147] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[150] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[151] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[158] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[159] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[160] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[162] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[165] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[166] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[167] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[168] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[169] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[170] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[173] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[174] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[179] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[180] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[181] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[182] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[183] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[184] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[185] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[188] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[191] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[196] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[202] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[204] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[206] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[209] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[210] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[211] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[212] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[215] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[216] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[217] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[219] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[223] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[224] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[225] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[228] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[229] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[231] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[238] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[239] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[240] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[241] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[244] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[245] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[248] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[249] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[252] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[253] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[256] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[267] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[275] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[278] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[280] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[281] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[282] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[283] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[285] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[286] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[287] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[288] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[289] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[291] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[292] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[293] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[294] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[295] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[297] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[298] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[300] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[302] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[305] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[308] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[315] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[324] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[325] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[326] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[327] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[328] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[329] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[330] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[331] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[332] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[333] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[334] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[335] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[337] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[339] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[342] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[344] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[345] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[346] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[347] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[350] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[351] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[354] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[357] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[360] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[361] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[362] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[363] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[364] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[366] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[369] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[372] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[375] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[382] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[389] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[391] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[393] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[396] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[397] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[398] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[399] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[400] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[401] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[402] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[403] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[405] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[412] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[413] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[414] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[416] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[418] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[425] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[426] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[427] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[428] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[429] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[430] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[435] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[438] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[439] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[440] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[442] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[444] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[445] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[446] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[447] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[448] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[449] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[452] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[453] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[457] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[461] = 0;
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
  _$jscoverage['/loader/combo-loader.js'].branchData['91'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['93'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['94'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['102'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['102'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['104'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['108'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['123'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['143'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['145'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['150'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['169'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['173'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['183'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['184'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['211'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['240'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['248'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['275'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['278'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['280'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['282'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['288'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['288'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['288'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['291'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['292'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['293'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['324'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['339'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['339'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['345'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['346'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['360'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['361'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['366'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['366'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['366'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['403'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['425'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['429'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['442'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['442'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['443'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['443'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['452'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['452'][1] = new BranchData();
}
_$jscoverage['/loader/combo-loader.js'].branchData['452'][1].init(2531, 23, 'currentComboUrls.length');
function visit359_452_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['443'][1].init(68, 72, 'l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength');
function visit358_443_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['443'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['442'][2].init(778, 36, 'currentComboUrls.length > maxFileNum');
function visit357_442_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['442'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['442'][1].init(778, 142, 'currentComboUrls.length > maxFileNum || (l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)');
function visit356_442_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['429'][1].init(195, 25, '!currentMod.canBeCombined');
function visit355_429_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['425'][1].init(1229, 15, 'i < mods.length');
function visit354_425_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['403'][1].init(226, 15, 'tags.length > 1');
function visit353_403_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['366'][3].init(50, 19, 'mods.tags[0] == tag');
function visit352_366_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['366'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['366'][2].init(25, 21, 'mods.tags.length == 1');
function visit351_366_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['366'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['366'][1].init(25, 44, 'mods.tags.length == 1 && mods.tags[0] == tag');
function visit350_366_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['361'][1].init(1788, 32, '!(mods = typedCombos[comboName])');
function visit349_361_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['360'][1].init(1745, 21, 'comboMods[type] || {}');
function visit348_360_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['346'][1].init(29, 41, 'groupPrefixUri.isSameOriginAs(packageUri)');
function visit347_346_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['345'][1].init(183, 41, 'groupPrefixUri = comboPrefixes[comboName]');
function visit346_345_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['339'][2].init(744, 82, 'packageInfo.isCombine() && S.startsWith(fullpath, packagePath)');
function visit345_339_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['339'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['339'][1].init(724, 112, '(mod.canBeCombined = packageInfo.isCombine() && S.startsWith(fullpath, packagePath)) && group');
function visit344_339_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['324'][1].init(338, 5, 'i < l');
function visit343_324_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['293'][1].init(29, 20, 'modStatus != LOADING');
function visit342_293_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['292'][1].init(25, 27, '!waitingModules.contains(m)');
function visit341_292_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['291'][1].init(379, 19, 'modStatus != LOADED');
function visit340_291_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['288'][3].init(285, 22, 'modStatus === ATTACHED');
function visit339_288_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['288'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['288'][2].init(262, 19, 'modStatus === ERROR');
function visit338_288_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['288'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['288'][1].init(262, 45, 'modStatus === ERROR || modStatus === ATTACHED');
function visit337_288_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['282'][1].init(54, 8, 'cache[m]');
function visit336_282_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['280'][1].init(369, 19, 'i < modNames.length');
function visit335_280_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['278'][1].init(331, 11, 'cache || {}');
function visit334_278_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['275'][1].init(229, 9, 'ret || {}');
function visit333_275_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['248'][1].init(150, 12, '!mod.factory');
function visit332_248_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['240'][1].init(25, 9, '\'@DEBUG@\'');
function visit331_240_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['211'][1].init(25, 9, '\'@DEBUG@\'');
function visit330_211_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['184'][1].init(17, 19, 'str1[i] !== str2[i]');
function visit329_184_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['183'][1].init(143, 5, 'i < l');
function visit328_183_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['173'][1].init(198, 9, 'ms.length');
function visit327_173_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['169'][1].init(21, 18, 'm.status == LOADED');
function visit326_169_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['150'][1].init(372, 2, 're');
function visit325_150_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['145'][1].init(50, 34, 'script.readyState == \'interactive\'');
function visit324_145_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['143'][1].init(182, 6, 'i >= 0');
function visit323_143_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['123'][1].init(17, 5, 'oldIE');
function visit322_123_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['108'][1].init(132, 5, 'oldIE');
function visit321_108_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['104'][1].init(73, 21, 'arguments.length == 1');
function visit320_104_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['102'][2].init(13, 26, 'typeof name === \'function\'');
function visit319_102_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['102'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['102'][1].init(13, 95, 'typeof name === \'function\' || arguments.length == 1');
function visit318_102_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['94'][1].init(26, 12, 'config || {}');
function visit317_94_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['93'][1].init(78, 15, 'requires.length');
function visit316_93_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['91'][3].init(96, 28, 'typeof factory == \'function\'');
function visit315_91_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['91'][2].init(64, 27, '!config || !config.requires');
function visit314_91_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['91'][1].init(64, 60, '(!config || !config.requires) && typeof factory == \'function\'');
function visit313_91_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['46'][1].init(162, 5, 'oldIE');
function visit312_46_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['43'][1].init(55, 22, 'mod.getType() == \'css\'');
function visit311_43_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['41'][1].init(816, 11, '!rs.combine');
function visit310_41_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['27'][1].init(67, 17, 'mod && currentMod');
function visit309_27_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['16'][1].init(17, 10, '!(--count)');
function visit308_16_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['11'][1].init(21, 17, 'rss && rss.length');
function visit307_11_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['8'][2].init(54, 12, 'S.UA.ie < 10');
function visit306_8_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['8'][1].init(43, 23, 'S.UA.ie && S.UA.ie < 10');
function visit305_8_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/combo-loader.js'].functionData[0]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[8]++;
  var oldIE = visit305_8_1(S.UA.ie && visit306_8_2(S.UA.ie < 10));
  _$jscoverage['/loader/combo-loader.js'].lineData[10]++;
  function loadScripts(runtime, rss, callback, charset, timeout) {
    _$jscoverage['/loader/combo-loader.js'].functionData[1]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[11]++;
    var count = visit307_11_1(rss && rss.length), errorList = [], successList = [];
    _$jscoverage['/loader/combo-loader.js'].lineData[15]++;
    function complete() {
      _$jscoverage['/loader/combo-loader.js'].functionData[2]++;
      _$jscoverage['/loader/combo-loader.js'].lineData[16]++;
      if (visit308_16_1(!(--count))) {
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
  if (visit309_27_1(mod && currentMod)) {
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
  if (visit310_41_1(!rs.combine)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[42]++;
    mod = rs.mods[0];
    _$jscoverage['/loader/combo-loader.js'].lineData[43]++;
    if (visit311_43_1(mod.getType() == 'css')) {
      _$jscoverage['/loader/combo-loader.js'].lineData[44]++;
      mod = undefined;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[46]++;
      if (visit312_46_1(oldIE)) {
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
  function checkKISSYRequire(config, factory) {
    _$jscoverage['/loader/combo-loader.js'].functionData[7]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[91]++;
    if (visit313_91_1((visit314_91_2(!config || !config.requires)) && visit315_91_3(typeof factory == 'function'))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[92]++;
      var requires = Utils.getRequiresFromFn(factory);
      _$jscoverage['/loader/combo-loader.js'].lineData[93]++;
      if (visit316_93_1(requires.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[94]++;
        config = visit317_94_1(config || {});
        _$jscoverage['/loader/combo-loader.js'].lineData[95]++;
        config.requires = requires;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[98]++;
    return config;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[101]++;
  ComboLoader.add = function(name, factory, config, runtime) {
  _$jscoverage['/loader/combo-loader.js'].functionData[8]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[102]++;
  if (visit318_102_1(visit319_102_2(typeof name === 'function') || visit320_104_1(arguments.length == 1))) {
    _$jscoverage['/loader/combo-loader.js'].lineData[105]++;
    config = factory;
    _$jscoverage['/loader/combo-loader.js'].lineData[106]++;
    factory = name;
    _$jscoverage['/loader/combo-loader.js'].lineData[107]++;
    config = checkKISSYRequire(config, factory);
    _$jscoverage['/loader/combo-loader.js'].lineData[108]++;
    if (visit321_108_1(oldIE)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[110]++;
      name = findModuleNameByInteractive();
      _$jscoverage['/loader/combo-loader.js'].lineData[112]++;
      Utils.registerModule(runtime, name, factory, config);
      _$jscoverage['/loader/combo-loader.js'].lineData[113]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[114]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[117]++;
      currentMod = {
  factory: factory, 
  config: config};
    }
  } else {
    _$jscoverage['/loader/combo-loader.js'].lineData[123]++;
    if (visit322_123_1(oldIE)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[124]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[125]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[127]++;
      currentMod = undefined;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[129]++;
    config = checkKISSYRequire(config, factory);
    _$jscoverage['/loader/combo-loader.js'].lineData[130]++;
    Utils.registerModule(runtime, name, factory, config);
  }
};
  _$jscoverage['/loader/combo-loader.js'].lineData[136]++;
  function findModuleNameByInteractive() {
    _$jscoverage['/loader/combo-loader.js'].functionData[9]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[137]++;
    var scripts = S.Env.host.document.getElementsByTagName('script'), re, i, name, script;
    _$jscoverage['/loader/combo-loader.js'].lineData[143]++;
    for (i = scripts.length - 1; visit323_143_1(i >= 0); i--) {
      _$jscoverage['/loader/combo-loader.js'].lineData[144]++;
      script = scripts[i];
      _$jscoverage['/loader/combo-loader.js'].lineData[145]++;
      if (visit324_145_1(script.readyState == 'interactive')) {
        _$jscoverage['/loader/combo-loader.js'].lineData[146]++;
        re = script;
        _$jscoverage['/loader/combo-loader.js'].lineData[147]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[150]++;
    if (visit325_150_1(re)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[151]++;
      name = re.getAttribute('data-mod-name');
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[158]++;
      logger.debug('can not find interactive script,time diff : ' + (S.now() - startLoadModTime));
      _$jscoverage['/loader/combo-loader.js'].lineData[159]++;
      logger.debug('old_ie get mod name from cache : ' + startLoadModName);
      _$jscoverage['/loader/combo-loader.js'].lineData[160]++;
      name = startLoadModName;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[162]++;
    return name;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[165]++;
  function debugRemoteModules(rss) {
    _$jscoverage['/loader/combo-loader.js'].functionData[10]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[166]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[11]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[167]++;
  var ms = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[168]++;
  S.each(rs.mods, function(m) {
  _$jscoverage['/loader/combo-loader.js'].functionData[12]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[169]++;
  if (visit326_169_1(m.status == LOADED)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[170]++;
    ms.push(m.name);
  }
});
  _$jscoverage['/loader/combo-loader.js'].lineData[173]++;
  if (visit327_173_1(ms.length)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[174]++;
    logger.info('load remote modules: "' + ms.join(', ') + '" from: "' + rs.fullpath + '"');
  }
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[179]++;
  function getCommonPrefix(str1, str2) {
    _$jscoverage['/loader/combo-loader.js'].functionData[13]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[180]++;
    str1 = str1.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[181]++;
    str2 = str2.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[182]++;
    var l = Math.min(str1.length, str2.length);
    _$jscoverage['/loader/combo-loader.js'].lineData[183]++;
    for (var i = 0; visit328_183_1(i < l); i++) {
      _$jscoverage['/loader/combo-loader.js'].lineData[184]++;
      if (visit329_184_1(str1[i] !== str2[i])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[185]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[188]++;
    return str1.slice(0, i).join('/') + '/';
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[191]++;
  S.augment(ComboLoader, {
  use: function(normalizedModNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[14]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[196]++;
  var self = this, allModNames, comboUrls, timeout = S.Config.timeout, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[202]++;
  allModNames = S.keys(self.calculate(normalizedModNames));
  _$jscoverage['/loader/combo-loader.js'].lineData[204]++;
  Utils.createModulesInfo(runtime, allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[206]++;
  comboUrls = self.getComboUrls(allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[209]++;
  S.each(comboUrls.css, function(cssOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[15]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[210]++;
  loadScripts(runtime, cssOne, function(success, error) {
  _$jscoverage['/loader/combo-loader.js'].functionData[16]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[211]++;
  if (visit330_211_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[212]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[215]++;
  S.each(success, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[17]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[216]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[18]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[217]++;
  Utils.registerModule(runtime, mod.name, S.noop);
  _$jscoverage['/loader/combo-loader.js'].lineData[219]++;
  mod.notifyAll();
});
});
  _$jscoverage['/loader/combo-loader.js'].lineData[223]++;
  S.each(error, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[19]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[224]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[20]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[225]++;
  var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[228]++;
  S.log(msg, 'error');
  _$jscoverage['/loader/combo-loader.js'].lineData[229]++;
  mod.status = ERROR;
  _$jscoverage['/loader/combo-loader.js'].lineData[231]++;
  mod.notifyAll();
});
});
}, cssOne.charset, timeout);
});
  _$jscoverage['/loader/combo-loader.js'].lineData[238]++;
  S.each(comboUrls['js'], function(jsOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[21]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[239]++;
  loadScripts(runtime, jsOne, function(success) {
  _$jscoverage['/loader/combo-loader.js'].functionData[22]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[240]++;
  if (visit331_240_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[241]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[244]++;
  S.each(jsOne, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[23]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[245]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[24]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[248]++;
  if (visit332_248_1(!mod.factory)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[249]++;
    var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
    _$jscoverage['/loader/combo-loader.js'].lineData[252]++;
    S.log(msg, 'error');
    _$jscoverage['/loader/combo-loader.js'].lineData[253]++;
    mod.status = ERROR;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[256]++;
  mod.notifyAll();
});
});
}, jsOne.charset, timeout);
});
}, 
  calculate: function(modNames, cache, ret) {
  _$jscoverage['/loader/combo-loader.js'].functionData[25]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[267]++;
  var i, m, mod, modStatus, self = this, waitingModules = self.waitingModules, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[275]++;
  ret = visit333_275_1(ret || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[278]++;
  cache = visit334_278_1(cache || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[280]++;
  for (i = 0; visit335_280_1(i < modNames.length); i++) {
    _$jscoverage['/loader/combo-loader.js'].lineData[281]++;
    m = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[282]++;
    if (visit336_282_1(cache[m])) {
      _$jscoverage['/loader/combo-loader.js'].lineData[283]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[285]++;
    cache[m] = 1;
    _$jscoverage['/loader/combo-loader.js'].lineData[286]++;
    mod = Utils.createModuleInfo(runtime, m);
    _$jscoverage['/loader/combo-loader.js'].lineData[287]++;
    modStatus = mod.status;
    _$jscoverage['/loader/combo-loader.js'].lineData[288]++;
    if (visit337_288_1(visit338_288_2(modStatus === ERROR) || visit339_288_3(modStatus === ATTACHED))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[289]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[291]++;
    if (visit340_291_1(modStatus != LOADED)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[292]++;
      if (visit341_292_1(!waitingModules.contains(m))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[293]++;
        if (visit342_293_1(modStatus != LOADING)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[294]++;
          mod.status = LOADING;
          _$jscoverage['/loader/combo-loader.js'].lineData[295]++;
          ret[m] = 1;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[297]++;
        mod.wait(function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[26]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[298]++;
  waitingModules.remove(mod.name);
  _$jscoverage['/loader/combo-loader.js'].lineData[300]++;
  waitingModules.notifyAll();
});
        _$jscoverage['/loader/combo-loader.js'].lineData[302]++;
        waitingModules.add(m);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[305]++;
    self.calculate(mod.getNormalizedRequires(), cache, ret);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[308]++;
  return ret;
}, 
  getComboMods: function(modNames, comboPrefixes) {
  _$jscoverage['/loader/combo-loader.js'].functionData[27]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[315]++;
  var comboMods = {}, packageUri, runtime = this.runtime, i = 0, l = modNames.length, modName, mod, packageInfo, type, typedCombos, mods, tag, charset, packagePath, packageName, group, fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[324]++;
  for (; visit343_324_1(i < l); ++i) {
    _$jscoverage['/loader/combo-loader.js'].lineData[325]++;
    modName = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[326]++;
    mod = Utils.createModuleInfo(runtime, modName);
    _$jscoverage['/loader/combo-loader.js'].lineData[327]++;
    type = mod.getType();
    _$jscoverage['/loader/combo-loader.js'].lineData[328]++;
    fullpath = mod.getFullPath();
    _$jscoverage['/loader/combo-loader.js'].lineData[329]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/loader/combo-loader.js'].lineData[330]++;
    packageName = packageInfo.name;
    _$jscoverage['/loader/combo-loader.js'].lineData[331]++;
    charset = packageInfo.getCharset();
    _$jscoverage['/loader/combo-loader.js'].lineData[332]++;
    tag = packageInfo.getTag();
    _$jscoverage['/loader/combo-loader.js'].lineData[333]++;
    group = packageInfo.getGroup();
    _$jscoverage['/loader/combo-loader.js'].lineData[334]++;
    packagePath = packageInfo.getPrefixUriForCombo();
    _$jscoverage['/loader/combo-loader.js'].lineData[335]++;
    packageUri = packageInfo.getPackageUri();
    _$jscoverage['/loader/combo-loader.js'].lineData[337]++;
    var comboName = packageName;
    _$jscoverage['/loader/combo-loader.js'].lineData[339]++;
    if (visit344_339_1((mod.canBeCombined = visit345_339_2(packageInfo.isCombine() && S.startsWith(fullpath, packagePath))) && group)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[342]++;
      comboName = group + '_' + charset + '_' + groupTag;
      _$jscoverage['/loader/combo-loader.js'].lineData[344]++;
      var groupPrefixUri;
      _$jscoverage['/loader/combo-loader.js'].lineData[345]++;
      if (visit346_345_1(groupPrefixUri = comboPrefixes[comboName])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[346]++;
        if (visit347_346_1(groupPrefixUri.isSameOriginAs(packageUri))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[347]++;
          groupPrefixUri.setPath(getCommonPrefix(groupPrefixUri.getPath(), packageUri.getPath()));
        } else {
          _$jscoverage['/loader/combo-loader.js'].lineData[350]++;
          comboName = packageName;
          _$jscoverage['/loader/combo-loader.js'].lineData[351]++;
          comboPrefixes[packageName] = packageUri;
        }
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[354]++;
        comboPrefixes[comboName] = packageUri.clone();
      }
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[357]++;
      comboPrefixes[packageName] = packageUri;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[360]++;
    typedCombos = comboMods[type] = visit348_360_1(comboMods[type] || {});
    _$jscoverage['/loader/combo-loader.js'].lineData[361]++;
    if (visit349_361_1(!(mods = typedCombos[comboName]))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[362]++;
      mods = typedCombos[comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[363]++;
      mods.charset = charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[364]++;
      mods.tags = [tag];
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[366]++;
      if (visit350_366_1(visit351_366_2(mods.tags.length == 1) && visit352_366_3(mods.tags[0] == tag))) {
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[369]++;
        mods.tags.push(tag);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[372]++;
    mods.push(mod);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[375]++;
  return comboMods;
}, 
  getComboUrls: function(modNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[28]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[382]++;
  var runtime = this.runtime, Config = runtime.Config, comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/loader/combo-loader.js'].lineData[389]++;
  var comboPrefixes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[391]++;
  var comboMods = this.getComboMods(modNames, comboPrefixes);
  _$jscoverage['/loader/combo-loader.js'].lineData[393]++;
  var comboRes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[396]++;
  for (var type in comboMods) {
    _$jscoverage['/loader/combo-loader.js'].lineData[397]++;
    comboRes[type] = {};
    _$jscoverage['/loader/combo-loader.js'].lineData[398]++;
    for (var comboName in comboMods[type]) {
      _$jscoverage['/loader/combo-loader.js'].lineData[399]++;
      var currentComboUrls = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[400]++;
      var currentComboMods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[401]++;
      var mods = comboMods[type][comboName];
      _$jscoverage['/loader/combo-loader.js'].lineData[402]++;
      var tags = mods.tags;
      _$jscoverage['/loader/combo-loader.js'].lineData[403]++;
      var tag = visit353_403_1(tags.length > 1) ? getHash(tags.join('')) : tags[0];
      _$jscoverage['/loader/combo-loader.js'].lineData[405]++;
      var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''), suffixLength = suffix.length, basePrefix = comboPrefixes[comboName].toString(), baseLen = basePrefix.length, prefix = basePrefix + comboPrefix, res = comboRes[type][comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[412]++;
      var l = prefix.length;
      _$jscoverage['/loader/combo-loader.js'].lineData[413]++;
      res.charset = mods.charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[414]++;
      res.mods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[416]++;
      function pushComboUrl() {
        _$jscoverage['/loader/combo-loader.js'].functionData[29]++;
        _$jscoverage['/loader/combo-loader.js'].lineData[418]++;
        res.push({
  combine: 1, 
  fullpath: prefix + currentComboUrls.join(comboSep) + suffix, 
  mods: currentComboMods});
      }      _$jscoverage['/loader/combo-loader.js'].lineData[425]++;
      for (var i = 0; visit354_425_1(i < mods.length); i++) {
        _$jscoverage['/loader/combo-loader.js'].lineData[426]++;
        var currentMod = mods[i];
        _$jscoverage['/loader/combo-loader.js'].lineData[427]++;
        res.mods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[428]++;
        var fullpath = currentMod.getFullPath();
        _$jscoverage['/loader/combo-loader.js'].lineData[429]++;
        if (visit355_429_1(!currentMod.canBeCombined)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[430]++;
          res.push({
  combine: 0, 
  fullpath: fullpath, 
  mods: [currentMod]});
          _$jscoverage['/loader/combo-loader.js'].lineData[435]++;
          continue;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[438]++;
        var path = fullpath.slice(baseLen).replace(/\?.*$/, '');
        _$jscoverage['/loader/combo-loader.js'].lineData[439]++;
        currentComboUrls.push(path);
        _$jscoverage['/loader/combo-loader.js'].lineData[440]++;
        currentComboMods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[442]++;
        if (visit356_442_1(visit357_442_2(currentComboUrls.length > maxFileNum) || (visit358_443_1(l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[444]++;
          currentComboUrls.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[445]++;
          currentComboMods.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[446]++;
          pushComboUrl();
          _$jscoverage['/loader/combo-loader.js'].lineData[447]++;
          currentComboUrls = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[448]++;
          currentComboMods = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[449]++;
          i--;
        }
      }
      _$jscoverage['/loader/combo-loader.js'].lineData[452]++;
      if (visit359_452_1(currentComboUrls.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[453]++;
        pushComboUrl();
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[457]++;
  return comboRes;
}});
  _$jscoverage['/loader/combo-loader.js'].lineData[461]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
