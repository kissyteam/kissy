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
if (! _$jscoverage['/word-filter.js']) {
  _$jscoverage['/word-filter.js'] = {};
  _$jscoverage['/word-filter.js'].lineData = [];
  _$jscoverage['/word-filter.js'].lineData[6] = 0;
  _$jscoverage['/word-filter.js'].lineData[8] = 0;
  _$jscoverage['/word-filter.js'].lineData[10] = 0;
  _$jscoverage['/word-filter.js'].lineData[54] = 0;
  _$jscoverage['/word-filter.js'].lineData[55] = 0;
  _$jscoverage['/word-filter.js'].lineData[56] = 0;
  _$jscoverage['/word-filter.js'].lineData[57] = 0;
  _$jscoverage['/word-filter.js'].lineData[58] = 0;
  _$jscoverage['/word-filter.js'].lineData[59] = 0;
  _$jscoverage['/word-filter.js'].lineData[62] = 0;
  _$jscoverage['/word-filter.js'].lineData[66] = 0;
  _$jscoverage['/word-filter.js'].lineData[67] = 0;
  _$jscoverage['/word-filter.js'].lineData[68] = 0;
  _$jscoverage['/word-filter.js'].lineData[69] = 0;
  _$jscoverage['/word-filter.js'].lineData[70] = 0;
  _$jscoverage['/word-filter.js'].lineData[71] = 0;
  _$jscoverage['/word-filter.js'].lineData[73] = 0;
  _$jscoverage['/word-filter.js'].lineData[76] = 0;
  _$jscoverage['/word-filter.js'].lineData[77] = 0;
  _$jscoverage['/word-filter.js'].lineData[78] = 0;
  _$jscoverage['/word-filter.js'].lineData[80] = 0;
  _$jscoverage['/word-filter.js'].lineData[88] = 0;
  _$jscoverage['/word-filter.js'].lineData[89] = 0;
  _$jscoverage['/word-filter.js'].lineData[91] = 0;
  _$jscoverage['/word-filter.js'].lineData[92] = 0;
  _$jscoverage['/word-filter.js'].lineData[93] = 0;
  _$jscoverage['/word-filter.js'].lineData[100] = 0;
  _$jscoverage['/word-filter.js'].lineData[101] = 0;
  _$jscoverage['/word-filter.js'].lineData[102] = 0;
  _$jscoverage['/word-filter.js'].lineData[105] = 0;
  _$jscoverage['/word-filter.js'].lineData[109] = 0;
  _$jscoverage['/word-filter.js'].lineData[113] = 0;
  _$jscoverage['/word-filter.js'].lineData[114] = 0;
  _$jscoverage['/word-filter.js'].lineData[117] = 0;
  _$jscoverage['/word-filter.js'].lineData[120] = 0;
  _$jscoverage['/word-filter.js'].lineData[121] = 0;
  _$jscoverage['/word-filter.js'].lineData[125] = 0;
  _$jscoverage['/word-filter.js'].lineData[126] = 0;
  _$jscoverage['/word-filter.js'].lineData[127] = 0;
  _$jscoverage['/word-filter.js'].lineData[128] = 0;
  _$jscoverage['/word-filter.js'].lineData[130] = 0;
  _$jscoverage['/word-filter.js'].lineData[131] = 0;
  _$jscoverage['/word-filter.js'].lineData[132] = 0;
  _$jscoverage['/word-filter.js'].lineData[134] = 0;
  _$jscoverage['/word-filter.js'].lineData[136] = 0;
  _$jscoverage['/word-filter.js'].lineData[139] = 0;
  _$jscoverage['/word-filter.js'].lineData[140] = 0;
  _$jscoverage['/word-filter.js'].lineData[141] = 0;
  _$jscoverage['/word-filter.js'].lineData[142] = 0;
  _$jscoverage['/word-filter.js'].lineData[144] = 0;
  _$jscoverage['/word-filter.js'].lineData[147] = 0;
  _$jscoverage['/word-filter.js'].lineData[148] = 0;
  _$jscoverage['/word-filter.js'].lineData[152] = 0;
  _$jscoverage['/word-filter.js'].lineData[153] = 0;
  _$jscoverage['/word-filter.js'].lineData[154] = 0;
  _$jscoverage['/word-filter.js'].lineData[155] = 0;
  _$jscoverage['/word-filter.js'].lineData[156] = 0;
  _$jscoverage['/word-filter.js'].lineData[157] = 0;
  _$jscoverage['/word-filter.js'].lineData[158] = 0;
  _$jscoverage['/word-filter.js'].lineData[159] = 0;
  _$jscoverage['/word-filter.js'].lineData[164] = 0;
  _$jscoverage['/word-filter.js'].lineData[168] = 0;
  _$jscoverage['/word-filter.js'].lineData[169] = 0;
  _$jscoverage['/word-filter.js'].lineData[171] = 0;
  _$jscoverage['/word-filter.js'].lineData[172] = 0;
  _$jscoverage['/word-filter.js'].lineData[175] = 0;
  _$jscoverage['/word-filter.js'].lineData[176] = 0;
  _$jscoverage['/word-filter.js'].lineData[178] = 0;
  _$jscoverage['/word-filter.js'].lineData[184] = 0;
  _$jscoverage['/word-filter.js'].lineData[186] = 0;
  _$jscoverage['/word-filter.js'].lineData[190] = 0;
  _$jscoverage['/word-filter.js'].lineData[192] = 0;
  _$jscoverage['/word-filter.js'].lineData[196] = 0;
  _$jscoverage['/word-filter.js'].lineData[200] = 0;
  _$jscoverage['/word-filter.js'].lineData[201] = 0;
  _$jscoverage['/word-filter.js'].lineData[203] = 0;
  _$jscoverage['/word-filter.js'].lineData[205] = 0;
  _$jscoverage['/word-filter.js'].lineData[206] = 0;
  _$jscoverage['/word-filter.js'].lineData[210] = 0;
  _$jscoverage['/word-filter.js'].lineData[213] = 0;
  _$jscoverage['/word-filter.js'].lineData[219] = 0;
  _$jscoverage['/word-filter.js'].lineData[221] = 0;
  _$jscoverage['/word-filter.js'].lineData[224] = 0;
  _$jscoverage['/word-filter.js'].lineData[226] = 0;
  _$jscoverage['/word-filter.js'].lineData[227] = 0;
  _$jscoverage['/word-filter.js'].lineData[229] = 0;
  _$jscoverage['/word-filter.js'].lineData[230] = 0;
  _$jscoverage['/word-filter.js'].lineData[234] = 0;
  _$jscoverage['/word-filter.js'].lineData[237] = 0;
  _$jscoverage['/word-filter.js'].lineData[238] = 0;
  _$jscoverage['/word-filter.js'].lineData[240] = 0;
  _$jscoverage['/word-filter.js'].lineData[241] = 0;
  _$jscoverage['/word-filter.js'].lineData[246] = 0;
  _$jscoverage['/word-filter.js'].lineData[247] = 0;
  _$jscoverage['/word-filter.js'].lineData[249] = 0;
  _$jscoverage['/word-filter.js'].lineData[250] = 0;
  _$jscoverage['/word-filter.js'].lineData[254] = 0;
  _$jscoverage['/word-filter.js'].lineData[257] = 0;
  _$jscoverage['/word-filter.js'].lineData[258] = 0;
  _$jscoverage['/word-filter.js'].lineData[264] = 0;
  _$jscoverage['/word-filter.js'].lineData[265] = 0;
  _$jscoverage['/word-filter.js'].lineData[266] = 0;
  _$jscoverage['/word-filter.js'].lineData[271] = 0;
  _$jscoverage['/word-filter.js'].lineData[272] = 0;
  _$jscoverage['/word-filter.js'].lineData[273] = 0;
  _$jscoverage['/word-filter.js'].lineData[274] = 0;
  _$jscoverage['/word-filter.js'].lineData[276] = 0;
  _$jscoverage['/word-filter.js'].lineData[278] = 0;
  _$jscoverage['/word-filter.js'].lineData[280] = 0;
  _$jscoverage['/word-filter.js'].lineData[281] = 0;
  _$jscoverage['/word-filter.js'].lineData[282] = 0;
  _$jscoverage['/word-filter.js'].lineData[285] = 0;
  _$jscoverage['/word-filter.js'].lineData[288] = 0;
  _$jscoverage['/word-filter.js'].lineData[289] = 0;
  _$jscoverage['/word-filter.js'].lineData[290] = 0;
  _$jscoverage['/word-filter.js'].lineData[291] = 0;
  _$jscoverage['/word-filter.js'].lineData[292] = 0;
  _$jscoverage['/word-filter.js'].lineData[297] = 0;
  _$jscoverage['/word-filter.js'].lineData[300] = 0;
  _$jscoverage['/word-filter.js'].lineData[308] = 0;
  _$jscoverage['/word-filter.js'].lineData[320] = 0;
  _$jscoverage['/word-filter.js'].lineData[325] = 0;
  _$jscoverage['/word-filter.js'].lineData[326] = 0;
  _$jscoverage['/word-filter.js'].lineData[328] = 0;
  _$jscoverage['/word-filter.js'].lineData[329] = 0;
  _$jscoverage['/word-filter.js'].lineData[330] = 0;
  _$jscoverage['/word-filter.js'].lineData[332] = 0;
  _$jscoverage['/word-filter.js'].lineData[333] = 0;
  _$jscoverage['/word-filter.js'].lineData[334] = 0;
  _$jscoverage['/word-filter.js'].lineData[336] = 0;
  _$jscoverage['/word-filter.js'].lineData[337] = 0;
  _$jscoverage['/word-filter.js'].lineData[338] = 0;
  _$jscoverage['/word-filter.js'].lineData[343] = 0;
  _$jscoverage['/word-filter.js'].lineData[344] = 0;
  _$jscoverage['/word-filter.js'].lineData[350] = 0;
  _$jscoverage['/word-filter.js'].lineData[353] = 0;
  _$jscoverage['/word-filter.js'].lineData[354] = 0;
  _$jscoverage['/word-filter.js'].lineData[358] = 0;
  _$jscoverage['/word-filter.js'].lineData[359] = 0;
  _$jscoverage['/word-filter.js'].lineData[360] = 0;
  _$jscoverage['/word-filter.js'].lineData[365] = 0;
  _$jscoverage['/word-filter.js'].lineData[367] = 0;
  _$jscoverage['/word-filter.js'].lineData[368] = 0;
  _$jscoverage['/word-filter.js'].lineData[371] = 0;
  _$jscoverage['/word-filter.js'].lineData[373] = 0;
  _$jscoverage['/word-filter.js'].lineData[375] = 0;
  _$jscoverage['/word-filter.js'].lineData[378] = 0;
  _$jscoverage['/word-filter.js'].lineData[379] = 0;
  _$jscoverage['/word-filter.js'].lineData[380] = 0;
  _$jscoverage['/word-filter.js'].lineData[381] = 0;
  _$jscoverage['/word-filter.js'].lineData[382] = 0;
  _$jscoverage['/word-filter.js'].lineData[383] = 0;
  _$jscoverage['/word-filter.js'].lineData[387] = 0;
  _$jscoverage['/word-filter.js'].lineData[388] = 0;
  _$jscoverage['/word-filter.js'].lineData[389] = 0;
  _$jscoverage['/word-filter.js'].lineData[399] = 0;
  _$jscoverage['/word-filter.js'].lineData[400] = 0;
  _$jscoverage['/word-filter.js'].lineData[404] = 0;
  _$jscoverage['/word-filter.js'].lineData[405] = 0;
  _$jscoverage['/word-filter.js'].lineData[406] = 0;
  _$jscoverage['/word-filter.js'].lineData[407] = 0;
  _$jscoverage['/word-filter.js'].lineData[411] = 0;
  _$jscoverage['/word-filter.js'].lineData[412] = 0;
  _$jscoverage['/word-filter.js'].lineData[414] = 0;
  _$jscoverage['/word-filter.js'].lineData[415] = 0;
  _$jscoverage['/word-filter.js'].lineData[418] = 0;
  _$jscoverage['/word-filter.js'].lineData[419] = 0;
  _$jscoverage['/word-filter.js'].lineData[422] = 0;
  _$jscoverage['/word-filter.js'].lineData[423] = 0;
  _$jscoverage['/word-filter.js'].lineData[427] = 0;
  _$jscoverage['/word-filter.js'].lineData[431] = 0;
  _$jscoverage['/word-filter.js'].lineData[432] = 0;
  _$jscoverage['/word-filter.js'].lineData[433] = 0;
  _$jscoverage['/word-filter.js'].lineData[434] = 0;
  _$jscoverage['/word-filter.js'].lineData[436] = 0;
  _$jscoverage['/word-filter.js'].lineData[437] = 0;
  _$jscoverage['/word-filter.js'].lineData[438] = 0;
  _$jscoverage['/word-filter.js'].lineData[439] = 0;
  _$jscoverage['/word-filter.js'].lineData[441] = 0;
  _$jscoverage['/word-filter.js'].lineData[443] = 0;
  _$jscoverage['/word-filter.js'].lineData[445] = 0;
  _$jscoverage['/word-filter.js'].lineData[446] = 0;
  _$jscoverage['/word-filter.js'].lineData[448] = 0;
  _$jscoverage['/word-filter.js'].lineData[451] = 0;
  _$jscoverage['/word-filter.js'].lineData[453] = 0;
  _$jscoverage['/word-filter.js'].lineData[456] = 0;
  _$jscoverage['/word-filter.js'].lineData[457] = 0;
  _$jscoverage['/word-filter.js'].lineData[459] = 0;
  _$jscoverage['/word-filter.js'].lineData[460] = 0;
  _$jscoverage['/word-filter.js'].lineData[464] = 0;
  _$jscoverage['/word-filter.js'].lineData[465] = 0;
  _$jscoverage['/word-filter.js'].lineData[473] = 0;
  _$jscoverage['/word-filter.js'].lineData[484] = 0;
  _$jscoverage['/word-filter.js'].lineData[485] = 0;
  _$jscoverage['/word-filter.js'].lineData[489] = 0;
  _$jscoverage['/word-filter.js'].lineData[493] = 0;
  _$jscoverage['/word-filter.js'].lineData[494] = 0;
  _$jscoverage['/word-filter.js'].lineData[495] = 0;
  _$jscoverage['/word-filter.js'].lineData[498] = 0;
  _$jscoverage['/word-filter.js'].lineData[502] = 0;
  _$jscoverage['/word-filter.js'].lineData[503] = 0;
  _$jscoverage['/word-filter.js'].lineData[504] = 0;
  _$jscoverage['/word-filter.js'].lineData[505] = 0;
  _$jscoverage['/word-filter.js'].lineData[506] = 0;
  _$jscoverage['/word-filter.js'].lineData[507] = 0;
  _$jscoverage['/word-filter.js'].lineData[509] = 0;
  _$jscoverage['/word-filter.js'].lineData[510] = 0;
  _$jscoverage['/word-filter.js'].lineData[511] = 0;
  _$jscoverage['/word-filter.js'].lineData[512] = 0;
  _$jscoverage['/word-filter.js'].lineData[515] = 0;
  _$jscoverage['/word-filter.js'].lineData[516] = 0;
  _$jscoverage['/word-filter.js'].lineData[521] = 0;
  _$jscoverage['/word-filter.js'].lineData[522] = 0;
  _$jscoverage['/word-filter.js'].lineData[523] = 0;
  _$jscoverage['/word-filter.js'].lineData[526] = 0;
  _$jscoverage['/word-filter.js'].lineData[527] = 0;
  _$jscoverage['/word-filter.js'].lineData[530] = 0;
  _$jscoverage['/word-filter.js'].lineData[535] = 0;
  _$jscoverage['/word-filter.js'].lineData[536] = 0;
  _$jscoverage['/word-filter.js'].lineData[541] = 0;
  _$jscoverage['/word-filter.js'].lineData[542] = 0;
  _$jscoverage['/word-filter.js'].lineData[545] = 0;
  _$jscoverage['/word-filter.js'].lineData[560] = 0;
  _$jscoverage['/word-filter.js'].lineData[561] = 0;
  _$jscoverage['/word-filter.js'].lineData[570] = 0;
  _$jscoverage['/word-filter.js'].lineData[571] = 0;
  _$jscoverage['/word-filter.js'].lineData[574] = 0;
  _$jscoverage['/word-filter.js'].lineData[575] = 0;
  _$jscoverage['/word-filter.js'].lineData[577] = 0;
  _$jscoverage['/word-filter.js'].lineData[578] = 0;
  _$jscoverage['/word-filter.js'].lineData[581] = 0;
  _$jscoverage['/word-filter.js'].lineData[583] = 0;
  _$jscoverage['/word-filter.js'].lineData[584] = 0;
  _$jscoverage['/word-filter.js'].lineData[585] = 0;
  _$jscoverage['/word-filter.js'].lineData[588] = 0;
  _$jscoverage['/word-filter.js'].lineData[589] = 0;
  _$jscoverage['/word-filter.js'].lineData[594] = 0;
  _$jscoverage['/word-filter.js'].lineData[595] = 0;
  _$jscoverage['/word-filter.js'].lineData[596] = 0;
  _$jscoverage['/word-filter.js'].lineData[598] = 0;
  _$jscoverage['/word-filter.js'].lineData[599] = 0;
  _$jscoverage['/word-filter.js'].lineData[602] = 0;
  _$jscoverage['/word-filter.js'].lineData[605] = 0;
  _$jscoverage['/word-filter.js'].lineData[609] = 0;
  _$jscoverage['/word-filter.js'].lineData[612] = 0;
  _$jscoverage['/word-filter.js'].lineData[613] = 0;
  _$jscoverage['/word-filter.js'].lineData[614] = 0;
  _$jscoverage['/word-filter.js'].lineData[615] = 0;
  _$jscoverage['/word-filter.js'].lineData[619] = 0;
  _$jscoverage['/word-filter.js'].lineData[620] = 0;
  _$jscoverage['/word-filter.js'].lineData[621] = 0;
  _$jscoverage['/word-filter.js'].lineData[626] = 0;
  _$jscoverage['/word-filter.js'].lineData[627] = 0;
  _$jscoverage['/word-filter.js'].lineData[632] = 0;
  _$jscoverage['/word-filter.js'].lineData[634] = 0;
  _$jscoverage['/word-filter.js'].lineData[636] = 0;
  _$jscoverage['/word-filter.js'].lineData[638] = 0;
  _$jscoverage['/word-filter.js'].lineData[639] = 0;
  _$jscoverage['/word-filter.js'].lineData[647] = 0;
  _$jscoverage['/word-filter.js'].lineData[648] = 0;
  _$jscoverage['/word-filter.js'].lineData[651] = 0;
  _$jscoverage['/word-filter.js'].lineData[653] = 0;
  _$jscoverage['/word-filter.js'].lineData[656] = 0;
  _$jscoverage['/word-filter.js'].lineData[657] = 0;
  _$jscoverage['/word-filter.js'].lineData[658] = 0;
  _$jscoverage['/word-filter.js'].lineData[664] = 0;
  _$jscoverage['/word-filter.js'].lineData[665] = 0;
  _$jscoverage['/word-filter.js'].lineData[668] = 0;
  _$jscoverage['/word-filter.js'].lineData[669] = 0;
  _$jscoverage['/word-filter.js'].lineData[670] = 0;
  _$jscoverage['/word-filter.js'].lineData[673] = 0;
  _$jscoverage['/word-filter.js'].lineData[675] = 0;
  _$jscoverage['/word-filter.js'].lineData[679] = 0;
  _$jscoverage['/word-filter.js'].lineData[684] = 0;
  _$jscoverage['/word-filter.js'].lineData[685] = 0;
  _$jscoverage['/word-filter.js'].lineData[686] = 0;
  _$jscoverage['/word-filter.js'].lineData[689] = 0;
  _$jscoverage['/word-filter.js'].lineData[690] = 0;
  _$jscoverage['/word-filter.js'].lineData[693] = 0;
  _$jscoverage['/word-filter.js'].lineData[697] = 0;
  _$jscoverage['/word-filter.js'].lineData[699] = 0;
  _$jscoverage['/word-filter.js'].lineData[704] = 0;
  _$jscoverage['/word-filter.js'].lineData[707] = 0;
  _$jscoverage['/word-filter.js'].lineData[708] = 0;
  _$jscoverage['/word-filter.js'].lineData[709] = 0;
  _$jscoverage['/word-filter.js'].lineData[711] = 0;
  _$jscoverage['/word-filter.js'].lineData[712] = 0;
  _$jscoverage['/word-filter.js'].lineData[715] = 0;
  _$jscoverage['/word-filter.js'].lineData[722] = 0;
  _$jscoverage['/word-filter.js'].lineData[723] = 0;
  _$jscoverage['/word-filter.js'].lineData[733] = 0;
  _$jscoverage['/word-filter.js'].lineData[734] = 0;
  _$jscoverage['/word-filter.js'].lineData[739] = 0;
  _$jscoverage['/word-filter.js'].lineData[747] = 0;
  _$jscoverage['/word-filter.js'].lineData[748] = 0;
  _$jscoverage['/word-filter.js'].lineData[754] = 0;
  _$jscoverage['/word-filter.js'].lineData[755] = 0;
  _$jscoverage['/word-filter.js'].lineData[756] = 0;
  _$jscoverage['/word-filter.js'].lineData[761] = 0;
  _$jscoverage['/word-filter.js'].lineData[765] = 0;
  _$jscoverage['/word-filter.js'].lineData[766] = 0;
  _$jscoverage['/word-filter.js'].lineData[773] = 0;
  _$jscoverage['/word-filter.js'].lineData[774] = 0;
  _$jscoverage['/word-filter.js'].lineData[776] = 0;
  _$jscoverage['/word-filter.js'].lineData[777] = 0;
  _$jscoverage['/word-filter.js'].lineData[781] = 0;
  _$jscoverage['/word-filter.js'].lineData[782] = 0;
  _$jscoverage['/word-filter.js'].lineData[783] = 0;
  _$jscoverage['/word-filter.js'].lineData[784] = 0;
  _$jscoverage['/word-filter.js'].lineData[789] = 0;
  _$jscoverage['/word-filter.js'].lineData[790] = 0;
  _$jscoverage['/word-filter.js'].lineData[793] = 0;
  _$jscoverage['/word-filter.js'].lineData[794] = 0;
  _$jscoverage['/word-filter.js'].lineData[795] = 0;
  _$jscoverage['/word-filter.js'].lineData[796] = 0;
  _$jscoverage['/word-filter.js'].lineData[798] = 0;
  _$jscoverage['/word-filter.js'].lineData[799] = 0;
  _$jscoverage['/word-filter.js'].lineData[801] = 0;
  _$jscoverage['/word-filter.js'].lineData[805] = 0;
  _$jscoverage['/word-filter.js'].lineData[806] = 0;
  _$jscoverage['/word-filter.js'].lineData[807] = 0;
  _$jscoverage['/word-filter.js'].lineData[815] = 0;
  _$jscoverage['/word-filter.js'].lineData[817] = 0;
  _$jscoverage['/word-filter.js'].lineData[822] = 0;
  _$jscoverage['/word-filter.js'].lineData[827] = 0;
  _$jscoverage['/word-filter.js'].lineData[829] = 0;
  _$jscoverage['/word-filter.js'].lineData[830] = 0;
  _$jscoverage['/word-filter.js'].lineData[831] = 0;
  _$jscoverage['/word-filter.js'].lineData[835] = 0;
  _$jscoverage['/word-filter.js'].lineData[837] = 0;
  _$jscoverage['/word-filter.js'].lineData[838] = 0;
  _$jscoverage['/word-filter.js'].lineData[841] = 0;
  _$jscoverage['/word-filter.js'].lineData[842] = 0;
  _$jscoverage['/word-filter.js'].lineData[845] = 0;
  _$jscoverage['/word-filter.js'].lineData[846] = 0;
  _$jscoverage['/word-filter.js'].lineData[848] = 0;
  _$jscoverage['/word-filter.js'].lineData[849] = 0;
  _$jscoverage['/word-filter.js'].lineData[851] = 0;
  _$jscoverage['/word-filter.js'].lineData[857] = 0;
  _$jscoverage['/word-filter.js'].lineData[858] = 0;
  _$jscoverage['/word-filter.js'].lineData[861] = 0;
  _$jscoverage['/word-filter.js'].lineData[862] = 0;
  _$jscoverage['/word-filter.js'].lineData[863] = 0;
  _$jscoverage['/word-filter.js'].lineData[864] = 0;
  _$jscoverage['/word-filter.js'].lineData[867] = 0;
  _$jscoverage['/word-filter.js'].lineData[868] = 0;
  _$jscoverage['/word-filter.js'].lineData[874] = 0;
  _$jscoverage['/word-filter.js'].lineData[881] = 0;
  _$jscoverage['/word-filter.js'].lineData[882] = 0;
  _$jscoverage['/word-filter.js'].lineData[883] = 0;
  _$jscoverage['/word-filter.js'].lineData[885] = 0;
  _$jscoverage['/word-filter.js'].lineData[886] = 0;
  _$jscoverage['/word-filter.js'].lineData[887] = 0;
  _$jscoverage['/word-filter.js'].lineData[891] = 0;
  _$jscoverage['/word-filter.js'].lineData[893] = 0;
  _$jscoverage['/word-filter.js'].lineData[900] = 0;
  _$jscoverage['/word-filter.js'].lineData[901] = 0;
  _$jscoverage['/word-filter.js'].lineData[902] = 0;
  _$jscoverage['/word-filter.js'].lineData[904] = 0;
  _$jscoverage['/word-filter.js'].lineData[905] = 0;
  _$jscoverage['/word-filter.js'].lineData[908] = 0;
  _$jscoverage['/word-filter.js'].lineData[909] = 0;
  _$jscoverage['/word-filter.js'].lineData[912] = 0;
  _$jscoverage['/word-filter.js'].lineData[913] = 0;
  _$jscoverage['/word-filter.js'].lineData[914] = 0;
  _$jscoverage['/word-filter.js'].lineData[915] = 0;
  _$jscoverage['/word-filter.js'].lineData[921] = 0;
  _$jscoverage['/word-filter.js'].lineData[922] = 0;
  _$jscoverage['/word-filter.js'].lineData[934] = 0;
  _$jscoverage['/word-filter.js'].lineData[935] = 0;
  _$jscoverage['/word-filter.js'].lineData[936] = 0;
  _$jscoverage['/word-filter.js'].lineData[939] = 0;
  _$jscoverage['/word-filter.js'].lineData[941] = 0;
  _$jscoverage['/word-filter.js'].lineData[944] = 0;
  _$jscoverage['/word-filter.js'].lineData[946] = 0;
  _$jscoverage['/word-filter.js'].lineData[947] = 0;
  _$jscoverage['/word-filter.js'].lineData[949] = 0;
  _$jscoverage['/word-filter.js'].lineData[950] = 0;
  _$jscoverage['/word-filter.js'].lineData[952] = 0;
  _$jscoverage['/word-filter.js'].lineData[956] = 0;
  _$jscoverage['/word-filter.js'].lineData[958] = 0;
  _$jscoverage['/word-filter.js'].lineData[959] = 0;
  _$jscoverage['/word-filter.js'].lineData[960] = 0;
  _$jscoverage['/word-filter.js'].lineData[962] = 0;
  _$jscoverage['/word-filter.js'].lineData[964] = 0;
  _$jscoverage['/word-filter.js'].lineData[965] = 0;
  _$jscoverage['/word-filter.js'].lineData[966] = 0;
  _$jscoverage['/word-filter.js'].lineData[968] = 0;
  _$jscoverage['/word-filter.js'].lineData[971] = 0;
  _$jscoverage['/word-filter.js'].lineData[972] = 0;
  _$jscoverage['/word-filter.js'].lineData[975] = 0;
  _$jscoverage['/word-filter.js'].lineData[977] = 0;
  _$jscoverage['/word-filter.js'].lineData[978] = 0;
  _$jscoverage['/word-filter.js'].lineData[984] = 0;
  _$jscoverage['/word-filter.js'].lineData[985] = 0;
  _$jscoverage['/word-filter.js'].lineData[987] = 0;
  _$jscoverage['/word-filter.js'].lineData[988] = 0;
  _$jscoverage['/word-filter.js'].lineData[989] = 0;
  _$jscoverage['/word-filter.js'].lineData[990] = 0;
  _$jscoverage['/word-filter.js'].lineData[995] = 0;
  _$jscoverage['/word-filter.js'].lineData[996] = 0;
  _$jscoverage['/word-filter.js'].lineData[997] = 0;
  _$jscoverage['/word-filter.js'].lineData[1000] = 0;
  _$jscoverage['/word-filter.js'].lineData[1003] = 0;
  _$jscoverage['/word-filter.js'].lineData[1004] = 0;
  _$jscoverage['/word-filter.js'].lineData[1008] = 0;
  _$jscoverage['/word-filter.js'].lineData[1009] = 0;
  _$jscoverage['/word-filter.js'].lineData[1011] = 0;
  _$jscoverage['/word-filter.js'].lineData[1013] = 0;
  _$jscoverage['/word-filter.js'].lineData[1018] = 0;
  _$jscoverage['/word-filter.js'].lineData[1022] = 0;
  _$jscoverage['/word-filter.js'].lineData[1024] = 0;
  _$jscoverage['/word-filter.js'].lineData[1039] = 0;
  _$jscoverage['/word-filter.js'].lineData[1040] = 0;
  _$jscoverage['/word-filter.js'].lineData[1041] = 0;
  _$jscoverage['/word-filter.js'].lineData[1042] = 0;
  _$jscoverage['/word-filter.js'].lineData[1043] = 0;
  _$jscoverage['/word-filter.js'].lineData[1047] = 0;
  _$jscoverage['/word-filter.js'].lineData[1048] = 0;
  _$jscoverage['/word-filter.js'].lineData[1072] = 0;
  _$jscoverage['/word-filter.js'].lineData[1073] = 0;
  _$jscoverage['/word-filter.js'].lineData[1076] = 0;
  _$jscoverage['/word-filter.js'].lineData[1077] = 0;
  _$jscoverage['/word-filter.js'].lineData[1079] = 0;
  _$jscoverage['/word-filter.js'].lineData[1080] = 0;
  _$jscoverage['/word-filter.js'].lineData[1083] = 0;
  _$jscoverage['/word-filter.js'].lineData[1084] = 0;
  _$jscoverage['/word-filter.js'].lineData[1088] = 0;
  _$jscoverage['/word-filter.js'].lineData[1096] = 0;
  _$jscoverage['/word-filter.js'].lineData[1097] = 0;
  _$jscoverage['/word-filter.js'].lineData[1103] = 0;
  _$jscoverage['/word-filter.js'].lineData[1104] = 0;
  _$jscoverage['/word-filter.js'].lineData[1112] = 0;
  _$jscoverage['/word-filter.js'].lineData[1113] = 0;
  _$jscoverage['/word-filter.js'].lineData[1118] = 0;
  _$jscoverage['/word-filter.js'].lineData[1119] = 0;
  _$jscoverage['/word-filter.js'].lineData[1134] = 0;
  _$jscoverage['/word-filter.js'].lineData[1135] = 0;
  _$jscoverage['/word-filter.js'].lineData[1145] = 0;
  _$jscoverage['/word-filter.js'].lineData[1149] = 0;
  _$jscoverage['/word-filter.js'].lineData[1151] = 0;
  _$jscoverage['/word-filter.js'].lineData[1153] = 0;
  _$jscoverage['/word-filter.js'].lineData[1157] = 0;
  _$jscoverage['/word-filter.js'].lineData[1158] = 0;
  _$jscoverage['/word-filter.js'].lineData[1165] = 0;
  _$jscoverage['/word-filter.js'].lineData[1166] = 0;
  _$jscoverage['/word-filter.js'].lineData[1168] = 0;
  _$jscoverage['/word-filter.js'].lineData[1171] = 0;
  _$jscoverage['/word-filter.js'].lineData[1177] = 0;
  _$jscoverage['/word-filter.js'].lineData[1196] = 0;
  _$jscoverage['/word-filter.js'].lineData[1197] = 0;
  _$jscoverage['/word-filter.js'].lineData[1202] = 0;
  _$jscoverage['/word-filter.js'].lineData[1204] = 0;
}
if (! _$jscoverage['/word-filter.js'].functionData) {
  _$jscoverage['/word-filter.js'].functionData = [];
  _$jscoverage['/word-filter.js'].functionData[0] = 0;
  _$jscoverage['/word-filter.js'].functionData[1] = 0;
  _$jscoverage['/word-filter.js'].functionData[2] = 0;
  _$jscoverage['/word-filter.js'].functionData[3] = 0;
  _$jscoverage['/word-filter.js'].functionData[4] = 0;
  _$jscoverage['/word-filter.js'].functionData[5] = 0;
  _$jscoverage['/word-filter.js'].functionData[6] = 0;
  _$jscoverage['/word-filter.js'].functionData[7] = 0;
  _$jscoverage['/word-filter.js'].functionData[8] = 0;
  _$jscoverage['/word-filter.js'].functionData[9] = 0;
  _$jscoverage['/word-filter.js'].functionData[10] = 0;
  _$jscoverage['/word-filter.js'].functionData[11] = 0;
  _$jscoverage['/word-filter.js'].functionData[12] = 0;
  _$jscoverage['/word-filter.js'].functionData[13] = 0;
  _$jscoverage['/word-filter.js'].functionData[14] = 0;
  _$jscoverage['/word-filter.js'].functionData[15] = 0;
  _$jscoverage['/word-filter.js'].functionData[16] = 0;
  _$jscoverage['/word-filter.js'].functionData[17] = 0;
  _$jscoverage['/word-filter.js'].functionData[18] = 0;
  _$jscoverage['/word-filter.js'].functionData[19] = 0;
  _$jscoverage['/word-filter.js'].functionData[20] = 0;
  _$jscoverage['/word-filter.js'].functionData[21] = 0;
  _$jscoverage['/word-filter.js'].functionData[22] = 0;
  _$jscoverage['/word-filter.js'].functionData[23] = 0;
  _$jscoverage['/word-filter.js'].functionData[24] = 0;
  _$jscoverage['/word-filter.js'].functionData[25] = 0;
  _$jscoverage['/word-filter.js'].functionData[26] = 0;
  _$jscoverage['/word-filter.js'].functionData[27] = 0;
  _$jscoverage['/word-filter.js'].functionData[28] = 0;
  _$jscoverage['/word-filter.js'].functionData[29] = 0;
  _$jscoverage['/word-filter.js'].functionData[30] = 0;
  _$jscoverage['/word-filter.js'].functionData[31] = 0;
  _$jscoverage['/word-filter.js'].functionData[32] = 0;
  _$jscoverage['/word-filter.js'].functionData[33] = 0;
  _$jscoverage['/word-filter.js'].functionData[34] = 0;
  _$jscoverage['/word-filter.js'].functionData[35] = 0;
  _$jscoverage['/word-filter.js'].functionData[36] = 0;
  _$jscoverage['/word-filter.js'].functionData[37] = 0;
  _$jscoverage['/word-filter.js'].functionData[38] = 0;
  _$jscoverage['/word-filter.js'].functionData[39] = 0;
  _$jscoverage['/word-filter.js'].functionData[40] = 0;
  _$jscoverage['/word-filter.js'].functionData[41] = 0;
  _$jscoverage['/word-filter.js'].functionData[42] = 0;
  _$jscoverage['/word-filter.js'].functionData[43] = 0;
  _$jscoverage['/word-filter.js'].functionData[44] = 0;
  _$jscoverage['/word-filter.js'].functionData[45] = 0;
  _$jscoverage['/word-filter.js'].functionData[46] = 0;
  _$jscoverage['/word-filter.js'].functionData[47] = 0;
  _$jscoverage['/word-filter.js'].functionData[48] = 0;
  _$jscoverage['/word-filter.js'].functionData[49] = 0;
  _$jscoverage['/word-filter.js'].functionData[50] = 0;
  _$jscoverage['/word-filter.js'].functionData[51] = 0;
  _$jscoverage['/word-filter.js'].functionData[52] = 0;
  _$jscoverage['/word-filter.js'].functionData[53] = 0;
  _$jscoverage['/word-filter.js'].functionData[54] = 0;
  _$jscoverage['/word-filter.js'].functionData[55] = 0;
  _$jscoverage['/word-filter.js'].functionData[56] = 0;
  _$jscoverage['/word-filter.js'].functionData[57] = 0;
}
if (! _$jscoverage['/word-filter.js'].branchData) {
  _$jscoverage['/word-filter.js'].branchData = {};
  _$jscoverage['/word-filter.js'].branchData['57'] = [];
  _$jscoverage['/word-filter.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['58'] = [];
  _$jscoverage['/word-filter.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['69'] = [];
  _$jscoverage['/word-filter.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['77'] = [];
  _$jscoverage['/word-filter.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['92'] = [];
  _$jscoverage['/word-filter.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['100'] = [];
  _$jscoverage['/word-filter.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['114'] = [];
  _$jscoverage['/word-filter.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['116'] = [];
  _$jscoverage['/word-filter.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['116'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['117'] = [];
  _$jscoverage['/word-filter.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['121'] = [];
  _$jscoverage['/word-filter.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['125'] = [];
  _$jscoverage['/word-filter.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['127'] = [];
  _$jscoverage['/word-filter.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['130'] = [];
  _$jscoverage['/word-filter.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['141'] = [];
  _$jscoverage['/word-filter.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['141'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['150'] = [];
  _$jscoverage['/word-filter.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['152'] = [];
  _$jscoverage['/word-filter.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['154'] = [];
  _$jscoverage['/word-filter.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['156'] = [];
  _$jscoverage['/word-filter.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['158'] = [];
  _$jscoverage['/word-filter.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['171'] = [];
  _$jscoverage['/word-filter.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['175'] = [];
  _$jscoverage['/word-filter.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['205'] = [];
  _$jscoverage['/word-filter.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['205'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['219'] = [];
  _$jscoverage['/word-filter.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['234'] = [];
  _$jscoverage['/word-filter.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['237'] = [];
  _$jscoverage['/word-filter.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['240'] = [];
  _$jscoverage['/word-filter.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['241'] = [];
  _$jscoverage['/word-filter.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['246'] = [];
  _$jscoverage['/word-filter.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['249'] = [];
  _$jscoverage['/word-filter.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['257'] = [];
  _$jscoverage['/word-filter.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['265'] = [];
  _$jscoverage['/word-filter.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['270'] = [];
  _$jscoverage['/word-filter.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['273'] = [];
  _$jscoverage['/word-filter.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['285'] = [];
  _$jscoverage['/word-filter.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['291'] = [];
  _$jscoverage['/word-filter.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['308'] = [];
  _$jscoverage['/word-filter.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['325'] = [];
  _$jscoverage['/word-filter.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['328'] = [];
  _$jscoverage['/word-filter.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['333'] = [];
  _$jscoverage['/word-filter.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['336'] = [];
  _$jscoverage['/word-filter.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['343'] = [];
  _$jscoverage['/word-filter.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['353'] = [];
  _$jscoverage['/word-filter.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['358'] = [];
  _$jscoverage['/word-filter.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['359'] = [];
  _$jscoverage['/word-filter.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['365'] = [];
  _$jscoverage['/word-filter.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['375'] = [];
  _$jscoverage['/word-filter.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['378'] = [];
  _$jscoverage['/word-filter.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['378'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['380'] = [];
  _$jscoverage['/word-filter.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['380'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['399'] = [];
  _$jscoverage['/word-filter.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['405'] = [];
  _$jscoverage['/word-filter.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['405'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['406'] = [];
  _$jscoverage['/word-filter.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['406'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['406'][3] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['411'] = [];
  _$jscoverage['/word-filter.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['411'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['431'] = [];
  _$jscoverage['/word-filter.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['436'] = [];
  _$jscoverage['/word-filter.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['441'] = [];
  _$jscoverage['/word-filter.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['445'] = [];
  _$jscoverage['/word-filter.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['459'] = [];
  _$jscoverage['/word-filter.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['459'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['459'][3] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['464'] = [];
  _$jscoverage['/word-filter.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['489'] = [];
  _$jscoverage['/word-filter.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['494'] = [];
  _$jscoverage['/word-filter.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['502'] = [];
  _$jscoverage['/word-filter.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['503'] = [];
  _$jscoverage['/word-filter.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['509'] = [];
  _$jscoverage['/word-filter.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['509'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['510'] = [];
  _$jscoverage['/word-filter.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['511'] = [];
  _$jscoverage['/word-filter.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['512'] = [];
  _$jscoverage['/word-filter.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['515'] = [];
  _$jscoverage['/word-filter.js'].branchData['515'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['521'] = [];
  _$jscoverage['/word-filter.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['526'] = [];
  _$jscoverage['/word-filter.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['535'] = [];
  _$jscoverage['/word-filter.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['541'] = [];
  _$jscoverage['/word-filter.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['561'] = [];
  _$jscoverage['/word-filter.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['570'] = [];
  _$jscoverage['/word-filter.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['574'] = [];
  _$jscoverage['/word-filter.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['577'] = [];
  _$jscoverage['/word-filter.js'].branchData['577'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['577'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['583'] = [];
  _$jscoverage['/word-filter.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['584'] = [];
  _$jscoverage['/word-filter.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['584'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['594'] = [];
  _$jscoverage['/word-filter.js'].branchData['594'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['595'] = [];
  _$jscoverage['/word-filter.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['598'] = [];
  _$jscoverage['/word-filter.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['620'] = [];
  _$jscoverage['/word-filter.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['627'] = [];
  _$jscoverage['/word-filter.js'].branchData['627'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['634'] = [];
  _$jscoverage['/word-filter.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['635'] = [];
  _$jscoverage['/word-filter.js'].branchData['635'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['638'] = [];
  _$jscoverage['/word-filter.js'].branchData['638'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['648'] = [];
  _$jscoverage['/word-filter.js'].branchData['648'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['648'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['651'] = [];
  _$jscoverage['/word-filter.js'].branchData['651'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['651'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['651'][3] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['652'] = [];
  _$jscoverage['/word-filter.js'].branchData['652'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['657'] = [];
  _$jscoverage['/word-filter.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['658'] = [];
  _$jscoverage['/word-filter.js'].branchData['658'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['658'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['668'] = [];
  _$jscoverage['/word-filter.js'].branchData['668'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['669'] = [];
  _$jscoverage['/word-filter.js'].branchData['669'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['684'] = [];
  _$jscoverage['/word-filter.js'].branchData['684'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['711'] = [];
  _$jscoverage['/word-filter.js'].branchData['711'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['755'] = [];
  _$jscoverage['/word-filter.js'].branchData['755'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['761'] = [];
  _$jscoverage['/word-filter.js'].branchData['761'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['765'] = [];
  _$jscoverage['/word-filter.js'].branchData['765'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['773'] = [];
  _$jscoverage['/word-filter.js'].branchData['773'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['776'] = [];
  _$jscoverage['/word-filter.js'].branchData['776'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['781'] = [];
  _$jscoverage['/word-filter.js'].branchData['781'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['783'] = [];
  _$jscoverage['/word-filter.js'].branchData['783'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['789'] = [];
  _$jscoverage['/word-filter.js'].branchData['789'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['789'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['789'][3] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['793'] = [];
  _$jscoverage['/word-filter.js'].branchData['793'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['795'] = [];
  _$jscoverage['/word-filter.js'].branchData['795'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['805'] = [];
  _$jscoverage['/word-filter.js'].branchData['805'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['815'] = [];
  _$jscoverage['/word-filter.js'].branchData['815'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['819'] = [];
  _$jscoverage['/word-filter.js'].branchData['819'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['822'] = [];
  _$jscoverage['/word-filter.js'].branchData['822'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['831'] = [];
  _$jscoverage['/word-filter.js'].branchData['831'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['837'] = [];
  _$jscoverage['/word-filter.js'].branchData['837'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['841'] = [];
  _$jscoverage['/word-filter.js'].branchData['841'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['845'] = [];
  _$jscoverage['/word-filter.js'].branchData['845'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['848'] = [];
  _$jscoverage['/word-filter.js'].branchData['848'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['861'] = [];
  _$jscoverage['/word-filter.js'].branchData['861'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['863'] = [];
  _$jscoverage['/word-filter.js'].branchData['863'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['867'] = [];
  _$jscoverage['/word-filter.js'].branchData['867'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['881'] = [];
  _$jscoverage['/word-filter.js'].branchData['881'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['883'] = [];
  _$jscoverage['/word-filter.js'].branchData['883'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['883'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['885'] = [];
  _$jscoverage['/word-filter.js'].branchData['885'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['886'] = [];
  _$jscoverage['/word-filter.js'].branchData['886'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['901'] = [];
  _$jscoverage['/word-filter.js'].branchData['901'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['901'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['908'] = [];
  _$jscoverage['/word-filter.js'].branchData['908'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['921'] = [];
  _$jscoverage['/word-filter.js'].branchData['921'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['934'] = [];
  _$jscoverage['/word-filter.js'].branchData['934'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['944'] = [];
  _$jscoverage['/word-filter.js'].branchData['944'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['949'] = [];
  _$jscoverage['/word-filter.js'].branchData['949'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['956'] = [];
  _$jscoverage['/word-filter.js'].branchData['956'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['958'] = [];
  _$jscoverage['/word-filter.js'].branchData['958'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['959'] = [];
  _$jscoverage['/word-filter.js'].branchData['959'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['964'] = [];
  _$jscoverage['/word-filter.js'].branchData['964'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['971'] = [];
  _$jscoverage['/word-filter.js'].branchData['971'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['973'] = [];
  _$jscoverage['/word-filter.js'].branchData['973'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['974'] = [];
  _$jscoverage['/word-filter.js'].branchData['974'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['984'] = [];
  _$jscoverage['/word-filter.js'].branchData['984'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['988'] = [];
  _$jscoverage['/word-filter.js'].branchData['988'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['995'] = [];
  _$jscoverage['/word-filter.js'].branchData['995'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['997'] = [];
  _$jscoverage['/word-filter.js'].branchData['997'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['997'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1000'] = [];
  _$jscoverage['/word-filter.js'].branchData['1000'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1000'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1001'] = [];
  _$jscoverage['/word-filter.js'].branchData['1001'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1003'] = [];
  _$jscoverage['/word-filter.js'].branchData['1003'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1009'] = [];
  _$jscoverage['/word-filter.js'].branchData['1009'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1022'] = [];
  _$jscoverage['/word-filter.js'].branchData['1022'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1040'] = [];
  _$jscoverage['/word-filter.js'].branchData['1040'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1042'] = [];
  _$jscoverage['/word-filter.js'].branchData['1042'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1042'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1047'] = [];
  _$jscoverage['/word-filter.js'].branchData['1047'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1072'] = [];
  _$jscoverage['/word-filter.js'].branchData['1072'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1076'] = [];
  _$jscoverage['/word-filter.js'].branchData['1076'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1079'] = [];
  _$jscoverage['/word-filter.js'].branchData['1079'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1083'] = [];
  _$jscoverage['/word-filter.js'].branchData['1083'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1096'] = [];
  _$jscoverage['/word-filter.js'].branchData['1096'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1103'] = [];
  _$jscoverage['/word-filter.js'].branchData['1103'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1112'] = [];
  _$jscoverage['/word-filter.js'].branchData['1112'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1118'] = [];
  _$jscoverage['/word-filter.js'].branchData['1118'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1149'] = [];
  _$jscoverage['/word-filter.js'].branchData['1149'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1151'] = [];
  _$jscoverage['/word-filter.js'].branchData['1151'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1151'][2] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1152'] = [];
  _$jscoverage['/word-filter.js'].branchData['1152'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1157'] = [];
  _$jscoverage['/word-filter.js'].branchData['1157'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1161'] = [];
  _$jscoverage['/word-filter.js'].branchData['1161'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1162'] = [];
  _$jscoverage['/word-filter.js'].branchData['1162'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1165'] = [];
  _$jscoverage['/word-filter.js'].branchData['1165'][1] = new BranchData();
  _$jscoverage['/word-filter.js'].branchData['1196'] = [];
  _$jscoverage['/word-filter.js'].branchData['1196'][1] = new BranchData();
}
_$jscoverage['/word-filter.js'].branchData['1196'][1].init(790, 8, 'UA.gecko');
function visit187_1196_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1196'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1165'][1].init(561, 6, 'imgSrc');
function visit186_1165_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1165'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1162'][1].init(410, 29, 'imgSrcInfo && imgSrcInfo[1]');
function visit185_1162_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1162'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1161'][1].init(281, 90, 'previousComment && previousComment.toHtml().match(/<v:imagedata[^>]*o:href=[\'\'](.*?)[\'\']/)');
function visit184_1161_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1161'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1157'][1].init(713, 21, 'UA.gecko && imageInfo');
function visit183_1157_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1157'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1152'][1].init(95, 60, 'listSymbol && listSymbol.match(/>(?:[(]?)([^\\s]+?)([.)]?)</)');
function visit182_1152_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1152'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1151'][2].init(136, 17, 'imageInfo && \'l.\'');
function visit181_1151_2(result) {
  _$jscoverage['/word-filter.js'].branchData['1151'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1151'][1].init(117, 38, 'listInfo[1] || (imageInfo && \'l.\')');
function visit180_1151_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1151'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1149'][1].init(235, 8, 'listInfo');
function visit179_1149_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1149'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1118'][1].init(25, 37, 'element.nodeName in dtd.$tableContent');
function visit178_1118_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1118'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1112'][1].init(25, 37, 'element.nodeName in dtd.$tableContent');
function visit177_1112_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1112'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1103'][1].init(33, 54, 'element.nodeName in {\n  table: 1, \n  td: 1, \n  th: 1, \n  img: 1}');
function visit176_1103_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1103'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1096'][1].init(33, 26, 'element.nodeName === \'img\'');
function visit175_1096_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1096'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1083'][1].init(524, 38, 'value && !emptyMarginRegex.test(value)');
function visit174_1083_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1083'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1079'][1].init(389, 24, 'name !== indentStyleName');
function visit173_1079_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1079'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1076'][1].init(179, 17, 'name === \'margin\'');
function visit172_1076_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1076'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1072'][1].init(29, 36, 'element.nodeName in {\n  p: 1, \n  div: 1}');
function visit171_1072_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1072'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1047'][1].init(25, 27, 'getAncestor(element, /h\\d/)');
function visit170_1047_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1047'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1042'][2].init(224, 40, 'href && href.match(/file:\\/\\/\\/[\\S]+#/i)');
function visit169_1042_2(result) {
  _$jscoverage['/word-filter.js'].branchData['1042'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1042'][1].init(211, 53, 'UA.webkit && href && href.match(/file:\\/\\/\\/[\\S]+#/i)');
function visit168_1042_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1042'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1040'][1].init(55, 70, '!(href = element.getAttribute(\'href\')) && element.getAttribute(\'name\')');
function visit167_1040_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1040'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1022'][1].init(2157, 9, 'styleText');
function visit166_1022_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1022'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1009'][1].init(462, 119, 'ancestor && (/ mso-hide:\\s*all|display:\\s*none /).test(ancestor.getAttribute(\'style\'))');
function visit165_1009_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1009'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1003'][1].init(418, 8, 'listType');
function visit164_1003_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1003'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1001'][1].init(111, 60, 'listSymbol && listSymbol.match(/^(?:[(]?)([^\\s]+?)([.)]?)$/)');
function visit163_1001_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1001'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1000'][2].init(252, 32, 'listSymbolNode.nodeValue || \'l.\'');
function visit162_1000_2(result) {
  _$jscoverage['/word-filter.js'].branchData['1000'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['1000'][1].init(232, 54, 'listSymbolNode && (listSymbolNode.nodeValue || \'l.\')');
function visit161_1000_1(result) {
  _$jscoverage['/word-filter.js'].branchData['1000'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['997'][2].init(54, 23, 'node.nodeName === \'img\'');
function visit160_997_2(result) {
  _$jscoverage['/word-filter.js'].branchData['997'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['997'][1].init(36, 41, 'node.nodeValue || node.nodeName === \'img\'');
function visit159_997_1(result) {
  _$jscoverage['/word-filter.js'].branchData['997'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['995'][1].init(607, 30, 'isListBulletIndicator(element)');
function visit158_995_1(result) {
  _$jscoverage['/word-filter.js'].branchData['995'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['988'][1].init(274, 33, 'containsNothingButSpaces(element)');
function visit157_988_1(result) {
  _$jscoverage['/word-filter.js'].branchData['988'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['984'][1].init(99, 41, 'isListBulletIndicator(element.parentNode)');
function visit156_984_1(result) {
  _$jscoverage['/word-filter.js'].branchData['984'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['974'][1].init(58, 8, 'size < 3');
function visit155_974_1(result) {
  _$jscoverage['/word-filter.js'].branchData['974'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['973'][1].init(47, 8, 'size > 3');
function visit154_973_1(result) {
  _$jscoverage['/word-filter.js'].branchData['973'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['971'][1].init(969, 4, 'size');
function visit153_971_1(result) {
  _$jscoverage['/word-filter.js'].branchData['971'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['964'][1].init(517, 28, 'element.getAttribute(\'face\')');
function visit152_964_1(result) {
  _$jscoverage['/word-filter.js'].branchData['964'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['959'][1].init(33, 43, 'element.getAttribute(\'color\') !== \'#000000\'');
function visit151_959_1(result) {
  _$jscoverage['/word-filter.js'].branchData['959'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['958'][1].init(166, 29, 'element.getAttribute(\'color\')');
function visit150_958_1(result) {
  _$jscoverage['/word-filter.js'].branchData['958'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['956'][1].init(37, 15, 'styleText || \'\'');
function visit149_956_1(result) {
  _$jscoverage['/word-filter.js'].branchData['956'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['949'][1].init(198, 9, 'styleText');
function visit148_949_1(result) {
  _$jscoverage['/word-filter.js'].branchData['949'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['944'][1].init(443, 22, '\'font\' === parent.name');
function visit147_944_1(result) {
  _$jscoverage['/word-filter.js'].branchData['944'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['934'][1].init(101, 41, 'isListBulletIndicator(element.parentNode)');
function visit146_934_1(result) {
  _$jscoverage['/word-filter.js'].branchData['934'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['921'][1].init(82, 29, 'getAncestor(element, \'thead\')');
function visit145_921_1(result) {
  _$jscoverage['/word-filter.js'].branchData['921'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['908'][1].init(248, 29, 'element.getAttribute(\'style\')');
function visit144_908_1(result) {
  _$jscoverage['/word-filter.js'].branchData['908'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['901'][2].init(393, 32, 'singleChild.nodeName === \'table\'');
function visit143_901_2(result) {
  _$jscoverage['/word-filter.js'].branchData['901'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['901'][1].init(378, 47, 'singleChild && singleChild.nodeName === \'table\'');
function visit142_901_1(result) {
  _$jscoverage['/word-filter.js'].branchData['901'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['886'][1].init(312, 39, 'bullet && !bullet.getAttribute(\'style\')');
function visit141_886_1(result) {
  _$jscoverage['/word-filter.js'].branchData['886'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['885'][1].init(247, 35, 'bulletText && bulletText.parentNode');
function visit140_885_1(result) {
  _$jscoverage['/word-filter.js'].branchData['885'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['883'][2].init(36, 19, 'node.nodeType === 3');
function visit139_883_2(result) {
  _$jscoverage['/word-filter.js'].branchData['883'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['883'][1].init(36, 65, 'node.nodeType === 3 && !containsNothingButSpaces(node.parentNode)');
function visit138_883_1(result) {
  _$jscoverage['/word-filter.js'].branchData['883'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['881'][1].init(257, 54, '/MsoListParagraph/.exec(element.getAttribute(\'class\'))');
function visit137_881_1(result) {
  _$jscoverage['/word-filter.js'].branchData['881'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['867'][1].init(347, 5, 'style');
function visit136_867_1(result) {
  _$jscoverage['/word-filter.js'].branchData['867'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['863'][1].init(100, 25, 'typeof style === \'object\'');
function visit135_863_1(result) {
  _$jscoverage['/word-filter.js'].branchData['863'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['861'][1].init(241, 13, 'name in rules');
function visit134_861_1(result) {
  _$jscoverage['/word-filter.js'].branchData['861'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['848'][1].init(704, 9, 'className');
function visit133_848_1(result) {
  _$jscoverage['/word-filter.js'].branchData['848'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['845'][1].init(506, 17, '!rules[tagName]');
function visit132_845_1(result) {
  _$jscoverage['/word-filter.js'].branchData['845'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['841'][1].init(311, 28, 'className.match(/MsoNormal/)');
function visit131_841_1(result) {
  _$jscoverage['/word-filter.js'].branchData['841'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['837'][1].init(59, 14, 'tagName || \'*\'');
function visit130_837_1(result) {
  _$jscoverage['/word-filter.js'].branchData['837'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['831'][1].init(190, 10, 'i < length');
function visit129_831_1(result) {
  _$jscoverage['/word-filter.js'].branchData['831'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['822'][1].init(411, 12, 'styleDefText');
function visit128_822_1(result) {
  _$jscoverage['/word-filter.js'].branchData['822'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['819'][1].init(178, 39, 'styleDefSection && styleDefSection[1]');
function visit127_819_1(result) {
  _$jscoverage['/word-filter.js'].branchData['819'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['815'][1].init(25, 8, 'UA.gecko');
function visit126_815_1(result) {
  _$jscoverage['/word-filter.js'].branchData['815'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['805'][1].init(2097, 25, 'tagName in listDtdParents');
function visit125_805_1(result) {
  _$jscoverage['/word-filter.js'].branchData['805'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['795'][1].init(104, 4, 'href');
function visit124_795_1(result) {
  _$jscoverage['/word-filter.js'].branchData['795'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['793'][1].init(141, 25, 'tagName === \'v:imagedata\'');
function visit123_793_1(result) {
  _$jscoverage['/word-filter.js'].branchData['793'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['789'][3].init(1412, 28, 'tagName.indexOf(\'ke\') === -1');
function visit122_789_3(result) {
  _$jscoverage['/word-filter.js'].branchData['789'][3].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['789'][2].init(1381, 27, 'tagName.indexOf(\':\') !== -1');
function visit121_789_2(result) {
  _$jscoverage['/word-filter.js'].branchData['789'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['789'][1].init(1381, 59, 'tagName.indexOf(\':\') !== -1 && tagName.indexOf(\'ke\') === -1');
function visit120_789_1(result) {
  _$jscoverage['/word-filter.js'].branchData['789'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['783'][1].init(79, 33, 'containsNothingButSpaces(element)');
function visit119_783_1(result) {
  _$jscoverage['/word-filter.js'].branchData['783'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['781'][1].init(980, 22, 'tagName in dtd.$inline');
function visit118_781_1(result) {
  _$jscoverage['/word-filter.js'].branchData['781'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['776'][1].init(143, 24, 'resolveListItem(element)');
function visit117_776_1(result) {
  _$jscoverage['/word-filter.js'].branchData['776'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['773'][1].init(593, 20, 'tagName.match(/h\\d/)');
function visit116_773_1(result) {
  _$jscoverage['/word-filter.js'].branchData['773'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['765'][1].init(212, 53, 'tagName in blockLike && element.getAttribute(\'style\')');
function visit115_765_1(result) {
  _$jscoverage['/word-filter.js'].branchData['765'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['761'][1].init(35, 22, 'element.nodeName || \'\'');
function visit114_761_1(result) {
  _$jscoverage['/word-filter.js'].branchData['761'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['755'][1].init(139, 59, 'UA.gecko && (applyStyleFilter = filters.applyStyleFilter)');
function visit113_755_1(result) {
  _$jscoverage['/word-filter.js'].branchData['755'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['711'][1].init(162, 9, 'i < count');
function visit112_711_1(result) {
  _$jscoverage['/word-filter.js'].branchData['711'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['684'][1].init(2689, 34, '!element.getAttribute(\'ke:indent\')');
function visit111_684_1(result) {
  _$jscoverage['/word-filter.js'].branchData['684'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['669'][1].init(41, 25, 'listId !== previousListId');
function visit110_669_1(result) {
  _$jscoverage['/word-filter.js'].branchData['669'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['668'][1].init(244, 12, 'indent === 1');
function visit109_668_1(result) {
  _$jscoverage['/word-filter.js'].branchData['668'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['658'][2].init(34, 100, 'listBaseIndent && (Math.ceil(margin / listBaseIndent) + 1)');
function visit108_658_2(result) {
  _$jscoverage['/word-filter.js'].branchData['658'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['658'][1].init(71, 105, 'listBaseIndent && (Math.ceil(margin / listBaseIndent) + 1) || 1');
function visit107_658_1(result) {
  _$jscoverage['/word-filter.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['657'][1].init(727, 14, 'listBaseIndent');
function visit106_657_1(result) {
  _$jscoverage['/word-filter.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['652'][1].init(70, 31, 'margin > previousListItemMargin');
function visit105_652_1(result) {
  _$jscoverage['/word-filter.js'].branchData['652'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['651'][3].init(399, 31, 'previousListItemMargin !== null');
function visit104_651_3(result) {
  _$jscoverage['/word-filter.js'].branchData['651'][3].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['651'][2].init(399, 102, 'previousListItemMargin !== null && margin > previousListItemMargin');
function visit103_651_2(result) {
  _$jscoverage['/word-filter.js'].branchData['651'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['651'][1].init(380, 121, '!listBaseIndent && previousListItemMargin !== null && margin > previousListItemMargin');
function visit102_651_1(result) {
  _$jscoverage['/word-filter.js'].branchData['651'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['648'][2].init(36, 27, 'values[1] || values[0]');
function visit101_648_2(result) {
  _$jscoverage['/word-filter.js'].branchData['648'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['648'][1].init(190, 42, 'values[3] || values[1] || values[0]');
function visit100_648_1(result) {
  _$jscoverage['/word-filter.js'].branchData['648'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['638'][1].init(67, 29, 'element.getAttribute(\'style\')');
function visit99_638_1(result) {
  _$jscoverage['/word-filter.js'].branchData['638'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['635'][1].init(82, 53, 'listMarker.length && (listMarker = listMarker[0])');
function visit98_635_1(result) {
  _$jscoverage['/word-filter.js'].branchData['635'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['634'][1].init(101, 136, '(listMarker = removeAnyChildWithName(element, \'ke:listbullet\')) && listMarker.length && (listMarker = listMarker[0])');
function visit97_634_1(result) {
  _$jscoverage['/word-filter.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['627'][1].init(46, 74, '(text = onlyChild(element)) && (/^(:?\\s|&nbsp;)+$/).test(text.nodeValue)');
function visit96_627_1(result) {
  _$jscoverage['/word-filter.js'].branchData['627'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['620'][1].init(76, 40, '/mso-list\\s*:\\s*Ignore/i.test(styleText)');
function visit95_620_1(result) {
  _$jscoverage['/word-filter.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['598'][1].init(87, 5, 'style');
function visit94_598_1(result) {
  _$jscoverage['/word-filter.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['595'][1].init(25, 9, 'i < count');
function visit93_595_1(result) {
  _$jscoverage['/word-filter.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['594'][1].init(959, 10, 'mergeStyle');
function visit92_594_1(result) {
  _$jscoverage['/word-filter.js'].branchData['594'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['584'][2].init(21, 25, 'match[1] === mergeStyle');
function visit91_584_2(result) {
  _$jscoverage['/word-filter.js'].branchData['584'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['584'][1].init(21, 40, 'match[1] === mergeStyle || !mergeStyle');
function visit90_584_1(result) {
  _$jscoverage['/word-filter.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['583'][1].init(284, 5, 'match');
function visit89_583_1(result) {
  _$jscoverage['/word-filter.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['577'][2].init(84, 45, 'Number(child.getAttribute(\'value\')) === i + 1');
function visit88_577_2(result) {
  _$jscoverage['/word-filter.js'].branchData['577'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['577'][1].init(53, 76, 'child.getAttribute(\'value\') && Number(child.getAttribute(\'value\')) === i + 1');
function visit87_577_1(result) {
  _$jscoverage['/word-filter.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['574'][1].init(378, 9, 'i < count');
function visit86_574_1(result) {
  _$jscoverage['/word-filter.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['570'][1].init(271, 48, 'styleTypeRegexp.exec(list.getAttribute(\'style\'))');
function visit85_570_1(result) {
  _$jscoverage['/word-filter.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['561'][1].init(24, 21, 'list.childNodes || []');
function visit84_561_1(result) {
  _$jscoverage['/word-filter.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['541'][1].init(2573, 16, 'i < rules.length');
function visit83_541_1(result) {
  _$jscoverage['/word-filter.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['535'][1].init(1973, 10, '!whitelist');
function visit82_535_1(result) {
  _$jscoverage['/word-filter.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['526'][1].init(832, 28, 'typeof newValue === \'string\'');
function visit81_526_1(result) {
  _$jscoverage['/word-filter.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['521'][1].init(596, 25, 'newValue && newValue.push');
function visit80_521_1(result) {
  _$jscoverage['/word-filter.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['515'][1].init(267, 30, 'typeof newValue === \'function\'');
function visit79_515_1(result) {
  _$jscoverage['/word-filter.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['512'][1].init(54, 17, 'newValue || value');
function visit78_512_1(result) {
  _$jscoverage['/word-filter.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['511'][1].init(101, 9, 'whitelist');
function visit77_511_1(result) {
  _$jscoverage['/word-filter.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['510'][1].init(44, 15, 'newName || name');
function visit76_510_1(result) {
  _$jscoverage['/word-filter.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['509'][2].init(317, 42, '!valuePattern || value.match(valuePattern)');
function visit75_509_2(result) {
  _$jscoverage['/word-filter.js'].branchData['509'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['509'][1].init(288, 73, 'name.match(namePattern) && (!valuePattern || value.match(valuePattern))');
function visit74_509_1(result) {
  _$jscoverage['/word-filter.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['503'][1].init(33, 11, 'styles[i]');
function visit73_503_1(result) {
  _$jscoverage['/word-filter.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['502'][1].init(399, 17, 'i < styles.length');
function visit72_502_1(result) {
  _$jscoverage['/word-filter.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['494'][1].init(80, 22, 'name === \'font-family\'');
function visit71_494_1(result) {
  _$jscoverage['/word-filter.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['489'][1].init(-1, 15, 'styleText || \'\'');
function visit70_489_1(result) {
  _$jscoverage['/word-filter.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['464'][1].init(7648, 22, 'i < openedLists.length');
function visit69_464_1(result) {
  _$jscoverage['/word-filter.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['459'][3].init(6724, 20, 'child.nodeType === 3');
function visit68_459_3(result) {
  _$jscoverage['/word-filter.js'].branchData['459'][3].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['459'][2].init(6724, 48, 'child.nodeType === 3 && !S.trim(child.nodeValue)');
function visit67_459_2(result) {
  _$jscoverage['/word-filter.js'].branchData['459'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['459'][1].init(6714, 59, 'list && !(child.nodeType === 3 && !S.trim(child.nodeValue))');
function visit66_459_1(result) {
  _$jscoverage['/word-filter.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['445'][1].init(238, 38, 'diff-- && (parent = list.parentNode)');
function visit65_445_1(result) {
  _$jscoverage['/word-filter.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['441'][1].init(319, 27, 'listItemIndent < lastIndent');
function visit64_441_1(result) {
  _$jscoverage['/word-filter.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['436'][1].init(29, 27, 'listItemIndent > lastIndent');
function visit63_436_1(result) {
  _$jscoverage['/word-filter.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['431'][1].init(5270, 5, '!list');
function visit62_431_1(result) {
  _$jscoverage['/word-filter.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['411'][2].init(4341, 17, 'listType === \'ol\'');
function visit61_411_2(result) {
  _$jscoverage['/word-filter.js'].branchData['411'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['411'][1].init(4341, 27, 'listType === \'ol\' && bullet');
function visit60_411_1(result) {
  _$jscoverage['/word-filter.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['406'][3].init(4121, 17, 'listType === \'ol\'');
function visit59_406_3(result) {
  _$jscoverage['/word-filter.js'].branchData['406'][3].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['406'][2].init(4101, 60, 'listStyleType !== (listType === \'ol\' ? \'decimal\' : \'disc\')');
function visit58_406_2(result) {
  _$jscoverage['/word-filter.js'].branchData['406'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['406'][1].init(4084, 77, 'listStyleType && listStyleType !== (listType === \'ol\' ? \'decimal\' : \'disc\')');
function visit57_406_1(result) {
  _$jscoverage['/word-filter.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['405'][2].init(4018, 17, 'listType === \'ol\'');
function visit56_405_2(result) {
  _$jscoverage['/word-filter.js'].branchData['405'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['405'][1].init(3999, 59, 'listStyleType || (listType === \'ol\' ? \'decimal\' : \'disc\')');
function visit55_405_1(result) {
  _$jscoverage['/word-filter.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['399'][1].init(2246, 9, '!listType');
function visit54_399_1(result) {
  _$jscoverage['/word-filter.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['380'][2].init(193, 17, 'num < itemNumeric');
function visit53_380_2(result) {
  _$jscoverage['/word-filter.js'].branchData['380'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['380'][1].init(177, 33, '!itemNumeric || num < itemNumeric');
function visit52_380_1(result) {
  _$jscoverage['/word-filter.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['378'][2].init(228, 13, 'type === \'ol\'');
function visit51_378_2(result) {
  _$jscoverage['/word-filter.js'].branchData['378'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['378'][1].init(228, 46, 'type === \'ol\' && (/alpha|roman/).test(style)');
function visit50_378_1(result) {
  _$jscoverage['/word-filter.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['375'][1].init(42, 53, 'listMarkerPatterns[type][style].test(bullet[1])');
function visit49_375_1(result) {
  _$jscoverage['/word-filter.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['365'][1].init(216, 130, 'previousListType && listMarkerPatterns[previousListType][previousListStyleType].test(bullet[1])');
function visit48_365_1(result) {
  _$jscoverage['/word-filter.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['359'][1].init(36, 44, 'listItem.getAttribute(\'ke:listtype\') || \'ol\'');
function visit47_359_1(result) {
  _$jscoverage['/word-filter.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['358'][1].init(1303, 7, '!bullet');
function visit46_358_1(result) {
  _$jscoverage['/word-filter.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['353'][1].init(1080, 29, 'listItemIndent !== lastIndent');
function visit45_353_1(result) {
  _$jscoverage['/word-filter.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['343'][1].init(550, 33, 'listItem.getAttribute(\'ke:reset\')');
function visit44_343_1(result) {
  _$jscoverage['/word-filter.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['336'][1].init(328, 35, 'listItem.getAttribute(\'ke:ignored\')');
function visit43_336_1(result) {
  _$jscoverage['/word-filter.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['333'][1].init(182, 52, 'bullet && bullet.match(/^(?:[(]?)([^\\s]+?)([.)]?)$/)');
function visit42_333_1(result) {
  _$jscoverage['/word-filter.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['328'][1].init(61, 26, '\'ke:li\' === child.nodeName');
function visit41_328_1(result) {
  _$jscoverage['/word-filter.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['325'][1].init(727, 19, 'i < children.length');
function visit40_325_1(result) {
  _$jscoverage['/word-filter.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['308'][1].init(28, 24, 'element.childNodes || []');
function visit39_308_1(result) {
  _$jscoverage['/word-filter.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['291'][1].init(369, 7, 'j < num');
function visit38_291_1(result) {
  _$jscoverage['/word-filter.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['285'][1].init(2271, 27, 'child.nodeName in dtd.$list');
function visit37_285_1(result) {
  _$jscoverage['/word-filter.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['273'][1].init(167, 25, 'listId !== previousListId');
function visit36_273_1(result) {
  _$jscoverage['/word-filter.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['270'][1].init(423, 11, 'level === 1');
function visit35_270_1(result) {
  _$jscoverage['/word-filter.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['265'][1].init(132, 6, 'margin');
function visit34_265_1(result) {
  _$jscoverage['/word-filter.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['257'][1].init(740, 35, 'element.getAttribute(\'start\') && !i');
function visit33_257_1(result) {
  _$jscoverage['/word-filter.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['249'][1].init(159, 26, '!--listItemChildren.length');
function visit32_249_1(result) {
  _$jscoverage['/word-filter.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['246'][1].init(257, 26, 'last.nodeName in dtd.$list');
function visit31_246_1(result) {
  _$jscoverage['/word-filter.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['241'][1].init(44, 22, 'child.childNodes || []');
function visit30_241_1(result) {
  _$jscoverage['/word-filter.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['240'][1].init(61, 31, 'child.nodeName in dtd.$listItem');
function visit29_240_1(result) {
  _$jscoverage['/word-filter.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['237'][1].init(591, 19, 'i < children.length');
function visit28_237_1(result) {
  _$jscoverage['/word-filter.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['234'][1].init(513, 24, 'element.childNodes || []');
function visit27_234_1(result) {
  _$jscoverage['/word-filter.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['219'][1].init(21, 25, 'typeof level === \'number\'');
function visit26_219_1(result) {
  _$jscoverage['/word-filter.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['205'][2].init(18, 23, 'tag.indexOf(\'$\') === -1');
function visit25_205_2(result) {
  _$jscoverage['/word-filter.js'].branchData['205'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['205'][1].init(18, 48, 'tag.indexOf(\'$\') === -1 && dtd[tag][tagName]');
function visit24_205_1(result) {
  _$jscoverage['/word-filter.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['175'][1].init(47, 24, 'typeof name === \'object\'');
function visit23_175_1(result) {
  _$jscoverage['/word-filter.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['171'][1].init(93, 25, 'typeof value === \'string\'');
function visit22_171_1(result) {
  _$jscoverage['/word-filter.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['158'][1].init(75, 5, 'child');
function visit21_158_1(result) {
  _$jscoverage['/word-filter.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['156'][1].init(126, 14, 'child.nodeName');
function visit20_156_1(result) {
  _$jscoverage['/word-filter.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['154'][1].init(52, 16, 'evaluator(child)');
function visit19_154_1(result) {
  _$jscoverage['/word-filter.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['152'][1].init(102, 19, 'i < children.length');
function visit18_152_1(result) {
  _$jscoverage['/word-filter.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['150'][1].init(48, 21, 'elem.childNodes || []');
function visit17_150_1(result) {
  _$jscoverage['/word-filter.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['141'][2].init(67, 54, 'parent.nodeName && parent.nodeName.match(tagNameRegex)');
function visit16_141_2(result) {
  _$jscoverage['/word-filter.js'].branchData['141'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['141'][1].init(54, 69, 'parent && !(parent.nodeName && parent.nodeName.match(tagNameRegex))');
function visit15_141_1(result) {
  _$jscoverage['/word-filter.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['130'][1].init(127, 26, 'child.nodeName === tagName');
function visit14_130_1(result) {
  _$jscoverage['/word-filter.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['127'][1].init(52, 15, '!child.nodeName');
function visit13_127_1(result) {
  _$jscoverage['/word-filter.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['125'][1].init(113, 19, 'i < children.length');
function visit12_125_1(result) {
  _$jscoverage['/word-filter.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['121'][1].init(24, 21, 'elem.childNodes || []');
function visit11_121_1(result) {
  _$jscoverage['/word-filter.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['117'][1].init(160, 18, 'firstChild || null');
function visit10_117_1(result) {
  _$jscoverage['/word-filter.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['116'][2].init(104, 11, 'count === 1');
function visit9_116_2(result) {
  _$jscoverage['/word-filter.js'].branchData['116'][2].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['116'][1].init(104, 29, '(count === 1) && childNodes[0]');
function visit8_116_1(result) {
  _$jscoverage['/word-filter.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['114'][1].init(26, 21, 'elem.childNodes || []');
function visit7_114_1(result) {
  _$jscoverage['/word-filter.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['100'][1].init(294, 23, '!(/%$/).test(cssLength)');
function visit6_100_1(result) {
  _$jscoverage['/word-filter.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['92'][1].init(17, 11, '!calculator');
function visit5_92_1(result) {
  _$jscoverage['/word-filter.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['77'][1].init(13, 3, 'str');
function visit4_77_1(result) {
  _$jscoverage['/word-filter.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['69'][1].init(104, 14, 'str.length > 0');
function visit3_69_1(result) {
  _$jscoverage['/word-filter.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['58'][1].init(54, 25, 'str.substr(0, k) === j[1]');
function visit2_58_1(result) {
  _$jscoverage['/word-filter.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].branchData['57'][1].init(101, 5, 'i < l');
function visit1_57_1(result) {
  _$jscoverage['/word-filter.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/word-filter.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/word-filter.js'].functionData[0]++;
  _$jscoverage['/word-filter.js'].lineData[8]++;
  var HtmlParser = require('html-parser');
  _$jscoverage['/word-filter.js'].lineData[10]++;
  var $ = S.all, UA = S.UA, dtd = HtmlParser.DTD, wordFilter = new HtmlParser.Filter(), cssLengthRelativeUnit = /^([.\d]*)+(em|ex|px|gd|rem|vw|vh|vm|ch|mm|cm|in|pt|pc|deg|rad|ms|s|hz|khz){1}?/i, emptyMarginRegex = /^(?:\b0[^\s]*\s*){1,4}$/, romanLiteralPattern = '^m{0,4}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$', lowerRomanLiteralRegex = new RegExp(romanLiteralPattern), upperRomanLiteralRegex = new RegExp(romanLiteralPattern.toUpperCase()), orderedPatterns = {
  'decimal': /\d+/, 
  'lower-roman': lowerRomanLiteralRegex, 
  'upper-roman': upperRomanLiteralRegex, 
  'lower-alpha': /^[a-z]+$/, 
  'upper-alpha': /^[A-Z]+$/}, unorderedPatterns = {
  'disc': /[l\u00B7\u2002]/, 
  'circle': /[\u006F\u00D8]/, 
  'square': /[\u006E\u25C6]/}, listMarkerPatterns = {
  'ol': orderedPatterns, 
  'ul': unorderedPatterns}, romans = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']], alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  _$jscoverage['/word-filter.js'].lineData[54]++;
  function fromRoman(str) {
    _$jscoverage['/word-filter.js'].functionData[1]++;
    _$jscoverage['/word-filter.js'].lineData[55]++;
    str = str.toUpperCase();
    _$jscoverage['/word-filter.js'].lineData[56]++;
    var l = romans.length, retVal = 0;
    _$jscoverage['/word-filter.js'].lineData[57]++;
    for (var i = 0; visit1_57_1(i < l); ++i) {
      _$jscoverage['/word-filter.js'].lineData[58]++;
      for (var j = romans[i], k = j[1].length; visit2_58_1(str.substr(0, k) === j[1]); str = str.substr(k)) {
        _$jscoverage['/word-filter.js'].lineData[59]++;
        retVal += j[0];
      }
    }
    _$jscoverage['/word-filter.js'].lineData[62]++;
    return retVal;
  }
  _$jscoverage['/word-filter.js'].lineData[66]++;
  function fromAlphabet(str) {
    _$jscoverage['/word-filter.js'].functionData[2]++;
    _$jscoverage['/word-filter.js'].lineData[67]++;
    str = str.toUpperCase();
    _$jscoverage['/word-filter.js'].lineData[68]++;
    var l = alphabets.length, retVal = 1;
    _$jscoverage['/word-filter.js'].lineData[69]++;
    for (var x = 1; visit3_69_1(str.length > 0); x *= l) {
      _$jscoverage['/word-filter.js'].lineData[70]++;
      retVal += alphabets.indexOf(str.charAt(str.length - 1)) * x;
      _$jscoverage['/word-filter.js'].lineData[71]++;
      str = str.substr(0, str.length - 1);
    }
    _$jscoverage['/word-filter.js'].lineData[73]++;
    return retVal;
  }
  _$jscoverage['/word-filter.js'].lineData[76]++;
  function setStyle(element, str) {
    _$jscoverage['/word-filter.js'].functionData[3]++;
    _$jscoverage['/word-filter.js'].lineData[77]++;
    if (visit4_77_1(str)) {
      _$jscoverage['/word-filter.js'].lineData[78]++;
      element.setAttribute('style', str);
    } else {
      _$jscoverage['/word-filter.js'].lineData[80]++;
      element.removeAttribute('style');
    }
  }
  _$jscoverage['/word-filter.js'].lineData[88]++;
  var convertToPx = (function() {
  _$jscoverage['/word-filter.js'].functionData[4]++;
  _$jscoverage['/word-filter.js'].lineData[89]++;
  var calculator;
  _$jscoverage['/word-filter.js'].lineData[91]++;
  return function(cssLength) {
  _$jscoverage['/word-filter.js'].functionData[5]++;
  _$jscoverage['/word-filter.js'].lineData[92]++;
  if (visit5_92_1(!calculator)) {
    _$jscoverage['/word-filter.js'].lineData[93]++;
    calculator = $('<div style="position:absolute;left:-9999px;' + 'top:-9999px;margin:0px;padding:0px;border:0px;"' + '></div>').prependTo('body');
  }
  _$jscoverage['/word-filter.js'].lineData[100]++;
  if (visit6_100_1(!(/%$/).test(cssLength))) {
    _$jscoverage['/word-filter.js'].lineData[101]++;
    calculator.css('width', cssLength);
    _$jscoverage['/word-filter.js'].lineData[102]++;
    return calculator[0].clientWidth;
  }
  _$jscoverage['/word-filter.js'].lineData[105]++;
  return cssLength;
};
})();
  _$jscoverage['/word-filter.js'].lineData[109]++;
  var listBaseIndent = 0, previousListItemMargin = null, previousListId;
  _$jscoverage['/word-filter.js'].lineData[113]++;
  function onlyChild(elem) {
    _$jscoverage['/word-filter.js'].functionData[6]++;
    _$jscoverage['/word-filter.js'].lineData[114]++;
    var childNodes = visit7_114_1(elem.childNodes || []), count = childNodes.length, firstChild = visit8_116_1((visit9_116_2(count === 1)) && childNodes[0]);
    _$jscoverage['/word-filter.js'].lineData[117]++;
    return visit10_117_1(firstChild || null);
  }
  _$jscoverage['/word-filter.js'].lineData[120]++;
  function removeAnyChildWithName(elem, tagName) {
    _$jscoverage['/word-filter.js'].functionData[7]++;
    _$jscoverage['/word-filter.js'].lineData[121]++;
    var children = visit11_121_1(elem.childNodes || []), ret = [], child;
    _$jscoverage['/word-filter.js'].lineData[125]++;
    for (var i = 0; visit12_125_1(i < children.length); i++) {
      _$jscoverage['/word-filter.js'].lineData[126]++;
      child = children[i];
      _$jscoverage['/word-filter.js'].lineData[127]++;
      if (visit13_127_1(!child.nodeName)) {
        _$jscoverage['/word-filter.js'].lineData[128]++;
        continue;
      }
      _$jscoverage['/word-filter.js'].lineData[130]++;
      if (visit14_130_1(child.nodeName === tagName)) {
        _$jscoverage['/word-filter.js'].lineData[131]++;
        ret.push(child);
        _$jscoverage['/word-filter.js'].lineData[132]++;
        children.splice(i--, 1);
      }
      _$jscoverage['/word-filter.js'].lineData[134]++;
      ret = ret.concat(removeAnyChildWithName(child, tagName));
    }
    _$jscoverage['/word-filter.js'].lineData[136]++;
    return ret;
  }
  _$jscoverage['/word-filter.js'].lineData[139]++;
  function getAncestor(elem, tagNameRegex) {
    _$jscoverage['/word-filter.js'].functionData[8]++;
    _$jscoverage['/word-filter.js'].lineData[140]++;
    var parent = elem.parentNode;
    _$jscoverage['/word-filter.js'].lineData[141]++;
    while (visit15_141_1(parent && !(visit16_141_2(parent.nodeName && parent.nodeName.match(tagNameRegex))))) {
      _$jscoverage['/word-filter.js'].lineData[142]++;
      parent = parent.parentNode;
    }
    _$jscoverage['/word-filter.js'].lineData[144]++;
    return parent;
  }
  _$jscoverage['/word-filter.js'].lineData[147]++;
  function firstChild(elem, evaluator) {
    _$jscoverage['/word-filter.js'].functionData[9]++;
    _$jscoverage['/word-filter.js'].lineData[148]++;
    var child, i, children = visit17_150_1(elem.childNodes || []);
    _$jscoverage['/word-filter.js'].lineData[152]++;
    for (i = 0; visit18_152_1(i < children.length); i++) {
      _$jscoverage['/word-filter.js'].lineData[153]++;
      child = children[i];
      _$jscoverage['/word-filter.js'].lineData[154]++;
      if (visit19_154_1(evaluator(child))) {
        _$jscoverage['/word-filter.js'].lineData[155]++;
        return child;
      } else {
        _$jscoverage['/word-filter.js'].lineData[156]++;
        if (visit20_156_1(child.nodeName)) {
          _$jscoverage['/word-filter.js'].lineData[157]++;
          child = firstChild(child, evaluator);
          _$jscoverage['/word-filter.js'].lineData[158]++;
          if (visit21_158_1(child)) {
            _$jscoverage['/word-filter.js'].lineData[159]++;
            return child;
          }
        }
      }
    }
    _$jscoverage['/word-filter.js'].lineData[164]++;
    return null;
  }
  _$jscoverage['/word-filter.js'].lineData[168]++;
  function addStyle(elem, name, value, isPrepend) {
    _$jscoverage['/word-filter.js'].functionData[10]++;
    _$jscoverage['/word-filter.js'].lineData[169]++;
    var styleText, addingStyleText = '', style;
    _$jscoverage['/word-filter.js'].lineData[171]++;
    if (visit22_171_1(typeof value === 'string')) {
      _$jscoverage['/word-filter.js'].lineData[172]++;
      addingStyleText += name + ':' + value + ';';
    } else {
      _$jscoverage['/word-filter.js'].lineData[175]++;
      if (visit23_175_1(typeof name === 'object')) {
        _$jscoverage['/word-filter.js'].lineData[176]++;
        for (style in name) {
          _$jscoverage['/word-filter.js'].lineData[178]++;
          addingStyleText += style + ':' + name[style] + ';';
        }
      } else {
        _$jscoverage['/word-filter.js'].lineData[184]++;
        addingStyleText += name;
      }
      _$jscoverage['/word-filter.js'].lineData[186]++;
      isPrepend = value;
    }
    _$jscoverage['/word-filter.js'].lineData[190]++;
    styleText = elem.getAttribute('style');
    _$jscoverage['/word-filter.js'].lineData[192]++;
    styleText = (isPrepend ? [addingStyleText, styleText] : [styleText, addingStyleText]).join(';');
    _$jscoverage['/word-filter.js'].lineData[196]++;
    setStyle(elem, styleText.replace(/^;|;(?=;)/, ''));
  }
  _$jscoverage['/word-filter.js'].lineData[200]++;
  function parentOf(tagName) {
    _$jscoverage['/word-filter.js'].functionData[11]++;
    _$jscoverage['/word-filter.js'].lineData[201]++;
    var result = {}, tag;
    _$jscoverage['/word-filter.js'].lineData[203]++;
    for (tag in dtd) {
      _$jscoverage['/word-filter.js'].lineData[205]++;
      if (visit24_205_1(visit25_205_2(tag.indexOf('$') === -1) && dtd[tag][tagName])) {
        _$jscoverage['/word-filter.js'].lineData[206]++;
        result[tag] = 1;
      }
    }
    _$jscoverage['/word-filter.js'].lineData[210]++;
    return result;
  }
  _$jscoverage['/word-filter.js'].lineData[213]++;
  var filters = {
  flattenList: function(element, level) {
  _$jscoverage['/word-filter.js'].functionData[12]++;
  _$jscoverage['/word-filter.js'].lineData[219]++;
  level = visit26_219_1(typeof level === 'number') ? level : 1;
  _$jscoverage['/word-filter.js'].lineData[221]++;
  var listStyleType;
  _$jscoverage['/word-filter.js'].lineData[224]++;
  switch (element.getAttribute('type')) {
    case 'a':
      _$jscoverage['/word-filter.js'].lineData[226]++;
      listStyleType = 'lower-alpha';
      _$jscoverage['/word-filter.js'].lineData[227]++;
      break;
    case '1':
      _$jscoverage['/word-filter.js'].lineData[229]++;
      listStyleType = 'decimal';
      _$jscoverage['/word-filter.js'].lineData[230]++;
      break;
  }
  _$jscoverage['/word-filter.js'].lineData[234]++;
  var children = visit27_234_1(element.childNodes || []), child;
  _$jscoverage['/word-filter.js'].lineData[237]++;
  for (var i = 0; visit28_237_1(i < children.length); i++) {
    _$jscoverage['/word-filter.js'].lineData[238]++;
    child = children[i];
    _$jscoverage['/word-filter.js'].lineData[240]++;
    if (visit29_240_1(child.nodeName in dtd.$listItem)) {
      _$jscoverage['/word-filter.js'].lineData[241]++;
      var listItemChildren = visit30_241_1(child.childNodes || []), count = listItemChildren.length, last = listItemChildren[count - 1];
      _$jscoverage['/word-filter.js'].lineData[246]++;
      if (visit31_246_1(last.nodeName in dtd.$list)) {
        _$jscoverage['/word-filter.js'].lineData[247]++;
        element.insertAfter(child);
        _$jscoverage['/word-filter.js'].lineData[249]++;
        if (visit32_249_1(!--listItemChildren.length)) {
          _$jscoverage['/word-filter.js'].lineData[250]++;
          element.removeChild(children[i--]);
        }
      }
      _$jscoverage['/word-filter.js'].lineData[254]++;
      child.setTagName('ke:li');
      _$jscoverage['/word-filter.js'].lineData[257]++;
      if (visit33_257_1(element.getAttribute('start') && !i)) {
        _$jscoverage['/word-filter.js'].lineData[258]++;
        element.setAttribute('value', element.getAttribute('start'));
      }
      _$jscoverage['/word-filter.js'].lineData[278]++;
      filters.stylesFilter([['tab-stops', null, function(val) {
  _$jscoverage['/word-filter.js'].functionData[13]++;
  _$jscoverage['/word-filter.js'].lineData[264]++;
  var margin = val.split(' ')[1].match(cssLengthRelativeUnit);
  _$jscoverage['/word-filter.js'].lineData[265]++;
  if (visit34_265_1(margin)) {
    _$jscoverage['/word-filter.js'].lineData[266]++;
    (previousListItemMargin = convertToPx(margin[0]));
  }
}], (visit35_270_1(level === 1) ? ['mso-list', null, function(val) {
  _$jscoverage['/word-filter.js'].functionData[14]++;
  _$jscoverage['/word-filter.js'].lineData[271]++;
  val = val.split(' ');
  _$jscoverage['/word-filter.js'].lineData[272]++;
  var listId = Number(val[0].match(/\d+/));
  _$jscoverage['/word-filter.js'].lineData[273]++;
  if (visit36_273_1(listId !== previousListId)) {
    _$jscoverage['/word-filter.js'].lineData[274]++;
    child.setAttribute('ke:reset', 1);
  }
  _$jscoverage['/word-filter.js'].lineData[276]++;
  previousListId = listId;
}] : null)])(child.getAttribute('style'));
      _$jscoverage['/word-filter.js'].lineData[280]++;
      child.setAttribute('ke:indent', level);
      _$jscoverage['/word-filter.js'].lineData[281]++;
      child.setAttribute('ke:listtype', element.nodeName);
      _$jscoverage['/word-filter.js'].lineData[282]++;
      child.setAttribute('ke:list-style-type', listStyleType);
    } else {
      _$jscoverage['/word-filter.js'].lineData[285]++;
      if (visit37_285_1(child.nodeName in dtd.$list)) {
        _$jscoverage['/word-filter.js'].lineData[288]++;
        arguments.callee.apply(this, [child, level + 1]);
        _$jscoverage['/word-filter.js'].lineData[289]++;
        children = children.slice(0, i).concat(child.childNodes).concat(children.slice(i + 1));
        _$jscoverage['/word-filter.js'].lineData[290]++;
        element.empty();
        _$jscoverage['/word-filter.js'].lineData[291]++;
        for (var j = 0, num = children.length; visit38_291_1(j < num); j++) {
          _$jscoverage['/word-filter.js'].lineData[292]++;
          element.appendChild(children[j]);
        }
      }
    }
  }
  _$jscoverage['/word-filter.js'].lineData[297]++;
  element.nodeName = element.tagName = null;
  _$jscoverage['/word-filter.js'].lineData[300]++;
  element.setAttribute('ke:list', 1);
}, 
  assembleList: function(element) {
  _$jscoverage['/word-filter.js'].functionData[15]++;
  _$jscoverage['/word-filter.js'].lineData[308]++;
  var children = visit39_308_1(element.childNodes || []), child, listItem, listItemIndent, lastIndent, lastListItem, list, openedLists = [], previousListStyleType, previousListType;
  _$jscoverage['/word-filter.js'].lineData[320]++;
  var bullet, listType, listStyleType, itemNumeric;
  _$jscoverage['/word-filter.js'].lineData[325]++;
  for (var i = 0; visit40_325_1(i < children.length); i++) {
    _$jscoverage['/word-filter.js'].lineData[326]++;
    child = children[i];
    _$jscoverage['/word-filter.js'].lineData[328]++;
    if (visit41_328_1('ke:li' === child.nodeName)) {
      _$jscoverage['/word-filter.js'].lineData[329]++;
      child.setTagName('li');
      _$jscoverage['/word-filter.js'].lineData[330]++;
      listItem = child;
      _$jscoverage['/word-filter.js'].lineData[332]++;
      bullet = listItem.getAttribute('ke:listsymbol');
      _$jscoverage['/word-filter.js'].lineData[333]++;
      bullet = visit42_333_1(bullet && bullet.match(/^(?:[(]?)([^\s]+?)([.)]?)$/));
      _$jscoverage['/word-filter.js'].lineData[334]++;
      listType = listStyleType = itemNumeric = null;
      _$jscoverage['/word-filter.js'].lineData[336]++;
      if (visit43_336_1(listItem.getAttribute('ke:ignored'))) {
        _$jscoverage['/word-filter.js'].lineData[337]++;
        children.splice(i--, 1);
        _$jscoverage['/word-filter.js'].lineData[338]++;
        continue;
      }
      _$jscoverage['/word-filter.js'].lineData[343]++;
      if (visit44_343_1(listItem.getAttribute('ke:reset'))) {
        _$jscoverage['/word-filter.js'].lineData[344]++;
        (list = lastIndent = lastListItem = null);
      }
      _$jscoverage['/word-filter.js'].lineData[350]++;
      listItemIndent = Number(listItem.getAttribute('ke:indent'));
      _$jscoverage['/word-filter.js'].lineData[353]++;
      if (visit45_353_1(listItemIndent !== lastIndent)) {
        _$jscoverage['/word-filter.js'].lineData[354]++;
        previousListType = previousListStyleType = null;
      }
      _$jscoverage['/word-filter.js'].lineData[358]++;
      if (visit46_358_1(!bullet)) {
        _$jscoverage['/word-filter.js'].lineData[359]++;
        listType = visit47_359_1(listItem.getAttribute('ke:listtype') || 'ol');
        _$jscoverage['/word-filter.js'].lineData[360]++;
        listStyleType = listItem.getAttribute('ke:list-style-type');
      } else {
        _$jscoverage['/word-filter.js'].lineData[365]++;
        if (visit48_365_1(previousListType && listMarkerPatterns[previousListType][previousListStyleType].test(bullet[1]))) {
          _$jscoverage['/word-filter.js'].lineData[367]++;
          listType = previousListType;
          _$jscoverage['/word-filter.js'].lineData[368]++;
          listStyleType = previousListStyleType;
        } else {
          _$jscoverage['/word-filter.js'].lineData[371]++;
          for (var type in listMarkerPatterns) {
            _$jscoverage['/word-filter.js'].lineData[373]++;
            for (var style in listMarkerPatterns[type]) {
              _$jscoverage['/word-filter.js'].lineData[375]++;
              if (visit49_375_1(listMarkerPatterns[type][style].test(bullet[1]))) {
                _$jscoverage['/word-filter.js'].lineData[378]++;
                if (visit50_378_1(visit51_378_2(type === 'ol') && (/alpha|roman/).test(style))) {
                  _$jscoverage['/word-filter.js'].lineData[379]++;
                  var num = /roman/.test(style) ? fromRoman(bullet[1]) : fromAlphabet(bullet[1]);
                  _$jscoverage['/word-filter.js'].lineData[380]++;
                  if (visit52_380_1(!itemNumeric || visit53_380_2(num < itemNumeric))) {
                    _$jscoverage['/word-filter.js'].lineData[381]++;
                    itemNumeric = num;
                    _$jscoverage['/word-filter.js'].lineData[382]++;
                    listType = type;
                    _$jscoverage['/word-filter.js'].lineData[383]++;
                    listStyleType = style;
                  }
                } else {
                  _$jscoverage['/word-filter.js'].lineData[387]++;
                  listType = type;
                  _$jscoverage['/word-filter.js'].lineData[388]++;
                  listStyleType = style;
                  _$jscoverage['/word-filter.js'].lineData[389]++;
                  break;
                }
              }
            }
          }
        }
        _$jscoverage['/word-filter.js'].lineData[399]++;
        if (visit54_399_1(!listType)) {
          _$jscoverage['/word-filter.js'].lineData[400]++;
          (listType = bullet[2] ? 'ol' : 'ul');
        }
      }
      _$jscoverage['/word-filter.js'].lineData[404]++;
      previousListType = listType;
      _$jscoverage['/word-filter.js'].lineData[405]++;
      previousListStyleType = visit55_405_1(listStyleType || (visit56_405_2(listType === 'ol') ? 'decimal' : 'disc'));
      _$jscoverage['/word-filter.js'].lineData[406]++;
      if (visit57_406_1(listStyleType && visit58_406_2(listStyleType !== (visit59_406_3(listType === 'ol') ? 'decimal' : 'disc')))) {
        _$jscoverage['/word-filter.js'].lineData[407]++;
        addStyle(listItem, 'list-style-type', listStyleType);
      }
      _$jscoverage['/word-filter.js'].lineData[411]++;
      if (visit60_411_1(visit61_411_2(listType === 'ol') && bullet)) {
        _$jscoverage['/word-filter.js'].lineData[412]++;
        switch (listStyleType) {
          case 'decimal':
            _$jscoverage['/word-filter.js'].lineData[414]++;
            itemNumeric = Number(bullet[1]);
            _$jscoverage['/word-filter.js'].lineData[415]++;
            break;
          case 'lower-roman':
          case 'upper-roman':
            _$jscoverage['/word-filter.js'].lineData[418]++;
            itemNumeric = fromRoman(bullet[1]);
            _$jscoverage['/word-filter.js'].lineData[419]++;
            break;
          case 'lower-alpha':
          case 'upper-alpha':
            _$jscoverage['/word-filter.js'].lineData[422]++;
            itemNumeric = fromAlphabet(bullet[1]);
            _$jscoverage['/word-filter.js'].lineData[423]++;
            break;
        }
        _$jscoverage['/word-filter.js'].lineData[427]++;
        listItem.setAttribute('value', itemNumeric);
      }
      _$jscoverage['/word-filter.js'].lineData[431]++;
      if (visit62_431_1(!list)) {
        _$jscoverage['/word-filter.js'].lineData[432]++;
        openedLists.push(list = new HtmlParser.Tag(listType));
        _$jscoverage['/word-filter.js'].lineData[433]++;
        list.appendChild(listItem);
        _$jscoverage['/word-filter.js'].lineData[434]++;
        element.replaceChild(list, children[i]);
      } else {
        _$jscoverage['/word-filter.js'].lineData[436]++;
        if (visit63_436_1(listItemIndent > lastIndent)) {
          _$jscoverage['/word-filter.js'].lineData[437]++;
          openedLists.push(list = new HtmlParser.Tag(listType));
          _$jscoverage['/word-filter.js'].lineData[438]++;
          list.appendChild(listItem);
          _$jscoverage['/word-filter.js'].lineData[439]++;
          lastListItem.appendChild(list);
        } else {
          _$jscoverage['/word-filter.js'].lineData[441]++;
          if (visit64_441_1(listItemIndent < lastIndent)) {
            _$jscoverage['/word-filter.js'].lineData[443]++;
            var diff = lastIndent - listItemIndent, parent;
            _$jscoverage['/word-filter.js'].lineData[445]++;
            while (visit65_445_1(diff-- && (parent = list.parentNode))) {
              _$jscoverage['/word-filter.js'].lineData[446]++;
              list = parent.parentNode;
            }
            _$jscoverage['/word-filter.js'].lineData[448]++;
            list.appendChild(listItem);
          } else {
            _$jscoverage['/word-filter.js'].lineData[451]++;
            list.appendChild(listItem);
          }
        }
        _$jscoverage['/word-filter.js'].lineData[453]++;
        children.splice(i--, 1);
      }
      _$jscoverage['/word-filter.js'].lineData[456]++;
      lastListItem = listItem;
      _$jscoverage['/word-filter.js'].lineData[457]++;
      lastIndent = listItemIndent;
    } else {
      _$jscoverage['/word-filter.js'].lineData[459]++;
      if (visit66_459_1(list && !(visit67_459_2(visit68_459_3(child.nodeType === 3) && !S.trim(child.nodeValue))))) {
        _$jscoverage['/word-filter.js'].lineData[460]++;
        list = lastIndent = lastListItem = null;
      }
    }
  }
  _$jscoverage['/word-filter.js'].lineData[464]++;
  for (i = 0; visit69_464_1(i < openedLists.length); i++) {
    _$jscoverage['/word-filter.js'].lineData[465]++;
    postProcessList(openedLists[i]);
  }
}, 
  falsyFilter: function() {
  _$jscoverage['/word-filter.js'].functionData[16]++;
  _$jscoverage['/word-filter.js'].lineData[473]++;
  return false;
}, 
  stylesFilter: function(styles, whitelist) {
  _$jscoverage['/word-filter.js'].functionData[17]++;
  _$jscoverage['/word-filter.js'].lineData[484]++;
  return function(styleText, element) {
  _$jscoverage['/word-filter.js'].functionData[18]++;
  _$jscoverage['/word-filter.js'].lineData[485]++;
  var rules = [];
  _$jscoverage['/word-filter.js'].lineData[489]++;
  (visit70_489_1(styleText || '')).replace(/&quot;/g, '"').replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g, function(match, name, value) {
  _$jscoverage['/word-filter.js'].functionData[19]++;
  _$jscoverage['/word-filter.js'].lineData[493]++;
  name = name.toLowerCase();
  _$jscoverage['/word-filter.js'].lineData[494]++;
  if (visit71_494_1(name === 'font-family')) {
    _$jscoverage['/word-filter.js'].lineData[495]++;
    (value = value.replace(/['']/g, ''));
  }
  _$jscoverage['/word-filter.js'].lineData[498]++;
  var namePattern, valuePattern, newValue, newName;
  _$jscoverage['/word-filter.js'].lineData[502]++;
  for (var i = 0; visit72_502_1(i < styles.length); i++) {
    _$jscoverage['/word-filter.js'].lineData[503]++;
    if (visit73_503_1(styles[i])) {
      _$jscoverage['/word-filter.js'].lineData[504]++;
      namePattern = styles[i][0];
      _$jscoverage['/word-filter.js'].lineData[505]++;
      valuePattern = styles[i][1];
      _$jscoverage['/word-filter.js'].lineData[506]++;
      newValue = styles[i][2];
      _$jscoverage['/word-filter.js'].lineData[507]++;
      newName = styles[i][3];
      _$jscoverage['/word-filter.js'].lineData[509]++;
      if (visit74_509_1(name.match(namePattern) && (visit75_509_2(!valuePattern || value.match(valuePattern))))) {
        _$jscoverage['/word-filter.js'].lineData[510]++;
        name = visit76_510_1(newName || name);
        _$jscoverage['/word-filter.js'].lineData[511]++;
        if (visit77_511_1(whitelist)) {
          _$jscoverage['/word-filter.js'].lineData[512]++;
          (newValue = visit78_512_1(newValue || value));
        }
        _$jscoverage['/word-filter.js'].lineData[515]++;
        if (visit79_515_1(typeof newValue === 'function')) {
          _$jscoverage['/word-filter.js'].lineData[516]++;
          newValue = newValue(value, element, name);
        }
        _$jscoverage['/word-filter.js'].lineData[521]++;
        if (visit80_521_1(newValue && newValue.push)) {
          _$jscoverage['/word-filter.js'].lineData[522]++;
          name = newValue[0];
          _$jscoverage['/word-filter.js'].lineData[523]++;
          newValue = newValue[1];
        }
        _$jscoverage['/word-filter.js'].lineData[526]++;
        if (visit81_526_1(typeof newValue === 'string')) {
          _$jscoverage['/word-filter.js'].lineData[527]++;
          rules.push([name, newValue]);
        }
        _$jscoverage['/word-filter.js'].lineData[530]++;
        return;
      }
    }
  }
  _$jscoverage['/word-filter.js'].lineData[535]++;
  if (visit82_535_1(!whitelist)) {
    _$jscoverage['/word-filter.js'].lineData[536]++;
    rules.push([name, value]);
  }
});
  _$jscoverage['/word-filter.js'].lineData[541]++;
  for (var i = 0; visit83_541_1(i < rules.length); i++) {
    _$jscoverage['/word-filter.js'].lineData[542]++;
    rules[i] = rules[i].join(':');
  }
  _$jscoverage['/word-filter.js'].lineData[545]++;
  return rules.length ? (rules.join(';') + ';') : false;
};
}, 
  applyStyleFilter: null};
  _$jscoverage['/word-filter.js'].lineData[560]++;
  function postProcessList(list) {
    _$jscoverage['/word-filter.js'].functionData[20]++;
    _$jscoverage['/word-filter.js'].lineData[561]++;
    var children = visit84_561_1(list.childNodes || []), child, count = children.length, match, mergeStyle, styleTypeRegexp = /list-style-type:(.*?)(?:;|$)/, stylesFilter = filters.stylesFilter;
    _$jscoverage['/word-filter.js'].lineData[570]++;
    if (visit85_570_1(styleTypeRegexp.exec(list.getAttribute('style')))) {
      _$jscoverage['/word-filter.js'].lineData[571]++;
      return;
    }
    _$jscoverage['/word-filter.js'].lineData[574]++;
    for (var i = 0; visit86_574_1(i < count); i++) {
      _$jscoverage['/word-filter.js'].lineData[575]++;
      child = children[i];
      _$jscoverage['/word-filter.js'].lineData[577]++;
      if (visit87_577_1(child.getAttribute('value') && visit88_577_2(Number(child.getAttribute('value')) === i + 1))) {
        _$jscoverage['/word-filter.js'].lineData[578]++;
        child.removeAttribute('value');
      }
      _$jscoverage['/word-filter.js'].lineData[581]++;
      match = styleTypeRegexp.exec(child.getAttribute('style'));
      _$jscoverage['/word-filter.js'].lineData[583]++;
      if (visit89_583_1(match)) {
        _$jscoverage['/word-filter.js'].lineData[584]++;
        if (visit90_584_1(visit91_584_2(match[1] === mergeStyle) || !mergeStyle)) {
          _$jscoverage['/word-filter.js'].lineData[585]++;
          mergeStyle = match[1];
        } else {
          _$jscoverage['/word-filter.js'].lineData[588]++;
          mergeStyle = null;
          _$jscoverage['/word-filter.js'].lineData[589]++;
          break;
        }
      }
    }
    _$jscoverage['/word-filter.js'].lineData[594]++;
    if (visit92_594_1(mergeStyle)) {
      _$jscoverage['/word-filter.js'].lineData[595]++;
      for (i = 0; visit93_595_1(i < count); i++) {
        _$jscoverage['/word-filter.js'].lineData[596]++;
        var style = children[i].getAttribute('style');
        _$jscoverage['/word-filter.js'].lineData[598]++;
        if (visit94_598_1(style)) {
          _$jscoverage['/word-filter.js'].lineData[599]++;
          style = stylesFilter([['list-style-type']])(style);
          _$jscoverage['/word-filter.js'].lineData[602]++;
          setStyle(children[i], style);
        }
      }
      _$jscoverage['/word-filter.js'].lineData[605]++;
      addStyle(list, 'list-style-type', mergeStyle);
    }
  }
  _$jscoverage['/word-filter.js'].lineData[609]++;
  var utils = {
  createListBulletMarker: function(bullet, bulletText) {
  _$jscoverage['/word-filter.js'].functionData[21]++;
  _$jscoverage['/word-filter.js'].lineData[612]++;
  var marker = new HtmlParser.Tag('ke:listbullet');
  _$jscoverage['/word-filter.js'].lineData[613]++;
  marker.setAttribute('ke:listsymbol', bullet[0]);
  _$jscoverage['/word-filter.js'].lineData[614]++;
  marker.appendChild(new HtmlParser.Text(bulletText));
  _$jscoverage['/word-filter.js'].lineData[615]++;
  return marker;
}, 
  isListBulletIndicator: function(element) {
  _$jscoverage['/word-filter.js'].functionData[22]++;
  _$jscoverage['/word-filter.js'].lineData[619]++;
  var styleText = element.getAttribute('style');
  _$jscoverage['/word-filter.js'].lineData[620]++;
  if (visit95_620_1(/mso-list\s*:\s*Ignore/i.test(styleText))) {
    _$jscoverage['/word-filter.js'].lineData[621]++;
    return true;
  }
}, 
  isContainingOnlySpaces: function(element) {
  _$jscoverage['/word-filter.js'].functionData[23]++;
  _$jscoverage['/word-filter.js'].lineData[626]++;
  var text;
  _$jscoverage['/word-filter.js'].lineData[627]++;
  return (visit96_627_1((text = onlyChild(element)) && (/^(:?\s|&nbsp;)+$/).test(text.nodeValue)));
}, 
  resolveList: function(element) {
  _$jscoverage['/word-filter.js'].functionData[24]++;
  _$jscoverage['/word-filter.js'].lineData[632]++;
  var listMarker;
  _$jscoverage['/word-filter.js'].lineData[634]++;
  if (visit97_634_1((listMarker = removeAnyChildWithName(element, 'ke:listbullet')) && visit98_635_1(listMarker.length && (listMarker = listMarker[0])))) {
    _$jscoverage['/word-filter.js'].lineData[636]++;
    element.setTagName('ke:li');
    _$jscoverage['/word-filter.js'].lineData[638]++;
    if (visit99_638_1(element.getAttribute('style'))) {
      _$jscoverage['/word-filter.js'].lineData[639]++;
      var styleStr = filters.stylesFilter([['text-indent'], ['line-height'], [(/^margin(:?-left)?$/), null, function(margin) {
  _$jscoverage['/word-filter.js'].functionData[25]++;
  _$jscoverage['/word-filter.js'].lineData[647]++;
  var values = margin.split(' ');
  _$jscoverage['/word-filter.js'].lineData[648]++;
  margin = convertToPx(visit100_648_1(values[3] || visit101_648_2(values[1] || values[0])));
  _$jscoverage['/word-filter.js'].lineData[651]++;
  if (visit102_651_1(!listBaseIndent && visit103_651_2(visit104_651_3(previousListItemMargin !== null) && visit105_652_1(margin > previousListItemMargin)))) {
    _$jscoverage['/word-filter.js'].lineData[653]++;
    listBaseIndent = margin - previousListItemMargin;
  }
  _$jscoverage['/word-filter.js'].lineData[656]++;
  previousListItemMargin = margin;
  _$jscoverage['/word-filter.js'].lineData[657]++;
  if (visit106_657_1(listBaseIndent)) {
    _$jscoverage['/word-filter.js'].lineData[658]++;
    element.setAttribute('ke:indent', visit107_658_1(visit108_658_2(listBaseIndent && (Math.ceil(margin / listBaseIndent) + 1)) || 1));
  }
}], [(/^mso-list$/), null, function(val) {
  _$jscoverage['/word-filter.js'].functionData[26]++;
  _$jscoverage['/word-filter.js'].lineData[664]++;
  val = val.split(' ');
  _$jscoverage['/word-filter.js'].lineData[665]++;
  var listId = Number(val[0].match(/\d+/)), indent = Number(val[1].match(/\d+/));
  _$jscoverage['/word-filter.js'].lineData[668]++;
  if (visit109_668_1(indent === 1)) {
    _$jscoverage['/word-filter.js'].lineData[669]++;
    if (visit110_669_1(listId !== previousListId)) {
      _$jscoverage['/word-filter.js'].lineData[670]++;
      (element.setAttribute('ke:reset', 1));
    }
    _$jscoverage['/word-filter.js'].lineData[673]++;
    previousListId = listId;
  }
  _$jscoverage['/word-filter.js'].lineData[675]++;
  element.setAttribute('ke:indent', indent);
}]])(element.getAttribute('style'), element);
      _$jscoverage['/word-filter.js'].lineData[679]++;
      setStyle(element, styleStr);
    }
    _$jscoverage['/word-filter.js'].lineData[684]++;
    if (visit111_684_1(!element.getAttribute('ke:indent'))) {
      _$jscoverage['/word-filter.js'].lineData[685]++;
      previousListItemMargin = 0;
      _$jscoverage['/word-filter.js'].lineData[686]++;
      element.setAttribute('ke:indent', 1);
    }
    _$jscoverage['/word-filter.js'].lineData[689]++;
    S.each(listMarker.attributes, function(a) {
  _$jscoverage['/word-filter.js'].functionData[27]++;
  _$jscoverage['/word-filter.js'].lineData[690]++;
  element.setAttribute(a.name, a.value);
});
    _$jscoverage['/word-filter.js'].lineData[693]++;
    return true;
  } else {
    _$jscoverage['/word-filter.js'].lineData[697]++;
    previousListId = previousListItemMargin = listBaseIndent = null;
  }
  _$jscoverage['/word-filter.js'].lineData[699]++;
  return false;
}, 
  getStyleComponents: (function() {
  _$jscoverage['/word-filter.js'].functionData[28]++;
  _$jscoverage['/word-filter.js'].lineData[704]++;
  var calculator = $('<div style="position:absolute;left:-9999px;top:-9999px;"></div>').prependTo('body');
  _$jscoverage['/word-filter.js'].lineData[707]++;
  return function(name, styleValue, fetchList) {
  _$jscoverage['/word-filter.js'].functionData[29]++;
  _$jscoverage['/word-filter.js'].lineData[708]++;
  calculator.css(name, styleValue);
  _$jscoverage['/word-filter.js'].lineData[709]++;
  var styles = {}, count = fetchList.length;
  _$jscoverage['/word-filter.js'].lineData[711]++;
  for (var i = 0; visit112_711_1(i < count); i++) {
    _$jscoverage['/word-filter.js'].lineData[712]++;
    styles[fetchList[i]] = calculator.css(fetchList[i]);
  }
  _$jscoverage['/word-filter.js'].lineData[715]++;
  return styles;
};
})(), 
  listDtdParents: parentOf('ol')};
  _$jscoverage['/word-filter.js'].lineData[722]++;
  (function() {
  _$jscoverage['/word-filter.js'].functionData[30]++;
  _$jscoverage['/word-filter.js'].lineData[723]++;
  var blockLike = S.merge(dtd.$block, dtd.$listItem, dtd.$tableContent), falsyFilter = filters.falsyFilter, stylesFilter = filters.stylesFilter, createListBulletMarker = utils.createListBulletMarker, flattenList = filters.flattenList, assembleList = filters.assembleList, isListBulletIndicator = utils.isListBulletIndicator, containsNothingButSpaces = utils.isContainingOnlySpaces, resolveListItem = utils.resolveList, convertToPxStr = function(value) {
  _$jscoverage['/word-filter.js'].functionData[31]++;
  _$jscoverage['/word-filter.js'].lineData[733]++;
  value = convertToPx(value);
  _$jscoverage['/word-filter.js'].lineData[734]++;
  return isNaN(value) ? value : value + 'px';
}, getStyleComponents = utils.getStyleComponents, listDtdParents = utils.listDtdParents;
  _$jscoverage['/word-filter.js'].lineData[739]++;
  wordFilter.addRules({
  tagNames: [[(/meta|link|script/), '']], 
  root: function(element) {
  _$jscoverage['/word-filter.js'].functionData[32]++;
  _$jscoverage['/word-filter.js'].lineData[747]++;
  element.filterChildren();
  _$jscoverage['/word-filter.js'].lineData[748]++;
  assembleList(element);
}, 
  tags: {
  '^': function(element) {
  _$jscoverage['/word-filter.js'].functionData[33]++;
  _$jscoverage['/word-filter.js'].lineData[754]++;
  var applyStyleFilter;
  _$jscoverage['/word-filter.js'].lineData[755]++;
  if (visit113_755_1(UA.gecko && (applyStyleFilter = filters.applyStyleFilter))) {
    _$jscoverage['/word-filter.js'].lineData[756]++;
    applyStyleFilter(element);
  }
}, 
  $: function(element) {
  _$jscoverage['/word-filter.js'].functionData[34]++;
  _$jscoverage['/word-filter.js'].lineData[761]++;
  var tagName = visit114_761_1(element.nodeName || '');
  _$jscoverage['/word-filter.js'].lineData[765]++;
  if (visit115_765_1(tagName in blockLike && element.getAttribute('style'))) {
    _$jscoverage['/word-filter.js'].lineData[766]++;
    setStyle(element, stylesFilter([[(/^(:?width|height)$/), null, convertToPxStr]])(element.getAttribute('style')));
  }
  _$jscoverage['/word-filter.js'].lineData[773]++;
  if (visit116_773_1(tagName.match(/h\d/))) {
    _$jscoverage['/word-filter.js'].lineData[774]++;
    element.filterChildren();
    _$jscoverage['/word-filter.js'].lineData[776]++;
    if (visit117_776_1(resolveListItem(element))) {
      _$jscoverage['/word-filter.js'].lineData[777]++;
      return;
    }
  } else {
    _$jscoverage['/word-filter.js'].lineData[781]++;
    if (visit118_781_1(tagName in dtd.$inline)) {
      _$jscoverage['/word-filter.js'].lineData[782]++;
      element.filterChildren();
      _$jscoverage['/word-filter.js'].lineData[783]++;
      if (visit119_783_1(containsNothingButSpaces(element))) {
        _$jscoverage['/word-filter.js'].lineData[784]++;
        element.setTagName(null);
      }
    } else {
      _$jscoverage['/word-filter.js'].lineData[789]++;
      if (visit120_789_1(visit121_789_2(tagName.indexOf(':') !== -1) && visit122_789_3(tagName.indexOf('ke') === -1))) {
        _$jscoverage['/word-filter.js'].lineData[790]++;
        element.filterChildren();
        _$jscoverage['/word-filter.js'].lineData[793]++;
        if (visit123_793_1(tagName === 'v:imagedata')) {
          _$jscoverage['/word-filter.js'].lineData[794]++;
          var href = element.getAttribute('o:href');
          _$jscoverage['/word-filter.js'].lineData[795]++;
          if (visit124_795_1(href)) {
            _$jscoverage['/word-filter.js'].lineData[796]++;
            element.setAttribute('src', href);
          }
          _$jscoverage['/word-filter.js'].lineData[798]++;
          element.setTagName('img');
          _$jscoverage['/word-filter.js'].lineData[799]++;
          return;
        }
        _$jscoverage['/word-filter.js'].lineData[801]++;
        element.setTagName(null);
      }
    }
  }
  _$jscoverage['/word-filter.js'].lineData[805]++;
  if (visit125_805_1(tagName in listDtdParents)) {
    _$jscoverage['/word-filter.js'].lineData[806]++;
    element.filterChildren();
    _$jscoverage['/word-filter.js'].lineData[807]++;
    assembleList(element);
  }
}, 
  'style': function(element) {
  _$jscoverage['/word-filter.js'].functionData[35]++;
  _$jscoverage['/word-filter.js'].lineData[815]++;
  if (visit126_815_1(UA.gecko)) {
    _$jscoverage['/word-filter.js'].lineData[817]++;
    var styleDefSection = onlyChild(element).nodeValue.match(/\/\* Style Definitions \*\/([\s\S]*?)\/\*/), styleDefText = visit127_819_1(styleDefSection && styleDefSection[1]), rules = {};
    _$jscoverage['/word-filter.js'].lineData[822]++;
    if (visit128_822_1(styleDefText)) {
      _$jscoverage['/word-filter.js'].lineData[827]++;
      styleDefText.replace(/[\n\r]/g, '').replace(/(.+?)\{(.+?)\}/g, function(rule, selectors, styleBlock) {
  _$jscoverage['/word-filter.js'].functionData[36]++;
  _$jscoverage['/word-filter.js'].lineData[829]++;
  selectors = selectors.split(',');
  _$jscoverage['/word-filter.js'].lineData[830]++;
  var length = selectors.length;
  _$jscoverage['/word-filter.js'].lineData[831]++;
  for (var i = 0; visit129_831_1(i < length); i++) {
    _$jscoverage['/word-filter.js'].lineData[835]++;
    S.trim(selectors[i]).replace(/^(\w+)(\.[\w-]+)?$/g, function(match, tagName, className) {
  _$jscoverage['/word-filter.js'].functionData[37]++;
  _$jscoverage['/word-filter.js'].lineData[837]++;
  tagName = visit130_837_1(tagName || '*');
  _$jscoverage['/word-filter.js'].lineData[838]++;
  className = className.substring(1, className.length);
  _$jscoverage['/word-filter.js'].lineData[841]++;
  if (visit131_841_1(className.match(/MsoNormal/))) {
    _$jscoverage['/word-filter.js'].lineData[842]++;
    return;
  }
  _$jscoverage['/word-filter.js'].lineData[845]++;
  if (visit132_845_1(!rules[tagName])) {
    _$jscoverage['/word-filter.js'].lineData[846]++;
    rules[tagName] = {};
  }
  _$jscoverage['/word-filter.js'].lineData[848]++;
  if (visit133_848_1(className)) {
    _$jscoverage['/word-filter.js'].lineData[849]++;
    rules[tagName][className] = styleBlock;
  } else {
    _$jscoverage['/word-filter.js'].lineData[851]++;
    rules[tagName] = styleBlock;
  }
});
  }
});
      _$jscoverage['/word-filter.js'].lineData[857]++;
      filters.applyStyleFilter = function(element) {
  _$jscoverage['/word-filter.js'].functionData[38]++;
  _$jscoverage['/word-filter.js'].lineData[858]++;
  var name = rules['*'] ? '*' : element.nodeName, className = element.getAttribute('class'), style;
  _$jscoverage['/word-filter.js'].lineData[861]++;
  if (visit134_861_1(name in rules)) {
    _$jscoverage['/word-filter.js'].lineData[862]++;
    style = rules[name];
    _$jscoverage['/word-filter.js'].lineData[863]++;
    if (visit135_863_1(typeof style === 'object')) {
      _$jscoverage['/word-filter.js'].lineData[864]++;
      style = style[className];
    }
    _$jscoverage['/word-filter.js'].lineData[867]++;
    if (visit136_867_1(style)) {
      _$jscoverage['/word-filter.js'].lineData[868]++;
      addStyle(element, style, true);
    }
  }
};
    }
  }
  _$jscoverage['/word-filter.js'].lineData[874]++;
  return false;
}, 
  'p': function(element) {
  _$jscoverage['/word-filter.js'].functionData[39]++;
  _$jscoverage['/word-filter.js'].lineData[881]++;
  if (visit137_881_1(/MsoListParagraph/.exec(element.getAttribute('class')))) {
    _$jscoverage['/word-filter.js'].lineData[882]++;
    var bulletText = firstChild(element, function(node) {
  _$jscoverage['/word-filter.js'].functionData[40]++;
  _$jscoverage['/word-filter.js'].lineData[883]++;
  return visit138_883_1(visit139_883_2(node.nodeType === 3) && !containsNothingButSpaces(node.parentNode));
});
    _$jscoverage['/word-filter.js'].lineData[885]++;
    var bullet = visit140_885_1(bulletText && bulletText.parentNode);
    _$jscoverage['/word-filter.js'].lineData[886]++;
    if (visit141_886_1(bullet && !bullet.getAttribute('style'))) {
      _$jscoverage['/word-filter.js'].lineData[887]++;
      (bullet.setAttribute('style', 'mso-list: Ignore;'));
    }
  }
  _$jscoverage['/word-filter.js'].lineData[891]++;
  element.filterChildren();
  _$jscoverage['/word-filter.js'].lineData[893]++;
  resolveListItem(element);
}, 
  'div': function(element) {
  _$jscoverage['/word-filter.js'].functionData[41]++;
  _$jscoverage['/word-filter.js'].lineData[900]++;
  var singleChild = onlyChild(element);
  _$jscoverage['/word-filter.js'].lineData[901]++;
  if (visit142_901_1(singleChild && visit143_901_2(singleChild.nodeName === 'table'))) {
    _$jscoverage['/word-filter.js'].lineData[902]++;
    var attrs = element.attributes;
    _$jscoverage['/word-filter.js'].lineData[904]++;
    S.each(attrs, function(attr) {
  _$jscoverage['/word-filter.js'].functionData[42]++;
  _$jscoverage['/word-filter.js'].lineData[905]++;
  singleChild.setAttribute(attr.name, attr.value);
});
    _$jscoverage['/word-filter.js'].lineData[908]++;
    if (visit144_908_1(element.getAttribute('style'))) {
      _$jscoverage['/word-filter.js'].lineData[909]++;
      addStyle(singleChild, element.getAttribute('style'));
    }
    _$jscoverage['/word-filter.js'].lineData[912]++;
    var clearFloatDiv = new HtmlParser.Tag('div');
    _$jscoverage['/word-filter.js'].lineData[913]++;
    addStyle(clearFloatDiv, 'clear', 'both');
    _$jscoverage['/word-filter.js'].lineData[914]++;
    element.appendChild(clearFloatDiv);
    _$jscoverage['/word-filter.js'].lineData[915]++;
    element.setTagName(null);
  }
}, 
  'td': function(element) {
  _$jscoverage['/word-filter.js'].functionData[43]++;
  _$jscoverage['/word-filter.js'].lineData[921]++;
  if (visit145_921_1(getAncestor(element, 'thead'))) {
    _$jscoverage['/word-filter.js'].lineData[922]++;
    element.setTagName('th');
  }
}, 
  'ol': flattenList, 
  'ul': flattenList, 
  'dl': flattenList, 
  'font': function(element) {
  _$jscoverage['/word-filter.js'].functionData[44]++;
  _$jscoverage['/word-filter.js'].lineData[934]++;
  if (visit146_934_1(isListBulletIndicator(element.parentNode))) {
    _$jscoverage['/word-filter.js'].lineData[935]++;
    element.setTagName(null);
    _$jscoverage['/word-filter.js'].lineData[936]++;
    return;
  }
  _$jscoverage['/word-filter.js'].lineData[939]++;
  element.filterChildren();
  _$jscoverage['/word-filter.js'].lineData[941]++;
  var styleText = element.getAttribute('style'), parent = element.parentNode;
  _$jscoverage['/word-filter.js'].lineData[944]++;
  if (visit147_944_1('font' === parent.name)) {
    _$jscoverage['/word-filter.js'].lineData[946]++;
    S.each(element.attributes, function(attr) {
  _$jscoverage['/word-filter.js'].functionData[45]++;
  _$jscoverage['/word-filter.js'].lineData[947]++;
  parent.setAttribute(attr.name, attr.value);
});
    _$jscoverage['/word-filter.js'].lineData[949]++;
    if (visit148_949_1(styleText)) {
      _$jscoverage['/word-filter.js'].lineData[950]++;
      addStyle(parent, styleText);
    }
    _$jscoverage['/word-filter.js'].lineData[952]++;
    element.setTagName(null);
  } else {
    _$jscoverage['/word-filter.js'].lineData[956]++;
    styleText = visit149_956_1(styleText || '');
    _$jscoverage['/word-filter.js'].lineData[958]++;
    if (visit150_958_1(element.getAttribute('color'))) {
      _$jscoverage['/word-filter.js'].lineData[959]++;
      if (visit151_959_1(element.getAttribute('color') !== '#000000')) {
        _$jscoverage['/word-filter.js'].lineData[960]++;
        styleText += 'color:' + element.getAttribute('color') + ';';
      }
      _$jscoverage['/word-filter.js'].lineData[962]++;
      element.removeAttribute('color');
    }
    _$jscoverage['/word-filter.js'].lineData[964]++;
    if (visit152_964_1(element.getAttribute('face'))) {
      _$jscoverage['/word-filter.js'].lineData[965]++;
      styleText += 'font-family:' + element.getAttribute('face') + ';';
      _$jscoverage['/word-filter.js'].lineData[966]++;
      element.removeAttribute('face');
    }
    _$jscoverage['/word-filter.js'].lineData[968]++;
    var size = element.getAttribute('size');
    _$jscoverage['/word-filter.js'].lineData[971]++;
    if (visit153_971_1(size)) {
      _$jscoverage['/word-filter.js'].lineData[972]++;
      styleText += 'font-size:' + (visit154_973_1(size > 3) ? 'large' : (visit155_974_1(size < 3) ? 'small' : 'medium')) + ';';
      _$jscoverage['/word-filter.js'].lineData[975]++;
      element.removeAttribute('size');
    }
    _$jscoverage['/word-filter.js'].lineData[977]++;
    element.setTagName('span');
    _$jscoverage['/word-filter.js'].lineData[978]++;
    addStyle(element, styleText);
  }
}, 
  'span': function(element) {
  _$jscoverage['/word-filter.js'].functionData[46]++;
  _$jscoverage['/word-filter.js'].lineData[984]++;
  if (visit156_984_1(isListBulletIndicator(element.parentNode))) {
    _$jscoverage['/word-filter.js'].lineData[985]++;
    return false;
  }
  _$jscoverage['/word-filter.js'].lineData[987]++;
  element.filterChildren();
  _$jscoverage['/word-filter.js'].lineData[988]++;
  if (visit157_988_1(containsNothingButSpaces(element))) {
    _$jscoverage['/word-filter.js'].lineData[989]++;
    element.setTagName(null);
    _$jscoverage['/word-filter.js'].lineData[990]++;
    return null;
  }
  _$jscoverage['/word-filter.js'].lineData[995]++;
  if (visit158_995_1(isListBulletIndicator(element))) {
    _$jscoverage['/word-filter.js'].lineData[996]++;
    var listSymbolNode = firstChild(element, function(node) {
  _$jscoverage['/word-filter.js'].functionData[47]++;
  _$jscoverage['/word-filter.js'].lineData[997]++;
  return visit159_997_1(node.nodeValue || visit160_997_2(node.nodeName === 'img'));
});
    _$jscoverage['/word-filter.js'].lineData[1000]++;
    var listSymbol = visit161_1000_1(listSymbolNode && (visit162_1000_2(listSymbolNode.nodeValue || 'l.'))), listType = visit163_1001_1(listSymbol && listSymbol.match(/^(?:[(]?)([^\s]+?)([.)]?)$/));
    _$jscoverage['/word-filter.js'].lineData[1003]++;
    if (visit164_1003_1(listType)) {
      _$jscoverage['/word-filter.js'].lineData[1004]++;
      var marker = createListBulletMarker(listType, listSymbol);
      _$jscoverage['/word-filter.js'].lineData[1008]++;
      var ancestor = getAncestor(element, 'span');
      _$jscoverage['/word-filter.js'].lineData[1009]++;
      if (visit165_1009_1(ancestor && (/ mso-hide:\s*all|display:\s*none /).test(ancestor.getAttribute('style')))) {
        _$jscoverage['/word-filter.js'].lineData[1011]++;
        marker.setAttribute('ke:ignored', 1);
      }
      _$jscoverage['/word-filter.js'].lineData[1013]++;
      return marker;
    }
  }
  _$jscoverage['/word-filter.js'].lineData[1018]++;
  var styleText = element.getAttribute('style');
  _$jscoverage['/word-filter.js'].lineData[1022]++;
  if (visit166_1022_1(styleText)) {
    _$jscoverage['/word-filter.js'].lineData[1024]++;
    setStyle(element, stylesFilter([[/^line-height$/], [/^font-family$/], [/^font-size$/], [/^color$/], [/^background-color$/]])(styleText, element));
  }
}, 
  'a': function(element) {
  _$jscoverage['/word-filter.js'].functionData[48]++;
  _$jscoverage['/word-filter.js'].lineData[1039]++;
  var href;
  _$jscoverage['/word-filter.js'].lineData[1040]++;
  if (visit167_1040_1(!(href = element.getAttribute('href')) && element.getAttribute('name'))) {
    _$jscoverage['/word-filter.js'].lineData[1041]++;
    element.setTagName(null);
  } else {
    _$jscoverage['/word-filter.js'].lineData[1042]++;
    if (visit168_1042_1(UA.webkit && visit169_1042_2(href && href.match(/file:\/\/\/[\S]+#/i)))) {
      _$jscoverage['/word-filter.js'].lineData[1043]++;
      element.setAttribute('href', href.replace(/file:\/\/\/[^#]+/i, ''));
    }
  }
}, 
  'ke:listbullet': function(element) {
  _$jscoverage['/word-filter.js'].functionData[49]++;
  _$jscoverage['/word-filter.js'].lineData[1047]++;
  if (visit170_1047_1(getAncestor(element, /h\d/))) {
    _$jscoverage['/word-filter.js'].lineData[1048]++;
    element.setTagName(null);
  }
}}, 
  attributeNames: [[(/^onmouse(:?out|over)/), ''], [(/^onload$/), ''], [(/(?:v|o):\w+/), ''], [(/^lang/), '']], 
  attributes: {
  'style': stylesFilter([[(/^list-style-type$/)], [(/^margin$|^margin-(?!bottom|top)/), null, function(value, element, name) {
  _$jscoverage['/word-filter.js'].functionData[50]++;
  _$jscoverage['/word-filter.js'].lineData[1072]++;
  if (visit171_1072_1(element.nodeName in {
  p: 1, 
  div: 1})) {
    _$jscoverage['/word-filter.js'].lineData[1073]++;
    var indentStyleName = 'margin-left';
    _$jscoverage['/word-filter.js'].lineData[1076]++;
    if (visit172_1076_1(name === 'margin')) {
      _$jscoverage['/word-filter.js'].lineData[1077]++;
      value = getStyleComponents(name, value, [indentStyleName])[indentStyleName];
    } else {
      _$jscoverage['/word-filter.js'].lineData[1079]++;
      if (visit173_1079_1(name !== indentStyleName)) {
        _$jscoverage['/word-filter.js'].lineData[1080]++;
        return null;
      }
    }
    _$jscoverage['/word-filter.js'].lineData[1083]++;
    if (visit174_1083_1(value && !emptyMarginRegex.test(value))) {
      _$jscoverage['/word-filter.js'].lineData[1084]++;
      return [indentStyleName, value];
    }
  }
  _$jscoverage['/word-filter.js'].lineData[1088]++;
  return null;
}], [(/^clear$/)], [(/^border.*|margin.*|vertical-align|float$/), null, function(value, element) {
  _$jscoverage['/word-filter.js'].functionData[51]++;
  _$jscoverage['/word-filter.js'].lineData[1096]++;
  if (visit175_1096_1(element.nodeName === 'img')) {
    _$jscoverage['/word-filter.js'].lineData[1097]++;
    return value;
  }
}], [(/^width|height$/), null, function(value, element) {
  _$jscoverage['/word-filter.js'].functionData[52]++;
  _$jscoverage['/word-filter.js'].lineData[1103]++;
  if (visit176_1103_1(element.nodeName in {
  table: 1, 
  td: 1, 
  th: 1, 
  img: 1})) {
    _$jscoverage['/word-filter.js'].lineData[1104]++;
    return value;
  }
}]], 1), 
  'width': function(value, element) {
  _$jscoverage['/word-filter.js'].functionData[53]++;
  _$jscoverage['/word-filter.js'].lineData[1112]++;
  if (visit177_1112_1(element.nodeName in dtd.$tableContent)) {
    _$jscoverage['/word-filter.js'].lineData[1113]++;
    return false;
  }
}, 
  'border': function(value, element) {
  _$jscoverage['/word-filter.js'].functionData[54]++;
  _$jscoverage['/word-filter.js'].lineData[1118]++;
  if (visit178_1118_1(element.nodeName in dtd.$tableContent)) {
    _$jscoverage['/word-filter.js'].lineData[1119]++;
    return false;
  }
}, 
  'class': falsyFilter, 
  'bgcolor': falsyFilter, 
  'valign': function(value, element) {
  _$jscoverage['/word-filter.js'].functionData[55]++;
  _$jscoverage['/word-filter.js'].lineData[1134]++;
  addStyle(element, 'vertical-align', value);
  _$jscoverage['/word-filter.js'].lineData[1135]++;
  return false;
}}, 
  comment: UA.ie ? function(value, node) {
  _$jscoverage['/word-filter.js'].functionData[56]++;
  _$jscoverage['/word-filter.js'].lineData[1145]++;
  var imageInfo = value.match(/<img.*?>/), listInfo = value.match(/^\[if !supportLists\]([\s\S]*?)\[endif\]$/);
  _$jscoverage['/word-filter.js'].lineData[1149]++;
  if (visit179_1149_1(listInfo)) {
    _$jscoverage['/word-filter.js'].lineData[1151]++;
    var listSymbol = visit180_1151_1(listInfo[1] || (visit181_1151_2(imageInfo && 'l.'))), listType = visit182_1152_1(listSymbol && listSymbol.match(/>(?:[(]?)([^\s]+?)([.)]?)</));
    _$jscoverage['/word-filter.js'].lineData[1153]++;
    return createListBulletMarker(listType, listSymbol);
  }
  _$jscoverage['/word-filter.js'].lineData[1157]++;
  if (visit183_1157_1(UA.gecko && imageInfo)) {
    _$jscoverage['/word-filter.js'].lineData[1158]++;
    var img = new HtmlParser.Parser(imageInfo[0]).parse().childNodes[0], previousComment = node.previousSibling, imgSrcInfo = visit184_1161_1(previousComment && previousComment.toHtml().match(/<v:imagedata[^>]*o:href=[''](.*?)['']/)), imgSrc = visit185_1162_1(imgSrcInfo && imgSrcInfo[1]);
    _$jscoverage['/word-filter.js'].lineData[1165]++;
    if (visit186_1165_1(imgSrc)) {
      _$jscoverage['/word-filter.js'].lineData[1166]++;
      (img.setAttribute('src', imgSrc));
    }
    _$jscoverage['/word-filter.js'].lineData[1168]++;
    return img;
  }
  _$jscoverage['/word-filter.js'].lineData[1171]++;
  return false;
} : falsyFilter});
})();
  _$jscoverage['/word-filter.js'].lineData[1177]++;
  return {
  toDataFormat: function(html, editor) {
  _$jscoverage['/word-filter.js'].functionData[57]++;
  _$jscoverage['/word-filter.js'].lineData[1196]++;
  if (visit187_1196_1(UA.gecko)) {
    _$jscoverage['/word-filter.js'].lineData[1197]++;
    html = html.replace(/(<!--\[if[^<]*?\])-->([\S\s]*?)<!--(\[endif\]-->)/gi, '$1$2$3');
  }
  _$jscoverage['/word-filter.js'].lineData[1202]++;
  html = editor.htmlDataProcessor.toDataFormat(html, wordFilter);
  _$jscoverage['/word-filter.js'].lineData[1204]++;
  return html;
}};
});
