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
  _$jscoverage['/compiler.js'].lineData[8] = 0;
  _$jscoverage['/compiler.js'].lineData[11] = 0;
  _$jscoverage['/compiler.js'].lineData[14] = 0;
  _$jscoverage['/compiler.js'].lineData[15] = 0;
  _$jscoverage['/compiler.js'].lineData[18] = 0;
  _$jscoverage['/compiler.js'].lineData[19] = 0;
  _$jscoverage['/compiler.js'].lineData[24] = 0;
  _$jscoverage['/compiler.js'].lineData[26] = 0;
  _$jscoverage['/compiler.js'].lineData[28] = 0;
  _$jscoverage['/compiler.js'].lineData[30] = 0;
  _$jscoverage['/compiler.js'].lineData[36] = 0;
  _$jscoverage['/compiler.js'].lineData[37] = 0;
  _$jscoverage['/compiler.js'].lineData[40] = 0;
  _$jscoverage['/compiler.js'].lineData[41] = 0;
  _$jscoverage['/compiler.js'].lineData[42] = 0;
  _$jscoverage['/compiler.js'].lineData[45] = 0;
  _$jscoverage['/compiler.js'].lineData[47] = 0;
  _$jscoverage['/compiler.js'].lineData[49] = 0;
  _$jscoverage['/compiler.js'].lineData[52] = 0;
  _$jscoverage['/compiler.js'].lineData[53] = 0;
  _$jscoverage['/compiler.js'].lineData[55] = 0;
  _$jscoverage['/compiler.js'].lineData[56] = 0;
  _$jscoverage['/compiler.js'].lineData[58] = 0;
  _$jscoverage['/compiler.js'].lineData[62] = 0;
  _$jscoverage['/compiler.js'].lineData[63] = 0;
  _$jscoverage['/compiler.js'].lineData[66] = 0;
  _$jscoverage['/compiler.js'].lineData[67] = 0;
  _$jscoverage['/compiler.js'].lineData[70] = 0;
  _$jscoverage['/compiler.js'].lineData[73] = 0;
  _$jscoverage['/compiler.js'].lineData[80] = 0;
  _$jscoverage['/compiler.js'].lineData[81] = 0;
  _$jscoverage['/compiler.js'].lineData[82] = 0;
  _$jscoverage['/compiler.js'].lineData[83] = 0;
  _$jscoverage['/compiler.js'].lineData[84] = 0;
  _$jscoverage['/compiler.js'].lineData[86] = 0;
  _$jscoverage['/compiler.js'].lineData[87] = 0;
  _$jscoverage['/compiler.js'].lineData[88] = 0;
  _$jscoverage['/compiler.js'].lineData[89] = 0;
  _$jscoverage['/compiler.js'].lineData[90] = 0;
  _$jscoverage['/compiler.js'].lineData[91] = 0;
  _$jscoverage['/compiler.js'].lineData[94] = 0;
  _$jscoverage['/compiler.js'].lineData[98] = 0;
  _$jscoverage['/compiler.js'].lineData[99] = 0;
  _$jscoverage['/compiler.js'].lineData[102] = 0;
  _$jscoverage['/compiler.js'].lineData[107] = 0;
  _$jscoverage['/compiler.js'].lineData[108] = 0;
  _$jscoverage['/compiler.js'].lineData[109] = 0;
  _$jscoverage['/compiler.js'].lineData[111] = 0;
  _$jscoverage['/compiler.js'].lineData[112] = 0;
  _$jscoverage['/compiler.js'].lineData[113] = 0;
  _$jscoverage['/compiler.js'].lineData[122] = 0;
  _$jscoverage['/compiler.js'].lineData[126] = 0;
  _$jscoverage['/compiler.js'].lineData[128] = 0;
  _$jscoverage['/compiler.js'].lineData[129] = 0;
  _$jscoverage['/compiler.js'].lineData[130] = 0;
  _$jscoverage['/compiler.js'].lineData[133] = 0;
  _$jscoverage['/compiler.js'].lineData[134] = 0;
  _$jscoverage['/compiler.js'].lineData[135] = 0;
  _$jscoverage['/compiler.js'].lineData[136] = 0;
  _$jscoverage['/compiler.js'].lineData[138] = 0;
  _$jscoverage['/compiler.js'].lineData[146] = 0;
  _$jscoverage['/compiler.js'].lineData[152] = 0;
  _$jscoverage['/compiler.js'].lineData[153] = 0;
  _$jscoverage['/compiler.js'].lineData[155] = 0;
  _$jscoverage['/compiler.js'].lineData[156] = 0;
  _$jscoverage['/compiler.js'].lineData[157] = 0;
  _$jscoverage['/compiler.js'].lineData[158] = 0;
  _$jscoverage['/compiler.js'].lineData[159] = 0;
  _$jscoverage['/compiler.js'].lineData[162] = 0;
  _$jscoverage['/compiler.js'].lineData[163] = 0;
  _$jscoverage['/compiler.js'].lineData[164] = 0;
  _$jscoverage['/compiler.js'].lineData[165] = 0;
  _$jscoverage['/compiler.js'].lineData[170] = 0;
  _$jscoverage['/compiler.js'].lineData[173] = 0;
  _$jscoverage['/compiler.js'].lineData[174] = 0;
  _$jscoverage['/compiler.js'].lineData[175] = 0;
  _$jscoverage['/compiler.js'].lineData[176] = 0;
  _$jscoverage['/compiler.js'].lineData[180] = 0;
  _$jscoverage['/compiler.js'].lineData[183] = 0;
  _$jscoverage['/compiler.js'].lineData[184] = 0;
  _$jscoverage['/compiler.js'].lineData[185] = 0;
  _$jscoverage['/compiler.js'].lineData[186] = 0;
  _$jscoverage['/compiler.js'].lineData[190] = 0;
  _$jscoverage['/compiler.js'].lineData[193] = 0;
  _$jscoverage['/compiler.js'].lineData[197] = 0;
  _$jscoverage['/compiler.js'].lineData[203] = 0;
  _$jscoverage['/compiler.js'].lineData[204] = 0;
  _$jscoverage['/compiler.js'].lineData[206] = 0;
  _$jscoverage['/compiler.js'].lineData[207] = 0;
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
  _$jscoverage['/compiler.js'].lineData[227] = 0;
  _$jscoverage['/compiler.js'].lineData[228] = 0;
  _$jscoverage['/compiler.js'].lineData[229] = 0;
  _$jscoverage['/compiler.js'].lineData[230] = 0;
  _$jscoverage['/compiler.js'].lineData[231] = 0;
  _$jscoverage['/compiler.js'].lineData[232] = 0;
  _$jscoverage['/compiler.js'].lineData[233] = 0;
  _$jscoverage['/compiler.js'].lineData[234] = 0;
  _$jscoverage['/compiler.js'].lineData[236] = 0;
  _$jscoverage['/compiler.js'].lineData[237] = 0;
  _$jscoverage['/compiler.js'].lineData[240] = 0;
  _$jscoverage['/compiler.js'].lineData[243] = 0;
  _$jscoverage['/compiler.js'].lineData[247] = 0;
  _$jscoverage['/compiler.js'].lineData[251] = 0;
  _$jscoverage['/compiler.js'].lineData[255] = 0;
  _$jscoverage['/compiler.js'].lineData[259] = 0;
  _$jscoverage['/compiler.js'].lineData[263] = 0;
  _$jscoverage['/compiler.js'].lineData[267] = 0;
  _$jscoverage['/compiler.js'].lineData[271] = 0;
  _$jscoverage['/compiler.js'].lineData[275] = 0;
  _$jscoverage['/compiler.js'].lineData[276] = 0;
  _$jscoverage['/compiler.js'].lineData[277] = 0;
  _$jscoverage['/compiler.js'].lineData[279] = 0;
  _$jscoverage['/compiler.js'].lineData[281] = 0;
  _$jscoverage['/compiler.js'].lineData[287] = 0;
  _$jscoverage['/compiler.js'].lineData[291] = 0;
  _$jscoverage['/compiler.js'].lineData[295] = 0;
  _$jscoverage['/compiler.js'].lineData[299] = 0;
  _$jscoverage['/compiler.js'].lineData[306] = 0;
  _$jscoverage['/compiler.js'].lineData[307] = 0;
  _$jscoverage['/compiler.js'].lineData[308] = 0;
  _$jscoverage['/compiler.js'].lineData[309] = 0;
  _$jscoverage['/compiler.js'].lineData[311] = 0;
  _$jscoverage['/compiler.js'].lineData[313] = 0;
  _$jscoverage['/compiler.js'].lineData[317] = 0;
  _$jscoverage['/compiler.js'].lineData[324] = 0;
  _$jscoverage['/compiler.js'].lineData[326] = 0;
  _$jscoverage['/compiler.js'].lineData[327] = 0;
  _$jscoverage['/compiler.js'].lineData[328] = 0;
  _$jscoverage['/compiler.js'].lineData[331] = 0;
  _$jscoverage['/compiler.js'].lineData[334] = 0;
  _$jscoverage['/compiler.js'].lineData[336] = 0;
  _$jscoverage['/compiler.js'].lineData[340] = 0;
  _$jscoverage['/compiler.js'].lineData[341] = 0;
  _$jscoverage['/compiler.js'].lineData[344] = 0;
  _$jscoverage['/compiler.js'].lineData[350] = 0;
  _$jscoverage['/compiler.js'].lineData[355] = 0;
  _$jscoverage['/compiler.js'].lineData[365] = 0;
  _$jscoverage['/compiler.js'].lineData[367] = 0;
  _$jscoverage['/compiler.js'].lineData[368] = 0;
  _$jscoverage['/compiler.js'].lineData[369] = 0;
  _$jscoverage['/compiler.js'].lineData[372] = 0;
  _$jscoverage['/compiler.js'].lineData[375] = 0;
  _$jscoverage['/compiler.js'].lineData[376] = 0;
  _$jscoverage['/compiler.js'].lineData[377] = 0;
  _$jscoverage['/compiler.js'].lineData[380] = 0;
  _$jscoverage['/compiler.js'].lineData[381] = 0;
  _$jscoverage['/compiler.js'].lineData[383] = 0;
  _$jscoverage['/compiler.js'].lineData[384] = 0;
  _$jscoverage['/compiler.js'].lineData[385] = 0;
  _$jscoverage['/compiler.js'].lineData[389] = 0;
  _$jscoverage['/compiler.js'].lineData[390] = 0;
  _$jscoverage['/compiler.js'].lineData[392] = 0;
  _$jscoverage['/compiler.js'].lineData[397] = 0;
  _$jscoverage['/compiler.js'].lineData[401] = 0;
  _$jscoverage['/compiler.js'].lineData[408] = 0;
  _$jscoverage['/compiler.js'].lineData[410] = 0;
  _$jscoverage['/compiler.js'].lineData[411] = 0;
  _$jscoverage['/compiler.js'].lineData[412] = 0;
  _$jscoverage['/compiler.js'].lineData[414] = 0;
  _$jscoverage['/compiler.js'].lineData[415] = 0;
  _$jscoverage['/compiler.js'].lineData[418] = 0;
  _$jscoverage['/compiler.js'].lineData[419] = 0;
  _$jscoverage['/compiler.js'].lineData[421] = 0;
  _$jscoverage['/compiler.js'].lineData[426] = 0;
  _$jscoverage['/compiler.js'].lineData[430] = 0;
  _$jscoverage['/compiler.js'].lineData[434] = 0;
  _$jscoverage['/compiler.js'].lineData[441] = 0;
  _$jscoverage['/compiler.js'].lineData[449] = 0;
  _$jscoverage['/compiler.js'].lineData[458] = 0;
  _$jscoverage['/compiler.js'].lineData[459] = 0;
  _$jscoverage['/compiler.js'].lineData[470] = 0;
  _$jscoverage['/compiler.js'].lineData[471] = 0;
  _$jscoverage['/compiler.js'].lineData[472] = 0;
  _$jscoverage['/compiler.js'].lineData[481] = 0;
  _$jscoverage['/compiler.js'].lineData[482] = 0;
  _$jscoverage['/compiler.js'].lineData[483] = 0;
  _$jscoverage['/compiler.js'].lineData[485] = 0;
  _$jscoverage['/compiler.js'].lineData[495] = 0;
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
}
if (! _$jscoverage['/compiler.js'].branchData) {
  _$jscoverage['/compiler.js'].branchData = {};
  _$jscoverage['/compiler.js'].branchData['19'] = [];
  _$jscoverage['/compiler.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['19'][2] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['19'][3] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['41'] = [];
  _$jscoverage['/compiler.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['55'] = [];
  _$jscoverage['/compiler.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['80'] = [];
  _$jscoverage['/compiler.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['83'] = [];
  _$jscoverage['/compiler.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['86'] = [];
  _$jscoverage['/compiler.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['88'] = [];
  _$jscoverage['/compiler.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['108'] = [];
  _$jscoverage['/compiler.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['112'] = [];
  _$jscoverage['/compiler.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['128'] = [];
  _$jscoverage['/compiler.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['129'] = [];
  _$jscoverage['/compiler.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['134'] = [];
  _$jscoverage['/compiler.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['155'] = [];
  _$jscoverage['/compiler.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['162'] = [];
  _$jscoverage['/compiler.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['173'] = [];
  _$jscoverage['/compiler.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['183'] = [];
  _$jscoverage['/compiler.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['206'] = [];
  _$jscoverage['/compiler.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['211'] = [];
  _$jscoverage['/compiler.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['216'] = [];
  _$jscoverage['/compiler.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['227'] = [];
  _$jscoverage['/compiler.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['232'] = [];
  _$jscoverage['/compiler.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['308'] = [];
  _$jscoverage['/compiler.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['326'] = [];
  _$jscoverage['/compiler.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['334'] = [];
  _$jscoverage['/compiler.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['340'] = [];
  _$jscoverage['/compiler.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['367'] = [];
  _$jscoverage['/compiler.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['375'] = [];
  _$jscoverage['/compiler.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['381'] = [];
  _$jscoverage['/compiler.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['383'] = [];
  _$jscoverage['/compiler.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['389'] = [];
  _$jscoverage['/compiler.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['410'] = [];
  _$jscoverage['/compiler.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['418'] = [];
  _$jscoverage['/compiler.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['481'] = [];
  _$jscoverage['/compiler.js'].branchData['481'][1] = new BranchData();
}
_$jscoverage['/compiler.js'].branchData['481'][1].init(20, 39, 'name || (\'xtemplate\' + (xtemplateId++))');
function visit81_481_1(result) {
  _$jscoverage['/compiler.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['418'][1].init(577, 6, 'escape');
function visit80_418_1(result) {
  _$jscoverage['/compiler.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['410'][1].init(300, 7, 'code[0]');
function visit79_410_1(result) {
  _$jscoverage['/compiler.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['389'][1].init(1230, 26, 'idString in nativeCommands');
function visit78_389_1(result) {
  _$jscoverage['/compiler.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['383'][1].init(49, 28, 'typeof parts[i] !== \'string\'');
function visit77_383_1(result) {
  _$jscoverage['/compiler.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['381'][1].init(985, 5, 'i < l');
function visit76_381_1(result) {
  _$jscoverage['/compiler.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['375'][1].init(716, 19, 'programNode.inverse');
function visit75_375_1(result) {
  _$jscoverage['/compiler.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['367'][1].init(439, 11, '!optionName');
function visit74_367_1(result) {
  _$jscoverage['/compiler.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['340'][1].init(895, 26, 'idString in nativeCommands');
function visit73_340_1(result) {
  _$jscoverage['/compiler.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['334'][1].init(566, 22, 'idString === \'include\'');
function visit72_334_1(result) {
  _$jscoverage['/compiler.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['326'][1].init(291, 17, 'commandConfigCode');
function visit71_326_1(result) {
  _$jscoverage['/compiler.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['308'][1].init(419, 29, 'originalIdString === idString');
function visit70_308_1(result) {
  _$jscoverage['/compiler.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['232'][1].init(83, 17, 'nextIdNameCode[0]');
function visit69_232_1(result) {
  _$jscoverage['/compiler.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['227'][1].init(1160, 4, 'hash');
function visit68_227_1(result) {
  _$jscoverage['/compiler.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['216'][1].init(91, 17, 'nextIdNameCode[0]');
function visit67_216_1(result) {
  _$jscoverage['/compiler.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['211'][1].init(376, 6, 'params');
function visit66_211_1(result) {
  _$jscoverage['/compiler.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['206'][1].init(221, 14, 'params || hash');
function visit65_206_1(result) {
  _$jscoverage['/compiler.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['183'][1].init(1211, 15, '!name1 && name2');
function visit64_183_1(result) {
  _$jscoverage['/compiler.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['173'][1].init(878, 15, 'name1 && !name2');
function visit63_173_1(result) {
  _$jscoverage['/compiler.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['162'][1].init(483, 16, '!name1 && !name2');
function visit62_162_1(result) {
  _$jscoverage['/compiler.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['155'][1].init(252, 14, 'name1 && name2');
function visit61_155_1(result) {
  _$jscoverage['/compiler.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['134'][1].init(1064, 7, '!global');
function visit60_134_1(result) {
  _$jscoverage['/compiler.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['129'][1].init(58, 7, 'i < len');
function visit59_129_1(result) {
  _$jscoverage['/compiler.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['128'][1].init(804, 10, 'statements');
function visit58_128_1(result) {
  _$jscoverage['/compiler.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['112'][1].init(204, 6, 'global');
function visit57_112_1(result) {
  _$jscoverage['/compiler.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['108'][1].init(46, 7, '!global');
function visit56_108_1(result) {
  _$jscoverage['/compiler.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['88'][1].init(88, 17, 'nextIdNameCode[0]');
function visit55_88_1(result) {
  _$jscoverage['/compiler.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['86'][1].init(185, 10, 'idPartType');
function visit54_86_1(result) {
  _$jscoverage['/compiler.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['83'][1].init(100, 6, '!first');
function visit53_83_1(result) {
  _$jscoverage['/compiler.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['80'][1].init(241, 5, 'i < l');
function visit52_80_1(result) {
  _$jscoverage['/compiler.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['55'][1].init(87, 12, 'm.length % 2');
function visit51_55_1(result) {
  _$jscoverage['/compiler.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['41'][1].init(13, 6, 'isCode');
function visit50_41_1(result) {
  _$jscoverage['/compiler.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['19'][3].init(45, 10, 't === \'if\'');
function visit49_19_3(result) {
  _$jscoverage['/compiler.js'].branchData['19'][3].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['19'][2].init(29, 12, 't === \'with\'');
function visit48_19_2(result) {
  _$jscoverage['/compiler.js'].branchData['19'][2].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['19'][1].init(29, 26, 't === \'with\' || t === \'if\'');
function visit47_19_1(result) {
  _$jscoverage['/compiler.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/compiler.js'].functionData[0]++;
  _$jscoverage['/compiler.js'].lineData[7]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/compiler.js'].lineData[8]++;
  var nativeCode = '', t;
  _$jscoverage['/compiler.js'].lineData[11]++;
  var nativeCommands = XTemplateRuntime.nativeCommands, nativeUtils = XTemplateRuntime.utils;
  _$jscoverage['/compiler.js'].lineData[14]++;
  for (t in nativeUtils) {
    _$jscoverage['/compiler.js'].lineData[15]++;
    nativeCode += t + 'Util = utils.' + t + ',';
  }
  _$jscoverage['/compiler.js'].lineData[18]++;
  for (t in nativeCommands) {
    _$jscoverage['/compiler.js'].lineData[19]++;
    nativeCode += t + ((visit47_19_1(visit48_19_2(t === 'with') || visit49_19_3(t === 'if'))) ? ('Command = nativeCommands["' + t + '"]') : ('Command = nativeCommands.' + t)) + ',';
  }
  _$jscoverage['/compiler.js'].lineData[24]++;
  nativeCode = nativeCode.slice(0, -1);
  _$jscoverage['/compiler.js'].lineData[26]++;
  var parser = require('./compiler/parser');
  _$jscoverage['/compiler.js'].lineData[28]++;
  parser.yy = require('./compiler/ast');
  _$jscoverage['/compiler.js'].lineData[30]++;
  var doubleReg = /\\*"/g, singleReg = /\\*'/g, arrayPush = [].push, variableId = 0, xtemplateId = 0;
  _$jscoverage['/compiler.js'].lineData[36]++;
  function guid(str) {
    _$jscoverage['/compiler.js'].functionData[1]++;
    _$jscoverage['/compiler.js'].lineData[37]++;
    return str + (variableId++);
  }
  _$jscoverage['/compiler.js'].lineData[40]++;
  function escapeString(str, isCode) {
    _$jscoverage['/compiler.js'].functionData[2]++;
    _$jscoverage['/compiler.js'].lineData[41]++;
    if (visit50_41_1(isCode)) {
      _$jscoverage['/compiler.js'].lineData[42]++;
      str = escapeSingleQuoteInCodeString(str, false);
    } else {
      _$jscoverage['/compiler.js'].lineData[45]++;
      str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    _$jscoverage['/compiler.js'].lineData[47]++;
    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    _$jscoverage['/compiler.js'].lineData[49]++;
    return str;
  }
  _$jscoverage['/compiler.js'].lineData[52]++;
  function escapeSingleQuoteInCodeString(str, isDouble) {
    _$jscoverage['/compiler.js'].functionData[3]++;
    _$jscoverage['/compiler.js'].lineData[53]++;
    return str.replace(isDouble ? doubleReg : singleReg, function(m) {
  _$jscoverage['/compiler.js'].functionData[4]++;
  _$jscoverage['/compiler.js'].lineData[55]++;
  if (visit51_55_1(m.length % 2)) {
    _$jscoverage['/compiler.js'].lineData[56]++;
    m = '\\' + m;
  }
  _$jscoverage['/compiler.js'].lineData[58]++;
  return m;
});
  }
  _$jscoverage['/compiler.js'].lineData[62]++;
  function pushToArray(to, from) {
    _$jscoverage['/compiler.js'].functionData[5]++;
    _$jscoverage['/compiler.js'].lineData[63]++;
    arrayPush.apply(to, from);
  }
  _$jscoverage['/compiler.js'].lineData[66]++;
  function lastOfArray(arr) {
    _$jscoverage['/compiler.js'].functionData[6]++;
    _$jscoverage['/compiler.js'].lineData[67]++;
    return arr[arr.length - 1];
  }
  _$jscoverage['/compiler.js'].lineData[70]++;
  var gen = {
  getIdStringFromIdParts: function(source, idParts) {
  _$jscoverage['/compiler.js'].functionData[7]++;
  _$jscoverage['/compiler.js'].lineData[73]++;
  var idString = '', self = this, i, l, idPart, idPartType, nextIdNameCode, first = true;
  _$jscoverage['/compiler.js'].lineData[80]++;
  for (i = 0 , l = idParts.length; visit52_80_1(i < l); i++) {
    _$jscoverage['/compiler.js'].lineData[81]++;
    idPart = idParts[i];
    _$jscoverage['/compiler.js'].lineData[82]++;
    idPartType = idPart.type;
    _$jscoverage['/compiler.js'].lineData[83]++;
    if (visit53_83_1(!first)) {
      _$jscoverage['/compiler.js'].lineData[84]++;
      idString += '.';
    }
    _$jscoverage['/compiler.js'].lineData[86]++;
    if (visit54_86_1(idPartType)) {
      _$jscoverage['/compiler.js'].lineData[87]++;
      nextIdNameCode = self[idPartType](idPart);
      _$jscoverage['/compiler.js'].lineData[88]++;
      if (visit55_88_1(nextIdNameCode[0])) {
        _$jscoverage['/compiler.js'].lineData[89]++;
        pushToArray(source, nextIdNameCode[1]);
        _$jscoverage['/compiler.js'].lineData[90]++;
        idString += '"+' + nextIdNameCode[0] + '+"';
        _$jscoverage['/compiler.js'].lineData[91]++;
        first = true;
      } else {
        _$jscoverage['/compiler.js'].lineData[94]++;
        idString += nextIdNameCode[1][0];
      }
    } else {
      _$jscoverage['/compiler.js'].lineData[98]++;
      idString += idPart;
      _$jscoverage['/compiler.js'].lineData[99]++;
      first = false;
    }
  }
  _$jscoverage['/compiler.js'].lineData[102]++;
  return idString;
}, 
  genFunction: function(statements, global) {
  _$jscoverage['/compiler.js'].functionData[8]++;
  _$jscoverage['/compiler.js'].lineData[107]++;
  var source = [];
  _$jscoverage['/compiler.js'].lineData[108]++;
  if (visit56_108_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[109]++;
    source.push('function(scope) {');
  }
  _$jscoverage['/compiler.js'].lineData[111]++;
  source.push('var buffer = ""' + (global ? ',' : ';'));
  _$jscoverage['/compiler.js'].lineData[112]++;
  if (visit57_112_1(global)) {
    _$jscoverage['/compiler.js'].lineData[113]++;
    source.push('engine = this,' + 'moduleWrap,' + 'escapeHtml = S.escapeHtml,' + 'nativeCommands = engine.nativeCommands,' + 'utils = engine.utils;');
    _$jscoverage['/compiler.js'].lineData[122]++;
    source.push('if (typeof module !== "undefined" && module.kissy) {' + 'moduleWrap = module;' + '}');
    _$jscoverage['/compiler.js'].lineData[126]++;
    source.push('var ' + nativeCode + ';');
  }
  _$jscoverage['/compiler.js'].lineData[128]++;
  if (visit58_128_1(statements)) {
    _$jscoverage['/compiler.js'].lineData[129]++;
    for (var i = 0, len = statements.length; visit59_129_1(i < len); i++) {
      _$jscoverage['/compiler.js'].lineData[130]++;
      pushToArray(source, this[statements[i].type](statements[i]));
    }
  }
  _$jscoverage['/compiler.js'].lineData[133]++;
  source.push('return buffer;');
  _$jscoverage['/compiler.js'].lineData[134]++;
  if (visit60_134_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[135]++;
    source.push('}');
    _$jscoverage['/compiler.js'].lineData[136]++;
    return source;
  } else {
    _$jscoverage['/compiler.js'].lineData[138]++;
    return {
  params: ['scope', 'S', 'payload', 'undefined'], 
  source: source};
  }
}, 
  genOpExpression: function(e, type) {
  _$jscoverage['/compiler.js'].functionData[9]++;
  _$jscoverage['/compiler.js'].lineData[146]++;
  var source = [], name1, name2, code1 = this[e.op1.type](e.op1), code2 = this[e.op2.type](e.op2);
  _$jscoverage['/compiler.js'].lineData[152]++;
  name1 = code1[0];
  _$jscoverage['/compiler.js'].lineData[153]++;
  name2 = code2[0];
  _$jscoverage['/compiler.js'].lineData[155]++;
  if (visit61_155_1(name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[156]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[157]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[158]++;
    source.push(name1 + type + name2);
    _$jscoverage['/compiler.js'].lineData[159]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[162]++;
  if (visit62_162_1(!name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[163]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[164]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[165]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[170]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[173]++;
  if (visit63_173_1(name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[174]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[175]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[176]++;
    source.push(name1 + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[180]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[183]++;
  if (visit64_183_1(!name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[184]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[185]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[186]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + name2);
    _$jscoverage['/compiler.js'].lineData[190]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[193]++;
  return undefined;
}, 
  genOptionFromCommand: function(command) {
  _$jscoverage['/compiler.js'].functionData[10]++;
  _$jscoverage['/compiler.js'].lineData[197]++;
  var source = [], optionName, params, hash, self = this;
  _$jscoverage['/compiler.js'].lineData[203]++;
  params = command.params;
  _$jscoverage['/compiler.js'].lineData[204]++;
  hash = command.hash;
  _$jscoverage['/compiler.js'].lineData[206]++;
  if (visit65_206_1(params || hash)) {
    _$jscoverage['/compiler.js'].lineData[207]++;
    optionName = guid('option');
    _$jscoverage['/compiler.js'].lineData[208]++;
    source.push('var ' + optionName + ' = {};');
  }
  _$jscoverage['/compiler.js'].lineData[211]++;
  if (visit66_211_1(params)) {
    _$jscoverage['/compiler.js'].lineData[212]++;
    var paramsName = guid('params');
    _$jscoverage['/compiler.js'].lineData[213]++;
    source.push('var ' + paramsName + ' = [];');
    _$jscoverage['/compiler.js'].lineData[214]++;
    S.each(params, function(param) {
  _$jscoverage['/compiler.js'].functionData[11]++;
  _$jscoverage['/compiler.js'].lineData[215]++;
  var nextIdNameCode = self[param.type](param);
  _$jscoverage['/compiler.js'].lineData[216]++;
  if (visit67_216_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[217]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[218]++;
    source.push(paramsName + '.push(' + nextIdNameCode[0] + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[220]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[221]++;
    source.push(paramsName + '.push(' + lastOfArray(nextIdNameCode[1]) + ');');
  }
});
    _$jscoverage['/compiler.js'].lineData[224]++;
    source.push(optionName + '.params=' + paramsName + ';');
  }
  _$jscoverage['/compiler.js'].lineData[227]++;
  if (visit68_227_1(hash)) {
    _$jscoverage['/compiler.js'].lineData[228]++;
    var hashName = guid('hash');
    _$jscoverage['/compiler.js'].lineData[229]++;
    source.push('var ' + hashName + ' = {};');
    _$jscoverage['/compiler.js'].lineData[230]++;
    S.each(hash.value, function(v, key) {
  _$jscoverage['/compiler.js'].functionData[12]++;
  _$jscoverage['/compiler.js'].lineData[231]++;
  var nextIdNameCode = self[v.type](v);
  _$jscoverage['/compiler.js'].lineData[232]++;
  if (visit69_232_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[233]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[234]++;
    source.push(hashName + '["' + key + '"] = ' + nextIdNameCode[0] + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[236]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[237]++;
    source.push(hashName + '["' + key + '"] = ' + lastOfArray(nextIdNameCode[1]) + ';');
  }
});
    _$jscoverage['/compiler.js'].lineData[240]++;
    source.push(optionName + '.hash=' + hashName + ';');
  }
  _$jscoverage['/compiler.js'].lineData[243]++;
  return [optionName, source];
}, 
  'conditionalOrExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[13]++;
  _$jscoverage['/compiler.js'].lineData[247]++;
  return this.genOpExpression(e, '||');
}, 
  'conditionalAndExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[14]++;
  _$jscoverage['/compiler.js'].lineData[251]++;
  return this.genOpExpression(e, '&&');
}, 
  'relationalExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[15]++;
  _$jscoverage['/compiler.js'].lineData[255]++;
  return this.genOpExpression(e, e.opType);
}, 
  'equalityExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[16]++;
  _$jscoverage['/compiler.js'].lineData[259]++;
  return this.genOpExpression(e, e.opType);
}, 
  'additiveExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[17]++;
  _$jscoverage['/compiler.js'].lineData[263]++;
  return this.genOpExpression(e, e.opType);
}, 
  'multiplicativeExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[18]++;
  _$jscoverage['/compiler.js'].lineData[267]++;
  return this.genOpExpression(e, e.opType);
}, 
  'unaryExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[19]++;
  _$jscoverage['/compiler.js'].lineData[271]++;
  var source = [], name, unaryType = e.unaryType, code = this[e.value.type](e.value);
  _$jscoverage['/compiler.js'].lineData[275]++;
  arrayPush.apply(source, code[1]);
  _$jscoverage['/compiler.js'].lineData[276]++;
  if ((name = code[0])) {
    _$jscoverage['/compiler.js'].lineData[277]++;
    source.push(name + '=' + unaryType + name + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[279]++;
    source[source.length - 1] = '' + unaryType + lastOfArray(source);
  }
  _$jscoverage['/compiler.js'].lineData[281]++;
  return [name, source];
}, 
  'string': function(e) {
  _$jscoverage['/compiler.js'].functionData[20]++;
  _$jscoverage['/compiler.js'].lineData[287]++;
  return ['', ["'" + escapeString(e.value, true) + "'"]];
}, 
  'number': function(e) {
  _$jscoverage['/compiler.js'].functionData[21]++;
  _$jscoverage['/compiler.js'].lineData[291]++;
  return ['', [e.value]];
}, 
  'boolean': function(e) {
  _$jscoverage['/compiler.js'].functionData[22]++;
  _$jscoverage['/compiler.js'].lineData[295]++;
  return ['', [e.value]];
}, 
  'id': function(idNode) {
  _$jscoverage['/compiler.js'].functionData[23]++;
  _$jscoverage['/compiler.js'].lineData[299]++;
  var source = [], depth = idNode.depth, idParts = idNode.parts, originalIdString = idNode.string, idName = guid('id'), self = this;
  _$jscoverage['/compiler.js'].lineData[306]++;
  var idString = self.getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[307]++;
  var depthParam = depth ? (',' + depth) : '';
  _$jscoverage['/compiler.js'].lineData[308]++;
  if (visit70_308_1(originalIdString === idString)) {
    _$jscoverage['/compiler.js'].lineData[309]++;
    source.push('var ' + idName + ' = scope.resolve(["' + idParts.join('","') + '"]' + depthParam + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[311]++;
    source.push('var ' + idName + ' = scope.resolve("' + idString + '"' + depthParam + ');');
  }
  _$jscoverage['/compiler.js'].lineData[313]++;
  return [idName, source];
}, 
  'command': function(command) {
  _$jscoverage['/compiler.js'].functionData[24]++;
  _$jscoverage['/compiler.js'].lineData[317]++;
  var source = [], idNode = command.id, optionName, idParts = idNode.parts, idName = guid('id'), self = this;
  _$jscoverage['/compiler.js'].lineData[324]++;
  var commandConfigCode = self.genOptionFromCommand(command);
  _$jscoverage['/compiler.js'].lineData[326]++;
  if (visit71_326_1(commandConfigCode)) {
    _$jscoverage['/compiler.js'].lineData[327]++;
    optionName = commandConfigCode[0];
    _$jscoverage['/compiler.js'].lineData[328]++;
    pushToArray(source, commandConfigCode[1]);
  }
  _$jscoverage['/compiler.js'].lineData[331]++;
  var idString = self.getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[334]++;
  if (visit72_334_1(idString === 'include')) {
    _$jscoverage['/compiler.js'].lineData[336]++;
    source.push('if(moduleWrap) {re' + 'quire("' + command.params[0].value + '");' + optionName + '.params[0] = moduleWrap.resolveByName(' + optionName + '.params[0]);' + '}');
  }
  _$jscoverage['/compiler.js'].lineData[340]++;
  if (visit73_340_1(idString in nativeCommands)) {
    _$jscoverage['/compiler.js'].lineData[341]++;
    source.push('var ' + idName + ' = ' + idString + 'Command.call(engine,scope,' + optionName + ',payload);');
  } else {
    _$jscoverage['/compiler.js'].lineData[344]++;
    source.push('var ' + idName + ' = callCommandUtil(engine,scope,' + optionName + ',"' + idString + '",' + idNode.lineNumber + ');');
  }
  _$jscoverage['/compiler.js'].lineData[350]++;
  return [idName, source];
}, 
  'blockStatement': function(block) {
  _$jscoverage['/compiler.js'].functionData[25]++;
  _$jscoverage['/compiler.js'].lineData[355]++;
  var programNode = block.program, source = [], self = this, command = block.command, commandConfigCode = self.genOptionFromCommand(command), optionName = commandConfigCode[0], id = command.id, idString = id.string, inverseFn;
  _$jscoverage['/compiler.js'].lineData[365]++;
  pushToArray(source, commandConfigCode[1]);
  _$jscoverage['/compiler.js'].lineData[367]++;
  if (visit74_367_1(!optionName)) {
    _$jscoverage['/compiler.js'].lineData[368]++;
    optionName = S.guid('option');
    _$jscoverage['/compiler.js'].lineData[369]++;
    source.push('var ' + optionName + ' = {};');
  }
  _$jscoverage['/compiler.js'].lineData[372]++;
  source.push(optionName + '.fn=' + self.genFunction(programNode.statements).join('\n') + ';');
  _$jscoverage['/compiler.js'].lineData[375]++;
  if (visit75_375_1(programNode.inverse)) {
    _$jscoverage['/compiler.js'].lineData[376]++;
    inverseFn = self.genFunction(programNode.inverse).join('\n');
    _$jscoverage['/compiler.js'].lineData[377]++;
    source.push(optionName + '.inverse=' + inverseFn + ';');
  }
  _$jscoverage['/compiler.js'].lineData[380]++;
  var parts = id.parts;
  _$jscoverage['/compiler.js'].lineData[381]++;
  for (var i = 0, l = parts.length; visit76_381_1(i < l); i++) {
    _$jscoverage['/compiler.js'].lineData[383]++;
    if (visit77_383_1(typeof parts[i] !== 'string')) {
      _$jscoverage['/compiler.js'].lineData[384]++;
      idString = self.getIdStringFromIdParts(source, parts);
      _$jscoverage['/compiler.js'].lineData[385]++;
      break;
    }
  }
  _$jscoverage['/compiler.js'].lineData[389]++;
  if (visit78_389_1(idString in nativeCommands)) {
    _$jscoverage['/compiler.js'].lineData[390]++;
    source.push('buffer += ' + idString + 'Command.call(engine, scope, ' + optionName + ',payload);');
  } else {
    _$jscoverage['/compiler.js'].lineData[392]++;
    source.push('buffer += callCommandUtil(engine, scope, ' + optionName + ', ' + '"' + idString + '", ' + id.lineNumber + ');');
  }
  _$jscoverage['/compiler.js'].lineData[397]++;
  return source;
}, 
  'expressionStatement': function(expressionStatement) {
  _$jscoverage['/compiler.js'].functionData[26]++;
  _$jscoverage['/compiler.js'].lineData[401]++;
  var source = [], escape = expressionStatement.escape, code, expression = expressionStatement.value, type = expression.type, expressionOrVariable;
  _$jscoverage['/compiler.js'].lineData[408]++;
  code = this[type](expression);
  _$jscoverage['/compiler.js'].lineData[410]++;
  if (visit79_410_1(code[0])) {
    _$jscoverage['/compiler.js'].lineData[411]++;
    pushToArray(source, code[1]);
    _$jscoverage['/compiler.js'].lineData[412]++;
    expressionOrVariable = code[0];
  } else {
    _$jscoverage['/compiler.js'].lineData[414]++;
    pushToArray(source, code[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[415]++;
    expressionOrVariable = lastOfArray(code[1]);
  }
  _$jscoverage['/compiler.js'].lineData[418]++;
  if (visit80_418_1(escape)) {
    _$jscoverage['/compiler.js'].lineData[419]++;
    source.push('buffer += escapeHtml(' + expressionOrVariable + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[421]++;
    source.push('if(' + expressionOrVariable + ' || ' + expressionOrVariable + ' === 0) { ' + 'buffer += ' + expressionOrVariable + ';' + ' }');
  }
  _$jscoverage['/compiler.js'].lineData[426]++;
  return source;
}, 
  'contentStatement': function(contentStatement) {
  _$jscoverage['/compiler.js'].functionData[27]++;
  _$jscoverage['/compiler.js'].lineData[430]++;
  return ['buffer += \'' + escapeString(contentStatement.value, false) + '\';'];
}};
  _$jscoverage['/compiler.js'].lineData[434]++;
  var compiler;
  _$jscoverage['/compiler.js'].lineData[441]++;
  compiler = {
  parse: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[28]++;
  _$jscoverage['/compiler.js'].lineData[449]++;
  return parser.parse(name, tpl);
}, 
  compileToStr: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[29]++;
  _$jscoverage['/compiler.js'].lineData[458]++;
  var func = compiler.compile(tpl, name);
  _$jscoverage['/compiler.js'].lineData[459]++;
  return 'function(' + func.params.join(',') + '){\n' + func.source.join('\n') + '}';
}, 
  compile: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[30]++;
  _$jscoverage['/compiler.js'].lineData[470]++;
  var root = compiler.parse(name, tpl);
  _$jscoverage['/compiler.js'].lineData[471]++;
  variableId = 0;
  _$jscoverage['/compiler.js'].lineData[472]++;
  return gen.genFunction(root.statements, true);
}, 
  compileToFn: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[31]++;
  _$jscoverage['/compiler.js'].lineData[481]++;
  name = visit81_481_1(name || ('xtemplate' + (xtemplateId++)));
  _$jscoverage['/compiler.js'].lineData[482]++;
  var code = compiler.compile(tpl, name);
  _$jscoverage['/compiler.js'].lineData[483]++;
  var sourceURL = 'sourceURL=' + name + '.js';
  _$jscoverage['/compiler.js'].lineData[485]++;
  return Function.apply(null, [].concat(code.params).concat(code.source.join('\n') + '\n//@ ' + sourceURL + '\n//# ' + sourceURL));
}};
  _$jscoverage['/compiler.js'].lineData[495]++;
  return compiler;
});
