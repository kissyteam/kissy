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
  _$jscoverage['/control/render.js'].lineData[105] = 0;
  _$jscoverage['/control/render.js'].lineData[109] = 0;
  _$jscoverage['/control/render.js'].lineData[112] = 0;
  _$jscoverage['/control/render.js'].lineData[114] = 0;
  _$jscoverage['/control/render.js'].lineData[116] = 0;
  _$jscoverage['/control/render.js'].lineData[121] = 0;
  _$jscoverage['/control/render.js'].lineData[136] = 0;
  _$jscoverage['/control/render.js'].lineData[137] = 0;
  _$jscoverage['/control/render.js'].lineData[138] = 0;
  _$jscoverage['/control/render.js'].lineData[139] = 0;
  _$jscoverage['/control/render.js'].lineData[143] = 0;
  _$jscoverage['/control/render.js'].lineData[144] = 0;
  _$jscoverage['/control/render.js'].lineData[145] = 0;
  _$jscoverage['/control/render.js'].lineData[146] = 0;
  _$jscoverage['/control/render.js'].lineData[148] = 0;
  _$jscoverage['/control/render.js'].lineData[149] = 0;
  _$jscoverage['/control/render.js'].lineData[151] = 0;
  _$jscoverage['/control/render.js'].lineData[152] = 0;
  _$jscoverage['/control/render.js'].lineData[154] = 0;
  _$jscoverage['/control/render.js'].lineData[155] = 0;
  _$jscoverage['/control/render.js'].lineData[158] = 0;
  _$jscoverage['/control/render.js'].lineData[159] = 0;
  _$jscoverage['/control/render.js'].lineData[162] = 0;
  _$jscoverage['/control/render.js'].lineData[163] = 0;
  _$jscoverage['/control/render.js'].lineData[164] = 0;
  _$jscoverage['/control/render.js'].lineData[166] = 0;
  _$jscoverage['/control/render.js'].lineData[167] = 0;
  _$jscoverage['/control/render.js'].lineData[169] = 0;
  _$jscoverage['/control/render.js'].lineData[171] = 0;
  _$jscoverage['/control/render.js'].lineData[172] = 0;
  _$jscoverage['/control/render.js'].lineData[174] = 0;
  _$jscoverage['/control/render.js'].lineData[179] = 0;
  _$jscoverage['/control/render.js'].lineData[180] = 0;
  _$jscoverage['/control/render.js'].lineData[189] = 0;
  _$jscoverage['/control/render.js'].lineData[191] = 0;
  _$jscoverage['/control/render.js'].lineData[192] = 0;
  _$jscoverage['/control/render.js'].lineData[193] = 0;
  _$jscoverage['/control/render.js'].lineData[194] = 0;
  _$jscoverage['/control/render.js'].lineData[198] = 0;
  _$jscoverage['/control/render.js'].lineData[200] = 0;
  _$jscoverage['/control/render.js'].lineData[201] = 0;
  _$jscoverage['/control/render.js'].lineData[203] = 0;
  _$jscoverage['/control/render.js'].lineData[204] = 0;
  _$jscoverage['/control/render.js'].lineData[205] = 0;
  _$jscoverage['/control/render.js'].lineData[209] = 0;
  _$jscoverage['/control/render.js'].lineData[214] = 0;
  _$jscoverage['/control/render.js'].lineData[215] = 0;
  _$jscoverage['/control/render.js'].lineData[217] = 0;
  _$jscoverage['/control/render.js'].lineData[218] = 0;
  _$jscoverage['/control/render.js'].lineData[219] = 0;
  _$jscoverage['/control/render.js'].lineData[220] = 0;
  _$jscoverage['/control/render.js'].lineData[222] = 0;
  _$jscoverage['/control/render.js'].lineData[228] = 0;
  _$jscoverage['/control/render.js'].lineData[229] = 0;
  _$jscoverage['/control/render.js'].lineData[230] = 0;
  _$jscoverage['/control/render.js'].lineData[231] = 0;
  _$jscoverage['/control/render.js'].lineData[232] = 0;
  _$jscoverage['/control/render.js'].lineData[233] = 0;
  _$jscoverage['/control/render.js'].lineData[234] = 0;
  _$jscoverage['/control/render.js'].lineData[235] = 0;
  _$jscoverage['/control/render.js'].lineData[236] = 0;
  _$jscoverage['/control/render.js'].lineData[238] = 0;
  _$jscoverage['/control/render.js'].lineData[244] = 0;
  _$jscoverage['/control/render.js'].lineData[245] = 0;
  _$jscoverage['/control/render.js'].lineData[250] = 0;
  _$jscoverage['/control/render.js'].lineData[254] = 0;
  _$jscoverage['/control/render.js'].lineData[260] = 0;
  _$jscoverage['/control/render.js'].lineData[262] = 0;
  _$jscoverage['/control/render.js'].lineData[263] = 0;
  _$jscoverage['/control/render.js'].lineData[264] = 0;
  _$jscoverage['/control/render.js'].lineData[265] = 0;
  _$jscoverage['/control/render.js'].lineData[267] = 0;
  _$jscoverage['/control/render.js'].lineData[270] = 0;
  _$jscoverage['/control/render.js'].lineData[275] = 0;
  _$jscoverage['/control/render.js'].lineData[276] = 0;
  _$jscoverage['/control/render.js'].lineData[277] = 0;
  _$jscoverage['/control/render.js'].lineData[278] = 0;
  _$jscoverage['/control/render.js'].lineData[279] = 0;
  _$jscoverage['/control/render.js'].lineData[292] = 0;
  _$jscoverage['/control/render.js'].lineData[294] = 0;
  _$jscoverage['/control/render.js'].lineData[295] = 0;
  _$jscoverage['/control/render.js'].lineData[296] = 0;
  _$jscoverage['/control/render.js'].lineData[298] = 0;
  _$jscoverage['/control/render.js'].lineData[302] = 0;
  _$jscoverage['/control/render.js'].lineData[303] = 0;
  _$jscoverage['/control/render.js'].lineData[304] = 0;
  _$jscoverage['/control/render.js'].lineData[306] = 0;
  _$jscoverage['/control/render.js'].lineData[310] = 0;
  _$jscoverage['/control/render.js'].lineData[311] = 0;
  _$jscoverage['/control/render.js'].lineData[312] = 0;
  _$jscoverage['/control/render.js'].lineData[313] = 0;
  _$jscoverage['/control/render.js'].lineData[315] = 0;
  _$jscoverage['/control/render.js'].lineData[318] = 0;
  _$jscoverage['/control/render.js'].lineData[319] = 0;
  _$jscoverage['/control/render.js'].lineData[328] = 0;
  _$jscoverage['/control/render.js'].lineData[329] = 0;
  _$jscoverage['/control/render.js'].lineData[335] = 0;
  _$jscoverage['/control/render.js'].lineData[336] = 0;
  _$jscoverage['/control/render.js'].lineData[338] = 0;
  _$jscoverage['/control/render.js'].lineData[348] = 0;
  _$jscoverage['/control/render.js'].lineData[361] = 0;
  _$jscoverage['/control/render.js'].lineData[365] = 0;
  _$jscoverage['/control/render.js'].lineData[369] = 0;
  _$jscoverage['/control/render.js'].lineData[373] = 0;
  _$jscoverage['/control/render.js'].lineData[374] = 0;
  _$jscoverage['/control/render.js'].lineData[376] = 0;
  _$jscoverage['/control/render.js'].lineData[377] = 0;
  _$jscoverage['/control/render.js'].lineData[382] = 0;
  _$jscoverage['/control/render.js'].lineData[385] = 0;
  _$jscoverage['/control/render.js'].lineData[386] = 0;
  _$jscoverage['/control/render.js'].lineData[388] = 0;
  _$jscoverage['/control/render.js'].lineData[396] = 0;
  _$jscoverage['/control/render.js'].lineData[399] = 0;
  _$jscoverage['/control/render.js'].lineData[406] = 0;
  _$jscoverage['/control/render.js'].lineData[411] = 0;
  _$jscoverage['/control/render.js'].lineData[412] = 0;
  _$jscoverage['/control/render.js'].lineData[414] = 0;
  _$jscoverage['/control/render.js'].lineData[421] = 0;
  _$jscoverage['/control/render.js'].lineData[424] = 0;
  _$jscoverage['/control/render.js'].lineData[430] = 0;
  _$jscoverage['/control/render.js'].lineData[433] = 0;
  _$jscoverage['/control/render.js'].lineData[437] = 0;
  _$jscoverage['/control/render.js'].lineData[455] = 0;
  _$jscoverage['/control/render.js'].lineData[458] = 0;
  _$jscoverage['/control/render.js'].lineData[459] = 0;
  _$jscoverage['/control/render.js'].lineData[460] = 0;
  _$jscoverage['/control/render.js'].lineData[463] = 0;
  _$jscoverage['/control/render.js'].lineData[464] = 0;
  _$jscoverage['/control/render.js'].lineData[466] = 0;
  _$jscoverage['/control/render.js'].lineData[467] = 0;
  _$jscoverage['/control/render.js'].lineData[471] = 0;
  _$jscoverage['/control/render.js'].lineData[473] = 0;
  _$jscoverage['/control/render.js'].lineData[474] = 0;
  _$jscoverage['/control/render.js'].lineData[475] = 0;
  _$jscoverage['/control/render.js'].lineData[482] = 0;
  _$jscoverage['/control/render.js'].lineData[490] = 0;
  _$jscoverage['/control/render.js'].lineData[497] = 0;
  _$jscoverage['/control/render.js'].lineData[498] = 0;
  _$jscoverage['/control/render.js'].lineData[501] = 0;
  _$jscoverage['/control/render.js'].lineData[504] = 0;
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
  _$jscoverage['/control/render.js'].branchData['112'] = [];
  _$jscoverage['/control/render.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['138'] = [];
  _$jscoverage['/control/render.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['148'] = [];
  _$jscoverage['/control/render.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['151'] = [];
  _$jscoverage['/control/render.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['154'] = [];
  _$jscoverage['/control/render.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['158'] = [];
  _$jscoverage['/control/render.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['166'] = [];
  _$jscoverage['/control/render.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['169'] = [];
  _$jscoverage['/control/render.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['171'] = [];
  _$jscoverage['/control/render.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['200'] = [];
  _$jscoverage['/control/render.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['214'] = [];
  _$jscoverage['/control/render.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['217'] = [];
  _$jscoverage['/control/render.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['219'] = [];
  _$jscoverage['/control/render.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['236'] = [];
  _$jscoverage['/control/render.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['244'] = [];
  _$jscoverage['/control/render.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['260'] = [];
  _$jscoverage['/control/render.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['264'] = [];
  _$jscoverage['/control/render.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['276'] = [];
  _$jscoverage['/control/render.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['277'] = [];
  _$jscoverage['/control/render.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['294'] = [];
  _$jscoverage['/control/render.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['303'] = [];
  _$jscoverage['/control/render.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['310'] = [];
  _$jscoverage['/control/render.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['312'] = [];
  _$jscoverage['/control/render.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['315'] = [];
  _$jscoverage['/control/render.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['335'] = [];
  _$jscoverage['/control/render.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['376'] = [];
  _$jscoverage['/control/render.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['385'] = [];
  _$jscoverage['/control/render.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['412'] = [];
  _$jscoverage['/control/render.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['459'] = [];
  _$jscoverage['/control/render.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['460'] = [];
  _$jscoverage['/control/render.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['464'] = [];
  _$jscoverage['/control/render.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['490'] = [];
  _$jscoverage['/control/render.js'].branchData['490'][1] = new BranchData();
}
_$jscoverage['/control/render.js'].branchData['490'][1].init(28, 26, 'scope.get(\'content\') || \'\'');
function visit53_490_1(result) {
  _$jscoverage['/control/render.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['464'][1].init(25, 3, 'ext');
function visit52_464_1(result) {
  _$jscoverage['/control/render.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['460'][1].init(287, 21, 'S.isArray(extensions)');
function visit51_460_1(result) {
  _$jscoverage['/control/render.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['459'][1].init(242, 27, 'NewClass[HTML_PARSER] || {}');
function visit50_459_1(result) {
  _$jscoverage['/control/render.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['412'][1].init(288, 24, 'control.get(\'focusable\')');
function visit49_412_1(result) {
  _$jscoverage['/control/render.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['385'][1].init(139, 7, 'visible');
function visit48_385_1(result) {
  _$jscoverage['/control/render.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['376'][1].init(138, 31, '!this.get(\'allowTextSelection\')');
function visit47_376_1(result) {
  _$jscoverage['/control/render.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['335'][1].init(330, 5, 'i < l');
function visit46_335_1(result) {
  _$jscoverage['/control/render.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['315'][1].init(161, 80, 'constructor.superclass && constructor.superclass.constructor');
function visit45_315_1(result) {
  _$jscoverage['/control/render.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['312'][1].init(66, 6, 'xclass');
function visit44_312_1(result) {
  _$jscoverage['/control/render.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['310'][1].init(296, 65, 'constructor && !constructor.prototype.hasOwnProperty(\'isControl\')');
function visit43_310_1(result) {
  _$jscoverage['/control/render.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['303'][1].init(46, 24, 'self.componentCssClasses');
function visit42_303_1(result) {
  _$jscoverage['/control/render.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['294'][1].init(86, 3, 'cls');
function visit41_294_1(result) {
  _$jscoverage['/control/render.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['277'][1].init(115, 37, 'renderCommands || self.renderCommands');
function visit40_277_1(result) {
  _$jscoverage['/control/render.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['276'][1].init(55, 29, 'renderData || self.renderData');
function visit39_276_1(result) {
  _$jscoverage['/control/render.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['264'][1].init(80, 30, 'typeof selector === \'function\'');
function visit38_264_1(result) {
  _$jscoverage['/control/render.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['260'][1].init(189, 47, 'childrenElSelectors || self.childrenElSelectors');
function visit37_260_1(result) {
  _$jscoverage['/control/render.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['244'][1].init(17, 8, 'this.$el');
function visit36_244_1(result) {
  _$jscoverage['/control/render.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['236'][1].init(172, 28, 'attrCfg.view && attrChangeFn');
function visit35_236_1(result) {
  _$jscoverage['/control/render.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['219'][1].init(239, 6, 'render');
function visit34_219_1(result) {
  _$jscoverage['/control/render.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['217'][1].init(133, 12, 'renderBefore');
function visit33_217_1(result) {
  _$jscoverage['/control/render.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['214'][1].init(170, 23, '!control.get(\'srcNode\')');
function visit32_214_1(result) {
  _$jscoverage['/control/render.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['200'][1].init(86, 19, '!srcNode.attr(\'id\')');
function visit31_200_1(result) {
  _$jscoverage['/control/render.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['171'][1].init(60, 13, 'UA.ieMode < 9');
function visit30_171_1(result) {
  _$jscoverage['/control/render.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['169'][1].init(1499, 24, 'control.get(\'focusable\')');
function visit29_169_1(result) {
  _$jscoverage['/control/render.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['166'][1].init(1380, 26, 'control.get(\'highlighted\')');
function visit28_166_1(result) {
  _$jscoverage['/control/render.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['158'][1].init(1092, 8, '!visible');
function visit27_158_1(result) {
  _$jscoverage['/control/render.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['154'][1].init(1006, 6, 'zIndex');
function visit26_154_1(result) {
  _$jscoverage['/control/render.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['151'][1].init(915, 6, 'height');
function visit25_151_1(result) {
  _$jscoverage['/control/render.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['148'][1].init(827, 5, 'width');
function visit24_148_1(result) {
  _$jscoverage['/control/render.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['138'][1].init(54, 9, 'attr.view');
function visit23_138_1(result) {
  _$jscoverage['/control/render.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['112'][1].init(102, 7, 'srcNode');
function visit22_112_1(result) {
  _$jscoverage['/control/render.js'].branchData['112'][1].ranCondition(result);
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
  _$jscoverage['/control/render.js'].lineData[105]++;
  return ComponentProcess.extend({
  isRender: true, 
  createInternal: function() {
  _$jscoverage['/control/render.js'].functionData[8]++;
  _$jscoverage['/control/render.js'].lineData[109]++;
  var self = this, srcNode = self.control.get('srcNode');
  _$jscoverage['/control/render.js'].lineData[112]++;
  if (visit22_112_1(srcNode)) {
    _$jscoverage['/control/render.js'].lineData[114]++;
    self.decorateDom(srcNode);
  } else {
    _$jscoverage['/control/render.js'].lineData[116]++;
    self.callSuper();
  }
}, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/control/render.js'].functionData[9]++;
  _$jscoverage['/control/render.js'].lineData[121]++;
  var self = this, control = self.control, width, height, visible, elAttrs = control.get('elAttrs'), cls = control.get('elCls'), disabled, attrs = control.getAttrs(), a, attr, elStyle = control.get('elStyle'), zIndex, elCls = control.get('elCls');
  _$jscoverage['/control/render.js'].lineData[136]++;
  for (a in attrs) {
    _$jscoverage['/control/render.js'].lineData[137]++;
    attr = attrs[a];
    _$jscoverage['/control/render.js'].lineData[138]++;
    if (visit23_138_1(attr.view)) {
      _$jscoverage['/control/render.js'].lineData[139]++;
      renderData[a] = control.get(a);
    }
  }
  _$jscoverage['/control/render.js'].lineData[143]++;
  width = renderData.width;
  _$jscoverage['/control/render.js'].lineData[144]++;
  height = renderData.height;
  _$jscoverage['/control/render.js'].lineData[145]++;
  visible = renderData.visible;
  _$jscoverage['/control/render.js'].lineData[146]++;
  zIndex = renderData.zIndex;
  _$jscoverage['/control/render.js'].lineData[148]++;
  if (visit24_148_1(width)) {
    _$jscoverage['/control/render.js'].lineData[149]++;
    elStyle.width = pxSetter(width);
  }
  _$jscoverage['/control/render.js'].lineData[151]++;
  if (visit25_151_1(height)) {
    _$jscoverage['/control/render.js'].lineData[152]++;
    elStyle.height = pxSetter(height);
  }
  _$jscoverage['/control/render.js'].lineData[154]++;
  if (visit26_154_1(zIndex)) {
    _$jscoverage['/control/render.js'].lineData[155]++;
    elStyle['z-index'] = zIndex;
  }
  _$jscoverage['/control/render.js'].lineData[158]++;
  if (visit27_158_1(!visible)) {
    _$jscoverage['/control/render.js'].lineData[159]++;
    elCls.push(self.getBaseCssClasses('hidden'));
  }
  _$jscoverage['/control/render.js'].lineData[162]++;
  if ((disabled = control.get('disabled'))) {
    _$jscoverage['/control/render.js'].lineData[163]++;
    cls.push(self.getBaseCssClasses('disabled'));
    _$jscoverage['/control/render.js'].lineData[164]++;
    elAttrs['aria-disabled'] = 'true';
  }
  _$jscoverage['/control/render.js'].lineData[166]++;
  if (visit28_166_1(control.get('highlighted'))) {
    _$jscoverage['/control/render.js'].lineData[167]++;
    cls.push(self.getBaseCssClasses('hover'));
  }
  _$jscoverage['/control/render.js'].lineData[169]++;
  if (visit29_169_1(control.get('focusable'))) {
    _$jscoverage['/control/render.js'].lineData[171]++;
    if (visit30_171_1(UA.ieMode < 9)) {
      _$jscoverage['/control/render.js'].lineData[172]++;
      elAttrs.hideFocus = 'true';
    }
    _$jscoverage['/control/render.js'].lineData[174]++;
    elAttrs.tabindex = disabled ? '-1' : '0';
  }
}, 
  createDom: function() {
  _$jscoverage['/control/render.js'].functionData[10]++;
  _$jscoverage['/control/render.js'].lineData[179]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[180]++;
  self.beforeCreateDom(self.renderData = {}, self.childrenElSelectors = {}, self.renderCommands = {
  getBaseCssClasses: getBaseCssClassesCmd, 
  getBaseCssClass: getBaseCssClassCmd});
  _$jscoverage['/control/render.js'].lineData[189]++;
  var control = self.control, html;
  _$jscoverage['/control/render.js'].lineData[191]++;
  html = self.renderTpl(startTpl) + self.renderTpl(self.get('contentTpl')) + endTpl;
  _$jscoverage['/control/render.js'].lineData[192]++;
  control.setInternal('el', self.$el = $(html));
  _$jscoverage['/control/render.js'].lineData[193]++;
  self.el = self.$el[0];
  _$jscoverage['/control/render.js'].lineData[194]++;
  self.fillChildrenElsBySelectors();
}, 
  decorateDom: function(srcNode) {
  _$jscoverage['/control/render.js'].functionData[11]++;
  _$jscoverage['/control/render.js'].lineData[198]++;
  var self = this, control = self.control;
  _$jscoverage['/control/render.js'].lineData[200]++;
  if (visit31_200_1(!srcNode.attr('id'))) {
    _$jscoverage['/control/render.js'].lineData[201]++;
    srcNode.attr('id', control.get('id'));
  }
  _$jscoverage['/control/render.js'].lineData[203]++;
  applyParser.call(self, srcNode, self.constructor.HTML_PARSER, control);
  _$jscoverage['/control/render.js'].lineData[204]++;
  control.setInternal('el', self.$el = srcNode);
  _$jscoverage['/control/render.js'].lineData[205]++;
  self.el = srcNode[0];
}, 
  renderUI: function() {
  _$jscoverage['/control/render.js'].functionData[12]++;
  _$jscoverage['/control/render.js'].lineData[209]++;
  var self = this, control = self.control, el = self.$el;
  _$jscoverage['/control/render.js'].lineData[214]++;
  if (visit32_214_1(!control.get('srcNode'))) {
    _$jscoverage['/control/render.js'].lineData[215]++;
    var render = control.get('render'), renderBefore = control.get('elBefore');
    _$jscoverage['/control/render.js'].lineData[217]++;
    if (visit33_217_1(renderBefore)) {
      _$jscoverage['/control/render.js'].lineData[218]++;
      el.insertBefore(renderBefore, undefined);
    } else {
      _$jscoverage['/control/render.js'].lineData[219]++;
      if (visit34_219_1(render)) {
        _$jscoverage['/control/render.js'].lineData[220]++;
        el.appendTo(render, undefined);
      } else {
        _$jscoverage['/control/render.js'].lineData[222]++;
        el.appendTo(doc.body, undefined);
      }
    }
  }
}, 
  bindUI: function() {
  _$jscoverage['/control/render.js'].functionData[13]++;
  _$jscoverage['/control/render.js'].lineData[228]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[229]++;
  var control = self.control;
  _$jscoverage['/control/render.js'].lineData[230]++;
  var attrs = control.getAttrs();
  _$jscoverage['/control/render.js'].lineData[231]++;
  var attrName, attrCfg;
  _$jscoverage['/control/render.js'].lineData[232]++;
  for (attrName in attrs) {
    _$jscoverage['/control/render.js'].lineData[233]++;
    attrCfg = attrs[attrName];
    _$jscoverage['/control/render.js'].lineData[234]++;
    var ucName = S.ucfirst(attrName);
    _$jscoverage['/control/render.js'].lineData[235]++;
    var attrChangeFn = self[ON_SET + ucName];
    _$jscoverage['/control/render.js'].lineData[236]++;
    if (visit35_236_1(attrCfg.view && attrChangeFn)) {
      _$jscoverage['/control/render.js'].lineData[238]++;
      control.on('after' + ucName + 'Change', onSetAttrChange, self);
    }
  }
}, 
  destructor: function() {
  _$jscoverage['/control/render.js'].functionData[14]++;
  _$jscoverage['/control/render.js'].lineData[244]++;
  if (visit36_244_1(this.$el)) {
    _$jscoverage['/control/render.js'].lineData[245]++;
    this.$el.remove();
  }
}, 
  $: function(selector) {
  _$jscoverage['/control/render.js'].functionData[15]++;
  _$jscoverage['/control/render.js'].lineData[250]++;
  return this.$el.all(selector);
}, 
  fillChildrenElsBySelectors: function(childrenElSelectors) {
  _$jscoverage['/control/render.js'].functionData[16]++;
  _$jscoverage['/control/render.js'].lineData[254]++;
  var self = this, el = self.$el, control = self.control, childName, selector;
  _$jscoverage['/control/render.js'].lineData[260]++;
  childrenElSelectors = visit37_260_1(childrenElSelectors || self.childrenElSelectors);
  _$jscoverage['/control/render.js'].lineData[262]++;
  for (childName in childrenElSelectors) {
    _$jscoverage['/control/render.js'].lineData[263]++;
    selector = childrenElSelectors[childName];
    _$jscoverage['/control/render.js'].lineData[264]++;
    if (visit38_264_1(typeof selector === 'function')) {
      _$jscoverage['/control/render.js'].lineData[265]++;
      control.setInternal(childName, selector(el));
    } else {
      _$jscoverage['/control/render.js'].lineData[267]++;
      control.setInternal(childName, self.$(S.substitute(selector, self.renderData)));
    }
    _$jscoverage['/control/render.js'].lineData[270]++;
    delete childrenElSelectors[childName];
  }
}, 
  renderTpl: function(tpl, renderData, renderCommands) {
  _$jscoverage['/control/render.js'].functionData[17]++;
  _$jscoverage['/control/render.js'].lineData[275]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[276]++;
  renderData = visit39_276_1(renderData || self.renderData);
  _$jscoverage['/control/render.js'].lineData[277]++;
  renderCommands = visit40_277_1(renderCommands || self.renderCommands);
  _$jscoverage['/control/render.js'].lineData[278]++;
  var XTemplate = self.get('xtemplate');
  _$jscoverage['/control/render.js'].lineData[279]++;
  return new XTemplate(tpl, {
  control: self.control, 
  view: self, 
  commands: renderCommands}).render(renderData);
}, 
  getComponentConstructorByNode: function(prefixCls, childNode) {
  _$jscoverage['/control/render.js'].functionData[18]++;
  _$jscoverage['/control/render.js'].lineData[292]++;
  var cls = childNode[0].className;
  _$jscoverage['/control/render.js'].lineData[294]++;
  if (visit41_294_1(cls)) {
    _$jscoverage['/control/render.js'].lineData[295]++;
    cls = cls.replace(new RegExp('\\b' + prefixCls, 'ig'), '');
    _$jscoverage['/control/render.js'].lineData[296]++;
    return Manager.getConstructorByXClass(cls);
  }
  _$jscoverage['/control/render.js'].lineData[298]++;
  return null;
}, 
  getComponentCssClasses: function() {
  _$jscoverage['/control/render.js'].functionData[19]++;
  _$jscoverage['/control/render.js'].lineData[302]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[303]++;
  if (visit42_303_1(self.componentCssClasses)) {
    _$jscoverage['/control/render.js'].lineData[304]++;
    return self.componentCssClasses;
  }
  _$jscoverage['/control/render.js'].lineData[306]++;
  var control = self.control, constructor = control.constructor, xclass, re = [];
  _$jscoverage['/control/render.js'].lineData[310]++;
  while (visit43_310_1(constructor && !constructor.prototype.hasOwnProperty('isControl'))) {
    _$jscoverage['/control/render.js'].lineData[311]++;
    xclass = constructor.xclass;
    _$jscoverage['/control/render.js'].lineData[312]++;
    if (visit44_312_1(xclass)) {
      _$jscoverage['/control/render.js'].lineData[313]++;
      re.push(xclass);
    }
    _$jscoverage['/control/render.js'].lineData[315]++;
    constructor = visit45_315_1(constructor.superclass && constructor.superclass.constructor);
  }
  _$jscoverage['/control/render.js'].lineData[318]++;
  self.componentCssClasses = re;
  _$jscoverage['/control/render.js'].lineData[319]++;
  return re;
}, 
  getBaseCssClasses: function(extras) {
  _$jscoverage['/control/render.js'].functionData[20]++;
  _$jscoverage['/control/render.js'].lineData[328]++;
  extras = normalExtras(extras);
  _$jscoverage['/control/render.js'].lineData[329]++;
  var componentCssClasses = this.getComponentCssClasses(), i = 0, control = this.get('control'), cls = '', l = componentCssClasses.length, prefixCls = control.get('prefixCls');
  _$jscoverage['/control/render.js'].lineData[335]++;
  for (; visit46_335_1(i < l); i++) {
    _$jscoverage['/control/render.js'].lineData[336]++;
    cls += prefixExtra(prefixCls, componentCssClasses[i], extras);
  }
  _$jscoverage['/control/render.js'].lineData[338]++;
  return trim(cls);
}, 
  getBaseCssClass: function(extras) {
  _$jscoverage['/control/render.js'].functionData[21]++;
  _$jscoverage['/control/render.js'].lineData[348]++;
  return trim(prefixExtra(this.control.get('prefixCls'), this.getComponentCssClasses()[0], normalExtras(extras)));
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/control/render.js'].functionData[22]++;
  _$jscoverage['/control/render.js'].lineData[361]++;
  return this.$el;
}, 
  '_onSetWidth': function(w) {
  _$jscoverage['/control/render.js'].functionData[23]++;
  _$jscoverage['/control/render.js'].lineData[365]++;
  this.$el.width(w);
}, 
  _onSetHeight: function(h) {
  _$jscoverage['/control/render.js'].functionData[24]++;
  _$jscoverage['/control/render.js'].lineData[369]++;
  this.$el.height(h);
}, 
  '_onSetContent': function(c) {
  _$jscoverage['/control/render.js'].functionData[25]++;
  _$jscoverage['/control/render.js'].lineData[373]++;
  var el = this.$el;
  _$jscoverage['/control/render.js'].lineData[374]++;
  el.html(c);
  _$jscoverage['/control/render.js'].lineData[376]++;
  if (visit47_376_1(!this.get('allowTextSelection'))) {
    _$jscoverage['/control/render.js'].lineData[377]++;
    el.unselectable();
  }
}, 
  _onSetVisible: function(visible) {
  _$jscoverage['/control/render.js'].functionData[26]++;
  _$jscoverage['/control/render.js'].lineData[382]++;
  var self = this, el = self.$el, hiddenCls = self.getBaseCssClasses('hidden');
  _$jscoverage['/control/render.js'].lineData[385]++;
  if (visit48_385_1(visible)) {
    _$jscoverage['/control/render.js'].lineData[386]++;
    el.removeClass(hiddenCls);
  } else {
    _$jscoverage['/control/render.js'].lineData[388]++;
    el.addClass(hiddenCls);
  }
}, 
  _onSetHighlighted: function(v) {
  _$jscoverage['/control/render.js'].functionData[27]++;
  _$jscoverage['/control/render.js'].lineData[396]++;
  var self = this, componentCls = self.getBaseCssClasses('hover'), el = self.$el;
  _$jscoverage['/control/render.js'].lineData[399]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/control/render.js'].functionData[28]++;
  _$jscoverage['/control/render.js'].lineData[406]++;
  var self = this, control = self.control, componentCls = self.getBaseCssClasses('disabled'), el = self.$el;
  _$jscoverage['/control/render.js'].lineData[411]++;
  el[v ? 'addClass' : 'removeClass'](componentCls).attr('aria-disabled', v);
  _$jscoverage['/control/render.js'].lineData[412]++;
  if (visit49_412_1(control.get('focusable'))) {
    _$jscoverage['/control/render.js'].lineData[414]++;
    self.getKeyEventTarget().attr('tabindex', v ? -1 : 0);
  }
}, 
  '_onSetActive': function(v) {
  _$jscoverage['/control/render.js'].functionData[29]++;
  _$jscoverage['/control/render.js'].lineData[421]++;
  var self = this, componentCls = self.getBaseCssClasses('active');
  _$jscoverage['/control/render.js'].lineData[424]++;
  self.$el[v ? 'addClass' : 'removeClass'](componentCls).attr('aria-pressed', !!v);
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/control/render.js'].functionData[30]++;
  _$jscoverage['/control/render.js'].lineData[430]++;
  var self = this, el = self.$el, componentCls = self.getBaseCssClasses('focused');
  _$jscoverage['/control/render.js'].lineData[433]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  '_onSetZIndex': function(x) {
  _$jscoverage['/control/render.js'].functionData[31]++;
  _$jscoverage['/control/render.js'].lineData[437]++;
  this.$el.css('z-index', x);
}}, {
  __hooks__: {
  decorateDom: ComponentProcess.prototype.__getHook('__decorateDom'), 
  beforeCreateDom: ComponentProcess.prototype.__getHook('__beforeCreateDom')}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/control/render.js'].functionData[32]++;
  _$jscoverage['/control/render.js'].lineData[455]++;
  var SuperClass = this, NewClass, parsers = {};
  _$jscoverage['/control/render.js'].lineData[458]++;
  NewClass = ComponentProcess.extend.apply(SuperClass, arguments);
  _$jscoverage['/control/render.js'].lineData[459]++;
  NewClass[HTML_PARSER] = visit50_459_1(NewClass[HTML_PARSER] || {});
  _$jscoverage['/control/render.js'].lineData[460]++;
  if (visit51_460_1(S.isArray(extensions))) {
    _$jscoverage['/control/render.js'].lineData[463]++;
    S.each(extensions.concat(NewClass), function(ext) {
  _$jscoverage['/control/render.js'].functionData[33]++;
  _$jscoverage['/control/render.js'].lineData[464]++;
  if (visit52_464_1(ext)) {
    _$jscoverage['/control/render.js'].lineData[466]++;
    S.each(ext.HTML_PARSER, function(v, name) {
  _$jscoverage['/control/render.js'].functionData[34]++;
  _$jscoverage['/control/render.js'].lineData[467]++;
  parsers[name] = v;
});
  }
});
    _$jscoverage['/control/render.js'].lineData[471]++;
    NewClass[HTML_PARSER] = parsers;
  }
  _$jscoverage['/control/render.js'].lineData[473]++;
  S.mix(NewClass[HTML_PARSER], SuperClass[HTML_PARSER], false);
  _$jscoverage['/control/render.js'].lineData[474]++;
  NewClass.extend = extend;
  _$jscoverage['/control/render.js'].lineData[475]++;
  return NewClass;
}, 
  ATTRS: {
  control: {
  setter: function(v) {
  _$jscoverage['/control/render.js'].functionData[35]++;
  _$jscoverage['/control/render.js'].lineData[482]++;
  this.control = v;
}}, 
  xtemplate: {
  value: XTemplateRuntime}, 
  contentTpl: {
  value: function(scope) {
  _$jscoverage['/control/render.js'].functionData[36]++;
  _$jscoverage['/control/render.js'].lineData[490]++;
  return visit53_490_1(scope.get('content') || '');
}}}, 
  HTML_PARSER: {
  id: function(el) {
  _$jscoverage['/control/render.js'].functionData[37]++;
  _$jscoverage['/control/render.js'].lineData[497]++;
  var id = el[0].id;
  _$jscoverage['/control/render.js'].lineData[498]++;
  return id ? id : undefined;
}, 
  content: function(el) {
  _$jscoverage['/control/render.js'].functionData[38]++;
  _$jscoverage['/control/render.js'].lineData[501]++;
  return el.html();
}, 
  disabled: function(el) {
  _$jscoverage['/control/render.js'].functionData[39]++;
  _$jscoverage['/control/render.js'].lineData[504]++;
  return el.hasClass(this.getBaseCssClass('disabled'));
}}, 
  name: 'render'});
});
