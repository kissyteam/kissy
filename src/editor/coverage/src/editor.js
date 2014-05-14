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
  _$jscoverage['/editor.js'].lineData[8] = 0;
  _$jscoverage['/editor.js'].lineData[9] = 0;
  _$jscoverage['/editor.js'].lineData[10] = 0;
  _$jscoverage['/editor.js'].lineData[11] = 0;
  _$jscoverage['/editor.js'].lineData[12] = 0;
  _$jscoverage['/editor.js'].lineData[13] = 0;
  _$jscoverage['/editor.js'].lineData[14] = 0;
  _$jscoverage['/editor.js'].lineData[15] = 0;
  _$jscoverage['/editor.js'].lineData[16] = 0;
  _$jscoverage['/editor.js'].lineData[17] = 0;
  _$jscoverage['/editor.js'].lineData[18] = 0;
  _$jscoverage['/editor.js'].lineData[19] = 0;
  _$jscoverage['/editor.js'].lineData[20] = 0;
  _$jscoverage['/editor.js'].lineData[21] = 0;
  _$jscoverage['/editor.js'].lineData[22] = 0;
  _$jscoverage['/editor.js'].lineData[45] = 0;
  _$jscoverage['/editor.js'].lineData[50] = 0;
  _$jscoverage['/editor.js'].lineData[52] = 0;
  _$jscoverage['/editor.js'].lineData[54] = 0;
  _$jscoverage['/editor.js'].lineData[55] = 0;
  _$jscoverage['/editor.js'].lineData[56] = 0;
  _$jscoverage['/editor.js'].lineData[58] = 0;
  _$jscoverage['/editor.js'].lineData[63] = 0;
  _$jscoverage['/editor.js'].lineData[64] = 0;
  _$jscoverage['/editor.js'].lineData[65] = 0;
  _$jscoverage['/editor.js'].lineData[66] = 0;
  _$jscoverage['/editor.js'].lineData[67] = 0;
  _$jscoverage['/editor.js'].lineData[71] = 0;
  _$jscoverage['/editor.js'].lineData[76] = 0;
  _$jscoverage['/editor.js'].lineData[79] = 0;
  _$jscoverage['/editor.js'].lineData[82] = 0;
  _$jscoverage['/editor.js'].lineData[83] = 0;
  _$jscoverage['/editor.js'].lineData[85] = 0;
  _$jscoverage['/editor.js'].lineData[86] = 0;
  _$jscoverage['/editor.js'].lineData[90] = 0;
  _$jscoverage['/editor.js'].lineData[91] = 0;
  _$jscoverage['/editor.js'].lineData[92] = 0;
  _$jscoverage['/editor.js'].lineData[97] = 0;
  _$jscoverage['/editor.js'].lineData[99] = 0;
  _$jscoverage['/editor.js'].lineData[100] = 0;
  _$jscoverage['/editor.js'].lineData[103] = 0;
  _$jscoverage['/editor.js'].lineData[104] = 0;
  _$jscoverage['/editor.js'].lineData[111] = 0;
  _$jscoverage['/editor.js'].lineData[115] = 0;
  _$jscoverage['/editor.js'].lineData[117] = 0;
  _$jscoverage['/editor.js'].lineData[119] = 0;
  _$jscoverage['/editor.js'].lineData[120] = 0;
  _$jscoverage['/editor.js'].lineData[124] = 0;
  _$jscoverage['/editor.js'].lineData[127] = 0;
  _$jscoverage['/editor.js'].lineData[128] = 0;
  _$jscoverage['/editor.js'].lineData[129] = 0;
  _$jscoverage['/editor.js'].lineData[130] = 0;
  _$jscoverage['/editor.js'].lineData[133] = 0;
  _$jscoverage['/editor.js'].lineData[134] = 0;
  _$jscoverage['/editor.js'].lineData[135] = 0;
  _$jscoverage['/editor.js'].lineData[137] = 0;
  _$jscoverage['/editor.js'].lineData[138] = 0;
  _$jscoverage['/editor.js'].lineData[144] = 0;
  _$jscoverage['/editor.js'].lineData[146] = 0;
  _$jscoverage['/editor.js'].lineData[147] = 0;
  _$jscoverage['/editor.js'].lineData[152] = 0;
  _$jscoverage['/editor.js'].lineData[157] = 0;
  _$jscoverage['/editor.js'].lineData[160] = 0;
  _$jscoverage['/editor.js'].lineData[163] = 0;
  _$jscoverage['/editor.js'].lineData[164] = 0;
  _$jscoverage['/editor.js'].lineData[168] = 0;
  _$jscoverage['/editor.js'].lineData[170] = 0;
  _$jscoverage['/editor.js'].lineData[172] = 0;
  _$jscoverage['/editor.js'].lineData[174] = 0;
  _$jscoverage['/editor.js'].lineData[176] = 0;
  _$jscoverage['/editor.js'].lineData[179] = 0;
  _$jscoverage['/editor.js'].lineData[180] = 0;
  _$jscoverage['/editor.js'].lineData[181] = 0;
  _$jscoverage['/editor.js'].lineData[185] = 0;
  _$jscoverage['/editor.js'].lineData[186] = 0;
  _$jscoverage['/editor.js'].lineData[193] = 0;
  _$jscoverage['/editor.js'].lineData[194] = 0;
  _$jscoverage['/editor.js'].lineData[202] = 0;
  _$jscoverage['/editor.js'].lineData[210] = 0;
  _$jscoverage['/editor.js'].lineData[219] = 0;
  _$jscoverage['/editor.js'].lineData[229] = 0;
  _$jscoverage['/editor.js'].lineData[230] = 0;
  _$jscoverage['/editor.js'].lineData[232] = 0;
  _$jscoverage['/editor.js'].lineData[233] = 0;
  _$jscoverage['/editor.js'].lineData[247] = 0;
  _$jscoverage['/editor.js'].lineData[256] = 0;
  _$jscoverage['/editor.js'].lineData[266] = 0;
  _$jscoverage['/editor.js'].lineData[269] = 0;
  _$jscoverage['/editor.js'].lineData[270] = 0;
  _$jscoverage['/editor.js'].lineData[271] = 0;
  _$jscoverage['/editor.js'].lineData[272] = 0;
  _$jscoverage['/editor.js'].lineData[274] = 0;
  _$jscoverage['/editor.js'].lineData[275] = 0;
  _$jscoverage['/editor.js'].lineData[285] = 0;
  _$jscoverage['/editor.js'].lineData[289] = 0;
  _$jscoverage['/editor.js'].lineData[292] = 0;
  _$jscoverage['/editor.js'].lineData[294] = 0;
  _$jscoverage['/editor.js'].lineData[295] = 0;
  _$jscoverage['/editor.js'].lineData[297] = 0;
  _$jscoverage['/editor.js'].lineData[298] = 0;
  _$jscoverage['/editor.js'].lineData[301] = 0;
  _$jscoverage['/editor.js'].lineData[302] = 0;
  _$jscoverage['/editor.js'].lineData[313] = 0;
  _$jscoverage['/editor.js'].lineData[316] = 0;
  _$jscoverage['/editor.js'].lineData[317] = 0;
  _$jscoverage['/editor.js'].lineData[319] = 0;
  _$jscoverage['/editor.js'].lineData[320] = 0;
  _$jscoverage['/editor.js'].lineData[322] = 0;
  _$jscoverage['/editor.js'].lineData[325] = 0;
  _$jscoverage['/editor.js'].lineData[326] = 0;
  _$jscoverage['/editor.js'].lineData[328] = 0;
  _$jscoverage['/editor.js'].lineData[330] = 0;
  _$jscoverage['/editor.js'].lineData[334] = 0;
  _$jscoverage['/editor.js'].lineData[335] = 0;
  _$jscoverage['/editor.js'].lineData[337] = 0;
  _$jscoverage['/editor.js'].lineData[347] = 0;
  _$jscoverage['/editor.js'].lineData[355] = 0;
  _$jscoverage['/editor.js'].lineData[356] = 0;
  _$jscoverage['/editor.js'].lineData[365] = 0;
  _$jscoverage['/editor.js'].lineData[374] = 0;
  _$jscoverage['/editor.js'].lineData[378] = 0;
  _$jscoverage['/editor.js'].lineData[379] = 0;
  _$jscoverage['/editor.js'].lineData[380] = 0;
  _$jscoverage['/editor.js'].lineData[381] = 0;
  _$jscoverage['/editor.js'].lineData[382] = 0;
  _$jscoverage['/editor.js'].lineData[384] = 0;
  _$jscoverage['/editor.js'].lineData[392] = 0;
  _$jscoverage['/editor.js'].lineData[395] = 0;
  _$jscoverage['/editor.js'].lineData[396] = 0;
  _$jscoverage['/editor.js'].lineData[398] = 0;
  _$jscoverage['/editor.js'].lineData[399] = 0;
  _$jscoverage['/editor.js'].lineData[401] = 0;
  _$jscoverage['/editor.js'].lineData[404] = 0;
  _$jscoverage['/editor.js'].lineData[405] = 0;
  _$jscoverage['/editor.js'].lineData[410] = 0;
  _$jscoverage['/editor.js'].lineData[411] = 0;
  _$jscoverage['/editor.js'].lineData[414] = 0;
  _$jscoverage['/editor.js'].lineData[415] = 0;
  _$jscoverage['/editor.js'].lineData[419] = 0;
  _$jscoverage['/editor.js'].lineData[427] = 0;
  _$jscoverage['/editor.js'].lineData[429] = 0;
  _$jscoverage['/editor.js'].lineData[430] = 0;
  _$jscoverage['/editor.js'].lineData[440] = 0;
  _$jscoverage['/editor.js'].lineData[443] = 0;
  _$jscoverage['/editor.js'].lineData[444] = 0;
  _$jscoverage['/editor.js'].lineData[445] = 0;
  _$jscoverage['/editor.js'].lineData[446] = 0;
  _$jscoverage['/editor.js'].lineData[456] = 0;
  _$jscoverage['/editor.js'].lineData[465] = 0;
  _$jscoverage['/editor.js'].lineData[468] = 0;
  _$jscoverage['/editor.js'].lineData[469] = 0;
  _$jscoverage['/editor.js'].lineData[470] = 0;
  _$jscoverage['/editor.js'].lineData[471] = 0;
  _$jscoverage['/editor.js'].lineData[472] = 0;
  _$jscoverage['/editor.js'].lineData[473] = 0;
  _$jscoverage['/editor.js'].lineData[482] = 0;
  _$jscoverage['/editor.js'].lineData[485] = 0;
  _$jscoverage['/editor.js'].lineData[486] = 0;
  _$jscoverage['/editor.js'].lineData[487] = 0;
  _$jscoverage['/editor.js'].lineData[490] = 0;
  _$jscoverage['/editor.js'].lineData[492] = 0;
  _$jscoverage['/editor.js'].lineData[493] = 0;
  _$jscoverage['/editor.js'].lineData[504] = 0;
  _$jscoverage['/editor.js'].lineData[505] = 0;
  _$jscoverage['/editor.js'].lineData[506] = 0;
  _$jscoverage['/editor.js'].lineData[507] = 0;
  _$jscoverage['/editor.js'].lineData[517] = 0;
  _$jscoverage['/editor.js'].lineData[526] = 0;
  _$jscoverage['/editor.js'].lineData[527] = 0;
  _$jscoverage['/editor.js'].lineData[528] = 0;
  _$jscoverage['/editor.js'].lineData[531] = 0;
  _$jscoverage['/editor.js'].lineData[532] = 0;
  _$jscoverage['/editor.js'].lineData[533] = 0;
  _$jscoverage['/editor.js'].lineData[534] = 0;
  _$jscoverage['/editor.js'].lineData[536] = 0;
  _$jscoverage['/editor.js'].lineData[537] = 0;
  _$jscoverage['/editor.js'].lineData[538] = 0;
  _$jscoverage['/editor.js'].lineData[554] = 0;
  _$jscoverage['/editor.js'].lineData[555] = 0;
  _$jscoverage['/editor.js'].lineData[556] = 0;
  _$jscoverage['/editor.js'].lineData[565] = 0;
  _$jscoverage['/editor.js'].lineData[567] = 0;
  _$jscoverage['/editor.js'].lineData[568] = 0;
  _$jscoverage['/editor.js'].lineData[571] = 0;
  _$jscoverage['/editor.js'].lineData[573] = 0;
  _$jscoverage['/editor.js'].lineData[587] = 0;
  _$jscoverage['/editor.js'].lineData[588] = 0;
  _$jscoverage['/editor.js'].lineData[591] = 0;
  _$jscoverage['/editor.js'].lineData[593] = 0;
  _$jscoverage['/editor.js'].lineData[594] = 0;
  _$jscoverage['/editor.js'].lineData[597] = 0;
  _$jscoverage['/editor.js'].lineData[598] = 0;
  _$jscoverage['/editor.js'].lineData[601] = 0;
  _$jscoverage['/editor.js'].lineData[602] = 0;
  _$jscoverage['/editor.js'].lineData[606] = 0;
  _$jscoverage['/editor.js'].lineData[607] = 0;
  _$jscoverage['/editor.js'].lineData[610] = 0;
  _$jscoverage['/editor.js'].lineData[613] = 0;
  _$jscoverage['/editor.js'].lineData[614] = 0;
  _$jscoverage['/editor.js'].lineData[615] = 0;
  _$jscoverage['/editor.js'].lineData[616] = 0;
  _$jscoverage['/editor.js'].lineData[619] = 0;
  _$jscoverage['/editor.js'].lineData[622] = 0;
  _$jscoverage['/editor.js'].lineData[625] = 0;
  _$jscoverage['/editor.js'].lineData[626] = 0;
  _$jscoverage['/editor.js'].lineData[629] = 0;
  _$jscoverage['/editor.js'].lineData[630] = 0;
  _$jscoverage['/editor.js'].lineData[636] = 0;
  _$jscoverage['/editor.js'].lineData[637] = 0;
  _$jscoverage['/editor.js'].lineData[647] = 0;
  _$jscoverage['/editor.js'].lineData[651] = 0;
  _$jscoverage['/editor.js'].lineData[652] = 0;
  _$jscoverage['/editor.js'].lineData[655] = 0;
  _$jscoverage['/editor.js'].lineData[656] = 0;
  _$jscoverage['/editor.js'].lineData[659] = 0;
  _$jscoverage['/editor.js'].lineData[660] = 0;
  _$jscoverage['/editor.js'].lineData[664] = 0;
  _$jscoverage['/editor.js'].lineData[665] = 0;
  _$jscoverage['/editor.js'].lineData[666] = 0;
  _$jscoverage['/editor.js'].lineData[667] = 0;
  _$jscoverage['/editor.js'].lineData[669] = 0;
  _$jscoverage['/editor.js'].lineData[670] = 0;
  _$jscoverage['/editor.js'].lineData[672] = 0;
  _$jscoverage['/editor.js'].lineData[679] = 0;
  _$jscoverage['/editor.js'].lineData[682] = 0;
  _$jscoverage['/editor.js'].lineData[687] = 0;
  _$jscoverage['/editor.js'].lineData[688] = 0;
  _$jscoverage['/editor.js'].lineData[689] = 0;
  _$jscoverage['/editor.js'].lineData[690] = 0;
  _$jscoverage['/editor.js'].lineData[691] = 0;
  _$jscoverage['/editor.js'].lineData[693] = 0;
  _$jscoverage['/editor.js'].lineData[696] = 0;
  _$jscoverage['/editor.js'].lineData[697] = 0;
  _$jscoverage['/editor.js'].lineData[698] = 0;
  _$jscoverage['/editor.js'].lineData[699] = 0;
  _$jscoverage['/editor.js'].lineData[700] = 0;
  _$jscoverage['/editor.js'].lineData[701] = 0;
  _$jscoverage['/editor.js'].lineData[706] = 0;
  _$jscoverage['/editor.js'].lineData[707] = 0;
  _$jscoverage['/editor.js'].lineData[709] = 0;
  _$jscoverage['/editor.js'].lineData[721] = 0;
  _$jscoverage['/editor.js'].lineData[722] = 0;
  _$jscoverage['/editor.js'].lineData[723] = 0;
  _$jscoverage['/editor.js'].lineData[724] = 0;
  _$jscoverage['/editor.js'].lineData[725] = 0;
  _$jscoverage['/editor.js'].lineData[726] = 0;
  _$jscoverage['/editor.js'].lineData[727] = 0;
  _$jscoverage['/editor.js'].lineData[728] = 0;
  _$jscoverage['/editor.js'].lineData[729] = 0;
  _$jscoverage['/editor.js'].lineData[731] = 0;
  _$jscoverage['/editor.js'].lineData[732] = 0;
  _$jscoverage['/editor.js'].lineData[734] = 0;
  _$jscoverage['/editor.js'].lineData[735] = 0;
  _$jscoverage['/editor.js'].lineData[737] = 0;
  _$jscoverage['/editor.js'].lineData[738] = 0;
  _$jscoverage['/editor.js'].lineData[739] = 0;
  _$jscoverage['/editor.js'].lineData[740] = 0;
  _$jscoverage['/editor.js'].lineData[741] = 0;
  _$jscoverage['/editor.js'].lineData[748] = 0;
  _$jscoverage['/editor.js'].lineData[749] = 0;
  _$jscoverage['/editor.js'].lineData[755] = 0;
  _$jscoverage['/editor.js'].lineData[757] = 0;
  _$jscoverage['/editor.js'].lineData[759] = 0;
  _$jscoverage['/editor.js'].lineData[761] = 0;
  _$jscoverage['/editor.js'].lineData[783] = 0;
  _$jscoverage['/editor.js'].lineData[785] = 0;
  _$jscoverage['/editor.js'].lineData[788] = 0;
  _$jscoverage['/editor.js'].lineData[789] = 0;
  _$jscoverage['/editor.js'].lineData[790] = 0;
  _$jscoverage['/editor.js'].lineData[794] = 0;
  _$jscoverage['/editor.js'].lineData[796] = 0;
  _$jscoverage['/editor.js'].lineData[797] = 0;
  _$jscoverage['/editor.js'].lineData[799] = 0;
  _$jscoverage['/editor.js'].lineData[800] = 0;
  _$jscoverage['/editor.js'].lineData[803] = 0;
  _$jscoverage['/editor.js'].lineData[811] = 0;
  _$jscoverage['/editor.js'].lineData[822] = 0;
  _$jscoverage['/editor.js'].lineData[823] = 0;
  _$jscoverage['/editor.js'].lineData[830] = 0;
  _$jscoverage['/editor.js'].lineData[831] = 0;
  _$jscoverage['/editor.js'].lineData[832] = 0;
  _$jscoverage['/editor.js'].lineData[833] = 0;
  _$jscoverage['/editor.js'].lineData[840] = 0;
  _$jscoverage['/editor.js'].lineData[846] = 0;
  _$jscoverage['/editor.js'].lineData[855] = 0;
  _$jscoverage['/editor.js'].lineData[856] = 0;
  _$jscoverage['/editor.js'].lineData[857] = 0;
  _$jscoverage['/editor.js'].lineData[858] = 0;
  _$jscoverage['/editor.js'].lineData[859] = 0;
  _$jscoverage['/editor.js'].lineData[866] = 0;
  _$jscoverage['/editor.js'].lineData[867] = 0;
  _$jscoverage['/editor.js'].lineData[868] = 0;
  _$jscoverage['/editor.js'].lineData[872] = 0;
  _$jscoverage['/editor.js'].lineData[874] = 0;
  _$jscoverage['/editor.js'].lineData[876] = 0;
  _$jscoverage['/editor.js'].lineData[877] = 0;
  _$jscoverage['/editor.js'].lineData[878] = 0;
  _$jscoverage['/editor.js'].lineData[884] = 0;
  _$jscoverage['/editor.js'].lineData[885] = 0;
  _$jscoverage['/editor.js'].lineData[886] = 0;
  _$jscoverage['/editor.js'].lineData[889] = 0;
  _$jscoverage['/editor.js'].lineData[899] = 0;
  _$jscoverage['/editor.js'].lineData[900] = 0;
  _$jscoverage['/editor.js'].lineData[901] = 0;
  _$jscoverage['/editor.js'].lineData[903] = 0;
  _$jscoverage['/editor.js'].lineData[905] = 0;
  _$jscoverage['/editor.js'].lineData[906] = 0;
  _$jscoverage['/editor.js'].lineData[907] = 0;
  _$jscoverage['/editor.js'].lineData[909] = 0;
  _$jscoverage['/editor.js'].lineData[910] = 0;
  _$jscoverage['/editor.js'].lineData[916] = 0;
  _$jscoverage['/editor.js'].lineData[917] = 0;
  _$jscoverage['/editor.js'].lineData[918] = 0;
  _$jscoverage['/editor.js'].lineData[920] = 0;
  _$jscoverage['/editor.js'].lineData[921] = 0;
  _$jscoverage['/editor.js'].lineData[927] = 0;
  _$jscoverage['/editor.js'].lineData[928] = 0;
  _$jscoverage['/editor.js'].lineData[937] = 0;
  _$jscoverage['/editor.js'].lineData[938] = 0;
  _$jscoverage['/editor.js'].lineData[939] = 0;
  _$jscoverage['/editor.js'].lineData[940] = 0;
  _$jscoverage['/editor.js'].lineData[941] = 0;
  _$jscoverage['/editor.js'].lineData[945] = 0;
  _$jscoverage['/editor.js'].lineData[946] = 0;
  _$jscoverage['/editor.js'].lineData[947] = 0;
  _$jscoverage['/editor.js'].lineData[948] = 0;
  _$jscoverage['/editor.js'].lineData[954] = 0;
  _$jscoverage['/editor.js'].lineData[955] = 0;
  _$jscoverage['/editor.js'].lineData[956] = 0;
  _$jscoverage['/editor.js'].lineData[963] = 0;
  _$jscoverage['/editor.js'].lineData[964] = 0;
  _$jscoverage['/editor.js'].lineData[966] = 0;
  _$jscoverage['/editor.js'].lineData[967] = 0;
  _$jscoverage['/editor.js'].lineData[968] = 0;
  _$jscoverage['/editor.js'].lineData[971] = 0;
  _$jscoverage['/editor.js'].lineData[972] = 0;
  _$jscoverage['/editor.js'].lineData[973] = 0;
  _$jscoverage['/editor.js'].lineData[977] = 0;
  _$jscoverage['/editor.js'].lineData[983] = 0;
  _$jscoverage['/editor.js'].lineData[984] = 0;
  _$jscoverage['/editor.js'].lineData[986] = 0;
  _$jscoverage['/editor.js'].lineData[987] = 0;
  _$jscoverage['/editor.js'].lineData[990] = 0;
  _$jscoverage['/editor.js'].lineData[993] = 0;
  _$jscoverage['/editor.js'].lineData[997] = 0;
  _$jscoverage['/editor.js'].lineData[998] = 0;
  _$jscoverage['/editor.js'].lineData[999] = 0;
  _$jscoverage['/editor.js'].lineData[1004] = 0;
  _$jscoverage['/editor.js'].lineData[1010] = 0;
  _$jscoverage['/editor.js'].lineData[1011] = 0;
  _$jscoverage['/editor.js'].lineData[1013] = 0;
  _$jscoverage['/editor.js'].lineData[1014] = 0;
  _$jscoverage['/editor.js'].lineData[1016] = 0;
  _$jscoverage['/editor.js'].lineData[1018] = 0;
  _$jscoverage['/editor.js'].lineData[1021] = 0;
  _$jscoverage['/editor.js'].lineData[1023] = 0;
  _$jscoverage['/editor.js'].lineData[1024] = 0;
  _$jscoverage['/editor.js'].lineData[1025] = 0;
  _$jscoverage['/editor.js'].lineData[1026] = 0;
  _$jscoverage['/editor.js'].lineData[1034] = 0;
  _$jscoverage['/editor.js'].lineData[1035] = 0;
  _$jscoverage['/editor.js'].lineData[1036] = 0;
  _$jscoverage['/editor.js'].lineData[1037] = 0;
  _$jscoverage['/editor.js'].lineData[1038] = 0;
  _$jscoverage['/editor.js'].lineData[1039] = 0;
  _$jscoverage['/editor.js'].lineData[1047] = 0;
  _$jscoverage['/editor.js'].lineData[1048] = 0;
  _$jscoverage['/editor.js'].lineData[1049] = 0;
  _$jscoverage['/editor.js'].lineData[1050] = 0;
  _$jscoverage['/editor.js'].lineData[1051] = 0;
  _$jscoverage['/editor.js'].lineData[1057] = 0;
  _$jscoverage['/editor.js'].lineData[1058] = 0;
  _$jscoverage['/editor.js'].lineData[1059] = 0;
  _$jscoverage['/editor.js'].lineData[1060] = 0;
  _$jscoverage['/editor.js'].lineData[1062] = 0;
  _$jscoverage['/editor.js'].lineData[1068] = 0;
  _$jscoverage['/editor.js'].lineData[1072] = 0;
  _$jscoverage['/editor.js'].lineData[1073] = 0;
  _$jscoverage['/editor.js'].lineData[1075] = 0;
  _$jscoverage['/editor.js'].lineData[1076] = 0;
  _$jscoverage['/editor.js'].lineData[1077] = 0;
  _$jscoverage['/editor.js'].lineData[1078] = 0;
  _$jscoverage['/editor.js'].lineData[1079] = 0;
  _$jscoverage['/editor.js'].lineData[1083] = 0;
  _$jscoverage['/editor.js'].lineData[1110] = 0;
  _$jscoverage['/editor.js'].lineData[1111] = 0;
  _$jscoverage['/editor.js'].lineData[1114] = 0;
  _$jscoverage['/editor.js'].lineData[1115] = 0;
  _$jscoverage['/editor.js'].lineData[1122] = 0;
  _$jscoverage['/editor.js'].lineData[1123] = 0;
  _$jscoverage['/editor.js'].lineData[1131] = 0;
  _$jscoverage['/editor.js'].lineData[1136] = 0;
  _$jscoverage['/editor.js'].lineData[1139] = 0;
  _$jscoverage['/editor.js'].lineData[1140] = 0;
  _$jscoverage['/editor.js'].lineData[1141] = 0;
  _$jscoverage['/editor.js'].lineData[1144] = 0;
  _$jscoverage['/editor.js'].lineData[1145] = 0;
  _$jscoverage['/editor.js'].lineData[1146] = 0;
  _$jscoverage['/editor.js'].lineData[1147] = 0;
  _$jscoverage['/editor.js'].lineData[1148] = 0;
  _$jscoverage['/editor.js'].lineData[1149] = 0;
  _$jscoverage['/editor.js'].lineData[1151] = 0;
  _$jscoverage['/editor.js'].lineData[1152] = 0;
  _$jscoverage['/editor.js'].lineData[1153] = 0;
  _$jscoverage['/editor.js'].lineData[1157] = 0;
  _$jscoverage['/editor.js'].lineData[1161] = 0;
  _$jscoverage['/editor.js'].lineData[1162] = 0;
  _$jscoverage['/editor.js'].lineData[1163] = 0;
  _$jscoverage['/editor.js'].lineData[1165] = 0;
  _$jscoverage['/editor.js'].lineData[1170] = 0;
  _$jscoverage['/editor.js'].lineData[1171] = 0;
  _$jscoverage['/editor.js'].lineData[1173] = 0;
  _$jscoverage['/editor.js'].lineData[1174] = 0;
  _$jscoverage['/editor.js'].lineData[1175] = 0;
  _$jscoverage['/editor.js'].lineData[1177] = 0;
  _$jscoverage['/editor.js'].lineData[1178] = 0;
  _$jscoverage['/editor.js'].lineData[1179] = 0;
  _$jscoverage['/editor.js'].lineData[1183] = 0;
  _$jscoverage['/editor.js'].lineData[1187] = 0;
  _$jscoverage['/editor.js'].lineData[1188] = 0;
  _$jscoverage['/editor.js'].lineData[1189] = 0;
  _$jscoverage['/editor.js'].lineData[1191] = 0;
  _$jscoverage['/editor.js'].lineData[1197] = 0;
  _$jscoverage['/editor.js'].lineData[1198] = 0;
  _$jscoverage['/editor.js'].lineData[1200] = 0;
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
}
if (! _$jscoverage['/editor.js'].branchData) {
  _$jscoverage['/editor.js'].branchData = {};
  _$jscoverage['/editor.js'].branchData['29'] = [];
  _$jscoverage['/editor.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['76'] = [];
  _$jscoverage['/editor.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['77'] = [];
  _$jscoverage['/editor.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['85'] = [];
  _$jscoverage['/editor.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['91'] = [];
  _$jscoverage['/editor.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['117'] = [];
  _$jscoverage['/editor.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['117'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['118'] = [];
  _$jscoverage['/editor.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['118'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['127'] = [];
  _$jscoverage['/editor.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['133'] = [];
  _$jscoverage['/editor.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['146'] = [];
  _$jscoverage['/editor.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['157'] = [];
  _$jscoverage['/editor.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['158'] = [];
  _$jscoverage['/editor.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['163'] = [];
  _$jscoverage['/editor.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['180'] = [];
  _$jscoverage['/editor.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['271'] = [];
  _$jscoverage['/editor.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['292'] = [];
  _$jscoverage['/editor.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['316'] = [];
  _$jscoverage['/editor.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['319'] = [];
  _$jscoverage['/editor.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['319'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['325'] = [];
  _$jscoverage['/editor.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['334'] = [];
  _$jscoverage['/editor.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['378'] = [];
  _$jscoverage['/editor.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['395'] = [];
  _$jscoverage['/editor.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['401'] = [];
  _$jscoverage['/editor.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['404'] = [];
  _$jscoverage['/editor.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['410'] = [];
  _$jscoverage['/editor.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['442'] = [];
  _$jscoverage['/editor.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['445'] = [];
  _$jscoverage['/editor.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['486'] = [];
  _$jscoverage['/editor.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['492'] = [];
  _$jscoverage['/editor.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['506'] = [];
  _$jscoverage['/editor.js'].branchData['506'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['527'] = [];
  _$jscoverage['/editor.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['533'] = [];
  _$jscoverage['/editor.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['536'] = [];
  _$jscoverage['/editor.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['567'] = [];
  _$jscoverage['/editor.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['579'] = [];
  _$jscoverage['/editor.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['587'] = [];
  _$jscoverage['/editor.js'].branchData['587'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['587'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['593'] = [];
  _$jscoverage['/editor.js'].branchData['593'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['597'] = [];
  _$jscoverage['/editor.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['597'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['601'] = [];
  _$jscoverage['/editor.js'].branchData['601'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['606'] = [];
  _$jscoverage['/editor.js'].branchData['606'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['613'] = [];
  _$jscoverage['/editor.js'].branchData['613'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['616'] = [];
  _$jscoverage['/editor.js'].branchData['616'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['616'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['616'][3] = new BranchData();
  _$jscoverage['/editor.js'].branchData['619'] = [];
  _$jscoverage['/editor.js'].branchData['619'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['620'] = [];
  _$jscoverage['/editor.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['629'] = [];
  _$jscoverage['/editor.js'].branchData['629'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['629'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['651'] = [];
  _$jscoverage['/editor.js'].branchData['651'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['665'] = [];
  _$jscoverage['/editor.js'].branchData['665'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['666'] = [];
  _$jscoverage['/editor.js'].branchData['666'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['696'] = [];
  _$jscoverage['/editor.js'].branchData['696'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['722'] = [];
  _$jscoverage['/editor.js'].branchData['722'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['724'] = [];
  _$jscoverage['/editor.js'].branchData['724'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['728'] = [];
  _$jscoverage['/editor.js'].branchData['728'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['729'] = [];
  _$jscoverage['/editor.js'].branchData['729'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['731'] = [];
  _$jscoverage['/editor.js'].branchData['731'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['732'] = [];
  _$jscoverage['/editor.js'].branchData['732'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['734'] = [];
  _$jscoverage['/editor.js'].branchData['734'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['737'] = [];
  _$jscoverage['/editor.js'].branchData['737'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['783'] = [];
  _$jscoverage['/editor.js'].branchData['783'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['796'] = [];
  _$jscoverage['/editor.js'].branchData['796'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['799'] = [];
  _$jscoverage['/editor.js'].branchData['799'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['820'] = [];
  _$jscoverage['/editor.js'].branchData['820'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['831'] = [];
  _$jscoverage['/editor.js'].branchData['831'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['832'] = [];
  _$jscoverage['/editor.js'].branchData['832'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['855'] = [];
  _$jscoverage['/editor.js'].branchData['855'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['857'] = [];
  _$jscoverage['/editor.js'].branchData['857'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['874'] = [];
  _$jscoverage['/editor.js'].branchData['874'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['886'] = [];
  _$jscoverage['/editor.js'].branchData['886'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['887'] = [];
  _$jscoverage['/editor.js'].branchData['887'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['887'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['909'] = [];
  _$jscoverage['/editor.js'].branchData['909'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['920'] = [];
  _$jscoverage['/editor.js'].branchData['920'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['937'] = [];
  _$jscoverage['/editor.js'].branchData['937'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['940'] = [];
  _$jscoverage['/editor.js'].branchData['940'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['947'] = [];
  _$jscoverage['/editor.js'].branchData['947'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['954'] = [];
  _$jscoverage['/editor.js'].branchData['954'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['954'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['967'] = [];
  _$jscoverage['/editor.js'].branchData['967'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['983'] = [];
  _$jscoverage['/editor.js'].branchData['983'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['986'] = [];
  _$jscoverage['/editor.js'].branchData['986'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['993'] = [];
  _$jscoverage['/editor.js'].branchData['993'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['998'] = [];
  _$jscoverage['/editor.js'].branchData['998'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1004'] = [];
  _$jscoverage['/editor.js'].branchData['1004'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1013'] = [];
  _$jscoverage['/editor.js'].branchData['1013'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1016'] = [];
  _$jscoverage['/editor.js'].branchData['1016'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1034'] = [];
  _$jscoverage['/editor.js'].branchData['1034'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1037'] = [];
  _$jscoverage['/editor.js'].branchData['1037'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1047'] = [];
  _$jscoverage['/editor.js'].branchData['1047'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1050'] = [];
  _$jscoverage['/editor.js'].branchData['1050'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1057'] = [];
  _$jscoverage['/editor.js'].branchData['1057'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1060'] = [];
  _$jscoverage['/editor.js'].branchData['1060'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1060'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1078'] = [];
  _$jscoverage['/editor.js'].branchData['1078'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1087'] = [];
  _$jscoverage['/editor.js'].branchData['1087'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1094'] = [];
  _$jscoverage['/editor.js'].branchData['1094'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1139'] = [];
  _$jscoverage['/editor.js'].branchData['1139'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1161'] = [];
  _$jscoverage['/editor.js'].branchData['1161'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1162'] = [];
  _$jscoverage['/editor.js'].branchData['1162'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1170'] = [];
  _$jscoverage['/editor.js'].branchData['1170'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1177'] = [];
  _$jscoverage['/editor.js'].branchData['1177'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1188'] = [];
  _$jscoverage['/editor.js'].branchData['1188'][1] = new BranchData();
}
_$jscoverage['/editor.js'].branchData['1188'][1].init(13, 19, '!self.get(\'iframe\')');
function visit1258_1188_1(result) {
  _$jscoverage['/editor.js'].branchData['1188'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1177'][1].init(877, 28, 'UA.gecko && !iframe.__loaded');
function visit1257_1177_1(result) {
  _$jscoverage['/editor.js'].branchData['1177'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1170'][1].init(555, 28, 'textarea.hasAttr(\'tabindex\')');
function visit1256_1170_1(result) {
  _$jscoverage['/editor.js'].branchData['1170'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1162'][1].init(261, 9, 'iframeSrc');
function visit1255_1162_1(result) {
  _$jscoverage['/editor.js'].branchData['1162'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1161'][1].init(212, 35, '$(window).getEmptyIframeSrc() || \'\'');
function visit1254_1161_1(result) {
  _$jscoverage['/editor.js'].branchData['1161'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1139'][1].init(371, 9, 'IS_IE < 7');
function visit1253_1139_1(result) {
  _$jscoverage['/editor.js'].branchData['1139'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1094'][1].init(518, 10, 'data || \'\'');
function visit1252_1094_1(result) {
  _$jscoverage['/editor.js'].branchData['1094'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1087'][1].init(232, 17, 'S.UA.ieMode === 8');
function visit1251_1087_1(result) {
  _$jscoverage['/editor.js'].branchData['1087'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1078'][1].init(216, 21, 'i < customLink.length');
function visit1250_1078_1(result) {
  _$jscoverage['/editor.js'].branchData['1078'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1060'][2].init(72, 28, 'control.nodeName() === \'img\'');
function visit1249_1060_2(result) {
  _$jscoverage['/editor.js'].branchData['1060'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1060'][1].init(72, 64, 'control.nodeName() === \'img\' && /ke_/.test(control[0].className)');
function visit1248_1060_1(result) {
  _$jscoverage['/editor.js'].branchData['1060'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1057'][1].init(4793, 8, 'UA.gecko');
function visit1247_1057_1(result) {
  _$jscoverage['/editor.js'].branchData['1057'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1050'][1].init(72, 75, 'S.inArray(control.nodeName(), [\'img\', \'hr\', \'input\', \'textarea\', \'select\'])');
function visit1246_1050_1(result) {
  _$jscoverage['/editor.js'].branchData['1050'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1047'][1].init(4459, 9, 'UA.webkit');
function visit1245_1047_1(result) {
  _$jscoverage['/editor.js'].branchData['1047'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1037'][1].init(25, 29, 'evt.keyCode in pageUpDownKeys');
function visit1244_1037_1(result) {
  _$jscoverage['/editor.js'].branchData['1037'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1034'][1].init(1337, 31, 'doc.compatMode === \'CSS1Compat\'');
function visit1243_1034_1(result) {
  _$jscoverage['/editor.js'].branchData['1034'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1016'][1].init(136, 7, 'control');
function visit1242_1016_1(result) {
  _$jscoverage['/editor.js'].branchData['1016'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1013'][1].init(104, 26, 'keyCode in {\n  8: 1, \n  46: 1}');
function visit1241_1013_1(result) {
  _$jscoverage['/editor.js'].branchData['1013'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1004'][1].init(2605, 5, 'IS_IE');
function visit1240_1004_1(result) {
  _$jscoverage['/editor.js'].branchData['1004'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['998'][1].init(21, 19, '!self.__iframeFocus');
function visit1239_998_1(result) {
  _$jscoverage['/editor.js'].branchData['998'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['993'][1].init(2323, 8, 'UA.gecko');
function visit1238_993_1(result) {
  _$jscoverage['/editor.js'].branchData['993'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['986'][1].init(237, 8, 'UA.opera');
function visit1237_986_1(result) {
  _$jscoverage['/editor.js'].branchData['986'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['983'][1].init(148, 8, 'UA.gecko');
function visit1236_983_1(result) {
  _$jscoverage['/editor.js'].branchData['983'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['967'][1].init(22, 31, '(UA.gecko) && self.__iframeFocus');
function visit1235_967_1(result) {
  _$jscoverage['/editor.js'].branchData['967'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['954'][2].init(1045, 17, 'UA.ie || UA.opera');
function visit1234_954_2(result) {
  _$jscoverage['/editor.js'].branchData['954'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['954'][1].init(1033, 29, 'UA.gecko || UA.ie || UA.opera');
function visit1233_954_1(result) {
  _$jscoverage['/editor.js'].branchData['954'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['947'][1].init(72, 52, 'S.inArray(control.nodeName(), [\'input\', \'textarea\'])');
function visit1232_947_1(result) {
  _$jscoverage['/editor.js'].branchData['947'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['940'][1].init(72, 50, 'S.inArray(control.nodeName(), [\'input\', \'select\'])');
function visit1231_940_1(result) {
  _$jscoverage['/editor.js'].branchData['940'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['937'][1].init(387, 9, 'UA.webkit');
function visit1230_937_1(result) {
  _$jscoverage['/editor.js'].branchData['937'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['920'][1].init(221, 6, '!retry');
function visit1229_920_1(result) {
  _$jscoverage['/editor.js'].branchData['920'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['909'][1].init(146, 9, '!go.retry');
function visit1228_909_1(result) {
  _$jscoverage['/editor.js'].branchData['909'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['887'][2].init(53, 24, 't.nodeName() === \'table\'');
function visit1227_887_2(result) {
  _$jscoverage['/editor.js'].branchData['887'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['887'][1].init(53, 85, 't.nodeName() === \'table\' && disableInlineTableEditing');
function visit1226_887_1(result) {
  _$jscoverage['/editor.js'].branchData['887'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['886'][1].init(83, 140, 'disableObjectResizing || (t.nodeName() === \'table\' && disableInlineTableEditing)');
function visit1225_886_1(result) {
  _$jscoverage['/editor.js'].branchData['886'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['874'][1].init(318, 50, 'disableObjectResizing || disableInlineTableEditing');
function visit1224_874_1(result) {
  _$jscoverage['/editor.js'].branchData['874'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['857'][1].init(25, 3, 'doc');
function visit1223_857_1(result) {
  _$jscoverage['/editor.js'].branchData['857'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['855'][1].init(372, 5, 'IS_IE');
function visit1222_855_1(result) {
  _$jscoverage['/editor.js'].branchData['855'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['832'][1].init(25, 8, 'UA.gecko');
function visit1221_832_1(result) {
  _$jscoverage['/editor.js'].branchData['832'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['831'][1].init(319, 17, 't === htmlElement');
function visit1220_831_1(result) {
  _$jscoverage['/editor.js'].branchData['831'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['820'][1].init(364, 20, 'UA.gecko || UA.opera');
function visit1219_820_1(result) {
  _$jscoverage['/editor.js'].branchData['820'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['799'][1].init(215, 9, 'UA.webkit');
function visit1218_799_1(result) {
  _$jscoverage['/editor.js'].branchData['799'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['796'][1].init(98, 20, 'UA.gecko || UA.opera');
function visit1217_796_1(result) {
  _$jscoverage['/editor.js'].branchData['796'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['783'][1].init(1281, 5, 'IS_IE');
function visit1216_783_1(result) {
  _$jscoverage['/editor.js'].branchData['783'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['737'][1].init(507, 26, 'cfg.data || textarea.val()');
function visit1215_737_1(result) {
  _$jscoverage['/editor.js'].branchData['737'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['734'][1].init(431, 4, 'name');
function visit1214_734_1(result) {
  _$jscoverage['/editor.js'].branchData['734'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['732'][1].init(26, 20, 'cfg.height || height');
function visit1213_732_1(result) {
  _$jscoverage['/editor.js'].branchData['732'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['731'][1].init(352, 6, 'height');
function visit1212_731_1(result) {
  _$jscoverage['/editor.js'].branchData['731'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['729'][1].init(25, 18, 'cfg.width || width');
function visit1211_729_1(result) {
  _$jscoverage['/editor.js'].branchData['729'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['728'][1].init(277, 5, 'width');
function visit1210_728_1(result) {
  _$jscoverage['/editor.js'].branchData['728'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['724'][1].init(106, 23, 'cfg.textareaAttrs || {}');
function visit1209_724_1(result) {
  _$jscoverage['/editor.js'].branchData['724'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['722'][1].init(15, 9, 'cfg || {}');
function visit1208_722_1(result) {
  _$jscoverage['/editor.js'].branchData['722'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['696'][1].init(1080, 8, 'lastNode');
function visit1207_696_1(result) {
  _$jscoverage['/editor.js'].branchData['696'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['666'][1].init(21, 23, '$sel.type === \'Control\'');
function visit1206_666_1(result) {
  _$jscoverage['/editor.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['665'][1].init(569, 4, '$sel');
function visit1205_665_1(result) {
  _$jscoverage['/editor.js'].branchData['665'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['651'][1].init(135, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1204_651_1(result) {
  _$jscoverage['/editor.js'].branchData['651'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['629'][2].init(2346, 23, 'clone[0].nodeType === 1');
function visit1203_629_2(result) {
  _$jscoverage['/editor.js'].branchData['629'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['629'][1].init(2337, 32, 'clone && clone[0].nodeType === 1');
function visit1202_629_1(result) {
  _$jscoverage['/editor.js'].branchData['629'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['620'][1].init(31, 80, 'xhtmlDtd.$block[nextName] && xhtmlDtd[nextName][\'#text\']');
function visit1201_620_1(result) {
  _$jscoverage['/editor.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['619'][1].init(339, 112, 'nextName && xhtmlDtd.$block[nextName] && xhtmlDtd[nextName][\'#text\']');
function visit1200_619_1(result) {
  _$jscoverage['/editor.js'].branchData['619'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['616'][3].init(168, 42, 'next[0].nodeType === NodeType.ELEMENT_NODE');
function visit1199_616_3(result) {
  _$jscoverage['/editor.js'].branchData['616'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['616'][2].init(168, 81, 'next[0].nodeType === NodeType.ELEMENT_NODE && next.nodeName()');
function visit1198_616_2(result) {
  _$jscoverage['/editor.js'].branchData['616'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['616'][1].init(160, 89, 'next && next[0].nodeType === NodeType.ELEMENT_NODE && next.nodeName()');
function visit1197_616_1(result) {
  _$jscoverage['/editor.js'].branchData['616'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['613'][1].init(1570, 7, 'isBlock');
function visit1196_613_1(result) {
  _$jscoverage['/editor.js'].branchData['613'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['606'][1].init(1261, 12, '!lastElement');
function visit1195_606_1(result) {
  _$jscoverage['/editor.js'].branchData['606'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['601'][1].init(322, 12, '!lastElement');
function visit1194_601_1(result) {
  _$jscoverage['/editor.js'].branchData['601'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['597'][2].init(112, 13, '!i && element');
function visit1193_597_2(result) {
  _$jscoverage['/editor.js'].branchData['597'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['597'][1].init(112, 36, '!i && element || element.clone(TRUE)');
function visit1192_597_1(result) {
  _$jscoverage['/editor.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['593'][1].init(819, 6, 'i >= 0');
function visit1191_593_1(result) {
  _$jscoverage['/editor.js'].branchData['593'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['587'][2].init(668, 19, 'ranges.length === 0');
function visit1190_587_2(result) {
  _$jscoverage['/editor.js'].branchData['587'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['587'][1].init(657, 30, '!ranges || ranges.length === 0');
function visit1189_587_1(result) {
  _$jscoverage['/editor.js'].branchData['587'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['579'][1].init(277, 34, 'selection && selection.getRanges()');
function visit1188_579_1(result) {
  _$jscoverage['/editor.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['567'][1].init(47, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1187_567_1(result) {
  _$jscoverage['/editor.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['536'][1].init(169, 65, '!self.__previousPath || !self.__previousPath.compare(currentPath)');
function visit1186_536_1(result) {
  _$jscoverage['/editor.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['533'][1].init(74, 33, 'selection && !selection.isInvalid');
function visit1185_533_1(result) {
  _$jscoverage['/editor.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['527'][1].init(46, 29, 'self.__checkSelectionChangeId');
function visit1184_527_1(result) {
  _$jscoverage['/editor.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['506'][1].init(85, 15, 'self.__docReady');
function visit1183_506_1(result) {
  _$jscoverage['/editor.js'].branchData['506'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['492'][1].init(372, 10, 'ind !== -1');
function visit1182_492_1(result) {
  _$jscoverage['/editor.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['486'][1].init(21, 23, 'l.attr(\'href\') === link');
function visit1181_486_1(result) {
  _$jscoverage['/editor.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['445'][1].init(242, 3, 'win');
function visit1180_445_1(result) {
  _$jscoverage['/editor.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['442'][1].init(88, 29, 'self.get(\'customStyle\') || \'\'');
function visit1179_442_1(result) {
  _$jscoverage['/editor.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['410'][1].init(640, 3, 'win');
function visit1178_410_1(result) {
  _$jscoverage['/editor.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['404'][1].init(137, 17, 'win && win.parent');
function visit1177_404_1(result) {
  _$jscoverage['/editor.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['401'][1].init(297, 6, '!UA.ie');
function visit1176_401_1(result) {
  _$jscoverage['/editor.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['395'][1].init(128, 4, '!win');
function visit1175_395_1(result) {
  _$jscoverage['/editor.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['378'][1].init(159, 5, 'range');
function visit1174_378_1(result) {
  _$jscoverage['/editor.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['334'][1].init(774, 28, 'EMPTY_CONTENT_REG.test(html)');
function visit1173_334_1(result) {
  _$jscoverage['/editor.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['325'][1].init(499, 6, 'format');
function visit1172_325_1(result) {
  _$jscoverage['/editor.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['319'][2].init(221, 21, 'mode === WYSIWYG_MODE');
function visit1171_319_2(result) {
  _$jscoverage['/editor.js'].branchData['319'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['319'][1].init(221, 42, 'mode === WYSIWYG_MODE && self.isDocReady()');
function visit1170_319_1(result) {
  _$jscoverage['/editor.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['316'][1].init(128, 18, 'mode === undefined');
function visit1169_316_1(result) {
  _$jscoverage['/editor.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['292'][1].init(115, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1168_292_1(result) {
  _$jscoverage['/editor.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['271'][1].init(196, 3, 'cmd');
function visit1167_271_1(result) {
  _$jscoverage['/editor.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['180'][1].init(21, 15, 'control.destroy');
function visit1166_180_1(result) {
  _$jscoverage['/editor.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['163'][1].init(356, 3, 'doc');
function visit1165_163_1(result) {
  _$jscoverage['/editor.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['158'][1].init(42, 60, '(form = textarea[0].form) && (form = $(form))');
function visit1164_158_1(result) {
  _$jscoverage['/editor.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['157'][1].init(162, 103, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1163_157_1(result) {
  _$jscoverage['/editor.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['146'][1].init(76, 20, 'v && self.__docReady');
function visit1162_146_1(result) {
  _$jscoverage['/editor.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['133'][1].init(65, 6, 'iframe');
function visit1161_133_1(result) {
  _$jscoverage['/editor.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['127'][1].init(140, 18, 'v === WYSIWYG_MODE');
function visit1160_127_1(result) {
  _$jscoverage['/editor.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['118'][2].init(61, 40, 'statusBarEl && statusBarEl.outerHeight()');
function visit1159_118_2(result) {
  _$jscoverage['/editor.js'].branchData['118'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['118'][1].init(61, 45, 'statusBarEl && statusBarEl.outerHeight() || 0');
function visit1158_118_1(result) {
  _$jscoverage['/editor.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['117'][2].init(266, 36, 'toolBarEl && toolBarEl.outerHeight()');
function visit1157_117_2(result) {
  _$jscoverage['/editor.js'].branchData['117'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['117'][1].init(266, 41, 'toolBarEl && toolBarEl.outerHeight() || 0');
function visit1156_117_1(result) {
  _$jscoverage['/editor.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['91'][1].init(76, 3, 'sel');
function visit1155_91_1(result) {
  _$jscoverage['/editor.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['85'][1].init(101, 19, 'self.get(\'focused\')');
function visit1154_85_1(result) {
  _$jscoverage['/editor.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['77'][1].init(42, 60, '(form = textarea[0].form) && (form = $(form))');
function visit1153_77_1(result) {
  _$jscoverage['/editor.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['76'][1].init(169, 103, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1152_76_1(result) {
  _$jscoverage['/editor.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['29'][1].init(161, 14, 'UA.ieMode < 11');
function visit1151_29_1(result) {
  _$jscoverage['/editor.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].lineData[6]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/editor.js'].functionData[0]++;
  _$jscoverage['/editor.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/editor.js'].lineData[8]++;
  var iframeContentTpl = require('editor/iframe-content-tpl');
  _$jscoverage['/editor.js'].lineData[9]++;
  var Editor = require('editor/base');
  _$jscoverage['/editor.js'].lineData[10]++;
  var Utils = require('editor/utils');
  _$jscoverage['/editor.js'].lineData[11]++;
  var focusManager = require('editor/focusManager');
  _$jscoverage['/editor.js'].lineData[12]++;
  var clipboard = require('editor/clipboard');
  _$jscoverage['/editor.js'].lineData[13]++;
  var enterKey = require('editor/enterKey');
  _$jscoverage['/editor.js'].lineData[14]++;
  var htmlDataProcessor = require('editor/htmlDataProcessor');
  _$jscoverage['/editor.js'].lineData[15]++;
  var selectionFix = require('editor/selectionFix');
  _$jscoverage['/editor.js'].lineData[16]++;
  require('editor/plugin-meta');
  _$jscoverage['/editor.js'].lineData[17]++;
  require('editor/styles');
  _$jscoverage['/editor.js'].lineData[18]++;
  require('editor/domIterator');
  _$jscoverage['/editor.js'].lineData[19]++;
  require('editor/z-index-manager');
  _$jscoverage['/editor.js'].lineData[20]++;
  module.exports = Editor;
  _$jscoverage['/editor.js'].lineData[21]++;
  var logger = S.getLogger('s/editor');
  _$jscoverage['/editor.js'].lineData[22]++;
  var TRUE = true, FALSE = false, NULL = null, window = S.Env.host, document = window.document, UA = S.UA, IS_IE = visit1151_29_1(UA.ieMode < 11), NodeType = Node.NodeType, $ = Node.all, HEIGHT = 'height', tryThese = Utils.tryThese, IFRAME_TPL = '<iframe' + ' class="{prefixCls}editor-iframe"' + ' frameborder="0" ' + ' title="kissy-editor" ' + ' allowTransparency="true" ' + ' {iframeSrc} ' + '>' + '</iframe>', EMPTY_CONTENT_REG = /^(?:<(p)>)?(?:(?:&nbsp;)|\s|<br[^>]*>)*(?:<\/\1>)?$/i;
  _$jscoverage['/editor.js'].lineData[45]++;
  Editor.Mode = {
  SOURCE_MODE: 0, 
  WYSIWYG_MODE: 1};
  _$jscoverage['/editor.js'].lineData[50]++;
  var WYSIWYG_MODE = 1;
  _$jscoverage['/editor.js'].lineData[52]++;
  Editor.addMembers({
  initializer: function() {
  _$jscoverage['/editor.js'].functionData[1]++;
  _$jscoverage['/editor.js'].lineData[54]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[55]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[56]++;
  self.__controls = {};
  _$jscoverage['/editor.js'].lineData[58]++;
  focusManager.register(self);
}, 
  renderUI: function() {
  _$jscoverage['/editor.js'].functionData[2]++;
  _$jscoverage['/editor.js'].lineData[63]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[64]++;
  clipboard.init(self);
  _$jscoverage['/editor.js'].lineData[65]++;
  enterKey.init(self);
  _$jscoverage['/editor.js'].lineData[66]++;
  htmlDataProcessor.init(self);
  _$jscoverage['/editor.js'].lineData[67]++;
  selectionFix.init(self);
}, 
  bindUI: function() {
  _$jscoverage['/editor.js'].functionData[3]++;
  _$jscoverage['/editor.js'].lineData[71]++;
  var self = this, form, prefixCls = self.get('prefixCls'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[76]++;
  if (visit1152_76_1(self.get('attachForm') && visit1153_77_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[79]++;
    form.on('submit', self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[82]++;
  function docReady() {
    _$jscoverage['/editor.js'].functionData[4]++;
    _$jscoverage['/editor.js'].lineData[83]++;
    self.detach('docReady', docReady);
    _$jscoverage['/editor.js'].lineData[85]++;
    if (visit1154_85_1(self.get('focused'))) {
      _$jscoverage['/editor.js'].lineData[86]++;
      self.focus();
    } else {
      _$jscoverage['/editor.js'].lineData[90]++;
      var sel = self.getSelection();
      _$jscoverage['/editor.js'].lineData[91]++;
      if (visit1155_91_1(sel)) {
        _$jscoverage['/editor.js'].lineData[92]++;
        sel.removeAllRanges();
      }
    }
  }
  _$jscoverage['/editor.js'].lineData[97]++;
  self.on('docReady', docReady);
  _$jscoverage['/editor.js'].lineData[99]++;
  self.on('blur', function() {
  _$jscoverage['/editor.js'].functionData[5]++;
  _$jscoverage['/editor.js'].lineData[100]++;
  self.$el.removeClass(prefixCls + 'editor-focused');
});
  _$jscoverage['/editor.js'].lineData[103]++;
  self.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[6]++;
  _$jscoverage['/editor.js'].lineData[104]++;
  self.$el.addClass(prefixCls + 'editor-focused');
});
}, 
  _onSetHeight: function(v) {
  _$jscoverage['/editor.js'].functionData[7]++;
  _$jscoverage['/editor.js'].lineData[111]++;
  var self = this, textareaEl = self.get('textarea'), toolBarEl = self.get('toolBarEl'), statusBarEl = self.get('statusBarEl');
  _$jscoverage['/editor.js'].lineData[115]++;
  v = parseInt(v, 10);
  _$jscoverage['/editor.js'].lineData[117]++;
  v -= (visit1156_117_1(visit1157_117_2(toolBarEl && toolBarEl.outerHeight()) || 0)) + (visit1158_118_1(visit1159_118_2(statusBarEl && statusBarEl.outerHeight()) || 0));
  _$jscoverage['/editor.js'].lineData[119]++;
  textareaEl.parent().css(HEIGHT, v);
  _$jscoverage['/editor.js'].lineData[120]++;
  textareaEl.css(HEIGHT, v);
}, 
  _onSetMode: function(v) {
  _$jscoverage['/editor.js'].functionData[8]++;
  _$jscoverage['/editor.js'].lineData[124]++;
  var self = this, iframe = self.get('iframe'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[127]++;
  if (visit1160_127_1(v === WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[128]++;
    self.setData(textarea.val());
    _$jscoverage['/editor.js'].lineData[129]++;
    textarea.hide();
    _$jscoverage['/editor.js'].lineData[130]++;
    self.fire('wysiwygMode');
  } else {
    _$jscoverage['/editor.js'].lineData[133]++;
    if (visit1161_133_1(iframe)) {
      _$jscoverage['/editor.js'].lineData[134]++;
      textarea.val(self.getFormatData(WYSIWYG_MODE));
      _$jscoverage['/editor.js'].lineData[135]++;
      iframe.hide();
    }
    _$jscoverage['/editor.js'].lineData[137]++;
    textarea.show();
    _$jscoverage['/editor.js'].lineData[138]++;
    self.fire('sourceMode');
  }
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/editor.js'].functionData[9]++;
  _$jscoverage['/editor.js'].lineData[144]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[146]++;
  if (visit1162_146_1(v && self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[147]++;
    self.focus();
  }
}, 
  destructor: function() {
  _$jscoverage['/editor.js'].functionData[10]++;
  _$jscoverage['/editor.js'].lineData[152]++;
  var self = this, form, textarea = self.get('textarea'), doc = self.get('document');
  _$jscoverage['/editor.js'].lineData[157]++;
  if (visit1163_157_1(self.get('attachForm') && visit1164_158_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[160]++;
    form.detach('submit', self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[163]++;
  if (visit1165_163_1(doc)) {
    _$jscoverage['/editor.js'].lineData[164]++;
    var body = $(doc[0].body), documentElement = $(doc[0].documentElement), win = self.get('window');
    _$jscoverage['/editor.js'].lineData[168]++;
    focusManager.remove(self);
    _$jscoverage['/editor.js'].lineData[170]++;
    doc.detach();
    _$jscoverage['/editor.js'].lineData[172]++;
    documentElement.detach();
    _$jscoverage['/editor.js'].lineData[174]++;
    body.detach();
    _$jscoverage['/editor.js'].lineData[176]++;
    win.detach();
  }
  _$jscoverage['/editor.js'].lineData[179]++;
  S.each(self.__controls, function(control) {
  _$jscoverage['/editor.js'].functionData[11]++;
  _$jscoverage['/editor.js'].lineData[180]++;
  if (visit1166_180_1(control.destroy)) {
    _$jscoverage['/editor.js'].lineData[181]++;
    control.destroy();
  }
});
  _$jscoverage['/editor.js'].lineData[185]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[186]++;
  self.__controls = {};
}, 
  sync: function() {
  _$jscoverage['/editor.js'].functionData[12]++;
  _$jscoverage['/editor.js'].lineData[193]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[194]++;
  self.get('textarea').val(self.getData());
}, 
  getControl: function(id) {
  _$jscoverage['/editor.js'].functionData[13]++;
  _$jscoverage['/editor.js'].lineData[202]++;
  return this.__controls[id];
}, 
  getControls: function() {
  _$jscoverage['/editor.js'].functionData[14]++;
  _$jscoverage['/editor.js'].lineData[210]++;
  return this.__controls;
}, 
  addControl: function(id, control) {
  _$jscoverage['/editor.js'].functionData[15]++;
  _$jscoverage['/editor.js'].lineData[219]++;
  this.__controls[id] = control;
}, 
  showDialog: function(name, args) {
  _$jscoverage['/editor.js'].functionData[16]++;
  _$jscoverage['/editor.js'].lineData[229]++;
  name += '/dialog';
  _$jscoverage['/editor.js'].lineData[230]++;
  var self = this, d = self.__controls[name];
  _$jscoverage['/editor.js'].lineData[232]++;
  d.show(args);
  _$jscoverage['/editor.js'].lineData[233]++;
  self.fire('dialogShow', {
  dialog: d.dialog, 
  'pluginDialog': d, 
  'dialogName': name});
}, 
  addCommand: function(name, obj) {
  _$jscoverage['/editor.js'].functionData[17]++;
  _$jscoverage['/editor.js'].lineData[247]++;
  this.__commands[name] = obj;
}, 
  hasCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[18]++;
  _$jscoverage['/editor.js'].lineData[256]++;
  return this.__commands[name];
}, 
  execCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[19]++;
  _$jscoverage['/editor.js'].lineData[266]++;
  var self = this, cmd = self.__commands[name], args = S.makeArray(arguments);
  _$jscoverage['/editor.js'].lineData[269]++;
  args.shift();
  _$jscoverage['/editor.js'].lineData[270]++;
  args.unshift(self);
  _$jscoverage['/editor.js'].lineData[271]++;
  if (visit1167_271_1(cmd)) {
    _$jscoverage['/editor.js'].lineData[272]++;
    return cmd.exec.apply(cmd, args);
  } else {
    _$jscoverage['/editor.js'].lineData[274]++;
    logger.error(name + ': command not found');
    _$jscoverage['/editor.js'].lineData[275]++;
    return undefined;
  }
}, 
  queryCommandValue: function(name) {
  _$jscoverage['/editor.js'].functionData[20]++;
  _$jscoverage['/editor.js'].lineData[285]++;
  return this.execCommand(Utils.getQueryCmd(name));
}, 
  'setData': function(data) {
  _$jscoverage['/editor.js'].functionData[21]++;
  _$jscoverage['/editor.js'].lineData[289]++;
  var self = this, htmlDataProcessor, afterData = data;
  _$jscoverage['/editor.js'].lineData[292]++;
  if (visit1168_292_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[294]++;
    self.get('textarea').val(data);
    _$jscoverage['/editor.js'].lineData[295]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[297]++;
  if ((htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[298]++;
    afterData = htmlDataProcessor.toDataFormat(data);
  }
  _$jscoverage['/editor.js'].lineData[301]++;
  clearIframeDocContent(self);
  _$jscoverage['/editor.js'].lineData[302]++;
  createIframe(self, afterData);
}, 
  getData: function(format, mode) {
  _$jscoverage['/editor.js'].functionData[22]++;
  _$jscoverage['/editor.js'].lineData[313]++;
  var self = this, htmlDataProcessor = self.htmlDataProcessor, html;
  _$jscoverage['/editor.js'].lineData[316]++;
  if (visit1169_316_1(mode === undefined)) {
    _$jscoverage['/editor.js'].lineData[317]++;
    mode = self.get('mode');
  }
  _$jscoverage['/editor.js'].lineData[319]++;
  if (visit1170_319_1(visit1171_319_2(mode === WYSIWYG_MODE) && self.isDocReady())) {
    _$jscoverage['/editor.js'].lineData[320]++;
    html = self.get('document')[0].body.innerHTML;
  } else {
    _$jscoverage['/editor.js'].lineData[322]++;
    html = htmlDataProcessor.toDataFormat(self.get('textarea').val());
  }
  _$jscoverage['/editor.js'].lineData[325]++;
  if (visit1172_325_1(format)) {
    _$jscoverage['/editor.js'].lineData[326]++;
    html = htmlDataProcessor.toHtml(html);
  } else {
    _$jscoverage['/editor.js'].lineData[328]++;
    html = htmlDataProcessor.toServer(html);
  }
  _$jscoverage['/editor.js'].lineData[330]++;
  html = S.trim(html);
  _$jscoverage['/editor.js'].lineData[334]++;
  if (visit1173_334_1(EMPTY_CONTENT_REG.test(html))) {
    _$jscoverage['/editor.js'].lineData[335]++;
    html = '';
  }
  _$jscoverage['/editor.js'].lineData[337]++;
  return html;
}, 
  getFormatData: function(mode) {
  _$jscoverage['/editor.js'].functionData[23]++;
  _$jscoverage['/editor.js'].lineData[347]++;
  return this.getData(1, mode);
}, 
  getDocHtml: function() {
  _$jscoverage['/editor.js'].functionData[24]++;
  _$jscoverage['/editor.js'].lineData[355]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[356]++;
  return prepareIFrameHTML(0, self.get('customStyle'), self.get('customLink'), self.getFormatData());
}, 
  getSelection: function() {
  _$jscoverage['/editor.js'].functionData[25]++;
  _$jscoverage['/editor.js'].lineData[365]++;
  return Editor.Selection.getSelection(this.get('document')[0]);
}, 
  'getSelectedHtml': function() {
  _$jscoverage['/editor.js'].functionData[26]++;
  _$jscoverage['/editor.js'].lineData[374]++;
  var self = this, range = self.getSelection().getRanges()[0], contents, html = '';
  _$jscoverage['/editor.js'].lineData[378]++;
  if (visit1174_378_1(range)) {
    _$jscoverage['/editor.js'].lineData[379]++;
    contents = range.cloneContents();
    _$jscoverage['/editor.js'].lineData[380]++;
    html = self.get('document')[0].createElement('div');
    _$jscoverage['/editor.js'].lineData[381]++;
    html.appendChild(contents);
    _$jscoverage['/editor.js'].lineData[382]++;
    html = html.innerHTML;
  }
  _$jscoverage['/editor.js'].lineData[384]++;
  return html;
}, 
  focus: function() {
  _$jscoverage['/editor.js'].functionData[27]++;
  _$jscoverage['/editor.js'].lineData[392]++;
  var self = this, win = self.get('window');
  _$jscoverage['/editor.js'].lineData[395]++;
  if (visit1175_395_1(!win)) {
    _$jscoverage['/editor.js'].lineData[396]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[398]++;
  var doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[399]++;
  win = win[0];
  _$jscoverage['/editor.js'].lineData[401]++;
  if (visit1176_401_1(!UA.ie)) {
    _$jscoverage['/editor.js'].lineData[404]++;
    if (visit1177_404_1(win && win.parent)) {
      _$jscoverage['/editor.js'].lineData[405]++;
      win.parent.focus();
    }
  }
  _$jscoverage['/editor.js'].lineData[410]++;
  if (visit1178_410_1(win)) {
    _$jscoverage['/editor.js'].lineData[411]++;
    win.focus();
  }
  _$jscoverage['/editor.js'].lineData[414]++;
  try {
    _$jscoverage['/editor.js'].lineData[415]++;
    doc.body.focus();
  }  catch (e) {
}
  _$jscoverage['/editor.js'].lineData[419]++;
  self.notifySelectionChange();
}, 
  blur: function() {
  _$jscoverage['/editor.js'].functionData[28]++;
  _$jscoverage['/editor.js'].lineData[427]++;
  var self = this, win = self.get('window')[0];
  _$jscoverage['/editor.js'].lineData[429]++;
  win.blur();
  _$jscoverage['/editor.js'].lineData[430]++;
  self.get('document')[0].body.blur();
}, 
  addCustomStyle: function(cssText, id) {
  _$jscoverage['/editor.js'].functionData[29]++;
  _$jscoverage['/editor.js'].lineData[440]++;
  var self = this, win = self.get('window'), customStyle = visit1179_442_1(self.get('customStyle') || '');
  _$jscoverage['/editor.js'].lineData[443]++;
  customStyle += '\n' + cssText;
  _$jscoverage['/editor.js'].lineData[444]++;
  self.set('customStyle', customStyle);
  _$jscoverage['/editor.js'].lineData[445]++;
  if (visit1180_445_1(win)) {
    _$jscoverage['/editor.js'].lineData[446]++;
    win.addStyleSheet(cssText, id);
  }
}, 
  removeCustomStyle: function(id) {
  _$jscoverage['/editor.js'].functionData[30]++;
  _$jscoverage['/editor.js'].lineData[456]++;
  this.get('document').on('#' + id).remove();
}, 
  addCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[31]++;
  _$jscoverage['/editor.js'].lineData[465]++;
  var self = this, customLink = self.get('customLink'), doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[468]++;
  customLink.push(link);
  _$jscoverage['/editor.js'].lineData[469]++;
  self.set('customLink', customLink);
  _$jscoverage['/editor.js'].lineData[470]++;
  var elem = doc.createElement('link');
  _$jscoverage['/editor.js'].lineData[471]++;
  elem.rel = 'stylesheet';
  _$jscoverage['/editor.js'].lineData[472]++;
  doc.getElementsByTagName('head')[0].appendChild(elem);
  _$jscoverage['/editor.js'].lineData[473]++;
  elem.href = link;
}, 
  removeCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[32]++;
  _$jscoverage['/editor.js'].lineData[482]++;
  var self = this, doc = self.get('document'), links = doc.all('link');
  _$jscoverage['/editor.js'].lineData[485]++;
  links.each(function(l) {
  _$jscoverage['/editor.js'].functionData[33]++;
  _$jscoverage['/editor.js'].lineData[486]++;
  if (visit1181_486_1(l.attr('href') === link)) {
    _$jscoverage['/editor.js'].lineData[487]++;
    l.remove();
  }
});
  _$jscoverage['/editor.js'].lineData[490]++;
  var cls = self.get('customLink'), ind = S.indexOf(link, cls);
  _$jscoverage['/editor.js'].lineData[492]++;
  if (visit1182_492_1(ind !== -1)) {
    _$jscoverage['/editor.js'].lineData[493]++;
    cls.splice(ind, 1);
  }
}, 
  docReady: function(func) {
  _$jscoverage['/editor.js'].functionData[34]++;
  _$jscoverage['/editor.js'].lineData[504]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[505]++;
  self.on('docReady', func);
  _$jscoverage['/editor.js'].lineData[506]++;
  if (visit1183_506_1(self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[507]++;
    func.call(self);
  }
}, 
  isDocReady: function() {
  _$jscoverage['/editor.js'].functionData[35]++;
  _$jscoverage['/editor.js'].lineData[517]++;
  return this.__docReady;
}, 
  checkSelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[36]++;
  _$jscoverage['/editor.js'].lineData[526]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[527]++;
  if (visit1184_527_1(self.__checkSelectionChangeId)) {
    _$jscoverage['/editor.js'].lineData[528]++;
    clearTimeout(self.__checkSelectionChangeId);
  }
  _$jscoverage['/editor.js'].lineData[531]++;
  self.__checkSelectionChangeId = setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[37]++;
  _$jscoverage['/editor.js'].lineData[532]++;
  var selection = self.getSelection();
  _$jscoverage['/editor.js'].lineData[533]++;
  if (visit1185_533_1(selection && !selection.isInvalid)) {
    _$jscoverage['/editor.js'].lineData[534]++;
    var startElement = selection.getStartElement(), currentPath = new Editor.ElementPath(startElement);
    _$jscoverage['/editor.js'].lineData[536]++;
    if (visit1186_536_1(!self.__previousPath || !self.__previousPath.compare(currentPath))) {
      _$jscoverage['/editor.js'].lineData[537]++;
      self.__previousPath = currentPath;
      _$jscoverage['/editor.js'].lineData[538]++;
      self.fire('selectionChange', {
  selection: selection, 
  path: currentPath, 
  element: startElement});
    }
  }
}, 100);
}, 
  notifySelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[38]++;
  _$jscoverage['/editor.js'].lineData[554]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[555]++;
  self.__previousPath = NULL;
  _$jscoverage['/editor.js'].lineData[556]++;
  self.checkSelectionChange();
}, 
  insertElement: function(element) {
  _$jscoverage['/editor.js'].functionData[39]++;
  _$jscoverage['/editor.js'].lineData[565]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[567]++;
  if (visit1187_567_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[568]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[571]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[573]++;
  var clone, elementName = element.nodeName(), xhtmlDtd = Editor.XHTML_DTD, isBlock = xhtmlDtd.$block[elementName], KER = Editor.RangeType, selection = self.getSelection(), ranges = visit1188_579_1(selection && selection.getRanges()), range, notWhitespaceEval, i, next, nextName, lastElement;
  _$jscoverage['/editor.js'].lineData[587]++;
  if (visit1189_587_1(!ranges || visit1190_587_2(ranges.length === 0))) {
    _$jscoverage['/editor.js'].lineData[588]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[591]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[593]++;
  for (i = ranges.length - 1; visit1191_593_1(i >= 0); i--) {
    _$jscoverage['/editor.js'].lineData[594]++;
    range = ranges[i];
    _$jscoverage['/editor.js'].lineData[597]++;
    clone = visit1192_597_1(visit1193_597_2(!i && element) || element.clone(TRUE));
    _$jscoverage['/editor.js'].lineData[598]++;
    range.insertNodeByDtd(clone);
    _$jscoverage['/editor.js'].lineData[601]++;
    if (visit1194_601_1(!lastElement)) {
      _$jscoverage['/editor.js'].lineData[602]++;
      lastElement = clone;
    }
  }
  _$jscoverage['/editor.js'].lineData[606]++;
  if (visit1195_606_1(!lastElement)) {
    _$jscoverage['/editor.js'].lineData[607]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[610]++;
  range.moveToPosition(lastElement, KER.POSITION_AFTER_END);
  _$jscoverage['/editor.js'].lineData[613]++;
  if (visit1196_613_1(isBlock)) {
    _$jscoverage['/editor.js'].lineData[614]++;
    notWhitespaceEval = Editor.Walker.whitespaces(true);
    _$jscoverage['/editor.js'].lineData[615]++;
    next = lastElement.next(notWhitespaceEval, 1);
    _$jscoverage['/editor.js'].lineData[616]++;
    nextName = visit1197_616_1(next && visit1198_616_2(visit1199_616_3(next[0].nodeType === NodeType.ELEMENT_NODE) && next.nodeName()));
    _$jscoverage['/editor.js'].lineData[619]++;
    if (visit1200_619_1(nextName && visit1201_620_1(xhtmlDtd.$block[nextName] && xhtmlDtd[nextName]['#text']))) {
      _$jscoverage['/editor.js'].lineData[622]++;
      range.moveToElementEditablePosition(next);
    }
  }
  _$jscoverage['/editor.js'].lineData[625]++;
  selection.selectRanges([range]);
  _$jscoverage['/editor.js'].lineData[626]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[629]++;
  if (visit1202_629_1(clone && visit1203_629_2(clone[0].nodeType === 1))) {
    _$jscoverage['/editor.js'].lineData[630]++;
    clone.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
  }
  _$jscoverage['/editor.js'].lineData[636]++;
  saveLater.call(self);
  _$jscoverage['/editor.js'].lineData[637]++;
  return clone;
}, 
  insertHtml: function(data, dataFilter) {
  _$jscoverage['/editor.js'].functionData[40]++;
  _$jscoverage['/editor.js'].lineData[647]++;
  var self = this, htmlDataProcessor, editorDoc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[651]++;
  if (visit1204_651_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[652]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[655]++;
  if ((htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[656]++;
    data = htmlDataProcessor.toDataFormat(data, dataFilter);
  }
  _$jscoverage['/editor.js'].lineData[659]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[660]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[664]++;
  var $sel = editorDoc.selection;
  _$jscoverage['/editor.js'].lineData[665]++;
  if (visit1205_665_1($sel)) {
    _$jscoverage['/editor.js'].lineData[666]++;
    if (visit1206_666_1($sel.type === 'Control')) {
      _$jscoverage['/editor.js'].lineData[667]++;
      $sel.clear();
    }
    _$jscoverage['/editor.js'].lineData[669]++;
    try {
      _$jscoverage['/editor.js'].lineData[670]++;
      $sel.createRange().pasteHTML(data);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[672]++;
  logger.error('insertHtml error in ie');
}
  } else {
    _$jscoverage['/editor.js'].lineData[679]++;
    var sel = self.get('iframe')[0].contentWindow.getSelection(), range = sel.getRangeAt(0);
    _$jscoverage['/editor.js'].lineData[682]++;
    range.deleteContents();
    _$jscoverage['/editor.js'].lineData[687]++;
    var el = editorDoc.createElement('div');
    _$jscoverage['/editor.js'].lineData[688]++;
    el.innerHTML = data;
    _$jscoverage['/editor.js'].lineData[689]++;
    var frag = editorDoc.createDocumentFragment(), node, lastNode;
    _$jscoverage['/editor.js'].lineData[690]++;
    while ((node = el.firstChild)) {
      _$jscoverage['/editor.js'].lineData[691]++;
      lastNode = frag.appendChild(node);
    }
    _$jscoverage['/editor.js'].lineData[693]++;
    range.insertNode(frag);
    _$jscoverage['/editor.js'].lineData[696]++;
    if (visit1207_696_1(lastNode)) {
      _$jscoverage['/editor.js'].lineData[697]++;
      range = range.cloneRange();
      _$jscoverage['/editor.js'].lineData[698]++;
      range.setStartAfter(lastNode);
      _$jscoverage['/editor.js'].lineData[699]++;
      range.collapse(true);
      _$jscoverage['/editor.js'].lineData[700]++;
      sel.removeAllRanges();
      _$jscoverage['/editor.js'].lineData[701]++;
      sel.addRange(range);
    }
  }
  _$jscoverage['/editor.js'].lineData[706]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[41]++;
  _$jscoverage['/editor.js'].lineData[707]++;
  self.getSelection().scrollIntoView();
}, 50);
  _$jscoverage['/editor.js'].lineData[709]++;
  saveLater.call(self);
}});
  _$jscoverage['/editor.js'].lineData[721]++;
  Editor.decorate = function(textarea, cfg) {
  _$jscoverage['/editor.js'].functionData[42]++;
  _$jscoverage['/editor.js'].lineData[722]++;
  cfg = visit1208_722_1(cfg || {});
  _$jscoverage['/editor.js'].lineData[723]++;
  textarea = $(textarea);
  _$jscoverage['/editor.js'].lineData[724]++;
  var textareaAttrs = cfg.textareaAttrs = visit1209_724_1(cfg.textareaAttrs || {});
  _$jscoverage['/editor.js'].lineData[725]++;
  var width = textarea.style('width');
  _$jscoverage['/editor.js'].lineData[726]++;
  var height = textarea.style('height');
  _$jscoverage['/editor.js'].lineData[727]++;
  var name = textarea.attr('name');
  _$jscoverage['/editor.js'].lineData[728]++;
  if (visit1210_728_1(width)) {
    _$jscoverage['/editor.js'].lineData[729]++;
    cfg.width = visit1211_729_1(cfg.width || width);
  }
  _$jscoverage['/editor.js'].lineData[731]++;
  if (visit1212_731_1(height)) {
    _$jscoverage['/editor.js'].lineData[732]++;
    cfg.height = visit1213_732_1(cfg.height || height);
  }
  _$jscoverage['/editor.js'].lineData[734]++;
  if (visit1214_734_1(name)) {
    _$jscoverage['/editor.js'].lineData[735]++;
    textareaAttrs.name = name;
  }
  _$jscoverage['/editor.js'].lineData[737]++;
  cfg.data = visit1215_737_1(cfg.data || textarea.val());
  _$jscoverage['/editor.js'].lineData[738]++;
  cfg.elBefore = textarea;
  _$jscoverage['/editor.js'].lineData[739]++;
  var editor = new Editor(cfg).render();
  _$jscoverage['/editor.js'].lineData[740]++;
  textarea.remove();
  _$jscoverage['/editor.js'].lineData[741]++;
  return editor;
};
  _$jscoverage['/editor.js'].lineData[748]++;
  Editor._initIframe = function(id) {
  _$jscoverage['/editor.js'].functionData[43]++;
  _$jscoverage['/editor.js'].lineData[749]++;
  var self = focusManager.getInstance(id), $doc = self.get('document'), doc = $doc[0], script = $doc.one('#ke_active_script');
  _$jscoverage['/editor.js'].lineData[755]++;
  script.remove();
  _$jscoverage['/editor.js'].lineData[757]++;
  fixByBindIframeDoc(self);
  _$jscoverage['/editor.js'].lineData[759]++;
  var body = doc.body;
  _$jscoverage['/editor.js'].lineData[761]++;
  var $body = $(body);
  _$jscoverage['/editor.js'].lineData[783]++;
  if (visit1216_783_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[785]++;
    body.hideFocus = TRUE;
    _$jscoverage['/editor.js'].lineData[788]++;
    body.disabled = TRUE;
    _$jscoverage['/editor.js'].lineData[789]++;
    body.contentEditable = TRUE;
    _$jscoverage['/editor.js'].lineData[790]++;
    body.removeAttribute('disabled');
  } else {
    _$jscoverage['/editor.js'].lineData[794]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[44]++;
  _$jscoverage['/editor.js'].lineData[796]++;
  if (visit1217_796_1(UA.gecko || UA.opera)) {
    _$jscoverage['/editor.js'].lineData[797]++;
    body.contentEditable = TRUE;
  } else {
    _$jscoverage['/editor.js'].lineData[799]++;
    if (visit1218_799_1(UA.webkit)) {
      _$jscoverage['/editor.js'].lineData[800]++;
      body.parentNode.contentEditable = TRUE;
    } else {
      _$jscoverage['/editor.js'].lineData[803]++;
      doc.designMode = 'on';
    }
  }
}, 0);
  }
  _$jscoverage['/editor.js'].lineData[811]++;
  if (visit1219_820_1(UA.gecko || UA.opera)) {
    _$jscoverage['/editor.js'].lineData[822]++;
    var htmlElement = doc.documentElement;
    _$jscoverage['/editor.js'].lineData[823]++;
    $(htmlElement).on('mousedown', function(evt) {
  _$jscoverage['/editor.js'].functionData[45]++;
  _$jscoverage['/editor.js'].lineData[830]++;
  var t = evt.target;
  _$jscoverage['/editor.js'].lineData[831]++;
  if (visit1220_831_1(t === htmlElement)) {
    _$jscoverage['/editor.js'].lineData[832]++;
    if (visit1221_832_1(UA.gecko)) {
      _$jscoverage['/editor.js'].lineData[833]++;
      blinkCursor(doc, FALSE);
    }
    _$jscoverage['/editor.js'].lineData[840]++;
    self.activateGecko();
  }
});
  }
  _$jscoverage['/editor.js'].lineData[846]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[46]++;
  _$jscoverage['/editor.js'].lineData[855]++;
  if (visit1222_855_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[856]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[47]++;
  _$jscoverage['/editor.js'].lineData[857]++;
  if (visit1223_857_1(doc)) {
    _$jscoverage['/editor.js'].lineData[858]++;
    body.runtimeStyle.marginBottom = '0px';
    _$jscoverage['/editor.js'].lineData[859]++;
    body.runtimeStyle.marginBottom = '';
  }
}, 1000);
  }
}, 0);
  _$jscoverage['/editor.js'].lineData[866]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[48]++;
  _$jscoverage['/editor.js'].lineData[867]++;
  self.__docReady = 1;
  _$jscoverage['/editor.js'].lineData[868]++;
  self.fire('docReady');
  _$jscoverage['/editor.js'].lineData[872]++;
  var disableObjectResizing = self.get('disableObjectResizing'), disableInlineTableEditing = self.get('disableInlineTableEditing');
  _$jscoverage['/editor.js'].lineData[874]++;
  if (visit1224_874_1(disableObjectResizing || disableInlineTableEditing)) {
    _$jscoverage['/editor.js'].lineData[876]++;
    try {
      _$jscoverage['/editor.js'].lineData[877]++;
      doc.execCommand('enableObjectResizing', FALSE, !disableObjectResizing);
      _$jscoverage['/editor.js'].lineData[878]++;
      doc.execCommand('enableInlineTableEditing', FALSE, !disableInlineTableEditing);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[884]++;
  $body.on(IS_IE ? 'resizestart' : 'resize', function(evt) {
  _$jscoverage['/editor.js'].functionData[49]++;
  _$jscoverage['/editor.js'].lineData[885]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor.js'].lineData[886]++;
  if (visit1225_886_1(disableObjectResizing || (visit1226_887_1(visit1227_887_2(t.nodeName() === 'table') && disableInlineTableEditing)))) {
    _$jscoverage['/editor.js'].lineData[889]++;
    evt.preventDefault();
  }
});
}
  }
}, 10);
};
  _$jscoverage['/editor.js'].lineData[899]++;
  function blinkCursor(doc, retry) {
    _$jscoverage['/editor.js'].functionData[50]++;
    _$jscoverage['/editor.js'].lineData[900]++;
    var body = doc.body;
    _$jscoverage['/editor.js'].lineData[901]++;
    tryThese(function() {
  _$jscoverage['/editor.js'].functionData[51]++;
  _$jscoverage['/editor.js'].lineData[903]++;
  doc.designMode = 'on';
  _$jscoverage['/editor.js'].lineData[905]++;
  setTimeout(function go() {
  _$jscoverage['/editor.js'].functionData[52]++;
  _$jscoverage['/editor.js'].lineData[906]++;
  doc.designMode = 'off';
  _$jscoverage['/editor.js'].lineData[907]++;
  body.focus();
  _$jscoverage['/editor.js'].lineData[909]++;
  if (visit1228_909_1(!go.retry)) {
    _$jscoverage['/editor.js'].lineData[910]++;
    go.retry = TRUE;
  }
}, 50);
}, function() {
  _$jscoverage['/editor.js'].functionData[53]++;
  _$jscoverage['/editor.js'].lineData[916]++;
  doc.designMode = 'off';
  _$jscoverage['/editor.js'].lineData[917]++;
  body.setAttribute('contentEditable', false);
  _$jscoverage['/editor.js'].lineData[918]++;
  body.setAttribute('contentEditable', true);
  _$jscoverage['/editor.js'].lineData[920]++;
  if (visit1229_920_1(!retry)) {
    _$jscoverage['/editor.js'].lineData[921]++;
    blinkCursor(doc, 1);
  }
});
  }
  _$jscoverage['/editor.js'].lineData[927]++;
  function fixByBindIframeDoc(self) {
    _$jscoverage['/editor.js'].functionData[54]++;
    _$jscoverage['/editor.js'].lineData[928]++;
    var textarea = self.get('textarea')[0], $win = self.get('window'), $doc = self.get('document'), doc = $doc[0];
    _$jscoverage['/editor.js'].lineData[937]++;
    if (visit1230_937_1(UA.webkit)) {
      _$jscoverage['/editor.js'].lineData[938]++;
      $doc.on('click', function(ev) {
  _$jscoverage['/editor.js'].functionData[55]++;
  _$jscoverage['/editor.js'].lineData[939]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[940]++;
  if (visit1231_940_1(S.inArray(control.nodeName(), ['input', 'select']))) {
    _$jscoverage['/editor.js'].lineData[941]++;
    ev.preventDefault();
  }
});
      _$jscoverage['/editor.js'].lineData[945]++;
      $doc.on('mouseup', function(ev) {
  _$jscoverage['/editor.js'].functionData[56]++;
  _$jscoverage['/editor.js'].lineData[946]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[947]++;
  if (visit1232_947_1(S.inArray(control.nodeName(), ['input', 'textarea']))) {
    _$jscoverage['/editor.js'].lineData[948]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[954]++;
    if (visit1233_954_1(UA.gecko || visit1234_954_2(UA.ie || UA.opera))) {
      _$jscoverage['/editor.js'].lineData[955]++;
      var focusGrabber;
      _$jscoverage['/editor.js'].lineData[956]++;
      focusGrabber = new Node('<span ' + 'tabindex="-1" ' + 'style="position:absolute; left:-10000"' + ' role="presentation"' + '></span>').insertAfter(textarea);
      _$jscoverage['/editor.js'].lineData[963]++;
      focusGrabber.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[57]++;
  _$jscoverage['/editor.js'].lineData[964]++;
  self.focus();
});
      _$jscoverage['/editor.js'].lineData[966]++;
      self.activateGecko = function() {
  _$jscoverage['/editor.js'].functionData[58]++;
  _$jscoverage['/editor.js'].lineData[967]++;
  if (visit1235_967_1((UA.gecko) && self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[968]++;
    focusGrabber[0].focus();
  }
};
      _$jscoverage['/editor.js'].lineData[971]++;
      self.on('destroy', function() {
  _$jscoverage['/editor.js'].functionData[59]++;
  _$jscoverage['/editor.js'].lineData[972]++;
  focusGrabber.detach();
  _$jscoverage['/editor.js'].lineData[973]++;
  focusGrabber.remove();
});
    }
    _$jscoverage['/editor.js'].lineData[977]++;
    $win.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[60]++;
  _$jscoverage['/editor.js'].lineData[983]++;
  if (visit1236_983_1(UA.gecko)) {
    _$jscoverage['/editor.js'].lineData[984]++;
    blinkCursor(doc, FALSE);
  } else {
    _$jscoverage['/editor.js'].lineData[986]++;
    if (visit1237_986_1(UA.opera)) {
      _$jscoverage['/editor.js'].lineData[987]++;
      doc.body.focus();
    }
  }
  _$jscoverage['/editor.js'].lineData[990]++;
  self.notifySelectionChange();
});
    _$jscoverage['/editor.js'].lineData[993]++;
    if (visit1238_993_1(UA.gecko)) {
      _$jscoverage['/editor.js'].lineData[997]++;
      $doc.on('mousedown', function() {
  _$jscoverage['/editor.js'].functionData[61]++;
  _$jscoverage['/editor.js'].lineData[998]++;
  if (visit1239_998_1(!self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[999]++;
    blinkCursor(doc, FALSE);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1004]++;
    if (visit1240_1004_1(IS_IE)) {
      _$jscoverage['/editor.js'].lineData[1010]++;
      $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[62]++;
  _$jscoverage['/editor.js'].lineData[1011]++;
  var keyCode = evt.keyCode;
  _$jscoverage['/editor.js'].lineData[1013]++;
  if (visit1241_1013_1(keyCode in {
  8: 1, 
  46: 1})) {
    _$jscoverage['/editor.js'].lineData[1014]++;
    var sel = self.getSelection(), control = sel.getSelectedElement();
    _$jscoverage['/editor.js'].lineData[1016]++;
    if (visit1242_1016_1(control)) {
      _$jscoverage['/editor.js'].lineData[1018]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[1021]++;
      var bookmark = sel.getRanges()[0].createBookmark();
      _$jscoverage['/editor.js'].lineData[1023]++;
      control.remove();
      _$jscoverage['/editor.js'].lineData[1024]++;
      sel.selectBookmarks([bookmark]);
      _$jscoverage['/editor.js'].lineData[1025]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[1026]++;
      evt.preventDefault();
    }
  }
});
      _$jscoverage['/editor.js'].lineData[1034]++;
      if (visit1243_1034_1(doc.compatMode === 'CSS1Compat')) {
        _$jscoverage['/editor.js'].lineData[1035]++;
        var pageUpDownKeys = {
  33: 1, 
  34: 1};
        _$jscoverage['/editor.js'].lineData[1036]++;
        $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[63]++;
  _$jscoverage['/editor.js'].lineData[1037]++;
  if (visit1244_1037_1(evt.keyCode in pageUpDownKeys)) {
    _$jscoverage['/editor.js'].lineData[1038]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[64]++;
  _$jscoverage['/editor.js'].lineData[1039]++;
  self.getSelection().scrollIntoView();
}, 0);
  }
});
      }
    }
    _$jscoverage['/editor.js'].lineData[1047]++;
    if (visit1245_1047_1(UA.webkit)) {
      _$jscoverage['/editor.js'].lineData[1048]++;
      $doc.on('mousedown', function(ev) {
  _$jscoverage['/editor.js'].functionData[65]++;
  _$jscoverage['/editor.js'].lineData[1049]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1050]++;
  if (visit1246_1050_1(S.inArray(control.nodeName(), ['img', 'hr', 'input', 'textarea', 'select']))) {
    _$jscoverage['/editor.js'].lineData[1051]++;
    self.getSelection().selectElement(control);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1057]++;
    if (visit1247_1057_1(UA.gecko)) {
      _$jscoverage['/editor.js'].lineData[1058]++;
      $doc.on('dragstart', function(ev) {
  _$jscoverage['/editor.js'].functionData[66]++;
  _$jscoverage['/editor.js'].lineData[1059]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1060]++;
  if (visit1248_1060_1(visit1249_1060_2(control.nodeName() === 'img') && /ke_/.test(control[0].className))) {
    _$jscoverage['/editor.js'].lineData[1062]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1068]++;
    focusManager.add(self);
  }
  _$jscoverage['/editor.js'].lineData[1072]++;
  function prepareIFrameHTML(id, customStyle, customLink, data) {
    _$jscoverage['/editor.js'].functionData[67]++;
    _$jscoverage['/editor.js'].lineData[1073]++;
    var links = '', i;
    _$jscoverage['/editor.js'].lineData[1075]++;
    var innerCssFile = Utils.debugUrl('theme/editor-iframe.css');
    _$jscoverage['/editor.js'].lineData[1076]++;
    customLink = customLink.concat([]);
    _$jscoverage['/editor.js'].lineData[1077]++;
    customLink.unshift(innerCssFile);
    _$jscoverage['/editor.js'].lineData[1078]++;
    for (i = 0; visit1250_1078_1(i < customLink.length); i++) {
      _$jscoverage['/editor.js'].lineData[1079]++;
      links += S.substitute('<link href="' + '{href}" rel="stylesheet" />', {
  href: customLink[i]});
    }
    _$jscoverage['/editor.js'].lineData[1083]++;
    return S.substitute(iframeContentTpl, {
  doctype: visit1251_1087_1(S.UA.ieMode === 8) ? '<meta http-equiv="X-UA-Compatible" content="IE=7" />' : '', 
  title: '{title}', 
  links: links, 
  style: '<style>' + customStyle + '</style>', 
  data: visit1252_1094_1(data || ''), 
  script: id ? ('<script id="ke_active_script">' + ($(window).isCustomDomain() ? ('document.domain="' + document.domain + '";') : '') + 'parent.KISSY.require(\'editor\')._initIframe("' + id + '");' + '</script>') : ''});
  }
  _$jscoverage['/editor.js'].lineData[1110]++;
  var saveLater = S.buffer(function() {
  _$jscoverage['/editor.js'].functionData[68]++;
  _$jscoverage['/editor.js'].lineData[1111]++;
  this.execCommand('save');
}, 50);
  _$jscoverage['/editor.js'].lineData[1114]++;
  function setUpIFrame(self, data) {
    _$jscoverage['/editor.js'].functionData[69]++;
    _$jscoverage['/editor.js'].lineData[1115]++;
    var iframe = self.get('iframe'), html = prepareIFrameHTML(self.get('id'), self.get('customStyle'), self.get('customLink'), data), iframeDom = iframe[0], win = iframeDom.contentWindow, doc;
    _$jscoverage['/editor.js'].lineData[1122]++;
    iframe.__loaded = 1;
    _$jscoverage['/editor.js'].lineData[1123]++;
    try {
      _$jscoverage['/editor.js'].lineData[1131]++;
      doc = win.document;
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[1136]++;
  iframeDom.src = iframeDom.src;
  _$jscoverage['/editor.js'].lineData[1139]++;
  if (visit1253_1139_1(IS_IE < 7)) {
    _$jscoverage['/editor.js'].lineData[1140]++;
    setTimeout(run, 10);
    _$jscoverage['/editor.js'].lineData[1141]++;
    return;
  }
}
    _$jscoverage['/editor.js'].lineData[1144]++;
    run();
    _$jscoverage['/editor.js'].lineData[1145]++;
    function run() {
      _$jscoverage['/editor.js'].functionData[70]++;
      _$jscoverage['/editor.js'].lineData[1146]++;
      doc = win.document;
      _$jscoverage['/editor.js'].lineData[1147]++;
      self.setInternal('document', new Node(doc));
      _$jscoverage['/editor.js'].lineData[1148]++;
      self.setInternal('window', new Node(win));
      _$jscoverage['/editor.js'].lineData[1149]++;
      iframe.detach();
      _$jscoverage['/editor.js'].lineData[1151]++;
      doc.open('text/html', 'replace');
      _$jscoverage['/editor.js'].lineData[1152]++;
      doc.write(html);
      _$jscoverage['/editor.js'].lineData[1153]++;
      doc.close();
    }
  }
  _$jscoverage['/editor.js'].lineData[1157]++;
  function createIframe(self, afterData) {
    _$jscoverage['/editor.js'].functionData[71]++;
    _$jscoverage['/editor.js'].lineData[1161]++;
    var iframeSrc = visit1254_1161_1($(window).getEmptyIframeSrc() || '');
    _$jscoverage['/editor.js'].lineData[1162]++;
    if (visit1255_1162_1(iframeSrc)) {
      _$jscoverage['/editor.js'].lineData[1163]++;
      iframeSrc = ' src="' + iframeSrc + '" ';
    }
    _$jscoverage['/editor.js'].lineData[1165]++;
    var iframe = new Node(S.substitute(IFRAME_TPL, {
  iframeSrc: iframeSrc, 
  prefixCls: self.get('prefixCls')})), textarea = self.get('textarea');
    _$jscoverage['/editor.js'].lineData[1170]++;
    if (visit1256_1170_1(textarea.hasAttr('tabindex'))) {
      _$jscoverage['/editor.js'].lineData[1171]++;
      iframe.attr('tabindex', UA.webkit ? -1 : textarea.attr('tabindex'));
    }
    _$jscoverage['/editor.js'].lineData[1173]++;
    textarea.parent().prepend(iframe);
    _$jscoverage['/editor.js'].lineData[1174]++;
    self.set('iframe', iframe);
    _$jscoverage['/editor.js'].lineData[1175]++;
    self.__docReady = 0;
    _$jscoverage['/editor.js'].lineData[1177]++;
    if (visit1257_1177_1(UA.gecko && !iframe.__loaded)) {
      _$jscoverage['/editor.js'].lineData[1178]++;
      iframe.on('load', function() {
  _$jscoverage['/editor.js'].functionData[72]++;
  _$jscoverage['/editor.js'].lineData[1179]++;
  setUpIFrame(self, afterData);
}, self);
    } else {
      _$jscoverage['/editor.js'].lineData[1183]++;
      setUpIFrame(self, afterData);
    }
  }
  _$jscoverage['/editor.js'].lineData[1187]++;
  function clearIframeDocContent(self) {
    _$jscoverage['/editor.js'].functionData[73]++;
    _$jscoverage['/editor.js'].lineData[1188]++;
    if (visit1258_1188_1(!self.get('iframe'))) {
      _$jscoverage['/editor.js'].lineData[1189]++;
      return;
    }
    _$jscoverage['/editor.js'].lineData[1191]++;
    var iframe = self.get('iframe'), win = self.get('window'), doc = self.get('document'), domDoc = doc[0], documentElement = $(domDoc.documentElement), body = $(domDoc.body);
    _$jscoverage['/editor.js'].lineData[1197]++;
    S.each([doc, documentElement, body, win], function(el) {
  _$jscoverage['/editor.js'].functionData[74]++;
  _$jscoverage['/editor.js'].lineData[1198]++;
  el.detach();
});
    _$jscoverage['/editor.js'].lineData[1200]++;
    iframe.remove();
  }
});
