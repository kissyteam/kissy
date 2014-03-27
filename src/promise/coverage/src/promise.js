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
if (! _$jscoverage['/promise.js']) {
  _$jscoverage['/promise.js'] = {};
  _$jscoverage['/promise.js'].lineData = [];
  _$jscoverage['/promise.js'].lineData[6] = 0;
  _$jscoverage['/promise.js'].lineData[7] = 0;
  _$jscoverage['/promise.js'].lineData[8] = 0;
  _$jscoverage['/promise.js'].lineData[13] = 0;
  _$jscoverage['/promise.js'].lineData[15] = 0;
  _$jscoverage['/promise.js'].lineData[16] = 0;
  _$jscoverage['/promise.js'].lineData[25] = 0;
  _$jscoverage['/promise.js'].lineData[27] = 0;
  _$jscoverage['/promise.js'].lineData[29] = 0;
  _$jscoverage['/promise.js'].lineData[30] = 0;
  _$jscoverage['/promise.js'].lineData[33] = 0;
  _$jscoverage['/promise.js'].lineData[36] = 0;
  _$jscoverage['/promise.js'].lineData[37] = 0;
  _$jscoverage['/promise.js'].lineData[42] = 0;
  _$jscoverage['/promise.js'].lineData[43] = 0;
  _$jscoverage['/promise.js'].lineData[44] = 0;
  _$jscoverage['/promise.js'].lineData[46] = 0;
  _$jscoverage['/promise.js'].lineData[52] = 0;
  _$jscoverage['/promise.js'].lineData[53] = 0;
  _$jscoverage['/promise.js'].lineData[54] = 0;
  _$jscoverage['/promise.js'].lineData[65] = 0;
  _$jscoverage['/promise.js'].lineData[66] = 0;
  _$jscoverage['/promise.js'].lineData[67] = 0;
  _$jscoverage['/promise.js'].lineData[68] = 0;
  _$jscoverage['/promise.js'].lineData[76] = 0;
  _$jscoverage['/promise.js'].lineData[77] = 0;
  _$jscoverage['/promise.js'].lineData[80] = 0;
  _$jscoverage['/promise.js'].lineData[89] = 0;
  _$jscoverage['/promise.js'].lineData[91] = 0;
  _$jscoverage['/promise.js'].lineData[92] = 0;
  _$jscoverage['/promise.js'].lineData[96] = 0;
  _$jscoverage['/promise.js'].lineData[97] = 0;
  _$jscoverage['/promise.js'].lineData[98] = 0;
  _$jscoverage['/promise.js'].lineData[99] = 0;
  _$jscoverage['/promise.js'].lineData[100] = 0;
  _$jscoverage['/promise.js'].lineData[101] = 0;
  _$jscoverage['/promise.js'].lineData[103] = 0;
  _$jscoverage['/promise.js'].lineData[111] = 0;
  _$jscoverage['/promise.js'].lineData[118] = 0;
  _$jscoverage['/promise.js'].lineData[119] = 0;
  _$jscoverage['/promise.js'].lineData[120] = 0;
  _$jscoverage['/promise.js'].lineData[126] = 0;
  _$jscoverage['/promise.js'].lineData[127] = 0;
  _$jscoverage['/promise.js'].lineData[130] = 0;
  _$jscoverage['/promise.js'].lineData[131] = 0;
  _$jscoverage['/promise.js'].lineData[132] = 0;
  _$jscoverage['/promise.js'].lineData[143] = 0;
  _$jscoverage['/promise.js'].lineData[144] = 0;
  _$jscoverage['/promise.js'].lineData[145] = 0;
  _$jscoverage['/promise.js'].lineData[146] = 0;
  _$jscoverage['/promise.js'].lineData[147] = 0;
  _$jscoverage['/promise.js'].lineData[148] = 0;
  _$jscoverage['/promise.js'].lineData[149] = 0;
  _$jscoverage['/promise.js'].lineData[150] = 0;
  _$jscoverage['/promise.js'].lineData[152] = 0;
  _$jscoverage['/promise.js'].lineData[153] = 0;
  _$jscoverage['/promise.js'].lineData[158] = 0;
  _$jscoverage['/promise.js'].lineData[171] = 0;
  _$jscoverage['/promise.js'].lineData[172] = 0;
  _$jscoverage['/promise.js'].lineData[174] = 0;
  _$jscoverage['/promise.js'].lineData[181] = 0;
  _$jscoverage['/promise.js'].lineData[183] = 0;
  _$jscoverage['/promise.js'].lineData[184] = 0;
  _$jscoverage['/promise.js'].lineData[186] = 0;
  _$jscoverage['/promise.js'].lineData[187] = 0;
  _$jscoverage['/promise.js'].lineData[189] = 0;
  _$jscoverage['/promise.js'].lineData[190] = 0;
  _$jscoverage['/promise.js'].lineData[198] = 0;
  _$jscoverage['/promise.js'].lineData[207] = 0;
  _$jscoverage['/promise.js'].lineData[208] = 0;
  _$jscoverage['/promise.js'].lineData[210] = 0;
  _$jscoverage['/promise.js'].lineData[226] = 0;
  _$jscoverage['/promise.js'].lineData[228] = 0;
  _$jscoverage['/promise.js'].lineData[229] = 0;
  _$jscoverage['/promise.js'].lineData[230] = 0;
  _$jscoverage['/promise.js'].lineData[236] = 0;
  _$jscoverage['/promise.js'].lineData[246] = 0;
  _$jscoverage['/promise.js'].lineData[252] = 0;
  _$jscoverage['/promise.js'].lineData[261] = 0;
  _$jscoverage['/promise.js'].lineData[270] = 0;
  _$jscoverage['/promise.js'].lineData[271] = 0;
  _$jscoverage['/promise.js'].lineData[272] = 0;
  _$jscoverage['/promise.js'].lineData[274] = 0;
  _$jscoverage['/promise.js'].lineData[275] = 0;
  _$jscoverage['/promise.js'].lineData[276] = 0;
  _$jscoverage['/promise.js'].lineData[277] = 0;
  _$jscoverage['/promise.js'].lineData[281] = 0;
  _$jscoverage['/promise.js'].lineData[284] = 0;
  _$jscoverage['/promise.js'].lineData[287] = 0;
  _$jscoverage['/promise.js'].lineData[288] = 0;
  _$jscoverage['/promise.js'].lineData[292] = 0;
  _$jscoverage['/promise.js'].lineData[293] = 0;
  _$jscoverage['/promise.js'].lineData[294] = 0;
  _$jscoverage['/promise.js'].lineData[301] = 0;
  _$jscoverage['/promise.js'].lineData[302] = 0;
  _$jscoverage['/promise.js'].lineData[306] = 0;
  _$jscoverage['/promise.js'].lineData[307] = 0;
  _$jscoverage['/promise.js'].lineData[308] = 0;
  _$jscoverage['/promise.js'].lineData[315] = 0;
  _$jscoverage['/promise.js'].lineData[316] = 0;
  _$jscoverage['/promise.js'].lineData[320] = 0;
  _$jscoverage['/promise.js'].lineData[321] = 0;
  _$jscoverage['/promise.js'].lineData[322] = 0;
  _$jscoverage['/promise.js'].lineData[323] = 0;
  _$jscoverage['/promise.js'].lineData[325] = 0;
  _$jscoverage['/promise.js'].lineData[326] = 0;
  _$jscoverage['/promise.js'].lineData[327] = 0;
  _$jscoverage['/promise.js'].lineData[329] = 0;
  _$jscoverage['/promise.js'].lineData[330] = 0;
  _$jscoverage['/promise.js'].lineData[333] = 0;
  _$jscoverage['/promise.js'].lineData[334] = 0;
  _$jscoverage['/promise.js'].lineData[335] = 0;
  _$jscoverage['/promise.js'].lineData[336] = 0;
  _$jscoverage['/promise.js'].lineData[337] = 0;
  _$jscoverage['/promise.js'].lineData[339] = 0;
  _$jscoverage['/promise.js'].lineData[341] = 0;
  _$jscoverage['/promise.js'].lineData[344] = 0;
  _$jscoverage['/promise.js'].lineData[349] = 0;
  _$jscoverage['/promise.js'].lineData[352] = 0;
  _$jscoverage['/promise.js'].lineData[354] = 0;
  _$jscoverage['/promise.js'].lineData[369] = 0;
  _$jscoverage['/promise.js'].lineData[372] = 0;
  _$jscoverage['/promise.js'].lineData[375] = 0;
  _$jscoverage['/promise.js'].lineData[376] = 0;
  _$jscoverage['/promise.js'].lineData[377] = 0;
  _$jscoverage['/promise.js'].lineData[379] = 0;
  _$jscoverage['/promise.js'].lineData[417] = 0;
  _$jscoverage['/promise.js'].lineData[418] = 0;
  _$jscoverage['/promise.js'].lineData[420] = 0;
  _$jscoverage['/promise.js'].lineData[427] = 0;
  _$jscoverage['/promise.js'].lineData[436] = 0;
  _$jscoverage['/promise.js'].lineData[479] = 0;
  _$jscoverage['/promise.js'].lineData[480] = 0;
  _$jscoverage['/promise.js'].lineData[481] = 0;
  _$jscoverage['/promise.js'].lineData[483] = 0;
  _$jscoverage['/promise.js'].lineData[484] = 0;
  _$jscoverage['/promise.js'].lineData[486] = 0;
  _$jscoverage['/promise.js'].lineData[487] = 0;
  _$jscoverage['/promise.js'].lineData[488] = 0;
  _$jscoverage['/promise.js'].lineData[489] = 0;
  _$jscoverage['/promise.js'].lineData[492] = 0;
  _$jscoverage['/promise.js'].lineData[497] = 0;
  _$jscoverage['/promise.js'].lineData[501] = 0;
  _$jscoverage['/promise.js'].lineData[509] = 0;
  _$jscoverage['/promise.js'].lineData[510] = 0;
  _$jscoverage['/promise.js'].lineData[512] = 0;
  _$jscoverage['/promise.js'].lineData[513] = 0;
  _$jscoverage['/promise.js'].lineData[515] = 0;
  _$jscoverage['/promise.js'].lineData[516] = 0;
  _$jscoverage['/promise.js'].lineData[518] = 0;
  _$jscoverage['/promise.js'].lineData[520] = 0;
  _$jscoverage['/promise.js'].lineData[521] = 0;
  _$jscoverage['/promise.js'].lineData[523] = 0;
  _$jscoverage['/promise.js'].lineData[526] = 0;
  _$jscoverage['/promise.js'].lineData[527] = 0;
  _$jscoverage['/promise.js'].lineData[530] = 0;
  _$jscoverage['/promise.js'].lineData[531] = 0;
  _$jscoverage['/promise.js'].lineData[534] = 0;
  _$jscoverage['/promise.js'].lineData[538] = 0;
}
if (! _$jscoverage['/promise.js'].functionData) {
  _$jscoverage['/promise.js'].functionData = [];
  _$jscoverage['/promise.js'].functionData[0] = 0;
  _$jscoverage['/promise.js'].functionData[1] = 0;
  _$jscoverage['/promise.js'].functionData[2] = 0;
  _$jscoverage['/promise.js'].functionData[3] = 0;
  _$jscoverage['/promise.js'].functionData[4] = 0;
  _$jscoverage['/promise.js'].functionData[5] = 0;
  _$jscoverage['/promise.js'].functionData[6] = 0;
  _$jscoverage['/promise.js'].functionData[7] = 0;
  _$jscoverage['/promise.js'].functionData[8] = 0;
  _$jscoverage['/promise.js'].functionData[9] = 0;
  _$jscoverage['/promise.js'].functionData[10] = 0;
  _$jscoverage['/promise.js'].functionData[11] = 0;
  _$jscoverage['/promise.js'].functionData[12] = 0;
  _$jscoverage['/promise.js'].functionData[13] = 0;
  _$jscoverage['/promise.js'].functionData[14] = 0;
  _$jscoverage['/promise.js'].functionData[15] = 0;
  _$jscoverage['/promise.js'].functionData[16] = 0;
  _$jscoverage['/promise.js'].functionData[17] = 0;
  _$jscoverage['/promise.js'].functionData[18] = 0;
  _$jscoverage['/promise.js'].functionData[19] = 0;
  _$jscoverage['/promise.js'].functionData[20] = 0;
  _$jscoverage['/promise.js'].functionData[21] = 0;
  _$jscoverage['/promise.js'].functionData[22] = 0;
  _$jscoverage['/promise.js'].functionData[23] = 0;
  _$jscoverage['/promise.js'].functionData[24] = 0;
  _$jscoverage['/promise.js'].functionData[25] = 0;
  _$jscoverage['/promise.js'].functionData[26] = 0;
  _$jscoverage['/promise.js'].functionData[27] = 0;
  _$jscoverage['/promise.js'].functionData[28] = 0;
  _$jscoverage['/promise.js'].functionData[29] = 0;
  _$jscoverage['/promise.js'].functionData[30] = 0;
  _$jscoverage['/promise.js'].functionData[31] = 0;
  _$jscoverage['/promise.js'].functionData[32] = 0;
  _$jscoverage['/promise.js'].functionData[33] = 0;
  _$jscoverage['/promise.js'].functionData[34] = 0;
  _$jscoverage['/promise.js'].functionData[35] = 0;
  _$jscoverage['/promise.js'].functionData[36] = 0;
  _$jscoverage['/promise.js'].functionData[37] = 0;
  _$jscoverage['/promise.js'].functionData[38] = 0;
  _$jscoverage['/promise.js'].functionData[39] = 0;
  _$jscoverage['/promise.js'].functionData[40] = 0;
  _$jscoverage['/promise.js'].functionData[41] = 0;
  _$jscoverage['/promise.js'].functionData[42] = 0;
  _$jscoverage['/promise.js'].functionData[43] = 0;
  _$jscoverage['/promise.js'].functionData[44] = 0;
  _$jscoverage['/promise.js'].functionData[45] = 0;
  _$jscoverage['/promise.js'].functionData[46] = 0;
}
if (! _$jscoverage['/promise.js'].branchData) {
  _$jscoverage['/promise.js'].branchData = {};
  _$jscoverage['/promise.js'].branchData['15'] = [];
  _$jscoverage['/promise.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['15'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['27'] = [];
  _$jscoverage['/promise.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['36'] = [];
  _$jscoverage['/promise.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['42'] = [];
  _$jscoverage['/promise.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['44'] = [];
  _$jscoverage['/promise.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['52'] = [];
  _$jscoverage['/promise.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['67'] = [];
  _$jscoverage['/promise.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['76'] = [];
  _$jscoverage['/promise.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['91'] = [];
  _$jscoverage['/promise.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['127'] = [];
  _$jscoverage['/promise.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['145'] = [];
  _$jscoverage['/promise.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['152'] = [];
  _$jscoverage['/promise.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['171'] = [];
  _$jscoverage['/promise.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['183'] = [];
  _$jscoverage['/promise.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['186'] = [];
  _$jscoverage['/promise.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['228'] = [];
  _$jscoverage['/promise.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['233'] = [];
  _$jscoverage['/promise.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['271'] = [];
  _$jscoverage['/promise.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['301'] = [];
  _$jscoverage['/promise.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['315'] = [];
  _$jscoverage['/promise.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['321'] = [];
  _$jscoverage['/promise.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['325'] = [];
  _$jscoverage['/promise.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['333'] = [];
  _$jscoverage['/promise.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['335'] = [];
  _$jscoverage['/promise.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['354'] = [];
  _$jscoverage['/promise.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['354'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['358'] = [];
  _$jscoverage['/promise.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['358'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['362'] = [];
  _$jscoverage['/promise.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['372'] = [];
  _$jscoverage['/promise.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['372'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['417'] = [];
  _$jscoverage['/promise.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['480'] = [];
  _$jscoverage['/promise.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['484'] = [];
  _$jscoverage['/promise.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['489'] = [];
  _$jscoverage['/promise.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['520'] = [];
  _$jscoverage['/promise.js'].branchData['520'][1] = new BranchData();
}
_$jscoverage['/promise.js'].branchData['520'][1].init(296, 11, 'result.done');
function visit37_520_1(result) {
  _$jscoverage['/promise.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['489'][1].init(76, 13, '--count === 0');
function visit36_489_1(result) {
  _$jscoverage['/promise.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['484'][1].init(182, 19, 'i < promises.length');
function visit35_484_1(result) {
  _$jscoverage['/promise.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['480'][1].init(60, 6, '!count');
function visit34_480_1(result) {
  _$jscoverage['/promise.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['417'][1].init(18, 22, 'obj instanceof Promise');
function visit33_417_1(result) {
  _$jscoverage['/promise.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['372'][2].init(98, 61, 'obj instanceof Reject || obj[PROMISE_VALUE] instanceof Reject');
function visit32_372_2(result) {
  _$jscoverage['/promise.js'].branchData['372'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['372'][1].init(90, 70, 'obj && (obj instanceof Reject || obj[PROMISE_VALUE] instanceof Reject)');
function visit31_372_1(result) {
  _$jscoverage['/promise.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['362'][1].init(-1, 206, '!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE])');
function visit30_362_1(result) {
  _$jscoverage['/promise.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['358'][2].init(224, 31, 'obj[PROMISE_PENDINGS] === false');
function visit29_358_2(result) {
  _$jscoverage['/promise.js'].branchData['358'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['358'][1].init(160, 401, '(obj[PROMISE_PENDINGS] === false) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit28_358_1(result) {
  _$jscoverage['/promise.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['354'][2].init(60, 562, '!isRejected(obj) && (obj[PROMISE_PENDINGS] === false) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit27_354_2(result) {
  _$jscoverage['/promise.js'].branchData['354'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['354'][1].init(53, 569, 'obj && !isRejected(obj) && (obj[PROMISE_PENDINGS] === false) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit26_354_1(result) {
  _$jscoverage['/promise.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['335'][1].init(22, 4, 'done');
function visit25_335_1(result) {
  _$jscoverage['/promise.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['333'][1].init(1457, 25, 'value instanceof Promise');
function visit24_333_1(result) {
  _$jscoverage['/promise.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['325'][1].init(143, 24, 'value instanceof Promise');
function visit23_325_1(result) {
  _$jscoverage['/promise.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['321'][1].init(18, 4, 'done');
function visit22_321_1(result) {
  _$jscoverage['/promise.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['315'][1].init(83, 12, 'e.stack || e');
function visit21_315_1(result) {
  _$jscoverage['/promise.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['301'][1].init(168, 12, 'e.stack || e');
function visit20_301_1(result) {
  _$jscoverage['/promise.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['271'][1].init(14, 24, 'reason instanceof Reject');
function visit19_271_1(result) {
  _$jscoverage['/promise.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['233'][1].init(281, 21, 'fulfilled || rejected');
function visit18_233_1(result) {
  _$jscoverage['/promise.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['228'][1].init(28, 12, 'e.stack || e');
function visit17_228_1(result) {
  _$jscoverage['/promise.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['186'][1].init(196, 10, '!listeners');
function visit16_186_1(result) {
  _$jscoverage['/promise.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['183'][1].init(111, 19, 'listeners === false');
function visit15_183_1(result) {
  _$jscoverage['/promise.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['171'][1].init(18, 16, 'progressListener');
function visit14_171_1(result) {
  _$jscoverage['/promise.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['152'][1].init(27, 12, 'e.stack || e');
function visit13_152_1(result) {
  _$jscoverage['/promise.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['145'][1].init(40, 23, 'typeof v === \'function\'');
function visit12_145_1(result) {
  _$jscoverage['/promise.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['127'][1].init(18, 29, 'obj && obj instanceof Promise');
function visit11_127_1(result) {
  _$jscoverage['/promise.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['91'][1].init(87, 47, '(pendings = promise[PROMISE_PENDINGS]) === false');
function visit10_91_1(result) {
  _$jscoverage['/promise.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['76'][1].init(344, 24, 'promise || new Promise()');
function visit9_76_1(result) {
  _$jscoverage['/promise.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['67'][1].init(40, 24, '!(self instanceof Defer)');
function visit8_67_1(result) {
  _$jscoverage['/promise.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['52'][1].init(208, 9, 'fulfilled');
function visit7_52_1(result) {
  _$jscoverage['/promise.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['44'][1].init(398, 12, 'isPromise(v)');
function visit6_44_1(result) {
  _$jscoverage['/promise.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['42'][1].init(306, 8, 'pendings');
function visit5_42_1(result) {
  _$jscoverage['/promise.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['36'][1].init(120, 22, 'pendings === undefined');
function visit4_36_1(result) {
  _$jscoverage['/promise.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['27'][1].init(47, 25, 'promise instanceof Reject');
function visit3_27_1(result) {
  _$jscoverage['/promise.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['15'][2].init(42, 30, 'typeof console !== \'undefined\'');
function visit2_15_2(result) {
  _$jscoverage['/promise.js'].branchData['15'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['15'][1].init(42, 47, 'typeof console !== \'undefined\' && console.error');
function visit1_15_1(result) {
  _$jscoverage['/promise.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/promise.js'].functionData[0]++;
  _$jscoverage['/promise.js'].lineData[7]++;
  var logger = S.getLogger('s/promise');
  _$jscoverage['/promise.js'].lineData[8]++;
  var PROMISE_VALUE = '__promise_value', processImmediate = S.setImmediate, PROMISE_PROGRESS_LISTENERS = '__promise_progress_listeners', PROMISE_PENDINGS = '__promise_pendings';
  _$jscoverage['/promise.js'].lineData[13]++;
  function logError(str) {
    _$jscoverage['/promise.js'].functionData[1]++;
    _$jscoverage['/promise.js'].lineData[15]++;
    if (visit1_15_1(visit2_15_2(typeof console !== 'undefined') && console.error)) {
      _$jscoverage['/promise.js'].lineData[16]++;
      console.error(str);
    }
  }
  _$jscoverage['/promise.js'].lineData[25]++;
  function promiseWhen(promise, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[2]++;
    _$jscoverage['/promise.js'].lineData[27]++;
    if (visit3_27_1(promise instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[29]++;
      processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[3]++;
  _$jscoverage['/promise.js'].lineData[30]++;
  rejected.call(promise, promise[PROMISE_VALUE]);
});
    } else {
      _$jscoverage['/promise.js'].lineData[33]++;
      var v = promise[PROMISE_VALUE], pendings = promise[PROMISE_PENDINGS];
      _$jscoverage['/promise.js'].lineData[36]++;
      if (visit4_36_1(pendings === undefined)) {
        _$jscoverage['/promise.js'].lineData[37]++;
        pendings = promise[PROMISE_PENDINGS] = [];
      }
      _$jscoverage['/promise.js'].lineData[42]++;
      if (visit5_42_1(pendings)) {
        _$jscoverage['/promise.js'].lineData[43]++;
        pendings.push([fulfilled, rejected]);
      } else {
        _$jscoverage['/promise.js'].lineData[44]++;
        if (visit6_44_1(isPromise(v))) {
          _$jscoverage['/promise.js'].lineData[46]++;
          promiseWhen(v, fulfilled, rejected);
        } else {
          _$jscoverage['/promise.js'].lineData[52]++;
          if (visit7_52_1(fulfilled)) {
            _$jscoverage['/promise.js'].lineData[53]++;
            processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[4]++;
  _$jscoverage['/promise.js'].lineData[54]++;
  fulfilled.call(promise, v);
});
          }
        }
      }
    }
  }
  _$jscoverage['/promise.js'].lineData[65]++;
  function Defer(promise) {
    _$jscoverage['/promise.js'].functionData[5]++;
    _$jscoverage['/promise.js'].lineData[66]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[67]++;
    if (visit8_67_1(!(self instanceof Defer))) {
      _$jscoverage['/promise.js'].lineData[68]++;
      return new Defer(promise);
    }
    _$jscoverage['/promise.js'].lineData[76]++;
    self.promise = visit9_76_1(promise || new Promise());
    _$jscoverage['/promise.js'].lineData[77]++;
    self.promise.defer = self;
  }
  _$jscoverage['/promise.js'].lineData[80]++;
  Defer.prototype = {
  constructor: Defer, 
  resolve: function(value) {
  _$jscoverage['/promise.js'].functionData[6]++;
  _$jscoverage['/promise.js'].lineData[89]++;
  var promise = this.promise, pendings;
  _$jscoverage['/promise.js'].lineData[91]++;
  if (visit10_91_1((pendings = promise[PROMISE_PENDINGS]) === false)) {
    _$jscoverage['/promise.js'].lineData[92]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[96]++;
  promise[PROMISE_VALUE] = value;
  _$jscoverage['/promise.js'].lineData[97]++;
  pendings = pendings ? [].concat(pendings) : [];
  _$jscoverage['/promise.js'].lineData[98]++;
  promise[PROMISE_PENDINGS] = false;
  _$jscoverage['/promise.js'].lineData[99]++;
  promise[PROMISE_PROGRESS_LISTENERS] = false;
  _$jscoverage['/promise.js'].lineData[100]++;
  S.each(pendings, function(p) {
  _$jscoverage['/promise.js'].functionData[7]++;
  _$jscoverage['/promise.js'].lineData[101]++;
  promiseWhen(promise, p[0], p[1]);
});
  _$jscoverage['/promise.js'].lineData[103]++;
  return value;
}, 
  reject: function(reason) {
  _$jscoverage['/promise.js'].functionData[8]++;
  _$jscoverage['/promise.js'].lineData[111]++;
  return this.resolve(new Reject(reason));
}, 
  notify: function(message) {
  _$jscoverage['/promise.js'].functionData[9]++;
  _$jscoverage['/promise.js'].lineData[118]++;
  S.each(this.promise[PROMISE_PROGRESS_LISTENERS], function(listener) {
  _$jscoverage['/promise.js'].functionData[10]++;
  _$jscoverage['/promise.js'].lineData[119]++;
  processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[11]++;
  _$jscoverage['/promise.js'].lineData[120]++;
  listener(message);
});
});
}};
  _$jscoverage['/promise.js'].lineData[126]++;
  function isPromise(obj) {
    _$jscoverage['/promise.js'].functionData[12]++;
    _$jscoverage['/promise.js'].lineData[127]++;
    return visit11_127_1(obj && obj instanceof Promise);
  }
  _$jscoverage['/promise.js'].lineData[130]++;
  function bind(fn, context) {
    _$jscoverage['/promise.js'].functionData[13]++;
    _$jscoverage['/promise.js'].lineData[131]++;
    return function() {
  _$jscoverage['/promise.js'].functionData[14]++;
  _$jscoverage['/promise.js'].lineData[132]++;
  return fn.apply(context, arguments);
};
  }
  _$jscoverage['/promise.js'].lineData[143]++;
  function Promise(v) {
    _$jscoverage['/promise.js'].functionData[15]++;
    _$jscoverage['/promise.js'].lineData[144]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[145]++;
    if (visit12_145_1(typeof v === 'function')) {
      _$jscoverage['/promise.js'].lineData[146]++;
      var defer = new Defer(self);
      _$jscoverage['/promise.js'].lineData[147]++;
      var resolve = bind(defer.resolve, defer);
      _$jscoverage['/promise.js'].lineData[148]++;
      var reject = bind(defer.reject, defer);
      _$jscoverage['/promise.js'].lineData[149]++;
      try {
        _$jscoverage['/promise.js'].lineData[150]++;
        v(resolve, reject);
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[152]++;
  logError(visit13_152_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[153]++;
  reject(e);
}
    }
  }
  _$jscoverage['/promise.js'].lineData[158]++;
  Promise.prototype = {
  constructor: Promise, 
  then: function(fulfilled, rejected, progressListener) {
  _$jscoverage['/promise.js'].functionData[16]++;
  _$jscoverage['/promise.js'].lineData[171]++;
  if (visit14_171_1(progressListener)) {
    _$jscoverage['/promise.js'].lineData[172]++;
    this.progress(progressListener);
  }
  _$jscoverage['/promise.js'].lineData[174]++;
  return when(this, fulfilled, rejected);
}, 
  progress: function(progressListener) {
  _$jscoverage['/promise.js'].functionData[17]++;
  _$jscoverage['/promise.js'].lineData[181]++;
  var self = this, listeners = self[PROMISE_PROGRESS_LISTENERS];
  _$jscoverage['/promise.js'].lineData[183]++;
  if (visit15_183_1(listeners === false)) {
    _$jscoverage['/promise.js'].lineData[184]++;
    return self;
  }
  _$jscoverage['/promise.js'].lineData[186]++;
  if (visit16_186_1(!listeners)) {
    _$jscoverage['/promise.js'].lineData[187]++;
    listeners = self[PROMISE_PROGRESS_LISTENERS] = [];
  }
  _$jscoverage['/promise.js'].lineData[189]++;
  listeners.push(progressListener);
  _$jscoverage['/promise.js'].lineData[190]++;
  return self;
}, 
  fail: function(rejected) {
  _$jscoverage['/promise.js'].functionData[18]++;
  _$jscoverage['/promise.js'].lineData[198]++;
  return when(this, 0, rejected);
}, 
  fin: function(callback) {
  _$jscoverage['/promise.js'].functionData[19]++;
  _$jscoverage['/promise.js'].lineData[207]++;
  return when(this, function(value) {
  _$jscoverage['/promise.js'].functionData[20]++;
  _$jscoverage['/promise.js'].lineData[208]++;
  return callback(value, true);
}, function(reason) {
  _$jscoverage['/promise.js'].functionData[21]++;
  _$jscoverage['/promise.js'].lineData[210]++;
  return callback(reason, false);
});
}, 
  done: function(fulfilled, rejected) {
  _$jscoverage['/promise.js'].functionData[22]++;
  _$jscoverage['/promise.js'].lineData[226]++;
  var self = this, onUnhandledError = function(e) {
  _$jscoverage['/promise.js'].functionData[23]++;
  _$jscoverage['/promise.js'].lineData[228]++;
  S.log(visit17_228_1(e.stack || e), 'error');
  _$jscoverage['/promise.js'].lineData[229]++;
  setTimeout(function() {
  _$jscoverage['/promise.js'].functionData[24]++;
  _$jscoverage['/promise.js'].lineData[230]++;
  throw e;
}, 0);
}, promiseToHandle = visit18_233_1(fulfilled || rejected) ? self.then(fulfilled, rejected) : self;
  _$jscoverage['/promise.js'].lineData[236]++;
  promiseToHandle.fail(onUnhandledError);
}, 
  isResolved: function() {
  _$jscoverage['/promise.js'].functionData[25]++;
  _$jscoverage['/promise.js'].lineData[246]++;
  return isResolved(this);
}, 
  isRejected: function() {
  _$jscoverage['/promise.js'].functionData[26]++;
  _$jscoverage['/promise.js'].lineData[252]++;
  return isRejected(this);
}};
  _$jscoverage['/promise.js'].lineData[261]++;
  Promise.prototype['catch'] = Promise.prototype.fail;
  _$jscoverage['/promise.js'].lineData[270]++;
  function Reject(reason) {
    _$jscoverage['/promise.js'].functionData[27]++;
    _$jscoverage['/promise.js'].lineData[271]++;
    if (visit19_271_1(reason instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[272]++;
      return reason;
    }
    _$jscoverage['/promise.js'].lineData[274]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[275]++;
    self[PROMISE_VALUE] = reason;
    _$jscoverage['/promise.js'].lineData[276]++;
    self[PROMISE_PENDINGS] = false;
    _$jscoverage['/promise.js'].lineData[277]++;
    self[PROMISE_PROGRESS_LISTENERS] = false;
    _$jscoverage['/promise.js'].lineData[281]++;
    return self;
  }
  _$jscoverage['/promise.js'].lineData[284]++;
  S.extend(Reject, Promise);
  _$jscoverage['/promise.js'].lineData[287]++;
  function when(value, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[28]++;
    _$jscoverage['/promise.js'].lineData[288]++;
    var defer = new Defer(), done = 0;
    _$jscoverage['/promise.js'].lineData[292]++;
    function _fulfilled(value) {
      _$jscoverage['/promise.js'].functionData[29]++;
      _$jscoverage['/promise.js'].lineData[293]++;
      try {
        _$jscoverage['/promise.js'].lineData[294]++;
        return fulfilled ? fulfilled.call(this, value) : value;
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[301]++;
  logError(visit20_301_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[302]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[306]++;
    function _rejected(reason) {
      _$jscoverage['/promise.js'].functionData[30]++;
      _$jscoverage['/promise.js'].lineData[307]++;
      try {
        _$jscoverage['/promise.js'].lineData[308]++;
        return rejected ? rejected.call(this, reason) : new Reject(reason);
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[315]++;
  logError(visit21_315_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[316]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[320]++;
    function finalFulfill(value) {
      _$jscoverage['/promise.js'].functionData[31]++;
      _$jscoverage['/promise.js'].lineData[321]++;
      if (visit22_321_1(done)) {
        _$jscoverage['/promise.js'].lineData[322]++;
        logger.error('already done at fulfilled');
        _$jscoverage['/promise.js'].lineData[323]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[325]++;
      if (visit23_325_1(value instanceof Promise)) {
        _$jscoverage['/promise.js'].lineData[326]++;
        logger.error('assert.not(value instanceof Promise) in when');
        _$jscoverage['/promise.js'].lineData[327]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[329]++;
      done = 1;
      _$jscoverage['/promise.js'].lineData[330]++;
      defer.resolve(_fulfilled.call(this, value));
    }
    _$jscoverage['/promise.js'].lineData[333]++;
    if (visit24_333_1(value instanceof Promise)) {
      _$jscoverage['/promise.js'].lineData[334]++;
      promiseWhen(value, finalFulfill, function(reason) {
  _$jscoverage['/promise.js'].functionData[32]++;
  _$jscoverage['/promise.js'].lineData[335]++;
  if (visit25_335_1(done)) {
    _$jscoverage['/promise.js'].lineData[336]++;
    logger.error('already done at rejected');
    _$jscoverage['/promise.js'].lineData[337]++;
    return;
  }
  _$jscoverage['/promise.js'].lineData[339]++;
  done = 1;
  _$jscoverage['/promise.js'].lineData[341]++;
  defer.resolve(_rejected.call(this, reason));
});
    } else {
      _$jscoverage['/promise.js'].lineData[344]++;
      finalFulfill(value);
    }
    _$jscoverage['/promise.js'].lineData[349]++;
    return defer.promise;
  }
  _$jscoverage['/promise.js'].lineData[352]++;
  function isResolved(obj) {
    _$jscoverage['/promise.js'].functionData[33]++;
    _$jscoverage['/promise.js'].lineData[354]++;
    return visit26_354_1(obj && visit27_354_2(!isRejected(obj) && visit28_358_1((visit29_358_2(obj[PROMISE_PENDINGS] === false)) && (visit30_362_1(!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))))));
  }
  _$jscoverage['/promise.js'].lineData[369]++;
  function isRejected(obj) {
    _$jscoverage['/promise.js'].functionData[34]++;
    _$jscoverage['/promise.js'].lineData[372]++;
    return visit31_372_1(obj && (visit32_372_2(obj instanceof Reject || obj[PROMISE_VALUE] instanceof Reject)));
  }
  _$jscoverage['/promise.js'].lineData[375]++;
  KISSY.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[376]++;
  KISSY.Promise = Promise;
  _$jscoverage['/promise.js'].lineData[377]++;
  Promise.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[379]++;
  S.mix(Promise, {
  when: when, 
  cast: function(obj) {
  _$jscoverage['/promise.js'].functionData[35]++;
  _$jscoverage['/promise.js'].lineData[417]++;
  if (visit33_417_1(obj instanceof Promise)) {
    _$jscoverage['/promise.js'].lineData[418]++;
    return obj;
  }
  _$jscoverage['/promise.js'].lineData[420]++;
  return when(obj);
}, 
  resolve: function(obj) {
  _$jscoverage['/promise.js'].functionData[36]++;
  _$jscoverage['/promise.js'].lineData[427]++;
  return when(obj);
}, 
  reject: function(obj) {
  _$jscoverage['/promise.js'].functionData[37]++;
  _$jscoverage['/promise.js'].lineData[436]++;
  return new Reject(obj);
}, 
  isPromise: isPromise, 
  isResolved: isResolved, 
  isRejected: isRejected, 
  all: function(promises) {
  _$jscoverage['/promise.js'].functionData[38]++;
  _$jscoverage['/promise.js'].lineData[479]++;
  var count = promises.length;
  _$jscoverage['/promise.js'].lineData[480]++;
  if (visit34_480_1(!count)) {
    _$jscoverage['/promise.js'].lineData[481]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[483]++;
  var defer = new Defer();
  _$jscoverage['/promise.js'].lineData[484]++;
  for (var i = 0; visit35_484_1(i < promises.length); i++) {
    _$jscoverage['/promise.js'].lineData[486]++;
    (function(promise, i) {
  _$jscoverage['/promise.js'].functionData[39]++;
  _$jscoverage['/promise.js'].lineData[487]++;
  when(promise, function(value) {
  _$jscoverage['/promise.js'].functionData[40]++;
  _$jscoverage['/promise.js'].lineData[488]++;
  promises[i] = value;
  _$jscoverage['/promise.js'].lineData[489]++;
  if (visit36_489_1(--count === 0)) {
    _$jscoverage['/promise.js'].lineData[492]++;
    defer.resolve(promises);
  }
}, function(r) {
  _$jscoverage['/promise.js'].functionData[41]++;
  _$jscoverage['/promise.js'].lineData[497]++;
  defer.reject(r);
});
})(promises[i], i);
  }
  _$jscoverage['/promise.js'].lineData[501]++;
  return defer.promise;
}, 
  async: function(generatorFunc) {
  _$jscoverage['/promise.js'].functionData[42]++;
  _$jscoverage['/promise.js'].lineData[509]++;
  return function() {
  _$jscoverage['/promise.js'].functionData[43]++;
  _$jscoverage['/promise.js'].lineData[510]++;
  var generator = generatorFunc.apply(this, arguments);
  _$jscoverage['/promise.js'].lineData[512]++;
  function doAction(action, arg) {
    _$jscoverage['/promise.js'].functionData[44]++;
    _$jscoverage['/promise.js'].lineData[513]++;
    var result;
    _$jscoverage['/promise.js'].lineData[515]++;
    try {
      _$jscoverage['/promise.js'].lineData[516]++;
      result = generator[action](arg);
    }    catch (e) {
  _$jscoverage['/promise.js'].lineData[518]++;
  return new Reject(e);
}
    _$jscoverage['/promise.js'].lineData[520]++;
    if (visit37_520_1(result.done)) {
      _$jscoverage['/promise.js'].lineData[521]++;
      return result.value;
    }
    _$jscoverage['/promise.js'].lineData[523]++;
    return when(result.value, next, throwEx);
  }
  _$jscoverage['/promise.js'].lineData[526]++;
  function next(v) {
    _$jscoverage['/promise.js'].functionData[45]++;
    _$jscoverage['/promise.js'].lineData[527]++;
    return doAction('next', v);
  }
  _$jscoverage['/promise.js'].lineData[530]++;
  function throwEx(e) {
    _$jscoverage['/promise.js'].functionData[46]++;
    _$jscoverage['/promise.js'].lineData[531]++;
    return doAction('throw', e);
  }
  _$jscoverage['/promise.js'].lineData[534]++;
  return next();
};
}});
  _$jscoverage['/promise.js'].lineData[538]++;
  return Promise;
});
