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
  _$jscoverage['/base/style.js'].lineData[43] = 0;
  _$jscoverage['/base/style.js'].lineData[44] = 0;
  _$jscoverage['/base/style.js'].lineData[45] = 0;
  _$jscoverage['/base/style.js'].lineData[46] = 0;
  _$jscoverage['/base/style.js'].lineData[49] = 0;
  _$jscoverage['/base/style.js'].lineData[50] = 0;
  _$jscoverage['/base/style.js'].lineData[53] = 0;
  _$jscoverage['/base/style.js'].lineData[54] = 0;
  _$jscoverage['/base/style.js'].lineData[57] = 0;
  _$jscoverage['/base/style.js'].lineData[59] = 0;
  _$jscoverage['/base/style.js'].lineData[62] = 0;
  _$jscoverage['/base/style.js'].lineData[63] = 0;
  _$jscoverage['/base/style.js'].lineData[66] = 0;
  _$jscoverage['/base/style.js'].lineData[67] = 0;
  _$jscoverage['/base/style.js'].lineData[68] = 0;
  _$jscoverage['/base/style.js'].lineData[70] = 0;
  _$jscoverage['/base/style.js'].lineData[71] = 0;
  _$jscoverage['/base/style.js'].lineData[72] = 0;
  _$jscoverage['/base/style.js'].lineData[74] = 0;
  _$jscoverage['/base/style.js'].lineData[76] = 0;
  _$jscoverage['/base/style.js'].lineData[79] = 0;
  _$jscoverage['/base/style.js'].lineData[93] = 0;
  _$jscoverage['/base/style.js'].lineData[101] = 0;
  _$jscoverage['/base/style.js'].lineData[104] = 0;
  _$jscoverage['/base/style.js'].lineData[105] = 0;
  _$jscoverage['/base/style.js'].lineData[109] = 0;
  _$jscoverage['/base/style.js'].lineData[110] = 0;
  _$jscoverage['/base/style.js'].lineData[114] = 0;
  _$jscoverage['/base/style.js'].lineData[115] = 0;
  _$jscoverage['/base/style.js'].lineData[116] = 0;
  _$jscoverage['/base/style.js'].lineData[117] = 0;
  _$jscoverage['/base/style.js'].lineData[118] = 0;
  _$jscoverage['/base/style.js'].lineData[120] = 0;
  _$jscoverage['/base/style.js'].lineData[121] = 0;
  _$jscoverage['/base/style.js'].lineData[123] = 0;
  _$jscoverage['/base/style.js'].lineData[124] = 0;
  _$jscoverage['/base/style.js'].lineData[125] = 0;
  _$jscoverage['/base/style.js'].lineData[128] = 0;
  _$jscoverage['/base/style.js'].lineData[141] = 0;
  _$jscoverage['/base/style.js'].lineData[146] = 0;
  _$jscoverage['/base/style.js'].lineData[147] = 0;
  _$jscoverage['/base/style.js'].lineData[148] = 0;
  _$jscoverage['/base/style.js'].lineData[149] = 0;
  _$jscoverage['/base/style.js'].lineData[152] = 0;
  _$jscoverage['/base/style.js'].lineData[154] = 0;
  _$jscoverage['/base/style.js'].lineData[155] = 0;
  _$jscoverage['/base/style.js'].lineData[156] = 0;
  _$jscoverage['/base/style.js'].lineData[157] = 0;
  _$jscoverage['/base/style.js'].lineData[159] = 0;
  _$jscoverage['/base/style.js'].lineData[161] = 0;
  _$jscoverage['/base/style.js'].lineData[162] = 0;
  _$jscoverage['/base/style.js'].lineData[165] = 0;
  _$jscoverage['/base/style.js'].lineData[178] = 0;
  _$jscoverage['/base/style.js'].lineData[185] = 0;
  _$jscoverage['/base/style.js'].lineData[186] = 0;
  _$jscoverage['/base/style.js'].lineData[187] = 0;
  _$jscoverage['/base/style.js'].lineData[188] = 0;
  _$jscoverage['/base/style.js'].lineData[191] = 0;
  _$jscoverage['/base/style.js'].lineData[194] = 0;
  _$jscoverage['/base/style.js'].lineData[195] = 0;
  _$jscoverage['/base/style.js'].lineData[197] = 0;
  _$jscoverage['/base/style.js'].lineData[199] = 0;
  _$jscoverage['/base/style.js'].lineData[200] = 0;
  _$jscoverage['/base/style.js'].lineData[202] = 0;
  _$jscoverage['/base/style.js'].lineData[204] = 0;
  _$jscoverage['/base/style.js'].lineData[207] = 0;
  _$jscoverage['/base/style.js'].lineData[211] = 0;
  _$jscoverage['/base/style.js'].lineData[212] = 0;
  _$jscoverage['/base/style.js'].lineData[215] = 0;
  _$jscoverage['/base/style.js'].lineData[223] = 0;
  _$jscoverage['/base/style.js'].lineData[227] = 0;
  _$jscoverage['/base/style.js'].lineData[228] = 0;
  _$jscoverage['/base/style.js'].lineData[229] = 0;
  _$jscoverage['/base/style.js'].lineData[231] = 0;
  _$jscoverage['/base/style.js'].lineData[232] = 0;
  _$jscoverage['/base/style.js'].lineData[233] = 0;
  _$jscoverage['/base/style.js'].lineData[234] = 0;
  _$jscoverage['/base/style.js'].lineData[235] = 0;
  _$jscoverage['/base/style.js'].lineData[245] = 0;
  _$jscoverage['/base/style.js'].lineData[247] = 0;
  _$jscoverage['/base/style.js'].lineData[248] = 0;
  _$jscoverage['/base/style.js'].lineData[249] = 0;
  _$jscoverage['/base/style.js'].lineData[251] = 0;
  _$jscoverage['/base/style.js'].lineData[252] = 0;
  _$jscoverage['/base/style.js'].lineData[253] = 0;
  _$jscoverage['/base/style.js'].lineData[255] = 0;
  _$jscoverage['/base/style.js'].lineData[265] = 0;
  _$jscoverage['/base/style.js'].lineData[267] = 0;
  _$jscoverage['/base/style.js'].lineData[268] = 0;
  _$jscoverage['/base/style.js'].lineData[269] = 0;
  _$jscoverage['/base/style.js'].lineData[270] = 0;
  _$jscoverage['/base/style.js'].lineData[272] = 0;
  _$jscoverage['/base/style.js'].lineData[286] = 0;
  _$jscoverage['/base/style.js'].lineData[287] = 0;
  _$jscoverage['/base/style.js'].lineData[288] = 0;
  _$jscoverage['/base/style.js'].lineData[290] = 0;
  _$jscoverage['/base/style.js'].lineData[293] = 0;
  _$jscoverage['/base/style.js'].lineData[296] = 0;
  _$jscoverage['/base/style.js'].lineData[297] = 0;
  _$jscoverage['/base/style.js'].lineData[301] = 0;
  _$jscoverage['/base/style.js'].lineData[302] = 0;
  _$jscoverage['/base/style.js'].lineData[305] = 0;
  _$jscoverage['/base/style.js'].lineData[308] = 0;
  _$jscoverage['/base/style.js'].lineData[310] = 0;
  _$jscoverage['/base/style.js'].lineData[311] = 0;
  _$jscoverage['/base/style.js'].lineData[313] = 0;
  _$jscoverage['/base/style.js'].lineData[322] = 0;
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
  _$jscoverage['/base/style.js'].lineData[342] = 0;
  _$jscoverage['/base/style.js'].lineData[343] = 0;
  _$jscoverage['/base/style.js'].lineData[344] = 0;
  _$jscoverage['/base/style.js'].lineData[405] = 0;
  _$jscoverage['/base/style.js'].lineData[406] = 0;
  _$jscoverage['/base/style.js'].lineData[407] = 0;
  _$jscoverage['/base/style.js'].lineData[408] = 0;
  _$jscoverage['/base/style.js'].lineData[411] = 0;
  _$jscoverage['/base/style.js'].lineData[412] = 0;
  _$jscoverage['/base/style.js'].lineData[413] = 0;
  _$jscoverage['/base/style.js'].lineData[416] = 0;
  _$jscoverage['/base/style.js'].lineData[417] = 0;
  _$jscoverage['/base/style.js'].lineData[418] = 0;
  _$jscoverage['/base/style.js'].lineData[419] = 0;
  _$jscoverage['/base/style.js'].lineData[421] = 0;
  _$jscoverage['/base/style.js'].lineData[427] = 0;
  _$jscoverage['/base/style.js'].lineData[432] = 0;
  _$jscoverage['/base/style.js'].lineData[433] = 0;
  _$jscoverage['/base/style.js'].lineData[434] = 0;
  _$jscoverage['/base/style.js'].lineData[436] = 0;
  _$jscoverage['/base/style.js'].lineData[441] = 0;
  _$jscoverage['/base/style.js'].lineData[443] = 0;
  _$jscoverage['/base/style.js'].lineData[444] = 0;
  _$jscoverage['/base/style.js'].lineData[446] = 0;
  _$jscoverage['/base/style.js'].lineData[449] = 0;
  _$jscoverage['/base/style.js'].lineData[450] = 0;
  _$jscoverage['/base/style.js'].lineData[451] = 0;
  _$jscoverage['/base/style.js'].lineData[452] = 0;
  _$jscoverage['/base/style.js'].lineData[454] = 0;
  _$jscoverage['/base/style.js'].lineData[455] = 0;
  _$jscoverage['/base/style.js'].lineData[456] = 0;
  _$jscoverage['/base/style.js'].lineData[457] = 0;
  _$jscoverage['/base/style.js'].lineData[459] = 0;
  _$jscoverage['/base/style.js'].lineData[460] = 0;
  _$jscoverage['/base/style.js'].lineData[463] = 0;
  _$jscoverage['/base/style.js'].lineData[468] = 0;
  _$jscoverage['/base/style.js'].lineData[469] = 0;
  _$jscoverage['/base/style.js'].lineData[474] = 0;
  _$jscoverage['/base/style.js'].lineData[475] = 0;
  _$jscoverage['/base/style.js'].lineData[476] = 0;
  _$jscoverage['/base/style.js'].lineData[479] = 0;
  _$jscoverage['/base/style.js'].lineData[482] = 0;
  _$jscoverage['/base/style.js'].lineData[483] = 0;
  _$jscoverage['/base/style.js'].lineData[487] = 0;
  _$jscoverage['/base/style.js'].lineData[488] = 0;
  _$jscoverage['/base/style.js'].lineData[491] = 0;
  _$jscoverage['/base/style.js'].lineData[493] = 0;
  _$jscoverage['/base/style.js'].lineData[495] = 0;
  _$jscoverage['/base/style.js'].lineData[496] = 0;
  _$jscoverage['/base/style.js'].lineData[497] = 0;
  _$jscoverage['/base/style.js'].lineData[499] = 0;
  _$jscoverage['/base/style.js'].lineData[501] = 0;
  _$jscoverage['/base/style.js'].lineData[502] = 0;
  _$jscoverage['/base/style.js'].lineData[505] = 0;
  _$jscoverage['/base/style.js'].lineData[506] = 0;
  _$jscoverage['/base/style.js'].lineData[508] = 0;
  _$jscoverage['/base/style.js'].lineData[509] = 0;
  _$jscoverage['/base/style.js'].lineData[511] = 0;
  _$jscoverage['/base/style.js'].lineData[513] = 0;
  _$jscoverage['/base/style.js'].lineData[515] = 0;
  _$jscoverage['/base/style.js'].lineData[517] = 0;
  _$jscoverage['/base/style.js'].lineData[520] = 0;
  _$jscoverage['/base/style.js'].lineData[521] = 0;
  _$jscoverage['/base/style.js'].lineData[524] = 0;
  _$jscoverage['/base/style.js'].lineData[527] = 0;
  _$jscoverage['/base/style.js'].lineData[528] = 0;
  _$jscoverage['/base/style.js'].lineData[530] = 0;
  _$jscoverage['/base/style.js'].lineData[535] = 0;
  _$jscoverage['/base/style.js'].lineData[539] = 0;
  _$jscoverage['/base/style.js'].lineData[541] = 0;
  _$jscoverage['/base/style.js'].lineData[546] = 0;
  _$jscoverage['/base/style.js'].lineData[547] = 0;
  _$jscoverage['/base/style.js'].lineData[550] = 0;
  _$jscoverage['/base/style.js'].lineData[551] = 0;
  _$jscoverage['/base/style.js'].lineData[553] = 0;
  _$jscoverage['/base/style.js'].lineData[554] = 0;
  _$jscoverage['/base/style.js'].lineData[557] = 0;
  _$jscoverage['/base/style.js'].lineData[569] = 0;
  _$jscoverage['/base/style.js'].lineData[570] = 0;
  _$jscoverage['/base/style.js'].lineData[571] = 0;
  _$jscoverage['/base/style.js'].lineData[572] = 0;
  _$jscoverage['/base/style.js'].lineData[573] = 0;
  _$jscoverage['/base/style.js'].lineData[575] = 0;
  _$jscoverage['/base/style.js'].lineData[578] = 0;
  _$jscoverage['/base/style.js'].lineData[579] = 0;
  _$jscoverage['/base/style.js'].lineData[580] = 0;
  _$jscoverage['/base/style.js'].lineData[581] = 0;
  _$jscoverage['/base/style.js'].lineData[582] = 0;
  _$jscoverage['/base/style.js'].lineData[584] = 0;
  _$jscoverage['/base/style.js'].lineData[585] = 0;
  _$jscoverage['/base/style.js'].lineData[587] = 0;
  _$jscoverage['/base/style.js'].lineData[592] = 0;
  _$jscoverage['/base/style.js'].lineData[596] = 0;
  _$jscoverage['/base/style.js'].lineData[597] = 0;
  _$jscoverage['/base/style.js'].lineData[598] = 0;
  _$jscoverage['/base/style.js'].lineData[601] = 0;
  _$jscoverage['/base/style.js'].lineData[604] = 0;
  _$jscoverage['/base/style.js'].lineData[605] = 0;
  _$jscoverage['/base/style.js'].lineData[606] = 0;
  _$jscoverage['/base/style.js'].lineData[607] = 0;
  _$jscoverage['/base/style.js'].lineData[608] = 0;
  _$jscoverage['/base/style.js'].lineData[610] = 0;
  _$jscoverage['/base/style.js'].lineData[611] = 0;
  _$jscoverage['/base/style.js'].lineData[616] = 0;
  _$jscoverage['/base/style.js'].lineData[619] = 0;
  _$jscoverage['/base/style.js'].lineData[621] = 0;
  _$jscoverage['/base/style.js'].lineData[622] = 0;
  _$jscoverage['/base/style.js'].lineData[626] = 0;
  _$jscoverage['/base/style.js'].lineData[627] = 0;
  _$jscoverage['/base/style.js'].lineData[632] = 0;
  _$jscoverage['/base/style.js'].lineData[633] = 0;
  _$jscoverage['/base/style.js'].lineData[634] = 0;
  _$jscoverage['/base/style.js'].lineData[635] = 0;
  _$jscoverage['/base/style.js'].lineData[636] = 0;
  _$jscoverage['/base/style.js'].lineData[639] = 0;
  _$jscoverage['/base/style.js'].lineData[640] = 0;
  _$jscoverage['/base/style.js'].lineData[644] = 0;
  _$jscoverage['/base/style.js'].lineData[650] = 0;
  _$jscoverage['/base/style.js'].lineData[651] = 0;
  _$jscoverage['/base/style.js'].lineData[652] = 0;
  _$jscoverage['/base/style.js'].lineData[654] = 0;
  _$jscoverage['/base/style.js'].lineData[656] = 0;
  _$jscoverage['/base/style.js'].lineData[659] = 0;
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
}
if (! _$jscoverage['/base/style.js'].branchData) {
  _$jscoverage['/base/style.js'].branchData = {};
  _$jscoverage['/base/style.js'].branchData['43'] = [];
  _$jscoverage['/base/style.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['49'] = [];
  _$jscoverage['/base/style.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['66'] = [];
  _$jscoverage['/base/style.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['67'] = [];
  _$jscoverage['/base/style.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['101'] = [];
  _$jscoverage['/base/style.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['104'] = [];
  _$jscoverage['/base/style.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['105'] = [];
  _$jscoverage['/base/style.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['109'] = [];
  _$jscoverage['/base/style.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['109'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['114'] = [];
  _$jscoverage['/base/style.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['146'] = [];
  _$jscoverage['/base/style.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['148'] = [];
  _$jscoverage['/base/style.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['154'] = [];
  _$jscoverage['/base/style.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['156'] = [];
  _$jscoverage['/base/style.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['161'] = [];
  _$jscoverage['/base/style.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['185'] = [];
  _$jscoverage['/base/style.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['187'] = [];
  _$jscoverage['/base/style.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['197'] = [];
  _$jscoverage['/base/style.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['200'] = [];
  _$jscoverage['/base/style.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['202'] = [];
  _$jscoverage['/base/style.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['202'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['202'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['207'] = [];
  _$jscoverage['/base/style.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['211'] = [];
  _$jscoverage['/base/style.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['227'] = [];
  _$jscoverage['/base/style.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['229'] = [];
  _$jscoverage['/base/style.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['231'] = [];
  _$jscoverage['/base/style.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['247'] = [];
  _$jscoverage['/base/style.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['251'] = [];
  _$jscoverage['/base/style.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['252'] = [];
  _$jscoverage['/base/style.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['267'] = [];
  _$jscoverage['/base/style.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['269'] = [];
  _$jscoverage['/base/style.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['286'] = [];
  _$jscoverage['/base/style.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['296'] = [];
  _$jscoverage['/base/style.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['301'] = [];
  _$jscoverage['/base/style.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['310'] = [];
  _$jscoverage['/base/style.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['330'] = [];
  _$jscoverage['/base/style.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['334'] = [];
  _$jscoverage['/base/style.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['336'] = [];
  _$jscoverage['/base/style.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['338'] = [];
  _$jscoverage['/base/style.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['343'] = [];
  _$jscoverage['/base/style.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['408'] = [];
  _$jscoverage['/base/style.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['413'] = [];
  _$jscoverage['/base/style.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['418'] = [];
  _$jscoverage['/base/style.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['433'] = [];
  _$jscoverage['/base/style.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['449'] = [];
  _$jscoverage['/base/style.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['451'] = [];
  _$jscoverage['/base/style.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['455'] = [];
  _$jscoverage['/base/style.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['456'] = [];
  _$jscoverage['/base/style.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['456'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['459'] = [];
  _$jscoverage['/base/style.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['491'] = [];
  _$jscoverage['/base/style.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['491'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['492'] = [];
  _$jscoverage['/base/style.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['492'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['497'] = [];
  _$jscoverage['/base/style.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['499'] = [];
  _$jscoverage['/base/style.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['501'] = [];
  _$jscoverage['/base/style.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['501'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['501'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['505'] = [];
  _$jscoverage['/base/style.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['508'] = [];
  _$jscoverage['/base/style.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['511'] = [];
  _$jscoverage['/base/style.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['520'] = [];
  _$jscoverage['/base/style.js'].branchData['520'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['520'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['524'] = [];
  _$jscoverage['/base/style.js'].branchData['524'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['527'] = [];
  _$jscoverage['/base/style.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['535'] = [];
  _$jscoverage['/base/style.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['535'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['535'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['541'] = [];
  _$jscoverage['/base/style.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['550'] = [];
  _$jscoverage['/base/style.js'].branchData['550'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['570'] = [];
  _$jscoverage['/base/style.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['571'] = [];
  _$jscoverage['/base/style.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['572'] = [];
  _$jscoverage['/base/style.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['573'] = [];
  _$jscoverage['/base/style.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['575'] = [];
  _$jscoverage['/base/style.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['576'] = [];
  _$jscoverage['/base/style.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['578'] = [];
  _$jscoverage['/base/style.js'].branchData['578'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['579'] = [];
  _$jscoverage['/base/style.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['581'] = [];
  _$jscoverage['/base/style.js'].branchData['581'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['582'] = [];
  _$jscoverage['/base/style.js'].branchData['582'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['584'] = [];
  _$jscoverage['/base/style.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['585'] = [];
  _$jscoverage['/base/style.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['587'] = [];
  _$jscoverage['/base/style.js'].branchData['587'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['597'] = [];
  _$jscoverage['/base/style.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['597'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['597'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['598'] = [];
  _$jscoverage['/base/style.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['601'] = [];
  _$jscoverage['/base/style.js'].branchData['601'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['604'] = [];
  _$jscoverage['/base/style.js'].branchData['604'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['606'] = [];
  _$jscoverage['/base/style.js'].branchData['606'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['607'] = [];
  _$jscoverage['/base/style.js'].branchData['607'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['608'] = [];
  _$jscoverage['/base/style.js'].branchData['608'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['610'] = [];
  _$jscoverage['/base/style.js'].branchData['610'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['611'] = [];
  _$jscoverage['/base/style.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['626'] = [];
  _$jscoverage['/base/style.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['635'] = [];
  _$jscoverage['/base/style.js'].branchData['635'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['636'] = [];
  _$jscoverage['/base/style.js'].branchData['636'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['639'] = [];
  _$jscoverage['/base/style.js'].branchData['639'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['640'] = [];
  _$jscoverage['/base/style.js'].branchData['640'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['651'] = [];
  _$jscoverage['/base/style.js'].branchData['651'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['651'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['652'] = [];
  _$jscoverage['/base/style.js'].branchData['652'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['652'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['653'] = [];
  _$jscoverage['/base/style.js'].branchData['653'][1] = new BranchData();
}
_$jscoverage['/base/style.js'].branchData['653'][1].init(53, 46, 'Dom.css(offsetParent, "position") === "static"');
function visit499_653_1(result) {
  _$jscoverage['/base/style.js'].branchData['653'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['652'][2].init(113, 100, '!ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, "position") === "static"');
function visit498_652_2(result) {
  _$jscoverage['/base/style.js'].branchData['652'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['652'][1].init(97, 116, 'offsetParent && !ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, "position") === "static"');
function visit497_652_1(result) {
  _$jscoverage['/base/style.js'].branchData['652'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['651'][2].init(50, 23, 'el.ownerDocument || doc');
function visit496_651_2(result) {
  _$jscoverage['/base/style.js'].branchData['651'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['651'][1].init(29, 50, 'el.offsetParent || (el.ownerDocument || doc).body');
function visit495_651_1(result) {
  _$jscoverage['/base/style.js'].branchData['651'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['640'][1].init(826, 42, 'parseFloat(Dom.css(el, "marginLeft")) || 0');
function visit494_640_1(result) {
  _$jscoverage['/base/style.js'].branchData['640'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['639'][1].init(759, 41, 'parseFloat(Dom.css(el, "marginTop")) || 0');
function visit493_639_1(result) {
  _$jscoverage['/base/style.js'].branchData['639'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['636'][1].init(446, 57, 'parseFloat(Dom.css(offsetParent, "borderLeftWidth")) || 0');
function visit492_636_1(result) {
  _$jscoverage['/base/style.js'].branchData['636'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['635'][1].init(354, 56, 'parseFloat(Dom.css(offsetParent, "borderTopWidth")) || 0');
function visit491_635_1(result) {
  _$jscoverage['/base/style.js'].branchData['635'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['626'][1].init(113, 34, 'Dom.css(el, \'position\') == \'fixed\'');
function visit490_626_1(result) {
  _$jscoverage['/base/style.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['611'][1].init(29, 41, 'parseFloat(Dom.css(elem, extra + w)) || 0');
function visit489_611_1(result) {
  _$jscoverage['/base/style.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['610'][1].init(240, 18, 'extra === \'margin\'');
function visit488_610_1(result) {
  _$jscoverage['/base/style.js'].branchData['610'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['608'][1].init(29, 54, 'parseFloat(Dom.css(elem, \'border\' + w + \'Width\')) || 0');
function visit487_608_1(result) {
  _$jscoverage['/base/style.js'].branchData['608'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['607'][1].init(93, 19, 'extra !== \'padding\'');
function visit486_607_1(result) {
  _$jscoverage['/base/style.js'].branchData['607'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['606'][1].init(25, 45, 'parseFloat(Dom.css(elem, \'padding\' + w)) || 0');
function visit485_606_1(result) {
  _$jscoverage['/base/style.js'].branchData['606'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['604'][1].init(1359, 5, 'extra');
function visit484_604_1(result) {
  _$jscoverage['/base/style.js'].branchData['604'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['601'][1].init(1282, 20, 'parseFloat(val) || 0');
function visit483_601_1(result) {
  _$jscoverage['/base/style.js'].branchData['601'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['598'][1].init(20, 23, 'elem.style[name] || 0');
function visit482_598_1(result) {
  _$jscoverage['/base/style.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['597'][3].init(1138, 16, '(Number(val)) < 0');
function visit481_597_3(result) {
  _$jscoverage['/base/style.js'].branchData['597'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['597'][2].init(1122, 11, 'val == null');
function visit480_597_2(result) {
  _$jscoverage['/base/style.js'].branchData['597'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['597'][1].init(1122, 32, 'val == null || (Number(val)) < 0');
function visit479_597_1(result) {
  _$jscoverage['/base/style.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['587'][1].init(33, 54, 'parseFloat(Dom.css(elem, \'border\' + w + \'Width\')) || 0');
function visit478_587_1(result) {
  _$jscoverage['/base/style.js'].branchData['587'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['585'][1].init(33, 41, 'parseFloat(Dom.css(elem, extra + w)) || 0');
function visit477_585_1(result) {
  _$jscoverage['/base/style.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['584'][1].init(163, 18, 'extra === \'margin\'');
function visit476_584_1(result) {
  _$jscoverage['/base/style.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['582'][1].init(33, 45, 'parseFloat(Dom.css(elem, \'padding\' + w)) || 0');
function visit475_582_1(result) {
  _$jscoverage['/base/style.js'].branchData['582'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['581'][1].init(26, 6, '!extra');
function visit474_581_1(result) {
  _$jscoverage['/base/style.js'].branchData['581'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['579'][1].init(18, 18, 'extra !== \'border\'');
function visit473_579_1(result) {
  _$jscoverage['/base/style.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['578'][1].init(419, 7, 'val > 0');
function visit472_578_1(result) {
  _$jscoverage['/base/style.js'].branchData['578'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['576'][1].init(86, 14, 'name === WIDTH');
function visit471_576_1(result) {
  _$jscoverage['/base/style.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['575'][1].init(274, 14, 'name === WIDTH');
function visit470_575_1(result) {
  _$jscoverage['/base/style.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['573'][1].init(21, 13, 'name == WIDTH');
function visit469_573_1(result) {
  _$jscoverage['/base/style.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['572'][1].init(143, 18, 'elem.nodeType == 9');
function visit468_572_1(result) {
  _$jscoverage['/base/style.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['571'][1].init(21, 13, 'name == WIDTH');
function visit467_571_1(result) {
  _$jscoverage['/base/style.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['570'][1].init(14, 16, 'S.isWindow(elem)');
function visit466_570_1(result) {
  _$jscoverage['/base/style.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['550'][1].init(128, 22, 'elem.offsetWidth !== 0');
function visit465_550_1(result) {
  _$jscoverage['/base/style.js'].branchData['550'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['541'][1].init(335, 17, 'ret === undefined');
function visit464_541_1(result) {
  _$jscoverage['/base/style.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['535'][3].init(121, 42, '(ret = hook.get(elem, false)) !== undefined');
function visit463_535_3(result) {
  _$jscoverage['/base/style.js'].branchData['535'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['535'][2].init(103, 60, '\'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit462_535_2(result) {
  _$jscoverage['/base/style.js'].branchData['535'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['535'][1].init(95, 68, 'hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit461_535_1(result) {
  _$jscoverage['/base/style.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['527'][1].init(136, 37, 'UA.webkit && (style = elem.outerHTML)');
function visit460_527_1(result) {
  _$jscoverage['/base/style.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['524'][1].init(876, 14, '!style.cssText');
function visit459_524_1(result) {
  _$jscoverage['/base/style.js'].branchData['524'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['520'][2].init(308, 13, 'val === EMPTY');
function visit458_520_2(result) {
  _$jscoverage['/base/style.js'].branchData['520'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['520'][1].init(308, 38, 'val === EMPTY && style.removeAttribute');
function visit457_520_1(result) {
  _$jscoverage['/base/style.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['511'][1].init(405, 17, 'val !== undefined');
function visit456_511_1(result) {
  _$jscoverage['/base/style.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['508'][1].init(309, 16, 'hook && hook.set');
function visit455_508_1(result) {
  _$jscoverage['/base/style.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['505'][1].init(197, 39, '!isNaN(Number(val)) && !cssNumber[name]');
function visit454_505_1(result) {
  _$jscoverage['/base/style.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['501'][3].init(66, 13, 'val === EMPTY');
function visit453_501_3(result) {
  _$jscoverage['/base/style.js'].branchData['501'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['501'][2].init(50, 12, 'val === null');
function visit452_501_2(result) {
  _$jscoverage['/base/style.js'].branchData['501'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['501'][1].init(50, 29, 'val === null || val === EMPTY');
function visit451_501_1(result) {
  _$jscoverage['/base/style.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['499'][1].init(334, 17, 'val !== undefined');
function visit450_499_1(result) {
  _$jscoverage['/base/style.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['497'][1].init(278, 22, 'cssProps[name] || name');
function visit449_497_1(result) {
  _$jscoverage['/base/style.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['492'][2].init(109, 19, 'elem.nodeType === 8');
function visit448_492_2(result) {
  _$jscoverage['/base/style.js'].branchData['492'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['492'][1].init(35, 44, 'elem.nodeType === 8 || !(style = elem.style)');
function visit447_492_1(result) {
  _$jscoverage['/base/style.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['491'][2].init(71, 19, 'elem.nodeType === 3');
function visit446_491_2(result) {
  _$jscoverage['/base/style.js'].branchData['491'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['491'][1].init(71, 80, 'elem.nodeType === 3 || elem.nodeType === 8 || !(style = elem.style)');
function visit445_491_1(result) {
  _$jscoverage['/base/style.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['459'][1].init(442, 37, 'isAutoPosition || NO_PX_REG.test(val)');
function visit444_459_1(result) {
  _$jscoverage['/base/style.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['456'][2].init(328, 23, 'position === "relative"');
function visit443_456_2(result) {
  _$jscoverage['/base/style.js'].branchData['456'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['456'][1].init(310, 41, 'isAutoPosition && position === "relative"');
function visit442_456_1(result) {
  _$jscoverage['/base/style.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['455'][1].init(269, 14, 'val === "auto"');
function visit441_455_1(result) {
  _$jscoverage['/base/style.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['451'][1].init(83, 21, 'position === "static"');
function visit440_451_1(result) {
  _$jscoverage['/base/style.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['449'][1].init(116, 8, 'computed');
function visit439_449_1(result) {
  _$jscoverage['/base/style.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['433'][1].init(48, 8, 'computed');
function visit438_433_1(result) {
  _$jscoverage['/base/style.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['418'][1].init(71, 3, 'ret');
function visit437_418_1(result) {
  _$jscoverage['/base/style.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['413'][1].init(62, 71, 'el && getWHIgnoreDisplay(el, name, includeMargin ? \'margin\' : \'border\')');
function visit436_413_1(result) {
  _$jscoverage['/base/style.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['408'][1].init(62, 45, 'el && getWHIgnoreDisplay(el, name, \'padding\')');
function visit435_408_1(result) {
  _$jscoverage['/base/style.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['343'][1].init(34, 36, '!S.inArray(getNodeName(e), excludes)');
function visit434_343_1(result) {
  _$jscoverage['/base/style.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['338'][1].init(371, 23, 'UA[\'ie\'] || UA[\'opera\']');
function visit433_338_1(result) {
  _$jscoverage['/base/style.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['336'][1].init(261, 12, 'UA[\'webkit\']');
function visit432_336_1(result) {
  _$jscoverage['/base/style.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['334'][1].init(155, 11, 'UA[\'gecko\']');
function visit431_334_1(result) {
  _$jscoverage['/base/style.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['330'][1].init(281, 6, 'j >= 0');
function visit430_330_1(result) {
  _$jscoverage['/base/style.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['310'][1].init(764, 15, 'elem.styleSheet');
function visit429_310_1(result) {
  _$jscoverage['/base/style.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['301'][1].init(498, 4, 'elem');
function visit428_301_1(result) {
  _$jscoverage['/base/style.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['296'][1].init(333, 35, 'id && (id = id.replace(\'#\', EMPTY))');
function visit427_296_1(result) {
  _$jscoverage['/base/style.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['286'][1].init(22, 25, 'typeof refWin == \'string\'');
function visit426_286_1(result) {
  _$jscoverage['/base/style.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['269'][1].init(62, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit425_269_1(result) {
  _$jscoverage['/base/style.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['267'][1].init(121, 6, 'i >= 0');
function visit424_267_1(result) {
  _$jscoverage['/base/style.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['252'][1].init(30, 3, 'old');
function visit423_252_1(result) {
  _$jscoverage['/base/style.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['251'][1].init(154, 12, 'old !== NONE');
function visit422_251_1(result) {
  _$jscoverage['/base/style.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['247'][1].init(121, 6, 'i >= 0');
function visit421_247_1(result) {
  _$jscoverage['/base/style.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['231'][1].init(205, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit420_231_1(result) {
  _$jscoverage['/base/style.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['229'][1].init(80, 36, 'Dom.data(elem, OLD_DISPLAY) || EMPTY');
function visit419_229_1(result) {
  _$jscoverage['/base/style.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['227'][1].init(177, 6, 'i >= 0');
function visit418_227_1(result) {
  _$jscoverage['/base/style.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['211'][1].init(47, 6, 'i >= 0');
function visit417_211_1(result) {
  _$jscoverage['/base/style.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['207'][1].init(493, 25, 'typeof ret == \'undefined\'');
function visit416_207_1(result) {
  _$jscoverage['/base/style.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['202'][3].init(141, 41, '(ret = hook.get(elem, true)) !== undefined');
function visit415_202_3(result) {
  _$jscoverage['/base/style.js'].branchData['202'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['202'][2].init(123, 59, '\'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit414_202_2(result) {
  _$jscoverage['/base/style.js'].branchData['202'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['202'][1].init(115, 67, 'hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit413_202_1(result) {
  _$jscoverage['/base/style.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['200'][1].init(117, 4, 'elem');
function visit412_200_1(result) {
  _$jscoverage['/base/style.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['197'][1].init(665, 17, 'val === undefined');
function visit411_197_1(result) {
  _$jscoverage['/base/style.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['187'][1].init(51, 6, 'i >= 0');
function visit410_187_1(result) {
  _$jscoverage['/base/style.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['185'][1].init(241, 21, 'S.isPlainObject(name)');
function visit409_185_1(result) {
  _$jscoverage['/base/style.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['161'][1].init(47, 6, 'i >= 0');
function visit408_161_1(result) {
  _$jscoverage['/base/style.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['156'][1].init(57, 4, 'elem');
function visit407_156_1(result) {
  _$jscoverage['/base/style.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['154'][1].init(507, 17, 'val === undefined');
function visit406_154_1(result) {
  _$jscoverage['/base/style.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['148'][1].init(51, 6, 'i >= 0');
function visit405_148_1(result) {
  _$jscoverage['/base/style.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['146'][1].init(193, 21, 'S.isPlainObject(name)');
function visit404_146_1(result) {
  _$jscoverage['/base/style.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['114'][1].init(790, 51, 'Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)');
function visit403_114_1(result) {
  _$jscoverage['/base/style.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['109'][2].init(602, 10, 'val === \'\'');
function visit402_109_2(result) {
  _$jscoverage['/base/style.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['109'][1].init(602, 36, 'val === \'\' && !Dom.contains(d, elem)');
function visit401_109_1(result) {
  _$jscoverage['/base/style.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['105'][1].init(28, 59, 'computedStyle.getPropertyValue(name) || computedStyle[name]');
function visit400_105_1(result) {
  _$jscoverage['/base/style.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['104'][1].init(369, 58, 'computedStyle = d.defaultView.getComputedStyle(elem, null)');
function visit399_104_1(result) {
  _$jscoverage['/base/style.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['101'][1].init(257, 22, 'cssProps[name] || name');
function visit398_101_1(result) {
  _$jscoverage['/base/style.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['67'][1].init(21, 31, 'doc.body || doc.documentElement');
function visit397_67_1(result) {
  _$jscoverage['/base/style.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['66'][1].init(105, 26, '!defaultDisplay[tagName]');
function visit396_66_1(result) {
  _$jscoverage['/base/style.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['49'][1].init(1183, 32, 'Features.isTransitionSupported()');
function visit395_49_1(result) {
  _$jscoverage['/base/style.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['43'][1].init(973, 31, 'Features.isTransformSupported()');
function visit394_43_1(result) {
  _$jscoverage['/base/style.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].lineData[6]++;
KISSY.add('dom/base/style', function(S, Dom, undefined) {
  _$jscoverage['/base/style.js'].functionData[0]++;
  _$jscoverage['/base/style.js'].lineData[7]++;
  var WINDOW = S.Env.host, UA = S.UA, logger = S.getLogger('s/dom'), Features = S.Features, getNodeName = Dom.nodeName, doc = WINDOW.document, RE_MARGIN = /^margin/, WIDTH = 'width', HEIGHT = 'height', DISPLAY = 'display', OLD_DISPLAY = DISPLAY + S.now(), NONE = 'none', cssNumber = {
  'fillOpacity': 1, 
  'fontWeight': 1, 
  'lineHeight': 1, 
  'opacity': 1, 
  'orphans': 1, 
  'widows': 1, 
  'zIndex': 1, 
  'zoom': 1}, rmsPrefix = /^-ms-/, EMPTY = '', DEFAULT_UNIT = 'px', NO_PX_REG = /\d(?!px)[a-z%]+$/i, cssHooks = {}, cssProps = {
  'float': 'cssFloat'}, defaultDisplay = {}, RE_DASH = /-([a-z])/ig;
  _$jscoverage['/base/style.js'].lineData[43]++;
  if (visit394_43_1(Features.isTransformSupported())) {
    _$jscoverage['/base/style.js'].lineData[44]++;
    var transform;
    _$jscoverage['/base/style.js'].lineData[45]++;
    transform = cssProps.transform = Features.getTransformProperty();
    _$jscoverage['/base/style.js'].lineData[46]++;
    cssProps.transformOrigin = transform + 'Origin';
  }
  _$jscoverage['/base/style.js'].lineData[49]++;
  if (visit395_49_1(Features.isTransitionSupported())) {
    _$jscoverage['/base/style.js'].lineData[50]++;
    cssProps.transition = Features.getTransitionProperty();
  }
  _$jscoverage['/base/style.js'].lineData[53]++;
  function upperCase() {
    _$jscoverage['/base/style.js'].functionData[1]++;
    _$jscoverage['/base/style.js'].lineData[54]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/base/style.js'].lineData[57]++;
  function camelCase(name) {
    _$jscoverage['/base/style.js'].functionData[2]++;
    _$jscoverage['/base/style.js'].lineData[59]++;
    return name.replace(rmsPrefix, 'ms-').replace(RE_DASH, upperCase);
  }
  _$jscoverage['/base/style.js'].lineData[62]++;
  function getDefaultDisplay(tagName) {
    _$jscoverage['/base/style.js'].functionData[3]++;
    _$jscoverage['/base/style.js'].lineData[63]++;
    var body, oldDisplay = defaultDisplay[tagName], elem;
    _$jscoverage['/base/style.js'].lineData[66]++;
    if (visit396_66_1(!defaultDisplay[tagName])) {
      _$jscoverage['/base/style.js'].lineData[67]++;
      body = visit397_67_1(doc.body || doc.documentElement);
      _$jscoverage['/base/style.js'].lineData[68]++;
      elem = doc.createElement(tagName);
      _$jscoverage['/base/style.js'].lineData[70]++;
      Dom.prepend(elem, body);
      _$jscoverage['/base/style.js'].lineData[71]++;
      oldDisplay = Dom.css(elem, 'display');
      _$jscoverage['/base/style.js'].lineData[72]++;
      body.removeChild(elem);
      _$jscoverage['/base/style.js'].lineData[74]++;
      defaultDisplay[tagName] = oldDisplay;
    }
    _$jscoverage['/base/style.js'].lineData[76]++;
    return oldDisplay;
  }
  _$jscoverage['/base/style.js'].lineData[79]++;
  S.mix(Dom, {
  _camelCase: camelCase, 
  _cssHooks: cssHooks, 
  _cssProps: cssProps, 
  _getComputedStyle: function(elem, name) {
  _$jscoverage['/base/style.js'].functionData[4]++;
  _$jscoverage['/base/style.js'].lineData[93]++;
  var val = '', computedStyle, width, minWidth, maxWidth, style, d = elem.ownerDocument;
  _$jscoverage['/base/style.js'].lineData[101]++;
  name = visit398_101_1(cssProps[name] || name);
  _$jscoverage['/base/style.js'].lineData[104]++;
  if (visit399_104_1(computedStyle = d.defaultView.getComputedStyle(elem, null))) {
    _$jscoverage['/base/style.js'].lineData[105]++;
    val = visit400_105_1(computedStyle.getPropertyValue(name) || computedStyle[name]);
  }
  _$jscoverage['/base/style.js'].lineData[109]++;
  if (visit401_109_1(visit402_109_2(val === '') && !Dom.contains(d, elem))) {
    _$jscoverage['/base/style.js'].lineData[110]++;
    val = elem.style[name];
  }
  _$jscoverage['/base/style.js'].lineData[114]++;
  if (visit403_114_1(Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name))) {
    _$jscoverage['/base/style.js'].lineData[115]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[116]++;
    width = style.width;
    _$jscoverage['/base/style.js'].lineData[117]++;
    minWidth = style.minWidth;
    _$jscoverage['/base/style.js'].lineData[118]++;
    maxWidth = style.maxWidth;
    _$jscoverage['/base/style.js'].lineData[120]++;
    style.minWidth = style.maxWidth = style.width = val;
    _$jscoverage['/base/style.js'].lineData[121]++;
    val = computedStyle.width;
    _$jscoverage['/base/style.js'].lineData[123]++;
    style.width = width;
    _$jscoverage['/base/style.js'].lineData[124]++;
    style.minWidth = minWidth;
    _$jscoverage['/base/style.js'].lineData[125]++;
    style.maxWidth = maxWidth;
  }
  _$jscoverage['/base/style.js'].lineData[128]++;
  return val;
}, 
  style: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[5]++;
  _$jscoverage['/base/style.js'].lineData[141]++;
  var els = Dom.query(selector), k, ret, elem = els[0], i;
  _$jscoverage['/base/style.js'].lineData[146]++;
  if (visit404_146_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[147]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[148]++;
      for (i = els.length - 1; visit405_148_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[149]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[152]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[154]++;
  if (visit406_154_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[155]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[156]++;
    if (visit407_156_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[157]++;
      ret = style(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[159]++;
    return ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[161]++;
    for (i = els.length - 1; visit408_161_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[162]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[165]++;
  return undefined;
}, 
  css: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[6]++;
  _$jscoverage['/base/style.js'].lineData[178]++;
  var els = Dom.query(selector), elem = els[0], k, hook, ret, i;
  _$jscoverage['/base/style.js'].lineData[185]++;
  if (visit409_185_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[186]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[187]++;
      for (i = els.length - 1; visit410_187_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[188]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[191]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[194]++;
  name = camelCase(name);
  _$jscoverage['/base/style.js'].lineData[195]++;
  hook = cssHooks[name];
  _$jscoverage['/base/style.js'].lineData[197]++;
  if (visit411_197_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[199]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[200]++;
    if (visit412_200_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[202]++;
      if (visit413_202_1(hook && visit414_202_2('get' in hook && visit415_202_3((ret = hook.get(elem, true)) !== undefined)))) {
      } else {
        _$jscoverage['/base/style.js'].lineData[204]++;
        ret = Dom._getComputedStyle(elem, name);
      }
    }
    _$jscoverage['/base/style.js'].lineData[207]++;
    return (visit416_207_1(typeof ret == 'undefined')) ? '' : ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[211]++;
    for (i = els.length - 1; visit417_211_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[212]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[215]++;
  return undefined;
}, 
  show: function(selector) {
  _$jscoverage['/base/style.js'].functionData[7]++;
  _$jscoverage['/base/style.js'].lineData[223]++;
  var els = Dom.query(selector), tagName, old, elem, i;
  _$jscoverage['/base/style.js'].lineData[227]++;
  for (i = els.length - 1; visit418_227_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[228]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[229]++;
    elem.style[DISPLAY] = visit419_229_1(Dom.data(elem, OLD_DISPLAY) || EMPTY);
    _$jscoverage['/base/style.js'].lineData[231]++;
    if (visit420_231_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[232]++;
      tagName = elem.tagName.toLowerCase();
      _$jscoverage['/base/style.js'].lineData[233]++;
      old = getDefaultDisplay(tagName);
      _$jscoverage['/base/style.js'].lineData[234]++;
      Dom.data(elem, OLD_DISPLAY, old);
      _$jscoverage['/base/style.js'].lineData[235]++;
      elem.style[DISPLAY] = old;
    }
  }
}, 
  hide: function(selector) {
  _$jscoverage['/base/style.js'].functionData[8]++;
  _$jscoverage['/base/style.js'].lineData[245]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[247]++;
  for (i = els.length - 1; visit421_247_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[248]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[249]++;
    var style = elem.style, old = style[DISPLAY];
    _$jscoverage['/base/style.js'].lineData[251]++;
    if (visit422_251_1(old !== NONE)) {
      _$jscoverage['/base/style.js'].lineData[252]++;
      if (visit423_252_1(old)) {
        _$jscoverage['/base/style.js'].lineData[253]++;
        Dom.data(elem, OLD_DISPLAY, old);
      }
      _$jscoverage['/base/style.js'].lineData[255]++;
      style[DISPLAY] = NONE;
    }
  }
}, 
  toggle: function(selector) {
  _$jscoverage['/base/style.js'].functionData[9]++;
  _$jscoverage['/base/style.js'].lineData[265]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[267]++;
  for (i = els.length - 1; visit424_267_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[268]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[269]++;
    if (visit425_269_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[270]++;
      Dom.show(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[272]++;
      Dom.hide(elem);
    }
  }
}, 
  addStyleSheet: function(refWin, cssText, id) {
  _$jscoverage['/base/style.js'].functionData[10]++;
  _$jscoverage['/base/style.js'].lineData[286]++;
  if (visit426_286_1(typeof refWin == 'string')) {
    _$jscoverage['/base/style.js'].lineData[287]++;
    id = cssText;
    _$jscoverage['/base/style.js'].lineData[288]++;
    cssText = refWin;
    _$jscoverage['/base/style.js'].lineData[290]++;
    refWin = WINDOW;
  }
  _$jscoverage['/base/style.js'].lineData[293]++;
  var doc = Dom.getDocument(refWin), elem;
  _$jscoverage['/base/style.js'].lineData[296]++;
  if (visit427_296_1(id && (id = id.replace('#', EMPTY)))) {
    _$jscoverage['/base/style.js'].lineData[297]++;
    elem = Dom.get('#' + id, doc);
  }
  _$jscoverage['/base/style.js'].lineData[301]++;
  if (visit428_301_1(elem)) {
    _$jscoverage['/base/style.js'].lineData[302]++;
    return;
  }
  _$jscoverage['/base/style.js'].lineData[305]++;
  elem = Dom.create('<style>', {
  id: id}, doc);
  _$jscoverage['/base/style.js'].lineData[308]++;
  Dom.get('head', doc).appendChild(elem);
  _$jscoverage['/base/style.js'].lineData[310]++;
  if (visit429_310_1(elem.styleSheet)) {
    _$jscoverage['/base/style.js'].lineData[311]++;
    elem.styleSheet.cssText = cssText;
  } else {
    _$jscoverage['/base/style.js'].lineData[313]++;
    elem.appendChild(doc.createTextNode(cssText));
  }
}, 
  unselectable: function(selector) {
  _$jscoverage['/base/style.js'].functionData[11]++;
  _$jscoverage['/base/style.js'].lineData[322]++;
  var _els = Dom.query(selector), elem, j, e, i = 0, excludes, style, els;
  _$jscoverage['/base/style.js'].lineData[330]++;
  for (j = _els.length - 1; visit430_330_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[331]++;
    elem = _els[j];
    _$jscoverage['/base/style.js'].lineData[332]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[333]++;
    style['UserSelect'] = 'none';
    _$jscoverage['/base/style.js'].lineData[334]++;
    if (visit431_334_1(UA['gecko'])) {
      _$jscoverage['/base/style.js'].lineData[335]++;
      style['MozUserSelect'] = 'none';
    } else {
      _$jscoverage['/base/style.js'].lineData[336]++;
      if (visit432_336_1(UA['webkit'])) {
        _$jscoverage['/base/style.js'].lineData[337]++;
        style['WebkitUserSelect'] = 'none';
      } else {
        _$jscoverage['/base/style.js'].lineData[338]++;
        if (visit433_338_1(UA['ie'] || UA['opera'])) {
          _$jscoverage['/base/style.js'].lineData[339]++;
          els = elem.getElementsByTagName('*');
          _$jscoverage['/base/style.js'].lineData[340]++;
          elem.setAttribute('unselectable', 'on');
          _$jscoverage['/base/style.js'].lineData[341]++;
          excludes = ['iframe', 'textarea', 'input', 'select'];
          _$jscoverage['/base/style.js'].lineData[342]++;
          while (e = els[i++]) {
            _$jscoverage['/base/style.js'].lineData[343]++;
            if (visit434_343_1(!S.inArray(getNodeName(e), excludes))) {
              _$jscoverage['/base/style.js'].lineData[344]++;
              e.setAttribute('unselectable', 'on');
            }
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
  _$jscoverage['/base/style.js'].lineData[405]++;
  S.each([WIDTH, HEIGHT], function(name) {
  _$jscoverage['/base/style.js'].functionData[12]++;
  _$jscoverage['/base/style.js'].lineData[406]++;
  Dom['inner' + S.ucfirst(name)] = function(selector) {
  _$jscoverage['/base/style.js'].functionData[13]++;
  _$jscoverage['/base/style.js'].lineData[407]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[408]++;
  return visit435_408_1(el && getWHIgnoreDisplay(el, name, 'padding'));
};
  _$jscoverage['/base/style.js'].lineData[411]++;
  Dom['outer' + S.ucfirst(name)] = function(selector, includeMargin) {
  _$jscoverage['/base/style.js'].functionData[14]++;
  _$jscoverage['/base/style.js'].lineData[412]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[413]++;
  return visit436_413_1(el && getWHIgnoreDisplay(el, name, includeMargin ? 'margin' : 'border'));
};
  _$jscoverage['/base/style.js'].lineData[416]++;
  Dom[name] = function(selector, val) {
  _$jscoverage['/base/style.js'].functionData[15]++;
  _$jscoverage['/base/style.js'].lineData[417]++;
  var ret = Dom.css(selector, name, val);
  _$jscoverage['/base/style.js'].lineData[418]++;
  if (visit437_418_1(ret)) {
    _$jscoverage['/base/style.js'].lineData[419]++;
    ret = parseFloat(ret);
  }
  _$jscoverage['/base/style.js'].lineData[421]++;
  return ret;
};
  _$jscoverage['/base/style.js'].lineData[427]++;
  cssHooks[name] = {
  get: function(elem, computed) {
  _$jscoverage['/base/style.js'].functionData[16]++;
  _$jscoverage['/base/style.js'].lineData[432]++;
  var val;
  _$jscoverage['/base/style.js'].lineData[433]++;
  if (visit438_433_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[434]++;
    val = getWHIgnoreDisplay(elem, name) + 'px';
  }
  _$jscoverage['/base/style.js'].lineData[436]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[441]++;
  var cssShow = {
  position: 'absolute', 
  visibility: 'hidden', 
  display: 'block'};
  _$jscoverage['/base/style.js'].lineData[443]++;
  S.each(['left', 'top'], function(name) {
  _$jscoverage['/base/style.js'].functionData[17]++;
  _$jscoverage['/base/style.js'].lineData[444]++;
  cssHooks[name] = {
  get: function(el, computed) {
  _$jscoverage['/base/style.js'].functionData[18]++;
  _$jscoverage['/base/style.js'].lineData[446]++;
  var val, isAutoPosition, position;
  _$jscoverage['/base/style.js'].lineData[449]++;
  if (visit439_449_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[450]++;
    position = Dom.css(el, 'position');
    _$jscoverage['/base/style.js'].lineData[451]++;
    if (visit440_451_1(position === "static")) {
      _$jscoverage['/base/style.js'].lineData[452]++;
      return "auto";
    }
    _$jscoverage['/base/style.js'].lineData[454]++;
    val = Dom._getComputedStyle(el, name);
    _$jscoverage['/base/style.js'].lineData[455]++;
    isAutoPosition = visit441_455_1(val === "auto");
    _$jscoverage['/base/style.js'].lineData[456]++;
    if (visit442_456_1(isAutoPosition && visit443_456_2(position === "relative"))) {
      _$jscoverage['/base/style.js'].lineData[457]++;
      return "0px";
    }
    _$jscoverage['/base/style.js'].lineData[459]++;
    if (visit444_459_1(isAutoPosition || NO_PX_REG.test(val))) {
      _$jscoverage['/base/style.js'].lineData[460]++;
      val = getPosition(el)[name] + 'px';
    }
  }
  _$jscoverage['/base/style.js'].lineData[463]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[468]++;
  function swap(elem, options, callback) {
    _$jscoverage['/base/style.js'].functionData[19]++;
    _$jscoverage['/base/style.js'].lineData[469]++;
    var old = {}, style = elem.style, name;
    _$jscoverage['/base/style.js'].lineData[474]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[475]++;
      old[name] = style[name];
      _$jscoverage['/base/style.js'].lineData[476]++;
      style[name] = options[name];
    }
    _$jscoverage['/base/style.js'].lineData[479]++;
    callback.call(elem);
    _$jscoverage['/base/style.js'].lineData[482]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[483]++;
      style[name] = old[name];
    }
  }
  _$jscoverage['/base/style.js'].lineData[487]++;
  function style(elem, name, val) {
    _$jscoverage['/base/style.js'].functionData[20]++;
    _$jscoverage['/base/style.js'].lineData[488]++;
    var style, ret, hook;
    _$jscoverage['/base/style.js'].lineData[491]++;
    if (visit445_491_1(visit446_491_2(elem.nodeType === 3) || visit447_492_1(visit448_492_2(elem.nodeType === 8) || !(style = elem.style)))) {
      _$jscoverage['/base/style.js'].lineData[493]++;
      return undefined;
    }
    _$jscoverage['/base/style.js'].lineData[495]++;
    name = camelCase(name);
    _$jscoverage['/base/style.js'].lineData[496]++;
    hook = cssHooks[name];
    _$jscoverage['/base/style.js'].lineData[497]++;
    name = visit449_497_1(cssProps[name] || name);
    _$jscoverage['/base/style.js'].lineData[499]++;
    if (visit450_499_1(val !== undefined)) {
      _$jscoverage['/base/style.js'].lineData[501]++;
      if (visit451_501_1(visit452_501_2(val === null) || visit453_501_3(val === EMPTY))) {
        _$jscoverage['/base/style.js'].lineData[502]++;
        val = EMPTY;
      } else {
        _$jscoverage['/base/style.js'].lineData[505]++;
        if (visit454_505_1(!isNaN(Number(val)) && !cssNumber[name])) {
          _$jscoverage['/base/style.js'].lineData[506]++;
          val += DEFAULT_UNIT;
        }
      }
      _$jscoverage['/base/style.js'].lineData[508]++;
      if (visit455_508_1(hook && hook.set)) {
        _$jscoverage['/base/style.js'].lineData[509]++;
        val = hook.set(elem, val);
      }
      _$jscoverage['/base/style.js'].lineData[511]++;
      if (visit456_511_1(val !== undefined)) {
        _$jscoverage['/base/style.js'].lineData[513]++;
        try {
          _$jscoverage['/base/style.js'].lineData[515]++;
          style[name] = val;
        }        catch (e) {
  _$jscoverage['/base/style.js'].lineData[517]++;
  logger.warn('css set error:' + e);
}
        _$jscoverage['/base/style.js'].lineData[520]++;
        if (visit457_520_1(visit458_520_2(val === EMPTY) && style.removeAttribute)) {
          _$jscoverage['/base/style.js'].lineData[521]++;
          style.removeAttribute(name);
        }
      }
      _$jscoverage['/base/style.js'].lineData[524]++;
      if (visit459_524_1(!style.cssText)) {
        _$jscoverage['/base/style.js'].lineData[527]++;
        visit460_527_1(UA.webkit && (style = elem.outerHTML));
        _$jscoverage['/base/style.js'].lineData[528]++;
        elem.removeAttribute('style');
      }
      _$jscoverage['/base/style.js'].lineData[530]++;
      return undefined;
    } else {
      _$jscoverage['/base/style.js'].lineData[535]++;
      if (visit461_535_1(hook && visit462_535_2('get' in hook && visit463_535_3((ret = hook.get(elem, false)) !== undefined)))) {
      } else {
        _$jscoverage['/base/style.js'].lineData[539]++;
        ret = style[name];
      }
      _$jscoverage['/base/style.js'].lineData[541]++;
      return visit464_541_1(ret === undefined) ? '' : ret;
    }
  }
  _$jscoverage['/base/style.js'].lineData[546]++;
  function getWHIgnoreDisplay(elem) {
    _$jscoverage['/base/style.js'].functionData[21]++;
    _$jscoverage['/base/style.js'].lineData[547]++;
    var val, args = arguments;
    _$jscoverage['/base/style.js'].lineData[550]++;
    if (visit465_550_1(elem.offsetWidth !== 0)) {
      _$jscoverage['/base/style.js'].lineData[551]++;
      val = getWH.apply(undefined, args);
    } else {
      _$jscoverage['/base/style.js'].lineData[553]++;
      swap(elem, cssShow, function() {
  _$jscoverage['/base/style.js'].functionData[22]++;
  _$jscoverage['/base/style.js'].lineData[554]++;
  val = getWH.apply(undefined, args);
});
    }
    _$jscoverage['/base/style.js'].lineData[557]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[569]++;
  function getWH(elem, name, extra) {
    _$jscoverage['/base/style.js'].functionData[23]++;
    _$jscoverage['/base/style.js'].lineData[570]++;
    if (visit466_570_1(S.isWindow(elem))) {
      _$jscoverage['/base/style.js'].lineData[571]++;
      return visit467_571_1(name == WIDTH) ? Dom.viewportWidth(elem) : Dom.viewportHeight(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[572]++;
      if (visit468_572_1(elem.nodeType == 9)) {
        _$jscoverage['/base/style.js'].lineData[573]++;
        return visit469_573_1(name == WIDTH) ? Dom.docWidth(elem) : Dom.docHeight(elem);
      }
    }
    _$jscoverage['/base/style.js'].lineData[575]++;
    var which = visit470_575_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'], val = visit471_576_1(name === WIDTH) ? elem.offsetWidth : elem.offsetHeight;
    _$jscoverage['/base/style.js'].lineData[578]++;
    if (visit472_578_1(val > 0)) {
      _$jscoverage['/base/style.js'].lineData[579]++;
      if (visit473_579_1(extra !== 'border')) {
        _$jscoverage['/base/style.js'].lineData[580]++;
        S.each(which, function(w) {
  _$jscoverage['/base/style.js'].functionData[24]++;
  _$jscoverage['/base/style.js'].lineData[581]++;
  if (visit474_581_1(!extra)) {
    _$jscoverage['/base/style.js'].lineData[582]++;
    val -= visit475_582_1(parseFloat(Dom.css(elem, 'padding' + w)) || 0);
  }
  _$jscoverage['/base/style.js'].lineData[584]++;
  if (visit476_584_1(extra === 'margin')) {
    _$jscoverage['/base/style.js'].lineData[585]++;
    val += visit477_585_1(parseFloat(Dom.css(elem, extra + w)) || 0);
  } else {
    _$jscoverage['/base/style.js'].lineData[587]++;
    val -= visit478_587_1(parseFloat(Dom.css(elem, 'border' + w + 'Width')) || 0);
  }
});
      }
      _$jscoverage['/base/style.js'].lineData[592]++;
      return val;
    }
    _$jscoverage['/base/style.js'].lineData[596]++;
    val = Dom._getComputedStyle(elem, name);
    _$jscoverage['/base/style.js'].lineData[597]++;
    if (visit479_597_1(visit480_597_2(val == null) || visit481_597_3((Number(val)) < 0))) {
      _$jscoverage['/base/style.js'].lineData[598]++;
      val = visit482_598_1(elem.style[name] || 0);
    }
    _$jscoverage['/base/style.js'].lineData[601]++;
    val = visit483_601_1(parseFloat(val) || 0);
    _$jscoverage['/base/style.js'].lineData[604]++;
    if (visit484_604_1(extra)) {
      _$jscoverage['/base/style.js'].lineData[605]++;
      S.each(which, function(w) {
  _$jscoverage['/base/style.js'].functionData[25]++;
  _$jscoverage['/base/style.js'].lineData[606]++;
  val += visit485_606_1(parseFloat(Dom.css(elem, 'padding' + w)) || 0);
  _$jscoverage['/base/style.js'].lineData[607]++;
  if (visit486_607_1(extra !== 'padding')) {
    _$jscoverage['/base/style.js'].lineData[608]++;
    val += visit487_608_1(parseFloat(Dom.css(elem, 'border' + w + 'Width')) || 0);
  }
  _$jscoverage['/base/style.js'].lineData[610]++;
  if (visit488_610_1(extra === 'margin')) {
    _$jscoverage['/base/style.js'].lineData[611]++;
    val += visit489_611_1(parseFloat(Dom.css(elem, extra + w)) || 0);
  }
});
    }
    _$jscoverage['/base/style.js'].lineData[616]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[619]++;
  var ROOT_REG = /^(?:body|html)$/i;
  _$jscoverage['/base/style.js'].lineData[621]++;
  function getPosition(el) {
    _$jscoverage['/base/style.js'].functionData[26]++;
    _$jscoverage['/base/style.js'].lineData[622]++;
    var offsetParent, offset, parentOffset = {
  top: 0, 
  left: 0};
    _$jscoverage['/base/style.js'].lineData[626]++;
    if (visit490_626_1(Dom.css(el, 'position') == 'fixed')) {
      _$jscoverage['/base/style.js'].lineData[627]++;
      offset = el.getBoundingClientRect();
    } else {
      _$jscoverage['/base/style.js'].lineData[632]++;
      offsetParent = getOffsetParent(el);
      _$jscoverage['/base/style.js'].lineData[633]++;
      offset = Dom.offset(el);
      _$jscoverage['/base/style.js'].lineData[634]++;
      parentOffset = Dom.offset(offsetParent);
      _$jscoverage['/base/style.js'].lineData[635]++;
      parentOffset.top += visit491_635_1(parseFloat(Dom.css(offsetParent, "borderTopWidth")) || 0);
      _$jscoverage['/base/style.js'].lineData[636]++;
      parentOffset.left += visit492_636_1(parseFloat(Dom.css(offsetParent, "borderLeftWidth")) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[639]++;
    offset.top -= visit493_639_1(parseFloat(Dom.css(el, "marginTop")) || 0);
    _$jscoverage['/base/style.js'].lineData[640]++;
    offset.left -= visit494_640_1(parseFloat(Dom.css(el, "marginLeft")) || 0);
    _$jscoverage['/base/style.js'].lineData[644]++;
    return {
  top: offset.top - parentOffset.top, 
  left: offset.left - parentOffset.left};
  }
  _$jscoverage['/base/style.js'].lineData[650]++;
  function getOffsetParent(el) {
    _$jscoverage['/base/style.js'].functionData[27]++;
    _$jscoverage['/base/style.js'].lineData[651]++;
    var offsetParent = visit495_651_1(el.offsetParent || (visit496_651_2(el.ownerDocument || doc)).body);
    _$jscoverage['/base/style.js'].lineData[652]++;
    while (visit497_652_1(offsetParent && visit498_652_2(!ROOT_REG.test(offsetParent.nodeName) && visit499_653_1(Dom.css(offsetParent, "position") === "static")))) {
      _$jscoverage['/base/style.js'].lineData[654]++;
      offsetParent = offsetParent.offsetParent;
    }
    _$jscoverage['/base/style.js'].lineData[656]++;
    return offsetParent;
  }
  _$jscoverage['/base/style.js'].lineData[659]++;
  return Dom;
}, {
  requires: ['./api']});
