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
  _$jscoverage['/control/render.js'].lineData[17] = 0;
  _$jscoverage['/control/render.js'].lineData[18] = 0;
  _$jscoverage['/control/render.js'].lineData[19] = 0;
  _$jscoverage['/control/render.js'].lineData[21] = 0;
  _$jscoverage['/control/render.js'].lineData[24] = 0;
  _$jscoverage['/control/render.js'].lineData[25] = 0;
  _$jscoverage['/control/render.js'].lineData[30] = 0;
  _$jscoverage['/control/render.js'].lineData[31] = 0;
  _$jscoverage['/control/render.js'].lineData[33] = 0;
  _$jscoverage['/control/render.js'].lineData[35] = 0;
  _$jscoverage['/control/render.js'].lineData[36] = 0;
  _$jscoverage['/control/render.js'].lineData[37] = 0;
  _$jscoverage['/control/render.js'].lineData[41] = 0;
  _$jscoverage['/control/render.js'].lineData[42] = 0;
  _$jscoverage['/control/render.js'].lineData[45] = 0;
  _$jscoverage['/control/render.js'].lineData[46] = 0;
  _$jscoverage['/control/render.js'].lineData[51] = 0;
  _$jscoverage['/control/render.js'].lineData[52] = 0;
  _$jscoverage['/control/render.js'].lineData[53] = 0;
  _$jscoverage['/control/render.js'].lineData[55] = 0;
  _$jscoverage['/control/render.js'].lineData[56] = 0;
  _$jscoverage['/control/render.js'].lineData[58] = 0;
  _$jscoverage['/control/render.js'].lineData[61] = 0;
  _$jscoverage['/control/render.js'].lineData[62] = 0;
  _$jscoverage['/control/render.js'].lineData[67] = 0;
  _$jscoverage['/control/render.js'].lineData[68] = 0;
  _$jscoverage['/control/render.js'].lineData[69] = 0;
  _$jscoverage['/control/render.js'].lineData[70] = 0;
  _$jscoverage['/control/render.js'].lineData[72] = 0;
  _$jscoverage['/control/render.js'].lineData[75] = 0;
  _$jscoverage['/control/render.js'].lineData[76] = 0;
  _$jscoverage['/control/render.js'].lineData[79] = 0;
  _$jscoverage['/control/render.js'].lineData[80] = 0;
  _$jscoverage['/control/render.js'].lineData[81] = 0;
  _$jscoverage['/control/render.js'].lineData[86] = 0;
  _$jscoverage['/control/render.js'].lineData[87] = 0;
  _$jscoverage['/control/render.js'].lineData[90] = 0;
  _$jscoverage['/control/render.js'].lineData[91] = 0;
  _$jscoverage['/control/render.js'].lineData[98] = 0;
  _$jscoverage['/control/render.js'].lineData[102] = 0;
  _$jscoverage['/control/render.js'].lineData[105] = 0;
  _$jscoverage['/control/render.js'].lineData[107] = 0;
  _$jscoverage['/control/render.js'].lineData[109] = 0;
  _$jscoverage['/control/render.js'].lineData[114] = 0;
  _$jscoverage['/control/render.js'].lineData[129] = 0;
  _$jscoverage['/control/render.js'].lineData[130] = 0;
  _$jscoverage['/control/render.js'].lineData[131] = 0;
  _$jscoverage['/control/render.js'].lineData[132] = 0;
  _$jscoverage['/control/render.js'].lineData[136] = 0;
  _$jscoverage['/control/render.js'].lineData[137] = 0;
  _$jscoverage['/control/render.js'].lineData[138] = 0;
  _$jscoverage['/control/render.js'].lineData[139] = 0;
  _$jscoverage['/control/render.js'].lineData[141] = 0;
  _$jscoverage['/control/render.js'].lineData[142] = 0;
  _$jscoverage['/control/render.js'].lineData[144] = 0;
  _$jscoverage['/control/render.js'].lineData[145] = 0;
  _$jscoverage['/control/render.js'].lineData[147] = 0;
  _$jscoverage['/control/render.js'].lineData[148] = 0;
  _$jscoverage['/control/render.js'].lineData[151] = 0;
  _$jscoverage['/control/render.js'].lineData[152] = 0;
  _$jscoverage['/control/render.js'].lineData[155] = 0;
  _$jscoverage['/control/render.js'].lineData[156] = 0;
  _$jscoverage['/control/render.js'].lineData[157] = 0;
  _$jscoverage['/control/render.js'].lineData[159] = 0;
  _$jscoverage['/control/render.js'].lineData[160] = 0;
  _$jscoverage['/control/render.js'].lineData[162] = 0;
  _$jscoverage['/control/render.js'].lineData[163] = 0;
  _$jscoverage['/control/render.js'].lineData[164] = 0;
  _$jscoverage['/control/render.js'].lineData[166] = 0;
  _$jscoverage['/control/render.js'].lineData[176] = 0;
  _$jscoverage['/control/render.js'].lineData[177] = 0;
  _$jscoverage['/control/render.js'].lineData[186] = 0;
  _$jscoverage['/control/render.js'].lineData[189] = 0;
  _$jscoverage['/control/render.js'].lineData[190] = 0;
  _$jscoverage['/control/render.js'].lineData[191] = 0;
  _$jscoverage['/control/render.js'].lineData[192] = 0;
  _$jscoverage['/control/render.js'].lineData[193] = 0;
  _$jscoverage['/control/render.js'].lineData[197] = 0;
  _$jscoverage['/control/render.js'].lineData[199] = 0;
  _$jscoverage['/control/render.js'].lineData[200] = 0;
  _$jscoverage['/control/render.js'].lineData[202] = 0;
  _$jscoverage['/control/render.js'].lineData[203] = 0;
  _$jscoverage['/control/render.js'].lineData[204] = 0;
  _$jscoverage['/control/render.js'].lineData[208] = 0;
  _$jscoverage['/control/render.js'].lineData[213] = 0;
  _$jscoverage['/control/render.js'].lineData[214] = 0;
  _$jscoverage['/control/render.js'].lineData[216] = 0;
  _$jscoverage['/control/render.js'].lineData[217] = 0;
  _$jscoverage['/control/render.js'].lineData[218] = 0;
  _$jscoverage['/control/render.js'].lineData[219] = 0;
  _$jscoverage['/control/render.js'].lineData[221] = 0;
  _$jscoverage['/control/render.js'].lineData[227] = 0;
  _$jscoverage['/control/render.js'].lineData[228] = 0;
  _$jscoverage['/control/render.js'].lineData[229] = 0;
  _$jscoverage['/control/render.js'].lineData[230] = 0;
  _$jscoverage['/control/render.js'].lineData[231] = 0;
  _$jscoverage['/control/render.js'].lineData[232] = 0;
  _$jscoverage['/control/render.js'].lineData[233] = 0;
  _$jscoverage['/control/render.js'].lineData[234] = 0;
  _$jscoverage['/control/render.js'].lineData[235] = 0;
  _$jscoverage['/control/render.js'].lineData[237] = 0;
  _$jscoverage['/control/render.js'].lineData[243] = 0;
  _$jscoverage['/control/render.js'].lineData[244] = 0;
  _$jscoverage['/control/render.js'].lineData[249] = 0;
  _$jscoverage['/control/render.js'].lineData[253] = 0;
  _$jscoverage['/control/render.js'].lineData[259] = 0;
  _$jscoverage['/control/render.js'].lineData[261] = 0;
  _$jscoverage['/control/render.js'].lineData[262] = 0;
  _$jscoverage['/control/render.js'].lineData[263] = 0;
  _$jscoverage['/control/render.js'].lineData[264] = 0;
  _$jscoverage['/control/render.js'].lineData[266] = 0;
  _$jscoverage['/control/render.js'].lineData[269] = 0;
  _$jscoverage['/control/render.js'].lineData[274] = 0;
  _$jscoverage['/control/render.js'].lineData[275] = 0;
  _$jscoverage['/control/render.js'].lineData[276] = 0;
  _$jscoverage['/control/render.js'].lineData[277] = 0;
  _$jscoverage['/control/render.js'].lineData[290] = 0;
  _$jscoverage['/control/render.js'].lineData[292] = 0;
  _$jscoverage['/control/render.js'].lineData[293] = 0;
  _$jscoverage['/control/render.js'].lineData[294] = 0;
  _$jscoverage['/control/render.js'].lineData[296] = 0;
  _$jscoverage['/control/render.js'].lineData[300] = 0;
  _$jscoverage['/control/render.js'].lineData[301] = 0;
  _$jscoverage['/control/render.js'].lineData[302] = 0;
  _$jscoverage['/control/render.js'].lineData[304] = 0;
  _$jscoverage['/control/render.js'].lineData[308] = 0;
  _$jscoverage['/control/render.js'].lineData[309] = 0;
  _$jscoverage['/control/render.js'].lineData[310] = 0;
  _$jscoverage['/control/render.js'].lineData[311] = 0;
  _$jscoverage['/control/render.js'].lineData[313] = 0;
  _$jscoverage['/control/render.js'].lineData[316] = 0;
  _$jscoverage['/control/render.js'].lineData[325] = 0;
  _$jscoverage['/control/render.js'].lineData[326] = 0;
  _$jscoverage['/control/render.js'].lineData[332] = 0;
  _$jscoverage['/control/render.js'].lineData[333] = 0;
  _$jscoverage['/control/render.js'].lineData[335] = 0;
  _$jscoverage['/control/render.js'].lineData[345] = 0;
  _$jscoverage['/control/render.js'].lineData[358] = 0;
  _$jscoverage['/control/render.js'].lineData[362] = 0;
  _$jscoverage['/control/render.js'].lineData[366] = 0;
  _$jscoverage['/control/render.js'].lineData[370] = 0;
  _$jscoverage['/control/render.js'].lineData[371] = 0;
  _$jscoverage['/control/render.js'].lineData[373] = 0;
  _$jscoverage['/control/render.js'].lineData[374] = 0;
  _$jscoverage['/control/render.js'].lineData[379] = 0;
  _$jscoverage['/control/render.js'].lineData[382] = 0;
  _$jscoverage['/control/render.js'].lineData[383] = 0;
  _$jscoverage['/control/render.js'].lineData[385] = 0;
  _$jscoverage['/control/render.js'].lineData[393] = 0;
  _$jscoverage['/control/render.js'].lineData[396] = 0;
  _$jscoverage['/control/render.js'].lineData[403] = 0;
  _$jscoverage['/control/render.js'].lineData[408] = 0;
  _$jscoverage['/control/render.js'].lineData[409] = 0;
  _$jscoverage['/control/render.js'].lineData[411] = 0;
  _$jscoverage['/control/render.js'].lineData[418] = 0;
  _$jscoverage['/control/render.js'].lineData[421] = 0;
  _$jscoverage['/control/render.js'].lineData[427] = 0;
  _$jscoverage['/control/render.js'].lineData[430] = 0;
  _$jscoverage['/control/render.js'].lineData[434] = 0;
  _$jscoverage['/control/render.js'].lineData[451] = 0;
  _$jscoverage['/control/render.js'].lineData[454] = 0;
  _$jscoverage['/control/render.js'].lineData[455] = 0;
  _$jscoverage['/control/render.js'].lineData[456] = 0;
  _$jscoverage['/control/render.js'].lineData[459] = 0;
  _$jscoverage['/control/render.js'].lineData[460] = 0;
  _$jscoverage['/control/render.js'].lineData[462] = 0;
  _$jscoverage['/control/render.js'].lineData[463] = 0;
  _$jscoverage['/control/render.js'].lineData[467] = 0;
  _$jscoverage['/control/render.js'].lineData[469] = 0;
  _$jscoverage['/control/render.js'].lineData[470] = 0;
  _$jscoverage['/control/render.js'].lineData[471] = 0;
  _$jscoverage['/control/render.js'].lineData[478] = 0;
  _$jscoverage['/control/render.js'].lineData[488] = 0;
  _$jscoverage['/control/render.js'].lineData[489] = 0;
  _$jscoverage['/control/render.js'].lineData[492] = 0;
  _$jscoverage['/control/render.js'].lineData[495] = 0;
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
}
if (! _$jscoverage['/control/render.js'].branchData) {
  _$jscoverage['/control/render.js'].branchData = {};
  _$jscoverage['/control/render.js'].branchData['18'] = [];
  _$jscoverage['/control/render.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['33'] = [];
  _$jscoverage['/control/render.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['36'] = [];
  _$jscoverage['/control/render.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['41'] = [];
  _$jscoverage['/control/render.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['45'] = [];
  _$jscoverage['/control/render.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['52'] = [];
  _$jscoverage['/control/render.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['55'] = [];
  _$jscoverage['/control/render.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['67'] = [];
  _$jscoverage['/control/render.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['79'] = [];
  _$jscoverage['/control/render.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['105'] = [];
  _$jscoverage['/control/render.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['131'] = [];
  _$jscoverage['/control/render.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['141'] = [];
  _$jscoverage['/control/render.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['144'] = [];
  _$jscoverage['/control/render.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['147'] = [];
  _$jscoverage['/control/render.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['151'] = [];
  _$jscoverage['/control/render.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['155'] = [];
  _$jscoverage['/control/render.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['159'] = [];
  _$jscoverage['/control/render.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['162'] = [];
  _$jscoverage['/control/render.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['163'] = [];
  _$jscoverage['/control/render.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['199'] = [];
  _$jscoverage['/control/render.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['213'] = [];
  _$jscoverage['/control/render.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['216'] = [];
  _$jscoverage['/control/render.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['218'] = [];
  _$jscoverage['/control/render.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['235'] = [];
  _$jscoverage['/control/render.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['243'] = [];
  _$jscoverage['/control/render.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['259'] = [];
  _$jscoverage['/control/render.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['263'] = [];
  _$jscoverage['/control/render.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['275'] = [];
  _$jscoverage['/control/render.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['276'] = [];
  _$jscoverage['/control/render.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['292'] = [];
  _$jscoverage['/control/render.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['301'] = [];
  _$jscoverage['/control/render.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['308'] = [];
  _$jscoverage['/control/render.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['310'] = [];
  _$jscoverage['/control/render.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['313'] = [];
  _$jscoverage['/control/render.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['332'] = [];
  _$jscoverage['/control/render.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['373'] = [];
  _$jscoverage['/control/render.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['373'][2] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['382'] = [];
  _$jscoverage['/control/render.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['409'] = [];
  _$jscoverage['/control/render.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['455'] = [];
  _$jscoverage['/control/render.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['456'] = [];
  _$jscoverage['/control/render.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['460'] = [];
  _$jscoverage['/control/render.js'].branchData['460'][1] = new BranchData();
}
_$jscoverage['/control/render.js'].branchData['460'][1].init(26, 3, 'ext');
function visit52_460_1(result) {
  _$jscoverage['/control/render.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['456'][1].init(256, 21, 'S.isArray(extensions)');
function visit51_456_1(result) {
  _$jscoverage['/control/render.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['455'][1].init(210, 27, 'NewClass[HTML_PARSER] || {}');
function visit50_455_1(result) {
  _$jscoverage['/control/render.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['409'][1].init(295, 24, 'control.get("focusable")');
function visit49_409_1(result) {
  _$jscoverage['/control/render.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['382'][1].init(143, 7, 'visible');
function visit48_382_1(result) {
  _$jscoverage['/control/render.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['373'][2].init(142, 9, 'UA.ie < 9');
function visit47_373_2(result) {
  _$jscoverage['/control/render.js'].branchData['373'][2].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['373'][1].init(142, 44, 'UA.ie < 9 && !this.get(\'allowTextSelection\')');
function visit46_373_1(result) {
  _$jscoverage['/control/render.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['332'][1].init(338, 5, 'i < l');
function visit45_332_1(result) {
  _$jscoverage['/control/render.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['313'][1].init(166, 81, 'constructor.superclass && constructor.superclass.constructor');
function visit44_313_1(result) {
  _$jscoverage['/control/render.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['310'][1].init(68, 6, 'xclass');
function visit43_310_1(result) {
  _$jscoverage['/control/render.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['308'][1].init(305, 65, 'constructor && !constructor.prototype.hasOwnProperty(\'isControl\')');
function visit42_308_1(result) {
  _$jscoverage['/control/render.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['301'][1].init(48, 24, 'self.componentCssClasses');
function visit41_301_1(result) {
  _$jscoverage['/control/render.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['292'][1].init(89, 3, 'cls');
function visit40_292_1(result) {
  _$jscoverage['/control/render.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['276'][1].init(118, 37, 'renderCommands || self.renderCommands');
function visit39_276_1(result) {
  _$jscoverage['/control/render.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['275'][1].init(57, 29, 'renderData || self.renderData');
function visit38_275_1(result) {
  _$jscoverage['/control/render.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['263'][1].init(82, 30, 'typeof selector === "function"');
function visit37_263_1(result) {
  _$jscoverage['/control/render.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['259'][1].init(196, 47, 'childrenElSelectors || self.childrenElSelectors');
function visit36_259_1(result) {
  _$jscoverage['/control/render.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['243'][1].init(18, 8, 'this.$el');
function visit35_243_1(result) {
  _$jscoverage['/control/render.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['235'][1].init(176, 28, 'attrCfg.view && attrChangeFn');
function visit34_235_1(result) {
  _$jscoverage['/control/render.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['218'][1].init(247, 6, 'render');
function visit33_218_1(result) {
  _$jscoverage['/control/render.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['216'][1].init(136, 12, 'renderBefore');
function visit32_216_1(result) {
  _$jscoverage['/control/render.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['213'][1].init(152, 23, '!control.get(\'srcNode\')');
function visit31_213_1(result) {
  _$jscoverage['/control/render.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['199'][1].init(89, 19, '!srcNode.attr(\'id\')');
function visit30_199_1(result) {
  _$jscoverage['/control/render.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['163'][1].init(22, 5, 'UA.ie');
function visit29_163_1(result) {
  _$jscoverage['/control/render.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['162'][1].init(1549, 24, 'control.get(\'focusable\')');
function visit28_162_1(result) {
  _$jscoverage['/control/render.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['159'][1].init(1427, 26, 'control.get(\'highlighted\')');
function visit27_159_1(result) {
  _$jscoverage['/control/render.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['155'][1].init(1242, 34, 'disabled = control.get(\'disabled\')');
function visit26_155_1(result) {
  _$jscoverage['/control/render.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['151'][1].init(1133, 8, '!visible');
function visit25_151_1(result) {
  _$jscoverage['/control/render.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['147'][1].init(1043, 6, 'zIndex');
function visit24_147_1(result) {
  _$jscoverage['/control/render.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['144'][1].init(949, 6, 'height');
function visit23_144_1(result) {
  _$jscoverage['/control/render.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['141'][1].init(858, 5, 'width');
function visit22_141_1(result) {
  _$jscoverage['/control/render.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['131'][1].init(56, 9, 'attr.view');
function visit21_131_1(result) {
  _$jscoverage['/control/render.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['105'][1].init(106, 7, 'srcNode');
function visit20_105_1(result) {
  _$jscoverage['/control/render.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['79'][1].init(89, 24, 'e.target == self.control');
function visit19_79_1(result) {
  _$jscoverage['/control/render.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['67'][1].init(156, 5, 'i < l');
function visit18_67_1(result) {
  _$jscoverage['/control/render.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['55'][1].init(77, 25, 'typeof extras == "string"');
function visit17_55_1(result) {
  _$jscoverage['/control/render.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['52'][1].init(14, 7, '!extras');
function visit16_52_1(result) {
  _$jscoverage['/control/render.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['45'][1].init(485, 20, 'S.isArray(v) && v[0]');
function visit15_45_1(result) {
  _$jscoverage['/control/render.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['41'][1].init(344, 20, 'typeof v == \'string\'');
function visit14_41_1(result) {
  _$jscoverage['/control/render.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['36'][1].init(103, 17, 'ret !== undefined');
function visit13_36_1(result) {
  _$jscoverage['/control/render.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['33'][1].init(65, 23, 'typeof v === \'function\'');
function visit12_33_1(result) {
  _$jscoverage['/control/render.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['18'][1].init(14, 20, 'typeof v == \'number\'');
function visit11_18_1(result) {
  _$jscoverage['/control/render.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].lineData[7]++;
KISSY.add("component/control/render", function(S, ComponentProcess, XTemplate, RenderTpl, Manager) {
  _$jscoverage['/control/render.js'].functionData[0]++;
  _$jscoverage['/control/render.js'].lineData[8]++;
  var ON_SET = '_onSet', trim = S.trim, $ = S.all, UA = S.UA, startTpl = RenderTpl, endTpl = '</div>', doc = S.Env.host.document, HTML_PARSER = 'HTML_PARSER';
  _$jscoverage['/control/render.js'].lineData[17]++;
  function pxSetter(v) {
    _$jscoverage['/control/render.js'].functionData[1]++;
    _$jscoverage['/control/render.js'].lineData[18]++;
    if (visit11_18_1(typeof v == 'number')) {
      _$jscoverage['/control/render.js'].lineData[19]++;
      v += 'px';
    }
    _$jscoverage['/control/render.js'].lineData[21]++;
    return v;
  }
  _$jscoverage['/control/render.js'].lineData[24]++;
  function applyParser(srcNode, parser, control) {
    _$jscoverage['/control/render.js'].functionData[2]++;
    _$jscoverage['/control/render.js'].lineData[25]++;
    var view = this, p, v, ret;
    _$jscoverage['/control/render.js'].lineData[30]++;
    for (p in parser) {
      _$jscoverage['/control/render.js'].lineData[31]++;
      v = parser[p];
      _$jscoverage['/control/render.js'].lineData[33]++;
      if (visit12_33_1(typeof v === 'function')) {
        _$jscoverage['/control/render.js'].lineData[35]++;
        ret = v.call(view, srcNode);
        _$jscoverage['/control/render.js'].lineData[36]++;
        if (visit13_36_1(ret !== undefined)) {
          _$jscoverage['/control/render.js'].lineData[37]++;
          control.setInternal(p, ret);
        }
      } else {
        _$jscoverage['/control/render.js'].lineData[41]++;
        if (visit14_41_1(typeof v == 'string')) {
          _$jscoverage['/control/render.js'].lineData[42]++;
          control.setInternal(p, srcNode.one(v));
        } else {
          _$jscoverage['/control/render.js'].lineData[45]++;
          if (visit15_45_1(S.isArray(v) && v[0])) {
            _$jscoverage['/control/render.js'].lineData[46]++;
            control.setInternal(p, srcNode.all(v[0]));
          }
        }
      }
    }
  }
  _$jscoverage['/control/render.js'].lineData[51]++;
  function normalExtras(extras) {
    _$jscoverage['/control/render.js'].functionData[3]++;
    _$jscoverage['/control/render.js'].lineData[52]++;
    if (visit16_52_1(!extras)) {
      _$jscoverage['/control/render.js'].lineData[53]++;
      extras = [''];
    }
    _$jscoverage['/control/render.js'].lineData[55]++;
    if (visit17_55_1(typeof extras == "string")) {
      _$jscoverage['/control/render.js'].lineData[56]++;
      extras = extras.split(/\s+/);
    }
    _$jscoverage['/control/render.js'].lineData[58]++;
    return extras;
  }
  _$jscoverage['/control/render.js'].lineData[61]++;
  function prefixExtra(prefixCls, componentCls, extras) {
    _$jscoverage['/control/render.js'].functionData[4]++;
    _$jscoverage['/control/render.js'].lineData[62]++;
    var cls = '', i = 0, l = extras.length, e, prefix = prefixCls + componentCls;
    _$jscoverage['/control/render.js'].lineData[67]++;
    for (; visit18_67_1(i < l); i++) {
      _$jscoverage['/control/render.js'].lineData[68]++;
      e = extras[i];
      _$jscoverage['/control/render.js'].lineData[69]++;
      e = e ? ('-' + e) : e;
      _$jscoverage['/control/render.js'].lineData[70]++;
      cls += ' ' + prefix + e;
    }
    _$jscoverage['/control/render.js'].lineData[72]++;
    return cls;
  }
  _$jscoverage['/control/render.js'].lineData[75]++;
  function onSetAttrChange(e) {
    _$jscoverage['/control/render.js'].functionData[5]++;
    _$jscoverage['/control/render.js'].lineData[76]++;
    var self = this, method;
    _$jscoverage['/control/render.js'].lineData[79]++;
    if (visit19_79_1(e.target == self.control)) {
      _$jscoverage['/control/render.js'].lineData[80]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/control/render.js'].lineData[81]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/control/render.js'].lineData[86]++;
  function getBaseCssClassesCmd() {
    _$jscoverage['/control/render.js'].functionData[6]++;
    _$jscoverage['/control/render.js'].lineData[87]++;
    return this.config.view.getBaseCssClasses(arguments[1].params[0]);
  }
  _$jscoverage['/control/render.js'].lineData[90]++;
  function getBaseCssClassCmd() {
    _$jscoverage['/control/render.js'].functionData[7]++;
    _$jscoverage['/control/render.js'].lineData[91]++;
    return this.config.view.getBaseCssClass(arguments[1].params[0]);
  }
  _$jscoverage['/control/render.js'].lineData[98]++;
  return ComponentProcess.extend({
  isRender: true, 
  createInternal: function() {
  _$jscoverage['/control/render.js'].functionData[8]++;
  _$jscoverage['/control/render.js'].lineData[102]++;
  var self = this, srcNode = self.control.get('srcNode');
  _$jscoverage['/control/render.js'].lineData[105]++;
  if (visit20_105_1(srcNode)) {
    _$jscoverage['/control/render.js'].lineData[107]++;
    self.decorateDom(srcNode);
  } else {
    _$jscoverage['/control/render.js'].lineData[109]++;
    self.callSuper();
  }
}, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/control/render.js'].functionData[9]++;
  _$jscoverage['/control/render.js'].lineData[114]++;
  var self = this, control = self.control, width, height, visible, elAttrs = control.get('elAttrs'), cls = control.get('elCls'), disabled, attrs = control['getAttrs'](), a, attr, elStyle = control.get('elStyle'), zIndex, elCls = control.get('elCls');
  _$jscoverage['/control/render.js'].lineData[129]++;
  for (a in attrs) {
    _$jscoverage['/control/render.js'].lineData[130]++;
    attr = attrs[a];
    _$jscoverage['/control/render.js'].lineData[131]++;
    if (visit21_131_1(attr.view)) {
      _$jscoverage['/control/render.js'].lineData[132]++;
      renderData[a] = control.get(a);
    }
  }
  _$jscoverage['/control/render.js'].lineData[136]++;
  width = renderData.width;
  _$jscoverage['/control/render.js'].lineData[137]++;
  height = renderData.height;
  _$jscoverage['/control/render.js'].lineData[138]++;
  visible = renderData.visible;
  _$jscoverage['/control/render.js'].lineData[139]++;
  zIndex = renderData.zIndex;
  _$jscoverage['/control/render.js'].lineData[141]++;
  if (visit22_141_1(width)) {
    _$jscoverage['/control/render.js'].lineData[142]++;
    elStyle.width = pxSetter(width);
  }
  _$jscoverage['/control/render.js'].lineData[144]++;
  if (visit23_144_1(height)) {
    _$jscoverage['/control/render.js'].lineData[145]++;
    elStyle.height = pxSetter(height);
  }
  _$jscoverage['/control/render.js'].lineData[147]++;
  if (visit24_147_1(zIndex)) {
    _$jscoverage['/control/render.js'].lineData[148]++;
    elStyle['z-index'] = zIndex;
  }
  _$jscoverage['/control/render.js'].lineData[151]++;
  if (visit25_151_1(!visible)) {
    _$jscoverage['/control/render.js'].lineData[152]++;
    elCls.push(self.getBaseCssClasses('hidden'));
  }
  _$jscoverage['/control/render.js'].lineData[155]++;
  if (visit26_155_1(disabled = control.get('disabled'))) {
    _$jscoverage['/control/render.js'].lineData[156]++;
    cls.push(self.getBaseCssClasses('disabled'));
    _$jscoverage['/control/render.js'].lineData[157]++;
    elAttrs['aria-disabled'] = 'true';
  }
  _$jscoverage['/control/render.js'].lineData[159]++;
  if (visit27_159_1(control.get('highlighted'))) {
    _$jscoverage['/control/render.js'].lineData[160]++;
    cls.push(self.getBaseCssClasses('hover'));
  }
  _$jscoverage['/control/render.js'].lineData[162]++;
  if (visit28_162_1(control.get('focusable'))) {
    _$jscoverage['/control/render.js'].lineData[163]++;
    if (visit29_163_1(UA.ie)) {
      _$jscoverage['/control/render.js'].lineData[164]++;
      elAttrs['hideFocus'] = 'true';
    }
    _$jscoverage['/control/render.js'].lineData[166]++;
    elAttrs['tabindex'] = disabled ? '-1' : '0';
  }
}, 
  createDom: function() {
  _$jscoverage['/control/render.js'].functionData[10]++;
  _$jscoverage['/control/render.js'].lineData[176]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[177]++;
  self['beforeCreateDom'](self.renderData = {}, self.childrenElSelectors = {}, self.renderCommands = {
  getBaseCssClasses: getBaseCssClassesCmd, 
  getBaseCssClass: getBaseCssClassCmd});
  _$jscoverage['/control/render.js'].lineData[186]++;
  var control = self.control, tpl, html;
  _$jscoverage['/control/render.js'].lineData[189]++;
  tpl = startTpl + self.get('contentTpl') + endTpl;
  _$jscoverage['/control/render.js'].lineData[190]++;
  html = self.renderTpl(tpl);
  _$jscoverage['/control/render.js'].lineData[191]++;
  control.setInternal("el", self.$el = $(html));
  _$jscoverage['/control/render.js'].lineData[192]++;
  self.el = self.$el[0];
  _$jscoverage['/control/render.js'].lineData[193]++;
  self.fillChildrenElsBySelectors();
}, 
  decorateDom: function(srcNode) {
  _$jscoverage['/control/render.js'].functionData[11]++;
  _$jscoverage['/control/render.js'].lineData[197]++;
  var self = this, control = self.control;
  _$jscoverage['/control/render.js'].lineData[199]++;
  if (visit30_199_1(!srcNode.attr('id'))) {
    _$jscoverage['/control/render.js'].lineData[200]++;
    srcNode.attr('id', control.get('id'));
  }
  _$jscoverage['/control/render.js'].lineData[202]++;
  applyParser.call(self, srcNode, self.constructor.HTML_PARSER, control);
  _$jscoverage['/control/render.js'].lineData[203]++;
  control.setInternal("el", self.$el = srcNode);
  _$jscoverage['/control/render.js'].lineData[204]++;
  self.el = srcNode[0];
}, 
  renderUI: function() {
  _$jscoverage['/control/render.js'].functionData[12]++;
  _$jscoverage['/control/render.js'].lineData[208]++;
  var self = this, control = self.control, el = self.$el;
  _$jscoverage['/control/render.js'].lineData[213]++;
  if (visit31_213_1(!control.get('srcNode'))) {
    _$jscoverage['/control/render.js'].lineData[214]++;
    var render = control.get('render'), renderBefore = control.get('elBefore');
    _$jscoverage['/control/render.js'].lineData[216]++;
    if (visit32_216_1(renderBefore)) {
      _$jscoverage['/control/render.js'].lineData[217]++;
      el['insertBefore'](renderBefore, undefined);
    } else {
      _$jscoverage['/control/render.js'].lineData[218]++;
      if (visit33_218_1(render)) {
        _$jscoverage['/control/render.js'].lineData[219]++;
        el.appendTo(render, undefined);
      } else {
        _$jscoverage['/control/render.js'].lineData[221]++;
        el.appendTo(doc.body, undefined);
      }
    }
  }
}, 
  bindUI: function() {
  _$jscoverage['/control/render.js'].functionData[13]++;
  _$jscoverage['/control/render.js'].lineData[227]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[228]++;
  var control = self.control;
  _$jscoverage['/control/render.js'].lineData[229]++;
  var attrs = control['getAttrs']();
  _$jscoverage['/control/render.js'].lineData[230]++;
  var attrName, attrCfg;
  _$jscoverage['/control/render.js'].lineData[231]++;
  for (attrName in attrs) {
    _$jscoverage['/control/render.js'].lineData[232]++;
    attrCfg = attrs[attrName];
    _$jscoverage['/control/render.js'].lineData[233]++;
    var ucName = S.ucfirst(attrName);
    _$jscoverage['/control/render.js'].lineData[234]++;
    var attrChangeFn = self[ON_SET + ucName];
    _$jscoverage['/control/render.js'].lineData[235]++;
    if (visit34_235_1(attrCfg.view && attrChangeFn)) {
      _$jscoverage['/control/render.js'].lineData[237]++;
      control.on("after" + ucName + "Change", onSetAttrChange, self);
    }
  }
}, 
  destructor: function() {
  _$jscoverage['/control/render.js'].functionData[14]++;
  _$jscoverage['/control/render.js'].lineData[243]++;
  if (visit35_243_1(this.$el)) {
    _$jscoverage['/control/render.js'].lineData[244]++;
    this.$el.remove();
  }
}, 
  $: function(selector) {
  _$jscoverage['/control/render.js'].functionData[15]++;
  _$jscoverage['/control/render.js'].lineData[249]++;
  return this.$el.all(selector);
}, 
  fillChildrenElsBySelectors: function(childrenElSelectors) {
  _$jscoverage['/control/render.js'].functionData[16]++;
  _$jscoverage['/control/render.js'].lineData[253]++;
  var self = this, el = self.$el, control = self.control, childName, selector;
  _$jscoverage['/control/render.js'].lineData[259]++;
  childrenElSelectors = visit36_259_1(childrenElSelectors || self.childrenElSelectors);
  _$jscoverage['/control/render.js'].lineData[261]++;
  for (childName in childrenElSelectors) {
    _$jscoverage['/control/render.js'].lineData[262]++;
    selector = childrenElSelectors[childName];
    _$jscoverage['/control/render.js'].lineData[263]++;
    if (visit37_263_1(typeof selector === "function")) {
      _$jscoverage['/control/render.js'].lineData[264]++;
      control.setInternal(childName, selector(el));
    } else {
      _$jscoverage['/control/render.js'].lineData[266]++;
      control.setInternal(childName, self.$(S.substitute(selector, self.renderData)));
    }
    _$jscoverage['/control/render.js'].lineData[269]++;
    delete childrenElSelectors[childName];
  }
}, 
  renderTpl: function(tpl, renderData, renderCommands) {
  _$jscoverage['/control/render.js'].functionData[17]++;
  _$jscoverage['/control/render.js'].lineData[274]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[275]++;
  renderData = visit38_275_1(renderData || self.renderData);
  _$jscoverage['/control/render.js'].lineData[276]++;
  renderCommands = visit39_276_1(renderCommands || self.renderCommands);
  _$jscoverage['/control/render.js'].lineData[277]++;
  return new XTemplate(tpl, {
  control: self.control, 
  view: self, 
  commands: renderCommands}).render(renderData);
}, 
  'getComponentConstructorByNode': function(prefixCls, childNode) {
  _$jscoverage['/control/render.js'].functionData[18]++;
  _$jscoverage['/control/render.js'].lineData[290]++;
  var cls = childNode[0].className;
  _$jscoverage['/control/render.js'].lineData[292]++;
  if (visit40_292_1(cls)) {
    _$jscoverage['/control/render.js'].lineData[293]++;
    cls = cls.replace(new RegExp("\\b" + prefixCls, "ig"), "");
    _$jscoverage['/control/render.js'].lineData[294]++;
    return Manager.getConstructorByXClass(cls);
  }
  _$jscoverage['/control/render.js'].lineData[296]++;
  return null;
}, 
  getComponentCssClasses: function() {
  _$jscoverage['/control/render.js'].functionData[19]++;
  _$jscoverage['/control/render.js'].lineData[300]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[301]++;
  if (visit41_301_1(self.componentCssClasses)) {
    _$jscoverage['/control/render.js'].lineData[302]++;
    return self.componentCssClasses;
  }
  _$jscoverage['/control/render.js'].lineData[304]++;
  var control = self.control, constructor = control.constructor, xclass, re = [];
  _$jscoverage['/control/render.js'].lineData[308]++;
  while (visit42_308_1(constructor && !constructor.prototype.hasOwnProperty('isControl'))) {
    _$jscoverage['/control/render.js'].lineData[309]++;
    xclass = constructor.xclass;
    _$jscoverage['/control/render.js'].lineData[310]++;
    if (visit43_310_1(xclass)) {
      _$jscoverage['/control/render.js'].lineData[311]++;
      re.push(xclass);
    }
    _$jscoverage['/control/render.js'].lineData[313]++;
    constructor = visit44_313_1(constructor.superclass && constructor.superclass.constructor);
  }
  _$jscoverage['/control/render.js'].lineData[316]++;
  return self.componentCssClasses = re;
}, 
  getBaseCssClasses: function(extras) {
  _$jscoverage['/control/render.js'].functionData[20]++;
  _$jscoverage['/control/render.js'].lineData[325]++;
  extras = normalExtras(extras);
  _$jscoverage['/control/render.js'].lineData[326]++;
  var componentCssClasses = this.getComponentCssClasses(), i = 0, control = this.get('control'), cls = '', l = componentCssClasses.length, prefixCls = control.get('prefixCls');
  _$jscoverage['/control/render.js'].lineData[332]++;
  for (; visit45_332_1(i < l); i++) {
    _$jscoverage['/control/render.js'].lineData[333]++;
    cls += prefixExtra(prefixCls, componentCssClasses[i], extras);
  }
  _$jscoverage['/control/render.js'].lineData[335]++;
  return trim(cls);
}, 
  getBaseCssClass: function(extras) {
  _$jscoverage['/control/render.js'].functionData[21]++;
  _$jscoverage['/control/render.js'].lineData[345]++;
  return trim(prefixExtra(this.control.get('prefixCls'), this.getComponentCssClasses()[0], normalExtras(extras)));
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/control/render.js'].functionData[22]++;
  _$jscoverage['/control/render.js'].lineData[358]++;
  return this.$el;
}, 
  '_onSetWidth': function(w) {
  _$jscoverage['/control/render.js'].functionData[23]++;
  _$jscoverage['/control/render.js'].lineData[362]++;
  this.$el.width(w);
}, 
  _onSetHeight: function(h) {
  _$jscoverage['/control/render.js'].functionData[24]++;
  _$jscoverage['/control/render.js'].lineData[366]++;
  this.$el.height(h);
}, 
  '_onSetContent': function(c) {
  _$jscoverage['/control/render.js'].functionData[25]++;
  _$jscoverage['/control/render.js'].lineData[370]++;
  var el = this.$el;
  _$jscoverage['/control/render.js'].lineData[371]++;
  el.html(c);
  _$jscoverage['/control/render.js'].lineData[373]++;
  if (visit46_373_1(visit47_373_2(UA.ie < 9) && !this.get('allowTextSelection'))) {
    _$jscoverage['/control/render.js'].lineData[374]++;
    el['unselectable']();
  }
}, 
  _onSetVisible: function(visible) {
  _$jscoverage['/control/render.js'].functionData[26]++;
  _$jscoverage['/control/render.js'].lineData[379]++;
  var self = this, el = self.$el, hiddenCls = self.getBaseCssClasses('hidden');
  _$jscoverage['/control/render.js'].lineData[382]++;
  if (visit48_382_1(visible)) {
    _$jscoverage['/control/render.js'].lineData[383]++;
    el.removeClass(hiddenCls);
  } else {
    _$jscoverage['/control/render.js'].lineData[385]++;
    el.addClass(hiddenCls);
  }
}, 
  _onSetHighlighted: function(v) {
  _$jscoverage['/control/render.js'].functionData[27]++;
  _$jscoverage['/control/render.js'].lineData[393]++;
  var self = this, componentCls = self.getBaseCssClasses("hover"), el = self.$el;
  _$jscoverage['/control/render.js'].lineData[396]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/control/render.js'].functionData[28]++;
  _$jscoverage['/control/render.js'].lineData[403]++;
  var self = this, control = self.control, componentCls = self.getBaseCssClasses("disabled"), el = self.$el;
  _$jscoverage['/control/render.js'].lineData[408]++;
  el[v ? 'addClass' : 'removeClass'](componentCls).attr("aria-disabled", v);
  _$jscoverage['/control/render.js'].lineData[409]++;
  if (visit49_409_1(control.get("focusable"))) {
    _$jscoverage['/control/render.js'].lineData[411]++;
    self.getKeyEventTarget().attr("tabindex", v ? -1 : 0);
  }
}, 
  '_onSetActive': function(v) {
  _$jscoverage['/control/render.js'].functionData[29]++;
  _$jscoverage['/control/render.js'].lineData[418]++;
  var self = this, componentCls = self.getBaseCssClasses("active");
  _$jscoverage['/control/render.js'].lineData[421]++;
  self.$el[v ? 'addClass' : 'removeClass'](componentCls).attr("aria-pressed", !!v);
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/control/render.js'].functionData[30]++;
  _$jscoverage['/control/render.js'].lineData[427]++;
  var self = this, el = self.$el, componentCls = self.getBaseCssClasses("focused");
  _$jscoverage['/control/render.js'].lineData[430]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  '_onSetZIndex': function(x) {
  _$jscoverage['/control/render.js'].functionData[31]++;
  _$jscoverage['/control/render.js'].lineData[434]++;
  this.$el.css("z-index", x);
}}, {
  __hooks__: {
  decorateDom: ComponentProcess.prototype.__getHook('__decorateDom'), 
  beforeCreateDom: ComponentProcess.prototype.__getHook('__beforeCreateDom')}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/control/render.js'].functionData[32]++;
  _$jscoverage['/control/render.js'].lineData[451]++;
  var SuperClass = this, NewClass, parsers = {};
  _$jscoverage['/control/render.js'].lineData[454]++;
  NewClass = ComponentProcess.extend.apply(SuperClass, arguments);
  _$jscoverage['/control/render.js'].lineData[455]++;
  NewClass[HTML_PARSER] = visit50_455_1(NewClass[HTML_PARSER] || {});
  _$jscoverage['/control/render.js'].lineData[456]++;
  if (visit51_456_1(S.isArray(extensions))) {
    _$jscoverage['/control/render.js'].lineData[459]++;
    S.each(extensions['concat'](NewClass), function(ext) {
  _$jscoverage['/control/render.js'].functionData[33]++;
  _$jscoverage['/control/render.js'].lineData[460]++;
  if (visit52_460_1(ext)) {
    _$jscoverage['/control/render.js'].lineData[462]++;
    S.each(ext.HTML_PARSER, function(v, name) {
  _$jscoverage['/control/render.js'].functionData[34]++;
  _$jscoverage['/control/render.js'].lineData[463]++;
  parsers[name] = v;
});
  }
});
    _$jscoverage['/control/render.js'].lineData[467]++;
    NewClass[HTML_PARSER] = parsers;
  }
  _$jscoverage['/control/render.js'].lineData[469]++;
  S.mix(NewClass[HTML_PARSER], SuperClass[HTML_PARSER], false);
  _$jscoverage['/control/render.js'].lineData[470]++;
  NewClass.extend = extend;
  _$jscoverage['/control/render.js'].lineData[471]++;
  return NewClass;
}, 
  ATTRS: {
  control: {
  setter: function(v) {
  _$jscoverage['/control/render.js'].functionData[35]++;
  _$jscoverage['/control/render.js'].lineData[478]++;
  this.control = v;
}}, 
  contentTpl: {
  value: '{{{content}}}'}}, 
  HTML_PARSER: {
  id: function(el) {
  _$jscoverage['/control/render.js'].functionData[36]++;
  _$jscoverage['/control/render.js'].lineData[488]++;
  var id = el[0].id;
  _$jscoverage['/control/render.js'].lineData[489]++;
  return id ? id : undefined;
}, 
  content: function(el) {
  _$jscoverage['/control/render.js'].functionData[37]++;
  _$jscoverage['/control/render.js'].lineData[492]++;
  return el.html();
}, 
  disabled: function(el) {
  _$jscoverage['/control/render.js'].functionData[38]++;
  _$jscoverage['/control/render.js'].lineData[495]++;
  return el.hasClass(this.getBaseCssClass("disabled"));
}}, 
  name: 'render'});
}, {
  requires: ['./process', 'xtemplate', './render-tpl', 'component/manager']});
