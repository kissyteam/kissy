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
if (! _$jscoverage['/format.js']) {
  _$jscoverage['/format.js'] = {};
  _$jscoverage['/format.js'].lineData = [];
  _$jscoverage['/format.js'].lineData[6] = 0;
  _$jscoverage['/format.js'].lineData[7] = 0;
  _$jscoverage['/format.js'].lineData[33] = 0;
  _$jscoverage['/format.js'].lineData[36] = 0;
  _$jscoverage['/format.js'].lineData[38] = 0;
  _$jscoverage['/format.js'].lineData[40] = 0;
  _$jscoverage['/format.js'].lineData[41] = 0;
  _$jscoverage['/format.js'].lineData[42] = 0;
  _$jscoverage['/format.js'].lineData[43] = 0;
  _$jscoverage['/format.js'].lineData[44] = 0;
  _$jscoverage['/format.js'].lineData[45] = 0;
  _$jscoverage['/format.js'].lineData[46] = 0;
  _$jscoverage['/format.js'].lineData[47] = 0;
  _$jscoverage['/format.js'].lineData[48] = 0;
  _$jscoverage['/format.js'].lineData[49] = 0;
  _$jscoverage['/format.js'].lineData[50] = 0;
  _$jscoverage['/format.js'].lineData[51] = 0;
  _$jscoverage['/format.js'].lineData[52] = 0;
  _$jscoverage['/format.js'].lineData[54] = 0;
  _$jscoverage['/format.js'].lineData[55] = 0;
  _$jscoverage['/format.js'].lineData[58] = 0;
  _$jscoverage['/format.js'].lineData[62] = 0;
  _$jscoverage['/format.js'].lineData[63] = 0;
  _$jscoverage['/format.js'].lineData[69] = 0;
  _$jscoverage['/format.js'].lineData[70] = 0;
  _$jscoverage['/format.js'].lineData[71] = 0;
  _$jscoverage['/format.js'].lineData[72] = 0;
  _$jscoverage['/format.js'].lineData[73] = 0;
  _$jscoverage['/format.js'].lineData[74] = 0;
  _$jscoverage['/format.js'].lineData[75] = 0;
  _$jscoverage['/format.js'].lineData[77] = 0;
  _$jscoverage['/format.js'].lineData[78] = 0;
  _$jscoverage['/format.js'].lineData[80] = 0;
  _$jscoverage['/format.js'].lineData[83] = 0;
  _$jscoverage['/format.js'].lineData[84] = 0;
  _$jscoverage['/format.js'].lineData[85] = 0;
  _$jscoverage['/format.js'].lineData[86] = 0;
  _$jscoverage['/format.js'].lineData[87] = 0;
  _$jscoverage['/format.js'].lineData[88] = 0;
  _$jscoverage['/format.js'].lineData[89] = 0;
  _$jscoverage['/format.js'].lineData[90] = 0;
  _$jscoverage['/format.js'].lineData[92] = 0;
  _$jscoverage['/format.js'].lineData[93] = 0;
  _$jscoverage['/format.js'].lineData[95] = 0;
  _$jscoverage['/format.js'].lineData[98] = 0;
  _$jscoverage['/format.js'].lineData[99] = 0;
  _$jscoverage['/format.js'].lineData[100] = 0;
  _$jscoverage['/format.js'].lineData[101] = 0;
  _$jscoverage['/format.js'].lineData[102] = 0;
  _$jscoverage['/format.js'].lineData[104] = 0;
  _$jscoverage['/format.js'].lineData[105] = 0;
  _$jscoverage['/format.js'].lineData[107] = 0;
  _$jscoverage['/format.js'].lineData[110] = 0;
  _$jscoverage['/format.js'].lineData[112] = 0;
  _$jscoverage['/format.js'].lineData[114] = 0;
  _$jscoverage['/format.js'].lineData[115] = 0;
  _$jscoverage['/format.js'].lineData[116] = 0;
  _$jscoverage['/format.js'].lineData[118] = 0;
  _$jscoverage['/format.js'].lineData[119] = 0;
  _$jscoverage['/format.js'].lineData[120] = 0;
  _$jscoverage['/format.js'].lineData[121] = 0;
  _$jscoverage['/format.js'].lineData[122] = 0;
  _$jscoverage['/format.js'].lineData[124] = 0;
  _$jscoverage['/format.js'].lineData[127] = 0;
  _$jscoverage['/format.js'].lineData[130] = 0;
  _$jscoverage['/format.js'].lineData[131] = 0;
  _$jscoverage['/format.js'].lineData[135] = 0;
  _$jscoverage['/format.js'].lineData[136] = 0;
  _$jscoverage['/format.js'].lineData[137] = 0;
  _$jscoverage['/format.js'].lineData[138] = 0;
  _$jscoverage['/format.js'].lineData[140] = 0;
  _$jscoverage['/format.js'].lineData[141] = 0;
  _$jscoverage['/format.js'].lineData[142] = 0;
  _$jscoverage['/format.js'].lineData[145] = 0;
  _$jscoverage['/format.js'].lineData[146] = 0;
  _$jscoverage['/format.js'].lineData[149] = 0;
  _$jscoverage['/format.js'].lineData[150] = 0;
  _$jscoverage['/format.js'].lineData[153] = 0;
  _$jscoverage['/format.js'].lineData[156] = 0;
  _$jscoverage['/format.js'].lineData[159] = 0;
  _$jscoverage['/format.js'].lineData[164] = 0;
  _$jscoverage['/format.js'].lineData[165] = 0;
  _$jscoverage['/format.js'].lineData[166] = 0;
  _$jscoverage['/format.js'].lineData[167] = 0;
  _$jscoverage['/format.js'].lineData[168] = 0;
  _$jscoverage['/format.js'].lineData[169] = 0;
  _$jscoverage['/format.js'].lineData[171] = 0;
  _$jscoverage['/format.js'].lineData[172] = 0;
  _$jscoverage['/format.js'].lineData[173] = 0;
  _$jscoverage['/format.js'].lineData[174] = 0;
  _$jscoverage['/format.js'].lineData[175] = 0;
  _$jscoverage['/format.js'].lineData[176] = 0;
  _$jscoverage['/format.js'].lineData[178] = 0;
  _$jscoverage['/format.js'].lineData[179] = 0;
  _$jscoverage['/format.js'].lineData[183] = 0;
  _$jscoverage['/format.js'].lineData[184] = 0;
  _$jscoverage['/format.js'].lineData[187] = 0;
  _$jscoverage['/format.js'].lineData[188] = 0;
  _$jscoverage['/format.js'].lineData[189] = 0;
  _$jscoverage['/format.js'].lineData[190] = 0;
  _$jscoverage['/format.js'].lineData[193] = 0;
  _$jscoverage['/format.js'].lineData[194] = 0;
  _$jscoverage['/format.js'].lineData[196] = 0;
  _$jscoverage['/format.js'].lineData[198] = 0;
  _$jscoverage['/format.js'].lineData[199] = 0;
  _$jscoverage['/format.js'].lineData[200] = 0;
  _$jscoverage['/format.js'].lineData[202] = 0;
  _$jscoverage['/format.js'].lineData[203] = 0;
  _$jscoverage['/format.js'].lineData[204] = 0;
  _$jscoverage['/format.js'].lineData[206] = 0;
  _$jscoverage['/format.js'].lineData[207] = 0;
  _$jscoverage['/format.js'].lineData[209] = 0;
  _$jscoverage['/format.js'].lineData[210] = 0;
  _$jscoverage['/format.js'].lineData[211] = 0;
  _$jscoverage['/format.js'].lineData[212] = 0;
  _$jscoverage['/format.js'].lineData[213] = 0;
  _$jscoverage['/format.js'].lineData[215] = 0;
  _$jscoverage['/format.js'].lineData[217] = 0;
  _$jscoverage['/format.js'].lineData[219] = 0;
  _$jscoverage['/format.js'].lineData[221] = 0;
  _$jscoverage['/format.js'].lineData[223] = 0;
  _$jscoverage['/format.js'].lineData[224] = 0;
  _$jscoverage['/format.js'].lineData[227] = 0;
  _$jscoverage['/format.js'].lineData[229] = 0;
  _$jscoverage['/format.js'].lineData[232] = 0;
  _$jscoverage['/format.js'].lineData[234] = 0;
  _$jscoverage['/format.js'].lineData[236] = 0;
  _$jscoverage['/format.js'].lineData[238] = 0;
  _$jscoverage['/format.js'].lineData[240] = 0;
  _$jscoverage['/format.js'].lineData[242] = 0;
  _$jscoverage['/format.js'].lineData[243] = 0;
  _$jscoverage['/format.js'].lineData[244] = 0;
  _$jscoverage['/format.js'].lineData[245] = 0;
  _$jscoverage['/format.js'].lineData[247] = 0;
  _$jscoverage['/format.js'].lineData[248] = 0;
  _$jscoverage['/format.js'].lineData[259] = 0;
  _$jscoverage['/format.js'].lineData[260] = 0;
  _$jscoverage['/format.js'].lineData[261] = 0;
  _$jscoverage['/format.js'].lineData[263] = 0;
  _$jscoverage['/format.js'].lineData[266] = 0;
  _$jscoverage['/format.js'].lineData[267] = 0;
  _$jscoverage['/format.js'].lineData[271] = 0;
  _$jscoverage['/format.js'].lineData[272] = 0;
  _$jscoverage['/format.js'].lineData[273] = 0;
  _$jscoverage['/format.js'].lineData[274] = 0;
  _$jscoverage['/format.js'].lineData[276] = 0;
  _$jscoverage['/format.js'].lineData[277] = 0;
  _$jscoverage['/format.js'].lineData[280] = 0;
  _$jscoverage['/format.js'].lineData[286] = 0;
  _$jscoverage['/format.js'].lineData[287] = 0;
  _$jscoverage['/format.js'].lineData[288] = 0;
  _$jscoverage['/format.js'].lineData[289] = 0;
  _$jscoverage['/format.js'].lineData[292] = 0;
  _$jscoverage['/format.js'].lineData[295] = 0;
  _$jscoverage['/format.js'].lineData[296] = 0;
  _$jscoverage['/format.js'].lineData[298] = 0;
  _$jscoverage['/format.js'].lineData[299] = 0;
  _$jscoverage['/format.js'].lineData[300] = 0;
  _$jscoverage['/format.js'].lineData[301] = 0;
  _$jscoverage['/format.js'].lineData[304] = 0;
  _$jscoverage['/format.js'].lineData[307] = 0;
  _$jscoverage['/format.js'].lineData[308] = 0;
  _$jscoverage['/format.js'].lineData[309] = 0;
  _$jscoverage['/format.js'].lineData[310] = 0;
  _$jscoverage['/format.js'].lineData[311] = 0;
  _$jscoverage['/format.js'].lineData[313] = 0;
  _$jscoverage['/format.js'].lineData[314] = 0;
  _$jscoverage['/format.js'].lineData[315] = 0;
  _$jscoverage['/format.js'].lineData[318] = 0;
  _$jscoverage['/format.js'].lineData[320] = 0;
  _$jscoverage['/format.js'].lineData[321] = 0;
  _$jscoverage['/format.js'].lineData[322] = 0;
  _$jscoverage['/format.js'].lineData[324] = 0;
  _$jscoverage['/format.js'].lineData[330] = 0;
  _$jscoverage['/format.js'].lineData[331] = 0;
  _$jscoverage['/format.js'].lineData[332] = 0;
  _$jscoverage['/format.js'].lineData[333] = 0;
  _$jscoverage['/format.js'].lineData[335] = 0;
  _$jscoverage['/format.js'].lineData[337] = 0;
  _$jscoverage['/format.js'].lineData[338] = 0;
  _$jscoverage['/format.js'].lineData[339] = 0;
  _$jscoverage['/format.js'].lineData[340] = 0;
  _$jscoverage['/format.js'].lineData[341] = 0;
  _$jscoverage['/format.js'].lineData[344] = 0;
  _$jscoverage['/format.js'].lineData[347] = 0;
  _$jscoverage['/format.js'].lineData[349] = 0;
  _$jscoverage['/format.js'].lineData[350] = 0;
  _$jscoverage['/format.js'].lineData[351] = 0;
  _$jscoverage['/format.js'].lineData[352] = 0;
  _$jscoverage['/format.js'].lineData[353] = 0;
  _$jscoverage['/format.js'].lineData[356] = 0;
  _$jscoverage['/format.js'].lineData[358] = 0;
  _$jscoverage['/format.js'].lineData[360] = 0;
  _$jscoverage['/format.js'].lineData[361] = 0;
  _$jscoverage['/format.js'].lineData[362] = 0;
  _$jscoverage['/format.js'].lineData[364] = 0;
  _$jscoverage['/format.js'].lineData[367] = 0;
  _$jscoverage['/format.js'].lineData[368] = 0;
  _$jscoverage['/format.js'].lineData[371] = 0;
  _$jscoverage['/format.js'].lineData[372] = 0;
  _$jscoverage['/format.js'].lineData[374] = 0;
  _$jscoverage['/format.js'].lineData[376] = 0;
  _$jscoverage['/format.js'].lineData[377] = 0;
  _$jscoverage['/format.js'].lineData[379] = 0;
  _$jscoverage['/format.js'].lineData[381] = 0;
  _$jscoverage['/format.js'].lineData[384] = 0;
  _$jscoverage['/format.js'].lineData[386] = 0;
  _$jscoverage['/format.js'].lineData[388] = 0;
  _$jscoverage['/format.js'].lineData[389] = 0;
  _$jscoverage['/format.js'].lineData[390] = 0;
  _$jscoverage['/format.js'].lineData[391] = 0;
  _$jscoverage['/format.js'].lineData[392] = 0;
  _$jscoverage['/format.js'].lineData[393] = 0;
  _$jscoverage['/format.js'].lineData[397] = 0;
  _$jscoverage['/format.js'].lineData[400] = 0;
  _$jscoverage['/format.js'].lineData[402] = 0;
  _$jscoverage['/format.js'].lineData[403] = 0;
  _$jscoverage['/format.js'].lineData[404] = 0;
  _$jscoverage['/format.js'].lineData[405] = 0;
  _$jscoverage['/format.js'].lineData[407] = 0;
  _$jscoverage['/format.js'].lineData[409] = 0;
  _$jscoverage['/format.js'].lineData[411] = 0;
  _$jscoverage['/format.js'].lineData[412] = 0;
  _$jscoverage['/format.js'].lineData[413] = 0;
  _$jscoverage['/format.js'].lineData[414] = 0;
  _$jscoverage['/format.js'].lineData[416] = 0;
  _$jscoverage['/format.js'].lineData[418] = 0;
  _$jscoverage['/format.js'].lineData[420] = 0;
  _$jscoverage['/format.js'].lineData[421] = 0;
  _$jscoverage['/format.js'].lineData[423] = 0;
  _$jscoverage['/format.js'].lineData[424] = 0;
  _$jscoverage['/format.js'].lineData[425] = 0;
  _$jscoverage['/format.js'].lineData[426] = 0;
  _$jscoverage['/format.js'].lineData[427] = 0;
  _$jscoverage['/format.js'].lineData[429] = 0;
  _$jscoverage['/format.js'].lineData[431] = 0;
  _$jscoverage['/format.js'].lineData[432] = 0;
  _$jscoverage['/format.js'].lineData[433] = 0;
  _$jscoverage['/format.js'].lineData[434] = 0;
  _$jscoverage['/format.js'].lineData[435] = 0;
  _$jscoverage['/format.js'].lineData[437] = 0;
  _$jscoverage['/format.js'].lineData[439] = 0;
  _$jscoverage['/format.js'].lineData[450] = 0;
  _$jscoverage['/format.js'].lineData[451] = 0;
  _$jscoverage['/format.js'].lineData[452] = 0;
  _$jscoverage['/format.js'].lineData[455] = 0;
  _$jscoverage['/format.js'].lineData[456] = 0;
  _$jscoverage['/format.js'].lineData[458] = 0;
  _$jscoverage['/format.js'].lineData[461] = 0;
  _$jscoverage['/format.js'].lineData[463] = 0;
  _$jscoverage['/format.js'].lineData[464] = 0;
  _$jscoverage['/format.js'].lineData[465] = 0;
  _$jscoverage['/format.js'].lineData[466] = 0;
  _$jscoverage['/format.js'].lineData[470] = 0;
  _$jscoverage['/format.js'].lineData[471] = 0;
  _$jscoverage['/format.js'].lineData[472] = 0;
  _$jscoverage['/format.js'].lineData[473] = 0;
  _$jscoverage['/format.js'].lineData[474] = 0;
  _$jscoverage['/format.js'].lineData[475] = 0;
  _$jscoverage['/format.js'].lineData[478] = 0;
  _$jscoverage['/format.js'].lineData[481] = 0;
  _$jscoverage['/format.js'].lineData[493] = 0;
  _$jscoverage['/format.js'].lineData[494] = 0;
  _$jscoverage['/format.js'].lineData[495] = 0;
  _$jscoverage['/format.js'].lineData[496] = 0;
  _$jscoverage['/format.js'].lineData[497] = 0;
  _$jscoverage['/format.js'].lineData[498] = 0;
  _$jscoverage['/format.js'].lineData[499] = 0;
  _$jscoverage['/format.js'].lineData[500] = 0;
  _$jscoverage['/format.js'].lineData[502] = 0;
  _$jscoverage['/format.js'].lineData[503] = 0;
  _$jscoverage['/format.js'].lineData[504] = 0;
  _$jscoverage['/format.js'].lineData[505] = 0;
  _$jscoverage['/format.js'].lineData[508] = 0;
  _$jscoverage['/format.js'].lineData[510] = 0;
  _$jscoverage['/format.js'].lineData[511] = 0;
  _$jscoverage['/format.js'].lineData[512] = 0;
  _$jscoverage['/format.js'].lineData[513] = 0;
  _$jscoverage['/format.js'].lineData[514] = 0;
  _$jscoverage['/format.js'].lineData[515] = 0;
  _$jscoverage['/format.js'].lineData[517] = 0;
  _$jscoverage['/format.js'].lineData[518] = 0;
  _$jscoverage['/format.js'].lineData[519] = 0;
  _$jscoverage['/format.js'].lineData[523] = 0;
  _$jscoverage['/format.js'].lineData[531] = 0;
  _$jscoverage['/format.js'].lineData[532] = 0;
  _$jscoverage['/format.js'].lineData[538] = 0;
  _$jscoverage['/format.js'].lineData[539] = 0;
  _$jscoverage['/format.js'].lineData[540] = 0;
  _$jscoverage['/format.js'].lineData[541] = 0;
  _$jscoverage['/format.js'].lineData[543] = 0;
  _$jscoverage['/format.js'].lineData[547] = 0;
  _$jscoverage['/format.js'].lineData[554] = 0;
  _$jscoverage['/format.js'].lineData[556] = 0;
  _$jscoverage['/format.js'].lineData[559] = 0;
  _$jscoverage['/format.js'].lineData[562] = 0;
  _$jscoverage['/format.js'].lineData[563] = 0;
  _$jscoverage['/format.js'].lineData[564] = 0;
  _$jscoverage['/format.js'].lineData[565] = 0;
  _$jscoverage['/format.js'].lineData[567] = 0;
  _$jscoverage['/format.js'].lineData[568] = 0;
  _$jscoverage['/format.js'].lineData[569] = 0;
  _$jscoverage['/format.js'].lineData[571] = 0;
  _$jscoverage['/format.js'].lineData[572] = 0;
  _$jscoverage['/format.js'].lineData[573] = 0;
  _$jscoverage['/format.js'].lineData[574] = 0;
  _$jscoverage['/format.js'].lineData[579] = 0;
  _$jscoverage['/format.js'].lineData[582] = 0;
  _$jscoverage['/format.js'].lineData[585] = 0;
  _$jscoverage['/format.js'].lineData[589] = 0;
}
if (! _$jscoverage['/format.js'].functionData) {
  _$jscoverage['/format.js'].functionData = [];
  _$jscoverage['/format.js'].functionData[0] = 0;
  _$jscoverage['/format.js'].functionData[1] = 0;
  _$jscoverage['/format.js'].functionData[2] = 0;
  _$jscoverage['/format.js'].functionData[3] = 0;
  _$jscoverage['/format.js'].functionData[4] = 0;
  _$jscoverage['/format.js'].functionData[5] = 0;
  _$jscoverage['/format.js'].functionData[6] = 0;
  _$jscoverage['/format.js'].functionData[7] = 0;
  _$jscoverage['/format.js'].functionData[8] = 0;
  _$jscoverage['/format.js'].functionData[9] = 0;
  _$jscoverage['/format.js'].functionData[10] = 0;
  _$jscoverage['/format.js'].functionData[11] = 0;
  _$jscoverage['/format.js'].functionData[12] = 0;
  _$jscoverage['/format.js'].functionData[13] = 0;
  _$jscoverage['/format.js'].functionData[14] = 0;
  _$jscoverage['/format.js'].functionData[15] = 0;
  _$jscoverage['/format.js'].functionData[16] = 0;
  _$jscoverage['/format.js'].functionData[17] = 0;
}
if (! _$jscoverage['/format.js'].branchData) {
  _$jscoverage['/format.js'].branchData = {};
  _$jscoverage['/format.js'].branchData['77'] = [];
  _$jscoverage['/format.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['80'] = [];
  _$jscoverage['/format.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['83'] = [];
  _$jscoverage['/format.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['85'] = [];
  _$jscoverage['/format.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['87'] = [];
  _$jscoverage['/format.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['92'] = [];
  _$jscoverage['/format.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['98'] = [];
  _$jscoverage['/format.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['99'] = [];
  _$jscoverage['/format.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['114'] = [];
  _$jscoverage['/format.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['118'] = [];
  _$jscoverage['/format.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['118'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['118'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['118'][4] = new BranchData();
  _$jscoverage['/format.js'].branchData['118'][5] = new BranchData();
  _$jscoverage['/format.js'].branchData['118'][6] = new BranchData();
  _$jscoverage['/format.js'].branchData['118'][7] = new BranchData();
  _$jscoverage['/format.js'].branchData['118'][8] = new BranchData();
  _$jscoverage['/format.js'].branchData['119'] = [];
  _$jscoverage['/format.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['130'] = [];
  _$jscoverage['/format.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['135'] = [];
  _$jscoverage['/format.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['135'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['135'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'] = [];
  _$jscoverage['/format.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['149'] = [];
  _$jscoverage['/format.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['164'] = [];
  _$jscoverage['/format.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['165'] = [];
  _$jscoverage['/format.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['166'] = [];
  _$jscoverage['/format.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['167'] = [];
  _$jscoverage['/format.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['167'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['167'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['167'][4] = new BranchData();
  _$jscoverage['/format.js'].branchData['167'][5] = new BranchData();
  _$jscoverage['/format.js'].branchData['168'] = [];
  _$jscoverage['/format.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['168'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['168'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['173'] = [];
  _$jscoverage['/format.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['173'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['173'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['174'] = [];
  _$jscoverage['/format.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['178'] = [];
  _$jscoverage['/format.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['178'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['178'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['188'] = [];
  _$jscoverage['/format.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['198'] = [];
  _$jscoverage['/format.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['203'] = [];
  _$jscoverage['/format.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['206'] = [];
  _$jscoverage['/format.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['210'] = [];
  _$jscoverage['/format.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['212'] = [];
  _$jscoverage['/format.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['219'] = [];
  _$jscoverage['/format.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['224'] = [];
  _$jscoverage['/format.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['229'] = [];
  _$jscoverage['/format.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['235'] = [];
  _$jscoverage['/format.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['243'] = [];
  _$jscoverage['/format.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['271'] = [];
  _$jscoverage['/format.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['274'] = [];
  _$jscoverage['/format.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['274'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['280'] = [];
  _$jscoverage['/format.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['287'] = [];
  _$jscoverage['/format.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['288'] = [];
  _$jscoverage['/format.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['298'] = [];
  _$jscoverage['/format.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['300'] = [];
  _$jscoverage['/format.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['300'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['300'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['309'] = [];
  _$jscoverage['/format.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['310'] = [];
  _$jscoverage['/format.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['314'] = [];
  _$jscoverage['/format.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['321'] = [];
  _$jscoverage['/format.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['332'] = [];
  _$jscoverage['/format.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['337'] = [];
  _$jscoverage['/format.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['338'] = [];
  _$jscoverage['/format.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['339'] = [];
  _$jscoverage['/format.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['349'] = [];
  _$jscoverage['/format.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['351'] = [];
  _$jscoverage['/format.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['352'] = [];
  _$jscoverage['/format.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['361'] = [];
  _$jscoverage['/format.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['362'] = [];
  _$jscoverage['/format.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['362'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['367'] = [];
  _$jscoverage['/format.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['371'] = [];
  _$jscoverage['/format.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['376'] = [];
  _$jscoverage['/format.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['381'] = [];
  _$jscoverage['/format.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['381'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['388'] = [];
  _$jscoverage['/format.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['389'] = [];
  _$jscoverage['/format.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['390'] = [];
  _$jscoverage['/format.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['392'] = [];
  _$jscoverage['/format.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['402'] = [];
  _$jscoverage['/format.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['404'] = [];
  _$jscoverage['/format.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['411'] = [];
  _$jscoverage['/format.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['413'] = [];
  _$jscoverage['/format.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['420'] = [];
  _$jscoverage['/format.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['423'] = [];
  _$jscoverage['/format.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['426'] = [];
  _$jscoverage['/format.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['431'] = [];
  _$jscoverage['/format.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['434'] = [];
  _$jscoverage['/format.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['450'] = [];
  _$jscoverage['/format.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['455'] = [];
  _$jscoverage['/format.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['470'] = [];
  _$jscoverage['/format.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['472'] = [];
  _$jscoverage['/format.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['474'] = [];
  _$jscoverage['/format.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['494'] = [];
  _$jscoverage['/format.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['494'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['494'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['497'] = [];
  _$jscoverage['/format.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['499'] = [];
  _$jscoverage['/format.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['502'] = [];
  _$jscoverage['/format.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['503'] = [];
  _$jscoverage['/format.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['510'] = [];
  _$jscoverage['/format.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['513'] = [];
  _$jscoverage['/format.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['514'] = [];
  _$jscoverage['/format.js'].branchData['514'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['518'] = [];
  _$jscoverage['/format.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['518'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['518'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['531'] = [];
  _$jscoverage['/format.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['538'] = [];
  _$jscoverage['/format.js'].branchData['538'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['562'] = [];
  _$jscoverage['/format.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['564'] = [];
  _$jscoverage['/format.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['568'] = [];
  _$jscoverage['/format.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['572'] = [];
  _$jscoverage['/format.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['573'] = [];
  _$jscoverage['/format.js'].branchData['573'][1] = new BranchData();
}
_$jscoverage['/format.js'].branchData['573'][1].init(22, 11, 'datePattern');
function visit120_573_1(result) {
  _$jscoverage['/format.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['572'][1].init(419, 11, 'timePattern');
function visit119_572_1(result) {
  _$jscoverage['/format.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['568'][1].init(257, 23, 'timeStyle !== undefined');
function visit118_568_1(result) {
  _$jscoverage['/format.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['564'][1].init(100, 23, 'dateStyle !== undefined');
function visit117_564_1(result) {
  _$jscoverage['/format.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['562'][1].init(23, 23, 'locale || defaultLocale');
function visit116_562_1(result) {
  _$jscoverage['/format.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['538'][1].init(2447, 15, 'errorIndex >= 0');
function visit115_538_1(result) {
  _$jscoverage['/format.js'].branchData['538'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['531'][1].init(928, 27, 'startIndex == oldStartIndex');
function visit114_531_1(result) {
  _$jscoverage['/format.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['518'][3].init(116, 8, 'c <= \'9\'');
function visit113_518_3(result) {
  _$jscoverage['/format.js'].branchData['518'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['518'][2].init(104, 8, 'c >= \'0\'');
function visit112_518_2(result) {
  _$jscoverage['/format.js'].branchData['518'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['518'][1].init(104, 20, 'c >= \'0\' && c <= \'9\'');
function visit111_518_1(result) {
  _$jscoverage['/format.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['514'][1].init(34, 19, '\'field\' in nextComp');
function visit110_514_1(result) {
  _$jscoverage['/format.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['513'][1].init(130, 8, 'nextComp');
function visit109_513_1(result) {
  _$jscoverage['/format.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['510'][1].init(804, 15, '\'field\' in comp');
function visit108_510_1(result) {
  _$jscoverage['/format.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['503'][1].init(38, 48, 'text.charAt(j) != dateStr.charAt(j + startIndex)');
function visit107_503_1(result) {
  _$jscoverage['/format.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['502'][1].init(42, 11, 'j < textLen');
function visit106_502_1(result) {
  _$jscoverage['/format.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['499'][1].init(79, 34, '(textLen + startIndex) > dateStrLen');
function visit105_499_1(result) {
  _$jscoverage['/format.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['497'][1].init(134, 16, 'text = comp.text');
function visit104_497_1(result) {
  _$jscoverage['/format.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['494'][3].init(48, 7, 'i < len');
function visit103_494_3(result) {
  _$jscoverage['/format.js'].branchData['494'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['494'][2].init(30, 14, 'errorIndex < 0');
function visit102_494_2(result) {
  _$jscoverage['/format.js'].branchData['494'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['494'][1].init(30, 25, 'errorIndex < 0 && i < len');
function visit101_494_1(result) {
  _$jscoverage['/format.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['474'][1].init(146, 15, '\'field\' in comp');
function visit100_474_1(result) {
  _$jscoverage['/format.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['472'][1].init(62, 9, 'comp.text');
function visit99_472_1(result) {
  _$jscoverage['/format.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['470'][1].init(315, 7, 'i < len');
function visit98_470_1(result) {
  _$jscoverage['/format.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['455'][1].init(4803, 5, 'match');
function visit97_455_1(result) {
  _$jscoverage['/format.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['450'][1].init(299, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit96_450_1(result) {
  _$jscoverage['/format.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['434'][1].init(134, 49, 'match = matchNumber(dateStr, startIndex, 2, true)');
function visit95_434_1(result) {
  _$jscoverage['/format.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['431'][1].init(421, 49, 'match = matchNumber(dateStr, startIndex, 2, true)');
function visit94_431_1(result) {
  _$jscoverage['/format.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['426'][1].init(274, 15, 'zoneChar == \'+\'');
function visit93_426_1(result) {
  _$jscoverage['/format.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['423'][1].init(159, 15, 'zoneChar == \'-\'');
function visit92_423_1(result) {
  _$jscoverage['/format.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['420'][1].init(30, 7, 'dateStr');
function visit91_420_1(result) {
  _$jscoverage['/format.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['413'][1].init(67, 8, 'tmp.ampm');
function visit90_413_1(result) {
  _$jscoverage['/format.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['411'][1].init(30, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit89_411_1(result) {
  _$jscoverage['/format.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['404'][1].init(73, 8, 'tmp.ampm');
function visit88_404_1(result) {
  _$jscoverage['/format.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['402'][1].init(30, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit87_402_1(result) {
  _$jscoverage['/format.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['392'][1].init(95, 9, 'hour < 12');
function visit86_392_1(result) {
  _$jscoverage['/format.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['390'][1].init(30, 11, 'match.value');
function visit85_390_1(result) {
  _$jscoverage['/format.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['389'][1].init(26, 25, 'calendar.isSetHourOfDay()');
function visit84_389_1(result) {
  _$jscoverage['/format.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['388'][1].init(30, 53, 'match = matchField(dateStr, startIndex, locale.ampms)');
function visit83_388_1(result) {
  _$jscoverage['/format.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['381'][2].init(77, 9, 'count > 3');
function visit82_381_2(result) {
  _$jscoverage['/format.js'].branchData['381'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['381'][1].init(30, 131, 'match = matchField(dateStr, startIndex, locale[count > 3 ? \'weekdays\' : \'shortWeekdays\'])');
function visit81_381_1(result) {
  _$jscoverage['/format.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['376'][1].init(30, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit80_376_1(result) {
  _$jscoverage['/format.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['371'][1].init(505, 5, 'match');
function visit79_371_1(result) {
  _$jscoverage['/format.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['367'][1].init(26, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit78_367_1(result) {
  _$jscoverage['/format.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['362'][2].init(73, 10, 'count == 3');
function visit77_362_2(result) {
  _$jscoverage['/format.js'].branchData['362'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['362'][1].init(26, 111, 'match = matchField(dateStr, startIndex, locale[count == 3 ? \'shortMonths\' : \'months\'])');
function visit76_362_1(result) {
  _$jscoverage['/format.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['361'][1].init(58, 10, 'count >= 3');
function visit75_361_1(result) {
  _$jscoverage['/format.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['352'][1].init(30, 13, 'tmp.era === 0');
function visit74_352_1(result) {
  _$jscoverage['/format.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['351'][1].init(67, 12, '\'era\' in tmp');
function visit73_351_1(result) {
  _$jscoverage['/format.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['349'][1].init(30, 58, 'match = matchNumber(dateStr, startIndex, count, obeyCount)');
function visit72_349_1(result) {
  _$jscoverage['/format.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['339'][1].init(30, 16, 'match.value == 0');
function visit71_339_1(result) {
  _$jscoverage['/format.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['338'][1].init(26, 20, 'calendar.isSetYear()');
function visit70_338_1(result) {
  _$jscoverage['/format.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['337'][1].init(30, 52, 'match = matchField(dateStr, startIndex, locale.eras)');
function visit69_337_1(result) {
  _$jscoverage['/format.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['332'][1].init(46, 28, 'dateStr.length <= startIndex');
function visit68_332_1(result) {
  _$jscoverage['/format.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['321'][1].init(423, 8, 'isNaN(n)');
function visit67_321_1(result) {
  _$jscoverage['/format.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['314'][1].init(177, 19, '!str.match(/^\\d+$/)');
function visit66_314_1(result) {
  _$jscoverage['/format.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['310'][1].init(18, 36, 'dateStr.length <= startIndex + count');
function visit65_310_1(result) {
  _$jscoverage['/format.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['309'][1].init(46, 9, 'obeyCount');
function visit64_309_1(result) {
  _$jscoverage['/format.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['300'][3].init(61, 7, 'c > \'9\'');
function visit63_300_3(result) {
  _$jscoverage['/format.js'].branchData['300'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['300'][2].init(50, 7, 'c < \'0\'');
function visit62_300_2(result) {
  _$jscoverage['/format.js'].branchData['300'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['300'][1].init(50, 18, 'c < \'0\' || c > \'9\'');
function visit61_300_1(result) {
  _$jscoverage['/format.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['298'][1].init(72, 7, 'i < len');
function visit60_298_1(result) {
  _$jscoverage['/format.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['288'][1].init(18, 49, 'dateStr.charAt(startIndex + i) != match.charAt(i)');
function visit59_288_1(result) {
  _$jscoverage['/format.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['287'][1].init(26, 8, 'i < mLen');
function visit58_287_1(result) {
  _$jscoverage['/format.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['280'][1].init(421, 10, 'index >= 0');
function visit57_280_1(result) {
  _$jscoverage['/format.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['274'][2].init(85, 17, 'mLen > matchedLen');
function visit56_274_2(result) {
  _$jscoverage['/format.js'].branchData['274'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['274'][1].init(85, 83, 'mLen > matchedLen && matchPartString(dateStr, startIndex, m, mLen)');
function visit55_274_1(result) {
  _$jscoverage['/format.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['271'][1].init(128, 7, 'i < len');
function visit54_271_1(result) {
  _$jscoverage['/format.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['243'][1].init(99, 10, 'offset < 0');
function visit53_243_1(result) {
  _$jscoverage['/format.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['235'][1].init(17, 56, 'calendar.getHourOfDay() % 12 || 12');
function visit52_235_1(result) {
  _$jscoverage['/format.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['229'][1].init(49, 29, 'calendar.getHourOfDay() >= 12');
function visit51_229_1(result) {
  _$jscoverage['/format.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['224'][1].init(86, 10, 'count >= 4');
function visit50_224_1(result) {
  _$jscoverage['/format.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['219'][1].init(54, 28, 'calendar.getHourOfDay() || 24');
function visit49_219_1(result) {
  _$jscoverage['/format.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['212'][1].init(172, 10, 'count == 3');
function visit48_212_1(result) {
  _$jscoverage['/format.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['210'][1].init(76, 10, 'count >= 4');
function visit47_210_1(result) {
  _$jscoverage['/format.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['206'][1].init(204, 10, 'count != 2');
function visit46_206_1(result) {
  _$jscoverage['/format.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['203'][1].init(75, 10, 'value <= 0');
function visit45_203_1(result) {
  _$jscoverage['/format.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['198'][1].init(34, 22, 'calendar.getYear() > 0');
function visit44_198_1(result) {
  _$jscoverage['/format.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['188'][1].init(24, 23, 'locale || defaultLocale');
function visit43_188_1(result) {
  _$jscoverage['/format.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['178'][3].init(184, 14, 'maxDigits == 2');
function visit42_178_3(result) {
  _$jscoverage['/format.js'].branchData['178'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['178'][2].init(166, 14, 'minDigits == 2');
function visit41_178_2(result) {
  _$jscoverage['/format.js'].branchData['178'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['178'][1].init(166, 32, 'minDigits == 2 && maxDigits == 2');
function visit40_178_1(result) {
  _$jscoverage['/format.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['174'][1].init(22, 14, 'minDigits == 4');
function visit39_174_1(result) {
  _$jscoverage['/format.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['173'][3].init(306, 13, 'value < 10000');
function visit38_173_3(result) {
  _$jscoverage['/format.js'].branchData['173'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['173'][2].init(289, 13, 'value >= 1000');
function visit37_173_2(result) {
  _$jscoverage['/format.js'].branchData['173'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['173'][1].init(289, 30, 'value >= 1000 && value < 10000');
function visit36_173_1(result) {
  _$jscoverage['/format.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['168'][3].init(36, 14, 'minDigits == 2');
function visit35_168_3(result) {
  _$jscoverage['/format.js'].branchData['168'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['168'][2].init(22, 10, 'value < 10');
function visit34_168_2(result) {
  _$jscoverage['/format.js'].branchData['168'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['168'][1].init(22, 28, 'value < 10 && minDigits == 2');
function visit33_168_1(result) {
  _$jscoverage['/format.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['167'][5].init(51, 14, 'minDigits <= 2');
function visit32_167_5(result) {
  _$jscoverage['/format.js'].branchData['167'][5].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['167'][4].init(33, 14, 'minDigits >= 1');
function visit31_167_4(result) {
  _$jscoverage['/format.js'].branchData['167'][4].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['167'][3].init(33, 32, 'minDigits >= 1 && minDigits <= 2');
function visit30_167_3(result) {
  _$jscoverage['/format.js'].branchData['167'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['167'][2].init(18, 11, 'value < 100');
function visit29_167_2(result) {
  _$jscoverage['/format.js'].branchData['167'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['167'][1].init(18, 47, 'value < 100 && minDigits >= 1 && minDigits <= 2');
function visit28_167_1(result) {
  _$jscoverage['/format.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['166'][1].init(362, 10, 'value >= 0');
function visit27_166_1(result) {
  _$jscoverage['/format.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['165'][1].init(325, 22, 'maxDigits || MAX_VALUE');
function visit26_165_1(result) {
  _$jscoverage['/format.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['164'][1].init(290, 12, 'buffer || []');
function visit25_164_1(result) {
  _$jscoverage['/format.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['149'][1].init(2577, 10, 'count != 0');
function visit24_149_1(result) {
  _$jscoverage['/format.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][1].init(2488, 7, 'inQuote');
function visit23_145_1(result) {
  _$jscoverage['/format.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['135'][3].init(2003, 14, 'lastField == c');
function visit22_135_3(result) {
  _$jscoverage['/format.js'].branchData['135'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['135'][2].init(1984, 15, 'lastField == -1');
function visit21_135_2(result) {
  _$jscoverage['/format.js'].branchData['135'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['135'][1].init(1984, 33, 'lastField == -1 || lastField == c');
function visit20_135_1(result) {
  _$jscoverage['/format.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['130'][1].init(1816, 29, 'patternChars.indexOf(c) == -1');
function visit19_130_1(result) {
  _$jscoverage['/format.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['119'][1].init(22, 10, 'count != 0');
function visit18_119_1(result) {
  _$jscoverage['/format.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['118'][8].init(1465, 8, 'c <= \'Z\'');
function visit17_118_8(result) {
  _$jscoverage['/format.js'].branchData['118'][8].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['118'][7].init(1453, 8, 'c >= \'A\'');
function visit16_118_7(result) {
  _$jscoverage['/format.js'].branchData['118'][7].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['118'][6].init(1453, 20, 'c >= \'A\' && c <= \'Z\'');
function visit15_118_6(result) {
  _$jscoverage['/format.js'].branchData['118'][6].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['118'][5].init(1441, 8, 'c <= \'z\'');
function visit14_118_5(result) {
  _$jscoverage['/format.js'].branchData['118'][5].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['118'][4].init(1429, 8, 'c >= \'a\'');
function visit13_118_4(result) {
  _$jscoverage['/format.js'].branchData['118'][4].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['118'][3].init(1429, 20, 'c >= \'a\' && c <= \'z\'');
function visit12_118_3(result) {
  _$jscoverage['/format.js'].branchData['118'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['118'][2].init(1429, 44, 'c >= \'a\' && c <= \'z\' || c >= \'A\' && c <= \'Z\'');
function visit11_118_2(result) {
  _$jscoverage['/format.js'].branchData['118'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['118'][1].init(1427, 47, '!(c >= \'a\' && c <= \'z\' || c >= \'A\' && c <= \'Z\')');
function visit10_118_1(result) {
  _$jscoverage['/format.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['114'][1].init(1324, 7, 'inQuote');
function visit9_114_1(result) {
  _$jscoverage['/format.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['99'][1].init(26, 10, 'count != 0');
function visit8_99_1(result) {
  _$jscoverage['/format.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['98'][1].init(708, 8, '!inQuote');
function visit7_98_1(result) {
  _$jscoverage['/format.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['92'][1].init(287, 7, 'inQuote');
function visit6_92_1(result) {
  _$jscoverage['/format.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['87'][1].init(60, 10, 'count != 0');
function visit5_87_1(result) {
  _$jscoverage['/format.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['85'][1].init(74, 9, 'c == \'\\\'\'');
function visit4_85_1(result) {
  _$jscoverage['/format.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['83'][1].init(136, 15, '(i + 1) < length');
function visit3_83_1(result) {
  _$jscoverage['/format.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['80'][1].init(60, 8, 'c == "\'"');
function visit2_80_1(result) {
  _$jscoverage['/format.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['77'][1].init(215, 10, 'i < length');
function visit1_77_1(result) {
  _$jscoverage['/format.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].lineData[6]++;
KISSY.add('date/format', function(S, GregorianCalendar, defaultLocale) {
  _$jscoverage['/format.js'].functionData[0]++;
  _$jscoverage['/format.js'].lineData[7]++;
  var MAX_VALUE = Number.MAX_VALUE;
  _$jscoverage['/format.js'].lineData[33]++;
  var patternChars = new Array(GregorianCalendar.DAY_OF_WEEK_IN_MONTH + 2).join('1');
  _$jscoverage['/format.js'].lineData[36]++;
  var ERA = 0;
  _$jscoverage['/format.js'].lineData[38]++;
  var calendarIndexMap = {};
  _$jscoverage['/format.js'].lineData[40]++;
  patternChars = patternChars.split('');
  _$jscoverage['/format.js'].lineData[41]++;
  patternChars[ERA] = 'G';
  _$jscoverage['/format.js'].lineData[42]++;
  patternChars[GregorianCalendar.YEAR] = 'y';
  _$jscoverage['/format.js'].lineData[43]++;
  patternChars[GregorianCalendar.MONTH] = 'M';
  _$jscoverage['/format.js'].lineData[44]++;
  patternChars[GregorianCalendar.DAY_OF_MONTH] = 'd';
  _$jscoverage['/format.js'].lineData[45]++;
  patternChars[GregorianCalendar.HOUR_OF_DAY] = 'H';
  _$jscoverage['/format.js'].lineData[46]++;
  patternChars[GregorianCalendar.MINUTES] = 'm';
  _$jscoverage['/format.js'].lineData[47]++;
  patternChars[GregorianCalendar.SECONDS] = 's';
  _$jscoverage['/format.js'].lineData[48]++;
  patternChars[GregorianCalendar.MILLISECONDS] = 'S';
  _$jscoverage['/format.js'].lineData[49]++;
  patternChars[GregorianCalendar.WEEK_OF_YEAR] = 'w';
  _$jscoverage['/format.js'].lineData[50]++;
  patternChars[GregorianCalendar.WEEK_OF_MONTH] = 'W';
  _$jscoverage['/format.js'].lineData[51]++;
  patternChars[GregorianCalendar.DAY_OF_YEAR] = 'D';
  _$jscoverage['/format.js'].lineData[52]++;
  patternChars[GregorianCalendar.DAY_OF_WEEK_IN_MONTH] = 'F';
  _$jscoverage['/format.js'].lineData[54]++;
  S.each(patternChars, function(v, index) {
  _$jscoverage['/format.js'].functionData[1]++;
  _$jscoverage['/format.js'].lineData[55]++;
  calendarIndexMap[v] = index;
});
  _$jscoverage['/format.js'].lineData[58]++;
  patternChars = patternChars.join('') + 'ahkKZE';
  _$jscoverage['/format.js'].lineData[62]++;
  function encode(lastField, count, compiledPattern) {
    _$jscoverage['/format.js'].functionData[2]++;
    _$jscoverage['/format.js'].lineData[63]++;
    compiledPattern.push({
  field: lastField, 
  count: count});
  }
  _$jscoverage['/format.js'].lineData[69]++;
  function compile(pattern) {
    _$jscoverage['/format.js'].functionData[3]++;
    _$jscoverage['/format.js'].lineData[70]++;
    var length = pattern.length;
    _$jscoverage['/format.js'].lineData[71]++;
    var inQuote = false;
    _$jscoverage['/format.js'].lineData[72]++;
    var compiledPattern = [];
    _$jscoverage['/format.js'].lineData[73]++;
    var tmpBuffer = null;
    _$jscoverage['/format.js'].lineData[74]++;
    var count = 0;
    _$jscoverage['/format.js'].lineData[75]++;
    var lastField = -1;
    _$jscoverage['/format.js'].lineData[77]++;
    for (var i = 0; visit1_77_1(i < length); i++) {
      _$jscoverage['/format.js'].lineData[78]++;
      var c = pattern.charAt(i);
      _$jscoverage['/format.js'].lineData[80]++;
      if (visit2_80_1(c == "'")) {
        _$jscoverage['/format.js'].lineData[83]++;
        if (visit3_83_1((i + 1) < length)) {
          _$jscoverage['/format.js'].lineData[84]++;
          c = pattern.charAt(i + 1);
          _$jscoverage['/format.js'].lineData[85]++;
          if (visit4_85_1(c == '\'')) {
            _$jscoverage['/format.js'].lineData[86]++;
            i++;
            _$jscoverage['/format.js'].lineData[87]++;
            if (visit5_87_1(count != 0)) {
              _$jscoverage['/format.js'].lineData[88]++;
              encode(lastField, count, compiledPattern);
              _$jscoverage['/format.js'].lineData[89]++;
              lastField = -1;
              _$jscoverage['/format.js'].lineData[90]++;
              count = 0;
            }
            _$jscoverage['/format.js'].lineData[92]++;
            if (visit6_92_1(inQuote)) {
              _$jscoverage['/format.js'].lineData[93]++;
              tmpBuffer += c;
            }
            _$jscoverage['/format.js'].lineData[95]++;
            continue;
          }
        }
        _$jscoverage['/format.js'].lineData[98]++;
        if (visit7_98_1(!inQuote)) {
          _$jscoverage['/format.js'].lineData[99]++;
          if (visit8_99_1(count != 0)) {
            _$jscoverage['/format.js'].lineData[100]++;
            encode(lastField, count, compiledPattern);
            _$jscoverage['/format.js'].lineData[101]++;
            lastField = -1;
            _$jscoverage['/format.js'].lineData[102]++;
            count = 0;
          }
          _$jscoverage['/format.js'].lineData[104]++;
          tmpBuffer = '';
          _$jscoverage['/format.js'].lineData[105]++;
          inQuote = true;
        } else {
          _$jscoverage['/format.js'].lineData[107]++;
          compiledPattern.push({
  text: tmpBuffer});
          _$jscoverage['/format.js'].lineData[110]++;
          inQuote = false;
        }
        _$jscoverage['/format.js'].lineData[112]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[114]++;
      if (visit9_114_1(inQuote)) {
        _$jscoverage['/format.js'].lineData[115]++;
        tmpBuffer += c;
        _$jscoverage['/format.js'].lineData[116]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[118]++;
      if (visit10_118_1(!(visit11_118_2(visit12_118_3(visit13_118_4(c >= 'a') && visit14_118_5(c <= 'z')) || visit15_118_6(visit16_118_7(c >= 'A') && visit17_118_8(c <= 'Z')))))) {
        _$jscoverage['/format.js'].lineData[119]++;
        if (visit18_119_1(count != 0)) {
          _$jscoverage['/format.js'].lineData[120]++;
          encode(lastField, count, compiledPattern);
          _$jscoverage['/format.js'].lineData[121]++;
          lastField = -1;
          _$jscoverage['/format.js'].lineData[122]++;
          count = 0;
        }
        _$jscoverage['/format.js'].lineData[124]++;
        compiledPattern.push({
  text: c});
        _$jscoverage['/format.js'].lineData[127]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[130]++;
      if (visit19_130_1(patternChars.indexOf(c) == -1)) {
        _$jscoverage['/format.js'].lineData[131]++;
        throw new Error("Illegal pattern character " + "'" + c + "'");
      }
      _$jscoverage['/format.js'].lineData[135]++;
      if (visit20_135_1(visit21_135_2(lastField == -1) || visit22_135_3(lastField == c))) {
        _$jscoverage['/format.js'].lineData[136]++;
        lastField = c;
        _$jscoverage['/format.js'].lineData[137]++;
        count++;
        _$jscoverage['/format.js'].lineData[138]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[140]++;
      encode(lastField, count, compiledPattern);
      _$jscoverage['/format.js'].lineData[141]++;
      lastField = c;
      _$jscoverage['/format.js'].lineData[142]++;
      count = 1;
    }
    _$jscoverage['/format.js'].lineData[145]++;
    if (visit23_145_1(inQuote)) {
      _$jscoverage['/format.js'].lineData[146]++;
      throw new Error("Unterminated quote");
    }
    _$jscoverage['/format.js'].lineData[149]++;
    if (visit24_149_1(count != 0)) {
      _$jscoverage['/format.js'].lineData[150]++;
      encode(lastField, count, compiledPattern);
    }
    _$jscoverage['/format.js'].lineData[153]++;
    return compiledPattern;
  }
  _$jscoverage['/format.js'].lineData[156]++;
  var zeroDigit = '0';
  _$jscoverage['/format.js'].lineData[159]++;
  function zeroPaddingNumber(value, minDigits, maxDigits, buffer) {
    _$jscoverage['/format.js'].functionData[4]++;
    _$jscoverage['/format.js'].lineData[164]++;
    buffer = visit25_164_1(buffer || []);
    _$jscoverage['/format.js'].lineData[165]++;
    maxDigits = visit26_165_1(maxDigits || MAX_VALUE);
    _$jscoverage['/format.js'].lineData[166]++;
    if (visit27_166_1(value >= 0)) {
      _$jscoverage['/format.js'].lineData[167]++;
      if (visit28_167_1(visit29_167_2(value < 100) && visit30_167_3(visit31_167_4(minDigits >= 1) && visit32_167_5(minDigits <= 2)))) {
        _$jscoverage['/format.js'].lineData[168]++;
        if (visit33_168_1(visit34_168_2(value < 10) && visit35_168_3(minDigits == 2))) {
          _$jscoverage['/format.js'].lineData[169]++;
          buffer.push(zeroDigit);
        }
        _$jscoverage['/format.js'].lineData[171]++;
        buffer.push(value);
        _$jscoverage['/format.js'].lineData[172]++;
        return buffer.join('');
      } else {
        _$jscoverage['/format.js'].lineData[173]++;
        if (visit36_173_1(visit37_173_2(value >= 1000) && visit38_173_3(value < 10000))) {
          _$jscoverage['/format.js'].lineData[174]++;
          if (visit39_174_1(minDigits == 4)) {
            _$jscoverage['/format.js'].lineData[175]++;
            buffer.push(value);
            _$jscoverage['/format.js'].lineData[176]++;
            return buffer.join('');
          }
          _$jscoverage['/format.js'].lineData[178]++;
          if (visit40_178_1(visit41_178_2(minDigits == 2) && visit42_178_3(maxDigits == 2))) {
            _$jscoverage['/format.js'].lineData[179]++;
            return zeroPaddingNumber(value % 100, 2, 2, buffer);
          }
        }
      }
    }
    _$jscoverage['/format.js'].lineData[183]++;
    buffer.push(value + '');
    _$jscoverage['/format.js'].lineData[184]++;
    return buffer.join('');
  }
  _$jscoverage['/format.js'].lineData[187]++;
  function DateTimeFormat(pattern, locale, timeZoneOffset) {
    _$jscoverage['/format.js'].functionData[5]++;
    _$jscoverage['/format.js'].lineData[188]++;
    this.locale = visit43_188_1(locale || defaultLocale);
    _$jscoverage['/format.js'].lineData[189]++;
    this.pattern = compile(pattern);
    _$jscoverage['/format.js'].lineData[190]++;
    this.timezoneOffset = timeZoneOffset;
  }
  _$jscoverage['/format.js'].lineData[193]++;
  function formatField(field, count, locale, calendar) {
    _$jscoverage['/format.js'].functionData[6]++;
    _$jscoverage['/format.js'].lineData[194]++;
    var current, value;
    _$jscoverage['/format.js'].lineData[196]++;
    switch (field) {
      case 'G':
        _$jscoverage['/format.js'].lineData[198]++;
        value = visit44_198_1(calendar.getYear() > 0) ? 1 : 0;
        _$jscoverage['/format.js'].lineData[199]++;
        current = locale.eras[value];
        _$jscoverage['/format.js'].lineData[200]++;
        break;
      case 'y':
        _$jscoverage['/format.js'].lineData[202]++;
        value = calendar.getYear();
        _$jscoverage['/format.js'].lineData[203]++;
        if (visit45_203_1(value <= 0)) {
          _$jscoverage['/format.js'].lineData[204]++;
          value = 1 - value;
        }
        _$jscoverage['/format.js'].lineData[206]++;
        current = (zeroPaddingNumber(value, 2, visit46_206_1(count != 2) ? MAX_VALUE : 2));
        _$jscoverage['/format.js'].lineData[207]++;
        break;
      case 'M':
        _$jscoverage['/format.js'].lineData[209]++;
        value = calendar.getMonth();
        _$jscoverage['/format.js'].lineData[210]++;
        if (visit47_210_1(count >= 4)) {
          _$jscoverage['/format.js'].lineData[211]++;
          current = locale.months[value];
        } else {
          _$jscoverage['/format.js'].lineData[212]++;
          if (visit48_212_1(count == 3)) {
            _$jscoverage['/format.js'].lineData[213]++;
            current = locale.shortMonths[value];
          } else {
            _$jscoverage['/format.js'].lineData[215]++;
            current = zeroPaddingNumber(value + 1, count);
          }
        }
        _$jscoverage['/format.js'].lineData[217]++;
        break;
      case 'k':
        _$jscoverage['/format.js'].lineData[219]++;
        current = zeroPaddingNumber(visit49_219_1(calendar.getHourOfDay() || 24), count);
        _$jscoverage['/format.js'].lineData[221]++;
        break;
      case 'E':
        _$jscoverage['/format.js'].lineData[223]++;
        value = calendar.getDayOfWeek();
        _$jscoverage['/format.js'].lineData[224]++;
        current = visit50_224_1(count >= 4) ? locale.weekdays[value] : locale.shortWeekdays[value];
        _$jscoverage['/format.js'].lineData[227]++;
        break;
      case 'a':
        _$jscoverage['/format.js'].lineData[229]++;
        current = locale.ampms[visit51_229_1(calendar.getHourOfDay() >= 12) ? 1 : 0];
        _$jscoverage['/format.js'].lineData[232]++;
        break;
      case 'h':
        _$jscoverage['/format.js'].lineData[234]++;
        current = zeroPaddingNumber(visit52_235_1(calendar.getHourOfDay() % 12 || 12), count);
        _$jscoverage['/format.js'].lineData[236]++;
        break;
      case 'K':
        _$jscoverage['/format.js'].lineData[238]++;
        current = zeroPaddingNumber(calendar.getHourOfDay() % 12, count);
        _$jscoverage['/format.js'].lineData[240]++;
        break;
      case 'Z':
        _$jscoverage['/format.js'].lineData[242]++;
        var offset = calendar.getTimezoneOffset();
        _$jscoverage['/format.js'].lineData[243]++;
        var parts = [visit53_243_1(offset < 0) ? '-' : '+'];
        _$jscoverage['/format.js'].lineData[244]++;
        offset = Math.abs(offset);
        _$jscoverage['/format.js'].lineData[245]++;
        parts.push(zeroPaddingNumber(Math.floor(offset / 60) % 100, 2), zeroPaddingNumber(offset % 60, 2));
        _$jscoverage['/format.js'].lineData[247]++;
        current = parts.join('');
        _$jscoverage['/format.js'].lineData[248]++;
        break;
      default:
        _$jscoverage['/format.js'].lineData[259]++;
        var index = calendarIndexMap[field];
        _$jscoverage['/format.js'].lineData[260]++;
        value = calendar.get(index);
        _$jscoverage['/format.js'].lineData[261]++;
        current = zeroPaddingNumber(value, count);
    }
    _$jscoverage['/format.js'].lineData[263]++;
    return current;
  }
  _$jscoverage['/format.js'].lineData[266]++;
  function matchField(dateStr, startIndex, matches) {
    _$jscoverage['/format.js'].functionData[7]++;
    _$jscoverage['/format.js'].lineData[267]++;
    var matchedLen = -1, index = -1, i, len = matches.length;
    _$jscoverage['/format.js'].lineData[271]++;
    for (i = 0; visit54_271_1(i < len); i++) {
      _$jscoverage['/format.js'].lineData[272]++;
      var m = matches[i];
      _$jscoverage['/format.js'].lineData[273]++;
      var mLen = m.length;
      _$jscoverage['/format.js'].lineData[274]++;
      if (visit55_274_1(visit56_274_2(mLen > matchedLen) && matchPartString(dateStr, startIndex, m, mLen))) {
        _$jscoverage['/format.js'].lineData[276]++;
        matchedLen = mLen;
        _$jscoverage['/format.js'].lineData[277]++;
        index = i;
      }
    }
    _$jscoverage['/format.js'].lineData[280]++;
    return visit57_280_1(index >= 0) ? {
  value: index, 
  startIndex: startIndex + matchedLen} : null;
  }
  _$jscoverage['/format.js'].lineData[286]++;
  function matchPartString(dateStr, startIndex, match, mLen) {
    _$jscoverage['/format.js'].functionData[8]++;
    _$jscoverage['/format.js'].lineData[287]++;
    for (var i = 0; visit58_287_1(i < mLen); i++) {
      _$jscoverage['/format.js'].lineData[288]++;
      if (visit59_288_1(dateStr.charAt(startIndex + i) != match.charAt(i))) {
        _$jscoverage['/format.js'].lineData[289]++;
        return false;
      }
    }
    _$jscoverage['/format.js'].lineData[292]++;
    return true;
  }
  _$jscoverage['/format.js'].lineData[295]++;
  function getLeadingNumberLen(str) {
    _$jscoverage['/format.js'].functionData[9]++;
    _$jscoverage['/format.js'].lineData[296]++;
    var i, c, len = str.length;
    _$jscoverage['/format.js'].lineData[298]++;
    for (i = 0; visit60_298_1(i < len); i++) {
      _$jscoverage['/format.js'].lineData[299]++;
      c = str.charAt(i);
      _$jscoverage['/format.js'].lineData[300]++;
      if (visit61_300_1(visit62_300_2(c < '0') || visit63_300_3(c > '9'))) {
        _$jscoverage['/format.js'].lineData[301]++;
        break;
      }
    }
    _$jscoverage['/format.js'].lineData[304]++;
    return i;
  }
  _$jscoverage['/format.js'].lineData[307]++;
  function matchNumber(dateStr, startIndex, count, obeyCount) {
    _$jscoverage['/format.js'].functionData[10]++;
    _$jscoverage['/format.js'].lineData[308]++;
    var str = dateStr, n;
    _$jscoverage['/format.js'].lineData[309]++;
    if (visit64_309_1(obeyCount)) {
      _$jscoverage['/format.js'].lineData[310]++;
      if (visit65_310_1(dateStr.length <= startIndex + count)) {
        _$jscoverage['/format.js'].lineData[311]++;
        return null;
      }
      _$jscoverage['/format.js'].lineData[313]++;
      str = dateStr.substring(startIndex, count);
      _$jscoverage['/format.js'].lineData[314]++;
      if (visit66_314_1(!str.match(/^\d+$/))) {
        _$jscoverage['/format.js'].lineData[315]++;
        return null;
      }
    } else {
      _$jscoverage['/format.js'].lineData[318]++;
      str = str.substring(startIndex);
    }
    _$jscoverage['/format.js'].lineData[320]++;
    n = parseInt(str, 10);
    _$jscoverage['/format.js'].lineData[321]++;
    if (visit67_321_1(isNaN(n))) {
      _$jscoverage['/format.js'].lineData[322]++;
      return null;
    }
    _$jscoverage['/format.js'].lineData[324]++;
    return {
  value: n, 
  startIndex: startIndex + getLeadingNumberLen(str)};
  }
  _$jscoverage['/format.js'].lineData[330]++;
  function parseField(calendar, dateStr, startIndex, field, count, locale, obeyCount, tmp) {
    _$jscoverage['/format.js'].functionData[11]++;
    _$jscoverage['/format.js'].lineData[331]++;
    var match, year, hour;
    _$jscoverage['/format.js'].lineData[332]++;
    if (visit68_332_1(dateStr.length <= startIndex)) {
      _$jscoverage['/format.js'].lineData[333]++;
      return startIndex;
    }
    _$jscoverage['/format.js'].lineData[335]++;
    switch (field) {
      case 'G':
        _$jscoverage['/format.js'].lineData[337]++;
        if (visit69_337_1(match = matchField(dateStr, startIndex, locale.eras))) {
          _$jscoverage['/format.js'].lineData[338]++;
          if (visit70_338_1(calendar.isSetYear())) {
            _$jscoverage['/format.js'].lineData[339]++;
            if (visit71_339_1(match.value == 0)) {
              _$jscoverage['/format.js'].lineData[340]++;
              year = calendar.getYear();
              _$jscoverage['/format.js'].lineData[341]++;
              calendar.setYear(1 - year);
            }
          } else {
            _$jscoverage['/format.js'].lineData[344]++;
            tmp.era = match.value;
          }
        }
        _$jscoverage['/format.js'].lineData[347]++;
        break;
      case 'y':
        _$jscoverage['/format.js'].lineData[349]++;
        if (visit72_349_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[350]++;
          year = match.value;
          _$jscoverage['/format.js'].lineData[351]++;
          if (visit73_351_1('era' in tmp)) {
            _$jscoverage['/format.js'].lineData[352]++;
            if (visit74_352_1(tmp.era === 0)) {
              _$jscoverage['/format.js'].lineData[353]++;
              year = 1 - year;
            }
          }
          _$jscoverage['/format.js'].lineData[356]++;
          calendar.setYear(year);
        }
        _$jscoverage['/format.js'].lineData[358]++;
        break;
      case 'M':
        _$jscoverage['/format.js'].lineData[360]++;
        var month;
        _$jscoverage['/format.js'].lineData[361]++;
        if (visit75_361_1(count >= 3)) {
          _$jscoverage['/format.js'].lineData[362]++;
          if (visit76_362_1(match = matchField(dateStr, startIndex, locale[visit77_362_2(count == 3) ? 'shortMonths' : 'months']))) {
            _$jscoverage['/format.js'].lineData[364]++;
            month = match.value;
          }
        } else {
          _$jscoverage['/format.js'].lineData[367]++;
          if (visit78_367_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
            _$jscoverage['/format.js'].lineData[368]++;
            month = match.value - 1;
          }
        }
        _$jscoverage['/format.js'].lineData[371]++;
        if (visit79_371_1(match)) {
          _$jscoverage['/format.js'].lineData[372]++;
          calendar.setMonth(month);
        }
        _$jscoverage['/format.js'].lineData[374]++;
        break;
      case 'k':
        _$jscoverage['/format.js'].lineData[376]++;
        if (visit80_376_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[377]++;
          calendar.setHourOfDay(match.value % 24);
        }
        _$jscoverage['/format.js'].lineData[379]++;
        break;
      case 'E':
        _$jscoverage['/format.js'].lineData[381]++;
        if (visit81_381_1(match = matchField(dateStr, startIndex, locale[visit82_381_2(count > 3) ? 'weekdays' : 'shortWeekdays']))) {
          _$jscoverage['/format.js'].lineData[384]++;
          calendar.setDayOfWeek(match.value);
        }
        _$jscoverage['/format.js'].lineData[386]++;
        break;
      case 'a':
        _$jscoverage['/format.js'].lineData[388]++;
        if (visit83_388_1(match = matchField(dateStr, startIndex, locale.ampms))) {
          _$jscoverage['/format.js'].lineData[389]++;
          if (visit84_389_1(calendar.isSetHourOfDay())) {
            _$jscoverage['/format.js'].lineData[390]++;
            if (visit85_390_1(match.value)) {
              _$jscoverage['/format.js'].lineData[391]++;
              hour = calendar.getHourOfDay();
              _$jscoverage['/format.js'].lineData[392]++;
              if (visit86_392_1(hour < 12)) {
                _$jscoverage['/format.js'].lineData[393]++;
                calendar.setHourOfDay((hour + 12) % 24);
              }
            }
          } else {
            _$jscoverage['/format.js'].lineData[397]++;
            tmp.ampm = match.value;
          }
        }
        _$jscoverage['/format.js'].lineData[400]++;
        break;
      case 'h':
        _$jscoverage['/format.js'].lineData[402]++;
        if (visit87_402_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[403]++;
          hour = match.value %= 12;
          _$jscoverage['/format.js'].lineData[404]++;
          if (visit88_404_1(tmp.ampm)) {
            _$jscoverage['/format.js'].lineData[405]++;
            hour += 12;
          }
          _$jscoverage['/format.js'].lineData[407]++;
          calendar.setHourOfDay(hour);
        }
        _$jscoverage['/format.js'].lineData[409]++;
        break;
      case 'K':
        _$jscoverage['/format.js'].lineData[411]++;
        if (visit89_411_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[412]++;
          hour = match.value;
          _$jscoverage['/format.js'].lineData[413]++;
          if (visit90_413_1(tmp.ampm)) {
            _$jscoverage['/format.js'].lineData[414]++;
            hour += 12;
          }
          _$jscoverage['/format.js'].lineData[416]++;
          calendar.setHourOfDay(hour);
        }
        _$jscoverage['/format.js'].lineData[418]++;
        break;
      case 'Z':
        _$jscoverage['/format.js'].lineData[420]++;
        if (visit91_420_1(dateStr)) {
          _$jscoverage['/format.js'].lineData[421]++;
          var sign = 1, zoneChar = dateStr.charAt(startIndex);
        }
        _$jscoverage['/format.js'].lineData[423]++;
        if (visit92_423_1(zoneChar == '-')) {
          _$jscoverage['/format.js'].lineData[424]++;
          sign = -1;
          _$jscoverage['/format.js'].lineData[425]++;
          startIndex++;
        } else {
          _$jscoverage['/format.js'].lineData[426]++;
          if (visit93_426_1(zoneChar == '+')) {
            _$jscoverage['/format.js'].lineData[427]++;
            startIndex++;
          } else {
            _$jscoverage['/format.js'].lineData[429]++;
            break;
          }
        }
        _$jscoverage['/format.js'].lineData[431]++;
        if (visit94_431_1(match = matchNumber(dateStr, startIndex, 2, true))) {
          _$jscoverage['/format.js'].lineData[432]++;
          var zoneOffset = match.value * 60;
          _$jscoverage['/format.js'].lineData[433]++;
          startIndex = match.startIndex;
          _$jscoverage['/format.js'].lineData[434]++;
          if (visit95_434_1(match = matchNumber(dateStr, startIndex, 2, true))) {
            _$jscoverage['/format.js'].lineData[435]++;
            zoneOffset += match.value;
          }
          _$jscoverage['/format.js'].lineData[437]++;
          calendar.setTimezoneOffset(zoneOffset);
        }
        _$jscoverage['/format.js'].lineData[439]++;
        break;
      default:
        _$jscoverage['/format.js'].lineData[450]++;
        if (visit96_450_1(match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[451]++;
          var index = calendarIndexMap[field];
          _$jscoverage['/format.js'].lineData[452]++;
          calendar.set(index, match.value);
        }
    }
    _$jscoverage['/format.js'].lineData[455]++;
    if (visit97_455_1(match)) {
      _$jscoverage['/format.js'].lineData[456]++;
      startIndex = match.startIndex;
    }
    _$jscoverage['/format.js'].lineData[458]++;
    return startIndex;
  }
  _$jscoverage['/format.js'].lineData[461]++;
  DateTimeFormat.prototype = {
  format: function(calendar) {
  _$jscoverage['/format.js'].functionData[12]++;
  _$jscoverage['/format.js'].lineData[463]++;
  var time = calendar.getTime();
  _$jscoverage['/format.js'].lineData[464]++;
  calendar = new GregorianCalendar(this.timezoneOffset, this.locale);
  _$jscoverage['/format.js'].lineData[465]++;
  calendar.setTime(time);
  _$jscoverage['/format.js'].lineData[466]++;
  var i, ret = [], pattern = this.pattern, len = pattern.length;
  _$jscoverage['/format.js'].lineData[470]++;
  for (i = 0; visit98_470_1(i < len); i++) {
    _$jscoverage['/format.js'].lineData[471]++;
    var comp = pattern[i];
    _$jscoverage['/format.js'].lineData[472]++;
    if (visit99_472_1(comp.text)) {
      _$jscoverage['/format.js'].lineData[473]++;
      ret.push(comp.text);
    } else {
      _$jscoverage['/format.js'].lineData[474]++;
      if (visit100_474_1('field' in comp)) {
        _$jscoverage['/format.js'].lineData[475]++;
        ret.push(formatField(comp.field, comp.count, this.locale, calendar));
      }
    }
  }
  _$jscoverage['/format.js'].lineData[478]++;
  return ret.join('');
}, 
  parse: function(dateStr) {
  _$jscoverage['/format.js'].functionData[13]++;
  _$jscoverage['/format.js'].lineData[481]++;
  var calendar = new GregorianCalendar(this.timezoneOffset, this.locale), i, j, tmp = {}, obeyCount = false, dateStrLen = dateStr.length, errorIndex = -1, startIndex = 0, oldStartIndex = 0, pattern = this.pattern, len = pattern.length;
  _$jscoverage['/format.js'].lineData[493]++;
  loopPattern:
    {
      _$jscoverage['/format.js'].lineData[494]++;
      for (i = 0; visit101_494_1(visit102_494_2(errorIndex < 0) && visit103_494_3(i < len)); i++) {
        _$jscoverage['/format.js'].lineData[495]++;
        var comp = pattern[i], text, textLen;
        _$jscoverage['/format.js'].lineData[496]++;
        oldStartIndex = startIndex;
        _$jscoverage['/format.js'].lineData[497]++;
        if (visit104_497_1(text = comp.text)) {
          _$jscoverage['/format.js'].lineData[498]++;
          textLen = text.length;
          _$jscoverage['/format.js'].lineData[499]++;
          if (visit105_499_1((textLen + startIndex) > dateStrLen)) {
            _$jscoverage['/format.js'].lineData[500]++;
            errorIndex = startIndex;
          } else {
            _$jscoverage['/format.js'].lineData[502]++;
            for (j = 0; visit106_502_1(j < textLen); j++) {
              _$jscoverage['/format.js'].lineData[503]++;
              if (visit107_503_1(text.charAt(j) != dateStr.charAt(j + startIndex))) {
                _$jscoverage['/format.js'].lineData[504]++;
                errorIndex = startIndex;
                _$jscoverage['/format.js'].lineData[505]++;
                break loopPattern;
              }
            }
            _$jscoverage['/format.js'].lineData[508]++;
            startIndex += textLen;
          }
        } else {
          _$jscoverage['/format.js'].lineData[510]++;
          if (visit108_510_1('field' in comp)) {
            _$jscoverage['/format.js'].lineData[511]++;
            obeyCount = false;
            _$jscoverage['/format.js'].lineData[512]++;
            var nextComp = pattern[i + 1];
            _$jscoverage['/format.js'].lineData[513]++;
            if (visit109_513_1(nextComp)) {
              _$jscoverage['/format.js'].lineData[514]++;
              if (visit110_514_1('field' in nextComp)) {
                _$jscoverage['/format.js'].lineData[515]++;
                obeyCount = true;
              } else {
                _$jscoverage['/format.js'].lineData[517]++;
                var c = nextComp.text.charAt(0);
                _$jscoverage['/format.js'].lineData[518]++;
                if (visit111_518_1(visit112_518_2(c >= '0') && visit113_518_3(c <= '9'))) {
                  _$jscoverage['/format.js'].lineData[519]++;
                  obeyCount = true;
                }
              }
            }
            _$jscoverage['/format.js'].lineData[523]++;
            startIndex = parseField(calendar, dateStr, startIndex, comp.field, comp.count, this.locale, obeyCount, tmp);
            _$jscoverage['/format.js'].lineData[531]++;
            if (visit114_531_1(startIndex == oldStartIndex)) {
              _$jscoverage['/format.js'].lineData[532]++;
              errorIndex = startIndex;
            }
          }
        }
      }
    }
  _$jscoverage['/format.js'].lineData[538]++;
  if (visit115_538_1(errorIndex >= 0)) {
    _$jscoverage['/format.js'].lineData[539]++;
    S.log(dateStr, 'warn');
    _$jscoverage['/format.js'].lineData[540]++;
    S.log(dateStr.substring(0, errorIndex) + '^', 'warn');
    _$jscoverage['/format.js'].lineData[541]++;
    throw new Error('error when parsing date');
  }
  _$jscoverage['/format.js'].lineData[543]++;
  return calendar;
}};
  _$jscoverage['/format.js'].lineData[547]++;
  var DateTimeStyle = DateTimeFormat.Style = {
  FULL: 0, 
  LONG: 1, 
  MEDIUM: 2, 
  SHORT: 3};
  _$jscoverage['/format.js'].lineData[554]++;
  S.mix(DateTimeFormat, {
  getInstance: function(locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[14]++;
  _$jscoverage['/format.js'].lineData[556]++;
  return this.getDateTimeInstance(DateTimeStyle.SHORT, DateTimeStyle.SHORT, locale, timeZoneOffset);
}, 
  'getDateInstance': function(dateStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[15]++;
  _$jscoverage['/format.js'].lineData[559]++;
  return this.getDateTimeInstance(dateStyle, undefined, locale, timeZoneOffset);
}, 
  getDateTimeInstance: function(dateStyle, timeStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[16]++;
  _$jscoverage['/format.js'].lineData[562]++;
  locale = visit116_562_1(locale || defaultLocale);
  _$jscoverage['/format.js'].lineData[563]++;
  var datePattern = '';
  _$jscoverage['/format.js'].lineData[564]++;
  if (visit117_564_1(dateStyle !== undefined)) {
    _$jscoverage['/format.js'].lineData[565]++;
    datePattern = locale.datePatterns[dateStyle];
  }
  _$jscoverage['/format.js'].lineData[567]++;
  var timePattern = '';
  _$jscoverage['/format.js'].lineData[568]++;
  if (visit118_568_1(timeStyle !== undefined)) {
    _$jscoverage['/format.js'].lineData[569]++;
    timePattern = locale.timePatterns[timeStyle];
  }
  _$jscoverage['/format.js'].lineData[571]++;
  var pattern = datePattern;
  _$jscoverage['/format.js'].lineData[572]++;
  if (visit119_572_1(timePattern)) {
    _$jscoverage['/format.js'].lineData[573]++;
    if (visit120_573_1(datePattern)) {
      _$jscoverage['/format.js'].lineData[574]++;
      pattern = S.substitute(locale.dateTimePattern, {
  date: datePattern, 
  time: timePattern});
    } else {
      _$jscoverage['/format.js'].lineData[579]++;
      pattern = timePattern;
    }
  }
  _$jscoverage['/format.js'].lineData[582]++;
  return new DateTimeFormat(pattern, locale, timeZoneOffset);
}, 
  'getTimeInstance': function(timeStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[17]++;
  _$jscoverage['/format.js'].lineData[585]++;
  return this.getDateTimeInstance(undefined, timeStyle, locale, timeZoneOffset);
}});
  _$jscoverage['/format.js'].lineData[589]++;
  return DateTimeFormat;
}, {
  requires: ['date/gregorian', 'i18n!date']});
