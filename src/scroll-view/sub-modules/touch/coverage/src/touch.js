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
if (! _$jscoverage['/touch.js']) {
  _$jscoverage['/touch.js'] = {};
  _$jscoverage['/touch.js'].lineData = [];
  _$jscoverage['/touch.js'].lineData[6] = 0;
  _$jscoverage['/touch.js'].lineData[7] = 0;
  _$jscoverage['/touch.js'].lineData[8] = 0;
  _$jscoverage['/touch.js'].lineData[9] = 0;
  _$jscoverage['/touch.js'].lineData[10] = 0;
  _$jscoverage['/touch.js'].lineData[11] = 0;
  _$jscoverage['/touch.js'].lineData[12] = 0;
  _$jscoverage['/touch.js'].lineData[14] = 0;
  _$jscoverage['/touch.js'].lineData[15] = 0;
  _$jscoverage['/touch.js'].lineData[16] = 0;
  _$jscoverage['/touch.js'].lineData[18] = 0;
  _$jscoverage['/touch.js'].lineData[24] = 0;
  _$jscoverage['/touch.js'].lineData[25] = 0;
  _$jscoverage['/touch.js'].lineData[28] = 0;
  _$jscoverage['/touch.js'].lineData[29] = 0;
  _$jscoverage['/touch.js'].lineData[30] = 0;
  _$jscoverage['/touch.js'].lineData[31] = 0;
  _$jscoverage['/touch.js'].lineData[32] = 0;
  _$jscoverage['/touch.js'].lineData[33] = 0;
  _$jscoverage['/touch.js'].lineData[34] = 0;
  _$jscoverage['/touch.js'].lineData[35] = 0;
  _$jscoverage['/touch.js'].lineData[38] = 0;
  _$jscoverage['/touch.js'].lineData[41] = 0;
  _$jscoverage['/touch.js'].lineData[42] = 0;
  _$jscoverage['/touch.js'].lineData[43] = 0;
  _$jscoverage['/touch.js'].lineData[44] = 0;
  _$jscoverage['/touch.js'].lineData[46] = 0;
  _$jscoverage['/touch.js'].lineData[49] = 0;
  _$jscoverage['/touch.js'].lineData[50] = 0;
  _$jscoverage['/touch.js'].lineData[51] = 0;
  _$jscoverage['/touch.js'].lineData[52] = 0;
  _$jscoverage['/touch.js'].lineData[54] = 0;
  _$jscoverage['/touch.js'].lineData[59] = 0;
  _$jscoverage['/touch.js'].lineData[60] = 0;
  _$jscoverage['/touch.js'].lineData[61] = 0;
  _$jscoverage['/touch.js'].lineData[62] = 0;
  _$jscoverage['/touch.js'].lineData[64] = 0;
  _$jscoverage['/touch.js'].lineData[65] = 0;
  _$jscoverage['/touch.js'].lineData[66] = 0;
  _$jscoverage['/touch.js'].lineData[67] = 0;
  _$jscoverage['/touch.js'].lineData[73] = 0;
  _$jscoverage['/touch.js'].lineData[76] = 0;
  _$jscoverage['/touch.js'].lineData[77] = 0;
  _$jscoverage['/touch.js'].lineData[78] = 0;
  _$jscoverage['/touch.js'].lineData[81] = 0;
  _$jscoverage['/touch.js'].lineData[83] = 0;
  _$jscoverage['/touch.js'].lineData[85] = 0;
  _$jscoverage['/touch.js'].lineData[96] = 0;
  _$jscoverage['/touch.js'].lineData[97] = 0;
  _$jscoverage['/touch.js'].lineData[99] = 0;
  _$jscoverage['/touch.js'].lineData[102] = 0;
  _$jscoverage['/touch.js'].lineData[103] = 0;
  _$jscoverage['/touch.js'].lineData[104] = 0;
  _$jscoverage['/touch.js'].lineData[105] = 0;
  _$jscoverage['/touch.js'].lineData[106] = 0;
  _$jscoverage['/touch.js'].lineData[108] = 0;
  _$jscoverage['/touch.js'].lineData[110] = 0;
  _$jscoverage['/touch.js'].lineData[111] = 0;
  _$jscoverage['/touch.js'].lineData[112] = 0;
  _$jscoverage['/touch.js'].lineData[113] = 0;
  _$jscoverage['/touch.js'].lineData[114] = 0;
  _$jscoverage['/touch.js'].lineData[117] = 0;
  _$jscoverage['/touch.js'].lineData[118] = 0;
  _$jscoverage['/touch.js'].lineData[122] = 0;
  _$jscoverage['/touch.js'].lineData[124] = 0;
  _$jscoverage['/touch.js'].lineData[125] = 0;
  _$jscoverage['/touch.js'].lineData[127] = 0;
  _$jscoverage['/touch.js'].lineData[128] = 0;
  _$jscoverage['/touch.js'].lineData[129] = 0;
  _$jscoverage['/touch.js'].lineData[131] = 0;
  _$jscoverage['/touch.js'].lineData[132] = 0;
  _$jscoverage['/touch.js'].lineData[133] = 0;
  _$jscoverage['/touch.js'].lineData[135] = 0;
  _$jscoverage['/touch.js'].lineData[136] = 0;
  _$jscoverage['/touch.js'].lineData[142] = 0;
  _$jscoverage['/touch.js'].lineData[144] = 0;
  _$jscoverage['/touch.js'].lineData[146] = 0;
  _$jscoverage['/touch.js'].lineData[148] = 0;
  _$jscoverage['/touch.js'].lineData[152] = 0;
  _$jscoverage['/touch.js'].lineData[153] = 0;
  _$jscoverage['/touch.js'].lineData[154] = 0;
  _$jscoverage['/touch.js'].lineData[156] = 0;
  _$jscoverage['/touch.js'].lineData[161] = 0;
  _$jscoverage['/touch.js'].lineData[162] = 0;
  _$jscoverage['/touch.js'].lineData[164] = 0;
  _$jscoverage['/touch.js'].lineData[165] = 0;
  _$jscoverage['/touch.js'].lineData[167] = 0;
  _$jscoverage['/touch.js'].lineData[168] = 0;
  _$jscoverage['/touch.js'].lineData[169] = 0;
  _$jscoverage['/touch.js'].lineData[170] = 0;
  _$jscoverage['/touch.js'].lineData[171] = 0;
  _$jscoverage['/touch.js'].lineData[174] = 0;
  _$jscoverage['/touch.js'].lineData[175] = 0;
  _$jscoverage['/touch.js'].lineData[177] = 0;
  _$jscoverage['/touch.js'].lineData[178] = 0;
  _$jscoverage['/touch.js'].lineData[181] = 0;
  _$jscoverage['/touch.js'].lineData[182] = 0;
  _$jscoverage['/touch.js'].lineData[184] = 0;
  _$jscoverage['/touch.js'].lineData[188] = 0;
  _$jscoverage['/touch.js'].lineData[189] = 0;
  _$jscoverage['/touch.js'].lineData[191] = 0;
  _$jscoverage['/touch.js'].lineData[192] = 0;
  _$jscoverage['/touch.js'].lineData[195] = 0;
  _$jscoverage['/touch.js'].lineData[196] = 0;
  _$jscoverage['/touch.js'].lineData[197] = 0;
  _$jscoverage['/touch.js'].lineData[198] = 0;
  _$jscoverage['/touch.js'].lineData[200] = 0;
  _$jscoverage['/touch.js'].lineData[203] = 0;
  _$jscoverage['/touch.js'].lineData[204] = 0;
  _$jscoverage['/touch.js'].lineData[205] = 0;
  _$jscoverage['/touch.js'].lineData[206] = 0;
  _$jscoverage['/touch.js'].lineData[208] = 0;
  _$jscoverage['/touch.js'].lineData[212] = 0;
  _$jscoverage['/touch.js'].lineData[214] = 0;
  _$jscoverage['/touch.js'].lineData[215] = 0;
  _$jscoverage['/touch.js'].lineData[218] = 0;
  _$jscoverage['/touch.js'].lineData[219] = 0;
  _$jscoverage['/touch.js'].lineData[220] = 0;
  _$jscoverage['/touch.js'].lineData[221] = 0;
  _$jscoverage['/touch.js'].lineData[223] = 0;
  _$jscoverage['/touch.js'].lineData[233] = 0;
  _$jscoverage['/touch.js'].lineData[234] = 0;
  _$jscoverage['/touch.js'].lineData[235] = 0;
  _$jscoverage['/touch.js'].lineData[236] = 0;
  _$jscoverage['/touch.js'].lineData[237] = 0;
  _$jscoverage['/touch.js'].lineData[238] = 0;
  _$jscoverage['/touch.js'].lineData[239] = 0;
  _$jscoverage['/touch.js'].lineData[240] = 0;
  _$jscoverage['/touch.js'].lineData[242] = 0;
  _$jscoverage['/touch.js'].lineData[243] = 0;
  _$jscoverage['/touch.js'].lineData[244] = 0;
  _$jscoverage['/touch.js'].lineData[245] = 0;
  _$jscoverage['/touch.js'].lineData[246] = 0;
  _$jscoverage['/touch.js'].lineData[247] = 0;
  _$jscoverage['/touch.js'].lineData[257] = 0;
  _$jscoverage['/touch.js'].lineData[258] = 0;
  _$jscoverage['/touch.js'].lineData[259] = 0;
  _$jscoverage['/touch.js'].lineData[262] = 0;
  _$jscoverage['/touch.js'].lineData[263] = 0;
  _$jscoverage['/touch.js'].lineData[264] = 0;
  _$jscoverage['/touch.js'].lineData[265] = 0;
  _$jscoverage['/touch.js'].lineData[266] = 0;
  _$jscoverage['/touch.js'].lineData[268] = 0;
  _$jscoverage['/touch.js'].lineData[274] = 0;
  _$jscoverage['/touch.js'].lineData[275] = 0;
  _$jscoverage['/touch.js'].lineData[277] = 0;
  _$jscoverage['/touch.js'].lineData[279] = 0;
  _$jscoverage['/touch.js'].lineData[280] = 0;
  _$jscoverage['/touch.js'].lineData[281] = 0;
  _$jscoverage['/touch.js'].lineData[284] = 0;
  _$jscoverage['/touch.js'].lineData[288] = 0;
  _$jscoverage['/touch.js'].lineData[289] = 0;
  _$jscoverage['/touch.js'].lineData[290] = 0;
  _$jscoverage['/touch.js'].lineData[291] = 0;
  _$jscoverage['/touch.js'].lineData[292] = 0;
  _$jscoverage['/touch.js'].lineData[293] = 0;
  _$jscoverage['/touch.js'].lineData[294] = 0;
  _$jscoverage['/touch.js'].lineData[298] = 0;
  _$jscoverage['/touch.js'].lineData[299] = 0;
  _$jscoverage['/touch.js'].lineData[300] = 0;
  _$jscoverage['/touch.js'].lineData[301] = 0;
  _$jscoverage['/touch.js'].lineData[302] = 0;
  _$jscoverage['/touch.js'].lineData[303] = 0;
  _$jscoverage['/touch.js'].lineData[304] = 0;
  _$jscoverage['/touch.js'].lineData[305] = 0;
  _$jscoverage['/touch.js'].lineData[306] = 0;
  _$jscoverage['/touch.js'].lineData[307] = 0;
  _$jscoverage['/touch.js'].lineData[308] = 0;
  _$jscoverage['/touch.js'].lineData[313] = 0;
  _$jscoverage['/touch.js'].lineData[314] = 0;
  _$jscoverage['/touch.js'].lineData[315] = 0;
  _$jscoverage['/touch.js'].lineData[316] = 0;
  _$jscoverage['/touch.js'].lineData[317] = 0;
  _$jscoverage['/touch.js'].lineData[318] = 0;
  _$jscoverage['/touch.js'].lineData[319] = 0;
  _$jscoverage['/touch.js'].lineData[324] = 0;
  _$jscoverage['/touch.js'].lineData[325] = 0;
  _$jscoverage['/touch.js'].lineData[326] = 0;
  _$jscoverage['/touch.js'].lineData[328] = 0;
  _$jscoverage['/touch.js'].lineData[329] = 0;
  _$jscoverage['/touch.js'].lineData[332] = 0;
  _$jscoverage['/touch.js'].lineData[335] = 0;
  _$jscoverage['/touch.js'].lineData[336] = 0;
  _$jscoverage['/touch.js'].lineData[339] = 0;
  _$jscoverage['/touch.js'].lineData[341] = 0;
  _$jscoverage['/touch.js'].lineData[342] = 0;
  _$jscoverage['/touch.js'].lineData[349] = 0;
  _$jscoverage['/touch.js'].lineData[350] = 0;
  _$jscoverage['/touch.js'].lineData[353] = 0;
  _$jscoverage['/touch.js'].lineData[354] = 0;
  _$jscoverage['/touch.js'].lineData[355] = 0;
  _$jscoverage['/touch.js'].lineData[356] = 0;
  _$jscoverage['/touch.js'].lineData[359] = 0;
  _$jscoverage['/touch.js'].lineData[360] = 0;
  _$jscoverage['/touch.js'].lineData[362] = 0;
  _$jscoverage['/touch.js'].lineData[363] = 0;
  _$jscoverage['/touch.js'].lineData[364] = 0;
  _$jscoverage['/touch.js'].lineData[377] = 0;
  _$jscoverage['/touch.js'].lineData[379] = 0;
  _$jscoverage['/touch.js'].lineData[380] = 0;
  _$jscoverage['/touch.js'].lineData[381] = 0;
  _$jscoverage['/touch.js'].lineData[382] = 0;
  _$jscoverage['/touch.js'].lineData[383] = 0;
  _$jscoverage['/touch.js'].lineData[384] = 0;
  _$jscoverage['/touch.js'].lineData[385] = 0;
  _$jscoverage['/touch.js'].lineData[386] = 0;
  _$jscoverage['/touch.js'].lineData[387] = 0;
  _$jscoverage['/touch.js'].lineData[388] = 0;
  _$jscoverage['/touch.js'].lineData[396] = 0;
  _$jscoverage['/touch.js'].lineData[397] = 0;
  _$jscoverage['/touch.js'].lineData[401] = 0;
  _$jscoverage['/touch.js'].lineData[405] = 0;
  _$jscoverage['/touch.js'].lineData[409] = 0;
  _$jscoverage['/touch.js'].lineData[410] = 0;
}
if (! _$jscoverage['/touch.js'].functionData) {
  _$jscoverage['/touch.js'].functionData = [];
  _$jscoverage['/touch.js'].functionData[0] = 0;
  _$jscoverage['/touch.js'].functionData[1] = 0;
  _$jscoverage['/touch.js'].functionData[2] = 0;
  _$jscoverage['/touch.js'].functionData[3] = 0;
  _$jscoverage['/touch.js'].functionData[4] = 0;
  _$jscoverage['/touch.js'].functionData[5] = 0;
  _$jscoverage['/touch.js'].functionData[6] = 0;
  _$jscoverage['/touch.js'].functionData[7] = 0;
  _$jscoverage['/touch.js'].functionData[8] = 0;
  _$jscoverage['/touch.js'].functionData[9] = 0;
  _$jscoverage['/touch.js'].functionData[10] = 0;
  _$jscoverage['/touch.js'].functionData[11] = 0;
  _$jscoverage['/touch.js'].functionData[12] = 0;
  _$jscoverage['/touch.js'].functionData[13] = 0;
  _$jscoverage['/touch.js'].functionData[14] = 0;
  _$jscoverage['/touch.js'].functionData[15] = 0;
  _$jscoverage['/touch.js'].functionData[16] = 0;
}
if (! _$jscoverage['/touch.js'].branchData) {
  _$jscoverage['/touch.js'].branchData = {};
  _$jscoverage['/touch.js'].branchData['15'] = [];
  _$jscoverage['/touch.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['18'] = [];
  _$jscoverage['/touch.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['24'] = [];
  _$jscoverage['/touch.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['28'] = [];
  _$jscoverage['/touch.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['32'] = [];
  _$jscoverage['/touch.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['42'] = [];
  _$jscoverage['/touch.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['43'] = [];
  _$jscoverage['/touch.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['50'] = [];
  _$jscoverage['/touch.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['59'] = [];
  _$jscoverage['/touch.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['61'] = [];
  _$jscoverage['/touch.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['64'] = [];
  _$jscoverage['/touch.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['76'] = [];
  _$jscoverage['/touch.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['81'] = [];
  _$jscoverage['/touch.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['117'] = [];
  _$jscoverage['/touch.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['125'] = [];
  _$jscoverage['/touch.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['125'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['125'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['127'] = [];
  _$jscoverage['/touch.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['142'] = [];
  _$jscoverage['/touch.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['153'] = [];
  _$jscoverage['/touch.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['164'] = [];
  _$jscoverage['/touch.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['164'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['164'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['177'] = [];
  _$jscoverage['/touch.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['177'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['188'] = [];
  _$jscoverage['/touch.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['191'] = [];
  _$jscoverage['/touch.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['192'] = [];
  _$jscoverage['/touch.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['195'] = [];
  _$jscoverage['/touch.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['195'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['195'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['197'] = [];
  _$jscoverage['/touch.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['203'] = [];
  _$jscoverage['/touch.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['203'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['203'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['205'] = [];
  _$jscoverage['/touch.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['220'] = [];
  _$jscoverage['/touch.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['220'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['239'] = [];
  _$jscoverage['/touch.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['239'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['240'] = [];
  _$jscoverage['/touch.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['240'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['244'] = [];
  _$jscoverage['/touch.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['257'] = [];
  _$jscoverage['/touch.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['279'] = [];
  _$jscoverage['/touch.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['280'] = [];
  _$jscoverage['/touch.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['288'] = [];
  _$jscoverage['/touch.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['290'] = [];
  _$jscoverage['/touch.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['291'] = [];
  _$jscoverage['/touch.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['291'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['291'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['293'] = [];
  _$jscoverage['/touch.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['293'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['293'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['301'] = [];
  _$jscoverage['/touch.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['303'] = [];
  _$jscoverage['/touch.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['305'] = [];
  _$jscoverage['/touch.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['306'] = [];
  _$jscoverage['/touch.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['314'] = [];
  _$jscoverage['/touch.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['316'] = [];
  _$jscoverage['/touch.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['317'] = [];
  _$jscoverage['/touch.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['324'] = [];
  _$jscoverage['/touch.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['325'] = [];
  _$jscoverage['/touch.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['335'] = [];
  _$jscoverage['/touch.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['355'] = [];
  _$jscoverage['/touch.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['359'] = [];
  _$jscoverage['/touch.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['362'] = [];
  _$jscoverage['/touch.js'].branchData['362'][1] = new BranchData();
}
_$jscoverage['/touch.js'].branchData['362'][1].init(265, 16, 'self.isScrolling');
function visit67_362_1(result) {
  _$jscoverage['/touch.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['359'][1].init(180, 36, 'self.isScrolling && self.pagesOffset');
function visit66_359_1(result) {
  _$jscoverage['/touch.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['355'][1].init(40, 25, 'e.gestureType === \'touch\'');
function visit65_355_1(result) {
  _$jscoverage['/touch.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['335'][1].init(30, 16, 'allowX || allowY');
function visit64_335_1(result) {
  _$jscoverage['/touch.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['325'][1].init(34, 26, 'newPageIndex !== pageIndex');
function visit63_325_1(result) {
  _$jscoverage['/touch.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['324'][1].init(2157, 26, 'newPageIndex !== undefined');
function visit62_324_1(result) {
  _$jscoverage['/touch.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['317'][1].init(42, 23, 'min < nowXY.top - x.top');
function visit61_317_1(result) {
  _$jscoverage['/touch.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['316'][1].init(88, 17, 'x.top < nowXY.top');
function visit60_316_1(result) {
  _$jscoverage['/touch.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['314'][1].init(95, 15, 'i < prepareXLen');
function visit59_314_1(result) {
  _$jscoverage['/touch.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['306'][1].init(42, 23, 'min < x.top - nowXY.top');
function visit58_306_1(result) {
  _$jscoverage['/touch.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['305'][1].init(88, 17, 'x.top > nowXY.top');
function visit57_305_1(result) {
  _$jscoverage['/touch.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['303'][1].init(95, 15, 'i < prepareXLen');
function visit56_303_1(result) {
  _$jscoverage['/touch.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['301'][1].init(978, 11, 'offsetY > 0');
function visit55_301_1(result) {
  _$jscoverage['/touch.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['293'][3].init(201, 24, 'offset.left < nowXY.left');
function visit54_293_3(result) {
  _$jscoverage['/touch.js'].branchData['293'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['293'][2].init(186, 11, 'offsetX < 0');
function visit53_293_2(result) {
  _$jscoverage['/touch.js'].branchData['293'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['293'][1].init(186, 39, 'offsetX < 0 && offset.left < nowXY.left');
function visit52_293_1(result) {
  _$jscoverage['/touch.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['291'][3].init(53, 24, 'offset.left > nowXY.left');
function visit51_291_3(result) {
  _$jscoverage['/touch.js'].branchData['291'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['291'][2].init(38, 11, 'offsetX > 0');
function visit50_291_2(result) {
  _$jscoverage['/touch.js'].branchData['291'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['291'][1].init(38, 39, 'offsetX > 0 && offset.left > nowXY.left');
function visit49_291_1(result) {
  _$jscoverage['/touch.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['290'][1].init(92, 6, 'offset');
function visit48_290_1(result) {
  _$jscoverage['/touch.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['288'][1].init(315, 18, 'i < pagesOffsetLen');
function visit47_288_1(result) {
  _$jscoverage['/touch.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['280'][1].init(26, 16, 'allowX && allowY');
function visit46_280_1(result) {
  _$jscoverage['/touch.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['279'][1].init(1235, 16, 'allowX || allowY');
function visit45_279_1(result) {
  _$jscoverage['/touch.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['257'][1].init(487, 17, '!self.pagesOffset');
function visit44_257_1(result) {
  _$jscoverage['/touch.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['244'][1].init(40, 11, 'count === 2');
function visit43_244_1(result) {
  _$jscoverage['/touch.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['240'][2].init(300, 33, 'Math.abs(offsetY) > snapThreshold');
function visit42_240_2(result) {
  _$jscoverage['/touch.js'].branchData['240'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['240'][1].init(276, 57, 'self.allowScroll.top && Math.abs(offsetY) > snapThreshold');
function visit41_240_1(result) {
  _$jscoverage['/touch.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['239'][2].init(219, 33, 'Math.abs(offsetX) > snapThreshold');
function visit40_239_2(result) {
  _$jscoverage['/touch.js'].branchData['239'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['239'][1].init(194, 58, 'self.allowScroll.left && Math.abs(offsetX) > snapThreshold');
function visit39_239_1(result) {
  _$jscoverage['/touch.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['220'][2].init(40, 25, 'e.gestureType !== \'touch\'');
function visit38_220_2(result) {
  _$jscoverage['/touch.js'].branchData['220'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['220'][1].init(40, 46, 'e.gestureType !== \'touch\' || !self.isScrolling');
function visit37_220_1(result) {
  _$jscoverage['/touch.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['205'][1].init(61, 21, 'self._preventDefaultY');
function visit36_205_1(result) {
  _$jscoverage['/touch.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['203'][3].init(527, 27, 'dragInitDirection === \'top\'');
function visit35_203_3(result) {
  _$jscoverage['/touch.js'].branchData['203'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['203'][2].init(527, 67, 'dragInitDirection === \'top\' && !self.allowScroll[dragInitDirection]');
function visit34_203_2(result) {
  _$jscoverage['/touch.js'].branchData['203'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['203'][1].init(518, 76, 'lockY && dragInitDirection === \'top\' && !self.allowScroll[dragInitDirection]');
function visit33_203_1(result) {
  _$jscoverage['/touch.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['197'][1].init(61, 21, 'self._preventDefaultX');
function visit32_197_1(result) {
  _$jscoverage['/touch.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['195'][3].init(242, 28, 'dragInitDirection === \'left\'');
function visit31_195_3(result) {
  _$jscoverage['/touch.js'].branchData['195'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['195'][2].init(242, 68, 'dragInitDirection === \'left\' && !self.allowScroll[dragInitDirection]');
function visit30_195_2(result) {
  _$jscoverage['/touch.js'].branchData['195'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['195'][1].init(233, 77, 'lockX && dragInitDirection === \'left\' && !self.allowScroll[dragInitDirection]');
function visit29_195_1(result) {
  _$jscoverage['/touch.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['192'][1].init(63, 13, 'xDiff > yDiff');
function visit28_192_1(result) {
  _$jscoverage['/touch.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['191'][1].init(56, 45, '!(dragInitDirection = self.dragInitDirection)');
function visit27_191_1(result) {
  _$jscoverage['/touch.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['188'][1].init(375, 14, 'lockX || lockY');
function visit26_188_1(result) {
  _$jscoverage['/touch.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['177'][2].init(42, 25, 'e.gestureType !== \'touch\'');
function visit25_177_2(result) {
  _$jscoverage['/touch.js'].branchData['177'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['177'][1].init(42, 46, 'e.gestureType !== \'touch\' || !self.isScrolling');
function visit24_177_1(result) {
  _$jscoverage['/touch.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['164'][3].init(124, 36, 'self.isScrolling && self.pagesOffset');
function visit23_164_3(result) {
  _$jscoverage['/touch.js'].branchData['164'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['164'][2].init(94, 25, 'e.gestureType !== \'touch\'');
function visit22_164_2(result) {
  _$jscoverage['/touch.js'].branchData['164'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['164'][1].init(94, 67, 'e.gestureType !== \'touch\' || (self.isScrolling && self.pagesOffset)');
function visit21_164_1(result) {
  _$jscoverage['/touch.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['153'][1].init(355, 11, 'value === 0');
function visit20_153_1(result) {
  _$jscoverage['/touch.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['142'][1].init(1181, 18, 'value <= minScroll');
function visit19_142_1(result) {
  _$jscoverage['/touch.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['127'][1].init(58, 22, 'fx.lastValue === value');
function visit18_127_1(result) {
  _$jscoverage['/touch.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['125'][3].init(400, 17, 'value < maxScroll');
function visit17_125_3(result) {
  _$jscoverage['/touch.js'].branchData['125'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['125'][2].init(379, 17, 'value > minScroll');
function visit16_125_2(result) {
  _$jscoverage['/touch.js'].branchData['125'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['125'][1].init(379, 38, 'value > minScroll && value < maxScroll');
function visit15_125_1(result) {
  _$jscoverage['/touch.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['117'][1].init(102, 7, 'inertia');
function visit14_117_1(result) {
  _$jscoverage['/touch.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['81'][1].init(1011, 21, 'scrollType === \'left\'');
function visit13_81_1(result) {
  _$jscoverage['/touch.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['76'][1].init(905, 16, 'self.pagesOffset');
function visit12_76_1(result) {
  _$jscoverage['/touch.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['64'][1].init(525, 19, 'bound !== undefined');
function visit11_64_1(result) {
  _$jscoverage['/touch.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['61'][1].init(424, 30, 'scroll > maxScroll[scrollType]');
function visit10_61_1(result) {
  _$jscoverage['/touch.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['59'][1].init(325, 30, 'scroll < minScroll[scrollType]');
function visit9_59_1(result) {
  _$jscoverage['/touch.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['50'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit8_50_1(result) {
  _$jscoverage['/touch.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['43'][1].init(79, 51, '!self.allowScroll[scrollType] && self[\'_\' + lockXY]');
function visit7_43_1(result) {
  _$jscoverage['/touch.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['42'][1].init(23, 21, 'scrollType === \'left\'');
function visit6_42_1(result) {
  _$jscoverage['/touch.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['32'][1].init(662, 30, 'scroll > maxScroll[scrollType]');
function visit5_32_1(result) {
  _$jscoverage['/touch.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['28'][1].init(458, 30, 'scroll < minScroll[scrollType]');
function visit4_28_1(result) {
  _$jscoverage['/touch.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['24'][1].init(319, 13, '!self._bounce');
function visit3_24_1(result) {
  _$jscoverage['/touch.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['18'][1].init(98, 21, 'scrollType === \'left\'');
function visit2_18_1(result) {
  _$jscoverage['/touch.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['15'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit1_15_1(result) {
  _$jscoverage['/touch.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch.js'].functionData[0]++;
  _$jscoverage['/touch.js'].lineData[7]++;
  var ScrollViewBase = require('./base');
  _$jscoverage['/touch.js'].lineData[8]++;
  var Node = require('node');
  _$jscoverage['/touch.js'].lineData[9]++;
  var TimerAnim = require('anim/timer');
  _$jscoverage['/touch.js'].lineData[10]++;
  var OUT_OF_BOUND_FACTOR = 0.5;
  _$jscoverage['/touch.js'].lineData[11]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/touch.js'].lineData[12]++;
  var MAX_SWIPE_VELOCITY = 6;
  _$jscoverage['/touch.js'].lineData[14]++;
  function onDragScroll(self, e, scrollType) {
    _$jscoverage['/touch.js'].functionData[1]++;
    _$jscoverage['/touch.js'].lineData[15]++;
    if (visit1_15_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/touch.js'].lineData[16]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[18]++;
    var diff = visit2_18_1(scrollType === 'left') ? e.deltaX : e.deltaY, scroll = self.startScroll[scrollType] - diff, bound, minScroll = self.minScroll, maxScroll = self.maxScroll;
    _$jscoverage['/touch.js'].lineData[24]++;
    if (visit3_24_1(!self._bounce)) {
      _$jscoverage['/touch.js'].lineData[25]++;
      scroll = Math.min(Math.max(scroll, minScroll[scrollType]), maxScroll[scrollType]);
    }
    _$jscoverage['/touch.js'].lineData[28]++;
    if (visit4_28_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/touch.js'].lineData[29]++;
      bound = minScroll[scrollType] - scroll;
      _$jscoverage['/touch.js'].lineData[30]++;
      bound *= OUT_OF_BOUND_FACTOR;
      _$jscoverage['/touch.js'].lineData[31]++;
      scroll = minScroll[scrollType] - bound;
    } else {
      _$jscoverage['/touch.js'].lineData[32]++;
      if (visit5_32_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/touch.js'].lineData[33]++;
        bound = scroll - maxScroll[scrollType];
        _$jscoverage['/touch.js'].lineData[34]++;
        bound *= OUT_OF_BOUND_FACTOR;
        _$jscoverage['/touch.js'].lineData[35]++;
        scroll = maxScroll[scrollType] + bound;
      }
    }
    _$jscoverage['/touch.js'].lineData[38]++;
    self.set('scroll' + S.ucfirst(scrollType), scroll);
  }
  _$jscoverage['/touch.js'].lineData[41]++;
  function forbidDrag(self, scrollType) {
    _$jscoverage['/touch.js'].functionData[2]++;
    _$jscoverage['/touch.js'].lineData[42]++;
    var lockXY = visit6_42_1(scrollType === 'left') ? 'lockX' : 'lockY';
    _$jscoverage['/touch.js'].lineData[43]++;
    if (visit7_43_1(!self.allowScroll[scrollType] && self['_' + lockXY])) {
      _$jscoverage['/touch.js'].lineData[44]++;
      return 1;
    }
    _$jscoverage['/touch.js'].lineData[46]++;
    return 0;
  }
  _$jscoverage['/touch.js'].lineData[49]++;
  function onDragEndAxis(self, e, scrollType, endCallback) {
    _$jscoverage['/touch.js'].functionData[3]++;
    _$jscoverage['/touch.js'].lineData[50]++;
    if (visit8_50_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/touch.js'].lineData[51]++;
      endCallback();
      _$jscoverage['/touch.js'].lineData[52]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[54]++;
    var scrollAxis = 'scroll' + S.ucfirst(scrollType), scroll = self.get(scrollAxis), minScroll = self.minScroll, maxScroll = self.maxScroll, bound;
    _$jscoverage['/touch.js'].lineData[59]++;
    if (visit9_59_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/touch.js'].lineData[60]++;
      bound = minScroll[scrollType];
    } else {
      _$jscoverage['/touch.js'].lineData[61]++;
      if (visit10_61_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/touch.js'].lineData[62]++;
        bound = maxScroll[scrollType];
      }
    }
    _$jscoverage['/touch.js'].lineData[64]++;
    if (visit11_64_1(bound !== undefined)) {
      _$jscoverage['/touch.js'].lineData[65]++;
      var scrollCfg = {};
      _$jscoverage['/touch.js'].lineData[66]++;
      scrollCfg[scrollType] = bound;
      _$jscoverage['/touch.js'].lineData[67]++;
      self.scrollTo(scrollCfg, {
  duration: self.get('bounceDuration'), 
  easing: self.get('bounceEasing'), 
  queue: false, 
  complete: endCallback});
      _$jscoverage['/touch.js'].lineData[73]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[76]++;
    if (visit12_76_1(self.pagesOffset)) {
      _$jscoverage['/touch.js'].lineData[77]++;
      endCallback();
      _$jscoverage['/touch.js'].lineData[78]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[81]++;
    var velocity = visit13_81_1(scrollType === 'left') ? -e.velocityX : -e.velocityY;
    _$jscoverage['/touch.js'].lineData[83]++;
    velocity = Math.min(Math.max(velocity, -MAX_SWIPE_VELOCITY), MAX_SWIPE_VELOCITY);
    _$jscoverage['/touch.js'].lineData[85]++;
    var animCfg = {
  node: {}, 
  to: {}, 
  duration: 9999, 
  queue: false, 
  complete: endCallback, 
  frame: makeMomentumFx(self, velocity, scroll, scrollAxis, maxScroll[scrollType], minScroll[scrollType])};
    _$jscoverage['/touch.js'].lineData[96]++;
    animCfg.node[scrollType] = scroll;
    _$jscoverage['/touch.js'].lineData[97]++;
    animCfg.to[scrollType] = null;
    _$jscoverage['/touch.js'].lineData[99]++;
    self.scrollAnims.push(new TimerAnim(animCfg).run());
  }
  _$jscoverage['/touch.js'].lineData[102]++;
  var FRICTION = 0.5;
  _$jscoverage['/touch.js'].lineData[103]++;
  var ACCELERATION = 20;
  _$jscoverage['/touch.js'].lineData[104]++;
  var THETA = Math.log(1 - (FRICTION / 10));
  _$jscoverage['/touch.js'].lineData[105]++;
  var ALPHA = THETA / ACCELERATION;
  _$jscoverage['/touch.js'].lineData[106]++;
  var SPRING_TENSION = 0.3;
  _$jscoverage['/touch.js'].lineData[108]++;
  function makeMomentumFx(self, startVelocity, startScroll, scrollAxis, maxScroll, minScroll) {
    _$jscoverage['/touch.js'].functionData[4]++;
    _$jscoverage['/touch.js'].lineData[110]++;
    var velocity = startVelocity * ACCELERATION;
    _$jscoverage['/touch.js'].lineData[111]++;
    var inertia = 1;
    _$jscoverage['/touch.js'].lineData[112]++;
    var bounceStartTime = 0;
    _$jscoverage['/touch.js'].lineData[113]++;
    return function(anim, fx) {
  _$jscoverage['/touch.js'].functionData[5]++;
  _$jscoverage['/touch.js'].lineData[114]++;
  var now = S.now(), deltaTime, value;
  _$jscoverage['/touch.js'].lineData[117]++;
  if (visit14_117_1(inertia)) {
    _$jscoverage['/touch.js'].lineData[118]++;
    deltaTime = now - anim.startTime;
    _$jscoverage['/touch.js'].lineData[122]++;
    var frictionFactor = Math.exp(deltaTime * ALPHA);
    _$jscoverage['/touch.js'].lineData[124]++;
    value = parseInt(startScroll + velocity * (1 - frictionFactor) / (-THETA), 10);
    _$jscoverage['/touch.js'].lineData[125]++;
    if (visit15_125_1(visit16_125_2(value > minScroll) && visit17_125_3(value < maxScroll))) {
      _$jscoverage['/touch.js'].lineData[127]++;
      if (visit18_127_1(fx.lastValue === value)) {
        _$jscoverage['/touch.js'].lineData[128]++;
        fx.pos = 1;
        _$jscoverage['/touch.js'].lineData[129]++;
        return;
      }
      _$jscoverage['/touch.js'].lineData[131]++;
      fx.lastValue = value;
      _$jscoverage['/touch.js'].lineData[132]++;
      self.set(scrollAxis, value);
      _$jscoverage['/touch.js'].lineData[133]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[135]++;
    inertia = 0;
    _$jscoverage['/touch.js'].lineData[136]++;
    velocity = velocity * frictionFactor;
    _$jscoverage['/touch.js'].lineData[142]++;
    startScroll = visit19_142_1(value <= minScroll) ? minScroll : maxScroll;
    _$jscoverage['/touch.js'].lineData[144]++;
    bounceStartTime = now;
  } else {
    _$jscoverage['/touch.js'].lineData[146]++;
    deltaTime = now - bounceStartTime;
    _$jscoverage['/touch.js'].lineData[148]++;
    var theta = (deltaTime / ACCELERATION), powTime = theta * Math.exp(-SPRING_TENSION * theta);
    _$jscoverage['/touch.js'].lineData[152]++;
    value = parseInt(velocity * powTime, 10);
    _$jscoverage['/touch.js'].lineData[153]++;
    if (visit20_153_1(value === 0)) {
      _$jscoverage['/touch.js'].lineData[154]++;
      fx.pos = 1;
    }
    _$jscoverage['/touch.js'].lineData[156]++;
    self.set(scrollAxis, startScroll + value);
  }
};
  }
  _$jscoverage['/touch.js'].lineData[161]++;
  function onDragStartHandler(e) {
    _$jscoverage['/touch.js'].functionData[6]++;
    _$jscoverage['/touch.js'].lineData[162]++;
    var self = this;
    _$jscoverage['/touch.js'].lineData[164]++;
    if (visit21_164_1(visit22_164_2(e.gestureType !== 'touch') || (visit23_164_3(self.isScrolling && self.pagesOffset)))) {
      _$jscoverage['/touch.js'].lineData[165]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[167]++;
    self.startScroll = {};
    _$jscoverage['/touch.js'].lineData[168]++;
    self.dragInitDirection = null;
    _$jscoverage['/touch.js'].lineData[169]++;
    self.isScrolling = 1;
    _$jscoverage['/touch.js'].lineData[170]++;
    self.startScroll.left = self.get('scrollLeft');
    _$jscoverage['/touch.js'].lineData[171]++;
    self.startScroll.top = self.get('scrollTop');
  }
  _$jscoverage['/touch.js'].lineData[174]++;
  var onDragHandler = function(e) {
  _$jscoverage['/touch.js'].functionData[7]++;
  _$jscoverage['/touch.js'].lineData[175]++;
  var self = this;
  _$jscoverage['/touch.js'].lineData[177]++;
  if (visit24_177_1(visit25_177_2(e.gestureType !== 'touch') || !self.isScrolling)) {
    _$jscoverage['/touch.js'].lineData[178]++;
    return;
  }
  _$jscoverage['/touch.js'].lineData[181]++;
  var xDiff = Math.abs(e.deltaX);
  _$jscoverage['/touch.js'].lineData[182]++;
  var yDiff = Math.abs(e.deltaY);
  _$jscoverage['/touch.js'].lineData[184]++;
  var lockX = self._lockX, lockY = self._lockY;
  _$jscoverage['/touch.js'].lineData[188]++;
  if (visit26_188_1(lockX || lockY)) {
    _$jscoverage['/touch.js'].lineData[189]++;
    var dragInitDirection;
    _$jscoverage['/touch.js'].lineData[191]++;
    if (visit27_191_1(!(dragInitDirection = self.dragInitDirection))) {
      _$jscoverage['/touch.js'].lineData[192]++;
      self.dragInitDirection = dragInitDirection = visit28_192_1(xDiff > yDiff) ? 'left' : 'top';
    }
    _$jscoverage['/touch.js'].lineData[195]++;
    if (visit29_195_1(lockX && visit30_195_2(visit31_195_3(dragInitDirection === 'left') && !self.allowScroll[dragInitDirection]))) {
      _$jscoverage['/touch.js'].lineData[196]++;
      self.isScrolling = 0;
      _$jscoverage['/touch.js'].lineData[197]++;
      if (visit32_197_1(self._preventDefaultX)) {
        _$jscoverage['/touch.js'].lineData[198]++;
        e.preventDefault();
      }
      _$jscoverage['/touch.js'].lineData[200]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[203]++;
    if (visit33_203_1(lockY && visit34_203_2(visit35_203_3(dragInitDirection === 'top') && !self.allowScroll[dragInitDirection]))) {
      _$jscoverage['/touch.js'].lineData[204]++;
      self.isScrolling = 0;
      _$jscoverage['/touch.js'].lineData[205]++;
      if (visit36_205_1(self._preventDefaultY)) {
        _$jscoverage['/touch.js'].lineData[206]++;
        e.preventDefault();
      }
      _$jscoverage['/touch.js'].lineData[208]++;
      return;
    }
  }
  _$jscoverage['/touch.js'].lineData[212]++;
  e.preventDefault();
  _$jscoverage['/touch.js'].lineData[214]++;
  onDragScroll(self, e, 'left');
  _$jscoverage['/touch.js'].lineData[215]++;
  onDragScroll(self, e, 'top');
};
  _$jscoverage['/touch.js'].lineData[218]++;
  function onDragEndHandler(e) {
    _$jscoverage['/touch.js'].functionData[8]++;
    _$jscoverage['/touch.js'].lineData[219]++;
    var self = this;
    _$jscoverage['/touch.js'].lineData[220]++;
    if (visit37_220_1(visit38_220_2(e.gestureType !== 'touch') || !self.isScrolling)) {
      _$jscoverage['/touch.js'].lineData[221]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[223]++;
    self.fire('touchEnd', {
  pageX: e.pageX, 
  deltaX: e.deltaX, 
  deltaY: e.deltaY, 
  pageY: e.pageY, 
  velocityX: e.velocityX, 
  velocityY: e.velocityY});
  }
  _$jscoverage['/touch.js'].lineData[233]++;
  function defaultTouchEndHandler(e) {
    _$jscoverage['/touch.js'].functionData[9]++;
    _$jscoverage['/touch.js'].lineData[234]++;
    var self = this;
    _$jscoverage['/touch.js'].lineData[235]++;
    var count = 0;
    _$jscoverage['/touch.js'].lineData[236]++;
    var offsetX = -e.deltaX;
    _$jscoverage['/touch.js'].lineData[237]++;
    var offsetY = -e.deltaY;
    _$jscoverage['/touch.js'].lineData[238]++;
    var snapThreshold = self._snapThresholdCfg;
    _$jscoverage['/touch.js'].lineData[239]++;
    var allowX = visit39_239_1(self.allowScroll.left && visit40_239_2(Math.abs(offsetX) > snapThreshold));
    _$jscoverage['/touch.js'].lineData[240]++;
    var allowY = visit41_240_1(self.allowScroll.top && visit42_240_2(Math.abs(offsetY) > snapThreshold));
    _$jscoverage['/touch.js'].lineData[242]++;
    function endCallback() {
      _$jscoverage['/touch.js'].functionData[10]++;
      _$jscoverage['/touch.js'].lineData[243]++;
      count++;
      _$jscoverage['/touch.js'].lineData[244]++;
      if (visit43_244_1(count === 2)) {
        _$jscoverage['/touch.js'].lineData[245]++;
        var scrollEnd = function() {
  _$jscoverage['/touch.js'].functionData[11]++;
  _$jscoverage['/touch.js'].lineData[246]++;
  self.isScrolling = 0;
  _$jscoverage['/touch.js'].lineData[247]++;
  self.fire('scrollTouchEnd', {
  pageX: e.pageX, 
  pageY: e.pageY, 
  deltaX: -offsetX, 
  deltaY: -offsetY, 
  fromPageIndex: pageIndex, 
  pageIndex: self.get('pageIndex')});
};
        _$jscoverage['/touch.js'].lineData[257]++;
        if (visit44_257_1(!self.pagesOffset)) {
          _$jscoverage['/touch.js'].lineData[258]++;
          scrollEnd();
          _$jscoverage['/touch.js'].lineData[259]++;
          return;
        }
        _$jscoverage['/touch.js'].lineData[262]++;
        var snapDuration = self._snapDurationCfg;
        _$jscoverage['/touch.js'].lineData[263]++;
        var snapEasing = self._snapEasingCfg;
        _$jscoverage['/touch.js'].lineData[264]++;
        var pageIndex = self.get('pageIndex');
        _$jscoverage['/touch.js'].lineData[265]++;
        var scrollLeft = self.get('scrollLeft');
        _$jscoverage['/touch.js'].lineData[266]++;
        var scrollTop = self.get('scrollTop');
        _$jscoverage['/touch.js'].lineData[268]++;
        var animCfg = {
  duration: snapDuration, 
  easing: snapEasing, 
  complete: scrollEnd};
        _$jscoverage['/touch.js'].lineData[274]++;
        var pagesOffset = self.pagesOffset;
        _$jscoverage['/touch.js'].lineData[275]++;
        var pagesOffsetLen = pagesOffset.length;
        _$jscoverage['/touch.js'].lineData[277]++;
        self.isScrolling = 0;
        _$jscoverage['/touch.js'].lineData[279]++;
        if (visit45_279_1(allowX || allowY)) {
          _$jscoverage['/touch.js'].lineData[280]++;
          if (visit46_280_1(allowX && allowY)) {
            _$jscoverage['/touch.js'].lineData[281]++;
            var prepareX = [], i, newPageIndex;
            _$jscoverage['/touch.js'].lineData[284]++;
            var nowXY = {
  left: scrollLeft, 
  top: scrollTop};
            _$jscoverage['/touch.js'].lineData[288]++;
            for (i = 0; visit47_288_1(i < pagesOffsetLen); i++) {
              _$jscoverage['/touch.js'].lineData[289]++;
              var offset = pagesOffset[i];
              _$jscoverage['/touch.js'].lineData[290]++;
              if (visit48_290_1(offset)) {
                _$jscoverage['/touch.js'].lineData[291]++;
                if (visit49_291_1(visit50_291_2(offsetX > 0) && visit51_291_3(offset.left > nowXY.left))) {
                  _$jscoverage['/touch.js'].lineData[292]++;
                  prepareX.push(offset);
                } else {
                  _$jscoverage['/touch.js'].lineData[293]++;
                  if (visit52_293_1(visit53_293_2(offsetX < 0) && visit54_293_3(offset.left < nowXY.left))) {
                    _$jscoverage['/touch.js'].lineData[294]++;
                    prepareX.push(offset);
                  }
                }
              }
            }
            _$jscoverage['/touch.js'].lineData[298]++;
            var min;
            _$jscoverage['/touch.js'].lineData[299]++;
            var prepareXLen = prepareX.length;
            _$jscoverage['/touch.js'].lineData[300]++;
            var x;
            _$jscoverage['/touch.js'].lineData[301]++;
            if (visit55_301_1(offsetY > 0)) {
              _$jscoverage['/touch.js'].lineData[302]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/touch.js'].lineData[303]++;
              for (i = 0; visit56_303_1(i < prepareXLen); i++) {
                _$jscoverage['/touch.js'].lineData[304]++;
                x = prepareX[i];
                _$jscoverage['/touch.js'].lineData[305]++;
                if (visit57_305_1(x.top > nowXY.top)) {
                  _$jscoverage['/touch.js'].lineData[306]++;
                  if (visit58_306_1(min < x.top - nowXY.top)) {
                    _$jscoverage['/touch.js'].lineData[307]++;
                    min = x.top - nowXY.top;
                    _$jscoverage['/touch.js'].lineData[308]++;
                    newPageIndex = prepareX.index;
                  }
                }
              }
            } else {
              _$jscoverage['/touch.js'].lineData[313]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/touch.js'].lineData[314]++;
              for (i = 0; visit59_314_1(i < prepareXLen); i++) {
                _$jscoverage['/touch.js'].lineData[315]++;
                x = prepareX[i];
                _$jscoverage['/touch.js'].lineData[316]++;
                if (visit60_316_1(x.top < nowXY.top)) {
                  _$jscoverage['/touch.js'].lineData[317]++;
                  if (visit61_317_1(min < nowXY.top - x.top)) {
                    _$jscoverage['/touch.js'].lineData[318]++;
                    min = nowXY.top - x.top;
                    _$jscoverage['/touch.js'].lineData[319]++;
                    newPageIndex = prepareX.index;
                  }
                }
              }
            }
            _$jscoverage['/touch.js'].lineData[324]++;
            if (visit62_324_1(newPageIndex !== undefined)) {
              _$jscoverage['/touch.js'].lineData[325]++;
              if (visit63_325_1(newPageIndex !== pageIndex)) {
                _$jscoverage['/touch.js'].lineData[326]++;
                self.scrollToPage(newPageIndex, animCfg);
              } else {
                _$jscoverage['/touch.js'].lineData[328]++;
                self.scrollToPage(newPageIndex);
                _$jscoverage['/touch.js'].lineData[329]++;
                scrollEnd();
              }
            } else {
              _$jscoverage['/touch.js'].lineData[332]++;
              scrollEnd();
            }
          } else {
            _$jscoverage['/touch.js'].lineData[335]++;
            if (visit64_335_1(allowX || allowY)) {
              _$jscoverage['/touch.js'].lineData[336]++;
              var toPageIndex = self.getPageIndexFromXY(allowX ? scrollLeft : scrollTop, allowX, allowX ? offsetX : offsetY);
              _$jscoverage['/touch.js'].lineData[339]++;
              self.scrollToPage(toPageIndex, animCfg);
            } else {
              _$jscoverage['/touch.js'].lineData[341]++;
              self.scrollToPage(pageIndex);
              _$jscoverage['/touch.js'].lineData[342]++;
              scrollEnd();
            }
          }
        }
      }
    }
    _$jscoverage['/touch.js'].lineData[349]++;
    onDragEndAxis(self, e, 'left', endCallback);
    _$jscoverage['/touch.js'].lineData[350]++;
    onDragEndAxis(self, e, 'top', endCallback);
  }
  _$jscoverage['/touch.js'].lineData[353]++;
  function onGestureStart(e) {
    _$jscoverage['/touch.js'].functionData[12]++;
    _$jscoverage['/touch.js'].lineData[354]++;
    var self = this;
    _$jscoverage['/touch.js'].lineData[355]++;
    if (visit65_355_1(e.gestureType === 'touch')) {
      _$jscoverage['/touch.js'].lineData[356]++;
      e.preventDefault();
    }
    _$jscoverage['/touch.js'].lineData[359]++;
    if (visit66_359_1(self.isScrolling && self.pagesOffset)) {
      _$jscoverage['/touch.js'].lineData[360]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[362]++;
    if (visit67_362_1(self.isScrolling)) {
      _$jscoverage['/touch.js'].lineData[363]++;
      self.stopAnimation();
      _$jscoverage['/touch.js'].lineData[364]++;
      self.fire('scrollTouchEnd', {
  pageX: e.pageX, 
  pageY: e.pageY});
    }
  }
  _$jscoverage['/touch.js'].lineData[377]++;
  return ScrollViewBase.extend({
  initializer: function() {
  _$jscoverage['/touch.js'].functionData[13]++;
  _$jscoverage['/touch.js'].lineData[379]++;
  var self = this;
  _$jscoverage['/touch.js'].lineData[380]++;
  self._preventDefaultY = self.get('preventDefaultY');
  _$jscoverage['/touch.js'].lineData[381]++;
  self._preventDefaultX = self.get('preventDefaultX');
  _$jscoverage['/touch.js'].lineData[382]++;
  self._lockX = self.get('lockX');
  _$jscoverage['/touch.js'].lineData[383]++;
  self._lockY = self.get('lockY');
  _$jscoverage['/touch.js'].lineData[384]++;
  self._bounce = self.get('bounce');
  _$jscoverage['/touch.js'].lineData[385]++;
  self._snapThresholdCfg = self.get('snapThreshold');
  _$jscoverage['/touch.js'].lineData[386]++;
  self._snapDurationCfg = self.get('snapDuration');
  _$jscoverage['/touch.js'].lineData[387]++;
  self._snapEasingCfg = self.get('snapEasing');
  _$jscoverage['/touch.js'].lineData[388]++;
  self.publish('touchEnd', {
  defaultFn: defaultTouchEndHandler, 
  defaultTargetOnly: true});
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/touch.js'].functionData[14]++;
  _$jscoverage['/touch.js'].lineData[396]++;
  var action = v ? 'detach' : 'on';
  _$jscoverage['/touch.js'].lineData[397]++;
  var self = this;
  _$jscoverage['/touch.js'].lineData[401]++;
  self.$contentEl[action]('gestureDragStart', onDragStartHandler, self)[action](Gesture.start, onGestureStart, self)[action]('gestureDrag', onDragHandler, self)[action]('gestureDragEnd', onDragEndHandler, self);
}, 
  destructor: function() {
  _$jscoverage['/touch.js'].functionData[15]++;
  _$jscoverage['/touch.js'].lineData[405]++;
  this.stopAnimation();
}, 
  stopAnimation: function() {
  _$jscoverage['/touch.js'].functionData[16]++;
  _$jscoverage['/touch.js'].lineData[409]++;
  this.callSuper();
  _$jscoverage['/touch.js'].lineData[410]++;
  this.isScrolling = 0;
}}, {
  ATTRS: {
  lockX: {
  value: true}, 
  preventDefaultX: {
  value: true}, 
  lockY: {
  value: false}, 
  preventDefaultY: {
  value: false}, 
  snapDuration: {
  value: 0.3}, 
  snapEasing: {
  value: 'easeOut'}, 
  snapThreshold: {
  value: 5}, 
  bounce: {
  value: true}, 
  bounceDuration: {
  value: 0.4}, 
  bounceEasing: {
  value: 'easeOut'}}});
});
