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
if (! _$jscoverage['/selector.js']) {
  _$jscoverage['/selector.js'] = {};
  _$jscoverage['/selector.js'].lineData = [];
  _$jscoverage['/selector.js'].lineData[6] = 0;
  _$jscoverage['/selector.js'].lineData[7] = 0;
  _$jscoverage['/selector.js'].lineData[8] = 0;
  _$jscoverage['/selector.js'].lineData[9] = 0;
  _$jscoverage['/selector.js'].lineData[10] = 0;
  _$jscoverage['/selector.js'].lineData[14] = 0;
  _$jscoverage['/selector.js'].lineData[21] = 0;
  _$jscoverage['/selector.js'].lineData[22] = 0;
  _$jscoverage['/selector.js'].lineData[24] = 0;
  _$jscoverage['/selector.js'].lineData[32] = 0;
  _$jscoverage['/selector.js'].lineData[34] = 0;
  _$jscoverage['/selector.js'].lineData[36] = 0;
  _$jscoverage['/selector.js'].lineData[45] = 0;
  _$jscoverage['/selector.js'].lineData[46] = 0;
  _$jscoverage['/selector.js'].lineData[49] = 0;
  _$jscoverage['/selector.js'].lineData[52] = 0;
  _$jscoverage['/selector.js'].lineData[56] = 0;
  _$jscoverage['/selector.js'].lineData[57] = 0;
  _$jscoverage['/selector.js'].lineData[60] = 0;
  _$jscoverage['/selector.js'].lineData[61] = 0;
  _$jscoverage['/selector.js'].lineData[62] = 0;
  _$jscoverage['/selector.js'].lineData[64] = 0;
  _$jscoverage['/selector.js'].lineData[67] = 0;
  _$jscoverage['/selector.js'].lineData[68] = 0;
  _$jscoverage['/selector.js'].lineData[71] = 0;
  _$jscoverage['/selector.js'].lineData[72] = 0;
  _$jscoverage['/selector.js'].lineData[74] = 0;
  _$jscoverage['/selector.js'].lineData[75] = 0;
  _$jscoverage['/selector.js'].lineData[76] = 0;
  _$jscoverage['/selector.js'].lineData[77] = 0;
  _$jscoverage['/selector.js'].lineData[78] = 0;
  _$jscoverage['/selector.js'].lineData[79] = 0;
  _$jscoverage['/selector.js'].lineData[80] = 0;
  _$jscoverage['/selector.js'].lineData[81] = 0;
  _$jscoverage['/selector.js'].lineData[82] = 0;
  _$jscoverage['/selector.js'].lineData[83] = 0;
  _$jscoverage['/selector.js'].lineData[84] = 0;
  _$jscoverage['/selector.js'].lineData[85] = 0;
  _$jscoverage['/selector.js'].lineData[87] = 0;
  _$jscoverage['/selector.js'].lineData[91] = 0;
  _$jscoverage['/selector.js'].lineData[93] = 0;
  _$jscoverage['/selector.js'].lineData[95] = 0;
  _$jscoverage['/selector.js'].lineData[101] = 0;
  _$jscoverage['/selector.js'].lineData[102] = 0;
  _$jscoverage['/selector.js'].lineData[103] = 0;
  _$jscoverage['/selector.js'].lineData[104] = 0;
  _$jscoverage['/selector.js'].lineData[107] = 0;
  _$jscoverage['/selector.js'].lineData[108] = 0;
  _$jscoverage['/selector.js'].lineData[111] = 0;
  _$jscoverage['/selector.js'].lineData[114] = 0;
  _$jscoverage['/selector.js'].lineData[115] = 0;
  _$jscoverage['/selector.js'].lineData[116] = 0;
  _$jscoverage['/selector.js'].lineData[119] = 0;
  _$jscoverage['/selector.js'].lineData[121] = 0;
  _$jscoverage['/selector.js'].lineData[124] = 0;
  _$jscoverage['/selector.js'].lineData[125] = 0;
  _$jscoverage['/selector.js'].lineData[127] = 0;
  _$jscoverage['/selector.js'].lineData[129] = 0;
  _$jscoverage['/selector.js'].lineData[130] = 0;
  _$jscoverage['/selector.js'].lineData[135] = 0;
  _$jscoverage['/selector.js'].lineData[136] = 0;
  _$jscoverage['/selector.js'].lineData[137] = 0;
  _$jscoverage['/selector.js'].lineData[138] = 0;
  _$jscoverage['/selector.js'].lineData[139] = 0;
  _$jscoverage['/selector.js'].lineData[140] = 0;
  _$jscoverage['/selector.js'].lineData[141] = 0;
  _$jscoverage['/selector.js'].lineData[146] = 0;
  _$jscoverage['/selector.js'].lineData[149] = 0;
  _$jscoverage['/selector.js'].lineData[152] = 0;
  _$jscoverage['/selector.js'].lineData[153] = 0;
  _$jscoverage['/selector.js'].lineData[155] = 0;
  _$jscoverage['/selector.js'].lineData[157] = 0;
  _$jscoverage['/selector.js'].lineData[158] = 0;
  _$jscoverage['/selector.js'].lineData[163] = 0;
  _$jscoverage['/selector.js'].lineData[164] = 0;
  _$jscoverage['/selector.js'].lineData[165] = 0;
  _$jscoverage['/selector.js'].lineData[166] = 0;
  _$jscoverage['/selector.js'].lineData[167] = 0;
  _$jscoverage['/selector.js'].lineData[168] = 0;
  _$jscoverage['/selector.js'].lineData[169] = 0;
  _$jscoverage['/selector.js'].lineData[174] = 0;
  _$jscoverage['/selector.js'].lineData[177] = 0;
  _$jscoverage['/selector.js'].lineData[180] = 0;
  _$jscoverage['/selector.js'].lineData[181] = 0;
  _$jscoverage['/selector.js'].lineData[183] = 0;
  _$jscoverage['/selector.js'].lineData[185] = 0;
  _$jscoverage['/selector.js'].lineData[186] = 0;
  _$jscoverage['/selector.js'].lineData[192] = 0;
  _$jscoverage['/selector.js'].lineData[193] = 0;
  _$jscoverage['/selector.js'].lineData[194] = 0;
  _$jscoverage['/selector.js'].lineData[195] = 0;
  _$jscoverage['/selector.js'].lineData[196] = 0;
  _$jscoverage['/selector.js'].lineData[197] = 0;
  _$jscoverage['/selector.js'].lineData[198] = 0;
  _$jscoverage['/selector.js'].lineData[203] = 0;
  _$jscoverage['/selector.js'].lineData[206] = 0;
  _$jscoverage['/selector.js'].lineData[209] = 0;
  _$jscoverage['/selector.js'].lineData[210] = 0;
  _$jscoverage['/selector.js'].lineData[212] = 0;
  _$jscoverage['/selector.js'].lineData[214] = 0;
  _$jscoverage['/selector.js'].lineData[215] = 0;
  _$jscoverage['/selector.js'].lineData[221] = 0;
  _$jscoverage['/selector.js'].lineData[222] = 0;
  _$jscoverage['/selector.js'].lineData[223] = 0;
  _$jscoverage['/selector.js'].lineData[224] = 0;
  _$jscoverage['/selector.js'].lineData[225] = 0;
  _$jscoverage['/selector.js'].lineData[226] = 0;
  _$jscoverage['/selector.js'].lineData[227] = 0;
  _$jscoverage['/selector.js'].lineData[232] = 0;
  _$jscoverage['/selector.js'].lineData[235] = 0;
  _$jscoverage['/selector.js'].lineData[236] = 0;
  _$jscoverage['/selector.js'].lineData[237] = 0;
  _$jscoverage['/selector.js'].lineData[238] = 0;
  _$jscoverage['/selector.js'].lineData[241] = 0;
  _$jscoverage['/selector.js'].lineData[242] = 0;
  _$jscoverage['/selector.js'].lineData[245] = 0;
  _$jscoverage['/selector.js'].lineData[248] = 0;
  _$jscoverage['/selector.js'].lineData[252] = 0;
  _$jscoverage['/selector.js'].lineData[254] = 0;
  _$jscoverage['/selector.js'].lineData[259] = 0;
  _$jscoverage['/selector.js'].lineData[260] = 0;
  _$jscoverage['/selector.js'].lineData[261] = 0;
  _$jscoverage['/selector.js'].lineData[265] = 0;
  _$jscoverage['/selector.js'].lineData[266] = 0;
  _$jscoverage['/selector.js'].lineData[269] = 0;
  _$jscoverage['/selector.js'].lineData[272] = 0;
  _$jscoverage['/selector.js'].lineData[276] = 0;
  _$jscoverage['/selector.js'].lineData[279] = 0;
  _$jscoverage['/selector.js'].lineData[282] = 0;
  _$jscoverage['/selector.js'].lineData[285] = 0;
  _$jscoverage['/selector.js'].lineData[288] = 0;
  _$jscoverage['/selector.js'].lineData[292] = 0;
  _$jscoverage['/selector.js'].lineData[296] = 0;
  _$jscoverage['/selector.js'].lineData[297] = 0;
  _$jscoverage['/selector.js'].lineData[301] = 0;
  _$jscoverage['/selector.js'].lineData[302] = 0;
  _$jscoverage['/selector.js'].lineData[305] = 0;
  _$jscoverage['/selector.js'].lineData[308] = 0;
  _$jscoverage['/selector.js'].lineData[311] = 0;
  _$jscoverage['/selector.js'].lineData[312] = 0;
  _$jscoverage['/selector.js'].lineData[317] = 0;
  _$jscoverage['/selector.js'].lineData[319] = 0;
  _$jscoverage['/selector.js'].lineData[320] = 0;
  _$jscoverage['/selector.js'].lineData[322] = 0;
  _$jscoverage['/selector.js'].lineData[325] = 0;
  _$jscoverage['/selector.js'].lineData[328] = 0;
  _$jscoverage['/selector.js'].lineData[331] = 0;
  _$jscoverage['/selector.js'].lineData[334] = 0;
  _$jscoverage['/selector.js'].lineData[337] = 0;
  _$jscoverage['/selector.js'].lineData[341] = 0;
  _$jscoverage['/selector.js'].lineData[345] = 0;
  _$jscoverage['/selector.js'].lineData[348] = 0;
  _$jscoverage['/selector.js'].lineData[349] = 0;
  _$jscoverage['/selector.js'].lineData[350] = 0;
  _$jscoverage['/selector.js'].lineData[352] = 0;
  _$jscoverage['/selector.js'].lineData[353] = 0;
  _$jscoverage['/selector.js'].lineData[354] = 0;
  _$jscoverage['/selector.js'].lineData[355] = 0;
  _$jscoverage['/selector.js'].lineData[356] = 0;
  _$jscoverage['/selector.js'].lineData[357] = 0;
  _$jscoverage['/selector.js'].lineData[358] = 0;
  _$jscoverage['/selector.js'].lineData[360] = 0;
  _$jscoverage['/selector.js'].lineData[361] = 0;
  _$jscoverage['/selector.js'].lineData[362] = 0;
  _$jscoverage['/selector.js'].lineData[365] = 0;
  _$jscoverage['/selector.js'].lineData[368] = 0;
  _$jscoverage['/selector.js'].lineData[369] = 0;
  _$jscoverage['/selector.js'].lineData[370] = 0;
  _$jscoverage['/selector.js'].lineData[371] = 0;
  _$jscoverage['/selector.js'].lineData[373] = 0;
  _$jscoverage['/selector.js'].lineData[375] = 0;
  _$jscoverage['/selector.js'].lineData[376] = 0;
  _$jscoverage['/selector.js'].lineData[377] = 0;
  _$jscoverage['/selector.js'].lineData[379] = 0;
  _$jscoverage['/selector.js'].lineData[381] = 0;
  _$jscoverage['/selector.js'].lineData[385] = 0;
  _$jscoverage['/selector.js'].lineData[402] = 0;
  _$jscoverage['/selector.js'].lineData[403] = 0;
  _$jscoverage['/selector.js'].lineData[404] = 0;
  _$jscoverage['/selector.js'].lineData[408] = 0;
  _$jscoverage['/selector.js'].lineData[409] = 0;
  _$jscoverage['/selector.js'].lineData[412] = 0;
  _$jscoverage['/selector.js'].lineData[414] = 0;
  _$jscoverage['/selector.js'].lineData[415] = 0;
  _$jscoverage['/selector.js'].lineData[416] = 0;
  _$jscoverage['/selector.js'].lineData[418] = 0;
  _$jscoverage['/selector.js'].lineData[419] = 0;
  _$jscoverage['/selector.js'].lineData[422] = 0;
  _$jscoverage['/selector.js'].lineData[423] = 0;
  _$jscoverage['/selector.js'].lineData[426] = 0;
  _$jscoverage['/selector.js'].lineData[431] = 0;
  _$jscoverage['/selector.js'].lineData[432] = 0;
  _$jscoverage['/selector.js'].lineData[435] = 0;
  _$jscoverage['/selector.js'].lineData[436] = 0;
  _$jscoverage['/selector.js'].lineData[437] = 0;
  _$jscoverage['/selector.js'].lineData[438] = 0;
  _$jscoverage['/selector.js'].lineData[439] = 0;
  _$jscoverage['/selector.js'].lineData[441] = 0;
  _$jscoverage['/selector.js'].lineData[442] = 0;
  _$jscoverage['/selector.js'].lineData[447] = 0;
  _$jscoverage['/selector.js'].lineData[451] = 0;
  _$jscoverage['/selector.js'].lineData[452] = 0;
  _$jscoverage['/selector.js'].lineData[457] = 0;
  _$jscoverage['/selector.js'].lineData[458] = 0;
  _$jscoverage['/selector.js'].lineData[459] = 0;
  _$jscoverage['/selector.js'].lineData[461] = 0;
  _$jscoverage['/selector.js'].lineData[462] = 0;
  _$jscoverage['/selector.js'].lineData[463] = 0;
  _$jscoverage['/selector.js'].lineData[465] = 0;
  _$jscoverage['/selector.js'].lineData[466] = 0;
  _$jscoverage['/selector.js'].lineData[467] = 0;
  _$jscoverage['/selector.js'].lineData[468] = 0;
  _$jscoverage['/selector.js'].lineData[475] = 0;
  _$jscoverage['/selector.js'].lineData[476] = 0;
  _$jscoverage['/selector.js'].lineData[478] = 0;
  _$jscoverage['/selector.js'].lineData[484] = 0;
  _$jscoverage['/selector.js'].lineData[493] = 0;
  _$jscoverage['/selector.js'].lineData[500] = 0;
  _$jscoverage['/selector.js'].lineData[501] = 0;
  _$jscoverage['/selector.js'].lineData[504] = 0;
  _$jscoverage['/selector.js'].lineData[505] = 0;
  _$jscoverage['/selector.js'].lineData[506] = 0;
  _$jscoverage['/selector.js'].lineData[508] = 0;
  _$jscoverage['/selector.js'].lineData[509] = 0;
  _$jscoverage['/selector.js'].lineData[510] = 0;
  _$jscoverage['/selector.js'].lineData[512] = 0;
  _$jscoverage['/selector.js'].lineData[513] = 0;
  _$jscoverage['/selector.js'].lineData[515] = 0;
  _$jscoverage['/selector.js'].lineData[516] = 0;
  _$jscoverage['/selector.js'].lineData[518] = 0;
  _$jscoverage['/selector.js'].lineData[524] = 0;
  _$jscoverage['/selector.js'].lineData[525] = 0;
  _$jscoverage['/selector.js'].lineData[527] = 0;
  _$jscoverage['/selector.js'].lineData[528] = 0;
  _$jscoverage['/selector.js'].lineData[529] = 0;
  _$jscoverage['/selector.js'].lineData[532] = 0;
  _$jscoverage['/selector.js'].lineData[533] = 0;
  _$jscoverage['/selector.js'].lineData[537] = 0;
  _$jscoverage['/selector.js'].lineData[540] = 0;
  _$jscoverage['/selector.js'].lineData[541] = 0;
  _$jscoverage['/selector.js'].lineData[543] = 0;
  _$jscoverage['/selector.js'].lineData[544] = 0;
  _$jscoverage['/selector.js'].lineData[545] = 0;
  _$jscoverage['/selector.js'].lineData[547] = 0;
  _$jscoverage['/selector.js'].lineData[548] = 0;
  _$jscoverage['/selector.js'].lineData[553] = 0;
  _$jscoverage['/selector.js'].lineData[554] = 0;
  _$jscoverage['/selector.js'].lineData[555] = 0;
  _$jscoverage['/selector.js'].lineData[556] = 0;
  _$jscoverage['/selector.js'].lineData[558] = 0;
  _$jscoverage['/selector.js'].lineData[559] = 0;
  _$jscoverage['/selector.js'].lineData[560] = 0;
  _$jscoverage['/selector.js'].lineData[561] = 0;
  _$jscoverage['/selector.js'].lineData[562] = 0;
  _$jscoverage['/selector.js'].lineData[564] = 0;
  _$jscoverage['/selector.js'].lineData[566] = 0;
  _$jscoverage['/selector.js'].lineData[570] = 0;
  _$jscoverage['/selector.js'].lineData[571] = 0;
  _$jscoverage['/selector.js'].lineData[572] = 0;
  _$jscoverage['/selector.js'].lineData[575] = 0;
  _$jscoverage['/selector.js'].lineData[582] = 0;
  _$jscoverage['/selector.js'].lineData[583] = 0;
  _$jscoverage['/selector.js'].lineData[586] = 0;
  _$jscoverage['/selector.js'].lineData[588] = 0;
  _$jscoverage['/selector.js'].lineData[590] = 0;
  _$jscoverage['/selector.js'].lineData[592] = 0;
  _$jscoverage['/selector.js'].lineData[593] = 0;
  _$jscoverage['/selector.js'].lineData[595] = 0;
  _$jscoverage['/selector.js'].lineData[597] = 0;
  _$jscoverage['/selector.js'].lineData[605] = 0;
  _$jscoverage['/selector.js'].lineData[606] = 0;
  _$jscoverage['/selector.js'].lineData[607] = 0;
  _$jscoverage['/selector.js'].lineData[608] = 0;
  _$jscoverage['/selector.js'].lineData[609] = 0;
  _$jscoverage['/selector.js'].lineData[610] = 0;
  _$jscoverage['/selector.js'].lineData[611] = 0;
  _$jscoverage['/selector.js'].lineData[612] = 0;
  _$jscoverage['/selector.js'].lineData[613] = 0;
  _$jscoverage['/selector.js'].lineData[618] = 0;
  _$jscoverage['/selector.js'].lineData[620] = 0;
  _$jscoverage['/selector.js'].lineData[629] = 0;
  _$jscoverage['/selector.js'].lineData[630] = 0;
  _$jscoverage['/selector.js'].lineData[633] = 0;
  _$jscoverage['/selector.js'].lineData[634] = 0;
  _$jscoverage['/selector.js'].lineData[635] = 0;
  _$jscoverage['/selector.js'].lineData[636] = 0;
  _$jscoverage['/selector.js'].lineData[637] = 0;
  _$jscoverage['/selector.js'].lineData[640] = 0;
  _$jscoverage['/selector.js'].lineData[641] = 0;
  _$jscoverage['/selector.js'].lineData[644] = 0;
  _$jscoverage['/selector.js'].lineData[645] = 0;
  _$jscoverage['/selector.js'].lineData[647] = 0;
  _$jscoverage['/selector.js'].lineData[650] = 0;
  _$jscoverage['/selector.js'].lineData[654] = 0;
  _$jscoverage['/selector.js'].lineData[655] = 0;
  _$jscoverage['/selector.js'].lineData[657] = 0;
  _$jscoverage['/selector.js'].lineData[658] = 0;
  _$jscoverage['/selector.js'].lineData[661] = 0;
  _$jscoverage['/selector.js'].lineData[662] = 0;
  _$jscoverage['/selector.js'].lineData[663] = 0;
  _$jscoverage['/selector.js'].lineData[664] = 0;
  _$jscoverage['/selector.js'].lineData[665] = 0;
  _$jscoverage['/selector.js'].lineData[666] = 0;
  _$jscoverage['/selector.js'].lineData[667] = 0;
  _$jscoverage['/selector.js'].lineData[668] = 0;
  _$jscoverage['/selector.js'].lineData[674] = 0;
  _$jscoverage['/selector.js'].lineData[675] = 0;
  _$jscoverage['/selector.js'].lineData[678] = 0;
  _$jscoverage['/selector.js'].lineData[681] = 0;
  _$jscoverage['/selector.js'].lineData[683] = 0;
  _$jscoverage['/selector.js'].lineData[685] = 0;
}
if (! _$jscoverage['/selector.js'].functionData) {
  _$jscoverage['/selector.js'].functionData = [];
  _$jscoverage['/selector.js'].functionData[0] = 0;
  _$jscoverage['/selector.js'].functionData[1] = 0;
  _$jscoverage['/selector.js'].functionData[2] = 0;
  _$jscoverage['/selector.js'].functionData[3] = 0;
  _$jscoverage['/selector.js'].functionData[4] = 0;
  _$jscoverage['/selector.js'].functionData[5] = 0;
  _$jscoverage['/selector.js'].functionData[6] = 0;
  _$jscoverage['/selector.js'].functionData[7] = 0;
  _$jscoverage['/selector.js'].functionData[8] = 0;
  _$jscoverage['/selector.js'].functionData[9] = 0;
  _$jscoverage['/selector.js'].functionData[10] = 0;
  _$jscoverage['/selector.js'].functionData[11] = 0;
  _$jscoverage['/selector.js'].functionData[12] = 0;
  _$jscoverage['/selector.js'].functionData[13] = 0;
  _$jscoverage['/selector.js'].functionData[14] = 0;
  _$jscoverage['/selector.js'].functionData[15] = 0;
  _$jscoverage['/selector.js'].functionData[16] = 0;
  _$jscoverage['/selector.js'].functionData[17] = 0;
  _$jscoverage['/selector.js'].functionData[18] = 0;
  _$jscoverage['/selector.js'].functionData[19] = 0;
  _$jscoverage['/selector.js'].functionData[20] = 0;
  _$jscoverage['/selector.js'].functionData[21] = 0;
  _$jscoverage['/selector.js'].functionData[22] = 0;
  _$jscoverage['/selector.js'].functionData[23] = 0;
  _$jscoverage['/selector.js'].functionData[24] = 0;
  _$jscoverage['/selector.js'].functionData[25] = 0;
  _$jscoverage['/selector.js'].functionData[26] = 0;
  _$jscoverage['/selector.js'].functionData[27] = 0;
  _$jscoverage['/selector.js'].functionData[28] = 0;
  _$jscoverage['/selector.js'].functionData[29] = 0;
  _$jscoverage['/selector.js'].functionData[30] = 0;
  _$jscoverage['/selector.js'].functionData[31] = 0;
  _$jscoverage['/selector.js'].functionData[32] = 0;
  _$jscoverage['/selector.js'].functionData[33] = 0;
  _$jscoverage['/selector.js'].functionData[34] = 0;
  _$jscoverage['/selector.js'].functionData[35] = 0;
  _$jscoverage['/selector.js'].functionData[36] = 0;
  _$jscoverage['/selector.js'].functionData[37] = 0;
  _$jscoverage['/selector.js'].functionData[38] = 0;
  _$jscoverage['/selector.js'].functionData[39] = 0;
  _$jscoverage['/selector.js'].functionData[40] = 0;
  _$jscoverage['/selector.js'].functionData[41] = 0;
  _$jscoverage['/selector.js'].functionData[42] = 0;
  _$jscoverage['/selector.js'].functionData[43] = 0;
  _$jscoverage['/selector.js'].functionData[44] = 0;
  _$jscoverage['/selector.js'].functionData[45] = 0;
  _$jscoverage['/selector.js'].functionData[46] = 0;
  _$jscoverage['/selector.js'].functionData[47] = 0;
}
if (! _$jscoverage['/selector.js'].branchData) {
  _$jscoverage['/selector.js'].branchData = {};
  _$jscoverage['/selector.js'].branchData['21'] = [];
  _$jscoverage['/selector.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['39'] = [];
  _$jscoverage['/selector.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['63'] = [];
  _$jscoverage['/selector.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['63'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['71'] = [];
  _$jscoverage['/selector.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['74'] = [];
  _$jscoverage['/selector.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['77'] = [];
  _$jscoverage['/selector.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['81'] = [];
  _$jscoverage['/selector.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['83'] = [];
  _$jscoverage['/selector.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['84'] = [];
  _$jscoverage['/selector.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['93'] = [];
  _$jscoverage['/selector.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['102'] = [];
  _$jscoverage['/selector.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['103'] = [];
  _$jscoverage['/selector.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['107'] = [];
  _$jscoverage['/selector.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['107'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['107'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['107'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['115'] = [];
  _$jscoverage['/selector.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['116'] = [];
  _$jscoverage['/selector.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['124'] = [];
  _$jscoverage['/selector.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['124'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['124'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['129'] = [];
  _$jscoverage['/selector.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['135'] = [];
  _$jscoverage['/selector.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['137'] = [];
  _$jscoverage['/selector.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['139'] = [];
  _$jscoverage['/selector.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['140'] = [];
  _$jscoverage['/selector.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['152'] = [];
  _$jscoverage['/selector.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['152'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['152'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['157'] = [];
  _$jscoverage['/selector.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['163'] = [];
  _$jscoverage['/selector.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['165'] = [];
  _$jscoverage['/selector.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['167'] = [];
  _$jscoverage['/selector.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['168'] = [];
  _$jscoverage['/selector.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['180'] = [];
  _$jscoverage['/selector.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['180'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['180'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['185'] = [];
  _$jscoverage['/selector.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['192'] = [];
  _$jscoverage['/selector.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['194'] = [];
  _$jscoverage['/selector.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['196'] = [];
  _$jscoverage['/selector.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['197'] = [];
  _$jscoverage['/selector.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['209'] = [];
  _$jscoverage['/selector.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['209'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['209'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['214'] = [];
  _$jscoverage['/selector.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['221'] = [];
  _$jscoverage['/selector.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['223'] = [];
  _$jscoverage['/selector.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['225'] = [];
  _$jscoverage['/selector.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['226'] = [];
  _$jscoverage['/selector.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['239'] = [];
  _$jscoverage['/selector.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['242'] = [];
  _$jscoverage['/selector.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['242'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['242'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['244'] = [];
  _$jscoverage['/selector.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['244'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['259'] = [];
  _$jscoverage['/selector.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['265'] = [];
  _$jscoverage['/selector.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['265'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['265'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['265'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['265'][5] = new BranchData();
  _$jscoverage['/selector.js'].branchData['265'][6] = new BranchData();
  _$jscoverage['/selector.js'].branchData['265'][7] = new BranchData();
  _$jscoverage['/selector.js'].branchData['272'] = [];
  _$jscoverage['/selector.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['273'] = [];
  _$jscoverage['/selector.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['288'] = [];
  _$jscoverage['/selector.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['292'] = [];
  _$jscoverage['/selector.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['297'] = [];
  _$jscoverage['/selector.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['297'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['297'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['298'] = [];
  _$jscoverage['/selector.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['298'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['298'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['298'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['298'][5] = new BranchData();
  _$jscoverage['/selector.js'].branchData['302'] = [];
  _$jscoverage['/selector.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['312'] = [];
  _$jscoverage['/selector.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['312'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['312'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['313'] = [];
  _$jscoverage['/selector.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['313'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['319'] = [];
  _$jscoverage['/selector.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['319'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['322'] = [];
  _$jscoverage['/selector.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['325'] = [];
  _$jscoverage['/selector.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['328'] = [];
  _$jscoverage['/selector.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['331'] = [];
  _$jscoverage['/selector.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['334'] = [];
  _$jscoverage['/selector.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['334'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['337'] = [];
  _$jscoverage['/selector.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['345'] = [];
  _$jscoverage['/selector.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['349'] = [];
  _$jscoverage['/selector.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['354'] = [];
  _$jscoverage['/selector.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['354'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['356'] = [];
  _$jscoverage['/selector.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['357'] = [];
  _$jscoverage['/selector.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['361'] = [];
  _$jscoverage['/selector.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['370'] = [];
  _$jscoverage['/selector.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['376'] = [];
  _$jscoverage['/selector.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['402'] = [];
  _$jscoverage['/selector.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['415'] = [];
  _$jscoverage['/selector.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['418'] = [];
  _$jscoverage['/selector.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['422'] = [];
  _$jscoverage['/selector.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['431'] = [];
  _$jscoverage['/selector.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['435'] = [];
  _$jscoverage['/selector.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['438'] = [];
  _$jscoverage['/selector.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['438'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['441'] = [];
  _$jscoverage['/selector.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['459'] = [];
  _$jscoverage['/selector.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['461'] = [];
  _$jscoverage['/selector.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['462'] = [];
  _$jscoverage['/selector.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['467'] = [];
  _$jscoverage['/selector.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['476'] = [];
  _$jscoverage['/selector.js'].branchData['476'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['485'] = [];
  _$jscoverage['/selector.js'].branchData['485'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['505'] = [];
  _$jscoverage['/selector.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['509'] = [];
  _$jscoverage['/selector.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['514'] = [];
  _$jscoverage['/selector.js'].branchData['514'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['515'] = [];
  _$jscoverage['/selector.js'].branchData['515'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['527'] = [];
  _$jscoverage['/selector.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['528'] = [];
  _$jscoverage['/selector.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['532'] = [];
  _$jscoverage['/selector.js'].branchData['532'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['543'] = [];
  _$jscoverage['/selector.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['544'] = [];
  _$jscoverage['/selector.js'].branchData['544'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['555'] = [];
  _$jscoverage['/selector.js'].branchData['555'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['561'] = [];
  _$jscoverage['/selector.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['571'] = [];
  _$jscoverage['/selector.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['582'] = [];
  _$jscoverage['/selector.js'].branchData['582'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['583'] = [];
  _$jscoverage['/selector.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['586'] = [];
  _$jscoverage['/selector.js'].branchData['586'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['586'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['588'] = [];
  _$jscoverage['/selector.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['592'] = [];
  _$jscoverage['/selector.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['605'] = [];
  _$jscoverage['/selector.js'].branchData['605'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['606'] = [];
  _$jscoverage['/selector.js'].branchData['606'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['609'] = [];
  _$jscoverage['/selector.js'].branchData['609'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['611'] = [];
  _$jscoverage['/selector.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['618'] = [];
  _$jscoverage['/selector.js'].branchData['618'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['629'] = [];
  _$jscoverage['/selector.js'].branchData['629'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['629'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['629'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['629'][4] = new BranchData();
  _$jscoverage['/selector.js'].branchData['633'] = [];
  _$jscoverage['/selector.js'].branchData['633'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['635'] = [];
  _$jscoverage['/selector.js'].branchData['635'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['640'] = [];
  _$jscoverage['/selector.js'].branchData['640'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['644'] = [];
  _$jscoverage['/selector.js'].branchData['644'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['644'][2] = new BranchData();
  _$jscoverage['/selector.js'].branchData['644'][3] = new BranchData();
  _$jscoverage['/selector.js'].branchData['650'] = [];
  _$jscoverage['/selector.js'].branchData['650'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['657'] = [];
  _$jscoverage['/selector.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['661'] = [];
  _$jscoverage['/selector.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['664'] = [];
  _$jscoverage['/selector.js'].branchData['664'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['666'] = [];
  _$jscoverage['/selector.js'].branchData['666'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['667'] = [];
  _$jscoverage['/selector.js'].branchData['667'][1] = new BranchData();
  _$jscoverage['/selector.js'].branchData['674'] = [];
  _$jscoverage['/selector.js'].branchData['674'][1] = new BranchData();
}
_$jscoverage['/selector.js'].branchData['674'][1].init(3792, 12, 'groupLen > 1');
function visit193_674_1(result) {
  _$jscoverage['/selector.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['667'][1].init(26, 39, 'matchSub(matchHead.el, matchHead.match)');
function visit192_667_1(result) {
  _$jscoverage['/selector.js'].branchData['667'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['666'][1].init(229, 9, 'matchHead');
function visit191_666_1(result) {
  _$jscoverage['/selector.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['664'][1].init(141, 18, 'matchHead === true');
function visit190_664_1(result) {
  _$jscoverage['/selector.js'].branchData['664'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['661'][1].init(2737, 21, 'seedsIndex < seedsLen');
function visit189_661_1(result) {
  _$jscoverage['/selector.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['657'][1].init(2660, 9, '!seedsLen');
function visit188_657_1(result) {
  _$jscoverage['/selector.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['650'][1].init(58, 18, 'group.value || \'*\'');
function visit187_650_1(result) {
  _$jscoverage['/selector.js'].branchData['650'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['644'][3].init(53, 27, 'context !== contextDocument');
function visit186_644_3(result) {
  _$jscoverage['/selector.js'].branchData['644'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['644'][2].init(46, 34, 'tmp && context !== contextDocument');
function visit185_644_2(result) {
  _$jscoverage['/selector.js'].branchData['644'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['644'][1].init(30, 50, 'contextInDom && tmp && context !== contextDocument');
function visit184_644_1(result) {
  _$jscoverage['/selector.js'].branchData['644'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['640'][1].init(511, 15, 'tmpI === tmpLen');
function visit183_640_1(result) {
  _$jscoverage['/selector.js'].branchData['640'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['635'][1].init(81, 25, 'getAttr(tmp, \'id\') === id');
function visit182_635_1(result) {
  _$jscoverage['/selector.js'].branchData['635'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['633'][1].init(200, 13, 'tmpI < tmpLen');
function visit181_633_1(result) {
  _$jscoverage['/selector.js'].branchData['633'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['629'][4].init(667, 25, 'getAttr(tmp, \'id\') !== id');
function visit180_629_4(result) {
  _$jscoverage['/selector.js'].branchData['629'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['629'][3].init(660, 32, 'tmp && getAttr(tmp, \'id\') !== id');
function visit179_629_3(result) {
  _$jscoverage['/selector.js'].branchData['629'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['629'][2].init(634, 22, '!tmp && doesNotHasById');
function visit178_629_2(result) {
  _$jscoverage['/selector.js'].branchData['629'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['629'][1].init(634, 58, '!tmp && doesNotHasById || tmp && getAttr(tmp, \'id\') !== id');
function visit177_629_1(result) {
  _$jscoverage['/selector.js'].branchData['629'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['618'][1].init(508, 2, 'id');
function visit176_618_1(result) {
  _$jscoverage['/selector.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['611'][1].init(95, 23, 'singleSuffix.t === \'id\'');
function visit175_611_1(result) {
  _$jscoverage['/selector.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['609'][1].init(115, 23, 'suffixIndex < suffixLen');
function visit174_609_1(result) {
  _$jscoverage['/selector.js'].branchData['609'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['606'][1].init(22, 23, 'suffix && !isContextXML');
function visit173_606_1(result) {
  _$jscoverage['/selector.js'].branchData['606'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['605'][1].init(311, 8, '!mySeeds');
function visit172_605_1(result) {
  _$jscoverage['/selector.js'].branchData['605'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['592'][1].init(546, 21, 'groupIndex < groupLen');
function visit171_592_1(result) {
  _$jscoverage['/selector.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['588'][1].init(458, 26, 'context || contextDocument');
function visit170_588_1(result) {
  _$jscoverage['/selector.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['586'][2].init(391, 32, 'context && context.ownerDocument');
function visit169_586_2(result) {
  _$jscoverage['/selector.js'].branchData['586'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['586'][1].init(391, 44, 'context && context.ownerDocument || document');
function visit168_586_1(result) {
  _$jscoverage['/selector.js'].branchData['586'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['583'][1].init(24, 33, 'context || seeds[0].ownerDocument');
function visit167_583_1(result) {
  _$jscoverage['/selector.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['582'][1].init(284, 5, 'seeds');
function visit166_582_1(result) {
  _$jscoverage['/selector.js'].branchData['582'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['571'][1].init(14, 12, '!caches[str]');
function visit165_571_1(result) {
  _$jscoverage['/selector.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['561'][1].init(22, 19, 'matchSub(el, match)');
function visit164_561_1(result) {
  _$jscoverage['/selector.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['555'][1].init(74, 26, 'matchImmediateRet === true');
function visit163_555_1(result) {
  _$jscoverage['/selector.js'].branchData['555'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['544'][1].init(133, 27, 'matchKey in subMatchesCache');
function visit162_544_1(result) {
  _$jscoverage['/selector.js'].branchData['544'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['543'][1].init(101, 16, 'match.order || 0');
function visit161_543_1(result) {
  _$jscoverage['/selector.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['532'][1].init(18, 40, '!(selectorId = el[EXPANDO_SELECTOR_KEY])');
function visit160_532_1(result) {
  _$jscoverage['/selector.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['528'][1].init(18, 53, '!(selectorId = el.getAttribute(EXPANDO_SELECTOR_KEY))');
function visit159_528_1(result) {
  _$jscoverage['/selector.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['527'][1].init(41, 12, 'isContextXML');
function visit158_527_1(result) {
  _$jscoverage['/selector.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['515'][1].init(416, 3, '!el');
function visit157_515_1(result) {
  _$jscoverage['/selector.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['514'][1].init(311, 26, 'el && relativeOp.immediate');
function visit156_514_1(result) {
  _$jscoverage['/selector.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['509'][1].init(134, 4, '!cur');
function visit155_509_1(result) {
  _$jscoverage['/selector.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['505'][1].init(18, 21, '!singleMatch(el, cur)');
function visit154_505_1(result) {
  _$jscoverage['/selector.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['485'][1].init(30, 29, 'el && dir(el, relativeOp.dir)');
function visit153_485_1(result) {
  _$jscoverage['/selector.js'].branchData['485'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['476'][1].init(88, 20, 'relativeOp.immediate');
function visit152_476_1(result) {
  _$jscoverage['/selector.js'].branchData['476'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['467'][1].init(293, 21, '!relativeOp.immediate');
function visit151_467_1(result) {
  _$jscoverage['/selector.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['462'][1].init(96, 6, '!match');
function visit150_462_1(result) {
  _$jscoverage['/selector.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['461'][1].init(54, 19, 'match && match.prev');
function visit149_461_1(result) {
  _$jscoverage['/selector.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['459'][1].init(66, 7, 'matched');
function visit148_459_1(result) {
  _$jscoverage['/selector.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['441'][1].init(160, 32, 'matchExpr[singleMatchSuffixType]');
function visit147_441_1(result) {
  _$jscoverage['/selector.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['438'][2].init(117, 33, 'matchSuffixIndex < matchSuffixLen');
function visit146_438_2(result) {
  _$jscoverage['/selector.js'].branchData['438'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['438'][1].init(106, 44, 'matched && matchSuffixIndex < matchSuffixLen');
function visit145_438_1(result) {
  _$jscoverage['/selector.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['435'][1].init(440, 22, 'matched && matchSuffix');
function visit144_435_1(result) {
  _$jscoverage['/selector.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['431'][1].init(337, 17, 'match.t === \'tag\'');
function visit143_431_1(result) {
  _$jscoverage['/selector.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['422'][1].init(134, 17, 'el.nodeType === 9');
function visit142_422_1(result) {
  _$jscoverage['/selector.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['418'][1].init(74, 3, '!el');
function visit141_418_1(result) {
  _$jscoverage['/selector.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['415'][1].init(14, 6, '!match');
function visit140_415_1(result) {
  _$jscoverage['/selector.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['402'][1].init(13043, 41, '\'sourceIndex\' in document.documentElement');
function visit139_402_1(result) {
  _$jscoverage['/selector.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['376'][1].init(22, 23, '!pseudoIdentExpr[ident]');
function visit138_376_1(result) {
  _$jscoverage['/selector.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['370'][1].init(22, 27, '!(fn = pseudoFnExpr[fnStr])');
function visit137_370_1(result) {
  _$jscoverage['/selector.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['361'][1].init(168, 7, 'matchFn');
function visit136_361_1(result) {
  _$jscoverage['/selector.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['357'][1].init(22, 21, 'elValue === undefined');
function visit135_357_1(result) {
  _$jscoverage['/selector.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['356'][1].init(319, 5, 'match');
function visit134_356_1(result) {
  _$jscoverage['/selector.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['354'][2].init(242, 21, 'elValue !== undefined');
function visit133_354_2(result) {
  _$jscoverage['/selector.js'].branchData['354'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['354'][1].init(232, 31, '!match && elValue !== undefined');
function visit132_354_1(result) {
  _$jscoverage['/selector.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['349'][1].init(55, 13, '!isContextXML');
function visit131_349_1(result) {
  _$jscoverage['/selector.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['345'][1].init(21, 27, 'getAttr(el, \'id\') === value');
function visit130_345_1(result) {
  _$jscoverage['/selector.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['337'][1].init(21, 17, 'elValue === value');
function visit129_337_1(result) {
  _$jscoverage['/selector.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['334'][2].init(30, 29, 'elValue.indexOf(value) !== -1');
function visit128_334_2(result) {
  _$jscoverage['/selector.js'].branchData['334'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['334'][1].init(21, 38, 'value && elValue.indexOf(value) !== -1');
function visit127_334_1(result) {
  _$jscoverage['/selector.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['331'][1].init(21, 35, 'value && S.endsWith(elValue, value)');
function visit126_331_1(result) {
  _$jscoverage['/selector.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['328'][1].init(21, 37, 'value && S.startsWith(elValue, value)');
function visit125_328_1(result) {
  _$jscoverage['/selector.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['325'][1].init(22, 48, '(\' \' + elValue).indexOf(\' \' + value + \'-\') !== -1');
function visit124_325_1(result) {
  _$jscoverage['/selector.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['322'][1].init(118, 54, '(\' \' + elValue + \' \').indexOf(\' \' + value + \' \') !== -1');
function visit123_322_1(result) {
  _$jscoverage['/selector.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['319'][2].init(28, 23, 'value.indexOf(\' \') > -1');
function visit122_319_2(result) {
  _$jscoverage['/selector.js'].branchData['319'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['319'][1].init(18, 33, '!value || value.indexOf(\' \') > -1');
function visit121_319_1(result) {
  _$jscoverage['/selector.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['313'][2].init(56, 21, 'nodeName === \'option\'');
function visit120_313_2(result) {
  _$jscoverage['/selector.js'].branchData['313'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['313'][1].init(56, 36, 'nodeName === \'option\' && el.selected');
function visit119_313_1(result) {
  _$jscoverage['/selector.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['312'][3].init(77, 20, 'nodeName === \'input\'');
function visit118_312_3(result) {
  _$jscoverage['/selector.js'].branchData['312'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['312'][2].init(77, 34, 'nodeName === \'input\' && el.checked');
function visit117_312_2(result) {
  _$jscoverage['/selector.js'].branchData['312'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['312'][1].init(77, 94, '(nodeName === \'input\' && el.checked) || (nodeName === \'option\' && el.selected)');
function visit116_312_1(result) {
  _$jscoverage['/selector.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['302'][2].init(68, 35, 'hash.slice(1) === getAttr(el, \'id\')');
function visit115_302_2(result) {
  _$jscoverage['/selector.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['302'][1].init(60, 43, 'hash && hash.slice(1) === getAttr(el, \'id\')');
function visit114_302_1(result) {
  _$jscoverage['/selector.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['298'][5].init(179, 16, 'el.tabIndex >= 0');
function visit113_298_5(result) {
  _$jscoverage['/selector.js'].branchData['298'][5].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['298'][4].init(168, 27, 'el.href || el.tabIndex >= 0');
function visit112_298_4(result) {
  _$jscoverage['/selector.js'].branchData['298'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['298'][3].init(157, 38, 'el.type || el.href || el.tabIndex >= 0');
function visit111_298_3(result) {
  _$jscoverage['/selector.js'].branchData['298'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['298'][2].init(118, 31, '!doc.hasFocus || doc.hasFocus()');
function visit110_298_2(result) {
  _$jscoverage['/selector.js'].branchData['298'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['298'][1].init(45, 78, '(!doc.hasFocus || doc.hasFocus()) && !!(el.type || el.href || el.tabIndex >= 0)');
function visit109_298_1(result) {
  _$jscoverage['/selector.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['297'][3].init(69, 24, 'el === doc.activeElement');
function visit108_297_3(result) {
  _$jscoverage['/selector.js'].branchData['297'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['297'][2].init(69, 124, 'el === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(el.type || el.href || el.tabIndex >= 0)');
function visit107_297_2(result) {
  _$jscoverage['/selector.js'].branchData['297'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['297'][1].init(62, 131, 'doc && el === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(el.type || el.href || el.tabIndex >= 0)');
function visit106_297_1(result) {
  _$jscoverage['/selector.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['292'][1].init(21, 92, 'pseudoIdentExpr[\'first-of-type\'](el) && pseudoIdentExpr[\'last-of-type\'](el)');
function visit105_292_1(result) {
  _$jscoverage['/selector.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['288'][1].init(21, 88, 'pseudoIdentExpr[\'first-child\'](el) && pseudoIdentExpr[\'last-child\'](el)');
function visit104_288_1(result) {
  _$jscoverage['/selector.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['273'][1].init(36, 39, 'el === el.ownerDocument.documentElement');
function visit103_273_1(result) {
  _$jscoverage['/selector.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['272'][1].init(21, 76, 'el.ownerDocument && el === el.ownerDocument.documentElement');
function visit102_272_1(result) {
  _$jscoverage['/selector.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['265'][7].init(340, 14, 'nodeType === 5');
function visit101_265_7(result) {
  _$jscoverage['/selector.js'].branchData['265'][7].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['265'][6].init(322, 14, 'nodeType === 4');
function visit100_265_6(result) {
  _$jscoverage['/selector.js'].branchData['265'][6].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['265'][5].init(322, 32, 'nodeType === 4 || nodeType === 5');
function visit99_265_5(result) {
  _$jscoverage['/selector.js'].branchData['265'][5].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['265'][4].init(304, 14, 'nodeType === 3');
function visit98_265_4(result) {
  _$jscoverage['/selector.js'].branchData['265'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['265'][3].init(304, 50, 'nodeType === 3 || nodeType === 4 || nodeType === 5');
function visit97_265_3(result) {
  _$jscoverage['/selector.js'].branchData['265'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['265'][2].init(286, 14, 'nodeType === 1');
function visit96_265_2(result) {
  _$jscoverage['/selector.js'].branchData['265'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['265'][1].init(286, 68, 'nodeType === 1 || nodeType === 3 || nodeType === 4 || nodeType === 5');
function visit95_265_1(result) {
  _$jscoverage['/selector.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['259'][1].init(191, 11, 'index < len');
function visit94_259_1(result) {
  _$jscoverage['/selector.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['244'][2].init(452, 17, 'el.nodeType === 1');
function visit93_244_2(result) {
  _$jscoverage['/selector.js'].branchData['244'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['244'][1].init(338, 40, '(el = el.parentNode) && el.nodeType === 1');
function visit92_244_1(result) {
  _$jscoverage['/selector.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['242'][3].init(100, 32, 'elLang.indexOf(lang + \'-\') === 0');
function visit91_242_3(result) {
  _$jscoverage['/selector.js'].branchData['242'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['242'][2].init(81, 15, 'elLang === lang');
function visit90_242_2(result) {
  _$jscoverage['/selector.js'].branchData['242'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['242'][1].init(81, 51, 'elLang === lang || elLang.indexOf(lang + \'-\') === 0');
function visit89_242_1(result) {
  _$jscoverage['/selector.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['239'][1].init(35, 54, 'el.getAttribute(\'xml:lang\') || el.getAttribute(\'lang\')');
function visit88_239_1(result) {
  _$jscoverage['/selector.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['226'][1].init(138, 17, 'ret !== undefined');
function visit87_226_1(result) {
  _$jscoverage['/selector.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['225'][1].init(94, 12, 'child === el');
function visit86_225_1(result) {
  _$jscoverage['/selector.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['223'][1].init(74, 24, 'child.tagName === elType');
function visit85_223_1(result) {
  _$jscoverage['/selector.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['221'][1].init(258, 10, 'count >= 0');
function visit84_221_1(result) {
  _$jscoverage['/selector.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['214'][1].init(258, 6, 'parent');
function visit83_214_1(result) {
  _$jscoverage['/selector.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['209'][3].init(119, 7, 'b === 0');
function visit82_209_3(result) {
  _$jscoverage['/selector.js'].branchData['209'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['209'][2].init(108, 7, 'a === 0');
function visit81_209_2(result) {
  _$jscoverage['/selector.js'].branchData['209'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['209'][1].init(108, 18, 'a === 0 && b === 0');
function visit80_209_1(result) {
  _$jscoverage['/selector.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['197'][1].init(138, 17, 'ret !== undefined');
function visit79_197_1(result) {
  _$jscoverage['/selector.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['196'][1].init(94, 12, 'child === el');
function visit78_196_1(result) {
  _$jscoverage['/selector.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['194'][1].init(74, 24, 'child.tagName === elType');
function visit77_194_1(result) {
  _$jscoverage['/selector.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['192'][1].init(252, 11, 'count < len');
function visit76_192_1(result) {
  _$jscoverage['/selector.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['185'][1].init(258, 6, 'parent');
function visit75_185_1(result) {
  _$jscoverage['/selector.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['180'][3].init(119, 7, 'b === 0');
function visit74_180_3(result) {
  _$jscoverage['/selector.js'].branchData['180'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['180'][2].init(108, 7, 'a === 0');
function visit73_180_2(result) {
  _$jscoverage['/selector.js'].branchData['180'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['180'][1].init(108, 18, 'a === 0 && b === 0');
function visit72_180_1(result) {
  _$jscoverage['/selector.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['168'][1].init(138, 17, 'ret !== undefined');
function visit71_168_1(result) {
  _$jscoverage['/selector.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['167'][1].init(94, 12, 'child === el');
function visit70_167_1(result) {
  _$jscoverage['/selector.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['165'][1].init(74, 20, 'child.nodeType === 1');
function visit69_165_1(result) {
  _$jscoverage['/selector.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['163'][1].init(216, 10, 'count >= 0');
function visit68_163_1(result) {
  _$jscoverage['/selector.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['157'][1].init(258, 6, 'parent');
function visit67_157_1(result) {
  _$jscoverage['/selector.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['152'][3].init(119, 7, 'b === 0');
function visit66_152_3(result) {
  _$jscoverage['/selector.js'].branchData['152'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['152'][2].init(108, 7, 'a === 0');
function visit65_152_2(result) {
  _$jscoverage['/selector.js'].branchData['152'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['152'][1].init(108, 18, 'a === 0 && b === 0');
function visit64_152_1(result) {
  _$jscoverage['/selector.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['140'][1].init(138, 17, 'ret !== undefined');
function visit63_140_1(result) {
  _$jscoverage['/selector.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['139'][1].init(94, 12, 'child === el');
function visit62_139_1(result) {
  _$jscoverage['/selector.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['137'][1].init(74, 20, 'child.nodeType === 1');
function visit61_137_1(result) {
  _$jscoverage['/selector.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['135'][1].init(210, 11, 'count < len');
function visit60_135_1(result) {
  _$jscoverage['/selector.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['129'][1].init(258, 6, 'parent');
function visit59_129_1(result) {
  _$jscoverage['/selector.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['124'][3].init(119, 7, 'b === 0');
function visit58_124_3(result) {
  _$jscoverage['/selector.js'].branchData['124'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['124'][2].init(108, 7, 'a === 0');
function visit57_124_2(result) {
  _$jscoverage['/selector.js'].branchData['124'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['124'][1].init(108, 18, 'a === 0 && b === 0');
function visit56_124_1(result) {
  _$jscoverage['/selector.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['116'][1].init(120, 49, 'documentElement.nodeName.toLowerCase() !== \'html\'');
function visit55_116_1(result) {
  _$jscoverage['/selector.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['115'][2].init(41, 26, 'elem.ownerDocument || elem');
function visit54_115_2(result) {
  _$jscoverage['/selector.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['115'][1].init(32, 52, 'elem && (elem.ownerDocument || elem).documentElement');
function visit53_115_1(result) {
  _$jscoverage['/selector.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['107'][4].init(43, 20, '(index - b) % a === 0');
function visit52_107_4(result) {
  _$jscoverage['/selector.js'].branchData['107'][4].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['107'][3].init(43, 26, '(index - b) % a === 0 && eq');
function visit51_107_3(result) {
  _$jscoverage['/selector.js'].branchData['107'][3].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['107'][2].init(19, 19, '(index - b) / a >= 0');
function visit50_107_2(result) {
  _$jscoverage['/selector.js'].branchData['107'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['107'][1].init(19, 50, '(index - b) / a >= 0 && (index - b) % a === 0 && eq');
function visit49_107_1(result) {
  _$jscoverage['/selector.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['103'][1].init(18, 11, 'index === b');
function visit48_103_1(result) {
  _$jscoverage['/selector.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['102'][1].init(14, 7, 'a === 0');
function visit47_102_1(result) {
  _$jscoverage['/selector.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['93'][1].init(364, 23, 'parseInt(match[3]) || 0');
function visit46_93_1(result) {
  _$jscoverage['/selector.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['84'][1].init(26, 16, 'match[2] === \'-\'');
function visit45_84_1(result) {
  _$jscoverage['/selector.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['83'][1].init(63, 8, 'isNaN(a)');
function visit44_83_1(result) {
  _$jscoverage['/selector.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['81'][1].init(18, 8, 'match[1]');
function visit43_81_1(result) {
  _$jscoverage['/selector.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['77'][1].init(237, 16, 'param === \'even\'');
function visit42_77_1(result) {
  _$jscoverage['/selector.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['74'][1].init(157, 15, 'param === \'odd\'');
function visit41_74_1(result) {
  _$jscoverage['/selector.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['71'][1].init(74, 25, 'typeof param === \'number\'');
function visit40_71_1(result) {
  _$jscoverage['/selector.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['63'][2].init(73, 17, 'el.nodeType !== 1');
function visit39_63_2(result) {
  _$jscoverage['/selector.js'].branchData['63'][2].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['63'][1].init(55, 23, 'el && el.nodeType !== 1');
function visit38_63_1(result) {
  _$jscoverage['/selector.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['39'][1].init(91, 8, 'high < 0');
function visit37_39_1(result) {
  _$jscoverage['/selector.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].branchData['21'][1].init(18, 12, 'isContextXML');
function visit36_21_1(result) {
  _$jscoverage['/selector.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/selector.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/selector.js'].functionData[0]++;
  _$jscoverage['/selector.js'].lineData[7]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/selector.js'].lineData[8]++;
  var parser = require('./selector/parser');
  _$jscoverage['/selector.js'].lineData[9]++;
  var Dom = require('dom/basic');
  _$jscoverage['/selector.js'].lineData[10]++;
  logger.info('use KISSY css3 selector');
  _$jscoverage['/selector.js'].lineData[14]++;
  var document = S.Env.host.document, EXPANDO_SELECTOR_KEY = '_ks_data_selector_id_', caches = {}, isContextXML, uuid = 0, subMatchesCache = {}, getAttr = function(el, name) {
  _$jscoverage['/selector.js'].functionData[1]++;
  _$jscoverage['/selector.js'].lineData[21]++;
  if (visit36_21_1(isContextXML)) {
    _$jscoverage['/selector.js'].lineData[22]++;
    return Dom._getSimpleAttr(el, name);
  } else {
    _$jscoverage['/selector.js'].lineData[24]++;
    return Dom.attr(el, name);
  }
}, hasSingleClass = Dom._hasSingleClass, isTag = Dom._isTag, aNPlusB = /^(([+-]?(?:\d+)?)?n)?([+-]?\d+)?$/;
  _$jscoverage['/selector.js'].lineData[32]++;
  var unescape = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g, unescapeFn = function(_, escaped) {
  _$jscoverage['/selector.js'].functionData[2]++;
  _$jscoverage['/selector.js'].lineData[34]++;
  var high = '0x' + escaped - 0x10000;
  _$jscoverage['/selector.js'].lineData[36]++;
  return isNaN(high) ? escaped : visit37_39_1(high < 0) ? String.fromCharCode(high + 0x10000) : String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
};
  _$jscoverage['/selector.js'].lineData[45]++;
  function unEscape(str) {
    _$jscoverage['/selector.js'].functionData[3]++;
    _$jscoverage['/selector.js'].lineData[46]++;
    return str.replace(unescape, unescapeFn);
  }
  _$jscoverage['/selector.js'].lineData[49]++;
  parser.lexer.yy = {
  unEscape: unEscape, 
  unEscapeStr: function(str) {
  _$jscoverage['/selector.js'].functionData[4]++;
  _$jscoverage['/selector.js'].lineData[52]++;
  return this.unEscape(str.slice(1, -1));
}};
  _$jscoverage['/selector.js'].lineData[56]++;
  function resetStatus() {
    _$jscoverage['/selector.js'].functionData[5]++;
    _$jscoverage['/selector.js'].lineData[57]++;
    subMatchesCache = {};
  }
  _$jscoverage['/selector.js'].lineData[60]++;
  function dir(el, direction) {
    _$jscoverage['/selector.js'].functionData[6]++;
    _$jscoverage['/selector.js'].lineData[61]++;
    do {
      _$jscoverage['/selector.js'].lineData[62]++;
      el = el[direction];
    } while (visit38_63_1(el && visit39_63_2(el.nodeType !== 1)));
    _$jscoverage['/selector.js'].lineData[64]++;
    return el;
  }
  _$jscoverage['/selector.js'].lineData[67]++;
  function getAb(param) {
    _$jscoverage['/selector.js'].functionData[7]++;
    _$jscoverage['/selector.js'].lineData[68]++;
    var a = 0, match, b = 0;
    _$jscoverage['/selector.js'].lineData[71]++;
    if (visit40_71_1(typeof param === 'number')) {
      _$jscoverage['/selector.js'].lineData[72]++;
      b = param;
    } else {
      _$jscoverage['/selector.js'].lineData[74]++;
      if (visit41_74_1(param === 'odd')) {
        _$jscoverage['/selector.js'].lineData[75]++;
        a = 2;
        _$jscoverage['/selector.js'].lineData[76]++;
        b = 1;
      } else {
        _$jscoverage['/selector.js'].lineData[77]++;
        if (visit42_77_1(param === 'even')) {
          _$jscoverage['/selector.js'].lineData[78]++;
          a = 2;
          _$jscoverage['/selector.js'].lineData[79]++;
          b = 0;
        } else {
          _$jscoverage['/selector.js'].lineData[80]++;
          if ((match = param.replace(/\s/g, '').match(aNPlusB))) {
            _$jscoverage['/selector.js'].lineData[81]++;
            if (visit43_81_1(match[1])) {
              _$jscoverage['/selector.js'].lineData[82]++;
              a = parseInt(match[2]);
              _$jscoverage['/selector.js'].lineData[83]++;
              if (visit44_83_1(isNaN(a))) {
                _$jscoverage['/selector.js'].lineData[84]++;
                if (visit45_84_1(match[2] === '-')) {
                  _$jscoverage['/selector.js'].lineData[85]++;
                  a = -1;
                } else {
                  _$jscoverage['/selector.js'].lineData[87]++;
                  a = 1;
                }
              }
            } else {
              _$jscoverage['/selector.js'].lineData[91]++;
              a = 0;
            }
            _$jscoverage['/selector.js'].lineData[93]++;
            b = visit46_93_1(parseInt(match[3]) || 0);
          }
        }
      }
    }
    _$jscoverage['/selector.js'].lineData[95]++;
    return {
  a: a, 
  b: b};
  }
  _$jscoverage['/selector.js'].lineData[101]++;
  function matchIndexByAb(index, a, b, eq) {
    _$jscoverage['/selector.js'].functionData[8]++;
    _$jscoverage['/selector.js'].lineData[102]++;
    if (visit47_102_1(a === 0)) {
      _$jscoverage['/selector.js'].lineData[103]++;
      if (visit48_103_1(index === b)) {
        _$jscoverage['/selector.js'].lineData[104]++;
        return eq;
      }
    } else {
      _$jscoverage['/selector.js'].lineData[107]++;
      if (visit49_107_1(visit50_107_2((index - b) / a >= 0) && visit51_107_3(visit52_107_4((index - b) % a === 0) && eq))) {
        _$jscoverage['/selector.js'].lineData[108]++;
        return 1;
      }
    }
    _$jscoverage['/selector.js'].lineData[111]++;
    return undefined;
  }
  _$jscoverage['/selector.js'].lineData[114]++;
  function isXML(elem) {
    _$jscoverage['/selector.js'].functionData[9]++;
    _$jscoverage['/selector.js'].lineData[115]++;
    var documentElement = visit53_115_1(elem && (visit54_115_2(elem.ownerDocument || elem)).documentElement);
    _$jscoverage['/selector.js'].lineData[116]++;
    return documentElement ? visit55_116_1(documentElement.nodeName.toLowerCase() !== 'html') : false;
  }
  _$jscoverage['/selector.js'].lineData[119]++;
  var pseudoFnExpr = {
  'nth-child': function(el, param) {
  _$jscoverage['/selector.js'].functionData[10]++;
  _$jscoverage['/selector.js'].lineData[121]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[124]++;
  if (visit56_124_1(visit57_124_2(a === 0) && visit58_124_3(b === 0))) {
    _$jscoverage['/selector.js'].lineData[125]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[127]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[129]++;
  if (visit59_129_1(parent)) {
    _$jscoverage['/selector.js'].lineData[130]++;
    var childNodes = parent.childNodes, count = 0, child, ret, len = childNodes.length;
    _$jscoverage['/selector.js'].lineData[135]++;
    for (; visit60_135_1(count < len); count++) {
      _$jscoverage['/selector.js'].lineData[136]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[137]++;
      if (visit61_137_1(child.nodeType === 1)) {
        _$jscoverage['/selector.js'].lineData[138]++;
        index++;
        _$jscoverage['/selector.js'].lineData[139]++;
        ret = matchIndexByAb(index, a, b, visit62_139_1(child === el));
        _$jscoverage['/selector.js'].lineData[140]++;
        if (visit63_140_1(ret !== undefined)) {
          _$jscoverage['/selector.js'].lineData[141]++;
          return ret;
        }
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[146]++;
  return 0;
}, 
  'nth-last-child': function(el, param) {
  _$jscoverage['/selector.js'].functionData[11]++;
  _$jscoverage['/selector.js'].lineData[149]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[152]++;
  if (visit64_152_1(visit65_152_2(a === 0) && visit66_152_3(b === 0))) {
    _$jscoverage['/selector.js'].lineData[153]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[155]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[157]++;
  if (visit67_157_1(parent)) {
    _$jscoverage['/selector.js'].lineData[158]++;
    var childNodes = parent.childNodes, len = childNodes.length, count = len - 1, child, ret;
    _$jscoverage['/selector.js'].lineData[163]++;
    for (; visit68_163_1(count >= 0); count--) {
      _$jscoverage['/selector.js'].lineData[164]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[165]++;
      if (visit69_165_1(child.nodeType === 1)) {
        _$jscoverage['/selector.js'].lineData[166]++;
        index++;
        _$jscoverage['/selector.js'].lineData[167]++;
        ret = matchIndexByAb(index, a, b, visit70_167_1(child === el));
        _$jscoverage['/selector.js'].lineData[168]++;
        if (visit71_168_1(ret !== undefined)) {
          _$jscoverage['/selector.js'].lineData[169]++;
          return ret;
        }
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[174]++;
  return 0;
}, 
  'nth-of-type': function(el, param) {
  _$jscoverage['/selector.js'].functionData[12]++;
  _$jscoverage['/selector.js'].lineData[177]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[180]++;
  if (visit72_180_1(visit73_180_2(a === 0) && visit74_180_3(b === 0))) {
    _$jscoverage['/selector.js'].lineData[181]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[183]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[185]++;
  if (visit75_185_1(parent)) {
    _$jscoverage['/selector.js'].lineData[186]++;
    var childNodes = parent.childNodes, elType = el.tagName, count = 0, child, ret, len = childNodes.length;
    _$jscoverage['/selector.js'].lineData[192]++;
    for (; visit76_192_1(count < len); count++) {
      _$jscoverage['/selector.js'].lineData[193]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[194]++;
      if (visit77_194_1(child.tagName === elType)) {
        _$jscoverage['/selector.js'].lineData[195]++;
        index++;
        _$jscoverage['/selector.js'].lineData[196]++;
        ret = matchIndexByAb(index, a, b, visit78_196_1(child === el));
        _$jscoverage['/selector.js'].lineData[197]++;
        if (visit79_197_1(ret !== undefined)) {
          _$jscoverage['/selector.js'].lineData[198]++;
          return ret;
        }
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[203]++;
  return 0;
}, 
  'nth-last-of-type': function(el, param) {
  _$jscoverage['/selector.js'].functionData[13]++;
  _$jscoverage['/selector.js'].lineData[206]++;
  var ab = getAb(param), a = ab.a, b = ab.b;
  _$jscoverage['/selector.js'].lineData[209]++;
  if (visit80_209_1(visit81_209_2(a === 0) && visit82_209_3(b === 0))) {
    _$jscoverage['/selector.js'].lineData[210]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[212]++;
  var index = 0, parent = el.parentNode;
  _$jscoverage['/selector.js'].lineData[214]++;
  if (visit83_214_1(parent)) {
    _$jscoverage['/selector.js'].lineData[215]++;
    var childNodes = parent.childNodes, len = childNodes.length, elType = el.tagName, count = len - 1, child, ret;
    _$jscoverage['/selector.js'].lineData[221]++;
    for (; visit84_221_1(count >= 0); count--) {
      _$jscoverage['/selector.js'].lineData[222]++;
      child = childNodes[count];
      _$jscoverage['/selector.js'].lineData[223]++;
      if (visit85_223_1(child.tagName === elType)) {
        _$jscoverage['/selector.js'].lineData[224]++;
        index++;
        _$jscoverage['/selector.js'].lineData[225]++;
        ret = matchIndexByAb(index, a, b, visit86_225_1(child === el));
        _$jscoverage['/selector.js'].lineData[226]++;
        if (visit87_226_1(ret !== undefined)) {
          _$jscoverage['/selector.js'].lineData[227]++;
          return ret;
        }
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[232]++;
  return 0;
}, 
  'lang': function(el, lang) {
  _$jscoverage['/selector.js'].functionData[14]++;
  _$jscoverage['/selector.js'].lineData[235]++;
  var elLang;
  _$jscoverage['/selector.js'].lineData[236]++;
  lang = unEscape(lang.toLowerCase());
  _$jscoverage['/selector.js'].lineData[237]++;
  do {
    _$jscoverage['/selector.js'].lineData[238]++;
    if ((elLang = (isContextXML ? visit88_239_1(el.getAttribute('xml:lang') || el.getAttribute('lang')) : el.lang))) {
      _$jscoverage['/selector.js'].lineData[241]++;
      elLang = elLang.toLowerCase();
      _$jscoverage['/selector.js'].lineData[242]++;
      return visit89_242_1(visit90_242_2(elLang === lang) || visit91_242_3(elLang.indexOf(lang + '-') === 0));
    }
  } while (visit92_244_1((el = el.parentNode) && visit93_244_2(el.nodeType === 1)));
  _$jscoverage['/selector.js'].lineData[245]++;
  return false;
}, 
  'not': function(el, negationArg) {
  _$jscoverage['/selector.js'].functionData[15]++;
  _$jscoverage['/selector.js'].lineData[248]++;
  return !matchExpr[negationArg.t](el, negationArg.value);
}};
  _$jscoverage['/selector.js'].lineData[252]++;
  var pseudoIdentExpr = {
  'empty': function(el) {
  _$jscoverage['/selector.js'].functionData[16]++;
  _$jscoverage['/selector.js'].lineData[254]++;
  var childNodes = el.childNodes, index = 0, len = childNodes.length - 1, child, nodeType;
  _$jscoverage['/selector.js'].lineData[259]++;
  for (; visit94_259_1(index < len); index++) {
    _$jscoverage['/selector.js'].lineData[260]++;
    child = childNodes[index];
    _$jscoverage['/selector.js'].lineData[261]++;
    nodeType = child.nodeType;
    _$jscoverage['/selector.js'].lineData[265]++;
    if (visit95_265_1(visit96_265_2(nodeType === 1) || visit97_265_3(visit98_265_4(nodeType === 3) || visit99_265_5(visit100_265_6(nodeType === 4) || visit101_265_7(nodeType === 5))))) {
      _$jscoverage['/selector.js'].lineData[266]++;
      return 0;
    }
  }
  _$jscoverage['/selector.js'].lineData[269]++;
  return 1;
}, 
  'root': function(el) {
  _$jscoverage['/selector.js'].functionData[17]++;
  _$jscoverage['/selector.js'].lineData[272]++;
  return visit102_272_1(el.ownerDocument && visit103_273_1(el === el.ownerDocument.documentElement));
}, 
  'first-child': function(el) {
  _$jscoverage['/selector.js'].functionData[18]++;
  _$jscoverage['/selector.js'].lineData[276]++;
  return pseudoFnExpr['nth-child'](el, 1);
}, 
  'last-child': function(el) {
  _$jscoverage['/selector.js'].functionData[19]++;
  _$jscoverage['/selector.js'].lineData[279]++;
  return pseudoFnExpr['nth-last-child'](el, 1);
}, 
  'first-of-type': function(el) {
  _$jscoverage['/selector.js'].functionData[20]++;
  _$jscoverage['/selector.js'].lineData[282]++;
  return pseudoFnExpr['nth-of-type'](el, 1);
}, 
  'last-of-type': function(el) {
  _$jscoverage['/selector.js'].functionData[21]++;
  _$jscoverage['/selector.js'].lineData[285]++;
  return pseudoFnExpr['nth-last-of-type'](el, 1);
}, 
  'only-child': function(el) {
  _$jscoverage['/selector.js'].functionData[22]++;
  _$jscoverage['/selector.js'].lineData[288]++;
  return visit104_288_1(pseudoIdentExpr['first-child'](el) && pseudoIdentExpr['last-child'](el));
}, 
  'only-of-type': function(el) {
  _$jscoverage['/selector.js'].functionData[23]++;
  _$jscoverage['/selector.js'].lineData[292]++;
  return visit105_292_1(pseudoIdentExpr['first-of-type'](el) && pseudoIdentExpr['last-of-type'](el));
}, 
  'focus': function(el) {
  _$jscoverage['/selector.js'].functionData[24]++;
  _$jscoverage['/selector.js'].lineData[296]++;
  var doc = el.ownerDocument;
  _$jscoverage['/selector.js'].lineData[297]++;
  return visit106_297_1(doc && visit107_297_2(visit108_297_3(el === doc.activeElement) && visit109_298_1((visit110_298_2(!doc.hasFocus || doc.hasFocus())) && !!(visit111_298_3(el.type || visit112_298_4(el.href || visit113_298_5(el.tabIndex >= 0)))))));
}, 
  'target': function(el) {
  _$jscoverage['/selector.js'].functionData[25]++;
  _$jscoverage['/selector.js'].lineData[301]++;
  var hash = location.hash;
  _$jscoverage['/selector.js'].lineData[302]++;
  return visit114_302_1(hash && visit115_302_2(hash.slice(1) === getAttr(el, 'id')));
}, 
  'enabled': function(el) {
  _$jscoverage['/selector.js'].functionData[26]++;
  _$jscoverage['/selector.js'].lineData[305]++;
  return !el.disabled;
}, 
  'disabled': function(el) {
  _$jscoverage['/selector.js'].functionData[27]++;
  _$jscoverage['/selector.js'].lineData[308]++;
  return el.disabled;
}, 
  'checked': function(el) {
  _$jscoverage['/selector.js'].functionData[28]++;
  _$jscoverage['/selector.js'].lineData[311]++;
  var nodeName = el.nodeName.toLowerCase();
  _$jscoverage['/selector.js'].lineData[312]++;
  return visit116_312_1((visit117_312_2(visit118_312_3(nodeName === 'input') && el.checked)) || (visit119_313_1(visit120_313_2(nodeName === 'option') && el.selected)));
}};
  _$jscoverage['/selector.js'].lineData[317]++;
  var attribExpr = {
  '~=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[29]++;
  _$jscoverage['/selector.js'].lineData[319]++;
  if (visit121_319_1(!value || visit122_319_2(value.indexOf(' ') > -1))) {
    _$jscoverage['/selector.js'].lineData[320]++;
    return 0;
  }
  _$jscoverage['/selector.js'].lineData[322]++;
  return visit123_322_1((' ' + elValue + ' ').indexOf(' ' + value + ' ') !== -1);
}, 
  '|=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[30]++;
  _$jscoverage['/selector.js'].lineData[325]++;
  return visit124_325_1((' ' + elValue).indexOf(' ' + value + '-') !== -1);
}, 
  '^=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[31]++;
  _$jscoverage['/selector.js'].lineData[328]++;
  return visit125_328_1(value && S.startsWith(elValue, value));
}, 
  '$=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[32]++;
  _$jscoverage['/selector.js'].lineData[331]++;
  return visit126_331_1(value && S.endsWith(elValue, value));
}, 
  '*=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[33]++;
  _$jscoverage['/selector.js'].lineData[334]++;
  return visit127_334_1(value && visit128_334_2(elValue.indexOf(value) !== -1));
}, 
  '=': function(elValue, value) {
  _$jscoverage['/selector.js'].functionData[34]++;
  _$jscoverage['/selector.js'].lineData[337]++;
  return visit129_337_1(elValue === value);
}};
  _$jscoverage['/selector.js'].lineData[341]++;
  var matchExpr = {
  'tag': isTag, 
  'cls': hasSingleClass, 
  'id': function(el, value) {
  _$jscoverage['/selector.js'].functionData[35]++;
  _$jscoverage['/selector.js'].lineData[345]++;
  return visit130_345_1(getAttr(el, 'id') === value);
}, 
  'attrib': function(el, value) {
  _$jscoverage['/selector.js'].functionData[36]++;
  _$jscoverage['/selector.js'].lineData[348]++;
  var name = value.ident;
  _$jscoverage['/selector.js'].lineData[349]++;
  if (visit131_349_1(!isContextXML)) {
    _$jscoverage['/selector.js'].lineData[350]++;
    name = name.toLowerCase();
  }
  _$jscoverage['/selector.js'].lineData[352]++;
  var elValue = getAttr(el, name);
  _$jscoverage['/selector.js'].lineData[353]++;
  var match = value.match;
  _$jscoverage['/selector.js'].lineData[354]++;
  if (visit132_354_1(!match && visit133_354_2(elValue !== undefined))) {
    _$jscoverage['/selector.js'].lineData[355]++;
    return 1;
  } else {
    _$jscoverage['/selector.js'].lineData[356]++;
    if (visit134_356_1(match)) {
      _$jscoverage['/selector.js'].lineData[357]++;
      if (visit135_357_1(elValue === undefined)) {
        _$jscoverage['/selector.js'].lineData[358]++;
        return 0;
      }
      _$jscoverage['/selector.js'].lineData[360]++;
      var matchFn = attribExpr[match];
      _$jscoverage['/selector.js'].lineData[361]++;
      if (visit136_361_1(matchFn)) {
        _$jscoverage['/selector.js'].lineData[362]++;
        return matchFn(elValue + '', value.value + '');
      }
    }
  }
  _$jscoverage['/selector.js'].lineData[365]++;
  return 0;
}, 
  'pseudo': function(el, value) {
  _$jscoverage['/selector.js'].functionData[37]++;
  _$jscoverage['/selector.js'].lineData[368]++;
  var fn, fnStr, ident;
  _$jscoverage['/selector.js'].lineData[369]++;
  if ((fnStr = value.fn)) {
    _$jscoverage['/selector.js'].lineData[370]++;
    if (visit137_370_1(!(fn = pseudoFnExpr[fnStr]))) {
      _$jscoverage['/selector.js'].lineData[371]++;
      throw new SyntaxError('Syntax error: not support pseudo: ' + fnStr);
    }
    _$jscoverage['/selector.js'].lineData[373]++;
    return fn(el, value.param);
  }
  _$jscoverage['/selector.js'].lineData[375]++;
  if ((ident = value.ident)) {
    _$jscoverage['/selector.js'].lineData[376]++;
    if (visit138_376_1(!pseudoIdentExpr[ident])) {
      _$jscoverage['/selector.js'].lineData[377]++;
      throw new SyntaxError('Syntax error: not support pseudo: ' + ident);
    }
    _$jscoverage['/selector.js'].lineData[379]++;
    return pseudoIdentExpr[ident](el);
  }
  _$jscoverage['/selector.js'].lineData[381]++;
  return 0;
}};
  _$jscoverage['/selector.js'].lineData[385]++;
  var relativeExpr = {
  '>': {
  dir: 'parentNode', 
  immediate: 1}, 
  ' ': {
  dir: 'parentNode'}, 
  '+': {
  dir: 'previousSibling', 
  immediate: 1}, 
  '~': {
  dir: 'previousSibling'}};
  _$jscoverage['/selector.js'].lineData[402]++;
  if (visit139_402_1('sourceIndex' in document.documentElement)) {
    _$jscoverage['/selector.js'].lineData[403]++;
    Dom._compareNodeOrder = function(a, b) {
  _$jscoverage['/selector.js'].functionData[38]++;
  _$jscoverage['/selector.js'].lineData[404]++;
  return a.sourceIndex - b.sourceIndex;
};
  }
  _$jscoverage['/selector.js'].lineData[408]++;
  function matches(str, seeds) {
    _$jscoverage['/selector.js'].functionData[39]++;
    _$jscoverage['/selector.js'].lineData[409]++;
    return Dom._selectInternal(str, null, seeds);
  }
  _$jscoverage['/selector.js'].lineData[412]++;
  Dom._matchesInternal = matches;
  _$jscoverage['/selector.js'].lineData[414]++;
  function singleMatch(el, match) {
    _$jscoverage['/selector.js'].functionData[40]++;
    _$jscoverage['/selector.js'].lineData[415]++;
    if (visit140_415_1(!match)) {
      _$jscoverage['/selector.js'].lineData[416]++;
      return true;
    }
    _$jscoverage['/selector.js'].lineData[418]++;
    if (visit141_418_1(!el)) {
      _$jscoverage['/selector.js'].lineData[419]++;
      return false;
    }
    _$jscoverage['/selector.js'].lineData[422]++;
    if (visit142_422_1(el.nodeType === 9)) {
      _$jscoverage['/selector.js'].lineData[423]++;
      return false;
    }
    _$jscoverage['/selector.js'].lineData[426]++;
    var matched = 1, matchSuffix = match.suffix, matchSuffixLen, matchSuffixIndex;
    _$jscoverage['/selector.js'].lineData[431]++;
    if (visit143_431_1(match.t === 'tag')) {
      _$jscoverage['/selector.js'].lineData[432]++;
      matched &= matchExpr.tag(el, match.value);
    }
    _$jscoverage['/selector.js'].lineData[435]++;
    if (visit144_435_1(matched && matchSuffix)) {
      _$jscoverage['/selector.js'].lineData[436]++;
      matchSuffixLen = matchSuffix.length;
      _$jscoverage['/selector.js'].lineData[437]++;
      matchSuffixIndex = 0;
      _$jscoverage['/selector.js'].lineData[438]++;
      for (; visit145_438_1(matched && visit146_438_2(matchSuffixIndex < matchSuffixLen)); matchSuffixIndex++) {
        _$jscoverage['/selector.js'].lineData[439]++;
        var singleMatchSuffix = matchSuffix[matchSuffixIndex], singleMatchSuffixType = singleMatchSuffix.t;
        _$jscoverage['/selector.js'].lineData[441]++;
        if (visit147_441_1(matchExpr[singleMatchSuffixType])) {
          _$jscoverage['/selector.js'].lineData[442]++;
          matched &= matchExpr[singleMatchSuffixType](el, singleMatchSuffix.value);
        }
      }
    }
    _$jscoverage['/selector.js'].lineData[447]++;
    return matched;
  }
  _$jscoverage['/selector.js'].lineData[451]++;
  function matchImmediate(el, match) {
    _$jscoverage['/selector.js'].functionData[41]++;
    _$jscoverage['/selector.js'].lineData[452]++;
    var matched = 1, startEl = el, relativeOp, startMatch = match;
    _$jscoverage['/selector.js'].lineData[457]++;
    do {
      _$jscoverage['/selector.js'].lineData[458]++;
      matched &= singleMatch(el, match);
      _$jscoverage['/selector.js'].lineData[459]++;
      if (visit148_459_1(matched)) {
        _$jscoverage['/selector.js'].lineData[461]++;
        match = visit149_461_1(match && match.prev);
        _$jscoverage['/selector.js'].lineData[462]++;
        if (visit150_462_1(!match)) {
          _$jscoverage['/selector.js'].lineData[463]++;
          return true;
        }
        _$jscoverage['/selector.js'].lineData[465]++;
        relativeOp = relativeExpr[match.nextCombinator];
        _$jscoverage['/selector.js'].lineData[466]++;
        el = dir(el, relativeOp.dir);
        _$jscoverage['/selector.js'].lineData[467]++;
        if (visit151_467_1(!relativeOp.immediate)) {
          _$jscoverage['/selector.js'].lineData[468]++;
          return {
  el: el, 
  match: match};
        }
      } else {
        _$jscoverage['/selector.js'].lineData[475]++;
        relativeOp = relativeExpr[match.nextCombinator];
        _$jscoverage['/selector.js'].lineData[476]++;
        if (visit152_476_1(relativeOp.immediate)) {
          _$jscoverage['/selector.js'].lineData[478]++;
          return {
  el: dir(startEl, relativeExpr[startMatch.nextCombinator].dir), 
  match: startMatch};
        } else {
          _$jscoverage['/selector.js'].lineData[484]++;
          return {
  el: visit153_485_1(el && dir(el, relativeOp.dir)), 
  match: match};
        }
      }
    } while (el);
    _$jscoverage['/selector.js'].lineData[493]++;
    return {
  el: dir(startEl, relativeExpr[startMatch.nextCombinator].dir), 
  match: startMatch};
  }
  _$jscoverage['/selector.js'].lineData[500]++;
  function findFixedMatchFromHead(el, head) {
    _$jscoverage['/selector.js'].functionData[42]++;
    _$jscoverage['/selector.js'].lineData[501]++;
    var relativeOp, cur = head;
    _$jscoverage['/selector.js'].lineData[504]++;
    do {
      _$jscoverage['/selector.js'].lineData[505]++;
      if (visit154_505_1(!singleMatch(el, cur))) {
        _$jscoverage['/selector.js'].lineData[506]++;
        return null;
      }
      _$jscoverage['/selector.js'].lineData[508]++;
      cur = cur.prev;
      _$jscoverage['/selector.js'].lineData[509]++;
      if (visit155_509_1(!cur)) {
        _$jscoverage['/selector.js'].lineData[510]++;
        return true;
      }
      _$jscoverage['/selector.js'].lineData[512]++;
      relativeOp = relativeExpr[cur.nextCombinator];
      _$jscoverage['/selector.js'].lineData[513]++;
      el = dir(el, relativeOp.dir);
    } while (visit156_514_1(el && relativeOp.immediate));
    _$jscoverage['/selector.js'].lineData[515]++;
    if (visit157_515_1(!el)) {
      _$jscoverage['/selector.js'].lineData[516]++;
      return null;
    }
    _$jscoverage['/selector.js'].lineData[518]++;
    return {
  el: el, 
  match: cur};
  }
  _$jscoverage['/selector.js'].lineData[524]++;
  function genId(el) {
    _$jscoverage['/selector.js'].functionData[43]++;
    _$jscoverage['/selector.js'].lineData[525]++;
    var selectorId;
    _$jscoverage['/selector.js'].lineData[527]++;
    if (visit158_527_1(isContextXML)) {
      _$jscoverage['/selector.js'].lineData[528]++;
      if (visit159_528_1(!(selectorId = el.getAttribute(EXPANDO_SELECTOR_KEY)))) {
        _$jscoverage['/selector.js'].lineData[529]++;
        el.setAttribute(EXPANDO_SELECTOR_KEY, selectorId = (+new Date() + '_' + (++uuid)));
      }
    } else {
      _$jscoverage['/selector.js'].lineData[532]++;
      if (visit160_532_1(!(selectorId = el[EXPANDO_SELECTOR_KEY]))) {
        _$jscoverage['/selector.js'].lineData[533]++;
        selectorId = el[EXPANDO_SELECTOR_KEY] = (+new Date()) + '_' + (++uuid);
      }
    }
    _$jscoverage['/selector.js'].lineData[537]++;
    return selectorId;
  }
  _$jscoverage['/selector.js'].lineData[540]++;
  function matchSub(el, match) {
    _$jscoverage['/selector.js'].functionData[44]++;
    _$jscoverage['/selector.js'].lineData[541]++;
    var selectorId = genId(el), matchKey;
    _$jscoverage['/selector.js'].lineData[543]++;
    matchKey = selectorId + '_' + (visit161_543_1(match.order || 0));
    _$jscoverage['/selector.js'].lineData[544]++;
    if (visit162_544_1(matchKey in subMatchesCache)) {
      _$jscoverage['/selector.js'].lineData[545]++;
      return subMatchesCache[matchKey];
    }
    _$jscoverage['/selector.js'].lineData[547]++;
    subMatchesCache[matchKey] = matchSubInternal(el, match);
    _$jscoverage['/selector.js'].lineData[548]++;
    return subMatchesCache[matchKey];
  }
  _$jscoverage['/selector.js'].lineData[553]++;
  function matchSubInternal(el, match) {
    _$jscoverage['/selector.js'].functionData[45]++;
    _$jscoverage['/selector.js'].lineData[554]++;
    var matchImmediateRet = matchImmediate(el, match);
    _$jscoverage['/selector.js'].lineData[555]++;
    if (visit163_555_1(matchImmediateRet === true)) {
      _$jscoverage['/selector.js'].lineData[556]++;
      return true;
    } else {
      _$jscoverage['/selector.js'].lineData[558]++;
      el = matchImmediateRet.el;
      _$jscoverage['/selector.js'].lineData[559]++;
      match = matchImmediateRet.match;
      _$jscoverage['/selector.js'].lineData[560]++;
      while (el) {
        _$jscoverage['/selector.js'].lineData[561]++;
        if (visit164_561_1(matchSub(el, match))) {
          _$jscoverage['/selector.js'].lineData[562]++;
          return true;
        }
        _$jscoverage['/selector.js'].lineData[564]++;
        el = dir(el, relativeExpr[match.nextCombinator].dir);
      }
      _$jscoverage['/selector.js'].lineData[566]++;
      return false;
    }
  }
  _$jscoverage['/selector.js'].lineData[570]++;
  function select(str, context, seeds) {
    _$jscoverage['/selector.js'].functionData[46]++;
    _$jscoverage['/selector.js'].lineData[571]++;
    if (visit165_571_1(!caches[str])) {
      _$jscoverage['/selector.js'].lineData[572]++;
      caches[str] = parser.parse(str);
    }
    _$jscoverage['/selector.js'].lineData[575]++;
    var selector = caches[str], groupIndex = 0, groupLen = selector.length, contextDocument, group, ret = [];
    _$jscoverage['/selector.js'].lineData[582]++;
    if (visit166_582_1(seeds)) {
      _$jscoverage['/selector.js'].lineData[583]++;
      context = visit167_583_1(context || seeds[0].ownerDocument);
    }
    _$jscoverage['/selector.js'].lineData[586]++;
    contextDocument = visit168_586_1(visit169_586_2(context && context.ownerDocument) || document);
    _$jscoverage['/selector.js'].lineData[588]++;
    context = visit170_588_1(context || contextDocument);
    _$jscoverage['/selector.js'].lineData[590]++;
    isContextXML = isXML(context);
    _$jscoverage['/selector.js'].lineData[592]++;
    for (; visit171_592_1(groupIndex < groupLen); groupIndex++) {
      _$jscoverage['/selector.js'].lineData[593]++;
      resetStatus();
      _$jscoverage['/selector.js'].lineData[595]++;
      group = selector[groupIndex];
      _$jscoverage['/selector.js'].lineData[597]++;
      var suffix = group.suffix, suffixIndex, suffixLen, seedsIndex, mySeeds = seeds, seedsLen, id = null;
      _$jscoverage['/selector.js'].lineData[605]++;
      if (visit172_605_1(!mySeeds)) {
        _$jscoverage['/selector.js'].lineData[606]++;
        if (visit173_606_1(suffix && !isContextXML)) {
          _$jscoverage['/selector.js'].lineData[607]++;
          suffixIndex = 0;
          _$jscoverage['/selector.js'].lineData[608]++;
          suffixLen = suffix.length;
          _$jscoverage['/selector.js'].lineData[609]++;
          for (; visit174_609_1(suffixIndex < suffixLen); suffixIndex++) {
            _$jscoverage['/selector.js'].lineData[610]++;
            var singleSuffix = suffix[suffixIndex];
            _$jscoverage['/selector.js'].lineData[611]++;
            if (visit175_611_1(singleSuffix.t === 'id')) {
              _$jscoverage['/selector.js'].lineData[612]++;
              id = singleSuffix.value;
              _$jscoverage['/selector.js'].lineData[613]++;
              break;
            }
          }
        }
        _$jscoverage['/selector.js'].lineData[618]++;
        if (visit176_618_1(id)) {
          _$jscoverage['/selector.js'].lineData[620]++;
          var doesNotHasById = !context.getElementById, contextInDom = Dom._contains(contextDocument, context), tmp = doesNotHasById ? (contextInDom ? contextDocument.getElementById(id) : null) : context.getElementById(id);
          _$jscoverage['/selector.js'].lineData[629]++;
          if (visit177_629_1(visit178_629_2(!tmp && doesNotHasById) || visit179_629_3(tmp && visit180_629_4(getAttr(tmp, 'id') !== id)))) {
            _$jscoverage['/selector.js'].lineData[630]++;
            var tmps = Dom._getElementsByTagName('*', context), tmpLen = tmps.length, tmpI = 0;
            _$jscoverage['/selector.js'].lineData[633]++;
            for (; visit181_633_1(tmpI < tmpLen); tmpI++) {
              _$jscoverage['/selector.js'].lineData[634]++;
              tmp = tmps[tmpI];
              _$jscoverage['/selector.js'].lineData[635]++;
              if (visit182_635_1(getAttr(tmp, 'id') === id)) {
                _$jscoverage['/selector.js'].lineData[636]++;
                mySeeds = [tmp];
                _$jscoverage['/selector.js'].lineData[637]++;
                break;
              }
            }
            _$jscoverage['/selector.js'].lineData[640]++;
            if (visit183_640_1(tmpI === tmpLen)) {
              _$jscoverage['/selector.js'].lineData[641]++;
              mySeeds = [];
            }
          } else {
            _$jscoverage['/selector.js'].lineData[644]++;
            if (visit184_644_1(contextInDom && visit185_644_2(tmp && visit186_644_3(context !== contextDocument)))) {
              _$jscoverage['/selector.js'].lineData[645]++;
              tmp = Dom._contains(context, tmp) ? tmp : null;
            }
            _$jscoverage['/selector.js'].lineData[647]++;
            mySeeds = tmp ? [tmp] : [];
          }
        } else {
          _$jscoverage['/selector.js'].lineData[650]++;
          mySeeds = Dom._getElementsByTagName(visit187_650_1(group.value || '*'), context);
        }
      }
      _$jscoverage['/selector.js'].lineData[654]++;
      seedsIndex = 0;
      _$jscoverage['/selector.js'].lineData[655]++;
      seedsLen = mySeeds.length;
      _$jscoverage['/selector.js'].lineData[657]++;
      if (visit188_657_1(!seedsLen)) {
        _$jscoverage['/selector.js'].lineData[658]++;
        continue;
      }
      _$jscoverage['/selector.js'].lineData[661]++;
      for (; visit189_661_1(seedsIndex < seedsLen); seedsIndex++) {
        _$jscoverage['/selector.js'].lineData[662]++;
        var seed = mySeeds[seedsIndex];
        _$jscoverage['/selector.js'].lineData[663]++;
        var matchHead = findFixedMatchFromHead(seed, group);
        _$jscoverage['/selector.js'].lineData[664]++;
        if (visit190_664_1(matchHead === true)) {
          _$jscoverage['/selector.js'].lineData[665]++;
          ret.push(seed);
        } else {
          _$jscoverage['/selector.js'].lineData[666]++;
          if (visit191_666_1(matchHead)) {
            _$jscoverage['/selector.js'].lineData[667]++;
            if (visit192_667_1(matchSub(matchHead.el, matchHead.match))) {
              _$jscoverage['/selector.js'].lineData[668]++;
              ret.push(seed);
            }
          }
        }
      }
    }
    _$jscoverage['/selector.js'].lineData[674]++;
    if (visit193_674_1(groupLen > 1)) {
      _$jscoverage['/selector.js'].lineData[675]++;
      ret = Dom.unique(ret);
    }
    _$jscoverage['/selector.js'].lineData[678]++;
    return ret;
  }
  _$jscoverage['/selector.js'].lineData[681]++;
  Dom._selectInternal = select;
  _$jscoverage['/selector.js'].lineData[683]++;
  return {
  parse: function(str) {
  _$jscoverage['/selector.js'].functionData[47]++;
  _$jscoverage['/selector.js'].lineData[685]++;
  return parser.parse(str);
}, 
  select: select, 
  matches: matches};
});
