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
if (! _$jscoverage['/control/render.js']) {
  _$jscoverage['/control/render.js'] = {};
  _$jscoverage['/control/render.js'].lineData = [];
  _$jscoverage['/control/render.js'].lineData[7] = 0;
  _$jscoverage['/control/render.js'].lineData[8] = 0;
  _$jscoverage['/control/render.js'].lineData[9] = 0;
  _$jscoverage['/control/render.js'].lineData[10] = 0;
  _$jscoverage['/control/render.js'].lineData[11] = 0;
  _$jscoverage['/control/render.js'].lineData[12] = 0;
  _$jscoverage['/control/render.js'].lineData[14] = 0;
  _$jscoverage['/control/render.js'].lineData[23] = 0;
  _$jscoverage['/control/render.js'].lineData[24] = 0;
  _$jscoverage['/control/render.js'].lineData[25] = 0;
  _$jscoverage['/control/render.js'].lineData[27] = 0;
  _$jscoverage['/control/render.js'].lineData[30] = 0;
  _$jscoverage['/control/render.js'].lineData[31] = 0;
  _$jscoverage['/control/render.js'].lineData[36] = 0;
  _$jscoverage['/control/render.js'].lineData[37] = 0;
  _$jscoverage['/control/render.js'].lineData[39] = 0;
  _$jscoverage['/control/render.js'].lineData[41] = 0;
  _$jscoverage['/control/render.js'].lineData[42] = 0;
  _$jscoverage['/control/render.js'].lineData[43] = 0;
  _$jscoverage['/control/render.js'].lineData[47] = 0;
  _$jscoverage['/control/render.js'].lineData[48] = 0;
  _$jscoverage['/control/render.js'].lineData[51] = 0;
  _$jscoverage['/control/render.js'].lineData[52] = 0;
  _$jscoverage['/control/render.js'].lineData[57] = 0;
  _$jscoverage['/control/render.js'].lineData[58] = 0;
  _$jscoverage['/control/render.js'].lineData[59] = 0;
  _$jscoverage['/control/render.js'].lineData[61] = 0;
  _$jscoverage['/control/render.js'].lineData[62] = 0;
  _$jscoverage['/control/render.js'].lineData[64] = 0;
  _$jscoverage['/control/render.js'].lineData[67] = 0;
  _$jscoverage['/control/render.js'].lineData[68] = 0;
  _$jscoverage['/control/render.js'].lineData[73] = 0;
  _$jscoverage['/control/render.js'].lineData[74] = 0;
  _$jscoverage['/control/render.js'].lineData[75] = 0;
  _$jscoverage['/control/render.js'].lineData[76] = 0;
  _$jscoverage['/control/render.js'].lineData[78] = 0;
  _$jscoverage['/control/render.js'].lineData[81] = 0;
  _$jscoverage['/control/render.js'].lineData[82] = 0;
  _$jscoverage['/control/render.js'].lineData[85] = 0;
  _$jscoverage['/control/render.js'].lineData[86] = 0;
  _$jscoverage['/control/render.js'].lineData[87] = 0;
  _$jscoverage['/control/render.js'].lineData[92] = 0;
  _$jscoverage['/control/render.js'].lineData[93] = 0;
  _$jscoverage['/control/render.js'].lineData[96] = 0;
  _$jscoverage['/control/render.js'].lineData[97] = 0;
  _$jscoverage['/control/render.js'].lineData[100] = 0;
  _$jscoverage['/control/render.js'].lineData[101] = 0;
  _$jscoverage['/control/render.js'].lineData[102] = 0;
  _$jscoverage['/control/render.js'].lineData[103] = 0;
  _$jscoverage['/control/render.js'].lineData[104] = 0;
  _$jscoverage['/control/render.js'].lineData[105] = 0;
  _$jscoverage['/control/render.js'].lineData[106] = 0;
  _$jscoverage['/control/render.js'].lineData[109] = 0;
  _$jscoverage['/control/render.js'].lineData[117] = 0;
  _$jscoverage['/control/render.js'].lineData[121] = 0;
  _$jscoverage['/control/render.js'].lineData[124] = 0;
  _$jscoverage['/control/render.js'].lineData[126] = 0;
  _$jscoverage['/control/render.js'].lineData[128] = 0;
  _$jscoverage['/control/render.js'].lineData[133] = 0;
  _$jscoverage['/control/render.js'].lineData[148] = 0;
  _$jscoverage['/control/render.js'].lineData[149] = 0;
  _$jscoverage['/control/render.js'].lineData[150] = 0;
  _$jscoverage['/control/render.js'].lineData[151] = 0;
  _$jscoverage['/control/render.js'].lineData[155] = 0;
  _$jscoverage['/control/render.js'].lineData[156] = 0;
  _$jscoverage['/control/render.js'].lineData[157] = 0;
  _$jscoverage['/control/render.js'].lineData[158] = 0;
  _$jscoverage['/control/render.js'].lineData[160] = 0;
  _$jscoverage['/control/render.js'].lineData[161] = 0;
  _$jscoverage['/control/render.js'].lineData[163] = 0;
  _$jscoverage['/control/render.js'].lineData[164] = 0;
  _$jscoverage['/control/render.js'].lineData[166] = 0;
  _$jscoverage['/control/render.js'].lineData[167] = 0;
  _$jscoverage['/control/render.js'].lineData[170] = 0;
  _$jscoverage['/control/render.js'].lineData[171] = 0;
  _$jscoverage['/control/render.js'].lineData[174] = 0;
  _$jscoverage['/control/render.js'].lineData[175] = 0;
  _$jscoverage['/control/render.js'].lineData[176] = 0;
  _$jscoverage['/control/render.js'].lineData[178] = 0;
  _$jscoverage['/control/render.js'].lineData[179] = 0;
  _$jscoverage['/control/render.js'].lineData[181] = 0;
  _$jscoverage['/control/render.js'].lineData[183] = 0;
  _$jscoverage['/control/render.js'].lineData[184] = 0;
  _$jscoverage['/control/render.js'].lineData[186] = 0;
  _$jscoverage['/control/render.js'].lineData[191] = 0;
  _$jscoverage['/control/render.js'].lineData[192] = 0;
  _$jscoverage['/control/render.js'].lineData[201] = 0;
  _$jscoverage['/control/render.js'].lineData[203] = 0;
  _$jscoverage['/control/render.js'].lineData[204] = 0;
  _$jscoverage['/control/render.js'].lineData[205] = 0;
  _$jscoverage['/control/render.js'].lineData[206] = 0;
  _$jscoverage['/control/render.js'].lineData[210] = 0;
  _$jscoverage['/control/render.js'].lineData[212] = 0;
  _$jscoverage['/control/render.js'].lineData[213] = 0;
  _$jscoverage['/control/render.js'].lineData[215] = 0;
  _$jscoverage['/control/render.js'].lineData[216] = 0;
  _$jscoverage['/control/render.js'].lineData[217] = 0;
  _$jscoverage['/control/render.js'].lineData[221] = 0;
  _$jscoverage['/control/render.js'].lineData[226] = 0;
  _$jscoverage['/control/render.js'].lineData[227] = 0;
  _$jscoverage['/control/render.js'].lineData[229] = 0;
  _$jscoverage['/control/render.js'].lineData[230] = 0;
  _$jscoverage['/control/render.js'].lineData[231] = 0;
  _$jscoverage['/control/render.js'].lineData[232] = 0;
  _$jscoverage['/control/render.js'].lineData[234] = 0;
  _$jscoverage['/control/render.js'].lineData[240] = 0;
  _$jscoverage['/control/render.js'].lineData[241] = 0;
  _$jscoverage['/control/render.js'].lineData[242] = 0;
  _$jscoverage['/control/render.js'].lineData[243] = 0;
  _$jscoverage['/control/render.js'].lineData[244] = 0;
  _$jscoverage['/control/render.js'].lineData[245] = 0;
  _$jscoverage['/control/render.js'].lineData[246] = 0;
  _$jscoverage['/control/render.js'].lineData[247] = 0;
  _$jscoverage['/control/render.js'].lineData[248] = 0;
  _$jscoverage['/control/render.js'].lineData[250] = 0;
  _$jscoverage['/control/render.js'].lineData[256] = 0;
  _$jscoverage['/control/render.js'].lineData[257] = 0;
  _$jscoverage['/control/render.js'].lineData[262] = 0;
  _$jscoverage['/control/render.js'].lineData[266] = 0;
  _$jscoverage['/control/render.js'].lineData[272] = 0;
  _$jscoverage['/control/render.js'].lineData[274] = 0;
  _$jscoverage['/control/render.js'].lineData[275] = 0;
  _$jscoverage['/control/render.js'].lineData[276] = 0;
  _$jscoverage['/control/render.js'].lineData[277] = 0;
  _$jscoverage['/control/render.js'].lineData[279] = 0;
  _$jscoverage['/control/render.js'].lineData[282] = 0;
  _$jscoverage['/control/render.js'].lineData[287] = 0;
  _$jscoverage['/control/render.js'].lineData[288] = 0;
  _$jscoverage['/control/render.js'].lineData[289] = 0;
  _$jscoverage['/control/render.js'].lineData[290] = 0;
  _$jscoverage['/control/render.js'].lineData[291] = 0;
  _$jscoverage['/control/render.js'].lineData[304] = 0;
  _$jscoverage['/control/render.js'].lineData[306] = 0;
  _$jscoverage['/control/render.js'].lineData[307] = 0;
  _$jscoverage['/control/render.js'].lineData[308] = 0;
  _$jscoverage['/control/render.js'].lineData[310] = 0;
  _$jscoverage['/control/render.js'].lineData[314] = 0;
  _$jscoverage['/control/render.js'].lineData[315] = 0;
  _$jscoverage['/control/render.js'].lineData[316] = 0;
  _$jscoverage['/control/render.js'].lineData[318] = 0;
  _$jscoverage['/control/render.js'].lineData[322] = 0;
  _$jscoverage['/control/render.js'].lineData[323] = 0;
  _$jscoverage['/control/render.js'].lineData[324] = 0;
  _$jscoverage['/control/render.js'].lineData[325] = 0;
  _$jscoverage['/control/render.js'].lineData[327] = 0;
  _$jscoverage['/control/render.js'].lineData[330] = 0;
  _$jscoverage['/control/render.js'].lineData[331] = 0;
  _$jscoverage['/control/render.js'].lineData[340] = 0;
  _$jscoverage['/control/render.js'].lineData[341] = 0;
  _$jscoverage['/control/render.js'].lineData[347] = 0;
  _$jscoverage['/control/render.js'].lineData[348] = 0;
  _$jscoverage['/control/render.js'].lineData[350] = 0;
  _$jscoverage['/control/render.js'].lineData[360] = 0;
  _$jscoverage['/control/render.js'].lineData[373] = 0;
  _$jscoverage['/control/render.js'].lineData[377] = 0;
  _$jscoverage['/control/render.js'].lineData[381] = 0;
  _$jscoverage['/control/render.js'].lineData[385] = 0;
  _$jscoverage['/control/render.js'].lineData[386] = 0;
  _$jscoverage['/control/render.js'].lineData[388] = 0;
  _$jscoverage['/control/render.js'].lineData[389] = 0;
  _$jscoverage['/control/render.js'].lineData[394] = 0;
  _$jscoverage['/control/render.js'].lineData[397] = 0;
  _$jscoverage['/control/render.js'].lineData[398] = 0;
  _$jscoverage['/control/render.js'].lineData[400] = 0;
  _$jscoverage['/control/render.js'].lineData[408] = 0;
  _$jscoverage['/control/render.js'].lineData[411] = 0;
  _$jscoverage['/control/render.js'].lineData[418] = 0;
  _$jscoverage['/control/render.js'].lineData[423] = 0;
  _$jscoverage['/control/render.js'].lineData[424] = 0;
  _$jscoverage['/control/render.js'].lineData[426] = 0;
  _$jscoverage['/control/render.js'].lineData[433] = 0;
  _$jscoverage['/control/render.js'].lineData[436] = 0;
  _$jscoverage['/control/render.js'].lineData[442] = 0;
  _$jscoverage['/control/render.js'].lineData[445] = 0;
  _$jscoverage['/control/render.js'].lineData[449] = 0;
  _$jscoverage['/control/render.js'].lineData[467] = 0;
  _$jscoverage['/control/render.js'].lineData[470] = 0;
  _$jscoverage['/control/render.js'].lineData[471] = 0;
  _$jscoverage['/control/render.js'].lineData[472] = 0;
  _$jscoverage['/control/render.js'].lineData[475] = 0;
  _$jscoverage['/control/render.js'].lineData[476] = 0;
  _$jscoverage['/control/render.js'].lineData[478] = 0;
  _$jscoverage['/control/render.js'].lineData[479] = 0;
  _$jscoverage['/control/render.js'].lineData[483] = 0;
  _$jscoverage['/control/render.js'].lineData[485] = 0;
  _$jscoverage['/control/render.js'].lineData[486] = 0;
  _$jscoverage['/control/render.js'].lineData[487] = 0;
  _$jscoverage['/control/render.js'].lineData[494] = 0;
  _$jscoverage['/control/render.js'].lineData[502] = 0;
  _$jscoverage['/control/render.js'].lineData[509] = 0;
  _$jscoverage['/control/render.js'].lineData[510] = 0;
  _$jscoverage['/control/render.js'].lineData[513] = 0;
  _$jscoverage['/control/render.js'].lineData[516] = 0;
}
if (! _$jscoverage['/control/render.js'].functionData) {
  _$jscoverage['/control/render.js'].functionData = [];
  _$jscoverage['/control/render.js'].functionData[0] = 0;
  _$jscoverage['/control/render.js'].functionData[1] = 0;
  _$jscoverage['/control/render.js'].functionData[2] = 0;
  _$jscoverage['/control/render.js'].functionData[3] = 0;
  _$jscoverage['/control/render.js'].functionData[4] = 0;
  _$jscoverage['/control/render.js'].functionData[5] = 0;
  _$jscoverage['/control/render.js'].functionData[6] = 0;
  _$jscoverage['/control/render.js'].functionData[7] = 0;
  _$jscoverage['/control/render.js'].functionData[8] = 0;
  _$jscoverage['/control/render.js'].functionData[9] = 0;
  _$jscoverage['/control/render.js'].functionData[10] = 0;
  _$jscoverage['/control/render.js'].functionData[11] = 0;
  _$jscoverage['/control/render.js'].functionData[12] = 0;
  _$jscoverage['/control/render.js'].functionData[13] = 0;
  _$jscoverage['/control/render.js'].functionData[14] = 0;
  _$jscoverage['/control/render.js'].functionData[15] = 0;
  _$jscoverage['/control/render.js'].functionData[16] = 0;
  _$jscoverage['/control/render.js'].functionData[17] = 0;
  _$jscoverage['/control/render.js'].functionData[18] = 0;
  _$jscoverage['/control/render.js'].functionData[19] = 0;
  _$jscoverage['/control/render.js'].functionData[20] = 0;
  _$jscoverage['/control/render.js'].functionData[21] = 0;
  _$jscoverage['/control/render.js'].functionData[22] = 0;
  _$jscoverage['/control/render.js'].functionData[23] = 0;
  _$jscoverage['/control/render.js'].functionData[24] = 0;
  _$jscoverage['/control/render.js'].functionData[25] = 0;
  _$jscoverage['/control/render.js'].functionData[26] = 0;
  _$jscoverage['/control/render.js'].functionData[27] = 0;
  _$jscoverage['/control/render.js'].functionData[28] = 0;
  _$jscoverage['/control/render.js'].functionData[29] = 0;
  _$jscoverage['/control/render.js'].functionData[30] = 0;
  _$jscoverage['/control/render.js'].functionData[31] = 0;
  _$jscoverage['/control/render.js'].functionData[32] = 0;
  _$jscoverage['/control/render.js'].functionData[33] = 0;
  _$jscoverage['/control/render.js'].functionData[34] = 0;
  _$jscoverage['/control/render.js'].functionData[35] = 0;
  _$jscoverage['/control/render.js'].functionData[36] = 0;
  _$jscoverage['/control/render.js'].functionData[37] = 0;
  _$jscoverage['/control/render.js'].functionData[38] = 0;
  _$jscoverage['/control/render.js'].functionData[39] = 0;
  _$jscoverage['/control/render.js'].functionData[40] = 0;
}
if (! _$jscoverage['/control/render.js'].branchData) {
  _$jscoverage['/control/render.js'].branchData = {};
  _$jscoverage['/control/render.js'].branchData['24'] = [];
  _$jscoverage['/control/render.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['39'] = [];
  _$jscoverage['/control/render.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['42'] = [];
  _$jscoverage['/control/render.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['47'] = [];
  _$jscoverage['/control/render.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['51'] = [];
  _$jscoverage['/control/render.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['58'] = [];
  _$jscoverage['/control/render.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['61'] = [];
  _$jscoverage['/control/render.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['73'] = [];
  _$jscoverage['/control/render.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['85'] = [];
  _$jscoverage['/control/render.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['103'] = [];
  _$jscoverage['/control/render.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['105'] = [];
  _$jscoverage['/control/render.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['124'] = [];
  _$jscoverage['/control/render.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['150'] = [];
  _$jscoverage['/control/render.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['160'] = [];
  _$jscoverage['/control/render.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['163'] = [];
  _$jscoverage['/control/render.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['166'] = [];
  _$jscoverage['/control/render.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['170'] = [];
  _$jscoverage['/control/render.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['178'] = [];
  _$jscoverage['/control/render.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['181'] = [];
  _$jscoverage['/control/render.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['183'] = [];
  _$jscoverage['/control/render.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['212'] = [];
  _$jscoverage['/control/render.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['226'] = [];
  _$jscoverage['/control/render.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['229'] = [];
  _$jscoverage['/control/render.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['231'] = [];
  _$jscoverage['/control/render.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['248'] = [];
  _$jscoverage['/control/render.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['256'] = [];
  _$jscoverage['/control/render.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['272'] = [];
  _$jscoverage['/control/render.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['276'] = [];
  _$jscoverage['/control/render.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['288'] = [];
  _$jscoverage['/control/render.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['289'] = [];
  _$jscoverage['/control/render.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['306'] = [];
  _$jscoverage['/control/render.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['315'] = [];
  _$jscoverage['/control/render.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['322'] = [];
  _$jscoverage['/control/render.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['324'] = [];
  _$jscoverage['/control/render.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['327'] = [];
  _$jscoverage['/control/render.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['347'] = [];
  _$jscoverage['/control/render.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['388'] = [];
  _$jscoverage['/control/render.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['397'] = [];
  _$jscoverage['/control/render.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['424'] = [];
  _$jscoverage['/control/render.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['471'] = [];
  _$jscoverage['/control/render.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['472'] = [];
  _$jscoverage['/control/render.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['476'] = [];
  _$jscoverage['/control/render.js'].branchData['476'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['502'] = [];
  _$jscoverage['/control/render.js'].branchData['502'][1] = new BranchData();
}
_$jscoverage['/control/render.js'].branchData['502'][1].init(28, 26, 'scope.get(\'content\') || \'\'');
function visit55_502_1(result) {
  _$jscoverage['/control/render.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['476'][1].init(25, 3, 'ext');
function visit54_476_1(result) {
  _$jscoverage['/control/render.js'].branchData['476'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['472'][1].init(287, 21, 'S.isArray(extensions)');
function visit53_472_1(result) {
  _$jscoverage['/control/render.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['471'][1].init(242, 27, 'NewClass[HTML_PARSER] || {}');
function visit52_471_1(result) {
  _$jscoverage['/control/render.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['424'][1].init(288, 24, 'control.get(\'focusable\')');
function visit51_424_1(result) {
  _$jscoverage['/control/render.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['397'][1].init(139, 7, 'visible');
function visit50_397_1(result) {
  _$jscoverage['/control/render.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['388'][1].init(138, 31, '!this.get(\'allowTextSelection\')');
function visit49_388_1(result) {
  _$jscoverage['/control/render.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['347'][1].init(330, 5, 'i < l');
function visit48_347_1(result) {
  _$jscoverage['/control/render.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['327'][1].init(161, 80, 'constructor.superclass && constructor.superclass.constructor');
function visit47_327_1(result) {
  _$jscoverage['/control/render.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['324'][1].init(66, 6, 'xclass');
function visit46_324_1(result) {
  _$jscoverage['/control/render.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['322'][1].init(296, 65, 'constructor && !constructor.prototype.hasOwnProperty(\'isControl\')');
function visit45_322_1(result) {
  _$jscoverage['/control/render.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['315'][1].init(46, 24, 'self.componentCssClasses');
function visit44_315_1(result) {
  _$jscoverage['/control/render.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['306'][1].init(86, 3, 'cls');
function visit43_306_1(result) {
  _$jscoverage['/control/render.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['289'][1].init(115, 37, 'renderCommands || self.renderCommands');
function visit42_289_1(result) {
  _$jscoverage['/control/render.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['288'][1].init(55, 29, 'renderData || self.renderData');
function visit41_288_1(result) {
  _$jscoverage['/control/render.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['276'][1].init(80, 30, 'typeof selector === \'function\'');
function visit40_276_1(result) {
  _$jscoverage['/control/render.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['272'][1].init(189, 47, 'childrenElSelectors || self.childrenElSelectors');
function visit39_272_1(result) {
  _$jscoverage['/control/render.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['256'][1].init(17, 8, 'this.$el');
function visit38_256_1(result) {
  _$jscoverage['/control/render.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['248'][1].init(172, 28, 'attrCfg.view && attrChangeFn');
function visit37_248_1(result) {
  _$jscoverage['/control/render.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['231'][1].init(239, 6, 'render');
function visit36_231_1(result) {
  _$jscoverage['/control/render.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['229'][1].init(133, 12, 'renderBefore');
function visit35_229_1(result) {
  _$jscoverage['/control/render.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['226'][1].init(170, 23, '!control.get(\'srcNode\')');
function visit34_226_1(result) {
  _$jscoverage['/control/render.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['212'][1].init(86, 19, '!srcNode.attr(\'id\')');
function visit33_212_1(result) {
  _$jscoverage['/control/render.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['183'][1].init(60, 13, 'UA.ieMode < 9');
function visit32_183_1(result) {
  _$jscoverage['/control/render.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['181'][1].init(1499, 24, 'control.get(\'focusable\')');
function visit31_181_1(result) {
  _$jscoverage['/control/render.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['178'][1].init(1380, 26, 'control.get(\'highlighted\')');
function visit30_178_1(result) {
  _$jscoverage['/control/render.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['170'][1].init(1092, 8, '!visible');
function visit29_170_1(result) {
  _$jscoverage['/control/render.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['166'][1].init(1006, 6, 'zIndex');
function visit28_166_1(result) {
  _$jscoverage['/control/render.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['163'][1].init(915, 6, 'height');
function visit27_163_1(result) {
  _$jscoverage['/control/render.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['160'][1].init(827, 5, 'width');
function visit26_160_1(result) {
  _$jscoverage['/control/render.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['150'][1].init(54, 9, 'attr.view');
function visit25_150_1(result) {
  _$jscoverage['/control/render.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['124'][1].init(102, 7, 'srcNode');
function visit24_124_1(result) {
  _$jscoverage['/control/render.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['105'][1].init(55, 31, 'c && S.startsWith(c, prefixCls)');
function visit23_105_1(result) {
  _$jscoverage['/control/render.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['103'][1].init(106, 5, 'i < l');
function visit22_103_1(result) {
  _$jscoverage['/control/render.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['85'][1].init(85, 25, 'e.target === self.control');
function visit21_85_1(result) {
  _$jscoverage['/control/render.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['73'][1].init(150, 5, 'i < l');
function visit20_73_1(result) {
  _$jscoverage['/control/render.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['61'][1].init(73, 26, 'typeof extras === \'string\'');
function visit19_61_1(result) {
  _$jscoverage['/control/render.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['58'][1].init(13, 7, '!extras');
function visit18_58_1(result) {
  _$jscoverage['/control/render.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['51'][1].init(471, 20, 'S.isArray(v) && v[0]');
function visit17_51_1(result) {
  _$jscoverage['/control/render.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['47'][1].init(333, 21, 'typeof v === \'string\'');
function visit16_47_1(result) {
  _$jscoverage['/control/render.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['42'][1].init(100, 17, 'ret !== undefined');
function visit15_42_1(result) {
  _$jscoverage['/control/render.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['39'][1].init(62, 23, 'typeof v === \'function\'');
function visit14_39_1(result) {
  _$jscoverage['/control/render.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['24'][1].init(13, 21, 'typeof v === \'number\'');
function visit13_24_1(result) {
  _$jscoverage['/control/render.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].lineData[7]++;
KISSY.add(function(S, require) {
  _$jscoverage['/control/render.js'].functionData[0]++;
  _$jscoverage['/control/render.js'].lineData[8]++;
  var Node = require('node');
  _$jscoverage['/control/render.js'].lineData[9]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/control/render.js'].lineData[10]++;
  var ComponentProcess = require('./process');
  _$jscoverage['/control/render.js'].lineData[11]++;
  var RenderTpl = require('./render-xtpl');
  _$jscoverage['/control/render.js'].lineData[12]++;
  var Manager = require('component/manager');
  _$jscoverage['/control/render.js'].lineData[14]++;
  var ON_SET = '_onSet', trim = S.trim, $ = Node.all, UA = S.UA, startTpl = RenderTpl, endTpl = '</div>', doc = S.Env.host.document, HTML_PARSER = 'HTML_PARSER';
  _$jscoverage['/control/render.js'].lineData[23]++;
  function pxSetter(v) {
    _$jscoverage['/control/render.js'].functionData[1]++;
    _$jscoverage['/control/render.js'].lineData[24]++;
    if (visit13_24_1(typeof v === 'number')) {
      _$jscoverage['/control/render.js'].lineData[25]++;
      v += 'px';
    }
    _$jscoverage['/control/render.js'].lineData[27]++;
    return v;
  }
  _$jscoverage['/control/render.js'].lineData[30]++;
  function applyParser(srcNode, parser, control) {
    _$jscoverage['/control/render.js'].functionData[2]++;
    _$jscoverage['/control/render.js'].lineData[31]++;
    var view = this, p, v, ret;
    _$jscoverage['/control/render.js'].lineData[36]++;
    for (p in parser) {
      _$jscoverage['/control/render.js'].lineData[37]++;
      v = parser[p];
      _$jscoverage['/control/render.js'].lineData[39]++;
      if (visit14_39_1(typeof v === 'function')) {
        _$jscoverage['/control/render.js'].lineData[41]++;
        ret = v.call(view, srcNode);
        _$jscoverage['/control/render.js'].lineData[42]++;
        if (visit15_42_1(ret !== undefined)) {
          _$jscoverage['/control/render.js'].lineData[43]++;
          control.setInternal(p, ret);
        }
      } else {
        _$jscoverage['/control/render.js'].lineData[47]++;
        if (visit16_47_1(typeof v === 'string')) {
          _$jscoverage['/control/render.js'].lineData[48]++;
          control.setInternal(p, srcNode.one(v));
        } else {
          _$jscoverage['/control/render.js'].lineData[51]++;
          if (visit17_51_1(S.isArray(v) && v[0])) {
            _$jscoverage['/control/render.js'].lineData[52]++;
            control.setInternal(p, srcNode.all(v[0]));
          }
        }
      }
    }
  }
  _$jscoverage['/control/render.js'].lineData[57]++;
  function normalExtras(extras) {
    _$jscoverage['/control/render.js'].functionData[3]++;
    _$jscoverage['/control/render.js'].lineData[58]++;
    if (visit18_58_1(!extras)) {
      _$jscoverage['/control/render.js'].lineData[59]++;
      extras = [''];
    }
    _$jscoverage['/control/render.js'].lineData[61]++;
    if (visit19_61_1(typeof extras === 'string')) {
      _$jscoverage['/control/render.js'].lineData[62]++;
      extras = extras.split(/\s+/);
    }
    _$jscoverage['/control/render.js'].lineData[64]++;
    return extras;
  }
  _$jscoverage['/control/render.js'].lineData[67]++;
  function prefixExtra(prefixCls, componentCls, extras) {
    _$jscoverage['/control/render.js'].functionData[4]++;
    _$jscoverage['/control/render.js'].lineData[68]++;
    var cls = '', i = 0, l = extras.length, e, prefix = prefixCls + componentCls;
    _$jscoverage['/control/render.js'].lineData[73]++;
    for (; visit20_73_1(i < l); i++) {
      _$jscoverage['/control/render.js'].lineData[74]++;
      e = extras[i];
      _$jscoverage['/control/render.js'].lineData[75]++;
      e = e ? ('-' + e) : e;
      _$jscoverage['/control/render.js'].lineData[76]++;
      cls += ' ' + prefix + e;
    }
    _$jscoverage['/control/render.js'].lineData[78]++;
    return cls;
  }
  _$jscoverage['/control/render.js'].lineData[81]++;
  function onSetAttrChange(e) {
    _$jscoverage['/control/render.js'].functionData[5]++;
    _$jscoverage['/control/render.js'].lineData[82]++;
    var self = this, method;
    _$jscoverage['/control/render.js'].lineData[85]++;
    if (visit21_85_1(e.target === self.control)) {
      _$jscoverage['/control/render.js'].lineData[86]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/control/render.js'].lineData[87]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/control/render.js'].lineData[92]++;
  function getBaseCssClassesCmd() {
    _$jscoverage['/control/render.js'].functionData[6]++;
    _$jscoverage['/control/render.js'].lineData[93]++;
    return this.config.view.getBaseCssClasses(arguments[1].params[0]);
  }
  _$jscoverage['/control/render.js'].lineData[96]++;
  function getBaseCssClassCmd() {
    _$jscoverage['/control/render.js'].functionData[7]++;
    _$jscoverage['/control/render.js'].lineData[97]++;
    return this.config.view.getBaseCssClass(arguments[1].params[0]);
  }
  _$jscoverage['/control/render.js'].lineData[100]++;
  function findComponentCss(css, prefixCls) {
    _$jscoverage['/control/render.js'].functionData[8]++;
    _$jscoverage['/control/render.js'].lineData[101]++;
    var csses = css.split(/\s+/);
    _$jscoverage['/control/render.js'].lineData[102]++;
    var newCss = [];
    _$jscoverage['/control/render.js'].lineData[103]++;
    for (var i = 0, l = csses.length; visit22_103_1(i < l); i++) {
      _$jscoverage['/control/render.js'].lineData[104]++;
      var c = S.trim(csses[i]);
      _$jscoverage['/control/render.js'].lineData[105]++;
      if (visit23_105_1(c && S.startsWith(c, prefixCls))) {
        _$jscoverage['/control/render.js'].lineData[106]++;
        newCss.push(c.substring(prefixCls.length));
      }
    }
    _$jscoverage['/control/render.js'].lineData[109]++;
    return newCss.join(' ');
  }
  _$jscoverage['/control/render.js'].lineData[117]++;
  return ComponentProcess.extend({
  isRender: true, 
  createInternal: function() {
  _$jscoverage['/control/render.js'].functionData[9]++;
  _$jscoverage['/control/render.js'].lineData[121]++;
  var self = this, srcNode = self.control.get('srcNode');
  _$jscoverage['/control/render.js'].lineData[124]++;
  if (visit24_124_1(srcNode)) {
    _$jscoverage['/control/render.js'].lineData[126]++;
    self.decorateDom(srcNode);
  } else {
    _$jscoverage['/control/render.js'].lineData[128]++;
    self.callSuper();
  }
}, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/control/render.js'].functionData[10]++;
  _$jscoverage['/control/render.js'].lineData[133]++;
  var self = this, control = self.control, width, height, visible, elAttrs = control.get('elAttrs'), cls = control.get('elCls'), disabled, attrs = control.getAttrs(), a, attr, elStyle = control.get('elStyle'), zIndex, elCls = control.get('elCls');
  _$jscoverage['/control/render.js'].lineData[148]++;
  for (a in attrs) {
    _$jscoverage['/control/render.js'].lineData[149]++;
    attr = attrs[a];
    _$jscoverage['/control/render.js'].lineData[150]++;
    if (visit25_150_1(attr.view)) {
      _$jscoverage['/control/render.js'].lineData[151]++;
      renderData[a] = control.get(a);
    }
  }
  _$jscoverage['/control/render.js'].lineData[155]++;
  width = renderData.width;
  _$jscoverage['/control/render.js'].lineData[156]++;
  height = renderData.height;
  _$jscoverage['/control/render.js'].lineData[157]++;
  visible = renderData.visible;
  _$jscoverage['/control/render.js'].lineData[158]++;
  zIndex = renderData.zIndex;
  _$jscoverage['/control/render.js'].lineData[160]++;
  if (visit26_160_1(width)) {
    _$jscoverage['/control/render.js'].lineData[161]++;
    elStyle.width = pxSetter(width);
  }
  _$jscoverage['/control/render.js'].lineData[163]++;
  if (visit27_163_1(height)) {
    _$jscoverage['/control/render.js'].lineData[164]++;
    elStyle.height = pxSetter(height);
  }
  _$jscoverage['/control/render.js'].lineData[166]++;
  if (visit28_166_1(zIndex)) {
    _$jscoverage['/control/render.js'].lineData[167]++;
    elStyle['z-index'] = zIndex;
  }
  _$jscoverage['/control/render.js'].lineData[170]++;
  if (visit29_170_1(!visible)) {
    _$jscoverage['/control/render.js'].lineData[171]++;
    elCls.push(self.getBaseCssClasses('hidden'));
  }
  _$jscoverage['/control/render.js'].lineData[174]++;
  if ((disabled = control.get('disabled'))) {
    _$jscoverage['/control/render.js'].lineData[175]++;
    cls.push(self.getBaseCssClasses('disabled'));
    _$jscoverage['/control/render.js'].lineData[176]++;
    elAttrs['aria-disabled'] = 'true';
  }
  _$jscoverage['/control/render.js'].lineData[178]++;
  if (visit30_178_1(control.get('highlighted'))) {
    _$jscoverage['/control/render.js'].lineData[179]++;
    cls.push(self.getBaseCssClasses('hover'));
  }
  _$jscoverage['/control/render.js'].lineData[181]++;
  if (visit31_181_1(control.get('focusable'))) {
    _$jscoverage['/control/render.js'].lineData[183]++;
    if (visit32_183_1(UA.ieMode < 9)) {
      _$jscoverage['/control/render.js'].lineData[184]++;
      elAttrs.hideFocus = 'true';
    }
    _$jscoverage['/control/render.js'].lineData[186]++;
    elAttrs.tabindex = disabled ? '-1' : '0';
  }
}, 
  createDom: function() {
  _$jscoverage['/control/render.js'].functionData[11]++;
  _$jscoverage['/control/render.js'].lineData[191]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[192]++;
  self.beforeCreateDom(self.renderData = {}, self.childrenElSelectors = {}, self.renderCommands = {
  getBaseCssClasses: getBaseCssClassesCmd, 
  getBaseCssClass: getBaseCssClassCmd});
  _$jscoverage['/control/render.js'].lineData[201]++;
  var control = self.control, html;
  _$jscoverage['/control/render.js'].lineData[203]++;
  html = self.renderTpl(startTpl) + self.renderTpl(self.get('contentTpl')) + endTpl;
  _$jscoverage['/control/render.js'].lineData[204]++;
  control.setInternal('el', self.$el = $(html));
  _$jscoverage['/control/render.js'].lineData[205]++;
  self.el = self.$el[0];
  _$jscoverage['/control/render.js'].lineData[206]++;
  self.fillChildrenElsBySelectors();
}, 
  decorateDom: function(srcNode) {
  _$jscoverage['/control/render.js'].functionData[12]++;
  _$jscoverage['/control/render.js'].lineData[210]++;
  var self = this, control = self.control;
  _$jscoverage['/control/render.js'].lineData[212]++;
  if (visit33_212_1(!srcNode.attr('id'))) {
    _$jscoverage['/control/render.js'].lineData[213]++;
    srcNode.attr('id', control.get('id'));
  }
  _$jscoverage['/control/render.js'].lineData[215]++;
  applyParser.call(self, srcNode, self.constructor.HTML_PARSER, control);
  _$jscoverage['/control/render.js'].lineData[216]++;
  control.setInternal('el', self.$el = srcNode);
  _$jscoverage['/control/render.js'].lineData[217]++;
  self.el = srcNode[0];
}, 
  renderUI: function() {
  _$jscoverage['/control/render.js'].functionData[13]++;
  _$jscoverage['/control/render.js'].lineData[221]++;
  var self = this, control = self.control, el = self.$el;
  _$jscoverage['/control/render.js'].lineData[226]++;
  if (visit34_226_1(!control.get('srcNode'))) {
    _$jscoverage['/control/render.js'].lineData[227]++;
    var render = control.get('render'), renderBefore = control.get('elBefore');
    _$jscoverage['/control/render.js'].lineData[229]++;
    if (visit35_229_1(renderBefore)) {
      _$jscoverage['/control/render.js'].lineData[230]++;
      el.insertBefore(renderBefore, undefined);
    } else {
      _$jscoverage['/control/render.js'].lineData[231]++;
      if (visit36_231_1(render)) {
        _$jscoverage['/control/render.js'].lineData[232]++;
        el.appendTo(render, undefined);
      } else {
        _$jscoverage['/control/render.js'].lineData[234]++;
        el.appendTo(doc.body, undefined);
      }
    }
  }
}, 
  bindUI: function() {
  _$jscoverage['/control/render.js'].functionData[14]++;
  _$jscoverage['/control/render.js'].lineData[240]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[241]++;
  var control = self.control;
  _$jscoverage['/control/render.js'].lineData[242]++;
  var attrs = control.getAttrs();
  _$jscoverage['/control/render.js'].lineData[243]++;
  var attrName, attrCfg;
  _$jscoverage['/control/render.js'].lineData[244]++;
  for (attrName in attrs) {
    _$jscoverage['/control/render.js'].lineData[245]++;
    attrCfg = attrs[attrName];
    _$jscoverage['/control/render.js'].lineData[246]++;
    var ucName = S.ucfirst(attrName);
    _$jscoverage['/control/render.js'].lineData[247]++;
    var attrChangeFn = self[ON_SET + ucName];
    _$jscoverage['/control/render.js'].lineData[248]++;
    if (visit37_248_1(attrCfg.view && attrChangeFn)) {
      _$jscoverage['/control/render.js'].lineData[250]++;
      control.on('after' + ucName + 'Change', onSetAttrChange, self);
    }
  }
}, 
  destructor: function() {
  _$jscoverage['/control/render.js'].functionData[15]++;
  _$jscoverage['/control/render.js'].lineData[256]++;
  if (visit38_256_1(this.$el)) {
    _$jscoverage['/control/render.js'].lineData[257]++;
    this.$el.remove();
  }
}, 
  $: function(selector) {
  _$jscoverage['/control/render.js'].functionData[16]++;
  _$jscoverage['/control/render.js'].lineData[262]++;
  return this.$el.all(selector);
}, 
  fillChildrenElsBySelectors: function(childrenElSelectors) {
  _$jscoverage['/control/render.js'].functionData[17]++;
  _$jscoverage['/control/render.js'].lineData[266]++;
  var self = this, el = self.$el, control = self.control, childName, selector;
  _$jscoverage['/control/render.js'].lineData[272]++;
  childrenElSelectors = visit39_272_1(childrenElSelectors || self.childrenElSelectors);
  _$jscoverage['/control/render.js'].lineData[274]++;
  for (childName in childrenElSelectors) {
    _$jscoverage['/control/render.js'].lineData[275]++;
    selector = childrenElSelectors[childName];
    _$jscoverage['/control/render.js'].lineData[276]++;
    if (visit40_276_1(typeof selector === 'function')) {
      _$jscoverage['/control/render.js'].lineData[277]++;
      control.setInternal(childName, selector(el));
    } else {
      _$jscoverage['/control/render.js'].lineData[279]++;
      control.setInternal(childName, self.$(S.substitute(selector, self.renderData)));
    }
    _$jscoverage['/control/render.js'].lineData[282]++;
    delete childrenElSelectors[childName];
  }
}, 
  renderTpl: function(tpl, renderData, renderCommands) {
  _$jscoverage['/control/render.js'].functionData[18]++;
  _$jscoverage['/control/render.js'].lineData[287]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[288]++;
  renderData = visit41_288_1(renderData || self.renderData);
  _$jscoverage['/control/render.js'].lineData[289]++;
  renderCommands = visit42_289_1(renderCommands || self.renderCommands);
  _$jscoverage['/control/render.js'].lineData[290]++;
  var XTemplate = self.get('xtemplate');
  _$jscoverage['/control/render.js'].lineData[291]++;
  return new XTemplate(tpl, {
  control: self.control, 
  view: self, 
  commands: renderCommands}).render(renderData);
}, 
  getComponentConstructorByNode: function(prefixCls, childNode) {
  _$jscoverage['/control/render.js'].functionData[19]++;
  _$jscoverage['/control/render.js'].lineData[304]++;
  var cls = childNode[0].className;
  _$jscoverage['/control/render.js'].lineData[306]++;
  if (visit43_306_1(cls)) {
    _$jscoverage['/control/render.js'].lineData[307]++;
    var componentCss = findComponentCss(cls, prefixCls);
    _$jscoverage['/control/render.js'].lineData[308]++;
    return Manager.getConstructorByXClass(componentCss);
  }
  _$jscoverage['/control/render.js'].lineData[310]++;
  return null;
}, 
  getComponentCssClasses: function() {
  _$jscoverage['/control/render.js'].functionData[20]++;
  _$jscoverage['/control/render.js'].lineData[314]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[315]++;
  if (visit44_315_1(self.componentCssClasses)) {
    _$jscoverage['/control/render.js'].lineData[316]++;
    return self.componentCssClasses;
  }
  _$jscoverage['/control/render.js'].lineData[318]++;
  var control = self.control, constructor = control.constructor, xclass, re = [];
  _$jscoverage['/control/render.js'].lineData[322]++;
  while (visit45_322_1(constructor && !constructor.prototype.hasOwnProperty('isControl'))) {
    _$jscoverage['/control/render.js'].lineData[323]++;
    xclass = constructor.xclass;
    _$jscoverage['/control/render.js'].lineData[324]++;
    if (visit46_324_1(xclass)) {
      _$jscoverage['/control/render.js'].lineData[325]++;
      re.push(xclass);
    }
    _$jscoverage['/control/render.js'].lineData[327]++;
    constructor = visit47_327_1(constructor.superclass && constructor.superclass.constructor);
  }
  _$jscoverage['/control/render.js'].lineData[330]++;
  self.componentCssClasses = re;
  _$jscoverage['/control/render.js'].lineData[331]++;
  return re;
}, 
  getBaseCssClasses: function(extras) {
  _$jscoverage['/control/render.js'].functionData[21]++;
  _$jscoverage['/control/render.js'].lineData[340]++;
  extras = normalExtras(extras);
  _$jscoverage['/control/render.js'].lineData[341]++;
  var componentCssClasses = this.getComponentCssClasses(), i = 0, control = this.get('control'), cls = '', l = componentCssClasses.length, prefixCls = control.get('prefixCls');
  _$jscoverage['/control/render.js'].lineData[347]++;
  for (; visit48_347_1(i < l); i++) {
    _$jscoverage['/control/render.js'].lineData[348]++;
    cls += prefixExtra(prefixCls, componentCssClasses[i], extras);
  }
  _$jscoverage['/control/render.js'].lineData[350]++;
  return trim(cls);
}, 
  getBaseCssClass: function(extras) {
  _$jscoverage['/control/render.js'].functionData[22]++;
  _$jscoverage['/control/render.js'].lineData[360]++;
  return trim(prefixExtra(this.control.get('prefixCls'), this.getComponentCssClasses()[0], normalExtras(extras)));
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/control/render.js'].functionData[23]++;
  _$jscoverage['/control/render.js'].lineData[373]++;
  return this.$el;
}, 
  '_onSetWidth': function(w) {
  _$jscoverage['/control/render.js'].functionData[24]++;
  _$jscoverage['/control/render.js'].lineData[377]++;
  this.$el.width(w);
}, 
  _onSetHeight: function(h) {
  _$jscoverage['/control/render.js'].functionData[25]++;
  _$jscoverage['/control/render.js'].lineData[381]++;
  this.$el.height(h);
}, 
  '_onSetContent': function(c) {
  _$jscoverage['/control/render.js'].functionData[26]++;
  _$jscoverage['/control/render.js'].lineData[385]++;
  var el = this.$el;
  _$jscoverage['/control/render.js'].lineData[386]++;
  el.html(c);
  _$jscoverage['/control/render.js'].lineData[388]++;
  if (visit49_388_1(!this.get('allowTextSelection'))) {
    _$jscoverage['/control/render.js'].lineData[389]++;
    el.unselectable();
  }
}, 
  _onSetVisible: function(visible) {
  _$jscoverage['/control/render.js'].functionData[27]++;
  _$jscoverage['/control/render.js'].lineData[394]++;
  var self = this, el = self.$el, hiddenCls = self.getBaseCssClasses('hidden');
  _$jscoverage['/control/render.js'].lineData[397]++;
  if (visit50_397_1(visible)) {
    _$jscoverage['/control/render.js'].lineData[398]++;
    el.removeClass(hiddenCls);
  } else {
    _$jscoverage['/control/render.js'].lineData[400]++;
    el.addClass(hiddenCls);
  }
}, 
  _onSetHighlighted: function(v) {
  _$jscoverage['/control/render.js'].functionData[28]++;
  _$jscoverage['/control/render.js'].lineData[408]++;
  var self = this, componentCls = self.getBaseCssClasses('hover'), el = self.$el;
  _$jscoverage['/control/render.js'].lineData[411]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/control/render.js'].functionData[29]++;
  _$jscoverage['/control/render.js'].lineData[418]++;
  var self = this, control = self.control, componentCls = self.getBaseCssClasses('disabled'), el = self.$el;
  _$jscoverage['/control/render.js'].lineData[423]++;
  el[v ? 'addClass' : 'removeClass'](componentCls).attr('aria-disabled', v);
  _$jscoverage['/control/render.js'].lineData[424]++;
  if (visit51_424_1(control.get('focusable'))) {
    _$jscoverage['/control/render.js'].lineData[426]++;
    self.getKeyEventTarget().attr('tabindex', v ? -1 : 0);
  }
}, 
  '_onSetActive': function(v) {
  _$jscoverage['/control/render.js'].functionData[30]++;
  _$jscoverage['/control/render.js'].lineData[433]++;
  var self = this, componentCls = self.getBaseCssClasses('active');
  _$jscoverage['/control/render.js'].lineData[436]++;
  self.$el[v ? 'addClass' : 'removeClass'](componentCls).attr('aria-pressed', !!v);
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/control/render.js'].functionData[31]++;
  _$jscoverage['/control/render.js'].lineData[442]++;
  var self = this, el = self.$el, componentCls = self.getBaseCssClasses('focused');
  _$jscoverage['/control/render.js'].lineData[445]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  '_onSetZIndex': function(x) {
  _$jscoverage['/control/render.js'].functionData[32]++;
  _$jscoverage['/control/render.js'].lineData[449]++;
  this.$el.css('z-index', x);
}}, {
  __hooks__: {
  decorateDom: ComponentProcess.prototype.__getHook('__decorateDom'), 
  beforeCreateDom: ComponentProcess.prototype.__getHook('__beforeCreateDom')}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/control/render.js'].functionData[33]++;
  _$jscoverage['/control/render.js'].lineData[467]++;
  var SuperClass = this, NewClass, parsers = {};
  _$jscoverage['/control/render.js'].lineData[470]++;
  NewClass = ComponentProcess.extend.apply(SuperClass, arguments);
  _$jscoverage['/control/render.js'].lineData[471]++;
  NewClass[HTML_PARSER] = visit52_471_1(NewClass[HTML_PARSER] || {});
  _$jscoverage['/control/render.js'].lineData[472]++;
  if (visit53_472_1(S.isArray(extensions))) {
    _$jscoverage['/control/render.js'].lineData[475]++;
    S.each(extensions.concat(NewClass), function(ext) {
  _$jscoverage['/control/render.js'].functionData[34]++;
  _$jscoverage['/control/render.js'].lineData[476]++;
  if (visit54_476_1(ext)) {
    _$jscoverage['/control/render.js'].lineData[478]++;
    S.each(ext.HTML_PARSER, function(v, name) {
  _$jscoverage['/control/render.js'].functionData[35]++;
  _$jscoverage['/control/render.js'].lineData[479]++;
  parsers[name] = v;
});
  }
});
    _$jscoverage['/control/render.js'].lineData[483]++;
    NewClass[HTML_PARSER] = parsers;
  }
  _$jscoverage['/control/render.js'].lineData[485]++;
  S.mix(NewClass[HTML_PARSER], SuperClass[HTML_PARSER], false);
  _$jscoverage['/control/render.js'].lineData[486]++;
  NewClass.extend = extend;
  _$jscoverage['/control/render.js'].lineData[487]++;
  return NewClass;
}, 
  ATTRS: {
  control: {
  setter: function(v) {
  _$jscoverage['/control/render.js'].functionData[36]++;
  _$jscoverage['/control/render.js'].lineData[494]++;
  this.control = v;
}}, 
  xtemplate: {
  value: XTemplateRuntime}, 
  contentTpl: {
  value: function(scope) {
  _$jscoverage['/control/render.js'].functionData[37]++;
  _$jscoverage['/control/render.js'].lineData[502]++;
  return visit55_502_1(scope.get('content') || '');
}}}, 
  HTML_PARSER: {
  id: function(el) {
  _$jscoverage['/control/render.js'].functionData[38]++;
  _$jscoverage['/control/render.js'].lineData[509]++;
  var id = el[0].id;
  _$jscoverage['/control/render.js'].lineData[510]++;
  return id ? id : undefined;
}, 
  content: function(el) {
  _$jscoverage['/control/render.js'].functionData[39]++;
  _$jscoverage['/control/render.js'].lineData[513]++;
  return el.html();
}, 
  disabled: function(el) {
  _$jscoverage['/control/render.js'].functionData[40]++;
  _$jscoverage['/control/render.js'].lineData[516]++;
  return el.hasClass(this.getBaseCssClass('disabled'));
}}, 
  name: 'render'});
});
