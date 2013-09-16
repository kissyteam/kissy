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
if (! _$jscoverage['/compiler.js']) {
  _$jscoverage['/compiler.js'] = {};
  _$jscoverage['/compiler.js'].lineData = [];
  _$jscoverage['/compiler.js'].lineData[6] = 0;
  _$jscoverage['/compiler.js'].lineData[7] = 0;
  _$jscoverage['/compiler.js'].lineData[9] = 0;
  _$jscoverage['/compiler.js'].lineData[15] = 0;
  _$jscoverage['/compiler.js'].lineData[16] = 0;
  _$jscoverage['/compiler.js'].lineData[22] = 0;
  _$jscoverage['/compiler.js'].lineData[23] = 0;
  _$jscoverage['/compiler.js'].lineData[24] = 0;
  _$jscoverage['/compiler.js'].lineData[26] = 0;
  _$jscoverage['/compiler.js'].lineData[28] = 0;
  _$jscoverage['/compiler.js'].lineData[30] = 0;
  _$jscoverage['/compiler.js'].lineData[33] = 0;
  _$jscoverage['/compiler.js'].lineData[34] = 0;
  _$jscoverage['/compiler.js'].lineData[36] = 0;
  _$jscoverage['/compiler.js'].lineData[37] = 0;
  _$jscoverage['/compiler.js'].lineData[39] = 0;
  _$jscoverage['/compiler.js'].lineData[43] = 0;
  _$jscoverage['/compiler.js'].lineData[44] = 0;
  _$jscoverage['/compiler.js'].lineData[47] = 0;
  _$jscoverage['/compiler.js'].lineData[48] = 0;
  _$jscoverage['/compiler.js'].lineData[51] = 0;
  _$jscoverage['/compiler.js'].lineData[56] = 0;
  _$jscoverage['/compiler.js'].lineData[57] = 0;
  _$jscoverage['/compiler.js'].lineData[58] = 0;
  _$jscoverage['/compiler.js'].lineData[60] = 0;
  _$jscoverage['/compiler.js'].lineData[61] = 0;
  _$jscoverage['/compiler.js'].lineData[62] = 0;
  _$jscoverage['/compiler.js'].lineData[67] = 0;
  _$jscoverage['/compiler.js'].lineData[71] = 0;
  _$jscoverage['/compiler.js'].lineData[72] = 0;
  _$jscoverage['/compiler.js'].lineData[75] = 0;
  _$jscoverage['/compiler.js'].lineData[76] = 0;
  _$jscoverage['/compiler.js'].lineData[79] = 0;
  _$jscoverage['/compiler.js'].lineData[80] = 0;
  _$jscoverage['/compiler.js'].lineData[81] = 0;
  _$jscoverage['/compiler.js'].lineData[84] = 0;
  _$jscoverage['/compiler.js'].lineData[85] = 0;
  _$jscoverage['/compiler.js'].lineData[86] = 0;
  _$jscoverage['/compiler.js'].lineData[87] = 0;
  _$jscoverage['/compiler.js'].lineData[89] = 0;
  _$jscoverage['/compiler.js'].lineData[97] = 0;
  _$jscoverage['/compiler.js'].lineData[105] = 0;
  _$jscoverage['/compiler.js'].lineData[106] = 0;
  _$jscoverage['/compiler.js'].lineData[107] = 0;
  _$jscoverage['/compiler.js'].lineData[108] = 0;
  _$jscoverage['/compiler.js'].lineData[109] = 0;
  _$jscoverage['/compiler.js'].lineData[110] = 0;
  _$jscoverage['/compiler.js'].lineData[115] = 0;
  _$jscoverage['/compiler.js'].lineData[117] = 0;
  _$jscoverage['/compiler.js'].lineData[125] = 0;
  _$jscoverage['/compiler.js'].lineData[129] = 0;
  _$jscoverage['/compiler.js'].lineData[135] = 0;
  _$jscoverage['/compiler.js'].lineData[136] = 0;
  _$jscoverage['/compiler.js'].lineData[138] = 0;
  _$jscoverage['/compiler.js'].lineData[139] = 0;
  _$jscoverage['/compiler.js'].lineData[140] = 0;
  _$jscoverage['/compiler.js'].lineData[141] = 0;
  _$jscoverage['/compiler.js'].lineData[142] = 0;
  _$jscoverage['/compiler.js'].lineData[145] = 0;
  _$jscoverage['/compiler.js'].lineData[146] = 0;
  _$jscoverage['/compiler.js'].lineData[147] = 0;
  _$jscoverage['/compiler.js'].lineData[148] = 0;
  _$jscoverage['/compiler.js'].lineData[153] = 0;
  _$jscoverage['/compiler.js'].lineData[156] = 0;
  _$jscoverage['/compiler.js'].lineData[157] = 0;
  _$jscoverage['/compiler.js'].lineData[158] = 0;
  _$jscoverage['/compiler.js'].lineData[159] = 0;
  _$jscoverage['/compiler.js'].lineData[163] = 0;
  _$jscoverage['/compiler.js'].lineData[166] = 0;
  _$jscoverage['/compiler.js'].lineData[167] = 0;
  _$jscoverage['/compiler.js'].lineData[168] = 0;
  _$jscoverage['/compiler.js'].lineData[169] = 0;
  _$jscoverage['/compiler.js'].lineData[173] = 0;
  _$jscoverage['/compiler.js'].lineData[176] = 0;
  _$jscoverage['/compiler.js'].lineData[180] = 0;
  _$jscoverage['/compiler.js'].lineData[186] = 0;
  _$jscoverage['/compiler.js'].lineData[187] = 0;
  _$jscoverage['/compiler.js'].lineData[188] = 0;
  _$jscoverage['/compiler.js'].lineData[190] = 0;
  _$jscoverage['/compiler.js'].lineData[191] = 0;
  _$jscoverage['/compiler.js'].lineData[192] = 0;
  _$jscoverage['/compiler.js'].lineData[195] = 0;
  _$jscoverage['/compiler.js'].lineData[196] = 0;
  _$jscoverage['/compiler.js'].lineData[197] = 0;
  _$jscoverage['/compiler.js'].lineData[198] = 0;
  _$jscoverage['/compiler.js'].lineData[199] = 0;
  _$jscoverage['/compiler.js'].lineData[200] = 0;
  _$jscoverage['/compiler.js'].lineData[201] = 0;
  _$jscoverage['/compiler.js'].lineData[202] = 0;
  _$jscoverage['/compiler.js'].lineData[204] = 0;
  _$jscoverage['/compiler.js'].lineData[205] = 0;
  _$jscoverage['/compiler.js'].lineData[208] = 0;
  _$jscoverage['/compiler.js'].lineData[211] = 0;
  _$jscoverage['/compiler.js'].lineData[212] = 0;
  _$jscoverage['/compiler.js'].lineData[213] = 0;
  _$jscoverage['/compiler.js'].lineData[214] = 0;
  _$jscoverage['/compiler.js'].lineData[215] = 0;
  _$jscoverage['/compiler.js'].lineData[216] = 0;
  _$jscoverage['/compiler.js'].lineData[217] = 0;
  _$jscoverage['/compiler.js'].lineData[218] = 0;
  _$jscoverage['/compiler.js'].lineData[220] = 0;
  _$jscoverage['/compiler.js'].lineData[221] = 0;
  _$jscoverage['/compiler.js'].lineData[224] = 0;
  _$jscoverage['/compiler.js'].lineData[228] = 0;
  _$jscoverage['/compiler.js'].lineData[234] = 0;
  _$jscoverage['/compiler.js'].lineData[238] = 0;
  _$jscoverage['/compiler.js'].lineData[242] = 0;
  _$jscoverage['/compiler.js'].lineData[246] = 0;
  _$jscoverage['/compiler.js'].lineData[250] = 0;
  _$jscoverage['/compiler.js'].lineData[254] = 0;
  _$jscoverage['/compiler.js'].lineData[258] = 0;
  _$jscoverage['/compiler.js'].lineData[261] = 0;
  _$jscoverage['/compiler.js'].lineData[262] = 0;
  _$jscoverage['/compiler.js'].lineData[263] = 0;
  _$jscoverage['/compiler.js'].lineData[265] = 0;
  _$jscoverage['/compiler.js'].lineData[267] = 0;
  _$jscoverage['/compiler.js'].lineData[272] = 0;
  _$jscoverage['/compiler.js'].lineData[276] = 0;
  _$jscoverage['/compiler.js'].lineData[280] = 0;
  _$jscoverage['/compiler.js'].lineData[285] = 0;
  _$jscoverage['/compiler.js'].lineData[289] = 0;
  _$jscoverage['/compiler.js'].lineData[299] = 0;
  _$jscoverage['/compiler.js'].lineData[301] = 0;
  _$jscoverage['/compiler.js'].lineData[302] = 0;
  _$jscoverage['/compiler.js'].lineData[303] = 0;
  _$jscoverage['/compiler.js'].lineData[306] = 0;
  _$jscoverage['/compiler.js'].lineData[309] = 0;
  _$jscoverage['/compiler.js'].lineData[310] = 0;
  _$jscoverage['/compiler.js'].lineData[311] = 0;
  _$jscoverage['/compiler.js'].lineData[316] = 0;
  _$jscoverage['/compiler.js'].lineData[317] = 0;
  _$jscoverage['/compiler.js'].lineData[318] = 0;
  _$jscoverage['/compiler.js'].lineData[319] = 0;
  _$jscoverage['/compiler.js'].lineData[320] = 0;
  _$jscoverage['/compiler.js'].lineData[323] = 0;
  _$jscoverage['/compiler.js'].lineData[324] = 0;
  _$jscoverage['/compiler.js'].lineData[325] = 0;
  _$jscoverage['/compiler.js'].lineData[327] = 0;
  _$jscoverage['/compiler.js'].lineData[328] = 0;
  _$jscoverage['/compiler.js'].lineData[329] = 0;
  _$jscoverage['/compiler.js'].lineData[334] = 0;
  _$jscoverage['/compiler.js'].lineData[338] = 0;
  _$jscoverage['/compiler.js'].lineData[342] = 0;
  _$jscoverage['/compiler.js'].lineData[346] = 0;
  _$jscoverage['/compiler.js'].lineData[348] = 0;
  _$jscoverage['/compiler.js'].lineData[349] = 0;
  _$jscoverage['/compiler.js'].lineData[350] = 0;
  _$jscoverage['/compiler.js'].lineData[354] = 0;
  _$jscoverage['/compiler.js'].lineData[357] = 0;
  _$jscoverage['/compiler.js'].lineData[358] = 0;
  _$jscoverage['/compiler.js'].lineData[359] = 0;
  _$jscoverage['/compiler.js'].lineData[360] = 0;
  _$jscoverage['/compiler.js'].lineData[362] = 0;
  _$jscoverage['/compiler.js'].lineData[363] = 0;
  _$jscoverage['/compiler.js'].lineData[365] = 0;
  _$jscoverage['/compiler.js'].lineData[366] = 0;
  _$jscoverage['/compiler.js'].lineData[371] = 0;
  _$jscoverage['/compiler.js'].lineData[378] = 0;
  _$jscoverage['/compiler.js'].lineData[379] = 0;
  _$jscoverage['/compiler.js'].lineData[380] = 0;
  _$jscoverage['/compiler.js'].lineData[381] = 0;
  _$jscoverage['/compiler.js'].lineData[382] = 0;
  _$jscoverage['/compiler.js'].lineData[384] = 0;
  _$jscoverage['/compiler.js'].lineData[385] = 0;
  _$jscoverage['/compiler.js'].lineData[386] = 0;
  _$jscoverage['/compiler.js'].lineData[387] = 0;
  _$jscoverage['/compiler.js'].lineData[388] = 0;
  _$jscoverage['/compiler.js'].lineData[389] = 0;
  _$jscoverage['/compiler.js'].lineData[393] = 0;
  _$jscoverage['/compiler.js'].lineData[394] = 0;
  _$jscoverage['/compiler.js'].lineData[397] = 0;
  _$jscoverage['/compiler.js'].lineData[401] = 0;
  _$jscoverage['/compiler.js'].lineData[408] = 0;
  _$jscoverage['/compiler.js'].lineData[415] = 0;
  _$jscoverage['/compiler.js'].lineData[423] = 0;
  _$jscoverage['/compiler.js'].lineData[424] = 0;
  _$jscoverage['/compiler.js'].lineData[434] = 0;
  _$jscoverage['/compiler.js'].lineData[435] = 0;
  _$jscoverage['/compiler.js'].lineData[436] = 0;
  _$jscoverage['/compiler.js'].lineData[446] = 0;
  _$jscoverage['/compiler.js'].lineData[447] = 0;
  _$jscoverage['/compiler.js'].lineData[448] = 0;
  _$jscoverage['/compiler.js'].lineData[453] = 0;
}
if (! _$jscoverage['/compiler.js'].functionData) {
  _$jscoverage['/compiler.js'].functionData = [];
  _$jscoverage['/compiler.js'].functionData[0] = 0;
  _$jscoverage['/compiler.js'].functionData[1] = 0;
  _$jscoverage['/compiler.js'].functionData[2] = 0;
  _$jscoverage['/compiler.js'].functionData[3] = 0;
  _$jscoverage['/compiler.js'].functionData[4] = 0;
  _$jscoverage['/compiler.js'].functionData[5] = 0;
  _$jscoverage['/compiler.js'].functionData[6] = 0;
  _$jscoverage['/compiler.js'].functionData[7] = 0;
  _$jscoverage['/compiler.js'].functionData[8] = 0;
  _$jscoverage['/compiler.js'].functionData[9] = 0;
  _$jscoverage['/compiler.js'].functionData[10] = 0;
  _$jscoverage['/compiler.js'].functionData[11] = 0;
  _$jscoverage['/compiler.js'].functionData[12] = 0;
  _$jscoverage['/compiler.js'].functionData[13] = 0;
  _$jscoverage['/compiler.js'].functionData[14] = 0;
  _$jscoverage['/compiler.js'].functionData[15] = 0;
  _$jscoverage['/compiler.js'].functionData[16] = 0;
  _$jscoverage['/compiler.js'].functionData[17] = 0;
  _$jscoverage['/compiler.js'].functionData[18] = 0;
  _$jscoverage['/compiler.js'].functionData[19] = 0;
  _$jscoverage['/compiler.js'].functionData[20] = 0;
  _$jscoverage['/compiler.js'].functionData[21] = 0;
  _$jscoverage['/compiler.js'].functionData[22] = 0;
  _$jscoverage['/compiler.js'].functionData[23] = 0;
  _$jscoverage['/compiler.js'].functionData[24] = 0;
  _$jscoverage['/compiler.js'].functionData[25] = 0;
  _$jscoverage['/compiler.js'].functionData[26] = 0;
  _$jscoverage['/compiler.js'].functionData[27] = 0;
  _$jscoverage['/compiler.js'].functionData[28] = 0;
  _$jscoverage['/compiler.js'].functionData[29] = 0;
  _$jscoverage['/compiler.js'].functionData[30] = 0;
  _$jscoverage['/compiler.js'].functionData[31] = 0;
  _$jscoverage['/compiler.js'].functionData[32] = 0;
}
if (! _$jscoverage['/compiler.js'].branchData) {
  _$jscoverage['/compiler.js'].branchData = {};
  _$jscoverage['/compiler.js'].branchData['23'] = [];
  _$jscoverage['/compiler.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['36'] = [];
  _$jscoverage['/compiler.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['57'] = [];
  _$jscoverage['/compiler.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['61'] = [];
  _$jscoverage['/compiler.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['75'] = [];
  _$jscoverage['/compiler.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['79'] = [];
  _$jscoverage['/compiler.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['80'] = [];
  _$jscoverage['/compiler.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['85'] = [];
  _$jscoverage['/compiler.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['105'] = [];
  _$jscoverage['/compiler.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['106'] = [];
  _$jscoverage['/compiler.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['108'] = [];
  _$jscoverage['/compiler.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['119'] = [];
  _$jscoverage['/compiler.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['122'] = [];
  _$jscoverage['/compiler.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['138'] = [];
  _$jscoverage['/compiler.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['145'] = [];
  _$jscoverage['/compiler.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['156'] = [];
  _$jscoverage['/compiler.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['166'] = [];
  _$jscoverage['/compiler.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['186'] = [];
  _$jscoverage['/compiler.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['190'] = [];
  _$jscoverage['/compiler.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['195'] = [];
  _$jscoverage['/compiler.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['200'] = [];
  _$jscoverage['/compiler.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['211'] = [];
  _$jscoverage['/compiler.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['216'] = [];
  _$jscoverage['/compiler.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['262'] = [];
  _$jscoverage['/compiler.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['301'] = [];
  _$jscoverage['/compiler.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['309'] = [];
  _$jscoverage['/compiler.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['316'] = [];
  _$jscoverage['/compiler.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['323'] = [];
  _$jscoverage['/compiler.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['325'] = [];
  _$jscoverage['/compiler.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['327'] = [];
  _$jscoverage['/compiler.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['358'] = [];
  _$jscoverage['/compiler.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['378'] = [];
  _$jscoverage['/compiler.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['381'] = [];
  _$jscoverage['/compiler.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['384'] = [];
  _$jscoverage['/compiler.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['386'] = [];
  _$jscoverage['/compiler.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['447'] = [];
  _$jscoverage['/compiler.js'].branchData['447'][1] = new BranchData();
}
_$jscoverage['/compiler.js'].branchData['447'][1].init(70, 12, 'config || {}');
function visit80_447_1(result) {
  _$jscoverage['/compiler.js'].branchData['447'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['386'][1].init(90, 17, 'nextIdNameCode[0]');
function visit79_386_1(result) {
  _$jscoverage['/compiler.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['384'][1].init(191, 10, 'idPartType');
function visit78_384_1(result) {
  _$jscoverage['/compiler.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['381'][1].init(103, 6, '!first');
function visit77_381_1(result) {
  _$jscoverage['/compiler.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['378'][1].init(226, 18, 'i < idParts.length');
function visit76_378_1(result) {
  _$jscoverage['/compiler.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['358'][1].init(191, 7, 'code[0]');
function visit75_358_1(result) {
  _$jscoverage['/compiler.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['327'][1].init(59, 27, 'typeof parts[i] != \'string\'');
function visit74_327_1(result) {
  _$jscoverage['/compiler.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['325'][1].init(78, 16, 'i < parts.length');
function visit73_325_1(result) {
  _$jscoverage['/compiler.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['323'][1].init(1328, 32, '!tplNode.hash && !tplNode.params');
function visit72_323_1(result) {
  _$jscoverage['/compiler.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['316'][1].init(1006, 18, 'tplNode.isInverted');
function visit71_316_1(result) {
  _$jscoverage['/compiler.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['309'][1].init(727, 19, 'programNode.inverse');
function visit70_309_1(result) {
  _$jscoverage['/compiler.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['301'][1].init(442, 11, '!configName');
function visit69_301_1(result) {
  _$jscoverage['/compiler.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['262'][1].init(171, 14, 'name = code[0]');
function visit68_262_1(result) {
  _$jscoverage['/compiler.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['216'][1].init(93, 17, 'nextIdNameCode[0]');
function visit67_216_1(result) {
  _$jscoverage['/compiler.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['211'][1].init(1138, 4, 'hash');
function visit66_211_1(result) {
  _$jscoverage['/compiler.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['200'][1].init(101, 17, 'nextIdNameCode[0]');
function visit65_200_1(result) {
  _$jscoverage['/compiler.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['195'][1].init(280, 6, 'params');
function visit64_195_1(result) {
  _$jscoverage['/compiler.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['190'][1].init(104, 14, 'params || hash');
function visit63_190_1(result) {
  _$jscoverage['/compiler.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['186'][1].init(142, 7, 'tplNode');
function visit62_186_1(result) {
  _$jscoverage['/compiler.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['166'][1].init(1249, 15, '!name1 && name2');
function visit61_166_1(result) {
  _$jscoverage['/compiler.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['156'][1].init(906, 15, 'name1 && !name2');
function visit60_156_1(result) {
  _$jscoverage['/compiler.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['145'][1].init(500, 16, '!name1 && !name2');
function visit59_145_1(result) {
  _$jscoverage['/compiler.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['138'][1].init(262, 14, 'name1 && name2');
function visit58_138_1(result) {
  _$jscoverage['/compiler.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['122'][1].init(241, 26, 'tplNode && tplNode.escaped');
function visit57_122_1(result) {
  _$jscoverage['/compiler.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['119'][1].init(102, 18, 'configName || \'{}\'');
function visit56_119_1(result) {
  _$jscoverage['/compiler.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['108'][1].init(129, 14, 'configNameCode');
function visit55_108_1(result) {
  _$jscoverage['/compiler.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['106'][1].init(39, 34, 'tplNode && self.genConfig(tplNode)');
function visit54_106_1(result) {
  _$jscoverage['/compiler.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['105'][1].init(274, 10, 'depth == 0');
function visit53_105_1(result) {
  _$jscoverage['/compiler.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['85'][1].init(1088, 7, '!global');
function visit52_85_1(result) {
  _$jscoverage['/compiler.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['80'][1].init(59, 7, 'i < len');
function visit51_80_1(result) {
  _$jscoverage['/compiler.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['79'][1].init(822, 10, 'statements');
function visit50_79_1(result) {
  _$jscoverage['/compiler.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['75'][1].init(453, 7, 'natives');
function visit49_75_1(result) {
  _$jscoverage['/compiler.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['61'][1].init(211, 6, 'global');
function visit48_61_1(result) {
  _$jscoverage['/compiler.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['57'][1].init(48, 7, '!global');
function visit47_57_1(result) {
  _$jscoverage['/compiler.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['36'][1].init(89, 12, 'm.length % 2');
function visit46_36_1(result) {
  _$jscoverage['/compiler.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['23'][1].init(14, 6, 'isCode');
function visit45_23_1(result) {
  _$jscoverage['/compiler.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].lineData[6]++;
KISSY.add("xtemplate/compiler", function(S, parser, ast, XTemplateRuntime, undefined) {
  _$jscoverage['/compiler.js'].functionData[0]++;
  _$jscoverage['/compiler.js'].lineData[7]++;
  parser.yy = ast;
  _$jscoverage['/compiler.js'].lineData[9]++;
  var doubleReg = /\\*"/g, singleReg = /\\*'/g, arrayPush = [].push, variableId = 0, xtemplateId = 0;
  _$jscoverage['/compiler.js'].lineData[15]++;
  function guid(str) {
    _$jscoverage['/compiler.js'].functionData[1]++;
    _$jscoverage['/compiler.js'].lineData[16]++;
    return str + (variableId++);
  }
  _$jscoverage['/compiler.js'].lineData[22]++;
  function escapeString(str, isCode) {
    _$jscoverage['/compiler.js'].functionData[2]++;
    _$jscoverage['/compiler.js'].lineData[23]++;
    if (visit45_23_1(isCode)) {
      _$jscoverage['/compiler.js'].lineData[24]++;
      str = escapeSingleQuoteInCodeString(str, false);
    } else {
      _$jscoverage['/compiler.js'].lineData[26]++;
      str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    _$jscoverage['/compiler.js'].lineData[28]++;
    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    _$jscoverage['/compiler.js'].lineData[30]++;
    return str;
  }
  _$jscoverage['/compiler.js'].lineData[33]++;
  function escapeSingleQuoteInCodeString(str, isDouble) {
    _$jscoverage['/compiler.js'].functionData[3]++;
    _$jscoverage['/compiler.js'].lineData[34]++;
    return str.replace(isDouble ? doubleReg : singleReg, function(m) {
  _$jscoverage['/compiler.js'].functionData[4]++;
  _$jscoverage['/compiler.js'].lineData[36]++;
  if (visit46_36_1(m.length % 2)) {
    _$jscoverage['/compiler.js'].lineData[37]++;
    m = '\\' + m;
  }
  _$jscoverage['/compiler.js'].lineData[39]++;
  return m;
});
  }
  _$jscoverage['/compiler.js'].lineData[43]++;
  function pushToArray(to, from) {
    _$jscoverage['/compiler.js'].functionData[5]++;
    _$jscoverage['/compiler.js'].lineData[44]++;
    arrayPush.apply(to, from);
  }
  _$jscoverage['/compiler.js'].lineData[47]++;
  function lastOfArray(arr) {
    _$jscoverage['/compiler.js'].functionData[6]++;
    _$jscoverage['/compiler.js'].lineData[48]++;
    return arr[arr.length - 1];
  }
  _$jscoverage['/compiler.js'].lineData[51]++;
  var gen = {
  genFunction: function(statements, global) {
  _$jscoverage['/compiler.js'].functionData[7]++;
  _$jscoverage['/compiler.js'].lineData[56]++;
  var source = [];
  _$jscoverage['/compiler.js'].lineData[57]++;
  if (visit47_57_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[58]++;
    source.push('function(scopes) {');
  }
  _$jscoverage['/compiler.js'].lineData[60]++;
  source.push('var buffer = ""' + (global ? ',' : ';'));
  _$jscoverage['/compiler.js'].lineData[61]++;
  if (visit48_61_1(global)) {
    _$jscoverage['/compiler.js'].lineData[62]++;
    source.push('config = this.config,' + 'engine = this, ' + 'utils = config.utils;');
    _$jscoverage['/compiler.js'].lineData[67]++;
    var natives = '', c, utils = XTemplateRuntime.utils;
    _$jscoverage['/compiler.js'].lineData[71]++;
    for (c in utils) {
      _$jscoverage['/compiler.js'].lineData[72]++;
      natives += c + 'Util = utils["' + c + '"],';
    }
    _$jscoverage['/compiler.js'].lineData[75]++;
    if (visit49_75_1(natives)) {
      _$jscoverage['/compiler.js'].lineData[76]++;
      source.push('var ' + natives.slice(0, natives.length - 1) + ';');
    }
  }
  _$jscoverage['/compiler.js'].lineData[79]++;
  if (visit50_79_1(statements)) {
    _$jscoverage['/compiler.js'].lineData[80]++;
    for (var i = 0, len = statements.length; visit51_80_1(i < len); i++) {
      _$jscoverage['/compiler.js'].lineData[81]++;
      pushToArray(source, this[statements[i].type](statements[i]));
    }
  }
  _$jscoverage['/compiler.js'].lineData[84]++;
  source.push('return buffer;');
  _$jscoverage['/compiler.js'].lineData[85]++;
  if (visit52_85_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[86]++;
    source.push('}');
    _$jscoverage['/compiler.js'].lineData[87]++;
    return source;
  } else {
    _$jscoverage['/compiler.js'].lineData[89]++;
    return {
  params: ['scopes', 'S', 'undefined'], 
  source: source};
  }
}, 
  genId: function(idNode, tplNode, preserveUndefined) {
  _$jscoverage['/compiler.js'].functionData[8]++;
  _$jscoverage['/compiler.js'].lineData[97]++;
  var source = [], depth = idNode.depth, idParts = idNode.parts, idName = guid('id'), self = this;
  _$jscoverage['/compiler.js'].lineData[105]++;
  if (visit53_105_1(depth == 0)) {
    _$jscoverage['/compiler.js'].lineData[106]++;
    var configNameCode = visit54_106_1(tplNode && self.genConfig(tplNode));
    _$jscoverage['/compiler.js'].lineData[107]++;
    var configName;
    _$jscoverage['/compiler.js'].lineData[108]++;
    if (visit55_108_1(configNameCode)) {
      _$jscoverage['/compiler.js'].lineData[109]++;
      configName = configNameCode[0];
      _$jscoverage['/compiler.js'].lineData[110]++;
      pushToArray(source, configNameCode[1]);
    }
  }
  _$jscoverage['/compiler.js'].lineData[115]++;
  var idString = self.getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[117]++;
  source.push('var ' + idName + ' = getPropertyOrRunCommandUtil(engine,scopes,' + (visit56_119_1(configName || '{}')) + ',"' + idString + '",' + depth + ',' + idNode.lineNumber + ',' + (visit57_122_1(tplNode && tplNode.escaped)) + ',' + preserveUndefined + ');');
  _$jscoverage['/compiler.js'].lineData[125]++;
  return [idName, source];
}, 
  genOpExpression: function(e, type) {
  _$jscoverage['/compiler.js'].functionData[9]++;
  _$jscoverage['/compiler.js'].lineData[129]++;
  var source = [], name1, name2, code1 = this[e.op1.type](e.op1), code2 = this[e.op2.type](e.op2);
  _$jscoverage['/compiler.js'].lineData[135]++;
  name1 = code1[0];
  _$jscoverage['/compiler.js'].lineData[136]++;
  name2 = code2[0];
  _$jscoverage['/compiler.js'].lineData[138]++;
  if (visit58_138_1(name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[139]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[140]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[141]++;
    source.push(name1 + type + name2);
    _$jscoverage['/compiler.js'].lineData[142]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[145]++;
  if (visit59_145_1(!name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[146]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[147]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[148]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[153]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[156]++;
  if (visit60_156_1(name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[157]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[158]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[159]++;
    source.push(name1 + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[163]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[166]++;
  if (visit61_166_1(!name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[167]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[168]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[169]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + name2);
    _$jscoverage['/compiler.js'].lineData[173]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[176]++;
  return undefined;
}, 
  genConfig: function(tplNode) {
  _$jscoverage['/compiler.js'].functionData[10]++;
  _$jscoverage['/compiler.js'].lineData[180]++;
  var source = [], configName, params, hash, self = this;
  _$jscoverage['/compiler.js'].lineData[186]++;
  if (visit62_186_1(tplNode)) {
    _$jscoverage['/compiler.js'].lineData[187]++;
    params = tplNode.params;
    _$jscoverage['/compiler.js'].lineData[188]++;
    hash = tplNode.hash;
    _$jscoverage['/compiler.js'].lineData[190]++;
    if (visit63_190_1(params || hash)) {
      _$jscoverage['/compiler.js'].lineData[191]++;
      configName = guid('config');
      _$jscoverage['/compiler.js'].lineData[192]++;
      source.push('var ' + configName + ' = {};');
    }
    _$jscoverage['/compiler.js'].lineData[195]++;
    if (visit64_195_1(params)) {
      _$jscoverage['/compiler.js'].lineData[196]++;
      var paramsName = guid('params');
      _$jscoverage['/compiler.js'].lineData[197]++;
      source.push('var ' + paramsName + ' = [];');
      _$jscoverage['/compiler.js'].lineData[198]++;
      S.each(params, function(param) {
  _$jscoverage['/compiler.js'].functionData[11]++;
  _$jscoverage['/compiler.js'].lineData[199]++;
  var nextIdNameCode = self[param.type](param);
  _$jscoverage['/compiler.js'].lineData[200]++;
  if (visit65_200_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[201]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[202]++;
    source.push(paramsName + '.push(' + nextIdNameCode[0] + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[204]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[205]++;
    source.push(paramsName + '.push(' + lastOfArray(nextIdNameCode[1]) + ');');
  }
});
      _$jscoverage['/compiler.js'].lineData[208]++;
      source.push(configName + '.params=' + paramsName + ';');
    }
    _$jscoverage['/compiler.js'].lineData[211]++;
    if (visit66_211_1(hash)) {
      _$jscoverage['/compiler.js'].lineData[212]++;
      var hashName = guid('hash');
      _$jscoverage['/compiler.js'].lineData[213]++;
      source.push('var ' + hashName + ' = {};');
      _$jscoverage['/compiler.js'].lineData[214]++;
      S.each(hash.value, function(v, key) {
  _$jscoverage['/compiler.js'].functionData[12]++;
  _$jscoverage['/compiler.js'].lineData[215]++;
  var nextIdNameCode = self[v.type](v);
  _$jscoverage['/compiler.js'].lineData[216]++;
  if (visit67_216_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[217]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[218]++;
    source.push(hashName + '["' + key + '"] = ' + nextIdNameCode[0] + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[220]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[221]++;
    source.push(hashName + '["' + key + '"] = ' + lastOfArray(nextIdNameCode[1]) + ';');
  }
});
      _$jscoverage['/compiler.js'].lineData[224]++;
      source.push(configName + '.hash=' + hashName + ';');
    }
  }
  _$jscoverage['/compiler.js'].lineData[228]++;
  return [configName, source];
}, 
  conditionalOrExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[13]++;
  _$jscoverage['/compiler.js'].lineData[234]++;
  return this.genOpExpression(e, '||');
}, 
  conditionalAndExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[14]++;
  _$jscoverage['/compiler.js'].lineData[238]++;
  return this.genOpExpression(e, '&&');
}, 
  relationalExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[15]++;
  _$jscoverage['/compiler.js'].lineData[242]++;
  return this.genOpExpression(e, e.opType);
}, 
  equalityExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[16]++;
  _$jscoverage['/compiler.js'].lineData[246]++;
  return this.genOpExpression(e, e.opType);
}, 
  additiveExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[17]++;
  _$jscoverage['/compiler.js'].lineData[250]++;
  return this.genOpExpression(e, e.opType);
}, 
  multiplicativeExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[18]++;
  _$jscoverage['/compiler.js'].lineData[254]++;
  return this.genOpExpression(e, e.opType);
}, 
  unaryExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[19]++;
  _$jscoverage['/compiler.js'].lineData[258]++;
  var source = [], name, code = this[e.value.type](e.value);
  _$jscoverage['/compiler.js'].lineData[261]++;
  arrayPush.apply(source, code[1]);
  _$jscoverage['/compiler.js'].lineData[262]++;
  if (visit68_262_1(name = code[0])) {
    _$jscoverage['/compiler.js'].lineData[263]++;
    source.push(name + '=!' + name + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[265]++;
    source[source.length - 1] = '!' + lastOfArray(source);
  }
  _$jscoverage['/compiler.js'].lineData[267]++;
  return [name, source];
}, 
  'string': function(e) {
  _$jscoverage['/compiler.js'].functionData[20]++;
  _$jscoverage['/compiler.js'].lineData[272]++;
  return ['', ["'" + escapeString(e.value, true) + "'"]];
}, 
  'number': function(e) {
  _$jscoverage['/compiler.js'].functionData[21]++;
  _$jscoverage['/compiler.js'].lineData[276]++;
  return ['', [e.value]];
}, 
  'boolean': function(e) {
  _$jscoverage['/compiler.js'].functionData[22]++;
  _$jscoverage['/compiler.js'].lineData[280]++;
  return ['', [e.value]];
}, 
  'id': function(e, topLevel) {
  _$jscoverage['/compiler.js'].functionData[23]++;
  _$jscoverage['/compiler.js'].lineData[285]++;
  return this.genId(e, undefined, !topLevel);
}, 
  'block': function(block) {
  _$jscoverage['/compiler.js'].functionData[24]++;
  _$jscoverage['/compiler.js'].lineData[289]++;
  var programNode = block.program, source = [], self = this, tplNode = block.tpl, configNameCode = self.genConfig(tplNode), configName = configNameCode[0], tplPath = tplNode.path, pathString = tplPath.string, inverseFn;
  _$jscoverage['/compiler.js'].lineData[299]++;
  pushToArray(source, configNameCode[1]);
  _$jscoverage['/compiler.js'].lineData[301]++;
  if (visit69_301_1(!configName)) {
    _$jscoverage['/compiler.js'].lineData[302]++;
    configName = S.guid('config');
    _$jscoverage['/compiler.js'].lineData[303]++;
    source.push('var ' + configName + ' = {};');
  }
  _$jscoverage['/compiler.js'].lineData[306]++;
  source.push(configName + '.fn=' + self.genFunction(programNode.statements).join('\n') + ';');
  _$jscoverage['/compiler.js'].lineData[309]++;
  if (visit70_309_1(programNode.inverse)) {
    _$jscoverage['/compiler.js'].lineData[310]++;
    inverseFn = self.genFunction(programNode.inverse).join('\n');
    _$jscoverage['/compiler.js'].lineData[311]++;
    source.push(configName + '.inverse=' + inverseFn + ';');
  }
  _$jscoverage['/compiler.js'].lineData[316]++;
  if (visit71_316_1(tplNode.isInverted)) {
    _$jscoverage['/compiler.js'].lineData[317]++;
    var tmp = guid('inverse');
    _$jscoverage['/compiler.js'].lineData[318]++;
    source.push('var ' + tmp + '=' + configName + '.fn;');
    _$jscoverage['/compiler.js'].lineData[319]++;
    source.push(configName + '.fn = ' + configName + '.inverse;');
    _$jscoverage['/compiler.js'].lineData[320]++;
    source.push(configName + '.inverse = ' + tmp + ';');
  }
  _$jscoverage['/compiler.js'].lineData[323]++;
  if (visit72_323_1(!tplNode.hash && !tplNode.params)) {
    _$jscoverage['/compiler.js'].lineData[324]++;
    var parts = tplPath.parts;
    _$jscoverage['/compiler.js'].lineData[325]++;
    for (var i = 0; visit73_325_1(i < parts.length); i++) {
      _$jscoverage['/compiler.js'].lineData[327]++;
      if (visit74_327_1(typeof parts[i] != 'string')) {
        _$jscoverage['/compiler.js'].lineData[328]++;
        pathString = self.getIdStringFromIdParts(source, parts);
        _$jscoverage['/compiler.js'].lineData[329]++;
        break;
      }
    }
  }
  _$jscoverage['/compiler.js'].lineData[334]++;
  source.push('buffer += runBlockCommandUtil(engine, scopes, ' + configName + ', ' + '"' + pathString + '", ' + tplPath.lineNumber + ');');
  _$jscoverage['/compiler.js'].lineData[338]++;
  return source;
}, 
  'content': function(contentNode) {
  _$jscoverage['/compiler.js'].functionData[25]++;
  _$jscoverage['/compiler.js'].lineData[342]++;
  return ['buffer += \'' + escapeString(contentNode.value, false) + '\';'];
}, 
  'tpl': function(tplNode) {
  _$jscoverage['/compiler.js'].functionData[26]++;
  _$jscoverage['/compiler.js'].lineData[346]++;
  var source = [], genIdCode = this.genId(tplNode.path, tplNode);
  _$jscoverage['/compiler.js'].lineData[348]++;
  pushToArray(source, genIdCode[1]);
  _$jscoverage['/compiler.js'].lineData[349]++;
  source.push('buffer += ' + genIdCode[0] + ';');
  _$jscoverage['/compiler.js'].lineData[350]++;
  return source;
}, 
  'tplExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[27]++;
  _$jscoverage['/compiler.js'].lineData[354]++;
  var source = [], escaped = e.escaped, expressionOrVariable;
  _$jscoverage['/compiler.js'].lineData[357]++;
  var code = this[e.expression.type](e.expression, 1);
  _$jscoverage['/compiler.js'].lineData[358]++;
  if (visit75_358_1(code[0])) {
    _$jscoverage['/compiler.js'].lineData[359]++;
    pushToArray(source, code[1]);
    _$jscoverage['/compiler.js'].lineData[360]++;
    expressionOrVariable = code[0];
  } else {
    _$jscoverage['/compiler.js'].lineData[362]++;
    pushToArray(source, code[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[363]++;
    expressionOrVariable = lastOfArray(code[1]);
  }
  _$jscoverage['/compiler.js'].lineData[365]++;
  source.push('buffer += getExpressionUtil(' + expressionOrVariable + ',' + escaped + ');');
  _$jscoverage['/compiler.js'].lineData[366]++;
  return source;
}, 
  'getIdStringFromIdParts': function(source, idParts) {
  _$jscoverage['/compiler.js'].functionData[28]++;
  _$jscoverage['/compiler.js'].lineData[371]++;
  var idString = '', self = this, i, idPart, idPartType, nextIdNameCode, first = true;
  _$jscoverage['/compiler.js'].lineData[378]++;
  for (i = 0; visit76_378_1(i < idParts.length); i++) {
    _$jscoverage['/compiler.js'].lineData[379]++;
    idPart = idParts[i];
    _$jscoverage['/compiler.js'].lineData[380]++;
    idPartType = idPart.type;
    _$jscoverage['/compiler.js'].lineData[381]++;
    if (visit77_381_1(!first)) {
      _$jscoverage['/compiler.js'].lineData[382]++;
      idString += '.';
    }
    _$jscoverage['/compiler.js'].lineData[384]++;
    if (visit78_384_1(idPartType)) {
      _$jscoverage['/compiler.js'].lineData[385]++;
      nextIdNameCode = self[idPartType](idPart);
      _$jscoverage['/compiler.js'].lineData[386]++;
      if (visit79_386_1(nextIdNameCode[0])) {
        _$jscoverage['/compiler.js'].lineData[387]++;
        pushToArray(source, nextIdNameCode[1]);
        _$jscoverage['/compiler.js'].lineData[388]++;
        idString += '"+' + nextIdNameCode[0] + '+"';
        _$jscoverage['/compiler.js'].lineData[389]++;
        first = true;
      }
    } else {
      _$jscoverage['/compiler.js'].lineData[393]++;
      idString += idPart;
      _$jscoverage['/compiler.js'].lineData[394]++;
      first = false;
    }
  }
  _$jscoverage['/compiler.js'].lineData[397]++;
  return idString;
}};
  _$jscoverage['/compiler.js'].lineData[401]++;
  var compiler;
  _$jscoverage['/compiler.js'].lineData[408]++;
  return compiler = {
  parse: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[29]++;
  _$jscoverage['/compiler.js'].lineData[415]++;
  return parser.parse(tpl);
}, 
  compileToStr: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[30]++;
  _$jscoverage['/compiler.js'].lineData[423]++;
  var func = this.compile(tpl);
  _$jscoverage['/compiler.js'].lineData[424]++;
  return 'function(' + func.params.join(',') + '){\n' + func.source.join('\n') + '}';
}, 
  compile: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[31]++;
  _$jscoverage['/compiler.js'].lineData[434]++;
  var root = this.parse(tpl);
  _$jscoverage['/compiler.js'].lineData[435]++;
  variableId = 0;
  _$jscoverage['/compiler.js'].lineData[436]++;
  return gen.genFunction(root.statements, true);
}, 
  compileToFn: function(tpl, config) {
  _$jscoverage['/compiler.js'].functionData[32]++;
  _$jscoverage['/compiler.js'].lineData[446]++;
  var code = compiler.compile(tpl);
  _$jscoverage['/compiler.js'].lineData[447]++;
  config = visit80_447_1(config || {});
  _$jscoverage['/compiler.js'].lineData[448]++;
  var sourceURL = 'sourceURL=' + (config.name ? config.name : ('xtemplate' + (xtemplateId++))) + '.js';
  _$jscoverage['/compiler.js'].lineData[453]++;
  return Function.apply(null, [].concat(code.params).concat(code.source.join('\n') + '\n//@ ' + sourceURL + '\n//# ' + sourceURL));
}};
}, {
  requires: ['./compiler/parser', './compiler/ast', 'xtemplate/runtime']});
