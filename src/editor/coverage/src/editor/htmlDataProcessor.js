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
if (! _$jscoverage['/editor/htmlDataProcessor.js']) {
  _$jscoverage['/editor/htmlDataProcessor.js'] = {};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[10] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[11] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[12] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[13] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[14] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[16] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[22] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[23] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[28] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[29] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[30] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[31] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[32] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[34] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[35] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[38] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[40] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[44] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[46] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[47] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[48] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[54] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[73] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[82] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[84] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[87] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[89] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[90] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[91] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[92] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[97] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[100] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[103] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[104] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[106] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[107] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[109] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[110] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[117] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[118] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[120] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[131] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[132] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[134] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[150] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[151] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[152] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[154] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[157] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[162] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[164] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[165] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[170] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[171] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[179] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[184] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[187] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[188] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[191] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[192] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[194] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[197] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[198] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[199] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[200] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[201] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[203] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[204] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[209] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[210] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[212] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[220] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[221] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[222] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[225] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[226] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[232] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[233] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[234] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[237] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[242] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[243] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[247] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[248] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[249] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[255] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[256] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[257] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[259] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[260] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[261] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[264] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[265] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[272] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[274] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[281] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[286] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[287] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[288] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[291] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[292] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[294] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[299] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[301] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[304] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[307] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[309] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[310] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[313] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[314] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[315] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[319] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[320] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[321] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[325] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[326] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[329] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[330] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[333] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[339] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[341] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[347] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[349] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[350] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[351] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[356] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[363] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[365] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[369] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[373] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[378] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[380] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[381] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[384] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[386] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[391] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[394] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[396] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[398] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[404] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[406] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[407] = 0;
}
if (! _$jscoverage['/editor/htmlDataProcessor.js'].functionData) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[0] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[1] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[2] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[3] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[4] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[5] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[6] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[7] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[8] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[9] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[10] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[11] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[12] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[13] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[14] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[15] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[16] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[17] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[18] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[19] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[20] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[21] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[22] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[23] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[24] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[25] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[26] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[27] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[28] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[29] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[30] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[31] = 0;
}
if (! _$jscoverage['/editor/htmlDataProcessor.js'].branchData) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData = {};
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['13'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['28'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['30'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['84'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['89'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['91'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['103'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['103'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['106'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['109'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['117'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['131'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['150'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['157'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['191'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['191'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['191'][3] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['199'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][3] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['203'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['203'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['212'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['215'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['215'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['216'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['222'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['225'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['234'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['248'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['291'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['339'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['356'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['356'][1] = new BranchData();
}
_$jscoverage['/editor/htmlDataProcessor.js'].branchData['356'][1].init(85, 25, '_dataFilter || dataFilter');
function visit371_356_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['339'][1].init(25, 9, 'UA.webkit');
function visit370_339_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['291'][1].init(183, 49, 'attributes.indexOf(\'_ke_saved_\' + attrName) == -1');
function visit369_291_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['248'][1].init(25, 19, '!(\'br\' in dtd[i])');
function visit368_248_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['234'][1].init(65, 26, 'blockNeedsExtension(block)');
function visit367_234_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['225'][1].init(138, 7, '!OLD_IE');
function visit366_225_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['222'][1].init(65, 26, 'blockNeedsExtension(block)');
function visit365_222_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['216'][1].init(51, 29, 'lastChild.nodeName == \'input\'');
function visit364_216_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['215'][2].init(335, 24, 'block.nodeName == \'form\'');
function visit363_215_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['215'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['215'][1].init(188, 81, 'block.nodeName == \'form\' && lastChild.nodeName == \'input\'');
function visit362_215_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['212'][1].init(144, 270, '!lastChild || block.nodeName == \'form\' && lastChild.nodeName == \'input\'');
function visit361_212_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['203'][2].init(204, 23, 'lastChild.nodeType == 3');
function visit360_203_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['203'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['203'][1].init(204, 66, 'lastChild.nodeType == 3 && tailNbspRegex.test(lastChild.nodeValue)');
function visit359_203_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][3].init(56, 26, 'lastChild.nodeName == \'br\'');
function visit358_200_3(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][2].init(29, 23, 'lastChild.nodeType == 1');
function visit357_200_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][1].init(29, 53, 'lastChild.nodeType == 1 && lastChild.nodeName == \'br\'');
function visit356_200_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['199'][1].init(88, 9, 'lastChild');
function visit355_199_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['191'][3].init(206, 18, 'last.nodeType == 3');
function visit354_191_3(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['191'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['191'][2].init(206, 45, 'last.nodeType == 3 && !S.trim(last.nodeValue)');
function visit353_191_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['191'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['191'][1].init(198, 53, 'last && last.nodeType == 3 && !S.trim(last.nodeValue)');
function visit352_191_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['157'][1].init(5237, 6, 'OLD_IE');
function visit351_157_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['150'][1].init(99, 73, 'contents.substr(0, protectedSourceMarker.length) == protectedSourceMarker');
function visit350_150_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['131'][1].init(33, 10, '!S.trim(v)');
function visit349_131_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['117'][1].init(33, 60, '!(element.childNodes.length) && !(element.attributes.length)');
function visit348_117_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['109'][1].init(364, 12, 'parentHeight');
function visit347_109_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['106'][1].init(199, 11, 'parentWidth');
function visit346_106_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['103'][2].init(251, 27, 'parent.nodeName == \'object\'');
function visit345_103_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['103'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['103'][1].init(241, 37, 'parent && parent.nodeName == \'object\'');
function visit344_103_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['91'][1].init(134, 40, 'element.getAttribute(savedAttributeName)');
function visit343_91_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['89'][1].init(324, 25, 'i < attributeNames.length');
function visit342_89_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['84'][1].init(99, 17, 'attributes.length');
function visit341_84_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'][2].init(76, 42, 'child.nodeType == S.DOM.NodeType.TEXT_NODE');
function visit340_32_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'][1].init(76, 62, 'child.nodeType == S.DOM.NodeType.TEXT_NODE && !child.nodeValue');
function visit339_32_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['30'][1].init(67, 5, 'i < l');
function visit338_30_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['28'][1].init(197, 1, 'l');
function visit337_28_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['13'][1].init(99, 16, 'S.UA.ieMode < 11');
function visit336_13_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[0]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[11]++;
  var Editor = require('./base');
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[12]++;
  var HtmlParser = require('html-parser');
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[13]++;
  var OLD_IE = visit336_13_1(S.UA.ieMode < 11);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[14]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[1]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[16]++;
  var Node = S.Node, UA = S.UA, htmlFilter = new HtmlParser.Filter(), dataFilter = new HtmlParser.Filter();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[22]++;
  function filterInline(element) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[2]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[23]++;
    var childNodes = element.childNodes, i, child, allEmpty, l = childNodes.length;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[28]++;
    if (visit337_28_1(l)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[29]++;
      allEmpty = 1;
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[30]++;
      for (i = 0; visit338_30_1(i < l); i++) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[31]++;
        child = childNodes[i];
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[32]++;
        if (visit339_32_1(visit340_32_2(child.nodeType == S.DOM.NodeType.TEXT_NODE) && !child.nodeValue)) {
        } else {
          _$jscoverage['/editor/htmlDataProcessor.js'].lineData[34]++;
          allEmpty = 0;
          _$jscoverage['/editor/htmlDataProcessor.js'].lineData[35]++;
          break;
        }
      }
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[38]++;
      return allEmpty ? false : undefined;
    } else {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[40]++;
      return false;
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[44]++;
  (function() {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[3]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[46]++;
  function wrapAsComment(element) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[4]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[47]++;
    var html = HtmlParser.serialize(element);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[48]++;
    return new HtmlParser.Comment(protectedSourceMarker + encodeURIComponent(html).replace(/--/g, "%2D%2D"));
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[54]++;
  var defaultDataFilterRules = {
  tagNames: [[/^\?xml.*$/i, ''], [/^.*namespace.*$/i, '']], 
  attributeNames: [[/^on/, 'ke_on'], [/^lang$/, '']], 
  tags: {
  script: wrapAsComment, 
  noscript: wrapAsComment, 
  span: filterInline}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[73]++;
  var defaultHTMLFilterRules = {
  tagNames: [[(/^ke:/), ''], [(/^\?xml:namespace$/), '']], 
  tags: {
  $: function(element) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[5]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[82]++;
  var attributes = element.attributes;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[84]++;
  if (visit341_84_1(attributes.length)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[87]++;
    var attributeNames = ['name', 'href', 'src'], savedAttributeName;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[89]++;
    for (var i = 0; visit342_89_1(i < attributeNames.length); i++) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[90]++;
      savedAttributeName = '_ke_saved_' + attributeNames[i];
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[91]++;
      if (visit343_91_1(element.getAttribute(savedAttributeName))) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[92]++;
        element.removeAttribute(attributeNames[i]);
      }
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[97]++;
  return element;
}, 
  embed: function(element) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[6]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[100]++;
  var parent = element.parentNode;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[103]++;
  if (visit344_103_1(parent && visit345_103_2(parent.nodeName == 'object'))) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[104]++;
    var parentWidth = parent.getAttribute("width"), parentHeight = parent.getAttribute("height");
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[106]++;
    if (visit346_106_1(parentWidth)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[107]++;
      element.setAttribute("width", parentWidth);
    }
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[109]++;
    if (visit347_109_1(parentHeight)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[110]++;
      element.setAttribute("width", parentHeight);
    }
  }
}, 
  a: function(element) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[7]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[117]++;
  if (visit348_117_1(!(element.childNodes.length) && !(element.attributes.length))) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[118]++;
    return false;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[120]++;
  return undefined;
}, 
  span: filterInline, 
  strong: filterInline, 
  em: filterInline, 
  del: filterInline, 
  u: filterInline}, 
  attributes: {
  style: function(v) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[8]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[131]++;
  if (visit349_131_1(!S.trim(v))) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[132]++;
    return false;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[134]++;
  return undefined;
}}, 
  attributeNames: [[(/^_ke_saved_/), ''], [(/^ke_on/), 'on'], [(/^_ke.*/), ''], [(/^ke:.*$/), ''], [(/^_ks.*/), '']], 
  comment: function(contents) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[9]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[150]++;
  if (visit350_150_1(contents.substr(0, protectedSourceMarker.length) == protectedSourceMarker)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[151]++;
    contents = S.trim(S.urlDecode(contents.substr(protectedSourceMarker.length)));
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[152]++;
    return HtmlParser.parse(contents).childNodes[0];
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[154]++;
  return undefined;
}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[157]++;
  if (visit351_157_1(OLD_IE)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[162]++;
    defaultHTMLFilterRules.attributes.style = function(value) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[10]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[164]++;
  return value.replace(/(^|;)([^:]+)/g, function(match) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[11]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[165]++;
  return match.toLowerCase();
});
};
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[170]++;
  htmlFilter.addRules(defaultHTMLFilterRules);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[171]++;
  dataFilter.addRules(defaultDataFilterRules);
})();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[179]++;
  (function() {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[12]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[184]++;
  var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)[\t\r\n ]*$/;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[187]++;
  function lastNoneSpaceChild(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[13]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[188]++;
    var childNodes = block.childNodes, lastIndex = childNodes.length, last = childNodes[lastIndex - 1];
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[191]++;
    while (visit352_191_1(last && visit353_191_2(visit354_191_3(last.nodeType == 3) && !S.trim(last.nodeValue)))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[192]++;
      last = childNodes[--lastIndex];
    }
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[194]++;
    return last;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[197]++;
  function trimFillers(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[14]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[198]++;
    var lastChild = lastNoneSpaceChild(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[199]++;
    if (visit355_199_1(lastChild)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[200]++;
      if (visit356_200_1(visit357_200_2(lastChild.nodeType == 1) && visit358_200_3(lastChild.nodeName == 'br'))) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[201]++;
        block.removeChild(lastChild);
      } else {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[203]++;
        if (visit359_203_1(visit360_203_2(lastChild.nodeType == 3) && tailNbspRegex.test(lastChild.nodeValue))) {
          _$jscoverage['/editor/htmlDataProcessor.js'].lineData[204]++;
          block.removeChild(lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[209]++;
  function blockNeedsExtension(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[15]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[210]++;
    var lastChild = lastNoneSpaceChild(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[212]++;
    return visit361_212_1(!lastChild || visit362_215_1(visit363_215_2(block.nodeName == 'form') && visit364_216_1(lastChild.nodeName == 'input')));
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[220]++;
  function extendBlockForDisplay(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[16]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[221]++;
    trimFillers(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[222]++;
    if (visit365_222_1(blockNeedsExtension(block))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[225]++;
      if (visit366_225_1(!OLD_IE)) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[226]++;
        block.appendChild(new HtmlParser.Tag('br'));
      }
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[232]++;
  function extendBlockForOutput(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[17]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[233]++;
    trimFillers(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[234]++;
    if (visit367_234_1(blockNeedsExtension(block))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[237]++;
      block.appendChild(new HtmlParser.Text('\xa0'));
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[242]++;
  var dtd = Editor.XHTML_DTD;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[243]++;
  var blockLikeTags = S.merge(dtd.$block, dtd.$listItem, dtd.$tableContent), i;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[247]++;
  for (i in blockLikeTags) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[248]++;
    if (visit368_248_1(!('br' in dtd[i]))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[249]++;
      delete blockLikeTags[i];
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[255]++;
  delete blockLikeTags.pre;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[256]++;
  var defaultDataBlockFilterRules = {
  tags: {}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[257]++;
  var defaultHTMLBlockFilterRules = {
  tags: {}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[259]++;
  for (i in blockLikeTags) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[260]++;
    defaultDataBlockFilterRules.tags[i] = extendBlockForDisplay;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[261]++;
    defaultHTMLBlockFilterRules.tags[i] = extendBlockForOutput;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[264]++;
  dataFilter.addRules(defaultDataBlockFilterRules);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[265]++;
  htmlFilter.addRules(defaultHTMLBlockFilterRules);
})();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[272]++;
  htmlFilter.addRules({
  text: function(text) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[18]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[274]++;
  return text.replace(/\xa0/g, "&nbsp;");
}});
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[281]++;
  var protectElementRegex = /<(a|area|img|input)\b([^>]*)>/gi, protectAttributeRegex = /\b(href|src|name)\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|(?:[^ "'>]+))/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[286]++;
  function protectAttributes(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[19]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[287]++;
    return html.replace(protectElementRegex, function(element, tag, attributes) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[20]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[288]++;
  return '<' + tag + attributes.replace(protectAttributeRegex, function(fullAttr, attrName) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[21]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[291]++;
  if (visit369_291_1(attributes.indexOf('_ke_saved_' + attrName) == -1)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[292]++;
    return ' _ke_saved_' + fullAttr + ' ' + fullAttr;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[294]++;
  return fullAttr;
}) + '>';
});
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[299]++;
  var protectedSourceMarker = '{ke_protected}';
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[301]++;
  var protectElementsRegex = /(?:<textarea[^>]*>[\s\S]*<\/textarea>)|(?:<style[^>]*>[\s\S]*<\/style>)|(?:<script[^>]*>[\s\S]*<\/script>)|(?:<(:?link|meta|base)[^>]*>)/gi, encodedElementsRegex = /<ke:encoded>([^<]*)<\/ke:encoded>/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[304]++;
  var protectElementNamesRegex = /(<\/?)((?:object|embed|param|html|body|head|title|noscript)[^>]*>)/gi, unprotectElementNamesRegex = /(<\/?)ke:((?:object|embed|param|html|body|head|title|noscript)[^>]*>)/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[307]++;
  var protectSelfClosingRegex = /<ke:(param|embed)([^>]*?)\/?>(?!\s*<\/ke:\1)/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[309]++;
  function protectSelfClosingElements(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[22]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[310]++;
    return html.replace(protectSelfClosingRegex, '<ke:$1$2></ke:$1>');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[313]++;
  function protectElements(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[23]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[314]++;
    return html.replace(protectElementsRegex, function(match) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[24]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[315]++;
  return '<ke:encoded>' + encodeURIComponent(match) + '</ke:encoded>';
});
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[319]++;
  function unprotectElements(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[25]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[320]++;
    return html.replace(encodedElementsRegex, function(match, encoded) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[26]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[321]++;
  return S.urlDecode(encoded);
});
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[325]++;
  function protectElementsNames(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[27]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[326]++;
    return html.replace(protectElementNamesRegex, '$1ke:$2');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[329]++;
  function unprotectElementNames(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[28]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[330]++;
    return html.replace(unprotectElementNamesRegex, '$1$2');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[333]++;
  editor.htmlDataProcessor = {
  dataFilter: dataFilter, 
  htmlFilter: htmlFilter, 
  toHtml: function(html) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[29]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[339]++;
  if (visit370_339_1(UA.webkit)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[341]++;
    html = html.replace(/\u200b/g, '');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[347]++;
  var writer = new HtmlParser.BeautifyWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[349]++;
  n.writeHtml(writer, htmlFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[350]++;
  html = writer.getHtml();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[351]++;
  return html;
}, 
  toDataFormat: function(html, _dataFilter) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[30]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[356]++;
  _dataFilter = visit371_356_1(_dataFilter || dataFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[363]++;
  html = protectElements(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[365]++;
  html = protectAttributes(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[369]++;
  html = protectElementsNames(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[373]++;
  html = protectSelfClosingElements(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[378]++;
  var div = new Node("<div>");
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[380]++;
  div.html('a' + html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[381]++;
  html = div.html().substr(1);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[384]++;
  html = unprotectElementNames(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[386]++;
  html = unprotectElements(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[391]++;
  var writer = new HtmlParser.BasicWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[394]++;
  n.writeHtml(writer, _dataFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[396]++;
  html = writer.getHtml();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[398]++;
  return html;
}, 
  toServer: function(html) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[31]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[404]++;
  var writer = new HtmlParser.MinifyWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[406]++;
  n.writeHtml(writer, htmlFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[407]++;
  return writer.getHtml();
}};
}};
});
