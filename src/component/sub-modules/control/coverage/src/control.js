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
if (! _$jscoverage['/control.js']) {
  _$jscoverage['/control.js'] = {};
  _$jscoverage['/control.js'].lineData = [];
  _$jscoverage['/control.js'].lineData[6] = 0;
  _$jscoverage['/control.js'].lineData[7] = 0;
  _$jscoverage['/control.js'].lineData[8] = 0;
  _$jscoverage['/control.js'].lineData[9] = 0;
  _$jscoverage['/control.js'].lineData[10] = 0;
  _$jscoverage['/control.js'].lineData[11] = 0;
  _$jscoverage['/control.js'].lineData[21] = 0;
  _$jscoverage['/control.js'].lineData[41] = 0;
  _$jscoverage['/control.js'].lineData[48] = 0;
  _$jscoverage['/control.js'].lineData[49] = 0;
  _$jscoverage['/control.js'].lineData[51] = 0;
  _$jscoverage['/control.js'].lineData[55] = 0;
  _$jscoverage['/control.js'].lineData[56] = 0;
  _$jscoverage['/control.js'].lineData[57] = 0;
  _$jscoverage['/control.js'].lineData[58] = 0;
  _$jscoverage['/control.js'].lineData[61] = 0;
  _$jscoverage['/control.js'].lineData[70] = 0;
  _$jscoverage['/control.js'].lineData[72] = 0;
  _$jscoverage['/control.js'].lineData[76] = 0;
  _$jscoverage['/control.js'].lineData[79] = 0;
  _$jscoverage['/control.js'].lineData[84] = 0;
  _$jscoverage['/control.js'].lineData[87] = 0;
  _$jscoverage['/control.js'].lineData[88] = 0;
  _$jscoverage['/control.js'].lineData[93] = 0;
  _$jscoverage['/control.js'].lineData[98] = 0;
  _$jscoverage['/control.js'].lineData[99] = 0;
  _$jscoverage['/control.js'].lineData[100] = 0;
  _$jscoverage['/control.js'].lineData[105] = 0;
  _$jscoverage['/control.js'].lineData[106] = 0;
  _$jscoverage['/control.js'].lineData[112] = 0;
  _$jscoverage['/control.js'].lineData[119] = 0;
  _$jscoverage['/control.js'].lineData[121] = 0;
  _$jscoverage['/control.js'].lineData[122] = 0;
  _$jscoverage['/control.js'].lineData[123] = 0;
  _$jscoverage['/control.js'].lineData[124] = 0;
  _$jscoverage['/control.js'].lineData[125] = 0;
  _$jscoverage['/control.js'].lineData[130] = 0;
  _$jscoverage['/control.js'].lineData[134] = 0;
  _$jscoverage['/control.js'].lineData[135] = 0;
  _$jscoverage['/control.js'].lineData[136] = 0;
  _$jscoverage['/control.js'].lineData[137] = 0;
  _$jscoverage['/control.js'].lineData[139] = 0;
  _$jscoverage['/control.js'].lineData[140] = 0;
  _$jscoverage['/control.js'].lineData[145] = 0;
  _$jscoverage['/control.js'].lineData[146] = 0;
  _$jscoverage['/control.js'].lineData[152] = 0;
  _$jscoverage['/control.js'].lineData[158] = 0;
  _$jscoverage['/control.js'].lineData[165] = 0;
  _$jscoverage['/control.js'].lineData[173] = 0;
  _$jscoverage['/control.js'].lineData[174] = 0;
  _$jscoverage['/control.js'].lineData[175] = 0;
  _$jscoverage['/control.js'].lineData[176] = 0;
  _$jscoverage['/control.js'].lineData[184] = 0;
  _$jscoverage['/control.js'].lineData[185] = 0;
  _$jscoverage['/control.js'].lineData[186] = 0;
  _$jscoverage['/control.js'].lineData[190] = 0;
  _$jscoverage['/control.js'].lineData[191] = 0;
  _$jscoverage['/control.js'].lineData[196] = 0;
  _$jscoverage['/control.js'].lineData[197] = 0;
  _$jscoverage['/control.js'].lineData[202] = 0;
  _$jscoverage['/control.js'].lineData[209] = 0;
  _$jscoverage['/control.js'].lineData[210] = 0;
  _$jscoverage['/control.js'].lineData[222] = 0;
  _$jscoverage['/control.js'].lineData[226] = 0;
  _$jscoverage['/control.js'].lineData[227] = 0;
  _$jscoverage['/control.js'].lineData[237] = 0;
  _$jscoverage['/control.js'].lineData[241] = 0;
  _$jscoverage['/control.js'].lineData[242] = 0;
  _$jscoverage['/control.js'].lineData[252] = 0;
  _$jscoverage['/control.js'].lineData[253] = 0;
  _$jscoverage['/control.js'].lineData[254] = 0;
  _$jscoverage['/control.js'].lineData[258] = 0;
  _$jscoverage['/control.js'].lineData[259] = 0;
  _$jscoverage['/control.js'].lineData[272] = 0;
  _$jscoverage['/control.js'].lineData[275] = 0;
  _$jscoverage['/control.js'].lineData[276] = 0;
  _$jscoverage['/control.js'].lineData[277] = 0;
  _$jscoverage['/control.js'].lineData[279] = 0;
  _$jscoverage['/control.js'].lineData[280] = 0;
  _$jscoverage['/control.js'].lineData[282] = 0;
  _$jscoverage['/control.js'].lineData[285] = 0;
  _$jscoverage['/control.js'].lineData[286] = 0;
  _$jscoverage['/control.js'].lineData[288] = 0;
  _$jscoverage['/control.js'].lineData[289] = 0;
  _$jscoverage['/control.js'].lineData[296] = 0;
  _$jscoverage['/control.js'].lineData[297] = 0;
  _$jscoverage['/control.js'].lineData[309] = 0;
  _$jscoverage['/control.js'].lineData[311] = 0;
  _$jscoverage['/control.js'].lineData[312] = 0;
  _$jscoverage['/control.js'].lineData[317] = 0;
  _$jscoverage['/control.js'].lineData[318] = 0;
  _$jscoverage['/control.js'].lineData[330] = 0;
  _$jscoverage['/control.js'].lineData[331] = 0;
  _$jscoverage['/control.js'].lineData[340] = 0;
  _$jscoverage['/control.js'].lineData[341] = 0;
  _$jscoverage['/control.js'].lineData[345] = 0;
  _$jscoverage['/control.js'].lineData[346] = 0;
  _$jscoverage['/control.js'].lineData[355] = 0;
  _$jscoverage['/control.js'].lineData[356] = 0;
  _$jscoverage['/control.js'].lineData[360] = 0;
  _$jscoverage['/control.js'].lineData[361] = 0;
  _$jscoverage['/control.js'].lineData[362] = 0;
  _$jscoverage['/control.js'].lineData[363] = 0;
  _$jscoverage['/control.js'].lineData[365] = 0;
  _$jscoverage['/control.js'].lineData[374] = 0;
  _$jscoverage['/control.js'].lineData[375] = 0;
  _$jscoverage['/control.js'].lineData[377] = 0;
  _$jscoverage['/control.js'].lineData[381] = 0;
  _$jscoverage['/control.js'].lineData[382] = 0;
  _$jscoverage['/control.js'].lineData[392] = 0;
  _$jscoverage['/control.js'].lineData[393] = 0;
  _$jscoverage['/control.js'].lineData[394] = 0;
  _$jscoverage['/control.js'].lineData[405] = 0;
  _$jscoverage['/control.js'].lineData[469] = 0;
  _$jscoverage['/control.js'].lineData[470] = 0;
  _$jscoverage['/control.js'].lineData[472] = 0;
  _$jscoverage['/control.js'].lineData[522] = 0;
  _$jscoverage['/control.js'].lineData[523] = 0;
  _$jscoverage['/control.js'].lineData[568] = 0;
  _$jscoverage['/control.js'].lineData[570] = 0;
  _$jscoverage['/control.js'].lineData[571] = 0;
  _$jscoverage['/control.js'].lineData[572] = 0;
  _$jscoverage['/control.js'].lineData[574] = 0;
  _$jscoverage['/control.js'].lineData[575] = 0;
  _$jscoverage['/control.js'].lineData[578] = 0;
  _$jscoverage['/control.js'].lineData[581] = 0;
  _$jscoverage['/control.js'].lineData[648] = 0;
  _$jscoverage['/control.js'].lineData[797] = 0;
  _$jscoverage['/control.js'].lineData[798] = 0;
  _$jscoverage['/control.js'].lineData[800] = 0;
  _$jscoverage['/control.js'].lineData[801] = 0;
  _$jscoverage['/control.js'].lineData[837] = 0;
  _$jscoverage['/control.js'].lineData[843] = 0;
  _$jscoverage['/control.js'].lineData[844] = 0;
  _$jscoverage['/control.js'].lineData[846] = 0;
  _$jscoverage['/control.js'].lineData[847] = 0;
  _$jscoverage['/control.js'].lineData[848] = 0;
  _$jscoverage['/control.js'].lineData[850] = 0;
  _$jscoverage['/control.js'].lineData[853] = 0;
  _$jscoverage['/control.js'].lineData[874] = 0;
  _$jscoverage['/control.js'].lineData[876] = 0;
  _$jscoverage['/control.js'].lineData[883] = 0;
  _$jscoverage['/control.js'].lineData[884] = 0;
  _$jscoverage['/control.js'].lineData[887] = 0;
  _$jscoverage['/control.js'].lineData[889] = 0;
  _$jscoverage['/control.js'].lineData[890] = 0;
  _$jscoverage['/control.js'].lineData[893] = 0;
  _$jscoverage['/control.js'].lineData[894] = 0;
  _$jscoverage['/control.js'].lineData[896] = 0;
  _$jscoverage['/control.js'].lineData[899] = 0;
}
if (! _$jscoverage['/control.js'].functionData) {
  _$jscoverage['/control.js'].functionData = [];
  _$jscoverage['/control.js'].functionData[0] = 0;
  _$jscoverage['/control.js'].functionData[1] = 0;
  _$jscoverage['/control.js'].functionData[2] = 0;
  _$jscoverage['/control.js'].functionData[3] = 0;
  _$jscoverage['/control.js'].functionData[4] = 0;
  _$jscoverage['/control.js'].functionData[5] = 0;
  _$jscoverage['/control.js'].functionData[6] = 0;
  _$jscoverage['/control.js'].functionData[7] = 0;
  _$jscoverage['/control.js'].functionData[8] = 0;
  _$jscoverage['/control.js'].functionData[9] = 0;
  _$jscoverage['/control.js'].functionData[10] = 0;
  _$jscoverage['/control.js'].functionData[11] = 0;
  _$jscoverage['/control.js'].functionData[12] = 0;
  _$jscoverage['/control.js'].functionData[13] = 0;
  _$jscoverage['/control.js'].functionData[14] = 0;
  _$jscoverage['/control.js'].functionData[15] = 0;
  _$jscoverage['/control.js'].functionData[16] = 0;
  _$jscoverage['/control.js'].functionData[17] = 0;
  _$jscoverage['/control.js'].functionData[18] = 0;
  _$jscoverage['/control.js'].functionData[19] = 0;
  _$jscoverage['/control.js'].functionData[20] = 0;
  _$jscoverage['/control.js'].functionData[21] = 0;
  _$jscoverage['/control.js'].functionData[22] = 0;
  _$jscoverage['/control.js'].functionData[23] = 0;
  _$jscoverage['/control.js'].functionData[24] = 0;
  _$jscoverage['/control.js'].functionData[25] = 0;
  _$jscoverage['/control.js'].functionData[26] = 0;
  _$jscoverage['/control.js'].functionData[27] = 0;
  _$jscoverage['/control.js'].functionData[28] = 0;
  _$jscoverage['/control.js'].functionData[29] = 0;
  _$jscoverage['/control.js'].functionData[30] = 0;
  _$jscoverage['/control.js'].functionData[31] = 0;
  _$jscoverage['/control.js'].functionData[32] = 0;
  _$jscoverage['/control.js'].functionData[33] = 0;
  _$jscoverage['/control.js'].functionData[34] = 0;
  _$jscoverage['/control.js'].functionData[35] = 0;
  _$jscoverage['/control.js'].functionData[36] = 0;
  _$jscoverage['/control.js'].functionData[37] = 0;
  _$jscoverage['/control.js'].functionData[38] = 0;
  _$jscoverage['/control.js'].functionData[39] = 0;
  _$jscoverage['/control.js'].functionData[40] = 0;
  _$jscoverage['/control.js'].functionData[41] = 0;
  _$jscoverage['/control.js'].functionData[42] = 0;
  _$jscoverage['/control.js'].functionData[43] = 0;
  _$jscoverage['/control.js'].functionData[44] = 0;
  _$jscoverage['/control.js'].functionData[45] = 0;
}
if (! _$jscoverage['/control.js'].branchData) {
  _$jscoverage['/control.js'].branchData = {};
  _$jscoverage['/control.js'].branchData['48'] = [];
  _$jscoverage['/control.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['57'] = [];
  _$jscoverage['/control.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['79'] = [];
  _$jscoverage['/control.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['87'] = [];
  _$jscoverage['/control.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['99'] = [];
  _$jscoverage['/control.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['105'] = [];
  _$jscoverage['/control.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['122'] = [];
  _$jscoverage['/control.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['124'] = [];
  _$jscoverage['/control.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['130'] = [];
  _$jscoverage['/control.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['135'] = [];
  _$jscoverage['/control.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['145'] = [];
  _$jscoverage['/control.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['190'] = [];
  _$jscoverage['/control.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['196'] = [];
  _$jscoverage['/control.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['209'] = [];
  _$jscoverage['/control.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['226'] = [];
  _$jscoverage['/control.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['241'] = [];
  _$jscoverage['/control.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['258'] = [];
  _$jscoverage['/control.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['274'] = [];
  _$jscoverage['/control.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['275'] = [];
  _$jscoverage['/control.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['276'] = [];
  _$jscoverage['/control.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['279'] = [];
  _$jscoverage['/control.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['282'] = [];
  _$jscoverage['/control.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['286'] = [];
  _$jscoverage['/control.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['288'] = [];
  _$jscoverage['/control.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['288'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['288'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['288'][4] = new BranchData();
  _$jscoverage['/control.js'].branchData['288'][5] = new BranchData();
  _$jscoverage['/control.js'].branchData['296'] = [];
  _$jscoverage['/control.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['311'] = [];
  _$jscoverage['/control.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['311'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['311'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['317'] = [];
  _$jscoverage['/control.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['330'] = [];
  _$jscoverage['/control.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['345'] = [];
  _$jscoverage['/control.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['361'] = [];
  _$jscoverage['/control.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['374'] = [];
  _$jscoverage['/control.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['381'] = [];
  _$jscoverage['/control.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['393'] = [];
  _$jscoverage['/control.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['469'] = [];
  _$jscoverage['/control.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['472'] = [];
  _$jscoverage['/control.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['570'] = [];
  _$jscoverage['/control.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['571'] = [];
  _$jscoverage['/control.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['574'] = [];
  _$jscoverage['/control.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['769'] = [];
  _$jscoverage['/control.js'].branchData['769'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['800'] = [];
  _$jscoverage['/control.js'].branchData['800'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['849'] = [];
  _$jscoverage['/control.js'].branchData['849'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['889'] = [];
  _$jscoverage['/control.js'].branchData['889'][1] = new BranchData();
}
_$jscoverage['/control.js'].branchData['889'][1].init(382, 6, 'xclass');
function visit102_889_1(result) {
  _$jscoverage['/control.js'].branchData['889'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['849'][1].init(110, 24, '!attrs || !attrs.xrender');
function visit101_849_1(result) {
  _$jscoverage['/control.js'].branchData['849'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['800'][1].init(167, 1, 'p');
function visit100_800_1(result) {
  _$jscoverage['/control.js'].branchData['800'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['769'][1].init(57, 40, 'S.config(\'component/prefixCls\') || \'ks-\'');
function visit99_769_1(result) {
  _$jscoverage['/control.js'].branchData['769'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['574'][1].init(172, 19, 'xy[1] !== undefined');
function visit98_574_1(result) {
  _$jscoverage['/control.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['571'][1].init(33, 19, 'xy[0] !== undefined');
function visit97_571_1(result) {
  _$jscoverage['/control.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['570'][1].init(119, 9, 'xy.length');
function visit96_570_1(result) {
  _$jscoverage['/control.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['472'][1].init(159, 7, 'v || []');
function visit95_472_1(result) {
  _$jscoverage['/control.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['469'][1].init(29, 21, 'typeof v === \'string\'');
function visit94_469_1(result) {
  _$jscoverage['/control.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['393'][1].init(99, 21, 'self.get(\'focusable\')');
function visit93_393_1(result) {
  _$jscoverage['/control.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['381'][1].init(21, 21, '!this.get(\'disabled\')');
function visit92_381_1(result) {
  _$jscoverage['/control.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['374'][1].init(21, 33, 'ev.keyCode === Node.KeyCode.ENTER');
function visit91_374_1(result) {
  _$jscoverage['/control.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['361'][1].init(54, 55, '!this.get(\'disabled\') && self.handleKeyDownInternal(ev)');
function visit90_361_1(result) {
  _$jscoverage['/control.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['345'][1].init(21, 21, '!this.get(\'disabled\')');
function visit89_345_1(result) {
  _$jscoverage['/control.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['330'][1].init(21, 21, '!this.get(\'disabled\')');
function visit88_330_1(result) {
  _$jscoverage['/control.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['317'][1].init(21, 21, '!this.get(\'disabled\')');
function visit87_317_1(result) {
  _$jscoverage['/control.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['311'][3].init(99, 14, 'ev.which === 1');
function visit86_311_3(result) {
  _$jscoverage['/control.js'].branchData['311'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['311'][2].init(99, 41, 'ev.which === 1 || isTouchGestureSupported');
function visit85_311_2(result) {
  _$jscoverage['/control.js'].branchData['311'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['311'][1].init(76, 65, 'self.get(\'active\') && (ev.which === 1 || isTouchGestureSupported)');
function visit84_311_1(result) {
  _$jscoverage['/control.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['296'][1].init(21, 21, '!this.get(\'disabled\')');
function visit83_296_1(result) {
  _$jscoverage['/control.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['288'][5].init(354, 14, 'n !== \'button\'');
function visit82_288_5(result) {
  _$jscoverage['/control.js'].branchData['288'][5].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['288'][4].init(334, 16, 'n !== \'textarea\'');
function visit81_288_4(result) {
  _$jscoverage['/control.js'].branchData['288'][4].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['288'][3].init(334, 34, 'n !== \'textarea\' && n !== \'button\'');
function visit80_288_3(result) {
  _$jscoverage['/control.js'].branchData['288'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['288'][2].init(317, 13, 'n !== \'input\'');
function visit79_288_2(result) {
  _$jscoverage['/control.js'].branchData['288'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['288'][1].init(317, 51, 'n !== \'input\' && n !== \'textarea\' && n !== \'button\'');
function visit78_288_1(result) {
  _$jscoverage['/control.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['286'][1].init(188, 20, 'n && n.toLowerCase()');
function visit77_286_1(result) {
  _$jscoverage['/control.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['282'][1].init(256, 31, '!self.get(\'allowTextSelection\')');
function visit76_282_1(result) {
  _$jscoverage['/control.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['279'][1].init(147, 21, 'self.get(\'focusable\')');
function visit75_279_1(result) {
  _$jscoverage['/control.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['276'][1].init(25, 22, 'self.get(\'activeable\')');
function visit74_276_1(result) {
  _$jscoverage['/control.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['275'][1].init(135, 46, 'isMouseActionButton || isTouchGestureSupported');
function visit73_275_1(result) {
  _$jscoverage['/control.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['274'][1].init(81, 14, 'ev.which === 1');
function visit72_274_1(result) {
  _$jscoverage['/control.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['258'][1].init(21, 21, '!this.get(\'disabled\')');
function visit71_258_1(result) {
  _$jscoverage['/control.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['241'][1].init(21, 21, '!this.get(\'disabled\')');
function visit70_241_1(result) {
  _$jscoverage['/control.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['226'][1].init(21, 21, '!this.get(\'disabled\')');
function visit69_226_1(result) {
  _$jscoverage['/control.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['209'][1].init(21, 21, '!this.get(\'disabled\')');
function visit68_209_1(result) {
  _$jscoverage['/control.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['196'][1].init(21, 21, 'this.get(\'focusable\')');
function visit67_196_1(result) {
  _$jscoverage['/control.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['190'][1].init(21, 21, 'this.get(\'focusable\')');
function visit66_190_1(result) {
  _$jscoverage['/control.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['145'][1].init(183, 45, 'target.ownerDocument.activeElement === target');
function visit65_145_1(result) {
  _$jscoverage['/control.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['135'][1].init(84, 1, 'v');
function visit64_135_1(result) {
  _$jscoverage['/control.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['130'][1].init(53, 14, 'parent || this');
function visit63_130_1(result) {
  _$jscoverage['/control.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['124'][1].init(241, 19, 'self.get(\'srcNode\')');
function visit62_124_1(result) {
  _$jscoverage['/control.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['122'][1].init(159, 9, 'self.view');
function visit61_122_1(result) {
  _$jscoverage['/control.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['105'][1].init(871, 6, 'ie < 9');
function visit60_105_1(result) {
  _$jscoverage['/control.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['99'][1].init(605, 14, 'Gesture.cancel');
function visit59_99_1(result) {
  _$jscoverage['/control.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['87'][1].init(480, 31, 'self.get(\'handleGestureEvents\')');
function visit58_87_1(result) {
  _$jscoverage['/control.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['79'][1].init(111, 21, 'self.get(\'focusable\')');
function visit57_79_1(result) {
  _$jscoverage['/control.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['57'][1].init(623, 31, '!self.get(\'allowTextSelection\')');
function visit56_57_1(result) {
  _$jscoverage['/control.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['48'][1].init(295, 4, 'view');
function visit55_48_1(result) {
  _$jscoverage['/control.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/control.js'].functionData[0]++;
  _$jscoverage['/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/control.js'].lineData[8]++;
  var ControlProcess = require('./control/process');
  _$jscoverage['/control.js'].lineData[9]++;
  var Manager = require('component/manager');
  _$jscoverage['/control.js'].lineData[10]++;
  var Render = require('./control/render');
  _$jscoverage['/control.js'].lineData[11]++;
  var ie = S.UA.ieMode, Feature = S.Feature, Gesture = Node.Gesture, isTouchGestureSupported = Feature.isTouchGestureSupported();
  _$jscoverage['/control.js'].lineData[21]++;
  var Control = ControlProcess.extend({
  isControl: true, 
  createDom: function() {
  _$jscoverage['/control.js'].functionData[1]++;
  _$jscoverage['/control.js'].lineData[41]++;
  var self = this, Render = self.get('xrender'), view = self.get('view'), id = self.get('id'), el;
  _$jscoverage['/control.js'].lineData[48]++;
  if (visit55_48_1(view)) {
    _$jscoverage['/control.js'].lineData[49]++;
    view.set('control', self);
  } else {
    _$jscoverage['/control.js'].lineData[51]++;
    self.set('view', this.view = view = new Render({
  control: self}));
  }
  _$jscoverage['/control.js'].lineData[55]++;
  view.create();
  _$jscoverage['/control.js'].lineData[56]++;
  el = view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[57]++;
  if (visit56_57_1(!self.get('allowTextSelection'))) {
    _$jscoverage['/control.js'].lineData[58]++;
    el.unselectable();
  }
  _$jscoverage['/control.js'].lineData[61]++;
  Manager.addComponent(id, self);
}, 
  renderUI: function() {
  _$jscoverage['/control.js'].functionData[2]++;
  _$jscoverage['/control.js'].lineData[70]++;
  this.view.renderUI();
  _$jscoverage['/control.js'].lineData[72]++;
  this.view.bindUI();
}, 
  bindUI: function() {
  _$jscoverage['/control.js'].functionData[3]++;
  _$jscoverage['/control.js'].lineData[76]++;
  var self = this, el = self.view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[79]++;
  if (visit57_79_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[84]++;
    el.on('focus', self.handleFocus, self).on('blur', self.handleBlur, self).on('keydown', self.handleKeydown, self);
  }
  _$jscoverage['/control.js'].lineData[87]++;
  if (visit58_87_1(self.get('handleGestureEvents'))) {
    _$jscoverage['/control.js'].lineData[88]++;
    el = self.$el;
    _$jscoverage['/control.js'].lineData[93]++;
    el.on('mouseenter', self.handleMouseEnter, self).on('mouseleave', self.handleMouseLeave, self).on('contextmenu', self.handleContextMenu, self);
    _$jscoverage['/control.js'].lineData[98]++;
    el.on(Gesture.start, self.handleMouseDown, self).on(Gesture.end, self.handleMouseUp, self).on(Gesture.tap, self.handleClick, self);
    _$jscoverage['/control.js'].lineData[99]++;
    if (visit59_99_1(Gesture.cancel)) {
      _$jscoverage['/control.js'].lineData[100]++;
      el.on(Gesture.cancel, self.handleMouseUp, self);
    }
    _$jscoverage['/control.js'].lineData[105]++;
    if (visit60_105_1(ie < 9)) {
      _$jscoverage['/control.js'].lineData[106]++;
      el.on('dblclick', self.handleDblClick, self);
    }
  }
}, 
  syncUI: function() {
  _$jscoverage['/control.js'].functionData[4]++;
  _$jscoverage['/control.js'].lineData[112]++;
  this.view.syncUI();
}, 
  destructor: function() {
  _$jscoverage['/control.js'].functionData[5]++;
  _$jscoverage['/control.js'].lineData[119]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[121]++;
  Manager.removeComponent(self.get('id'));
  _$jscoverage['/control.js'].lineData[122]++;
  if (visit61_122_1(self.view)) {
    _$jscoverage['/control.js'].lineData[123]++;
    self.view.destroy();
  } else {
    _$jscoverage['/control.js'].lineData[124]++;
    if (visit62_124_1(self.get('srcNode'))) {
      _$jscoverage['/control.js'].lineData[125]++;
      self.get('srcNode').remove();
    }
  }
}, 
  createComponent: function(cfg, parent) {
  _$jscoverage['/control.js'].functionData[6]++;
  _$jscoverage['/control.js'].lineData[130]++;
  return Manager.createComponent(cfg, visit63_130_1(parent || this));
}, 
  '_onSetFocused': function(v) {
  _$jscoverage['/control.js'].functionData[7]++;
  _$jscoverage['/control.js'].lineData[134]++;
  var target = this.view.getKeyEventTarget()[0];
  _$jscoverage['/control.js'].lineData[135]++;
  if (visit64_135_1(v)) {
    _$jscoverage['/control.js'].lineData[136]++;
    try {
      _$jscoverage['/control.js'].lineData[137]++;
      target.focus();
    }    catch (e) {
  _$jscoverage['/control.js'].lineData[139]++;
  S.log(target);
  _$jscoverage['/control.js'].lineData[140]++;
  S.log('focus error', 'warn');
}
  } else {
    _$jscoverage['/control.js'].lineData[145]++;
    if (visit65_145_1(target.ownerDocument.activeElement === target)) {
      _$jscoverage['/control.js'].lineData[146]++;
      target.ownerDocument.body.focus();
    }
  }
}, 
  '_onSetX': function(x) {
  _$jscoverage['/control.js'].functionData[8]++;
  _$jscoverage['/control.js'].lineData[152]++;
  this.$el.offset({
  left: x});
}, 
  '_onSetY': function(y) {
  _$jscoverage['/control.js'].functionData[9]++;
  _$jscoverage['/control.js'].lineData[158]++;
  this.$el.offset({
  top: y});
}, 
  _onSetVisible: function(v) {
  _$jscoverage['/control.js'].functionData[10]++;
  _$jscoverage['/control.js'].lineData[165]++;
  this.fire(v ? 'show' : 'hide');
}, 
  show: function() {
  _$jscoverage['/control.js'].functionData[11]++;
  _$jscoverage['/control.js'].lineData[173]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[174]++;
  self.render();
  _$jscoverage['/control.js'].lineData[175]++;
  self.set('visible', true);
  _$jscoverage['/control.js'].lineData[176]++;
  return self;
}, 
  hide: function() {
  _$jscoverage['/control.js'].functionData[12]++;
  _$jscoverage['/control.js'].lineData[184]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[185]++;
  self.set('visible', false);
  _$jscoverage['/control.js'].lineData[186]++;
  return self;
}, 
  focus: function() {
  _$jscoverage['/control.js'].functionData[13]++;
  _$jscoverage['/control.js'].lineData[190]++;
  if (visit66_190_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[191]++;
    this.set('focused', true);
  }
}, 
  blur: function() {
  _$jscoverage['/control.js'].functionData[14]++;
  _$jscoverage['/control.js'].lineData[196]++;
  if (visit67_196_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[197]++;
    this.set('focused', false);
  }
}, 
  move: function(x, y) {
  _$jscoverage['/control.js'].functionData[15]++;
  _$jscoverage['/control.js'].lineData[202]++;
  this.set({
  x: x, 
  y: y});
}, 
  handleDblClick: function(ev) {
  _$jscoverage['/control.js'].functionData[16]++;
  _$jscoverage['/control.js'].lineData[209]++;
  if (visit68_209_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[210]++;
    this.handleDblClickInternal(ev);
  }
}, 
  handleDblClickInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[17]++;
  _$jscoverage['/control.js'].lineData[222]++;
  this.handleClickInternal(ev);
}, 
  handleMouseEnter: function(ev) {
  _$jscoverage['/control.js'].functionData[18]++;
  _$jscoverage['/control.js'].lineData[226]++;
  if (visit69_226_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[227]++;
    this.handleMouseEnterInternal(ev);
  }
}, 
  handleMouseEnterInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[19]++;
  _$jscoverage['/control.js'].lineData[237]++;
  this.set('highlighted', !!ev);
}, 
  handleMouseLeave: function(ev) {
  _$jscoverage['/control.js'].functionData[20]++;
  _$jscoverage['/control.js'].lineData[241]++;
  if (visit70_241_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[242]++;
    this.handleMouseLeaveInternal(ev);
  }
}, 
  handleMouseLeaveInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[21]++;
  _$jscoverage['/control.js'].lineData[252]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[253]++;
  self.set('active', false);
  _$jscoverage['/control.js'].lineData[254]++;
  self.set('highlighted', !ev);
}, 
  handleMouseDown: function(ev) {
  _$jscoverage['/control.js'].functionData[22]++;
  _$jscoverage['/control.js'].lineData[258]++;
  if (visit71_258_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[259]++;
    this.handleMouseDownInternal(ev);
  }
}, 
  handleMouseDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[23]++;
  _$jscoverage['/control.js'].lineData[272]++;
  var self = this, n, isMouseActionButton = visit72_274_1(ev.which === 1);
  _$jscoverage['/control.js'].lineData[275]++;
  if (visit73_275_1(isMouseActionButton || isTouchGestureSupported)) {
    _$jscoverage['/control.js'].lineData[276]++;
    if (visit74_276_1(self.get('activeable'))) {
      _$jscoverage['/control.js'].lineData[277]++;
      self.set('active', true);
    }
    _$jscoverage['/control.js'].lineData[279]++;
    if (visit75_279_1(self.get('focusable'))) {
      _$jscoverage['/control.js'].lineData[280]++;
      self.focus();
    }
    _$jscoverage['/control.js'].lineData[282]++;
    if (visit76_282_1(!self.get('allowTextSelection'))) {
      _$jscoverage['/control.js'].lineData[285]++;
      n = ev.target.nodeName;
      _$jscoverage['/control.js'].lineData[286]++;
      n = visit77_286_1(n && n.toLowerCase());
      _$jscoverage['/control.js'].lineData[288]++;
      if (visit78_288_1(visit79_288_2(n !== 'input') && visit80_288_3(visit81_288_4(n !== 'textarea') && visit82_288_5(n !== 'button')))) {
        _$jscoverage['/control.js'].lineData[289]++;
        ev.preventDefault();
      }
    }
  }
}, 
  handleMouseUp: function(ev) {
  _$jscoverage['/control.js'].functionData[24]++;
  _$jscoverage['/control.js'].lineData[296]++;
  if (visit83_296_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[297]++;
    this.handleMouseUpInternal(ev);
  }
}, 
  handleMouseUpInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[25]++;
  _$jscoverage['/control.js'].lineData[309]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[311]++;
  if (visit84_311_1(self.get('active') && (visit85_311_2(visit86_311_3(ev.which === 1) || isTouchGestureSupported)))) {
    _$jscoverage['/control.js'].lineData[312]++;
    self.set('active', false);
  }
}, 
  handleContextMenu: function(ev) {
  _$jscoverage['/control.js'].functionData[26]++;
  _$jscoverage['/control.js'].lineData[317]++;
  if (visit87_317_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[318]++;
    this.handleContextMenuInternal(ev);
  }
}, 
  handleContextMenuInternal: function() {
  _$jscoverage['/control.js'].functionData[27]++;
}, 
  handleFocus: function() {
  _$jscoverage['/control.js'].functionData[28]++;
  _$jscoverage['/control.js'].lineData[330]++;
  if (visit88_330_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[331]++;
    this.handleFocusInternal();
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/control.js'].functionData[29]++;
  _$jscoverage['/control.js'].lineData[340]++;
  this.focus();
  _$jscoverage['/control.js'].lineData[341]++;
  this.fire('focus');
}, 
  handleBlur: function() {
  _$jscoverage['/control.js'].functionData[30]++;
  _$jscoverage['/control.js'].lineData[345]++;
  if (visit89_345_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[346]++;
    this.handleBlurInternal();
  }
}, 
  handleBlurInternal: function() {
  _$jscoverage['/control.js'].functionData[31]++;
  _$jscoverage['/control.js'].lineData[355]++;
  this.blur();
  _$jscoverage['/control.js'].lineData[356]++;
  this.fire('blur');
}, 
  handleKeydown: function(ev) {
  _$jscoverage['/control.js'].functionData[32]++;
  _$jscoverage['/control.js'].lineData[360]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[361]++;
  if (visit90_361_1(!this.get('disabled') && self.handleKeyDownInternal(ev))) {
    _$jscoverage['/control.js'].lineData[362]++;
    ev.halt();
    _$jscoverage['/control.js'].lineData[363]++;
    return true;
  }
  _$jscoverage['/control.js'].lineData[365]++;
  return undefined;
}, 
  handleKeyDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[33]++;
  _$jscoverage['/control.js'].lineData[374]++;
  if (visit91_374_1(ev.keyCode === Node.KeyCode.ENTER)) {
    _$jscoverage['/control.js'].lineData[375]++;
    return this.handleClickInternal(ev);
  }
  _$jscoverage['/control.js'].lineData[377]++;
  return undefined;
}, 
  handleClick: function(ev) {
  _$jscoverage['/control.js'].functionData[34]++;
  _$jscoverage['/control.js'].lineData[381]++;
  if (visit92_381_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[382]++;
    this.handleClickInternal(ev);
  }
}, 
  handleClickInternal: function() {
  _$jscoverage['/control.js'].functionData[35]++;
  _$jscoverage['/control.js'].lineData[392]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[393]++;
  if (visit93_393_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[394]++;
    self.focus();
  }
}}, {
  name: 'control', 
  ATTRS: {
  id: {
  view: 1, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[36]++;
  _$jscoverage['/control.js'].lineData[405]++;
  return S.guid('ks-component');
}}, 
  content: {
  view: 1, 
  value: ''}, 
  width: {
  view: 1}, 
  height: {
  view: 1}, 
  elCls: {
  view: 1, 
  value: [], 
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[37]++;
  _$jscoverage['/control.js'].lineData[469]++;
  if (visit94_469_1(typeof v === 'string')) {
    _$jscoverage['/control.js'].lineData[470]++;
    v = v.split(/\s+/);
  }
  _$jscoverage['/control.js'].lineData[472]++;
  return visit95_472_1(v || []);
}}, 
  elStyle: {
  view: 1, 
  value: {}}, 
  elAttrs: {
  view: 1, 
  value: {}}, 
  elBefore: {}, 
  el: {
  setter: function(el) {
  _$jscoverage['/control.js'].functionData[38]++;
  _$jscoverage['/control.js'].lineData[522]++;
  this.$el = el;
  _$jscoverage['/control.js'].lineData[523]++;
  this.el = el[0];
}}, 
  x: {}, 
  y: {}, 
  xy: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[39]++;
  _$jscoverage['/control.js'].lineData[568]++;
  var self = this, xy = S.makeArray(v);
  _$jscoverage['/control.js'].lineData[570]++;
  if (visit96_570_1(xy.length)) {
    _$jscoverage['/control.js'].lineData[571]++;
    if (visit97_571_1(xy[0] !== undefined)) {
      _$jscoverage['/control.js'].lineData[572]++;
      self.set('x', xy[0]);
    }
    _$jscoverage['/control.js'].lineData[574]++;
    if (visit98_574_1(xy[1] !== undefined)) {
      _$jscoverage['/control.js'].lineData[575]++;
      self.set('y', xy[1]);
    }
  }
  _$jscoverage['/control.js'].lineData[578]++;
  return v;
}, 
  getter: function() {
  _$jscoverage['/control.js'].functionData[40]++;
  _$jscoverage['/control.js'].lineData[581]++;
  return [this.get('x'), this.get('y')];
}}, 
  zIndex: {
  view: 1}, 
  render: {}, 
  visible: {
  sync: 0, 
  value: true, 
  view: 1}, 
  srcNode: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[41]++;
  _$jscoverage['/control.js'].lineData[648]++;
  return Node.all(v);
}}, 
  handleGestureEvents: {
  value: true}, 
  focusable: {
  value: true, 
  view: 1}, 
  allowTextSelection: {
  value: false}, 
  activeable: {
  value: true}, 
  focused: {
  view: 1}, 
  active: {
  view: 1, 
  value: false}, 
  highlighted: {
  view: 1, 
  value: false}, 
  prefixCls: {
  view: 1, 
  value: visit99_769_1(S.config('component/prefixCls') || 'ks-')}, 
  prefixXClass: {}, 
  parent: {
  setter: function(p, prev) {
  _$jscoverage['/control.js'].functionData[42]++;
  _$jscoverage['/control.js'].lineData[797]++;
  if ((prev = this.get('parent'))) {
    _$jscoverage['/control.js'].lineData[798]++;
    this.removeTarget(prev);
  }
  _$jscoverage['/control.js'].lineData[800]++;
  if (visit100_800_1(p)) {
    _$jscoverage['/control.js'].lineData[801]++;
    this.addTarget(p);
  }
}}, 
  disabled: {
  view: 1, 
  value: false}, 
  xrender: {
  value: Render}, 
  view: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[43]++;
  _$jscoverage['/control.js'].lineData[837]++;
  this.view = v;
}}}});
  _$jscoverage['/control.js'].lineData[843]++;
  function getDefaultRender() {
    _$jscoverage['/control.js'].functionData[44]++;
    _$jscoverage['/control.js'].lineData[844]++;
    var attrs, constructor = this;
    _$jscoverage['/control.js'].lineData[846]++;
    do {
      _$jscoverage['/control.js'].lineData[847]++;
      attrs = constructor.ATTRS;
      _$jscoverage['/control.js'].lineData[848]++;
      constructor = constructor.superclass;
    } while (visit101_849_1(!attrs || !attrs.xrender));
    _$jscoverage['/control.js'].lineData[850]++;
    return attrs.xrender.value;
  }
  _$jscoverage['/control.js'].lineData[853]++;
  Control.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[874]++;
  Control.extend = function extend(extensions, px, sx) {
  _$jscoverage['/control.js'].functionData[45]++;
  _$jscoverage['/control.js'].lineData[876]++;
  var args = S.makeArray(arguments), baseClass = this, xclass, newClass, argsLen = args.length, last = args[argsLen - 1];
  _$jscoverage['/control.js'].lineData[883]++;
  if ((xclass = last.xclass)) {
    _$jscoverage['/control.js'].lineData[884]++;
    last.name = xclass;
  }
  _$jscoverage['/control.js'].lineData[887]++;
  newClass = ControlProcess.extend.apply(baseClass, args);
  _$jscoverage['/control.js'].lineData[889]++;
  if (visit102_889_1(xclass)) {
    _$jscoverage['/control.js'].lineData[890]++;
    Manager.setConstructorByXClass(xclass, newClass);
  }
  _$jscoverage['/control.js'].lineData[893]++;
  newClass.extend = extend;
  _$jscoverage['/control.js'].lineData[894]++;
  newClass.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[896]++;
  return newClass;
};
  _$jscoverage['/control.js'].lineData[899]++;
  return Control;
});
