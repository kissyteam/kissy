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
if (! _$jscoverage['/base/create.js']) {
  _$jscoverage['/base/create.js'] = {};
  _$jscoverage['/base/create.js'].lineData = [];
  _$jscoverage['/base/create.js'].lineData[6] = 0;
  _$jscoverage['/base/create.js'].lineData[7] = 0;
  _$jscoverage['/base/create.js'].lineData[8] = 0;
  _$jscoverage['/base/create.js'].lineData[9] = 0;
  _$jscoverage['/base/create.js'].lineData[27] = 0;
  _$jscoverage['/base/create.js'].lineData[28] = 0;
  _$jscoverage['/base/create.js'].lineData[31] = 0;
  _$jscoverage['/base/create.js'].lineData[32] = 0;
  _$jscoverage['/base/create.js'].lineData[35] = 0;
  _$jscoverage['/base/create.js'].lineData[36] = 0;
  _$jscoverage['/base/create.js'].lineData[38] = 0;
  _$jscoverage['/base/create.js'].lineData[41] = 0;
  _$jscoverage['/base/create.js'].lineData[42] = 0;
  _$jscoverage['/base/create.js'].lineData[44] = 0;
  _$jscoverage['/base/create.js'].lineData[45] = 0;
  _$jscoverage['/base/create.js'].lineData[48] = 0;
  _$jscoverage['/base/create.js'].lineData[49] = 0;
  _$jscoverage['/base/create.js'].lineData[51] = 0;
  _$jscoverage['/base/create.js'].lineData[52] = 0;
  _$jscoverage['/base/create.js'].lineData[58] = 0;
  _$jscoverage['/base/create.js'].lineData[59] = 0;
  _$jscoverage['/base/create.js'].lineData[63] = 0;
  _$jscoverage['/base/create.js'].lineData[64] = 0;
  _$jscoverage['/base/create.js'].lineData[69] = 0;
  _$jscoverage['/base/create.js'].lineData[71] = 0;
  _$jscoverage['/base/create.js'].lineData[72] = 0;
  _$jscoverage['/base/create.js'].lineData[74] = 0;
  _$jscoverage['/base/create.js'].lineData[76] = 0;
  _$jscoverage['/base/create.js'].lineData[81] = 0;
  _$jscoverage['/base/create.js'].lineData[99] = 0;
  _$jscoverage['/base/create.js'].lineData[101] = 0;
  _$jscoverage['/base/create.js'].lineData[102] = 0;
  _$jscoverage['/base/create.js'].lineData[105] = 0;
  _$jscoverage['/base/create.js'].lineData[106] = 0;
  _$jscoverage['/base/create.js'].lineData[109] = 0;
  _$jscoverage['/base/create.js'].lineData[110] = 0;
  _$jscoverage['/base/create.js'].lineData[113] = 0;
  _$jscoverage['/base/create.js'].lineData[114] = 0;
  _$jscoverage['/base/create.js'].lineData[117] = 0;
  _$jscoverage['/base/create.js'].lineData[118] = 0;
  _$jscoverage['/base/create.js'].lineData[121] = 0;
  _$jscoverage['/base/create.js'].lineData[130] = 0;
  _$jscoverage['/base/create.js'].lineData[131] = 0;
  _$jscoverage['/base/create.js'].lineData[132] = 0;
  _$jscoverage['/base/create.js'].lineData[134] = 0;
  _$jscoverage['/base/create.js'].lineData[138] = 0;
  _$jscoverage['/base/create.js'].lineData[140] = 0;
  _$jscoverage['/base/create.js'].lineData[141] = 0;
  _$jscoverage['/base/create.js'].lineData[144] = 0;
  _$jscoverage['/base/create.js'].lineData[146] = 0;
  _$jscoverage['/base/create.js'].lineData[148] = 0;
  _$jscoverage['/base/create.js'].lineData[151] = 0;
  _$jscoverage['/base/create.js'].lineData[153] = 0;
  _$jscoverage['/base/create.js'].lineData[156] = 0;
  _$jscoverage['/base/create.js'].lineData[158] = 0;
  _$jscoverage['/base/create.js'].lineData[160] = 0;
  _$jscoverage['/base/create.js'].lineData[161] = 0;
  _$jscoverage['/base/create.js'].lineData[163] = 0;
  _$jscoverage['/base/create.js'].lineData[165] = 0;
  _$jscoverage['/base/create.js'].lineData[169] = 0;
  _$jscoverage['/base/create.js'].lineData[173] = 0;
  _$jscoverage['/base/create.js'].lineData[174] = 0;
  _$jscoverage['/base/create.js'].lineData[175] = 0;
  _$jscoverage['/base/create.js'].lineData[177] = 0;
  _$jscoverage['/base/create.js'].lineData[178] = 0;
  _$jscoverage['/base/create.js'].lineData[179] = 0;
  _$jscoverage['/base/create.js'].lineData[180] = 0;
  _$jscoverage['/base/create.js'].lineData[182] = 0;
  _$jscoverage['/base/create.js'].lineData[183] = 0;
  _$jscoverage['/base/create.js'].lineData[184] = 0;
  _$jscoverage['/base/create.js'].lineData[186] = 0;
  _$jscoverage['/base/create.js'].lineData[187] = 0;
  _$jscoverage['/base/create.js'].lineData[188] = 0;
  _$jscoverage['/base/create.js'].lineData[209] = 0;
  _$jscoverage['/base/create.js'].lineData[214] = 0;
  _$jscoverage['/base/create.js'].lineData[215] = 0;
  _$jscoverage['/base/create.js'].lineData[218] = 0;
  _$jscoverage['/base/create.js'].lineData[220] = 0;
  _$jscoverage['/base/create.js'].lineData[221] = 0;
  _$jscoverage['/base/create.js'].lineData[222] = 0;
  _$jscoverage['/base/create.js'].lineData[223] = 0;
  _$jscoverage['/base/create.js'].lineData[224] = 0;
  _$jscoverage['/base/create.js'].lineData[225] = 0;
  _$jscoverage['/base/create.js'].lineData[227] = 0;
  _$jscoverage['/base/create.js'].lineData[230] = 0;
  _$jscoverage['/base/create.js'].lineData[234] = 0;
  _$jscoverage['/base/create.js'].lineData[237] = 0;
  _$jscoverage['/base/create.js'].lineData[238] = 0;
  _$jscoverage['/base/create.js'].lineData[239] = 0;
  _$jscoverage['/base/create.js'].lineData[240] = 0;
  _$jscoverage['/base/create.js'].lineData[241] = 0;
  _$jscoverage['/base/create.js'].lineData[242] = 0;
  _$jscoverage['/base/create.js'].lineData[245] = 0;
  _$jscoverage['/base/create.js'].lineData[253] = 0;
  _$jscoverage['/base/create.js'].lineData[254] = 0;
  _$jscoverage['/base/create.js'].lineData[255] = 0;
  _$jscoverage['/base/create.js'].lineData[256] = 0;
  _$jscoverage['/base/create.js'].lineData[259] = 0;
  _$jscoverage['/base/create.js'].lineData[271] = 0;
  _$jscoverage['/base/create.js'].lineData[277] = 0;
  _$jscoverage['/base/create.js'].lineData[278] = 0;
  _$jscoverage['/base/create.js'].lineData[281] = 0;
  _$jscoverage['/base/create.js'].lineData[282] = 0;
  _$jscoverage['/base/create.js'].lineData[283] = 0;
  _$jscoverage['/base/create.js'].lineData[285] = 0;
  _$jscoverage['/base/create.js'].lineData[286] = 0;
  _$jscoverage['/base/create.js'].lineData[287] = 0;
  _$jscoverage['/base/create.js'].lineData[290] = 0;
  _$jscoverage['/base/create.js'].lineData[291] = 0;
  _$jscoverage['/base/create.js'].lineData[292] = 0;
  _$jscoverage['/base/create.js'].lineData[293] = 0;
  _$jscoverage['/base/create.js'].lineData[294] = 0;
  _$jscoverage['/base/create.js'].lineData[295] = 0;
  _$jscoverage['/base/create.js'].lineData[296] = 0;
  _$jscoverage['/base/create.js'].lineData[300] = 0;
  _$jscoverage['/base/create.js'].lineData[301] = 0;
  _$jscoverage['/base/create.js'].lineData[302] = 0;
  _$jscoverage['/base/create.js'].lineData[305] = 0;
  _$jscoverage['/base/create.js'].lineData[314] = 0;
  _$jscoverage['/base/create.js'].lineData[319] = 0;
  _$jscoverage['/base/create.js'].lineData[320] = 0;
  _$jscoverage['/base/create.js'].lineData[321] = 0;
  _$jscoverage['/base/create.js'].lineData[322] = 0;
  _$jscoverage['/base/create.js'].lineData[323] = 0;
  _$jscoverage['/base/create.js'].lineData[324] = 0;
  _$jscoverage['/base/create.js'].lineData[325] = 0;
  _$jscoverage['/base/create.js'].lineData[326] = 0;
  _$jscoverage['/base/create.js'].lineData[334] = 0;
  _$jscoverage['/base/create.js'].lineData[358] = 0;
  _$jscoverage['/base/create.js'].lineData[359] = 0;
  _$jscoverage['/base/create.js'].lineData[360] = 0;
  _$jscoverage['/base/create.js'].lineData[361] = 0;
  _$jscoverage['/base/create.js'].lineData[364] = 0;
  _$jscoverage['/base/create.js'].lineData[369] = 0;
  _$jscoverage['/base/create.js'].lineData[370] = 0;
  _$jscoverage['/base/create.js'].lineData[373] = 0;
  _$jscoverage['/base/create.js'].lineData[379] = 0;
  _$jscoverage['/base/create.js'].lineData[383] = 0;
  _$jscoverage['/base/create.js'].lineData[390] = 0;
  _$jscoverage['/base/create.js'].lineData[391] = 0;
  _$jscoverage['/base/create.js'].lineData[394] = 0;
  _$jscoverage['/base/create.js'].lineData[395] = 0;
  _$jscoverage['/base/create.js'].lineData[399] = 0;
  _$jscoverage['/base/create.js'].lineData[400] = 0;
  _$jscoverage['/base/create.js'].lineData[401] = 0;
  _$jscoverage['/base/create.js'].lineData[402] = 0;
  _$jscoverage['/base/create.js'].lineData[405] = 0;
  _$jscoverage['/base/create.js'].lineData[413] = 0;
  _$jscoverage['/base/create.js'].lineData[415] = 0;
  _$jscoverage['/base/create.js'].lineData[416] = 0;
  _$jscoverage['/base/create.js'].lineData[417] = 0;
  _$jscoverage['/base/create.js'].lineData[425] = 0;
  _$jscoverage['/base/create.js'].lineData[427] = 0;
  _$jscoverage['/base/create.js'].lineData[428] = 0;
  _$jscoverage['/base/create.js'].lineData[429] = 0;
  _$jscoverage['/base/create.js'].lineData[430] = 0;
  _$jscoverage['/base/create.js'].lineData[433] = 0;
  _$jscoverage['/base/create.js'].lineData[434] = 0;
  _$jscoverage['/base/create.js'].lineData[435] = 0;
  _$jscoverage['/base/create.js'].lineData[437] = 0;
  _$jscoverage['/base/create.js'].lineData[439] = 0;
  _$jscoverage['/base/create.js'].lineData[440] = 0;
  _$jscoverage['/base/create.js'].lineData[443] = 0;
  _$jscoverage['/base/create.js'].lineData[444] = 0;
  _$jscoverage['/base/create.js'].lineData[445] = 0;
  _$jscoverage['/base/create.js'].lineData[447] = 0;
  _$jscoverage['/base/create.js'].lineData[453] = 0;
  _$jscoverage['/base/create.js'].lineData[454] = 0;
  _$jscoverage['/base/create.js'].lineData[458] = 0;
  _$jscoverage['/base/create.js'].lineData[459] = 0;
  _$jscoverage['/base/create.js'].lineData[462] = 0;
  _$jscoverage['/base/create.js'].lineData[465] = 0;
  _$jscoverage['/base/create.js'].lineData[466] = 0;
  _$jscoverage['/base/create.js'].lineData[470] = 0;
  _$jscoverage['/base/create.js'].lineData[472] = 0;
  _$jscoverage['/base/create.js'].lineData[477] = 0;
  _$jscoverage['/base/create.js'].lineData[478] = 0;
  _$jscoverage['/base/create.js'].lineData[479] = 0;
  _$jscoverage['/base/create.js'].lineData[480] = 0;
  _$jscoverage['/base/create.js'].lineData[481] = 0;
  _$jscoverage['/base/create.js'].lineData[483] = 0;
  _$jscoverage['/base/create.js'].lineData[486] = 0;
  _$jscoverage['/base/create.js'].lineData[490] = 0;
  _$jscoverage['/base/create.js'].lineData[491] = 0;
  _$jscoverage['/base/create.js'].lineData[495] = 0;
  _$jscoverage['/base/create.js'].lineData[496] = 0;
  _$jscoverage['/base/create.js'].lineData[497] = 0;
  _$jscoverage['/base/create.js'].lineData[498] = 0;
  _$jscoverage['/base/create.js'].lineData[499] = 0;
  _$jscoverage['/base/create.js'].lineData[500] = 0;
  _$jscoverage['/base/create.js'].lineData[503] = 0;
  _$jscoverage['/base/create.js'].lineData[505] = 0;
  _$jscoverage['/base/create.js'].lineData[509] = 0;
  _$jscoverage['/base/create.js'].lineData[525] = 0;
  _$jscoverage['/base/create.js'].lineData[527] = 0;
  _$jscoverage['/base/create.js'].lineData[528] = 0;
  _$jscoverage['/base/create.js'].lineData[529] = 0;
  _$jscoverage['/base/create.js'].lineData[537] = 0;
  _$jscoverage['/base/create.js'].lineData[538] = 0;
  _$jscoverage['/base/create.js'].lineData[541] = 0;
}
if (! _$jscoverage['/base/create.js'].functionData) {
  _$jscoverage['/base/create.js'].functionData = [];
  _$jscoverage['/base/create.js'].functionData[0] = 0;
  _$jscoverage['/base/create.js'].functionData[1] = 0;
  _$jscoverage['/base/create.js'].functionData[2] = 0;
  _$jscoverage['/base/create.js'].functionData[3] = 0;
  _$jscoverage['/base/create.js'].functionData[4] = 0;
  _$jscoverage['/base/create.js'].functionData[5] = 0;
  _$jscoverage['/base/create.js'].functionData[6] = 0;
  _$jscoverage['/base/create.js'].functionData[7] = 0;
  _$jscoverage['/base/create.js'].functionData[8] = 0;
  _$jscoverage['/base/create.js'].functionData[9] = 0;
  _$jscoverage['/base/create.js'].functionData[10] = 0;
  _$jscoverage['/base/create.js'].functionData[11] = 0;
  _$jscoverage['/base/create.js'].functionData[12] = 0;
  _$jscoverage['/base/create.js'].functionData[13] = 0;
  _$jscoverage['/base/create.js'].functionData[14] = 0;
  _$jscoverage['/base/create.js'].functionData[15] = 0;
  _$jscoverage['/base/create.js'].functionData[16] = 0;
  _$jscoverage['/base/create.js'].functionData[17] = 0;
  _$jscoverage['/base/create.js'].functionData[18] = 0;
  _$jscoverage['/base/create.js'].functionData[19] = 0;
}
if (! _$jscoverage['/base/create.js'].branchData) {
  _$jscoverage['/base/create.js'].branchData = {};
  _$jscoverage['/base/create.js'].branchData['15'] = [];
  _$jscoverage['/base/create.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['20'] = [];
  _$jscoverage['/base/create.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['20'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['23'] = [];
  _$jscoverage['/base/create.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['32'] = [];
  _$jscoverage['/base/create.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['32'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['35'] = [];
  _$jscoverage['/base/create.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['35'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['64'] = [];
  _$jscoverage['/base/create.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['69'] = [];
  _$jscoverage['/base/create.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['69'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['71'] = [];
  _$jscoverage['/base/create.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['101'] = [];
  _$jscoverage['/base/create.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['105'] = [];
  _$jscoverage['/base/create.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['109'] = [];
  _$jscoverage['/base/create.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['113'] = [];
  _$jscoverage['/base/create.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['117'] = [];
  _$jscoverage['/base/create.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['124'] = [];
  _$jscoverage['/base/create.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['130'] = [];
  _$jscoverage['/base/create.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['140'] = [];
  _$jscoverage['/base/create.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['144'] = [];
  _$jscoverage['/base/create.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['146'] = [];
  _$jscoverage['/base/create.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['151'] = [];
  _$jscoverage['/base/create.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['151'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['158'] = [];
  _$jscoverage['/base/create.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['161'] = [];
  _$jscoverage['/base/create.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['174'] = [];
  _$jscoverage['/base/create.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['177'] = [];
  _$jscoverage['/base/create.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['180'] = [];
  _$jscoverage['/base/create.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['180'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['180'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['180'][4] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['180'][5] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['183'] = [];
  _$jscoverage['/base/create.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['187'] = [];
  _$jscoverage['/base/create.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['214'] = [];
  _$jscoverage['/base/create.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['218'] = [];
  _$jscoverage['/base/create.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['220'] = [];
  _$jscoverage['/base/create.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['222'] = [];
  _$jscoverage['/base/create.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['234'] = [];
  _$jscoverage['/base/create.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['235'] = [];
  _$jscoverage['/base/create.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['235'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['235'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['238'] = [];
  _$jscoverage['/base/create.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['240'] = [];
  _$jscoverage['/base/create.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['253'] = [];
  _$jscoverage['/base/create.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['277'] = [];
  _$jscoverage['/base/create.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['281'] = [];
  _$jscoverage['/base/create.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['282'] = [];
  _$jscoverage['/base/create.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['282'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['291'] = [];
  _$jscoverage['/base/create.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['292'] = [];
  _$jscoverage['/base/create.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['294'] = [];
  _$jscoverage['/base/create.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['319'] = [];
  _$jscoverage['/base/create.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['321'] = [];
  _$jscoverage['/base/create.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['321'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['325'] = [];
  _$jscoverage['/base/create.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['358'] = [];
  _$jscoverage['/base/create.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['369'] = [];
  _$jscoverage['/base/create.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['383'] = [];
  _$jscoverage['/base/create.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['383'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['384'] = [];
  _$jscoverage['/base/create.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['390'] = [];
  _$jscoverage['/base/create.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['390'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['394'] = [];
  _$jscoverage['/base/create.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['399'] = [];
  _$jscoverage['/base/create.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['401'] = [];
  _$jscoverage['/base/create.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['415'] = [];
  _$jscoverage['/base/create.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['429'] = [];
  _$jscoverage['/base/create.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['434'] = [];
  _$jscoverage['/base/create.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['439'] = [];
  _$jscoverage['/base/create.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['444'] = [];
  _$jscoverage['/base/create.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['458'] = [];
  _$jscoverage['/base/create.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['458'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['470'] = [];
  _$jscoverage['/base/create.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['478'] = [];
  _$jscoverage['/base/create.js'].branchData['478'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['479'] = [];
  _$jscoverage['/base/create.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['481'] = [];
  _$jscoverage['/base/create.js'].branchData['481'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['495'] = [];
  _$jscoverage['/base/create.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['495'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['495'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['499'] = [];
  _$jscoverage['/base/create.js'].branchData['499'][1] = new BranchData();
}
_$jscoverage['/base/create.js'].branchData['499'][1].init(189, 7, 'i < len');
function visit191_499_1(result) {
  _$jscoverage['/base/create.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['495'][3].init(106, 24, 'nodes.push || nodes.item');
function visit190_495_3(result) {
  _$jscoverage['/base/create.js'].branchData['495'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['495'][2].init(106, 37, '(nodes.push || nodes.item) && nodes[0]');
function visit189_495_2(result) {
  _$jscoverage['/base/create.js'].branchData['495'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['495'][1].init(96, 47, 'nodes && (nodes.push || nodes.item) && nodes[0]');
function visit188_495_1(result) {
  _$jscoverage['/base/create.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['481'][1].init(132, 49, 'elem.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit187_481_1(result) {
  _$jscoverage['/base/create.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['479'][1].init(18, 39, 'elem.nodeType === NodeType.ELEMENT_NODE');
function visit186_479_1(result) {
  _$jscoverage['/base/create.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['478'][1].init(14, 22, 'S.isPlainObject(props)');
function visit185_478_1(result) {
  _$jscoverage['/base/create.js'].branchData['478'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['470'][1].init(385, 8, 'DOMEvent');
function visit184_470_1(result) {
  _$jscoverage['/base/create.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['458'][2].init(102, 39, 'dest.nodeType === NodeType.ELEMENT_NODE');
function visit183_458_2(result) {
  _$jscoverage['/base/create.js'].branchData['458'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['458'][1].init(102, 60, 'dest.nodeType === NodeType.ELEMENT_NODE && !Dom.hasData(src)');
function visit182_458_1(result) {
  _$jscoverage['/base/create.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['444'][1].init(22, 21, 'cloneChildren[cIndex]');
function visit181_444_1(result) {
  _$jscoverage['/base/create.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['439'][1].init(447, 38, 'elemNodeType === NodeType.ELEMENT_NODE');
function visit180_439_1(result) {
  _$jscoverage['/base/create.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['434'][1].init(22, 15, 'cloneCs[fIndex]');
function visit179_434_1(result) {
  _$jscoverage['/base/create.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['429'][1].init(57, 48, 'elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit178_429_1(result) {
  _$jscoverage['/base/create.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['415'][1].init(119, 6, 'i >= 0');
function visit177_415_1(result) {
  _$jscoverage['/base/create.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['401'][1].init(83, 28, 'deep && deepWithDataAndEvent');
function visit176_401_1(result) {
  _$jscoverage['/base/create.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['399'][1].init(1772, 16, 'withDataAndEvent');
function visit175_399_1(result) {
  _$jscoverage['/base/create.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['394'][1].init(585, 27, 'deep && _fixCloneAttributes');
function visit174_394_1(result) {
  _$jscoverage['/base/create.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['390'][2].init(434, 38, 'elemNodeType === NodeType.ELEMENT_NODE');
function visit173_390_2(result) {
  _$jscoverage['/base/create.js'].branchData['390'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['390'][1].init(411, 61, '_fixCloneAttributes && elemNodeType === NodeType.ELEMENT_NODE');
function visit172_390_1(result) {
  _$jscoverage['/base/create.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['384'][1].init(62, 48, 'elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit171_384_1(result) {
  _$jscoverage['/base/create.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['383'][2].init(873, 38, 'elemNodeType === NodeType.ELEMENT_NODE');
function visit170_383_2(result) {
  _$jscoverage['/base/create.js'].branchData['383'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['383'][1].init(873, 111, 'elemNodeType === NodeType.ELEMENT_NODE || elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit169_383_1(result) {
  _$jscoverage['/base/create.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['369'][1].init(445, 5, '!elem');
function visit168_369_1(result) {
  _$jscoverage['/base/create.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['358'][1].init(22, 24, 'typeof deep === \'object\'');
function visit167_358_1(result) {
  _$jscoverage['/base/create.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['325'][1].init(190, 8, 'DOMEvent');
function visit166_325_1(result) {
  _$jscoverage['/base/create.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['321'][2].init(73, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit165_321_2(result) {
  _$jscoverage['/base/create.js'].branchData['321'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['321'][1].init(60, 50, '!keepData && el.nodeType === NodeType.ELEMENT_NODE');
function visit164_321_1(result) {
  _$jscoverage['/base/create.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['319'][1].init(222, 6, 'i >= 0');
function visit163_319_1(result) {
  _$jscoverage['/base/create.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['294'][1].init(76, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit162_294_1(result) {
  _$jscoverage['/base/create.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['292'][1].init(47, 6, 'i >= 0');
function visit161_292_1(result) {
  _$jscoverage['/base/create.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['291'][1].init(65, 64, '!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML');
function visit160_291_1(result) {
  _$jscoverage['/base/create.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['282'][2].init(46, 47, 'el.nodeType !== NodeType.DOCUMENT_FRAGMENT_NODE');
function visit159_282_2(result) {
  _$jscoverage['/base/create.js'].branchData['282'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['282'][1].init(26, 67, 'supportOuterHTML && el.nodeType !== NodeType.DOCUMENT_FRAGMENT_NODE');
function visit158_282_1(result) {
  _$jscoverage['/base/create.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['281'][1].init(337, 24, 'htmlString === undefined');
function visit157_281_1(result) {
  _$jscoverage['/base/create.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['277'][1].init(229, 3, '!el');
function visit156_277_1(result) {
  _$jscoverage['/base/create.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['253'][1].init(1114, 8, '!success');
function visit155_253_1(result) {
  _$jscoverage['/base/create.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['240'][1].init(86, 39, 'elem.nodeType === NodeType.ELEMENT_NODE');
function visit154_240_1(result) {
  _$jscoverage['/base/create.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['238'][1].init(55, 6, 'i >= 0');
function visit153_238_1(result) {
  _$jscoverage['/base/create.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['235'][3].init(347, 36, 'htmlString.match(RE_TAG) || [\'\', \'\']');
function visit152_235_3(result) {
  _$jscoverage['/base/create.js'].branchData['235'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['235'][2].init(258, 69, '!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)');
function visit151_235_2(result) {
  _$jscoverage['/base/create.js'].branchData['235'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['235'][1].init(73, 145, '(!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[(htmlString.match(RE_TAG) || [\'\', \'\'])[1].toLowerCase()]');
function visit150_235_1(result) {
  _$jscoverage['/base/create.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['234'][1].init(182, 219, '!htmlString.match(/<(?:script|style|link)/i) && (!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[(htmlString.match(RE_TAG) || [\'\', \'\'])[1].toLowerCase()]');
function visit149_234_1(result) {
  _$jscoverage['/base/create.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['222'][1].init(216, 47, 'el.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit148_222_1(result) {
  _$jscoverage['/base/create.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['220'][1].init(96, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit147_220_1(result) {
  _$jscoverage['/base/create.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['218'][1].init(366, 24, 'htmlString === undefined');
function visit146_218_1(result) {
  _$jscoverage['/base/create.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['214'][1].init(258, 3, '!el');
function visit145_214_1(result) {
  _$jscoverage['/base/create.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['187'][1].init(288, 23, 'dest.value !== srcValue');
function visit144_187_1(result) {
  _$jscoverage['/base/create.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['183'][1].init(109, 10, 'srcChecked');
function visit143_183_1(result) {
  _$jscoverage['/base/create.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['180'][5].init(466, 16, 'type === \'radio\'');
function visit142_180_5(result) {
  _$jscoverage['/base/create.js'].branchData['180'][5].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['180'][4].init(443, 19, 'type === \'checkbox\'');
function visit141_180_4(result) {
  _$jscoverage['/base/create.js'].branchData['180'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['180'][3].init(443, 39, 'type === \'checkbox\' || type === \'radio\'');
function visit140_180_3(result) {
  _$jscoverage['/base/create.js'].branchData['180'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['180'][2].init(418, 20, 'nodeName === \'input\'');
function visit139_180_2(result) {
  _$jscoverage['/base/create.js'].branchData['180'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['180'][1].init(418, 65, 'nodeName === \'input\' && (type === \'checkbox\' || type === \'radio\')');
function visit138_180_1(result) {
  _$jscoverage['/base/create.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['177'][1].init(258, 23, 'nodeName === \'textarea\'');
function visit137_177_1(result) {
  _$jscoverage['/base/create.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['174'][1].init(90, 14, 'src.type || \'\'');
function visit136_174_1(result) {
  _$jscoverage['/base/create.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['161'][1].init(1320, 12, 'nodes.length');
function visit135_161_1(result) {
  _$jscoverage['/base/create.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['158'][1].init(1101, 18, 'nodes.length === 1');
function visit134_158_1(result) {
  _$jscoverage['/base/create.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['151'][2].init(815, 93, '/\\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))');
function visit133_151_2(result) {
  _$jscoverage['/base/create.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['151'][1].init(786, 122, 'lostLeadingTailWhitespace && /\\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))');
function visit132_151_1(result) {
  _$jscoverage['/base/create.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['146'][1].init(490, 106, 'lostLeadingTailWhitespace && (whitespaceMatch = html.match(R_LEADING_WHITESPACE))');
function visit131_146_1(result) {
  _$jscoverage['/base/create.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['144'][1].init(380, 31, 'creators[tag] || defaultCreator');
function visit130_144_1(result) {
  _$jscoverage['/base/create.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['140'][1].init(236, 36, '(m = RE_TAG.exec(html)) && (k = m[1])');
function visit129_140_1(result) {
  _$jscoverage['/base/create.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['130'][1].init(813, 18, '!R_HTML.test(html)');
function visit128_130_1(result) {
  _$jscoverage['/base/create.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['124'][1].init(127, 15, 'ownerDoc || doc');
function visit127_124_1(result) {
  _$jscoverage['/base/create.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['117'][1].init(448, 5, '_trim');
function visit126_117_1(result) {
  _$jscoverage['/base/create.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['113'][1].init(348, 19, '_trim === undefined');
function visit125_113_1(result) {
  _$jscoverage['/base/create.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['109'][1].init(245, 24, 'typeof html !== \'string\'');
function visit124_109_1(result) {
  _$jscoverage['/base/create.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['105'][1].init(141, 13, 'html.nodeType');
function visit123_105_1(result) {
  _$jscoverage['/base/create.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['101'][1].init(57, 5, '!html');
function visit122_101_1(result) {
  _$jscoverage['/base/create.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['71'][1].init(137, 15, 'node.firstChild');
function visit121_71_1(result) {
  _$jscoverage['/base/create.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['69'][2].init(521, 46, 'parent.canHaveChildren && \'removeNode\' in node');
function visit120_69_2(result) {
  _$jscoverage['/base/create.js'].branchData['69'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['69'][1].init(512, 55, 'oldIE && parent.canHaveChildren && \'removeNode\' in node');
function visit119_69_1(result) {
  _$jscoverage['/base/create.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['64'][1].init(14, 6, 'parent');
function visit118_64_1(result) {
  _$jscoverage['/base/create.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['35'][2].init(145, 22, 'holder === DEFAULT_DIV');
function visit117_35_2(result) {
  _$jscoverage['/base/create.js'].branchData['35'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['35'][1].init(136, 31, 'clear && holder === DEFAULT_DIV');
function visit116_35_1(result) {
  _$jscoverage['/base/create.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['32'][2].init(35, 16, 'ownerDoc !== doc');
function visit115_32_2(result) {
  _$jscoverage['/base/create.js'].branchData['32'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['32'][1].init(23, 28, 'ownerDoc && ownerDoc !== doc');
function visit114_32_1(result) {
  _$jscoverage['/base/create.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['23'][1].init(575, 41, 'doc && \'outerHTML\' in doc.documentElement');
function visit113_23_1(result) {
  _$jscoverage['/base/create.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['20'][2].init(463, 6, 'ie < 9');
function visit112_20_2(result) {
  _$jscoverage['/base/create.js'].branchData['20'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['20'][1].init(457, 12, 'ie && ie < 9');
function visit111_20_1(result) {
  _$jscoverage['/base/create.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['15'][1].init(200, 29, 'doc && doc.createElement(DIV)');
function visit110_15_1(result) {
  _$jscoverage['/base/create.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/create.js'].functionData[0]++;
  _$jscoverage['/base/create.js'].lineData[7]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/base/create.js'].lineData[8]++;
  var Dom = require('./api');
  _$jscoverage['/base/create.js'].lineData[9]++;
  var doc = S.Env.host.document, NodeType = Dom.NodeType, UA = require('ua'), ie = UA.ieMode, DIV = 'div', PARENT_NODE = 'parentNode', DEFAULT_DIV = visit110_15_1(doc && doc.createElement(DIV)), R_XHTML_TAG = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig, RE_TAG = /<([\w:]+)/, R_LEADING_WHITESPACE = /^\s+/, R_TAIL_WHITESPACE = /\s+$/, oldIE = !!(visit111_20_1(ie && visit112_20_2(ie < 9))), lostLeadingTailWhitespace = oldIE, R_HTML = /<|&#?\w+;/, supportOuterHTML = visit113_23_1(doc && 'outerHTML' in doc.documentElement), RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
  _$jscoverage['/base/create.js'].lineData[27]++;
  function getElementsByTagName(el, tag) {
    _$jscoverage['/base/create.js'].functionData[1]++;
    _$jscoverage['/base/create.js'].lineData[28]++;
    return el.getElementsByTagName(tag);
  }
  _$jscoverage['/base/create.js'].lineData[31]++;
  function getHolderDiv(ownerDoc, clear) {
    _$jscoverage['/base/create.js'].functionData[2]++;
    _$jscoverage['/base/create.js'].lineData[32]++;
    var holder = visit114_32_1(ownerDoc && visit115_32_2(ownerDoc !== doc)) ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
    _$jscoverage['/base/create.js'].lineData[35]++;
    if (visit116_35_1(clear && visit117_35_2(holder === DEFAULT_DIV))) {
      _$jscoverage['/base/create.js'].lineData[36]++;
      holder.innerHTML = '';
    }
    _$jscoverage['/base/create.js'].lineData[38]++;
    return holder;
  }
  _$jscoverage['/base/create.js'].lineData[41]++;
  function defaultCreator(html, ownerDoc) {
    _$jscoverage['/base/create.js'].functionData[3]++;
    _$jscoverage['/base/create.js'].lineData[42]++;
    var frag = getHolderDiv(ownerDoc);
    _$jscoverage['/base/create.js'].lineData[44]++;
    frag.innerHTML = 'm<div>' + html + '<' + '/div>';
    _$jscoverage['/base/create.js'].lineData[45]++;
    return frag.lastChild;
  }
  _$jscoverage['/base/create.js'].lineData[48]++;
  function _empty(node) {
    _$jscoverage['/base/create.js'].functionData[4]++;
    _$jscoverage['/base/create.js'].lineData[49]++;
    try {
      _$jscoverage['/base/create.js'].lineData[51]++;
      node.innerHTML = '';
      _$jscoverage['/base/create.js'].lineData[52]++;
      return;
    }    catch (e) {
}
    _$jscoverage['/base/create.js'].lineData[58]++;
    for (var c; (c = node.lastChild); ) {
      _$jscoverage['/base/create.js'].lineData[59]++;
      _destroy(c, node);
    }
  }
  _$jscoverage['/base/create.js'].lineData[63]++;
  function _destroy(node, parent) {
    _$jscoverage['/base/create.js'].functionData[5]++;
    _$jscoverage['/base/create.js'].lineData[64]++;
    if (visit118_64_1(parent)) {
      _$jscoverage['/base/create.js'].lineData[69]++;
      if (visit119_69_1(oldIE && visit120_69_2(parent.canHaveChildren && 'removeNode' in node))) {
        _$jscoverage['/base/create.js'].lineData[71]++;
        if (visit121_71_1(node.firstChild)) {
          _$jscoverage['/base/create.js'].lineData[72]++;
          _empty(node);
        }
        _$jscoverage['/base/create.js'].lineData[74]++;
        node.removeNode(false);
      } else {
        _$jscoverage['/base/create.js'].lineData[76]++;
        parent.removeChild(node);
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[81]++;
  S.mix(Dom, {
  create: function(html, props, ownerDoc, _trim) {
  _$jscoverage['/base/create.js'].functionData[6]++;
  _$jscoverage['/base/create.js'].lineData[99]++;
  var ret = null;
  _$jscoverage['/base/create.js'].lineData[101]++;
  if (visit122_101_1(!html)) {
    _$jscoverage['/base/create.js'].lineData[102]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[105]++;
  if (visit123_105_1(html.nodeType)) {
    _$jscoverage['/base/create.js'].lineData[106]++;
    return Dom.clone(html);
  }
  _$jscoverage['/base/create.js'].lineData[109]++;
  if (visit124_109_1(typeof html !== 'string')) {
    _$jscoverage['/base/create.js'].lineData[110]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[113]++;
  if (visit125_113_1(_trim === undefined)) {
    _$jscoverage['/base/create.js'].lineData[114]++;
    _trim = true;
  }
  _$jscoverage['/base/create.js'].lineData[117]++;
  if (visit126_117_1(_trim)) {
    _$jscoverage['/base/create.js'].lineData[118]++;
    html = S.trim(html);
  }
  _$jscoverage['/base/create.js'].lineData[121]++;
  var creators = Dom._creators, holder, whitespaceMatch, context = visit127_124_1(ownerDoc || doc), m, tag = DIV, k, nodes;
  _$jscoverage['/base/create.js'].lineData[130]++;
  if (visit128_130_1(!R_HTML.test(html))) {
    _$jscoverage['/base/create.js'].lineData[131]++;
    ret = context.createTextNode(html);
  } else {
    _$jscoverage['/base/create.js'].lineData[132]++;
    if ((m = RE_SIMPLE_TAG.exec(html))) {
      _$jscoverage['/base/create.js'].lineData[134]++;
      ret = context.createElement(m[1]);
    } else {
      _$jscoverage['/base/create.js'].lineData[138]++;
      html = html.replace(R_XHTML_TAG, '<$1><' + '/$2>');
      _$jscoverage['/base/create.js'].lineData[140]++;
      if (visit129_140_1((m = RE_TAG.exec(html)) && (k = m[1]))) {
        _$jscoverage['/base/create.js'].lineData[141]++;
        tag = k.toLowerCase();
      }
      _$jscoverage['/base/create.js'].lineData[144]++;
      holder = (visit130_144_1(creators[tag] || defaultCreator))(html, context);
      _$jscoverage['/base/create.js'].lineData[146]++;
      if (visit131_146_1(lostLeadingTailWhitespace && (whitespaceMatch = html.match(R_LEADING_WHITESPACE)))) {
        _$jscoverage['/base/create.js'].lineData[148]++;
        holder.insertBefore(context.createTextNode(whitespaceMatch[0]), holder.firstChild);
      }
      _$jscoverage['/base/create.js'].lineData[151]++;
      if (visit132_151_1(lostLeadingTailWhitespace && visit133_151_2(/\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))))) {
        _$jscoverage['/base/create.js'].lineData[153]++;
        holder.appendChild(context.createTextNode(whitespaceMatch[0]));
      }
      _$jscoverage['/base/create.js'].lineData[156]++;
      nodes = holder.childNodes;
      _$jscoverage['/base/create.js'].lineData[158]++;
      if (visit134_158_1(nodes.length === 1)) {
        _$jscoverage['/base/create.js'].lineData[160]++;
        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
      } else {
        _$jscoverage['/base/create.js'].lineData[161]++;
        if (visit135_161_1(nodes.length)) {
          _$jscoverage['/base/create.js'].lineData[163]++;
          ret = nodeListToFragment(nodes);
        } else {
          _$jscoverage['/base/create.js'].lineData[165]++;
          S.error(html + ' : create node error');
        }
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[169]++;
  return attachProps(ret, props);
}, 
  _fixCloneAttributes: function(src, dest) {
  _$jscoverage['/base/create.js'].functionData[7]++;
  _$jscoverage['/base/create.js'].lineData[173]++;
  var nodeName = src.nodeName.toLowerCase();
  _$jscoverage['/base/create.js'].lineData[174]++;
  var type = (visit136_174_1(src.type || '')).toLowerCase();
  _$jscoverage['/base/create.js'].lineData[175]++;
  var srcValue, srcChecked;
  _$jscoverage['/base/create.js'].lineData[177]++;
  if (visit137_177_1(nodeName === 'textarea')) {
    _$jscoverage['/base/create.js'].lineData[178]++;
    dest.defaultValue = src.defaultValue;
    _$jscoverage['/base/create.js'].lineData[179]++;
    dest.value = src.value;
  } else {
    _$jscoverage['/base/create.js'].lineData[180]++;
    if (visit138_180_1(visit139_180_2(nodeName === 'input') && (visit140_180_3(visit141_180_4(type === 'checkbox') || visit142_180_5(type === 'radio'))))) {
      _$jscoverage['/base/create.js'].lineData[182]++;
      srcChecked = src.checked;
      _$jscoverage['/base/create.js'].lineData[183]++;
      if (visit143_183_1(srcChecked)) {
        _$jscoverage['/base/create.js'].lineData[184]++;
        dest.defaultChecked = dest.checked = srcChecked;
      }
      _$jscoverage['/base/create.js'].lineData[186]++;
      srcValue = src.value;
      _$jscoverage['/base/create.js'].lineData[187]++;
      if (visit144_187_1(dest.value !== srcValue)) {
        _$jscoverage['/base/create.js'].lineData[188]++;
        dest.value = srcValue;
      }
    }
  }
}, 
  _creators: {
  div: defaultCreator}, 
  _defaultCreator: defaultCreator, 
  html: function(selector, htmlString, loadScripts) {
  _$jscoverage['/base/create.js'].functionData[8]++;
  _$jscoverage['/base/create.js'].lineData[209]++;
  var els = Dom.query(selector), el = els[0], success = false, valNode, i, elem;
  _$jscoverage['/base/create.js'].lineData[214]++;
  if (visit145_214_1(!el)) {
    _$jscoverage['/base/create.js'].lineData[215]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[218]++;
  if (visit146_218_1(htmlString === undefined)) {
    _$jscoverage['/base/create.js'].lineData[220]++;
    if (visit147_220_1(el.nodeType === NodeType.ELEMENT_NODE)) {
      _$jscoverage['/base/create.js'].lineData[221]++;
      return el.innerHTML;
    } else {
      _$jscoverage['/base/create.js'].lineData[222]++;
      if (visit148_222_1(el.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[223]++;
        var holder = getHolderDiv(el.ownerDocument, 1);
        _$jscoverage['/base/create.js'].lineData[224]++;
        holder.appendChild(el);
        _$jscoverage['/base/create.js'].lineData[225]++;
        return holder.innerHTML;
      } else {
        _$jscoverage['/base/create.js'].lineData[227]++;
        return null;
      }
    }
  } else {
    _$jscoverage['/base/create.js'].lineData[230]++;
    htmlString += '';
    _$jscoverage['/base/create.js'].lineData[234]++;
    if (visit149_234_1(!htmlString.match(/<(?:script|style|link)/i) && visit150_235_1((visit151_235_2(!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE))) && !creatorsMap[(visit152_235_3(htmlString.match(RE_TAG) || ['', '']))[1].toLowerCase()]))) {
      _$jscoverage['/base/create.js'].lineData[237]++;
      try {
        _$jscoverage['/base/create.js'].lineData[238]++;
        for (i = els.length - 1; visit153_238_1(i >= 0); i--) {
          _$jscoverage['/base/create.js'].lineData[239]++;
          elem = els[i];
          _$jscoverage['/base/create.js'].lineData[240]++;
          if (visit154_240_1(elem.nodeType === NodeType.ELEMENT_NODE)) {
            _$jscoverage['/base/create.js'].lineData[241]++;
            Dom.cleanData(getElementsByTagName(elem, '*'));
            _$jscoverage['/base/create.js'].lineData[242]++;
            elem.innerHTML = htmlString;
          }
        }
        _$jscoverage['/base/create.js'].lineData[245]++;
        success = true;
      }      catch (e) {
}
    }
    _$jscoverage['/base/create.js'].lineData[253]++;
    if (visit155_253_1(!success)) {
      _$jscoverage['/base/create.js'].lineData[254]++;
      valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
      _$jscoverage['/base/create.js'].lineData[255]++;
      Dom.empty(els);
      _$jscoverage['/base/create.js'].lineData[256]++;
      Dom.append(valNode, els, loadScripts);
    }
  }
  _$jscoverage['/base/create.js'].lineData[259]++;
  return undefined;
}, 
  outerHtml: function(selector, htmlString, loadScripts) {
  _$jscoverage['/base/create.js'].functionData[9]++;
  _$jscoverage['/base/create.js'].lineData[271]++;
  var els = Dom.query(selector), holder, i, valNode, length = els.length, el = els[0];
  _$jscoverage['/base/create.js'].lineData[277]++;
  if (visit156_277_1(!el)) {
    _$jscoverage['/base/create.js'].lineData[278]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[281]++;
  if (visit157_281_1(htmlString === undefined)) {
    _$jscoverage['/base/create.js'].lineData[282]++;
    if (visit158_282_1(supportOuterHTML && visit159_282_2(el.nodeType !== NodeType.DOCUMENT_FRAGMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[283]++;
      return el.outerHTML;
    } else {
      _$jscoverage['/base/create.js'].lineData[285]++;
      holder = getHolderDiv(el.ownerDocument, 1);
      _$jscoverage['/base/create.js'].lineData[286]++;
      holder.appendChild(Dom.clone(el, true));
      _$jscoverage['/base/create.js'].lineData[287]++;
      return holder.innerHTML;
    }
  } else {
    _$jscoverage['/base/create.js'].lineData[290]++;
    htmlString += '';
    _$jscoverage['/base/create.js'].lineData[291]++;
    if (visit160_291_1(!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML)) {
      _$jscoverage['/base/create.js'].lineData[292]++;
      for (i = length - 1; visit161_292_1(i >= 0); i--) {
        _$jscoverage['/base/create.js'].lineData[293]++;
        el = els[i];
        _$jscoverage['/base/create.js'].lineData[294]++;
        if (visit162_294_1(el.nodeType === NodeType.ELEMENT_NODE)) {
          _$jscoverage['/base/create.js'].lineData[295]++;
          Dom.cleanData(el, 1);
          _$jscoverage['/base/create.js'].lineData[296]++;
          el.outerHTML = htmlString;
        }
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[300]++;
      valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
      _$jscoverage['/base/create.js'].lineData[301]++;
      Dom.insertBefore(valNode, els, loadScripts);
      _$jscoverage['/base/create.js'].lineData[302]++;
      Dom.remove(els);
    }
  }
  _$jscoverage['/base/create.js'].lineData[305]++;
  return undefined;
}, 
  remove: function(selector, keepData) {
  _$jscoverage['/base/create.js'].functionData[10]++;
  _$jscoverage['/base/create.js'].lineData[314]++;
  var el, els = Dom.query(selector), all, DOMEvent = S.require('event/dom'), i;
  _$jscoverage['/base/create.js'].lineData[319]++;
  for (i = els.length - 1; visit163_319_1(i >= 0); i--) {
    _$jscoverage['/base/create.js'].lineData[320]++;
    el = els[i];
    _$jscoverage['/base/create.js'].lineData[321]++;
    if (visit164_321_1(!keepData && visit165_321_2(el.nodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[322]++;
      all = S.makeArray(getElementsByTagName(el, '*'));
      _$jscoverage['/base/create.js'].lineData[323]++;
      all.push(el);
      _$jscoverage['/base/create.js'].lineData[324]++;
      Dom.removeData(all);
      _$jscoverage['/base/create.js'].lineData[325]++;
      if (visit166_325_1(DOMEvent)) {
        _$jscoverage['/base/create.js'].lineData[326]++;
        DOMEvent.detach(all);
      }
    }
    _$jscoverage['/base/create.js'].lineData[334]++;
    _destroy(el, el.parentNode);
  }
}, 
  clone: function(selector, deep, withDataAndEvent, deepWithDataAndEvent) {
  _$jscoverage['/base/create.js'].functionData[11]++;
  _$jscoverage['/base/create.js'].lineData[358]++;
  if (visit167_358_1(typeof deep === 'object')) {
    _$jscoverage['/base/create.js'].lineData[359]++;
    deepWithDataAndEvent = deep.deepWithDataAndEvent;
    _$jscoverage['/base/create.js'].lineData[360]++;
    withDataAndEvent = deep.withDataAndEvent;
    _$jscoverage['/base/create.js'].lineData[361]++;
    deep = deep.deep;
  }
  _$jscoverage['/base/create.js'].lineData[364]++;
  var elem = Dom.get(selector), clone, _fixCloneAttributes = Dom._fixCloneAttributes, elemNodeType;
  _$jscoverage['/base/create.js'].lineData[369]++;
  if (visit168_369_1(!elem)) {
    _$jscoverage['/base/create.js'].lineData[370]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[373]++;
  elemNodeType = elem.nodeType;
  _$jscoverage['/base/create.js'].lineData[379]++;
  clone = elem.cloneNode(deep);
  _$jscoverage['/base/create.js'].lineData[383]++;
  if (visit169_383_1(visit170_383_2(elemNodeType === NodeType.ELEMENT_NODE) || visit171_384_1(elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE))) {
    _$jscoverage['/base/create.js'].lineData[390]++;
    if (visit172_390_1(_fixCloneAttributes && visit173_390_2(elemNodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[391]++;
      _fixCloneAttributes(elem, clone);
    }
    _$jscoverage['/base/create.js'].lineData[394]++;
    if (visit174_394_1(deep && _fixCloneAttributes)) {
      _$jscoverage['/base/create.js'].lineData[395]++;
      processAll(_fixCloneAttributes, elem, clone);
    }
  }
  _$jscoverage['/base/create.js'].lineData[399]++;
  if (visit175_399_1(withDataAndEvent)) {
    _$jscoverage['/base/create.js'].lineData[400]++;
    cloneWithDataAndEvent(elem, clone);
    _$jscoverage['/base/create.js'].lineData[401]++;
    if (visit176_401_1(deep && deepWithDataAndEvent)) {
      _$jscoverage['/base/create.js'].lineData[402]++;
      processAll(cloneWithDataAndEvent, elem, clone);
    }
  }
  _$jscoverage['/base/create.js'].lineData[405]++;
  return clone;
}, 
  empty: function(selector) {
  _$jscoverage['/base/create.js'].functionData[12]++;
  _$jscoverage['/base/create.js'].lineData[413]++;
  var els = Dom.query(selector), el, i;
  _$jscoverage['/base/create.js'].lineData[415]++;
  for (i = els.length - 1; visit177_415_1(i >= 0); i--) {
    _$jscoverage['/base/create.js'].lineData[416]++;
    el = els[i];
    _$jscoverage['/base/create.js'].lineData[417]++;
    Dom.remove(el.childNodes);
  }
}, 
  _nodeListToFragment: nodeListToFragment});
  _$jscoverage['/base/create.js'].lineData[425]++;
  Dom.outerHTML = Dom.outerHtml;
  _$jscoverage['/base/create.js'].lineData[427]++;
  function processAll(fn, elem, clone) {
    _$jscoverage['/base/create.js'].functionData[13]++;
    _$jscoverage['/base/create.js'].lineData[428]++;
    var elemNodeType = elem.nodeType;
    _$jscoverage['/base/create.js'].lineData[429]++;
    if (visit178_429_1(elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
      _$jscoverage['/base/create.js'].lineData[430]++;
      var eCs = elem.childNodes, cloneCs = clone.childNodes, fIndex = 0;
      _$jscoverage['/base/create.js'].lineData[433]++;
      while (eCs[fIndex]) {
        _$jscoverage['/base/create.js'].lineData[434]++;
        if (visit179_434_1(cloneCs[fIndex])) {
          _$jscoverage['/base/create.js'].lineData[435]++;
          processAll(fn, eCs[fIndex], cloneCs[fIndex]);
        }
        _$jscoverage['/base/create.js'].lineData[437]++;
        fIndex++;
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[439]++;
      if (visit180_439_1(elemNodeType === NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[440]++;
        var elemChildren = getElementsByTagName(elem, '*'), cloneChildren = getElementsByTagName(clone, '*'), cIndex = 0;
        _$jscoverage['/base/create.js'].lineData[443]++;
        while (elemChildren[cIndex]) {
          _$jscoverage['/base/create.js'].lineData[444]++;
          if (visit181_444_1(cloneChildren[cIndex])) {
            _$jscoverage['/base/create.js'].lineData[445]++;
            fn(elemChildren[cIndex], cloneChildren[cIndex]);
          }
          _$jscoverage['/base/create.js'].lineData[447]++;
          cIndex++;
        }
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[453]++;
  function cloneWithDataAndEvent(src, dest) {
    _$jscoverage['/base/create.js'].functionData[14]++;
    _$jscoverage['/base/create.js'].lineData[454]++;
    var DOMEvent = S.require('event/dom'), srcData, d;
    _$jscoverage['/base/create.js'].lineData[458]++;
    if (visit182_458_1(visit183_458_2(dest.nodeType === NodeType.ELEMENT_NODE) && !Dom.hasData(src))) {
      _$jscoverage['/base/create.js'].lineData[459]++;
      return;
    }
    _$jscoverage['/base/create.js'].lineData[462]++;
    srcData = Dom.data(src);
    _$jscoverage['/base/create.js'].lineData[465]++;
    for (d in srcData) {
      _$jscoverage['/base/create.js'].lineData[466]++;
      Dom.data(dest, d, srcData[d]);
    }
    _$jscoverage['/base/create.js'].lineData[470]++;
    if (visit184_470_1(DOMEvent)) {
      _$jscoverage['/base/create.js'].lineData[472]++;
      DOMEvent.clone(src, dest);
    }
  }
  _$jscoverage['/base/create.js'].lineData[477]++;
  function attachProps(elem, props) {
    _$jscoverage['/base/create.js'].functionData[15]++;
    _$jscoverage['/base/create.js'].lineData[478]++;
    if (visit185_478_1(S.isPlainObject(props))) {
      _$jscoverage['/base/create.js'].lineData[479]++;
      if (visit186_479_1(elem.nodeType === NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[480]++;
        Dom.attr(elem, props, true);
      } else {
        _$jscoverage['/base/create.js'].lineData[481]++;
        if (visit187_481_1(elem.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
          _$jscoverage['/base/create.js'].lineData[483]++;
          Dom.attr(elem.childNodes, props, true);
        }
      }
    }
    _$jscoverage['/base/create.js'].lineData[486]++;
    return elem;
  }
  _$jscoverage['/base/create.js'].lineData[490]++;
  function nodeListToFragment(nodes) {
    _$jscoverage['/base/create.js'].functionData[16]++;
    _$jscoverage['/base/create.js'].lineData[491]++;
    var ret = null, i, ownerDoc, len;
    _$jscoverage['/base/create.js'].lineData[495]++;
    if (visit188_495_1(nodes && visit189_495_2((visit190_495_3(nodes.push || nodes.item)) && nodes[0]))) {
      _$jscoverage['/base/create.js'].lineData[496]++;
      ownerDoc = nodes[0].ownerDocument;
      _$jscoverage['/base/create.js'].lineData[497]++;
      ret = ownerDoc.createDocumentFragment();
      _$jscoverage['/base/create.js'].lineData[498]++;
      nodes = S.makeArray(nodes);
      _$jscoverage['/base/create.js'].lineData[499]++;
      for (i = 0 , len = nodes.length; visit191_499_1(i < len); i++) {
        _$jscoverage['/base/create.js'].lineData[500]++;
        ret.appendChild(nodes[i]);
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[503]++;
      logger.error('Unable to convert ' + nodes + ' to fragment.');
    }
    _$jscoverage['/base/create.js'].lineData[505]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[509]++;
  var creators = Dom._creators, create = Dom.create, creatorsMap = {
  area: 'map', 
  thead: 'table', 
  td: 'tr', 
  th: 'tr', 
  tr: 'tbody', 
  tbody: 'table', 
  tfoot: 'table', 
  caption: 'table', 
  colgroup: 'table', 
  col: 'colgroup', 
  legend: 'fieldset'}, p;
  _$jscoverage['/base/create.js'].lineData[525]++;
  for (p in creatorsMap) {
    _$jscoverage['/base/create.js'].lineData[527]++;
    (function(tag) {
  _$jscoverage['/base/create.js'].functionData[17]++;
  _$jscoverage['/base/create.js'].lineData[528]++;
  creators[p] = function(html, ownerDoc) {
  _$jscoverage['/base/create.js'].functionData[18]++;
  _$jscoverage['/base/create.js'].lineData[529]++;
  return create('<' + tag + '>' + html + '<' + '/' + tag + '>', undefined, ownerDoc);
};
})(creatorsMap[p]);
  }
  _$jscoverage['/base/create.js'].lineData[537]++;
  creators.option = creators.optgroup = function(html, ownerDoc) {
  _$jscoverage['/base/create.js'].functionData[19]++;
  _$jscoverage['/base/create.js'].lineData[538]++;
  return create('<select multiple="multiple">' + html + '</select>', undefined, ownerDoc);
};
  _$jscoverage['/base/create.js'].lineData[541]++;
  return Dom;
});
