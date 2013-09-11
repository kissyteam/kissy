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
if (! _$jscoverage['/control/render.js']) {
  _$jscoverage['/control/render.js'] = {};
  _$jscoverage['/control/render.js'].lineData = [];
  _$jscoverage['/control/render.js'].lineData[7] = 0;
  _$jscoverage['/control/render.js'].lineData[8] = 0;
  _$jscoverage['/control/render.js'].lineData[17] = 0;
  _$jscoverage['/control/render.js'].lineData[18] = 0;
  _$jscoverage['/control/render.js'].lineData[19] = 0;
  _$jscoverage['/control/render.js'].lineData[21] = 0;
  _$jscoverage['/control/render.js'].lineData[24] = 0;
  _$jscoverage['/control/render.js'].lineData[25] = 0;
  _$jscoverage['/control/render.js'].lineData[30] = 0;
  _$jscoverage['/control/render.js'].lineData[31] = 0;
  _$jscoverage['/control/render.js'].lineData[33] = 0;
  _$jscoverage['/control/render.js'].lineData[35] = 0;
  _$jscoverage['/control/render.js'].lineData[36] = 0;
  _$jscoverage['/control/render.js'].lineData[37] = 0;
  _$jscoverage['/control/render.js'].lineData[41] = 0;
  _$jscoverage['/control/render.js'].lineData[42] = 0;
  _$jscoverage['/control/render.js'].lineData[45] = 0;
  _$jscoverage['/control/render.js'].lineData[46] = 0;
  _$jscoverage['/control/render.js'].lineData[51] = 0;
  _$jscoverage['/control/render.js'].lineData[52] = 0;
  _$jscoverage['/control/render.js'].lineData[53] = 0;
  _$jscoverage['/control/render.js'].lineData[55] = 0;
  _$jscoverage['/control/render.js'].lineData[56] = 0;
  _$jscoverage['/control/render.js'].lineData[58] = 0;
  _$jscoverage['/control/render.js'].lineData[61] = 0;
  _$jscoverage['/control/render.js'].lineData[62] = 0;
  _$jscoverage['/control/render.js'].lineData[67] = 0;
  _$jscoverage['/control/render.js'].lineData[68] = 0;
  _$jscoverage['/control/render.js'].lineData[69] = 0;
  _$jscoverage['/control/render.js'].lineData[70] = 0;
  _$jscoverage['/control/render.js'].lineData[72] = 0;
  _$jscoverage['/control/render.js'].lineData[75] = 0;
  _$jscoverage['/control/render.js'].lineData[76] = 0;
  _$jscoverage['/control/render.js'].lineData[79] = 0;
  _$jscoverage['/control/render.js'].lineData[80] = 0;
  _$jscoverage['/control/render.js'].lineData[81] = 0;
  _$jscoverage['/control/render.js'].lineData[86] = 0;
  _$jscoverage['/control/render.js'].lineData[87] = 0;
  _$jscoverage['/control/render.js'].lineData[90] = 0;
  _$jscoverage['/control/render.js'].lineData[91] = 0;
  _$jscoverage['/control/render.js'].lineData[99] = 0;
  _$jscoverage['/control/render.js'].lineData[103] = 0;
  _$jscoverage['/control/render.js'].lineData[106] = 0;
  _$jscoverage['/control/render.js'].lineData[108] = 0;
  _$jscoverage['/control/render.js'].lineData[110] = 0;
  _$jscoverage['/control/render.js'].lineData[115] = 0;
  _$jscoverage['/control/render.js'].lineData[130] = 0;
  _$jscoverage['/control/render.js'].lineData[131] = 0;
  _$jscoverage['/control/render.js'].lineData[132] = 0;
  _$jscoverage['/control/render.js'].lineData[133] = 0;
  _$jscoverage['/control/render.js'].lineData[137] = 0;
  _$jscoverage['/control/render.js'].lineData[138] = 0;
  _$jscoverage['/control/render.js'].lineData[139] = 0;
  _$jscoverage['/control/render.js'].lineData[140] = 0;
  _$jscoverage['/control/render.js'].lineData[142] = 0;
  _$jscoverage['/control/render.js'].lineData[143] = 0;
  _$jscoverage['/control/render.js'].lineData[145] = 0;
  _$jscoverage['/control/render.js'].lineData[146] = 0;
  _$jscoverage['/control/render.js'].lineData[148] = 0;
  _$jscoverage['/control/render.js'].lineData[149] = 0;
  _$jscoverage['/control/render.js'].lineData[152] = 0;
  _$jscoverage['/control/render.js'].lineData[153] = 0;
  _$jscoverage['/control/render.js'].lineData[156] = 0;
  _$jscoverage['/control/render.js'].lineData[157] = 0;
  _$jscoverage['/control/render.js'].lineData[158] = 0;
  _$jscoverage['/control/render.js'].lineData[160] = 0;
  _$jscoverage['/control/render.js'].lineData[161] = 0;
  _$jscoverage['/control/render.js'].lineData[163] = 0;
  _$jscoverage['/control/render.js'].lineData[164] = 0;
  _$jscoverage['/control/render.js'].lineData[165] = 0;
  _$jscoverage['/control/render.js'].lineData[167] = 0;
  _$jscoverage['/control/render.js'].lineData[172] = 0;
  _$jscoverage['/control/render.js'].lineData[173] = 0;
  _$jscoverage['/control/render.js'].lineData[182] = 0;
  _$jscoverage['/control/render.js'].lineData[185] = 0;
  _$jscoverage['/control/render.js'].lineData[186] = 0;
  _$jscoverage['/control/render.js'].lineData[187] = 0;
  _$jscoverage['/control/render.js'].lineData[188] = 0;
  _$jscoverage['/control/render.js'].lineData[189] = 0;
  _$jscoverage['/control/render.js'].lineData[193] = 0;
  _$jscoverage['/control/render.js'].lineData[195] = 0;
  _$jscoverage['/control/render.js'].lineData[196] = 0;
  _$jscoverage['/control/render.js'].lineData[198] = 0;
  _$jscoverage['/control/render.js'].lineData[199] = 0;
  _$jscoverage['/control/render.js'].lineData[200] = 0;
  _$jscoverage['/control/render.js'].lineData[204] = 0;
  _$jscoverage['/control/render.js'].lineData[209] = 0;
  _$jscoverage['/control/render.js'].lineData[210] = 0;
  _$jscoverage['/control/render.js'].lineData[212] = 0;
  _$jscoverage['/control/render.js'].lineData[213] = 0;
  _$jscoverage['/control/render.js'].lineData[214] = 0;
  _$jscoverage['/control/render.js'].lineData[215] = 0;
  _$jscoverage['/control/render.js'].lineData[217] = 0;
  _$jscoverage['/control/render.js'].lineData[223] = 0;
  _$jscoverage['/control/render.js'].lineData[224] = 0;
  _$jscoverage['/control/render.js'].lineData[225] = 0;
  _$jscoverage['/control/render.js'].lineData[226] = 0;
  _$jscoverage['/control/render.js'].lineData[227] = 0;
  _$jscoverage['/control/render.js'].lineData[228] = 0;
  _$jscoverage['/control/render.js'].lineData[229] = 0;
  _$jscoverage['/control/render.js'].lineData[230] = 0;
  _$jscoverage['/control/render.js'].lineData[231] = 0;
  _$jscoverage['/control/render.js'].lineData[233] = 0;
  _$jscoverage['/control/render.js'].lineData[239] = 0;
  _$jscoverage['/control/render.js'].lineData[240] = 0;
  _$jscoverage['/control/render.js'].lineData[245] = 0;
  _$jscoverage['/control/render.js'].lineData[249] = 0;
  _$jscoverage['/control/render.js'].lineData[255] = 0;
  _$jscoverage['/control/render.js'].lineData[257] = 0;
  _$jscoverage['/control/render.js'].lineData[258] = 0;
  _$jscoverage['/control/render.js'].lineData[259] = 0;
  _$jscoverage['/control/render.js'].lineData[260] = 0;
  _$jscoverage['/control/render.js'].lineData[262] = 0;
  _$jscoverage['/control/render.js'].lineData[265] = 0;
  _$jscoverage['/control/render.js'].lineData[270] = 0;
  _$jscoverage['/control/render.js'].lineData[271] = 0;
  _$jscoverage['/control/render.js'].lineData[272] = 0;
  _$jscoverage['/control/render.js'].lineData[273] = 0;
  _$jscoverage['/control/render.js'].lineData[286] = 0;
  _$jscoverage['/control/render.js'].lineData[288] = 0;
  _$jscoverage['/control/render.js'].lineData[289] = 0;
  _$jscoverage['/control/render.js'].lineData[290] = 0;
  _$jscoverage['/control/render.js'].lineData[292] = 0;
  _$jscoverage['/control/render.js'].lineData[296] = 0;
  _$jscoverage['/control/render.js'].lineData[297] = 0;
  _$jscoverage['/control/render.js'].lineData[298] = 0;
  _$jscoverage['/control/render.js'].lineData[300] = 0;
  _$jscoverage['/control/render.js'].lineData[304] = 0;
  _$jscoverage['/control/render.js'].lineData[305] = 0;
  _$jscoverage['/control/render.js'].lineData[306] = 0;
  _$jscoverage['/control/render.js'].lineData[307] = 0;
  _$jscoverage['/control/render.js'].lineData[309] = 0;
  _$jscoverage['/control/render.js'].lineData[312] = 0;
  _$jscoverage['/control/render.js'].lineData[321] = 0;
  _$jscoverage['/control/render.js'].lineData[322] = 0;
  _$jscoverage['/control/render.js'].lineData[328] = 0;
  _$jscoverage['/control/render.js'].lineData[329] = 0;
  _$jscoverage['/control/render.js'].lineData[331] = 0;
  _$jscoverage['/control/render.js'].lineData[341] = 0;
  _$jscoverage['/control/render.js'].lineData[354] = 0;
  _$jscoverage['/control/render.js'].lineData[358] = 0;
  _$jscoverage['/control/render.js'].lineData[362] = 0;
  _$jscoverage['/control/render.js'].lineData[366] = 0;
  _$jscoverage['/control/render.js'].lineData[367] = 0;
  _$jscoverage['/control/render.js'].lineData[369] = 0;
  _$jscoverage['/control/render.js'].lineData[370] = 0;
  _$jscoverage['/control/render.js'].lineData[375] = 0;
  _$jscoverage['/control/render.js'].lineData[378] = 0;
  _$jscoverage['/control/render.js'].lineData[379] = 0;
  _$jscoverage['/control/render.js'].lineData[381] = 0;
  _$jscoverage['/control/render.js'].lineData[389] = 0;
  _$jscoverage['/control/render.js'].lineData[392] = 0;
  _$jscoverage['/control/render.js'].lineData[399] = 0;
  _$jscoverage['/control/render.js'].lineData[404] = 0;
  _$jscoverage['/control/render.js'].lineData[405] = 0;
  _$jscoverage['/control/render.js'].lineData[407] = 0;
  _$jscoverage['/control/render.js'].lineData[414] = 0;
  _$jscoverage['/control/render.js'].lineData[417] = 0;
  _$jscoverage['/control/render.js'].lineData[423] = 0;
  _$jscoverage['/control/render.js'].lineData[426] = 0;
  _$jscoverage['/control/render.js'].lineData[430] = 0;
  _$jscoverage['/control/render.js'].lineData[447] = 0;
  _$jscoverage['/control/render.js'].lineData[450] = 0;
  _$jscoverage['/control/render.js'].lineData[451] = 0;
  _$jscoverage['/control/render.js'].lineData[452] = 0;
  _$jscoverage['/control/render.js'].lineData[455] = 0;
  _$jscoverage['/control/render.js'].lineData[456] = 0;
  _$jscoverage['/control/render.js'].lineData[458] = 0;
  _$jscoverage['/control/render.js'].lineData[459] = 0;
  _$jscoverage['/control/render.js'].lineData[463] = 0;
  _$jscoverage['/control/render.js'].lineData[465] = 0;
  _$jscoverage['/control/render.js'].lineData[466] = 0;
  _$jscoverage['/control/render.js'].lineData[467] = 0;
  _$jscoverage['/control/render.js'].lineData[474] = 0;
  _$jscoverage['/control/render.js'].lineData[484] = 0;
  _$jscoverage['/control/render.js'].lineData[485] = 0;
  _$jscoverage['/control/render.js'].lineData[488] = 0;
  _$jscoverage['/control/render.js'].lineData[491] = 0;
}
if (! _$jscoverage['/control/render.js'].functionData) {
  _$jscoverage['/control/render.js'].functionData = [];
  _$jscoverage['/control/render.js'].functionData[0] = 0;
  _$jscoverage['/control/render.js'].functionData[1] = 0;
  _$jscoverage['/control/render.js'].functionData[2] = 0;
  _$jscoverage['/control/render.js'].functionData[3] = 0;
  _$jscoverage['/control/render.js'].functionData[4] = 0;
  _$jscoverage['/control/render.js'].functionData[5] = 0;
  _$jscoverage['/control/render.js'].functionData[6] = 0;
  _$jscoverage['/control/render.js'].functionData[7] = 0;
  _$jscoverage['/control/render.js'].functionData[8] = 0;
  _$jscoverage['/control/render.js'].functionData[9] = 0;
  _$jscoverage['/control/render.js'].functionData[10] = 0;
  _$jscoverage['/control/render.js'].functionData[11] = 0;
  _$jscoverage['/control/render.js'].functionData[12] = 0;
  _$jscoverage['/control/render.js'].functionData[13] = 0;
  _$jscoverage['/control/render.js'].functionData[14] = 0;
  _$jscoverage['/control/render.js'].functionData[15] = 0;
  _$jscoverage['/control/render.js'].functionData[16] = 0;
  _$jscoverage['/control/render.js'].functionData[17] = 0;
  _$jscoverage['/control/render.js'].functionData[18] = 0;
  _$jscoverage['/control/render.js'].functionData[19] = 0;
  _$jscoverage['/control/render.js'].functionData[20] = 0;
  _$jscoverage['/control/render.js'].functionData[21] = 0;
  _$jscoverage['/control/render.js'].functionData[22] = 0;
  _$jscoverage['/control/render.js'].functionData[23] = 0;
  _$jscoverage['/control/render.js'].functionData[24] = 0;
  _$jscoverage['/control/render.js'].functionData[25] = 0;
  _$jscoverage['/control/render.js'].functionData[26] = 0;
  _$jscoverage['/control/render.js'].functionData[27] = 0;
  _$jscoverage['/control/render.js'].functionData[28] = 0;
  _$jscoverage['/control/render.js'].functionData[29] = 0;
  _$jscoverage['/control/render.js'].functionData[30] = 0;
  _$jscoverage['/control/render.js'].functionData[31] = 0;
  _$jscoverage['/control/render.js'].functionData[32] = 0;
  _$jscoverage['/control/render.js'].functionData[33] = 0;
  _$jscoverage['/control/render.js'].functionData[34] = 0;
  _$jscoverage['/control/render.js'].functionData[35] = 0;
  _$jscoverage['/control/render.js'].functionData[36] = 0;
  _$jscoverage['/control/render.js'].functionData[37] = 0;
  _$jscoverage['/control/render.js'].functionData[38] = 0;
}
if (! _$jscoverage['/control/render.js'].branchData) {
  _$jscoverage['/control/render.js'].branchData = {};
  _$jscoverage['/control/render.js'].branchData['18'] = [];
  _$jscoverage['/control/render.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['33'] = [];
  _$jscoverage['/control/render.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['36'] = [];
  _$jscoverage['/control/render.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['41'] = [];
  _$jscoverage['/control/render.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['45'] = [];
  _$jscoverage['/control/render.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['52'] = [];
  _$jscoverage['/control/render.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['55'] = [];
  _$jscoverage['/control/render.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['67'] = [];
  _$jscoverage['/control/render.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['79'] = [];
  _$jscoverage['/control/render.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['106'] = [];
  _$jscoverage['/control/render.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['132'] = [];
  _$jscoverage['/control/render.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['142'] = [];
  _$jscoverage['/control/render.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['145'] = [];
  _$jscoverage['/control/render.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['148'] = [];
  _$jscoverage['/control/render.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['152'] = [];
  _$jscoverage['/control/render.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['156'] = [];
  _$jscoverage['/control/render.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['160'] = [];
  _$jscoverage['/control/render.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['163'] = [];
  _$jscoverage['/control/render.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['164'] = [];
  _$jscoverage['/control/render.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['195'] = [];
  _$jscoverage['/control/render.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['209'] = [];
  _$jscoverage['/control/render.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['212'] = [];
  _$jscoverage['/control/render.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['214'] = [];
  _$jscoverage['/control/render.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['231'] = [];
  _$jscoverage['/control/render.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['239'] = [];
  _$jscoverage['/control/render.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['255'] = [];
  _$jscoverage['/control/render.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['259'] = [];
  _$jscoverage['/control/render.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['271'] = [];
  _$jscoverage['/control/render.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['272'] = [];
  _$jscoverage['/control/render.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['288'] = [];
  _$jscoverage['/control/render.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['297'] = [];
  _$jscoverage['/control/render.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['304'] = [];
  _$jscoverage['/control/render.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['306'] = [];
  _$jscoverage['/control/render.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['309'] = [];
  _$jscoverage['/control/render.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['328'] = [];
  _$jscoverage['/control/render.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['369'] = [];
  _$jscoverage['/control/render.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['369'][2] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['378'] = [];
  _$jscoverage['/control/render.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['405'] = [];
  _$jscoverage['/control/render.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['451'] = [];
  _$jscoverage['/control/render.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['452'] = [];
  _$jscoverage['/control/render.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['456'] = [];
  _$jscoverage['/control/render.js'].branchData['456'][1] = new BranchData();
}
_$jscoverage['/control/render.js'].branchData['456'][1].init(26, 3, 'ext');
function visit52_456_1(result) {
  _$jscoverage['/control/render.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['452'][1].init(256, 21, 'S.isArray(extensions)');
function visit51_452_1(result) {
  _$jscoverage['/control/render.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['451'][1].init(210, 27, 'NewClass[HTML_PARSER] || {}');
function visit50_451_1(result) {
  _$jscoverage['/control/render.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['405'][1].init(295, 24, 'control.get("focusable")');
function visit49_405_1(result) {
  _$jscoverage['/control/render.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['378'][1].init(143, 7, 'visible');
function visit48_378_1(result) {
  _$jscoverage['/control/render.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['369'][2].init(142, 9, 'UA.ie < 9');
function visit47_369_2(result) {
  _$jscoverage['/control/render.js'].branchData['369'][2].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['369'][1].init(142, 44, 'UA.ie < 9 && !this.get(\'allowTextSelection\')');
function visit46_369_1(result) {
  _$jscoverage['/control/render.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['328'][1].init(338, 5, 'i < l');
function visit45_328_1(result) {
  _$jscoverage['/control/render.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['309'][1].init(166, 81, 'constructor.superclass && constructor.superclass.constructor');
function visit44_309_1(result) {
  _$jscoverage['/control/render.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['306'][1].init(68, 6, 'xclass');
function visit43_306_1(result) {
  _$jscoverage['/control/render.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['304'][1].init(305, 65, 'constructor && !constructor.prototype.hasOwnProperty(\'isControl\')');
function visit42_304_1(result) {
  _$jscoverage['/control/render.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['297'][1].init(48, 24, 'self.componentCssClasses');
function visit41_297_1(result) {
  _$jscoverage['/control/render.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['288'][1].init(89, 3, 'cls');
function visit40_288_1(result) {
  _$jscoverage['/control/render.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['272'][1].init(118, 37, 'renderCommands || self.renderCommands');
function visit39_272_1(result) {
  _$jscoverage['/control/render.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['271'][1].init(57, 29, 'renderData || self.renderData');
function visit38_271_1(result) {
  _$jscoverage['/control/render.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['259'][1].init(82, 30, 'typeof selector === "function"');
function visit37_259_1(result) {
  _$jscoverage['/control/render.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['255'][1].init(196, 47, 'childrenElSelectors || self.childrenElSelectors');
function visit36_255_1(result) {
  _$jscoverage['/control/render.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['239'][1].init(18, 8, 'this.$el');
function visit35_239_1(result) {
  _$jscoverage['/control/render.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['231'][1].init(176, 28, 'attrCfg.view && attrChangeFn');
function visit34_231_1(result) {
  _$jscoverage['/control/render.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['214'][1].init(247, 6, 'render');
function visit33_214_1(result) {
  _$jscoverage['/control/render.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['212'][1].init(136, 12, 'renderBefore');
function visit32_212_1(result) {
  _$jscoverage['/control/render.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['209'][1].init(176, 23, '!control.get(\'srcNode\')');
function visit31_209_1(result) {
  _$jscoverage['/control/render.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['195'][1].init(89, 19, '!srcNode.attr(\'id\')');
function visit30_195_1(result) {
  _$jscoverage['/control/render.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['164'][1].init(22, 5, 'UA.ie');
function visit29_164_1(result) {
  _$jscoverage['/control/render.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['163'][1].init(1549, 24, 'control.get(\'focusable\')');
function visit28_163_1(result) {
  _$jscoverage['/control/render.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['160'][1].init(1427, 26, 'control.get(\'highlighted\')');
function visit27_160_1(result) {
  _$jscoverage['/control/render.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['156'][1].init(1242, 34, 'disabled = control.get(\'disabled\')');
function visit26_156_1(result) {
  _$jscoverage['/control/render.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['152'][1].init(1133, 8, '!visible');
function visit25_152_1(result) {
  _$jscoverage['/control/render.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['148'][1].init(1043, 6, 'zIndex');
function visit24_148_1(result) {
  _$jscoverage['/control/render.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['145'][1].init(949, 6, 'height');
function visit23_145_1(result) {
  _$jscoverage['/control/render.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['142'][1].init(858, 5, 'width');
function visit22_142_1(result) {
  _$jscoverage['/control/render.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['132'][1].init(56, 9, 'attr.view');
function visit21_132_1(result) {
  _$jscoverage['/control/render.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['106'][1].init(106, 7, 'srcNode');
function visit20_106_1(result) {
  _$jscoverage['/control/render.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['79'][1].init(89, 24, 'e.target == self.control');
function visit19_79_1(result) {
  _$jscoverage['/control/render.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['67'][1].init(156, 5, 'i < l');
function visit18_67_1(result) {
  _$jscoverage['/control/render.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['55'][1].init(77, 25, 'typeof extras == "string"');
function visit17_55_1(result) {
  _$jscoverage['/control/render.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['52'][1].init(14, 7, '!extras');
function visit16_52_1(result) {
  _$jscoverage['/control/render.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['45'][1].init(485, 20, 'S.isArray(v) && v[0]');
function visit15_45_1(result) {
  _$jscoverage['/control/render.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['41'][1].init(344, 20, 'typeof v == \'string\'');
function visit14_41_1(result) {
  _$jscoverage['/control/render.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['36'][1].init(103, 17, 'ret !== undefined');
function visit13_36_1(result) {
  _$jscoverage['/control/render.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['33'][1].init(65, 23, 'typeof v === \'function\'');
function visit12_33_1(result) {
  _$jscoverage['/control/render.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['18'][1].init(14, 20, 'typeof v == \'number\'');
function visit11_18_1(result) {
  _$jscoverage['/control/render.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].lineData[7]++;
KISSY.add("component/control/render", function(S, ComponentProcess, XTemplate, RenderTpl, Manager) {
  _$jscoverage['/control/render.js'].functionData[0]++;
  _$jscoverage['/control/render.js'].lineData[8]++;
  var ON_SET = '_onSet', trim = S.trim, $ = S.all, UA = S.UA, startTpl = RenderTpl, endTpl = '</div>', doc = S.Env.host.document, HTML_PARSER = 'HTML_PARSER';
  _$jscoverage['/control/render.js'].lineData[17]++;
  function pxSetter(v) {
    _$jscoverage['/control/render.js'].functionData[1]++;
    _$jscoverage['/control/render.js'].lineData[18]++;
    if (visit11_18_1(typeof v == 'number')) {
      _$jscoverage['/control/render.js'].lineData[19]++;
      v += 'px';
    }
    _$jscoverage['/control/render.js'].lineData[21]++;
    return v;
  }
  _$jscoverage['/control/render.js'].lineData[24]++;
  function applyParser(srcNode, parser, control) {
    _$jscoverage['/control/render.js'].functionData[2]++;
    _$jscoverage['/control/render.js'].lineData[25]++;
    var view = this, p, v, ret;
    _$jscoverage['/control/render.js'].lineData[30]++;
    for (p in parser) {
      _$jscoverage['/control/render.js'].lineData[31]++;
      v = parser[p];
      _$jscoverage['/control/render.js'].lineData[33]++;
      if (visit12_33_1(typeof v === 'function')) {
        _$jscoverage['/control/render.js'].lineData[35]++;
        ret = v.call(view, srcNode);
        _$jscoverage['/control/render.js'].lineData[36]++;
        if (visit13_36_1(ret !== undefined)) {
          _$jscoverage['/control/render.js'].lineData[37]++;
          control.setInternal(p, ret);
        }
      } else {
        _$jscoverage['/control/render.js'].lineData[41]++;
        if (visit14_41_1(typeof v == 'string')) {
          _$jscoverage['/control/render.js'].lineData[42]++;
          control.setInternal(p, srcNode.one(v));
        } else {
          _$jscoverage['/control/render.js'].lineData[45]++;
          if (visit15_45_1(S.isArray(v) && v[0])) {
            _$jscoverage['/control/render.js'].lineData[46]++;
            control.setInternal(p, srcNode.all(v[0]));
          }
        }
      }
    }
  }
  _$jscoverage['/control/render.js'].lineData[51]++;
  function normalExtras(extras) {
    _$jscoverage['/control/render.js'].functionData[3]++;
    _$jscoverage['/control/render.js'].lineData[52]++;
    if (visit16_52_1(!extras)) {
      _$jscoverage['/control/render.js'].lineData[53]++;
      extras = [''];
    }
    _$jscoverage['/control/render.js'].lineData[55]++;
    if (visit17_55_1(typeof extras == "string")) {
      _$jscoverage['/control/render.js'].lineData[56]++;
      extras = extras.split(/\s+/);
    }
    _$jscoverage['/control/render.js'].lineData[58]++;
    return extras;
  }
  _$jscoverage['/control/render.js'].lineData[61]++;
  function prefixExtra(prefixCls, componentCls, extras) {
    _$jscoverage['/control/render.js'].functionData[4]++;
    _$jscoverage['/control/render.js'].lineData[62]++;
    var cls = '', i = 0, l = extras.length, e, prefix = prefixCls + componentCls;
    _$jscoverage['/control/render.js'].lineData[67]++;
    for (; visit18_67_1(i < l); i++) {
      _$jscoverage['/control/render.js'].lineData[68]++;
      e = extras[i];
      _$jscoverage['/control/render.js'].lineData[69]++;
      e = e ? ('-' + e) : e;
      _$jscoverage['/control/render.js'].lineData[70]++;
      cls += ' ' + prefix + e;
    }
    _$jscoverage['/control/render.js'].lineData[72]++;
    return cls;
  }
  _$jscoverage['/control/render.js'].lineData[75]++;
  function onSetAttrChange(e) {
    _$jscoverage['/control/render.js'].functionData[5]++;
    _$jscoverage['/control/render.js'].lineData[76]++;
    var self = this, method;
    _$jscoverage['/control/render.js'].lineData[79]++;
    if (visit19_79_1(e.target == self.control)) {
      _$jscoverage['/control/render.js'].lineData[80]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/control/render.js'].lineData[81]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/control/render.js'].lineData[86]++;
  function getBaseCssClassesCmd() {
    _$jscoverage['/control/render.js'].functionData[6]++;
    _$jscoverage['/control/render.js'].lineData[87]++;
    return this.config.view.getBaseCssClasses(arguments[1].params[0]);
  }
  _$jscoverage['/control/render.js'].lineData[90]++;
  function getBaseCssClassCmd() {
    _$jscoverage['/control/render.js'].functionData[7]++;
    _$jscoverage['/control/render.js'].lineData[91]++;
    return this.config.view.getBaseCssClass(arguments[1].params[0]);
  }
  _$jscoverage['/control/render.js'].lineData[99]++;
  return ComponentProcess.extend({
  isRender: true, 
  createInternal: function() {
  _$jscoverage['/control/render.js'].functionData[8]++;
  _$jscoverage['/control/render.js'].lineData[103]++;
  var self = this, srcNode = self.control.get('srcNode');
  _$jscoverage['/control/render.js'].lineData[106]++;
  if (visit20_106_1(srcNode)) {
    _$jscoverage['/control/render.js'].lineData[108]++;
    self.decorateDom(srcNode);
  } else {
    _$jscoverage['/control/render.js'].lineData[110]++;
    self.callSuper();
  }
}, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/control/render.js'].functionData[9]++;
  _$jscoverage['/control/render.js'].lineData[115]++;
  var self = this, control = self.control, width, height, visible, elAttrs = control.get('elAttrs'), cls = control.get('elCls'), disabled, attrs = control['getAttrs'](), a, attr, elStyle = control.get('elStyle'), zIndex, elCls = control.get('elCls');
  _$jscoverage['/control/render.js'].lineData[130]++;
  for (a in attrs) {
    _$jscoverage['/control/render.js'].lineData[131]++;
    attr = attrs[a];
    _$jscoverage['/control/render.js'].lineData[132]++;
    if (visit21_132_1(attr.view)) {
      _$jscoverage['/control/render.js'].lineData[133]++;
      renderData[a] = control.get(a);
    }
  }
  _$jscoverage['/control/render.js'].lineData[137]++;
  width = renderData.width;
  _$jscoverage['/control/render.js'].lineData[138]++;
  height = renderData.height;
  _$jscoverage['/control/render.js'].lineData[139]++;
  visible = renderData.visible;
  _$jscoverage['/control/render.js'].lineData[140]++;
  zIndex = renderData.zIndex;
  _$jscoverage['/control/render.js'].lineData[142]++;
  if (visit22_142_1(width)) {
    _$jscoverage['/control/render.js'].lineData[143]++;
    elStyle.width = pxSetter(width);
  }
  _$jscoverage['/control/render.js'].lineData[145]++;
  if (visit23_145_1(height)) {
    _$jscoverage['/control/render.js'].lineData[146]++;
    elStyle.height = pxSetter(height);
  }
  _$jscoverage['/control/render.js'].lineData[148]++;
  if (visit24_148_1(zIndex)) {
    _$jscoverage['/control/render.js'].lineData[149]++;
    elStyle['z-index'] = zIndex;
  }
  _$jscoverage['/control/render.js'].lineData[152]++;
  if (visit25_152_1(!visible)) {
    _$jscoverage['/control/render.js'].lineData[153]++;
    elCls.push(self.getBaseCssClasses('hidden'));
  }
  _$jscoverage['/control/render.js'].lineData[156]++;
  if (visit26_156_1(disabled = control.get('disabled'))) {
    _$jscoverage['/control/render.js'].lineData[157]++;
    cls.push(self.getBaseCssClasses('disabled'));
    _$jscoverage['/control/render.js'].lineData[158]++;
    elAttrs['aria-disabled'] = 'true';
  }
  _$jscoverage['/control/render.js'].lineData[160]++;
  if (visit27_160_1(control.get('highlighted'))) {
    _$jscoverage['/control/render.js'].lineData[161]++;
    cls.push(self.getBaseCssClasses('hover'));
  }
  _$jscoverage['/control/render.js'].lineData[163]++;
  if (visit28_163_1(control.get('focusable'))) {
    _$jscoverage['/control/render.js'].lineData[164]++;
    if (visit29_164_1(UA.ie)) {
      _$jscoverage['/control/render.js'].lineData[165]++;
      elAttrs['hideFocus'] = 'true';
    }
    _$jscoverage['/control/render.js'].lineData[167]++;
    elAttrs['tabindex'] = disabled ? '-1' : '0';
  }
}, 
  createDom: function() {
  _$jscoverage['/control/render.js'].functionData[10]++;
  _$jscoverage['/control/render.js'].lineData[172]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[173]++;
  self['beforeCreateDom'](self.renderData = {}, self.childrenElSelectors = {}, self.renderCommands = {
  getBaseCssClasses: getBaseCssClassesCmd, 
  getBaseCssClass: getBaseCssClassCmd});
  _$jscoverage['/control/render.js'].lineData[182]++;
  var control = self.control, tpl, html;
  _$jscoverage['/control/render.js'].lineData[185]++;
  tpl = startTpl + self.get('contentTpl') + endTpl;
  _$jscoverage['/control/render.js'].lineData[186]++;
  html = self.renderTpl(tpl);
  _$jscoverage['/control/render.js'].lineData[187]++;
  control.setInternal("el", self.$el = $(html));
  _$jscoverage['/control/render.js'].lineData[188]++;
  self.el = self.$el[0];
  _$jscoverage['/control/render.js'].lineData[189]++;
  self.fillChildrenElsBySelectors();
}, 
  decorateDom: function(srcNode) {
  _$jscoverage['/control/render.js'].functionData[11]++;
  _$jscoverage['/control/render.js'].lineData[193]++;
  var self = this, control = self.control;
  _$jscoverage['/control/render.js'].lineData[195]++;
  if (visit30_195_1(!srcNode.attr('id'))) {
    _$jscoverage['/control/render.js'].lineData[196]++;
    srcNode.attr('id', control.get('id'));
  }
  _$jscoverage['/control/render.js'].lineData[198]++;
  applyParser.call(self, srcNode, self.constructor.HTML_PARSER, control);
  _$jscoverage['/control/render.js'].lineData[199]++;
  control.setInternal("el", self.$el = srcNode);
  _$jscoverage['/control/render.js'].lineData[200]++;
  self.el = srcNode[0];
}, 
  renderUI: function() {
  _$jscoverage['/control/render.js'].functionData[12]++;
  _$jscoverage['/control/render.js'].lineData[204]++;
  var self = this, control = self.control, el = self.$el;
  _$jscoverage['/control/render.js'].lineData[209]++;
  if (visit31_209_1(!control.get('srcNode'))) {
    _$jscoverage['/control/render.js'].lineData[210]++;
    var render = control.get('render'), renderBefore = control.get('elBefore');
    _$jscoverage['/control/render.js'].lineData[212]++;
    if (visit32_212_1(renderBefore)) {
      _$jscoverage['/control/render.js'].lineData[213]++;
      el['insertBefore'](renderBefore, undefined);
    } else {
      _$jscoverage['/control/render.js'].lineData[214]++;
      if (visit33_214_1(render)) {
        _$jscoverage['/control/render.js'].lineData[215]++;
        el.appendTo(render, undefined);
      } else {
        _$jscoverage['/control/render.js'].lineData[217]++;
        el.appendTo(doc.body, undefined);
      }
    }
  }
}, 
  bindUI: function() {
  _$jscoverage['/control/render.js'].functionData[13]++;
  _$jscoverage['/control/render.js'].lineData[223]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[224]++;
  var control = self.control;
  _$jscoverage['/control/render.js'].lineData[225]++;
  var attrs = control['getAttrs']();
  _$jscoverage['/control/render.js'].lineData[226]++;
  var attrName, attrCfg;
  _$jscoverage['/control/render.js'].lineData[227]++;
  for (attrName in attrs) {
    _$jscoverage['/control/render.js'].lineData[228]++;
    attrCfg = attrs[attrName];
    _$jscoverage['/control/render.js'].lineData[229]++;
    var ucName = S.ucfirst(attrName);
    _$jscoverage['/control/render.js'].lineData[230]++;
    var attrChangeFn = self[ON_SET + ucName];
    _$jscoverage['/control/render.js'].lineData[231]++;
    if (visit34_231_1(attrCfg.view && attrChangeFn)) {
      _$jscoverage['/control/render.js'].lineData[233]++;
      control.on("after" + ucName + "Change", onSetAttrChange, self);
    }
  }
}, 
  destructor: function() {
  _$jscoverage['/control/render.js'].functionData[14]++;
  _$jscoverage['/control/render.js'].lineData[239]++;
  if (visit35_239_1(this.$el)) {
    _$jscoverage['/control/render.js'].lineData[240]++;
    this.$el.remove();
  }
}, 
  $: function(selector) {
  _$jscoverage['/control/render.js'].functionData[15]++;
  _$jscoverage['/control/render.js'].lineData[245]++;
  return this.$el.all(selector);
}, 
  fillChildrenElsBySelectors: function(childrenElSelectors) {
  _$jscoverage['/control/render.js'].functionData[16]++;
  _$jscoverage['/control/render.js'].lineData[249]++;
  var self = this, el = self.$el, control = self.control, childName, selector;
  _$jscoverage['/control/render.js'].lineData[255]++;
  childrenElSelectors = visit36_255_1(childrenElSelectors || self.childrenElSelectors);
  _$jscoverage['/control/render.js'].lineData[257]++;
  for (childName in childrenElSelectors) {
    _$jscoverage['/control/render.js'].lineData[258]++;
    selector = childrenElSelectors[childName];
    _$jscoverage['/control/render.js'].lineData[259]++;
    if (visit37_259_1(typeof selector === "function")) {
      _$jscoverage['/control/render.js'].lineData[260]++;
      control.setInternal(childName, selector(el));
    } else {
      _$jscoverage['/control/render.js'].lineData[262]++;
      control.setInternal(childName, self.$(S.substitute(selector, self.renderData)));
    }
    _$jscoverage['/control/render.js'].lineData[265]++;
    delete childrenElSelectors[childName];
  }
}, 
  renderTpl: function(tpl, renderData, renderCommands) {
  _$jscoverage['/control/render.js'].functionData[17]++;
  _$jscoverage['/control/render.js'].lineData[270]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[271]++;
  renderData = visit38_271_1(renderData || self.renderData);
  _$jscoverage['/control/render.js'].lineData[272]++;
  renderCommands = visit39_272_1(renderCommands || self.renderCommands);
  _$jscoverage['/control/render.js'].lineData[273]++;
  return new XTemplate(tpl, {
  control: self.control, 
  view: self, 
  commands: renderCommands}).render(renderData);
}, 
  getComponentConstructorByNode: function(prefixCls, childNode) {
  _$jscoverage['/control/render.js'].functionData[18]++;
  _$jscoverage['/control/render.js'].lineData[286]++;
  var cls = childNode[0].className;
  _$jscoverage['/control/render.js'].lineData[288]++;
  if (visit40_288_1(cls)) {
    _$jscoverage['/control/render.js'].lineData[289]++;
    cls = cls.replace(new RegExp("\\b" + prefixCls, "ig"), "");
    _$jscoverage['/control/render.js'].lineData[290]++;
    return Manager.getConstructorByXClass(cls);
  }
  _$jscoverage['/control/render.js'].lineData[292]++;
  return null;
}, 
  getComponentCssClasses: function() {
  _$jscoverage['/control/render.js'].functionData[19]++;
  _$jscoverage['/control/render.js'].lineData[296]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[297]++;
  if (visit41_297_1(self.componentCssClasses)) {
    _$jscoverage['/control/render.js'].lineData[298]++;
    return self.componentCssClasses;
  }
  _$jscoverage['/control/render.js'].lineData[300]++;
  var control = self.control, constructor = control.constructor, xclass, re = [];
  _$jscoverage['/control/render.js'].lineData[304]++;
  while (visit42_304_1(constructor && !constructor.prototype.hasOwnProperty('isControl'))) {
    _$jscoverage['/control/render.js'].lineData[305]++;
    xclass = constructor.xclass;
    _$jscoverage['/control/render.js'].lineData[306]++;
    if (visit43_306_1(xclass)) {
      _$jscoverage['/control/render.js'].lineData[307]++;
      re.push(xclass);
    }
    _$jscoverage['/control/render.js'].lineData[309]++;
    constructor = visit44_309_1(constructor.superclass && constructor.superclass.constructor);
  }
  _$jscoverage['/control/render.js'].lineData[312]++;
  return self.componentCssClasses = re;
}, 
  getBaseCssClasses: function(extras) {
  _$jscoverage['/control/render.js'].functionData[20]++;
  _$jscoverage['/control/render.js'].lineData[321]++;
  extras = normalExtras(extras);
  _$jscoverage['/control/render.js'].lineData[322]++;
  var componentCssClasses = this.getComponentCssClasses(), i = 0, control = this.get('control'), cls = '', l = componentCssClasses.length, prefixCls = control.get('prefixCls');
  _$jscoverage['/control/render.js'].lineData[328]++;
  for (; visit45_328_1(i < l); i++) {
    _$jscoverage['/control/render.js'].lineData[329]++;
    cls += prefixExtra(prefixCls, componentCssClasses[i], extras);
  }
  _$jscoverage['/control/render.js'].lineData[331]++;
  return trim(cls);
}, 
  getBaseCssClass: function(extras) {
  _$jscoverage['/control/render.js'].functionData[21]++;
  _$jscoverage['/control/render.js'].lineData[341]++;
  return trim(prefixExtra(this.control.get('prefixCls'), this.getComponentCssClasses()[0], normalExtras(extras)));
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/control/render.js'].functionData[22]++;
  _$jscoverage['/control/render.js'].lineData[354]++;
  return this.$el;
}, 
  '_onSetWidth': function(w) {
  _$jscoverage['/control/render.js'].functionData[23]++;
  _$jscoverage['/control/render.js'].lineData[358]++;
  this.$el.width(w);
}, 
  _onSetHeight: function(h) {
  _$jscoverage['/control/render.js'].functionData[24]++;
  _$jscoverage['/control/render.js'].lineData[362]++;
  this.$el.height(h);
}, 
  '_onSetContent': function(c) {
  _$jscoverage['/control/render.js'].functionData[25]++;
  _$jscoverage['/control/render.js'].lineData[366]++;
  var el = this.$el;
  _$jscoverage['/control/render.js'].lineData[367]++;
  el.html(c);
  _$jscoverage['/control/render.js'].lineData[369]++;
  if (visit46_369_1(visit47_369_2(UA.ie < 9) && !this.get('allowTextSelection'))) {
    _$jscoverage['/control/render.js'].lineData[370]++;
    el['unselectable']();
  }
}, 
  _onSetVisible: function(visible) {
  _$jscoverage['/control/render.js'].functionData[26]++;
  _$jscoverage['/control/render.js'].lineData[375]++;
  var self = this, el = self.$el, hiddenCls = self.getBaseCssClasses('hidden');
  _$jscoverage['/control/render.js'].lineData[378]++;
  if (visit48_378_1(visible)) {
    _$jscoverage['/control/render.js'].lineData[379]++;
    el.removeClass(hiddenCls);
  } else {
    _$jscoverage['/control/render.js'].lineData[381]++;
    el.addClass(hiddenCls);
  }
}, 
  _onSetHighlighted: function(v) {
  _$jscoverage['/control/render.js'].functionData[27]++;
  _$jscoverage['/control/render.js'].lineData[389]++;
  var self = this, componentCls = self.getBaseCssClasses("hover"), el = self.$el;
  _$jscoverage['/control/render.js'].lineData[392]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/control/render.js'].functionData[28]++;
  _$jscoverage['/control/render.js'].lineData[399]++;
  var self = this, control = self.control, componentCls = self.getBaseCssClasses("disabled"), el = self.$el;
  _$jscoverage['/control/render.js'].lineData[404]++;
  el[v ? 'addClass' : 'removeClass'](componentCls).attr("aria-disabled", v);
  _$jscoverage['/control/render.js'].lineData[405]++;
  if (visit49_405_1(control.get("focusable"))) {
    _$jscoverage['/control/render.js'].lineData[407]++;
    self.getKeyEventTarget().attr("tabindex", v ? -1 : 0);
  }
}, 
  '_onSetActive': function(v) {
  _$jscoverage['/control/render.js'].functionData[29]++;
  _$jscoverage['/control/render.js'].lineData[414]++;
  var self = this, componentCls = self.getBaseCssClasses("active");
  _$jscoverage['/control/render.js'].lineData[417]++;
  self.$el[v ? 'addClass' : 'removeClass'](componentCls).attr("aria-pressed", !!v);
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/control/render.js'].functionData[30]++;
  _$jscoverage['/control/render.js'].lineData[423]++;
  var self = this, el = self.$el, componentCls = self.getBaseCssClasses("focused");
  _$jscoverage['/control/render.js'].lineData[426]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  '_onSetZIndex': function(x) {
  _$jscoverage['/control/render.js'].functionData[31]++;
  _$jscoverage['/control/render.js'].lineData[430]++;
  this.$el.css("z-index", x);
}}, {
  __hooks__: {
  decorateDom: ComponentProcess.prototype.__getHook('__decorateDom'), 
  beforeCreateDom: ComponentProcess.prototype.__getHook('__beforeCreateDom')}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/control/render.js'].functionData[32]++;
  _$jscoverage['/control/render.js'].lineData[447]++;
  var SuperClass = this, NewClass, parsers = {};
  _$jscoverage['/control/render.js'].lineData[450]++;
  NewClass = ComponentProcess.extend.apply(SuperClass, arguments);
  _$jscoverage['/control/render.js'].lineData[451]++;
  NewClass[HTML_PARSER] = visit50_451_1(NewClass[HTML_PARSER] || {});
  _$jscoverage['/control/render.js'].lineData[452]++;
  if (visit51_452_1(S.isArray(extensions))) {
    _$jscoverage['/control/render.js'].lineData[455]++;
    S.each(extensions['concat'](NewClass), function(ext) {
  _$jscoverage['/control/render.js'].functionData[33]++;
  _$jscoverage['/control/render.js'].lineData[456]++;
  if (visit52_456_1(ext)) {
    _$jscoverage['/control/render.js'].lineData[458]++;
    S.each(ext.HTML_PARSER, function(v, name) {
  _$jscoverage['/control/render.js'].functionData[34]++;
  _$jscoverage['/control/render.js'].lineData[459]++;
  parsers[name] = v;
});
  }
});
    _$jscoverage['/control/render.js'].lineData[463]++;
    NewClass[HTML_PARSER] = parsers;
  }
  _$jscoverage['/control/render.js'].lineData[465]++;
  S.mix(NewClass[HTML_PARSER], SuperClass[HTML_PARSER], false);
  _$jscoverage['/control/render.js'].lineData[466]++;
  NewClass.extend = extend;
  _$jscoverage['/control/render.js'].lineData[467]++;
  return NewClass;
}, 
  ATTRS: {
  control: {
  setter: function(v) {
  _$jscoverage['/control/render.js'].functionData[35]++;
  _$jscoverage['/control/render.js'].lineData[474]++;
  this.control = v;
}}, 
  contentTpl: {
  value: '{{{content}}}'}}, 
  HTML_PARSER: {
  id: function(el) {
  _$jscoverage['/control/render.js'].functionData[36]++;
  _$jscoverage['/control/render.js'].lineData[484]++;
  var id = el[0].id;
  _$jscoverage['/control/render.js'].lineData[485]++;
  return id ? id : undefined;
}, 
  content: function(el) {
  _$jscoverage['/control/render.js'].functionData[37]++;
  _$jscoverage['/control/render.js'].lineData[488]++;
  return el.html();
}, 
  disabled: function(el) {
  _$jscoverage['/control/render.js'].functionData[38]++;
  _$jscoverage['/control/render.js'].lineData[491]++;
  return el.hasClass(this.getBaseCssClass("disabled"));
}}, 
  name: 'render'});
}, {
  requires: ['./process', 'xtemplate', './render-tpl', 'component/manager']});
