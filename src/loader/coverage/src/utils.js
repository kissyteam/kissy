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
if (! _$jscoverage['/utils.js']) {
  _$jscoverage['/utils.js'] = {};
  _$jscoverage['/utils.js'].lineData = [];
  _$jscoverage['/utils.js'].lineData[6] = 0;
  _$jscoverage['/utils.js'].lineData[7] = 0;
  _$jscoverage['/utils.js'].lineData[25] = 0;
  _$jscoverage['/utils.js'].lineData[26] = 0;
  _$jscoverage['/utils.js'].lineData[27] = 0;
  _$jscoverage['/utils.js'].lineData[29] = 0;
  _$jscoverage['/utils.js'].lineData[32] = 0;
  _$jscoverage['/utils.js'].lineData[33] = 0;
  _$jscoverage['/utils.js'].lineData[35] = 0;
  _$jscoverage['/utils.js'].lineData[39] = 0;
  _$jscoverage['/utils.js'].lineData[41] = 0;
  _$jscoverage['/utils.js'].lineData[42] = 0;
  _$jscoverage['/utils.js'].lineData[44] = 0;
  _$jscoverage['/utils.js'].lineData[45] = 0;
  _$jscoverage['/utils.js'].lineData[47] = 0;
  _$jscoverage['/utils.js'].lineData[50] = 0;
  _$jscoverage['/utils.js'].lineData[51] = 0;
  _$jscoverage['/utils.js'].lineData[52] = 0;
  _$jscoverage['/utils.js'].lineData[53] = 0;
  _$jscoverage['/utils.js'].lineData[54] = 0;
  _$jscoverage['/utils.js'].lineData[55] = 0;
  _$jscoverage['/utils.js'].lineData[58] = 0;
  _$jscoverage['/utils.js'].lineData[60] = 0;
  _$jscoverage['/utils.js'].lineData[65] = 0;
  _$jscoverage['/utils.js'].lineData[68] = 0;
  _$jscoverage['/utils.js'].lineData[69] = 0;
  _$jscoverage['/utils.js'].lineData[71] = 0;
  _$jscoverage['/utils.js'].lineData[72] = 0;
  _$jscoverage['/utils.js'].lineData[76] = 0;
  _$jscoverage['/utils.js'].lineData[77] = 0;
  _$jscoverage['/utils.js'].lineData[78] = 0;
  _$jscoverage['/utils.js'].lineData[80] = 0;
  _$jscoverage['/utils.js'].lineData[82] = 0;
  _$jscoverage['/utils.js'].lineData[85] = 0;
  _$jscoverage['/utils.js'].lineData[89] = 0;
  _$jscoverage['/utils.js'].lineData[90] = 0;
  _$jscoverage['/utils.js'].lineData[93] = 0;
  _$jscoverage['/utils.js'].lineData[95] = 0;
  _$jscoverage['/utils.js'].lineData[96] = 0;
  _$jscoverage['/utils.js'].lineData[98] = 0;
  _$jscoverage['/utils.js'].lineData[99] = 0;
  _$jscoverage['/utils.js'].lineData[100] = 0;
  _$jscoverage['/utils.js'].lineData[101] = 0;
  _$jscoverage['/utils.js'].lineData[102] = 0;
  _$jscoverage['/utils.js'].lineData[106] = 0;
  _$jscoverage['/utils.js'].lineData[107] = 0;
  _$jscoverage['/utils.js'].lineData[108] = 0;
  _$jscoverage['/utils.js'].lineData[109] = 0;
  _$jscoverage['/utils.js'].lineData[110] = 0;
  _$jscoverage['/utils.js'].lineData[116] = 0;
  _$jscoverage['/utils.js'].lineData[117] = 0;
  _$jscoverage['/utils.js'].lineData[118] = 0;
  _$jscoverage['/utils.js'].lineData[119] = 0;
  _$jscoverage['/utils.js'].lineData[121] = 0;
  _$jscoverage['/utils.js'].lineData[124] = 0;
  _$jscoverage['/utils.js'].lineData[125] = 0;
  _$jscoverage['/utils.js'].lineData[128] = 0;
  _$jscoverage['/utils.js'].lineData[129] = 0;
  _$jscoverage['/utils.js'].lineData[130] = 0;
  _$jscoverage['/utils.js'].lineData[132] = 0;
  _$jscoverage['/utils.js'].lineData[135] = 0;
  _$jscoverage['/utils.js'].lineData[142] = 0;
  _$jscoverage['/utils.js'].lineData[146] = 0;
  _$jscoverage['/utils.js'].lineData[147] = 0;
  _$jscoverage['/utils.js'].lineData[148] = 0;
  _$jscoverage['/utils.js'].lineData[151] = 0;
  _$jscoverage['/utils.js'].lineData[155] = 0;
  _$jscoverage['/utils.js'].lineData[156] = 0;
  _$jscoverage['/utils.js'].lineData[160] = 0;
  _$jscoverage['/utils.js'].lineData[170] = 0;
  _$jscoverage['/utils.js'].lineData[171] = 0;
  _$jscoverage['/utils.js'].lineData[172] = 0;
  _$jscoverage['/utils.js'].lineData[174] = 0;
  _$jscoverage['/utils.js'].lineData[175] = 0;
  _$jscoverage['/utils.js'].lineData[176] = 0;
  _$jscoverage['/utils.js'].lineData[177] = 0;
  _$jscoverage['/utils.js'].lineData[178] = 0;
  _$jscoverage['/utils.js'].lineData[179] = 0;
  _$jscoverage['/utils.js'].lineData[180] = 0;
  _$jscoverage['/utils.js'].lineData[181] = 0;
  _$jscoverage['/utils.js'].lineData[183] = 0;
  _$jscoverage['/utils.js'].lineData[186] = 0;
  _$jscoverage['/utils.js'].lineData[190] = 0;
  _$jscoverage['/utils.js'].lineData[191] = 0;
  _$jscoverage['/utils.js'].lineData[192] = 0;
  _$jscoverage['/utils.js'].lineData[202] = 0;
  _$jscoverage['/utils.js'].lineData[212] = 0;
  _$jscoverage['/utils.js'].lineData[213] = 0;
  _$jscoverage['/utils.js'].lineData[216] = 0;
  _$jscoverage['/utils.js'].lineData[218] = 0;
  _$jscoverage['/utils.js'].lineData[219] = 0;
  _$jscoverage['/utils.js'].lineData[221] = 0;
  _$jscoverage['/utils.js'].lineData[229] = 0;
  _$jscoverage['/utils.js'].lineData[230] = 0;
  _$jscoverage['/utils.js'].lineData[231] = 0;
  _$jscoverage['/utils.js'].lineData[233] = 0;
  _$jscoverage['/utils.js'].lineData[243] = 0;
  _$jscoverage['/utils.js'].lineData[245] = 0;
  _$jscoverage['/utils.js'].lineData[248] = 0;
  _$jscoverage['/utils.js'].lineData[249] = 0;
  _$jscoverage['/utils.js'].lineData[253] = 0;
  _$jscoverage['/utils.js'].lineData[257] = 0;
  _$jscoverage['/utils.js'].lineData[266] = 0;
  _$jscoverage['/utils.js'].lineData[272] = 0;
  _$jscoverage['/utils.js'].lineData[273] = 0;
  _$jscoverage['/utils.js'].lineData[274] = 0;
  _$jscoverage['/utils.js'].lineData[275] = 0;
  _$jscoverage['/utils.js'].lineData[276] = 0;
  _$jscoverage['/utils.js'].lineData[277] = 0;
  _$jscoverage['/utils.js'].lineData[278] = 0;
  _$jscoverage['/utils.js'].lineData[280] = 0;
  _$jscoverage['/utils.js'].lineData[282] = 0;
  _$jscoverage['/utils.js'].lineData[283] = 0;
  _$jscoverage['/utils.js'].lineData[285] = 0;
  _$jscoverage['/utils.js'].lineData[288] = 0;
  _$jscoverage['/utils.js'].lineData[292] = 0;
  _$jscoverage['/utils.js'].lineData[300] = 0;
  _$jscoverage['/utils.js'].lineData[302] = 0;
  _$jscoverage['/utils.js'].lineData[303] = 0;
  _$jscoverage['/utils.js'].lineData[312] = 0;
  _$jscoverage['/utils.js'].lineData[315] = 0;
  _$jscoverage['/utils.js'].lineData[317] = 0;
  _$jscoverage['/utils.js'].lineData[318] = 0;
  _$jscoverage['/utils.js'].lineData[320] = 0;
  _$jscoverage['/utils.js'].lineData[321] = 0;
  _$jscoverage['/utils.js'].lineData[323] = 0;
  _$jscoverage['/utils.js'].lineData[325] = 0;
  _$jscoverage['/utils.js'].lineData[326] = 0;
  _$jscoverage['/utils.js'].lineData[335] = 0;
  _$jscoverage['/utils.js'].lineData[338] = 0;
  _$jscoverage['/utils.js'].lineData[344] = 0;
  _$jscoverage['/utils.js'].lineData[345] = 0;
  _$jscoverage['/utils.js'].lineData[352] = 0;
  _$jscoverage['/utils.js'].lineData[354] = 0;
  _$jscoverage['/utils.js'].lineData[358] = 0;
  _$jscoverage['/utils.js'].lineData[361] = 0;
  _$jscoverage['/utils.js'].lineData[370] = 0;
  _$jscoverage['/utils.js'].lineData[371] = 0;
  _$jscoverage['/utils.js'].lineData[373] = 0;
  _$jscoverage['/utils.js'].lineData[387] = 0;
  _$jscoverage['/utils.js'].lineData[391] = 0;
  _$jscoverage['/utils.js'].lineData[392] = 0;
  _$jscoverage['/utils.js'].lineData[393] = 0;
  _$jscoverage['/utils.js'].lineData[394] = 0;
  _$jscoverage['/utils.js'].lineData[396] = 0;
  _$jscoverage['/utils.js'].lineData[406] = 0;
  _$jscoverage['/utils.js'].lineData[408] = 0;
  _$jscoverage['/utils.js'].lineData[410] = 0;
  _$jscoverage['/utils.js'].lineData[413] = 0;
  _$jscoverage['/utils.js'].lineData[414] = 0;
  _$jscoverage['/utils.js'].lineData[419] = 0;
  _$jscoverage['/utils.js'].lineData[420] = 0;
  _$jscoverage['/utils.js'].lineData[422] = 0;
  _$jscoverage['/utils.js'].lineData[432] = 0;
  _$jscoverage['/utils.js'].lineData[434] = 0;
  _$jscoverage['/utils.js'].lineData[437] = 0;
  _$jscoverage['/utils.js'].lineData[438] = 0;
  _$jscoverage['/utils.js'].lineData[439] = 0;
  _$jscoverage['/utils.js'].lineData[443] = 0;
  _$jscoverage['/utils.js'].lineData[445] = 0;
  _$jscoverage['/utils.js'].lineData[449] = 0;
  _$jscoverage['/utils.js'].lineData[455] = 0;
  _$jscoverage['/utils.js'].lineData[464] = 0;
  _$jscoverage['/utils.js'].lineData[466] = 0;
  _$jscoverage['/utils.js'].lineData[467] = 0;
  _$jscoverage['/utils.js'].lineData[470] = 0;
  _$jscoverage['/utils.js'].lineData[474] = 0;
  _$jscoverage['/utils.js'].lineData[480] = 0;
  _$jscoverage['/utils.js'].lineData[481] = 0;
  _$jscoverage['/utils.js'].lineData[483] = 0;
  _$jscoverage['/utils.js'].lineData[487] = 0;
  _$jscoverage['/utils.js'].lineData[490] = 0;
  _$jscoverage['/utils.js'].lineData[491] = 0;
  _$jscoverage['/utils.js'].lineData[493] = 0;
  _$jscoverage['/utils.js'].lineData[494] = 0;
  _$jscoverage['/utils.js'].lineData[496] = 0;
}
if (! _$jscoverage['/utils.js'].functionData) {
  _$jscoverage['/utils.js'].functionData = [];
  _$jscoverage['/utils.js'].functionData[0] = 0;
  _$jscoverage['/utils.js'].functionData[1] = 0;
  _$jscoverage['/utils.js'].functionData[2] = 0;
  _$jscoverage['/utils.js'].functionData[3] = 0;
  _$jscoverage['/utils.js'].functionData[4] = 0;
  _$jscoverage['/utils.js'].functionData[5] = 0;
  _$jscoverage['/utils.js'].functionData[6] = 0;
  _$jscoverage['/utils.js'].functionData[7] = 0;
  _$jscoverage['/utils.js'].functionData[8] = 0;
  _$jscoverage['/utils.js'].functionData[9] = 0;
  _$jscoverage['/utils.js'].functionData[10] = 0;
  _$jscoverage['/utils.js'].functionData[11] = 0;
  _$jscoverage['/utils.js'].functionData[12] = 0;
  _$jscoverage['/utils.js'].functionData[13] = 0;
  _$jscoverage['/utils.js'].functionData[14] = 0;
  _$jscoverage['/utils.js'].functionData[15] = 0;
  _$jscoverage['/utils.js'].functionData[16] = 0;
  _$jscoverage['/utils.js'].functionData[17] = 0;
  _$jscoverage['/utils.js'].functionData[18] = 0;
  _$jscoverage['/utils.js'].functionData[19] = 0;
  _$jscoverage['/utils.js'].functionData[20] = 0;
  _$jscoverage['/utils.js'].functionData[21] = 0;
  _$jscoverage['/utils.js'].functionData[22] = 0;
  _$jscoverage['/utils.js'].functionData[23] = 0;
  _$jscoverage['/utils.js'].functionData[24] = 0;
  _$jscoverage['/utils.js'].functionData[25] = 0;
  _$jscoverage['/utils.js'].functionData[26] = 0;
  _$jscoverage['/utils.js'].functionData[27] = 0;
  _$jscoverage['/utils.js'].functionData[28] = 0;
  _$jscoverage['/utils.js'].functionData[29] = 0;
  _$jscoverage['/utils.js'].functionData[30] = 0;
  _$jscoverage['/utils.js'].functionData[31] = 0;
  _$jscoverage['/utils.js'].functionData[32] = 0;
  _$jscoverage['/utils.js'].functionData[33] = 0;
  _$jscoverage['/utils.js'].functionData[34] = 0;
  _$jscoverage['/utils.js'].functionData[35] = 0;
  _$jscoverage['/utils.js'].functionData[36] = 0;
  _$jscoverage['/utils.js'].functionData[37] = 0;
}
if (! _$jscoverage['/utils.js'].branchData) {
  _$jscoverage['/utils.js'].branchData = {};
  _$jscoverage['/utils.js'].branchData['26'] = [];
  _$jscoverage['/utils.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['32'] = [];
  _$jscoverage['/utils.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['41'] = [];
  _$jscoverage['/utils.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['44'] = [];
  _$jscoverage['/utils.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['52'] = [];
  _$jscoverage['/utils.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['58'] = [];
  _$jscoverage['/utils.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['72'] = [];
  _$jscoverage['/utils.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['78'] = [];
  _$jscoverage['/utils.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['79'] = [];
  _$jscoverage['/utils.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['86'] = [];
  _$jscoverage['/utils.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['86'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['89'] = [];
  _$jscoverage['/utils.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['89'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['98'] = [];
  _$jscoverage['/utils.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['100'] = [];
  _$jscoverage['/utils.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['101'] = [];
  _$jscoverage['/utils.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['108'] = [];
  _$jscoverage['/utils.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['109'] = [];
  _$jscoverage['/utils.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['124'] = [];
  _$jscoverage['/utils.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['125'] = [];
  _$jscoverage['/utils.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['142'] = [];
  _$jscoverage['/utils.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['147'] = [];
  _$jscoverage['/utils.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['156'] = [];
  _$jscoverage['/utils.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['156'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['156'][3] = new BranchData();
  _$jscoverage['/utils.js'].branchData['159'] = [];
  _$jscoverage['/utils.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['171'] = [];
  _$jscoverage['/utils.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['177'] = [];
  _$jscoverage['/utils.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['179'] = [];
  _$jscoverage['/utils.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['180'] = [];
  _$jscoverage['/utils.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['192'] = [];
  _$jscoverage['/utils.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['202'] = [];
  _$jscoverage['/utils.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['212'] = [];
  _$jscoverage['/utils.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['218'] = [];
  _$jscoverage['/utils.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['248'] = [];
  _$jscoverage['/utils.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['274'] = [];
  _$jscoverage['/utils.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['274'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['277'] = [];
  _$jscoverage['/utils.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['277'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['280'] = [];
  _$jscoverage['/utils.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['280'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['282'] = [];
  _$jscoverage['/utils.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['302'] = [];
  _$jscoverage['/utils.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['317'] = [];
  _$jscoverage['/utils.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['321'] = [];
  _$jscoverage['/utils.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['338'] = [];
  _$jscoverage['/utils.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['348'] = [];
  _$jscoverage['/utils.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['352'] = [];
  _$jscoverage['/utils.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['370'] = [];
  _$jscoverage['/utils.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['392'] = [];
  _$jscoverage['/utils.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['408'] = [];
  _$jscoverage['/utils.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['410'] = [];
  _$jscoverage['/utils.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['413'] = [];
  _$jscoverage['/utils.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['419'] = [];
  _$jscoverage['/utils.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['437'] = [];
  _$jscoverage['/utils.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['437'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['466'] = [];
  _$jscoverage['/utils.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['493'] = [];
  _$jscoverage['/utils.js'].branchData['493'][1] = new BranchData();
}
_$jscoverage['/utils.js'].branchData['493'][1].init(56, 46, '!(m = str.match(/^\\s*["\']([^\'"\\s]+)["\']\\s*$/))');
function visit299_493_1(result) {
  _$jscoverage['/utils.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['466'][1].init(85, 8, '--i > -1');
function visit298_466_1(result) {
  _$jscoverage['/utils.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['437'][2].init(162, 28, 'module.factory !== undefined');
function visit297_437_2(result) {
  _$jscoverage['/utils.js'].branchData['437'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['437'][1].init(152, 38, 'module && module.factory !== undefined');
function visit296_437_1(result) {
  _$jscoverage['/utils.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['419'][1].init(544, 10, 'refModName');
function visit295_419_1(result) {
  _$jscoverage['/utils.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['413'][1].init(143, 11, 'modNames[i]');
function visit294_413_1(result) {
  _$jscoverage['/utils.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['410'][1].init(84, 5, 'i < l');
function visit293_410_1(result) {
  _$jscoverage['/utils.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['408'][1].init(68, 8, 'modNames');
function visit292_408_1(result) {
  _$jscoverage['/utils.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['392'][1].init(57, 19, 'i < modNames.length');
function visit291_392_1(result) {
  _$jscoverage['/utils.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['370'][1].init(18, 28, 'typeof modNames === \'string\'');
function visit290_370_1(result) {
  _$jscoverage['/utils.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['352'][1].init(703, 21, 'exports !== undefined');
function visit289_352_1(result) {
  _$jscoverage['/utils.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['348'][1].init(28, 27, 'requires && requires.length');
function visit288_348_1(result) {
  _$jscoverage['/utils.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['338'][1].init(89, 29, 'typeof factory === \'function\'');
function visit287_338_1(result) {
  _$jscoverage['/utils.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['321'][1].init(308, 5, 'm.cjs');
function visit286_321_1(result) {
  _$jscoverage['/utils.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['317'][1].init(193, 19, 'status >= ATTACHING');
function visit285_317_1(result) {
  _$jscoverage['/utils.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['302'][1].init(84, 5, 'i < l');
function visit284_302_1(result) {
  _$jscoverage['/utils.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['282'][1].init(403, 5, 'allOk');
function visit283_282_1(result) {
  _$jscoverage['/utils.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['280'][2].init(164, 21, 'm.status >= ATTACHING');
function visit282_280_2(result) {
  _$jscoverage['/utils.js'].branchData['280'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['280'][1].init(159, 26, 'm && m.status >= ATTACHING');
function visit281_280_1(result) {
  _$jscoverage['/utils.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['277'][2].init(142, 18, 'i < unalias.length');
function visit280_277_2(result) {
  _$jscoverage['/utils.js'].branchData['277'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['277'][1].init(133, 27, 'allOk && i < unalias.length');
function visit279_277_1(result) {
  _$jscoverage['/utils.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['274'][2].init(80, 26, 'module.getType() !== \'css\'');
function visit278_274_2(result) {
  _$jscoverage['/utils.js'].branchData['274'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['274'][1].init(70, 36, 'module && module.getType() !== \'css\'');
function visit277_274_1(result) {
  _$jscoverage['/utils.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['248'][1].init(161, 6, 'module');
function visit276_248_1(result) {
  _$jscoverage['/utils.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['218'][1].init(199, 5, 'i < l');
function visit275_218_1(result) {
  _$jscoverage['/utils.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['212'][1].init(18, 27, 'typeof depName === \'string\'');
function visit274_212_1(result) {
  _$jscoverage['/utils.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['202'][1].init(21, 58, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit273_202_1(result) {
  _$jscoverage['/utils.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['192'][1].init(119, 29, 'urlParts1[0] === urlParts2[0]');
function visit272_192_1(result) {
  _$jscoverage['/utils.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['180'][1].init(114, 16, 'subPart === \'..\'');
function visit271_180_1(result) {
  _$jscoverage['/utils.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['179'][1].init(66, 15, 'subPart === \'.\'');
function visit270_179_1(result) {
  _$jscoverage['/utils.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['177'][1].init(307, 5, 'i < l');
function visit269_177_1(result) {
  _$jscoverage['/utils.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['171'][1].init(66, 17, 'firstChar !== \'.\'');
function visit268_171_1(result) {
  _$jscoverage['/utils.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['159'][1].init(588, 69, 'Date.now || function() {\n  return +new Date();\n}');
function visit267_159_1(result) {
  _$jscoverage['/utils.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['156'][3].init(84, 32, 'str.indexOf(suffix, ind) === ind');
function visit266_156_3(result) {
  _$jscoverage['/utils.js'].branchData['156'][3].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['156'][2].init(72, 8, 'ind >= 0');
function visit265_156_2(result) {
  _$jscoverage['/utils.js'].branchData['156'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['156'][1].init(72, 44, 'ind >= 0 && str.indexOf(suffix, ind) === ind');
function visit264_156_1(result) {
  _$jscoverage['/utils.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['147'][1].init(22, 15, 'p !== undefined');
function visit263_147_1(result) {
  _$jscoverage['/utils.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['142'][1].init(21, 32, 'str.lastIndexOf(prefix, 0) === 0');
function visit262_142_1(result) {
  _$jscoverage['/utils.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['125'][1].init(17, 56, 'Object.prototype.toString.call(obj) === \'[object Array]\'');
function visit261_125_1(result) {
  _$jscoverage['/utils.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['124'][1].init(3316, 114, 'Array.isArray || function(obj) {\n  return Object.prototype.toString.call(obj) === \'[object Array]\';\n}');
function visit260_124_1(result) {
  _$jscoverage['/utils.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['109'][1].init(22, 44, 'fn(obj[myKeys[i]], myKeys[i], obj) === false');
function visit259_109_1(result) {
  _$jscoverage['/utils.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['108'][1].init(86, 5, 'i < l');
function visit258_108_1(result) {
  _$jscoverage['/utils.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['101'][1].init(22, 28, 'fn(obj[i], i, obj) === false');
function visit257_101_1(result) {
  _$jscoverage['/utils.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['100'][1].init(50, 5, 'i < l');
function visit256_100_1(result) {
  _$jscoverage['/utils.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['98'][1].init(58, 12, 'isArray(obj)');
function visit255_98_1(result) {
  _$jscoverage['/utils.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['89'][2].init(2404, 76, '(m = ua.match(/AppleWebKit\\/([\\d.]*)/)) || (m = ua.match(/Safari\\/([\\d.]*)/))');
function visit254_89_2(result) {
  _$jscoverage['/utils.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['89'][1].init(2404, 85, '((m = ua.match(/AppleWebKit\\/([\\d.]*)/)) || (m = ua.match(/Safari\\/([\\d.]*)/))) && m[1]');
function visit253_89_1(result) {
  _$jscoverage['/utils.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['86'][2].init(21, 20, 'host.navigator || {}');
function visit252_86_2(result) {
  _$jscoverage['/utils.js'].branchData['86'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['86'][1].init(21, 37, '(host.navigator || {}).userAgent || \'\'');
function visit251_86_1(result) {
  _$jscoverage['/utils.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['79'][1].init(83, 12, 'm[1] || m[2]');
function visit250_79_1(result) {
  _$jscoverage['/utils.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['78'][1].init(34, 98, '(m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\\s|:)?([0-9.]+)/)) && (v = (m[1] || m[2]))');
function visit249_78_1(result) {
  _$jscoverage['/utils.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['72'][1].init(22, 9, 'c++ === 0');
function visit248_72_1(result) {
  _$jscoverage['/utils.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['58'][1].init(26, 12, 'Plugin.alias');
function visit247_58_1(result) {
  _$jscoverage['/utils.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['52'][1].init(54, 12, 'index !== -1');
function visit246_52_1(result) {
  _$jscoverage['/utils.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['44'][1].init(134, 27, 'Utils.endsWith(name, \'.js\')');
function visit245_44_1(result) {
  _$jscoverage['/utils.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['41'][1].init(40, 36, 'name.charAt(name.length - 1) === \'/\'');
function visit244_41_1(result) {
  _$jscoverage['/utils.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['32'][1].init(103, 5, 'i < l');
function visit243_32_1(result) {
  _$jscoverage['/utils.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['26'][1].init(14, 21, 'typeof s === \'string\'');
function visit242_26_1(result) {
  _$jscoverage['/utils.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/utils.js'].functionData[0]++;
  _$jscoverage['/utils.js'].lineData[7]++;
  var Loader = S.Loader, Env = S.Env, host = Env.host, data = Loader.Status, ATTACHED = data.ATTACHED, LOADED = data.LOADED, ATTACHING = data.ATTACHING, Utils = Loader.Utils = {}, doc = host.document;
  _$jscoverage['/utils.js'].lineData[25]++;
  function addIndexAndRemoveJsExt(s) {
    _$jscoverage['/utils.js'].functionData[1]++;
    _$jscoverage['/utils.js'].lineData[26]++;
    if (visit242_26_1(typeof s === 'string')) {
      _$jscoverage['/utils.js'].lineData[27]++;
      return addIndexAndRemoveJsExtFromName(s);
    } else {
      _$jscoverage['/utils.js'].lineData[29]++;
      var ret = [], i = 0, l = s.length;
      _$jscoverage['/utils.js'].lineData[32]++;
      for (; visit243_32_1(i < l); i++) {
        _$jscoverage['/utils.js'].lineData[33]++;
        ret[i] = addIndexAndRemoveJsExtFromName(s[i]);
      }
      _$jscoverage['/utils.js'].lineData[35]++;
      return ret;
    }
  }
  _$jscoverage['/utils.js'].lineData[39]++;
  function addIndexAndRemoveJsExtFromName(name) {
    _$jscoverage['/utils.js'].functionData[2]++;
    _$jscoverage['/utils.js'].lineData[41]++;
    if (visit244_41_1(name.charAt(name.length - 1) === '/')) {
      _$jscoverage['/utils.js'].lineData[42]++;
      name += 'index';
    }
    _$jscoverage['/utils.js'].lineData[44]++;
    if (visit245_44_1(Utils.endsWith(name, '.js'))) {
      _$jscoverage['/utils.js'].lineData[45]++;
      name = name.slice(0, -3);
    }
    _$jscoverage['/utils.js'].lineData[47]++;
    return name;
  }
  _$jscoverage['/utils.js'].lineData[50]++;
  function pluginAlias(name) {
    _$jscoverage['/utils.js'].functionData[3]++;
    _$jscoverage['/utils.js'].lineData[51]++;
    var index = name.indexOf('!');
    _$jscoverage['/utils.js'].lineData[52]++;
    if (visit246_52_1(index !== -1)) {
      _$jscoverage['/utils.js'].lineData[53]++;
      var pluginName = name.substring(0, index);
      _$jscoverage['/utils.js'].lineData[54]++;
      name = name.substring(index + 1);
      _$jscoverage['/utils.js'].lineData[55]++;
      S.use(pluginName, {
  sync: true, 
  success: function(S, Plugin) {
  _$jscoverage['/utils.js'].functionData[4]++;
  _$jscoverage['/utils.js'].lineData[58]++;
  if (visit247_58_1(Plugin.alias)) {
    _$jscoverage['/utils.js'].lineData[60]++;
    name = Plugin.alias(S, name, pluginName);
  }
}});
    }
    _$jscoverage['/utils.js'].lineData[65]++;
    return name;
  }
  _$jscoverage['/utils.js'].lineData[68]++;
  function numberify(s) {
    _$jscoverage['/utils.js'].functionData[5]++;
    _$jscoverage['/utils.js'].lineData[69]++;
    var c = 0;
    _$jscoverage['/utils.js'].lineData[71]++;
    return parseFloat(s.replace(/\./g, function() {
  _$jscoverage['/utils.js'].functionData[6]++;
  _$jscoverage['/utils.js'].lineData[72]++;
  return (visit248_72_1(c++ === 0)) ? '.' : '';
}));
  }
  _$jscoverage['/utils.js'].lineData[76]++;
  function getIEVersion() {
    _$jscoverage['/utils.js'].functionData[7]++;
    _$jscoverage['/utils.js'].lineData[77]++;
    var m, v;
    _$jscoverage['/utils.js'].lineData[78]++;
    if (visit249_78_1((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) && (v = (visit250_79_1(m[1] || m[2]))))) {
      _$jscoverage['/utils.js'].lineData[80]++;
      return numberify(v);
    }
    _$jscoverage['/utils.js'].lineData[82]++;
    return undefined;
  }
  _$jscoverage['/utils.js'].lineData[85]++;
  var m, ua = visit251_86_1((visit252_86_2(host.navigator || {})).userAgent || '');
  _$jscoverage['/utils.js'].lineData[89]++;
  if (visit253_89_1((visit254_89_2((m = ua.match(/AppleWebKit\/([\d.]*)/)) || (m = ua.match(/Safari\/([\d.]*)/)))) && m[1])) {
    _$jscoverage['/utils.js'].lineData[90]++;
    Utils.webkit = numberify(m[1]);
  }
  _$jscoverage['/utils.js'].lineData[93]++;
  var urlReg = /http(s)?:\/\/([^/]+)(?::(\d+))?/;
  _$jscoverage['/utils.js'].lineData[95]++;
  function each(obj, fn) {
    _$jscoverage['/utils.js'].functionData[8]++;
    _$jscoverage['/utils.js'].lineData[96]++;
    var i = 0, myKeys, l;
    _$jscoverage['/utils.js'].lineData[98]++;
    if (visit255_98_1(isArray(obj))) {
      _$jscoverage['/utils.js'].lineData[99]++;
      l = obj.length;
      _$jscoverage['/utils.js'].lineData[100]++;
      for (; visit256_100_1(i < l); i++) {
        _$jscoverage['/utils.js'].lineData[101]++;
        if (visit257_101_1(fn(obj[i], i, obj) === false)) {
          _$jscoverage['/utils.js'].lineData[102]++;
          break;
        }
      }
    } else {
      _$jscoverage['/utils.js'].lineData[106]++;
      myKeys = keys(obj);
      _$jscoverage['/utils.js'].lineData[107]++;
      l = myKeys.length;
      _$jscoverage['/utils.js'].lineData[108]++;
      for (; visit258_108_1(i < l); i++) {
        _$jscoverage['/utils.js'].lineData[109]++;
        if (visit259_109_1(fn(obj[myKeys[i]], myKeys[i], obj) === false)) {
          _$jscoverage['/utils.js'].lineData[110]++;
          break;
        }
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[116]++;
  function keys(obj) {
    _$jscoverage['/utils.js'].functionData[9]++;
    _$jscoverage['/utils.js'].lineData[117]++;
    var ret = [];
    _$jscoverage['/utils.js'].lineData[118]++;
    for (var key in obj) {
      _$jscoverage['/utils.js'].lineData[119]++;
      ret.push(key);
    }
    _$jscoverage['/utils.js'].lineData[121]++;
    return ret;
  }
  _$jscoverage['/utils.js'].lineData[124]++;
  var isArray = visit260_124_1(Array.isArray || function(obj) {
  _$jscoverage['/utils.js'].functionData[10]++;
  _$jscoverage['/utils.js'].lineData[125]++;
  return visit261_125_1(Object.prototype.toString.call(obj) === '[object Array]');
});
  _$jscoverage['/utils.js'].lineData[128]++;
  function mix(to, from) {
    _$jscoverage['/utils.js'].functionData[11]++;
    _$jscoverage['/utils.js'].lineData[129]++;
    for (var i in from) {
      _$jscoverage['/utils.js'].lineData[130]++;
      to[i] = from[i];
    }
    _$jscoverage['/utils.js'].lineData[132]++;
    return to;
  }
  _$jscoverage['/utils.js'].lineData[135]++;
  mix(Utils, {
  mix: mix, 
  noop: function() {
  _$jscoverage['/utils.js'].functionData[12]++;
}, 
  startsWith: function(str, prefix) {
  _$jscoverage['/utils.js'].functionData[13]++;
  _$jscoverage['/utils.js'].lineData[142]++;
  return visit262_142_1(str.lastIndexOf(prefix, 0) === 0);
}, 
  isEmptyObject: function(o) {
  _$jscoverage['/utils.js'].functionData[14]++;
  _$jscoverage['/utils.js'].lineData[146]++;
  for (var p in o) {
    _$jscoverage['/utils.js'].lineData[147]++;
    if (visit263_147_1(p !== undefined)) {
      _$jscoverage['/utils.js'].lineData[148]++;
      return false;
    }
  }
  _$jscoverage['/utils.js'].lineData[151]++;
  return true;
}, 
  endsWith: function(str, suffix) {
  _$jscoverage['/utils.js'].functionData[15]++;
  _$jscoverage['/utils.js'].lineData[155]++;
  var ind = str.length - suffix.length;
  _$jscoverage['/utils.js'].lineData[156]++;
  return visit264_156_1(visit265_156_2(ind >= 0) && visit266_156_3(str.indexOf(suffix, ind) === ind));
}, 
  now: visit267_159_1(Date.now || function() {
  _$jscoverage['/utils.js'].functionData[16]++;
  _$jscoverage['/utils.js'].lineData[160]++;
  return +new Date();
}), 
  each: each, 
  keys: keys, 
  isArray: isArray, 
  normalizePath: function(parentPath, subPath) {
  _$jscoverage['/utils.js'].functionData[17]++;
  _$jscoverage['/utils.js'].lineData[170]++;
  var firstChar = subPath.charAt(0);
  _$jscoverage['/utils.js'].lineData[171]++;
  if (visit268_171_1(firstChar !== '.')) {
    _$jscoverage['/utils.js'].lineData[172]++;
    return subPath;
  }
  _$jscoverage['/utils.js'].lineData[174]++;
  var parts = parentPath.split('/');
  _$jscoverage['/utils.js'].lineData[175]++;
  var subParts = subPath.split('/');
  _$jscoverage['/utils.js'].lineData[176]++;
  parts.pop();
  _$jscoverage['/utils.js'].lineData[177]++;
  for (var i = 0, l = subParts.length; visit269_177_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[178]++;
    var subPart = subParts[i];
    _$jscoverage['/utils.js'].lineData[179]++;
    if (visit270_179_1(subPart === '.')) {
    } else {
      _$jscoverage['/utils.js'].lineData[180]++;
      if (visit271_180_1(subPart === '..')) {
        _$jscoverage['/utils.js'].lineData[181]++;
        parts.pop();
      } else {
        _$jscoverage['/utils.js'].lineData[183]++;
        parts.push(subPart);
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[186]++;
  return parts.join('/');
}, 
  isSameOriginAs: function(url1, url2) {
  _$jscoverage['/utils.js'].functionData[18]++;
  _$jscoverage['/utils.js'].lineData[190]++;
  var urlParts1 = url1.match(urlReg);
  _$jscoverage['/utils.js'].lineData[191]++;
  var urlParts2 = url2.match(urlReg);
  _$jscoverage['/utils.js'].lineData[192]++;
  return visit272_192_1(urlParts1[0] === urlParts2[0]);
}, 
  ie: getIEVersion(), 
  docHead: function() {
  _$jscoverage['/utils.js'].functionData[19]++;
  _$jscoverage['/utils.js'].lineData[202]++;
  return visit273_202_1(doc.getElementsByTagName('head')[0] || doc.documentElement);
}, 
  normalDepModuleName: function(moduleName, depName) {
  _$jscoverage['/utils.js'].functionData[20]++;
  _$jscoverage['/utils.js'].lineData[212]++;
  if (visit274_212_1(typeof depName === 'string')) {
    _$jscoverage['/utils.js'].lineData[213]++;
    return Utils.normalizePath(moduleName, depName);
  }
  _$jscoverage['/utils.js'].lineData[216]++;
  var i = 0, l;
  _$jscoverage['/utils.js'].lineData[218]++;
  for (l = depName.length; visit275_218_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[219]++;
    depName[i] = Utils.normalizePath(moduleName, depName[i]);
  }
  _$jscoverage['/utils.js'].lineData[221]++;
  return depName;
}, 
  createModulesInfo: function(modNames) {
  _$jscoverage['/utils.js'].functionData[21]++;
  _$jscoverage['/utils.js'].lineData[229]++;
  var ret = [];
  _$jscoverage['/utils.js'].lineData[230]++;
  Utils.each(modNames, function(m, i) {
  _$jscoverage['/utils.js'].functionData[22]++;
  _$jscoverage['/utils.js'].lineData[231]++;
  ret[i] = Utils.createModuleInfo(m);
});
  _$jscoverage['/utils.js'].lineData[233]++;
  return ret;
}, 
  createModuleInfo: function(modName, cfg) {
  _$jscoverage['/utils.js'].functionData[23]++;
  _$jscoverage['/utils.js'].lineData[243]++;
  modName = addIndexAndRemoveJsExtFromName(modName);
  _$jscoverage['/utils.js'].lineData[245]++;
  var mods = Env.mods, module = mods[modName];
  _$jscoverage['/utils.js'].lineData[248]++;
  if (visit276_248_1(module)) {
    _$jscoverage['/utils.js'].lineData[249]++;
    return module;
  }
  _$jscoverage['/utils.js'].lineData[253]++;
  mods[modName] = module = new Loader.Module(mix({
  name: modName}, cfg));
  _$jscoverage['/utils.js'].lineData[257]++;
  return module;
}, 
  getModules: function(modNames) {
  _$jscoverage['/utils.js'].functionData[24]++;
  _$jscoverage['/utils.js'].lineData[266]++;
  var mods = [S], module, unalias, allOk, m, runtimeMods = Env.mods;
  _$jscoverage['/utils.js'].lineData[272]++;
  Utils.each(modNames, function(modName) {
  _$jscoverage['/utils.js'].functionData[25]++;
  _$jscoverage['/utils.js'].lineData[273]++;
  module = runtimeMods[modName];
  _$jscoverage['/utils.js'].lineData[274]++;
  if (visit277_274_1(module && visit278_274_2(module.getType() !== 'css'))) {
    _$jscoverage['/utils.js'].lineData[275]++;
    unalias = module.getNormalizedAlias();
    _$jscoverage['/utils.js'].lineData[276]++;
    allOk = true;
    _$jscoverage['/utils.js'].lineData[277]++;
    for (var i = 0; visit279_277_1(allOk && visit280_277_2(i < unalias.length)); i++) {
      _$jscoverage['/utils.js'].lineData[278]++;
      m = runtimeMods[unalias[i]];
      _$jscoverage['/utils.js'].lineData[280]++;
      allOk = visit281_280_1(m && visit282_280_2(m.status >= ATTACHING));
    }
    _$jscoverage['/utils.js'].lineData[282]++;
    if (visit283_282_1(allOk)) {
      _$jscoverage['/utils.js'].lineData[283]++;
      mods.push(runtimeMods[unalias[0]].exports);
    } else {
      _$jscoverage['/utils.js'].lineData[285]++;
      mods.push(null);
    }
  } else {
    _$jscoverage['/utils.js'].lineData[288]++;
    mods.push(undefined);
  }
});
  _$jscoverage['/utils.js'].lineData[292]++;
  return mods;
}, 
  attachModsRecursively: function(modNames) {
  _$jscoverage['/utils.js'].functionData[26]++;
  _$jscoverage['/utils.js'].lineData[300]++;
  var i, l = modNames.length;
  _$jscoverage['/utils.js'].lineData[302]++;
  for (i = 0; visit284_302_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[303]++;
    Utils.attachModRecursively(modNames[i]);
  }
}, 
  attachModRecursively: function(modName) {
  _$jscoverage['/utils.js'].functionData[27]++;
  _$jscoverage['/utils.js'].lineData[312]++;
  var mods = Env.mods, status, m = mods[modName];
  _$jscoverage['/utils.js'].lineData[315]++;
  status = m.status;
  _$jscoverage['/utils.js'].lineData[317]++;
  if (visit285_317_1(status >= ATTACHING)) {
    _$jscoverage['/utils.js'].lineData[318]++;
    return;
  }
  _$jscoverage['/utils.js'].lineData[320]++;
  m.status = ATTACHING;
  _$jscoverage['/utils.js'].lineData[321]++;
  if (visit286_321_1(m.cjs)) {
    _$jscoverage['/utils.js'].lineData[323]++;
    Utils.attachMod(m);
  } else {
    _$jscoverage['/utils.js'].lineData[325]++;
    Utils.attachModsRecursively(m.getNormalizedRequires());
    _$jscoverage['/utils.js'].lineData[326]++;
    Utils.attachMod(m);
  }
}, 
  attachMod: function(module) {
  _$jscoverage['/utils.js'].functionData[28]++;
  _$jscoverage['/utils.js'].lineData[335]++;
  var factory = module.factory, exports;
  _$jscoverage['/utils.js'].lineData[338]++;
  if (visit287_338_1(typeof factory === 'function')) {
    _$jscoverage['/utils.js'].lineData[344]++;
    var requires = module.requires;
    _$jscoverage['/utils.js'].lineData[345]++;
    exports = factory.apply(module, (module.cjs ? [S, visit288_348_1(requires && requires.length) ? module.require : undefined, module.exports, module] : Utils.getModules(module.getRequiresWithAlias())));
    _$jscoverage['/utils.js'].lineData[352]++;
    if (visit289_352_1(exports !== undefined)) {
      _$jscoverage['/utils.js'].lineData[354]++;
      module.exports = exports;
    }
  } else {
    _$jscoverage['/utils.js'].lineData[358]++;
    module.exports = factory;
  }
  _$jscoverage['/utils.js'].lineData[361]++;
  module.status = ATTACHED;
}, 
  getModNamesAsArray: function(modNames) {
  _$jscoverage['/utils.js'].functionData[29]++;
  _$jscoverage['/utils.js'].lineData[370]++;
  if (visit290_370_1(typeof modNames === 'string')) {
    _$jscoverage['/utils.js'].lineData[371]++;
    modNames = modNames.replace(/\s+/g, '').split(',');
  }
  _$jscoverage['/utils.js'].lineData[373]++;
  return modNames;
}, 
  normalizeModNames: function(modNames, refModName) {
  _$jscoverage['/utils.js'].functionData[30]++;
  _$jscoverage['/utils.js'].lineData[387]++;
  return Utils.unalias(Utils.normalizeModNamesWithAlias(modNames, refModName));
}, 
  unalias: function(modNames) {
  _$jscoverage['/utils.js'].functionData[31]++;
  _$jscoverage['/utils.js'].lineData[391]++;
  var ret = [];
  _$jscoverage['/utils.js'].lineData[392]++;
  for (var i = 0; visit291_392_1(i < modNames.length); i++) {
    _$jscoverage['/utils.js'].lineData[393]++;
    var mod = Utils.createModuleInfo(modNames[i]);
    _$jscoverage['/utils.js'].lineData[394]++;
    ret.push.apply(ret, mod.getNormalizedAlias());
  }
  _$jscoverage['/utils.js'].lineData[396]++;
  return ret;
}, 
  normalizeModNamesWithAlias: function(modNames, refModName) {
  _$jscoverage['/utils.js'].functionData[32]++;
  _$jscoverage['/utils.js'].lineData[406]++;
  var ret = [], i, l;
  _$jscoverage['/utils.js'].lineData[408]++;
  if (visit292_408_1(modNames)) {
    _$jscoverage['/utils.js'].lineData[410]++;
    for (i = 0 , l = modNames.length; visit293_410_1(i < l); i++) {
      _$jscoverage['/utils.js'].lineData[413]++;
      if (visit294_413_1(modNames[i])) {
        _$jscoverage['/utils.js'].lineData[414]++;
        ret.push(pluginAlias(addIndexAndRemoveJsExt(modNames[i])));
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[419]++;
  if (visit295_419_1(refModName)) {
    _$jscoverage['/utils.js'].lineData[420]++;
    ret = Utils.normalDepModuleName(refModName, ret);
  }
  _$jscoverage['/utils.js'].lineData[422]++;
  return ret;
}, 
  registerModule: function(name, factory, config) {
  _$jscoverage['/utils.js'].functionData[33]++;
  _$jscoverage['/utils.js'].lineData[432]++;
  name = addIndexAndRemoveJsExtFromName(name);
  _$jscoverage['/utils.js'].lineData[434]++;
  var mods = Env.mods, module = mods[name];
  _$jscoverage['/utils.js'].lineData[437]++;
  if (visit296_437_1(module && visit297_437_2(module.factory !== undefined))) {
    _$jscoverage['/utils.js'].lineData[438]++;
    S.log(name + ' is defined more than once', 'warn');
    _$jscoverage['/utils.js'].lineData[439]++;
    return;
  }
  _$jscoverage['/utils.js'].lineData[443]++;
  Utils.createModuleInfo(name);
  _$jscoverage['/utils.js'].lineData[445]++;
  module = mods[name];
  _$jscoverage['/utils.js'].lineData[449]++;
  mix(module, {
  name: name, 
  status: LOADED, 
  factory: factory});
  _$jscoverage['/utils.js'].lineData[455]++;
  mix(module, config);
}, 
  getHash: function(str) {
  _$jscoverage['/utils.js'].functionData[34]++;
  _$jscoverage['/utils.js'].lineData[464]++;
  var hash = 5381, i;
  _$jscoverage['/utils.js'].lineData[466]++;
  for (i = str.length; visit298_466_1(--i > -1); ) {
    _$jscoverage['/utils.js'].lineData[467]++;
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  _$jscoverage['/utils.js'].lineData[470]++;
  return hash + '';
}, 
  getRequiresFromFn: function(fn) {
  _$jscoverage['/utils.js'].functionData[35]++;
  _$jscoverage['/utils.js'].lineData[474]++;
  var requires = [];
  _$jscoverage['/utils.js'].lineData[480]++;
  fn.toString().replace(commentRegExp, '').replace(requireRegExp, function(match, dep) {
  _$jscoverage['/utils.js'].functionData[36]++;
  _$jscoverage['/utils.js'].lineData[481]++;
  requires.push(getRequireVal(dep));
});
  _$jscoverage['/utils.js'].lineData[483]++;
  return requires;
}});
  _$jscoverage['/utils.js'].lineData[487]++;
  var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, requireRegExp = /[^.'"]\s*require\s*\(([^)]+)\)/g;
  _$jscoverage['/utils.js'].lineData[490]++;
  function getRequireVal(str) {
    _$jscoverage['/utils.js'].functionData[37]++;
    _$jscoverage['/utils.js'].lineData[491]++;
    var m;
    _$jscoverage['/utils.js'].lineData[493]++;
    if (visit299_493_1(!(m = str.match(/^\s*["']([^'"\s]+)["']\s*$/)))) {
      _$jscoverage['/utils.js'].lineData[494]++;
      S.error('can not find required mod in require call: ' + str);
    }
    _$jscoverage['/utils.js'].lineData[496]++;
    return m[1];
  }
})(KISSY);
