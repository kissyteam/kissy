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
  _$jscoverage['/drag.js'].lineData[16] = 0;
  _$jscoverage['/drag.js'].lineData[18] = 0;
  _$jscoverage['/drag.js'].lineData[19] = 0;
  _$jscoverage['/drag.js'].lineData[21] = 0;
  _$jscoverage['/drag.js'].lineData[22] = 0;
  _$jscoverage['/drag.js'].lineData[23] = 0;
  _$jscoverage['/drag.js'].lineData[26] = 0;
  _$jscoverage['/drag.js'].lineData[27] = 0;
  _$jscoverage['/drag.js'].lineData[28] = 0;
  _$jscoverage['/drag.js'].lineData[30] = 0;
  _$jscoverage['/drag.js'].lineData[34] = 0;
  _$jscoverage['/drag.js'].lineData[36] = 0;
  _$jscoverage['/drag.js'].lineData[47] = 0;
  _$jscoverage['/drag.js'].lineData[48] = 0;
  _$jscoverage['/drag.js'].lineData[49] = 0;
  _$jscoverage['/drag.js'].lineData[52] = 0;
  _$jscoverage['/drag.js'].lineData[53] = 0;
  _$jscoverage['/drag.js'].lineData[56] = 0;
  _$jscoverage['/drag.js'].lineData[57] = 0;
  _$jscoverage['/drag.js'].lineData[58] = 0;
  _$jscoverage['/drag.js'].lineData[59] = 0;
  _$jscoverage['/drag.js'].lineData[60] = 0;
  _$jscoverage['/drag.js'].lineData[61] = 0;
  _$jscoverage['/drag.js'].lineData[62] = 0;
  _$jscoverage['/drag.js'].lineData[63] = 0;
  _$jscoverage['/drag.js'].lineData[66] = 0;
  _$jscoverage['/drag.js'].lineData[69] = 0;
  _$jscoverage['/drag.js'].lineData[71] = 0;
  _$jscoverage['/drag.js'].lineData[72] = 0;
  _$jscoverage['/drag.js'].lineData[76] = 0;
  _$jscoverage['/drag.js'].lineData[77] = 0;
  _$jscoverage['/drag.js'].lineData[79] = 0;
  _$jscoverage['/drag.js'].lineData[82] = 0;
  _$jscoverage['/drag.js'].lineData[83] = 0;
  _$jscoverage['/drag.js'].lineData[84] = 0;
  _$jscoverage['/drag.js'].lineData[85] = 0;
  _$jscoverage['/drag.js'].lineData[87] = 0;
  _$jscoverage['/drag.js'].lineData[90] = 0;
  _$jscoverage['/drag.js'].lineData[91] = 0;
  _$jscoverage['/drag.js'].lineData[92] = 0;
  _$jscoverage['/drag.js'].lineData[93] = 0;
  _$jscoverage['/drag.js'].lineData[95] = 0;
  _$jscoverage['/drag.js'].lineData[102] = 0;
  _$jscoverage['/drag.js'].lineData[103] = 0;
  _$jscoverage['/drag.js'].lineData[104] = 0;
  _$jscoverage['/drag.js'].lineData[105] = 0;
  _$jscoverage['/drag.js'].lineData[107] = 0;
  _$jscoverage['/drag.js'].lineData[108] = 0;
  _$jscoverage['/drag.js'].lineData[109] = 0;
  _$jscoverage['/drag.js'].lineData[110] = 0;
  _$jscoverage['/drag.js'].lineData[116] = 0;
  _$jscoverage['/drag.js'].lineData[119] = 0;
  _$jscoverage['/drag.js'].lineData[120] = 0;
  _$jscoverage['/drag.js'].lineData[121] = 0;
  _$jscoverage['/drag.js'].lineData[124] = 0;
  _$jscoverage['/drag.js'].lineData[125] = 0;
  _$jscoverage['/drag.js'].lineData[129] = 0;
  _$jscoverage['/drag.js'].lineData[130] = 0;
  _$jscoverage['/drag.js'].lineData[131] = 0;
  _$jscoverage['/drag.js'].lineData[137] = 0;
  _$jscoverage['/drag.js'].lineData[139] = 0;
  _$jscoverage['/drag.js'].lineData[144] = 0;
  _$jscoverage['/drag.js'].lineData[155] = 0;
  _$jscoverage['/drag.js'].lineData[156] = 0;
  _$jscoverage['/drag.js'].lineData[158] = 0;
  _$jscoverage['/drag.js'].lineData[161] = 0;
  _$jscoverage['/drag.js'].lineData[162] = 0;
  _$jscoverage['/drag.js'].lineData[163] = 0;
  _$jscoverage['/drag.js'].lineData[164] = 0;
  _$jscoverage['/drag.js'].lineData[165] = 0;
  _$jscoverage['/drag.js'].lineData[167] = 0;
  _$jscoverage['/drag.js'].lineData[169] = 0;
  _$jscoverage['/drag.js'].lineData[170] = 0;
  _$jscoverage['/drag.js'].lineData[171] = 0;
  _$jscoverage['/drag.js'].lineData[172] = 0;
  _$jscoverage['/drag.js'].lineData[173] = 0;
  _$jscoverage['/drag.js'].lineData[176] = 0;
  _$jscoverage['/drag.js'].lineData[177] = 0;
  _$jscoverage['/drag.js'].lineData[181] = 0;
  _$jscoverage['/drag.js'].lineData[183] = 0;
  _$jscoverage['/drag.js'].lineData[184] = 0;
  _$jscoverage['/drag.js'].lineData[186] = 0;
  _$jscoverage['/drag.js'].lineData[187] = 0;
  _$jscoverage['/drag.js'].lineData[188] = 0;
  _$jscoverage['/drag.js'].lineData[190] = 0;
  _$jscoverage['/drag.js'].lineData[191] = 0;
  _$jscoverage['/drag.js'].lineData[192] = 0;
  _$jscoverage['/drag.js'].lineData[194] = 0;
  _$jscoverage['/drag.js'].lineData[195] = 0;
  _$jscoverage['/drag.js'].lineData[201] = 0;
  _$jscoverage['/drag.js'].lineData[203] = 0;
  _$jscoverage['/drag.js'].lineData[205] = 0;
  _$jscoverage['/drag.js'].lineData[207] = 0;
  _$jscoverage['/drag.js'].lineData[211] = 0;
  _$jscoverage['/drag.js'].lineData[212] = 0;
  _$jscoverage['/drag.js'].lineData[213] = 0;
  _$jscoverage['/drag.js'].lineData[215] = 0;
  _$jscoverage['/drag.js'].lineData[220] = 0;
  _$jscoverage['/drag.js'].lineData[221] = 0;
  _$jscoverage['/drag.js'].lineData[223] = 0;
  _$jscoverage['/drag.js'].lineData[224] = 0;
  _$jscoverage['/drag.js'].lineData[226] = 0;
  _$jscoverage['/drag.js'].lineData[227] = 0;
  _$jscoverage['/drag.js'].lineData[231] = 0;
  _$jscoverage['/drag.js'].lineData[232] = 0;
  _$jscoverage['/drag.js'].lineData[233] = 0;
  _$jscoverage['/drag.js'].lineData[234] = 0;
  _$jscoverage['/drag.js'].lineData[239] = 0;
  _$jscoverage['/drag.js'].lineData[240] = 0;
  _$jscoverage['/drag.js'].lineData[242] = 0;
  _$jscoverage['/drag.js'].lineData[243] = 0;
  _$jscoverage['/drag.js'].lineData[244] = 0;
  _$jscoverage['/drag.js'].lineData[245] = 0;
  _$jscoverage['/drag.js'].lineData[248] = 0;
  _$jscoverage['/drag.js'].lineData[251] = 0;
  _$jscoverage['/drag.js'].lineData[252] = 0;
  _$jscoverage['/drag.js'].lineData[256] = 0;
  _$jscoverage['/drag.js'].lineData[257] = 0;
  _$jscoverage['/drag.js'].lineData[260] = 0;
  _$jscoverage['/drag.js'].lineData[265] = 0;
  _$jscoverage['/drag.js'].lineData[266] = 0;
  _$jscoverage['/drag.js'].lineData[269] = 0;
  _$jscoverage['/drag.js'].lineData[270] = 0;
  _$jscoverage['/drag.js'].lineData[272] = 0;
  _$jscoverage['/drag.js'].lineData[273] = 0;
  _$jscoverage['/drag.js'].lineData[274] = 0;
  _$jscoverage['/drag.js'].lineData[278] = 0;
  _$jscoverage['/drag.js'].lineData[282] = 0;
  _$jscoverage['/drag.js'].lineData[283] = 0;
  _$jscoverage['/drag.js'].lineData[285] = 0;
  _$jscoverage['/drag.js'].lineData[286] = 0;
  _$jscoverage['/drag.js'].lineData[289] = 0;
  _$jscoverage['/drag.js'].lineData[291] = 0;
  _$jscoverage['/drag.js'].lineData[292] = 0;
  _$jscoverage['/drag.js'].lineData[295] = 0;
  _$jscoverage['/drag.js'].lineData[297] = 0;
  _$jscoverage['/drag.js'].lineData[298] = 0;
  _$jscoverage['/drag.js'].lineData[302] = 0;
  _$jscoverage['/drag.js'].lineData[303] = 0;
  _$jscoverage['/drag.js'].lineData[306] = 0;
  _$jscoverage['/drag.js'].lineData[307] = 0;
  _$jscoverage['/drag.js'].lineData[310] = 0;
  _$jscoverage['/drag.js'].lineData[313] = 0;
  _$jscoverage['/drag.js'].lineData[314] = 0;
  _$jscoverage['/drag.js'].lineData[317] = 0;
  _$jscoverage['/drag.js'].lineData[318] = 0;
  _$jscoverage['/drag.js'].lineData[319] = 0;
  _$jscoverage['/drag.js'].lineData[320] = 0;
  _$jscoverage['/drag.js'].lineData[321] = 0;
  _$jscoverage['/drag.js'].lineData[322] = 0;
  _$jscoverage['/drag.js'].lineData[324] = 0;
  _$jscoverage['/drag.js'].lineData[325] = 0;
  _$jscoverage['/drag.js'].lineData[326] = 0;
  _$jscoverage['/drag.js'].lineData[327] = 0;
  _$jscoverage['/drag.js'].lineData[328] = 0;
  _$jscoverage['/drag.js'].lineData[329] = 0;
  _$jscoverage['/drag.js'].lineData[330] = 0;
  _$jscoverage['/drag.js'].lineData[334] = 0;
  _$jscoverage['/drag.js'].lineData[335] = 0;
  _$jscoverage['/drag.js'].lineData[336] = 0;
  _$jscoverage['/drag.js'].lineData[337] = 0;
  _$jscoverage['/drag.js'].lineData[338] = 0;
  _$jscoverage['/drag.js'].lineData[339] = 0;
  _$jscoverage['/drag.js'].lineData[347] = 0;
  _$jscoverage['/drag.js'].lineData[348] = 0;
  _$jscoverage['/drag.js'].lineData[349] = 0;
  _$jscoverage['/drag.js'].lineData[352] = 0;
  _$jscoverage['/drag.js'].lineData[353] = 0;
  _$jscoverage['/drag.js'].lineData[354] = 0;
  _$jscoverage['/drag.js'].lineData[355] = 0;
  _$jscoverage['/drag.js'].lineData[356] = 0;
  _$jscoverage['/drag.js'].lineData[357] = 0;
  _$jscoverage['/drag.js'].lineData[359] = 0;
  _$jscoverage['/drag.js'].lineData[365] = 0;
  _$jscoverage['/drag.js'].lineData[367] = 0;
  _$jscoverage['/drag.js'].lineData[369] = 0;
  _$jscoverage['/drag.js'].lineData[370] = 0;
  _$jscoverage['/drag.js'].lineData[371] = 0;
  _$jscoverage['/drag.js'].lineData[373] = 0;
  _$jscoverage['/drag.js'].lineData[377] = 0;
  _$jscoverage['/drag.js'].lineData[378] = 0;
  _$jscoverage['/drag.js'].lineData[379] = 0;
  _$jscoverage['/drag.js'].lineData[381] = 0;
  _$jscoverage['/drag.js'].lineData[382] = 0;
  _$jscoverage['/drag.js'].lineData[383] = 0;
  _$jscoverage['/drag.js'].lineData[384] = 0;
  _$jscoverage['/drag.js'].lineData[387] = 0;
  _$jscoverage['/drag.js'].lineData[388] = 0;
  _$jscoverage['/drag.js'].lineData[389] = 0;
  _$jscoverage['/drag.js'].lineData[390] = 0;
  _$jscoverage['/drag.js'].lineData[391] = 0;
  _$jscoverage['/drag.js'].lineData[392] = 0;
  _$jscoverage['/drag.js'].lineData[393] = 0;
  _$jscoverage['/drag.js'].lineData[394] = 0;
  _$jscoverage['/drag.js'].lineData[399] = 0;
  _$jscoverage['/drag.js'].lineData[400] = 0;
  _$jscoverage['/drag.js'].lineData[401] = 0;
  _$jscoverage['/drag.js'].lineData[402] = 0;
  _$jscoverage['/drag.js'].lineData[403] = 0;
  _$jscoverage['/drag.js'].lineData[404] = 0;
  _$jscoverage['/drag.js'].lineData[409] = 0;
  _$jscoverage['/drag.js'].lineData[410] = 0;
  _$jscoverage['/drag.js'].lineData[411] = 0;
  _$jscoverage['/drag.js'].lineData[413] = 0;
  _$jscoverage['/drag.js'].lineData[414] = 0;
  _$jscoverage['/drag.js'].lineData[417] = 0;
  _$jscoverage['/drag.js'].lineData[420] = 0;
  _$jscoverage['/drag.js'].lineData[421] = 0;
  _$jscoverage['/drag.js'].lineData[424] = 0;
  _$jscoverage['/drag.js'].lineData[426] = 0;
  _$jscoverage['/drag.js'].lineData[427] = 0;
  _$jscoverage['/drag.js'].lineData[434] = 0;
  _$jscoverage['/drag.js'].lineData[435] = 0;
  _$jscoverage['/drag.js'].lineData[438] = 0;
  _$jscoverage['/drag.js'].lineData[439] = 0;
  _$jscoverage['/drag.js'].lineData[440] = 0;
  _$jscoverage['/drag.js'].lineData[441] = 0;
  _$jscoverage['/drag.js'].lineData[445] = 0;
  _$jscoverage['/drag.js'].lineData[446] = 0;
  _$jscoverage['/drag.js'].lineData[447] = 0;
  _$jscoverage['/drag.js'].lineData[450] = 0;
  _$jscoverage['/drag.js'].lineData[451] = 0;
  _$jscoverage['/drag.js'].lineData[454] = 0;
  _$jscoverage['/drag.js'].lineData[456] = 0;
  _$jscoverage['/drag.js'].lineData[458] = 0;
  _$jscoverage['/drag.js'].lineData[462] = 0;
  _$jscoverage['/drag.js'].lineData[466] = 0;
  _$jscoverage['/drag.js'].lineData[470] = 0;
  _$jscoverage['/drag.js'].lineData[471] = 0;
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
  _$jscoverage['/drag.js'].branchData['27'] = [];
  _$jscoverage['/drag.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['34'] = [];
  _$jscoverage['/drag.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['47'] = [];
  _$jscoverage['/drag.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['48'] = [];
  _$jscoverage['/drag.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['49'] = [];
  _$jscoverage['/drag.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['52'] = [];
  _$jscoverage['/drag.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['56'] = [];
  _$jscoverage['/drag.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['60'] = [];
  _$jscoverage['/drag.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['69'] = [];
  _$jscoverage['/drag.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['69'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['69'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['69'][4] = new BranchData();
  _$jscoverage['/drag.js'].branchData['70'] = [];
  _$jscoverage['/drag.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['70'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['83'] = [];
  _$jscoverage['/drag.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['84'] = [];
  _$jscoverage['/drag.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['91'] = [];
  _$jscoverage['/drag.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['102'] = [];
  _$jscoverage['/drag.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['104'] = [];
  _$jscoverage['/drag.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['107'] = [];
  _$jscoverage['/drag.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['119'] = [];
  _$jscoverage['/drag.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['129'] = [];
  _$jscoverage['/drag.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['129'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['129'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['176'] = [];
  _$jscoverage['/drag.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['184'] = [];
  _$jscoverage['/drag.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['184'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['184'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['186'] = [];
  _$jscoverage['/drag.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['201'] = [];
  _$jscoverage['/drag.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['212'] = [];
  _$jscoverage['/drag.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['223'] = [];
  _$jscoverage['/drag.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['232'] = [];
  _$jscoverage['/drag.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['239'] = [];
  _$jscoverage['/drag.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['256'] = [];
  _$jscoverage['/drag.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['269'] = [];
  _$jscoverage['/drag.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['272'] = [];
  _$jscoverage['/drag.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['282'] = [];
  _$jscoverage['/drag.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['285'] = [];
  _$jscoverage['/drag.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['286'] = [];
  _$jscoverage['/drag.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['289'] = [];
  _$jscoverage['/drag.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['289'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['289'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['295'] = [];
  _$jscoverage['/drag.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['295'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['295'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['302'] = [];
  _$jscoverage['/drag.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['313'] = [];
  _$jscoverage['/drag.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['321'] = [];
  _$jscoverage['/drag.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['328'] = [];
  _$jscoverage['/drag.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['328'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['329'] = [];
  _$jscoverage['/drag.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['329'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['336'] = [];
  _$jscoverage['/drag.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['347'] = [];
  _$jscoverage['/drag.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['369'] = [];
  _$jscoverage['/drag.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['370'] = [];
  _$jscoverage['/drag.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['378'] = [];
  _$jscoverage['/drag.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['381'] = [];
  _$jscoverage['/drag.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['381'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['381'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['383'] = [];
  _$jscoverage['/drag.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['383'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['383'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['388'] = [];
  _$jscoverage['/drag.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['391'] = [];
  _$jscoverage['/drag.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['392'] = [];
  _$jscoverage['/drag.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['401'] = [];
  _$jscoverage['/drag.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['402'] = [];
  _$jscoverage['/drag.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['409'] = [];
  _$jscoverage['/drag.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['410'] = [];
  _$jscoverage['/drag.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['420'] = [];
  _$jscoverage['/drag.js'].branchData['420'][1] = new BranchData();
}
_$jscoverage['/drag.js'].branchData['420'][1].init(30, 16, 'allowX || allowY');
function visit72_420_1(result) {
  _$jscoverage['/drag.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['410'][1].init(34, 25, 'newPageIndex != pageIndex');
function visit71_410_1(result) {
  _$jscoverage['/drag.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['409'][1].init(1908, 25, 'newPageIndex != undefined');
function visit70_409_1(result) {
  _$jscoverage['/drag.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['402'][1].init(42, 23, 'min < nowXY.top - x.top');
function visit69_402_1(result) {
  _$jscoverage['/drag.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['401'][1].init(38, 17, 'x.top < nowXY.top');
function visit68_401_1(result) {
  _$jscoverage['/drag.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['392'][1].init(42, 23, 'min < x.top - nowXY.top');
function visit67_392_1(result) {
  _$jscoverage['/drag.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['391'][1].init(38, 17, 'x.top > nowXY.top');
function visit66_391_1(result) {
  _$jscoverage['/drag.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['388'][1].init(833, 11, 'offsetY > 0');
function visit65_388_1(result) {
  _$jscoverage['/drag.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['383'][3].init(305, 24, 'offset.left < nowXY.left');
function visit64_383_3(result) {
  _$jscoverage['/drag.js'].branchData['383'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['383'][2].init(290, 11, 'offsetX < 0');
function visit63_383_2(result) {
  _$jscoverage['/drag.js'].branchData['383'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['383'][1].init(290, 39, 'offsetX < 0 && offset.left < nowXY.left');
function visit62_383_1(result) {
  _$jscoverage['/drag.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['381'][3].init(165, 24, 'offset.left > nowXY.left');
function visit61_381_3(result) {
  _$jscoverage['/drag.js'].branchData['381'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['381'][2].init(150, 11, 'offsetX > 0');
function visit60_381_2(result) {
  _$jscoverage['/drag.js'].branchData['381'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['381'][1].init(150, 39, 'offsetX > 0 && offset.left > nowXY.left');
function visit59_381_1(result) {
  _$jscoverage['/drag.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['378'][1].init(34, 7, '!offset');
function visit58_378_1(result) {
  _$jscoverage['/drag.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['370'][1].init(26, 16, 'allowX && allowY');
function visit57_370_1(result) {
  _$jscoverage['/drag.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['369'][1].init(1159, 16, 'allowX || allowY');
function visit56_369_1(result) {
  _$jscoverage['/drag.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['347'][1].init(388, 17, '!self.pagesOffset');
function visit55_347_1(result) {
  _$jscoverage['/drag.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['336'][1].init(40, 10, 'count == 2');
function visit54_336_1(result) {
  _$jscoverage['/drag.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['329'][2].init(538, 33, 'Math.abs(offsetY) > snapThreshold');
function visit53_329_2(result) {
  _$jscoverage['/drag.js'].branchData['329'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['329'][1].init(514, 57, 'self.allowScroll.top && Math.abs(offsetY) > snapThreshold');
function visit52_329_1(result) {
  _$jscoverage['/drag.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['328'][2].init(457, 33, 'Math.abs(offsetX) > snapThreshold');
function visit51_328_2(result) {
  _$jscoverage['/drag.js'].branchData['328'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['328'][1].init(432, 58, 'self.allowScroll.left && Math.abs(offsetX) > snapThreshold');
function visit50_328_1(result) {
  _$jscoverage['/drag.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['321'][1].init(151, 35, '!startMousePos || !self.isScrolling');
function visit49_321_1(result) {
  _$jscoverage['/drag.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['313'][1].init(10598, 7, 'S.UA.ie');
function visit48_313_1(result) {
  _$jscoverage['/drag.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['302'][1].init(1591, 34, 'S.Features.isTouchEventSupported()');
function visit47_302_1(result) {
  _$jscoverage['/drag.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['295'][3].init(472, 26, 'dragInitDirection == \'top\'');
function visit46_295_3(result) {
  _$jscoverage['/drag.js'].branchData['295'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['295'][2].init(472, 66, 'dragInitDirection == \'top\' && !self.allowScroll[dragInitDirection]');
function visit45_295_2(result) {
  _$jscoverage['/drag.js'].branchData['295'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['295'][1].init(463, 75, 'lockY && dragInitDirection == \'top\' && !self.allowScroll[dragInitDirection]');
function visit44_295_1(result) {
  _$jscoverage['/drag.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['289'][3].init(242, 27, 'dragInitDirection == \'left\'');
function visit43_289_3(result) {
  _$jscoverage['/drag.js'].branchData['289'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['289'][2].init(242, 67, 'dragInitDirection == \'left\' && !self.allowScroll[dragInitDirection]');
function visit42_289_2(result) {
  _$jscoverage['/drag.js'].branchData['289'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['289'][1].init(233, 76, 'lockX && dragInitDirection == \'left\' && !self.allowScroll[dragInitDirection]');
function visit41_289_1(result) {
  _$jscoverage['/drag.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['286'][1].init(63, 13, 'xDiff > yDiff');
function visit40_286_1(result) {
  _$jscoverage['/drag.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['285'][1].init(56, 45, '!(dragInitDirection = self.dragInitDirection)');
function visit39_285_1(result) {
  _$jscoverage['/drag.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['282'][1].init(875, 14, 'lockX || lockY');
function visit38_282_1(result) {
  _$jscoverage['/drag.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['272'][1].init(18, 17, '!self.isScrolling');
function visit37_272_1(result) {
  _$jscoverage['/drag.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['269'][1].init(465, 37, 'Math.max(xDiff, yDiff) < PIXEL_THRESH');
function visit36_269_1(result) {
  _$jscoverage['/drag.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['256'][1].init(125, 14, '!startMousePos');
function visit35_256_1(result) {
  _$jscoverage['/drag.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['239'][1].init(570, 18, 'touches.length > 1');
function visit34_239_1(result) {
  _$jscoverage['/drag.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['232'][1].init(331, 11, 'isScrolling');
function visit33_232_1(result) {
  _$jscoverage['/drag.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['223'][1].init(74, 20, 'self.get(\'disabled\')');
function visit32_223_1(result) {
  _$jscoverage['/drag.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['212'][1].init(351, 11, 'value === 0');
function visit31_212_1(result) {
  _$jscoverage['/drag.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['201'][1].init(1177, 18, 'value <= minScroll');
function visit30_201_1(result) {
  _$jscoverage['/drag.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['186'][1].init(58, 22, 'fx.lastValue === value');
function visit29_186_1(result) {
  _$jscoverage['/drag.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['184'][3].init(396, 17, 'value < maxScroll');
function visit28_184_3(result) {
  _$jscoverage['/drag.js'].branchData['184'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['184'][2].init(375, 17, 'value > minScroll');
function visit27_184_2(result) {
  _$jscoverage['/drag.js'].branchData['184'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['184'][1].init(375, 38, 'value > minScroll && value < maxScroll');
function visit26_184_1(result) {
  _$jscoverage['/drag.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['176'][1].init(102, 7, 'inertia');
function visit25_176_1(result) {
  _$jscoverage['/drag.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['129'][3].init(1250, 13, 'distance == 0');
function visit24_129_3(result) {
  _$jscoverage['/drag.js'].branchData['129'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['129'][2].init(1233, 13, 'duration == 0');
function visit23_129_2(result) {
  _$jscoverage['/drag.js'].branchData['129'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['129'][1].init(1233, 30, 'duration == 0 || distance == 0');
function visit22_129_1(result) {
  _$jscoverage['/drag.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['119'][1].init(970, 16, 'self.pagesOffset');
function visit21_119_1(result) {
  _$jscoverage['/drag.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['107'][1].init(590, 19, 'bound !== undefined');
function visit20_107_1(result) {
  _$jscoverage['/drag.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['104'][1].init(489, 30, 'scroll > maxScroll[scrollType]');
function visit19_104_1(result) {
  _$jscoverage['/drag.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['102'][1].init(390, 30, 'scroll < minScroll[scrollType]');
function visit18_102_1(result) {
  _$jscoverage['/drag.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['91'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit17_91_1(result) {
  _$jscoverage['/drag.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['84'][1].init(78, 49, '!self.allowScroll[scrollType] && self.get(lockXY)');
function visit16_84_1(result) {
  _$jscoverage['/drag.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['83'][1].init(23, 20, 'scrollType == \'left\'');
function visit15_83_1(result) {
  _$jscoverage['/drag.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['70'][2].init(118, 32, 'timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit14_70_2(result) {
  _$jscoverage['/drag.js'].branchData['70'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['70'][1].init(55, 39, 'lastDirection[scrollType] !== direction');
function visit13_70_1(result) {
  _$jscoverage['/drag.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['69'][4].init(1676, 39, 'lastDirection[scrollType] !== undefined');
function visit12_69_4(result) {
  _$jscoverage['/drag.js'].branchData['69'][4].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['69'][3].init(1676, 95, 'lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit11_69_3(result) {
  _$jscoverage['/drag.js'].branchData['69'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['69'][2].init(1656, 115, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit10_69_2(result) {
  _$jscoverage['/drag.js'].branchData['69'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['69'][1].init(1656, 151, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction || timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit9_69_1(result) {
  _$jscoverage['/drag.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['60'][1].init(1360, 30, 'scroll > maxScroll[scrollType]');
function visit8_60_1(result) {
  _$jscoverage['/drag.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['56'][1].init(1156, 30, 'scroll < minScroll[scrollType]');
function visit7_56_1(result) {
  _$jscoverage['/drag.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['52'][1].init(1011, 19, '!self.get(\'bounce\')');
function visit6_52_1(result) {
  _$jscoverage['/drag.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['49'][1].init(118, 61, '(pos[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0');
function visit5_49_1(result) {
  _$jscoverage['/drag.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['48'][1].init(32, 57, 'pos[pageOffsetProperty] == lastPageXY[pageOffsetProperty]');
function visit4_48_1(result) {
  _$jscoverage['/drag.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['47'][1].init(771, 30, 'lastPageXY[pageOffsetProperty]');
function visit3_47_1(result) {
  _$jscoverage['/drag.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['34'][1].init(224, 20, 'scrollType == \'left\'');
function visit2_34_1(result) {
  _$jscoverage['/drag.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['27'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit1_27_1(result) {
  _$jscoverage['/drag.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].lineData[5]++;
KISSY.add('scroll-view/drag', function(S, ScrollViewBase, Node, Anim) {
  _$jscoverage['/drag.js'].functionData[0]++;
  _$jscoverage['/drag.js'].lineData[6]++;
  var OUT_OF_BOUND_FACTOR = 0.5;
  _$jscoverage['/drag.js'].lineData[8]++;
  var PIXEL_THRESH = 3;
  _$jscoverage['/drag.js'].lineData[10]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/drag.js'].lineData[12]++;
  var SWIPE_SAMPLE_INTERVAL = 300;
  _$jscoverage['/drag.js'].lineData[14]++;
  var MAX_SWIPE_VELOCITY = 6;
  _$jscoverage['/drag.js'].lineData[16]++;
  var $document = Node.all(document);
  _$jscoverage['/drag.js'].lineData[18]++;
  function onDragStart(self, e, scrollType) {
    _$jscoverage['/drag.js'].functionData[1]++;
    _$jscoverage['/drag.js'].lineData[19]++;
    var now = e.timeStamp, scroll = self.get('scroll' + S.ucfirst(scrollType));
    _$jscoverage['/drag.js'].lineData[21]++;
    self.startScroll[scrollType] = scroll;
    _$jscoverage['/drag.js'].lineData[22]++;
    self.swipe[scrollType].startTime = now;
    _$jscoverage['/drag.js'].lineData[23]++;
    self.swipe[scrollType].scroll = scroll;
  }
  _$jscoverage['/drag.js'].lineData[26]++;
  function onDragScroll(self, e, scrollType, startMousePos) {
    _$jscoverage['/drag.js'].functionData[2]++;
    _$jscoverage['/drag.js'].lineData[27]++;
    if (visit1_27_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/drag.js'].lineData[28]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[30]++;
    var pos = {
  pageX: e.touches[0].pageX, 
  pageY: e.touches[0].pageY};
    _$jscoverage['/drag.js'].lineData[34]++;
    var pageOffsetProperty = visit2_34_1(scrollType == 'left') ? 'pageX' : 'pageY', lastPageXY = self.lastPageXY;
    _$jscoverage['/drag.js'].lineData[36]++;
    var diff = pos[pageOffsetProperty] - startMousePos[pageOffsetProperty], eqWithLastPoint, scroll = self.startScroll[scrollType] - diff, bound, now = e.timeStamp, minScroll = self.minScroll, maxScroll = self.maxScroll, lastDirection = self.lastDirection, swipe = self.swipe, direction;
    _$jscoverage['/drag.js'].lineData[47]++;
    if (visit3_47_1(lastPageXY[pageOffsetProperty])) {
      _$jscoverage['/drag.js'].lineData[48]++;
      eqWithLastPoint = visit4_48_1(pos[pageOffsetProperty] == lastPageXY[pageOffsetProperty]);
      _$jscoverage['/drag.js'].lineData[49]++;
      direction = visit5_49_1((pos[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0);
    }
    _$jscoverage['/drag.js'].lineData[52]++;
    if (visit6_52_1(!self.get('bounce'))) {
      _$jscoverage['/drag.js'].lineData[53]++;
      scroll = Math.min(Math.max(scroll, minScroll[scrollType]), maxScroll[scrollType]);
    }
    _$jscoverage['/drag.js'].lineData[56]++;
    if (visit7_56_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/drag.js'].lineData[57]++;
      bound = minScroll[scrollType] - scroll;
      _$jscoverage['/drag.js'].lineData[58]++;
      bound *= OUT_OF_BOUND_FACTOR;
      _$jscoverage['/drag.js'].lineData[59]++;
      scroll = minScroll[scrollType] - bound;
    } else {
      _$jscoverage['/drag.js'].lineData[60]++;
      if (visit8_60_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/drag.js'].lineData[61]++;
        bound = scroll - maxScroll[scrollType];
        _$jscoverage['/drag.js'].lineData[62]++;
        bound *= OUT_OF_BOUND_FACTOR;
        _$jscoverage['/drag.js'].lineData[63]++;
        scroll = maxScroll[scrollType] + bound;
      }
    }
    _$jscoverage['/drag.js'].lineData[66]++;
    var timeDiff = (now - swipe[scrollType].startTime);
    _$jscoverage['/drag.js'].lineData[69]++;
    if (visit9_69_1(visit10_69_2(!eqWithLastPoint && visit11_69_3(visit12_69_4(lastDirection[scrollType] !== undefined) && visit13_70_1(lastDirection[scrollType] !== direction))) || visit14_70_2(timeDiff > SWIPE_SAMPLE_INTERVAL))) {
      _$jscoverage['/drag.js'].lineData[71]++;
      swipe[scrollType].startTime = now;
      _$jscoverage['/drag.js'].lineData[72]++;
      swipe[scrollType].scroll = scroll;
    }
    _$jscoverage['/drag.js'].lineData[76]++;
    self.set('scroll' + S.ucfirst(scrollType), scroll);
    _$jscoverage['/drag.js'].lineData[77]++;
    lastDirection[scrollType] = direction;
    _$jscoverage['/drag.js'].lineData[79]++;
    lastPageXY[pageOffsetProperty] = e[pageOffsetProperty];
  }
  _$jscoverage['/drag.js'].lineData[82]++;
  function forbidDrag(self, scrollType) {
    _$jscoverage['/drag.js'].functionData[3]++;
    _$jscoverage['/drag.js'].lineData[83]++;
    var lockXY = visit15_83_1(scrollType == 'left') ? 'lockX' : 'lockY';
    _$jscoverage['/drag.js'].lineData[84]++;
    if (visit16_84_1(!self.allowScroll[scrollType] && self.get(lockXY))) {
      _$jscoverage['/drag.js'].lineData[85]++;
      return 1;
    }
    _$jscoverage['/drag.js'].lineData[87]++;
    return 0;
  }
  _$jscoverage['/drag.js'].lineData[90]++;
  function onDragEndAxis(self, e, scrollType, endCallback) {
    _$jscoverage['/drag.js'].functionData[4]++;
    _$jscoverage['/drag.js'].lineData[91]++;
    if (visit17_91_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/drag.js'].lineData[92]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[93]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[95]++;
    var scrollAxis = 'scroll' + S.ucfirst(scrollType), scroll = self.get(scrollAxis), minScroll = self.minScroll, maxScroll = self.maxScroll, now = e.timeStamp, swipe = self.swipe, bound;
    _$jscoverage['/drag.js'].lineData[102]++;
    if (visit18_102_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/drag.js'].lineData[103]++;
      bound = minScroll[scrollType];
    } else {
      _$jscoverage['/drag.js'].lineData[104]++;
      if (visit19_104_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/drag.js'].lineData[105]++;
        bound = maxScroll[scrollType];
      }
    }
    _$jscoverage['/drag.js'].lineData[107]++;
    if (visit20_107_1(bound !== undefined)) {
      _$jscoverage['/drag.js'].lineData[108]++;
      var scrollCfg = {};
      _$jscoverage['/drag.js'].lineData[109]++;
      scrollCfg[scrollType] = bound;
      _$jscoverage['/drag.js'].lineData[110]++;
      self.scrollTo(scrollCfg, {
  duration: self.get('bounceDuration'), 
  easing: self.get('bounceEasing'), 
  queue: false, 
  complete: endCallback});
      _$jscoverage['/drag.js'].lineData[116]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[119]++;
    if (visit21_119_1(self.pagesOffset)) {
      _$jscoverage['/drag.js'].lineData[120]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[121]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[124]++;
    var duration = now - swipe[scrollType].startTime;
    _$jscoverage['/drag.js'].lineData[125]++;
    var distance = (scroll - swipe[scrollType].scroll);
    _$jscoverage['/drag.js'].lineData[129]++;
    if (visit22_129_1(visit23_129_2(duration == 0) || visit24_129_3(distance == 0))) {
      _$jscoverage['/drag.js'].lineData[130]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[131]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[137]++;
    var velocity = distance / duration;
    _$jscoverage['/drag.js'].lineData[139]++;
    velocity = Math.min(Math.max(velocity, -MAX_SWIPE_VELOCITY), MAX_SWIPE_VELOCITY);
    _$jscoverage['/drag.js'].lineData[144]++;
    var animCfg = {
  node: {}, 
  to: {}, 
  duration: 9999, 
  queue: false, 
  complete: endCallback, 
  frame: makeMomentumFx(self, velocity, scroll, scrollAxis, maxScroll[scrollType], minScroll[scrollType])};
    _$jscoverage['/drag.js'].lineData[155]++;
    animCfg.node[scrollType] = scroll;
    _$jscoverage['/drag.js'].lineData[156]++;
    animCfg.to[scrollType] = null;
    _$jscoverage['/drag.js'].lineData[158]++;
    self.scrollAnims.push(new Anim(animCfg).run());
  }
  _$jscoverage['/drag.js'].lineData[161]++;
  var FRICTION = 0.5;
  _$jscoverage['/drag.js'].lineData[162]++;
  var ACCELERATION = 20;
  _$jscoverage['/drag.js'].lineData[163]++;
  var THETA = Math.log(1 - (FRICTION / 10));
  _$jscoverage['/drag.js'].lineData[164]++;
  var ALPHA = THETA / ACCELERATION;
  _$jscoverage['/drag.js'].lineData[165]++;
  var SPRING_TENSION = 0.3;
  _$jscoverage['/drag.js'].lineData[167]++;
  function makeMomentumFx(self, startVelocity, startScroll, scrollAxis, maxScroll, minScroll) {
    _$jscoverage['/drag.js'].functionData[5]++;
    _$jscoverage['/drag.js'].lineData[169]++;
    var velocity = startVelocity * ACCELERATION;
    _$jscoverage['/drag.js'].lineData[170]++;
    var inertia = 1;
    _$jscoverage['/drag.js'].lineData[171]++;
    var bounceStartTime = 0;
    _$jscoverage['/drag.js'].lineData[172]++;
    return function(anim, fx) {
  _$jscoverage['/drag.js'].functionData[6]++;
  _$jscoverage['/drag.js'].lineData[173]++;
  var now = S.now(), deltaTime, value;
  _$jscoverage['/drag.js'].lineData[176]++;
  if (visit25_176_1(inertia)) {
    _$jscoverage['/drag.js'].lineData[177]++;
    deltaTime = now - anim.startTime;
    _$jscoverage['/drag.js'].lineData[181]++;
    var frictionFactor = Math.exp(deltaTime * ALPHA);
    _$jscoverage['/drag.js'].lineData[183]++;
    value = parseInt(startScroll + velocity * (1 - frictionFactor) / (-THETA));
    _$jscoverage['/drag.js'].lineData[184]++;
    if (visit26_184_1(visit27_184_2(value > minScroll) && visit28_184_3(value < maxScroll))) {
      _$jscoverage['/drag.js'].lineData[186]++;
      if (visit29_186_1(fx.lastValue === value)) {
        _$jscoverage['/drag.js'].lineData[187]++;
        fx.pos = 1;
        _$jscoverage['/drag.js'].lineData[188]++;
        return;
      }
      _$jscoverage['/drag.js'].lineData[190]++;
      fx.lastValue = value;
      _$jscoverage['/drag.js'].lineData[191]++;
      self.set(scrollAxis, value);
      _$jscoverage['/drag.js'].lineData[192]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[194]++;
    inertia = 0;
    _$jscoverage['/drag.js'].lineData[195]++;
    velocity = velocity * frictionFactor;
    _$jscoverage['/drag.js'].lineData[201]++;
    startScroll = visit30_201_1(value <= minScroll) ? minScroll : maxScroll;
    _$jscoverage['/drag.js'].lineData[203]++;
    bounceStartTime = now;
  } else {
    _$jscoverage['/drag.js'].lineData[205]++;
    deltaTime = now - bounceStartTime;
    _$jscoverage['/drag.js'].lineData[207]++;
    var theta = (deltaTime / ACCELERATION), powTime = theta * Math.exp(-SPRING_TENSION * theta);
    _$jscoverage['/drag.js'].lineData[211]++;
    value = parseInt(velocity * powTime);
    _$jscoverage['/drag.js'].lineData[212]++;
    if (visit31_212_1(value === 0)) {
      _$jscoverage['/drag.js'].lineData[213]++;
      fx.pos = 1;
    }
    _$jscoverage['/drag.js'].lineData[215]++;
    self.set(scrollAxis, startScroll + value);
  }
};
  }
  _$jscoverage['/drag.js'].lineData[220]++;
  function onDragStartHandler(e) {
    _$jscoverage['/drag.js'].functionData[7]++;
    _$jscoverage['/drag.js'].lineData[221]++;
    var self = this, touches = e.touches;
    _$jscoverage['/drag.js'].lineData[223]++;
    if (visit32_223_1(self.get('disabled'))) {
      _$jscoverage['/drag.js'].lineData[224]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[226]++;
    self.stopAnimation();
    _$jscoverage['/drag.js'].lineData[227]++;
    var pos = {
  pageX: e.touches[0].pageX, 
  pageY: e.touches[0].pageY};
    _$jscoverage['/drag.js'].lineData[231]++;
    var isScrolling = self.isScrolling;
    _$jscoverage['/drag.js'].lineData[232]++;
    if (visit33_232_1(isScrolling)) {
      _$jscoverage['/drag.js'].lineData[233]++;
      var pageIndex = self.get('pageIndex');
      _$jscoverage['/drag.js'].lineData[234]++;
      self.fire('scrollEnd', S.mix({
  fromPageIndex: pageIndex, 
  pageIndex: pageIndex}, pos));
    }
    _$jscoverage['/drag.js'].lineData[239]++;
    if (visit34_239_1(touches.length > 1)) {
      _$jscoverage['/drag.js'].lineData[240]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[242]++;
    initStates(self);
    _$jscoverage['/drag.js'].lineData[243]++;
    self.startMousePos = pos;
    _$jscoverage['/drag.js'].lineData[244]++;
    onDragStart(self, e, 'left');
    _$jscoverage['/drag.js'].lineData[245]++;
    onDragStart(self, e, 'top');
    _$jscoverage['/drag.js'].lineData[248]++;
    $document.on(Gesture.move, onDragHandler, self).on(Gesture.end, onDragEndHandler, self);
  }
  _$jscoverage['/drag.js'].lineData[251]++;
  function onDragHandler(e) {
    _$jscoverage['/drag.js'].functionData[8]++;
    _$jscoverage['/drag.js'].lineData[252]++;
    var self = this, touches = e.touches, startMousePos = self.startMousePos;
    _$jscoverage['/drag.js'].lineData[256]++;
    if (visit35_256_1(!startMousePos)) {
      _$jscoverage['/drag.js'].lineData[257]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[260]++;
    var pos = {
  pageX: touches[0].pageX, 
  pageY: touches[0].pageY};
    _$jscoverage['/drag.js'].lineData[265]++;
    var xDiff = Math.abs(pos.pageX - startMousePos.pageX);
    _$jscoverage['/drag.js'].lineData[266]++;
    var yDiff = Math.abs(pos.pageY - startMousePos.pageY);
    _$jscoverage['/drag.js'].lineData[269]++;
    if (visit36_269_1(Math.max(xDiff, yDiff) < PIXEL_THRESH)) {
      _$jscoverage['/drag.js'].lineData[270]++;
      return;
    } else {
      _$jscoverage['/drag.js'].lineData[272]++;
      if (visit37_272_1(!self.isScrolling)) {
        _$jscoverage['/drag.js'].lineData[273]++;
        self.fire('scrollStart', pos);
        _$jscoverage['/drag.js'].lineData[274]++;
        self.isScrolling = 1;
      }
    }
    _$jscoverage['/drag.js'].lineData[278]++;
    var lockX = self.get('lockX'), lockY = self.get('lockY');
    _$jscoverage['/drag.js'].lineData[282]++;
    if (visit38_282_1(lockX || lockY)) {
      _$jscoverage['/drag.js'].lineData[283]++;
      var dragInitDirection;
      _$jscoverage['/drag.js'].lineData[285]++;
      if (visit39_285_1(!(dragInitDirection = self.dragInitDirection))) {
        _$jscoverage['/drag.js'].lineData[286]++;
        self.dragInitDirection = dragInitDirection = visit40_286_1(xDiff > yDiff) ? 'left' : 'top';
      }
      _$jscoverage['/drag.js'].lineData[289]++;
      if (visit41_289_1(lockX && visit42_289_2(visit43_289_3(dragInitDirection == 'left') && !self.allowScroll[dragInitDirection]))) {
        _$jscoverage['/drag.js'].lineData[291]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[292]++;
        return;
      }
      _$jscoverage['/drag.js'].lineData[295]++;
      if (visit44_295_1(lockY && visit45_295_2(visit46_295_3(dragInitDirection == 'top') && !self.allowScroll[dragInitDirection]))) {
        _$jscoverage['/drag.js'].lineData[297]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[298]++;
        return;
      }
    }
    _$jscoverage['/drag.js'].lineData[302]++;
    if (visit47_302_1(S.Features.isTouchEventSupported())) {
      _$jscoverage['/drag.js'].lineData[303]++;
      e.preventDefault();
    }
    _$jscoverage['/drag.js'].lineData[306]++;
    onDragScroll(self, e, 'left', startMousePos);
    _$jscoverage['/drag.js'].lineData[307]++;
    onDragScroll(self, e, 'top', startMousePos);
    _$jscoverage['/drag.js'].lineData[310]++;
    self.fire('scrollMove', pos);
  }
  _$jscoverage['/drag.js'].lineData[313]++;
  if (visit48_313_1(S.UA.ie)) {
    _$jscoverage['/drag.js'].lineData[314]++;
    onDragHandler = S.throttle(onDragHandler, 30);
  }
  _$jscoverage['/drag.js'].lineData[317]++;
  function onDragEndHandler(e) {
    _$jscoverage['/drag.js'].functionData[9]++;
    _$jscoverage['/drag.js'].lineData[318]++;
    var self = this;
    _$jscoverage['/drag.js'].lineData[319]++;
    var startMousePos = self.startMousePos;
    _$jscoverage['/drag.js'].lineData[320]++;
    $document.detach(Gesture.move, onDragHandler, self);
    _$jscoverage['/drag.js'].lineData[321]++;
    if (visit49_321_1(!startMousePos || !self.isScrolling)) {
      _$jscoverage['/drag.js'].lineData[322]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[324]++;
    var count = 0;
    _$jscoverage['/drag.js'].lineData[325]++;
    var offsetX = startMousePos.pageX - e.pageX;
    _$jscoverage['/drag.js'].lineData[326]++;
    var offsetY = startMousePos.pageY - e.pageY;
    _$jscoverage['/drag.js'].lineData[327]++;
    var snapThreshold = self.get('snapThreshold');
    _$jscoverage['/drag.js'].lineData[328]++;
    var allowX = visit50_328_1(self.allowScroll.left && visit51_328_2(Math.abs(offsetX) > snapThreshold));
    _$jscoverage['/drag.js'].lineData[329]++;
    var allowY = visit52_329_1(self.allowScroll.top && visit53_329_2(Math.abs(offsetY) > snapThreshold));
    _$jscoverage['/drag.js'].lineData[330]++;
    self.fire('dragend', {
  pageX: e.pageX, 
  pageY: e.pageY});
    _$jscoverage['/drag.js'].lineData[334]++;
    function endCallback() {
      _$jscoverage['/drag.js'].functionData[10]++;
      _$jscoverage['/drag.js'].lineData[335]++;
      count++;
      _$jscoverage['/drag.js'].lineData[336]++;
      if (visit54_336_1(count == 2)) {
        _$jscoverage['/drag.js'].lineData[337]++;
        function scrollEnd() {
          _$jscoverage['/drag.js'].functionData[11]++;
          _$jscoverage['/drag.js'].lineData[338]++;
          self.isScrolling = 0;
          _$jscoverage['/drag.js'].lineData[339]++;
          self.fire('scrollEnd', {
  pageX: e.pageX, 
  pageY: e.pageY, 
  fromPageIndex: pageIndex, 
  pageIndex: self.get('pageIndex')});
        }        _$jscoverage['/drag.js'].lineData[347]++;
        if (visit55_347_1(!self.pagesOffset)) {
          _$jscoverage['/drag.js'].lineData[348]++;
          scrollEnd();
          _$jscoverage['/drag.js'].lineData[349]++;
          return;
        }
        _$jscoverage['/drag.js'].lineData[352]++;
        var snapThreshold = self.get('snapThreshold');
        _$jscoverage['/drag.js'].lineData[353]++;
        var snapDuration = self.get('snapDuration');
        _$jscoverage['/drag.js'].lineData[354]++;
        var snapEasing = self.get('snapEasing');
        _$jscoverage['/drag.js'].lineData[355]++;
        var pageIndex = self.get('pageIndex');
        _$jscoverage['/drag.js'].lineData[356]++;
        var scrollLeft = self.get('scrollLeft');
        _$jscoverage['/drag.js'].lineData[357]++;
        var scrollTop = self.get('scrollTop');
        _$jscoverage['/drag.js'].lineData[359]++;
        var animCfg = {
  duration: snapDuration, 
  easing: snapEasing, 
  complete: scrollEnd};
        _$jscoverage['/drag.js'].lineData[365]++;
        var pagesOffset = self.pagesOffset.concat([]);
        _$jscoverage['/drag.js'].lineData[367]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[369]++;
        if (visit56_369_1(allowX || allowY)) {
          _$jscoverage['/drag.js'].lineData[370]++;
          if (visit57_370_1(allowX && allowY)) {
            _$jscoverage['/drag.js'].lineData[371]++;
            var prepareX = [], newPageIndex = undefined;
            _$jscoverage['/drag.js'].lineData[373]++;
            var nowXY = {
  left: scrollLeft, 
  top: scrollTop};
            _$jscoverage['/drag.js'].lineData[377]++;
            S.each(pagesOffset, function(offset) {
  _$jscoverage['/drag.js'].functionData[12]++;
  _$jscoverage['/drag.js'].lineData[378]++;
  if (visit58_378_1(!offset)) {
    _$jscoverage['/drag.js'].lineData[379]++;
    return;
  }
  _$jscoverage['/drag.js'].lineData[381]++;
  if (visit59_381_1(visit60_381_2(offsetX > 0) && visit61_381_3(offset.left > nowXY.left))) {
    _$jscoverage['/drag.js'].lineData[382]++;
    prepareX.push(offset);
  } else {
    _$jscoverage['/drag.js'].lineData[383]++;
    if (visit62_383_1(visit63_383_2(offsetX < 0) && visit64_383_3(offset.left < nowXY.left))) {
      _$jscoverage['/drag.js'].lineData[384]++;
      prepareX.push(offset);
    }
  }
});
            _$jscoverage['/drag.js'].lineData[387]++;
            var min;
            _$jscoverage['/drag.js'].lineData[388]++;
            if (visit65_388_1(offsetY > 0)) {
              _$jscoverage['/drag.js'].lineData[389]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/drag.js'].lineData[390]++;
              S.each(prepareX, function(x) {
  _$jscoverage['/drag.js'].functionData[13]++;
  _$jscoverage['/drag.js'].lineData[391]++;
  if (visit66_391_1(x.top > nowXY.top)) {
    _$jscoverage['/drag.js'].lineData[392]++;
    if (visit67_392_1(min < x.top - nowXY.top)) {
      _$jscoverage['/drag.js'].lineData[393]++;
      min = x.top - nowXY.top;
      _$jscoverage['/drag.js'].lineData[394]++;
      newPageIndex = prepareX.index;
    }
  }
});
            } else {
              _$jscoverage['/drag.js'].lineData[399]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/drag.js'].lineData[400]++;
              S.each(prepareX, function(x) {
  _$jscoverage['/drag.js'].functionData[14]++;
  _$jscoverage['/drag.js'].lineData[401]++;
  if (visit68_401_1(x.top < nowXY.top)) {
    _$jscoverage['/drag.js'].lineData[402]++;
    if (visit69_402_1(min < nowXY.top - x.top)) {
      _$jscoverage['/drag.js'].lineData[403]++;
      min = nowXY.top - x.top;
      _$jscoverage['/drag.js'].lineData[404]++;
      newPageIndex = prepareX.index;
    }
  }
});
            }
            _$jscoverage['/drag.js'].lineData[409]++;
            if (visit70_409_1(newPageIndex != undefined)) {
              _$jscoverage['/drag.js'].lineData[410]++;
              if (visit71_410_1(newPageIndex != pageIndex)) {
                _$jscoverage['/drag.js'].lineData[411]++;
                self.scrollToPage(newPageIndex, animCfg);
              } else {
                _$jscoverage['/drag.js'].lineData[413]++;
                self.scrollToPage(newPageIndex);
                _$jscoverage['/drag.js'].lineData[414]++;
                scrollEnd();
              }
            } else {
              _$jscoverage['/drag.js'].lineData[417]++;
              scrollEnd();
            }
          } else {
            _$jscoverage['/drag.js'].lineData[420]++;
            if (visit72_420_1(allowX || allowY)) {
              _$jscoverage['/drag.js'].lineData[421]++;
              var toPageIndex = self._getPageIndexFromXY(allowX ? scrollLeft : scrollTop, allowX, allowX ? offsetX : offsetY);
              _$jscoverage['/drag.js'].lineData[424]++;
              self.scrollToPage(toPageIndex, animCfg);
            } else {
              _$jscoverage['/drag.js'].lineData[426]++;
              self.scrollToPage(self.get('pageIndex'));
              _$jscoverage['/drag.js'].lineData[427]++;
              scrollEnd();
            }
          }
        }
      }
    }
    _$jscoverage['/drag.js'].lineData[434]++;
    onDragEndAxis(self, e, 'left', endCallback);
    _$jscoverage['/drag.js'].lineData[435]++;
    onDragEndAxis(self, e, 'top', endCallback);
  }
  _$jscoverage['/drag.js'].lineData[438]++;
  function initStates(self) {
    _$jscoverage['/drag.js'].functionData[15]++;
    _$jscoverage['/drag.js'].lineData[439]++;
    self.lastPageXY = {};
    _$jscoverage['/drag.js'].lineData[440]++;
    self.lastDirection = {};
    _$jscoverage['/drag.js'].lineData[441]++;
    self.swipe = {
  left: {}, 
  top: {}};
    _$jscoverage['/drag.js'].lineData[445]++;
    self.startMousePos = null;
    _$jscoverage['/drag.js'].lineData[446]++;
    self.startScroll = {};
    _$jscoverage['/drag.js'].lineData[447]++;
    self.dragInitDirection = null;
  }
  _$jscoverage['/drag.js'].lineData[450]++;
  function preventDefault(e) {
    _$jscoverage['/drag.js'].functionData[16]++;
    _$jscoverage['/drag.js'].lineData[451]++;
    e.preventDefault();
  }
  _$jscoverage['/drag.js'].lineData[454]++;
  return ScrollViewBase.extend({
  bindUI: function() {
  _$jscoverage['/drag.js'].functionData[17]++;
  _$jscoverage['/drag.js'].lineData[456]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[458]++;
  self.$contentEl.on('dragstart', preventDefault).on(Gesture.start, onDragStartHandler, self);
}, 
  syncUI: function() {
  _$jscoverage['/drag.js'].functionData[18]++;
  _$jscoverage['/drag.js'].lineData[462]++;
  initStates(this);
}, 
  destructor: function() {
  _$jscoverage['/drag.js'].functionData[19]++;
  _$jscoverage['/drag.js'].lineData[466]++;
  this.stopAnimation();
}, 
  stopAnimation: function() {
  _$jscoverage['/drag.js'].functionData[20]++;
  _$jscoverage['/drag.js'].lineData[470]++;
  this.callSuper();
  _$jscoverage['/drag.js'].lineData[471]++;
  this.isScrolling = 0;
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
  requires: ['./base', 'node', 'anim']});
