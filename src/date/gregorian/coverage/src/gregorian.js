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
  _$jscoverage['/gregorian.js'].lineData[8] = 0;
  _$jscoverage['/gregorian.js'].lineData[36] = 0;
  _$jscoverage['/gregorian.js'].lineData[38] = 0;
  _$jscoverage['/gregorian.js'].lineData[40] = 0;
  _$jscoverage['/gregorian.js'].lineData[41] = 0;
  _$jscoverage['/gregorian.js'].lineData[42] = 0;
  _$jscoverage['/gregorian.js'].lineData[43] = 0;
  _$jscoverage['/gregorian.js'].lineData[44] = 0;
  _$jscoverage['/gregorian.js'].lineData[47] = 0;
  _$jscoverage['/gregorian.js'].lineData[49] = 0;
  _$jscoverage['/gregorian.js'].lineData[51] = 0;
  _$jscoverage['/gregorian.js'].lineData[58] = 0;
  _$jscoverage['/gregorian.js'].lineData[64] = 0;
  _$jscoverage['/gregorian.js'].lineData[70] = 0;
  _$jscoverage['/gregorian.js'].lineData[78] = 0;
  _$jscoverage['/gregorian.js'].lineData[80] = 0;
  _$jscoverage['/gregorian.js'].lineData[82] = 0;
  _$jscoverage['/gregorian.js'].lineData[83] = 0;
  _$jscoverage['/gregorian.js'].lineData[87] = 0;
  _$jscoverage['/gregorian.js'].lineData[89] = 0;
  _$jscoverage['/gregorian.js'].lineData[176] = 0;
  _$jscoverage['/gregorian.js'].lineData[184] = 0;
  _$jscoverage['/gregorian.js'].lineData[185] = 0;
  _$jscoverage['/gregorian.js'].lineData[186] = 0;
  _$jscoverage['/gregorian.js'].lineData[187] = 0;
  _$jscoverage['/gregorian.js'].lineData[188] = 0;
  _$jscoverage['/gregorian.js'].lineData[189] = 0;
  _$jscoverage['/gregorian.js'].lineData[191] = 0;
  _$jscoverage['/gregorian.js'].lineData[192] = 0;
  _$jscoverage['/gregorian.js'].lineData[193] = 0;
  _$jscoverage['/gregorian.js'].lineData[194] = 0;
  _$jscoverage['/gregorian.js'].lineData[196] = 0;
  _$jscoverage['/gregorian.js'].lineData[197] = 0;
  _$jscoverage['/gregorian.js'].lineData[199] = 0;
  _$jscoverage['/gregorian.js'].lineData[200] = 0;
  _$jscoverage['/gregorian.js'].lineData[202] = 0;
  _$jscoverage['/gregorian.js'].lineData[203] = 0;
  _$jscoverage['/gregorian.js'].lineData[204] = 0;
  _$jscoverage['/gregorian.js'].lineData[205] = 0;
  _$jscoverage['/gregorian.js'].lineData[206] = 0;
  _$jscoverage['/gregorian.js'].lineData[208] = 0;
  _$jscoverage['/gregorian.js'].lineData[210] = 0;
  _$jscoverage['/gregorian.js'].lineData[215] = 0;
  _$jscoverage['/gregorian.js'].lineData[233] = 0;
  _$jscoverage['/gregorian.js'].lineData[249] = 0;
  _$jscoverage['/gregorian.js'].lineData[261] = 0;
  _$jscoverage['/gregorian.js'].lineData[269] = 0;
  _$jscoverage['/gregorian.js'].lineData[283] = 0;
  _$jscoverage['/gregorian.js'].lineData[284] = 0;
  _$jscoverage['/gregorian.js'].lineData[287] = 0;
  _$jscoverage['/gregorian.js'].lineData[288] = 0;
  _$jscoverage['/gregorian.js'].lineData[289] = 0;
  _$jscoverage['/gregorian.js'].lineData[290] = 0;
  _$jscoverage['/gregorian.js'].lineData[293] = 0;
  _$jscoverage['/gregorian.js'].lineData[306] = 0;
  _$jscoverage['/gregorian.js'].lineData[307] = 0;
  _$jscoverage['/gregorian.js'].lineData[309] = 0;
  _$jscoverage['/gregorian.js'].lineData[311] = 0;
  _$jscoverage['/gregorian.js'].lineData[313] = 0;
  _$jscoverage['/gregorian.js'].lineData[314] = 0;
  _$jscoverage['/gregorian.js'].lineData[317] = 0;
  _$jscoverage['/gregorian.js'].lineData[318] = 0;
  _$jscoverage['/gregorian.js'].lineData[319] = 0;
  _$jscoverage['/gregorian.js'].lineData[320] = 0;
  _$jscoverage['/gregorian.js'].lineData[322] = 0;
  _$jscoverage['/gregorian.js'].lineData[325] = 0;
  _$jscoverage['/gregorian.js'].lineData[326] = 0;
  _$jscoverage['/gregorian.js'].lineData[327] = 0;
  _$jscoverage['/gregorian.js'].lineData[330] = 0;
  _$jscoverage['/gregorian.js'].lineData[331] = 0;
  _$jscoverage['/gregorian.js'].lineData[334] = 0;
  _$jscoverage['/gregorian.js'].lineData[335] = 0;
  _$jscoverage['/gregorian.js'].lineData[337] = 0;
  _$jscoverage['/gregorian.js'].lineData[338] = 0;
  _$jscoverage['/gregorian.js'].lineData[340] = 0;
  _$jscoverage['/gregorian.js'].lineData[351] = 0;
  _$jscoverage['/gregorian.js'].lineData[360] = 0;
  _$jscoverage['/gregorian.js'].lineData[361] = 0;
  _$jscoverage['/gregorian.js'].lineData[362] = 0;
  _$jscoverage['/gregorian.js'].lineData[363] = 0;
  _$jscoverage['/gregorian.js'].lineData[364] = 0;
  _$jscoverage['/gregorian.js'].lineData[365] = 0;
  _$jscoverage['/gregorian.js'].lineData[366] = 0;
  _$jscoverage['/gregorian.js'].lineData[367] = 0;
  _$jscoverage['/gregorian.js'].lineData[368] = 0;
  _$jscoverage['/gregorian.js'].lineData[370] = 0;
  _$jscoverage['/gregorian.js'].lineData[371] = 0;
  _$jscoverage['/gregorian.js'].lineData[372] = 0;
  _$jscoverage['/gregorian.js'].lineData[376] = 0;
  _$jscoverage['/gregorian.js'].lineData[378] = 0;
  _$jscoverage['/gregorian.js'].lineData[380] = 0;
  _$jscoverage['/gregorian.js'].lineData[382] = 0;
  _$jscoverage['/gregorian.js'].lineData[383] = 0;
  _$jscoverage['/gregorian.js'].lineData[384] = 0;
  _$jscoverage['/gregorian.js'].lineData[385] = 0;
  _$jscoverage['/gregorian.js'].lineData[386] = 0;
  _$jscoverage['/gregorian.js'].lineData[388] = 0;
  _$jscoverage['/gregorian.js'].lineData[389] = 0;
  _$jscoverage['/gregorian.js'].lineData[390] = 0;
  _$jscoverage['/gregorian.js'].lineData[391] = 0;
  _$jscoverage['/gregorian.js'].lineData[392] = 0;
  _$jscoverage['/gregorian.js'].lineData[393] = 0;
  _$jscoverage['/gregorian.js'].lineData[394] = 0;
  _$jscoverage['/gregorian.js'].lineData[396] = 0;
  _$jscoverage['/gregorian.js'].lineData[403] = 0;
  _$jscoverage['/gregorian.js'].lineData[404] = 0;
  _$jscoverage['/gregorian.js'].lineData[405] = 0;
  _$jscoverage['/gregorian.js'].lineData[407] = 0;
  _$jscoverage['/gregorian.js'].lineData[408] = 0;
  _$jscoverage['/gregorian.js'].lineData[410] = 0;
  _$jscoverage['/gregorian.js'].lineData[413] = 0;
  _$jscoverage['/gregorian.js'].lineData[417] = 0;
  _$jscoverage['/gregorian.js'].lineData[418] = 0;
  _$jscoverage['/gregorian.js'].lineData[419] = 0;
  _$jscoverage['/gregorian.js'].lineData[422] = 0;
  _$jscoverage['/gregorian.js'].lineData[423] = 0;
  _$jscoverage['/gregorian.js'].lineData[424] = 0;
  _$jscoverage['/gregorian.js'].lineData[425] = 0;
  _$jscoverage['/gregorian.js'].lineData[427] = 0;
  _$jscoverage['/gregorian.js'].lineData[431] = 0;
  _$jscoverage['/gregorian.js'].lineData[435] = 0;
  _$jscoverage['/gregorian.js'].lineData[436] = 0;
  _$jscoverage['/gregorian.js'].lineData[438] = 0;
  _$jscoverage['/gregorian.js'].lineData[447] = 0;
  _$jscoverage['/gregorian.js'].lineData[448] = 0;
  _$jscoverage['/gregorian.js'].lineData[451] = 0;
  _$jscoverage['/gregorian.js'].lineData[453] = 0;
  _$jscoverage['/gregorian.js'].lineData[454] = 0;
  _$jscoverage['/gregorian.js'].lineData[455] = 0;
  _$jscoverage['/gregorian.js'].lineData[456] = 0;
  _$jscoverage['/gregorian.js'].lineData[458] = 0;
  _$jscoverage['/gregorian.js'].lineData[459] = 0;
  _$jscoverage['/gregorian.js'].lineData[460] = 0;
  _$jscoverage['/gregorian.js'].lineData[461] = 0;
  _$jscoverage['/gregorian.js'].lineData[462] = 0;
  _$jscoverage['/gregorian.js'].lineData[463] = 0;
  _$jscoverage['/gregorian.js'].lineData[465] = 0;
  _$jscoverage['/gregorian.js'].lineData[467] = 0;
  _$jscoverage['/gregorian.js'].lineData[469] = 0;
  _$jscoverage['/gregorian.js'].lineData[472] = 0;
  _$jscoverage['/gregorian.js'].lineData[474] = 0;
  _$jscoverage['/gregorian.js'].lineData[476] = 0;
  _$jscoverage['/gregorian.js'].lineData[478] = 0;
  _$jscoverage['/gregorian.js'].lineData[489] = 0;
  _$jscoverage['/gregorian.js'].lineData[490] = 0;
  _$jscoverage['/gregorian.js'].lineData[492] = 0;
  _$jscoverage['/gregorian.js'].lineData[493] = 0;
  _$jscoverage['/gregorian.js'].lineData[499] = 0;
  _$jscoverage['/gregorian.js'].lineData[501] = 0;
  _$jscoverage['/gregorian.js'].lineData[503] = 0;
  _$jscoverage['/gregorian.js'].lineData[505] = 0;
  _$jscoverage['/gregorian.js'].lineData[507] = 0;
  _$jscoverage['/gregorian.js'].lineData[509] = 0;
  _$jscoverage['/gregorian.js'].lineData[510] = 0;
  _$jscoverage['/gregorian.js'].lineData[511] = 0;
  _$jscoverage['/gregorian.js'].lineData[512] = 0;
  _$jscoverage['/gregorian.js'].lineData[513] = 0;
  _$jscoverage['/gregorian.js'].lineData[514] = 0;
  _$jscoverage['/gregorian.js'].lineData[515] = 0;
  _$jscoverage['/gregorian.js'].lineData[516] = 0;
  _$jscoverage['/gregorian.js'].lineData[522] = 0;
  _$jscoverage['/gregorian.js'].lineData[524] = 0;
  _$jscoverage['/gregorian.js'].lineData[526] = 0;
  _$jscoverage['/gregorian.js'].lineData[527] = 0;
  _$jscoverage['/gregorian.js'].lineData[530] = 0;
  _$jscoverage['/gregorian.js'].lineData[531] = 0;
  _$jscoverage['/gregorian.js'].lineData[532] = 0;
  _$jscoverage['/gregorian.js'].lineData[534] = 0;
  _$jscoverage['/gregorian.js'].lineData[535] = 0;
  _$jscoverage['/gregorian.js'].lineData[539] = 0;
  _$jscoverage['/gregorian.js'].lineData[540] = 0;
  _$jscoverage['/gregorian.js'].lineData[543] = 0;
  _$jscoverage['/gregorian.js'].lineData[544] = 0;
  _$jscoverage['/gregorian.js'].lineData[547] = 0;
  _$jscoverage['/gregorian.js'].lineData[549] = 0;
  _$jscoverage['/gregorian.js'].lineData[550] = 0;
  _$jscoverage['/gregorian.js'].lineData[551] = 0;
  _$jscoverage['/gregorian.js'].lineData[553] = 0;
  _$jscoverage['/gregorian.js'].lineData[555] = 0;
  _$jscoverage['/gregorian.js'].lineData[556] = 0;
  _$jscoverage['/gregorian.js'].lineData[557] = 0;
  _$jscoverage['/gregorian.js'].lineData[559] = 0;
  _$jscoverage['/gregorian.js'].lineData[564] = 0;
  _$jscoverage['/gregorian.js'].lineData[565] = 0;
  _$jscoverage['/gregorian.js'].lineData[567] = 0;
  _$jscoverage['/gregorian.js'].lineData[570] = 0;
  _$jscoverage['/gregorian.js'].lineData[571] = 0;
  _$jscoverage['/gregorian.js'].lineData[573] = 0;
  _$jscoverage['/gregorian.js'].lineData[574] = 0;
  _$jscoverage['/gregorian.js'].lineData[576] = 0;
  _$jscoverage['/gregorian.js'].lineData[580] = 0;
  _$jscoverage['/gregorian.js'].lineData[589] = 0;
  _$jscoverage['/gregorian.js'].lineData[590] = 0;
  _$jscoverage['/gregorian.js'].lineData[592] = 0;
  _$jscoverage['/gregorian.js'].lineData[600] = 0;
  _$jscoverage['/gregorian.js'].lineData[601] = 0;
  _$jscoverage['/gregorian.js'].lineData[602] = 0;
  _$jscoverage['/gregorian.js'].lineData[611] = 0;
  _$jscoverage['/gregorian.js'].lineData[612] = 0;
  _$jscoverage['/gregorian.js'].lineData[701] = 0;
  _$jscoverage['/gregorian.js'].lineData[702] = 0;
  _$jscoverage['/gregorian.js'].lineData[703] = 0;
  _$jscoverage['/gregorian.js'].lineData[704] = 0;
  _$jscoverage['/gregorian.js'].lineData[705] = 0;
  _$jscoverage['/gregorian.js'].lineData[706] = 0;
  _$jscoverage['/gregorian.js'].lineData[709] = 0;
  _$jscoverage['/gregorian.js'].lineData[711] = 0;
  _$jscoverage['/gregorian.js'].lineData[820] = 0;
  _$jscoverage['/gregorian.js'].lineData[821] = 0;
  _$jscoverage['/gregorian.js'].lineData[823] = 0;
  _$jscoverage['/gregorian.js'].lineData[824] = 0;
  _$jscoverage['/gregorian.js'].lineData[826] = 0;
  _$jscoverage['/gregorian.js'].lineData[827] = 0;
  _$jscoverage['/gregorian.js'].lineData[828] = 0;
  _$jscoverage['/gregorian.js'].lineData[829] = 0;
  _$jscoverage['/gregorian.js'].lineData[830] = 0;
  _$jscoverage['/gregorian.js'].lineData[831] = 0;
  _$jscoverage['/gregorian.js'].lineData[832] = 0;
  _$jscoverage['/gregorian.js'].lineData[833] = 0;
  _$jscoverage['/gregorian.js'].lineData[834] = 0;
  _$jscoverage['/gregorian.js'].lineData[835] = 0;
  _$jscoverage['/gregorian.js'].lineData[836] = 0;
  _$jscoverage['/gregorian.js'].lineData[838] = 0;
  _$jscoverage['/gregorian.js'].lineData[839] = 0;
  _$jscoverage['/gregorian.js'].lineData[841] = 0;
  _$jscoverage['/gregorian.js'].lineData[843] = 0;
  _$jscoverage['/gregorian.js'].lineData[844] = 0;
  _$jscoverage['/gregorian.js'].lineData[846] = 0;
  _$jscoverage['/gregorian.js'].lineData[847] = 0;
  _$jscoverage['/gregorian.js'].lineData[849] = 0;
  _$jscoverage['/gregorian.js'].lineData[850] = 0;
  _$jscoverage['/gregorian.js'].lineData[852] = 0;
  _$jscoverage['/gregorian.js'].lineData[856] = 0;
  _$jscoverage['/gregorian.js'].lineData[857] = 0;
  _$jscoverage['/gregorian.js'].lineData[861] = 0;
  _$jscoverage['/gregorian.js'].lineData[862] = 0;
  _$jscoverage['/gregorian.js'].lineData[864] = 0;
  _$jscoverage['/gregorian.js'].lineData[865] = 0;
  _$jscoverage['/gregorian.js'].lineData[867] = 0;
  _$jscoverage['/gregorian.js'].lineData[952] = 0;
  _$jscoverage['/gregorian.js'].lineData[953] = 0;
  _$jscoverage['/gregorian.js'].lineData[954] = 0;
  _$jscoverage['/gregorian.js'].lineData[955] = 0;
  _$jscoverage['/gregorian.js'].lineData[980] = 0;
  _$jscoverage['/gregorian.js'].lineData[981] = 0;
  _$jscoverage['/gregorian.js'].lineData[983] = 0;
  _$jscoverage['/gregorian.js'].lineData[985] = 0;
  _$jscoverage['/gregorian.js'].lineData[986] = 0;
  _$jscoverage['/gregorian.js'].lineData[987] = 0;
  _$jscoverage['/gregorian.js'].lineData[988] = 0;
  _$jscoverage['/gregorian.js'].lineData[990] = 0;
  _$jscoverage['/gregorian.js'].lineData[993] = 0;
  _$jscoverage['/gregorian.js'].lineData[995] = 0;
  _$jscoverage['/gregorian.js'].lineData[996] = 0;
  _$jscoverage['/gregorian.js'].lineData[999] = 0;
  _$jscoverage['/gregorian.js'].lineData[1000] = 0;
  _$jscoverage['/gregorian.js'].lineData[1085] = 0;
  _$jscoverage['/gregorian.js'].lineData[1086] = 0;
  _$jscoverage['/gregorian.js'].lineData[1088] = 0;
  _$jscoverage['/gregorian.js'].lineData[1089] = 0;
  _$jscoverage['/gregorian.js'].lineData[1091] = 0;
  _$jscoverage['/gregorian.js'].lineData[1092] = 0;
  _$jscoverage['/gregorian.js'].lineData[1094] = 0;
  _$jscoverage['/gregorian.js'].lineData[1095] = 0;
  _$jscoverage['/gregorian.js'].lineData[1097] = 0;
  _$jscoverage['/gregorian.js'].lineData[1098] = 0;
  _$jscoverage['/gregorian.js'].lineData[1099] = 0;
  _$jscoverage['/gregorian.js'].lineData[1108] = 0;
  _$jscoverage['/gregorian.js'].lineData[1115] = 0;
  _$jscoverage['/gregorian.js'].lineData[1116] = 0;
  _$jscoverage['/gregorian.js'].lineData[1117] = 0;
  _$jscoverage['/gregorian.js'].lineData[1125] = 0;
  _$jscoverage['/gregorian.js'].lineData[1126] = 0;
  _$jscoverage['/gregorian.js'].lineData[1127] = 0;
  _$jscoverage['/gregorian.js'].lineData[1136] = 0;
  _$jscoverage['/gregorian.js'].lineData[1147] = 0;
  _$jscoverage['/gregorian.js'].lineData[1148] = 0;
  _$jscoverage['/gregorian.js'].lineData[1149] = 0;
  _$jscoverage['/gregorian.js'].lineData[1161] = 0;
  _$jscoverage['/gregorian.js'].lineData[1178] = 0;
  _$jscoverage['/gregorian.js'].lineData[1179] = 0;
  _$jscoverage['/gregorian.js'].lineData[1180] = 0;
  _$jscoverage['/gregorian.js'].lineData[1183] = 0;
  _$jscoverage['/gregorian.js'].lineData[1184] = 0;
  _$jscoverage['/gregorian.js'].lineData[1185] = 0;
  _$jscoverage['/gregorian.js'].lineData[1197] = 0;
  _$jscoverage['/gregorian.js'].lineData[1198] = 0;
  _$jscoverage['/gregorian.js'].lineData[1199] = 0;
  _$jscoverage['/gregorian.js'].lineData[1200] = 0;
  _$jscoverage['/gregorian.js'].lineData[1201] = 0;
  _$jscoverage['/gregorian.js'].lineData[1202] = 0;
  _$jscoverage['/gregorian.js'].lineData[1204] = 0;
  _$jscoverage['/gregorian.js'].lineData[1205] = 0;
  _$jscoverage['/gregorian.js'].lineData[1206] = 0;
  _$jscoverage['/gregorian.js'].lineData[1209] = 0;
  _$jscoverage['/gregorian.js'].lineData[1222] = 0;
  _$jscoverage['/gregorian.js'].lineData[1223] = 0;
  _$jscoverage['/gregorian.js'].lineData[1225] = 0;
  _$jscoverage['/gregorian.js'].lineData[1228] = 0;
  _$jscoverage['/gregorian.js'].lineData[1229] = 0;
  _$jscoverage['/gregorian.js'].lineData[1230] = 0;
  _$jscoverage['/gregorian.js'].lineData[1231] = 0;
  _$jscoverage['/gregorian.js'].lineData[1232] = 0;
  _$jscoverage['/gregorian.js'].lineData[1233] = 0;
  _$jscoverage['/gregorian.js'].lineData[1234] = 0;
  _$jscoverage['/gregorian.js'].lineData[1235] = 0;
  _$jscoverage['/gregorian.js'].lineData[1236] = 0;
  _$jscoverage['/gregorian.js'].lineData[1238] = 0;
  _$jscoverage['/gregorian.js'].lineData[1239] = 0;
  _$jscoverage['/gregorian.js'].lineData[1240] = 0;
  _$jscoverage['/gregorian.js'].lineData[1242] = 0;
  _$jscoverage['/gregorian.js'].lineData[1244] = 0;
  _$jscoverage['/gregorian.js'].lineData[1245] = 0;
  _$jscoverage['/gregorian.js'].lineData[1246] = 0;
  _$jscoverage['/gregorian.js'].lineData[1247] = 0;
  _$jscoverage['/gregorian.js'].lineData[1254] = 0;
  _$jscoverage['/gregorian.js'].lineData[1255] = 0;
  _$jscoverage['/gregorian.js'].lineData[1257] = 0;
  _$jscoverage['/gregorian.js'].lineData[1258] = 0;
  _$jscoverage['/gregorian.js'].lineData[1259] = 0;
  _$jscoverage['/gregorian.js'].lineData[1271] = 0;
  _$jscoverage['/gregorian.js'].lineData[1285] = 0;
  _$jscoverage['/gregorian.js'].lineData[1286] = 0;
  _$jscoverage['/gregorian.js'].lineData[1288] = 0;
  _$jscoverage['/gregorian.js'].lineData[1290] = 0;
  _$jscoverage['/gregorian.js'].lineData[1291] = 0;
  _$jscoverage['/gregorian.js'].lineData[1295] = 0;
  _$jscoverage['/gregorian.js'].lineData[1297] = 0;
  _$jscoverage['/gregorian.js'].lineData[1299] = 0;
  _$jscoverage['/gregorian.js'].lineData[1307] = 0;
  _$jscoverage['/gregorian.js'].lineData[1320] = 0;
  _$jscoverage['/gregorian.js'].lineData[1332] = 0;
  _$jscoverage['/gregorian.js'].lineData[1340] = 0;
  _$jscoverage['/gregorian.js'].lineData[1353] = 0;
  _$jscoverage['/gregorian.js'].lineData[1354] = 0;
  _$jscoverage['/gregorian.js'].lineData[1355] = 0;
  _$jscoverage['/gregorian.js'].lineData[1356] = 0;
  _$jscoverage['/gregorian.js'].lineData[1359] = 0;
  _$jscoverage['/gregorian.js'].lineData[1360] = 0;
  _$jscoverage['/gregorian.js'].lineData[1363] = 0;
  _$jscoverage['/gregorian.js'].lineData[1364] = 0;
  _$jscoverage['/gregorian.js'].lineData[1367] = 0;
  _$jscoverage['/gregorian.js'].lineData[1368] = 0;
  _$jscoverage['/gregorian.js'].lineData[1371] = 0;
  _$jscoverage['/gregorian.js'].lineData[1372] = 0;
  _$jscoverage['/gregorian.js'].lineData[1380] = 0;
  _$jscoverage['/gregorian.js'].lineData[1381] = 0;
  _$jscoverage['/gregorian.js'].lineData[1382] = 0;
  _$jscoverage['/gregorian.js'].lineData[1383] = 0;
  _$jscoverage['/gregorian.js'].lineData[1384] = 0;
  _$jscoverage['/gregorian.js'].lineData[1385] = 0;
  _$jscoverage['/gregorian.js'].lineData[1386] = 0;
  _$jscoverage['/gregorian.js'].lineData[1387] = 0;
  _$jscoverage['/gregorian.js'].lineData[1391] = 0;
  _$jscoverage['/gregorian.js'].lineData[1392] = 0;
  _$jscoverage['/gregorian.js'].lineData[1395] = 0;
  _$jscoverage['/gregorian.js'].lineData[1396] = 0;
  _$jscoverage['/gregorian.js'].lineData[1399] = 0;
  _$jscoverage['/gregorian.js'].lineData[1400] = 0;
  _$jscoverage['/gregorian.js'].lineData[1401] = 0;
  _$jscoverage['/gregorian.js'].lineData[1402] = 0;
  _$jscoverage['/gregorian.js'].lineData[1403] = 0;
  _$jscoverage['/gregorian.js'].lineData[1405] = 0;
  _$jscoverage['/gregorian.js'].lineData[1406] = 0;
  _$jscoverage['/gregorian.js'].lineData[1409] = 0;
  _$jscoverage['/gregorian.js'].lineData[1412] = 0;
  _$jscoverage['/gregorian.js'].lineData[1417] = 0;
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
  _$jscoverage['/gregorian.js'].branchData['40'] = [];
  _$jscoverage['/gregorian.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['43'] = [];
  _$jscoverage['/gregorian.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['47'] = [];
  _$jscoverage['/gregorian.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['64'] = [];
  _$jscoverage['/gregorian.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['82'] = [];
  _$jscoverage['/gregorian.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['283'] = [];
  _$jscoverage['/gregorian.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['288'] = [];
  _$jscoverage['/gregorian.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['306'] = [];
  _$jscoverage['/gregorian.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['319'] = [];
  _$jscoverage['/gregorian.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['337'] = [];
  _$jscoverage['/gregorian.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['351'] = [];
  _$jscoverage['/gregorian.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['366'] = [];
  _$jscoverage['/gregorian.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['370'] = [];
  _$jscoverage['/gregorian.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['388'] = [];
  _$jscoverage['/gregorian.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['413'] = [];
  _$jscoverage['/gregorian.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['422'] = [];
  _$jscoverage['/gregorian.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['427'] = [];
  _$jscoverage['/gregorian.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['427'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['429'] = [];
  _$jscoverage['/gregorian.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['447'] = [];
  _$jscoverage['/gregorian.js'].branchData['447'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['455'] = [];
  _$jscoverage['/gregorian.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['459'] = [];
  _$jscoverage['/gregorian.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['461'] = [];
  _$jscoverage['/gregorian.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['463'] = [];
  _$jscoverage['/gregorian.js'].branchData['463'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['489'] = [];
  _$jscoverage['/gregorian.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['492'] = [];
  _$jscoverage['/gregorian.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['509'] = [];
  _$jscoverage['/gregorian.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['511'] = [];
  _$jscoverage['/gregorian.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['514'] = [];
  _$jscoverage['/gregorian.js'].branchData['514'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['526'] = [];
  _$jscoverage['/gregorian.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['530'] = [];
  _$jscoverage['/gregorian.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['531'] = [];
  _$jscoverage['/gregorian.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['534'] = [];
  _$jscoverage['/gregorian.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['539'] = [];
  _$jscoverage['/gregorian.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['543'] = [];
  _$jscoverage['/gregorian.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['550'] = [];
  _$jscoverage['/gregorian.js'].branchData['550'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['556'] = [];
  _$jscoverage['/gregorian.js'].branchData['556'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['564'] = [];
  _$jscoverage['/gregorian.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['570'] = [];
  _$jscoverage['/gregorian.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['573'] = [];
  _$jscoverage['/gregorian.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['589'] = [];
  _$jscoverage['/gregorian.js'].branchData['589'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['702'] = [];
  _$jscoverage['/gregorian.js'].branchData['702'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['704'] = [];
  _$jscoverage['/gregorian.js'].branchData['704'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['705'] = [];
  _$jscoverage['/gregorian.js'].branchData['705'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['820'] = [];
  _$jscoverage['/gregorian.js'].branchData['820'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['827'] = [];
  _$jscoverage['/gregorian.js'].branchData['827'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['831'] = [];
  _$jscoverage['/gregorian.js'].branchData['831'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['835'] = [];
  _$jscoverage['/gregorian.js'].branchData['835'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['980'] = [];
  _$jscoverage['/gregorian.js'].branchData['980'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1115'] = [];
  _$jscoverage['/gregorian.js'].branchData['1115'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1125'] = [];
  _$jscoverage['/gregorian.js'].branchData['1125'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1147'] = [];
  _$jscoverage['/gregorian.js'].branchData['1147'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1179'] = [];
  _$jscoverage['/gregorian.js'].branchData['1179'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1200'] = [];
  _$jscoverage['/gregorian.js'].branchData['1200'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1201'] = [];
  _$jscoverage['/gregorian.js'].branchData['1201'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1204'] = [];
  _$jscoverage['/gregorian.js'].branchData['1204'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1205'] = [];
  _$jscoverage['/gregorian.js'].branchData['1205'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1222'] = [];
  _$jscoverage['/gregorian.js'].branchData['1222'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1222'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1222'][3] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1235'] = [];
  _$jscoverage['/gregorian.js'].branchData['1235'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1239'] = [];
  _$jscoverage['/gregorian.js'].branchData['1239'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1254'] = [];
  _$jscoverage['/gregorian.js'].branchData['1254'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1271'] = [];
  _$jscoverage['/gregorian.js'].branchData['1271'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1271'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1272'] = [];
  _$jscoverage['/gregorian.js'].branchData['1272'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1272'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1273'] = [];
  _$jscoverage['/gregorian.js'].branchData['1273'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1273'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1274'] = [];
  _$jscoverage['/gregorian.js'].branchData['1274'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1285'] = [];
  _$jscoverage['/gregorian.js'].branchData['1285'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1297'] = [];
  _$jscoverage['/gregorian.js'].branchData['1297'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1354'] = [];
  _$jscoverage['/gregorian.js'].branchData['1354'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1386'] = [];
  _$jscoverage['/gregorian.js'].branchData['1386'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1402'] = [];
  _$jscoverage['/gregorian.js'].branchData['1402'][1] = new BranchData();
}
_$jscoverage['/gregorian.js'].branchData['1402'][1].init(153, 36, 'nDays >= self.minimalDaysInFirstWeek');
function visit86_1402_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1402'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1386'][1].init(220, 21, 'dayOfMonth > monthLen');
function visit85_1386_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1386'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1354'][1].init(14, 1, 'f');
function visit84_1354_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1354'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1297'][1].init(45462, 9, '\'@DEBUG@\'');
function visit83_1297_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1297'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1285'][1].init(18, 19, 'field === undefined');
function visit82_1285_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1285'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1274'][1].init(61, 57, 'this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit81_1274_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1274'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1273'][2].init(138, 41, 'this.timezoneOffset == obj.timezoneOffset');
function visit80_1273_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1273'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1273'][1].init(61, 119, 'this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit79_1273_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1273'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1272'][2].init(75, 41, 'this.firstDayOfWeek == obj.firstDayOfWeek');
function visit78_1272_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1272'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1272'][1].init(51, 181, 'this.firstDayOfWeek == obj.firstDayOfWeek && this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit77_1272_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1272'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1271'][2].init(21, 31, 'this.getTime() == obj.getTime()');
function visit76_1271_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1271'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1271'][1].init(21, 233, 'this.getTime() == obj.getTime() && this.firstDayOfWeek == obj.firstDayOfWeek && this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit75_1271_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1271'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1254'][1].init(18, 23, 'this.time === undefined');
function visit74_1254_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1254'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1239'][1].init(782, 9, 'days != 0');
function visit73_1239_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1239'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1235'][1].init(667, 8, 'days < 0');
function visit72_1235_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1235'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1222'][3].init(58, 38, 'dayOfWeek > GregorianCalendar.SATURDAY');
function visit71_1222_3(result) {
  _$jscoverage['/gregorian.js'].branchData['1222'][3].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1222'][2].init(18, 36, 'dayOfWeek < GregorianCalendar.SUNDAY');
function visit70_1222_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1222'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1222'][1].init(18, 78, 'dayOfWeek < GregorianCalendar.SUNDAY || dayOfWeek > GregorianCalendar.SATURDAY');
function visit69_1222_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1222'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1205'][1].init(22, 15, 'weekOfYear == 1');
function visit68_1205_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1205'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1204'][1].init(330, 35, 'month == GregorianCalendar.DECEMBER');
function visit67_1204_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1204'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1201'][1].init(22, 16, 'weekOfYear >= 52');
function visit66_1201_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1201'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1200'][1].init(178, 34, 'month == GregorianCalendar.JANUARY');
function visit65_1200_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1200'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1179'][1].init(66, 26, 'weekYear == this.get(YEAR)');
function visit64_1179_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1179'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1147'][1].init(18, 53, 'this.minimalDaysInFirstWeek != minimalDaysInFirstWeek');
function visit63_1147_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1147'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1125'][1].init(18, 37, 'this.firstDayOfWeek != firstDayOfWeek');
function visit62_1125_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1125'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1115'][1].init(18, 37, 'this.timezoneOffset != timezoneOffset');
function visit61_1115_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1115'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['980'][1].init(18, 7, '!amount');
function visit60_980_1(result) {
  _$jscoverage['/gregorian.js'].branchData['980'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['835'][1].init(156, 10, 'yearAmount');
function visit59_835_1(result) {
  _$jscoverage['/gregorian.js'].branchData['835'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['831'][1].init(408, 15, 'field === MONTH');
function visit58_831_1(result) {
  _$jscoverage['/gregorian.js'].branchData['831'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['827'][1].init(250, 14, 'field === YEAR');
function visit57_827_1(result) {
  _$jscoverage['/gregorian.js'].branchData['827'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['820'][1].init(18, 7, '!amount');
function visit56_820_1(result) {
  _$jscoverage['/gregorian.js'].branchData['820'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['705'][1].init(34, 7, 'i < len');
function visit55_705_1(result) {
  _$jscoverage['/gregorian.js'].branchData['705'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['704'][1].init(137, 22, 'len < MILLISECONDS + 1');
function visit54_704_1(result) {
  _$jscoverage['/gregorian.js'].branchData['704'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['702'][1].init(59, 8, 'len == 2');
function visit53_702_1(result) {
  _$jscoverage['/gregorian.js'].branchData['702'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['589'][1].init(18, 23, 'this.time === undefined');
function visit52_589_1(result) {
  _$jscoverage['/gregorian.js'].branchData['589'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['573'][1].init(405, 30, 'dayOfWeek != firstDayOfWeekCfg');
function visit51_573_1(result) {
  _$jscoverage['/gregorian.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['570'][1].init(249, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
function visit50_570_1(result) {
  _$jscoverage['/gregorian.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['564'][1].init(79, 23, 'self.isSet(DAY_OF_YEAR)');
function visit49_564_1(result) {
  _$jscoverage['/gregorian.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['556'][1].init(352, 9, 'dowim < 0');
function visit48_556_1(result) {
  _$jscoverage['/gregorian.js'].branchData['556'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['550'][1].init(66, 32, 'self.isSet(DAY_OF_WEEK_IN_MONTH)');
function visit47_550_1(result) {
  _$jscoverage['/gregorian.js'].branchData['550'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['543'][1].init(441, 30, 'dayOfWeek != firstDayOfWeekCfg');
function visit46_543_1(result) {
  _$jscoverage['/gregorian.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['539'][1].init(271, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
function visit45_539_1(result) {
  _$jscoverage['/gregorian.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['534'][1].init(26, 25, 'self.isSet(WEEK_OF_MONTH)');
function visit44_534_1(result) {
  _$jscoverage['/gregorian.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['531'][1].init(22, 24, 'self.isSet(DAY_OF_MONTH)');
function visit43_531_1(result) {
  _$jscoverage['/gregorian.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['530'][1].init(1039, 17, 'self.isSet(MONTH)');
function visit42_530_1(result) {
  _$jscoverage['/gregorian.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['526'][1].init(928, 23, 'self.isSet(DAY_OF_WEEK)');
function visit41_526_1(result) {
  _$jscoverage['/gregorian.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['514'][1].init(211, 33, 'month < GregorianCalendar.JANUARY');
function visit40_514_1(result) {
  _$jscoverage['/gregorian.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['511'][1].init(62, 34, 'month > GregorianCalendar.DECEMBER');
function visit39_511_1(result) {
  _$jscoverage['/gregorian.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['509'][1].init(247, 17, 'self.isSet(MONTH)');
function visit38_509_1(result) {
  _$jscoverage['/gregorian.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['492'][1].init(114, 20, '!this.fieldsComputed');
function visit37_492_1(result) {
  _$jscoverage['/gregorian.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['489'][1].init(18, 23, 'this.time === undefined');
function visit36_489_1(result) {
  _$jscoverage['/gregorian.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['463'][1].init(572, 25, 'fields[MILLISECONDS] || 0');
function visit35_463_1(result) {
  _$jscoverage['/gregorian.js'].branchData['463'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['461'][1].init(492, 20, 'fields[SECONDS] || 0');
function visit34_461_1(result) {
  _$jscoverage['/gregorian.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['459'][1].init(415, 19, 'fields[MINUTE] || 0');
function visit33_459_1(result) {
  _$jscoverage['/gregorian.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['455'][1].init(266, 23, 'this.isSet(HOUR_OF_DAY)');
function visit32_455_1(result) {
  _$jscoverage['/gregorian.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['447'][1].init(18, 17, '!this.isSet(YEAR)');
function visit31_447_1(result) {
  _$jscoverage['/gregorian.js'].branchData['447'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['429'][1].init(119, 29, 'fixedDate >= (nextJan1st - 7)');
function visit30_429_1(result) {
  _$jscoverage['/gregorian.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['427'][2].init(273, 36, 'nDays >= this.minimalDaysInFirstWeek');
function visit29_427_2(result) {
  _$jscoverage['/gregorian.js'].branchData['427'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['427'][1].init(273, 149, 'nDays >= this.minimalDaysInFirstWeek && fixedDate >= (nextJan1st - 7)');
function visit28_427_1(result) {
  _$jscoverage['/gregorian.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['422'][1].init(2485, 16, 'weekOfYear >= 52');
function visit27_422_1(result) {
  _$jscoverage['/gregorian.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['413'][1].init(2015, 15, 'weekOfYear == 0');
function visit26_413_1(result) {
  _$jscoverage['/gregorian.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['388'][1].init(988, 14, 'timeOfDay != 0');
function visit25_388_1(result) {
  _$jscoverage['/gregorian.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['370'][1].init(25, 13, 'timeOfDay < 0');
function visit24_370_1(result) {
  _$jscoverage['/gregorian.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['366'][1].init(329, 20, 'timeOfDay >= ONE_DAY');
function visit23_366_1(result) {
  _$jscoverage['/gregorian.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['351'][1].init(21, 32, 'this.fields[field] !== undefined');
function visit22_351_1(result) {
  _$jscoverage['/gregorian.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['337'][1].init(1257, 19, 'value === undefined');
function visit21_337_1(result) {
  _$jscoverage['/gregorian.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['319'][1].init(207, 10, 'value == 1');
function visit20_319_1(result) {
  _$jscoverage['/gregorian.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['306'][1].init(18, 31, 'MAX_VALUES[field] !== undefined');
function visit19_306_1(result) {
  _$jscoverage['/gregorian.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['288'][1].init(169, 23, 'field === WEEK_OF_MONTH');
function visit18_288_1(result) {
  _$jscoverage['/gregorian.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['283'][1].init(18, 31, 'MIN_VALUES[field] !== undefined');
function visit17_283_1(result) {
  _$jscoverage['/gregorian.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['82'][1].init(1254, 21, 'arguments.length >= 3');
function visit16_82_1(result) {
  _$jscoverage['/gregorian.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['64'][1].init(720, 39, 'timezoneOffset || locale.timezoneOffset');
function visit15_64_1(result) {
  _$jscoverage['/gregorian.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['47'][1].init(299, 23, 'locale || defaultLocale');
function visit14_47_1(result) {
  _$jscoverage['/gregorian.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['43'][1].init(204, 16, 'args.length >= 3');
function visit13_43_1(result) {
  _$jscoverage['/gregorian.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['40'][1].init(62, 26, 'S.isObject(timezoneOffset)');
function visit12_40_1(result) {
  _$jscoverage['/gregorian.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].lineData[6]++;
KISSY.add('date/gregorian', function(S, defaultLocale, Utils, Const, undefined) {
  _$jscoverage['/gregorian.js'].functionData[0]++;
  _$jscoverage['/gregorian.js'].lineData[8]++;
  var toInt = parseInt;
  _$jscoverage['/gregorian.js'].lineData[36]++;
  function GregorianCalendar(timezoneOffset, locale) {
    _$jscoverage['/gregorian.js'].functionData[1]++;
    _$jscoverage['/gregorian.js'].lineData[38]++;
    var args = S.makeArray(arguments);
    _$jscoverage['/gregorian.js'].lineData[40]++;
    if (visit12_40_1(S.isObject(timezoneOffset))) {
      _$jscoverage['/gregorian.js'].lineData[41]++;
      locale = timezoneOffset;
      _$jscoverage['/gregorian.js'].lineData[42]++;
      timezoneOffset = locale.timezoneOffset;
    } else {
      _$jscoverage['/gregorian.js'].lineData[43]++;
      if (visit13_43_1(args.length >= 3)) {
        _$jscoverage['/gregorian.js'].lineData[44]++;
        timezoneOffset = locale = null;
      }
    }
    _$jscoverage['/gregorian.js'].lineData[47]++;
    locale = visit14_47_1(locale || defaultLocale);
    _$jscoverage['/gregorian.js'].lineData[49]++;
    this.locale = locale;
    _$jscoverage['/gregorian.js'].lineData[51]++;
    this.fields = [];
    _$jscoverage['/gregorian.js'].lineData[58]++;
    this.time = undefined;
    _$jscoverage['/gregorian.js'].lineData[64]++;
    this.timezoneOffset = visit15_64_1(timezoneOffset || locale.timezoneOffset);
    _$jscoverage['/gregorian.js'].lineData[70]++;
    this.firstDayOfWeek = locale.firstDayOfWeek;
    _$jscoverage['/gregorian.js'].lineData[78]++;
    this.minimalDaysInFirstWeek = locale.minimalDaysInFirstWeek;
    _$jscoverage['/gregorian.js'].lineData[80]++;
    this.fieldsComputed = false;
    _$jscoverage['/gregorian.js'].lineData[82]++;
    if (visit16_82_1(arguments.length >= 3)) {
      _$jscoverage['/gregorian.js'].lineData[83]++;
      this.set.apply(this, args);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[87]++;
  S.mix(GregorianCalendar, Const);
  _$jscoverage['/gregorian.js'].lineData[89]++;
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
  _$jscoverage['/gregorian.js'].lineData[176]++;
  var fields = ['', 'Year', 'Month', 'DayOfMonth', 'HourOfDay', 'Minutes', 'Seconds', 'Milliseconds', 'WeekOfYear', 'WeekOfMonth', 'DayOfYear', 'DayOfWeek', 'DayOfWeekInMonth'];
  _$jscoverage['/gregorian.js'].lineData[184]++;
  var YEAR = GregorianCalendar.YEAR;
  _$jscoverage['/gregorian.js'].lineData[185]++;
  var MONTH = GregorianCalendar.MONTH;
  _$jscoverage['/gregorian.js'].lineData[186]++;
  var DAY_OF_MONTH = GregorianCalendar.DAY_OF_MONTH;
  _$jscoverage['/gregorian.js'].lineData[187]++;
  var HOUR_OF_DAY = GregorianCalendar.HOUR_OF_DAY;
  _$jscoverage['/gregorian.js'].lineData[188]++;
  var MINUTE = GregorianCalendar.MINUTES;
  _$jscoverage['/gregorian.js'].lineData[189]++;
  var SECONDS = GregorianCalendar.SECONDS;
  _$jscoverage['/gregorian.js'].lineData[191]++;
  var MILLISECONDS = GregorianCalendar.MILLISECONDS;
  _$jscoverage['/gregorian.js'].lineData[192]++;
  var DAY_OF_WEEK_IN_MONTH = GregorianCalendar.DAY_OF_WEEK_IN_MONTH;
  _$jscoverage['/gregorian.js'].lineData[193]++;
  var DAY_OF_YEAR = GregorianCalendar.DAY_OF_YEAR;
  _$jscoverage['/gregorian.js'].lineData[194]++;
  var DAY_OF_WEEK = GregorianCalendar.DAY_OF_WEEK;
  _$jscoverage['/gregorian.js'].lineData[196]++;
  var WEEK_OF_MONTH = GregorianCalendar.WEEK_OF_MONTH;
  _$jscoverage['/gregorian.js'].lineData[197]++;
  var WEEK_OF_YEAR = GregorianCalendar.WEEK_OF_YEAR;
  _$jscoverage['/gregorian.js'].lineData[199]++;
  var MONTH_LENGTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  _$jscoverage['/gregorian.js'].lineData[200]++;
  var LEAP_MONTH_LENGTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  _$jscoverage['/gregorian.js'].lineData[202]++;
  var ONE_SECOND = 1000;
  _$jscoverage['/gregorian.js'].lineData[203]++;
  var ONE_MINUTE = 60 * ONE_SECOND;
  _$jscoverage['/gregorian.js'].lineData[204]++;
  var ONE_HOUR = 60 * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[205]++;
  var ONE_DAY = 24 * ONE_HOUR;
  _$jscoverage['/gregorian.js'].lineData[206]++;
  var ONE_WEEK = ONE_DAY * 7;
  _$jscoverage['/gregorian.js'].lineData[208]++;
  var EPOCH_OFFSET = 719163;
  _$jscoverage['/gregorian.js'].lineData[210]++;
  var mod = Utils.mod, isLeapYear = Utils.isLeapYear, floorDivide = Math.floor;
  _$jscoverage['/gregorian.js'].lineData[215]++;
  var MIN_VALUES = [undefined, 1, GregorianCalendar.JANUARY, 1, 0, 0, 0, 0, 1, undefined, 1, GregorianCalendar.SUNDAY, 1];
  _$jscoverage['/gregorian.js'].lineData[233]++;
  var MAX_VALUES = [undefined, 292278994, GregorianCalendar.DECEMBER, undefined, 23, 59, 59, 999, undefined, undefined, undefined, GregorianCalendar.SATURDAY, undefined];
  _$jscoverage['/gregorian.js'].lineData[249]++;
  GregorianCalendar.prototype = {
  constructor: GregorianCalendar, 
  isLeapYear: function() {
  _$jscoverage['/gregorian.js'].functionData[2]++;
  _$jscoverage['/gregorian.js'].lineData[261]++;
  return isLeapYear(this.getYear());
}, 
  getLocale: function() {
  _$jscoverage['/gregorian.js'].functionData[3]++;
  _$jscoverage['/gregorian.js'].lineData[269]++;
  return this.locale;
}, 
  getActualMinimum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[4]++;
  _$jscoverage['/gregorian.js'].lineData[283]++;
  if (visit17_283_1(MIN_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[284]++;
    return MIN_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[287]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[288]++;
  if (visit18_288_1(field === WEEK_OF_MONTH)) {
    _$jscoverage['/gregorian.js'].lineData[289]++;
    var cal = new GregorianCalendar(fields[YEAR], fields[MONTH], 1);
    _$jscoverage['/gregorian.js'].lineData[290]++;
    return cal.get(WEEK_OF_MONTH);
  }
  _$jscoverage['/gregorian.js'].lineData[293]++;
  throw new Error('minimum value not defined!');
}, 
  getActualMaximum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[5]++;
  _$jscoverage['/gregorian.js'].lineData[306]++;
  if (visit19_306_1(MAX_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[307]++;
    return MAX_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[309]++;
  var value, fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[311]++;
  switch (field) {
    case DAY_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[313]++;
      value = getMonthLength(fields[YEAR], fields[MONTH]);
      _$jscoverage['/gregorian.js'].lineData[314]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[317]++;
      var endOfYear = new GregorianCalendar(fields[YEAR], GregorianCalendar.DECEMBER, 31);
      _$jscoverage['/gregorian.js'].lineData[318]++;
      value = endOfYear.get(WEEK_OF_YEAR);
      _$jscoverage['/gregorian.js'].lineData[319]++;
      if (visit20_319_1(value == 1)) {
        _$jscoverage['/gregorian.js'].lineData[320]++;
        value = 52;
      }
      _$jscoverage['/gregorian.js'].lineData[322]++;
      break;
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[325]++;
      var endOfMonth = new GregorianCalendar(fields[YEAR], fields[MONTH], getMonthLength(fields[YEAR], fields[MONTH]));
      _$jscoverage['/gregorian.js'].lineData[326]++;
      value = endOfMonth.get(WEEK_OF_MONTH);
      _$jscoverage['/gregorian.js'].lineData[327]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[330]++;
      value = getYearLength(fields[YEAR]);
      _$jscoverage['/gregorian.js'].lineData[331]++;
      break;
    case DAY_OF_WEEK_IN_MONTH:
      _$jscoverage['/gregorian.js'].lineData[334]++;
      value = toInt((getMonthLength(fields[YEAR], fields[MONTH]) - 1) / 7) + 1;
      _$jscoverage['/gregorian.js'].lineData[335]++;
      break;
  }
  _$jscoverage['/gregorian.js'].lineData[337]++;
  if (visit21_337_1(value === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[338]++;
    throw new Error('maximum value not defined!');
  }
  _$jscoverage['/gregorian.js'].lineData[340]++;
  return value;
}, 
  isSet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[6]++;
  _$jscoverage['/gregorian.js'].lineData[351]++;
  return visit22_351_1(this.fields[field] !== undefined);
}, 
  computeFields: function() {
  _$jscoverage['/gregorian.js'].functionData[7]++;
  _$jscoverage['/gregorian.js'].lineData[360]++;
  var time = this.time;
  _$jscoverage['/gregorian.js'].lineData[361]++;
  var timezoneOffset = this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[362]++;
  var fixedDate = toInt(timezoneOffset / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[363]++;
  var timeOfDay = timezoneOffset % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[364]++;
  fixedDate += toInt(time / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[365]++;
  timeOfDay += time % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[366]++;
  if (visit23_366_1(timeOfDay >= ONE_DAY)) {
    _$jscoverage['/gregorian.js'].lineData[367]++;
    timeOfDay -= ONE_DAY;
    _$jscoverage['/gregorian.js'].lineData[368]++;
    fixedDate++;
  } else {
    _$jscoverage['/gregorian.js'].lineData[370]++;
    while (visit24_370_1(timeOfDay < 0)) {
      _$jscoverage['/gregorian.js'].lineData[371]++;
      timeOfDay += ONE_DAY;
      _$jscoverage['/gregorian.js'].lineData[372]++;
      fixedDate--;
    }
  }
  _$jscoverage['/gregorian.js'].lineData[376]++;
  fixedDate += EPOCH_OFFSET;
  _$jscoverage['/gregorian.js'].lineData[378]++;
  var date = Utils.getGregorianDateFromFixedDate(fixedDate);
  _$jscoverage['/gregorian.js'].lineData[380]++;
  var year = date.year;
  _$jscoverage['/gregorian.js'].lineData[382]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[383]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[384]++;
  fields[MONTH] = date.month;
  _$jscoverage['/gregorian.js'].lineData[385]++;
  fields[DAY_OF_MONTH] = date.dayOfMonth;
  _$jscoverage['/gregorian.js'].lineData[386]++;
  fields[DAY_OF_WEEK] = date.dayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[388]++;
  if (visit25_388_1(timeOfDay != 0)) {
    _$jscoverage['/gregorian.js'].lineData[389]++;
    fields[HOUR_OF_DAY] = toInt(timeOfDay / ONE_HOUR);
    _$jscoverage['/gregorian.js'].lineData[390]++;
    var r = timeOfDay % ONE_HOUR;
    _$jscoverage['/gregorian.js'].lineData[391]++;
    fields[MINUTE] = toInt(r / ONE_MINUTE);
    _$jscoverage['/gregorian.js'].lineData[392]++;
    r %= ONE_MINUTE;
    _$jscoverage['/gregorian.js'].lineData[393]++;
    fields[SECONDS] = toInt(r / ONE_SECOND);
    _$jscoverage['/gregorian.js'].lineData[394]++;
    fields[MILLISECONDS] = r % ONE_SECOND;
  } else {
    _$jscoverage['/gregorian.js'].lineData[396]++;
    fields[HOUR_OF_DAY] = fields[MINUTE] = fields[SECONDS] = fields[MILLISECONDS] = 0;
  }
  _$jscoverage['/gregorian.js'].lineData[403]++;
  var fixedDateJan1 = Utils.getFixedDate(year, GregorianCalendar.JANUARY, 1);
  _$jscoverage['/gregorian.js'].lineData[404]++;
  var dayOfYear = fixedDate - fixedDateJan1 + 1;
  _$jscoverage['/gregorian.js'].lineData[405]++;
  var fixDateMonth1 = fixedDate - date.dayOfMonth + 1;
  _$jscoverage['/gregorian.js'].lineData[407]++;
  fields[DAY_OF_YEAR] = dayOfYear;
  _$jscoverage['/gregorian.js'].lineData[408]++;
  fields[DAY_OF_WEEK_IN_MONTH] = toInt((date.dayOfMonth - 1) / 7) + 1;
  _$jscoverage['/gregorian.js'].lineData[410]++;
  var weekOfYear = getWeekNumber(this, fixedDateJan1, fixedDate);
  _$jscoverage['/gregorian.js'].lineData[413]++;
  if (visit26_413_1(weekOfYear == 0)) {
    _$jscoverage['/gregorian.js'].lineData[417]++;
    var fixedDec31 = fixedDateJan1 - 1;
    _$jscoverage['/gregorian.js'].lineData[418]++;
    var prevJan1 = fixedDateJan1 - getYearLength(year - 1);
    _$jscoverage['/gregorian.js'].lineData[419]++;
    weekOfYear = getWeekNumber(this, prevJan1, fixedDec31);
  } else {
    _$jscoverage['/gregorian.js'].lineData[422]++;
    if (visit27_422_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[423]++;
      var nextJan1 = fixedDateJan1 + getYearLength(year);
      _$jscoverage['/gregorian.js'].lineData[424]++;
      var nextJan1st = getDayOfWeekDateOnOrBefore(nextJan1 + 6, this.firstDayOfWeek);
      _$jscoverage['/gregorian.js'].lineData[425]++;
      var nDays = nextJan1st - nextJan1;
      _$jscoverage['/gregorian.js'].lineData[427]++;
      if (visit28_427_1(visit29_427_2(nDays >= this.minimalDaysInFirstWeek) && visit30_429_1(fixedDate >= (nextJan1st - 7)))) {
        _$jscoverage['/gregorian.js'].lineData[431]++;
        weekOfYear = 1;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[435]++;
  fields[WEEK_OF_YEAR] = weekOfYear;
  _$jscoverage['/gregorian.js'].lineData[436]++;
  fields[WEEK_OF_MONTH] = getWeekNumber(this, fixDateMonth1, fixedDate);
  _$jscoverage['/gregorian.js'].lineData[438]++;
  this.fieldsComputed = true;
}, 
  'computeTime': function() {
  _$jscoverage['/gregorian.js'].functionData[8]++;
  _$jscoverage['/gregorian.js'].lineData[447]++;
  if (visit31_447_1(!this.isSet(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[448]++;
    throw new Error('year must be set for KISSY GregorianCalendar');
  }
  _$jscoverage['/gregorian.js'].lineData[451]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[453]++;
  var year = fields[YEAR];
  _$jscoverage['/gregorian.js'].lineData[454]++;
  var timeOfDay = 0;
  _$jscoverage['/gregorian.js'].lineData[455]++;
  if (visit32_455_1(this.isSet(HOUR_OF_DAY))) {
    _$jscoverage['/gregorian.js'].lineData[456]++;
    timeOfDay += fields[HOUR_OF_DAY];
  }
  _$jscoverage['/gregorian.js'].lineData[458]++;
  timeOfDay *= 60;
  _$jscoverage['/gregorian.js'].lineData[459]++;
  timeOfDay += visit33_459_1(fields[MINUTE] || 0);
  _$jscoverage['/gregorian.js'].lineData[460]++;
  timeOfDay *= 60;
  _$jscoverage['/gregorian.js'].lineData[461]++;
  timeOfDay += visit34_461_1(fields[SECONDS] || 0);
  _$jscoverage['/gregorian.js'].lineData[462]++;
  timeOfDay *= 1000;
  _$jscoverage['/gregorian.js'].lineData[463]++;
  timeOfDay += visit35_463_1(fields[MILLISECONDS] || 0);
  _$jscoverage['/gregorian.js'].lineData[465]++;
  var fixedDate = 0;
  _$jscoverage['/gregorian.js'].lineData[467]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[469]++;
  fixedDate = fixedDate + this.getFixedDate();
  _$jscoverage['/gregorian.js'].lineData[472]++;
  var millis = (fixedDate - EPOCH_OFFSET) * ONE_DAY + timeOfDay;
  _$jscoverage['/gregorian.js'].lineData[474]++;
  millis -= this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[476]++;
  this.time = millis;
  _$jscoverage['/gregorian.js'].lineData[478]++;
  this.computeFields();
}, 
  complete: function() {
  _$jscoverage['/gregorian.js'].functionData[9]++;
  _$jscoverage['/gregorian.js'].lineData[489]++;
  if (visit36_489_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[490]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[492]++;
  if (visit37_492_1(!this.fieldsComputed)) {
    _$jscoverage['/gregorian.js'].lineData[493]++;
    this.computeFields();
  }
}, 
  getFixedDate: function() {
  _$jscoverage['/gregorian.js'].functionData[10]++;
  _$jscoverage['/gregorian.js'].lineData[499]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[501]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[503]++;
  var firstDayOfWeekCfg = self.firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[505]++;
  var year = fields[YEAR];
  _$jscoverage['/gregorian.js'].lineData[507]++;
  var month = GregorianCalendar.JANUARY;
  _$jscoverage['/gregorian.js'].lineData[509]++;
  if (visit38_509_1(self.isSet(MONTH))) {
    _$jscoverage['/gregorian.js'].lineData[510]++;
    month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[511]++;
    if (visit39_511_1(month > GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[512]++;
      year += toInt(month / 12);
      _$jscoverage['/gregorian.js'].lineData[513]++;
      month %= 12;
    } else {
      _$jscoverage['/gregorian.js'].lineData[514]++;
      if (visit40_514_1(month < GregorianCalendar.JANUARY)) {
        _$jscoverage['/gregorian.js'].lineData[515]++;
        year += floorDivide(month / 12);
        _$jscoverage['/gregorian.js'].lineData[516]++;
        month = mod(month, 12);
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[522]++;
  var fixedDate = Utils.getFixedDate(year, month, 1);
  _$jscoverage['/gregorian.js'].lineData[524]++;
  var dayOfWeek = self.firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[526]++;
  if (visit41_526_1(self.isSet(DAY_OF_WEEK))) {
    _$jscoverage['/gregorian.js'].lineData[527]++;
    dayOfWeek = fields[DAY_OF_WEEK];
  }
  _$jscoverage['/gregorian.js'].lineData[530]++;
  if (visit42_530_1(self.isSet(MONTH))) {
    _$jscoverage['/gregorian.js'].lineData[531]++;
    if (visit43_531_1(self.isSet(DAY_OF_MONTH))) {
      _$jscoverage['/gregorian.js'].lineData[532]++;
      fixedDate += fields[DAY_OF_MONTH] - 1;
    } else {
      _$jscoverage['/gregorian.js'].lineData[534]++;
      if (visit44_534_1(self.isSet(WEEK_OF_MONTH))) {
        _$jscoverage['/gregorian.js'].lineData[535]++;
        var firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
        _$jscoverage['/gregorian.js'].lineData[539]++;
        if (visit45_539_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
          _$jscoverage['/gregorian.js'].lineData[540]++;
          firstDayOfWeek -= 7;
        }
        _$jscoverage['/gregorian.js'].lineData[543]++;
        if (visit46_543_1(dayOfWeek != firstDayOfWeekCfg)) {
          _$jscoverage['/gregorian.js'].lineData[544]++;
          firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
        }
        _$jscoverage['/gregorian.js'].lineData[547]++;
        fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_MONTH] - 1);
      } else {
        _$jscoverage['/gregorian.js'].lineData[549]++;
        var dowim;
        _$jscoverage['/gregorian.js'].lineData[550]++;
        if (visit47_550_1(self.isSet(DAY_OF_WEEK_IN_MONTH))) {
          _$jscoverage['/gregorian.js'].lineData[551]++;
          dowim = fields[DAY_OF_WEEK_IN_MONTH];
        } else {
          _$jscoverage['/gregorian.js'].lineData[553]++;
          dowim = 1;
        }
        _$jscoverage['/gregorian.js'].lineData[555]++;
        var lastDate = (7 * dowim);
        _$jscoverage['/gregorian.js'].lineData[556]++;
        if (visit48_556_1(dowim < 0)) {
          _$jscoverage['/gregorian.js'].lineData[557]++;
          lastDate = getMonthLength(year, month) + (7 * (dowim + 1));
        }
        _$jscoverage['/gregorian.js'].lineData[559]++;
        fixedDate = getDayOfWeekDateOnOrBefore(fixedDate + lastDate - 1, dayOfWeek);
      }
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[564]++;
    if (visit49_564_1(self.isSet(DAY_OF_YEAR))) {
      _$jscoverage['/gregorian.js'].lineData[565]++;
      fixedDate += fields[DAY_OF_YEAR] - 1;
    } else {
      _$jscoverage['/gregorian.js'].lineData[567]++;
      firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
      _$jscoverage['/gregorian.js'].lineData[570]++;
      if (visit50_570_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
        _$jscoverage['/gregorian.js'].lineData[571]++;
        firstDayOfWeek -= 7;
      }
      _$jscoverage['/gregorian.js'].lineData[573]++;
      if (visit51_573_1(dayOfWeek != firstDayOfWeekCfg)) {
        _$jscoverage['/gregorian.js'].lineData[574]++;
        firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
      }
      _$jscoverage['/gregorian.js'].lineData[576]++;
      fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_YEAR] - 1);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[580]++;
  return fixedDate;
}, 
  getTime: function() {
  _$jscoverage['/gregorian.js'].functionData[11]++;
  _$jscoverage['/gregorian.js'].lineData[589]++;
  if (visit52_589_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[590]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[592]++;
  return this.time;
}, 
  'setTime': function(time) {
  _$jscoverage['/gregorian.js'].functionData[12]++;
  _$jscoverage['/gregorian.js'].lineData[600]++;
  this.time = time;
  _$jscoverage['/gregorian.js'].lineData[601]++;
  this.fieldsComputed = false;
  _$jscoverage['/gregorian.js'].lineData[602]++;
  this.complete();
}, 
  get: function(field) {
  _$jscoverage['/gregorian.js'].functionData[13]++;
  _$jscoverage['/gregorian.js'].lineData[611]++;
  this.complete();
  _$jscoverage['/gregorian.js'].lineData[612]++;
  return this.fields[field];
}, 
  set: function(field, v) {
  _$jscoverage['/gregorian.js'].functionData[14]++;
  _$jscoverage['/gregorian.js'].lineData[701]++;
  var len = arguments.length;
  _$jscoverage['/gregorian.js'].lineData[702]++;
  if (visit53_702_1(len == 2)) {
    _$jscoverage['/gregorian.js'].lineData[703]++;
    this.fields[field] = v;
  } else {
    _$jscoverage['/gregorian.js'].lineData[704]++;
    if (visit54_704_1(len < MILLISECONDS + 1)) {
      _$jscoverage['/gregorian.js'].lineData[705]++;
      for (var i = 0; visit55_705_1(i < len); i++) {
        _$jscoverage['/gregorian.js'].lineData[706]++;
        this.fields[YEAR + i] = arguments[i];
      }
    } else {
      _$jscoverage['/gregorian.js'].lineData[709]++;
      throw new Error('illegal arguments for KISSY GregorianCalendar set');
    }
  }
  _$jscoverage['/gregorian.js'].lineData[711]++;
  this.time = undefined;
}, 
  add: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[15]++;
  _$jscoverage['/gregorian.js'].lineData[820]++;
  if (visit56_820_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[821]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[823]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[824]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[826]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[827]++;
  if (visit57_827_1(field === YEAR)) {
    _$jscoverage['/gregorian.js'].lineData[828]++;
    value += amount;
    _$jscoverage['/gregorian.js'].lineData[829]++;
    self.set(YEAR, value);
    _$jscoverage['/gregorian.js'].lineData[830]++;
    adjustDayOfMonth(self);
  } else {
    _$jscoverage['/gregorian.js'].lineData[831]++;
    if (visit58_831_1(field === MONTH)) {
      _$jscoverage['/gregorian.js'].lineData[832]++;
      value += amount;
      _$jscoverage['/gregorian.js'].lineData[833]++;
      var yearAmount = floorDivide(value / 12);
      _$jscoverage['/gregorian.js'].lineData[834]++;
      value = mod(value, 12);
      _$jscoverage['/gregorian.js'].lineData[835]++;
      if (visit59_835_1(yearAmount)) {
        _$jscoverage['/gregorian.js'].lineData[836]++;
        self.set(YEAR, fields[YEAR] + yearAmount);
      }
      _$jscoverage['/gregorian.js'].lineData[838]++;
      self.set(MONTH, value);
      _$jscoverage['/gregorian.js'].lineData[839]++;
      adjustDayOfMonth(self);
    } else {
      _$jscoverage['/gregorian.js'].lineData[841]++;
      switch (field) {
        case HOUR_OF_DAY:
          _$jscoverage['/gregorian.js'].lineData[843]++;
          amount *= ONE_HOUR;
          _$jscoverage['/gregorian.js'].lineData[844]++;
          break;
        case MINUTE:
          _$jscoverage['/gregorian.js'].lineData[846]++;
          amount *= ONE_MINUTE;
          _$jscoverage['/gregorian.js'].lineData[847]++;
          break;
        case SECONDS:
          _$jscoverage['/gregorian.js'].lineData[849]++;
          amount *= ONE_SECOND;
          _$jscoverage['/gregorian.js'].lineData[850]++;
          break;
        case MILLISECONDS:
          _$jscoverage['/gregorian.js'].lineData[852]++;
          break;
        case WEEK_OF_MONTH:
        case WEEK_OF_YEAR:
        case DAY_OF_WEEK_IN_MONTH:
          _$jscoverage['/gregorian.js'].lineData[856]++;
          amount *= ONE_WEEK;
          _$jscoverage['/gregorian.js'].lineData[857]++;
          break;
        case DAY_OF_WEEK:
        case DAY_OF_YEAR:
        case DAY_OF_MONTH:
          _$jscoverage['/gregorian.js'].lineData[861]++;
          amount *= ONE_DAY;
          _$jscoverage['/gregorian.js'].lineData[862]++;
          break;
        default:
          _$jscoverage['/gregorian.js'].lineData[864]++;
          throw new Error('illegal field for add');
          _$jscoverage['/gregorian.js'].lineData[865]++;
          break;
      }
      _$jscoverage['/gregorian.js'].lineData[867]++;
      self.setTime(self.time + amount);
    }
  }
}, 
  getRolledValue: function(value, amount, min, max) {
  _$jscoverage['/gregorian.js'].functionData[16]++;
  _$jscoverage['/gregorian.js'].lineData[952]++;
  var diff = value - min;
  _$jscoverage['/gregorian.js'].lineData[953]++;
  var range = max - min + 1;
  _$jscoverage['/gregorian.js'].lineData[954]++;
  amount %= range;
  _$jscoverage['/gregorian.js'].lineData[955]++;
  return min + (diff + amount + range) % range;
}, 
  roll: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[17]++;
  _$jscoverage['/gregorian.js'].lineData[980]++;
  if (visit60_980_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[981]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[983]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[985]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[986]++;
  var min = self.getActualMinimum(field);
  _$jscoverage['/gregorian.js'].lineData[987]++;
  var max = self.getActualMaximum(field);
  _$jscoverage['/gregorian.js'].lineData[988]++;
  value = self.getRolledValue(value, amount, min, max);
  _$jscoverage['/gregorian.js'].lineData[990]++;
  self.set(field, value);
  _$jscoverage['/gregorian.js'].lineData[993]++;
  switch (field) {
    case MONTH:
      _$jscoverage['/gregorian.js'].lineData[995]++;
      adjustDayOfMonth(self);
      _$jscoverage['/gregorian.js'].lineData[996]++;
      break;
    default:
      _$jscoverage['/gregorian.js'].lineData[999]++;
      self.updateFieldsBySet(field);
      _$jscoverage['/gregorian.js'].lineData[1000]++;
      break;
  }
}, 
  updateFieldsBySet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[18]++;
  _$jscoverage['/gregorian.js'].lineData[1085]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1086]++;
  switch (field) {
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[1088]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1089]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1091]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1092]++;
      break;
    case DAY_OF_WEEK:
      _$jscoverage['/gregorian.js'].lineData[1094]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1095]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1097]++;
      fields[DAY_OF_YEAR] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1098]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1099]++;
      break;
  }
}, 
  getTimezoneOffset: function() {
  _$jscoverage['/gregorian.js'].functionData[19]++;
  _$jscoverage['/gregorian.js'].lineData[1108]++;
  return this.timezoneOffset;
}, 
  'setTimezoneOffset': function(timezoneOffset) {
  _$jscoverage['/gregorian.js'].functionData[20]++;
  _$jscoverage['/gregorian.js'].lineData[1115]++;
  if (visit61_1115_1(this.timezoneOffset != timezoneOffset)) {
    _$jscoverage['/gregorian.js'].lineData[1116]++;
    this.fieldsComputed = undefined;
    _$jscoverage['/gregorian.js'].lineData[1117]++;
    this.timezoneOffset = timezoneOffset;
  }
}, 
  'setFirstDayOfWeek': function(firstDayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[21]++;
  _$jscoverage['/gregorian.js'].lineData[1125]++;
  if (visit62_1125_1(this.firstDayOfWeek != firstDayOfWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1126]++;
    this.firstDayOfWeek = firstDayOfWeek;
    _$jscoverage['/gregorian.js'].lineData[1127]++;
    this.fieldsComputed = false;
  }
}, 
  'getFirstDayOfWeek': function() {
  _$jscoverage['/gregorian.js'].functionData[22]++;
  _$jscoverage['/gregorian.js'].lineData[1136]++;
  return this.firstDayOfWeek;
}, 
  'setMinimalDaysInFirstWeek': function(minimalDaysInFirstWeek) {
  _$jscoverage['/gregorian.js'].functionData[23]++;
  _$jscoverage['/gregorian.js'].lineData[1147]++;
  if (visit63_1147_1(this.minimalDaysInFirstWeek != minimalDaysInFirstWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1148]++;
    this.minimalDaysInFirstWeek = minimalDaysInFirstWeek;
    _$jscoverage['/gregorian.js'].lineData[1149]++;
    this.fieldsComputed = false;
  }
}, 
  'getMinimalDaysInFirstWeek': function() {
  _$jscoverage['/gregorian.js'].functionData[24]++;
  _$jscoverage['/gregorian.js'].lineData[1161]++;
  return this.minimalDaysInFirstWeek;
}, 
  'getWeeksInWeekYear': function() {
  _$jscoverage['/gregorian.js'].functionData[25]++;
  _$jscoverage['/gregorian.js'].lineData[1178]++;
  var weekYear = this.getWeekYear();
  _$jscoverage['/gregorian.js'].lineData[1179]++;
  if (visit64_1179_1(weekYear == this.get(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[1180]++;
    return this.getActualMaximum(WEEK_OF_YEAR);
  }
  _$jscoverage['/gregorian.js'].lineData[1183]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1184]++;
  gc.setWeekDate(weekYear, 2, this.get(DAY_OF_WEEK));
  _$jscoverage['/gregorian.js'].lineData[1185]++;
  return gc.getActualMaximum(WEEK_OF_YEAR);
}, 
  getWeekYear: function() {
  _$jscoverage['/gregorian.js'].functionData[26]++;
  _$jscoverage['/gregorian.js'].lineData[1197]++;
  var year = this.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1198]++;
  var weekOfYear = this.get(WEEK_OF_YEAR);
  _$jscoverage['/gregorian.js'].lineData[1199]++;
  var month = this.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1200]++;
  if (visit65_1200_1(month == GregorianCalendar.JANUARY)) {
    _$jscoverage['/gregorian.js'].lineData[1201]++;
    if (visit66_1201_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[1202]++;
      --year;
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[1204]++;
    if (visit67_1204_1(month == GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[1205]++;
      if (visit68_1205_1(weekOfYear == 1)) {
        _$jscoverage['/gregorian.js'].lineData[1206]++;
        ++year;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1209]++;
  return year;
}, 
  'setWeekDate': function(weekYear, weekOfYear, dayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[27]++;
  _$jscoverage['/gregorian.js'].lineData[1222]++;
  if (visit69_1222_1(visit70_1222_2(dayOfWeek < GregorianCalendar.SUNDAY) || visit71_1222_3(dayOfWeek > GregorianCalendar.SATURDAY))) {
    _$jscoverage['/gregorian.js'].lineData[1223]++;
    throw new Error("invalid dayOfWeek: " + dayOfWeek);
  }
  _$jscoverage['/gregorian.js'].lineData[1225]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1228]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1229]++;
  gc.clear();
  _$jscoverage['/gregorian.js'].lineData[1230]++;
  gc.setTimezoneOffset(0);
  _$jscoverage['/gregorian.js'].lineData[1231]++;
  gc.set(YEAR, weekYear);
  _$jscoverage['/gregorian.js'].lineData[1232]++;
  gc.set(WEEK_OF_YEAR, 1);
  _$jscoverage['/gregorian.js'].lineData[1233]++;
  gc.set(DAY_OF_WEEK, this.getFirstDayOfWeek());
  _$jscoverage['/gregorian.js'].lineData[1234]++;
  var days = dayOfWeek - this.getFirstDayOfWeek();
  _$jscoverage['/gregorian.js'].lineData[1235]++;
  if (visit72_1235_1(days < 0)) {
    _$jscoverage['/gregorian.js'].lineData[1236]++;
    days += 7;
  }
  _$jscoverage['/gregorian.js'].lineData[1238]++;
  days += 7 * (weekOfYear - 1);
  _$jscoverage['/gregorian.js'].lineData[1239]++;
  if (visit73_1239_1(days != 0)) {
    _$jscoverage['/gregorian.js'].lineData[1240]++;
    gc.add(DAY_OF_YEAR, days);
  } else {
    _$jscoverage['/gregorian.js'].lineData[1242]++;
    gc.complete();
  }
  _$jscoverage['/gregorian.js'].lineData[1244]++;
  fields[YEAR] = gc.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1245]++;
  fields[MONTH] = gc.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1246]++;
  fields[DAY_OF_MONTH] = gc.get(DAY_OF_MONTH);
  _$jscoverage['/gregorian.js'].lineData[1247]++;
  this.complete();
}, 
  clone: function() {
  _$jscoverage['/gregorian.js'].functionData[28]++;
  _$jscoverage['/gregorian.js'].lineData[1254]++;
  if (visit74_1254_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1255]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[1257]++;
  var cal = new GregorianCalendar(this.timezoneOffset, this.locale);
  _$jscoverage['/gregorian.js'].lineData[1258]++;
  cal.setTime(this.time);
  _$jscoverage['/gregorian.js'].lineData[1259]++;
  return cal;
}, 
  equals: function(obj) {
  _$jscoverage['/gregorian.js'].functionData[29]++;
  _$jscoverage['/gregorian.js'].lineData[1271]++;
  return visit75_1271_1(visit76_1271_2(this.getTime() == obj.getTime()) && visit77_1272_1(visit78_1272_2(this.firstDayOfWeek == obj.firstDayOfWeek) && visit79_1273_1(visit80_1273_2(this.timezoneOffset == obj.timezoneOffset) && visit81_1274_1(this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek))));
}, 
  clear: function(field) {
  _$jscoverage['/gregorian.js'].functionData[30]++;
  _$jscoverage['/gregorian.js'].lineData[1285]++;
  if (visit82_1285_1(field === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1286]++;
    this.field = [];
  } else {
    _$jscoverage['/gregorian.js'].lineData[1288]++;
    this.fields[field] = undefined;
  }
  _$jscoverage['/gregorian.js'].lineData[1290]++;
  this.time = undefined;
  _$jscoverage['/gregorian.js'].lineData[1291]++;
  this.fieldsComputed = false;
}};
  _$jscoverage['/gregorian.js'].lineData[1295]++;
  var GregorianCalendarProto = GregorianCalendar.prototype;
  _$jscoverage['/gregorian.js'].lineData[1297]++;
  if (visit83_1297_1('@DEBUG@')) {
    _$jscoverage['/gregorian.js'].lineData[1299]++;
    GregorianCalendarProto.getDayOfMonth = GregorianCalendarProto.getHourOfDay = GregorianCalendarProto.getWeekOfYear = GregorianCalendarProto.getWeekOfMonth = GregorianCalendarProto.getDayOfYear = GregorianCalendarProto.getDayOfWeek = GregorianCalendarProto.getDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1307]++;
    GregorianCalendarProto.addDayOfMonth = GregorianCalendarProto.addMonth = GregorianCalendarProto.addYear = GregorianCalendarProto.addMinutes = GregorianCalendarProto.addSeconds = GregorianCalendarProto.addMilliSeconds = GregorianCalendarProto.addHourOfDay = GregorianCalendarProto.addWeekOfYear = GregorianCalendarProto.addWeekOfMonth = GregorianCalendarProto.addDayOfYear = GregorianCalendarProto.addDayOfWeek = GregorianCalendarProto.addDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1320]++;
    GregorianCalendarProto.isSetDayOfMonth = GregorianCalendarProto.isSetMonth = GregorianCalendarProto.isSetYear = GregorianCalendarProto.isSetMinutes = GregorianCalendarProto.isSetSeconds = GregorianCalendarProto.isSetMilliSeconds = GregorianCalendarProto.isSetHourOfDay = GregorianCalendarProto.isSetWeekOfYear = GregorianCalendarProto.isSetWeekOfMonth = GregorianCalendarProto.isSetDayOfYear = GregorianCalendarProto.isSetDayOfWeek = GregorianCalendarProto.isSetDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1332]++;
    GregorianCalendarProto.setDayOfMonth = GregorianCalendarProto.setHourOfDay = GregorianCalendarProto.setWeekOfYear = GregorianCalendarProto.setWeekOfMonth = GregorianCalendarProto.setDayOfYear = GregorianCalendarProto.setDayOfWeek = GregorianCalendarProto.setDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1340]++;
    GregorianCalendarProto.rollDayOfMonth = GregorianCalendarProto.rollMonth = GregorianCalendarProto.rollYear = GregorianCalendarProto.rollMinutes = GregorianCalendarProto.rollSeconds = GregorianCalendarProto.rollMilliSeconds = GregorianCalendarProto.rollHourOfDay = GregorianCalendarProto.rollWeekOfYear = GregorianCalendarProto.rollWeekOfMonth = GregorianCalendarProto.rollDayOfYear = GregorianCalendarProto.rollDayOfWeek = GregorianCalendarProto.rollDayOfWeekInMonth = S.noop;
  }
  _$jscoverage['/gregorian.js'].lineData[1353]++;
  S.each(fields, function(f, index) {
  _$jscoverage['/gregorian.js'].functionData[31]++;
  _$jscoverage['/gregorian.js'].lineData[1354]++;
  if (visit84_1354_1(f)) {
    _$jscoverage['/gregorian.js'].lineData[1355]++;
    GregorianCalendarProto['get' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[32]++;
  _$jscoverage['/gregorian.js'].lineData[1356]++;
  return this.get(index);
};
    _$jscoverage['/gregorian.js'].lineData[1359]++;
    GregorianCalendarProto['isSet' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[33]++;
  _$jscoverage['/gregorian.js'].lineData[1360]++;
  return this.isSet(index);
};
    _$jscoverage['/gregorian.js'].lineData[1363]++;
    GregorianCalendarProto['set' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[34]++;
  _$jscoverage['/gregorian.js'].lineData[1364]++;
  return this.set(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1367]++;
    GregorianCalendarProto['add' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[35]++;
  _$jscoverage['/gregorian.js'].lineData[1368]++;
  return this.add(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1371]++;
    GregorianCalendarProto['roll' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[36]++;
  _$jscoverage['/gregorian.js'].lineData[1372]++;
  return this.roll(index, v);
};
  }
});
  _$jscoverage['/gregorian.js'].lineData[1380]++;
  function adjustDayOfMonth(self) {
    _$jscoverage['/gregorian.js'].functionData[37]++;
    _$jscoverage['/gregorian.js'].lineData[1381]++;
    var fields = self.fields;
    _$jscoverage['/gregorian.js'].lineData[1382]++;
    var year = fields[YEAR];
    _$jscoverage['/gregorian.js'].lineData[1383]++;
    var month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[1384]++;
    var monthLen = getMonthLength(year, month);
    _$jscoverage['/gregorian.js'].lineData[1385]++;
    var dayOfMonth = fields[DAY_OF_MONTH];
    _$jscoverage['/gregorian.js'].lineData[1386]++;
    if (visit85_1386_1(dayOfMonth > monthLen)) {
      _$jscoverage['/gregorian.js'].lineData[1387]++;
      self.set(DAY_OF_MONTH, monthLen);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1391]++;
  function getMonthLength(year, month) {
    _$jscoverage['/gregorian.js'].functionData[38]++;
    _$jscoverage['/gregorian.js'].lineData[1392]++;
    return isLeapYear(year) ? LEAP_MONTH_LENGTH[month] : MONTH_LENGTH[month];
  }
  _$jscoverage['/gregorian.js'].lineData[1395]++;
  function getYearLength(year) {
    _$jscoverage['/gregorian.js'].functionData[39]++;
    _$jscoverage['/gregorian.js'].lineData[1396]++;
    return isLeapYear(year) ? 366 : 365;
  }
  _$jscoverage['/gregorian.js'].lineData[1399]++;
  function getWeekNumber(self, fixedDay1, fixedDate) {
    _$jscoverage['/gregorian.js'].functionData[40]++;
    _$jscoverage['/gregorian.js'].lineData[1400]++;
    var fixedDay1st = getDayOfWeekDateOnOrBefore(fixedDay1 + 6, self.firstDayOfWeek);
    _$jscoverage['/gregorian.js'].lineData[1401]++;
    var nDays = (fixedDay1st - fixedDay1);
    _$jscoverage['/gregorian.js'].lineData[1402]++;
    if (visit86_1402_1(nDays >= self.minimalDaysInFirstWeek)) {
      _$jscoverage['/gregorian.js'].lineData[1403]++;
      fixedDay1st -= 7;
    }
    _$jscoverage['/gregorian.js'].lineData[1405]++;
    var normalizedDayOfPeriod = (fixedDate - fixedDay1st);
    _$jscoverage['/gregorian.js'].lineData[1406]++;
    return floorDivide(normalizedDayOfPeriod / 7) + 1;
  }
  _$jscoverage['/gregorian.js'].lineData[1409]++;
  function getDayOfWeekDateOnOrBefore(fixedDate, dayOfWeek) {
    _$jscoverage['/gregorian.js'].functionData[41]++;
    _$jscoverage['/gregorian.js'].lineData[1412]++;
    return fixedDate - mod(fixedDate - dayOfWeek, 7);
  }
  _$jscoverage['/gregorian.js'].lineData[1417]++;
  return GregorianCalendar;
}, {
  requires: ['i18n!date', './gregorian/utils', './gregorian/const']});
