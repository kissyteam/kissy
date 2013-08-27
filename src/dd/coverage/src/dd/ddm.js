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
if (! _$jscoverage['/dd/ddm.js']) {
  _$jscoverage['/dd/ddm.js'] = {};
  _$jscoverage['/dd/ddm.js'].lineData = [];
  _$jscoverage['/dd/ddm.js'].lineData[6] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[8] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[22] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[39] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[49] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[56] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[59] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[60] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[70] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[72] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[73] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[83] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[86] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[88] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[90] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[91] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[94] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[95] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[96] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[97] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[98] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[99] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[108] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[116] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[121] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[122] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[123] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[125] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[126] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[130] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[132] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[133] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[134] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[136] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[137] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[139] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[140] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[142] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[143] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[144] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[145] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[147] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[148] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[249] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[250] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[255] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[256] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[257] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[261] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[262] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[263] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[264] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[266] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[267] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[271] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[274] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[275] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[282] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[285] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[286] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[294] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[295] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[296] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[299] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[306] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[310] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[313] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[315] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[316] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[317] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[318] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[319] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[322] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[323] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[324] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[328] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[330] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[331] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[332] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[333] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[336] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[338] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[339] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[340] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[341] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[344] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[347] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[348] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[349] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[350] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[352] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[353] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[354] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[355] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[358] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[366] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[368] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[387] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[389] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[393] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[396] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[399] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[400] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[402] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[404] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[411] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[413] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[415] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[416] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[418] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[419] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[421] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[425] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[426] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[433] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[434] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[435] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[437] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[438] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[445] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[446] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[447] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[448] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[449] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[453] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[454] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[455] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[456] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[457] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[458] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[463] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[464] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[465] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[466] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[467] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[468] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[474] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[475] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[476] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[477] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[478] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[480] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[488] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[489] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[495] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[496] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[497] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[499] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[502] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[503] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[507] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[515] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[516] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[519] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[520] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[521] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[522] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[526] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[527] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[528] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[529] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[530] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[531] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[533] = 0;
}
if (! _$jscoverage['/dd/ddm.js'].functionData) {
  _$jscoverage['/dd/ddm.js'].functionData = [];
  _$jscoverage['/dd/ddm.js'].functionData[0] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[1] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[2] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[3] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[4] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[5] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[6] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[7] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[8] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[9] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[10] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[11] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[12] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[13] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[14] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[15] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[16] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[17] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[18] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[19] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[20] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[21] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[22] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[23] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[24] = 0;
}
if (! _$jscoverage['/dd/ddm.js'].branchData) {
  _$jscoverage['/dd/ddm.js'].branchData = {};
  _$jscoverage['/dd/ddm.js'].branchData['14'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['59'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['90'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['95'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['97'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['121'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['122'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['125'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['132'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['136'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['139'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['144'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['255'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['255'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['261'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['263'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['266'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['271'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['274'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['282'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['282'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['295'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['306'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['313'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['315'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['317'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['322'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['328'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['331'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['336'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['339'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['348'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['348'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['353'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['354'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['383'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['389'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['402'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['415'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['418'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['425'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['437'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['448'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['456'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['466'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['476'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['476'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['482'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['484'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['489'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['489'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['490'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['490'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['490'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['491'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['491'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['492'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['496'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['496'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['496'][3] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['520'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['520'][1] = new BranchData();
}
_$jscoverage['/dd/ddm.js'].branchData['520'][1].init(14, 4, 'node');
function visit59_520_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['496'][3].init(45, 27, 'region.left >= region.right');
function visit58_496_3(result) {
  _$jscoverage['/dd/ddm.js'].branchData['496'][3].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['496'][2].init(14, 27, 'region.top >= region.bottom');
function visit57_496_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['496'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['496'][1].init(14, 58, 'region.top >= region.bottom || region.left >= region.right');
function visit56_496_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['492'][1].init(41, 28, 'region.bottom >= pointer.top');
function visit55_492_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['491'][2].init(109, 25, 'region.top <= pointer.top');
function visit54_491_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['491'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['491'][1].init(44, 70, 'region.top <= pointer.top && region.bottom >= pointer.top');
function visit53_491_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['490'][2].init(63, 28, 'region.right >= pointer.left');
function visit52_490_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['490'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['490'][1].init(43, 115, 'region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit51_490_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['489'][2].init(17, 27, 'region.left <= pointer.left');
function visit50_489_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['489'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['489'][1].init(17, 159, 'region.left <= pointer.left && region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit49_489_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['484'][1].init(179, 45, 'node.__dd_cached_height || node.outerHeight()');
function visit48_484_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['482'][1].init(68, 43, 'node.__dd_cached_width || node.outerWidth()');
function visit47_482_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['476'][1].init(51, 23, '!node.__dd_cached_width');
function visit46_476_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['476'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['466'][1].init(99, 12, 'drops.length');
function visit45_466_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['456'][1].init(99, 12, 'drops.length');
function visit44_456_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['448'][1].init(128, 11, 'UA.ie === 6');
function visit43_448_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['437'][1].init(193, 11, 'UA.ie === 6');
function visit42_437_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['425'][1].init(421, 3, 'ie6');
function visit41_425_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['418'][1].init(242, 13, 'cur == \'auto\'');
function visit40_418_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['415'][1].init(175, 2, 'ah');
function visit39_415_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['402'][1].init(66, 75, '(activeDrag = self.get(\'activeDrag\')) && activeDrag.get(\'shim\')');
function visit38_402_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['389'][1].init(714, 3, 'ie6');
function visit37_389_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['383'][1].init(486, 31, 'doc.body || doc.documentElement');
function visit36_383_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['354'][1].init(18, 21, 'oldDrop != activeDrop');
function visit35_354_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['353'][1].init(2270, 10, 'activeDrop');
function visit34_353_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['348'][2].init(2091, 21, 'oldDrop != activeDrop');
function visit33_348_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['348'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['348'][1].init(2080, 32, 'oldDrop && oldDrop != activeDrop');
function visit32_348_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['339'][1].init(122, 13, 'a == dragArea');
function visit31_339_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['336'][1].init(1406, 16, 'mode == \'strict\'');
function visit30_336_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['331'][1].init(131, 9, 'a > vArea');
function visit29_331_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['328'][1].init(1122, 19, 'mode == \'intersect\'');
function visit28_328_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['322'][1].init(81, 9, 'a < vArea');
function visit27_322_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['317'][1].init(71, 11, '!activeDrop');
function visit26_317_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['315'][1].init(56, 42, 'inNodeByPointer(node, activeDrag.mousePos)');
function visit25_315_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['313'][1].init(532, 15, 'mode == \'point\'');
function visit24_313_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['306'][1].init(352, 5, '!node');
function visit23_306_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['295'][1].init(18, 20, 'drop.get(\'disabled\')');
function visit22_295_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['282'][2].init(7313, 9, 'UA.ie < 8');
function visit21_282_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['282'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['282'][1].init(7304, 18, 'UA.ie && UA.ie < 8');
function visit20_282_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['274'][1].init(715, 40, 'drag && drag.get(\'preventDefaultOnMove\')');
function visit19_274_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['271'][1].init(616, 28, '__activeToDrag || activeDrag');
function visit18_271_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['266'][1].init(105, 20, 'self.__needDropCheck');
function visit17_266_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['263'][1].init(350, 35, 'activeDrag = self.get(\'activeDrag\')');
function visit16_263_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['261'][1].init(250, 36, '__activeToDrag = self.__activeToDrag');
function visit15_261_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['255'][2].init(130, 21, 'ev.touches.length > 1');
function visit14_255_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['255'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['255'][1].init(116, 35, 'ev.touches && ev.touches.length > 1');
function visit13_255_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['144'][1].init(901, 10, 'activeDrop');
function visit12_144_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['139'][1].init(761, 11, '!activeDrag');
function visit11_139_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['136'][1].init(679, 10, 'self._shim');
function visit10_136_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['132'][1].init(546, 14, '__activeToDrag');
function visit9_132_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['125'][1].init(126, 10, 'activeDrag');
function visit8_125_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['122'][1].init(22, 14, '__activeToDrag');
function visit7_122_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['121'][1].init(213, 1, 'e');
function visit6_121_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['97'][1].init(59, 29, 'self.get(\'validDrops\').length');
function visit5_97_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['95'][1].init(448, 18, 'drag.get(\'groups\')');
function visit4_95_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['90'][1].init(277, 16, 'drag.get(\'shim\')');
function visit3_90_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['59'][1].init(138, 11, 'index != -1');
function visit2_59_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['14'][1].init(156, 14, 'UA[\'ie\'] === 6');
function visit1_14_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].lineData[6]++;
KISSY.add('dd/ddm', function(S, Node, Base, undefined) {
  _$jscoverage['/dd/ddm.js'].functionData[0]++;
  _$jscoverage['/dd/ddm.js'].lineData[8]++;
  var UA = S.UA, $ = Node.all, win = S.Env.host, doc = win.document, $doc = $(doc), $win = $(win), ie6 = visit1_14_1(UA['ie'] === 6), PIXEL_THRESH = 3, BUFFER_TIME = 1, MOVE_DELAY = 30, SHIM_Z_INDEX = 999999;
  _$jscoverage['/dd/ddm.js'].lineData[22]++;
  var Gesture = Node.Gesture, DRAG_MOVE_EVENT = Gesture.move, DRAG_END_EVENT = Gesture.end;
  _$jscoverage['/dd/ddm.js'].lineData[39]++;
  var DDM = Base.extend({
  __activeToDrag: 0, 
  _regDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[1]++;
  _$jscoverage['/dd/ddm.js'].lineData[49]++;
  this.get('drops').push(d);
}, 
  _unRegDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[2]++;
  _$jscoverage['/dd/ddm.js'].lineData[56]++;
  var self = this, drops = self.get('drops'), index = S.indexOf(d, drops);
  _$jscoverage['/dd/ddm.js'].lineData[59]++;
  if (visit2_59_1(index != -1)) {
    _$jscoverage['/dd/ddm.js'].lineData[60]++;
    drops.splice(index, 1);
  }
}, 
  _regToDrag: function(drag) {
  _$jscoverage['/dd/ddm.js'].functionData[3]++;
  _$jscoverage['/dd/ddm.js'].lineData[70]++;
  var self = this;
  _$jscoverage['/dd/ddm.js'].lineData[72]++;
  self.__activeToDrag = drag;
  _$jscoverage['/dd/ddm.js'].lineData[73]++;
  registerEvent(self);
}, 
  _start: function() {
  _$jscoverage['/dd/ddm.js'].functionData[4]++;
  _$jscoverage['/dd/ddm.js'].lineData[83]++;
  var self = this, drops = self.get('drops'), drag = self.__activeToDrag;
  _$jscoverage['/dd/ddm.js'].lineData[86]++;
  self.setInternal('activeDrag', drag);
  _$jscoverage['/dd/ddm.js'].lineData[88]++;
  self.__activeToDrag = 0;
  _$jscoverage['/dd/ddm.js'].lineData[90]++;
  if (visit3_90_1(drag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[91]++;
    activeShim(self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[94]++;
  self.__needDropCheck = 0;
  _$jscoverage['/dd/ddm.js'].lineData[95]++;
  if (visit4_95_1(drag.get('groups'))) {
    _$jscoverage['/dd/ddm.js'].lineData[96]++;
    _activeDrops(self);
    _$jscoverage['/dd/ddm.js'].lineData[97]++;
    if (visit5_97_1(self.get('validDrops').length)) {
      _$jscoverage['/dd/ddm.js'].lineData[98]++;
      cacheWH(drag.get('node'));
      _$jscoverage['/dd/ddm.js'].lineData[99]++;
      self.__needDropCheck = 1;
    }
  }
}, 
  _addValidDrop: function(drop) {
  _$jscoverage['/dd/ddm.js'].functionData[5]++;
  _$jscoverage['/dd/ddm.js'].lineData[108]++;
  this.get('validDrops').push(drop);
}, 
  _end: function(e) {
  _$jscoverage['/dd/ddm.js'].functionData[6]++;
  _$jscoverage['/dd/ddm.js'].lineData[116]++;
  var self = this, __activeToDrag = self.__activeToDrag, activeDrag = self.get('activeDrag'), activeDrop = self.get('activeDrop');
  _$jscoverage['/dd/ddm.js'].lineData[121]++;
  if (visit6_121_1(e)) {
    _$jscoverage['/dd/ddm.js'].lineData[122]++;
    if (visit7_122_1(__activeToDrag)) {
      _$jscoverage['/dd/ddm.js'].lineData[123]++;
      __activeToDrag._move(e);
    }
    _$jscoverage['/dd/ddm.js'].lineData[125]++;
    if (visit8_125_1(activeDrag)) {
      _$jscoverage['/dd/ddm.js'].lineData[126]++;
      activeDrag._move(e);
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[130]++;
  unRegisterEvent(self);
  _$jscoverage['/dd/ddm.js'].lineData[132]++;
  if (visit9_132_1(__activeToDrag)) {
    _$jscoverage['/dd/ddm.js'].lineData[133]++;
    __activeToDrag._end(e);
    _$jscoverage['/dd/ddm.js'].lineData[134]++;
    self.__activeToDrag = 0;
  }
  _$jscoverage['/dd/ddm.js'].lineData[136]++;
  if (visit10_136_1(self._shim)) {
    _$jscoverage['/dd/ddm.js'].lineData[137]++;
    self._shim.hide();
  }
  _$jscoverage['/dd/ddm.js'].lineData[139]++;
  if (visit11_139_1(!activeDrag)) {
    _$jscoverage['/dd/ddm.js'].lineData[140]++;
    return;
  }
  _$jscoverage['/dd/ddm.js'].lineData[142]++;
  activeDrag._end(e);
  _$jscoverage['/dd/ddm.js'].lineData[143]++;
  _deActiveDrops(self);
  _$jscoverage['/dd/ddm.js'].lineData[144]++;
  if (visit12_144_1(activeDrop)) {
    _$jscoverage['/dd/ddm.js'].lineData[145]++;
    activeDrop._end(e);
  }
  _$jscoverage['/dd/ddm.js'].lineData[147]++;
  self.setInternal('activeDrag', null);
  _$jscoverage['/dd/ddm.js'].lineData[148]++;
  self.setInternal('activeDrop', null);
}}, {
  ATTRS: {
  dragCursor: {
  value: 'move'}, 
  clickPixelThresh: {
  value: PIXEL_THRESH}, 
  bufferTime: {
  value: BUFFER_TIME}, 
  activeDrag: {}, 
  activeDrop: {}, 
  drops: {
  value: []}, 
  validDrops: {
  value: []}}});
  _$jscoverage['/dd/ddm.js'].lineData[249]++;
  function move(ev) {
    _$jscoverage['/dd/ddm.js'].functionData[7]++;
    _$jscoverage['/dd/ddm.js'].lineData[250]++;
    var self = this, drag, __activeToDrag, activeDrag;
    _$jscoverage['/dd/ddm.js'].lineData[255]++;
    if (visit13_255_1(ev.touches && visit14_255_2(ev.touches.length > 1))) {
      _$jscoverage['/dd/ddm.js'].lineData[256]++;
      ddm._end();
      _$jscoverage['/dd/ddm.js'].lineData[257]++;
      return;
    }
    _$jscoverage['/dd/ddm.js'].lineData[261]++;
    if (visit15_261_1(__activeToDrag = self.__activeToDrag)) {
      _$jscoverage['/dd/ddm.js'].lineData[262]++;
      __activeToDrag._move(ev);
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[263]++;
      if (visit16_263_1(activeDrag = self.get('activeDrag'))) {
        _$jscoverage['/dd/ddm.js'].lineData[264]++;
        activeDrag._move(ev);
        _$jscoverage['/dd/ddm.js'].lineData[266]++;
        if (visit17_266_1(self.__needDropCheck)) {
          _$jscoverage['/dd/ddm.js'].lineData[267]++;
          notifyDropsMove(self, ev, activeDrag);
        }
      }
    }
    _$jscoverage['/dd/ddm.js'].lineData[271]++;
    drag = visit18_271_1(__activeToDrag || activeDrag);
    _$jscoverage['/dd/ddm.js'].lineData[274]++;
    if (visit19_274_1(drag && drag.get('preventDefaultOnMove'))) {
      _$jscoverage['/dd/ddm.js'].lineData[275]++;
      ev.preventDefault();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[282]++;
  var throttleMove = visit20_282_1(UA.ie && visit21_282_2(UA.ie < 8)) ? S.throttle(move, MOVE_DELAY) : move;
  _$jscoverage['/dd/ddm.js'].lineData[285]++;
  function notifyDropsMove(self, ev, activeDrag) {
    _$jscoverage['/dd/ddm.js'].functionData[8]++;
    _$jscoverage['/dd/ddm.js'].lineData[286]++;
    var drops = self.get('validDrops'), mode = activeDrag.get('mode'), activeDrop = 0, oldDrop, vArea = 0, dragRegion = region(activeDrag.get('node')), dragArea = area(dragRegion);
    _$jscoverage['/dd/ddm.js'].lineData[294]++;
    S.each(drops, function(drop) {
  _$jscoverage['/dd/ddm.js'].functionData[9]++;
  _$jscoverage['/dd/ddm.js'].lineData[295]++;
  if (visit22_295_1(drop.get('disabled'))) {
    _$jscoverage['/dd/ddm.js'].lineData[296]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[299]++;
  var a, node = drop['getNodeFromTarget'](ev, activeDrag.get('dragNode')[0], activeDrag.get('node')[0]);
  _$jscoverage['/dd/ddm.js'].lineData[306]++;
  if (visit23_306_1(!node)) {
    _$jscoverage['/dd/ddm.js'].lineData[310]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[313]++;
  if (visit24_313_1(mode == 'point')) {
    _$jscoverage['/dd/ddm.js'].lineData[315]++;
    if (visit25_315_1(inNodeByPointer(node, activeDrag.mousePos))) {
      _$jscoverage['/dd/ddm.js'].lineData[316]++;
      a = area(region(node));
      _$jscoverage['/dd/ddm.js'].lineData[317]++;
      if (visit26_317_1(!activeDrop)) {
        _$jscoverage['/dd/ddm.js'].lineData[318]++;
        activeDrop = drop;
        _$jscoverage['/dd/ddm.js'].lineData[319]++;
        vArea = a;
      } else {
        _$jscoverage['/dd/ddm.js'].lineData[322]++;
        if (visit27_322_1(a < vArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[323]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[324]++;
          vArea = a;
        }
      }
    }
  } else {
    _$jscoverage['/dd/ddm.js'].lineData[328]++;
    if (visit28_328_1(mode == 'intersect')) {
      _$jscoverage['/dd/ddm.js'].lineData[330]++;
      a = area(intersect(dragRegion, region(node)));
      _$jscoverage['/dd/ddm.js'].lineData[331]++;
      if (visit29_331_1(a > vArea)) {
        _$jscoverage['/dd/ddm.js'].lineData[332]++;
        vArea = a;
        _$jscoverage['/dd/ddm.js'].lineData[333]++;
        activeDrop = drop;
      }
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[336]++;
      if (visit30_336_1(mode == 'strict')) {
        _$jscoverage['/dd/ddm.js'].lineData[338]++;
        a = area(intersect(dragRegion, region(node)));
        _$jscoverage['/dd/ddm.js'].lineData[339]++;
        if (visit31_339_1(a == dragArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[340]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[341]++;
          return false;
        }
      }
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[344]++;
  return undefined;
});
    _$jscoverage['/dd/ddm.js'].lineData[347]++;
    oldDrop = self.get('activeDrop');
    _$jscoverage['/dd/ddm.js'].lineData[348]++;
    if (visit32_348_1(oldDrop && visit33_348_2(oldDrop != activeDrop))) {
      _$jscoverage['/dd/ddm.js'].lineData[349]++;
      oldDrop._handleOut(ev);
      _$jscoverage['/dd/ddm.js'].lineData[350]++;
      activeDrag._handleOut(ev);
    }
    _$jscoverage['/dd/ddm.js'].lineData[352]++;
    self.setInternal('activeDrop', activeDrop);
    _$jscoverage['/dd/ddm.js'].lineData[353]++;
    if (visit34_353_1(activeDrop)) {
      _$jscoverage['/dd/ddm.js'].lineData[354]++;
      if (visit35_354_1(oldDrop != activeDrop)) {
        _$jscoverage['/dd/ddm.js'].lineData[355]++;
        activeDrop._handleEnter(ev);
      } else {
        _$jscoverage['/dd/ddm.js'].lineData[358]++;
        activeDrop._handleOver(ev);
      }
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[366]++;
  function activeShim(self) {
    _$jscoverage['/dd/ddm.js'].functionData[10]++;
    _$jscoverage['/dd/ddm.js'].lineData[368]++;
    self._shim = $('<div ' + 'style="' + 'background-color:red;' + 'position:' + (ie6 ? 'absolute' : 'fixed') + ';' + 'left:0;' + 'width:100%;' + 'height:100%;' + 'top:0;' + 'cursor:' + ddm.get('dragCursor') + ';' + 'z-index:' + SHIM_Z_INDEX + ';' + '"><' + '/div>').prependTo(visit36_383_1(doc.body || doc.documentElement)).css('opacity', 0);
    _$jscoverage['/dd/ddm.js'].lineData[387]++;
    activeShim = showShim;
    _$jscoverage['/dd/ddm.js'].lineData[389]++;
    if (visit37_389_1(ie6)) {
      _$jscoverage['/dd/ddm.js'].lineData[393]++;
      $win.on('resize scroll', adjustShimSize, self);
    }
    _$jscoverage['/dd/ddm.js'].lineData[396]++;
    showShim(self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[399]++;
  var adjustShimSize = S.throttle(function() {
  _$jscoverage['/dd/ddm.js'].functionData[11]++;
  _$jscoverage['/dd/ddm.js'].lineData[400]++;
  var self = this, activeDrag;
  _$jscoverage['/dd/ddm.js'].lineData[402]++;
  if (visit38_402_1((activeDrag = self.get('activeDrag')) && activeDrag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[404]++;
    self._shim.css({
  width: $doc.width(), 
  height: $doc.height()});
  }
}, MOVE_DELAY);
  _$jscoverage['/dd/ddm.js'].lineData[411]++;
  function showShim(self) {
    _$jscoverage['/dd/ddm.js'].functionData[12]++;
    _$jscoverage['/dd/ddm.js'].lineData[413]++;
    var ah = self.get('activeDrag').get('activeHandler'), cur = 'auto';
    _$jscoverage['/dd/ddm.js'].lineData[415]++;
    if (visit39_415_1(ah)) {
      _$jscoverage['/dd/ddm.js'].lineData[416]++;
      cur = ah.css('cursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[418]++;
    if (visit40_418_1(cur == 'auto')) {
      _$jscoverage['/dd/ddm.js'].lineData[419]++;
      cur = self.get('dragCursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[421]++;
    self._shim.css({
  cursor: cur, 
  display: 'block'});
    _$jscoverage['/dd/ddm.js'].lineData[425]++;
    if (visit41_425_1(ie6)) {
      _$jscoverage['/dd/ddm.js'].lineData[426]++;
      adjustShimSize.call(self);
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[433]++;
  function registerEvent(self) {
    _$jscoverage['/dd/ddm.js'].functionData[13]++;
    _$jscoverage['/dd/ddm.js'].lineData[434]++;
    $doc.on(DRAG_END_EVENT, self._end, self);
    _$jscoverage['/dd/ddm.js'].lineData[435]++;
    $doc.on(DRAG_MOVE_EVENT, throttleMove, self);
    _$jscoverage['/dd/ddm.js'].lineData[437]++;
    if (visit42_437_1(UA.ie === 6)) {
      _$jscoverage['/dd/ddm.js'].lineData[438]++;
      doc.body.setCapture();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[445]++;
  function unRegisterEvent(self) {
    _$jscoverage['/dd/ddm.js'].functionData[14]++;
    _$jscoverage['/dd/ddm.js'].lineData[446]++;
    $doc.detach(DRAG_MOVE_EVENT, throttleMove, self);
    _$jscoverage['/dd/ddm.js'].lineData[447]++;
    $doc.detach(DRAG_END_EVENT, self._end, self);
    _$jscoverage['/dd/ddm.js'].lineData[448]++;
    if (visit43_448_1(UA.ie === 6)) {
      _$jscoverage['/dd/ddm.js'].lineData[449]++;
      doc.body.releaseCapture();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[453]++;
  function _activeDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[15]++;
    _$jscoverage['/dd/ddm.js'].lineData[454]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[455]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[456]++;
    if (visit44_456_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[457]++;
      S.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[16]++;
  _$jscoverage['/dd/ddm.js'].lineData[458]++;
  d._active();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[463]++;
  function _deActiveDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[17]++;
    _$jscoverage['/dd/ddm.js'].lineData[464]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[465]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[466]++;
    if (visit45_466_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[467]++;
      S.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[18]++;
  _$jscoverage['/dd/ddm.js'].lineData[468]++;
  d._deActive();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[474]++;
  function region(node) {
    _$jscoverage['/dd/ddm.js'].functionData[19]++;
    _$jscoverage['/dd/ddm.js'].lineData[475]++;
    var offset = node.offset();
    _$jscoverage['/dd/ddm.js'].lineData[476]++;
    if (visit46_476_1(!node.__dd_cached_width)) {
      _$jscoverage['/dd/ddm.js'].lineData[477]++;
      S.log('no cache in dd!');
      _$jscoverage['/dd/ddm.js'].lineData[478]++;
      S.log(node[0]);
    }
    _$jscoverage['/dd/ddm.js'].lineData[480]++;
    return {
  left: offset.left, 
  right: offset.left + (visit47_482_1(node.__dd_cached_width || node.outerWidth())), 
  top: offset.top, 
  bottom: offset.top + (visit48_484_1(node.__dd_cached_height || node.outerHeight()))};
  }
  _$jscoverage['/dd/ddm.js'].lineData[488]++;
  function inRegion(region, pointer) {
    _$jscoverage['/dd/ddm.js'].functionData[20]++;
    _$jscoverage['/dd/ddm.js'].lineData[489]++;
    return visit49_489_1(visit50_489_2(region.left <= pointer.left) && visit51_490_1(visit52_490_2(region.right >= pointer.left) && visit53_491_1(visit54_491_2(region.top <= pointer.top) && visit55_492_1(region.bottom >= pointer.top))));
  }
  _$jscoverage['/dd/ddm.js'].lineData[495]++;
  function area(region) {
    _$jscoverage['/dd/ddm.js'].functionData[21]++;
    _$jscoverage['/dd/ddm.js'].lineData[496]++;
    if (visit56_496_1(visit57_496_2(region.top >= region.bottom) || visit58_496_3(region.left >= region.right))) {
      _$jscoverage['/dd/ddm.js'].lineData[497]++;
      return 0;
    }
    _$jscoverage['/dd/ddm.js'].lineData[499]++;
    return (region.right - region.left) * (region.bottom - region.top);
  }
  _$jscoverage['/dd/ddm.js'].lineData[502]++;
  function intersect(r1, r2) {
    _$jscoverage['/dd/ddm.js'].functionData[22]++;
    _$jscoverage['/dd/ddm.js'].lineData[503]++;
    var t = Math.max(r1['top'], r2.top), r = Math.min(r1.right, r2.right), b = Math.min(r1['bottom'], r2.bottom), l = Math.max(r1.left, r2.left);
    _$jscoverage['/dd/ddm.js'].lineData[507]++;
    return {
  left: l, 
  right: r, 
  top: t, 
  bottom: b};
  }
  _$jscoverage['/dd/ddm.js'].lineData[515]++;
  function inNodeByPointer(node, point) {
    _$jscoverage['/dd/ddm.js'].functionData[23]++;
    _$jscoverage['/dd/ddm.js'].lineData[516]++;
    return inRegion(region(node), point);
  }
  _$jscoverage['/dd/ddm.js'].lineData[519]++;
  function cacheWH(node) {
    _$jscoverage['/dd/ddm.js'].functionData[24]++;
    _$jscoverage['/dd/ddm.js'].lineData[520]++;
    if (visit59_520_1(node)) {
      _$jscoverage['/dd/ddm.js'].lineData[521]++;
      node.__dd_cached_width = node.outerWidth();
      _$jscoverage['/dd/ddm.js'].lineData[522]++;
      node.__dd_cached_height = node.outerHeight();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[526]++;
  var ddm = new DDM();
  _$jscoverage['/dd/ddm.js'].lineData[527]++;
  ddm.inRegion = inRegion;
  _$jscoverage['/dd/ddm.js'].lineData[528]++;
  ddm.region = region;
  _$jscoverage['/dd/ddm.js'].lineData[529]++;
  ddm.area = area;
  _$jscoverage['/dd/ddm.js'].lineData[530]++;
  ddm.cacheWH = cacheWH;
  _$jscoverage['/dd/ddm.js'].lineData[531]++;
  ddm.PREFIX_CLS = 'ks-dd-';
  _$jscoverage['/dd/ddm.js'].lineData[533]++;
  return ddm;
}, {
  requires: ['node', 'base']});
