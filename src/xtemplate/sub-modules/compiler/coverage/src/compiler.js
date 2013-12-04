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
  _$jscoverage['/compiler.js'].lineData[124] = 0;
  _$jscoverage['/compiler.js'].lineData[125] = 0;
  _$jscoverage['/compiler.js'].lineData[129] = 0;
  _$jscoverage['/compiler.js'].lineData[131] = 0;
  _$jscoverage['/compiler.js'].lineData[133] = 0;
  _$jscoverage['/compiler.js'].lineData[137] = 0;
  _$jscoverage['/compiler.js'].lineData[142] = 0;
  _$jscoverage['/compiler.js'].lineData[147] = 0;
  _$jscoverage['/compiler.js'].lineData[151] = 0;
  _$jscoverage['/compiler.js'].lineData[157] = 0;
  _$jscoverage['/compiler.js'].lineData[158] = 0;
  _$jscoverage['/compiler.js'].lineData[160] = 0;
  _$jscoverage['/compiler.js'].lineData[161] = 0;
  _$jscoverage['/compiler.js'].lineData[162] = 0;
  _$jscoverage['/compiler.js'].lineData[163] = 0;
  _$jscoverage['/compiler.js'].lineData[164] = 0;
  _$jscoverage['/compiler.js'].lineData[167] = 0;
  _$jscoverage['/compiler.js'].lineData[168] = 0;
  _$jscoverage['/compiler.js'].lineData[169] = 0;
  _$jscoverage['/compiler.js'].lineData[170] = 0;
  _$jscoverage['/compiler.js'].lineData[175] = 0;
  _$jscoverage['/compiler.js'].lineData[178] = 0;
  _$jscoverage['/compiler.js'].lineData[179] = 0;
  _$jscoverage['/compiler.js'].lineData[180] = 0;
  _$jscoverage['/compiler.js'].lineData[181] = 0;
  _$jscoverage['/compiler.js'].lineData[185] = 0;
  _$jscoverage['/compiler.js'].lineData[188] = 0;
  _$jscoverage['/compiler.js'].lineData[189] = 0;
  _$jscoverage['/compiler.js'].lineData[190] = 0;
  _$jscoverage['/compiler.js'].lineData[191] = 0;
  _$jscoverage['/compiler.js'].lineData[195] = 0;
  _$jscoverage['/compiler.js'].lineData[198] = 0;
  _$jscoverage['/compiler.js'].lineData[202] = 0;
  _$jscoverage['/compiler.js'].lineData[208] = 0;
  _$jscoverage['/compiler.js'].lineData[209] = 0;
  _$jscoverage['/compiler.js'].lineData[210] = 0;
  _$jscoverage['/compiler.js'].lineData[212] = 0;
  _$jscoverage['/compiler.js'].lineData[213] = 0;
  _$jscoverage['/compiler.js'].lineData[214] = 0;
  _$jscoverage['/compiler.js'].lineData[217] = 0;
  _$jscoverage['/compiler.js'].lineData[218] = 0;
  _$jscoverage['/compiler.js'].lineData[219] = 0;
  _$jscoverage['/compiler.js'].lineData[220] = 0;
  _$jscoverage['/compiler.js'].lineData[221] = 0;
  _$jscoverage['/compiler.js'].lineData[222] = 0;
  _$jscoverage['/compiler.js'].lineData[223] = 0;
  _$jscoverage['/compiler.js'].lineData[224] = 0;
  _$jscoverage['/compiler.js'].lineData[226] = 0;
  _$jscoverage['/compiler.js'].lineData[227] = 0;
  _$jscoverage['/compiler.js'].lineData[230] = 0;
  _$jscoverage['/compiler.js'].lineData[233] = 0;
  _$jscoverage['/compiler.js'].lineData[234] = 0;
  _$jscoverage['/compiler.js'].lineData[235] = 0;
  _$jscoverage['/compiler.js'].lineData[236] = 0;
  _$jscoverage['/compiler.js'].lineData[237] = 0;
  _$jscoverage['/compiler.js'].lineData[238] = 0;
  _$jscoverage['/compiler.js'].lineData[239] = 0;
  _$jscoverage['/compiler.js'].lineData[240] = 0;
  _$jscoverage['/compiler.js'].lineData[242] = 0;
  _$jscoverage['/compiler.js'].lineData[243] = 0;
  _$jscoverage['/compiler.js'].lineData[246] = 0;
  _$jscoverage['/compiler.js'].lineData[250] = 0;
  _$jscoverage['/compiler.js'].lineData[255] = 0;
  _$jscoverage['/compiler.js'].lineData[259] = 0;
  _$jscoverage['/compiler.js'].lineData[263] = 0;
  _$jscoverage['/compiler.js'].lineData[267] = 0;
  _$jscoverage['/compiler.js'].lineData[271] = 0;
  _$jscoverage['/compiler.js'].lineData[275] = 0;
  _$jscoverage['/compiler.js'].lineData[279] = 0;
  _$jscoverage['/compiler.js'].lineData[283] = 0;
  _$jscoverage['/compiler.js'].lineData[284] = 0;
  _$jscoverage['/compiler.js'].lineData[285] = 0;
  _$jscoverage['/compiler.js'].lineData[287] = 0;
  _$jscoverage['/compiler.js'].lineData[289] = 0;
  _$jscoverage['/compiler.js'].lineData[295] = 0;
  _$jscoverage['/compiler.js'].lineData[299] = 0;
  _$jscoverage['/compiler.js'].lineData[303] = 0;
  _$jscoverage['/compiler.js'].lineData[307] = 0;
  _$jscoverage['/compiler.js'].lineData[313] = 0;
  _$jscoverage['/compiler.js'].lineData[314] = 0;
  _$jscoverage['/compiler.js'].lineData[318] = 0;
  _$jscoverage['/compiler.js'].lineData[322] = 0;
  _$jscoverage['/compiler.js'].lineData[332] = 0;
  _$jscoverage['/compiler.js'].lineData[334] = 0;
  _$jscoverage['/compiler.js'].lineData[335] = 0;
  _$jscoverage['/compiler.js'].lineData[336] = 0;
  _$jscoverage['/compiler.js'].lineData[339] = 0;
  _$jscoverage['/compiler.js'].lineData[342] = 0;
  _$jscoverage['/compiler.js'].lineData[343] = 0;
  _$jscoverage['/compiler.js'].lineData[344] = 0;
  _$jscoverage['/compiler.js'].lineData[349] = 0;
  _$jscoverage['/compiler.js'].lineData[350] = 0;
  _$jscoverage['/compiler.js'].lineData[351] = 0;
  _$jscoverage['/compiler.js'].lineData[352] = 0;
  _$jscoverage['/compiler.js'].lineData[353] = 0;
  _$jscoverage['/compiler.js'].lineData[356] = 0;
  _$jscoverage['/compiler.js'].lineData[357] = 0;
  _$jscoverage['/compiler.js'].lineData[358] = 0;
  _$jscoverage['/compiler.js'].lineData[360] = 0;
  _$jscoverage['/compiler.js'].lineData[361] = 0;
  _$jscoverage['/compiler.js'].lineData[362] = 0;
  _$jscoverage['/compiler.js'].lineData[367] = 0;
  _$jscoverage['/compiler.js'].lineData[371] = 0;
  _$jscoverage['/compiler.js'].lineData[375] = 0;
  _$jscoverage['/compiler.js'].lineData[379] = 0;
  _$jscoverage['/compiler.js'].lineData[381] = 0;
  _$jscoverage['/compiler.js'].lineData[382] = 0;
  _$jscoverage['/compiler.js'].lineData[383] = 0;
  _$jscoverage['/compiler.js'].lineData[387] = 0;
  _$jscoverage['/compiler.js'].lineData[393] = 0;
  _$jscoverage['/compiler.js'].lineData[394] = 0;
  _$jscoverage['/compiler.js'].lineData[397] = 0;
  _$jscoverage['/compiler.js'].lineData[399] = 0;
  _$jscoverage['/compiler.js'].lineData[400] = 0;
  _$jscoverage['/compiler.js'].lineData[401] = 0;
  _$jscoverage['/compiler.js'].lineData[403] = 0;
  _$jscoverage['/compiler.js'].lineData[404] = 0;
  _$jscoverage['/compiler.js'].lineData[406] = 0;
  _$jscoverage['/compiler.js'].lineData[407] = 0;
  _$jscoverage['/compiler.js'].lineData[412] = 0;
  _$jscoverage['/compiler.js'].lineData[419] = 0;
  _$jscoverage['/compiler.js'].lineData[420] = 0;
  _$jscoverage['/compiler.js'].lineData[421] = 0;
  _$jscoverage['/compiler.js'].lineData[422] = 0;
  _$jscoverage['/compiler.js'].lineData[423] = 0;
  _$jscoverage['/compiler.js'].lineData[425] = 0;
  _$jscoverage['/compiler.js'].lineData[426] = 0;
  _$jscoverage['/compiler.js'].lineData[427] = 0;
  _$jscoverage['/compiler.js'].lineData[428] = 0;
  _$jscoverage['/compiler.js'].lineData[429] = 0;
  _$jscoverage['/compiler.js'].lineData[430] = 0;
  _$jscoverage['/compiler.js'].lineData[434] = 0;
  _$jscoverage['/compiler.js'].lineData[435] = 0;
  _$jscoverage['/compiler.js'].lineData[438] = 0;
  _$jscoverage['/compiler.js'].lineData[442] = 0;
  _$jscoverage['/compiler.js'].lineData[449] = 0;
  _$jscoverage['/compiler.js'].lineData[456] = 0;
  _$jscoverage['/compiler.js'].lineData[464] = 0;
  _$jscoverage['/compiler.js'].lineData[465] = 0;
  _$jscoverage['/compiler.js'].lineData[475] = 0;
  _$jscoverage['/compiler.js'].lineData[476] = 0;
  _$jscoverage['/compiler.js'].lineData[477] = 0;
  _$jscoverage['/compiler.js'].lineData[487] = 0;
  _$jscoverage['/compiler.js'].lineData[488] = 0;
  _$jscoverage['/compiler.js'].lineData[489] = 0;
  _$jscoverage['/compiler.js'].lineData[494] = 0;
  _$jscoverage['/compiler.js'].lineData[504] = 0;
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
  _$jscoverage['/compiler.js'].branchData['124'] = [];
  _$jscoverage['/compiler.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['129'] = [];
  _$jscoverage['/compiler.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['131'] = [];
  _$jscoverage['/compiler.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['144'] = [];
  _$jscoverage['/compiler.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['160'] = [];
  _$jscoverage['/compiler.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['167'] = [];
  _$jscoverage['/compiler.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['178'] = [];
  _$jscoverage['/compiler.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['188'] = [];
  _$jscoverage['/compiler.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['208'] = [];
  _$jscoverage['/compiler.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['212'] = [];
  _$jscoverage['/compiler.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['217'] = [];
  _$jscoverage['/compiler.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['222'] = [];
  _$jscoverage['/compiler.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['233'] = [];
  _$jscoverage['/compiler.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['238'] = [];
  _$jscoverage['/compiler.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['334'] = [];
  _$jscoverage['/compiler.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['342'] = [];
  _$jscoverage['/compiler.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['349'] = [];
  _$jscoverage['/compiler.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['356'] = [];
  _$jscoverage['/compiler.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['358'] = [];
  _$jscoverage['/compiler.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['360'] = [];
  _$jscoverage['/compiler.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['393'] = [];
  _$jscoverage['/compiler.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['399'] = [];
  _$jscoverage['/compiler.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['419'] = [];
  _$jscoverage['/compiler.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['422'] = [];
  _$jscoverage['/compiler.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['425'] = [];
  _$jscoverage['/compiler.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['427'] = [];
  _$jscoverage['/compiler.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['488'] = [];
  _$jscoverage['/compiler.js'].branchData['488'][1] = new BranchData();
}
_$jscoverage['/compiler.js'].branchData['488'][1].init(68, 12, 'config || {}');
function visit83_488_1(result) {
  _$jscoverage['/compiler.js'].branchData['488'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['427'][1].init(88, 17, 'nextIdNameCode[0]');
function visit82_427_1(result) {
  _$jscoverage['/compiler.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['425'][1].init(185, 10, 'idPartType');
function visit81_425_1(result) {
  _$jscoverage['/compiler.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['422'][1].init(100, 6, '!first');
function visit80_422_1(result) {
  _$jscoverage['/compiler.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['419'][1].init(218, 18, 'i < idParts.length');
function visit79_419_1(result) {
  _$jscoverage['/compiler.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['399'][1].init(432, 7, 'code[0]');
function visit78_399_1(result) {
  _$jscoverage['/compiler.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['393'][1].init(228, 13, 'type === \'id\'');
function visit77_393_1(result) {
  _$jscoverage['/compiler.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['360'][1].init(57, 28, 'typeof parts[i] !== \'string\'');
function visit76_360_1(result) {
  _$jscoverage['/compiler.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['358'][1].init(76, 16, 'i < parts.length');
function visit75_358_1(result) {
  _$jscoverage['/compiler.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['356'][1].init(1293, 32, '!tplNode.hash && !tplNode.params');
function visit74_356_1(result) {
  _$jscoverage['/compiler.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['349'][1].init(978, 18, 'tplNode.isInverted');
function visit73_349_1(result) {
  _$jscoverage['/compiler.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['342'][1].init(706, 19, 'programNode.inverse');
function visit72_342_1(result) {
  _$jscoverage['/compiler.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['334'][1].init(429, 11, '!configName');
function visit71_334_1(result) {
  _$jscoverage['/compiler.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['238'][1].init(91, 17, 'nextIdNameCode[0]');
function visit70_238_1(result) {
  _$jscoverage['/compiler.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['233'][1].init(1115, 4, 'hash');
function visit69_233_1(result) {
  _$jscoverage['/compiler.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['222'][1].init(99, 17, 'nextIdNameCode[0]');
function visit68_222_1(result) {
  _$jscoverage['/compiler.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['217'][1].init(271, 6, 'params');
function visit67_217_1(result) {
  _$jscoverage['/compiler.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['212'][1].init(100, 14, 'params || hash');
function visit66_212_1(result) {
  _$jscoverage['/compiler.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['208'][1].init(150, 7, 'tplNode');
function visit65_208_1(result) {
  _$jscoverage['/compiler.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['188'][1].init(1211, 15, '!name1 && name2');
function visit64_188_1(result) {
  _$jscoverage['/compiler.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['178'][1].init(878, 15, 'name1 && !name2');
function visit63_178_1(result) {
  _$jscoverage['/compiler.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['167'][1].init(483, 16, '!name1 && !name2');
function visit62_167_1(result) {
  _$jscoverage['/compiler.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['160'][1].init(252, 14, 'name1 && name2');
function visit61_160_1(result) {
  _$jscoverage['/compiler.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['144'][1].init(107, 18, 'configName || \'{}\'');
function visit60_144_1(result) {
  _$jscoverage['/compiler.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['131'][1].init(64, 22, 'idString === \'include\'');
function visit59_131_1(result) {
  _$jscoverage['/compiler.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['129'][1].init(1058, 10, 'configName');
function visit58_129_1(result) {
  _$jscoverage['/compiler.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['124'][1].init(782, 40, 'depth || S.startsWith(idString, \'this.\')');
function visit57_124_1(result) {
  _$jscoverage['/compiler.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['112'][1].init(94, 14, 'configNameCode');
function visit56_112_1(result) {
  _$jscoverage['/compiler.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['111'][1].init(38, 34, 'tplNode && self.genConfig(tplNode)');
function visit55_111_1(result) {
  _$jscoverage['/compiler.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['110'][1].init(293, 11, 'depth === 0');
function visit54_110_1(result) {
  _$jscoverage['/compiler.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['89'][1].init(1247, 7, '!global');
function visit53_89_1(result) {
  _$jscoverage['/compiler.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['84'][1].init(58, 7, 'i < len');
function visit52_84_1(result) {
  _$jscoverage['/compiler.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['83'][1].init(987, 10, 'statements');
function visit51_83_1(result) {
  _$jscoverage['/compiler.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['79'][1].init(629, 7, 'natives');
function visit50_79_1(result) {
  _$jscoverage['/compiler.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['60'][1].init(204, 6, 'global');
function visit49_60_1(result) {
  _$jscoverage['/compiler.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['56'][1].init(46, 7, '!global');
function visit48_56_1(result) {
  _$jscoverage['/compiler.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['37'][1].init(87, 12, 'm.length % 2');
function visit47_37_1(result) {
  _$jscoverage['/compiler.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['23'][1].init(13, 6, 'isCode');
function visit46_23_1(result) {
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
    if (visit46_23_1(isCode)) {
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
  if (visit47_37_1(m.length % 2)) {
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
  if (visit48_56_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[57]++;
    source.push('function(scope) {');
  }
  _$jscoverage['/compiler.js'].lineData[59]++;
  source.push('var buffer = ""' + (global ? ',' : ';'));
  _$jscoverage['/compiler.js'].lineData[60]++;
  if (visit49_60_1(global)) {
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
    if (visit50_79_1(natives)) {
      _$jscoverage['/compiler.js'].lineData[80]++;
      source.push('var ' + natives.slice(0, natives.length - 1) + ';');
    }
  }
  _$jscoverage['/compiler.js'].lineData[83]++;
  if (visit51_83_1(statements)) {
    _$jscoverage['/compiler.js'].lineData[84]++;
    for (var i = 0, len = statements.length; visit52_84_1(i < len); i++) {
      _$jscoverage['/compiler.js'].lineData[85]++;
      pushToArray(source, this[statements[i].type](statements[i]));
    }
  }
  _$jscoverage['/compiler.js'].lineData[88]++;
  source.push('return buffer;');
  _$jscoverage['/compiler.js'].lineData[89]++;
  if (visit53_89_1(!global)) {
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
  genIdOrInlineCommand: function(idNode, tplNode) {
  _$jscoverage['/compiler.js'].functionData[8]++;
  _$jscoverage['/compiler.js'].lineData[101]++;
  var source = [], depth = idNode.depth, configName, idParts = idNode.parts, idName = guid('id'), self = this;
  _$jscoverage['/compiler.js'].lineData[110]++;
  if (visit54_110_1(depth === 0)) {
    _$jscoverage['/compiler.js'].lineData[111]++;
    var configNameCode = visit55_111_1(tplNode && self.genConfig(tplNode));
    _$jscoverage['/compiler.js'].lineData[112]++;
    if (visit56_112_1(configNameCode)) {
      _$jscoverage['/compiler.js'].lineData[113]++;
      configName = configNameCode[0];
      _$jscoverage['/compiler.js'].lineData[114]++;
      pushToArray(source, configNameCode[1]);
    }
  }
  _$jscoverage['/compiler.js'].lineData[119]++;
  var idString = self.getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[124]++;
  if (visit57_124_1(depth || S.startsWith(idString, 'this.'))) {
    _$jscoverage['/compiler.js'].lineData[125]++;
    source.push('var ' + idName + ' = getPropertyUtil(engine,scope' + ',"' + idString + '",' + depth + ',' + idNode.lineNumber + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[129]++;
    if (visit58_129_1(configName)) {
      _$jscoverage['/compiler.js'].lineData[131]++;
      if (visit59_131_1(idString === 'include')) {
        _$jscoverage['/compiler.js'].lineData[133]++;
        source.push('if(moduleWrap) {re' + 'quire("' + tplNode.params[0].value + '");' + configName + '.params[0] = moduleWrap.resolveByName(' + configName + '.params[0]);' + '}');
      }
      _$jscoverage['/compiler.js'].lineData[137]++;
      source.push('var ' + idName + ' = runInlineCommandUtil(engine,scope,' + configName + ',"' + idString + '",' + idNode.lineNumber + ');');
    } else {
      _$jscoverage['/compiler.js'].lineData[142]++;
      source.push('var ' + idName + ' = getPropertyOrRunCommandUtil(engine,scope,' + (visit60_144_1(configName || '{}')) + ',"' + idString + '",' + depth + ',' + idNode.lineNumber + ');');
    }
  }
  _$jscoverage['/compiler.js'].lineData[147]++;
  return [idName, source];
}, 
  genOpExpression: function(e, type) {
  _$jscoverage['/compiler.js'].functionData[9]++;
  _$jscoverage['/compiler.js'].lineData[151]++;
  var source = [], name1, name2, code1 = this[e.op1.type](e.op1), code2 = this[e.op2.type](e.op2);
  _$jscoverage['/compiler.js'].lineData[157]++;
  name1 = code1[0];
  _$jscoverage['/compiler.js'].lineData[158]++;
  name2 = code2[0];
  _$jscoverage['/compiler.js'].lineData[160]++;
  if (visit61_160_1(name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[161]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[162]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[163]++;
    source.push(name1 + type + name2);
    _$jscoverage['/compiler.js'].lineData[164]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[167]++;
  if (visit62_167_1(!name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[168]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[169]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[170]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[175]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[178]++;
  if (visit63_178_1(name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[179]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[180]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[181]++;
    source.push(name1 + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[185]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[188]++;
  if (visit64_188_1(!name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[189]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[190]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[191]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + name2);
    _$jscoverage['/compiler.js'].lineData[195]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[198]++;
  return undefined;
}, 
  genConfig: function(tplNode) {
  _$jscoverage['/compiler.js'].functionData[10]++;
  _$jscoverage['/compiler.js'].lineData[202]++;
  var source = [], configName, params, hash, self = this;
  _$jscoverage['/compiler.js'].lineData[208]++;
  if (visit65_208_1(tplNode)) {
    _$jscoverage['/compiler.js'].lineData[209]++;
    params = tplNode.params;
    _$jscoverage['/compiler.js'].lineData[210]++;
    hash = tplNode.hash;
    _$jscoverage['/compiler.js'].lineData[212]++;
    if (visit66_212_1(params || hash)) {
      _$jscoverage['/compiler.js'].lineData[213]++;
      configName = guid('config');
      _$jscoverage['/compiler.js'].lineData[214]++;
      source.push('var ' + configName + ' = {};');
    }
    _$jscoverage['/compiler.js'].lineData[217]++;
    if (visit67_217_1(params)) {
      _$jscoverage['/compiler.js'].lineData[218]++;
      var paramsName = guid('params');
      _$jscoverage['/compiler.js'].lineData[219]++;
      source.push('var ' + paramsName + ' = [];');
      _$jscoverage['/compiler.js'].lineData[220]++;
      S.each(params, function(param) {
  _$jscoverage['/compiler.js'].functionData[11]++;
  _$jscoverage['/compiler.js'].lineData[221]++;
  var nextIdNameCode = self[param.type](param);
  _$jscoverage['/compiler.js'].lineData[222]++;
  if (visit68_222_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[223]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[224]++;
    source.push(paramsName + '.push(' + nextIdNameCode[0] + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[226]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[227]++;
    source.push(paramsName + '.push(' + lastOfArray(nextIdNameCode[1]) + ');');
  }
});
      _$jscoverage['/compiler.js'].lineData[230]++;
      source.push(configName + '.params=' + paramsName + ';');
    }
    _$jscoverage['/compiler.js'].lineData[233]++;
    if (visit69_233_1(hash)) {
      _$jscoverage['/compiler.js'].lineData[234]++;
      var hashName = guid('hash');
      _$jscoverage['/compiler.js'].lineData[235]++;
      source.push('var ' + hashName + ' = {};');
      _$jscoverage['/compiler.js'].lineData[236]++;
      S.each(hash.value, function(v, key) {
  _$jscoverage['/compiler.js'].functionData[12]++;
  _$jscoverage['/compiler.js'].lineData[237]++;
  var nextIdNameCode = self[v.type](v);
  _$jscoverage['/compiler.js'].lineData[238]++;
  if (visit70_238_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[239]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[240]++;
    source.push(hashName + '["' + key + '"] = ' + nextIdNameCode[0] + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[242]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[243]++;
    source.push(hashName + '["' + key + '"] = ' + lastOfArray(nextIdNameCode[1]) + ';');
  }
});
      _$jscoverage['/compiler.js'].lineData[246]++;
      source.push(configName + '.hash=' + hashName + ';');
    }
  }
  _$jscoverage['/compiler.js'].lineData[250]++;
  return [configName, source];
}, 
  conditionalOrExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[13]++;
  _$jscoverage['/compiler.js'].lineData[255]++;
  return this.genOpExpression(e, '||');
}, 
  conditionalAndExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[14]++;
  _$jscoverage['/compiler.js'].lineData[259]++;
  return this.genOpExpression(e, '&&');
}, 
  relationalExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[15]++;
  _$jscoverage['/compiler.js'].lineData[263]++;
  return this.genOpExpression(e, e.opType);
}, 
  equalityExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[16]++;
  _$jscoverage['/compiler.js'].lineData[267]++;
  return this.genOpExpression(e, e.opType);
}, 
  additiveExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[17]++;
  _$jscoverage['/compiler.js'].lineData[271]++;
  return this.genOpExpression(e, e.opType);
}, 
  multiplicativeExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[18]++;
  _$jscoverage['/compiler.js'].lineData[275]++;
  return this.genOpExpression(e, e.opType);
}, 
  unaryExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[19]++;
  _$jscoverage['/compiler.js'].lineData[279]++;
  var source = [], name, unaryType = e.unaryType, code = this[e.value.type](e.value);
  _$jscoverage['/compiler.js'].lineData[283]++;
  arrayPush.apply(source, code[1]);
  _$jscoverage['/compiler.js'].lineData[284]++;
  if ((name = code[0])) {
    _$jscoverage['/compiler.js'].lineData[285]++;
    source.push(name + '=' + unaryType + name + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[287]++;
    source[source.length - 1] = '' + unaryType + lastOfArray(source);
  }
  _$jscoverage['/compiler.js'].lineData[289]++;
  return [name, source];
}, 
  'string': function(e) {
  _$jscoverage['/compiler.js'].functionData[20]++;
  _$jscoverage['/compiler.js'].lineData[295]++;
  return ['', ["'" + escapeString(e.value, true) + "'"]];
}, 
  'number': function(e) {
  _$jscoverage['/compiler.js'].functionData[21]++;
  _$jscoverage['/compiler.js'].lineData[299]++;
  return ['', [e.value]];
}, 
  'boolean': function(e) {
  _$jscoverage['/compiler.js'].functionData[22]++;
  _$jscoverage['/compiler.js'].lineData[303]++;
  return ['', [e.value]];
}, 
  'id': function(idNode) {
  _$jscoverage['/compiler.js'].functionData[23]++;
  _$jscoverage['/compiler.js'].lineData[307]++;
  var source = [], depth = idNode.depth, idParts = idNode.parts, idName = guid('id'), self = this;
  _$jscoverage['/compiler.js'].lineData[313]++;
  var idString = self.getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[314]++;
  source.push('var ' + idName + ' = getPropertyUtil(engine,scope' + ',"' + idString + '",' + depth + ',' + idNode.lineNumber + ');');
  _$jscoverage['/compiler.js'].lineData[318]++;
  return [idName, source];
}, 
  'block': function(block) {
  _$jscoverage['/compiler.js'].functionData[24]++;
  _$jscoverage['/compiler.js'].lineData[322]++;
  var programNode = block.program, source = [], self = this, tplNode = block.tpl, configNameCode = self.genConfig(tplNode), configName = configNameCode[0], tplPath = tplNode.path, pathString = tplPath.string, inverseFn;
  _$jscoverage['/compiler.js'].lineData[332]++;
  pushToArray(source, configNameCode[1]);
  _$jscoverage['/compiler.js'].lineData[334]++;
  if (visit71_334_1(!configName)) {
    _$jscoverage['/compiler.js'].lineData[335]++;
    configName = S.guid('config');
    _$jscoverage['/compiler.js'].lineData[336]++;
    source.push('var ' + configName + ' = {};');
  }
  _$jscoverage['/compiler.js'].lineData[339]++;
  source.push(configName + '.fn=' + self.genFunction(programNode.statements).join('\n') + ';');
  _$jscoverage['/compiler.js'].lineData[342]++;
  if (visit72_342_1(programNode.inverse)) {
    _$jscoverage['/compiler.js'].lineData[343]++;
    inverseFn = self.genFunction(programNode.inverse).join('\n');
    _$jscoverage['/compiler.js'].lineData[344]++;
    source.push(configName + '.inverse=' + inverseFn + ';');
  }
  _$jscoverage['/compiler.js'].lineData[349]++;
  if (visit73_349_1(tplNode.isInverted)) {
    _$jscoverage['/compiler.js'].lineData[350]++;
    var tmp = guid('inverse');
    _$jscoverage['/compiler.js'].lineData[351]++;
    source.push('var ' + tmp + '=' + configName + '.fn;');
    _$jscoverage['/compiler.js'].lineData[352]++;
    source.push(configName + '.fn = ' + configName + '.inverse;');
    _$jscoverage['/compiler.js'].lineData[353]++;
    source.push(configName + '.inverse = ' + tmp + ';');
  }
  _$jscoverage['/compiler.js'].lineData[356]++;
  if (visit74_356_1(!tplNode.hash && !tplNode.params)) {
    _$jscoverage['/compiler.js'].lineData[357]++;
    var parts = tplPath.parts;
    _$jscoverage['/compiler.js'].lineData[358]++;
    for (var i = 0; visit75_358_1(i < parts.length); i++) {
      _$jscoverage['/compiler.js'].lineData[360]++;
      if (visit76_360_1(typeof parts[i] !== 'string')) {
        _$jscoverage['/compiler.js'].lineData[361]++;
        pathString = self.getIdStringFromIdParts(source, parts);
        _$jscoverage['/compiler.js'].lineData[362]++;
        break;
      }
    }
  }
  _$jscoverage['/compiler.js'].lineData[367]++;
  source.push('buffer += runBlockCommandUtil(engine, scope, ' + configName + ', ' + '"' + pathString + '", ' + tplPath.lineNumber + ');');
  _$jscoverage['/compiler.js'].lineData[371]++;
  return source;
}, 
  'content': function(contentNode) {
  _$jscoverage['/compiler.js'].functionData[25]++;
  _$jscoverage['/compiler.js'].lineData[375]++;
  return ['buffer += \'' + escapeString(contentNode.value, false) + '\';'];
}, 
  'tpl': function(tplNode) {
  _$jscoverage['/compiler.js'].functionData[26]++;
  _$jscoverage['/compiler.js'].lineData[379]++;
  var source = [], genIdOrInlineCommandCode = this.genIdOrInlineCommand(tplNode.path, tplNode);
  _$jscoverage['/compiler.js'].lineData[381]++;
  pushToArray(source, genIdOrInlineCommandCode[1]);
  _$jscoverage['/compiler.js'].lineData[382]++;
  source.push('buffer += renderOutputUtil(' + genIdOrInlineCommandCode[0] + ',' + tplNode.escaped + ');');
  _$jscoverage['/compiler.js'].lineData[383]++;
  return source;
}, 
  'tplExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[27]++;
  _$jscoverage['/compiler.js'].lineData[387]++;
  var source = [], escaped = e.escaped, code, expression = e.expression, type = e.expression.type, expressionOrVariable;
  _$jscoverage['/compiler.js'].lineData[393]++;
  if (visit77_393_1(type === 'id')) {
    _$jscoverage['/compiler.js'].lineData[394]++;
    code = this.genIdOrInlineCommand(expression);
  } else {
    _$jscoverage['/compiler.js'].lineData[397]++;
    code = this[type](expression);
  }
  _$jscoverage['/compiler.js'].lineData[399]++;
  if (visit78_399_1(code[0])) {
    _$jscoverage['/compiler.js'].lineData[400]++;
    pushToArray(source, code[1]);
    _$jscoverage['/compiler.js'].lineData[401]++;
    expressionOrVariable = code[0];
  } else {
    _$jscoverage['/compiler.js'].lineData[403]++;
    pushToArray(source, code[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[404]++;
    expressionOrVariable = lastOfArray(code[1]);
  }
  _$jscoverage['/compiler.js'].lineData[406]++;
  source.push('buffer += renderOutputUtil(' + expressionOrVariable + ',' + escaped + ');');
  _$jscoverage['/compiler.js'].lineData[407]++;
  return source;
}, 
  'getIdStringFromIdParts': function(source, idParts) {
  _$jscoverage['/compiler.js'].functionData[28]++;
  _$jscoverage['/compiler.js'].lineData[412]++;
  var idString = '', self = this, i, idPart, idPartType, nextIdNameCode, first = true;
  _$jscoverage['/compiler.js'].lineData[419]++;
  for (i = 0; visit79_419_1(i < idParts.length); i++) {
    _$jscoverage['/compiler.js'].lineData[420]++;
    idPart = idParts[i];
    _$jscoverage['/compiler.js'].lineData[421]++;
    idPartType = idPart.type;
    _$jscoverage['/compiler.js'].lineData[422]++;
    if (visit80_422_1(!first)) {
      _$jscoverage['/compiler.js'].lineData[423]++;
      idString += '.';
    }
    _$jscoverage['/compiler.js'].lineData[425]++;
    if (visit81_425_1(idPartType)) {
      _$jscoverage['/compiler.js'].lineData[426]++;
      nextIdNameCode = self[idPartType](idPart);
      _$jscoverage['/compiler.js'].lineData[427]++;
      if (visit82_427_1(nextIdNameCode[0])) {
        _$jscoverage['/compiler.js'].lineData[428]++;
        pushToArray(source, nextIdNameCode[1]);
        _$jscoverage['/compiler.js'].lineData[429]++;
        idString += '"+' + nextIdNameCode[0] + '+"';
        _$jscoverage['/compiler.js'].lineData[430]++;
        first = true;
      }
    } else {
      _$jscoverage['/compiler.js'].lineData[434]++;
      idString += idPart;
      _$jscoverage['/compiler.js'].lineData[435]++;
      first = false;
    }
  }
  _$jscoverage['/compiler.js'].lineData[438]++;
  return idString;
}};
  _$jscoverage['/compiler.js'].lineData[442]++;
  var compiler;
  _$jscoverage['/compiler.js'].lineData[449]++;
  compiler = {
  parse: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[29]++;
  _$jscoverage['/compiler.js'].lineData[456]++;
  return parser.parse(tpl);
}, 
  compileToStr: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[30]++;
  _$jscoverage['/compiler.js'].lineData[464]++;
  var func = this.compile(tpl);
  _$jscoverage['/compiler.js'].lineData[465]++;
  return 'function(' + func.params.join(',') + '){\n' + func.source.join('\n') + '}';
}, 
  compile: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[31]++;
  _$jscoverage['/compiler.js'].lineData[475]++;
  var root = this.parse(tpl);
  _$jscoverage['/compiler.js'].lineData[476]++;
  variableId = 0;
  _$jscoverage['/compiler.js'].lineData[477]++;
  return gen.genFunction(root.statements, true);
}, 
  compileToFn: function(tpl, config) {
  _$jscoverage['/compiler.js'].functionData[32]++;
  _$jscoverage['/compiler.js'].lineData[487]++;
  var code = compiler.compile(tpl);
  _$jscoverage['/compiler.js'].lineData[488]++;
  config = visit83_488_1(config || {});
  _$jscoverage['/compiler.js'].lineData[489]++;
  var sourceURL = 'sourceURL=' + (config.name ? config.name : ('xtemplate' + (xtemplateId++))) + '.js';
  _$jscoverage['/compiler.js'].lineData[494]++;
  return Function.apply(null, [].concat(code.params).concat(code.source.join('\n') + '\n//@ ' + sourceURL + '\n//# ' + sourceURL));
}};
  _$jscoverage['/compiler.js'].lineData[504]++;
  return compiler;
});
