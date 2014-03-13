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
  _$jscoverage['/base/style.js'].lineData[45] = 0;
  _$jscoverage['/base/style.js'].lineData[47] = 0;
  _$jscoverage['/base/style.js'].lineData[48] = 0;
  _$jscoverage['/base/style.js'].lineData[51] = 0;
  _$jscoverage['/base/style.js'].lineData[52] = 0;
  _$jscoverage['/base/style.js'].lineData[55] = 0;
  _$jscoverage['/base/style.js'].lineData[57] = 0;
  _$jscoverage['/base/style.js'].lineData[60] = 0;
  _$jscoverage['/base/style.js'].lineData[61] = 0;
  _$jscoverage['/base/style.js'].lineData[64] = 0;
  _$jscoverage['/base/style.js'].lineData[65] = 0;
  _$jscoverage['/base/style.js'].lineData[66] = 0;
  _$jscoverage['/base/style.js'].lineData[68] = 0;
  _$jscoverage['/base/style.js'].lineData[69] = 0;
  _$jscoverage['/base/style.js'].lineData[70] = 0;
  _$jscoverage['/base/style.js'].lineData[72] = 0;
  _$jscoverage['/base/style.js'].lineData[74] = 0;
  _$jscoverage['/base/style.js'].lineData[77] = 0;
  _$jscoverage['/base/style.js'].lineData[91] = 0;
  _$jscoverage['/base/style.js'].lineData[98] = 0;
  _$jscoverage['/base/style.js'].lineData[101] = 0;
  _$jscoverage['/base/style.js'].lineData[102] = 0;
  _$jscoverage['/base/style.js'].lineData[106] = 0;
  _$jscoverage['/base/style.js'].lineData[107] = 0;
  _$jscoverage['/base/style.js'].lineData[111] = 0;
  _$jscoverage['/base/style.js'].lineData[112] = 0;
  _$jscoverage['/base/style.js'].lineData[113] = 0;
  _$jscoverage['/base/style.js'].lineData[114] = 0;
  _$jscoverage['/base/style.js'].lineData[115] = 0;
  _$jscoverage['/base/style.js'].lineData[117] = 0;
  _$jscoverage['/base/style.js'].lineData[118] = 0;
  _$jscoverage['/base/style.js'].lineData[120] = 0;
  _$jscoverage['/base/style.js'].lineData[121] = 0;
  _$jscoverage['/base/style.js'].lineData[122] = 0;
  _$jscoverage['/base/style.js'].lineData[125] = 0;
  _$jscoverage['/base/style.js'].lineData[138] = 0;
  _$jscoverage['/base/style.js'].lineData[143] = 0;
  _$jscoverage['/base/style.js'].lineData[144] = 0;
  _$jscoverage['/base/style.js'].lineData[145] = 0;
  _$jscoverage['/base/style.js'].lineData[146] = 0;
  _$jscoverage['/base/style.js'].lineData[149] = 0;
  _$jscoverage['/base/style.js'].lineData[151] = 0;
  _$jscoverage['/base/style.js'].lineData[152] = 0;
  _$jscoverage['/base/style.js'].lineData[153] = 0;
  _$jscoverage['/base/style.js'].lineData[154] = 0;
  _$jscoverage['/base/style.js'].lineData[156] = 0;
  _$jscoverage['/base/style.js'].lineData[158] = 0;
  _$jscoverage['/base/style.js'].lineData[159] = 0;
  _$jscoverage['/base/style.js'].lineData[162] = 0;
  _$jscoverage['/base/style.js'].lineData[175] = 0;
  _$jscoverage['/base/style.js'].lineData[182] = 0;
  _$jscoverage['/base/style.js'].lineData[183] = 0;
  _$jscoverage['/base/style.js'].lineData[184] = 0;
  _$jscoverage['/base/style.js'].lineData[185] = 0;
  _$jscoverage['/base/style.js'].lineData[188] = 0;
  _$jscoverage['/base/style.js'].lineData[191] = 0;
  _$jscoverage['/base/style.js'].lineData[192] = 0;
  _$jscoverage['/base/style.js'].lineData[194] = 0;
  _$jscoverage['/base/style.js'].lineData[196] = 0;
  _$jscoverage['/base/style.js'].lineData[197] = 0;
  _$jscoverage['/base/style.js'].lineData[199] = 0;
  _$jscoverage['/base/style.js'].lineData[202] = 0;
  _$jscoverage['/base/style.js'].lineData[205] = 0;
  _$jscoverage['/base/style.js'].lineData[207] = 0;
  _$jscoverage['/base/style.js'].lineData[208] = 0;
  _$jscoverage['/base/style.js'].lineData[211] = 0;
  _$jscoverage['/base/style.js'].lineData[219] = 0;
  _$jscoverage['/base/style.js'].lineData[223] = 0;
  _$jscoverage['/base/style.js'].lineData[224] = 0;
  _$jscoverage['/base/style.js'].lineData[225] = 0;
  _$jscoverage['/base/style.js'].lineData[227] = 0;
  _$jscoverage['/base/style.js'].lineData[228] = 0;
  _$jscoverage['/base/style.js'].lineData[229] = 0;
  _$jscoverage['/base/style.js'].lineData[230] = 0;
  _$jscoverage['/base/style.js'].lineData[231] = 0;
  _$jscoverage['/base/style.js'].lineData[241] = 0;
  _$jscoverage['/base/style.js'].lineData[243] = 0;
  _$jscoverage['/base/style.js'].lineData[244] = 0;
  _$jscoverage['/base/style.js'].lineData[245] = 0;
  _$jscoverage['/base/style.js'].lineData[247] = 0;
  _$jscoverage['/base/style.js'].lineData[248] = 0;
  _$jscoverage['/base/style.js'].lineData[249] = 0;
  _$jscoverage['/base/style.js'].lineData[251] = 0;
  _$jscoverage['/base/style.js'].lineData[261] = 0;
  _$jscoverage['/base/style.js'].lineData[263] = 0;
  _$jscoverage['/base/style.js'].lineData[264] = 0;
  _$jscoverage['/base/style.js'].lineData[265] = 0;
  _$jscoverage['/base/style.js'].lineData[266] = 0;
  _$jscoverage['/base/style.js'].lineData[268] = 0;
  _$jscoverage['/base/style.js'].lineData[282] = 0;
  _$jscoverage['/base/style.js'].lineData[283] = 0;
  _$jscoverage['/base/style.js'].lineData[284] = 0;
  _$jscoverage['/base/style.js'].lineData[286] = 0;
  _$jscoverage['/base/style.js'].lineData[289] = 0;
  _$jscoverage['/base/style.js'].lineData[292] = 0;
  _$jscoverage['/base/style.js'].lineData[293] = 0;
  _$jscoverage['/base/style.js'].lineData[297] = 0;
  _$jscoverage['/base/style.js'].lineData[298] = 0;
  _$jscoverage['/base/style.js'].lineData[301] = 0;
  _$jscoverage['/base/style.js'].lineData[304] = 0;
  _$jscoverage['/base/style.js'].lineData[306] = 0;
  _$jscoverage['/base/style.js'].lineData[307] = 0;
  _$jscoverage['/base/style.js'].lineData[309] = 0;
  _$jscoverage['/base/style.js'].lineData[318] = 0;
  _$jscoverage['/base/style.js'].lineData[326] = 0;
  _$jscoverage['/base/style.js'].lineData[327] = 0;
  _$jscoverage['/base/style.js'].lineData[329] = 0;
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
  _$jscoverage['/base/style.js'].lineData[401] = 0;
  _$jscoverage['/base/style.js'].lineData[402] = 0;
  _$jscoverage['/base/style.js'].lineData[403] = 0;
  _$jscoverage['/base/style.js'].lineData[404] = 0;
  _$jscoverage['/base/style.js'].lineData[407] = 0;
  _$jscoverage['/base/style.js'].lineData[408] = 0;
  _$jscoverage['/base/style.js'].lineData[409] = 0;
  _$jscoverage['/base/style.js'].lineData[411] = 0;
  _$jscoverage['/base/style.js'].lineData[413] = 0;
  _$jscoverage['/base/style.js'].lineData[414] = 0;
  _$jscoverage['/base/style.js'].lineData[415] = 0;
  _$jscoverage['/base/style.js'].lineData[416] = 0;
  _$jscoverage['/base/style.js'].lineData[417] = 0;
  _$jscoverage['/base/style.js'].lineData[418] = 0;
  _$jscoverage['/base/style.js'].lineData[419] = 0;
  _$jscoverage['/base/style.js'].lineData[420] = 0;
  _$jscoverage['/base/style.js'].lineData[422] = 0;
  _$jscoverage['/base/style.js'].lineData[424] = 0;
  _$jscoverage['/base/style.js'].lineData[426] = 0;
  _$jscoverage['/base/style.js'].lineData[432] = 0;
  _$jscoverage['/base/style.js'].lineData[437] = 0;
  _$jscoverage['/base/style.js'].lineData[438] = 0;
  _$jscoverage['/base/style.js'].lineData[439] = 0;
  _$jscoverage['/base/style.js'].lineData[441] = 0;
  _$jscoverage['/base/style.js'].lineData[446] = 0;
  _$jscoverage['/base/style.js'].lineData[448] = 0;
  _$jscoverage['/base/style.js'].lineData[449] = 0;
  _$jscoverage['/base/style.js'].lineData[451] = 0;
  _$jscoverage['/base/style.js'].lineData[454] = 0;
  _$jscoverage['/base/style.js'].lineData[455] = 0;
  _$jscoverage['/base/style.js'].lineData[456] = 0;
  _$jscoverage['/base/style.js'].lineData[457] = 0;
  _$jscoverage['/base/style.js'].lineData[459] = 0;
  _$jscoverage['/base/style.js'].lineData[460] = 0;
  _$jscoverage['/base/style.js'].lineData[461] = 0;
  _$jscoverage['/base/style.js'].lineData[462] = 0;
  _$jscoverage['/base/style.js'].lineData[465] = 0;
  _$jscoverage['/base/style.js'].lineData[466] = 0;
  _$jscoverage['/base/style.js'].lineData[469] = 0;
  _$jscoverage['/base/style.js'].lineData[474] = 0;
  _$jscoverage['/base/style.js'].lineData[475] = 0;
  _$jscoverage['/base/style.js'].lineData[480] = 0;
  _$jscoverage['/base/style.js'].lineData[481] = 0;
  _$jscoverage['/base/style.js'].lineData[482] = 0;
  _$jscoverage['/base/style.js'].lineData[485] = 0;
  _$jscoverage['/base/style.js'].lineData[488] = 0;
  _$jscoverage['/base/style.js'].lineData[489] = 0;
  _$jscoverage['/base/style.js'].lineData[493] = 0;
  _$jscoverage['/base/style.js'].lineData[494] = 0;
  _$jscoverage['/base/style.js'].lineData[497] = 0;
  _$jscoverage['/base/style.js'].lineData[499] = 0;
  _$jscoverage['/base/style.js'].lineData[501] = 0;
  _$jscoverage['/base/style.js'].lineData[502] = 0;
  _$jscoverage['/base/style.js'].lineData[503] = 0;
  _$jscoverage['/base/style.js'].lineData[505] = 0;
  _$jscoverage['/base/style.js'].lineData[507] = 0;
  _$jscoverage['/base/style.js'].lineData[508] = 0;
  _$jscoverage['/base/style.js'].lineData[509] = 0;
  _$jscoverage['/base/style.js'].lineData[511] = 0;
  _$jscoverage['/base/style.js'].lineData[513] = 0;
  _$jscoverage['/base/style.js'].lineData[514] = 0;
  _$jscoverage['/base/style.js'].lineData[516] = 0;
  _$jscoverage['/base/style.js'].lineData[518] = 0;
  _$jscoverage['/base/style.js'].lineData[520] = 0;
  _$jscoverage['/base/style.js'].lineData[522] = 0;
  _$jscoverage['/base/style.js'].lineData[525] = 0;
  _$jscoverage['/base/style.js'].lineData[526] = 0;
  _$jscoverage['/base/style.js'].lineData[529] = 0;
  _$jscoverage['/base/style.js'].lineData[532] = 0;
  _$jscoverage['/base/style.js'].lineData[533] = 0;
  _$jscoverage['/base/style.js'].lineData[535] = 0;
  _$jscoverage['/base/style.js'].lineData[537] = 0;
  _$jscoverage['/base/style.js'].lineData[540] = 0;
  _$jscoverage['/base/style.js'].lineData[543] = 0;
  _$jscoverage['/base/style.js'].lineData[545] = 0;
  _$jscoverage['/base/style.js'].lineData[550] = 0;
  _$jscoverage['/base/style.js'].lineData[551] = 0;
  _$jscoverage['/base/style.js'].lineData[554] = 0;
  _$jscoverage['/base/style.js'].lineData[555] = 0;
  _$jscoverage['/base/style.js'].lineData[557] = 0;
  _$jscoverage['/base/style.js'].lineData[558] = 0;
  _$jscoverage['/base/style.js'].lineData[561] = 0;
  _$jscoverage['/base/style.js'].lineData[564] = 0;
  _$jscoverage['/base/style.js'].lineData[565] = 0;
  _$jscoverage['/base/style.js'].lineData[566] = 0;
  _$jscoverage['/base/style.js'].lineData[567] = 0;
  _$jscoverage['/base/style.js'].lineData[568] = 0;
  _$jscoverage['/base/style.js'].lineData[569] = 0;
  _$jscoverage['/base/style.js'].lineData[570] = 0;
  _$jscoverage['/base/style.js'].lineData[571] = 0;
  _$jscoverage['/base/style.js'].lineData[572] = 0;
  _$jscoverage['/base/style.js'].lineData[574] = 0;
  _$jscoverage['/base/style.js'].lineData[576] = 0;
  _$jscoverage['/base/style.js'].lineData[580] = 0;
  _$jscoverage['/base/style.js'].lineData[583] = 0;
  _$jscoverage['/base/style.js'].lineData[584] = 0;
  _$jscoverage['/base/style.js'].lineData[587] = 0;
  _$jscoverage['/base/style.js'].lineData[588] = 0;
  _$jscoverage['/base/style.js'].lineData[590] = 0;
  _$jscoverage['/base/style.js'].lineData[592] = 0;
  _$jscoverage['/base/style.js'].lineData[594] = 0;
  _$jscoverage['/base/style.js'].lineData[605] = 0;
  _$jscoverage['/base/style.js'].lineData[606] = 0;
  _$jscoverage['/base/style.js'].lineData[607] = 0;
  _$jscoverage['/base/style.js'].lineData[608] = 0;
  _$jscoverage['/base/style.js'].lineData[609] = 0;
  _$jscoverage['/base/style.js'].lineData[611] = 0;
  _$jscoverage['/base/style.js'].lineData[613] = 0;
  _$jscoverage['/base/style.js'].lineData[614] = 0;
  _$jscoverage['/base/style.js'].lineData[615] = 0;
  _$jscoverage['/base/style.js'].lineData[616] = 0;
  _$jscoverage['/base/style.js'].lineData[617] = 0;
  _$jscoverage['/base/style.js'].lineData[619] = 0;
  _$jscoverage['/base/style.js'].lineData[620] = 0;
  _$jscoverage['/base/style.js'].lineData[621] = 0;
  _$jscoverage['/base/style.js'].lineData[624] = 0;
  _$jscoverage['/base/style.js'].lineData[626] = 0;
  _$jscoverage['/base/style.js'].lineData[627] = 0;
  _$jscoverage['/base/style.js'].lineData[629] = 0;
  _$jscoverage['/base/style.js'].lineData[630] = 0;
  _$jscoverage['/base/style.js'].lineData[631] = 0;
  _$jscoverage['/base/style.js'].lineData[632] = 0;
  _$jscoverage['/base/style.js'].lineData[633] = 0;
  _$jscoverage['/base/style.js'].lineData[636] = 0;
  _$jscoverage['/base/style.js'].lineData[638] = 0;
  _$jscoverage['/base/style.js'].lineData[639] = 0;
  _$jscoverage['/base/style.js'].lineData[644] = 0;
  _$jscoverage['/base/style.js'].lineData[649] = 0;
  _$jscoverage['/base/style.js'].lineData[651] = 0;
  _$jscoverage['/base/style.js'].lineData[652] = 0;
  _$jscoverage['/base/style.js'].lineData[656] = 0;
  _$jscoverage['/base/style.js'].lineData[657] = 0;
  _$jscoverage['/base/style.js'].lineData[662] = 0;
  _$jscoverage['/base/style.js'].lineData[663] = 0;
  _$jscoverage['/base/style.js'].lineData[664] = 0;
  _$jscoverage['/base/style.js'].lineData[665] = 0;
  _$jscoverage['/base/style.js'].lineData[666] = 0;
  _$jscoverage['/base/style.js'].lineData[669] = 0;
  _$jscoverage['/base/style.js'].lineData[670] = 0;
  _$jscoverage['/base/style.js'].lineData[674] = 0;
  _$jscoverage['/base/style.js'].lineData[680] = 0;
  _$jscoverage['/base/style.js'].lineData[681] = 0;
  _$jscoverage['/base/style.js'].lineData[682] = 0;
  _$jscoverage['/base/style.js'].lineData[684] = 0;
  _$jscoverage['/base/style.js'].lineData[686] = 0;
  _$jscoverage['/base/style.js'].lineData[689] = 0;
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
  _$jscoverage['/base/style.js'].branchData['18'] = [];
  _$jscoverage['/base/style.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['48'] = [];
  _$jscoverage['/base/style.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['64'] = [];
  _$jscoverage['/base/style.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['65'] = [];
  _$jscoverage['/base/style.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['101'] = [];
  _$jscoverage['/base/style.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['102'] = [];
  _$jscoverage['/base/style.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['106'] = [];
  _$jscoverage['/base/style.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['106'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['111'] = [];
  _$jscoverage['/base/style.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['143'] = [];
  _$jscoverage['/base/style.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['145'] = [];
  _$jscoverage['/base/style.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['151'] = [];
  _$jscoverage['/base/style.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['153'] = [];
  _$jscoverage['/base/style.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['158'] = [];
  _$jscoverage['/base/style.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['182'] = [];
  _$jscoverage['/base/style.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['184'] = [];
  _$jscoverage['/base/style.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['194'] = [];
  _$jscoverage['/base/style.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['197'] = [];
  _$jscoverage['/base/style.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['199'] = [];
  _$jscoverage['/base/style.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['199'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['199'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['200'] = [];
  _$jscoverage['/base/style.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['205'] = [];
  _$jscoverage['/base/style.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['207'] = [];
  _$jscoverage['/base/style.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['223'] = [];
  _$jscoverage['/base/style.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['225'] = [];
  _$jscoverage['/base/style.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['227'] = [];
  _$jscoverage['/base/style.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['243'] = [];
  _$jscoverage['/base/style.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['247'] = [];
  _$jscoverage['/base/style.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['248'] = [];
  _$jscoverage['/base/style.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['263'] = [];
  _$jscoverage['/base/style.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['265'] = [];
  _$jscoverage['/base/style.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['282'] = [];
  _$jscoverage['/base/style.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['292'] = [];
  _$jscoverage['/base/style.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['297'] = [];
  _$jscoverage['/base/style.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['306'] = [];
  _$jscoverage['/base/style.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['326'] = [];
  _$jscoverage['/base/style.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['329'] = [];
  _$jscoverage['/base/style.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['332'] = [];
  _$jscoverage['/base/style.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['334'] = [];
  _$jscoverage['/base/style.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['339'] = [];
  _$jscoverage['/base/style.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['404'] = [];
  _$jscoverage['/base/style.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['409'] = [];
  _$jscoverage['/base/style.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['411'] = [];
  _$jscoverage['/base/style.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['415'] = [];
  _$jscoverage['/base/style.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['416'] = [];
  _$jscoverage['/base/style.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['419'] = [];
  _$jscoverage['/base/style.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['426'] = [];
  _$jscoverage['/base/style.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['438'] = [];
  _$jscoverage['/base/style.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['454'] = [];
  _$jscoverage['/base/style.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['456'] = [];
  _$jscoverage['/base/style.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['460'] = [];
  _$jscoverage['/base/style.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['461'] = [];
  _$jscoverage['/base/style.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['461'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['465'] = [];
  _$jscoverage['/base/style.js'].branchData['465'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['497'] = [];
  _$jscoverage['/base/style.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['497'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['498'] = [];
  _$jscoverage['/base/style.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['498'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['505'] = [];
  _$jscoverage['/base/style.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['507'] = [];
  _$jscoverage['/base/style.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['507'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['507'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['509'] = [];
  _$jscoverage['/base/style.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['513'] = [];
  _$jscoverage['/base/style.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['516'] = [];
  _$jscoverage['/base/style.js'].branchData['516'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['525'] = [];
  _$jscoverage['/base/style.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['525'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['529'] = [];
  _$jscoverage['/base/style.js'].branchData['529'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['532'] = [];
  _$jscoverage['/base/style.js'].branchData['532'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['540'] = [];
  _$jscoverage['/base/style.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['540'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['540'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['541'] = [];
  _$jscoverage['/base/style.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['545'] = [];
  _$jscoverage['/base/style.js'].branchData['545'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['554'] = [];
  _$jscoverage['/base/style.js'].branchData['554'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['566'] = [];
  _$jscoverage['/base/style.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['568'] = [];
  _$jscoverage['/base/style.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['569'] = [];
  _$jscoverage['/base/style.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['571'] = [];
  _$jscoverage['/base/style.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['576'] = [];
  _$jscoverage['/base/style.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['584'] = [];
  _$jscoverage['/base/style.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['590'] = [];
  _$jscoverage['/base/style.js'].branchData['590'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['606'] = [];
  _$jscoverage['/base/style.js'].branchData['606'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['607'] = [];
  _$jscoverage['/base/style.js'].branchData['607'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['608'] = [];
  _$jscoverage['/base/style.js'].branchData['608'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['609'] = [];
  _$jscoverage['/base/style.js'].branchData['609'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['611'] = [];
  _$jscoverage['/base/style.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['612'] = [];
  _$jscoverage['/base/style.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['616'] = [];
  _$jscoverage['/base/style.js'].branchData['616'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['616'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['616'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['620'] = [];
  _$jscoverage['/base/style.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['620'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['620'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['621'] = [];
  _$jscoverage['/base/style.js'].branchData['621'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['624'] = [];
  _$jscoverage['/base/style.js'].branchData['624'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['626'] = [];
  _$jscoverage['/base/style.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['629'] = [];
  _$jscoverage['/base/style.js'].branchData['629'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['629'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['630'] = [];
  _$jscoverage['/base/style.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['631'] = [];
  _$jscoverage['/base/style.js'].branchData['631'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['632'] = [];
  _$jscoverage['/base/style.js'].branchData['632'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['638'] = [];
  _$jscoverage['/base/style.js'].branchData['638'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['639'] = [];
  _$jscoverage['/base/style.js'].branchData['639'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['640'] = [];
  _$jscoverage['/base/style.js'].branchData['640'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['656'] = [];
  _$jscoverage['/base/style.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['665'] = [];
  _$jscoverage['/base/style.js'].branchData['665'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['666'] = [];
  _$jscoverage['/base/style.js'].branchData['666'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['669'] = [];
  _$jscoverage['/base/style.js'].branchData['669'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['670'] = [];
  _$jscoverage['/base/style.js'].branchData['670'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['681'] = [];
  _$jscoverage['/base/style.js'].branchData['681'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['681'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['682'] = [];
  _$jscoverage['/base/style.js'].branchData['682'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['682'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['683'] = [];
  _$jscoverage['/base/style.js'].branchData['683'][1] = new BranchData();
}
_$jscoverage['/base/style.js'].branchData['683'][1].init(52, 46, 'Dom.css(offsetParent, \'position\') === \'static\'');
function visit518_683_1(result) {
  _$jscoverage['/base/style.js'].branchData['683'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['682'][2].init(110, 99, '!ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit517_682_2(result) {
  _$jscoverage['/base/style.js'].branchData['682'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['682'][1].init(94, 115, 'offsetParent && !ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit516_682_1(result) {
  _$jscoverage['/base/style.js'].branchData['682'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['681'][2].init(48, 23, 'el.ownerDocument || doc');
function visit515_681_2(result) {
  _$jscoverage['/base/style.js'].branchData['681'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['681'][1].init(28, 49, 'el.offsetParent || (el.ownerDocument || doc).body');
function visit514_681_1(result) {
  _$jscoverage['/base/style.js'].branchData['681'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['670'][1].init(806, 42, 'parseFloat(Dom.css(el, \'marginLeft\')) || 0');
function visit513_670_1(result) {
  _$jscoverage['/base/style.js'].branchData['670'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['669'][1].init(740, 41, 'parseFloat(Dom.css(el, \'marginTop\')) || 0');
function visit512_669_1(result) {
  _$jscoverage['/base/style.js'].branchData['669'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['666'][1].init(438, 57, 'parseFloat(Dom.css(offsetParent, \'borderLeftWidth\')) || 0');
function visit511_666_1(result) {
  _$jscoverage['/base/style.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['665'][1].init(347, 56, 'parseFloat(Dom.css(offsetParent, \'borderTopWidth\')) || 0');
function visit510_665_1(result) {
  _$jscoverage['/base/style.js'].branchData['665'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['656'][1].init(106, 35, 'Dom.css(el, \'position\') === \'fixed\'');
function visit509_656_1(result) {
  _$jscoverage['/base/style.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['640'][1].init(45, 23, 'extra === PADDING_INDEX');
function visit508_640_1(result) {
  _$jscoverage['/base/style.js'].branchData['640'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['639'][1].init(27, 22, 'extra === BORDER_INDEX');
function visit507_639_1(result) {
  _$jscoverage['/base/style.js'].branchData['639'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['638'][1].init(1597, 27, 'borderBoxValueOrIsBorderBox');
function visit506_638_1(result) {
  _$jscoverage['/base/style.js'].branchData['638'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['632'][1].init(17, 27, 'borderBoxValueOrIsBorderBox');
function visit505_632_1(result) {
  _$jscoverage['/base/style.js'].branchData['632'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['631'][1].init(1319, 23, 'extra === CONTENT_INDEX');
function visit504_631_1(result) {
  _$jscoverage['/base/style.js'].branchData['631'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['630'][1].init(1276, 29, 'borderBoxValue || cssBoxValue');
function visit503_630_1(result) {
  _$jscoverage['/base/style.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['629'][2].init(1213, 28, 'borderBoxValue !== undefined');
function visit502_629_2(result) {
  _$jscoverage['/base/style.js'].branchData['629'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['629'][1].init(1213, 43, 'borderBoxValue !== undefined || isBorderBox');
function visit501_629_1(result) {
  _$jscoverage['/base/style.js'].branchData['629'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['626'][1].init(1074, 19, 'extra === undefined');
function visit500_626_1(result) {
  _$jscoverage['/base/style.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['624'][1].init(408, 28, 'parseFloat(cssBoxValue) || 0');
function visit499_624_1(result) {
  _$jscoverage['/base/style.js'].branchData['624'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['621'][1].init(31, 23, 'elem.style[name] || 0');
function visit498_621_1(result) {
  _$jscoverage['/base/style.js'].branchData['621'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['620'][3].init(228, 24, '(Number(cssBoxValue)) < 0');
function visit497_620_3(result) {
  _$jscoverage['/base/style.js'].branchData['620'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['620'][2].init(204, 19, 'cssBoxValue == null');
function visit496_620_2(result) {
  _$jscoverage['/base/style.js'].branchData['620'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['620'][1].init(204, 48, 'cssBoxValue == null || (Number(cssBoxValue)) < 0');
function visit495_620_1(result) {
  _$jscoverage['/base/style.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['616'][3].init(592, 19, 'borderBoxValue <= 0');
function visit494_616_3(result) {
  _$jscoverage['/base/style.js'].branchData['616'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['616'][2].init(566, 22, 'borderBoxValue == null');
function visit493_616_2(result) {
  _$jscoverage['/base/style.js'].branchData['616'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['616'][1].init(566, 45, 'borderBoxValue == null || borderBoxValue <= 0');
function visit492_616_1(result) {
  _$jscoverage['/base/style.js'].branchData['616'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['612'][1].init(96, 14, 'name === WIDTH');
function visit491_612_1(result) {
  _$jscoverage['/base/style.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['611'][1].init(271, 14, 'name === WIDTH');
function visit490_611_1(result) {
  _$jscoverage['/base/style.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['609'][1].init(20, 14, 'name === WIDTH');
function visit489_609_1(result) {
  _$jscoverage['/base/style.js'].branchData['609'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['608'][1].init(141, 19, 'elem.nodeType === 9');
function visit488_608_1(result) {
  _$jscoverage['/base/style.js'].branchData['608'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['607'][1].init(20, 14, 'name === WIDTH');
function visit487_607_1(result) {
  _$jscoverage['/base/style.js'].branchData['607'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['606'][1].init(13, 16, 'S.isWindow(elem)');
function visit486_606_1(result) {
  _$jscoverage['/base/style.js'].branchData['606'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['590'][1].init(78, 15, 'doc.defaultView');
function visit485_590_1(result) {
  _$jscoverage['/base/style.js'].branchData['590'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['584'][1].init(16, 72, 'Dom._getComputedStyle(elem, \'boxSizing\', computedStyle) === \'border-box\'');
function visit484_584_1(result) {
  _$jscoverage['/base/style.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['576'][1].init(271, 68, 'parseFloat(Dom._getComputedStyle(elem, cssProp, computedStyle)) || 0');
function visit483_576_1(result) {
  _$jscoverage['/base/style.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['571'][1].init(58, 17, 'prop === \'border\'');
function visit482_571_1(result) {
  _$jscoverage['/base/style.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['569'][1].init(29, 16, 'i < which.length');
function visit481_569_1(result) {
  _$jscoverage['/base/style.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['568'][1].init(46, 4, 'prop');
function visit480_568_1(result) {
  _$jscoverage['/base/style.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['566'][1].init(56, 16, 'j < props.length');
function visit479_566_1(result) {
  _$jscoverage['/base/style.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['554'][1].init(124, 22, 'elem.offsetWidth !== 0');
function visit478_554_1(result) {
  _$jscoverage['/base/style.js'].branchData['554'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['545'][1].init(326, 17, 'ret === undefined');
function visit477_545_1(result) {
  _$jscoverage['/base/style.js'].branchData['545'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['541'][1].init(33, 42, '(ret = hook.get(elem, false)) !== undefined');
function visit476_541_1(result) {
  _$jscoverage['/base/style.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['540'][3].init(103, 76, '\'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit475_540_3(result) {
  _$jscoverage['/base/style.js'].branchData['540'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['540'][2].init(95, 84, 'hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit474_540_2(result) {
  _$jscoverage['/base/style.js'].branchData['540'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['540'][1].init(93, 87, '!(hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined)');
function visit473_540_1(result) {
  _$jscoverage['/base/style.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['532'][1].init(137, 9, 'UA.webkit');
function visit472_532_1(result) {
  _$jscoverage['/base/style.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['529'][1].init(849, 16, '!elStyle.cssText');
function visit471_529_1(result) {
  _$jscoverage['/base/style.js'].branchData['529'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['525'][2].init(301, 13, 'val === EMPTY');
function visit470_525_2(result) {
  _$jscoverage['/base/style.js'].branchData['525'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['525'][1].init(301, 40, 'val === EMPTY && elStyle.removeAttribute');
function visit469_525_1(result) {
  _$jscoverage['/base/style.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['516'][1].init(385, 17, 'val !== undefined');
function visit468_516_1(result) {
  _$jscoverage['/base/style.js'].branchData['516'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['513'][1].init(292, 16, 'hook && hook.set');
function visit467_513_1(result) {
  _$jscoverage['/base/style.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['509'][1].init(134, 39, '!isNaN(Number(val)) && !cssNumber[name]');
function visit466_509_1(result) {
  _$jscoverage['/base/style.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['507'][3].init(64, 13, 'val === EMPTY');
function visit465_507_3(result) {
  _$jscoverage['/base/style.js'].branchData['507'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['507'][2].init(48, 12, 'val === null');
function visit464_507_2(result) {
  _$jscoverage['/base/style.js'].branchData['507'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['507'][1].init(48, 29, 'val === null || val === EMPTY');
function visit463_507_1(result) {
  _$jscoverage['/base/style.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['505'][1].init(330, 17, 'val !== undefined');
function visit462_505_1(result) {
  _$jscoverage['/base/style.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['498'][2].init(106, 19, 'elem.nodeType === 8');
function visit461_498_2(result) {
  _$jscoverage['/base/style.js'].branchData['498'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['498'][1].init(34, 46, 'elem.nodeType === 8 || !(elStyle = elem.style)');
function visit460_498_1(result) {
  _$jscoverage['/base/style.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['497'][2].init(69, 19, 'elem.nodeType === 3');
function visit459_497_2(result) {
  _$jscoverage['/base/style.js'].branchData['497'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['497'][1].init(69, 81, 'elem.nodeType === 3 || elem.nodeType === 8 || !(elStyle = elem.style)');
function visit458_497_1(result) {
  _$jscoverage['/base/style.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['465'][1].init(501, 37, 'isAutoPosition || NO_PX_REG.test(val)');
function visit457_465_1(result) {
  _$jscoverage['/base/style.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['461'][2].init(321, 23, 'position === \'relative\'');
function visit456_461_2(result) {
  _$jscoverage['/base/style.js'].branchData['461'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['461'][1].init(303, 41, 'isAutoPosition && position === \'relative\'');
function visit455_461_1(result) {
  _$jscoverage['/base/style.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['460'][1].init(263, 14, 'val === \'auto\'');
function visit454_460_1(result) {
  _$jscoverage['/base/style.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['456'][1].init(81, 21, 'position === \'static\'');
function visit453_456_1(result) {
  _$jscoverage['/base/style.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['454'][1].init(112, 8, 'computed');
function visit452_454_1(result) {
  _$jscoverage['/base/style.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['438'][1].init(46, 8, 'computed');
function visit451_438_1(result) {
  _$jscoverage['/base/style.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['426'][1].init(540, 53, 'elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX)');
function visit450_426_1(result) {
  _$jscoverage['/base/style.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['419'][1].init(163, 11, 'isBorderBox');
function visit449_419_1(result) {
  _$jscoverage['/base/style.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['416'][1].init(21, 4, 'elem');
function visit448_416_1(result) {
  _$jscoverage['/base/style.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['415'][1].init(59, 17, 'val !== undefined');
function visit447_415_1(result) {
  _$jscoverage['/base/style.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['411'][1].init(435, 14, 'name === WIDTH');
function visit446_411_1(result) {
  _$jscoverage['/base/style.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['409'][1].init(60, 79, 'el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX)');
function visit445_409_1(result) {
  _$jscoverage['/base/style.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['404'][1].init(60, 49, 'el && getWHIgnoreDisplay(el, name, PADDING_INDEX)');
function visit444_404_1(result) {
  _$jscoverage['/base/style.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['339'][1].init(33, 36, '!S.inArray(getNodeName(e), excludes)');
function visit443_339_1(result) {
  _$jscoverage['/base/style.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['334'][1].init(224, 5, 'UA.ie');
function visit442_334_1(result) {
  _$jscoverage['/base/style.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['332'][1].init(101, 27, 'userSelectProperty in style');
function visit441_332_1(result) {
  _$jscoverage['/base/style.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['329'][1].init(432, 6, 'j >= 0');
function visit440_329_1(result) {
  _$jscoverage['/base/style.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['326'][1].init(250, 32, 'userSelectProperty === undefined');
function visit439_326_1(result) {
  _$jscoverage['/base/style.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['306'][1].init(744, 15, 'elem.styleSheet');
function visit438_306_1(result) {
  _$jscoverage['/base/style.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['297'][1].init(489, 4, 'elem');
function visit437_297_1(result) {
  _$jscoverage['/base/style.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['292'][1].init(329, 35, 'id && (id = id.replace(\'#\', EMPTY))');
function visit436_292_1(result) {
  _$jscoverage['/base/style.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['282'][1].init(21, 26, 'typeof refWin === \'string\'');
function visit435_282_1(result) {
  _$jscoverage['/base/style.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['265'][1].init(60, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit434_265_1(result) {
  _$jscoverage['/base/style.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['263'][1].init(118, 6, 'i >= 0');
function visit433_263_1(result) {
  _$jscoverage['/base/style.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['248'][1].init(29, 3, 'old');
function visit432_248_1(result) {
  _$jscoverage['/base/style.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['247'][1].init(150, 12, 'old !== NONE');
function visit431_247_1(result) {
  _$jscoverage['/base/style.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['243'][1].init(118, 6, 'i >= 0');
function visit430_243_1(result) {
  _$jscoverage['/base/style.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['227'][1].init(201, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit429_227_1(result) {
  _$jscoverage['/base/style.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['225'][1].init(78, 36, 'Dom.data(elem, OLD_DISPLAY) || EMPTY');
function visit428_225_1(result) {
  _$jscoverage['/base/style.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['223'][1].init(172, 6, 'i >= 0');
function visit427_223_1(result) {
  _$jscoverage['/base/style.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['207'][1].init(46, 6, 'i >= 0');
function visit426_207_1(result) {
  _$jscoverage['/base/style.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['205'][1].init(482, 26, 'typeof ret === \'undefined\'');
function visit425_205_1(result) {
  _$jscoverage['/base/style.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['200'][1].init(45, 41, '(ret = hook.get(elem, true)) !== undefined');
function visit424_200_1(result) {
  _$jscoverage['/base/style.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['199'][3].init(123, 87, '\'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit423_199_3(result) {
  _$jscoverage['/base/style.js'].branchData['199'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['199'][2].init(115, 95, 'hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit422_199_2(result) {
  _$jscoverage['/base/style.js'].branchData['199'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['199'][1].init(113, 98, '!(hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined)');
function visit421_199_1(result) {
  _$jscoverage['/base/style.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['197'][1].init(114, 4, 'elem');
function visit420_197_1(result) {
  _$jscoverage['/base/style.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['194'][1].init(645, 17, 'val === undefined');
function visit419_194_1(result) {
  _$jscoverage['/base/style.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['184'][1].init(50, 6, 'i >= 0');
function visit418_184_1(result) {
  _$jscoverage['/base/style.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['182'][1].init(233, 21, 'S.isPlainObject(name)');
function visit417_182_1(result) {
  _$jscoverage['/base/style.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['158'][1].init(46, 6, 'i >= 0');
function visit416_158_1(result) {
  _$jscoverage['/base/style.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['153'][1].init(55, 4, 'elem');
function visit415_153_1(result) {
  _$jscoverage['/base/style.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['151'][1].init(493, 17, 'val === undefined');
function visit414_151_1(result) {
  _$jscoverage['/base/style.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['145'][1].init(50, 6, 'i >= 0');
function visit413_145_1(result) {
  _$jscoverage['/base/style.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['143'][1].init(187, 21, 'S.isPlainObject(name)');
function visit412_143_1(result) {
  _$jscoverage['/base/style.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['111'][1].init(758, 51, 'Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)');
function visit411_111_1(result) {
  _$jscoverage['/base/style.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['106'][2].init(575, 10, 'val === \'\'');
function visit410_106_2(result) {
  _$jscoverage['/base/style.js'].branchData['106'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['106'][1].init(575, 36, 'val === \'\' && !Dom.contains(d, elem)');
function visit409_106_1(result) {
  _$jscoverage['/base/style.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['102'][1].init(27, 59, 'computedStyle.getPropertyValue(name) || computedStyle[name]');
function visit408_102_1(result) {
  _$jscoverage['/base/style.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['101'][1].init(344, 59, 'computedStyle || d.defaultView.getComputedStyle(elem, null)');
function visit407_101_1(result) {
  _$jscoverage['/base/style.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['65'][1].init(20, 31, 'doc.body || doc.documentElement');
function visit406_65_1(result) {
  _$jscoverage['/base/style.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['64'][1].init(101, 26, '!defaultDisplay[tagName]');
function visit405_64_1(result) {
  _$jscoverage['/base/style.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['48'][1].init(16, 53, 'cssProps[name] || getCssVendorInfo(name).propertyName');
function visit404_48_1(result) {
  _$jscoverage['/base/style.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['18'][1].init(315, 27, 'globalWindow.document || {}');
function visit403_18_1(result) {
  _$jscoverage['/base/style.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/style.js'].functionData[0]++;
  _$jscoverage['/base/style.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/style.js'].lineData[8]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/base/style.js'].lineData[9]++;
  var globalWindow = S.Env.host, getCssVendorInfo = S.Feature.getCssVendorInfo, UA = S.UA, BOX_MODELS = ['margin', 'border', 'padding'], CONTENT_INDEX = -1, PADDING_INDEX = 2, BORDER_INDEX = 1, MARGIN_INDEX = 0, getNodeName = Dom.nodeName, doc = visit403_18_1(globalWindow.document || {}), RE_MARGIN = /^margin/, WIDTH = 'width', HEIGHT = 'height', DISPLAY = 'display', OLD_DISPLAY = DISPLAY + S.now(), NONE = 'none', cssNumber = {
  fillOpacity: 1, 
  fontWeight: 1, 
  lineHeight: 1, 
  opacity: 1, 
  orphans: 1, 
  widows: 1, 
  zIndex: 1, 
  zoom: 1}, rmsPrefix = /^-ms-/, EMPTY = '', DEFAULT_UNIT = 'px', NO_PX_REG = /\d(?!px)[a-z%]+$/i, cssHooks = {}, cssProps = {}, userSelectProperty, defaultDisplay = {}, RE_DASH = /-([a-z])/ig;
  _$jscoverage['/base/style.js'].lineData[45]++;
  cssProps['float'] = 'cssFloat';
  _$jscoverage['/base/style.js'].lineData[47]++;
  function normalizeCssPropName(name) {
    _$jscoverage['/base/style.js'].functionData[1]++;
    _$jscoverage['/base/style.js'].lineData[48]++;
    return visit404_48_1(cssProps[name] || getCssVendorInfo(name).propertyName);
  }
  _$jscoverage['/base/style.js'].lineData[51]++;
  function upperCase() {
    _$jscoverage['/base/style.js'].functionData[2]++;
    _$jscoverage['/base/style.js'].lineData[52]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/base/style.js'].lineData[55]++;
  function camelCase(name) {
    _$jscoverage['/base/style.js'].functionData[3]++;
    _$jscoverage['/base/style.js'].lineData[57]++;
    return name.replace(rmsPrefix, 'ms-').replace(RE_DASH, upperCase);
  }
  _$jscoverage['/base/style.js'].lineData[60]++;
  function getDefaultDisplay(tagName) {
    _$jscoverage['/base/style.js'].functionData[4]++;
    _$jscoverage['/base/style.js'].lineData[61]++;
    var body, oldDisplay = defaultDisplay[tagName], elem;
    _$jscoverage['/base/style.js'].lineData[64]++;
    if (visit405_64_1(!defaultDisplay[tagName])) {
      _$jscoverage['/base/style.js'].lineData[65]++;
      body = visit406_65_1(doc.body || doc.documentElement);
      _$jscoverage['/base/style.js'].lineData[66]++;
      elem = doc.createElement(tagName);
      _$jscoverage['/base/style.js'].lineData[68]++;
      Dom.prepend(elem, body);
      _$jscoverage['/base/style.js'].lineData[69]++;
      oldDisplay = Dom.css(elem, 'display');
      _$jscoverage['/base/style.js'].lineData[70]++;
      body.removeChild(elem);
      _$jscoverage['/base/style.js'].lineData[72]++;
      defaultDisplay[tagName] = oldDisplay;
    }
    _$jscoverage['/base/style.js'].lineData[74]++;
    return oldDisplay;
  }
  _$jscoverage['/base/style.js'].lineData[77]++;
  S.mix(Dom, {
  _camelCase: camelCase, 
  _cssHooks: cssHooks, 
  _cssProps: cssProps, 
  _getComputedStyle: function(elem, name, computedStyle) {
  _$jscoverage['/base/style.js'].functionData[5]++;
  _$jscoverage['/base/style.js'].lineData[91]++;
  var val = '', width, minWidth, maxWidth, style, d = elem.ownerDocument;
  _$jscoverage['/base/style.js'].lineData[98]++;
  name = normalizeCssPropName(name);
  _$jscoverage['/base/style.js'].lineData[101]++;
  if ((computedStyle = (visit407_101_1(computedStyle || d.defaultView.getComputedStyle(elem, null))))) {
    _$jscoverage['/base/style.js'].lineData[102]++;
    val = visit408_102_1(computedStyle.getPropertyValue(name) || computedStyle[name]);
  }
  _$jscoverage['/base/style.js'].lineData[106]++;
  if (visit409_106_1(visit410_106_2(val === '') && !Dom.contains(d, elem))) {
    _$jscoverage['/base/style.js'].lineData[107]++;
    val = elem.style[name];
  }
  _$jscoverage['/base/style.js'].lineData[111]++;
  if (visit411_111_1(Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name))) {
    _$jscoverage['/base/style.js'].lineData[112]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[113]++;
    width = style.width;
    _$jscoverage['/base/style.js'].lineData[114]++;
    minWidth = style.minWidth;
    _$jscoverage['/base/style.js'].lineData[115]++;
    maxWidth = style.maxWidth;
    _$jscoverage['/base/style.js'].lineData[117]++;
    style.minWidth = style.maxWidth = style.width = val;
    _$jscoverage['/base/style.js'].lineData[118]++;
    val = computedStyle.width;
    _$jscoverage['/base/style.js'].lineData[120]++;
    style.width = width;
    _$jscoverage['/base/style.js'].lineData[121]++;
    style.minWidth = minWidth;
    _$jscoverage['/base/style.js'].lineData[122]++;
    style.maxWidth = maxWidth;
  }
  _$jscoverage['/base/style.js'].lineData[125]++;
  return val;
}, 
  style: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[6]++;
  _$jscoverage['/base/style.js'].lineData[138]++;
  var els = Dom.query(selector), k, ret, elem = els[0], i;
  _$jscoverage['/base/style.js'].lineData[143]++;
  if (visit412_143_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[144]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[145]++;
      for (i = els.length - 1; visit413_145_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[146]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[149]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[151]++;
  if (visit414_151_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[152]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[153]++;
    if (visit415_153_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[154]++;
      ret = style(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[156]++;
    return ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[158]++;
    for (i = els.length - 1; visit416_158_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[159]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[162]++;
  return undefined;
}, 
  css: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[7]++;
  _$jscoverage['/base/style.js'].lineData[175]++;
  var els = Dom.query(selector), elem = els[0], k, hook, ret, i;
  _$jscoverage['/base/style.js'].lineData[182]++;
  if (visit417_182_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[183]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[184]++;
      for (i = els.length - 1; visit418_184_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[185]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[188]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[191]++;
  name = camelCase(name);
  _$jscoverage['/base/style.js'].lineData[192]++;
  hook = cssHooks[name];
  _$jscoverage['/base/style.js'].lineData[194]++;
  if (visit419_194_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[196]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[197]++;
    if (visit420_197_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[199]++;
      if (visit421_199_1(!(visit422_199_2(hook && visit423_199_3('get' in hook && visit424_200_1((ret = hook.get(elem, true)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[202]++;
        ret = Dom._getComputedStyle(elem, name);
      }
    }
    _$jscoverage['/base/style.js'].lineData[205]++;
    return (visit425_205_1(typeof ret === 'undefined')) ? '' : ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[207]++;
    for (i = els.length - 1; visit426_207_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[208]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[211]++;
  return undefined;
}, 
  show: function(selector) {
  _$jscoverage['/base/style.js'].functionData[8]++;
  _$jscoverage['/base/style.js'].lineData[219]++;
  var els = Dom.query(selector), tagName, old, elem, i;
  _$jscoverage['/base/style.js'].lineData[223]++;
  for (i = els.length - 1; visit427_223_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[224]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[225]++;
    elem.style[DISPLAY] = visit428_225_1(Dom.data(elem, OLD_DISPLAY) || EMPTY);
    _$jscoverage['/base/style.js'].lineData[227]++;
    if (visit429_227_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[228]++;
      tagName = elem.tagName.toLowerCase();
      _$jscoverage['/base/style.js'].lineData[229]++;
      old = getDefaultDisplay(tagName);
      _$jscoverage['/base/style.js'].lineData[230]++;
      Dom.data(elem, OLD_DISPLAY, old);
      _$jscoverage['/base/style.js'].lineData[231]++;
      elem.style[DISPLAY] = old;
    }
  }
}, 
  hide: function(selector) {
  _$jscoverage['/base/style.js'].functionData[9]++;
  _$jscoverage['/base/style.js'].lineData[241]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[243]++;
  for (i = els.length - 1; visit430_243_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[244]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[245]++;
    var style = elem.style, old = style[DISPLAY];
    _$jscoverage['/base/style.js'].lineData[247]++;
    if (visit431_247_1(old !== NONE)) {
      _$jscoverage['/base/style.js'].lineData[248]++;
      if (visit432_248_1(old)) {
        _$jscoverage['/base/style.js'].lineData[249]++;
        Dom.data(elem, OLD_DISPLAY, old);
      }
      _$jscoverage['/base/style.js'].lineData[251]++;
      style[DISPLAY] = NONE;
    }
  }
}, 
  toggle: function(selector) {
  _$jscoverage['/base/style.js'].functionData[10]++;
  _$jscoverage['/base/style.js'].lineData[261]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[263]++;
  for (i = els.length - 1; visit433_263_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[264]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[265]++;
    if (visit434_265_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[266]++;
      Dom.show(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[268]++;
      Dom.hide(elem);
    }
  }
}, 
  addStyleSheet: function(refWin, cssText, id) {
  _$jscoverage['/base/style.js'].functionData[11]++;
  _$jscoverage['/base/style.js'].lineData[282]++;
  if (visit435_282_1(typeof refWin === 'string')) {
    _$jscoverage['/base/style.js'].lineData[283]++;
    id = cssText;
    _$jscoverage['/base/style.js'].lineData[284]++;
    cssText = refWin;
    _$jscoverage['/base/style.js'].lineData[286]++;
    refWin = globalWindow;
  }
  _$jscoverage['/base/style.js'].lineData[289]++;
  var doc = Dom.getDocument(refWin), elem;
  _$jscoverage['/base/style.js'].lineData[292]++;
  if (visit436_292_1(id && (id = id.replace('#', EMPTY)))) {
    _$jscoverage['/base/style.js'].lineData[293]++;
    elem = Dom.get('#' + id, doc);
  }
  _$jscoverage['/base/style.js'].lineData[297]++;
  if (visit437_297_1(elem)) {
    _$jscoverage['/base/style.js'].lineData[298]++;
    return;
  }
  _$jscoverage['/base/style.js'].lineData[301]++;
  elem = Dom.create('<style>', {
  id: id}, doc);
  _$jscoverage['/base/style.js'].lineData[304]++;
  Dom.get('head', doc).appendChild(elem);
  _$jscoverage['/base/style.js'].lineData[306]++;
  if (visit438_306_1(elem.styleSheet)) {
    _$jscoverage['/base/style.js'].lineData[307]++;
    elem.styleSheet.cssText = cssText;
  } else {
    _$jscoverage['/base/style.js'].lineData[309]++;
    elem.appendChild(doc.createTextNode(cssText));
  }
}, 
  unselectable: function(selector) {
  _$jscoverage['/base/style.js'].functionData[12]++;
  _$jscoverage['/base/style.js'].lineData[318]++;
  var _els = Dom.query(selector), elem, j, e, i = 0, excludes, style, els;
  _$jscoverage['/base/style.js'].lineData[326]++;
  if (visit439_326_1(userSelectProperty === undefined)) {
    _$jscoverage['/base/style.js'].lineData[327]++;
    userSelectProperty = getCssVendorInfo('userSelect').propertyName;
  }
  _$jscoverage['/base/style.js'].lineData[329]++;
  for (j = _els.length - 1; visit440_329_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[330]++;
    elem = _els[j];
    _$jscoverage['/base/style.js'].lineData[331]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[332]++;
    if (visit441_332_1(userSelectProperty in style)) {
      _$jscoverage['/base/style.js'].lineData[333]++;
      style[userSelectProperty] = 'none';
    } else {
      _$jscoverage['/base/style.js'].lineData[334]++;
      if (visit442_334_1(UA.ie)) {
        _$jscoverage['/base/style.js'].lineData[335]++;
        els = elem.getElementsByTagName('*');
        _$jscoverage['/base/style.js'].lineData[336]++;
        elem.setAttribute('unselectable', 'on');
        _$jscoverage['/base/style.js'].lineData[337]++;
        excludes = ['iframe', 'textarea', 'input', 'select'];
        _$jscoverage['/base/style.js'].lineData[338]++;
        while ((e = els[i++])) {
          _$jscoverage['/base/style.js'].lineData[339]++;
          if (visit443_339_1(!S.inArray(getNodeName(e), excludes))) {
            _$jscoverage['/base/style.js'].lineData[340]++;
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
  _$jscoverage['/base/style.js'].lineData[401]++;
  S.each([WIDTH, HEIGHT], function(name) {
  _$jscoverage['/base/style.js'].functionData[13]++;
  _$jscoverage['/base/style.js'].lineData[402]++;
  Dom['inner' + S.ucfirst(name)] = function(selector) {
  _$jscoverage['/base/style.js'].functionData[14]++;
  _$jscoverage['/base/style.js'].lineData[403]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[404]++;
  return visit444_404_1(el && getWHIgnoreDisplay(el, name, PADDING_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[407]++;
  Dom['outer' + S.ucfirst(name)] = function(selector, includeMargin) {
  _$jscoverage['/base/style.js'].functionData[15]++;
  _$jscoverage['/base/style.js'].lineData[408]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[409]++;
  return visit445_409_1(el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[411]++;
  var which = visit446_411_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'];
  _$jscoverage['/base/style.js'].lineData[413]++;
  Dom[name] = function(selector, val) {
  _$jscoverage['/base/style.js'].functionData[16]++;
  _$jscoverage['/base/style.js'].lineData[414]++;
  var elem = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[415]++;
  if (visit447_415_1(val !== undefined)) {
    _$jscoverage['/base/style.js'].lineData[416]++;
    if (visit448_416_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[417]++;
      var computedStyle = getComputedStyle(elem);
      _$jscoverage['/base/style.js'].lineData[418]++;
      var isBorderBox = isBorderBoxFn(elem, computedStyle);
      _$jscoverage['/base/style.js'].lineData[419]++;
      if (visit449_419_1(isBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[420]++;
        val += getPBMWidth(elem, ['padding', 'border'], which, computedStyle);
      }
      _$jscoverage['/base/style.js'].lineData[422]++;
      return Dom.css(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[424]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[426]++;
  return visit450_426_1(elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[432]++;
  cssHooks[name] = {
  get: function(elem, computed) {
  _$jscoverage['/base/style.js'].functionData[17]++;
  _$jscoverage['/base/style.js'].lineData[437]++;
  var val;
  _$jscoverage['/base/style.js'].lineData[438]++;
  if (visit451_438_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[439]++;
    val = getWHIgnoreDisplay(elem, name) + 'px';
  }
  _$jscoverage['/base/style.js'].lineData[441]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[446]++;
  var cssShow = {
  position: 'absolute', 
  visibility: 'hidden', 
  display: 'block'};
  _$jscoverage['/base/style.js'].lineData[448]++;
  S.each(['left', 'top'], function(name) {
  _$jscoverage['/base/style.js'].functionData[18]++;
  _$jscoverage['/base/style.js'].lineData[449]++;
  cssHooks[name] = {
  get: function(el, computed) {
  _$jscoverage['/base/style.js'].functionData[19]++;
  _$jscoverage['/base/style.js'].lineData[451]++;
  var val, isAutoPosition, position;
  _$jscoverage['/base/style.js'].lineData[454]++;
  if (visit452_454_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[455]++;
    position = Dom.css(el, 'position');
    _$jscoverage['/base/style.js'].lineData[456]++;
    if (visit453_456_1(position === 'static')) {
      _$jscoverage['/base/style.js'].lineData[457]++;
      return 'auto';
    }
    _$jscoverage['/base/style.js'].lineData[459]++;
    val = Dom._getComputedStyle(el, name);
    _$jscoverage['/base/style.js'].lineData[460]++;
    isAutoPosition = visit454_460_1(val === 'auto');
    _$jscoverage['/base/style.js'].lineData[461]++;
    if (visit455_461_1(isAutoPosition && visit456_461_2(position === 'relative'))) {
      _$jscoverage['/base/style.js'].lineData[462]++;
      return '0px';
    }
    _$jscoverage['/base/style.js'].lineData[465]++;
    if (visit457_465_1(isAutoPosition || NO_PX_REG.test(val))) {
      _$jscoverage['/base/style.js'].lineData[466]++;
      val = getPosition(el)[name] + 'px';
    }
  }
  _$jscoverage['/base/style.js'].lineData[469]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[474]++;
  function swap(elem, options, callback) {
    _$jscoverage['/base/style.js'].functionData[20]++;
    _$jscoverage['/base/style.js'].lineData[475]++;
    var old = {}, style = elem.style, name;
    _$jscoverage['/base/style.js'].lineData[480]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[481]++;
      old[name] = style[name];
      _$jscoverage['/base/style.js'].lineData[482]++;
      style[name] = options[name];
    }
    _$jscoverage['/base/style.js'].lineData[485]++;
    callback.call(elem);
    _$jscoverage['/base/style.js'].lineData[488]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[489]++;
      style[name] = old[name];
    }
  }
  _$jscoverage['/base/style.js'].lineData[493]++;
  function style(elem, name, val) {
    _$jscoverage['/base/style.js'].functionData[21]++;
    _$jscoverage['/base/style.js'].lineData[494]++;
    var elStyle, ret, hook;
    _$jscoverage['/base/style.js'].lineData[497]++;
    if (visit458_497_1(visit459_497_2(elem.nodeType === 3) || visit460_498_1(visit461_498_2(elem.nodeType === 8) || !(elStyle = elem.style)))) {
      _$jscoverage['/base/style.js'].lineData[499]++;
      return undefined;
    }
    _$jscoverage['/base/style.js'].lineData[501]++;
    name = camelCase(name);
    _$jscoverage['/base/style.js'].lineData[502]++;
    hook = cssHooks[name];
    _$jscoverage['/base/style.js'].lineData[503]++;
    name = normalizeCssPropName(name);
    _$jscoverage['/base/style.js'].lineData[505]++;
    if (visit462_505_1(val !== undefined)) {
      _$jscoverage['/base/style.js'].lineData[507]++;
      if (visit463_507_1(visit464_507_2(val === null) || visit465_507_3(val === EMPTY))) {
        _$jscoverage['/base/style.js'].lineData[508]++;
        val = EMPTY;
      } else {
        _$jscoverage['/base/style.js'].lineData[509]++;
        if (visit466_509_1(!isNaN(Number(val)) && !cssNumber[name])) {
          _$jscoverage['/base/style.js'].lineData[511]++;
          val += DEFAULT_UNIT;
        }
      }
      _$jscoverage['/base/style.js'].lineData[513]++;
      if (visit467_513_1(hook && hook.set)) {
        _$jscoverage['/base/style.js'].lineData[514]++;
        val = hook.set(elem, val);
      }
      _$jscoverage['/base/style.js'].lineData[516]++;
      if (visit468_516_1(val !== undefined)) {
        _$jscoverage['/base/style.js'].lineData[518]++;
        try {
          _$jscoverage['/base/style.js'].lineData[520]++;
          elStyle[name] = val;
        }        catch (e) {
  _$jscoverage['/base/style.js'].lineData[522]++;
  logger.warn('css set error:' + e);
}
        _$jscoverage['/base/style.js'].lineData[525]++;
        if (visit469_525_1(visit470_525_2(val === EMPTY) && elStyle.removeAttribute)) {
          _$jscoverage['/base/style.js'].lineData[526]++;
          elStyle.removeAttribute(name);
        }
      }
      _$jscoverage['/base/style.js'].lineData[529]++;
      if (visit471_529_1(!elStyle.cssText)) {
        _$jscoverage['/base/style.js'].lineData[532]++;
        if (visit472_532_1(UA.webkit)) {
          _$jscoverage['/base/style.js'].lineData[533]++;
          elStyle = elem.outerHTML;
        }
        _$jscoverage['/base/style.js'].lineData[535]++;
        elem.removeAttribute('style');
      }
      _$jscoverage['/base/style.js'].lineData[537]++;
      return undefined;
    } else {
      _$jscoverage['/base/style.js'].lineData[540]++;
      if (visit473_540_1(!(visit474_540_2(hook && visit475_540_3('get' in hook && visit476_541_1((ret = hook.get(elem, false)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[543]++;
        ret = elStyle[name];
      }
      _$jscoverage['/base/style.js'].lineData[545]++;
      return visit477_545_1(ret === undefined) ? '' : ret;
    }
  }
  _$jscoverage['/base/style.js'].lineData[550]++;
  function getWHIgnoreDisplay(elem) {
    _$jscoverage['/base/style.js'].functionData[22]++;
    _$jscoverage['/base/style.js'].lineData[551]++;
    var val, args = arguments;
    _$jscoverage['/base/style.js'].lineData[554]++;
    if (visit478_554_1(elem.offsetWidth !== 0)) {
      _$jscoverage['/base/style.js'].lineData[555]++;
      val = getWH.apply(undefined, args);
    } else {
      _$jscoverage['/base/style.js'].lineData[557]++;
      swap(elem, cssShow, function() {
  _$jscoverage['/base/style.js'].functionData[23]++;
  _$jscoverage['/base/style.js'].lineData[558]++;
  val = getWH.apply(undefined, args);
});
    }
    _$jscoverage['/base/style.js'].lineData[561]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[564]++;
  function getPBMWidth(elem, props, which, computedStyle) {
    _$jscoverage['/base/style.js'].functionData[24]++;
    _$jscoverage['/base/style.js'].lineData[565]++;
    var value = 0, prop, j, i;
    _$jscoverage['/base/style.js'].lineData[566]++;
    for (j = 0; visit479_566_1(j < props.length); j++) {
      _$jscoverage['/base/style.js'].lineData[567]++;
      prop = props[j];
      _$jscoverage['/base/style.js'].lineData[568]++;
      if (visit480_568_1(prop)) {
        _$jscoverage['/base/style.js'].lineData[569]++;
        for (i = 0; visit481_569_1(i < which.length); i++) {
          _$jscoverage['/base/style.js'].lineData[570]++;
          var cssProp;
          _$jscoverage['/base/style.js'].lineData[571]++;
          if (visit482_571_1(prop === 'border')) {
            _$jscoverage['/base/style.js'].lineData[572]++;
            cssProp = prop + which[i] + 'Width';
          } else {
            _$jscoverage['/base/style.js'].lineData[574]++;
            cssProp = prop + which[i];
          }
          _$jscoverage['/base/style.js'].lineData[576]++;
          value += visit483_576_1(parseFloat(Dom._getComputedStyle(elem, cssProp, computedStyle)) || 0);
        }
      }
    }
    _$jscoverage['/base/style.js'].lineData[580]++;
    return value;
  }
  _$jscoverage['/base/style.js'].lineData[583]++;
  function isBorderBoxFn(elem, computedStyle) {
    _$jscoverage['/base/style.js'].functionData[25]++;
    _$jscoverage['/base/style.js'].lineData[584]++;
    return visit484_584_1(Dom._getComputedStyle(elem, 'boxSizing', computedStyle) === 'border-box');
  }
  _$jscoverage['/base/style.js'].lineData[587]++;
  function getComputedStyle(elem) {
    _$jscoverage['/base/style.js'].functionData[26]++;
    _$jscoverage['/base/style.js'].lineData[588]++;
    var doc = elem.ownerDocument, computedStyle;
    _$jscoverage['/base/style.js'].lineData[590]++;
    if (visit485_590_1(doc.defaultView)) {
      _$jscoverage['/base/style.js'].lineData[592]++;
      computedStyle = doc.defaultView.getComputedStyle(elem, null);
    }
    _$jscoverage['/base/style.js'].lineData[594]++;
    return computedStyle;
  }
  _$jscoverage['/base/style.js'].lineData[605]++;
  function getWH(elem, name, extra) {
    _$jscoverage['/base/style.js'].functionData[27]++;
    _$jscoverage['/base/style.js'].lineData[606]++;
    if (visit486_606_1(S.isWindow(elem))) {
      _$jscoverage['/base/style.js'].lineData[607]++;
      return visit487_607_1(name === WIDTH) ? Dom.viewportWidth(elem) : Dom.viewportHeight(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[608]++;
      if (visit488_608_1(elem.nodeType === 9)) {
        _$jscoverage['/base/style.js'].lineData[609]++;
        return visit489_609_1(name === WIDTH) ? Dom.docWidth(elem) : Dom.docHeight(elem);
      }
    }
    _$jscoverage['/base/style.js'].lineData[611]++;
    var which = visit490_611_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'], borderBoxValue = visit491_612_1(name === WIDTH) ? elem.offsetWidth : elem.offsetHeight;
    _$jscoverage['/base/style.js'].lineData[613]++;
    var computedStyle = getComputedStyle(elem);
    _$jscoverage['/base/style.js'].lineData[614]++;
    var isBorderBox = isBorderBoxFn(elem, computedStyle);
    _$jscoverage['/base/style.js'].lineData[615]++;
    var cssBoxValue = 0;
    _$jscoverage['/base/style.js'].lineData[616]++;
    if (visit492_616_1(visit493_616_2(borderBoxValue == null) || visit494_616_3(borderBoxValue <= 0))) {
      _$jscoverage['/base/style.js'].lineData[617]++;
      borderBoxValue = undefined;
      _$jscoverage['/base/style.js'].lineData[619]++;
      cssBoxValue = Dom._getComputedStyle(elem, name, computedStyle);
      _$jscoverage['/base/style.js'].lineData[620]++;
      if (visit495_620_1(visit496_620_2(cssBoxValue == null) || visit497_620_3((Number(cssBoxValue)) < 0))) {
        _$jscoverage['/base/style.js'].lineData[621]++;
        cssBoxValue = visit498_621_1(elem.style[name] || 0);
      }
      _$jscoverage['/base/style.js'].lineData[624]++;
      cssBoxValue = visit499_624_1(parseFloat(cssBoxValue) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[626]++;
    if (visit500_626_1(extra === undefined)) {
      _$jscoverage['/base/style.js'].lineData[627]++;
      extra = isBorderBox ? BORDER_INDEX : CONTENT_INDEX;
    }
    _$jscoverage['/base/style.js'].lineData[629]++;
    var borderBoxValueOrIsBorderBox = visit501_629_1(visit502_629_2(borderBoxValue !== undefined) || isBorderBox);
    _$jscoverage['/base/style.js'].lineData[630]++;
    var val = visit503_630_1(borderBoxValue || cssBoxValue);
    _$jscoverage['/base/style.js'].lineData[631]++;
    if (visit504_631_1(extra === CONTENT_INDEX)) {
      _$jscoverage['/base/style.js'].lineData[632]++;
      if (visit505_632_1(borderBoxValueOrIsBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[633]++;
        return val - getPBMWidth(elem, ['border', 'padding'], which, computedStyle);
      } else {
        _$jscoverage['/base/style.js'].lineData[636]++;
        return cssBoxValue;
      }
    } else {
      _$jscoverage['/base/style.js'].lineData[638]++;
      if (visit506_638_1(borderBoxValueOrIsBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[639]++;
        return val + (visit507_639_1(extra === BORDER_INDEX) ? 0 : (visit508_640_1(extra === PADDING_INDEX) ? -getPBMWidth(elem, ['border'], which, computedStyle) : getPBMWidth(elem, ['margin'], which, computedStyle)));
      } else {
        _$jscoverage['/base/style.js'].lineData[644]++;
        return cssBoxValue + getPBMWidth(elem, BOX_MODELS.slice(extra), which, computedStyle);
      }
    }
  }
  _$jscoverage['/base/style.js'].lineData[649]++;
  var ROOT_REG = /^(?:body|html)$/i;
  _$jscoverage['/base/style.js'].lineData[651]++;
  function getPosition(el) {
    _$jscoverage['/base/style.js'].functionData[28]++;
    _$jscoverage['/base/style.js'].lineData[652]++;
    var offsetParent, offset, parentOffset = {
  top: 0, 
  left: 0};
    _$jscoverage['/base/style.js'].lineData[656]++;
    if (visit509_656_1(Dom.css(el, 'position') === 'fixed')) {
      _$jscoverage['/base/style.js'].lineData[657]++;
      offset = el.getBoundingClientRect();
    } else {
      _$jscoverage['/base/style.js'].lineData[662]++;
      offsetParent = getOffsetParent(el);
      _$jscoverage['/base/style.js'].lineData[663]++;
      offset = Dom.offset(el);
      _$jscoverage['/base/style.js'].lineData[664]++;
      parentOffset = Dom.offset(offsetParent);
      _$jscoverage['/base/style.js'].lineData[665]++;
      parentOffset.top += visit510_665_1(parseFloat(Dom.css(offsetParent, 'borderTopWidth')) || 0);
      _$jscoverage['/base/style.js'].lineData[666]++;
      parentOffset.left += visit511_666_1(parseFloat(Dom.css(offsetParent, 'borderLeftWidth')) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[669]++;
    offset.top -= visit512_669_1(parseFloat(Dom.css(el, 'marginTop')) || 0);
    _$jscoverage['/base/style.js'].lineData[670]++;
    offset.left -= visit513_670_1(parseFloat(Dom.css(el, 'marginLeft')) || 0);
    _$jscoverage['/base/style.js'].lineData[674]++;
    return {
  top: offset.top - parentOffset.top, 
  left: offset.left - parentOffset.left};
  }
  _$jscoverage['/base/style.js'].lineData[680]++;
  function getOffsetParent(el) {
    _$jscoverage['/base/style.js'].functionData[29]++;
    _$jscoverage['/base/style.js'].lineData[681]++;
    var offsetParent = visit514_681_1(el.offsetParent || (visit515_681_2(el.ownerDocument || doc)).body);
    _$jscoverage['/base/style.js'].lineData[682]++;
    while (visit516_682_1(offsetParent && visit517_682_2(!ROOT_REG.test(offsetParent.nodeName) && visit518_683_1(Dom.css(offsetParent, 'position') === 'static')))) {
      _$jscoverage['/base/style.js'].lineData[684]++;
      offsetParent = offsetParent.offsetParent;
    }
    _$jscoverage['/base/style.js'].lineData[686]++;
    return offsetParent;
  }
  _$jscoverage['/base/style.js'].lineData[689]++;
  return Dom;
});
