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
if (! _$jscoverage['/base/add-event.js']) {
  _$jscoverage['/base/add-event.js'] = {};
  _$jscoverage['/base/add-event.js'].lineData = [];
  _$jscoverage['/base/add-event.js'].lineData[6] = 0;
  _$jscoverage['/base/add-event.js'].lineData[7] = 0;
  _$jscoverage['/base/add-event.js'].lineData[8] = 0;
  _$jscoverage['/base/add-event.js'].lineData[9] = 0;
  _$jscoverage['/base/add-event.js'].lineData[10] = 0;
  _$jscoverage['/base/add-event.js'].lineData[11] = 0;
  _$jscoverage['/base/add-event.js'].lineData[17] = 0;
  _$jscoverage['/base/add-event.js'].lineData[18] = 0;
  _$jscoverage['/base/add-event.js'].lineData[21] = 0;
  _$jscoverage['/base/add-event.js'].lineData[22] = 0;
  _$jscoverage['/base/add-event.js'].lineData[25] = 0;
  _$jscoverage['/base/add-event.js'].lineData[26] = 0;
  _$jscoverage['/base/add-event.js'].lineData[30] = 0;
  _$jscoverage['/base/add-event.js'].lineData[32] = 0;
  _$jscoverage['/base/add-event.js'].lineData[34] = 0;
  _$jscoverage['/base/add-event.js'].lineData[35] = 0;
  _$jscoverage['/base/add-event.js'].lineData[37] = 0;
  _$jscoverage['/base/add-event.js'].lineData[38] = 0;
  _$jscoverage['/base/add-event.js'].lineData[39] = 0;
  _$jscoverage['/base/add-event.js'].lineData[41] = 0;
  _$jscoverage['/base/add-event.js'].lineData[43] = 0;
  _$jscoverage['/base/add-event.js'].lineData[44] = 0;
  _$jscoverage['/base/add-event.js'].lineData[46] = 0;
  _$jscoverage['/base/add-event.js'].lineData[49] = 0;
  _$jscoverage['/base/add-event.js'].lineData[50] = 0;
  _$jscoverage['/base/add-event.js'].lineData[51] = 0;
  _$jscoverage['/base/add-event.js'].lineData[52] = 0;
  _$jscoverage['/base/add-event.js'].lineData[53] = 0;
  _$jscoverage['/base/add-event.js'].lineData[54] = 0;
  _$jscoverage['/base/add-event.js'].lineData[55] = 0;
  _$jscoverage['/base/add-event.js'].lineData[57] = 0;
  _$jscoverage['/base/add-event.js'].lineData[58] = 0;
  _$jscoverage['/base/add-event.js'].lineData[59] = 0;
  _$jscoverage['/base/add-event.js'].lineData[62] = 0;
  _$jscoverage['/base/add-event.js'].lineData[63] = 0;
  _$jscoverage['/base/add-event.js'].lineData[64] = 0;
  _$jscoverage['/base/add-event.js'].lineData[65] = 0;
  _$jscoverage['/base/add-event.js'].lineData[66] = 0;
  _$jscoverage['/base/add-event.js'].lineData[68] = 0;
  _$jscoverage['/base/add-event.js'].lineData[70] = 0;
  _$jscoverage['/base/add-event.js'].lineData[73] = 0;
  _$jscoverage['/base/add-event.js'].lineData[81] = 0;
  _$jscoverage['/base/add-event.js'].lineData[83] = 0;
  _$jscoverage['/base/add-event.js'].lineData[85] = 0;
  _$jscoverage['/base/add-event.js'].lineData[86] = 0;
  _$jscoverage['/base/add-event.js'].lineData[88] = 0;
  _$jscoverage['/base/add-event.js'].lineData[92] = 0;
  _$jscoverage['/base/add-event.js'].lineData[93] = 0;
  _$jscoverage['/base/add-event.js'].lineData[97] = 0;
  _$jscoverage['/base/add-event.js'].lineData[102] = 0;
  _$jscoverage['/base/add-event.js'].lineData[103] = 0;
  _$jscoverage['/base/add-event.js'].lineData[104] = 0;
  _$jscoverage['/base/add-event.js'].lineData[105] = 0;
  _$jscoverage['/base/add-event.js'].lineData[106] = 0;
  _$jscoverage['/base/add-event.js'].lineData[112] = 0;
  _$jscoverage['/base/add-event.js'].lineData[117] = 0;
  _$jscoverage['/base/add-event.js'].lineData[118] = 0;
  _$jscoverage['/base/add-event.js'].lineData[119] = 0;
  _$jscoverage['/base/add-event.js'].lineData[120] = 0;
  _$jscoverage['/base/add-event.js'].lineData[126] = 0;
  _$jscoverage['/base/add-event.js'].lineData[130] = 0;
  _$jscoverage['/base/add-event.js'].lineData[131] = 0;
  _$jscoverage['/base/add-event.js'].lineData[136] = 0;
  _$jscoverage['/base/add-event.js'].lineData[137] = 0;
  _$jscoverage['/base/add-event.js'].lineData[143] = 0;
  _$jscoverage['/base/add-event.js'].lineData[144] = 0;
  _$jscoverage['/base/add-event.js'].lineData[146] = 0;
  _$jscoverage['/base/add-event.js'].lineData[148] = 0;
  _$jscoverage['/base/add-event.js'].lineData[149] = 0;
  _$jscoverage['/base/add-event.js'].lineData[150] = 0;
  _$jscoverage['/base/add-event.js'].lineData[151] = 0;
  _$jscoverage['/base/add-event.js'].lineData[152] = 0;
  _$jscoverage['/base/add-event.js'].lineData[153] = 0;
  _$jscoverage['/base/add-event.js'].lineData[161] = 0;
  _$jscoverage['/base/add-event.js'].lineData[162] = 0;
  _$jscoverage['/base/add-event.js'].lineData[164] = 0;
  _$jscoverage['/base/add-event.js'].lineData[166] = 0;
  _$jscoverage['/base/add-event.js'].lineData[168] = 0;
  _$jscoverage['/base/add-event.js'].lineData[169] = 0;
  _$jscoverage['/base/add-event.js'].lineData[172] = 0;
  _$jscoverage['/base/add-event.js'].lineData[176] = 0;
  _$jscoverage['/base/add-event.js'].lineData[180] = 0;
  _$jscoverage['/base/add-event.js'].lineData[181] = 0;
  _$jscoverage['/base/add-event.js'].lineData[184] = 0;
  _$jscoverage['/base/add-event.js'].lineData[186] = 0;
  _$jscoverage['/base/add-event.js'].lineData[187] = 0;
  _$jscoverage['/base/add-event.js'].lineData[188] = 0;
  _$jscoverage['/base/add-event.js'].lineData[189] = 0;
  _$jscoverage['/base/add-event.js'].lineData[191] = 0;
  _$jscoverage['/base/add-event.js'].lineData[193] = 0;
  _$jscoverage['/base/add-event.js'].lineData[194] = 0;
  _$jscoverage['/base/add-event.js'].lineData[195] = 0;
  _$jscoverage['/base/add-event.js'].lineData[196] = 0;
  _$jscoverage['/base/add-event.js'].lineData[198] = 0;
  _$jscoverage['/base/add-event.js'].lineData[199] = 0;
  _$jscoverage['/base/add-event.js'].lineData[201] = 0;
  _$jscoverage['/base/add-event.js'].lineData[202] = 0;
  _$jscoverage['/base/add-event.js'].lineData[203] = 0;
  _$jscoverage['/base/add-event.js'].lineData[204] = 0;
  _$jscoverage['/base/add-event.js'].lineData[205] = 0;
  _$jscoverage['/base/add-event.js'].lineData[209] = 0;
  _$jscoverage['/base/add-event.js'].lineData[213] = 0;
  _$jscoverage['/base/add-event.js'].lineData[214] = 0;
  _$jscoverage['/base/add-event.js'].lineData[215] = 0;
  _$jscoverage['/base/add-event.js'].lineData[216] = 0;
  _$jscoverage['/base/add-event.js'].lineData[217] = 0;
  _$jscoverage['/base/add-event.js'].lineData[218] = 0;
  _$jscoverage['/base/add-event.js'].lineData[220] = 0;
  _$jscoverage['/base/add-event.js'].lineData[221] = 0;
  _$jscoverage['/base/add-event.js'].lineData[222] = 0;
  _$jscoverage['/base/add-event.js'].lineData[223] = 0;
  _$jscoverage['/base/add-event.js'].lineData[224] = 0;
  _$jscoverage['/base/add-event.js'].lineData[227] = 0;
  _$jscoverage['/base/add-event.js'].lineData[230] = 0;
  _$jscoverage['/base/add-event.js'].lineData[231] = 0;
  _$jscoverage['/base/add-event.js'].lineData[232] = 0;
  _$jscoverage['/base/add-event.js'].lineData[233] = 0;
  _$jscoverage['/base/add-event.js'].lineData[236] = 0;
  _$jscoverage['/base/add-event.js'].lineData[240] = 0;
  _$jscoverage['/base/add-event.js'].lineData[242] = 0;
  _$jscoverage['/base/add-event.js'].lineData[243] = 0;
  _$jscoverage['/base/add-event.js'].lineData[244] = 0;
  _$jscoverage['/base/add-event.js'].lineData[246] = 0;
  _$jscoverage['/base/add-event.js'].lineData[247] = 0;
  _$jscoverage['/base/add-event.js'].lineData[248] = 0;
  _$jscoverage['/base/add-event.js'].lineData[249] = 0;
  _$jscoverage['/base/add-event.js'].lineData[250] = 0;
  _$jscoverage['/base/add-event.js'].lineData[253] = 0;
  _$jscoverage['/base/add-event.js'].lineData[257] = 0;
  _$jscoverage['/base/add-event.js'].lineData[259] = 0;
  _$jscoverage['/base/add-event.js'].lineData[260] = 0;
  _$jscoverage['/base/add-event.js'].lineData[261] = 0;
  _$jscoverage['/base/add-event.js'].lineData[265] = 0;
  _$jscoverage['/base/add-event.js'].lineData[266] = 0;
  _$jscoverage['/base/add-event.js'].lineData[267] = 0;
  _$jscoverage['/base/add-event.js'].lineData[268] = 0;
  _$jscoverage['/base/add-event.js'].lineData[269] = 0;
  _$jscoverage['/base/add-event.js'].lineData[271] = 0;
  _$jscoverage['/base/add-event.js'].lineData[272] = 0;
  _$jscoverage['/base/add-event.js'].lineData[273] = 0;
  _$jscoverage['/base/add-event.js'].lineData[274] = 0;
  _$jscoverage['/base/add-event.js'].lineData[275] = 0;
  _$jscoverage['/base/add-event.js'].lineData[276] = 0;
  _$jscoverage['/base/add-event.js'].lineData[282] = 0;
  _$jscoverage['/base/add-event.js'].lineData[287] = 0;
  _$jscoverage['/base/add-event.js'].lineData[288] = 0;
  _$jscoverage['/base/add-event.js'].lineData[290] = 0;
  _$jscoverage['/base/add-event.js'].lineData[291] = 0;
  _$jscoverage['/base/add-event.js'].lineData[293] = 0;
  _$jscoverage['/base/add-event.js'].lineData[294] = 0;
  _$jscoverage['/base/add-event.js'].lineData[295] = 0;
  _$jscoverage['/base/add-event.js'].lineData[297] = 0;
  _$jscoverage['/base/add-event.js'].lineData[300] = 0;
  _$jscoverage['/base/add-event.js'].lineData[301] = 0;
  _$jscoverage['/base/add-event.js'].lineData[304] = 0;
  _$jscoverage['/base/add-event.js'].lineData[305] = 0;
  _$jscoverage['/base/add-event.js'].lineData[307] = 0;
  _$jscoverage['/base/add-event.js'].lineData[308] = 0;
  _$jscoverage['/base/add-event.js'].lineData[309] = 0;
  _$jscoverage['/base/add-event.js'].lineData[314] = 0;
  _$jscoverage['/base/add-event.js'].lineData[315] = 0;
  _$jscoverage['/base/add-event.js'].lineData[316] = 0;
  _$jscoverage['/base/add-event.js'].lineData[317] = 0;
  _$jscoverage['/base/add-event.js'].lineData[318] = 0;
  _$jscoverage['/base/add-event.js'].lineData[324] = 0;
  _$jscoverage['/base/add-event.js'].lineData[327] = 0;
  _$jscoverage['/base/add-event.js'].lineData[328] = 0;
  _$jscoverage['/base/add-event.js'].lineData[330] = 0;
  _$jscoverage['/base/add-event.js'].lineData[331] = 0;
  _$jscoverage['/base/add-event.js'].lineData[332] = 0;
  _$jscoverage['/base/add-event.js'].lineData[340] = 0;
  _$jscoverage['/base/add-event.js'].lineData[341] = 0;
  _$jscoverage['/base/add-event.js'].lineData[342] = 0;
  _$jscoverage['/base/add-event.js'].lineData[343] = 0;
  _$jscoverage['/base/add-event.js'].lineData[348] = 0;
  _$jscoverage['/base/add-event.js'].lineData[349] = 0;
  _$jscoverage['/base/add-event.js'].lineData[350] = 0;
  _$jscoverage['/base/add-event.js'].lineData[351] = 0;
  _$jscoverage['/base/add-event.js'].lineData[352] = 0;
  _$jscoverage['/base/add-event.js'].lineData[353] = 0;
  _$jscoverage['/base/add-event.js'].lineData[359] = 0;
  _$jscoverage['/base/add-event.js'].lineData[361] = 0;
  _$jscoverage['/base/add-event.js'].lineData[362] = 0;
  _$jscoverage['/base/add-event.js'].lineData[363] = 0;
  _$jscoverage['/base/add-event.js'].lineData[367] = 0;
  _$jscoverage['/base/add-event.js'].lineData[368] = 0;
  _$jscoverage['/base/add-event.js'].lineData[371] = 0;
  _$jscoverage['/base/add-event.js'].lineData[372] = 0;
  _$jscoverage['/base/add-event.js'].lineData[375] = 0;
  _$jscoverage['/base/add-event.js'].lineData[376] = 0;
  _$jscoverage['/base/add-event.js'].lineData[377] = 0;
  _$jscoverage['/base/add-event.js'].lineData[380] = 0;
  _$jscoverage['/base/add-event.js'].lineData[381] = 0;
  _$jscoverage['/base/add-event.js'].lineData[382] = 0;
  _$jscoverage['/base/add-event.js'].lineData[385] = 0;
  _$jscoverage['/base/add-event.js'].lineData[386] = 0;
  _$jscoverage['/base/add-event.js'].lineData[388] = 0;
  _$jscoverage['/base/add-event.js'].lineData[389] = 0;
  _$jscoverage['/base/add-event.js'].lineData[391] = 0;
  _$jscoverage['/base/add-event.js'].lineData[392] = 0;
  _$jscoverage['/base/add-event.js'].lineData[396] = 0;
  _$jscoverage['/base/add-event.js'].lineData[397] = 0;
  _$jscoverage['/base/add-event.js'].lineData[399] = 0;
  _$jscoverage['/base/add-event.js'].lineData[400] = 0;
  _$jscoverage['/base/add-event.js'].lineData[401] = 0;
  _$jscoverage['/base/add-event.js'].lineData[403] = 0;
  _$jscoverage['/base/add-event.js'].lineData[404] = 0;
  _$jscoverage['/base/add-event.js'].lineData[405] = 0;
  _$jscoverage['/base/add-event.js'].lineData[410] = 0;
  _$jscoverage['/base/add-event.js'].lineData[411] = 0;
  _$jscoverage['/base/add-event.js'].lineData[412] = 0;
  _$jscoverage['/base/add-event.js'].lineData[414] = 0;
  _$jscoverage['/base/add-event.js'].lineData[415] = 0;
  _$jscoverage['/base/add-event.js'].lineData[416] = 0;
  _$jscoverage['/base/add-event.js'].lineData[417] = 0;
  _$jscoverage['/base/add-event.js'].lineData[418] = 0;
  _$jscoverage['/base/add-event.js'].lineData[419] = 0;
  _$jscoverage['/base/add-event.js'].lineData[420] = 0;
  _$jscoverage['/base/add-event.js'].lineData[422] = 0;
  _$jscoverage['/base/add-event.js'].lineData[423] = 0;
}
if (! _$jscoverage['/base/add-event.js'].functionData) {
  _$jscoverage['/base/add-event.js'].functionData = [];
  _$jscoverage['/base/add-event.js'].functionData[0] = 0;
  _$jscoverage['/base/add-event.js'].functionData[1] = 0;
  _$jscoverage['/base/add-event.js'].functionData[2] = 0;
  _$jscoverage['/base/add-event.js'].functionData[3] = 0;
  _$jscoverage['/base/add-event.js'].functionData[4] = 0;
  _$jscoverage['/base/add-event.js'].functionData[5] = 0;
  _$jscoverage['/base/add-event.js'].functionData[6] = 0;
  _$jscoverage['/base/add-event.js'].functionData[7] = 0;
  _$jscoverage['/base/add-event.js'].functionData[8] = 0;
  _$jscoverage['/base/add-event.js'].functionData[9] = 0;
  _$jscoverage['/base/add-event.js'].functionData[10] = 0;
  _$jscoverage['/base/add-event.js'].functionData[11] = 0;
  _$jscoverage['/base/add-event.js'].functionData[12] = 0;
  _$jscoverage['/base/add-event.js'].functionData[13] = 0;
  _$jscoverage['/base/add-event.js'].functionData[14] = 0;
  _$jscoverage['/base/add-event.js'].functionData[15] = 0;
  _$jscoverage['/base/add-event.js'].functionData[16] = 0;
  _$jscoverage['/base/add-event.js'].functionData[17] = 0;
  _$jscoverage['/base/add-event.js'].functionData[18] = 0;
  _$jscoverage['/base/add-event.js'].functionData[19] = 0;
  _$jscoverage['/base/add-event.js'].functionData[20] = 0;
  _$jscoverage['/base/add-event.js'].functionData[21] = 0;
  _$jscoverage['/base/add-event.js'].functionData[22] = 0;
  _$jscoverage['/base/add-event.js'].functionData[23] = 0;
  _$jscoverage['/base/add-event.js'].functionData[24] = 0;
  _$jscoverage['/base/add-event.js'].functionData[25] = 0;
  _$jscoverage['/base/add-event.js'].functionData[26] = 0;
  _$jscoverage['/base/add-event.js'].functionData[27] = 0;
  _$jscoverage['/base/add-event.js'].functionData[28] = 0;
  _$jscoverage['/base/add-event.js'].functionData[29] = 0;
  _$jscoverage['/base/add-event.js'].functionData[30] = 0;
  _$jscoverage['/base/add-event.js'].functionData[31] = 0;
  _$jscoverage['/base/add-event.js'].functionData[32] = 0;
  _$jscoverage['/base/add-event.js'].functionData[33] = 0;
}
if (! _$jscoverage['/base/add-event.js'].branchData) {
  _$jscoverage['/base/add-event.js'].branchData = {};
  _$jscoverage['/base/add-event.js'].branchData['26'] = [];
  _$jscoverage['/base/add-event.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['34'] = [];
  _$jscoverage['/base/add-event.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['35'] = [];
  _$jscoverage['/base/add-event.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['46'] = [];
  _$jscoverage['/base/add-event.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['52'] = [];
  _$jscoverage['/base/add-event.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['85'] = [];
  _$jscoverage['/base/add-event.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['102'] = [];
  _$jscoverage['/base/add-event.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['104'] = [];
  _$jscoverage['/base/add-event.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['117'] = [];
  _$jscoverage['/base/add-event.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['119'] = [];
  _$jscoverage['/base/add-event.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['126'] = [];
  _$jscoverage['/base/add-event.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['130'] = [];
  _$jscoverage['/base/add-event.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['136'] = [];
  _$jscoverage['/base/add-event.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['146'] = [];
  _$jscoverage['/base/add-event.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['152'] = [];
  _$jscoverage['/base/add-event.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['164'] = [];
  _$jscoverage['/base/add-event.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['164'][2] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['168'] = [];
  _$jscoverage['/base/add-event.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['168'][2] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['168'][3] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['181'] = [];
  _$jscoverage['/base/add-event.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['181'][2] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['181'][3] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['186'] = [];
  _$jscoverage['/base/add-event.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['188'] = [];
  _$jscoverage['/base/add-event.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['193'] = [];
  _$jscoverage['/base/add-event.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['193'][2] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['198'] = [];
  _$jscoverage['/base/add-event.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['213'] = [];
  _$jscoverage['/base/add-event.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['216'] = [];
  _$jscoverage['/base/add-event.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['217'] = [];
  _$jscoverage['/base/add-event.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['221'] = [];
  _$jscoverage['/base/add-event.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['223'] = [];
  _$jscoverage['/base/add-event.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['230'] = [];
  _$jscoverage['/base/add-event.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['242'] = [];
  _$jscoverage['/base/add-event.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['243'] = [];
  _$jscoverage['/base/add-event.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['247'] = [];
  _$jscoverage['/base/add-event.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['249'] = [];
  _$jscoverage['/base/add-event.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['259'] = [];
  _$jscoverage['/base/add-event.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['260'] = [];
  _$jscoverage['/base/add-event.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['266'] = [];
  _$jscoverage['/base/add-event.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['271'] = [];
  _$jscoverage['/base/add-event.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['273'] = [];
  _$jscoverage['/base/add-event.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['275'] = [];
  _$jscoverage['/base/add-event.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['290'] = [];
  _$jscoverage['/base/add-event.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['293'] = [];
  _$jscoverage['/base/add-event.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['295'] = [];
  _$jscoverage['/base/add-event.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['300'] = [];
  _$jscoverage['/base/add-event.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['300'][2] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['304'] = [];
  _$jscoverage['/base/add-event.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['308'] = [];
  _$jscoverage['/base/add-event.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['308'][2] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['308'][3] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['314'] = [];
  _$jscoverage['/base/add-event.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['316'] = [];
  _$jscoverage['/base/add-event.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['327'] = [];
  _$jscoverage['/base/add-event.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['349'] = [];
  _$jscoverage['/base/add-event.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['351'] = [];
  _$jscoverage['/base/add-event.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['388'] = [];
  _$jscoverage['/base/add-event.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['391'] = [];
  _$jscoverage['/base/add-event.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['399'] = [];
  _$jscoverage['/base/add-event.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['400'] = [];
  _$jscoverage['/base/add-event.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['403'] = [];
  _$jscoverage['/base/add-event.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['411'] = [];
  _$jscoverage['/base/add-event.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/base/add-event.js'].branchData['420'] = [];
  _$jscoverage['/base/add-event.js'].branchData['420'][1] = new BranchData();
}
_$jscoverage['/base/add-event.js'].branchData['420'][1].init(303, 19, 'config.order || 100');
function visit65_420_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['411'][1].init(13, 26, 'typeof events === \'string\'');
function visit64_411_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['403'][1].init(105, 27, '!handle.eventHandles.length');
function visit63_403_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['400'][1].init(17, 5, 'event');
function visit62_400_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['399'][1].init(93, 6, 'handle');
function visit61_399_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['391'][1].init(193, 5, 'event');
function visit60_391_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['388'][1].init(93, 7, '!handle');
function visit59_388_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['351'][1].init(66, 26, '!eventHandles[event].count');
function visit58_351_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['349'][1].init(67, 19, 'eventHandles[event]');
function visit57_349_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['327'][1].init(151, 19, 'eventHandles[event]');
function visit56_327_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['316'][1].init(58, 15, 'eventHandles[e]');
function visit55_316_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['314'][1].init(1212, 5, 'i < l');
function visit54_314_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['308'][3].init(487, 26, 'h[method](event) === false');
function visit53_308_3(result) {
  _$jscoverage['/base/add-event.js'].branchData['308'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['308'][2].init(474, 39, 'h[method] && h[method](event) === false');
function visit52_308_2(result) {
  _$jscoverage['/base/add-event.js'].branchData['308'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['308'][1].init(460, 53, 'h.isActive && h[method] && h[method](event) === false');
function visit51_308_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['304'][1].init(328, 11, 'h.processed');
function visit50_304_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['300'][2].init(206, 37, 'gestureType !== h.requiredGestureType');
function visit49_300_2(result) {
  _$jscoverage['/base/add-event.js'].branchData['300'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['300'][1].init(181, 62, 'h.requiredGestureType && gestureType !== h.requiredGestureType');
function visit48_300_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['295'][1].init(57, 15, 'eventHandles[e]');
function visit47_295_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['293'][1].init(464, 5, 'i < l');
function visit46_293_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['290'][1].init(342, 28, '!event.changedTouches.length');
function visit45_290_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['275'][1].init(76, 20, '!self.touches.length');
function visit44_275_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['273'][1].init(610, 20, 'isPointerEvent(type)');
function visit43_273_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['271'][1].init(529, 18, 'isMouseEvent(type)');
function visit42_271_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['266'][1].init(296, 18, 'isTouchEvent(type)');
function visit41_266_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['260'][1].init(21, 37, 'self.isEventSimulatedFromTouch(event)');
function visit40_260_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['259'][1].init(81, 18, 'isMouseEvent(type)');
function visit39_259_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['249'][1].init(376, 19, '!isTouchEvent(type)');
function visit38_249_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['247'][1].init(273, 20, 'isPointerEvent(type)');
function visit37_247_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['243'][1].init(21, 36, 'self.isEventSimulatedFromTouch(type)');
function visit36_243_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['242'][1].init(81, 18, 'isMouseEvent(type)');
function visit35_242_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['230'][1].init(884, 5, 'i < l');
function visit34_230_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['223'][1].init(73, 25, 'self.touches.length === 1');
function visit33_223_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['221'][1].init(493, 20, 'isPointerEvent(type)');
function visit32_221_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['217'][1].init(21, 37, 'self.isEventSimulatedFromTouch(event)');
function visit31_217_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['216'][1].init(300, 18, 'isMouseEvent(type)');
function visit30_216_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['213'][1].init(153, 18, 'isTouchEvent(type)');
function visit29_213_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['198'][1].init(856, 10, 'touchEvent');
function visit28_198_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['193'][2].init(679, 22, 'touchList.length === 1');
function visit27_193_2(result) {
  _$jscoverage['/base/add-event.js'].branchData['193'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['193'][1].init(666, 35, 'touchList && touchList.length === 1');
function visit26_193_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['188'][1].init(138, 18, 'isMouseEvent(type)');
function visit25_188_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['186'][1].init(21, 20, 'isPointerEvent(type)');
function visit24_186_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['181'][3].init(53, 22, 'type === \'touchcancel\'');
function visit23_181_3(result) {
  _$jscoverage['/base/add-event.js'].branchData['181'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['181'][2].init(30, 19, 'type === \'touchend\'');
function visit22_181_2(result) {
  _$jscoverage['/base/add-event.js'].branchData['181'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['181'][1].init(30, 45, 'type === \'touchend\' || type === \'touchcancel\'');
function visit21_181_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['168'][3].init(211, 14, 'dy <= DUP_DIST');
function visit20_168_3(result) {
  _$jscoverage['/base/add-event.js'].branchData['168'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['168'][2].init(193, 14, 'dx <= DUP_DIST');
function visit19_168_2(result) {
  _$jscoverage['/base/add-event.js'].branchData['168'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['168'][1].init(193, 32, 'dx <= DUP_DIST && dy <= DUP_DIST');
function visit18_168_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['164'][2].init(162, 5, 'i < l');
function visit17_164_2(result) {
  _$jscoverage['/base/add-event.js'].branchData['164'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['164'][1].init(162, 21, 'i < l && (t = lts[i])');
function visit16_164_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['152'][1].init(70, 6, 'i > -1');
function visit15_152_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['146'][1].init(165, 22, 'this.isPrimaryTouch(t)');
function visit14_146_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['136'][1].init(17, 28, 'this.isPrimaryTouch(inTouch)');
function visit13_136_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['130'][1].init(17, 24, 'this.firstTouch === null');
function visit12_130_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['126'][1].init(20, 38, 'this.firstTouch === inTouch.identifier');
function visit11_126_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['119'][1].init(57, 29, 'touch.pointerId === pointerId');
function visit10_119_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['117'][1].init(195, 5, 'i < l');
function visit9_117_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['104'][1].init(57, 29, 'touch.pointerId === pointerId');
function visit8_104_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['102'][1].init(195, 5, 'i < l');
function visit7_102_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['85'][1].init(219, 33, '!isPointerEvent(gestureMoveEvent)');
function visit6_85_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['52'][1].init(1558, 30, 'Feature.isMsPointerSupported()');
function visit5_52_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['46'][1].init(1280, 28, 'Feature.isPointerSupported()');
function visit4_46_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['35'][1].init(13, 8, 'S.UA.ios');
function visit3_35_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['34'][1].init(781, 31, 'Feature.isTouchEventSupported()');
function visit2_34_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].branchData['26'][1].init(16, 64, 'S.startsWith(type, \'MSPointer\') || S.startsWith(type, \'pointer\')');
function visit1_26_1(result) {
  _$jscoverage['/base/add-event.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/add-event.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/add-event.js'].functionData[0]++;
  _$jscoverage['/base/add-event.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/base/add-event.js'].lineData[8]++;
  var eventHandleMap = {};
  _$jscoverage['/base/add-event.js'].lineData[9]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/base/add-event.js'].lineData[10]++;
  var Special = DomEvent.Special;
  _$jscoverage['/base/add-event.js'].lineData[11]++;
  var key = S.guid('touch-handle'), Feature = S.Feature, gestureStartEvent, gestureMoveEvent, gestureEndEvent;
  _$jscoverage['/base/add-event.js'].lineData[17]++;
  function isTouchEvent(type) {
    _$jscoverage['/base/add-event.js'].functionData[1]++;
    _$jscoverage['/base/add-event.js'].lineData[18]++;
    return S.startsWith(type, 'touch');
  }
  _$jscoverage['/base/add-event.js'].lineData[21]++;
  function isMouseEvent(type) {
    _$jscoverage['/base/add-event.js'].functionData[2]++;
    _$jscoverage['/base/add-event.js'].lineData[22]++;
    return S.startsWith(type, 'mouse');
  }
  _$jscoverage['/base/add-event.js'].lineData[25]++;
  function isPointerEvent(type) {
    _$jscoverage['/base/add-event.js'].functionData[3]++;
    _$jscoverage['/base/add-event.js'].lineData[26]++;
    return visit1_26_1(S.startsWith(type, 'MSPointer') || S.startsWith(type, 'pointer'));
  }
  _$jscoverage['/base/add-event.js'].lineData[30]++;
  var DUP_TIMEOUT = 2500;
  _$jscoverage['/base/add-event.js'].lineData[32]++;
  var DUP_DIST = 25;
  _$jscoverage['/base/add-event.js'].lineData[34]++;
  if (visit2_34_1(Feature.isTouchEventSupported())) {
    _$jscoverage['/base/add-event.js'].lineData[35]++;
    if (visit3_35_1(S.UA.ios)) {
      _$jscoverage['/base/add-event.js'].lineData[37]++;
      gestureEndEvent = 'touchend touchcancel';
      _$jscoverage['/base/add-event.js'].lineData[38]++;
      gestureStartEvent = 'touchstart';
      _$jscoverage['/base/add-event.js'].lineData[39]++;
      gestureMoveEvent = 'touchmove';
    } else {
      _$jscoverage['/base/add-event.js'].lineData[41]++;
      gestureEndEvent = 'touchend touchcancel mouseup';
      _$jscoverage['/base/add-event.js'].lineData[43]++;
      gestureStartEvent = 'touchstart mousedown';
      _$jscoverage['/base/add-event.js'].lineData[44]++;
      gestureMoveEvent = 'touchmove mousemove';
    }
  } else {
    _$jscoverage['/base/add-event.js'].lineData[46]++;
    if (visit4_46_1(Feature.isPointerSupported())) {
      _$jscoverage['/base/add-event.js'].lineData[49]++;
      gestureStartEvent = 'pointerdown';
      _$jscoverage['/base/add-event.js'].lineData[50]++;
      gestureMoveEvent = 'pointermove';
      _$jscoverage['/base/add-event.js'].lineData[51]++;
      gestureEndEvent = 'pointerup pointercancel';
    } else {
      _$jscoverage['/base/add-event.js'].lineData[52]++;
      if (visit5_52_1(Feature.isMsPointerSupported())) {
        _$jscoverage['/base/add-event.js'].lineData[53]++;
        gestureStartEvent = 'MSPointerDown';
        _$jscoverage['/base/add-event.js'].lineData[54]++;
        gestureMoveEvent = 'MSPointerMove';
        _$jscoverage['/base/add-event.js'].lineData[55]++;
        gestureEndEvent = 'MSPointerUp MSPointerCancel';
      } else {
        _$jscoverage['/base/add-event.js'].lineData[57]++;
        gestureStartEvent = 'mousedown';
        _$jscoverage['/base/add-event.js'].lineData[58]++;
        gestureMoveEvent = 'mousemove';
        _$jscoverage['/base/add-event.js'].lineData[59]++;
        gestureEndEvent = 'mouseup';
      }
    }
  }
  _$jscoverage['/base/add-event.js'].lineData[62]++;
  function DocumentHandler(doc) {
    _$jscoverage['/base/add-event.js'].functionData[4]++;
    _$jscoverage['/base/add-event.js'].lineData[63]++;
    var self = this;
    _$jscoverage['/base/add-event.js'].lineData[64]++;
    self.doc = doc;
    _$jscoverage['/base/add-event.js'].lineData[65]++;
    self.eventHandles = [];
    _$jscoverage['/base/add-event.js'].lineData[66]++;
    self.init();
    _$jscoverage['/base/add-event.js'].lineData[68]++;
    self.touches = [];
    _$jscoverage['/base/add-event.js'].lineData[70]++;
    self.inTouch = 0;
  }
  _$jscoverage['/base/add-event.js'].lineData[73]++;
  DocumentHandler.prototype = {
  constructor: DocumentHandler, 
  lastTouches: [], 
  firstTouch: null, 
  init: function() {
  _$jscoverage['/base/add-event.js'].functionData[5]++;
  _$jscoverage['/base/add-event.js'].lineData[81]++;
  var self = this, doc = self.doc;
  _$jscoverage['/base/add-event.js'].lineData[83]++;
  DomEvent.on(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/base/add-event.js'].lineData[85]++;
  if (visit6_85_1(!isPointerEvent(gestureMoveEvent))) {
    _$jscoverage['/base/add-event.js'].lineData[86]++;
    DomEvent.on(doc, gestureMoveEvent, self.onTouchMove, self);
  }
  _$jscoverage['/base/add-event.js'].lineData[88]++;
  DomEvent.on(doc, gestureEndEvent, self.onTouchEnd, self);
}, 
  addTouch: function(originalEvent) {
  _$jscoverage['/base/add-event.js'].functionData[6]++;
  _$jscoverage['/base/add-event.js'].lineData[92]++;
  originalEvent.identifier = originalEvent.pointerId;
  _$jscoverage['/base/add-event.js'].lineData[93]++;
  this.touches.push(originalEvent);
}, 
  removeTouch: function(originalEvent) {
  _$jscoverage['/base/add-event.js'].functionData[7]++;
  _$jscoverage['/base/add-event.js'].lineData[97]++;
  var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
  _$jscoverage['/base/add-event.js'].lineData[102]++;
  for (; visit7_102_1(i < l); i++) {
    _$jscoverage['/base/add-event.js'].lineData[103]++;
    touch = touches[i];
    _$jscoverage['/base/add-event.js'].lineData[104]++;
    if (visit8_104_1(touch.pointerId === pointerId)) {
      _$jscoverage['/base/add-event.js'].lineData[105]++;
      touches.splice(i, 1);
      _$jscoverage['/base/add-event.js'].lineData[106]++;
      break;
    }
  }
}, 
  updateTouch: function(originalEvent) {
  _$jscoverage['/base/add-event.js'].functionData[8]++;
  _$jscoverage['/base/add-event.js'].lineData[112]++;
  var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
  _$jscoverage['/base/add-event.js'].lineData[117]++;
  for (; visit9_117_1(i < l); i++) {
    _$jscoverage['/base/add-event.js'].lineData[118]++;
    touch = touches[i];
    _$jscoverage['/base/add-event.js'].lineData[119]++;
    if (visit10_119_1(touch.pointerId === pointerId)) {
      _$jscoverage['/base/add-event.js'].lineData[120]++;
      touches[i] = originalEvent;
    }
  }
}, 
  isPrimaryTouch: function(inTouch) {
  _$jscoverage['/base/add-event.js'].functionData[9]++;
  _$jscoverage['/base/add-event.js'].lineData[126]++;
  return visit11_126_1(this.firstTouch === inTouch.identifier);
}, 
  setPrimaryTouch: function(inTouch) {
  _$jscoverage['/base/add-event.js'].functionData[10]++;
  _$jscoverage['/base/add-event.js'].lineData[130]++;
  if (visit12_130_1(this.firstTouch === null)) {
    _$jscoverage['/base/add-event.js'].lineData[131]++;
    this.firstTouch = inTouch.identifier;
  }
}, 
  removePrimaryTouch: function(inTouch) {
  _$jscoverage['/base/add-event.js'].functionData[11]++;
  _$jscoverage['/base/add-event.js'].lineData[136]++;
  if (visit13_136_1(this.isPrimaryTouch(inTouch))) {
    _$jscoverage['/base/add-event.js'].lineData[137]++;
    this.firstTouch = null;
  }
}, 
  dupMouse: function(inEvent) {
  _$jscoverage['/base/add-event.js'].functionData[12]++;
  _$jscoverage['/base/add-event.js'].lineData[143]++;
  var lts = this.lastTouches;
  _$jscoverage['/base/add-event.js'].lineData[144]++;
  var t = inEvent.changedTouches[0];
  _$jscoverage['/base/add-event.js'].lineData[146]++;
  if (visit14_146_1(this.isPrimaryTouch(t))) {
    _$jscoverage['/base/add-event.js'].lineData[148]++;
    var lt = {
  x: t.clientX, 
  y: t.clientY};
    _$jscoverage['/base/add-event.js'].lineData[149]++;
    lts.push(lt);
    _$jscoverage['/base/add-event.js'].lineData[150]++;
    setTimeout(function() {
  _$jscoverage['/base/add-event.js'].functionData[13]++;
  _$jscoverage['/base/add-event.js'].lineData[151]++;
  var i = lts.indexOf(lt);
  _$jscoverage['/base/add-event.js'].lineData[152]++;
  if (visit15_152_1(i > -1)) {
    _$jscoverage['/base/add-event.js'].lineData[153]++;
    lts.splice(i, 1);
  }
}, DUP_TIMEOUT);
  }
}, 
  isEventSimulatedFromTouch: function(inEvent) {
  _$jscoverage['/base/add-event.js'].functionData[14]++;
  _$jscoverage['/base/add-event.js'].lineData[161]++;
  var lts = this.lastTouches;
  _$jscoverage['/base/add-event.js'].lineData[162]++;
  var x = inEvent.clientX, y = inEvent.clientY;
  _$jscoverage['/base/add-event.js'].lineData[164]++;
  for (var i = 0, l = lts.length, t; visit16_164_1(visit17_164_2(i < l) && (t = lts[i])); i++) {
    _$jscoverage['/base/add-event.js'].lineData[166]++;
    var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
    _$jscoverage['/base/add-event.js'].lineData[168]++;
    if (visit18_168_1(visit19_168_2(dx <= DUP_DIST) && visit20_168_3(dy <= DUP_DIST))) {
      _$jscoverage['/base/add-event.js'].lineData[169]++;
      return true;
    }
  }
  _$jscoverage['/base/add-event.js'].lineData[172]++;
  return 0;
}, 
  normalize: function(e) {
  _$jscoverage['/base/add-event.js'].functionData[15]++;
  _$jscoverage['/base/add-event.js'].lineData[176]++;
  var type = e.type, notUp, touchEvent, touchList;
  _$jscoverage['/base/add-event.js'].lineData[180]++;
  if ((touchEvent = isTouchEvent(type))) {
    _$jscoverage['/base/add-event.js'].lineData[181]++;
    touchList = (visit21_181_1(visit22_181_2(type === 'touchend') || visit23_181_3(type === 'touchcancel'))) ? e.changedTouches : e.touches;
    _$jscoverage['/base/add-event.js'].lineData[184]++;
    e.gestureType = 'touch';
  } else {
    _$jscoverage['/base/add-event.js'].lineData[186]++;
    if (visit24_186_1(isPointerEvent(type))) {
      _$jscoverage['/base/add-event.js'].lineData[187]++;
      e.gestureType = e.originalEvent.pointerType;
    } else {
      _$jscoverage['/base/add-event.js'].lineData[188]++;
      if (visit25_188_1(isMouseEvent(type))) {
        _$jscoverage['/base/add-event.js'].lineData[189]++;
        e.gestureType = 'mouse';
      }
    }
    _$jscoverage['/base/add-event.js'].lineData[191]++;
    touchList = this.touches;
  }
  _$jscoverage['/base/add-event.js'].lineData[193]++;
  if (visit26_193_1(touchList && visit27_193_2(touchList.length === 1))) {
    _$jscoverage['/base/add-event.js'].lineData[194]++;
    e.which = 1;
    _$jscoverage['/base/add-event.js'].lineData[195]++;
    e.pageX = touchList[0].pageX;
    _$jscoverage['/base/add-event.js'].lineData[196]++;
    e.pageY = touchList[0].pageY;
  }
  _$jscoverage['/base/add-event.js'].lineData[198]++;
  if (visit28_198_1(touchEvent)) {
    _$jscoverage['/base/add-event.js'].lineData[199]++;
    return e;
  }
  _$jscoverage['/base/add-event.js'].lineData[201]++;
  notUp = !type.match(/(up|cancel)$/i);
  _$jscoverage['/base/add-event.js'].lineData[202]++;
  e.touches = notUp ? touchList : [];
  _$jscoverage['/base/add-event.js'].lineData[203]++;
  e.targetTouches = notUp ? touchList : [];
  _$jscoverage['/base/add-event.js'].lineData[204]++;
  e.changedTouches = touchList;
  _$jscoverage['/base/add-event.js'].lineData[205]++;
  return e;
}, 
  onTouchStart: function(event) {
  _$jscoverage['/base/add-event.js'].functionData[16]++;
  _$jscoverage['/base/add-event.js'].lineData[209]++;
  var e, h, self = this, type = event.type, eventHandles = self.eventHandles;
  _$jscoverage['/base/add-event.js'].lineData[213]++;
  if (visit29_213_1(isTouchEvent(type))) {
    _$jscoverage['/base/add-event.js'].lineData[214]++;
    self.setPrimaryTouch(event.changedTouches[0]);
    _$jscoverage['/base/add-event.js'].lineData[215]++;
    self.dupMouse(event);
  } else {
    _$jscoverage['/base/add-event.js'].lineData[216]++;
    if (visit30_216_1(isMouseEvent(type))) {
      _$jscoverage['/base/add-event.js'].lineData[217]++;
      if (visit31_217_1(self.isEventSimulatedFromTouch(event))) {
        _$jscoverage['/base/add-event.js'].lineData[218]++;
        return;
      }
      _$jscoverage['/base/add-event.js'].lineData[220]++;
      self.touches = [event];
    } else {
      _$jscoverage['/base/add-event.js'].lineData[221]++;
      if (visit32_221_1(isPointerEvent(type))) {
        _$jscoverage['/base/add-event.js'].lineData[222]++;
        self.addTouch(event.originalEvent);
        _$jscoverage['/base/add-event.js'].lineData[223]++;
        if (visit33_223_1(self.touches.length === 1)) {
          _$jscoverage['/base/add-event.js'].lineData[224]++;
          DomEvent.on(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      } else {
        _$jscoverage['/base/add-event.js'].lineData[227]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/base/add-event.js'].lineData[230]++;
  for (var i = 0, l = eventHandles.length; visit34_230_1(i < l); i++) {
    _$jscoverage['/base/add-event.js'].lineData[231]++;
    e = eventHandles[i];
    _$jscoverage['/base/add-event.js'].lineData[232]++;
    h = eventHandles[e].handle;
    _$jscoverage['/base/add-event.js'].lineData[233]++;
    h.isActive = 1;
  }
  _$jscoverage['/base/add-event.js'].lineData[236]++;
  self.callEventHandle('onTouchStart', event);
}, 
  onTouchMove: function(event) {
  _$jscoverage['/base/add-event.js'].functionData[17]++;
  _$jscoverage['/base/add-event.js'].lineData[240]++;
  var self = this, type = event.type;
  _$jscoverage['/base/add-event.js'].lineData[242]++;
  if (visit35_242_1(isMouseEvent(type))) {
    _$jscoverage['/base/add-event.js'].lineData[243]++;
    if (visit36_243_1(self.isEventSimulatedFromTouch(type))) {
      _$jscoverage['/base/add-event.js'].lineData[244]++;
      return;
    }
    _$jscoverage['/base/add-event.js'].lineData[246]++;
    self.touches = [event];
  } else {
    _$jscoverage['/base/add-event.js'].lineData[247]++;
    if (visit37_247_1(isPointerEvent(type))) {
      _$jscoverage['/base/add-event.js'].lineData[248]++;
      self.updateTouch(event.originalEvent);
    } else {
      _$jscoverage['/base/add-event.js'].lineData[249]++;
      if (visit38_249_1(!isTouchEvent(type))) {
        _$jscoverage['/base/add-event.js'].lineData[250]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/base/add-event.js'].lineData[253]++;
  self.callEventHandle('onTouchMove', event);
}, 
  onTouchEnd: function(event) {
  _$jscoverage['/base/add-event.js'].functionData[18]++;
  _$jscoverage['/base/add-event.js'].lineData[257]++;
  var self = this, type = event.type;
  _$jscoverage['/base/add-event.js'].lineData[259]++;
  if (visit39_259_1(isMouseEvent(type))) {
    _$jscoverage['/base/add-event.js'].lineData[260]++;
    if (visit40_260_1(self.isEventSimulatedFromTouch(event))) {
      _$jscoverage['/base/add-event.js'].lineData[261]++;
      return;
    }
  }
  _$jscoverage['/base/add-event.js'].lineData[265]++;
  self.callEventHandle('onTouchEnd', event);
  _$jscoverage['/base/add-event.js'].lineData[266]++;
  if (visit41_266_1(isTouchEvent(type))) {
    _$jscoverage['/base/add-event.js'].lineData[267]++;
    self.dupMouse(event);
    _$jscoverage['/base/add-event.js'].lineData[268]++;
    S.makeArray(event.changedTouches).forEach(function(touch) {
  _$jscoverage['/base/add-event.js'].functionData[19]++;
  _$jscoverage['/base/add-event.js'].lineData[269]++;
  self.removePrimaryTouch(touch);
});
  } else {
    _$jscoverage['/base/add-event.js'].lineData[271]++;
    if (visit42_271_1(isMouseEvent(type))) {
      _$jscoverage['/base/add-event.js'].lineData[272]++;
      self.touches = [];
    } else {
      _$jscoverage['/base/add-event.js'].lineData[273]++;
      if (visit43_273_1(isPointerEvent(type))) {
        _$jscoverage['/base/add-event.js'].lineData[274]++;
        self.removeTouch(event.originalEvent);
        _$jscoverage['/base/add-event.js'].lineData[275]++;
        if (visit44_275_1(!self.touches.length)) {
          _$jscoverage['/base/add-event.js'].lineData[276]++;
          DomEvent.detach(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      }
    }
  }
}, 
  callEventHandle: function(method, event) {
  _$jscoverage['/base/add-event.js'].functionData[20]++;
  _$jscoverage['/base/add-event.js'].lineData[282]++;
  var self = this, eventHandles = self.eventHandles, handleArray = eventHandles.concat(), e, h;
  _$jscoverage['/base/add-event.js'].lineData[287]++;
  event = self.normalize(event);
  _$jscoverage['/base/add-event.js'].lineData[288]++;
  var gestureType = event.gestureType;
  _$jscoverage['/base/add-event.js'].lineData[290]++;
  if (visit45_290_1(!event.changedTouches.length)) {
    _$jscoverage['/base/add-event.js'].lineData[291]++;
    return;
  }
  _$jscoverage['/base/add-event.js'].lineData[293]++;
  for (var i = 0, l = handleArray.length; visit46_293_1(i < l); i++) {
    _$jscoverage['/base/add-event.js'].lineData[294]++;
    e = handleArray[i];
    _$jscoverage['/base/add-event.js'].lineData[295]++;
    if (visit47_295_1(eventHandles[e])) {
      _$jscoverage['/base/add-event.js'].lineData[297]++;
      h = eventHandles[e].handle;
      _$jscoverage['/base/add-event.js'].lineData[300]++;
      if (visit48_300_1(h.requiredGestureType && visit49_300_2(gestureType !== h.requiredGestureType))) {
        _$jscoverage['/base/add-event.js'].lineData[301]++;
        continue;
      }
      _$jscoverage['/base/add-event.js'].lineData[304]++;
      if (visit50_304_1(h.processed)) {
        _$jscoverage['/base/add-event.js'].lineData[305]++;
        continue;
      }
      _$jscoverage['/base/add-event.js'].lineData[307]++;
      h.processed = 1;
      _$jscoverage['/base/add-event.js'].lineData[308]++;
      if (visit51_308_1(h.isActive && visit52_308_2(h[method] && visit53_308_3(h[method](event) === false)))) {
        _$jscoverage['/base/add-event.js'].lineData[309]++;
        h.isActive = 0;
      }
    }
  }
  _$jscoverage['/base/add-event.js'].lineData[314]++;
  for (i = 0 , l = handleArray.length; visit54_314_1(i < l); i++) {
    _$jscoverage['/base/add-event.js'].lineData[315]++;
    e = eventHandles[i];
    _$jscoverage['/base/add-event.js'].lineData[316]++;
    if (visit55_316_1(eventHandles[e])) {
      _$jscoverage['/base/add-event.js'].lineData[317]++;
      h = eventHandles[e].handle;
      _$jscoverage['/base/add-event.js'].lineData[318]++;
      h.processed = 0;
    }
  }
}, 
  addEventHandle: function(event) {
  _$jscoverage['/base/add-event.js'].functionData[21]++;
  _$jscoverage['/base/add-event.js'].lineData[324]++;
  var self = this, eventHandles = self.eventHandles, handle = eventHandleMap[event].handle;
  _$jscoverage['/base/add-event.js'].lineData[327]++;
  if (visit56_327_1(eventHandles[event])) {
    _$jscoverage['/base/add-event.js'].lineData[328]++;
    eventHandles[event].count++;
  } else {
    _$jscoverage['/base/add-event.js'].lineData[330]++;
    eventHandles.push(event);
    _$jscoverage['/base/add-event.js'].lineData[331]++;
    self.sortEventHandles();
    _$jscoverage['/base/add-event.js'].lineData[332]++;
    eventHandles[event] = {
  count: 1, 
  handle: handle};
  }
}, 
  sortEventHandles: function() {
  _$jscoverage['/base/add-event.js'].functionData[22]++;
  _$jscoverage['/base/add-event.js'].lineData[340]++;
  this.eventHandles.sort(function(e1, e2) {
  _$jscoverage['/base/add-event.js'].functionData[23]++;
  _$jscoverage['/base/add-event.js'].lineData[341]++;
  var e1Config = eventHandleMap[e1];
  _$jscoverage['/base/add-event.js'].lineData[342]++;
  var e2Config = eventHandleMap[e2];
  _$jscoverage['/base/add-event.js'].lineData[343]++;
  return e1Config.order - e2Config.order;
});
}, 
  'removeEventHandle': function(event) {
  _$jscoverage['/base/add-event.js'].functionData[24]++;
  _$jscoverage['/base/add-event.js'].lineData[348]++;
  var eventHandles = this.eventHandles;
  _$jscoverage['/base/add-event.js'].lineData[349]++;
  if (visit57_349_1(eventHandles[event])) {
    _$jscoverage['/base/add-event.js'].lineData[350]++;
    eventHandles[event].count--;
    _$jscoverage['/base/add-event.js'].lineData[351]++;
    if (visit58_351_1(!eventHandles[event].count)) {
      _$jscoverage['/base/add-event.js'].lineData[352]++;
      eventHandles.splice(S.indexOf(event, eventHandles), 1);
      _$jscoverage['/base/add-event.js'].lineData[353]++;
      delete eventHandles[event];
    }
  }
}, 
  destroy: function() {
  _$jscoverage['/base/add-event.js'].functionData[25]++;
  _$jscoverage['/base/add-event.js'].lineData[359]++;
  var self = this, doc = self.doc;
  _$jscoverage['/base/add-event.js'].lineData[361]++;
  DomEvent.detach(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/base/add-event.js'].lineData[362]++;
  DomEvent.detach(doc, gestureMoveEvent, self.onTouchMove, self);
  _$jscoverage['/base/add-event.js'].lineData[363]++;
  DomEvent.detach(doc, gestureEndEvent, self.onTouchEnd, self);
}};
  _$jscoverage['/base/add-event.js'].lineData[367]++;
  function setup(event) {
    _$jscoverage['/base/add-event.js'].functionData[26]++;
    _$jscoverage['/base/add-event.js'].lineData[368]++;
    addDocumentHandle(this, event);
  }
  _$jscoverage['/base/add-event.js'].lineData[371]++;
  function tearDown(event) {
    _$jscoverage['/base/add-event.js'].functionData[27]++;
    _$jscoverage['/base/add-event.js'].lineData[372]++;
    removeDocumentHandle(this, event);
  }
  _$jscoverage['/base/add-event.js'].lineData[375]++;
  function setupExtra(event) {
    _$jscoverage['/base/add-event.js'].functionData[28]++;
    _$jscoverage['/base/add-event.js'].lineData[376]++;
    setup.call(this, event);
    _$jscoverage['/base/add-event.js'].lineData[377]++;
    eventHandleMap[event].setup.apply(this, arguments);
  }
  _$jscoverage['/base/add-event.js'].lineData[380]++;
  function tearDownExtra(event) {
    _$jscoverage['/base/add-event.js'].functionData[29]++;
    _$jscoverage['/base/add-event.js'].lineData[381]++;
    tearDown.call(this, event);
    _$jscoverage['/base/add-event.js'].lineData[382]++;
    eventHandleMap[event].tearDown.apply(this, arguments);
  }
  _$jscoverage['/base/add-event.js'].lineData[385]++;
  function addDocumentHandle(el, event) {
    _$jscoverage['/base/add-event.js'].functionData[30]++;
    _$jscoverage['/base/add-event.js'].lineData[386]++;
    var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
    _$jscoverage['/base/add-event.js'].lineData[388]++;
    if (visit59_388_1(!handle)) {
      _$jscoverage['/base/add-event.js'].lineData[389]++;
      Dom.data(doc, key, handle = new DocumentHandler(doc));
    }
    _$jscoverage['/base/add-event.js'].lineData[391]++;
    if (visit60_391_1(event)) {
      _$jscoverage['/base/add-event.js'].lineData[392]++;
      handle.addEventHandle(event);
    }
  }
  _$jscoverage['/base/add-event.js'].lineData[396]++;
  function removeDocumentHandle(el, event) {
    _$jscoverage['/base/add-event.js'].functionData[31]++;
    _$jscoverage['/base/add-event.js'].lineData[397]++;
    var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
    _$jscoverage['/base/add-event.js'].lineData[399]++;
    if (visit61_399_1(handle)) {
      _$jscoverage['/base/add-event.js'].lineData[400]++;
      if (visit62_400_1(event)) {
        _$jscoverage['/base/add-event.js'].lineData[401]++;
        handle.removeEventHandle(event);
      }
      _$jscoverage['/base/add-event.js'].lineData[403]++;
      if (visit63_403_1(!handle.eventHandles.length)) {
        _$jscoverage['/base/add-event.js'].lineData[404]++;
        handle.destroy();
        _$jscoverage['/base/add-event.js'].lineData[405]++;
        Dom.removeData(doc, key);
      }
    }
  }
  _$jscoverage['/base/add-event.js'].lineData[410]++;
  return function(events, config) {
  _$jscoverage['/base/add-event.js'].functionData[32]++;
  _$jscoverage['/base/add-event.js'].lineData[411]++;
  if (visit64_411_1(typeof events === 'string')) {
    _$jscoverage['/base/add-event.js'].lineData[412]++;
    events = [events];
  }
  _$jscoverage['/base/add-event.js'].lineData[414]++;
  S.each(events, function(event) {
  _$jscoverage['/base/add-event.js'].functionData[33]++;
  _$jscoverage['/base/add-event.js'].lineData[415]++;
  var specialEvent = {};
  _$jscoverage['/base/add-event.js'].lineData[416]++;
  specialEvent.setup = config.setup ? setupExtra : setup;
  _$jscoverage['/base/add-event.js'].lineData[417]++;
  specialEvent.tearDown = config.tearDown ? tearDownExtra : tearDown;
  _$jscoverage['/base/add-event.js'].lineData[418]++;
  specialEvent.add = config.add;
  _$jscoverage['/base/add-event.js'].lineData[419]++;
  specialEvent.remove = config.remove;
  _$jscoverage['/base/add-event.js'].lineData[420]++;
  config.order = visit65_420_1(config.order || 100);
  _$jscoverage['/base/add-event.js'].lineData[422]++;
  eventHandleMap[event] = config;
  _$jscoverage['/base/add-event.js'].lineData[423]++;
  Special[event] = specialEvent;
});
};
});
