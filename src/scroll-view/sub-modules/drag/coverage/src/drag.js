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
if (! _$jscoverage['/drag.js']) {
  _$jscoverage['/drag.js'] = {};
  _$jscoverage['/drag.js'].lineData = [];
  _$jscoverage['/drag.js'].lineData[5] = 0;
  _$jscoverage['/drag.js'].lineData[6] = 0;
  _$jscoverage['/drag.js'].lineData[8] = 0;
  _$jscoverage['/drag.js'].lineData[10] = 0;
  _$jscoverage['/drag.js'].lineData[12] = 0;
  _$jscoverage['/drag.js'].lineData[14] = 0;
  _$jscoverage['/drag.js'].lineData[15] = 0;
  _$jscoverage['/drag.js'].lineData[17] = 0;
  _$jscoverage['/drag.js'].lineData[18] = 0;
  _$jscoverage['/drag.js'].lineData[19] = 0;
  _$jscoverage['/drag.js'].lineData[22] = 0;
  _$jscoverage['/drag.js'].lineData[23] = 0;
  _$jscoverage['/drag.js'].lineData[24] = 0;
  _$jscoverage['/drag.js'].lineData[26] = 0;
  _$jscoverage['/drag.js'].lineData[30] = 0;
  _$jscoverage['/drag.js'].lineData[32] = 0;
  _$jscoverage['/drag.js'].lineData[43] = 0;
  _$jscoverage['/drag.js'].lineData[44] = 0;
  _$jscoverage['/drag.js'].lineData[45] = 0;
  _$jscoverage['/drag.js'].lineData[48] = 0;
  _$jscoverage['/drag.js'].lineData[49] = 0;
  _$jscoverage['/drag.js'].lineData[52] = 0;
  _$jscoverage['/drag.js'].lineData[53] = 0;
  _$jscoverage['/drag.js'].lineData[54] = 0;
  _$jscoverage['/drag.js'].lineData[55] = 0;
  _$jscoverage['/drag.js'].lineData[56] = 0;
  _$jscoverage['/drag.js'].lineData[57] = 0;
  _$jscoverage['/drag.js'].lineData[58] = 0;
  _$jscoverage['/drag.js'].lineData[59] = 0;
  _$jscoverage['/drag.js'].lineData[62] = 0;
  _$jscoverage['/drag.js'].lineData[65] = 0;
  _$jscoverage['/drag.js'].lineData[67] = 0;
  _$jscoverage['/drag.js'].lineData[68] = 0;
  _$jscoverage['/drag.js'].lineData[72] = 0;
  _$jscoverage['/drag.js'].lineData[73] = 0;
  _$jscoverage['/drag.js'].lineData[75] = 0;
  _$jscoverage['/drag.js'].lineData[78] = 0;
  _$jscoverage['/drag.js'].lineData[79] = 0;
  _$jscoverage['/drag.js'].lineData[80] = 0;
  _$jscoverage['/drag.js'].lineData[81] = 0;
  _$jscoverage['/drag.js'].lineData[83] = 0;
  _$jscoverage['/drag.js'].lineData[86] = 0;
  _$jscoverage['/drag.js'].lineData[87] = 0;
  _$jscoverage['/drag.js'].lineData[88] = 0;
  _$jscoverage['/drag.js'].lineData[89] = 0;
  _$jscoverage['/drag.js'].lineData[91] = 0;
  _$jscoverage['/drag.js'].lineData[100] = 0;
  _$jscoverage['/drag.js'].lineData[101] = 0;
  _$jscoverage['/drag.js'].lineData[102] = 0;
  _$jscoverage['/drag.js'].lineData[103] = 0;
  _$jscoverage['/drag.js'].lineData[105] = 0;
  _$jscoverage['/drag.js'].lineData[106] = 0;
  _$jscoverage['/drag.js'].lineData[107] = 0;
  _$jscoverage['/drag.js'].lineData[108] = 0;
  _$jscoverage['/drag.js'].lineData[114] = 0;
  _$jscoverage['/drag.js'].lineData[117] = 0;
  _$jscoverage['/drag.js'].lineData[118] = 0;
  _$jscoverage['/drag.js'].lineData[119] = 0;
  _$jscoverage['/drag.js'].lineData[122] = 0;
  _$jscoverage['/drag.js'].lineData[123] = 0;
  _$jscoverage['/drag.js'].lineData[127] = 0;
  _$jscoverage['/drag.js'].lineData[128] = 0;
  _$jscoverage['/drag.js'].lineData[129] = 0;
  _$jscoverage['/drag.js'].lineData[135] = 0;
  _$jscoverage['/drag.js'].lineData[137] = 0;
  _$jscoverage['/drag.js'].lineData[142] = 0;
  _$jscoverage['/drag.js'].lineData[148] = 0;
  _$jscoverage['/drag.js'].lineData[155] = 0;
  _$jscoverage['/drag.js'].lineData[156] = 0;
  _$jscoverage['/drag.js'].lineData[157] = 0;
  _$jscoverage['/drag.js'].lineData[158] = 0;
  _$jscoverage['/drag.js'].lineData[159] = 0;
  _$jscoverage['/drag.js'].lineData[161] = 0;
  _$jscoverage['/drag.js'].lineData[163] = 0;
  _$jscoverage['/drag.js'].lineData[164] = 0;
  _$jscoverage['/drag.js'].lineData[165] = 0;
  _$jscoverage['/drag.js'].lineData[166] = 0;
  _$jscoverage['/drag.js'].lineData[167] = 0;
  _$jscoverage['/drag.js'].lineData[172] = 0;
  _$jscoverage['/drag.js'].lineData[173] = 0;
  _$jscoverage['/drag.js'].lineData[177] = 0;
  _$jscoverage['/drag.js'].lineData[179] = 0;
  _$jscoverage['/drag.js'].lineData[180] = 0;
  _$jscoverage['/drag.js'].lineData[182] = 0;
  _$jscoverage['/drag.js'].lineData[183] = 0;
  _$jscoverage['/drag.js'].lineData[185] = 0;
  _$jscoverage['/drag.js'].lineData[186] = 0;
  _$jscoverage['/drag.js'].lineData[187] = 0;
  _$jscoverage['/drag.js'].lineData[189] = 0;
  _$jscoverage['/drag.js'].lineData[190] = 0;
  _$jscoverage['/drag.js'].lineData[196] = 0;
  _$jscoverage['/drag.js'].lineData[198] = 0;
  _$jscoverage['/drag.js'].lineData[200] = 0;
  _$jscoverage['/drag.js'].lineData[202] = 0;
  _$jscoverage['/drag.js'].lineData[206] = 0;
  _$jscoverage['/drag.js'].lineData[207] = 0;
  _$jscoverage['/drag.js'].lineData[208] = 0;
  _$jscoverage['/drag.js'].lineData[210] = 0;
  _$jscoverage['/drag.js'].lineData[215] = 0;
  _$jscoverage['/drag.js'].lineData[217] = 0;
  _$jscoverage['/drag.js'].lineData[218] = 0;
  _$jscoverage['/drag.js'].lineData[219] = 0;
  _$jscoverage['/drag.js'].lineData[221] = 0;
  _$jscoverage['/drag.js'].lineData[225] = 0;
  _$jscoverage['/drag.js'].lineData[226] = 0;
  _$jscoverage['/drag.js'].lineData[227] = 0;
  _$jscoverage['/drag.js'].lineData[228] = 0;
  _$jscoverage['/drag.js'].lineData[229] = 0;
  _$jscoverage['/drag.js'].lineData[234] = 0;
  _$jscoverage['/drag.js'].lineData[235] = 0;
  _$jscoverage['/drag.js'].lineData[236] = 0;
  _$jscoverage['/drag.js'].lineData[237] = 0;
  _$jscoverage['/drag.js'].lineData[238] = 0;
  _$jscoverage['/drag.js'].lineData[239] = 0;
  _$jscoverage['/drag.js'].lineData[241] = 0;
  _$jscoverage['/drag.js'].lineData[244] = 0;
  _$jscoverage['/drag.js'].lineData[245] = 0;
  _$jscoverage['/drag.js'].lineData[248] = 0;
  _$jscoverage['/drag.js'].lineData[249] = 0;
  _$jscoverage['/drag.js'].lineData[252] = 0;
  _$jscoverage['/drag.js'].lineData[255] = 0;
  _$jscoverage['/drag.js'].lineData[261] = 0;
  _$jscoverage['/drag.js'].lineData[262] = 0;
  _$jscoverage['/drag.js'].lineData[263] = 0;
  _$jscoverage['/drag.js'].lineData[266] = 0;
  _$jscoverage['/drag.js'].lineData[267] = 0;
  _$jscoverage['/drag.js'].lineData[270] = 0;
  _$jscoverage['/drag.js'].lineData[272] = 0;
  _$jscoverage['/drag.js'].lineData[273] = 0;
  _$jscoverage['/drag.js'].lineData[276] = 0;
  _$jscoverage['/drag.js'].lineData[277] = 0;
  _$jscoverage['/drag.js'].lineData[278] = 0;
  _$jscoverage['/drag.js'].lineData[279] = 0;
  _$jscoverage['/drag.js'].lineData[282] = 0;
  _$jscoverage['/drag.js'].lineData[283] = 0;
  _$jscoverage['/drag.js'].lineData[284] = 0;
  _$jscoverage['/drag.js'].lineData[285] = 0;
  _$jscoverage['/drag.js'].lineData[289] = 0;
  _$jscoverage['/drag.js'].lineData[290] = 0;
  _$jscoverage['/drag.js'].lineData[293] = 0;
  _$jscoverage['/drag.js'].lineData[294] = 0;
  _$jscoverage['/drag.js'].lineData[297] = 0;
  _$jscoverage['/drag.js'].lineData[300] = 0;
  _$jscoverage['/drag.js'].lineData[301] = 0;
  _$jscoverage['/drag.js'].lineData[304] = 0;
  _$jscoverage['/drag.js'].lineData[305] = 0;
  _$jscoverage['/drag.js'].lineData[306] = 0;
  _$jscoverage['/drag.js'].lineData[307] = 0;
  _$jscoverage['/drag.js'].lineData[309] = 0;
  _$jscoverage['/drag.js'].lineData[310] = 0;
  _$jscoverage['/drag.js'].lineData[312] = 0;
  _$jscoverage['/drag.js'].lineData[313] = 0;
  _$jscoverage['/drag.js'].lineData[314] = 0;
  _$jscoverage['/drag.js'].lineData[315] = 0;
  _$jscoverage['/drag.js'].lineData[316] = 0;
  _$jscoverage['/drag.js'].lineData[317] = 0;
  _$jscoverage['/drag.js'].lineData[319] = 0;
  _$jscoverage['/drag.js'].lineData[324] = 0;
  _$jscoverage['/drag.js'].lineData[325] = 0;
  _$jscoverage['/drag.js'].lineData[326] = 0;
  _$jscoverage['/drag.js'].lineData[327] = 0;
  _$jscoverage['/drag.js'].lineData[328] = 0;
  _$jscoverage['/drag.js'].lineData[329] = 0;
  _$jscoverage['/drag.js'].lineData[337] = 0;
  _$jscoverage['/drag.js'].lineData[338] = 0;
  _$jscoverage['/drag.js'].lineData[339] = 0;
  _$jscoverage['/drag.js'].lineData[342] = 0;
  _$jscoverage['/drag.js'].lineData[343] = 0;
  _$jscoverage['/drag.js'].lineData[344] = 0;
  _$jscoverage['/drag.js'].lineData[345] = 0;
  _$jscoverage['/drag.js'].lineData[346] = 0;
  _$jscoverage['/drag.js'].lineData[347] = 0;
  _$jscoverage['/drag.js'].lineData[349] = 0;
  _$jscoverage['/drag.js'].lineData[355] = 0;
  _$jscoverage['/drag.js'].lineData[357] = 0;
  _$jscoverage['/drag.js'].lineData[359] = 0;
  _$jscoverage['/drag.js'].lineData[360] = 0;
  _$jscoverage['/drag.js'].lineData[361] = 0;
  _$jscoverage['/drag.js'].lineData[363] = 0;
  _$jscoverage['/drag.js'].lineData[367] = 0;
  _$jscoverage['/drag.js'].lineData[368] = 0;
  _$jscoverage['/drag.js'].lineData[369] = 0;
  _$jscoverage['/drag.js'].lineData[371] = 0;
  _$jscoverage['/drag.js'].lineData[372] = 0;
  _$jscoverage['/drag.js'].lineData[373] = 0;
  _$jscoverage['/drag.js'].lineData[374] = 0;
  _$jscoverage['/drag.js'].lineData[377] = 0;
  _$jscoverage['/drag.js'].lineData[378] = 0;
  _$jscoverage['/drag.js'].lineData[379] = 0;
  _$jscoverage['/drag.js'].lineData[380] = 0;
  _$jscoverage['/drag.js'].lineData[381] = 0;
  _$jscoverage['/drag.js'].lineData[382] = 0;
  _$jscoverage['/drag.js'].lineData[383] = 0;
  _$jscoverage['/drag.js'].lineData[384] = 0;
  _$jscoverage['/drag.js'].lineData[389] = 0;
  _$jscoverage['/drag.js'].lineData[390] = 0;
  _$jscoverage['/drag.js'].lineData[391] = 0;
  _$jscoverage['/drag.js'].lineData[392] = 0;
  _$jscoverage['/drag.js'].lineData[393] = 0;
  _$jscoverage['/drag.js'].lineData[394] = 0;
  _$jscoverage['/drag.js'].lineData[399] = 0;
  _$jscoverage['/drag.js'].lineData[400] = 0;
  _$jscoverage['/drag.js'].lineData[401] = 0;
  _$jscoverage['/drag.js'].lineData[403] = 0;
  _$jscoverage['/drag.js'].lineData[404] = 0;
  _$jscoverage['/drag.js'].lineData[407] = 0;
  _$jscoverage['/drag.js'].lineData[410] = 0;
  _$jscoverage['/drag.js'].lineData[411] = 0;
  _$jscoverage['/drag.js'].lineData[414] = 0;
  _$jscoverage['/drag.js'].lineData[416] = 0;
  _$jscoverage['/drag.js'].lineData[417] = 0;
  _$jscoverage['/drag.js'].lineData[424] = 0;
  _$jscoverage['/drag.js'].lineData[425] = 0;
  _$jscoverage['/drag.js'].lineData[428] = 0;
  _$jscoverage['/drag.js'].lineData[429] = 0;
  _$jscoverage['/drag.js'].lineData[431] = 0;
  _$jscoverage['/drag.js'].lineData[433] = 0;
  _$jscoverage['/drag.js'].lineData[438] = 0;
  _$jscoverage['/drag.js'].lineData[440] = 0;
  _$jscoverage['/drag.js'].lineData[442] = 0;
  _$jscoverage['/drag.js'].lineData[445] = 0;
  _$jscoverage['/drag.js'].lineData[446] = 0;
  _$jscoverage['/drag.js'].lineData[449] = 0;
  _$jscoverage['/drag.js'].lineData[451] = 0;
  _$jscoverage['/drag.js'].lineData[454] = 0;
  _$jscoverage['/drag.js'].lineData[458] = 0;
  _$jscoverage['/drag.js'].lineData[462] = 0;
  _$jscoverage['/drag.js'].lineData[466] = 0;
  _$jscoverage['/drag.js'].lineData[467] = 0;
}
if (! _$jscoverage['/drag.js'].functionData) {
  _$jscoverage['/drag.js'].functionData = [];
  _$jscoverage['/drag.js'].functionData[0] = 0;
  _$jscoverage['/drag.js'].functionData[1] = 0;
  _$jscoverage['/drag.js'].functionData[2] = 0;
  _$jscoverage['/drag.js'].functionData[3] = 0;
  _$jscoverage['/drag.js'].functionData[4] = 0;
  _$jscoverage['/drag.js'].functionData[5] = 0;
  _$jscoverage['/drag.js'].functionData[6] = 0;
  _$jscoverage['/drag.js'].functionData[7] = 0;
  _$jscoverage['/drag.js'].functionData[8] = 0;
  _$jscoverage['/drag.js'].functionData[9] = 0;
  _$jscoverage['/drag.js'].functionData[10] = 0;
  _$jscoverage['/drag.js'].functionData[11] = 0;
  _$jscoverage['/drag.js'].functionData[12] = 0;
  _$jscoverage['/drag.js'].functionData[13] = 0;
  _$jscoverage['/drag.js'].functionData[14] = 0;
  _$jscoverage['/drag.js'].functionData[15] = 0;
  _$jscoverage['/drag.js'].functionData[16] = 0;
  _$jscoverage['/drag.js'].functionData[17] = 0;
  _$jscoverage['/drag.js'].functionData[18] = 0;
  _$jscoverage['/drag.js'].functionData[19] = 0;
  _$jscoverage['/drag.js'].functionData[20] = 0;
}
if (! _$jscoverage['/drag.js'].branchData) {
  _$jscoverage['/drag.js'].branchData = {};
  _$jscoverage['/drag.js'].branchData['23'] = [];
  _$jscoverage['/drag.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['30'] = [];
  _$jscoverage['/drag.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['43'] = [];
  _$jscoverage['/drag.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['44'] = [];
  _$jscoverage['/drag.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['45'] = [];
  _$jscoverage['/drag.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['48'] = [];
  _$jscoverage['/drag.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['52'] = [];
  _$jscoverage['/drag.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['56'] = [];
  _$jscoverage['/drag.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['65'] = [];
  _$jscoverage['/drag.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['65'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['65'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['65'][4] = new BranchData();
  _$jscoverage['/drag.js'].branchData['66'] = [];
  _$jscoverage['/drag.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['66'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['79'] = [];
  _$jscoverage['/drag.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['80'] = [];
  _$jscoverage['/drag.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['87'] = [];
  _$jscoverage['/drag.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['100'] = [];
  _$jscoverage['/drag.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['102'] = [];
  _$jscoverage['/drag.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['105'] = [];
  _$jscoverage['/drag.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['117'] = [];
  _$jscoverage['/drag.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['127'] = [];
  _$jscoverage['/drag.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['127'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['127'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['172'] = [];
  _$jscoverage['/drag.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['180'] = [];
  _$jscoverage['/drag.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['180'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['180'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['182'] = [];
  _$jscoverage['/drag.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['196'] = [];
  _$jscoverage['/drag.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['207'] = [];
  _$jscoverage['/drag.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['218'] = [];
  _$jscoverage['/drag.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['227'] = [];
  _$jscoverage['/drag.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['248'] = [];
  _$jscoverage['/drag.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['261'] = [];
  _$jscoverage['/drag.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['266'] = [];
  _$jscoverage['/drag.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['272'] = [];
  _$jscoverage['/drag.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['273'] = [];
  _$jscoverage['/drag.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['276'] = [];
  _$jscoverage['/drag.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['276'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['276'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['282'] = [];
  _$jscoverage['/drag.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['282'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['282'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['289'] = [];
  _$jscoverage['/drag.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['300'] = [];
  _$jscoverage['/drag.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['309'] = [];
  _$jscoverage['/drag.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['316'] = [];
  _$jscoverage['/drag.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['316'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['317'] = [];
  _$jscoverage['/drag.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['317'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['326'] = [];
  _$jscoverage['/drag.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['337'] = [];
  _$jscoverage['/drag.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['359'] = [];
  _$jscoverage['/drag.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['360'] = [];
  _$jscoverage['/drag.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['368'] = [];
  _$jscoverage['/drag.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['371'] = [];
  _$jscoverage['/drag.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['371'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['371'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['373'] = [];
  _$jscoverage['/drag.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['373'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['373'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['378'] = [];
  _$jscoverage['/drag.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['381'] = [];
  _$jscoverage['/drag.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['382'] = [];
  _$jscoverage['/drag.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['391'] = [];
  _$jscoverage['/drag.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['392'] = [];
  _$jscoverage['/drag.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['399'] = [];
  _$jscoverage['/drag.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['400'] = [];
  _$jscoverage['/drag.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['410'] = [];
  _$jscoverage['/drag.js'].branchData['410'][1] = new BranchData();
}
_$jscoverage['/drag.js'].branchData['410'][1].init(30, 16, 'allowX || allowY');
function visit70_410_1(result) {
  _$jscoverage['/drag.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['400'][1].init(34, 25, 'newPageIndex != pageIndex');
function visit69_400_1(result) {
  _$jscoverage['/drag.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['399'][1].init(1908, 25, 'newPageIndex != undefined');
function visit68_399_1(result) {
  _$jscoverage['/drag.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['392'][1].init(42, 23, 'min < nowXY.top - x.top');
function visit67_392_1(result) {
  _$jscoverage['/drag.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['391'][1].init(38, 17, 'x.top < nowXY.top');
function visit66_391_1(result) {
  _$jscoverage['/drag.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['382'][1].init(42, 23, 'min < x.top - nowXY.top');
function visit65_382_1(result) {
  _$jscoverage['/drag.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['381'][1].init(38, 17, 'x.top > nowXY.top');
function visit64_381_1(result) {
  _$jscoverage['/drag.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['378'][1].init(833, 11, 'offsetY > 0');
function visit63_378_1(result) {
  _$jscoverage['/drag.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['373'][3].init(305, 24, 'offset.left < nowXY.left');
function visit62_373_3(result) {
  _$jscoverage['/drag.js'].branchData['373'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['373'][2].init(290, 11, 'offsetX < 0');
function visit61_373_2(result) {
  _$jscoverage['/drag.js'].branchData['373'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['373'][1].init(290, 39, 'offsetX < 0 && offset.left < nowXY.left');
function visit60_373_1(result) {
  _$jscoverage['/drag.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['371'][3].init(165, 24, 'offset.left > nowXY.left');
function visit59_371_3(result) {
  _$jscoverage['/drag.js'].branchData['371'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['371'][2].init(150, 11, 'offsetX > 0');
function visit58_371_2(result) {
  _$jscoverage['/drag.js'].branchData['371'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['371'][1].init(150, 39, 'offsetX > 0 && offset.left > nowXY.left');
function visit57_371_1(result) {
  _$jscoverage['/drag.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['368'][1].init(34, 7, '!offset');
function visit56_368_1(result) {
  _$jscoverage['/drag.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['360'][1].init(26, 16, 'allowX && allowY');
function visit55_360_1(result) {
  _$jscoverage['/drag.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['359'][1].init(1159, 16, 'allowX || allowY');
function visit54_359_1(result) {
  _$jscoverage['/drag.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['337'][1].init(388, 17, '!self.pagesOffset');
function visit53_337_1(result) {
  _$jscoverage['/drag.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['326'][1].init(40, 10, 'count == 2');
function visit52_326_1(result) {
  _$jscoverage['/drag.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['317'][2].init(546, 33, 'Math.abs(offsetY) > snapThreshold');
function visit51_317_2(result) {
  _$jscoverage['/drag.js'].branchData['317'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['317'][1].init(522, 57, 'self.allowScroll.top && Math.abs(offsetY) > snapThreshold');
function visit50_317_1(result) {
  _$jscoverage['/drag.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['316'][2].init(465, 33, 'Math.abs(offsetX) > snapThreshold');
function visit49_316_2(result) {
  _$jscoverage['/drag.js'].branchData['316'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['316'][1].init(440, 58, 'self.allowScroll.left && Math.abs(offsetX) > snapThreshold');
function visit48_316_1(result) {
  _$jscoverage['/drag.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['309'][1].init(115, 35, '!startMousePos || !self.isScrolling');
function visit47_309_1(result) {
  _$jscoverage['/drag.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['300'][1].init(10274, 7, 'S.UA.ie');
function visit46_300_1(result) {
  _$jscoverage['/drag.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['289'][1].init(1433, 34, 'S.Features.isTouchEventSupported()');
function visit45_289_1(result) {
  _$jscoverage['/drag.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['282'][3].init(736, 26, 'dragInitDirection == \'top\'');
function visit44_282_3(result) {
  _$jscoverage['/drag.js'].branchData['282'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['282'][2].init(736, 66, 'dragInitDirection == \'top\' && !self.allowScroll[dragInitDirection]');
function visit43_282_2(result) {
  _$jscoverage['/drag.js'].branchData['282'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['282'][1].init(727, 75, 'lockY && dragInitDirection == \'top\' && !self.allowScroll[dragInitDirection]');
function visit42_282_1(result) {
  _$jscoverage['/drag.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['276'][3].init(508, 27, 'dragInitDirection == \'left\'');
function visit41_276_3(result) {
  _$jscoverage['/drag.js'].branchData['276'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['276'][2].init(508, 67, 'dragInitDirection == \'left\' && !self.allowScroll[dragInitDirection]');
function visit40_276_2(result) {
  _$jscoverage['/drag.js'].branchData['276'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['276'][1].init(499, 76, 'lockX && dragInitDirection == \'left\' && !self.allowScroll[dragInitDirection]');
function visit39_276_1(result) {
  _$jscoverage['/drag.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['273'][1].init(63, 13, 'xDiff > yDiff');
function visit38_273_1(result) {
  _$jscoverage['/drag.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['272'][1].init(322, 45, '!(dragInitDirection = self.dragInitDirection)');
function visit37_272_1(result) {
  _$jscoverage['/drag.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['266'][1].init(195, 26, 'Math.max(xDiff, yDiff) < 5');
function visit36_266_1(result) {
  _$jscoverage['/drag.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['261'][1].init(455, 14, 'lockX || lockY');
function visit35_261_1(result) {
  _$jscoverage['/drag.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['248'][1].init(91, 35, '!startMousePos || !self.isScrolling');
function visit34_248_1(result) {
  _$jscoverage['/drag.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['227'][1].init(345, 11, 'isScrolling');
function visit33_227_1(result) {
  _$jscoverage['/drag.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['218'][1].init(88, 20, 'self.get(\'disabled\')');
function visit32_218_1(result) {
  _$jscoverage['/drag.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['207'][1].init(351, 11, 'value === 0');
function visit31_207_1(result) {
  _$jscoverage['/drag.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['196'][1].init(1144, 18, 'value <= minScroll');
function visit30_196_1(result) {
  _$jscoverage['/drag.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['182'][1].init(58, 22, 'fx.lastValue === value');
function visit29_182_1(result) {
  _$jscoverage['/drag.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['180'][3].init(396, 17, 'value < maxScroll');
function visit28_180_3(result) {
  _$jscoverage['/drag.js'].branchData['180'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['180'][2].init(375, 17, 'value > minScroll');
function visit27_180_2(result) {
  _$jscoverage['/drag.js'].branchData['180'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['180'][1].init(375, 38, 'value > minScroll && value < maxScroll');
function visit26_180_1(result) {
  _$jscoverage['/drag.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['172'][1].init(132, 7, 'inertia');
function visit25_172_1(result) {
  _$jscoverage['/drag.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['127'][3].init(1317, 13, 'distance == 0');
function visit24_127_3(result) {
  _$jscoverage['/drag.js'].branchData['127'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['127'][2].init(1300, 13, 'duration == 0');
function visit23_127_2(result) {
  _$jscoverage['/drag.js'].branchData['127'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['127'][1].init(1300, 30, 'duration == 0 || distance == 0');
function visit22_127_1(result) {
  _$jscoverage['/drag.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['117'][1].init(1037, 16, 'self.pagesOffset');
function visit21_117_1(result) {
  _$jscoverage['/drag.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['105'][1].init(657, 19, 'bound !== undefined');
function visit20_105_1(result) {
  _$jscoverage['/drag.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['102'][1].init(556, 30, 'scroll > maxScroll[scrollType]');
function visit19_102_1(result) {
  _$jscoverage['/drag.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['100'][1].init(457, 30, 'scroll < minScroll[scrollType]');
function visit18_100_1(result) {
  _$jscoverage['/drag.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['87'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit17_87_1(result) {
  _$jscoverage['/drag.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['80'][1].init(78, 49, '!self.allowScroll[scrollType] && self.get(lockXY)');
function visit16_80_1(result) {
  _$jscoverage['/drag.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['79'][1].init(23, 20, 'scrollType == \'left\'');
function visit15_79_1(result) {
  _$jscoverage['/drag.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['66'][2].init(118, 32, 'timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit14_66_2(result) {
  _$jscoverage['/drag.js'].branchData['66'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['66'][1].init(55, 39, 'lastDirection[scrollType] !== direction');
function visit13_66_1(result) {
  _$jscoverage['/drag.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['65'][4].init(1676, 39, 'lastDirection[scrollType] !== undefined');
function visit12_65_4(result) {
  _$jscoverage['/drag.js'].branchData['65'][4].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['65'][3].init(1676, 95, 'lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit11_65_3(result) {
  _$jscoverage['/drag.js'].branchData['65'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['65'][2].init(1656, 115, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit10_65_2(result) {
  _$jscoverage['/drag.js'].branchData['65'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['65'][1].init(1656, 151, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction || timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit9_65_1(result) {
  _$jscoverage['/drag.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['56'][1].init(1360, 30, 'scroll > maxScroll[scrollType]');
function visit8_56_1(result) {
  _$jscoverage['/drag.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['52'][1].init(1156, 30, 'scroll < minScroll[scrollType]');
function visit7_52_1(result) {
  _$jscoverage['/drag.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['48'][1].init(1011, 19, '!self.get(\'bounce\')');
function visit6_48_1(result) {
  _$jscoverage['/drag.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['45'][1].init(118, 61, '(pos[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0');
function visit5_45_1(result) {
  _$jscoverage['/drag.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['44'][1].init(32, 57, 'pos[pageOffsetProperty] == lastPageXY[pageOffsetProperty]');
function visit4_44_1(result) {
  _$jscoverage['/drag.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['43'][1].init(771, 30, 'lastPageXY[pageOffsetProperty]');
function visit3_43_1(result) {
  _$jscoverage['/drag.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['30'][1].init(224, 20, 'scrollType == \'left\'');
function visit2_30_1(result) {
  _$jscoverage['/drag.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['23'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit1_23_1(result) {
  _$jscoverage['/drag.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].lineData[5]++;
KISSY.add('scroll-view/drag', function(S, ScrollViewBase, Node) {
  _$jscoverage['/drag.js'].functionData[0]++;
  _$jscoverage['/drag.js'].lineData[6]++;
  var OUT_OF_BOUND_FACTOR = 0.5;
  _$jscoverage['/drag.js'].lineData[8]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/drag.js'].lineData[10]++;
  var SWIPE_SAMPLE_INTERVAL = 300;
  _$jscoverage['/drag.js'].lineData[12]++;
  var MAX_SWIPE_VELOCITY = 6;
  _$jscoverage['/drag.js'].lineData[14]++;
  function onDragStart(self, e, scrollType) {
    _$jscoverage['/drag.js'].functionData[1]++;
    _$jscoverage['/drag.js'].lineData[15]++;
    var now = e.timeStamp, scroll = self.get('scroll' + S.ucfirst(scrollType));
    _$jscoverage['/drag.js'].lineData[17]++;
    self.startScroll[scrollType] = scroll;
    _$jscoverage['/drag.js'].lineData[18]++;
    self.swipe[scrollType].startTime = now;
    _$jscoverage['/drag.js'].lineData[19]++;
    self.swipe[scrollType].scroll = scroll;
  }
  _$jscoverage['/drag.js'].lineData[22]++;
  function onDragScroll(self, e, scrollType, startMousePos) {
    _$jscoverage['/drag.js'].functionData[2]++;
    _$jscoverage['/drag.js'].lineData[23]++;
    if (visit1_23_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/drag.js'].lineData[24]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[26]++;
    var pos = {
  pageX: e.touches[0].pageX, 
  pageY: e.touches[0].pageY};
    _$jscoverage['/drag.js'].lineData[30]++;
    var pageOffsetProperty = visit2_30_1(scrollType == 'left') ? 'pageX' : 'pageY', lastPageXY = self.lastPageXY;
    _$jscoverage['/drag.js'].lineData[32]++;
    var diff = pos[pageOffsetProperty] - startMousePos[pageOffsetProperty], eqWithLastPoint, scroll = self.startScroll[scrollType] - diff, bound, now = e.timeStamp, minScroll = self.minScroll, maxScroll = self.maxScroll, lastDirection = self.lastDirection, swipe = self.swipe, direction;
    _$jscoverage['/drag.js'].lineData[43]++;
    if (visit3_43_1(lastPageXY[pageOffsetProperty])) {
      _$jscoverage['/drag.js'].lineData[44]++;
      eqWithLastPoint = visit4_44_1(pos[pageOffsetProperty] == lastPageXY[pageOffsetProperty]);
      _$jscoverage['/drag.js'].lineData[45]++;
      direction = visit5_45_1((pos[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0);
    }
    _$jscoverage['/drag.js'].lineData[48]++;
    if (visit6_48_1(!self.get('bounce'))) {
      _$jscoverage['/drag.js'].lineData[49]++;
      scroll = Math.min(Math.max(scroll, minScroll[scrollType]), maxScroll[scrollType]);
    }
    _$jscoverage['/drag.js'].lineData[52]++;
    if (visit7_52_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/drag.js'].lineData[53]++;
      bound = minScroll[scrollType] - scroll;
      _$jscoverage['/drag.js'].lineData[54]++;
      bound *= OUT_OF_BOUND_FACTOR;
      _$jscoverage['/drag.js'].lineData[55]++;
      scroll = minScroll[scrollType] - bound;
    } else {
      _$jscoverage['/drag.js'].lineData[56]++;
      if (visit8_56_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/drag.js'].lineData[57]++;
        bound = scroll - maxScroll[scrollType];
        _$jscoverage['/drag.js'].lineData[58]++;
        bound *= OUT_OF_BOUND_FACTOR;
        _$jscoverage['/drag.js'].lineData[59]++;
        scroll = maxScroll[scrollType] + bound;
      }
    }
    _$jscoverage['/drag.js'].lineData[62]++;
    var timeDiff = (now - swipe[scrollType].startTime);
    _$jscoverage['/drag.js'].lineData[65]++;
    if (visit9_65_1(visit10_65_2(!eqWithLastPoint && visit11_65_3(visit12_65_4(lastDirection[scrollType] !== undefined) && visit13_66_1(lastDirection[scrollType] !== direction))) || visit14_66_2(timeDiff > SWIPE_SAMPLE_INTERVAL))) {
      _$jscoverage['/drag.js'].lineData[67]++;
      swipe[scrollType].startTime = now;
      _$jscoverage['/drag.js'].lineData[68]++;
      swipe[scrollType].scroll = scroll;
    }
    _$jscoverage['/drag.js'].lineData[72]++;
    self.set('scroll' + S.ucfirst(scrollType), scroll);
    _$jscoverage['/drag.js'].lineData[73]++;
    lastDirection[scrollType] = direction;
    _$jscoverage['/drag.js'].lineData[75]++;
    lastPageXY[pageOffsetProperty] = e[pageOffsetProperty];
  }
  _$jscoverage['/drag.js'].lineData[78]++;
  function forbidDrag(self, scrollType) {
    _$jscoverage['/drag.js'].functionData[3]++;
    _$jscoverage['/drag.js'].lineData[79]++;
    var lockXY = visit15_79_1(scrollType == 'left') ? 'lockX' : 'lockY';
    _$jscoverage['/drag.js'].lineData[80]++;
    if (visit16_80_1(!self.allowScroll[scrollType] && self.get(lockXY))) {
      _$jscoverage['/drag.js'].lineData[81]++;
      return 1;
    }
    _$jscoverage['/drag.js'].lineData[83]++;
    return 0;
  }
  _$jscoverage['/drag.js'].lineData[86]++;
  function onDragEndAxis(self, e, scrollType, endCallback) {
    _$jscoverage['/drag.js'].functionData[4]++;
    _$jscoverage['/drag.js'].lineData[87]++;
    if (visit17_87_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/drag.js'].lineData[88]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[89]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[91]++;
    var scrollAxis = 'scroll' + S.ucfirst(scrollType), $contentEl = self.$contentEl, scroll = self.get(scrollAxis), anim = {}, minScroll = self.minScroll, maxScroll = self.maxScroll, now = e.timeStamp, swipe = self.swipe, bound;
    _$jscoverage['/drag.js'].lineData[100]++;
    if (visit18_100_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/drag.js'].lineData[101]++;
      bound = minScroll[scrollType];
    } else {
      _$jscoverage['/drag.js'].lineData[102]++;
      if (visit19_102_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/drag.js'].lineData[103]++;
        bound = maxScroll[scrollType];
      }
    }
    _$jscoverage['/drag.js'].lineData[105]++;
    if (visit20_105_1(bound !== undefined)) {
      _$jscoverage['/drag.js'].lineData[106]++;
      var scrollCfg = {};
      _$jscoverage['/drag.js'].lineData[107]++;
      scrollCfg[scrollType] = bound;
      _$jscoverage['/drag.js'].lineData[108]++;
      self.scrollTo(scrollCfg, {
  duration: self.get('bounceDuration'), 
  easing: self.get('bounceEasing'), 
  queue: false, 
  complete: endCallback});
      _$jscoverage['/drag.js'].lineData[114]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[117]++;
    if (visit21_117_1(self.pagesOffset)) {
      _$jscoverage['/drag.js'].lineData[118]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[119]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[122]++;
    var duration = now - swipe[scrollType].startTime;
    _$jscoverage['/drag.js'].lineData[123]++;
    var distance = (scroll - swipe[scrollType].scroll);
    _$jscoverage['/drag.js'].lineData[127]++;
    if (visit22_127_1(visit23_127_2(duration == 0) || visit24_127_3(distance == 0))) {
      _$jscoverage['/drag.js'].lineData[128]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[129]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[135]++;
    var velocity = distance / duration;
    _$jscoverage['/drag.js'].lineData[137]++;
    velocity = Math.min(Math.max(velocity, -MAX_SWIPE_VELOCITY), MAX_SWIPE_VELOCITY);
    _$jscoverage['/drag.js'].lineData[142]++;
    anim[scrollType] = {
  frame: makeMomentumFx(self, velocity, scroll, scrollAxis, maxScroll[scrollType], minScroll[scrollType])};
    _$jscoverage['/drag.js'].lineData[148]++;
    $contentEl.animate(anim, {
  duration: 9999, 
  queue: false, 
  complete: endCallback});
  }
  _$jscoverage['/drag.js'].lineData[155]++;
  var FRICTION = 0.5;
  _$jscoverage['/drag.js'].lineData[156]++;
  var ACCELERATION = 20;
  _$jscoverage['/drag.js'].lineData[157]++;
  var THETA = Math.log(1 - (FRICTION / 10));
  _$jscoverage['/drag.js'].lineData[158]++;
  var ALPHA = THETA / ACCELERATION;
  _$jscoverage['/drag.js'].lineData[159]++;
  var SPRING_TENSION = 0.3;
  _$jscoverage['/drag.js'].lineData[161]++;
  function makeMomentumFx(self, startVelocity, startScroll, scrollAxis, maxScroll, minScroll) {
    _$jscoverage['/drag.js'].functionData[5]++;
    _$jscoverage['/drag.js'].lineData[163]++;
    var velocity = startVelocity * ACCELERATION;
    _$jscoverage['/drag.js'].lineData[164]++;
    var inertia = 1;
    _$jscoverage['/drag.js'].lineData[165]++;
    var bounceStartTime = 0;
    _$jscoverage['/drag.js'].lineData[166]++;
    return function(anim) {
  _$jscoverage['/drag.js'].functionData[6]++;
  _$jscoverage['/drag.js'].lineData[167]++;
  var now = S.now(), fx = this, deltaTime, value;
  _$jscoverage['/drag.js'].lineData[172]++;
  if (visit25_172_1(inertia)) {
    _$jscoverage['/drag.js'].lineData[173]++;
    deltaTime = now - anim.startTime;
    _$jscoverage['/drag.js'].lineData[177]++;
    var frictionFactor = Math.exp(deltaTime * ALPHA);
    _$jscoverage['/drag.js'].lineData[179]++;
    value = parseInt(startScroll + velocity * (1 - frictionFactor) / (-THETA));
    _$jscoverage['/drag.js'].lineData[180]++;
    if (visit26_180_1(visit27_180_2(value > minScroll) && visit28_180_3(value < maxScroll))) {
      _$jscoverage['/drag.js'].lineData[182]++;
      if (visit29_182_1(fx.lastValue === value)) {
        _$jscoverage['/drag.js'].lineData[183]++;
        fx.pos = 1;
      }
      _$jscoverage['/drag.js'].lineData[185]++;
      fx.lastValue = value;
      _$jscoverage['/drag.js'].lineData[186]++;
      self.set(scrollAxis, value);
      _$jscoverage['/drag.js'].lineData[187]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[189]++;
    inertia = 0;
    _$jscoverage['/drag.js'].lineData[190]++;
    velocity = velocity * frictionFactor;
    _$jscoverage['/drag.js'].lineData[196]++;
    startScroll = visit30_196_1(value <= minScroll) ? minScroll : maxScroll;
    _$jscoverage['/drag.js'].lineData[198]++;
    bounceStartTime = now;
  } else {
    _$jscoverage['/drag.js'].lineData[200]++;
    deltaTime = now - bounceStartTime;
    _$jscoverage['/drag.js'].lineData[202]++;
    var theta = (deltaTime / ACCELERATION), powTime = theta * Math.exp(-SPRING_TENSION * theta);
    _$jscoverage['/drag.js'].lineData[206]++;
    value = parseInt(velocity * powTime);
    _$jscoverage['/drag.js'].lineData[207]++;
    if (visit31_207_1(value === 0)) {
      _$jscoverage['/drag.js'].lineData[208]++;
      fx.pos = 1;
    }
    _$jscoverage['/drag.js'].lineData[210]++;
    self.set(scrollAxis, startScroll + value);
  }
};
  }
  _$jscoverage['/drag.js'].lineData[215]++;
  function onDragStartHandler(e) {
    _$jscoverage['/drag.js'].functionData[7]++;
    _$jscoverage['/drag.js'].lineData[217]++;
    var self = this;
    _$jscoverage['/drag.js'].lineData[218]++;
    if (visit32_218_1(self.get('disabled'))) {
      _$jscoverage['/drag.js'].lineData[219]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[221]++;
    var pos = {
  pageX: e.touches[0].pageX, 
  pageY: e.touches[0].pageY};
    _$jscoverage['/drag.js'].lineData[225]++;
    var isScrolling = self.isScrolling;
    _$jscoverage['/drag.js'].lineData[226]++;
    self.stopAnimation();
    _$jscoverage['/drag.js'].lineData[227]++;
    if (visit33_227_1(isScrolling)) {
      _$jscoverage['/drag.js'].lineData[228]++;
      var pageIndex = self.get('pageIndex');
      _$jscoverage['/drag.js'].lineData[229]++;
      self.fire('scrollEnd', S.mix({
  fromPageIndex: pageIndex, 
  pageIndex: pageIndex}, pos));
    }
    _$jscoverage['/drag.js'].lineData[234]++;
    initStates(self);
    _$jscoverage['/drag.js'].lineData[235]++;
    self.startMousePos = pos;
    _$jscoverage['/drag.js'].lineData[236]++;
    onDragStart(self, e, 'left');
    _$jscoverage['/drag.js'].lineData[237]++;
    onDragStart(self, e, 'top');
    _$jscoverage['/drag.js'].lineData[238]++;
    self.fire('scrollStart', pos);
    _$jscoverage['/drag.js'].lineData[239]++;
    self.isScrolling = 1;
    _$jscoverage['/drag.js'].lineData[241]++;
    self.$contentEl.on(Gesture.move, onDragHandler, self);
  }
  _$jscoverage['/drag.js'].lineData[244]++;
  function onDragHandler(e) {
    _$jscoverage['/drag.js'].functionData[8]++;
    _$jscoverage['/drag.js'].lineData[245]++;
    var self = this, startMousePos = self.startMousePos;
    _$jscoverage['/drag.js'].lineData[248]++;
    if (visit34_248_1(!startMousePos || !self.isScrolling)) {
      _$jscoverage['/drag.js'].lineData[249]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[252]++;
    var lockX = self.get('lockX'), lockY = self.get('lockY');
    _$jscoverage['/drag.js'].lineData[255]++;
    var pos = {
  pageX: e.touches[0].pageX, 
  pageY: e.touches[0].pageY};
    _$jscoverage['/drag.js'].lineData[261]++;
    if (visit35_261_1(lockX || lockY)) {
      _$jscoverage['/drag.js'].lineData[262]++;
      var xDiff = Math.abs(pos.pageX - startMousePos.pageX);
      _$jscoverage['/drag.js'].lineData[263]++;
      var yDiff = Math.abs(pos.pageY - startMousePos.pageY);
      _$jscoverage['/drag.js'].lineData[266]++;
      if (visit36_266_1(Math.max(xDiff, yDiff) < 5)) {
        _$jscoverage['/drag.js'].lineData[267]++;
        return;
      }
      _$jscoverage['/drag.js'].lineData[270]++;
      var dragInitDirection;
      _$jscoverage['/drag.js'].lineData[272]++;
      if (visit37_272_1(!(dragInitDirection = self.dragInitDirection))) {
        _$jscoverage['/drag.js'].lineData[273]++;
        self.dragInitDirection = dragInitDirection = visit38_273_1(xDiff > yDiff) ? 'left' : 'top';
      }
      _$jscoverage['/drag.js'].lineData[276]++;
      if (visit39_276_1(lockX && visit40_276_2(visit41_276_3(dragInitDirection == 'left') && !self.allowScroll[dragInitDirection]))) {
        _$jscoverage['/drag.js'].lineData[277]++;
        S.log('not in right direction');
        _$jscoverage['/drag.js'].lineData[278]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[279]++;
        return;
      }
      _$jscoverage['/drag.js'].lineData[282]++;
      if (visit42_282_1(lockY && visit43_282_2(visit44_282_3(dragInitDirection == 'top') && !self.allowScroll[dragInitDirection]))) {
        _$jscoverage['/drag.js'].lineData[283]++;
        S.log('not in right direction');
        _$jscoverage['/drag.js'].lineData[284]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[285]++;
        return;
      }
    }
    _$jscoverage['/drag.js'].lineData[289]++;
    if (visit45_289_1(S.Features.isTouchEventSupported())) {
      _$jscoverage['/drag.js'].lineData[290]++;
      e.preventDefault();
    }
    _$jscoverage['/drag.js'].lineData[293]++;
    onDragScroll(self, e, 'left', startMousePos);
    _$jscoverage['/drag.js'].lineData[294]++;
    onDragScroll(self, e, 'top', startMousePos);
    _$jscoverage['/drag.js'].lineData[297]++;
    self.fire('scrollMove', pos);
  }
  _$jscoverage['/drag.js'].lineData[300]++;
  if (visit46_300_1(S.UA.ie)) {
    _$jscoverage['/drag.js'].lineData[301]++;
    onDragHandler = S.throttle(onDragHandler, 30);
  }
  _$jscoverage['/drag.js'].lineData[304]++;
  function onDragEndHandler(e) {
    _$jscoverage['/drag.js'].functionData[9]++;
    _$jscoverage['/drag.js'].lineData[305]++;
    var self = this;
    _$jscoverage['/drag.js'].lineData[306]++;
    var count = 0;
    _$jscoverage['/drag.js'].lineData[307]++;
    var startMousePos = self.startMousePos;
    _$jscoverage['/drag.js'].lineData[309]++;
    if (visit47_309_1(!startMousePos || !self.isScrolling)) {
      _$jscoverage['/drag.js'].lineData[310]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[312]++;
    self.$contentEl.detach(Gesture.move, onDragHandler, self);
    _$jscoverage['/drag.js'].lineData[313]++;
    var offsetX = startMousePos.pageX - e.pageX;
    _$jscoverage['/drag.js'].lineData[314]++;
    var offsetY = startMousePos.pageY - e.pageY;
    _$jscoverage['/drag.js'].lineData[315]++;
    var snapThreshold = self.get('snapThreshold');
    _$jscoverage['/drag.js'].lineData[316]++;
    var allowX = visit48_316_1(self.allowScroll.left && visit49_316_2(Math.abs(offsetX) > snapThreshold));
    _$jscoverage['/drag.js'].lineData[317]++;
    var allowY = visit50_317_1(self.allowScroll.top && visit51_317_2(Math.abs(offsetY) > snapThreshold));
    _$jscoverage['/drag.js'].lineData[319]++;
    self.fire('dragend', {
  pageX: e.pageX, 
  pageY: e.pageY});
    _$jscoverage['/drag.js'].lineData[324]++;
    function endCallback() {
      _$jscoverage['/drag.js'].functionData[10]++;
      _$jscoverage['/drag.js'].lineData[325]++;
      count++;
      _$jscoverage['/drag.js'].lineData[326]++;
      if (visit52_326_1(count == 2)) {
        _$jscoverage['/drag.js'].lineData[327]++;
        function scrollEnd() {
          _$jscoverage['/drag.js'].functionData[11]++;
          _$jscoverage['/drag.js'].lineData[328]++;
          self.isScrolling = 0;
          _$jscoverage['/drag.js'].lineData[329]++;
          self.fire('scrollEnd', {
  pageX: e.pageX, 
  pageY: e.pageY, 
  fromPageIndex: pageIndex, 
  pageIndex: self.get('pageIndex')});
        }        _$jscoverage['/drag.js'].lineData[337]++;
        if (visit53_337_1(!self.pagesOffset)) {
          _$jscoverage['/drag.js'].lineData[338]++;
          scrollEnd();
          _$jscoverage['/drag.js'].lineData[339]++;
          return;
        }
        _$jscoverage['/drag.js'].lineData[342]++;
        var snapThreshold = self.get('snapThreshold');
        _$jscoverage['/drag.js'].lineData[343]++;
        var snapDuration = self.get('snapDuration');
        _$jscoverage['/drag.js'].lineData[344]++;
        var snapEasing = self.get('snapEasing');
        _$jscoverage['/drag.js'].lineData[345]++;
        var pageIndex = self.get('pageIndex');
        _$jscoverage['/drag.js'].lineData[346]++;
        var scrollLeft = self.get('scrollLeft');
        _$jscoverage['/drag.js'].lineData[347]++;
        var scrollTop = self.get('scrollTop');
        _$jscoverage['/drag.js'].lineData[349]++;
        var animCfg = {
  duration: snapDuration, 
  easing: snapEasing, 
  complete: scrollEnd};
        _$jscoverage['/drag.js'].lineData[355]++;
        var pagesOffset = self.pagesOffset.concat([]);
        _$jscoverage['/drag.js'].lineData[357]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[359]++;
        if (visit54_359_1(allowX || allowY)) {
          _$jscoverage['/drag.js'].lineData[360]++;
          if (visit55_360_1(allowX && allowY)) {
            _$jscoverage['/drag.js'].lineData[361]++;
            var prepareX = [], newPageIndex = undefined;
            _$jscoverage['/drag.js'].lineData[363]++;
            var nowXY = {
  left: scrollLeft, 
  top: scrollTop};
            _$jscoverage['/drag.js'].lineData[367]++;
            S.each(pagesOffset, function(offset) {
  _$jscoverage['/drag.js'].functionData[12]++;
  _$jscoverage['/drag.js'].lineData[368]++;
  if (visit56_368_1(!offset)) {
    _$jscoverage['/drag.js'].lineData[369]++;
    return;
  }
  _$jscoverage['/drag.js'].lineData[371]++;
  if (visit57_371_1(visit58_371_2(offsetX > 0) && visit59_371_3(offset.left > nowXY.left))) {
    _$jscoverage['/drag.js'].lineData[372]++;
    prepareX.push(offset);
  } else {
    _$jscoverage['/drag.js'].lineData[373]++;
    if (visit60_373_1(visit61_373_2(offsetX < 0) && visit62_373_3(offset.left < nowXY.left))) {
      _$jscoverage['/drag.js'].lineData[374]++;
      prepareX.push(offset);
    }
  }
});
            _$jscoverage['/drag.js'].lineData[377]++;
            var min;
            _$jscoverage['/drag.js'].lineData[378]++;
            if (visit63_378_1(offsetY > 0)) {
              _$jscoverage['/drag.js'].lineData[379]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/drag.js'].lineData[380]++;
              S.each(prepareX, function(x) {
  _$jscoverage['/drag.js'].functionData[13]++;
  _$jscoverage['/drag.js'].lineData[381]++;
  if (visit64_381_1(x.top > nowXY.top)) {
    _$jscoverage['/drag.js'].lineData[382]++;
    if (visit65_382_1(min < x.top - nowXY.top)) {
      _$jscoverage['/drag.js'].lineData[383]++;
      min = x.top - nowXY.top;
      _$jscoverage['/drag.js'].lineData[384]++;
      newPageIndex = prepareX.index;
    }
  }
});
            } else {
              _$jscoverage['/drag.js'].lineData[389]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/drag.js'].lineData[390]++;
              S.each(prepareX, function(x) {
  _$jscoverage['/drag.js'].functionData[14]++;
  _$jscoverage['/drag.js'].lineData[391]++;
  if (visit66_391_1(x.top < nowXY.top)) {
    _$jscoverage['/drag.js'].lineData[392]++;
    if (visit67_392_1(min < nowXY.top - x.top)) {
      _$jscoverage['/drag.js'].lineData[393]++;
      min = nowXY.top - x.top;
      _$jscoverage['/drag.js'].lineData[394]++;
      newPageIndex = prepareX.index;
    }
  }
});
            }
            _$jscoverage['/drag.js'].lineData[399]++;
            if (visit68_399_1(newPageIndex != undefined)) {
              _$jscoverage['/drag.js'].lineData[400]++;
              if (visit69_400_1(newPageIndex != pageIndex)) {
                _$jscoverage['/drag.js'].lineData[401]++;
                self.scrollToPage(newPageIndex, animCfg);
              } else {
                _$jscoverage['/drag.js'].lineData[403]++;
                self.scrollToPage(newPageIndex);
                _$jscoverage['/drag.js'].lineData[404]++;
                scrollEnd();
              }
            } else {
              _$jscoverage['/drag.js'].lineData[407]++;
              scrollEnd();
            }
          } else {
            _$jscoverage['/drag.js'].lineData[410]++;
            if (visit70_410_1(allowX || allowY)) {
              _$jscoverage['/drag.js'].lineData[411]++;
              var toPageIndex = self._getPageIndexFromXY(allowX ? scrollLeft : scrollTop, allowX, allowX ? offsetX : offsetY);
              _$jscoverage['/drag.js'].lineData[414]++;
              self.scrollToPage(toPageIndex, animCfg);
            } else {
              _$jscoverage['/drag.js'].lineData[416]++;
              self.scrollToPage(self.get('pageIndex'));
              _$jscoverage['/drag.js'].lineData[417]++;
              scrollEnd();
            }
          }
        }
      }
    }
    _$jscoverage['/drag.js'].lineData[424]++;
    onDragEndAxis(self, e, 'left', endCallback);
    _$jscoverage['/drag.js'].lineData[425]++;
    onDragEndAxis(self, e, 'top', endCallback);
  }
  _$jscoverage['/drag.js'].lineData[428]++;
  function initStates(self) {
    _$jscoverage['/drag.js'].functionData[15]++;
    _$jscoverage['/drag.js'].lineData[429]++;
    self.lastPageXY = {};
    _$jscoverage['/drag.js'].lineData[431]++;
    self.lastDirection = {};
    _$jscoverage['/drag.js'].lineData[433]++;
    self.swipe = {
  left: {}, 
  top: {}};
    _$jscoverage['/drag.js'].lineData[438]++;
    self.startMousePos = null;
    _$jscoverage['/drag.js'].lineData[440]++;
    self.startScroll = {};
    _$jscoverage['/drag.js'].lineData[442]++;
    self.dragInitDirection = null;
  }
  _$jscoverage['/drag.js'].lineData[445]++;
  function preventDefault(e) {
    _$jscoverage['/drag.js'].functionData[16]++;
    _$jscoverage['/drag.js'].lineData[446]++;
    e.preventDefault();
  }
  _$jscoverage['/drag.js'].lineData[449]++;
  return ScrollViewBase.extend({
  bindUI: function() {
  _$jscoverage['/drag.js'].functionData[17]++;
  _$jscoverage['/drag.js'].lineData[451]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[454]++;
  self.$contentEl.on('dragstart', preventDefault).on(Gesture.start, onDragStartHandler, self).on(Gesture.end, onDragEndHandler, self);
}, 
  syncUI: function() {
  _$jscoverage['/drag.js'].functionData[18]++;
  _$jscoverage['/drag.js'].lineData[458]++;
  initStates(this);
}, 
  destructor: function() {
  _$jscoverage['/drag.js'].functionData[19]++;
  _$jscoverage['/drag.js'].lineData[462]++;
  this.stopAnimation();
}, 
  stopAnimation: function() {
  _$jscoverage['/drag.js'].functionData[20]++;
  _$jscoverage['/drag.js'].lineData[466]++;
  this.callSuper();
  _$jscoverage['/drag.js'].lineData[467]++;
  self.isScrolling = 0;
}}, {
  ATTRS: {
  lockX: {
  value: true}, 
  lockY: {
  value: false}, 
  snapThreshold: {
  value: 5}, 
  bounce: {
  value: true}, 
  bounceDuration: {
  value: 0.4}, 
  bounceEasing: {
  value: 'easeOut'}}, 
  xclass: 'scroll-view'});
}, {
  requires: ['./base', 'node']});
