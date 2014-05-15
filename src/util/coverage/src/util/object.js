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
if (! _$jscoverage['/util/object.js']) {
  _$jscoverage['/util/object.js'] = {};
  _$jscoverage['/util/object.js'].lineData = [];
  _$jscoverage['/util/object.js'].lineData[6] = 0;
  _$jscoverage['/util/object.js'].lineData[7] = 0;
  _$jscoverage['/util/object.js'].lineData[8] = 0;
  _$jscoverage['/util/object.js'].lineData[9] = 0;
  _$jscoverage['/util/object.js'].lineData[21] = 0;
  _$jscoverage['/util/object.js'].lineData[32] = 0;
  _$jscoverage['/util/object.js'].lineData[33] = 0;
  _$jscoverage['/util/object.js'].lineData[36] = 0;
  _$jscoverage['/util/object.js'].lineData[37] = 0;
  _$jscoverage['/util/object.js'].lineData[38] = 0;
  _$jscoverage['/util/object.js'].lineData[39] = 0;
  _$jscoverage['/util/object.js'].lineData[42] = 0;
  _$jscoverage['/util/object.js'].lineData[44] = 0;
  _$jscoverage['/util/object.js'].lineData[45] = 0;
  _$jscoverage['/util/object.js'].lineData[47] = 0;
  _$jscoverage['/util/object.js'].lineData[48] = 0;
  _$jscoverage['/util/object.js'].lineData[49] = 0;
  _$jscoverage['/util/object.js'].lineData[50] = 0;
  _$jscoverage['/util/object.js'].lineData[51] = 0;
  _$jscoverage['/util/object.js'].lineData[55] = 0;
  _$jscoverage['/util/object.js'].lineData[56] = 0;
  _$jscoverage['/util/object.js'].lineData[57] = 0;
  _$jscoverage['/util/object.js'].lineData[61] = 0;
  _$jscoverage['/util/object.js'].lineData[62] = 0;
  _$jscoverage['/util/object.js'].lineData[63] = 0;
  _$jscoverage['/util/object.js'].lineData[65] = 0;
  _$jscoverage['/util/object.js'].lineData[66] = 0;
  _$jscoverage['/util/object.js'].lineData[73] = 0;
  _$jscoverage['/util/object.js'].lineData[74] = 0;
  _$jscoverage['/util/object.js'].lineData[77] = 0;
  _$jscoverage['/util/object.js'].lineData[80] = 0;
  _$jscoverage['/util/object.js'].lineData[88] = 0;
  _$jscoverage['/util/object.js'].lineData[89] = 0;
  _$jscoverage['/util/object.js'].lineData[91] = 0;
  _$jscoverage['/util/object.js'].lineData[93] = 0;
  _$jscoverage['/util/object.js'].lineData[95] = 0;
  _$jscoverage['/util/object.js'].lineData[96] = 0;
  _$jscoverage['/util/object.js'].lineData[98] = 0;
  _$jscoverage['/util/object.js'].lineData[99] = 0;
  _$jscoverage['/util/object.js'].lineData[101] = 0;
  _$jscoverage['/util/object.js'].lineData[102] = 0;
  _$jscoverage['/util/object.js'].lineData[104] = 0;
  _$jscoverage['/util/object.js'].lineData[105] = 0;
  _$jscoverage['/util/object.js'].lineData[108] = 0;
  _$jscoverage['/util/object.js'].lineData[117] = 0;
  _$jscoverage['/util/object.js'].lineData[119] = 0;
  _$jscoverage['/util/object.js'].lineData[121] = 0;
  _$jscoverage['/util/object.js'].lineData[122] = 0;
  _$jscoverage['/util/object.js'].lineData[126] = 0;
  _$jscoverage['/util/object.js'].lineData[127] = 0;
  _$jscoverage['/util/object.js'].lineData[128] = 0;
  _$jscoverage['/util/object.js'].lineData[129] = 0;
  _$jscoverage['/util/object.js'].lineData[130] = 0;
  _$jscoverage['/util/object.js'].lineData[135] = 0;
  _$jscoverage['/util/object.js'].lineData[146] = 0;
  _$jscoverage['/util/object.js'].lineData[147] = 0;
  _$jscoverage['/util/object.js'].lineData[155] = 0;
  _$jscoverage['/util/object.js'].lineData[157] = 0;
  _$jscoverage['/util/object.js'].lineData[158] = 0;
  _$jscoverage['/util/object.js'].lineData[159] = 0;
  _$jscoverage['/util/object.js'].lineData[160] = 0;
  _$jscoverage['/util/object.js'].lineData[162] = 0;
  _$jscoverage['/util/object.js'].lineData[163] = 0;
  _$jscoverage['/util/object.js'].lineData[167] = 0;
  _$jscoverage['/util/object.js'].lineData[169] = 0;
  _$jscoverage['/util/object.js'].lineData[170] = 0;
  _$jscoverage['/util/object.js'].lineData[175] = 0;
  _$jscoverage['/util/object.js'].lineData[187] = 0;
  _$jscoverage['/util/object.js'].lineData[195] = 0;
  _$jscoverage['/util/object.js'].lineData[196] = 0;
  _$jscoverage['/util/object.js'].lineData[197] = 0;
  _$jscoverage['/util/object.js'].lineData[200] = 0;
  _$jscoverage['/util/object.js'].lineData[211] = 0;
  _$jscoverage['/util/object.js'].lineData[212] = 0;
  _$jscoverage['/util/object.js'].lineData[213] = 0;
  _$jscoverage['/util/object.js'].lineData[214] = 0;
  _$jscoverage['/util/object.js'].lineData[215] = 0;
  _$jscoverage['/util/object.js'].lineData[216] = 0;
  _$jscoverage['/util/object.js'].lineData[217] = 0;
  _$jscoverage['/util/object.js'].lineData[220] = 0;
  _$jscoverage['/util/object.js'].lineData[223] = 0;
  _$jscoverage['/util/object.js'].lineData[248] = 0;
  _$jscoverage['/util/object.js'].lineData[249] = 0;
  _$jscoverage['/util/object.js'].lineData[253] = 0;
  _$jscoverage['/util/object.js'].lineData[254] = 0;
  _$jscoverage['/util/object.js'].lineData[257] = 0;
  _$jscoverage['/util/object.js'].lineData[258] = 0;
  _$jscoverage['/util/object.js'].lineData[259] = 0;
  _$jscoverage['/util/object.js'].lineData[260] = 0;
  _$jscoverage['/util/object.js'].lineData[264] = 0;
  _$jscoverage['/util/object.js'].lineData[265] = 0;
  _$jscoverage['/util/object.js'].lineData[268] = 0;
  _$jscoverage['/util/object.js'].lineData[271] = 0;
  _$jscoverage['/util/object.js'].lineData[272] = 0;
  _$jscoverage['/util/object.js'].lineData[273] = 0;
  _$jscoverage['/util/object.js'].lineData[275] = 0;
  _$jscoverage['/util/object.js'].lineData[288] = 0;
  _$jscoverage['/util/object.js'].lineData[289] = 0;
  _$jscoverage['/util/object.js'].lineData[292] = 0;
  _$jscoverage['/util/object.js'].lineData[293] = 0;
  _$jscoverage['/util/object.js'].lineData[295] = 0;
  _$jscoverage['/util/object.js'].lineData[308] = 0;
  _$jscoverage['/util/object.js'].lineData[316] = 0;
  _$jscoverage['/util/object.js'].lineData[318] = 0;
  _$jscoverage['/util/object.js'].lineData[319] = 0;
  _$jscoverage['/util/object.js'].lineData[320] = 0;
  _$jscoverage['/util/object.js'].lineData[321] = 0;
  _$jscoverage['/util/object.js'].lineData[323] = 0;
  _$jscoverage['/util/object.js'].lineData[324] = 0;
  _$jscoverage['/util/object.js'].lineData[325] = 0;
  _$jscoverage['/util/object.js'].lineData[328] = 0;
  _$jscoverage['/util/object.js'].lineData[329] = 0;
  _$jscoverage['/util/object.js'].lineData[330] = 0;
  _$jscoverage['/util/object.js'].lineData[331] = 0;
  _$jscoverage['/util/object.js'].lineData[333] = 0;
  _$jscoverage['/util/object.js'].lineData[336] = 0;
  _$jscoverage['/util/object.js'].lineData[351] = 0;
  _$jscoverage['/util/object.js'].lineData[352] = 0;
  _$jscoverage['/util/object.js'].lineData[353] = 0;
  _$jscoverage['/util/object.js'].lineData[355] = 0;
  _$jscoverage['/util/object.js'].lineData[356] = 0;
  _$jscoverage['/util/object.js'].lineData[358] = 0;
  _$jscoverage['/util/object.js'].lineData[359] = 0;
  _$jscoverage['/util/object.js'].lineData[363] = 0;
  _$jscoverage['/util/object.js'].lineData[368] = 0;
  _$jscoverage['/util/object.js'].lineData[371] = 0;
  _$jscoverage['/util/object.js'].lineData[372] = 0;
  _$jscoverage['/util/object.js'].lineData[373] = 0;
  _$jscoverage['/util/object.js'].lineData[376] = 0;
  _$jscoverage['/util/object.js'].lineData[377] = 0;
  _$jscoverage['/util/object.js'].lineData[381] = 0;
  _$jscoverage['/util/object.js'].lineData[382] = 0;
  _$jscoverage['/util/object.js'].lineData[385] = 0;
  _$jscoverage['/util/object.js'].lineData[402] = 0;
  _$jscoverage['/util/object.js'].lineData[406] = 0;
  _$jscoverage['/util/object.js'].lineData[407] = 0;
  _$jscoverage['/util/object.js'].lineData[408] = 0;
  _$jscoverage['/util/object.js'].lineData[409] = 0;
  _$jscoverage['/util/object.js'].lineData[410] = 0;
  _$jscoverage['/util/object.js'].lineData[413] = 0;
  _$jscoverage['/util/object.js'].lineData[430] = 0;
  _$jscoverage['/util/object.js'].lineData[432] = 0;
  _$jscoverage['/util/object.js'].lineData[434] = 0;
  _$jscoverage['/util/object.js'].lineData[435] = 0;
  _$jscoverage['/util/object.js'].lineData[436] = 0;
  _$jscoverage['/util/object.js'].lineData[437] = 0;
  _$jscoverage['/util/object.js'].lineData[439] = 0;
  _$jscoverage['/util/object.js'].lineData[443] = 0;
  _$jscoverage['/util/object.js'].lineData[444] = 0;
  _$jscoverage['/util/object.js'].lineData[448] = 0;
  _$jscoverage['/util/object.js'].lineData[451] = 0;
  _$jscoverage['/util/object.js'].lineData[452] = 0;
  _$jscoverage['/util/object.js'].lineData[453] = 0;
  _$jscoverage['/util/object.js'].lineData[454] = 0;
  _$jscoverage['/util/object.js'].lineData[456] = 0;
  _$jscoverage['/util/object.js'].lineData[457] = 0;
  _$jscoverage['/util/object.js'].lineData[459] = 0;
  _$jscoverage['/util/object.js'].lineData[460] = 0;
  _$jscoverage['/util/object.js'].lineData[463] = 0;
  _$jscoverage['/util/object.js'].lineData[464] = 0;
  _$jscoverage['/util/object.js'].lineData[465] = 0;
  _$jscoverage['/util/object.js'].lineData[469] = 0;
  _$jscoverage['/util/object.js'].lineData[470] = 0;
  _$jscoverage['/util/object.js'].lineData[471] = 0;
  _$jscoverage['/util/object.js'].lineData[473] = 0;
  _$jscoverage['/util/object.js'].lineData[476] = 0;
  _$jscoverage['/util/object.js'].lineData[479] = 0;
  _$jscoverage['/util/object.js'].lineData[482] = 0;
  _$jscoverage['/util/object.js'].lineData[483] = 0;
  _$jscoverage['/util/object.js'].lineData[484] = 0;
  _$jscoverage['/util/object.js'].lineData[485] = 0;
  _$jscoverage['/util/object.js'].lineData[486] = 0;
  _$jscoverage['/util/object.js'].lineData[488] = 0;
  _$jscoverage['/util/object.js'].lineData[492] = 0;
  _$jscoverage['/util/object.js'].lineData[495] = 0;
  _$jscoverage['/util/object.js'].lineData[496] = 0;
  _$jscoverage['/util/object.js'].lineData[499] = 0;
  _$jscoverage['/util/object.js'].lineData[503] = 0;
  _$jscoverage['/util/object.js'].lineData[504] = 0;
  _$jscoverage['/util/object.js'].lineData[507] = 0;
  _$jscoverage['/util/object.js'].lineData[509] = 0;
  _$jscoverage['/util/object.js'].lineData[510] = 0;
  _$jscoverage['/util/object.js'].lineData[512] = 0;
  _$jscoverage['/util/object.js'].lineData[514] = 0;
  _$jscoverage['/util/object.js'].lineData[515] = 0;
  _$jscoverage['/util/object.js'].lineData[518] = 0;
  _$jscoverage['/util/object.js'].lineData[519] = 0;
  _$jscoverage['/util/object.js'].lineData[520] = 0;
  _$jscoverage['/util/object.js'].lineData[524] = 0;
  _$jscoverage['/util/object.js'].lineData[527] = 0;
  _$jscoverage['/util/object.js'].lineData[528] = 0;
  _$jscoverage['/util/object.js'].lineData[530] = 0;
  _$jscoverage['/util/object.js'].lineData[531] = 0;
  _$jscoverage['/util/object.js'].lineData[536] = 0;
  _$jscoverage['/util/object.js'].lineData[537] = 0;
  _$jscoverage['/util/object.js'].lineData[542] = 0;
  _$jscoverage['/util/object.js'].lineData[543] = 0;
  _$jscoverage['/util/object.js'].lineData[549] = 0;
  _$jscoverage['/util/object.js'].lineData[551] = 0;
  _$jscoverage['/util/object.js'].lineData[552] = 0;
  _$jscoverage['/util/object.js'].lineData[554] = 0;
  _$jscoverage['/util/object.js'].lineData[555] = 0;
  _$jscoverage['/util/object.js'].lineData[556] = 0;
  _$jscoverage['/util/object.js'].lineData[557] = 0;
  _$jscoverage['/util/object.js'].lineData[559] = 0;
  _$jscoverage['/util/object.js'].lineData[560] = 0;
  _$jscoverage['/util/object.js'].lineData[561] = 0;
  _$jscoverage['/util/object.js'].lineData[567] = 0;
  _$jscoverage['/util/object.js'].lineData[569] = 0;
  _$jscoverage['/util/object.js'].lineData[579] = 0;
  _$jscoverage['/util/object.js'].lineData[580] = 0;
  _$jscoverage['/util/object.js'].lineData[581] = 0;
  _$jscoverage['/util/object.js'].lineData[583] = 0;
  _$jscoverage['/util/object.js'].lineData[584] = 0;
  _$jscoverage['/util/object.js'].lineData[586] = 0;
  _$jscoverage['/util/object.js'].lineData[588] = 0;
  _$jscoverage['/util/object.js'].lineData[594] = 0;
}
if (! _$jscoverage['/util/object.js'].functionData) {
  _$jscoverage['/util/object.js'].functionData = [];
  _$jscoverage['/util/object.js'].functionData[0] = 0;
  _$jscoverage['/util/object.js'].functionData[1] = 0;
  _$jscoverage['/util/object.js'].functionData[2] = 0;
  _$jscoverage['/util/object.js'].functionData[3] = 0;
  _$jscoverage['/util/object.js'].functionData[4] = 0;
  _$jscoverage['/util/object.js'].functionData[5] = 0;
  _$jscoverage['/util/object.js'].functionData[6] = 0;
  _$jscoverage['/util/object.js'].functionData[7] = 0;
  _$jscoverage['/util/object.js'].functionData[8] = 0;
  _$jscoverage['/util/object.js'].functionData[9] = 0;
  _$jscoverage['/util/object.js'].functionData[10] = 0;
  _$jscoverage['/util/object.js'].functionData[11] = 0;
  _$jscoverage['/util/object.js'].functionData[12] = 0;
  _$jscoverage['/util/object.js'].functionData[13] = 0;
  _$jscoverage['/util/object.js'].functionData[14] = 0;
  _$jscoverage['/util/object.js'].functionData[15] = 0;
  _$jscoverage['/util/object.js'].functionData[16] = 0;
  _$jscoverage['/util/object.js'].functionData[17] = 0;
  _$jscoverage['/util/object.js'].functionData[18] = 0;
  _$jscoverage['/util/object.js'].functionData[19] = 0;
  _$jscoverage['/util/object.js'].functionData[20] = 0;
  _$jscoverage['/util/object.js'].functionData[21] = 0;
  _$jscoverage['/util/object.js'].functionData[22] = 0;
  _$jscoverage['/util/object.js'].functionData[23] = 0;
  _$jscoverage['/util/object.js'].functionData[24] = 0;
}
if (! _$jscoverage['/util/object.js'].branchData) {
  _$jscoverage['/util/object.js'].branchData = {};
  _$jscoverage['/util/object.js'].branchData['33'] = [];
  _$jscoverage['/util/object.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['33'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['33'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['33'][4] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['33'][5] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['44'] = [];
  _$jscoverage['/util/object.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['44'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['50'] = [];
  _$jscoverage['/util/object.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['56'] = [];
  _$jscoverage['/util/object.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['62'] = [];
  _$jscoverage['/util/object.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['65'] = [];
  _$jscoverage['/util/object.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['73'] = [];
  _$jscoverage['/util/object.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['73'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['73'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['88'] = [];
  _$jscoverage['/util/object.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['91'] = [];
  _$jscoverage['/util/object.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['91'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['91'][4] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['91'][5] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['91'][6] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['91'][7] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['93'] = [];
  _$jscoverage['/util/object.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['93'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['93'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['95'] = [];
  _$jscoverage['/util/object.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['96'] = [];
  _$jscoverage['/util/object.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['98'] = [];
  _$jscoverage['/util/object.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['98'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['98'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['99'] = [];
  _$jscoverage['/util/object.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['101'] = [];
  _$jscoverage['/util/object.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['101'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['102'] = [];
  _$jscoverage['/util/object.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['104'] = [];
  _$jscoverage['/util/object.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['104'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['104'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['108'] = [];
  _$jscoverage['/util/object.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['116'] = [];
  _$jscoverage['/util/object.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['121'] = [];
  _$jscoverage['/util/object.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['126'] = [];
  _$jscoverage['/util/object.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['127'] = [];
  _$jscoverage['/util/object.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['129'] = [];
  _$jscoverage['/util/object.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['146'] = [];
  _$jscoverage['/util/object.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['151'] = [];
  _$jscoverage['/util/object.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['153'] = [];
  _$jscoverage['/util/object.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['153'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['153'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['155'] = [];
  _$jscoverage['/util/object.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['157'] = [];
  _$jscoverage['/util/object.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['159'] = [];
  _$jscoverage['/util/object.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['162'] = [];
  _$jscoverage['/util/object.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['168'] = [];
  _$jscoverage['/util/object.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['169'] = [];
  _$jscoverage['/util/object.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['186'] = [];
  _$jscoverage['/util/object.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['196'] = [];
  _$jscoverage['/util/object.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['211'] = [];
  _$jscoverage['/util/object.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['213'] = [];
  _$jscoverage['/util/object.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['215'] = [];
  _$jscoverage['/util/object.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['248'] = [];
  _$jscoverage['/util/object.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['257'] = [];
  _$jscoverage['/util/object.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['257'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['264'] = [];
  _$jscoverage['/util/object.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['292'] = [];
  _$jscoverage['/util/object.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['318'] = [];
  _$jscoverage['/util/object.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['323'] = [];
  _$jscoverage['/util/object.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['328'] = [];
  _$jscoverage['/util/object.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['351'] = [];
  _$jscoverage['/util/object.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['352'] = [];
  _$jscoverage['/util/object.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['355'] = [];
  _$jscoverage['/util/object.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['358'] = [];
  _$jscoverage['/util/object.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['376'] = [];
  _$jscoverage['/util/object.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['381'] = [];
  _$jscoverage['/util/object.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['406'] = [];
  _$jscoverage['/util/object.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['409'] = [];
  _$jscoverage['/util/object.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['409'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['410'] = [];
  _$jscoverage['/util/object.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['435'] = [];
  _$jscoverage['/util/object.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['453'] = [];
  _$jscoverage['/util/object.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['470'] = [];
  _$jscoverage['/util/object.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['484'] = [];
  _$jscoverage['/util/object.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['486'] = [];
  _$jscoverage['/util/object.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['496'] = [];
  _$jscoverage['/util/object.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['503'] = [];
  _$jscoverage['/util/object.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['503'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['507'] = [];
  _$jscoverage['/util/object.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['509'] = [];
  _$jscoverage['/util/object.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['514'] = [];
  _$jscoverage['/util/object.js'].branchData['514'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['518'] = [];
  _$jscoverage['/util/object.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['518'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['518'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['519'] = [];
  _$jscoverage['/util/object.js'].branchData['519'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['524'] = [];
  _$jscoverage['/util/object.js'].branchData['524'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['524'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['530'] = [];
  _$jscoverage['/util/object.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['530'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['530'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['542'] = [];
  _$jscoverage['/util/object.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['549'] = [];
  _$jscoverage['/util/object.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['552'] = [];
  _$jscoverage['/util/object.js'].branchData['552'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['555'] = [];
  _$jscoverage['/util/object.js'].branchData['555'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['579'] = [];
  _$jscoverage['/util/object.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['580'] = [];
  _$jscoverage['/util/object.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['583'] = [];
  _$jscoverage['/util/object.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['586'] = [];
  _$jscoverage['/util/object.js'].branchData['586'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['586'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['587'] = [];
  _$jscoverage['/util/object.js'].branchData['587'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['587'][2] = new BranchData();
}
_$jscoverage['/util/object.js'].branchData['587'][2].init(50, 43, 'f.call(input, input[k], k, input) !== false');
function visit191_587_2(result) {
  _$jscoverage['/util/object.js'].branchData['587'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['587'][1].init(43, 51, '!f || (f.call(input, input[k], k, input) !== false)');
function visit190_587_1(result) {
  _$jscoverage['/util/object.js'].branchData['587'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['586'][2].init(24, 18, 'k !== CLONE_MARKER');
function visit189_586_2(result) {
  _$jscoverage['/util/object.js'].branchData['586'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['586'][1].init(24, 96, 'k !== CLONE_MARKER && (!f || (f.call(input, input[k], k, input) !== false))');
function visit188_586_1(result) {
  _$jscoverage['/util/object.js'].branchData['586'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['583'][1].init(2136, 13, 'isPlainObject');
function visit187_583_1(result) {
  _$jscoverage['/util/object.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['580'][1].init(30, 22, 'i < destination.length');
function visit186_580_1(result) {
  _$jscoverage['/util/object.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['579'][1].init(1953, 7, 'isArray');
function visit185_579_1(result) {
  _$jscoverage['/util/object.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['555'][1].init(93, 66, 'util.inArray(Constructor, [Boolean, String, Number, Date, RegExp])');
function visit184_555_1(result) {
  _$jscoverage['/util/object.js'].branchData['555'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['552'][1].init(515, 25, 'typeof input === \'object\'');
function visit183_552_1(result) {
  _$jscoverage['/util/object.js'].branchData['552'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['549'][1].init(385, 19, 'input[CLONE_MARKER]');
function visit182_549_1(result) {
  _$jscoverage['/util/object.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['542'][1].init(134, 6, '!input');
function visit181_542_1(result) {
  _$jscoverage['/util/object.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['530'][3].init(1095, 15, 'ov || !(p in r)');
function visit180_530_3(result) {
  _$jscoverage['/util/object.js'].branchData['530'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['530'][2].init(1077, 13, 'src !== undef');
function visit179_530_2(result) {
  _$jscoverage['/util/object.js'].branchData['530'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['530'][1].init(1077, 34, 'src !== undef && (ov || !(p in r))');
function visit178_530_1(result) {
  _$jscoverage['/util/object.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['524'][2].init(139, 50, 'util.isArray(target) || util.isPlainObject(target)');
function visit177_524_2(result) {
  _$jscoverage['/util/object.js'].branchData['524'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['524'][1].init(128, 62, 'target && (util.isArray(target) || util.isPlainObject(target))');
function visit176_524_1(result) {
  _$jscoverage['/util/object.js'].branchData['524'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['519'][1].init(22, 27, 'src[MIX_CIRCULAR_DETECTION]');
function visit175_519_1(result) {
  _$jscoverage['/util/object.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['518'][3].init(465, 44, 'util.isArray(src) || util.isPlainObject(src)');
function visit174_518_3(result) {
  _$jscoverage['/util/object.js'].branchData['518'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['518'][2].init(457, 53, 'src && (util.isArray(src) || util.isPlainObject(src))');
function visit173_518_2(result) {
  _$jscoverage['/util/object.js'].branchData['518'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['518'][1].init(449, 61, 'deep && src && (util.isArray(src) || util.isPlainObject(src))');
function visit172_518_1(result) {
  _$jscoverage['/util/object.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['514'][1].init(332, 2, 'wl');
function visit171_514_1(result) {
  _$jscoverage['/util/object.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['509'][1].init(65, 16, 'target === undef');
function visit170_509_1(result) {
  _$jscoverage['/util/object.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['507'][1].init(118, 14, 'target === src');
function visit169_507_1(result) {
  _$jscoverage['/util/object.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['503'][2].init(77, 17, '!(p in r) || deep');
function visit168_503_2(result) {
  _$jscoverage['/util/object.js'].branchData['503'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['503'][1].init(71, 23, 'ov || !(p in r) || deep');
function visit167_503_1(result) {
  _$jscoverage['/util/object.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['496'][1].init(17, 19, 'k === \'constructor\'');
function visit166_496_1(result) {
  _$jscoverage['/util/object.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['486'][1].init(44, 28, 'p !== MIX_CIRCULAR_DETECTION');
function visit165_486_1(result) {
  _$jscoverage['/util/object.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['484'][1].init(315, 7, 'i < len');
function visit164_484_1(result) {
  _$jscoverage['/util/object.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['470'][1].init(14, 8, '!s || !r');
function visit163_470_1(result) {
  _$jscoverage['/util/object.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['453'][1].init(37, 12, 'objectCreate');
function visit162_453_1(result) {
  _$jscoverage['/util/object.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['435'][1].init(84, 15, 'v[CLONE_MARKER]');
function visit161_435_1(result) {
  _$jscoverage['/util/object.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['410'][1].init(36, 13, 'o[p[j]] || {}');
function visit160_410_1(result) {
  _$jscoverage['/util/object.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['409'][2].init(133, 12, 'j < p.length');
function visit159_409_2(result) {
  _$jscoverage['/util/object.js'].branchData['409'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['409'][1].init(106, 16, 'host[p[0]] === o');
function visit158_409_1(result) {
  _$jscoverage['/util/object.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['406'][1].init(149, 5, 'i < l');
function visit157_406_1(result) {
  _$jscoverage['/util/object.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['381'][1].init(855, 2, 'sx');
function visit156_381_1(result) {
  _$jscoverage['/util/object.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['376'][1].init(743, 2, 'px');
function visit155_376_1(result) {
  _$jscoverage['/util/object.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['358'][1].init(224, 8, '!s || !r');
function visit154_358_1(result) {
  _$jscoverage['/util/object.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['355'][1].init(123, 2, '!s');
function visit153_355_1(result) {
  _$jscoverage['/util/object.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['352'][1].init(22, 2, '!r');
function visit152_352_1(result) {
  _$jscoverage['/util/object.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['351'][1].init(18, 9, '\'@DEBUG@\'');
function visit151_351_1(result) {
  _$jscoverage['/util/object.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['328'][1].init(534, 7, 'i < len');
function visit150_328_1(result) {
  _$jscoverage['/util/object.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['323'][1].init(417, 23, 'typeof ov !== \'boolean\'');
function visit149_323_1(result) {
  _$jscoverage['/util/object.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['318'][1].init(285, 17, '!util.isArray(wl)');
function visit148_318_1(result) {
  _$jscoverage['/util/object.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['292'][1].init(158, 5, 'i < l');
function visit147_292_1(result) {
  _$jscoverage['/util/object.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['264'][1].init(524, 12, 'ov === undef');
function visit146_264_1(result) {
  _$jscoverage['/util/object.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['257'][2].init(284, 24, 'typeof wl !== \'function\'');
function visit145_257_2(result) {
  _$jscoverage['/util/object.js'].branchData['257'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['257'][1].init(277, 32, 'wl && (typeof wl !== \'function\')');
function visit144_257_1(result) {
  _$jscoverage['/util/object.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['248'][1].init(18, 22, 'typeof ov === \'object\'');
function visit143_248_1(result) {
  _$jscoverage['/util/object.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['215'][1].init(162, 9, '!readOnly');
function visit142_215_1(result) {
  _$jscoverage['/util/object.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['213'][1].init(99, 4, 'guid');
function visit141_213_1(result) {
  _$jscoverage['/util/object.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['211'][1].init(23, 22, 'marker || STAMP_MARKER');
function visit140_211_1(result) {
  _$jscoverage['/util/object.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['196'][1].init(22, 11, 'p !== undef');
function visit139_196_1(result) {
  _$jscoverage['/util/object.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['186'][1].init(3777, 69, 'Date.now || function() {\n  return +new Date();\n}');
function visit138_186_1(result) {
  _$jscoverage['/util/object.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['169'][1].init(30, 42, 'fn.call(context, val, i, object) === false');
function visit137_169_1(result) {
  _$jscoverage['/util/object.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['168'][1].init(47, 10, 'i < length');
function visit136_168_1(result) {
  _$jscoverage['/util/object.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['162'][1].init(125, 52, 'fn.call(context, object[key], key, object) === false');
function visit135_162_1(result) {
  _$jscoverage['/util/object.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['159'][1].init(76, 15, 'i < keys.length');
function visit134_159_1(result) {
  _$jscoverage['/util/object.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['157'][1].init(402, 5, 'isObj');
function visit133_157_1(result) {
  _$jscoverage['/util/object.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['155'][1].init(362, 15, 'context || null');
function visit132_155_1(result) {
  _$jscoverage['/util/object.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['153'][3].init(267, 45, 'toString.call(object) === \'[object Function]\'');
function visit131_153_3(result) {
  _$jscoverage['/util/object.js'].branchData['153'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['153'][2].init(247, 16, 'length === undef');
function visit130_153_2(result) {
  _$jscoverage['/util/object.js'].branchData['153'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['153'][1].init(247, 65, 'length === undef || toString.call(object) === \'[object Function]\'');
function visit129_153_1(result) {
  _$jscoverage['/util/object.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['151'][1].init(119, 23, 'object && object.length');
function visit128_151_1(result) {
  _$jscoverage['/util/object.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['146'][1].init(18, 6, 'object');
function visit127_146_1(result) {
  _$jscoverage['/util/object.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['129'][1].init(70, 19, 'o.hasOwnProperty(p)');
function visit126_129_1(result) {
  _$jscoverage['/util/object.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['127'][1].init(54, 6, 'i >= 0');
function visit125_127_1(result) {
  _$jscoverage['/util/object.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['126'][1].init(241, 10, 'hasEnumBug');
function visit124_126_1(result) {
  _$jscoverage['/util/object.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['121'][1].init(62, 19, 'o.hasOwnProperty(p)');
function visit123_121_1(result) {
  _$jscoverage['/util/object.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['116'][1].init(1178, 582, 'Object.keys || function(o) {\n  var result = [], p, i;\n  for (p in o) {\n    if (o.hasOwnProperty(p)) {\n      result.push(p);\n    }\n  }\n  if (hasEnumBug) {\n    for (i = enumProperties.length - 1; i >= 0; i--) {\n      p = enumProperties[i];\n      if (o.hasOwnProperty(p)) {\n        result.push(p);\n      }\n    }\n  }\n  return result;\n}');
function visit122_116_1(result) {
  _$jscoverage['/util/object.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['108'][1].init(792, 7, 'a === b');
function visit121_108_1(result) {
  _$jscoverage['/util/object.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['104'][3].init(654, 21, 'typeof b === \'object\'');
function visit120_104_3(result) {
  _$jscoverage['/util/object.js'].branchData['104'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['104'][2].init(629, 21, 'typeof a === \'object\'');
function visit119_104_2(result) {
  _$jscoverage['/util/object.js'].branchData['104'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['104'][1].init(629, 46, 'typeof a === \'object\' && typeof b === \'object\'');
function visit118_104_1(result) {
  _$jscoverage['/util/object.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['102'][1].init(26, 7, 'a === b');
function visit117_102_1(result) {
  _$jscoverage['/util/object.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['101'][3].init(537, 21, 'typeof b === \'number\'');
function visit116_101_3(result) {
  _$jscoverage['/util/object.js'].branchData['101'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['101'][2].init(512, 21, 'typeof a === \'number\'');
function visit115_101_2(result) {
  _$jscoverage['/util/object.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['101'][1].init(512, 46, 'typeof a === \'number\' && typeof b === \'number\'');
function visit114_101_1(result) {
  _$jscoverage['/util/object.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['99'][1].init(26, 7, 'a === b');
function visit113_99_1(result) {
  _$jscoverage['/util/object.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['98'][3].init(420, 21, 'typeof b === \'string\'');
function visit112_98_3(result) {
  _$jscoverage['/util/object.js'].branchData['98'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['98'][2].init(395, 21, 'typeof a === \'string\'');
function visit111_98_2(result) {
  _$jscoverage['/util/object.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['98'][1].init(395, 46, 'typeof a === \'string\' && typeof b === \'string\'');
function visit110_98_1(result) {
  _$jscoverage['/util/object.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['96'][1].init(25, 27, 'a.getTime() === b.getTime()');
function visit109_96_1(result) {
  _$jscoverage['/util/object.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['95'][1].init(268, 38, 'a instanceof Date && b instanceof Date');
function visit108_95_1(result) {
  _$jscoverage['/util/object.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['93'][3].init(77, 9, 'b == null');
function visit107_93_3(result) {
  _$jscoverage['/util/object.js'].branchData['93'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['93'][2].init(64, 9, 'a == null');
function visit106_93_2(result) {
  _$jscoverage['/util/object.js'].branchData['93'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['93'][1].init(64, 22, 'a == null && b == null');
function visit105_93_1(result) {
  _$jscoverage['/util/object.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['91'][7].init(135, 10, 'b === null');
function visit104_91_7(result) {
  _$jscoverage['/util/object.js'].branchData['91'][7].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['91'][6].init(120, 11, 'b === undef');
function visit103_91_6(result) {
  _$jscoverage['/util/object.js'].branchData['91'][6].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['91'][5].init(120, 25, 'b === undef || b === null');
function visit102_91_5(result) {
  _$jscoverage['/util/object.js'].branchData['91'][5].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['91'][4].init(106, 10, 'a === null');
function visit101_91_4(result) {
  _$jscoverage['/util/object.js'].branchData['91'][4].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['91'][3].init(106, 39, 'a === null || b === undef || b === null');
function visit100_91_3(result) {
  _$jscoverage['/util/object.js'].branchData['91'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['91'][2].init(91, 11, 'a === undef');
function visit99_91_2(result) {
  _$jscoverage['/util/object.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['91'][1].init(91, 54, 'a === undef || a === null || b === undef || b === null');
function visit98_91_1(result) {
  _$jscoverage['/util/object.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['88'][1].init(18, 7, 'a === b');
function visit97_88_1(result) {
  _$jscoverage['/util/object.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['73'][3].init(1374, 21, 'a.length !== b.length');
function visit96_73_3(result) {
  _$jscoverage['/util/object.js'].branchData['73'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['73'][2].init(1355, 40, 'util.isArray(b) && a.length !== b.length');
function visit95_73_2(result) {
  _$jscoverage['/util/object.js'].branchData['73'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['73'][1].init(1336, 59, 'util.isArray(a) && util.isArray(b) && a.length !== b.length');
function visit94_73_1(result) {
  _$jscoverage['/util/object.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['65'][1].init(108, 38, '!util.equals(a[property], b[property])');
function visit93_65_1(result) {
  _$jscoverage['/util/object.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['62'][1].init(18, 27, 'property === COMPARE_MARKER');
function visit92_62_1(result) {
  _$jscoverage['/util/object.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['56'][1].init(18, 43, '!hasKey(b, property) && hasKey(a, property)');
function visit91_56_1(result) {
  _$jscoverage['/util/object.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['50'][1].init(18, 43, '!hasKey(a, property) && hasKey(b, property)');
function visit90_50_1(result) {
  _$jscoverage['/util/object.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['44'][3].init(78, 23, 'b[COMPARE_MARKER] === a');
function visit89_44_3(result) {
  _$jscoverage['/util/object.js'].branchData['44'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['44'][2].init(51, 23, 'a[COMPARE_MARKER] === b');
function visit88_44_2(result) {
  _$jscoverage['/util/object.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['44'][1].init(51, 50, 'a[COMPARE_MARKER] === b && b[COMPARE_MARKER] === a');
function visit87_44_1(result) {
  _$jscoverage['/util/object.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['33'][5].init(56, 26, 'obj[keyName] !== undefined');
function visit86_33_5(result) {
  _$jscoverage['/util/object.js'].branchData['33'][5].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['33'][4].init(34, 17, 'obj !== undefined');
function visit85_33_4(result) {
  _$jscoverage['/util/object.js'].branchData['33'][4].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['33'][3].init(18, 12, 'obj !== null');
function visit84_33_3(result) {
  _$jscoverage['/util/object.js'].branchData['33'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['33'][2].init(18, 33, 'obj !== null && obj !== undefined');
function visit83_33_2(result) {
  _$jscoverage['/util/object.js'].branchData['33'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['33'][1].init(18, 64, '(obj !== null && obj !== undefined) && obj[keyName] !== undefined');
function visit82_33_1(result) {
  _$jscoverage['/util/object.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/util/object.js'].functionData[0]++;
  _$jscoverage['/util/object.js'].lineData[7]++;
  var util = require('./base');
  _$jscoverage['/util/object.js'].lineData[8]++;
  var logger = S.getLogger('util');
  _$jscoverage['/util/object.js'].lineData[9]++;
  var MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR', STAMP_MARKER = '__~ks_stamped', host = S.Env.host, undef, CLONE_MARKER = '__~ks_cloned', EMPTY = '', toString = ({}).toString, COMPARE_MARKER = '__~ks_compared', Obj = Object, objectCreate = Obj.create;
  _$jscoverage['/util/object.js'].lineData[21]++;
  var hasEnumBug = !({
  toString: 1}.propertyIsEnumerable('toString')), enumProperties = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toString', 'toLocaleString', 'valueOf'];
  _$jscoverage['/util/object.js'].lineData[32]++;
  function hasKey(obj, keyName) {
    _$jscoverage['/util/object.js'].functionData[1]++;
    _$jscoverage['/util/object.js'].lineData[33]++;
    return visit82_33_1((visit83_33_2(visit84_33_3(obj !== null) && visit85_33_4(obj !== undefined))) && visit86_33_5(obj[keyName] !== undefined));
  }
  _$jscoverage['/util/object.js'].lineData[36]++;
  function cleanAndReturn(a, b, ret) {
    _$jscoverage['/util/object.js'].functionData[2]++;
    _$jscoverage['/util/object.js'].lineData[37]++;
    delete a[COMPARE_MARKER];
    _$jscoverage['/util/object.js'].lineData[38]++;
    delete b[COMPARE_MARKER];
    _$jscoverage['/util/object.js'].lineData[39]++;
    return ret;
  }
  _$jscoverage['/util/object.js'].lineData[42]++;
  function compareObjects(a, b) {
    _$jscoverage['/util/object.js'].functionData[3]++;
    _$jscoverage['/util/object.js'].lineData[44]++;
    if (visit87_44_1(visit88_44_2(a[COMPARE_MARKER] === b) && visit89_44_3(b[COMPARE_MARKER] === a))) {
      _$jscoverage['/util/object.js'].lineData[45]++;
      return true;
    }
    _$jscoverage['/util/object.js'].lineData[47]++;
    a[COMPARE_MARKER] = b;
    _$jscoverage['/util/object.js'].lineData[48]++;
    b[COMPARE_MARKER] = a;
    _$jscoverage['/util/object.js'].lineData[49]++;
    for (var property in b) {
      _$jscoverage['/util/object.js'].lineData[50]++;
      if (visit90_50_1(!hasKey(a, property) && hasKey(b, property))) {
        _$jscoverage['/util/object.js'].lineData[51]++;
        return cleanAndReturn(a, b, false);
      }
    }
    _$jscoverage['/util/object.js'].lineData[55]++;
    for (property in a) {
      _$jscoverage['/util/object.js'].lineData[56]++;
      if (visit91_56_1(!hasKey(b, property) && hasKey(a, property))) {
        _$jscoverage['/util/object.js'].lineData[57]++;
        return cleanAndReturn(a, b, false);
      }
    }
    _$jscoverage['/util/object.js'].lineData[61]++;
    for (property in b) {
      _$jscoverage['/util/object.js'].lineData[62]++;
      if (visit92_62_1(property === COMPARE_MARKER)) {
        _$jscoverage['/util/object.js'].lineData[63]++;
        continue;
      }
      _$jscoverage['/util/object.js'].lineData[65]++;
      if (visit93_65_1(!util.equals(a[property], b[property]))) {
        _$jscoverage['/util/object.js'].lineData[66]++;
        return cleanAndReturn(a, b, false);
      }
    }
    _$jscoverage['/util/object.js'].lineData[73]++;
    if (visit94_73_1(util.isArray(a) && visit95_73_2(util.isArray(b) && visit96_73_3(a.length !== b.length)))) {
      _$jscoverage['/util/object.js'].lineData[74]++;
      return cleanAndReturn(a, b, false);
    }
    _$jscoverage['/util/object.js'].lineData[77]++;
    return cleanAndReturn(a, b, true);
  }
  _$jscoverage['/util/object.js'].lineData[80]++;
  mix(util, {
  equals: function(a, b) {
  _$jscoverage['/util/object.js'].functionData[4]++;
  _$jscoverage['/util/object.js'].lineData[88]++;
  if (visit97_88_1(a === b)) {
    _$jscoverage['/util/object.js'].lineData[89]++;
    return true;
  }
  _$jscoverage['/util/object.js'].lineData[91]++;
  if (visit98_91_1(visit99_91_2(a === undef) || visit100_91_3(visit101_91_4(a === null) || visit102_91_5(visit103_91_6(b === undef) || visit104_91_7(b === null))))) {
    _$jscoverage['/util/object.js'].lineData[93]++;
    return visit105_93_1(visit106_93_2(a == null) && visit107_93_3(b == null));
  }
  _$jscoverage['/util/object.js'].lineData[95]++;
  if (visit108_95_1(a instanceof Date && b instanceof Date)) {
    _$jscoverage['/util/object.js'].lineData[96]++;
    return visit109_96_1(a.getTime() === b.getTime());
  }
  _$jscoverage['/util/object.js'].lineData[98]++;
  if (visit110_98_1(visit111_98_2(typeof a === 'string') && visit112_98_3(typeof b === 'string'))) {
    _$jscoverage['/util/object.js'].lineData[99]++;
    return (visit113_99_1(a === b));
  }
  _$jscoverage['/util/object.js'].lineData[101]++;
  if (visit114_101_1(visit115_101_2(typeof a === 'number') && visit116_101_3(typeof b === 'number'))) {
    _$jscoverage['/util/object.js'].lineData[102]++;
    return (visit117_102_1(a === b));
  }
  _$jscoverage['/util/object.js'].lineData[104]++;
  if (visit118_104_1(visit119_104_2(typeof a === 'object') && visit120_104_3(typeof b === 'object'))) {
    _$jscoverage['/util/object.js'].lineData[105]++;
    return compareObjects(a, b);
  }
  _$jscoverage['/util/object.js'].lineData[108]++;
  return (visit121_108_1(a === b));
}, 
  keys: visit122_116_1(Object.keys || function(o) {
  _$jscoverage['/util/object.js'].functionData[5]++;
  _$jscoverage['/util/object.js'].lineData[117]++;
  var result = [], p, i;
  _$jscoverage['/util/object.js'].lineData[119]++;
  for (p in o) {
    _$jscoverage['/util/object.js'].lineData[121]++;
    if (visit123_121_1(o.hasOwnProperty(p))) {
      _$jscoverage['/util/object.js'].lineData[122]++;
      result.push(p);
    }
  }
  _$jscoverage['/util/object.js'].lineData[126]++;
  if (visit124_126_1(hasEnumBug)) {
    _$jscoverage['/util/object.js'].lineData[127]++;
    for (i = enumProperties.length - 1; visit125_127_1(i >= 0); i--) {
      _$jscoverage['/util/object.js'].lineData[128]++;
      p = enumProperties[i];
      _$jscoverage['/util/object.js'].lineData[129]++;
      if (visit126_129_1(o.hasOwnProperty(p))) {
        _$jscoverage['/util/object.js'].lineData[130]++;
        result.push(p);
      }
    }
  }
  _$jscoverage['/util/object.js'].lineData[135]++;
  return result;
}), 
  each: function(object, fn, context) {
  _$jscoverage['/util/object.js'].functionData[6]++;
  _$jscoverage['/util/object.js'].lineData[146]++;
  if (visit127_146_1(object)) {
    _$jscoverage['/util/object.js'].lineData[147]++;
    var key, val, keys, i = 0, length = visit128_151_1(object && object.length), isObj = visit129_153_1(visit130_153_2(length === undef) || visit131_153_3(toString.call(object) === '[object Function]'));
    _$jscoverage['/util/object.js'].lineData[155]++;
    context = visit132_155_1(context || null);
    _$jscoverage['/util/object.js'].lineData[157]++;
    if (visit133_157_1(isObj)) {
      _$jscoverage['/util/object.js'].lineData[158]++;
      keys = util.keys(object);
      _$jscoverage['/util/object.js'].lineData[159]++;
      for (; visit134_159_1(i < keys.length); i++) {
        _$jscoverage['/util/object.js'].lineData[160]++;
        key = keys[i];
        _$jscoverage['/util/object.js'].lineData[162]++;
        if (visit135_162_1(fn.call(context, object[key], key, object) === false)) {
          _$jscoverage['/util/object.js'].lineData[163]++;
          break;
        }
      }
    } else {
      _$jscoverage['/util/object.js'].lineData[167]++;
      for (val = object[0]; visit136_168_1(i < length); val = object[++i]) {
        _$jscoverage['/util/object.js'].lineData[169]++;
        if (visit137_169_1(fn.call(context, val, i, object) === false)) {
          _$jscoverage['/util/object.js'].lineData[170]++;
          break;
        }
      }
    }
  }
  _$jscoverage['/util/object.js'].lineData[175]++;
  return object;
}, 
  now: visit138_186_1(Date.now || function() {
  _$jscoverage['/util/object.js'].functionData[7]++;
  _$jscoverage['/util/object.js'].lineData[187]++;
  return +new Date();
}), 
  isEmptyObject: function(o) {
  _$jscoverage['/util/object.js'].functionData[8]++;
  _$jscoverage['/util/object.js'].lineData[195]++;
  for (var p in o) {
    _$jscoverage['/util/object.js'].lineData[196]++;
    if (visit139_196_1(p !== undef)) {
      _$jscoverage['/util/object.js'].lineData[197]++;
      return false;
    }
  }
  _$jscoverage['/util/object.js'].lineData[200]++;
  return true;
}, 
  stamp: function(o, readOnly, marker) {
  _$jscoverage['/util/object.js'].functionData[9]++;
  _$jscoverage['/util/object.js'].lineData[211]++;
  marker = visit140_211_1(marker || STAMP_MARKER);
  _$jscoverage['/util/object.js'].lineData[212]++;
  var guid = o[marker];
  _$jscoverage['/util/object.js'].lineData[213]++;
  if (visit141_213_1(guid)) {
    _$jscoverage['/util/object.js'].lineData[214]++;
    return guid;
  } else {
    _$jscoverage['/util/object.js'].lineData[215]++;
    if (visit142_215_1(!readOnly)) {
      _$jscoverage['/util/object.js'].lineData[216]++;
      try {
        _$jscoverage['/util/object.js'].lineData[217]++;
        guid = o[marker] = util.guid(marker);
      }      catch (e) {
  _$jscoverage['/util/object.js'].lineData[220]++;
  guid = undef;
}
    }
  }
  _$jscoverage['/util/object.js'].lineData[223]++;
  return guid;
}, 
  mix: function(r, s, ov, wl, deep) {
  _$jscoverage['/util/object.js'].functionData[10]++;
  _$jscoverage['/util/object.js'].lineData[248]++;
  if (visit143_248_1(typeof ov === 'object')) {
    _$jscoverage['/util/object.js'].lineData[249]++;
    wl = ov.whitelist;
    _$jscoverage['/util/object.js'].lineData[253]++;
    deep = ov.deep;
    _$jscoverage['/util/object.js'].lineData[254]++;
    ov = ov.overwrite;
  }
  _$jscoverage['/util/object.js'].lineData[257]++;
  if (visit144_257_1(wl && (visit145_257_2(typeof wl !== 'function')))) {
    _$jscoverage['/util/object.js'].lineData[258]++;
    var originalWl = wl;
    _$jscoverage['/util/object.js'].lineData[259]++;
    wl = function(name, val) {
  _$jscoverage['/util/object.js'].functionData[11]++;
  _$jscoverage['/util/object.js'].lineData[260]++;
  return util.inArray(name, originalWl) ? val : undef;
};
  }
  _$jscoverage['/util/object.js'].lineData[264]++;
  if (visit146_264_1(ov === undef)) {
    _$jscoverage['/util/object.js'].lineData[265]++;
    ov = true;
  }
  _$jscoverage['/util/object.js'].lineData[268]++;
  var cache = [], c, i = 0;
  _$jscoverage['/util/object.js'].lineData[271]++;
  mixInternal(r, s, ov, wl, deep, cache);
  _$jscoverage['/util/object.js'].lineData[272]++;
  while ((c = cache[i++])) {
    _$jscoverage['/util/object.js'].lineData[273]++;
    delete c[MIX_CIRCULAR_DETECTION];
  }
  _$jscoverage['/util/object.js'].lineData[275]++;
  return r;
}, 
  merge: function(varArgs) {
  _$jscoverage['/util/object.js'].functionData[12]++;
  _$jscoverage['/util/object.js'].lineData[288]++;
  varArgs = util.makeArray(arguments);
  _$jscoverage['/util/object.js'].lineData[289]++;
  var o = {}, i, l = varArgs.length;
  _$jscoverage['/util/object.js'].lineData[292]++;
  for (i = 0; visit147_292_1(i < l); i++) {
    _$jscoverage['/util/object.js'].lineData[293]++;
    util.mix(o, varArgs[i]);
  }
  _$jscoverage['/util/object.js'].lineData[295]++;
  return o;
}, 
  augment: function(r, varArgs) {
  _$jscoverage['/util/object.js'].functionData[13]++;
  _$jscoverage['/util/object.js'].lineData[308]++;
  var args = util.makeArray(arguments), len = args.length - 2, i = 1, proto, arg, ov = args[len], wl = args[len + 1];
  _$jscoverage['/util/object.js'].lineData[316]++;
  args[1] = varArgs;
  _$jscoverage['/util/object.js'].lineData[318]++;
  if (visit148_318_1(!util.isArray(wl))) {
    _$jscoverage['/util/object.js'].lineData[319]++;
    ov = wl;
    _$jscoverage['/util/object.js'].lineData[320]++;
    wl = undef;
    _$jscoverage['/util/object.js'].lineData[321]++;
    len++;
  }
  _$jscoverage['/util/object.js'].lineData[323]++;
  if (visit149_323_1(typeof ov !== 'boolean')) {
    _$jscoverage['/util/object.js'].lineData[324]++;
    ov = undef;
    _$jscoverage['/util/object.js'].lineData[325]++;
    len++;
  }
  _$jscoverage['/util/object.js'].lineData[328]++;
  for (; visit150_328_1(i < len); i++) {
    _$jscoverage['/util/object.js'].lineData[329]++;
    arg = args[i];
    _$jscoverage['/util/object.js'].lineData[330]++;
    if ((proto = arg.prototype)) {
      _$jscoverage['/util/object.js'].lineData[331]++;
      arg = util.mix({}, proto, true, removeConstructor);
    }
    _$jscoverage['/util/object.js'].lineData[333]++;
    util.mix(r.prototype, arg, ov, wl);
  }
  _$jscoverage['/util/object.js'].lineData[336]++;
  return r;
}, 
  extend: function(r, s, px, sx) {
  _$jscoverage['/util/object.js'].functionData[14]++;
  _$jscoverage['/util/object.js'].lineData[351]++;
  if (visit151_351_1('@DEBUG@')) {
    _$jscoverage['/util/object.js'].lineData[352]++;
    if (visit152_352_1(!r)) {
      _$jscoverage['/util/object.js'].lineData[353]++;
      logger.error('extend r is null');
    }
    _$jscoverage['/util/object.js'].lineData[355]++;
    if (visit153_355_1(!s)) {
      _$jscoverage['/util/object.js'].lineData[356]++;
      logger.error('extend s is null');
    }
    _$jscoverage['/util/object.js'].lineData[358]++;
    if (visit154_358_1(!s || !r)) {
      _$jscoverage['/util/object.js'].lineData[359]++;
      return r;
    }
  }
  _$jscoverage['/util/object.js'].lineData[363]++;
  var sp = s.prototype, rp;
  _$jscoverage['/util/object.js'].lineData[368]++;
  sp.constructor = s;
  _$jscoverage['/util/object.js'].lineData[371]++;
  rp = createObject(sp, r);
  _$jscoverage['/util/object.js'].lineData[372]++;
  r.prototype = util.mix(rp, r.prototype);
  _$jscoverage['/util/object.js'].lineData[373]++;
  r.superclass = sp;
  _$jscoverage['/util/object.js'].lineData[376]++;
  if (visit155_376_1(px)) {
    _$jscoverage['/util/object.js'].lineData[377]++;
    util.mix(rp, px);
  }
  _$jscoverage['/util/object.js'].lineData[381]++;
  if (visit156_381_1(sx)) {
    _$jscoverage['/util/object.js'].lineData[382]++;
    util.mix(r, sx);
  }
  _$jscoverage['/util/object.js'].lineData[385]++;
  return r;
}, 
  namespace: function() {
  _$jscoverage['/util/object.js'].functionData[15]++;
  _$jscoverage['/util/object.js'].lineData[402]++;
  var args = util.makeArray(arguments), l = args.length, o = null, i, j, p;
  _$jscoverage['/util/object.js'].lineData[406]++;
  for (i = 0; visit157_406_1(i < l); i++) {
    _$jscoverage['/util/object.js'].lineData[407]++;
    p = (EMPTY + args[i]).split('.');
    _$jscoverage['/util/object.js'].lineData[408]++;
    o = host;
    _$jscoverage['/util/object.js'].lineData[409]++;
    for (j = (visit158_409_1(host[p[0]] === o)) ? 1 : 0; visit159_409_2(j < p.length); ++j) {
      _$jscoverage['/util/object.js'].lineData[410]++;
      o = o[p[j]] = visit160_410_1(o[p[j]] || {});
    }
  }
  _$jscoverage['/util/object.js'].lineData[413]++;
  return o;
}, 
  clone: function(input, filter) {
  _$jscoverage['/util/object.js'].functionData[16]++;
  _$jscoverage['/util/object.js'].lineData[430]++;
  var memory = {}, ret = cloneInternal(input, filter, memory);
  _$jscoverage['/util/object.js'].lineData[432]++;
  util.each(memory, function(v) {
  _$jscoverage['/util/object.js'].functionData[17]++;
  _$jscoverage['/util/object.js'].lineData[434]++;
  v = v.input;
  _$jscoverage['/util/object.js'].lineData[435]++;
  if (visit161_435_1(v[CLONE_MARKER])) {
    _$jscoverage['/util/object.js'].lineData[436]++;
    try {
      _$jscoverage['/util/object.js'].lineData[437]++;
      delete v[CLONE_MARKER];
    }    catch (e) {
  _$jscoverage['/util/object.js'].lineData[439]++;
  v[CLONE_MARKER] = undefined;
}
  }
});
  _$jscoverage['/util/object.js'].lineData[443]++;
  memory = null;
  _$jscoverage['/util/object.js'].lineData[444]++;
  return ret;
}});
  _$jscoverage['/util/object.js'].lineData[448]++;
  function Empty() {
    _$jscoverage['/util/object.js'].functionData[18]++;
  }
  _$jscoverage['/util/object.js'].lineData[451]++;
  function createObject(proto, constructor) {
    _$jscoverage['/util/object.js'].functionData[19]++;
    _$jscoverage['/util/object.js'].lineData[452]++;
    var newProto;
    _$jscoverage['/util/object.js'].lineData[453]++;
    if (visit162_453_1(objectCreate)) {
      _$jscoverage['/util/object.js'].lineData[454]++;
      newProto = objectCreate(proto);
    } else {
      _$jscoverage['/util/object.js'].lineData[456]++;
      Empty.prototype = proto;
      _$jscoverage['/util/object.js'].lineData[457]++;
      newProto = new Empty();
    }
    _$jscoverage['/util/object.js'].lineData[459]++;
    newProto.constructor = constructor;
    _$jscoverage['/util/object.js'].lineData[460]++;
    return newProto;
  }
  _$jscoverage['/util/object.js'].lineData[463]++;
  function mix(r, s) {
    _$jscoverage['/util/object.js'].functionData[20]++;
    _$jscoverage['/util/object.js'].lineData[464]++;
    for (var i in s) {
      _$jscoverage['/util/object.js'].lineData[465]++;
      r[i] = s[i];
    }
  }
  _$jscoverage['/util/object.js'].lineData[469]++;
  function mixInternal(r, s, ov, wl, deep, cache) {
    _$jscoverage['/util/object.js'].functionData[21]++;
    _$jscoverage['/util/object.js'].lineData[470]++;
    if (visit163_470_1(!s || !r)) {
      _$jscoverage['/util/object.js'].lineData[471]++;
      return r;
    }
    _$jscoverage['/util/object.js'].lineData[473]++;
    var i, p, keys, len;
    _$jscoverage['/util/object.js'].lineData[476]++;
    s[MIX_CIRCULAR_DETECTION] = r;
    _$jscoverage['/util/object.js'].lineData[479]++;
    cache.push(s);
    _$jscoverage['/util/object.js'].lineData[482]++;
    keys = util.keys(s);
    _$jscoverage['/util/object.js'].lineData[483]++;
    len = keys.length;
    _$jscoverage['/util/object.js'].lineData[484]++;
    for (i = 0; visit164_484_1(i < len); i++) {
      _$jscoverage['/util/object.js'].lineData[485]++;
      p = keys[i];
      _$jscoverage['/util/object.js'].lineData[486]++;
      if (visit165_486_1(p !== MIX_CIRCULAR_DETECTION)) {
        _$jscoverage['/util/object.js'].lineData[488]++;
        _mix(p, r, s, ov, wl, deep, cache);
      }
    }
    _$jscoverage['/util/object.js'].lineData[492]++;
    return r;
  }
  _$jscoverage['/util/object.js'].lineData[495]++;
  function removeConstructor(k, v) {
    _$jscoverage['/util/object.js'].functionData[22]++;
    _$jscoverage['/util/object.js'].lineData[496]++;
    return visit166_496_1(k === 'constructor') ? undef : v;
  }
  _$jscoverage['/util/object.js'].lineData[499]++;
  function _mix(p, r, s, ov, wl, deep, cache) {
    _$jscoverage['/util/object.js'].functionData[23]++;
    _$jscoverage['/util/object.js'].lineData[503]++;
    if (visit167_503_1(ov || visit168_503_2(!(p in r) || deep))) {
      _$jscoverage['/util/object.js'].lineData[504]++;
      var target = r[p], src = s[p];
      _$jscoverage['/util/object.js'].lineData[507]++;
      if (visit169_507_1(target === src)) {
        _$jscoverage['/util/object.js'].lineData[509]++;
        if (visit170_509_1(target === undef)) {
          _$jscoverage['/util/object.js'].lineData[510]++;
          r[p] = target;
        }
        _$jscoverage['/util/object.js'].lineData[512]++;
        return;
      }
      _$jscoverage['/util/object.js'].lineData[514]++;
      if (visit171_514_1(wl)) {
        _$jscoverage['/util/object.js'].lineData[515]++;
        src = wl.call(s, p, src);
      }
      _$jscoverage['/util/object.js'].lineData[518]++;
      if (visit172_518_1(deep && visit173_518_2(src && (visit174_518_3(util.isArray(src) || util.isPlainObject(src)))))) {
        _$jscoverage['/util/object.js'].lineData[519]++;
        if (visit175_519_1(src[MIX_CIRCULAR_DETECTION])) {
          _$jscoverage['/util/object.js'].lineData[520]++;
          r[p] = src[MIX_CIRCULAR_DETECTION];
        } else {
          _$jscoverage['/util/object.js'].lineData[524]++;
          var clone = visit176_524_1(target && (visit177_524_2(util.isArray(target) || util.isPlainObject(target)))) ? target : (util.isArray(src) ? [] : {});
          _$jscoverage['/util/object.js'].lineData[527]++;
          r[p] = clone;
          _$jscoverage['/util/object.js'].lineData[528]++;
          mixInternal(clone, src, ov, wl, true, cache);
        }
      } else {
        _$jscoverage['/util/object.js'].lineData[530]++;
        if (visit178_530_1(visit179_530_2(src !== undef) && (visit180_530_3(ov || !(p in r))))) {
          _$jscoverage['/util/object.js'].lineData[531]++;
          r[p] = src;
        }
      }
    }
  }
  _$jscoverage['/util/object.js'].lineData[536]++;
  function cloneInternal(input, f, memory) {
    _$jscoverage['/util/object.js'].functionData[24]++;
    _$jscoverage['/util/object.js'].lineData[537]++;
    var destination = input, isArray, isPlainObject, k, stamp;
    _$jscoverage['/util/object.js'].lineData[542]++;
    if (visit181_542_1(!input)) {
      _$jscoverage['/util/object.js'].lineData[543]++;
      return destination;
    }
    _$jscoverage['/util/object.js'].lineData[549]++;
    if (visit182_549_1(input[CLONE_MARKER])) {
      _$jscoverage['/util/object.js'].lineData[551]++;
      return memory[input[CLONE_MARKER]].destination;
    } else {
      _$jscoverage['/util/object.js'].lineData[552]++;
      if (visit183_552_1(typeof input === 'object')) {
        _$jscoverage['/util/object.js'].lineData[554]++;
        var Constructor = input.constructor;
        _$jscoverage['/util/object.js'].lineData[555]++;
        if (visit184_555_1(util.inArray(Constructor, [Boolean, String, Number, Date, RegExp]))) {
          _$jscoverage['/util/object.js'].lineData[556]++;
          destination = new Constructor(input.valueOf());
        } else {
          _$jscoverage['/util/object.js'].lineData[557]++;
          if ((isArray = util.isArray(input))) {
            _$jscoverage['/util/object.js'].lineData[559]++;
            destination = f ? util.filter(input, f) : input.concat();
          } else {
            _$jscoverage['/util/object.js'].lineData[560]++;
            if ((isPlainObject = util.isPlainObject(input))) {
              _$jscoverage['/util/object.js'].lineData[561]++;
              destination = {};
            }
          }
        }
        _$jscoverage['/util/object.js'].lineData[567]++;
        input[CLONE_MARKER] = (stamp = util.guid('c'));
        _$jscoverage['/util/object.js'].lineData[569]++;
        memory[stamp] = {
  destination: destination, 
  input: input};
      }
    }
    _$jscoverage['/util/object.js'].lineData[579]++;
    if (visit185_579_1(isArray)) {
      _$jscoverage['/util/object.js'].lineData[580]++;
      for (var i = 0; visit186_580_1(i < destination.length); i++) {
        _$jscoverage['/util/object.js'].lineData[581]++;
        destination[i] = cloneInternal(destination[i], f, memory);
      }
    } else {
      _$jscoverage['/util/object.js'].lineData[583]++;
      if (visit187_583_1(isPlainObject)) {
        _$jscoverage['/util/object.js'].lineData[584]++;
        for (k in input) {
          _$jscoverage['/util/object.js'].lineData[586]++;
          if (visit188_586_1(visit189_586_2(k !== CLONE_MARKER) && (visit190_587_1(!f || (visit191_587_2(f.call(input, input[k], k, input) !== false)))))) {
            _$jscoverage['/util/object.js'].lineData[588]++;
            destination[k] = cloneInternal(input[k], f, memory);
          }
        }
      }
    }
    _$jscoverage['/util/object.js'].lineData[594]++;
    return destination;
  }
});
