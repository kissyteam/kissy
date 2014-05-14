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
if (! _$jscoverage['/dialog.js']) {
  _$jscoverage['/dialog.js'] = {};
  _$jscoverage['/dialog.js'].lineData = [];
  _$jscoverage['/dialog.js'].lineData[6] = 0;
  _$jscoverage['/dialog.js'].lineData[8] = 0;
  _$jscoverage['/dialog.js'].lineData[9] = 0;
  _$jscoverage['/dialog.js'].lineData[10] = 0;
  _$jscoverage['/dialog.js'].lineData[11] = 0;
  _$jscoverage['/dialog.js'].lineData[12] = 0;
  _$jscoverage['/dialog.js'].lineData[13] = 0;
  _$jscoverage['/dialog.js'].lineData[14] = 0;
  _$jscoverage['/dialog.js'].lineData[15] = 0;
  _$jscoverage['/dialog.js'].lineData[36] = 0;
  _$jscoverage['/dialog.js'].lineData[37] = 0;
  _$jscoverage['/dialog.js'].lineData[38] = 0;
  _$jscoverage['/dialog.js'].lineData[39] = 0;
  _$jscoverage['/dialog.js'].lineData[40] = 0;
  _$jscoverage['/dialog.js'].lineData[41] = 0;
  _$jscoverage['/dialog.js'].lineData[43] = 0;
  _$jscoverage['/dialog.js'].lineData[44] = 0;
  _$jscoverage['/dialog.js'].lineData[46] = 0;
  _$jscoverage['/dialog.js'].lineData[48] = 0;
  _$jscoverage['/dialog.js'].lineData[51] = 0;
  _$jscoverage['/dialog.js'].lineData[52] = 0;
  _$jscoverage['/dialog.js'].lineData[53] = 0;
  _$jscoverage['/dialog.js'].lineData[54] = 0;
  _$jscoverage['/dialog.js'].lineData[55] = 0;
  _$jscoverage['/dialog.js'].lineData[56] = 0;
  _$jscoverage['/dialog.js'].lineData[58] = 0;
  _$jscoverage['/dialog.js'].lineData[59] = 0;
  _$jscoverage['/dialog.js'].lineData[62] = 0;
  _$jscoverage['/dialog.js'].lineData[64] = 0;
  _$jscoverage['/dialog.js'].lineData[65] = 0;
  _$jscoverage['/dialog.js'].lineData[67] = 0;
  _$jscoverage['/dialog.js'].lineData[79] = 0;
  _$jscoverage['/dialog.js'].lineData[84] = 0;
  _$jscoverage['/dialog.js'].lineData[85] = 0;
  _$jscoverage['/dialog.js'].lineData[86] = 0;
  _$jscoverage['/dialog.js'].lineData[90] = 0;
  _$jscoverage['/dialog.js'].lineData[91] = 0;
  _$jscoverage['/dialog.js'].lineData[92] = 0;
  _$jscoverage['/dialog.js'].lineData[93] = 0;
  _$jscoverage['/dialog.js'].lineData[94] = 0;
  _$jscoverage['/dialog.js'].lineData[95] = 0;
  _$jscoverage['/dialog.js'].lineData[103] = 0;
  _$jscoverage['/dialog.js'].lineData[104] = 0;
  _$jscoverage['/dialog.js'].lineData[105] = 0;
  _$jscoverage['/dialog.js'].lineData[106] = 0;
  _$jscoverage['/dialog.js'].lineData[107] = 0;
  _$jscoverage['/dialog.js'].lineData[108] = 0;
  _$jscoverage['/dialog.js'].lineData[109] = 0;
  _$jscoverage['/dialog.js'].lineData[110] = 0;
  _$jscoverage['/dialog.js'].lineData[112] = 0;
  _$jscoverage['/dialog.js'].lineData[113] = 0;
  _$jscoverage['/dialog.js'].lineData[114] = 0;
  _$jscoverage['/dialog.js'].lineData[116] = 0;
  _$jscoverage['/dialog.js'].lineData[118] = 0;
  _$jscoverage['/dialog.js'].lineData[121] = 0;
  _$jscoverage['/dialog.js'].lineData[122] = 0;
  _$jscoverage['/dialog.js'].lineData[123] = 0;
  _$jscoverage['/dialog.js'].lineData[125] = 0;
  _$jscoverage['/dialog.js'].lineData[127] = 0;
  _$jscoverage['/dialog.js'].lineData[130] = 0;
  _$jscoverage['/dialog.js'].lineData[131] = 0;
  _$jscoverage['/dialog.js'].lineData[132] = 0;
  _$jscoverage['/dialog.js'].lineData[135] = 0;
  _$jscoverage['/dialog.js'].lineData[143] = 0;
  _$jscoverage['/dialog.js'].lineData[145] = 0;
  _$jscoverage['/dialog.js'].lineData[146] = 0;
  _$jscoverage['/dialog.js'].lineData[147] = 0;
  _$jscoverage['/dialog.js'].lineData[156] = 0;
  _$jscoverage['/dialog.js'].lineData[159] = 0;
  _$jscoverage['/dialog.js'].lineData[160] = 0;
  _$jscoverage['/dialog.js'].lineData[161] = 0;
  _$jscoverage['/dialog.js'].lineData[165] = 0;
  _$jscoverage['/dialog.js'].lineData[166] = 0;
  _$jscoverage['/dialog.js'].lineData[169] = 0;
  _$jscoverage['/dialog.js'].lineData[170] = 0;
  _$jscoverage['/dialog.js'].lineData[171] = 0;
  _$jscoverage['/dialog.js'].lineData[174] = 0;
  _$jscoverage['/dialog.js'].lineData[175] = 0;
  _$jscoverage['/dialog.js'].lineData[177] = 0;
  _$jscoverage['/dialog.js'].lineData[178] = 0;
  _$jscoverage['/dialog.js'].lineData[179] = 0;
  _$jscoverage['/dialog.js'].lineData[182] = 0;
  _$jscoverage['/dialog.js'].lineData[184] = 0;
  _$jscoverage['/dialog.js'].lineData[185] = 0;
  _$jscoverage['/dialog.js'].lineData[186] = 0;
  _$jscoverage['/dialog.js'].lineData[189] = 0;
  _$jscoverage['/dialog.js'].lineData[192] = 0;
  _$jscoverage['/dialog.js'].lineData[193] = 0;
  _$jscoverage['/dialog.js'].lineData[194] = 0;
  _$jscoverage['/dialog.js'].lineData[197] = 0;
  _$jscoverage['/dialog.js'].lineData[200] = 0;
  _$jscoverage['/dialog.js'].lineData[202] = 0;
  _$jscoverage['/dialog.js'].lineData[209] = 0;
  _$jscoverage['/dialog.js'].lineData[213] = 0;
  _$jscoverage['/dialog.js'].lineData[214] = 0;
  _$jscoverage['/dialog.js'].lineData[215] = 0;
  _$jscoverage['/dialog.js'].lineData[217] = 0;
  _$jscoverage['/dialog.js'].lineData[218] = 0;
  _$jscoverage['/dialog.js'].lineData[220] = 0;
  _$jscoverage['/dialog.js'].lineData[221] = 0;
  _$jscoverage['/dialog.js'].lineData[222] = 0;
  _$jscoverage['/dialog.js'].lineData[224] = 0;
  _$jscoverage['/dialog.js'].lineData[227] = 0;
  _$jscoverage['/dialog.js'].lineData[228] = 0;
  _$jscoverage['/dialog.js'].lineData[232] = 0;
  _$jscoverage['/dialog.js'].lineData[237] = 0;
  _$jscoverage['/dialog.js'].lineData[243] = 0;
  _$jscoverage['/dialog.js'].lineData[244] = 0;
  _$jscoverage['/dialog.js'].lineData[246] = 0;
  _$jscoverage['/dialog.js'].lineData[250] = 0;
  _$jscoverage['/dialog.js'].lineData[251] = 0;
  _$jscoverage['/dialog.js'].lineData[253] = 0;
  _$jscoverage['/dialog.js'].lineData[255] = 0;
  _$jscoverage['/dialog.js'].lineData[258] = 0;
  _$jscoverage['/dialog.js'].lineData[271] = 0;
  _$jscoverage['/dialog.js'].lineData[272] = 0;
  _$jscoverage['/dialog.js'].lineData[274] = 0;
  _$jscoverage['/dialog.js'].lineData[275] = 0;
  _$jscoverage['/dialog.js'].lineData[276] = 0;
  _$jscoverage['/dialog.js'].lineData[277] = 0;
  _$jscoverage['/dialog.js'].lineData[279] = 0;
  _$jscoverage['/dialog.js'].lineData[280] = 0;
  _$jscoverage['/dialog.js'].lineData[282] = 0;
  _$jscoverage['/dialog.js'].lineData[283] = 0;
  _$jscoverage['/dialog.js'].lineData[285] = 0;
  _$jscoverage['/dialog.js'].lineData[288] = 0;
  _$jscoverage['/dialog.js'].lineData[289] = 0;
  _$jscoverage['/dialog.js'].lineData[293] = 0;
  _$jscoverage['/dialog.js'].lineData[296] = 0;
  _$jscoverage['/dialog.js'].lineData[300] = 0;
  _$jscoverage['/dialog.js'].lineData[309] = 0;
  _$jscoverage['/dialog.js'].lineData[310] = 0;
  _$jscoverage['/dialog.js'].lineData[312] = 0;
  _$jscoverage['/dialog.js'].lineData[313] = 0;
  _$jscoverage['/dialog.js'].lineData[315] = 0;
  _$jscoverage['/dialog.js'].lineData[316] = 0;
  _$jscoverage['/dialog.js'].lineData[318] = 0;
  _$jscoverage['/dialog.js'].lineData[319] = 0;
  _$jscoverage['/dialog.js'].lineData[322] = 0;
  _$jscoverage['/dialog.js'].lineData[329] = 0;
  _$jscoverage['/dialog.js'].lineData[330] = 0;
  _$jscoverage['/dialog.js'].lineData[331] = 0;
  _$jscoverage['/dialog.js'].lineData[332] = 0;
  _$jscoverage['/dialog.js'].lineData[339] = 0;
  _$jscoverage['/dialog.js'].lineData[349] = 0;
  _$jscoverage['/dialog.js'].lineData[354] = 0;
  _$jscoverage['/dialog.js'].lineData[355] = 0;
  _$jscoverage['/dialog.js'].lineData[365] = 0;
  _$jscoverage['/dialog.js'].lineData[366] = 0;
  _$jscoverage['/dialog.js'].lineData[367] = 0;
  _$jscoverage['/dialog.js'].lineData[368] = 0;
  _$jscoverage['/dialog.js'].lineData[369] = 0;
  _$jscoverage['/dialog.js'].lineData[370] = 0;
  _$jscoverage['/dialog.js'].lineData[373] = 0;
  _$jscoverage['/dialog.js'].lineData[374] = 0;
  _$jscoverage['/dialog.js'].lineData[377] = 0;
  _$jscoverage['/dialog.js'].lineData[381] = 0;
  _$jscoverage['/dialog.js'].lineData[383] = 0;
  _$jscoverage['/dialog.js'].lineData[384] = 0;
  _$jscoverage['/dialog.js'].lineData[386] = 0;
  _$jscoverage['/dialog.js'].lineData[389] = 0;
  _$jscoverage['/dialog.js'].lineData[390] = 0;
  _$jscoverage['/dialog.js'].lineData[391] = 0;
  _$jscoverage['/dialog.js'].lineData[392] = 0;
  _$jscoverage['/dialog.js'].lineData[395] = 0;
  _$jscoverage['/dialog.js'].lineData[396] = 0;
  _$jscoverage['/dialog.js'].lineData[398] = 0;
  _$jscoverage['/dialog.js'].lineData[399] = 0;
  _$jscoverage['/dialog.js'].lineData[401] = 0;
  _$jscoverage['/dialog.js'].lineData[402] = 0;
  _$jscoverage['/dialog.js'].lineData[408] = 0;
  _$jscoverage['/dialog.js'].lineData[412] = 0;
  _$jscoverage['/dialog.js'].lineData[413] = 0;
  _$jscoverage['/dialog.js'].lineData[414] = 0;
  _$jscoverage['/dialog.js'].lineData[415] = 0;
  _$jscoverage['/dialog.js'].lineData[417] = 0;
  _$jscoverage['/dialog.js'].lineData[418] = 0;
  _$jscoverage['/dialog.js'].lineData[420] = 0;
  _$jscoverage['/dialog.js'].lineData[422] = 0;
  _$jscoverage['/dialog.js'].lineData[423] = 0;
  _$jscoverage['/dialog.js'].lineData[425] = 0;
  _$jscoverage['/dialog.js'].lineData[427] = 0;
  _$jscoverage['/dialog.js'].lineData[428] = 0;
  _$jscoverage['/dialog.js'].lineData[429] = 0;
  _$jscoverage['/dialog.js'].lineData[430] = 0;
  _$jscoverage['/dialog.js'].lineData[431] = 0;
  _$jscoverage['/dialog.js'].lineData[432] = 0;
  _$jscoverage['/dialog.js'].lineData[434] = 0;
  _$jscoverage['/dialog.js'].lineData[435] = 0;
  _$jscoverage['/dialog.js'].lineData[436] = 0;
  _$jscoverage['/dialog.js'].lineData[437] = 0;
  _$jscoverage['/dialog.js'].lineData[438] = 0;
  _$jscoverage['/dialog.js'].lineData[440] = 0;
  _$jscoverage['/dialog.js'].lineData[441] = 0;
  _$jscoverage['/dialog.js'].lineData[442] = 0;
  _$jscoverage['/dialog.js'].lineData[444] = 0;
  _$jscoverage['/dialog.js'].lineData[445] = 0;
  _$jscoverage['/dialog.js'].lineData[447] = 0;
  _$jscoverage['/dialog.js'].lineData[448] = 0;
  _$jscoverage['/dialog.js'].lineData[449] = 0;
  _$jscoverage['/dialog.js'].lineData[450] = 0;
  _$jscoverage['/dialog.js'].lineData[451] = 0;
  _$jscoverage['/dialog.js'].lineData[452] = 0;
  _$jscoverage['/dialog.js'].lineData[453] = 0;
  _$jscoverage['/dialog.js'].lineData[454] = 0;
  _$jscoverage['/dialog.js'].lineData[455] = 0;
  _$jscoverage['/dialog.js'].lineData[457] = 0;
  _$jscoverage['/dialog.js'].lineData[458] = 0;
  _$jscoverage['/dialog.js'].lineData[459] = 0;
  _$jscoverage['/dialog.js'].lineData[461] = 0;
  _$jscoverage['/dialog.js'].lineData[462] = 0;
  _$jscoverage['/dialog.js'].lineData[464] = 0;
  _$jscoverage['/dialog.js'].lineData[465] = 0;
  _$jscoverage['/dialog.js'].lineData[466] = 0;
  _$jscoverage['/dialog.js'].lineData[467] = 0;
  _$jscoverage['/dialog.js'].lineData[470] = 0;
  _$jscoverage['/dialog.js'].lineData[471] = 0;
  _$jscoverage['/dialog.js'].lineData[472] = 0;
  _$jscoverage['/dialog.js'].lineData[473] = 0;
  _$jscoverage['/dialog.js'].lineData[476] = 0;
  _$jscoverage['/dialog.js'].lineData[477] = 0;
  _$jscoverage['/dialog.js'].lineData[478] = 0;
  _$jscoverage['/dialog.js'].lineData[479] = 0;
  _$jscoverage['/dialog.js'].lineData[480] = 0;
  _$jscoverage['/dialog.js'].lineData[482] = 0;
  _$jscoverage['/dialog.js'].lineData[483] = 0;
  _$jscoverage['/dialog.js'].lineData[488] = 0;
}
if (! _$jscoverage['/dialog.js'].functionData) {
  _$jscoverage['/dialog.js'].functionData = [];
  _$jscoverage['/dialog.js'].functionData[0] = 0;
  _$jscoverage['/dialog.js'].functionData[1] = 0;
  _$jscoverage['/dialog.js'].functionData[2] = 0;
  _$jscoverage['/dialog.js'].functionData[3] = 0;
  _$jscoverage['/dialog.js'].functionData[4] = 0;
  _$jscoverage['/dialog.js'].functionData[5] = 0;
  _$jscoverage['/dialog.js'].functionData[6] = 0;
  _$jscoverage['/dialog.js'].functionData[7] = 0;
  _$jscoverage['/dialog.js'].functionData[8] = 0;
  _$jscoverage['/dialog.js'].functionData[9] = 0;
  _$jscoverage['/dialog.js'].functionData[10] = 0;
  _$jscoverage['/dialog.js'].functionData[11] = 0;
  _$jscoverage['/dialog.js'].functionData[12] = 0;
  _$jscoverage['/dialog.js'].functionData[13] = 0;
  _$jscoverage['/dialog.js'].functionData[14] = 0;
  _$jscoverage['/dialog.js'].functionData[15] = 0;
  _$jscoverage['/dialog.js'].functionData[16] = 0;
  _$jscoverage['/dialog.js'].functionData[17] = 0;
  _$jscoverage['/dialog.js'].functionData[18] = 0;
}
if (! _$jscoverage['/dialog.js'].branchData) {
  _$jscoverage['/dialog.js'].branchData = {};
  _$jscoverage['/dialog.js'].branchData['40'] = [];
  _$jscoverage['/dialog.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['43'] = [];
  _$jscoverage['/dialog.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['54'] = [];
  _$jscoverage['/dialog.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['55'] = [];
  _$jscoverage['/dialog.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['56'] = [];
  _$jscoverage['/dialog.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['114'] = [];
  _$jscoverage['/dialog.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['114'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['115'] = [];
  _$jscoverage['/dialog.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['123'] = [];
  _$jscoverage['/dialog.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['123'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['124'] = [];
  _$jscoverage['/dialog.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['146'] = [];
  _$jscoverage['/dialog.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['161'] = [];
  _$jscoverage['/dialog.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['161'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['161'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['162'] = [];
  _$jscoverage['/dialog.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['165'] = [];
  _$jscoverage['/dialog.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['169'] = [];
  _$jscoverage['/dialog.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['174'] = [];
  _$jscoverage['/dialog.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['184'] = [];
  _$jscoverage['/dialog.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['184'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['197'] = [];
  _$jscoverage['/dialog.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['214'] = [];
  _$jscoverage['/dialog.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['217'] = [];
  _$jscoverage['/dialog.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['220'] = [];
  _$jscoverage['/dialog.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['243'] = [];
  _$jscoverage['/dialog.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['250'] = [];
  _$jscoverage['/dialog.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['251'] = [];
  _$jscoverage['/dialog.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['256'] = [];
  _$jscoverage['/dialog.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['269'] = [];
  _$jscoverage['/dialog.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['271'] = [];
  _$jscoverage['/dialog.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['288'] = [];
  _$jscoverage['/dialog.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['309'] = [];
  _$jscoverage['/dialog.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['312'] = [];
  _$jscoverage['/dialog.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['315'] = [];
  _$jscoverage['/dialog.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['318'] = [];
  _$jscoverage['/dialog.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['318'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['329'] = [];
  _$jscoverage['/dialog.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['365'] = [];
  _$jscoverage['/dialog.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['366'] = [];
  _$jscoverage['/dialog.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['367'] = [];
  _$jscoverage['/dialog.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['367'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['367'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['369'] = [];
  _$jscoverage['/dialog.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['369'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['369'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['373'] = [];
  _$jscoverage['/dialog.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['373'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['373'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['381'] = [];
  _$jscoverage['/dialog.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['383'] = [];
  _$jscoverage['/dialog.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['395'] = [];
  _$jscoverage['/dialog.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['398'] = [];
  _$jscoverage['/dialog.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['401'] = [];
  _$jscoverage['/dialog.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['413'] = [];
  _$jscoverage['/dialog.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['413'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['417'] = [];
  _$jscoverage['/dialog.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['422'] = [];
  _$jscoverage['/dialog.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['427'] = [];
  _$jscoverage['/dialog.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['428'] = [];
  _$jscoverage['/dialog.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['436'] = [];
  _$jscoverage['/dialog.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['437'] = [];
  _$jscoverage['/dialog.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['441'] = [];
  _$jscoverage['/dialog.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['444'] = [];
  _$jscoverage['/dialog.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['457'] = [];
  _$jscoverage['/dialog.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['458'] = [];
  _$jscoverage['/dialog.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['459'] = [];
  _$jscoverage['/dialog.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['479'] = [];
  _$jscoverage['/dialog.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['482'] = [];
  _$jscoverage['/dialog.js'].branchData['482'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['482'][1].init(212, 13, 'self.imgAlign');
function visit70_482_1(result) {
  _$jscoverage['/dialog.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['479'][1].init(112, 18, 'self.loadingCancel');
function visit69_479_1(result) {
  _$jscoverage['/dialog.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['459'][1].init(143, 32, 'link.attr(\'target\') === \'_blank\'');
function visit68_459_1(result) {
  _$jscoverage['/dialog.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['458'][1].init(41, 48, 'link.attr(\'_ke_saved_href\') || link.attr(\'href\')');
function visit67_458_1(result) {
  _$jscoverage['/dialog.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['457'][1].init(2233, 4, 'link');
function visit66_457_1(result) {
  _$jscoverage['/dialog.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['444'][1].init(512, 48, 'self.tab.get(\'bar\').get(\'children\').length === 2');
function visit65_444_1(result) {
  _$jscoverage['/dialog.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['441'][1].init(388, 27, 'defaultMargin === undefined');
function visit64_441_1(result) {
  _$jscoverage['/dialog.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['437'][1].init(216, 9, 'inElement');
function visit63_437_1(result) {
  _$jscoverage['/dialog.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['436'][1].init(139, 54, 'editorSelection && editorSelection.getCommonAncestor()');
function visit62_436_1(result) {
  _$jscoverage['/dialog.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['428'][1].init(648, 45, 'parseInt(selectedEl.style(\'margin\'), 10) || 0');
function visit61_428_1(result) {
  _$jscoverage['/dialog.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['427'][1].init(580, 35, 'selectedEl.style(\'float\') || \'none\'');
function visit60_427_1(result) {
  _$jscoverage['/dialog.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['422'][1].init(389, 1, 'w');
function visit59_422_1(result) {
  _$jscoverage['/dialog.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['417'][1].init(219, 1, 'h');
function visit58_417_1(result) {
  _$jscoverage['/dialog.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['413'][2].init(212, 30, 'self.imageCfg.remote !== false');
function visit57_413_2(result) {
  _$jscoverage['/dialog.js'].branchData['413'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['413'][1].init(198, 44, 'selectedEl && self.imageCfg.remote !== false');
function visit56_413_1(result) {
  _$jscoverage['/dialog.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['401'][1].init(1928, 5, '!skip');
function visit55_401_1(result) {
  _$jscoverage['/dialog.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['398'][1].init(1790, 15, 'self.selectedEl');
function visit54_398_1(result) {
  _$jscoverage['/dialog.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['395'][1].init(1692, 2, 'bs');
function visit53_395_1(result) {
  _$jscoverage['/dialog.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['383'][1].init(67, 16, '!self.selectedEl');
function visit52_383_1(result) {
  _$jscoverage['/dialog.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['381'][1].init(1129, 16, '!skip && linkVal');
function visit51_381_1(result) {
  _$jscoverage['/dialog.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['373'][3].init(291, 23, 'next.nodeName() === \'a\'');
function visit50_373_3(result) {
  _$jscoverage['/dialog.js'].branchData['373'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['373'][2].init(291, 56, '(next.nodeName() === \'a\') && !(next[0].childNodes.length)');
function visit49_373_2(result) {
  _$jscoverage['/dialog.js'].branchData['373'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['373'][1].init(268, 79, '(next = img.next()) && (next.nodeName() === \'a\') && !(next[0].childNodes.length)');
function visit48_373_1(result) {
  _$jscoverage['/dialog.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['369'][3].init(105, 23, 'prev.nodeName() === \'a\'');
function visit47_369_3(result) {
  _$jscoverage['/dialog.js'].branchData['369'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['369'][2].init(105, 56, '(prev.nodeName() === \'a\') && !(prev[0].childNodes.length)');
function visit46_369_2(result) {
  _$jscoverage['/dialog.js'].branchData['369'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['369'][1].init(82, 79, '(prev = img.prev()) && (prev.nodeName() === \'a\') && !(prev[0].childNodes.length)');
function visit45_369_1(result) {
  _$jscoverage['/dialog.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['367'][3].init(125, 21, 'linkTarget !== target');
function visit44_367_3(result) {
  _$jscoverage['/dialog.js'].branchData['367'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['367'][2].init(92, 29, 'linkVal !== link.attr(\'href\')');
function visit43_367_2(result) {
  _$jscoverage['/dialog.js'].branchData['367'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['367'][1].init(92, 54, 'linkVal !== link.attr(\'href\') || linkTarget !== target');
function visit42_367_1(result) {
  _$jscoverage['/dialog.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['366'][1].init(35, 30, 'link.attr(\'target\') || \'_self\'');
function visit41_366_1(result) {
  _$jscoverage['/dialog.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['365'][1].init(421, 4, 'link');
function visit40_365_1(result) {
  _$jscoverage['/dialog.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['329'][1].init(1029, 15, 'self.selectedEl');
function visit39_329_1(result) {
  _$jscoverage['/dialog.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['318'][2].init(701, 12, 'margin !== 0');
function visit38_318_2(result) {
  _$jscoverage['/dialog.js'].branchData['318'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['318'][1].init(683, 30, '!isNaN(margin) && margin !== 0');
function visit37_318_1(result) {
  _$jscoverage['/dialog.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['315'][1].init(581, 16, 'align !== \'none\'');
function visit36_315_1(result) {
  _$jscoverage['/dialog.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['312'][1].init(488, 5, 'width');
function visit35_312_1(result) {
  _$jscoverage['/dialog.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['309'][1].init(392, 6, 'height');
function visit34_309_1(result) {
  _$jscoverage['/dialog.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['288'][1].init(1713, 30, 'self.imageCfg.remote === false');
function visit33_288_1(result) {
  _$jscoverage['/dialog.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['271'][1].init(936, 9, 'sizeLimit');
function visit32_271_1(result) {
  _$jscoverage['/dialog.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['269'][1].init(448, 32, 'self.cfg.fileInput || \'Filedata\'');
function visit31_269_1(result) {
  _$jscoverage['/dialog.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['256'][1].init(89, 30, 'self.cfg && self.cfg.sizeLimit');
function visit30_256_1(result) {
  _$jscoverage['/dialog.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['251'][1].init(22, 18, 'self.cfg.extraHTML');
function visit29_251_1(result) {
  _$jscoverage['/dialog.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['250'][1].init(7932, 8, 'self.cfg');
function visit28_250_1(result) {
  _$jscoverage['/dialog.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['243'][1].init(26, 35, '!verifyInputs(content.all(\'input\'))');
function visit27_243_1(result) {
  _$jscoverage['/dialog.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['220'][1].init(517, 10, 'data.error');
function visit26_220_1(result) {
  _$jscoverage['/dialog.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['217'][1].init(382, 5, '!data');
function visit25_217_1(result) {
  _$jscoverage['/dialog.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['214'][1].init(255, 18, 'status === \'abort\'');
function visit24_214_1(result) {
  _$jscoverage['/dialog.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['197'][1].init(1192, 52, 'Editor.Utils.normParams(self.cfg.serverParams) || {}');
function visit23_197_1(result) {
  _$jscoverage['/dialog.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['184'][2].init(749, 25, 'sizeLimit < (size / 1000)');
function visit22_184_2(result) {
  _$jscoverage['/dialog.js'].branchData['184'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['184'][1].init(736, 38, 'sizeLimit && sizeLimit < (size / 1000)');
function visit21_184_1(result) {
  _$jscoverage['/dialog.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['174'][1].init(325, 44, '!self.suffixReg.test(self.imgLocalUrl.val())');
function visit20_174_1(result) {
  _$jscoverage['/dialog.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['169'][1].init(161, 34, 'self.imgLocalUrl.val() === warning');
function visit19_169_1(result) {
  _$jscoverage['/dialog.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['165'][1].init(28, 46, '!verifyInputs(commonSettingTable.all(\'input\'))');
function visit18_165_1(result) {
  _$jscoverage['/dialog.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['162'][1].init(54, 65, 'util.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) === 1');
function visit17_162_1(result) {
  _$jscoverage['/dialog.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['161'][3].init(51, 30, 'self.imageCfg.remote === false');
function visit16_161_3(result) {
  _$jscoverage['/dialog.js'].branchData['161'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['161'][2].init(51, 120, 'self.imageCfg.remote === false || util.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) === 1');
function visit15_161_2(result) {
  _$jscoverage['/dialog.js'].branchData['161'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['161'][1].init(51, 154, '(self.imageCfg.remote === false || util.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) === 1) && self.cfg');
function visit14_161_1(result) {
  _$jscoverage['/dialog.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['146'][1].init(22, 10, 'file.files');
function visit13_146_1(result) {
  _$jscoverage['/dialog.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['124'][1].init(49, 48, 'self.imgRatio[0].disabled || !self.imgRatioValue');
function visit12_124_1(result) {
  _$jscoverage['/dialog.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['123'][2].init(92, 98, '!self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit11_123_2(result) {
  _$jscoverage['/dialog.js'].branchData['123'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['123'][1].init(86, 104, '!v || !self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit10_123_1(result) {
  _$jscoverage['/dialog.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['115'][1].init(49, 48, 'self.imgRatio[0].disabled || !self.imgRatioValue');
function visit9_115_1(result) {
  _$jscoverage['/dialog.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['114'][2].init(93, 98, '!self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit8_114_2(result) {
  _$jscoverage['/dialog.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['114'][1].init(87, 104, '!v || !self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit7_114_1(result) {
  _$jscoverage['/dialog.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['56'][2].init(170, 27, 'self.cfg && self.cfg.suffix');
function visit6_56_2(result) {
  _$jscoverage['/dialog.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['56'][1].init(170, 49, 'self.cfg && self.cfg.suffix || \'png,jpg,jpeg,gif\'');
function visit5_56_1(result) {
  _$jscoverage['/dialog.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['55'][1].init(117, 28, 'self.imageCfg.upload || null');
function visit4_55_1(result) {
  _$jscoverage['/dialog.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['54'][1].init(83, 12, 'config || {}');
function visit3_54_1(result) {
  _$jscoverage['/dialog.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['43'][1].init(135, 41, 'dtd.$block[name] || dtd.$blockLimit[name]');
function visit2_43_1(result) {
  _$jscoverage['/dialog.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['40'][1].init(58, 12, 'name === \'a\'');
function visit1_40_1(result) {
  _$jscoverage['/dialog.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[8]++;
  var util = require('util');
  _$jscoverage['/dialog.js'].lineData[9]++;
  var Editor = require('editor');
  _$jscoverage['/dialog.js'].lineData[10]++;
  var IO = require('io');
  _$jscoverage['/dialog.js'].lineData[11]++;
  var Dialog4E = require('../dialog');
  _$jscoverage['/dialog.js'].lineData[12]++;
  var Tabs = require('tabs');
  _$jscoverage['/dialog.js'].lineData[13]++;
  var MenuButton = require('../menubutton');
  _$jscoverage['/dialog.js'].lineData[14]++;
  var bodyTpl = require('./dialog/dialog-tpl');
  _$jscoverage['/dialog.js'].lineData[15]++;
  var dtd = Editor.XHTML_DTD, UA = require('ua'), Node = require('node'), HTTP_TIP = 'http://', AUTOMATIC_TIP = '\u81ea\u52a8', MARGIN_DEFAULT = 10, IMAGE_DIALOG_BODY_HTML = bodyTpl, IMAGE_DIALOG_FOOT_HTML = '<div style="padding:5px 20px 20px;">' + '<a ' + 'href="javascript:void(\'\u786e\u5b9a\')" ' + 'class="{prefixCls}img-insert {prefixCls}button ks-inline-block" ' + 'style="margin-right:30px;">\u786e\u5b9a</a> ' + '<a  ' + 'href="javascript:void(\'\u53d6\u6d88\')" ' + 'class="{prefixCls}img-cancel {prefixCls}button ks-inline-block">\u53d6\u6d88</a></div>', warning = '\u8bf7\u70b9\u51fb\u6d4f\u89c8\u4e0a\u4f20\u56fe\u7247', valInput = Editor.Utils.valInput;
  _$jscoverage['/dialog.js'].lineData[36]++;
  function findAWithImg(img) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[37]++;
    var ret = img;
    _$jscoverage['/dialog.js'].lineData[38]++;
    while (ret) {
      _$jscoverage['/dialog.js'].lineData[39]++;
      var name = ret.nodeName();
      _$jscoverage['/dialog.js'].lineData[40]++;
      if (visit1_40_1(name === 'a')) {
        _$jscoverage['/dialog.js'].lineData[41]++;
        return ret;
      }
      _$jscoverage['/dialog.js'].lineData[43]++;
      if (visit2_43_1(dtd.$block[name] || dtd.$blockLimit[name])) {
        _$jscoverage['/dialog.js'].lineData[44]++;
        return null;
      }
      _$jscoverage['/dialog.js'].lineData[46]++;
      ret = ret.parent();
    }
    _$jscoverage['/dialog.js'].lineData[48]++;
    return null;
  }
  _$jscoverage['/dialog.js'].lineData[51]++;
  function ImageDialog(editor, config) {
    _$jscoverage['/dialog.js'].functionData[2]++;
    _$jscoverage['/dialog.js'].lineData[52]++;
    var self = this;
    _$jscoverage['/dialog.js'].lineData[53]++;
    self.editor = editor;
    _$jscoverage['/dialog.js'].lineData[54]++;
    self.imageCfg = visit3_54_1(config || {});
    _$jscoverage['/dialog.js'].lineData[55]++;
    self.cfg = visit4_55_1(self.imageCfg.upload || null);
    _$jscoverage['/dialog.js'].lineData[56]++;
    self.suffix = visit5_56_1(visit6_56_2(self.cfg && self.cfg.suffix) || 'png,jpg,jpeg,gif');
    _$jscoverage['/dialog.js'].lineData[58]++;
    self.suffixReg = new RegExp(self.suffix.split(/,/).join('|') + '$', 'i');
    _$jscoverage['/dialog.js'].lineData[59]++;
    self.suffixWarning = '\u53ea\u5141\u8bb8\u540e\u7f00\u540d\u4e3a' + self.suffix + '\u7684\u56fe\u7247';
  }
  _$jscoverage['/dialog.js'].lineData[62]++;
  (ImageDialog.prototype = {
  _prepare: function() {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[64]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[65]++;
  var editor = self.editor, prefixCls = editor.get('prefixCls') + 'editor-';
  _$jscoverage['/dialog.js'].lineData[67]++;
  self.dialog = self.d = new Dialog4E({
  width: 500, 
  headerContent: '\u56fe\u7247', 
  bodyContent: util.substitute(IMAGE_DIALOG_BODY_HTML, {
  prefixCls: prefixCls}), 
  footerContent: util.substitute(IMAGE_DIALOG_FOOT_HTML, {
  prefixCls: prefixCls}), 
  mask: true}).render();
  _$jscoverage['/dialog.js'].lineData[79]++;
  var content = self.d.get('el'), cancel = content.one('.' + prefixCls + 'img-cancel'), ok = content.one('.' + prefixCls + 'img-insert'), verifyInputs = Editor.Utils.verifyInputs, commonSettingTable = content.one('.' + prefixCls + 'img-setting');
  _$jscoverage['/dialog.js'].lineData[84]++;
  self.uploadForm = content.one('.' + prefixCls + 'img-upload-form');
  _$jscoverage['/dialog.js'].lineData[85]++;
  self.imgLocalUrl = content.one('.' + prefixCls + 'img-local-url');
  _$jscoverage['/dialog.js'].lineData[86]++;
  self.tab = new Tabs({
  'srcNode': self.d.get('body').one('.' + prefixCls + 'img-tabs'), 
  prefixCls: prefixCls + 'img-'}).render();
  _$jscoverage['/dialog.js'].lineData[90]++;
  self.imgLocalUrl.val(warning);
  _$jscoverage['/dialog.js'].lineData[91]++;
  self.imgUrl = content.one('.' + prefixCls + 'img-url');
  _$jscoverage['/dialog.js'].lineData[92]++;
  self.imgHeight = content.one('.' + prefixCls + 'img-height');
  _$jscoverage['/dialog.js'].lineData[93]++;
  self.imgWidth = content.one('.' + prefixCls + 'img-width');
  _$jscoverage['/dialog.js'].lineData[94]++;
  self.imgRatio = content.one('.' + prefixCls + 'img-ratio');
  _$jscoverage['/dialog.js'].lineData[95]++;
  self.imgAlign = MenuButton.Select.decorate(content.one('.' + prefixCls + 'img-align'), {
  prefixCls: prefixCls + 'big-', 
  width: 80, 
  menuCfg: {
  prefixCls: prefixCls + '', 
  render: content}});
  _$jscoverage['/dialog.js'].lineData[103]++;
  self.imgMargin = content.one('.' + prefixCls + 'img-margin');
  _$jscoverage['/dialog.js'].lineData[104]++;
  self.imgLink = content.one('.' + prefixCls + 'img-link');
  _$jscoverage['/dialog.js'].lineData[105]++;
  self.imgLinkBlank = content.one('.' + prefixCls + 'img-link-blank');
  _$jscoverage['/dialog.js'].lineData[106]++;
  var placeholder = Editor.Utils.placeholder;
  _$jscoverage['/dialog.js'].lineData[107]++;
  placeholder(self.imgUrl, HTTP_TIP);
  _$jscoverage['/dialog.js'].lineData[108]++;
  placeholder(self.imgHeight, AUTOMATIC_TIP);
  _$jscoverage['/dialog.js'].lineData[109]++;
  placeholder(self.imgWidth, AUTOMATIC_TIP);
  _$jscoverage['/dialog.js'].lineData[110]++;
  placeholder(self.imgLink, 'http://');
  _$jscoverage['/dialog.js'].lineData[112]++;
  self.imgHeight.on('keyup', function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[113]++;
  var v = parseInt(valInput(self.imgHeight), 10);
  _$jscoverage['/dialog.js'].lineData[114]++;
  if (visit7_114_1(!v || visit8_114_2(!self.imgRatio[0].checked || visit9_115_1(self.imgRatio[0].disabled || !self.imgRatioValue)))) {
    _$jscoverage['/dialog.js'].lineData[116]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[118]++;
  valInput(self.imgWidth, Math.floor(v * self.imgRatioValue));
});
  _$jscoverage['/dialog.js'].lineData[121]++;
  self.imgWidth.on('keyup', function() {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[122]++;
  var v = parseInt(valInput(self.imgWidth), 10);
  _$jscoverage['/dialog.js'].lineData[123]++;
  if (visit10_123_1(!v || visit11_123_2(!self.imgRatio[0].checked || visit12_124_1(self.imgRatio[0].disabled || !self.imgRatioValue)))) {
    _$jscoverage['/dialog.js'].lineData[125]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[127]++;
  valInput(self.imgHeight, Math.floor(v / self.imgRatioValue));
});
  _$jscoverage['/dialog.js'].lineData[130]++;
  cancel.on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[131]++;
  self.d.hide();
  _$jscoverage['/dialog.js'].lineData[132]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[135]++;
  var loadingCancel = new Node('<a class="' + prefixCls + 'button ks-inline-block" ' + 'style="position:absolute;' + 'z-index:' + Editor.baseZIndex(Editor.ZIndexManager.LOADING_CANCEL) + ';' + 'left:-9999px;' + 'top:-9999px;' + '">\u53d6\u6d88\u4e0a\u4f20</a>').appendTo(document.body, undefined);
  _$jscoverage['/dialog.js'].lineData[143]++;
  self.loadingCancel = loadingCancel;
  _$jscoverage['/dialog.js'].lineData[145]++;
  function getFileSize(file) {
    _$jscoverage['/dialog.js'].functionData[7]++;
    _$jscoverage['/dialog.js'].lineData[146]++;
    if (visit13_146_1(file.files)) {
      _$jscoverage['/dialog.js'].lineData[147]++;
      return file.files[0].size;
    }
    _$jscoverage['/dialog.js'].lineData[156]++;
    return 0;
  }
  _$jscoverage['/dialog.js'].lineData[159]++;
  ok.on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[160]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[161]++;
  if (visit14_161_1((visit15_161_2(visit16_161_3(self.imageCfg.remote === false) || visit17_162_1(util.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) === 1))) && self.cfg)) {
    _$jscoverage['/dialog.js'].lineData[165]++;
    if (visit18_165_1(!verifyInputs(commonSettingTable.all('input')))) {
      _$jscoverage['/dialog.js'].lineData[166]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[169]++;
    if (visit19_169_1(self.imgLocalUrl.val() === warning)) {
      _$jscoverage['/dialog.js'].lineData[170]++;
      alert('\u8bf7\u5148\u9009\u62e9\u6587\u4ef6!');
      _$jscoverage['/dialog.js'].lineData[171]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[174]++;
    if (visit20_174_1(!self.suffixReg.test(self.imgLocalUrl.val()))) {
      _$jscoverage['/dialog.js'].lineData[175]++;
      alert(self.suffixWarning);
      _$jscoverage['/dialog.js'].lineData[177]++;
      self.uploadForm[0].reset();
      _$jscoverage['/dialog.js'].lineData[178]++;
      self.imgLocalUrl.val(warning);
      _$jscoverage['/dialog.js'].lineData[179]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[182]++;
    var size = (getFileSize(self.fileInput[0]));
    _$jscoverage['/dialog.js'].lineData[184]++;
    if (visit21_184_1(sizeLimit && visit22_184_2(sizeLimit < (size / 1000)))) {
      _$jscoverage['/dialog.js'].lineData[185]++;
      alert('\u4e0a\u4f20\u56fe\u7247\u6700\u5927\uff1a' + sizeLimit / 1000 + 'M');
      _$jscoverage['/dialog.js'].lineData[186]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[189]++;
    self.d.loading();
    _$jscoverage['/dialog.js'].lineData[192]++;
    loadingCancel.on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[9]++;
  _$jscoverage['/dialog.js'].lineData[193]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[194]++;
  uploadIO.abort();
});
    _$jscoverage['/dialog.js'].lineData[197]++;
    var serverParams = visit23_197_1(Editor.Utils.normParams(self.cfg.serverParams) || {});
    _$jscoverage['/dialog.js'].lineData[200]++;
    serverParams['document-domain'] = document.domain;
    _$jscoverage['/dialog.js'].lineData[202]++;
    var uploadIO = IO({
  data: serverParams, 
  url: self.cfg.serverUrl, 
  form: self.uploadForm[0], 
  dataType: 'json', 
  type: 'post', 
  complete: function(data, status) {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[209]++;
  loadingCancel.css({
  left: -9999, 
  top: -9999});
  _$jscoverage['/dialog.js'].lineData[213]++;
  self.d.unloading();
  _$jscoverage['/dialog.js'].lineData[214]++;
  if (visit24_214_1(status === 'abort')) {
    _$jscoverage['/dialog.js'].lineData[215]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[217]++;
  if (visit25_217_1(!data)) {
    _$jscoverage['/dialog.js'].lineData[218]++;
    data = {
  error: '\u670d\u52a1\u5668\u51fa\u9519\uff0c\u8bf7\u91cd\u8bd5'};
  }
  _$jscoverage['/dialog.js'].lineData[220]++;
  if (visit26_220_1(data.error)) {
    _$jscoverage['/dialog.js'].lineData[221]++;
    alert(data.error);
    _$jscoverage['/dialog.js'].lineData[222]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[224]++;
  valInput(self.imgUrl, data.imgUrl);
  _$jscoverage['/dialog.js'].lineData[227]++;
  new Image().src = data.imgUrl;
  _$jscoverage['/dialog.js'].lineData[228]++;
  self._insert();
}});
    _$jscoverage['/dialog.js'].lineData[232]++;
    var loadingMaskEl = self.d.get('el'), offset = loadingMaskEl.offset(), width = loadingMaskEl[0].offsetWidth, height = loadingMaskEl[0].offsetHeight;
    _$jscoverage['/dialog.js'].lineData[237]++;
    loadingCancel.css({
  left: (offset.left + width / 2.5), 
  top: (offset.top + height / 1.5)});
  } else {
    _$jscoverage['/dialog.js'].lineData[243]++;
    if (visit27_243_1(!verifyInputs(content.all('input')))) {
      _$jscoverage['/dialog.js'].lineData[244]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[246]++;
    self._insert();
  }
});
  _$jscoverage['/dialog.js'].lineData[250]++;
  if (visit28_250_1(self.cfg)) {
    _$jscoverage['/dialog.js'].lineData[251]++;
    if (visit29_251_1(self.cfg.extraHTML)) {
      _$jscoverage['/dialog.js'].lineData[253]++;
      content.one('.' + prefixCls + 'img-up-extraHTML').html(self.cfg.extraHTML);
    }
    _$jscoverage['/dialog.js'].lineData[255]++;
    var imageUp = content.one('.' + prefixCls + 'image-up'), sizeLimit = visit30_256_1(self.cfg && self.cfg.sizeLimit);
    _$jscoverage['/dialog.js'].lineData[258]++;
    self.fileInput = new Node('<input ' + 'type="file" ' + 'style="position:absolute;' + 'cursor:pointer;' + 'left:' + (UA.ie ? '360' : (UA.chrome ? '319' : '369')) + 'px;' + 'z-index:2;' + 'top:0px;' + 'height:26px;" ' + 'size="1" ' + 'name="' + (visit31_269_1(self.cfg.fileInput || 'Filedata')) + '"/>').insertAfter(self.imgLocalUrl);
    _$jscoverage['/dialog.js'].lineData[271]++;
    if (visit32_271_1(sizeLimit)) {
      _$jscoverage['/dialog.js'].lineData[272]++;
      warning = '\u5355\u5f20\u56fe\u7247\u5bb9\u91cf\u4e0d\u8d85\u8fc7 ' + (sizeLimit / 1000) + ' M';
    }
    _$jscoverage['/dialog.js'].lineData[274]++;
    self.imgLocalUrl.val(warning);
    _$jscoverage['/dialog.js'].lineData[275]++;
    self.fileInput.css('opacity', 0);
    _$jscoverage['/dialog.js'].lineData[276]++;
    self.fileInput.on('mouseenter', function() {
  _$jscoverage['/dialog.js'].functionData[11]++;
  _$jscoverage['/dialog.js'].lineData[277]++;
  imageUp.addClass('' + prefixCls + 'button-hover');
});
    _$jscoverage['/dialog.js'].lineData[279]++;
    self.fileInput.on('mouseleave', function() {
  _$jscoverage['/dialog.js'].functionData[12]++;
  _$jscoverage['/dialog.js'].lineData[280]++;
  imageUp.removeClass('' + prefixCls + 'button-hover');
});
    _$jscoverage['/dialog.js'].lineData[282]++;
    self.fileInput.on('change', function() {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[283]++;
  var file = self.fileInput.val();
  _$jscoverage['/dialog.js'].lineData[285]++;
  self.imgLocalUrl.val(file.replace(/.+[\/\\]/, ''));
});
    _$jscoverage['/dialog.js'].lineData[288]++;
    if (visit33_288_1(self.imageCfg.remote === false)) {
      _$jscoverage['/dialog.js'].lineData[289]++;
      self.tab.removeItemAt(0, 1);
    }
  } else {
    _$jscoverage['/dialog.js'].lineData[293]++;
    self.tab.removeItemAt(1, 1);
  }
  _$jscoverage['/dialog.js'].lineData[296]++;
  self._prepare = util.noop;
}, 
  _insert: function() {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[300]++;
  var self = this, url = valInput(self.imgUrl), img, height = parseInt(valInput(self.imgHeight), 10), width = parseInt(valInput(self.imgWidth), 10), align = self.imgAlign.get('value'), margin = parseInt(self.imgMargin.val(), 10), style = '';
  _$jscoverage['/dialog.js'].lineData[309]++;
  if (visit34_309_1(height)) {
    _$jscoverage['/dialog.js'].lineData[310]++;
    style += 'height:' + height + 'px;';
  }
  _$jscoverage['/dialog.js'].lineData[312]++;
  if (visit35_312_1(width)) {
    _$jscoverage['/dialog.js'].lineData[313]++;
    style += 'width:' + width + 'px;';
  }
  _$jscoverage['/dialog.js'].lineData[315]++;
  if (visit36_315_1(align !== 'none')) {
    _$jscoverage['/dialog.js'].lineData[316]++;
    style += 'float:' + align + ';';
  }
  _$jscoverage['/dialog.js'].lineData[318]++;
  if (visit37_318_1(!isNaN(margin) && visit38_318_2(margin !== 0))) {
    _$jscoverage['/dialog.js'].lineData[319]++;
    style += 'margin:' + margin + 'px;';
  }
  _$jscoverage['/dialog.js'].lineData[322]++;
  self.d.hide();
  _$jscoverage['/dialog.js'].lineData[329]++;
  if (visit39_329_1(self.selectedEl)) {
    _$jscoverage['/dialog.js'].lineData[330]++;
    img = self.selectedEl;
    _$jscoverage['/dialog.js'].lineData[331]++;
    self.editor.execCommand('save');
    _$jscoverage['/dialog.js'].lineData[332]++;
    self.selectedEl.attr({
  'src': url, 
  '_ke_saved_src': url, 
  'style': style});
  } else {
    _$jscoverage['/dialog.js'].lineData[339]++;
    img = new Node('<img ' + (style ? ('style="' + style + '"') : '') + ' src="' + url + '" ' + '_ke_saved_src="' + url + '" alt="" />', null, self.editor.get('document')[0]);
    _$jscoverage['/dialog.js'].lineData[349]++;
    self.editor.insertElement(img);
  }
  _$jscoverage['/dialog.js'].lineData[354]++;
  setTimeout(function() {
  _$jscoverage['/dialog.js'].functionData[15]++;
  _$jscoverage['/dialog.js'].lineData[355]++;
  var link = findAWithImg(img), linkVal = util.trim(valInput(self.imgLink)), sel = self.editor.getSelection(), target = self.imgLinkBlank.attr('checked') ? '_blank' : '_self', linkTarget, skip = 0, prev, next, bs;
  _$jscoverage['/dialog.js'].lineData[365]++;
  if (visit40_365_1(link)) {
    _$jscoverage['/dialog.js'].lineData[366]++;
    linkTarget = visit41_366_1(link.attr('target') || '_self');
    _$jscoverage['/dialog.js'].lineData[367]++;
    if (visit42_367_1(visit43_367_2(linkVal !== link.attr('href')) || visit44_367_3(linkTarget !== target))) {
      _$jscoverage['/dialog.js'].lineData[368]++;
      img._4eBreakParent(link);
      _$jscoverage['/dialog.js'].lineData[369]++;
      if (visit45_369_1((prev = img.prev()) && visit46_369_2((visit47_369_3(prev.nodeName() === 'a')) && !(prev[0].childNodes.length)))) {
        _$jscoverage['/dialog.js'].lineData[370]++;
        prev.remove();
      }
      _$jscoverage['/dialog.js'].lineData[373]++;
      if (visit48_373_1((next = img.next()) && visit49_373_2((visit50_373_3(next.nodeName() === 'a')) && !(next[0].childNodes.length)))) {
        _$jscoverage['/dialog.js'].lineData[374]++;
        next.remove();
      }
    } else {
      _$jscoverage['/dialog.js'].lineData[377]++;
      skip = 1;
    }
  }
  _$jscoverage['/dialog.js'].lineData[381]++;
  if (visit51_381_1(!skip && linkVal)) {
    _$jscoverage['/dialog.js'].lineData[383]++;
    if (visit52_383_1(!self.selectedEl)) {
      _$jscoverage['/dialog.js'].lineData[384]++;
      bs = sel.createBookmarks();
    }
    _$jscoverage['/dialog.js'].lineData[386]++;
    link = new Node('<a></a>');
    _$jscoverage['/dialog.js'].lineData[389]++;
    link.attr('_ke_saved_href', linkVal).attr('href', linkVal).attr('target', target);
    _$jscoverage['/dialog.js'].lineData[390]++;
    var t = img[0];
    _$jscoverage['/dialog.js'].lineData[391]++;
    t.parentNode.replaceChild(link[0], t);
    _$jscoverage['/dialog.js'].lineData[392]++;
    link.append(t);
  }
  _$jscoverage['/dialog.js'].lineData[395]++;
  if (visit53_395_1(bs)) {
    _$jscoverage['/dialog.js'].lineData[396]++;
    sel.selectBookmarks(bs);
  } else {
    _$jscoverage['/dialog.js'].lineData[398]++;
    if (visit54_398_1(self.selectedEl)) {
      _$jscoverage['/dialog.js'].lineData[399]++;
      self.editor.getSelection().selectElement(self.selectedEl);
    }
  }
  _$jscoverage['/dialog.js'].lineData[401]++;
  if (visit55_401_1(!skip)) {
    _$jscoverage['/dialog.js'].lineData[402]++;
    self.editor.execCommand('save');
  }
}, 100);
}, 
  _update: function(selectedEl) {
  _$jscoverage['/dialog.js'].functionData[16]++;
  _$jscoverage['/dialog.js'].lineData[408]++;
  var self = this, active = 0, link, resetInput = Editor.Utils.resetInput;
  _$jscoverage['/dialog.js'].lineData[412]++;
  self.selectedEl = selectedEl;
  _$jscoverage['/dialog.js'].lineData[413]++;
  if (visit56_413_1(selectedEl && visit57_413_2(self.imageCfg.remote !== false))) {
    _$jscoverage['/dialog.js'].lineData[414]++;
    valInput(self.imgUrl, selectedEl.attr('src'));
    _$jscoverage['/dialog.js'].lineData[415]++;
    var w = parseInt(selectedEl.style('width'), 10), h = parseInt(selectedEl.style('height'), 10);
    _$jscoverage['/dialog.js'].lineData[417]++;
    if (visit58_417_1(h)) {
      _$jscoverage['/dialog.js'].lineData[418]++;
      valInput(self.imgHeight, h);
    } else {
      _$jscoverage['/dialog.js'].lineData[420]++;
      resetInput(self.imgHeight);
    }
    _$jscoverage['/dialog.js'].lineData[422]++;
    if (visit59_422_1(w)) {
      _$jscoverage['/dialog.js'].lineData[423]++;
      valInput(self.imgWidth, w);
    } else {
      _$jscoverage['/dialog.js'].lineData[425]++;
      resetInput(self.imgWidth);
    }
    _$jscoverage['/dialog.js'].lineData[427]++;
    self.imgAlign.set('value', visit60_427_1(selectedEl.style('float') || 'none'));
    _$jscoverage['/dialog.js'].lineData[428]++;
    var margin = visit61_428_1(parseInt(selectedEl.style('margin'), 10) || 0);
    _$jscoverage['/dialog.js'].lineData[429]++;
    self.imgMargin.val(margin);
    _$jscoverage['/dialog.js'].lineData[430]++;
    self.imgRatio[0].disabled = false;
    _$jscoverage['/dialog.js'].lineData[431]++;
    self.imgRatioValue = w / h;
    _$jscoverage['/dialog.js'].lineData[432]++;
    link = findAWithImg(selectedEl);
  } else {
    _$jscoverage['/dialog.js'].lineData[434]++;
    var editor = self.editor;
    _$jscoverage['/dialog.js'].lineData[435]++;
    var editorSelection = editor.getSelection();
    _$jscoverage['/dialog.js'].lineData[436]++;
    var inElement = visit62_436_1(editorSelection && editorSelection.getCommonAncestor());
    _$jscoverage['/dialog.js'].lineData[437]++;
    if (visit63_437_1(inElement)) {
      _$jscoverage['/dialog.js'].lineData[438]++;
      link = findAWithImg(inElement);
    }
    _$jscoverage['/dialog.js'].lineData[440]++;
    var defaultMargin = self.imageCfg.defaultMargin;
    _$jscoverage['/dialog.js'].lineData[441]++;
    if (visit64_441_1(defaultMargin === undefined)) {
      _$jscoverage['/dialog.js'].lineData[442]++;
      defaultMargin = MARGIN_DEFAULT;
    }
    _$jscoverage['/dialog.js'].lineData[444]++;
    if (visit65_444_1(self.tab.get('bar').get('children').length === 2)) {
      _$jscoverage['/dialog.js'].lineData[445]++;
      active = 1;
    }
    _$jscoverage['/dialog.js'].lineData[447]++;
    self.imgLinkBlank.attr('checked', true);
    _$jscoverage['/dialog.js'].lineData[448]++;
    resetInput(self.imgUrl);
    _$jscoverage['/dialog.js'].lineData[449]++;
    resetInput(self.imgLink);
    _$jscoverage['/dialog.js'].lineData[450]++;
    resetInput(self.imgHeight);
    _$jscoverage['/dialog.js'].lineData[451]++;
    resetInput(self.imgWidth);
    _$jscoverage['/dialog.js'].lineData[452]++;
    self.imgAlign.set('value', 'none');
    _$jscoverage['/dialog.js'].lineData[453]++;
    self.imgMargin.val(defaultMargin);
    _$jscoverage['/dialog.js'].lineData[454]++;
    self.imgRatio[0].disabled = true;
    _$jscoverage['/dialog.js'].lineData[455]++;
    self.imgRatioValue = null;
  }
  _$jscoverage['/dialog.js'].lineData[457]++;
  if (visit66_457_1(link)) {
    _$jscoverage['/dialog.js'].lineData[458]++;
    valInput(self.imgLink, visit67_458_1(link.attr('_ke_saved_href') || link.attr('href')));
    _$jscoverage['/dialog.js'].lineData[459]++;
    self.imgLinkBlank.attr('checked', visit68_459_1(link.attr('target') === '_blank'));
  } else {
    _$jscoverage['/dialog.js'].lineData[461]++;
    resetInput(self.imgLink);
    _$jscoverage['/dialog.js'].lineData[462]++;
    self.imgLinkBlank.attr('checked', true);
  }
  _$jscoverage['/dialog.js'].lineData[464]++;
  self.uploadForm[0].reset();
  _$jscoverage['/dialog.js'].lineData[465]++;
  self.imgLocalUrl.val(warning);
  _$jscoverage['/dialog.js'].lineData[466]++;
  var tab = self.tab;
  _$jscoverage['/dialog.js'].lineData[467]++;
  tab.setSelectedTab(tab.getTabAt(active));
}, 
  show: function(_selectedEl) {
  _$jscoverage['/dialog.js'].functionData[17]++;
  _$jscoverage['/dialog.js'].lineData[470]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[471]++;
  self._prepare();
  _$jscoverage['/dialog.js'].lineData[472]++;
  self._update(_selectedEl);
  _$jscoverage['/dialog.js'].lineData[473]++;
  self.d.show();
}, 
  destroy: function() {
  _$jscoverage['/dialog.js'].functionData[18]++;
  _$jscoverage['/dialog.js'].lineData[476]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[477]++;
  self.d.destroy();
  _$jscoverage['/dialog.js'].lineData[478]++;
  self.tab.destroy();
  _$jscoverage['/dialog.js'].lineData[479]++;
  if (visit69_479_1(self.loadingCancel)) {
    _$jscoverage['/dialog.js'].lineData[480]++;
    self.loadingCancel.remove();
  }
  _$jscoverage['/dialog.js'].lineData[482]++;
  if (visit70_482_1(self.imgAlign)) {
    _$jscoverage['/dialog.js'].lineData[483]++;
    self.imgAlign.destroy();
  }
}});
  _$jscoverage['/dialog.js'].lineData[488]++;
  return ImageDialog;
});
