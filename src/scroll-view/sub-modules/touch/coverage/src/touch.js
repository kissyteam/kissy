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
  _$jscoverage['/touch.js'].lineData[163] = 0;
  _$jscoverage['/touch.js'].lineData[164] = 0;
  _$jscoverage['/touch.js'].lineData[166] = 0;
  _$jscoverage['/touch.js'].lineData[168] = 0;
  _$jscoverage['/touch.js'].lineData[169] = 0;
  _$jscoverage['/touch.js'].lineData[171] = 0;
  _$jscoverage['/touch.js'].lineData[172] = 0;
  _$jscoverage['/touch.js'].lineData[173] = 0;
  _$jscoverage['/touch.js'].lineData[174] = 0;
  _$jscoverage['/touch.js'].lineData[175] = 0;
  _$jscoverage['/touch.js'].lineData[178] = 0;
  _$jscoverage['/touch.js'].lineData[181] = 0;
  _$jscoverage['/touch.js'].lineData[182] = 0;
  _$jscoverage['/touch.js'].lineData[184] = 0;
  _$jscoverage['/touch.js'].lineData[185] = 0;
  _$jscoverage['/touch.js'].lineData[188] = 0;
  _$jscoverage['/touch.js'].lineData[189] = 0;
  _$jscoverage['/touch.js'].lineData[191] = 0;
  _$jscoverage['/touch.js'].lineData[195] = 0;
  _$jscoverage['/touch.js'].lineData[196] = 0;
  _$jscoverage['/touch.js'].lineData[198] = 0;
  _$jscoverage['/touch.js'].lineData[199] = 0;
  _$jscoverage['/touch.js'].lineData[202] = 0;
  _$jscoverage['/touch.js'].lineData[203] = 0;
  _$jscoverage['/touch.js'].lineData[204] = 0;
  _$jscoverage['/touch.js'].lineData[205] = 0;
  _$jscoverage['/touch.js'].lineData[207] = 0;
  _$jscoverage['/touch.js'].lineData[210] = 0;
  _$jscoverage['/touch.js'].lineData[211] = 0;
  _$jscoverage['/touch.js'].lineData[212] = 0;
  _$jscoverage['/touch.js'].lineData[213] = 0;
  _$jscoverage['/touch.js'].lineData[215] = 0;
  _$jscoverage['/touch.js'].lineData[219] = 0;
  _$jscoverage['/touch.js'].lineData[221] = 0;
  _$jscoverage['/touch.js'].lineData[222] = 0;
  _$jscoverage['/touch.js'].lineData[225] = 0;
  _$jscoverage['/touch.js'].lineData[226] = 0;
  _$jscoverage['/touch.js'].lineData[228] = 0;
  _$jscoverage['/touch.js'].lineData[229] = 0;
  _$jscoverage['/touch.js'].lineData[230] = 0;
  _$jscoverage['/touch.js'].lineData[232] = 0;
  _$jscoverage['/touch.js'].lineData[242] = 0;
  _$jscoverage['/touch.js'].lineData[243] = 0;
  _$jscoverage['/touch.js'].lineData[244] = 0;
  _$jscoverage['/touch.js'].lineData[245] = 0;
  _$jscoverage['/touch.js'].lineData[246] = 0;
  _$jscoverage['/touch.js'].lineData[247] = 0;
  _$jscoverage['/touch.js'].lineData[248] = 0;
  _$jscoverage['/touch.js'].lineData[249] = 0;
  _$jscoverage['/touch.js'].lineData[251] = 0;
  _$jscoverage['/touch.js'].lineData[252] = 0;
  _$jscoverage['/touch.js'].lineData[253] = 0;
  _$jscoverage['/touch.js'].lineData[254] = 0;
  _$jscoverage['/touch.js'].lineData[255] = 0;
  _$jscoverage['/touch.js'].lineData[256] = 0;
  _$jscoverage['/touch.js'].lineData[266] = 0;
  _$jscoverage['/touch.js'].lineData[267] = 0;
  _$jscoverage['/touch.js'].lineData[268] = 0;
  _$jscoverage['/touch.js'].lineData[271] = 0;
  _$jscoverage['/touch.js'].lineData[272] = 0;
  _$jscoverage['/touch.js'].lineData[273] = 0;
  _$jscoverage['/touch.js'].lineData[274] = 0;
  _$jscoverage['/touch.js'].lineData[275] = 0;
  _$jscoverage['/touch.js'].lineData[277] = 0;
  _$jscoverage['/touch.js'].lineData[283] = 0;
  _$jscoverage['/touch.js'].lineData[284] = 0;
  _$jscoverage['/touch.js'].lineData[286] = 0;
  _$jscoverage['/touch.js'].lineData[288] = 0;
  _$jscoverage['/touch.js'].lineData[289] = 0;
  _$jscoverage['/touch.js'].lineData[290] = 0;
  _$jscoverage['/touch.js'].lineData[293] = 0;
  _$jscoverage['/touch.js'].lineData[297] = 0;
  _$jscoverage['/touch.js'].lineData[298] = 0;
  _$jscoverage['/touch.js'].lineData[299] = 0;
  _$jscoverage['/touch.js'].lineData[300] = 0;
  _$jscoverage['/touch.js'].lineData[301] = 0;
  _$jscoverage['/touch.js'].lineData[302] = 0;
  _$jscoverage['/touch.js'].lineData[303] = 0;
  _$jscoverage['/touch.js'].lineData[307] = 0;
  _$jscoverage['/touch.js'].lineData[308] = 0;
  _$jscoverage['/touch.js'].lineData[309] = 0;
  _$jscoverage['/touch.js'].lineData[310] = 0;
  _$jscoverage['/touch.js'].lineData[311] = 0;
  _$jscoverage['/touch.js'].lineData[312] = 0;
  _$jscoverage['/touch.js'].lineData[313] = 0;
  _$jscoverage['/touch.js'].lineData[314] = 0;
  _$jscoverage['/touch.js'].lineData[315] = 0;
  _$jscoverage['/touch.js'].lineData[316] = 0;
  _$jscoverage['/touch.js'].lineData[317] = 0;
  _$jscoverage['/touch.js'].lineData[322] = 0;
  _$jscoverage['/touch.js'].lineData[323] = 0;
  _$jscoverage['/touch.js'].lineData[324] = 0;
  _$jscoverage['/touch.js'].lineData[325] = 0;
  _$jscoverage['/touch.js'].lineData[326] = 0;
  _$jscoverage['/touch.js'].lineData[327] = 0;
  _$jscoverage['/touch.js'].lineData[328] = 0;
  _$jscoverage['/touch.js'].lineData[333] = 0;
  _$jscoverage['/touch.js'].lineData[334] = 0;
  _$jscoverage['/touch.js'].lineData[335] = 0;
  _$jscoverage['/touch.js'].lineData[337] = 0;
  _$jscoverage['/touch.js'].lineData[338] = 0;
  _$jscoverage['/touch.js'].lineData[341] = 0;
  _$jscoverage['/touch.js'].lineData[344] = 0;
  _$jscoverage['/touch.js'].lineData[345] = 0;
  _$jscoverage['/touch.js'].lineData[348] = 0;
  _$jscoverage['/touch.js'].lineData[350] = 0;
  _$jscoverage['/touch.js'].lineData[351] = 0;
  _$jscoverage['/touch.js'].lineData[358] = 0;
  _$jscoverage['/touch.js'].lineData[359] = 0;
  _$jscoverage['/touch.js'].lineData[362] = 0;
  _$jscoverage['/touch.js'].lineData[363] = 0;
  _$jscoverage['/touch.js'].lineData[364] = 0;
  _$jscoverage['/touch.js'].lineData[365] = 0;
  _$jscoverage['/touch.js'].lineData[367] = 0;
  _$jscoverage['/touch.js'].lineData[369] = 0;
  _$jscoverage['/touch.js'].lineData[370] = 0;
  _$jscoverage['/touch.js'].lineData[372] = 0;
  _$jscoverage['/touch.js'].lineData[373] = 0;
  _$jscoverage['/touch.js'].lineData[374] = 0;
  _$jscoverage['/touch.js'].lineData[387] = 0;
  _$jscoverage['/touch.js'].lineData[389] = 0;
  _$jscoverage['/touch.js'].lineData[390] = 0;
  _$jscoverage['/touch.js'].lineData[391] = 0;
  _$jscoverage['/touch.js'].lineData[392] = 0;
  _$jscoverage['/touch.js'].lineData[393] = 0;
  _$jscoverage['/touch.js'].lineData[394] = 0;
  _$jscoverage['/touch.js'].lineData[395] = 0;
  _$jscoverage['/touch.js'].lineData[396] = 0;
  _$jscoverage['/touch.js'].lineData[397] = 0;
  _$jscoverage['/touch.js'].lineData[398] = 0;
  _$jscoverage['/touch.js'].lineData[406] = 0;
  _$jscoverage['/touch.js'].lineData[407] = 0;
  _$jscoverage['/touch.js'].lineData[408] = 0;
  _$jscoverage['/touch.js'].lineData[412] = 0;
  _$jscoverage['/touch.js'].lineData[416] = 0;
  _$jscoverage['/touch.js'].lineData[417] = 0;
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
  _$jscoverage['/touch.js'].branchData['163'] = [];
  _$jscoverage['/touch.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['168'] = [];
  _$jscoverage['/touch.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['168'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['184'] = [];
  _$jscoverage['/touch.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['195'] = [];
  _$jscoverage['/touch.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['198'] = [];
  _$jscoverage['/touch.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['199'] = [];
  _$jscoverage['/touch.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['202'] = [];
  _$jscoverage['/touch.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['202'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['202'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['204'] = [];
  _$jscoverage['/touch.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['210'] = [];
  _$jscoverage['/touch.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['210'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['210'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['212'] = [];
  _$jscoverage['/touch.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['229'] = [];
  _$jscoverage['/touch.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['248'] = [];
  _$jscoverage['/touch.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['248'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['249'] = [];
  _$jscoverage['/touch.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['249'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['253'] = [];
  _$jscoverage['/touch.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['266'] = [];
  _$jscoverage['/touch.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['288'] = [];
  _$jscoverage['/touch.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['289'] = [];
  _$jscoverage['/touch.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['297'] = [];
  _$jscoverage['/touch.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['299'] = [];
  _$jscoverage['/touch.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['300'] = [];
  _$jscoverage['/touch.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['300'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['300'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['302'] = [];
  _$jscoverage['/touch.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['302'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['310'] = [];
  _$jscoverage['/touch.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['312'] = [];
  _$jscoverage['/touch.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['314'] = [];
  _$jscoverage['/touch.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['315'] = [];
  _$jscoverage['/touch.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['323'] = [];
  _$jscoverage['/touch.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['325'] = [];
  _$jscoverage['/touch.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['326'] = [];
  _$jscoverage['/touch.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['333'] = [];
  _$jscoverage['/touch.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['334'] = [];
  _$jscoverage['/touch.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['344'] = [];
  _$jscoverage['/touch.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['364'] = [];
  _$jscoverage['/touch.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['369'] = [];
  _$jscoverage['/touch.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['369'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['372'] = [];
  _$jscoverage['/touch.js'].branchData['372'][1] = new BranchData();
}
_$jscoverage['/touch.js'].branchData['372'][1].init(293, 16, 'self.isScrolling');
function visit66_372_1(result) {
  _$jscoverage['/touch.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['369'][2].init(207, 36, 'self.isScrolling && self.pagesOffset');
function visit65_369_2(result) {
  _$jscoverage['/touch.js'].branchData['369'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['369'][1].init(182, 62, 'self.get(\'disabled\') || (self.isScrolling && self.pagesOffset)');
function visit64_369_1(result) {
  _$jscoverage['/touch.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['364'][1].init(40, 10, '!e.isTouch');
function visit63_364_1(result) {
  _$jscoverage['/touch.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['344'][1].init(30, 16, 'allowX || allowY');
function visit62_344_1(result) {
  _$jscoverage['/touch.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['334'][1].init(34, 26, 'newPageIndex !== pageIndex');
function visit61_334_1(result) {
  _$jscoverage['/touch.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['333'][1].init(2157, 26, 'newPageIndex !== undefined');
function visit60_333_1(result) {
  _$jscoverage['/touch.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['326'][1].init(42, 23, 'min < nowXY.top - x.top');
function visit59_326_1(result) {
  _$jscoverage['/touch.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['325'][1].init(88, 17, 'x.top < nowXY.top');
function visit58_325_1(result) {
  _$jscoverage['/touch.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['323'][1].init(95, 15, 'i < prepareXLen');
function visit57_323_1(result) {
  _$jscoverage['/touch.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['315'][1].init(42, 23, 'min < x.top - nowXY.top');
function visit56_315_1(result) {
  _$jscoverage['/touch.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['314'][1].init(88, 17, 'x.top > nowXY.top');
function visit55_314_1(result) {
  _$jscoverage['/touch.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['312'][1].init(95, 15, 'i < prepareXLen');
function visit54_312_1(result) {
  _$jscoverage['/touch.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['310'][1].init(978, 11, 'offsetY > 0');
function visit53_310_1(result) {
  _$jscoverage['/touch.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['302'][3].init(201, 24, 'offset.left < nowXY.left');
function visit52_302_3(result) {
  _$jscoverage['/touch.js'].branchData['302'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['302'][2].init(186, 11, 'offsetX < 0');
function visit51_302_2(result) {
  _$jscoverage['/touch.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['302'][1].init(186, 39, 'offsetX < 0 && offset.left < nowXY.left');
function visit50_302_1(result) {
  _$jscoverage['/touch.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['300'][3].init(53, 24, 'offset.left > nowXY.left');
function visit49_300_3(result) {
  _$jscoverage['/touch.js'].branchData['300'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['300'][2].init(38, 11, 'offsetX > 0');
function visit48_300_2(result) {
  _$jscoverage['/touch.js'].branchData['300'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['300'][1].init(38, 39, 'offsetX > 0 && offset.left > nowXY.left');
function visit47_300_1(result) {
  _$jscoverage['/touch.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['299'][1].init(92, 6, 'offset');
function visit46_299_1(result) {
  _$jscoverage['/touch.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['297'][1].init(315, 18, 'i < pagesOffsetLen');
function visit45_297_1(result) {
  _$jscoverage['/touch.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['289'][1].init(26, 16, 'allowX && allowY');
function visit44_289_1(result) {
  _$jscoverage['/touch.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['288'][1].init(1235, 16, 'allowX || allowY');
function visit43_288_1(result) {
  _$jscoverage['/touch.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['266'][1].init(487, 17, '!self.pagesOffset');
function visit42_266_1(result) {
  _$jscoverage['/touch.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['253'][1].init(40, 11, 'count === 2');
function visit41_253_1(result) {
  _$jscoverage['/touch.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['249'][2].init(300, 33, 'Math.abs(offsetY) > snapThreshold');
function visit40_249_2(result) {
  _$jscoverage['/touch.js'].branchData['249'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['249'][1].init(276, 57, 'self.allowScroll.top && Math.abs(offsetY) > snapThreshold');
function visit39_249_1(result) {
  _$jscoverage['/touch.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['248'][2].init(219, 33, 'Math.abs(offsetX) > snapThreshold');
function visit38_248_2(result) {
  _$jscoverage['/touch.js'].branchData['248'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['248'][1].init(194, 58, 'self.allowScroll.left && Math.abs(offsetX) > snapThreshold');
function visit37_248_1(result) {
  _$jscoverage['/touch.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['229'][1].init(158, 17, '!self.isScrolling');
function visit36_229_1(result) {
  _$jscoverage['/touch.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['212'][1].init(61, 21, 'self._preventDefaultY');
function visit35_212_1(result) {
  _$jscoverage['/touch.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['210'][3].init(527, 27, 'dragInitDirection === \'top\'');
function visit34_210_3(result) {
  _$jscoverage['/touch.js'].branchData['210'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['210'][2].init(527, 67, 'dragInitDirection === \'top\' && !self.allowScroll[dragInitDirection]');
function visit33_210_2(result) {
  _$jscoverage['/touch.js'].branchData['210'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['210'][1].init(518, 76, 'lockY && dragInitDirection === \'top\' && !self.allowScroll[dragInitDirection]');
function visit32_210_1(result) {
  _$jscoverage['/touch.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['204'][1].init(61, 21, 'self._preventDefaultX');
function visit31_204_1(result) {
  _$jscoverage['/touch.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['202'][3].init(242, 28, 'dragInitDirection === \'left\'');
function visit30_202_3(result) {
  _$jscoverage['/touch.js'].branchData['202'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['202'][2].init(242, 68, 'dragInitDirection === \'left\' && !self.allowScroll[dragInitDirection]');
function visit29_202_2(result) {
  _$jscoverage['/touch.js'].branchData['202'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['202'][1].init(233, 77, 'lockX && dragInitDirection === \'left\' && !self.allowScroll[dragInitDirection]');
function visit28_202_1(result) {
  _$jscoverage['/touch.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['199'][1].init(63, 13, 'xDiff > yDiff');
function visit27_199_1(result) {
  _$jscoverage['/touch.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['198'][1].init(56, 45, '!(dragInitDirection = self.dragInitDirection)');
function visit26_198_1(result) {
  _$jscoverage['/touch.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['195'][1].init(346, 14, 'lockX || lockY');
function visit25_195_1(result) {
  _$jscoverage['/touch.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['184'][1].init(42, 17, '!self.isScrolling');
function visit24_184_1(result) {
  _$jscoverage['/touch.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['168'][2].init(240, 36, 'self.isScrolling && self.pagesOffset');
function visit23_168_2(result) {
  _$jscoverage['/touch.js'].branchData['168'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['168'][1].init(215, 62, 'self.get(\'disabled\') || (self.isScrolling && self.pagesOffset)');
function visit22_168_1(result) {
  _$jscoverage['/touch.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['163'][1].init(76, 10, '!e.isTouch');
function visit21_163_1(result) {
  _$jscoverage['/touch.js'].branchData['163'][1].ranCondition(result);
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
  var Anim = require('anim');
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
    self.scrollAnims.push(new Anim(animCfg).run());
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
    _$jscoverage['/touch.js'].lineData[163]++;
    if (visit21_163_1(!e.isTouch)) {
      _$jscoverage['/touch.js'].lineData[164]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[166]++;
    var self = this;
    _$jscoverage['/touch.js'].lineData[168]++;
    if (visit22_168_1(self.get('disabled') || (visit23_168_2(self.isScrolling && self.pagesOffset)))) {
      _$jscoverage['/touch.js'].lineData[169]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[171]++;
    self.startScroll = {};
    _$jscoverage['/touch.js'].lineData[172]++;
    self.dragInitDirection = null;
    _$jscoverage['/touch.js'].lineData[173]++;
    self.isScrolling = 1;
    _$jscoverage['/touch.js'].lineData[174]++;
    self.startScroll.left = self.get('scrollLeft');
    _$jscoverage['/touch.js'].lineData[175]++;
    self.startScroll.top = self.get('scrollTop');
    _$jscoverage['/touch.js'].lineData[178]++;
    self.$contentEl.on('drag', onDragHandler, self).on('dragEnd', onDragEndHandler, self);
  }
  _$jscoverage['/touch.js'].lineData[181]++;
  var onDragHandler = function(e) {
  _$jscoverage['/touch.js'].functionData[7]++;
  _$jscoverage['/touch.js'].lineData[182]++;
  var self = this;
  _$jscoverage['/touch.js'].lineData[184]++;
  if (visit24_184_1(!self.isScrolling)) {
    _$jscoverage['/touch.js'].lineData[185]++;
    return;
  }
  _$jscoverage['/touch.js'].lineData[188]++;
  var xDiff = Math.abs(e.deltaX);
  _$jscoverage['/touch.js'].lineData[189]++;
  var yDiff = Math.abs(e.deltaY);
  _$jscoverage['/touch.js'].lineData[191]++;
  var lockX = self._lockX, lockY = self._lockY;
  _$jscoverage['/touch.js'].lineData[195]++;
  if (visit25_195_1(lockX || lockY)) {
    _$jscoverage['/touch.js'].lineData[196]++;
    var dragInitDirection;
    _$jscoverage['/touch.js'].lineData[198]++;
    if (visit26_198_1(!(dragInitDirection = self.dragInitDirection))) {
      _$jscoverage['/touch.js'].lineData[199]++;
      self.dragInitDirection = dragInitDirection = visit27_199_1(xDiff > yDiff) ? 'left' : 'top';
    }
    _$jscoverage['/touch.js'].lineData[202]++;
    if (visit28_202_1(lockX && visit29_202_2(visit30_202_3(dragInitDirection === 'left') && !self.allowScroll[dragInitDirection]))) {
      _$jscoverage['/touch.js'].lineData[203]++;
      self.isScrolling = 0;
      _$jscoverage['/touch.js'].lineData[204]++;
      if (visit31_204_1(self._preventDefaultX)) {
        _$jscoverage['/touch.js'].lineData[205]++;
        e.preventDefault();
      }
      _$jscoverage['/touch.js'].lineData[207]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[210]++;
    if (visit32_210_1(lockY && visit33_210_2(visit34_210_3(dragInitDirection === 'top') && !self.allowScroll[dragInitDirection]))) {
      _$jscoverage['/touch.js'].lineData[211]++;
      self.isScrolling = 0;
      _$jscoverage['/touch.js'].lineData[212]++;
      if (visit35_212_1(self._preventDefaultY)) {
        _$jscoverage['/touch.js'].lineData[213]++;
        e.preventDefault();
      }
      _$jscoverage['/touch.js'].lineData[215]++;
      return;
    }
  }
  _$jscoverage['/touch.js'].lineData[219]++;
  e.preventDefault();
  _$jscoverage['/touch.js'].lineData[221]++;
  onDragScroll(self, e, 'left');
  _$jscoverage['/touch.js'].lineData[222]++;
  onDragScroll(self, e, 'top');
};
  _$jscoverage['/touch.js'].lineData[225]++;
  function onDragEndHandler(e) {
    _$jscoverage['/touch.js'].functionData[8]++;
    _$jscoverage['/touch.js'].lineData[226]++;
    var self = this;
    _$jscoverage['/touch.js'].lineData[228]++;
    self.$contentEl.detach('drag', onDragHandler, self).detach('dragEnd', onDragEndHandler, self);
    _$jscoverage['/touch.js'].lineData[229]++;
    if (visit36_229_1(!self.isScrolling)) {
      _$jscoverage['/touch.js'].lineData[230]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[232]++;
    self.fire('touchEnd', {
  pageX: e.pageX, 
  deltaX: e.deltaX, 
  deltaY: e.deltaY, 
  pageY: e.pageY, 
  velocityX: e.velocityX, 
  velocityY: e.velocityY});
  }
  _$jscoverage['/touch.js'].lineData[242]++;
  function defaultTouchEndHandler(e) {
    _$jscoverage['/touch.js'].functionData[9]++;
    _$jscoverage['/touch.js'].lineData[243]++;
    var self = this;
    _$jscoverage['/touch.js'].lineData[244]++;
    var count = 0;
    _$jscoverage['/touch.js'].lineData[245]++;
    var offsetX = -e.deltaX;
    _$jscoverage['/touch.js'].lineData[246]++;
    var offsetY = -e.deltaY;
    _$jscoverage['/touch.js'].lineData[247]++;
    var snapThreshold = self._snapThresholdCfg;
    _$jscoverage['/touch.js'].lineData[248]++;
    var allowX = visit37_248_1(self.allowScroll.left && visit38_248_2(Math.abs(offsetX) > snapThreshold));
    _$jscoverage['/touch.js'].lineData[249]++;
    var allowY = visit39_249_1(self.allowScroll.top && visit40_249_2(Math.abs(offsetY) > snapThreshold));
    _$jscoverage['/touch.js'].lineData[251]++;
    function endCallback() {
      _$jscoverage['/touch.js'].functionData[10]++;
      _$jscoverage['/touch.js'].lineData[252]++;
      count++;
      _$jscoverage['/touch.js'].lineData[253]++;
      if (visit41_253_1(count === 2)) {
        _$jscoverage['/touch.js'].lineData[254]++;
        var scrollEnd = function() {
  _$jscoverage['/touch.js'].functionData[11]++;
  _$jscoverage['/touch.js'].lineData[255]++;
  self.isScrolling = 0;
  _$jscoverage['/touch.js'].lineData[256]++;
  self.fire('scrollTouchEnd', {
  pageX: e.pageX, 
  pageY: e.pageY, 
  deltaX: -offsetX, 
  deltaY: -offsetY, 
  fromPageIndex: pageIndex, 
  pageIndex: self.get('pageIndex')});
};
        _$jscoverage['/touch.js'].lineData[266]++;
        if (visit42_266_1(!self.pagesOffset)) {
          _$jscoverage['/touch.js'].lineData[267]++;
          scrollEnd();
          _$jscoverage['/touch.js'].lineData[268]++;
          return;
        }
        _$jscoverage['/touch.js'].lineData[271]++;
        var snapDuration = self._snapDurationCfg;
        _$jscoverage['/touch.js'].lineData[272]++;
        var snapEasing = self._snapEasingCfg;
        _$jscoverage['/touch.js'].lineData[273]++;
        var pageIndex = self.get('pageIndex');
        _$jscoverage['/touch.js'].lineData[274]++;
        var scrollLeft = self.get('scrollLeft');
        _$jscoverage['/touch.js'].lineData[275]++;
        var scrollTop = self.get('scrollTop');
        _$jscoverage['/touch.js'].lineData[277]++;
        var animCfg = {
  duration: snapDuration, 
  easing: snapEasing, 
  complete: scrollEnd};
        _$jscoverage['/touch.js'].lineData[283]++;
        var pagesOffset = self.pagesOffset;
        _$jscoverage['/touch.js'].lineData[284]++;
        var pagesOffsetLen = pagesOffset.length;
        _$jscoverage['/touch.js'].lineData[286]++;
        self.isScrolling = 0;
        _$jscoverage['/touch.js'].lineData[288]++;
        if (visit43_288_1(allowX || allowY)) {
          _$jscoverage['/touch.js'].lineData[289]++;
          if (visit44_289_1(allowX && allowY)) {
            _$jscoverage['/touch.js'].lineData[290]++;
            var prepareX = [], i, newPageIndex;
            _$jscoverage['/touch.js'].lineData[293]++;
            var nowXY = {
  left: scrollLeft, 
  top: scrollTop};
            _$jscoverage['/touch.js'].lineData[297]++;
            for (i = 0; visit45_297_1(i < pagesOffsetLen); i++) {
              _$jscoverage['/touch.js'].lineData[298]++;
              var offset = pagesOffset[i];
              _$jscoverage['/touch.js'].lineData[299]++;
              if (visit46_299_1(offset)) {
                _$jscoverage['/touch.js'].lineData[300]++;
                if (visit47_300_1(visit48_300_2(offsetX > 0) && visit49_300_3(offset.left > nowXY.left))) {
                  _$jscoverage['/touch.js'].lineData[301]++;
                  prepareX.push(offset);
                } else {
                  _$jscoverage['/touch.js'].lineData[302]++;
                  if (visit50_302_1(visit51_302_2(offsetX < 0) && visit52_302_3(offset.left < nowXY.left))) {
                    _$jscoverage['/touch.js'].lineData[303]++;
                    prepareX.push(offset);
                  }
                }
              }
            }
            _$jscoverage['/touch.js'].lineData[307]++;
            var min;
            _$jscoverage['/touch.js'].lineData[308]++;
            var prepareXLen = prepareX.length;
            _$jscoverage['/touch.js'].lineData[309]++;
            var x;
            _$jscoverage['/touch.js'].lineData[310]++;
            if (visit53_310_1(offsetY > 0)) {
              _$jscoverage['/touch.js'].lineData[311]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/touch.js'].lineData[312]++;
              for (i = 0; visit54_312_1(i < prepareXLen); i++) {
                _$jscoverage['/touch.js'].lineData[313]++;
                x = prepareX[i];
                _$jscoverage['/touch.js'].lineData[314]++;
                if (visit55_314_1(x.top > nowXY.top)) {
                  _$jscoverage['/touch.js'].lineData[315]++;
                  if (visit56_315_1(min < x.top - nowXY.top)) {
                    _$jscoverage['/touch.js'].lineData[316]++;
                    min = x.top - nowXY.top;
                    _$jscoverage['/touch.js'].lineData[317]++;
                    newPageIndex = prepareX.index;
                  }
                }
              }
            } else {
              _$jscoverage['/touch.js'].lineData[322]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/touch.js'].lineData[323]++;
              for (i = 0; visit57_323_1(i < prepareXLen); i++) {
                _$jscoverage['/touch.js'].lineData[324]++;
                x = prepareX[i];
                _$jscoverage['/touch.js'].lineData[325]++;
                if (visit58_325_1(x.top < nowXY.top)) {
                  _$jscoverage['/touch.js'].lineData[326]++;
                  if (visit59_326_1(min < nowXY.top - x.top)) {
                    _$jscoverage['/touch.js'].lineData[327]++;
                    min = nowXY.top - x.top;
                    _$jscoverage['/touch.js'].lineData[328]++;
                    newPageIndex = prepareX.index;
                  }
                }
              }
            }
            _$jscoverage['/touch.js'].lineData[333]++;
            if (visit60_333_1(newPageIndex !== undefined)) {
              _$jscoverage['/touch.js'].lineData[334]++;
              if (visit61_334_1(newPageIndex !== pageIndex)) {
                _$jscoverage['/touch.js'].lineData[335]++;
                self.scrollToPage(newPageIndex, animCfg);
              } else {
                _$jscoverage['/touch.js'].lineData[337]++;
                self.scrollToPage(newPageIndex);
                _$jscoverage['/touch.js'].lineData[338]++;
                scrollEnd();
              }
            } else {
              _$jscoverage['/touch.js'].lineData[341]++;
              scrollEnd();
            }
          } else {
            _$jscoverage['/touch.js'].lineData[344]++;
            if (visit62_344_1(allowX || allowY)) {
              _$jscoverage['/touch.js'].lineData[345]++;
              var toPageIndex = self.getPageIndexFromXY(allowX ? scrollLeft : scrollTop, allowX, allowX ? offsetX : offsetY);
              _$jscoverage['/touch.js'].lineData[348]++;
              self.scrollToPage(toPageIndex, animCfg);
            } else {
              _$jscoverage['/touch.js'].lineData[350]++;
              self.scrollToPage(pageIndex);
              _$jscoverage['/touch.js'].lineData[351]++;
              scrollEnd();
            }
          }
        }
      }
    }
    _$jscoverage['/touch.js'].lineData[358]++;
    onDragEndAxis(self, e, 'left', endCallback);
    _$jscoverage['/touch.js'].lineData[359]++;
    onDragEndAxis(self, e, 'top', endCallback);
  }
  _$jscoverage['/touch.js'].lineData[362]++;
  function onGestureStart(e) {
    _$jscoverage['/touch.js'].functionData[12]++;
    _$jscoverage['/touch.js'].lineData[363]++;
    var self = this;
    _$jscoverage['/touch.js'].lineData[364]++;
    if (visit63_364_1(!e.isTouch)) {
      _$jscoverage['/touch.js'].lineData[365]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[367]++;
    e.preventDefault();
    _$jscoverage['/touch.js'].lineData[369]++;
    if (visit64_369_1(self.get('disabled') || (visit65_369_2(self.isScrolling && self.pagesOffset)))) {
      _$jscoverage['/touch.js'].lineData[370]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[372]++;
    if (visit66_372_1(self.isScrolling)) {
      _$jscoverage['/touch.js'].lineData[373]++;
      self.stopAnimation();
      _$jscoverage['/touch.js'].lineData[374]++;
      self.fire('scrollTouchEnd', {
  pageX: e.pageX, 
  pageY: e.pageY});
    }
  }
  _$jscoverage['/touch.js'].lineData[387]++;
  return ScrollViewBase.extend({
  initializer: function() {
  _$jscoverage['/touch.js'].functionData[13]++;
  _$jscoverage['/touch.js'].lineData[389]++;
  var self = this;
  _$jscoverage['/touch.js'].lineData[390]++;
  self._preventDefaultY = self.get('preventDefaultY');
  _$jscoverage['/touch.js'].lineData[391]++;
  self._preventDefaultX = self.get('preventDefaultX');
  _$jscoverage['/touch.js'].lineData[392]++;
  self._lockX = self.get('lockX');
  _$jscoverage['/touch.js'].lineData[393]++;
  self._lockY = self.get('lockY');
  _$jscoverage['/touch.js'].lineData[394]++;
  self._bounce = self.get('bounce');
  _$jscoverage['/touch.js'].lineData[395]++;
  self._snapThresholdCfg = self.get('snapThreshold');
  _$jscoverage['/touch.js'].lineData[396]++;
  self._snapDurationCfg = self.get('snapDuration');
  _$jscoverage['/touch.js'].lineData[397]++;
  self._snapEasingCfg = self.get('snapEasing');
  _$jscoverage['/touch.js'].lineData[398]++;
  self.publish('touchEnd', {
  defaultFn: defaultTouchEndHandler, 
  defaultTargetOnly: true});
}, 
  bindUI: function() {
  _$jscoverage['/touch.js'].functionData[14]++;
  _$jscoverage['/touch.js'].lineData[406]++;
  var self = this;
  _$jscoverage['/touch.js'].lineData[407]++;
  self.$contentEl.on('dragStart', onDragStartHandler, self);
  _$jscoverage['/touch.js'].lineData[408]++;
  self.$contentEl.on(Gesture.start, onGestureStart, self);
}, 
  destructor: function() {
  _$jscoverage['/touch.js'].functionData[15]++;
  _$jscoverage['/touch.js'].lineData[412]++;
  this.stopAnimation();
}, 
  stopAnimation: function() {
  _$jscoverage['/touch.js'].functionData[16]++;
  _$jscoverage['/touch.js'].lineData[416]++;
  this.callSuper();
  _$jscoverage['/touch.js'].lineData[417]++;
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
