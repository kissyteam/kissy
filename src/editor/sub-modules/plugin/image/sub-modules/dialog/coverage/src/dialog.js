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
  _$jscoverage['/dialog.js'].lineData[5] = 0;
  _$jscoverage['/dialog.js'].lineData[6] = 0;
  _$jscoverage['/dialog.js'].lineData[27] = 0;
  _$jscoverage['/dialog.js'].lineData[28] = 0;
  _$jscoverage['/dialog.js'].lineData[29] = 0;
  _$jscoverage['/dialog.js'].lineData[30] = 0;
  _$jscoverage['/dialog.js'].lineData[31] = 0;
  _$jscoverage['/dialog.js'].lineData[32] = 0;
  _$jscoverage['/dialog.js'].lineData[34] = 0;
  _$jscoverage['/dialog.js'].lineData[35] = 0;
  _$jscoverage['/dialog.js'].lineData[37] = 0;
  _$jscoverage['/dialog.js'].lineData[39] = 0;
  _$jscoverage['/dialog.js'].lineData[42] = 0;
  _$jscoverage['/dialog.js'].lineData[43] = 0;
  _$jscoverage['/dialog.js'].lineData[44] = 0;
  _$jscoverage['/dialog.js'].lineData[45] = 0;
  _$jscoverage['/dialog.js'].lineData[46] = 0;
  _$jscoverage['/dialog.js'].lineData[47] = 0;
  _$jscoverage['/dialog.js'].lineData[49] = 0;
  _$jscoverage['/dialog.js'].lineData[50] = 0;
  _$jscoverage['/dialog.js'].lineData[53] = 0;
  _$jscoverage['/dialog.js'].lineData[55] = 0;
  _$jscoverage['/dialog.js'].lineData[56] = 0;
  _$jscoverage['/dialog.js'].lineData[58] = 0;
  _$jscoverage['/dialog.js'].lineData[70] = 0;
  _$jscoverage['/dialog.js'].lineData[75] = 0;
  _$jscoverage['/dialog.js'].lineData[76] = 0;
  _$jscoverage['/dialog.js'].lineData[77] = 0;
  _$jscoverage['/dialog.js'].lineData[81] = 0;
  _$jscoverage['/dialog.js'].lineData[82] = 0;
  _$jscoverage['/dialog.js'].lineData[83] = 0;
  _$jscoverage['/dialog.js'].lineData[84] = 0;
  _$jscoverage['/dialog.js'].lineData[85] = 0;
  _$jscoverage['/dialog.js'].lineData[86] = 0;
  _$jscoverage['/dialog.js'].lineData[94] = 0;
  _$jscoverage['/dialog.js'].lineData[95] = 0;
  _$jscoverage['/dialog.js'].lineData[96] = 0;
  _$jscoverage['/dialog.js'].lineData[97] = 0;
  _$jscoverage['/dialog.js'].lineData[98] = 0;
  _$jscoverage['/dialog.js'].lineData[99] = 0;
  _$jscoverage['/dialog.js'].lineData[100] = 0;
  _$jscoverage['/dialog.js'].lineData[101] = 0;
  _$jscoverage['/dialog.js'].lineData[103] = 0;
  _$jscoverage['/dialog.js'].lineData[104] = 0;
  _$jscoverage['/dialog.js'].lineData[105] = 0;
  _$jscoverage['/dialog.js'].lineData[107] = 0;
  _$jscoverage['/dialog.js'].lineData[109] = 0;
  _$jscoverage['/dialog.js'].lineData[112] = 0;
  _$jscoverage['/dialog.js'].lineData[113] = 0;
  _$jscoverage['/dialog.js'].lineData[114] = 0;
  _$jscoverage['/dialog.js'].lineData[116] = 0;
  _$jscoverage['/dialog.js'].lineData[118] = 0;
  _$jscoverage['/dialog.js'].lineData[121] = 0;
  _$jscoverage['/dialog.js'].lineData[122] = 0;
  _$jscoverage['/dialog.js'].lineData[123] = 0;
  _$jscoverage['/dialog.js'].lineData[126] = 0;
  _$jscoverage['/dialog.js'].lineData[134] = 0;
  _$jscoverage['/dialog.js'].lineData[136] = 0;
  _$jscoverage['/dialog.js'].lineData[137] = 0;
  _$jscoverage['/dialog.js'].lineData[138] = 0;
  _$jscoverage['/dialog.js'].lineData[139] = 0;
  _$jscoverage['/dialog.js'].lineData[141] = 0;
  _$jscoverage['/dialog.js'].lineData[142] = 0;
  _$jscoverage['/dialog.js'].lineData[144] = 0;
  _$jscoverage['/dialog.js'].lineData[146] = 0;
  _$jscoverage['/dialog.js'].lineData[149] = 0;
  _$jscoverage['/dialog.js'].lineData[152] = 0;
  _$jscoverage['/dialog.js'].lineData[153] = 0;
  _$jscoverage['/dialog.js'].lineData[154] = 0;
  _$jscoverage['/dialog.js'].lineData[158] = 0;
  _$jscoverage['/dialog.js'].lineData[159] = 0;
  _$jscoverage['/dialog.js'].lineData[162] = 0;
  _$jscoverage['/dialog.js'].lineData[163] = 0;
  _$jscoverage['/dialog.js'].lineData[164] = 0;
  _$jscoverage['/dialog.js'].lineData[167] = 0;
  _$jscoverage['/dialog.js'].lineData[168] = 0;
  _$jscoverage['/dialog.js'].lineData[170] = 0;
  _$jscoverage['/dialog.js'].lineData[171] = 0;
  _$jscoverage['/dialog.js'].lineData[172] = 0;
  _$jscoverage['/dialog.js'].lineData[175] = 0;
  _$jscoverage['/dialog.js'].lineData[177] = 0;
  _$jscoverage['/dialog.js'].lineData[178] = 0;
  _$jscoverage['/dialog.js'].lineData[179] = 0;
  _$jscoverage['/dialog.js'].lineData[182] = 0;
  _$jscoverage['/dialog.js'].lineData[187] = 0;
  _$jscoverage['/dialog.js'].lineData[188] = 0;
  _$jscoverage['/dialog.js'].lineData[189] = 0;
  _$jscoverage['/dialog.js'].lineData[192] = 0;
  _$jscoverage['/dialog.js'].lineData[195] = 0;
  _$jscoverage['/dialog.js'].lineData[197] = 0;
  _$jscoverage['/dialog.js'].lineData[204] = 0;
  _$jscoverage['/dialog.js'].lineData[208] = 0;
  _$jscoverage['/dialog.js'].lineData[209] = 0;
  _$jscoverage['/dialog.js'].lineData[210] = 0;
  _$jscoverage['/dialog.js'].lineData[212] = 0;
  _$jscoverage['/dialog.js'].lineData[213] = 0;
  _$jscoverage['/dialog.js'].lineData[215] = 0;
  _$jscoverage['/dialog.js'].lineData[216] = 0;
  _$jscoverage['/dialog.js'].lineData[217] = 0;
  _$jscoverage['/dialog.js'].lineData[219] = 0;
  _$jscoverage['/dialog.js'].lineData[222] = 0;
  _$jscoverage['/dialog.js'].lineData[223] = 0;
  _$jscoverage['/dialog.js'].lineData[227] = 0;
  _$jscoverage['/dialog.js'].lineData[232] = 0;
  _$jscoverage['/dialog.js'].lineData[238] = 0;
  _$jscoverage['/dialog.js'].lineData[239] = 0;
  _$jscoverage['/dialog.js'].lineData[240] = 0;
  _$jscoverage['/dialog.js'].lineData[244] = 0;
  _$jscoverage['/dialog.js'].lineData[245] = 0;
  _$jscoverage['/dialog.js'].lineData[247] = 0;
  _$jscoverage['/dialog.js'].lineData[249] = 0;
  _$jscoverage['/dialog.js'].lineData[252] = 0;
  _$jscoverage['/dialog.js'].lineData[265] = 0;
  _$jscoverage['/dialog.js'].lineData[266] = 0;
  _$jscoverage['/dialog.js'].lineData[267] = 0;
  _$jscoverage['/dialog.js'].lineData[268] = 0;
  _$jscoverage['/dialog.js'].lineData[269] = 0;
  _$jscoverage['/dialog.js'].lineData[270] = 0;
  _$jscoverage['/dialog.js'].lineData[272] = 0;
  _$jscoverage['/dialog.js'].lineData[273] = 0;
  _$jscoverage['/dialog.js'].lineData[275] = 0;
  _$jscoverage['/dialog.js'].lineData[276] = 0;
  _$jscoverage['/dialog.js'].lineData[278] = 0;
  _$jscoverage['/dialog.js'].lineData[281] = 0;
  _$jscoverage['/dialog.js'].lineData[282] = 0;
  _$jscoverage['/dialog.js'].lineData[286] = 0;
  _$jscoverage['/dialog.js'].lineData[289] = 0;
  _$jscoverage['/dialog.js'].lineData[293] = 0;
  _$jscoverage['/dialog.js'].lineData[302] = 0;
  _$jscoverage['/dialog.js'].lineData[303] = 0;
  _$jscoverage['/dialog.js'].lineData[305] = 0;
  _$jscoverage['/dialog.js'].lineData[306] = 0;
  _$jscoverage['/dialog.js'].lineData[308] = 0;
  _$jscoverage['/dialog.js'].lineData[309] = 0;
  _$jscoverage['/dialog.js'].lineData[311] = 0;
  _$jscoverage['/dialog.js'].lineData[312] = 0;
  _$jscoverage['/dialog.js'].lineData[315] = 0;
  _$jscoverage['/dialog.js'].lineData[322] = 0;
  _$jscoverage['/dialog.js'].lineData[323] = 0;
  _$jscoverage['/dialog.js'].lineData[324] = 0;
  _$jscoverage['/dialog.js'].lineData[325] = 0;
  _$jscoverage['/dialog.js'].lineData[332] = 0;
  _$jscoverage['/dialog.js'].lineData[342] = 0;
  _$jscoverage['/dialog.js'].lineData[347] = 0;
  _$jscoverage['/dialog.js'].lineData[348] = 0;
  _$jscoverage['/dialog.js'].lineData[358] = 0;
  _$jscoverage['/dialog.js'].lineData[359] = 0;
  _$jscoverage['/dialog.js'].lineData[360] = 0;
  _$jscoverage['/dialog.js'].lineData[361] = 0;
  _$jscoverage['/dialog.js'].lineData[362] = 0;
  _$jscoverage['/dialog.js'].lineData[363] = 0;
  _$jscoverage['/dialog.js'].lineData[366] = 0;
  _$jscoverage['/dialog.js'].lineData[367] = 0;
  _$jscoverage['/dialog.js'].lineData[370] = 0;
  _$jscoverage['/dialog.js'].lineData[374] = 0;
  _$jscoverage['/dialog.js'].lineData[376] = 0;
  _$jscoverage['/dialog.js'].lineData[377] = 0;
  _$jscoverage['/dialog.js'].lineData[379] = 0;
  _$jscoverage['/dialog.js'].lineData[382] = 0;
  _$jscoverage['/dialog.js'].lineData[383] = 0;
  _$jscoverage['/dialog.js'].lineData[384] = 0;
  _$jscoverage['/dialog.js'].lineData[385] = 0;
  _$jscoverage['/dialog.js'].lineData[388] = 0;
  _$jscoverage['/dialog.js'].lineData[389] = 0;
  _$jscoverage['/dialog.js'].lineData[391] = 0;
  _$jscoverage['/dialog.js'].lineData[392] = 0;
  _$jscoverage['/dialog.js'].lineData[394] = 0;
  _$jscoverage['/dialog.js'].lineData[395] = 0;
  _$jscoverage['/dialog.js'].lineData[401] = 0;
  _$jscoverage['/dialog.js'].lineData[405] = 0;
  _$jscoverage['/dialog.js'].lineData[406] = 0;
  _$jscoverage['/dialog.js'].lineData[407] = 0;
  _$jscoverage['/dialog.js'].lineData[408] = 0;
  _$jscoverage['/dialog.js'].lineData[410] = 0;
  _$jscoverage['/dialog.js'].lineData[411] = 0;
  _$jscoverage['/dialog.js'].lineData[413] = 0;
  _$jscoverage['/dialog.js'].lineData[415] = 0;
  _$jscoverage['/dialog.js'].lineData[416] = 0;
  _$jscoverage['/dialog.js'].lineData[418] = 0;
  _$jscoverage['/dialog.js'].lineData[420] = 0;
  _$jscoverage['/dialog.js'].lineData[421] = 0;
  _$jscoverage['/dialog.js'].lineData[423] = 0;
  _$jscoverage['/dialog.js'].lineData[424] = 0;
  _$jscoverage['/dialog.js'].lineData[425] = 0;
  _$jscoverage['/dialog.js'].lineData[426] = 0;
  _$jscoverage['/dialog.js'].lineData[428] = 0;
  _$jscoverage['/dialog.js'].lineData[429] = 0;
  _$jscoverage['/dialog.js'].lineData[430] = 0;
  _$jscoverage['/dialog.js'].lineData[431] = 0;
  _$jscoverage['/dialog.js'].lineData[432] = 0;
  _$jscoverage['/dialog.js'].lineData[434] = 0;
  _$jscoverage['/dialog.js'].lineData[435] = 0;
  _$jscoverage['/dialog.js'].lineData[436] = 0;
  _$jscoverage['/dialog.js'].lineData[438] = 0;
  _$jscoverage['/dialog.js'].lineData[439] = 0;
  _$jscoverage['/dialog.js'].lineData[441] = 0;
  _$jscoverage['/dialog.js'].lineData[442] = 0;
  _$jscoverage['/dialog.js'].lineData[443] = 0;
  _$jscoverage['/dialog.js'].lineData[444] = 0;
  _$jscoverage['/dialog.js'].lineData[445] = 0;
  _$jscoverage['/dialog.js'].lineData[446] = 0;
  _$jscoverage['/dialog.js'].lineData[447] = 0;
  _$jscoverage['/dialog.js'].lineData[448] = 0;
  _$jscoverage['/dialog.js'].lineData[449] = 0;
  _$jscoverage['/dialog.js'].lineData[451] = 0;
  _$jscoverage['/dialog.js'].lineData[452] = 0;
  _$jscoverage['/dialog.js'].lineData[453] = 0;
  _$jscoverage['/dialog.js'].lineData[455] = 0;
  _$jscoverage['/dialog.js'].lineData[456] = 0;
  _$jscoverage['/dialog.js'].lineData[458] = 0;
  _$jscoverage['/dialog.js'].lineData[459] = 0;
  _$jscoverage['/dialog.js'].lineData[460] = 0;
  _$jscoverage['/dialog.js'].lineData[461] = 0;
  _$jscoverage['/dialog.js'].lineData[464] = 0;
  _$jscoverage['/dialog.js'].lineData[465] = 0;
  _$jscoverage['/dialog.js'].lineData[466] = 0;
  _$jscoverage['/dialog.js'].lineData[467] = 0;
  _$jscoverage['/dialog.js'].lineData[470] = 0;
  _$jscoverage['/dialog.js'].lineData[471] = 0;
  _$jscoverage['/dialog.js'].lineData[472] = 0;
  _$jscoverage['/dialog.js'].lineData[473] = 0;
  _$jscoverage['/dialog.js'].lineData[474] = 0;
  _$jscoverage['/dialog.js'].lineData[476] = 0;
  _$jscoverage['/dialog.js'].lineData[477] = 0;
  _$jscoverage['/dialog.js'].lineData[482] = 0;
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
  _$jscoverage['/dialog.js'].branchData['31'] = [];
  _$jscoverage['/dialog.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['34'] = [];
  _$jscoverage['/dialog.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['45'] = [];
  _$jscoverage['/dialog.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['46'] = [];
  _$jscoverage['/dialog.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['47'] = [];
  _$jscoverage['/dialog.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['47'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['105'] = [];
  _$jscoverage['/dialog.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['105'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['106'] = [];
  _$jscoverage['/dialog.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['114'] = [];
  _$jscoverage['/dialog.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['114'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['115'] = [];
  _$jscoverage['/dialog.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['137'] = [];
  _$jscoverage['/dialog.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['139'] = [];
  _$jscoverage['/dialog.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['154'] = [];
  _$jscoverage['/dialog.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['154'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['154'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['155'] = [];
  _$jscoverage['/dialog.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['158'] = [];
  _$jscoverage['/dialog.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['162'] = [];
  _$jscoverage['/dialog.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['167'] = [];
  _$jscoverage['/dialog.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['177'] = [];
  _$jscoverage['/dialog.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['177'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['192'] = [];
  _$jscoverage['/dialog.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['209'] = [];
  _$jscoverage['/dialog.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['212'] = [];
  _$jscoverage['/dialog.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['215'] = [];
  _$jscoverage['/dialog.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['238'] = [];
  _$jscoverage['/dialog.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['244'] = [];
  _$jscoverage['/dialog.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['245'] = [];
  _$jscoverage['/dialog.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['250'] = [];
  _$jscoverage['/dialog.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['263'] = [];
  _$jscoverage['/dialog.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['265'] = [];
  _$jscoverage['/dialog.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['281'] = [];
  _$jscoverage['/dialog.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['302'] = [];
  _$jscoverage['/dialog.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['305'] = [];
  _$jscoverage['/dialog.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['308'] = [];
  _$jscoverage['/dialog.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['311'] = [];
  _$jscoverage['/dialog.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['311'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['322'] = [];
  _$jscoverage['/dialog.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['358'] = [];
  _$jscoverage['/dialog.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['359'] = [];
  _$jscoverage['/dialog.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['360'] = [];
  _$jscoverage['/dialog.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['360'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['360'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['362'] = [];
  _$jscoverage['/dialog.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['362'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['362'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['366'] = [];
  _$jscoverage['/dialog.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['366'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['366'][3] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['374'] = [];
  _$jscoverage['/dialog.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['376'] = [];
  _$jscoverage['/dialog.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['388'] = [];
  _$jscoverage['/dialog.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['391'] = [];
  _$jscoverage['/dialog.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['394'] = [];
  _$jscoverage['/dialog.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['406'] = [];
  _$jscoverage['/dialog.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['406'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['410'] = [];
  _$jscoverage['/dialog.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['415'] = [];
  _$jscoverage['/dialog.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['420'] = [];
  _$jscoverage['/dialog.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['421'] = [];
  _$jscoverage['/dialog.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['430'] = [];
  _$jscoverage['/dialog.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['431'] = [];
  _$jscoverage['/dialog.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['435'] = [];
  _$jscoverage['/dialog.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['438'] = [];
  _$jscoverage['/dialog.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['451'] = [];
  _$jscoverage['/dialog.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['452'] = [];
  _$jscoverage['/dialog.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['453'] = [];
  _$jscoverage['/dialog.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['473'] = [];
  _$jscoverage['/dialog.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['476'] = [];
  _$jscoverage['/dialog.js'].branchData['476'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['476'][1].init(212, 13, 'self.imgAlign');
function visit71_476_1(result) {
  _$jscoverage['/dialog.js'].branchData['476'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['473'][1].init(112, 18, 'self.loadingCancel');
function visit70_473_1(result) {
  _$jscoverage['/dialog.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['453'][1].init(143, 31, 'link.attr("target") == "_blank"');
function visit69_453_1(result) {
  _$jscoverage['/dialog.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['452'][1].init(41, 48, 'link.attr("_ke_saved_href") || link.attr("href")');
function visit68_452_1(result) {
  _$jscoverage['/dialog.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['451'][1].init(2246, 4, 'link');
function visit67_451_1(result) {
  _$jscoverage['/dialog.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['438'][1].init(514, 47, 'self.tab.get(\'bar\').get(\'children\').length == 2');
function visit66_438_1(result) {
  _$jscoverage['/dialog.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['435'][1].init(391, 26, 'defaultMargin == undefined');
function visit65_435_1(result) {
  _$jscoverage['/dialog.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['431'][1].init(216, 9, 'inElement');
function visit64_431_1(result) {
  _$jscoverage['/dialog.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['430'][1].init(139, 54, 'editorSelection && editorSelection.getCommonAncestor()');
function visit63_430_1(result) {
  _$jscoverage['/dialog.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['421'][1].init(640, 62, 'parseInt(selectedEl.style("margin")) || 0');
function visit62_421_1(result) {
  _$jscoverage['/dialog.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['420'][1].init(572, 35, 'selectedEl.style("float") || "none"');
function visit61_420_1(result) {
  _$jscoverage['/dialog.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['415'][1].init(381, 1, 'w');
function visit60_415_1(result) {
  _$jscoverage['/dialog.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['410'][1].init(211, 1, 'h');
function visit59_410_1(result) {
  _$jscoverage['/dialog.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['406'][2].init(212, 33, 'self.imageCfg[\'remote\'] !== false');
function visit58_406_2(result) {
  _$jscoverage['/dialog.js'].branchData['406'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['406'][1].init(198, 47, 'selectedEl && self.imageCfg[\'remote\'] !== false');
function visit57_406_1(result) {
  _$jscoverage['/dialog.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['394'][1].init(1922, 5, '!skip');
function visit56_394_1(result) {
  _$jscoverage['/dialog.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['391'][1].init(1784, 15, 'self.selectedEl');
function visit55_391_1(result) {
  _$jscoverage['/dialog.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['388'][1].init(1686, 2, 'bs');
function visit54_388_1(result) {
  _$jscoverage['/dialog.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['376'][1].init(67, 16, '!self.selectedEl');
function visit53_376_1(result) {
  _$jscoverage['/dialog.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['374'][1].init(1123, 16, '!skip && linkVal');
function visit52_374_1(result) {
  _$jscoverage['/dialog.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['366'][3].init(291, 22, 'next.nodeName() == \'a\'');
function visit51_366_3(result) {
  _$jscoverage['/dialog.js'].branchData['366'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['366'][2].init(291, 55, '(next.nodeName() == \'a\') && !(next[0].childNodes.length)');
function visit50_366_2(result) {
  _$jscoverage['/dialog.js'].branchData['366'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['366'][1].init(268, 78, '(next = img.next()) && (next.nodeName() == \'a\') && !(next[0].childNodes.length)');
function visit49_366_1(result) {
  _$jscoverage['/dialog.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['362'][3].init(106, 22, 'prev.nodeName() == \'a\'');
function visit48_362_3(result) {
  _$jscoverage['/dialog.js'].branchData['362'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['362'][2].init(106, 55, '(prev.nodeName() == \'a\') && !(prev[0].childNodes.length)');
function visit47_362_2(result) {
  _$jscoverage['/dialog.js'].branchData['362'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['362'][1].init(83, 78, '(prev = img.prev()) && (prev.nodeName() == \'a\') && !(prev[0].childNodes.length)');
function visit46_362_1(result) {
  _$jscoverage['/dialog.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['360'][3].init(124, 20, 'linkTarget != target');
function visit45_360_3(result) {
  _$jscoverage['/dialog.js'].branchData['360'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['360'][2].init(92, 28, 'linkVal != link.attr(\'href\')');
function visit44_360_2(result) {
  _$jscoverage['/dialog.js'].branchData['360'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['360'][1].init(92, 52, 'linkVal != link.attr(\'href\') || linkTarget != target');
function visit43_360_1(result) {
  _$jscoverage['/dialog.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['359'][1].init(35, 30, 'link.attr(\'target\') || "_self"');
function visit42_359_1(result) {
  _$jscoverage['/dialog.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['358'][1].init(418, 4, 'link');
function visit41_358_1(result) {
  _$jscoverage['/dialog.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['322'][1].init(1022, 15, 'self.selectedEl');
function visit40_322_1(result) {
  _$jscoverage['/dialog.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['311'][2].init(688, 11, 'margin != 0');
function visit39_311_2(result) {
  _$jscoverage['/dialog.js'].branchData['311'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['311'][1].init(670, 29, '!isNaN(margin) && margin != 0');
function visit38_311_1(result) {
  _$jscoverage['/dialog.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['308'][1].init(569, 15, 'align != \'none\'');
function visit37_308_1(result) {
  _$jscoverage['/dialog.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['305'][1].init(476, 5, 'width');
function visit36_305_1(result) {
  _$jscoverage['/dialog.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['302'][1].init(380, 6, 'height');
function visit35_302_1(result) {
  _$jscoverage['/dialog.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['281'][1].init(1722, 33, 'self.imageCfg[\'remote\'] === false');
function visit34_281_1(result) {
  _$jscoverage['/dialog.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['265'][1].init(958, 9, 'sizeLimit');
function visit33_265_1(result) {
  _$jscoverage['/dialog.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['263'][1].init(454, 35, 'self.cfg[\'fileInput\'] || "Filedata"');
function visit32_263_1(result) {
  _$jscoverage['/dialog.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['250'][1].init(93, 33, 'self.cfg && self.cfg[\'sizeLimit\']');
function visit31_250_1(result) {
  _$jscoverage['/dialog.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['245'][1].init(22, 21, 'self.cfg[\'extraHTML\']');
function visit30_245_1(result) {
  _$jscoverage['/dialog.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['244'][1].init(8028, 8, 'self.cfg');
function visit29_244_1(result) {
  _$jscoverage['/dialog.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['238'][1].init(26, 35, '!verifyInputs(content.all("input"))');
function visit28_238_1(result) {
  _$jscoverage['/dialog.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['215'][1].init(516, 10, 'data.error');
function visit27_215_1(result) {
  _$jscoverage['/dialog.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['212'][1].init(381, 5, '!data');
function visit26_212_1(result) {
  _$jscoverage['/dialog.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['209'][1].init(255, 17, 'status == "abort"');
function visit25_209_1(result) {
  _$jscoverage['/dialog.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['192'][1].init(1243, 55, 'Editor.Utils.normParams(self.cfg[\'serverParams\']) || {}');
function visit24_192_1(result) {
  _$jscoverage['/dialog.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['177'][2].init(750, 25, 'sizeLimit < (size / 1000)');
function visit23_177_2(result) {
  _$jscoverage['/dialog.js'].branchData['177'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['177'][1].init(737, 38, 'sizeLimit && sizeLimit < (size / 1000)');
function visit22_177_1(result) {
  _$jscoverage['/dialog.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['167'][1].init(324, 45, '!self.suffix_reg.test(self.imgLocalUrl.val())');
function visit21_167_1(result) {
  _$jscoverage['/dialog.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['162'][1].init(161, 33, 'self.imgLocalUrl.val() == warning');
function visit20_162_1(result) {
  _$jscoverage['/dialog.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['158'][1].init(28, 46, '!verifyInputs(commonSettingTable.all("input"))');
function visit19_158_1(result) {
  _$jscoverage['/dialog.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['155'][1].init(57, 61, 'S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) == 1');
function visit18_155_1(result) {
  _$jscoverage['/dialog.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['154'][3].init(51, 33, 'self.imageCfg[\'remote\'] === false');
function visit17_154_3(result) {
  _$jscoverage['/dialog.js'].branchData['154'][3].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['154'][2].init(51, 119, 'self.imageCfg[\'remote\'] === false || S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) == 1');
function visit16_154_2(result) {
  _$jscoverage['/dialog.js'].branchData['154'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['154'][1].init(51, 153, '(self.imageCfg[\'remote\'] === false || S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) == 1) && self.cfg');
function visit15_154_1(result) {
  _$jscoverage['/dialog.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['139'][1].init(119, 5, '1 > 2');
function visit14_139_1(result) {
  _$jscoverage['/dialog.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['137'][1].init(22, 13, 'file[\'files\']');
function visit13_137_1(result) {
  _$jscoverage['/dialog.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['115'][1].init(49, 48, 'self.imgRatio[0].disabled || !self.imgRatioValue');
function visit12_115_1(result) {
  _$jscoverage['/dialog.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['114'][2].init(88, 98, '!self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit11_114_2(result) {
  _$jscoverage['/dialog.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['114'][1].init(82, 104, '!v || !self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit10_114_1(result) {
  _$jscoverage['/dialog.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['106'][1].init(49, 48, 'self.imgRatio[0].disabled || !self.imgRatioValue');
function visit9_106_1(result) {
  _$jscoverage['/dialog.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['105'][2].init(89, 98, '!self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit8_105_2(result) {
  _$jscoverage['/dialog.js'].branchData['105'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['105'][1].init(83, 104, '!v || !self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue');
function visit7_105_1(result) {
  _$jscoverage['/dialog.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['47'][2].init(173, 30, 'self.cfg && self.cfg["suffix"]');
function visit6_47_2(result) {
  _$jscoverage['/dialog.js'].branchData['47'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['47'][1].init(173, 52, 'self.cfg && self.cfg["suffix"] || "png,jpg,jpeg,gif"');
function visit5_47_1(result) {
  _$jscoverage['/dialog.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['46'][1].init(117, 31, 'self.imageCfg["upload"] || null');
function visit4_46_1(result) {
  _$jscoverage['/dialog.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['45'][1].init(83, 12, 'config || {}');
function visit3_45_1(result) {
  _$jscoverage['/dialog.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['34'][1].init(134, 41, 'dtd.$block[name] || dtd.$blockLimit[name]');
function visit2_34_1(result) {
  _$jscoverage['/dialog.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['31'][1].init(58, 11, 'name == "a"');
function visit1_31_1(result) {
  _$jscoverage['/dialog.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[5]++;
KISSY.add("editor/plugin/image/dialog", function(S, IO, Editor, Dialog4E, Tabs, MenuButton, bodyTpl) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[6]++;
  var dtd = Editor.XHTML_DTD, UA = S.UA, Node = KISSY.NodeList, HTTP_TIP = "http://", AUTOMATIC_TIP = "\u81ea\u52a8", MARGIN_DEFAULT = 10, IMAGE_DIALOG_BODY_HTML = bodyTpl, IMAGE_DIALOG_FOOT_HTML = "<div style='padding:5px 20px 20px;'>" + "<a " + "href='javascript:void('\u786e\u5b9a')' " + "class='{prefixCls}img-insert {prefixCls}button ks-inline-block' " + "style='margin-right:30px;'>\u786e\u5b9a</a> " + "<a  " + "href='javascript:void('\u53d6\u6d88')' " + "class='{prefixCls}img-cancel {prefixCls}button ks-inline-block'>\u53d6\u6d88</a></div>", warning = "\u8bf7\u70b9\u51fb\u6d4f\u89c8\u4e0a\u4f20\u56fe\u7247", valInput = Editor.Utils.valInput;
  _$jscoverage['/dialog.js'].lineData[27]++;
  function findAWithImg(img) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[28]++;
    var ret = img;
    _$jscoverage['/dialog.js'].lineData[29]++;
    while (ret) {
      _$jscoverage['/dialog.js'].lineData[30]++;
      var name = ret.nodeName();
      _$jscoverage['/dialog.js'].lineData[31]++;
      if (visit1_31_1(name == "a")) {
        _$jscoverage['/dialog.js'].lineData[32]++;
        return ret;
      }
      _$jscoverage['/dialog.js'].lineData[34]++;
      if (visit2_34_1(dtd.$block[name] || dtd.$blockLimit[name])) {
        _$jscoverage['/dialog.js'].lineData[35]++;
        return null;
      }
      _$jscoverage['/dialog.js'].lineData[37]++;
      ret = ret.parent();
    }
    _$jscoverage['/dialog.js'].lineData[39]++;
    return null;
  }
  _$jscoverage['/dialog.js'].lineData[42]++;
  function ImageDialog(editor, config) {
    _$jscoverage['/dialog.js'].functionData[2]++;
    _$jscoverage['/dialog.js'].lineData[43]++;
    var self = this;
    _$jscoverage['/dialog.js'].lineData[44]++;
    self.editor = editor;
    _$jscoverage['/dialog.js'].lineData[45]++;
    self.imageCfg = visit3_45_1(config || {});
    _$jscoverage['/dialog.js'].lineData[46]++;
    self.cfg = visit4_46_1(self.imageCfg["upload"] || null);
    _$jscoverage['/dialog.js'].lineData[47]++;
    self.suffix = visit5_47_1(visit6_47_2(self.cfg && self.cfg["suffix"]) || "png,jpg,jpeg,gif");
    _$jscoverage['/dialog.js'].lineData[49]++;
    self.suffix_reg = new RegExp(self.suffix.split(/,/).join("|") + "$", "i");
    _$jscoverage['/dialog.js'].lineData[50]++;
    self.suffix_warning = "\u53ea\u5141\u8bb8\u540e\u7f00\u540d\u4e3a" + self.suffix + "\u7684\u56fe\u7247";
  }
  _$jscoverage['/dialog.js'].lineData[53]++;
  S.augment(ImageDialog, {
  _prepare: function() {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[55]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[56]++;
  var editor = self.editor, prefixCls = editor.get('prefixCls') + 'editor-';
  _$jscoverage['/dialog.js'].lineData[58]++;
  self.dialog = self.d = new Dialog4E({
  width: 500, 
  headerContent: "\u56fe\u7247", 
  bodyContent: S.substitute(IMAGE_DIALOG_BODY_HTML, {
  prefixCls: prefixCls}), 
  footerContent: S.substitute(IMAGE_DIALOG_FOOT_HTML, {
  prefixCls: prefixCls}), 
  mask: true}).render();
  _$jscoverage['/dialog.js'].lineData[70]++;
  var content = self.d.get("el"), cancel = content.one("." + prefixCls + "img-cancel"), ok = content.one("." + prefixCls + "img-insert"), verifyInputs = Editor.Utils.verifyInputs, commonSettingTable = content.one("." + prefixCls + "img-setting");
  _$jscoverage['/dialog.js'].lineData[75]++;
  self.uploadForm = content.one("." + prefixCls + "img-upload-form");
  _$jscoverage['/dialog.js'].lineData[76]++;
  self.imgLocalUrl = content.one("." + prefixCls + "img-local-url");
  _$jscoverage['/dialog.js'].lineData[77]++;
  self.tab = new Tabs({
  "srcNode": self.d.get("body").one('.' + prefixCls + 'img-tabs'), 
  prefixCls: prefixCls + 'img-'}).render();
  _$jscoverage['/dialog.js'].lineData[81]++;
  self.imgLocalUrl.val(warning);
  _$jscoverage['/dialog.js'].lineData[82]++;
  self.imgUrl = content.one("." + prefixCls + "img-url");
  _$jscoverage['/dialog.js'].lineData[83]++;
  self.imgHeight = content.one("." + prefixCls + "img-height");
  _$jscoverage['/dialog.js'].lineData[84]++;
  self.imgWidth = content.one("." + prefixCls + "img-width");
  _$jscoverage['/dialog.js'].lineData[85]++;
  self.imgRatio = content.one("." + prefixCls + "img-ratio");
  _$jscoverage['/dialog.js'].lineData[86]++;
  self.imgAlign = MenuButton.Select.decorate(content.one("." + prefixCls + "img-align"), {
  prefixCls: prefixCls + 'big-', 
  width: 80, 
  menuCfg: {
  prefixCls: prefixCls + '', 
  render: content}});
  _$jscoverage['/dialog.js'].lineData[94]++;
  self.imgMargin = content.one("." + prefixCls + "img-margin");
  _$jscoverage['/dialog.js'].lineData[95]++;
  self.imgLink = content.one("." + prefixCls + "img-link");
  _$jscoverage['/dialog.js'].lineData[96]++;
  self.imgLinkBlank = content.one("." + prefixCls + "img-link-blank");
  _$jscoverage['/dialog.js'].lineData[97]++;
  var placeholder = Editor.Utils.placeholder;
  _$jscoverage['/dialog.js'].lineData[98]++;
  placeholder(self.imgUrl, HTTP_TIP);
  _$jscoverage['/dialog.js'].lineData[99]++;
  placeholder(self.imgHeight, AUTOMATIC_TIP);
  _$jscoverage['/dialog.js'].lineData[100]++;
  placeholder(self.imgWidth, AUTOMATIC_TIP);
  _$jscoverage['/dialog.js'].lineData[101]++;
  placeholder(self.imgLink, "http://");
  _$jscoverage['/dialog.js'].lineData[103]++;
  self.imgHeight.on("keyup", function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[104]++;
  var v = parseInt(valInput(self.imgHeight));
  _$jscoverage['/dialog.js'].lineData[105]++;
  if (visit7_105_1(!v || visit8_105_2(!self.imgRatio[0].checked || visit9_106_1(self.imgRatio[0].disabled || !self.imgRatioValue)))) {
    _$jscoverage['/dialog.js'].lineData[107]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[109]++;
  valInput(self.imgWidth, Math.floor(v * self.imgRatioValue));
});
  _$jscoverage['/dialog.js'].lineData[112]++;
  self.imgWidth.on("keyup", function() {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[113]++;
  var v = parseInt(valInput(self.imgWidth));
  _$jscoverage['/dialog.js'].lineData[114]++;
  if (visit10_114_1(!v || visit11_114_2(!self.imgRatio[0].checked || visit12_115_1(self.imgRatio[0].disabled || !self.imgRatioValue)))) {
    _$jscoverage['/dialog.js'].lineData[116]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[118]++;
  valInput(self.imgHeight, Math.floor(v / self.imgRatioValue));
});
  _$jscoverage['/dialog.js'].lineData[121]++;
  cancel.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[122]++;
  self.d.hide();
  _$jscoverage['/dialog.js'].lineData[123]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[126]++;
  var loadingCancel = new Node("<a class='" + prefixCls + "button ks-inline-block' " + "style='position:absolute;" + "z-index:" + Editor.baseZIndex(Editor.zIndexManager.LOADING_CANCEL) + ";" + "left:-9999px;" + "top:-9999px;" + "'>\u53d6\u6d88\u4e0a\u4f20</a>").appendTo(document.body, undefined);
  _$jscoverage['/dialog.js'].lineData[134]++;
  self.loadingCancel = loadingCancel;
  _$jscoverage['/dialog.js'].lineData[136]++;
  function getFileSize(file) {
    _$jscoverage['/dialog.js'].functionData[7]++;
    _$jscoverage['/dialog.js'].lineData[137]++;
    if (visit13_137_1(file['files'])) {
      _$jscoverage['/dialog.js'].lineData[138]++;
      return file['files'][0].size;
    } else {
      _$jscoverage['/dialog.js'].lineData[139]++;
      if (visit14_139_1(1 > 2)) {
        _$jscoverage['/dialog.js'].lineData[141]++;
        try {
          _$jscoverage['/dialog.js'].lineData[142]++;
          var fso = new ActiveXObject("Scripting.FileSystemObject"), file2 = fso['GetFile'](file.value);
          _$jscoverage['/dialog.js'].lineData[144]++;
          return file2.size;
        }        catch (e) {
  _$jscoverage['/dialog.js'].lineData[146]++;
  S.log(e.message);
}
      }
    }
    _$jscoverage['/dialog.js'].lineData[149]++;
    return 0;
  }
  _$jscoverage['/dialog.js'].lineData[152]++;
  ok.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[153]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[154]++;
  if (visit15_154_1((visit16_154_2(visit17_154_3(self.imageCfg['remote'] === false) || visit18_155_1(S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) == 1))) && self.cfg)) {
    _$jscoverage['/dialog.js'].lineData[158]++;
    if (visit19_158_1(!verifyInputs(commonSettingTable.all("input")))) {
      _$jscoverage['/dialog.js'].lineData[159]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[162]++;
    if (visit20_162_1(self.imgLocalUrl.val() == warning)) {
      _$jscoverage['/dialog.js'].lineData[163]++;
      alert("\u8bf7\u5148\u9009\u62e9\u6587\u4ef6!");
      _$jscoverage['/dialog.js'].lineData[164]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[167]++;
    if (visit21_167_1(!self.suffix_reg.test(self.imgLocalUrl.val()))) {
      _$jscoverage['/dialog.js'].lineData[168]++;
      alert(self.suffix_warning);
      _$jscoverage['/dialog.js'].lineData[170]++;
      self.uploadForm[0].reset();
      _$jscoverage['/dialog.js'].lineData[171]++;
      self.imgLocalUrl.val(warning);
      _$jscoverage['/dialog.js'].lineData[172]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[175]++;
    var size = (getFileSize(self.fileInput[0]));
    _$jscoverage['/dialog.js'].lineData[177]++;
    if (visit22_177_1(sizeLimit && visit23_177_2(sizeLimit < (size / 1000)))) {
      _$jscoverage['/dialog.js'].lineData[178]++;
      alert("\u4e0a\u4f20\u56fe\u7247\u6700\u5927\uff1a" + sizeLimit / 1000 + "M");
      _$jscoverage['/dialog.js'].lineData[179]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[182]++;
    self.d.loading();
    _$jscoverage['/dialog.js'].lineData[187]++;
    loadingCancel.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[9]++;
  _$jscoverage['/dialog.js'].lineData[188]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[189]++;
  uploadIO.abort();
});
    _$jscoverage['/dialog.js'].lineData[192]++;
    var serverParams = visit24_192_1(Editor.Utils.normParams(self.cfg['serverParams']) || {});
    _$jscoverage['/dialog.js'].lineData[195]++;
    serverParams['document-domain'] = document.domain;
    _$jscoverage['/dialog.js'].lineData[197]++;
    var uploadIO = IO({
  data: serverParams, 
  url: self.cfg['serverUrl'], 
  form: self.uploadForm[0], 
  dataType: 'json', 
  type: 'post', 
  complete: function(data, status) {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[204]++;
  loadingCancel.css({
  left: -9999, 
  top: -9999});
  _$jscoverage['/dialog.js'].lineData[208]++;
  self.d.unloading();
  _$jscoverage['/dialog.js'].lineData[209]++;
  if (visit25_209_1(status == "abort")) {
    _$jscoverage['/dialog.js'].lineData[210]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[212]++;
  if (visit26_212_1(!data)) {
    _$jscoverage['/dialog.js'].lineData[213]++;
    data = {
  error: "\u670d\u52a1\u5668\u51fa\u9519\uff0c\u8bf7\u91cd\u8bd5"};
  }
  _$jscoverage['/dialog.js'].lineData[215]++;
  if (visit27_215_1(data.error)) {
    _$jscoverage['/dialog.js'].lineData[216]++;
    alert(data.error);
    _$jscoverage['/dialog.js'].lineData[217]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[219]++;
  valInput(self.imgUrl, data['imgUrl']);
  _$jscoverage['/dialog.js'].lineData[222]++;
  new Image().src = data['imgUrl'];
  _$jscoverage['/dialog.js'].lineData[223]++;
  self._insert();
}});
    _$jscoverage['/dialog.js'].lineData[227]++;
    var loadingMaskEl = self.d.get("el"), offset = loadingMaskEl.offset(), width = loadingMaskEl[0].offsetWidth, height = loadingMaskEl[0].offsetHeight;
    _$jscoverage['/dialog.js'].lineData[232]++;
    loadingCancel.css({
  left: (offset.left + width / 2.5), 
  top: (offset.top + height / 1.5)});
  } else {
    _$jscoverage['/dialog.js'].lineData[238]++;
    if (visit28_238_1(!verifyInputs(content.all("input")))) {
      _$jscoverage['/dialog.js'].lineData[239]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[240]++;
    self._insert();
  }
});
  _$jscoverage['/dialog.js'].lineData[244]++;
  if (visit29_244_1(self.cfg)) {
    _$jscoverage['/dialog.js'].lineData[245]++;
    if (visit30_245_1(self.cfg['extraHTML'])) {
      _$jscoverage['/dialog.js'].lineData[247]++;
      content.one("." + prefixCls + "img-up-extraHTML").html(self.cfg['extraHTML']);
    }
    _$jscoverage['/dialog.js'].lineData[249]++;
    var ke_image_up = content.one("." + prefixCls + "image-up"), sizeLimit = visit31_250_1(self.cfg && self.cfg['sizeLimit']);
    _$jscoverage['/dialog.js'].lineData[252]++;
    self.fileInput = new Node("<input " + "type='file' " + "style='position:absolute;" + "cursor:pointer;" + "left:" + (UA['ie'] ? "360" : (UA["chrome"] ? "319" : "369")) + "px;" + "z-index:2;" + "top:0px;" + "height:26px;' " + "size='1' " + "name='" + (visit32_263_1(self.cfg['fileInput'] || "Filedata")) + "'/>").insertAfter(self.imgLocalUrl);
    _$jscoverage['/dialog.js'].lineData[265]++;
    if (visit33_265_1(sizeLimit)) {
      _$jscoverage['/dialog.js'].lineData[266]++;
      warning = "\u5355\u5f20\u56fe\u7247\u5bb9\u91cf\u4e0d\u8d85\u8fc7 " + (sizeLimit / 1000) + " M";
    }
    _$jscoverage['/dialog.js'].lineData[267]++;
    self.imgLocalUrl.val(warning);
    _$jscoverage['/dialog.js'].lineData[268]++;
    self.fileInput.css("opacity", 0);
    _$jscoverage['/dialog.js'].lineData[269]++;
    self.fileInput.on("mouseenter", function() {
  _$jscoverage['/dialog.js'].functionData[11]++;
  _$jscoverage['/dialog.js'].lineData[270]++;
  ke_image_up.addClass("" + prefixCls + "button-hover");
});
    _$jscoverage['/dialog.js'].lineData[272]++;
    self.fileInput.on("mouseleave", function() {
  _$jscoverage['/dialog.js'].functionData[12]++;
  _$jscoverage['/dialog.js'].lineData[273]++;
  ke_image_up.removeClass("" + prefixCls + "button-hover");
});
    _$jscoverage['/dialog.js'].lineData[275]++;
    self.fileInput.on("change", function() {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[276]++;
  var file = self.fileInput.val();
  _$jscoverage['/dialog.js'].lineData[278]++;
  self.imgLocalUrl.val(file.replace(/.+[\/\\]/, ""));
});
    _$jscoverage['/dialog.js'].lineData[281]++;
    if (visit34_281_1(self.imageCfg['remote'] === false)) {
      _$jscoverage['/dialog.js'].lineData[282]++;
      self.tab.removeItemAt(0, 1);
    }
  } else {
    _$jscoverage['/dialog.js'].lineData[286]++;
    self.tab.removeItemAt(1, 1);
  }
  _$jscoverage['/dialog.js'].lineData[289]++;
  self._prepare = S.noop;
}, 
  _insert: function() {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[293]++;
  var self = this, url = valInput(self.imgUrl), img, height = parseInt(valInput(self.imgHeight)), width = parseInt(valInput(self.imgWidth)), align = self.imgAlign.get("value"), margin = parseInt(self.imgMargin.val()), style = '';
  _$jscoverage['/dialog.js'].lineData[302]++;
  if (visit35_302_1(height)) {
    _$jscoverage['/dialog.js'].lineData[303]++;
    style += "height:" + height + "px;";
  }
  _$jscoverage['/dialog.js'].lineData[305]++;
  if (visit36_305_1(width)) {
    _$jscoverage['/dialog.js'].lineData[306]++;
    style += "width:" + width + "px;";
  }
  _$jscoverage['/dialog.js'].lineData[308]++;
  if (visit37_308_1(align != 'none')) {
    _$jscoverage['/dialog.js'].lineData[309]++;
    style += "float:" + align + ";";
  }
  _$jscoverage['/dialog.js'].lineData[311]++;
  if (visit38_311_1(!isNaN(margin) && visit39_311_2(margin != 0))) {
    _$jscoverage['/dialog.js'].lineData[312]++;
    style += "margin:" + margin + "px;";
  }
  _$jscoverage['/dialog.js'].lineData[315]++;
  self.d.hide();
  _$jscoverage['/dialog.js'].lineData[322]++;
  if (visit40_322_1(self.selectedEl)) {
    _$jscoverage['/dialog.js'].lineData[323]++;
    img = self.selectedEl;
    _$jscoverage['/dialog.js'].lineData[324]++;
    self.editor.execCommand("save");
    _$jscoverage['/dialog.js'].lineData[325]++;
    self.selectedEl.attr({
  "src": url, 
  "_ke_saved_src": url, 
  "style": style});
  } else {
    _$jscoverage['/dialog.js'].lineData[332]++;
    img = new Node("<img " + (style ? ("style='" + style + "'") : "") + " src='" + url + "' " + "_ke_saved_src='" + url + "' alt='' />", null, self.editor.get("document")[0]);
    _$jscoverage['/dialog.js'].lineData[342]++;
    self.editor.insertElement(img);
  }
  _$jscoverage['/dialog.js'].lineData[347]++;
  setTimeout(function() {
  _$jscoverage['/dialog.js'].functionData[15]++;
  _$jscoverage['/dialog.js'].lineData[348]++;
  var link = findAWithImg(img), linkVal = S.trim(valInput(self.imgLink)), sel = self.editor.getSelection(), target = self.imgLinkBlank.attr("checked") ? "_blank" : "_self", linkTarget, skip = 0, prev, next, bs;
  _$jscoverage['/dialog.js'].lineData[358]++;
  if (visit41_358_1(link)) {
    _$jscoverage['/dialog.js'].lineData[359]++;
    linkTarget = visit42_359_1(link.attr('target') || "_self");
    _$jscoverage['/dialog.js'].lineData[360]++;
    if (visit43_360_1(visit44_360_2(linkVal != link.attr('href')) || visit45_360_3(linkTarget != target))) {
      _$jscoverage['/dialog.js'].lineData[361]++;
      img._4e_breakParent(link);
      _$jscoverage['/dialog.js'].lineData[362]++;
      if (visit46_362_1((prev = img.prev()) && visit47_362_2((visit48_362_3(prev.nodeName() == 'a')) && !(prev[0].childNodes.length)))) {
        _$jscoverage['/dialog.js'].lineData[363]++;
        prev.remove();
      }
      _$jscoverage['/dialog.js'].lineData[366]++;
      if (visit49_366_1((next = img.next()) && visit50_366_2((visit51_366_3(next.nodeName() == 'a')) && !(next[0].childNodes.length)))) {
        _$jscoverage['/dialog.js'].lineData[367]++;
        next.remove();
      }
    } else {
      _$jscoverage['/dialog.js'].lineData[370]++;
      skip = 1;
    }
  }
  _$jscoverage['/dialog.js'].lineData[374]++;
  if (visit52_374_1(!skip && linkVal)) {
    _$jscoverage['/dialog.js'].lineData[376]++;
    if (visit53_376_1(!self.selectedEl)) {
      _$jscoverage['/dialog.js'].lineData[377]++;
      bs = sel.createBookmarks();
    }
    _$jscoverage['/dialog.js'].lineData[379]++;
    link = new Node("<a></a>");
    _$jscoverage['/dialog.js'].lineData[382]++;
    link.attr("_ke_saved_href", linkVal).attr("href", linkVal).attr("target", target);
    _$jscoverage['/dialog.js'].lineData[383]++;
    var t = img[0];
    _$jscoverage['/dialog.js'].lineData[384]++;
    t.parentNode.replaceChild(link[0], t);
    _$jscoverage['/dialog.js'].lineData[385]++;
    link.append(t);
  }
  _$jscoverage['/dialog.js'].lineData[388]++;
  if (visit54_388_1(bs)) {
    _$jscoverage['/dialog.js'].lineData[389]++;
    sel.selectBookmarks(bs);
  } else {
    _$jscoverage['/dialog.js'].lineData[391]++;
    if (visit55_391_1(self.selectedEl)) {
      _$jscoverage['/dialog.js'].lineData[392]++;
      self.editor.getSelection().selectElement(self.selectedEl);
    }
  }
  _$jscoverage['/dialog.js'].lineData[394]++;
  if (visit56_394_1(!skip)) {
    _$jscoverage['/dialog.js'].lineData[395]++;
    self.editor.execCommand("save");
  }
}, 100);
}, 
  _update: function(selectedEl) {
  _$jscoverage['/dialog.js'].functionData[16]++;
  _$jscoverage['/dialog.js'].lineData[401]++;
  var self = this, active = 0, link, resetInput = Editor.Utils.resetInput;
  _$jscoverage['/dialog.js'].lineData[405]++;
  self.selectedEl = selectedEl;
  _$jscoverage['/dialog.js'].lineData[406]++;
  if (visit57_406_1(selectedEl && visit58_406_2(self.imageCfg['remote'] !== false))) {
    _$jscoverage['/dialog.js'].lineData[407]++;
    valInput(self.imgUrl, selectedEl.attr("src"));
    _$jscoverage['/dialog.js'].lineData[408]++;
    var w = parseInt(selectedEl.style("width")), h = parseInt(selectedEl.style("height"));
    _$jscoverage['/dialog.js'].lineData[410]++;
    if (visit59_410_1(h)) {
      _$jscoverage['/dialog.js'].lineData[411]++;
      valInput(self.imgHeight, h);
    } else {
      _$jscoverage['/dialog.js'].lineData[413]++;
      resetInput(self.imgHeight);
    }
    _$jscoverage['/dialog.js'].lineData[415]++;
    if (visit60_415_1(w)) {
      _$jscoverage['/dialog.js'].lineData[416]++;
      valInput(self.imgWidth, w);
    } else {
      _$jscoverage['/dialog.js'].lineData[418]++;
      resetInput(self.imgWidth);
    }
    _$jscoverage['/dialog.js'].lineData[420]++;
    self.imgAlign.set("value", visit61_420_1(selectedEl.style("float") || "none"));
    _$jscoverage['/dialog.js'].lineData[421]++;
    var margin = visit62_421_1(parseInt(selectedEl.style("margin")) || 0);
    _$jscoverage['/dialog.js'].lineData[423]++;
    self.imgMargin.val(margin);
    _$jscoverage['/dialog.js'].lineData[424]++;
    self.imgRatio[0].disabled = false;
    _$jscoverage['/dialog.js'].lineData[425]++;
    self.imgRatioValue = w / h;
    _$jscoverage['/dialog.js'].lineData[426]++;
    link = findAWithImg(selectedEl);
  } else {
    _$jscoverage['/dialog.js'].lineData[428]++;
    var editor = self.editor;
    _$jscoverage['/dialog.js'].lineData[429]++;
    var editorSelection = editor.getSelection();
    _$jscoverage['/dialog.js'].lineData[430]++;
    var inElement = visit63_430_1(editorSelection && editorSelection.getCommonAncestor());
    _$jscoverage['/dialog.js'].lineData[431]++;
    if (visit64_431_1(inElement)) {
      _$jscoverage['/dialog.js'].lineData[432]++;
      link = findAWithImg(inElement);
    }
    _$jscoverage['/dialog.js'].lineData[434]++;
    var defaultMargin = self.imageCfg['defaultMargin'];
    _$jscoverage['/dialog.js'].lineData[435]++;
    if (visit65_435_1(defaultMargin == undefined)) {
      _$jscoverage['/dialog.js'].lineData[436]++;
      defaultMargin = MARGIN_DEFAULT;
    }
    _$jscoverage['/dialog.js'].lineData[438]++;
    if (visit66_438_1(self.tab.get('bar').get('children').length == 2)) {
      _$jscoverage['/dialog.js'].lineData[439]++;
      active = 1;
    }
    _$jscoverage['/dialog.js'].lineData[441]++;
    self.imgLinkBlank.attr("checked", true);
    _$jscoverage['/dialog.js'].lineData[442]++;
    resetInput(self.imgUrl);
    _$jscoverage['/dialog.js'].lineData[443]++;
    resetInput(self.imgLink);
    _$jscoverage['/dialog.js'].lineData[444]++;
    resetInput(self.imgHeight);
    _$jscoverage['/dialog.js'].lineData[445]++;
    resetInput(self.imgWidth);
    _$jscoverage['/dialog.js'].lineData[446]++;
    self.imgAlign.set("value", "none");
    _$jscoverage['/dialog.js'].lineData[447]++;
    self.imgMargin.val(defaultMargin);
    _$jscoverage['/dialog.js'].lineData[448]++;
    self.imgRatio[0].disabled = true;
    _$jscoverage['/dialog.js'].lineData[449]++;
    self.imgRatioValue = null;
  }
  _$jscoverage['/dialog.js'].lineData[451]++;
  if (visit67_451_1(link)) {
    _$jscoverage['/dialog.js'].lineData[452]++;
    valInput(self.imgLink, visit68_452_1(link.attr("_ke_saved_href") || link.attr("href")));
    _$jscoverage['/dialog.js'].lineData[453]++;
    self.imgLinkBlank.attr("checked", visit69_453_1(link.attr("target") == "_blank"));
  } else {
    _$jscoverage['/dialog.js'].lineData[455]++;
    resetInput(self.imgLink);
    _$jscoverage['/dialog.js'].lineData[456]++;
    self.imgLinkBlank.attr("checked", true);
  }
  _$jscoverage['/dialog.js'].lineData[458]++;
  self.uploadForm[0].reset();
  _$jscoverage['/dialog.js'].lineData[459]++;
  self.imgLocalUrl.val(warning);
  _$jscoverage['/dialog.js'].lineData[460]++;
  var tab = self.tab;
  _$jscoverage['/dialog.js'].lineData[461]++;
  tab.setSelectedTab(tab.getTabAt(active));
}, 
  show: function(_selectedEl) {
  _$jscoverage['/dialog.js'].functionData[17]++;
  _$jscoverage['/dialog.js'].lineData[464]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[465]++;
  self._prepare();
  _$jscoverage['/dialog.js'].lineData[466]++;
  self._update(_selectedEl);
  _$jscoverage['/dialog.js'].lineData[467]++;
  self.d.show();
}, 
  destroy: function() {
  _$jscoverage['/dialog.js'].functionData[18]++;
  _$jscoverage['/dialog.js'].lineData[470]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[471]++;
  self.d.destroy();
  _$jscoverage['/dialog.js'].lineData[472]++;
  self.tab.destroy();
  _$jscoverage['/dialog.js'].lineData[473]++;
  if (visit70_473_1(self.loadingCancel)) {
    _$jscoverage['/dialog.js'].lineData[474]++;
    self.loadingCancel.remove();
  }
  _$jscoverage['/dialog.js'].lineData[476]++;
  if (visit71_476_1(self.imgAlign)) {
    _$jscoverage['/dialog.js'].lineData[477]++;
    self.imgAlign.destroy();
  }
}});
  _$jscoverage['/dialog.js'].lineData[482]++;
  return ImageDialog;
}, {
  requires: ['io', 'editor', '../dialog', 'tabs', '../menubutton', './dialog/dialog-tpl']});
