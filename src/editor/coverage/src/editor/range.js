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
if (! _$jscoverage['/editor/range.js']) {
  _$jscoverage['/editor/range.js'] = {};
  _$jscoverage['/editor/range.js'].lineData = [];
  _$jscoverage['/editor/range.js'].lineData[10] = 0;
  _$jscoverage['/editor/range.js'].lineData[15] = 0;
  _$jscoverage['/editor/range.js'].lineData[29] = 0;
  _$jscoverage['/editor/range.js'].lineData[49] = 0;
  _$jscoverage['/editor/range.js'].lineData[54] = 0;
  _$jscoverage['/editor/range.js'].lineData[65] = 0;
  _$jscoverage['/editor/range.js'].lineData[69] = 0;
  _$jscoverage['/editor/range.js'].lineData[75] = 0;
  _$jscoverage['/editor/range.js'].lineData[78] = 0;
  _$jscoverage['/editor/range.js'].lineData[80] = 0;
  _$jscoverage['/editor/range.js'].lineData[83] = 0;
  _$jscoverage['/editor/range.js'].lineData[84] = 0;
  _$jscoverage['/editor/range.js'].lineData[85] = 0;
  _$jscoverage['/editor/range.js'].lineData[87] = 0;
  _$jscoverage['/editor/range.js'].lineData[88] = 0;
  _$jscoverage['/editor/range.js'].lineData[90] = 0;
  _$jscoverage['/editor/range.js'].lineData[92] = 0;
  _$jscoverage['/editor/range.js'].lineData[93] = 0;
  _$jscoverage['/editor/range.js'].lineData[95] = 0;
  _$jscoverage['/editor/range.js'].lineData[96] = 0;
  _$jscoverage['/editor/range.js'].lineData[99] = 0;
  _$jscoverage['/editor/range.js'].lineData[102] = 0;
  _$jscoverage['/editor/range.js'].lineData[103] = 0;
  _$jscoverage['/editor/range.js'].lineData[105] = 0;
  _$jscoverage['/editor/range.js'].lineData[109] = 0;
  _$jscoverage['/editor/range.js'].lineData[120] = 0;
  _$jscoverage['/editor/range.js'].lineData[121] = 0;
  _$jscoverage['/editor/range.js'].lineData[133] = 0;
  _$jscoverage['/editor/range.js'].lineData[134] = 0;
  _$jscoverage['/editor/range.js'].lineData[137] = 0;
  _$jscoverage['/editor/range.js'].lineData[138] = 0;
  _$jscoverage['/editor/range.js'].lineData[142] = 0;
  _$jscoverage['/editor/range.js'].lineData[150] = 0;
  _$jscoverage['/editor/range.js'].lineData[151] = 0;
  _$jscoverage['/editor/range.js'].lineData[152] = 0;
  _$jscoverage['/editor/range.js'].lineData[156] = 0;
  _$jscoverage['/editor/range.js'].lineData[158] = 0;
  _$jscoverage['/editor/range.js'].lineData[160] = 0;
  _$jscoverage['/editor/range.js'].lineData[163] = 0;
  _$jscoverage['/editor/range.js'].lineData[165] = 0;
  _$jscoverage['/editor/range.js'].lineData[174] = 0;
  _$jscoverage['/editor/range.js'].lineData[175] = 0;
  _$jscoverage['/editor/range.js'].lineData[176] = 0;
  _$jscoverage['/editor/range.js'].lineData[183] = 0;
  _$jscoverage['/editor/range.js'].lineData[185] = 0;
  _$jscoverage['/editor/range.js'].lineData[186] = 0;
  _$jscoverage['/editor/range.js'].lineData[187] = 0;
  _$jscoverage['/editor/range.js'].lineData[188] = 0;
  _$jscoverage['/editor/range.js'].lineData[190] = 0;
  _$jscoverage['/editor/range.js'].lineData[192] = 0;
  _$jscoverage['/editor/range.js'].lineData[194] = 0;
  _$jscoverage['/editor/range.js'].lineData[196] = 0;
  _$jscoverage['/editor/range.js'].lineData[203] = 0;
  _$jscoverage['/editor/range.js'].lineData[206] = 0;
  _$jscoverage['/editor/range.js'].lineData[207] = 0;
  _$jscoverage['/editor/range.js'].lineData[210] = 0;
  _$jscoverage['/editor/range.js'].lineData[211] = 0;
  _$jscoverage['/editor/range.js'].lineData[216] = 0;
  _$jscoverage['/editor/range.js'].lineData[218] = 0;
  _$jscoverage['/editor/range.js'].lineData[219] = 0;
  _$jscoverage['/editor/range.js'].lineData[220] = 0;
  _$jscoverage['/editor/range.js'].lineData[226] = 0;
  _$jscoverage['/editor/range.js'].lineData[227] = 0;
  _$jscoverage['/editor/range.js'].lineData[231] = 0;
  _$jscoverage['/editor/range.js'].lineData[239] = 0;
  _$jscoverage['/editor/range.js'].lineData[240] = 0;
  _$jscoverage['/editor/range.js'].lineData[243] = 0;
  _$jscoverage['/editor/range.js'].lineData[245] = 0;
  _$jscoverage['/editor/range.js'].lineData[247] = 0;
  _$jscoverage['/editor/range.js'].lineData[251] = 0;
  _$jscoverage['/editor/range.js'].lineData[253] = 0;
  _$jscoverage['/editor/range.js'].lineData[257] = 0;
  _$jscoverage['/editor/range.js'].lineData[260] = 0;
  _$jscoverage['/editor/range.js'].lineData[261] = 0;
  _$jscoverage['/editor/range.js'].lineData[265] = 0;
  _$jscoverage['/editor/range.js'].lineData[268] = 0;
  _$jscoverage['/editor/range.js'].lineData[270] = 0;
  _$jscoverage['/editor/range.js'].lineData[275] = 0;
  _$jscoverage['/editor/range.js'].lineData[276] = 0;
  _$jscoverage['/editor/range.js'].lineData[277] = 0;
  _$jscoverage['/editor/range.js'].lineData[278] = 0;
  _$jscoverage['/editor/range.js'].lineData[281] = 0;
  _$jscoverage['/editor/range.js'].lineData[285] = 0;
  _$jscoverage['/editor/range.js'].lineData[287] = 0;
  _$jscoverage['/editor/range.js'].lineData[291] = 0;
  _$jscoverage['/editor/range.js'].lineData[294] = 0;
  _$jscoverage['/editor/range.js'].lineData[295] = 0;
  _$jscoverage['/editor/range.js'].lineData[299] = 0;
  _$jscoverage['/editor/range.js'].lineData[303] = 0;
  _$jscoverage['/editor/range.js'].lineData[304] = 0;
  _$jscoverage['/editor/range.js'].lineData[307] = 0;
  _$jscoverage['/editor/range.js'].lineData[310] = 0;
  _$jscoverage['/editor/range.js'].lineData[312] = 0;
  _$jscoverage['/editor/range.js'].lineData[316] = 0;
  _$jscoverage['/editor/range.js'].lineData[321] = 0;
  _$jscoverage['/editor/range.js'].lineData[322] = 0;
  _$jscoverage['/editor/range.js'].lineData[324] = 0;
  _$jscoverage['/editor/range.js'].lineData[327] = 0;
  _$jscoverage['/editor/range.js'].lineData[328] = 0;
  _$jscoverage['/editor/range.js'].lineData[332] = 0;
  _$jscoverage['/editor/range.js'].lineData[335] = 0;
  _$jscoverage['/editor/range.js'].lineData[337] = 0;
  _$jscoverage['/editor/range.js'].lineData[341] = 0;
  _$jscoverage['/editor/range.js'].lineData[345] = 0;
  _$jscoverage['/editor/range.js'].lineData[346] = 0;
  _$jscoverage['/editor/range.js'].lineData[350] = 0;
  _$jscoverage['/editor/range.js'].lineData[354] = 0;
  _$jscoverage['/editor/range.js'].lineData[355] = 0;
  _$jscoverage['/editor/range.js'].lineData[356] = 0;
  _$jscoverage['/editor/range.js'].lineData[360] = 0;
  _$jscoverage['/editor/range.js'].lineData[361] = 0;
  _$jscoverage['/editor/range.js'].lineData[365] = 0;
  _$jscoverage['/editor/range.js'].lineData[366] = 0;
  _$jscoverage['/editor/range.js'].lineData[367] = 0;
  _$jscoverage['/editor/range.js'].lineData[370] = 0;
  _$jscoverage['/editor/range.js'].lineData[371] = 0;
  _$jscoverage['/editor/range.js'].lineData[381] = 0;
  _$jscoverage['/editor/range.js'].lineData[388] = 0;
  _$jscoverage['/editor/range.js'].lineData[392] = 0;
  _$jscoverage['/editor/range.js'].lineData[395] = 0;
  _$jscoverage['/editor/range.js'].lineData[398] = 0;
  _$jscoverage['/editor/range.js'].lineData[402] = 0;
  _$jscoverage['/editor/range.js'].lineData[407] = 0;
  _$jscoverage['/editor/range.js'].lineData[408] = 0;
  _$jscoverage['/editor/range.js'].lineData[411] = 0;
  _$jscoverage['/editor/range.js'].lineData[412] = 0;
  _$jscoverage['/editor/range.js'].lineData[415] = 0;
  _$jscoverage['/editor/range.js'].lineData[418] = 0;
  _$jscoverage['/editor/range.js'].lineData[419] = 0;
  _$jscoverage['/editor/range.js'].lineData[432] = 0;
  _$jscoverage['/editor/range.js'].lineData[433] = 0;
  _$jscoverage['/editor/range.js'].lineData[434] = 0;
  _$jscoverage['/editor/range.js'].lineData[435] = 0;
  _$jscoverage['/editor/range.js'].lineData[436] = 0;
  _$jscoverage['/editor/range.js'].lineData[437] = 0;
  _$jscoverage['/editor/range.js'].lineData[438] = 0;
  _$jscoverage['/editor/range.js'].lineData[439] = 0;
  _$jscoverage['/editor/range.js'].lineData[442] = 0;
  _$jscoverage['/editor/range.js'].lineData[448] = 0;
  _$jscoverage['/editor/range.js'].lineData[452] = 0;
  _$jscoverage['/editor/range.js'].lineData[453] = 0;
  _$jscoverage['/editor/range.js'].lineData[454] = 0;
  _$jscoverage['/editor/range.js'].lineData[464] = 0;
  _$jscoverage['/editor/range.js'].lineData[468] = 0;
  _$jscoverage['/editor/range.js'].lineData[469] = 0;
  _$jscoverage['/editor/range.js'].lineData[470] = 0;
  _$jscoverage['/editor/range.js'].lineData[471] = 0;
  _$jscoverage['/editor/range.js'].lineData[472] = 0;
  _$jscoverage['/editor/range.js'].lineData[476] = 0;
  _$jscoverage['/editor/range.js'].lineData[477] = 0;
  _$jscoverage['/editor/range.js'].lineData[479] = 0;
  _$jscoverage['/editor/range.js'].lineData[480] = 0;
  _$jscoverage['/editor/range.js'].lineData[481] = 0;
  _$jscoverage['/editor/range.js'].lineData[482] = 0;
  _$jscoverage['/editor/range.js'].lineData[483] = 0;
  _$jscoverage['/editor/range.js'].lineData[493] = 0;
  _$jscoverage['/editor/range.js'].lineData[500] = 0;
  _$jscoverage['/editor/range.js'].lineData[507] = 0;
  _$jscoverage['/editor/range.js'].lineData[514] = 0;
  _$jscoverage['/editor/range.js'].lineData[521] = 0;
  _$jscoverage['/editor/range.js'].lineData[525] = 0;
  _$jscoverage['/editor/range.js'].lineData[528] = 0;
  _$jscoverage['/editor/range.js'].lineData[530] = 0;
  _$jscoverage['/editor/range.js'].lineData[533] = 0;
  _$jscoverage['/editor/range.js'].lineData[551] = 0;
  _$jscoverage['/editor/range.js'].lineData[552] = 0;
  _$jscoverage['/editor/range.js'].lineData[553] = 0;
  _$jscoverage['/editor/range.js'].lineData[554] = 0;
  _$jscoverage['/editor/range.js'].lineData[557] = 0;
  _$jscoverage['/editor/range.js'].lineData[558] = 0;
  _$jscoverage['/editor/range.js'].lineData[560] = 0;
  _$jscoverage['/editor/range.js'].lineData[561] = 0;
  _$jscoverage['/editor/range.js'].lineData[562] = 0;
  _$jscoverage['/editor/range.js'].lineData[565] = 0;
  _$jscoverage['/editor/range.js'].lineData[582] = 0;
  _$jscoverage['/editor/range.js'].lineData[583] = 0;
  _$jscoverage['/editor/range.js'].lineData[584] = 0;
  _$jscoverage['/editor/range.js'].lineData[585] = 0;
  _$jscoverage['/editor/range.js'].lineData[588] = 0;
  _$jscoverage['/editor/range.js'].lineData[589] = 0;
  _$jscoverage['/editor/range.js'].lineData[591] = 0;
  _$jscoverage['/editor/range.js'].lineData[592] = 0;
  _$jscoverage['/editor/range.js'].lineData[593] = 0;
  _$jscoverage['/editor/range.js'].lineData[596] = 0;
  _$jscoverage['/editor/range.js'].lineData[605] = 0;
  _$jscoverage['/editor/range.js'].lineData[606] = 0;
  _$jscoverage['/editor/range.js'].lineData[608] = 0;
  _$jscoverage['/editor/range.js'].lineData[609] = 0;
  _$jscoverage['/editor/range.js'].lineData[612] = 0;
  _$jscoverage['/editor/range.js'].lineData[613] = 0;
  _$jscoverage['/editor/range.js'].lineData[615] = 0;
  _$jscoverage['/editor/range.js'].lineData[617] = 0;
  _$jscoverage['/editor/range.js'].lineData[620] = 0;
  _$jscoverage['/editor/range.js'].lineData[621] = 0;
  _$jscoverage['/editor/range.js'].lineData[624] = 0;
  _$jscoverage['/editor/range.js'].lineData[627] = 0;
  _$jscoverage['/editor/range.js'].lineData[636] = 0;
  _$jscoverage['/editor/range.js'].lineData[637] = 0;
  _$jscoverage['/editor/range.js'].lineData[639] = 0;
  _$jscoverage['/editor/range.js'].lineData[640] = 0;
  _$jscoverage['/editor/range.js'].lineData[643] = 0;
  _$jscoverage['/editor/range.js'].lineData[644] = 0;
  _$jscoverage['/editor/range.js'].lineData[646] = 0;
  _$jscoverage['/editor/range.js'].lineData[648] = 0;
  _$jscoverage['/editor/range.js'].lineData[651] = 0;
  _$jscoverage['/editor/range.js'].lineData[652] = 0;
  _$jscoverage['/editor/range.js'].lineData[655] = 0;
  _$jscoverage['/editor/range.js'].lineData[658] = 0;
  _$jscoverage['/editor/range.js'].lineData[665] = 0;
  _$jscoverage['/editor/range.js'].lineData[672] = 0;
  _$jscoverage['/editor/range.js'].lineData[679] = 0;
  _$jscoverage['/editor/range.js'].lineData[687] = 0;
  _$jscoverage['/editor/range.js'].lineData[688] = 0;
  _$jscoverage['/editor/range.js'].lineData[689] = 0;
  _$jscoverage['/editor/range.js'].lineData[690] = 0;
  _$jscoverage['/editor/range.js'].lineData[692] = 0;
  _$jscoverage['/editor/range.js'].lineData[693] = 0;
  _$jscoverage['/editor/range.js'].lineData[695] = 0;
  _$jscoverage['/editor/range.js'].lineData[703] = 0;
  _$jscoverage['/editor/range.js'].lineData[706] = 0;
  _$jscoverage['/editor/range.js'].lineData[707] = 0;
  _$jscoverage['/editor/range.js'].lineData[708] = 0;
  _$jscoverage['/editor/range.js'].lineData[709] = 0;
  _$jscoverage['/editor/range.js'].lineData[710] = 0;
  _$jscoverage['/editor/range.js'].lineData[712] = 0;
  _$jscoverage['/editor/range.js'].lineData[724] = 0;
  _$jscoverage['/editor/range.js'].lineData[727] = 0;
  _$jscoverage['/editor/range.js'].lineData[729] = 0;
  _$jscoverage['/editor/range.js'].lineData[731] = 0;
  _$jscoverage['/editor/range.js'].lineData[734] = 0;
  _$jscoverage['/editor/range.js'].lineData[737] = 0;
  _$jscoverage['/editor/range.js'].lineData[738] = 0;
  _$jscoverage['/editor/range.js'].lineData[745] = 0;
  _$jscoverage['/editor/range.js'].lineData[746] = 0;
  _$jscoverage['/editor/range.js'].lineData[747] = 0;
  _$jscoverage['/editor/range.js'].lineData[749] = 0;
  _$jscoverage['/editor/range.js'].lineData[759] = 0;
  _$jscoverage['/editor/range.js'].lineData[760] = 0;
  _$jscoverage['/editor/range.js'].lineData[761] = 0;
  _$jscoverage['/editor/range.js'].lineData[763] = 0;
  _$jscoverage['/editor/range.js'].lineData[774] = 0;
  _$jscoverage['/editor/range.js'].lineData[776] = 0;
  _$jscoverage['/editor/range.js'].lineData[777] = 0;
  _$jscoverage['/editor/range.js'].lineData[778] = 0;
  _$jscoverage['/editor/range.js'].lineData[779] = 0;
  _$jscoverage['/editor/range.js'].lineData[783] = 0;
  _$jscoverage['/editor/range.js'].lineData[784] = 0;
  _$jscoverage['/editor/range.js'].lineData[788] = 0;
  _$jscoverage['/editor/range.js'].lineData[790] = 0;
  _$jscoverage['/editor/range.js'].lineData[791] = 0;
  _$jscoverage['/editor/range.js'].lineData[792] = 0;
  _$jscoverage['/editor/range.js'].lineData[793] = 0;
  _$jscoverage['/editor/range.js'].lineData[795] = 0;
  _$jscoverage['/editor/range.js'].lineData[796] = 0;
  _$jscoverage['/editor/range.js'].lineData[800] = 0;
  _$jscoverage['/editor/range.js'].lineData[802] = 0;
  _$jscoverage['/editor/range.js'].lineData[804] = 0;
  _$jscoverage['/editor/range.js'].lineData[805] = 0;
  _$jscoverage['/editor/range.js'].lineData[809] = 0;
  _$jscoverage['/editor/range.js'].lineData[811] = 0;
  _$jscoverage['/editor/range.js'].lineData[813] = 0;
  _$jscoverage['/editor/range.js'].lineData[816] = 0;
  _$jscoverage['/editor/range.js'].lineData[817] = 0;
  _$jscoverage['/editor/range.js'].lineData[819] = 0;
  _$jscoverage['/editor/range.js'].lineData[820] = 0;
  _$jscoverage['/editor/range.js'].lineData[822] = 0;
  _$jscoverage['/editor/range.js'].lineData[827] = 0;
  _$jscoverage['/editor/range.js'].lineData[828] = 0;
  _$jscoverage['/editor/range.js'].lineData[829] = 0;
  _$jscoverage['/editor/range.js'].lineData[830] = 0;
  _$jscoverage['/editor/range.js'].lineData[834] = 0;
  _$jscoverage['/editor/range.js'].lineData[835] = 0;
  _$jscoverage['/editor/range.js'].lineData[836] = 0;
  _$jscoverage['/editor/range.js'].lineData[837] = 0;
  _$jscoverage['/editor/range.js'].lineData[838] = 0;
  _$jscoverage['/editor/range.js'].lineData[842] = 0;
  _$jscoverage['/editor/range.js'].lineData[852] = 0;
  _$jscoverage['/editor/range.js'].lineData[862] = 0;
  _$jscoverage['/editor/range.js'].lineData[863] = 0;
  _$jscoverage['/editor/range.js'].lineData[869] = 0;
  _$jscoverage['/editor/range.js'].lineData[872] = 0;
  _$jscoverage['/editor/range.js'].lineData[873] = 0;
  _$jscoverage['/editor/range.js'].lineData[877] = 0;
  _$jscoverage['/editor/range.js'].lineData[879] = 0;
  _$jscoverage['/editor/range.js'].lineData[880] = 0;
  _$jscoverage['/editor/range.js'].lineData[886] = 0;
  _$jscoverage['/editor/range.js'].lineData[889] = 0;
  _$jscoverage['/editor/range.js'].lineData[890] = 0;
  _$jscoverage['/editor/range.js'].lineData[894] = 0;
  _$jscoverage['/editor/range.js'].lineData[897] = 0;
  _$jscoverage['/editor/range.js'].lineData[898] = 0;
  _$jscoverage['/editor/range.js'].lineData[902] = 0;
  _$jscoverage['/editor/range.js'].lineData[905] = 0;
  _$jscoverage['/editor/range.js'].lineData[906] = 0;
  _$jscoverage['/editor/range.js'].lineData[911] = 0;
  _$jscoverage['/editor/range.js'].lineData[914] = 0;
  _$jscoverage['/editor/range.js'].lineData[915] = 0;
  _$jscoverage['/editor/range.js'].lineData[920] = 0;
  _$jscoverage['/editor/range.js'].lineData[934] = 0;
  _$jscoverage['/editor/range.js'].lineData[940] = 0;
  _$jscoverage['/editor/range.js'].lineData[941] = 0;
  _$jscoverage['/editor/range.js'].lineData[942] = 0;
  _$jscoverage['/editor/range.js'].lineData[946] = 0;
  _$jscoverage['/editor/range.js'].lineData[948] = 0;
  _$jscoverage['/editor/range.js'].lineData[949] = 0;
  _$jscoverage['/editor/range.js'].lineData[950] = 0;
  _$jscoverage['/editor/range.js'].lineData[954] = 0;
  _$jscoverage['/editor/range.js'].lineData[955] = 0;
  _$jscoverage['/editor/range.js'].lineData[956] = 0;
  _$jscoverage['/editor/range.js'].lineData[958] = 0;
  _$jscoverage['/editor/range.js'].lineData[959] = 0;
  _$jscoverage['/editor/range.js'].lineData[962] = 0;
  _$jscoverage['/editor/range.js'].lineData[963] = 0;
  _$jscoverage['/editor/range.js'].lineData[964] = 0;
  _$jscoverage['/editor/range.js'].lineData[967] = 0;
  _$jscoverage['/editor/range.js'].lineData[968] = 0;
  _$jscoverage['/editor/range.js'].lineData[969] = 0;
  _$jscoverage['/editor/range.js'].lineData[972] = 0;
  _$jscoverage['/editor/range.js'].lineData[973] = 0;
  _$jscoverage['/editor/range.js'].lineData[974] = 0;
  _$jscoverage['/editor/range.js'].lineData[976] = 0;
  _$jscoverage['/editor/range.js'].lineData[979] = 0;
  _$jscoverage['/editor/range.js'].lineData[993] = 0;
  _$jscoverage['/editor/range.js'].lineData[994] = 0;
  _$jscoverage['/editor/range.js'].lineData[995] = 0;
  _$jscoverage['/editor/range.js'].lineData[1004] = 0;
  _$jscoverage['/editor/range.js'].lineData[1009] = 0;
  _$jscoverage['/editor/range.js'].lineData[1014] = 0;
  _$jscoverage['/editor/range.js'].lineData[1015] = 0;
  _$jscoverage['/editor/range.js'].lineData[1016] = 0;
  _$jscoverage['/editor/range.js'].lineData[1020] = 0;
  _$jscoverage['/editor/range.js'].lineData[1021] = 0;
  _$jscoverage['/editor/range.js'].lineData[1022] = 0;
  _$jscoverage['/editor/range.js'].lineData[1027] = 0;
  _$jscoverage['/editor/range.js'].lineData[1029] = 0;
  _$jscoverage['/editor/range.js'].lineData[1030] = 0;
  _$jscoverage['/editor/range.js'].lineData[1033] = 0;
  _$jscoverage['/editor/range.js'].lineData[1034] = 0;
  _$jscoverage['/editor/range.js'].lineData[1035] = 0;
  _$jscoverage['/editor/range.js'].lineData[1036] = 0;
  _$jscoverage['/editor/range.js'].lineData[1040] = 0;
  _$jscoverage['/editor/range.js'].lineData[1042] = 0;
  _$jscoverage['/editor/range.js'].lineData[1043] = 0;
  _$jscoverage['/editor/range.js'].lineData[1044] = 0;
  _$jscoverage['/editor/range.js'].lineData[1048] = 0;
  _$jscoverage['/editor/range.js'].lineData[1051] = 0;
  _$jscoverage['/editor/range.js'].lineData[1055] = 0;
  _$jscoverage['/editor/range.js'].lineData[1056] = 0;
  _$jscoverage['/editor/range.js'].lineData[1057] = 0;
  _$jscoverage['/editor/range.js'].lineData[1061] = 0;
  _$jscoverage['/editor/range.js'].lineData[1062] = 0;
  _$jscoverage['/editor/range.js'].lineData[1063] = 0;
  _$jscoverage['/editor/range.js'].lineData[1068] = 0;
  _$jscoverage['/editor/range.js'].lineData[1070] = 0;
  _$jscoverage['/editor/range.js'].lineData[1071] = 0;
  _$jscoverage['/editor/range.js'].lineData[1074] = 0;
  _$jscoverage['/editor/range.js'].lineData[1082] = 0;
  _$jscoverage['/editor/range.js'].lineData[1083] = 0;
  _$jscoverage['/editor/range.js'].lineData[1084] = 0;
  _$jscoverage['/editor/range.js'].lineData[1085] = 0;
  _$jscoverage['/editor/range.js'].lineData[1089] = 0;
  _$jscoverage['/editor/range.js'].lineData[1091] = 0;
  _$jscoverage['/editor/range.js'].lineData[1092] = 0;
  _$jscoverage['/editor/range.js'].lineData[1095] = 0;
  _$jscoverage['/editor/range.js'].lineData[1103] = 0;
  _$jscoverage['/editor/range.js'].lineData[1105] = 0;
  _$jscoverage['/editor/range.js'].lineData[1107] = 0;
  _$jscoverage['/editor/range.js'].lineData[1113] = 0;
  _$jscoverage['/editor/range.js'].lineData[1116] = 0;
  _$jscoverage['/editor/range.js'].lineData[1117] = 0;
  _$jscoverage['/editor/range.js'].lineData[1119] = 0;
  _$jscoverage['/editor/range.js'].lineData[1123] = 0;
  _$jscoverage['/editor/range.js'].lineData[1130] = 0;
  _$jscoverage['/editor/range.js'].lineData[1133] = 0;
  _$jscoverage['/editor/range.js'].lineData[1137] = 0;
  _$jscoverage['/editor/range.js'].lineData[1138] = 0;
  _$jscoverage['/editor/range.js'].lineData[1139] = 0;
  _$jscoverage['/editor/range.js'].lineData[1141] = 0;
  _$jscoverage['/editor/range.js'].lineData[1152] = 0;
  _$jscoverage['/editor/range.js'].lineData[1157] = 0;
  _$jscoverage['/editor/range.js'].lineData[1158] = 0;
  _$jscoverage['/editor/range.js'].lineData[1161] = 0;
  _$jscoverage['/editor/range.js'].lineData[1163] = 0;
  _$jscoverage['/editor/range.js'].lineData[1166] = 0;
  _$jscoverage['/editor/range.js'].lineData[1169] = 0;
  _$jscoverage['/editor/range.js'].lineData[1183] = 0;
  _$jscoverage['/editor/range.js'].lineData[1184] = 0;
  _$jscoverage['/editor/range.js'].lineData[1192] = 0;
  _$jscoverage['/editor/range.js'].lineData[1193] = 0;
  _$jscoverage['/editor/range.js'].lineData[1195] = 0;
  _$jscoverage['/editor/range.js'].lineData[1196] = 0;
  _$jscoverage['/editor/range.js'].lineData[1199] = 0;
  _$jscoverage['/editor/range.js'].lineData[1200] = 0;
  _$jscoverage['/editor/range.js'].lineData[1205] = 0;
  _$jscoverage['/editor/range.js'].lineData[1207] = 0;
  _$jscoverage['/editor/range.js'].lineData[1210] = 0;
  _$jscoverage['/editor/range.js'].lineData[1212] = 0;
  _$jscoverage['/editor/range.js'].lineData[1215] = 0;
  _$jscoverage['/editor/range.js'].lineData[1217] = 0;
  _$jscoverage['/editor/range.js'].lineData[1218] = 0;
  _$jscoverage['/editor/range.js'].lineData[1219] = 0;
  _$jscoverage['/editor/range.js'].lineData[1221] = 0;
  _$jscoverage['/editor/range.js'].lineData[1226] = 0;
  _$jscoverage['/editor/range.js'].lineData[1228] = 0;
  _$jscoverage['/editor/range.js'].lineData[1230] = 0;
  _$jscoverage['/editor/range.js'].lineData[1232] = 0;
  _$jscoverage['/editor/range.js'].lineData[1239] = 0;
  _$jscoverage['/editor/range.js'].lineData[1241] = 0;
  _$jscoverage['/editor/range.js'].lineData[1242] = 0;
  _$jscoverage['/editor/range.js'].lineData[1245] = 0;
  _$jscoverage['/editor/range.js'].lineData[1246] = 0;
  _$jscoverage['/editor/range.js'].lineData[1247] = 0;
  _$jscoverage['/editor/range.js'].lineData[1250] = 0;
  _$jscoverage['/editor/range.js'].lineData[1253] = 0;
  _$jscoverage['/editor/range.js'].lineData[1254] = 0;
  _$jscoverage['/editor/range.js'].lineData[1259] = 0;
  _$jscoverage['/editor/range.js'].lineData[1260] = 0;
  _$jscoverage['/editor/range.js'].lineData[1261] = 0;
  _$jscoverage['/editor/range.js'].lineData[1264] = 0;
  _$jscoverage['/editor/range.js'].lineData[1265] = 0;
  _$jscoverage['/editor/range.js'].lineData[1268] = 0;
  _$jscoverage['/editor/range.js'].lineData[1271] = 0;
  _$jscoverage['/editor/range.js'].lineData[1272] = 0;
  _$jscoverage['/editor/range.js'].lineData[1274] = 0;
  _$jscoverage['/editor/range.js'].lineData[1275] = 0;
  _$jscoverage['/editor/range.js'].lineData[1276] = 0;
  _$jscoverage['/editor/range.js'].lineData[1277] = 0;
  _$jscoverage['/editor/range.js'].lineData[1280] = 0;
  _$jscoverage['/editor/range.js'].lineData[1286] = 0;
  _$jscoverage['/editor/range.js'].lineData[1287] = 0;
  _$jscoverage['/editor/range.js'].lineData[1289] = 0;
  _$jscoverage['/editor/range.js'].lineData[1290] = 0;
  _$jscoverage['/editor/range.js'].lineData[1292] = 0;
  _$jscoverage['/editor/range.js'].lineData[1300] = 0;
  _$jscoverage['/editor/range.js'].lineData[1301] = 0;
  _$jscoverage['/editor/range.js'].lineData[1302] = 0;
  _$jscoverage['/editor/range.js'].lineData[1304] = 0;
  _$jscoverage['/editor/range.js'].lineData[1308] = 0;
  _$jscoverage['/editor/range.js'].lineData[1309] = 0;
  _$jscoverage['/editor/range.js'].lineData[1310] = 0;
  _$jscoverage['/editor/range.js'].lineData[1312] = 0;
  _$jscoverage['/editor/range.js'].lineData[1315] = 0;
  _$jscoverage['/editor/range.js'].lineData[1317] = 0;
  _$jscoverage['/editor/range.js'].lineData[1320] = 0;
  _$jscoverage['/editor/range.js'].lineData[1324] = 0;
  _$jscoverage['/editor/range.js'].lineData[1340] = 0;
  _$jscoverage['/editor/range.js'].lineData[1341] = 0;
  _$jscoverage['/editor/range.js'].lineData[1342] = 0;
  _$jscoverage['/editor/range.js'].lineData[1343] = 0;
  _$jscoverage['/editor/range.js'].lineData[1346] = 0;
  _$jscoverage['/editor/range.js'].lineData[1348] = 0;
  _$jscoverage['/editor/range.js'].lineData[1351] = 0;
  _$jscoverage['/editor/range.js'].lineData[1354] = 0;
  _$jscoverage['/editor/range.js'].lineData[1358] = 0;
  _$jscoverage['/editor/range.js'].lineData[1366] = 0;
  _$jscoverage['/editor/range.js'].lineData[1367] = 0;
  _$jscoverage['/editor/range.js'].lineData[1378] = 0;
  _$jscoverage['/editor/range.js'].lineData[1384] = 0;
  _$jscoverage['/editor/range.js'].lineData[1385] = 0;
  _$jscoverage['/editor/range.js'].lineData[1386] = 0;
  _$jscoverage['/editor/range.js'].lineData[1387] = 0;
  _$jscoverage['/editor/range.js'].lineData[1394] = 0;
  _$jscoverage['/editor/range.js'].lineData[1398] = 0;
  _$jscoverage['/editor/range.js'].lineData[1401] = 0;
  _$jscoverage['/editor/range.js'].lineData[1402] = 0;
  _$jscoverage['/editor/range.js'].lineData[1403] = 0;
  _$jscoverage['/editor/range.js'].lineData[1405] = 0;
  _$jscoverage['/editor/range.js'].lineData[1406] = 0;
  _$jscoverage['/editor/range.js'].lineData[1408] = 0;
  _$jscoverage['/editor/range.js'].lineData[1416] = 0;
  _$jscoverage['/editor/range.js'].lineData[1421] = 0;
  _$jscoverage['/editor/range.js'].lineData[1422] = 0;
  _$jscoverage['/editor/range.js'].lineData[1423] = 0;
  _$jscoverage['/editor/range.js'].lineData[1424] = 0;
  _$jscoverage['/editor/range.js'].lineData[1431] = 0;
  _$jscoverage['/editor/range.js'].lineData[1435] = 0;
  _$jscoverage['/editor/range.js'].lineData[1438] = 0;
  _$jscoverage['/editor/range.js'].lineData[1439] = 0;
  _$jscoverage['/editor/range.js'].lineData[1440] = 0;
  _$jscoverage['/editor/range.js'].lineData[1442] = 0;
  _$jscoverage['/editor/range.js'].lineData[1443] = 0;
  _$jscoverage['/editor/range.js'].lineData[1445] = 0;
  _$jscoverage['/editor/range.js'].lineData[1454] = 0;
  _$jscoverage['/editor/range.js'].lineData[1458] = 0;
  _$jscoverage['/editor/range.js'].lineData[1462] = 0;
  _$jscoverage['/editor/range.js'].lineData[1464] = 0;
  _$jscoverage['/editor/range.js'].lineData[1465] = 0;
  _$jscoverage['/editor/range.js'].lineData[1474] = 0;
  _$jscoverage['/editor/range.js'].lineData[1481] = 0;
  _$jscoverage['/editor/range.js'].lineData[1482] = 0;
  _$jscoverage['/editor/range.js'].lineData[1483] = 0;
  _$jscoverage['/editor/range.js'].lineData[1484] = 0;
  _$jscoverage['/editor/range.js'].lineData[1485] = 0;
  _$jscoverage['/editor/range.js'].lineData[1487] = 0;
  _$jscoverage['/editor/range.js'].lineData[1491] = 0;
  _$jscoverage['/editor/range.js'].lineData[1492] = 0;
  _$jscoverage['/editor/range.js'].lineData[1493] = 0;
  _$jscoverage['/editor/range.js'].lineData[1496] = 0;
  _$jscoverage['/editor/range.js'].lineData[1501] = 0;
  _$jscoverage['/editor/range.js'].lineData[1505] = 0;
  _$jscoverage['/editor/range.js'].lineData[1506] = 0;
  _$jscoverage['/editor/range.js'].lineData[1507] = 0;
  _$jscoverage['/editor/range.js'].lineData[1508] = 0;
  _$jscoverage['/editor/range.js'].lineData[1511] = 0;
  _$jscoverage['/editor/range.js'].lineData[1512] = 0;
  _$jscoverage['/editor/range.js'].lineData[1516] = 0;
  _$jscoverage['/editor/range.js'].lineData[1517] = 0;
  _$jscoverage['/editor/range.js'].lineData[1518] = 0;
  _$jscoverage['/editor/range.js'].lineData[1519] = 0;
  _$jscoverage['/editor/range.js'].lineData[1525] = 0;
  _$jscoverage['/editor/range.js'].lineData[1526] = 0;
  _$jscoverage['/editor/range.js'].lineData[1529] = 0;
  _$jscoverage['/editor/range.js'].lineData[1540] = 0;
  _$jscoverage['/editor/range.js'].lineData[1543] = 0;
  _$jscoverage['/editor/range.js'].lineData[1544] = 0;
  _$jscoverage['/editor/range.js'].lineData[1545] = 0;
  _$jscoverage['/editor/range.js'].lineData[1546] = 0;
  _$jscoverage['/editor/range.js'].lineData[1547] = 0;
  _$jscoverage['/editor/range.js'].lineData[1548] = 0;
  _$jscoverage['/editor/range.js'].lineData[1550] = 0;
  _$jscoverage['/editor/range.js'].lineData[1551] = 0;
  _$jscoverage['/editor/range.js'].lineData[1552] = 0;
  _$jscoverage['/editor/range.js'].lineData[1561] = 0;
  _$jscoverage['/editor/range.js'].lineData[1571] = 0;
  _$jscoverage['/editor/range.js'].lineData[1572] = 0;
  _$jscoverage['/editor/range.js'].lineData[1576] = 0;
  _$jscoverage['/editor/range.js'].lineData[1577] = 0;
  _$jscoverage['/editor/range.js'].lineData[1578] = 0;
  _$jscoverage['/editor/range.js'].lineData[1579] = 0;
  _$jscoverage['/editor/range.js'].lineData[1582] = 0;
  _$jscoverage['/editor/range.js'].lineData[1583] = 0;
  _$jscoverage['/editor/range.js'].lineData[1588] = 0;
  _$jscoverage['/editor/range.js'].lineData[1592] = 0;
  _$jscoverage['/editor/range.js'].lineData[1594] = 0;
  _$jscoverage['/editor/range.js'].lineData[1595] = 0;
  _$jscoverage['/editor/range.js'].lineData[1596] = 0;
  _$jscoverage['/editor/range.js'].lineData[1597] = 0;
  _$jscoverage['/editor/range.js'].lineData[1598] = 0;
  _$jscoverage['/editor/range.js'].lineData[1600] = 0;
  _$jscoverage['/editor/range.js'].lineData[1601] = 0;
  _$jscoverage['/editor/range.js'].lineData[1602] = 0;
  _$jscoverage['/editor/range.js'].lineData[1603] = 0;
  _$jscoverage['/editor/range.js'].lineData[1606] = 0;
  _$jscoverage['/editor/range.js'].lineData[1610] = 0;
  _$jscoverage['/editor/range.js'].lineData[1611] = 0;
  _$jscoverage['/editor/range.js'].lineData[1616] = 0;
  _$jscoverage['/editor/range.js'].lineData[1631] = 0;
  _$jscoverage['/editor/range.js'].lineData[1632] = 0;
  _$jscoverage['/editor/range.js'].lineData[1633] = 0;
  _$jscoverage['/editor/range.js'].lineData[1637] = 0;
  _$jscoverage['/editor/range.js'].lineData[1638] = 0;
  _$jscoverage['/editor/range.js'].lineData[1643] = 0;
  _$jscoverage['/editor/range.js'].lineData[1645] = 0;
  _$jscoverage['/editor/range.js'].lineData[1646] = 0;
  _$jscoverage['/editor/range.js'].lineData[1647] = 0;
  _$jscoverage['/editor/range.js'].lineData[1659] = 0;
  _$jscoverage['/editor/range.js'].lineData[1660] = 0;
  _$jscoverage['/editor/range.js'].lineData[1662] = 0;
  _$jscoverage['/editor/range.js'].lineData[1664] = 0;
  _$jscoverage['/editor/range.js'].lineData[1667] = 0;
  _$jscoverage['/editor/range.js'].lineData[1668] = 0;
  _$jscoverage['/editor/range.js'].lineData[1671] = 0;
  _$jscoverage['/editor/range.js'].lineData[1674] = 0;
  _$jscoverage['/editor/range.js'].lineData[1676] = 0;
  _$jscoverage['/editor/range.js'].lineData[1678] = 0;
  _$jscoverage['/editor/range.js'].lineData[1679] = 0;
  _$jscoverage['/editor/range.js'].lineData[1682] = 0;
  _$jscoverage['/editor/range.js'].lineData[1683] = 0;
  _$jscoverage['/editor/range.js'].lineData[1687] = 0;
  _$jscoverage['/editor/range.js'].lineData[1688] = 0;
  _$jscoverage['/editor/range.js'].lineData[1691] = 0;
  _$jscoverage['/editor/range.js'].lineData[1694] = 0;
  _$jscoverage['/editor/range.js'].lineData[1697] = 0;
  _$jscoverage['/editor/range.js'].lineData[1705] = 0;
  _$jscoverage['/editor/range.js'].lineData[1706] = 0;
  _$jscoverage['/editor/range.js'].lineData[1707] = 0;
  _$jscoverage['/editor/range.js'].lineData[1717] = 0;
  _$jscoverage['/editor/range.js'].lineData[1723] = 0;
  _$jscoverage['/editor/range.js'].lineData[1724] = 0;
  _$jscoverage['/editor/range.js'].lineData[1725] = 0;
  _$jscoverage['/editor/range.js'].lineData[1726] = 0;
  _$jscoverage['/editor/range.js'].lineData[1727] = 0;
  _$jscoverage['/editor/range.js'].lineData[1730] = 0;
  _$jscoverage['/editor/range.js'].lineData[1731] = 0;
  _$jscoverage['/editor/range.js'].lineData[1732] = 0;
  _$jscoverage['/editor/range.js'].lineData[1733] = 0;
  _$jscoverage['/editor/range.js'].lineData[1735] = 0;
  _$jscoverage['/editor/range.js'].lineData[1737] = 0;
  _$jscoverage['/editor/range.js'].lineData[1740] = 0;
  _$jscoverage['/editor/range.js'].lineData[1741] = 0;
  _$jscoverage['/editor/range.js'].lineData[1745] = 0;
  _$jscoverage['/editor/range.js'].lineData[1749] = 0;
  _$jscoverage['/editor/range.js'].lineData[1751] = 0;
  _$jscoverage['/editor/range.js'].lineData[1752] = 0;
  _$jscoverage['/editor/range.js'].lineData[1754] = 0;
  _$jscoverage['/editor/range.js'].lineData[1760] = 0;
  _$jscoverage['/editor/range.js'].lineData[1761] = 0;
  _$jscoverage['/editor/range.js'].lineData[1764] = 0;
  _$jscoverage['/editor/range.js'].lineData[1767] = 0;
  _$jscoverage['/editor/range.js'].lineData[1770] = 0;
  _$jscoverage['/editor/range.js'].lineData[1774] = 0;
  _$jscoverage['/editor/range.js'].lineData[1776] = 0;
}
if (! _$jscoverage['/editor/range.js'].functionData) {
  _$jscoverage['/editor/range.js'].functionData = [];
  _$jscoverage['/editor/range.js'].functionData[0] = 0;
  _$jscoverage['/editor/range.js'].functionData[1] = 0;
  _$jscoverage['/editor/range.js'].functionData[2] = 0;
  _$jscoverage['/editor/range.js'].functionData[3] = 0;
  _$jscoverage['/editor/range.js'].functionData[4] = 0;
  _$jscoverage['/editor/range.js'].functionData[5] = 0;
  _$jscoverage['/editor/range.js'].functionData[6] = 0;
  _$jscoverage['/editor/range.js'].functionData[7] = 0;
  _$jscoverage['/editor/range.js'].functionData[8] = 0;
  _$jscoverage['/editor/range.js'].functionData[9] = 0;
  _$jscoverage['/editor/range.js'].functionData[10] = 0;
  _$jscoverage['/editor/range.js'].functionData[11] = 0;
  _$jscoverage['/editor/range.js'].functionData[12] = 0;
  _$jscoverage['/editor/range.js'].functionData[13] = 0;
  _$jscoverage['/editor/range.js'].functionData[14] = 0;
  _$jscoverage['/editor/range.js'].functionData[15] = 0;
  _$jscoverage['/editor/range.js'].functionData[16] = 0;
  _$jscoverage['/editor/range.js'].functionData[17] = 0;
  _$jscoverage['/editor/range.js'].functionData[18] = 0;
  _$jscoverage['/editor/range.js'].functionData[19] = 0;
  _$jscoverage['/editor/range.js'].functionData[20] = 0;
  _$jscoverage['/editor/range.js'].functionData[21] = 0;
  _$jscoverage['/editor/range.js'].functionData[22] = 0;
  _$jscoverage['/editor/range.js'].functionData[23] = 0;
  _$jscoverage['/editor/range.js'].functionData[24] = 0;
  _$jscoverage['/editor/range.js'].functionData[25] = 0;
  _$jscoverage['/editor/range.js'].functionData[26] = 0;
  _$jscoverage['/editor/range.js'].functionData[27] = 0;
  _$jscoverage['/editor/range.js'].functionData[28] = 0;
  _$jscoverage['/editor/range.js'].functionData[29] = 0;
  _$jscoverage['/editor/range.js'].functionData[30] = 0;
  _$jscoverage['/editor/range.js'].functionData[31] = 0;
  _$jscoverage['/editor/range.js'].functionData[32] = 0;
  _$jscoverage['/editor/range.js'].functionData[33] = 0;
  _$jscoverage['/editor/range.js'].functionData[34] = 0;
  _$jscoverage['/editor/range.js'].functionData[35] = 0;
  _$jscoverage['/editor/range.js'].functionData[36] = 0;
  _$jscoverage['/editor/range.js'].functionData[37] = 0;
  _$jscoverage['/editor/range.js'].functionData[38] = 0;
  _$jscoverage['/editor/range.js'].functionData[39] = 0;
  _$jscoverage['/editor/range.js'].functionData[40] = 0;
  _$jscoverage['/editor/range.js'].functionData[41] = 0;
  _$jscoverage['/editor/range.js'].functionData[42] = 0;
  _$jscoverage['/editor/range.js'].functionData[43] = 0;
  _$jscoverage['/editor/range.js'].functionData[44] = 0;
  _$jscoverage['/editor/range.js'].functionData[45] = 0;
  _$jscoverage['/editor/range.js'].functionData[46] = 0;
  _$jscoverage['/editor/range.js'].functionData[47] = 0;
  _$jscoverage['/editor/range.js'].functionData[48] = 0;
  _$jscoverage['/editor/range.js'].functionData[49] = 0;
  _$jscoverage['/editor/range.js'].functionData[50] = 0;
  _$jscoverage['/editor/range.js'].functionData[51] = 0;
  _$jscoverage['/editor/range.js'].functionData[52] = 0;
  _$jscoverage['/editor/range.js'].functionData[53] = 0;
  _$jscoverage['/editor/range.js'].functionData[54] = 0;
}
if (! _$jscoverage['/editor/range.js'].branchData) {
  _$jscoverage['/editor/range.js'].branchData = {};
  _$jscoverage['/editor/range.js'].branchData['69'] = [];
  _$jscoverage['/editor/range.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['69'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['72'] = [];
  _$jscoverage['/editor/range.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['72'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['75'] = [];
  _$jscoverage['/editor/range.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['80'] = [];
  _$jscoverage['/editor/range.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['87'] = [];
  _$jscoverage['/editor/range.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['90'] = [];
  _$jscoverage['/editor/range.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['92'] = [];
  _$jscoverage['/editor/range.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['95'] = [];
  _$jscoverage['/editor/range.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['99'] = [];
  _$jscoverage['/editor/range.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['102'] = [];
  _$jscoverage['/editor/range.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['102'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['102'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['102'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['133'] = [];
  _$jscoverage['/editor/range.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['137'] = [];
  _$jscoverage['/editor/range.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['150'] = [];
  _$jscoverage['/editor/range.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['156'] = [];
  _$jscoverage['/editor/range.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['158'] = [];
  _$jscoverage['/editor/range.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['174'] = [];
  _$jscoverage['/editor/range.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['183'] = [];
  _$jscoverage['/editor/range.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['190'] = [];
  _$jscoverage['/editor/range.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['218'] = [];
  _$jscoverage['/editor/range.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['226'] = [];
  _$jscoverage['/editor/range.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['239'] = [];
  _$jscoverage['/editor/range.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['243'] = [];
  _$jscoverage['/editor/range.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['243'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['255'] = [];
  _$jscoverage['/editor/range.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['260'] = [];
  _$jscoverage['/editor/range.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['260'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['260'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['268'] = [];
  _$jscoverage['/editor/range.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['275'] = [];
  _$jscoverage['/editor/range.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['285'] = [];
  _$jscoverage['/editor/range.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['294'] = [];
  _$jscoverage['/editor/range.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['303'] = [];
  _$jscoverage['/editor/range.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['307'] = [];
  _$jscoverage['/editor/range.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['307'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['317'] = [];
  _$jscoverage['/editor/range.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['327'] = [];
  _$jscoverage['/editor/range.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['335'] = [];
  _$jscoverage['/editor/range.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['345'] = [];
  _$jscoverage['/editor/range.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['350'] = [];
  _$jscoverage['/editor/range.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['354'] = [];
  _$jscoverage['/editor/range.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['356'] = [];
  _$jscoverage['/editor/range.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['356'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['357'] = [];
  _$jscoverage['/editor/range.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['359'] = [];
  _$jscoverage['/editor/range.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['365'] = [];
  _$jscoverage['/editor/range.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['367'] = [];
  _$jscoverage['/editor/range.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['367'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['368'] = [];
  _$jscoverage['/editor/range.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['369'] = [];
  _$jscoverage['/editor/range.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['382'] = [];
  _$jscoverage['/editor/range.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['382'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['384'] = [];
  _$jscoverage['/editor/range.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['392'] = [];
  _$jscoverage['/editor/range.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['407'] = [];
  _$jscoverage['/editor/range.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['411'] = [];
  _$jscoverage['/editor/range.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['420'] = [];
  _$jscoverage['/editor/range.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['421'] = [];
  _$jscoverage['/editor/range.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['422'] = [];
  _$jscoverage['/editor/range.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['422'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['423'] = [];
  _$jscoverage['/editor/range.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['452'] = [];
  _$jscoverage['/editor/range.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['453'] = [];
  _$jscoverage['/editor/range.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['468'] = [];
  _$jscoverage['/editor/range.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['469'] = [];
  _$jscoverage['/editor/range.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['471'] = [];
  _$jscoverage['/editor/range.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['479'] = [];
  _$jscoverage['/editor/range.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['480'] = [];
  _$jscoverage['/editor/range.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['482'] = [];
  _$jscoverage['/editor/range.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['525'] = [];
  _$jscoverage['/editor/range.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['526'] = [];
  _$jscoverage['/editor/range.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['526'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['530'] = [];
  _$jscoverage['/editor/range.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['531'] = [];
  _$jscoverage['/editor/range.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['531'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['552'] = [];
  _$jscoverage['/editor/range.js'].branchData['552'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['552'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['560'] = [];
  _$jscoverage['/editor/range.js'].branchData['560'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['583'] = [];
  _$jscoverage['/editor/range.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['583'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['591'] = [];
  _$jscoverage['/editor/range.js'].branchData['591'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['612'] = [];
  _$jscoverage['/editor/range.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['643'] = [];
  _$jscoverage['/editor/range.js'].branchData['643'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['688'] = [];
  _$jscoverage['/editor/range.js'].branchData['688'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['729'] = [];
  _$jscoverage['/editor/range.js'].branchData['729'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['729'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['730'] = [];
  _$jscoverage['/editor/range.js'].branchData['730'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['738'] = [];
  _$jscoverage['/editor/range.js'].branchData['738'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['749'] = [];
  _$jscoverage['/editor/range.js'].branchData['749'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['760'] = [];
  _$jscoverage['/editor/range.js'].branchData['760'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['761'] = [];
  _$jscoverage['/editor/range.js'].branchData['761'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['774'] = [];
  _$jscoverage['/editor/range.js'].branchData['774'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['775'] = [];
  _$jscoverage['/editor/range.js'].branchData['775'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['776'] = [];
  _$jscoverage['/editor/range.js'].branchData['776'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['778'] = [];
  _$jscoverage['/editor/range.js'].branchData['778'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['788'] = [];
  _$jscoverage['/editor/range.js'].branchData['788'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['789'] = [];
  _$jscoverage['/editor/range.js'].branchData['789'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['790'] = [];
  _$jscoverage['/editor/range.js'].branchData['790'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['792'] = [];
  _$jscoverage['/editor/range.js'].branchData['792'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['800'] = [];
  _$jscoverage['/editor/range.js'].branchData['800'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['805'] = [];
  _$jscoverage['/editor/range.js'].branchData['805'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['805'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['811'] = [];
  _$jscoverage['/editor/range.js'].branchData['811'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['811'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['812'] = [];
  _$jscoverage['/editor/range.js'].branchData['812'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['816'] = [];
  _$jscoverage['/editor/range.js'].branchData['816'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['816'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['819'] = [];
  _$jscoverage['/editor/range.js'].branchData['819'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['819'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['827'] = [];
  _$jscoverage['/editor/range.js'].branchData['827'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['828'] = [];
  _$jscoverage['/editor/range.js'].branchData['828'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['829'] = [];
  _$jscoverage['/editor/range.js'].branchData['829'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['834'] = [];
  _$jscoverage['/editor/range.js'].branchData['834'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['836'] = [];
  _$jscoverage['/editor/range.js'].branchData['836'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['837'] = [];
  _$jscoverage['/editor/range.js'].branchData['837'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['842'] = [];
  _$jscoverage['/editor/range.js'].branchData['842'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['862'] = [];
  _$jscoverage['/editor/range.js'].branchData['862'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['869'] = [];
  _$jscoverage['/editor/range.js'].branchData['869'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['872'] = [];
  _$jscoverage['/editor/range.js'].branchData['872'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['877'] = [];
  _$jscoverage['/editor/range.js'].branchData['877'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['877'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['877'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['877'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['878'] = [];
  _$jscoverage['/editor/range.js'].branchData['878'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['878'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['878'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['886'] = [];
  _$jscoverage['/editor/range.js'].branchData['886'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['886'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['887'] = [];
  _$jscoverage['/editor/range.js'].branchData['887'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['888'] = [];
  _$jscoverage['/editor/range.js'].branchData['888'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['894'] = [];
  _$jscoverage['/editor/range.js'].branchData['894'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['897'] = [];
  _$jscoverage['/editor/range.js'].branchData['897'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['902'] = [];
  _$jscoverage['/editor/range.js'].branchData['902'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['902'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['903'] = [];
  _$jscoverage['/editor/range.js'].branchData['903'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['903'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['903'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['903'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['904'] = [];
  _$jscoverage['/editor/range.js'].branchData['904'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['911'] = [];
  _$jscoverage['/editor/range.js'].branchData['911'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['911'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['912'] = [];
  _$jscoverage['/editor/range.js'].branchData['912'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['913'] = [];
  _$jscoverage['/editor/range.js'].branchData['913'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['948'] = [];
  _$jscoverage['/editor/range.js'].branchData['948'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['954'] = [];
  _$jscoverage['/editor/range.js'].branchData['954'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['958'] = [];
  _$jscoverage['/editor/range.js'].branchData['958'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['972'] = [];
  _$jscoverage['/editor/range.js'].branchData['972'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1009'] = [];
  _$jscoverage['/editor/range.js'].branchData['1009'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1009'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1010'] = [];
  _$jscoverage['/editor/range.js'].branchData['1010'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1011'] = [];
  _$jscoverage['/editor/range.js'].branchData['1011'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1014'] = [];
  _$jscoverage['/editor/range.js'].branchData['1014'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1020'] = [];
  _$jscoverage['/editor/range.js'].branchData['1020'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1033'] = [];
  _$jscoverage['/editor/range.js'].branchData['1033'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1035'] = [];
  _$jscoverage['/editor/range.js'].branchData['1035'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1042'] = [];
  _$jscoverage['/editor/range.js'].branchData['1042'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1051'] = [];
  _$jscoverage['/editor/range.js'].branchData['1051'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1051'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1052'] = [];
  _$jscoverage['/editor/range.js'].branchData['1052'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1052'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1055'] = [];
  _$jscoverage['/editor/range.js'].branchData['1055'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1061'] = [];
  _$jscoverage['/editor/range.js'].branchData['1061'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1087'] = [];
  _$jscoverage['/editor/range.js'].branchData['1087'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1091'] = [];
  _$jscoverage['/editor/range.js'].branchData['1091'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1105'] = [];
  _$jscoverage['/editor/range.js'].branchData['1105'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1109'] = [];
  _$jscoverage['/editor/range.js'].branchData['1109'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1116'] = [];
  _$jscoverage['/editor/range.js'].branchData['1116'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1137'] = [];
  _$jscoverage['/editor/range.js'].branchData['1137'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1157'] = [];
  _$jscoverage['/editor/range.js'].branchData['1157'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1158'] = [];
  _$jscoverage['/editor/range.js'].branchData['1158'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1159'] = [];
  _$jscoverage['/editor/range.js'].branchData['1159'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1159'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1160'] = [];
  _$jscoverage['/editor/range.js'].branchData['1160'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1169'] = [];
  _$jscoverage['/editor/range.js'].branchData['1169'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1169'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1192'] = [];
  _$jscoverage['/editor/range.js'].branchData['1192'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1193'] = [];
  _$jscoverage['/editor/range.js'].branchData['1193'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1195'] = [];
  _$jscoverage['/editor/range.js'].branchData['1195'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1199'] = [];
  _$jscoverage['/editor/range.js'].branchData['1199'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1210'] = [];
  _$jscoverage['/editor/range.js'].branchData['1210'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1218'] = [];
  _$jscoverage['/editor/range.js'].branchData['1218'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1226'] = [];
  _$jscoverage['/editor/range.js'].branchData['1226'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1228'] = [];
  _$jscoverage['/editor/range.js'].branchData['1228'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1241'] = [];
  _$jscoverage['/editor/range.js'].branchData['1241'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1245'] = [];
  _$jscoverage['/editor/range.js'].branchData['1245'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1264'] = [];
  _$jscoverage['/editor/range.js'].branchData['1264'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1274'] = [];
  _$jscoverage['/editor/range.js'].branchData['1274'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1296'] = [];
  _$jscoverage['/editor/range.js'].branchData['1296'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1301'] = [];
  _$jscoverage['/editor/range.js'].branchData['1301'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1309'] = [];
  _$jscoverage['/editor/range.js'].branchData['1309'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1309'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1320'] = [];
  _$jscoverage['/editor/range.js'].branchData['1320'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1326'] = [];
  _$jscoverage['/editor/range.js'].branchData['1326'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1326'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1334'] = [];
  _$jscoverage['/editor/range.js'].branchData['1334'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1334'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1335'] = [];
  _$jscoverage['/editor/range.js'].branchData['1335'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1346'] = [];
  _$jscoverage['/editor/range.js'].branchData['1346'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1354'] = [];
  _$jscoverage['/editor/range.js'].branchData['1354'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1360'] = [];
  _$jscoverage['/editor/range.js'].branchData['1360'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1360'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1361'] = [];
  _$jscoverage['/editor/range.js'].branchData['1361'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1366'] = [];
  _$jscoverage['/editor/range.js'].branchData['1366'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1384'] = [];
  _$jscoverage['/editor/range.js'].branchData['1384'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1384'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1386'] = [];
  _$jscoverage['/editor/range.js'].branchData['1386'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1403'] = [];
  _$jscoverage['/editor/range.js'].branchData['1403'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1421'] = [];
  _$jscoverage['/editor/range.js'].branchData['1421'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1423'] = [];
  _$jscoverage['/editor/range.js'].branchData['1423'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1440'] = [];
  _$jscoverage['/editor/range.js'].branchData['1440'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1456'] = [];
  _$jscoverage['/editor/range.js'].branchData['1456'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1458'] = [];
  _$jscoverage['/editor/range.js'].branchData['1458'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1465'] = [];
  _$jscoverage['/editor/range.js'].branchData['1465'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1481'] = [];
  _$jscoverage['/editor/range.js'].branchData['1481'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1483'] = [];
  _$jscoverage['/editor/range.js'].branchData['1483'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1485'] = [];
  _$jscoverage['/editor/range.js'].branchData['1485'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1501'] = [];
  _$jscoverage['/editor/range.js'].branchData['1501'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1505'] = [];
  _$jscoverage['/editor/range.js'].branchData['1505'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1507'] = [];
  _$jscoverage['/editor/range.js'].branchData['1507'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1511'] = [];
  _$jscoverage['/editor/range.js'].branchData['1511'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1525'] = [];
  _$jscoverage['/editor/range.js'].branchData['1525'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1547'] = [];
  _$jscoverage['/editor/range.js'].branchData['1547'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1571'] = [];
  _$jscoverage['/editor/range.js'].branchData['1571'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1576'] = [];
  _$jscoverage['/editor/range.js'].branchData['1576'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1577'] = [];
  _$jscoverage['/editor/range.js'].branchData['1577'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1582'] = [];
  _$jscoverage['/editor/range.js'].branchData['1582'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1588'] = [];
  _$jscoverage['/editor/range.js'].branchData['1588'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1589'] = [];
  _$jscoverage['/editor/range.js'].branchData['1589'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1594'] = [];
  _$jscoverage['/editor/range.js'].branchData['1594'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1594'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1595'] = [];
  _$jscoverage['/editor/range.js'].branchData['1595'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1600'] = [];
  _$jscoverage['/editor/range.js'].branchData['1600'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1610'] = [];
  _$jscoverage['/editor/range.js'].branchData['1610'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1632'] = [];
  _$jscoverage['/editor/range.js'].branchData['1632'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1662'] = [];
  _$jscoverage['/editor/range.js'].branchData['1662'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1662'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1667'] = [];
  _$jscoverage['/editor/range.js'].branchData['1667'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1678'] = [];
  _$jscoverage['/editor/range.js'].branchData['1678'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1687'] = [];
  _$jscoverage['/editor/range.js'].branchData['1687'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1687'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1707'] = [];
  _$jscoverage['/editor/range.js'].branchData['1707'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1724'] = [];
  _$jscoverage['/editor/range.js'].branchData['1724'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1726'] = [];
  _$jscoverage['/editor/range.js'].branchData['1726'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1726'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1730'] = [];
  _$jscoverage['/editor/range.js'].branchData['1730'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1740'] = [];
  _$jscoverage['/editor/range.js'].branchData['1740'][1] = new BranchData();
}
_$jscoverage['/editor/range.js'].branchData['1740'][1].init(780, 4, 'last');
function visit620_1740_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1740'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1730'][1].init(236, 50, 'self.checkStartOfBlock() && self.checkEndOfBlock()');
function visit619_1730_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1730'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1726'][2].init(134, 32, 'tmpDtd && tmpDtd[elementName]');
function visit618_1726_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1726'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1726'][1].init(91, 77, '(tmpDtd = dtd[current.nodeName()]) && !(tmpDtd && tmpDtd[elementName])');
function visit617_1726_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1726'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1724'][1].init(269, 7, 'isBlock');
function visit616_1724_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1724'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1707'][1].init(118, 42, 'domNode.nodeType == Dom.NodeType.TEXT_NODE');
function visit615_1707_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1707'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1687'][2].init(492, 43, 'el[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit614_1687_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1687'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1687'][1].init(492, 66, 'el[0].nodeType == Dom.NodeType.ELEMENT_NODE && el._4e_isEditable()');
function visit613_1687_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1687'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1678'][1].init(87, 40, 'el[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit612_1678_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1678'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1667'][1].init(286, 19, '!childOnly && !next');
function visit611_1667_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1667'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1662'][2].init(51, 45, 'node[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit610_1662_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1662'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1662'][1].init(51, 91, 'node[0].nodeType == Dom.NodeType.ELEMENT_NODE && node._4e_isEditable()');
function visit609_1662_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1662'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1632'][1].init(48, 15, '!self.collapsed');
function visit608_1632_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1632'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1610'][1].init(301, 60, '!UA[\'ie\'] && !S.inArray(startBlock.nodeName(), [\'ul\', \'ol\'])');
function visit607_1610_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1610'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1600'][1].init(271, 14, 'isStartOfBlock');
function visit606_1600_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1600'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1595'][1].init(22, 12, 'isEndOfBlock');
function visit605_1595_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1595'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1594'][2].init(1290, 28, 'startBlock[0] == endBlock[0]');
function visit604_1594_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1594'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1594'][1].init(1276, 42, 'startBlock && startBlock[0] == endBlock[0]');
function visit603_1594_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1594'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1589'][1].init(92, 34, 'endBlock && self.checkEndOfBlock()');
function visit602_1589_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1589'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1588'][1].init(1066, 38, 'startBlock && self.checkStartOfBlock()');
function visit601_1588_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1588'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1582'][1].init(218, 9, '!endBlock');
function visit600_1582_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1582'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1577'][1].init(22, 11, '!startBlock');
function visit599_1577_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1577'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1576'][1].init(642, 16, 'blockTag != \'br\'');
function visit598_1576_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1576'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1571'][1].init(493, 38, '!startBlockLimit.equals(endBlockLimit)');
function visit597_1571_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1571'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1547'][1].init(363, 9, '!UA[\'ie\']');
function visit596_1547_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1547'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1525'][1].init(2382, 56, 'startNode._4e_position(endNode) & KEP.POSITION_FOLLOWING');
function visit595_1525_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1525'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1511'][1].init(311, 15, 'childCount == 0');
function visit594_1511_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1511'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1507'][1].init(82, 22, 'childCount > endOffset');
function visit593_1507_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1507'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1505'][1].init(1396, 48, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit592_1505_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1505'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1501'][1].init(612, 43, 'startNode._4e_nextSourceNode() || startNode');
function visit591_1501_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1501'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1485'][1].init(215, 15, 'childCount == 0');
function visit590_1485_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1485'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1483'][1].init(84, 24, 'childCount > startOffset');
function visit589_1483_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1483'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1481'][1].init(269, 50, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit588_1481_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1481'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1465'][1].init(7, 22, 'checkType == KER.START');
function visit587_1465_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1465'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1458'][1].init(223, 22, 'checkType == KER.START');
function visit586_1458_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1458'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1456'][1].init(12, 22, 'checkType == KER.START');
function visit585_1456_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1456'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1440'][1].init(1137, 29, 'path.block || path.blockLimit');
function visit584_1440_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1440'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1423'][1].init(111, 16, 'textAfter.length');
function visit583_1423_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1423'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1421'][1].init(271, 50, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit582_1421_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1421'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1403'][1].init(1196, 29, 'path.block || path.blockLimit');
function visit581_1403_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1403'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1386'][1].init(119, 17, 'textBefore.length');
function visit580_1386_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1386'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1384'][2].init(316, 52, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit579_1384_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1384'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1384'][1].init(301, 67, 'startOffset && startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit578_1384_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1384'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1366'][1].init(4532, 6, 'tailBr');
function visit577_1366_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1366'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1361'][1].init(74, 50, 'enlargeable && blockBoundary.contains(enlargeable)');
function visit576_1361_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1361'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1360'][2].init(-1, 38, '!enlargeable && self.checkEndOfBlock()');
function visit575_1360_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1360'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1360'][1].init(-1, 125, '!enlargeable && self.checkEndOfBlock() || enlargeable && blockBoundary.contains(enlargeable)');
function visit574_1360_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1360'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1354'][1].init(3798, 21, 'blockBoundary || body');
function visit573_1354_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1354'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1346'][1].init(3365, 38, 'unit == KER.ENLARGE_LIST_ITEM_CONTENTS');
function visit572_1346_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1346'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1335'][1].init(80, 50, 'enlargeable && blockBoundary.contains(enlargeable)');
function visit571_1335_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1335'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1334'][2].init(462, 40, '!enlargeable && self.checkStartOfBlock()');
function visit570_1334_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1334'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1334'][1].init(462, 131, '!enlargeable && self.checkStartOfBlock() || enlargeable && blockBoundary.contains(enlargeable)');
function visit569_1334_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1334'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1326'][2].init(90, 32, 'blockBoundary.nodeName() != \'br\'');
function visit568_1326_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1326'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1326'][1].init(-1, 596, 'blockBoundary.nodeName() != \'br\' && (!enlargeable && self.checkStartOfBlock() || enlargeable && blockBoundary.contains(enlargeable))');
function visit567_1326_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1326'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1320'][1].init(1939, 21, 'blockBoundary || body');
function visit566_1320_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1320'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1309'][2].init(116, 26, 'Dom.nodeName(node) == \'br\'');
function visit565_1309_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1309'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1309'][1].init(105, 37, '!retVal && Dom.nodeName(node) == \'br\'');
function visit564_1309_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1309'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1301'][1].init(104, 7, '!retVal');
function visit563_1301_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1301'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1296'][1].init(56, 38, 'unit == KER.ENLARGE_LIST_ITEM_CONTENTS');
function visit562_1296_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1296'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1274'][1].init(430, 18, 'stop[0] && stop[1]');
function visit561_1274_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1274'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1264'][1].init(57, 14, 'self.collapsed');
function visit560_1264_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1264'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1245'][1].init(990, 47, 'commonReached || enlarge.equals(commonAncestor)');
function visit559_1245_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1245'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1241'][1].init(875, 28, 'enlarge.nodeName() == "body"');
function visit558_1241_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1241'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1228'][1].init(69, 14, '!commonReached');
function visit557_1228_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1228'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1226'][1].init(396, 7, 'sibling');
function visit556_1226_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1218'][1].init(30, 44, 'isWhitespace(sibling) || isBookmark(sibling)');
function visit555_1218_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1218'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1210'][1].init(66, 57, 'container[0].childNodes[offset + (left ? -1 : 1)] || null');
function visit554_1210_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1210'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1199'][1].init(30, 38, 'offset < container[0].nodeValue.length');
function visit553_1199_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1199'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1195'][1].init(70, 6, 'offset');
function visit552_1195_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1195'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1193'][1].init(26, 4, 'left');
function visit551_1193_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1193'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1192'][1].init(395, 47, 'container[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit550_1192_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1192'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1169'][2].init(25, 46, 'ancestor[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit549_1169_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1169'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1169'][1].init(-1, 64, 'ignoreTextNode && ancestor[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit548_1169_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1169'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1160'][1].init(70, 38, 'self.startOffset == self.endOffset - 1');
function visit547_1160_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1160'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1159'][2].init(60, 46, 'start[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit546_1159_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1159'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1159'][1].init(35, 109, 'start[0].nodeType == Dom.NodeType.ELEMENT_NODE && self.startOffset == self.endOffset - 1');
function visit545_1159_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1159'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1158'][1].init(22, 145, 'includeSelf && start[0].nodeType == Dom.NodeType.ELEMENT_NODE && self.startOffset == self.endOffset - 1');
function visit544_1158_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1157'][1].init(165, 18, 'start[0] == end[0]');
function visit543_1157_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1137'][1].init(784, 21, 'endNode && endNode[0]');
function visit542_1137_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1116'][1].init(567, 12, 'endContainer');
function visit541_1116_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1109'][1].init(172, 71, 'bookmark.end && doc._4e_getByAddress(bookmark.end, bookmark.normalized)');
function visit540_1109_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1109'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1105'][1].init(89, 12, 'bookmark.is2');
function visit539_1105_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1105'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1091'][1].init(433, 41, 'startContainer[0] == self.endContainer[0]');
function visit538_1091_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1091'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1087'][1].init(118, 49, 'startContainer[0].childNodes[startOffset] || null');
function visit537_1087_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1087'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1061'][1].init(415, 45, 'endOffset >= endContainer[0].nodeValue.length');
function visit536_1061_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1061'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1055'][1].init(131, 10, '!endOffset');
function visit535_1055_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1055'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1052'][2].init(2122, 50, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit534_1052_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1052'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1052'][1].init(47, 69, 'endContainer[0] && endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit533_1052_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1052'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1051'][2].init(2056, 22, 'ignoreEnd || collapsed');
function visit532_1051_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1051'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1051'][1].init(2053, 117, '!(ignoreEnd || collapsed) && endContainer[0] && endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit531_1051_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1051'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1042'][1].init(1476, 9, 'collapsed');
function visit530_1042_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1042'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1035'][1].init(483, 45, 'Dom.equals(startContainer, self.endContainer)');
function visit529_1035_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1035'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1033'][1].init(313, 50, 'Dom.equals(self.startContainer, self.endContainer)');
function visit528_1033_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1033'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1020'][1].init(425, 49, 'startOffset >= startContainer[0].nodeValue.length');
function visit527_1020_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1020'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1014'][1].init(131, 12, '!startOffset');
function visit526_1014_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1014'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1011'][1].init(37, 52, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit525_1011_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1011'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1010'][1].init(47, 90, 'startContainer[0] && startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit524_1010_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1010'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1009'][2].init(201, 25, '!ignoreStart || collapsed');
function visit523_1009_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1009'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1009'][1].init(201, 138, '(!ignoreStart || collapsed) && startContainer[0] && startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit522_1009_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1009'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['972'][1].init(1257, 7, 'endNode');
function visit521_972_1(result) {
  _$jscoverage['/editor/range.js'].branchData['972'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['958'][1].init(111, 12, 'serializable');
function visit520_958_1(result) {
  _$jscoverage['/editor/range.js'].branchData['958'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['954'][1].init(732, 10, '!collapsed');
function visit519_954_1(result) {
  _$jscoverage['/editor/range.js'].branchData['954'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['948'][1].init(522, 12, 'serializable');
function visit518_948_1(result) {
  _$jscoverage['/editor/range.js'].branchData['948'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['913'][1].init(72, 46, 'previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit517_913_1(result) {
  _$jscoverage['/editor/range.js'].branchData['913'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['912'][1].init(80, 119, '(previous = endContainer.prev(undefined, 1)) && previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit516_912_1(result) {
  _$jscoverage['/editor/range.js'].branchData['912'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['911'][2].init(858, 50, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit515_911_2(result) {
  _$jscoverage['/editor/range.js'].branchData['911'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['911'][1].init(858, 200, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE && (previous = endContainer.prev(undefined, 1)) && previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit514_911_1(result) {
  _$jscoverage['/editor/range.js'].branchData['911'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['904'][1].init(45, 59, 'child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit513_904_1(result) {
  _$jscoverage['/editor/range.js'].branchData['904'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['903'][4].init(331, 13, 'endOffset > 0');
function visit512_903_4(result) {
  _$jscoverage['/editor/range.js'].branchData['903'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['903'][3].init(46, 105, 'endOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit511_903_3(result) {
  _$jscoverage['/editor/range.js'].branchData['903'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['903'][2].init(283, 43, 'child[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit510_903_2(result) {
  _$jscoverage['/editor/range.js'].branchData['903'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['903'][1].init(40, 152, 'child[0].nodeType == Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit509_903_1(result) {
  _$jscoverage['/editor/range.js'].branchData['903'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['902'][2].init(239, 193, 'child[0] && child[0].nodeType == Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit508_902_2(result) {
  _$jscoverage['/editor/range.js'].branchData['902'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['902'][1].init(230, 202, 'child && child[0] && child[0].nodeType == Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit507_902_1(result) {
  _$jscoverage['/editor/range.js'].branchData['902'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['897'][1].init(148, 53, 'endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit506_897_1(result) {
  _$jscoverage['/editor/range.js'].branchData['897'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['894'][1].init(1205, 15, '!self.collapsed');
function visit505_894_1(result) {
  _$jscoverage['/editor/range.js'].branchData['894'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['888'][1].init(70, 46, 'previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit504_888_1(result) {
  _$jscoverage['/editor/range.js'].branchData['888'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['887'][1].init(78, 117, '(previous = startContainer.prev(undefined, 1)) && previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit503_887_1(result) {
  _$jscoverage['/editor/range.js'].branchData['887'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['886'][2].init(789, 52, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit502_886_2(result) {
  _$jscoverage['/editor/range.js'].branchData['886'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['886'][1].init(789, 196, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE && (previous = startContainer.prev(undefined, 1)) && previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit501_886_1(result) {
  _$jscoverage['/editor/range.js'].branchData['886'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['878'][3].init(18, 59, 'child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit500_878_3(result) {
  _$jscoverage['/editor/range.js'].branchData['878'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['878'][2].init(315, 15, 'startOffset > 0');
function visit499_878_2(result) {
  _$jscoverage['/editor/range.js'].branchData['878'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['878'][1].init(71, 78, 'startOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit498_878_1(result) {
  _$jscoverage['/editor/range.js'].branchData['878'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['877'][4].init(239, 43, 'child[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit497_877_4(result) {
  _$jscoverage['/editor/range.js'].branchData['877'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['877'][3].init(239, 150, 'child[0].nodeType == Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit496_877_3(result) {
  _$jscoverage['/editor/range.js'].branchData['877'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['877'][2].init(227, 162, 'child[0] && child[0].nodeType == Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit495_877_2(result) {
  _$jscoverage['/editor/range.js'].branchData['877'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['877'][1].init(218, 171, 'child && child[0] && child[0].nodeType == Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit494_877_1(result) {
  _$jscoverage['/editor/range.js'].branchData['877'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['872'][1].init(136, 55, 'startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit493_872_1(result) {
  _$jscoverage['/editor/range.js'].branchData['872'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['869'][1].init(640, 10, 'normalized');
function visit492_869_1(result) {
  _$jscoverage['/editor/range.js'].branchData['869'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['862'][1].init(465, 32, '!startContainer || !endContainer');
function visit491_862_1(result) {
  _$jscoverage['/editor/range.js'].branchData['862'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['842'][1].init(3710, 20, 'moveStart || moveEnd');
function visit490_842_1(result) {
  _$jscoverage['/editor/range.js'].branchData['842'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['837'][1].init(166, 7, 'textEnd');
function visit489_837_1(result) {
  _$jscoverage['/editor/range.js'].branchData['837'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['836'][1].init(80, 26, 'mode == KER.SHRINK_ELEMENT');
function visit488_836_1(result) {
  _$jscoverage['/editor/range.js'].branchData['836'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['834'][1].init(3339, 7, 'moveEnd');
function visit487_834_1(result) {
  _$jscoverage['/editor/range.js'].branchData['834'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['829'][1].init(126, 9, 'textStart');
function visit486_829_1(result) {
  _$jscoverage['/editor/range.js'].branchData['829'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['828'][1].init(45, 26, 'mode == KER.SHRINK_ELEMENT');
function visit485_828_1(result) {
  _$jscoverage['/editor/range.js'].branchData['828'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['827'][1].init(2999, 9, 'moveStart');
function visit484_827_1(result) {
  _$jscoverage['/editor/range.js'].branchData['827'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['819'][2].init(563, 42, 'node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit483_819_2(result) {
  _$jscoverage['/editor/range.js'].branchData['819'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['819'][1].init(549, 56, '!movingOut && node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit482_819_1(result) {
  _$jscoverage['/editor/range.js'].branchData['819'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['816'][2].init(424, 22, 'node == currentElement');
function visit481_816_2(result) {
  _$jscoverage['/editor/range.js'].branchData['816'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['816'][1].init(411, 35, 'movingOut && node == currentElement');
function visit480_816_1(result) {
  _$jscoverage['/editor/range.js'].branchData['816'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['812'][1].init(58, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit479_812_1(result) {
  _$jscoverage['/editor/range.js'].branchData['812'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['811'][2].init(129, 26, 'mode == KER.SHRINK_ELEMENT');
function visit478_811_2(result) {
  _$jscoverage['/editor/range.js'].branchData['811'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['811'][1].init(129, 98, 'mode == KER.SHRINK_ELEMENT && node.nodeType == Dom.NodeType.TEXT_NODE');
function visit477_811_1(result) {
  _$jscoverage['/editor/range.js'].branchData['811'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['805'][2].init(52, 26, 'mode == KER.SHRINK_ELEMENT');
function visit476_805_2(result) {
  _$jscoverage['/editor/range.js'].branchData['805'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['805'][1].init(33, 129, 'node.nodeType == (mode == KER.SHRINK_ELEMENT ? Dom.NodeType.ELEMENT_NODE : Dom.NodeType.TEXT_NODE)');
function visit475_805_1(result) {
  _$jscoverage['/editor/range.js'].branchData['805'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['800'][1].init(1811, 20, 'moveStart || moveEnd');
function visit474_800_1(result) {
  _$jscoverage['/editor/range.js'].branchData['800'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['792'][1].init(138, 45, 'endOffset >= endContainer[0].nodeValue.length');
function visit473_792_1(result) {
  _$jscoverage['/editor/range.js'].branchData['792'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['790'][1].init(26, 10, '!endOffset');
function visit472_790_1(result) {
  _$jscoverage['/editor/range.js'].branchData['790'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['789'][1].init(36, 50, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit471_789_1(result) {
  _$jscoverage['/editor/range.js'].branchData['789'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['788'][1].init(1270, 87, 'endContainer && endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit470_788_1(result) {
  _$jscoverage['/editor/range.js'].branchData['788'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['778'][1].init(144, 49, 'startOffset >= startContainer[0].nodeValue.length');
function visit469_778_1(result) {
  _$jscoverage['/editor/range.js'].branchData['778'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['776'][1].init(26, 12, '!startOffset');
function visit468_776_1(result) {
  _$jscoverage['/editor/range.js'].branchData['776'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['775'][1].init(38, 52, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit467_775_1(result) {
  _$jscoverage['/editor/range.js'].branchData['775'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['774'][1].init(545, 91, 'startContainer && startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit466_774_1(result) {
  _$jscoverage['/editor/range.js'].branchData['774'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['761'][1].init(25, 23, 'mode || KER.SHRINK_TEXT');
function visit465_761_1(result) {
  _$jscoverage['/editor/range.js'].branchData['761'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['760'][1].init(100, 15, '!self.collapsed');
function visit464_760_1(result) {
  _$jscoverage['/editor/range.js'].branchData['760'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['749'][1].init(882, 24, 'node && node.equals(pre)');
function visit463_749_1(result) {
  _$jscoverage['/editor/range.js'].branchData['749'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['738'][1].init(25, 46, 'isNotWhitespaces(node) && isNotBookmarks(node)');
function visit462_738_1(result) {
  _$jscoverage['/editor/range.js'].branchData['738'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['730'][1].init(87, 65, 'walkerRange.endContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit461_730_1(result) {
  _$jscoverage['/editor/range.js'].branchData['730'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['729'][2].init(194, 67, 'walkerRange.startContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit460_729_2(result) {
  _$jscoverage['/editor/range.js'].branchData['729'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['729'][1].init(194, 153, 'walkerRange.startContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE || walkerRange.endContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit459_729_1(result) {
  _$jscoverage['/editor/range.js'].branchData['729'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['688'][1].init(48, 7, 'toStart');
function visit458_688_1(result) {
  _$jscoverage['/editor/range.js'].branchData['688'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['643'][1].init(55, 42, 'node[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit457_643_1(result) {
  _$jscoverage['/editor/range.js'].branchData['643'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['612'][1].init(55, 42, 'node[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit456_612_1(result) {
  _$jscoverage['/editor/range.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['591'][1].init(700, 20, '!self.startContainer');
function visit455_591_1(result) {
  _$jscoverage['/editor/range.js'].branchData['591'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['583'][2].init(399, 48, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit454_583_2(result) {
  _$jscoverage['/editor/range.js'].branchData['583'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['583'][1].init(399, 79, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && EMPTY[endNode.nodeName()]');
function visit453_583_1(result) {
  _$jscoverage['/editor/range.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['560'][1].init(717, 18, '!self.endContainer');
function visit452_560_1(result) {
  _$jscoverage['/editor/range.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['552'][2].init(400, 50, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit451_552_2(result) {
  _$jscoverage['/editor/range.js'].branchData['552'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['552'][1].init(400, 83, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && EMPTY[startNode.nodeName()]');
function visit450_552_1(result) {
  _$jscoverage['/editor/range.js'].branchData['552'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['531'][2].init(372, 28, 'endNode.nodeName() == \'span\'');
function visit449_531_2(result) {
  _$jscoverage['/editor/range.js'].branchData['531'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['531'][1].init(27, 77, 'endNode.nodeName() == \'span\' && endNode.attr(\'_ke_bookmark\')');
function visit448_531_1(result) {
  _$jscoverage['/editor/range.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['530'][1].init(342, 105, 'endNode && endNode.nodeName() == \'span\' && endNode.attr(\'_ke_bookmark\')');
function visit447_530_1(result) {
  _$jscoverage['/editor/range.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['526'][2].init(178, 30, 'startNode.nodeName() == \'span\'');
function visit446_526_2(result) {
  _$jscoverage['/editor/range.js'].branchData['526'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['526'][1].init(29, 81, 'startNode.nodeName() == \'span\' && startNode.attr(\'_ke_bookmark\')');
function visit445_526_1(result) {
  _$jscoverage['/editor/range.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['525'][1].init(146, 111, 'startNode && startNode.nodeName() == \'span\' && startNode.attr(\'_ke_bookmark\')');
function visit444_525_1(result) {
  _$jscoverage['/editor/range.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['482'][1].init(113, 39, 'offset >= container[0].nodeValue.length');
function visit443_482_1(result) {
  _$jscoverage['/editor/range.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['480'][1].init(22, 7, '!offset');
function visit442_480_1(result) {
  _$jscoverage['/editor/range.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['479'][1].init(543, 50, 'container[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit441_479_1(result) {
  _$jscoverage['/editor/range.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['471'][1].init(115, 39, 'offset >= container[0].nodeValue.length');
function visit440_471_1(result) {
  _$jscoverage['/editor/range.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['469'][1].init(22, 7, '!offset');
function visit439_469_1(result) {
  _$jscoverage['/editor/range.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['468'][1].init(144, 50, 'container[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit438_468_1(result) {
  _$jscoverage['/editor/range.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['453'][1].init(283, 40, 'endContainer.id || endContainer.nodeName');
function visit437_453_1(result) {
  _$jscoverage['/editor/range.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['452'][1].init(189, 44, 'startContainer.id || startContainer.nodeName');
function visit436_452_1(result) {
  _$jscoverage['/editor/range.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['423'][1].init(66, 34, 'self.startOffset == self.endOffset');
function visit435_423_1(result) {
  _$jscoverage['/editor/range.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['422'][2].init(112, 46, 'self.startContainer[0] == self.endContainer[0]');
function visit434_422_2(result) {
  _$jscoverage['/editor/range.js'].branchData['422'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['422'][1].init(37, 101, 'self.startContainer[0] == self.endContainer[0] && self.startOffset == self.endOffset');
function visit433_422_1(result) {
  _$jscoverage['/editor/range.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['421'][1].init(39, 139, 'self.endContainer && self.startContainer[0] == self.endContainer[0] && self.startOffset == self.endOffset');
function visit432_421_1(result) {
  _$jscoverage['/editor/range.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['420'][1].init(-1, 179, 'self.startContainer && self.endContainer && self.startContainer[0] == self.endContainer[0] && self.startOffset == self.endOffset');
function visit431_420_1(result) {
  _$jscoverage['/editor/range.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['411'][1].init(11077, 13, 'removeEndNode');
function visit430_411_1(result) {
  _$jscoverage['/editor/range.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['407'][1].init(10999, 15, 'removeStartNode');
function visit429_407_1(result) {
  _$jscoverage['/editor/range.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['392'][1].init(206, 123, 'removeStartNode && (topStart._4e_sameLevel(startNode))');
function visit428_392_1(result) {
  _$jscoverage['/editor/range.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['384'][1].init(-1, 97, '!startNode._4e_sameLevel(topStart) || !endNode._4e_sameLevel(topEnd)');
function visit427_384_1(result) {
  _$jscoverage['/editor/range.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['382'][2].init(279, 182, 'topEnd && (!startNode._4e_sameLevel(topStart) || !endNode._4e_sameLevel(topEnd))');
function visit426_382_2(result) {
  _$jscoverage['/editor/range.js'].branchData['382'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['382'][1].init(21, 194, 'topStart && topEnd && (!startNode._4e_sameLevel(topStart) || !endNode._4e_sameLevel(topEnd))');
function visit425_382_1(result) {
  _$jscoverage['/editor/range.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['369'][1].init(51, 62, 'endTextNode.previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit424_369_1(result) {
  _$jscoverage['/editor/range.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['368'][1].init(70, 114, 'endTextNode.previousSibling && endTextNode.previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit423_368_1(result) {
  _$jscoverage['/editor/range.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['367'][2].init(69, 46, 'endTextNode.nodeType == Dom.NodeType.TEXT_NODE');
function visit422_367_2(result) {
  _$jscoverage['/editor/range.js'].branchData['367'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['367'][1].init(69, 185, 'endTextNode.nodeType == Dom.NodeType.TEXT_NODE && endTextNode.previousSibling && endTextNode.previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit421_367_1(result) {
  _$jscoverage['/editor/range.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['365'][1].init(664, 11, 'hasSplitEnd');
function visit420_365_1(result) {
  _$jscoverage['/editor/range.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['359'][1].init(115, 60, 'startTextNode.nextSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit419_359_1(result) {
  _$jscoverage['/editor/range.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['357'][1].init(72, 176, 'startTextNode.nextSibling && startTextNode.nextSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit418_357_1(result) {
  _$jscoverage['/editor/range.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['356'][2].init(73, 48, 'startTextNode.nodeType == Dom.NodeType.TEXT_NODE');
function visit417_356_2(result) {
  _$jscoverage['/editor/range.js'].branchData['356'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['356'][1].init(73, 249, 'startTextNode.nodeType == Dom.NodeType.TEXT_NODE && startTextNode.nextSibling && startTextNode.nextSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit416_356_1(result) {
  _$jscoverage['/editor/range.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['354'][1].init(108, 13, 'hasSplitStart');
function visit415_354_1(result) {
  _$jscoverage['/editor/range.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['350'][1].init(8756, 11, 'action == 2');
function visit414_350_1(result) {
  _$jscoverage['/editor/range.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['345'][1].init(1695, 10, 'levelClone');
function visit413_345_1(result) {
  _$jscoverage['/editor/range.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['335'][1].init(243, 11, 'action == 1');
function visit412_335_1(result) {
  _$jscoverage['/editor/range.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['327'][1].init(194, 11, 'action == 2');
function visit411_327_1(result) {
  _$jscoverage['/editor/range.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['317'][1].init(21, 140, '!startParents[k] || !levelStartNode._4e_sameLevel(startParents[k])');
function visit410_317_1(result) {
  _$jscoverage['/editor/range.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['307'][2].init(132, 10, 'action > 0');
function visit409_307_2(result) {
  _$jscoverage['/editor/range.js'].branchData['307'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['307'][1].init(132, 45, 'action > 0 && !levelStartNode.equals(endNode)');
function visit408_307_1(result) {
  _$jscoverage['/editor/range.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['303'][1].init(6919, 21, 'k < endParents.length');
function visit407_303_1(result) {
  _$jscoverage['/editor/range.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['294'][1].init(2234, 10, 'levelClone');
function visit406_294_1(result) {
  _$jscoverage['/editor/range.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['285'][1].init(657, 11, 'action == 1');
function visit405_285_1(result) {
  _$jscoverage['/editor/range.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['275'][1].init(159, 48, 'UN_REMOVABLE[currentNode.nodeName.toLowerCase()]');
function visit404_275_1(result) {
  _$jscoverage['/editor/range.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['268'][1].init(446, 11, 'action == 2');
function visit403_268_1(result) {
  _$jscoverage['/editor/range.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['260'][3].init(195, 25, 'domEndNode == currentNode');
function visit402_260_3(result) {
  _$jscoverage['/editor/range.js'].branchData['260'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['260'][2].init(163, 28, 'domEndParentJ == currentNode');
function visit401_260_2(result) {
  _$jscoverage['/editor/range.js'].branchData['260'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['260'][1].init(163, 57, 'domEndParentJ == currentNode || domEndNode == currentNode');
function visit400_260_1(result) {
  _$jscoverage['/editor/range.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['255'][1].init(108, 27, 'endParentJ && endParentJ[0]');
function visit399_255_1(result) {
  _$jscoverage['/editor/range.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['243'][2].init(132, 10, 'action > 0');
function visit398_243_2(result) {
  _$jscoverage['/editor/range.js'].branchData['243'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['243'][1].init(132, 47, 'action > 0 && !levelStartNode.equals(startNode)');
function visit397_243_1(result) {
  _$jscoverage['/editor/range.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['239'][1].init(4425, 23, 'j < startParents.length');
function visit396_239_1(result) {
  _$jscoverage['/editor/range.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['226'][1].init(348, 24, '!topStart.equals(topEnd)');
function visit395_226_1(result) {
  _$jscoverage['/editor/range.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['218'][1].init(3699, 23, 'i < startParents.length');
function visit394_218_1(result) {
  _$jscoverage['/editor/range.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['190'][1].init(621, 45, 'startOffset >= startNode[0].childNodes.length');
function visit393_190_1(result) {
  _$jscoverage['/editor/range.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['183'][1].init(325, 12, '!startOffset');
function visit392_183_1(result) {
  _$jscoverage['/editor/range.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['174'][1].init(1990, 47, 'startNode[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit391_174_1(result) {
  _$jscoverage['/editor/range.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['158'][1].init(84, 41, 'endOffset >= endNode[0].childNodes.length');
function visit390_158_1(result) {
  _$jscoverage['/editor/range.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['156'][1].init(153, 32, 'endNode[0].childNodes.length > 0');
function visit389_156_1(result) {
  _$jscoverage['/editor/range.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['150'][1].init(904, 45, 'endNode[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit388_150_1(result) {
  _$jscoverage['/editor/range.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['137'][1].init(495, 14, 'self.collapsed');
function visit387_137_1(result) {
  _$jscoverage['/editor/range.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['133'][1].init(402, 10, 'action > 0');
function visit386_133_1(result) {
  _$jscoverage['/editor/range.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['102'][4].init(182, 16, 'nodeName == \'br\'');
function visit385_102_4(result) {
  _$jscoverage['/editor/range.js'].branchData['102'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['102'][3].init(182, 26, 'nodeName == \'br\' && !hadBr');
function visit384_102_3(result) {
  _$jscoverage['/editor/range.js'].branchData['102'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['102'][2].init(169, 39, '!UA[\'ie\'] && nodeName == \'br\' && !hadBr');
function visit383_102_2(result) {
  _$jscoverage['/editor/range.js'].branchData['102'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['102'][1].init(157, 51, '!isStart && !UA[\'ie\'] && nodeName == \'br\' && !hadBr');
function visit382_102_1(result) {
  _$jscoverage['/editor/range.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['99'][1].init(198, 35, '!inlineChildReqElements[nodeName]');
function visit381_99_1(result) {
  _$jscoverage['/editor/range.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['95'][1].init(384, 42, 'node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit380_95_1(result) {
  _$jscoverage['/editor/range.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['92'][1].init(100, 29, 'S.trim(node.nodeValue).length');
function visit379_92_1(result) {
  _$jscoverage['/editor/range.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['90'][1].init(130, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit378_90_1(result) {
  _$jscoverage['/editor/range.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['87'][1].init(63, 16, 'isBookmark(node)');
function visit377_87_1(result) {
  _$jscoverage['/editor/range.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['80'][1].init(79, 40, '!isWhitespace(node) && !isBookmark(node)');
function visit376_80_1(result) {
  _$jscoverage['/editor/range.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['75'][2].init(491, 8, 'c2 || c3');
function visit375_75_2(result) {
  _$jscoverage['/editor/range.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['75'][1].init(485, 14, 'c1 || c2 || c3');
function visit374_75_1(result) {
  _$jscoverage['/editor/range.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['72'][2].init(156, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit373_72_2(result) {
  _$jscoverage['/editor/range.js'].branchData['72'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['72'][1].init(156, 66, 'node.nodeType == Dom.NodeType.TEXT_NODE && !S.trim(node.nodeValue)');
function visit372_72_1(result) {
  _$jscoverage['/editor/range.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['69'][2].init(154, 39, 'node.nodeType != Dom.NodeType.TEXT_NODE');
function visit371_69_2(result) {
  _$jscoverage['/editor/range.js'].branchData['69'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['69'][1].init(154, 98, 'node.nodeType != Dom.NodeType.TEXT_NODE && Dom.nodeName(node) in dtd.$removeEmpty');
function visit370_69_1(result) {
  _$jscoverage['/editor/range.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].lineData[10]++;
KISSY.add("editor/range", function(S, Editor, Utils, Walker, ElementPath) {
  _$jscoverage['/editor/range.js'].functionData[0]++;
  _$jscoverage['/editor/range.js'].lineData[15]++;
  Editor.RangeType = {
  POSITION_AFTER_START: 1, 
  POSITION_BEFORE_END: 2, 
  POSITION_BEFORE_START: 3, 
  POSITION_AFTER_END: 4, 
  ENLARGE_ELEMENT: 1, 
  ENLARGE_BLOCK_CONTENTS: 2, 
  ENLARGE_LIST_ITEM_CONTENTS: 3, 
  START: 1, 
  END: 2, 
  SHRINK_ELEMENT: 1, 
  SHRINK_TEXT: 2};
  _$jscoverage['/editor/range.js'].lineData[29]++;
  var TRUE = true, FALSE = false, NULL = null, KER = Editor.RangeType, KEP = Editor.PositionType, Dom = S.DOM, UA = S.UA, dtd = Editor.XHTML_DTD, Node = S.Node, $ = Node.all, UN_REMOVABLE = {
  'td': 1}, EMPTY = {
  "area": 1, 
  "base": 1, 
  "br": 1, 
  "col": 1, 
  "hr": 1, 
  "img": 1, 
  "input": 1, 
  "link": 1, 
  "meta": 1, 
  "param": 1};
  _$jscoverage['/editor/range.js'].lineData[49]++;
  var isWhitespace = new Walker.whitespaces(), isBookmark = new Walker.bookmark(), isNotWhitespaces = Walker.whitespaces(TRUE), isNotBookmarks = Walker.bookmark(false, true);
  _$jscoverage['/editor/range.js'].lineData[54]++;
  var inlineChildReqElements = {
  "abbr": 1, 
  "acronym": 1, 
  "b": 1, 
  "bdo": 1, 
  "big": 1, 
  "cite": 1, 
  "code": 1, 
  "del": 1, 
  "dfn": 1, 
  "em": 1, 
  "font": 1, 
  "i": 1, 
  "ins": 1, 
  "label": 1, 
  "kbd": 1, 
  "q": 1, 
  "samp": 1, 
  "small": 1, 
  "span": 1, 
  "strike": 1, 
  "strong": 1, 
  "sub": 1, 
  "sup": 1, 
  "tt": 1, 
  "u": 1, 
  'var': 1};
  _$jscoverage['/editor/range.js'].lineData[65]++;
  function elementBoundaryEval(node) {
    _$jscoverage['/editor/range.js'].functionData[1]++;
    _$jscoverage['/editor/range.js'].lineData[69]++;
    var c1 = visit370_69_1(visit371_69_2(node.nodeType != Dom.NodeType.TEXT_NODE) && Dom.nodeName(node) in dtd.$removeEmpty), c2 = visit372_72_1(visit373_72_2(node.nodeType == Dom.NodeType.TEXT_NODE) && !S.trim(node.nodeValue)), c3 = !!node.parentNode.getAttribute('_ke_bookmark');
    _$jscoverage['/editor/range.js'].lineData[75]++;
    return visit374_75_1(c1 || visit375_75_2(c2 || c3));
  }
  _$jscoverage['/editor/range.js'].lineData[78]++;
  function nonWhitespaceOrIsBookmark(node) {
    _$jscoverage['/editor/range.js'].functionData[2]++;
    _$jscoverage['/editor/range.js'].lineData[80]++;
    return visit376_80_1(!isWhitespace(node) && !isBookmark(node));
  }
  _$jscoverage['/editor/range.js'].lineData[83]++;
  function getCheckStartEndBlockEvalFunction(isStart) {
    _$jscoverage['/editor/range.js'].functionData[3]++;
    _$jscoverage['/editor/range.js'].lineData[84]++;
    var hadBr = FALSE;
    _$jscoverage['/editor/range.js'].lineData[85]++;
    return function(node) {
  _$jscoverage['/editor/range.js'].functionData[4]++;
  _$jscoverage['/editor/range.js'].lineData[87]++;
  if (visit377_87_1(isBookmark(node))) {
    _$jscoverage['/editor/range.js'].lineData[88]++;
    return TRUE;
  }
  _$jscoverage['/editor/range.js'].lineData[90]++;
  if (visit378_90_1(node.nodeType == Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[92]++;
    if (visit379_92_1(S.trim(node.nodeValue).length)) {
      _$jscoverage['/editor/range.js'].lineData[93]++;
      return FALSE;
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[95]++;
    if (visit380_95_1(node.nodeType == Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[96]++;
      var nodeName = Dom.nodeName(node);
      _$jscoverage['/editor/range.js'].lineData[99]++;
      if (visit381_99_1(!inlineChildReqElements[nodeName])) {
        _$jscoverage['/editor/range.js'].lineData[102]++;
        if (visit382_102_1(!isStart && visit383_102_2(!UA['ie'] && visit384_102_3(visit385_102_4(nodeName == 'br') && !hadBr)))) {
          _$jscoverage['/editor/range.js'].lineData[103]++;
          hadBr = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[105]++;
          return FALSE;
        }
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[109]++;
  return TRUE;
};
  }
  _$jscoverage['/editor/range.js'].lineData[120]++;
  function execContentsAction(self, action) {
    _$jscoverage['/editor/range.js'].functionData[5]++;
    _$jscoverage['/editor/range.js'].lineData[121]++;
    var startNode = self.startContainer, endNode = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, removeStartNode, hasSplitStart = FALSE, hasSplitEnd = FALSE, t, docFrag = undefined, doc = self.document, removeEndNode;
    _$jscoverage['/editor/range.js'].lineData[133]++;
    if (visit386_133_1(action > 0)) {
      _$jscoverage['/editor/range.js'].lineData[134]++;
      docFrag = doc.createDocumentFragment();
    }
    _$jscoverage['/editor/range.js'].lineData[137]++;
    if (visit387_137_1(self.collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[138]++;
      return docFrag;
    }
    _$jscoverage['/editor/range.js'].lineData[142]++;
    self.optimizeBookmark();
    _$jscoverage['/editor/range.js'].lineData[150]++;
    if (visit388_150_1(endNode[0].nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[151]++;
      hasSplitEnd = TRUE;
      _$jscoverage['/editor/range.js'].lineData[152]++;
      endNode = endNode._4e_splitText(endOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[156]++;
      if (visit389_156_1(endNode[0].childNodes.length > 0)) {
        _$jscoverage['/editor/range.js'].lineData[158]++;
        if (visit390_158_1(endOffset >= endNode[0].childNodes.length)) {
          _$jscoverage['/editor/range.js'].lineData[160]++;
          endNode = new Node(endNode[0].appendChild(doc.createTextNode("")));
          _$jscoverage['/editor/range.js'].lineData[163]++;
          removeEndNode = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[165]++;
          endNode = new Node(endNode[0].childNodes[endOffset]);
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[174]++;
    if (visit391_174_1(startNode[0].nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[175]++;
      hasSplitStart = TRUE;
      _$jscoverage['/editor/range.js'].lineData[176]++;
      startNode._4e_splitText(startOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[183]++;
      if (visit392_183_1(!startOffset)) {
        _$jscoverage['/editor/range.js'].lineData[185]++;
        t = new Node(doc.createTextNode(""));
        _$jscoverage['/editor/range.js'].lineData[186]++;
        startNode.prepend(t);
        _$jscoverage['/editor/range.js'].lineData[187]++;
        startNode = t;
        _$jscoverage['/editor/range.js'].lineData[188]++;
        removeStartNode = TRUE;
      } else {
        _$jscoverage['/editor/range.js'].lineData[190]++;
        if (visit393_190_1(startOffset >= startNode[0].childNodes.length)) {
          _$jscoverage['/editor/range.js'].lineData[192]++;
          startNode = new Node(startNode[0].appendChild(doc.createTextNode('')));
          _$jscoverage['/editor/range.js'].lineData[194]++;
          removeStartNode = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[196]++;
          startNode = new Node(startNode[0].childNodes[startOffset].previousSibling);
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[203]++;
    var startParents = startNode._4e_parents(), endParents = endNode._4e_parents();
    _$jscoverage['/editor/range.js'].lineData[206]++;
    startParents.each(function(n, i) {
  _$jscoverage['/editor/range.js'].functionData[6]++;
  _$jscoverage['/editor/range.js'].lineData[207]++;
  startParents[i] = n;
});
    _$jscoverage['/editor/range.js'].lineData[210]++;
    endParents.each(function(n, i) {
  _$jscoverage['/editor/range.js'].functionData[7]++;
  _$jscoverage['/editor/range.js'].lineData[211]++;
  endParents[i] = n;
});
    _$jscoverage['/editor/range.js'].lineData[216]++;
    var i, topStart, topEnd;
    _$jscoverage['/editor/range.js'].lineData[218]++;
    for (i = 0; visit394_218_1(i < startParents.length); i++) {
      _$jscoverage['/editor/range.js'].lineData[219]++;
      topStart = startParents[i];
      _$jscoverage['/editor/range.js'].lineData[220]++;
      topEnd = endParents[i];
      _$jscoverage['/editor/range.js'].lineData[226]++;
      if (visit395_226_1(!topStart.equals(topEnd))) {
        _$jscoverage['/editor/range.js'].lineData[227]++;
        break;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[231]++;
    var clone = docFrag, levelStartNode, levelClone, currentNode, currentSibling;
    _$jscoverage['/editor/range.js'].lineData[239]++;
    for (var j = i; visit396_239_1(j < startParents.length); j++) {
      _$jscoverage['/editor/range.js'].lineData[240]++;
      levelStartNode = startParents[j];
      _$jscoverage['/editor/range.js'].lineData[243]++;
      if (visit397_243_1(visit398_243_2(action > 0) && !levelStartNode.equals(startNode))) {
        _$jscoverage['/editor/range.js'].lineData[245]++;
        levelClone = clone.appendChild(levelStartNode.clone()[0]);
      } else {
        _$jscoverage['/editor/range.js'].lineData[247]++;
        levelClone = null;
      }
      _$jscoverage['/editor/range.js'].lineData[251]++;
      currentNode = levelStartNode[0].nextSibling;
      _$jscoverage['/editor/range.js'].lineData[253]++;
      var endParentJ = endParents[j], domEndNode = endNode[0], domEndParentJ = visit399_255_1(endParentJ && endParentJ[0]);
      _$jscoverage['/editor/range.js'].lineData[257]++;
      while (currentNode) {
        _$jscoverage['/editor/range.js'].lineData[260]++;
        if (visit400_260_1(visit401_260_2(domEndParentJ == currentNode) || visit402_260_3(domEndNode == currentNode))) {
          _$jscoverage['/editor/range.js'].lineData[261]++;
          break;
        }
        _$jscoverage['/editor/range.js'].lineData[265]++;
        currentSibling = currentNode.nextSibling;
        _$jscoverage['/editor/range.js'].lineData[268]++;
        if (visit403_268_1(action == 2)) {
          _$jscoverage['/editor/range.js'].lineData[270]++;
          clone.appendChild(currentNode.cloneNode(TRUE));
        } else {
          _$jscoverage['/editor/range.js'].lineData[275]++;
          if (visit404_275_1(UN_REMOVABLE[currentNode.nodeName.toLowerCase()])) {
            _$jscoverage['/editor/range.js'].lineData[276]++;
            var tmp = currentNode.cloneNode(TRUE);
            _$jscoverage['/editor/range.js'].lineData[277]++;
            currentNode.innerHTML = '';
            _$jscoverage['/editor/range.js'].lineData[278]++;
            currentNode = tmp;
          } else {
            _$jscoverage['/editor/range.js'].lineData[281]++;
            Dom._4e_remove(currentNode);
          }
          _$jscoverage['/editor/range.js'].lineData[285]++;
          if (visit405_285_1(action == 1)) {
            _$jscoverage['/editor/range.js'].lineData[287]++;
            clone.appendChild(currentNode);
          }
        }
        _$jscoverage['/editor/range.js'].lineData[291]++;
        currentNode = currentSibling;
      }
      _$jscoverage['/editor/range.js'].lineData[294]++;
      if (visit406_294_1(levelClone)) {
        _$jscoverage['/editor/range.js'].lineData[295]++;
        clone = levelClone;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[299]++;
    clone = docFrag;
    _$jscoverage['/editor/range.js'].lineData[303]++;
    for (var k = i; visit407_303_1(k < endParents.length); k++) {
      _$jscoverage['/editor/range.js'].lineData[304]++;
      levelStartNode = endParents[k];
      _$jscoverage['/editor/range.js'].lineData[307]++;
      if (visit408_307_1(visit409_307_2(action > 0) && !levelStartNode.equals(endNode))) {
        _$jscoverage['/editor/range.js'].lineData[310]++;
        levelClone = clone.appendChild(levelStartNode.clone()[0]);
      } else {
        _$jscoverage['/editor/range.js'].lineData[312]++;
        levelClone = null;
      }
      _$jscoverage['/editor/range.js'].lineData[316]++;
      if (visit410_317_1(!startParents[k] || !levelStartNode._4e_sameLevel(startParents[k]))) {
        _$jscoverage['/editor/range.js'].lineData[321]++;
        currentNode = levelStartNode[0].previousSibling;
        _$jscoverage['/editor/range.js'].lineData[322]++;
        while (currentNode) {
          _$jscoverage['/editor/range.js'].lineData[324]++;
          currentSibling = currentNode.previousSibling;
          _$jscoverage['/editor/range.js'].lineData[327]++;
          if (visit411_327_1(action == 2)) {
            _$jscoverage['/editor/range.js'].lineData[328]++;
            clone.insertBefore(currentNode.cloneNode(TRUE), clone.firstChild);
          } else {
            _$jscoverage['/editor/range.js'].lineData[332]++;
            Dom._4e_remove(currentNode);
            _$jscoverage['/editor/range.js'].lineData[335]++;
            if (visit412_335_1(action == 1)) {
              _$jscoverage['/editor/range.js'].lineData[337]++;
              clone.insertBefore(currentNode, clone.firstChild);
            }
          }
          _$jscoverage['/editor/range.js'].lineData[341]++;
          currentNode = currentSibling;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[345]++;
      if (visit413_345_1(levelClone)) {
        _$jscoverage['/editor/range.js'].lineData[346]++;
        clone = levelClone;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[350]++;
    if (visit414_350_1(action == 2)) {
      _$jscoverage['/editor/range.js'].lineData[354]++;
      if (visit415_354_1(hasSplitStart)) {
        _$jscoverage['/editor/range.js'].lineData[355]++;
        var startTextNode = startNode[0];
        _$jscoverage['/editor/range.js'].lineData[356]++;
        if (visit416_356_1(visit417_356_2(startTextNode.nodeType == Dom.NodeType.TEXT_NODE) && visit418_357_1(startTextNode.nextSibling && visit419_359_1(startTextNode.nextSibling.nodeType == Dom.NodeType.TEXT_NODE)))) {
          _$jscoverage['/editor/range.js'].lineData[360]++;
          startTextNode.data += startTextNode.nextSibling.data;
          _$jscoverage['/editor/range.js'].lineData[361]++;
          startTextNode.parentNode.removeChild(startTextNode.nextSibling);
        }
      }
      _$jscoverage['/editor/range.js'].lineData[365]++;
      if (visit420_365_1(hasSplitEnd)) {
        _$jscoverage['/editor/range.js'].lineData[366]++;
        var endTextNode = endNode[0];
        _$jscoverage['/editor/range.js'].lineData[367]++;
        if (visit421_367_1(visit422_367_2(endTextNode.nodeType == Dom.NodeType.TEXT_NODE) && visit423_368_1(endTextNode.previousSibling && visit424_369_1(endTextNode.previousSibling.nodeType == Dom.NodeType.TEXT_NODE)))) {
          _$jscoverage['/editor/range.js'].lineData[370]++;
          endTextNode.previousSibling.data += endTextNode.data;
          _$jscoverage['/editor/range.js'].lineData[371]++;
          endTextNode.parentNode.removeChild(endTextNode);
        }
      }
    } else {
      _$jscoverage['/editor/range.js'].lineData[381]++;
      if (visit425_382_1(topStart && visit426_382_2(topEnd && (visit427_384_1(!startNode._4e_sameLevel(topStart) || !endNode._4e_sameLevel(topEnd)))))) {
        _$jscoverage['/editor/range.js'].lineData[388]++;
        var startIndex = topStart._4e_index();
        _$jscoverage['/editor/range.js'].lineData[392]++;
        if (visit428_392_1(removeStartNode && (topStart._4e_sameLevel(startNode)))) {
          _$jscoverage['/editor/range.js'].lineData[395]++;
          startIndex--;
        }
        _$jscoverage['/editor/range.js'].lineData[398]++;
        self.setStart(topStart.parent(), startIndex + 1);
      }
      _$jscoverage['/editor/range.js'].lineData[402]++;
      self.collapse(TRUE);
    }
    _$jscoverage['/editor/range.js'].lineData[407]++;
    if (visit429_407_1(removeStartNode)) {
      _$jscoverage['/editor/range.js'].lineData[408]++;
      startNode.remove();
    }
    _$jscoverage['/editor/range.js'].lineData[411]++;
    if (visit430_411_1(removeEndNode)) {
      _$jscoverage['/editor/range.js'].lineData[412]++;
      endNode.remove();
    }
    _$jscoverage['/editor/range.js'].lineData[415]++;
    return docFrag;
  }
  _$jscoverage['/editor/range.js'].lineData[418]++;
  function updateCollapsed(self) {
    _$jscoverage['/editor/range.js'].functionData[8]++;
    _$jscoverage['/editor/range.js'].lineData[419]++;
    self.collapsed = (visit431_420_1(self.startContainer && visit432_421_1(self.endContainer && visit433_422_1(visit434_422_2(self.startContainer[0] == self.endContainer[0]) && visit435_423_1(self.startOffset == self.endOffset)))));
  }
  _$jscoverage['/editor/range.js'].lineData[432]++;
  function KERange(document) {
    _$jscoverage['/editor/range.js'].functionData[9]++;
    _$jscoverage['/editor/range.js'].lineData[433]++;
    var self = this;
    _$jscoverage['/editor/range.js'].lineData[434]++;
    self.startContainer = NULL;
    _$jscoverage['/editor/range.js'].lineData[435]++;
    self.startOffset = NULL;
    _$jscoverage['/editor/range.js'].lineData[436]++;
    self.endContainer = NULL;
    _$jscoverage['/editor/range.js'].lineData[437]++;
    self.endOffset = NULL;
    _$jscoverage['/editor/range.js'].lineData[438]++;
    self.collapsed = TRUE;
    _$jscoverage['/editor/range.js'].lineData[439]++;
    self.document = document;
  }
  _$jscoverage['/editor/range.js'].lineData[442]++;
  S.augment(KERange, {
  toString: function() {
  _$jscoverage['/editor/range.js'].functionData[10]++;
  _$jscoverage['/editor/range.js'].lineData[448]++;
  var s = [], self = this, startContainer = self.startContainer[0], endContainer = self.endContainer[0];
  _$jscoverage['/editor/range.js'].lineData[452]++;
  s.push((visit436_452_1(startContainer.id || startContainer.nodeName)) + ":" + self.startOffset);
  _$jscoverage['/editor/range.js'].lineData[453]++;
  s.push((visit437_453_1(endContainer.id || endContainer.nodeName)) + ":" + self.endOffset);
  _$jscoverage['/editor/range.js'].lineData[454]++;
  return s.join("<br/>");
}, 
  optimize: function() {
  _$jscoverage['/editor/range.js'].functionData[11]++;
  _$jscoverage['/editor/range.js'].lineData[464]++;
  var self = this, container = self.startContainer, offset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[468]++;
  if (visit438_468_1(container[0].nodeType != Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[469]++;
    if (visit439_469_1(!offset)) {
      _$jscoverage['/editor/range.js'].lineData[470]++;
      self.setStartBefore(container);
    } else {
      _$jscoverage['/editor/range.js'].lineData[471]++;
      if (visit440_471_1(offset >= container[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[472]++;
        self.setStartAfter(container);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[476]++;
  container = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[477]++;
  offset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[479]++;
  if (visit441_479_1(container[0].nodeType != Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[480]++;
    if (visit442_480_1(!offset)) {
      _$jscoverage['/editor/range.js'].lineData[481]++;
      self.setEndBefore(container);
    } else {
      _$jscoverage['/editor/range.js'].lineData[482]++;
      if (visit443_482_1(offset >= container[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[483]++;
        self.setEndAfter(container);
      }
    }
  }
}, 
  setStartAfter: function(node) {
  _$jscoverage['/editor/range.js'].functionData[12]++;
  _$jscoverage['/editor/range.js'].lineData[493]++;
  this.setStart(node.parent(), node._4e_index() + 1);
}, 
  setStartBefore: function(node) {
  _$jscoverage['/editor/range.js'].functionData[13]++;
  _$jscoverage['/editor/range.js'].lineData[500]++;
  this.setStart(node.parent(), node._4e_index());
}, 
  setEndAfter: function(node) {
  _$jscoverage['/editor/range.js'].functionData[14]++;
  _$jscoverage['/editor/range.js'].lineData[507]++;
  this.setEnd(node.parent(), node._4e_index() + 1);
}, 
  setEndBefore: function(node) {
  _$jscoverage['/editor/range.js'].functionData[15]++;
  _$jscoverage['/editor/range.js'].lineData[514]++;
  this.setEnd(node.parent(), node._4e_index());
}, 
  optimizeBookmark: function() {
  _$jscoverage['/editor/range.js'].functionData[16]++;
  _$jscoverage['/editor/range.js'].lineData[521]++;
  var self = this, startNode = self.startContainer, endNode = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[525]++;
  if (visit444_525_1(startNode && visit445_526_1(visit446_526_2(startNode.nodeName() == 'span') && startNode.attr('_ke_bookmark')))) {
    _$jscoverage['/editor/range.js'].lineData[528]++;
    self.setStartBefore(startNode);
  }
  _$jscoverage['/editor/range.js'].lineData[530]++;
  if (visit447_530_1(endNode && visit448_531_1(visit449_531_2(endNode.nodeName() == 'span') && endNode.attr('_ke_bookmark')))) {
    _$jscoverage['/editor/range.js'].lineData[533]++;
    self.setEndAfter(endNode);
  }
}, 
  setStart: function(startNode, startOffset) {
  _$jscoverage['/editor/range.js'].functionData[17]++;
  _$jscoverage['/editor/range.js'].lineData[551]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[552]++;
  if (visit450_552_1(visit451_552_2(startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && EMPTY[startNode.nodeName()])) {
    _$jscoverage['/editor/range.js'].lineData[553]++;
    startNode = startNode.parent();
    _$jscoverage['/editor/range.js'].lineData[554]++;
    startOffset = startNode._4e_index();
  }
  _$jscoverage['/editor/range.js'].lineData[557]++;
  self.startContainer = startNode;
  _$jscoverage['/editor/range.js'].lineData[558]++;
  self.startOffset = startOffset;
  _$jscoverage['/editor/range.js'].lineData[560]++;
  if (visit452_560_1(!self.endContainer)) {
    _$jscoverage['/editor/range.js'].lineData[561]++;
    self.endContainer = startNode;
    _$jscoverage['/editor/range.js'].lineData[562]++;
    self.endOffset = startOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[565]++;
  updateCollapsed(self);
}, 
  setEnd: function(endNode, endOffset) {
  _$jscoverage['/editor/range.js'].functionData[18]++;
  _$jscoverage['/editor/range.js'].lineData[582]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[583]++;
  if (visit453_583_1(visit454_583_2(endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && EMPTY[endNode.nodeName()])) {
    _$jscoverage['/editor/range.js'].lineData[584]++;
    endNode = endNode.parent();
    _$jscoverage['/editor/range.js'].lineData[585]++;
    endOffset = endNode._4e_index() + 1;
  }
  _$jscoverage['/editor/range.js'].lineData[588]++;
  self.endContainer = endNode;
  _$jscoverage['/editor/range.js'].lineData[589]++;
  self.endOffset = endOffset;
  _$jscoverage['/editor/range.js'].lineData[591]++;
  if (visit455_591_1(!self.startContainer)) {
    _$jscoverage['/editor/range.js'].lineData[592]++;
    self.startContainer = endNode;
    _$jscoverage['/editor/range.js'].lineData[593]++;
    self.startOffset = endOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[596]++;
  updateCollapsed(self);
}, 
  setStartAt: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[19]++;
  _$jscoverage['/editor/range.js'].lineData[605]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[606]++;
  switch (position) {
    case KER.POSITION_AFTER_START:
      _$jscoverage['/editor/range.js'].lineData[608]++;
      self.setStart(node, 0);
      _$jscoverage['/editor/range.js'].lineData[609]++;
      break;
    case KER.POSITION_BEFORE_END:
      _$jscoverage['/editor/range.js'].lineData[612]++;
      if (visit456_612_1(node[0].nodeType == Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[613]++;
        self.setStart(node, node[0].nodeValue.length);
      } else {
        _$jscoverage['/editor/range.js'].lineData[615]++;
        self.setStart(node, node[0].childNodes.length);
      }
      _$jscoverage['/editor/range.js'].lineData[617]++;
      break;
    case KER.POSITION_BEFORE_START:
      _$jscoverage['/editor/range.js'].lineData[620]++;
      self.setStartBefore(node);
      _$jscoverage['/editor/range.js'].lineData[621]++;
      break;
    case KER.POSITION_AFTER_END:
      _$jscoverage['/editor/range.js'].lineData[624]++;
      self.setStartAfter(node);
  }
  _$jscoverage['/editor/range.js'].lineData[627]++;
  updateCollapsed(self);
}, 
  setEndAt: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[20]++;
  _$jscoverage['/editor/range.js'].lineData[636]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[637]++;
  switch (position) {
    case KER.POSITION_AFTER_START:
      _$jscoverage['/editor/range.js'].lineData[639]++;
      self.setEnd(node, 0);
      _$jscoverage['/editor/range.js'].lineData[640]++;
      break;
    case KER.POSITION_BEFORE_END:
      _$jscoverage['/editor/range.js'].lineData[643]++;
      if (visit457_643_1(node[0].nodeType == Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[644]++;
        self.setEnd(node, node[0].nodeValue.length);
      } else {
        _$jscoverage['/editor/range.js'].lineData[646]++;
        self.setEnd(node, node[0].childNodes.length);
      }
      _$jscoverage['/editor/range.js'].lineData[648]++;
      break;
    case KER.POSITION_BEFORE_START:
      _$jscoverage['/editor/range.js'].lineData[651]++;
      self.setEndBefore(node);
      _$jscoverage['/editor/range.js'].lineData[652]++;
      break;
    case KER.POSITION_AFTER_END:
      _$jscoverage['/editor/range.js'].lineData[655]++;
      self.setEndAfter(node);
  }
  _$jscoverage['/editor/range.js'].lineData[658]++;
  updateCollapsed(self);
}, 
  cloneContents: function() {
  _$jscoverage['/editor/range.js'].functionData[21]++;
  _$jscoverage['/editor/range.js'].lineData[665]++;
  return execContentsAction(this, 2);
}, 
  deleteContents: function() {
  _$jscoverage['/editor/range.js'].functionData[22]++;
  _$jscoverage['/editor/range.js'].lineData[672]++;
  return execContentsAction(this, 0);
}, 
  extractContents: function() {
  _$jscoverage['/editor/range.js'].functionData[23]++;
  _$jscoverage['/editor/range.js'].lineData[679]++;
  return execContentsAction(this, 1);
}, 
  collapse: function(toStart) {
  _$jscoverage['/editor/range.js'].functionData[24]++;
  _$jscoverage['/editor/range.js'].lineData[687]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[688]++;
  if (visit458_688_1(toStart)) {
    _$jscoverage['/editor/range.js'].lineData[689]++;
    self.endContainer = self.startContainer;
    _$jscoverage['/editor/range.js'].lineData[690]++;
    self.endOffset = self.startOffset;
  } else {
    _$jscoverage['/editor/range.js'].lineData[692]++;
    self.startContainer = self.endContainer;
    _$jscoverage['/editor/range.js'].lineData[693]++;
    self.startOffset = self.endOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[695]++;
  self.collapsed = TRUE;
}, 
  clone: function() {
  _$jscoverage['/editor/range.js'].functionData[25]++;
  _$jscoverage['/editor/range.js'].lineData[703]++;
  var self = this, clone = new KERange(self.document);
  _$jscoverage['/editor/range.js'].lineData[706]++;
  clone.startContainer = self.startContainer;
  _$jscoverage['/editor/range.js'].lineData[707]++;
  clone.startOffset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[708]++;
  clone.endContainer = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[709]++;
  clone.endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[710]++;
  clone.collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[712]++;
  return clone;
}, 
  getEnclosedNode: function() {
  _$jscoverage['/editor/range.js'].functionData[26]++;
  _$jscoverage['/editor/range.js'].lineData[724]++;
  var walkerRange = this.clone();
  _$jscoverage['/editor/range.js'].lineData[727]++;
  walkerRange.optimize();
  _$jscoverage['/editor/range.js'].lineData[729]++;
  if (visit459_729_1(visit460_729_2(walkerRange.startContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE) || visit461_730_1(walkerRange.endContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[731]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[734]++;
  var walker = new Walker(walkerRange), node, pre;
  _$jscoverage['/editor/range.js'].lineData[737]++;
  walker.evaluator = function(node) {
  _$jscoverage['/editor/range.js'].functionData[27]++;
  _$jscoverage['/editor/range.js'].lineData[738]++;
  return visit462_738_1(isNotWhitespaces(node) && isNotBookmarks(node));
};
  _$jscoverage['/editor/range.js'].lineData[745]++;
  node = walker.next();
  _$jscoverage['/editor/range.js'].lineData[746]++;
  walker.reset();
  _$jscoverage['/editor/range.js'].lineData[747]++;
  pre = walker.previous();
  _$jscoverage['/editor/range.js'].lineData[749]++;
  return visit463_749_1(node && node.equals(pre)) ? node : NULL;
}, 
  shrink: function(mode, selectContents) {
  _$jscoverage['/editor/range.js'].functionData[28]++;
  _$jscoverage['/editor/range.js'].lineData[759]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[760]++;
  if (visit464_760_1(!self.collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[761]++;
    mode = visit465_761_1(mode || KER.SHRINK_TEXT);
    _$jscoverage['/editor/range.js'].lineData[763]++;
    var walkerRange = self.clone(), startContainer = self.startContainer, endContainer = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, moveStart = TRUE, currentElement, walker, moveEnd = TRUE;
    _$jscoverage['/editor/range.js'].lineData[774]++;
    if (visit466_774_1(startContainer && visit467_775_1(startContainer[0].nodeType == Dom.NodeType.TEXT_NODE))) {
      _$jscoverage['/editor/range.js'].lineData[776]++;
      if (visit468_776_1(!startOffset)) {
        _$jscoverage['/editor/range.js'].lineData[777]++;
        walkerRange.setStartBefore(startContainer);
      } else {
        _$jscoverage['/editor/range.js'].lineData[778]++;
        if (visit469_778_1(startOffset >= startContainer[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[779]++;
          walkerRange.setStartAfter(startContainer);
        } else {
          _$jscoverage['/editor/range.js'].lineData[783]++;
          walkerRange.setStartBefore(startContainer);
          _$jscoverage['/editor/range.js'].lineData[784]++;
          moveStart = FALSE;
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[788]++;
    if (visit470_788_1(endContainer && visit471_789_1(endContainer[0].nodeType == Dom.NodeType.TEXT_NODE))) {
      _$jscoverage['/editor/range.js'].lineData[790]++;
      if (visit472_790_1(!endOffset)) {
        _$jscoverage['/editor/range.js'].lineData[791]++;
        walkerRange.setEndBefore(endContainer);
      } else {
        _$jscoverage['/editor/range.js'].lineData[792]++;
        if (visit473_792_1(endOffset >= endContainer[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[793]++;
          walkerRange.setEndAfter(endContainer);
        } else {
          _$jscoverage['/editor/range.js'].lineData[795]++;
          walkerRange.setEndAfter(endContainer);
          _$jscoverage['/editor/range.js'].lineData[796]++;
          moveEnd = FALSE;
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[800]++;
    if (visit474_800_1(moveStart || moveEnd)) {
      _$jscoverage['/editor/range.js'].lineData[802]++;
      walker = new Walker(walkerRange);
      _$jscoverage['/editor/range.js'].lineData[804]++;
      walker.evaluator = function(node) {
  _$jscoverage['/editor/range.js'].functionData[29]++;
  _$jscoverage['/editor/range.js'].lineData[805]++;
  return visit475_805_1(node.nodeType == (visit476_805_2(mode == KER.SHRINK_ELEMENT) ? Dom.NodeType.ELEMENT_NODE : Dom.NodeType.TEXT_NODE));
};
      _$jscoverage['/editor/range.js'].lineData[809]++;
      walker.guard = function(node, movingOut) {
  _$jscoverage['/editor/range.js'].functionData[30]++;
  _$jscoverage['/editor/range.js'].lineData[811]++;
  if (visit477_811_1(visit478_811_2(mode == KER.SHRINK_ELEMENT) && visit479_812_1(node.nodeType == Dom.NodeType.TEXT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[813]++;
    return FALSE;
  }
  _$jscoverage['/editor/range.js'].lineData[816]++;
  if (visit480_816_1(movingOut && visit481_816_2(node == currentElement))) {
    _$jscoverage['/editor/range.js'].lineData[817]++;
    return FALSE;
  }
  _$jscoverage['/editor/range.js'].lineData[819]++;
  if (visit482_819_1(!movingOut && visit483_819_2(node.nodeType == Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[820]++;
    currentElement = node;
  }
  _$jscoverage['/editor/range.js'].lineData[822]++;
  return TRUE;
};
    }
    _$jscoverage['/editor/range.js'].lineData[827]++;
    if (visit484_827_1(moveStart)) {
      _$jscoverage['/editor/range.js'].lineData[828]++;
      var textStart = walker[visit485_828_1(mode == KER.SHRINK_ELEMENT) ? 'lastForward' : 'next']();
      _$jscoverage['/editor/range.js'].lineData[829]++;
      if (visit486_829_1(textStart)) {
        _$jscoverage['/editor/range.js'].lineData[830]++;
        self.setStartAt(textStart, selectContents ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_START);
      }
    }
    _$jscoverage['/editor/range.js'].lineData[834]++;
    if (visit487_834_1(moveEnd)) {
      _$jscoverage['/editor/range.js'].lineData[835]++;
      walker.reset();
      _$jscoverage['/editor/range.js'].lineData[836]++;
      var textEnd = walker[visit488_836_1(mode == KER.SHRINK_ELEMENT) ? 'lastBackward' : 'previous']();
      _$jscoverage['/editor/range.js'].lineData[837]++;
      if (visit489_837_1(textEnd)) {
        _$jscoverage['/editor/range.js'].lineData[838]++;
        self.setEndAt(textEnd, selectContents ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_END);
      }
    }
    _$jscoverage['/editor/range.js'].lineData[842]++;
    return visit490_842_1(moveStart || moveEnd);
  }
}, 
  createBookmark2: function(normalized) {
  _$jscoverage['/editor/range.js'].functionData[31]++;
  _$jscoverage['/editor/range.js'].lineData[852]++;
  var self = this, startContainer = self.startContainer, endContainer = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, child, previous;
  _$jscoverage['/editor/range.js'].lineData[862]++;
  if (visit491_862_1(!startContainer || !endContainer)) {
    _$jscoverage['/editor/range.js'].lineData[863]++;
    return {
  start: 0, 
  end: 0};
  }
  _$jscoverage['/editor/range.js'].lineData[869]++;
  if (visit492_869_1(normalized)) {
    _$jscoverage['/editor/range.js'].lineData[872]++;
    if (visit493_872_1(startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[873]++;
      child = new Node(startContainer[0].childNodes[startOffset]);
      _$jscoverage['/editor/range.js'].lineData[877]++;
      if (visit494_877_1(child && visit495_877_2(child[0] && visit496_877_3(visit497_877_4(child[0].nodeType == Dom.NodeType.TEXT_NODE) && visit498_878_1(visit499_878_2(startOffset > 0) && visit500_878_3(child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE)))))) {
        _$jscoverage['/editor/range.js'].lineData[879]++;
        startContainer = child;
        _$jscoverage['/editor/range.js'].lineData[880]++;
        startOffset = 0;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[886]++;
    while (visit501_886_1(visit502_886_2(startContainer[0].nodeType == Dom.NodeType.TEXT_NODE) && visit503_887_1((previous = startContainer.prev(undefined, 1)) && visit504_888_1(previous[0].nodeType == Dom.NodeType.TEXT_NODE)))) {
      _$jscoverage['/editor/range.js'].lineData[889]++;
      startContainer = previous;
      _$jscoverage['/editor/range.js'].lineData[890]++;
      startOffset += previous[0].nodeValue.length;
    }
    _$jscoverage['/editor/range.js'].lineData[894]++;
    if (visit505_894_1(!self.collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[897]++;
      if (visit506_897_1(endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[898]++;
        child = new Node(endContainer[0].childNodes[endOffset]);
        _$jscoverage['/editor/range.js'].lineData[902]++;
        if (visit507_902_1(child && visit508_902_2(child[0] && visit509_903_1(visit510_903_2(child[0].nodeType == Dom.NodeType.TEXT_NODE) && visit511_903_3(visit512_903_4(endOffset > 0) && visit513_904_1(child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE)))))) {
          _$jscoverage['/editor/range.js'].lineData[905]++;
          endContainer = child;
          _$jscoverage['/editor/range.js'].lineData[906]++;
          endOffset = 0;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[911]++;
      while (visit514_911_1(visit515_911_2(endContainer[0].nodeType == Dom.NodeType.TEXT_NODE) && visit516_912_1((previous = endContainer.prev(undefined, 1)) && visit517_913_1(previous[0].nodeType == Dom.NodeType.TEXT_NODE)))) {
        _$jscoverage['/editor/range.js'].lineData[914]++;
        endContainer = previous;
        _$jscoverage['/editor/range.js'].lineData[915]++;
        endOffset += previous[0].nodeValue.length;
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[920]++;
  return {
  start: startContainer._4e_address(normalized), 
  end: self.collapsed ? NULL : endContainer._4e_address(normalized), 
  startOffset: startOffset, 
  endOffset: endOffset, 
  normalized: normalized, 
  is2: TRUE};
}, 
  createBookmark: function(serializable) {
  _$jscoverage['/editor/range.js'].functionData[32]++;
  _$jscoverage['/editor/range.js'].lineData[934]++;
  var startNode, endNode, baseId, clone, self = this, collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[940]++;
  startNode = new Node("<span>", NULL, self.document);
  _$jscoverage['/editor/range.js'].lineData[941]++;
  startNode.attr('_ke_bookmark', 1);
  _$jscoverage['/editor/range.js'].lineData[942]++;
  startNode.css('display', 'none');
  _$jscoverage['/editor/range.js'].lineData[946]++;
  startNode.html('&nbsp;');
  _$jscoverage['/editor/range.js'].lineData[948]++;
  if (visit518_948_1(serializable)) {
    _$jscoverage['/editor/range.js'].lineData[949]++;
    baseId = S.guid('ke_bm_');
    _$jscoverage['/editor/range.js'].lineData[950]++;
    startNode.attr('id', baseId + 'S');
  }
  _$jscoverage['/editor/range.js'].lineData[954]++;
  if (visit519_954_1(!collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[955]++;
    endNode = startNode.clone();
    _$jscoverage['/editor/range.js'].lineData[956]++;
    endNode.html('&nbsp;');
    _$jscoverage['/editor/range.js'].lineData[958]++;
    if (visit520_958_1(serializable)) {
      _$jscoverage['/editor/range.js'].lineData[959]++;
      endNode.attr('id', baseId + 'E');
    }
    _$jscoverage['/editor/range.js'].lineData[962]++;
    clone = self.clone();
    _$jscoverage['/editor/range.js'].lineData[963]++;
    clone.collapse();
    _$jscoverage['/editor/range.js'].lineData[964]++;
    clone.insertNode(endNode);
  }
  _$jscoverage['/editor/range.js'].lineData[967]++;
  clone = self.clone();
  _$jscoverage['/editor/range.js'].lineData[968]++;
  clone.collapse(TRUE);
  _$jscoverage['/editor/range.js'].lineData[969]++;
  clone.insertNode(startNode);
  _$jscoverage['/editor/range.js'].lineData[972]++;
  if (visit521_972_1(endNode)) {
    _$jscoverage['/editor/range.js'].lineData[973]++;
    self.setStartAfter(startNode);
    _$jscoverage['/editor/range.js'].lineData[974]++;
    self.setEndBefore(endNode);
  } else {
    _$jscoverage['/editor/range.js'].lineData[976]++;
    self.moveToPosition(startNode, KER.POSITION_AFTER_END);
  }
  _$jscoverage['/editor/range.js'].lineData[979]++;
  return {
  startNode: serializable ? baseId + 'S' : startNode, 
  endNode: serializable ? baseId + 'E' : endNode, 
  serializable: serializable, 
  collapsed: collapsed};
}, 
  moveToPosition: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[33]++;
  _$jscoverage['/editor/range.js'].lineData[993]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[994]++;
  self.setStartAt(node, position);
  _$jscoverage['/editor/range.js'].lineData[995]++;
  self.collapse(TRUE);
}, 
  trim: function(ignoreStart, ignoreEnd) {
  _$jscoverage['/editor/range.js'].functionData[34]++;
  _$jscoverage['/editor/range.js'].lineData[1004]++;
  var self = this, startContainer = self.startContainer, startOffset = self.startOffset, collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[1009]++;
  if (visit522_1009_1((visit523_1009_2(!ignoreStart || collapsed)) && visit524_1010_1(startContainer[0] && visit525_1011_1(startContainer[0].nodeType == Dom.NodeType.TEXT_NODE)))) {
    _$jscoverage['/editor/range.js'].lineData[1014]++;
    if (visit526_1014_1(!startOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1015]++;
      startOffset = startContainer._4e_index();
      _$jscoverage['/editor/range.js'].lineData[1016]++;
      startContainer = startContainer.parent();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1020]++;
      if (visit527_1020_1(startOffset >= startContainer[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[1021]++;
        startOffset = startContainer._4e_index() + 1;
        _$jscoverage['/editor/range.js'].lineData[1022]++;
        startContainer = startContainer.parent();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1027]++;
        var nextText = startContainer._4e_splitText(startOffset);
        _$jscoverage['/editor/range.js'].lineData[1029]++;
        startOffset = startContainer._4e_index() + 1;
        _$jscoverage['/editor/range.js'].lineData[1030]++;
        startContainer = startContainer.parent();
        _$jscoverage['/editor/range.js'].lineData[1033]++;
        if (visit528_1033_1(Dom.equals(self.startContainer, self.endContainer))) {
          _$jscoverage['/editor/range.js'].lineData[1034]++;
          self.setEnd(nextText, self.endOffset - self.startOffset);
        } else {
          _$jscoverage['/editor/range.js'].lineData[1035]++;
          if (visit529_1035_1(Dom.equals(startContainer, self.endContainer))) {
            _$jscoverage['/editor/range.js'].lineData[1036]++;
            self.endOffset += 1;
          }
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[1040]++;
    self.setStart(startContainer, startOffset);
    _$jscoverage['/editor/range.js'].lineData[1042]++;
    if (visit530_1042_1(collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[1043]++;
      self.collapse(TRUE);
      _$jscoverage['/editor/range.js'].lineData[1044]++;
      return;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1048]++;
  var endContainer = self.endContainer, endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[1051]++;
  if (visit531_1051_1(!(visit532_1051_2(ignoreEnd || collapsed)) && visit533_1052_1(endContainer[0] && visit534_1052_2(endContainer[0].nodeType == Dom.NodeType.TEXT_NODE)))) {
    _$jscoverage['/editor/range.js'].lineData[1055]++;
    if (visit535_1055_1(!endOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1056]++;
      endOffset = endContainer._4e_index();
      _$jscoverage['/editor/range.js'].lineData[1057]++;
      endContainer = endContainer.parent();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1061]++;
      if (visit536_1061_1(endOffset >= endContainer[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[1062]++;
        endOffset = endContainer._4e_index() + 1;
        _$jscoverage['/editor/range.js'].lineData[1063]++;
        endContainer = endContainer.parent();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1068]++;
        endContainer._4e_splitText(endOffset);
        _$jscoverage['/editor/range.js'].lineData[1070]++;
        endOffset = endContainer._4e_index() + 1;
        _$jscoverage['/editor/range.js'].lineData[1071]++;
        endContainer = endContainer.parent();
      }
    }
    _$jscoverage['/editor/range.js'].lineData[1074]++;
    self.setEnd(endContainer, endOffset);
  }
}, 
  insertNode: function(node) {
  _$jscoverage['/editor/range.js'].functionData[35]++;
  _$jscoverage['/editor/range.js'].lineData[1082]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1083]++;
  self.optimizeBookmark();
  _$jscoverage['/editor/range.js'].lineData[1084]++;
  self.trim(FALSE, TRUE);
  _$jscoverage['/editor/range.js'].lineData[1085]++;
  var startContainer = self.startContainer, startOffset = self.startOffset, nextNode = visit537_1087_1(startContainer[0].childNodes[startOffset] || null);
  _$jscoverage['/editor/range.js'].lineData[1089]++;
  startContainer[0].insertBefore(node[0], nextNode);
  _$jscoverage['/editor/range.js'].lineData[1091]++;
  if (visit538_1091_1(startContainer[0] == self.endContainer[0])) {
    _$jscoverage['/editor/range.js'].lineData[1092]++;
    self.endOffset++;
  }
  _$jscoverage['/editor/range.js'].lineData[1095]++;
  self.setStartBefore(node);
}, 
  moveToBookmark: function(bookmark) {
  _$jscoverage['/editor/range.js'].functionData[36]++;
  _$jscoverage['/editor/range.js'].lineData[1103]++;
  var self = this, doc = $(self.document);
  _$jscoverage['/editor/range.js'].lineData[1105]++;
  if (visit539_1105_1(bookmark.is2)) {
    _$jscoverage['/editor/range.js'].lineData[1107]++;
    var startContainer = doc._4e_getByAddress(bookmark.start, bookmark.normalized), startOffset = bookmark.startOffset, endContainer = visit540_1109_1(bookmark.end && doc._4e_getByAddress(bookmark.end, bookmark.normalized)), endOffset = bookmark.endOffset;
    _$jscoverage['/editor/range.js'].lineData[1113]++;
    self.setStart(startContainer, startOffset);
    _$jscoverage['/editor/range.js'].lineData[1116]++;
    if (visit541_1116_1(endContainer)) {
      _$jscoverage['/editor/range.js'].lineData[1117]++;
      self.setEnd(endContainer, endOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1119]++;
      self.collapse(TRUE);
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[1123]++;
    var serializable = bookmark.serializable, startNode = serializable ? S.one("#" + bookmark.startNode, doc) : bookmark.startNode, endNode = serializable ? S.one("#" + bookmark.endNode, doc) : bookmark.endNode;
    _$jscoverage['/editor/range.js'].lineData[1130]++;
    self.setStartBefore(startNode);
    _$jscoverage['/editor/range.js'].lineData[1133]++;
    startNode._4e_remove();
    _$jscoverage['/editor/range.js'].lineData[1137]++;
    if (visit542_1137_1(endNode && endNode[0])) {
      _$jscoverage['/editor/range.js'].lineData[1138]++;
      self.setEndBefore(endNode);
      _$jscoverage['/editor/range.js'].lineData[1139]++;
      endNode._4e_remove();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1141]++;
      self.collapse(TRUE);
    }
  }
}, 
  getCommonAncestor: function(includeSelf, ignoreTextNode) {
  _$jscoverage['/editor/range.js'].functionData[37]++;
  _$jscoverage['/editor/range.js'].lineData[1152]++;
  var self = this, start = self.startContainer, end = self.endContainer, ancestor;
  _$jscoverage['/editor/range.js'].lineData[1157]++;
  if (visit543_1157_1(start[0] == end[0])) {
    _$jscoverage['/editor/range.js'].lineData[1158]++;
    if (visit544_1158_1(includeSelf && visit545_1159_1(visit546_1159_2(start[0].nodeType == Dom.NodeType.ELEMENT_NODE) && visit547_1160_1(self.startOffset == self.endOffset - 1)))) {
      _$jscoverage['/editor/range.js'].lineData[1161]++;
      ancestor = new Node(start[0].childNodes[self.startOffset]);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1163]++;
      ancestor = start;
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[1166]++;
    ancestor = start._4e_commonAncestor(end);
  }
  _$jscoverage['/editor/range.js'].lineData[1169]++;
  return visit548_1169_1(ignoreTextNode && visit549_1169_2(ancestor[0].nodeType == Dom.NodeType.TEXT_NODE)) ? ancestor.parent() : ancestor;
}, 
  enlarge: (function() {
  _$jscoverage['/editor/range.js'].functionData[38]++;
  _$jscoverage['/editor/range.js'].lineData[1183]++;
  function enlargeElement(self, left, stop, commonAncestor) {
    _$jscoverage['/editor/range.js'].functionData[39]++;
    _$jscoverage['/editor/range.js'].lineData[1184]++;
    var container = self[left ? 'startContainer' : 'endContainer'], enlarge, sibling, index = left ? 0 : 1, commonReached = 0, direction = left ? "previousSibling" : "nextSibling", offset = self[left ? 'startOffset' : 'endOffset'];
    _$jscoverage['/editor/range.js'].lineData[1192]++;
    if (visit550_1192_1(container[0].nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[1193]++;
      if (visit551_1193_1(left)) {
        _$jscoverage['/editor/range.js'].lineData[1195]++;
        if (visit552_1195_1(offset)) {
          _$jscoverage['/editor/range.js'].lineData[1196]++;
          return;
        }
      } else {
        _$jscoverage['/editor/range.js'].lineData[1199]++;
        if (visit553_1199_1(offset < container[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[1200]++;
          return;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[1205]++;
      sibling = container[0][direction];
      _$jscoverage['/editor/range.js'].lineData[1207]++;
      enlarge = container[0].parentNode;
    } else {
      _$jscoverage['/editor/range.js'].lineData[1210]++;
      sibling = visit554_1210_1(container[0].childNodes[offset + (left ? -1 : 1)] || null);
      _$jscoverage['/editor/range.js'].lineData[1212]++;
      enlarge = container[0];
    }
    _$jscoverage['/editor/range.js'].lineData[1215]++;
    while (enlarge) {
      _$jscoverage['/editor/range.js'].lineData[1217]++;
      while (sibling) {
        _$jscoverage['/editor/range.js'].lineData[1218]++;
        if (visit555_1218_1(isWhitespace(sibling) || isBookmark(sibling))) {
          _$jscoverage['/editor/range.js'].lineData[1219]++;
          sibling = sibling[direction];
        } else {
          _$jscoverage['/editor/range.js'].lineData[1221]++;
          break;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[1226]++;
      if (visit556_1226_1(sibling)) {
        _$jscoverage['/editor/range.js'].lineData[1228]++;
        if (visit557_1228_1(!commonReached)) {
          _$jscoverage['/editor/range.js'].lineData[1230]++;
          self[left ? 'setStartAfter' : 'setEndBefore']($(sibling));
        }
        _$jscoverage['/editor/range.js'].lineData[1232]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1239]++;
      enlarge = $(enlarge);
      _$jscoverage['/editor/range.js'].lineData[1241]++;
      if (visit558_1241_1(enlarge.nodeName() == "body")) {
        _$jscoverage['/editor/range.js'].lineData[1242]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1245]++;
      if (visit559_1245_1(commonReached || enlarge.equals(commonAncestor))) {
        _$jscoverage['/editor/range.js'].lineData[1246]++;
        stop[index] = enlarge;
        _$jscoverage['/editor/range.js'].lineData[1247]++;
        commonReached = 1;
      } else {
        _$jscoverage['/editor/range.js'].lineData[1250]++;
        self[left ? 'setStartBefore' : 'setEndAfter'](enlarge);
      }
      _$jscoverage['/editor/range.js'].lineData[1253]++;
      sibling = enlarge[0][direction];
      _$jscoverage['/editor/range.js'].lineData[1254]++;
      enlarge = enlarge[0].parentNode;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1259]++;
  return function(unit) {
  _$jscoverage['/editor/range.js'].functionData[40]++;
  _$jscoverage['/editor/range.js'].lineData[1260]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1261]++;
  switch (unit) {
    case KER.ENLARGE_ELEMENT:
      _$jscoverage['/editor/range.js'].lineData[1264]++;
      if (visit560_1264_1(self.collapsed)) {
        _$jscoverage['/editor/range.js'].lineData[1265]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1268]++;
      var commonAncestor = self.getCommonAncestor(), stop = [];
      _$jscoverage['/editor/range.js'].lineData[1271]++;
      enlargeElement(self, 1, stop, commonAncestor);
      _$jscoverage['/editor/range.js'].lineData[1272]++;
      enlargeElement(self, 0, stop, commonAncestor);
      _$jscoverage['/editor/range.js'].lineData[1274]++;
      if (visit561_1274_1(stop[0] && stop[1])) {
        _$jscoverage['/editor/range.js'].lineData[1275]++;
        var commonStop = stop[0].contains(stop[1]) ? stop[1] : stop[0];
        _$jscoverage['/editor/range.js'].lineData[1276]++;
        self.setStartBefore(commonStop);
        _$jscoverage['/editor/range.js'].lineData[1277]++;
        self.setEndAfter(commonStop);
      }
      _$jscoverage['/editor/range.js'].lineData[1280]++;
      break;
    case KER.ENLARGE_BLOCK_CONTENTS:
    case KER.ENLARGE_LIST_ITEM_CONTENTS:
      _$jscoverage['/editor/range.js'].lineData[1286]++;
      var walkerRange = new KERange(self.document);
      _$jscoverage['/editor/range.js'].lineData[1287]++;
      var body = new Node(self.document.body);
      _$jscoverage['/editor/range.js'].lineData[1289]++;
      walkerRange.setStartAt(body, KER.POSITION_AFTER_START);
      _$jscoverage['/editor/range.js'].lineData[1290]++;
      walkerRange.setEnd(self.startContainer, self.startOffset);
      _$jscoverage['/editor/range.js'].lineData[1292]++;
      var walker = new Walker(walkerRange), blockBoundary, tailBr, defaultGuard = Walker.blockBoundary((visit562_1296_1(unit == KER.ENLARGE_LIST_ITEM_CONTENTS)) ? {
  br: 1} : NULL), boundaryGuard = function(node) {
  _$jscoverage['/editor/range.js'].functionData[41]++;
  _$jscoverage['/editor/range.js'].lineData[1300]++;
  var retVal = defaultGuard(node);
  _$jscoverage['/editor/range.js'].lineData[1301]++;
  if (visit563_1301_1(!retVal)) {
    _$jscoverage['/editor/range.js'].lineData[1302]++;
    blockBoundary = $(node);
  }
  _$jscoverage['/editor/range.js'].lineData[1304]++;
  return retVal;
}, tailBrGuard = function(node) {
  _$jscoverage['/editor/range.js'].functionData[42]++;
  _$jscoverage['/editor/range.js'].lineData[1308]++;
  var retVal = boundaryGuard(node);
  _$jscoverage['/editor/range.js'].lineData[1309]++;
  if (visit564_1309_1(!retVal && visit565_1309_2(Dom.nodeName(node) == 'br'))) {
    _$jscoverage['/editor/range.js'].lineData[1310]++;
    tailBr = $(node);
  }
  _$jscoverage['/editor/range.js'].lineData[1312]++;
  return retVal;
};
      _$jscoverage['/editor/range.js'].lineData[1315]++;
      walker.guard = boundaryGuard;
      _$jscoverage['/editor/range.js'].lineData[1317]++;
      enlargeable = walker.lastBackward();
      _$jscoverage['/editor/range.js'].lineData[1320]++;
      blockBoundary = visit566_1320_1(blockBoundary || body);
      _$jscoverage['/editor/range.js'].lineData[1324]++;
      self.setStartAt(blockBoundary, visit567_1326_1(visit568_1326_2(blockBoundary.nodeName() != 'br') && (visit569_1334_1(visit570_1334_2(!enlargeable && self.checkStartOfBlock()) || visit571_1335_1(enlargeable && blockBoundary.contains(enlargeable))))) ? KER.POSITION_AFTER_START : KER.POSITION_AFTER_END);
      _$jscoverage['/editor/range.js'].lineData[1340]++;
      walkerRange = self.clone();
      _$jscoverage['/editor/range.js'].lineData[1341]++;
      walkerRange.collapse();
      _$jscoverage['/editor/range.js'].lineData[1342]++;
      walkerRange.setEndAt(body, KER.POSITION_BEFORE_END);
      _$jscoverage['/editor/range.js'].lineData[1343]++;
      walker = new Walker(walkerRange);
      _$jscoverage['/editor/range.js'].lineData[1346]++;
      walker.guard = (visit572_1346_1(unit == KER.ENLARGE_LIST_ITEM_CONTENTS)) ? tailBrGuard : boundaryGuard;
      _$jscoverage['/editor/range.js'].lineData[1348]++;
      blockBoundary = NULL;
      _$jscoverage['/editor/range.js'].lineData[1351]++;
      var enlargeable = walker.lastForward();
      _$jscoverage['/editor/range.js'].lineData[1354]++;
      blockBoundary = visit573_1354_1(blockBoundary || body);
      _$jscoverage['/editor/range.js'].lineData[1358]++;
      self.setEndAt(blockBoundary, (visit574_1360_1(visit575_1360_2(!enlargeable && self.checkEndOfBlock()) || visit576_1361_1(enlargeable && blockBoundary.contains(enlargeable)))) ? KER.POSITION_BEFORE_END : KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/range.js'].lineData[1366]++;
      if (visit577_1366_1(tailBr)) {
        _$jscoverage['/editor/range.js'].lineData[1367]++;
        self.setEndAfter(tailBr);
      }
  }
};
})(), 
  checkStartOfBlock: function() {
  _$jscoverage['/editor/range.js'].functionData[43]++;
  _$jscoverage['/editor/range.js'].lineData[1378]++;
  var self = this, startContainer = self.startContainer, startOffset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[1384]++;
  if (visit578_1384_1(startOffset && visit579_1384_2(startContainer[0].nodeType == Dom.NodeType.TEXT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[1385]++;
    var textBefore = S.trim(startContainer[0].nodeValue.substring(0, startOffset));
    _$jscoverage['/editor/range.js'].lineData[1386]++;
    if (visit580_1386_1(textBefore.length)) {
      _$jscoverage['/editor/range.js'].lineData[1387]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1394]++;
  self.trim();
  _$jscoverage['/editor/range.js'].lineData[1398]++;
  var path = new ElementPath(self.startContainer);
  _$jscoverage['/editor/range.js'].lineData[1401]++;
  var walkerRange = self.clone();
  _$jscoverage['/editor/range.js'].lineData[1402]++;
  walkerRange.collapse(TRUE);
  _$jscoverage['/editor/range.js'].lineData[1403]++;
  walkerRange.setStartAt(visit581_1403_1(path.block || path.blockLimit), KER.POSITION_AFTER_START);
  _$jscoverage['/editor/range.js'].lineData[1405]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1406]++;
  walker.evaluator = getCheckStartEndBlockEvalFunction(TRUE);
  _$jscoverage['/editor/range.js'].lineData[1408]++;
  return walker.checkBackward();
}, 
  checkEndOfBlock: function() {
  _$jscoverage['/editor/range.js'].functionData[44]++;
  _$jscoverage['/editor/range.js'].lineData[1416]++;
  var self = this, endContainer = self.endContainer, endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[1421]++;
  if (visit582_1421_1(endContainer[0].nodeType == Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1422]++;
    var textAfter = S.trim(endContainer[0].nodeValue.substring(endOffset));
    _$jscoverage['/editor/range.js'].lineData[1423]++;
    if (visit583_1423_1(textAfter.length)) {
      _$jscoverage['/editor/range.js'].lineData[1424]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1431]++;
  self.trim();
  _$jscoverage['/editor/range.js'].lineData[1435]++;
  var path = new ElementPath(self.endContainer);
  _$jscoverage['/editor/range.js'].lineData[1438]++;
  var walkerRange = self.clone();
  _$jscoverage['/editor/range.js'].lineData[1439]++;
  walkerRange.collapse(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1440]++;
  walkerRange.setEndAt(visit584_1440_1(path.block || path.blockLimit), KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1442]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1443]++;
  walker.evaluator = getCheckStartEndBlockEvalFunction(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1445]++;
  return walker.checkForward();
}, 
  checkBoundaryOfElement: function(element, checkType) {
  _$jscoverage['/editor/range.js'].functionData[45]++;
  _$jscoverage['/editor/range.js'].lineData[1454]++;
  var walkerRange = this.clone();
  _$jscoverage['/editor/range.js'].lineData[1458]++;
  walkerRange[visit585_1456_1(checkType == KER.START) ? 'setStartAt' : 'setEndAt'](element, visit586_1458_1(checkType == KER.START) ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1462]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1464]++;
  walker.evaluator = elementBoundaryEval;
  _$jscoverage['/editor/range.js'].lineData[1465]++;
  return walker[visit587_1465_1(checkType == KER.START) ? 'checkBackward' : 'checkForward']();
}, 
  getBoundaryNodes: function() {
  _$jscoverage['/editor/range.js'].functionData[46]++;
  _$jscoverage['/editor/range.js'].lineData[1474]++;
  var self = this, startNode = self.startContainer, endNode = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, childCount;
  _$jscoverage['/editor/range.js'].lineData[1481]++;
  if (visit588_1481_1(startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1482]++;
    childCount = startNode[0].childNodes.length;
    _$jscoverage['/editor/range.js'].lineData[1483]++;
    if (visit589_1483_1(childCount > startOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1484]++;
      startNode = $(startNode[0].childNodes[startOffset]);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1485]++;
      if (visit590_1485_1(childCount == 0)) {
        _$jscoverage['/editor/range.js'].lineData[1487]++;
        startNode = startNode._4e_previousSourceNode();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1491]++;
        startNode = startNode[0];
        _$jscoverage['/editor/range.js'].lineData[1492]++;
        while (startNode.lastChild) {
          _$jscoverage['/editor/range.js'].lineData[1493]++;
          startNode = startNode.lastChild;
        }
        _$jscoverage['/editor/range.js'].lineData[1496]++;
        startNode = $(startNode);
        _$jscoverage['/editor/range.js'].lineData[1501]++;
        startNode = visit591_1501_1(startNode._4e_nextSourceNode() || startNode);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1505]++;
  if (visit592_1505_1(endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1506]++;
    childCount = endNode[0].childNodes.length;
    _$jscoverage['/editor/range.js'].lineData[1507]++;
    if (visit593_1507_1(childCount > endOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1508]++;
      endNode = $(endNode[0].childNodes[endOffset])._4e_previousSourceNode(TRUE);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1511]++;
      if (visit594_1511_1(childCount == 0)) {
        _$jscoverage['/editor/range.js'].lineData[1512]++;
        endNode = endNode._4e_previousSourceNode();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1516]++;
        endNode = endNode[0];
        _$jscoverage['/editor/range.js'].lineData[1517]++;
        while (endNode.lastChild) {
          _$jscoverage['/editor/range.js'].lineData[1518]++;
          endNode = endNode.lastChild;
        }
        _$jscoverage['/editor/range.js'].lineData[1519]++;
        endNode = $(endNode);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1525]++;
  if (visit595_1525_1(startNode._4e_position(endNode) & KEP.POSITION_FOLLOWING)) {
    _$jscoverage['/editor/range.js'].lineData[1526]++;
    startNode = endNode;
  }
  _$jscoverage['/editor/range.js'].lineData[1529]++;
  return {
  startNode: startNode, 
  endNode: endNode};
}, 
  fixBlock: function(isStart, blockTag) {
  _$jscoverage['/editor/range.js'].functionData[47]++;
  _$jscoverage['/editor/range.js'].lineData[1540]++;
  var self = this, bookmark = self.createBookmark(), fixedBlock = $(self.document.createElement(blockTag));
  _$jscoverage['/editor/range.js'].lineData[1543]++;
  self.collapse(isStart);
  _$jscoverage['/editor/range.js'].lineData[1544]++;
  self.enlarge(KER.ENLARGE_BLOCK_CONTENTS);
  _$jscoverage['/editor/range.js'].lineData[1545]++;
  fixedBlock[0].appendChild(self.extractContents());
  _$jscoverage['/editor/range.js'].lineData[1546]++;
  fixedBlock._4e_trim();
  _$jscoverage['/editor/range.js'].lineData[1547]++;
  if (visit596_1547_1(!UA['ie'])) {
    _$jscoverage['/editor/range.js'].lineData[1548]++;
    fixedBlock._4e_appendBogus();
  }
  _$jscoverage['/editor/range.js'].lineData[1550]++;
  self.insertNode(fixedBlock);
  _$jscoverage['/editor/range.js'].lineData[1551]++;
  self.moveToBookmark(bookmark);
  _$jscoverage['/editor/range.js'].lineData[1552]++;
  return fixedBlock;
}, 
  splitBlock: function(blockTag) {
  _$jscoverage['/editor/range.js'].functionData[48]++;
  _$jscoverage['/editor/range.js'].lineData[1561]++;
  var self = this, startPath = new ElementPath(self.startContainer), endPath = new ElementPath(self.endContainer), startBlockLimit = startPath.blockLimit, endBlockLimit = endPath.blockLimit, startBlock = startPath.block, endBlock = endPath.block, elementPath = NULL;
  _$jscoverage['/editor/range.js'].lineData[1571]++;
  if (visit597_1571_1(!startBlockLimit.equals(endBlockLimit))) {
    _$jscoverage['/editor/range.js'].lineData[1572]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[1576]++;
  if (visit598_1576_1(blockTag != 'br')) {
    _$jscoverage['/editor/range.js'].lineData[1577]++;
    if (visit599_1577_1(!startBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1578]++;
      startBlock = self.fixBlock(TRUE, blockTag);
      _$jscoverage['/editor/range.js'].lineData[1579]++;
      endBlock = new ElementPath(self.endContainer).block;
    }
    _$jscoverage['/editor/range.js'].lineData[1582]++;
    if (visit600_1582_1(!endBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1583]++;
      endBlock = self.fixBlock(FALSE, blockTag);
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1588]++;
  var isStartOfBlock = visit601_1588_1(startBlock && self.checkStartOfBlock()), isEndOfBlock = visit602_1589_1(endBlock && self.checkEndOfBlock());
  _$jscoverage['/editor/range.js'].lineData[1592]++;
  self.deleteContents();
  _$jscoverage['/editor/range.js'].lineData[1594]++;
  if (visit603_1594_1(startBlock && visit604_1594_2(startBlock[0] == endBlock[0]))) {
    _$jscoverage['/editor/range.js'].lineData[1595]++;
    if (visit605_1595_1(isEndOfBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1596]++;
      elementPath = new ElementPath(self.startContainer);
      _$jscoverage['/editor/range.js'].lineData[1597]++;
      self.moveToPosition(endBlock, KER.POSITION_AFTER_END);
      _$jscoverage['/editor/range.js'].lineData[1598]++;
      endBlock = NULL;
    } else {
      _$jscoverage['/editor/range.js'].lineData[1600]++;
      if (visit606_1600_1(isStartOfBlock)) {
        _$jscoverage['/editor/range.js'].lineData[1601]++;
        elementPath = new ElementPath(self.startContainer);
        _$jscoverage['/editor/range.js'].lineData[1602]++;
        self.moveToPosition(startBlock, KER.POSITION_BEFORE_START);
        _$jscoverage['/editor/range.js'].lineData[1603]++;
        startBlock = NULL;
      } else {
        _$jscoverage['/editor/range.js'].lineData[1606]++;
        endBlock = self.splitElement(startBlock);
        _$jscoverage['/editor/range.js'].lineData[1610]++;
        if (visit607_1610_1(!UA['ie'] && !S.inArray(startBlock.nodeName(), ['ul', 'ol']))) {
          _$jscoverage['/editor/range.js'].lineData[1611]++;
          startBlock._4e_appendBogus();
        }
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1616]++;
  return {
  previousBlock: startBlock, 
  nextBlock: endBlock, 
  wasStartOfBlock: isStartOfBlock, 
  wasEndOfBlock: isEndOfBlock, 
  elementPath: elementPath};
}, 
  splitElement: function(toSplit) {
  _$jscoverage['/editor/range.js'].functionData[49]++;
  _$jscoverage['/editor/range.js'].lineData[1631]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1632]++;
  if (visit608_1632_1(!self.collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[1633]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[1637]++;
  self.setEndAt(toSplit, KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1638]++;
  var documentFragment = self.extractContents(), clone = toSplit.clone(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1643]++;
  clone[0].appendChild(documentFragment);
  _$jscoverage['/editor/range.js'].lineData[1645]++;
  clone.insertAfter(toSplit);
  _$jscoverage['/editor/range.js'].lineData[1646]++;
  self.moveToPosition(toSplit, KER.POSITION_AFTER_END);
  _$jscoverage['/editor/range.js'].lineData[1647]++;
  return clone;
}, 
  moveToElementEditablePosition: function(el, isMoveToEnd) {
  _$jscoverage['/editor/range.js'].functionData[50]++;
  _$jscoverage['/editor/range.js'].lineData[1659]++;
  function nextDFS(node, childOnly) {
    _$jscoverage['/editor/range.js'].functionData[51]++;
    _$jscoverage['/editor/range.js'].lineData[1660]++;
    var next;
    _$jscoverage['/editor/range.js'].lineData[1662]++;
    if (visit609_1662_1(visit610_1662_2(node[0].nodeType == Dom.NodeType.ELEMENT_NODE) && node._4e_isEditable())) {
      _$jscoverage['/editor/range.js'].lineData[1664]++;
      next = node[isMoveToEnd ? 'last' : 'first'](nonWhitespaceOrIsBookmark, 1);
    }
    _$jscoverage['/editor/range.js'].lineData[1667]++;
    if (visit611_1667_1(!childOnly && !next)) {
      _$jscoverage['/editor/range.js'].lineData[1668]++;
      next = node[isMoveToEnd ? 'prev' : 'next'](nonWhitespaceOrIsBookmark, 1);
    }
    _$jscoverage['/editor/range.js'].lineData[1671]++;
    return next;
  }
  _$jscoverage['/editor/range.js'].lineData[1674]++;
  var found = 0, self = this;
  _$jscoverage['/editor/range.js'].lineData[1676]++;
  while (el) {
    _$jscoverage['/editor/range.js'].lineData[1678]++;
    if (visit612_1678_1(el[0].nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[1679]++;
      self.moveToPosition(el, isMoveToEnd ? KER.POSITION_AFTER_END : KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/range.js'].lineData[1682]++;
      found = 1;
      _$jscoverage['/editor/range.js'].lineData[1683]++;
      break;
    }
    _$jscoverage['/editor/range.js'].lineData[1687]++;
    if (visit613_1687_1(visit614_1687_2(el[0].nodeType == Dom.NodeType.ELEMENT_NODE) && el._4e_isEditable())) {
      _$jscoverage['/editor/range.js'].lineData[1688]++;
      self.moveToPosition(el, isMoveToEnd ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_START);
      _$jscoverage['/editor/range.js'].lineData[1691]++;
      found = 1;
    }
    _$jscoverage['/editor/range.js'].lineData[1694]++;
    el = nextDFS(el, found);
  }
  _$jscoverage['/editor/range.js'].lineData[1697]++;
  return !!found;
}, 
  selectNodeContents: function(node) {
  _$jscoverage['/editor/range.js'].functionData[52]++;
  _$jscoverage['/editor/range.js'].lineData[1705]++;
  var self = this, domNode = node[0];
  _$jscoverage['/editor/range.js'].lineData[1706]++;
  self.setStart(node, 0);
  _$jscoverage['/editor/range.js'].lineData[1707]++;
  self.setEnd(node, visit615_1707_1(domNode.nodeType == Dom.NodeType.TEXT_NODE) ? domNode.nodeValue.length : domNode.childNodes.length);
}, 
  insertNodeByDtd: function(element) {
  _$jscoverage['/editor/range.js'].functionData[53]++;
  _$jscoverage['/editor/range.js'].lineData[1717]++;
  var current, self = this, tmpDtd, last, elementName = element['nodeName'](), isBlock = dtd['$block'][elementName];
  _$jscoverage['/editor/range.js'].lineData[1723]++;
  self.deleteContents();
  _$jscoverage['/editor/range.js'].lineData[1724]++;
  if (visit616_1724_1(isBlock)) {
    _$jscoverage['/editor/range.js'].lineData[1725]++;
    current = self.getCommonAncestor(FALSE, TRUE);
    _$jscoverage['/editor/range.js'].lineData[1726]++;
    while (visit617_1726_1((tmpDtd = dtd[current.nodeName()]) && !(visit618_1726_2(tmpDtd && tmpDtd[elementName])))) {
      _$jscoverage['/editor/range.js'].lineData[1727]++;
      var parent = current.parent();
      _$jscoverage['/editor/range.js'].lineData[1730]++;
      if (visit619_1730_1(self.checkStartOfBlock() && self.checkEndOfBlock())) {
        _$jscoverage['/editor/range.js'].lineData[1731]++;
        self.setStartBefore(current);
        _$jscoverage['/editor/range.js'].lineData[1732]++;
        self.collapse(TRUE);
        _$jscoverage['/editor/range.js'].lineData[1733]++;
        current.remove();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1735]++;
        last = current;
      }
      _$jscoverage['/editor/range.js'].lineData[1737]++;
      current = parent;
    }
    _$jscoverage['/editor/range.js'].lineData[1740]++;
    if (visit620_1740_1(last)) {
      _$jscoverage['/editor/range.js'].lineData[1741]++;
      self.splitElement(last);
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1745]++;
  self.insertNode(element);
}});
  _$jscoverage['/editor/range.js'].lineData[1749]++;
  Utils.injectDom({
  _4e_breakParent: function(el, parent) {
  _$jscoverage['/editor/range.js'].functionData[54]++;
  _$jscoverage['/editor/range.js'].lineData[1751]++;
  parent = $(parent);
  _$jscoverage['/editor/range.js'].lineData[1752]++;
  el = $(el);
  _$jscoverage['/editor/range.js'].lineData[1754]++;
  var KERange = Editor.Range, docFrag, range = new KERange(el[0].ownerDocument);
  _$jscoverage['/editor/range.js'].lineData[1760]++;
  range.setStartAfter(el);
  _$jscoverage['/editor/range.js'].lineData[1761]++;
  range.setEndAfter(parent);
  _$jscoverage['/editor/range.js'].lineData[1764]++;
  docFrag = range.extractContents();
  _$jscoverage['/editor/range.js'].lineData[1767]++;
  range.insertNode(el.remove());
  _$jscoverage['/editor/range.js'].lineData[1770]++;
  el.after(docFrag);
}});
  _$jscoverage['/editor/range.js'].lineData[1774]++;
  Editor.Range = KERange;
  _$jscoverage['/editor/range.js'].lineData[1776]++;
  return KERange;
}, {
  requires: ['./base', './utils', './walker', './elementPath', './dom', 'node']});
