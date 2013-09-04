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
  _$jscoverage['/touch/handle.js'].lineData[13] = 0;
  _$jscoverage['/touch/handle.js'].lineData[14] = 0;
  _$jscoverage['/touch/handle.js'].lineData[17] = 0;
  _$jscoverage['/touch/handle.js'].lineData[18] = 0;
  _$jscoverage['/touch/handle.js'].lineData[21] = 0;
  _$jscoverage['/touch/handle.js'].lineData[22] = 0;
  _$jscoverage['/touch/handle.js'].lineData[26] = 0;
  _$jscoverage['/touch/handle.js'].lineData[28] = 0;
  _$jscoverage['/touch/handle.js'].lineData[30] = 0;
  _$jscoverage['/touch/handle.js'].lineData[31] = 0;
  _$jscoverage['/touch/handle.js'].lineData[33] = 0;
  _$jscoverage['/touch/handle.js'].lineData[34] = 0;
  _$jscoverage['/touch/handle.js'].lineData[35] = 0;
  _$jscoverage['/touch/handle.js'].lineData[37] = 0;
  _$jscoverage['/touch/handle.js'].lineData[38] = 0;
  _$jscoverage['/touch/handle.js'].lineData[39] = 0;
  _$jscoverage['/touch/handle.js'].lineData[41] = 0;
  _$jscoverage['/touch/handle.js'].lineData[42] = 0;
  _$jscoverage['/touch/handle.js'].lineData[43] = 0;
  _$jscoverage['/touch/handle.js'].lineData[44] = 0;
  _$jscoverage['/touch/handle.js'].lineData[46] = 0;
  _$jscoverage['/touch/handle.js'].lineData[47] = 0;
  _$jscoverage['/touch/handle.js'].lineData[48] = 0;
  _$jscoverage['/touch/handle.js'].lineData[51] = 0;
  _$jscoverage['/touch/handle.js'].lineData[52] = 0;
  _$jscoverage['/touch/handle.js'].lineData[53] = 0;
  _$jscoverage['/touch/handle.js'].lineData[54] = 0;
  _$jscoverage['/touch/handle.js'].lineData[55] = 0;
  _$jscoverage['/touch/handle.js'].lineData[57] = 0;
  _$jscoverage['/touch/handle.js'].lineData[59] = 0;
  _$jscoverage['/touch/handle.js'].lineData[62] = 0;
  _$jscoverage['/touch/handle.js'].lineData[70] = 0;
  _$jscoverage['/touch/handle.js'].lineData[72] = 0;
  _$jscoverage['/touch/handle.js'].lineData[73] = 0;
  _$jscoverage['/touch/handle.js'].lineData[74] = 0;
  _$jscoverage['/touch/handle.js'].lineData[78] = 0;
  _$jscoverage['/touch/handle.js'].lineData[79] = 0;
  _$jscoverage['/touch/handle.js'].lineData[83] = 0;
  _$jscoverage['/touch/handle.js'].lineData[88] = 0;
  _$jscoverage['/touch/handle.js'].lineData[89] = 0;
  _$jscoverage['/touch/handle.js'].lineData[90] = 0;
  _$jscoverage['/touch/handle.js'].lineData[91] = 0;
  _$jscoverage['/touch/handle.js'].lineData[92] = 0;
  _$jscoverage['/touch/handle.js'].lineData[98] = 0;
  _$jscoverage['/touch/handle.js'].lineData[103] = 0;
  _$jscoverage['/touch/handle.js'].lineData[104] = 0;
  _$jscoverage['/touch/handle.js'].lineData[105] = 0;
  _$jscoverage['/touch/handle.js'].lineData[106] = 0;
  _$jscoverage['/touch/handle.js'].lineData[112] = 0;
  _$jscoverage['/touch/handle.js'].lineData[116] = 0;
  _$jscoverage['/touch/handle.js'].lineData[117] = 0;
  _$jscoverage['/touch/handle.js'].lineData[122] = 0;
  _$jscoverage['/touch/handle.js'].lineData[123] = 0;
  _$jscoverage['/touch/handle.js'].lineData[129] = 0;
  _$jscoverage['/touch/handle.js'].lineData[130] = 0;
  _$jscoverage['/touch/handle.js'].lineData[132] = 0;
  _$jscoverage['/touch/handle.js'].lineData[134] = 0;
  _$jscoverage['/touch/handle.js'].lineData[135] = 0;
  _$jscoverage['/touch/handle.js'].lineData[136] = 0;
  _$jscoverage['/touch/handle.js'].lineData[137] = 0;
  _$jscoverage['/touch/handle.js'].lineData[138] = 0;
  _$jscoverage['/touch/handle.js'].lineData[139] = 0;
  _$jscoverage['/touch/handle.js'].lineData[142] = 0;
  _$jscoverage['/touch/handle.js'].lineData[148] = 0;
  _$jscoverage['/touch/handle.js'].lineData[149] = 0;
  _$jscoverage['/touch/handle.js'].lineData[151] = 0;
  _$jscoverage['/touch/handle.js'].lineData[153] = 0;
  _$jscoverage['/touch/handle.js'].lineData[155] = 0;
  _$jscoverage['/touch/handle.js'].lineData[156] = 0;
  _$jscoverage['/touch/handle.js'].lineData[159] = 0;
  _$jscoverage['/touch/handle.js'].lineData[163] = 0;
  _$jscoverage['/touch/handle.js'].lineData[166] = 0;
  _$jscoverage['/touch/handle.js'].lineData[167] = 0;
  _$jscoverage['/touch/handle.js'].lineData[170] = 0;
  _$jscoverage['/touch/handle.js'].lineData[171] = 0;
  _$jscoverage['/touch/handle.js'].lineData[172] = 0;
  _$jscoverage['/touch/handle.js'].lineData[173] = 0;
  _$jscoverage['/touch/handle.js'].lineData[175] = 0;
  _$jscoverage['/touch/handle.js'].lineData[177] = 0;
  _$jscoverage['/touch/handle.js'].lineData[179] = 0;
  _$jscoverage['/touch/handle.js'].lineData[180] = 0;
  _$jscoverage['/touch/handle.js'].lineData[181] = 0;
  _$jscoverage['/touch/handle.js'].lineData[182] = 0;
  _$jscoverage['/touch/handle.js'].lineData[183] = 0;
  _$jscoverage['/touch/handle.js'].lineData[187] = 0;
  _$jscoverage['/touch/handle.js'].lineData[191] = 0;
  _$jscoverage['/touch/handle.js'].lineData[192] = 0;
  _$jscoverage['/touch/handle.js'].lineData[193] = 0;
  _$jscoverage['/touch/handle.js'].lineData[194] = 0;
  _$jscoverage['/touch/handle.js'].lineData[195] = 0;
  _$jscoverage['/touch/handle.js'].lineData[196] = 0;
  _$jscoverage['/touch/handle.js'].lineData[198] = 0;
  _$jscoverage['/touch/handle.js'].lineData[199] = 0;
  _$jscoverage['/touch/handle.js'].lineData[200] = 0;
  _$jscoverage['/touch/handle.js'].lineData[202] = 0;
  _$jscoverage['/touch/handle.js'].lineData[204] = 0;
  _$jscoverage['/touch/handle.js'].lineData[205] = 0;
  _$jscoverage['/touch/handle.js'].lineData[206] = 0;
  _$jscoverage['/touch/handle.js'].lineData[209] = 0;
  _$jscoverage['/touch/handle.js'].lineData[213] = 0;
  _$jscoverage['/touch/handle.js'].lineData[215] = 0;
  _$jscoverage['/touch/handle.js'].lineData[216] = 0;
  _$jscoverage['/touch/handle.js'].lineData[217] = 0;
  _$jscoverage['/touch/handle.js'].lineData[218] = 0;
  _$jscoverage['/touch/handle.js'].lineData[220] = 0;
  _$jscoverage['/touch/handle.js'].lineData[221] = 0;
  _$jscoverage['/touch/handle.js'].lineData[222] = 0;
  _$jscoverage['/touch/handle.js'].lineData[224] = 0;
  _$jscoverage['/touch/handle.js'].lineData[227] = 0;
  _$jscoverage['/touch/handle.js'].lineData[231] = 0;
  _$jscoverage['/touch/handle.js'].lineData[233] = 0;
  _$jscoverage['/touch/handle.js'].lineData[234] = 0;
  _$jscoverage['/touch/handle.js'].lineData[235] = 0;
  _$jscoverage['/touch/handle.js'].lineData[238] = 0;
  _$jscoverage['/touch/handle.js'].lineData[239] = 0;
  _$jscoverage['/touch/handle.js'].lineData[240] = 0;
  _$jscoverage['/touch/handle.js'].lineData[241] = 0;
  _$jscoverage['/touch/handle.js'].lineData[242] = 0;
  _$jscoverage['/touch/handle.js'].lineData[244] = 0;
  _$jscoverage['/touch/handle.js'].lineData[245] = 0;
  _$jscoverage['/touch/handle.js'].lineData[246] = 0;
  _$jscoverage['/touch/handle.js'].lineData[247] = 0;
  _$jscoverage['/touch/handle.js'].lineData[252] = 0;
  _$jscoverage['/touch/handle.js'].lineData[256] = 0;
  _$jscoverage['/touch/handle.js'].lineData[257] = 0;
  _$jscoverage['/touch/handle.js'].lineData[259] = 0;
  _$jscoverage['/touch/handle.js'].lineData[260] = 0;
  _$jscoverage['/touch/handle.js'].lineData[261] = 0;
  _$jscoverage['/touch/handle.js'].lineData[263] = 0;
  _$jscoverage['/touch/handle.js'].lineData[265] = 0;
  _$jscoverage['/touch/handle.js'].lineData[266] = 0;
  _$jscoverage['/touch/handle.js'].lineData[270] = 0;
  _$jscoverage['/touch/handle.js'].lineData[271] = 0;
  _$jscoverage['/touch/handle.js'].lineData[272] = 0;
  _$jscoverage['/touch/handle.js'].lineData[277] = 0;
  _$jscoverage['/touch/handle.js'].lineData[280] = 0;
  _$jscoverage['/touch/handle.js'].lineData[281] = 0;
  _$jscoverage['/touch/handle.js'].lineData[283] = 0;
  _$jscoverage['/touch/handle.js'].lineData[291] = 0;
  _$jscoverage['/touch/handle.js'].lineData[292] = 0;
  _$jscoverage['/touch/handle.js'].lineData[293] = 0;
  _$jscoverage['/touch/handle.js'].lineData[294] = 0;
  _$jscoverage['/touch/handle.js'].lineData[295] = 0;
  _$jscoverage['/touch/handle.js'].lineData[301] = 0;
  _$jscoverage['/touch/handle.js'].lineData[303] = 0;
  _$jscoverage['/touch/handle.js'].lineData[304] = 0;
  _$jscoverage['/touch/handle.js'].lineData[305] = 0;
  _$jscoverage['/touch/handle.js'].lineData[309] = 0;
  _$jscoverage['/touch/handle.js'].lineData[311] = 0;
  _$jscoverage['/touch/handle.js'].lineData[313] = 0;
  _$jscoverage['/touch/handle.js'].lineData[314] = 0;
  _$jscoverage['/touch/handle.js'].lineData[316] = 0;
  _$jscoverage['/touch/handle.js'].lineData[317] = 0;
  _$jscoverage['/touch/handle.js'].lineData[322] = 0;
  _$jscoverage['/touch/handle.js'].lineData[324] = 0;
  _$jscoverage['/touch/handle.js'].lineData[325] = 0;
  _$jscoverage['/touch/handle.js'].lineData[326] = 0;
  _$jscoverage['/touch/handle.js'].lineData[328] = 0;
  _$jscoverage['/touch/handle.js'].lineData[329] = 0;
  _$jscoverage['/touch/handle.js'].lineData[330] = 0;
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
  _$jscoverage['/touch/handle.js'].branchData['35'] = [];
  _$jscoverage['/touch/handle.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['41'] = [];
  _$jscoverage['/touch/handle.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['88'] = [];
  _$jscoverage['/touch/handle.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['90'] = [];
  _$jscoverage['/touch/handle.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['103'] = [];
  _$jscoverage['/touch/handle.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['105'] = [];
  _$jscoverage['/touch/handle.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['112'] = [];
  _$jscoverage['/touch/handle.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['116'] = [];
  _$jscoverage['/touch/handle.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['122'] = [];
  _$jscoverage['/touch/handle.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['132'] = [];
  _$jscoverage['/touch/handle.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['138'] = [];
  _$jscoverage['/touch/handle.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['151'] = [];
  _$jscoverage['/touch/handle.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['151'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['155'] = [];
  _$jscoverage['/touch/handle.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['155'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['155'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['166'] = [];
  _$jscoverage['/touch/handle.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['167'] = [];
  _$jscoverage['/touch/handle.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['167'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['167'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['170'] = [];
  _$jscoverage['/touch/handle.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['191'] = [];
  _$jscoverage['/touch/handle.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['194'] = [];
  _$jscoverage['/touch/handle.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['195'] = [];
  _$jscoverage['/touch/handle.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['199'] = [];
  _$jscoverage['/touch/handle.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['215'] = [];
  _$jscoverage['/touch/handle.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['216'] = [];
  _$jscoverage['/touch/handle.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['217'] = [];
  _$jscoverage['/touch/handle.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['221'] = [];
  _$jscoverage['/touch/handle.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['233'] = [];
  _$jscoverage['/touch/handle.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['234'] = [];
  _$jscoverage['/touch/handle.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['239'] = [];
  _$jscoverage['/touch/handle.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['244'] = [];
  _$jscoverage['/touch/handle.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['246'] = [];
  _$jscoverage['/touch/handle.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['260'] = [];
  _$jscoverage['/touch/handle.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['265'] = [];
  _$jscoverage['/touch/handle.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['265'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['265'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['280'] = [];
  _$jscoverage['/touch/handle.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['292'] = [];
  _$jscoverage['/touch/handle.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['294'] = [];
  _$jscoverage['/touch/handle.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['313'] = [];
  _$jscoverage['/touch/handle.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['316'] = [];
  _$jscoverage['/touch/handle.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['324'] = [];
  _$jscoverage['/touch/handle.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['325'] = [];
  _$jscoverage['/touch/handle.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['328'] = [];
  _$jscoverage['/touch/handle.js'].branchData['328'][1] = new BranchData();
}
_$jscoverage['/touch/handle.js'].branchData['328'][1].init(125, 35, 'S.isEmptyObject(handle.eventHandle)');
function visit52_328_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['325'][1].init(22, 5, 'event');
function visit51_325_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['324'][1].init(108, 6, 'handle');
function visit50_324_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['316'][1].init(223, 5, 'event');
function visit49_316_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['313'][1].init(108, 7, '!handle');
function visit48_313_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['294'][1].init(67, 25, '!eventHandle[event].count');
function visit47_294_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['292'][1].init(67, 18, 'eventHandle[event]');
function visit46_292_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['280'][1].init(153, 18, 'eventHandle[event]');
function visit45_280_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['265'][3].init(311, 26, 'h[method](event) === false');
function visit44_265_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['265'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['265'][2].init(298, 39, 'h[method] && h[method](event) === false');
function visit43_265_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['265'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['265'][1].init(284, 53, 'h.isActive && h[method] && h[method](event) === false');
function visit42_265_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['260'][1].init(128, 11, 'h.processed');
function visit41_260_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['246'][1].init(625, 22, 'isMSPointerEvent(type)');
function visit40_246_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['244'][1].init(542, 18, 'isMouseEvent(type)');
function visit39_244_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['239'][1].init(304, 18, 'isTouchEvent(type)');
function visit38_239_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['234'][1].init(22, 37, 'self.isEventSimulatedFromTouch(event)');
function visit37_234_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['233'][1].init(84, 18, 'isMouseEvent(type)');
function visit36_233_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['221'][1].init(342, 22, 'isMSPointerEvent(type)');
function visit35_221_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['217'][1].init(22, 36, 'self.isEventSimulatedFromTouch(type)');
function visit34_217_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['216'][1].init(131, 18, 'isMouseEvent(type)');
function visit33_216_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['215'][1].init(84, 18, 'isTouchEvent(type)');
function visit32_215_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['199'][1].init(517, 22, 'isMSPointerEvent(type)');
function visit31_199_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['195'][1].init(22, 37, 'self.isEventSimulatedFromTouch(event)');
function visit30_195_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['194'][1].init(305, 18, 'isMouseEvent(type)');
function visit29_194_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['191'][1].init(156, 18, 'isTouchEvent(type)');
function visit28_191_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['170'][1].init(171, 21, 'touchList.length == 1');
function visit27_170_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['167'][3].init(53, 21, 'type == \'touchcancel\'');
function visit26_167_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['167'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['167'][2].init(31, 18, 'type == \'touchend\'');
function visit25_167_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['167'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['167'][1].init(31, 43, 'type == \'touchend\' || type == \'touchcancel\'');
function visit24_167_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['166'][1].init(102, 18, 'isTouchEvent(type)');
function visit23_166_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['155'][3].init(215, 14, 'dy <= DUP_DIST');
function visit22_155_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['155'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['155'][2].init(197, 14, 'dx <= DUP_DIST');
function visit21_155_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['155'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['155'][1].init(197, 32, 'dx <= DUP_DIST && dy <= DUP_DIST');
function visit20_155_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['151'][2].init(166, 5, 'i < l');
function visit19_151_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['151'][1].init(166, 21, 'i < l && (t = lts[i])');
function visit18_151_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['138'][1].init(72, 6, 'i > -1');
function visit17_138_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['132'][1].init(169, 22, 'this.isPrimaryTouch(t)');
function visit16_132_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['122'][1].init(18, 28, 'this.isPrimaryTouch(inTouch)');
function visit15_122_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['116'][1].init(18, 24, 'this.firstTouch === null');
function visit14_116_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['112'][1].init(21, 38, 'this.firstTouch === inTouch.identifier');
function visit13_112_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['105'][1].init(59, 32, 'touch[\'pointerId\'] === pointerId');
function visit12_105_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['103'][1].init(204, 5, 'i < l');
function visit11_103_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['90'][1].init(59, 32, 'touch[\'pointerId\'] === pointerId');
function visit10_90_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['88'][1].init(204, 5, 'i < l');
function visit9_88_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['41'][1].init(1113, 31, 'Features.isMsPointerSupported()');
function visit8_41_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['35'][1].init(217, 8, 'S.UA.ios');
function visit7_35_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['30'][1].init(635, 32, 'Features.isTouchEventSupported()');
function visit6_30_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].lineData[6]++;
KISSY.add('event/dom/touch/handle', function(S, Dom, eventHandleMap, DomEvent) {
  _$jscoverage['/touch/handle.js'].functionData[0]++;
  _$jscoverage['/touch/handle.js'].lineData[7]++;
  var key = S.guid('touch-handle'), Features = S.Features, gestureStartEvent, gestureMoveEvent, gestureEndEvent;
  _$jscoverage['/touch/handle.js'].lineData[13]++;
  function isTouchEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[1]++;
    _$jscoverage['/touch/handle.js'].lineData[14]++;
    return S.startsWith(type, 'touch');
  }
  _$jscoverage['/touch/handle.js'].lineData[17]++;
  function isMouseEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[2]++;
    _$jscoverage['/touch/handle.js'].lineData[18]++;
    return S.startsWith(type, 'mouse');
  }
  _$jscoverage['/touch/handle.js'].lineData[21]++;
  function isMSPointerEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[3]++;
    _$jscoverage['/touch/handle.js'].lineData[22]++;
    return S.startsWith(type, 'MSPointer');
  }
  _$jscoverage['/touch/handle.js'].lineData[26]++;
  var DUP_TIMEOUT = 2500;
  _$jscoverage['/touch/handle.js'].lineData[28]++;
  var DUP_DIST = 25;
  _$jscoverage['/touch/handle.js'].lineData[30]++;
  if (visit6_30_1(Features.isTouchEventSupported())) {
    _$jscoverage['/touch/handle.js'].lineData[31]++;
    gestureEndEvent = 'touchend touchcancel mouseup';
    _$jscoverage['/touch/handle.js'].lineData[33]++;
    gestureStartEvent = 'touchstart mousedown';
    _$jscoverage['/touch/handle.js'].lineData[34]++;
    gestureMoveEvent = 'touchmove mousemove';
    _$jscoverage['/touch/handle.js'].lineData[35]++;
    if (visit7_35_1(S.UA.ios)) {
      _$jscoverage['/touch/handle.js'].lineData[37]++;
      gestureEndEvent = 'touchend touchcancel';
      _$jscoverage['/touch/handle.js'].lineData[38]++;
      gestureStartEvent = 'touchstart';
      _$jscoverage['/touch/handle.js'].lineData[39]++;
      gestureMoveEvent = 'touchmove';
    }
  } else {
    _$jscoverage['/touch/handle.js'].lineData[41]++;
    if (visit8_41_1(Features.isMsPointerSupported())) {
      _$jscoverage['/touch/handle.js'].lineData[42]++;
      gestureStartEvent = 'MSPointerDown';
      _$jscoverage['/touch/handle.js'].lineData[43]++;
      gestureMoveEvent = 'MSPointerMove';
      _$jscoverage['/touch/handle.js'].lineData[44]++;
      gestureEndEvent = 'MSPointerUp MSPointerCancel';
    } else {
      _$jscoverage['/touch/handle.js'].lineData[46]++;
      gestureStartEvent = 'mousedown';
      _$jscoverage['/touch/handle.js'].lineData[47]++;
      gestureMoveEvent = 'mousemove';
      _$jscoverage['/touch/handle.js'].lineData[48]++;
      gestureEndEvent = 'mouseup';
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[51]++;
  function DocumentHandler(doc) {
    _$jscoverage['/touch/handle.js'].functionData[4]++;
    _$jscoverage['/touch/handle.js'].lineData[52]++;
    var self = this;
    _$jscoverage['/touch/handle.js'].lineData[53]++;
    self.doc = doc;
    _$jscoverage['/touch/handle.js'].lineData[54]++;
    self.eventHandle = {};
    _$jscoverage['/touch/handle.js'].lineData[55]++;
    self.init();
    _$jscoverage['/touch/handle.js'].lineData[57]++;
    self.touches = [];
    _$jscoverage['/touch/handle.js'].lineData[59]++;
    self.inTouch = 0;
  }
  _$jscoverage['/touch/handle.js'].lineData[62]++;
  DocumentHandler.prototype = {
  constructor: DocumentHandler, 
  lastTouches: [], 
  firstTouch: null, 
  init: function() {
  _$jscoverage['/touch/handle.js'].functionData[5]++;
  _$jscoverage['/touch/handle.js'].lineData[70]++;
  var self = this, doc = self.doc;
  _$jscoverage['/touch/handle.js'].lineData[72]++;
  DomEvent.on(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/touch/handle.js'].lineData[73]++;
  DomEvent.on(doc, gestureMoveEvent, self.onTouchMove, self);
  _$jscoverage['/touch/handle.js'].lineData[74]++;
  DomEvent.on(doc, gestureEndEvent, self.onTouchEnd, self);
}, 
  addTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[6]++;
  _$jscoverage['/touch/handle.js'].lineData[78]++;
  originalEvent.identifier = originalEvent['pointerId'];
  _$jscoverage['/touch/handle.js'].lineData[79]++;
  this.touches.push(originalEvent);
}, 
  removeTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[7]++;
  _$jscoverage['/touch/handle.js'].lineData[83]++;
  var i = 0, touch, pointerId = originalEvent['pointerId'], touches = this.touches, l = touches.length;
  _$jscoverage['/touch/handle.js'].lineData[88]++;
  for (; visit9_88_1(i < l); i++) {
    _$jscoverage['/touch/handle.js'].lineData[89]++;
    touch = touches[i];
    _$jscoverage['/touch/handle.js'].lineData[90]++;
    if (visit10_90_1(touch['pointerId'] === pointerId)) {
      _$jscoverage['/touch/handle.js'].lineData[91]++;
      touches.splice(i, 1);
      _$jscoverage['/touch/handle.js'].lineData[92]++;
      break;
    }
  }
}, 
  updateTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[8]++;
  _$jscoverage['/touch/handle.js'].lineData[98]++;
  var i = 0, touch, pointerId = originalEvent['pointerId'], touches = this.touches, l = touches.length;
  _$jscoverage['/touch/handle.js'].lineData[103]++;
  for (; visit11_103_1(i < l); i++) {
    _$jscoverage['/touch/handle.js'].lineData[104]++;
    touch = touches[i];
    _$jscoverage['/touch/handle.js'].lineData[105]++;
    if (visit12_105_1(touch['pointerId'] === pointerId)) {
      _$jscoverage['/touch/handle.js'].lineData[106]++;
      touches[i] = originalEvent;
    }
  }
}, 
  isPrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[9]++;
  _$jscoverage['/touch/handle.js'].lineData[112]++;
  return visit13_112_1(this.firstTouch === inTouch.identifier);
}, 
  setPrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[10]++;
  _$jscoverage['/touch/handle.js'].lineData[116]++;
  if (visit14_116_1(this.firstTouch === null)) {
    _$jscoverage['/touch/handle.js'].lineData[117]++;
    this.firstTouch = inTouch.identifier;
  }
}, 
  removePrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[11]++;
  _$jscoverage['/touch/handle.js'].lineData[122]++;
  if (visit15_122_1(this.isPrimaryTouch(inTouch))) {
    _$jscoverage['/touch/handle.js'].lineData[123]++;
    this.firstTouch = null;
  }
}, 
  dupMouse: function(inEvent) {
  _$jscoverage['/touch/handle.js'].functionData[12]++;
  _$jscoverage['/touch/handle.js'].lineData[129]++;
  var lts = this.lastTouches;
  _$jscoverage['/touch/handle.js'].lineData[130]++;
  var t = inEvent.changedTouches[0];
  _$jscoverage['/touch/handle.js'].lineData[132]++;
  if (visit16_132_1(this.isPrimaryTouch(t))) {
    _$jscoverage['/touch/handle.js'].lineData[134]++;
    var lt = {
  x: t.clientX, 
  y: t.clientY};
    _$jscoverage['/touch/handle.js'].lineData[135]++;
    lts.push(lt);
    _$jscoverage['/touch/handle.js'].lineData[136]++;
    var fn = (function(lts, lt) {
  _$jscoverage['/touch/handle.js'].functionData[13]++;
  _$jscoverage['/touch/handle.js'].lineData[137]++;
  var i = lts.indexOf(lt);
  _$jscoverage['/touch/handle.js'].lineData[138]++;
  if (visit17_138_1(i > -1)) {
    _$jscoverage['/touch/handle.js'].lineData[139]++;
    lts.splice(i, 1);
  }
}).bind(null, lts, lt);
    _$jscoverage['/touch/handle.js'].lineData[142]++;
    setTimeout(fn, DUP_TIMEOUT);
  }
}, 
  isEventSimulatedFromTouch: function(inEvent) {
  _$jscoverage['/touch/handle.js'].functionData[14]++;
  _$jscoverage['/touch/handle.js'].lineData[148]++;
  var lts = this.lastTouches;
  _$jscoverage['/touch/handle.js'].lineData[149]++;
  var x = inEvent.clientX, y = inEvent.clientY;
  _$jscoverage['/touch/handle.js'].lineData[151]++;
  for (var i = 0, l = lts.length, t; visit18_151_1(visit19_151_2(i < l) && (t = lts[i])); i++) {
    _$jscoverage['/touch/handle.js'].lineData[153]++;
    var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
    _$jscoverage['/touch/handle.js'].lineData[155]++;
    if (visit20_155_1(visit21_155_2(dx <= DUP_DIST) && visit22_155_3(dy <= DUP_DIST))) {
      _$jscoverage['/touch/handle.js'].lineData[156]++;
      return true;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[159]++;
  return 0;
}, 
  normalize: function(e) {
  _$jscoverage['/touch/handle.js'].functionData[15]++;
  _$jscoverage['/touch/handle.js'].lineData[163]++;
  var type = e.type, notUp, touchList;
  _$jscoverage['/touch/handle.js'].lineData[166]++;
  if (visit23_166_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[167]++;
    touchList = (visit24_167_1(visit25_167_2(type == 'touchend') || visit26_167_3(type == 'touchcancel'))) ? e.changedTouches : e.touches;
    _$jscoverage['/touch/handle.js'].lineData[170]++;
    if (visit27_170_1(touchList.length == 1)) {
      _$jscoverage['/touch/handle.js'].lineData[171]++;
      e.which = 1;
      _$jscoverage['/touch/handle.js'].lineData[172]++;
      e.pageX = touchList[0].pageX;
      _$jscoverage['/touch/handle.js'].lineData[173]++;
      e.pageY = touchList[0].pageY;
    }
    _$jscoverage['/touch/handle.js'].lineData[175]++;
    return e;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[177]++;
    touchList = this.touches;
  }
  _$jscoverage['/touch/handle.js'].lineData[179]++;
  notUp = !type.match(/(up|cancel)$/i);
  _$jscoverage['/touch/handle.js'].lineData[180]++;
  e.touches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[181]++;
  e.targetTouches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[182]++;
  e.changedTouches = touchList;
  _$jscoverage['/touch/handle.js'].lineData[183]++;
  return e;
}, 
  onTouchStart: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[16]++;
  _$jscoverage['/touch/handle.js'].lineData[187]++;
  var e, h, self = this, type = event.type, eventHandle = self.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[191]++;
  if (visit28_191_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[192]++;
    self.setPrimaryTouch(event.changedTouches[0]);
    _$jscoverage['/touch/handle.js'].lineData[193]++;
    self.dupMouse(type);
  } else {
    _$jscoverage['/touch/handle.js'].lineData[194]++;
    if (visit29_194_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[195]++;
      if (visit30_195_1(self.isEventSimulatedFromTouch(event))) {
        _$jscoverage['/touch/handle.js'].lineData[196]++;
        return;
      }
      _$jscoverage['/touch/handle.js'].lineData[198]++;
      self.touches = [event.originalEvent];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[199]++;
      if (visit31_199_1(isMSPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[200]++;
        self.addTouch(event.originalEvent);
      } else {
        _$jscoverage['/touch/handle.js'].lineData[202]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[204]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[205]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[206]++;
    h.isActive = 1;
  }
  _$jscoverage['/touch/handle.js'].lineData[209]++;
  self.callEventHandle('onTouchStart', event);
}, 
  onTouchMove: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[17]++;
  _$jscoverage['/touch/handle.js'].lineData[213]++;
  var self = this, type = event.type;
  _$jscoverage['/touch/handle.js'].lineData[215]++;
  if (visit32_215_1(isTouchEvent(type))) {
  } else {
    _$jscoverage['/touch/handle.js'].lineData[216]++;
    if (visit33_216_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[217]++;
      if (visit34_217_1(self.isEventSimulatedFromTouch(type))) {
        _$jscoverage['/touch/handle.js'].lineData[218]++;
        return;
      }
      _$jscoverage['/touch/handle.js'].lineData[220]++;
      self.touches = [event.originalEvent];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[221]++;
      if (visit35_221_1(isMSPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[222]++;
        self.updateTouch(event.originalEvent);
      } else {
        _$jscoverage['/touch/handle.js'].lineData[224]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[227]++;
  self.callEventHandle('onTouchMove', event);
}, 
  onTouchEnd: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[18]++;
  _$jscoverage['/touch/handle.js'].lineData[231]++;
  var self = this, type = event.type;
  _$jscoverage['/touch/handle.js'].lineData[233]++;
  if (visit36_233_1(isMouseEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[234]++;
    if (visit37_234_1(self.isEventSimulatedFromTouch(event))) {
      _$jscoverage['/touch/handle.js'].lineData[235]++;
      return;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[238]++;
  self.callEventHandle('onTouchEnd', event);
  _$jscoverage['/touch/handle.js'].lineData[239]++;
  if (visit38_239_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[240]++;
    self.dupMouse(event);
    _$jscoverage['/touch/handle.js'].lineData[241]++;
    S.makeArray(event.changedTouches).forEach(function(touch) {
  _$jscoverage['/touch/handle.js'].functionData[19]++;
  _$jscoverage['/touch/handle.js'].lineData[242]++;
  self.removePrimaryTouch(touch);
});
  } else {
    _$jscoverage['/touch/handle.js'].lineData[244]++;
    if (visit39_244_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[245]++;
      self.touches = [];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[246]++;
      if (visit40_246_1(isMSPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[247]++;
        self.removeTouch(event.originalEvent);
      }
    }
  }
}, 
  callEventHandle: function(method, event) {
  _$jscoverage['/touch/handle.js'].functionData[20]++;
  _$jscoverage['/touch/handle.js'].lineData[252]++;
  var self = this, eventHandle = self.eventHandle, e, h;
  _$jscoverage['/touch/handle.js'].lineData[256]++;
  event = self.normalize(event);
  _$jscoverage['/touch/handle.js'].lineData[257]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[259]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[260]++;
    if (visit41_260_1(h.processed)) {
      _$jscoverage['/touch/handle.js'].lineData[261]++;
      continue;
    }
    _$jscoverage['/touch/handle.js'].lineData[263]++;
    h.processed = 1;
    _$jscoverage['/touch/handle.js'].lineData[265]++;
    if (visit42_265_1(h.isActive && visit43_265_2(h[method] && visit44_265_3(h[method](event) === false)))) {
      _$jscoverage['/touch/handle.js'].lineData[266]++;
      h.isActive = 0;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[270]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[271]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[272]++;
    h.processed = 0;
  }
}, 
  addEventHandle: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[21]++;
  _$jscoverage['/touch/handle.js'].lineData[277]++;
  var self = this, eventHandle = self.eventHandle, handle = eventHandleMap[event].handle;
  _$jscoverage['/touch/handle.js'].lineData[280]++;
  if (visit45_280_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[281]++;
    eventHandle[event].count++;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[283]++;
    eventHandle[event] = {
  count: 1, 
  handle: handle};
  }
}, 
  'removeEventHandle': function(event) {
  _$jscoverage['/touch/handle.js'].functionData[22]++;
  _$jscoverage['/touch/handle.js'].lineData[291]++;
  var eventHandle = this.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[292]++;
  if (visit46_292_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[293]++;
    eventHandle[event].count--;
    _$jscoverage['/touch/handle.js'].lineData[294]++;
    if (visit47_294_1(!eventHandle[event].count)) {
      _$jscoverage['/touch/handle.js'].lineData[295]++;
      delete eventHandle[event];
    }
  }
}, 
  destroy: function() {
  _$jscoverage['/touch/handle.js'].functionData[23]++;
  _$jscoverage['/touch/handle.js'].lineData[301]++;
  var self = this, doc = self.doc;
  _$jscoverage['/touch/handle.js'].lineData[303]++;
  DomEvent.detach(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/touch/handle.js'].lineData[304]++;
  DomEvent.detach(doc, gestureMoveEvent, self.onTouchMove, self);
  _$jscoverage['/touch/handle.js'].lineData[305]++;
  DomEvent.detach(doc, gestureEndEvent, self.onTouchEnd, self);
}};
  _$jscoverage['/touch/handle.js'].lineData[309]++;
  return {
  addDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[24]++;
  _$jscoverage['/touch/handle.js'].lineData[311]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[313]++;
  if (visit48_313_1(!handle)) {
    _$jscoverage['/touch/handle.js'].lineData[314]++;
    Dom.data(doc, key, handle = new DocumentHandler(doc));
  }
  _$jscoverage['/touch/handle.js'].lineData[316]++;
  if (visit49_316_1(event)) {
    _$jscoverage['/touch/handle.js'].lineData[317]++;
    handle.addEventHandle(event);
  }
}, 
  removeDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[25]++;
  _$jscoverage['/touch/handle.js'].lineData[322]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[324]++;
  if (visit50_324_1(handle)) {
    _$jscoverage['/touch/handle.js'].lineData[325]++;
    if (visit51_325_1(event)) {
      _$jscoverage['/touch/handle.js'].lineData[326]++;
      handle.removeEventHandle(event);
    }
    _$jscoverage['/touch/handle.js'].lineData[328]++;
    if (visit52_328_1(S.isEmptyObject(handle.eventHandle))) {
      _$jscoverage['/touch/handle.js'].lineData[329]++;
      handle.destroy();
      _$jscoverage['/touch/handle.js'].lineData[330]++;
      Dom.removeData(doc, key);
    }
  }
}};
}, {
  requires: ['dom', './handle-map', 'event/dom/base', './tap', './swipe', './double-tap', './pinch', './tap-hold', './rotate']});
