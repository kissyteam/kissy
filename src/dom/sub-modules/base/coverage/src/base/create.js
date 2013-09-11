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
if (! _$jscoverage['/base/create.js']) {
  _$jscoverage['/base/create.js'] = {};
  _$jscoverage['/base/create.js'].lineData = [];
  _$jscoverage['/base/create.js'].lineData[6] = 0;
  _$jscoverage['/base/create.js'].lineData[7] = 0;
  _$jscoverage['/base/create.js'].lineData[25] = 0;
  _$jscoverage['/base/create.js'].lineData[26] = 0;
  _$jscoverage['/base/create.js'].lineData[29] = 0;
  _$jscoverage['/base/create.js'].lineData[30] = 0;
  _$jscoverage['/base/create.js'].lineData[31] = 0;
  _$jscoverage['/base/create.js'].lineData[32] = 0;
  _$jscoverage['/base/create.js'].lineData[34] = 0;
  _$jscoverage['/base/create.js'].lineData[37] = 0;
  _$jscoverage['/base/create.js'].lineData[38] = 0;
  _$jscoverage['/base/create.js'].lineData[41] = 0;
  _$jscoverage['/base/create.js'].lineData[42] = 0;
  _$jscoverage['/base/create.js'].lineData[44] = 0;
  _$jscoverage['/base/create.js'].lineData[47] = 0;
  _$jscoverage['/base/create.js'].lineData[48] = 0;
  _$jscoverage['/base/create.js'].lineData[50] = 0;
  _$jscoverage['/base/create.js'].lineData[51] = 0;
  _$jscoverage['/base/create.js'].lineData[54] = 0;
  _$jscoverage['/base/create.js'].lineData[71] = 0;
  _$jscoverage['/base/create.js'].lineData[73] = 0;
  _$jscoverage['/base/create.js'].lineData[74] = 0;
  _$jscoverage['/base/create.js'].lineData[77] = 0;
  _$jscoverage['/base/create.js'].lineData[78] = 0;
  _$jscoverage['/base/create.js'].lineData[82] = 0;
  _$jscoverage['/base/create.js'].lineData[83] = 0;
  _$jscoverage['/base/create.js'].lineData[86] = 0;
  _$jscoverage['/base/create.js'].lineData[87] = 0;
  _$jscoverage['/base/create.js'].lineData[90] = 0;
  _$jscoverage['/base/create.js'].lineData[91] = 0;
  _$jscoverage['/base/create.js'].lineData[94] = 0;
  _$jscoverage['/base/create.js'].lineData[103] = 0;
  _$jscoverage['/base/create.js'].lineData[104] = 0;
  _$jscoverage['/base/create.js'].lineData[107] = 0;
  _$jscoverage['/base/create.js'].lineData[108] = 0;
  _$jscoverage['/base/create.js'].lineData[113] = 0;
  _$jscoverage['/base/create.js'].lineData[115] = 0;
  _$jscoverage['/base/create.js'].lineData[116] = 0;
  _$jscoverage['/base/create.js'].lineData[119] = 0;
  _$jscoverage['/base/create.js'].lineData[121] = 0;
  _$jscoverage['/base/create.js'].lineData[123] = 0;
  _$jscoverage['/base/create.js'].lineData[126] = 0;
  _$jscoverage['/base/create.js'].lineData[128] = 0;
  _$jscoverage['/base/create.js'].lineData[131] = 0;
  _$jscoverage['/base/create.js'].lineData[133] = 0;
  _$jscoverage['/base/create.js'].lineData[135] = 0;
  _$jscoverage['/base/create.js'].lineData[136] = 0;
  _$jscoverage['/base/create.js'].lineData[138] = 0;
  _$jscoverage['/base/create.js'].lineData[140] = 0;
  _$jscoverage['/base/create.js'].lineData[144] = 0;
  _$jscoverage['/base/create.js'].lineData[149] = 0;
  _$jscoverage['/base/create.js'].lineData[150] = 0;
  _$jscoverage['/base/create.js'].lineData[151] = 0;
  _$jscoverage['/base/create.js'].lineData[171] = 0;
  _$jscoverage['/base/create.js'].lineData[176] = 0;
  _$jscoverage['/base/create.js'].lineData[177] = 0;
  _$jscoverage['/base/create.js'].lineData[180] = 0;
  _$jscoverage['/base/create.js'].lineData[182] = 0;
  _$jscoverage['/base/create.js'].lineData[183] = 0;
  _$jscoverage['/base/create.js'].lineData[184] = 0;
  _$jscoverage['/base/create.js'].lineData[185] = 0;
  _$jscoverage['/base/create.js'].lineData[186] = 0;
  _$jscoverage['/base/create.js'].lineData[187] = 0;
  _$jscoverage['/base/create.js'].lineData[189] = 0;
  _$jscoverage['/base/create.js'].lineData[194] = 0;
  _$jscoverage['/base/create.js'].lineData[198] = 0;
  _$jscoverage['/base/create.js'].lineData[201] = 0;
  _$jscoverage['/base/create.js'].lineData[202] = 0;
  _$jscoverage['/base/create.js'].lineData[203] = 0;
  _$jscoverage['/base/create.js'].lineData[204] = 0;
  _$jscoverage['/base/create.js'].lineData[205] = 0;
  _$jscoverage['/base/create.js'].lineData[206] = 0;
  _$jscoverage['/base/create.js'].lineData[209] = 0;
  _$jscoverage['/base/create.js'].lineData[217] = 0;
  _$jscoverage['/base/create.js'].lineData[218] = 0;
  _$jscoverage['/base/create.js'].lineData[219] = 0;
  _$jscoverage['/base/create.js'].lineData[220] = 0;
  _$jscoverage['/base/create.js'].lineData[223] = 0;
  _$jscoverage['/base/create.js'].lineData[235] = 0;
  _$jscoverage['/base/create.js'].lineData[241] = 0;
  _$jscoverage['/base/create.js'].lineData[242] = 0;
  _$jscoverage['/base/create.js'].lineData[245] = 0;
  _$jscoverage['/base/create.js'].lineData[246] = 0;
  _$jscoverage['/base/create.js'].lineData[247] = 0;
  _$jscoverage['/base/create.js'].lineData[249] = 0;
  _$jscoverage['/base/create.js'].lineData[250] = 0;
  _$jscoverage['/base/create.js'].lineData[251] = 0;
  _$jscoverage['/base/create.js'].lineData[254] = 0;
  _$jscoverage['/base/create.js'].lineData[255] = 0;
  _$jscoverage['/base/create.js'].lineData[256] = 0;
  _$jscoverage['/base/create.js'].lineData[257] = 0;
  _$jscoverage['/base/create.js'].lineData[258] = 0;
  _$jscoverage['/base/create.js'].lineData[259] = 0;
  _$jscoverage['/base/create.js'].lineData[260] = 0;
  _$jscoverage['/base/create.js'].lineData[261] = 0;
  _$jscoverage['/base/create.js'].lineData[265] = 0;
  _$jscoverage['/base/create.js'].lineData[266] = 0;
  _$jscoverage['/base/create.js'].lineData[267] = 0;
  _$jscoverage['/base/create.js'].lineData[270] = 0;
  _$jscoverage['/base/create.js'].lineData[279] = 0;
  _$jscoverage['/base/create.js'].lineData[285] = 0;
  _$jscoverage['/base/create.js'].lineData[286] = 0;
  _$jscoverage['/base/create.js'].lineData[287] = 0;
  _$jscoverage['/base/create.js'].lineData[288] = 0;
  _$jscoverage['/base/create.js'].lineData[289] = 0;
  _$jscoverage['/base/create.js'].lineData[290] = 0;
  _$jscoverage['/base/create.js'].lineData[291] = 0;
  _$jscoverage['/base/create.js'].lineData[292] = 0;
  _$jscoverage['/base/create.js'].lineData[295] = 0;
  _$jscoverage['/base/create.js'].lineData[301] = 0;
  _$jscoverage['/base/create.js'].lineData[328] = 0;
  _$jscoverage['/base/create.js'].lineData[329] = 0;
  _$jscoverage['/base/create.js'].lineData[330] = 0;
  _$jscoverage['/base/create.js'].lineData[331] = 0;
  _$jscoverage['/base/create.js'].lineData[334] = 0;
  _$jscoverage['/base/create.js'].lineData[339] = 0;
  _$jscoverage['/base/create.js'].lineData[340] = 0;
  _$jscoverage['/base/create.js'].lineData[343] = 0;
  _$jscoverage['/base/create.js'].lineData[349] = 0;
  _$jscoverage['/base/create.js'].lineData[353] = 0;
  _$jscoverage['/base/create.js'].lineData[360] = 0;
  _$jscoverage['/base/create.js'].lineData[361] = 0;
  _$jscoverage['/base/create.js'].lineData[364] = 0;
  _$jscoverage['/base/create.js'].lineData[365] = 0;
  _$jscoverage['/base/create.js'].lineData[369] = 0;
  _$jscoverage['/base/create.js'].lineData[370] = 0;
  _$jscoverage['/base/create.js'].lineData[371] = 0;
  _$jscoverage['/base/create.js'].lineData[372] = 0;
  _$jscoverage['/base/create.js'].lineData[375] = 0;
  _$jscoverage['/base/create.js'].lineData[383] = 0;
  _$jscoverage['/base/create.js'].lineData[385] = 0;
  _$jscoverage['/base/create.js'].lineData[386] = 0;
  _$jscoverage['/base/create.js'].lineData[387] = 0;
  _$jscoverage['/base/create.js'].lineData[395] = 0;
  _$jscoverage['/base/create.js'].lineData[397] = 0;
  _$jscoverage['/base/create.js'].lineData[398] = 0;
  _$jscoverage['/base/create.js'].lineData[399] = 0;
  _$jscoverage['/base/create.js'].lineData[400] = 0;
  _$jscoverage['/base/create.js'].lineData[403] = 0;
  _$jscoverage['/base/create.js'].lineData[404] = 0;
  _$jscoverage['/base/create.js'].lineData[405] = 0;
  _$jscoverage['/base/create.js'].lineData[407] = 0;
  _$jscoverage['/base/create.js'].lineData[409] = 0;
  _$jscoverage['/base/create.js'].lineData[410] = 0;
  _$jscoverage['/base/create.js'].lineData[413] = 0;
  _$jscoverage['/base/create.js'].lineData[414] = 0;
  _$jscoverage['/base/create.js'].lineData[415] = 0;
  _$jscoverage['/base/create.js'].lineData[417] = 0;
  _$jscoverage['/base/create.js'].lineData[423] = 0;
  _$jscoverage['/base/create.js'].lineData[424] = 0;
  _$jscoverage['/base/create.js'].lineData[428] = 0;
  _$jscoverage['/base/create.js'].lineData[429] = 0;
  _$jscoverage['/base/create.js'].lineData[432] = 0;
  _$jscoverage['/base/create.js'].lineData[435] = 0;
  _$jscoverage['/base/create.js'].lineData[436] = 0;
  _$jscoverage['/base/create.js'].lineData[440] = 0;
  _$jscoverage['/base/create.js'].lineData[442] = 0;
  _$jscoverage['/base/create.js'].lineData[447] = 0;
  _$jscoverage['/base/create.js'].lineData[448] = 0;
  _$jscoverage['/base/create.js'].lineData[449] = 0;
  _$jscoverage['/base/create.js'].lineData[450] = 0;
  _$jscoverage['/base/create.js'].lineData[453] = 0;
  _$jscoverage['/base/create.js'].lineData[454] = 0;
  _$jscoverage['/base/create.js'].lineData[457] = 0;
  _$jscoverage['/base/create.js'].lineData[461] = 0;
  _$jscoverage['/base/create.js'].lineData[462] = 0;
  _$jscoverage['/base/create.js'].lineData[466] = 0;
  _$jscoverage['/base/create.js'].lineData[467] = 0;
  _$jscoverage['/base/create.js'].lineData[468] = 0;
  _$jscoverage['/base/create.js'].lineData[469] = 0;
  _$jscoverage['/base/create.js'].lineData[470] = 0;
  _$jscoverage['/base/create.js'].lineData[471] = 0;
  _$jscoverage['/base/create.js'].lineData[474] = 0;
  _$jscoverage['/base/create.js'].lineData[476] = 0;
  _$jscoverage['/base/create.js'].lineData[480] = 0;
  _$jscoverage['/base/create.js'].lineData[496] = 0;
  _$jscoverage['/base/create.js'].lineData[497] = 0;
  _$jscoverage['/base/create.js'].lineData[498] = 0;
  _$jscoverage['/base/create.js'].lineData[499] = 0;
  _$jscoverage['/base/create.js'].lineData[507] = 0;
  _$jscoverage['/base/create.js'].lineData[508] = 0;
  _$jscoverage['/base/create.js'].lineData[511] = 0;
}
if (! _$jscoverage['/base/create.js'].functionData) {
  _$jscoverage['/base/create.js'].functionData = [];
  _$jscoverage['/base/create.js'].functionData[0] = 0;
  _$jscoverage['/base/create.js'].functionData[1] = 0;
  _$jscoverage['/base/create.js'].functionData[2] = 0;
  _$jscoverage['/base/create.js'].functionData[3] = 0;
  _$jscoverage['/base/create.js'].functionData[4] = 0;
  _$jscoverage['/base/create.js'].functionData[5] = 0;
  _$jscoverage['/base/create.js'].functionData[6] = 0;
  _$jscoverage['/base/create.js'].functionData[7] = 0;
  _$jscoverage['/base/create.js'].functionData[8] = 0;
  _$jscoverage['/base/create.js'].functionData[9] = 0;
  _$jscoverage['/base/create.js'].functionData[10] = 0;
  _$jscoverage['/base/create.js'].functionData[11] = 0;
  _$jscoverage['/base/create.js'].functionData[12] = 0;
  _$jscoverage['/base/create.js'].functionData[13] = 0;
  _$jscoverage['/base/create.js'].functionData[14] = 0;
  _$jscoverage['/base/create.js'].functionData[15] = 0;
  _$jscoverage['/base/create.js'].functionData[16] = 0;
  _$jscoverage['/base/create.js'].functionData[17] = 0;
  _$jscoverage['/base/create.js'].functionData[18] = 0;
}
if (! _$jscoverage['/base/create.js'].branchData) {
  _$jscoverage['/base/create.js'].branchData = {};
  _$jscoverage['/base/create.js'].branchData['14'] = [];
  _$jscoverage['/base/create.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['19'] = [];
  _$jscoverage['/base/create.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['19'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['21'] = [];
  _$jscoverage['/base/create.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['31'] = [];
  _$jscoverage['/base/create.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['38'] = [];
  _$jscoverage['/base/create.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['38'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['41'] = [];
  _$jscoverage['/base/create.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['73'] = [];
  _$jscoverage['/base/create.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['77'] = [];
  _$jscoverage['/base/create.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['82'] = [];
  _$jscoverage['/base/create.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['86'] = [];
  _$jscoverage['/base/create.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['90'] = [];
  _$jscoverage['/base/create.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['97'] = [];
  _$jscoverage['/base/create.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['103'] = [];
  _$jscoverage['/base/create.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['115'] = [];
  _$jscoverage['/base/create.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['119'] = [];
  _$jscoverage['/base/create.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['121'] = [];
  _$jscoverage['/base/create.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['126'] = [];
  _$jscoverage['/base/create.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['126'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['133'] = [];
  _$jscoverage['/base/create.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['136'] = [];
  _$jscoverage['/base/create.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['149'] = [];
  _$jscoverage['/base/create.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['176'] = [];
  _$jscoverage['/base/create.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['180'] = [];
  _$jscoverage['/base/create.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['182'] = [];
  _$jscoverage['/base/create.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['184'] = [];
  _$jscoverage['/base/create.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['198'] = [];
  _$jscoverage['/base/create.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['199'] = [];
  _$jscoverage['/base/create.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['199'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['199'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['202'] = [];
  _$jscoverage['/base/create.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['204'] = [];
  _$jscoverage['/base/create.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['217'] = [];
  _$jscoverage['/base/create.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['241'] = [];
  _$jscoverage['/base/create.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['245'] = [];
  _$jscoverage['/base/create.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['246'] = [];
  _$jscoverage['/base/create.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['246'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['255'] = [];
  _$jscoverage['/base/create.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['256'] = [];
  _$jscoverage['/base/create.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['258'] = [];
  _$jscoverage['/base/create.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['285'] = [];
  _$jscoverage['/base/create.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['287'] = [];
  _$jscoverage['/base/create.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['287'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['291'] = [];
  _$jscoverage['/base/create.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['295'] = [];
  _$jscoverage['/base/create.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['301'] = [];
  _$jscoverage['/base/create.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['301'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['328'] = [];
  _$jscoverage['/base/create.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['339'] = [];
  _$jscoverage['/base/create.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['353'] = [];
  _$jscoverage['/base/create.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['353'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['354'] = [];
  _$jscoverage['/base/create.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['360'] = [];
  _$jscoverage['/base/create.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['360'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['364'] = [];
  _$jscoverage['/base/create.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['369'] = [];
  _$jscoverage['/base/create.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['371'] = [];
  _$jscoverage['/base/create.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['385'] = [];
  _$jscoverage['/base/create.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['399'] = [];
  _$jscoverage['/base/create.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['404'] = [];
  _$jscoverage['/base/create.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['409'] = [];
  _$jscoverage['/base/create.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['414'] = [];
  _$jscoverage['/base/create.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['428'] = [];
  _$jscoverage['/base/create.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['428'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['440'] = [];
  _$jscoverage['/base/create.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['448'] = [];
  _$jscoverage['/base/create.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['449'] = [];
  _$jscoverage['/base/create.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['453'] = [];
  _$jscoverage['/base/create.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['466'] = [];
  _$jscoverage['/base/create.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['466'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['466'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['470'] = [];
  _$jscoverage['/base/create.js'].branchData['470'][1] = new BranchData();
}
_$jscoverage['/base/create.js'].branchData['470'][1].init(189, 7, 'i < len');
function visit184_470_1(result) {
  _$jscoverage['/base/create.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['466'][3].init(106, 24, 'nodes.push || nodes.item');
function visit183_466_3(result) {
  _$jscoverage['/base/create.js'].branchData['466'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['466'][2].init(106, 37, '(nodes.push || nodes.item) && nodes[0]');
function visit182_466_2(result) {
  _$jscoverage['/base/create.js'].branchData['466'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['466'][1].init(96, 47, 'nodes && (nodes.push || nodes.item) && nodes[0]');
function visit181_466_1(result) {
  _$jscoverage['/base/create.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['453'][1].init(178, 48, 'elem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit180_453_1(result) {
  _$jscoverage['/base/create.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['449'][1].init(18, 38, 'elem.nodeType == NodeType.ELEMENT_NODE');
function visit179_449_1(result) {
  _$jscoverage['/base/create.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['448'][1].init(14, 22, 'S.isPlainObject(props)');
function visit178_448_1(result) {
  _$jscoverage['/base/create.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['440'][1].init(384, 8, 'DOMEvent');
function visit177_440_1(result) {
  _$jscoverage['/base/create.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['428'][2].init(102, 38, 'dest.nodeType == NodeType.ELEMENT_NODE');
function visit176_428_2(result) {
  _$jscoverage['/base/create.js'].branchData['428'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['428'][1].init(102, 59, 'dest.nodeType == NodeType.ELEMENT_NODE && !Dom.hasData(src)');
function visit175_428_1(result) {
  _$jscoverage['/base/create.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['414'][1].init(22, 21, 'cloneChildren[cIndex]');
function visit174_414_1(result) {
  _$jscoverage['/base/create.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['409'][1].init(446, 37, 'elemNodeType == NodeType.ELEMENT_NODE');
function visit173_409_1(result) {
  _$jscoverage['/base/create.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['404'][1].init(22, 15, 'cloneCs[fIndex]');
function visit172_404_1(result) {
  _$jscoverage['/base/create.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['399'][1].init(57, 47, 'elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit171_399_1(result) {
  _$jscoverage['/base/create.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['385'][1].init(119, 6, 'i >= 0');
function visit170_385_1(result) {
  _$jscoverage['/base/create.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['371'][1].init(83, 28, 'deep && deepWithDataAndEvent');
function visit169_371_1(result) {
  _$jscoverage['/base/create.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['369'][1].init(1778, 16, 'withDataAndEvent');
function visit168_369_1(result) {
  _$jscoverage['/base/create.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['364'][1].init(584, 27, 'deep && _fixCloneAttributes');
function visit167_364_1(result) {
  _$jscoverage['/base/create.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['360'][2].init(434, 37, 'elemNodeType == NodeType.ELEMENT_NODE');
function visit166_360_2(result) {
  _$jscoverage['/base/create.js'].branchData['360'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['360'][1].init(411, 60, '_fixCloneAttributes && elemNodeType == NodeType.ELEMENT_NODE');
function visit165_360_1(result) {
  _$jscoverage['/base/create.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['354'][1].init(61, 47, 'elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit164_354_1(result) {
  _$jscoverage['/base/create.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['353'][2].init(882, 37, 'elemNodeType == NodeType.ELEMENT_NODE');
function visit163_353_2(result) {
  _$jscoverage['/base/create.js'].branchData['353'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['353'][1].init(882, 109, 'elemNodeType == NodeType.ELEMENT_NODE || elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit162_353_1(result) {
  _$jscoverage['/base/create.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['339'][1].init(454, 5, '!elem');
function visit161_339_1(result) {
  _$jscoverage['/base/create.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['328'][1].init(22, 24, 'typeof deep === \'object\'');
function visit160_328_1(result) {
  _$jscoverage['/base/create.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['301'][2].init(651, 44, 'parent.canHaveChildren && "removeNode" in el');
function visit159_301_2(result) {
  _$jscoverage['/base/create.js'].branchData['301'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['301'][1].init(642, 53, 'UA.ie && parent.canHaveChildren && "removeNode" in el');
function visit158_301_1(result) {
  _$jscoverage['/base/create.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['295'][1].init(440, 22, 'parent = el.parentNode');
function visit157_295_1(result) {
  _$jscoverage['/base/create.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['291'][1].init(190, 8, 'DOMEvent');
function visit156_291_1(result) {
  _$jscoverage['/base/create.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['287'][2].init(73, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit155_287_2(result) {
  _$jscoverage['/base/create.js'].branchData['287'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['287'][1].init(60, 49, '!keepData && el.nodeType == NodeType.ELEMENT_NODE');
function visit154_287_1(result) {
  _$jscoverage['/base/create.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['285'][1].init(251, 6, 'i >= 0');
function visit153_285_1(result) {
  _$jscoverage['/base/create.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['258'][1].init(76, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit152_258_1(result) {
  _$jscoverage['/base/create.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['256'][1].init(47, 6, 'i >= 0');
function visit151_256_1(result) {
  _$jscoverage['/base/create.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['255'][1].init(65, 64, '!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML');
function visit150_255_1(result) {
  _$jscoverage['/base/create.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['246'][2].init(46, 41, 'el.nodeType != Dom.DOCUMENT_FRAGMENT_NODE');
function visit149_246_2(result) {
  _$jscoverage['/base/create.js'].branchData['246'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['246'][1].init(26, 61, 'supportOuterHTML && el.nodeType != Dom.DOCUMENT_FRAGMENT_NODE');
function visit148_246_1(result) {
  _$jscoverage['/base/create.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['245'][1].init(337, 24, 'htmlString === undefined');
function visit147_245_1(result) {
  _$jscoverage['/base/create.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['241'][1].init(229, 3, '!el');
function visit146_241_1(result) {
  _$jscoverage['/base/create.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['217'][1].init(1109, 8, '!success');
function visit145_217_1(result) {
  _$jscoverage['/base/create.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['204'][1].init(86, 38, 'elem.nodeType == NodeType.ELEMENT_NODE');
function visit144_204_1(result) {
  _$jscoverage['/base/create.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['202'][1].init(55, 6, 'i >= 0');
function visit143_202_1(result) {
  _$jscoverage['/base/create.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['199'][3].init(347, 36, 'htmlString.match(RE_TAG) || [\'\', \'\']');
function visit142_199_3(result) {
  _$jscoverage['/base/create.js'].branchData['199'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['199'][2].init(258, 69, '!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)');
function visit141_199_2(result) {
  _$jscoverage['/base/create.js'].branchData['199'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['199'][1].init(73, 145, '(!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[(htmlString.match(RE_TAG) || [\'\', \'\'])[1].toLowerCase()]');
function visit140_199_1(result) {
  _$jscoverage['/base/create.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['198'][1].init(182, 219, '!htmlString.match(/<(?:script|style|link)/i) && (!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[(htmlString.match(RE_TAG) || [\'\', \'\'])[1].toLowerCase()]');
function visit139_198_1(result) {
  _$jscoverage['/base/create.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['184'][1].init(215, 46, 'el.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit138_184_1(result) {
  _$jscoverage['/base/create.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['182'][1].init(96, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit137_182_1(result) {
  _$jscoverage['/base/create.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['180'][1].init(366, 24, 'htmlString === undefined');
function visit136_180_1(result) {
  _$jscoverage['/base/create.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['176'][1].init(258, 3, '!el');
function visit135_176_1(result) {
  _$jscoverage['/base/create.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['149'][1].init(97, 32, 'Dom.nodeName(src) === \'textarea\'');
function visit134_149_1(result) {
  _$jscoverage['/base/create.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['136'][1].init(1249, 12, 'nodes.length');
function visit133_136_1(result) {
  _$jscoverage['/base/create.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['133'][1].init(1030, 18, 'nodes.length === 1');
function visit132_133_1(result) {
  _$jscoverage['/base/create.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['126'][2].init(744, 93, '/\\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))');
function visit131_126_2(result) {
  _$jscoverage['/base/create.js'].branchData['126'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['126'][1].init(715, 122, 'lostLeadingTailWhitespace && /\\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))');
function visit130_126_1(result) {
  _$jscoverage['/base/create.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['121'][1].init(419, 106, 'lostLeadingTailWhitespace && (whitespaceMatch = html.match(R_LEADING_WHITESPACE))');
function visit129_121_1(result) {
  _$jscoverage['/base/create.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['119'][1].init(309, 31, 'creators[tag] || defaultCreator');
function visit128_119_1(result) {
  _$jscoverage['/base/create.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['115'][1].init(165, 36, '(m = RE_TAG.exec(html)) && (k = m[1])');
function visit127_115_1(result) {
  _$jscoverage['/base/create.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['103'][1].init(814, 18, '!R_HTML.test(html)');
function visit126_103_1(result) {
  _$jscoverage['/base/create.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['97'][1].init(127, 15, 'ownerDoc || doc');
function visit125_97_1(result) {
  _$jscoverage['/base/create.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['90'][1].init(449, 5, '_trim');
function visit124_90_1(result) {
  _$jscoverage['/base/create.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['86'][1].init(349, 19, '_trim === undefined');
function visit123_86_1(result) {
  _$jscoverage['/base/create.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['82'][1].init(247, 23, 'typeof html != \'string\'');
function visit122_82_1(result) {
  _$jscoverage['/base/create.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['77'][1].init(141, 13, 'html.nodeType');
function visit121_77_1(result) {
  _$jscoverage['/base/create.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['73'][1].init(57, 5, '!html');
function visit120_73_1(result) {
  _$jscoverage['/base/create.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['41'][1].init(135, 22, 'holder === DEFAULT_DIV');
function visit119_41_1(result) {
  _$jscoverage['/base/create.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['38'][2].init(35, 15, 'ownerDoc != doc');
function visit118_38_2(result) {
  _$jscoverage['/base/create.js'].branchData['38'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['38'][1].init(23, 27, 'ownerDoc && ownerDoc != doc');
function visit117_38_1(result) {
  _$jscoverage['/base/create.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['31'][1].init(62, 8, 'DOMEvent');
function visit116_31_1(result) {
  _$jscoverage['/base/create.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['21'][1].init(576, 41, 'doc && \'outerHTML\' in doc.documentElement');
function visit115_21_1(result) {
  _$jscoverage['/base/create.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['19'][2].init(509, 6, 'ie < 9');
function visit114_19_2(result) {
  _$jscoverage['/base/create.js'].branchData['19'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['19'][1].init(503, 12, 'ie && ie < 9');
function visit113_19_1(result) {
  _$jscoverage['/base/create.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['14'][1].init(229, 29, 'doc && doc.createElement(DIV)');
function visit112_14_1(result) {
  _$jscoverage['/base/create.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].lineData[6]++;
KISSY.add('dom/base/create', function(S, Dom, undefined) {
  _$jscoverage['/base/create.js'].functionData[0]++;
  _$jscoverage['/base/create.js'].lineData[7]++;
  var doc = S.Env.host.document, NodeType = Dom.NodeType, UA = S.UA, logger = S.getLogger('s/dom'), ie = UA['ie'], DIV = 'div', PARENT_NODE = 'parentNode', DEFAULT_DIV = visit112_14_1(doc && doc.createElement(DIV)), R_XHTML_TAG = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig, RE_TAG = /<([\w:]+)/, R_LEADING_WHITESPACE = /^\s+/, R_TAIL_WHITESPACE = /\s+$/, lostLeadingTailWhitespace = visit113_19_1(ie && visit114_19_2(ie < 9)), R_HTML = /<|&#?\w+;/, supportOuterHTML = visit115_21_1(doc && 'outerHTML' in doc.documentElement), RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
  _$jscoverage['/base/create.js'].lineData[25]++;
  function getElementsByTagName(el, tag) {
    _$jscoverage['/base/create.js'].functionData[1]++;
    _$jscoverage['/base/create.js'].lineData[26]++;
    return el.getElementsByTagName(tag);
  }
  _$jscoverage['/base/create.js'].lineData[29]++;
  function cleanData(els) {
    _$jscoverage['/base/create.js'].functionData[2]++;
    _$jscoverage['/base/create.js'].lineData[30]++;
    var DOMEvent = S.require('event/dom');
    _$jscoverage['/base/create.js'].lineData[31]++;
    if (visit116_31_1(DOMEvent)) {
      _$jscoverage['/base/create.js'].lineData[32]++;
      DOMEvent.detach(els);
    }
    _$jscoverage['/base/create.js'].lineData[34]++;
    Dom.removeData(els);
  }
  _$jscoverage['/base/create.js'].lineData[37]++;
  function getHolderDiv(ownerDoc) {
    _$jscoverage['/base/create.js'].functionData[3]++;
    _$jscoverage['/base/create.js'].lineData[38]++;
    var holder = visit117_38_1(ownerDoc && visit118_38_2(ownerDoc != doc)) ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
    _$jscoverage['/base/create.js'].lineData[41]++;
    if (visit119_41_1(holder === DEFAULT_DIV)) {
      _$jscoverage['/base/create.js'].lineData[42]++;
      holder.innerHTML = '';
    }
    _$jscoverage['/base/create.js'].lineData[44]++;
    return holder;
  }
  _$jscoverage['/base/create.js'].lineData[47]++;
  function defaultCreator(html, ownerDoc) {
    _$jscoverage['/base/create.js'].functionData[4]++;
    _$jscoverage['/base/create.js'].lineData[48]++;
    var frag = getHolderDiv(ownerDoc);
    _$jscoverage['/base/create.js'].lineData[50]++;
    frag.innerHTML = 'm<div>' + html + '<' + '/div>';
    _$jscoverage['/base/create.js'].lineData[51]++;
    return frag.lastChild;
  }
  _$jscoverage['/base/create.js'].lineData[54]++;
  S.mix(Dom, {
  create: function(html, props, ownerDoc, _trim) {
  _$jscoverage['/base/create.js'].functionData[5]++;
  _$jscoverage['/base/create.js'].lineData[71]++;
  var ret = null;
  _$jscoverage['/base/create.js'].lineData[73]++;
  if (visit120_73_1(!html)) {
    _$jscoverage['/base/create.js'].lineData[74]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[77]++;
  if (visit121_77_1(html.nodeType)) {
    _$jscoverage['/base/create.js'].lineData[78]++;
    return Dom.clone(html);
  }
  _$jscoverage['/base/create.js'].lineData[82]++;
  if (visit122_82_1(typeof html != 'string')) {
    _$jscoverage['/base/create.js'].lineData[83]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[86]++;
  if (visit123_86_1(_trim === undefined)) {
    _$jscoverage['/base/create.js'].lineData[87]++;
    _trim = true;
  }
  _$jscoverage['/base/create.js'].lineData[90]++;
  if (visit124_90_1(_trim)) {
    _$jscoverage['/base/create.js'].lineData[91]++;
    html = S.trim(html);
  }
  _$jscoverage['/base/create.js'].lineData[94]++;
  var creators = Dom._creators, holder, whitespaceMatch, context = visit125_97_1(ownerDoc || doc), m, tag = DIV, k, nodes;
  _$jscoverage['/base/create.js'].lineData[103]++;
  if (visit126_103_1(!R_HTML.test(html))) {
    _$jscoverage['/base/create.js'].lineData[104]++;
    ret = context.createTextNode(html);
  } else {
    _$jscoverage['/base/create.js'].lineData[107]++;
    if ((m = RE_SIMPLE_TAG.exec(html))) {
      _$jscoverage['/base/create.js'].lineData[108]++;
      ret = context.createElement(m[1]);
    } else {
      _$jscoverage['/base/create.js'].lineData[113]++;
      html = html.replace(R_XHTML_TAG, '<$1><' + '/$2>');
      _$jscoverage['/base/create.js'].lineData[115]++;
      if (visit127_115_1((m = RE_TAG.exec(html)) && (k = m[1]))) {
        _$jscoverage['/base/create.js'].lineData[116]++;
        tag = k.toLowerCase();
      }
      _$jscoverage['/base/create.js'].lineData[119]++;
      holder = (visit128_119_1(creators[tag] || defaultCreator))(html, context);
      _$jscoverage['/base/create.js'].lineData[121]++;
      if (visit129_121_1(lostLeadingTailWhitespace && (whitespaceMatch = html.match(R_LEADING_WHITESPACE)))) {
        _$jscoverage['/base/create.js'].lineData[123]++;
        holder.insertBefore(context.createTextNode(whitespaceMatch[0]), holder.firstChild);
      }
      _$jscoverage['/base/create.js'].lineData[126]++;
      if (visit130_126_1(lostLeadingTailWhitespace && visit131_126_2(/\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))))) {
        _$jscoverage['/base/create.js'].lineData[128]++;
        holder.appendChild(context.createTextNode(whitespaceMatch[0]));
      }
      _$jscoverage['/base/create.js'].lineData[131]++;
      nodes = holder.childNodes;
      _$jscoverage['/base/create.js'].lineData[133]++;
      if (visit132_133_1(nodes.length === 1)) {
        _$jscoverage['/base/create.js'].lineData[135]++;
        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
      } else {
        _$jscoverage['/base/create.js'].lineData[136]++;
        if (visit133_136_1(nodes.length)) {
          _$jscoverage['/base/create.js'].lineData[138]++;
          ret = nodeListToFragment(nodes);
        } else {
          _$jscoverage['/base/create.js'].lineData[140]++;
          S.error(html + ' : create node error');
        }
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[144]++;
  return attachProps(ret, props);
}, 
  _fixCloneAttributes: function(src, dest) {
  _$jscoverage['/base/create.js'].functionData[6]++;
  _$jscoverage['/base/create.js'].lineData[149]++;
  if (visit134_149_1(Dom.nodeName(src) === 'textarea')) {
    _$jscoverage['/base/create.js'].lineData[150]++;
    dest.defaultValue = src.defaultValue;
    _$jscoverage['/base/create.js'].lineData[151]++;
    dest.value = src.value;
  }
}, 
  _creators: {
  div: defaultCreator}, 
  _defaultCreator: defaultCreator, 
  html: function(selector, htmlString, loadScripts) {
  _$jscoverage['/base/create.js'].functionData[7]++;
  _$jscoverage['/base/create.js'].lineData[171]++;
  var els = Dom.query(selector), el = els[0], success = false, valNode, i, elem;
  _$jscoverage['/base/create.js'].lineData[176]++;
  if (visit135_176_1(!el)) {
    _$jscoverage['/base/create.js'].lineData[177]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[180]++;
  if (visit136_180_1(htmlString === undefined)) {
    _$jscoverage['/base/create.js'].lineData[182]++;
    if (visit137_182_1(el.nodeType == NodeType.ELEMENT_NODE)) {
      _$jscoverage['/base/create.js'].lineData[183]++;
      return el.innerHTML;
    } else {
      _$jscoverage['/base/create.js'].lineData[184]++;
      if (visit138_184_1(el.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[185]++;
        var holder = getHolderDiv(el.ownerDocument);
        _$jscoverage['/base/create.js'].lineData[186]++;
        holder.appendChild(el);
        _$jscoverage['/base/create.js'].lineData[187]++;
        return holder.innerHTML;
      } else {
        _$jscoverage['/base/create.js'].lineData[189]++;
        return null;
      }
    }
  } else {
    _$jscoverage['/base/create.js'].lineData[194]++;
    htmlString += '';
    _$jscoverage['/base/create.js'].lineData[198]++;
    if (visit139_198_1(!htmlString.match(/<(?:script|style|link)/i) && visit140_199_1((visit141_199_2(!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE))) && !creatorsMap[(visit142_199_3(htmlString.match(RE_TAG) || ['', '']))[1].toLowerCase()]))) {
      _$jscoverage['/base/create.js'].lineData[201]++;
      try {
        _$jscoverage['/base/create.js'].lineData[202]++;
        for (i = els.length - 1; visit143_202_1(i >= 0); i--) {
          _$jscoverage['/base/create.js'].lineData[203]++;
          elem = els[i];
          _$jscoverage['/base/create.js'].lineData[204]++;
          if (visit144_204_1(elem.nodeType == NodeType.ELEMENT_NODE)) {
            _$jscoverage['/base/create.js'].lineData[205]++;
            cleanData(getElementsByTagName(elem, '*'));
            _$jscoverage['/base/create.js'].lineData[206]++;
            elem.innerHTML = htmlString;
          }
        }
        _$jscoverage['/base/create.js'].lineData[209]++;
        success = true;
      }      catch (e) {
}
    }
    _$jscoverage['/base/create.js'].lineData[217]++;
    if (visit145_217_1(!success)) {
      _$jscoverage['/base/create.js'].lineData[218]++;
      valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
      _$jscoverage['/base/create.js'].lineData[219]++;
      Dom.empty(els);
      _$jscoverage['/base/create.js'].lineData[220]++;
      Dom.append(valNode, els, loadScripts);
    }
  }
  _$jscoverage['/base/create.js'].lineData[223]++;
  return undefined;
}, 
  outerHtml: function(selector, htmlString, loadScripts) {
  _$jscoverage['/base/create.js'].functionData[8]++;
  _$jscoverage['/base/create.js'].lineData[235]++;
  var els = Dom.query(selector), holder, i, valNode, length = els.length, el = els[0];
  _$jscoverage['/base/create.js'].lineData[241]++;
  if (visit146_241_1(!el)) {
    _$jscoverage['/base/create.js'].lineData[242]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[245]++;
  if (visit147_245_1(htmlString === undefined)) {
    _$jscoverage['/base/create.js'].lineData[246]++;
    if (visit148_246_1(supportOuterHTML && visit149_246_2(el.nodeType != Dom.DOCUMENT_FRAGMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[247]++;
      return el.outerHTML;
    } else {
      _$jscoverage['/base/create.js'].lineData[249]++;
      holder = getHolderDiv(el.ownerDocument);
      _$jscoverage['/base/create.js'].lineData[250]++;
      holder.appendChild(Dom.clone(el, true));
      _$jscoverage['/base/create.js'].lineData[251]++;
      return holder.innerHTML;
    }
  } else {
    _$jscoverage['/base/create.js'].lineData[254]++;
    htmlString += '';
    _$jscoverage['/base/create.js'].lineData[255]++;
    if (visit150_255_1(!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML)) {
      _$jscoverage['/base/create.js'].lineData[256]++;
      for (i = length - 1; visit151_256_1(i >= 0); i--) {
        _$jscoverage['/base/create.js'].lineData[257]++;
        el = els[i];
        _$jscoverage['/base/create.js'].lineData[258]++;
        if (visit152_258_1(el.nodeType == NodeType.ELEMENT_NODE)) {
          _$jscoverage['/base/create.js'].lineData[259]++;
          cleanData(el);
          _$jscoverage['/base/create.js'].lineData[260]++;
          cleanData(getElementsByTagName(el, '*'));
          _$jscoverage['/base/create.js'].lineData[261]++;
          el.outerHTML = htmlString;
        }
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[265]++;
      valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
      _$jscoverage['/base/create.js'].lineData[266]++;
      Dom.insertBefore(valNode, els, loadScripts);
      _$jscoverage['/base/create.js'].lineData[267]++;
      Dom.remove(els);
    }
  }
  _$jscoverage['/base/create.js'].lineData[270]++;
  return undefined;
}, 
  remove: function(selector, keepData) {
  _$jscoverage['/base/create.js'].functionData[9]++;
  _$jscoverage['/base/create.js'].lineData[279]++;
  var el, els = Dom.query(selector), all, parent, DOMEvent = S.require('event/dom'), i;
  _$jscoverage['/base/create.js'].lineData[285]++;
  for (i = els.length - 1; visit153_285_1(i >= 0); i--) {
    _$jscoverage['/base/create.js'].lineData[286]++;
    el = els[i];
    _$jscoverage['/base/create.js'].lineData[287]++;
    if (visit154_287_1(!keepData && visit155_287_2(el.nodeType == NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[288]++;
      all = S.makeArray(getElementsByTagName(el, '*'));
      _$jscoverage['/base/create.js'].lineData[289]++;
      all.push(el);
      _$jscoverage['/base/create.js'].lineData[290]++;
      Dom.removeData(all);
      _$jscoverage['/base/create.js'].lineData[291]++;
      if (visit156_291_1(DOMEvent)) {
        _$jscoverage['/base/create.js'].lineData[292]++;
        DOMEvent.detach(all);
      }
    }
    _$jscoverage['/base/create.js'].lineData[295]++;
    if (visit157_295_1(parent = el.parentNode)) {
      _$jscoverage['/base/create.js'].lineData[301]++;
            visit158_301_1(UA.ie && visit159_301_2(parent.canHaveChildren && "removeNode" in el)) ? el.removeNode(false) : parent.removeChild(el);
    }
  }
}, 
  clone: function(selector, deep, withDataAndEvent, deepWithDataAndEvent) {
  _$jscoverage['/base/create.js'].functionData[10]++;
  _$jscoverage['/base/create.js'].lineData[328]++;
  if (visit160_328_1(typeof deep === 'object')) {
    _$jscoverage['/base/create.js'].lineData[329]++;
    deepWithDataAndEvent = deep['deepWithDataAndEvent'];
    _$jscoverage['/base/create.js'].lineData[330]++;
    withDataAndEvent = deep['withDataAndEvent'];
    _$jscoverage['/base/create.js'].lineData[331]++;
    deep = deep['deep'];
  }
  _$jscoverage['/base/create.js'].lineData[334]++;
  var elem = Dom.get(selector), clone, _fixCloneAttributes = Dom._fixCloneAttributes, elemNodeType;
  _$jscoverage['/base/create.js'].lineData[339]++;
  if (visit161_339_1(!elem)) {
    _$jscoverage['/base/create.js'].lineData[340]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[343]++;
  elemNodeType = elem.nodeType;
  _$jscoverage['/base/create.js'].lineData[349]++;
  clone = elem.cloneNode(deep);
  _$jscoverage['/base/create.js'].lineData[353]++;
  if (visit162_353_1(visit163_353_2(elemNodeType == NodeType.ELEMENT_NODE) || visit164_354_1(elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE))) {
    _$jscoverage['/base/create.js'].lineData[360]++;
    if (visit165_360_1(_fixCloneAttributes && visit166_360_2(elemNodeType == NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[361]++;
      _fixCloneAttributes(elem, clone);
    }
    _$jscoverage['/base/create.js'].lineData[364]++;
    if (visit167_364_1(deep && _fixCloneAttributes)) {
      _$jscoverage['/base/create.js'].lineData[365]++;
      processAll(_fixCloneAttributes, elem, clone);
    }
  }
  _$jscoverage['/base/create.js'].lineData[369]++;
  if (visit168_369_1(withDataAndEvent)) {
    _$jscoverage['/base/create.js'].lineData[370]++;
    cloneWithDataAndEvent(elem, clone);
    _$jscoverage['/base/create.js'].lineData[371]++;
    if (visit169_371_1(deep && deepWithDataAndEvent)) {
      _$jscoverage['/base/create.js'].lineData[372]++;
      processAll(cloneWithDataAndEvent, elem, clone);
    }
  }
  _$jscoverage['/base/create.js'].lineData[375]++;
  return clone;
}, 
  empty: function(selector) {
  _$jscoverage['/base/create.js'].functionData[11]++;
  _$jscoverage['/base/create.js'].lineData[383]++;
  var els = Dom.query(selector), el, i;
  _$jscoverage['/base/create.js'].lineData[385]++;
  for (i = els.length - 1; visit170_385_1(i >= 0); i--) {
    _$jscoverage['/base/create.js'].lineData[386]++;
    el = els[i];
    _$jscoverage['/base/create.js'].lineData[387]++;
    Dom.remove(el.childNodes);
  }
}, 
  _nodeListToFragment: nodeListToFragment});
  _$jscoverage['/base/create.js'].lineData[395]++;
  Dom.outerHTML = Dom.outerHtml;
  _$jscoverage['/base/create.js'].lineData[397]++;
  function processAll(fn, elem, clone) {
    _$jscoverage['/base/create.js'].functionData[12]++;
    _$jscoverage['/base/create.js'].lineData[398]++;
    var elemNodeType = elem.nodeType;
    _$jscoverage['/base/create.js'].lineData[399]++;
    if (visit171_399_1(elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE)) {
      _$jscoverage['/base/create.js'].lineData[400]++;
      var eCs = elem.childNodes, cloneCs = clone.childNodes, fIndex = 0;
      _$jscoverage['/base/create.js'].lineData[403]++;
      while (eCs[fIndex]) {
        _$jscoverage['/base/create.js'].lineData[404]++;
        if (visit172_404_1(cloneCs[fIndex])) {
          _$jscoverage['/base/create.js'].lineData[405]++;
          processAll(fn, eCs[fIndex], cloneCs[fIndex]);
        }
        _$jscoverage['/base/create.js'].lineData[407]++;
        fIndex++;
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[409]++;
      if (visit173_409_1(elemNodeType == NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[410]++;
        var elemChildren = getElementsByTagName(elem, '*'), cloneChildren = getElementsByTagName(clone, '*'), cIndex = 0;
        _$jscoverage['/base/create.js'].lineData[413]++;
        while (elemChildren[cIndex]) {
          _$jscoverage['/base/create.js'].lineData[414]++;
          if (visit174_414_1(cloneChildren[cIndex])) {
            _$jscoverage['/base/create.js'].lineData[415]++;
            fn(elemChildren[cIndex], cloneChildren[cIndex]);
          }
          _$jscoverage['/base/create.js'].lineData[417]++;
          cIndex++;
        }
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[423]++;
  function cloneWithDataAndEvent(src, dest) {
    _$jscoverage['/base/create.js'].functionData[13]++;
    _$jscoverage['/base/create.js'].lineData[424]++;
    var DOMEvent = S.require('event/dom'), srcData, d;
    _$jscoverage['/base/create.js'].lineData[428]++;
    if (visit175_428_1(visit176_428_2(dest.nodeType == NodeType.ELEMENT_NODE) && !Dom.hasData(src))) {
      _$jscoverage['/base/create.js'].lineData[429]++;
      return;
    }
    _$jscoverage['/base/create.js'].lineData[432]++;
    srcData = Dom.data(src);
    _$jscoverage['/base/create.js'].lineData[435]++;
    for (d in srcData) {
      _$jscoverage['/base/create.js'].lineData[436]++;
      Dom.data(dest, d, srcData[d]);
    }
    _$jscoverage['/base/create.js'].lineData[440]++;
    if (visit177_440_1(DOMEvent)) {
      _$jscoverage['/base/create.js'].lineData[442]++;
      DOMEvent.clone(src, dest);
    }
  }
  _$jscoverage['/base/create.js'].lineData[447]++;
  function attachProps(elem, props) {
    _$jscoverage['/base/create.js'].functionData[14]++;
    _$jscoverage['/base/create.js'].lineData[448]++;
    if (visit178_448_1(S.isPlainObject(props))) {
      _$jscoverage['/base/create.js'].lineData[449]++;
      if (visit179_449_1(elem.nodeType == NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[450]++;
        Dom.attr(elem, props, true);
      } else {
        _$jscoverage['/base/create.js'].lineData[453]++;
        if (visit180_453_1(elem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE)) {
          _$jscoverage['/base/create.js'].lineData[454]++;
          Dom.attr(elem.childNodes, props, true);
        }
      }
    }
    _$jscoverage['/base/create.js'].lineData[457]++;
    return elem;
  }
  _$jscoverage['/base/create.js'].lineData[461]++;
  function nodeListToFragment(nodes) {
    _$jscoverage['/base/create.js'].functionData[15]++;
    _$jscoverage['/base/create.js'].lineData[462]++;
    var ret = null, i, ownerDoc, len;
    _$jscoverage['/base/create.js'].lineData[466]++;
    if (visit181_466_1(nodes && visit182_466_2((visit183_466_3(nodes.push || nodes.item)) && nodes[0]))) {
      _$jscoverage['/base/create.js'].lineData[467]++;
      ownerDoc = nodes[0].ownerDocument;
      _$jscoverage['/base/create.js'].lineData[468]++;
      ret = ownerDoc.createDocumentFragment();
      _$jscoverage['/base/create.js'].lineData[469]++;
      nodes = S.makeArray(nodes);
      _$jscoverage['/base/create.js'].lineData[470]++;
      for (i = 0 , len = nodes.length; visit184_470_1(i < len); i++) {
        _$jscoverage['/base/create.js'].lineData[471]++;
        ret.appendChild(nodes[i]);
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[474]++;
      logger.error('Unable to convert ' + nodes + ' to fragment.');
    }
    _$jscoverage['/base/create.js'].lineData[476]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[480]++;
  var creators = Dom._creators, create = Dom.create, creatorsMap = {
  area: 'map', 
  thead: 'table', 
  td: 'tr', 
  th: 'tr', 
  tr: 'tbody', 
  tbody: 'table', 
  tfoot: 'table', 
  caption: 'table', 
  colgroup: 'table', 
  col: 'colgroup', 
  legend: 'fieldset'}, p;
  _$jscoverage['/base/create.js'].lineData[496]++;
  for (p in creatorsMap) {
    _$jscoverage['/base/create.js'].lineData[497]++;
    (function(tag) {
  _$jscoverage['/base/create.js'].functionData[16]++;
  _$jscoverage['/base/create.js'].lineData[498]++;
  creators[p] = function(html, ownerDoc) {
  _$jscoverage['/base/create.js'].functionData[17]++;
  _$jscoverage['/base/create.js'].lineData[499]++;
  return create('<' + tag + '>' + html + '<' + '/' + tag + '>', undefined, ownerDoc);
};
})(creatorsMap[p]);
  }
  _$jscoverage['/base/create.js'].lineData[507]++;
  creatorsMap['option'] = creatorsMap['optgroup'] = function(html, ownerDoc) {
  _$jscoverage['/base/create.js'].functionData[18]++;
  _$jscoverage['/base/create.js'].lineData[508]++;
  return create('<select multiple="multiple">' + html + '</select>', undefined, ownerDoc);
};
  _$jscoverage['/base/create.js'].lineData[511]++;
  return Dom;
}, {
  requires: ['./api']});
