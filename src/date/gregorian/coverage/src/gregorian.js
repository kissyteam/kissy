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
  _$jscoverage['/gregorian.js'].lineData[8] = 0;
  _$jscoverage['/gregorian.js'].lineData[9] = 0;
  _$jscoverage['/gregorian.js'].lineData[10] = 0;
  _$jscoverage['/gregorian.js'].lineData[42] = 0;
  _$jscoverage['/gregorian.js'].lineData[44] = 0;
  _$jscoverage['/gregorian.js'].lineData[46] = 0;
  _$jscoverage['/gregorian.js'].lineData[47] = 0;
  _$jscoverage['/gregorian.js'].lineData[48] = 0;
  _$jscoverage['/gregorian.js'].lineData[49] = 0;
  _$jscoverage['/gregorian.js'].lineData[50] = 0;
  _$jscoverage['/gregorian.js'].lineData[53] = 0;
  _$jscoverage['/gregorian.js'].lineData[55] = 0;
  _$jscoverage['/gregorian.js'].lineData[57] = 0;
  _$jscoverage['/gregorian.js'].lineData[64] = 0;
  _$jscoverage['/gregorian.js'].lineData[70] = 0;
  _$jscoverage['/gregorian.js'].lineData[76] = 0;
  _$jscoverage['/gregorian.js'].lineData[84] = 0;
  _$jscoverage['/gregorian.js'].lineData[86] = 0;
  _$jscoverage['/gregorian.js'].lineData[88] = 0;
  _$jscoverage['/gregorian.js'].lineData[89] = 0;
  _$jscoverage['/gregorian.js'].lineData[93] = 0;
  _$jscoverage['/gregorian.js'].lineData[95] = 0;
  _$jscoverage['/gregorian.js'].lineData[184] = 0;
  _$jscoverage['/gregorian.js'].lineData[192] = 0;
  _$jscoverage['/gregorian.js'].lineData[193] = 0;
  _$jscoverage['/gregorian.js'].lineData[194] = 0;
  _$jscoverage['/gregorian.js'].lineData[195] = 0;
  _$jscoverage['/gregorian.js'].lineData[196] = 0;
  _$jscoverage['/gregorian.js'].lineData[197] = 0;
  _$jscoverage['/gregorian.js'].lineData[199] = 0;
  _$jscoverage['/gregorian.js'].lineData[200] = 0;
  _$jscoverage['/gregorian.js'].lineData[201] = 0;
  _$jscoverage['/gregorian.js'].lineData[202] = 0;
  _$jscoverage['/gregorian.js'].lineData[204] = 0;
  _$jscoverage['/gregorian.js'].lineData[205] = 0;
  _$jscoverage['/gregorian.js'].lineData[207] = 0;
  _$jscoverage['/gregorian.js'].lineData[208] = 0;
  _$jscoverage['/gregorian.js'].lineData[210] = 0;
  _$jscoverage['/gregorian.js'].lineData[211] = 0;
  _$jscoverage['/gregorian.js'].lineData[212] = 0;
  _$jscoverage['/gregorian.js'].lineData[213] = 0;
  _$jscoverage['/gregorian.js'].lineData[214] = 0;
  _$jscoverage['/gregorian.js'].lineData[216] = 0;
  _$jscoverage['/gregorian.js'].lineData[218] = 0;
  _$jscoverage['/gregorian.js'].lineData[223] = 0;
  _$jscoverage['/gregorian.js'].lineData[241] = 0;
  _$jscoverage['/gregorian.js'].lineData[257] = 0;
  _$jscoverage['/gregorian.js'].lineData[269] = 0;
  _$jscoverage['/gregorian.js'].lineData[277] = 0;
  _$jscoverage['/gregorian.js'].lineData[291] = 0;
  _$jscoverage['/gregorian.js'].lineData[292] = 0;
  _$jscoverage['/gregorian.js'].lineData[295] = 0;
  _$jscoverage['/gregorian.js'].lineData[296] = 0;
  _$jscoverage['/gregorian.js'].lineData[297] = 0;
  _$jscoverage['/gregorian.js'].lineData[298] = 0;
  _$jscoverage['/gregorian.js'].lineData[301] = 0;
  _$jscoverage['/gregorian.js'].lineData[314] = 0;
  _$jscoverage['/gregorian.js'].lineData[315] = 0;
  _$jscoverage['/gregorian.js'].lineData[317] = 0;
  _$jscoverage['/gregorian.js'].lineData[319] = 0;
  _$jscoverage['/gregorian.js'].lineData[321] = 0;
  _$jscoverage['/gregorian.js'].lineData[322] = 0;
  _$jscoverage['/gregorian.js'].lineData[325] = 0;
  _$jscoverage['/gregorian.js'].lineData[326] = 0;
  _$jscoverage['/gregorian.js'].lineData[327] = 0;
  _$jscoverage['/gregorian.js'].lineData[328] = 0;
  _$jscoverage['/gregorian.js'].lineData[330] = 0;
  _$jscoverage['/gregorian.js'].lineData[333] = 0;
  _$jscoverage['/gregorian.js'].lineData[334] = 0;
  _$jscoverage['/gregorian.js'].lineData[335] = 0;
  _$jscoverage['/gregorian.js'].lineData[338] = 0;
  _$jscoverage['/gregorian.js'].lineData[339] = 0;
  _$jscoverage['/gregorian.js'].lineData[342] = 0;
  _$jscoverage['/gregorian.js'].lineData[343] = 0;
  _$jscoverage['/gregorian.js'].lineData[345] = 0;
  _$jscoverage['/gregorian.js'].lineData[346] = 0;
  _$jscoverage['/gregorian.js'].lineData[348] = 0;
  _$jscoverage['/gregorian.js'].lineData[359] = 0;
  _$jscoverage['/gregorian.js'].lineData[368] = 0;
  _$jscoverage['/gregorian.js'].lineData[369] = 0;
  _$jscoverage['/gregorian.js'].lineData[370] = 0;
  _$jscoverage['/gregorian.js'].lineData[371] = 0;
  _$jscoverage['/gregorian.js'].lineData[372] = 0;
  _$jscoverage['/gregorian.js'].lineData[373] = 0;
  _$jscoverage['/gregorian.js'].lineData[374] = 0;
  _$jscoverage['/gregorian.js'].lineData[375] = 0;
  _$jscoverage['/gregorian.js'].lineData[376] = 0;
  _$jscoverage['/gregorian.js'].lineData[378] = 0;
  _$jscoverage['/gregorian.js'].lineData[379] = 0;
  _$jscoverage['/gregorian.js'].lineData[380] = 0;
  _$jscoverage['/gregorian.js'].lineData[384] = 0;
  _$jscoverage['/gregorian.js'].lineData[386] = 0;
  _$jscoverage['/gregorian.js'].lineData[388] = 0;
  _$jscoverage['/gregorian.js'].lineData[390] = 0;
  _$jscoverage['/gregorian.js'].lineData[391] = 0;
  _$jscoverage['/gregorian.js'].lineData[392] = 0;
  _$jscoverage['/gregorian.js'].lineData[393] = 0;
  _$jscoverage['/gregorian.js'].lineData[394] = 0;
  _$jscoverage['/gregorian.js'].lineData[396] = 0;
  _$jscoverage['/gregorian.js'].lineData[397] = 0;
  _$jscoverage['/gregorian.js'].lineData[398] = 0;
  _$jscoverage['/gregorian.js'].lineData[399] = 0;
  _$jscoverage['/gregorian.js'].lineData[400] = 0;
  _$jscoverage['/gregorian.js'].lineData[401] = 0;
  _$jscoverage['/gregorian.js'].lineData[402] = 0;
  _$jscoverage['/gregorian.js'].lineData[404] = 0;
  _$jscoverage['/gregorian.js'].lineData[411] = 0;
  _$jscoverage['/gregorian.js'].lineData[412] = 0;
  _$jscoverage['/gregorian.js'].lineData[413] = 0;
  _$jscoverage['/gregorian.js'].lineData[415] = 0;
  _$jscoverage['/gregorian.js'].lineData[416] = 0;
  _$jscoverage['/gregorian.js'].lineData[418] = 0;
  _$jscoverage['/gregorian.js'].lineData[421] = 0;
  _$jscoverage['/gregorian.js'].lineData[425] = 0;
  _$jscoverage['/gregorian.js'].lineData[426] = 0;
  _$jscoverage['/gregorian.js'].lineData[427] = 0;
  _$jscoverage['/gregorian.js'].lineData[430] = 0;
  _$jscoverage['/gregorian.js'].lineData[431] = 0;
  _$jscoverage['/gregorian.js'].lineData[432] = 0;
  _$jscoverage['/gregorian.js'].lineData[433] = 0;
  _$jscoverage['/gregorian.js'].lineData[435] = 0;
  _$jscoverage['/gregorian.js'].lineData[439] = 0;
  _$jscoverage['/gregorian.js'].lineData[443] = 0;
  _$jscoverage['/gregorian.js'].lineData[444] = 0;
  _$jscoverage['/gregorian.js'].lineData[446] = 0;
  _$jscoverage['/gregorian.js'].lineData[455] = 0;
  _$jscoverage['/gregorian.js'].lineData[456] = 0;
  _$jscoverage['/gregorian.js'].lineData[459] = 0;
  _$jscoverage['/gregorian.js'].lineData[461] = 0;
  _$jscoverage['/gregorian.js'].lineData[462] = 0;
  _$jscoverage['/gregorian.js'].lineData[463] = 0;
  _$jscoverage['/gregorian.js'].lineData[464] = 0;
  _$jscoverage['/gregorian.js'].lineData[466] = 0;
  _$jscoverage['/gregorian.js'].lineData[467] = 0;
  _$jscoverage['/gregorian.js'].lineData[468] = 0;
  _$jscoverage['/gregorian.js'].lineData[469] = 0;
  _$jscoverage['/gregorian.js'].lineData[470] = 0;
  _$jscoverage['/gregorian.js'].lineData[471] = 0;
  _$jscoverage['/gregorian.js'].lineData[473] = 0;
  _$jscoverage['/gregorian.js'].lineData[475] = 0;
  _$jscoverage['/gregorian.js'].lineData[477] = 0;
  _$jscoverage['/gregorian.js'].lineData[480] = 0;
  _$jscoverage['/gregorian.js'].lineData[482] = 0;
  _$jscoverage['/gregorian.js'].lineData[484] = 0;
  _$jscoverage['/gregorian.js'].lineData[486] = 0;
  _$jscoverage['/gregorian.js'].lineData[497] = 0;
  _$jscoverage['/gregorian.js'].lineData[498] = 0;
  _$jscoverage['/gregorian.js'].lineData[500] = 0;
  _$jscoverage['/gregorian.js'].lineData[501] = 0;
  _$jscoverage['/gregorian.js'].lineData[507] = 0;
  _$jscoverage['/gregorian.js'].lineData[509] = 0;
  _$jscoverage['/gregorian.js'].lineData[511] = 0;
  _$jscoverage['/gregorian.js'].lineData[513] = 0;
  _$jscoverage['/gregorian.js'].lineData[515] = 0;
  _$jscoverage['/gregorian.js'].lineData[517] = 0;
  _$jscoverage['/gregorian.js'].lineData[518] = 0;
  _$jscoverage['/gregorian.js'].lineData[519] = 0;
  _$jscoverage['/gregorian.js'].lineData[520] = 0;
  _$jscoverage['/gregorian.js'].lineData[521] = 0;
  _$jscoverage['/gregorian.js'].lineData[522] = 0;
  _$jscoverage['/gregorian.js'].lineData[523] = 0;
  _$jscoverage['/gregorian.js'].lineData[524] = 0;
  _$jscoverage['/gregorian.js'].lineData[530] = 0;
  _$jscoverage['/gregorian.js'].lineData[531] = 0;
  _$jscoverage['/gregorian.js'].lineData[532] = 0;
  _$jscoverage['/gregorian.js'].lineData[534] = 0;
  _$jscoverage['/gregorian.js'].lineData[535] = 0;
  _$jscoverage['/gregorian.js'].lineData[538] = 0;
  _$jscoverage['/gregorian.js'].lineData[539] = 0;
  _$jscoverage['/gregorian.js'].lineData[540] = 0;
  _$jscoverage['/gregorian.js'].lineData[542] = 0;
  _$jscoverage['/gregorian.js'].lineData[543] = 0;
  _$jscoverage['/gregorian.js'].lineData[547] = 0;
  _$jscoverage['/gregorian.js'].lineData[548] = 0;
  _$jscoverage['/gregorian.js'].lineData[551] = 0;
  _$jscoverage['/gregorian.js'].lineData[552] = 0;
  _$jscoverage['/gregorian.js'].lineData[555] = 0;
  _$jscoverage['/gregorian.js'].lineData[557] = 0;
  _$jscoverage['/gregorian.js'].lineData[558] = 0;
  _$jscoverage['/gregorian.js'].lineData[559] = 0;
  _$jscoverage['/gregorian.js'].lineData[561] = 0;
  _$jscoverage['/gregorian.js'].lineData[563] = 0;
  _$jscoverage['/gregorian.js'].lineData[564] = 0;
  _$jscoverage['/gregorian.js'].lineData[565] = 0;
  _$jscoverage['/gregorian.js'].lineData[567] = 0;
  _$jscoverage['/gregorian.js'].lineData[572] = 0;
  _$jscoverage['/gregorian.js'].lineData[573] = 0;
  _$jscoverage['/gregorian.js'].lineData[575] = 0;
  _$jscoverage['/gregorian.js'].lineData[578] = 0;
  _$jscoverage['/gregorian.js'].lineData[579] = 0;
  _$jscoverage['/gregorian.js'].lineData[581] = 0;
  _$jscoverage['/gregorian.js'].lineData[582] = 0;
  _$jscoverage['/gregorian.js'].lineData[584] = 0;
  _$jscoverage['/gregorian.js'].lineData[588] = 0;
  _$jscoverage['/gregorian.js'].lineData[597] = 0;
  _$jscoverage['/gregorian.js'].lineData[598] = 0;
  _$jscoverage['/gregorian.js'].lineData[600] = 0;
  _$jscoverage['/gregorian.js'].lineData[608] = 0;
  _$jscoverage['/gregorian.js'].lineData[609] = 0;
  _$jscoverage['/gregorian.js'].lineData[610] = 0;
  _$jscoverage['/gregorian.js'].lineData[619] = 0;
  _$jscoverage['/gregorian.js'].lineData[620] = 0;
  _$jscoverage['/gregorian.js'].lineData[709] = 0;
  _$jscoverage['/gregorian.js'].lineData[710] = 0;
  _$jscoverage['/gregorian.js'].lineData[711] = 0;
  _$jscoverage['/gregorian.js'].lineData[712] = 0;
  _$jscoverage['/gregorian.js'].lineData[713] = 0;
  _$jscoverage['/gregorian.js'].lineData[714] = 0;
  _$jscoverage['/gregorian.js'].lineData[717] = 0;
  _$jscoverage['/gregorian.js'].lineData[719] = 0;
  _$jscoverage['/gregorian.js'].lineData[831] = 0;
  _$jscoverage['/gregorian.js'].lineData[832] = 0;
  _$jscoverage['/gregorian.js'].lineData[834] = 0;
  _$jscoverage['/gregorian.js'].lineData[835] = 0;
  _$jscoverage['/gregorian.js'].lineData[837] = 0;
  _$jscoverage['/gregorian.js'].lineData[838] = 0;
  _$jscoverage['/gregorian.js'].lineData[839] = 0;
  _$jscoverage['/gregorian.js'].lineData[840] = 0;
  _$jscoverage['/gregorian.js'].lineData[841] = 0;
  _$jscoverage['/gregorian.js'].lineData[842] = 0;
  _$jscoverage['/gregorian.js'].lineData[843] = 0;
  _$jscoverage['/gregorian.js'].lineData[844] = 0;
  _$jscoverage['/gregorian.js'].lineData[845] = 0;
  _$jscoverage['/gregorian.js'].lineData[846] = 0;
  _$jscoverage['/gregorian.js'].lineData[847] = 0;
  _$jscoverage['/gregorian.js'].lineData[849] = 0;
  _$jscoverage['/gregorian.js'].lineData[850] = 0;
  _$jscoverage['/gregorian.js'].lineData[852] = 0;
  _$jscoverage['/gregorian.js'].lineData[854] = 0;
  _$jscoverage['/gregorian.js'].lineData[855] = 0;
  _$jscoverage['/gregorian.js'].lineData[857] = 0;
  _$jscoverage['/gregorian.js'].lineData[858] = 0;
  _$jscoverage['/gregorian.js'].lineData[860] = 0;
  _$jscoverage['/gregorian.js'].lineData[861] = 0;
  _$jscoverage['/gregorian.js'].lineData[863] = 0;
  _$jscoverage['/gregorian.js'].lineData[867] = 0;
  _$jscoverage['/gregorian.js'].lineData[868] = 0;
  _$jscoverage['/gregorian.js'].lineData[872] = 0;
  _$jscoverage['/gregorian.js'].lineData[873] = 0;
  _$jscoverage['/gregorian.js'].lineData[875] = 0;
  _$jscoverage['/gregorian.js'].lineData[877] = 0;
  _$jscoverage['/gregorian.js'].lineData[962] = 0;
  _$jscoverage['/gregorian.js'].lineData[963] = 0;
  _$jscoverage['/gregorian.js'].lineData[964] = 0;
  _$jscoverage['/gregorian.js'].lineData[965] = 0;
  _$jscoverage['/gregorian.js'].lineData[990] = 0;
  _$jscoverage['/gregorian.js'].lineData[991] = 0;
  _$jscoverage['/gregorian.js'].lineData[993] = 0;
  _$jscoverage['/gregorian.js'].lineData[995] = 0;
  _$jscoverage['/gregorian.js'].lineData[996] = 0;
  _$jscoverage['/gregorian.js'].lineData[997] = 0;
  _$jscoverage['/gregorian.js'].lineData[998] = 0;
  _$jscoverage['/gregorian.js'].lineData[1000] = 0;
  _$jscoverage['/gregorian.js'].lineData[1003] = 0;
  _$jscoverage['/gregorian.js'].lineData[1005] = 0;
  _$jscoverage['/gregorian.js'].lineData[1006] = 0;
  _$jscoverage['/gregorian.js'].lineData[1009] = 0;
  _$jscoverage['/gregorian.js'].lineData[1010] = 0;
  _$jscoverage['/gregorian.js'].lineData[1095] = 0;
  _$jscoverage['/gregorian.js'].lineData[1096] = 0;
  _$jscoverage['/gregorian.js'].lineData[1098] = 0;
  _$jscoverage['/gregorian.js'].lineData[1099] = 0;
  _$jscoverage['/gregorian.js'].lineData[1101] = 0;
  _$jscoverage['/gregorian.js'].lineData[1102] = 0;
  _$jscoverage['/gregorian.js'].lineData[1104] = 0;
  _$jscoverage['/gregorian.js'].lineData[1105] = 0;
  _$jscoverage['/gregorian.js'].lineData[1107] = 0;
  _$jscoverage['/gregorian.js'].lineData[1108] = 0;
  _$jscoverage['/gregorian.js'].lineData[1109] = 0;
  _$jscoverage['/gregorian.js'].lineData[1118] = 0;
  _$jscoverage['/gregorian.js'].lineData[1125] = 0;
  _$jscoverage['/gregorian.js'].lineData[1126] = 0;
  _$jscoverage['/gregorian.js'].lineData[1127] = 0;
  _$jscoverage['/gregorian.js'].lineData[1135] = 0;
  _$jscoverage['/gregorian.js'].lineData[1136] = 0;
  _$jscoverage['/gregorian.js'].lineData[1137] = 0;
  _$jscoverage['/gregorian.js'].lineData[1146] = 0;
  _$jscoverage['/gregorian.js'].lineData[1157] = 0;
  _$jscoverage['/gregorian.js'].lineData[1158] = 0;
  _$jscoverage['/gregorian.js'].lineData[1159] = 0;
  _$jscoverage['/gregorian.js'].lineData[1171] = 0;
  _$jscoverage['/gregorian.js'].lineData[1188] = 0;
  _$jscoverage['/gregorian.js'].lineData[1189] = 0;
  _$jscoverage['/gregorian.js'].lineData[1190] = 0;
  _$jscoverage['/gregorian.js'].lineData[1193] = 0;
  _$jscoverage['/gregorian.js'].lineData[1194] = 0;
  _$jscoverage['/gregorian.js'].lineData[1195] = 0;
  _$jscoverage['/gregorian.js'].lineData[1207] = 0;
  _$jscoverage['/gregorian.js'].lineData[1208] = 0;
  _$jscoverage['/gregorian.js'].lineData[1209] = 0;
  _$jscoverage['/gregorian.js'].lineData[1210] = 0;
  _$jscoverage['/gregorian.js'].lineData[1211] = 0;
  _$jscoverage['/gregorian.js'].lineData[1212] = 0;
  _$jscoverage['/gregorian.js'].lineData[1214] = 0;
  _$jscoverage['/gregorian.js'].lineData[1215] = 0;
  _$jscoverage['/gregorian.js'].lineData[1216] = 0;
  _$jscoverage['/gregorian.js'].lineData[1219] = 0;
  _$jscoverage['/gregorian.js'].lineData[1231] = 0;
  _$jscoverage['/gregorian.js'].lineData[1232] = 0;
  _$jscoverage['/gregorian.js'].lineData[1234] = 0;
  _$jscoverage['/gregorian.js'].lineData[1237] = 0;
  _$jscoverage['/gregorian.js'].lineData[1238] = 0;
  _$jscoverage['/gregorian.js'].lineData[1239] = 0;
  _$jscoverage['/gregorian.js'].lineData[1240] = 0;
  _$jscoverage['/gregorian.js'].lineData[1241] = 0;
  _$jscoverage['/gregorian.js'].lineData[1242] = 0;
  _$jscoverage['/gregorian.js'].lineData[1243] = 0;
  _$jscoverage['/gregorian.js'].lineData[1244] = 0;
  _$jscoverage['/gregorian.js'].lineData[1245] = 0;
  _$jscoverage['/gregorian.js'].lineData[1247] = 0;
  _$jscoverage['/gregorian.js'].lineData[1248] = 0;
  _$jscoverage['/gregorian.js'].lineData[1249] = 0;
  _$jscoverage['/gregorian.js'].lineData[1251] = 0;
  _$jscoverage['/gregorian.js'].lineData[1253] = 0;
  _$jscoverage['/gregorian.js'].lineData[1254] = 0;
  _$jscoverage['/gregorian.js'].lineData[1255] = 0;
  _$jscoverage['/gregorian.js'].lineData[1256] = 0;
  _$jscoverage['/gregorian.js'].lineData[1263] = 0;
  _$jscoverage['/gregorian.js'].lineData[1264] = 0;
  _$jscoverage['/gregorian.js'].lineData[1266] = 0;
  _$jscoverage['/gregorian.js'].lineData[1267] = 0;
  _$jscoverage['/gregorian.js'].lineData[1268] = 0;
  _$jscoverage['/gregorian.js'].lineData[1280] = 0;
  _$jscoverage['/gregorian.js'].lineData[1294] = 0;
  _$jscoverage['/gregorian.js'].lineData[1295] = 0;
  _$jscoverage['/gregorian.js'].lineData[1297] = 0;
  _$jscoverage['/gregorian.js'].lineData[1299] = 0;
  _$jscoverage['/gregorian.js'].lineData[1300] = 0;
  _$jscoverage['/gregorian.js'].lineData[1304] = 0;
  _$jscoverage['/gregorian.js'].lineData[1306] = 0;
  _$jscoverage['/gregorian.js'].lineData[1308] = 0;
  _$jscoverage['/gregorian.js'].lineData[1316] = 0;
  _$jscoverage['/gregorian.js'].lineData[1329] = 0;
  _$jscoverage['/gregorian.js'].lineData[1341] = 0;
  _$jscoverage['/gregorian.js'].lineData[1349] = 0;
  _$jscoverage['/gregorian.js'].lineData[1362] = 0;
  _$jscoverage['/gregorian.js'].lineData[1363] = 0;
  _$jscoverage['/gregorian.js'].lineData[1364] = 0;
  _$jscoverage['/gregorian.js'].lineData[1365] = 0;
  _$jscoverage['/gregorian.js'].lineData[1368] = 0;
  _$jscoverage['/gregorian.js'].lineData[1369] = 0;
  _$jscoverage['/gregorian.js'].lineData[1372] = 0;
  _$jscoverage['/gregorian.js'].lineData[1373] = 0;
  _$jscoverage['/gregorian.js'].lineData[1376] = 0;
  _$jscoverage['/gregorian.js'].lineData[1377] = 0;
  _$jscoverage['/gregorian.js'].lineData[1380] = 0;
  _$jscoverage['/gregorian.js'].lineData[1381] = 0;
  _$jscoverage['/gregorian.js'].lineData[1389] = 0;
  _$jscoverage['/gregorian.js'].lineData[1390] = 0;
  _$jscoverage['/gregorian.js'].lineData[1391] = 0;
  _$jscoverage['/gregorian.js'].lineData[1392] = 0;
  _$jscoverage['/gregorian.js'].lineData[1393] = 0;
  _$jscoverage['/gregorian.js'].lineData[1394] = 0;
  _$jscoverage['/gregorian.js'].lineData[1395] = 0;
  _$jscoverage['/gregorian.js'].lineData[1396] = 0;
  _$jscoverage['/gregorian.js'].lineData[1400] = 0;
  _$jscoverage['/gregorian.js'].lineData[1401] = 0;
  _$jscoverage['/gregorian.js'].lineData[1404] = 0;
  _$jscoverage['/gregorian.js'].lineData[1405] = 0;
  _$jscoverage['/gregorian.js'].lineData[1408] = 0;
  _$jscoverage['/gregorian.js'].lineData[1409] = 0;
  _$jscoverage['/gregorian.js'].lineData[1410] = 0;
  _$jscoverage['/gregorian.js'].lineData[1411] = 0;
  _$jscoverage['/gregorian.js'].lineData[1412] = 0;
  _$jscoverage['/gregorian.js'].lineData[1414] = 0;
  _$jscoverage['/gregorian.js'].lineData[1415] = 0;
  _$jscoverage['/gregorian.js'].lineData[1418] = 0;
  _$jscoverage['/gregorian.js'].lineData[1421] = 0;
  _$jscoverage['/gregorian.js'].lineData[1426] = 0;
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
  _$jscoverage['/gregorian.js'].branchData['46'] = [];
  _$jscoverage['/gregorian.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['49'] = [];
  _$jscoverage['/gregorian.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['53'] = [];
  _$jscoverage['/gregorian.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['70'] = [];
  _$jscoverage['/gregorian.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['88'] = [];
  _$jscoverage['/gregorian.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['291'] = [];
  _$jscoverage['/gregorian.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['296'] = [];
  _$jscoverage['/gregorian.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['314'] = [];
  _$jscoverage['/gregorian.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['327'] = [];
  _$jscoverage['/gregorian.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['345'] = [];
  _$jscoverage['/gregorian.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['359'] = [];
  _$jscoverage['/gregorian.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['374'] = [];
  _$jscoverage['/gregorian.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['378'] = [];
  _$jscoverage['/gregorian.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['396'] = [];
  _$jscoverage['/gregorian.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['421'] = [];
  _$jscoverage['/gregorian.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['430'] = [];
  _$jscoverage['/gregorian.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['435'] = [];
  _$jscoverage['/gregorian.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['435'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['437'] = [];
  _$jscoverage['/gregorian.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['455'] = [];
  _$jscoverage['/gregorian.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['463'] = [];
  _$jscoverage['/gregorian.js'].branchData['463'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['467'] = [];
  _$jscoverage['/gregorian.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['469'] = [];
  _$jscoverage['/gregorian.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['471'] = [];
  _$jscoverage['/gregorian.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['497'] = [];
  _$jscoverage['/gregorian.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['500'] = [];
  _$jscoverage['/gregorian.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['517'] = [];
  _$jscoverage['/gregorian.js'].branchData['517'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['519'] = [];
  _$jscoverage['/gregorian.js'].branchData['519'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['522'] = [];
  _$jscoverage['/gregorian.js'].branchData['522'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['534'] = [];
  _$jscoverage['/gregorian.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['538'] = [];
  _$jscoverage['/gregorian.js'].branchData['538'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['539'] = [];
  _$jscoverage['/gregorian.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['542'] = [];
  _$jscoverage['/gregorian.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['547'] = [];
  _$jscoverage['/gregorian.js'].branchData['547'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['551'] = [];
  _$jscoverage['/gregorian.js'].branchData['551'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['558'] = [];
  _$jscoverage['/gregorian.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['564'] = [];
  _$jscoverage['/gregorian.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['572'] = [];
  _$jscoverage['/gregorian.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['578'] = [];
  _$jscoverage['/gregorian.js'].branchData['578'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['581'] = [];
  _$jscoverage['/gregorian.js'].branchData['581'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['597'] = [];
  _$jscoverage['/gregorian.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['710'] = [];
  _$jscoverage['/gregorian.js'].branchData['710'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['712'] = [];
  _$jscoverage['/gregorian.js'].branchData['712'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['713'] = [];
  _$jscoverage['/gregorian.js'].branchData['713'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['831'] = [];
  _$jscoverage['/gregorian.js'].branchData['831'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['838'] = [];
  _$jscoverage['/gregorian.js'].branchData['838'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['842'] = [];
  _$jscoverage['/gregorian.js'].branchData['842'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['846'] = [];
  _$jscoverage['/gregorian.js'].branchData['846'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['990'] = [];
  _$jscoverage['/gregorian.js'].branchData['990'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1125'] = [];
  _$jscoverage['/gregorian.js'].branchData['1125'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1135'] = [];
  _$jscoverage['/gregorian.js'].branchData['1135'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1157'] = [];
  _$jscoverage['/gregorian.js'].branchData['1157'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1189'] = [];
  _$jscoverage['/gregorian.js'].branchData['1189'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1210'] = [];
  _$jscoverage['/gregorian.js'].branchData['1210'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1211'] = [];
  _$jscoverage['/gregorian.js'].branchData['1211'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1214'] = [];
  _$jscoverage['/gregorian.js'].branchData['1214'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1215'] = [];
  _$jscoverage['/gregorian.js'].branchData['1215'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1231'] = [];
  _$jscoverage['/gregorian.js'].branchData['1231'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1231'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1231'][3] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1244'] = [];
  _$jscoverage['/gregorian.js'].branchData['1244'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1248'] = [];
  _$jscoverage['/gregorian.js'].branchData['1248'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1263'] = [];
  _$jscoverage['/gregorian.js'].branchData['1263'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1280'] = [];
  _$jscoverage['/gregorian.js'].branchData['1280'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1280'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1281'] = [];
  _$jscoverage['/gregorian.js'].branchData['1281'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1281'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1282'] = [];
  _$jscoverage['/gregorian.js'].branchData['1282'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1282'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1283'] = [];
  _$jscoverage['/gregorian.js'].branchData['1283'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1294'] = [];
  _$jscoverage['/gregorian.js'].branchData['1294'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1306'] = [];
  _$jscoverage['/gregorian.js'].branchData['1306'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1363'] = [];
  _$jscoverage['/gregorian.js'].branchData['1363'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1395'] = [];
  _$jscoverage['/gregorian.js'].branchData['1395'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1411'] = [];
  _$jscoverage['/gregorian.js'].branchData['1411'][1] = new BranchData();
}
_$jscoverage['/gregorian.js'].branchData['1411'][1].init(150, 36, 'nDays >= self.minimalDaysInFirstWeek');
function visit86_1411_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1411'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1395'][1].init(214, 21, 'dayOfMonth > monthLen');
function visit85_1395_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1395'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1363'][1].init(13, 1, 'f');
function visit84_1363_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1363'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1306'][1].init(44636, 9, '\'@DEBUG@\'');
function visit83_1306_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1306'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1294'][1].init(17, 19, 'field === undefined');
function visit82_1294_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1294'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1283'][1].init(61, 58, 'this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek');
function visit81_1283_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1283'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1282'][2].init(137, 42, 'this.timezoneOffset === obj.timezoneOffset');
function visit80_1282_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1282'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1282'][1].init(61, 120, 'this.timezoneOffset === obj.timezoneOffset && this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek');
function visit79_1282_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1282'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1281'][2].init(74, 42, 'this.firstDayOfWeek === obj.firstDayOfWeek');
function visit78_1281_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1281'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1281'][1].init(51, 182, 'this.firstDayOfWeek === obj.firstDayOfWeek && this.timezoneOffset === obj.timezoneOffset && this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek');
function visit77_1281_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1281'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1280'][2].init(20, 32, 'this.getTime() === obj.getTime()');
function visit76_1280_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1280'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1280'][1].init(20, 234, 'this.getTime() === obj.getTime() && this.firstDayOfWeek === obj.firstDayOfWeek && this.timezoneOffset === obj.timezoneOffset && this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek');
function visit75_1280_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1280'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1263'][1].init(17, 23, 'this.time === undefined');
function visit74_1263_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1263'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1248'][1].init(764, 10, 'days !== 0');
function visit73_1248_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1248'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1244'][1].init(653, 8, 'days < 0');
function visit72_1244_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1244'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1231'][3].init(57, 38, 'dayOfWeek > GregorianCalendar.SATURDAY');
function visit71_1231_3(result) {
  _$jscoverage['/gregorian.js'].branchData['1231'][3].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1231'][2].init(17, 36, 'dayOfWeek < GregorianCalendar.SUNDAY');
function visit70_1231_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1231'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1231'][1].init(17, 78, 'dayOfWeek < GregorianCalendar.SUNDAY || dayOfWeek > GregorianCalendar.SATURDAY');
function visit69_1231_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1231'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1215'][1].init(21, 16, 'weekOfYear === 1');
function visit68_1215_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1215'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1214'][1].init(323, 36, 'month === GregorianCalendar.DECEMBER');
function visit67_1214_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1214'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1211'][1].init(21, 16, 'weekOfYear >= 52');
function visit66_1211_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1211'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1210'][1].init(174, 35, 'month === GregorianCalendar.JANUARY');
function visit65_1210_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1210'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1189'][1].init(64, 27, 'weekYear === this.get(YEAR)');
function visit64_1189_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1189'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1157'][1].init(17, 54, 'this.minimalDaysInFirstWeek !== minimalDaysInFirstWeek');
function visit63_1157_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1157'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1135'][1].init(17, 38, 'this.firstDayOfWeek !== firstDayOfWeek');
function visit62_1135_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1135'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1125'][1].init(17, 38, 'this.timezoneOffset !== timezoneOffset');
function visit61_1125_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1125'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['990'][1].init(17, 7, '!amount');
function visit60_990_1(result) {
  _$jscoverage['/gregorian.js'].branchData['990'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['846'][1].init(152, 10, 'yearAmount');
function visit59_846_1(result) {
  _$jscoverage['/gregorian.js'].branchData['846'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['842'][1].init(396, 15, 'field === MONTH');
function visit58_842_1(result) {
  _$jscoverage['/gregorian.js'].branchData['842'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['838'][1].init(242, 14, 'field === YEAR');
function visit57_838_1(result) {
  _$jscoverage['/gregorian.js'].branchData['838'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['831'][1].init(17, 7, '!amount');
function visit56_831_1(result) {
  _$jscoverage['/gregorian.js'].branchData['831'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['713'][1].init(33, 7, 'i < len');
function visit55_713_1(result) {
  _$jscoverage['/gregorian.js'].branchData['713'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['712'][1].init(134, 22, 'len < MILLISECONDS + 1');
function visit54_712_1(result) {
  _$jscoverage['/gregorian.js'].branchData['712'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['710'][1].init(57, 9, 'len === 2');
function visit53_710_1(result) {
  _$jscoverage['/gregorian.js'].branchData['710'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['597'][1].init(17, 23, 'this.time === undefined');
function visit52_597_1(result) {
  _$jscoverage['/gregorian.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['581'][1].init(398, 31, 'dayOfWeek !== firstDayOfWeekCfg');
function visit51_581_1(result) {
  _$jscoverage['/gregorian.js'].branchData['581'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['578'][1].init(245, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
function visit50_578_1(result) {
  _$jscoverage['/gregorian.js'].branchData['578'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['572'][1].init(77, 23, 'self.isSet(DAY_OF_YEAR)');
function visit49_572_1(result) {
  _$jscoverage['/gregorian.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['564'][1].init(344, 9, 'dowim < 0');
function visit48_564_1(result) {
  _$jscoverage['/gregorian.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['558'][1].init(64, 32, 'self.isSet(DAY_OF_WEEK_IN_MONTH)');
function visit47_558_1(result) {
  _$jscoverage['/gregorian.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['551'][1].init(428, 31, 'dayOfWeek !== firstDayOfWeekCfg');
function visit46_551_1(result) {
  _$jscoverage['/gregorian.js'].branchData['551'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['547'][1].init(262, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
function visit45_547_1(result) {
  _$jscoverage['/gregorian.js'].branchData['547'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['542'][1].init(25, 25, 'self.isSet(WEEK_OF_MONTH)');
function visit44_542_1(result) {
  _$jscoverage['/gregorian.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['539'][1].init(21, 24, 'self.isSet(DAY_OF_MONTH)');
function visit43_539_1(result) {
  _$jscoverage['/gregorian.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['538'][1].init(1037, 17, 'self.isSet(MONTH)');
function visit42_538_1(result) {
  _$jscoverage['/gregorian.js'].branchData['538'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['534'][1].init(930, 23, 'self.isSet(DAY_OF_WEEK)');
function visit41_534_1(result) {
  _$jscoverage['/gregorian.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['522'][1].init(206, 33, 'month < GregorianCalendar.JANUARY');
function visit40_522_1(result) {
  _$jscoverage['/gregorian.js'].branchData['522'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['519'][1].init(60, 34, 'month > GregorianCalendar.DECEMBER');
function visit39_519_1(result) {
  _$jscoverage['/gregorian.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['517'][1].init(235, 17, 'self.isSet(MONTH)');
function visit38_517_1(result) {
  _$jscoverage['/gregorian.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['500'][1].init(110, 20, '!this.fieldsComputed');
function visit37_500_1(result) {
  _$jscoverage['/gregorian.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['497'][1].init(17, 23, 'this.time === undefined');
function visit36_497_1(result) {
  _$jscoverage['/gregorian.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['471'][1].init(555, 25, 'fields[MILLISECONDS] || 0');
function visit35_471_1(result) {
  _$jscoverage['/gregorian.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['469'][1].init(477, 20, 'fields[SECONDS] || 0');
function visit34_469_1(result) {
  _$jscoverage['/gregorian.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['467'][1].init(402, 19, 'fields[MINUTE] || 0');
function visit33_467_1(result) {
  _$jscoverage['/gregorian.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['463'][1].init(257, 23, 'this.isSet(HOUR_OF_DAY)');
function visit32_463_1(result) {
  _$jscoverage['/gregorian.js'].branchData['463'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['455'][1].init(17, 17, '!this.isSet(YEAR)');
function visit31_455_1(result) {
  _$jscoverage['/gregorian.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['437'][1].init(118, 29, 'fixedDate >= (nextJan1st - 7)');
function visit30_437_1(result) {
  _$jscoverage['/gregorian.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['435'][2].init(268, 36, 'nDays >= this.minimalDaysInFirstWeek');
function visit29_435_2(result) {
  _$jscoverage['/gregorian.js'].branchData['435'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['435'][1].init(268, 148, 'nDays >= this.minimalDaysInFirstWeek && fixedDate >= (nextJan1st - 7)');
function visit28_435_1(result) {
  _$jscoverage['/gregorian.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['430'][1].init(2424, 16, 'weekOfYear >= 52');
function visit27_430_1(result) {
  _$jscoverage['/gregorian.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['421'][1].init(1962, 16, 'weekOfYear === 0');
function visit26_421_1(result) {
  _$jscoverage['/gregorian.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['396'][1].init(959, 15, 'timeOfDay !== 0');
function visit25_396_1(result) {
  _$jscoverage['/gregorian.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['378'][1].init(24, 13, 'timeOfDay < 0');
function visit24_378_1(result) {
  _$jscoverage['/gregorian.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['374'][1].init(322, 20, 'timeOfDay >= ONE_DAY');
function visit23_374_1(result) {
  _$jscoverage['/gregorian.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['359'][1].init(20, 32, 'this.fields[field] !== undefined');
function visit22_359_1(result) {
  _$jscoverage['/gregorian.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['345'][1].init(1226, 19, 'value === undefined');
function visit21_345_1(result) {
  _$jscoverage['/gregorian.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['327'][1].init(204, 11, 'value === 1');
function visit20_327_1(result) {
  _$jscoverage['/gregorian.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['314'][1].init(17, 31, 'MAX_VALUES[field] !== undefined');
function visit19_314_1(result) {
  _$jscoverage['/gregorian.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['296'][1].init(163, 23, 'field === WEEK_OF_MONTH');
function visit18_296_1(result) {
  _$jscoverage['/gregorian.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['291'][1].init(17, 31, 'MIN_VALUES[field] !== undefined');
function visit17_291_1(result) {
  _$jscoverage['/gregorian.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['88'][1].init(1208, 21, 'arguments.length >= 3');
function visit16_88_1(result) {
  _$jscoverage['/gregorian.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['70'][1].init(692, 39, 'timezoneOffset || locale.timezoneOffset');
function visit15_70_1(result) {
  _$jscoverage['/gregorian.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['53'][1].init(288, 23, 'locale || defaultLocale');
function visit14_53_1(result) {
  _$jscoverage['/gregorian.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['49'][1].init(197, 16, 'args.length >= 3');
function visit13_49_1(result) {
  _$jscoverage['/gregorian.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['46'][1].init(58, 26, 'S.isObject(timezoneOffset)');
function visit12_46_1(result) {
  _$jscoverage['/gregorian.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/gregorian.js'].functionData[0]++;
  _$jscoverage['/gregorian.js'].lineData[7]++;
  var toInt = parseInt;
  _$jscoverage['/gregorian.js'].lineData[8]++;
  var Utils = require('./gregorian/utils');
  _$jscoverage['/gregorian.js'].lineData[9]++;
  var defaultLocale = require('i18n!date');
  _$jscoverage['/gregorian.js'].lineData[10]++;
  var Const = require('./gregorian/const');
  _$jscoverage['/gregorian.js'].lineData[42]++;
  function GregorianCalendar(timezoneOffset, locale) {
    _$jscoverage['/gregorian.js'].functionData[1]++;
    _$jscoverage['/gregorian.js'].lineData[44]++;
    var args = S.makeArray(arguments);
    _$jscoverage['/gregorian.js'].lineData[46]++;
    if (visit12_46_1(S.isObject(timezoneOffset))) {
      _$jscoverage['/gregorian.js'].lineData[47]++;
      locale = timezoneOffset;
      _$jscoverage['/gregorian.js'].lineData[48]++;
      timezoneOffset = locale.timezoneOffset;
    } else {
      _$jscoverage['/gregorian.js'].lineData[49]++;
      if (visit13_49_1(args.length >= 3)) {
        _$jscoverage['/gregorian.js'].lineData[50]++;
        timezoneOffset = locale = null;
      }
    }
    _$jscoverage['/gregorian.js'].lineData[53]++;
    locale = visit14_53_1(locale || defaultLocale);
    _$jscoverage['/gregorian.js'].lineData[55]++;
    this.locale = locale;
    _$jscoverage['/gregorian.js'].lineData[57]++;
    this.fields = [];
    _$jscoverage['/gregorian.js'].lineData[64]++;
    this.time = undefined;
    _$jscoverage['/gregorian.js'].lineData[70]++;
    this.timezoneOffset = visit15_70_1(timezoneOffset || locale.timezoneOffset);
    _$jscoverage['/gregorian.js'].lineData[76]++;
    this.firstDayOfWeek = locale.firstDayOfWeek;
    _$jscoverage['/gregorian.js'].lineData[84]++;
    this.minimalDaysInFirstWeek = locale.minimalDaysInFirstWeek;
    _$jscoverage['/gregorian.js'].lineData[86]++;
    this.fieldsComputed = false;
    _$jscoverage['/gregorian.js'].lineData[88]++;
    if (visit16_88_1(arguments.length >= 3)) {
      _$jscoverage['/gregorian.js'].lineData[89]++;
      this.set.apply(this, args);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[93]++;
  S.mix(GregorianCalendar, Const);
  _$jscoverage['/gregorian.js'].lineData[95]++;
  S.mix(GregorianCalendar, {
  Utils: Utils, 
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
  _$jscoverage['/gregorian.js'].lineData[184]++;
  var fields = ['', 'Year', 'Month', 'DayOfMonth', 'HourOfDay', 'Minutes', 'Seconds', 'Milliseconds', 'WeekOfYear', 'WeekOfMonth', 'DayOfYear', 'DayOfWeek', 'DayOfWeekInMonth'];
  _$jscoverage['/gregorian.js'].lineData[192]++;
  var YEAR = GregorianCalendar.YEAR;
  _$jscoverage['/gregorian.js'].lineData[193]++;
  var MONTH = GregorianCalendar.MONTH;
  _$jscoverage['/gregorian.js'].lineData[194]++;
  var DAY_OF_MONTH = GregorianCalendar.DAY_OF_MONTH;
  _$jscoverage['/gregorian.js'].lineData[195]++;
  var HOUR_OF_DAY = GregorianCalendar.HOUR_OF_DAY;
  _$jscoverage['/gregorian.js'].lineData[196]++;
  var MINUTE = GregorianCalendar.MINUTES;
  _$jscoverage['/gregorian.js'].lineData[197]++;
  var SECONDS = GregorianCalendar.SECONDS;
  _$jscoverage['/gregorian.js'].lineData[199]++;
  var MILLISECONDS = GregorianCalendar.MILLISECONDS;
  _$jscoverage['/gregorian.js'].lineData[200]++;
  var DAY_OF_WEEK_IN_MONTH = GregorianCalendar.DAY_OF_WEEK_IN_MONTH;
  _$jscoverage['/gregorian.js'].lineData[201]++;
  var DAY_OF_YEAR = GregorianCalendar.DAY_OF_YEAR;
  _$jscoverage['/gregorian.js'].lineData[202]++;
  var DAY_OF_WEEK = GregorianCalendar.DAY_OF_WEEK;
  _$jscoverage['/gregorian.js'].lineData[204]++;
  var WEEK_OF_MONTH = GregorianCalendar.WEEK_OF_MONTH;
  _$jscoverage['/gregorian.js'].lineData[205]++;
  var WEEK_OF_YEAR = GregorianCalendar.WEEK_OF_YEAR;
  _$jscoverage['/gregorian.js'].lineData[207]++;
  var MONTH_LENGTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  _$jscoverage['/gregorian.js'].lineData[208]++;
  var LEAP_MONTH_LENGTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  _$jscoverage['/gregorian.js'].lineData[210]++;
  var ONE_SECOND = 1000;
  _$jscoverage['/gregorian.js'].lineData[211]++;
  var ONE_MINUTE = 60 * ONE_SECOND;
  _$jscoverage['/gregorian.js'].lineData[212]++;
  var ONE_HOUR = 60 * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[213]++;
  var ONE_DAY = 24 * ONE_HOUR;
  _$jscoverage['/gregorian.js'].lineData[214]++;
  var ONE_WEEK = ONE_DAY * 7;
  _$jscoverage['/gregorian.js'].lineData[216]++;
  var EPOCH_OFFSET = 719163;
  _$jscoverage['/gregorian.js'].lineData[218]++;
  var mod = Utils.mod, isLeapYear = Utils.isLeapYear, floorDivide = Math.floor;
  _$jscoverage['/gregorian.js'].lineData[223]++;
  var MIN_VALUES = [undefined, 1, GregorianCalendar.JANUARY, 1, 0, 0, 0, 0, 1, undefined, 1, GregorianCalendar.SUNDAY, 1];
  _$jscoverage['/gregorian.js'].lineData[241]++;
  var MAX_VALUES = [undefined, 292278994, GregorianCalendar.DECEMBER, undefined, 23, 59, 59, 999, undefined, undefined, undefined, GregorianCalendar.SATURDAY, undefined];
  _$jscoverage['/gregorian.js'].lineData[257]++;
  GregorianCalendar.prototype = {
  constructor: GregorianCalendar, 
  isLeapYear: function() {
  _$jscoverage['/gregorian.js'].functionData[2]++;
  _$jscoverage['/gregorian.js'].lineData[269]++;
  return isLeapYear(this.getYear());
}, 
  getLocale: function() {
  _$jscoverage['/gregorian.js'].functionData[3]++;
  _$jscoverage['/gregorian.js'].lineData[277]++;
  return this.locale;
}, 
  getActualMinimum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[4]++;
  _$jscoverage['/gregorian.js'].lineData[291]++;
  if (visit17_291_1(MIN_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[292]++;
    return MIN_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[295]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[296]++;
  if (visit18_296_1(field === WEEK_OF_MONTH)) {
    _$jscoverage['/gregorian.js'].lineData[297]++;
    var cal = new GregorianCalendar(fields[YEAR], fields[MONTH], 1);
    _$jscoverage['/gregorian.js'].lineData[298]++;
    return cal.get(WEEK_OF_MONTH);
  }
  _$jscoverage['/gregorian.js'].lineData[301]++;
  throw new Error('minimum value not defined!');
}, 
  getActualMaximum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[5]++;
  _$jscoverage['/gregorian.js'].lineData[314]++;
  if (visit19_314_1(MAX_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[315]++;
    return MAX_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[317]++;
  var value, fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[319]++;
  switch (field) {
    case DAY_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[321]++;
      value = getMonthLength(fields[YEAR], fields[MONTH]);
      _$jscoverage['/gregorian.js'].lineData[322]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[325]++;
      var endOfYear = new GregorianCalendar(fields[YEAR], GregorianCalendar.DECEMBER, 31);
      _$jscoverage['/gregorian.js'].lineData[326]++;
      value = endOfYear.get(WEEK_OF_YEAR);
      _$jscoverage['/gregorian.js'].lineData[327]++;
      if (visit20_327_1(value === 1)) {
        _$jscoverage['/gregorian.js'].lineData[328]++;
        value = 52;
      }
      _$jscoverage['/gregorian.js'].lineData[330]++;
      break;
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[333]++;
      var endOfMonth = new GregorianCalendar(fields[YEAR], fields[MONTH], getMonthLength(fields[YEAR], fields[MONTH]));
      _$jscoverage['/gregorian.js'].lineData[334]++;
      value = endOfMonth.get(WEEK_OF_MONTH);
      _$jscoverage['/gregorian.js'].lineData[335]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[338]++;
      value = getYearLength(fields[YEAR]);
      _$jscoverage['/gregorian.js'].lineData[339]++;
      break;
    case DAY_OF_WEEK_IN_MONTH:
      _$jscoverage['/gregorian.js'].lineData[342]++;
      value = toInt((getMonthLength(fields[YEAR], fields[MONTH]) - 1) / 7) + 1;
      _$jscoverage['/gregorian.js'].lineData[343]++;
      break;
  }
  _$jscoverage['/gregorian.js'].lineData[345]++;
  if (visit21_345_1(value === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[346]++;
    throw new Error('maximum value not defined!');
  }
  _$jscoverage['/gregorian.js'].lineData[348]++;
  return value;
}, 
  isSet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[6]++;
  _$jscoverage['/gregorian.js'].lineData[359]++;
  return visit22_359_1(this.fields[field] !== undefined);
}, 
  computeFields: function() {
  _$jscoverage['/gregorian.js'].functionData[7]++;
  _$jscoverage['/gregorian.js'].lineData[368]++;
  var time = this.time;
  _$jscoverage['/gregorian.js'].lineData[369]++;
  var timezoneOffset = this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[370]++;
  var fixedDate = toInt(timezoneOffset / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[371]++;
  var timeOfDay = timezoneOffset % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[372]++;
  fixedDate += toInt(time / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[373]++;
  timeOfDay += time % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[374]++;
  if (visit23_374_1(timeOfDay >= ONE_DAY)) {
    _$jscoverage['/gregorian.js'].lineData[375]++;
    timeOfDay -= ONE_DAY;
    _$jscoverage['/gregorian.js'].lineData[376]++;
    fixedDate++;
  } else {
    _$jscoverage['/gregorian.js'].lineData[378]++;
    while (visit24_378_1(timeOfDay < 0)) {
      _$jscoverage['/gregorian.js'].lineData[379]++;
      timeOfDay += ONE_DAY;
      _$jscoverage['/gregorian.js'].lineData[380]++;
      fixedDate--;
    }
  }
  _$jscoverage['/gregorian.js'].lineData[384]++;
  fixedDate += EPOCH_OFFSET;
  _$jscoverage['/gregorian.js'].lineData[386]++;
  var date = Utils.getGregorianDateFromFixedDate(fixedDate);
  _$jscoverage['/gregorian.js'].lineData[388]++;
  var year = date.year;
  _$jscoverage['/gregorian.js'].lineData[390]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[391]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[392]++;
  fields[MONTH] = date.month;
  _$jscoverage['/gregorian.js'].lineData[393]++;
  fields[DAY_OF_MONTH] = date.dayOfMonth;
  _$jscoverage['/gregorian.js'].lineData[394]++;
  fields[DAY_OF_WEEK] = date.dayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[396]++;
  if (visit25_396_1(timeOfDay !== 0)) {
    _$jscoverage['/gregorian.js'].lineData[397]++;
    fields[HOUR_OF_DAY] = toInt(timeOfDay / ONE_HOUR);
    _$jscoverage['/gregorian.js'].lineData[398]++;
    var r = timeOfDay % ONE_HOUR;
    _$jscoverage['/gregorian.js'].lineData[399]++;
    fields[MINUTE] = toInt(r / ONE_MINUTE);
    _$jscoverage['/gregorian.js'].lineData[400]++;
    r %= ONE_MINUTE;
    _$jscoverage['/gregorian.js'].lineData[401]++;
    fields[SECONDS] = toInt(r / ONE_SECOND);
    _$jscoverage['/gregorian.js'].lineData[402]++;
    fields[MILLISECONDS] = r % ONE_SECOND;
  } else {
    _$jscoverage['/gregorian.js'].lineData[404]++;
    fields[HOUR_OF_DAY] = fields[MINUTE] = fields[SECONDS] = fields[MILLISECONDS] = 0;
  }
  _$jscoverage['/gregorian.js'].lineData[411]++;
  var fixedDateJan1 = Utils.getFixedDate(year, GregorianCalendar.JANUARY, 1);
  _$jscoverage['/gregorian.js'].lineData[412]++;
  var dayOfYear = fixedDate - fixedDateJan1 + 1;
  _$jscoverage['/gregorian.js'].lineData[413]++;
  var fixDateMonth1 = fixedDate - date.dayOfMonth + 1;
  _$jscoverage['/gregorian.js'].lineData[415]++;
  fields[DAY_OF_YEAR] = dayOfYear;
  _$jscoverage['/gregorian.js'].lineData[416]++;
  fields[DAY_OF_WEEK_IN_MONTH] = toInt((date.dayOfMonth - 1) / 7) + 1;
  _$jscoverage['/gregorian.js'].lineData[418]++;
  var weekOfYear = getWeekNumber(this, fixedDateJan1, fixedDate);
  _$jscoverage['/gregorian.js'].lineData[421]++;
  if (visit26_421_1(weekOfYear === 0)) {
    _$jscoverage['/gregorian.js'].lineData[425]++;
    var fixedDec31 = fixedDateJan1 - 1;
    _$jscoverage['/gregorian.js'].lineData[426]++;
    var prevJan1 = fixedDateJan1 - getYearLength(year - 1);
    _$jscoverage['/gregorian.js'].lineData[427]++;
    weekOfYear = getWeekNumber(this, prevJan1, fixedDec31);
  } else {
    _$jscoverage['/gregorian.js'].lineData[430]++;
    if (visit27_430_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[431]++;
      var nextJan1 = fixedDateJan1 + getYearLength(year);
      _$jscoverage['/gregorian.js'].lineData[432]++;
      var nextJan1st = getDayOfWeekDateOnOrBefore(nextJan1 + 6, this.firstDayOfWeek);
      _$jscoverage['/gregorian.js'].lineData[433]++;
      var nDays = nextJan1st - nextJan1;
      _$jscoverage['/gregorian.js'].lineData[435]++;
      if (visit28_435_1(visit29_435_2(nDays >= this.minimalDaysInFirstWeek) && visit30_437_1(fixedDate >= (nextJan1st - 7)))) {
        _$jscoverage['/gregorian.js'].lineData[439]++;
        weekOfYear = 1;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[443]++;
  fields[WEEK_OF_YEAR] = weekOfYear;
  _$jscoverage['/gregorian.js'].lineData[444]++;
  fields[WEEK_OF_MONTH] = getWeekNumber(this, fixDateMonth1, fixedDate);
  _$jscoverage['/gregorian.js'].lineData[446]++;
  this.fieldsComputed = true;
}, 
  'computeTime': function() {
  _$jscoverage['/gregorian.js'].functionData[8]++;
  _$jscoverage['/gregorian.js'].lineData[455]++;
  if (visit31_455_1(!this.isSet(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[456]++;
    throw new Error('year must be set for KISSY GregorianCalendar');
  }
  _$jscoverage['/gregorian.js'].lineData[459]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[461]++;
  var year = fields[YEAR];
  _$jscoverage['/gregorian.js'].lineData[462]++;
  var timeOfDay = 0;
  _$jscoverage['/gregorian.js'].lineData[463]++;
  if (visit32_463_1(this.isSet(HOUR_OF_DAY))) {
    _$jscoverage['/gregorian.js'].lineData[464]++;
    timeOfDay += fields[HOUR_OF_DAY];
  }
  _$jscoverage['/gregorian.js'].lineData[466]++;
  timeOfDay *= 60;
  _$jscoverage['/gregorian.js'].lineData[467]++;
  timeOfDay += visit33_467_1(fields[MINUTE] || 0);
  _$jscoverage['/gregorian.js'].lineData[468]++;
  timeOfDay *= 60;
  _$jscoverage['/gregorian.js'].lineData[469]++;
  timeOfDay += visit34_469_1(fields[SECONDS] || 0);
  _$jscoverage['/gregorian.js'].lineData[470]++;
  timeOfDay *= 1000;
  _$jscoverage['/gregorian.js'].lineData[471]++;
  timeOfDay += visit35_471_1(fields[MILLISECONDS] || 0);
  _$jscoverage['/gregorian.js'].lineData[473]++;
  var fixedDate = 0;
  _$jscoverage['/gregorian.js'].lineData[475]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[477]++;
  fixedDate = fixedDate + this.getFixedDate();
  _$jscoverage['/gregorian.js'].lineData[480]++;
  var millis = (fixedDate - EPOCH_OFFSET) * ONE_DAY + timeOfDay;
  _$jscoverage['/gregorian.js'].lineData[482]++;
  millis -= this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[484]++;
  this.time = millis;
  _$jscoverage['/gregorian.js'].lineData[486]++;
  this.computeFields();
}, 
  complete: function() {
  _$jscoverage['/gregorian.js'].functionData[9]++;
  _$jscoverage['/gregorian.js'].lineData[497]++;
  if (visit36_497_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[498]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[500]++;
  if (visit37_500_1(!this.fieldsComputed)) {
    _$jscoverage['/gregorian.js'].lineData[501]++;
    this.computeFields();
  }
}, 
  getFixedDate: function() {
  _$jscoverage['/gregorian.js'].functionData[10]++;
  _$jscoverage['/gregorian.js'].lineData[507]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[509]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[511]++;
  var firstDayOfWeekCfg = self.firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[513]++;
  var year = fields[YEAR];
  _$jscoverage['/gregorian.js'].lineData[515]++;
  var month = GregorianCalendar.JANUARY;
  _$jscoverage['/gregorian.js'].lineData[517]++;
  if (visit38_517_1(self.isSet(MONTH))) {
    _$jscoverage['/gregorian.js'].lineData[518]++;
    month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[519]++;
    if (visit39_519_1(month > GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[520]++;
      year += toInt(month / 12);
      _$jscoverage['/gregorian.js'].lineData[521]++;
      month %= 12;
    } else {
      _$jscoverage['/gregorian.js'].lineData[522]++;
      if (visit40_522_1(month < GregorianCalendar.JANUARY)) {
        _$jscoverage['/gregorian.js'].lineData[523]++;
        year += floorDivide(month / 12);
        _$jscoverage['/gregorian.js'].lineData[524]++;
        month = mod(month, 12);
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[530]++;
  var fixedDate = Utils.getFixedDate(year, month, 1);
  _$jscoverage['/gregorian.js'].lineData[531]++;
  var firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[532]++;
  var dayOfWeek = self.firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[534]++;
  if (visit41_534_1(self.isSet(DAY_OF_WEEK))) {
    _$jscoverage['/gregorian.js'].lineData[535]++;
    dayOfWeek = fields[DAY_OF_WEEK];
  }
  _$jscoverage['/gregorian.js'].lineData[538]++;
  if (visit42_538_1(self.isSet(MONTH))) {
    _$jscoverage['/gregorian.js'].lineData[539]++;
    if (visit43_539_1(self.isSet(DAY_OF_MONTH))) {
      _$jscoverage['/gregorian.js'].lineData[540]++;
      fixedDate += fields[DAY_OF_MONTH] - 1;
    } else {
      _$jscoverage['/gregorian.js'].lineData[542]++;
      if (visit44_542_1(self.isSet(WEEK_OF_MONTH))) {
        _$jscoverage['/gregorian.js'].lineData[543]++;
        firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
        _$jscoverage['/gregorian.js'].lineData[547]++;
        if (visit45_547_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
          _$jscoverage['/gregorian.js'].lineData[548]++;
          firstDayOfWeek -= 7;
        }
        _$jscoverage['/gregorian.js'].lineData[551]++;
        if (visit46_551_1(dayOfWeek !== firstDayOfWeekCfg)) {
          _$jscoverage['/gregorian.js'].lineData[552]++;
          firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
        }
        _$jscoverage['/gregorian.js'].lineData[555]++;
        fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_MONTH] - 1);
      } else {
        _$jscoverage['/gregorian.js'].lineData[557]++;
        var dowim;
        _$jscoverage['/gregorian.js'].lineData[558]++;
        if (visit47_558_1(self.isSet(DAY_OF_WEEK_IN_MONTH))) {
          _$jscoverage['/gregorian.js'].lineData[559]++;
          dowim = fields[DAY_OF_WEEK_IN_MONTH];
        } else {
          _$jscoverage['/gregorian.js'].lineData[561]++;
          dowim = 1;
        }
        _$jscoverage['/gregorian.js'].lineData[563]++;
        var lastDate = (7 * dowim);
        _$jscoverage['/gregorian.js'].lineData[564]++;
        if (visit48_564_1(dowim < 0)) {
          _$jscoverage['/gregorian.js'].lineData[565]++;
          lastDate = getMonthLength(year, month) + (7 * (dowim + 1));
        }
        _$jscoverage['/gregorian.js'].lineData[567]++;
        fixedDate = getDayOfWeekDateOnOrBefore(fixedDate + lastDate - 1, dayOfWeek);
      }
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[572]++;
    if (visit49_572_1(self.isSet(DAY_OF_YEAR))) {
      _$jscoverage['/gregorian.js'].lineData[573]++;
      fixedDate += fields[DAY_OF_YEAR] - 1;
    } else {
      _$jscoverage['/gregorian.js'].lineData[575]++;
      firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
      _$jscoverage['/gregorian.js'].lineData[578]++;
      if (visit50_578_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
        _$jscoverage['/gregorian.js'].lineData[579]++;
        firstDayOfWeek -= 7;
      }
      _$jscoverage['/gregorian.js'].lineData[581]++;
      if (visit51_581_1(dayOfWeek !== firstDayOfWeekCfg)) {
        _$jscoverage['/gregorian.js'].lineData[582]++;
        firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
      }
      _$jscoverage['/gregorian.js'].lineData[584]++;
      fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_YEAR] - 1);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[588]++;
  return fixedDate;
}, 
  getTime: function() {
  _$jscoverage['/gregorian.js'].functionData[11]++;
  _$jscoverage['/gregorian.js'].lineData[597]++;
  if (visit52_597_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[598]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[600]++;
  return this.time;
}, 
  'setTime': function(time) {
  _$jscoverage['/gregorian.js'].functionData[12]++;
  _$jscoverage['/gregorian.js'].lineData[608]++;
  this.time = time;
  _$jscoverage['/gregorian.js'].lineData[609]++;
  this.fieldsComputed = false;
  _$jscoverage['/gregorian.js'].lineData[610]++;
  this.complete();
}, 
  get: function(field) {
  _$jscoverage['/gregorian.js'].functionData[13]++;
  _$jscoverage['/gregorian.js'].lineData[619]++;
  this.complete();
  _$jscoverage['/gregorian.js'].lineData[620]++;
  return this.fields[field];
}, 
  set: function(field, v) {
  _$jscoverage['/gregorian.js'].functionData[14]++;
  _$jscoverage['/gregorian.js'].lineData[709]++;
  var len = arguments.length;
  _$jscoverage['/gregorian.js'].lineData[710]++;
  if (visit53_710_1(len === 2)) {
    _$jscoverage['/gregorian.js'].lineData[711]++;
    this.fields[field] = v;
  } else {
    _$jscoverage['/gregorian.js'].lineData[712]++;
    if (visit54_712_1(len < MILLISECONDS + 1)) {
      _$jscoverage['/gregorian.js'].lineData[713]++;
      for (var i = 0; visit55_713_1(i < len); i++) {
        _$jscoverage['/gregorian.js'].lineData[714]++;
        this.fields[YEAR + i] = arguments[i];
      }
    } else {
      _$jscoverage['/gregorian.js'].lineData[717]++;
      throw new Error('illegal arguments for KISSY GregorianCalendar set');
    }
  }
  _$jscoverage['/gregorian.js'].lineData[719]++;
  this.time = undefined;
}, 
  add: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[15]++;
  _$jscoverage['/gregorian.js'].lineData[831]++;
  if (visit56_831_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[832]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[834]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[835]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[837]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[838]++;
  if (visit57_838_1(field === YEAR)) {
    _$jscoverage['/gregorian.js'].lineData[839]++;
    value += amount;
    _$jscoverage['/gregorian.js'].lineData[840]++;
    self.set(YEAR, value);
    _$jscoverage['/gregorian.js'].lineData[841]++;
    adjustDayOfMonth(self);
  } else {
    _$jscoverage['/gregorian.js'].lineData[842]++;
    if (visit58_842_1(field === MONTH)) {
      _$jscoverage['/gregorian.js'].lineData[843]++;
      value += amount;
      _$jscoverage['/gregorian.js'].lineData[844]++;
      var yearAmount = floorDivide(value / 12);
      _$jscoverage['/gregorian.js'].lineData[845]++;
      value = mod(value, 12);
      _$jscoverage['/gregorian.js'].lineData[846]++;
      if (visit59_846_1(yearAmount)) {
        _$jscoverage['/gregorian.js'].lineData[847]++;
        self.set(YEAR, fields[YEAR] + yearAmount);
      }
      _$jscoverage['/gregorian.js'].lineData[849]++;
      self.set(MONTH, value);
      _$jscoverage['/gregorian.js'].lineData[850]++;
      adjustDayOfMonth(self);
    } else {
      _$jscoverage['/gregorian.js'].lineData[852]++;
      switch (field) {
        case HOUR_OF_DAY:
          _$jscoverage['/gregorian.js'].lineData[854]++;
          amount *= ONE_HOUR;
          _$jscoverage['/gregorian.js'].lineData[855]++;
          break;
        case MINUTE:
          _$jscoverage['/gregorian.js'].lineData[857]++;
          amount *= ONE_MINUTE;
          _$jscoverage['/gregorian.js'].lineData[858]++;
          break;
        case SECONDS:
          _$jscoverage['/gregorian.js'].lineData[860]++;
          amount *= ONE_SECOND;
          _$jscoverage['/gregorian.js'].lineData[861]++;
          break;
        case MILLISECONDS:
          _$jscoverage['/gregorian.js'].lineData[863]++;
          break;
        case WEEK_OF_MONTH:
        case WEEK_OF_YEAR:
        case DAY_OF_WEEK_IN_MONTH:
          _$jscoverage['/gregorian.js'].lineData[867]++;
          amount *= ONE_WEEK;
          _$jscoverage['/gregorian.js'].lineData[868]++;
          break;
        case DAY_OF_WEEK:
        case DAY_OF_YEAR:
        case DAY_OF_MONTH:
          _$jscoverage['/gregorian.js'].lineData[872]++;
          amount *= ONE_DAY;
          _$jscoverage['/gregorian.js'].lineData[873]++;
          break;
        default:
          _$jscoverage['/gregorian.js'].lineData[875]++;
          throw new Error('illegal field for add');
      }
      _$jscoverage['/gregorian.js'].lineData[877]++;
      self.setTime(self.time + amount);
    }
  }
}, 
  getRolledValue: function(value, amount, min, max) {
  _$jscoverage['/gregorian.js'].functionData[16]++;
  _$jscoverage['/gregorian.js'].lineData[962]++;
  var diff = value - min;
  _$jscoverage['/gregorian.js'].lineData[963]++;
  var range = max - min + 1;
  _$jscoverage['/gregorian.js'].lineData[964]++;
  amount %= range;
  _$jscoverage['/gregorian.js'].lineData[965]++;
  return min + (diff + amount + range) % range;
}, 
  roll: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[17]++;
  _$jscoverage['/gregorian.js'].lineData[990]++;
  if (visit60_990_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[991]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[993]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[995]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[996]++;
  var min = self.getActualMinimum(field);
  _$jscoverage['/gregorian.js'].lineData[997]++;
  var max = self.getActualMaximum(field);
  _$jscoverage['/gregorian.js'].lineData[998]++;
  value = self.getRolledValue(value, amount, min, max);
  _$jscoverage['/gregorian.js'].lineData[1000]++;
  self.set(field, value);
  _$jscoverage['/gregorian.js'].lineData[1003]++;
  switch (field) {
    case MONTH:
      _$jscoverage['/gregorian.js'].lineData[1005]++;
      adjustDayOfMonth(self);
      _$jscoverage['/gregorian.js'].lineData[1006]++;
      break;
    default:
      _$jscoverage['/gregorian.js'].lineData[1009]++;
      self.updateFieldsBySet(field);
      _$jscoverage['/gregorian.js'].lineData[1010]++;
      break;
  }
}, 
  updateFieldsBySet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[18]++;
  _$jscoverage['/gregorian.js'].lineData[1095]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1096]++;
  switch (field) {
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[1098]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1099]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1101]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1102]++;
      break;
    case DAY_OF_WEEK:
      _$jscoverage['/gregorian.js'].lineData[1104]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1105]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1107]++;
      fields[DAY_OF_YEAR] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1108]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1109]++;
      break;
  }
}, 
  getTimezoneOffset: function() {
  _$jscoverage['/gregorian.js'].functionData[19]++;
  _$jscoverage['/gregorian.js'].lineData[1118]++;
  return this.timezoneOffset;
}, 
  'setTimezoneOffset': function(timezoneOffset) {
  _$jscoverage['/gregorian.js'].functionData[20]++;
  _$jscoverage['/gregorian.js'].lineData[1125]++;
  if (visit61_1125_1(this.timezoneOffset !== timezoneOffset)) {
    _$jscoverage['/gregorian.js'].lineData[1126]++;
    this.fieldsComputed = undefined;
    _$jscoverage['/gregorian.js'].lineData[1127]++;
    this.timezoneOffset = timezoneOffset;
  }
}, 
  'setFirstDayOfWeek': function(firstDayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[21]++;
  _$jscoverage['/gregorian.js'].lineData[1135]++;
  if (visit62_1135_1(this.firstDayOfWeek !== firstDayOfWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1136]++;
    this.firstDayOfWeek = firstDayOfWeek;
    _$jscoverage['/gregorian.js'].lineData[1137]++;
    this.fieldsComputed = false;
  }
}, 
  'getFirstDayOfWeek': function() {
  _$jscoverage['/gregorian.js'].functionData[22]++;
  _$jscoverage['/gregorian.js'].lineData[1146]++;
  return this.firstDayOfWeek;
}, 
  'setMinimalDaysInFirstWeek': function(minimalDaysInFirstWeek) {
  _$jscoverage['/gregorian.js'].functionData[23]++;
  _$jscoverage['/gregorian.js'].lineData[1157]++;
  if (visit63_1157_1(this.minimalDaysInFirstWeek !== minimalDaysInFirstWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1158]++;
    this.minimalDaysInFirstWeek = minimalDaysInFirstWeek;
    _$jscoverage['/gregorian.js'].lineData[1159]++;
    this.fieldsComputed = false;
  }
}, 
  'getMinimalDaysInFirstWeek': function() {
  _$jscoverage['/gregorian.js'].functionData[24]++;
  _$jscoverage['/gregorian.js'].lineData[1171]++;
  return this.minimalDaysInFirstWeek;
}, 
  'getWeeksInWeekYear': function() {
  _$jscoverage['/gregorian.js'].functionData[25]++;
  _$jscoverage['/gregorian.js'].lineData[1188]++;
  var weekYear = this.getWeekYear();
  _$jscoverage['/gregorian.js'].lineData[1189]++;
  if (visit64_1189_1(weekYear === this.get(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[1190]++;
    return this.getActualMaximum(WEEK_OF_YEAR);
  }
  _$jscoverage['/gregorian.js'].lineData[1193]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1194]++;
  gc.setWeekDate(weekYear, 2, this.get(DAY_OF_WEEK));
  _$jscoverage['/gregorian.js'].lineData[1195]++;
  return gc.getActualMaximum(WEEK_OF_YEAR);
}, 
  getWeekYear: function() {
  _$jscoverage['/gregorian.js'].functionData[26]++;
  _$jscoverage['/gregorian.js'].lineData[1207]++;
  var year = this.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1208]++;
  var weekOfYear = this.get(WEEK_OF_YEAR);
  _$jscoverage['/gregorian.js'].lineData[1209]++;
  var month = this.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1210]++;
  if (visit65_1210_1(month === GregorianCalendar.JANUARY)) {
    _$jscoverage['/gregorian.js'].lineData[1211]++;
    if (visit66_1211_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[1212]++;
      --year;
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[1214]++;
    if (visit67_1214_1(month === GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[1215]++;
      if (visit68_1215_1(weekOfYear === 1)) {
        _$jscoverage['/gregorian.js'].lineData[1216]++;
        ++year;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1219]++;
  return year;
}, 
  'setWeekDate': function(weekYear, weekOfYear, dayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[27]++;
  _$jscoverage['/gregorian.js'].lineData[1231]++;
  if (visit69_1231_1(visit70_1231_2(dayOfWeek < GregorianCalendar.SUNDAY) || visit71_1231_3(dayOfWeek > GregorianCalendar.SATURDAY))) {
    _$jscoverage['/gregorian.js'].lineData[1232]++;
    throw new Error('invalid dayOfWeek: ' + dayOfWeek);
  }
  _$jscoverage['/gregorian.js'].lineData[1234]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1237]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1238]++;
  gc.clear();
  _$jscoverage['/gregorian.js'].lineData[1239]++;
  gc.setTimezoneOffset(0);
  _$jscoverage['/gregorian.js'].lineData[1240]++;
  gc.set(YEAR, weekYear);
  _$jscoverage['/gregorian.js'].lineData[1241]++;
  gc.set(WEEK_OF_YEAR, 1);
  _$jscoverage['/gregorian.js'].lineData[1242]++;
  gc.set(DAY_OF_WEEK, this.getFirstDayOfWeek());
  _$jscoverage['/gregorian.js'].lineData[1243]++;
  var days = dayOfWeek - this.getFirstDayOfWeek();
  _$jscoverage['/gregorian.js'].lineData[1244]++;
  if (visit72_1244_1(days < 0)) {
    _$jscoverage['/gregorian.js'].lineData[1245]++;
    days += 7;
  }
  _$jscoverage['/gregorian.js'].lineData[1247]++;
  days += 7 * (weekOfYear - 1);
  _$jscoverage['/gregorian.js'].lineData[1248]++;
  if (visit73_1248_1(days !== 0)) {
    _$jscoverage['/gregorian.js'].lineData[1249]++;
    gc.add(DAY_OF_YEAR, days);
  } else {
    _$jscoverage['/gregorian.js'].lineData[1251]++;
    gc.complete();
  }
  _$jscoverage['/gregorian.js'].lineData[1253]++;
  fields[YEAR] = gc.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1254]++;
  fields[MONTH] = gc.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1255]++;
  fields[DAY_OF_MONTH] = gc.get(DAY_OF_MONTH);
  _$jscoverage['/gregorian.js'].lineData[1256]++;
  this.complete();
}, 
  clone: function() {
  _$jscoverage['/gregorian.js'].functionData[28]++;
  _$jscoverage['/gregorian.js'].lineData[1263]++;
  if (visit74_1263_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1264]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[1266]++;
  var cal = new GregorianCalendar(this.timezoneOffset, this.locale);
  _$jscoverage['/gregorian.js'].lineData[1267]++;
  cal.setTime(this.time);
  _$jscoverage['/gregorian.js'].lineData[1268]++;
  return cal;
}, 
  equals: function(obj) {
  _$jscoverage['/gregorian.js'].functionData[29]++;
  _$jscoverage['/gregorian.js'].lineData[1280]++;
  return visit75_1280_1(visit76_1280_2(this.getTime() === obj.getTime()) && visit77_1281_1(visit78_1281_2(this.firstDayOfWeek === obj.firstDayOfWeek) && visit79_1282_1(visit80_1282_2(this.timezoneOffset === obj.timezoneOffset) && visit81_1283_1(this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek))));
}, 
  clear: function(field) {
  _$jscoverage['/gregorian.js'].functionData[30]++;
  _$jscoverage['/gregorian.js'].lineData[1294]++;
  if (visit82_1294_1(field === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1295]++;
    this.field = [];
  } else {
    _$jscoverage['/gregorian.js'].lineData[1297]++;
    this.fields[field] = undefined;
  }
  _$jscoverage['/gregorian.js'].lineData[1299]++;
  this.time = undefined;
  _$jscoverage['/gregorian.js'].lineData[1300]++;
  this.fieldsComputed = false;
}};
  _$jscoverage['/gregorian.js'].lineData[1304]++;
  var GregorianCalendarProto = GregorianCalendar.prototype;
  _$jscoverage['/gregorian.js'].lineData[1306]++;
  if (visit83_1306_1('@DEBUG@')) {
    _$jscoverage['/gregorian.js'].lineData[1308]++;
    GregorianCalendarProto.getDayOfMonth = GregorianCalendarProto.getHourOfDay = GregorianCalendarProto.getWeekOfYear = GregorianCalendarProto.getWeekOfMonth = GregorianCalendarProto.getDayOfYear = GregorianCalendarProto.getDayOfWeek = GregorianCalendarProto.getDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1316]++;
    GregorianCalendarProto.addDayOfMonth = GregorianCalendarProto.addMonth = GregorianCalendarProto.addYear = GregorianCalendarProto.addMinutes = GregorianCalendarProto.addSeconds = GregorianCalendarProto.addMilliSeconds = GregorianCalendarProto.addHourOfDay = GregorianCalendarProto.addWeekOfYear = GregorianCalendarProto.addWeekOfMonth = GregorianCalendarProto.addDayOfYear = GregorianCalendarProto.addDayOfWeek = GregorianCalendarProto.addDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1329]++;
    GregorianCalendarProto.isSetDayOfMonth = GregorianCalendarProto.isSetMonth = GregorianCalendarProto.isSetYear = GregorianCalendarProto.isSetMinutes = GregorianCalendarProto.isSetSeconds = GregorianCalendarProto.isSetMilliSeconds = GregorianCalendarProto.isSetHourOfDay = GregorianCalendarProto.isSetWeekOfYear = GregorianCalendarProto.isSetWeekOfMonth = GregorianCalendarProto.isSetDayOfYear = GregorianCalendarProto.isSetDayOfWeek = GregorianCalendarProto.isSetDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1341]++;
    GregorianCalendarProto.setDayOfMonth = GregorianCalendarProto.setHourOfDay = GregorianCalendarProto.setWeekOfYear = GregorianCalendarProto.setWeekOfMonth = GregorianCalendarProto.setDayOfYear = GregorianCalendarProto.setDayOfWeek = GregorianCalendarProto.setDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1349]++;
    GregorianCalendarProto.rollDayOfMonth = GregorianCalendarProto.rollMonth = GregorianCalendarProto.rollYear = GregorianCalendarProto.rollMinutes = GregorianCalendarProto.rollSeconds = GregorianCalendarProto.rollMilliSeconds = GregorianCalendarProto.rollHourOfDay = GregorianCalendarProto.rollWeekOfYear = GregorianCalendarProto.rollWeekOfMonth = GregorianCalendarProto.rollDayOfYear = GregorianCalendarProto.rollDayOfWeek = GregorianCalendarProto.rollDayOfWeekInMonth = S.noop;
  }
  _$jscoverage['/gregorian.js'].lineData[1362]++;
  S.each(fields, function(f, index) {
  _$jscoverage['/gregorian.js'].functionData[31]++;
  _$jscoverage['/gregorian.js'].lineData[1363]++;
  if (visit84_1363_1(f)) {
    _$jscoverage['/gregorian.js'].lineData[1364]++;
    GregorianCalendarProto['get' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[32]++;
  _$jscoverage['/gregorian.js'].lineData[1365]++;
  return this.get(index);
};
    _$jscoverage['/gregorian.js'].lineData[1368]++;
    GregorianCalendarProto['isSet' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[33]++;
  _$jscoverage['/gregorian.js'].lineData[1369]++;
  return this.isSet(index);
};
    _$jscoverage['/gregorian.js'].lineData[1372]++;
    GregorianCalendarProto['set' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[34]++;
  _$jscoverage['/gregorian.js'].lineData[1373]++;
  return this.set(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1376]++;
    GregorianCalendarProto['add' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[35]++;
  _$jscoverage['/gregorian.js'].lineData[1377]++;
  return this.add(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1380]++;
    GregorianCalendarProto['roll' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[36]++;
  _$jscoverage['/gregorian.js'].lineData[1381]++;
  return this.roll(index, v);
};
  }
});
  _$jscoverage['/gregorian.js'].lineData[1389]++;
  function adjustDayOfMonth(self) {
    _$jscoverage['/gregorian.js'].functionData[37]++;
    _$jscoverage['/gregorian.js'].lineData[1390]++;
    var fields = self.fields;
    _$jscoverage['/gregorian.js'].lineData[1391]++;
    var year = fields[YEAR];
    _$jscoverage['/gregorian.js'].lineData[1392]++;
    var month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[1393]++;
    var monthLen = getMonthLength(year, month);
    _$jscoverage['/gregorian.js'].lineData[1394]++;
    var dayOfMonth = fields[DAY_OF_MONTH];
    _$jscoverage['/gregorian.js'].lineData[1395]++;
    if (visit85_1395_1(dayOfMonth > monthLen)) {
      _$jscoverage['/gregorian.js'].lineData[1396]++;
      self.set(DAY_OF_MONTH, monthLen);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1400]++;
  function getMonthLength(year, month) {
    _$jscoverage['/gregorian.js'].functionData[38]++;
    _$jscoverage['/gregorian.js'].lineData[1401]++;
    return isLeapYear(year) ? LEAP_MONTH_LENGTH[month] : MONTH_LENGTH[month];
  }
  _$jscoverage['/gregorian.js'].lineData[1404]++;
  function getYearLength(year) {
    _$jscoverage['/gregorian.js'].functionData[39]++;
    _$jscoverage['/gregorian.js'].lineData[1405]++;
    return isLeapYear(year) ? 366 : 365;
  }
  _$jscoverage['/gregorian.js'].lineData[1408]++;
  function getWeekNumber(self, fixedDay1, fixedDate) {
    _$jscoverage['/gregorian.js'].functionData[40]++;
    _$jscoverage['/gregorian.js'].lineData[1409]++;
    var fixedDay1st = getDayOfWeekDateOnOrBefore(fixedDay1 + 6, self.firstDayOfWeek);
    _$jscoverage['/gregorian.js'].lineData[1410]++;
    var nDays = (fixedDay1st - fixedDay1);
    _$jscoverage['/gregorian.js'].lineData[1411]++;
    if (visit86_1411_1(nDays >= self.minimalDaysInFirstWeek)) {
      _$jscoverage['/gregorian.js'].lineData[1412]++;
      fixedDay1st -= 7;
    }
    _$jscoverage['/gregorian.js'].lineData[1414]++;
    var normalizedDayOfPeriod = (fixedDate - fixedDay1st);
    _$jscoverage['/gregorian.js'].lineData[1415]++;
    return floorDivide(normalizedDayOfPeriod / 7) + 1;
  }
  _$jscoverage['/gregorian.js'].lineData[1418]++;
  function getDayOfWeekDateOnOrBefore(fixedDate, dayOfWeek) {
    _$jscoverage['/gregorian.js'].functionData[41]++;
    _$jscoverage['/gregorian.js'].lineData[1421]++;
    return fixedDate - mod(fixedDate - dayOfWeek, 7);
  }
  _$jscoverage['/gregorian.js'].lineData[1426]++;
  return GregorianCalendar;
});
