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
  _$jscoverage['/loader/combo-loader.js'].lineData[7] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[9] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[10] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[14] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[15] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[16] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[20] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[21] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[22] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[25] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[26] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[28] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[29] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[30] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[32] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[35] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[36] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[40] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[41] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[42] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[43] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[45] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[46] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[47] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[48] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[53] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[57] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[67] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[76] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[77] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[83] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[84] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[85] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[87] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[88] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[89] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[90] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[91] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[93] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[95] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[96] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[97] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[100] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[106] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[107] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[108] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[110] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[112] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[118] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[119] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[125] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[126] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[127] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[128] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[129] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[132] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[133] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[140] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[141] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[142] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[144] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[147] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[148] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[149] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[150] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[151] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[152] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[155] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[156] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[161] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[162] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[163] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[164] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[165] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[166] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[167] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[170] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[180] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[181] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[183] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[184] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[187] = 0;
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
  _$jscoverage['/loader/combo-loader.js'].lineData[271] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[279] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[282] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[284] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[285] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[286] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[287] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[289] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[290] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[291] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[292] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[293] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[295] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[296] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[297] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[298] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[299] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[301] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[302] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[304] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[306] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[309] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[312] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[316] = 0;
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
  _$jscoverage['/loader/combo-loader.js'].lineData[336] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[338] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[340] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[343] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[345] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[346] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[347] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[348] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[351] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[352] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[355] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[358] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[361] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[362] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[363] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[364] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[365] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[367] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[370] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[373] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[376] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[385] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[392] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[394] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[396] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[399] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[400] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[401] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[402] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[403] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[404] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[405] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[406] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[408] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[415] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[416] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[417] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[419] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[422] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[431] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[432] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[433] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[435] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[436] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[437] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[442] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[445] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[446] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[447] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[449] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[451] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[452] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[453] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[454] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[455] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[456] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[459] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[460] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[464] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[468] = 0;
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
  _$jscoverage['/loader/combo-loader.js'].branchData['10'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['15'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['26'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['40'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['42'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['45'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['88'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['91'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['106'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['125'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['127'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['132'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['151'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['155'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['165'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['166'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['183'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['211'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['240'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['248'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['279'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['282'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['284'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['286'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['292'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['292'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['292'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['295'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['296'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['297'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['325'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['340'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['340'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['346'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['347'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['361'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['362'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['367'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['367'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['367'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['406'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['431'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['436'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['449'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['449'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['450'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['459'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['459'][1] = new BranchData();
}
_$jscoverage['/loader/combo-loader.js'].branchData['459'][1].init(2808, 23, 'currentComboUrls.length');
function visit343_459_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['450'][1].init(69, 72, 'l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength');
function visit342_450_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['449'][2].init(845, 36, 'currentComboUrls.length > maxFileNum');
function visit341_449_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['449'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['449'][1].init(845, 143, 'currentComboUrls.length > maxFileNum || (l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)');
function visit340_449_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['436'][1].init(249, 25, '!currentMod.canBeCombined');
function visit339_436_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['431'][1].init(1429, 15, 'i < mods.length');
function visit338_431_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['406'][1].init(231, 15, 'tags.length > 1');
function visit337_406_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['367'][3].init(51, 19, 'mods.tags[0] == tag');
function visit336_367_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['367'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['367'][2].init(26, 21, 'mods.tags.length == 1');
function visit335_367_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['367'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['367'][1].init(26, 44, 'mods.tags.length == 1 && mods.tags[0] == tag');
function visit334_367_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['362'][1].init(1830, 32, '!(mods = typedCombos[comboName])');
function visit333_362_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['361'][1].init(1786, 21, 'comboMods[type] || {}');
function visit332_361_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['347'][1].init(30, 41, 'groupPrefixUri.isSameOriginAs(packageUri)');
function visit331_347_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['346'][1].init(188, 41, 'groupPrefixUri = comboPrefixes[comboName]');
function visit330_346_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['340'][2].init(764, 83, 'packageInfo.isCombine() && S.startsWith(fullpath, packagePath)');
function visit329_340_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['340'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['340'][1].init(744, 113, '(mod.canBeCombined = packageInfo.isCombine() && S.startsWith(fullpath, packagePath)) && group');
function visit328_340_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['325'][1].init(348, 5, 'i < l');
function visit327_325_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['297'][1].init(30, 20, 'modStatus != LOADING');
function visit326_297_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['296'][1].init(26, 27, '!waitingModules.contains(m)');
function visit325_296_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['295'][1].init(390, 19, 'modStatus != LOADED');
function visit324_295_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['292'][3].init(293, 22, 'modStatus === ATTACHED');
function visit323_292_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['292'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['292'][2].init(270, 19, 'modStatus === ERROR');
function visit322_292_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['292'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['292'][1].init(270, 45, 'modStatus === ERROR || modStatus === ATTACHED');
function visit321_292_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['286'][1].init(56, 8, 'cache[m]');
function visit320_286_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['284'][1].init(383, 19, 'i < modNames.length');
function visit319_284_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['282'][1].init(343, 11, 'cache || {}');
function visit318_282_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['279'][1].init(238, 9, 'ret || {}');
function visit317_279_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['248'][1].init(153, 7, '!mod.fn');
function visit316_248_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['240'][1].init(26, 9, '\'@DEBUG@\'');
function visit315_240_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['211'][1].init(26, 9, '\'@DEBUG@\'');
function visit314_211_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['183'][1].init(73, 8, '--i > -1');
function visit313_183_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['166'][1].init(18, 19, 'str1[i] !== str2[i]');
function visit312_166_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['165'][1].init(147, 5, 'i < l');
function visit311_165_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['155'][1].init(205, 9, 'ms.length');
function visit310_155_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['151'][1].init(22, 18, 'm.status == LOADED');
function visit309_151_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['132'][1].init(386, 2, 're');
function visit308_132_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['127'][1].init(52, 34, 'script.readyState == \'interactive\'');
function visit307_127_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['125'][1].init(189, 6, 'i >= 0');
function visit306_125_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['106'][1].init(18, 2, 'ie');
function visit305_106_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['91'][1].init(68, 2, 'ie');
function visit304_91_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['88'][1].init(14, 26, 'typeof name === \'function\'');
function visit303_88_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['45'][1].init(167, 2, 'ie');
function visit302_45_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['42'][1].init(57, 22, 'mod.getType() == \'css\'');
function visit301_42_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['40'][1].init(831, 11, '!rs.combine');
function visit300_40_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['26'][1].init(69, 17, 'mod && currentMod');
function visit299_26_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['15'][1].init(18, 10, '!(--count)');
function visit298_15_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['10'][1].init(22, 17, 'rss && rss.length');
function visit297_10_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/combo-loader.js'].functionData[0]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[7]++;
  var ie = S.UA.ie;
  _$jscoverage['/loader/combo-loader.js'].lineData[9]++;
  function loadScripts(runtime, rss, callback, charset, timeout) {
    _$jscoverage['/loader/combo-loader.js'].functionData[1]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[10]++;
    var count = visit297_10_1(rss && rss.length), errorList = [], successList = [];
    _$jscoverage['/loader/combo-loader.js'].lineData[14]++;
    function complete() {
      _$jscoverage['/loader/combo-loader.js'].functionData[2]++;
      _$jscoverage['/loader/combo-loader.js'].lineData[15]++;
      if (visit298_15_1(!(--count))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[16]++;
        callback(successList, errorList);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[20]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[3]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[21]++;
  var mod;
  _$jscoverage['/loader/combo-loader.js'].lineData[22]++;
  var config = {
  timeout: timeout, 
  success: function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[4]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[25]++;
  successList.push(rs);
  _$jscoverage['/loader/combo-loader.js'].lineData[26]++;
  if (visit299_26_1(mod && currentMod)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[28]++;
    logger.debug('standard browser get mod name after load : ' + mod.name);
    _$jscoverage['/loader/combo-loader.js'].lineData[29]++;
    Utils.registerModule(runtime, mod.name, currentMod.fn, currentMod.config);
    _$jscoverage['/loader/combo-loader.js'].lineData[30]++;
    currentMod = undefined;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[32]++;
  complete();
}, 
  error: function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[5]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[35]++;
  errorList.push(rs);
  _$jscoverage['/loader/combo-loader.js'].lineData[36]++;
  complete();
}, 
  charset: charset};
  _$jscoverage['/loader/combo-loader.js'].lineData[40]++;
  if (visit300_40_1(!rs.combine)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[41]++;
    mod = rs.mods[0];
    _$jscoverage['/loader/combo-loader.js'].lineData[42]++;
    if (visit301_42_1(mod.getType() == 'css')) {
      _$jscoverage['/loader/combo-loader.js'].lineData[43]++;
      mod = undefined;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[45]++;
      if (visit302_45_1(ie)) {
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
  S.getScript(rs.fullpath, config);
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[57]++;
  var Loader = S.Loader, logger = S.getLogger('s/loader'), Status = Loader.Status, Utils = Loader.Utils, LOADING = Status.LOADING, LOADED = Status.LOADED, ERROR = Status.ERROR, groupTag = S.now(), ATTACHED = Status.ATTACHED;
  _$jscoverage['/loader/combo-loader.js'].lineData[67]++;
  ComboLoader.groupTag = groupTag;
  _$jscoverage['/loader/combo-loader.js'].lineData[76]++;
  function ComboLoader(runtime, waitingModules) {
    _$jscoverage['/loader/combo-loader.js'].functionData[6]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[77]++;
    S.mix(this, {
  runtime: runtime, 
  waitingModules: waitingModules});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[83]++;
  var currentMod;
  _$jscoverage['/loader/combo-loader.js'].lineData[84]++;
  var startLoadModName;
  _$jscoverage['/loader/combo-loader.js'].lineData[85]++;
  var startLoadModTime;
  _$jscoverage['/loader/combo-loader.js'].lineData[87]++;
  ComboLoader.add = function(name, fn, config, runtime) {
  _$jscoverage['/loader/combo-loader.js'].functionData[7]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[88]++;
  if (visit303_88_1(typeof name === 'function')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[89]++;
    config = fn;
    _$jscoverage['/loader/combo-loader.js'].lineData[90]++;
    fn = name;
    _$jscoverage['/loader/combo-loader.js'].lineData[91]++;
    if (visit304_91_1(ie)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[93]++;
      name = findModuleNameByInteractive();
      _$jscoverage['/loader/combo-loader.js'].lineData[95]++;
      Utils.registerModule(runtime, name, fn, config);
      _$jscoverage['/loader/combo-loader.js'].lineData[96]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[97]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[100]++;
      currentMod = {
  fn: fn, 
  config: config};
    }
  } else {
    _$jscoverage['/loader/combo-loader.js'].lineData[106]++;
    if (visit305_106_1(ie)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[107]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[108]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[110]++;
      currentMod = undefined;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[112]++;
    Utils.registerModule(runtime, name, fn, config);
  }
};
  _$jscoverage['/loader/combo-loader.js'].lineData[118]++;
  function findModuleNameByInteractive() {
    _$jscoverage['/loader/combo-loader.js'].functionData[8]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[119]++;
    var scripts = S.Env.host.document.getElementsByTagName('script'), re, i, name, script;
    _$jscoverage['/loader/combo-loader.js'].lineData[125]++;
    for (i = scripts.length - 1; visit306_125_1(i >= 0); i--) {
      _$jscoverage['/loader/combo-loader.js'].lineData[126]++;
      script = scripts[i];
      _$jscoverage['/loader/combo-loader.js'].lineData[127]++;
      if (visit307_127_1(script.readyState == 'interactive')) {
        _$jscoverage['/loader/combo-loader.js'].lineData[128]++;
        re = script;
        _$jscoverage['/loader/combo-loader.js'].lineData[129]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[132]++;
    if (visit308_132_1(re)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[133]++;
      name = re.getAttribute('data-mod-name');
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[140]++;
      logger.debug('can not find interactive script,time diff : ' + (S.now() - startLoadModTime));
      _$jscoverage['/loader/combo-loader.js'].lineData[141]++;
      logger.debug('old_ie get mod name from cache : ' + startLoadModName);
      _$jscoverage['/loader/combo-loader.js'].lineData[142]++;
      name = startLoadModName;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[144]++;
    return name;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[147]++;
  function debugRemoteModules(rss) {
    _$jscoverage['/loader/combo-loader.js'].functionData[9]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[148]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[10]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[149]++;
  var ms = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[150]++;
  S.each(rs.mods, function(m) {
  _$jscoverage['/loader/combo-loader.js'].functionData[11]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[151]++;
  if (visit309_151_1(m.status == LOADED)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[152]++;
    ms.push(m.name);
  }
});
  _$jscoverage['/loader/combo-loader.js'].lineData[155]++;
  if (visit310_155_1(ms.length)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[156]++;
    logger.info('load remote modules: "' + ms.join(', ') + '" from: "' + rs.fullpath + '"');
  }
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[161]++;
  function getCommonPrefix(str1, str2) {
    _$jscoverage['/loader/combo-loader.js'].functionData[12]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[162]++;
    str1 = str1.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[163]++;
    str2 = str2.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[164]++;
    var l = Math.min(str1.length, str2.length);
    _$jscoverage['/loader/combo-loader.js'].lineData[165]++;
    for (var i = 0; visit311_165_1(i < l); i++) {
      _$jscoverage['/loader/combo-loader.js'].lineData[166]++;
      if (visit312_166_1(str1[i] !== str2[i])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[167]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[170]++;
    return str1.slice(0, i).join('/') + '/';
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[180]++;
  function getHash(str) {
    _$jscoverage['/loader/combo-loader.js'].functionData[13]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[181]++;
    var hash = 5381, i;
    _$jscoverage['/loader/combo-loader.js'].lineData[183]++;
    for (i = str.length; visit313_183_1(--i > -1); ) {
      _$jscoverage['/loader/combo-loader.js'].lineData[184]++;
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[187]++;
    return hash + '';
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
  if (visit314_211_1('@DEBUG@')) {
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
  Utils.registerModule(runtime, mod.getName(), S.noop);
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
  logger.error(msg);
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
  if (visit315_240_1('@DEBUG@')) {
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
  if (visit316_248_1(!mod.fn)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[249]++;
    var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
    _$jscoverage['/loader/combo-loader.js'].lineData[252]++;
    logger.error(msg);
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
  _$jscoverage['/loader/combo-loader.js'].lineData[271]++;
  var i, m, mod, modStatus, self = this, waitingModules = self.waitingModules, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[279]++;
  ret = visit317_279_1(ret || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[282]++;
  cache = visit318_282_1(cache || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[284]++;
  for (i = 0; visit319_284_1(i < modNames.length); i++) {
    _$jscoverage['/loader/combo-loader.js'].lineData[285]++;
    m = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[286]++;
    if (visit320_286_1(cache[m])) {
      _$jscoverage['/loader/combo-loader.js'].lineData[287]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[289]++;
    cache[m] = 1;
    _$jscoverage['/loader/combo-loader.js'].lineData[290]++;
    mod = Utils.createModuleInfo(runtime, m);
    _$jscoverage['/loader/combo-loader.js'].lineData[291]++;
    modStatus = mod.status;
    _$jscoverage['/loader/combo-loader.js'].lineData[292]++;
    if (visit321_292_1(visit322_292_2(modStatus === ERROR) || visit323_292_3(modStatus === ATTACHED))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[293]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[295]++;
    if (visit324_295_1(modStatus != LOADED)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[296]++;
      if (visit325_296_1(!waitingModules.contains(m))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[297]++;
        if (visit326_297_1(modStatus != LOADING)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[298]++;
          mod.status = LOADING;
          _$jscoverage['/loader/combo-loader.js'].lineData[299]++;
          ret[m] = 1;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[301]++;
        mod.wait(function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[26]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[302]++;
  waitingModules.remove(mod.getName());
  _$jscoverage['/loader/combo-loader.js'].lineData[304]++;
  waitingModules.notifyAll();
});
        _$jscoverage['/loader/combo-loader.js'].lineData[306]++;
        waitingModules.add(m);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[309]++;
    self.calculate(mod.getNormalizedRequires(), cache, ret);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[312]++;
  return ret;
}, 
  getComboMods: function(modNames, comboPrefixes) {
  _$jscoverage['/loader/combo-loader.js'].functionData[27]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[316]++;
  var comboMods = {}, packageUri, runtime = this.runtime, i = 0, l = modNames.length, modName, mod, packageInfo, type, typedCombos, mods, tag, charset, packagePath, packageName, group, fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[325]++;
  for (; visit327_325_1(i < l); ++i) {
    _$jscoverage['/loader/combo-loader.js'].lineData[326]++;
    modName = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[327]++;
    mod = Utils.createModuleInfo(runtime, modName);
    _$jscoverage['/loader/combo-loader.js'].lineData[328]++;
    type = mod.getType();
    _$jscoverage['/loader/combo-loader.js'].lineData[329]++;
    fullpath = mod.getFullPath();
    _$jscoverage['/loader/combo-loader.js'].lineData[330]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/loader/combo-loader.js'].lineData[331]++;
    packageName = packageInfo.getName();
    _$jscoverage['/loader/combo-loader.js'].lineData[332]++;
    charset = packageInfo.getCharset();
    _$jscoverage['/loader/combo-loader.js'].lineData[333]++;
    tag = packageInfo.getTag();
    _$jscoverage['/loader/combo-loader.js'].lineData[334]++;
    group = packageInfo.getGroup();
    _$jscoverage['/loader/combo-loader.js'].lineData[335]++;
    packagePath = packageInfo.getPrefixUriForCombo();
    _$jscoverage['/loader/combo-loader.js'].lineData[336]++;
    packageUri = packageInfo.getPackageUri();
    _$jscoverage['/loader/combo-loader.js'].lineData[338]++;
    var comboName = packageName;
    _$jscoverage['/loader/combo-loader.js'].lineData[340]++;
    if (visit328_340_1((mod.canBeCombined = visit329_340_2(packageInfo.isCombine() && S.startsWith(fullpath, packagePath))) && group)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[343]++;
      comboName = group + '_' + charset + '_' + groupTag;
      _$jscoverage['/loader/combo-loader.js'].lineData[345]++;
      var groupPrefixUri;
      _$jscoverage['/loader/combo-loader.js'].lineData[346]++;
      if (visit330_346_1(groupPrefixUri = comboPrefixes[comboName])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[347]++;
        if (visit331_347_1(groupPrefixUri.isSameOriginAs(packageUri))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[348]++;
          groupPrefixUri.setPath(getCommonPrefix(groupPrefixUri.getPath(), packageUri.getPath()));
        } else {
          _$jscoverage['/loader/combo-loader.js'].lineData[351]++;
          comboName = packageName;
          _$jscoverage['/loader/combo-loader.js'].lineData[352]++;
          comboPrefixes[packageName] = packageUri;
        }
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[355]++;
        comboPrefixes[comboName] = packageUri.clone();
      }
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[358]++;
      comboPrefixes[packageName] = packageUri;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[361]++;
    typedCombos = comboMods[type] = visit332_361_1(comboMods[type] || {});
    _$jscoverage['/loader/combo-loader.js'].lineData[362]++;
    if (visit333_362_1(!(mods = typedCombos[comboName]))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[363]++;
      mods = typedCombos[comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[364]++;
      mods.charset = charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[365]++;
      mods.tags = [tag];
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[367]++;
      if (visit334_367_1(visit335_367_2(mods.tags.length == 1) && visit336_367_3(mods.tags[0] == tag))) {
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[370]++;
        mods.tags.push(tag);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[373]++;
    mods.push(mod);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[376]++;
  return comboMods;
}, 
  getComboUrls: function(modNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[28]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[385]++;
  var runtime = this.runtime, Config = runtime.Config, comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/loader/combo-loader.js'].lineData[392]++;
  var comboPrefixes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[394]++;
  var comboMods = this.getComboMods(modNames, comboPrefixes);
  _$jscoverage['/loader/combo-loader.js'].lineData[396]++;
  var comboRes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[399]++;
  for (var type in comboMods) {
    _$jscoverage['/loader/combo-loader.js'].lineData[400]++;
    comboRes[type] = {};
    _$jscoverage['/loader/combo-loader.js'].lineData[401]++;
    for (var comboName in comboMods[type]) {
      _$jscoverage['/loader/combo-loader.js'].lineData[402]++;
      var currentComboUrls = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[403]++;
      var currentComboMods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[404]++;
      var mods = comboMods[type][comboName];
      _$jscoverage['/loader/combo-loader.js'].lineData[405]++;
      var tags = mods.tags;
      _$jscoverage['/loader/combo-loader.js'].lineData[406]++;
      var tag = visit337_406_1(tags.length > 1) ? getHash(tags.join('')) : tags[0];
      _$jscoverage['/loader/combo-loader.js'].lineData[408]++;
      var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''), suffixLength = suffix.length, basePrefix = comboPrefixes[comboName].toString(), baseLen = basePrefix.length, prefix = basePrefix + comboPrefix, res = comboRes[type][comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[415]++;
      var l = prefix.length;
      _$jscoverage['/loader/combo-loader.js'].lineData[416]++;
      res.charset = mods.charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[417]++;
      res.mods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[419]++;
      function pushComboUrl() {
        _$jscoverage['/loader/combo-loader.js'].functionData[29]++;
        _$jscoverage['/loader/combo-loader.js'].lineData[422]++;
        res.push({
  combine: 1, 
  fullpath: Utils.getMappedPath(runtime, prefix + currentComboUrls.join(comboSep) + suffix, Config.mappedComboRules), 
  mods: currentComboMods});
      }      _$jscoverage['/loader/combo-loader.js'].lineData[431]++;
      for (var i = 0; visit338_431_1(i < mods.length); i++) {
        _$jscoverage['/loader/combo-loader.js'].lineData[432]++;
        var currentMod = mods[i];
        _$jscoverage['/loader/combo-loader.js'].lineData[433]++;
        res.mods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[435]++;
        var fullpath = currentMod.getFullPath();
        _$jscoverage['/loader/combo-loader.js'].lineData[436]++;
        if (visit339_436_1(!currentMod.canBeCombined)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[437]++;
          res.push({
  combine: 0, 
  fullpath: fullpath, 
  mods: [currentMod]});
          _$jscoverage['/loader/combo-loader.js'].lineData[442]++;
          continue;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[445]++;
        var path = fullpath.slice(baseLen).replace(/\?.*$/, '');
        _$jscoverage['/loader/combo-loader.js'].lineData[446]++;
        currentComboUrls.push(path);
        _$jscoverage['/loader/combo-loader.js'].lineData[447]++;
        currentComboMods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[449]++;
        if (visit340_449_1(visit341_449_2(currentComboUrls.length > maxFileNum) || (visit342_450_1(l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[451]++;
          currentComboUrls.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[452]++;
          currentComboMods.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[453]++;
          pushComboUrl();
          _$jscoverage['/loader/combo-loader.js'].lineData[454]++;
          currentComboUrls = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[455]++;
          currentComboMods = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[456]++;
          i--;
        }
      }
      _$jscoverage['/loader/combo-loader.js'].lineData[459]++;
      if (visit343_459_1(currentComboUrls.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[460]++;
        pushComboUrl();
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[464]++;
  return comboRes;
}});
  _$jscoverage['/loader/combo-loader.js'].lineData[468]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
