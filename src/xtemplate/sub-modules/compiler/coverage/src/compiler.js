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
if (! _$jscoverage['/compiler.js']) {
  _$jscoverage['/compiler.js'] = {};
  _$jscoverage['/compiler.js'].lineData = [];
  _$jscoverage['/compiler.js'].lineData[6] = 0;
  _$jscoverage['/compiler.js'].lineData[7] = 0;
  _$jscoverage['/compiler.js'].lineData[8] = 0;
  _$jscoverage['/compiler.js'].lineData[10] = 0;
  _$jscoverage['/compiler.js'].lineData[12] = 0;
  _$jscoverage['/compiler.js'].lineData[18] = 0;
  _$jscoverage['/compiler.js'].lineData[19] = 0;
  _$jscoverage['/compiler.js'].lineData[22] = 0;
  _$jscoverage['/compiler.js'].lineData[23] = 0;
  _$jscoverage['/compiler.js'].lineData[24] = 0;
  _$jscoverage['/compiler.js'].lineData[27] = 0;
  _$jscoverage['/compiler.js'].lineData[29] = 0;
  _$jscoverage['/compiler.js'].lineData[31] = 0;
  _$jscoverage['/compiler.js'].lineData[34] = 0;
  _$jscoverage['/compiler.js'].lineData[35] = 0;
  _$jscoverage['/compiler.js'].lineData[37] = 0;
  _$jscoverage['/compiler.js'].lineData[38] = 0;
  _$jscoverage['/compiler.js'].lineData[40] = 0;
  _$jscoverage['/compiler.js'].lineData[44] = 0;
  _$jscoverage['/compiler.js'].lineData[45] = 0;
  _$jscoverage['/compiler.js'].lineData[48] = 0;
  _$jscoverage['/compiler.js'].lineData[49] = 0;
  _$jscoverage['/compiler.js'].lineData[52] = 0;
  _$jscoverage['/compiler.js'].lineData[55] = 0;
  _$jscoverage['/compiler.js'].lineData[56] = 0;
  _$jscoverage['/compiler.js'].lineData[57] = 0;
  _$jscoverage['/compiler.js'].lineData[59] = 0;
  _$jscoverage['/compiler.js'].lineData[60] = 0;
  _$jscoverage['/compiler.js'].lineData[61] = 0;
  _$jscoverage['/compiler.js'].lineData[67] = 0;
  _$jscoverage['/compiler.js'].lineData[71] = 0;
  _$jscoverage['/compiler.js'].lineData[75] = 0;
  _$jscoverage['/compiler.js'].lineData[76] = 0;
  _$jscoverage['/compiler.js'].lineData[79] = 0;
  _$jscoverage['/compiler.js'].lineData[80] = 0;
  _$jscoverage['/compiler.js'].lineData[83] = 0;
  _$jscoverage['/compiler.js'].lineData[84] = 0;
  _$jscoverage['/compiler.js'].lineData[85] = 0;
  _$jscoverage['/compiler.js'].lineData[88] = 0;
  _$jscoverage['/compiler.js'].lineData[89] = 0;
  _$jscoverage['/compiler.js'].lineData[90] = 0;
  _$jscoverage['/compiler.js'].lineData[91] = 0;
  _$jscoverage['/compiler.js'].lineData[93] = 0;
  _$jscoverage['/compiler.js'].lineData[101] = 0;
  _$jscoverage['/compiler.js'].lineData[110] = 0;
  _$jscoverage['/compiler.js'].lineData[111] = 0;
  _$jscoverage['/compiler.js'].lineData[112] = 0;
  _$jscoverage['/compiler.js'].lineData[113] = 0;
  _$jscoverage['/compiler.js'].lineData[114] = 0;
  _$jscoverage['/compiler.js'].lineData[119] = 0;
  _$jscoverage['/compiler.js'].lineData[122] = 0;
  _$jscoverage['/compiler.js'].lineData[124] = 0;
  _$jscoverage['/compiler.js'].lineData[129] = 0;
  _$jscoverage['/compiler.js'].lineData[137] = 0;
  _$jscoverage['/compiler.js'].lineData[141] = 0;
  _$jscoverage['/compiler.js'].lineData[147] = 0;
  _$jscoverage['/compiler.js'].lineData[148] = 0;
  _$jscoverage['/compiler.js'].lineData[150] = 0;
  _$jscoverage['/compiler.js'].lineData[151] = 0;
  _$jscoverage['/compiler.js'].lineData[152] = 0;
  _$jscoverage['/compiler.js'].lineData[153] = 0;
  _$jscoverage['/compiler.js'].lineData[154] = 0;
  _$jscoverage['/compiler.js'].lineData[157] = 0;
  _$jscoverage['/compiler.js'].lineData[158] = 0;
  _$jscoverage['/compiler.js'].lineData[159] = 0;
  _$jscoverage['/compiler.js'].lineData[160] = 0;
  _$jscoverage['/compiler.js'].lineData[165] = 0;
  _$jscoverage['/compiler.js'].lineData[168] = 0;
  _$jscoverage['/compiler.js'].lineData[169] = 0;
  _$jscoverage['/compiler.js'].lineData[170] = 0;
  _$jscoverage['/compiler.js'].lineData[171] = 0;
  _$jscoverage['/compiler.js'].lineData[175] = 0;
  _$jscoverage['/compiler.js'].lineData[178] = 0;
  _$jscoverage['/compiler.js'].lineData[179] = 0;
  _$jscoverage['/compiler.js'].lineData[180] = 0;
  _$jscoverage['/compiler.js'].lineData[181] = 0;
  _$jscoverage['/compiler.js'].lineData[185] = 0;
  _$jscoverage['/compiler.js'].lineData[188] = 0;
  _$jscoverage['/compiler.js'].lineData[192] = 0;
  _$jscoverage['/compiler.js'].lineData[198] = 0;
  _$jscoverage['/compiler.js'].lineData[199] = 0;
  _$jscoverage['/compiler.js'].lineData[200] = 0;
  _$jscoverage['/compiler.js'].lineData[202] = 0;
  _$jscoverage['/compiler.js'].lineData[203] = 0;
  _$jscoverage['/compiler.js'].lineData[204] = 0;
  _$jscoverage['/compiler.js'].lineData[207] = 0;
  _$jscoverage['/compiler.js'].lineData[208] = 0;
  _$jscoverage['/compiler.js'].lineData[209] = 0;
  _$jscoverage['/compiler.js'].lineData[210] = 0;
  _$jscoverage['/compiler.js'].lineData[211] = 0;
  _$jscoverage['/compiler.js'].lineData[212] = 0;
  _$jscoverage['/compiler.js'].lineData[213] = 0;
  _$jscoverage['/compiler.js'].lineData[214] = 0;
  _$jscoverage['/compiler.js'].lineData[216] = 0;
  _$jscoverage['/compiler.js'].lineData[217] = 0;
  _$jscoverage['/compiler.js'].lineData[220] = 0;
  _$jscoverage['/compiler.js'].lineData[223] = 0;
  _$jscoverage['/compiler.js'].lineData[224] = 0;
  _$jscoverage['/compiler.js'].lineData[225] = 0;
  _$jscoverage['/compiler.js'].lineData[226] = 0;
  _$jscoverage['/compiler.js'].lineData[227] = 0;
  _$jscoverage['/compiler.js'].lineData[228] = 0;
  _$jscoverage['/compiler.js'].lineData[229] = 0;
  _$jscoverage['/compiler.js'].lineData[230] = 0;
  _$jscoverage['/compiler.js'].lineData[232] = 0;
  _$jscoverage['/compiler.js'].lineData[233] = 0;
  _$jscoverage['/compiler.js'].lineData[236] = 0;
  _$jscoverage['/compiler.js'].lineData[240] = 0;
  _$jscoverage['/compiler.js'].lineData[245] = 0;
  _$jscoverage['/compiler.js'].lineData[249] = 0;
  _$jscoverage['/compiler.js'].lineData[253] = 0;
  _$jscoverage['/compiler.js'].lineData[257] = 0;
  _$jscoverage['/compiler.js'].lineData[261] = 0;
  _$jscoverage['/compiler.js'].lineData[265] = 0;
  _$jscoverage['/compiler.js'].lineData[269] = 0;
  _$jscoverage['/compiler.js'].lineData[272] = 0;
  _$jscoverage['/compiler.js'].lineData[273] = 0;
  _$jscoverage['/compiler.js'].lineData[274] = 0;
  _$jscoverage['/compiler.js'].lineData[276] = 0;
  _$jscoverage['/compiler.js'].lineData[278] = 0;
  _$jscoverage['/compiler.js'].lineData[284] = 0;
  _$jscoverage['/compiler.js'].lineData[288] = 0;
  _$jscoverage['/compiler.js'].lineData[292] = 0;
  _$jscoverage['/compiler.js'].lineData[297] = 0;
  _$jscoverage['/compiler.js'].lineData[301] = 0;
  _$jscoverage['/compiler.js'].lineData[311] = 0;
  _$jscoverage['/compiler.js'].lineData[313] = 0;
  _$jscoverage['/compiler.js'].lineData[314] = 0;
  _$jscoverage['/compiler.js'].lineData[315] = 0;
  _$jscoverage['/compiler.js'].lineData[318] = 0;
  _$jscoverage['/compiler.js'].lineData[321] = 0;
  _$jscoverage['/compiler.js'].lineData[322] = 0;
  _$jscoverage['/compiler.js'].lineData[323] = 0;
  _$jscoverage['/compiler.js'].lineData[328] = 0;
  _$jscoverage['/compiler.js'].lineData[329] = 0;
  _$jscoverage['/compiler.js'].lineData[330] = 0;
  _$jscoverage['/compiler.js'].lineData[331] = 0;
  _$jscoverage['/compiler.js'].lineData[332] = 0;
  _$jscoverage['/compiler.js'].lineData[335] = 0;
  _$jscoverage['/compiler.js'].lineData[336] = 0;
  _$jscoverage['/compiler.js'].lineData[337] = 0;
  _$jscoverage['/compiler.js'].lineData[339] = 0;
  _$jscoverage['/compiler.js'].lineData[340] = 0;
  _$jscoverage['/compiler.js'].lineData[341] = 0;
  _$jscoverage['/compiler.js'].lineData[346] = 0;
  _$jscoverage['/compiler.js'].lineData[350] = 0;
  _$jscoverage['/compiler.js'].lineData[354] = 0;
  _$jscoverage['/compiler.js'].lineData[358] = 0;
  _$jscoverage['/compiler.js'].lineData[360] = 0;
  _$jscoverage['/compiler.js'].lineData[361] = 0;
  _$jscoverage['/compiler.js'].lineData[362] = 0;
  _$jscoverage['/compiler.js'].lineData[366] = 0;
  _$jscoverage['/compiler.js'].lineData[369] = 0;
  _$jscoverage['/compiler.js'].lineData[370] = 0;
  _$jscoverage['/compiler.js'].lineData[371] = 0;
  _$jscoverage['/compiler.js'].lineData[372] = 0;
  _$jscoverage['/compiler.js'].lineData[374] = 0;
  _$jscoverage['/compiler.js'].lineData[375] = 0;
  _$jscoverage['/compiler.js'].lineData[377] = 0;
  _$jscoverage['/compiler.js'].lineData[378] = 0;
  _$jscoverage['/compiler.js'].lineData[383] = 0;
  _$jscoverage['/compiler.js'].lineData[390] = 0;
  _$jscoverage['/compiler.js'].lineData[391] = 0;
  _$jscoverage['/compiler.js'].lineData[392] = 0;
  _$jscoverage['/compiler.js'].lineData[393] = 0;
  _$jscoverage['/compiler.js'].lineData[394] = 0;
  _$jscoverage['/compiler.js'].lineData[396] = 0;
  _$jscoverage['/compiler.js'].lineData[397] = 0;
  _$jscoverage['/compiler.js'].lineData[398] = 0;
  _$jscoverage['/compiler.js'].lineData[399] = 0;
  _$jscoverage['/compiler.js'].lineData[400] = 0;
  _$jscoverage['/compiler.js'].lineData[401] = 0;
  _$jscoverage['/compiler.js'].lineData[405] = 0;
  _$jscoverage['/compiler.js'].lineData[406] = 0;
  _$jscoverage['/compiler.js'].lineData[409] = 0;
  _$jscoverage['/compiler.js'].lineData[413] = 0;
  _$jscoverage['/compiler.js'].lineData[420] = 0;
  _$jscoverage['/compiler.js'].lineData[427] = 0;
  _$jscoverage['/compiler.js'].lineData[435] = 0;
  _$jscoverage['/compiler.js'].lineData[436] = 0;
  _$jscoverage['/compiler.js'].lineData[446] = 0;
  _$jscoverage['/compiler.js'].lineData[447] = 0;
  _$jscoverage['/compiler.js'].lineData[448] = 0;
  _$jscoverage['/compiler.js'].lineData[458] = 0;
  _$jscoverage['/compiler.js'].lineData[459] = 0;
  _$jscoverage['/compiler.js'].lineData[460] = 0;
  _$jscoverage['/compiler.js'].lineData[465] = 0;
  _$jscoverage['/compiler.js'].lineData[475] = 0;
}
if (! _$jscoverage['/compiler.js'].functionData) {
  _$jscoverage['/compiler.js'].functionData = [];
  _$jscoverage['/compiler.js'].functionData[0] = 0;
  _$jscoverage['/compiler.js'].functionData[1] = 0;
  _$jscoverage['/compiler.js'].functionData[2] = 0;
  _$jscoverage['/compiler.js'].functionData[3] = 0;
  _$jscoverage['/compiler.js'].functionData[4] = 0;
  _$jscoverage['/compiler.js'].functionData[5] = 0;
  _$jscoverage['/compiler.js'].functionData[6] = 0;
  _$jscoverage['/compiler.js'].functionData[7] = 0;
  _$jscoverage['/compiler.js'].functionData[8] = 0;
  _$jscoverage['/compiler.js'].functionData[9] = 0;
  _$jscoverage['/compiler.js'].functionData[10] = 0;
  _$jscoverage['/compiler.js'].functionData[11] = 0;
  _$jscoverage['/compiler.js'].functionData[12] = 0;
  _$jscoverage['/compiler.js'].functionData[13] = 0;
  _$jscoverage['/compiler.js'].functionData[14] = 0;
  _$jscoverage['/compiler.js'].functionData[15] = 0;
  _$jscoverage['/compiler.js'].functionData[16] = 0;
  _$jscoverage['/compiler.js'].functionData[17] = 0;
  _$jscoverage['/compiler.js'].functionData[18] = 0;
  _$jscoverage['/compiler.js'].functionData[19] = 0;
  _$jscoverage['/compiler.js'].functionData[20] = 0;
  _$jscoverage['/compiler.js'].functionData[21] = 0;
  _$jscoverage['/compiler.js'].functionData[22] = 0;
  _$jscoverage['/compiler.js'].functionData[23] = 0;
  _$jscoverage['/compiler.js'].functionData[24] = 0;
  _$jscoverage['/compiler.js'].functionData[25] = 0;
  _$jscoverage['/compiler.js'].functionData[26] = 0;
  _$jscoverage['/compiler.js'].functionData[27] = 0;
  _$jscoverage['/compiler.js'].functionData[28] = 0;
  _$jscoverage['/compiler.js'].functionData[29] = 0;
  _$jscoverage['/compiler.js'].functionData[30] = 0;
  _$jscoverage['/compiler.js'].functionData[31] = 0;
  _$jscoverage['/compiler.js'].functionData[32] = 0;
}
if (! _$jscoverage['/compiler.js'].branchData) {
  _$jscoverage['/compiler.js'].branchData = {};
  _$jscoverage['/compiler.js'].branchData['23'] = [];
  _$jscoverage['/compiler.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['37'] = [];
  _$jscoverage['/compiler.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['56'] = [];
  _$jscoverage['/compiler.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['60'] = [];
  _$jscoverage['/compiler.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['79'] = [];
  _$jscoverage['/compiler.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['83'] = [];
  _$jscoverage['/compiler.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['84'] = [];
  _$jscoverage['/compiler.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['89'] = [];
  _$jscoverage['/compiler.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['110'] = [];
  _$jscoverage['/compiler.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['111'] = [];
  _$jscoverage['/compiler.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['112'] = [];
  _$jscoverage['/compiler.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['122'] = [];
  _$jscoverage['/compiler.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['131'] = [];
  _$jscoverage['/compiler.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['134'] = [];
  _$jscoverage['/compiler.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['150'] = [];
  _$jscoverage['/compiler.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['157'] = [];
  _$jscoverage['/compiler.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['168'] = [];
  _$jscoverage['/compiler.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['178'] = [];
  _$jscoverage['/compiler.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['198'] = [];
  _$jscoverage['/compiler.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['202'] = [];
  _$jscoverage['/compiler.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['207'] = [];
  _$jscoverage['/compiler.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['212'] = [];
  _$jscoverage['/compiler.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['223'] = [];
  _$jscoverage['/compiler.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['228'] = [];
  _$jscoverage['/compiler.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['313'] = [];
  _$jscoverage['/compiler.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['321'] = [];
  _$jscoverage['/compiler.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['328'] = [];
  _$jscoverage['/compiler.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['335'] = [];
  _$jscoverage['/compiler.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['337'] = [];
  _$jscoverage['/compiler.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['339'] = [];
  _$jscoverage['/compiler.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['370'] = [];
  _$jscoverage['/compiler.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['390'] = [];
  _$jscoverage['/compiler.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['393'] = [];
  _$jscoverage['/compiler.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['396'] = [];
  _$jscoverage['/compiler.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['398'] = [];
  _$jscoverage['/compiler.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['459'] = [];
  _$jscoverage['/compiler.js'].branchData['459'][1] = new BranchData();
}
_$jscoverage['/compiler.js'].branchData['459'][1].init(68, 12, 'config || {}');
function visit78_459_1(result) {
  _$jscoverage['/compiler.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['398'][1].init(88, 17, 'nextIdNameCode[0]');
function visit77_398_1(result) {
  _$jscoverage['/compiler.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['396'][1].init(185, 10, 'idPartType');
function visit76_396_1(result) {
  _$jscoverage['/compiler.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['393'][1].init(100, 6, '!first');
function visit75_393_1(result) {
  _$jscoverage['/compiler.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['390'][1].init(218, 18, 'i < idParts.length');
function visit74_390_1(result) {
  _$jscoverage['/compiler.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['370'][1].init(186, 7, 'code[0]');
function visit73_370_1(result) {
  _$jscoverage['/compiler.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['339'][1].init(57, 28, 'typeof parts[i] !== \'string\'');
function visit72_339_1(result) {
  _$jscoverage['/compiler.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['337'][1].init(76, 16, 'i < parts.length');
function visit71_337_1(result) {
  _$jscoverage['/compiler.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['335'][1].init(1293, 32, '!tplNode.hash && !tplNode.params');
function visit70_335_1(result) {
  _$jscoverage['/compiler.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['328'][1].init(978, 18, 'tplNode.isInverted');
function visit69_328_1(result) {
  _$jscoverage['/compiler.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['321'][1].init(706, 19, 'programNode.inverse');
function visit68_321_1(result) {
  _$jscoverage['/compiler.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['313'][1].init(429, 11, '!configName');
function visit67_313_1(result) {
  _$jscoverage['/compiler.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['228'][1].init(91, 17, 'nextIdNameCode[0]');
function visit66_228_1(result) {
  _$jscoverage['/compiler.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['223'][1].init(1115, 4, 'hash');
function visit65_223_1(result) {
  _$jscoverage['/compiler.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['212'][1].init(99, 17, 'nextIdNameCode[0]');
function visit64_212_1(result) {
  _$jscoverage['/compiler.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['207'][1].init(271, 6, 'params');
function visit63_207_1(result) {
  _$jscoverage['/compiler.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['202'][1].init(100, 14, 'params || hash');
function visit62_202_1(result) {
  _$jscoverage['/compiler.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['198'][1].init(150, 7, 'tplNode');
function visit61_198_1(result) {
  _$jscoverage['/compiler.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['178'][1].init(1211, 15, '!name1 && name2');
function visit60_178_1(result) {
  _$jscoverage['/compiler.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['168'][1].init(878, 15, 'name1 && !name2');
function visit59_168_1(result) {
  _$jscoverage['/compiler.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['157'][1].init(483, 16, '!name1 && !name2');
function visit58_157_1(result) {
  _$jscoverage['/compiler.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['150'][1].init(252, 14, 'name1 && name2');
function visit57_150_1(result) {
  _$jscoverage['/compiler.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['134'][1].init(235, 26, 'tplNode && tplNode.escaped');
function visit56_134_1(result) {
  _$jscoverage['/compiler.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['131'][1].init(99, 18, 'configName || \'{}\'');
function visit55_131_1(result) {
  _$jscoverage['/compiler.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['122'][1].init(742, 22, 'idString === \'include\'');
function visit54_122_1(result) {
  _$jscoverage['/compiler.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['112'][1].init(94, 14, 'configNameCode');
function visit53_112_1(result) {
  _$jscoverage['/compiler.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['111'][1].init(38, 34, 'tplNode && self.genConfig(tplNode)');
function visit52_111_1(result) {
  _$jscoverage['/compiler.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['110'][1].init(293, 11, 'depth === 0');
function visit51_110_1(result) {
  _$jscoverage['/compiler.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['89'][1].init(1247, 7, '!global');
function visit50_89_1(result) {
  _$jscoverage['/compiler.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['84'][1].init(58, 7, 'i < len');
function visit49_84_1(result) {
  _$jscoverage['/compiler.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['83'][1].init(987, 10, 'statements');
function visit48_83_1(result) {
  _$jscoverage['/compiler.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['79'][1].init(629, 7, 'natives');
function visit47_79_1(result) {
  _$jscoverage['/compiler.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['60'][1].init(204, 6, 'global');
function visit46_60_1(result) {
  _$jscoverage['/compiler.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['56'][1].init(46, 7, '!global');
function visit45_56_1(result) {
  _$jscoverage['/compiler.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['37'][1].init(87, 12, 'm.length % 2');
function visit44_37_1(result) {
  _$jscoverage['/compiler.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['23'][1].init(13, 6, 'isCode');
function visit43_23_1(result) {
  _$jscoverage['/compiler.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/compiler.js'].functionData[0]++;
  _$jscoverage['/compiler.js'].lineData[7]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/compiler.js'].lineData[8]++;
  var parser = require('./compiler/parser');
  _$jscoverage['/compiler.js'].lineData[10]++;
  parser.yy = require('./compiler/ast');
  _$jscoverage['/compiler.js'].lineData[12]++;
  var doubleReg = /\\*"/g, singleReg = /\\*'/g, arrayPush = [].push, variableId = 0, xtemplateId = 0;
  _$jscoverage['/compiler.js'].lineData[18]++;
  function guid(str) {
    _$jscoverage['/compiler.js'].functionData[1]++;
    _$jscoverage['/compiler.js'].lineData[19]++;
    return str + (variableId++);
  }
  _$jscoverage['/compiler.js'].lineData[22]++;
  function escapeString(str, isCode) {
    _$jscoverage['/compiler.js'].functionData[2]++;
    _$jscoverage['/compiler.js'].lineData[23]++;
    if (visit43_23_1(isCode)) {
      _$jscoverage['/compiler.js'].lineData[24]++;
      str = escapeSingleQuoteInCodeString(str, false);
    } else {
      _$jscoverage['/compiler.js'].lineData[27]++;
      str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    _$jscoverage['/compiler.js'].lineData[29]++;
    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    _$jscoverage['/compiler.js'].lineData[31]++;
    return str;
  }
  _$jscoverage['/compiler.js'].lineData[34]++;
  function escapeSingleQuoteInCodeString(str, isDouble) {
    _$jscoverage['/compiler.js'].functionData[3]++;
    _$jscoverage['/compiler.js'].lineData[35]++;
    return str.replace(isDouble ? doubleReg : singleReg, function(m) {
  _$jscoverage['/compiler.js'].functionData[4]++;
  _$jscoverage['/compiler.js'].lineData[37]++;
  if (visit44_37_1(m.length % 2)) {
    _$jscoverage['/compiler.js'].lineData[38]++;
    m = '\\' + m;
  }
  _$jscoverage['/compiler.js'].lineData[40]++;
  return m;
});
  }
  _$jscoverage['/compiler.js'].lineData[44]++;
  function pushToArray(to, from) {
    _$jscoverage['/compiler.js'].functionData[5]++;
    _$jscoverage['/compiler.js'].lineData[45]++;
    arrayPush.apply(to, from);
  }
  _$jscoverage['/compiler.js'].lineData[48]++;
  function lastOfArray(arr) {
    _$jscoverage['/compiler.js'].functionData[6]++;
    _$jscoverage['/compiler.js'].lineData[49]++;
    return arr[arr.length - 1];
  }
  _$jscoverage['/compiler.js'].lineData[52]++;
  var gen = {
  genFunction: function(statements, global) {
  _$jscoverage['/compiler.js'].functionData[7]++;
  _$jscoverage['/compiler.js'].lineData[55]++;
  var source = [];
  _$jscoverage['/compiler.js'].lineData[56]++;
  if (visit45_56_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[57]++;
    source.push('function(scope) {');
  }
  _$jscoverage['/compiler.js'].lineData[59]++;
  source.push('var buffer = ""' + (global ? ',' : ';'));
  _$jscoverage['/compiler.js'].lineData[60]++;
  if (visit46_60_1(global)) {
    _$jscoverage['/compiler.js'].lineData[61]++;
    source.push('config = this.config,' + 'engine = this,' + 'moduleWrap, ' + 'utils = config.utils;');
    _$jscoverage['/compiler.js'].lineData[67]++;
    source.push('if (typeof module !== "undefined" && module.kissy) {' + 'moduleWrap = module;' + '}');
    _$jscoverage['/compiler.js'].lineData[71]++;
    var natives = '', c, utils = XTemplateRuntime.utils;
    _$jscoverage['/compiler.js'].lineData[75]++;
    for (c in utils) {
      _$jscoverage['/compiler.js'].lineData[76]++;
      natives += c + 'Util = utils.' + c + ',';
    }
    _$jscoverage['/compiler.js'].lineData[79]++;
    if (visit47_79_1(natives)) {
      _$jscoverage['/compiler.js'].lineData[80]++;
      source.push('var ' + natives.slice(0, natives.length - 1) + ';');
    }
  }
  _$jscoverage['/compiler.js'].lineData[83]++;
  if (visit48_83_1(statements)) {
    _$jscoverage['/compiler.js'].lineData[84]++;
    for (var i = 0, len = statements.length; visit49_84_1(i < len); i++) {
      _$jscoverage['/compiler.js'].lineData[85]++;
      pushToArray(source, this[statements[i].type](statements[i]));
    }
  }
  _$jscoverage['/compiler.js'].lineData[88]++;
  source.push('return buffer;');
  _$jscoverage['/compiler.js'].lineData[89]++;
  if (visit50_89_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[90]++;
    source.push('}');
    _$jscoverage['/compiler.js'].lineData[91]++;
    return source;
  } else {
    _$jscoverage['/compiler.js'].lineData[93]++;
    return {
  params: ['scope', 'S', 'undefined'], 
  source: source};
  }
}, 
  genId: function(idNode, tplNode, preserveUndefined) {
  _$jscoverage['/compiler.js'].functionData[8]++;
  _$jscoverage['/compiler.js'].lineData[101]++;
  var source = [], depth = idNode.depth, configName, idParts = idNode.parts, idName = guid('id'), self = this;
  _$jscoverage['/compiler.js'].lineData[110]++;
  if (visit51_110_1(depth === 0)) {
    _$jscoverage['/compiler.js'].lineData[111]++;
    var configNameCode = visit52_111_1(tplNode && self.genConfig(tplNode));
    _$jscoverage['/compiler.js'].lineData[112]++;
    if (visit53_112_1(configNameCode)) {
      _$jscoverage['/compiler.js'].lineData[113]++;
      configName = configNameCode[0];
      _$jscoverage['/compiler.js'].lineData[114]++;
      pushToArray(source, configNameCode[1]);
    }
  }
  _$jscoverage['/compiler.js'].lineData[119]++;
  var idString = self.getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[122]++;
  if (visit54_122_1(idString === 'include')) {
    _$jscoverage['/compiler.js'].lineData[124]++;
    source.push('if(moduleWrap) {re' + 'quire("' + tplNode.params[0].value + '");' + configName + '.params[0]=moduleWrap.resolveByName(' + configName + '.params[0]);' + '}');
  }
  _$jscoverage['/compiler.js'].lineData[129]++;
  source.push('var ' + idName + ' = getPropertyOrRunCommandUtil(engine,scope,' + (visit55_131_1(configName || '{}')) + ',"' + idString + '",' + depth + ',' + idNode.lineNumber + ',' + (visit56_134_1(tplNode && tplNode.escaped)) + ',' + preserveUndefined + ');');
  _$jscoverage['/compiler.js'].lineData[137]++;
  return [idName, source];
}, 
  genOpExpression: function(e, type) {
  _$jscoverage['/compiler.js'].functionData[9]++;
  _$jscoverage['/compiler.js'].lineData[141]++;
  var source = [], name1, name2, code1 = this[e.op1.type](e.op1), code2 = this[e.op2.type](e.op2);
  _$jscoverage['/compiler.js'].lineData[147]++;
  name1 = code1[0];
  _$jscoverage['/compiler.js'].lineData[148]++;
  name2 = code2[0];
  _$jscoverage['/compiler.js'].lineData[150]++;
  if (visit57_150_1(name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[151]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[152]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[153]++;
    source.push(name1 + type + name2);
    _$jscoverage['/compiler.js'].lineData[154]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[157]++;
  if (visit58_157_1(!name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[158]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[159]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[160]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[165]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[168]++;
  if (visit59_168_1(name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[169]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[170]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[171]++;
    source.push(name1 + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[175]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[178]++;
  if (visit60_178_1(!name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[179]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[180]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[181]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + name2);
    _$jscoverage['/compiler.js'].lineData[185]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[188]++;
  return undefined;
}, 
  genConfig: function(tplNode) {
  _$jscoverage['/compiler.js'].functionData[10]++;
  _$jscoverage['/compiler.js'].lineData[192]++;
  var source = [], configName, params, hash, self = this;
  _$jscoverage['/compiler.js'].lineData[198]++;
  if (visit61_198_1(tplNode)) {
    _$jscoverage['/compiler.js'].lineData[199]++;
    params = tplNode.params;
    _$jscoverage['/compiler.js'].lineData[200]++;
    hash = tplNode.hash;
    _$jscoverage['/compiler.js'].lineData[202]++;
    if (visit62_202_1(params || hash)) {
      _$jscoverage['/compiler.js'].lineData[203]++;
      configName = guid('config');
      _$jscoverage['/compiler.js'].lineData[204]++;
      source.push('var ' + configName + ' = {};');
    }
    _$jscoverage['/compiler.js'].lineData[207]++;
    if (visit63_207_1(params)) {
      _$jscoverage['/compiler.js'].lineData[208]++;
      var paramsName = guid('params');
      _$jscoverage['/compiler.js'].lineData[209]++;
      source.push('var ' + paramsName + ' = [];');
      _$jscoverage['/compiler.js'].lineData[210]++;
      S.each(params, function(param) {
  _$jscoverage['/compiler.js'].functionData[11]++;
  _$jscoverage['/compiler.js'].lineData[211]++;
  var nextIdNameCode = self[param.type](param);
  _$jscoverage['/compiler.js'].lineData[212]++;
  if (visit64_212_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[213]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[214]++;
    source.push(paramsName + '.push(' + nextIdNameCode[0] + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[216]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[217]++;
    source.push(paramsName + '.push(' + lastOfArray(nextIdNameCode[1]) + ');');
  }
});
      _$jscoverage['/compiler.js'].lineData[220]++;
      source.push(configName + '.params=' + paramsName + ';');
    }
    _$jscoverage['/compiler.js'].lineData[223]++;
    if (visit65_223_1(hash)) {
      _$jscoverage['/compiler.js'].lineData[224]++;
      var hashName = guid('hash');
      _$jscoverage['/compiler.js'].lineData[225]++;
      source.push('var ' + hashName + ' = {};');
      _$jscoverage['/compiler.js'].lineData[226]++;
      S.each(hash.value, function(v, key) {
  _$jscoverage['/compiler.js'].functionData[12]++;
  _$jscoverage['/compiler.js'].lineData[227]++;
  var nextIdNameCode = self[v.type](v);
  _$jscoverage['/compiler.js'].lineData[228]++;
  if (visit66_228_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[229]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[230]++;
    source.push(hashName + '["' + key + '"] = ' + nextIdNameCode[0] + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[232]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[233]++;
    source.push(hashName + '["' + key + '"] = ' + lastOfArray(nextIdNameCode[1]) + ';');
  }
});
      _$jscoverage['/compiler.js'].lineData[236]++;
      source.push(configName + '.hash=' + hashName + ';');
    }
  }
  _$jscoverage['/compiler.js'].lineData[240]++;
  return [configName, source];
}, 
  conditionalOrExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[13]++;
  _$jscoverage['/compiler.js'].lineData[245]++;
  return this.genOpExpression(e, '||');
}, 
  conditionalAndExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[14]++;
  _$jscoverage['/compiler.js'].lineData[249]++;
  return this.genOpExpression(e, '&&');
}, 
  relationalExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[15]++;
  _$jscoverage['/compiler.js'].lineData[253]++;
  return this.genOpExpression(e, e.opType);
}, 
  equalityExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[16]++;
  _$jscoverage['/compiler.js'].lineData[257]++;
  return this.genOpExpression(e, e.opType);
}, 
  additiveExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[17]++;
  _$jscoverage['/compiler.js'].lineData[261]++;
  return this.genOpExpression(e, e.opType);
}, 
  multiplicativeExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[18]++;
  _$jscoverage['/compiler.js'].lineData[265]++;
  return this.genOpExpression(e, e.opType);
}, 
  unaryExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[19]++;
  _$jscoverage['/compiler.js'].lineData[269]++;
  var source = [], name, code = this[e.value.type](e.value);
  _$jscoverage['/compiler.js'].lineData[272]++;
  arrayPush.apply(source, code[1]);
  _$jscoverage['/compiler.js'].lineData[273]++;
  if ((name = code[0])) {
    _$jscoverage['/compiler.js'].lineData[274]++;
    source.push(name + '=!' + name + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[276]++;
    source[source.length - 1] = '!' + lastOfArray(source);
  }
  _$jscoverage['/compiler.js'].lineData[278]++;
  return [name, source];
}, 
  'string': function(e) {
  _$jscoverage['/compiler.js'].functionData[20]++;
  _$jscoverage['/compiler.js'].lineData[284]++;
  return ['', ["'" + escapeString(e.value, true) + "'"]];
}, 
  'number': function(e) {
  _$jscoverage['/compiler.js'].functionData[21]++;
  _$jscoverage['/compiler.js'].lineData[288]++;
  return ['', [e.value]];
}, 
  'boolean': function(e) {
  _$jscoverage['/compiler.js'].functionData[22]++;
  _$jscoverage['/compiler.js'].lineData[292]++;
  return ['', [e.value]];
}, 
  'id': function(e, topLevel) {
  _$jscoverage['/compiler.js'].functionData[23]++;
  _$jscoverage['/compiler.js'].lineData[297]++;
  return this.genId(e, undefined, !topLevel);
}, 
  'block': function(block) {
  _$jscoverage['/compiler.js'].functionData[24]++;
  _$jscoverage['/compiler.js'].lineData[301]++;
  var programNode = block.program, source = [], self = this, tplNode = block.tpl, configNameCode = self.genConfig(tplNode), configName = configNameCode[0], tplPath = tplNode.path, pathString = tplPath.string, inverseFn;
  _$jscoverage['/compiler.js'].lineData[311]++;
  pushToArray(source, configNameCode[1]);
  _$jscoverage['/compiler.js'].lineData[313]++;
  if (visit67_313_1(!configName)) {
    _$jscoverage['/compiler.js'].lineData[314]++;
    configName = S.guid('config');
    _$jscoverage['/compiler.js'].lineData[315]++;
    source.push('var ' + configName + ' = {};');
  }
  _$jscoverage['/compiler.js'].lineData[318]++;
  source.push(configName + '.fn=' + self.genFunction(programNode.statements).join('\n') + ';');
  _$jscoverage['/compiler.js'].lineData[321]++;
  if (visit68_321_1(programNode.inverse)) {
    _$jscoverage['/compiler.js'].lineData[322]++;
    inverseFn = self.genFunction(programNode.inverse).join('\n');
    _$jscoverage['/compiler.js'].lineData[323]++;
    source.push(configName + '.inverse=' + inverseFn + ';');
  }
  _$jscoverage['/compiler.js'].lineData[328]++;
  if (visit69_328_1(tplNode.isInverted)) {
    _$jscoverage['/compiler.js'].lineData[329]++;
    var tmp = guid('inverse');
    _$jscoverage['/compiler.js'].lineData[330]++;
    source.push('var ' + tmp + '=' + configName + '.fn;');
    _$jscoverage['/compiler.js'].lineData[331]++;
    source.push(configName + '.fn = ' + configName + '.inverse;');
    _$jscoverage['/compiler.js'].lineData[332]++;
    source.push(configName + '.inverse = ' + tmp + ';');
  }
  _$jscoverage['/compiler.js'].lineData[335]++;
  if (visit70_335_1(!tplNode.hash && !tplNode.params)) {
    _$jscoverage['/compiler.js'].lineData[336]++;
    var parts = tplPath.parts;
    _$jscoverage['/compiler.js'].lineData[337]++;
    for (var i = 0; visit71_337_1(i < parts.length); i++) {
      _$jscoverage['/compiler.js'].lineData[339]++;
      if (visit72_339_1(typeof parts[i] !== 'string')) {
        _$jscoverage['/compiler.js'].lineData[340]++;
        pathString = self.getIdStringFromIdParts(source, parts);
        _$jscoverage['/compiler.js'].lineData[341]++;
        break;
      }
    }
  }
  _$jscoverage['/compiler.js'].lineData[346]++;
  source.push('buffer += runBlockCommandUtil(engine, scope, ' + configName + ', ' + '"' + pathString + '", ' + tplPath.lineNumber + ');');
  _$jscoverage['/compiler.js'].lineData[350]++;
  return source;
}, 
  'content': function(contentNode) {
  _$jscoverage['/compiler.js'].functionData[25]++;
  _$jscoverage['/compiler.js'].lineData[354]++;
  return ['buffer += \'' + escapeString(contentNode.value, false) + '\';'];
}, 
  'tpl': function(tplNode) {
  _$jscoverage['/compiler.js'].functionData[26]++;
  _$jscoverage['/compiler.js'].lineData[358]++;
  var source = [], genIdCode = this.genId(tplNode.path, tplNode);
  _$jscoverage['/compiler.js'].lineData[360]++;
  pushToArray(source, genIdCode[1]);
  _$jscoverage['/compiler.js'].lineData[361]++;
  source.push('buffer += ' + genIdCode[0] + ';');
  _$jscoverage['/compiler.js'].lineData[362]++;
  return source;
}, 
  'tplExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[27]++;
  _$jscoverage['/compiler.js'].lineData[366]++;
  var source = [], escaped = e.escaped, expressionOrVariable;
  _$jscoverage['/compiler.js'].lineData[369]++;
  var code = this[e.expression.type](e.expression, 1);
  _$jscoverage['/compiler.js'].lineData[370]++;
  if (visit73_370_1(code[0])) {
    _$jscoverage['/compiler.js'].lineData[371]++;
    pushToArray(source, code[1]);
    _$jscoverage['/compiler.js'].lineData[372]++;
    expressionOrVariable = code[0];
  } else {
    _$jscoverage['/compiler.js'].lineData[374]++;
    pushToArray(source, code[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[375]++;
    expressionOrVariable = lastOfArray(code[1]);
  }
  _$jscoverage['/compiler.js'].lineData[377]++;
  source.push('buffer += getExpressionUtil(' + expressionOrVariable + ',' + escaped + ');');
  _$jscoverage['/compiler.js'].lineData[378]++;
  return source;
}, 
  'getIdStringFromIdParts': function(source, idParts) {
  _$jscoverage['/compiler.js'].functionData[28]++;
  _$jscoverage['/compiler.js'].lineData[383]++;
  var idString = '', self = this, i, idPart, idPartType, nextIdNameCode, first = true;
  _$jscoverage['/compiler.js'].lineData[390]++;
  for (i = 0; visit74_390_1(i < idParts.length); i++) {
    _$jscoverage['/compiler.js'].lineData[391]++;
    idPart = idParts[i];
    _$jscoverage['/compiler.js'].lineData[392]++;
    idPartType = idPart.type;
    _$jscoverage['/compiler.js'].lineData[393]++;
    if (visit75_393_1(!first)) {
      _$jscoverage['/compiler.js'].lineData[394]++;
      idString += '.';
    }
    _$jscoverage['/compiler.js'].lineData[396]++;
    if (visit76_396_1(idPartType)) {
      _$jscoverage['/compiler.js'].lineData[397]++;
      nextIdNameCode = self[idPartType](idPart);
      _$jscoverage['/compiler.js'].lineData[398]++;
      if (visit77_398_1(nextIdNameCode[0])) {
        _$jscoverage['/compiler.js'].lineData[399]++;
        pushToArray(source, nextIdNameCode[1]);
        _$jscoverage['/compiler.js'].lineData[400]++;
        idString += '"+' + nextIdNameCode[0] + '+"';
        _$jscoverage['/compiler.js'].lineData[401]++;
        first = true;
      }
    } else {
      _$jscoverage['/compiler.js'].lineData[405]++;
      idString += idPart;
      _$jscoverage['/compiler.js'].lineData[406]++;
      first = false;
    }
  }
  _$jscoverage['/compiler.js'].lineData[409]++;
  return idString;
}};
  _$jscoverage['/compiler.js'].lineData[413]++;
  var compiler;
  _$jscoverage['/compiler.js'].lineData[420]++;
  compiler = {
  parse: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[29]++;
  _$jscoverage['/compiler.js'].lineData[427]++;
  return parser.parse(tpl);
}, 
  compileToStr: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[30]++;
  _$jscoverage['/compiler.js'].lineData[435]++;
  var func = this.compile(tpl);
  _$jscoverage['/compiler.js'].lineData[436]++;
  return 'function(' + func.params.join(',') + '){\n' + func.source.join('\n') + '}';
}, 
  compile: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[31]++;
  _$jscoverage['/compiler.js'].lineData[446]++;
  var root = this.parse(tpl);
  _$jscoverage['/compiler.js'].lineData[447]++;
  variableId = 0;
  _$jscoverage['/compiler.js'].lineData[448]++;
  return gen.genFunction(root.statements, true);
}, 
  compileToFn: function(tpl, config) {
  _$jscoverage['/compiler.js'].functionData[32]++;
  _$jscoverage['/compiler.js'].lineData[458]++;
  var code = compiler.compile(tpl);
  _$jscoverage['/compiler.js'].lineData[459]++;
  config = visit78_459_1(config || {});
  _$jscoverage['/compiler.js'].lineData[460]++;
  var sourceURL = 'sourceURL=' + (config.name ? config.name : ('xtemplate' + (xtemplateId++))) + '.js';
  _$jscoverage['/compiler.js'].lineData[465]++;
  return Function.apply(null, [].concat(code.params).concat(code.source.join('\n') + '\n//@ ' + sourceURL + '\n//# ' + sourceURL));
}};
  _$jscoverage['/compiler.js'].lineData[475]++;
  return compiler;
});
