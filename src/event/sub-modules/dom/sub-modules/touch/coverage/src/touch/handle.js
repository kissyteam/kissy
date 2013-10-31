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
  _$jscoverage['/touch/handle.js'].lineData[76] = 0;
  _$jscoverage['/touch/handle.js'].lineData[80] = 0;
  _$jscoverage['/touch/handle.js'].lineData[81] = 0;
  _$jscoverage['/touch/handle.js'].lineData[85] = 0;
  _$jscoverage['/touch/handle.js'].lineData[90] = 0;
  _$jscoverage['/touch/handle.js'].lineData[91] = 0;
  _$jscoverage['/touch/handle.js'].lineData[92] = 0;
  _$jscoverage['/touch/handle.js'].lineData[93] = 0;
  _$jscoverage['/touch/handle.js'].lineData[94] = 0;
  _$jscoverage['/touch/handle.js'].lineData[100] = 0;
  _$jscoverage['/touch/handle.js'].lineData[105] = 0;
  _$jscoverage['/touch/handle.js'].lineData[106] = 0;
  _$jscoverage['/touch/handle.js'].lineData[107] = 0;
  _$jscoverage['/touch/handle.js'].lineData[108] = 0;
  _$jscoverage['/touch/handle.js'].lineData[114] = 0;
  _$jscoverage['/touch/handle.js'].lineData[118] = 0;
  _$jscoverage['/touch/handle.js'].lineData[119] = 0;
  _$jscoverage['/touch/handle.js'].lineData[124] = 0;
  _$jscoverage['/touch/handle.js'].lineData[125] = 0;
  _$jscoverage['/touch/handle.js'].lineData[131] = 0;
  _$jscoverage['/touch/handle.js'].lineData[132] = 0;
  _$jscoverage['/touch/handle.js'].lineData[134] = 0;
  _$jscoverage['/touch/handle.js'].lineData[136] = 0;
  _$jscoverage['/touch/handle.js'].lineData[137] = 0;
  _$jscoverage['/touch/handle.js'].lineData[138] = 0;
  _$jscoverage['/touch/handle.js'].lineData[139] = 0;
  _$jscoverage['/touch/handle.js'].lineData[140] = 0;
  _$jscoverage['/touch/handle.js'].lineData[141] = 0;
  _$jscoverage['/touch/handle.js'].lineData[149] = 0;
  _$jscoverage['/touch/handle.js'].lineData[150] = 0;
  _$jscoverage['/touch/handle.js'].lineData[152] = 0;
  _$jscoverage['/touch/handle.js'].lineData[154] = 0;
  _$jscoverage['/touch/handle.js'].lineData[156] = 0;
  _$jscoverage['/touch/handle.js'].lineData[157] = 0;
  _$jscoverage['/touch/handle.js'].lineData[160] = 0;
  _$jscoverage['/touch/handle.js'].lineData[164] = 0;
  _$jscoverage['/touch/handle.js'].lineData[167] = 0;
  _$jscoverage['/touch/handle.js'].lineData[168] = 0;
  _$jscoverage['/touch/handle.js'].lineData[171] = 0;
  _$jscoverage['/touch/handle.js'].lineData[172] = 0;
  _$jscoverage['/touch/handle.js'].lineData[173] = 0;
  _$jscoverage['/touch/handle.js'].lineData[174] = 0;
  _$jscoverage['/touch/handle.js'].lineData[176] = 0;
  _$jscoverage['/touch/handle.js'].lineData[178] = 0;
  _$jscoverage['/touch/handle.js'].lineData[180] = 0;
  _$jscoverage['/touch/handle.js'].lineData[181] = 0;
  _$jscoverage['/touch/handle.js'].lineData[182] = 0;
  _$jscoverage['/touch/handle.js'].lineData[183] = 0;
  _$jscoverage['/touch/handle.js'].lineData[184] = 0;
  _$jscoverage['/touch/handle.js'].lineData[188] = 0;
  _$jscoverage['/touch/handle.js'].lineData[192] = 0;
  _$jscoverage['/touch/handle.js'].lineData[193] = 0;
  _$jscoverage['/touch/handle.js'].lineData[194] = 0;
  _$jscoverage['/touch/handle.js'].lineData[195] = 0;
  _$jscoverage['/touch/handle.js'].lineData[196] = 0;
  _$jscoverage['/touch/handle.js'].lineData[197] = 0;
  _$jscoverage['/touch/handle.js'].lineData[199] = 0;
  _$jscoverage['/touch/handle.js'].lineData[200] = 0;
  _$jscoverage['/touch/handle.js'].lineData[201] = 0;
  _$jscoverage['/touch/handle.js'].lineData[202] = 0;
  _$jscoverage['/touch/handle.js'].lineData[203] = 0;
  _$jscoverage['/touch/handle.js'].lineData[206] = 0;
  _$jscoverage['/touch/handle.js'].lineData[209] = 0;
  _$jscoverage['/touch/handle.js'].lineData[210] = 0;
  _$jscoverage['/touch/handle.js'].lineData[211] = 0;
  _$jscoverage['/touch/handle.js'].lineData[214] = 0;
  _$jscoverage['/touch/handle.js'].lineData[218] = 0;
  _$jscoverage['/touch/handle.js'].lineData[220] = 0;
  _$jscoverage['/touch/handle.js'].lineData[221] = 0;
  _$jscoverage['/touch/handle.js'].lineData[222] = 0;
  _$jscoverage['/touch/handle.js'].lineData[223] = 0;
  _$jscoverage['/touch/handle.js'].lineData[225] = 0;
  _$jscoverage['/touch/handle.js'].lineData[226] = 0;
  _$jscoverage['/touch/handle.js'].lineData[227] = 0;
  _$jscoverage['/touch/handle.js'].lineData[229] = 0;
  _$jscoverage['/touch/handle.js'].lineData[232] = 0;
  _$jscoverage['/touch/handle.js'].lineData[236] = 0;
  _$jscoverage['/touch/handle.js'].lineData[238] = 0;
  _$jscoverage['/touch/handle.js'].lineData[239] = 0;
  _$jscoverage['/touch/handle.js'].lineData[240] = 0;
  _$jscoverage['/touch/handle.js'].lineData[244] = 0;
  _$jscoverage['/touch/handle.js'].lineData[245] = 0;
  _$jscoverage['/touch/handle.js'].lineData[246] = 0;
  _$jscoverage['/touch/handle.js'].lineData[247] = 0;
  _$jscoverage['/touch/handle.js'].lineData[248] = 0;
  _$jscoverage['/touch/handle.js'].lineData[250] = 0;
  _$jscoverage['/touch/handle.js'].lineData[251] = 0;
  _$jscoverage['/touch/handle.js'].lineData[252] = 0;
  _$jscoverage['/touch/handle.js'].lineData[253] = 0;
  _$jscoverage['/touch/handle.js'].lineData[254] = 0;
  _$jscoverage['/touch/handle.js'].lineData[255] = 0;
  _$jscoverage['/touch/handle.js'].lineData[261] = 0;
  _$jscoverage['/touch/handle.js'].lineData[265] = 0;
  _$jscoverage['/touch/handle.js'].lineData[266] = 0;
  _$jscoverage['/touch/handle.js'].lineData[268] = 0;
  _$jscoverage['/touch/handle.js'].lineData[269] = 0;
  _$jscoverage['/touch/handle.js'].lineData[270] = 0;
  _$jscoverage['/touch/handle.js'].lineData[272] = 0;
  _$jscoverage['/touch/handle.js'].lineData[274] = 0;
  _$jscoverage['/touch/handle.js'].lineData[275] = 0;
  _$jscoverage['/touch/handle.js'].lineData[279] = 0;
  _$jscoverage['/touch/handle.js'].lineData[280] = 0;
  _$jscoverage['/touch/handle.js'].lineData[281] = 0;
  _$jscoverage['/touch/handle.js'].lineData[286] = 0;
  _$jscoverage['/touch/handle.js'].lineData[289] = 0;
  _$jscoverage['/touch/handle.js'].lineData[290] = 0;
  _$jscoverage['/touch/handle.js'].lineData[292] = 0;
  _$jscoverage['/touch/handle.js'].lineData[300] = 0;
  _$jscoverage['/touch/handle.js'].lineData[301] = 0;
  _$jscoverage['/touch/handle.js'].lineData[302] = 0;
  _$jscoverage['/touch/handle.js'].lineData[303] = 0;
  _$jscoverage['/touch/handle.js'].lineData[304] = 0;
  _$jscoverage['/touch/handle.js'].lineData[310] = 0;
  _$jscoverage['/touch/handle.js'].lineData[312] = 0;
  _$jscoverage['/touch/handle.js'].lineData[313] = 0;
  _$jscoverage['/touch/handle.js'].lineData[314] = 0;
  _$jscoverage['/touch/handle.js'].lineData[318] = 0;
  _$jscoverage['/touch/handle.js'].lineData[320] = 0;
  _$jscoverage['/touch/handle.js'].lineData[322] = 0;
  _$jscoverage['/touch/handle.js'].lineData[323] = 0;
  _$jscoverage['/touch/handle.js'].lineData[325] = 0;
  _$jscoverage['/touch/handle.js'].lineData[326] = 0;
  _$jscoverage['/touch/handle.js'].lineData[331] = 0;
  _$jscoverage['/touch/handle.js'].lineData[333] = 0;
  _$jscoverage['/touch/handle.js'].lineData[334] = 0;
  _$jscoverage['/touch/handle.js'].lineData[335] = 0;
  _$jscoverage['/touch/handle.js'].lineData[337] = 0;
  _$jscoverage['/touch/handle.js'].lineData[338] = 0;
  _$jscoverage['/touch/handle.js'].lineData[339] = 0;
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
  _$jscoverage['/touch/handle.js'].branchData['73'] = [];
  _$jscoverage['/touch/handle.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['90'] = [];
  _$jscoverage['/touch/handle.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['92'] = [];
  _$jscoverage['/touch/handle.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['105'] = [];
  _$jscoverage['/touch/handle.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['107'] = [];
  _$jscoverage['/touch/handle.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['114'] = [];
  _$jscoverage['/touch/handle.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['118'] = [];
  _$jscoverage['/touch/handle.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['124'] = [];
  _$jscoverage['/touch/handle.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['134'] = [];
  _$jscoverage['/touch/handle.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['140'] = [];
  _$jscoverage['/touch/handle.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['152'] = [];
  _$jscoverage['/touch/handle.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['152'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['156'] = [];
  _$jscoverage['/touch/handle.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['156'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['156'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['167'] = [];
  _$jscoverage['/touch/handle.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['168'] = [];
  _$jscoverage['/touch/handle.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['168'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['168'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['171'] = [];
  _$jscoverage['/touch/handle.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['192'] = [];
  _$jscoverage['/touch/handle.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['195'] = [];
  _$jscoverage['/touch/handle.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['196'] = [];
  _$jscoverage['/touch/handle.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['200'] = [];
  _$jscoverage['/touch/handle.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['202'] = [];
  _$jscoverage['/touch/handle.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['220'] = [];
  _$jscoverage['/touch/handle.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['221'] = [];
  _$jscoverage['/touch/handle.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['222'] = [];
  _$jscoverage['/touch/handle.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['226'] = [];
  _$jscoverage['/touch/handle.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['238'] = [];
  _$jscoverage['/touch/handle.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['239'] = [];
  _$jscoverage['/touch/handle.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['245'] = [];
  _$jscoverage['/touch/handle.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['250'] = [];
  _$jscoverage['/touch/handle.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['252'] = [];
  _$jscoverage['/touch/handle.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['254'] = [];
  _$jscoverage['/touch/handle.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['269'] = [];
  _$jscoverage['/touch/handle.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['274'] = [];
  _$jscoverage['/touch/handle.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['274'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['274'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['289'] = [];
  _$jscoverage['/touch/handle.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['301'] = [];
  _$jscoverage['/touch/handle.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['303'] = [];
  _$jscoverage['/touch/handle.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['322'] = [];
  _$jscoverage['/touch/handle.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['325'] = [];
  _$jscoverage['/touch/handle.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['333'] = [];
  _$jscoverage['/touch/handle.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['334'] = [];
  _$jscoverage['/touch/handle.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['337'] = [];
  _$jscoverage['/touch/handle.js'].branchData['337'][1] = new BranchData();
}
_$jscoverage['/touch/handle.js'].branchData['337'][1].init(125, 35, 'S.isEmptyObject(handle.eventHandle)');
function visit55_337_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['334'][1].init(22, 5, 'event');
function visit54_334_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['333'][1].init(108, 6, 'handle');
function visit53_333_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['325'][1].init(223, 5, 'event');
function visit52_325_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['322'][1].init(108, 7, '!handle');
function visit51_322_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['303'][1].init(67, 25, '!eventHandle[event].count');
function visit50_303_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['301'][1].init(67, 18, 'eventHandle[event]');
function visit49_301_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['289'][1].init(153, 18, 'eventHandle[event]');
function visit48_289_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['274'][3].init(311, 26, 'h[method](event) === false');
function visit47_274_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['274'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['274'][2].init(298, 39, 'h[method] && h[method](event) === false');
function visit46_274_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['274'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['274'][1].init(284, 53, 'h.isActive && h[method] && h[method](event) === false');
function visit45_274_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['269'][1].init(128, 11, 'h.processed');
function visit44_269_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['254'][1].init(78, 20, '!self.touches.length');
function visit43_254_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['252'][1].init(627, 22, 'isMSPointerEvent(type)');
function visit42_252_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['250'][1].init(544, 18, 'isMouseEvent(type)');
function visit41_250_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['245'][1].init(306, 18, 'isTouchEvent(type)');
function visit40_245_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['239'][1].init(22, 37, 'self.isEventSimulatedFromTouch(event)');
function visit39_239_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['238'][1].init(84, 18, 'isMouseEvent(type)');
function visit38_238_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['226'][1].init(342, 22, 'isMSPointerEvent(type)');
function visit37_226_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['222'][1].init(22, 36, 'self.isEventSimulatedFromTouch(type)');
function visit36_222_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['221'][1].init(131, 18, 'isMouseEvent(type)');
function visit35_221_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['220'][1].init(84, 18, 'isTouchEvent(type)');
function visit34_220_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['202'][1].init(75, 24, 'self.touches.length == 1');
function visit33_202_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['200'][1].init(518, 22, 'isMSPointerEvent(type)');
function visit32_200_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['196'][1].init(22, 37, 'self.isEventSimulatedFromTouch(event)');
function visit31_196_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['195'][1].init(306, 18, 'isMouseEvent(type)');
function visit30_195_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['192'][1].init(156, 18, 'isTouchEvent(type)');
function visit29_192_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['171'][1].init(171, 21, 'touchList.length == 1');
function visit28_171_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['168'][3].init(53, 21, 'type == \'touchcancel\'');
function visit27_168_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['168'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['168'][2].init(31, 18, 'type == \'touchend\'');
function visit26_168_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['168'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['168'][1].init(31, 43, 'type == \'touchend\' || type == \'touchcancel\'');
function visit25_168_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['167'][1].init(102, 18, 'isTouchEvent(type)');
function visit24_167_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['156'][3].init(215, 14, 'dy <= DUP_DIST');
function visit23_156_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['156'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['156'][2].init(197, 14, 'dx <= DUP_DIST');
function visit22_156_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['156'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['156'][1].init(197, 32, 'dx <= DUP_DIST && dy <= DUP_DIST');
function visit21_156_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['152'][2].init(166, 5, 'i < l');
function visit20_152_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['152'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['152'][1].init(166, 21, 'i < l && (t = lts[i])');
function visit19_152_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['140'][1].init(72, 6, 'i > -1');
function visit18_140_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['134'][1].init(169, 22, 'this.isPrimaryTouch(t)');
function visit17_134_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['124'][1].init(18, 28, 'this.isPrimaryTouch(inTouch)');
function visit16_124_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['118'][1].init(18, 24, 'this.firstTouch === null');
function visit15_118_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['114'][1].init(21, 38, 'this.firstTouch === inTouch.identifier');
function visit14_114_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['107'][1].init(59, 32, 'touch[\'pointerId\'] === pointerId');
function visit13_107_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['105'][1].init(204, 5, 'i < l');
function visit12_105_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['92'][1].init(59, 32, 'touch[\'pointerId\'] === pointerId');
function visit11_92_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['90'][1].init(204, 5, 'i < l');
function visit10_90_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['73'][1].init(156, 35, '!isMSPointerEvent(gestureMoveEvent)');
function visit9_73_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['73'][1].ranCondition(result);
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
  if (visit9_73_1(!isMSPointerEvent(gestureMoveEvent))) {
    _$jscoverage['/touch/handle.js'].lineData[74]++;
    DomEvent.on(doc, gestureMoveEvent, self.onTouchMove, self);
  }
  _$jscoverage['/touch/handle.js'].lineData[76]++;
  DomEvent.on(doc, gestureEndEvent, self.onTouchEnd, self);
}, 
  addTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[6]++;
  _$jscoverage['/touch/handle.js'].lineData[80]++;
  originalEvent.identifier = originalEvent['pointerId'];
  _$jscoverage['/touch/handle.js'].lineData[81]++;
  this.touches.push(originalEvent);
}, 
  removeTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[7]++;
  _$jscoverage['/touch/handle.js'].lineData[85]++;
  var i = 0, touch, pointerId = originalEvent['pointerId'], touches = this.touches, l = touches.length;
  _$jscoverage['/touch/handle.js'].lineData[90]++;
  for (; visit10_90_1(i < l); i++) {
    _$jscoverage['/touch/handle.js'].lineData[91]++;
    touch = touches[i];
    _$jscoverage['/touch/handle.js'].lineData[92]++;
    if (visit11_92_1(touch['pointerId'] === pointerId)) {
      _$jscoverage['/touch/handle.js'].lineData[93]++;
      touches.splice(i, 1);
      _$jscoverage['/touch/handle.js'].lineData[94]++;
      break;
    }
  }
}, 
  updateTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[8]++;
  _$jscoverage['/touch/handle.js'].lineData[100]++;
  var i = 0, touch, pointerId = originalEvent['pointerId'], touches = this.touches, l = touches.length;
  _$jscoverage['/touch/handle.js'].lineData[105]++;
  for (; visit12_105_1(i < l); i++) {
    _$jscoverage['/touch/handle.js'].lineData[106]++;
    touch = touches[i];
    _$jscoverage['/touch/handle.js'].lineData[107]++;
    if (visit13_107_1(touch['pointerId'] === pointerId)) {
      _$jscoverage['/touch/handle.js'].lineData[108]++;
      touches[i] = originalEvent;
    }
  }
}, 
  isPrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[9]++;
  _$jscoverage['/touch/handle.js'].lineData[114]++;
  return visit14_114_1(this.firstTouch === inTouch.identifier);
}, 
  setPrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[10]++;
  _$jscoverage['/touch/handle.js'].lineData[118]++;
  if (visit15_118_1(this.firstTouch === null)) {
    _$jscoverage['/touch/handle.js'].lineData[119]++;
    this.firstTouch = inTouch.identifier;
  }
}, 
  removePrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[11]++;
  _$jscoverage['/touch/handle.js'].lineData[124]++;
  if (visit16_124_1(this.isPrimaryTouch(inTouch))) {
    _$jscoverage['/touch/handle.js'].lineData[125]++;
    this.firstTouch = null;
  }
}, 
  dupMouse: function(inEvent) {
  _$jscoverage['/touch/handle.js'].functionData[12]++;
  _$jscoverage['/touch/handle.js'].lineData[131]++;
  var lts = this.lastTouches;
  _$jscoverage['/touch/handle.js'].lineData[132]++;
  var t = inEvent.changedTouches[0];
  _$jscoverage['/touch/handle.js'].lineData[134]++;
  if (visit17_134_1(this.isPrimaryTouch(t))) {
    _$jscoverage['/touch/handle.js'].lineData[136]++;
    var lt = {
  x: t.clientX, 
  y: t.clientY};
    _$jscoverage['/touch/handle.js'].lineData[137]++;
    lts.push(lt);
    _$jscoverage['/touch/handle.js'].lineData[138]++;
    setTimeout(function() {
  _$jscoverage['/touch/handle.js'].functionData[13]++;
  _$jscoverage['/touch/handle.js'].lineData[139]++;
  var i = lts.indexOf(lt);
  _$jscoverage['/touch/handle.js'].lineData[140]++;
  if (visit18_140_1(i > -1)) {
    _$jscoverage['/touch/handle.js'].lineData[141]++;
    lts.splice(i, 1);
  }
}, DUP_TIMEOUT);
  }
}, 
  isEventSimulatedFromTouch: function(inEvent) {
  _$jscoverage['/touch/handle.js'].functionData[14]++;
  _$jscoverage['/touch/handle.js'].lineData[149]++;
  var lts = this.lastTouches;
  _$jscoverage['/touch/handle.js'].lineData[150]++;
  var x = inEvent.clientX, y = inEvent.clientY;
  _$jscoverage['/touch/handle.js'].lineData[152]++;
  for (var i = 0, l = lts.length, t; visit19_152_1(visit20_152_2(i < l) && (t = lts[i])); i++) {
    _$jscoverage['/touch/handle.js'].lineData[154]++;
    var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
    _$jscoverage['/touch/handle.js'].lineData[156]++;
    if (visit21_156_1(visit22_156_2(dx <= DUP_DIST) && visit23_156_3(dy <= DUP_DIST))) {
      _$jscoverage['/touch/handle.js'].lineData[157]++;
      return true;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[160]++;
  return 0;
}, 
  normalize: function(e) {
  _$jscoverage['/touch/handle.js'].functionData[15]++;
  _$jscoverage['/touch/handle.js'].lineData[164]++;
  var type = e.type, notUp, touchList;
  _$jscoverage['/touch/handle.js'].lineData[167]++;
  if (visit24_167_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[168]++;
    touchList = (visit25_168_1(visit26_168_2(type == 'touchend') || visit27_168_3(type == 'touchcancel'))) ? e.changedTouches : e.touches;
    _$jscoverage['/touch/handle.js'].lineData[171]++;
    if (visit28_171_1(touchList.length == 1)) {
      _$jscoverage['/touch/handle.js'].lineData[172]++;
      e.which = 1;
      _$jscoverage['/touch/handle.js'].lineData[173]++;
      e.pageX = touchList[0].pageX;
      _$jscoverage['/touch/handle.js'].lineData[174]++;
      e.pageY = touchList[0].pageY;
    }
    _$jscoverage['/touch/handle.js'].lineData[176]++;
    return e;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[178]++;
    touchList = this.touches;
  }
  _$jscoverage['/touch/handle.js'].lineData[180]++;
  notUp = !type.match(/(up|cancel)$/i);
  _$jscoverage['/touch/handle.js'].lineData[181]++;
  e.touches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[182]++;
  e.targetTouches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[183]++;
  e.changedTouches = touchList;
  _$jscoverage['/touch/handle.js'].lineData[184]++;
  return e;
}, 
  onTouchStart: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[16]++;
  _$jscoverage['/touch/handle.js'].lineData[188]++;
  var e, h, self = this, type = event.type, eventHandle = self.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[192]++;
  if (visit29_192_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[193]++;
    self.setPrimaryTouch(event.changedTouches[0]);
    _$jscoverage['/touch/handle.js'].lineData[194]++;
    self.dupMouse(event);
  } else {
    _$jscoverage['/touch/handle.js'].lineData[195]++;
    if (visit30_195_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[196]++;
      if (visit31_196_1(self.isEventSimulatedFromTouch(event))) {
        _$jscoverage['/touch/handle.js'].lineData[197]++;
        return;
      }
      _$jscoverage['/touch/handle.js'].lineData[199]++;
      self.touches = [event.originalEvent];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[200]++;
      if (visit32_200_1(isMSPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[201]++;
        self.addTouch(event.originalEvent);
        _$jscoverage['/touch/handle.js'].lineData[202]++;
        if (visit33_202_1(self.touches.length == 1)) {
          _$jscoverage['/touch/handle.js'].lineData[203]++;
          DomEvent.on(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      } else {
        _$jscoverage['/touch/handle.js'].lineData[206]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[209]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[210]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[211]++;
    h.isActive = 1;
  }
  _$jscoverage['/touch/handle.js'].lineData[214]++;
  self.callEventHandle('onTouchStart', event);
}, 
  onTouchMove: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[17]++;
  _$jscoverage['/touch/handle.js'].lineData[218]++;
  var self = this, type = event.type;
  _$jscoverage['/touch/handle.js'].lineData[220]++;
  if (visit34_220_1(isTouchEvent(type))) {
  } else {
    _$jscoverage['/touch/handle.js'].lineData[221]++;
    if (visit35_221_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[222]++;
      if (visit36_222_1(self.isEventSimulatedFromTouch(type))) {
        _$jscoverage['/touch/handle.js'].lineData[223]++;
        return;
      }
      _$jscoverage['/touch/handle.js'].lineData[225]++;
      self.touches = [event.originalEvent];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[226]++;
      if (visit37_226_1(isMSPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[227]++;
        self.updateTouch(event.originalEvent);
      } else {
        _$jscoverage['/touch/handle.js'].lineData[229]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[232]++;
  self.callEventHandle('onTouchMove', event);
}, 
  onTouchEnd: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[18]++;
  _$jscoverage['/touch/handle.js'].lineData[236]++;
  var self = this, type = event.type;
  _$jscoverage['/touch/handle.js'].lineData[238]++;
  if (visit38_238_1(isMouseEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[239]++;
    if (visit39_239_1(self.isEventSimulatedFromTouch(event))) {
      _$jscoverage['/touch/handle.js'].lineData[240]++;
      return;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[244]++;
  self.callEventHandle('onTouchEnd', event);
  _$jscoverage['/touch/handle.js'].lineData[245]++;
  if (visit40_245_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[246]++;
    self.dupMouse(event);
    _$jscoverage['/touch/handle.js'].lineData[247]++;
    S.makeArray(event.changedTouches).forEach(function(touch) {
  _$jscoverage['/touch/handle.js'].functionData[19]++;
  _$jscoverage['/touch/handle.js'].lineData[248]++;
  self.removePrimaryTouch(touch);
});
  } else {
    _$jscoverage['/touch/handle.js'].lineData[250]++;
    if (visit41_250_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[251]++;
      self.touches = [];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[252]++;
      if (visit42_252_1(isMSPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[253]++;
        self.removeTouch(event.originalEvent);
        _$jscoverage['/touch/handle.js'].lineData[254]++;
        if (visit43_254_1(!self.touches.length)) {
          _$jscoverage['/touch/handle.js'].lineData[255]++;
          DomEvent.detach(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      }
    }
  }
}, 
  callEventHandle: function(method, event) {
  _$jscoverage['/touch/handle.js'].functionData[20]++;
  _$jscoverage['/touch/handle.js'].lineData[261]++;
  var self = this, eventHandle = self.eventHandle, e, h;
  _$jscoverage['/touch/handle.js'].lineData[265]++;
  event = self.normalize(event);
  _$jscoverage['/touch/handle.js'].lineData[266]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[268]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[269]++;
    if (visit44_269_1(h.processed)) {
      _$jscoverage['/touch/handle.js'].lineData[270]++;
      continue;
    }
    _$jscoverage['/touch/handle.js'].lineData[272]++;
    h.processed = 1;
    _$jscoverage['/touch/handle.js'].lineData[274]++;
    if (visit45_274_1(h.isActive && visit46_274_2(h[method] && visit47_274_3(h[method](event) === false)))) {
      _$jscoverage['/touch/handle.js'].lineData[275]++;
      h.isActive = 0;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[279]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[280]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[281]++;
    h.processed = 0;
  }
}, 
  addEventHandle: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[21]++;
  _$jscoverage['/touch/handle.js'].lineData[286]++;
  var self = this, eventHandle = self.eventHandle, handle = eventHandleMap[event].handle;
  _$jscoverage['/touch/handle.js'].lineData[289]++;
  if (visit48_289_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[290]++;
    eventHandle[event].count++;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[292]++;
    eventHandle[event] = {
  count: 1, 
  handle: handle};
  }
}, 
  'removeEventHandle': function(event) {
  _$jscoverage['/touch/handle.js'].functionData[22]++;
  _$jscoverage['/touch/handle.js'].lineData[300]++;
  var eventHandle = this.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[301]++;
  if (visit49_301_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[302]++;
    eventHandle[event].count--;
    _$jscoverage['/touch/handle.js'].lineData[303]++;
    if (visit50_303_1(!eventHandle[event].count)) {
      _$jscoverage['/touch/handle.js'].lineData[304]++;
      delete eventHandle[event];
    }
  }
}, 
  destroy: function() {
  _$jscoverage['/touch/handle.js'].functionData[23]++;
  _$jscoverage['/touch/handle.js'].lineData[310]++;
  var self = this, doc = self.doc;
  _$jscoverage['/touch/handle.js'].lineData[312]++;
  DomEvent.detach(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/touch/handle.js'].lineData[313]++;
  DomEvent.detach(doc, gestureMoveEvent, self.onTouchMove, self);
  _$jscoverage['/touch/handle.js'].lineData[314]++;
  DomEvent.detach(doc, gestureEndEvent, self.onTouchEnd, self);
}};
  _$jscoverage['/touch/handle.js'].lineData[318]++;
  return {
  addDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[24]++;
  _$jscoverage['/touch/handle.js'].lineData[320]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[322]++;
  if (visit51_322_1(!handle)) {
    _$jscoverage['/touch/handle.js'].lineData[323]++;
    Dom.data(doc, key, handle = new DocumentHandler(doc));
  }
  _$jscoverage['/touch/handle.js'].lineData[325]++;
  if (visit52_325_1(event)) {
    _$jscoverage['/touch/handle.js'].lineData[326]++;
    handle.addEventHandle(event);
  }
}, 
  removeDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[25]++;
  _$jscoverage['/touch/handle.js'].lineData[331]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[333]++;
  if (visit53_333_1(handle)) {
    _$jscoverage['/touch/handle.js'].lineData[334]++;
    if (visit54_334_1(event)) {
      _$jscoverage['/touch/handle.js'].lineData[335]++;
      handle.removeEventHandle(event);
    }
    _$jscoverage['/touch/handle.js'].lineData[337]++;
    if (visit55_337_1(S.isEmptyObject(handle.eventHandle))) {
      _$jscoverage['/touch/handle.js'].lineData[338]++;
      handle.destroy();
      _$jscoverage['/touch/handle.js'].lineData[339]++;
      Dom.removeData(doc, key);
    }
  }
}};
}, {
  requires: ['dom', './handle-map', 'event/dom/base', './tap', './swipe', './double-tap', './pinch', './tap-hold', './rotate']});
