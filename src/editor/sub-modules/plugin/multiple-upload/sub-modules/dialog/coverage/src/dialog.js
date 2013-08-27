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
if (! _$jscoverage['/dialog.js']) {
  _$jscoverage['/dialog.js'] = {};
  _$jscoverage['/dialog.js'].lineData = [];
  _$jscoverage['/dialog.js'].lineData[5] = 0;
  _$jscoverage['/dialog.js'].lineData[10] = 0;
  _$jscoverage['/dialog.js'].lineData[23] = 0;
  _$jscoverage['/dialog.js'].lineData[24] = 0;
  _$jscoverage['/dialog.js'].lineData[25] = 0;
  _$jscoverage['/dialog.js'].lineData[26] = 0;
  _$jscoverage['/dialog.js'].lineData[27] = 0;
  _$jscoverage['/dialog.js'].lineData[30] = 0;
  _$jscoverage['/dialog.js'].lineData[31] = 0;
  _$jscoverage['/dialog.js'].lineData[37] = 0;
  _$jscoverage['/dialog.js'].lineData[39] = 0;
  _$jscoverage['/dialog.js'].lineData[41] = 0;
  _$jscoverage['/dialog.js'].lineData[42] = 0;
  _$jscoverage['/dialog.js'].lineData[44] = 0;
  _$jscoverage['/dialog.js'].lineData[46] = 0;
  _$jscoverage['/dialog.js'].lineData[49] = 0;
  _$jscoverage['/dialog.js'].lineData[53] = 0;
  _$jscoverage['/dialog.js'].lineData[58] = 0;
  _$jscoverage['/dialog.js'].lineData[59] = 0;
  _$jscoverage['/dialog.js'].lineData[60] = 0;
  _$jscoverage['/dialog.js'].lineData[62] = 0;
  _$jscoverage['/dialog.js'].lineData[67] = 0;
  _$jscoverage['/dialog.js'].lineData[78] = 0;
  _$jscoverage['/dialog.js'].lineData[83] = 0;
  _$jscoverage['/dialog.js'].lineData[84] = 0;
  _$jscoverage['/dialog.js'].lineData[85] = 0;
  _$jscoverage['/dialog.js'].lineData[86] = 0;
  _$jscoverage['/dialog.js'].lineData[90] = 0;
  _$jscoverage['/dialog.js'].lineData[92] = 0;
  _$jscoverage['/dialog.js'].lineData[158] = 0;
  _$jscoverage['/dialog.js'].lineData[159] = 0;
  _$jscoverage['/dialog.js'].lineData[161] = 0;
  _$jscoverage['/dialog.js'].lineData[167] = 0;
  _$jscoverage['/dialog.js'].lineData[168] = 0;
  _$jscoverage['/dialog.js'].lineData[173] = 0;
  _$jscoverage['/dialog.js'].lineData[174] = 0;
  _$jscoverage['/dialog.js'].lineData[175] = 0;
  _$jscoverage['/dialog.js'].lineData[176] = 0;
  _$jscoverage['/dialog.js'].lineData[177] = 0;
  _$jscoverage['/dialog.js'].lineData[179] = 0;
  _$jscoverage['/dialog.js'].lineData[180] = 0;
  _$jscoverage['/dialog.js'].lineData[183] = 0;
  _$jscoverage['/dialog.js'].lineData[184] = 0;
  _$jscoverage['/dialog.js'].lineData[185] = 0;
  _$jscoverage['/dialog.js'].lineData[186] = 0;
  _$jscoverage['/dialog.js'].lineData[187] = 0;
  _$jscoverage['/dialog.js'].lineData[188] = 0;
  _$jscoverage['/dialog.js'].lineData[189] = 0;
  _$jscoverage['/dialog.js'].lineData[190] = 0;
  _$jscoverage['/dialog.js'].lineData[191] = 0;
  _$jscoverage['/dialog.js'].lineData[194] = 0;
  _$jscoverage['/dialog.js'].lineData[206] = 0;
  _$jscoverage['/dialog.js'].lineData[207] = 0;
  _$jscoverage['/dialog.js'].lineData[208] = 0;
  _$jscoverage['/dialog.js'].lineData[235] = 0;
  _$jscoverage['/dialog.js'].lineData[237] = 0;
  _$jscoverage['/dialog.js'].lineData[238] = 0;
  _$jscoverage['/dialog.js'].lineData[240] = 0;
  _$jscoverage['/dialog.js'].lineData[241] = 0;
  _$jscoverage['/dialog.js'].lineData[243] = 0;
  _$jscoverage['/dialog.js'].lineData[245] = 0;
  _$jscoverage['/dialog.js'].lineData[247] = 0;
  _$jscoverage['/dialog.js'].lineData[248] = 0;
  _$jscoverage['/dialog.js'].lineData[249] = 0;
  _$jscoverage['/dialog.js'].lineData[250] = 0;
  _$jscoverage['/dialog.js'].lineData[252] = 0;
  _$jscoverage['/dialog.js'].lineData[254] = 0;
  _$jscoverage['/dialog.js'].lineData[255] = 0;
  _$jscoverage['/dialog.js'].lineData[257] = 0;
  _$jscoverage['/dialog.js'].lineData[260] = 0;
  _$jscoverage['/dialog.js'].lineData[261] = 0;
  _$jscoverage['/dialog.js'].lineData[262] = 0;
  _$jscoverage['/dialog.js'].lineData[264] = 0;
  _$jscoverage['/dialog.js'].lineData[266] = 0;
  _$jscoverage['/dialog.js'].lineData[268] = 0;
  _$jscoverage['/dialog.js'].lineData[269] = 0;
  _$jscoverage['/dialog.js'].lineData[270] = 0;
  _$jscoverage['/dialog.js'].lineData[271] = 0;
  _$jscoverage['/dialog.js'].lineData[272] = 0;
  _$jscoverage['/dialog.js'].lineData[274] = 0;
  _$jscoverage['/dialog.js'].lineData[275] = 0;
  _$jscoverage['/dialog.js'].lineData[277] = 0;
  _$jscoverage['/dialog.js'].lineData[279] = 0;
  _$jscoverage['/dialog.js'].lineData[280] = 0;
  _$jscoverage['/dialog.js'].lineData[281] = 0;
  _$jscoverage['/dialog.js'].lineData[282] = 0;
  _$jscoverage['/dialog.js'].lineData[283] = 0;
  _$jscoverage['/dialog.js'].lineData[284] = 0;
  _$jscoverage['/dialog.js'].lineData[285] = 0;
  _$jscoverage['/dialog.js'].lineData[286] = 0;
  _$jscoverage['/dialog.js'].lineData[289] = 0;
  _$jscoverage['/dialog.js'].lineData[295] = 0;
  _$jscoverage['/dialog.js'].lineData[296] = 0;
  _$jscoverage['/dialog.js'].lineData[302] = 0;
  _$jscoverage['/dialog.js'].lineData[303] = 0;
  _$jscoverage['/dialog.js'].lineData[304] = 0;
  _$jscoverage['/dialog.js'].lineData[305] = 0;
  _$jscoverage['/dialog.js'].lineData[308] = 0;
  _$jscoverage['/dialog.js'].lineData[311] = 0;
  _$jscoverage['/dialog.js'].lineData[312] = 0;
  _$jscoverage['/dialog.js'].lineData[313] = 0;
  _$jscoverage['/dialog.js'].lineData[314] = 0;
  _$jscoverage['/dialog.js'].lineData[317] = 0;
  _$jscoverage['/dialog.js'].lineData[318] = 0;
  _$jscoverage['/dialog.js'].lineData[319] = 0;
  _$jscoverage['/dialog.js'].lineData[320] = 0;
  _$jscoverage['/dialog.js'].lineData[323] = 0;
  _$jscoverage['/dialog.js'].lineData[325] = 0;
  _$jscoverage['/dialog.js'].lineData[326] = 0;
  _$jscoverage['/dialog.js'].lineData[327] = 0;
  _$jscoverage['/dialog.js'].lineData[328] = 0;
  _$jscoverage['/dialog.js'].lineData[331] = 0;
  _$jscoverage['/dialog.js'].lineData[334] = 0;
  _$jscoverage['/dialog.js'].lineData[336] = 0;
  _$jscoverage['/dialog.js'].lineData[337] = 0;
  _$jscoverage['/dialog.js'].lineData[338] = 0;
  _$jscoverage['/dialog.js'].lineData[339] = 0;
  _$jscoverage['/dialog.js'].lineData[340] = 0;
  _$jscoverage['/dialog.js'].lineData[341] = 0;
  _$jscoverage['/dialog.js'].lineData[344] = 0;
  _$jscoverage['/dialog.js'].lineData[345] = 0;
  _$jscoverage['/dialog.js'].lineData[346] = 0;
  _$jscoverage['/dialog.js'].lineData[349] = 0;
  _$jscoverage['/dialog.js'].lineData[353] = 0;
  _$jscoverage['/dialog.js'].lineData[354] = 0;
  _$jscoverage['/dialog.js'].lineData[355] = 0;
  _$jscoverage['/dialog.js'].lineData[357] = 0;
  _$jscoverage['/dialog.js'].lineData[363] = 0;
  _$jscoverage['/dialog.js'].lineData[364] = 0;
  _$jscoverage['/dialog.js'].lineData[365] = 0;
  _$jscoverage['/dialog.js'].lineData[367] = 0;
  _$jscoverage['/dialog.js'].lineData[368] = 0;
  _$jscoverage['/dialog.js'].lineData[369] = 0;
  _$jscoverage['/dialog.js'].lineData[371] = 0;
  _$jscoverage['/dialog.js'].lineData[372] = 0;
  _$jscoverage['/dialog.js'].lineData[373] = 0;
  _$jscoverage['/dialog.js'].lineData[375] = 0;
  _$jscoverage['/dialog.js'].lineData[377] = 0;
  _$jscoverage['/dialog.js'].lineData[378] = 0;
  _$jscoverage['/dialog.js'].lineData[380] = 0;
  _$jscoverage['/dialog.js'].lineData[381] = 0;
  _$jscoverage['/dialog.js'].lineData[382] = 0;
  _$jscoverage['/dialog.js'].lineData[384] = 0;
  _$jscoverage['/dialog.js'].lineData[389] = 0;
  _$jscoverage['/dialog.js'].lineData[390] = 0;
  _$jscoverage['/dialog.js'].lineData[391] = 0;
  _$jscoverage['/dialog.js'].lineData[392] = 0;
  _$jscoverage['/dialog.js'].lineData[395] = 0;
  _$jscoverage['/dialog.js'].lineData[398] = 0;
  _$jscoverage['/dialog.js'].lineData[403] = 0;
  _$jscoverage['/dialog.js'].lineData[404] = 0;
  _$jscoverage['/dialog.js'].lineData[408] = 0;
  _$jscoverage['/dialog.js'].lineData[412] = 0;
  _$jscoverage['/dialog.js'].lineData[413] = 0;
  _$jscoverage['/dialog.js'].lineData[414] = 0;
  _$jscoverage['/dialog.js'].lineData[418] = 0;
  _$jscoverage['/dialog.js'].lineData[419] = 0;
  _$jscoverage['/dialog.js'].lineData[420] = 0;
  _$jscoverage['/dialog.js'].lineData[422] = 0;
  _$jscoverage['/dialog.js'].lineData[423] = 0;
  _$jscoverage['/dialog.js'].lineData[424] = 0;
  _$jscoverage['/dialog.js'].lineData[428] = 0;
  _$jscoverage['/dialog.js'].lineData[429] = 0;
  _$jscoverage['/dialog.js'].lineData[432] = 0;
  _$jscoverage['/dialog.js'].lineData[435] = 0;
  _$jscoverage['/dialog.js'].lineData[440] = 0;
  _$jscoverage['/dialog.js'].lineData[441] = 0;
  _$jscoverage['/dialog.js'].lineData[442] = 0;
  _$jscoverage['/dialog.js'].lineData[444] = 0;
  _$jscoverage['/dialog.js'].lineData[448] = 0;
  _$jscoverage['/dialog.js'].lineData[449] = 0;
  _$jscoverage['/dialog.js'].lineData[450] = 0;
  _$jscoverage['/dialog.js'].lineData[451] = 0;
  _$jscoverage['/dialog.js'].lineData[453] = 0;
  _$jscoverage['/dialog.js'].lineData[454] = 0;
  _$jscoverage['/dialog.js'].lineData[455] = 0;
  _$jscoverage['/dialog.js'].lineData[456] = 0;
  _$jscoverage['/dialog.js'].lineData[463] = 0;
  _$jscoverage['/dialog.js'].lineData[466] = 0;
  _$jscoverage['/dialog.js'].lineData[467] = 0;
  _$jscoverage['/dialog.js'].lineData[468] = 0;
  _$jscoverage['/dialog.js'].lineData[469] = 0;
  _$jscoverage['/dialog.js'].lineData[474] = 0;
  _$jscoverage['/dialog.js'].lineData[476] = 0;
  _$jscoverage['/dialog.js'].lineData[477] = 0;
  _$jscoverage['/dialog.js'].lineData[478] = 0;
  _$jscoverage['/dialog.js'].lineData[481] = 0;
  _$jscoverage['/dialog.js'].lineData[489] = 0;
  _$jscoverage['/dialog.js'].lineData[490] = 0;
  _$jscoverage['/dialog.js'].lineData[491] = 0;
  _$jscoverage['/dialog.js'].lineData[496] = 0;
  _$jscoverage['/dialog.js'].lineData[497] = 0;
  _$jscoverage['/dialog.js'].lineData[498] = 0;
  _$jscoverage['/dialog.js'].lineData[500] = 0;
  _$jscoverage['/dialog.js'].lineData[501] = 0;
  _$jscoverage['/dialog.js'].lineData[502] = 0;
  _$jscoverage['/dialog.js'].lineData[504] = 0;
  _$jscoverage['/dialog.js'].lineData[505] = 0;
  _$jscoverage['/dialog.js'].lineData[510] = 0;
  _$jscoverage['/dialog.js'].lineData[512] = 0;
  _$jscoverage['/dialog.js'].lineData[513] = 0;
  _$jscoverage['/dialog.js'].lineData[514] = 0;
  _$jscoverage['/dialog.js'].lineData[515] = 0;
  _$jscoverage['/dialog.js'].lineData[518] = 0;
  _$jscoverage['/dialog.js'].lineData[522] = 0;
  _$jscoverage['/dialog.js'].lineData[526] = 0;
  _$jscoverage['/dialog.js'].lineData[530] = 0;
  _$jscoverage['/dialog.js'].lineData[531] = 0;
  _$jscoverage['/dialog.js'].lineData[532] = 0;
  _$jscoverage['/dialog.js'].lineData[533] = 0;
  _$jscoverage['/dialog.js'].lineData[534] = 0;
  _$jscoverage['/dialog.js'].lineData[540] = 0;
  _$jscoverage['/dialog.js'].lineData[541] = 0;
  _$jscoverage['/dialog.js'].lineData[542] = 0;
  _$jscoverage['/dialog.js'].lineData[543] = 0;
  _$jscoverage['/dialog.js'].lineData[544] = 0;
  _$jscoverage['/dialog.js'].lineData[547] = 0;
  _$jscoverage['/dialog.js'].lineData[551] = 0;
  _$jscoverage['/dialog.js'].lineData[552] = 0;
  _$jscoverage['/dialog.js'].lineData[553] = 0;
  _$jscoverage['/dialog.js'].lineData[555] = 0;
  _$jscoverage['/dialog.js'].lineData[556] = 0;
  _$jscoverage['/dialog.js'].lineData[558] = 0;
  _$jscoverage['/dialog.js'].lineData[559] = 0;
  _$jscoverage['/dialog.js'].lineData[560] = 0;
  _$jscoverage['/dialog.js'].lineData[561] = 0;
  _$jscoverage['/dialog.js'].lineData[563] = 0;
  _$jscoverage['/dialog.js'].lineData[568] = 0;
  _$jscoverage['/dialog.js'].lineData[572] = 0;
  _$jscoverage['/dialog.js'].lineData[575] = 0;
  _$jscoverage['/dialog.js'].lineData[576] = 0;
  _$jscoverage['/dialog.js'].lineData[577] = 0;
  _$jscoverage['/dialog.js'].lineData[578] = 0;
  _$jscoverage['/dialog.js'].lineData[579] = 0;
  _$jscoverage['/dialog.js'].lineData[580] = 0;
  _$jscoverage['/dialog.js'].lineData[581] = 0;
  _$jscoverage['/dialog.js'].lineData[582] = 0;
  _$jscoverage['/dialog.js'].lineData[584] = 0;
  _$jscoverage['/dialog.js'].lineData[585] = 0;
  _$jscoverage['/dialog.js'].lineData[586] = 0;
  _$jscoverage['/dialog.js'].lineData[590] = 0;
  _$jscoverage['/dialog.js'].lineData[591] = 0;
  _$jscoverage['/dialog.js'].lineData[592] = 0;
  _$jscoverage['/dialog.js'].lineData[593] = 0;
  _$jscoverage['/dialog.js'].lineData[596] = 0;
  _$jscoverage['/dialog.js'].lineData[600] = 0;
  _$jscoverage['/dialog.js'].lineData[601] = 0;
  _$jscoverage['/dialog.js'].lineData[602] = 0;
  _$jscoverage['/dialog.js'].lineData[604] = 0;
  _$jscoverage['/dialog.js'].lineData[605] = 0;
  _$jscoverage['/dialog.js'].lineData[607] = 0;
  _$jscoverage['/dialog.js'].lineData[615] = 0;
  _$jscoverage['/dialog.js'].lineData[619] = 0;
  _$jscoverage['/dialog.js'].lineData[620] = 0;
  _$jscoverage['/dialog.js'].lineData[622] = 0;
  _$jscoverage['/dialog.js'].lineData[624] = 0;
  _$jscoverage['/dialog.js'].lineData[654] = 0;
  _$jscoverage['/dialog.js'].lineData[659] = 0;
  _$jscoverage['/dialog.js'].lineData[660] = 0;
  _$jscoverage['/dialog.js'].lineData[661] = 0;
  _$jscoverage['/dialog.js'].lineData[662] = 0;
  _$jscoverage['/dialog.js'].lineData[663] = 0;
  _$jscoverage['/dialog.js'].lineData[664] = 0;
  _$jscoverage['/dialog.js'].lineData[665] = 0;
  _$jscoverage['/dialog.js'].lineData[667] = 0;
  _$jscoverage['/dialog.js'].lineData[668] = 0;
  _$jscoverage['/dialog.js'].lineData[669] = 0;
  _$jscoverage['/dialog.js'].lineData[670] = 0;
  _$jscoverage['/dialog.js'].lineData[671] = 0;
  _$jscoverage['/dialog.js'].lineData[672] = 0;
  _$jscoverage['/dialog.js'].lineData[673] = 0;
  _$jscoverage['/dialog.js'].lineData[674] = 0;
  _$jscoverage['/dialog.js'].lineData[675] = 0;
  _$jscoverage['/dialog.js'].lineData[687] = 0;
  _$jscoverage['/dialog.js'].lineData[689] = 0;
  _$jscoverage['/dialog.js'].lineData[690] = 0;
  _$jscoverage['/dialog.js'].lineData[696] = 0;
  _$jscoverage['/dialog.js'].lineData[699] = 0;
  _$jscoverage['/dialog.js'].lineData[705] = 0;
  _$jscoverage['/dialog.js'].lineData[706] = 0;
  _$jscoverage['/dialog.js'].lineData[710] = 0;
  _$jscoverage['/dialog.js'].lineData[713] = 0;
  _$jscoverage['/dialog.js'].lineData[721] = 0;
  _$jscoverage['/dialog.js'].lineData[723] = 0;
  _$jscoverage['/dialog.js'].lineData[724] = 0;
  _$jscoverage['/dialog.js'].lineData[725] = 0;
  _$jscoverage['/dialog.js'].lineData[726] = 0;
  _$jscoverage['/dialog.js'].lineData[729] = 0;
  _$jscoverage['/dialog.js'].lineData[731] = 0;
  _$jscoverage['/dialog.js'].lineData[733] = 0;
  _$jscoverage['/dialog.js'].lineData[734] = 0;
  _$jscoverage['/dialog.js'].lineData[737] = 0;
  _$jscoverage['/dialog.js'].lineData[738] = 0;
  _$jscoverage['/dialog.js'].lineData[741] = 0;
  _$jscoverage['/dialog.js'].lineData[742] = 0;
  _$jscoverage['/dialog.js'].lineData[745] = 0;
  _$jscoverage['/dialog.js'].lineData[747] = 0;
  _$jscoverage['/dialog.js'].lineData[748] = 0;
  _$jscoverage['/dialog.js'].lineData[752] = 0;
  _$jscoverage['/dialog.js'].lineData[754] = 0;
  _$jscoverage['/dialog.js'].lineData[755] = 0;
  _$jscoverage['/dialog.js'].lineData[757] = 0;
  _$jscoverage['/dialog.js'].lineData[763] = 0;
  _$jscoverage['/dialog.js'].lineData[768] = 0;
  _$jscoverage['/dialog.js'].lineData[774] = 0;
  _$jscoverage['/dialog.js'].lineData[775] = 0;
  _$jscoverage['/dialog.js'].lineData[776] = 0;
  _$jscoverage['/dialog.js'].lineData[780] = 0;
  _$jscoverage['/dialog.js'].lineData[784] = 0;
  _$jscoverage['/dialog.js'].lineData[786] = 0;
  _$jscoverage['/dialog.js'].lineData[787] = 0;
  _$jscoverage['/dialog.js'].lineData[788] = 0;
  _$jscoverage['/dialog.js'].lineData[789] = 0;
  _$jscoverage['/dialog.js'].lineData[795] = 0;
  _$jscoverage['/dialog.js'].lineData[796] = 0;
  _$jscoverage['/dialog.js'].lineData[797] = 0;
  _$jscoverage['/dialog.js'].lineData[801] = 0;
  _$jscoverage['/dialog.js'].lineData[803] = 0;
  _$jscoverage['/dialog.js'].lineData[807] = 0;
}
if (! _$jscoverage['/dialog.js'].functionData) {
  _$jscoverage['/dialog.js'].functionData = [];
  _$jscoverage['/dialog.js'].functionData[0] = 0;
  _$jscoverage['/dialog.js'].functionData[1] = 0;
  _$jscoverage['/dialog.js'].functionData[2] = 0;
  _$jscoverage['/dialog.js'].functionData[3] = 0;
  _$jscoverage['/dialog.js'].functionData[4] = 0;
  _$jscoverage['/dialog.js'].functionData[5] = 0;
  _$jscoverage['/dialog.js'].functionData[6] = 0;
  _$jscoverage['/dialog.js'].functionData[7] = 0;
  _$jscoverage['/dialog.js'].functionData[8] = 0;
  _$jscoverage['/dialog.js'].functionData[9] = 0;
  _$jscoverage['/dialog.js'].functionData[10] = 0;
  _$jscoverage['/dialog.js'].functionData[11] = 0;
  _$jscoverage['/dialog.js'].functionData[12] = 0;
  _$jscoverage['/dialog.js'].functionData[13] = 0;
  _$jscoverage['/dialog.js'].functionData[14] = 0;
  _$jscoverage['/dialog.js'].functionData[15] = 0;
  _$jscoverage['/dialog.js'].functionData[16] = 0;
  _$jscoverage['/dialog.js'].functionData[17] = 0;
  _$jscoverage['/dialog.js'].functionData[18] = 0;
  _$jscoverage['/dialog.js'].functionData[19] = 0;
  _$jscoverage['/dialog.js'].functionData[20] = 0;
  _$jscoverage['/dialog.js'].functionData[21] = 0;
  _$jscoverage['/dialog.js'].functionData[22] = 0;
  _$jscoverage['/dialog.js'].functionData[23] = 0;
  _$jscoverage['/dialog.js'].functionData[24] = 0;
  _$jscoverage['/dialog.js'].functionData[25] = 0;
  _$jscoverage['/dialog.js'].functionData[26] = 0;
  _$jscoverage['/dialog.js'].functionData[27] = 0;
  _$jscoverage['/dialog.js'].functionData[28] = 0;
  _$jscoverage['/dialog.js'].functionData[29] = 0;
  _$jscoverage['/dialog.js'].functionData[30] = 0;
  _$jscoverage['/dialog.js'].functionData[31] = 0;
  _$jscoverage['/dialog.js'].functionData[32] = 0;
  _$jscoverage['/dialog.js'].functionData[33] = 0;
  _$jscoverage['/dialog.js'].functionData[34] = 0;
  _$jscoverage['/dialog.js'].functionData[35] = 0;
}
if (! _$jscoverage['/dialog.js'].branchData) {
  _$jscoverage['/dialog.js'].branchData = {};
  _$jscoverage['/dialog.js'].branchData['84'] = [];
  _$jscoverage['/dialog.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['158'] = [];
  _$jscoverage['/dialog.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['159'] = [];
  _$jscoverage['/dialog.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['167'] = [];
  _$jscoverage['/dialog.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['176'] = [];
  _$jscoverage['/dialog.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['179'] = [];
  _$jscoverage['/dialog.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['187'] = [];
  _$jscoverage['/dialog.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['188'] = [];
  _$jscoverage['/dialog.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['249'] = [];
  _$jscoverage['/dialog.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['252'] = [];
  _$jscoverage['/dialog.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['260'] = [];
  _$jscoverage['/dialog.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['270'] = [];
  _$jscoverage['/dialog.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['282'] = [];
  _$jscoverage['/dialog.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['290'] = [];
  _$jscoverage['/dialog.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['302'] = [];
  _$jscoverage['/dialog.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['312'] = [];
  _$jscoverage['/dialog.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['317'] = [];
  _$jscoverage['/dialog.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['326'] = [];
  _$jscoverage['/dialog.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['344'] = [];
  _$jscoverage['/dialog.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['355'] = [];
  _$jscoverage['/dialog.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['371'] = [];
  _$jscoverage['/dialog.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['373'] = [];
  _$jscoverage['/dialog.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['377'] = [];
  _$jscoverage['/dialog.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['378'] = [];
  _$jscoverage['/dialog.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['381'] = [];
  _$jscoverage['/dialog.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['403'] = [];
  _$jscoverage['/dialog.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['403'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['412'] = [];
  _$jscoverage['/dialog.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['418'] = [];
  _$jscoverage['/dialog.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['439'] = [];
  _$jscoverage['/dialog.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['439'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['440'] = [];
  _$jscoverage['/dialog.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['449'] = [];
  _$jscoverage['/dialog.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['453'] = [];
  _$jscoverage['/dialog.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['454'] = [];
  _$jscoverage['/dialog.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['466'] = [];
  _$jscoverage['/dialog.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['468'] = [];
  _$jscoverage['/dialog.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['475'] = [];
  _$jscoverage['/dialog.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['475'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['489'] = [];
  _$jscoverage['/dialog.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['496'] = [];
  _$jscoverage['/dialog.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['504'] = [];
  _$jscoverage['/dialog.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['513'] = [];
  _$jscoverage['/dialog.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['526'] = [];
  _$jscoverage['/dialog.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['552'] = [];
  _$jscoverage['/dialog.js'].branchData['552'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['559'] = [];
  _$jscoverage['/dialog.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['561'] = [];
  _$jscoverage['/dialog.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['575'] = [];
  _$jscoverage['/dialog.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['577'] = [];
  _$jscoverage['/dialog.js'].branchData['577'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['584'] = [];
  _$jscoverage['/dialog.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['601'] = [];
  _$jscoverage['/dialog.js'].branchData['601'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['604'] = [];
  _$jscoverage['/dialog.js'].branchData['604'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['664'] = [];
  _$jscoverage['/dialog.js'].branchData['664'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['689'] = [];
  _$jscoverage['/dialog.js'].branchData['689'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['705'] = [];
  _$jscoverage['/dialog.js'].branchData['705'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['721'] = [];
  _$jscoverage['/dialog.js'].branchData['721'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['724'] = [];
  _$jscoverage['/dialog.js'].branchData['724'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['726'] = [];
  _$jscoverage['/dialog.js'].branchData['726'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['726'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['733'] = [];
  _$jscoverage['/dialog.js'].branchData['733'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['737'] = [];
  _$jscoverage['/dialog.js'].branchData['737'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['752'] = [];
  _$jscoverage['/dialog.js'].branchData['752'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['775'] = [];
  _$jscoverage['/dialog.js'].branchData['775'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['775'][1].init(312, 33, '"ready" != uploader[\'getReady\']()');
function visit63_775_1(result) {
  _$jscoverage['/dialog.js'].branchData['775'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['752'][1].init(195, 18, 'curNum > available');
function visit62_752_1(result) {
  _$jscoverage['/dialog.js'].branchData['752'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['737'][1].init(589, 14, 'l >= available');
function visit61_737_1(result) {
  _$jscoverage['/dialog.js'].branchData['737'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['733'][1].init(447, 13, 'l > available');
function visit60_733_1(result) {
  _$jscoverage['/dialog.js'].branchData['733'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['726'][2].init(94, 33, 'files[fid] && (delete files[fid])');
function visit59_726_2(result) {
  _$jscoverage['/dialog.js'].branchData['726'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['726'][1].init(87, 40, 'fid && files[fid] && (delete files[fid])');
function visit58_726_1(result) {
  _$jscoverage['/dialog.js'].branchData['726'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['724'][1].init(111, 14, 'i < trs.length');
function visit57_724_1(result) {
  _$jscoverage['/dialog.js'].branchData['724'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['721'][1].init(287, 5, 'files');
function visit56_721_1(result) {
  _$jscoverage['/dialog.js'].branchData['721'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['705'][1].init(336, 10, 'f.complete');
function visit55_705_1(result) {
  _$jscoverage['/dialog.js'].branchData['705'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['689'][1].init(2630, 34, 'parseInt(f.size) > self._sizeLimit');
function visit54_689_1(result) {
  _$jscoverage['/dialog.js'].branchData['689'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['664'][1].init(1299, 18, 'f.name.length > 18');
function visit53_664_1(result) {
  _$jscoverage['/dialog.js'].branchData['664'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['604'][1].init(102, 3, 'url');
function visit52_604_1(result) {
  _$jscoverage['/dialog.js'].branchData['604'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['601'][1].init(222, 14, 'i < trs.length');
function visit51_601_1(result) {
  _$jscoverage['/dialog.js'].branchData['601'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['584'][1].init(496, 1, 'd');
function visit50_584_1(result) {
  _$jscoverage['/dialog.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['577'][1].init(233, 15, 'i < data.length');
function visit49_577_1(result) {
  _$jscoverage['/dialog.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['575'][1].init(137, 5, '!data');
function visit48_575_1(result) {
  _$jscoverage['/dialog.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['561'][1].init(67, 15, '!tr.attr("url")');
function visit47_561_1(result) {
  _$jscoverage['/dialog.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['559'][1].init(227, 14, 'i < trs.length');
function visit46_559_1(result) {
  _$jscoverage['/dialog.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['552'][1].init(208, 15, 'trs.length == 0');
function visit45_552_1(result) {
  _$jscoverage['/dialog.js'].branchData['552'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['526'][1].init(228, 35, 'bar && bar.set("progress", progess)');
function visit44_526_1(result) {
  _$jscoverage['/dialog.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['513'][1].init(1009, 2, 'tr');
function visit43_513_1(result) {
  _$jscoverage['/dialog.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['504'][1].init(735, 10, 'data.error');
function visit42_504_1(result) {
  _$jscoverage['/dialog.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['496'][1].init(474, 5, '!data');
function visit41_496_1(result) {
  _$jscoverage['/dialog.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['489'][1].init(312, 2, 'id');
function visit40_489_1(result) {
  _$jscoverage['/dialog.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['475'][2].init(48, 27, 'ev[\'file\'] && ev[\'file\'].id');
function visit39_475_2(result) {
  _$jscoverage['/dialog.js'].branchData['475'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['475'][1].init(38, 38, 'ev.id || (ev[\'file\'] && ev[\'file\'].id)');
function visit38_475_1(result) {
  _$jscoverage['/dialog.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['468'][1].init(59, 20, 'tr.attr("fid") == id');
function visit37_468_1(result) {
  _$jscoverage['/dialog.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['466'][1].init(135, 14, 'i < trs.length');
function visit36_466_1(result) {
  _$jscoverage['/dialog.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['454'][1].init(18, 20, 'bar && bar.destroy()');
function visit35_454_1(result) {
  _$jscoverage['/dialog.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['453'][1].init(639, 2, 'tr');
function visit34_453_1(result) {
  _$jscoverage['/dialog.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['449'][1].init(519, 11, '!ev._custom');
function visit33_449_1(result) {
  _$jscoverage['/dialog.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['440'][1].init(263, 3, '!id');
function visit32_440_1(result) {
  _$jscoverage['/dialog.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['439'][2].init(201, 27, 'ev[\'file\'] && ev[\'file\'].id');
function visit31_439_2(result) {
  _$jscoverage['/dialog.js'].branchData['439'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['439'][1].init(191, 38, 'ev.id || (ev[\'file\'] && ev[\'file\'].id)');
function visit30_439_1(result) {
  _$jscoverage['/dialog.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['418'][1].init(343, 17, 'progressBars[fid]');
function visit29_418_1(result) {
  _$jscoverage['/dialog.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['412'][1].init(181, 3, 'fid');
function visit28_412_1(result) {
  _$jscoverage['/dialog.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['403'][2].init(14369, 26, 'Editor.Utils.ieEngine != 9');
function visit27_403_2(result) {
  _$jscoverage['/dialog.js'].branchData['403'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['403'][1].init(14352, 43, '!UA[\'webkit\'] && Editor.Utils.ieEngine != 9');
function visit26_403_1(result) {
  _$jscoverage['/dialog.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['381'][1].init(89, 13, 'previewSuffix');
function visit25_381_1(result) {
  _$jscoverage['/dialog.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['378'][1].init(191, 17, 'fid == currentFid');
function visit24_378_1(result) {
  _$jscoverage['/dialog.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['377'][1].init(144, 4, '!url');
function visit23_377_1(result) {
  _$jscoverage['/dialog.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['373'][1].init(81, 114, 'tr.hasClass(replacePrefix("{prefixCls}editor-upload-complete", prefixCls), undefined)');
function visit22_373_1(result) {
  _$jscoverage['/dialog.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['371'][1].init(173, 2, 'td');
function visit21_371_1(result) {
  _$jscoverage['/dialog.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['355'][1].init(12172, 12, 'previewWidth');
function visit20_355_1(result) {
  _$jscoverage['/dialog.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['344'][1].init(11806, 18, 'localStorage.ready');
function visit19_344_1(result) {
  _$jscoverage['/dialog.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['326'][1].init(392, 4, 'next');
function visit18_326_1(result) {
  _$jscoverage['/dialog.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['317'][1].init(1661, 89, 'target.hasClass(replacePrefix("{prefixCls}editor-upload-movedown", prefixCls), undefined)');
function visit17_317_1(result) {
  _$jscoverage['/dialog.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['312'][1].init(413, 3, 'pre');
function visit16_312_1(result) {
  _$jscoverage['/dialog.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['302'][1].init(1002, 87, 'target.hasClass(replacePrefix("{prefixCls}editor-upload-moveup", prefixCls), undefined)');
function visit15_302_1(result) {
  _$jscoverage['/dialog.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['290'][1].init(25, 254, 'target.hasClass(replacePrefix("{prefixCls}editor-upload-delete", prefixCls), undefined) || target.hasClass(replacePrefix("{prefixCls}editor-upload-insert", prefixCls), undefined)');
function visit14_290_1(result) {
  _$jscoverage['/dialog.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['282'][1].init(98, 87, 'target.hasClass(replacePrefix("{prefixCls}editor-upload-insert", prefixCls), undefined)');
function visit13_282_1(result) {
  _$jscoverage['/dialog.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['270'][1].init(77, 14, 'i < trs.length');
function visit12_270_1(result) {
  _$jscoverage['/dialog.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['260'][1].init(584, 3, 'url');
function visit11_260_1(result) {
  _$jscoverage['/dialog.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['252'][1].init(114, 3, 'url');
function visit10_252_1(result) {
  _$jscoverage['/dialog.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['249'][1].init(77, 14, 'i < trs.length');
function visit9_249_1(result) {
  _$jscoverage['/dialog.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['188'][1].init(5666, 36, 'uploadCfg[\'fileInput\'] || "Filedata"');
function visit8_188_1(result) {
  _$jscoverage['/dialog.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['187'][1].init(5602, 31, 'uploadCfg[\'serverParams\'] || {}');
function visit7_187_1(result) {
  _$jscoverage['/dialog.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['179'][1].init(5295, 22, 'uploadCfg[\'extraHTML\']');
function visit6_179_1(result) {
  _$jscoverage['/dialog.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['176'][1].init(5199, 35, '!SWF.fpvGTE(FLASH_VERSION_REQUIRED)');
function visit5_176_1(result) {
  _$jscoverage['/dialog.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['167'][1].init(4765, 35, '!SWF.fpvGTE(FLASH_VERSION_REQUIRED)');
function visit4_167_1(result) {
  _$jscoverage['/dialog.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['159'][1].init(4529, 41, 'uploadCfg[\'numberLimit\'] || PIC_NUM_LIMIT');
function visit3_159_1(result) {
  _$jscoverage['/dialog.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['158'][1].init(4454, 40, 'uploadCfg[\'sizeLimit\'] || PIC_SIZE_LIMIT');
function visit2_158_1(result) {
  _$jscoverage['/dialog.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['84'][1].init(22, 10, '!ev.newVal');
function visit1_84_1(result) {
  _$jscoverage['/dialog.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[5]++;
KISSY.add("editor/plugin/multiple-upload/dialog", function(S, Editor, Overlay, DragPlugin, ProgressBar, Dialog4E, FlashBridge, localStorage, SWF, undefined) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[10]++;
  var UA = S.UA, Dom = S.DOM, $ = S.all, Json = S.JSON, PIC_NUM_LIMIT = 15, PIC_NUM_LIMIT_WARNING = "\u7cfb\u7edf\u5c06\u53ea\u4fdd\u7559 n \u5f20", PIC_SIZE_LIMIT = 1000, PIC_SIZE_LIMIT_WARNING = "\u56fe\u7247\u592a\u5927\uff0c\u8bf7\u538b\u7f29\u81f3 n M\u4ee5\u4e0b", KEY = "Multiple-Upload-Save", swfSrc = Editor.Utils.debugUrl("plugin/uploader/assets/uploader.longzang.swf"), name = "ks-editor-multipleUpload", FLASH_VERSION_REQUIRED = "10.0.0";
  _$jscoverage['/dialog.js'].lineData[23]++;
  function MultiUploadDialog(editor, config) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[24]++;
    this.editor = editor;
    _$jscoverage['/dialog.js'].lineData[25]++;
    this.progressBars = {};
    _$jscoverage['/dialog.js'].lineData[26]++;
    this.config = config;
    _$jscoverage['/dialog.js'].lineData[27]++;
    Editor.Utils.lazyRun(this, "_prepareShow", "_realShow");
  }
  _$jscoverage['/dialog.js'].lineData[30]++;
  function replacePrefix(str, prefix) {
    _$jscoverage['/dialog.js'].functionData[2]++;
    _$jscoverage['/dialog.js'].lineData[31]++;
    return S.substitute(str, {
  prefixCls: prefix});
  }
  _$jscoverage['/dialog.js'].lineData[37]++;
  function swapNode(node1, node2) {
    _$jscoverage['/dialog.js'].functionData[3]++;
    _$jscoverage['/dialog.js'].lineData[39]++;
    var _parent = node1.parentNode;
    _$jscoverage['/dialog.js'].lineData[41]++;
    var _t1 = node1.nextSibling;
    _$jscoverage['/dialog.js'].lineData[42]++;
    var _t2 = node2.nextSibling;
    _$jscoverage['/dialog.js'].lineData[44]++;
    _parent.insertBefore(node2, _t1);
    _$jscoverage['/dialog.js'].lineData[46]++;
    _parent.insertBefore(node1, _t2);
  }
  _$jscoverage['/dialog.js'].lineData[49]++;
  S.augment(MultiUploadDialog, {
  addRes: Editor.Utils.addRes, 
  destroy: Editor.Utils.destroyRes, 
  _prepareShow: function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[53]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls'), uploadCfg = self.config;
  _$jscoverage['/dialog.js'].lineData[58]++;
  self.addRes(function() {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[59]++;
  var progressBars = self.progressBars;
  _$jscoverage['/dialog.js'].lineData[60]++;
  for (var p in progressBars) {
    _$jscoverage['/dialog.js'].lineData[62]++;
    progressBars[p].destroy();
  }
});
  _$jscoverage['/dialog.js'].lineData[67]++;
  self.dialog = new Dialog4E({
  headerContent: "\u6279\u91cf\u4e0a\u4f20", 
  mask: false, 
  plugins: [new DragPlugin({
  handlers: ['.ks-editor-dialog-header']})], 
  focus4e: false, 
  width: "600px"}).render();
  _$jscoverage['/dialog.js'].lineData[78]++;
  var d = self.dialog;
  _$jscoverage['/dialog.js'].lineData[83]++;
  d.on("beforeVisibleChange", function(ev) {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[84]++;
  if (visit1_84_1(!ev.newVal)) {
    _$jscoverage['/dialog.js'].lineData[85]++;
    d.move(-9999, -9999);
    _$jscoverage['/dialog.js'].lineData[86]++;
    return false;
  }
});
  _$jscoverage['/dialog.js'].lineData[90]++;
  self.addRes(d);
  _$jscoverage['/dialog.js'].lineData[92]++;
  var multipleUploaderHolder = d.get("body"), btnHolder = $(replacePrefix("<div class='{prefixCls}editor-upload-btn-wrap'>" + "<span " + "style='" + "margin:0 15px 0 0px;" + "color:#969696;" + "display:inline-block;" + "vertical-align:middle;" + "width:450px;" + "'></span>" + "</div>", prefixCls)).appendTo(multipleUploaderHolder, undefined), listWrap = $("<div style='display:none'>").appendTo(multipleUploaderHolder, undefined), btn = $(replacePrefix("<a class='{prefixCls}editor-button ks-inline-block'>" + "\u6d4f&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\u89c8</a>", prefixCls)).appendTo(btnHolder, undefined), listTableWrap = $(replacePrefix("<div>" + "<table class='{prefixCls}editor-upload-list'>" + "<thead>" + "<tr>" + "<th style='width:30px;'>" + "\u5e8f\u53f7" + "</th>" + "<th>" + "\u56fe\u7247" + "</th>" + "<th>" + "\u5927\u5c0f" + "</th>" + "<th style='width:30%'>" + "\u4e0a\u4f20\u8fdb\u5ea6" + "</th>" + "<th>" + "\u56fe\u7247\u64cd\u4f5c" + "</th>" + "</tr>" + "</thead>" + "<tbody>" + "</tbody>" + "</table>" + "</div>", prefixCls)).appendTo(listWrap, undefined), list = listTableWrap.one("tbody"), upHolder = $(replacePrefix("<p " + "style='" + "margin:15px 15px 30px 6px;" + "'>" + "<a class='{prefixCls}editor-multiple-upload-delall'" + " style='" + "margin-right:20px;" + "cursor:pointer;" + "margin-left:40px;" + "'>\u6e05\u7a7a\u5217\u8868</a>" + "<a class='{prefixCls}editor-button {prefixCls}editor-multiple-upload-ok ks-inline-block'>\u786e\u5b9a\u4e0a\u4f20</a>" + "<a class='{prefixCls}editor-button {prefixCls}editor-multiple-upload-insertall ks-inline-block'" + " style='margin-left:20px;'>\u5168\u90e8\u63d2\u5165</a>" + "</p>", prefixCls)).appendTo(listWrap, undefined), up = upHolder.one(replacePrefix(".{prefixCls}editor-multiple-upload-ok", prefixCls)), insertAll = upHolder.one(replacePrefix(".{prefixCls}editor-multiple-upload-insertall", prefixCls)), delAll = upHolder.one(replacePrefix(".{prefixCls}editor-multiple-upload-delall", prefixCls)), fid = S.guid(name), statusText = $("<span>").prependTo(upHolder, undefined);
  _$jscoverage['/dialog.js'].lineData[158]++;
  self._sizeLimit = visit2_158_1(uploadCfg['sizeLimit'] || PIC_SIZE_LIMIT);
  _$jscoverage['/dialog.js'].lineData[159]++;
  self._numberLimit = visit3_159_1(uploadCfg['numberLimit'] || PIC_NUM_LIMIT);
  _$jscoverage['/dialog.js'].lineData[161]++;
  var TIP = "\u5141\u8bb8\u7528\u6237\u540c\u65f6\u4e0a\u4f20" + self._numberLimit + "\u5f20\u56fe\u7247\uff0c\u5355\u5f20\u56fe\u7247\u5bb9\u91cf\u4e0d\u8d85\u8fc7" + self._sizeLimit / 1000 + "M";
  _$jscoverage['/dialog.js'].lineData[167]++;
  if (visit4_167_1(!SWF.fpvGTE(FLASH_VERSION_REQUIRED))) {
    _$jscoverage['/dialog.js'].lineData[168]++;
    TIP = "\u60a8\u7684flash\u63d2\u4ef6\u7248\u672c\u8fc7\u4f4e\uff0c\u8be5\u529f\u80fd\u4e0d\u53ef\u7528\uff0c" + "\u8bf7<a href='http://get.adobe.com/cn/flashplayer/'" + " target='_blank'>\u70b9\u6b64\u5347\u7ea7</a>";
  }
  _$jscoverage['/dialog.js'].lineData[173]++;
  btn.addClass(replacePrefix("{prefixCls}editor-button-disabled", prefixCls), undefined);
  _$jscoverage['/dialog.js'].lineData[174]++;
  self.tipSpan = btnHolder.one("span");
  _$jscoverage['/dialog.js'].lineData[175]++;
  self.tipSpan.html(TIP);
  _$jscoverage['/dialog.js'].lineData[176]++;
  if (visit5_176_1(!SWF.fpvGTE(FLASH_VERSION_REQUIRED))) {
    _$jscoverage['/dialog.js'].lineData[177]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[179]++;
  if (visit6_179_1(uploadCfg['extraHTML'])) {
    _$jscoverage['/dialog.js'].lineData[180]++;
    listTableWrap.append(uploadCfg['extraHTML']);
  }
  _$jscoverage['/dialog.js'].lineData[183]++;
  self._list = list;
  _$jscoverage['/dialog.js'].lineData[184]++;
  self['_listTable'] = list.parent("table");
  _$jscoverage['/dialog.js'].lineData[185]++;
  self._listWrap = listWrap;
  _$jscoverage['/dialog.js'].lineData[186]++;
  self._ds = uploadCfg['serverUrl'];
  _$jscoverage['/dialog.js'].lineData[187]++;
  self._dsp = visit7_187_1(uploadCfg['serverParams'] || {});
  _$jscoverage['/dialog.js'].lineData[188]++;
  self._fileInput = visit8_188_1(uploadCfg['fileInput'] || "Filedata");
  _$jscoverage['/dialog.js'].lineData[189]++;
  self.statusText = statusText;
  _$jscoverage['/dialog.js'].lineData[190]++;
  self.btn = btn;
  _$jscoverage['/dialog.js'].lineData[191]++;
  self.up = up;
  _$jscoverage['/dialog.js'].lineData[194]++;
  var bel = btn, boffset = bel.offset(), fwidth = bel.width() * 2, fheight = bel.height() * 1.5, flashPos = $("<div style='" + ("position:absolute;" + "width:" + fwidth + "px;" + "height:" + fheight + "px;" + "z-index:" + Editor.baseZIndex(9999) + ";") + "'>").appendTo(btnHolder, undefined);
  _$jscoverage['/dialog.js'].lineData[206]++;
  flashPos.offset(boffset);
  _$jscoverage['/dialog.js'].lineData[207]++;
  self.flashPos = flashPos;
  _$jscoverage['/dialog.js'].lineData[208]++;
  var uploader = new FlashBridge({
  src: swfSrc, 
  ajbridge: true, 
  methods: ["getReady", "removeFile", "lock", "unlock", "setAllowMultipleFiles", "setFileFilters", "uploadAll"], 
  render: flashPos, 
  attrs: {
  width: fwidth, 
  height: fheight}, 
  params: {
  wmode: "transparent", 
  flashVars: {
  "allowedDomain": location.hostname, 
  btn: true, 
  "hand": true}}});
  _$jscoverage['/dialog.js'].lineData[235]++;
  self.uploader = uploader;
  _$jscoverage['/dialog.js'].lineData[237]++;
  uploader.on("mouseOver", function() {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[238]++;
  bel.addClass(replacePrefix("{prefixCls}editor-button-hover", prefixCls), undefined);
});
  _$jscoverage['/dialog.js'].lineData[240]++;
  uploader.on("mouseOut", function() {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[241]++;
  bel.removeClass(replacePrefix("{prefixCls}editor-button-hover", prefixCls), undefined);
});
  _$jscoverage['/dialog.js'].lineData[243]++;
  self.addRes(uploader);
  _$jscoverage['/dialog.js'].lineData[245]++;
  var editorDoc = editor.get("document")[0];
  _$jscoverage['/dialog.js'].lineData[247]++;
  insertAll.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[9]++;
  _$jscoverage['/dialog.js'].lineData[248]++;
  var trs = list.all("tr");
  _$jscoverage['/dialog.js'].lineData[249]++;
  for (var i = 0; visit9_249_1(i < trs.length); i++) {
    _$jscoverage['/dialog.js'].lineData[250]++;
    var tr = $(trs[i]), url = tr.attr("url");
    _$jscoverage['/dialog.js'].lineData[252]++;
    if (visit10_252_1(url)) {
      _$jscoverage['/dialog.js'].lineData[254]++;
      new Image().src = url;
      _$jscoverage['/dialog.js'].lineData[255]++;
      editor.insertElement($("<p>&nbsp;<img src='" + url + "'/>&nbsp;</p>", editorDoc));
      _$jscoverage['/dialog.js'].lineData[257]++;
      self._removeTrFile(tr);
    }
  }
  _$jscoverage['/dialog.js'].lineData[260]++;
  if (visit11_260_1(url)) {
    _$jscoverage['/dialog.js'].lineData[261]++;
    listWrap.hide();
    _$jscoverage['/dialog.js'].lineData[262]++;
    d.hide();
  }
  _$jscoverage['/dialog.js'].lineData[264]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[266]++;
  self.addRes(insertAll);
  _$jscoverage['/dialog.js'].lineData[268]++;
  delAll.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[269]++;
  var trs = list.all("tr");
  _$jscoverage['/dialog.js'].lineData[270]++;
  for (var i = 0; visit12_270_1(i < trs.length); i++) {
    _$jscoverage['/dialog.js'].lineData[271]++;
    var tr = $(trs[i]);
    _$jscoverage['/dialog.js'].lineData[272]++;
    self._removeTrFile(tr);
  }
  _$jscoverage['/dialog.js'].lineData[274]++;
  listWrap.hide();
  _$jscoverage['/dialog.js'].lineData[275]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[277]++;
  self.addRes(delAll);
  _$jscoverage['/dialog.js'].lineData[279]++;
  list.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[11]++;
  _$jscoverage['/dialog.js'].lineData[280]++;
  var target = $(ev.target), tr;
  _$jscoverage['/dialog.js'].lineData[281]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[282]++;
  if (visit13_282_1(target.hasClass(replacePrefix("{prefixCls}editor-upload-insert", prefixCls), undefined))) {
    _$jscoverage['/dialog.js'].lineData[283]++;
    tr = target.parent("tr");
    _$jscoverage['/dialog.js'].lineData[284]++;
    var url = tr.attr("url");
    _$jscoverage['/dialog.js'].lineData[285]++;
    new Image().src = url;
    _$jscoverage['/dialog.js'].lineData[286]++;
    editor.insertElement($("<img src='" + url + "'/>", null, editor.get("document")[0]));
  }
  _$jscoverage['/dialog.js'].lineData[289]++;
  if (visit14_290_1(target.hasClass(replacePrefix("{prefixCls}editor-upload-delete", prefixCls), undefined) || target.hasClass(replacePrefix("{prefixCls}editor-upload-insert", prefixCls), undefined))) {
    _$jscoverage['/dialog.js'].lineData[295]++;
    tr = target.parent("tr");
    _$jscoverage['/dialog.js'].lineData[296]++;
    self._removeTrFile(tr);
  }
  _$jscoverage['/dialog.js'].lineData[302]++;
  if (visit15_302_1(target.hasClass(replacePrefix("{prefixCls}editor-upload-moveup", prefixCls), undefined))) {
    _$jscoverage['/dialog.js'].lineData[303]++;
    tr = target.parent("tr");
    _$jscoverage['/dialog.js'].lineData[304]++;
    tr.css("backgroundColor", "#eef4f9");
    _$jscoverage['/dialog.js'].lineData[305]++;
    tr['animate']({
  backgroundColor: "#FBFBFB"}, 1, null, function() {
  _$jscoverage['/dialog.js'].functionData[12]++;
  _$jscoverage['/dialog.js'].lineData[308]++;
  tr.css("backgroundColor", "");
});
    _$jscoverage['/dialog.js'].lineData[311]++;
    var pre = tr.prev(undefined, undefined);
    _$jscoverage['/dialog.js'].lineData[312]++;
    if (visit16_312_1(pre)) {
      _$jscoverage['/dialog.js'].lineData[313]++;
      swapNode(tr[0], pre[0]);
      _$jscoverage['/dialog.js'].lineData[314]++;
      self._syncStatus();
    }
  } else {
    _$jscoverage['/dialog.js'].lineData[317]++;
    if (visit17_317_1(target.hasClass(replacePrefix("{prefixCls}editor-upload-movedown", prefixCls), undefined))) {
      _$jscoverage['/dialog.js'].lineData[318]++;
      tr = target.parent("tr");
      _$jscoverage['/dialog.js'].lineData[319]++;
      tr.css("backgroundColor", "#eef4f9");
      _$jscoverage['/dialog.js'].lineData[320]++;
      tr['animate']({
  backgroundColor: "#FBFBFB"}, 1, null, function() {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[323]++;
  tr.css("backgroundColor", "");
});
      _$jscoverage['/dialog.js'].lineData[325]++;
      var next = tr.next();
      _$jscoverage['/dialog.js'].lineData[326]++;
      if (visit18_326_1(next)) {
        _$jscoverage['/dialog.js'].lineData[327]++;
        swapNode(tr[0], next[0]);
        _$jscoverage['/dialog.js'].lineData[328]++;
        self._syncStatus();
      }
    }
  }
  _$jscoverage['/dialog.js'].lineData[331]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[334]++;
  self.addRes(list);
  _$jscoverage['/dialog.js'].lineData[336]++;
  uploader.on("fileSelect", self._onSelect, self);
  _$jscoverage['/dialog.js'].lineData[337]++;
  uploader.on("uploadStart", self._onUploadStart, self);
  _$jscoverage['/dialog.js'].lineData[338]++;
  uploader.on("uploadProgress", self._onProgress, self);
  _$jscoverage['/dialog.js'].lineData[339]++;
  uploader.on("uploadCompleteData", self._onUploadCompleteData, self);
  _$jscoverage['/dialog.js'].lineData[340]++;
  uploader.on("contentReady", self._ready, self);
  _$jscoverage['/dialog.js'].lineData[341]++;
  uploader.on("uploadError", self._uploadError, self);
  _$jscoverage['/dialog.js'].lineData[344]++;
  if (visit19_344_1(localStorage.ready)) {
    _$jscoverage['/dialog.js'].lineData[345]++;
    localStorage.ready(function() {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[346]++;
  self._restore();
});
  } else {
    _$jscoverage['/dialog.js'].lineData[349]++;
    self._restore();
  }
  _$jscoverage['/dialog.js'].lineData[353]++;
  var previewWidth = uploadCfg['previewWidth'];
  _$jscoverage['/dialog.js'].lineData[354]++;
  var previewSuffix = uploadCfg['previewSuffix'];
  _$jscoverage['/dialog.js'].lineData[355]++;
  if (visit20_355_1(previewWidth)) {
    _$jscoverage['/dialog.js'].lineData[357]++;
    var previewWin = new Overlay({
  mask: false, 
  prefixCls: replacePrefix('{prefixCls}editor-', prefixCls), 
  width: previewWidth, 
  render: listWrap}).render();
    _$jscoverage['/dialog.js'].lineData[363]++;
    self.addRes(previewWin);
    _$jscoverage['/dialog.js'].lineData[364]++;
    var preview = previewWin.get("contentEl");
    _$jscoverage['/dialog.js'].lineData[365]++;
    preview.css("border", "none");
    _$jscoverage['/dialog.js'].lineData[367]++;
    var currentFid = 0;
    _$jscoverage['/dialog.js'].lineData[368]++;
    listWrap.on("mouseover", function(ev) {
  _$jscoverage['/dialog.js'].functionData[15]++;
  _$jscoverage['/dialog.js'].lineData[369]++;
  var t = $(ev.target), td = t.parent(replacePrefix(".{prefixCls}editor-upload-filename", prefixCls));
  _$jscoverage['/dialog.js'].lineData[371]++;
  if (visit21_371_1(td)) {
    _$jscoverage['/dialog.js'].lineData[372]++;
    var tr = td.parent("tr");
    _$jscoverage['/dialog.js'].lineData[373]++;
    if (visit22_373_1(tr.hasClass(replacePrefix("{prefixCls}editor-upload-complete", prefixCls), undefined))) {
      _$jscoverage['/dialog.js'].lineData[375]++;
      var url = tr.attr("url"), fid = tr.attr("fid");
      _$jscoverage['/dialog.js'].lineData[377]++;
      if (visit23_377_1(!url)) 
        return;
      _$jscoverage['/dialog.js'].lineData[378]++;
      if (visit24_378_1(fid == currentFid)) {
      } else {
        _$jscoverage['/dialog.js'].lineData[380]++;
        currentFid = fid;
        _$jscoverage['/dialog.js'].lineData[381]++;
        if (visit25_381_1(previewSuffix)) {
          _$jscoverage['/dialog.js'].lineData[382]++;
          url = url.replace(/(\.\w+$)/, previewSuffix);
        }
        _$jscoverage['/dialog.js'].lineData[384]++;
        preview.html("<img " + "style='display:block;' " + "src='" + url + "' />");
      }
      _$jscoverage['/dialog.js'].lineData[389]++;
      var offset = Dom.offset(td);
      _$jscoverage['/dialog.js'].lineData[390]++;
      offset.left += td[0].offsetWidth;
      _$jscoverage['/dialog.js'].lineData[391]++;
      previewWin.move(offset.left, offset.top);
      _$jscoverage['/dialog.js'].lineData[392]++;
      previewWin.show();
    }
  } else {
    _$jscoverage['/dialog.js'].lineData[395]++;
    previewWin.hide();
  }
});
    _$jscoverage['/dialog.js'].lineData[398]++;
    self.addRes(listWrap);
  }
  _$jscoverage['/dialog.js'].lineData[403]++;
  if (visit26_403_1(!UA['webkit'] && visit27_403_2(Editor.Utils.ieEngine != 9))) {
    _$jscoverage['/dialog.js'].lineData[404]++;
    d.set("handlers", [d.get("el")]);
  }
}, 
  _removeTrFile: function(tr) {
  _$jscoverage['/dialog.js'].functionData[16]++;
  _$jscoverage['/dialog.js'].lineData[408]++;
  var self = this, progressBars = self.progressBars, fid = tr.attr("fid"), uploader = self.uploader;
  _$jscoverage['/dialog.js'].lineData[412]++;
  if (visit28_412_1(fid)) {
    _$jscoverage['/dialog.js'].lineData[413]++;
    try {
      _$jscoverage['/dialog.js'].lineData[414]++;
      uploader['removeFile'](fid);
    }    catch (e) {
}
  }
  _$jscoverage['/dialog.js'].lineData[418]++;
  if (visit29_418_1(progressBars[fid])) {
    _$jscoverage['/dialog.js'].lineData[419]++;
    progressBars[fid].destroy();
    _$jscoverage['/dialog.js'].lineData[420]++;
    delete progressBars[fid];
  }
  _$jscoverage['/dialog.js'].lineData[422]++;
  tr.remove();
  _$jscoverage['/dialog.js'].lineData[423]++;
  self.denable();
  _$jscoverage['/dialog.js'].lineData[424]++;
  self._syncStatus();
}, 
  _realShow: function() {
  _$jscoverage['/dialog.js'].functionData[17]++;
  _$jscoverage['/dialog.js'].lineData[428]++;
  this.dialog.center();
  _$jscoverage['/dialog.js'].lineData[429]++;
  this.dialog.show();
}, 
  show: function() {
  _$jscoverage['/dialog.js'].functionData[18]++;
  _$jscoverage['/dialog.js'].lineData[432]++;
  this._prepareShow();
}, 
  _uploadError: function(ev) {
  _$jscoverage['/dialog.js'].functionData[19]++;
  _$jscoverage['/dialog.js'].lineData[435]++;
  var self = this, prefixCls = self.editor.get('prefixCls'), progressBars = self.progressBars, uploader = self.uploader, id = visit30_439_1(ev.id || (visit31_439_2(ev['file'] && ev['file'].id)));
  _$jscoverage['/dialog.js'].lineData[440]++;
  if (visit32_440_1(!id)) {
    _$jscoverage['/dialog.js'].lineData[441]++;
    S.log(ev);
    _$jscoverage['/dialog.js'].lineData[442]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[444]++;
  var tr = self._getFileTr(id), bar = progressBars[id], status = ev.status;
  _$jscoverage['/dialog.js'].lineData[448]++;
  uploader['removeFile'](id);
  _$jscoverage['/dialog.js'].lineData[449]++;
  if (visit33_449_1(!ev._custom)) {
    _$jscoverage['/dialog.js'].lineData[450]++;
    S.log(status);
    _$jscoverage['/dialog.js'].lineData[451]++;
    status = "\u670d\u52a1\u5668\u51fa\u9519\u6216\u683c\u5f0f\u4e0d\u6b63\u786e";
  }
  _$jscoverage['/dialog.js'].lineData[453]++;
  if (visit34_453_1(tr)) {
    _$jscoverage['/dialog.js'].lineData[454]++;
    visit35_454_1(bar && bar.destroy());
    _$jscoverage['/dialog.js'].lineData[455]++;
    delete progressBars[id];
    _$jscoverage['/dialog.js'].lineData[456]++;
    tr.one(replacePrefix(".{prefixCls}editor-upload-progress", prefixCls)).html("<div " + "style='color:red;'>" + status + "</div>");
  }
}, 
  _getFileTr: function(id) {
  _$jscoverage['/dialog.js'].functionData[20]++;
  _$jscoverage['/dialog.js'].lineData[463]++;
  var self = this, list = self._list, trs = list.all("tr");
  _$jscoverage['/dialog.js'].lineData[466]++;
  for (var i = 0; visit36_466_1(i < trs.length); i++) {
    _$jscoverage['/dialog.js'].lineData[467]++;
    var tr = $(trs[i]);
    _$jscoverage['/dialog.js'].lineData[468]++;
    if (visit37_468_1(tr.attr("fid") == id)) {
      _$jscoverage['/dialog.js'].lineData[469]++;
      return tr;
    }
  }
}, 
  _onUploadStart: function(ev) {
  _$jscoverage['/dialog.js'].functionData[21]++;
  _$jscoverage['/dialog.js'].lineData[474]++;
  var self = this, id = visit38_475_1(ev.id || (visit39_475_2(ev['file'] && ev['file'].id)));
  _$jscoverage['/dialog.js'].lineData[476]++;
  var tr = this._getFileTr(id);
  _$jscoverage['/dialog.js'].lineData[477]++;
  var prefixCls = self.editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[478]++;
  tr[0].className = replacePrefix("{prefixCls}editor-upload-uploading", prefixCls);
}, 
  _onUploadCompleteData: function(ev) {
  _$jscoverage['/dialog.js'].functionData[22]++;
  _$jscoverage['/dialog.js'].lineData[481]++;
  var self = this, uploader = self.uploader, prefixCls = self.editor.get('prefixCls'), data = S.trim(ev.data).replace(/\r|\n/g, ""), id = ev['file'].id;
  _$jscoverage['/dialog.js'].lineData[489]++;
  if (visit40_489_1(id)) {
    _$jscoverage['/dialog.js'].lineData[490]++;
    try {
      _$jscoverage['/dialog.js'].lineData[491]++;
      uploader['removeFile'](id);
    }    catch (e) {
}
  }
  _$jscoverage['/dialog.js'].lineData[496]++;
  if (visit41_496_1(!data)) 
    return;
  _$jscoverage['/dialog.js'].lineData[497]++;
  try {
    _$jscoverage['/dialog.js'].lineData[498]++;
    data = S.parseJson(data);
  }  catch (ex) {
  _$jscoverage['/dialog.js'].lineData[500]++;
  S.log("multiUpload _onUploadCompleteData error :");
  _$jscoverage['/dialog.js'].lineData[501]++;
  S.log(ex);
  _$jscoverage['/dialog.js'].lineData[502]++;
  throw ex;
}
  _$jscoverage['/dialog.js'].lineData[504]++;
  if (visit42_504_1(data.error)) {
    _$jscoverage['/dialog.js'].lineData[505]++;
    self._uploadError({
  id: id, 
  _custom: 1, 
  status: data.error});
    _$jscoverage['/dialog.js'].lineData[510]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[512]++;
  var tr = self._getFileTr(id);
  _$jscoverage['/dialog.js'].lineData[513]++;
  if (visit43_513_1(tr)) {
    _$jscoverage['/dialog.js'].lineData[514]++;
    tr.one(replacePrefix(".{prefixCls}editor-upload-insert", prefixCls)).show();
    _$jscoverage['/dialog.js'].lineData[515]++;
    self._tagComplete(tr, data['imgUrl']);
  }
  _$jscoverage['/dialog.js'].lineData[518]++;
  self._syncStatus();
}, 
  _onProgress: function(ev) {
  _$jscoverage['/dialog.js'].functionData[23]++;
  _$jscoverage['/dialog.js'].lineData[522]++;
  var fid = ev['file'].id, progressBars = this.progressBars, progess = Math.floor(ev['bytesLoaded'] * 100 / ev['bytesTotal']), bar = progressBars[fid];
  _$jscoverage['/dialog.js'].lineData[526]++;
  visit44_526_1(bar && bar.set("progress", progess));
}, 
  ddisable: function() {
  _$jscoverage['/dialog.js'].functionData[24]++;
  _$jscoverage['/dialog.js'].lineData[530]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[531]++;
  var prefixCls = self.editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[532]++;
  self.uploader['lock']();
  _$jscoverage['/dialog.js'].lineData[533]++;
  self.btn.addClass(replacePrefix("{prefixCls}editor-button-disabled", prefixCls), undefined);
  _$jscoverage['/dialog.js'].lineData[534]++;
  self.flashPos.offset({
  left: -9999, 
  top: -9999});
}, 
  denable: function() {
  _$jscoverage['/dialog.js'].functionData[25]++;
  _$jscoverage['/dialog.js'].lineData[540]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[541]++;
  var prefixCls = self.editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[542]++;
  self.uploader['unlock']();
  _$jscoverage['/dialog.js'].lineData[543]++;
  self.btn.removeClass(replacePrefix("{prefixCls}editor-button-disabled", prefixCls), undefined);
  _$jscoverage['/dialog.js'].lineData[544]++;
  self.flashPos.offset(self.btn.offset());
}, 
  _syncStatus: function() {
  _$jscoverage['/dialog.js'].functionData[26]++;
  _$jscoverage['/dialog.js'].lineData[547]++;
  var self = this, list = self._list, seq = 1, trs = list.all("tr");
  _$jscoverage['/dialog.js'].lineData[551]++;
  var prefixCls = self.editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[552]++;
  if (visit45_552_1(trs.length == 0)) {
    _$jscoverage['/dialog.js'].lineData[553]++;
    self._listWrap.hide();
  } else {
    _$jscoverage['/dialog.js'].lineData[555]++;
    list.all(replacePrefix(".{prefixCls}editor-upload-seq", prefixCls)).each(function(n) {
  _$jscoverage['/dialog.js'].functionData[27]++;
  _$jscoverage['/dialog.js'].lineData[556]++;
  n.html(seq++);
});
    _$jscoverage['/dialog.js'].lineData[558]++;
    var wait = 0;
    _$jscoverage['/dialog.js'].lineData[559]++;
    for (var i = 0; visit46_559_1(i < trs.length); i++) {
      _$jscoverage['/dialog.js'].lineData[560]++;
      var tr = $(trs[i]);
      _$jscoverage['/dialog.js'].lineData[561]++;
      if (visit47_561_1(!tr.attr("url"))) 
        wait++;
    }
    _$jscoverage['/dialog.js'].lineData[563]++;
    self.statusText.html("\u961f\u5217\u4e2d\u5269\u4f59" + wait + "\u5f20\u56fe\u7247" + "\uff0c\u70b9\u51fb\u786e\u5b9a\u4e0a\u4f20\uff0c\u5f00\u59cb\u4e0a\u4f20\u3002 ");
  }
  _$jscoverage['/dialog.js'].lineData[568]++;
  self._save();
}, 
  _restore: function() {
  _$jscoverage['/dialog.js'].functionData[28]++;
  _$jscoverage['/dialog.js'].lineData[572]++;
  var self = this, data = localStorage.getItem(KEY), tbl = self._list[0];
  _$jscoverage['/dialog.js'].lineData[575]++;
  if (visit48_575_1(!data)) 
    return;
  _$jscoverage['/dialog.js'].lineData[576]++;
  data = S.parseJson(S.urlDecode(data));
  _$jscoverage['/dialog.js'].lineData[577]++;
  for (var i = 0; visit49_577_1(i < data.length); i++) {
    _$jscoverage['/dialog.js'].lineData[578]++;
    var d = data[i];
    _$jscoverage['/dialog.js'].lineData[579]++;
    d.complete = 1;
    _$jscoverage['/dialog.js'].lineData[580]++;
    d.fid = "restore_" + i;
    _$jscoverage['/dialog.js'].lineData[581]++;
    var r = self._createFileTr(tbl, d);
    _$jscoverage['/dialog.js'].lineData[582]++;
    self._tagComplete(r, d.url);
  }
  _$jscoverage['/dialog.js'].lineData[584]++;
  if (visit50_584_1(d)) {
    _$jscoverage['/dialog.js'].lineData[585]++;
    self._listWrap.show();
    _$jscoverage['/dialog.js'].lineData[586]++;
    self._syncStatus();
  }
}, 
  _tagComplete: function(tr, url) {
  _$jscoverage['/dialog.js'].functionData[29]++;
  _$jscoverage['/dialog.js'].lineData[590]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[591]++;
  var prefixCls = self.editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[592]++;
  tr.attr("url", url);
  _$jscoverage['/dialog.js'].lineData[593]++;
  tr[0].className = replacePrefix("{prefixCls}editor-upload-complete", prefixCls);
}, 
  _save: function() {
  _$jscoverage['/dialog.js'].functionData[30]++;
  _$jscoverage['/dialog.js'].lineData[596]++;
  var self = this, list = self._list, trs = list.all("tr"), data = [];
  _$jscoverage['/dialog.js'].lineData[600]++;
  var prefixCls = self.editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[601]++;
  for (var i = 0; visit51_601_1(i < trs.length); i++) {
    _$jscoverage['/dialog.js'].lineData[602]++;
    var tr = $(trs[i]), url = tr.attr("url");
    _$jscoverage['/dialog.js'].lineData[604]++;
    if (visit52_604_1(url)) {
      _$jscoverage['/dialog.js'].lineData[605]++;
      var size = tr.one(replacePrefix(".{prefixCls}editor-upload-filesize", prefixCls)).html(), name = tr.one(replacePrefix(".{prefixCls}editor-upload-filename", prefixCls)).text();
      _$jscoverage['/dialog.js'].lineData[607]++;
      data.push({
  name: name, 
  size: size, 
  url: url});
    }
  }
  _$jscoverage['/dialog.js'].lineData[615]++;
  localStorage.setItem(KEY, encodeURIComponent(Json.stringify(data)));
}, 
  _getFilesSize: function(files) {
  _$jscoverage['/dialog.js'].functionData[31]++;
  _$jscoverage['/dialog.js'].lineData[619]++;
  var n = 0;
  _$jscoverage['/dialog.js'].lineData[620]++;
  for (var i in files) {
    _$jscoverage['/dialog.js'].lineData[622]++;
    n++;
  }
  _$jscoverage['/dialog.js'].lineData[624]++;
  return n;
}, 
  _createFileTr: function(tbl, f) {
  _$jscoverage['/dialog.js'].functionData[32]++;
  _$jscoverage['/dialog.js'].lineData[654]++;
  var self = this, editor = self.editor, progressBars = self.progressBars, id = f.fid, row = tbl.insertRow(-1);
  _$jscoverage['/dialog.js'].lineData[659]++;
  var prefixCls = self.editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[660]++;
  Dom.attr(row, "fid", id);
  _$jscoverage['/dialog.js'].lineData[661]++;
  var cell = row.insertCell(-1);
  _$jscoverage['/dialog.js'].lineData[662]++;
  Dom.attr(cell, "class", replacePrefix('{prefixCls}editor-upload-seq', prefixCls));
  _$jscoverage['/dialog.js'].lineData[663]++;
  cell = row.insertCell(-1);
  _$jscoverage['/dialog.js'].lineData[664]++;
  if (visit53_664_1(f.name.length > 18)) {
    _$jscoverage['/dialog.js'].lineData[665]++;
    f.name = f.name.substring(0, 18) + "...";
  }
  _$jscoverage['/dialog.js'].lineData[667]++;
  Dom.html(cell, "<div style='width:160px;overflow:hidden;'><div style='width:9999px;text-align:left;'>" + f.name + "</div></div>");
  _$jscoverage['/dialog.js'].lineData[668]++;
  Dom.attr(cell, "class", replacePrefix('{prefixCls}editor-upload-filename', prefixCls));
  _$jscoverage['/dialog.js'].lineData[669]++;
  cell = row.insertCell(-1);
  _$jscoverage['/dialog.js'].lineData[670]++;
  Dom.html(cell, f.size);
  _$jscoverage['/dialog.js'].lineData[671]++;
  Dom.attr(cell, "class", replacePrefix('{prefixCls}editor-upload-filesize', prefixCls));
  _$jscoverage['/dialog.js'].lineData[672]++;
  cell = row.insertCell(-1);
  _$jscoverage['/dialog.js'].lineData[673]++;
  Dom.attr(cell, "class", replacePrefix('{prefixCls}editor-upload-progress', prefixCls));
  _$jscoverage['/dialog.js'].lineData[674]++;
  cell = row.insertCell(-1);
  _$jscoverage['/dialog.js'].lineData[675]++;
  Dom.html(cell, replacePrefix("<a class='{prefixCls}editor-upload-moveup' href='#'>[\u4e0a\u79fb]</a> &nbsp; " + "<a class='{prefixCls}editor-upload-movedown' href='#'>[\u4e0b\u79fb]</a> &nbsp; " + "<a href='#' class='{prefixCls}editor-upload-insert' style='" + (f.complete ? "" : "display:none;") + "' " + ">" + "[\u63d2\u5165]</a> &nbsp; " + "<a href='#' class='{prefixCls}editor-upload-delete'>" + "[\u5220\u9664]" + "</a> &nbsp;", prefixCls));
  _$jscoverage['/dialog.js'].lineData[687]++;
  var rowNode = $(row);
  _$jscoverage['/dialog.js'].lineData[689]++;
  if (visit54_689_1(parseInt(f.size) > self._sizeLimit)) {
    _$jscoverage['/dialog.js'].lineData[690]++;
    self._uploadError({
  id: id, 
  _custom: 1, 
  status: PIC_SIZE_LIMIT_WARNING.replace(/n/, self._sizeLimit / 1000)});
    _$jscoverage['/dialog.js'].lineData[696]++;
    self.uploader['removeFile'](id);
  } else {
    _$jscoverage['/dialog.js'].lineData[699]++;
    progressBars[id] = new ProgressBar({
  container: rowNode.one(replacePrefix(".{prefixCls}editor-upload-progress", prefixCls)), 
  width: "100px", 
  height: "15px", 
  prefixCls: editor.get('prefixCls')});
    _$jscoverage['/dialog.js'].lineData[705]++;
    if (visit55_705_1(f.complete)) {
      _$jscoverage['/dialog.js'].lineData[706]++;
      progressBars[id].set("progress", 100);
    }
  }
  _$jscoverage['/dialog.js'].lineData[710]++;
  return rowNode;
}, 
  _onSelect: function(ev) {
  _$jscoverage['/dialog.js'].functionData[33]++;
  _$jscoverage['/dialog.js'].lineData[713]++;
  var self = this, uploader = self.uploader, list = self._list, curNum = 0, files = ev['fileList'], available = self._numberLimit, i;
  _$jscoverage['/dialog.js'].lineData[721]++;
  if (visit56_721_1(files)) {
    _$jscoverage['/dialog.js'].lineData[723]++;
    var trs = list.children("tr");
    _$jscoverage['/dialog.js'].lineData[724]++;
    for (i = 0; visit57_724_1(i < trs.length); i++) {
      _$jscoverage['/dialog.js'].lineData[725]++;
      var tr = trs[i], fid = Dom.attr(tr, "fid");
      _$jscoverage['/dialog.js'].lineData[726]++;
      visit58_726_1(fid && visit59_726_2(files[fid] && (delete files[fid])));
    }
    _$jscoverage['/dialog.js'].lineData[729]++;
    available = self._numberLimit - trs.length;
    _$jscoverage['/dialog.js'].lineData[731]++;
    var l = self._getFilesSize(files);
    _$jscoverage['/dialog.js'].lineData[733]++;
    if (visit60_733_1(l > available)) {
      _$jscoverage['/dialog.js'].lineData[734]++;
      alert(PIC_NUM_LIMIT_WARNING.replace(/n/, self._numberLimit));
    }
    _$jscoverage['/dialog.js'].lineData[737]++;
    if (visit61_737_1(l >= available)) {
      _$jscoverage['/dialog.js'].lineData[738]++;
      self.ddisable();
    }
    _$jscoverage['/dialog.js'].lineData[741]++;
    self._listWrap.show();
    _$jscoverage['/dialog.js'].lineData[742]++;
    var tbl = self._list[0];
    _$jscoverage['/dialog.js'].lineData[745]++;
    for (i in files) {
      _$jscoverage['/dialog.js'].lineData[747]++;
      curNum++;
      _$jscoverage['/dialog.js'].lineData[748]++;
      var f = files[i], size = Math.floor(f.size / 1000), id = f.id;
      _$jscoverage['/dialog.js'].lineData[752]++;
      if (visit62_752_1(curNum > available)) {
        _$jscoverage['/dialog.js'].lineData[754]++;
        uploader['removeFile'](id);
        _$jscoverage['/dialog.js'].lineData[755]++;
        continue;
      }
      _$jscoverage['/dialog.js'].lineData[757]++;
      self._createFileTr(tbl, {
  size: size + "k", 
  fid: id, 
  name: f.name});
    }
    _$jscoverage['/dialog.js'].lineData[763]++;
    self._syncStatus();
  }
}, 
  _ready: function() {
  _$jscoverage['/dialog.js'].functionData[34]++;
  _$jscoverage['/dialog.js'].lineData[768]++;
  var self = this, uploader = self.uploader, up = self.up, btn = self.btn, flashPos = self.flashPos, normParams = Editor.Utils.normParams;
  _$jscoverage['/dialog.js'].lineData[774]++;
  var prefixCls = self.editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[775]++;
  if (visit63_775_1("ready" != uploader['getReady']())) {
    _$jscoverage['/dialog.js'].lineData[776]++;
    self.tipSpan.html("\u60a8\u7684\u6d4f\u89c8\u5668\u4e0d\u652f\u6301\u8be5\u529f\u80fd\uff0c" + "\u8bf7\u5347\u7ea7\u5f53\u524d\u6d4f\u89c8\u5668\uff0c" + "\u5e76\u540c\u65f6 <a href='http://get.adobe.com/cn/flashplayer/'" + " target='_blank'>\u70b9\u6b64\u5347\u7ea7</a> flash \u63d2\u4ef6");
    _$jscoverage['/dialog.js'].lineData[780]++;
    flashPos.offset({
  left: -9999, 
  top: -9999});
    _$jscoverage['/dialog.js'].lineData[784]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[786]++;
  btn.removeClass(replacePrefix("{prefixCls}editor-button-disabled", prefixCls), undefined);
  _$jscoverage['/dialog.js'].lineData[787]++;
  flashPos.offset(btn.offset());
  _$jscoverage['/dialog.js'].lineData[788]++;
  uploader['setAllowMultipleFiles'](true);
  _$jscoverage['/dialog.js'].lineData[789]++;
  uploader['setFileFilters']([{
  ext: "*.jpeg;*.jpg;*.png;*.gif", 
  "desc": "\u56fe\u7247\u6587\u4ef6( png,jpg,jpeg,gif )"}]);
  _$jscoverage['/dialog.js'].lineData[795]++;
  up.detach();
  _$jscoverage['/dialog.js'].lineData[796]++;
  up.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[35]++;
  _$jscoverage['/dialog.js'].lineData[797]++;
  uploader['uploadAll'](self._ds, "POST", normParams(self._dsp), self._fileInput);
  _$jscoverage['/dialog.js'].lineData[801]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[803]++;
  self.addRes(up);
}});
  _$jscoverage['/dialog.js'].lineData[807]++;
  return MultiUploadDialog;
}, {
  requires: ['editor', 'overlay', 'component/plugin/drag', '../progressbar', '../dialog', '../flash-bridge', '../local-storage', 'swf']});
