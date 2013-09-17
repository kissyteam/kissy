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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[13] = 0;
  _$jscoverage['/base.js'].lineData[14] = 0;
  _$jscoverage['/base.js'].lineData[17] = 0;
  _$jscoverage['/base.js'].lineData[18] = 0;
  _$jscoverage['/base.js'].lineData[21] = 0;
  _$jscoverage['/base.js'].lineData[22] = 0;
  _$jscoverage['/base.js'].lineData[23] = 0;
  _$jscoverage['/base.js'].lineData[24] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[35] = 0;
  _$jscoverage['/base.js'].lineData[36] = 0;
  _$jscoverage['/base.js'].lineData[37] = 0;
  _$jscoverage['/base.js'].lineData[39] = 0;
  _$jscoverage['/base.js'].lineData[55] = 0;
  _$jscoverage['/base.js'].lineData[56] = 0;
  _$jscoverage['/base.js'].lineData[58] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[62] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[73] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[78] = 0;
  _$jscoverage['/base.js'].lineData[79] = 0;
  _$jscoverage['/base.js'].lineData[81] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[88] = 0;
  _$jscoverage['/base.js'].lineData[96] = 0;
  _$jscoverage['/base.js'].lineData[100] = 0;
  _$jscoverage['/base.js'].lineData[101] = 0;
  _$jscoverage['/base.js'].lineData[102] = 0;
  _$jscoverage['/base.js'].lineData[103] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[107] = 0;
  _$jscoverage['/base.js'].lineData[109] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[123] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[135] = 0;
  _$jscoverage['/base.js'].lineData[136] = 0;
  _$jscoverage['/base.js'].lineData[137] = 0;
  _$jscoverage['/base.js'].lineData[139] = 0;
  _$jscoverage['/base.js'].lineData[149] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[157] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[164] = 0;
  _$jscoverage['/base.js'].lineData[165] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[167] = 0;
  _$jscoverage['/base.js'].lineData[169] = 0;
  _$jscoverage['/base.js'].lineData[171] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[189] = 0;
  _$jscoverage['/base.js'].lineData[190] = 0;
  _$jscoverage['/base.js'].lineData[191] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[223] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[225] = 0;
  _$jscoverage['/base.js'].lineData[230] = 0;
  _$jscoverage['/base.js'].lineData[231] = 0;
  _$jscoverage['/base.js'].lineData[235] = 0;
  _$jscoverage['/base.js'].lineData[236] = 0;
  _$jscoverage['/base.js'].lineData[245] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[248] = 0;
  _$jscoverage['/base.js'].lineData[249] = 0;
  _$jscoverage['/base.js'].lineData[250] = 0;
  _$jscoverage['/base.js'].lineData[251] = 0;
  _$jscoverage['/base.js'].lineData[253] = 0;
  _$jscoverage['/base.js'].lineData[255] = 0;
  _$jscoverage['/base.js'].lineData[261] = 0;
  _$jscoverage['/base.js'].lineData[262] = 0;
  _$jscoverage['/base.js'].lineData[263] = 0;
  _$jscoverage['/base.js'].lineData[264] = 0;
  _$jscoverage['/base.js'].lineData[265] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[267] = 0;
  _$jscoverage['/base.js'].lineData[272] = 0;
  _$jscoverage['/base.js'].lineData[342] = 0;
  _$jscoverage['/base.js'].lineData[345] = 0;
  _$jscoverage['/base.js'].lineData[346] = 0;
  _$jscoverage['/base.js'].lineData[347] = 0;
  _$jscoverage['/base.js'].lineData[349] = 0;
  _$jscoverage['/base.js'].lineData[351] = 0;
  _$jscoverage['/base.js'].lineData[352] = 0;
  _$jscoverage['/base.js'].lineData[353] = 0;
  _$jscoverage['/base.js'].lineData[354] = 0;
  _$jscoverage['/base.js'].lineData[355] = 0;
  _$jscoverage['/base.js'].lineData[359] = 0;
  _$jscoverage['/base.js'].lineData[360] = 0;
  _$jscoverage['/base.js'].lineData[363] = 0;
  _$jscoverage['/base.js'].lineData[364] = 0;
  _$jscoverage['/base.js'].lineData[368] = 0;
  _$jscoverage['/base.js'].lineData[370] = 0;
  _$jscoverage['/base.js'].lineData[371] = 0;
  _$jscoverage['/base.js'].lineData[372] = 0;
  _$jscoverage['/base.js'].lineData[374] = 0;
  _$jscoverage['/base.js'].lineData[375] = 0;
  _$jscoverage['/base.js'].lineData[376] = 0;
  _$jscoverage['/base.js'].lineData[378] = 0;
  _$jscoverage['/base.js'].lineData[379] = 0;
  _$jscoverage['/base.js'].lineData[380] = 0;
  _$jscoverage['/base.js'].lineData[382] = 0;
  _$jscoverage['/base.js'].lineData[383] = 0;
  _$jscoverage['/base.js'].lineData[385] = 0;
  _$jscoverage['/base.js'].lineData[387] = 0;
  _$jscoverage['/base.js'].lineData[389] = 0;
  _$jscoverage['/base.js'].lineData[390] = 0;
  _$jscoverage['/base.js'].lineData[394] = 0;
  _$jscoverage['/base.js'].lineData[395] = 0;
  _$jscoverage['/base.js'].lineData[405] = 0;
  _$jscoverage['/base.js'].lineData[406] = 0;
  _$jscoverage['/base.js'].lineData[407] = 0;
  _$jscoverage['/base.js'].lineData[410] = 0;
  _$jscoverage['/base.js'].lineData[412] = 0;
  _$jscoverage['/base.js'].lineData[414] = 0;
  _$jscoverage['/base.js'].lineData[415] = 0;
  _$jscoverage['/base.js'].lineData[420] = 0;
  _$jscoverage['/base.js'].lineData[421] = 0;
  _$jscoverage['/base.js'].lineData[422] = 0;
  _$jscoverage['/base.js'].lineData[424] = 0;
  _$jscoverage['/base.js'].lineData[425] = 0;
  _$jscoverage['/base.js'].lineData[426] = 0;
  _$jscoverage['/base.js'].lineData[430] = 0;
  _$jscoverage['/base.js'].lineData[431] = 0;
  _$jscoverage['/base.js'].lineData[432] = 0;
  _$jscoverage['/base.js'].lineData[433] = 0;
  _$jscoverage['/base.js'].lineData[460] = 0;
  _$jscoverage['/base.js'].lineData[461] = 0;
  _$jscoverage['/base.js'].lineData[464] = 0;
  _$jscoverage['/base.js'].lineData[465] = 0;
  _$jscoverage['/base.js'].lineData[466] = 0;
  _$jscoverage['/base.js'].lineData[470] = 0;
  _$jscoverage['/base.js'].lineData[471] = 0;
  _$jscoverage['/base.js'].lineData[472] = 0;
  _$jscoverage['/base.js'].lineData[480] = 0;
  _$jscoverage['/base.js'].lineData[485] = 0;
  _$jscoverage['/base.js'].lineData[486] = 0;
  _$jscoverage['/base.js'].lineData[487] = 0;
  _$jscoverage['/base.js'].lineData[489] = 0;
  _$jscoverage['/base.js'].lineData[494] = 0;
  _$jscoverage['/base.js'].lineData[495] = 0;
  _$jscoverage['/base.js'].lineData[496] = 0;
  _$jscoverage['/base.js'].lineData[497] = 0;
  _$jscoverage['/base.js'].lineData[498] = 0;
  _$jscoverage['/base.js'].lineData[503] = 0;
  _$jscoverage['/base.js'].lineData[504] = 0;
  _$jscoverage['/base.js'].lineData[505] = 0;
  _$jscoverage['/base.js'].lineData[509] = 0;
  _$jscoverage['/base.js'].lineData[510] = 0;
  _$jscoverage['/base.js'].lineData[511] = 0;
  _$jscoverage['/base.js'].lineData[512] = 0;
  _$jscoverage['/base.js'].lineData[513] = 0;
  _$jscoverage['/base.js'].lineData[517] = 0;
  _$jscoverage['/base.js'].lineData[518] = 0;
  _$jscoverage['/base.js'].lineData[519] = 0;
  _$jscoverage['/base.js'].lineData[522] = 0;
  _$jscoverage['/base.js'].lineData[523] = 0;
  _$jscoverage['/base.js'].lineData[524] = 0;
  _$jscoverage['/base.js'].lineData[525] = 0;
  _$jscoverage['/base.js'].lineData[526] = 0;
  _$jscoverage['/base.js'].lineData[527] = 0;
  _$jscoverage['/base.js'].lineData[528] = 0;
  _$jscoverage['/base.js'].lineData[529] = 0;
  _$jscoverage['/base.js'].lineData[530] = 0;
  _$jscoverage['/base.js'].lineData[531] = 0;
  _$jscoverage['/base.js'].lineData[532] = 0;
  _$jscoverage['/base.js'].lineData[533] = 0;
  _$jscoverage['/base.js'].lineData[534] = 0;
  _$jscoverage['/base.js'].lineData[535] = 0;
  _$jscoverage['/base.js'].lineData[537] = 0;
  _$jscoverage['/base.js'].lineData[538] = 0;
  _$jscoverage['/base.js'].lineData[540] = 0;
  _$jscoverage['/base.js'].lineData[541] = 0;
  _$jscoverage['/base.js'].lineData[546] = 0;
  _$jscoverage['/base.js'].lineData[547] = 0;
  _$jscoverage['/base.js'].lineData[550] = 0;
  _$jscoverage['/base.js'].lineData[551] = 0;
  _$jscoverage['/base.js'].lineData[552] = 0;
  _$jscoverage['/base.js'].lineData[557] = 0;
  _$jscoverage['/base.js'].lineData[558] = 0;
  _$jscoverage['/base.js'].lineData[559] = 0;
  _$jscoverage['/base.js'].lineData[560] = 0;
  _$jscoverage['/base.js'].lineData[561] = 0;
  _$jscoverage['/base.js'].lineData[566] = 0;
  _$jscoverage['/base.js'].lineData[567] = 0;
  _$jscoverage['/base.js'].lineData[573] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
  _$jscoverage['/base.js'].functionData[17] = 0;
  _$jscoverage['/base.js'].functionData[18] = 0;
  _$jscoverage['/base.js'].functionData[19] = 0;
  _$jscoverage['/base.js'].functionData[20] = 0;
  _$jscoverage['/base.js'].functionData[21] = 0;
  _$jscoverage['/base.js'].functionData[22] = 0;
  _$jscoverage['/base.js'].functionData[23] = 0;
  _$jscoverage['/base.js'].functionData[24] = 0;
  _$jscoverage['/base.js'].functionData[25] = 0;
  _$jscoverage['/base.js'].functionData[26] = 0;
  _$jscoverage['/base.js'].functionData[27] = 0;
  _$jscoverage['/base.js'].functionData[28] = 0;
  _$jscoverage['/base.js'].functionData[29] = 0;
  _$jscoverage['/base.js'].functionData[30] = 0;
  _$jscoverage['/base.js'].functionData[31] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['25'] = [];
  _$jscoverage['/base.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['31'] = [];
  _$jscoverage['/base.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['32'] = [];
  _$jscoverage['/base.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['36'] = [];
  _$jscoverage['/base.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['100'] = [];
  _$jscoverage['/base.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['106'] = [];
  _$jscoverage['/base.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['113'] = [];
  _$jscoverage['/base.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['118'] = [];
  _$jscoverage['/base.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['123'] = [];
  _$jscoverage['/base.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['137'] = [];
  _$jscoverage['/base.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['157'] = [];
  _$jscoverage['/base.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['163'] = [];
  _$jscoverage['/base.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['164'] = [];
  _$jscoverage['/base.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['166'] = [];
  _$jscoverage['/base.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['171'] = [];
  _$jscoverage['/base.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['174'] = [];
  _$jscoverage['/base.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['174'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['175'] = [];
  _$jscoverage['/base.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['190'] = [];
  _$jscoverage['/base.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['194'] = [];
  _$jscoverage['/base.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['210'] = [];
  _$jscoverage['/base.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['214'] = [];
  _$jscoverage['/base.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['215'] = [];
  _$jscoverage['/base.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['217'] = [];
  _$jscoverage['/base.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['217'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['218'] = [];
  _$jscoverage['/base.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['223'] = [];
  _$jscoverage['/base.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['230'] = [];
  _$jscoverage['/base.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['248'] = [];
  _$jscoverage['/base.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['248'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['249'] = [];
  _$jscoverage['/base.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['262'] = [];
  _$jscoverage['/base.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['345'] = [];
  _$jscoverage['/base.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['351'] = [];
  _$jscoverage['/base.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['352'] = [];
  _$jscoverage['/base.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['354'] = [];
  _$jscoverage['/base.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['359'] = [];
  _$jscoverage['/base.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['371'] = [];
  _$jscoverage['/base.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['375'] = [];
  _$jscoverage['/base.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['378'] = [];
  _$jscoverage['/base.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['379'] = [];
  _$jscoverage['/base.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['379'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['382'] = [];
  _$jscoverage['/base.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['389'] = [];
  _$jscoverage['/base.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['395'] = [];
  _$jscoverage['/base.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['406'] = [];
  _$jscoverage['/base.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['414'] = [];
  _$jscoverage['/base.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['424'] = [];
  _$jscoverage['/base.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['432'] = [];
  _$jscoverage['/base.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['464'] = [];
  _$jscoverage['/base.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['471'] = [];
  _$jscoverage['/base.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['486'] = [];
  _$jscoverage['/base.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['497'] = [];
  _$jscoverage['/base.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['511'] = [];
  _$jscoverage['/base.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['513'] = [];
  _$jscoverage['/base.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['518'] = [];
  _$jscoverage['/base.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['523'] = [];
  _$jscoverage['/base.js'].branchData['523'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['525'] = [];
  _$jscoverage['/base.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['534'] = [];
  _$jscoverage['/base.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['537'] = [];
  _$jscoverage['/base.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['550'] = [];
  _$jscoverage['/base.js'].branchData['550'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['551'] = [];
  _$jscoverage['/base.js'].branchData['551'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['552'] = [];
  _$jscoverage['/base.js'].branchData['552'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['559'] = [];
  _$jscoverage['/base.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['559'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['560'] = [];
  _$jscoverage['/base.js'].branchData['560'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['561'] = [];
  _$jscoverage['/base.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['566'] = [];
  _$jscoverage['/base.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['567'] = [];
  _$jscoverage['/base.js'].branchData['567'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['567'][1].init(37, 10, 'args || []');
function visit126_567_1(result) {
  _$jscoverage['/base.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['566'][1].init(220, 2, 'fn');
function visit125_566_1(result) {
  _$jscoverage['/base.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['561'][1].init(27, 170, 'extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method])');
function visit124_561_1(result) {
  _$jscoverage['/base.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['560'][1].init(30, 7, 'i < len');
function visit123_560_1(result) {
  _$jscoverage['/base.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['559'][2].init(38, 31, 'extensions && extensions.length');
function visit122_559_2(result) {
  _$jscoverage['/base.js'].branchData['559'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['559'][1].init(32, 37, 'len = extensions && extensions.length');
function visit121_559_1(result) {
  _$jscoverage['/base.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['552'][1].init(18, 46, 'plugins[i][method] && plugins[i][method](self)');
function visit120_552_1(result) {
  _$jscoverage['/base.js'].branchData['552'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['551'][1].init(30, 7, 'i < len');
function visit119_551_1(result) {
  _$jscoverage['/base.js'].branchData['551'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['550'][1].init(102, 20, 'len = plugins.length');
function visit118_550_1(result) {
  _$jscoverage['/base.js'].branchData['550'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['537'][1].init(568, 7, 'wrapped');
function visit117_537_1(result) {
  _$jscoverage['/base.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['534'][1].init(478, 13, 'v.__wrapped__');
function visit116_534_1(result) {
  _$jscoverage['/base.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['525'][1].init(56, 11, 'v.__owner__');
function visit115_525_1(result) {
  _$jscoverage['/base.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['523'][1].init(18, 22, 'typeof v == \'function\'');
function visit114_523_1(result) {
  _$jscoverage['/base.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['518'][1].init(18, 7, 'p in px');
function visit113_518_1(result) {
  _$jscoverage['/base.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['513'][1].init(26, 13, 'px[p] || noop');
function visit112_513_1(result) {
  _$jscoverage['/base.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['511'][1].init(65, 17, 'extensions.length');
function visit111_511_1(result) {
  _$jscoverage['/base.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['497'][1].init(18, 28, 'typeof plugin === \'function\'');
function visit110_497_1(result) {
  _$jscoverage['/base.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['486'][1].init(14, 6, 'config');
function visit109_486_1(result) {
  _$jscoverage['/base.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['471'][1].init(14, 5, 'attrs');
function visit108_471_1(result) {
  _$jscoverage['/base.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['464'][1].init(89, 16, 'e.target == self');
function visit107_464_1(result) {
  _$jscoverage['/base.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['432'][1].init(72, 24, 'SubClass.__hooks__ || {}');
function visit106_432_1(result) {
  _$jscoverage['/base.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['424'][1].init(3600, 25, 'SubClass.extend || extend');
function visit105_424_1(result) {
  _$jscoverage['/base.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['414'][1].init(96, 21, 'exp.hasOwnProperty(p)');
function visit104_414_1(result) {
  _$jscoverage['/base.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['406'][1].init(53, 17, 'attrs[name] || {}');
function visit103_406_1(result) {
  _$jscoverage['/base.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['395'][1].init(26, 3, 'ext');
function visit102_395_1(result) {
  _$jscoverage['/base.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['389'][1].init(2020, 17, 'extensions.length');
function visit101_389_1(result) {
  _$jscoverage['/base.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['382'][1].init(1763, 16, 'inheritedStatics');
function visit100_382_1(result) {
  _$jscoverage['/base.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['379'][2].init(1618, 43, 'inheritedStatics !== sx[\'inheritedStatics\']');
function visit99_379_2(result) {
  _$jscoverage['/base.js'].branchData['379'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['379'][1].init(1592, 69, 'sx[\'inheritedStatics\'] && inheritedStatics !== sx[\'inheritedStatics\']');
function visit98_379_1(result) {
  _$jscoverage['/base.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['378'][1].init(1521, 52, 'sp[\'__inheritedStatics__\'] || sx[\'inheritedStatics\']');
function visit97_378_1(result) {
  _$jscoverage['/base.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['375'][1].init(1350, 18, 'sx.__hooks__ || {}');
function visit96_375_1(result) {
  _$jscoverage['/base.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['371'][1].init(1168, 5, 'hooks');
function visit95_371_1(result) {
  _$jscoverage['/base.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['359'][1].init(153, 9, '\'@DEBUG@\'');
function visit94_359_1(result) {
  _$jscoverage['/base.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['354'][1].init(406, 32, 'px.hasOwnProperty(\'constructor\')');
function visit93_354_1(result) {
  _$jscoverage['/base.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['352'][1].init(332, 24, 'sx.name || \'BaseDerived\'');
function visit92_352_1(result) {
  _$jscoverage['/base.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['351'][1].init(302, 8, 'sx || {}');
function visit91_351_1(result) {
  _$jscoverage['/base.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['345'][1].init(104, 22, '!S.isArray(extensions)');
function visit90_345_1(result) {
  _$jscoverage['/base.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['262'][1].init(48, 22, '!self.get(\'destroyed\')');
function visit89_262_1(result) {
  _$jscoverage['/base.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['249'][1].init(144, 14, 'pluginId == id');
function visit88_249_1(result) {
  _$jscoverage['/base.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['248'][2].init(81, 26, 'p.get && p.get(\'pluginId\')');
function visit87_248_2(result) {
  _$jscoverage['/base.js'].branchData['248'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['248'][1].init(81, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit86_248_1(result) {
  _$jscoverage['/base.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['230'][1].init(658, 5, '!keep');
function visit85_230_1(result) {
  _$jscoverage['/base.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['223'][1].init(30, 11, 'p != plugin');
function visit84_223_1(result) {
  _$jscoverage['/base.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['218'][1].init(164, 18, 'pluginId != plugin');
function visit83_218_1(result) {
  _$jscoverage['/base.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['217'][2].init(93, 26, 'p.get && p.get(\'pluginId\')');
function visit82_217_2(result) {
  _$jscoverage['/base.js'].branchData['217'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['217'][1].init(93, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit81_217_1(result) {
  _$jscoverage['/base.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['215'][1].init(26, 8, 'isString');
function visit80_215_1(result) {
  _$jscoverage['/base.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['214'][1].init(63, 6, 'plugin');
function visit79_214_1(result) {
  _$jscoverage['/base.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['210'][1].init(75, 25, 'typeof plugin == \'string\'');
function visit78_210_1(result) {
  _$jscoverage['/base.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['194'][1].init(186, 27, 'plugin[\'pluginInitializer\']');
function visit77_194_1(result) {
  _$jscoverage['/base.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['190'][1].init(48, 28, 'typeof plugin === \'function\'');
function visit76_190_1(result) {
  _$jscoverage['/base.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['175'][1].init(64, 55, '(attributeValue = self.get(attributeName)) !== undefined');
function visit75_175_1(result) {
  _$jscoverage['/base.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['174'][2].init(435, 31, 'attrs[attributeName].sync !== 0');
function visit74_174_2(result) {
  _$jscoverage['/base.js'].branchData['174'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['174'][1].init(177, 120, 'attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit73_174_1(result) {
  _$jscoverage['/base.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['171'][1].init(255, 298, '(onSetMethod = self[onSetMethodName]) && attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit72_171_1(result) {
  _$jscoverage['/base.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['166'][1].init(26, 22, 'attributeName in attrs');
function visit71_166_1(result) {
  _$jscoverage['/base.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['164'][1].init(30, 17, 'cs[i].ATTRS || {}');
function visit70_164_1(result) {
  _$jscoverage['/base.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['163'][1].init(394, 13, 'i < cs.length');
function visit69_163_1(result) {
  _$jscoverage['/base.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['157'][1].init(51, 40, 'c.superclass && c.superclass.constructor');
function visit68_157_1(result) {
  _$jscoverage['/base.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['137'][1].init(67, 7, 'self[m]');
function visit67_137_1(result) {
  _$jscoverage['/base.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['123'][1].init(1034, 10, 'args || []');
function visit66_123_1(result) {
  _$jscoverage['/base.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['118'][1].init(829, 7, '!member');
function visit65_118_1(result) {
  _$jscoverage['/base.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['113'][1].init(570, 5, '!name');
function visit64_113_1(result) {
  _$jscoverage['/base.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['106'][1].init(73, 18, 'method.__wrapped__');
function visit63_106_1(result) {
  _$jscoverage['/base.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['100'][2].init(115, 25, 'typeof self == \'function\'');
function visit62_100_2(result) {
  _$jscoverage['/base.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['100'][1].init(115, 42, 'typeof self == \'function\' && self.__name__');
function visit61_100_1(result) {
  _$jscoverage['/base.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['36'][1].init(545, 7, 'reverse');
function visit60_36_1(result) {
  _$jscoverage['/base.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['32'][1].init(375, 7, 'reverse');
function visit59_32_1(result) {
  _$jscoverage['/base.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['31'][1].init(305, 47, 'arguments.callee.__owner__.__extensions__ || []');
function visit58_31_1(result) {
  _$jscoverage['/base.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['25'][1].init(56, 7, 'reverse');
function visit57_25_1(result) {
  _$jscoverage['/base.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add('base', function(S, Attribute, CustomEvent) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var ATTRS = 'ATTRS', ucfirst = S.ucfirst, ON_SET = '_onSet', noop = S.noop, RE_DASH = /(?:^|-)([a-z])/ig;
  _$jscoverage['/base.js'].lineData[13]++;
  function replaceToUpper() {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[14]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/base.js'].lineData[17]++;
  function CamelCase(name) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[18]++;
    return name.replace(RE_DASH, replaceToUpper);
  }
  _$jscoverage['/base.js'].lineData[21]++;
  function __getHook(method, reverse) {
    _$jscoverage['/base.js'].functionData[3]++;
    _$jscoverage['/base.js'].lineData[22]++;
    return function(origFn) {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[23]++;
  return function wrap() {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[24]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[25]++;
  if (visit57_25_1(reverse)) {
    _$jscoverage['/base.js'].lineData[26]++;
    origFn.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[28]++;
    self.callSuper.apply(self, arguments);
  }
  _$jscoverage['/base.js'].lineData[31]++;
  var extensions = visit58_31_1(arguments.callee.__owner__.__extensions__ || []);
  _$jscoverage['/base.js'].lineData[32]++;
  if (visit59_32_1(reverse)) {
    _$jscoverage['/base.js'].lineData[33]++;
    extensions.reverse();
  }
  _$jscoverage['/base.js'].lineData[35]++;
  callExtensionsMethod(self, extensions, method, arguments);
  _$jscoverage['/base.js'].lineData[36]++;
  if (visit60_36_1(reverse)) {
    _$jscoverage['/base.js'].lineData[37]++;
    self.callSuper.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[39]++;
    origFn.apply(self, arguments);
  }
};
};
  }
  _$jscoverage['/base.js'].lineData[55]++;
  function Base(config) {
    _$jscoverage['/base.js'].functionData[6]++;
    _$jscoverage['/base.js'].lineData[56]++;
    var self = this, c = self.constructor;
    _$jscoverage['/base.js'].lineData[58]++;
    Base.superclass.constructor.apply(this, arguments);
    _$jscoverage['/base.js'].lineData[59]++;
    self.__attrs = {};
    _$jscoverage['/base.js'].lineData[60]++;
    self.__attrVals = {};
    _$jscoverage['/base.js'].lineData[62]++;
    self.userConfig = config;
    _$jscoverage['/base.js'].lineData[64]++;
    while (c) {
      _$jscoverage['/base.js'].lineData[65]++;
      addAttrs(self, c[ATTRS]);
      _$jscoverage['/base.js'].lineData[66]++;
      c = c.superclass ? c.superclass.constructor : null;
    }
    _$jscoverage['/base.js'].lineData[69]++;
    initAttrs(self, config);
    _$jscoverage['/base.js'].lineData[71]++;
    var listeners = self.get("listeners");
    _$jscoverage['/base.js'].lineData[72]++;
    for (var n in listeners) {
      _$jscoverage['/base.js'].lineData[73]++;
      self.on(n, listeners[n]);
    }
    _$jscoverage['/base.js'].lineData[76]++;
    self.initializer();
    _$jscoverage['/base.js'].lineData[78]++;
    constructPlugins(self);
    _$jscoverage['/base.js'].lineData[79]++;
    callPluginsMethod.call(self, 'pluginInitializer');
    _$jscoverage['/base.js'].lineData[81]++;
    self.bindInternal();
    _$jscoverage['/base.js'].lineData[83]++;
    self.syncInternal();
  }
  _$jscoverage['/base.js'].lineData[86]++;
  S.augment(Base, Attribute);
  _$jscoverage['/base.js'].lineData[88]++;
  S.extend(Base, CustomEvent.Target, {
  initializer: noop, 
  '__getHook': __getHook, 
  __callPluginsMethod: callPluginsMethod, 
  'callSuper': function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[96]++;
  var method, obj, self = this, args = arguments;
  _$jscoverage['/base.js'].lineData[100]++;
  if (visit61_100_1(visit62_100_2(typeof self == 'function') && self.__name__)) {
    _$jscoverage['/base.js'].lineData[101]++;
    method = self;
    _$jscoverage['/base.js'].lineData[102]++;
    obj = args[0];
    _$jscoverage['/base.js'].lineData[103]++;
    args = Array.prototype.slice.call(args, 1);
  } else {
    _$jscoverage['/base.js'].lineData[105]++;
    method = arguments.callee.caller;
    _$jscoverage['/base.js'].lineData[106]++;
    if (visit63_106_1(method.__wrapped__)) {
      _$jscoverage['/base.js'].lineData[107]++;
      method = method.caller;
    }
    _$jscoverage['/base.js'].lineData[109]++;
    obj = self;
  }
  _$jscoverage['/base.js'].lineData[112]++;
  var name = method.__name__;
  _$jscoverage['/base.js'].lineData[113]++;
  if (visit64_113_1(!name)) {
    _$jscoverage['/base.js'].lineData[115]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[117]++;
  var member = method.__owner__.superclass[name];
  _$jscoverage['/base.js'].lineData[118]++;
  if (visit65_118_1(!member)) {
    _$jscoverage['/base.js'].lineData[120]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[123]++;
  return member.apply(obj, visit66_123_1(args || []));
}, 
  bindInternal: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[131]++;
  var self = this, attrs = self['getAttrs'](), attr, m;
  _$jscoverage['/base.js'].lineData[135]++;
  for (attr in attrs) {
    _$jscoverage['/base.js'].lineData[136]++;
    m = ON_SET + ucfirst(attr);
    _$jscoverage['/base.js'].lineData[137]++;
    if (visit67_137_1(self[m])) {
      _$jscoverage['/base.js'].lineData[139]++;
      self.on('after' + ucfirst(attr) + 'Change', onSetAttrChange);
    }
  }
}, 
  syncInternal: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[149]++;
  var self = this, cs = [], i, c = self.constructor, attrs = self.getAttrs();
  _$jscoverage['/base.js'].lineData[155]++;
  while (c) {
    _$jscoverage['/base.js'].lineData[156]++;
    cs.push(c);
    _$jscoverage['/base.js'].lineData[157]++;
    c = visit68_157_1(c.superclass && c.superclass.constructor);
  }
  _$jscoverage['/base.js'].lineData[160]++;
  cs.reverse();
  _$jscoverage['/base.js'].lineData[163]++;
  for (i = 0; visit69_163_1(i < cs.length); i++) {
    _$jscoverage['/base.js'].lineData[164]++;
    var ATTRS = visit70_164_1(cs[i].ATTRS || {});
    _$jscoverage['/base.js'].lineData[165]++;
    for (var attributeName in ATTRS) {
      _$jscoverage['/base.js'].lineData[166]++;
      if (visit71_166_1(attributeName in attrs)) {
        _$jscoverage['/base.js'].lineData[167]++;
        var attributeValue, onSetMethod;
        _$jscoverage['/base.js'].lineData[169]++;
        var onSetMethodName = ON_SET + ucfirst(attributeName);
        _$jscoverage['/base.js'].lineData[171]++;
        if (visit72_171_1((onSetMethod = self[onSetMethodName]) && visit73_174_1(visit74_174_2(attrs[attributeName].sync !== 0) && visit75_175_1((attributeValue = self.get(attributeName)) !== undefined)))) {
          _$jscoverage['/base.js'].lineData[176]++;
          onSetMethod.call(self, attributeValue);
        }
      }
    }
  }
}, 
  'plug': function(plugin) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[189]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[190]++;
  if (visit76_190_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[191]++;
    plugin = new plugin();
  }
  _$jscoverage['/base.js'].lineData[194]++;
  if (visit77_194_1(plugin['pluginInitializer'])) {
    _$jscoverage['/base.js'].lineData[195]++;
    plugin['pluginInitializer'](self);
  }
  _$jscoverage['/base.js'].lineData[197]++;
  self.get('plugins').push(plugin);
  _$jscoverage['/base.js'].lineData[198]++;
  return self;
}, 
  'unplug': function(plugin) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[208]++;
  var plugins = [], self = this, isString = visit78_210_1(typeof plugin == 'string');
  _$jscoverage['/base.js'].lineData[212]++;
  S.each(self.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[213]++;
  var keep = 0, pluginId;
  _$jscoverage['/base.js'].lineData[214]++;
  if (visit79_214_1(plugin)) {
    _$jscoverage['/base.js'].lineData[215]++;
    if (visit80_215_1(isString)) {
      _$jscoverage['/base.js'].lineData[217]++;
      pluginId = visit81_217_1(visit82_217_2(p.get && p.get('pluginId')) || p.pluginId);
      _$jscoverage['/base.js'].lineData[218]++;
      if (visit83_218_1(pluginId != plugin)) {
        _$jscoverage['/base.js'].lineData[219]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[220]++;
        keep = 1;
      }
    } else {
      _$jscoverage['/base.js'].lineData[223]++;
      if (visit84_223_1(p != plugin)) {
        _$jscoverage['/base.js'].lineData[224]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[225]++;
        keep = 1;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[230]++;
  if (visit85_230_1(!keep)) {
    _$jscoverage['/base.js'].lineData[231]++;
    p.pluginDestructor(self);
  }
});
  _$jscoverage['/base.js'].lineData[235]++;
  self.setInternal('plugins', plugins);
  _$jscoverage['/base.js'].lineData[236]++;
  return self;
}, 
  'getPlugin': function(id) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[245]++;
  var plugin = null;
  _$jscoverage['/base.js'].lineData[246]++;
  S.each(this.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[248]++;
  var pluginId = visit86_248_1(visit87_248_2(p.get && p.get('pluginId')) || p.pluginId);
  _$jscoverage['/base.js'].lineData[249]++;
  if (visit88_249_1(pluginId == id)) {
    _$jscoverage['/base.js'].lineData[250]++;
    plugin = p;
    _$jscoverage['/base.js'].lineData[251]++;
    return false;
  }
  _$jscoverage['/base.js'].lineData[253]++;
  return undefined;
});
  _$jscoverage['/base.js'].lineData[255]++;
  return plugin;
}, 
  destructor: S.noop, 
  destroy: function() {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[261]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[262]++;
  if (visit89_262_1(!self.get('destroyed'))) {
    _$jscoverage['/base.js'].lineData[263]++;
    callPluginsMethod.call(self, 'pluginDestructor');
    _$jscoverage['/base.js'].lineData[264]++;
    self.destructor();
    _$jscoverage['/base.js'].lineData[265]++;
    self.set('destroyed', true);
    _$jscoverage['/base.js'].lineData[266]++;
    self.fire('destroy');
    _$jscoverage['/base.js'].lineData[267]++;
    self.detach();
  }
}});
  _$jscoverage['/base.js'].lineData[272]++;
  S.mix(Base, {
  __hooks__: {
  initializer: __getHook(), 
  destructor: __getHook('__destructor', true)}, 
  ATTRS: {
  plugins: {
  value: []}, 
  destroyed: {
  value: false}, 
  listeners: {
  value: []}}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[342]++;
  var SuperClass = this, name, SubClass;
  _$jscoverage['/base.js'].lineData[345]++;
  if (visit90_345_1(!S.isArray(extensions))) {
    _$jscoverage['/base.js'].lineData[346]++;
    sx = px;
    _$jscoverage['/base.js'].lineData[347]++;
    px = extensions;
    _$jscoverage['/base.js'].lineData[349]++;
    extensions = [];
  }
  _$jscoverage['/base.js'].lineData[351]++;
  sx = visit91_351_1(sx || {});
  _$jscoverage['/base.js'].lineData[352]++;
  name = visit92_352_1(sx.name || 'BaseDerived');
  _$jscoverage['/base.js'].lineData[353]++;
  px = S.merge(px);
  _$jscoverage['/base.js'].lineData[354]++;
  if (visit93_354_1(px.hasOwnProperty('constructor'))) {
    _$jscoverage['/base.js'].lineData[355]++;
    SubClass = px.constructor;
  } else {
    _$jscoverage['/base.js'].lineData[359]++;
    if (visit94_359_1('@DEBUG@')) {
      _$jscoverage['/base.js'].lineData[360]++;
      eval("SubClass = function " + CamelCase(name) + "(){ " + "this.callSuper.apply(this, arguments);}");
    } else {
      _$jscoverage['/base.js'].lineData[363]++;
      SubClass = function() {
  _$jscoverage['/base.js'].functionData[17]++;
  _$jscoverage['/base.js'].lineData[364]++;
  this.callSuper.apply(this, arguments);
};
    }
  }
  _$jscoverage['/base.js'].lineData[368]++;
  px.constructor = SubClass;
  _$jscoverage['/base.js'].lineData[370]++;
  var hooks = SuperClass.__hooks__;
  _$jscoverage['/base.js'].lineData[371]++;
  if (visit95_371_1(hooks)) {
    _$jscoverage['/base.js'].lineData[372]++;
    sx.__hooks__ = S.merge(hooks, sx.__hooks__);
  }
  _$jscoverage['/base.js'].lineData[374]++;
  SubClass.__extensions__ = extensions;
  _$jscoverage['/base.js'].lineData[375]++;
  wrapProtoForSuper(px, SubClass, visit96_375_1(sx.__hooks__ || {}));
  _$jscoverage['/base.js'].lineData[376]++;
  var sp = SuperClass.prototype;
  _$jscoverage['/base.js'].lineData[378]++;
  var inheritedStatics = sp['__inheritedStatics__'] = visit97_378_1(sp['__inheritedStatics__'] || sx['inheritedStatics']);
  _$jscoverage['/base.js'].lineData[379]++;
  if (visit98_379_1(sx['inheritedStatics'] && visit99_379_2(inheritedStatics !== sx['inheritedStatics']))) {
    _$jscoverage['/base.js'].lineData[380]++;
    S.mix(inheritedStatics, sx['inheritedStatics']);
  }
  _$jscoverage['/base.js'].lineData[382]++;
  if (visit100_382_1(inheritedStatics)) {
    _$jscoverage['/base.js'].lineData[383]++;
    S.mix(SubClass, inheritedStatics);
  }
  _$jscoverage['/base.js'].lineData[385]++;
  delete sx['inheritedStatics'];
  _$jscoverage['/base.js'].lineData[387]++;
  S.extend(SubClass, SuperClass, px, sx);
  _$jscoverage['/base.js'].lineData[389]++;
  if (visit101_389_1(extensions.length)) {
    _$jscoverage['/base.js'].lineData[390]++;
    var attrs = {}, prototype = {};
    _$jscoverage['/base.js'].lineData[394]++;
    S.each(extensions['concat'](SubClass), function(ext) {
  _$jscoverage['/base.js'].functionData[18]++;
  _$jscoverage['/base.js'].lineData[395]++;
  if (visit102_395_1(ext)) {
    _$jscoverage['/base.js'].lineData[405]++;
    S.each(ext[ATTRS], function(v, name) {
  _$jscoverage['/base.js'].functionData[19]++;
  _$jscoverage['/base.js'].lineData[406]++;
  var av = attrs[name] = visit103_406_1(attrs[name] || {});
  _$jscoverage['/base.js'].lineData[407]++;
  S.mix(av, v);
});
    _$jscoverage['/base.js'].lineData[410]++;
    var exp = ext.prototype, p;
    _$jscoverage['/base.js'].lineData[412]++;
    for (p in exp) {
      _$jscoverage['/base.js'].lineData[414]++;
      if (visit104_414_1(exp.hasOwnProperty(p))) {
        _$jscoverage['/base.js'].lineData[415]++;
        prototype[p] = exp[p];
      }
    }
  }
});
    _$jscoverage['/base.js'].lineData[420]++;
    SubClass[ATTRS] = attrs;
    _$jscoverage['/base.js'].lineData[421]++;
    prototype.constructor = SubClass;
    _$jscoverage['/base.js'].lineData[422]++;
    S.augment(SubClass, prototype);
  }
  _$jscoverage['/base.js'].lineData[424]++;
  SubClass.extend = visit105_424_1(SubClass.extend || extend);
  _$jscoverage['/base.js'].lineData[425]++;
  SubClass.addMembers = addMembers;
  _$jscoverage['/base.js'].lineData[426]++;
  return SubClass;
}});
  _$jscoverage['/base.js'].lineData[430]++;
  function addMembers(px) {
    _$jscoverage['/base.js'].functionData[20]++;
    _$jscoverage['/base.js'].lineData[431]++;
    var SubClass = this;
    _$jscoverage['/base.js'].lineData[432]++;
    wrapProtoForSuper(px, SubClass, visit106_432_1(SubClass.__hooks__ || {}));
    _$jscoverage['/base.js'].lineData[433]++;
    S.mix(SubClass.prototype, px);
  }
  _$jscoverage['/base.js'].lineData[460]++;
  function onSetAttrChange(e) {
    _$jscoverage['/base.js'].functionData[21]++;
    _$jscoverage['/base.js'].lineData[461]++;
    var self = this, method;
    _$jscoverage['/base.js'].lineData[464]++;
    if (visit107_464_1(e.target == self)) {
      _$jscoverage['/base.js'].lineData[465]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/base.js'].lineData[466]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/base.js'].lineData[470]++;
  function addAttrs(host, attrs) {
    _$jscoverage['/base.js'].functionData[22]++;
    _$jscoverage['/base.js'].lineData[471]++;
    if (visit108_471_1(attrs)) {
      _$jscoverage['/base.js'].lineData[472]++;
      for (var attr in attrs) {
        _$jscoverage['/base.js'].lineData[480]++;
        host.addAttr(attr, attrs[attr], false);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[485]++;
  function initAttrs(host, config) {
    _$jscoverage['/base.js'].functionData[23]++;
    _$jscoverage['/base.js'].lineData[486]++;
    if (visit109_486_1(config)) {
      _$jscoverage['/base.js'].lineData[487]++;
      for (var attr in config) {
        _$jscoverage['/base.js'].lineData[489]++;
        host.setInternal(attr, config[attr]);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[494]++;
  function constructPlugins(self) {
    _$jscoverage['/base.js'].functionData[24]++;
    _$jscoverage['/base.js'].lineData[495]++;
    var plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[496]++;
    S.each(plugins, function(plugin, i) {
  _$jscoverage['/base.js'].functionData[25]++;
  _$jscoverage['/base.js'].lineData[497]++;
  if (visit110_497_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[498]++;
    plugins[i] = new plugin();
  }
});
  }
  _$jscoverage['/base.js'].lineData[503]++;
  function wrapper(fn) {
    _$jscoverage['/base.js'].functionData[26]++;
    _$jscoverage['/base.js'].lineData[504]++;
    return function() {
  _$jscoverage['/base.js'].functionData[27]++;
  _$jscoverage['/base.js'].lineData[505]++;
  return fn.apply(this, arguments);
};
  }
  _$jscoverage['/base.js'].lineData[509]++;
  function wrapProtoForSuper(px, SubClass, hooks) {
    _$jscoverage['/base.js'].functionData[28]++;
    _$jscoverage['/base.js'].lineData[510]++;
    var extensions = SubClass.__extensions__;
    _$jscoverage['/base.js'].lineData[511]++;
    if (visit111_511_1(extensions.length)) {
      _$jscoverage['/base.js'].lineData[512]++;
      for (p in hooks) {
        _$jscoverage['/base.js'].lineData[513]++;
        px[p] = visit112_513_1(px[p] || noop);
      }
    }
    _$jscoverage['/base.js'].lineData[517]++;
    for (var p in hooks) {
      _$jscoverage['/base.js'].lineData[518]++;
      if (visit113_518_1(p in px)) {
        _$jscoverage['/base.js'].lineData[519]++;
        px[p] = hooks[p](px[p]);
      }
    }
    _$jscoverage['/base.js'].lineData[522]++;
    S.each(px, function(v, p) {
  _$jscoverage['/base.js'].functionData[29]++;
  _$jscoverage['/base.js'].lineData[523]++;
  if (visit114_523_1(typeof v == 'function')) {
    _$jscoverage['/base.js'].lineData[524]++;
    var wrapped = 0;
    _$jscoverage['/base.js'].lineData[525]++;
    if (visit115_525_1(v.__owner__)) {
      _$jscoverage['/base.js'].lineData[526]++;
      var originalOwner = v.__owner__;
      _$jscoverage['/base.js'].lineData[527]++;
      delete v.__owner__;
      _$jscoverage['/base.js'].lineData[528]++;
      delete v.__name__;
      _$jscoverage['/base.js'].lineData[529]++;
      wrapped = v.__wrapped__ = 1;
      _$jscoverage['/base.js'].lineData[530]++;
      var newV = wrapper(v);
      _$jscoverage['/base.js'].lineData[531]++;
      newV.__owner__ = originalOwner;
      _$jscoverage['/base.js'].lineData[532]++;
      newV.__name__ = p;
      _$jscoverage['/base.js'].lineData[533]++;
      originalOwner.prototype[p] = newV;
    } else {
      _$jscoverage['/base.js'].lineData[534]++;
      if (visit116_534_1(v.__wrapped__)) {
        _$jscoverage['/base.js'].lineData[535]++;
        wrapped = 1;
      }
    }
    _$jscoverage['/base.js'].lineData[537]++;
    if (visit117_537_1(wrapped)) {
      _$jscoverage['/base.js'].lineData[538]++;
      px[p] = v = wrapper(v);
    }
    _$jscoverage['/base.js'].lineData[540]++;
    v.__owner__ = SubClass;
    _$jscoverage['/base.js'].lineData[541]++;
    v.__name__ = p;
  }
});
  }
  _$jscoverage['/base.js'].lineData[546]++;
  function callPluginsMethod(method) {
    _$jscoverage['/base.js'].functionData[30]++;
    _$jscoverage['/base.js'].lineData[547]++;
    var len, self = this, plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[550]++;
    if (visit118_550_1(len = plugins.length)) {
      _$jscoverage['/base.js'].lineData[551]++;
      for (var i = 0; visit119_551_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[552]++;
        visit120_552_1(plugins[i][method] && plugins[i][method](self));
      }
    }
  }
  _$jscoverage['/base.js'].lineData[557]++;
  function callExtensionsMethod(self, extensions, method, args) {
    _$jscoverage['/base.js'].functionData[31]++;
    _$jscoverage['/base.js'].lineData[558]++;
    var len;
    _$jscoverage['/base.js'].lineData[559]++;
    if (visit121_559_1(len = visit122_559_2(extensions && extensions.length))) {
      _$jscoverage['/base.js'].lineData[560]++;
      for (var i = 0; visit123_560_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[561]++;
        var fn = visit124_561_1(extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method]));
        _$jscoverage['/base.js'].lineData[566]++;
        if (visit125_566_1(fn)) {
          _$jscoverage['/base.js'].lineData[567]++;
          fn.apply(self, visit126_567_1(args || []));
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[573]++;
  return Base;
}, {
  requires: ['base/attribute', 'event/custom']});
