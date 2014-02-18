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
if (! _$jscoverage['/touch/handle.js']) {
  _$jscoverage['/touch/handle.js'] = {};
  _$jscoverage['/touch/handle.js'].lineData = [];
  _$jscoverage['/touch/handle.js'].lineData[6] = 0;
  _$jscoverage['/touch/handle.js'].lineData[7] = 0;
  _$jscoverage['/touch/handle.js'].lineData[8] = 0;
  _$jscoverage['/touch/handle.js'].lineData[9] = 0;
  _$jscoverage['/touch/handle.js'].lineData[10] = 0;
  _$jscoverage['/touch/handle.js'].lineData[11] = 0;
  _$jscoverage['/touch/handle.js'].lineData[12] = 0;
  _$jscoverage['/touch/handle.js'].lineData[13] = 0;
  _$jscoverage['/touch/handle.js'].lineData[15] = 0;
  _$jscoverage['/touch/handle.js'].lineData[21] = 0;
  _$jscoverage['/touch/handle.js'].lineData[22] = 0;
  _$jscoverage['/touch/handle.js'].lineData[25] = 0;
  _$jscoverage['/touch/handle.js'].lineData[26] = 0;
  _$jscoverage['/touch/handle.js'].lineData[29] = 0;
  _$jscoverage['/touch/handle.js'].lineData[30] = 0;
  _$jscoverage['/touch/handle.js'].lineData[34] = 0;
  _$jscoverage['/touch/handle.js'].lineData[36] = 0;
  _$jscoverage['/touch/handle.js'].lineData[38] = 0;
  _$jscoverage['/touch/handle.js'].lineData[39] = 0;
  _$jscoverage['/touch/handle.js'].lineData[41] = 0;
  _$jscoverage['/touch/handle.js'].lineData[42] = 0;
  _$jscoverage['/touch/handle.js'].lineData[43] = 0;
  _$jscoverage['/touch/handle.js'].lineData[45] = 0;
  _$jscoverage['/touch/handle.js'].lineData[47] = 0;
  _$jscoverage['/touch/handle.js'].lineData[48] = 0;
  _$jscoverage['/touch/handle.js'].lineData[50] = 0;
  _$jscoverage['/touch/handle.js'].lineData[53] = 0;
  _$jscoverage['/touch/handle.js'].lineData[54] = 0;
  _$jscoverage['/touch/handle.js'].lineData[55] = 0;
  _$jscoverage['/touch/handle.js'].lineData[56] = 0;
  _$jscoverage['/touch/handle.js'].lineData[57] = 0;
  _$jscoverage['/touch/handle.js'].lineData[58] = 0;
  _$jscoverage['/touch/handle.js'].lineData[59] = 0;
  _$jscoverage['/touch/handle.js'].lineData[61] = 0;
  _$jscoverage['/touch/handle.js'].lineData[62] = 0;
  _$jscoverage['/touch/handle.js'].lineData[63] = 0;
  _$jscoverage['/touch/handle.js'].lineData[66] = 0;
  _$jscoverage['/touch/handle.js'].lineData[67] = 0;
  _$jscoverage['/touch/handle.js'].lineData[68] = 0;
  _$jscoverage['/touch/handle.js'].lineData[69] = 0;
  _$jscoverage['/touch/handle.js'].lineData[70] = 0;
  _$jscoverage['/touch/handle.js'].lineData[72] = 0;
  _$jscoverage['/touch/handle.js'].lineData[74] = 0;
  _$jscoverage['/touch/handle.js'].lineData[77] = 0;
  _$jscoverage['/touch/handle.js'].lineData[85] = 0;
  _$jscoverage['/touch/handle.js'].lineData[87] = 0;
  _$jscoverage['/touch/handle.js'].lineData[89] = 0;
  _$jscoverage['/touch/handle.js'].lineData[90] = 0;
  _$jscoverage['/touch/handle.js'].lineData[92] = 0;
  _$jscoverage['/touch/handle.js'].lineData[96] = 0;
  _$jscoverage['/touch/handle.js'].lineData[97] = 0;
  _$jscoverage['/touch/handle.js'].lineData[101] = 0;
  _$jscoverage['/touch/handle.js'].lineData[106] = 0;
  _$jscoverage['/touch/handle.js'].lineData[107] = 0;
  _$jscoverage['/touch/handle.js'].lineData[108] = 0;
  _$jscoverage['/touch/handle.js'].lineData[109] = 0;
  _$jscoverage['/touch/handle.js'].lineData[110] = 0;
  _$jscoverage['/touch/handle.js'].lineData[116] = 0;
  _$jscoverage['/touch/handle.js'].lineData[121] = 0;
  _$jscoverage['/touch/handle.js'].lineData[122] = 0;
  _$jscoverage['/touch/handle.js'].lineData[123] = 0;
  _$jscoverage['/touch/handle.js'].lineData[124] = 0;
  _$jscoverage['/touch/handle.js'].lineData[130] = 0;
  _$jscoverage['/touch/handle.js'].lineData[134] = 0;
  _$jscoverage['/touch/handle.js'].lineData[135] = 0;
  _$jscoverage['/touch/handle.js'].lineData[140] = 0;
  _$jscoverage['/touch/handle.js'].lineData[141] = 0;
  _$jscoverage['/touch/handle.js'].lineData[147] = 0;
  _$jscoverage['/touch/handle.js'].lineData[148] = 0;
  _$jscoverage['/touch/handle.js'].lineData[150] = 0;
  _$jscoverage['/touch/handle.js'].lineData[152] = 0;
  _$jscoverage['/touch/handle.js'].lineData[153] = 0;
  _$jscoverage['/touch/handle.js'].lineData[154] = 0;
  _$jscoverage['/touch/handle.js'].lineData[155] = 0;
  _$jscoverage['/touch/handle.js'].lineData[156] = 0;
  _$jscoverage['/touch/handle.js'].lineData[157] = 0;
  _$jscoverage['/touch/handle.js'].lineData[165] = 0;
  _$jscoverage['/touch/handle.js'].lineData[166] = 0;
  _$jscoverage['/touch/handle.js'].lineData[168] = 0;
  _$jscoverage['/touch/handle.js'].lineData[170] = 0;
  _$jscoverage['/touch/handle.js'].lineData[172] = 0;
  _$jscoverage['/touch/handle.js'].lineData[173] = 0;
  _$jscoverage['/touch/handle.js'].lineData[176] = 0;
  _$jscoverage['/touch/handle.js'].lineData[180] = 0;
  _$jscoverage['/touch/handle.js'].lineData[183] = 0;
  _$jscoverage['/touch/handle.js'].lineData[184] = 0;
  _$jscoverage['/touch/handle.js'].lineData[187] = 0;
  _$jscoverage['/touch/handle.js'].lineData[188] = 0;
  _$jscoverage['/touch/handle.js'].lineData[189] = 0;
  _$jscoverage['/touch/handle.js'].lineData[190] = 0;
  _$jscoverage['/touch/handle.js'].lineData[192] = 0;
  _$jscoverage['/touch/handle.js'].lineData[194] = 0;
  _$jscoverage['/touch/handle.js'].lineData[196] = 0;
  _$jscoverage['/touch/handle.js'].lineData[197] = 0;
  _$jscoverage['/touch/handle.js'].lineData[198] = 0;
  _$jscoverage['/touch/handle.js'].lineData[199] = 0;
  _$jscoverage['/touch/handle.js'].lineData[200] = 0;
  _$jscoverage['/touch/handle.js'].lineData[204] = 0;
  _$jscoverage['/touch/handle.js'].lineData[208] = 0;
  _$jscoverage['/touch/handle.js'].lineData[209] = 0;
  _$jscoverage['/touch/handle.js'].lineData[210] = 0;
  _$jscoverage['/touch/handle.js'].lineData[211] = 0;
  _$jscoverage['/touch/handle.js'].lineData[212] = 0;
  _$jscoverage['/touch/handle.js'].lineData[213] = 0;
  _$jscoverage['/touch/handle.js'].lineData[215] = 0;
  _$jscoverage['/touch/handle.js'].lineData[216] = 0;
  _$jscoverage['/touch/handle.js'].lineData[217] = 0;
  _$jscoverage['/touch/handle.js'].lineData[218] = 0;
  _$jscoverage['/touch/handle.js'].lineData[219] = 0;
  _$jscoverage['/touch/handle.js'].lineData[222] = 0;
  _$jscoverage['/touch/handle.js'].lineData[225] = 0;
  _$jscoverage['/touch/handle.js'].lineData[226] = 0;
  _$jscoverage['/touch/handle.js'].lineData[227] = 0;
  _$jscoverage['/touch/handle.js'].lineData[230] = 0;
  _$jscoverage['/touch/handle.js'].lineData[234] = 0;
  _$jscoverage['/touch/handle.js'].lineData[236] = 0;
  _$jscoverage['/touch/handle.js'].lineData[237] = 0;
  _$jscoverage['/touch/handle.js'].lineData[238] = 0;
  _$jscoverage['/touch/handle.js'].lineData[240] = 0;
  _$jscoverage['/touch/handle.js'].lineData[241] = 0;
  _$jscoverage['/touch/handle.js'].lineData[242] = 0;
  _$jscoverage['/touch/handle.js'].lineData[243] = 0;
  _$jscoverage['/touch/handle.js'].lineData[244] = 0;
  _$jscoverage['/touch/handle.js'].lineData[247] = 0;
  _$jscoverage['/touch/handle.js'].lineData[251] = 0;
  _$jscoverage['/touch/handle.js'].lineData[253] = 0;
  _$jscoverage['/touch/handle.js'].lineData[254] = 0;
  _$jscoverage['/touch/handle.js'].lineData[255] = 0;
  _$jscoverage['/touch/handle.js'].lineData[259] = 0;
  _$jscoverage['/touch/handle.js'].lineData[260] = 0;
  _$jscoverage['/touch/handle.js'].lineData[261] = 0;
  _$jscoverage['/touch/handle.js'].lineData[262] = 0;
  _$jscoverage['/touch/handle.js'].lineData[263] = 0;
  _$jscoverage['/touch/handle.js'].lineData[265] = 0;
  _$jscoverage['/touch/handle.js'].lineData[266] = 0;
  _$jscoverage['/touch/handle.js'].lineData[267] = 0;
  _$jscoverage['/touch/handle.js'].lineData[268] = 0;
  _$jscoverage['/touch/handle.js'].lineData[269] = 0;
  _$jscoverage['/touch/handle.js'].lineData[270] = 0;
  _$jscoverage['/touch/handle.js'].lineData[276] = 0;
  _$jscoverage['/touch/handle.js'].lineData[280] = 0;
  _$jscoverage['/touch/handle.js'].lineData[282] = 0;
  _$jscoverage['/touch/handle.js'].lineData[283] = 0;
  _$jscoverage['/touch/handle.js'].lineData[285] = 0;
  _$jscoverage['/touch/handle.js'].lineData[287] = 0;
  _$jscoverage['/touch/handle.js'].lineData[288] = 0;
  _$jscoverage['/touch/handle.js'].lineData[289] = 0;
  _$jscoverage['/touch/handle.js'].lineData[291] = 0;
  _$jscoverage['/touch/handle.js'].lineData[293] = 0;
  _$jscoverage['/touch/handle.js'].lineData[294] = 0;
  _$jscoverage['/touch/handle.js'].lineData[298] = 0;
  _$jscoverage['/touch/handle.js'].lineData[299] = 0;
  _$jscoverage['/touch/handle.js'].lineData[300] = 0;
  _$jscoverage['/touch/handle.js'].lineData[305] = 0;
  _$jscoverage['/touch/handle.js'].lineData[308] = 0;
  _$jscoverage['/touch/handle.js'].lineData[309] = 0;
  _$jscoverage['/touch/handle.js'].lineData[311] = 0;
  _$jscoverage['/touch/handle.js'].lineData[319] = 0;
  _$jscoverage['/touch/handle.js'].lineData[320] = 0;
  _$jscoverage['/touch/handle.js'].lineData[321] = 0;
  _$jscoverage['/touch/handle.js'].lineData[322] = 0;
  _$jscoverage['/touch/handle.js'].lineData[323] = 0;
  _$jscoverage['/touch/handle.js'].lineData[329] = 0;
  _$jscoverage['/touch/handle.js'].lineData[331] = 0;
  _$jscoverage['/touch/handle.js'].lineData[332] = 0;
  _$jscoverage['/touch/handle.js'].lineData[333] = 0;
  _$jscoverage['/touch/handle.js'].lineData[337] = 0;
  _$jscoverage['/touch/handle.js'].lineData[339] = 0;
  _$jscoverage['/touch/handle.js'].lineData[341] = 0;
  _$jscoverage['/touch/handle.js'].lineData[342] = 0;
  _$jscoverage['/touch/handle.js'].lineData[344] = 0;
  _$jscoverage['/touch/handle.js'].lineData[345] = 0;
  _$jscoverage['/touch/handle.js'].lineData[350] = 0;
  _$jscoverage['/touch/handle.js'].lineData[352] = 0;
  _$jscoverage['/touch/handle.js'].lineData[353] = 0;
  _$jscoverage['/touch/handle.js'].lineData[354] = 0;
  _$jscoverage['/touch/handle.js'].lineData[356] = 0;
  _$jscoverage['/touch/handle.js'].lineData[357] = 0;
  _$jscoverage['/touch/handle.js'].lineData[358] = 0;
}
if (! _$jscoverage['/touch/handle.js'].functionData) {
  _$jscoverage['/touch/handle.js'].functionData = [];
  _$jscoverage['/touch/handle.js'].functionData[0] = 0;
  _$jscoverage['/touch/handle.js'].functionData[1] = 0;
  _$jscoverage['/touch/handle.js'].functionData[2] = 0;
  _$jscoverage['/touch/handle.js'].functionData[3] = 0;
  _$jscoverage['/touch/handle.js'].functionData[4] = 0;
  _$jscoverage['/touch/handle.js'].functionData[5] = 0;
  _$jscoverage['/touch/handle.js'].functionData[6] = 0;
  _$jscoverage['/touch/handle.js'].functionData[7] = 0;
  _$jscoverage['/touch/handle.js'].functionData[8] = 0;
  _$jscoverage['/touch/handle.js'].functionData[9] = 0;
  _$jscoverage['/touch/handle.js'].functionData[10] = 0;
  _$jscoverage['/touch/handle.js'].functionData[11] = 0;
  _$jscoverage['/touch/handle.js'].functionData[12] = 0;
  _$jscoverage['/touch/handle.js'].functionData[13] = 0;
  _$jscoverage['/touch/handle.js'].functionData[14] = 0;
  _$jscoverage['/touch/handle.js'].functionData[15] = 0;
  _$jscoverage['/touch/handle.js'].functionData[16] = 0;
  _$jscoverage['/touch/handle.js'].functionData[17] = 0;
  _$jscoverage['/touch/handle.js'].functionData[18] = 0;
  _$jscoverage['/touch/handle.js'].functionData[19] = 0;
  _$jscoverage['/touch/handle.js'].functionData[20] = 0;
  _$jscoverage['/touch/handle.js'].functionData[21] = 0;
  _$jscoverage['/touch/handle.js'].functionData[22] = 0;
  _$jscoverage['/touch/handle.js'].functionData[23] = 0;
  _$jscoverage['/touch/handle.js'].functionData[24] = 0;
  _$jscoverage['/touch/handle.js'].functionData[25] = 0;
}
if (! _$jscoverage['/touch/handle.js'].branchData) {
  _$jscoverage['/touch/handle.js'].branchData = {};
  _$jscoverage['/touch/handle.js'].branchData['30'] = [];
  _$jscoverage['/touch/handle.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['38'] = [];
  _$jscoverage['/touch/handle.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['39'] = [];
  _$jscoverage['/touch/handle.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['50'] = [];
  _$jscoverage['/touch/handle.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['56'] = [];
  _$jscoverage['/touch/handle.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['89'] = [];
  _$jscoverage['/touch/handle.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['106'] = [];
  _$jscoverage['/touch/handle.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['108'] = [];
  _$jscoverage['/touch/handle.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['121'] = [];
  _$jscoverage['/touch/handle.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['123'] = [];
  _$jscoverage['/touch/handle.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['130'] = [];
  _$jscoverage['/touch/handle.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['134'] = [];
  _$jscoverage['/touch/handle.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['140'] = [];
  _$jscoverage['/touch/handle.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['150'] = [];
  _$jscoverage['/touch/handle.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['156'] = [];
  _$jscoverage['/touch/handle.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['168'] = [];
  _$jscoverage['/touch/handle.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['168'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['172'] = [];
  _$jscoverage['/touch/handle.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['172'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['172'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['183'] = [];
  _$jscoverage['/touch/handle.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['184'] = [];
  _$jscoverage['/touch/handle.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['184'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['184'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['187'] = [];
  _$jscoverage['/touch/handle.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['208'] = [];
  _$jscoverage['/touch/handle.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['211'] = [];
  _$jscoverage['/touch/handle.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['212'] = [];
  _$jscoverage['/touch/handle.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['216'] = [];
  _$jscoverage['/touch/handle.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['218'] = [];
  _$jscoverage['/touch/handle.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['236'] = [];
  _$jscoverage['/touch/handle.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['237'] = [];
  _$jscoverage['/touch/handle.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['241'] = [];
  _$jscoverage['/touch/handle.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['243'] = [];
  _$jscoverage['/touch/handle.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['253'] = [];
  _$jscoverage['/touch/handle.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['254'] = [];
  _$jscoverage['/touch/handle.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['260'] = [];
  _$jscoverage['/touch/handle.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['265'] = [];
  _$jscoverage['/touch/handle.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['267'] = [];
  _$jscoverage['/touch/handle.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['269'] = [];
  _$jscoverage['/touch/handle.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['282'] = [];
  _$jscoverage['/touch/handle.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['288'] = [];
  _$jscoverage['/touch/handle.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['293'] = [];
  _$jscoverage['/touch/handle.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['293'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['293'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['308'] = [];
  _$jscoverage['/touch/handle.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['320'] = [];
  _$jscoverage['/touch/handle.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['322'] = [];
  _$jscoverage['/touch/handle.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['341'] = [];
  _$jscoverage['/touch/handle.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['344'] = [];
  _$jscoverage['/touch/handle.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['352'] = [];
  _$jscoverage['/touch/handle.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['353'] = [];
  _$jscoverage['/touch/handle.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['356'] = [];
  _$jscoverage['/touch/handle.js'].branchData['356'][1] = new BranchData();
}
_$jscoverage['/touch/handle.js'].branchData['356'][1].init(121, 35, 'S.isEmptyObject(handle.eventHandle)');
function visit53_356_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['353'][1].init(21, 5, 'event');
function visit52_353_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['352'][1].init(105, 6, 'handle');
function visit51_352_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['344'][1].init(217, 5, 'event');
function visit50_344_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['341'][1].init(105, 7, '!handle');
function visit49_341_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['322'][1].init(65, 25, '!eventHandle[event].count');
function visit48_322_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['320'][1].init(65, 18, 'eventHandle[event]');
function visit47_320_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['308'][1].init(149, 18, 'eventHandle[event]');
function visit46_308_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['293'][3].init(303, 26, 'h[method](event) === false');
function visit45_293_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['293'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['293'][2].init(290, 39, 'h[method] && h[method](event) === false');
function visit44_293_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['293'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['293'][1].init(276, 53, 'h.isActive && h[method] && h[method](event) === false');
function visit43_293_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['288'][1].init(125, 11, 'h.processed');
function visit42_288_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['282'][1].init(238, 28, '!event.changedTouches.length');
function visit41_282_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['269'][1].init(76, 20, '!self.touches.length');
function visit40_269_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['267'][1].init(610, 20, 'isPointerEvent(type)');
function visit39_267_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['265'][1].init(529, 18, 'isMouseEvent(type)');
function visit38_265_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['260'][1].init(296, 18, 'isTouchEvent(type)');
function visit37_260_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['254'][1].init(21, 37, 'self.isEventSimulatedFromTouch(event)');
function visit36_254_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['253'][1].init(81, 18, 'isMouseEvent(type)');
function visit35_253_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['243'][1].init(390, 19, '!isTouchEvent(type)');
function visit34_243_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['241'][1].init(287, 20, 'isPointerEvent(type)');
function visit33_241_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['237'][1].init(21, 36, 'self.isEventSimulatedFromTouch(type)');
function visit32_237_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['236'][1].init(81, 18, 'isMouseEvent(type)');
function visit31_236_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['218'][1].init(73, 25, 'self.touches.length === 1');
function visit30_218_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['216'][1].init(505, 20, 'isPointerEvent(type)');
function visit29_216_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['212'][1].init(21, 37, 'self.isEventSimulatedFromTouch(event)');
function visit28_212_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['211'][1].init(298, 18, 'isMouseEvent(type)');
function visit27_211_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['208'][1].init(151, 18, 'isTouchEvent(type)');
function visit26_208_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['187'][1].init(169, 22, 'touchList.length === 1');
function visit25_187_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['184'][3].init(53, 22, 'type === \'touchcancel\'');
function visit24_184_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['184'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['184'][2].init(30, 19, 'type === \'touchend\'');
function visit23_184_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['184'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['184'][1].init(30, 45, 'type === \'touchend\' || type === \'touchcancel\'');
function visit22_184_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['183'][1].init(98, 18, 'isTouchEvent(type)');
function visit21_183_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['172'][3].init(211, 14, 'dy <= DUP_DIST');
function visit20_172_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['172'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['172'][2].init(193, 14, 'dx <= DUP_DIST');
function visit19_172_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['172'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['172'][1].init(193, 32, 'dx <= DUP_DIST && dy <= DUP_DIST');
function visit18_172_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['168'][2].init(162, 5, 'i < l');
function visit17_168_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['168'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['168'][1].init(162, 21, 'i < l && (t = lts[i])');
function visit16_168_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['156'][1].init(70, 6, 'i > -1');
function visit15_156_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['150'][1].init(165, 22, 'this.isPrimaryTouch(t)');
function visit14_150_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['140'][1].init(17, 28, 'this.isPrimaryTouch(inTouch)');
function visit13_140_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['134'][1].init(17, 24, 'this.firstTouch === null');
function visit12_134_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['130'][1].init(20, 38, 'this.firstTouch === inTouch.identifier');
function visit11_130_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['123'][1].init(57, 29, 'touch.pointerId === pointerId');
function visit10_123_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['121'][1].init(195, 5, 'i < l');
function visit9_121_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['108'][1].init(57, 29, 'touch.pointerId === pointerId');
function visit8_108_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['106'][1].init(195, 5, 'i < l');
function visit7_106_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['89'][1].init(219, 33, '!isPointerEvent(gestureMoveEvent)');
function visit6_89_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['56'][1].init(1639, 30, 'Feature.isMsPointerSupported()');
function visit5_56_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['50'][1].init(1361, 28, 'Feature.isPointerSupported()');
function visit4_50_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['39'][1].init(13, 8, 'S.UA.ios');
function visit3_39_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['38'][1].init(862, 31, 'Feature.isTouchEventSupported()');
function visit2_38_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['30'][1].init(16, 64, 'S.startsWith(type, \'MSPointer\') || S.startsWith(type, \'pointer\')');
function visit1_30_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch/handle.js'].functionData[0]++;
  _$jscoverage['/touch/handle.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/touch/handle.js'].lineData[8]++;
  var eventHandleMap = require('./handle-map');
  _$jscoverage['/touch/handle.js'].lineData[9]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/touch/handle.js'].lineData[10]++;
  require('./tap');
  _$jscoverage['/touch/handle.js'].lineData[11]++;
  require('./swipe');
  _$jscoverage['/touch/handle.js'].lineData[12]++;
  require('./pinch');
  _$jscoverage['/touch/handle.js'].lineData[13]++;
  require('./rotate');
  _$jscoverage['/touch/handle.js'].lineData[15]++;
  var key = S.guid('touch-handle'), Feature = S.Feature, gestureStartEvent, gestureMoveEvent, gestureEndEvent;
  _$jscoverage['/touch/handle.js'].lineData[21]++;
  function isTouchEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[1]++;
    _$jscoverage['/touch/handle.js'].lineData[22]++;
    return S.startsWith(type, 'touch');
  }
  _$jscoverage['/touch/handle.js'].lineData[25]++;
  function isMouseEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[2]++;
    _$jscoverage['/touch/handle.js'].lineData[26]++;
    return S.startsWith(type, 'mouse');
  }
  _$jscoverage['/touch/handle.js'].lineData[29]++;
  function isPointerEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[3]++;
    _$jscoverage['/touch/handle.js'].lineData[30]++;
    return visit1_30_1(S.startsWith(type, 'MSPointer') || S.startsWith(type, 'pointer'));
  }
  _$jscoverage['/touch/handle.js'].lineData[34]++;
  var DUP_TIMEOUT = 2500;
  _$jscoverage['/touch/handle.js'].lineData[36]++;
  var DUP_DIST = 25;
  _$jscoverage['/touch/handle.js'].lineData[38]++;
  if (visit2_38_1(Feature.isTouchEventSupported())) {
    _$jscoverage['/touch/handle.js'].lineData[39]++;
    if (visit3_39_1(S.UA.ios)) {
      _$jscoverage['/touch/handle.js'].lineData[41]++;
      gestureEndEvent = 'touchend touchcancel';
      _$jscoverage['/touch/handle.js'].lineData[42]++;
      gestureStartEvent = 'touchstart';
      _$jscoverage['/touch/handle.js'].lineData[43]++;
      gestureMoveEvent = 'touchmove';
    } else {
      _$jscoverage['/touch/handle.js'].lineData[45]++;
      gestureEndEvent = 'touchend touchcancel mouseup';
      _$jscoverage['/touch/handle.js'].lineData[47]++;
      gestureStartEvent = 'touchstart mousedown';
      _$jscoverage['/touch/handle.js'].lineData[48]++;
      gestureMoveEvent = 'touchmove mousemove';
    }
  } else {
    _$jscoverage['/touch/handle.js'].lineData[50]++;
    if (visit4_50_1(Feature.isPointerSupported())) {
      _$jscoverage['/touch/handle.js'].lineData[53]++;
      gestureStartEvent = 'pointerdown';
      _$jscoverage['/touch/handle.js'].lineData[54]++;
      gestureMoveEvent = 'pointermove';
      _$jscoverage['/touch/handle.js'].lineData[55]++;
      gestureEndEvent = 'pointerup pointercancel';
    } else {
      _$jscoverage['/touch/handle.js'].lineData[56]++;
      if (visit5_56_1(Feature.isMsPointerSupported())) {
        _$jscoverage['/touch/handle.js'].lineData[57]++;
        gestureStartEvent = 'MSPointerDown';
        _$jscoverage['/touch/handle.js'].lineData[58]++;
        gestureMoveEvent = 'MSPointerMove';
        _$jscoverage['/touch/handle.js'].lineData[59]++;
        gestureEndEvent = 'MSPointerUp MSPointerCancel';
      } else {
        _$jscoverage['/touch/handle.js'].lineData[61]++;
        gestureStartEvent = 'mousedown';
        _$jscoverage['/touch/handle.js'].lineData[62]++;
        gestureMoveEvent = 'mousemove';
        _$jscoverage['/touch/handle.js'].lineData[63]++;
        gestureEndEvent = 'mouseup';
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[66]++;
  function DocumentHandler(doc) {
    _$jscoverage['/touch/handle.js'].functionData[4]++;
    _$jscoverage['/touch/handle.js'].lineData[67]++;
    var self = this;
    _$jscoverage['/touch/handle.js'].lineData[68]++;
    self.doc = doc;
    _$jscoverage['/touch/handle.js'].lineData[69]++;
    self.eventHandle = {};
    _$jscoverage['/touch/handle.js'].lineData[70]++;
    self.init();
    _$jscoverage['/touch/handle.js'].lineData[72]++;
    self.touches = [];
    _$jscoverage['/touch/handle.js'].lineData[74]++;
    self.inTouch = 0;
  }
  _$jscoverage['/touch/handle.js'].lineData[77]++;
  DocumentHandler.prototype = {
  constructor: DocumentHandler, 
  lastTouches: [], 
  firstTouch: null, 
  init: function() {
  _$jscoverage['/touch/handle.js'].functionData[5]++;
  _$jscoverage['/touch/handle.js'].lineData[85]++;
  var self = this, doc = self.doc;
  _$jscoverage['/touch/handle.js'].lineData[87]++;
  DomEvent.on(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/touch/handle.js'].lineData[89]++;
  if (visit6_89_1(!isPointerEvent(gestureMoveEvent))) {
    _$jscoverage['/touch/handle.js'].lineData[90]++;
    DomEvent.on(doc, gestureMoveEvent, self.onTouchMove, self);
  }
  _$jscoverage['/touch/handle.js'].lineData[92]++;
  DomEvent.on(doc, gestureEndEvent, self.onTouchEnd, self);
}, 
  addTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[6]++;
  _$jscoverage['/touch/handle.js'].lineData[96]++;
  originalEvent.identifier = originalEvent.pointerId;
  _$jscoverage['/touch/handle.js'].lineData[97]++;
  this.touches.push(originalEvent);
}, 
  removeTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[7]++;
  _$jscoverage['/touch/handle.js'].lineData[101]++;
  var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
  _$jscoverage['/touch/handle.js'].lineData[106]++;
  for (; visit7_106_1(i < l); i++) {
    _$jscoverage['/touch/handle.js'].lineData[107]++;
    touch = touches[i];
    _$jscoverage['/touch/handle.js'].lineData[108]++;
    if (visit8_108_1(touch.pointerId === pointerId)) {
      _$jscoverage['/touch/handle.js'].lineData[109]++;
      touches.splice(i, 1);
      _$jscoverage['/touch/handle.js'].lineData[110]++;
      break;
    }
  }
}, 
  updateTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[8]++;
  _$jscoverage['/touch/handle.js'].lineData[116]++;
  var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
  _$jscoverage['/touch/handle.js'].lineData[121]++;
  for (; visit9_121_1(i < l); i++) {
    _$jscoverage['/touch/handle.js'].lineData[122]++;
    touch = touches[i];
    _$jscoverage['/touch/handle.js'].lineData[123]++;
    if (visit10_123_1(touch.pointerId === pointerId)) {
      _$jscoverage['/touch/handle.js'].lineData[124]++;
      touches[i] = originalEvent;
    }
  }
}, 
  isPrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[9]++;
  _$jscoverage['/touch/handle.js'].lineData[130]++;
  return visit11_130_1(this.firstTouch === inTouch.identifier);
}, 
  setPrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[10]++;
  _$jscoverage['/touch/handle.js'].lineData[134]++;
  if (visit12_134_1(this.firstTouch === null)) {
    _$jscoverage['/touch/handle.js'].lineData[135]++;
    this.firstTouch = inTouch.identifier;
  }
}, 
  removePrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[11]++;
  _$jscoverage['/touch/handle.js'].lineData[140]++;
  if (visit13_140_1(this.isPrimaryTouch(inTouch))) {
    _$jscoverage['/touch/handle.js'].lineData[141]++;
    this.firstTouch = null;
  }
}, 
  dupMouse: function(inEvent) {
  _$jscoverage['/touch/handle.js'].functionData[12]++;
  _$jscoverage['/touch/handle.js'].lineData[147]++;
  var lts = this.lastTouches;
  _$jscoverage['/touch/handle.js'].lineData[148]++;
  var t = inEvent.changedTouches[0];
  _$jscoverage['/touch/handle.js'].lineData[150]++;
  if (visit14_150_1(this.isPrimaryTouch(t))) {
    _$jscoverage['/touch/handle.js'].lineData[152]++;
    var lt = {
  x: t.clientX, 
  y: t.clientY};
    _$jscoverage['/touch/handle.js'].lineData[153]++;
    lts.push(lt);
    _$jscoverage['/touch/handle.js'].lineData[154]++;
    setTimeout(function() {
  _$jscoverage['/touch/handle.js'].functionData[13]++;
  _$jscoverage['/touch/handle.js'].lineData[155]++;
  var i = lts.indexOf(lt);
  _$jscoverage['/touch/handle.js'].lineData[156]++;
  if (visit15_156_1(i > -1)) {
    _$jscoverage['/touch/handle.js'].lineData[157]++;
    lts.splice(i, 1);
  }
}, DUP_TIMEOUT);
  }
}, 
  isEventSimulatedFromTouch: function(inEvent) {
  _$jscoverage['/touch/handle.js'].functionData[14]++;
  _$jscoverage['/touch/handle.js'].lineData[165]++;
  var lts = this.lastTouches;
  _$jscoverage['/touch/handle.js'].lineData[166]++;
  var x = inEvent.clientX, y = inEvent.clientY;
  _$jscoverage['/touch/handle.js'].lineData[168]++;
  for (var i = 0, l = lts.length, t; visit16_168_1(visit17_168_2(i < l) && (t = lts[i])); i++) {
    _$jscoverage['/touch/handle.js'].lineData[170]++;
    var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
    _$jscoverage['/touch/handle.js'].lineData[172]++;
    if (visit18_172_1(visit19_172_2(dx <= DUP_DIST) && visit20_172_3(dy <= DUP_DIST))) {
      _$jscoverage['/touch/handle.js'].lineData[173]++;
      return true;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[176]++;
  return 0;
}, 
  normalize: function(e) {
  _$jscoverage['/touch/handle.js'].functionData[15]++;
  _$jscoverage['/touch/handle.js'].lineData[180]++;
  var type = e.type, notUp, touchList;
  _$jscoverage['/touch/handle.js'].lineData[183]++;
  if (visit21_183_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[184]++;
    touchList = (visit22_184_1(visit23_184_2(type === 'touchend') || visit24_184_3(type === 'touchcancel'))) ? e.changedTouches : e.touches;
    _$jscoverage['/touch/handle.js'].lineData[187]++;
    if (visit25_187_1(touchList.length === 1)) {
      _$jscoverage['/touch/handle.js'].lineData[188]++;
      e.which = 1;
      _$jscoverage['/touch/handle.js'].lineData[189]++;
      e.pageX = touchList[0].pageX;
      _$jscoverage['/touch/handle.js'].lineData[190]++;
      e.pageY = touchList[0].pageY;
    }
    _$jscoverage['/touch/handle.js'].lineData[192]++;
    return e;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[194]++;
    touchList = this.touches;
  }
  _$jscoverage['/touch/handle.js'].lineData[196]++;
  notUp = !type.match(/(up|cancel)$/i);
  _$jscoverage['/touch/handle.js'].lineData[197]++;
  e.touches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[198]++;
  e.targetTouches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[199]++;
  e.changedTouches = touchList;
  _$jscoverage['/touch/handle.js'].lineData[200]++;
  return e;
}, 
  onTouchStart: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[16]++;
  _$jscoverage['/touch/handle.js'].lineData[204]++;
  var e, h, self = this, type = event.type, eventHandle = self.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[208]++;
  if (visit26_208_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[209]++;
    self.setPrimaryTouch(event.changedTouches[0]);
    _$jscoverage['/touch/handle.js'].lineData[210]++;
    self.dupMouse(event);
  } else {
    _$jscoverage['/touch/handle.js'].lineData[211]++;
    if (visit27_211_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[212]++;
      if (visit28_212_1(self.isEventSimulatedFromTouch(event))) {
        _$jscoverage['/touch/handle.js'].lineData[213]++;
        return;
      }
      _$jscoverage['/touch/handle.js'].lineData[215]++;
      self.touches = [event.originalEvent];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[216]++;
      if (visit29_216_1(isPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[217]++;
        self.addTouch(event.originalEvent);
        _$jscoverage['/touch/handle.js'].lineData[218]++;
        if (visit30_218_1(self.touches.length === 1)) {
          _$jscoverage['/touch/handle.js'].lineData[219]++;
          DomEvent.on(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      } else {
        _$jscoverage['/touch/handle.js'].lineData[222]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[225]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[226]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[227]++;
    h.isActive = 1;
  }
  _$jscoverage['/touch/handle.js'].lineData[230]++;
  self.callEventHandle('onTouchStart', event);
}, 
  onTouchMove: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[17]++;
  _$jscoverage['/touch/handle.js'].lineData[234]++;
  var self = this, type = event.type;
  _$jscoverage['/touch/handle.js'].lineData[236]++;
  if (visit31_236_1(isMouseEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[237]++;
    if (visit32_237_1(self.isEventSimulatedFromTouch(type))) {
      _$jscoverage['/touch/handle.js'].lineData[238]++;
      return;
    }
    _$jscoverage['/touch/handle.js'].lineData[240]++;
    self.touches = [event.originalEvent];
  } else {
    _$jscoverage['/touch/handle.js'].lineData[241]++;
    if (visit33_241_1(isPointerEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[242]++;
      self.updateTouch(event.originalEvent);
    } else {
      _$jscoverage['/touch/handle.js'].lineData[243]++;
      if (visit34_243_1(!isTouchEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[244]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[247]++;
  self.callEventHandle('onTouchMove', event);
}, 
  onTouchEnd: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[18]++;
  _$jscoverage['/touch/handle.js'].lineData[251]++;
  var self = this, type = event.type;
  _$jscoverage['/touch/handle.js'].lineData[253]++;
  if (visit35_253_1(isMouseEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[254]++;
    if (visit36_254_1(self.isEventSimulatedFromTouch(event))) {
      _$jscoverage['/touch/handle.js'].lineData[255]++;
      return;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[259]++;
  self.callEventHandle('onTouchEnd', event);
  _$jscoverage['/touch/handle.js'].lineData[260]++;
  if (visit37_260_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[261]++;
    self.dupMouse(event);
    _$jscoverage['/touch/handle.js'].lineData[262]++;
    S.makeArray(event.changedTouches).forEach(function(touch) {
  _$jscoverage['/touch/handle.js'].functionData[19]++;
  _$jscoverage['/touch/handle.js'].lineData[263]++;
  self.removePrimaryTouch(touch);
});
  } else {
    _$jscoverage['/touch/handle.js'].lineData[265]++;
    if (visit38_265_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[266]++;
      self.touches = [];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[267]++;
      if (visit39_267_1(isPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[268]++;
        self.removeTouch(event.originalEvent);
        _$jscoverage['/touch/handle.js'].lineData[269]++;
        if (visit40_269_1(!self.touches.length)) {
          _$jscoverage['/touch/handle.js'].lineData[270]++;
          DomEvent.detach(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      }
    }
  }
}, 
  callEventHandle: function(method, event) {
  _$jscoverage['/touch/handle.js'].functionData[20]++;
  _$jscoverage['/touch/handle.js'].lineData[276]++;
  var self = this, eventHandle = self.eventHandle, e, h;
  _$jscoverage['/touch/handle.js'].lineData[280]++;
  event = self.normalize(event);
  _$jscoverage['/touch/handle.js'].lineData[282]++;
  if (visit41_282_1(!event.changedTouches.length)) {
    _$jscoverage['/touch/handle.js'].lineData[283]++;
    return;
  }
  _$jscoverage['/touch/handle.js'].lineData[285]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[287]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[288]++;
    if (visit42_288_1(h.processed)) {
      _$jscoverage['/touch/handle.js'].lineData[289]++;
      continue;
    }
    _$jscoverage['/touch/handle.js'].lineData[291]++;
    h.processed = 1;
    _$jscoverage['/touch/handle.js'].lineData[293]++;
    if (visit43_293_1(h.isActive && visit44_293_2(h[method] && visit45_293_3(h[method](event) === false)))) {
      _$jscoverage['/touch/handle.js'].lineData[294]++;
      h.isActive = 0;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[298]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[299]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[300]++;
    h.processed = 0;
  }
}, 
  addEventHandle: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[21]++;
  _$jscoverage['/touch/handle.js'].lineData[305]++;
  var self = this, eventHandle = self.eventHandle, handle = eventHandleMap[event].handle;
  _$jscoverage['/touch/handle.js'].lineData[308]++;
  if (visit46_308_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[309]++;
    eventHandle[event].count++;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[311]++;
    eventHandle[event] = {
  count: 1, 
  handle: handle};
  }
}, 
  'removeEventHandle': function(event) {
  _$jscoverage['/touch/handle.js'].functionData[22]++;
  _$jscoverage['/touch/handle.js'].lineData[319]++;
  var eventHandle = this.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[320]++;
  if (visit47_320_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[321]++;
    eventHandle[event].count--;
    _$jscoverage['/touch/handle.js'].lineData[322]++;
    if (visit48_322_1(!eventHandle[event].count)) {
      _$jscoverage['/touch/handle.js'].lineData[323]++;
      delete eventHandle[event];
    }
  }
}, 
  destroy: function() {
  _$jscoverage['/touch/handle.js'].functionData[23]++;
  _$jscoverage['/touch/handle.js'].lineData[329]++;
  var self = this, doc = self.doc;
  _$jscoverage['/touch/handle.js'].lineData[331]++;
  DomEvent.detach(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/touch/handle.js'].lineData[332]++;
  DomEvent.detach(doc, gestureMoveEvent, self.onTouchMove, self);
  _$jscoverage['/touch/handle.js'].lineData[333]++;
  DomEvent.detach(doc, gestureEndEvent, self.onTouchEnd, self);
}};
  _$jscoverage['/touch/handle.js'].lineData[337]++;
  return {
  addDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[24]++;
  _$jscoverage['/touch/handle.js'].lineData[339]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[341]++;
  if (visit49_341_1(!handle)) {
    _$jscoverage['/touch/handle.js'].lineData[342]++;
    Dom.data(doc, key, handle = new DocumentHandler(doc));
  }
  _$jscoverage['/touch/handle.js'].lineData[344]++;
  if (visit50_344_1(event)) {
    _$jscoverage['/touch/handle.js'].lineData[345]++;
    handle.addEventHandle(event);
  }
}, 
  removeDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[25]++;
  _$jscoverage['/touch/handle.js'].lineData[350]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[352]++;
  if (visit51_352_1(handle)) {
    _$jscoverage['/touch/handle.js'].lineData[353]++;
    if (visit52_353_1(event)) {
      _$jscoverage['/touch/handle.js'].lineData[354]++;
      handle.removeEventHandle(event);
    }
    _$jscoverage['/touch/handle.js'].lineData[356]++;
    if (visit53_356_1(S.isEmptyObject(handle.eventHandle))) {
      _$jscoverage['/touch/handle.js'].lineData[357]++;
      handle.destroy();
      _$jscoverage['/touch/handle.js'].lineData[358]++;
      Dom.removeData(doc, key);
    }
  }
}};
});
