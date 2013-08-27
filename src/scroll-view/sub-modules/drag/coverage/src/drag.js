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
if (! _$jscoverage['/drag.js']) {
  _$jscoverage['/drag.js'] = {};
  _$jscoverage['/drag.js'].lineData = [];
  _$jscoverage['/drag.js'].lineData[5] = 0;
  _$jscoverage['/drag.js'].lineData[6] = 0;
  _$jscoverage['/drag.js'].lineData[8] = 0;
  _$jscoverage['/drag.js'].lineData[10] = 0;
  _$jscoverage['/drag.js'].lineData[12] = 0;
  _$jscoverage['/drag.js'].lineData[14] = 0;
  _$jscoverage['/drag.js'].lineData[15] = 0;
  _$jscoverage['/drag.js'].lineData[17] = 0;
  _$jscoverage['/drag.js'].lineData[18] = 0;
  _$jscoverage['/drag.js'].lineData[19] = 0;
  _$jscoverage['/drag.js'].lineData[22] = 0;
  _$jscoverage['/drag.js'].lineData[23] = 0;
  _$jscoverage['/drag.js'].lineData[24] = 0;
  _$jscoverage['/drag.js'].lineData[26] = 0;
  _$jscoverage['/drag.js'].lineData[28] = 0;
  _$jscoverage['/drag.js'].lineData[39] = 0;
  _$jscoverage['/drag.js'].lineData[40] = 0;
  _$jscoverage['/drag.js'].lineData[41] = 0;
  _$jscoverage['/drag.js'].lineData[44] = 0;
  _$jscoverage['/drag.js'].lineData[45] = 0;
  _$jscoverage['/drag.js'].lineData[48] = 0;
  _$jscoverage['/drag.js'].lineData[49] = 0;
  _$jscoverage['/drag.js'].lineData[50] = 0;
  _$jscoverage['/drag.js'].lineData[51] = 0;
  _$jscoverage['/drag.js'].lineData[52] = 0;
  _$jscoverage['/drag.js'].lineData[53] = 0;
  _$jscoverage['/drag.js'].lineData[54] = 0;
  _$jscoverage['/drag.js'].lineData[55] = 0;
  _$jscoverage['/drag.js'].lineData[58] = 0;
  _$jscoverage['/drag.js'].lineData[61] = 0;
  _$jscoverage['/drag.js'].lineData[63] = 0;
  _$jscoverage['/drag.js'].lineData[64] = 0;
  _$jscoverage['/drag.js'].lineData[68] = 0;
  _$jscoverage['/drag.js'].lineData[69] = 0;
  _$jscoverage['/drag.js'].lineData[71] = 0;
  _$jscoverage['/drag.js'].lineData[74] = 0;
  _$jscoverage['/drag.js'].lineData[75] = 0;
  _$jscoverage['/drag.js'].lineData[76] = 0;
  _$jscoverage['/drag.js'].lineData[77] = 0;
  _$jscoverage['/drag.js'].lineData[79] = 0;
  _$jscoverage['/drag.js'].lineData[82] = 0;
  _$jscoverage['/drag.js'].lineData[83] = 0;
  _$jscoverage['/drag.js'].lineData[84] = 0;
  _$jscoverage['/drag.js'].lineData[85] = 0;
  _$jscoverage['/drag.js'].lineData[87] = 0;
  _$jscoverage['/drag.js'].lineData[96] = 0;
  _$jscoverage['/drag.js'].lineData[97] = 0;
  _$jscoverage['/drag.js'].lineData[98] = 0;
  _$jscoverage['/drag.js'].lineData[99] = 0;
  _$jscoverage['/drag.js'].lineData[101] = 0;
  _$jscoverage['/drag.js'].lineData[102] = 0;
  _$jscoverage['/drag.js'].lineData[103] = 0;
  _$jscoverage['/drag.js'].lineData[104] = 0;
  _$jscoverage['/drag.js'].lineData[110] = 0;
  _$jscoverage['/drag.js'].lineData[113] = 0;
  _$jscoverage['/drag.js'].lineData[114] = 0;
  _$jscoverage['/drag.js'].lineData[115] = 0;
  _$jscoverage['/drag.js'].lineData[118] = 0;
  _$jscoverage['/drag.js'].lineData[119] = 0;
  _$jscoverage['/drag.js'].lineData[123] = 0;
  _$jscoverage['/drag.js'].lineData[124] = 0;
  _$jscoverage['/drag.js'].lineData[125] = 0;
  _$jscoverage['/drag.js'].lineData[131] = 0;
  _$jscoverage['/drag.js'].lineData[133] = 0;
  _$jscoverage['/drag.js'].lineData[138] = 0;
  _$jscoverage['/drag.js'].lineData[146] = 0;
  _$jscoverage['/drag.js'].lineData[153] = 0;
  _$jscoverage['/drag.js'].lineData[154] = 0;
  _$jscoverage['/drag.js'].lineData[155] = 0;
  _$jscoverage['/drag.js'].lineData[156] = 0;
  _$jscoverage['/drag.js'].lineData[157] = 0;
  _$jscoverage['/drag.js'].lineData[159] = 0;
  _$jscoverage['/drag.js'].lineData[161] = 0;
  _$jscoverage['/drag.js'].lineData[162] = 0;
  _$jscoverage['/drag.js'].lineData[163] = 0;
  _$jscoverage['/drag.js'].lineData[164] = 0;
  _$jscoverage['/drag.js'].lineData[165] = 0;
  _$jscoverage['/drag.js'].lineData[170] = 0;
  _$jscoverage['/drag.js'].lineData[171] = 0;
  _$jscoverage['/drag.js'].lineData[175] = 0;
  _$jscoverage['/drag.js'].lineData[177] = 0;
  _$jscoverage['/drag.js'].lineData[178] = 0;
  _$jscoverage['/drag.js'].lineData[180] = 0;
  _$jscoverage['/drag.js'].lineData[181] = 0;
  _$jscoverage['/drag.js'].lineData[183] = 0;
  _$jscoverage['/drag.js'].lineData[184] = 0;
  _$jscoverage['/drag.js'].lineData[185] = 0;
  _$jscoverage['/drag.js'].lineData[187] = 0;
  _$jscoverage['/drag.js'].lineData[188] = 0;
  _$jscoverage['/drag.js'].lineData[194] = 0;
  _$jscoverage['/drag.js'].lineData[196] = 0;
  _$jscoverage['/drag.js'].lineData[198] = 0;
  _$jscoverage['/drag.js'].lineData[200] = 0;
  _$jscoverage['/drag.js'].lineData[204] = 0;
  _$jscoverage['/drag.js'].lineData[205] = 0;
  _$jscoverage['/drag.js'].lineData[206] = 0;
  _$jscoverage['/drag.js'].lineData[208] = 0;
  _$jscoverage['/drag.js'].lineData[213] = 0;
  _$jscoverage['/drag.js'].lineData[214] = 0;
  _$jscoverage['/drag.js'].lineData[215] = 0;
  _$jscoverage['/drag.js'].lineData[216] = 0;
  _$jscoverage['/drag.js'].lineData[217] = 0;
  _$jscoverage['/drag.js'].lineData[218] = 0;
  _$jscoverage['/drag.js'].lineData[219] = 0;
  _$jscoverage['/drag.js'].lineData[228] = 0;
  _$jscoverage['/drag.js'].lineData[230] = 0;
  _$jscoverage['/drag.js'].lineData[231] = 0;
  _$jscoverage['/drag.js'].lineData[232] = 0;
  _$jscoverage['/drag.js'].lineData[233] = 0;
  _$jscoverage['/drag.js'].lineData[234] = 0;
  _$jscoverage['/drag.js'].lineData[235] = 0;
  _$jscoverage['/drag.js'].lineData[239] = 0;
  _$jscoverage['/drag.js'].lineData[242] = 0;
  _$jscoverage['/drag.js'].lineData[243] = 0;
  _$jscoverage['/drag.js'].lineData[246] = 0;
  _$jscoverage['/drag.js'].lineData[247] = 0;
  _$jscoverage['/drag.js'].lineData[250] = 0;
  _$jscoverage['/drag.js'].lineData[254] = 0;
  _$jscoverage['/drag.js'].lineData[255] = 0;
  _$jscoverage['/drag.js'].lineData[257] = 0;
  _$jscoverage['/drag.js'].lineData[258] = 0;
  _$jscoverage['/drag.js'].lineData[265] = 0;
  _$jscoverage['/drag.js'].lineData[266] = 0;
  _$jscoverage['/drag.js'].lineData[267] = 0;
  _$jscoverage['/drag.js'].lineData[270] = 0;
  _$jscoverage['/drag.js'].lineData[271] = 0;
  _$jscoverage['/drag.js'].lineData[272] = 0;
  _$jscoverage['/drag.js'].lineData[276] = 0;
  _$jscoverage['/drag.js'].lineData[277] = 0;
  _$jscoverage['/drag.js'].lineData[279] = 0;
  _$jscoverage['/drag.js'].lineData[280] = 0;
  _$jscoverage['/drag.js'].lineData[283] = 0;
  _$jscoverage['/drag.js'].lineData[289] = 0;
  _$jscoverage['/drag.js'].lineData[290] = 0;
  _$jscoverage['/drag.js'].lineData[291] = 0;
  _$jscoverage['/drag.js'].lineData[292] = 0;
  _$jscoverage['/drag.js'].lineData[293] = 0;
  _$jscoverage['/drag.js'].lineData[294] = 0;
  _$jscoverage['/drag.js'].lineData[296] = 0;
  _$jscoverage['/drag.js'].lineData[297] = 0;
  _$jscoverage['/drag.js'].lineData[298] = 0;
  _$jscoverage['/drag.js'].lineData[299] = 0;
  _$jscoverage['/drag.js'].lineData[300] = 0;
  _$jscoverage['/drag.js'].lineData[302] = 0;
  _$jscoverage['/drag.js'].lineData[307] = 0;
  _$jscoverage['/drag.js'].lineData[308] = 0;
  _$jscoverage['/drag.js'].lineData[309] = 0;
  _$jscoverage['/drag.js'].lineData[310] = 0;
  _$jscoverage['/drag.js'].lineData[311] = 0;
  _$jscoverage['/drag.js'].lineData[319] = 0;
  _$jscoverage['/drag.js'].lineData[320] = 0;
  _$jscoverage['/drag.js'].lineData[321] = 0;
  _$jscoverage['/drag.js'].lineData[324] = 0;
  _$jscoverage['/drag.js'].lineData[325] = 0;
  _$jscoverage['/drag.js'].lineData[326] = 0;
  _$jscoverage['/drag.js'].lineData[327] = 0;
  _$jscoverage['/drag.js'].lineData[328] = 0;
  _$jscoverage['/drag.js'].lineData[329] = 0;
  _$jscoverage['/drag.js'].lineData[331] = 0;
  _$jscoverage['/drag.js'].lineData[337] = 0;
  _$jscoverage['/drag.js'].lineData[339] = 0;
  _$jscoverage['/drag.js'].lineData[341] = 0;
  _$jscoverage['/drag.js'].lineData[342] = 0;
  _$jscoverage['/drag.js'].lineData[343] = 0;
  _$jscoverage['/drag.js'].lineData[345] = 0;
  _$jscoverage['/drag.js'].lineData[349] = 0;
  _$jscoverage['/drag.js'].lineData[350] = 0;
  _$jscoverage['/drag.js'].lineData[351] = 0;
  _$jscoverage['/drag.js'].lineData[353] = 0;
  _$jscoverage['/drag.js'].lineData[354] = 0;
  _$jscoverage['/drag.js'].lineData[355] = 0;
  _$jscoverage['/drag.js'].lineData[356] = 0;
  _$jscoverage['/drag.js'].lineData[359] = 0;
  _$jscoverage['/drag.js'].lineData[360] = 0;
  _$jscoverage['/drag.js'].lineData[361] = 0;
  _$jscoverage['/drag.js'].lineData[362] = 0;
  _$jscoverage['/drag.js'].lineData[363] = 0;
  _$jscoverage['/drag.js'].lineData[364] = 0;
  _$jscoverage['/drag.js'].lineData[365] = 0;
  _$jscoverage['/drag.js'].lineData[366] = 0;
  _$jscoverage['/drag.js'].lineData[371] = 0;
  _$jscoverage['/drag.js'].lineData[372] = 0;
  _$jscoverage['/drag.js'].lineData[373] = 0;
  _$jscoverage['/drag.js'].lineData[374] = 0;
  _$jscoverage['/drag.js'].lineData[375] = 0;
  _$jscoverage['/drag.js'].lineData[376] = 0;
  _$jscoverage['/drag.js'].lineData[381] = 0;
  _$jscoverage['/drag.js'].lineData[382] = 0;
  _$jscoverage['/drag.js'].lineData[383] = 0;
  _$jscoverage['/drag.js'].lineData[385] = 0;
  _$jscoverage['/drag.js'].lineData[386] = 0;
  _$jscoverage['/drag.js'].lineData[389] = 0;
  _$jscoverage['/drag.js'].lineData[392] = 0;
  _$jscoverage['/drag.js'].lineData[393] = 0;
  _$jscoverage['/drag.js'].lineData[396] = 0;
  _$jscoverage['/drag.js'].lineData[398] = 0;
  _$jscoverage['/drag.js'].lineData[399] = 0;
  _$jscoverage['/drag.js'].lineData[406] = 0;
  _$jscoverage['/drag.js'].lineData[407] = 0;
  _$jscoverage['/drag.js'].lineData[410] = 0;
  _$jscoverage['/drag.js'].lineData[411] = 0;
  _$jscoverage['/drag.js'].lineData[413] = 0;
  _$jscoverage['/drag.js'].lineData[415] = 0;
  _$jscoverage['/drag.js'].lineData[420] = 0;
  _$jscoverage['/drag.js'].lineData[422] = 0;
  _$jscoverage['/drag.js'].lineData[424] = 0;
  _$jscoverage['/drag.js'].lineData[427] = 0;
  _$jscoverage['/drag.js'].lineData[429] = 0;
  _$jscoverage['/drag.js'].lineData[432] = 0;
  _$jscoverage['/drag.js'].lineData[433] = 0;
  _$jscoverage['/drag.js'].lineData[443] = 0;
  _$jscoverage['/drag.js'].lineData[447] = 0;
  _$jscoverage['/drag.js'].lineData[451] = 0;
  _$jscoverage['/drag.js'].lineData[452] = 0;
  _$jscoverage['/drag.js'].lineData[456] = 0;
  _$jscoverage['/drag.js'].lineData[459] = 0;
  _$jscoverage['/drag.js'].lineData[463] = 0;
}
if (! _$jscoverage['/drag.js'].functionData) {
  _$jscoverage['/drag.js'].functionData = [];
  _$jscoverage['/drag.js'].functionData[0] = 0;
  _$jscoverage['/drag.js'].functionData[1] = 0;
  _$jscoverage['/drag.js'].functionData[2] = 0;
  _$jscoverage['/drag.js'].functionData[3] = 0;
  _$jscoverage['/drag.js'].functionData[4] = 0;
  _$jscoverage['/drag.js'].functionData[5] = 0;
  _$jscoverage['/drag.js'].functionData[6] = 0;
  _$jscoverage['/drag.js'].functionData[7] = 0;
  _$jscoverage['/drag.js'].functionData[8] = 0;
  _$jscoverage['/drag.js'].functionData[9] = 0;
  _$jscoverage['/drag.js'].functionData[10] = 0;
  _$jscoverage['/drag.js'].functionData[11] = 0;
  _$jscoverage['/drag.js'].functionData[12] = 0;
  _$jscoverage['/drag.js'].functionData[13] = 0;
  _$jscoverage['/drag.js'].functionData[14] = 0;
  _$jscoverage['/drag.js'].functionData[15] = 0;
  _$jscoverage['/drag.js'].functionData[16] = 0;
  _$jscoverage['/drag.js'].functionData[17] = 0;
  _$jscoverage['/drag.js'].functionData[18] = 0;
  _$jscoverage['/drag.js'].functionData[19] = 0;
  _$jscoverage['/drag.js'].functionData[20] = 0;
  _$jscoverage['/drag.js'].functionData[21] = 0;
}
if (! _$jscoverage['/drag.js'].branchData) {
  _$jscoverage['/drag.js'].branchData = {};
  _$jscoverage['/drag.js'].branchData['23'] = [];
  _$jscoverage['/drag.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['26'] = [];
  _$jscoverage['/drag.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['39'] = [];
  _$jscoverage['/drag.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['40'] = [];
  _$jscoverage['/drag.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['41'] = [];
  _$jscoverage['/drag.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['44'] = [];
  _$jscoverage['/drag.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['48'] = [];
  _$jscoverage['/drag.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['52'] = [];
  _$jscoverage['/drag.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['61'] = [];
  _$jscoverage['/drag.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['61'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['61'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['61'][4] = new BranchData();
  _$jscoverage['/drag.js'].branchData['62'] = [];
  _$jscoverage['/drag.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['62'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['75'] = [];
  _$jscoverage['/drag.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['76'] = [];
  _$jscoverage['/drag.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['83'] = [];
  _$jscoverage['/drag.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['96'] = [];
  _$jscoverage['/drag.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['98'] = [];
  _$jscoverage['/drag.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['101'] = [];
  _$jscoverage['/drag.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['113'] = [];
  _$jscoverage['/drag.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['123'] = [];
  _$jscoverage['/drag.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['123'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['123'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['170'] = [];
  _$jscoverage['/drag.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['178'] = [];
  _$jscoverage['/drag.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['178'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['178'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['180'] = [];
  _$jscoverage['/drag.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['194'] = [];
  _$jscoverage['/drag.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['205'] = [];
  _$jscoverage['/drag.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['216'] = [];
  _$jscoverage['/drag.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['246'] = [];
  _$jscoverage['/drag.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['254'] = [];
  _$jscoverage['/drag.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['257'] = [];
  _$jscoverage['/drag.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['258'] = [];
  _$jscoverage['/drag.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['265'] = [];
  _$jscoverage['/drag.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['265'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['265'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['270'] = [];
  _$jscoverage['/drag.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['270'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['270'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['293'] = [];
  _$jscoverage['/drag.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['299'] = [];
  _$jscoverage['/drag.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['299'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['300'] = [];
  _$jscoverage['/drag.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['300'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['309'] = [];
  _$jscoverage['/drag.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['319'] = [];
  _$jscoverage['/drag.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['341'] = [];
  _$jscoverage['/drag.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['342'] = [];
  _$jscoverage['/drag.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['350'] = [];
  _$jscoverage['/drag.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['353'] = [];
  _$jscoverage['/drag.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['353'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['353'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['355'] = [];
  _$jscoverage['/drag.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['355'][2] = new BranchData();
  _$jscoverage['/drag.js'].branchData['355'][3] = new BranchData();
  _$jscoverage['/drag.js'].branchData['360'] = [];
  _$jscoverage['/drag.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['363'] = [];
  _$jscoverage['/drag.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['364'] = [];
  _$jscoverage['/drag.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['373'] = [];
  _$jscoverage['/drag.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['374'] = [];
  _$jscoverage['/drag.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['381'] = [];
  _$jscoverage['/drag.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['382'] = [];
  _$jscoverage['/drag.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['392'] = [];
  _$jscoverage['/drag.js'].branchData['392'][1] = new BranchData();
}
_$jscoverage['/drag.js'].branchData['392'][1].init(30, 16, 'allowX || allowY');
function visit66_392_1(result) {
  _$jscoverage['/drag.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['382'][1].init(34, 25, 'newPageIndex != pageIndex');
function visit65_382_1(result) {
  _$jscoverage['/drag.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['381'][1].init(1908, 25, 'newPageIndex != undefined');
function visit64_381_1(result) {
  _$jscoverage['/drag.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['374'][1].init(42, 23, 'min < nowXY.top - x.top');
function visit63_374_1(result) {
  _$jscoverage['/drag.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['373'][1].init(38, 17, 'x.top < nowXY.top');
function visit62_373_1(result) {
  _$jscoverage['/drag.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['364'][1].init(42, 23, 'min < x.top - nowXY.top');
function visit61_364_1(result) {
  _$jscoverage['/drag.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['363'][1].init(38, 17, 'x.top > nowXY.top');
function visit60_363_1(result) {
  _$jscoverage['/drag.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['360'][1].init(833, 11, 'offsetY > 0');
function visit59_360_1(result) {
  _$jscoverage['/drag.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['355'][3].init(305, 24, 'offset.left < nowXY.left');
function visit58_355_3(result) {
  _$jscoverage['/drag.js'].branchData['355'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['355'][2].init(290, 11, 'offsetX < 0');
function visit57_355_2(result) {
  _$jscoverage['/drag.js'].branchData['355'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['355'][1].init(290, 39, 'offsetX < 0 && offset.left < nowXY.left');
function visit56_355_1(result) {
  _$jscoverage['/drag.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['353'][3].init(165, 24, 'offset.left > nowXY.left');
function visit55_353_3(result) {
  _$jscoverage['/drag.js'].branchData['353'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['353'][2].init(150, 11, 'offsetX > 0');
function visit54_353_2(result) {
  _$jscoverage['/drag.js'].branchData['353'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['353'][1].init(150, 39, 'offsetX > 0 && offset.left > nowXY.left');
function visit53_353_1(result) {
  _$jscoverage['/drag.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['350'][1].init(34, 7, '!offset');
function visit52_350_1(result) {
  _$jscoverage['/drag.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['342'][1].init(26, 16, 'allowX && allowY');
function visit51_342_1(result) {
  _$jscoverage['/drag.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['341'][1].init(1116, 16, 'allowX || allowY');
function visit50_341_1(result) {
  _$jscoverage['/drag.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['319'][1].init(345, 17, '!self.pagesOffset');
function visit49_319_1(result) {
  _$jscoverage['/drag.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['309'][1].init(40, 10, 'count == 2');
function visit48_309_1(result) {
  _$jscoverage['/drag.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['300'][2].init(452, 33, 'Math.abs(offsetY) > snapThreshold');
function visit47_300_2(result) {
  _$jscoverage['/drag.js'].branchData['300'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['300'][1].init(428, 57, 'self.allowScroll.top && Math.abs(offsetY) > snapThreshold');
function visit46_300_1(result) {
  _$jscoverage['/drag.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['299'][2].init(371, 33, 'Math.abs(offsetX) > snapThreshold');
function visit45_299_2(result) {
  _$jscoverage['/drag.js'].branchData['299'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['299'][1].init(346, 58, 'self.allowScroll.left && Math.abs(offsetX) > snapThreshold');
function visit44_299_1(result) {
  _$jscoverage['/drag.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['293'][1].init(113, 14, '!startMousePos');
function visit43_293_1(result) {
  _$jscoverage['/drag.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['270'][3].init(563, 26, 'dragInitDirection == \'top\'');
function visit42_270_3(result) {
  _$jscoverage['/drag.js'].branchData['270'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['270'][2].init(563, 66, 'dragInitDirection == \'top\' && !self.allowScroll[dragInitDirection]');
function visit41_270_2(result) {
  _$jscoverage['/drag.js'].branchData['270'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['270'][1].init(554, 75, 'lockY && dragInitDirection == \'top\' && !self.allowScroll[dragInitDirection]');
function visit40_270_1(result) {
  _$jscoverage['/drag.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['265'][3].init(387, 27, 'dragInitDirection == \'left\'');
function visit39_265_3(result) {
  _$jscoverage['/drag.js'].branchData['265'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['265'][2].init(387, 67, 'dragInitDirection == \'left\' && !self.allowScroll[dragInitDirection]');
function visit38_265_2(result) {
  _$jscoverage['/drag.js'].branchData['265'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['265'][1].init(378, 76, 'lockX && dragInitDirection == \'left\' && !self.allowScroll[dragInitDirection]');
function visit37_265_1(result) {
  _$jscoverage['/drag.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['258'][1].init(-1, 158, 'Math.abs(e.pageX - startMousePos.left) > Math.abs(e.pageY - startMousePos.top)');
function visit36_258_1(result) {
  _$jscoverage['/drag.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['257'][1].init(56, 45, '!(dragInitDirection = self.dragInitDirection)');
function visit35_257_1(result) {
  _$jscoverage['/drag.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['254'][1].init(320, 14, 'lockX || lockY');
function visit34_254_1(result) {
  _$jscoverage['/drag.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['246'][1].init(91, 14, '!startMousePos');
function visit33_246_1(result) {
  _$jscoverage['/drag.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['216'][1].init(71, 16, 'self.isScrolling');
function visit32_216_1(result) {
  _$jscoverage['/drag.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['205'][1].init(351, 11, 'value === 0');
function visit31_205_1(result) {
  _$jscoverage['/drag.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['194'][1].init(1149, 18, 'value <= minScroll');
function visit30_194_1(result) {
  _$jscoverage['/drag.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['180'][1].init(58, 22, 'fx.lastValue === value');
function visit29_180_1(result) {
  _$jscoverage['/drag.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['178'][3].init(396, 17, 'value < maxScroll');
function visit28_178_3(result) {
  _$jscoverage['/drag.js'].branchData['178'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['178'][2].init(375, 17, 'value > minScroll');
function visit27_178_2(result) {
  _$jscoverage['/drag.js'].branchData['178'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['178'][1].init(375, 38, 'value > minScroll && value < maxScroll');
function visit26_178_1(result) {
  _$jscoverage['/drag.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['170'][1].init(132, 7, 'inertia');
function visit25_170_1(result) {
  _$jscoverage['/drag.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['123'][3].init(1317, 13, 'distance == 0');
function visit24_123_3(result) {
  _$jscoverage['/drag.js'].branchData['123'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['123'][2].init(1300, 13, 'duration == 0');
function visit23_123_2(result) {
  _$jscoverage['/drag.js'].branchData['123'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['123'][1].init(1300, 30, 'duration == 0 || distance == 0');
function visit22_123_1(result) {
  _$jscoverage['/drag.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['113'][1].init(1037, 16, 'self.pagesOffset');
function visit21_113_1(result) {
  _$jscoverage['/drag.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['101'][1].init(657, 19, 'bound !== undefined');
function visit20_101_1(result) {
  _$jscoverage['/drag.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['98'][1].init(556, 30, 'scroll > maxScroll[scrollType]');
function visit19_98_1(result) {
  _$jscoverage['/drag.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['96'][1].init(457, 30, 'scroll < minScroll[scrollType]');
function visit18_96_1(result) {
  _$jscoverage['/drag.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['83'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit17_83_1(result) {
  _$jscoverage['/drag.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['76'][1].init(78, 49, '!self.allowScroll[scrollType] && self.get(lockXY)');
function visit16_76_1(result) {
  _$jscoverage['/drag.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['75'][1].init(23, 20, 'scrollType == \'left\'');
function visit15_75_1(result) {
  _$jscoverage['/drag.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['62'][2].init(118, 32, 'timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit14_62_2(result) {
  _$jscoverage['/drag.js'].branchData['62'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['62'][1].init(55, 39, 'lastDirection[scrollType] !== direction');
function visit13_62_1(result) {
  _$jscoverage['/drag.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['61'][4].init(1550, 39, 'lastDirection[scrollType] !== undefined');
function visit12_61_4(result) {
  _$jscoverage['/drag.js'].branchData['61'][4].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['61'][3].init(1550, 95, 'lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit11_61_3(result) {
  _$jscoverage['/drag.js'].branchData['61'][3].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['61'][2].init(1530, 115, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction');
function visit10_61_2(result) {
  _$jscoverage['/drag.js'].branchData['61'][2].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['61'][1].init(1530, 151, '!eqWithLastPoint && lastDirection[scrollType] !== undefined && lastDirection[scrollType] !== direction || timeDiff > SWIPE_SAMPLE_INTERVAL');
function visit9_61_1(result) {
  _$jscoverage['/drag.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['52'][1].init(1234, 30, 'scroll > maxScroll[scrollType]');
function visit8_52_1(result) {
  _$jscoverage['/drag.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['48'][1].init(1030, 30, 'scroll < minScroll[scrollType]');
function visit7_48_1(result) {
  _$jscoverage['/drag.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['44'][1].init(885, 19, '!self.get(\'bounce\')');
function visit6_44_1(result) {
  _$jscoverage['/drag.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['41'][1].init(116, 59, '(e[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0');
function visit5_41_1(result) {
  _$jscoverage['/drag.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['40'][1].init(32, 55, 'e[pageOffsetProperty] == lastPageXY[pageOffsetProperty]');
function visit4_40_1(result) {
  _$jscoverage['/drag.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['39'][1].init(649, 30, 'lastPageXY[pageOffsetProperty]');
function visit3_39_1(result) {
  _$jscoverage['/drag.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['26'][1].init(112, 20, 'scrollType == \'left\'');
function visit2_26_1(result) {
  _$jscoverage['/drag.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['23'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit1_23_1(result) {
  _$jscoverage['/drag.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].lineData[5]++;
KISSY.add('scroll-view/drag', function(S, ScrollViewBase, DD, Node) {
  _$jscoverage['/drag.js'].functionData[0]++;
  _$jscoverage['/drag.js'].lineData[6]++;
  var OUT_OF_BOUND_FACTOR = 0.5;
  _$jscoverage['/drag.js'].lineData[8]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/drag.js'].lineData[10]++;
  var SWIPE_SAMPLE_INTERVAL = 300;
  _$jscoverage['/drag.js'].lineData[12]++;
  var MAX_SWIPE_VELOCITY = 6;
  _$jscoverage['/drag.js'].lineData[14]++;
  function onDragStart(self, e, scrollType) {
    _$jscoverage['/drag.js'].functionData[1]++;
    _$jscoverage['/drag.js'].lineData[15]++;
    var now = e.timeStamp, scroll = self.get('scroll' + S.ucfirst(scrollType));
    _$jscoverage['/drag.js'].lineData[17]++;
    self.startScroll[scrollType] = scroll;
    _$jscoverage['/drag.js'].lineData[18]++;
    self.swipe[scrollType].startTime = now;
    _$jscoverage['/drag.js'].lineData[19]++;
    self.swipe[scrollType].scroll = scroll;
  }
  _$jscoverage['/drag.js'].lineData[22]++;
  function onDragScroll(self, e, scrollType, startMousePos) {
    _$jscoverage['/drag.js'].functionData[2]++;
    _$jscoverage['/drag.js'].lineData[23]++;
    if (visit1_23_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/drag.js'].lineData[24]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[26]++;
    var pageOffsetProperty = visit2_26_1(scrollType == 'left') ? 'pageX' : 'pageY', lastPageXY = self.lastPageXY;
    _$jscoverage['/drag.js'].lineData[28]++;
    var diff = e[pageOffsetProperty] - startMousePos[scrollType], eqWithLastPoint, scroll = self.startScroll[scrollType] - diff, bound, now = e.timeStamp, minScroll = self.minScroll, maxScroll = self.maxScroll, lastDirection = self.lastDirection, swipe = self.swipe, direction;
    _$jscoverage['/drag.js'].lineData[39]++;
    if (visit3_39_1(lastPageXY[pageOffsetProperty])) {
      _$jscoverage['/drag.js'].lineData[40]++;
      eqWithLastPoint = visit4_40_1(e[pageOffsetProperty] == lastPageXY[pageOffsetProperty]);
      _$jscoverage['/drag.js'].lineData[41]++;
      direction = visit5_41_1((e[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0);
    }
    _$jscoverage['/drag.js'].lineData[44]++;
    if (visit6_44_1(!self.get('bounce'))) {
      _$jscoverage['/drag.js'].lineData[45]++;
      scroll = Math.min(Math.max(scroll, minScroll[scrollType]), maxScroll[scrollType]);
    }
    _$jscoverage['/drag.js'].lineData[48]++;
    if (visit7_48_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/drag.js'].lineData[49]++;
      bound = minScroll[scrollType] - scroll;
      _$jscoverage['/drag.js'].lineData[50]++;
      bound *= OUT_OF_BOUND_FACTOR;
      _$jscoverage['/drag.js'].lineData[51]++;
      scroll = minScroll[scrollType] - bound;
    } else {
      _$jscoverage['/drag.js'].lineData[52]++;
      if (visit8_52_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/drag.js'].lineData[53]++;
        bound = scroll - maxScroll[scrollType];
        _$jscoverage['/drag.js'].lineData[54]++;
        bound *= OUT_OF_BOUND_FACTOR;
        _$jscoverage['/drag.js'].lineData[55]++;
        scroll = maxScroll[scrollType] + bound;
      }
    }
    _$jscoverage['/drag.js'].lineData[58]++;
    var timeDiff = (now - swipe[scrollType].startTime);
    _$jscoverage['/drag.js'].lineData[61]++;
    if (visit9_61_1(visit10_61_2(!eqWithLastPoint && visit11_61_3(visit12_61_4(lastDirection[scrollType] !== undefined) && visit13_62_1(lastDirection[scrollType] !== direction))) || visit14_62_2(timeDiff > SWIPE_SAMPLE_INTERVAL))) {
      _$jscoverage['/drag.js'].lineData[63]++;
      swipe[scrollType].startTime = now;
      _$jscoverage['/drag.js'].lineData[64]++;
      swipe[scrollType].scroll = scroll;
    }
    _$jscoverage['/drag.js'].lineData[68]++;
    self.set('scroll' + S.ucfirst(scrollType), scroll);
    _$jscoverage['/drag.js'].lineData[69]++;
    lastDirection[scrollType] = direction;
    _$jscoverage['/drag.js'].lineData[71]++;
    lastPageXY[pageOffsetProperty] = e[pageOffsetProperty];
  }
  _$jscoverage['/drag.js'].lineData[74]++;
  function forbidDrag(self, scrollType) {
    _$jscoverage['/drag.js'].functionData[3]++;
    _$jscoverage['/drag.js'].lineData[75]++;
    var lockXY = visit15_75_1(scrollType == 'left') ? 'lockX' : 'lockY';
    _$jscoverage['/drag.js'].lineData[76]++;
    if (visit16_76_1(!self.allowScroll[scrollType] && self.get(lockXY))) {
      _$jscoverage['/drag.js'].lineData[77]++;
      return 1;
    }
    _$jscoverage['/drag.js'].lineData[79]++;
    return 0;
  }
  _$jscoverage['/drag.js'].lineData[82]++;
  function onDragEndAxis(self, e, scrollType, endCallback) {
    _$jscoverage['/drag.js'].functionData[4]++;
    _$jscoverage['/drag.js'].lineData[83]++;
    if (visit17_83_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/drag.js'].lineData[84]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[85]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[87]++;
    var scrollAxis = 'scroll' + S.ucfirst(scrollType), $contentEl = self.$contentEl, scroll = self.get(scrollAxis), anim = {}, minScroll = self.minScroll, maxScroll = self.maxScroll, now = e.timeStamp, swipe = self.swipe, bound;
    _$jscoverage['/drag.js'].lineData[96]++;
    if (visit18_96_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/drag.js'].lineData[97]++;
      bound = minScroll[scrollType];
    } else {
      _$jscoverage['/drag.js'].lineData[98]++;
      if (visit19_98_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/drag.js'].lineData[99]++;
        bound = maxScroll[scrollType];
      }
    }
    _$jscoverage['/drag.js'].lineData[101]++;
    if (visit20_101_1(bound !== undefined)) {
      _$jscoverage['/drag.js'].lineData[102]++;
      var scrollCfg = {};
      _$jscoverage['/drag.js'].lineData[103]++;
      scrollCfg[scrollType] = bound;
      _$jscoverage['/drag.js'].lineData[104]++;
      self.scrollTo(scrollCfg, {
  duration: self.get('bounceDuration'), 
  easing: self.get('bounceEasing'), 
  queue: false, 
  complete: endCallback});
      _$jscoverage['/drag.js'].lineData[110]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[113]++;
    if (visit21_113_1(self.pagesOffset)) {
      _$jscoverage['/drag.js'].lineData[114]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[115]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[118]++;
    var duration = now - swipe[scrollType].startTime;
    _$jscoverage['/drag.js'].lineData[119]++;
    var distance = (scroll - swipe[scrollType].scroll);
    _$jscoverage['/drag.js'].lineData[123]++;
    if (visit22_123_1(visit23_123_2(duration == 0) || visit24_123_3(distance == 0))) {
      _$jscoverage['/drag.js'].lineData[124]++;
      endCallback();
      _$jscoverage['/drag.js'].lineData[125]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[131]++;
    var velocity = distance / duration;
    _$jscoverage['/drag.js'].lineData[133]++;
    velocity = Math.min(Math.max(velocity, -MAX_SWIPE_VELOCITY), MAX_SWIPE_VELOCITY);
    _$jscoverage['/drag.js'].lineData[138]++;
    anim[scrollType] = {
  fx: {
  frame: makeMomentumFx(self, velocity, scroll, scrollAxis, maxScroll[scrollType], minScroll[scrollType])}};
    _$jscoverage['/drag.js'].lineData[146]++;
    $contentEl.animate(anim, {
  duration: 9999, 
  queue: false, 
  complete: endCallback});
  }
  _$jscoverage['/drag.js'].lineData[153]++;
  var FRICTION = 0.5;
  _$jscoverage['/drag.js'].lineData[154]++;
  var ACCELERATION = 20;
  _$jscoverage['/drag.js'].lineData[155]++;
  var THETA = Math.log(1 - (FRICTION / 10));
  _$jscoverage['/drag.js'].lineData[156]++;
  var ALPHA = THETA / ACCELERATION;
  _$jscoverage['/drag.js'].lineData[157]++;
  var SPRING_TENSION = 0.3;
  _$jscoverage['/drag.js'].lineData[159]++;
  function makeMomentumFx(self, startVelocity, startScroll, scrollAxis, maxScroll, minScroll) {
    _$jscoverage['/drag.js'].functionData[5]++;
    _$jscoverage['/drag.js'].lineData[161]++;
    var velocity = startVelocity * ACCELERATION;
    _$jscoverage['/drag.js'].lineData[162]++;
    var inertia = 1;
    _$jscoverage['/drag.js'].lineData[163]++;
    var bounceStartTime = 0;
    _$jscoverage['/drag.js'].lineData[164]++;
    return function(anim) {
  _$jscoverage['/drag.js'].functionData[6]++;
  _$jscoverage['/drag.js'].lineData[165]++;
  var now = S.now(), fx = this, deltaTime, value;
  _$jscoverage['/drag.js'].lineData[170]++;
  if (visit25_170_1(inertia)) {
    _$jscoverage['/drag.js'].lineData[171]++;
    deltaTime = now - anim.startTime;
    _$jscoverage['/drag.js'].lineData[175]++;
    var frictionFactor = Math.exp(deltaTime * ALPHA);
    _$jscoverage['/drag.js'].lineData[177]++;
    value = parseInt(startScroll + velocity * (1 - frictionFactor) / (-THETA));
    _$jscoverage['/drag.js'].lineData[178]++;
    if (visit26_178_1(visit27_178_2(value > minScroll) && visit28_178_3(value < maxScroll))) {
      _$jscoverage['/drag.js'].lineData[180]++;
      if (visit29_180_1(fx.lastValue === value)) {
        _$jscoverage['/drag.js'].lineData[181]++;
        fx.finished = 1;
      }
      _$jscoverage['/drag.js'].lineData[183]++;
      fx.lastValue = value;
      _$jscoverage['/drag.js'].lineData[184]++;
      self.set(scrollAxis, value);
      _$jscoverage['/drag.js'].lineData[185]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[187]++;
    inertia = 0;
    _$jscoverage['/drag.js'].lineData[188]++;
    velocity = velocity * frictionFactor;
    _$jscoverage['/drag.js'].lineData[194]++;
    startScroll = visit30_194_1(value <= minScroll) ? minScroll : maxScroll;
    _$jscoverage['/drag.js'].lineData[196]++;
    bounceStartTime = now;
  } else {
    _$jscoverage['/drag.js'].lineData[198]++;
    deltaTime = now - bounceStartTime;
    _$jscoverage['/drag.js'].lineData[200]++;
    var theta = (deltaTime / ACCELERATION), powTime = theta * Math.exp(-SPRING_TENSION * theta);
    _$jscoverage['/drag.js'].lineData[204]++;
    value = parseInt(velocity * powTime);
    _$jscoverage['/drag.js'].lineData[205]++;
    if (visit31_205_1(value === 0)) {
      _$jscoverage['/drag.js'].lineData[206]++;
      fx.finished = 1;
    }
    _$jscoverage['/drag.js'].lineData[208]++;
    self.set(scrollAxis, startScroll + value);
  }
};
  }
  _$jscoverage['/drag.js'].lineData[213]++;
  function onSingleGestureStart(e) {
    _$jscoverage['/drag.js'].functionData[7]++;
    _$jscoverage['/drag.js'].lineData[214]++;
    var self = this;
    _$jscoverage['/drag.js'].lineData[215]++;
    self.stopAnimation();
    _$jscoverage['/drag.js'].lineData[216]++;
    if (visit32_216_1(self.isScrolling)) {
      _$jscoverage['/drag.js'].lineData[217]++;
      var pageIndex = self.get('pageIndex');
      _$jscoverage['/drag.js'].lineData[218]++;
      self.isScrolling = 0;
      _$jscoverage['/drag.js'].lineData[219]++;
      self.fire('scrollEnd', {
  pageX: e.pageX, 
  pageY: e.pageY, 
  fromPageIndex: pageIndex, 
  pageIndex: pageIndex});
    }
  }
  _$jscoverage['/drag.js'].lineData[228]++;
  function onDragStartHandler(e) {
    _$jscoverage['/drag.js'].functionData[8]++;
    _$jscoverage['/drag.js'].lineData[230]++;
    var self = this;
    _$jscoverage['/drag.js'].lineData[231]++;
    initStates(self);
    _$jscoverage['/drag.js'].lineData[232]++;
    self.startMousePos = self.dd.get('startMousePos');
    _$jscoverage['/drag.js'].lineData[233]++;
    onDragStart(self, e, 'left');
    _$jscoverage['/drag.js'].lineData[234]++;
    onDragStart(self, e, 'top');
    _$jscoverage['/drag.js'].lineData[235]++;
    self.fire('scrollStart', {
  pageX: e.pageX, 
  pageY: e.pageY});
    _$jscoverage['/drag.js'].lineData[239]++;
    self.isScrolling = 1;
  }
  _$jscoverage['/drag.js'].lineData[242]++;
  function onDragHandler(e) {
    _$jscoverage['/drag.js'].functionData[9]++;
    _$jscoverage['/drag.js'].lineData[243]++;
    var self = this, startMousePos = self.startMousePos;
    _$jscoverage['/drag.js'].lineData[246]++;
    if (visit33_246_1(!startMousePos)) {
      _$jscoverage['/drag.js'].lineData[247]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[250]++;
    var lockX = self.get('lockX'), lockY = self.get('lockY');
    _$jscoverage['/drag.js'].lineData[254]++;
    if (visit34_254_1(lockX || lockY)) {
      _$jscoverage['/drag.js'].lineData[255]++;
      var dragInitDirection;
      _$jscoverage['/drag.js'].lineData[257]++;
      if (visit35_257_1(!(dragInitDirection = self.dragInitDirection))) {
        _$jscoverage['/drag.js'].lineData[258]++;
        self.dragInitDirection = dragInitDirection = visit36_258_1(Math.abs(e.pageX - startMousePos.left) > Math.abs(e.pageY - startMousePos.top)) ? 'left' : 'top';
      }
      _$jscoverage['/drag.js'].lineData[265]++;
      if (visit37_265_1(lockX && visit38_265_2(visit39_265_3(dragInitDirection == 'left') && !self.allowScroll[dragInitDirection]))) {
        _$jscoverage['/drag.js'].lineData[266]++;
        self.dd.stopDrag();
        _$jscoverage['/drag.js'].lineData[267]++;
        return;
      }
      _$jscoverage['/drag.js'].lineData[270]++;
      if (visit40_270_1(lockY && visit41_270_2(visit42_270_3(dragInitDirection == 'top') && !self.allowScroll[dragInitDirection]))) {
        _$jscoverage['/drag.js'].lineData[271]++;
        self.dd.stopDrag();
        _$jscoverage['/drag.js'].lineData[272]++;
        return;
      }
    }
    _$jscoverage['/drag.js'].lineData[276]++;
    e.preventDefault();
    _$jscoverage['/drag.js'].lineData[277]++;
    e.domEvent.preventDefault();
    _$jscoverage['/drag.js'].lineData[279]++;
    onDragScroll(self, e, 'left', startMousePos);
    _$jscoverage['/drag.js'].lineData[280]++;
    onDragScroll(self, e, 'top', startMousePos);
    _$jscoverage['/drag.js'].lineData[283]++;
    self.fire('scrollMove', {
  pageX: e.pageX, 
  pageY: e.pageY});
  }
  _$jscoverage['/drag.js'].lineData[289]++;
  function onDragEndHandler(e) {
    _$jscoverage['/drag.js'].functionData[10]++;
    _$jscoverage['/drag.js'].lineData[290]++;
    var self = this;
    _$jscoverage['/drag.js'].lineData[291]++;
    var count = 0;
    _$jscoverage['/drag.js'].lineData[292]++;
    var startMousePos = self.startMousePos;
    _$jscoverage['/drag.js'].lineData[293]++;
    if (visit43_293_1(!startMousePos)) {
      _$jscoverage['/drag.js'].lineData[294]++;
      return;
    }
    _$jscoverage['/drag.js'].lineData[296]++;
    var offsetX = startMousePos.left - e.pageX;
    _$jscoverage['/drag.js'].lineData[297]++;
    var offsetY = startMousePos.top - e.pageY;
    _$jscoverage['/drag.js'].lineData[298]++;
    var snapThreshold = self.get('snapThreshold');
    _$jscoverage['/drag.js'].lineData[299]++;
    var allowX = visit44_299_1(self.allowScroll.left && visit45_299_2(Math.abs(offsetX) > snapThreshold));
    _$jscoverage['/drag.js'].lineData[300]++;
    var allowY = visit46_300_1(self.allowScroll.top && visit47_300_2(Math.abs(offsetY) > snapThreshold));
    _$jscoverage['/drag.js'].lineData[302]++;
    self.fire('dragend', {
  pageX: e.pageX, 
  pageY: e.pageY});
    _$jscoverage['/drag.js'].lineData[307]++;
    function endCallback() {
      _$jscoverage['/drag.js'].functionData[11]++;
      _$jscoverage['/drag.js'].lineData[308]++;
      count++;
      _$jscoverage['/drag.js'].lineData[309]++;
      if (visit48_309_1(count == 2)) {
        _$jscoverage['/drag.js'].lineData[310]++;
        function scrollEnd() {
          _$jscoverage['/drag.js'].functionData[12]++;
          _$jscoverage['/drag.js'].lineData[311]++;
          self.fire('scrollEnd', {
  pageX: e.pageX, 
  pageY: e.pageY, 
  fromPageIndex: pageIndex, 
  pageIndex: self.get('pageIndex')});
        }        _$jscoverage['/drag.js'].lineData[319]++;
        if (visit49_319_1(!self.pagesOffset)) {
          _$jscoverage['/drag.js'].lineData[320]++;
          scrollEnd();
          _$jscoverage['/drag.js'].lineData[321]++;
          return;
        }
        _$jscoverage['/drag.js'].lineData[324]++;
        var snapThreshold = self.get('snapThreshold');
        _$jscoverage['/drag.js'].lineData[325]++;
        var snapDuration = self.get('snapDuration');
        _$jscoverage['/drag.js'].lineData[326]++;
        var snapEasing = self.get('snapEasing');
        _$jscoverage['/drag.js'].lineData[327]++;
        var pageIndex = self.get('pageIndex');
        _$jscoverage['/drag.js'].lineData[328]++;
        var scrollLeft = self.get('scrollLeft');
        _$jscoverage['/drag.js'].lineData[329]++;
        var scrollTop = self.get('scrollTop');
        _$jscoverage['/drag.js'].lineData[331]++;
        var animCfg = {
  duration: snapDuration, 
  easing: snapEasing, 
  complete: scrollEnd};
        _$jscoverage['/drag.js'].lineData[337]++;
        var pagesOffset = self.pagesOffset.concat([]);
        _$jscoverage['/drag.js'].lineData[339]++;
        self.isScrolling = 0;
        _$jscoverage['/drag.js'].lineData[341]++;
        if (visit50_341_1(allowX || allowY)) {
          _$jscoverage['/drag.js'].lineData[342]++;
          if (visit51_342_1(allowX && allowY)) {
            _$jscoverage['/drag.js'].lineData[343]++;
            var prepareX = [], newPageIndex = undefined;
            _$jscoverage['/drag.js'].lineData[345]++;
            var nowXY = {
  left: scrollLeft, 
  top: scrollTop};
            _$jscoverage['/drag.js'].lineData[349]++;
            S.each(pagesOffset, function(offset) {
  _$jscoverage['/drag.js'].functionData[13]++;
  _$jscoverage['/drag.js'].lineData[350]++;
  if (visit52_350_1(!offset)) {
    _$jscoverage['/drag.js'].lineData[351]++;
    return;
  }
  _$jscoverage['/drag.js'].lineData[353]++;
  if (visit53_353_1(visit54_353_2(offsetX > 0) && visit55_353_3(offset.left > nowXY.left))) {
    _$jscoverage['/drag.js'].lineData[354]++;
    prepareX.push(offset);
  } else {
    _$jscoverage['/drag.js'].lineData[355]++;
    if (visit56_355_1(visit57_355_2(offsetX < 0) && visit58_355_3(offset.left < nowXY.left))) {
      _$jscoverage['/drag.js'].lineData[356]++;
      prepareX.push(offset);
    }
  }
});
            _$jscoverage['/drag.js'].lineData[359]++;
            var min;
            _$jscoverage['/drag.js'].lineData[360]++;
            if (visit59_360_1(offsetY > 0)) {
              _$jscoverage['/drag.js'].lineData[361]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/drag.js'].lineData[362]++;
              S.each(prepareX, function(x) {
  _$jscoverage['/drag.js'].functionData[14]++;
  _$jscoverage['/drag.js'].lineData[363]++;
  if (visit60_363_1(x.top > nowXY.top)) {
    _$jscoverage['/drag.js'].lineData[364]++;
    if (visit61_364_1(min < x.top - nowXY.top)) {
      _$jscoverage['/drag.js'].lineData[365]++;
      min = x.top - nowXY.top;
      _$jscoverage['/drag.js'].lineData[366]++;
      newPageIndex = prepareX.index;
    }
  }
});
            } else {
              _$jscoverage['/drag.js'].lineData[371]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/drag.js'].lineData[372]++;
              S.each(prepareX, function(x) {
  _$jscoverage['/drag.js'].functionData[15]++;
  _$jscoverage['/drag.js'].lineData[373]++;
  if (visit62_373_1(x.top < nowXY.top)) {
    _$jscoverage['/drag.js'].lineData[374]++;
    if (visit63_374_1(min < nowXY.top - x.top)) {
      _$jscoverage['/drag.js'].lineData[375]++;
      min = nowXY.top - x.top;
      _$jscoverage['/drag.js'].lineData[376]++;
      newPageIndex = prepareX.index;
    }
  }
});
            }
            _$jscoverage['/drag.js'].lineData[381]++;
            if (visit64_381_1(newPageIndex != undefined)) {
              _$jscoverage['/drag.js'].lineData[382]++;
              if (visit65_382_1(newPageIndex != pageIndex)) {
                _$jscoverage['/drag.js'].lineData[383]++;
                self.scrollToPage(newPageIndex, animCfg);
              } else {
                _$jscoverage['/drag.js'].lineData[385]++;
                self.scrollToPage(newPageIndex);
                _$jscoverage['/drag.js'].lineData[386]++;
                scrollEnd();
              }
            } else {
              _$jscoverage['/drag.js'].lineData[389]++;
              scrollEnd();
            }
          } else {
            _$jscoverage['/drag.js'].lineData[392]++;
            if (visit66_392_1(allowX || allowY)) {
              _$jscoverage['/drag.js'].lineData[393]++;
              var toPageIndex = self._getPageIndexFromXY(allowX ? scrollLeft : scrollTop, allowX, allowX ? offsetX : offsetY);
              _$jscoverage['/drag.js'].lineData[396]++;
              self.scrollToPage(toPageIndex, animCfg);
            } else {
              _$jscoverage['/drag.js'].lineData[398]++;
              self.scrollToPage(self.get('pageIndex'));
              _$jscoverage['/drag.js'].lineData[399]++;
              scrollEnd();
            }
          }
        }
      }
    }
    _$jscoverage['/drag.js'].lineData[406]++;
    onDragEndAxis(self, e, 'left', endCallback);
    _$jscoverage['/drag.js'].lineData[407]++;
    onDragEndAxis(self, e, 'top', endCallback);
  }
  _$jscoverage['/drag.js'].lineData[410]++;
  function initStates(self) {
    _$jscoverage['/drag.js'].functionData[16]++;
    _$jscoverage['/drag.js'].lineData[411]++;
    self.lastPageXY = {};
    _$jscoverage['/drag.js'].lineData[413]++;
    self.lastDirection = {};
    _$jscoverage['/drag.js'].lineData[415]++;
    self.swipe = {
  left: {}, 
  top: {}};
    _$jscoverage['/drag.js'].lineData[420]++;
    self.startMousePos = null;
    _$jscoverage['/drag.js'].lineData[422]++;
    self.startScroll = {};
    _$jscoverage['/drag.js'].lineData[424]++;
    self.dragInitDirection = null;
  }
  _$jscoverage['/drag.js'].lineData[427]++;
  return ScrollViewBase.extend({
  bindUI: function() {
  _$jscoverage['/drag.js'].functionData[17]++;
  _$jscoverage['/drag.js'].lineData[429]++;
  var self = this, $contentEl = self.$contentEl;
  _$jscoverage['/drag.js'].lineData[432]++;
  $contentEl.on(Gesture.start, onSingleGestureStart, self);
  _$jscoverage['/drag.js'].lineData[433]++;
  var dd = self.dd = new DD.Draggable({
  node: $contentEl, 
  groups: false, 
  preventDefaultOnMove: false, 
  halt: true});
  _$jscoverage['/drag.js'].lineData[443]++;
  dd.on('dragstart', onDragStartHandler, self).on('drag', onDragHandler, self).on('dragend', onDragEndHandler, self);
}, 
  syncUI: function() {
  _$jscoverage['/drag.js'].functionData[18]++;
  _$jscoverage['/drag.js'].lineData[447]++;
  initStates(this);
}, 
  destructor: function() {
  _$jscoverage['/drag.js'].functionData[19]++;
  _$jscoverage['/drag.js'].lineData[451]++;
  this.dd.destroy();
  _$jscoverage['/drag.js'].lineData[452]++;
  this.stopAnimation();
}, 
  stopAnimation: function() {
  _$jscoverage['/drag.js'].functionData[20]++;
  _$jscoverage['/drag.js'].lineData[456]++;
  this.callSuper();
  _$jscoverage['/drag.js'].lineData[459]++;
  this.dd.stopDrag();
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/drag.js'].functionData[21]++;
  _$jscoverage['/drag.js'].lineData[463]++;
  this.dd.set('disabled', v);
}}, {
  ATTRS: {
  lockX: {
  value: true}, 
  lockY: {
  value: false}, 
  snapThreshold: {
  value: 5}, 
  bounce: {
  value: true}, 
  bounceDuration: {
  value: 0.4}, 
  bounceEasing: {
  value: 'easeOut'}}, 
  xclass: 'scroll-view'});
}, {
  requires: ['./base', 'dd', 'node']});
