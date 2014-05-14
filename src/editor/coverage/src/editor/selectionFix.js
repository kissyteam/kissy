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
  _$jscoverage['/editor/selectionFix.js'].lineData[75] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[78] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[81] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[87] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[88] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[89] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[90] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[91] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[94] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[95] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[98] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[100] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[101] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[103] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[104] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[106] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[107] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[113] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[114] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[122] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[127] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[128] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[129] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[130] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[141] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[150] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[155] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[158] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[159] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[179] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[180] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[183] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[184] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[189] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[191] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[194] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[195] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[201] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[205] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[208] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[209] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[212] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[215] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[216] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[221] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[222] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[246] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[248] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[250] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[252] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[253] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[254] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[258] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[260] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[261] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[274] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[279] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[280] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[282] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[284] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[289] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[290] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[295] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[297] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[300] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[304] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[305] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[307] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[308] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[309] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[310] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[315] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[319] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[321] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[324] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[336] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[339] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[343] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[344] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[347] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[350] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[351] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[355] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[356] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[357] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[360] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[361] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[367] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[369] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[377] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[379] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[380] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[381] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[382] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[383] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[387] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[393] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[394] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[396] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[405] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[409] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[410] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[414] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[415] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[416] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[418] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[419] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[425] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[426] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[427] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[429] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[430] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[432] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[433] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[435] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[438] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[444] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[446] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[453] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[458] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[460] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[462] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[463] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[464] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[465] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[471] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[473] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[475] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[476] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[477] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[479] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[481] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[482] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[484] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[485] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[487] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[488] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[489] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[490] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[491] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[499] = 0;
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
  _$jscoverage['/editor/selectionFix.js'].branchData['89'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['90'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['94'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['101'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['123'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['129'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['183'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['189'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['194'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['215'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['260'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['262'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['263'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['274'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['274'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['274'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['279'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['290'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['290'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['290'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['290'][4] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['291'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['292'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['293'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['297'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['351'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['351'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['357'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['361'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['373'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['377'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['381'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['387'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['393'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['394'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['395'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['396'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['398'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['400'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][4] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['402'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['402'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['409'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['409'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['414'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['415'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['419'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['423'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['425'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['427'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['428'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['428'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['433'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['434'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['434'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['462'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['464'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['475'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['481'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['481'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['488'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['488'][1] = new BranchData();
}
_$jscoverage['/editor/selectionFix.js'].branchData['488'][1].init(33, 11, 'savedRanges');
function visit831_488_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['488'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['481'][1].init(163, 5, 'UA.ie');
function visit830_481_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['475'][1].init(84, 18, 'document.selection');
function visit829_475_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['464'][1].init(98, 6, '!UA.ie');
function visit828_464_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['462'][1].init(4141, 41, 'lastPath.blockLimit.nodeName() !== \'body\'');
function visit827_462_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['434'][2].init(149, 49, 'element[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit826_434_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['434'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['434'][1].init(42, 81, 'element[0].nodeType === Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit825_434_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['433'][1].init(104, 124, 'element && element[0].nodeType === Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit824_433_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['428'][2].init(141, 49, 'element[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit823_428_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['428'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['428'][1].init(38, 83, 'element[0].nodeType === Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit822_428_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['427'][1].init(100, 122, 'element && element[0].nodeType === Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit821_427_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['425'][1].init(80, 28, 'isBlankParagraph(fixedBlock)');
function visit820_425_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['423'][1].init(216, 35, 'fixedBlock[0] !== body[0].lastChild');
function visit819_423_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['419'][1].init(210, 252, 'fixedBlock && fixedBlock[0] !== body[0].lastChild');
function visit818_419_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['415'][1].init(21, 42, 'range.startContainer.nodeName() === \'html\'');
function visit817_415_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['414'][1].init(1869, 32, 'blockLimit.nodeName() === \'body\'');
function visit816_414_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['409'][2].init(1749, 30, '!range.collapsed || path.block');
function visit815_409_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['409'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['409'][1].init(1739, 40, '!range || !range.collapsed || path.block');
function visit814_409_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['402'][2].init(461, 30, 'pathBlock.nodeName() !== \'pre\'');
function visit813_402_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['402'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['402'][1].init(130, 121, 'pathBlock.nodeName() !== \'pre\' && !pathBlock._4eGetBogus()');
function visit812_402_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['400'][4].init(344, 26, 'lastNode[0].nodeType === 1');
function visit811_400_4(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['400'][3].init(344, 59, 'lastNode[0].nodeType === 1 && lastNode._4eIsBlockBoundary()');
function visit810_400_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['400'][2].init(332, 71, 'lastNode && lastNode[0].nodeType === 1 && lastNode._4eIsBlockBoundary()');
function visit809_400_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['400'][1].init(98, 252, '!(lastNode && lastNode[0].nodeType === 1 && lastNode._4eIsBlockBoundary()) && pathBlock.nodeName() !== \'pre\' && !pathBlock._4eGetBogus()');
function visit808_400_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['398'][1].init(70, 351, 'pathBlock._4eIsBlockBoundary() && !(lastNode && lastNode[0].nodeType === 1 && lastNode._4eIsBlockBoundary()) && pathBlock.nodeName() !== \'pre\' && !pathBlock._4eGetBogus()');
function visit807_398_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['396'][1].init(156, 422, 'pathBlock && pathBlock._4eIsBlockBoundary() && !(lastNode && lastNode[0].nodeType === 1 && lastNode._4eIsBlockBoundary()) && pathBlock.nodeName() !== \'pre\' && !pathBlock._4eGetBogus()');
function visit806_396_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['395'][1].init(77, 39, 'pathBlock && pathBlock.last(isNotEmpty)');
function visit805_395_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['394'][1].init(33, 29, 'path.block || path.blockLimit');
function visit804_394_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['393'][1].init(1049, 8, 'UA.gecko');
function visit803_393_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['387'][1].init(779, 18, 'blockLimit || body');
function visit802_387_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['381'][1].init(198, 5, 'range');
function visit801_381_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['377'][1].init(419, 8, '!body[0]');
function visit800_377_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['373'][1].init(189, 37, 'selection && selection.getRanges()[0]');
function visit799_373_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['361'][1].init(20, 44, 'isNotWhitespace(node) && isNotBookmark(node)');
function visit798_361_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['357'][1].init(60, 64, 'element._4eIsBlockBoundary() && dtd.$empty[element.nodeName()]');
function visit797_357_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['351'][2].init(45, 19, 'node.nodeType !== 8');
function visit796_351_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['351'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['351'][1].init(20, 44, 'isNotWhitespace(node) && node.nodeType !== 8');
function visit795_351_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['297'][1].init(1837, 33, 'nativeSel && sel.getRanges()[0]');
function visit794_297_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['293'][1].init(64, 108, '(parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit793_293_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['292'][1].init(62, 173, '(parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit792_292_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['291'][1].init(53, 236, '(parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit791_291_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['290'][4].init(1468, 28, 'nativeSel.type !== \'Control\'');
function visit790_290_4(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['290'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['290'][3].init(1468, 290, 'nativeSel.type !== \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit789_290_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['290'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['290'][2].init(1450, 308, 'nativeSel.type && nativeSel.type !== \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit788_290_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['290'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['290'][1].init(1437, 321, 'nativeSel && nativeSel.type && nativeSel.type !== \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit787_290_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['279'][1].init(276, 39, '!doc.queryCommandEnabled(\'InsertImage\')');
function visit786_279_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['274'][3].init(714, 27, 'type === KES.SELECTION_NONE');
function visit785_274_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['274'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['274'][2].init(701, 40, 'nativeSel && type === KES.SELECTION_NONE');
function visit784_274_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['274'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['274'][1].init(691, 50, 'testIt && nativeSel && type === KES.SELECTION_NONE');
function visit783_274_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['263'][1].init(113, 20, 'sel && doc.selection');
function visit782_263_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['262'][1].init(59, 20, 'sel && sel.getType()');
function visit781_262_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['260'][1].init(56, 11, 'saveEnabled');
function visit780_260_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['215'][1].init(178, 17, 'evt.relatedTarget');
function visit779_215_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['194'][1].init(119, 14, 'restoreEnabled');
function visit778_194_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['189'][1].init(364, 10, 'savedRange');
function visit777_189_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['183'][1].init(200, 23, 't.nodeName() !== \'body\'');
function visit776_183_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['129'][1].init(67, 23, 't.nodeName() === \'html\'');
function visit775_129_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['123'][1].init(30, 15, 'S.UA.ieMode < 8');
function visit774_123_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['101'][1].init(506, 8, 'startRng');
function visit773_101_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['94'][1].init(228, 37, 'html.scrollHeight > html.clientHeight');
function visit772_94_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['90'][1].init(21, 7, 'started');
function visit771_90_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['89'][1].init(61, 17, 'e.target === html');
function visit770_89_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['71'][1].init(119, 55, 'pointRng.compareEndPoints(\'StartToStart\', startRng) > 0');
function visit769_71_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['69'][1].init(133, 8, 'pointRng');
function visit768_69_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['65'][1].init(94, 8, 'e.button');
function visit767_65_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['52'][3].init(165, 45, 'rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit766_52_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['52'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['52'][2].init(152, 58, '!rng.item && rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit765_52_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['52'][1].init(140, 70, 'startRng && !rng.item && rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit764_52_1(result) {
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
      if (visit764_52_1(startRng && visit765_52_2(!rng.item && visit766_52_3(rng.compareEndPoints('StartToEnd', rng) === 0)))) {
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
      if (visit767_65_1(e.button)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[67]++;
        pointRng = rngFromPoint(e.pageX, e.pageY);
        _$jscoverage['/editor/selectionFix.js'].lineData[69]++;
        if (visit768_69_1(pointRng)) {
          _$jscoverage['/editor/selectionFix.js'].lineData[71]++;
          if (visit769_71_1(pointRng.compareEndPoints('StartToStart', startRng) > 0)) {
            _$jscoverage['/editor/selectionFix.js'].lineData[72]++;
            pointRng.setEndPoint('StartToStart', startRng);
          } else {
            _$jscoverage['/editor/selectionFix.js'].lineData[75]++;
            pointRng.setEndPoint('EndToEnd', startRng);
          }
          _$jscoverage['/editor/selectionFix.js'].lineData[78]++;
          pointRng.select();
        }
      } else {
        _$jscoverage['/editor/selectionFix.js'].lineData[81]++;
        endSelection();
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[87]++;
    $doc.on('mousedown contextmenu', function(e) {
  _$jscoverage['/editor/selectionFix.js'].functionData[5]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[88]++;
  var html = doc.documentElement;
  _$jscoverage['/editor/selectionFix.js'].lineData[89]++;
  if (visit770_89_1(e.target === html)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[90]++;
    if (visit771_90_1(started)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[91]++;
      endSelection();
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[94]++;
    if (visit772_94_1(html.scrollHeight > html.clientHeight)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[95]++;
      return;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[98]++;
    started = 1;
    _$jscoverage['/editor/selectionFix.js'].lineData[100]++;
    startRng = rngFromPoint(e.pageX, e.pageY);
    _$jscoverage['/editor/selectionFix.js'].lineData[101]++;
    if (visit773_101_1(startRng)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[103]++;
      $doc.on('mouseup', endSelection);
      _$jscoverage['/editor/selectionFix.js'].lineData[104]++;
      $doc.on('mousemove', selectionChange);
      _$jscoverage['/editor/selectionFix.js'].lineData[106]++;
      win.focus();
      _$jscoverage['/editor/selectionFix.js'].lineData[107]++;
      startRng.select();
    }
  }
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[113]++;
  function fixSelectionForIEWhenDocReady(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[6]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[114]++;
    var doc = editor.get('document')[0], body = new Node(doc.body), html = new Node(doc.documentElement);
    _$jscoverage['/editor/selectionFix.js'].lineData[122]++;
    if (visit774_123_1(S.UA.ieMode < 8)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[127]++;
      html.on('click', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[7]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[128]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor/selectionFix.js'].lineData[129]++;
  if (visit775_129_1(t.nodeName() === 'html')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[130]++;
    editor.getSelection().getNative().createRange().select();
  }
});
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[141]++;
    var savedRange, saveEnabled, restoreEnabled = TRUE;
    _$jscoverage['/editor/selectionFix.js'].lineData[150]++;
    html.on('mousedown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[8]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[155]++;
  restoreEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[158]++;
    html.on('mouseup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[9]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[159]++;
  restoreEnabled = TRUE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[179]++;
    body.on('focusin', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[10]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[180]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor/selectionFix.js'].lineData[183]++;
  if (visit776_183_1(t.nodeName() !== 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[184]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[189]++;
  if (visit777_189_1(savedRange)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[191]++;
    try {
      _$jscoverage['/editor/selectionFix.js'].lineData[194]++;
      if (visit778_194_1(restoreEnabled)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[195]++;
        savedRange.select();
      }
    }    catch (e) {
}
    _$jscoverage['/editor/selectionFix.js'].lineData[201]++;
    savedRange = NULL;
  }
});
    _$jscoverage['/editor/selectionFix.js'].lineData[205]++;
    body.on('focus', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[11]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[208]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[209]++;
  saveSelection();
});
    _$jscoverage['/editor/selectionFix.js'].lineData[212]++;
    body.on('beforedeactivate', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[12]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[215]++;
  if (visit779_215_1(evt.relatedTarget)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[216]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[221]++;
  saveEnabled = FALSE;
  _$jscoverage['/editor/selectionFix.js'].lineData[222]++;
  restoreEnabled = TRUE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[246]++;
    body.on('mousedown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[13]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[248]++;
  saveEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[250]++;
    body.on('mouseup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[14]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[252]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[253]++;
  setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[15]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[254]++;
  saveSelection(TRUE);
}, 0);
});
    _$jscoverage['/editor/selectionFix.js'].lineData[258]++;
    function saveSelection(testIt) {
      _$jscoverage['/editor/selectionFix.js'].functionData[16]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[260]++;
      if (visit780_260_1(saveEnabled)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[261]++;
        var sel = editor.getSelection(), type = visit781_262_1(sel && sel.getType()), nativeSel = visit782_263_1(sel && doc.selection);
        _$jscoverage['/editor/selectionFix.js'].lineData[274]++;
        if (visit783_274_1(testIt && visit784_274_2(nativeSel && visit785_274_3(type === KES.SELECTION_NONE)))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[279]++;
          if (visit786_279_1(!doc.queryCommandEnabled('InsertImage'))) {
            _$jscoverage['/editor/selectionFix.js'].lineData[280]++;
            setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[17]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[282]++;
  saveSelection(TRUE);
}, 50);
            _$jscoverage['/editor/selectionFix.js'].lineData[284]++;
            return;
          }
        }
        _$jscoverage['/editor/selectionFix.js'].lineData[289]++;
        var parentTag;
        _$jscoverage['/editor/selectionFix.js'].lineData[290]++;
        if (visit787_290_1(nativeSel && visit788_290_2(nativeSel.type && visit789_290_3(visit790_290_4(nativeSel.type !== 'Control') && visit791_291_1((parentTag = nativeSel.createRange()) && visit792_292_1((parentTag = parentTag.parentElement()) && visit793_293_1((parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {
  input: 1, 
  textarea: 1}))))))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[295]++;
          return;
        }
        _$jscoverage['/editor/selectionFix.js'].lineData[297]++;
        savedRange = visit794_297_1(nativeSel && sel.getRanges()[0]);
        _$jscoverage['/editor/selectionFix.js'].lineData[300]++;
        editor.checkSelectionChange();
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[304]++;
    body.on('keydown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[18]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[305]++;
  saveEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[307]++;
    body.on('keyup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[19]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[308]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[309]++;
  setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[20]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[310]++;
  saveSelection();
}, 0);
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[315]++;
  function fireSelectionChangeForStandard(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[21]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[319]++;
    function monitor() {
      _$jscoverage['/editor/selectionFix.js'].functionData[22]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[321]++;
      editor.checkSelectionChange();
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[324]++;
    editor.get('document').on('mouseup keyup ' + 'selectionchange', monitor);
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[336]++;
  function monitorSelectionChange(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[23]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[339]++;
    var emptyParagraphRegexp = /\s*<(p|div|address|h\d|center)[^>]*>\s*(?:<br[^>]*>|&nbsp;|\u00A0|&#160;|(<!--[\s\S]*?-->))?\s*(:?<\/\1>)?(?=\s*$|<\/body>)/gi;
    _$jscoverage['/editor/selectionFix.js'].lineData[343]++;
    function isBlankParagraph(block) {
      _$jscoverage['/editor/selectionFix.js'].functionData[24]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[344]++;
      return block.outerHtml().match(emptyParagraphRegexp);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[347]++;
    var isNotWhitespace = Editor.Walker.whitespaces(TRUE), isNotBookmark = Editor.Walker.bookmark(FALSE, TRUE);
    _$jscoverage['/editor/selectionFix.js'].lineData[350]++;
    var nextValidEl = function(node) {
  _$jscoverage['/editor/selectionFix.js'].functionData[25]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[351]++;
  return visit795_351_1(isNotWhitespace(node) && visit796_351_2(node.nodeType !== 8));
};
    _$jscoverage['/editor/selectionFix.js'].lineData[355]++;
    function cannotCursorPlaced(element) {
      _$jscoverage['/editor/selectionFix.js'].functionData[26]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[356]++;
      var dtd = Editor.XHTML_DTD;
      _$jscoverage['/editor/selectionFix.js'].lineData[357]++;
      return visit797_357_1(element._4eIsBlockBoundary() && dtd.$empty[element.nodeName()]);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[360]++;
    function isNotEmpty(node) {
      _$jscoverage['/editor/selectionFix.js'].functionData[27]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[361]++;
      return visit798_361_1(isNotWhitespace(node) && isNotBookmark(node));
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[367]++;
    editor.on('selectionChange', function(ev) {
  _$jscoverage['/editor/selectionFix.js'].functionData[28]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[369]++;
  var path = ev.path, editorDoc = editor.get('document')[0], body = new Node(editorDoc.body), selection = ev.selection, range = visit799_373_1(selection && selection.getRanges()[0]), blockLimit = path.blockLimit;
  _$jscoverage['/editor/selectionFix.js'].lineData[377]++;
  if (visit800_377_1(!body[0])) {
    _$jscoverage['/editor/selectionFix.js'].lineData[379]++;
    editorDoc.documentElement.appendChild(editorDoc.createElement('body'));
    _$jscoverage['/editor/selectionFix.js'].lineData[380]++;
    body = new Node(editorDoc.body);
    _$jscoverage['/editor/selectionFix.js'].lineData[381]++;
    if (visit801_381_1(range)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[382]++;
      range.setStart(body, 0);
      _$jscoverage['/editor/selectionFix.js'].lineData[383]++;
      range.collapse(1);
    }
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[387]++;
  blockLimit = visit802_387_1(blockLimit || body);
  _$jscoverage['/editor/selectionFix.js'].lineData[393]++;
  if (visit803_393_1(UA.gecko)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[394]++;
    var pathBlock = visit804_394_1(path.block || path.blockLimit), lastNode = visit805_395_1(pathBlock && pathBlock.last(isNotEmpty));
    _$jscoverage['/editor/selectionFix.js'].lineData[396]++;
    if (visit806_396_1(pathBlock && visit807_398_1(pathBlock._4eIsBlockBoundary() && visit808_400_1(!(visit809_400_2(lastNode && visit810_400_3(visit811_400_4(lastNode[0].nodeType === 1) && lastNode._4eIsBlockBoundary()))) && visit812_402_1(visit813_402_2(pathBlock.nodeName() !== 'pre') && !pathBlock._4eGetBogus()))))) {
      _$jscoverage['/editor/selectionFix.js'].lineData[405]++;
      pathBlock._4eAppendBogus();
    }
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[409]++;
  if (visit814_409_1(!range || visit815_409_2(!range.collapsed || path.block))) {
    _$jscoverage['/editor/selectionFix.js'].lineData[410]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[414]++;
  if (visit816_414_1(blockLimit.nodeName() === 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[415]++;
    if (visit817_415_1(range.startContainer.nodeName() === 'html')) {
      _$jscoverage['/editor/selectionFix.js'].lineData[416]++;
      range.setStart(body, 0);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[418]++;
    var fixedBlock = range.fixBlock(TRUE, 'p');
    _$jscoverage['/editor/selectionFix.js'].lineData[419]++;
    if (visit818_419_1(fixedBlock && visit819_423_1(fixedBlock[0] !== body[0].lastChild))) {
      _$jscoverage['/editor/selectionFix.js'].lineData[425]++;
      if (visit820_425_1(isBlankParagraph(fixedBlock))) {
        _$jscoverage['/editor/selectionFix.js'].lineData[426]++;
        var element = fixedBlock.next(nextValidEl, 1);
        _$jscoverage['/editor/selectionFix.js'].lineData[427]++;
        if (visit821_427_1(element && visit822_428_1(visit823_428_2(element[0].nodeType === Dom.NodeType.ELEMENT_NODE) && !cannotCursorPlaced[element]))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[429]++;
          range.moveToElementEditablePosition(element);
          _$jscoverage['/editor/selectionFix.js'].lineData[430]++;
          fixedBlock._4eRemove();
        } else {
          _$jscoverage['/editor/selectionFix.js'].lineData[432]++;
          element = fixedBlock.prev(nextValidEl, 1);
          _$jscoverage['/editor/selectionFix.js'].lineData[433]++;
          if (visit824_433_1(element && visit825_434_1(visit826_434_2(element[0].nodeType === Dom.NodeType.ELEMENT_NODE) && !cannotCursorPlaced[element]))) {
            _$jscoverage['/editor/selectionFix.js'].lineData[435]++;
            range.moveToElementEditablePosition(element, isBlankParagraph(element) ? FALSE : TRUE);
            _$jscoverage['/editor/selectionFix.js'].lineData[438]++;
            fixedBlock._4eRemove();
          }
        }
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[444]++;
    range.select();
    _$jscoverage['/editor/selectionFix.js'].lineData[446]++;
    editor.notifySelectionChange();
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[453]++;
  var doc = editor.get('document')[0], lastRange = new Editor.Range(doc), lastPath, editBlock;
  _$jscoverage['/editor/selectionFix.js'].lineData[458]++;
  lastRange.moveToElementEditablePosition(body, TRUE);
  _$jscoverage['/editor/selectionFix.js'].lineData[460]++;
  lastPath = new Editor.ElementPath(lastRange.startContainer);
  _$jscoverage['/editor/selectionFix.js'].lineData[462]++;
  if (visit827_462_1(lastPath.blockLimit.nodeName() !== 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[463]++;
    editBlock = new Node(doc.createElement('p')).appendTo(body);
    _$jscoverage['/editor/selectionFix.js'].lineData[464]++;
    if (visit828_464_1(!UA.ie)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[465]++;
      editBlock._4eAppendBogus();
    }
  }
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[471]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/selectionFix.js'].functionData[29]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[473]++;
  editor.docReady(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[30]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[475]++;
  if (visit829_475_1(document.selection)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[476]++;
    fixCursorForIE(editor);
    _$jscoverage['/editor/selectionFix.js'].lineData[477]++;
    fixSelectionForIEWhenDocReady(editor);
  } else {
    _$jscoverage['/editor/selectionFix.js'].lineData[479]++;
    fireSelectionChangeForStandard(editor);
    _$jscoverage['/editor/selectionFix.js'].lineData[481]++;
    if (visit830_481_1(UA.ie)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[482]++;
      var savedRanges, doc = editor.get('document');
      _$jscoverage['/editor/selectionFix.js'].lineData[484]++;
      doc.on('focusout', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[31]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[485]++;
  savedRanges = editor.getSelection().getRanges();
});
      _$jscoverage['/editor/selectionFix.js'].lineData[487]++;
      doc.on('focusin', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[32]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[488]++;
  if (visit831_488_1(savedRanges)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[489]++;
    var selection = editor.getSelection();
    _$jscoverage['/editor/selectionFix.js'].lineData[490]++;
    selection.selectRanges(savedRanges);
    _$jscoverage['/editor/selectionFix.js'].lineData[491]++;
    savedRanges = null;
  }
});
    }
  }
});
  _$jscoverage['/editor/selectionFix.js'].lineData[499]++;
  monitorSelectionChange(editor);
}};
});
