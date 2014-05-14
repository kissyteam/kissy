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
  _$jscoverage['/format.js'].lineData[11] = 0;
  _$jscoverage['/format.js'].lineData[12] = 0;
  _$jscoverage['/format.js'].lineData[59] = 0;
  _$jscoverage['/format.js'].lineData[62] = 0;
  _$jscoverage['/format.js'].lineData[64] = 0;
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
  _$jscoverage['/format.js'].lineData[78] = 0;
  _$jscoverage['/format.js'].lineData[80] = 0;
  _$jscoverage['/format.js'].lineData[81] = 0;
  _$jscoverage['/format.js'].lineData[84] = 0;
  _$jscoverage['/format.js'].lineData[89] = 0;
  _$jscoverage['/format.js'].lineData[90] = 0;
  _$jscoverage['/format.js'].lineData[96] = 0;
  _$jscoverage['/format.js'].lineData[97] = 0;
  _$jscoverage['/format.js'].lineData[98] = 0;
  _$jscoverage['/format.js'].lineData[99] = 0;
  _$jscoverage['/format.js'].lineData[100] = 0;
  _$jscoverage['/format.js'].lineData[101] = 0;
  _$jscoverage['/format.js'].lineData[102] = 0;
  _$jscoverage['/format.js'].lineData[104] = 0;
  _$jscoverage['/format.js'].lineData[105] = 0;
  _$jscoverage['/format.js'].lineData[107] = 0;
  _$jscoverage['/format.js'].lineData[110] = 0;
  _$jscoverage['/format.js'].lineData[111] = 0;
  _$jscoverage['/format.js'].lineData[112] = 0;
  _$jscoverage['/format.js'].lineData[113] = 0;
  _$jscoverage['/format.js'].lineData[114] = 0;
  _$jscoverage['/format.js'].lineData[115] = 0;
  _$jscoverage['/format.js'].lineData[116] = 0;
  _$jscoverage['/format.js'].lineData[117] = 0;
  _$jscoverage['/format.js'].lineData[119] = 0;
  _$jscoverage['/format.js'].lineData[120] = 0;
  _$jscoverage['/format.js'].lineData[122] = 0;
  _$jscoverage['/format.js'].lineData[125] = 0;
  _$jscoverage['/format.js'].lineData[126] = 0;
  _$jscoverage['/format.js'].lineData[127] = 0;
  _$jscoverage['/format.js'].lineData[128] = 0;
  _$jscoverage['/format.js'].lineData[129] = 0;
  _$jscoverage['/format.js'].lineData[131] = 0;
  _$jscoverage['/format.js'].lineData[132] = 0;
  _$jscoverage['/format.js'].lineData[134] = 0;
  _$jscoverage['/format.js'].lineData[137] = 0;
  _$jscoverage['/format.js'].lineData[139] = 0;
  _$jscoverage['/format.js'].lineData[141] = 0;
  _$jscoverage['/format.js'].lineData[142] = 0;
  _$jscoverage['/format.js'].lineData[143] = 0;
  _$jscoverage['/format.js'].lineData[145] = 0;
  _$jscoverage['/format.js'].lineData[146] = 0;
  _$jscoverage['/format.js'].lineData[147] = 0;
  _$jscoverage['/format.js'].lineData[148] = 0;
  _$jscoverage['/format.js'].lineData[149] = 0;
  _$jscoverage['/format.js'].lineData[151] = 0;
  _$jscoverage['/format.js'].lineData[154] = 0;
  _$jscoverage['/format.js'].lineData[157] = 0;
  _$jscoverage['/format.js'].lineData[158] = 0;
  _$jscoverage['/format.js'].lineData[161] = 0;
  _$jscoverage['/format.js'].lineData[162] = 0;
  _$jscoverage['/format.js'].lineData[163] = 0;
  _$jscoverage['/format.js'].lineData[164] = 0;
  _$jscoverage['/format.js'].lineData[166] = 0;
  _$jscoverage['/format.js'].lineData[167] = 0;
  _$jscoverage['/format.js'].lineData[168] = 0;
  _$jscoverage['/format.js'].lineData[171] = 0;
  _$jscoverage['/format.js'].lineData[172] = 0;
  _$jscoverage['/format.js'].lineData[175] = 0;
  _$jscoverage['/format.js'].lineData[176] = 0;
  _$jscoverage['/format.js'].lineData[179] = 0;
  _$jscoverage['/format.js'].lineData[182] = 0;
  _$jscoverage['/format.js'].lineData[185] = 0;
  _$jscoverage['/format.js'].lineData[190] = 0;
  _$jscoverage['/format.js'].lineData[191] = 0;
  _$jscoverage['/format.js'].lineData[192] = 0;
  _$jscoverage['/format.js'].lineData[193] = 0;
  _$jscoverage['/format.js'].lineData[194] = 0;
  _$jscoverage['/format.js'].lineData[195] = 0;
  _$jscoverage['/format.js'].lineData[197] = 0;
  _$jscoverage['/format.js'].lineData[198] = 0;
  _$jscoverage['/format.js'].lineData[199] = 0;
  _$jscoverage['/format.js'].lineData[200] = 0;
  _$jscoverage['/format.js'].lineData[201] = 0;
  _$jscoverage['/format.js'].lineData[202] = 0;
  _$jscoverage['/format.js'].lineData[204] = 0;
  _$jscoverage['/format.js'].lineData[205] = 0;
  _$jscoverage['/format.js'].lineData[209] = 0;
  _$jscoverage['/format.js'].lineData[210] = 0;
  _$jscoverage['/format.js'].lineData[338] = 0;
  _$jscoverage['/format.js'].lineData[339] = 0;
  _$jscoverage['/format.js'].lineData[340] = 0;
  _$jscoverage['/format.js'].lineData[341] = 0;
  _$jscoverage['/format.js'].lineData[344] = 0;
  _$jscoverage['/format.js'].lineData[345] = 0;
  _$jscoverage['/format.js'].lineData[347] = 0;
  _$jscoverage['/format.js'].lineData[349] = 0;
  _$jscoverage['/format.js'].lineData[350] = 0;
  _$jscoverage['/format.js'].lineData[351] = 0;
  _$jscoverage['/format.js'].lineData[353] = 0;
  _$jscoverage['/format.js'].lineData[354] = 0;
  _$jscoverage['/format.js'].lineData[355] = 0;
  _$jscoverage['/format.js'].lineData[357] = 0;
  _$jscoverage['/format.js'].lineData[358] = 0;
  _$jscoverage['/format.js'].lineData[360] = 0;
  _$jscoverage['/format.js'].lineData[361] = 0;
  _$jscoverage['/format.js'].lineData[362] = 0;
  _$jscoverage['/format.js'].lineData[363] = 0;
  _$jscoverage['/format.js'].lineData[364] = 0;
  _$jscoverage['/format.js'].lineData[366] = 0;
  _$jscoverage['/format.js'].lineData[368] = 0;
  _$jscoverage['/format.js'].lineData[370] = 0;
  _$jscoverage['/format.js'].lineData[372] = 0;
  _$jscoverage['/format.js'].lineData[374] = 0;
  _$jscoverage['/format.js'].lineData[375] = 0;
  _$jscoverage['/format.js'].lineData[378] = 0;
  _$jscoverage['/format.js'].lineData[380] = 0;
  _$jscoverage['/format.js'].lineData[383] = 0;
  _$jscoverage['/format.js'].lineData[385] = 0;
  _$jscoverage['/format.js'].lineData[387] = 0;
  _$jscoverage['/format.js'].lineData[389] = 0;
  _$jscoverage['/format.js'].lineData[391] = 0;
  _$jscoverage['/format.js'].lineData[393] = 0;
  _$jscoverage['/format.js'].lineData[394] = 0;
  _$jscoverage['/format.js'].lineData[395] = 0;
  _$jscoverage['/format.js'].lineData[396] = 0;
  _$jscoverage['/format.js'].lineData[398] = 0;
  _$jscoverage['/format.js'].lineData[399] = 0;
  _$jscoverage['/format.js'].lineData[410] = 0;
  _$jscoverage['/format.js'].lineData[411] = 0;
  _$jscoverage['/format.js'].lineData[412] = 0;
  _$jscoverage['/format.js'].lineData[414] = 0;
  _$jscoverage['/format.js'].lineData[417] = 0;
  _$jscoverage['/format.js'].lineData[418] = 0;
  _$jscoverage['/format.js'].lineData[422] = 0;
  _$jscoverage['/format.js'].lineData[423] = 0;
  _$jscoverage['/format.js'].lineData[424] = 0;
  _$jscoverage['/format.js'].lineData[425] = 0;
  _$jscoverage['/format.js'].lineData[427] = 0;
  _$jscoverage['/format.js'].lineData[428] = 0;
  _$jscoverage['/format.js'].lineData[431] = 0;
  _$jscoverage['/format.js'].lineData[437] = 0;
  _$jscoverage['/format.js'].lineData[438] = 0;
  _$jscoverage['/format.js'].lineData[439] = 0;
  _$jscoverage['/format.js'].lineData[440] = 0;
  _$jscoverage['/format.js'].lineData[443] = 0;
  _$jscoverage['/format.js'].lineData[446] = 0;
  _$jscoverage['/format.js'].lineData[447] = 0;
  _$jscoverage['/format.js'].lineData[449] = 0;
  _$jscoverage['/format.js'].lineData[450] = 0;
  _$jscoverage['/format.js'].lineData[451] = 0;
  _$jscoverage['/format.js'].lineData[452] = 0;
  _$jscoverage['/format.js'].lineData[455] = 0;
  _$jscoverage['/format.js'].lineData[458] = 0;
  _$jscoverage['/format.js'].lineData[459] = 0;
  _$jscoverage['/format.js'].lineData[460] = 0;
  _$jscoverage['/format.js'].lineData[461] = 0;
  _$jscoverage['/format.js'].lineData[462] = 0;
  _$jscoverage['/format.js'].lineData[464] = 0;
  _$jscoverage['/format.js'].lineData[465] = 0;
  _$jscoverage['/format.js'].lineData[466] = 0;
  _$jscoverage['/format.js'].lineData[469] = 0;
  _$jscoverage['/format.js'].lineData[471] = 0;
  _$jscoverage['/format.js'].lineData[472] = 0;
  _$jscoverage['/format.js'].lineData[473] = 0;
  _$jscoverage['/format.js'].lineData[475] = 0;
  _$jscoverage['/format.js'].lineData[481] = 0;
  _$jscoverage['/format.js'].lineData[482] = 0;
  _$jscoverage['/format.js'].lineData[483] = 0;
  _$jscoverage['/format.js'].lineData[484] = 0;
  _$jscoverage['/format.js'].lineData[486] = 0;
  _$jscoverage['/format.js'].lineData[488] = 0;
  _$jscoverage['/format.js'].lineData[489] = 0;
  _$jscoverage['/format.js'].lineData[490] = 0;
  _$jscoverage['/format.js'].lineData[491] = 0;
  _$jscoverage['/format.js'].lineData[492] = 0;
  _$jscoverage['/format.js'].lineData[495] = 0;
  _$jscoverage['/format.js'].lineData[498] = 0;
  _$jscoverage['/format.js'].lineData[500] = 0;
  _$jscoverage['/format.js'].lineData[501] = 0;
  _$jscoverage['/format.js'].lineData[502] = 0;
  _$jscoverage['/format.js'].lineData[503] = 0;
  _$jscoverage['/format.js'].lineData[504] = 0;
  _$jscoverage['/format.js'].lineData[507] = 0;
  _$jscoverage['/format.js'].lineData[509] = 0;
  _$jscoverage['/format.js'].lineData[511] = 0;
  _$jscoverage['/format.js'].lineData[512] = 0;
  _$jscoverage['/format.js'].lineData[513] = 0;
  _$jscoverage['/format.js'].lineData[515] = 0;
  _$jscoverage['/format.js'].lineData[518] = 0;
  _$jscoverage['/format.js'].lineData[519] = 0;
  _$jscoverage['/format.js'].lineData[522] = 0;
  _$jscoverage['/format.js'].lineData[523] = 0;
  _$jscoverage['/format.js'].lineData[525] = 0;
  _$jscoverage['/format.js'].lineData[527] = 0;
  _$jscoverage['/format.js'].lineData[528] = 0;
  _$jscoverage['/format.js'].lineData[530] = 0;
  _$jscoverage['/format.js'].lineData[532] = 0;
  _$jscoverage['/format.js'].lineData[535] = 0;
  _$jscoverage['/format.js'].lineData[537] = 0;
  _$jscoverage['/format.js'].lineData[539] = 0;
  _$jscoverage['/format.js'].lineData[540] = 0;
  _$jscoverage['/format.js'].lineData[541] = 0;
  _$jscoverage['/format.js'].lineData[542] = 0;
  _$jscoverage['/format.js'].lineData[543] = 0;
  _$jscoverage['/format.js'].lineData[544] = 0;
  _$jscoverage['/format.js'].lineData[548] = 0;
  _$jscoverage['/format.js'].lineData[551] = 0;
  _$jscoverage['/format.js'].lineData[553] = 0;
  _$jscoverage['/format.js'].lineData[554] = 0;
  _$jscoverage['/format.js'].lineData[555] = 0;
  _$jscoverage['/format.js'].lineData[556] = 0;
  _$jscoverage['/format.js'].lineData[558] = 0;
  _$jscoverage['/format.js'].lineData[560] = 0;
  _$jscoverage['/format.js'].lineData[562] = 0;
  _$jscoverage['/format.js'].lineData[563] = 0;
  _$jscoverage['/format.js'].lineData[564] = 0;
  _$jscoverage['/format.js'].lineData[565] = 0;
  _$jscoverage['/format.js'].lineData[567] = 0;
  _$jscoverage['/format.js'].lineData[569] = 0;
  _$jscoverage['/format.js'].lineData[571] = 0;
  _$jscoverage['/format.js'].lineData[573] = 0;
  _$jscoverage['/format.js'].lineData[574] = 0;
  _$jscoverage['/format.js'].lineData[575] = 0;
  _$jscoverage['/format.js'].lineData[576] = 0;
  _$jscoverage['/format.js'].lineData[577] = 0;
  _$jscoverage['/format.js'].lineData[579] = 0;
  _$jscoverage['/format.js'].lineData[581] = 0;
  _$jscoverage['/format.js'].lineData[582] = 0;
  _$jscoverage['/format.js'].lineData[583] = 0;
  _$jscoverage['/format.js'].lineData[584] = 0;
  _$jscoverage['/format.js'].lineData[585] = 0;
  _$jscoverage['/format.js'].lineData[587] = 0;
  _$jscoverage['/format.js'].lineData[589] = 0;
  _$jscoverage['/format.js'].lineData[600] = 0;
  _$jscoverage['/format.js'].lineData[601] = 0;
  _$jscoverage['/format.js'].lineData[602] = 0;
  _$jscoverage['/format.js'].lineData[605] = 0;
  _$jscoverage['/format.js'].lineData[606] = 0;
  _$jscoverage['/format.js'].lineData[608] = 0;
  _$jscoverage['/format.js'].lineData[611] = 0;
  _$jscoverage['/format.js'].lineData[618] = 0;
  _$jscoverage['/format.js'].lineData[619] = 0;
  _$jscoverage['/format.js'].lineData[621] = 0;
  _$jscoverage['/format.js'].lineData[622] = 0;
  _$jscoverage['/format.js'].lineData[626] = 0;
  _$jscoverage['/format.js'].lineData[627] = 0;
  _$jscoverage['/format.js'].lineData[628] = 0;
  _$jscoverage['/format.js'].lineData[629] = 0;
  _$jscoverage['/format.js'].lineData[630] = 0;
  _$jscoverage['/format.js'].lineData[631] = 0;
  _$jscoverage['/format.js'].lineData[634] = 0;
  _$jscoverage['/format.js'].lineData[643] = 0;
  _$jscoverage['/format.js'].lineData[656] = 0;
  _$jscoverage['/format.js'].lineData[657] = 0;
  _$jscoverage['/format.js'].lineData[658] = 0;
  _$jscoverage['/format.js'].lineData[659] = 0;
  _$jscoverage['/format.js'].lineData[660] = 0;
  _$jscoverage['/format.js'].lineData[661] = 0;
  _$jscoverage['/format.js'].lineData[662] = 0;
  _$jscoverage['/format.js'].lineData[663] = 0;
  _$jscoverage['/format.js'].lineData[665] = 0;
  _$jscoverage['/format.js'].lineData[666] = 0;
  _$jscoverage['/format.js'].lineData[667] = 0;
  _$jscoverage['/format.js'].lineData[668] = 0;
  _$jscoverage['/format.js'].lineData[671] = 0;
  _$jscoverage['/format.js'].lineData[673] = 0;
  _$jscoverage['/format.js'].lineData[674] = 0;
  _$jscoverage['/format.js'].lineData[675] = 0;
  _$jscoverage['/format.js'].lineData[676] = 0;
  _$jscoverage['/format.js'].lineData[677] = 0;
  _$jscoverage['/format.js'].lineData[678] = 0;
  _$jscoverage['/format.js'].lineData[680] = 0;
  _$jscoverage['/format.js'].lineData[681] = 0;
  _$jscoverage['/format.js'].lineData[682] = 0;
  _$jscoverage['/format.js'].lineData[686] = 0;
  _$jscoverage['/format.js'].lineData[694] = 0;
  _$jscoverage['/format.js'].lineData[695] = 0;
  _$jscoverage['/format.js'].lineData[701] = 0;
  _$jscoverage['/format.js'].lineData[702] = 0;
  _$jscoverage['/format.js'].lineData[703] = 0;
  _$jscoverage['/format.js'].lineData[704] = 0;
  _$jscoverage['/format.js'].lineData[705] = 0;
  _$jscoverage['/format.js'].lineData[707] = 0;
  _$jscoverage['/format.js'].lineData[711] = 0;
  _$jscoverage['/format.js'].lineData[724] = 0;
  _$jscoverage['/format.js'].lineData[736] = 0;
  _$jscoverage['/format.js'].lineData[749] = 0;
  _$jscoverage['/format.js'].lineData[750] = 0;
  _$jscoverage['/format.js'].lineData[751] = 0;
  _$jscoverage['/format.js'].lineData[752] = 0;
  _$jscoverage['/format.js'].lineData[754] = 0;
  _$jscoverage['/format.js'].lineData[755] = 0;
  _$jscoverage['/format.js'].lineData[756] = 0;
  _$jscoverage['/format.js'].lineData[758] = 0;
  _$jscoverage['/format.js'].lineData[759] = 0;
  _$jscoverage['/format.js'].lineData[760] = 0;
  _$jscoverage['/format.js'].lineData[761] = 0;
  _$jscoverage['/format.js'].lineData[766] = 0;
  _$jscoverage['/format.js'].lineData[769] = 0;
  _$jscoverage['/format.js'].lineData[781] = 0;
  _$jscoverage['/format.js'].lineData[785] = 0;
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
  _$jscoverage['/format.js'].branchData['104'] = [];
  _$jscoverage['/format.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['107'] = [];
  _$jscoverage['/format.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['110'] = [];
  _$jscoverage['/format.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['112'] = [];
  _$jscoverage['/format.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['114'] = [];
  _$jscoverage['/format.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['119'] = [];
  _$jscoverage['/format.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['125'] = [];
  _$jscoverage['/format.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['126'] = [];
  _$jscoverage['/format.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['141'] = [];
  _$jscoverage['/format.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'] = [];
  _$jscoverage['/format.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'][4] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'][5] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'][6] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'][7] = new BranchData();
  _$jscoverage['/format.js'].branchData['145'][8] = new BranchData();
  _$jscoverage['/format.js'].branchData['146'] = [];
  _$jscoverage['/format.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['157'] = [];
  _$jscoverage['/format.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['161'] = [];
  _$jscoverage['/format.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['161'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['161'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['171'] = [];
  _$jscoverage['/format.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['175'] = [];
  _$jscoverage['/format.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['190'] = [];
  _$jscoverage['/format.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['191'] = [];
  _$jscoverage['/format.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['192'] = [];
  _$jscoverage['/format.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['193'] = [];
  _$jscoverage['/format.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['193'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['193'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['193'][4] = new BranchData();
  _$jscoverage['/format.js'].branchData['193'][5] = new BranchData();
  _$jscoverage['/format.js'].branchData['194'] = [];
  _$jscoverage['/format.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['194'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['199'] = [];
  _$jscoverage['/format.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['199'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['199'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['200'] = [];
  _$jscoverage['/format.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['204'] = [];
  _$jscoverage['/format.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['204'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['204'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['339'] = [];
  _$jscoverage['/format.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['349'] = [];
  _$jscoverage['/format.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['354'] = [];
  _$jscoverage['/format.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['357'] = [];
  _$jscoverage['/format.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['361'] = [];
  _$jscoverage['/format.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['363'] = [];
  _$jscoverage['/format.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['370'] = [];
  _$jscoverage['/format.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['375'] = [];
  _$jscoverage['/format.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['380'] = [];
  _$jscoverage['/format.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['386'] = [];
  _$jscoverage['/format.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['394'] = [];
  _$jscoverage['/format.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['422'] = [];
  _$jscoverage['/format.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['425'] = [];
  _$jscoverage['/format.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['425'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['431'] = [];
  _$jscoverage['/format.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['438'] = [];
  _$jscoverage['/format.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['439'] = [];
  _$jscoverage['/format.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['449'] = [];
  _$jscoverage['/format.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['451'] = [];
  _$jscoverage['/format.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['451'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['451'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['460'] = [];
  _$jscoverage['/format.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['461'] = [];
  _$jscoverage['/format.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['465'] = [];
  _$jscoverage['/format.js'].branchData['465'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['472'] = [];
  _$jscoverage['/format.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['483'] = [];
  _$jscoverage['/format.js'].branchData['483'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['489'] = [];
  _$jscoverage['/format.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['490'] = [];
  _$jscoverage['/format.js'].branchData['490'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['502'] = [];
  _$jscoverage['/format.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['503'] = [];
  _$jscoverage['/format.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['512'] = [];
  _$jscoverage['/format.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['513'] = [];
  _$jscoverage['/format.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['522'] = [];
  _$jscoverage['/format.js'].branchData['522'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['532'] = [];
  _$jscoverage['/format.js'].branchData['532'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['540'] = [];
  _$jscoverage['/format.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['541'] = [];
  _$jscoverage['/format.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['543'] = [];
  _$jscoverage['/format.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['555'] = [];
  _$jscoverage['/format.js'].branchData['555'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['564'] = [];
  _$jscoverage['/format.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['573'] = [];
  _$jscoverage['/format.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['576'] = [];
  _$jscoverage['/format.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['605'] = [];
  _$jscoverage['/format.js'].branchData['605'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['626'] = [];
  _$jscoverage['/format.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['628'] = [];
  _$jscoverage['/format.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['630'] = [];
  _$jscoverage['/format.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['657'] = [];
  _$jscoverage['/format.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['657'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['657'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['662'] = [];
  _$jscoverage['/format.js'].branchData['662'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['665'] = [];
  _$jscoverage['/format.js'].branchData['665'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['666'] = [];
  _$jscoverage['/format.js'].branchData['666'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['673'] = [];
  _$jscoverage['/format.js'].branchData['673'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['676'] = [];
  _$jscoverage['/format.js'].branchData['676'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['677'] = [];
  _$jscoverage['/format.js'].branchData['677'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['681'] = [];
  _$jscoverage['/format.js'].branchData['681'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['681'][2] = new BranchData();
  _$jscoverage['/format.js'].branchData['681'][3] = new BranchData();
  _$jscoverage['/format.js'].branchData['694'] = [];
  _$jscoverage['/format.js'].branchData['694'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['701'] = [];
  _$jscoverage['/format.js'].branchData['701'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['749'] = [];
  _$jscoverage['/format.js'].branchData['749'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['751'] = [];
  _$jscoverage['/format.js'].branchData['751'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['755'] = [];
  _$jscoverage['/format.js'].branchData['755'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['759'] = [];
  _$jscoverage['/format.js'].branchData['759'][1] = new BranchData();
  _$jscoverage['/format.js'].branchData['760'] = [];
  _$jscoverage['/format.js'].branchData['760'][1] = new BranchData();
}
_$jscoverage['/format.js'].branchData['760'][1].init(22, 11, 'datePattern');
function visit106_760_1(result) {
  _$jscoverage['/format.js'].branchData['760'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['759'][1].init(419, 11, 'timePattern');
function visit105_759_1(result) {
  _$jscoverage['/format.js'].branchData['759'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['755'][1].init(257, 23, 'timeStyle !== undefined');
function visit104_755_1(result) {
  _$jscoverage['/format.js'].branchData['755'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['751'][1].init(100, 23, 'dateStyle !== undefined');
function visit103_751_1(result) {
  _$jscoverage['/format.js'].branchData['751'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['749'][1].init(23, 23, 'locale || defaultLocale');
function visit102_749_1(result) {
  _$jscoverage['/format.js'].branchData['749'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['701'][1].init(2510, 15, 'errorIndex >= 0');
function visit101_701_1(result) {
  _$jscoverage['/format.js'].branchData['701'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['694'][1].init(928, 28, 'startIndex === oldStartIndex');
function visit100_694_1(result) {
  _$jscoverage['/format.js'].branchData['694'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['681'][3].init(116, 8, 'c <= \'9\'');
function visit99_681_3(result) {
  _$jscoverage['/format.js'].branchData['681'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['681'][2].init(104, 8, 'c >= \'0\'');
function visit98_681_2(result) {
  _$jscoverage['/format.js'].branchData['681'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['681'][1].init(104, 20, 'c >= \'0\' && c <= \'9\'');
function visit97_681_1(result) {
  _$jscoverage['/format.js'].branchData['681'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['677'][1].init(34, 19, '\'field\' in nextComp');
function visit96_677_1(result) {
  _$jscoverage['/format.js'].branchData['677'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['676'][1].init(130, 8, 'nextComp');
function visit95_676_1(result) {
  _$jscoverage['/format.js'].branchData['676'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['673'][1].init(807, 15, '\'field\' in comp');
function visit94_673_1(result) {
  _$jscoverage['/format.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['666'][1].init(38, 49, 'text.charAt(j) !== dateStr.charAt(j + startIndex)');
function visit93_666_1(result) {
  _$jscoverage['/format.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['665'][1].init(42, 11, 'j < textLen');
function visit92_665_1(result) {
  _$jscoverage['/format.js'].branchData['665'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['662'][1].init(79, 34, '(textLen + startIndex) > dateStrLen');
function visit91_662_1(result) {
  _$jscoverage['/format.js'].branchData['662'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['657'][3].init(48, 7, 'i < len');
function visit90_657_3(result) {
  _$jscoverage['/format.js'].branchData['657'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['657'][2].init(30, 14, 'errorIndex < 0');
function visit89_657_2(result) {
  _$jscoverage['/format.js'].branchData['657'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['657'][1].init(30, 25, 'errorIndex < 0 && i < len');
function visit88_657_1(result) {
  _$jscoverage['/format.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['630'][1].init(146, 15, '\'field\' in comp');
function visit87_630_1(result) {
  _$jscoverage['/format.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['628'][1].init(62, 9, 'comp.text');
function visit86_628_1(result) {
  _$jscoverage['/format.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['626'][1].init(370, 7, 'i < len');
function visit85_626_1(result) {
  _$jscoverage['/format.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['605'][1].init(4794, 5, 'match');
function visit84_605_1(result) {
  _$jscoverage['/format.js'].branchData['605'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['576'][1].init(237, 16, 'zoneChar === \'+\'');
function visit83_576_1(result) {
  _$jscoverage['/format.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['573'][1].init(121, 16, 'zoneChar === \'-\'');
function visit82_573_1(result) {
  _$jscoverage['/format.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['564'][1].init(67, 8, 'tmp.ampm');
function visit81_564_1(result) {
  _$jscoverage['/format.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['555'][1].init(73, 8, 'tmp.ampm');
function visit80_555_1(result) {
  _$jscoverage['/format.js'].branchData['555'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['543'][1].init(95, 9, 'hour < 12');
function visit79_543_1(result) {
  _$jscoverage['/format.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['541'][1].init(30, 11, 'match.value');
function visit78_541_1(result) {
  _$jscoverage['/format.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['540'][1].init(26, 25, 'calendar.isSetHourOfDay()');
function visit77_540_1(result) {
  _$jscoverage['/format.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['532'][1].init(78, 9, 'count > 3');
function visit76_532_1(result) {
  _$jscoverage['/format.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['522'][1].init(512, 5, 'match');
function visit75_522_1(result) {
  _$jscoverage['/format.js'].branchData['522'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['513'][1].init(74, 11, 'count === 3');
function visit74_513_1(result) {
  _$jscoverage['/format.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['512'][1].init(58, 10, 'count >= 3');
function visit73_512_1(result) {
  _$jscoverage['/format.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['503'][1].init(30, 13, 'tmp.era === 0');
function visit72_503_1(result) {
  _$jscoverage['/format.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['502'][1].init(67, 12, '\'era\' in tmp');
function visit71_502_1(result) {
  _$jscoverage['/format.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['490'][1].init(30, 17, 'match.value === 0');
function visit70_490_1(result) {
  _$jscoverage['/format.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['489'][1].init(26, 20, 'calendar.isSetYear()');
function visit69_489_1(result) {
  _$jscoverage['/format.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['483'][1].init(46, 28, 'dateStr.length <= startIndex');
function visit68_483_1(result) {
  _$jscoverage['/format.js'].branchData['483'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['472'][1].init(422, 8, 'isNaN(n)');
function visit67_472_1(result) {
  _$jscoverage['/format.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['465'][1].init(177, 19, '!str.match(/^\\d+$/)');
function visit66_465_1(result) {
  _$jscoverage['/format.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['461'][1].init(18, 36, 'dateStr.length <= startIndex + count');
function visit65_461_1(result) {
  _$jscoverage['/format.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['460'][1].init(45, 9, 'obeyCount');
function visit64_460_1(result) {
  _$jscoverage['/format.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['451'][3].init(61, 7, 'c > \'9\'');
function visit63_451_3(result) {
  _$jscoverage['/format.js'].branchData['451'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['451'][2].init(50, 7, 'c < \'0\'');
function visit62_451_2(result) {
  _$jscoverage['/format.js'].branchData['451'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['451'][1].init(50, 18, 'c < \'0\' || c > \'9\'');
function visit61_451_1(result) {
  _$jscoverage['/format.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['449'][1].init(72, 7, 'i < len');
function visit60_449_1(result) {
  _$jscoverage['/format.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['439'][1].init(18, 50, 'dateStr.charAt(startIndex + i) !== match.charAt(i)');
function visit59_439_1(result) {
  _$jscoverage['/format.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['438'][1].init(26, 8, 'i < mLen');
function visit58_438_1(result) {
  _$jscoverage['/format.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['431'][1].init(421, 10, 'index >= 0');
function visit57_431_1(result) {
  _$jscoverage['/format.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['425'][2].init(85, 17, 'mLen > matchedLen');
function visit56_425_2(result) {
  _$jscoverage['/format.js'].branchData['425'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['425'][1].init(85, 83, 'mLen > matchedLen && matchPartString(dateStr, startIndex, m, mLen)');
function visit55_425_1(result) {
  _$jscoverage['/format.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['422'][1].init(128, 7, 'i < len');
function visit54_422_1(result) {
  _$jscoverage['/format.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['394'][1].init(99, 10, 'offset < 0');
function visit53_394_1(result) {
  _$jscoverage['/format.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['386'][1].init(17, 56, 'calendar.getHourOfDay() % 12 || 12');
function visit52_386_1(result) {
  _$jscoverage['/format.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['380'][1].init(49, 29, 'calendar.getHourOfDay() >= 12');
function visit51_380_1(result) {
  _$jscoverage['/format.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['375'][1].init(86, 10, 'count >= 4');
function visit50_375_1(result) {
  _$jscoverage['/format.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['370'][1].init(54, 29, 'calendar.getHourOfDay() || 24');
function visit49_370_1(result) {
  _$jscoverage['/format.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['363'][1].init(172, 11, 'count === 3');
function visit48_363_1(result) {
  _$jscoverage['/format.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['361'][1].init(76, 10, 'count >= 4');
function visit47_361_1(result) {
  _$jscoverage['/format.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['357'][1].init(204, 11, 'count !== 2');
function visit46_357_1(result) {
  _$jscoverage['/format.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['354'][1].init(75, 10, 'value <= 0');
function visit45_354_1(result) {
  _$jscoverage['/format.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['349'][1].init(34, 22, 'calendar.getYear() > 0');
function visit44_349_1(result) {
  _$jscoverage['/format.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['339'][1].init(24, 23, 'locale || defaultLocale');
function visit43_339_1(result) {
  _$jscoverage['/format.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['204'][3].init(186, 15, 'maxDigits === 2');
function visit42_204_3(result) {
  _$jscoverage['/format.js'].branchData['204'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['204'][2].init(167, 15, 'minDigits === 2');
function visit41_204_2(result) {
  _$jscoverage['/format.js'].branchData['204'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['204'][1].init(167, 34, 'minDigits === 2 && maxDigits === 2');
function visit40_204_1(result) {
  _$jscoverage['/format.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['200'][1].init(22, 15, 'minDigits === 4');
function visit39_200_1(result) {
  _$jscoverage['/format.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['199'][3].init(307, 13, 'value < 10000');
function visit38_199_3(result) {
  _$jscoverage['/format.js'].branchData['199'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['199'][2].init(290, 13, 'value >= 1000');
function visit37_199_2(result) {
  _$jscoverage['/format.js'].branchData['199'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['199'][1].init(290, 30, 'value >= 1000 && value < 10000');
function visit36_199_1(result) {
  _$jscoverage['/format.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['194'][3].init(36, 15, 'minDigits === 2');
function visit35_194_3(result) {
  _$jscoverage['/format.js'].branchData['194'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['194'][2].init(22, 10, 'value < 10');
function visit34_194_2(result) {
  _$jscoverage['/format.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['194'][1].init(22, 29, 'value < 10 && minDigits === 2');
function visit33_194_1(result) {
  _$jscoverage['/format.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['193'][5].init(51, 14, 'minDigits <= 2');
function visit32_193_5(result) {
  _$jscoverage['/format.js'].branchData['193'][5].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['193'][4].init(33, 14, 'minDigits >= 1');
function visit31_193_4(result) {
  _$jscoverage['/format.js'].branchData['193'][4].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['193'][3].init(33, 32, 'minDigits >= 1 && minDigits <= 2');
function visit30_193_3(result) {
  _$jscoverage['/format.js'].branchData['193'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['193'][2].init(18, 11, 'value < 100');
function visit29_193_2(result) {
  _$jscoverage['/format.js'].branchData['193'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['193'][1].init(18, 47, 'value < 100 && minDigits >= 1 && minDigits <= 2');
function visit28_193_1(result) {
  _$jscoverage['/format.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['192'][1].init(362, 10, 'value >= 0');
function visit27_192_1(result) {
  _$jscoverage['/format.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['191'][1].init(325, 22, 'maxDigits || MAX_VALUE');
function visit26_191_1(result) {
  _$jscoverage['/format.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['190'][1].init(290, 12, 'buffer || []');
function visit25_190_1(result) {
  _$jscoverage['/format.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['175'][1].init(2560, 11, 'count !== 0');
function visit24_175_1(result) {
  _$jscoverage['/format.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['171'][1].init(2471, 7, 'inQuote');
function visit23_171_1(result) {
  _$jscoverage['/format.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['161'][3].init(1985, 15, 'lastField === c');
function visit22_161_3(result) {
  _$jscoverage['/format.js'].branchData['161'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['161'][2].init(1965, 16, 'lastField === -1');
function visit21_161_2(result) {
  _$jscoverage['/format.js'].branchData['161'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['161'][1].init(1965, 35, 'lastField === -1 || lastField === c');
function visit20_161_1(result) {
  _$jscoverage['/format.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['157'][1].init(1822, 30, 'patternChars.indexOf(c) === -1');
function visit19_157_1(result) {
  _$jscoverage['/format.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['146'][1].init(22, 11, 'count !== 0');
function visit18_146_1(result) {
  _$jscoverage['/format.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][8].init(1470, 8, 'c <= \'Z\'');
function visit17_145_8(result) {
  _$jscoverage['/format.js'].branchData['145'][8].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][7].init(1458, 8, 'c >= \'A\'');
function visit16_145_7(result) {
  _$jscoverage['/format.js'].branchData['145'][7].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][6].init(1458, 20, 'c >= \'A\' && c <= \'Z\'');
function visit15_145_6(result) {
  _$jscoverage['/format.js'].branchData['145'][6].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][5].init(1446, 8, 'c <= \'z\'');
function visit14_145_5(result) {
  _$jscoverage['/format.js'].branchData['145'][5].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][4].init(1434, 8, 'c >= \'a\'');
function visit13_145_4(result) {
  _$jscoverage['/format.js'].branchData['145'][4].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][3].init(1434, 20, 'c >= \'a\' && c <= \'z\'');
function visit12_145_3(result) {
  _$jscoverage['/format.js'].branchData['145'][3].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][2].init(1434, 44, 'c >= \'a\' && c <= \'z\' || c >= \'A\' && c <= \'Z\'');
function visit11_145_2(result) {
  _$jscoverage['/format.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['145'][1].init(1432, 47, '!(c >= \'a\' && c <= \'z\' || c >= \'A\' && c <= \'Z\')');
function visit10_145_1(result) {
  _$jscoverage['/format.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['141'][1].init(1329, 7, 'inQuote');
function visit9_141_1(result) {
  _$jscoverage['/format.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['126'][1].init(26, 11, 'count !== 0');
function visit8_126_1(result) {
  _$jscoverage['/format.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['125'][1].init(710, 8, '!inQuote');
function visit7_125_1(result) {
  _$jscoverage['/format.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['119'][1].init(288, 7, 'inQuote');
function visit6_119_1(result) {
  _$jscoverage['/format.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['114'][1].init(60, 11, 'count !== 0');
function visit5_114_1(result) {
  _$jscoverage['/format.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['112'][1].init(74, 10, 'c === \'\\\'\'');
function visit4_112_1(result) {
  _$jscoverage['/format.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['110'][1].init(136, 15, '(i + 1) < length');
function visit3_110_1(result) {
  _$jscoverage['/format.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['107'][1].init(60, 10, 'c === \'\\\'\'');
function visit2_107_1(result) {
  _$jscoverage['/format.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].branchData['104'][1].init(215, 10, 'i < length');
function visit1_104_1(result) {
  _$jscoverage['/format.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/format.js'].lineData[7]++;
KISSY.add(function(S, require) {
  _$jscoverage['/format.js'].functionData[0]++;
  _$jscoverage['/format.js'].lineData[8]++;
  var util = require('util');
  _$jscoverage['/format.js'].lineData[9]++;
  var logger = S.getLogger('s/date/format');
  _$jscoverage['/format.js'].lineData[10]++;
  var GregorianCalendar = require('date/gregorian');
  _$jscoverage['/format.js'].lineData[11]++;
  var defaultLocale = require('i18n!date');
  _$jscoverage['/format.js'].lineData[12]++;
  var MAX_VALUE = Number.MAX_VALUE, DateTimeStyle = {
  FULL: 0, 
  LONG: 1, 
  MEDIUM: 2, 
  SHORT: 3};
  _$jscoverage['/format.js'].lineData[59]++;
  var patternChars = new Array(GregorianCalendar.DAY_OF_WEEK_IN_MONTH + 2).join('1');
  _$jscoverage['/format.js'].lineData[62]++;
  var ERA = 0;
  _$jscoverage['/format.js'].lineData[64]++;
  var calendarIndexMap = {};
  _$jscoverage['/format.js'].lineData[66]++;
  patternChars = patternChars.split('');
  _$jscoverage['/format.js'].lineData[67]++;
  patternChars[ERA] = 'G';
  _$jscoverage['/format.js'].lineData[68]++;
  patternChars[GregorianCalendar.YEAR] = 'y';
  _$jscoverage['/format.js'].lineData[69]++;
  patternChars[GregorianCalendar.MONTH] = 'M';
  _$jscoverage['/format.js'].lineData[70]++;
  patternChars[GregorianCalendar.DAY_OF_MONTH] = 'd';
  _$jscoverage['/format.js'].lineData[71]++;
  patternChars[GregorianCalendar.HOUR_OF_DAY] = 'H';
  _$jscoverage['/format.js'].lineData[72]++;
  patternChars[GregorianCalendar.MINUTES] = 'm';
  _$jscoverage['/format.js'].lineData[73]++;
  patternChars[GregorianCalendar.SECONDS] = 's';
  _$jscoverage['/format.js'].lineData[74]++;
  patternChars[GregorianCalendar.MILLISECONDS] = 'S';
  _$jscoverage['/format.js'].lineData[75]++;
  patternChars[GregorianCalendar.WEEK_OF_YEAR] = 'w';
  _$jscoverage['/format.js'].lineData[76]++;
  patternChars[GregorianCalendar.WEEK_OF_MONTH] = 'W';
  _$jscoverage['/format.js'].lineData[77]++;
  patternChars[GregorianCalendar.DAY_OF_YEAR] = 'D';
  _$jscoverage['/format.js'].lineData[78]++;
  patternChars[GregorianCalendar.DAY_OF_WEEK_IN_MONTH] = 'F';
  _$jscoverage['/format.js'].lineData[80]++;
  util.each(patternChars, function(v, index) {
  _$jscoverage['/format.js'].functionData[1]++;
  _$jscoverage['/format.js'].lineData[81]++;
  calendarIndexMap[v] = index;
});
  _$jscoverage['/format.js'].lineData[84]++;
  patternChars = patternChars.join('') + 'ahkKZE';
  _$jscoverage['/format.js'].lineData[89]++;
  function encode(lastField, count, compiledPattern) {
    _$jscoverage['/format.js'].functionData[2]++;
    _$jscoverage['/format.js'].lineData[90]++;
    compiledPattern.push({
  field: lastField, 
  count: count});
  }
  _$jscoverage['/format.js'].lineData[96]++;
  function compile(pattern) {
    _$jscoverage['/format.js'].functionData[3]++;
    _$jscoverage['/format.js'].lineData[97]++;
    var length = pattern.length;
    _$jscoverage['/format.js'].lineData[98]++;
    var inQuote = false;
    _$jscoverage['/format.js'].lineData[99]++;
    var compiledPattern = [];
    _$jscoverage['/format.js'].lineData[100]++;
    var tmpBuffer = null;
    _$jscoverage['/format.js'].lineData[101]++;
    var count = 0;
    _$jscoverage['/format.js'].lineData[102]++;
    var lastField = -1;
    _$jscoverage['/format.js'].lineData[104]++;
    for (var i = 0; visit1_104_1(i < length); i++) {
      _$jscoverage['/format.js'].lineData[105]++;
      var c = pattern.charAt(i);
      _$jscoverage['/format.js'].lineData[107]++;
      if (visit2_107_1(c === '\'')) {
        _$jscoverage['/format.js'].lineData[110]++;
        if (visit3_110_1((i + 1) < length)) {
          _$jscoverage['/format.js'].lineData[111]++;
          c = pattern.charAt(i + 1);
          _$jscoverage['/format.js'].lineData[112]++;
          if (visit4_112_1(c === '\'')) {
            _$jscoverage['/format.js'].lineData[113]++;
            i++;
            _$jscoverage['/format.js'].lineData[114]++;
            if (visit5_114_1(count !== 0)) {
              _$jscoverage['/format.js'].lineData[115]++;
              encode(lastField, count, compiledPattern);
              _$jscoverage['/format.js'].lineData[116]++;
              lastField = -1;
              _$jscoverage['/format.js'].lineData[117]++;
              count = 0;
            }
            _$jscoverage['/format.js'].lineData[119]++;
            if (visit6_119_1(inQuote)) {
              _$jscoverage['/format.js'].lineData[120]++;
              tmpBuffer += c;
            }
            _$jscoverage['/format.js'].lineData[122]++;
            continue;
          }
        }
        _$jscoverage['/format.js'].lineData[125]++;
        if (visit7_125_1(!inQuote)) {
          _$jscoverage['/format.js'].lineData[126]++;
          if (visit8_126_1(count !== 0)) {
            _$jscoverage['/format.js'].lineData[127]++;
            encode(lastField, count, compiledPattern);
            _$jscoverage['/format.js'].lineData[128]++;
            lastField = -1;
            _$jscoverage['/format.js'].lineData[129]++;
            count = 0;
          }
          _$jscoverage['/format.js'].lineData[131]++;
          tmpBuffer = '';
          _$jscoverage['/format.js'].lineData[132]++;
          inQuote = true;
        } else {
          _$jscoverage['/format.js'].lineData[134]++;
          compiledPattern.push({
  text: tmpBuffer});
          _$jscoverage['/format.js'].lineData[137]++;
          inQuote = false;
        }
        _$jscoverage['/format.js'].lineData[139]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[141]++;
      if (visit9_141_1(inQuote)) {
        _$jscoverage['/format.js'].lineData[142]++;
        tmpBuffer += c;
        _$jscoverage['/format.js'].lineData[143]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[145]++;
      if (visit10_145_1(!(visit11_145_2(visit12_145_3(visit13_145_4(c >= 'a') && visit14_145_5(c <= 'z')) || visit15_145_6(visit16_145_7(c >= 'A') && visit17_145_8(c <= 'Z')))))) {
        _$jscoverage['/format.js'].lineData[146]++;
        if (visit18_146_1(count !== 0)) {
          _$jscoverage['/format.js'].lineData[147]++;
          encode(lastField, count, compiledPattern);
          _$jscoverage['/format.js'].lineData[148]++;
          lastField = -1;
          _$jscoverage['/format.js'].lineData[149]++;
          count = 0;
        }
        _$jscoverage['/format.js'].lineData[151]++;
        compiledPattern.push({
  text: c});
        _$jscoverage['/format.js'].lineData[154]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[157]++;
      if (visit19_157_1(patternChars.indexOf(c) === -1)) {
        _$jscoverage['/format.js'].lineData[158]++;
        throw new Error('Illegal pattern character "' + c + '"');
      }
      _$jscoverage['/format.js'].lineData[161]++;
      if (visit20_161_1(visit21_161_2(lastField === -1) || visit22_161_3(lastField === c))) {
        _$jscoverage['/format.js'].lineData[162]++;
        lastField = c;
        _$jscoverage['/format.js'].lineData[163]++;
        count++;
        _$jscoverage['/format.js'].lineData[164]++;
        continue;
      }
      _$jscoverage['/format.js'].lineData[166]++;
      encode(lastField, count, compiledPattern);
      _$jscoverage['/format.js'].lineData[167]++;
      lastField = c;
      _$jscoverage['/format.js'].lineData[168]++;
      count = 1;
    }
    _$jscoverage['/format.js'].lineData[171]++;
    if (visit23_171_1(inQuote)) {
      _$jscoverage['/format.js'].lineData[172]++;
      throw new Error('Unterminated quote');
    }
    _$jscoverage['/format.js'].lineData[175]++;
    if (visit24_175_1(count !== 0)) {
      _$jscoverage['/format.js'].lineData[176]++;
      encode(lastField, count, compiledPattern);
    }
    _$jscoverage['/format.js'].lineData[179]++;
    return compiledPattern;
  }
  _$jscoverage['/format.js'].lineData[182]++;
  var zeroDigit = '0';
  _$jscoverage['/format.js'].lineData[185]++;
  function zeroPaddingNumber(value, minDigits, maxDigits, buffer) {
    _$jscoverage['/format.js'].functionData[4]++;
    _$jscoverage['/format.js'].lineData[190]++;
    buffer = visit25_190_1(buffer || []);
    _$jscoverage['/format.js'].lineData[191]++;
    maxDigits = visit26_191_1(maxDigits || MAX_VALUE);
    _$jscoverage['/format.js'].lineData[192]++;
    if (visit27_192_1(value >= 0)) {
      _$jscoverage['/format.js'].lineData[193]++;
      if (visit28_193_1(visit29_193_2(value < 100) && visit30_193_3(visit31_193_4(minDigits >= 1) && visit32_193_5(minDigits <= 2)))) {
        _$jscoverage['/format.js'].lineData[194]++;
        if (visit33_194_1(visit34_194_2(value < 10) && visit35_194_3(minDigits === 2))) {
          _$jscoverage['/format.js'].lineData[195]++;
          buffer.push(zeroDigit);
        }
        _$jscoverage['/format.js'].lineData[197]++;
        buffer.push(value);
        _$jscoverage['/format.js'].lineData[198]++;
        return buffer.join('');
      } else {
        _$jscoverage['/format.js'].lineData[199]++;
        if (visit36_199_1(visit37_199_2(value >= 1000) && visit38_199_3(value < 10000))) {
          _$jscoverage['/format.js'].lineData[200]++;
          if (visit39_200_1(minDigits === 4)) {
            _$jscoverage['/format.js'].lineData[201]++;
            buffer.push(value);
            _$jscoverage['/format.js'].lineData[202]++;
            return buffer.join('');
          }
          _$jscoverage['/format.js'].lineData[204]++;
          if (visit40_204_1(visit41_204_2(minDigits === 2) && visit42_204_3(maxDigits === 2))) {
            _$jscoverage['/format.js'].lineData[205]++;
            return zeroPaddingNumber(value % 100, 2, 2, buffer);
          }
        }
      }
    }
    _$jscoverage['/format.js'].lineData[209]++;
    buffer.push(value + '');
    _$jscoverage['/format.js'].lineData[210]++;
    return buffer.join('');
  }
  _$jscoverage['/format.js'].lineData[338]++;
  function DateTimeFormat(pattern, locale, timeZoneOffset) {
    _$jscoverage['/format.js'].functionData[5]++;
    _$jscoverage['/format.js'].lineData[339]++;
    this.locale = visit43_339_1(locale || defaultLocale);
    _$jscoverage['/format.js'].lineData[340]++;
    this.pattern = compile(pattern);
    _$jscoverage['/format.js'].lineData[341]++;
    this.timezoneOffset = timeZoneOffset;
  }
  _$jscoverage['/format.js'].lineData[344]++;
  function formatField(field, count, locale, calendar) {
    _$jscoverage['/format.js'].functionData[6]++;
    _$jscoverage['/format.js'].lineData[345]++;
    var current, value;
    _$jscoverage['/format.js'].lineData[347]++;
    switch (field) {
      case 'G':
        _$jscoverage['/format.js'].lineData[349]++;
        value = visit44_349_1(calendar.getYear() > 0) ? 1 : 0;
        _$jscoverage['/format.js'].lineData[350]++;
        current = locale.eras[value];
        _$jscoverage['/format.js'].lineData[351]++;
        break;
      case 'y':
        _$jscoverage['/format.js'].lineData[353]++;
        value = calendar.getYear();
        _$jscoverage['/format.js'].lineData[354]++;
        if (visit45_354_1(value <= 0)) {
          _$jscoverage['/format.js'].lineData[355]++;
          value = 1 - value;
        }
        _$jscoverage['/format.js'].lineData[357]++;
        current = (zeroPaddingNumber(value, 2, visit46_357_1(count !== 2) ? MAX_VALUE : 2));
        _$jscoverage['/format.js'].lineData[358]++;
        break;
      case 'M':
        _$jscoverage['/format.js'].lineData[360]++;
        value = calendar.getMonth();
        _$jscoverage['/format.js'].lineData[361]++;
        if (visit47_361_1(count >= 4)) {
          _$jscoverage['/format.js'].lineData[362]++;
          current = locale.months[value];
        } else {
          _$jscoverage['/format.js'].lineData[363]++;
          if (visit48_363_1(count === 3)) {
            _$jscoverage['/format.js'].lineData[364]++;
            current = locale.shortMonths[value];
          } else {
            _$jscoverage['/format.js'].lineData[366]++;
            current = zeroPaddingNumber(value + 1, count);
          }
        }
        _$jscoverage['/format.js'].lineData[368]++;
        break;
      case 'k':
        _$jscoverage['/format.js'].lineData[370]++;
        current = zeroPaddingNumber(visit49_370_1(calendar.getHourOfDay() || 24), count);
        _$jscoverage['/format.js'].lineData[372]++;
        break;
      case 'E':
        _$jscoverage['/format.js'].lineData[374]++;
        value = calendar.getDayOfWeek();
        _$jscoverage['/format.js'].lineData[375]++;
        current = visit50_375_1(count >= 4) ? locale.weekdays[value] : locale.shortWeekdays[value];
        _$jscoverage['/format.js'].lineData[378]++;
        break;
      case 'a':
        _$jscoverage['/format.js'].lineData[380]++;
        current = locale.ampms[visit51_380_1(calendar.getHourOfDay() >= 12) ? 1 : 0];
        _$jscoverage['/format.js'].lineData[383]++;
        break;
      case 'h':
        _$jscoverage['/format.js'].lineData[385]++;
        current = zeroPaddingNumber(visit52_386_1(calendar.getHourOfDay() % 12 || 12), count);
        _$jscoverage['/format.js'].lineData[387]++;
        break;
      case 'K':
        _$jscoverage['/format.js'].lineData[389]++;
        current = zeroPaddingNumber(calendar.getHourOfDay() % 12, count);
        _$jscoverage['/format.js'].lineData[391]++;
        break;
      case 'Z':
        _$jscoverage['/format.js'].lineData[393]++;
        var offset = calendar.getTimezoneOffset();
        _$jscoverage['/format.js'].lineData[394]++;
        var parts = [visit53_394_1(offset < 0) ? '-' : '+'];
        _$jscoverage['/format.js'].lineData[395]++;
        offset = Math.abs(offset);
        _$jscoverage['/format.js'].lineData[396]++;
        parts.push(zeroPaddingNumber(Math.floor(offset / 60) % 100, 2), zeroPaddingNumber(offset % 60, 2));
        _$jscoverage['/format.js'].lineData[398]++;
        current = parts.join('');
        _$jscoverage['/format.js'].lineData[399]++;
        break;
      default:
        _$jscoverage['/format.js'].lineData[410]++;
        var index = calendarIndexMap[field];
        _$jscoverage['/format.js'].lineData[411]++;
        value = calendar.get(index);
        _$jscoverage['/format.js'].lineData[412]++;
        current = zeroPaddingNumber(value, count);
    }
    _$jscoverage['/format.js'].lineData[414]++;
    return current;
  }
  _$jscoverage['/format.js'].lineData[417]++;
  function matchField(dateStr, startIndex, matches) {
    _$jscoverage['/format.js'].functionData[7]++;
    _$jscoverage['/format.js'].lineData[418]++;
    var matchedLen = -1, index = -1, i, len = matches.length;
    _$jscoverage['/format.js'].lineData[422]++;
    for (i = 0; visit54_422_1(i < len); i++) {
      _$jscoverage['/format.js'].lineData[423]++;
      var m = matches[i];
      _$jscoverage['/format.js'].lineData[424]++;
      var mLen = m.length;
      _$jscoverage['/format.js'].lineData[425]++;
      if (visit55_425_1(visit56_425_2(mLen > matchedLen) && matchPartString(dateStr, startIndex, m, mLen))) {
        _$jscoverage['/format.js'].lineData[427]++;
        matchedLen = mLen;
        _$jscoverage['/format.js'].lineData[428]++;
        index = i;
      }
    }
    _$jscoverage['/format.js'].lineData[431]++;
    return visit57_431_1(index >= 0) ? {
  value: index, 
  startIndex: startIndex + matchedLen} : null;
  }
  _$jscoverage['/format.js'].lineData[437]++;
  function matchPartString(dateStr, startIndex, match, mLen) {
    _$jscoverage['/format.js'].functionData[8]++;
    _$jscoverage['/format.js'].lineData[438]++;
    for (var i = 0; visit58_438_1(i < mLen); i++) {
      _$jscoverage['/format.js'].lineData[439]++;
      if (visit59_439_1(dateStr.charAt(startIndex + i) !== match.charAt(i))) {
        _$jscoverage['/format.js'].lineData[440]++;
        return false;
      }
    }
    _$jscoverage['/format.js'].lineData[443]++;
    return true;
  }
  _$jscoverage['/format.js'].lineData[446]++;
  function getLeadingNumberLen(str) {
    _$jscoverage['/format.js'].functionData[9]++;
    _$jscoverage['/format.js'].lineData[447]++;
    var i, c, len = str.length;
    _$jscoverage['/format.js'].lineData[449]++;
    for (i = 0; visit60_449_1(i < len); i++) {
      _$jscoverage['/format.js'].lineData[450]++;
      c = str.charAt(i);
      _$jscoverage['/format.js'].lineData[451]++;
      if (visit61_451_1(visit62_451_2(c < '0') || visit63_451_3(c > '9'))) {
        _$jscoverage['/format.js'].lineData[452]++;
        break;
      }
    }
    _$jscoverage['/format.js'].lineData[455]++;
    return i;
  }
  _$jscoverage['/format.js'].lineData[458]++;
  function matchNumber(dateStr, startIndex, count, obeyCount) {
    _$jscoverage['/format.js'].functionData[10]++;
    _$jscoverage['/format.js'].lineData[459]++;
    var str = dateStr, n;
    _$jscoverage['/format.js'].lineData[460]++;
    if (visit64_460_1(obeyCount)) {
      _$jscoverage['/format.js'].lineData[461]++;
      if (visit65_461_1(dateStr.length <= startIndex + count)) {
        _$jscoverage['/format.js'].lineData[462]++;
        return null;
      }
      _$jscoverage['/format.js'].lineData[464]++;
      str = dateStr.substring(startIndex, count);
      _$jscoverage['/format.js'].lineData[465]++;
      if (visit66_465_1(!str.match(/^\d+$/))) {
        _$jscoverage['/format.js'].lineData[466]++;
        return null;
      }
    } else {
      _$jscoverage['/format.js'].lineData[469]++;
      str = str.substring(startIndex);
    }
    _$jscoverage['/format.js'].lineData[471]++;
    n = parseInt(str, 10);
    _$jscoverage['/format.js'].lineData[472]++;
    if (visit67_472_1(isNaN(n))) {
      _$jscoverage['/format.js'].lineData[473]++;
      return null;
    }
    _$jscoverage['/format.js'].lineData[475]++;
    return {
  value: n, 
  startIndex: startIndex + getLeadingNumberLen(str)};
  }
  _$jscoverage['/format.js'].lineData[481]++;
  function parseField(calendar, dateStr, startIndex, field, count, locale, obeyCount, tmp) {
    _$jscoverage['/format.js'].functionData[11]++;
    _$jscoverage['/format.js'].lineData[482]++;
    var match, year, hour;
    _$jscoverage['/format.js'].lineData[483]++;
    if (visit68_483_1(dateStr.length <= startIndex)) {
      _$jscoverage['/format.js'].lineData[484]++;
      return startIndex;
    }
    _$jscoverage['/format.js'].lineData[486]++;
    switch (field) {
      case 'G':
        _$jscoverage['/format.js'].lineData[488]++;
        if ((match = matchField(dateStr, startIndex, locale.eras))) {
          _$jscoverage['/format.js'].lineData[489]++;
          if (visit69_489_1(calendar.isSetYear())) {
            _$jscoverage['/format.js'].lineData[490]++;
            if (visit70_490_1(match.value === 0)) {
              _$jscoverage['/format.js'].lineData[491]++;
              year = calendar.getYear();
              _$jscoverage['/format.js'].lineData[492]++;
              calendar.setYear(1 - year);
            }
          } else {
            _$jscoverage['/format.js'].lineData[495]++;
            tmp.era = match.value;
          }
        }
        _$jscoverage['/format.js'].lineData[498]++;
        break;
      case 'y':
        _$jscoverage['/format.js'].lineData[500]++;
        if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[501]++;
          year = match.value;
          _$jscoverage['/format.js'].lineData[502]++;
          if (visit71_502_1('era' in tmp)) {
            _$jscoverage['/format.js'].lineData[503]++;
            if (visit72_503_1(tmp.era === 0)) {
              _$jscoverage['/format.js'].lineData[504]++;
              year = 1 - year;
            }
          }
          _$jscoverage['/format.js'].lineData[507]++;
          calendar.setYear(year);
        }
        _$jscoverage['/format.js'].lineData[509]++;
        break;
      case 'M':
        _$jscoverage['/format.js'].lineData[511]++;
        var month;
        _$jscoverage['/format.js'].lineData[512]++;
        if (visit73_512_1(count >= 3)) {
          _$jscoverage['/format.js'].lineData[513]++;
          if ((match = matchField(dateStr, startIndex, locale[visit74_513_1(count === 3) ? 'shortMonths' : 'months']))) {
            _$jscoverage['/format.js'].lineData[515]++;
            month = match.value;
          }
        } else {
          _$jscoverage['/format.js'].lineData[518]++;
          if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
            _$jscoverage['/format.js'].lineData[519]++;
            month = match.value - 1;
          }
        }
        _$jscoverage['/format.js'].lineData[522]++;
        if (visit75_522_1(match)) {
          _$jscoverage['/format.js'].lineData[523]++;
          calendar.setMonth(month);
        }
        _$jscoverage['/format.js'].lineData[525]++;
        break;
      case 'k':
        _$jscoverage['/format.js'].lineData[527]++;
        if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[528]++;
          calendar.setHourOfDay(match.value % 24);
        }
        _$jscoverage['/format.js'].lineData[530]++;
        break;
      case 'E':
        _$jscoverage['/format.js'].lineData[532]++;
        if ((match = matchField(dateStr, startIndex, locale[visit76_532_1(count > 3) ? 'weekdays' : 'shortWeekdays']))) {
          _$jscoverage['/format.js'].lineData[535]++;
          calendar.setDayOfWeek(match.value);
        }
        _$jscoverage['/format.js'].lineData[537]++;
        break;
      case 'a':
        _$jscoverage['/format.js'].lineData[539]++;
        if ((match = matchField(dateStr, startIndex, locale.ampms))) {
          _$jscoverage['/format.js'].lineData[540]++;
          if (visit77_540_1(calendar.isSetHourOfDay())) {
            _$jscoverage['/format.js'].lineData[541]++;
            if (visit78_541_1(match.value)) {
              _$jscoverage['/format.js'].lineData[542]++;
              hour = calendar.getHourOfDay();
              _$jscoverage['/format.js'].lineData[543]++;
              if (visit79_543_1(hour < 12)) {
                _$jscoverage['/format.js'].lineData[544]++;
                calendar.setHourOfDay((hour + 12) % 24);
              }
            }
          } else {
            _$jscoverage['/format.js'].lineData[548]++;
            tmp.ampm = match.value;
          }
        }
        _$jscoverage['/format.js'].lineData[551]++;
        break;
      case 'h':
        _$jscoverage['/format.js'].lineData[553]++;
        if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[554]++;
          hour = match.value %= 12;
          _$jscoverage['/format.js'].lineData[555]++;
          if (visit80_555_1(tmp.ampm)) {
            _$jscoverage['/format.js'].lineData[556]++;
            hour += 12;
          }
          _$jscoverage['/format.js'].lineData[558]++;
          calendar.setHourOfDay(hour);
        }
        _$jscoverage['/format.js'].lineData[560]++;
        break;
      case 'K':
        _$jscoverage['/format.js'].lineData[562]++;
        if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[563]++;
          hour = match.value;
          _$jscoverage['/format.js'].lineData[564]++;
          if (visit81_564_1(tmp.ampm)) {
            _$jscoverage['/format.js'].lineData[565]++;
            hour += 12;
          }
          _$jscoverage['/format.js'].lineData[567]++;
          calendar.setHourOfDay(hour);
        }
        _$jscoverage['/format.js'].lineData[569]++;
        break;
      case 'Z':
        _$jscoverage['/format.js'].lineData[571]++;
        var sign = 1, zoneChar = dateStr.charAt(startIndex);
        _$jscoverage['/format.js'].lineData[573]++;
        if (visit82_573_1(zoneChar === '-')) {
          _$jscoverage['/format.js'].lineData[574]++;
          sign = -1;
          _$jscoverage['/format.js'].lineData[575]++;
          startIndex++;
        } else {
          _$jscoverage['/format.js'].lineData[576]++;
          if (visit83_576_1(zoneChar === '+')) {
            _$jscoverage['/format.js'].lineData[577]++;
            startIndex++;
          } else {
            _$jscoverage['/format.js'].lineData[579]++;
            break;
          }
        }
        _$jscoverage['/format.js'].lineData[581]++;
        if ((match = matchNumber(dateStr, startIndex, 2, true))) {
          _$jscoverage['/format.js'].lineData[582]++;
          var zoneOffset = match.value * 60;
          _$jscoverage['/format.js'].lineData[583]++;
          startIndex = match.startIndex;
          _$jscoverage['/format.js'].lineData[584]++;
          if ((match = matchNumber(dateStr, startIndex, 2, true))) {
            _$jscoverage['/format.js'].lineData[585]++;
            zoneOffset += match.value;
          }
          _$jscoverage['/format.js'].lineData[587]++;
          calendar.setTimezoneOffset(zoneOffset);
        }
        _$jscoverage['/format.js'].lineData[589]++;
        break;
      default:
        _$jscoverage['/format.js'].lineData[600]++;
        if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          _$jscoverage['/format.js'].lineData[601]++;
          var index = calendarIndexMap[field];
          _$jscoverage['/format.js'].lineData[602]++;
          calendar.set(index, match.value);
        }
    }
    _$jscoverage['/format.js'].lineData[605]++;
    if (visit84_605_1(match)) {
      _$jscoverage['/format.js'].lineData[606]++;
      startIndex = match.startIndex;
    }
    _$jscoverage['/format.js'].lineData[608]++;
    return startIndex;
  }
  _$jscoverage['/format.js'].lineData[611]++;
  util.augment(DateTimeFormat, {
  format: function(calendar) {
  _$jscoverage['/format.js'].functionData[12]++;
  _$jscoverage['/format.js'].lineData[618]++;
  var time = calendar.getTime();
  _$jscoverage['/format.js'].lineData[619]++;
  calendar = new GregorianCalendar(this.timezoneOffset, this.locale);
  _$jscoverage['/format.js'].lineData[621]++;
  calendar.setTime(time);
  _$jscoverage['/format.js'].lineData[622]++;
  var i, ret = [], pattern = this.pattern, len = pattern.length;
  _$jscoverage['/format.js'].lineData[626]++;
  for (i = 0; visit85_626_1(i < len); i++) {
    _$jscoverage['/format.js'].lineData[627]++;
    var comp = pattern[i];
    _$jscoverage['/format.js'].lineData[628]++;
    if (visit86_628_1(comp.text)) {
      _$jscoverage['/format.js'].lineData[629]++;
      ret.push(comp.text);
    } else {
      _$jscoverage['/format.js'].lineData[630]++;
      if (visit87_630_1('field' in comp)) {
        _$jscoverage['/format.js'].lineData[631]++;
        ret.push(formatField(comp.field, comp.count, this.locale, calendar));
      }
    }
  }
  _$jscoverage['/format.js'].lineData[634]++;
  return ret.join('');
}, 
  parse: function(dateStr) {
  _$jscoverage['/format.js'].functionData[13]++;
  _$jscoverage['/format.js'].lineData[643]++;
  var calendar = new GregorianCalendar(this.timezoneOffset, this.locale), i, j, tmp = {}, obeyCount = false, dateStrLen = dateStr.length, errorIndex = -1, startIndex = 0, oldStartIndex = 0, pattern = this.pattern, len = pattern.length;
  _$jscoverage['/format.js'].lineData[656]++;
  loopPattern:
    {
      _$jscoverage['/format.js'].lineData[657]++;
      for (i = 0; visit88_657_1(visit89_657_2(errorIndex < 0) && visit90_657_3(i < len)); i++) {
        _$jscoverage['/format.js'].lineData[658]++;
        var comp = pattern[i], text, textLen;
        _$jscoverage['/format.js'].lineData[659]++;
        oldStartIndex = startIndex;
        _$jscoverage['/format.js'].lineData[660]++;
        if ((text = comp.text)) {
          _$jscoverage['/format.js'].lineData[661]++;
          textLen = text.length;
          _$jscoverage['/format.js'].lineData[662]++;
          if (visit91_662_1((textLen + startIndex) > dateStrLen)) {
            _$jscoverage['/format.js'].lineData[663]++;
            errorIndex = startIndex;
          } else {
            _$jscoverage['/format.js'].lineData[665]++;
            for (j = 0; visit92_665_1(j < textLen); j++) {
              _$jscoverage['/format.js'].lineData[666]++;
              if (visit93_666_1(text.charAt(j) !== dateStr.charAt(j + startIndex))) {
                _$jscoverage['/format.js'].lineData[667]++;
                errorIndex = startIndex;
                _$jscoverage['/format.js'].lineData[668]++;
                break loopPattern;
              }
            }
            _$jscoverage['/format.js'].lineData[671]++;
            startIndex += textLen;
          }
        } else {
          _$jscoverage['/format.js'].lineData[673]++;
          if (visit94_673_1('field' in comp)) {
            _$jscoverage['/format.js'].lineData[674]++;
            obeyCount = false;
            _$jscoverage['/format.js'].lineData[675]++;
            var nextComp = pattern[i + 1];
            _$jscoverage['/format.js'].lineData[676]++;
            if (visit95_676_1(nextComp)) {
              _$jscoverage['/format.js'].lineData[677]++;
              if (visit96_677_1('field' in nextComp)) {
                _$jscoverage['/format.js'].lineData[678]++;
                obeyCount = true;
              } else {
                _$jscoverage['/format.js'].lineData[680]++;
                var c = nextComp.text.charAt(0);
                _$jscoverage['/format.js'].lineData[681]++;
                if (visit97_681_1(visit98_681_2(c >= '0') && visit99_681_3(c <= '9'))) {
                  _$jscoverage['/format.js'].lineData[682]++;
                  obeyCount = true;
                }
              }
            }
            _$jscoverage['/format.js'].lineData[686]++;
            startIndex = parseField(calendar, dateStr, startIndex, comp.field, comp.count, this.locale, obeyCount, tmp);
            _$jscoverage['/format.js'].lineData[694]++;
            if (visit100_694_1(startIndex === oldStartIndex)) {
              _$jscoverage['/format.js'].lineData[695]++;
              errorIndex = startIndex;
            }
          }
        }
      }
    }
  _$jscoverage['/format.js'].lineData[701]++;
  if (visit101_701_1(errorIndex >= 0)) {
    _$jscoverage['/format.js'].lineData[702]++;
    logger.error('error when parsing date');
    _$jscoverage['/format.js'].lineData[703]++;
    logger.error(dateStr);
    _$jscoverage['/format.js'].lineData[704]++;
    logger.error(dateStr.substring(0, errorIndex) + '^');
    _$jscoverage['/format.js'].lineData[705]++;
    return undefined;
  }
  _$jscoverage['/format.js'].lineData[707]++;
  return calendar;
}});
  _$jscoverage['/format.js'].lineData[711]++;
  util.mix(DateTimeFormat, {
  Style: DateTimeStyle, 
  getInstance: function(locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[14]++;
  _$jscoverage['/format.js'].lineData[724]++;
  return this.getDateTimeInstance(DateTimeStyle.SHORT, DateTimeStyle.SHORT, locale, timeZoneOffset);
}, 
  getDateInstance: function(dateStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[15]++;
  _$jscoverage['/format.js'].lineData[736]++;
  return this.getDateTimeInstance(dateStyle, undefined, locale, timeZoneOffset);
}, 
  getDateTimeInstance: function(dateStyle, timeStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[16]++;
  _$jscoverage['/format.js'].lineData[749]++;
  locale = visit102_749_1(locale || defaultLocale);
  _$jscoverage['/format.js'].lineData[750]++;
  var datePattern = '';
  _$jscoverage['/format.js'].lineData[751]++;
  if (visit103_751_1(dateStyle !== undefined)) {
    _$jscoverage['/format.js'].lineData[752]++;
    datePattern = locale.datePatterns[dateStyle];
  }
  _$jscoverage['/format.js'].lineData[754]++;
  var timePattern = '';
  _$jscoverage['/format.js'].lineData[755]++;
  if (visit104_755_1(timeStyle !== undefined)) {
    _$jscoverage['/format.js'].lineData[756]++;
    timePattern = locale.timePatterns[timeStyle];
  }
  _$jscoverage['/format.js'].lineData[758]++;
  var pattern = datePattern;
  _$jscoverage['/format.js'].lineData[759]++;
  if (visit105_759_1(timePattern)) {
    _$jscoverage['/format.js'].lineData[760]++;
    if (visit106_760_1(datePattern)) {
      _$jscoverage['/format.js'].lineData[761]++;
      pattern = util.substitute(locale.dateTimePattern, {
  date: datePattern, 
  time: timePattern});
    } else {
      _$jscoverage['/format.js'].lineData[766]++;
      pattern = timePattern;
    }
  }
  _$jscoverage['/format.js'].lineData[769]++;
  return new DateTimeFormat(pattern, locale, timeZoneOffset);
}, 
  getTimeInstance: function(timeStyle, locale, timeZoneOffset) {
  _$jscoverage['/format.js'].functionData[17]++;
  _$jscoverage['/format.js'].lineData[781]++;
  return this.getDateTimeInstance(undefined, timeStyle, locale, timeZoneOffset);
}});
  _$jscoverage['/format.js'].lineData[785]++;
  return DateTimeFormat;
});
