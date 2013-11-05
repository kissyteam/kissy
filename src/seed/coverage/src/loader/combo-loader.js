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
  _$jscoverage['/loader/combo-loader.js'].lineData[8] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[10] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[11] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[15] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[16] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[17] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[21] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[22] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[23] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[26] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[27] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[29] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[30] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[31] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[33] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[36] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[37] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[41] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[42] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[43] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[44] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[46] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[47] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[48] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[49] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[54] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[58] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[68] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[77] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[78] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[84] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[85] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[86] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[88] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[89] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[90] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[91] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[92] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[94] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[96] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[97] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[98] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[101] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[107] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[108] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[109] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[111] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[113] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[119] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[120] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[126] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[127] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[128] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[129] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[130] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[133] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[134] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[141] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[142] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[143] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[145] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[148] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[149] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[150] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[151] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[152] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[153] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[156] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[157] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[162] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[163] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[164] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[165] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[166] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[167] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[168] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[171] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[176] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[177] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[179] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[180] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[183] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[186] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[191] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[197] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[199] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[201] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[204] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[205] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[206] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[207] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[210] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[211] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[212] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[214] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[218] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[219] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[220] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[223] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[224] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[226] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[233] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[234] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[235] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[236] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[239] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[240] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[243] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[244] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[247] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[248] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[251] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[262] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[270] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[273] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[275] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[276] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[277] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[278] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[280] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[281] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[282] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[283] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[284] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[286] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[287] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[288] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[289] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[290] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[292] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[293] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[295] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[297] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[300] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[303] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[310] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[319] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[320] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[321] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[322] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[323] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[324] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[325] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[326] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[327] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[328] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[329] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[330] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[332] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[334] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[337] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[339] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[340] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[341] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[342] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[345] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[346] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[349] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[352] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[355] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[356] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[357] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[358] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[359] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[361] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[364] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[367] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[370] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[377] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[384] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[386] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[388] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[391] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[392] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[393] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[394] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[395] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[396] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[397] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[398] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[400] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[407] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[408] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[409] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[411] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[414] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[423] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[424] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[425] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[427] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[428] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[429] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[434] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[437] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[438] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[439] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[441] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[443] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[444] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[445] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[446] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[447] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[448] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[451] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[452] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[456] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[460] = 0;
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
  _$jscoverage['/loader/combo-loader.js'].branchData['8'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['11'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['16'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['27'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['41'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['43'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['46'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['89'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['92'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['107'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['126'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['128'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['133'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['152'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['156'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['166'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['167'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['179'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['206'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['235'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['243'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['270'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['273'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['275'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['277'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['283'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['283'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['283'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['286'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['287'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['288'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['319'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['334'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['334'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['340'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['341'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['355'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['356'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['361'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['361'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['361'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['398'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['423'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['428'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['441'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['441'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['442'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['451'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['451'][1] = new BranchData();
}
_$jscoverage['/loader/combo-loader.js'].branchData['451'][1].init(2808, 23, 'currentComboUrls.length');
function visit352_451_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['442'][1].init(69, 72, 'l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength');
function visit351_442_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['441'][2].init(845, 36, 'currentComboUrls.length > maxFileNum');
function visit350_441_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['441'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['441'][1].init(845, 143, 'currentComboUrls.length > maxFileNum || (l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)');
function visit349_441_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['428'][1].init(249, 25, '!currentMod.canBeCombined');
function visit348_428_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['423'][1].init(1429, 15, 'i < mods.length');
function visit347_423_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['398'][1].init(231, 15, 'tags.length > 1');
function visit346_398_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['361'][3].init(51, 19, 'mods.tags[0] == tag');
function visit345_361_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['361'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['361'][2].init(26, 21, 'mods.tags.length == 1');
function visit344_361_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['361'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['361'][1].init(26, 44, 'mods.tags.length == 1 && mods.tags[0] == tag');
function visit343_361_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['356'][1].init(1830, 32, '!(mods = typedCombos[comboName])');
function visit342_356_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['355'][1].init(1786, 21, 'comboMods[type] || {}');
function visit341_355_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['341'][1].init(30, 41, 'groupPrefixUri.isSameOriginAs(packageUri)');
function visit340_341_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['340'][1].init(188, 41, 'groupPrefixUri = comboPrefixes[comboName]');
function visit339_340_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['334'][2].init(764, 83, 'packageInfo.isCombine() && S.startsWith(fullpath, packagePath)');
function visit338_334_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['334'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['334'][1].init(744, 113, '(mod.canBeCombined = packageInfo.isCombine() && S.startsWith(fullpath, packagePath)) && group');
function visit337_334_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['319'][1].init(348, 5, 'i < l');
function visit336_319_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['288'][1].init(30, 20, 'modStatus != LOADING');
function visit335_288_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['287'][1].init(26, 27, '!waitingModules.contains(m)');
function visit334_287_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['286'][1].init(390, 19, 'modStatus != LOADED');
function visit333_286_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['283'][3].init(293, 22, 'modStatus === ATTACHED');
function visit332_283_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['283'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['283'][2].init(270, 19, 'modStatus === ERROR');
function visit331_283_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['283'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['283'][1].init(270, 45, 'modStatus === ERROR || modStatus === ATTACHED');
function visit330_283_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['277'][1].init(56, 8, 'cache[m]');
function visit329_277_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['275'][1].init(383, 19, 'i < modNames.length');
function visit328_275_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['273'][1].init(343, 11, 'cache || {}');
function visit327_273_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['270'][1].init(238, 9, 'ret || {}');
function visit326_270_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['243'][1].init(153, 7, '!mod.fn');
function visit325_243_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['235'][1].init(26, 9, '\'@DEBUG@\'');
function visit324_235_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['206'][1].init(26, 9, '\'@DEBUG@\'');
function visit323_206_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['179'][1].init(73, 8, '--i > -1');
function visit322_179_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['167'][1].init(18, 19, 'str1[i] !== str2[i]');
function visit321_167_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['166'][1].init(147, 5, 'i < l');
function visit320_166_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['156'][1].init(205, 9, 'ms.length');
function visit319_156_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['152'][1].init(22, 18, 'm.status == LOADED');
function visit318_152_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['133'][1].init(386, 2, 're');
function visit317_133_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['128'][1].init(52, 34, 'script.readyState == \'interactive\'');
function visit316_128_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['126'][1].init(189, 6, 'i >= 0');
function visit315_126_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['107'][1].init(18, 5, 'oldIE');
function visit314_107_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['92'][1].init(68, 5, 'oldIE');
function visit313_92_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['89'][1].init(14, 26, 'typeof name === \'function\'');
function visit312_89_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['46'][1].init(167, 5, 'oldIE');
function visit311_46_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['43'][1].init(57, 22, 'mod.getType() == \'css\'');
function visit310_43_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['41'][1].init(831, 11, '!rs.combine');
function visit309_41_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['27'][1].init(69, 17, 'mod && currentMod');
function visit308_27_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['16'][1].init(18, 10, '!(--count)');
function visit307_16_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['11'][1].init(22, 17, 'rss && rss.length');
function visit306_11_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['8'][2].init(56, 12, 'S.UA.ie < 10');
function visit305_8_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['8'][1].init(45, 23, 'S.UA.ie && S.UA.ie < 10');
function visit304_8_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/combo-loader.js'].functionData[0]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[8]++;
  var oldIE = visit304_8_1(S.UA.ie && visit305_8_2(S.UA.ie < 10));
  _$jscoverage['/loader/combo-loader.js'].lineData[10]++;
  function loadScripts(runtime, rss, callback, charset, timeout) {
    _$jscoverage['/loader/combo-loader.js'].functionData[1]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[11]++;
    var count = visit306_11_1(rss && rss.length), errorList = [], successList = [];
    _$jscoverage['/loader/combo-loader.js'].lineData[15]++;
    function complete() {
      _$jscoverage['/loader/combo-loader.js'].functionData[2]++;
      _$jscoverage['/loader/combo-loader.js'].lineData[16]++;
      if (visit307_16_1(!(--count))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[17]++;
        callback(successList, errorList);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[21]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[3]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[22]++;
  var mod;
  _$jscoverage['/loader/combo-loader.js'].lineData[23]++;
  var config = {
  timeout: timeout, 
  success: function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[4]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[26]++;
  successList.push(rs);
  _$jscoverage['/loader/combo-loader.js'].lineData[27]++;
  if (visit308_27_1(mod && currentMod)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[29]++;
    logger.debug('standard browser get mod name after load : ' + mod.name);
    _$jscoverage['/loader/combo-loader.js'].lineData[30]++;
    Utils.registerModule(runtime, mod.name, currentMod.fn, currentMod.config);
    _$jscoverage['/loader/combo-loader.js'].lineData[31]++;
    currentMod = undefined;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[33]++;
  complete();
}, 
  error: function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[5]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[36]++;
  errorList.push(rs);
  _$jscoverage['/loader/combo-loader.js'].lineData[37]++;
  complete();
}, 
  charset: charset};
  _$jscoverage['/loader/combo-loader.js'].lineData[41]++;
  if (visit309_41_1(!rs.combine)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[42]++;
    mod = rs.mods[0];
    _$jscoverage['/loader/combo-loader.js'].lineData[43]++;
    if (visit310_43_1(mod.getType() == 'css')) {
      _$jscoverage['/loader/combo-loader.js'].lineData[44]++;
      mod = undefined;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[46]++;
      if (visit311_46_1(oldIE)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[47]++;
        startLoadModName = mod.name;
        _$jscoverage['/loader/combo-loader.js'].lineData[48]++;
        startLoadModTime = S.now();
        _$jscoverage['/loader/combo-loader.js'].lineData[49]++;
        config.attrs = {
  'data-mod-name': mod.name};
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[54]++;
  S.Config.loadModsFn(rs, config);
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[58]++;
  var Loader = S.Loader, logger = S.getLogger('s/loader'), Status = Loader.Status, Utils = Loader.Utils, LOADING = Status.LOADING, LOADED = Status.LOADED, ERROR = Status.ERROR, groupTag = S.now(), ATTACHED = Status.ATTACHED;
  _$jscoverage['/loader/combo-loader.js'].lineData[68]++;
  ComboLoader.groupTag = groupTag;
  _$jscoverage['/loader/combo-loader.js'].lineData[77]++;
  function ComboLoader(runtime, waitingModules) {
    _$jscoverage['/loader/combo-loader.js'].functionData[6]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[78]++;
    S.mix(this, {
  runtime: runtime, 
  waitingModules: waitingModules});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[84]++;
  var currentMod;
  _$jscoverage['/loader/combo-loader.js'].lineData[85]++;
  var startLoadModName;
  _$jscoverage['/loader/combo-loader.js'].lineData[86]++;
  var startLoadModTime;
  _$jscoverage['/loader/combo-loader.js'].lineData[88]++;
  ComboLoader.add = function(name, fn, config, runtime) {
  _$jscoverage['/loader/combo-loader.js'].functionData[7]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[89]++;
  if (visit312_89_1(typeof name === 'function')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[90]++;
    config = fn;
    _$jscoverage['/loader/combo-loader.js'].lineData[91]++;
    fn = name;
    _$jscoverage['/loader/combo-loader.js'].lineData[92]++;
    if (visit313_92_1(oldIE)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[94]++;
      name = findModuleNameByInteractive();
      _$jscoverage['/loader/combo-loader.js'].lineData[96]++;
      Utils.registerModule(runtime, name, fn, config);
      _$jscoverage['/loader/combo-loader.js'].lineData[97]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[98]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[101]++;
      currentMod = {
  fn: fn, 
  config: config};
    }
  } else {
    _$jscoverage['/loader/combo-loader.js'].lineData[107]++;
    if (visit314_107_1(oldIE)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[108]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[109]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[111]++;
      currentMod = undefined;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[113]++;
    Utils.registerModule(runtime, name, fn, config);
  }
};
  _$jscoverage['/loader/combo-loader.js'].lineData[119]++;
  function findModuleNameByInteractive() {
    _$jscoverage['/loader/combo-loader.js'].functionData[8]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[120]++;
    var scripts = S.Env.host.document.getElementsByTagName('script'), re, i, name, script;
    _$jscoverage['/loader/combo-loader.js'].lineData[126]++;
    for (i = scripts.length - 1; visit315_126_1(i >= 0); i--) {
      _$jscoverage['/loader/combo-loader.js'].lineData[127]++;
      script = scripts[i];
      _$jscoverage['/loader/combo-loader.js'].lineData[128]++;
      if (visit316_128_1(script.readyState == 'interactive')) {
        _$jscoverage['/loader/combo-loader.js'].lineData[129]++;
        re = script;
        _$jscoverage['/loader/combo-loader.js'].lineData[130]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[133]++;
    if (visit317_133_1(re)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[134]++;
      name = re.getAttribute('data-mod-name');
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[141]++;
      logger.debug('can not find interactive script,time diff : ' + (S.now() - startLoadModTime));
      _$jscoverage['/loader/combo-loader.js'].lineData[142]++;
      logger.debug('old_ie get mod name from cache : ' + startLoadModName);
      _$jscoverage['/loader/combo-loader.js'].lineData[143]++;
      name = startLoadModName;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[145]++;
    return name;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[148]++;
  function debugRemoteModules(rss) {
    _$jscoverage['/loader/combo-loader.js'].functionData[9]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[149]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[10]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[150]++;
  var ms = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[151]++;
  S.each(rs.mods, function(m) {
  _$jscoverage['/loader/combo-loader.js'].functionData[11]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[152]++;
  if (visit318_152_1(m.status == LOADED)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[153]++;
    ms.push(m.name);
  }
});
  _$jscoverage['/loader/combo-loader.js'].lineData[156]++;
  if (visit319_156_1(ms.length)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[157]++;
    logger.info('load remote modules: "' + ms.join(', ') + '" from: "' + rs.fullpath + '"');
  }
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[162]++;
  function getCommonPrefix(str1, str2) {
    _$jscoverage['/loader/combo-loader.js'].functionData[12]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[163]++;
    str1 = str1.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[164]++;
    str2 = str2.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[165]++;
    var l = Math.min(str1.length, str2.length);
    _$jscoverage['/loader/combo-loader.js'].lineData[166]++;
    for (var i = 0; visit320_166_1(i < l); i++) {
      _$jscoverage['/loader/combo-loader.js'].lineData[167]++;
      if (visit321_167_1(str1[i] !== str2[i])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[168]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[171]++;
    return str1.slice(0, i).join('/') + '/';
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[176]++;
  function getHash(str) {
    _$jscoverage['/loader/combo-loader.js'].functionData[13]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[177]++;
    var hash = 5381, i;
    _$jscoverage['/loader/combo-loader.js'].lineData[179]++;
    for (i = str.length; visit322_179_1(--i > -1); ) {
      _$jscoverage['/loader/combo-loader.js'].lineData[180]++;
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[183]++;
    return hash + '';
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[186]++;
  S.augment(ComboLoader, {
  use: function(normalizedModNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[14]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[191]++;
  var self = this, allModNames, comboUrls, timeout = S.Config.timeout, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[197]++;
  allModNames = S.keys(self.calculate(normalizedModNames));
  _$jscoverage['/loader/combo-loader.js'].lineData[199]++;
  Utils.createModulesInfo(runtime, allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[201]++;
  comboUrls = self.getComboUrls(allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[204]++;
  S.each(comboUrls.css, function(cssOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[15]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[205]++;
  loadScripts(runtime, cssOne, function(success, error) {
  _$jscoverage['/loader/combo-loader.js'].functionData[16]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[206]++;
  if (visit323_206_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[207]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[210]++;
  S.each(success, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[17]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[211]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[18]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[212]++;
  Utils.registerModule(runtime, mod.getName(), S.noop);
  _$jscoverage['/loader/combo-loader.js'].lineData[214]++;
  mod.notifyAll();
});
});
  _$jscoverage['/loader/combo-loader.js'].lineData[218]++;
  S.each(error, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[19]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[219]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[20]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[220]++;
  var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[223]++;
  S.log(msg, 'error');
  _$jscoverage['/loader/combo-loader.js'].lineData[224]++;
  mod.status = ERROR;
  _$jscoverage['/loader/combo-loader.js'].lineData[226]++;
  mod.notifyAll();
});
});
}, cssOne.charset, timeout);
});
  _$jscoverage['/loader/combo-loader.js'].lineData[233]++;
  S.each(comboUrls['js'], function(jsOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[21]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[234]++;
  loadScripts(runtime, jsOne, function(success) {
  _$jscoverage['/loader/combo-loader.js'].functionData[22]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[235]++;
  if (visit324_235_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[236]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[239]++;
  S.each(jsOne, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[23]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[240]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[24]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[243]++;
  if (visit325_243_1(!mod.fn)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[244]++;
    var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
    _$jscoverage['/loader/combo-loader.js'].lineData[247]++;
    S.log(msg, 'error');
    _$jscoverage['/loader/combo-loader.js'].lineData[248]++;
    mod.status = ERROR;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[251]++;
  mod.notifyAll();
});
});
}, jsOne.charset, timeout);
});
}, 
  calculate: function(modNames, cache, ret) {
  _$jscoverage['/loader/combo-loader.js'].functionData[25]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[262]++;
  var i, m, mod, modStatus, self = this, waitingModules = self.waitingModules, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[270]++;
  ret = visit326_270_1(ret || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[273]++;
  cache = visit327_273_1(cache || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[275]++;
  for (i = 0; visit328_275_1(i < modNames.length); i++) {
    _$jscoverage['/loader/combo-loader.js'].lineData[276]++;
    m = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[277]++;
    if (visit329_277_1(cache[m])) {
      _$jscoverage['/loader/combo-loader.js'].lineData[278]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[280]++;
    cache[m] = 1;
    _$jscoverage['/loader/combo-loader.js'].lineData[281]++;
    mod = Utils.createModuleInfo(runtime, m);
    _$jscoverage['/loader/combo-loader.js'].lineData[282]++;
    modStatus = mod.status;
    _$jscoverage['/loader/combo-loader.js'].lineData[283]++;
    if (visit330_283_1(visit331_283_2(modStatus === ERROR) || visit332_283_3(modStatus === ATTACHED))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[284]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[286]++;
    if (visit333_286_1(modStatus != LOADED)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[287]++;
      if (visit334_287_1(!waitingModules.contains(m))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[288]++;
        if (visit335_288_1(modStatus != LOADING)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[289]++;
          mod.status = LOADING;
          _$jscoverage['/loader/combo-loader.js'].lineData[290]++;
          ret[m] = 1;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[292]++;
        mod.wait(function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[26]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[293]++;
  waitingModules.remove(mod.getName());
  _$jscoverage['/loader/combo-loader.js'].lineData[295]++;
  waitingModules.notifyAll();
});
        _$jscoverage['/loader/combo-loader.js'].lineData[297]++;
        waitingModules.add(m);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[300]++;
    self.calculate(mod.getNormalizedRequires(), cache, ret);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[303]++;
  return ret;
}, 
  getComboMods: function(modNames, comboPrefixes) {
  _$jscoverage['/loader/combo-loader.js'].functionData[27]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[310]++;
  var comboMods = {}, packageUri, runtime = this.runtime, i = 0, l = modNames.length, modName, mod, packageInfo, type, typedCombos, mods, tag, charset, packagePath, packageName, group, fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[319]++;
  for (; visit336_319_1(i < l); ++i) {
    _$jscoverage['/loader/combo-loader.js'].lineData[320]++;
    modName = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[321]++;
    mod = Utils.createModuleInfo(runtime, modName);
    _$jscoverage['/loader/combo-loader.js'].lineData[322]++;
    type = mod.getType();
    _$jscoverage['/loader/combo-loader.js'].lineData[323]++;
    fullpath = mod.getFullPath();
    _$jscoverage['/loader/combo-loader.js'].lineData[324]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/loader/combo-loader.js'].lineData[325]++;
    packageName = packageInfo.getName();
    _$jscoverage['/loader/combo-loader.js'].lineData[326]++;
    charset = packageInfo.getCharset();
    _$jscoverage['/loader/combo-loader.js'].lineData[327]++;
    tag = packageInfo.getTag();
    _$jscoverage['/loader/combo-loader.js'].lineData[328]++;
    group = packageInfo.getGroup();
    _$jscoverage['/loader/combo-loader.js'].lineData[329]++;
    packagePath = packageInfo.getPrefixUriForCombo();
    _$jscoverage['/loader/combo-loader.js'].lineData[330]++;
    packageUri = packageInfo.getPackageUri();
    _$jscoverage['/loader/combo-loader.js'].lineData[332]++;
    var comboName = packageName;
    _$jscoverage['/loader/combo-loader.js'].lineData[334]++;
    if (visit337_334_1((mod.canBeCombined = visit338_334_2(packageInfo.isCombine() && S.startsWith(fullpath, packagePath))) && group)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[337]++;
      comboName = group + '_' + charset + '_' + groupTag;
      _$jscoverage['/loader/combo-loader.js'].lineData[339]++;
      var groupPrefixUri;
      _$jscoverage['/loader/combo-loader.js'].lineData[340]++;
      if (visit339_340_1(groupPrefixUri = comboPrefixes[comboName])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[341]++;
        if (visit340_341_1(groupPrefixUri.isSameOriginAs(packageUri))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[342]++;
          groupPrefixUri.setPath(getCommonPrefix(groupPrefixUri.getPath(), packageUri.getPath()));
        } else {
          _$jscoverage['/loader/combo-loader.js'].lineData[345]++;
          comboName = packageName;
          _$jscoverage['/loader/combo-loader.js'].lineData[346]++;
          comboPrefixes[packageName] = packageUri;
        }
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[349]++;
        comboPrefixes[comboName] = packageUri.clone();
      }
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[352]++;
      comboPrefixes[packageName] = packageUri;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[355]++;
    typedCombos = comboMods[type] = visit341_355_1(comboMods[type] || {});
    _$jscoverage['/loader/combo-loader.js'].lineData[356]++;
    if (visit342_356_1(!(mods = typedCombos[comboName]))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[357]++;
      mods = typedCombos[comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[358]++;
      mods.charset = charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[359]++;
      mods.tags = [tag];
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[361]++;
      if (visit343_361_1(visit344_361_2(mods.tags.length == 1) && visit345_361_3(mods.tags[0] == tag))) {
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[364]++;
        mods.tags.push(tag);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[367]++;
    mods.push(mod);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[370]++;
  return comboMods;
}, 
  getComboUrls: function(modNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[28]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[377]++;
  var runtime = this.runtime, Config = runtime.Config, comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/loader/combo-loader.js'].lineData[384]++;
  var comboPrefixes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[386]++;
  var comboMods = this.getComboMods(modNames, comboPrefixes);
  _$jscoverage['/loader/combo-loader.js'].lineData[388]++;
  var comboRes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[391]++;
  for (var type in comboMods) {
    _$jscoverage['/loader/combo-loader.js'].lineData[392]++;
    comboRes[type] = {};
    _$jscoverage['/loader/combo-loader.js'].lineData[393]++;
    for (var comboName in comboMods[type]) {
      _$jscoverage['/loader/combo-loader.js'].lineData[394]++;
      var currentComboUrls = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[395]++;
      var currentComboMods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[396]++;
      var mods = comboMods[type][comboName];
      _$jscoverage['/loader/combo-loader.js'].lineData[397]++;
      var tags = mods.tags;
      _$jscoverage['/loader/combo-loader.js'].lineData[398]++;
      var tag = visit346_398_1(tags.length > 1) ? getHash(tags.join('')) : tags[0];
      _$jscoverage['/loader/combo-loader.js'].lineData[400]++;
      var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''), suffixLength = suffix.length, basePrefix = comboPrefixes[comboName].toString(), baseLen = basePrefix.length, prefix = basePrefix + comboPrefix, res = comboRes[type][comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[407]++;
      var l = prefix.length;
      _$jscoverage['/loader/combo-loader.js'].lineData[408]++;
      res.charset = mods.charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[409]++;
      res.mods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[411]++;
      function pushComboUrl() {
        _$jscoverage['/loader/combo-loader.js'].functionData[29]++;
        _$jscoverage['/loader/combo-loader.js'].lineData[414]++;
        res.push({
  combine: 1, 
  fullpath: Utils.getMappedPath(runtime, prefix + currentComboUrls.join(comboSep) + suffix, Config.mappedComboRules), 
  mods: currentComboMods});
      }      _$jscoverage['/loader/combo-loader.js'].lineData[423]++;
      for (var i = 0; visit347_423_1(i < mods.length); i++) {
        _$jscoverage['/loader/combo-loader.js'].lineData[424]++;
        var currentMod = mods[i];
        _$jscoverage['/loader/combo-loader.js'].lineData[425]++;
        res.mods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[427]++;
        var fullpath = currentMod.getFullPath();
        _$jscoverage['/loader/combo-loader.js'].lineData[428]++;
        if (visit348_428_1(!currentMod.canBeCombined)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[429]++;
          res.push({
  combine: 0, 
  fullpath: fullpath, 
  mods: [currentMod]});
          _$jscoverage['/loader/combo-loader.js'].lineData[434]++;
          continue;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[437]++;
        var path = fullpath.slice(baseLen).replace(/\?.*$/, '');
        _$jscoverage['/loader/combo-loader.js'].lineData[438]++;
        currentComboUrls.push(path);
        _$jscoverage['/loader/combo-loader.js'].lineData[439]++;
        currentComboMods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[441]++;
        if (visit349_441_1(visit350_441_2(currentComboUrls.length > maxFileNum) || (visit351_442_1(l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[443]++;
          currentComboUrls.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[444]++;
          currentComboMods.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[445]++;
          pushComboUrl();
          _$jscoverage['/loader/combo-loader.js'].lineData[446]++;
          currentComboUrls = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[447]++;
          currentComboMods = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[448]++;
          i--;
        }
      }
      _$jscoverage['/loader/combo-loader.js'].lineData[451]++;
      if (visit352_451_1(currentComboUrls.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[452]++;
        pushComboUrl();
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[456]++;
  return comboRes;
}});
  _$jscoverage['/loader/combo-loader.js'].lineData[460]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
