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
if (! _$jscoverage['/editor/selectionFix.js']) {
  _$jscoverage['/editor/selectionFix.js'] = {};
  _$jscoverage['/editor/selectionFix.js'].lineData = [];
  _$jscoverage['/editor/selectionFix.js'].lineData[10] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[11] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[12] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[13] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[15] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[26] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[27] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[34] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[35] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[37] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[38] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[41] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[44] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[48] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[49] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[52] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[53] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[55] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[56] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[57] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[61] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[62] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[65] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[67] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[69] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[71] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[72] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[74] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[77] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[80] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[86] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[87] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[88] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[89] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[90] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[93] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[94] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[97] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[99] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[100] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[102] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[103] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[105] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[106] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[112] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[113] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[121] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[126] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[127] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[128] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[129] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[139] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[148] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[153] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[156] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[157] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[177] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[178] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[181] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[182] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[187] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[189] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[192] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[193] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[199] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[203] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[206] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[207] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[210] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[213] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[214] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[219] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[220] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[244] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[246] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[248] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[250] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[251] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[252] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[256] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[258] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[259] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[272] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[277] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[278] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[280] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[282] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[287] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[288] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[293] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[295] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[298] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[302] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[303] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[305] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[306] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[307] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[308] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[313] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[317] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[319] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[322] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[334] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[337] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[340] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[341] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[344] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[347] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[348] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[352] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[353] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[354] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[357] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[358] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[364] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[366] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[374] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[376] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[377] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[378] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[379] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[380] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[384] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[389] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[390] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[392] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[401] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[405] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[406] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[410] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[411] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[412] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[414] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[415] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[421] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[422] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[423] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[425] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[426] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[428] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[429] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[431] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[434] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[440] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[442] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[449] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[454] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[456] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[458] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[459] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[460] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[461] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[467] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[469] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[471] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[472] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[473] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[475] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[477] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[478] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[480] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[481] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[483] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[484] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[485] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[486] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[487] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[495] = 0;
}
if (! _$jscoverage['/editor/selectionFix.js'].functionData) {
  _$jscoverage['/editor/selectionFix.js'].functionData = [];
  _$jscoverage['/editor/selectionFix.js'].functionData[0] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[1] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[2] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[3] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[4] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[5] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[6] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[7] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[8] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[9] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[10] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[11] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[12] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[13] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[14] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[15] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[16] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[17] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[18] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[19] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[20] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[21] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[22] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[23] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[24] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[25] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[26] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[27] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[28] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[29] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[30] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[31] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[32] = 0;
}
if (! _$jscoverage['/editor/selectionFix.js'].branchData) {
  _$jscoverage['/editor/selectionFix.js'].branchData = {};
  _$jscoverage['/editor/selectionFix.js'].branchData['52'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['52'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['52'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['65'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['69'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['71'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['88'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['89'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['93'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['100'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['122'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['128'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['181'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['187'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['192'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['213'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['258'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['260'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['261'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['272'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['272'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['272'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['277'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['288'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['288'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['288'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['288'][4] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['289'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['290'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['291'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['295'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['348'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['348'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['354'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['358'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['370'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['374'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['378'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['384'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['389'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['390'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['391'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['392'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['394'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['396'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['396'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['396'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['396'][4] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['398'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['398'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['405'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['405'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['410'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['411'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['415'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['419'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['421'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['423'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['424'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['424'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['429'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['430'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['430'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['458'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['460'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['471'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['477'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['484'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['484'][1] = new BranchData();
}
_$jscoverage['/editor/selectionFix.js'].branchData['484'][1].init(33, 11, 'savedRanges');
function visit821_484_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['477'][1].init(163, 5, 'UA.ie');
function visit820_477_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['471'][1].init(84, 18, 'document.selection');
function visit819_471_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['460'][1].init(98, 6, '!UA.ie');
function visit818_460_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['458'][1].init(4138, 41, 'lastPath.blockLimit.nodeName() !== \'body\'');
function visit817_458_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['430'][2].init(149, 49, 'element[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit816_430_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['430'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['430'][1].init(42, 81, 'element[0].nodeType === Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit815_430_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['429'][1].init(104, 124, 'element && element[0].nodeType === Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit814_429_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['424'][2].init(141, 49, 'element[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit813_424_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['424'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['424'][1].init(38, 83, 'element[0].nodeType === Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit812_424_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['423'][1].init(100, 122, 'element && element[0].nodeType === Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit811_423_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['421'][1].init(80, 28, 'isBlankParagraph(fixedBlock)');
function visit810_421_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['419'][1].init(216, 35, 'fixedBlock[0] !== body[0].lastChild');
function visit809_419_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['415'][1].init(210, 252, 'fixedBlock && fixedBlock[0] !== body[0].lastChild');
function visit808_415_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['411'][1].init(21, 42, 'range.startContainer.nodeName() === \'html\'');
function visit807_411_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['410'][1].init(1866, 32, 'blockLimit.nodeName() === \'body\'');
function visit806_410_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['405'][2].init(1746, 30, '!range.collapsed || path.block');
function visit805_405_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['405'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['405'][1].init(1736, 40, '!range || !range.collapsed || path.block');
function visit804_405_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['398'][2].init(459, 30, 'pathBlock.nodeName() !== \'pre\'');
function visit803_398_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['398'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['398'][1].init(128, 121, 'pathBlock.nodeName() !== \'pre\' && !pathBlock._4eGetBogus()');
function visit802_398_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['396'][4].init(343, 26, 'lastNode[0].nodeType === 1');
function visit801_396_4(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['396'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['396'][3].init(343, 59, 'lastNode[0].nodeType === 1 && lastNode._4eIsBlockBoundary()');
function visit800_396_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['396'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['396'][2].init(331, 71, 'lastNode && lastNode[0].nodeType === 1 && lastNode._4eIsBlockBoundary()');
function visit799_396_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['396'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['396'][1].init(98, 250, '!(lastNode && lastNode[0].nodeType === 1 && lastNode._4eIsBlockBoundary()) && pathBlock.nodeName() !== \'pre\' && !pathBlock._4eGetBogus()');
function visit798_396_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['394'][1].init(70, 349, 'pathBlock._4eIsBlockBoundary() && !(lastNode && lastNode[0].nodeType === 1 && lastNode._4eIsBlockBoundary()) && pathBlock.nodeName() !== \'pre\' && !pathBlock._4eGetBogus()');
function visit797_394_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['392'][1].init(156, 420, 'pathBlock && pathBlock._4eIsBlockBoundary() && !(lastNode && lastNode[0].nodeType === 1 && lastNode._4eIsBlockBoundary()) && pathBlock.nodeName() !== \'pre\' && !pathBlock._4eGetBogus()');
function visit796_392_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['391'][1].init(77, 39, 'pathBlock && pathBlock.last(isNotEmpty)');
function visit795_391_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['390'][1].init(33, 29, 'path.block || path.blockLimit');
function visit794_390_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['389'][1].init(1048, 8, 'UA.gecko');
function visit793_389_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['384'][1].init(779, 18, 'blockLimit || body');
function visit792_384_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['378'][1].init(198, 5, 'range');
function visit791_378_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['374'][1].init(419, 8, '!body[0]');
function visit790_374_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['370'][1].init(189, 37, 'selection && selection.getRanges()[0]');
function visit789_370_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['358'][1].init(20, 44, 'isNotWhitespace(node) && isNotBookmark(node)');
function visit788_358_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['354'][1].init(60, 64, 'element._4eIsBlockBoundary() && dtd.$empty[element.nodeName()]');
function visit787_354_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['348'][2].init(45, 19, 'node.nodeType !== 8');
function visit786_348_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['348'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['348'][1].init(20, 44, 'isNotWhitespace(node) && node.nodeType !== 8');
function visit785_348_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['295'][1].init(1829, 33, 'nativeSel && sel.getRanges()[0]');
function visit784_295_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['291'][1].init(62, 105, '(parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit783_291_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['290'][1].init(60, 168, '(parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit782_290_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['289'][1].init(52, 229, '(parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit781_289_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['288'][4].init(1468, 28, 'nativeSel.type !== \'Control\'');
function visit780_288_4(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['288'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['288'][3].init(1468, 282, 'nativeSel.type !== \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit779_288_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['288'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['288'][2].init(1450, 300, 'nativeSel.type && nativeSel.type !== \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit778_288_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['288'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['288'][1].init(1437, 313, 'nativeSel && nativeSel.type && nativeSel.type !== \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit777_288_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['277'][1].init(276, 39, '!doc.queryCommandEnabled(\'InsertImage\')');
function visit776_277_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['272'][3].init(714, 27, 'type === KES.SELECTION_NONE');
function visit775_272_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['272'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['272'][2].init(701, 40, 'nativeSel && type === KES.SELECTION_NONE');
function visit774_272_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['272'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['272'][1].init(691, 50, 'testIt && nativeSel && type === KES.SELECTION_NONE');
function visit773_272_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['261'][1].init(113, 20, 'sel && doc.selection');
function visit772_261_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['260'][1].init(59, 20, 'sel && sel.getType()');
function visit771_260_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['258'][1].init(56, 11, 'saveEnabled');
function visit770_258_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['213'][1].init(178, 17, 'evt.relatedTarget');
function visit769_213_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['192'][1].init(119, 14, 'restoreEnabled');
function visit768_192_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['187'][1].init(364, 10, 'savedRange');
function visit767_187_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['181'][1].init(200, 23, 't.nodeName() !== \'body\'');
function visit766_181_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['128'][1].init(67, 23, 't.nodeName() === \'html\'');
function visit765_128_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['122'][1].init(30, 15, 'S.UA.ieMode < 8');
function visit764_122_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['100'][1].init(506, 8, 'startRng');
function visit763_100_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['93'][1].init(228, 37, 'html.scrollHeight > html.clientHeight');
function visit762_93_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['89'][1].init(21, 7, 'started');
function visit761_89_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['88'][1].init(61, 17, 'e.target === html');
function visit760_88_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['71'][1].init(119, 55, 'pointRng.compareEndPoints(\'StartToStart\', startRng) > 0');
function visit759_71_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['69'][1].init(133, 8, 'pointRng');
function visit758_69_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['65'][1].init(94, 8, 'e.button');
function visit757_65_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['52'][3].init(165, 45, 'rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit756_52_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['52'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['52'][2].init(152, 58, '!rng.item && rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit755_52_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['52'][1].init(140, 70, 'startRng && !rng.item && rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit754_52_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/selectionFix.js'].functionData[0]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[11]++;
  var Editor = require('./base');
  _$jscoverage['/editor/selectionFix.js'].lineData[12]++;
  require('./selection');
  _$jscoverage['/editor/selectionFix.js'].lineData[13]++;
  var Node = require('node');
  _$jscoverage['/editor/selectionFix.js'].lineData[15]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, Dom = S.DOM, KES = Editor.SelectionType;
  _$jscoverage['/editor/selectionFix.js'].lineData[26]++;
  function fixCursorForIE(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[1]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[27]++;
    var started, win = editor.get('window')[0], $doc = editor.get('document'), doc = $doc[0], startRng;
    _$jscoverage['/editor/selectionFix.js'].lineData[34]++;
    function rngFromPoint(x, y) {
      _$jscoverage['/editor/selectionFix.js'].functionData[2]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[35]++;
      var rng = doc.body.createTextRange();
      _$jscoverage['/editor/selectionFix.js'].lineData[37]++;
      try {
        _$jscoverage['/editor/selectionFix.js'].lineData[38]++;
        rng.moveToPoint(x, y);
      }      catch (ex) {
  _$jscoverage['/editor/selectionFix.js'].lineData[41]++;
  rng = NULL;
}
      _$jscoverage['/editor/selectionFix.js'].lineData[44]++;
      return rng;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[48]++;
    function endSelection() {
      _$jscoverage['/editor/selectionFix.js'].functionData[3]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[49]++;
      var rng = doc.selection.createRange();
      _$jscoverage['/editor/selectionFix.js'].lineData[52]++;
      if (visit754_52_1(startRng && visit755_52_2(!rng.item && visit756_52_3(rng.compareEndPoints('StartToEnd', rng) === 0)))) {
        _$jscoverage['/editor/selectionFix.js'].lineData[53]++;
        startRng.select();
      }
      _$jscoverage['/editor/selectionFix.js'].lineData[55]++;
      $doc.detach('mouseup', endSelection);
      _$jscoverage['/editor/selectionFix.js'].lineData[56]++;
      $doc.detach('mousemove', selectionChange);
      _$jscoverage['/editor/selectionFix.js'].lineData[57]++;
      startRng = started = 0;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[61]++;
    function selectionChange(e) {
      _$jscoverage['/editor/selectionFix.js'].functionData[4]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[62]++;
      var pointRng;
      _$jscoverage['/editor/selectionFix.js'].lineData[65]++;
      if (visit757_65_1(e.button)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[67]++;
        pointRng = rngFromPoint(e.pageX, e.pageY);
        _$jscoverage['/editor/selectionFix.js'].lineData[69]++;
        if (visit758_69_1(pointRng)) {
          _$jscoverage['/editor/selectionFix.js'].lineData[71]++;
          if (visit759_71_1(pointRng.compareEndPoints('StartToStart', startRng) > 0)) {
            _$jscoverage['/editor/selectionFix.js'].lineData[72]++;
            pointRng.setEndPoint('StartToStart', startRng);
          } else {
            _$jscoverage['/editor/selectionFix.js'].lineData[74]++;
            pointRng.setEndPoint('EndToEnd', startRng);
          }
          _$jscoverage['/editor/selectionFix.js'].lineData[77]++;
          pointRng.select();
        }
      } else {
        _$jscoverage['/editor/selectionFix.js'].lineData[80]++;
        endSelection();
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[86]++;
    $doc.on('mousedown contextmenu', function(e) {
  _$jscoverage['/editor/selectionFix.js'].functionData[5]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[87]++;
  var html = doc.documentElement;
  _$jscoverage['/editor/selectionFix.js'].lineData[88]++;
  if (visit760_88_1(e.target === html)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[89]++;
    if (visit761_89_1(started)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[90]++;
      endSelection();
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[93]++;
    if (visit762_93_1(html.scrollHeight > html.clientHeight)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[94]++;
      return;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[97]++;
    started = 1;
    _$jscoverage['/editor/selectionFix.js'].lineData[99]++;
    startRng = rngFromPoint(e.pageX, e.pageY);
    _$jscoverage['/editor/selectionFix.js'].lineData[100]++;
    if (visit763_100_1(startRng)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[102]++;
      $doc.on('mouseup', endSelection);
      _$jscoverage['/editor/selectionFix.js'].lineData[103]++;
      $doc.on('mousemove', selectionChange);
      _$jscoverage['/editor/selectionFix.js'].lineData[105]++;
      win.focus();
      _$jscoverage['/editor/selectionFix.js'].lineData[106]++;
      startRng.select();
    }
  }
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[112]++;
  function fixSelectionForIEWhenDocReady(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[6]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[113]++;
    var doc = editor.get('document')[0], body = new Node(doc.body), html = new Node(doc.documentElement);
    _$jscoverage['/editor/selectionFix.js'].lineData[121]++;
    if (visit764_122_1(S.UA.ieMode < 8)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[126]++;
      html.on('click', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[7]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[127]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor/selectionFix.js'].lineData[128]++;
  if (visit765_128_1(t.nodeName() === 'html')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[129]++;
    editor.getSelection().getNative().createRange().select();
  }
});
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[139]++;
    var savedRange, saveEnabled, restoreEnabled = TRUE;
    _$jscoverage['/editor/selectionFix.js'].lineData[148]++;
    html.on('mousedown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[8]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[153]++;
  restoreEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[156]++;
    html.on('mouseup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[9]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[157]++;
  restoreEnabled = TRUE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[177]++;
    body.on('focusin', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[10]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[178]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor/selectionFix.js'].lineData[181]++;
  if (visit766_181_1(t.nodeName() !== 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[182]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[187]++;
  if (visit767_187_1(savedRange)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[189]++;
    try {
      _$jscoverage['/editor/selectionFix.js'].lineData[192]++;
      if (visit768_192_1(restoreEnabled)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[193]++;
        savedRange.select();
      }
    }    catch (e) {
}
    _$jscoverage['/editor/selectionFix.js'].lineData[199]++;
    savedRange = NULL;
  }
});
    _$jscoverage['/editor/selectionFix.js'].lineData[203]++;
    body.on('focus', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[11]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[206]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[207]++;
  saveSelection();
});
    _$jscoverage['/editor/selectionFix.js'].lineData[210]++;
    body.on('beforedeactivate', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[12]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[213]++;
  if (visit769_213_1(evt.relatedTarget)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[214]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[219]++;
  saveEnabled = FALSE;
  _$jscoverage['/editor/selectionFix.js'].lineData[220]++;
  restoreEnabled = TRUE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[244]++;
    body.on('mousedown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[13]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[246]++;
  saveEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[248]++;
    body.on('mouseup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[14]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[250]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[251]++;
  setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[15]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[252]++;
  saveSelection(TRUE);
}, 0);
});
    _$jscoverage['/editor/selectionFix.js'].lineData[256]++;
    function saveSelection(testIt) {
      _$jscoverage['/editor/selectionFix.js'].functionData[16]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[258]++;
      if (visit770_258_1(saveEnabled)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[259]++;
        var sel = editor.getSelection(), type = visit771_260_1(sel && sel.getType()), nativeSel = visit772_261_1(sel && doc.selection);
        _$jscoverage['/editor/selectionFix.js'].lineData[272]++;
        if (visit773_272_1(testIt && visit774_272_2(nativeSel && visit775_272_3(type === KES.SELECTION_NONE)))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[277]++;
          if (visit776_277_1(!doc.queryCommandEnabled('InsertImage'))) {
            _$jscoverage['/editor/selectionFix.js'].lineData[278]++;
            setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[17]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[280]++;
  saveSelection(TRUE);
}, 50);
            _$jscoverage['/editor/selectionFix.js'].lineData[282]++;
            return;
          }
        }
        _$jscoverage['/editor/selectionFix.js'].lineData[287]++;
        var parentTag;
        _$jscoverage['/editor/selectionFix.js'].lineData[288]++;
        if (visit777_288_1(nativeSel && visit778_288_2(nativeSel.type && visit779_288_3(visit780_288_4(nativeSel.type !== 'Control') && visit781_289_1((parentTag = nativeSel.createRange()) && visit782_290_1((parentTag = parentTag.parentElement()) && visit783_291_1((parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {
  input: 1, 
  textarea: 1}))))))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[293]++;
          return;
        }
        _$jscoverage['/editor/selectionFix.js'].lineData[295]++;
        savedRange = visit784_295_1(nativeSel && sel.getRanges()[0]);
        _$jscoverage['/editor/selectionFix.js'].lineData[298]++;
        editor.checkSelectionChange();
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[302]++;
    body.on('keydown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[18]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[303]++;
  saveEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[305]++;
    body.on('keyup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[19]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[306]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[307]++;
  setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[20]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[308]++;
  saveSelection();
}, 0);
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[313]++;
  function fireSelectionChangeForStandard(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[21]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[317]++;
    function monitor() {
      _$jscoverage['/editor/selectionFix.js'].functionData[22]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[319]++;
      editor.checkSelectionChange();
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[322]++;
    editor.get('document').on('mouseup keyup ' + 'selectionchange', monitor);
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[334]++;
  function monitorSelectionChange(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[23]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[337]++;
    var emptyParagraphRegexp = /\s*<(p|div|address|h\d|center)[^>]*>\s*(?:<br[^>]*>|&nbsp;|\u00A0|&#160;|(<!--[\s\S]*?-->))?\s*(:?<\/\1>)?(?=\s*$|<\/body>)/gi;
    _$jscoverage['/editor/selectionFix.js'].lineData[340]++;
    function isBlankParagraph(block) {
      _$jscoverage['/editor/selectionFix.js'].functionData[24]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[341]++;
      return block.outerHtml().match(emptyParagraphRegexp);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[344]++;
    var isNotWhitespace = Editor.Walker.whitespaces(TRUE), isNotBookmark = Editor.Walker.bookmark(FALSE, TRUE);
    _$jscoverage['/editor/selectionFix.js'].lineData[347]++;
    var nextValidEl = function(node) {
  _$jscoverage['/editor/selectionFix.js'].functionData[25]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[348]++;
  return visit785_348_1(isNotWhitespace(node) && visit786_348_2(node.nodeType !== 8));
};
    _$jscoverage['/editor/selectionFix.js'].lineData[352]++;
    function cannotCursorPlaced(element) {
      _$jscoverage['/editor/selectionFix.js'].functionData[26]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[353]++;
      var dtd = Editor.XHTML_DTD;
      _$jscoverage['/editor/selectionFix.js'].lineData[354]++;
      return visit787_354_1(element._4eIsBlockBoundary() && dtd.$empty[element.nodeName()]);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[357]++;
    function isNotEmpty(node) {
      _$jscoverage['/editor/selectionFix.js'].functionData[27]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[358]++;
      return visit788_358_1(isNotWhitespace(node) && isNotBookmark(node));
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[364]++;
    editor.on('selectionChange', function(ev) {
  _$jscoverage['/editor/selectionFix.js'].functionData[28]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[366]++;
  var path = ev.path, editorDoc = editor.get('document')[0], body = new Node(editorDoc.body), selection = ev.selection, range = visit789_370_1(selection && selection.getRanges()[0]), blockLimit = path.blockLimit;
  _$jscoverage['/editor/selectionFix.js'].lineData[374]++;
  if (visit790_374_1(!body[0])) {
    _$jscoverage['/editor/selectionFix.js'].lineData[376]++;
    editorDoc.documentElement.appendChild(editorDoc.createElement('body'));
    _$jscoverage['/editor/selectionFix.js'].lineData[377]++;
    body = new Node(editorDoc.body);
    _$jscoverage['/editor/selectionFix.js'].lineData[378]++;
    if (visit791_378_1(range)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[379]++;
      range.setStart(body, 0);
      _$jscoverage['/editor/selectionFix.js'].lineData[380]++;
      range.collapse(1);
    }
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[384]++;
  blockLimit = visit792_384_1(blockLimit || body);
  _$jscoverage['/editor/selectionFix.js'].lineData[389]++;
  if (visit793_389_1(UA.gecko)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[390]++;
    var pathBlock = visit794_390_1(path.block || path.blockLimit), lastNode = visit795_391_1(pathBlock && pathBlock.last(isNotEmpty));
    _$jscoverage['/editor/selectionFix.js'].lineData[392]++;
    if (visit796_392_1(pathBlock && visit797_394_1(pathBlock._4eIsBlockBoundary() && visit798_396_1(!(visit799_396_2(lastNode && visit800_396_3(visit801_396_4(lastNode[0].nodeType === 1) && lastNode._4eIsBlockBoundary()))) && visit802_398_1(visit803_398_2(pathBlock.nodeName() !== 'pre') && !pathBlock._4eGetBogus()))))) {
      _$jscoverage['/editor/selectionFix.js'].lineData[401]++;
      pathBlock._4eAppendBogus();
    }
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[405]++;
  if (visit804_405_1(!range || visit805_405_2(!range.collapsed || path.block))) {
    _$jscoverage['/editor/selectionFix.js'].lineData[406]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[410]++;
  if (visit806_410_1(blockLimit.nodeName() === 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[411]++;
    if (visit807_411_1(range.startContainer.nodeName() === 'html')) {
      _$jscoverage['/editor/selectionFix.js'].lineData[412]++;
      range.setStart(body, 0);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[414]++;
    var fixedBlock = range.fixBlock(TRUE, 'p');
    _$jscoverage['/editor/selectionFix.js'].lineData[415]++;
    if (visit808_415_1(fixedBlock && visit809_419_1(fixedBlock[0] !== body[0].lastChild))) {
      _$jscoverage['/editor/selectionFix.js'].lineData[421]++;
      if (visit810_421_1(isBlankParagraph(fixedBlock))) {
        _$jscoverage['/editor/selectionFix.js'].lineData[422]++;
        var element = fixedBlock.next(nextValidEl, 1);
        _$jscoverage['/editor/selectionFix.js'].lineData[423]++;
        if (visit811_423_1(element && visit812_424_1(visit813_424_2(element[0].nodeType === Dom.NodeType.ELEMENT_NODE) && !cannotCursorPlaced[element]))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[425]++;
          range.moveToElementEditablePosition(element);
          _$jscoverage['/editor/selectionFix.js'].lineData[426]++;
          fixedBlock._4eRemove();
        } else {
          _$jscoverage['/editor/selectionFix.js'].lineData[428]++;
          element = fixedBlock.prev(nextValidEl, 1);
          _$jscoverage['/editor/selectionFix.js'].lineData[429]++;
          if (visit814_429_1(element && visit815_430_1(visit816_430_2(element[0].nodeType === Dom.NodeType.ELEMENT_NODE) && !cannotCursorPlaced[element]))) {
            _$jscoverage['/editor/selectionFix.js'].lineData[431]++;
            range.moveToElementEditablePosition(element, isBlankParagraph(element) ? FALSE : TRUE);
            _$jscoverage['/editor/selectionFix.js'].lineData[434]++;
            fixedBlock._4eRemove();
          }
        }
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[440]++;
    range.select();
    _$jscoverage['/editor/selectionFix.js'].lineData[442]++;
    editor.notifySelectionChange();
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[449]++;
  var doc = editor.get('document')[0], lastRange = new Editor.Range(doc), lastPath, editBlock;
  _$jscoverage['/editor/selectionFix.js'].lineData[454]++;
  lastRange.moveToElementEditablePosition(body, TRUE);
  _$jscoverage['/editor/selectionFix.js'].lineData[456]++;
  lastPath = new Editor.ElementPath(lastRange.startContainer);
  _$jscoverage['/editor/selectionFix.js'].lineData[458]++;
  if (visit817_458_1(lastPath.blockLimit.nodeName() !== 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[459]++;
    editBlock = new Node(doc.createElement('p')).appendTo(body);
    _$jscoverage['/editor/selectionFix.js'].lineData[460]++;
    if (visit818_460_1(!UA.ie)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[461]++;
      editBlock._4eAppendBogus();
    }
  }
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[467]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/selectionFix.js'].functionData[29]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[469]++;
  editor.docReady(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[30]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[471]++;
  if (visit819_471_1(document.selection)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[472]++;
    fixCursorForIE(editor);
    _$jscoverage['/editor/selectionFix.js'].lineData[473]++;
    fixSelectionForIEWhenDocReady(editor);
  } else {
    _$jscoverage['/editor/selectionFix.js'].lineData[475]++;
    fireSelectionChangeForStandard(editor);
    _$jscoverage['/editor/selectionFix.js'].lineData[477]++;
    if (visit820_477_1(UA.ie)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[478]++;
      var savedRanges, doc = editor.get('document');
      _$jscoverage['/editor/selectionFix.js'].lineData[480]++;
      doc.on('focusout', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[31]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[481]++;
  savedRanges = editor.getSelection().getRanges();
});
      _$jscoverage['/editor/selectionFix.js'].lineData[483]++;
      doc.on('focusin', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[32]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[484]++;
  if (visit821_484_1(savedRanges)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[485]++;
    var selection = editor.getSelection();
    _$jscoverage['/editor/selectionFix.js'].lineData[486]++;
    selection.selectRanges(savedRanges);
    _$jscoverage['/editor/selectionFix.js'].lineData[487]++;
    savedRanges = null;
  }
});
    }
  }
});
  _$jscoverage['/editor/selectionFix.js'].lineData[495]++;
  monitorSelectionChange(editor);
}};
});
