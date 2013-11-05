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
  _$jscoverage['/base/style.js'].lineData[460] = 0;
  _$jscoverage['/base/style.js'].lineData[461] = 0;
  _$jscoverage['/base/style.js'].lineData[464] = 0;
  _$jscoverage['/base/style.js'].lineData[469] = 0;
  _$jscoverage['/base/style.js'].lineData[470] = 0;
  _$jscoverage['/base/style.js'].lineData[475] = 0;
  _$jscoverage['/base/style.js'].lineData[476] = 0;
  _$jscoverage['/base/style.js'].lineData[477] = 0;
  _$jscoverage['/base/style.js'].lineData[480] = 0;
  _$jscoverage['/base/style.js'].lineData[483] = 0;
  _$jscoverage['/base/style.js'].lineData[484] = 0;
  _$jscoverage['/base/style.js'].lineData[488] = 0;
  _$jscoverage['/base/style.js'].lineData[489] = 0;
  _$jscoverage['/base/style.js'].lineData[492] = 0;
  _$jscoverage['/base/style.js'].lineData[494] = 0;
  _$jscoverage['/base/style.js'].lineData[496] = 0;
  _$jscoverage['/base/style.js'].lineData[497] = 0;
  _$jscoverage['/base/style.js'].lineData[498] = 0;
  _$jscoverage['/base/style.js'].lineData[500] = 0;
  _$jscoverage['/base/style.js'].lineData[502] = 0;
  _$jscoverage['/base/style.js'].lineData[503] = 0;
  _$jscoverage['/base/style.js'].lineData[506] = 0;
  _$jscoverage['/base/style.js'].lineData[507] = 0;
  _$jscoverage['/base/style.js'].lineData[509] = 0;
  _$jscoverage['/base/style.js'].lineData[510] = 0;
  _$jscoverage['/base/style.js'].lineData[512] = 0;
  _$jscoverage['/base/style.js'].lineData[514] = 0;
  _$jscoverage['/base/style.js'].lineData[516] = 0;
  _$jscoverage['/base/style.js'].lineData[518] = 0;
  _$jscoverage['/base/style.js'].lineData[521] = 0;
  _$jscoverage['/base/style.js'].lineData[522] = 0;
  _$jscoverage['/base/style.js'].lineData[525] = 0;
  _$jscoverage['/base/style.js'].lineData[528] = 0;
  _$jscoverage['/base/style.js'].lineData[529] = 0;
  _$jscoverage['/base/style.js'].lineData[531] = 0;
  _$jscoverage['/base/style.js'].lineData[536] = 0;
  _$jscoverage['/base/style.js'].lineData[540] = 0;
  _$jscoverage['/base/style.js'].lineData[542] = 0;
  _$jscoverage['/base/style.js'].lineData[547] = 0;
  _$jscoverage['/base/style.js'].lineData[548] = 0;
  _$jscoverage['/base/style.js'].lineData[551] = 0;
  _$jscoverage['/base/style.js'].lineData[552] = 0;
  _$jscoverage['/base/style.js'].lineData[554] = 0;
  _$jscoverage['/base/style.js'].lineData[555] = 0;
  _$jscoverage['/base/style.js'].lineData[558] = 0;
  _$jscoverage['/base/style.js'].lineData[570] = 0;
  _$jscoverage['/base/style.js'].lineData[571] = 0;
  _$jscoverage['/base/style.js'].lineData[572] = 0;
  _$jscoverage['/base/style.js'].lineData[573] = 0;
  _$jscoverage['/base/style.js'].lineData[574] = 0;
  _$jscoverage['/base/style.js'].lineData[576] = 0;
  _$jscoverage['/base/style.js'].lineData[579] = 0;
  _$jscoverage['/base/style.js'].lineData[580] = 0;
  _$jscoverage['/base/style.js'].lineData[581] = 0;
  _$jscoverage['/base/style.js'].lineData[582] = 0;
  _$jscoverage['/base/style.js'].lineData[583] = 0;
  _$jscoverage['/base/style.js'].lineData[585] = 0;
  _$jscoverage['/base/style.js'].lineData[586] = 0;
  _$jscoverage['/base/style.js'].lineData[588] = 0;
  _$jscoverage['/base/style.js'].lineData[593] = 0;
  _$jscoverage['/base/style.js'].lineData[597] = 0;
  _$jscoverage['/base/style.js'].lineData[598] = 0;
  _$jscoverage['/base/style.js'].lineData[599] = 0;
  _$jscoverage['/base/style.js'].lineData[602] = 0;
  _$jscoverage['/base/style.js'].lineData[605] = 0;
  _$jscoverage['/base/style.js'].lineData[606] = 0;
  _$jscoverage['/base/style.js'].lineData[607] = 0;
  _$jscoverage['/base/style.js'].lineData[608] = 0;
  _$jscoverage['/base/style.js'].lineData[609] = 0;
  _$jscoverage['/base/style.js'].lineData[611] = 0;
  _$jscoverage['/base/style.js'].lineData[612] = 0;
  _$jscoverage['/base/style.js'].lineData[617] = 0;
  _$jscoverage['/base/style.js'].lineData[620] = 0;
  _$jscoverage['/base/style.js'].lineData[622] = 0;
  _$jscoverage['/base/style.js'].lineData[623] = 0;
  _$jscoverage['/base/style.js'].lineData[627] = 0;
  _$jscoverage['/base/style.js'].lineData[628] = 0;
  _$jscoverage['/base/style.js'].lineData[633] = 0;
  _$jscoverage['/base/style.js'].lineData[634] = 0;
  _$jscoverage['/base/style.js'].lineData[635] = 0;
  _$jscoverage['/base/style.js'].lineData[636] = 0;
  _$jscoverage['/base/style.js'].lineData[637] = 0;
  _$jscoverage['/base/style.js'].lineData[640] = 0;
  _$jscoverage['/base/style.js'].lineData[641] = 0;
  _$jscoverage['/base/style.js'].lineData[645] = 0;
  _$jscoverage['/base/style.js'].lineData[651] = 0;
  _$jscoverage['/base/style.js'].lineData[652] = 0;
  _$jscoverage['/base/style.js'].lineData[653] = 0;
  _$jscoverage['/base/style.js'].lineData[655] = 0;
  _$jscoverage['/base/style.js'].lineData[657] = 0;
  _$jscoverage['/base/style.js'].lineData[660] = 0;
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
  _$jscoverage['/base/style.js'].branchData['460'] = [];
  _$jscoverage['/base/style.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['492'] = [];
  _$jscoverage['/base/style.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['492'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['493'] = [];
  _$jscoverage['/base/style.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['493'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['498'] = [];
  _$jscoverage['/base/style.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['500'] = [];
  _$jscoverage['/base/style.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['502'] = [];
  _$jscoverage['/base/style.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['502'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['502'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['506'] = [];
  _$jscoverage['/base/style.js'].branchData['506'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['509'] = [];
  _$jscoverage['/base/style.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['512'] = [];
  _$jscoverage['/base/style.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['521'] = [];
  _$jscoverage['/base/style.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['521'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['525'] = [];
  _$jscoverage['/base/style.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['528'] = [];
  _$jscoverage['/base/style.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['536'] = [];
  _$jscoverage['/base/style.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['536'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['536'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['542'] = [];
  _$jscoverage['/base/style.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['551'] = [];
  _$jscoverage['/base/style.js'].branchData['551'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['571'] = [];
  _$jscoverage['/base/style.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['572'] = [];
  _$jscoverage['/base/style.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['573'] = [];
  _$jscoverage['/base/style.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['574'] = [];
  _$jscoverage['/base/style.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['576'] = [];
  _$jscoverage['/base/style.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['577'] = [];
  _$jscoverage['/base/style.js'].branchData['577'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['579'] = [];
  _$jscoverage['/base/style.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['580'] = [];
  _$jscoverage['/base/style.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['582'] = [];
  _$jscoverage['/base/style.js'].branchData['582'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['583'] = [];
  _$jscoverage['/base/style.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['585'] = [];
  _$jscoverage['/base/style.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['586'] = [];
  _$jscoverage['/base/style.js'].branchData['586'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['588'] = [];
  _$jscoverage['/base/style.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['598'] = [];
  _$jscoverage['/base/style.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['598'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['598'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['599'] = [];
  _$jscoverage['/base/style.js'].branchData['599'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['602'] = [];
  _$jscoverage['/base/style.js'].branchData['602'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['605'] = [];
  _$jscoverage['/base/style.js'].branchData['605'][1] = new BranchData();
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
  _$jscoverage['/base/style.js'].branchData['627'] = [];
  _$jscoverage['/base/style.js'].branchData['627'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['636'] = [];
  _$jscoverage['/base/style.js'].branchData['636'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['637'] = [];
  _$jscoverage['/base/style.js'].branchData['637'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['640'] = [];
  _$jscoverage['/base/style.js'].branchData['640'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['641'] = [];
  _$jscoverage['/base/style.js'].branchData['641'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['652'] = [];
  _$jscoverage['/base/style.js'].branchData['652'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['652'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['653'] = [];
  _$jscoverage['/base/style.js'].branchData['653'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['653'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['654'] = [];
  _$jscoverage['/base/style.js'].branchData['654'][1] = new BranchData();
}
_$jscoverage['/base/style.js'].branchData['654'][1].init(53, 46, 'Dom.css(offsetParent, "position") === "static"');
function visit505_654_1(result) {
  _$jscoverage['/base/style.js'].branchData['654'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['653'][2].init(113, 100, '!ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, "position") === "static"');
function visit504_653_2(result) {
  _$jscoverage['/base/style.js'].branchData['653'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['653'][1].init(97, 116, 'offsetParent && !ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, "position") === "static"');
function visit503_653_1(result) {
  _$jscoverage['/base/style.js'].branchData['653'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['652'][2].init(50, 23, 'el.ownerDocument || doc');
function visit502_652_2(result) {
  _$jscoverage['/base/style.js'].branchData['652'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['652'][1].init(29, 50, 'el.offsetParent || (el.ownerDocument || doc).body');
function visit501_652_1(result) {
  _$jscoverage['/base/style.js'].branchData['652'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['641'][1].init(826, 42, 'parseFloat(Dom.css(el, "marginLeft")) || 0');
function visit500_641_1(result) {
  _$jscoverage['/base/style.js'].branchData['641'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['640'][1].init(759, 41, 'parseFloat(Dom.css(el, "marginTop")) || 0');
function visit499_640_1(result) {
  _$jscoverage['/base/style.js'].branchData['640'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['637'][1].init(446, 57, 'parseFloat(Dom.css(offsetParent, "borderLeftWidth")) || 0');
function visit498_637_1(result) {
  _$jscoverage['/base/style.js'].branchData['637'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['636'][1].init(354, 56, 'parseFloat(Dom.css(offsetParent, "borderTopWidth")) || 0');
function visit497_636_1(result) {
  _$jscoverage['/base/style.js'].branchData['636'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['627'][1].init(113, 34, 'Dom.css(el, \'position\') == \'fixed\'');
function visit496_627_1(result) {
  _$jscoverage['/base/style.js'].branchData['627'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['612'][1].init(29, 41, 'parseFloat(Dom.css(elem, extra + w)) || 0');
function visit495_612_1(result) {
  _$jscoverage['/base/style.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['611'][1].init(240, 18, 'extra === \'margin\'');
function visit494_611_1(result) {
  _$jscoverage['/base/style.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['609'][1].init(29, 54, 'parseFloat(Dom.css(elem, \'border\' + w + \'Width\')) || 0');
function visit493_609_1(result) {
  _$jscoverage['/base/style.js'].branchData['609'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['608'][1].init(93, 19, 'extra !== \'padding\'');
function visit492_608_1(result) {
  _$jscoverage['/base/style.js'].branchData['608'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['607'][1].init(25, 45, 'parseFloat(Dom.css(elem, \'padding\' + w)) || 0');
function visit491_607_1(result) {
  _$jscoverage['/base/style.js'].branchData['607'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['605'][1].init(1359, 5, 'extra');
function visit490_605_1(result) {
  _$jscoverage['/base/style.js'].branchData['605'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['602'][1].init(1282, 20, 'parseFloat(val) || 0');
function visit489_602_1(result) {
  _$jscoverage['/base/style.js'].branchData['602'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['599'][1].init(20, 23, 'elem.style[name] || 0');
function visit488_599_1(result) {
  _$jscoverage['/base/style.js'].branchData['599'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['598'][3].init(1138, 16, '(Number(val)) < 0');
function visit487_598_3(result) {
  _$jscoverage['/base/style.js'].branchData['598'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['598'][2].init(1122, 11, 'val == null');
function visit486_598_2(result) {
  _$jscoverage['/base/style.js'].branchData['598'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['598'][1].init(1122, 32, 'val == null || (Number(val)) < 0');
function visit485_598_1(result) {
  _$jscoverage['/base/style.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['588'][1].init(33, 54, 'parseFloat(Dom.css(elem, \'border\' + w + \'Width\')) || 0');
function visit484_588_1(result) {
  _$jscoverage['/base/style.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['586'][1].init(33, 41, 'parseFloat(Dom.css(elem, extra + w)) || 0');
function visit483_586_1(result) {
  _$jscoverage['/base/style.js'].branchData['586'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['585'][1].init(163, 18, 'extra === \'margin\'');
function visit482_585_1(result) {
  _$jscoverage['/base/style.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['583'][1].init(33, 45, 'parseFloat(Dom.css(elem, \'padding\' + w)) || 0');
function visit481_583_1(result) {
  _$jscoverage['/base/style.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['582'][1].init(26, 6, '!extra');
function visit480_582_1(result) {
  _$jscoverage['/base/style.js'].branchData['582'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['580'][1].init(18, 18, 'extra !== \'border\'');
function visit479_580_1(result) {
  _$jscoverage['/base/style.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['579'][1].init(419, 7, 'val > 0');
function visit478_579_1(result) {
  _$jscoverage['/base/style.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['577'][1].init(86, 14, 'name === WIDTH');
function visit477_577_1(result) {
  _$jscoverage['/base/style.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['576'][1].init(274, 14, 'name === WIDTH');
function visit476_576_1(result) {
  _$jscoverage['/base/style.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['574'][1].init(21, 13, 'name == WIDTH');
function visit475_574_1(result) {
  _$jscoverage['/base/style.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['573'][1].init(143, 18, 'elem.nodeType == 9');
function visit474_573_1(result) {
  _$jscoverage['/base/style.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['572'][1].init(21, 13, 'name == WIDTH');
function visit473_572_1(result) {
  _$jscoverage['/base/style.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['571'][1].init(14, 16, 'S.isWindow(elem)');
function visit472_571_1(result) {
  _$jscoverage['/base/style.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['551'][1].init(128, 22, 'elem.offsetWidth !== 0');
function visit471_551_1(result) {
  _$jscoverage['/base/style.js'].branchData['551'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['542'][1].init(335, 17, 'ret === undefined');
function visit470_542_1(result) {
  _$jscoverage['/base/style.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['536'][3].init(121, 42, '(ret = hook.get(elem, false)) !== undefined');
function visit469_536_3(result) {
  _$jscoverage['/base/style.js'].branchData['536'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['536'][2].init(103, 60, '\'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit468_536_2(result) {
  _$jscoverage['/base/style.js'].branchData['536'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['536'][1].init(95, 68, 'hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit467_536_1(result) {
  _$jscoverage['/base/style.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['528'][1].init(136, 37, 'UA.webkit && (style = elem.outerHTML)');
function visit466_528_1(result) {
  _$jscoverage['/base/style.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['525'][1].init(876, 14, '!style.cssText');
function visit465_525_1(result) {
  _$jscoverage['/base/style.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['521'][2].init(308, 13, 'val === EMPTY');
function visit464_521_2(result) {
  _$jscoverage['/base/style.js'].branchData['521'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['521'][1].init(308, 38, 'val === EMPTY && style.removeAttribute');
function visit463_521_1(result) {
  _$jscoverage['/base/style.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['512'][1].init(405, 17, 'val !== undefined');
function visit462_512_1(result) {
  _$jscoverage['/base/style.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['509'][1].init(309, 16, 'hook && hook.set');
function visit461_509_1(result) {
  _$jscoverage['/base/style.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['506'][1].init(197, 39, '!isNaN(Number(val)) && !cssNumber[name]');
function visit460_506_1(result) {
  _$jscoverage['/base/style.js'].branchData['506'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['502'][3].init(66, 13, 'val === EMPTY');
function visit459_502_3(result) {
  _$jscoverage['/base/style.js'].branchData['502'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['502'][2].init(50, 12, 'val === null');
function visit458_502_2(result) {
  _$jscoverage['/base/style.js'].branchData['502'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['502'][1].init(50, 29, 'val === null || val === EMPTY');
function visit457_502_1(result) {
  _$jscoverage['/base/style.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['500'][1].init(334, 17, 'val !== undefined');
function visit456_500_1(result) {
  _$jscoverage['/base/style.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['498'][1].init(278, 22, 'cssProps[name] || name');
function visit455_498_1(result) {
  _$jscoverage['/base/style.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['493'][2].init(109, 19, 'elem.nodeType === 8');
function visit454_493_2(result) {
  _$jscoverage['/base/style.js'].branchData['493'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['493'][1].init(35, 44, 'elem.nodeType === 8 || !(style = elem.style)');
function visit453_493_1(result) {
  _$jscoverage['/base/style.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['492'][2].init(71, 19, 'elem.nodeType === 3');
function visit452_492_2(result) {
  _$jscoverage['/base/style.js'].branchData['492'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['492'][1].init(71, 80, 'elem.nodeType === 3 || elem.nodeType === 8 || !(style = elem.style)');
function visit451_492_1(result) {
  _$jscoverage['/base/style.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['460'][1].init(512, 37, 'isAutoPosition || NO_PX_REG.test(val)');
function visit450_460_1(result) {
  _$jscoverage['/base/style.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['456'][2].init(328, 23, 'position === "relative"');
function visit449_456_2(result) {
  _$jscoverage['/base/style.js'].branchData['456'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['456'][1].init(310, 41, 'isAutoPosition && position === "relative"');
function visit448_456_1(result) {
  _$jscoverage['/base/style.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['455'][1].init(269, 14, 'val === "auto"');
function visit447_455_1(result) {
  _$jscoverage['/base/style.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['451'][1].init(83, 21, 'position === "static"');
function visit446_451_1(result) {
  _$jscoverage['/base/style.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['449'][1].init(116, 8, 'computed');
function visit445_449_1(result) {
  _$jscoverage['/base/style.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['433'][1].init(48, 8, 'computed');
function visit444_433_1(result) {
  _$jscoverage['/base/style.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['418'][1].init(71, 3, 'ret');
function visit443_418_1(result) {
  _$jscoverage['/base/style.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['413'][1].init(62, 71, 'el && getWHIgnoreDisplay(el, name, includeMargin ? \'margin\' : \'border\')');
function visit442_413_1(result) {
  _$jscoverage['/base/style.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['408'][1].init(62, 45, 'el && getWHIgnoreDisplay(el, name, \'padding\')');
function visit441_408_1(result) {
  _$jscoverage['/base/style.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['343'][1].init(34, 36, '!S.inArray(getNodeName(e), excludes)');
function visit440_343_1(result) {
  _$jscoverage['/base/style.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['338'][1].init(371, 23, 'UA[\'ie\'] || UA[\'opera\']');
function visit439_338_1(result) {
  _$jscoverage['/base/style.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['336'][1].init(261, 12, 'UA[\'webkit\']');
function visit438_336_1(result) {
  _$jscoverage['/base/style.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['334'][1].init(155, 11, 'UA[\'gecko\']');
function visit437_334_1(result) {
  _$jscoverage['/base/style.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['330'][1].init(281, 6, 'j >= 0');
function visit436_330_1(result) {
  _$jscoverage['/base/style.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['310'][1].init(764, 15, 'elem.styleSheet');
function visit435_310_1(result) {
  _$jscoverage['/base/style.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['301'][1].init(498, 4, 'elem');
function visit434_301_1(result) {
  _$jscoverage['/base/style.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['296'][1].init(333, 35, 'id && (id = id.replace(\'#\', EMPTY))');
function visit433_296_1(result) {
  _$jscoverage['/base/style.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['286'][1].init(22, 25, 'typeof refWin == \'string\'');
function visit432_286_1(result) {
  _$jscoverage['/base/style.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['269'][1].init(62, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit431_269_1(result) {
  _$jscoverage['/base/style.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['267'][1].init(121, 6, 'i >= 0');
function visit430_267_1(result) {
  _$jscoverage['/base/style.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['252'][1].init(30, 3, 'old');
function visit429_252_1(result) {
  _$jscoverage['/base/style.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['251'][1].init(154, 12, 'old !== NONE');
function visit428_251_1(result) {
  _$jscoverage['/base/style.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['247'][1].init(121, 6, 'i >= 0');
function visit427_247_1(result) {
  _$jscoverage['/base/style.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['231'][1].init(205, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit426_231_1(result) {
  _$jscoverage['/base/style.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['229'][1].init(80, 36, 'Dom.data(elem, OLD_DISPLAY) || EMPTY');
function visit425_229_1(result) {
  _$jscoverage['/base/style.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['227'][1].init(177, 6, 'i >= 0');
function visit424_227_1(result) {
  _$jscoverage['/base/style.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['211'][1].init(47, 6, 'i >= 0');
function visit423_211_1(result) {
  _$jscoverage['/base/style.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['207'][1].init(493, 25, 'typeof ret == \'undefined\'');
function visit422_207_1(result) {
  _$jscoverage['/base/style.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['202'][3].init(141, 41, '(ret = hook.get(elem, true)) !== undefined');
function visit421_202_3(result) {
  _$jscoverage['/base/style.js'].branchData['202'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['202'][2].init(123, 59, '\'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit420_202_2(result) {
  _$jscoverage['/base/style.js'].branchData['202'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['202'][1].init(115, 67, 'hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit419_202_1(result) {
  _$jscoverage['/base/style.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['200'][1].init(117, 4, 'elem');
function visit418_200_1(result) {
  _$jscoverage['/base/style.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['197'][1].init(665, 17, 'val === undefined');
function visit417_197_1(result) {
  _$jscoverage['/base/style.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['187'][1].init(51, 6, 'i >= 0');
function visit416_187_1(result) {
  _$jscoverage['/base/style.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['185'][1].init(241, 21, 'S.isPlainObject(name)');
function visit415_185_1(result) {
  _$jscoverage['/base/style.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['161'][1].init(47, 6, 'i >= 0');
function visit414_161_1(result) {
  _$jscoverage['/base/style.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['156'][1].init(57, 4, 'elem');
function visit413_156_1(result) {
  _$jscoverage['/base/style.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['154'][1].init(507, 17, 'val === undefined');
function visit412_154_1(result) {
  _$jscoverage['/base/style.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['148'][1].init(51, 6, 'i >= 0');
function visit411_148_1(result) {
  _$jscoverage['/base/style.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['146'][1].init(193, 21, 'S.isPlainObject(name)');
function visit410_146_1(result) {
  _$jscoverage['/base/style.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['114'][1].init(790, 51, 'Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)');
function visit409_114_1(result) {
  _$jscoverage['/base/style.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['109'][2].init(602, 10, 'val === \'\'');
function visit408_109_2(result) {
  _$jscoverage['/base/style.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['109'][1].init(602, 36, 'val === \'\' && !Dom.contains(d, elem)');
function visit407_109_1(result) {
  _$jscoverage['/base/style.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['105'][1].init(28, 59, 'computedStyle.getPropertyValue(name) || computedStyle[name]');
function visit406_105_1(result) {
  _$jscoverage['/base/style.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['104'][1].init(369, 58, 'computedStyle = d.defaultView.getComputedStyle(elem, null)');
function visit405_104_1(result) {
  _$jscoverage['/base/style.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['101'][1].init(257, 22, 'cssProps[name] || name');
function visit404_101_1(result) {
  _$jscoverage['/base/style.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['67'][1].init(21, 31, 'doc.body || doc.documentElement');
function visit403_67_1(result) {
  _$jscoverage['/base/style.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['66'][1].init(105, 26, '!defaultDisplay[tagName]');
function visit402_66_1(result) {
  _$jscoverage['/base/style.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['49'][1].init(1183, 32, 'Features.isTransitionSupported()');
function visit401_49_1(result) {
  _$jscoverage['/base/style.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['43'][1].init(973, 31, 'Features.isTransformSupported()');
function visit400_43_1(result) {
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
  if (visit400_43_1(Features.isTransformSupported())) {
    _$jscoverage['/base/style.js'].lineData[44]++;
    var transform;
    _$jscoverage['/base/style.js'].lineData[45]++;
    transform = cssProps.transform = Features.getTransformProperty();
    _$jscoverage['/base/style.js'].lineData[46]++;
    cssProps.transformOrigin = transform + 'Origin';
  }
  _$jscoverage['/base/style.js'].lineData[49]++;
  if (visit401_49_1(Features.isTransitionSupported())) {
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
    if (visit402_66_1(!defaultDisplay[tagName])) {
      _$jscoverage['/base/style.js'].lineData[67]++;
      body = visit403_67_1(doc.body || doc.documentElement);
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
  name = visit404_101_1(cssProps[name] || name);
  _$jscoverage['/base/style.js'].lineData[104]++;
  if (visit405_104_1(computedStyle = d.defaultView.getComputedStyle(elem, null))) {
    _$jscoverage['/base/style.js'].lineData[105]++;
    val = visit406_105_1(computedStyle.getPropertyValue(name) || computedStyle[name]);
  }
  _$jscoverage['/base/style.js'].lineData[109]++;
  if (visit407_109_1(visit408_109_2(val === '') && !Dom.contains(d, elem))) {
    _$jscoverage['/base/style.js'].lineData[110]++;
    val = elem.style[name];
  }
  _$jscoverage['/base/style.js'].lineData[114]++;
  if (visit409_114_1(Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name))) {
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
  if (visit410_146_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[147]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[148]++;
      for (i = els.length - 1; visit411_148_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[149]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[152]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[154]++;
  if (visit412_154_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[155]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[156]++;
    if (visit413_156_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[157]++;
      ret = style(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[159]++;
    return ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[161]++;
    for (i = els.length - 1; visit414_161_1(i >= 0); i--) {
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
  if (visit415_185_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[186]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[187]++;
      for (i = els.length - 1; visit416_187_1(i >= 0); i--) {
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
  if (visit417_197_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[199]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[200]++;
    if (visit418_200_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[202]++;
      if (visit419_202_1(hook && visit420_202_2('get' in hook && visit421_202_3((ret = hook.get(elem, true)) !== undefined)))) {
      } else {
        _$jscoverage['/base/style.js'].lineData[204]++;
        ret = Dom._getComputedStyle(elem, name);
      }
    }
    _$jscoverage['/base/style.js'].lineData[207]++;
    return (visit422_207_1(typeof ret == 'undefined')) ? '' : ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[211]++;
    for (i = els.length - 1; visit423_211_1(i >= 0); i--) {
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
  for (i = els.length - 1; visit424_227_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[228]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[229]++;
    elem.style[DISPLAY] = visit425_229_1(Dom.data(elem, OLD_DISPLAY) || EMPTY);
    _$jscoverage['/base/style.js'].lineData[231]++;
    if (visit426_231_1(Dom.css(elem, DISPLAY) === NONE)) {
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
  for (i = els.length - 1; visit427_247_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[248]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[249]++;
    var style = elem.style, old = style[DISPLAY];
    _$jscoverage['/base/style.js'].lineData[251]++;
    if (visit428_251_1(old !== NONE)) {
      _$jscoverage['/base/style.js'].lineData[252]++;
      if (visit429_252_1(old)) {
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
  for (i = els.length - 1; visit430_267_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[268]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[269]++;
    if (visit431_269_1(Dom.css(elem, DISPLAY) === NONE)) {
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
  if (visit432_286_1(typeof refWin == 'string')) {
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
  if (visit433_296_1(id && (id = id.replace('#', EMPTY)))) {
    _$jscoverage['/base/style.js'].lineData[297]++;
    elem = Dom.get('#' + id, doc);
  }
  _$jscoverage['/base/style.js'].lineData[301]++;
  if (visit434_301_1(elem)) {
    _$jscoverage['/base/style.js'].lineData[302]++;
    return;
  }
  _$jscoverage['/base/style.js'].lineData[305]++;
  elem = Dom.create('<style>', {
  id: id}, doc);
  _$jscoverage['/base/style.js'].lineData[308]++;
  Dom.get('head', doc).appendChild(elem);
  _$jscoverage['/base/style.js'].lineData[310]++;
  if (visit435_310_1(elem.styleSheet)) {
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
  for (j = _els.length - 1; visit436_330_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[331]++;
    elem = _els[j];
    _$jscoverage['/base/style.js'].lineData[332]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[333]++;
    style['UserSelect'] = 'none';
    _$jscoverage['/base/style.js'].lineData[334]++;
    if (visit437_334_1(UA['gecko'])) {
      _$jscoverage['/base/style.js'].lineData[335]++;
      style['MozUserSelect'] = 'none';
    } else {
      _$jscoverage['/base/style.js'].lineData[336]++;
      if (visit438_336_1(UA['webkit'])) {
        _$jscoverage['/base/style.js'].lineData[337]++;
        style['WebkitUserSelect'] = 'none';
      } else {
        _$jscoverage['/base/style.js'].lineData[338]++;
        if (visit439_338_1(UA['ie'] || UA['opera'])) {
          _$jscoverage['/base/style.js'].lineData[339]++;
          els = elem.getElementsByTagName('*');
          _$jscoverage['/base/style.js'].lineData[340]++;
          elem.setAttribute('unselectable', 'on');
          _$jscoverage['/base/style.js'].lineData[341]++;
          excludes = ['iframe', 'textarea', 'input', 'select'];
          _$jscoverage['/base/style.js'].lineData[342]++;
          while (e = els[i++]) {
            _$jscoverage['/base/style.js'].lineData[343]++;
            if (visit440_343_1(!S.inArray(getNodeName(e), excludes))) {
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
  return visit441_408_1(el && getWHIgnoreDisplay(el, name, 'padding'));
};
  _$jscoverage['/base/style.js'].lineData[411]++;
  Dom['outer' + S.ucfirst(name)] = function(selector, includeMargin) {
  _$jscoverage['/base/style.js'].functionData[14]++;
  _$jscoverage['/base/style.js'].lineData[412]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[413]++;
  return visit442_413_1(el && getWHIgnoreDisplay(el, name, includeMargin ? 'margin' : 'border'));
};
  _$jscoverage['/base/style.js'].lineData[416]++;
  Dom[name] = function(selector, val) {
  _$jscoverage['/base/style.js'].functionData[15]++;
  _$jscoverage['/base/style.js'].lineData[417]++;
  var ret = Dom.css(selector, name, val);
  _$jscoverage['/base/style.js'].lineData[418]++;
  if (visit443_418_1(ret)) {
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
  if (visit444_433_1(computed)) {
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
  if (visit445_449_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[450]++;
    position = Dom.css(el, 'position');
    _$jscoverage['/base/style.js'].lineData[451]++;
    if (visit446_451_1(position === "static")) {
      _$jscoverage['/base/style.js'].lineData[452]++;
      return "auto";
    }
    _$jscoverage['/base/style.js'].lineData[454]++;
    val = Dom._getComputedStyle(el, name);
    _$jscoverage['/base/style.js'].lineData[455]++;
    isAutoPosition = visit447_455_1(val === "auto");
    _$jscoverage['/base/style.js'].lineData[456]++;
    if (visit448_456_1(isAutoPosition && visit449_456_2(position === "relative"))) {
      _$jscoverage['/base/style.js'].lineData[457]++;
      return "0px";
    }
    _$jscoverage['/base/style.js'].lineData[460]++;
    if (visit450_460_1(isAutoPosition || NO_PX_REG.test(val))) {
      _$jscoverage['/base/style.js'].lineData[461]++;
      val = getPosition(el)[name] + 'px';
    }
  }
  _$jscoverage['/base/style.js'].lineData[464]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[469]++;
  function swap(elem, options, callback) {
    _$jscoverage['/base/style.js'].functionData[19]++;
    _$jscoverage['/base/style.js'].lineData[470]++;
    var old = {}, style = elem.style, name;
    _$jscoverage['/base/style.js'].lineData[475]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[476]++;
      old[name] = style[name];
      _$jscoverage['/base/style.js'].lineData[477]++;
      style[name] = options[name];
    }
    _$jscoverage['/base/style.js'].lineData[480]++;
    callback.call(elem);
    _$jscoverage['/base/style.js'].lineData[483]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[484]++;
      style[name] = old[name];
    }
  }
  _$jscoverage['/base/style.js'].lineData[488]++;
  function style(elem, name, val) {
    _$jscoverage['/base/style.js'].functionData[20]++;
    _$jscoverage['/base/style.js'].lineData[489]++;
    var style, ret, hook;
    _$jscoverage['/base/style.js'].lineData[492]++;
    if (visit451_492_1(visit452_492_2(elem.nodeType === 3) || visit453_493_1(visit454_493_2(elem.nodeType === 8) || !(style = elem.style)))) {
      _$jscoverage['/base/style.js'].lineData[494]++;
      return undefined;
    }
    _$jscoverage['/base/style.js'].lineData[496]++;
    name = camelCase(name);
    _$jscoverage['/base/style.js'].lineData[497]++;
    hook = cssHooks[name];
    _$jscoverage['/base/style.js'].lineData[498]++;
    name = visit455_498_1(cssProps[name] || name);
    _$jscoverage['/base/style.js'].lineData[500]++;
    if (visit456_500_1(val !== undefined)) {
      _$jscoverage['/base/style.js'].lineData[502]++;
      if (visit457_502_1(visit458_502_2(val === null) || visit459_502_3(val === EMPTY))) {
        _$jscoverage['/base/style.js'].lineData[503]++;
        val = EMPTY;
      } else {
        _$jscoverage['/base/style.js'].lineData[506]++;
        if (visit460_506_1(!isNaN(Number(val)) && !cssNumber[name])) {
          _$jscoverage['/base/style.js'].lineData[507]++;
          val += DEFAULT_UNIT;
        }
      }
      _$jscoverage['/base/style.js'].lineData[509]++;
      if (visit461_509_1(hook && hook.set)) {
        _$jscoverage['/base/style.js'].lineData[510]++;
        val = hook.set(elem, val);
      }
      _$jscoverage['/base/style.js'].lineData[512]++;
      if (visit462_512_1(val !== undefined)) {
        _$jscoverage['/base/style.js'].lineData[514]++;
        try {
          _$jscoverage['/base/style.js'].lineData[516]++;
          style[name] = val;
        }        catch (e) {
  _$jscoverage['/base/style.js'].lineData[518]++;
  logger.warn('css set error:' + e);
}
        _$jscoverage['/base/style.js'].lineData[521]++;
        if (visit463_521_1(visit464_521_2(val === EMPTY) && style.removeAttribute)) {
          _$jscoverage['/base/style.js'].lineData[522]++;
          style.removeAttribute(name);
        }
      }
      _$jscoverage['/base/style.js'].lineData[525]++;
      if (visit465_525_1(!style.cssText)) {
        _$jscoverage['/base/style.js'].lineData[528]++;
        visit466_528_1(UA.webkit && (style = elem.outerHTML));
        _$jscoverage['/base/style.js'].lineData[529]++;
        elem.removeAttribute('style');
      }
      _$jscoverage['/base/style.js'].lineData[531]++;
      return undefined;
    } else {
      _$jscoverage['/base/style.js'].lineData[536]++;
      if (visit467_536_1(hook && visit468_536_2('get' in hook && visit469_536_3((ret = hook.get(elem, false)) !== undefined)))) {
      } else {
        _$jscoverage['/base/style.js'].lineData[540]++;
        ret = style[name];
      }
      _$jscoverage['/base/style.js'].lineData[542]++;
      return visit470_542_1(ret === undefined) ? '' : ret;
    }
  }
  _$jscoverage['/base/style.js'].lineData[547]++;
  function getWHIgnoreDisplay(elem) {
    _$jscoverage['/base/style.js'].functionData[21]++;
    _$jscoverage['/base/style.js'].lineData[548]++;
    var val, args = arguments;
    _$jscoverage['/base/style.js'].lineData[551]++;
    if (visit471_551_1(elem.offsetWidth !== 0)) {
      _$jscoverage['/base/style.js'].lineData[552]++;
      val = getWH.apply(undefined, args);
    } else {
      _$jscoverage['/base/style.js'].lineData[554]++;
      swap(elem, cssShow, function() {
  _$jscoverage['/base/style.js'].functionData[22]++;
  _$jscoverage['/base/style.js'].lineData[555]++;
  val = getWH.apply(undefined, args);
});
    }
    _$jscoverage['/base/style.js'].lineData[558]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[570]++;
  function getWH(elem, name, extra) {
    _$jscoverage['/base/style.js'].functionData[23]++;
    _$jscoverage['/base/style.js'].lineData[571]++;
    if (visit472_571_1(S.isWindow(elem))) {
      _$jscoverage['/base/style.js'].lineData[572]++;
      return visit473_572_1(name == WIDTH) ? Dom.viewportWidth(elem) : Dom.viewportHeight(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[573]++;
      if (visit474_573_1(elem.nodeType == 9)) {
        _$jscoverage['/base/style.js'].lineData[574]++;
        return visit475_574_1(name == WIDTH) ? Dom.docWidth(elem) : Dom.docHeight(elem);
      }
    }
    _$jscoverage['/base/style.js'].lineData[576]++;
    var which = visit476_576_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'], val = visit477_577_1(name === WIDTH) ? elem.offsetWidth : elem.offsetHeight;
    _$jscoverage['/base/style.js'].lineData[579]++;
    if (visit478_579_1(val > 0)) {
      _$jscoverage['/base/style.js'].lineData[580]++;
      if (visit479_580_1(extra !== 'border')) {
        _$jscoverage['/base/style.js'].lineData[581]++;
        S.each(which, function(w) {
  _$jscoverage['/base/style.js'].functionData[24]++;
  _$jscoverage['/base/style.js'].lineData[582]++;
  if (visit480_582_1(!extra)) {
    _$jscoverage['/base/style.js'].lineData[583]++;
    val -= visit481_583_1(parseFloat(Dom.css(elem, 'padding' + w)) || 0);
  }
  _$jscoverage['/base/style.js'].lineData[585]++;
  if (visit482_585_1(extra === 'margin')) {
    _$jscoverage['/base/style.js'].lineData[586]++;
    val += visit483_586_1(parseFloat(Dom.css(elem, extra + w)) || 0);
  } else {
    _$jscoverage['/base/style.js'].lineData[588]++;
    val -= visit484_588_1(parseFloat(Dom.css(elem, 'border' + w + 'Width')) || 0);
  }
});
      }
      _$jscoverage['/base/style.js'].lineData[593]++;
      return val;
    }
    _$jscoverage['/base/style.js'].lineData[597]++;
    val = Dom._getComputedStyle(elem, name);
    _$jscoverage['/base/style.js'].lineData[598]++;
    if (visit485_598_1(visit486_598_2(val == null) || visit487_598_3((Number(val)) < 0))) {
      _$jscoverage['/base/style.js'].lineData[599]++;
      val = visit488_599_1(elem.style[name] || 0);
    }
    _$jscoverage['/base/style.js'].lineData[602]++;
    val = visit489_602_1(parseFloat(val) || 0);
    _$jscoverage['/base/style.js'].lineData[605]++;
    if (visit490_605_1(extra)) {
      _$jscoverage['/base/style.js'].lineData[606]++;
      S.each(which, function(w) {
  _$jscoverage['/base/style.js'].functionData[25]++;
  _$jscoverage['/base/style.js'].lineData[607]++;
  val += visit491_607_1(parseFloat(Dom.css(elem, 'padding' + w)) || 0);
  _$jscoverage['/base/style.js'].lineData[608]++;
  if (visit492_608_1(extra !== 'padding')) {
    _$jscoverage['/base/style.js'].lineData[609]++;
    val += visit493_609_1(parseFloat(Dom.css(elem, 'border' + w + 'Width')) || 0);
  }
  _$jscoverage['/base/style.js'].lineData[611]++;
  if (visit494_611_1(extra === 'margin')) {
    _$jscoverage['/base/style.js'].lineData[612]++;
    val += visit495_612_1(parseFloat(Dom.css(elem, extra + w)) || 0);
  }
});
    }
    _$jscoverage['/base/style.js'].lineData[617]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[620]++;
  var ROOT_REG = /^(?:body|html)$/i;
  _$jscoverage['/base/style.js'].lineData[622]++;
  function getPosition(el) {
    _$jscoverage['/base/style.js'].functionData[26]++;
    _$jscoverage['/base/style.js'].lineData[623]++;
    var offsetParent, offset, parentOffset = {
  top: 0, 
  left: 0};
    _$jscoverage['/base/style.js'].lineData[627]++;
    if (visit496_627_1(Dom.css(el, 'position') == 'fixed')) {
      _$jscoverage['/base/style.js'].lineData[628]++;
      offset = el.getBoundingClientRect();
    } else {
      _$jscoverage['/base/style.js'].lineData[633]++;
      offsetParent = getOffsetParent(el);
      _$jscoverage['/base/style.js'].lineData[634]++;
      offset = Dom.offset(el);
      _$jscoverage['/base/style.js'].lineData[635]++;
      parentOffset = Dom.offset(offsetParent);
      _$jscoverage['/base/style.js'].lineData[636]++;
      parentOffset.top += visit497_636_1(parseFloat(Dom.css(offsetParent, "borderTopWidth")) || 0);
      _$jscoverage['/base/style.js'].lineData[637]++;
      parentOffset.left += visit498_637_1(parseFloat(Dom.css(offsetParent, "borderLeftWidth")) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[640]++;
    offset.top -= visit499_640_1(parseFloat(Dom.css(el, "marginTop")) || 0);
    _$jscoverage['/base/style.js'].lineData[641]++;
    offset.left -= visit500_641_1(parseFloat(Dom.css(el, "marginLeft")) || 0);
    _$jscoverage['/base/style.js'].lineData[645]++;
    return {
  top: offset.top - parentOffset.top, 
  left: offset.left - parentOffset.left};
  }
  _$jscoverage['/base/style.js'].lineData[651]++;
  function getOffsetParent(el) {
    _$jscoverage['/base/style.js'].functionData[27]++;
    _$jscoverage['/base/style.js'].lineData[652]++;
    var offsetParent = visit501_652_1(el.offsetParent || (visit502_652_2(el.ownerDocument || doc)).body);
    _$jscoverage['/base/style.js'].lineData[653]++;
    while (visit503_653_1(offsetParent && visit504_653_2(!ROOT_REG.test(offsetParent.nodeName) && visit505_654_1(Dom.css(offsetParent, "position") === "static")))) {
      _$jscoverage['/base/style.js'].lineData[655]++;
      offsetParent = offsetParent.offsetParent;
    }
    _$jscoverage['/base/style.js'].lineData[657]++;
    return offsetParent;
  }
  _$jscoverage['/base/style.js'].lineData[660]++;
  return Dom;
}, {
  requires: ['./api']});
