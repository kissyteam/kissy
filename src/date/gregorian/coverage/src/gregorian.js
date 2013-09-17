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
if (! _$jscoverage['/gregorian.js']) {
  _$jscoverage['/gregorian.js'] = {};
  _$jscoverage['/gregorian.js'].lineData = [];
  _$jscoverage['/gregorian.js'].lineData[6] = 0;
  _$jscoverage['/gregorian.js'].lineData[7] = 0;
  _$jscoverage['/gregorian.js'].lineData[39] = 0;
  _$jscoverage['/gregorian.js'].lineData[41] = 0;
  _$jscoverage['/gregorian.js'].lineData[43] = 0;
  _$jscoverage['/gregorian.js'].lineData[44] = 0;
  _$jscoverage['/gregorian.js'].lineData[45] = 0;
  _$jscoverage['/gregorian.js'].lineData[46] = 0;
  _$jscoverage['/gregorian.js'].lineData[47] = 0;
  _$jscoverage['/gregorian.js'].lineData[50] = 0;
  _$jscoverage['/gregorian.js'].lineData[52] = 0;
  _$jscoverage['/gregorian.js'].lineData[54] = 0;
  _$jscoverage['/gregorian.js'].lineData[61] = 0;
  _$jscoverage['/gregorian.js'].lineData[67] = 0;
  _$jscoverage['/gregorian.js'].lineData[73] = 0;
  _$jscoverage['/gregorian.js'].lineData[81] = 0;
  _$jscoverage['/gregorian.js'].lineData[83] = 0;
  _$jscoverage['/gregorian.js'].lineData[85] = 0;
  _$jscoverage['/gregorian.js'].lineData[86] = 0;
  _$jscoverage['/gregorian.js'].lineData[90] = 0;
  _$jscoverage['/gregorian.js'].lineData[92] = 0;
  _$jscoverage['/gregorian.js'].lineData[179] = 0;
  _$jscoverage['/gregorian.js'].lineData[187] = 0;
  _$jscoverage['/gregorian.js'].lineData[188] = 0;
  _$jscoverage['/gregorian.js'].lineData[189] = 0;
  _$jscoverage['/gregorian.js'].lineData[190] = 0;
  _$jscoverage['/gregorian.js'].lineData[191] = 0;
  _$jscoverage['/gregorian.js'].lineData[192] = 0;
  _$jscoverage['/gregorian.js'].lineData[194] = 0;
  _$jscoverage['/gregorian.js'].lineData[195] = 0;
  _$jscoverage['/gregorian.js'].lineData[196] = 0;
  _$jscoverage['/gregorian.js'].lineData[197] = 0;
  _$jscoverage['/gregorian.js'].lineData[199] = 0;
  _$jscoverage['/gregorian.js'].lineData[200] = 0;
  _$jscoverage['/gregorian.js'].lineData[202] = 0;
  _$jscoverage['/gregorian.js'].lineData[203] = 0;
  _$jscoverage['/gregorian.js'].lineData[205] = 0;
  _$jscoverage['/gregorian.js'].lineData[206] = 0;
  _$jscoverage['/gregorian.js'].lineData[207] = 0;
  _$jscoverage['/gregorian.js'].lineData[208] = 0;
  _$jscoverage['/gregorian.js'].lineData[209] = 0;
  _$jscoverage['/gregorian.js'].lineData[211] = 0;
  _$jscoverage['/gregorian.js'].lineData[213] = 0;
  _$jscoverage['/gregorian.js'].lineData[218] = 0;
  _$jscoverage['/gregorian.js'].lineData[236] = 0;
  _$jscoverage['/gregorian.js'].lineData[252] = 0;
  _$jscoverage['/gregorian.js'].lineData[264] = 0;
  _$jscoverage['/gregorian.js'].lineData[272] = 0;
  _$jscoverage['/gregorian.js'].lineData[286] = 0;
  _$jscoverage['/gregorian.js'].lineData[287] = 0;
  _$jscoverage['/gregorian.js'].lineData[290] = 0;
  _$jscoverage['/gregorian.js'].lineData[291] = 0;
  _$jscoverage['/gregorian.js'].lineData[292] = 0;
  _$jscoverage['/gregorian.js'].lineData[293] = 0;
  _$jscoverage['/gregorian.js'].lineData[296] = 0;
  _$jscoverage['/gregorian.js'].lineData[309] = 0;
  _$jscoverage['/gregorian.js'].lineData[310] = 0;
  _$jscoverage['/gregorian.js'].lineData[312] = 0;
  _$jscoverage['/gregorian.js'].lineData[314] = 0;
  _$jscoverage['/gregorian.js'].lineData[316] = 0;
  _$jscoverage['/gregorian.js'].lineData[317] = 0;
  _$jscoverage['/gregorian.js'].lineData[320] = 0;
  _$jscoverage['/gregorian.js'].lineData[321] = 0;
  _$jscoverage['/gregorian.js'].lineData[322] = 0;
  _$jscoverage['/gregorian.js'].lineData[323] = 0;
  _$jscoverage['/gregorian.js'].lineData[325] = 0;
  _$jscoverage['/gregorian.js'].lineData[328] = 0;
  _$jscoverage['/gregorian.js'].lineData[329] = 0;
  _$jscoverage['/gregorian.js'].lineData[330] = 0;
  _$jscoverage['/gregorian.js'].lineData[333] = 0;
  _$jscoverage['/gregorian.js'].lineData[334] = 0;
  _$jscoverage['/gregorian.js'].lineData[337] = 0;
  _$jscoverage['/gregorian.js'].lineData[338] = 0;
  _$jscoverage['/gregorian.js'].lineData[340] = 0;
  _$jscoverage['/gregorian.js'].lineData[341] = 0;
  _$jscoverage['/gregorian.js'].lineData[343] = 0;
  _$jscoverage['/gregorian.js'].lineData[354] = 0;
  _$jscoverage['/gregorian.js'].lineData[363] = 0;
  _$jscoverage['/gregorian.js'].lineData[364] = 0;
  _$jscoverage['/gregorian.js'].lineData[365] = 0;
  _$jscoverage['/gregorian.js'].lineData[366] = 0;
  _$jscoverage['/gregorian.js'].lineData[367] = 0;
  _$jscoverage['/gregorian.js'].lineData[368] = 0;
  _$jscoverage['/gregorian.js'].lineData[369] = 0;
  _$jscoverage['/gregorian.js'].lineData[370] = 0;
  _$jscoverage['/gregorian.js'].lineData[371] = 0;
  _$jscoverage['/gregorian.js'].lineData[373] = 0;
  _$jscoverage['/gregorian.js'].lineData[374] = 0;
  _$jscoverage['/gregorian.js'].lineData[375] = 0;
  _$jscoverage['/gregorian.js'].lineData[379] = 0;
  _$jscoverage['/gregorian.js'].lineData[381] = 0;
  _$jscoverage['/gregorian.js'].lineData[383] = 0;
  _$jscoverage['/gregorian.js'].lineData[385] = 0;
  _$jscoverage['/gregorian.js'].lineData[386] = 0;
  _$jscoverage['/gregorian.js'].lineData[387] = 0;
  _$jscoverage['/gregorian.js'].lineData[388] = 0;
  _$jscoverage['/gregorian.js'].lineData[389] = 0;
  _$jscoverage['/gregorian.js'].lineData[391] = 0;
  _$jscoverage['/gregorian.js'].lineData[392] = 0;
  _$jscoverage['/gregorian.js'].lineData[393] = 0;
  _$jscoverage['/gregorian.js'].lineData[394] = 0;
  _$jscoverage['/gregorian.js'].lineData[395] = 0;
  _$jscoverage['/gregorian.js'].lineData[396] = 0;
  _$jscoverage['/gregorian.js'].lineData[397] = 0;
  _$jscoverage['/gregorian.js'].lineData[399] = 0;
  _$jscoverage['/gregorian.js'].lineData[406] = 0;
  _$jscoverage['/gregorian.js'].lineData[407] = 0;
  _$jscoverage['/gregorian.js'].lineData[408] = 0;
  _$jscoverage['/gregorian.js'].lineData[410] = 0;
  _$jscoverage['/gregorian.js'].lineData[411] = 0;
  _$jscoverage['/gregorian.js'].lineData[413] = 0;
  _$jscoverage['/gregorian.js'].lineData[416] = 0;
  _$jscoverage['/gregorian.js'].lineData[420] = 0;
  _$jscoverage['/gregorian.js'].lineData[421] = 0;
  _$jscoverage['/gregorian.js'].lineData[422] = 0;
  _$jscoverage['/gregorian.js'].lineData[425] = 0;
  _$jscoverage['/gregorian.js'].lineData[426] = 0;
  _$jscoverage['/gregorian.js'].lineData[427] = 0;
  _$jscoverage['/gregorian.js'].lineData[428] = 0;
  _$jscoverage['/gregorian.js'].lineData[430] = 0;
  _$jscoverage['/gregorian.js'].lineData[434] = 0;
  _$jscoverage['/gregorian.js'].lineData[438] = 0;
  _$jscoverage['/gregorian.js'].lineData[439] = 0;
  _$jscoverage['/gregorian.js'].lineData[441] = 0;
  _$jscoverage['/gregorian.js'].lineData[450] = 0;
  _$jscoverage['/gregorian.js'].lineData[451] = 0;
  _$jscoverage['/gregorian.js'].lineData[454] = 0;
  _$jscoverage['/gregorian.js'].lineData[456] = 0;
  _$jscoverage['/gregorian.js'].lineData[457] = 0;
  _$jscoverage['/gregorian.js'].lineData[458] = 0;
  _$jscoverage['/gregorian.js'].lineData[459] = 0;
  _$jscoverage['/gregorian.js'].lineData[461] = 0;
  _$jscoverage['/gregorian.js'].lineData[462] = 0;
  _$jscoverage['/gregorian.js'].lineData[463] = 0;
  _$jscoverage['/gregorian.js'].lineData[464] = 0;
  _$jscoverage['/gregorian.js'].lineData[465] = 0;
  _$jscoverage['/gregorian.js'].lineData[466] = 0;
  _$jscoverage['/gregorian.js'].lineData[468] = 0;
  _$jscoverage['/gregorian.js'].lineData[470] = 0;
  _$jscoverage['/gregorian.js'].lineData[472] = 0;
  _$jscoverage['/gregorian.js'].lineData[475] = 0;
  _$jscoverage['/gregorian.js'].lineData[477] = 0;
  _$jscoverage['/gregorian.js'].lineData[479] = 0;
  _$jscoverage['/gregorian.js'].lineData[481] = 0;
  _$jscoverage['/gregorian.js'].lineData[492] = 0;
  _$jscoverage['/gregorian.js'].lineData[493] = 0;
  _$jscoverage['/gregorian.js'].lineData[495] = 0;
  _$jscoverage['/gregorian.js'].lineData[496] = 0;
  _$jscoverage['/gregorian.js'].lineData[502] = 0;
  _$jscoverage['/gregorian.js'].lineData[504] = 0;
  _$jscoverage['/gregorian.js'].lineData[506] = 0;
  _$jscoverage['/gregorian.js'].lineData[508] = 0;
  _$jscoverage['/gregorian.js'].lineData[510] = 0;
  _$jscoverage['/gregorian.js'].lineData[512] = 0;
  _$jscoverage['/gregorian.js'].lineData[513] = 0;
  _$jscoverage['/gregorian.js'].lineData[514] = 0;
  _$jscoverage['/gregorian.js'].lineData[515] = 0;
  _$jscoverage['/gregorian.js'].lineData[516] = 0;
  _$jscoverage['/gregorian.js'].lineData[517] = 0;
  _$jscoverage['/gregorian.js'].lineData[518] = 0;
  _$jscoverage['/gregorian.js'].lineData[519] = 0;
  _$jscoverage['/gregorian.js'].lineData[525] = 0;
  _$jscoverage['/gregorian.js'].lineData[527] = 0;
  _$jscoverage['/gregorian.js'].lineData[529] = 0;
  _$jscoverage['/gregorian.js'].lineData[530] = 0;
  _$jscoverage['/gregorian.js'].lineData[533] = 0;
  _$jscoverage['/gregorian.js'].lineData[534] = 0;
  _$jscoverage['/gregorian.js'].lineData[535] = 0;
  _$jscoverage['/gregorian.js'].lineData[537] = 0;
  _$jscoverage['/gregorian.js'].lineData[538] = 0;
  _$jscoverage['/gregorian.js'].lineData[542] = 0;
  _$jscoverage['/gregorian.js'].lineData[543] = 0;
  _$jscoverage['/gregorian.js'].lineData[546] = 0;
  _$jscoverage['/gregorian.js'].lineData[547] = 0;
  _$jscoverage['/gregorian.js'].lineData[550] = 0;
  _$jscoverage['/gregorian.js'].lineData[552] = 0;
  _$jscoverage['/gregorian.js'].lineData[553] = 0;
  _$jscoverage['/gregorian.js'].lineData[554] = 0;
  _$jscoverage['/gregorian.js'].lineData[556] = 0;
  _$jscoverage['/gregorian.js'].lineData[558] = 0;
  _$jscoverage['/gregorian.js'].lineData[559] = 0;
  _$jscoverage['/gregorian.js'].lineData[560] = 0;
  _$jscoverage['/gregorian.js'].lineData[562] = 0;
  _$jscoverage['/gregorian.js'].lineData[567] = 0;
  _$jscoverage['/gregorian.js'].lineData[568] = 0;
  _$jscoverage['/gregorian.js'].lineData[570] = 0;
  _$jscoverage['/gregorian.js'].lineData[573] = 0;
  _$jscoverage['/gregorian.js'].lineData[574] = 0;
  _$jscoverage['/gregorian.js'].lineData[576] = 0;
  _$jscoverage['/gregorian.js'].lineData[577] = 0;
  _$jscoverage['/gregorian.js'].lineData[579] = 0;
  _$jscoverage['/gregorian.js'].lineData[583] = 0;
  _$jscoverage['/gregorian.js'].lineData[592] = 0;
  _$jscoverage['/gregorian.js'].lineData[593] = 0;
  _$jscoverage['/gregorian.js'].lineData[595] = 0;
  _$jscoverage['/gregorian.js'].lineData[603] = 0;
  _$jscoverage['/gregorian.js'].lineData[604] = 0;
  _$jscoverage['/gregorian.js'].lineData[605] = 0;
  _$jscoverage['/gregorian.js'].lineData[614] = 0;
  _$jscoverage['/gregorian.js'].lineData[615] = 0;
  _$jscoverage['/gregorian.js'].lineData[704] = 0;
  _$jscoverage['/gregorian.js'].lineData[705] = 0;
  _$jscoverage['/gregorian.js'].lineData[706] = 0;
  _$jscoverage['/gregorian.js'].lineData[707] = 0;
  _$jscoverage['/gregorian.js'].lineData[708] = 0;
  _$jscoverage['/gregorian.js'].lineData[709] = 0;
  _$jscoverage['/gregorian.js'].lineData[712] = 0;
  _$jscoverage['/gregorian.js'].lineData[714] = 0;
  _$jscoverage['/gregorian.js'].lineData[826] = 0;
  _$jscoverage['/gregorian.js'].lineData[827] = 0;
  _$jscoverage['/gregorian.js'].lineData[829] = 0;
  _$jscoverage['/gregorian.js'].lineData[830] = 0;
  _$jscoverage['/gregorian.js'].lineData[832] = 0;
  _$jscoverage['/gregorian.js'].lineData[833] = 0;
  _$jscoverage['/gregorian.js'].lineData[834] = 0;
  _$jscoverage['/gregorian.js'].lineData[835] = 0;
  _$jscoverage['/gregorian.js'].lineData[836] = 0;
  _$jscoverage['/gregorian.js'].lineData[837] = 0;
  _$jscoverage['/gregorian.js'].lineData[838] = 0;
  _$jscoverage['/gregorian.js'].lineData[839] = 0;
  _$jscoverage['/gregorian.js'].lineData[840] = 0;
  _$jscoverage['/gregorian.js'].lineData[841] = 0;
  _$jscoverage['/gregorian.js'].lineData[842] = 0;
  _$jscoverage['/gregorian.js'].lineData[844] = 0;
  _$jscoverage['/gregorian.js'].lineData[845] = 0;
  _$jscoverage['/gregorian.js'].lineData[847] = 0;
  _$jscoverage['/gregorian.js'].lineData[849] = 0;
  _$jscoverage['/gregorian.js'].lineData[850] = 0;
  _$jscoverage['/gregorian.js'].lineData[852] = 0;
  _$jscoverage['/gregorian.js'].lineData[853] = 0;
  _$jscoverage['/gregorian.js'].lineData[855] = 0;
  _$jscoverage['/gregorian.js'].lineData[856] = 0;
  _$jscoverage['/gregorian.js'].lineData[858] = 0;
  _$jscoverage['/gregorian.js'].lineData[862] = 0;
  _$jscoverage['/gregorian.js'].lineData[863] = 0;
  _$jscoverage['/gregorian.js'].lineData[867] = 0;
  _$jscoverage['/gregorian.js'].lineData[868] = 0;
  _$jscoverage['/gregorian.js'].lineData[870] = 0;
  _$jscoverage['/gregorian.js'].lineData[871] = 0;
  _$jscoverage['/gregorian.js'].lineData[873] = 0;
  _$jscoverage['/gregorian.js'].lineData[958] = 0;
  _$jscoverage['/gregorian.js'].lineData[959] = 0;
  _$jscoverage['/gregorian.js'].lineData[960] = 0;
  _$jscoverage['/gregorian.js'].lineData[961] = 0;
  _$jscoverage['/gregorian.js'].lineData[986] = 0;
  _$jscoverage['/gregorian.js'].lineData[987] = 0;
  _$jscoverage['/gregorian.js'].lineData[989] = 0;
  _$jscoverage['/gregorian.js'].lineData[991] = 0;
  _$jscoverage['/gregorian.js'].lineData[992] = 0;
  _$jscoverage['/gregorian.js'].lineData[993] = 0;
  _$jscoverage['/gregorian.js'].lineData[994] = 0;
  _$jscoverage['/gregorian.js'].lineData[996] = 0;
  _$jscoverage['/gregorian.js'].lineData[999] = 0;
  _$jscoverage['/gregorian.js'].lineData[1001] = 0;
  _$jscoverage['/gregorian.js'].lineData[1002] = 0;
  _$jscoverage['/gregorian.js'].lineData[1005] = 0;
  _$jscoverage['/gregorian.js'].lineData[1006] = 0;
  _$jscoverage['/gregorian.js'].lineData[1091] = 0;
  _$jscoverage['/gregorian.js'].lineData[1092] = 0;
  _$jscoverage['/gregorian.js'].lineData[1094] = 0;
  _$jscoverage['/gregorian.js'].lineData[1095] = 0;
  _$jscoverage['/gregorian.js'].lineData[1097] = 0;
  _$jscoverage['/gregorian.js'].lineData[1098] = 0;
  _$jscoverage['/gregorian.js'].lineData[1100] = 0;
  _$jscoverage['/gregorian.js'].lineData[1101] = 0;
  _$jscoverage['/gregorian.js'].lineData[1103] = 0;
  _$jscoverage['/gregorian.js'].lineData[1104] = 0;
  _$jscoverage['/gregorian.js'].lineData[1105] = 0;
  _$jscoverage['/gregorian.js'].lineData[1114] = 0;
  _$jscoverage['/gregorian.js'].lineData[1121] = 0;
  _$jscoverage['/gregorian.js'].lineData[1122] = 0;
  _$jscoverage['/gregorian.js'].lineData[1123] = 0;
  _$jscoverage['/gregorian.js'].lineData[1131] = 0;
  _$jscoverage['/gregorian.js'].lineData[1132] = 0;
  _$jscoverage['/gregorian.js'].lineData[1133] = 0;
  _$jscoverage['/gregorian.js'].lineData[1142] = 0;
  _$jscoverage['/gregorian.js'].lineData[1153] = 0;
  _$jscoverage['/gregorian.js'].lineData[1154] = 0;
  _$jscoverage['/gregorian.js'].lineData[1155] = 0;
  _$jscoverage['/gregorian.js'].lineData[1167] = 0;
  _$jscoverage['/gregorian.js'].lineData[1184] = 0;
  _$jscoverage['/gregorian.js'].lineData[1185] = 0;
  _$jscoverage['/gregorian.js'].lineData[1186] = 0;
  _$jscoverage['/gregorian.js'].lineData[1189] = 0;
  _$jscoverage['/gregorian.js'].lineData[1190] = 0;
  _$jscoverage['/gregorian.js'].lineData[1191] = 0;
  _$jscoverage['/gregorian.js'].lineData[1203] = 0;
  _$jscoverage['/gregorian.js'].lineData[1204] = 0;
  _$jscoverage['/gregorian.js'].lineData[1205] = 0;
  _$jscoverage['/gregorian.js'].lineData[1206] = 0;
  _$jscoverage['/gregorian.js'].lineData[1207] = 0;
  _$jscoverage['/gregorian.js'].lineData[1208] = 0;
  _$jscoverage['/gregorian.js'].lineData[1210] = 0;
  _$jscoverage['/gregorian.js'].lineData[1211] = 0;
  _$jscoverage['/gregorian.js'].lineData[1212] = 0;
  _$jscoverage['/gregorian.js'].lineData[1215] = 0;
  _$jscoverage['/gregorian.js'].lineData[1227] = 0;
  _$jscoverage['/gregorian.js'].lineData[1228] = 0;
  _$jscoverage['/gregorian.js'].lineData[1230] = 0;
  _$jscoverage['/gregorian.js'].lineData[1233] = 0;
  _$jscoverage['/gregorian.js'].lineData[1234] = 0;
  _$jscoverage['/gregorian.js'].lineData[1235] = 0;
  _$jscoverage['/gregorian.js'].lineData[1236] = 0;
  _$jscoverage['/gregorian.js'].lineData[1237] = 0;
  _$jscoverage['/gregorian.js'].lineData[1238] = 0;
  _$jscoverage['/gregorian.js'].lineData[1239] = 0;
  _$jscoverage['/gregorian.js'].lineData[1240] = 0;
  _$jscoverage['/gregorian.js'].lineData[1241] = 0;
  _$jscoverage['/gregorian.js'].lineData[1243] = 0;
  _$jscoverage['/gregorian.js'].lineData[1244] = 0;
  _$jscoverage['/gregorian.js'].lineData[1245] = 0;
  _$jscoverage['/gregorian.js'].lineData[1247] = 0;
  _$jscoverage['/gregorian.js'].lineData[1249] = 0;
  _$jscoverage['/gregorian.js'].lineData[1250] = 0;
  _$jscoverage['/gregorian.js'].lineData[1251] = 0;
  _$jscoverage['/gregorian.js'].lineData[1252] = 0;
  _$jscoverage['/gregorian.js'].lineData[1259] = 0;
  _$jscoverage['/gregorian.js'].lineData[1260] = 0;
  _$jscoverage['/gregorian.js'].lineData[1262] = 0;
  _$jscoverage['/gregorian.js'].lineData[1263] = 0;
  _$jscoverage['/gregorian.js'].lineData[1264] = 0;
  _$jscoverage['/gregorian.js'].lineData[1276] = 0;
  _$jscoverage['/gregorian.js'].lineData[1290] = 0;
  _$jscoverage['/gregorian.js'].lineData[1291] = 0;
  _$jscoverage['/gregorian.js'].lineData[1293] = 0;
  _$jscoverage['/gregorian.js'].lineData[1295] = 0;
  _$jscoverage['/gregorian.js'].lineData[1296] = 0;
  _$jscoverage['/gregorian.js'].lineData[1300] = 0;
  _$jscoverage['/gregorian.js'].lineData[1302] = 0;
  _$jscoverage['/gregorian.js'].lineData[1304] = 0;
  _$jscoverage['/gregorian.js'].lineData[1312] = 0;
  _$jscoverage['/gregorian.js'].lineData[1325] = 0;
  _$jscoverage['/gregorian.js'].lineData[1337] = 0;
  _$jscoverage['/gregorian.js'].lineData[1345] = 0;
  _$jscoverage['/gregorian.js'].lineData[1358] = 0;
  _$jscoverage['/gregorian.js'].lineData[1359] = 0;
  _$jscoverage['/gregorian.js'].lineData[1360] = 0;
  _$jscoverage['/gregorian.js'].lineData[1361] = 0;
  _$jscoverage['/gregorian.js'].lineData[1364] = 0;
  _$jscoverage['/gregorian.js'].lineData[1365] = 0;
  _$jscoverage['/gregorian.js'].lineData[1368] = 0;
  _$jscoverage['/gregorian.js'].lineData[1369] = 0;
  _$jscoverage['/gregorian.js'].lineData[1372] = 0;
  _$jscoverage['/gregorian.js'].lineData[1373] = 0;
  _$jscoverage['/gregorian.js'].lineData[1376] = 0;
  _$jscoverage['/gregorian.js'].lineData[1377] = 0;
  _$jscoverage['/gregorian.js'].lineData[1385] = 0;
  _$jscoverage['/gregorian.js'].lineData[1386] = 0;
  _$jscoverage['/gregorian.js'].lineData[1387] = 0;
  _$jscoverage['/gregorian.js'].lineData[1388] = 0;
  _$jscoverage['/gregorian.js'].lineData[1389] = 0;
  _$jscoverage['/gregorian.js'].lineData[1390] = 0;
  _$jscoverage['/gregorian.js'].lineData[1391] = 0;
  _$jscoverage['/gregorian.js'].lineData[1392] = 0;
  _$jscoverage['/gregorian.js'].lineData[1396] = 0;
  _$jscoverage['/gregorian.js'].lineData[1397] = 0;
  _$jscoverage['/gregorian.js'].lineData[1400] = 0;
  _$jscoverage['/gregorian.js'].lineData[1401] = 0;
  _$jscoverage['/gregorian.js'].lineData[1404] = 0;
  _$jscoverage['/gregorian.js'].lineData[1405] = 0;
  _$jscoverage['/gregorian.js'].lineData[1406] = 0;
  _$jscoverage['/gregorian.js'].lineData[1407] = 0;
  _$jscoverage['/gregorian.js'].lineData[1408] = 0;
  _$jscoverage['/gregorian.js'].lineData[1410] = 0;
  _$jscoverage['/gregorian.js'].lineData[1411] = 0;
  _$jscoverage['/gregorian.js'].lineData[1414] = 0;
  _$jscoverage['/gregorian.js'].lineData[1417] = 0;
  _$jscoverage['/gregorian.js'].lineData[1422] = 0;
}
if (! _$jscoverage['/gregorian.js'].functionData) {
  _$jscoverage['/gregorian.js'].functionData = [];
  _$jscoverage['/gregorian.js'].functionData[0] = 0;
  _$jscoverage['/gregorian.js'].functionData[1] = 0;
  _$jscoverage['/gregorian.js'].functionData[2] = 0;
  _$jscoverage['/gregorian.js'].functionData[3] = 0;
  _$jscoverage['/gregorian.js'].functionData[4] = 0;
  _$jscoverage['/gregorian.js'].functionData[5] = 0;
  _$jscoverage['/gregorian.js'].functionData[6] = 0;
  _$jscoverage['/gregorian.js'].functionData[7] = 0;
  _$jscoverage['/gregorian.js'].functionData[8] = 0;
  _$jscoverage['/gregorian.js'].functionData[9] = 0;
  _$jscoverage['/gregorian.js'].functionData[10] = 0;
  _$jscoverage['/gregorian.js'].functionData[11] = 0;
  _$jscoverage['/gregorian.js'].functionData[12] = 0;
  _$jscoverage['/gregorian.js'].functionData[13] = 0;
  _$jscoverage['/gregorian.js'].functionData[14] = 0;
  _$jscoverage['/gregorian.js'].functionData[15] = 0;
  _$jscoverage['/gregorian.js'].functionData[16] = 0;
  _$jscoverage['/gregorian.js'].functionData[17] = 0;
  _$jscoverage['/gregorian.js'].functionData[18] = 0;
  _$jscoverage['/gregorian.js'].functionData[19] = 0;
  _$jscoverage['/gregorian.js'].functionData[20] = 0;
  _$jscoverage['/gregorian.js'].functionData[21] = 0;
  _$jscoverage['/gregorian.js'].functionData[22] = 0;
  _$jscoverage['/gregorian.js'].functionData[23] = 0;
  _$jscoverage['/gregorian.js'].functionData[24] = 0;
  _$jscoverage['/gregorian.js'].functionData[25] = 0;
  _$jscoverage['/gregorian.js'].functionData[26] = 0;
  _$jscoverage['/gregorian.js'].functionData[27] = 0;
  _$jscoverage['/gregorian.js'].functionData[28] = 0;
  _$jscoverage['/gregorian.js'].functionData[29] = 0;
  _$jscoverage['/gregorian.js'].functionData[30] = 0;
  _$jscoverage['/gregorian.js'].functionData[31] = 0;
  _$jscoverage['/gregorian.js'].functionData[32] = 0;
  _$jscoverage['/gregorian.js'].functionData[33] = 0;
  _$jscoverage['/gregorian.js'].functionData[34] = 0;
  _$jscoverage['/gregorian.js'].functionData[35] = 0;
  _$jscoverage['/gregorian.js'].functionData[36] = 0;
  _$jscoverage['/gregorian.js'].functionData[37] = 0;
  _$jscoverage['/gregorian.js'].functionData[38] = 0;
  _$jscoverage['/gregorian.js'].functionData[39] = 0;
  _$jscoverage['/gregorian.js'].functionData[40] = 0;
  _$jscoverage['/gregorian.js'].functionData[41] = 0;
}
if (! _$jscoverage['/gregorian.js'].branchData) {
  _$jscoverage['/gregorian.js'].branchData = {};
  _$jscoverage['/gregorian.js'].branchData['43'] = [];
  _$jscoverage['/gregorian.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['46'] = [];
  _$jscoverage['/gregorian.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['50'] = [];
  _$jscoverage['/gregorian.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['67'] = [];
  _$jscoverage['/gregorian.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['85'] = [];
  _$jscoverage['/gregorian.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['286'] = [];
  _$jscoverage['/gregorian.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['291'] = [];
  _$jscoverage['/gregorian.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['309'] = [];
  _$jscoverage['/gregorian.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['322'] = [];
  _$jscoverage['/gregorian.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['340'] = [];
  _$jscoverage['/gregorian.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['354'] = [];
  _$jscoverage['/gregorian.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['369'] = [];
  _$jscoverage['/gregorian.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['373'] = [];
  _$jscoverage['/gregorian.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['391'] = [];
  _$jscoverage['/gregorian.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['416'] = [];
  _$jscoverage['/gregorian.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['425'] = [];
  _$jscoverage['/gregorian.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['430'] = [];
  _$jscoverage['/gregorian.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['430'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['432'] = [];
  _$jscoverage['/gregorian.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['450'] = [];
  _$jscoverage['/gregorian.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['458'] = [];
  _$jscoverage['/gregorian.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['462'] = [];
  _$jscoverage['/gregorian.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['464'] = [];
  _$jscoverage['/gregorian.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['466'] = [];
  _$jscoverage['/gregorian.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['492'] = [];
  _$jscoverage['/gregorian.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['495'] = [];
  _$jscoverage['/gregorian.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['512'] = [];
  _$jscoverage['/gregorian.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['514'] = [];
  _$jscoverage['/gregorian.js'].branchData['514'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['517'] = [];
  _$jscoverage['/gregorian.js'].branchData['517'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['529'] = [];
  _$jscoverage['/gregorian.js'].branchData['529'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['533'] = [];
  _$jscoverage['/gregorian.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['534'] = [];
  _$jscoverage['/gregorian.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['537'] = [];
  _$jscoverage['/gregorian.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['542'] = [];
  _$jscoverage['/gregorian.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['546'] = [];
  _$jscoverage['/gregorian.js'].branchData['546'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['553'] = [];
  _$jscoverage['/gregorian.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['559'] = [];
  _$jscoverage['/gregorian.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['567'] = [];
  _$jscoverage['/gregorian.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['573'] = [];
  _$jscoverage['/gregorian.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['576'] = [];
  _$jscoverage['/gregorian.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['592'] = [];
  _$jscoverage['/gregorian.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['705'] = [];
  _$jscoverage['/gregorian.js'].branchData['705'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['707'] = [];
  _$jscoverage['/gregorian.js'].branchData['707'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['708'] = [];
  _$jscoverage['/gregorian.js'].branchData['708'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['826'] = [];
  _$jscoverage['/gregorian.js'].branchData['826'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['833'] = [];
  _$jscoverage['/gregorian.js'].branchData['833'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['837'] = [];
  _$jscoverage['/gregorian.js'].branchData['837'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['841'] = [];
  _$jscoverage['/gregorian.js'].branchData['841'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['986'] = [];
  _$jscoverage['/gregorian.js'].branchData['986'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1121'] = [];
  _$jscoverage['/gregorian.js'].branchData['1121'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1131'] = [];
  _$jscoverage['/gregorian.js'].branchData['1131'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1153'] = [];
  _$jscoverage['/gregorian.js'].branchData['1153'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1185'] = [];
  _$jscoverage['/gregorian.js'].branchData['1185'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1206'] = [];
  _$jscoverage['/gregorian.js'].branchData['1206'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1207'] = [];
  _$jscoverage['/gregorian.js'].branchData['1207'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1210'] = [];
  _$jscoverage['/gregorian.js'].branchData['1210'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1211'] = [];
  _$jscoverage['/gregorian.js'].branchData['1211'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1227'] = [];
  _$jscoverage['/gregorian.js'].branchData['1227'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1227'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1227'][3] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1240'] = [];
  _$jscoverage['/gregorian.js'].branchData['1240'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1244'] = [];
  _$jscoverage['/gregorian.js'].branchData['1244'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1259'] = [];
  _$jscoverage['/gregorian.js'].branchData['1259'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1276'] = [];
  _$jscoverage['/gregorian.js'].branchData['1276'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1276'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1277'] = [];
  _$jscoverage['/gregorian.js'].branchData['1277'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1277'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1278'] = [];
  _$jscoverage['/gregorian.js'].branchData['1278'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1278'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1279'] = [];
  _$jscoverage['/gregorian.js'].branchData['1279'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1290'] = [];
  _$jscoverage['/gregorian.js'].branchData['1290'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1302'] = [];
  _$jscoverage['/gregorian.js'].branchData['1302'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1359'] = [];
  _$jscoverage['/gregorian.js'].branchData['1359'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1391'] = [];
  _$jscoverage['/gregorian.js'].branchData['1391'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1407'] = [];
  _$jscoverage['/gregorian.js'].branchData['1407'][1] = new BranchData();
}
_$jscoverage['/gregorian.js'].branchData['1407'][1].init(153, 36, 'nDays >= self.minimalDaysInFirstWeek');
function visit86_1407_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1407'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1391'][1].init(220, 21, 'dayOfMonth > monthLen');
function visit85_1391_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1391'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1359'][1].init(14, 1, 'f');
function visit84_1359_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1359'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1302'][1].init(45756, 9, '\'@DEBUG@\'');
function visit83_1302_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1302'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1290'][1].init(18, 19, 'field === undefined');
function visit82_1290_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1290'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1279'][1].init(61, 57, 'this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit81_1279_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1279'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1278'][2].init(138, 41, 'this.timezoneOffset == obj.timezoneOffset');
function visit80_1278_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1278'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1278'][1].init(61, 119, 'this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit79_1278_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1278'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1277'][2].init(75, 41, 'this.firstDayOfWeek == obj.firstDayOfWeek');
function visit78_1277_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1277'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1277'][1].init(51, 181, 'this.firstDayOfWeek == obj.firstDayOfWeek && this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit77_1277_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1277'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1276'][2].init(21, 31, 'this.getTime() == obj.getTime()');
function visit76_1276_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1276'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1276'][1].init(21, 233, 'this.getTime() == obj.getTime() && this.firstDayOfWeek == obj.firstDayOfWeek && this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit75_1276_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1276'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1259'][1].init(18, 23, 'this.time === undefined');
function visit74_1259_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1259'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1244'][1].init(782, 9, 'days != 0');
function visit73_1244_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1244'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1240'][1].init(667, 8, 'days < 0');
function visit72_1240_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1240'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1227'][3].init(58, 38, 'dayOfWeek > GregorianCalendar.SATURDAY');
function visit71_1227_3(result) {
  _$jscoverage['/gregorian.js'].branchData['1227'][3].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1227'][2].init(18, 36, 'dayOfWeek < GregorianCalendar.SUNDAY');
function visit70_1227_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1227'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1227'][1].init(18, 78, 'dayOfWeek < GregorianCalendar.SUNDAY || dayOfWeek > GregorianCalendar.SATURDAY');
function visit69_1227_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1227'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1211'][1].init(22, 15, 'weekOfYear == 1');
function visit68_1211_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1211'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1210'][1].init(330, 35, 'month == GregorianCalendar.DECEMBER');
function visit67_1210_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1210'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1207'][1].init(22, 16, 'weekOfYear >= 52');
function visit66_1207_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1207'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1206'][1].init(178, 34, 'month == GregorianCalendar.JANUARY');
function visit65_1206_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1206'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1185'][1].init(66, 26, 'weekYear == this.get(YEAR)');
function visit64_1185_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1185'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1153'][1].init(18, 53, 'this.minimalDaysInFirstWeek != minimalDaysInFirstWeek');
function visit63_1153_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1153'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1131'][1].init(18, 37, 'this.firstDayOfWeek != firstDayOfWeek');
function visit62_1131_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1131'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1121'][1].init(18, 37, 'this.timezoneOffset != timezoneOffset');
function visit61_1121_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1121'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['986'][1].init(18, 7, '!amount');
function visit60_986_1(result) {
  _$jscoverage['/gregorian.js'].branchData['986'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['841'][1].init(156, 10, 'yearAmount');
function visit59_841_1(result) {
  _$jscoverage['/gregorian.js'].branchData['841'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['837'][1].init(408, 15, 'field === MONTH');
function visit58_837_1(result) {
  _$jscoverage['/gregorian.js'].branchData['837'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['833'][1].init(250, 14, 'field === YEAR');
function visit57_833_1(result) {
  _$jscoverage['/gregorian.js'].branchData['833'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['826'][1].init(18, 7, '!amount');
function visit56_826_1(result) {
  _$jscoverage['/gregorian.js'].branchData['826'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['708'][1].init(34, 7, 'i < len');
function visit55_708_1(result) {
  _$jscoverage['/gregorian.js'].branchData['708'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['707'][1].init(137, 22, 'len < MILLISECONDS + 1');
function visit54_707_1(result) {
  _$jscoverage['/gregorian.js'].branchData['707'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['705'][1].init(59, 8, 'len == 2');
function visit53_705_1(result) {
  _$jscoverage['/gregorian.js'].branchData['705'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['592'][1].init(18, 23, 'this.time === undefined');
function visit52_592_1(result) {
  _$jscoverage['/gregorian.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['576'][1].init(405, 30, 'dayOfWeek != firstDayOfWeekCfg');
function visit51_576_1(result) {
  _$jscoverage['/gregorian.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['573'][1].init(249, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
function visit50_573_1(result) {
  _$jscoverage['/gregorian.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['567'][1].init(79, 23, 'self.isSet(DAY_OF_YEAR)');
function visit49_567_1(result) {
  _$jscoverage['/gregorian.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['559'][1].init(352, 9, 'dowim < 0');
function visit48_559_1(result) {
  _$jscoverage['/gregorian.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['553'][1].init(66, 32, 'self.isSet(DAY_OF_WEEK_IN_MONTH)');
function visit47_553_1(result) {
  _$jscoverage['/gregorian.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['546'][1].init(441, 30, 'dayOfWeek != firstDayOfWeekCfg');
function visit46_546_1(result) {
  _$jscoverage['/gregorian.js'].branchData['546'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['542'][1].init(271, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
function visit45_542_1(result) {
  _$jscoverage['/gregorian.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['537'][1].init(26, 25, 'self.isSet(WEEK_OF_MONTH)');
function visit44_537_1(result) {
  _$jscoverage['/gregorian.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['534'][1].init(22, 24, 'self.isSet(DAY_OF_MONTH)');
function visit43_534_1(result) {
  _$jscoverage['/gregorian.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['533'][1].init(1039, 17, 'self.isSet(MONTH)');
function visit42_533_1(result) {
  _$jscoverage['/gregorian.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['529'][1].init(928, 23, 'self.isSet(DAY_OF_WEEK)');
function visit41_529_1(result) {
  _$jscoverage['/gregorian.js'].branchData['529'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['517'][1].init(211, 33, 'month < GregorianCalendar.JANUARY');
function visit40_517_1(result) {
  _$jscoverage['/gregorian.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['514'][1].init(62, 34, 'month > GregorianCalendar.DECEMBER');
function visit39_514_1(result) {
  _$jscoverage['/gregorian.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['512'][1].init(247, 17, 'self.isSet(MONTH)');
function visit38_512_1(result) {
  _$jscoverage['/gregorian.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['495'][1].init(114, 20, '!this.fieldsComputed');
function visit37_495_1(result) {
  _$jscoverage['/gregorian.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['492'][1].init(18, 23, 'this.time === undefined');
function visit36_492_1(result) {
  _$jscoverage['/gregorian.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['466'][1].init(572, 25, 'fields[MILLISECONDS] || 0');
function visit35_466_1(result) {
  _$jscoverage['/gregorian.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['464'][1].init(492, 20, 'fields[SECONDS] || 0');
function visit34_464_1(result) {
  _$jscoverage['/gregorian.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['462'][1].init(415, 19, 'fields[MINUTE] || 0');
function visit33_462_1(result) {
  _$jscoverage['/gregorian.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['458'][1].init(266, 23, 'this.isSet(HOUR_OF_DAY)');
function visit32_458_1(result) {
  _$jscoverage['/gregorian.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['450'][1].init(18, 17, '!this.isSet(YEAR)');
function visit31_450_1(result) {
  _$jscoverage['/gregorian.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['432'][1].init(119, 29, 'fixedDate >= (nextJan1st - 7)');
function visit30_432_1(result) {
  _$jscoverage['/gregorian.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['430'][2].init(273, 36, 'nDays >= this.minimalDaysInFirstWeek');
function visit29_430_2(result) {
  _$jscoverage['/gregorian.js'].branchData['430'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['430'][1].init(273, 149, 'nDays >= this.minimalDaysInFirstWeek && fixedDate >= (nextJan1st - 7)');
function visit28_430_1(result) {
  _$jscoverage['/gregorian.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['425'][1].init(2485, 16, 'weekOfYear >= 52');
function visit27_425_1(result) {
  _$jscoverage['/gregorian.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['416'][1].init(2015, 15, 'weekOfYear == 0');
function visit26_416_1(result) {
  _$jscoverage['/gregorian.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['391'][1].init(988, 14, 'timeOfDay != 0');
function visit25_391_1(result) {
  _$jscoverage['/gregorian.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['373'][1].init(25, 13, 'timeOfDay < 0');
function visit24_373_1(result) {
  _$jscoverage['/gregorian.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['369'][1].init(329, 20, 'timeOfDay >= ONE_DAY');
function visit23_369_1(result) {
  _$jscoverage['/gregorian.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['354'][1].init(21, 32, 'this.fields[field] !== undefined');
function visit22_354_1(result) {
  _$jscoverage['/gregorian.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['340'][1].init(1257, 19, 'value === undefined');
function visit21_340_1(result) {
  _$jscoverage['/gregorian.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['322'][1].init(207, 10, 'value == 1');
function visit20_322_1(result) {
  _$jscoverage['/gregorian.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['309'][1].init(18, 31, 'MAX_VALUES[field] !== undefined');
function visit19_309_1(result) {
  _$jscoverage['/gregorian.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['291'][1].init(169, 23, 'field === WEEK_OF_MONTH');
function visit18_291_1(result) {
  _$jscoverage['/gregorian.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['286'][1].init(18, 31, 'MIN_VALUES[field] !== undefined');
function visit17_286_1(result) {
  _$jscoverage['/gregorian.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['85'][1].init(1254, 21, 'arguments.length >= 3');
function visit16_85_1(result) {
  _$jscoverage['/gregorian.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['67'][1].init(720, 39, 'timezoneOffset || locale.timezoneOffset');
function visit15_67_1(result) {
  _$jscoverage['/gregorian.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['50'][1].init(299, 23, 'locale || defaultLocale');
function visit14_50_1(result) {
  _$jscoverage['/gregorian.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['46'][1].init(204, 16, 'args.length >= 3');
function visit13_46_1(result) {
  _$jscoverage['/gregorian.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['43'][1].init(62, 26, 'S.isObject(timezoneOffset)');
function visit12_43_1(result) {
  _$jscoverage['/gregorian.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].lineData[6]++;
KISSY.add('date/gregorian', function(S, defaultLocale, Utils, Const, undefined) {
  _$jscoverage['/gregorian.js'].functionData[0]++;
  _$jscoverage['/gregorian.js'].lineData[7]++;
  var toInt = parseInt;
  _$jscoverage['/gregorian.js'].lineData[39]++;
  function GregorianCalendar(timezoneOffset, locale) {
    _$jscoverage['/gregorian.js'].functionData[1]++;
    _$jscoverage['/gregorian.js'].lineData[41]++;
    var args = S.makeArray(arguments);
    _$jscoverage['/gregorian.js'].lineData[43]++;
    if (visit12_43_1(S.isObject(timezoneOffset))) {
      _$jscoverage['/gregorian.js'].lineData[44]++;
      locale = timezoneOffset;
      _$jscoverage['/gregorian.js'].lineData[45]++;
      timezoneOffset = locale.timezoneOffset;
    } else {
      _$jscoverage['/gregorian.js'].lineData[46]++;
      if (visit13_46_1(args.length >= 3)) {
        _$jscoverage['/gregorian.js'].lineData[47]++;
        timezoneOffset = locale = null;
      }
    }
    _$jscoverage['/gregorian.js'].lineData[50]++;
    locale = visit14_50_1(locale || defaultLocale);
    _$jscoverage['/gregorian.js'].lineData[52]++;
    this.locale = locale;
    _$jscoverage['/gregorian.js'].lineData[54]++;
    this.fields = [];
    _$jscoverage['/gregorian.js'].lineData[61]++;
    this.time = undefined;
    _$jscoverage['/gregorian.js'].lineData[67]++;
    this.timezoneOffset = visit15_67_1(timezoneOffset || locale.timezoneOffset);
    _$jscoverage['/gregorian.js'].lineData[73]++;
    this.firstDayOfWeek = locale.firstDayOfWeek;
    _$jscoverage['/gregorian.js'].lineData[81]++;
    this.minimalDaysInFirstWeek = locale.minimalDaysInFirstWeek;
    _$jscoverage['/gregorian.js'].lineData[83]++;
    this.fieldsComputed = false;
    _$jscoverage['/gregorian.js'].lineData[85]++;
    if (visit16_85_1(arguments.length >= 3)) {
      _$jscoverage['/gregorian.js'].lineData[86]++;
      this.set.apply(this, args);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[90]++;
  S.mix(GregorianCalendar, Const);
  _$jscoverage['/gregorian.js'].lineData[92]++;
  S.mix(GregorianCalendar, {
  isLeapYear: Utils.isLeapYear, 
  YEAR: 1, 
  MONTH: 2, 
  DAY_OF_MONTH: 3, 
  HOUR_OF_DAY: 4, 
  MINUTES: 5, 
  SECONDS: 6, 
  MILLISECONDS: 7, 
  WEEK_OF_YEAR: 8, 
  WEEK_OF_MONTH: 9, 
  DAY_OF_YEAR: 10, 
  DAY_OF_WEEK: 11, 
  DAY_OF_WEEK_IN_MONTH: 12, 
  AM: 0, 
  PM: 1});
  _$jscoverage['/gregorian.js'].lineData[179]++;
  var fields = ['', 'Year', 'Month', 'DayOfMonth', 'HourOfDay', 'Minutes', 'Seconds', 'Milliseconds', 'WeekOfYear', 'WeekOfMonth', 'DayOfYear', 'DayOfWeek', 'DayOfWeekInMonth'];
  _$jscoverage['/gregorian.js'].lineData[187]++;
  var YEAR = GregorianCalendar.YEAR;
  _$jscoverage['/gregorian.js'].lineData[188]++;
  var MONTH = GregorianCalendar.MONTH;
  _$jscoverage['/gregorian.js'].lineData[189]++;
  var DAY_OF_MONTH = GregorianCalendar.DAY_OF_MONTH;
  _$jscoverage['/gregorian.js'].lineData[190]++;
  var HOUR_OF_DAY = GregorianCalendar.HOUR_OF_DAY;
  _$jscoverage['/gregorian.js'].lineData[191]++;
  var MINUTE = GregorianCalendar.MINUTES;
  _$jscoverage['/gregorian.js'].lineData[192]++;
  var SECONDS = GregorianCalendar.SECONDS;
  _$jscoverage['/gregorian.js'].lineData[194]++;
  var MILLISECONDS = GregorianCalendar.MILLISECONDS;
  _$jscoverage['/gregorian.js'].lineData[195]++;
  var DAY_OF_WEEK_IN_MONTH = GregorianCalendar.DAY_OF_WEEK_IN_MONTH;
  _$jscoverage['/gregorian.js'].lineData[196]++;
  var DAY_OF_YEAR = GregorianCalendar.DAY_OF_YEAR;
  _$jscoverage['/gregorian.js'].lineData[197]++;
  var DAY_OF_WEEK = GregorianCalendar.DAY_OF_WEEK;
  _$jscoverage['/gregorian.js'].lineData[199]++;
  var WEEK_OF_MONTH = GregorianCalendar.WEEK_OF_MONTH;
  _$jscoverage['/gregorian.js'].lineData[200]++;
  var WEEK_OF_YEAR = GregorianCalendar.WEEK_OF_YEAR;
  _$jscoverage['/gregorian.js'].lineData[202]++;
  var MONTH_LENGTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  _$jscoverage['/gregorian.js'].lineData[203]++;
  var LEAP_MONTH_LENGTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  _$jscoverage['/gregorian.js'].lineData[205]++;
  var ONE_SECOND = 1000;
  _$jscoverage['/gregorian.js'].lineData[206]++;
  var ONE_MINUTE = 60 * ONE_SECOND;
  _$jscoverage['/gregorian.js'].lineData[207]++;
  var ONE_HOUR = 60 * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[208]++;
  var ONE_DAY = 24 * ONE_HOUR;
  _$jscoverage['/gregorian.js'].lineData[209]++;
  var ONE_WEEK = ONE_DAY * 7;
  _$jscoverage['/gregorian.js'].lineData[211]++;
  var EPOCH_OFFSET = 719163;
  _$jscoverage['/gregorian.js'].lineData[213]++;
  var mod = Utils.mod, isLeapYear = Utils.isLeapYear, floorDivide = Math.floor;
  _$jscoverage['/gregorian.js'].lineData[218]++;
  var MIN_VALUES = [undefined, 1, GregorianCalendar.JANUARY, 1, 0, 0, 0, 0, 1, undefined, 1, GregorianCalendar.SUNDAY, 1];
  _$jscoverage['/gregorian.js'].lineData[236]++;
  var MAX_VALUES = [undefined, 292278994, GregorianCalendar.DECEMBER, undefined, 23, 59, 59, 999, undefined, undefined, undefined, GregorianCalendar.SATURDAY, undefined];
  _$jscoverage['/gregorian.js'].lineData[252]++;
  GregorianCalendar.prototype = {
  constructor: GregorianCalendar, 
  isLeapYear: function() {
  _$jscoverage['/gregorian.js'].functionData[2]++;
  _$jscoverage['/gregorian.js'].lineData[264]++;
  return isLeapYear(this.getYear());
}, 
  getLocale: function() {
  _$jscoverage['/gregorian.js'].functionData[3]++;
  _$jscoverage['/gregorian.js'].lineData[272]++;
  return this.locale;
}, 
  getActualMinimum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[4]++;
  _$jscoverage['/gregorian.js'].lineData[286]++;
  if (visit17_286_1(MIN_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[287]++;
    return MIN_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[290]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[291]++;
  if (visit18_291_1(field === WEEK_OF_MONTH)) {
    _$jscoverage['/gregorian.js'].lineData[292]++;
    var cal = new GregorianCalendar(fields[YEAR], fields[MONTH], 1);
    _$jscoverage['/gregorian.js'].lineData[293]++;
    return cal.get(WEEK_OF_MONTH);
  }
  _$jscoverage['/gregorian.js'].lineData[296]++;
  throw new Error('minimum value not defined!');
}, 
  getActualMaximum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[5]++;
  _$jscoverage['/gregorian.js'].lineData[309]++;
  if (visit19_309_1(MAX_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[310]++;
    return MAX_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[312]++;
  var value, fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[314]++;
  switch (field) {
    case DAY_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[316]++;
      value = getMonthLength(fields[YEAR], fields[MONTH]);
      _$jscoverage['/gregorian.js'].lineData[317]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[320]++;
      var endOfYear = new GregorianCalendar(fields[YEAR], GregorianCalendar.DECEMBER, 31);
      _$jscoverage['/gregorian.js'].lineData[321]++;
      value = endOfYear.get(WEEK_OF_YEAR);
      _$jscoverage['/gregorian.js'].lineData[322]++;
      if (visit20_322_1(value == 1)) {
        _$jscoverage['/gregorian.js'].lineData[323]++;
        value = 52;
      }
      _$jscoverage['/gregorian.js'].lineData[325]++;
      break;
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[328]++;
      var endOfMonth = new GregorianCalendar(fields[YEAR], fields[MONTH], getMonthLength(fields[YEAR], fields[MONTH]));
      _$jscoverage['/gregorian.js'].lineData[329]++;
      value = endOfMonth.get(WEEK_OF_MONTH);
      _$jscoverage['/gregorian.js'].lineData[330]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[333]++;
      value = getYearLength(fields[YEAR]);
      _$jscoverage['/gregorian.js'].lineData[334]++;
      break;
    case DAY_OF_WEEK_IN_MONTH:
      _$jscoverage['/gregorian.js'].lineData[337]++;
      value = toInt((getMonthLength(fields[YEAR], fields[MONTH]) - 1) / 7) + 1;
      _$jscoverage['/gregorian.js'].lineData[338]++;
      break;
  }
  _$jscoverage['/gregorian.js'].lineData[340]++;
  if (visit21_340_1(value === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[341]++;
    throw new Error('maximum value not defined!');
  }
  _$jscoverage['/gregorian.js'].lineData[343]++;
  return value;
}, 
  isSet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[6]++;
  _$jscoverage['/gregorian.js'].lineData[354]++;
  return visit22_354_1(this.fields[field] !== undefined);
}, 
  computeFields: function() {
  _$jscoverage['/gregorian.js'].functionData[7]++;
  _$jscoverage['/gregorian.js'].lineData[363]++;
  var time = this.time;
  _$jscoverage['/gregorian.js'].lineData[364]++;
  var timezoneOffset = this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[365]++;
  var fixedDate = toInt(timezoneOffset / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[366]++;
  var timeOfDay = timezoneOffset % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[367]++;
  fixedDate += toInt(time / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[368]++;
  timeOfDay += time % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[369]++;
  if (visit23_369_1(timeOfDay >= ONE_DAY)) {
    _$jscoverage['/gregorian.js'].lineData[370]++;
    timeOfDay -= ONE_DAY;
    _$jscoverage['/gregorian.js'].lineData[371]++;
    fixedDate++;
  } else {
    _$jscoverage['/gregorian.js'].lineData[373]++;
    while (visit24_373_1(timeOfDay < 0)) {
      _$jscoverage['/gregorian.js'].lineData[374]++;
      timeOfDay += ONE_DAY;
      _$jscoverage['/gregorian.js'].lineData[375]++;
      fixedDate--;
    }
  }
  _$jscoverage['/gregorian.js'].lineData[379]++;
  fixedDate += EPOCH_OFFSET;
  _$jscoverage['/gregorian.js'].lineData[381]++;
  var date = Utils.getGregorianDateFromFixedDate(fixedDate);
  _$jscoverage['/gregorian.js'].lineData[383]++;
  var year = date.year;
  _$jscoverage['/gregorian.js'].lineData[385]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[386]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[387]++;
  fields[MONTH] = date.month;
  _$jscoverage['/gregorian.js'].lineData[388]++;
  fields[DAY_OF_MONTH] = date.dayOfMonth;
  _$jscoverage['/gregorian.js'].lineData[389]++;
  fields[DAY_OF_WEEK] = date.dayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[391]++;
  if (visit25_391_1(timeOfDay != 0)) {
    _$jscoverage['/gregorian.js'].lineData[392]++;
    fields[HOUR_OF_DAY] = toInt(timeOfDay / ONE_HOUR);
    _$jscoverage['/gregorian.js'].lineData[393]++;
    var r = timeOfDay % ONE_HOUR;
    _$jscoverage['/gregorian.js'].lineData[394]++;
    fields[MINUTE] = toInt(r / ONE_MINUTE);
    _$jscoverage['/gregorian.js'].lineData[395]++;
    r %= ONE_MINUTE;
    _$jscoverage['/gregorian.js'].lineData[396]++;
    fields[SECONDS] = toInt(r / ONE_SECOND);
    _$jscoverage['/gregorian.js'].lineData[397]++;
    fields[MILLISECONDS] = r % ONE_SECOND;
  } else {
    _$jscoverage['/gregorian.js'].lineData[399]++;
    fields[HOUR_OF_DAY] = fields[MINUTE] = fields[SECONDS] = fields[MILLISECONDS] = 0;
  }
  _$jscoverage['/gregorian.js'].lineData[406]++;
  var fixedDateJan1 = Utils.getFixedDate(year, GregorianCalendar.JANUARY, 1);
  _$jscoverage['/gregorian.js'].lineData[407]++;
  var dayOfYear = fixedDate - fixedDateJan1 + 1;
  _$jscoverage['/gregorian.js'].lineData[408]++;
  var fixDateMonth1 = fixedDate - date.dayOfMonth + 1;
  _$jscoverage['/gregorian.js'].lineData[410]++;
  fields[DAY_OF_YEAR] = dayOfYear;
  _$jscoverage['/gregorian.js'].lineData[411]++;
  fields[DAY_OF_WEEK_IN_MONTH] = toInt((date.dayOfMonth - 1) / 7) + 1;
  _$jscoverage['/gregorian.js'].lineData[413]++;
  var weekOfYear = getWeekNumber(this, fixedDateJan1, fixedDate);
  _$jscoverage['/gregorian.js'].lineData[416]++;
  if (visit26_416_1(weekOfYear == 0)) {
    _$jscoverage['/gregorian.js'].lineData[420]++;
    var fixedDec31 = fixedDateJan1 - 1;
    _$jscoverage['/gregorian.js'].lineData[421]++;
    var prevJan1 = fixedDateJan1 - getYearLength(year - 1);
    _$jscoverage['/gregorian.js'].lineData[422]++;
    weekOfYear = getWeekNumber(this, prevJan1, fixedDec31);
  } else {
    _$jscoverage['/gregorian.js'].lineData[425]++;
    if (visit27_425_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[426]++;
      var nextJan1 = fixedDateJan1 + getYearLength(year);
      _$jscoverage['/gregorian.js'].lineData[427]++;
      var nextJan1st = getDayOfWeekDateOnOrBefore(nextJan1 + 6, this.firstDayOfWeek);
      _$jscoverage['/gregorian.js'].lineData[428]++;
      var nDays = nextJan1st - nextJan1;
      _$jscoverage['/gregorian.js'].lineData[430]++;
      if (visit28_430_1(visit29_430_2(nDays >= this.minimalDaysInFirstWeek) && visit30_432_1(fixedDate >= (nextJan1st - 7)))) {
        _$jscoverage['/gregorian.js'].lineData[434]++;
        weekOfYear = 1;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[438]++;
  fields[WEEK_OF_YEAR] = weekOfYear;
  _$jscoverage['/gregorian.js'].lineData[439]++;
  fields[WEEK_OF_MONTH] = getWeekNumber(this, fixDateMonth1, fixedDate);
  _$jscoverage['/gregorian.js'].lineData[441]++;
  this.fieldsComputed = true;
}, 
  'computeTime': function() {
  _$jscoverage['/gregorian.js'].functionData[8]++;
  _$jscoverage['/gregorian.js'].lineData[450]++;
  if (visit31_450_1(!this.isSet(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[451]++;
    throw new Error('year must be set for KISSY GregorianCalendar');
  }
  _$jscoverage['/gregorian.js'].lineData[454]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[456]++;
  var year = fields[YEAR];
  _$jscoverage['/gregorian.js'].lineData[457]++;
  var timeOfDay = 0;
  _$jscoverage['/gregorian.js'].lineData[458]++;
  if (visit32_458_1(this.isSet(HOUR_OF_DAY))) {
    _$jscoverage['/gregorian.js'].lineData[459]++;
    timeOfDay += fields[HOUR_OF_DAY];
  }
  _$jscoverage['/gregorian.js'].lineData[461]++;
  timeOfDay *= 60;
  _$jscoverage['/gregorian.js'].lineData[462]++;
  timeOfDay += visit33_462_1(fields[MINUTE] || 0);
  _$jscoverage['/gregorian.js'].lineData[463]++;
  timeOfDay *= 60;
  _$jscoverage['/gregorian.js'].lineData[464]++;
  timeOfDay += visit34_464_1(fields[SECONDS] || 0);
  _$jscoverage['/gregorian.js'].lineData[465]++;
  timeOfDay *= 1000;
  _$jscoverage['/gregorian.js'].lineData[466]++;
  timeOfDay += visit35_466_1(fields[MILLISECONDS] || 0);
  _$jscoverage['/gregorian.js'].lineData[468]++;
  var fixedDate = 0;
  _$jscoverage['/gregorian.js'].lineData[470]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[472]++;
  fixedDate = fixedDate + this.getFixedDate();
  _$jscoverage['/gregorian.js'].lineData[475]++;
  var millis = (fixedDate - EPOCH_OFFSET) * ONE_DAY + timeOfDay;
  _$jscoverage['/gregorian.js'].lineData[477]++;
  millis -= this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[479]++;
  this.time = millis;
  _$jscoverage['/gregorian.js'].lineData[481]++;
  this.computeFields();
}, 
  complete: function() {
  _$jscoverage['/gregorian.js'].functionData[9]++;
  _$jscoverage['/gregorian.js'].lineData[492]++;
  if (visit36_492_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[493]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[495]++;
  if (visit37_495_1(!this.fieldsComputed)) {
    _$jscoverage['/gregorian.js'].lineData[496]++;
    this.computeFields();
  }
}, 
  getFixedDate: function() {
  _$jscoverage['/gregorian.js'].functionData[10]++;
  _$jscoverage['/gregorian.js'].lineData[502]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[504]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[506]++;
  var firstDayOfWeekCfg = self.firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[508]++;
  var year = fields[YEAR];
  _$jscoverage['/gregorian.js'].lineData[510]++;
  var month = GregorianCalendar.JANUARY;
  _$jscoverage['/gregorian.js'].lineData[512]++;
  if (visit38_512_1(self.isSet(MONTH))) {
    _$jscoverage['/gregorian.js'].lineData[513]++;
    month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[514]++;
    if (visit39_514_1(month > GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[515]++;
      year += toInt(month / 12);
      _$jscoverage['/gregorian.js'].lineData[516]++;
      month %= 12;
    } else {
      _$jscoverage['/gregorian.js'].lineData[517]++;
      if (visit40_517_1(month < GregorianCalendar.JANUARY)) {
        _$jscoverage['/gregorian.js'].lineData[518]++;
        year += floorDivide(month / 12);
        _$jscoverage['/gregorian.js'].lineData[519]++;
        month = mod(month, 12);
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[525]++;
  var fixedDate = Utils.getFixedDate(year, month, 1);
  _$jscoverage['/gregorian.js'].lineData[527]++;
  var dayOfWeek = self.firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[529]++;
  if (visit41_529_1(self.isSet(DAY_OF_WEEK))) {
    _$jscoverage['/gregorian.js'].lineData[530]++;
    dayOfWeek = fields[DAY_OF_WEEK];
  }
  _$jscoverage['/gregorian.js'].lineData[533]++;
  if (visit42_533_1(self.isSet(MONTH))) {
    _$jscoverage['/gregorian.js'].lineData[534]++;
    if (visit43_534_1(self.isSet(DAY_OF_MONTH))) {
      _$jscoverage['/gregorian.js'].lineData[535]++;
      fixedDate += fields[DAY_OF_MONTH] - 1;
    } else {
      _$jscoverage['/gregorian.js'].lineData[537]++;
      if (visit44_537_1(self.isSet(WEEK_OF_MONTH))) {
        _$jscoverage['/gregorian.js'].lineData[538]++;
        var firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
        _$jscoverage['/gregorian.js'].lineData[542]++;
        if (visit45_542_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
          _$jscoverage['/gregorian.js'].lineData[543]++;
          firstDayOfWeek -= 7;
        }
        _$jscoverage['/gregorian.js'].lineData[546]++;
        if (visit46_546_1(dayOfWeek != firstDayOfWeekCfg)) {
          _$jscoverage['/gregorian.js'].lineData[547]++;
          firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
        }
        _$jscoverage['/gregorian.js'].lineData[550]++;
        fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_MONTH] - 1);
      } else {
        _$jscoverage['/gregorian.js'].lineData[552]++;
        var dowim;
        _$jscoverage['/gregorian.js'].lineData[553]++;
        if (visit47_553_1(self.isSet(DAY_OF_WEEK_IN_MONTH))) {
          _$jscoverage['/gregorian.js'].lineData[554]++;
          dowim = fields[DAY_OF_WEEK_IN_MONTH];
        } else {
          _$jscoverage['/gregorian.js'].lineData[556]++;
          dowim = 1;
        }
        _$jscoverage['/gregorian.js'].lineData[558]++;
        var lastDate = (7 * dowim);
        _$jscoverage['/gregorian.js'].lineData[559]++;
        if (visit48_559_1(dowim < 0)) {
          _$jscoverage['/gregorian.js'].lineData[560]++;
          lastDate = getMonthLength(year, month) + (7 * (dowim + 1));
        }
        _$jscoverage['/gregorian.js'].lineData[562]++;
        fixedDate = getDayOfWeekDateOnOrBefore(fixedDate + lastDate - 1, dayOfWeek);
      }
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[567]++;
    if (visit49_567_1(self.isSet(DAY_OF_YEAR))) {
      _$jscoverage['/gregorian.js'].lineData[568]++;
      fixedDate += fields[DAY_OF_YEAR] - 1;
    } else {
      _$jscoverage['/gregorian.js'].lineData[570]++;
      firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
      _$jscoverage['/gregorian.js'].lineData[573]++;
      if (visit50_573_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
        _$jscoverage['/gregorian.js'].lineData[574]++;
        firstDayOfWeek -= 7;
      }
      _$jscoverage['/gregorian.js'].lineData[576]++;
      if (visit51_576_1(dayOfWeek != firstDayOfWeekCfg)) {
        _$jscoverage['/gregorian.js'].lineData[577]++;
        firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
      }
      _$jscoverage['/gregorian.js'].lineData[579]++;
      fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_YEAR] - 1);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[583]++;
  return fixedDate;
}, 
  getTime: function() {
  _$jscoverage['/gregorian.js'].functionData[11]++;
  _$jscoverage['/gregorian.js'].lineData[592]++;
  if (visit52_592_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[593]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[595]++;
  return this.time;
}, 
  'setTime': function(time) {
  _$jscoverage['/gregorian.js'].functionData[12]++;
  _$jscoverage['/gregorian.js'].lineData[603]++;
  this.time = time;
  _$jscoverage['/gregorian.js'].lineData[604]++;
  this.fieldsComputed = false;
  _$jscoverage['/gregorian.js'].lineData[605]++;
  this.complete();
}, 
  get: function(field) {
  _$jscoverage['/gregorian.js'].functionData[13]++;
  _$jscoverage['/gregorian.js'].lineData[614]++;
  this.complete();
  _$jscoverage['/gregorian.js'].lineData[615]++;
  return this.fields[field];
}, 
  set: function(field, v) {
  _$jscoverage['/gregorian.js'].functionData[14]++;
  _$jscoverage['/gregorian.js'].lineData[704]++;
  var len = arguments.length;
  _$jscoverage['/gregorian.js'].lineData[705]++;
  if (visit53_705_1(len == 2)) {
    _$jscoverage['/gregorian.js'].lineData[706]++;
    this.fields[field] = v;
  } else {
    _$jscoverage['/gregorian.js'].lineData[707]++;
    if (visit54_707_1(len < MILLISECONDS + 1)) {
      _$jscoverage['/gregorian.js'].lineData[708]++;
      for (var i = 0; visit55_708_1(i < len); i++) {
        _$jscoverage['/gregorian.js'].lineData[709]++;
        this.fields[YEAR + i] = arguments[i];
      }
    } else {
      _$jscoverage['/gregorian.js'].lineData[712]++;
      throw new Error('illegal arguments for KISSY GregorianCalendar set');
    }
  }
  _$jscoverage['/gregorian.js'].lineData[714]++;
  this.time = undefined;
}, 
  add: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[15]++;
  _$jscoverage['/gregorian.js'].lineData[826]++;
  if (visit56_826_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[827]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[829]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[830]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[832]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[833]++;
  if (visit57_833_1(field === YEAR)) {
    _$jscoverage['/gregorian.js'].lineData[834]++;
    value += amount;
    _$jscoverage['/gregorian.js'].lineData[835]++;
    self.set(YEAR, value);
    _$jscoverage['/gregorian.js'].lineData[836]++;
    adjustDayOfMonth(self);
  } else {
    _$jscoverage['/gregorian.js'].lineData[837]++;
    if (visit58_837_1(field === MONTH)) {
      _$jscoverage['/gregorian.js'].lineData[838]++;
      value += amount;
      _$jscoverage['/gregorian.js'].lineData[839]++;
      var yearAmount = floorDivide(value / 12);
      _$jscoverage['/gregorian.js'].lineData[840]++;
      value = mod(value, 12);
      _$jscoverage['/gregorian.js'].lineData[841]++;
      if (visit59_841_1(yearAmount)) {
        _$jscoverage['/gregorian.js'].lineData[842]++;
        self.set(YEAR, fields[YEAR] + yearAmount);
      }
      _$jscoverage['/gregorian.js'].lineData[844]++;
      self.set(MONTH, value);
      _$jscoverage['/gregorian.js'].lineData[845]++;
      adjustDayOfMonth(self);
    } else {
      _$jscoverage['/gregorian.js'].lineData[847]++;
      switch (field) {
        case HOUR_OF_DAY:
          _$jscoverage['/gregorian.js'].lineData[849]++;
          amount *= ONE_HOUR;
          _$jscoverage['/gregorian.js'].lineData[850]++;
          break;
        case MINUTE:
          _$jscoverage['/gregorian.js'].lineData[852]++;
          amount *= ONE_MINUTE;
          _$jscoverage['/gregorian.js'].lineData[853]++;
          break;
        case SECONDS:
          _$jscoverage['/gregorian.js'].lineData[855]++;
          amount *= ONE_SECOND;
          _$jscoverage['/gregorian.js'].lineData[856]++;
          break;
        case MILLISECONDS:
          _$jscoverage['/gregorian.js'].lineData[858]++;
          break;
        case WEEK_OF_MONTH:
        case WEEK_OF_YEAR:
        case DAY_OF_WEEK_IN_MONTH:
          _$jscoverage['/gregorian.js'].lineData[862]++;
          amount *= ONE_WEEK;
          _$jscoverage['/gregorian.js'].lineData[863]++;
          break;
        case DAY_OF_WEEK:
        case DAY_OF_YEAR:
        case DAY_OF_MONTH:
          _$jscoverage['/gregorian.js'].lineData[867]++;
          amount *= ONE_DAY;
          _$jscoverage['/gregorian.js'].lineData[868]++;
          break;
        default:
          _$jscoverage['/gregorian.js'].lineData[870]++;
          throw new Error('illegal field for add');
          _$jscoverage['/gregorian.js'].lineData[871]++;
          break;
      }
      _$jscoverage['/gregorian.js'].lineData[873]++;
      self.setTime(self.time + amount);
    }
  }
}, 
  getRolledValue: function(value, amount, min, max) {
  _$jscoverage['/gregorian.js'].functionData[16]++;
  _$jscoverage['/gregorian.js'].lineData[958]++;
  var diff = value - min;
  _$jscoverage['/gregorian.js'].lineData[959]++;
  var range = max - min + 1;
  _$jscoverage['/gregorian.js'].lineData[960]++;
  amount %= range;
  _$jscoverage['/gregorian.js'].lineData[961]++;
  return min + (diff + amount + range) % range;
}, 
  roll: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[17]++;
  _$jscoverage['/gregorian.js'].lineData[986]++;
  if (visit60_986_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[987]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[989]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[991]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[992]++;
  var min = self.getActualMinimum(field);
  _$jscoverage['/gregorian.js'].lineData[993]++;
  var max = self.getActualMaximum(field);
  _$jscoverage['/gregorian.js'].lineData[994]++;
  value = self.getRolledValue(value, amount, min, max);
  _$jscoverage['/gregorian.js'].lineData[996]++;
  self.set(field, value);
  _$jscoverage['/gregorian.js'].lineData[999]++;
  switch (field) {
    case MONTH:
      _$jscoverage['/gregorian.js'].lineData[1001]++;
      adjustDayOfMonth(self);
      _$jscoverage['/gregorian.js'].lineData[1002]++;
      break;
    default:
      _$jscoverage['/gregorian.js'].lineData[1005]++;
      self.updateFieldsBySet(field);
      _$jscoverage['/gregorian.js'].lineData[1006]++;
      break;
  }
}, 
  updateFieldsBySet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[18]++;
  _$jscoverage['/gregorian.js'].lineData[1091]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1092]++;
  switch (field) {
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[1094]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1095]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1097]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1098]++;
      break;
    case DAY_OF_WEEK:
      _$jscoverage['/gregorian.js'].lineData[1100]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1101]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1103]++;
      fields[DAY_OF_YEAR] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1104]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1105]++;
      break;
  }
}, 
  getTimezoneOffset: function() {
  _$jscoverage['/gregorian.js'].functionData[19]++;
  _$jscoverage['/gregorian.js'].lineData[1114]++;
  return this.timezoneOffset;
}, 
  'setTimezoneOffset': function(timezoneOffset) {
  _$jscoverage['/gregorian.js'].functionData[20]++;
  _$jscoverage['/gregorian.js'].lineData[1121]++;
  if (visit61_1121_1(this.timezoneOffset != timezoneOffset)) {
    _$jscoverage['/gregorian.js'].lineData[1122]++;
    this.fieldsComputed = undefined;
    _$jscoverage['/gregorian.js'].lineData[1123]++;
    this.timezoneOffset = timezoneOffset;
  }
}, 
  'setFirstDayOfWeek': function(firstDayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[21]++;
  _$jscoverage['/gregorian.js'].lineData[1131]++;
  if (visit62_1131_1(this.firstDayOfWeek != firstDayOfWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1132]++;
    this.firstDayOfWeek = firstDayOfWeek;
    _$jscoverage['/gregorian.js'].lineData[1133]++;
    this.fieldsComputed = false;
  }
}, 
  'getFirstDayOfWeek': function() {
  _$jscoverage['/gregorian.js'].functionData[22]++;
  _$jscoverage['/gregorian.js'].lineData[1142]++;
  return this.firstDayOfWeek;
}, 
  'setMinimalDaysInFirstWeek': function(minimalDaysInFirstWeek) {
  _$jscoverage['/gregorian.js'].functionData[23]++;
  _$jscoverage['/gregorian.js'].lineData[1153]++;
  if (visit63_1153_1(this.minimalDaysInFirstWeek != minimalDaysInFirstWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1154]++;
    this.minimalDaysInFirstWeek = minimalDaysInFirstWeek;
    _$jscoverage['/gregorian.js'].lineData[1155]++;
    this.fieldsComputed = false;
  }
}, 
  'getMinimalDaysInFirstWeek': function() {
  _$jscoverage['/gregorian.js'].functionData[24]++;
  _$jscoverage['/gregorian.js'].lineData[1167]++;
  return this.minimalDaysInFirstWeek;
}, 
  'getWeeksInWeekYear': function() {
  _$jscoverage['/gregorian.js'].functionData[25]++;
  _$jscoverage['/gregorian.js'].lineData[1184]++;
  var weekYear = this.getWeekYear();
  _$jscoverage['/gregorian.js'].lineData[1185]++;
  if (visit64_1185_1(weekYear == this.get(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[1186]++;
    return this.getActualMaximum(WEEK_OF_YEAR);
  }
  _$jscoverage['/gregorian.js'].lineData[1189]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1190]++;
  gc.setWeekDate(weekYear, 2, this.get(DAY_OF_WEEK));
  _$jscoverage['/gregorian.js'].lineData[1191]++;
  return gc.getActualMaximum(WEEK_OF_YEAR);
}, 
  getWeekYear: function() {
  _$jscoverage['/gregorian.js'].functionData[26]++;
  _$jscoverage['/gregorian.js'].lineData[1203]++;
  var year = this.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1204]++;
  var weekOfYear = this.get(WEEK_OF_YEAR);
  _$jscoverage['/gregorian.js'].lineData[1205]++;
  var month = this.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1206]++;
  if (visit65_1206_1(month == GregorianCalendar.JANUARY)) {
    _$jscoverage['/gregorian.js'].lineData[1207]++;
    if (visit66_1207_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[1208]++;
      --year;
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[1210]++;
    if (visit67_1210_1(month == GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[1211]++;
      if (visit68_1211_1(weekOfYear == 1)) {
        _$jscoverage['/gregorian.js'].lineData[1212]++;
        ++year;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1215]++;
  return year;
}, 
  'setWeekDate': function(weekYear, weekOfYear, dayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[27]++;
  _$jscoverage['/gregorian.js'].lineData[1227]++;
  if (visit69_1227_1(visit70_1227_2(dayOfWeek < GregorianCalendar.SUNDAY) || visit71_1227_3(dayOfWeek > GregorianCalendar.SATURDAY))) {
    _$jscoverage['/gregorian.js'].lineData[1228]++;
    throw new Error("invalid dayOfWeek: " + dayOfWeek);
  }
  _$jscoverage['/gregorian.js'].lineData[1230]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1233]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1234]++;
  gc.clear();
  _$jscoverage['/gregorian.js'].lineData[1235]++;
  gc.setTimezoneOffset(0);
  _$jscoverage['/gregorian.js'].lineData[1236]++;
  gc.set(YEAR, weekYear);
  _$jscoverage['/gregorian.js'].lineData[1237]++;
  gc.set(WEEK_OF_YEAR, 1);
  _$jscoverage['/gregorian.js'].lineData[1238]++;
  gc.set(DAY_OF_WEEK, this.getFirstDayOfWeek());
  _$jscoverage['/gregorian.js'].lineData[1239]++;
  var days = dayOfWeek - this.getFirstDayOfWeek();
  _$jscoverage['/gregorian.js'].lineData[1240]++;
  if (visit72_1240_1(days < 0)) {
    _$jscoverage['/gregorian.js'].lineData[1241]++;
    days += 7;
  }
  _$jscoverage['/gregorian.js'].lineData[1243]++;
  days += 7 * (weekOfYear - 1);
  _$jscoverage['/gregorian.js'].lineData[1244]++;
  if (visit73_1244_1(days != 0)) {
    _$jscoverage['/gregorian.js'].lineData[1245]++;
    gc.add(DAY_OF_YEAR, days);
  } else {
    _$jscoverage['/gregorian.js'].lineData[1247]++;
    gc.complete();
  }
  _$jscoverage['/gregorian.js'].lineData[1249]++;
  fields[YEAR] = gc.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1250]++;
  fields[MONTH] = gc.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1251]++;
  fields[DAY_OF_MONTH] = gc.get(DAY_OF_MONTH);
  _$jscoverage['/gregorian.js'].lineData[1252]++;
  this.complete();
}, 
  clone: function() {
  _$jscoverage['/gregorian.js'].functionData[28]++;
  _$jscoverage['/gregorian.js'].lineData[1259]++;
  if (visit74_1259_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1260]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[1262]++;
  var cal = new GregorianCalendar(this.timezoneOffset, this.locale);
  _$jscoverage['/gregorian.js'].lineData[1263]++;
  cal.setTime(this.time);
  _$jscoverage['/gregorian.js'].lineData[1264]++;
  return cal;
}, 
  equals: function(obj) {
  _$jscoverage['/gregorian.js'].functionData[29]++;
  _$jscoverage['/gregorian.js'].lineData[1276]++;
  return visit75_1276_1(visit76_1276_2(this.getTime() == obj.getTime()) && visit77_1277_1(visit78_1277_2(this.firstDayOfWeek == obj.firstDayOfWeek) && visit79_1278_1(visit80_1278_2(this.timezoneOffset == obj.timezoneOffset) && visit81_1279_1(this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek))));
}, 
  clear: function(field) {
  _$jscoverage['/gregorian.js'].functionData[30]++;
  _$jscoverage['/gregorian.js'].lineData[1290]++;
  if (visit82_1290_1(field === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1291]++;
    this.field = [];
  } else {
    _$jscoverage['/gregorian.js'].lineData[1293]++;
    this.fields[field] = undefined;
  }
  _$jscoverage['/gregorian.js'].lineData[1295]++;
  this.time = undefined;
  _$jscoverage['/gregorian.js'].lineData[1296]++;
  this.fieldsComputed = false;
}};
  _$jscoverage['/gregorian.js'].lineData[1300]++;
  var GregorianCalendarProto = GregorianCalendar.prototype;
  _$jscoverage['/gregorian.js'].lineData[1302]++;
  if (visit83_1302_1('@DEBUG@')) {
    _$jscoverage['/gregorian.js'].lineData[1304]++;
    GregorianCalendarProto.getDayOfMonth = GregorianCalendarProto.getHourOfDay = GregorianCalendarProto.getWeekOfYear = GregorianCalendarProto.getWeekOfMonth = GregorianCalendarProto.getDayOfYear = GregorianCalendarProto.getDayOfWeek = GregorianCalendarProto.getDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1312]++;
    GregorianCalendarProto.addDayOfMonth = GregorianCalendarProto.addMonth = GregorianCalendarProto.addYear = GregorianCalendarProto.addMinutes = GregorianCalendarProto.addSeconds = GregorianCalendarProto.addMilliSeconds = GregorianCalendarProto.addHourOfDay = GregorianCalendarProto.addWeekOfYear = GregorianCalendarProto.addWeekOfMonth = GregorianCalendarProto.addDayOfYear = GregorianCalendarProto.addDayOfWeek = GregorianCalendarProto.addDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1325]++;
    GregorianCalendarProto.isSetDayOfMonth = GregorianCalendarProto.isSetMonth = GregorianCalendarProto.isSetYear = GregorianCalendarProto.isSetMinutes = GregorianCalendarProto.isSetSeconds = GregorianCalendarProto.isSetMilliSeconds = GregorianCalendarProto.isSetHourOfDay = GregorianCalendarProto.isSetWeekOfYear = GregorianCalendarProto.isSetWeekOfMonth = GregorianCalendarProto.isSetDayOfYear = GregorianCalendarProto.isSetDayOfWeek = GregorianCalendarProto.isSetDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1337]++;
    GregorianCalendarProto.setDayOfMonth = GregorianCalendarProto.setHourOfDay = GregorianCalendarProto.setWeekOfYear = GregorianCalendarProto.setWeekOfMonth = GregorianCalendarProto.setDayOfYear = GregorianCalendarProto.setDayOfWeek = GregorianCalendarProto.setDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1345]++;
    GregorianCalendarProto.rollDayOfMonth = GregorianCalendarProto.rollMonth = GregorianCalendarProto.rollYear = GregorianCalendarProto.rollMinutes = GregorianCalendarProto.rollSeconds = GregorianCalendarProto.rollMilliSeconds = GregorianCalendarProto.rollHourOfDay = GregorianCalendarProto.rollWeekOfYear = GregorianCalendarProto.rollWeekOfMonth = GregorianCalendarProto.rollDayOfYear = GregorianCalendarProto.rollDayOfWeek = GregorianCalendarProto.rollDayOfWeekInMonth = S.noop;
  }
  _$jscoverage['/gregorian.js'].lineData[1358]++;
  S.each(fields, function(f, index) {
  _$jscoverage['/gregorian.js'].functionData[31]++;
  _$jscoverage['/gregorian.js'].lineData[1359]++;
  if (visit84_1359_1(f)) {
    _$jscoverage['/gregorian.js'].lineData[1360]++;
    GregorianCalendarProto['get' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[32]++;
  _$jscoverage['/gregorian.js'].lineData[1361]++;
  return this.get(index);
};
    _$jscoverage['/gregorian.js'].lineData[1364]++;
    GregorianCalendarProto['isSet' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[33]++;
  _$jscoverage['/gregorian.js'].lineData[1365]++;
  return this.isSet(index);
};
    _$jscoverage['/gregorian.js'].lineData[1368]++;
    GregorianCalendarProto['set' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[34]++;
  _$jscoverage['/gregorian.js'].lineData[1369]++;
  return this.set(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1372]++;
    GregorianCalendarProto['add' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[35]++;
  _$jscoverage['/gregorian.js'].lineData[1373]++;
  return this.add(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1376]++;
    GregorianCalendarProto['roll' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[36]++;
  _$jscoverage['/gregorian.js'].lineData[1377]++;
  return this.roll(index, v);
};
  }
});
  _$jscoverage['/gregorian.js'].lineData[1385]++;
  function adjustDayOfMonth(self) {
    _$jscoverage['/gregorian.js'].functionData[37]++;
    _$jscoverage['/gregorian.js'].lineData[1386]++;
    var fields = self.fields;
    _$jscoverage['/gregorian.js'].lineData[1387]++;
    var year = fields[YEAR];
    _$jscoverage['/gregorian.js'].lineData[1388]++;
    var month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[1389]++;
    var monthLen = getMonthLength(year, month);
    _$jscoverage['/gregorian.js'].lineData[1390]++;
    var dayOfMonth = fields[DAY_OF_MONTH];
    _$jscoverage['/gregorian.js'].lineData[1391]++;
    if (visit85_1391_1(dayOfMonth > monthLen)) {
      _$jscoverage['/gregorian.js'].lineData[1392]++;
      self.set(DAY_OF_MONTH, monthLen);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1396]++;
  function getMonthLength(year, month) {
    _$jscoverage['/gregorian.js'].functionData[38]++;
    _$jscoverage['/gregorian.js'].lineData[1397]++;
    return isLeapYear(year) ? LEAP_MONTH_LENGTH[month] : MONTH_LENGTH[month];
  }
  _$jscoverage['/gregorian.js'].lineData[1400]++;
  function getYearLength(year) {
    _$jscoverage['/gregorian.js'].functionData[39]++;
    _$jscoverage['/gregorian.js'].lineData[1401]++;
    return isLeapYear(year) ? 366 : 365;
  }
  _$jscoverage['/gregorian.js'].lineData[1404]++;
  function getWeekNumber(self, fixedDay1, fixedDate) {
    _$jscoverage['/gregorian.js'].functionData[40]++;
    _$jscoverage['/gregorian.js'].lineData[1405]++;
    var fixedDay1st = getDayOfWeekDateOnOrBefore(fixedDay1 + 6, self.firstDayOfWeek);
    _$jscoverage['/gregorian.js'].lineData[1406]++;
    var nDays = (fixedDay1st - fixedDay1);
    _$jscoverage['/gregorian.js'].lineData[1407]++;
    if (visit86_1407_1(nDays >= self.minimalDaysInFirstWeek)) {
      _$jscoverage['/gregorian.js'].lineData[1408]++;
      fixedDay1st -= 7;
    }
    _$jscoverage['/gregorian.js'].lineData[1410]++;
    var normalizedDayOfPeriod = (fixedDate - fixedDay1st);
    _$jscoverage['/gregorian.js'].lineData[1411]++;
    return floorDivide(normalizedDayOfPeriod / 7) + 1;
  }
  _$jscoverage['/gregorian.js'].lineData[1414]++;
  function getDayOfWeekDateOnOrBefore(fixedDate, dayOfWeek) {
    _$jscoverage['/gregorian.js'].functionData[41]++;
    _$jscoverage['/gregorian.js'].lineData[1417]++;
    return fixedDate - mod(fixedDate - dayOfWeek, 7);
  }
  _$jscoverage['/gregorian.js'].lineData[1422]++;
  return GregorianCalendar;
}, {
  requires: ['i18n!date', './gregorian/utils', './gregorian/const']});
