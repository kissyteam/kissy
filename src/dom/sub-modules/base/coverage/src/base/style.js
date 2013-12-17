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
if (! _$jscoverage['/base/style.js']) {
  _$jscoverage['/base/style.js'] = {};
  _$jscoverage['/base/style.js'].lineData = [];
  _$jscoverage['/base/style.js'].lineData[6] = 0;
  _$jscoverage['/base/style.js'].lineData[7] = 0;
  _$jscoverage['/base/style.js'].lineData[8] = 0;
  _$jscoverage['/base/style.js'].lineData[9] = 0;
  _$jscoverage['/base/style.js'].lineData[46] = 0;
  _$jscoverage['/base/style.js'].lineData[47] = 0;
  _$jscoverage['/base/style.js'].lineData[50] = 0;
  _$jscoverage['/base/style.js'].lineData[51] = 0;
  _$jscoverage['/base/style.js'].lineData[54] = 0;
  _$jscoverage['/base/style.js'].lineData[56] = 0;
  _$jscoverage['/base/style.js'].lineData[59] = 0;
  _$jscoverage['/base/style.js'].lineData[60] = 0;
  _$jscoverage['/base/style.js'].lineData[63] = 0;
  _$jscoverage['/base/style.js'].lineData[64] = 0;
  _$jscoverage['/base/style.js'].lineData[65] = 0;
  _$jscoverage['/base/style.js'].lineData[67] = 0;
  _$jscoverage['/base/style.js'].lineData[68] = 0;
  _$jscoverage['/base/style.js'].lineData[69] = 0;
  _$jscoverage['/base/style.js'].lineData[71] = 0;
  _$jscoverage['/base/style.js'].lineData[73] = 0;
  _$jscoverage['/base/style.js'].lineData[76] = 0;
  _$jscoverage['/base/style.js'].lineData[90] = 0;
  _$jscoverage['/base/style.js'].lineData[97] = 0;
  _$jscoverage['/base/style.js'].lineData[100] = 0;
  _$jscoverage['/base/style.js'].lineData[101] = 0;
  _$jscoverage['/base/style.js'].lineData[105] = 0;
  _$jscoverage['/base/style.js'].lineData[106] = 0;
  _$jscoverage['/base/style.js'].lineData[110] = 0;
  _$jscoverage['/base/style.js'].lineData[111] = 0;
  _$jscoverage['/base/style.js'].lineData[112] = 0;
  _$jscoverage['/base/style.js'].lineData[113] = 0;
  _$jscoverage['/base/style.js'].lineData[114] = 0;
  _$jscoverage['/base/style.js'].lineData[116] = 0;
  _$jscoverage['/base/style.js'].lineData[117] = 0;
  _$jscoverage['/base/style.js'].lineData[119] = 0;
  _$jscoverage['/base/style.js'].lineData[120] = 0;
  _$jscoverage['/base/style.js'].lineData[121] = 0;
  _$jscoverage['/base/style.js'].lineData[124] = 0;
  _$jscoverage['/base/style.js'].lineData[137] = 0;
  _$jscoverage['/base/style.js'].lineData[142] = 0;
  _$jscoverage['/base/style.js'].lineData[143] = 0;
  _$jscoverage['/base/style.js'].lineData[144] = 0;
  _$jscoverage['/base/style.js'].lineData[145] = 0;
  _$jscoverage['/base/style.js'].lineData[148] = 0;
  _$jscoverage['/base/style.js'].lineData[150] = 0;
  _$jscoverage['/base/style.js'].lineData[151] = 0;
  _$jscoverage['/base/style.js'].lineData[152] = 0;
  _$jscoverage['/base/style.js'].lineData[153] = 0;
  _$jscoverage['/base/style.js'].lineData[155] = 0;
  _$jscoverage['/base/style.js'].lineData[157] = 0;
  _$jscoverage['/base/style.js'].lineData[158] = 0;
  _$jscoverage['/base/style.js'].lineData[161] = 0;
  _$jscoverage['/base/style.js'].lineData[174] = 0;
  _$jscoverage['/base/style.js'].lineData[181] = 0;
  _$jscoverage['/base/style.js'].lineData[182] = 0;
  _$jscoverage['/base/style.js'].lineData[183] = 0;
  _$jscoverage['/base/style.js'].lineData[184] = 0;
  _$jscoverage['/base/style.js'].lineData[187] = 0;
  _$jscoverage['/base/style.js'].lineData[190] = 0;
  _$jscoverage['/base/style.js'].lineData[191] = 0;
  _$jscoverage['/base/style.js'].lineData[193] = 0;
  _$jscoverage['/base/style.js'].lineData[195] = 0;
  _$jscoverage['/base/style.js'].lineData[196] = 0;
  _$jscoverage['/base/style.js'].lineData[198] = 0;
  _$jscoverage['/base/style.js'].lineData[201] = 0;
  _$jscoverage['/base/style.js'].lineData[204] = 0;
  _$jscoverage['/base/style.js'].lineData[208] = 0;
  _$jscoverage['/base/style.js'].lineData[209] = 0;
  _$jscoverage['/base/style.js'].lineData[212] = 0;
  _$jscoverage['/base/style.js'].lineData[220] = 0;
  _$jscoverage['/base/style.js'].lineData[224] = 0;
  _$jscoverage['/base/style.js'].lineData[225] = 0;
  _$jscoverage['/base/style.js'].lineData[226] = 0;
  _$jscoverage['/base/style.js'].lineData[228] = 0;
  _$jscoverage['/base/style.js'].lineData[229] = 0;
  _$jscoverage['/base/style.js'].lineData[230] = 0;
  _$jscoverage['/base/style.js'].lineData[231] = 0;
  _$jscoverage['/base/style.js'].lineData[232] = 0;
  _$jscoverage['/base/style.js'].lineData[242] = 0;
  _$jscoverage['/base/style.js'].lineData[244] = 0;
  _$jscoverage['/base/style.js'].lineData[245] = 0;
  _$jscoverage['/base/style.js'].lineData[246] = 0;
  _$jscoverage['/base/style.js'].lineData[248] = 0;
  _$jscoverage['/base/style.js'].lineData[249] = 0;
  _$jscoverage['/base/style.js'].lineData[250] = 0;
  _$jscoverage['/base/style.js'].lineData[252] = 0;
  _$jscoverage['/base/style.js'].lineData[262] = 0;
  _$jscoverage['/base/style.js'].lineData[264] = 0;
  _$jscoverage['/base/style.js'].lineData[265] = 0;
  _$jscoverage['/base/style.js'].lineData[266] = 0;
  _$jscoverage['/base/style.js'].lineData[267] = 0;
  _$jscoverage['/base/style.js'].lineData[269] = 0;
  _$jscoverage['/base/style.js'].lineData[283] = 0;
  _$jscoverage['/base/style.js'].lineData[284] = 0;
  _$jscoverage['/base/style.js'].lineData[285] = 0;
  _$jscoverage['/base/style.js'].lineData[287] = 0;
  _$jscoverage['/base/style.js'].lineData[290] = 0;
  _$jscoverage['/base/style.js'].lineData[293] = 0;
  _$jscoverage['/base/style.js'].lineData[294] = 0;
  _$jscoverage['/base/style.js'].lineData[298] = 0;
  _$jscoverage['/base/style.js'].lineData[299] = 0;
  _$jscoverage['/base/style.js'].lineData[302] = 0;
  _$jscoverage['/base/style.js'].lineData[305] = 0;
  _$jscoverage['/base/style.js'].lineData[307] = 0;
  _$jscoverage['/base/style.js'].lineData[308] = 0;
  _$jscoverage['/base/style.js'].lineData[310] = 0;
  _$jscoverage['/base/style.js'].lineData[319] = 0;
  _$jscoverage['/base/style.js'].lineData[327] = 0;
  _$jscoverage['/base/style.js'].lineData[328] = 0;
  _$jscoverage['/base/style.js'].lineData[330] = 0;
  _$jscoverage['/base/style.js'].lineData[331] = 0;
  _$jscoverage['/base/style.js'].lineData[332] = 0;
  _$jscoverage['/base/style.js'].lineData[333] = 0;
  _$jscoverage['/base/style.js'].lineData[334] = 0;
  _$jscoverage['/base/style.js'].lineData[335] = 0;
  _$jscoverage['/base/style.js'].lineData[336] = 0;
  _$jscoverage['/base/style.js'].lineData[337] = 0;
  _$jscoverage['/base/style.js'].lineData[338] = 0;
  _$jscoverage['/base/style.js'].lineData[339] = 0;
  _$jscoverage['/base/style.js'].lineData[340] = 0;
  _$jscoverage['/base/style.js'].lineData[341] = 0;
  _$jscoverage['/base/style.js'].lineData[402] = 0;
  _$jscoverage['/base/style.js'].lineData[403] = 0;
  _$jscoverage['/base/style.js'].lineData[404] = 0;
  _$jscoverage['/base/style.js'].lineData[405] = 0;
  _$jscoverage['/base/style.js'].lineData[408] = 0;
  _$jscoverage['/base/style.js'].lineData[409] = 0;
  _$jscoverage['/base/style.js'].lineData[410] = 0;
  _$jscoverage['/base/style.js'].lineData[412] = 0;
  _$jscoverage['/base/style.js'].lineData[414] = 0;
  _$jscoverage['/base/style.js'].lineData[415] = 0;
  _$jscoverage['/base/style.js'].lineData[416] = 0;
  _$jscoverage['/base/style.js'].lineData[417] = 0;
  _$jscoverage['/base/style.js'].lineData[418] = 0;
  _$jscoverage['/base/style.js'].lineData[419] = 0;
  _$jscoverage['/base/style.js'].lineData[420] = 0;
  _$jscoverage['/base/style.js'].lineData[421] = 0;
  _$jscoverage['/base/style.js'].lineData[423] = 0;
  _$jscoverage['/base/style.js'].lineData[425] = 0;
  _$jscoverage['/base/style.js'].lineData[427] = 0;
  _$jscoverage['/base/style.js'].lineData[433] = 0;
  _$jscoverage['/base/style.js'].lineData[438] = 0;
  _$jscoverage['/base/style.js'].lineData[439] = 0;
  _$jscoverage['/base/style.js'].lineData[440] = 0;
  _$jscoverage['/base/style.js'].lineData[442] = 0;
  _$jscoverage['/base/style.js'].lineData[447] = 0;
  _$jscoverage['/base/style.js'].lineData[449] = 0;
  _$jscoverage['/base/style.js'].lineData[450] = 0;
  _$jscoverage['/base/style.js'].lineData[452] = 0;
  _$jscoverage['/base/style.js'].lineData[455] = 0;
  _$jscoverage['/base/style.js'].lineData[456] = 0;
  _$jscoverage['/base/style.js'].lineData[457] = 0;
  _$jscoverage['/base/style.js'].lineData[458] = 0;
  _$jscoverage['/base/style.js'].lineData[460] = 0;
  _$jscoverage['/base/style.js'].lineData[461] = 0;
  _$jscoverage['/base/style.js'].lineData[462] = 0;
  _$jscoverage['/base/style.js'].lineData[463] = 0;
  _$jscoverage['/base/style.js'].lineData[466] = 0;
  _$jscoverage['/base/style.js'].lineData[467] = 0;
  _$jscoverage['/base/style.js'].lineData[470] = 0;
  _$jscoverage['/base/style.js'].lineData[475] = 0;
  _$jscoverage['/base/style.js'].lineData[476] = 0;
  _$jscoverage['/base/style.js'].lineData[481] = 0;
  _$jscoverage['/base/style.js'].lineData[482] = 0;
  _$jscoverage['/base/style.js'].lineData[483] = 0;
  _$jscoverage['/base/style.js'].lineData[486] = 0;
  _$jscoverage['/base/style.js'].lineData[489] = 0;
  _$jscoverage['/base/style.js'].lineData[490] = 0;
  _$jscoverage['/base/style.js'].lineData[494] = 0;
  _$jscoverage['/base/style.js'].lineData[495] = 0;
  _$jscoverage['/base/style.js'].lineData[498] = 0;
  _$jscoverage['/base/style.js'].lineData[500] = 0;
  _$jscoverage['/base/style.js'].lineData[502] = 0;
  _$jscoverage['/base/style.js'].lineData[503] = 0;
  _$jscoverage['/base/style.js'].lineData[504] = 0;
  _$jscoverage['/base/style.js'].lineData[506] = 0;
  _$jscoverage['/base/style.js'].lineData[508] = 0;
  _$jscoverage['/base/style.js'].lineData[509] = 0;
  _$jscoverage['/base/style.js'].lineData[512] = 0;
  _$jscoverage['/base/style.js'].lineData[513] = 0;
  _$jscoverage['/base/style.js'].lineData[515] = 0;
  _$jscoverage['/base/style.js'].lineData[516] = 0;
  _$jscoverage['/base/style.js'].lineData[518] = 0;
  _$jscoverage['/base/style.js'].lineData[520] = 0;
  _$jscoverage['/base/style.js'].lineData[522] = 0;
  _$jscoverage['/base/style.js'].lineData[524] = 0;
  _$jscoverage['/base/style.js'].lineData[527] = 0;
  _$jscoverage['/base/style.js'].lineData[528] = 0;
  _$jscoverage['/base/style.js'].lineData[531] = 0;
  _$jscoverage['/base/style.js'].lineData[534] = 0;
  _$jscoverage['/base/style.js'].lineData[535] = 0;
  _$jscoverage['/base/style.js'].lineData[537] = 0;
  _$jscoverage['/base/style.js'].lineData[539] = 0;
  _$jscoverage['/base/style.js'].lineData[544] = 0;
  _$jscoverage['/base/style.js'].lineData[547] = 0;
  _$jscoverage['/base/style.js'].lineData[549] = 0;
  _$jscoverage['/base/style.js'].lineData[554] = 0;
  _$jscoverage['/base/style.js'].lineData[555] = 0;
  _$jscoverage['/base/style.js'].lineData[558] = 0;
  _$jscoverage['/base/style.js'].lineData[559] = 0;
  _$jscoverage['/base/style.js'].lineData[561] = 0;
  _$jscoverage['/base/style.js'].lineData[562] = 0;
  _$jscoverage['/base/style.js'].lineData[565] = 0;
  _$jscoverage['/base/style.js'].lineData[568] = 0;
  _$jscoverage['/base/style.js'].lineData[569] = 0;
  _$jscoverage['/base/style.js'].lineData[570] = 0;
  _$jscoverage['/base/style.js'].lineData[571] = 0;
  _$jscoverage['/base/style.js'].lineData[572] = 0;
  _$jscoverage['/base/style.js'].lineData[573] = 0;
  _$jscoverage['/base/style.js'].lineData[574] = 0;
  _$jscoverage['/base/style.js'].lineData[575] = 0;
  _$jscoverage['/base/style.js'].lineData[576] = 0;
  _$jscoverage['/base/style.js'].lineData[578] = 0;
  _$jscoverage['/base/style.js'].lineData[580] = 0;
  _$jscoverage['/base/style.js'].lineData[584] = 0;
  _$jscoverage['/base/style.js'].lineData[587] = 0;
  _$jscoverage['/base/style.js'].lineData[588] = 0;
  _$jscoverage['/base/style.js'].lineData[591] = 0;
  _$jscoverage['/base/style.js'].lineData[592] = 0;
  _$jscoverage['/base/style.js'].lineData[594] = 0;
  _$jscoverage['/base/style.js'].lineData[596] = 0;
  _$jscoverage['/base/style.js'].lineData[598] = 0;
  _$jscoverage['/base/style.js'].lineData[609] = 0;
  _$jscoverage['/base/style.js'].lineData[610] = 0;
  _$jscoverage['/base/style.js'].lineData[611] = 0;
  _$jscoverage['/base/style.js'].lineData[612] = 0;
  _$jscoverage['/base/style.js'].lineData[613] = 0;
  _$jscoverage['/base/style.js'].lineData[615] = 0;
  _$jscoverage['/base/style.js'].lineData[617] = 0;
  _$jscoverage['/base/style.js'].lineData[618] = 0;
  _$jscoverage['/base/style.js'].lineData[619] = 0;
  _$jscoverage['/base/style.js'].lineData[620] = 0;
  _$jscoverage['/base/style.js'].lineData[621] = 0;
  _$jscoverage['/base/style.js'].lineData[623] = 0;
  _$jscoverage['/base/style.js'].lineData[624] = 0;
  _$jscoverage['/base/style.js'].lineData[625] = 0;
  _$jscoverage['/base/style.js'].lineData[628] = 0;
  _$jscoverage['/base/style.js'].lineData[630] = 0;
  _$jscoverage['/base/style.js'].lineData[631] = 0;
  _$jscoverage['/base/style.js'].lineData[633] = 0;
  _$jscoverage['/base/style.js'].lineData[634] = 0;
  _$jscoverage['/base/style.js'].lineData[635] = 0;
  _$jscoverage['/base/style.js'].lineData[636] = 0;
  _$jscoverage['/base/style.js'].lineData[637] = 0;
  _$jscoverage['/base/style.js'].lineData[640] = 0;
  _$jscoverage['/base/style.js'].lineData[642] = 0;
  _$jscoverage['/base/style.js'].lineData[643] = 0;
  _$jscoverage['/base/style.js'].lineData[648] = 0;
  _$jscoverage['/base/style.js'].lineData[653] = 0;
  _$jscoverage['/base/style.js'].lineData[655] = 0;
  _$jscoverage['/base/style.js'].lineData[656] = 0;
  _$jscoverage['/base/style.js'].lineData[660] = 0;
  _$jscoverage['/base/style.js'].lineData[661] = 0;
  _$jscoverage['/base/style.js'].lineData[666] = 0;
  _$jscoverage['/base/style.js'].lineData[667] = 0;
  _$jscoverage['/base/style.js'].lineData[668] = 0;
  _$jscoverage['/base/style.js'].lineData[669] = 0;
  _$jscoverage['/base/style.js'].lineData[670] = 0;
  _$jscoverage['/base/style.js'].lineData[673] = 0;
  _$jscoverage['/base/style.js'].lineData[674] = 0;
  _$jscoverage['/base/style.js'].lineData[678] = 0;
  _$jscoverage['/base/style.js'].lineData[684] = 0;
  _$jscoverage['/base/style.js'].lineData[685] = 0;
  _$jscoverage['/base/style.js'].lineData[686] = 0;
  _$jscoverage['/base/style.js'].lineData[688] = 0;
  _$jscoverage['/base/style.js'].lineData[690] = 0;
  _$jscoverage['/base/style.js'].lineData[693] = 0;
}
if (! _$jscoverage['/base/style.js'].functionData) {
  _$jscoverage['/base/style.js'].functionData = [];
  _$jscoverage['/base/style.js'].functionData[0] = 0;
  _$jscoverage['/base/style.js'].functionData[1] = 0;
  _$jscoverage['/base/style.js'].functionData[2] = 0;
  _$jscoverage['/base/style.js'].functionData[3] = 0;
  _$jscoverage['/base/style.js'].functionData[4] = 0;
  _$jscoverage['/base/style.js'].functionData[5] = 0;
  _$jscoverage['/base/style.js'].functionData[6] = 0;
  _$jscoverage['/base/style.js'].functionData[7] = 0;
  _$jscoverage['/base/style.js'].functionData[8] = 0;
  _$jscoverage['/base/style.js'].functionData[9] = 0;
  _$jscoverage['/base/style.js'].functionData[10] = 0;
  _$jscoverage['/base/style.js'].functionData[11] = 0;
  _$jscoverage['/base/style.js'].functionData[12] = 0;
  _$jscoverage['/base/style.js'].functionData[13] = 0;
  _$jscoverage['/base/style.js'].functionData[14] = 0;
  _$jscoverage['/base/style.js'].functionData[15] = 0;
  _$jscoverage['/base/style.js'].functionData[16] = 0;
  _$jscoverage['/base/style.js'].functionData[17] = 0;
  _$jscoverage['/base/style.js'].functionData[18] = 0;
  _$jscoverage['/base/style.js'].functionData[19] = 0;
  _$jscoverage['/base/style.js'].functionData[20] = 0;
  _$jscoverage['/base/style.js'].functionData[21] = 0;
  _$jscoverage['/base/style.js'].functionData[22] = 0;
  _$jscoverage['/base/style.js'].functionData[23] = 0;
  _$jscoverage['/base/style.js'].functionData[24] = 0;
  _$jscoverage['/base/style.js'].functionData[25] = 0;
  _$jscoverage['/base/style.js'].functionData[26] = 0;
  _$jscoverage['/base/style.js'].functionData[27] = 0;
  _$jscoverage['/base/style.js'].functionData[28] = 0;
  _$jscoverage['/base/style.js'].functionData[29] = 0;
}
if (! _$jscoverage['/base/style.js'].branchData) {
  _$jscoverage['/base/style.js'].branchData = {};
  _$jscoverage['/base/style.js'].branchData['17'] = [];
  _$jscoverage['/base/style.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['47'] = [];
  _$jscoverage['/base/style.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['63'] = [];
  _$jscoverage['/base/style.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['64'] = [];
  _$jscoverage['/base/style.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['100'] = [];
  _$jscoverage['/base/style.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['101'] = [];
  _$jscoverage['/base/style.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['105'] = [];
  _$jscoverage['/base/style.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['105'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['110'] = [];
  _$jscoverage['/base/style.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['142'] = [];
  _$jscoverage['/base/style.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['144'] = [];
  _$jscoverage['/base/style.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['150'] = [];
  _$jscoverage['/base/style.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['152'] = [];
  _$jscoverage['/base/style.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['157'] = [];
  _$jscoverage['/base/style.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['181'] = [];
  _$jscoverage['/base/style.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['183'] = [];
  _$jscoverage['/base/style.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['193'] = [];
  _$jscoverage['/base/style.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['196'] = [];
  _$jscoverage['/base/style.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['198'] = [];
  _$jscoverage['/base/style.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['198'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['198'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['199'] = [];
  _$jscoverage['/base/style.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['204'] = [];
  _$jscoverage['/base/style.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['208'] = [];
  _$jscoverage['/base/style.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['224'] = [];
  _$jscoverage['/base/style.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['226'] = [];
  _$jscoverage['/base/style.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['228'] = [];
  _$jscoverage['/base/style.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['244'] = [];
  _$jscoverage['/base/style.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['248'] = [];
  _$jscoverage['/base/style.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['249'] = [];
  _$jscoverage['/base/style.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['264'] = [];
  _$jscoverage['/base/style.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['266'] = [];
  _$jscoverage['/base/style.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['283'] = [];
  _$jscoverage['/base/style.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['293'] = [];
  _$jscoverage['/base/style.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['298'] = [];
  _$jscoverage['/base/style.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['307'] = [];
  _$jscoverage['/base/style.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['327'] = [];
  _$jscoverage['/base/style.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['330'] = [];
  _$jscoverage['/base/style.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['333'] = [];
  _$jscoverage['/base/style.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['335'] = [];
  _$jscoverage['/base/style.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['340'] = [];
  _$jscoverage['/base/style.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['405'] = [];
  _$jscoverage['/base/style.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['410'] = [];
  _$jscoverage['/base/style.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['412'] = [];
  _$jscoverage['/base/style.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['416'] = [];
  _$jscoverage['/base/style.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['417'] = [];
  _$jscoverage['/base/style.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['420'] = [];
  _$jscoverage['/base/style.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['427'] = [];
  _$jscoverage['/base/style.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['439'] = [];
  _$jscoverage['/base/style.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['455'] = [];
  _$jscoverage['/base/style.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['457'] = [];
  _$jscoverage['/base/style.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['461'] = [];
  _$jscoverage['/base/style.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['462'] = [];
  _$jscoverage['/base/style.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['462'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['466'] = [];
  _$jscoverage['/base/style.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['498'] = [];
  _$jscoverage['/base/style.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['498'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['499'] = [];
  _$jscoverage['/base/style.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['499'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['506'] = [];
  _$jscoverage['/base/style.js'].branchData['506'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['508'] = [];
  _$jscoverage['/base/style.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['508'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['508'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['512'] = [];
  _$jscoverage['/base/style.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['515'] = [];
  _$jscoverage['/base/style.js'].branchData['515'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['518'] = [];
  _$jscoverage['/base/style.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['527'] = [];
  _$jscoverage['/base/style.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['527'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['531'] = [];
  _$jscoverage['/base/style.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['534'] = [];
  _$jscoverage['/base/style.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['544'] = [];
  _$jscoverage['/base/style.js'].branchData['544'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['544'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['544'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['545'] = [];
  _$jscoverage['/base/style.js'].branchData['545'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['549'] = [];
  _$jscoverage['/base/style.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['558'] = [];
  _$jscoverage['/base/style.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['570'] = [];
  _$jscoverage['/base/style.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['572'] = [];
  _$jscoverage['/base/style.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['573'] = [];
  _$jscoverage['/base/style.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['575'] = [];
  _$jscoverage['/base/style.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['580'] = [];
  _$jscoverage['/base/style.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['588'] = [];
  _$jscoverage['/base/style.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['594'] = [];
  _$jscoverage['/base/style.js'].branchData['594'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['610'] = [];
  _$jscoverage['/base/style.js'].branchData['610'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['611'] = [];
  _$jscoverage['/base/style.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['612'] = [];
  _$jscoverage['/base/style.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['613'] = [];
  _$jscoverage['/base/style.js'].branchData['613'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['615'] = [];
  _$jscoverage['/base/style.js'].branchData['615'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['616'] = [];
  _$jscoverage['/base/style.js'].branchData['616'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['620'] = [];
  _$jscoverage['/base/style.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['620'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['620'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['624'] = [];
  _$jscoverage['/base/style.js'].branchData['624'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['624'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['624'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['625'] = [];
  _$jscoverage['/base/style.js'].branchData['625'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['628'] = [];
  _$jscoverage['/base/style.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['630'] = [];
  _$jscoverage['/base/style.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['633'] = [];
  _$jscoverage['/base/style.js'].branchData['633'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['633'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['634'] = [];
  _$jscoverage['/base/style.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['635'] = [];
  _$jscoverage['/base/style.js'].branchData['635'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['636'] = [];
  _$jscoverage['/base/style.js'].branchData['636'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['642'] = [];
  _$jscoverage['/base/style.js'].branchData['642'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['643'] = [];
  _$jscoverage['/base/style.js'].branchData['643'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['644'] = [];
  _$jscoverage['/base/style.js'].branchData['644'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['660'] = [];
  _$jscoverage['/base/style.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['669'] = [];
  _$jscoverage['/base/style.js'].branchData['669'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['670'] = [];
  _$jscoverage['/base/style.js'].branchData['670'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['673'] = [];
  _$jscoverage['/base/style.js'].branchData['673'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['674'] = [];
  _$jscoverage['/base/style.js'].branchData['674'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['685'] = [];
  _$jscoverage['/base/style.js'].branchData['685'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['685'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['686'] = [];
  _$jscoverage['/base/style.js'].branchData['686'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['686'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['687'] = [];
  _$jscoverage['/base/style.js'].branchData['687'][1] = new BranchData();
}
_$jscoverage['/base/style.js'].branchData['687'][1].init(52, 46, 'Dom.css(offsetParent, \'position\') === \'static\'');
function visit511_687_1(result) {
  _$jscoverage['/base/style.js'].branchData['687'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['686'][2].init(111, 99, '!ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit510_686_2(result) {
  _$jscoverage['/base/style.js'].branchData['686'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['686'][1].init(95, 115, 'offsetParent && !ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit509_686_1(result) {
  _$jscoverage['/base/style.js'].branchData['686'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['685'][2].init(49, 23, 'el.ownerDocument || doc');
function visit508_685_2(result) {
  _$jscoverage['/base/style.js'].branchData['685'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['685'][1].init(28, 50, 'el.offsetParent || (el.ownerDocument || doc).body');
function visit507_685_1(result) {
  _$jscoverage['/base/style.js'].branchData['685'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['674'][1].init(808, 42, 'parseFloat(Dom.css(el, \'marginLeft\')) || 0');
function visit506_674_1(result) {
  _$jscoverage['/base/style.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['673'][1].init(742, 41, 'parseFloat(Dom.css(el, \'marginTop\')) || 0');
function visit505_673_1(result) {
  _$jscoverage['/base/style.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['670'][1].init(438, 57, 'parseFloat(Dom.css(offsetParent, \'borderLeftWidth\')) || 0');
function visit504_670_1(result) {
  _$jscoverage['/base/style.js'].branchData['670'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['669'][1].init(347, 56, 'parseFloat(Dom.css(offsetParent, \'borderTopWidth\')) || 0');
function visit503_669_1(result) {
  _$jscoverage['/base/style.js'].branchData['669'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['660'][1].init(108, 35, 'Dom.css(el, \'position\') === \'fixed\'');
function visit502_660_1(result) {
  _$jscoverage['/base/style.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['644'][1].init(45, 23, 'extra === PADDING_INDEX');
function visit501_644_1(result) {
  _$jscoverage['/base/style.js'].branchData['644'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['643'][1].init(27, 22, 'extra === BORDER_INDEX');
function visit500_643_1(result) {
  _$jscoverage['/base/style.js'].branchData['643'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['642'][1].init(1597, 27, 'borderBoxValueOrIsBorderBox');
function visit499_642_1(result) {
  _$jscoverage['/base/style.js'].branchData['642'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['636'][1].init(17, 27, 'borderBoxValueOrIsBorderBox');
function visit498_636_1(result) {
  _$jscoverage['/base/style.js'].branchData['636'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['635'][1].init(1319, 23, 'extra === CONTENT_INDEX');
function visit497_635_1(result) {
  _$jscoverage['/base/style.js'].branchData['635'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['634'][1].init(1276, 29, 'borderBoxValue || cssBoxValue');
function visit496_634_1(result) {
  _$jscoverage['/base/style.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['633'][2].init(1213, 28, 'borderBoxValue !== undefined');
function visit495_633_2(result) {
  _$jscoverage['/base/style.js'].branchData['633'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['633'][1].init(1213, 43, 'borderBoxValue !== undefined || isBorderBox');
function visit494_633_1(result) {
  _$jscoverage['/base/style.js'].branchData['633'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['630'][1].init(1074, 19, 'extra === undefined');
function visit493_630_1(result) {
  _$jscoverage['/base/style.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['628'][1].init(408, 28, 'parseFloat(cssBoxValue) || 0');
function visit492_628_1(result) {
  _$jscoverage['/base/style.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['625'][1].init(31, 23, 'elem.style[name] || 0');
function visit491_625_1(result) {
  _$jscoverage['/base/style.js'].branchData['625'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['624'][3].init(228, 24, '(Number(cssBoxValue)) < 0');
function visit490_624_3(result) {
  _$jscoverage['/base/style.js'].branchData['624'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['624'][2].init(204, 19, 'cssBoxValue == null');
function visit489_624_2(result) {
  _$jscoverage['/base/style.js'].branchData['624'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['624'][1].init(204, 48, 'cssBoxValue == null || (Number(cssBoxValue)) < 0');
function visit488_624_1(result) {
  _$jscoverage['/base/style.js'].branchData['624'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['620'][3].init(592, 19, 'borderBoxValue <= 0');
function visit487_620_3(result) {
  _$jscoverage['/base/style.js'].branchData['620'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['620'][2].init(566, 22, 'borderBoxValue == null');
function visit486_620_2(result) {
  _$jscoverage['/base/style.js'].branchData['620'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['620'][1].init(566, 45, 'borderBoxValue == null || borderBoxValue <= 0');
function visit485_620_1(result) {
  _$jscoverage['/base/style.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['616'][1].init(96, 14, 'name === WIDTH');
function visit484_616_1(result) {
  _$jscoverage['/base/style.js'].branchData['616'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['615'][1].init(271, 14, 'name === WIDTH');
function visit483_615_1(result) {
  _$jscoverage['/base/style.js'].branchData['615'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['613'][1].init(20, 14, 'name === WIDTH');
function visit482_613_1(result) {
  _$jscoverage['/base/style.js'].branchData['613'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['612'][1].init(141, 19, 'elem.nodeType === 9');
function visit481_612_1(result) {
  _$jscoverage['/base/style.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['611'][1].init(20, 14, 'name === WIDTH');
function visit480_611_1(result) {
  _$jscoverage['/base/style.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['610'][1].init(13, 16, 'S.isWindow(elem)');
function visit479_610_1(result) {
  _$jscoverage['/base/style.js'].branchData['610'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['594'][1].init(78, 15, 'doc.defaultView');
function visit478_594_1(result) {
  _$jscoverage['/base/style.js'].branchData['594'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['588'][1].init(16, 72, 'Dom._getComputedStyle(elem, \'boxSizing\', computedStyle) === \'border-box\'');
function visit477_588_1(result) {
  _$jscoverage['/base/style.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['580'][1].init(271, 68, 'parseFloat(Dom._getComputedStyle(elem, cssProp, computedStyle)) || 0');
function visit476_580_1(result) {
  _$jscoverage['/base/style.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['575'][1].init(58, 17, 'prop === \'border\'');
function visit475_575_1(result) {
  _$jscoverage['/base/style.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['573'][1].init(29, 16, 'i < which.length');
function visit474_573_1(result) {
  _$jscoverage['/base/style.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['572'][1].init(46, 4, 'prop');
function visit473_572_1(result) {
  _$jscoverage['/base/style.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['570'][1].init(56, 16, 'j < props.length');
function visit472_570_1(result) {
  _$jscoverage['/base/style.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['558'][1].init(124, 22, 'elem.offsetWidth !== 0');
function visit471_558_1(result) {
  _$jscoverage['/base/style.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['549'][1].init(326, 17, 'ret === undefined');
function visit470_549_1(result) {
  _$jscoverage['/base/style.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['545'][1].init(33, 42, '(ret = hook.get(elem, false)) !== undefined');
function visit469_545_1(result) {
  _$jscoverage['/base/style.js'].branchData['545'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['544'][3].init(103, 76, '\'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit468_544_3(result) {
  _$jscoverage['/base/style.js'].branchData['544'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['544'][2].init(95, 84, 'hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit467_544_2(result) {
  _$jscoverage['/base/style.js'].branchData['544'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['544'][1].init(93, 87, '!(hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined)');
function visit466_544_1(result) {
  _$jscoverage['/base/style.js'].branchData['544'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['534'][1].init(137, 9, 'UA.webkit');
function visit465_534_1(result) {
  _$jscoverage['/base/style.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['531'][1].init(857, 16, '!elStyle.cssText');
function visit464_531_1(result) {
  _$jscoverage['/base/style.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['527'][2].init(301, 13, 'val === EMPTY');
function visit463_527_2(result) {
  _$jscoverage['/base/style.js'].branchData['527'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['527'][1].init(301, 40, 'val === EMPTY && elStyle.removeAttribute');
function visit462_527_1(result) {
  _$jscoverage['/base/style.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['518'][1].init(393, 17, 'val !== undefined');
function visit461_518_1(result) {
  _$jscoverage['/base/style.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['515'][1].init(300, 16, 'hook && hook.set');
function visit460_515_1(result) {
  _$jscoverage['/base/style.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['512'][1].init(191, 39, '!isNaN(Number(val)) && !cssNumber[name]');
function visit459_512_1(result) {
  _$jscoverage['/base/style.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['508'][3].init(64, 13, 'val === EMPTY');
function visit458_508_3(result) {
  _$jscoverage['/base/style.js'].branchData['508'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['508'][2].init(48, 12, 'val === null');
function visit457_508_2(result) {
  _$jscoverage['/base/style.js'].branchData['508'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['508'][1].init(48, 29, 'val === null || val === EMPTY');
function visit456_508_1(result) {
  _$jscoverage['/base/style.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['506'][1].init(330, 17, 'val !== undefined');
function visit455_506_1(result) {
  _$jscoverage['/base/style.js'].branchData['506'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['499'][2].init(106, 19, 'elem.nodeType === 8');
function visit454_499_2(result) {
  _$jscoverage['/base/style.js'].branchData['499'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['499'][1].init(34, 46, 'elem.nodeType === 8 || !(elStyle = elem.style)');
function visit453_499_1(result) {
  _$jscoverage['/base/style.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['498'][2].init(69, 19, 'elem.nodeType === 3');
function visit452_498_2(result) {
  _$jscoverage['/base/style.js'].branchData['498'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['498'][1].init(69, 81, 'elem.nodeType === 3 || elem.nodeType === 8 || !(elStyle = elem.style)');
function visit451_498_1(result) {
  _$jscoverage['/base/style.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['466'][1].init(501, 37, 'isAutoPosition || NO_PX_REG.test(val)');
function visit450_466_1(result) {
  _$jscoverage['/base/style.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['462'][2].init(321, 23, 'position === \'relative\'');
function visit449_462_2(result) {
  _$jscoverage['/base/style.js'].branchData['462'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['462'][1].init(303, 41, 'isAutoPosition && position === \'relative\'');
function visit448_462_1(result) {
  _$jscoverage['/base/style.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['461'][1].init(263, 14, 'val === \'auto\'');
function visit447_461_1(result) {
  _$jscoverage['/base/style.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['457'][1].init(81, 21, 'position === \'static\'');
function visit446_457_1(result) {
  _$jscoverage['/base/style.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['455'][1].init(112, 8, 'computed');
function visit445_455_1(result) {
  _$jscoverage['/base/style.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['439'][1].init(46, 8, 'computed');
function visit444_439_1(result) {
  _$jscoverage['/base/style.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['427'][1].init(540, 53, 'elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX)');
function visit443_427_1(result) {
  _$jscoverage['/base/style.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['420'][1].init(163, 11, 'isBorderBox');
function visit442_420_1(result) {
  _$jscoverage['/base/style.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['417'][1].init(21, 4, 'elem');
function visit441_417_1(result) {
  _$jscoverage['/base/style.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['416'][1].init(59, 17, 'val !== undefined');
function visit440_416_1(result) {
  _$jscoverage['/base/style.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['412'][1].init(435, 14, 'name === WIDTH');
function visit439_412_1(result) {
  _$jscoverage['/base/style.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['410'][1].init(60, 79, 'el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX)');
function visit438_410_1(result) {
  _$jscoverage['/base/style.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['405'][1].init(60, 49, 'el && getWHIgnoreDisplay(el, name, PADDING_INDEX)');
function visit437_405_1(result) {
  _$jscoverage['/base/style.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['340'][1].init(33, 36, '!S.inArray(getNodeName(e), excludes)');
function visit436_340_1(result) {
  _$jscoverage['/base/style.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['335'][1].init(224, 5, 'UA.ie');
function visit435_335_1(result) {
  _$jscoverage['/base/style.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['333'][1].init(101, 27, 'userSelectProperty in style');
function visit434_333_1(result) {
  _$jscoverage['/base/style.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['330'][1].init(434, 6, 'j >= 0');
function visit433_330_1(result) {
  _$jscoverage['/base/style.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['327'][1].init(250, 32, 'userSelectProperty === undefined');
function visit432_327_1(result) {
  _$jscoverage['/base/style.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['307'][1].init(746, 15, 'elem.styleSheet');
function visit431_307_1(result) {
  _$jscoverage['/base/style.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['298'][1].init(489, 4, 'elem');
function visit430_298_1(result) {
  _$jscoverage['/base/style.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['293'][1].init(329, 35, 'id && (id = id.replace(\'#\', EMPTY))');
function visit429_293_1(result) {
  _$jscoverage['/base/style.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['283'][1].init(21, 26, 'typeof refWin === \'string\'');
function visit428_283_1(result) {
  _$jscoverage['/base/style.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['266'][1].init(60, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit427_266_1(result) {
  _$jscoverage['/base/style.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['264'][1].init(118, 6, 'i >= 0');
function visit426_264_1(result) {
  _$jscoverage['/base/style.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['249'][1].init(29, 3, 'old');
function visit425_249_1(result) {
  _$jscoverage['/base/style.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['248'][1].init(150, 12, 'old !== NONE');
function visit424_248_1(result) {
  _$jscoverage['/base/style.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['244'][1].init(118, 6, 'i >= 0');
function visit423_244_1(result) {
  _$jscoverage['/base/style.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['228'][1].init(201, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit422_228_1(result) {
  _$jscoverage['/base/style.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['226'][1].init(78, 36, 'Dom.data(elem, OLD_DISPLAY) || EMPTY');
function visit421_226_1(result) {
  _$jscoverage['/base/style.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['224'][1].init(172, 6, 'i >= 0');
function visit420_224_1(result) {
  _$jscoverage['/base/style.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['208'][1].init(46, 6, 'i >= 0');
function visit419_208_1(result) {
  _$jscoverage['/base/style.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['204'][1].init(482, 26, 'typeof ret === \'undefined\'');
function visit418_204_1(result) {
  _$jscoverage['/base/style.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['199'][1].init(45, 41, '(ret = hook.get(elem, true)) !== undefined');
function visit417_199_1(result) {
  _$jscoverage['/base/style.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['198'][3].init(123, 87, '\'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit416_198_3(result) {
  _$jscoverage['/base/style.js'].branchData['198'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['198'][2].init(115, 95, 'hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit415_198_2(result) {
  _$jscoverage['/base/style.js'].branchData['198'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['198'][1].init(113, 98, '!(hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined)');
function visit414_198_1(result) {
  _$jscoverage['/base/style.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['196'][1].init(114, 4, 'elem');
function visit413_196_1(result) {
  _$jscoverage['/base/style.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['193'][1].init(645, 17, 'val === undefined');
function visit412_193_1(result) {
  _$jscoverage['/base/style.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['183'][1].init(50, 6, 'i >= 0');
function visit411_183_1(result) {
  _$jscoverage['/base/style.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['181'][1].init(233, 21, 'S.isPlainObject(name)');
function visit410_181_1(result) {
  _$jscoverage['/base/style.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['157'][1].init(46, 6, 'i >= 0');
function visit409_157_1(result) {
  _$jscoverage['/base/style.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['152'][1].init(55, 4, 'elem');
function visit408_152_1(result) {
  _$jscoverage['/base/style.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['150'][1].init(493, 17, 'val === undefined');
function visit407_150_1(result) {
  _$jscoverage['/base/style.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['144'][1].init(50, 6, 'i >= 0');
function visit406_144_1(result) {
  _$jscoverage['/base/style.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['142'][1].init(187, 21, 'S.isPlainObject(name)');
function visit405_142_1(result) {
  _$jscoverage['/base/style.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['110'][1].init(758, 51, 'Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)');
function visit404_110_1(result) {
  _$jscoverage['/base/style.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['105'][2].init(575, 10, 'val === \'\'');
function visit403_105_2(result) {
  _$jscoverage['/base/style.js'].branchData['105'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['105'][1].init(575, 36, 'val === \'\' && !Dom.contains(d, elem)');
function visit402_105_1(result) {
  _$jscoverage['/base/style.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['101'][1].init(27, 59, 'computedStyle.getPropertyValue(name) || computedStyle[name]');
function visit401_101_1(result) {
  _$jscoverage['/base/style.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['100'][1].init(344, 59, 'computedStyle || d.defaultView.getComputedStyle(elem, null)');
function visit400_100_1(result) {
  _$jscoverage['/base/style.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['64'][1].init(20, 31, 'doc.body || doc.documentElement');
function visit399_64_1(result) {
  _$jscoverage['/base/style.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['63'][1].init(101, 26, '!defaultDisplay[tagName]');
function visit398_63_1(result) {
  _$jscoverage['/base/style.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['47'][1].init(16, 55, 'cssProps[name] || S.Features.getVendorCssPropName(name)');
function visit397_47_1(result) {
  _$jscoverage['/base/style.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['17'][1].init(260, 27, 'globalWindow.document || {}');
function visit396_17_1(result) {
  _$jscoverage['/base/style.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/style.js'].functionData[0]++;
  _$jscoverage['/base/style.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/style.js'].lineData[8]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/base/style.js'].lineData[9]++;
  var globalWindow = S.Env.host, UA = S.UA, BOX_MODELS = ['margin', 'border', 'padding'], CONTENT_INDEX = -1, PADDING_INDEX = 2, BORDER_INDEX = 1, MARGIN_INDEX = 0, getNodeName = Dom.nodeName, doc = visit396_17_1(globalWindow.document || {}), RE_MARGIN = /^margin/, WIDTH = 'width', HEIGHT = 'height', DISPLAY = 'display', OLD_DISPLAY = DISPLAY + S.now(), NONE = 'none', cssNumber = {
  'fillOpacity': 1, 
  'fontWeight': 1, 
  'lineHeight': 1, 
  'opacity': 1, 
  'orphans': 1, 
  'widows': 1, 
  'zIndex': 1, 
  'zoom': 1}, rmsPrefix = /^-ms-/, EMPTY = '', DEFAULT_UNIT = 'px', NO_PX_REG = /\d(?!px)[a-z%]+$/i, cssHooks = {}, cssProps = {
  'float': 'cssFloat'}, userSelectProperty, defaultDisplay = {}, RE_DASH = /-([a-z])/ig;
  _$jscoverage['/base/style.js'].lineData[46]++;
  function normalizeCssPropName(name) {
    _$jscoverage['/base/style.js'].functionData[1]++;
    _$jscoverage['/base/style.js'].lineData[47]++;
    return visit397_47_1(cssProps[name] || S.Features.getVendorCssPropName(name));
  }
  _$jscoverage['/base/style.js'].lineData[50]++;
  function upperCase() {
    _$jscoverage['/base/style.js'].functionData[2]++;
    _$jscoverage['/base/style.js'].lineData[51]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/base/style.js'].lineData[54]++;
  function camelCase(name) {
    _$jscoverage['/base/style.js'].functionData[3]++;
    _$jscoverage['/base/style.js'].lineData[56]++;
    return name.replace(rmsPrefix, 'ms-').replace(RE_DASH, upperCase);
  }
  _$jscoverage['/base/style.js'].lineData[59]++;
  function getDefaultDisplay(tagName) {
    _$jscoverage['/base/style.js'].functionData[4]++;
    _$jscoverage['/base/style.js'].lineData[60]++;
    var body, oldDisplay = defaultDisplay[tagName], elem;
    _$jscoverage['/base/style.js'].lineData[63]++;
    if (visit398_63_1(!defaultDisplay[tagName])) {
      _$jscoverage['/base/style.js'].lineData[64]++;
      body = visit399_64_1(doc.body || doc.documentElement);
      _$jscoverage['/base/style.js'].lineData[65]++;
      elem = doc.createElement(tagName);
      _$jscoverage['/base/style.js'].lineData[67]++;
      Dom.prepend(elem, body);
      _$jscoverage['/base/style.js'].lineData[68]++;
      oldDisplay = Dom.css(elem, 'display');
      _$jscoverage['/base/style.js'].lineData[69]++;
      body.removeChild(elem);
      _$jscoverage['/base/style.js'].lineData[71]++;
      defaultDisplay[tagName] = oldDisplay;
    }
    _$jscoverage['/base/style.js'].lineData[73]++;
    return oldDisplay;
  }
  _$jscoverage['/base/style.js'].lineData[76]++;
  S.mix(Dom, {
  _camelCase: camelCase, 
  _cssHooks: cssHooks, 
  _cssProps: cssProps, 
  _getComputedStyle: function(elem, name, computedStyle) {
  _$jscoverage['/base/style.js'].functionData[5]++;
  _$jscoverage['/base/style.js'].lineData[90]++;
  var val = '', width, minWidth, maxWidth, style, d = elem.ownerDocument;
  _$jscoverage['/base/style.js'].lineData[97]++;
  name = normalizeCssPropName(name);
  _$jscoverage['/base/style.js'].lineData[100]++;
  if ((computedStyle = (visit400_100_1(computedStyle || d.defaultView.getComputedStyle(elem, null))))) {
    _$jscoverage['/base/style.js'].lineData[101]++;
    val = visit401_101_1(computedStyle.getPropertyValue(name) || computedStyle[name]);
  }
  _$jscoverage['/base/style.js'].lineData[105]++;
  if (visit402_105_1(visit403_105_2(val === '') && !Dom.contains(d, elem))) {
    _$jscoverage['/base/style.js'].lineData[106]++;
    val = elem.style[name];
  }
  _$jscoverage['/base/style.js'].lineData[110]++;
  if (visit404_110_1(Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name))) {
    _$jscoverage['/base/style.js'].lineData[111]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[112]++;
    width = style.width;
    _$jscoverage['/base/style.js'].lineData[113]++;
    minWidth = style.minWidth;
    _$jscoverage['/base/style.js'].lineData[114]++;
    maxWidth = style.maxWidth;
    _$jscoverage['/base/style.js'].lineData[116]++;
    style.minWidth = style.maxWidth = style.width = val;
    _$jscoverage['/base/style.js'].lineData[117]++;
    val = computedStyle.width;
    _$jscoverage['/base/style.js'].lineData[119]++;
    style.width = width;
    _$jscoverage['/base/style.js'].lineData[120]++;
    style.minWidth = minWidth;
    _$jscoverage['/base/style.js'].lineData[121]++;
    style.maxWidth = maxWidth;
  }
  _$jscoverage['/base/style.js'].lineData[124]++;
  return val;
}, 
  style: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[6]++;
  _$jscoverage['/base/style.js'].lineData[137]++;
  var els = Dom.query(selector), k, ret, elem = els[0], i;
  _$jscoverage['/base/style.js'].lineData[142]++;
  if (visit405_142_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[143]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[144]++;
      for (i = els.length - 1; visit406_144_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[145]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[148]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[150]++;
  if (visit407_150_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[151]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[152]++;
    if (visit408_152_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[153]++;
      ret = style(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[155]++;
    return ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[157]++;
    for (i = els.length - 1; visit409_157_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[158]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[161]++;
  return undefined;
}, 
  css: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[7]++;
  _$jscoverage['/base/style.js'].lineData[174]++;
  var els = Dom.query(selector), elem = els[0], k, hook, ret, i;
  _$jscoverage['/base/style.js'].lineData[181]++;
  if (visit410_181_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[182]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[183]++;
      for (i = els.length - 1; visit411_183_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[184]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[187]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[190]++;
  name = camelCase(name);
  _$jscoverage['/base/style.js'].lineData[191]++;
  hook = cssHooks[name];
  _$jscoverage['/base/style.js'].lineData[193]++;
  if (visit412_193_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[195]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[196]++;
    if (visit413_196_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[198]++;
      if (visit414_198_1(!(visit415_198_2(hook && visit416_198_3('get' in hook && visit417_199_1((ret = hook.get(elem, true)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[201]++;
        ret = Dom._getComputedStyle(elem, name);
      }
    }
    _$jscoverage['/base/style.js'].lineData[204]++;
    return (visit418_204_1(typeof ret === 'undefined')) ? '' : ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[208]++;
    for (i = els.length - 1; visit419_208_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[209]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[212]++;
  return undefined;
}, 
  show: function(selector) {
  _$jscoverage['/base/style.js'].functionData[8]++;
  _$jscoverage['/base/style.js'].lineData[220]++;
  var els = Dom.query(selector), tagName, old, elem, i;
  _$jscoverage['/base/style.js'].lineData[224]++;
  for (i = els.length - 1; visit420_224_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[225]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[226]++;
    elem.style[DISPLAY] = visit421_226_1(Dom.data(elem, OLD_DISPLAY) || EMPTY);
    _$jscoverage['/base/style.js'].lineData[228]++;
    if (visit422_228_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[229]++;
      tagName = elem.tagName.toLowerCase();
      _$jscoverage['/base/style.js'].lineData[230]++;
      old = getDefaultDisplay(tagName);
      _$jscoverage['/base/style.js'].lineData[231]++;
      Dom.data(elem, OLD_DISPLAY, old);
      _$jscoverage['/base/style.js'].lineData[232]++;
      elem.style[DISPLAY] = old;
    }
  }
}, 
  hide: function(selector) {
  _$jscoverage['/base/style.js'].functionData[9]++;
  _$jscoverage['/base/style.js'].lineData[242]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[244]++;
  for (i = els.length - 1; visit423_244_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[245]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[246]++;
    var style = elem.style, old = style[DISPLAY];
    _$jscoverage['/base/style.js'].lineData[248]++;
    if (visit424_248_1(old !== NONE)) {
      _$jscoverage['/base/style.js'].lineData[249]++;
      if (visit425_249_1(old)) {
        _$jscoverage['/base/style.js'].lineData[250]++;
        Dom.data(elem, OLD_DISPLAY, old);
      }
      _$jscoverage['/base/style.js'].lineData[252]++;
      style[DISPLAY] = NONE;
    }
  }
}, 
  toggle: function(selector) {
  _$jscoverage['/base/style.js'].functionData[10]++;
  _$jscoverage['/base/style.js'].lineData[262]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[264]++;
  for (i = els.length - 1; visit426_264_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[265]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[266]++;
    if (visit427_266_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[267]++;
      Dom.show(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[269]++;
      Dom.hide(elem);
    }
  }
}, 
  addStyleSheet: function(refWin, cssText, id) {
  _$jscoverage['/base/style.js'].functionData[11]++;
  _$jscoverage['/base/style.js'].lineData[283]++;
  if (visit428_283_1(typeof refWin === 'string')) {
    _$jscoverage['/base/style.js'].lineData[284]++;
    id = cssText;
    _$jscoverage['/base/style.js'].lineData[285]++;
    cssText = refWin;
    _$jscoverage['/base/style.js'].lineData[287]++;
    refWin = globalWindow;
  }
  _$jscoverage['/base/style.js'].lineData[290]++;
  var doc = Dom.getDocument(refWin), elem;
  _$jscoverage['/base/style.js'].lineData[293]++;
  if (visit429_293_1(id && (id = id.replace('#', EMPTY)))) {
    _$jscoverage['/base/style.js'].lineData[294]++;
    elem = Dom.get('#' + id, doc);
  }
  _$jscoverage['/base/style.js'].lineData[298]++;
  if (visit430_298_1(elem)) {
    _$jscoverage['/base/style.js'].lineData[299]++;
    return;
  }
  _$jscoverage['/base/style.js'].lineData[302]++;
  elem = Dom.create('<style>', {
  id: id}, doc);
  _$jscoverage['/base/style.js'].lineData[305]++;
  Dom.get('head', doc).appendChild(elem);
  _$jscoverage['/base/style.js'].lineData[307]++;
  if (visit431_307_1(elem.styleSheet)) {
    _$jscoverage['/base/style.js'].lineData[308]++;
    elem.styleSheet.cssText = cssText;
  } else {
    _$jscoverage['/base/style.js'].lineData[310]++;
    elem.appendChild(doc.createTextNode(cssText));
  }
}, 
  unselectable: function(selector) {
  _$jscoverage['/base/style.js'].functionData[12]++;
  _$jscoverage['/base/style.js'].lineData[319]++;
  var _els = Dom.query(selector), elem, j, e, i = 0, excludes, style, els;
  _$jscoverage['/base/style.js'].lineData[327]++;
  if (visit432_327_1(userSelectProperty === undefined)) {
    _$jscoverage['/base/style.js'].lineData[328]++;
    userSelectProperty = S.Features.getVendorCssPropName('userSelect');
  }
  _$jscoverage['/base/style.js'].lineData[330]++;
  for (j = _els.length - 1; visit433_330_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[331]++;
    elem = _els[j];
    _$jscoverage['/base/style.js'].lineData[332]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[333]++;
    if (visit434_333_1(userSelectProperty in style)) {
      _$jscoverage['/base/style.js'].lineData[334]++;
      style[userSelectProperty] = 'none';
    } else {
      _$jscoverage['/base/style.js'].lineData[335]++;
      if (visit435_335_1(UA.ie)) {
        _$jscoverage['/base/style.js'].lineData[336]++;
        els = elem.getElementsByTagName('*');
        _$jscoverage['/base/style.js'].lineData[337]++;
        elem.setAttribute('unselectable', 'on');
        _$jscoverage['/base/style.js'].lineData[338]++;
        excludes = ['iframe', 'textarea', 'input', 'select'];
        _$jscoverage['/base/style.js'].lineData[339]++;
        while ((e = els[i++])) {
          _$jscoverage['/base/style.js'].lineData[340]++;
          if (visit436_340_1(!S.inArray(getNodeName(e), excludes))) {
            _$jscoverage['/base/style.js'].lineData[341]++;
            e.setAttribute('unselectable', 'on');
          }
        }
      }
    }
  }
}, 
  innerWidth: 0, 
  innerHeight: 0, 
  outerWidth: 0, 
  outerHeight: 0, 
  width: 0, 
  height: 0});
  _$jscoverage['/base/style.js'].lineData[402]++;
  S.each([WIDTH, HEIGHT], function(name) {
  _$jscoverage['/base/style.js'].functionData[13]++;
  _$jscoverage['/base/style.js'].lineData[403]++;
  Dom['inner' + S.ucfirst(name)] = function(selector) {
  _$jscoverage['/base/style.js'].functionData[14]++;
  _$jscoverage['/base/style.js'].lineData[404]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[405]++;
  return visit437_405_1(el && getWHIgnoreDisplay(el, name, PADDING_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[408]++;
  Dom['outer' + S.ucfirst(name)] = function(selector, includeMargin) {
  _$jscoverage['/base/style.js'].functionData[15]++;
  _$jscoverage['/base/style.js'].lineData[409]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[410]++;
  return visit438_410_1(el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[412]++;
  var which = visit439_412_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'];
  _$jscoverage['/base/style.js'].lineData[414]++;
  Dom[name] = function(selector, val) {
  _$jscoverage['/base/style.js'].functionData[16]++;
  _$jscoverage['/base/style.js'].lineData[415]++;
  var elem = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[416]++;
  if (visit440_416_1(val !== undefined)) {
    _$jscoverage['/base/style.js'].lineData[417]++;
    if (visit441_417_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[418]++;
      var computedStyle = getComputedStyle(elem);
      _$jscoverage['/base/style.js'].lineData[419]++;
      var isBorderBox = isBorderBoxFn(elem, computedStyle);
      _$jscoverage['/base/style.js'].lineData[420]++;
      if (visit442_420_1(isBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[421]++;
        val += getPBMWidth(elem, ['padding', 'border'], which, computedStyle);
      }
      _$jscoverage['/base/style.js'].lineData[423]++;
      return Dom.css(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[425]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[427]++;
  return visit443_427_1(elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[433]++;
  cssHooks[name] = {
  get: function(elem, computed) {
  _$jscoverage['/base/style.js'].functionData[17]++;
  _$jscoverage['/base/style.js'].lineData[438]++;
  var val;
  _$jscoverage['/base/style.js'].lineData[439]++;
  if (visit444_439_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[440]++;
    val = getWHIgnoreDisplay(elem, name) + 'px';
  }
  _$jscoverage['/base/style.js'].lineData[442]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[447]++;
  var cssShow = {
  position: 'absolute', 
  visibility: 'hidden', 
  display: 'block'};
  _$jscoverage['/base/style.js'].lineData[449]++;
  S.each(['left', 'top'], function(name) {
  _$jscoverage['/base/style.js'].functionData[18]++;
  _$jscoverage['/base/style.js'].lineData[450]++;
  cssHooks[name] = {
  get: function(el, computed) {
  _$jscoverage['/base/style.js'].functionData[19]++;
  _$jscoverage['/base/style.js'].lineData[452]++;
  var val, isAutoPosition, position;
  _$jscoverage['/base/style.js'].lineData[455]++;
  if (visit445_455_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[456]++;
    position = Dom.css(el, 'position');
    _$jscoverage['/base/style.js'].lineData[457]++;
    if (visit446_457_1(position === 'static')) {
      _$jscoverage['/base/style.js'].lineData[458]++;
      return 'auto';
    }
    _$jscoverage['/base/style.js'].lineData[460]++;
    val = Dom._getComputedStyle(el, name);
    _$jscoverage['/base/style.js'].lineData[461]++;
    isAutoPosition = visit447_461_1(val === 'auto');
    _$jscoverage['/base/style.js'].lineData[462]++;
    if (visit448_462_1(isAutoPosition && visit449_462_2(position === 'relative'))) {
      _$jscoverage['/base/style.js'].lineData[463]++;
      return '0px';
    }
    _$jscoverage['/base/style.js'].lineData[466]++;
    if (visit450_466_1(isAutoPosition || NO_PX_REG.test(val))) {
      _$jscoverage['/base/style.js'].lineData[467]++;
      val = getPosition(el)[name] + 'px';
    }
  }
  _$jscoverage['/base/style.js'].lineData[470]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[475]++;
  function swap(elem, options, callback) {
    _$jscoverage['/base/style.js'].functionData[20]++;
    _$jscoverage['/base/style.js'].lineData[476]++;
    var old = {}, style = elem.style, name;
    _$jscoverage['/base/style.js'].lineData[481]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[482]++;
      old[name] = style[name];
      _$jscoverage['/base/style.js'].lineData[483]++;
      style[name] = options[name];
    }
    _$jscoverage['/base/style.js'].lineData[486]++;
    callback.call(elem);
    _$jscoverage['/base/style.js'].lineData[489]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[490]++;
      style[name] = old[name];
    }
  }
  _$jscoverage['/base/style.js'].lineData[494]++;
  function style(elem, name, val) {
    _$jscoverage['/base/style.js'].functionData[21]++;
    _$jscoverage['/base/style.js'].lineData[495]++;
    var elStyle, ret, hook;
    _$jscoverage['/base/style.js'].lineData[498]++;
    if (visit451_498_1(visit452_498_2(elem.nodeType === 3) || visit453_499_1(visit454_499_2(elem.nodeType === 8) || !(elStyle = elem.style)))) {
      _$jscoverage['/base/style.js'].lineData[500]++;
      return undefined;
    }
    _$jscoverage['/base/style.js'].lineData[502]++;
    name = camelCase(name);
    _$jscoverage['/base/style.js'].lineData[503]++;
    hook = cssHooks[name];
    _$jscoverage['/base/style.js'].lineData[504]++;
    name = normalizeCssPropName(name);
    _$jscoverage['/base/style.js'].lineData[506]++;
    if (visit455_506_1(val !== undefined)) {
      _$jscoverage['/base/style.js'].lineData[508]++;
      if (visit456_508_1(visit457_508_2(val === null) || visit458_508_3(val === EMPTY))) {
        _$jscoverage['/base/style.js'].lineData[509]++;
        val = EMPTY;
      } else {
        _$jscoverage['/base/style.js'].lineData[512]++;
        if (visit459_512_1(!isNaN(Number(val)) && !cssNumber[name])) {
          _$jscoverage['/base/style.js'].lineData[513]++;
          val += DEFAULT_UNIT;
        }
      }
      _$jscoverage['/base/style.js'].lineData[515]++;
      if (visit460_515_1(hook && hook.set)) {
        _$jscoverage['/base/style.js'].lineData[516]++;
        val = hook.set(elem, val);
      }
      _$jscoverage['/base/style.js'].lineData[518]++;
      if (visit461_518_1(val !== undefined)) {
        _$jscoverage['/base/style.js'].lineData[520]++;
        try {
          _$jscoverage['/base/style.js'].lineData[522]++;
          elStyle[name] = val;
        }        catch (e) {
  _$jscoverage['/base/style.js'].lineData[524]++;
  logger.warn('css set error:' + e);
}
        _$jscoverage['/base/style.js'].lineData[527]++;
        if (visit462_527_1(visit463_527_2(val === EMPTY) && elStyle.removeAttribute)) {
          _$jscoverage['/base/style.js'].lineData[528]++;
          elStyle.removeAttribute(name);
        }
      }
      _$jscoverage['/base/style.js'].lineData[531]++;
      if (visit464_531_1(!elStyle.cssText)) {
        _$jscoverage['/base/style.js'].lineData[534]++;
        if (visit465_534_1(UA.webkit)) {
          _$jscoverage['/base/style.js'].lineData[535]++;
          elStyle = elem.outerHTML;
        }
        _$jscoverage['/base/style.js'].lineData[537]++;
        elem.removeAttribute('style');
      }
      _$jscoverage['/base/style.js'].lineData[539]++;
      return undefined;
    } else {
      _$jscoverage['/base/style.js'].lineData[544]++;
      if (visit466_544_1(!(visit467_544_2(hook && visit468_544_3('get' in hook && visit469_545_1((ret = hook.get(elem, false)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[547]++;
        ret = elStyle[name];
      }
      _$jscoverage['/base/style.js'].lineData[549]++;
      return visit470_549_1(ret === undefined) ? '' : ret;
    }
  }
  _$jscoverage['/base/style.js'].lineData[554]++;
  function getWHIgnoreDisplay(elem) {
    _$jscoverage['/base/style.js'].functionData[22]++;
    _$jscoverage['/base/style.js'].lineData[555]++;
    var val, args = arguments;
    _$jscoverage['/base/style.js'].lineData[558]++;
    if (visit471_558_1(elem.offsetWidth !== 0)) {
      _$jscoverage['/base/style.js'].lineData[559]++;
      val = getWH.apply(undefined, args);
    } else {
      _$jscoverage['/base/style.js'].lineData[561]++;
      swap(elem, cssShow, function() {
  _$jscoverage['/base/style.js'].functionData[23]++;
  _$jscoverage['/base/style.js'].lineData[562]++;
  val = getWH.apply(undefined, args);
});
    }
    _$jscoverage['/base/style.js'].lineData[565]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[568]++;
  function getPBMWidth(elem, props, which, computedStyle) {
    _$jscoverage['/base/style.js'].functionData[24]++;
    _$jscoverage['/base/style.js'].lineData[569]++;
    var value = 0, prop, j, i;
    _$jscoverage['/base/style.js'].lineData[570]++;
    for (j = 0; visit472_570_1(j < props.length); j++) {
      _$jscoverage['/base/style.js'].lineData[571]++;
      prop = props[j];
      _$jscoverage['/base/style.js'].lineData[572]++;
      if (visit473_572_1(prop)) {
        _$jscoverage['/base/style.js'].lineData[573]++;
        for (i = 0; visit474_573_1(i < which.length); i++) {
          _$jscoverage['/base/style.js'].lineData[574]++;
          var cssProp;
          _$jscoverage['/base/style.js'].lineData[575]++;
          if (visit475_575_1(prop === 'border')) {
            _$jscoverage['/base/style.js'].lineData[576]++;
            cssProp = prop + which[i] + 'Width';
          } else {
            _$jscoverage['/base/style.js'].lineData[578]++;
            cssProp = prop + which[i];
          }
          _$jscoverage['/base/style.js'].lineData[580]++;
          value += visit476_580_1(parseFloat(Dom._getComputedStyle(elem, cssProp, computedStyle)) || 0);
        }
      }
    }
    _$jscoverage['/base/style.js'].lineData[584]++;
    return value;
  }
  _$jscoverage['/base/style.js'].lineData[587]++;
  function isBorderBoxFn(elem, computedStyle) {
    _$jscoverage['/base/style.js'].functionData[25]++;
    _$jscoverage['/base/style.js'].lineData[588]++;
    return visit477_588_1(Dom._getComputedStyle(elem, 'boxSizing', computedStyle) === 'border-box');
  }
  _$jscoverage['/base/style.js'].lineData[591]++;
  function getComputedStyle(elem) {
    _$jscoverage['/base/style.js'].functionData[26]++;
    _$jscoverage['/base/style.js'].lineData[592]++;
    var doc = elem.ownerDocument, computedStyle;
    _$jscoverage['/base/style.js'].lineData[594]++;
    if (visit478_594_1(doc.defaultView)) {
      _$jscoverage['/base/style.js'].lineData[596]++;
      computedStyle = doc.defaultView.getComputedStyle(elem, null);
    }
    _$jscoverage['/base/style.js'].lineData[598]++;
    return computedStyle;
  }
  _$jscoverage['/base/style.js'].lineData[609]++;
  function getWH(elem, name, extra) {
    _$jscoverage['/base/style.js'].functionData[27]++;
    _$jscoverage['/base/style.js'].lineData[610]++;
    if (visit479_610_1(S.isWindow(elem))) {
      _$jscoverage['/base/style.js'].lineData[611]++;
      return visit480_611_1(name === WIDTH) ? Dom.viewportWidth(elem) : Dom.viewportHeight(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[612]++;
      if (visit481_612_1(elem.nodeType === 9)) {
        _$jscoverage['/base/style.js'].lineData[613]++;
        return visit482_613_1(name === WIDTH) ? Dom.docWidth(elem) : Dom.docHeight(elem);
      }
    }
    _$jscoverage['/base/style.js'].lineData[615]++;
    var which = visit483_615_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'], borderBoxValue = visit484_616_1(name === WIDTH) ? elem.offsetWidth : elem.offsetHeight;
    _$jscoverage['/base/style.js'].lineData[617]++;
    var computedStyle = getComputedStyle(elem);
    _$jscoverage['/base/style.js'].lineData[618]++;
    var isBorderBox = isBorderBoxFn(elem, computedStyle);
    _$jscoverage['/base/style.js'].lineData[619]++;
    var cssBoxValue = 0;
    _$jscoverage['/base/style.js'].lineData[620]++;
    if (visit485_620_1(visit486_620_2(borderBoxValue == null) || visit487_620_3(borderBoxValue <= 0))) {
      _$jscoverage['/base/style.js'].lineData[621]++;
      borderBoxValue = undefined;
      _$jscoverage['/base/style.js'].lineData[623]++;
      cssBoxValue = Dom._getComputedStyle(elem, name, computedStyle);
      _$jscoverage['/base/style.js'].lineData[624]++;
      if (visit488_624_1(visit489_624_2(cssBoxValue == null) || visit490_624_3((Number(cssBoxValue)) < 0))) {
        _$jscoverage['/base/style.js'].lineData[625]++;
        cssBoxValue = visit491_625_1(elem.style[name] || 0);
      }
      _$jscoverage['/base/style.js'].lineData[628]++;
      cssBoxValue = visit492_628_1(parseFloat(cssBoxValue) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[630]++;
    if (visit493_630_1(extra === undefined)) {
      _$jscoverage['/base/style.js'].lineData[631]++;
      extra = isBorderBox ? BORDER_INDEX : CONTENT_INDEX;
    }
    _$jscoverage['/base/style.js'].lineData[633]++;
    var borderBoxValueOrIsBorderBox = visit494_633_1(visit495_633_2(borderBoxValue !== undefined) || isBorderBox);
    _$jscoverage['/base/style.js'].lineData[634]++;
    var val = visit496_634_1(borderBoxValue || cssBoxValue);
    _$jscoverage['/base/style.js'].lineData[635]++;
    if (visit497_635_1(extra === CONTENT_INDEX)) {
      _$jscoverage['/base/style.js'].lineData[636]++;
      if (visit498_636_1(borderBoxValueOrIsBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[637]++;
        return val - getPBMWidth(elem, ['border', 'padding'], which, computedStyle);
      } else {
        _$jscoverage['/base/style.js'].lineData[640]++;
        return cssBoxValue;
      }
    } else {
      _$jscoverage['/base/style.js'].lineData[642]++;
      if (visit499_642_1(borderBoxValueOrIsBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[643]++;
        return val + (visit500_643_1(extra === BORDER_INDEX) ? 0 : (visit501_644_1(extra === PADDING_INDEX) ? -getPBMWidth(elem, ['border'], which, computedStyle) : getPBMWidth(elem, ['margin'], which, computedStyle)));
      } else {
        _$jscoverage['/base/style.js'].lineData[648]++;
        return cssBoxValue + getPBMWidth(elem, BOX_MODELS.slice(extra), which, computedStyle);
      }
    }
  }
  _$jscoverage['/base/style.js'].lineData[653]++;
  var ROOT_REG = /^(?:body|html)$/i;
  _$jscoverage['/base/style.js'].lineData[655]++;
  function getPosition(el) {
    _$jscoverage['/base/style.js'].functionData[28]++;
    _$jscoverage['/base/style.js'].lineData[656]++;
    var offsetParent, offset, parentOffset = {
  top: 0, 
  left: 0};
    _$jscoverage['/base/style.js'].lineData[660]++;
    if (visit502_660_1(Dom.css(el, 'position') === 'fixed')) {
      _$jscoverage['/base/style.js'].lineData[661]++;
      offset = el.getBoundingClientRect();
    } else {
      _$jscoverage['/base/style.js'].lineData[666]++;
      offsetParent = getOffsetParent(el);
      _$jscoverage['/base/style.js'].lineData[667]++;
      offset = Dom.offset(el);
      _$jscoverage['/base/style.js'].lineData[668]++;
      parentOffset = Dom.offset(offsetParent);
      _$jscoverage['/base/style.js'].lineData[669]++;
      parentOffset.top += visit503_669_1(parseFloat(Dom.css(offsetParent, 'borderTopWidth')) || 0);
      _$jscoverage['/base/style.js'].lineData[670]++;
      parentOffset.left += visit504_670_1(parseFloat(Dom.css(offsetParent, 'borderLeftWidth')) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[673]++;
    offset.top -= visit505_673_1(parseFloat(Dom.css(el, 'marginTop')) || 0);
    _$jscoverage['/base/style.js'].lineData[674]++;
    offset.left -= visit506_674_1(parseFloat(Dom.css(el, 'marginLeft')) || 0);
    _$jscoverage['/base/style.js'].lineData[678]++;
    return {
  top: offset.top - parentOffset.top, 
  left: offset.left - parentOffset.left};
  }
  _$jscoverage['/base/style.js'].lineData[684]++;
  function getOffsetParent(el) {
    _$jscoverage['/base/style.js'].functionData[29]++;
    _$jscoverage['/base/style.js'].lineData[685]++;
    var offsetParent = visit507_685_1(el.offsetParent || (visit508_685_2(el.ownerDocument || doc)).body);
    _$jscoverage['/base/style.js'].lineData[686]++;
    while (visit509_686_1(offsetParent && visit510_686_2(!ROOT_REG.test(offsetParent.nodeName) && visit511_687_1(Dom.css(offsetParent, 'position') === 'static')))) {
      _$jscoverage['/base/style.js'].lineData[688]++;
      offsetParent = offsetParent.offsetParent;
    }
    _$jscoverage['/base/style.js'].lineData[690]++;
    return offsetParent;
  }
  _$jscoverage['/base/style.js'].lineData[693]++;
  return Dom;
});
