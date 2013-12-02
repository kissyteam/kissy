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
if (! _$jscoverage['/format.js']) {
  _$jscoverage['/format.js'] = {};
  _$jscoverage['/format.js'].lineData = [];
  _$jscoverage['/format.js'].lineData[7] = 0;
  _$jscoverage['/format.js'].lineData[8] = 0;
  _$jscoverage['/format.js'].lineData[9] = 0;
  _$jscoverage['/format.js'].lineData[10] = 0;
  _$jscoverage['/format.js'].lineData[33] = 0;
  _$jscoverage['/format.js'].lineData[58] = 0;
  _$jscoverage['/format.js'].lineData[61] = 0;
  _$jscoverage['/format.js'].lineData[63] = 0;
  _$jscoverage['/format.js'].lineData[65] = 0;
  _$jscoverage['/format.js'].lineData[66] = 0;
  _$jscoverage['/format.js'].lineData[67] = 0;
  _$jscoverage['/format.js'].lineData[68] = 0;
  _$jscoverage['/format.js'].lineData[69] = 0;
  _$jscoverage['/format.js'].lineData[70] = 0;
  _$jscoverage['/format.js'].lineData[71] = 0;
  _$jscoverage['/format.js'].lineData[72] = 0;
  _$jscoverage['/format.js'].lineData[73] = 0;
  _$jscoverage['/format.js'].lineData[74] = 0;
  _$jscoverage['/format.js'].lineData[75] = 0;
  _$jscoverage['/format.js'].lineData[76] = 0;
  _$jscoverage['/format.js'].lineData[77] = 0;
  _$jscoverage['/format.js'].lineData[79] = 0;
  _$jscoverage['/format.js'].lineData[80] = 0;
  _$jscoverage['/format.js'].lineData[83] = 0;
  _$jscoverage['/format.js'].lineData[88] = 0;
  _$jscoverage['/format.js'].lineData[89] = 0;
  _$jscoverage['/format.js'].lineData[95] = 0;
  _$jscoverage['/format.js'].lineData[96] = 0;
  _$jscoverage['/format.js'].lineData[97] = 0;
  _$jscoverage['/format.js'].lineData[98] = 0;
  _$jscoverage['/format.js'].lineData[99] = 0;
  _$jscoverage['/format.js'].lineData[100] = 0;
  _$jscoverage['/format.js'].lineData[101] = 0;
  _$jscoverage['/format.js'].lineData[103] = 0;
  _$jscoverage['/format.js'].lineData[104] = 0;
  _$jscoverage['/format.js'].lineData[106] = 0;
  _$jscoverage['/format.js'].lineData[109] = 0;
  _$jscoverage['/format.js'].lineData[110] = 0;
  _$jscoverage['/format.js'].lineData[111] = 0;
  _$jscoverage['/format.js'].lineData[112] = 0;
  _$jscoverage['/format.js'].lineData[113] = 0;
  _$jscoverage['/format.js'].lineData[114] = 0;
  _$jscoverage['/format.js'].lineData[115] = 0;
  _$jscoverage['/format.js'].lineData[116] = 0;
  _$jscoverage['/format.js'].lineData[118] = 0;
  _$jscoverage['/format.js'].lineData[119] = 0;
  _$jscoverage['/format.js'].lineData[121] = 0;
  _$jscoverage['/format.js'].lineData[124] = 0;
  _$jscoverage['/format.js'].lineData[125] = 0;
  _$jscoverage['/format.js'].lineData[126] = 0;
  _$jscoverage['/format.js'].lineData[127] = 0;
  _$jscoverage['/format.js'].lineData[128] = 0;
  _$jscoverage['/format.js'].lineData[130] = 0;
  _$jscoverage['/format.js'].lineData[131] = 0;
  _$jscoverage['/format.js'].lineData[133] = 0;
  _$jscoverage['/format.js'].lineData[136] = 0;
  _$jscoverage['/format.js'].lineData[138] = 0;
  _$jscoverage['/format.js'].lineData[140] = 0;
  _$jscoverage['/format.js'].lineData[141] = 0;
  _$jscoverage['/format.js'].lineData[142] = 0;
  _$jscoverage['/format.js'].lineData[144] = 0;
  _$jscoverage['/format.js'].lineData[145] = 0;
  _$jscoverage['/format.js'].lineData[146] = 0;
  _$jscoverage['/format.js'].lineData[147] = 0;
  _$jscoverage['/format.js'].lineData[148] = 0;
  _$jscoverage['/format.js'].lineData[150] = 0;
  _$jscoverage['/format.js'].lineData[153] = 0;
  _$jscoverage['/format.js'].lineData[156] = 0;
  _$jscoverage['/format.js'].lineData[157] = 0;
  _$jscoverage['/format.js'].lineData[160] = 0;
  _$jscoverage['/format.js'].lineData[161] = 0;
  _$jscoverage['/format.js'].lineData[162] = 0;
  _$jscoverage['/format.js'].lineData[163] = 0;
  _$jscoverage['/format.js'].lineData[165] = 0;
  _$jscoverage['/format.js'].lineData[166] = 0;
  _$jscoverage['/format.js'].lineData[167] = 0;
  _$jscoverage['/format.js'].lineData[170] = 0;
  _$jscoverage['/format.js'].lineData[171] = 0;
  _$jscoverage['/format.js'].lineData[174] = 0;
  _$jscoverage['/format.js'].lineData[175] = 0;
  _$jscoverage['/format.js'].lineData[178] = 0;
  _$jscoverage['/format.js'].lineData[181] = 0;
  _$jscoverage['/format.js'].lineData[184] = 0;
  _$jscoverage['/format.js'].lineData[189] = 0;
  _$jscoverage['/format.js'].lineData[190] = 0;
  _$jscoverage['/format.js'].lineData[191] = 0;
  _$jscoverage['/format.js'].lineData[192] = 0;
  _$jscoverage['/format.js'].lineData[193] = 0;
  _$jscoverage['/format.js'].lineData[194] = 0;
  _$jscoverage['/format.js'].lineData[196] = 0;
  _$jscoverage['/format.js'].lineData[197] = 0;
  _$jscoverage['/format.js'].lineData[198] = 0;
  _$jscoverage['/format.js'].lineData[199] = 0;
  _$jscoverage['/format.js'].lineData[200] = 0;
  _$jscoverage['/format.js'].lineData[201] = 0;
  _$jscoverage['/format.js'].lineData[203] = 0;
  _$jscoverage['/format.js'].lineData[204] = 0;
  _$jscoverage['/format.js'].lineData[208] = 0;
  _$jscoverage['/format.js'].lineData[209] = 0;
  _$jscoverage['/format.js'].lineData[337] = 0;
  _$jscoverage['/format.js'].lineData[338] = 0;
  _$jscoverage['/format.js'].lineData[339] = 0;
  _$jscoverage['/format.js'].lineData[340] = 0;
  _$jscoverage['/format.js'].lineData[343] = 0;
  _$jscoverage['/format.js'].lineData[344] = 0;
  _$jscoverage['/format.js'].lineData[346] = 0;
  _$jscoverage['/format.js'].lineData[348] = 0;
  _$jscoverage['/format.js'].lineData[349] = 0;
  _$jscoverage['/format.js'].lineData[350] = 0;
  _$jscoverage['/format.js'].lineData[352] = 0;
  _$jscoverage['/format.js'].lineData[353] = 0;
  _$jscoverage['/format.js'].lineData[354] = 0;
  _$jscoverage['/format.js'].lineData[356] = 0;
  _$jscoverage['/format.js'].lineData[357] = 0;
  _$jscoverage['/format.js'].lineData[359] = 0;
  _$jscoverage['/format.js'].lineData[360] = 0;
  _$jscoverage['/format.js'].lineData[361] = 0;
  _$jscoverage['/format.js'].lineData[362] = 0;
  _$jscoverage['/format.js'].lineData[363] = 0;
  _$jscoverage['/format.js'].lineData[365] = 0;
  _$jscoverage['/format.js'].lineData[367] = 0;
  _$jscoverage['/format.js'].lineData[369] = 0;
  _$jscoverage['/format.js'].lineData[371] = 0;
  _$jscoverage['/format.js'].lineData[373] = 0;
  _$jscoverage['/format.js'].lineData[374] = 0;
  _$jscoverage['/format.js'].lineData[377] = 0;
  _$jscoverage['/format.js'].lineData[379] = 0;
  _$jscoverage['/format.js'].lineData[382] = 0;
  _$jscoverage['/format.js'].lineData[384] = 0;
  _$jscoverage['/format.js'].lineData[386] = 0;
  _$jscoverage['/format.js'].lineData[388] = 0;
  _$jscoverage['/format.js'].lineData[390] = 0;
  _$jscoverage['/format.js'].lineData[392] = 0;
  _$jscoverage['/format.js'].lineData[393] = 0;
  _$jscoverage['/format.js'].lineData[394] = 0;
  _$jscoverage['/format.js'].lineData[395] = 0;
  _$jscoverage['/format.js'].lineData[397] = 0;
  _$jscoverage['/format.js'].lineData[398] = 0;
  _$jscoverage['/format.js'].lineData[409] = 0;
  _$jscoverage['/format.js'].lineData[410] = 0;
  _$jscoverage['/format.js'].lineData[411] = 0;
  _$jscoverage['/format.js'].lineData[413] = 0;
  _$jscoverage['/format.js'].lineData[416] = 0;
  _$jscoverage['/format.js'].lineData[417] = 0;
  _$jscoverage['/format.js'].lineData[421] = 0;
  _$jscoverage['/format.js'].lineData[422] = 0;
  _$jscoverage['/format.js'].lineData[423] = 0;
  _$jscoverage['/format.js'].lineData[424] = 0;
  _$jscoverage['/format.js'].lineData[426] = 0;
  _$jscoverage['/format.js'].lineData[427] = 0;
  _$jscoverage['/format.js'].lineData[430] = 0;
  _$jscoverage['/format.js'].lineData[436] = 0;
  _$jscoverage['/format.js'].lineData[437] = 0;
  _$jscoverage['/format.js'].lineData[438] = 0;
  _$jscoverage['/format.js'].lineData[439] = 0;
  _$jscoverage['/format.js'].lineData[442] = 0;
  _$jscoverage['/format.js'].lineData[445] = 0;
  _$jscoverage['/format.js'].lineData[446] = 0;
  _$jscoverage['/format.js'].lineData[448] = 0;
  _$jscoverage['/format.js'].lineData[449] = 0;
  _$jscoverage['/format.js'].lineData[450] = 0;
  _$jscoverage['/format.js'].lineData[451] = 0;
  _$jscoverage['/format.js'].lineData[454] = 0;
  _$jscoverage['/format.js'].lineData[457] = 0;
  _$jscoverage['/format.js'].lineData[458] = 0;
  _$jscoverage['/format.js'].lineData[459] = 0;
  _$jscoverage['/format.js'].lineData[460] = 0;
  _$jscoverage['/format.js'].lineData[461] = 0;
  _$jscoverage['/format.js'].lineData[463] = 0;
  _$jscoverage['/format.js'].lineData[464] = 0;
  _$jscoverage['/format.js'].lineData[465] = 0;
  _$jscoverage['/format.js'].lineData[468] = 0;
  _$jscoverage['/format.js'].lineData[470] = 0;
  _$jscoverage['/format.js'].lineData[471] = 0;
  _$jscoverage['/format.js'].lineData[472] = 0;
  _$jscoverage['/format.js'].lineData[474] = 0;
  _$jscoverage['/format.js'].lineData[480] = 0;
  _$jscoverage['/format.js'].lineData[481] = 0;
  _$jscoverage['/format.js'].lineData[482] = 0;
  _$jscoverage['/format.js'].lineData[483] = 0;
  _$jscoverage['/format.js'].lineData[485] = 0;
  _$jscoverage['/format.js'].lineData[487] = 0;
  _$jscoverage['/format.js'].lineData[488] = 0;
  _$jscoverage['/format.js'].lineData[489] = 0;
  _$jscoverage['/format.js'].lineData[490] = 0;
  _$jscoverage['/format.js'].lineData[491] = 0;
  _$jscoverage['/format.js'].lineData[494] = 0;
  _$jscoverage['/format.js'].lineData[497] = 0;
  _$jscoverage['/format.js'].lineData[499] = 0;
  _$jscoverage['/format.js'].lineData[500] = 0;
  _$jscoverage['/format.js'].lineData[501] = 0;
  _$jscoverage['/format.js'].lineData[502] = 0;
  _$jscoverage['/format.js'].lineData[503] = 0;
  _$jscoverage['/format.js'].lineData[506] = 0;
  _$jscoverage['/format.js'].lineData[508] = 0;
  _$jscoverage['/format.js'].lineData[510] = 0;
  _$jscoverage['/format.js'].lineData[511] = 0;
  _$jscoverage['/format.js'].lineData[512] = 0;
  _$jscoverage['/format.js'].lineData[514] = 0;
  _$jscoverage['/format.js'].lineData[517] = 0;
  _$jscoverage['/format.js'].lineData[518] = 0;
  _$jscoverage['/format.js'].lineData[521] = 0;
  _$jscoverage['/format.js'].lineData[522] = 0;
  _$jscoverage['/format.js'].lineData[524] = 0;
  _$jscoverage['/format.js'].lineData[526] = 0;
  _$jscoverage['/format.js'].lineData[527] = 0;
  _$jscoverage['/format.js'].lineData[529] = 0;
  _$jscoverage['/format.js'].lineData[531] = 0;
  _$jscoverage['/format.js'].lineData[534] = 0;
  _$jscoverage['/format.js'].lineData[536] = 0;
  _$jscoverage['/format.js'].lineData[538] = 0;
  _$jscoverage['/format.js'].lineData[539] = 0;
  _$jscoverage['/format.js'].lineData[540] = 0;
  _$jscoverage['/format.js'].lineData[541] = 0;
  _$jscoverage['/format.js'].lineData[542] = 0;
  _$jscoverage['/format.js'].lineData[543] = 0;
  _$jscoverage['/format.js'].lineData[547] = 0;
  _$jscoverage['/format.js'].lineData[550] = 0;
  _$jscoverage['/format.js'].lineData[552] = 0;
  _$jscoverage['/format.js'].lineData[553] = 0;
  _$jscoverage['/format.js'].lineData[554] = 0;
  _$jscoverage['/format.js'].lineData[555] = 0;
  _$jscoverage['/format.js'].lineData[557] = 0;
  _$jscoverage['/format.js'].lineData[559] = 0;
  _$jscoverage['/format.js'].lineData[561] = 0;
  _$jscoverage['/format.js'].lineData[562] = 0;
  _$jscoverage['/format.js'].lineData[563] = 0;
  _$jscoverage['/format.js'].lineData[564] = 0;
  _$jscoverage['/format.js'].lineData[566] = 0;
  _$jscoverage['/format.js'].lineData[568] = 0;
  _$jscoverage['/format.js'].lineData[570] = 0;
  _$jscoverage['/format.js'].lineData[572] = 0;
  _$jscoverage['/format.js'].lineData[573] = 0;
  _$jscoverage['/format.js'].lineData[574] = 0;
  _$jscoverage['/format.js'].lineData[575] = 0;
  _$jscoverage['/format.js'].lineData[576] = 0;
  _$jscoverage['/format.js'].lineData[578] = 0;
  _$jscoverage['/format.js'].lineData[580] = 0;
  _$jscoverage['/format.js'].lineData[581] = 0;
  _$jscoverage['/format.js'].lineData[582] = 0;
  _$jscoverage['/format.js'].lineData[583] = 0;
  _$jscoverage['/format.js'].lineData[584] = 0;
  _$jscoverage['/format.js'].lineData[586] = 0;
  _$jscoverage['/format.js'].lineData[588] = 0;
  _$jscoverage['/format.js'].lineData[599] = 0;
  _$jscoverage['/format.js'].lineData[600] = 0;
  _$jscoverage['/format.js'].lineData[601] = 0;
  _$jscoverage['/format.js'].lineData[604] = 0;
  _$jscoverage['/format.js'].lineData[605] = 0;
  _$jscoverage['/format.js'].lineData[607] = 0;
  _$jscoverage['/format.js'].lineData[610] = 0;
  _$jscoverage['/format.js'].lineData[617] = 0;
  _$jscoverage['/format.js'].lineData[618] = 0;
  _$jscoverage['/format.js'].lineData[620] = 0;
  _$jscoverage['/format.js'].lineData[621] = 0;
  _$jscoverage['/format.js'].lineData[625] = 0;
  _$jscoverage['/format.js'].lineData[626] = 0;
  _$jscoverage['/format.js'].lineData[627] = 0;
  _$jscoverage['/format.js'].lineData[628] = 0;
  _$jscoverage['/format.js'].lineData[629] = 0;
  _$jscoverage['/format.js'].lineData[630] = 0;
  _$jscoverage['/format.js'].lineData[633] = 0;
  _$jscoverage['/format.js'].lineData[642] = 0;
  _$jscoverage['/format.js'].lineData[655] = 0;
  _$jscoverage['/format.js'].lineData[656] = 0;
  _$jscoverage['/format.js'].lineData[657] = 0;
  _$jscoverage['/format.js'].lineData[658] = 0;
  _$jscoverage['/format.js'].lineData[659] = 0;
  _$jscoverage['/format.js'].lineData[660] = 0;
  _$jscoverage['/format.js'].lineData[661] = 0;
  _$jscoverage['/format.js'].lineData[662] = 0;
  _$jscoverage['/format.js'].lineData[664] = 0;
  _$jscoverage['/format.js'].lineData[665] = 0;
  _$jscoverage['/format.js'].lineData[666] = 0;
  _$jscoverage['/format.js'].lineData[667] = 0;
  _$jscoverage['/format.js'].lineData[670] = 0;
  _$jscoverage['/format.js'].lineData[672] = 0;
  _$jscoverage['/format.js'].lineData[673] = 0;
  _$jscoverage['/format.js'].lineData[674] = 0;
  _$jscoverage['/format.js'].lineData[675] = 0;
  _$jscoverage['/format.js'].lineData[676] = 0;
  _$jscoverage['/format.js'].lineData[677] = 0;
  _$jscoverage['/format.js'].lineData[679] = 0;
  _$jscoverage['/format.js'].lineData[680] = 0;
  _$jscoverage['/format.js'].lineData[681] = 0;
  _$jscoverage['/format.js'].lineData[685] = 0;
  _$jscoverage['/format.js'].lineData[693] = 0;
  _$jscoverage['/format.js'].lineData[694] = 0;
  _$jscoverage['/format.js'].lineData[700] = 0;
  _$jscoverage['/format.js'].lineData[701] = 0;
  _$jscoverage['/format.js'].lineData[702] = 0;
  _$jscoverage['/format.js'].lineData[703] = 0;
  _$jscoverage['/format.js'].lineData[704] = 0;
  _$jscoverage['/format.js'].lineData[706] = 0;
  _$jscoverage['/format.js'].lineData[710] = 0;
  _$jscoverage['/format.js'].lineData[723] = 0;
  _$jscoverage['/format.js'].lineData[735] = 0;
  _$jscoverage['/format.js'].lineData[748] = 0;
  _$jscoverage['/format.js'].lineData[749] = 0;
  _$jscoverage['/format.js'].lineData[750] = 0;
  _$jscoverage['/format.js'].lineData[751] = 0;
  _$jscoverage['/format.js'].lineData[753] = 0;
  _$jscoverage['/format.js'].lineData[754] = 0;
  _$jscoverage['/format.js'].lineData[755] = 0;
  _$jscoverage['/format.js'].lineData[757] = 0;
  _$jscoverage['/format.js'].lineData[758] = 0;
  _$jscoverage['/format.js'].lineData[759] = 0;
  _$jscoverage['/format.js'].lineData[760] = 0;
  _$jscoverage['/format.js'].lineData[765] = 0;
  _$jscoverage['/format.js'].lineData[768] = 0;
  _$jscoverage['/format.js'].lineData[780] = 0;
  _$jscoverage['/format.js'].lineData[784] = 0;
}
if (! _$jscoverage['/format.js'].functionData) {
  _$jscoverage['/format.js'].functionData = [];
  _$jscoverage['/format.js'].functionData[0] = 0;
  _$jscoverage['/format.js'].functionData[1] = 0;
  _$jscoverage['/format.js'].functionData[2] = 0;
  _$jscoverage['/format.js'].functionData[3] = 0;
  _$jscoverage['/format.js'].functionData[4] = 0;
  _$jscoverage['/format.js'].functionData[5] = 0;
  _$jscoverage['/format.js'].functionData[6] = 0;
  _$jscoverage['/format.js'].functionData[7] = 0;
  _$jscoverage['/format.js'].functionData[8] = 0;
  _$jscoverage['/format.js'].functionData[9] = 0;
  _$jscoverage['/format.js'].functionData[10] = 0;
  _$jscoverage['/format.js'].functionData[11] = 0;
  _$jscoverage['/format.js'].functionData[12] = 0;
  _$jscoverage['/format.js'].functionData[13] = 0;
  _$jscoverage['/format.js'].functionData[14] = 0;
  _$jscoverage['/format.js'].functionData[15] = 0;
  _$jscoverage['/format.js'].functionData[16] = 0;
  _$jscoverage['/format.js'].functionData[17] = 0;
}
if (! _$jscoverage['/format.js'].branchData) {
  _$jscoverage['/format.js'].branchData = {};
  _$jscoverage['/format.js'].branchData['103'] = [];
  _$jscoverage['/format.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['106'] = [];
  _$jscoverage['/format.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['109'] = [];
  _$jscoverage['/format.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['111'] = [];
  _$jscoverage['/format.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['113'] = [];
  _$jscoverage['/format.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['118'] = [];
  _$jscoverage['/format.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['124'] = [];
  _$jscoverage['/format.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['125'] = [];
  _$jscoverage['/format.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['140'] = [];
  _$jscoverage['/format.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['144'] = [];
  _$jscoverage['/format.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['144'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['144'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['144'][4] = new BranchData();
  _$jscoverage['/format.js'].branchData['144'][5] = new BranchData();
  _$jscoverage['/format.js'].branchData['144'][6] = new BranchData();
  _$jscoverage['/format.js'].branchData['144'][7] = new BranchData();
  _$jscoverage['/format.js'].branchData['144'][8] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'] = [];
  _$jscoverage['/format.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['156'] = [];
  _$jscoverage['/format.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['160'] = [];
  _$jscoverage['/format.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['160'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['160'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['170'] = [];
  _$jscoverage['/format.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['174'] = [];
  _$jscoverage['/format.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['189'] = [];
  _$jscoverage['/format.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['190'] = [];
  _$jscoverage['/format.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['191'] = [];
  _$jscoverage['/format.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['192'] = [];
  _$jscoverage['/format.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['192'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['192'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['192'][4] = new BranchData();
  _$jscoverage['/format.js'].branchData['192'][5] = new BranchData();
  _$jscoverage['/format.js'].branchData['193'] = [];
  _$jscoverage['/format.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['193'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['193'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['198'] = [];
  _$jscoverage['/format.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['198'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['198'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['199'] = [];
  _$jscoverage['/format.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['203'] = [];
  _$jscoverage['/format.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['203'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['203'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['338'] = [];
  _$jscoverage['/format.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['348'] = [];
  _$jscoverage['/format.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['353'] = [];
  _$jscoverage['/format.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['356'] = [];
  _$jscoverage['/format.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['360'] = [];
  _$jscoverage['/format.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['362'] = [];
  _$jscoverage['/format.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['369'] = [];
  _$jscoverage['/format.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['374'] = [];
  _$jscoverage['/format.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['379'] = [];
  _$jscoverage['/format.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['385'] = [];
  _$jscoverage['/format.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['393'] = [];
  _$jscoverage['/format.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['421'] = [];
  _$jscoverage['/format.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['424'] = [];
  _$jscoverage['/format.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['424'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['430'] = [];
  _$jscoverage['/format.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['437'] = [];
  _$jscoverage['/format.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['438'] = [];
  _$jscoverage['/format.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['448'] = [];
  _$jscoverage['/format.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['450'] = [];
  _$jscoverage['/format.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['450'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['450'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['459'] = [];
  _$jscoverage['/format.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['460'] = [];
  _$jscoverage['/format.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['464'] = [];
  _$jscoverage['/format.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['471'] = [];
  _$jscoverage['/format.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['482'] = [];
  _$jscoverage['/format.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['488'] = [];
  _$jscoverage['/format.js'].branchData['488'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['489'] = [];
  _$jscoverage['/format.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['501'] = [];
  _$jscoverage['/format.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['502'] = [];
  _$jscoverage['/format.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['511'] = [];
  _$jscoverage['/format.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['512'] = [];
  _$jscoverage['/format.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['521'] = [];
  _$jscoverage['/format.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['531'] = [];
  _$jscoverage['/format.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['539'] = [];
  _$jscoverage['/format.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['540'] = [];
  _$jscoverage['/format.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['542'] = [];
  _$jscoverage['/format.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['554'] = [];
  _$jscoverage['/format.js'].branchData['554'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['563'] = [];
  _$jscoverage['/format.js'].branchData['563'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['572'] = [];
  _$jscoverage['/format.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['575'] = [];
  _$jscoverage['/format.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['604'] = [];
  _$jscoverage['/format.js'].branchData['604'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['625'] = [];
  _$jscoverage['/format.js'].branchData['625'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['627'] = [];
  _$jscoverage['/format.js'].branchData['627'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['629'] = [];
  _$jscoverage['/format.js'].branchData['629'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['656'] = [];
  _$jscoverage['/format.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['656'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['656'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['661'] = [];
  _$jscoverage['/format.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['664'] = [];
  _$jscoverage['/format.js'].branchData['664'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['665'] = [];
  _$jscoverage['/format.js'].branchData['665'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['672'] = [];
  _$jscoverage['/format.js'].branchData['672'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['675'] = [];
  _$jscoverage['/format.js'].branchData['675'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['676'] = [];
  _$jscoverage['/format.js'].branchData['676'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['680'] = [];
  _$jscoverage['/format.js'].branchData['680'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['680'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['680'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['693'] = [];
  _$jscoverage['/format.js'].branchData['693'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['700'] = [];
  _$jscoverage['/format.js'].branchData['700'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['748'] = [];
  _$jscoverage['/format.js'].branchData['748'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['750'] = [];
  _$jscoverage['/format.js'].branchData['750'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['754'] = [];
  _$jscoverage['/format.js'].branchData['754'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['758'] = [];
  _$jscoverage['/format.js'].branchData['758'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['759'] = [];
  _$jscoverage['/format.js'].branchData['759'][1] = new BranchData();
}
_$jscoverage['/format.js'].branchData['759'][1].init(21, 11, 'datePattern');
function visit106_759_1(result) {
  _$jscoverage['/format.js'].branchData['759'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['758'][1].init(408, 11, 'timePattern');
function visit105_758_1(result) {
  _$jscoverage['/format.js'].branchData['758'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['754'][1].init(250, 23, 'timeStyle !== undefined');
function visit104_754_1(result) {
  _$jscoverage['/format.js'].branchData['754'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['750'][1].init(97, 23, 'dateStyle !== undefined');
function visit103_750_1(result) {
  _$jscoverage['/format.js'].branchData['750'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['748'][1].init(22, 23, 'locale || defaultLocale');
function visit102_748_1(result) {
  _$jscoverage['/format.js'].branchData['748'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['700'][1].init(2451, 15, 'errorIndex >= 0');
function visit101_700_1(result) {
  _$jscoverage['/format.js'].branchData['700'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['693'][1].init(907, 28, 'startIndex === oldStartIndex');
function visit100_693_1(result) {
  _$jscoverage['/format.js'].branchData['693'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['680'][3].init(114, 8, 'c <= \'9\'');
function visit99_680_3(result) {
  _$jscoverage['/format.js'].branchData['680'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['680'][2].init(102, 8, 'c >= \'0\'');
function visit98_680_2(result) {
  _$jscoverage['/format.js'].branchData['680'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['680'][1].init(102, 20, 'c >= \'0\' && c <= \'9\'');
function visit97_680_1(result) {
  _$jscoverage['/format.js'].branchData['680'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['676'][1].init(33, 19, '\'field\' in nextComp');
function visit96_676_1(result) {
  _$jscoverage['/format.js'].branchData['676'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['675'][1].init(127, 8, 'nextComp');
function visit95_675_1(result) {
  _$jscoverage['/format.js'].branchData['675'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['672'][1].init(791, 15, '\'field\' in comp');
function visit94_672_1(result) {
  _$jscoverage['/format.js'].branchData['672'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['665'][1].init(37, 49, 'text.charAt(j) !== dateStr.charAt(j + startIndex)');
function visit93_665_1(result) {
  _$jscoverage['/format.js'].branchData['665'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['664'][1].init(41, 11, 'j < textLen');
function visit92_664_1(result) {
  _$jscoverage['/format.js'].branchData['664'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['661'][1].init(77, 34, '(textLen + startIndex) > dateStrLen');
function visit91_661_1(result) {
  _$jscoverage['/format.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['656'][3].init(47, 7, 'i < len');
function visit90_656_3(result) {
  _$jscoverage['/format.js'].branchData['656'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['656'][2].init(29, 14, 'errorIndex < 0');
function visit89_656_2(result) {
  _$jscoverage['/format.js'].branchData['656'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['656'][1].init(29, 25, 'errorIndex < 0 && i < len');
function visit88_656_1(result) {
  _$jscoverage['/format.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['629'][1].init(142, 15, '\'field\' in comp');
function visit87_629_1(result) {
  _$jscoverage['/format.js'].branchData['629'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['627'][1].init(60, 9, 'comp.text');
function visit86_627_1(result) {
  _$jscoverage['/format.js'].branchData['627'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['625'][1].init(361, 7, 'i < len');
function visit85_625_1(result) {
  _$jscoverage['/format.js'].branchData['625'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['604'][1].init(4670, 5, 'match');
function visit84_604_1(result) {
  _$jscoverage['/format.js'].branchData['604'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['575'][1].init(231, 16, 'zoneChar === \'+\'');
function visit83_575_1(result) {
  _$jscoverage['/format.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['572'][1].init(118, 16, 'zoneChar === \'-\'');
function visit82_572_1(result) {
  _$jscoverage['/format.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['563'][1].init(65, 8, 'tmp.ampm');
function visit81_563_1(result) {
  _$jscoverage['/format.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['554'][1].init(71, 8, 'tmp.ampm');
function visit80_554_1(result) {
  _$jscoverage['/format.js'].branchData['554'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['542'][1].init(93, 9, 'hour < 12');
function visit79_542_1(result) {
  _$jscoverage['/format.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['540'][1].init(29, 11, 'match.value');
function visit78_540_1(result) {
  _$jscoverage['/format.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['539'][1].init(25, 25, 'calendar.isSetHourOfDay()');
function visit77_539_1(result) {
  _$jscoverage['/format.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['531'][1].init(77, 9, 'count > 3');
function visit76_531_1(result) {
  _$jscoverage['/format.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['521'][1].init(500, 5, 'match');
function visit75_521_1(result) {
  _$jscoverage['/format.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['512'][1].init(73, 11, 'count === 3');
function visit74_512_1(result) {
  _$jscoverage['/format.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['511'][1].init(56, 10, 'count >= 3');
function visit73_511_1(result) {
  _$jscoverage['/format.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['502'][1].init(29, 13, 'tmp.era === 0');
function visit72_502_1(result) {
  _$jscoverage['/format.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['501'][1].init(65, 12, '\'era\' in tmp');
function visit71_501_1(result) {
  _$jscoverage['/format.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['489'][1].init(29, 17, 'match.value === 0');
function visit70_489_1(result) {
  _$jscoverage['/format.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['488'][1].init(25, 20, 'calendar.isSetYear()');
function visit69_488_1(result) {
  _$jscoverage['/format.js'].branchData['488'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['482'][1].init(44, 28, 'dateStr.length <= startIndex');
function visit68_482_1(result) {
  _$jscoverage['/format.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['471'][1].init(409, 8, 'isNaN(n)');
function visit67_471_1(result) {
  _$jscoverage['/format.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['464'][1].init(172, 19, '!str.match(/^\\d+$/)');
function visit66_464_1(result) {
  _$jscoverage['/format.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['460'][1].init(17, 36, 'dateStr.length <= startIndex + count');
function visit65_460_1(result) {
  _$jscoverage['/format.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['459'][1].init(44, 9, 'obeyCount');
function visit64_459_1(result) {
  _$jscoverage['/format.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['450'][3].init(59, 7, 'c > \'9\'');
function visit63_450_3(result) {
  _$jscoverage['/format.js'].branchData['450'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['450'][2].init(48, 7, 'c < \'0\'');
function visit62_450_2(result) {
  _$jscoverage['/format.js'].branchData['450'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['450'][1].init(48, 18, 'c < \'0\' || c > \'9\'');
function visit61_450_1(result) {
  _$jscoverage['/format.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['448'][1].init(69, 7, 'i < len');
function visit60_448_1(result) {
  _$jscoverage['/format.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['438'][1].init(17, 50, 'dateStr.charAt(startIndex + i) !== match.charAt(i)');
function visit59_438_1(result) {
  _$jscoverage['/format.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['437'][1].init(25, 8, 'i < mLen');
function visit58_437_1(result) {
  _$jscoverage['/format.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['430'][1].init(407, 10, 'index >= 0');
function visit57_430_1(result) {
  _$jscoverage['/format.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['424'][2].init(82, 17, 'mLen > matchedLen');
function visit56_424_2(result) {
  _$jscoverage['/format.js'].branchData['424'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['424'][1].init(82, 82, 'mLen > matchedLen && matchPartString(dateStr, startIndex, m, mLen)');
function visit55_424_1(result) {
  _$jscoverage['/format.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['421'][1].init(123, 7, 'i < len');
function visit54_421_1(result) {
  _$jscoverage['/format.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['393'][1].init(97, 10, 'offset < 0');
function visit53_393_1(result) {
  _$jscoverage['/format.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['385'][1].init(17, 55, 'calendar.getHourOfDay() % 12 || 12');
function visit52_385_1(result) {
  _$jscoverage['/format.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['379'][1].init(48, 29, 'calendar.getHourOfDay() >= 12');
function visit51_379_1(result) {
  _$jscoverage['/format.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['374'][1].init(84, 10, 'count >= 4');
function visit50_374_1(result) {
  _$jscoverage['/format.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['369'][1].init(53, 29, 'calendar.getHourOfDay() || 24');
function visit49_369_1(result) {
  _$jscoverage['/format.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['362'][1].init(168, 11, 'count === 3');
function visit48_362_1(result) {
  _$jscoverage['/format.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['360'][1].init(74, 10, 'count >= 4');
function visit47_360_1(result) {
  _$jscoverage['/format.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['356'][1].init(199, 11, 'count !== 2');
function visit46_356_1(result) {
  _$jscoverage['/format.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['353'][1].init(73, 10, 'value <= 0');
function visit45_353_1(result) {
  _$jscoverage['/format.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['348'][1].init(33, 22, 'calendar.getYear() > 0');
function visit44_348_1(result) {
  _$jscoverage['/format.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['338'][1].init(23, 23, 'locale || defaultLocale');
function visit43_338_1(result) {
  _$jscoverage['/format.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['203'][3].init(181, 15, 'maxDigits === 2');
function visit42_203_3(result) {
  _$jscoverage['/format.js'].branchData['203'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['203'][2].init(162, 15, 'minDigits === 2');
function visit41_203_2(result) {
  _$jscoverage['/format.js'].branchData['203'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['203'][1].init(162, 34, 'minDigits === 2 && maxDigits === 2');
function visit40_203_1(result) {
  _$jscoverage['/format.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['199'][1].init(21, 15, 'minDigits === 4');
function visit39_199_1(result) {
  _$jscoverage['/format.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['198'][3].init(300, 13, 'value < 10000');
function visit38_198_3(result) {
  _$jscoverage['/format.js'].branchData['198'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['198'][2].init(283, 13, 'value >= 1000');
function visit37_198_2(result) {
  _$jscoverage['/format.js'].branchData['198'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['198'][1].init(283, 30, 'value >= 1000 && value < 10000');
function visit36_198_1(result) {
  _$jscoverage['/format.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['193'][3].init(35, 15, 'minDigits === 2');
function visit35_193_3(result) {
  _$jscoverage['/format.js'].branchData['193'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['193'][2].init(21, 10, 'value < 10');
function visit34_193_2(result) {
  _$jscoverage['/format.js'].branchData['193'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['193'][1].init(21, 29, 'value < 10 && minDigits === 2');
function visit33_193_1(result) {
  _$jscoverage['/format.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['192'][5].init(50, 14, 'minDigits <= 2');
function visit32_192_5(result) {
  _$jscoverage['/format.js'].branchData['192'][5].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['192'][4].init(32, 14, 'minDigits >= 1');
function visit31_192_4(result) {
  _$jscoverage['/format.js'].branchData['192'][4].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['192'][3].init(32, 32, 'minDigits >= 1 && minDigits <= 2');
function visit30_192_3(result) {
  _$jscoverage['/format.js'].branchData['192'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['192'][2].init(17, 11, 'value < 100');
function visit29_192_2(result) {
  _$jscoverage['/format.js'].branchData['192'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['192'][1].init(17, 47, 'value < 100 && minDigits >= 1 && minDigits <= 2');
function visit28_192_1(result) {
  _$jscoverage['/format.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['191'][1].init(355, 10, 'value >= 0');
function visit27_191_1(result) {
  _$jscoverage['/format.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['190'][1].init(319, 22, 'maxDigits || MAX_VALUE');
function visit26_190_1(result) {
  _$jscoverage['/format.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['189'][1].init(285, 12, 'buffer || []');
function visit25_189_1(result) {
  _$jscoverage['/format.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['174'][1].init(2481, 11, 'count !== 0');
function visit24_174_1(result) {
  _$jscoverage['/format.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['170'][1].init(2396, 7, 'inQuote');
function visit23_170_1(result) {
  _$jscoverage['/format.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['160'][3].init(1928, 15, 'lastField === c');
function visit22_160_3(result) {
  _$jscoverage['/format.js'].branchData['160'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['160'][2].init(1908, 16, 'lastField === -1');
function visit21_160_2(result) {
  _$jscoverage['/format.js'].branchData['160'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['160'][1].init(1908, 35, 'lastField === -1 || lastField === c');
function visit20_160_1(result) {
  _$jscoverage['/format.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['156'][1].init(1769, 30, 'patternChars.indexOf(c) === -1');
function visit19_156_1(result) {
  _$jscoverage['/format.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][1].init(21, 11, 'count !== 0');
function visit18_145_1(result) {
  _$jscoverage['/format.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['144'][8].init(1429, 8, 'c <= \'Z\'');
function visit17_144_8(result) {
  _$jscoverage['/format.js'].branchData['144'][8].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['144'][7].init(1417, 8, 'c >= \'A\'');
function visit16_144_7(result) {
  _$jscoverage['/format.js'].branchData['144'][7].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['144'][6].init(1417, 20, 'c >= \'A\' && c <= \'Z\'');
function visit15_144_6(result) {
  _$jscoverage['/format.js'].branchData['144'][6].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['144'][5].init(1405, 8, 'c <= \'z\'');
function visit14_144_5(result) {
  _$jscoverage['/format.js'].branchData['144'][5].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['144'][4].init(1393, 8, 'c >= \'a\'');
function visit13_144_4(result) {
  _$jscoverage['/format.js'].branchData['144'][4].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['144'][3].init(1393, 20, 'c >= \'a\' && c <= \'z\'');
function visit12_144_3(result) {
  _$jscoverage['/format.js'].branchData['144'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['144'][2].init(1393, 44, 'c >= \'a\' && c <= \'z\' || c >= \'A\' && c <= \'Z\'');
function visit11_144_2(result) {
  _$jscoverage['/format.js'].branchData['144'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['144'][1].init(1391, 47, '!(c >= \'a\' && c <= \'z\' || c >= \'A\' && c <= \'Z\')');
function visit10_144_1(result) {
  _$jscoverage['/format.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['140'][1].init(1292, 7, 'inQuote');
function visit9_140_1(result) {
  _$jscoverage['/format.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['125'][1].init(25, 11, 'count !== 0');
function visit8_125_1(result) {
  _$jscoverage['/format.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['124'][1].init(692, 8, '!inQuote');
function visit7_124_1(result) {
  _$jscoverage['/format.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['118'][1].init(281, 7, 'inQuote');
function visit6_118_1(result) {
  _$jscoverage['/format.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['113'][1].init(58, 11, 'count !== 0');
function visit5_113_1(result) {
  _$jscoverage['/format.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['111'][1].init(72, 10, 'c === \'\\\'\'');
function visit4_111_1(result) {
  _$jscoverage['/format.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['109'][1].init(133, 15, '(i + 1) < length');
function visit3_109_1(result) {
  _$jscoverage['/format.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['106'][1].init(57, 10, 'c === \'\\\'\'');
function visit2_106_1(result) {
  _$jscoverage['/format.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['103'][1].init(207, 10, 'i < length');
function visit1_103_1(result) {
  _$jscoverage['/format.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].lineData[7]++;
KISSY.add(function(S, require) {
  _$jscoverage['/format.js'].functionData[0]++;
  _$jscoverage['/format.js'].lineData[8]++;
  var GregorianCalendar = require('date/gregorian');
  _$jscoverage['/format.js'].lineData[9]++;
  var defaultLocale = require('i18n!date');
  _$jscoverage['/format.js'].lineData[10]++;
  var MAX_VALUE = Number.MAX_VALUE, DateTimeStyle = {
  FULL: 0, 
  LONG: 1, 
  MEDIUM: 2, 
  SHORT: 3};
  _$jscoverage['/format.js'].lineData[33]++;
  var logger = S.getLogger('s/date/format');
  _$jscoverage['/format.js'].lineData[58]++;
  var patternChars = new Array(GregorianCalendar.DAY_OF_WEEK_IN_MONTH + 2).join('1');
  _$jscoverage['/format.js'].lineData[61]++;
  var ERA = 0;
  _$jscoverage['/format.js'].lineData[63]++;
  var calendarIndexMap = {};
  _$jscoverage['/format.js'].lineData[65]++;
  patternChars = patternChars.split('');
  _$jscoverage['/format.js'].lineData[66]++;
  patternChars[ERA] = 'G';
  _$jscoverage['/format.js'].lineData[67]++;
  patternChars[GregorianCalendar.YEAR] = 'y';
  _$jscoverage['/format.js'].lineData[68]++;
  patternChars[GregorianCalendar.MONTH] = 'M';
  _$jscoverage['/format.js'].lineData[69]++;
  patternChars[GregorianCalendar.DAY_OF_MONTH] = 'd';
  _$jscoverage['/format.js'].lineData[70]++;
  patternChars[GregorianCalendar.HOUR_OF_DAY] = 'H';
  _$jscoverage['/format.js'].lineData[71]++;
  patternChars[GregorianCalendar.MINUTES] = 'm';
  _$jscoverage['/format.js'].lineData[72]++;
  patternChars[GregorianCalendar.SECONDS] = 's';
  _$jscoverage['/format.js'].lineData[73]++;
  patternChars[GregorianCalendar.MILLISECONDS] = 'S';
  _$jscoverage['/format.js'].lineData[74]++;
  patternChars[GregorianCalendar.WEEK_OF_YEAR] = 'w';
  _$jscoverage['/format.js'].lineData[75]++;
  patternChars[GregorianCalendar.WEEK_OF_MONTH] = 'W';
  _$jscoverage['/format.js'].lineData[76]++;
  patternChars[GregorianCalendar.DAY_OF_YEAR] = 'D';
  _$jscoverage['/format.js'].lineData[77]++;
  patternChars[GregorianCalendar.DAY_OF_WEEK_IN_MONTH] = 'F';
  _$jscoverage['/format.js'].lineData[79]++;
  S.each(patternChars, function(v, index) {
  _$jscoverage['/format.js'].functionData[1]++;
  _$jscoverage['/format.js'].lineData[80]++;
  calendarIndexMap[v] = index;
});
  _$jscoverage['/format.js'].lineData[83]++;
  patternChars = patternChars.join('') + 'ahkKZE';
  _$jscoverage['/format.js'].lineData[88]++;
  function encode(lastField, count, compiledPattern) {
    _$jscoverage['/format.js'].functionData[2]++;
    _$jscoverage['/format.js'].lineData[89]++;
    compiledPattern.push({
  field: lastField, 
  count: count});
  }
  _$jscoverage['/format.js'].lineData[95]++;
  function compile(pattern) {
    _$jscoverage['/format.js'].functionData[3]++;
    _$jscoverage['/format.js'].lineData[96]++;
    var length = pattern.length;
    _$jscoverage['/format.js'].lineData[97]++;
    var inQuote = false;
    _$jscoverage['/format.js'].lineData[98]++;
    var compiledPattern = [];
    _$jscoverage['/format.js'].lineData[99]++;
    var tmpBuffer = null;
    _$jscoverage['/format.js'].lineData[100]++;
    var count = 0;
    _$jscoverage['/format.js'].lineData[101]++;
    var lastField = -1;
    _$jscoverage['/format.js'].lineData[103]++;
    for (var i = 0; visit1_103_1(i < length); i++) {
      _$jscoverage['/format.js'].lineData[104]++;
      var c = pattern.charAt(i);
      _$jscoverage['/format.js'].lineData[106]++;
      if (visit2_106_1(c === '\'')) {
        _$jscoverage['/format.js'].lineData[109]++;
        if (visit3_109_1((i + 1) < length)) {
          _$jscoverage['/format.js'].lineData[110]++;
          c = pattern.charAt(i + 1);
          _$jscoverage['/format.js'].lineData[111]++;
          if (visit4_111_1(c === '\'')) {
            _$jscoverage['/format.js'].lineData[112]++;
            i++;
            _$jscoverage['/format.js'].lineData[113]++;
            if (visit5_113_1(count !== 0)) {
              _$jscoverage['/format.js'].lineData[114]++;
              encode(lastField, count, compiledPattern);
              _$jscoverage['/format.js'].lineData[115]++;
              lastField = -1;
              _$jscoverage['/format.js'].lineData[116]++;
              count = 0;
            }
            _$jscoverage['/format.js'].lineData[118]++;
            if (visit6_118_1(inQuote)) {
              _$jscoverage['/format.js'].lineData[119]++;
              tmpBuffer += c;
            }
            _$jscoverage['/format.js'].lineData[121]++;
            continue;
          }
        }
        _$jscoverage['/format.js'].lineData[124]++;
        if (visit7_124_1(!inQuote)) {
          _$jscoverage['/format.js'].lineData[125]++;
          if (visit8_125_1(count !== 0)) {
            _$jscoverage['/format.js'].lineData[126]++;
            encode(lastField, count, compiledPattern);
            _$jscoverage['/format.js'].lineData[127]++;
            lastField = -1;
            _$jscoverage['/format.js'].lineData[128]++;
            count = 0;
          }
          _$jscoverage['/format.js'].lineData[130]++;
          tmpBuffer = '';
          _$jscoverage['/format.js'].lineData[131]++;
          inQuote = true;
        } else {
          _$jscoverage['/format.js'].lineData[133]++;
          compiledPattern.push({
  text: tmpBuffer});
          _$jscoverage['/format.js'].lineData[136]++;
          inQuote = false;
        }
        _$jscoverage['/format.js'].lineData[138]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[140]++;
      if (visit9_140_1(inQuote)) {
        _$jscoverage['/format.js'].lineData[141]++;
        tmpBuffer += c;
        _$jscoverage['/format.js'].lineData[142]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[144]++;
      if (visit10_144_1(!(visit11_144_2(visit12_144_3(visit13_144_4(c >= 'a') && visit14_144_5(c <= 'z')) || visit15_144_6(visit16_144_7(c >= 'A') && visit17_144_8(c <= 'Z')))))) {
        _$jscoverage['/format.js'].lineData[145]++;
        if (visit18_145_1(count !== 0)) {
          _$jscoverage['/format.js'].lineData[146]++;
          encode(lastField, count, compiledPattern);
          _$jscoverage['/format.js'].lineData[147]++;
          lastField = -1;
          _$jscoverage['/format.js'].lineData[148]++;
          count = 0;
        }
        _$jscoverage['/format.js'].lineData[150]++;
        compiledPattern.push({
  text: c});
        _$jscoverage['/format.js'].lineData[153]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[156]++;
      if (visit19_156_1(patternChars.indexOf(c) === -1)) {
        _$jscoverage['/format.js'].lineData[157]++;
        throw new Error('Illegal pattern character "' + c + '"');
      }
      _$jscoverage['/format.js'].lineData[160]++;
      if (visit20_160_1(visit21_160_2(lastField === -1) || visit22_160_3(lastField === c))) {
        _$jscoverage['/format.js'].lineData[161]++;
        lastField = c;
        _$jscoverage['/format.js'].lineData[162]++;
        count++;
        _$jscoverage['/format.js'].lineData[163]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[165]++;
      encode(lastField, count, compiledPattern);
      _$jscoverage['/format.js'].lineData[166]++;
      lastField = c;
      _$jscoverage['/format.js'].lineData[167]++;
      count = 1;
    }
    _$jscoverage['/format.js'].lineData[170]++;
    if (visit23_170_1(inQuote)) {
      _$jscoverage['/format.js'].lineData[171]++;
      throw new Error('Unterminated quote');
    }
    _$jscoverage['/format.js'].lineData[174]++;
    if (visit24_174_1(count !== 0)) {
      _$jscoverage['/format.js'].lineData[175]++;
      encode(lastField, count, compiledPattern);
    }
    _$jscoverage['/format.js'].lineData[178]++;
    return compiledPattern;
  }
  _$jscoverage['/format.js'].lineData[181]++;
  var zeroDigit = '0';
  _$jscoverage['/format.js'].lineData[184]++;
  function zeroPaddingNumber(value, minDigits, maxDigits, buffer) {
    _$jscoverage['/format.js'].functionData[4]++;
    _$jscoverage['/format.js'].lineData[189]++;
    buffer = visit25_189_1(buffer || []);
    _$jscoverage['/format.js'].lineData[190]++;
    maxDigits = visit26_190_1(maxDigits || MAX_VALUE);
    _$jscoverage['/format.js'].lineData[191]++;
    if (visit27_191_1(value >= 0)) {
      _$jscoverage['/format.js'].lineData[192]++;
      if (visit28_192_1(visit29_192_2(value < 100) && visit30_192_3(visit31_192_4(minDigits >= 1) && visit32_192_5(minDigits <= 2)))) {
        _$jscoverage['/format.js'].lineData[193]++;
        if (visit33_193_1(visit34_193_2(value < 10) && visit35_193_3(minDigits === 2))) {
          _$jscoverage['/format.js'].lineData[194]++;
          buffer.push(zeroDigit);
        }
        _$jscoverage['/format.js'].lineData[196]++;
        buffer.push(value);
        _$jscoverage['/format.js'].lineData[197]++;
        return buffer.join('');
      } else {
        _$jscoverage['/format.js'].lineData[198]++;
        if (visit36_198_1(visit37_198_2(value >= 1000) && visit38_198_3(value < 10000))) {
          _$jscoverage['/format.js'].lineData[199]++;
          if (visit39_199_1(minDigits === 4)) {
            _$jscoverage['/format.js'].lineData[200]++;
            buffer.push(value);
            _$jscoverage['/format.js'].lineData[201]++;
            return buffer.join('');
          }
          _$jscoverage['/format.js'].lineData[203]++;
          if (visit40_203_1(visit41_203_2(minDigits === 2) && visit42_203_3(maxDigits === 2))) {
            _$jscoverage['/format.js'].lineData[204]++;
            return zeroPaddingNumber(value % 100, 2, 2, buffer);
          }
        }
      }
    }
    _$jscoverage['/format.js'].lineData[208]++;
    buffer.push(value + '');
    _$jscoverage['/format.js'].lineData[209]++;
    return buffer.join('');
  }
  _$jscoverage['/format.js'].lineData[337]++;
  function DateTimeFormat(pattern, locale, timeZoneOffset) {
    _$jscoverage['/format.js'].functionData[5]++;
    _$jscoverage['/format.js'].lineData[338]++;
    this.locale = visit43_338_1(locale || defaultLocale);
    _$jscoverage['/format.js'].lineData[339]++;
    this.pattern = compile(pattern);
    _$jscoverage['/format.js'].lineData[340]++;
    this.timezoneOffset = timeZoneOffset;
  }
  _$jscoverage['/format.js'].lineData[343]++;
  function formatField(field, count, locale, calendar) {
    _$jscoverage['/format.js'].functionData[6]++;
    _$jscoverage['/format.js'].lineData[344]++;
    var current, value;
    _$jscoverage['/format.js'].lineData[346]++;
    switch (field) {
      case 'G':
        _$jscoverage['/format.js'].lineData[348]++;
        value = visit44_348_1(calendar.getYear() > 0) ? 1 : 0;
        _$jscoverage['/format.js'].lineData[349]++;
        current = locale.eras[value];
        _$jscoverage['/format.js'].lineData[350]++;
        break;
      case 'y':
        _$jscoverage['/format.js'].lineData[352]++;
        value = calendar.getYear();
        _$jscoverage['/format.js'].lineData[353]++;
        if (visit45_353_1(value <= 0)) {
          _$jscoverage['/format.js'].lineData[354]++;
          value = 1 - value;
        }
        _$jscoverage['/format.js'].lineData[356]++;
        current = (zeroPaddingNumber(value, 2, visit46_356_1(count !== 2) ? MAX_VALUE : 2));
        _$jscoverage['/format.js'].lineData[357]++;
        break;
      case 'M':
        _$jscoverage['/format.js'].lineData[359]++;
        value = calendar.getMonth();
        _$jscoverage['/format.js'].lineData[360]++;
        if (visit47_360_1(count >= 4)) {
          _$jscoverage['/format.js'].lineData[361]++;
          current = locale.months[value];
        } else {
          _$jscoverage['/format.js'].lineData[362]++;
          if (visit48_362_1(count === 3)) {
            _$jscoverage['/format.js'].lineData[363]++;
            current = locale.shortMonths[value];
          } else {
            _$jscoverage['/format.js'].lineData[365]++;
            current = zeroPaddingNumber(value + 1, count);
          }
        }
        _$jscoverage['/format.js'].lineData[367]++;
        break;
      case 'k':
        _$jscoverage['/format.js'].lineData[369]++;
        current = zeroPaddingNumber(visit49_369_1(calendar.getHourOfDay() || 24), count);
        _$jscoverage['/format.js'].lineData[371]++;
        break;
      case 'E':
        _$jscoverage['/format.js'].lineData[373]++;
        value = calendar.getDayOfWeek();
        _$jscoverage['/format.js'].lineData[374]++;
        current = visit50_374_1(count >= 4) ? locale.weekdays[value] : locale.shortWeekdays[value];
        _$jscoverage['/format.js'].lineData[377]++;
        break;
      case 'a':
        _$jscoverage['/format.js'].lineData[379]++;
        current = locale.ampms[visit51_379_1(calendar.getHourOfDay() >= 12) ? 1 : 0];
        _$jscoverage['/format.js'].lineData[382]++;
        break;
      case 'h':
        _$jscoverage['/format.js'].lineData[384]++;
        current = zeroPaddingNumber(visit52_385_1(calendar.getHourOfDay() % 12 || 12), count);
        _$jscoverage['/format.js'].lineData[386]++;
        break;
      case 'K':
        _$jscoverage['/format.js'].lineData[388]++;
        current = zeroPaddingNumber(calendar.getHourOfDay() % 12, count);
        _$jscoverage['/format.js'].lineData[390]++;
        break;
      case 'Z':
        _$jscoverage['/format.js'].lineData[392]++;
        var offset = calendar.getTimezoneOffset();
        _$jscoverage['/format.js'].lineData[393]++;
        var parts = [visit53_393_1(offset < 0) ? '-' : '+'];
        _$jscoverage['/format.js'].lineData[394]++;
        offset = Math.abs(offset);
        _$jscoverage['/format.js'].lineData[395]++;
        parts.push(zeroPaddingNumber(Math.floor(offset / 60) % 100, 2), zeroPaddingNumber(offset % 60, 2));
        _$jscoverage['/format.js'].lineData[397]++;
        current = parts.join('');
        _$jscoverage['/format.js'].lineData[398]++;
        break;
      default:
        _$jscoverage['/format.js'].lineData[409]++;
        var index = calendarIndexMap[field];
        _$jscoverage['/format.js'].lineData[410]++;
        value = calendar.get(index);
        _$jscoverage['/format.js'].lineData[411]++;
        current = zeroPaddingNumber(value, count);
    }
    _$jscoverage['/format.js'].lineData[413]++;
    return current;
  }
  _$jscoverage['/format.js'].lineData[416]++;
  function matchField(dateStr, startIndex, matches) {
    _$jscoverage['/format.js'].functionData[7]++;
    _$jscoverage['/format.js'].lineData[417]++;
    var matchedLen = -1, index = -1, i, len = matches.length;
    _$jscoverage['/format.js'].lineData[421]++;
    for (i = 0; visit54_421_1(i < len); i++) {
      _$jscoverage['/format.js'].lineData[422]++;
      var m = matches[i];
      _$jscoverage['/format.js'].lineData[423]++;
      var mLen = m.length;
      _$jscoverage['/format.js'].lineData[424]++;
      if (visit55_424_1(visit56_424_2(mLen > matchedLen) && matchPartString(dateStr, startIndex, m, mLen))) {
        _$jscoverage['/format.js'].lineData[426]++;
        matchedLen = mLen;
        _$jscoverage['/format.js'].lineData[427]++;
        index = i;
      }
    }
    _$jscoverage['/format.js'].lineData[430]++;
    return visit57_430_1(index >= 0) ? {
  value: index, 
  startIndex: startIndex + matchedLen} : null;
  }
  _$jscoverage['/format.js'].lineData[436]++;
  function matchPartString(dateStr, startIndex, match, mLen) {
    _$jscoverage['/format.js'].functionData[8]++;
    _$jscoverage['/format.js'].lineData[437]++;
    for (var i = 0; visit58_437_1(i < mLen); i++) {
      _$jscoverage['/format.js'].lineData[438]++;
      if (visit59_438_1(dateStr.charAt(startIndex + i) !== match.charAt(i))) {
        _$jscoverage['/format.js'].lineData[439]++;
        return false;
      }
    }
    _$jscoverage['/format.js'].lineData[442]++;
    return true;
  }
  _$jscoverage['/format.js'].lineData[445]++;
  function getLeadingNumberLen(str) {
    _$jscoverage['/format.js'].functionData[9]++;
    _$jscoverage['/format.js'].lineData[446]++;
    var i, c, len = str.length;
    _$jscoverage['/format.js'].lineData[448]++;
    for (i = 0; visit60_448_1(i < len); i++) {
      _$jscoverage['/format.js'].lineData[449]++;
      c = str.charAt(i);
      _$jscoverage['/format.js'].lineData[450]++;
      if (visit61_450_1(visit62_450_2(c < '0') || visit63_450_3(c > '9'))) {
        _$jscoverage['/format.js'].lineData[451]++;
        break;
      }
    }
    _$jscoverage['/format.js'].lineData[454]++;
    return i;
  }
  _$jscoverage['/format.js'].lineData[457]++;
  function matchNumber(dateStr, startIndex, count, obeyCount) {
    _$jscoverage['/format.js'].functionData[10]++;
    _$jscoverage['/format.js'].lineData[458]++;
    var str = dateStr, n;
    _$jscoverage['/format.js'].lineData[459]++;
    if (visit64_459_1(obeyCount)) {
      _$jscoverage['/format.js'].lineData[460]++;
      if (visit65_460_1(dateStr.length <= startIndex + count)) {
        _$jscoverage['/format.js'].lineData[461]++;
        return null;
      }
      _$jscoverage['/format.js'].lineData[463]++;
      str = dateStr.substring(startIndex, count);
      _$jscoverage['/format.js'].lineData[464]++;
      if (visit66_464_1(!str.match(/^\d+$/))) {
        _$jscoverage['/format.js'].lineData[465]++;
        return null;
      }
    } else {
      _$jscoverage['/format.js'].lineData[468]++;
      str = str.substring(startIndex);
    }
    _$jscoverage['/format.js'].lineData[470]++;
    n = parseInt(str, 10);
    _$jscoverage['/format.js'].lineData[471]++;
    if (visit67_471_1(isNaN(n))) {
      _$jscoverage['/format.js'].lineData[472]++;
      return null;
    }
    _$jscoverage['/format.js'].lineData[474]++;
    return {
  value: n, 
  startIndex: startIndex + getLeadingNumberLen(str)};
  }
  _$jscoverage['/format.js'].lineData[480]++;
  function parseField(calendar, dateStr, startIndex, field, count, locale, obeyCount, tmp) {
    _$jscoverage['/format.js'].functionData[11]++;
    _$jscoverage['/format.js'].lineData[481]++;
    var match, year, hour;
    _$jscoverage['/format.js'].lineData[482]++;
    if (visit68_482_1(dateStr.length <= startIndex)) {
      _$jscoverage['/format.js'].lineData[483]++;
      return startIndex;
    }
    _$jscoverage['/format.js'].lineData[485]++;
    switch (field) {
      case 'G':
        _$jscoverage['/format.js'].lineData[487]++;
        if ((match = matchField(dateStr, startIndex, locale.eras))) {
          _$jscoverage['/format.js'].lineData[488]++;
          if (visit69_488_1(calendar.isSetYear())) {
            _$jscoverage['/format.js'].lineData[489]++;
            if (visit70_489_1(match.value === 0)) {
              _$jscoverage['/format.js'].lineData[490]++;
              year = calendar.getYear();
              _$jscoverage['/format.js'].lineData[491]++;
              calendar.setYear(1 - year);
            }
          } else {
            _$jscoverage['/format.js'].lineData[494]++;
            tmp.era = match.value;
          }
        }
        _$jscoverage['/format.js'].lineData[497]++;
        break;
      case 'y':
        _$jscoverage['/format.js'].lineData[499]++;
        if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[500]++;
          year = match.value;
          _$jscoverage['/format.js'].lineData[501]++;
          if (visit71_501_1('era' in tmp)) {
            _$jscoverage['/format.js'].lineData[502]++;
            if (visit72_502_1(tmp.era === 0)) {
              _$jscoverage['/format.js'].lineData[503]++;
              year = 1 - year;
            }
          }
          _$jscoverage['/format.js'].lineData[506]++;
          calendar.setYear(year);
        }
        _$jscoverage['/format.js'].lineData[508]++;
        break;
      case 'M':
        _$jscoverage['/format.js'].lineData[510]++;
        var month;
        _$jscoverage['/format.js'].lineData[511]++;
        if (visit73_511_1(count >= 3)) {
          _$jscoverage['/format.js'].lineData[512]++;
          if ((match = matchField(dateStr, startIndex, locale[visit74_512_1(count === 3) ? 'shortMonths' : 'months']))) {
            _$jscoverage['/format.js'].lineData[514]++;
            month = match.value;
          }
        } else {
          _$jscoverage['/format.js'].lineData[517]++;
          if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
            _$jscoverage['/format.js'].lineData[518]++;
            month = match.value - 1;
          }
        }
        _$jscoverage['/format.js'].lineData[521]++;
        if (visit75_521_1(match)) {
          _$jscoverage['/format.js'].lineData[522]++;
          calendar.setMonth(month);
        }
        _$jscoverage['/format.js'].lineData[524]++;
        break;
      case 'k':
        _$jscoverage['/format.js'].lineData[526]++;
        if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[527]++;
          calendar.setHourOfDay(match.value % 24);
        }
        _$jscoverage['/format.js'].lineData[529]++;
        break;
      case 'E':
        _$jscoverage['/format.js'].lineData[531]++;
        if ((match = matchField(dateStr, startIndex, locale[visit76_531_1(count > 3) ? 'weekdays' : 'shortWeekdays']))) {
          _$jscoverage['/format.js'].lineData[534]++;
          calendar.setDayOfWeek(match.value);
        }
        _$jscoverage['/format.js'].lineData[536]++;
        break;
      case 'a':
        _$jscoverage['/format.js'].lineData[538]++;
        if ((match = matchField(dateStr, startIndex, locale.ampms))) {
          _$jscoverage['/format.js'].lineData[539]++;
          if (visit77_539_1(calendar.isSetHourOfDay())) {
            _$jscoverage['/format.js'].lineData[540]++;
            if (visit78_540_1(match.value)) {
              _$jscoverage['/format.js'].lineData[541]++;
              hour = calendar.getHourOfDay();
              _$jscoverage['/format.js'].lineData[542]++;
              if (visit79_542_1(hour < 12)) {
                _$jscoverage['/format.js'].lineData[543]++;
                calendar.setHourOfDay((hour + 12) % 24);
              }
            }
          } else {
            _$jscoverage['/format.js'].lineData[547]++;
            tmp.ampm = match.value;
          }
        }
        _$jscoverage['/format.js'].lineData[550]++;
        break;
      case 'h':
        _$jscoverage['/format.js'].lineData[552]++;
        if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[553]++;
          hour = match.value %= 12;
          _$jscoverage['/format.js'].lineData[554]++;
          if (visit80_554_1(tmp.ampm)) {
            _$jscoverage['/format.js'].lineData[555]++;
            hour += 12;
          }
          _$jscoverage['/format.js'].lineData[557]++;
          calendar.setHourOfDay(hour);
        }
        _$jscoverage['/format.js'].lineData[559]++;
        break;
      case 'K':
        _$jscoverage['/format.js'].lineData[561]++;
        if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[562]++;
          hour = match.value;
          _$jscoverage['/format.js'].lineData[563]++;
          if (visit81_563_1(tmp.ampm)) {
            _$jscoverage['/format.js'].lineData[564]++;
            hour += 12;
          }
          _$jscoverage['/format.js'].lineData[566]++;
          calendar.setHourOfDay(hour);
        }
        _$jscoverage['/format.js'].lineData[568]++;
        break;
      case 'Z':
        _$jscoverage['/format.js'].lineData[570]++;
        var sign = 1, zoneChar = dateStr.charAt(startIndex);
        _$jscoverage['/format.js'].lineData[572]++;
        if (visit82_572_1(zoneChar === '-')) {
          _$jscoverage['/format.js'].lineData[573]++;
          sign = -1;
          _$jscoverage['/format.js'].lineData[574]++;
          startIndex++;
        } else {
          _$jscoverage['/format.js'].lineData[575]++;
          if (visit83_575_1(zoneChar === '+')) {
            _$jscoverage['/format.js'].lineData[576]++;
            startIndex++;
          } else {
            _$jscoverage['/format.js'].lineData[578]++;
            break;
          }
        }
        _$jscoverage['/format.js'].lineData[580]++;
        if ((match = matchNumber(dateStr, startIndex, 2, true))) {
          _$jscoverage['/format.js'].lineData[581]++;
          var zoneOffset = match.value * 60;
          _$jscoverage['/format.js'].lineData[582]++;
          startIndex = match.startIndex;
          _$jscoverage['/format.js'].lineData[583]++;
          if ((match = matchNumber(dateStr, startIndex, 2, true))) {
            _$jscoverage['/format.js'].lineData[584]++;
            zoneOffset += match.value;
          }
          _$jscoverage['/format.js'].lineData[586]++;
          calendar.setTimezoneOffset(zoneOffset);
        }
        _$jscoverage['/format.js'].lineData[588]++;
        break;
      default:
        _$jscoverage['/format.js'].lineData[599]++;
        if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[600]++;
          var index = calendarIndexMap[field];
          _$jscoverage['/format.js'].lineData[601]++;
          calendar.set(index, match.value);
        }
    }
    _$jscoverage['/format.js'].lineData[604]++;
    if (visit84_604_1(match)) {
      _$jscoverage['/format.js'].lineData[605]++;
      startIndex = match.startIndex;
    }
    _$jscoverage['/format.js'].lineData[607]++;
    return startIndex;
  }
  _$jscoverage['/format.js'].lineData[610]++;
  DateTimeFormat.prototype = {
  format: function(calendar) {
  _$jscoverage['/format.js'].functionData[12]++;
  _$jscoverage['/format.js'].lineData[617]++;
  var time = calendar.getTime();
  _$jscoverage['/format.js'].lineData[618]++;
  calendar = new GregorianCalendar(this.timezoneOffset, this.locale);
  _$jscoverage['/format.js'].lineData[620]++;
  calendar.setTime(time);
  _$jscoverage['/format.js'].lineData[621]++;
  var i, ret = [], pattern = this.pattern, len = pattern.length;
  _$jscoverage['/format.js'].lineData[625]++;
  for (i = 0; visit85_625_1(i < len); i++) {
    _$jscoverage['/format.js'].lineData[626]++;
    var comp = pattern[i];
    _$jscoverage['/format.js'].lineData[627]++;
    if (visit86_627_1(comp.text)) {
      _$jscoverage['/format.js'].lineData[628]++;
      ret.push(comp.text);
    } else {
      _$jscoverage['/format.js'].lineData[629]++;
      if (visit87_629_1('field' in comp)) {
        _$jscoverage['/format.js'].lineData[630]++;
        ret.push(formatField(comp.field, comp.count, this.locale, calendar));
      }
    }
  }
  _$jscoverage['/format.js'].lineData[633]++;
  return ret.join('');
}, 
  parse: function(dateStr) {
  _$jscoverage['/format.js'].functionData[13]++;
  _$jscoverage['/format.js'].lineData[642]++;
  var calendar = new GregorianCalendar(this.timezoneOffset, this.locale), i, j, tmp = {}, obeyCount = false, dateStrLen = dateStr.length, errorIndex = -1, startIndex = 0, oldStartIndex = 0, pattern = this.pattern, len = pattern.length;
  _$jscoverage['/format.js'].lineData[655]++;
  loopPattern:
    {
      _$jscoverage['/format.js'].lineData[656]++;
      for (i = 0; visit88_656_1(visit89_656_2(errorIndex < 0) && visit90_656_3(i < len)); i++) {
        _$jscoverage['/format.js'].lineData[657]++;
        var comp = pattern[i], text, textLen;
        _$jscoverage['/format.js'].lineData[658]++;
        oldStartIndex = startIndex;
        _$jscoverage['/format.js'].lineData[659]++;
        if ((text = comp.text)) {
          _$jscoverage['/format.js'].lineData[660]++;
          textLen = text.length;
          _$jscoverage['/format.js'].lineData[661]++;
          if (visit91_661_1((textLen + startIndex) > dateStrLen)) {
            _$jscoverage['/format.js'].lineData[662]++;
            errorIndex = startIndex;
          } else {
            _$jscoverage['/format.js'].lineData[664]++;
            for (j = 0; visit92_664_1(j < textLen); j++) {
              _$jscoverage['/format.js'].lineData[665]++;
              if (visit93_665_1(text.charAt(j) !== dateStr.charAt(j + startIndex))) {
                _$jscoverage['/format.js'].lineData[666]++;
                errorIndex = startIndex;
                _$jscoverage['/format.js'].lineData[667]++;
                break loopPattern;
              }
            }
            _$jscoverage['/format.js'].lineData[670]++;
            startIndex += textLen;
          }
        } else {
          _$jscoverage['/format.js'].lineData[672]++;
          if (visit94_672_1('field' in comp)) {
            _$jscoverage['/format.js'].lineData[673]++;
            obeyCount = false;
            _$jscoverage['/format.js'].lineData[674]++;
            var nextComp = pattern[i + 1];
            _$jscoverage['/format.js'].lineData[675]++;
            if (visit95_675_1(nextComp)) {
              _$jscoverage['/format.js'].lineData[676]++;
              if (visit96_676_1('field' in nextComp)) {
                _$jscoverage['/format.js'].lineData[677]++;
                obeyCount = true;
              } else {
                _$jscoverage['/format.js'].lineData[679]++;
                var c = nextComp.text.charAt(0);
                _$jscoverage['/format.js'].lineData[680]++;
                if (visit97_680_1(visit98_680_2(c >= '0') && visit99_680_3(c <= '9'))) {
                  _$jscoverage['/format.js'].lineData[681]++;
                  obeyCount = true;
                }
              }
            }
            _$jscoverage['/format.js'].lineData[685]++;
            startIndex = parseField(calendar, dateStr, startIndex, comp.field, comp.count, this.locale, obeyCount, tmp);
            _$jscoverage['/format.js'].lineData[693]++;
            if (visit100_693_1(startIndex === oldStartIndex)) {
              _$jscoverage['/format.js'].lineData[694]++;
              errorIndex = startIndex;
            }
          }
        }
      }
    }
  _$jscoverage['/format.js'].lineData[700]++;
  if (visit101_700_1(errorIndex >= 0)) {
    _$jscoverage['/format.js'].lineData[701]++;
    logger.error('error when parsing date');
    _$jscoverage['/format.js'].lineData[702]++;
    logger.error(dateStr);
    _$jscoverage['/format.js'].lineData[703]++;
    logger.error(dateStr.substring(0, errorIndex) + '^');
    _$jscoverage['/format.js'].lineData[704]++;
    return undefined;
  }
  _$jscoverage['/format.js'].lineData[706]++;
  return calendar;
}};
  _$jscoverage['/format.js'].lineData[710]++;
  S.mix(DateTimeFormat, {
  Style: DateTimeStyle, 
  getInstance: function(locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[14]++;
  _$jscoverage['/format.js'].lineData[723]++;
  return this.getDateTimeInstance(DateTimeStyle.SHORT, DateTimeStyle.SHORT, locale, timeZoneOffset);
}, 
  'getDateInstance': function(dateStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[15]++;
  _$jscoverage['/format.js'].lineData[735]++;
  return this.getDateTimeInstance(dateStyle, undefined, locale, timeZoneOffset);
}, 
  getDateTimeInstance: function(dateStyle, timeStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[16]++;
  _$jscoverage['/format.js'].lineData[748]++;
  locale = visit102_748_1(locale || defaultLocale);
  _$jscoverage['/format.js'].lineData[749]++;
  var datePattern = '';
  _$jscoverage['/format.js'].lineData[750]++;
  if (visit103_750_1(dateStyle !== undefined)) {
    _$jscoverage['/format.js'].lineData[751]++;
    datePattern = locale.datePatterns[dateStyle];
  }
  _$jscoverage['/format.js'].lineData[753]++;
  var timePattern = '';
  _$jscoverage['/format.js'].lineData[754]++;
  if (visit104_754_1(timeStyle !== undefined)) {
    _$jscoverage['/format.js'].lineData[755]++;
    timePattern = locale.timePatterns[timeStyle];
  }
  _$jscoverage['/format.js'].lineData[757]++;
  var pattern = datePattern;
  _$jscoverage['/format.js'].lineData[758]++;
  if (visit105_758_1(timePattern)) {
    _$jscoverage['/format.js'].lineData[759]++;
    if (visit106_759_1(datePattern)) {
      _$jscoverage['/format.js'].lineData[760]++;
      pattern = S.substitute(locale.dateTimePattern, {
  date: datePattern, 
  time: timePattern});
    } else {
      _$jscoverage['/format.js'].lineData[765]++;
      pattern = timePattern;
    }
  }
  _$jscoverage['/format.js'].lineData[768]++;
  return new DateTimeFormat(pattern, locale, timeZoneOffset);
}, 
  'getTimeInstance': function(timeStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[17]++;
  _$jscoverage['/format.js'].lineData[780]++;
  return this.getDateTimeInstance(undefined, timeStyle, locale, timeZoneOffset);
}});
  _$jscoverage['/format.js'].lineData[784]++;
  return DateTimeFormat;
});
