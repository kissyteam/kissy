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
  _$jscoverage['/base/create.js'].lineData[26] = 0;
  _$jscoverage['/base/create.js'].lineData[27] = 0;
  _$jscoverage['/base/create.js'].lineData[30] = 0;
  _$jscoverage['/base/create.js'].lineData[31] = 0;
  _$jscoverage['/base/create.js'].lineData[34] = 0;
  _$jscoverage['/base/create.js'].lineData[35] = 0;
  _$jscoverage['/base/create.js'].lineData[37] = 0;
  _$jscoverage['/base/create.js'].lineData[40] = 0;
  _$jscoverage['/base/create.js'].lineData[41] = 0;
  _$jscoverage['/base/create.js'].lineData[43] = 0;
  _$jscoverage['/base/create.js'].lineData[44] = 0;
  _$jscoverage['/base/create.js'].lineData[47] = 0;
  _$jscoverage['/base/create.js'].lineData[48] = 0;
  _$jscoverage['/base/create.js'].lineData[50] = 0;
  _$jscoverage['/base/create.js'].lineData[51] = 0;
  _$jscoverage['/base/create.js'].lineData[57] = 0;
  _$jscoverage['/base/create.js'].lineData[58] = 0;
  _$jscoverage['/base/create.js'].lineData[62] = 0;
  _$jscoverage['/base/create.js'].lineData[63] = 0;
  _$jscoverage['/base/create.js'].lineData[68] = 0;
  _$jscoverage['/base/create.js'].lineData[70] = 0;
  _$jscoverage['/base/create.js'].lineData[71] = 0;
  _$jscoverage['/base/create.js'].lineData[73] = 0;
  _$jscoverage['/base/create.js'].lineData[75] = 0;
  _$jscoverage['/base/create.js'].lineData[80] = 0;
  _$jscoverage['/base/create.js'].lineData[98] = 0;
  _$jscoverage['/base/create.js'].lineData[100] = 0;
  _$jscoverage['/base/create.js'].lineData[101] = 0;
  _$jscoverage['/base/create.js'].lineData[104] = 0;
  _$jscoverage['/base/create.js'].lineData[105] = 0;
  _$jscoverage['/base/create.js'].lineData[109] = 0;
  _$jscoverage['/base/create.js'].lineData[110] = 0;
  _$jscoverage['/base/create.js'].lineData[113] = 0;
  _$jscoverage['/base/create.js'].lineData[114] = 0;
  _$jscoverage['/base/create.js'].lineData[117] = 0;
  _$jscoverage['/base/create.js'].lineData[118] = 0;
  _$jscoverage['/base/create.js'].lineData[121] = 0;
  _$jscoverage['/base/create.js'].lineData[130] = 0;
  _$jscoverage['/base/create.js'].lineData[131] = 0;
  _$jscoverage['/base/create.js'].lineData[134] = 0;
  _$jscoverage['/base/create.js'].lineData[135] = 0;
  _$jscoverage['/base/create.js'].lineData[140] = 0;
  _$jscoverage['/base/create.js'].lineData[142] = 0;
  _$jscoverage['/base/create.js'].lineData[143] = 0;
  _$jscoverage['/base/create.js'].lineData[146] = 0;
  _$jscoverage['/base/create.js'].lineData[148] = 0;
  _$jscoverage['/base/create.js'].lineData[150] = 0;
  _$jscoverage['/base/create.js'].lineData[153] = 0;
  _$jscoverage['/base/create.js'].lineData[155] = 0;
  _$jscoverage['/base/create.js'].lineData[158] = 0;
  _$jscoverage['/base/create.js'].lineData[160] = 0;
  _$jscoverage['/base/create.js'].lineData[162] = 0;
  _$jscoverage['/base/create.js'].lineData[163] = 0;
  _$jscoverage['/base/create.js'].lineData[165] = 0;
  _$jscoverage['/base/create.js'].lineData[167] = 0;
  _$jscoverage['/base/create.js'].lineData[171] = 0;
  _$jscoverage['/base/create.js'].lineData[176] = 0;
  _$jscoverage['/base/create.js'].lineData[177] = 0;
  _$jscoverage['/base/create.js'].lineData[178] = 0;
  _$jscoverage['/base/create.js'].lineData[198] = 0;
  _$jscoverage['/base/create.js'].lineData[203] = 0;
  _$jscoverage['/base/create.js'].lineData[204] = 0;
  _$jscoverage['/base/create.js'].lineData[207] = 0;
  _$jscoverage['/base/create.js'].lineData[209] = 0;
  _$jscoverage['/base/create.js'].lineData[210] = 0;
  _$jscoverage['/base/create.js'].lineData[211] = 0;
  _$jscoverage['/base/create.js'].lineData[212] = 0;
  _$jscoverage['/base/create.js'].lineData[213] = 0;
  _$jscoverage['/base/create.js'].lineData[214] = 0;
  _$jscoverage['/base/create.js'].lineData[216] = 0;
  _$jscoverage['/base/create.js'].lineData[221] = 0;
  _$jscoverage['/base/create.js'].lineData[225] = 0;
  _$jscoverage['/base/create.js'].lineData[228] = 0;
  _$jscoverage['/base/create.js'].lineData[229] = 0;
  _$jscoverage['/base/create.js'].lineData[230] = 0;
  _$jscoverage['/base/create.js'].lineData[231] = 0;
  _$jscoverage['/base/create.js'].lineData[232] = 0;
  _$jscoverage['/base/create.js'].lineData[233] = 0;
  _$jscoverage['/base/create.js'].lineData[236] = 0;
  _$jscoverage['/base/create.js'].lineData[244] = 0;
  _$jscoverage['/base/create.js'].lineData[245] = 0;
  _$jscoverage['/base/create.js'].lineData[246] = 0;
  _$jscoverage['/base/create.js'].lineData[247] = 0;
  _$jscoverage['/base/create.js'].lineData[250] = 0;
  _$jscoverage['/base/create.js'].lineData[262] = 0;
  _$jscoverage['/base/create.js'].lineData[268] = 0;
  _$jscoverage['/base/create.js'].lineData[269] = 0;
  _$jscoverage['/base/create.js'].lineData[272] = 0;
  _$jscoverage['/base/create.js'].lineData[273] = 0;
  _$jscoverage['/base/create.js'].lineData[274] = 0;
  _$jscoverage['/base/create.js'].lineData[276] = 0;
  _$jscoverage['/base/create.js'].lineData[277] = 0;
  _$jscoverage['/base/create.js'].lineData[278] = 0;
  _$jscoverage['/base/create.js'].lineData[281] = 0;
  _$jscoverage['/base/create.js'].lineData[282] = 0;
  _$jscoverage['/base/create.js'].lineData[283] = 0;
  _$jscoverage['/base/create.js'].lineData[284] = 0;
  _$jscoverage['/base/create.js'].lineData[285] = 0;
  _$jscoverage['/base/create.js'].lineData[286] = 0;
  _$jscoverage['/base/create.js'].lineData[287] = 0;
  _$jscoverage['/base/create.js'].lineData[291] = 0;
  _$jscoverage['/base/create.js'].lineData[292] = 0;
  _$jscoverage['/base/create.js'].lineData[293] = 0;
  _$jscoverage['/base/create.js'].lineData[296] = 0;
  _$jscoverage['/base/create.js'].lineData[305] = 0;
  _$jscoverage['/base/create.js'].lineData[310] = 0;
  _$jscoverage['/base/create.js'].lineData[311] = 0;
  _$jscoverage['/base/create.js'].lineData[312] = 0;
  _$jscoverage['/base/create.js'].lineData[313] = 0;
  _$jscoverage['/base/create.js'].lineData[314] = 0;
  _$jscoverage['/base/create.js'].lineData[315] = 0;
  _$jscoverage['/base/create.js'].lineData[316] = 0;
  _$jscoverage['/base/create.js'].lineData[317] = 0;
  _$jscoverage['/base/create.js'].lineData[325] = 0;
  _$jscoverage['/base/create.js'].lineData[349] = 0;
  _$jscoverage['/base/create.js'].lineData[350] = 0;
  _$jscoverage['/base/create.js'].lineData[351] = 0;
  _$jscoverage['/base/create.js'].lineData[352] = 0;
  _$jscoverage['/base/create.js'].lineData[355] = 0;
  _$jscoverage['/base/create.js'].lineData[360] = 0;
  _$jscoverage['/base/create.js'].lineData[361] = 0;
  _$jscoverage['/base/create.js'].lineData[364] = 0;
  _$jscoverage['/base/create.js'].lineData[370] = 0;
  _$jscoverage['/base/create.js'].lineData[374] = 0;
  _$jscoverage['/base/create.js'].lineData[381] = 0;
  _$jscoverage['/base/create.js'].lineData[382] = 0;
  _$jscoverage['/base/create.js'].lineData[385] = 0;
  _$jscoverage['/base/create.js'].lineData[386] = 0;
  _$jscoverage['/base/create.js'].lineData[390] = 0;
  _$jscoverage['/base/create.js'].lineData[391] = 0;
  _$jscoverage['/base/create.js'].lineData[392] = 0;
  _$jscoverage['/base/create.js'].lineData[393] = 0;
  _$jscoverage['/base/create.js'].lineData[396] = 0;
  _$jscoverage['/base/create.js'].lineData[404] = 0;
  _$jscoverage['/base/create.js'].lineData[406] = 0;
  _$jscoverage['/base/create.js'].lineData[407] = 0;
  _$jscoverage['/base/create.js'].lineData[408] = 0;
  _$jscoverage['/base/create.js'].lineData[416] = 0;
  _$jscoverage['/base/create.js'].lineData[418] = 0;
  _$jscoverage['/base/create.js'].lineData[419] = 0;
  _$jscoverage['/base/create.js'].lineData[420] = 0;
  _$jscoverage['/base/create.js'].lineData[421] = 0;
  _$jscoverage['/base/create.js'].lineData[424] = 0;
  _$jscoverage['/base/create.js'].lineData[425] = 0;
  _$jscoverage['/base/create.js'].lineData[426] = 0;
  _$jscoverage['/base/create.js'].lineData[428] = 0;
  _$jscoverage['/base/create.js'].lineData[430] = 0;
  _$jscoverage['/base/create.js'].lineData[431] = 0;
  _$jscoverage['/base/create.js'].lineData[434] = 0;
  _$jscoverage['/base/create.js'].lineData[435] = 0;
  _$jscoverage['/base/create.js'].lineData[436] = 0;
  _$jscoverage['/base/create.js'].lineData[438] = 0;
  _$jscoverage['/base/create.js'].lineData[444] = 0;
  _$jscoverage['/base/create.js'].lineData[445] = 0;
  _$jscoverage['/base/create.js'].lineData[449] = 0;
  _$jscoverage['/base/create.js'].lineData[450] = 0;
  _$jscoverage['/base/create.js'].lineData[453] = 0;
  _$jscoverage['/base/create.js'].lineData[456] = 0;
  _$jscoverage['/base/create.js'].lineData[457] = 0;
  _$jscoverage['/base/create.js'].lineData[461] = 0;
  _$jscoverage['/base/create.js'].lineData[463] = 0;
  _$jscoverage['/base/create.js'].lineData[468] = 0;
  _$jscoverage['/base/create.js'].lineData[469] = 0;
  _$jscoverage['/base/create.js'].lineData[470] = 0;
  _$jscoverage['/base/create.js'].lineData[471] = 0;
  _$jscoverage['/base/create.js'].lineData[474] = 0;
  _$jscoverage['/base/create.js'].lineData[475] = 0;
  _$jscoverage['/base/create.js'].lineData[478] = 0;
  _$jscoverage['/base/create.js'].lineData[482] = 0;
  _$jscoverage['/base/create.js'].lineData[483] = 0;
  _$jscoverage['/base/create.js'].lineData[487] = 0;
  _$jscoverage['/base/create.js'].lineData[488] = 0;
  _$jscoverage['/base/create.js'].lineData[489] = 0;
  _$jscoverage['/base/create.js'].lineData[490] = 0;
  _$jscoverage['/base/create.js'].lineData[491] = 0;
  _$jscoverage['/base/create.js'].lineData[492] = 0;
  _$jscoverage['/base/create.js'].lineData[495] = 0;
  _$jscoverage['/base/create.js'].lineData[497] = 0;
  _$jscoverage['/base/create.js'].lineData[501] = 0;
  _$jscoverage['/base/create.js'].lineData[517] = 0;
  _$jscoverage['/base/create.js'].lineData[518] = 0;
  _$jscoverage['/base/create.js'].lineData[519] = 0;
  _$jscoverage['/base/create.js'].lineData[520] = 0;
  _$jscoverage['/base/create.js'].lineData[528] = 0;
  _$jscoverage['/base/create.js'].lineData[529] = 0;
  _$jscoverage['/base/create.js'].lineData[532] = 0;
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
  _$jscoverage['/base/create.js'].branchData['11'] = [];
  _$jscoverage['/base/create.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['14'] = [];
  _$jscoverage['/base/create.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['19'] = [];
  _$jscoverage['/base/create.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['19'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['22'] = [];
  _$jscoverage['/base/create.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['31'] = [];
  _$jscoverage['/base/create.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['31'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['34'] = [];
  _$jscoverage['/base/create.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['63'] = [];
  _$jscoverage['/base/create.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['68'] = [];
  _$jscoverage['/base/create.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['68'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['70'] = [];
  _$jscoverage['/base/create.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['100'] = [];
  _$jscoverage['/base/create.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['104'] = [];
  _$jscoverage['/base/create.js'].branchData['104'][1] = new BranchData();
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
  _$jscoverage['/base/create.js'].branchData['142'] = [];
  _$jscoverage['/base/create.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['146'] = [];
  _$jscoverage['/base/create.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['148'] = [];
  _$jscoverage['/base/create.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['153'] = [];
  _$jscoverage['/base/create.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['153'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['160'] = [];
  _$jscoverage['/base/create.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['163'] = [];
  _$jscoverage['/base/create.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['176'] = [];
  _$jscoverage['/base/create.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['203'] = [];
  _$jscoverage['/base/create.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['207'] = [];
  _$jscoverage['/base/create.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['209'] = [];
  _$jscoverage['/base/create.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['211'] = [];
  _$jscoverage['/base/create.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['225'] = [];
  _$jscoverage['/base/create.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['226'] = [];
  _$jscoverage['/base/create.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['226'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['226'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['229'] = [];
  _$jscoverage['/base/create.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['231'] = [];
  _$jscoverage['/base/create.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['244'] = [];
  _$jscoverage['/base/create.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['268'] = [];
  _$jscoverage['/base/create.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['272'] = [];
  _$jscoverage['/base/create.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['273'] = [];
  _$jscoverage['/base/create.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['273'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['282'] = [];
  _$jscoverage['/base/create.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['283'] = [];
  _$jscoverage['/base/create.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['285'] = [];
  _$jscoverage['/base/create.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['310'] = [];
  _$jscoverage['/base/create.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['312'] = [];
  _$jscoverage['/base/create.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['312'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['316'] = [];
  _$jscoverage['/base/create.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['349'] = [];
  _$jscoverage['/base/create.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['360'] = [];
  _$jscoverage['/base/create.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['374'] = [];
  _$jscoverage['/base/create.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['374'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['375'] = [];
  _$jscoverage['/base/create.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['381'] = [];
  _$jscoverage['/base/create.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['381'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['385'] = [];
  _$jscoverage['/base/create.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['390'] = [];
  _$jscoverage['/base/create.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['392'] = [];
  _$jscoverage['/base/create.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['406'] = [];
  _$jscoverage['/base/create.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['420'] = [];
  _$jscoverage['/base/create.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['425'] = [];
  _$jscoverage['/base/create.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['430'] = [];
  _$jscoverage['/base/create.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['435'] = [];
  _$jscoverage['/base/create.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['449'] = [];
  _$jscoverage['/base/create.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['449'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['461'] = [];
  _$jscoverage['/base/create.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['469'] = [];
  _$jscoverage['/base/create.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['470'] = [];
  _$jscoverage['/base/create.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['474'] = [];
  _$jscoverage['/base/create.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['487'] = [];
  _$jscoverage['/base/create.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['487'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['487'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['491'] = [];
  _$jscoverage['/base/create.js'].branchData['491'][1] = new BranchData();
}
_$jscoverage['/base/create.js'].branchData['491'][1].init(189, 7, 'i < len');
function visit186_491_1(result) {
  _$jscoverage['/base/create.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['487'][3].init(106, 24, 'nodes.push || nodes.item');
function visit185_487_3(result) {
  _$jscoverage['/base/create.js'].branchData['487'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['487'][2].init(106, 37, '(nodes.push || nodes.item) && nodes[0]');
function visit184_487_2(result) {
  _$jscoverage['/base/create.js'].branchData['487'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['487'][1].init(96, 47, 'nodes && (nodes.push || nodes.item) && nodes[0]');
function visit183_487_1(result) {
  _$jscoverage['/base/create.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['474'][1].init(178, 48, 'elem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit182_474_1(result) {
  _$jscoverage['/base/create.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['470'][1].init(18, 38, 'elem.nodeType == NodeType.ELEMENT_NODE');
function visit181_470_1(result) {
  _$jscoverage['/base/create.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['469'][1].init(14, 22, 'S.isPlainObject(props)');
function visit180_469_1(result) {
  _$jscoverage['/base/create.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['461'][1].init(384, 8, 'DOMEvent');
function visit179_461_1(result) {
  _$jscoverage['/base/create.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['449'][2].init(102, 38, 'dest.nodeType == NodeType.ELEMENT_NODE');
function visit178_449_2(result) {
  _$jscoverage['/base/create.js'].branchData['449'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['449'][1].init(102, 59, 'dest.nodeType == NodeType.ELEMENT_NODE && !Dom.hasData(src)');
function visit177_449_1(result) {
  _$jscoverage['/base/create.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['435'][1].init(22, 21, 'cloneChildren[cIndex]');
function visit176_435_1(result) {
  _$jscoverage['/base/create.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['430'][1].init(446, 37, 'elemNodeType == NodeType.ELEMENT_NODE');
function visit175_430_1(result) {
  _$jscoverage['/base/create.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['425'][1].init(22, 15, 'cloneCs[fIndex]');
function visit174_425_1(result) {
  _$jscoverage['/base/create.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['420'][1].init(57, 47, 'elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit173_420_1(result) {
  _$jscoverage['/base/create.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['406'][1].init(119, 6, 'i >= 0');
function visit172_406_1(result) {
  _$jscoverage['/base/create.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['392'][1].init(83, 28, 'deep && deepWithDataAndEvent');
function visit171_392_1(result) {
  _$jscoverage['/base/create.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['390'][1].init(1778, 16, 'withDataAndEvent');
function visit170_390_1(result) {
  _$jscoverage['/base/create.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['385'][1].init(584, 27, 'deep && _fixCloneAttributes');
function visit169_385_1(result) {
  _$jscoverage['/base/create.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['381'][2].init(434, 37, 'elemNodeType == NodeType.ELEMENT_NODE');
function visit168_381_2(result) {
  _$jscoverage['/base/create.js'].branchData['381'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['381'][1].init(411, 60, '_fixCloneAttributes && elemNodeType == NodeType.ELEMENT_NODE');
function visit167_381_1(result) {
  _$jscoverage['/base/create.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['375'][1].init(61, 47, 'elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit166_375_1(result) {
  _$jscoverage['/base/create.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['374'][2].init(882, 37, 'elemNodeType == NodeType.ELEMENT_NODE');
function visit165_374_2(result) {
  _$jscoverage['/base/create.js'].branchData['374'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['374'][1].init(882, 109, 'elemNodeType == NodeType.ELEMENT_NODE || elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit164_374_1(result) {
  _$jscoverage['/base/create.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['360'][1].init(454, 5, '!elem');
function visit163_360_1(result) {
  _$jscoverage['/base/create.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['349'][1].init(22, 24, 'typeof deep === \'object\'');
function visit162_349_1(result) {
  _$jscoverage['/base/create.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['316'][1].init(190, 8, 'DOMEvent');
function visit161_316_1(result) {
  _$jscoverage['/base/create.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['312'][2].init(73, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit160_312_2(result) {
  _$jscoverage['/base/create.js'].branchData['312'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['312'][1].init(60, 49, '!keepData && el.nodeType == NodeType.ELEMENT_NODE');
function visit159_312_1(result) {
  _$jscoverage['/base/create.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['310'][1].init(222, 6, 'i >= 0');
function visit158_310_1(result) {
  _$jscoverage['/base/create.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['285'][1].init(76, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit157_285_1(result) {
  _$jscoverage['/base/create.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['283'][1].init(47, 6, 'i >= 0');
function visit156_283_1(result) {
  _$jscoverage['/base/create.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['282'][1].init(65, 64, '!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML');
function visit155_282_1(result) {
  _$jscoverage['/base/create.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['273'][2].init(46, 41, 'el.nodeType != Dom.DOCUMENT_FRAGMENT_NODE');
function visit154_273_2(result) {
  _$jscoverage['/base/create.js'].branchData['273'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['273'][1].init(26, 61, 'supportOuterHTML && el.nodeType != Dom.DOCUMENT_FRAGMENT_NODE');
function visit153_273_1(result) {
  _$jscoverage['/base/create.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['272'][1].init(337, 24, 'htmlString === undefined');
function visit152_272_1(result) {
  _$jscoverage['/base/create.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['268'][1].init(229, 3, '!el');
function visit151_268_1(result) {
  _$jscoverage['/base/create.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['244'][1].init(1113, 8, '!success');
function visit150_244_1(result) {
  _$jscoverage['/base/create.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['231'][1].init(86, 38, 'elem.nodeType == NodeType.ELEMENT_NODE');
function visit149_231_1(result) {
  _$jscoverage['/base/create.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['229'][1].init(55, 6, 'i >= 0');
function visit148_229_1(result) {
  _$jscoverage['/base/create.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['226'][3].init(347, 36, 'htmlString.match(RE_TAG) || [\'\', \'\']');
function visit147_226_3(result) {
  _$jscoverage['/base/create.js'].branchData['226'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['226'][2].init(258, 69, '!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)');
function visit146_226_2(result) {
  _$jscoverage['/base/create.js'].branchData['226'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['226'][1].init(73, 145, '(!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[(htmlString.match(RE_TAG) || [\'\', \'\'])[1].toLowerCase()]');
function visit145_226_1(result) {
  _$jscoverage['/base/create.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['225'][1].init(182, 219, '!htmlString.match(/<(?:script|style|link)/i) && (!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[(htmlString.match(RE_TAG) || [\'\', \'\'])[1].toLowerCase()]');
function visit144_225_1(result) {
  _$jscoverage['/base/create.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['211'][1].init(215, 46, 'el.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit143_211_1(result) {
  _$jscoverage['/base/create.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['209'][1].init(96, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit142_209_1(result) {
  _$jscoverage['/base/create.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['207'][1].init(366, 24, 'htmlString === undefined');
function visit141_207_1(result) {
  _$jscoverage['/base/create.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['203'][1].init(258, 3, '!el');
function visit140_203_1(result) {
  _$jscoverage['/base/create.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['176'][1].init(97, 32, 'Dom.nodeName(src) === \'textarea\'');
function visit139_176_1(result) {
  _$jscoverage['/base/create.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['163'][1].init(1249, 12, 'nodes.length');
function visit138_163_1(result) {
  _$jscoverage['/base/create.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['160'][1].init(1030, 18, 'nodes.length === 1');
function visit137_160_1(result) {
  _$jscoverage['/base/create.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['153'][2].init(744, 93, '/\\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))');
function visit136_153_2(result) {
  _$jscoverage['/base/create.js'].branchData['153'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['153'][1].init(715, 122, 'lostLeadingTailWhitespace && /\\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))');
function visit135_153_1(result) {
  _$jscoverage['/base/create.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['148'][1].init(419, 106, 'lostLeadingTailWhitespace && (whitespaceMatch = html.match(R_LEADING_WHITESPACE))');
function visit134_148_1(result) {
  _$jscoverage['/base/create.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['146'][1].init(309, 31, 'creators[tag] || defaultCreator');
function visit133_146_1(result) {
  _$jscoverage['/base/create.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['142'][1].init(165, 36, '(m = RE_TAG.exec(html)) && (k = m[1])');
function visit132_142_1(result) {
  _$jscoverage['/base/create.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['130'][1].init(814, 18, '!R_HTML.test(html)');
function visit131_130_1(result) {
  _$jscoverage['/base/create.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['124'][1].init(127, 15, 'ownerDoc || doc');
function visit130_124_1(result) {
  _$jscoverage['/base/create.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['117'][1].init(449, 5, '_trim');
function visit129_117_1(result) {
  _$jscoverage['/base/create.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['113'][1].init(349, 19, '_trim === undefined');
function visit128_113_1(result) {
  _$jscoverage['/base/create.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['109'][1].init(247, 23, 'typeof html != \'string\'');
function visit127_109_1(result) {
  _$jscoverage['/base/create.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['104'][1].init(141, 13, 'html.nodeType');
function visit126_104_1(result) {
  _$jscoverage['/base/create.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['100'][1].init(57, 5, '!html');
function visit125_100_1(result) {
  _$jscoverage['/base/create.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['70'][1].init(137, 15, 'node.firstChild');
function visit124_70_1(result) {
  _$jscoverage['/base/create.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['68'][2].init(521, 49, 'parent[\'canHaveChildren\'] && "removeNode" in node');
function visit123_68_2(result) {
  _$jscoverage['/base/create.js'].branchData['68'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['68'][1].init(512, 58, 'oldIE && parent[\'canHaveChildren\'] && "removeNode" in node');
function visit122_68_1(result) {
  _$jscoverage['/base/create.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['63'][1].init(14, 6, 'parent');
function visit121_63_1(result) {
  _$jscoverage['/base/create.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['34'][1].init(135, 22, 'holder === DEFAULT_DIV');
function visit120_34_1(result) {
  _$jscoverage['/base/create.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['31'][2].init(35, 15, 'ownerDoc != doc');
function visit119_31_2(result) {
  _$jscoverage['/base/create.js'].branchData['31'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['31'][1].init(23, 27, 'ownerDoc && ownerDoc != doc');
function visit118_31_1(result) {
  _$jscoverage['/base/create.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['22'][1].init(630, 41, 'doc && \'outerHTML\' in doc.documentElement');
function visit117_22_1(result) {
  _$jscoverage['/base/create.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['19'][2].init(518, 6, 'ie < 9');
function visit116_19_2(result) {
  _$jscoverage['/base/create.js'].branchData['19'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['19'][1].init(512, 12, 'ie && ie < 9');
function visit115_19_1(result) {
  _$jscoverage['/base/create.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['14'][1].init(255, 29, 'doc && doc.createElement(DIV)');
function visit114_14_1(result) {
  _$jscoverage['/base/create.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['11'][1].init(138, 33, 'document.documentMode || UA[\'ie\']');
function visit113_11_1(result) {
  _$jscoverage['/base/create.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].lineData[6]++;
KISSY.add('dom/base/create', function(S, Dom, undefined) {
  _$jscoverage['/base/create.js'].functionData[0]++;
  _$jscoverage['/base/create.js'].lineData[7]++;
  var doc = S.Env.host.document, NodeType = Dom.NodeType, UA = S.UA, logger = S.getLogger('s/dom'), ie = visit113_11_1(document.documentMode || UA['ie']), DIV = 'div', PARENT_NODE = 'parentNode', DEFAULT_DIV = visit114_14_1(doc && doc.createElement(DIV)), R_XHTML_TAG = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig, RE_TAG = /<([\w:]+)/, R_LEADING_WHITESPACE = /^\s+/, R_TAIL_WHITESPACE = /\s+$/, oldIE = !!(visit115_19_1(ie && visit116_19_2(ie < 9))), lostLeadingTailWhitespace = oldIE, R_HTML = /<|&#?\w+;/, supportOuterHTML = visit117_22_1(doc && 'outerHTML' in doc.documentElement), RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
  _$jscoverage['/base/create.js'].lineData[26]++;
  function getElementsByTagName(el, tag) {
    _$jscoverage['/base/create.js'].functionData[1]++;
    _$jscoverage['/base/create.js'].lineData[27]++;
    return el.getElementsByTagName(tag);
  }
  _$jscoverage['/base/create.js'].lineData[30]++;
  function getHolderDiv(ownerDoc) {
    _$jscoverage['/base/create.js'].functionData[2]++;
    _$jscoverage['/base/create.js'].lineData[31]++;
    var holder = visit118_31_1(ownerDoc && visit119_31_2(ownerDoc != doc)) ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
    _$jscoverage['/base/create.js'].lineData[34]++;
    if (visit120_34_1(holder === DEFAULT_DIV)) {
      _$jscoverage['/base/create.js'].lineData[35]++;
      holder.innerHTML = '';
    }
    _$jscoverage['/base/create.js'].lineData[37]++;
    return holder;
  }
  _$jscoverage['/base/create.js'].lineData[40]++;
  function defaultCreator(html, ownerDoc) {
    _$jscoverage['/base/create.js'].functionData[3]++;
    _$jscoverage['/base/create.js'].lineData[41]++;
    var frag = getHolderDiv(ownerDoc);
    _$jscoverage['/base/create.js'].lineData[43]++;
    frag.innerHTML = 'm<div>' + html + '<' + '/div>';
    _$jscoverage['/base/create.js'].lineData[44]++;
    return frag.lastChild;
  }
  _$jscoverage['/base/create.js'].lineData[47]++;
  function _empty(node) {
    _$jscoverage['/base/create.js'].functionData[4]++;
    _$jscoverage['/base/create.js'].lineData[48]++;
    try {
      _$jscoverage['/base/create.js'].lineData[50]++;
      node.innerHTML = "";
      _$jscoverage['/base/create.js'].lineData[51]++;
      return;
    }    catch (e) {
}
    _$jscoverage['/base/create.js'].lineData[57]++;
    for (var c; c = node.lastChild; ) {
      _$jscoverage['/base/create.js'].lineData[58]++;
      _destroy(c, node);
    }
  }
  _$jscoverage['/base/create.js'].lineData[62]++;
  function _destroy(node, parent) {
    _$jscoverage['/base/create.js'].functionData[5]++;
    _$jscoverage['/base/create.js'].lineData[63]++;
    if (visit121_63_1(parent)) {
      _$jscoverage['/base/create.js'].lineData[68]++;
      if (visit122_68_1(oldIE && visit123_68_2(parent['canHaveChildren'] && "removeNode" in node))) {
        _$jscoverage['/base/create.js'].lineData[70]++;
        if (visit124_70_1(node.firstChild)) {
          _$jscoverage['/base/create.js'].lineData[71]++;
          _empty(node);
        }
        _$jscoverage['/base/create.js'].lineData[73]++;
        node['removeNode'](false);
      } else {
        _$jscoverage['/base/create.js'].lineData[75]++;
        parent.removeChild(node);
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[80]++;
  S.mix(Dom, {
  create: function(html, props, ownerDoc, _trim) {
  _$jscoverage['/base/create.js'].functionData[6]++;
  _$jscoverage['/base/create.js'].lineData[98]++;
  var ret = null;
  _$jscoverage['/base/create.js'].lineData[100]++;
  if (visit125_100_1(!html)) {
    _$jscoverage['/base/create.js'].lineData[101]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[104]++;
  if (visit126_104_1(html.nodeType)) {
    _$jscoverage['/base/create.js'].lineData[105]++;
    return Dom.clone(html);
  }
  _$jscoverage['/base/create.js'].lineData[109]++;
  if (visit127_109_1(typeof html != 'string')) {
    _$jscoverage['/base/create.js'].lineData[110]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[113]++;
  if (visit128_113_1(_trim === undefined)) {
    _$jscoverage['/base/create.js'].lineData[114]++;
    _trim = true;
  }
  _$jscoverage['/base/create.js'].lineData[117]++;
  if (visit129_117_1(_trim)) {
    _$jscoverage['/base/create.js'].lineData[118]++;
    html = S.trim(html);
  }
  _$jscoverage['/base/create.js'].lineData[121]++;
  var creators = Dom._creators, holder, whitespaceMatch, context = visit130_124_1(ownerDoc || doc), m, tag = DIV, k, nodes;
  _$jscoverage['/base/create.js'].lineData[130]++;
  if (visit131_130_1(!R_HTML.test(html))) {
    _$jscoverage['/base/create.js'].lineData[131]++;
    ret = context.createTextNode(html);
  } else {
    _$jscoverage['/base/create.js'].lineData[134]++;
    if ((m = RE_SIMPLE_TAG.exec(html))) {
      _$jscoverage['/base/create.js'].lineData[135]++;
      ret = context.createElement(m[1]);
    } else {
      _$jscoverage['/base/create.js'].lineData[140]++;
      html = html.replace(R_XHTML_TAG, '<$1><' + '/$2>');
      _$jscoverage['/base/create.js'].lineData[142]++;
      if (visit132_142_1((m = RE_TAG.exec(html)) && (k = m[1]))) {
        _$jscoverage['/base/create.js'].lineData[143]++;
        tag = k.toLowerCase();
      }
      _$jscoverage['/base/create.js'].lineData[146]++;
      holder = (visit133_146_1(creators[tag] || defaultCreator))(html, context);
      _$jscoverage['/base/create.js'].lineData[148]++;
      if (visit134_148_1(lostLeadingTailWhitespace && (whitespaceMatch = html.match(R_LEADING_WHITESPACE)))) {
        _$jscoverage['/base/create.js'].lineData[150]++;
        holder.insertBefore(context.createTextNode(whitespaceMatch[0]), holder.firstChild);
      }
      _$jscoverage['/base/create.js'].lineData[153]++;
      if (visit135_153_1(lostLeadingTailWhitespace && visit136_153_2(/\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))))) {
        _$jscoverage['/base/create.js'].lineData[155]++;
        holder.appendChild(context.createTextNode(whitespaceMatch[0]));
      }
      _$jscoverage['/base/create.js'].lineData[158]++;
      nodes = holder.childNodes;
      _$jscoverage['/base/create.js'].lineData[160]++;
      if (visit137_160_1(nodes.length === 1)) {
        _$jscoverage['/base/create.js'].lineData[162]++;
        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
      } else {
        _$jscoverage['/base/create.js'].lineData[163]++;
        if (visit138_163_1(nodes.length)) {
          _$jscoverage['/base/create.js'].lineData[165]++;
          ret = nodeListToFragment(nodes);
        } else {
          _$jscoverage['/base/create.js'].lineData[167]++;
          S.error(html + ' : create node error');
        }
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[171]++;
  return attachProps(ret, props);
}, 
  _fixCloneAttributes: function(src, dest) {
  _$jscoverage['/base/create.js'].functionData[7]++;
  _$jscoverage['/base/create.js'].lineData[176]++;
  if (visit139_176_1(Dom.nodeName(src) === 'textarea')) {
    _$jscoverage['/base/create.js'].lineData[177]++;
    dest.defaultValue = src.defaultValue;
    _$jscoverage['/base/create.js'].lineData[178]++;
    dest.value = src.value;
  }
}, 
  _creators: {
  div: defaultCreator}, 
  _defaultCreator: defaultCreator, 
  html: function(selector, htmlString, loadScripts) {
  _$jscoverage['/base/create.js'].functionData[8]++;
  _$jscoverage['/base/create.js'].lineData[198]++;
  var els = Dom.query(selector), el = els[0], success = false, valNode, i, elem;
  _$jscoverage['/base/create.js'].lineData[203]++;
  if (visit140_203_1(!el)) {
    _$jscoverage['/base/create.js'].lineData[204]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[207]++;
  if (visit141_207_1(htmlString === undefined)) {
    _$jscoverage['/base/create.js'].lineData[209]++;
    if (visit142_209_1(el.nodeType == NodeType.ELEMENT_NODE)) {
      _$jscoverage['/base/create.js'].lineData[210]++;
      return el.innerHTML;
    } else {
      _$jscoverage['/base/create.js'].lineData[211]++;
      if (visit143_211_1(el.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[212]++;
        var holder = getHolderDiv(el.ownerDocument);
        _$jscoverage['/base/create.js'].lineData[213]++;
        holder.appendChild(el);
        _$jscoverage['/base/create.js'].lineData[214]++;
        return holder.innerHTML;
      } else {
        _$jscoverage['/base/create.js'].lineData[216]++;
        return null;
      }
    }
  } else {
    _$jscoverage['/base/create.js'].lineData[221]++;
    htmlString += '';
    _$jscoverage['/base/create.js'].lineData[225]++;
    if (visit144_225_1(!htmlString.match(/<(?:script|style|link)/i) && visit145_226_1((visit146_226_2(!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE))) && !creatorsMap[(visit147_226_3(htmlString.match(RE_TAG) || ['', '']))[1].toLowerCase()]))) {
      _$jscoverage['/base/create.js'].lineData[228]++;
      try {
        _$jscoverage['/base/create.js'].lineData[229]++;
        for (i = els.length - 1; visit148_229_1(i >= 0); i--) {
          _$jscoverage['/base/create.js'].lineData[230]++;
          elem = els[i];
          _$jscoverage['/base/create.js'].lineData[231]++;
          if (visit149_231_1(elem.nodeType == NodeType.ELEMENT_NODE)) {
            _$jscoverage['/base/create.js'].lineData[232]++;
            Dom.cleanData(getElementsByTagName(elem, '*'));
            _$jscoverage['/base/create.js'].lineData[233]++;
            elem.innerHTML = htmlString;
          }
        }
        _$jscoverage['/base/create.js'].lineData[236]++;
        success = true;
      }      catch (e) {
}
    }
    _$jscoverage['/base/create.js'].lineData[244]++;
    if (visit150_244_1(!success)) {
      _$jscoverage['/base/create.js'].lineData[245]++;
      valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
      _$jscoverage['/base/create.js'].lineData[246]++;
      Dom.empty(els);
      _$jscoverage['/base/create.js'].lineData[247]++;
      Dom.append(valNode, els, loadScripts);
    }
  }
  _$jscoverage['/base/create.js'].lineData[250]++;
  return undefined;
}, 
  outerHtml: function(selector, htmlString, loadScripts) {
  _$jscoverage['/base/create.js'].functionData[9]++;
  _$jscoverage['/base/create.js'].lineData[262]++;
  var els = Dom.query(selector), holder, i, valNode, length = els.length, el = els[0];
  _$jscoverage['/base/create.js'].lineData[268]++;
  if (visit151_268_1(!el)) {
    _$jscoverage['/base/create.js'].lineData[269]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[272]++;
  if (visit152_272_1(htmlString === undefined)) {
    _$jscoverage['/base/create.js'].lineData[273]++;
    if (visit153_273_1(supportOuterHTML && visit154_273_2(el.nodeType != Dom.DOCUMENT_FRAGMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[274]++;
      return el.outerHTML;
    } else {
      _$jscoverage['/base/create.js'].lineData[276]++;
      holder = getHolderDiv(el.ownerDocument);
      _$jscoverage['/base/create.js'].lineData[277]++;
      holder.appendChild(Dom.clone(el, true));
      _$jscoverage['/base/create.js'].lineData[278]++;
      return holder.innerHTML;
    }
  } else {
    _$jscoverage['/base/create.js'].lineData[281]++;
    htmlString += '';
    _$jscoverage['/base/create.js'].lineData[282]++;
    if (visit155_282_1(!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML)) {
      _$jscoverage['/base/create.js'].lineData[283]++;
      for (i = length - 1; visit156_283_1(i >= 0); i--) {
        _$jscoverage['/base/create.js'].lineData[284]++;
        el = els[i];
        _$jscoverage['/base/create.js'].lineData[285]++;
        if (visit157_285_1(el.nodeType == NodeType.ELEMENT_NODE)) {
          _$jscoverage['/base/create.js'].lineData[286]++;
          Dom.cleanData(el, 1);
          _$jscoverage['/base/create.js'].lineData[287]++;
          el.outerHTML = htmlString;
        }
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[291]++;
      valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
      _$jscoverage['/base/create.js'].lineData[292]++;
      Dom.insertBefore(valNode, els, loadScripts);
      _$jscoverage['/base/create.js'].lineData[293]++;
      Dom.remove(els);
    }
  }
  _$jscoverage['/base/create.js'].lineData[296]++;
  return undefined;
}, 
  remove: function(selector, keepData) {
  _$jscoverage['/base/create.js'].functionData[10]++;
  _$jscoverage['/base/create.js'].lineData[305]++;
  var el, els = Dom.query(selector), all, DOMEvent = S.require('event/dom'), i;
  _$jscoverage['/base/create.js'].lineData[310]++;
  for (i = els.length - 1; visit158_310_1(i >= 0); i--) {
    _$jscoverage['/base/create.js'].lineData[311]++;
    el = els[i];
    _$jscoverage['/base/create.js'].lineData[312]++;
    if (visit159_312_1(!keepData && visit160_312_2(el.nodeType == NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[313]++;
      all = S.makeArray(getElementsByTagName(el, '*'));
      _$jscoverage['/base/create.js'].lineData[314]++;
      all.push(el);
      _$jscoverage['/base/create.js'].lineData[315]++;
      Dom.removeData(all);
      _$jscoverage['/base/create.js'].lineData[316]++;
      if (visit161_316_1(DOMEvent)) {
        _$jscoverage['/base/create.js'].lineData[317]++;
        DOMEvent.detach(all);
      }
    }
    _$jscoverage['/base/create.js'].lineData[325]++;
    _destroy(el, el.parentNode);
  }
}, 
  clone: function(selector, deep, withDataAndEvent, deepWithDataAndEvent) {
  _$jscoverage['/base/create.js'].functionData[11]++;
  _$jscoverage['/base/create.js'].lineData[349]++;
  if (visit162_349_1(typeof deep === 'object')) {
    _$jscoverage['/base/create.js'].lineData[350]++;
    deepWithDataAndEvent = deep['deepWithDataAndEvent'];
    _$jscoverage['/base/create.js'].lineData[351]++;
    withDataAndEvent = deep['withDataAndEvent'];
    _$jscoverage['/base/create.js'].lineData[352]++;
    deep = deep['deep'];
  }
  _$jscoverage['/base/create.js'].lineData[355]++;
  var elem = Dom.get(selector), clone, _fixCloneAttributes = Dom._fixCloneAttributes, elemNodeType;
  _$jscoverage['/base/create.js'].lineData[360]++;
  if (visit163_360_1(!elem)) {
    _$jscoverage['/base/create.js'].lineData[361]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[364]++;
  elemNodeType = elem.nodeType;
  _$jscoverage['/base/create.js'].lineData[370]++;
  clone = elem.cloneNode(deep);
  _$jscoverage['/base/create.js'].lineData[374]++;
  if (visit164_374_1(visit165_374_2(elemNodeType == NodeType.ELEMENT_NODE) || visit166_375_1(elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE))) {
    _$jscoverage['/base/create.js'].lineData[381]++;
    if (visit167_381_1(_fixCloneAttributes && visit168_381_2(elemNodeType == NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[382]++;
      _fixCloneAttributes(elem, clone);
    }
    _$jscoverage['/base/create.js'].lineData[385]++;
    if (visit169_385_1(deep && _fixCloneAttributes)) {
      _$jscoverage['/base/create.js'].lineData[386]++;
      processAll(_fixCloneAttributes, elem, clone);
    }
  }
  _$jscoverage['/base/create.js'].lineData[390]++;
  if (visit170_390_1(withDataAndEvent)) {
    _$jscoverage['/base/create.js'].lineData[391]++;
    cloneWithDataAndEvent(elem, clone);
    _$jscoverage['/base/create.js'].lineData[392]++;
    if (visit171_392_1(deep && deepWithDataAndEvent)) {
      _$jscoverage['/base/create.js'].lineData[393]++;
      processAll(cloneWithDataAndEvent, elem, clone);
    }
  }
  _$jscoverage['/base/create.js'].lineData[396]++;
  return clone;
}, 
  empty: function(selector) {
  _$jscoverage['/base/create.js'].functionData[12]++;
  _$jscoverage['/base/create.js'].lineData[404]++;
  var els = Dom.query(selector), el, i;
  _$jscoverage['/base/create.js'].lineData[406]++;
  for (i = els.length - 1; visit172_406_1(i >= 0); i--) {
    _$jscoverage['/base/create.js'].lineData[407]++;
    el = els[i];
    _$jscoverage['/base/create.js'].lineData[408]++;
    Dom.remove(el.childNodes);
  }
}, 
  _nodeListToFragment: nodeListToFragment});
  _$jscoverage['/base/create.js'].lineData[416]++;
  Dom.outerHTML = Dom.outerHtml;
  _$jscoverage['/base/create.js'].lineData[418]++;
  function processAll(fn, elem, clone) {
    _$jscoverage['/base/create.js'].functionData[13]++;
    _$jscoverage['/base/create.js'].lineData[419]++;
    var elemNodeType = elem.nodeType;
    _$jscoverage['/base/create.js'].lineData[420]++;
    if (visit173_420_1(elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE)) {
      _$jscoverage['/base/create.js'].lineData[421]++;
      var eCs = elem.childNodes, cloneCs = clone.childNodes, fIndex = 0;
      _$jscoverage['/base/create.js'].lineData[424]++;
      while (eCs[fIndex]) {
        _$jscoverage['/base/create.js'].lineData[425]++;
        if (visit174_425_1(cloneCs[fIndex])) {
          _$jscoverage['/base/create.js'].lineData[426]++;
          processAll(fn, eCs[fIndex], cloneCs[fIndex]);
        }
        _$jscoverage['/base/create.js'].lineData[428]++;
        fIndex++;
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[430]++;
      if (visit175_430_1(elemNodeType == NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[431]++;
        var elemChildren = getElementsByTagName(elem, '*'), cloneChildren = getElementsByTagName(clone, '*'), cIndex = 0;
        _$jscoverage['/base/create.js'].lineData[434]++;
        while (elemChildren[cIndex]) {
          _$jscoverage['/base/create.js'].lineData[435]++;
          if (visit176_435_1(cloneChildren[cIndex])) {
            _$jscoverage['/base/create.js'].lineData[436]++;
            fn(elemChildren[cIndex], cloneChildren[cIndex]);
          }
          _$jscoverage['/base/create.js'].lineData[438]++;
          cIndex++;
        }
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[444]++;
  function cloneWithDataAndEvent(src, dest) {
    _$jscoverage['/base/create.js'].functionData[14]++;
    _$jscoverage['/base/create.js'].lineData[445]++;
    var DOMEvent = S.require('event/dom'), srcData, d;
    _$jscoverage['/base/create.js'].lineData[449]++;
    if (visit177_449_1(visit178_449_2(dest.nodeType == NodeType.ELEMENT_NODE) && !Dom.hasData(src))) {
      _$jscoverage['/base/create.js'].lineData[450]++;
      return;
    }
    _$jscoverage['/base/create.js'].lineData[453]++;
    srcData = Dom.data(src);
    _$jscoverage['/base/create.js'].lineData[456]++;
    for (d in srcData) {
      _$jscoverage['/base/create.js'].lineData[457]++;
      Dom.data(dest, d, srcData[d]);
    }
    _$jscoverage['/base/create.js'].lineData[461]++;
    if (visit179_461_1(DOMEvent)) {
      _$jscoverage['/base/create.js'].lineData[463]++;
      DOMEvent.clone(src, dest);
    }
  }
  _$jscoverage['/base/create.js'].lineData[468]++;
  function attachProps(elem, props) {
    _$jscoverage['/base/create.js'].functionData[15]++;
    _$jscoverage['/base/create.js'].lineData[469]++;
    if (visit180_469_1(S.isPlainObject(props))) {
      _$jscoverage['/base/create.js'].lineData[470]++;
      if (visit181_470_1(elem.nodeType == NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[471]++;
        Dom.attr(elem, props, true);
      } else {
        _$jscoverage['/base/create.js'].lineData[474]++;
        if (visit182_474_1(elem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE)) {
          _$jscoverage['/base/create.js'].lineData[475]++;
          Dom.attr(elem.childNodes, props, true);
        }
      }
    }
    _$jscoverage['/base/create.js'].lineData[478]++;
    return elem;
  }
  _$jscoverage['/base/create.js'].lineData[482]++;
  function nodeListToFragment(nodes) {
    _$jscoverage['/base/create.js'].functionData[16]++;
    _$jscoverage['/base/create.js'].lineData[483]++;
    var ret = null, i, ownerDoc, len;
    _$jscoverage['/base/create.js'].lineData[487]++;
    if (visit183_487_1(nodes && visit184_487_2((visit185_487_3(nodes.push || nodes.item)) && nodes[0]))) {
      _$jscoverage['/base/create.js'].lineData[488]++;
      ownerDoc = nodes[0].ownerDocument;
      _$jscoverage['/base/create.js'].lineData[489]++;
      ret = ownerDoc.createDocumentFragment();
      _$jscoverage['/base/create.js'].lineData[490]++;
      nodes = S.makeArray(nodes);
      _$jscoverage['/base/create.js'].lineData[491]++;
      for (i = 0 , len = nodes.length; visit186_491_1(i < len); i++) {
        _$jscoverage['/base/create.js'].lineData[492]++;
        ret.appendChild(nodes[i]);
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[495]++;
      logger.error('Unable to convert ' + nodes + ' to fragment.');
    }
    _$jscoverage['/base/create.js'].lineData[497]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[501]++;
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
  _$jscoverage['/base/create.js'].lineData[517]++;
  for (p in creatorsMap) {
    _$jscoverage['/base/create.js'].lineData[518]++;
    (function(tag) {
  _$jscoverage['/base/create.js'].functionData[17]++;
  _$jscoverage['/base/create.js'].lineData[519]++;
  creators[p] = function(html, ownerDoc) {
  _$jscoverage['/base/create.js'].functionData[18]++;
  _$jscoverage['/base/create.js'].lineData[520]++;
  return create('<' + tag + '>' + html + '<' + '/' + tag + '>', undefined, ownerDoc);
};
})(creatorsMap[p]);
  }
  _$jscoverage['/base/create.js'].lineData[528]++;
  creatorsMap['option'] = creatorsMap['optgroup'] = function(html, ownerDoc) {
  _$jscoverage['/base/create.js'].functionData[19]++;
  _$jscoverage['/base/create.js'].lineData[529]++;
  return create('<select multiple="multiple">' + html + '</select>', undefined, ownerDoc);
};
  _$jscoverage['/base/create.js'].lineData[532]++;
  return Dom;
}, {
  requires: ['./api']});
