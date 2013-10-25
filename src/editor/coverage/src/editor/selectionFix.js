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
  _$jscoverage['/editor/selectionFix.js'].lineData[23] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[24] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[30] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[31] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[33] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[34] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[37] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[40] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[44] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[45] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[48] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[49] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[51] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[52] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[53] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[57] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[58] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[61] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[63] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[65] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[67] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[68] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[70] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[72] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[75] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[81] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[82] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[83] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[84] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[85] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[88] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[89] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[92] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[94] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[95] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[97] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[98] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[100] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[101] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[108] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[109] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[117] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[122] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[123] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[124] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[125] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[136] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[145] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[150] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[153] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[154] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[174] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[175] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[178] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[179] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[183] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[185] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[188] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[189] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[195] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[199] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[202] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[203] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[206] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[209] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[210] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[214] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[215] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[239] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[241] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[243] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[245] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[246] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[247] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[251] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[253] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[254] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[267] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[272] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[273] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[275] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[277] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[282] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[283] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[288] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[290] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[293] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[297] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[298] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[300] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[301] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[302] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[303] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[308] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[309] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[313] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[315] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[318] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[330] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[333] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[337] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[338] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[341] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[344] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[345] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[349] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[350] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[351] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[354] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[355] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[361] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[363] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[372] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[373] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[375] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[384] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[388] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[389] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[393] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[394] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[395] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[401] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[402] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[403] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[405] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[406] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[408] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[409] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[411] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[414] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[421] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[423] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[430] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[435] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[437] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[439] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[440] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[441] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[442] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[448] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[450] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[452] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[453] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[454] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[456] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[461] = 0;
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
}
if (! _$jscoverage['/editor/selectionFix.js'].branchData) {
  _$jscoverage['/editor/selectionFix.js'].branchData = {};
  _$jscoverage['/editor/selectionFix.js'].branchData['48'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['48'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['48'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['61'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['65'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['67'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['83'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['84'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['88'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['95'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['118'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['124'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['178'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['183'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['188'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['209'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['253'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['255'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['256'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['267'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['267'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['267'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['272'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['283'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['283'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['283'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['283'][4] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['284'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['285'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['286'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['290'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['345'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['345'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['351'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['355'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['366'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['372'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['373'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['374'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['375'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['377'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['379'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['379'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['379'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['379'][4] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['381'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['381'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['388'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['388'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['393'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['395'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['399'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['401'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['403'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['404'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['404'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['409'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['410'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['410'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['439'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['441'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['452'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['452'][1] = new BranchData();
}
_$jscoverage['/editor/selectionFix.js'].branchData['452'][1].init(86, 5, 'UA.ie');
function visit807_452_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['441'][1].init(100, 9, '!UA[\'ie\']');
function visit806_441_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['439'][1].init(3654, 41, 'lastPath.blockLimit.nodeName() !== \'body\'');
function visit805_439_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['410'][2].init(152, 48, 'element[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit804_410_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['410'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['410'][1].init(43, 80, 'element[0].nodeType == Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit803_410_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['409'][1].init(106, 124, 'element && element[0].nodeType == Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit802_409_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['404'][2].init(144, 48, 'element[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit801_404_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['404'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['404'][1].init(39, 82, 'element[0].nodeType == Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit800_404_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['403'][1].init(102, 122, 'element && element[0].nodeType == Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit799_403_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['401'][1].init(82, 28, 'isBlankParagraph(fixedBlock)');
function visit798_401_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['399'][1].init(220, 34, 'fixedBlock[0] != body[0].lastChild');
function visit797_399_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['395'][1].init(83, 255, 'fixedBlock && fixedBlock[0] != body[0].lastChild');
function visit796_395_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['393'][1].init(1426, 31, 'blockLimit.nodeName() == "body"');
function visit795_393_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['388'][2].init(1301, 30, '!range.collapsed || path.block');
function visit794_388_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['388'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['388'][1].init(1291, 40, '!range || !range.collapsed || path.block');
function visit793_388_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['381'][2].init(471, 29, 'pathBlock.nodeName() != \'pre\'');
function visit792_381_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['381'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['381'][1].init(132, 123, 'pathBlock.nodeName() != \'pre\' && !pathBlock._4e_getBogus()');
function visit791_381_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['379'][4].init(352, 25, 'lastNode[0].nodeType == 1');
function visit790_379_4(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['379'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['379'][3].init(352, 59, 'lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()');
function visit789_379_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['379'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['379'][2].init(340, 71, 'lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()');
function visit788_379_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['379'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['379'][1].init(101, 256, '!(lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()) && pathBlock.nodeName() != \'pre\' && !pathBlock._4e_getBogus()');
function visit787_379_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['377'][1].init(72, 358, 'pathBlock._4e_isBlockBoundary() && !(lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()) && pathBlock.nodeName() != \'pre\' && !pathBlock._4e_getBogus()');
function visit786_377_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['375'][1].init(159, 431, 'pathBlock && pathBlock._4e_isBlockBoundary() && !(lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()) && pathBlock.nodeName() != \'pre\' && !pathBlock._4e_getBogus()');
function visit785_375_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['374'][1].init(78, 39, 'pathBlock && pathBlock.last(isNotEmpty)');
function visit784_374_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['373'][1].init(34, 29, 'path.block || path.blockLimit');
function visit783_373_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['372'][1].init(580, 11, 'UA[\'gecko\']');
function visit782_372_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['366'][1].init(153, 37, 'selection && selection.getRanges()[0]');
function visit781_366_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['355'][1].init(21, 44, 'isNotWhitespace(node) && isNotBookmark(node)');
function visit780_355_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['351'][1].init(62, 65, 'element._4e_isBlockBoundary() && dtd.$empty[element.nodeName()]');
function visit779_351_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['345'][2].init(46, 18, 'node.nodeType != 8');
function visit778_345_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['345'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['345'][1].init(21, 43, 'isNotWhitespace(node) && node.nodeType != 8');
function visit777_345_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['290'][1].init(1875, 33, 'nativeSel && sel.getRanges()[0]');
function visit776_290_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['286'][1].init(65, 109, '(parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit775_286_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['285'][1].init(63, 175, '(parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit774_285_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['284'][1].init(53, 239, '(parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit773_284_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['283'][4].init(1500, 27, 'nativeSel.type != \'Control\'');
function visit772_283_4(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['283'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['283'][3].init(1500, 293, 'nativeSel.type != \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit771_283_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['283'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['283'][2].init(1482, 311, 'nativeSel.type && nativeSel.type != \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit770_283_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['283'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['283'][1].init(1469, 324, 'nativeSel && nativeSel.type && nativeSel.type != \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit769_283_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['272'][1].init(281, 42, '!doc[\'queryCommandEnabled\'](\'InsertImage\')');
function visit768_272_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['267'][3].init(728, 26, 'type == KES.SELECTION_NONE');
function visit767_267_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['267'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['267'][2].init(715, 39, 'nativeSel && type == KES.SELECTION_NONE');
function visit766_267_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['267'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['267'][1].init(705, 49, 'testIt && nativeSel && type == KES.SELECTION_NONE');
function visit765_267_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['256'][1].init(115, 20, 'sel && doc.selection');
function visit764_256_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['255'][1].init(60, 20, 'sel && sel.getType()');
function visit763_255_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['253'][1].init(58, 11, 'saveEnabled');
function visit762_253_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['209'][1].init(181, 17, 'evt.relatedTarget');
function visit761_209_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['188'][1].init(122, 14, 'restoreEnabled');
function visit760_188_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['183'][1].init(356, 10, 'savedRange');
function visit759_183_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['178'][1].init(204, 22, 't.nodeName() != \'body\'');
function visit758_178_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['124'][1].init(69, 23, 't.nodeName() === "html"');
function visit757_124_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['118'][1].init(31, 25, 'Editor.Utils.ieEngine < 8');
function visit756_118_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['95'][1].init(518, 8, 'startRng');
function visit755_95_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['88'][1].init(233, 37, 'html.scrollHeight > html.clientHeight');
function visit754_88_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['84'][1].init(22, 7, 'started');
function visit753_84_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['83'][1].init(63, 17, 'e.target === html');
function visit752_83_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['67'][1].init(121, 55, 'pointRng.compareEndPoints(\'StartToStart\', startRng) > 0');
function visit751_67_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['65'][1].init(137, 8, 'pointRng');
function visit750_65_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['61'][1].init(98, 8, 'e.button');
function visit749_61_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['48'][3].init(169, 45, 'rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit748_48_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['48'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['48'][2].init(156, 58, '!rng.item && rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit747_48_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['48'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['48'][1].init(144, 70, 'startRng && !rng.item && rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit746_48_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].lineData[10]++;
KISSY.add("editor/selectionFix", function(S, Editor, Event) {
  _$jscoverage['/editor/selectionFix.js'].functionData[0]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[11]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, Dom = S.DOM, Node = S.Node, KES = Editor.SelectionType;
  _$jscoverage['/editor/selectionFix.js'].lineData[23]++;
  function fixCursorForIE(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[1]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[24]++;
    var started, win = editor.get("window")[0], doc = editor.get("document")[0], startRng;
    _$jscoverage['/editor/selectionFix.js'].lineData[30]++;
    function rngFromPoint(x, y) {
      _$jscoverage['/editor/selectionFix.js'].functionData[2]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[31]++;
      var rng = doc.body.createTextRange();
      _$jscoverage['/editor/selectionFix.js'].lineData[33]++;
      try {
        _$jscoverage['/editor/selectionFix.js'].lineData[34]++;
        rng['moveToPoint'](x, y);
      }      catch (ex) {
  _$jscoverage['/editor/selectionFix.js'].lineData[37]++;
  rng = NULL;
}
      _$jscoverage['/editor/selectionFix.js'].lineData[40]++;
      return rng;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[44]++;
    function endSelection() {
      _$jscoverage['/editor/selectionFix.js'].functionData[3]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[45]++;
      var rng = doc.selection.createRange();
      _$jscoverage['/editor/selectionFix.js'].lineData[48]++;
      if (visit746_48_1(startRng && visit747_48_2(!rng.item && visit748_48_3(rng.compareEndPoints('StartToEnd', rng) === 0)))) {
        _$jscoverage['/editor/selectionFix.js'].lineData[49]++;
        startRng.select();
      }
      _$jscoverage['/editor/selectionFix.js'].lineData[51]++;
      Event.remove(doc, 'mouseup', endSelection);
      _$jscoverage['/editor/selectionFix.js'].lineData[52]++;
      Event.remove(doc, 'mousemove', selectionChange);
      _$jscoverage['/editor/selectionFix.js'].lineData[53]++;
      startRng = started = 0;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[57]++;
    function selectionChange(e) {
      _$jscoverage['/editor/selectionFix.js'].functionData[4]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[58]++;
      var pointRng;
      _$jscoverage['/editor/selectionFix.js'].lineData[61]++;
      if (visit749_61_1(e.button)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[63]++;
        pointRng = rngFromPoint(e.pageX, e.pageY);
        _$jscoverage['/editor/selectionFix.js'].lineData[65]++;
        if (visit750_65_1(pointRng)) {
          _$jscoverage['/editor/selectionFix.js'].lineData[67]++;
          if (visit751_67_1(pointRng.compareEndPoints('StartToStart', startRng) > 0)) {
            _$jscoverage['/editor/selectionFix.js'].lineData[68]++;
            pointRng.setEndPoint('StartToStart', startRng);
          } else {
            _$jscoverage['/editor/selectionFix.js'].lineData[70]++;
            pointRng.setEndPoint('EndToEnd', startRng);
          }
          _$jscoverage['/editor/selectionFix.js'].lineData[72]++;
          pointRng.select();
        }
      } else {
        _$jscoverage['/editor/selectionFix.js'].lineData[75]++;
        endSelection();
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[81]++;
    Event.on(doc, "mousedown contextmenu", function(e) {
  _$jscoverage['/editor/selectionFix.js'].functionData[5]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[82]++;
  var html = doc.documentElement;
  _$jscoverage['/editor/selectionFix.js'].lineData[83]++;
  if (visit752_83_1(e.target === html)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[84]++;
    if (visit753_84_1(started)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[85]++;
      endSelection();
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[88]++;
    if (visit754_88_1(html.scrollHeight > html.clientHeight)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[89]++;
      return;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[92]++;
    started = 1;
    _$jscoverage['/editor/selectionFix.js'].lineData[94]++;
    startRng = rngFromPoint(e.pageX, e.pageY);
    _$jscoverage['/editor/selectionFix.js'].lineData[95]++;
    if (visit755_95_1(startRng)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[97]++;
      Event.on(doc, 'mouseup', endSelection);
      _$jscoverage['/editor/selectionFix.js'].lineData[98]++;
      Event.on(doc, 'mousemove', selectionChange);
      _$jscoverage['/editor/selectionFix.js'].lineData[100]++;
      win.focus();
      _$jscoverage['/editor/selectionFix.js'].lineData[101]++;
      startRng.select();
    }
  }
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[108]++;
  function fixSelectionForIEWhenDocReady(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[6]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[109]++;
    var doc = editor.get("document")[0], body = new Node(doc.body), html = new Node(doc.documentElement);
    _$jscoverage['/editor/selectionFix.js'].lineData[117]++;
    if (visit756_118_1(Editor.Utils.ieEngine < 8)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[122]++;
      html.on('click', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[7]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[123]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor/selectionFix.js'].lineData[124]++;
  if (visit757_124_1(t.nodeName() === "html")) {
    _$jscoverage['/editor/selectionFix.js'].lineData[125]++;
    editor.getSelection().getNative().createRange().select();
  }
});
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[136]++;
    var savedRange, saveEnabled, restoreEnabled = TRUE;
    _$jscoverage['/editor/selectionFix.js'].lineData[145]++;
    html.on('mousedown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[8]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[150]++;
  restoreEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[153]++;
    html.on('mouseup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[9]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[154]++;
  restoreEnabled = TRUE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[174]++;
    body.on('focusin', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[10]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[175]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor/selectionFix.js'].lineData[178]++;
  if (visit758_178_1(t.nodeName() != 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[179]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[183]++;
  if (visit759_183_1(savedRange)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[185]++;
    try {
      _$jscoverage['/editor/selectionFix.js'].lineData[188]++;
      if (visit760_188_1(restoreEnabled)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[189]++;
        savedRange.select();
      }
    }    catch (e) {
}
    _$jscoverage['/editor/selectionFix.js'].lineData[195]++;
    savedRange = NULL;
  }
});
    _$jscoverage['/editor/selectionFix.js'].lineData[199]++;
    body.on('focus', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[11]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[202]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[203]++;
  saveSelection();
});
    _$jscoverage['/editor/selectionFix.js'].lineData[206]++;
    body.on('beforedeactivate', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[12]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[209]++;
  if (visit761_209_1(evt.relatedTarget)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[210]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[214]++;
  saveEnabled = FALSE;
  _$jscoverage['/editor/selectionFix.js'].lineData[215]++;
  restoreEnabled = TRUE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[239]++;
    body.on('mousedown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[13]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[241]++;
  saveEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[243]++;
    body.on('mouseup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[14]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[245]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[246]++;
  setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[15]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[247]++;
  saveSelection(TRUE);
}, 0);
});
    _$jscoverage['/editor/selectionFix.js'].lineData[251]++;
    function saveSelection(testIt) {
      _$jscoverage['/editor/selectionFix.js'].functionData[16]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[253]++;
      if (visit762_253_1(saveEnabled)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[254]++;
        var sel = editor.getSelection(), type = visit763_255_1(sel && sel.getType()), nativeSel = visit764_256_1(sel && doc.selection);
        _$jscoverage['/editor/selectionFix.js'].lineData[267]++;
        if (visit765_267_1(testIt && visit766_267_2(nativeSel && visit767_267_3(type == KES.SELECTION_NONE)))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[272]++;
          if (visit768_272_1(!doc['queryCommandEnabled']('InsertImage'))) {
            _$jscoverage['/editor/selectionFix.js'].lineData[273]++;
            setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[17]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[275]++;
  saveSelection(TRUE);
}, 50);
            _$jscoverage['/editor/selectionFix.js'].lineData[277]++;
            return;
          }
        }
        _$jscoverage['/editor/selectionFix.js'].lineData[282]++;
        var parentTag;
        _$jscoverage['/editor/selectionFix.js'].lineData[283]++;
        if (visit769_283_1(nativeSel && visit770_283_2(nativeSel.type && visit771_283_3(visit772_283_4(nativeSel.type != 'Control') && visit773_284_1((parentTag = nativeSel.createRange()) && visit774_285_1((parentTag = parentTag.parentElement()) && visit775_286_1((parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {
  input: 1, 
  textarea: 1}))))))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[288]++;
          return;
        }
        _$jscoverage['/editor/selectionFix.js'].lineData[290]++;
        savedRange = visit776_290_1(nativeSel && sel.getRanges()[0]);
        _$jscoverage['/editor/selectionFix.js'].lineData[293]++;
        editor.checkSelectionChange();
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[297]++;
    body.on('keydown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[18]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[298]++;
  saveEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[300]++;
    body.on('keyup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[19]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[301]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[302]++;
  setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[20]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[303]++;
  saveSelection();
}, 0);
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[308]++;
  function fireSelectionChangeForNonIE(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[21]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[309]++;
    var doc = editor.get("document")[0];
    _$jscoverage['/editor/selectionFix.js'].lineData[313]++;
    function monitor() {
      _$jscoverage['/editor/selectionFix.js'].functionData[22]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[315]++;
      editor.checkSelectionChange();
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[318]++;
    Event.on(doc, 'mouseup keyup ' + 'selectionchange', monitor);
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[330]++;
  function monitorSelectionChange(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[23]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[333]++;
    var emptyParagraphRegexp = /\s*<(p|div|address|h\d|center)[^>]*>\s*(?:<br[^>]*>|&nbsp;|\u00A0|&#160;|(<!--[\s\S]*?-->))?\s*(:?<\/\1>)?(?=\s*$|<\/body>)/gi;
    _$jscoverage['/editor/selectionFix.js'].lineData[337]++;
    function isBlankParagraph(block) {
      _$jscoverage['/editor/selectionFix.js'].functionData[24]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[338]++;
      return block.outerHtml().match(emptyParagraphRegexp);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[341]++;
    var isNotWhitespace = Editor.Walker.whitespaces(TRUE), isNotBookmark = Editor.Walker.bookmark(FALSE, TRUE);
    _$jscoverage['/editor/selectionFix.js'].lineData[344]++;
    var nextValidEl = function(node) {
  _$jscoverage['/editor/selectionFix.js'].functionData[25]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[345]++;
  return visit777_345_1(isNotWhitespace(node) && visit778_345_2(node.nodeType != 8));
};
    _$jscoverage['/editor/selectionFix.js'].lineData[349]++;
    function cannotCursorPlaced(element) {
      _$jscoverage['/editor/selectionFix.js'].functionData[26]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[350]++;
      var dtd = Editor.XHTML_DTD;
      _$jscoverage['/editor/selectionFix.js'].lineData[351]++;
      return visit779_351_1(element._4e_isBlockBoundary() && dtd.$empty[element.nodeName()]);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[354]++;
    function isNotEmpty(node) {
      _$jscoverage['/editor/selectionFix.js'].functionData[27]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[355]++;
      return visit780_355_1(isNotWhitespace(node) && isNotBookmark(node));
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[361]++;
    editor.on("selectionChange", function(ev) {
  _$jscoverage['/editor/selectionFix.js'].functionData[28]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[363]++;
  var path = ev.path, body = new Node(editor.get("document")[0].body), selection = ev.selection, range = visit781_366_1(selection && selection.getRanges()[0]), blockLimit = path.blockLimit;
  _$jscoverage['/editor/selectionFix.js'].lineData[372]++;
  if (visit782_372_1(UA['gecko'])) {
    _$jscoverage['/editor/selectionFix.js'].lineData[373]++;
    var pathBlock = visit783_373_1(path.block || path.blockLimit), lastNode = visit784_374_1(pathBlock && pathBlock.last(isNotEmpty));
    _$jscoverage['/editor/selectionFix.js'].lineData[375]++;
    if (visit785_375_1(pathBlock && visit786_377_1(pathBlock._4e_isBlockBoundary() && visit787_379_1(!(visit788_379_2(lastNode && visit789_379_3(visit790_379_4(lastNode[0].nodeType == 1) && lastNode._4e_isBlockBoundary()))) && visit791_381_1(visit792_381_2(pathBlock.nodeName() != 'pre') && !pathBlock._4e_getBogus()))))) {
      _$jscoverage['/editor/selectionFix.js'].lineData[384]++;
      pathBlock._4e_appendBogus();
    }
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[388]++;
  if (visit793_388_1(!range || visit794_388_2(!range.collapsed || path.block))) {
    _$jscoverage['/editor/selectionFix.js'].lineData[389]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[393]++;
  if (visit795_393_1(blockLimit.nodeName() == "body")) {
    _$jscoverage['/editor/selectionFix.js'].lineData[394]++;
    var fixedBlock = range.fixBlock(TRUE, "p");
    _$jscoverage['/editor/selectionFix.js'].lineData[395]++;
    if (visit796_395_1(fixedBlock && visit797_399_1(fixedBlock[0] != body[0].lastChild))) {
      _$jscoverage['/editor/selectionFix.js'].lineData[401]++;
      if (visit798_401_1(isBlankParagraph(fixedBlock))) {
        _$jscoverage['/editor/selectionFix.js'].lineData[402]++;
        var element = fixedBlock.next(nextValidEl, 1);
        _$jscoverage['/editor/selectionFix.js'].lineData[403]++;
        if (visit799_403_1(element && visit800_404_1(visit801_404_2(element[0].nodeType == Dom.NodeType.ELEMENT_NODE) && !cannotCursorPlaced[element]))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[405]++;
          range.moveToElementEditablePosition(element);
          _$jscoverage['/editor/selectionFix.js'].lineData[406]++;
          fixedBlock._4e_remove();
        } else {
          _$jscoverage['/editor/selectionFix.js'].lineData[408]++;
          element = fixedBlock.prev(nextValidEl, 1);
          _$jscoverage['/editor/selectionFix.js'].lineData[409]++;
          if (visit802_409_1(element && visit803_410_1(visit804_410_2(element[0].nodeType == Dom.NodeType.ELEMENT_NODE) && !cannotCursorPlaced[element]))) {
            _$jscoverage['/editor/selectionFix.js'].lineData[411]++;
            range.moveToElementEditablePosition(element, isBlankParagraph(element) ? FALSE : TRUE);
            _$jscoverage['/editor/selectionFix.js'].lineData[414]++;
            fixedBlock._4e_remove();
          } else {
          }
        }
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[421]++;
    range.select();
    _$jscoverage['/editor/selectionFix.js'].lineData[423]++;
    editor.notifySelectionChange();
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[430]++;
  var doc = editor.get("document")[0], lastRange = new Editor.Range(doc), lastPath, editBlock;
  _$jscoverage['/editor/selectionFix.js'].lineData[435]++;
  lastRange.moveToElementEditablePosition(body, TRUE);
  _$jscoverage['/editor/selectionFix.js'].lineData[437]++;
  lastPath = new Editor.ElementPath(lastRange.startContainer);
  _$jscoverage['/editor/selectionFix.js'].lineData[439]++;
  if (visit805_439_1(lastPath.blockLimit.nodeName() !== 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[440]++;
    editBlock = new Node(doc.createElement('p')).appendTo(body);
    _$jscoverage['/editor/selectionFix.js'].lineData[441]++;
    if (visit806_441_1(!UA['ie'])) {
      _$jscoverage['/editor/selectionFix.js'].lineData[442]++;
      editBlock._4e_appendBogus();
    }
  }
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[448]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/selectionFix.js'].functionData[29]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[450]++;
  editor.docReady(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[30]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[452]++;
  if (visit807_452_1(UA.ie)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[453]++;
    fixCursorForIE(editor);
    _$jscoverage['/editor/selectionFix.js'].lineData[454]++;
    fixSelectionForIEWhenDocReady(editor);
  } else {
    _$jscoverage['/editor/selectionFix.js'].lineData[456]++;
    fireSelectionChangeForNonIE(editor);
  }
});
  _$jscoverage['/editor/selectionFix.js'].lineData[461]++;
  monitorSelectionChange(editor);
}};
}, {
  requires: ['./base', 'event', './selection', 'node']});
