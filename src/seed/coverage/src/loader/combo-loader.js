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
if (! _$jscoverage['/loader/combo-loader.js']) {
  _$jscoverage['/loader/combo-loader.js'] = {};
  _$jscoverage['/loader/combo-loader.js'].lineData = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[6] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[7] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[8] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[12] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[13] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[14] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[18] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[19] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[22] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[23] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[26] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[27] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[34] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[44] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[53] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[54] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[60] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[61] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[62] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[63] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[64] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[65] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[68] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[69] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[74] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[75] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[76] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[77] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[78] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[79] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[80] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[83] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[93] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[94] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[96] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[97] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[100] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[104] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[109] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[115] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[117] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[119] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[122] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[123] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[124] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[125] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[128] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[129] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[130] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[132] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[136] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[137] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[138] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[141] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[142] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[144] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[151] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[152] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[153] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[154] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[157] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[158] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[161] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[162] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[165] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[166] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[169] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[184] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[192] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[195] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[197] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[198] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[199] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[200] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[202] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[203] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[204] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[205] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[206] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[208] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[209] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[210] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[211] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[212] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[214] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[215] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[217] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[219] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[222] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[225] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[229] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[237] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[238] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[239] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[240] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[241] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[242] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[243] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[244] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[245] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[246] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[247] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[248] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[250] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[252] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[255] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[257] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[258] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[259] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[260] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[263] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[264] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[267] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[270] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[273] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[274] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[275] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[276] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[277] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[279] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[282] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[285] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[287] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[296] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[303] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[306] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[308] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[311] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[312] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[313] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[314] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[315] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[316] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[317] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[318] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[320] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[327] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[328] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[329] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[331] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[334] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[342] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[343] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[344] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[346] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[347] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[348] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[352] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[355] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[356] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[357] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[359] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[361] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[362] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[363] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[364] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[365] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[366] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[369] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[370] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[374] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[378] = 0;
}
if (! _$jscoverage['/loader/combo-loader.js'].functionData) {
  _$jscoverage['/loader/combo-loader.js'].functionData = [];
  _$jscoverage['/loader/combo-loader.js'].functionData[0] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[1] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[2] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[3] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[4] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[5] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[6] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[7] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[8] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[9] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[10] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[11] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[12] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[13] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[14] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[15] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[16] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[17] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[18] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[19] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[20] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[21] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[22] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[23] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[24] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[25] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[26] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[27] = 0;
}
if (! _$jscoverage['/loader/combo-loader.js'].branchData) {
  _$jscoverage['/loader/combo-loader.js'].branchData = {};
  _$jscoverage['/loader/combo-loader.js'].branchData['8'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['13'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['64'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['68'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['78'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['79'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['96'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['124'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['153'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['161'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['192'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['195'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['197'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['199'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['205'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['208'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['208'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['208'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['209'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['210'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['237'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['252'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['252'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['258'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['259'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['273'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['274'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['279'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['279'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['279'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['318'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['342'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['347'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['359'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['359'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['360'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['369'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['369'][1] = new BranchData();
}
_$jscoverage['/loader/combo-loader.js'].branchData['369'][1].init(2722, 23, 'currentComboUrls.length');
function visit321_369_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['360'][1].init(69, 72, 'l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength');
function visit320_360_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['359'][2].init(800, 36, 'currentComboUrls.length > maxFileNum');
function visit319_359_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['359'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['359'][1].init(800, 143, 'currentComboUrls.length > maxFileNum || (l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)');
function visit318_359_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['347'][1].init(249, 25, '!currentMod.canBeCombined');
function visit317_347_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['342'][1].init(1388, 15, 'i < mods.length');
function visit316_342_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['318'][1].init(231, 15, 'tags.length > 1');
function visit315_318_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['279'][3].init(51, 19, 'mods.tags[0] == tag');
function visit314_279_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['279'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['279'][2].init(26, 21, 'mods.tags.length == 1');
function visit313_279_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['279'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['279'][1].init(26, 44, 'mods.tags.length == 1 && mods.tags[0] == tag');
function visit312_279_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['274'][1].init(1830, 32, '!(mods = typedCombos[comboName])');
function visit311_274_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['273'][1].init(1786, 21, 'comboMods[type] || {}');
function visit310_273_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['259'][1].init(30, 41, 'groupPrefixUri.isSameOriginAs(packageUri)');
function visit309_259_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['258'][1].init(188, 41, 'groupPrefixUri = comboPrefixes[comboName]');
function visit308_258_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['252'][2].init(764, 83, 'packageInfo.isCombine() && S.startsWith(fullpath, packagePath)');
function visit307_252_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['252'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['252'][1].init(744, 113, '(mod.canBeCombined = packageInfo.isCombine() && S.startsWith(fullpath, packagePath)) && group');
function visit306_252_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['237'][1].init(346, 5, 'i < l');
function visit305_237_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['210'][1].init(30, 20, 'modStatus != LOADING');
function visit304_210_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['209'][1].init(26, 27, '!waitingModules.contains(m)');
function visit303_209_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['208'][3].init(387, 21, 'modStatus != ATTACHED');
function visit302_208_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['208'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['208'][2].init(364, 19, 'modStatus != LOADED');
function visit301_208_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['208'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['208'][1].init(364, 44, 'modStatus != LOADED && modStatus != ATTACHED');
function visit300_208_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['205'][1].init(270, 19, 'modStatus === ERROR');
function visit299_205_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['199'][1].init(56, 8, 'cache[m]');
function visit298_199_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['197'][1].init(383, 19, 'i < modNames.length');
function visit297_197_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['195'][1].init(343, 11, 'cache || {}');
function visit296_195_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['192'][1].init(238, 9, 'ret || {}');
function visit295_192_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['161'][1].init(153, 7, '!mod.fn');
function visit294_161_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['153'][1].init(26, 9, '\'@DEBUG@\'');
function visit293_153_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['124'][1].init(26, 9, '\'@DEBUG@\'');
function visit292_124_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['96'][1].init(73, 8, '--i > -1');
function visit291_96_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['79'][1].init(18, 19, 'str1[i] !== str2[i]');
function visit290_79_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['78'][1].init(147, 5, 'i < l');
function visit289_78_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['68'][1].init(205, 9, 'ms.length');
function visit288_68_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['64'][1].init(22, 18, 'm.status == LOADED');
function visit287_64_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['13'][1].init(18, 10, '!(--count)');
function visit286_13_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['8'][1].init(22, 17, 'rss && rss.length');
function visit285_8_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/combo-loader.js'].functionData[0]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[7]++;
  function loadScripts(rss, callback, charset, timeout) {
    _$jscoverage['/loader/combo-loader.js'].functionData[1]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[8]++;
    var count = visit285_8_1(rss && rss.length), errorList = [], successList = [];
    _$jscoverage['/loader/combo-loader.js'].lineData[12]++;
    function complete() {
      _$jscoverage['/loader/combo-loader.js'].functionData[2]++;
      _$jscoverage['/loader/combo-loader.js'].lineData[13]++;
      if (visit286_13_1(!(--count))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[14]++;
        callback(successList, errorList);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[18]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[3]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[19]++;
  S.getScript(rs.fullpath, {
  timeout: timeout, 
  success: function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[4]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[22]++;
  successList.push(rs);
  _$jscoverage['/loader/combo-loader.js'].lineData[23]++;
  complete();
}, 
  error: function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[5]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[26]++;
  errorList.push(rs);
  _$jscoverage['/loader/combo-loader.js'].lineData[27]++;
  complete();
}, 
  charset: charset});
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[34]++;
  var Loader = S.Loader, logger = S.getLogger('s/loader'), Status = Loader.Status, Utils = Loader.Utils, LOADING = Status.LOADING, LOADED = Status.LOADED, ERROR = Status.ERROR, groupTag = S.now(), ATTACHED = Status.ATTACHED;
  _$jscoverage['/loader/combo-loader.js'].lineData[44]++;
  ComboLoader.groupTag = groupTag;
  _$jscoverage['/loader/combo-loader.js'].lineData[53]++;
  function ComboLoader(runtime, waitingModules) {
    _$jscoverage['/loader/combo-loader.js'].functionData[6]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[54]++;
    S.mix(this, {
  runtime: runtime, 
  waitingModules: waitingModules});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[60]++;
  function debugRemoteModules(rss) {
    _$jscoverage['/loader/combo-loader.js'].functionData[7]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[61]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[8]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[62]++;
  var ms = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[63]++;
  S.each(rs.mods, function(m) {
  _$jscoverage['/loader/combo-loader.js'].functionData[9]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[64]++;
  if (visit287_64_1(m.status == LOADED)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[65]++;
    ms.push(m.name);
  }
});
  _$jscoverage['/loader/combo-loader.js'].lineData[68]++;
  if (visit288_68_1(ms.length)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[69]++;
    logger.log('load remote modules: "' + ms.join(', ') + '" from: "' + rs.fullpath + '"', 'info');
  }
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[74]++;
  function getCommonPrefix(str1, str2) {
    _$jscoverage['/loader/combo-loader.js'].functionData[10]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[75]++;
    str1 = str1.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[76]++;
    str2 = str2.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[77]++;
    var l = Math.min(str1.length, str2.length);
    _$jscoverage['/loader/combo-loader.js'].lineData[78]++;
    for (var i = 0; visit289_78_1(i < l); i++) {
      _$jscoverage['/loader/combo-loader.js'].lineData[79]++;
      if (visit290_79_1(str1[i] !== str2[i])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[80]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[83]++;
    return str1.slice(0, i).join('/') + '/';
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[93]++;
  function getHash(str) {
    _$jscoverage['/loader/combo-loader.js'].functionData[11]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[94]++;
    var hash = 5381, i;
    _$jscoverage['/loader/combo-loader.js'].lineData[96]++;
    for (i = str.length; visit291_96_1(--i > -1); ) {
      _$jscoverage['/loader/combo-loader.js'].lineData[97]++;
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[100]++;
    return hash + '';
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[104]++;
  S.augment(ComboLoader, {
  use: function(normalizedModNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[12]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[109]++;
  var self = this, allModNames, comboUrls, timeout = S.Config.timeout, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[115]++;
  allModNames = S.keys(self.calculate(normalizedModNames));
  _$jscoverage['/loader/combo-loader.js'].lineData[117]++;
  Utils.createModulesInfo(runtime, allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[119]++;
  comboUrls = self.getComboUrls(allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[122]++;
  S.each(comboUrls.css, function(cssOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[13]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[123]++;
  loadScripts(cssOne, function(success, error) {
  _$jscoverage['/loader/combo-loader.js'].functionData[14]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[124]++;
  if (visit292_124_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[125]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[128]++;
  S.each(success, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[15]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[129]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[16]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[130]++;
  Utils.registerModule(runtime, mod.getName(), S.noop);
  _$jscoverage['/loader/combo-loader.js'].lineData[132]++;
  mod.notifyAll();
});
});
  _$jscoverage['/loader/combo-loader.js'].lineData[136]++;
  S.each(error, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[17]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[137]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[18]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[138]++;
  var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[141]++;
  S.log(msg, 'error');
  _$jscoverage['/loader/combo-loader.js'].lineData[142]++;
  mod.status = ERROR;
  _$jscoverage['/loader/combo-loader.js'].lineData[144]++;
  mod.notifyAll();
});
});
}, cssOne.charset, timeout);
});
  _$jscoverage['/loader/combo-loader.js'].lineData[151]++;
  S.each(comboUrls['js'], function(jsOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[19]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[152]++;
  loadScripts(jsOne, function(success) {
  _$jscoverage['/loader/combo-loader.js'].functionData[20]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[153]++;
  if (visit293_153_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[154]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[157]++;
  S.each(jsOne, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[21]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[158]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[22]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[161]++;
  if (visit294_161_1(!mod.fn)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[162]++;
    var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
    _$jscoverage['/loader/combo-loader.js'].lineData[165]++;
    S.log(msg, 'error');
    _$jscoverage['/loader/combo-loader.js'].lineData[166]++;
    mod.status = ERROR;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[169]++;
  mod.notifyAll();
});
});
}, jsOne.charset, timeout);
});
}, 
  calculate: function(modNames, cache, ret) {
  _$jscoverage['/loader/combo-loader.js'].functionData[23]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[184]++;
  var i, m, mod, modStatus, self = this, waitingModules = self.waitingModules, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[192]++;
  ret = visit295_192_1(ret || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[195]++;
  cache = visit296_195_1(cache || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[197]++;
  for (i = 0; visit297_197_1(i < modNames.length); i++) {
    _$jscoverage['/loader/combo-loader.js'].lineData[198]++;
    m = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[199]++;
    if (visit298_199_1(cache[m])) {
      _$jscoverage['/loader/combo-loader.js'].lineData[200]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[202]++;
    cache[m] = 1;
    _$jscoverage['/loader/combo-loader.js'].lineData[203]++;
    mod = Utils.createModuleInfo(runtime, m);
    _$jscoverage['/loader/combo-loader.js'].lineData[204]++;
    modStatus = mod.status;
    _$jscoverage['/loader/combo-loader.js'].lineData[205]++;
    if (visit299_205_1(modStatus === ERROR)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[206]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[208]++;
    if (visit300_208_1(visit301_208_2(modStatus != LOADED) && visit302_208_3(modStatus != ATTACHED))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[209]++;
      if (visit303_209_1(!waitingModules.contains(m))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[210]++;
        if (visit304_210_1(modStatus != LOADING)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[211]++;
          mod.status = LOADING;
          _$jscoverage['/loader/combo-loader.js'].lineData[212]++;
          ret[m] = 1;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[214]++;
        mod.addCallback(function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[24]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[215]++;
  waitingModules.remove(mod.getName());
  _$jscoverage['/loader/combo-loader.js'].lineData[217]++;
  waitingModules.notifyAll();
});
        _$jscoverage['/loader/combo-loader.js'].lineData[219]++;
        waitingModules.add(m);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[222]++;
    self.calculate(mod.getNormalizedRequires(), cache, ret);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[225]++;
  return ret;
}, 
  getComboMods: function(modNames, comboPrefixes) {
  _$jscoverage['/loader/combo-loader.js'].functionData[25]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[229]++;
  var comboMods = {}, packageUri, runtime = this.runtime, i = 0, l = modNames.length, modName, mod, packageInfo, type, typedCombos, mods, tag, charset, packagePath, packageName, group, fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[237]++;
  for (; visit305_237_1(i < l); ++i) {
    _$jscoverage['/loader/combo-loader.js'].lineData[238]++;
    modName = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[239]++;
    mod = Utils.createModuleInfo(runtime, modName);
    _$jscoverage['/loader/combo-loader.js'].lineData[240]++;
    type = mod.getType();
    _$jscoverage['/loader/combo-loader.js'].lineData[241]++;
    fullpath = mod.getFullPath();
    _$jscoverage['/loader/combo-loader.js'].lineData[242]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/loader/combo-loader.js'].lineData[243]++;
    packageName = packageInfo.getName();
    _$jscoverage['/loader/combo-loader.js'].lineData[244]++;
    charset = packageInfo.getCharset();
    _$jscoverage['/loader/combo-loader.js'].lineData[245]++;
    tag = packageInfo.getTag();
    _$jscoverage['/loader/combo-loader.js'].lineData[246]++;
    group = packageInfo.getGroup();
    _$jscoverage['/loader/combo-loader.js'].lineData[247]++;
    packagePath = packageInfo.getPrefixUriForCombo();
    _$jscoverage['/loader/combo-loader.js'].lineData[248]++;
    packageUri = packageInfo.getPackageUri();
    _$jscoverage['/loader/combo-loader.js'].lineData[250]++;
    var comboName = packageName;
    _$jscoverage['/loader/combo-loader.js'].lineData[252]++;
    if (visit306_252_1((mod.canBeCombined = visit307_252_2(packageInfo.isCombine() && S.startsWith(fullpath, packagePath))) && group)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[255]++;
      comboName = group + '_' + charset + '_' + groupTag;
      _$jscoverage['/loader/combo-loader.js'].lineData[257]++;
      var groupPrefixUri;
      _$jscoverage['/loader/combo-loader.js'].lineData[258]++;
      if (visit308_258_1(groupPrefixUri = comboPrefixes[comboName])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[259]++;
        if (visit309_259_1(groupPrefixUri.isSameOriginAs(packageUri))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[260]++;
          groupPrefixUri.setPath(getCommonPrefix(groupPrefixUri.getPath(), packageUri.getPath()));
        } else {
          _$jscoverage['/loader/combo-loader.js'].lineData[263]++;
          comboName = packageName;
          _$jscoverage['/loader/combo-loader.js'].lineData[264]++;
          comboPrefixes[packageName] = packageUri;
        }
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[267]++;
        comboPrefixes[comboName] = packageUri.clone();
      }
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[270]++;
      comboPrefixes[packageName] = packageUri;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[273]++;
    typedCombos = comboMods[type] = visit310_273_1(comboMods[type] || {});
    _$jscoverage['/loader/combo-loader.js'].lineData[274]++;
    if (visit311_274_1(!(mods = typedCombos[comboName]))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[275]++;
      mods = typedCombos[comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[276]++;
      mods.charset = charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[277]++;
      mods.tags = [tag];
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[279]++;
      if (visit312_279_1(visit313_279_2(mods.tags.length == 1) && visit314_279_3(mods.tags[0] == tag))) {
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[282]++;
        mods.tags.push(tag);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[285]++;
    mods.push(mod);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[287]++;
  return comboMods;
}, 
  getComboUrls: function(modNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[26]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[296]++;
  var runtime = this.runtime, Config = runtime.Config, comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/loader/combo-loader.js'].lineData[303]++;
  var comboPrefixes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[306]++;
  var comboMods = this.getComboMods(modNames, comboPrefixes);
  _$jscoverage['/loader/combo-loader.js'].lineData[308]++;
  var comboRes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[311]++;
  for (var type in comboMods) {
    _$jscoverage['/loader/combo-loader.js'].lineData[312]++;
    comboRes[type] = {};
    _$jscoverage['/loader/combo-loader.js'].lineData[313]++;
    for (var comboName in comboMods[type]) {
      _$jscoverage['/loader/combo-loader.js'].lineData[314]++;
      var currentComboUrls = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[315]++;
      var currentComboMods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[316]++;
      var mods = comboMods[type][comboName];
      _$jscoverage['/loader/combo-loader.js'].lineData[317]++;
      var tags = mods.tags;
      _$jscoverage['/loader/combo-loader.js'].lineData[318]++;
      var tag = visit315_318_1(tags.length > 1) ? getHash(tags.join('')) : tags[0];
      _$jscoverage['/loader/combo-loader.js'].lineData[320]++;
      var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''), suffixLength = suffix.length, basePrefix = comboPrefixes[comboName].toString(), baseLen = basePrefix.length, prefix = basePrefix + comboPrefix, res = comboRes[type][comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[327]++;
      var l = prefix.length;
      _$jscoverage['/loader/combo-loader.js'].lineData[328]++;
      res.charset = mods.charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[329]++;
      res.mods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[331]++;
      function pushComboUrl() {
        _$jscoverage['/loader/combo-loader.js'].functionData[27]++;
        _$jscoverage['/loader/combo-loader.js'].lineData[334]++;
        res.push({
  fullpath: Utils.getMappedPath(runtime, prefix + currentComboUrls.join(comboSep) + suffix, Config.mappedComboRules), 
  mods: currentComboMods});
      }      _$jscoverage['/loader/combo-loader.js'].lineData[342]++;
      for (var i = 0; visit316_342_1(i < mods.length); i++) {
        _$jscoverage['/loader/combo-loader.js'].lineData[343]++;
        var currentMod = mods[i];
        _$jscoverage['/loader/combo-loader.js'].lineData[344]++;
        res.mods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[346]++;
        var fullpath = currentMod.getFullPath();
        _$jscoverage['/loader/combo-loader.js'].lineData[347]++;
        if (visit317_347_1(!currentMod.canBeCombined)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[348]++;
          res.push({
  fullpath: fullpath, 
  mods: [currentMod]});
          _$jscoverage['/loader/combo-loader.js'].lineData[352]++;
          continue;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[355]++;
        var path = fullpath.slice(baseLen).replace(/\?.*$/, '');
        _$jscoverage['/loader/combo-loader.js'].lineData[356]++;
        currentComboUrls.push(path);
        _$jscoverage['/loader/combo-loader.js'].lineData[357]++;
        currentComboMods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[359]++;
        if (visit318_359_1(visit319_359_2(currentComboUrls.length > maxFileNum) || (visit320_360_1(l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[361]++;
          currentComboUrls.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[362]++;
          currentComboMods.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[363]++;
          pushComboUrl();
          _$jscoverage['/loader/combo-loader.js'].lineData[364]++;
          currentComboUrls = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[365]++;
          currentComboMods = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[366]++;
          i--;
        }
      }
      _$jscoverage['/loader/combo-loader.js'].lineData[369]++;
      if (visit321_369_1(currentComboUrls.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[370]++;
        pushComboUrl();
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[374]++;
  return comboRes;
}});
  _$jscoverage['/loader/combo-loader.js'].lineData[378]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
