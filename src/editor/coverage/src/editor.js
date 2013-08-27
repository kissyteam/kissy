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
if (! _$jscoverage['/editor.js']) {
  _$jscoverage['/editor.js'] = {};
  _$jscoverage['/editor.js'].lineData = [];
  _$jscoverage['/editor.js'].lineData[6] = 0;
  _$jscoverage['/editor.js'].lineData[7] = 0;
  _$jscoverage['/editor.js'].lineData[29] = 0;
  _$jscoverage['/editor.js'].lineData[34] = 0;
  _$jscoverage['/editor.js'].lineData[36] = 0;
  _$jscoverage['/editor.js'].lineData[38] = 0;
  _$jscoverage['/editor.js'].lineData[39] = 0;
  _$jscoverage['/editor.js'].lineData[40] = 0;
  _$jscoverage['/editor.js'].lineData[42] = 0;
  _$jscoverage['/editor.js'].lineData[47] = 0;
  _$jscoverage['/editor.js'].lineData[48] = 0;
  _$jscoverage['/editor.js'].lineData[49] = 0;
  _$jscoverage['/editor.js'].lineData[50] = 0;
  _$jscoverage['/editor.js'].lineData[51] = 0;
  _$jscoverage['/editor.js'].lineData[55] = 0;
  _$jscoverage['/editor.js'].lineData[60] = 0;
  _$jscoverage['/editor.js'].lineData[63] = 0;
  _$jscoverage['/editor.js'].lineData[66] = 0;
  _$jscoverage['/editor.js'].lineData[67] = 0;
  _$jscoverage['/editor.js'].lineData[69] = 0;
  _$jscoverage['/editor.js'].lineData[70] = 0;
  _$jscoverage['/editor.js'].lineData[74] = 0;
  _$jscoverage['/editor.js'].lineData[75] = 0;
  _$jscoverage['/editor.js'].lineData[79] = 0;
  _$jscoverage['/editor.js'].lineData[81] = 0;
  _$jscoverage['/editor.js'].lineData[82] = 0;
  _$jscoverage['/editor.js'].lineData[85] = 0;
  _$jscoverage['/editor.js'].lineData[86] = 0;
  _$jscoverage['/editor.js'].lineData[95] = 0;
  _$jscoverage['/editor.js'].lineData[99] = 0;
  _$jscoverage['/editor.js'].lineData[101] = 0;
  _$jscoverage['/editor.js'].lineData[103] = 0;
  _$jscoverage['/editor.js'].lineData[104] = 0;
  _$jscoverage['/editor.js'].lineData[108] = 0;
  _$jscoverage['/editor.js'].lineData[111] = 0;
  _$jscoverage['/editor.js'].lineData[112] = 0;
  _$jscoverage['/editor.js'].lineData[113] = 0;
  _$jscoverage['/editor.js'].lineData[114] = 0;
  _$jscoverage['/editor.js'].lineData[117] = 0;
  _$jscoverage['/editor.js'].lineData[118] = 0;
  _$jscoverage['/editor.js'].lineData[119] = 0;
  _$jscoverage['/editor.js'].lineData[121] = 0;
  _$jscoverage['/editor.js'].lineData[122] = 0;
  _$jscoverage['/editor.js'].lineData[128] = 0;
  _$jscoverage['/editor.js'].lineData[130] = 0;
  _$jscoverage['/editor.js'].lineData[131] = 0;
  _$jscoverage['/editor.js'].lineData[136] = 0;
  _$jscoverage['/editor.js'].lineData[139] = 0;
  _$jscoverage['/editor.js'].lineData[141] = 0;
  _$jscoverage['/editor.js'].lineData[142] = 0;
  _$jscoverage['/editor.js'].lineData[144] = 0;
  _$jscoverage['/editor.js'].lineData[145] = 0;
  _$jscoverage['/editor.js'].lineData[148] = 0;
  _$jscoverage['/editor.js'].lineData[149] = 0;
  _$jscoverage['/editor.js'].lineData[153] = 0;
  _$jscoverage['/editor.js'].lineData[158] = 0;
  _$jscoverage['/editor.js'].lineData[161] = 0;
  _$jscoverage['/editor.js'].lineData[164] = 0;
  _$jscoverage['/editor.js'].lineData[165] = 0;
  _$jscoverage['/editor.js'].lineData[169] = 0;
  _$jscoverage['/editor.js'].lineData[171] = 0;
  _$jscoverage['/editor.js'].lineData[173] = 0;
  _$jscoverage['/editor.js'].lineData[175] = 0;
  _$jscoverage['/editor.js'].lineData[177] = 0;
  _$jscoverage['/editor.js'].lineData[180] = 0;
  _$jscoverage['/editor.js'].lineData[181] = 0;
  _$jscoverage['/editor.js'].lineData[182] = 0;
  _$jscoverage['/editor.js'].lineData[186] = 0;
  _$jscoverage['/editor.js'].lineData[187] = 0;
  _$jscoverage['/editor.js'].lineData[194] = 0;
  _$jscoverage['/editor.js'].lineData[202] = 0;
  _$jscoverage['/editor.js'].lineData[210] = 0;
  _$jscoverage['/editor.js'].lineData[219] = 0;
  _$jscoverage['/editor.js'].lineData[220] = 0;
  _$jscoverage['/editor.js'].lineData[222] = 0;
  _$jscoverage['/editor.js'].lineData[223] = 0;
  _$jscoverage['/editor.js'].lineData[236] = 0;
  _$jscoverage['/editor.js'].lineData[244] = 0;
  _$jscoverage['/editor.js'].lineData[253] = 0;
  _$jscoverage['/editor.js'].lineData[256] = 0;
  _$jscoverage['/editor.js'].lineData[257] = 0;
  _$jscoverage['/editor.js'].lineData[258] = 0;
  _$jscoverage['/editor.js'].lineData[259] = 0;
  _$jscoverage['/editor.js'].lineData[261] = 0;
  _$jscoverage['/editor.js'].lineData[262] = 0;
  _$jscoverage['/editor.js'].lineData[272] = 0;
  _$jscoverage['/editor.js'].lineData[276] = 0;
  _$jscoverage['/editor.js'].lineData[279] = 0;
  _$jscoverage['/editor.js'].lineData[280] = 0;
  _$jscoverage['/editor.js'].lineData[282] = 0;
  _$jscoverage['/editor.js'].lineData[283] = 0;
  _$jscoverage['/editor.js'].lineData[285] = 0;
  _$jscoverage['/editor.js'].lineData[288] = 0;
  _$jscoverage['/editor.js'].lineData[289] = 0;
  _$jscoverage['/editor.js'].lineData[291] = 0;
  _$jscoverage['/editor.js'].lineData[293] = 0;
  _$jscoverage['/editor.js'].lineData[297] = 0;
  _$jscoverage['/editor.js'].lineData[298] = 0;
  _$jscoverage['/editor.js'].lineData[300] = 0;
  _$jscoverage['/editor.js'].lineData[304] = 0;
  _$jscoverage['/editor.js'].lineData[311] = 0;
  _$jscoverage['/editor.js'].lineData[312] = 0;
  _$jscoverage['/editor.js'].lineData[320] = 0;
  _$jscoverage['/editor.js'].lineData[328] = 0;
  _$jscoverage['/editor.js'].lineData[332] = 0;
  _$jscoverage['/editor.js'].lineData[333] = 0;
  _$jscoverage['/editor.js'].lineData[334] = 0;
  _$jscoverage['/editor.js'].lineData[335] = 0;
  _$jscoverage['/editor.js'].lineData[336] = 0;
  _$jscoverage['/editor.js'].lineData[338] = 0;
  _$jscoverage['/editor.js'].lineData[345] = 0;
  _$jscoverage['/editor.js'].lineData[348] = 0;
  _$jscoverage['/editor.js'].lineData[349] = 0;
  _$jscoverage['/editor.js'].lineData[351] = 0;
  _$jscoverage['/editor.js'].lineData[352] = 0;
  _$jscoverage['/editor.js'].lineData[354] = 0;
  _$jscoverage['/editor.js'].lineData[357] = 0;
  _$jscoverage['/editor.js'].lineData[361] = 0;
  _$jscoverage['/editor.js'].lineData[363] = 0;
  _$jscoverage['/editor.js'].lineData[364] = 0;
  _$jscoverage['/editor.js'].lineData[368] = 0;
  _$jscoverage['/editor.js'].lineData[375] = 0;
  _$jscoverage['/editor.js'].lineData[377] = 0;
  _$jscoverage['/editor.js'].lineData[378] = 0;
  _$jscoverage['/editor.js'].lineData[387] = 0;
  _$jscoverage['/editor.js'].lineData[390] = 0;
  _$jscoverage['/editor.js'].lineData[391] = 0;
  _$jscoverage['/editor.js'].lineData[392] = 0;
  _$jscoverage['/editor.js'].lineData[393] = 0;
  _$jscoverage['/editor.js'].lineData[402] = 0;
  _$jscoverage['/editor.js'].lineData[410] = 0;
  _$jscoverage['/editor.js'].lineData[413] = 0;
  _$jscoverage['/editor.js'].lineData[414] = 0;
  _$jscoverage['/editor.js'].lineData[415] = 0;
  _$jscoverage['/editor.js'].lineData[416] = 0;
  _$jscoverage['/editor.js'].lineData[417] = 0;
  _$jscoverage['/editor.js'].lineData[418] = 0;
  _$jscoverage['/editor.js'].lineData[426] = 0;
  _$jscoverage['/editor.js'].lineData[429] = 0;
  _$jscoverage['/editor.js'].lineData[430] = 0;
  _$jscoverage['/editor.js'].lineData[431] = 0;
  _$jscoverage['/editor.js'].lineData[434] = 0;
  _$jscoverage['/editor.js'].lineData[436] = 0;
  _$jscoverage['/editor.js'].lineData[437] = 0;
  _$jscoverage['/editor.js'].lineData[447] = 0;
  _$jscoverage['/editor.js'].lineData[448] = 0;
  _$jscoverage['/editor.js'].lineData[449] = 0;
  _$jscoverage['/editor.js'].lineData[450] = 0;
  _$jscoverage['/editor.js'].lineData[455] = 0;
  _$jscoverage['/editor.js'].lineData[462] = 0;
  _$jscoverage['/editor.js'].lineData[463] = 0;
  _$jscoverage['/editor.js'].lineData[464] = 0;
  _$jscoverage['/editor.js'].lineData[467] = 0;
  _$jscoverage['/editor.js'].lineData[468] = 0;
  _$jscoverage['/editor.js'].lineData[469] = 0;
  _$jscoverage['/editor.js'].lineData[470] = 0;
  _$jscoverage['/editor.js'].lineData[472] = 0;
  _$jscoverage['/editor.js'].lineData[473] = 0;
  _$jscoverage['/editor.js'].lineData[474] = 0;
  _$jscoverage['/editor.js'].lineData[488] = 0;
  _$jscoverage['/editor.js'].lineData[489] = 0;
  _$jscoverage['/editor.js'].lineData[490] = 0;
  _$jscoverage['/editor.js'].lineData[498] = 0;
  _$jscoverage['/editor.js'].lineData[500] = 0;
  _$jscoverage['/editor.js'].lineData[501] = 0;
  _$jscoverage['/editor.js'].lineData[504] = 0;
  _$jscoverage['/editor.js'].lineData[506] = 0;
  _$jscoverage['/editor.js'].lineData[520] = 0;
  _$jscoverage['/editor.js'].lineData[521] = 0;
  _$jscoverage['/editor.js'].lineData[524] = 0;
  _$jscoverage['/editor.js'].lineData[526] = 0;
  _$jscoverage['/editor.js'].lineData[527] = 0;
  _$jscoverage['/editor.js'].lineData[530] = 0;
  _$jscoverage['/editor.js'].lineData[531] = 0;
  _$jscoverage['/editor.js'].lineData[534] = 0;
  _$jscoverage['/editor.js'].lineData[535] = 0;
  _$jscoverage['/editor.js'].lineData[539] = 0;
  _$jscoverage['/editor.js'].lineData[540] = 0;
  _$jscoverage['/editor.js'].lineData[543] = 0;
  _$jscoverage['/editor.js'].lineData[546] = 0;
  _$jscoverage['/editor.js'].lineData[547] = 0;
  _$jscoverage['/editor.js'].lineData[548] = 0;
  _$jscoverage['/editor.js'].lineData[549] = 0;
  _$jscoverage['/editor.js'].lineData[552] = 0;
  _$jscoverage['/editor.js'].lineData[555] = 0;
  _$jscoverage['/editor.js'].lineData[558] = 0;
  _$jscoverage['/editor.js'].lineData[559] = 0;
  _$jscoverage['/editor.js'].lineData[562] = 0;
  _$jscoverage['/editor.js'].lineData[563] = 0;
  _$jscoverage['/editor.js'].lineData[569] = 0;
  _$jscoverage['/editor.js'].lineData[570] = 0;
  _$jscoverage['/editor.js'].lineData[579] = 0;
  _$jscoverage['/editor.js'].lineData[583] = 0;
  _$jscoverage['/editor.js'].lineData[584] = 0;
  _$jscoverage['/editor.js'].lineData[587] = 0;
  _$jscoverage['/editor.js'].lineData[588] = 0;
  _$jscoverage['/editor.js'].lineData[591] = 0;
  _$jscoverage['/editor.js'].lineData[592] = 0;
  _$jscoverage['/editor.js'].lineData[596] = 0;
  _$jscoverage['/editor.js'].lineData[597] = 0;
  _$jscoverage['/editor.js'].lineData[598] = 0;
  _$jscoverage['/editor.js'].lineData[599] = 0;
  _$jscoverage['/editor.js'].lineData[601] = 0;
  _$jscoverage['/editor.js'].lineData[602] = 0;
  _$jscoverage['/editor.js'].lineData[604] = 0;
  _$jscoverage['/editor.js'].lineData[611] = 0;
  _$jscoverage['/editor.js'].lineData[612] = 0;
  _$jscoverage['/editor.js'].lineData[614] = 0;
  _$jscoverage['/editor.js'].lineData[617] = 0;
  _$jscoverage['/editor.js'].lineData[618] = 0;
  _$jscoverage['/editor.js'].lineData[620] = 0;
  _$jscoverage['/editor.js'].lineData[622] = 0;
  _$jscoverage['/editor.js'].lineData[623] = 0;
  _$jscoverage['/editor.js'].lineData[624] = 0;
  _$jscoverage['/editor.js'].lineData[626] = 0;
  _$jscoverage['/editor.js'].lineData[627] = 0;
  _$jscoverage['/editor.js'].lineData[629] = 0;
  _$jscoverage['/editor.js'].lineData[635] = 0;
  _$jscoverage['/editor.js'].lineData[636] = 0;
  _$jscoverage['/editor.js'].lineData[638] = 0;
  _$jscoverage['/editor.js'].lineData[642] = 0;
  _$jscoverage['/editor.js'].lineData[643] = 0;
  _$jscoverage['/editor.js'].lineData[644] = 0;
  _$jscoverage['/editor.js'].lineData[645] = 0;
  _$jscoverage['/editor.js'].lineData[646] = 0;
  _$jscoverage['/editor.js'].lineData[647] = 0;
  _$jscoverage['/editor.js'].lineData[648] = 0;
  _$jscoverage['/editor.js'].lineData[649] = 0;
  _$jscoverage['/editor.js'].lineData[650] = 0;
  _$jscoverage['/editor.js'].lineData[652] = 0;
  _$jscoverage['/editor.js'].lineData[653] = 0;
  _$jscoverage['/editor.js'].lineData[655] = 0;
  _$jscoverage['/editor.js'].lineData[656] = 0;
  _$jscoverage['/editor.js'].lineData[658] = 0;
  _$jscoverage['/editor.js'].lineData[659] = 0;
  _$jscoverage['/editor.js'].lineData[660] = 0;
  _$jscoverage['/editor.js'].lineData[661] = 0;
  _$jscoverage['/editor.js'].lineData[662] = 0;
  _$jscoverage['/editor.js'].lineData[671] = 0;
  _$jscoverage['/editor.js'].lineData[673] = 0;
  _$jscoverage['/editor.js'].lineData[679] = 0;
  _$jscoverage['/editor.js'].lineData[681] = 0;
  _$jscoverage['/editor.js'].lineData[683] = 0;
  _$jscoverage['/editor.js'].lineData[685] = 0;
  _$jscoverage['/editor.js'].lineData[707] = 0;
  _$jscoverage['/editor.js'].lineData[709] = 0;
  _$jscoverage['/editor.js'].lineData[712] = 0;
  _$jscoverage['/editor.js'].lineData[713] = 0;
  _$jscoverage['/editor.js'].lineData[714] = 0;
  _$jscoverage['/editor.js'].lineData[718] = 0;
  _$jscoverage['/editor.js'].lineData[720] = 0;
  _$jscoverage['/editor.js'].lineData[721] = 0;
  _$jscoverage['/editor.js'].lineData[723] = 0;
  _$jscoverage['/editor.js'].lineData[724] = 0;
  _$jscoverage['/editor.js'].lineData[726] = 0;
  _$jscoverage['/editor.js'].lineData[733] = 0;
  _$jscoverage['/editor.js'].lineData[744] = 0;
  _$jscoverage['/editor.js'].lineData[745] = 0;
  _$jscoverage['/editor.js'].lineData[752] = 0;
  _$jscoverage['/editor.js'].lineData[753] = 0;
  _$jscoverage['/editor.js'].lineData[757] = 0;
  _$jscoverage['/editor.js'].lineData[758] = 0;
  _$jscoverage['/editor.js'].lineData[765] = 0;
  _$jscoverage['/editor.js'].lineData[771] = 0;
  _$jscoverage['/editor.js'].lineData[780] = 0;
  _$jscoverage['/editor.js'].lineData[781] = 0;
  _$jscoverage['/editor.js'].lineData[782] = 0;
  _$jscoverage['/editor.js'].lineData[783] = 0;
  _$jscoverage['/editor.js'].lineData[784] = 0;
  _$jscoverage['/editor.js'].lineData[791] = 0;
  _$jscoverage['/editor.js'].lineData[792] = 0;
  _$jscoverage['/editor.js'].lineData[793] = 0;
  _$jscoverage['/editor.js'].lineData[797] = 0;
  _$jscoverage['/editor.js'].lineData[799] = 0;
  _$jscoverage['/editor.js'].lineData[801] = 0;
  _$jscoverage['/editor.js'].lineData[802] = 0;
  _$jscoverage['/editor.js'].lineData[803] = 0;
  _$jscoverage['/editor.js'].lineData[809] = 0;
  _$jscoverage['/editor.js'].lineData[810] = 0;
  _$jscoverage['/editor.js'].lineData[811] = 0;
  _$jscoverage['/editor.js'].lineData[814] = 0;
  _$jscoverage['/editor.js'].lineData[824] = 0;
  _$jscoverage['/editor.js'].lineData[825] = 0;
  _$jscoverage['/editor.js'].lineData[826] = 0;
  _$jscoverage['/editor.js'].lineData[828] = 0;
  _$jscoverage['/editor.js'].lineData[830] = 0;
  _$jscoverage['/editor.js'].lineData[831] = 0;
  _$jscoverage['/editor.js'].lineData[832] = 0;
  _$jscoverage['/editor.js'].lineData[834] = 0;
  _$jscoverage['/editor.js'].lineData[835] = 0;
  _$jscoverage['/editor.js'].lineData[841] = 0;
  _$jscoverage['/editor.js'].lineData[842] = 0;
  _$jscoverage['/editor.js'].lineData[843] = 0;
  _$jscoverage['/editor.js'].lineData[845] = 0;
  _$jscoverage['/editor.js'].lineData[850] = 0;
  _$jscoverage['/editor.js'].lineData[851] = 0;
  _$jscoverage['/editor.js'].lineData[861] = 0;
  _$jscoverage['/editor.js'].lineData[862] = 0;
  _$jscoverage['/editor.js'].lineData[863] = 0;
  _$jscoverage['/editor.js'].lineData[864] = 0;
  _$jscoverage['/editor.js'].lineData[865] = 0;
  _$jscoverage['/editor.js'].lineData[869] = 0;
  _$jscoverage['/editor.js'].lineData[870] = 0;
  _$jscoverage['/editor.js'].lineData[871] = 0;
  _$jscoverage['/editor.js'].lineData[872] = 0;
  _$jscoverage['/editor.js'].lineData[878] = 0;
  _$jscoverage['/editor.js'].lineData[879] = 0;
  _$jscoverage['/editor.js'].lineData[880] = 0;
  _$jscoverage['/editor.js'].lineData[887] = 0;
  _$jscoverage['/editor.js'].lineData[888] = 0;
  _$jscoverage['/editor.js'].lineData[890] = 0;
  _$jscoverage['/editor.js'].lineData[891] = 0;
  _$jscoverage['/editor.js'].lineData[892] = 0;
  _$jscoverage['/editor.js'].lineData[894] = 0;
  _$jscoverage['/editor.js'].lineData[895] = 0;
  _$jscoverage['/editor.js'].lineData[896] = 0;
  _$jscoverage['/editor.js'].lineData[900] = 0;
  _$jscoverage['/editor.js'].lineData[906] = 0;
  _$jscoverage['/editor.js'].lineData[907] = 0;
  _$jscoverage['/editor.js'].lineData[909] = 0;
  _$jscoverage['/editor.js'].lineData[910] = 0;
  _$jscoverage['/editor.js'].lineData[913] = 0;
  _$jscoverage['/editor.js'].lineData[916] = 0;
  _$jscoverage['/editor.js'].lineData[920] = 0;
  _$jscoverage['/editor.js'].lineData[921] = 0;
  _$jscoverage['/editor.js'].lineData[922] = 0;
  _$jscoverage['/editor.js'].lineData[927] = 0;
  _$jscoverage['/editor.js'].lineData[933] = 0;
  _$jscoverage['/editor.js'].lineData[934] = 0;
  _$jscoverage['/editor.js'].lineData[936] = 0;
  _$jscoverage['/editor.js'].lineData[937] = 0;
  _$jscoverage['/editor.js'].lineData[939] = 0;
  _$jscoverage['/editor.js'].lineData[941] = 0;
  _$jscoverage['/editor.js'].lineData[944] = 0;
  _$jscoverage['/editor.js'].lineData[946] = 0;
  _$jscoverage['/editor.js'].lineData[947] = 0;
  _$jscoverage['/editor.js'].lineData[948] = 0;
  _$jscoverage['/editor.js'].lineData[949] = 0;
  _$jscoverage['/editor.js'].lineData[957] = 0;
  _$jscoverage['/editor.js'].lineData[958] = 0;
  _$jscoverage['/editor.js'].lineData[959] = 0;
  _$jscoverage['/editor.js'].lineData[960] = 0;
  _$jscoverage['/editor.js'].lineData[961] = 0;
  _$jscoverage['/editor.js'].lineData[962] = 0;
  _$jscoverage['/editor.js'].lineData[970] = 0;
  _$jscoverage['/editor.js'].lineData[971] = 0;
  _$jscoverage['/editor.js'].lineData[972] = 0;
  _$jscoverage['/editor.js'].lineData[973] = 0;
  _$jscoverage['/editor.js'].lineData[974] = 0;
  _$jscoverage['/editor.js'].lineData[980] = 0;
  _$jscoverage['/editor.js'].lineData[981] = 0;
  _$jscoverage['/editor.js'].lineData[982] = 0;
  _$jscoverage['/editor.js'].lineData[983] = 0;
  _$jscoverage['/editor.js'].lineData[985] = 0;
  _$jscoverage['/editor.js'].lineData[991] = 0;
  _$jscoverage['/editor.js'].lineData[995] = 0;
  _$jscoverage['/editor.js'].lineData[996] = 0;
  _$jscoverage['/editor.js'].lineData[999] = 0;
  _$jscoverage['/editor.js'].lineData[1000] = 0;
  _$jscoverage['/editor.js'].lineData[1001] = 0;
  _$jscoverage['/editor.js'].lineData[1002] = 0;
  _$jscoverage['/editor.js'].lineData[1006] = 0;
  _$jscoverage['/editor.js'].lineData[1032] = 0;
  _$jscoverage['/editor.js'].lineData[1033] = 0;
  _$jscoverage['/editor.js'].lineData[1036] = 0;
  _$jscoverage['/editor.js'].lineData[1037] = 0;
  _$jscoverage['/editor.js'].lineData[1044] = 0;
  _$jscoverage['/editor.js'].lineData[1045] = 0;
  _$jscoverage['/editor.js'].lineData[1053] = 0;
  _$jscoverage['/editor.js'].lineData[1058] = 0;
  _$jscoverage['/editor.js'].lineData[1061] = 0;
  _$jscoverage['/editor.js'].lineData[1062] = 0;
  _$jscoverage['/editor.js'].lineData[1063] = 0;
  _$jscoverage['/editor.js'].lineData[1066] = 0;
  _$jscoverage['/editor.js'].lineData[1067] = 0;
  _$jscoverage['/editor.js'].lineData[1068] = 0;
  _$jscoverage['/editor.js'].lineData[1069] = 0;
  _$jscoverage['/editor.js'].lineData[1070] = 0;
  _$jscoverage['/editor.js'].lineData[1071] = 0;
  _$jscoverage['/editor.js'].lineData[1073] = 0;
  _$jscoverage['/editor.js'].lineData[1074] = 0;
  _$jscoverage['/editor.js'].lineData[1075] = 0;
  _$jscoverage['/editor.js'].lineData[1079] = 0;
  _$jscoverage['/editor.js'].lineData[1083] = 0;
  _$jscoverage['/editor.js'].lineData[1084] = 0;
  _$jscoverage['/editor.js'].lineData[1085] = 0;
  _$jscoverage['/editor.js'].lineData[1087] = 0;
  _$jscoverage['/editor.js'].lineData[1092] = 0;
  _$jscoverage['/editor.js'].lineData[1093] = 0;
  _$jscoverage['/editor.js'].lineData[1095] = 0;
  _$jscoverage['/editor.js'].lineData[1096] = 0;
  _$jscoverage['/editor.js'].lineData[1097] = 0;
  _$jscoverage['/editor.js'].lineData[1099] = 0;
  _$jscoverage['/editor.js'].lineData[1100] = 0;
  _$jscoverage['/editor.js'].lineData[1101] = 0;
  _$jscoverage['/editor.js'].lineData[1105] = 0;
  _$jscoverage['/editor.js'].lineData[1109] = 0;
  _$jscoverage['/editor.js'].lineData[1110] = 0;
  _$jscoverage['/editor.js'].lineData[1111] = 0;
  _$jscoverage['/editor.js'].lineData[1113] = 0;
  _$jscoverage['/editor.js'].lineData[1119] = 0;
  _$jscoverage['/editor.js'].lineData[1120] = 0;
  _$jscoverage['/editor.js'].lineData[1122] = 0;
  _$jscoverage['/editor.js'].lineData[1127] = 0;
}
if (! _$jscoverage['/editor.js'].functionData) {
  _$jscoverage['/editor.js'].functionData = [];
  _$jscoverage['/editor.js'].functionData[0] = 0;
  _$jscoverage['/editor.js'].functionData[1] = 0;
  _$jscoverage['/editor.js'].functionData[2] = 0;
  _$jscoverage['/editor.js'].functionData[3] = 0;
  _$jscoverage['/editor.js'].functionData[4] = 0;
  _$jscoverage['/editor.js'].functionData[5] = 0;
  _$jscoverage['/editor.js'].functionData[6] = 0;
  _$jscoverage['/editor.js'].functionData[7] = 0;
  _$jscoverage['/editor.js'].functionData[8] = 0;
  _$jscoverage['/editor.js'].functionData[9] = 0;
  _$jscoverage['/editor.js'].functionData[10] = 0;
  _$jscoverage['/editor.js'].functionData[11] = 0;
  _$jscoverage['/editor.js'].functionData[12] = 0;
  _$jscoverage['/editor.js'].functionData[13] = 0;
  _$jscoverage['/editor.js'].functionData[14] = 0;
  _$jscoverage['/editor.js'].functionData[15] = 0;
  _$jscoverage['/editor.js'].functionData[16] = 0;
  _$jscoverage['/editor.js'].functionData[17] = 0;
  _$jscoverage['/editor.js'].functionData[18] = 0;
  _$jscoverage['/editor.js'].functionData[19] = 0;
  _$jscoverage['/editor.js'].functionData[20] = 0;
  _$jscoverage['/editor.js'].functionData[21] = 0;
  _$jscoverage['/editor.js'].functionData[22] = 0;
  _$jscoverage['/editor.js'].functionData[23] = 0;
  _$jscoverage['/editor.js'].functionData[24] = 0;
  _$jscoverage['/editor.js'].functionData[25] = 0;
  _$jscoverage['/editor.js'].functionData[26] = 0;
  _$jscoverage['/editor.js'].functionData[27] = 0;
  _$jscoverage['/editor.js'].functionData[28] = 0;
  _$jscoverage['/editor.js'].functionData[29] = 0;
  _$jscoverage['/editor.js'].functionData[30] = 0;
  _$jscoverage['/editor.js'].functionData[31] = 0;
  _$jscoverage['/editor.js'].functionData[32] = 0;
  _$jscoverage['/editor.js'].functionData[33] = 0;
  _$jscoverage['/editor.js'].functionData[34] = 0;
  _$jscoverage['/editor.js'].functionData[35] = 0;
  _$jscoverage['/editor.js'].functionData[36] = 0;
  _$jscoverage['/editor.js'].functionData[37] = 0;
  _$jscoverage['/editor.js'].functionData[38] = 0;
  _$jscoverage['/editor.js'].functionData[39] = 0;
  _$jscoverage['/editor.js'].functionData[40] = 0;
  _$jscoverage['/editor.js'].functionData[41] = 0;
  _$jscoverage['/editor.js'].functionData[42] = 0;
  _$jscoverage['/editor.js'].functionData[43] = 0;
  _$jscoverage['/editor.js'].functionData[44] = 0;
  _$jscoverage['/editor.js'].functionData[45] = 0;
  _$jscoverage['/editor.js'].functionData[46] = 0;
  _$jscoverage['/editor.js'].functionData[47] = 0;
  _$jscoverage['/editor.js'].functionData[48] = 0;
  _$jscoverage['/editor.js'].functionData[49] = 0;
  _$jscoverage['/editor.js'].functionData[50] = 0;
  _$jscoverage['/editor.js'].functionData[51] = 0;
  _$jscoverage['/editor.js'].functionData[52] = 0;
  _$jscoverage['/editor.js'].functionData[53] = 0;
  _$jscoverage['/editor.js'].functionData[54] = 0;
  _$jscoverage['/editor.js'].functionData[55] = 0;
  _$jscoverage['/editor.js'].functionData[56] = 0;
  _$jscoverage['/editor.js'].functionData[57] = 0;
  _$jscoverage['/editor.js'].functionData[58] = 0;
  _$jscoverage['/editor.js'].functionData[59] = 0;
  _$jscoverage['/editor.js'].functionData[60] = 0;
  _$jscoverage['/editor.js'].functionData[61] = 0;
  _$jscoverage['/editor.js'].functionData[62] = 0;
  _$jscoverage['/editor.js'].functionData[63] = 0;
  _$jscoverage['/editor.js'].functionData[64] = 0;
  _$jscoverage['/editor.js'].functionData[65] = 0;
  _$jscoverage['/editor.js'].functionData[66] = 0;
  _$jscoverage['/editor.js'].functionData[67] = 0;
  _$jscoverage['/editor.js'].functionData[68] = 0;
  _$jscoverage['/editor.js'].functionData[69] = 0;
  _$jscoverage['/editor.js'].functionData[70] = 0;
  _$jscoverage['/editor.js'].functionData[71] = 0;
  _$jscoverage['/editor.js'].functionData[72] = 0;
  _$jscoverage['/editor.js'].functionData[73] = 0;
  _$jscoverage['/editor.js'].functionData[74] = 0;
  _$jscoverage['/editor.js'].functionData[75] = 0;
}
if (! _$jscoverage['/editor.js'].branchData) {
  _$jscoverage['/editor.js'].branchData = {};
  _$jscoverage['/editor.js'].branchData['60'] = [];
  _$jscoverage['/editor.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['61'] = [];
  _$jscoverage['/editor.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['69'] = [];
  _$jscoverage['/editor.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['75'] = [];
  _$jscoverage['/editor.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['101'] = [];
  _$jscoverage['/editor.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['102'] = [];
  _$jscoverage['/editor.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['102'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['111'] = [];
  _$jscoverage['/editor.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['117'] = [];
  _$jscoverage['/editor.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['130'] = [];
  _$jscoverage['/editor.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['139'] = [];
  _$jscoverage['/editor.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['144'] = [];
  _$jscoverage['/editor.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['158'] = [];
  _$jscoverage['/editor.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['159'] = [];
  _$jscoverage['/editor.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['164'] = [];
  _$jscoverage['/editor.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['181'] = [];
  _$jscoverage['/editor.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['258'] = [];
  _$jscoverage['/editor.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['279'] = [];
  _$jscoverage['/editor.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['282'] = [];
  _$jscoverage['/editor.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['282'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['288'] = [];
  _$jscoverage['/editor.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['297'] = [];
  _$jscoverage['/editor.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['332'] = [];
  _$jscoverage['/editor.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['348'] = [];
  _$jscoverage['/editor.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['354'] = [];
  _$jscoverage['/editor.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['357'] = [];
  _$jscoverage['/editor.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['357'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['361'] = [];
  _$jscoverage['/editor.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['389'] = [];
  _$jscoverage['/editor.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['392'] = [];
  _$jscoverage['/editor.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['430'] = [];
  _$jscoverage['/editor.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['436'] = [];
  _$jscoverage['/editor.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['449'] = [];
  _$jscoverage['/editor.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['463'] = [];
  _$jscoverage['/editor.js'].branchData['463'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['469'] = [];
  _$jscoverage['/editor.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['472'] = [];
  _$jscoverage['/editor.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['500'] = [];
  _$jscoverage['/editor.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['512'] = [];
  _$jscoverage['/editor.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['520'] = [];
  _$jscoverage['/editor.js'].branchData['520'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['520'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['526'] = [];
  _$jscoverage['/editor.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['530'] = [];
  _$jscoverage['/editor.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['530'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['534'] = [];
  _$jscoverage['/editor.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['539'] = [];
  _$jscoverage['/editor.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['546'] = [];
  _$jscoverage['/editor.js'].branchData['546'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['549'] = [];
  _$jscoverage['/editor.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['549'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['549'][3] = new BranchData();
  _$jscoverage['/editor.js'].branchData['552'] = [];
  _$jscoverage['/editor.js'].branchData['552'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['553'] = [];
  _$jscoverage['/editor.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['562'] = [];
  _$jscoverage['/editor.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['562'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['583'] = [];
  _$jscoverage['/editor.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['587'] = [];
  _$jscoverage['/editor.js'].branchData['587'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['596'] = [];
  _$jscoverage['/editor.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['598'] = [];
  _$jscoverage['/editor.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['617'] = [];
  _$jscoverage['/editor.js'].branchData['617'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['620'] = [];
  _$jscoverage['/editor.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['620'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['620'][3] = new BranchData();
  _$jscoverage['/editor.js'].branchData['622'] = [];
  _$jscoverage['/editor.js'].branchData['622'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['643'] = [];
  _$jscoverage['/editor.js'].branchData['643'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['645'] = [];
  _$jscoverage['/editor.js'].branchData['645'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['649'] = [];
  _$jscoverage['/editor.js'].branchData['649'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['650'] = [];
  _$jscoverage['/editor.js'].branchData['650'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['652'] = [];
  _$jscoverage['/editor.js'].branchData['652'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['653'] = [];
  _$jscoverage['/editor.js'].branchData['653'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['655'] = [];
  _$jscoverage['/editor.js'].branchData['655'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['658'] = [];
  _$jscoverage['/editor.js'].branchData['658'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['707'] = [];
  _$jscoverage['/editor.js'].branchData['707'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['720'] = [];
  _$jscoverage['/editor.js'].branchData['720'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['723'] = [];
  _$jscoverage['/editor.js'].branchData['723'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['742'] = [];
  _$jscoverage['/editor.js'].branchData['742'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['753'] = [];
  _$jscoverage['/editor.js'].branchData['753'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['757'] = [];
  _$jscoverage['/editor.js'].branchData['757'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['780'] = [];
  _$jscoverage['/editor.js'].branchData['780'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['782'] = [];
  _$jscoverage['/editor.js'].branchData['782'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['799'] = [];
  _$jscoverage['/editor.js'].branchData['799'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['811'] = [];
  _$jscoverage['/editor.js'].branchData['811'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['812'] = [];
  _$jscoverage['/editor.js'].branchData['812'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['812'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['834'] = [];
  _$jscoverage['/editor.js'].branchData['834'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['845'] = [];
  _$jscoverage['/editor.js'].branchData['845'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['861'] = [];
  _$jscoverage['/editor.js'].branchData['861'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['864'] = [];
  _$jscoverage['/editor.js'].branchData['864'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['871'] = [];
  _$jscoverage['/editor.js'].branchData['871'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['878'] = [];
  _$jscoverage['/editor.js'].branchData['878'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['878'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['891'] = [];
  _$jscoverage['/editor.js'].branchData['891'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['906'] = [];
  _$jscoverage['/editor.js'].branchData['906'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['909'] = [];
  _$jscoverage['/editor.js'].branchData['909'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['916'] = [];
  _$jscoverage['/editor.js'].branchData['916'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['921'] = [];
  _$jscoverage['/editor.js'].branchData['921'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['927'] = [];
  _$jscoverage['/editor.js'].branchData['927'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['936'] = [];
  _$jscoverage['/editor.js'].branchData['936'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['939'] = [];
  _$jscoverage['/editor.js'].branchData['939'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['957'] = [];
  _$jscoverage['/editor.js'].branchData['957'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['960'] = [];
  _$jscoverage['/editor.js'].branchData['960'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['970'] = [];
  _$jscoverage['/editor.js'].branchData['970'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['973'] = [];
  _$jscoverage['/editor.js'].branchData['973'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['980'] = [];
  _$jscoverage['/editor.js'].branchData['980'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['983'] = [];
  _$jscoverage['/editor.js'].branchData['983'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['983'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1001'] = [];
  _$jscoverage['/editor.js'].branchData['1001'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1010'] = [];
  _$jscoverage['/editor.js'].branchData['1010'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1017'] = [];
  _$jscoverage['/editor.js'].branchData['1017'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1061'] = [];
  _$jscoverage['/editor.js'].branchData['1061'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1083'] = [];
  _$jscoverage['/editor.js'].branchData['1083'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1084'] = [];
  _$jscoverage['/editor.js'].branchData['1084'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1092'] = [];
  _$jscoverage['/editor.js'].branchData['1092'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1099'] = [];
  _$jscoverage['/editor.js'].branchData['1099'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1110'] = [];
  _$jscoverage['/editor.js'].branchData['1110'][1] = new BranchData();
}
_$jscoverage['/editor.js'].branchData['1110'][1].init(14, 19, '!self.get(\'iframe\')');
function visit1251_1110_1(result) {
  _$jscoverage['/editor.js'].branchData['1110'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1099'][1].init(900, 31, 'UA[\'gecko\'] && !iframe.__loaded');
function visit1250_1099_1(result) {
  _$jscoverage['/editor.js'].branchData['1099'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1092'][1].init(568, 28, 'textarea.hasAttr(\'tabindex\')');
function visit1249_1092_1(result) {
  _$jscoverage['/editor.js'].branchData['1092'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1084'][1].init(266, 9, 'iframeSrc');
function visit1248_1084_1(result) {
  _$jscoverage['/editor.js'].branchData['1084'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1083'][1].init(216, 35, '$(window).getEmptyIframeSrc() || \'\'');
function visit1247_1083_1(result) {
  _$jscoverage['/editor.js'].branchData['1083'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1061'][1].init(378, 9, 'IS_IE < 7');
function visit1246_1061_1(result) {
  _$jscoverage['/editor.js'].branchData['1061'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1017'][1].init(515, 10, 'data || \'\'');
function visit1245_1017_1(result) {
  _$jscoverage['/editor.js'].branchData['1017'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1010'][1].init(236, 27, 'document.documentMode === 8');
function visit1244_1010_1(result) {
  _$jscoverage['/editor.js'].branchData['1010'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1001'][1].init(222, 21, 'i < customLink.length');
function visit1243_1001_1(result) {
  _$jscoverage['/editor.js'].branchData['1001'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['983'][2].init(74, 28, 'control.nodeName() === \'img\'');
function visit1242_983_2(result) {
  _$jscoverage['/editor.js'].branchData['983'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['983'][1].init(74, 64, 'control.nodeName() === \'img\' && /ke_/.test(control[0].className)');
function visit1241_983_1(result) {
  _$jscoverage['/editor.js'].branchData['983'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['980'][1].init(4988, 11, 'UA[\'gecko\']');
function visit1240_980_1(result) {
  _$jscoverage['/editor.js'].branchData['980'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['973'][1].init(74, 75, 'S.inArray(control.nodeName(), [\'img\', \'hr\', \'input\', \'textarea\', \'select\'])');
function visit1239_973_1(result) {
  _$jscoverage['/editor.js'].branchData['973'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['970'][1].init(4641, 12, 'UA[\'webkit\']');
function visit1238_970_1(result) {
  _$jscoverage['/editor.js'].branchData['970'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['960'][1].init(26, 29, 'evt.keyCode in pageUpDownKeys');
function visit1237_960_1(result) {
  _$jscoverage['/editor.js'].branchData['960'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['957'][1].init(1370, 30, 'doc.compatMode == \'CSS1Compat\'');
function visit1236_957_1(result) {
  _$jscoverage['/editor.js'].branchData['957'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['939'][1].init(139, 7, 'control');
function visit1235_939_1(result) {
  _$jscoverage['/editor.js'].branchData['939'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['936'][1].init(107, 26, 'keyCode in {\n  8: 1, \n  46: 1}');
function visit1234_936_1(result) {
  _$jscoverage['/editor.js'].branchData['936'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['927'][1].init(2742, 5, 'IS_IE');
function visit1233_927_1(result) {
  _$jscoverage['/editor.js'].branchData['927'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['921'][1].init(22, 19, '!self.__iframeFocus');
function visit1232_921_1(result) {
  _$jscoverage['/editor.js'].branchData['921'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['916'][1].init(2443, 11, 'UA[\'gecko\']');
function visit1231_916_1(result) {
  _$jscoverage['/editor.js'].branchData['916'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['909'][1].init(266, 11, 'UA[\'opera\']');
function visit1230_909_1(result) {
  _$jscoverage['/editor.js'].branchData['909'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['906'][1].init(171, 11, 'UA[\'gecko\']');
function visit1229_906_1(result) {
  _$jscoverage['/editor.js'].branchData['906'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['891'][1].init(22, 33, 'UA[\'gecko\'] && self.__iframeFocus');
function visit1228_891_1(result) {
  _$jscoverage['/editor.js'].branchData['891'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['878'][2].init(1120, 20, 'IS_IE || UA[\'opera\']');
function visit1227_878_2(result) {
  _$jscoverage['/editor.js'].branchData['878'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['878'][1].init(1105, 35, 'UA[\'gecko\'] || IS_IE || UA[\'opera\']');
function visit1226_878_1(result) {
  _$jscoverage['/editor.js'].branchData['878'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['871'][1].init(74, 52, 'S.inArray(control.nodeName(), [\'input\', \'textarea\'])');
function visit1225_871_1(result) {
  _$jscoverage['/editor.js'].branchData['871'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['864'][1].init(74, 50, 'S.inArray(control.nodeName(), [\'input\', \'select\'])');
function visit1224_864_1(result) {
  _$jscoverage['/editor.js'].branchData['864'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['861'][1].init(439, 12, 'UA[\'webkit\']');
function visit1223_861_1(result) {
  _$jscoverage['/editor.js'].branchData['861'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['845'][1].init(225, 29, '!retry && blinkCursor(doc, 1)');
function visit1222_845_1(result) {
  _$jscoverage['/editor.js'].branchData['845'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['834'][1].init(153, 23, '!arguments.callee.retry');
function visit1221_834_1(result) {
  _$jscoverage['/editor.js'].branchData['834'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['812'][2].init(54, 24, 't.nodeName() === \'table\'');
function visit1220_812_2(result) {
  _$jscoverage['/editor.js'].branchData['812'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['812'][1].init(54, 86, 't.nodeName() === \'table\' && disableInlineTableEditing');
function visit1219_812_1(result) {
  _$jscoverage['/editor.js'].branchData['812'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['811'][1].init(85, 142, 'disableObjectResizing || (t.nodeName() === \'table\' && disableInlineTableEditing)');
function visit1218_811_1(result) {
  _$jscoverage['/editor.js'].branchData['811'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['799'][1].init(326, 50, 'disableObjectResizing || disableInlineTableEditing');
function visit1217_799_1(result) {
  _$jscoverage['/editor.js'].branchData['799'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['782'][1].init(26, 3, 'doc');
function visit1216_782_1(result) {
  _$jscoverage['/editor.js'].branchData['782'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['780'][1].init(381, 5, 'IS_IE');
function visit1215_780_1(result) {
  _$jscoverage['/editor.js'].branchData['780'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['757'][1].init(133, 11, 'UA[\'gecko\']');
function visit1214_757_1(result) {
  _$jscoverage['/editor.js'].branchData['757'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['753'][1].init(327, 16, 't == htmlElement');
function visit1213_753_1(result) {
  _$jscoverage['/editor.js'].branchData['753'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['742'][1].init(372, 26, 'UA[\'gecko\'] || UA[\'opera\']');
function visit1212_742_1(result) {
  _$jscoverage['/editor.js'].branchData['742'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['723'][1].init(229, 12, 'UA[\'webkit\']');
function visit1211_723_1(result) {
  _$jscoverage['/editor.js'].branchData['723'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['720'][1].init(100, 26, 'UA[\'gecko\'] || UA[\'opera\']');
function visit1210_720_1(result) {
  _$jscoverage['/editor.js'].branchData['720'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['707'][1].init(1333, 5, 'IS_IE');
function visit1209_707_1(result) {
  _$jscoverage['/editor.js'].branchData['707'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['658'][1].init(523, 26, 'cfg.data || textarea.val()');
function visit1208_658_1(result) {
  _$jscoverage['/editor.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['655'][1].init(444, 4, 'name');
function visit1207_655_1(result) {
  _$jscoverage['/editor.js'].branchData['655'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['653'][1].init(27, 20, 'cfg.height || height');
function visit1206_653_1(result) {
  _$jscoverage['/editor.js'].branchData['653'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['652'][1].init(362, 6, 'height');
function visit1205_652_1(result) {
  _$jscoverage['/editor.js'].branchData['652'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['650'][1].init(26, 18, 'cfg.width || width');
function visit1204_650_1(result) {
  _$jscoverage['/editor.js'].branchData['650'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['649'][1].init(284, 5, 'width');
function visit1203_649_1(result) {
  _$jscoverage['/editor.js'].branchData['649'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['645'][1].init(109, 23, 'cfg.textareaAttrs || {}');
function visit1202_645_1(result) {
  _$jscoverage['/editor.js'].branchData['645'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['643'][1].init(16, 9, 'cfg || {}');
function visit1201_643_1(result) {
  _$jscoverage['/editor.js'].branchData['643'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['622'][1].init(316, 5, '!node');
function visit1200_622_1(result) {
  _$jscoverage['/editor.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['620'][3].init(65, 33, 'el.nodeName.toLowerCase() != \'br\'');
function visit1199_620_3(result) {
  _$jscoverage['/editor.js'].branchData['620'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['620'][2].init(45, 16, 'el.nodeType == 1');
function visit1198_620_2(result) {
  _$jscoverage['/editor.js'].branchData['620'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['620'][1].init(45, 53, 'el.nodeType == 1 && el.nodeName.toLowerCase() != \'br\'');
function visit1197_620_1(result) {
  _$jscoverage['/editor.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['617'][1].init(123, 43, 'self.getSelection().getRanges().length == 0');
function visit1196_617_1(result) {
  _$jscoverage['/editor.js'].branchData['617'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['598'][1].init(71, 22, '$sel.type == \'Control\'');
function visit1195_598_1(result) {
  _$jscoverage['/editor.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['596'][1].init(541, 5, 'IS_IE');
function visit1194_596_1(result) {
  _$jscoverage['/editor.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['587'][1].init(236, 42, 'htmlDataProcessor = self.htmlDataProcessor');
function visit1193_587_1(result) {
  _$jscoverage['/editor.js'].branchData['587'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['583'][1].init(140, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1192_583_1(result) {
  _$jscoverage['/editor.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['562'][2].init(2418, 22, 'clone[0].nodeType == 1');
function visit1191_562_2(result) {
  _$jscoverage['/editor.js'].branchData['562'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['562'][1].init(2409, 31, 'clone && clone[0].nodeType == 1');
function visit1190_562_1(result) {
  _$jscoverage['/editor.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['553'][1].init(32, 83, 'xhtml_dtd.$block[nextName] && xhtml_dtd[nextName][\'#text\']');
function visit1189_553_1(result) {
  _$jscoverage['/editor.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['552'][1].init(344, 116, 'nextName && xhtml_dtd.$block[nextName] && xhtml_dtd[nextName][\'#text\']');
function visit1188_552_1(result) {
  _$jscoverage['/editor.js'].branchData['552'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['549'][3].init(171, 41, 'next[0].nodeType == NodeType.ELEMENT_NODE');
function visit1187_549_3(result) {
  _$jscoverage['/editor.js'].branchData['549'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['549'][2].init(171, 81, 'next[0].nodeType == NodeType.ELEMENT_NODE && next.nodeName()');
function visit1186_549_2(result) {
  _$jscoverage['/editor.js'].branchData['549'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['549'][1].init(163, 89, 'next && next[0].nodeType == NodeType.ELEMENT_NODE && next.nodeName()');
function visit1185_549_1(result) {
  _$jscoverage['/editor.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['546'][1].init(1625, 7, 'isBlock');
function visit1184_546_1(result) {
  _$jscoverage['/editor.js'].branchData['546'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['539'][1].init(1309, 12, '!lastElement');
function visit1183_539_1(result) {
  _$jscoverage['/editor.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['534'][1].init(333, 12, '!lastElement');
function visit1182_534_1(result) {
  _$jscoverage['/editor.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['530'][2].init(116, 13, '!i && element');
function visit1181_530_2(result) {
  _$jscoverage['/editor.js'].branchData['530'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['530'][1].init(116, 39, '!i && element || element[\'clone\'](TRUE)');
function visit1180_530_1(result) {
  _$jscoverage['/editor.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['526'][1].init(851, 6, 'i >= 0');
function visit1179_526_1(result) {
  _$jscoverage['/editor.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['520'][2].init(695, 18, 'ranges.length == 0');
function visit1178_520_2(result) {
  _$jscoverage['/editor.js'].branchData['520'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['520'][1].init(684, 29, '!ranges || ranges.length == 0');
function visit1177_520_1(result) {
  _$jscoverage['/editor.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['512'][1].init(287, 34, 'selection && selection.getRanges()');
function visit1176_512_1(result) {
  _$jscoverage['/editor.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['500'][1].init(50, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1175_500_1(result) {
  _$jscoverage['/editor.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['472'][1].init(172, 65, '!self.__previousPath || !self.__previousPath.compare(currentPath)');
function visit1174_472_1(result) {
  _$jscoverage['/editor.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['469'][1].init(76, 33, 'selection && !selection.isInvalid');
function visit1173_469_1(result) {
  _$jscoverage['/editor.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['463'][1].init(48, 29, 'self.__checkSelectionChangeId');
function visit1172_463_1(result) {
  _$jscoverage['/editor.js'].branchData['463'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['449'][1].init(88, 15, 'self.__docReady');
function visit1171_449_1(result) {
  _$jscoverage['/editor.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['436'][1].init(382, 9, 'ind != -1');
function visit1170_436_1(result) {
  _$jscoverage['/editor.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['430'][1].init(22, 22, 'l.attr(\'href\') == link');
function visit1169_430_1(result) {
  _$jscoverage['/editor.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['392'][1].init(248, 3, 'win');
function visit1168_392_1(result) {
  _$jscoverage['/editor.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['389'][1].init(90, 29, 'self.get(\'customStyle\') || \'\'');
function visit1167_389_1(result) {
  _$jscoverage['/editor.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['361'][1].init(614, 18, 'win && win.focus()');
function visit1166_361_1(result) {
  _$jscoverage['/editor.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['357'][2].init(143, 32, 'win.parent && win.parent.focus()');
function visit1165_357_2(result) {
  _$jscoverage['/editor.js'].branchData['357'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['357'][1].init(136, 39, 'win && win.parent && win.parent.focus()');
function visit1164_357_1(result) {
  _$jscoverage['/editor.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['354'][1].init(307, 9, '!UA[\'ie\']');
function visit1163_354_1(result) {
  _$jscoverage['/editor.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['348'][1].init(132, 4, '!win');
function visit1162_348_1(result) {
  _$jscoverage['/editor.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['332'][1].init(159, 5, 'range');
function visit1161_332_1(result) {
  _$jscoverage['/editor.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['297'][1].init(794, 28, 'EMPTY_CONTENT_REG.test(html)');
function visit1160_297_1(result) {
  _$jscoverage['/editor.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['288'][1].init(510, 6, 'format');
function visit1159_288_1(result) {
  _$jscoverage['/editor.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['282'][2].init(227, 20, 'mode == WYSIWYG_MODE');
function visit1158_282_2(result) {
  _$jscoverage['/editor.js'].branchData['282'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['282'][1].init(227, 41, 'mode == WYSIWYG_MODE && self.isDocReady()');
function visit1157_282_1(result) {
  _$jscoverage['/editor.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['279'][1].init(132, 17, 'mode == undefined');
function visit1156_279_1(result) {
  _$jscoverage['/editor.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['258'][1].init(202, 3, 'cmd');
function visit1155_258_1(result) {
  _$jscoverage['/editor.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['181'][1].init(22, 15, 'control.destroy');
function visit1154_181_1(result) {
  _$jscoverage['/editor.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['164'][1].init(368, 3, 'doc');
function visit1153_164_1(result) {
  _$jscoverage['/editor.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['159'][1].init(43, 61, '(form = textarea[0].form) && (form = $(form))');
function visit1152_159_1(result) {
  _$jscoverage['/editor.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['158'][1].init(168, 105, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1151_158_1(result) {
  _$jscoverage['/editor.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['144'][1].init(291, 42, 'htmlDataProcessor = self.htmlDataProcessor');
function visit1150_144_1(result) {
  _$jscoverage['/editor.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['139'][1].init(119, 32, 'self.get(\'mode\') != WYSIWYG_MODE');
function visit1149_139_1(result) {
  _$jscoverage['/editor.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['130'][1].init(79, 20, 'v && self.__docReady');
function visit1148_130_1(result) {
  _$jscoverage['/editor.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['117'][1].init(67, 6, 'iframe');
function visit1147_117_1(result) {
  _$jscoverage['/editor.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['111'][1].init(144, 17, 'v == WYSIWYG_MODE');
function visit1146_111_1(result) {
  _$jscoverage['/editor.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['102'][2].init(62, 40, 'statusBarEl && statusBarEl.outerHeight()');
function visit1145_102_2(result) {
  _$jscoverage['/editor.js'].branchData['102'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['102'][1].init(62, 45, 'statusBarEl && statusBarEl.outerHeight() || 0');
function visit1144_102_1(result) {
  _$jscoverage['/editor.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['101'][2].init(273, 36, 'toolBarEl && toolBarEl.outerHeight()');
function visit1143_101_2(result) {
  _$jscoverage['/editor.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['101'][1].init(273, 41, 'toolBarEl && toolBarEl.outerHeight() || 0');
function visit1142_101_1(result) {
  _$jscoverage['/editor.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['75'][1].init(74, 28, 'sel && sel.removeAllRanges()');
function visit1141_75_1(result) {
  _$jscoverage['/editor.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['69'][1].init(104, 19, 'self.get(\'focused\')');
function visit1140_69_1(result) {
  _$jscoverage['/editor.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['61'][1].init(43, 61, '(form = textarea[0].form) && (form = $(form))');
function visit1139_61_1(result) {
  _$jscoverage['/editor.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['60'][1].init(175, 105, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1138_60_1(result) {
  _$jscoverage['/editor.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].lineData[6]++;
KISSY.add('editor', function(S, Node, iframeContentTpl, Editor, Utils, focusManager, Styles, zIndexManger, clipboard, enterKey, htmlDataProcessor, selectionFix) {
  _$jscoverage['/editor.js'].functionData[0]++;
  _$jscoverage['/editor.js'].lineData[7]++;
  var TRUE = true, undefined = undefined, FALSE = false, NULL = null, window = S.Env.host, document = window.document, UA = S.UA, IS_IE = UA['ie'], NodeType = Node.NodeType, $ = Node.all, HEIGHT = 'height', tryThese = Utils.tryThese, IFRAME_TPL = '<iframe' + ' class="{prefixCls}editor-iframe"' + ' frameborder="0" ' + ' title="kissy-editor" ' + ' allowTransparency="true" ' + ' {iframeSrc} ' + '>' + '</iframe>', EMPTY_CONTENT_REG = /^(?:<(p)>)?(?:(?:&nbsp;)|\s|<br[^>]*>)*(?:<\/\1>)?$/i;
  _$jscoverage['/editor.js'].lineData[29]++;
  Editor.Mode = {
  SOURCE_MODE: 0, 
  WYSIWYG_MODE: 1};
  _$jscoverage['/editor.js'].lineData[34]++;
  var WYSIWYG_MODE = 1;
  _$jscoverage['/editor.js'].lineData[36]++;
  Editor.addMembers({
  initializer: function() {
  _$jscoverage['/editor.js'].functionData[1]++;
  _$jscoverage['/editor.js'].lineData[38]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[39]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[40]++;
  self.__controls = {};
  _$jscoverage['/editor.js'].lineData[42]++;
  focusManager.register(self);
}, 
  renderUI: function() {
  _$jscoverage['/editor.js'].functionData[2]++;
  _$jscoverage['/editor.js'].lineData[47]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[48]++;
  clipboard.init(self);
  _$jscoverage['/editor.js'].lineData[49]++;
  enterKey.init(self);
  _$jscoverage['/editor.js'].lineData[50]++;
  htmlDataProcessor.init(self);
  _$jscoverage['/editor.js'].lineData[51]++;
  selectionFix.init(self);
}, 
  bindUI: function() {
  _$jscoverage['/editor.js'].functionData[3]++;
  _$jscoverage['/editor.js'].lineData[55]++;
  var self = this, form, prefixCls = self.get('prefixCls'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[60]++;
  if (visit1138_60_1(self.get('attachForm') && visit1139_61_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[63]++;
    form.on('submit', self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[66]++;
  function docReady() {
    _$jscoverage['/editor.js'].functionData[4]++;
    _$jscoverage['/editor.js'].lineData[67]++;
    self.detach('docReady', docReady);
    _$jscoverage['/editor.js'].lineData[69]++;
    if (visit1140_69_1(self.get('focused'))) {
      _$jscoverage['/editor.js'].lineData[70]++;
      self.focus();
    } else {
      _$jscoverage['/editor.js'].lineData[74]++;
      var sel = self.getSelection();
      _$jscoverage['/editor.js'].lineData[75]++;
      visit1141_75_1(sel && sel.removeAllRanges());
    }
  }
  _$jscoverage['/editor.js'].lineData[79]++;
  self.on('docReady', docReady);
  _$jscoverage['/editor.js'].lineData[81]++;
  self.on('blur', function() {
  _$jscoverage['/editor.js'].functionData[5]++;
  _$jscoverage['/editor.js'].lineData[82]++;
  self.$el.removeClass(prefixCls + 'editor-focused');
});
  _$jscoverage['/editor.js'].lineData[85]++;
  self.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[6]++;
  _$jscoverage['/editor.js'].lineData[86]++;
  self.$el.addClass(prefixCls + 'editor-focused');
});
}, 
  _onSetHeight: function(v) {
  _$jscoverage['/editor.js'].functionData[7]++;
  _$jscoverage['/editor.js'].lineData[95]++;
  var self = this, textareaEl = self.get('textarea'), toolBarEl = self.get("toolBarEl"), statusBarEl = self.get("statusBarEl");
  _$jscoverage['/editor.js'].lineData[99]++;
  v = parseInt(v, 10);
  _$jscoverage['/editor.js'].lineData[101]++;
  v -= (visit1142_101_1(visit1143_101_2(toolBarEl && toolBarEl.outerHeight()) || 0)) + (visit1144_102_1(visit1145_102_2(statusBarEl && statusBarEl.outerHeight()) || 0));
  _$jscoverage['/editor.js'].lineData[103]++;
  textareaEl.parent().css(HEIGHT, v);
  _$jscoverage['/editor.js'].lineData[104]++;
  textareaEl.css(HEIGHT, v);
}, 
  _onSetMode: function(v) {
  _$jscoverage['/editor.js'].functionData[8]++;
  _$jscoverage['/editor.js'].lineData[108]++;
  var self = this, iframe = self.get('iframe'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[111]++;
  if (visit1146_111_1(v == WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[112]++;
    self.setData(textarea.val());
    _$jscoverage['/editor.js'].lineData[113]++;
    textarea.hide();
    _$jscoverage['/editor.js'].lineData[114]++;
    self.fire("wysiwygMode");
  } else {
    _$jscoverage['/editor.js'].lineData[117]++;
    if (visit1147_117_1(iframe)) {
      _$jscoverage['/editor.js'].lineData[118]++;
      textarea.val(self.getFormatData(WYSIWYG_MODE));
      _$jscoverage['/editor.js'].lineData[119]++;
      iframe.hide();
    }
    _$jscoverage['/editor.js'].lineData[121]++;
    textarea.show();
    _$jscoverage['/editor.js'].lineData[122]++;
    self.fire("sourceMode");
  }
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/editor.js'].functionData[9]++;
  _$jscoverage['/editor.js'].lineData[128]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[130]++;
  if (visit1148_130_1(v && self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[131]++;
    self.focus();
  }
}, 
  'setData': function(data) {
  _$jscoverage['/editor.js'].functionData[10]++;
  _$jscoverage['/editor.js'].lineData[136]++;
  var self = this, htmlDataProcessor, afterData = data;
  _$jscoverage['/editor.js'].lineData[139]++;
  if (visit1149_139_1(self.get('mode') != WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[141]++;
    self.get('textarea').val(data);
    _$jscoverage['/editor.js'].lineData[142]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[144]++;
  if (visit1150_144_1(htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[145]++;
    afterData = htmlDataProcessor.toDataFormat(data);
  }
  _$jscoverage['/editor.js'].lineData[148]++;
  clearIframeDocContent(self);
  _$jscoverage['/editor.js'].lineData[149]++;
  createIframe(self, afterData);
}, 
  destructor: function() {
  _$jscoverage['/editor.js'].functionData[11]++;
  _$jscoverage['/editor.js'].lineData[153]++;
  var self = this, form, textarea = self.get('textarea'), doc = self.get('document');
  _$jscoverage['/editor.js'].lineData[158]++;
  if (visit1151_158_1(self.get('attachForm') && visit1152_159_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[161]++;
    form.detach("submit", self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[164]++;
  if (visit1153_164_1(doc)) {
    _$jscoverage['/editor.js'].lineData[165]++;
    var body = $(doc[0].body), documentElement = $(doc[0].documentElement), win = self.get('window');
    _$jscoverage['/editor.js'].lineData[169]++;
    focusManager.remove(self);
    _$jscoverage['/editor.js'].lineData[171]++;
    doc.detach();
    _$jscoverage['/editor.js'].lineData[173]++;
    documentElement.detach();
    _$jscoverage['/editor.js'].lineData[175]++;
    body.detach();
    _$jscoverage['/editor.js'].lineData[177]++;
    win.detach();
  }
  _$jscoverage['/editor.js'].lineData[180]++;
  S.each(self.__controls, function(control) {
  _$jscoverage['/editor.js'].functionData[12]++;
  _$jscoverage['/editor.js'].lineData[181]++;
  if (visit1154_181_1(control.destroy)) {
    _$jscoverage['/editor.js'].lineData[182]++;
    control.destroy();
  }
});
  _$jscoverage['/editor.js'].lineData[186]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[187]++;
  self.__controls = {};
}, 
  getControl: function(id) {
  _$jscoverage['/editor.js'].functionData[13]++;
  _$jscoverage['/editor.js'].lineData[194]++;
  return this.__controls[id];
}, 
  getControls: function() {
  _$jscoverage['/editor.js'].functionData[14]++;
  _$jscoverage['/editor.js'].lineData[202]++;
  return this.__controls;
}, 
  addControl: function(id, control) {
  _$jscoverage['/editor.js'].functionData[15]++;
  _$jscoverage['/editor.js'].lineData[210]++;
  this.__controls[id] = control;
}, 
  showDialog: function(name, args) {
  _$jscoverage['/editor.js'].functionData[16]++;
  _$jscoverage['/editor.js'].lineData[219]++;
  name += '/dialog';
  _$jscoverage['/editor.js'].lineData[220]++;
  var self = this, d = self.__controls[name];
  _$jscoverage['/editor.js'].lineData[222]++;
  d.show(args);
  _$jscoverage['/editor.js'].lineData[223]++;
  self.fire('dialogShow', {
  dialog: d.dialog, 
  "pluginDialog": d, 
  "dialogName": name});
}, 
  addCommand: function(name, obj) {
  _$jscoverage['/editor.js'].functionData[17]++;
  _$jscoverage['/editor.js'].lineData[236]++;
  this.__commands[name] = obj;
}, 
  hasCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[18]++;
  _$jscoverage['/editor.js'].lineData[244]++;
  return this.__commands[name];
}, 
  execCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[19]++;
  _$jscoverage['/editor.js'].lineData[253]++;
  var self = this, cmd = self.__commands[name], args = S.makeArray(arguments);
  _$jscoverage['/editor.js'].lineData[256]++;
  args.shift();
  _$jscoverage['/editor.js'].lineData[257]++;
  args.unshift(self);
  _$jscoverage['/editor.js'].lineData[258]++;
  if (visit1155_258_1(cmd)) {
    _$jscoverage['/editor.js'].lineData[259]++;
    return cmd.exec.apply(cmd, args);
  } else {
    _$jscoverage['/editor.js'].lineData[261]++;
    S.log(name + ': command not found');
    _$jscoverage['/editor.js'].lineData[262]++;
    return undefined;
  }
}, 
  queryCommandValue: function(name) {
  _$jscoverage['/editor.js'].functionData[20]++;
  _$jscoverage['/editor.js'].lineData[272]++;
  return this.execCommand(Utils.getQueryCmd(name));
}, 
  getData: function(format, mode) {
  _$jscoverage['/editor.js'].functionData[21]++;
  _$jscoverage['/editor.js'].lineData[276]++;
  var self = this, htmlDataProcessor = self.htmlDataProcessor, html;
  _$jscoverage['/editor.js'].lineData[279]++;
  if (visit1156_279_1(mode == undefined)) {
    _$jscoverage['/editor.js'].lineData[280]++;
    mode = self.get('mode');
  }
  _$jscoverage['/editor.js'].lineData[282]++;
  if (visit1157_282_1(visit1158_282_2(mode == WYSIWYG_MODE) && self.isDocReady())) {
    _$jscoverage['/editor.js'].lineData[283]++;
    html = self.get('document')[0].body.innerHTML;
  } else {
    _$jscoverage['/editor.js'].lineData[285]++;
    html = htmlDataProcessor.toDataFormat(self.get('textarea').val());
  }
  _$jscoverage['/editor.js'].lineData[288]++;
  if (visit1159_288_1(format)) {
    _$jscoverage['/editor.js'].lineData[289]++;
    html = htmlDataProcessor.toHtml(html);
  } else {
    _$jscoverage['/editor.js'].lineData[291]++;
    html = htmlDataProcessor.toServer(html);
  }
  _$jscoverage['/editor.js'].lineData[293]++;
  html = S.trim(html);
  _$jscoverage['/editor.js'].lineData[297]++;
  if (visit1160_297_1(EMPTY_CONTENT_REG.test(html))) {
    _$jscoverage['/editor.js'].lineData[298]++;
    html = '';
  }
  _$jscoverage['/editor.js'].lineData[300]++;
  return html;
}, 
  getFormatData: function(mode) {
  _$jscoverage['/editor.js'].functionData[22]++;
  _$jscoverage['/editor.js'].lineData[304]++;
  return this.getData(1, mode);
}, 
  getDocHtml: function() {
  _$jscoverage['/editor.js'].functionData[23]++;
  _$jscoverage['/editor.js'].lineData[311]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[312]++;
  return prepareIFrameHTML(0, self.get('customStyle'), self.get('customLink'), self.getFormatData());
}, 
  getSelection: function() {
  _$jscoverage['/editor.js'].functionData[24]++;
  _$jscoverage['/editor.js'].lineData[320]++;
  return Editor.Selection.getSelection(this.get('document')[0]);
}, 
  'getSelectedHtml': function() {
  _$jscoverage['/editor.js'].functionData[25]++;
  _$jscoverage['/editor.js'].lineData[328]++;
  var self = this, range = self.getSelection().getRanges()[0], contents, html;
  _$jscoverage['/editor.js'].lineData[332]++;
  if (visit1161_332_1(range)) {
    _$jscoverage['/editor.js'].lineData[333]++;
    contents = range.cloneContents();
    _$jscoverage['/editor.js'].lineData[334]++;
    html = self.get('document')[0].createElement('div');
    _$jscoverage['/editor.js'].lineData[335]++;
    html.appendChild(contents);
    _$jscoverage['/editor.js'].lineData[336]++;
    html = html.innerHTML;
  }
  _$jscoverage['/editor.js'].lineData[338]++;
  return html;
}, 
  focus: function() {
  _$jscoverage['/editor.js'].functionData[26]++;
  _$jscoverage['/editor.js'].lineData[345]++;
  var self = this, win = self.get('window');
  _$jscoverage['/editor.js'].lineData[348]++;
  if (visit1162_348_1(!win)) {
    _$jscoverage['/editor.js'].lineData[349]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[351]++;
  var doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[352]++;
  win = win[0];
  _$jscoverage['/editor.js'].lineData[354]++;
  if (visit1163_354_1(!UA['ie'])) {
    _$jscoverage['/editor.js'].lineData[357]++;
    visit1164_357_1(win && visit1165_357_2(win.parent && win.parent.focus()));
  }
  _$jscoverage['/editor.js'].lineData[361]++;
  visit1166_361_1(win && win.focus());
  _$jscoverage['/editor.js'].lineData[363]++;
  try {
    _$jscoverage['/editor.js'].lineData[364]++;
    doc.body.focus();
  }  catch (e) {
}
  _$jscoverage['/editor.js'].lineData[368]++;
  self.notifySelectionChange();
}, 
  blur: function() {
  _$jscoverage['/editor.js'].functionData[27]++;
  _$jscoverage['/editor.js'].lineData[375]++;
  var self = this, win = self.get('window')[0];
  _$jscoverage['/editor.js'].lineData[377]++;
  win.blur();
  _$jscoverage['/editor.js'].lineData[378]++;
  self.get('document')[0].body.blur();
}, 
  addCustomStyle: function(cssText, id) {
  _$jscoverage['/editor.js'].functionData[28]++;
  _$jscoverage['/editor.js'].lineData[387]++;
  var self = this, win = self.get('window'), customStyle = visit1167_389_1(self.get('customStyle') || '');
  _$jscoverage['/editor.js'].lineData[390]++;
  customStyle += "\n" + cssText;
  _$jscoverage['/editor.js'].lineData[391]++;
  self.set('customStyle', customStyle);
  _$jscoverage['/editor.js'].lineData[392]++;
  if (visit1168_392_1(win)) {
    _$jscoverage['/editor.js'].lineData[393]++;
    win.addStyleSheet(win, cssText, id);
  }
}, 
  removeCustomStyle: function(id) {
  _$jscoverage['/editor.js'].functionData[29]++;
  _$jscoverage['/editor.js'].lineData[402]++;
  this.get('document').on('#' + id).remove();
}, 
  addCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[30]++;
  _$jscoverage['/editor.js'].lineData[410]++;
  var self = this, customLink = self.get('customLink'), doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[413]++;
  customLink.push(link);
  _$jscoverage['/editor.js'].lineData[414]++;
  self.set('customLink', customLink);
  _$jscoverage['/editor.js'].lineData[415]++;
  var elem = doc.createElement('link');
  _$jscoverage['/editor.js'].lineData[416]++;
  elem.rel = 'stylesheet';
  _$jscoverage['/editor.js'].lineData[417]++;
  doc.getElementsByTagName('head')[0].appendChild(elem);
  _$jscoverage['/editor.js'].lineData[418]++;
  elem.href = link;
}, 
  removeCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[31]++;
  _$jscoverage['/editor.js'].lineData[426]++;
  var self = this, doc = self.get('document'), links = doc.all('link');
  _$jscoverage['/editor.js'].lineData[429]++;
  links.each(function(l) {
  _$jscoverage['/editor.js'].functionData[32]++;
  _$jscoverage['/editor.js'].lineData[430]++;
  if (visit1169_430_1(l.attr('href') == link)) {
    _$jscoverage['/editor.js'].lineData[431]++;
    l.remove();
  }
});
  _$jscoverage['/editor.js'].lineData[434]++;
  var cls = self.get('customLink'), ind = S.indexOf(link, cls);
  _$jscoverage['/editor.js'].lineData[436]++;
  if (visit1170_436_1(ind != -1)) {
    _$jscoverage['/editor.js'].lineData[437]++;
    cls.splice(ind, 1);
  }
}, 
  docReady: function(func) {
  _$jscoverage['/editor.js'].functionData[33]++;
  _$jscoverage['/editor.js'].lineData[447]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[448]++;
  self.on('docReady', func);
  _$jscoverage['/editor.js'].lineData[449]++;
  if (visit1171_449_1(self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[450]++;
    func.call(self);
  }
}, 
  isDocReady: function() {
  _$jscoverage['/editor.js'].functionData[34]++;
  _$jscoverage['/editor.js'].lineData[455]++;
  return this.__docReady;
}, 
  checkSelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[35]++;
  _$jscoverage['/editor.js'].lineData[462]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[463]++;
  if (visit1172_463_1(self.__checkSelectionChangeId)) {
    _$jscoverage['/editor.js'].lineData[464]++;
    clearTimeout(self.__checkSelectionChangeId);
  }
  _$jscoverage['/editor.js'].lineData[467]++;
  self.__checkSelectionChangeId = setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[36]++;
  _$jscoverage['/editor.js'].lineData[468]++;
  var selection = self.getSelection();
  _$jscoverage['/editor.js'].lineData[469]++;
  if (visit1173_469_1(selection && !selection.isInvalid)) {
    _$jscoverage['/editor.js'].lineData[470]++;
    var startElement = selection.getStartElement(), currentPath = new Editor.ElementPath(startElement);
    _$jscoverage['/editor.js'].lineData[472]++;
    if (visit1174_472_1(!self.__previousPath || !self.__previousPath.compare(currentPath))) {
      _$jscoverage['/editor.js'].lineData[473]++;
      self.__previousPath = currentPath;
      _$jscoverage['/editor.js'].lineData[474]++;
      self.fire('selectionChange', {
  selection: selection, 
  path: currentPath, 
  element: startElement});
    }
  }
}, 100);
}, 
  notifySelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[37]++;
  _$jscoverage['/editor.js'].lineData[488]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[489]++;
  self.__previousPath = NULL;
  _$jscoverage['/editor.js'].lineData[490]++;
  self.checkSelectionChange();
}, 
  insertElement: function(element) {
  _$jscoverage['/editor.js'].functionData[38]++;
  _$jscoverage['/editor.js'].lineData[498]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[500]++;
  if (visit1175_500_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[501]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[504]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[506]++;
  var clone, elementName = element['nodeName'](), xhtml_dtd = Editor.XHTML_DTD, isBlock = xhtml_dtd['$block'][elementName], KER = Editor.RANGE, selection = self.getSelection(), ranges = visit1176_512_1(selection && selection.getRanges()), range, notWhitespaceEval, i, next, nextName, lastElement;
  _$jscoverage['/editor.js'].lineData[520]++;
  if (visit1177_520_1(!ranges || visit1178_520_2(ranges.length == 0))) {
    _$jscoverage['/editor.js'].lineData[521]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[524]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[526]++;
  for (i = ranges.length - 1; visit1179_526_1(i >= 0); i--) {
    _$jscoverage['/editor.js'].lineData[527]++;
    range = ranges[i];
    _$jscoverage['/editor.js'].lineData[530]++;
    clone = visit1180_530_1(visit1181_530_2(!i && element) || element['clone'](TRUE));
    _$jscoverage['/editor.js'].lineData[531]++;
    range.insertNodeByDtd(clone);
    _$jscoverage['/editor.js'].lineData[534]++;
    if (visit1182_534_1(!lastElement)) {
      _$jscoverage['/editor.js'].lineData[535]++;
      lastElement = clone;
    }
  }
  _$jscoverage['/editor.js'].lineData[539]++;
  if (visit1183_539_1(!lastElement)) {
    _$jscoverage['/editor.js'].lineData[540]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[543]++;
  range.moveToPosition(lastElement, KER.POSITION_AFTER_END);
  _$jscoverage['/editor.js'].lineData[546]++;
  if (visit1184_546_1(isBlock)) {
    _$jscoverage['/editor.js'].lineData[547]++;
    notWhitespaceEval = Editor.Walker.whitespaces(true);
    _$jscoverage['/editor.js'].lineData[548]++;
    next = lastElement.next(notWhitespaceEval, 1);
    _$jscoverage['/editor.js'].lineData[549]++;
    nextName = visit1185_549_1(next && visit1186_549_2(visit1187_549_3(next[0].nodeType == NodeType.ELEMENT_NODE) && next.nodeName()));
    _$jscoverage['/editor.js'].lineData[552]++;
    if (visit1188_552_1(nextName && visit1189_553_1(xhtml_dtd.$block[nextName] && xhtml_dtd[nextName]['#text']))) {
      _$jscoverage['/editor.js'].lineData[555]++;
      range.moveToElementEditablePosition(next);
    }
  }
  _$jscoverage['/editor.js'].lineData[558]++;
  selection.selectRanges([range]);
  _$jscoverage['/editor.js'].lineData[559]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[562]++;
  if (visit1190_562_1(clone && visit1191_562_2(clone[0].nodeType == 1))) {
    _$jscoverage['/editor.js'].lineData[563]++;
    clone.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
  }
  _$jscoverage['/editor.js'].lineData[569]++;
  saveLater.call(self);
  _$jscoverage['/editor.js'].lineData[570]++;
  return clone;
}, 
  insertHtml: function(data, dataFilter) {
  _$jscoverage['/editor.js'].functionData[39]++;
  _$jscoverage['/editor.js'].lineData[579]++;
  var self = this, htmlDataProcessor, editorDoc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[583]++;
  if (visit1192_583_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[584]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[587]++;
  if (visit1193_587_1(htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[588]++;
    data = htmlDataProcessor.toDataFormat(data, dataFilter);
  }
  _$jscoverage['/editor.js'].lineData[591]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[592]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[596]++;
  if (visit1194_596_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[597]++;
    var $sel = editorDoc.selection;
    _$jscoverage['/editor.js'].lineData[598]++;
    if (visit1195_598_1($sel.type == 'Control')) {
      _$jscoverage['/editor.js'].lineData[599]++;
      $sel.clear();
    }
    _$jscoverage['/editor.js'].lineData[601]++;
    try {
      _$jscoverage['/editor.js'].lineData[602]++;
      $sel.createRange().pasteHTML(data);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[604]++;
  S.log('insertHtml error in ie');
}
  } else {
    _$jscoverage['/editor.js'].lineData[611]++;
    try {
      _$jscoverage['/editor.js'].lineData[612]++;
      editorDoc.execCommand('inserthtml', FALSE, data);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[614]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[40]++;
  _$jscoverage['/editor.js'].lineData[617]++;
  if (visit1196_617_1(self.getSelection().getRanges().length == 0)) {
    _$jscoverage['/editor.js'].lineData[618]++;
    var r = new Editor.Range(editorDoc), node = $(editorDoc.body).first(function(el) {
  _$jscoverage['/editor.js'].functionData[41]++;
  _$jscoverage['/editor.js'].lineData[620]++;
  return visit1197_620_1(visit1198_620_2(el.nodeType == 1) && visit1199_620_3(el.nodeName.toLowerCase() != 'br'));
});
    _$jscoverage['/editor.js'].lineData[622]++;
    if (visit1200_622_1(!node)) {
      _$jscoverage['/editor.js'].lineData[623]++;
      node = $(editorDoc.createElement('p'));
      _$jscoverage['/editor.js'].lineData[624]++;
      node._4e_appendBogus().appendTo(editorDoc.body);
    }
    _$jscoverage['/editor.js'].lineData[626]++;
    r.setStartAt(node, Editor.RANGE.POSITION_AFTER_START);
    _$jscoverage['/editor.js'].lineData[627]++;
    r.select();
  }
  _$jscoverage['/editor.js'].lineData[629]++;
  editorDoc.execCommand('inserthtml', FALSE, data);
}, 50);
}
  }
  _$jscoverage['/editor.js'].lineData[635]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[42]++;
  _$jscoverage['/editor.js'].lineData[636]++;
  self.getSelection().scrollIntoView();
}, 50);
  _$jscoverage['/editor.js'].lineData[638]++;
  saveLater.call(self);
}});
  _$jscoverage['/editor.js'].lineData[642]++;
  Editor.decorate = function(textarea, cfg) {
  _$jscoverage['/editor.js'].functionData[43]++;
  _$jscoverage['/editor.js'].lineData[643]++;
  cfg = visit1201_643_1(cfg || {});
  _$jscoverage['/editor.js'].lineData[644]++;
  textarea = $(textarea);
  _$jscoverage['/editor.js'].lineData[645]++;
  var textareaAttrs = cfg.textareaAttrs = visit1202_645_1(cfg.textareaAttrs || {});
  _$jscoverage['/editor.js'].lineData[646]++;
  var width = textarea.style('width');
  _$jscoverage['/editor.js'].lineData[647]++;
  var height = textarea.style('height');
  _$jscoverage['/editor.js'].lineData[648]++;
  var name = textarea.attr('name');
  _$jscoverage['/editor.js'].lineData[649]++;
  if (visit1203_649_1(width)) {
    _$jscoverage['/editor.js'].lineData[650]++;
    cfg.width = visit1204_650_1(cfg.width || width);
  }
  _$jscoverage['/editor.js'].lineData[652]++;
  if (visit1205_652_1(height)) {
    _$jscoverage['/editor.js'].lineData[653]++;
    cfg.height = visit1206_653_1(cfg.height || height);
  }
  _$jscoverage['/editor.js'].lineData[655]++;
  if (visit1207_655_1(name)) {
    _$jscoverage['/editor.js'].lineData[656]++;
    textareaAttrs.name = name;
  }
  _$jscoverage['/editor.js'].lineData[658]++;
  cfg.data = visit1208_658_1(cfg.data || textarea.val());
  _$jscoverage['/editor.js'].lineData[659]++;
  cfg.elBefore = textarea;
  _$jscoverage['/editor.js'].lineData[660]++;
  var editor = new Editor(cfg).render();
  _$jscoverage['/editor.js'].lineData[661]++;
  textarea.remove();
  _$jscoverage['/editor.js'].lineData[662]++;
  return editor;
};
  _$jscoverage['/editor.js'].lineData[671]++;
  Editor["_initIframe"] = function(id) {
  _$jscoverage['/editor.js'].functionData[44]++;
  _$jscoverage['/editor.js'].lineData[673]++;
  var self = focusManager.getInstance(id), $doc = self.get('document'), doc = $doc[0], script = $doc.one('#ke_active_script');
  _$jscoverage['/editor.js'].lineData[679]++;
  script.remove();
  _$jscoverage['/editor.js'].lineData[681]++;
  fixByBindIframeDoc(self);
  _$jscoverage['/editor.js'].lineData[683]++;
  var body = doc.body;
  _$jscoverage['/editor.js'].lineData[685]++;
  var $body = $(body);
  _$jscoverage['/editor.js'].lineData[707]++;
  if (visit1209_707_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[709]++;
    body['hideFocus'] = TRUE;
    _$jscoverage['/editor.js'].lineData[712]++;
    body.disabled = TRUE;
    _$jscoverage['/editor.js'].lineData[713]++;
    body['contentEditable'] = TRUE;
    _$jscoverage['/editor.js'].lineData[714]++;
    body.removeAttribute('disabled');
  } else {
    _$jscoverage['/editor.js'].lineData[718]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[45]++;
  _$jscoverage['/editor.js'].lineData[720]++;
  if (visit1210_720_1(UA['gecko'] || UA['opera'])) {
    _$jscoverage['/editor.js'].lineData[721]++;
    body['contentEditable'] = TRUE;
  } else {
    _$jscoverage['/editor.js'].lineData[723]++;
    if (visit1211_723_1(UA['webkit'])) {
      _$jscoverage['/editor.js'].lineData[724]++;
      body.parentNode['contentEditable'] = TRUE;
    } else {
      _$jscoverage['/editor.js'].lineData[726]++;
      doc['designMode'] = 'on';
    }
  }
}, 0);
  }
  _$jscoverage['/editor.js'].lineData[733]++;
  if (visit1212_742_1(UA['gecko'] || UA['opera'])) {
    _$jscoverage['/editor.js'].lineData[744]++;
    var htmlElement = doc.documentElement;
    _$jscoverage['/editor.js'].lineData[745]++;
    $(htmlElement).on('mousedown', function(evt) {
  _$jscoverage['/editor.js'].functionData[46]++;
  _$jscoverage['/editor.js'].lineData[752]++;
  var t = evt.target;
  _$jscoverage['/editor.js'].lineData[753]++;
  if (visit1213_753_1(t == htmlElement)) {
    _$jscoverage['/editor.js'].lineData[757]++;
    if (visit1214_757_1(UA['gecko'])) {
      _$jscoverage['/editor.js'].lineData[758]++;
      blinkCursor(doc, FALSE);
    }
    _$jscoverage['/editor.js'].lineData[765]++;
    self.activateGecko();
  }
});
  }
  _$jscoverage['/editor.js'].lineData[771]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[47]++;
  _$jscoverage['/editor.js'].lineData[780]++;
  if (visit1215_780_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[781]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[48]++;
  _$jscoverage['/editor.js'].lineData[782]++;
  if (visit1216_782_1(doc)) {
    _$jscoverage['/editor.js'].lineData[783]++;
    body.runtimeStyle['marginBottom'] = '0px';
    _$jscoverage['/editor.js'].lineData[784]++;
    body.runtimeStyle['marginBottom'] = '';
  }
}, 1000);
  }
}, 0);
  _$jscoverage['/editor.js'].lineData[791]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[49]++;
  _$jscoverage['/editor.js'].lineData[792]++;
  self.__docReady = 1;
  _$jscoverage['/editor.js'].lineData[793]++;
  self.fire('docReady');
  _$jscoverage['/editor.js'].lineData[797]++;
  var disableObjectResizing = self.get('disableObjectResizing'), disableInlineTableEditing = self.get('disableInlineTableEditing');
  _$jscoverage['/editor.js'].lineData[799]++;
  if (visit1217_799_1(disableObjectResizing || disableInlineTableEditing)) {
    _$jscoverage['/editor.js'].lineData[801]++;
    try {
      _$jscoverage['/editor.js'].lineData[802]++;
      doc.execCommand('enableObjectResizing', FALSE, !disableObjectResizing);
      _$jscoverage['/editor.js'].lineData[803]++;
      doc.execCommand('enableInlineTableEditing', FALSE, !disableInlineTableEditing);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[809]++;
  $body.on(IS_IE ? 'resizestart' : 'resize', function(evt) {
  _$jscoverage['/editor.js'].functionData[50]++;
  _$jscoverage['/editor.js'].lineData[810]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor.js'].lineData[811]++;
  if (visit1218_811_1(disableObjectResizing || (visit1219_812_1(visit1220_812_2(t.nodeName() === 'table') && disableInlineTableEditing)))) {
    _$jscoverage['/editor.js'].lineData[814]++;
    evt.preventDefault();
  }
});
}
  }
}, 10);
};
  _$jscoverage['/editor.js'].lineData[824]++;
  function blinkCursor(doc, retry) {
    _$jscoverage['/editor.js'].functionData[51]++;
    _$jscoverage['/editor.js'].lineData[825]++;
    var body = doc.body;
    _$jscoverage['/editor.js'].lineData[826]++;
    tryThese(function() {
  _$jscoverage['/editor.js'].functionData[52]++;
  _$jscoverage['/editor.js'].lineData[828]++;
  doc['designMode'] = 'on';
  _$jscoverage['/editor.js'].lineData[830]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[53]++;
  _$jscoverage['/editor.js'].lineData[831]++;
  doc['designMode'] = 'off';
  _$jscoverage['/editor.js'].lineData[832]++;
  body.focus();
  _$jscoverage['/editor.js'].lineData[834]++;
  if (visit1221_834_1(!arguments.callee.retry)) {
    _$jscoverage['/editor.js'].lineData[835]++;
    arguments.callee.retry = TRUE;
  }
}, 50);
}, function() {
  _$jscoverage['/editor.js'].functionData[54]++;
  _$jscoverage['/editor.js'].lineData[841]++;
  doc['designMode'] = 'off';
  _$jscoverage['/editor.js'].lineData[842]++;
  body.setAttribute('contentEditable', false);
  _$jscoverage['/editor.js'].lineData[843]++;
  body.setAttribute('contentEditable', true);
  _$jscoverage['/editor.js'].lineData[845]++;
  visit1222_845_1(!retry && blinkCursor(doc, 1));
});
  }
  _$jscoverage['/editor.js'].lineData[850]++;
  function fixByBindIframeDoc(self) {
    _$jscoverage['/editor.js'].functionData[55]++;
    _$jscoverage['/editor.js'].lineData[851]++;
    var iframe = self.get('iframe'), textarea = self.get('textarea')[0], $win = self.get('window'), $doc = self.get('document'), doc = $doc[0];
    _$jscoverage['/editor.js'].lineData[861]++;
    if (visit1223_861_1(UA['webkit'])) {
      _$jscoverage['/editor.js'].lineData[862]++;
      $doc.on('click', function(ev) {
  _$jscoverage['/editor.js'].functionData[56]++;
  _$jscoverage['/editor.js'].lineData[863]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[864]++;
  if (visit1224_864_1(S.inArray(control.nodeName(), ['input', 'select']))) {
    _$jscoverage['/editor.js'].lineData[865]++;
    ev.preventDefault();
  }
});
      _$jscoverage['/editor.js'].lineData[869]++;
      $doc.on('mouseup', function(ev) {
  _$jscoverage['/editor.js'].functionData[57]++;
  _$jscoverage['/editor.js'].lineData[870]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[871]++;
  if (visit1225_871_1(S.inArray(control.nodeName(), ['input', 'textarea']))) {
    _$jscoverage['/editor.js'].lineData[872]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[878]++;
    if (visit1226_878_1(UA['gecko'] || visit1227_878_2(IS_IE || UA['opera']))) {
      _$jscoverage['/editor.js'].lineData[879]++;
      var focusGrabber;
      _$jscoverage['/editor.js'].lineData[880]++;
      focusGrabber = new Node('<span ' + 'tabindex="-1" ' + 'style="position:absolute; left:-10000"' + ' role="presentation"' + '></span>').insertAfter(textarea);
      _$jscoverage['/editor.js'].lineData[887]++;
      focusGrabber.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[58]++;
  _$jscoverage['/editor.js'].lineData[888]++;
  self.focus();
});
      _$jscoverage['/editor.js'].lineData[890]++;
      self.activateGecko = function() {
  _$jscoverage['/editor.js'].functionData[59]++;
  _$jscoverage['/editor.js'].lineData[891]++;
  if (visit1228_891_1(UA['gecko'] && self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[892]++;
    focusGrabber[0].focus();
  }
};
      _$jscoverage['/editor.js'].lineData[894]++;
      self.on('destroy', function() {
  _$jscoverage['/editor.js'].functionData[60]++;
  _$jscoverage['/editor.js'].lineData[895]++;
  focusGrabber.detach();
  _$jscoverage['/editor.js'].lineData[896]++;
  focusGrabber.remove();
});
    }
    _$jscoverage['/editor.js'].lineData[900]++;
    $win.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[61]++;
  _$jscoverage['/editor.js'].lineData[906]++;
  if (visit1229_906_1(UA['gecko'])) {
    _$jscoverage['/editor.js'].lineData[907]++;
    blinkCursor(doc, FALSE);
  } else {
    _$jscoverage['/editor.js'].lineData[909]++;
    if (visit1230_909_1(UA['opera'])) {
      _$jscoverage['/editor.js'].lineData[910]++;
      doc.body.focus();
    }
  }
  _$jscoverage['/editor.js'].lineData[913]++;
  self.notifySelectionChange();
});
    _$jscoverage['/editor.js'].lineData[916]++;
    if (visit1231_916_1(UA['gecko'])) {
      _$jscoverage['/editor.js'].lineData[920]++;
      $doc.on('mousedown', function() {
  _$jscoverage['/editor.js'].functionData[62]++;
  _$jscoverage['/editor.js'].lineData[921]++;
  if (visit1232_921_1(!self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[922]++;
    blinkCursor(doc, FALSE);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[927]++;
    if (visit1233_927_1(IS_IE)) {
      _$jscoverage['/editor.js'].lineData[933]++;
      $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[63]++;
  _$jscoverage['/editor.js'].lineData[934]++;
  var keyCode = evt.keyCode;
  _$jscoverage['/editor.js'].lineData[936]++;
  if (visit1234_936_1(keyCode in {
  8: 1, 
  46: 1})) {
    _$jscoverage['/editor.js'].lineData[937]++;
    var sel = self.getSelection(), control = sel.getSelectedElement();
    _$jscoverage['/editor.js'].lineData[939]++;
    if (visit1235_939_1(control)) {
      _$jscoverage['/editor.js'].lineData[941]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[944]++;
      var bookmark = sel.getRanges()[0].createBookmark();
      _$jscoverage['/editor.js'].lineData[946]++;
      control.remove();
      _$jscoverage['/editor.js'].lineData[947]++;
      sel.selectBookmarks([bookmark]);
      _$jscoverage['/editor.js'].lineData[948]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[949]++;
      evt.preventDefault();
    }
  }
});
      _$jscoverage['/editor.js'].lineData[957]++;
      if (visit1236_957_1(doc.compatMode == 'CSS1Compat')) {
        _$jscoverage['/editor.js'].lineData[958]++;
        var pageUpDownKeys = {
  33: 1, 
  34: 1};
        _$jscoverage['/editor.js'].lineData[959]++;
        $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[64]++;
  _$jscoverage['/editor.js'].lineData[960]++;
  if (visit1237_960_1(evt.keyCode in pageUpDownKeys)) {
    _$jscoverage['/editor.js'].lineData[961]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[65]++;
  _$jscoverage['/editor.js'].lineData[962]++;
  self.getSelection().scrollIntoView();
}, 0);
  }
});
      }
    }
    _$jscoverage['/editor.js'].lineData[970]++;
    if (visit1238_970_1(UA['webkit'])) {
      _$jscoverage['/editor.js'].lineData[971]++;
      $doc.on('mousedown', function(ev) {
  _$jscoverage['/editor.js'].functionData[66]++;
  _$jscoverage['/editor.js'].lineData[972]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[973]++;
  if (visit1239_973_1(S.inArray(control.nodeName(), ['img', 'hr', 'input', 'textarea', 'select']))) {
    _$jscoverage['/editor.js'].lineData[974]++;
    self.getSelection().selectElement(control);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[980]++;
    if (visit1240_980_1(UA['gecko'])) {
      _$jscoverage['/editor.js'].lineData[981]++;
      $doc.on('dragstart', function(ev) {
  _$jscoverage['/editor.js'].functionData[67]++;
  _$jscoverage['/editor.js'].lineData[982]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[983]++;
  if (visit1241_983_1(visit1242_983_2(control.nodeName() === 'img') && /ke_/.test(control[0].className))) {
    _$jscoverage['/editor.js'].lineData[985]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[991]++;
    focusManager.add(self);
  }
  _$jscoverage['/editor.js'].lineData[995]++;
  function prepareIFrameHTML(id, customStyle, customLink, data) {
    _$jscoverage['/editor.js'].functionData[68]++;
    _$jscoverage['/editor.js'].lineData[996]++;
    var links = '', i, innerCssFile = Utils.debugUrl('theme/editor-iframe.css');
    _$jscoverage['/editor.js'].lineData[999]++;
    customLink = customLink.concat([]);
    _$jscoverage['/editor.js'].lineData[1000]++;
    customLink.unshift(innerCssFile);
    _$jscoverage['/editor.js'].lineData[1001]++;
    for (i = 0; visit1243_1001_1(i < customLink.length); i++) {
      _$jscoverage['/editor.js'].lineData[1002]++;
      links += S.substitute('<link href="' + '{href}" rel="stylesheet" />', {
  href: customLink[i]});
    }
    _$jscoverage['/editor.js'].lineData[1006]++;
    return S.substitute(iframeContentTpl, {
  doctype: visit1244_1010_1(document.documentMode === 8) ? '<meta http-equiv="X-UA-Compatible" content="IE=7" />' : '', 
  title: '${title}', 
  links: links, 
  style: customStyle, 
  data: visit1245_1017_1(data || ''), 
  script: id ? ('<script id="ke_active_script">' + ($(window).isCustomDomain() ? ('document.domain="' + document.domain + '";') : '') + 'parent.KISSY.require("editor")._initIframe("' + id + '");' + '</script>') : ''});
  }
  _$jscoverage['/editor.js'].lineData[1032]++;
  var saveLater = S.buffer(function() {
  _$jscoverage['/editor.js'].functionData[69]++;
  _$jscoverage['/editor.js'].lineData[1033]++;
  this.execCommand('save');
}, 50);
  _$jscoverage['/editor.js'].lineData[1036]++;
  function setUpIFrame(self, data) {
    _$jscoverage['/editor.js'].functionData[70]++;
    _$jscoverage['/editor.js'].lineData[1037]++;
    var iframe = self.get('iframe'), html = prepareIFrameHTML(self.get('id'), self.get('customStyle'), self.get('customLink'), data), iframeDom = iframe[0], win = iframeDom.contentWindow, doc;
    _$jscoverage['/editor.js'].lineData[1044]++;
    iframe.__loaded = 1;
    _$jscoverage['/editor.js'].lineData[1045]++;
    try {
      _$jscoverage['/editor.js'].lineData[1053]++;
      doc = win.document;
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[1058]++;
  iframeDom.src = iframeDom.src;
  _$jscoverage['/editor.js'].lineData[1061]++;
  if (visit1246_1061_1(IS_IE < 7)) {
    _$jscoverage['/editor.js'].lineData[1062]++;
    setTimeout(run, 10);
    _$jscoverage['/editor.js'].lineData[1063]++;
    return;
  }
}
    _$jscoverage['/editor.js'].lineData[1066]++;
    run();
    _$jscoverage['/editor.js'].lineData[1067]++;
    function run() {
      _$jscoverage['/editor.js'].functionData[71]++;
      _$jscoverage['/editor.js'].lineData[1068]++;
      doc = win.document;
      _$jscoverage['/editor.js'].lineData[1069]++;
      self.setInternal('document', new Node(doc));
      _$jscoverage['/editor.js'].lineData[1070]++;
      self.setInternal('window', new Node(win));
      _$jscoverage['/editor.js'].lineData[1071]++;
      iframe.detach();
      _$jscoverage['/editor.js'].lineData[1073]++;
      doc['open']('text/html', 'replace');
      _$jscoverage['/editor.js'].lineData[1074]++;
      doc.write(html);
      _$jscoverage['/editor.js'].lineData[1075]++;
      doc.close();
    }
  }
  _$jscoverage['/editor.js'].lineData[1079]++;
  function createIframe(self, afterData) {
    _$jscoverage['/editor.js'].functionData[72]++;
    _$jscoverage['/editor.js'].lineData[1083]++;
    var iframeSrc = visit1247_1083_1($(window).getEmptyIframeSrc() || '');
    _$jscoverage['/editor.js'].lineData[1084]++;
    if (visit1248_1084_1(iframeSrc)) {
      _$jscoverage['/editor.js'].lineData[1085]++;
      iframeSrc = ' src="' + iframeSrc + '" ';
    }
    _$jscoverage['/editor.js'].lineData[1087]++;
    var iframe = new Node(S.substitute(IFRAME_TPL, {
  iframeSrc: iframeSrc, 
  prefixCls: self.get('prefixCls')})), textarea = self.get('textarea');
    _$jscoverage['/editor.js'].lineData[1092]++;
    if (visit1249_1092_1(textarea.hasAttr('tabindex'))) {
      _$jscoverage['/editor.js'].lineData[1093]++;
      iframe.attr('tabindex', UA['webkit'] ? -1 : textarea.attr('tabindex'));
    }
    _$jscoverage['/editor.js'].lineData[1095]++;
    textarea.parent().prepend(iframe);
    _$jscoverage['/editor.js'].lineData[1096]++;
    self.set('iframe', iframe);
    _$jscoverage['/editor.js'].lineData[1097]++;
    self.__docReady = 0;
    _$jscoverage['/editor.js'].lineData[1099]++;
    if (visit1250_1099_1(UA['gecko'] && !iframe.__loaded)) {
      _$jscoverage['/editor.js'].lineData[1100]++;
      iframe.on('load', function() {
  _$jscoverage['/editor.js'].functionData[73]++;
  _$jscoverage['/editor.js'].lineData[1101]++;
  setUpIFrame(self, afterData);
}, self);
    } else {
      _$jscoverage['/editor.js'].lineData[1105]++;
      setUpIFrame(self, afterData);
    }
  }
  _$jscoverage['/editor.js'].lineData[1109]++;
  function clearIframeDocContent(self) {
    _$jscoverage['/editor.js'].functionData[74]++;
    _$jscoverage['/editor.js'].lineData[1110]++;
    if (visit1251_1110_1(!self.get('iframe'))) {
      _$jscoverage['/editor.js'].lineData[1111]++;
      return;
    }
    _$jscoverage['/editor.js'].lineData[1113]++;
    var iframe = self.get('iframe'), win = self.get('window'), doc = self.get('document'), domDoc = doc[0], documentElement = $(domDoc.documentElement), body = $(domDoc.body);
    _$jscoverage['/editor.js'].lineData[1119]++;
    S.each([doc, documentElement, body, win], function(el) {
  _$jscoverage['/editor.js'].functionData[75]++;
  _$jscoverage['/editor.js'].lineData[1120]++;
  el.detach();
});
    _$jscoverage['/editor.js'].lineData[1122]++;
    iframe.remove();
  }
  _$jscoverage['/editor.js'].lineData[1127]++;
  return Editor;
}, {
  requires: ['node', 'editor/iframe-content-tpl', 'editor/base', 'editor/utils', 'editor/focusManager', 'editor/styles', 'editor/zIndexManager', 'editor/clipboard', 'editor/enterKey', 'editor/htmlDataProcessor', 'editor/selectionFix', 'editor/plugin-meta']});
