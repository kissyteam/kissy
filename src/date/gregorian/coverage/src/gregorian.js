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
  _$jscoverage['/gregorian.js'].lineData[11] = 0;
  _$jscoverage['/gregorian.js'].lineData[12] = 0;
  _$jscoverage['/gregorian.js'].lineData[45] = 0;
  _$jscoverage['/gregorian.js'].lineData[47] = 0;
  _$jscoverage['/gregorian.js'].lineData[49] = 0;
  _$jscoverage['/gregorian.js'].lineData[50] = 0;
  _$jscoverage['/gregorian.js'].lineData[51] = 0;
  _$jscoverage['/gregorian.js'].lineData[52] = 0;
  _$jscoverage['/gregorian.js'].lineData[53] = 0;
  _$jscoverage['/gregorian.js'].lineData[56] = 0;
  _$jscoverage['/gregorian.js'].lineData[58] = 0;
  _$jscoverage['/gregorian.js'].lineData[60] = 0;
  _$jscoverage['/gregorian.js'].lineData[67] = 0;
  _$jscoverage['/gregorian.js'].lineData[73] = 0;
  _$jscoverage['/gregorian.js'].lineData[79] = 0;
  _$jscoverage['/gregorian.js'].lineData[87] = 0;
  _$jscoverage['/gregorian.js'].lineData[89] = 0;
  _$jscoverage['/gregorian.js'].lineData[91] = 0;
  _$jscoverage['/gregorian.js'].lineData[92] = 0;
  _$jscoverage['/gregorian.js'].lineData[96] = 0;
  _$jscoverage['/gregorian.js'].lineData[98] = 0;
  _$jscoverage['/gregorian.js'].lineData[187] = 0;
  _$jscoverage['/gregorian.js'].lineData[195] = 0;
  _$jscoverage['/gregorian.js'].lineData[196] = 0;
  _$jscoverage['/gregorian.js'].lineData[197] = 0;
  _$jscoverage['/gregorian.js'].lineData[198] = 0;
  _$jscoverage['/gregorian.js'].lineData[199] = 0;
  _$jscoverage['/gregorian.js'].lineData[200] = 0;
  _$jscoverage['/gregorian.js'].lineData[202] = 0;
  _$jscoverage['/gregorian.js'].lineData[203] = 0;
  _$jscoverage['/gregorian.js'].lineData[204] = 0;
  _$jscoverage['/gregorian.js'].lineData[205] = 0;
  _$jscoverage['/gregorian.js'].lineData[207] = 0;
  _$jscoverage['/gregorian.js'].lineData[208] = 0;
  _$jscoverage['/gregorian.js'].lineData[210] = 0;
  _$jscoverage['/gregorian.js'].lineData[211] = 0;
  _$jscoverage['/gregorian.js'].lineData[213] = 0;
  _$jscoverage['/gregorian.js'].lineData[214] = 0;
  _$jscoverage['/gregorian.js'].lineData[215] = 0;
  _$jscoverage['/gregorian.js'].lineData[216] = 0;
  _$jscoverage['/gregorian.js'].lineData[217] = 0;
  _$jscoverage['/gregorian.js'].lineData[219] = 0;
  _$jscoverage['/gregorian.js'].lineData[221] = 0;
  _$jscoverage['/gregorian.js'].lineData[226] = 0;
  _$jscoverage['/gregorian.js'].lineData[244] = 0;
  _$jscoverage['/gregorian.js'].lineData[260] = 0;
  _$jscoverage['/gregorian.js'].lineData[272] = 0;
  _$jscoverage['/gregorian.js'].lineData[280] = 0;
  _$jscoverage['/gregorian.js'].lineData[294] = 0;
  _$jscoverage['/gregorian.js'].lineData[295] = 0;
  _$jscoverage['/gregorian.js'].lineData[298] = 0;
  _$jscoverage['/gregorian.js'].lineData[299] = 0;
  _$jscoverage['/gregorian.js'].lineData[300] = 0;
  _$jscoverage['/gregorian.js'].lineData[301] = 0;
  _$jscoverage['/gregorian.js'].lineData[304] = 0;
  _$jscoverage['/gregorian.js'].lineData[317] = 0;
  _$jscoverage['/gregorian.js'].lineData[318] = 0;
  _$jscoverage['/gregorian.js'].lineData[320] = 0;
  _$jscoverage['/gregorian.js'].lineData[322] = 0;
  _$jscoverage['/gregorian.js'].lineData[324] = 0;
  _$jscoverage['/gregorian.js'].lineData[325] = 0;
  _$jscoverage['/gregorian.js'].lineData[328] = 0;
  _$jscoverage['/gregorian.js'].lineData[329] = 0;
  _$jscoverage['/gregorian.js'].lineData[330] = 0;
  _$jscoverage['/gregorian.js'].lineData[331] = 0;
  _$jscoverage['/gregorian.js'].lineData[333] = 0;
  _$jscoverage['/gregorian.js'].lineData[336] = 0;
  _$jscoverage['/gregorian.js'].lineData[337] = 0;
  _$jscoverage['/gregorian.js'].lineData[338] = 0;
  _$jscoverage['/gregorian.js'].lineData[341] = 0;
  _$jscoverage['/gregorian.js'].lineData[342] = 0;
  _$jscoverage['/gregorian.js'].lineData[345] = 0;
  _$jscoverage['/gregorian.js'].lineData[346] = 0;
  _$jscoverage['/gregorian.js'].lineData[348] = 0;
  _$jscoverage['/gregorian.js'].lineData[349] = 0;
  _$jscoverage['/gregorian.js'].lineData[351] = 0;
  _$jscoverage['/gregorian.js'].lineData[362] = 0;
  _$jscoverage['/gregorian.js'].lineData[371] = 0;
  _$jscoverage['/gregorian.js'].lineData[372] = 0;
  _$jscoverage['/gregorian.js'].lineData[373] = 0;
  _$jscoverage['/gregorian.js'].lineData[374] = 0;
  _$jscoverage['/gregorian.js'].lineData[375] = 0;
  _$jscoverage['/gregorian.js'].lineData[376] = 0;
  _$jscoverage['/gregorian.js'].lineData[377] = 0;
  _$jscoverage['/gregorian.js'].lineData[378] = 0;
  _$jscoverage['/gregorian.js'].lineData[379] = 0;
  _$jscoverage['/gregorian.js'].lineData[381] = 0;
  _$jscoverage['/gregorian.js'].lineData[382] = 0;
  _$jscoverage['/gregorian.js'].lineData[383] = 0;
  _$jscoverage['/gregorian.js'].lineData[387] = 0;
  _$jscoverage['/gregorian.js'].lineData[389] = 0;
  _$jscoverage['/gregorian.js'].lineData[391] = 0;
  _$jscoverage['/gregorian.js'].lineData[393] = 0;
  _$jscoverage['/gregorian.js'].lineData[394] = 0;
  _$jscoverage['/gregorian.js'].lineData[395] = 0;
  _$jscoverage['/gregorian.js'].lineData[396] = 0;
  _$jscoverage['/gregorian.js'].lineData[397] = 0;
  _$jscoverage['/gregorian.js'].lineData[399] = 0;
  _$jscoverage['/gregorian.js'].lineData[400] = 0;
  _$jscoverage['/gregorian.js'].lineData[401] = 0;
  _$jscoverage['/gregorian.js'].lineData[402] = 0;
  _$jscoverage['/gregorian.js'].lineData[403] = 0;
  _$jscoverage['/gregorian.js'].lineData[404] = 0;
  _$jscoverage['/gregorian.js'].lineData[405] = 0;
  _$jscoverage['/gregorian.js'].lineData[407] = 0;
  _$jscoverage['/gregorian.js'].lineData[414] = 0;
  _$jscoverage['/gregorian.js'].lineData[415] = 0;
  _$jscoverage['/gregorian.js'].lineData[416] = 0;
  _$jscoverage['/gregorian.js'].lineData[418] = 0;
  _$jscoverage['/gregorian.js'].lineData[419] = 0;
  _$jscoverage['/gregorian.js'].lineData[421] = 0;
  _$jscoverage['/gregorian.js'].lineData[424] = 0;
  _$jscoverage['/gregorian.js'].lineData[428] = 0;
  _$jscoverage['/gregorian.js'].lineData[429] = 0;
  _$jscoverage['/gregorian.js'].lineData[430] = 0;
  _$jscoverage['/gregorian.js'].lineData[433] = 0;
  _$jscoverage['/gregorian.js'].lineData[434] = 0;
  _$jscoverage['/gregorian.js'].lineData[435] = 0;
  _$jscoverage['/gregorian.js'].lineData[436] = 0;
  _$jscoverage['/gregorian.js'].lineData[438] = 0;
  _$jscoverage['/gregorian.js'].lineData[442] = 0;
  _$jscoverage['/gregorian.js'].lineData[446] = 0;
  _$jscoverage['/gregorian.js'].lineData[447] = 0;
  _$jscoverage['/gregorian.js'].lineData[449] = 0;
  _$jscoverage['/gregorian.js'].lineData[458] = 0;
  _$jscoverage['/gregorian.js'].lineData[459] = 0;
  _$jscoverage['/gregorian.js'].lineData[462] = 0;
  _$jscoverage['/gregorian.js'].lineData[464] = 0;
  _$jscoverage['/gregorian.js'].lineData[465] = 0;
  _$jscoverage['/gregorian.js'].lineData[466] = 0;
  _$jscoverage['/gregorian.js'].lineData[467] = 0;
  _$jscoverage['/gregorian.js'].lineData[469] = 0;
  _$jscoverage['/gregorian.js'].lineData[470] = 0;
  _$jscoverage['/gregorian.js'].lineData[471] = 0;
  _$jscoverage['/gregorian.js'].lineData[472] = 0;
  _$jscoverage['/gregorian.js'].lineData[473] = 0;
  _$jscoverage['/gregorian.js'].lineData[474] = 0;
  _$jscoverage['/gregorian.js'].lineData[476] = 0;
  _$jscoverage['/gregorian.js'].lineData[478] = 0;
  _$jscoverage['/gregorian.js'].lineData[480] = 0;
  _$jscoverage['/gregorian.js'].lineData[483] = 0;
  _$jscoverage['/gregorian.js'].lineData[485] = 0;
  _$jscoverage['/gregorian.js'].lineData[487] = 0;
  _$jscoverage['/gregorian.js'].lineData[489] = 0;
  _$jscoverage['/gregorian.js'].lineData[500] = 0;
  _$jscoverage['/gregorian.js'].lineData[501] = 0;
  _$jscoverage['/gregorian.js'].lineData[503] = 0;
  _$jscoverage['/gregorian.js'].lineData[504] = 0;
  _$jscoverage['/gregorian.js'].lineData[510] = 0;
  _$jscoverage['/gregorian.js'].lineData[512] = 0;
  _$jscoverage['/gregorian.js'].lineData[514] = 0;
  _$jscoverage['/gregorian.js'].lineData[516] = 0;
  _$jscoverage['/gregorian.js'].lineData[518] = 0;
  _$jscoverage['/gregorian.js'].lineData[520] = 0;
  _$jscoverage['/gregorian.js'].lineData[521] = 0;
  _$jscoverage['/gregorian.js'].lineData[522] = 0;
  _$jscoverage['/gregorian.js'].lineData[523] = 0;
  _$jscoverage['/gregorian.js'].lineData[524] = 0;
  _$jscoverage['/gregorian.js'].lineData[525] = 0;
  _$jscoverage['/gregorian.js'].lineData[526] = 0;
  _$jscoverage['/gregorian.js'].lineData[527] = 0;
  _$jscoverage['/gregorian.js'].lineData[533] = 0;
  _$jscoverage['/gregorian.js'].lineData[535] = 0;
  _$jscoverage['/gregorian.js'].lineData[537] = 0;
  _$jscoverage['/gregorian.js'].lineData[538] = 0;
  _$jscoverage['/gregorian.js'].lineData[541] = 0;
  _$jscoverage['/gregorian.js'].lineData[542] = 0;
  _$jscoverage['/gregorian.js'].lineData[543] = 0;
  _$jscoverage['/gregorian.js'].lineData[545] = 0;
  _$jscoverage['/gregorian.js'].lineData[546] = 0;
  _$jscoverage['/gregorian.js'].lineData[550] = 0;
  _$jscoverage['/gregorian.js'].lineData[551] = 0;
  _$jscoverage['/gregorian.js'].lineData[554] = 0;
  _$jscoverage['/gregorian.js'].lineData[555] = 0;
  _$jscoverage['/gregorian.js'].lineData[558] = 0;
  _$jscoverage['/gregorian.js'].lineData[560] = 0;
  _$jscoverage['/gregorian.js'].lineData[561] = 0;
  _$jscoverage['/gregorian.js'].lineData[562] = 0;
  _$jscoverage['/gregorian.js'].lineData[564] = 0;
  _$jscoverage['/gregorian.js'].lineData[566] = 0;
  _$jscoverage['/gregorian.js'].lineData[567] = 0;
  _$jscoverage['/gregorian.js'].lineData[568] = 0;
  _$jscoverage['/gregorian.js'].lineData[570] = 0;
  _$jscoverage['/gregorian.js'].lineData[575] = 0;
  _$jscoverage['/gregorian.js'].lineData[576] = 0;
  _$jscoverage['/gregorian.js'].lineData[578] = 0;
  _$jscoverage['/gregorian.js'].lineData[581] = 0;
  _$jscoverage['/gregorian.js'].lineData[582] = 0;
  _$jscoverage['/gregorian.js'].lineData[584] = 0;
  _$jscoverage['/gregorian.js'].lineData[585] = 0;
  _$jscoverage['/gregorian.js'].lineData[587] = 0;
  _$jscoverage['/gregorian.js'].lineData[591] = 0;
  _$jscoverage['/gregorian.js'].lineData[600] = 0;
  _$jscoverage['/gregorian.js'].lineData[601] = 0;
  _$jscoverage['/gregorian.js'].lineData[603] = 0;
  _$jscoverage['/gregorian.js'].lineData[611] = 0;
  _$jscoverage['/gregorian.js'].lineData[612] = 0;
  _$jscoverage['/gregorian.js'].lineData[613] = 0;
  _$jscoverage['/gregorian.js'].lineData[622] = 0;
  _$jscoverage['/gregorian.js'].lineData[623] = 0;
  _$jscoverage['/gregorian.js'].lineData[712] = 0;
  _$jscoverage['/gregorian.js'].lineData[713] = 0;
  _$jscoverage['/gregorian.js'].lineData[714] = 0;
  _$jscoverage['/gregorian.js'].lineData[715] = 0;
  _$jscoverage['/gregorian.js'].lineData[716] = 0;
  _$jscoverage['/gregorian.js'].lineData[717] = 0;
  _$jscoverage['/gregorian.js'].lineData[720] = 0;
  _$jscoverage['/gregorian.js'].lineData[722] = 0;
  _$jscoverage['/gregorian.js'].lineData[834] = 0;
  _$jscoverage['/gregorian.js'].lineData[835] = 0;
  _$jscoverage['/gregorian.js'].lineData[837] = 0;
  _$jscoverage['/gregorian.js'].lineData[838] = 0;
  _$jscoverage['/gregorian.js'].lineData[840] = 0;
  _$jscoverage['/gregorian.js'].lineData[841] = 0;
  _$jscoverage['/gregorian.js'].lineData[842] = 0;
  _$jscoverage['/gregorian.js'].lineData[843] = 0;
  _$jscoverage['/gregorian.js'].lineData[844] = 0;
  _$jscoverage['/gregorian.js'].lineData[845] = 0;
  _$jscoverage['/gregorian.js'].lineData[846] = 0;
  _$jscoverage['/gregorian.js'].lineData[847] = 0;
  _$jscoverage['/gregorian.js'].lineData[848] = 0;
  _$jscoverage['/gregorian.js'].lineData[849] = 0;
  _$jscoverage['/gregorian.js'].lineData[850] = 0;
  _$jscoverage['/gregorian.js'].lineData[852] = 0;
  _$jscoverage['/gregorian.js'].lineData[853] = 0;
  _$jscoverage['/gregorian.js'].lineData[855] = 0;
  _$jscoverage['/gregorian.js'].lineData[857] = 0;
  _$jscoverage['/gregorian.js'].lineData[858] = 0;
  _$jscoverage['/gregorian.js'].lineData[860] = 0;
  _$jscoverage['/gregorian.js'].lineData[861] = 0;
  _$jscoverage['/gregorian.js'].lineData[863] = 0;
  _$jscoverage['/gregorian.js'].lineData[864] = 0;
  _$jscoverage['/gregorian.js'].lineData[866] = 0;
  _$jscoverage['/gregorian.js'].lineData[870] = 0;
  _$jscoverage['/gregorian.js'].lineData[871] = 0;
  _$jscoverage['/gregorian.js'].lineData[875] = 0;
  _$jscoverage['/gregorian.js'].lineData[876] = 0;
  _$jscoverage['/gregorian.js'].lineData[878] = 0;
  _$jscoverage['/gregorian.js'].lineData[879] = 0;
  _$jscoverage['/gregorian.js'].lineData[881] = 0;
  _$jscoverage['/gregorian.js'].lineData[966] = 0;
  _$jscoverage['/gregorian.js'].lineData[967] = 0;
  _$jscoverage['/gregorian.js'].lineData[968] = 0;
  _$jscoverage['/gregorian.js'].lineData[969] = 0;
  _$jscoverage['/gregorian.js'].lineData[994] = 0;
  _$jscoverage['/gregorian.js'].lineData[995] = 0;
  _$jscoverage['/gregorian.js'].lineData[997] = 0;
  _$jscoverage['/gregorian.js'].lineData[999] = 0;
  _$jscoverage['/gregorian.js'].lineData[1000] = 0;
  _$jscoverage['/gregorian.js'].lineData[1001] = 0;
  _$jscoverage['/gregorian.js'].lineData[1002] = 0;
  _$jscoverage['/gregorian.js'].lineData[1004] = 0;
  _$jscoverage['/gregorian.js'].lineData[1007] = 0;
  _$jscoverage['/gregorian.js'].lineData[1009] = 0;
  _$jscoverage['/gregorian.js'].lineData[1010] = 0;
  _$jscoverage['/gregorian.js'].lineData[1013] = 0;
  _$jscoverage['/gregorian.js'].lineData[1014] = 0;
  _$jscoverage['/gregorian.js'].lineData[1099] = 0;
  _$jscoverage['/gregorian.js'].lineData[1100] = 0;
  _$jscoverage['/gregorian.js'].lineData[1102] = 0;
  _$jscoverage['/gregorian.js'].lineData[1103] = 0;
  _$jscoverage['/gregorian.js'].lineData[1105] = 0;
  _$jscoverage['/gregorian.js'].lineData[1106] = 0;
  _$jscoverage['/gregorian.js'].lineData[1108] = 0;
  _$jscoverage['/gregorian.js'].lineData[1109] = 0;
  _$jscoverage['/gregorian.js'].lineData[1111] = 0;
  _$jscoverage['/gregorian.js'].lineData[1112] = 0;
  _$jscoverage['/gregorian.js'].lineData[1113] = 0;
  _$jscoverage['/gregorian.js'].lineData[1122] = 0;
  _$jscoverage['/gregorian.js'].lineData[1129] = 0;
  _$jscoverage['/gregorian.js'].lineData[1130] = 0;
  _$jscoverage['/gregorian.js'].lineData[1131] = 0;
  _$jscoverage['/gregorian.js'].lineData[1139] = 0;
  _$jscoverage['/gregorian.js'].lineData[1140] = 0;
  _$jscoverage['/gregorian.js'].lineData[1141] = 0;
  _$jscoverage['/gregorian.js'].lineData[1150] = 0;
  _$jscoverage['/gregorian.js'].lineData[1161] = 0;
  _$jscoverage['/gregorian.js'].lineData[1162] = 0;
  _$jscoverage['/gregorian.js'].lineData[1163] = 0;
  _$jscoverage['/gregorian.js'].lineData[1175] = 0;
  _$jscoverage['/gregorian.js'].lineData[1192] = 0;
  _$jscoverage['/gregorian.js'].lineData[1193] = 0;
  _$jscoverage['/gregorian.js'].lineData[1194] = 0;
  _$jscoverage['/gregorian.js'].lineData[1197] = 0;
  _$jscoverage['/gregorian.js'].lineData[1198] = 0;
  _$jscoverage['/gregorian.js'].lineData[1199] = 0;
  _$jscoverage['/gregorian.js'].lineData[1211] = 0;
  _$jscoverage['/gregorian.js'].lineData[1212] = 0;
  _$jscoverage['/gregorian.js'].lineData[1213] = 0;
  _$jscoverage['/gregorian.js'].lineData[1214] = 0;
  _$jscoverage['/gregorian.js'].lineData[1215] = 0;
  _$jscoverage['/gregorian.js'].lineData[1216] = 0;
  _$jscoverage['/gregorian.js'].lineData[1218] = 0;
  _$jscoverage['/gregorian.js'].lineData[1219] = 0;
  _$jscoverage['/gregorian.js'].lineData[1220] = 0;
  _$jscoverage['/gregorian.js'].lineData[1223] = 0;
  _$jscoverage['/gregorian.js'].lineData[1235] = 0;
  _$jscoverage['/gregorian.js'].lineData[1236] = 0;
  _$jscoverage['/gregorian.js'].lineData[1238] = 0;
  _$jscoverage['/gregorian.js'].lineData[1241] = 0;
  _$jscoverage['/gregorian.js'].lineData[1242] = 0;
  _$jscoverage['/gregorian.js'].lineData[1243] = 0;
  _$jscoverage['/gregorian.js'].lineData[1244] = 0;
  _$jscoverage['/gregorian.js'].lineData[1245] = 0;
  _$jscoverage['/gregorian.js'].lineData[1246] = 0;
  _$jscoverage['/gregorian.js'].lineData[1247] = 0;
  _$jscoverage['/gregorian.js'].lineData[1248] = 0;
  _$jscoverage['/gregorian.js'].lineData[1249] = 0;
  _$jscoverage['/gregorian.js'].lineData[1251] = 0;
  _$jscoverage['/gregorian.js'].lineData[1252] = 0;
  _$jscoverage['/gregorian.js'].lineData[1253] = 0;
  _$jscoverage['/gregorian.js'].lineData[1255] = 0;
  _$jscoverage['/gregorian.js'].lineData[1257] = 0;
  _$jscoverage['/gregorian.js'].lineData[1258] = 0;
  _$jscoverage['/gregorian.js'].lineData[1259] = 0;
  _$jscoverage['/gregorian.js'].lineData[1260] = 0;
  _$jscoverage['/gregorian.js'].lineData[1267] = 0;
  _$jscoverage['/gregorian.js'].lineData[1268] = 0;
  _$jscoverage['/gregorian.js'].lineData[1270] = 0;
  _$jscoverage['/gregorian.js'].lineData[1271] = 0;
  _$jscoverage['/gregorian.js'].lineData[1272] = 0;
  _$jscoverage['/gregorian.js'].lineData[1284] = 0;
  _$jscoverage['/gregorian.js'].lineData[1298] = 0;
  _$jscoverage['/gregorian.js'].lineData[1299] = 0;
  _$jscoverage['/gregorian.js'].lineData[1301] = 0;
  _$jscoverage['/gregorian.js'].lineData[1303] = 0;
  _$jscoverage['/gregorian.js'].lineData[1304] = 0;
  _$jscoverage['/gregorian.js'].lineData[1308] = 0;
  _$jscoverage['/gregorian.js'].lineData[1310] = 0;
  _$jscoverage['/gregorian.js'].lineData[1312] = 0;
  _$jscoverage['/gregorian.js'].lineData[1320] = 0;
  _$jscoverage['/gregorian.js'].lineData[1333] = 0;
  _$jscoverage['/gregorian.js'].lineData[1345] = 0;
  _$jscoverage['/gregorian.js'].lineData[1353] = 0;
  _$jscoverage['/gregorian.js'].lineData[1366] = 0;
  _$jscoverage['/gregorian.js'].lineData[1367] = 0;
  _$jscoverage['/gregorian.js'].lineData[1368] = 0;
  _$jscoverage['/gregorian.js'].lineData[1369] = 0;
  _$jscoverage['/gregorian.js'].lineData[1372] = 0;
  _$jscoverage['/gregorian.js'].lineData[1373] = 0;
  _$jscoverage['/gregorian.js'].lineData[1376] = 0;
  _$jscoverage['/gregorian.js'].lineData[1377] = 0;
  _$jscoverage['/gregorian.js'].lineData[1380] = 0;
  _$jscoverage['/gregorian.js'].lineData[1381] = 0;
  _$jscoverage['/gregorian.js'].lineData[1384] = 0;
  _$jscoverage['/gregorian.js'].lineData[1385] = 0;
  _$jscoverage['/gregorian.js'].lineData[1393] = 0;
  _$jscoverage['/gregorian.js'].lineData[1394] = 0;
  _$jscoverage['/gregorian.js'].lineData[1395] = 0;
  _$jscoverage['/gregorian.js'].lineData[1396] = 0;
  _$jscoverage['/gregorian.js'].lineData[1397] = 0;
  _$jscoverage['/gregorian.js'].lineData[1398] = 0;
  _$jscoverage['/gregorian.js'].lineData[1399] = 0;
  _$jscoverage['/gregorian.js'].lineData[1400] = 0;
  _$jscoverage['/gregorian.js'].lineData[1404] = 0;
  _$jscoverage['/gregorian.js'].lineData[1405] = 0;
  _$jscoverage['/gregorian.js'].lineData[1408] = 0;
  _$jscoverage['/gregorian.js'].lineData[1409] = 0;
  _$jscoverage['/gregorian.js'].lineData[1412] = 0;
  _$jscoverage['/gregorian.js'].lineData[1413] = 0;
  _$jscoverage['/gregorian.js'].lineData[1414] = 0;
  _$jscoverage['/gregorian.js'].lineData[1415] = 0;
  _$jscoverage['/gregorian.js'].lineData[1416] = 0;
  _$jscoverage['/gregorian.js'].lineData[1418] = 0;
  _$jscoverage['/gregorian.js'].lineData[1419] = 0;
  _$jscoverage['/gregorian.js'].lineData[1422] = 0;
  _$jscoverage['/gregorian.js'].lineData[1425] = 0;
  _$jscoverage['/gregorian.js'].lineData[1430] = 0;
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
  _$jscoverage['/gregorian.js'].branchData['49'] = [];
  _$jscoverage['/gregorian.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['52'] = [];
  _$jscoverage['/gregorian.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['56'] = [];
  _$jscoverage['/gregorian.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['73'] = [];
  _$jscoverage['/gregorian.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['91'] = [];
  _$jscoverage['/gregorian.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['294'] = [];
  _$jscoverage['/gregorian.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['299'] = [];
  _$jscoverage['/gregorian.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['317'] = [];
  _$jscoverage['/gregorian.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['330'] = [];
  _$jscoverage['/gregorian.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['348'] = [];
  _$jscoverage['/gregorian.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['362'] = [];
  _$jscoverage['/gregorian.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['377'] = [];
  _$jscoverage['/gregorian.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['381'] = [];
  _$jscoverage['/gregorian.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['399'] = [];
  _$jscoverage['/gregorian.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['424'] = [];
  _$jscoverage['/gregorian.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['433'] = [];
  _$jscoverage['/gregorian.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['438'] = [];
  _$jscoverage['/gregorian.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['438'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['440'] = [];
  _$jscoverage['/gregorian.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['458'] = [];
  _$jscoverage['/gregorian.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['466'] = [];
  _$jscoverage['/gregorian.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['470'] = [];
  _$jscoverage['/gregorian.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['472'] = [];
  _$jscoverage['/gregorian.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['474'] = [];
  _$jscoverage['/gregorian.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['500'] = [];
  _$jscoverage['/gregorian.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['503'] = [];
  _$jscoverage['/gregorian.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['520'] = [];
  _$jscoverage['/gregorian.js'].branchData['520'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['522'] = [];
  _$jscoverage['/gregorian.js'].branchData['522'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['525'] = [];
  _$jscoverage['/gregorian.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['537'] = [];
  _$jscoverage['/gregorian.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['541'] = [];
  _$jscoverage['/gregorian.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['542'] = [];
  _$jscoverage['/gregorian.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['545'] = [];
  _$jscoverage['/gregorian.js'].branchData['545'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['550'] = [];
  _$jscoverage['/gregorian.js'].branchData['550'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['554'] = [];
  _$jscoverage['/gregorian.js'].branchData['554'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['561'] = [];
  _$jscoverage['/gregorian.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['567'] = [];
  _$jscoverage['/gregorian.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['575'] = [];
  _$jscoverage['/gregorian.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['581'] = [];
  _$jscoverage['/gregorian.js'].branchData['581'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['584'] = [];
  _$jscoverage['/gregorian.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['600'] = [];
  _$jscoverage['/gregorian.js'].branchData['600'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['713'] = [];
  _$jscoverage['/gregorian.js'].branchData['713'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['715'] = [];
  _$jscoverage['/gregorian.js'].branchData['715'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['716'] = [];
  _$jscoverage['/gregorian.js'].branchData['716'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['834'] = [];
  _$jscoverage['/gregorian.js'].branchData['834'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['841'] = [];
  _$jscoverage['/gregorian.js'].branchData['841'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['845'] = [];
  _$jscoverage['/gregorian.js'].branchData['845'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['849'] = [];
  _$jscoverage['/gregorian.js'].branchData['849'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['994'] = [];
  _$jscoverage['/gregorian.js'].branchData['994'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1129'] = [];
  _$jscoverage['/gregorian.js'].branchData['1129'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1139'] = [];
  _$jscoverage['/gregorian.js'].branchData['1139'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1161'] = [];
  _$jscoverage['/gregorian.js'].branchData['1161'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1193'] = [];
  _$jscoverage['/gregorian.js'].branchData['1193'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1214'] = [];
  _$jscoverage['/gregorian.js'].branchData['1214'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1215'] = [];
  _$jscoverage['/gregorian.js'].branchData['1215'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1218'] = [];
  _$jscoverage['/gregorian.js'].branchData['1218'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1219'] = [];
  _$jscoverage['/gregorian.js'].branchData['1219'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1235'] = [];
  _$jscoverage['/gregorian.js'].branchData['1235'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1235'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1235'][3] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1248'] = [];
  _$jscoverage['/gregorian.js'].branchData['1248'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1252'] = [];
  _$jscoverage['/gregorian.js'].branchData['1252'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1267'] = [];
  _$jscoverage['/gregorian.js'].branchData['1267'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1284'] = [];
  _$jscoverage['/gregorian.js'].branchData['1284'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1284'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1285'] = [];
  _$jscoverage['/gregorian.js'].branchData['1285'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1285'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1286'] = [];
  _$jscoverage['/gregorian.js'].branchData['1286'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1286'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1287'] = [];
  _$jscoverage['/gregorian.js'].branchData['1287'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1298'] = [];
  _$jscoverage['/gregorian.js'].branchData['1298'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1310'] = [];
  _$jscoverage['/gregorian.js'].branchData['1310'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1367'] = [];
  _$jscoverage['/gregorian.js'].branchData['1367'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1399'] = [];
  _$jscoverage['/gregorian.js'].branchData['1399'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1415'] = [];
  _$jscoverage['/gregorian.js'].branchData['1415'][1] = new BranchData();
}
_$jscoverage['/gregorian.js'].branchData['1415'][1].init(150, 36, 'nDays >= self.minimalDaysInFirstWeek');
function visit86_1415_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1415'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1399'][1].init(214, 21, 'dayOfMonth > monthLen');
function visit85_1399_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1399'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1367'][1].init(13, 1, 'f');
function visit84_1367_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1367'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1310'][1].init(44686, 9, '\'@DEBUG@\'');
function visit83_1310_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1310'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1298'][1].init(17, 19, 'field === undefined');
function visit82_1298_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1298'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1287'][1].init(60, 57, 'this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit81_1287_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1287'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1286'][2].init(135, 41, 'this.timezoneOffset == obj.timezoneOffset');
function visit80_1286_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1286'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1286'][1].init(60, 118, 'this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit79_1286_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1286'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1285'][2].init(73, 41, 'this.firstDayOfWeek == obj.firstDayOfWeek');
function visit78_1285_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1285'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1285'][1].init(50, 179, 'this.firstDayOfWeek == obj.firstDayOfWeek && this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit77_1285_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1285'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1284'][2].init(20, 31, 'this.getTime() == obj.getTime()');
function visit76_1284_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1284'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1284'][1].init(20, 230, 'this.getTime() == obj.getTime() && this.firstDayOfWeek == obj.firstDayOfWeek && this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit75_1284_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1284'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1267'][1].init(17, 23, 'this.time === undefined');
function visit74_1267_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1267'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1252'][1].init(764, 9, 'days != 0');
function visit73_1252_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1252'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1248'][1].init(653, 8, 'days < 0');
function visit72_1248_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1248'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1235'][3].init(57, 38, 'dayOfWeek > GregorianCalendar.SATURDAY');
function visit71_1235_3(result) {
  _$jscoverage['/gregorian.js'].branchData['1235'][3].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1235'][2].init(17, 36, 'dayOfWeek < GregorianCalendar.SUNDAY');
function visit70_1235_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1235'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1235'][1].init(17, 78, 'dayOfWeek < GregorianCalendar.SUNDAY || dayOfWeek > GregorianCalendar.SATURDAY');
function visit69_1235_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1235'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1219'][1].init(21, 15, 'weekOfYear == 1');
function visit68_1219_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1219'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1218'][1].init(322, 35, 'month == GregorianCalendar.DECEMBER');
function visit67_1218_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1218'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1215'][1].init(21, 16, 'weekOfYear >= 52');
function visit66_1215_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1215'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1214'][1].init(174, 34, 'month == GregorianCalendar.JANUARY');
function visit65_1214_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1214'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1193'][1].init(64, 26, 'weekYear == this.get(YEAR)');
function visit64_1193_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1193'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1161'][1].init(17, 53, 'this.minimalDaysInFirstWeek != minimalDaysInFirstWeek');
function visit63_1161_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1161'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1139'][1].init(17, 37, 'this.firstDayOfWeek != firstDayOfWeek');
function visit62_1139_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1139'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1129'][1].init(17, 37, 'this.timezoneOffset != timezoneOffset');
function visit61_1129_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1129'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['994'][1].init(17, 7, '!amount');
function visit60_994_1(result) {
  _$jscoverage['/gregorian.js'].branchData['994'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['849'][1].init(152, 10, 'yearAmount');
function visit59_849_1(result) {
  _$jscoverage['/gregorian.js'].branchData['849'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['845'][1].init(396, 15, 'field === MONTH');
function visit58_845_1(result) {
  _$jscoverage['/gregorian.js'].branchData['845'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['841'][1].init(242, 14, 'field === YEAR');
function visit57_841_1(result) {
  _$jscoverage['/gregorian.js'].branchData['841'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['834'][1].init(17, 7, '!amount');
function visit56_834_1(result) {
  _$jscoverage['/gregorian.js'].branchData['834'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['716'][1].init(33, 7, 'i < len');
function visit55_716_1(result) {
  _$jscoverage['/gregorian.js'].branchData['716'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['715'][1].init(133, 22, 'len < MILLISECONDS + 1');
function visit54_715_1(result) {
  _$jscoverage['/gregorian.js'].branchData['715'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['713'][1].init(57, 8, 'len == 2');
function visit53_713_1(result) {
  _$jscoverage['/gregorian.js'].branchData['713'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['600'][1].init(17, 23, 'this.time === undefined');
function visit52_600_1(result) {
  _$jscoverage['/gregorian.js'].branchData['600'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['584'][1].init(398, 30, 'dayOfWeek != firstDayOfWeekCfg');
function visit51_584_1(result) {
  _$jscoverage['/gregorian.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['581'][1].init(245, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
function visit50_581_1(result) {
  _$jscoverage['/gregorian.js'].branchData['581'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['575'][1].init(77, 23, 'self.isSet(DAY_OF_YEAR)');
function visit49_575_1(result) {
  _$jscoverage['/gregorian.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['567'][1].init(344, 9, 'dowim < 0');
function visit48_567_1(result) {
  _$jscoverage['/gregorian.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['561'][1].init(64, 32, 'self.isSet(DAY_OF_WEEK_IN_MONTH)');
function visit47_561_1(result) {
  _$jscoverage['/gregorian.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['554'][1].init(432, 30, 'dayOfWeek != firstDayOfWeekCfg');
function visit46_554_1(result) {
  _$jscoverage['/gregorian.js'].branchData['554'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['550'][1].init(266, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
function visit45_550_1(result) {
  _$jscoverage['/gregorian.js'].branchData['550'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['545'][1].init(25, 25, 'self.isSet(WEEK_OF_MONTH)');
function visit44_545_1(result) {
  _$jscoverage['/gregorian.js'].branchData['545'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['542'][1].init(21, 24, 'self.isSet(DAY_OF_MONTH)');
function visit43_542_1(result) {
  _$jscoverage['/gregorian.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['541'][1].init(1006, 17, 'self.isSet(MONTH)');
function visit42_541_1(result) {
  _$jscoverage['/gregorian.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['537'][1].init(899, 23, 'self.isSet(DAY_OF_WEEK)');
function visit41_537_1(result) {
  _$jscoverage['/gregorian.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['525'][1].init(206, 33, 'month < GregorianCalendar.JANUARY');
function visit40_525_1(result) {
  _$jscoverage['/gregorian.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['522'][1].init(60, 34, 'month > GregorianCalendar.DECEMBER');
function visit39_522_1(result) {
  _$jscoverage['/gregorian.js'].branchData['522'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['520'][1].init(235, 17, 'self.isSet(MONTH)');
function visit38_520_1(result) {
  _$jscoverage['/gregorian.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['503'][1].init(110, 20, '!this.fieldsComputed');
function visit37_503_1(result) {
  _$jscoverage['/gregorian.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['500'][1].init(17, 23, 'this.time === undefined');
function visit36_500_1(result) {
  _$jscoverage['/gregorian.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['474'][1].init(555, 25, 'fields[MILLISECONDS] || 0');
function visit35_474_1(result) {
  _$jscoverage['/gregorian.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['472'][1].init(477, 20, 'fields[SECONDS] || 0');
function visit34_472_1(result) {
  _$jscoverage['/gregorian.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['470'][1].init(402, 19, 'fields[MINUTE] || 0');
function visit33_470_1(result) {
  _$jscoverage['/gregorian.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['466'][1].init(257, 23, 'this.isSet(HOUR_OF_DAY)');
function visit32_466_1(result) {
  _$jscoverage['/gregorian.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['458'][1].init(17, 17, '!this.isSet(YEAR)');
function visit31_458_1(result) {
  _$jscoverage['/gregorian.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['440'][1].init(117, 29, 'fixedDate >= (nextJan1st - 7)');
function visit30_440_1(result) {
  _$jscoverage['/gregorian.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['438'][2].init(268, 36, 'nDays >= this.minimalDaysInFirstWeek');
function visit29_438_2(result) {
  _$jscoverage['/gregorian.js'].branchData['438'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['438'][1].init(268, 147, 'nDays >= this.minimalDaysInFirstWeek && fixedDate >= (nextJan1st - 7)');
function visit28_438_1(result) {
  _$jscoverage['/gregorian.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['433'][1].init(2422, 16, 'weekOfYear >= 52');
function visit27_433_1(result) {
  _$jscoverage['/gregorian.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['424'][1].init(1961, 15, 'weekOfYear == 0');
function visit26_424_1(result) {
  _$jscoverage['/gregorian.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['399'][1].init(959, 14, 'timeOfDay != 0');
function visit25_399_1(result) {
  _$jscoverage['/gregorian.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['381'][1].init(24, 13, 'timeOfDay < 0');
function visit24_381_1(result) {
  _$jscoverage['/gregorian.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['377'][1].init(322, 20, 'timeOfDay >= ONE_DAY');
function visit23_377_1(result) {
  _$jscoverage['/gregorian.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['362'][1].init(20, 32, 'this.fields[field] !== undefined');
function visit22_362_1(result) {
  _$jscoverage['/gregorian.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['348'][1].init(1225, 19, 'value === undefined');
function visit21_348_1(result) {
  _$jscoverage['/gregorian.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['330'][1].init(204, 10, 'value == 1');
function visit20_330_1(result) {
  _$jscoverage['/gregorian.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['317'][1].init(17, 31, 'MAX_VALUES[field] !== undefined');
function visit19_317_1(result) {
  _$jscoverage['/gregorian.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['299'][1].init(163, 23, 'field === WEEK_OF_MONTH');
function visit18_299_1(result) {
  _$jscoverage['/gregorian.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['294'][1].init(17, 31, 'MIN_VALUES[field] !== undefined');
function visit17_294_1(result) {
  _$jscoverage['/gregorian.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['91'][1].init(1208, 21, 'arguments.length >= 3');
function visit16_91_1(result) {
  _$jscoverage['/gregorian.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['73'][1].init(692, 39, 'timezoneOffset || locale.timezoneOffset');
function visit15_73_1(result) {
  _$jscoverage['/gregorian.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['56'][1].init(288, 23, 'locale || defaultLocale');
function visit14_56_1(result) {
  _$jscoverage['/gregorian.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['52'][1].init(197, 16, 'args.length >= 3');
function visit13_52_1(result) {
  _$jscoverage['/gregorian.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['49'][1].init(58, 26, 'S.isObject(timezoneOffset)');
function visit12_49_1(result) {
  _$jscoverage['/gregorian.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/gregorian.js'].functionData[0]++;
  _$jscoverage['/gregorian.js'].lineData[7]++;
  var toInt = parseInt;
  _$jscoverage['/gregorian.js'].lineData[8]++;
  var module = this;
  _$jscoverage['/gregorian.js'].lineData[9]++;
  var Utils = module.require('./gregorian/utils');
  _$jscoverage['/gregorian.js'].lineData[10]++;
  var defaultLocale = module.require('i18n!date');
  _$jscoverage['/gregorian.js'].lineData[11]++;
  var Const = module.require('./gregorian/const');
  _$jscoverage['/gregorian.js'].lineData[12]++;
  var undefined = undefined;
  _$jscoverage['/gregorian.js'].lineData[45]++;
  function GregorianCalendar(timezoneOffset, locale) {
    _$jscoverage['/gregorian.js'].functionData[1]++;
    _$jscoverage['/gregorian.js'].lineData[47]++;
    var args = S.makeArray(arguments);
    _$jscoverage['/gregorian.js'].lineData[49]++;
    if (visit12_49_1(S.isObject(timezoneOffset))) {
      _$jscoverage['/gregorian.js'].lineData[50]++;
      locale = timezoneOffset;
      _$jscoverage['/gregorian.js'].lineData[51]++;
      timezoneOffset = locale.timezoneOffset;
    } else {
      _$jscoverage['/gregorian.js'].lineData[52]++;
      if (visit13_52_1(args.length >= 3)) {
        _$jscoverage['/gregorian.js'].lineData[53]++;
        timezoneOffset = locale = null;
      }
    }
    _$jscoverage['/gregorian.js'].lineData[56]++;
    locale = visit14_56_1(locale || defaultLocale);
    _$jscoverage['/gregorian.js'].lineData[58]++;
    this.locale = locale;
    _$jscoverage['/gregorian.js'].lineData[60]++;
    this.fields = [];
    _$jscoverage['/gregorian.js'].lineData[67]++;
    this.time = undefined;
    _$jscoverage['/gregorian.js'].lineData[73]++;
    this.timezoneOffset = visit15_73_1(timezoneOffset || locale.timezoneOffset);
    _$jscoverage['/gregorian.js'].lineData[79]++;
    this.firstDayOfWeek = locale.firstDayOfWeek;
    _$jscoverage['/gregorian.js'].lineData[87]++;
    this.minimalDaysInFirstWeek = locale.minimalDaysInFirstWeek;
    _$jscoverage['/gregorian.js'].lineData[89]++;
    this.fieldsComputed = false;
    _$jscoverage['/gregorian.js'].lineData[91]++;
    if (visit16_91_1(arguments.length >= 3)) {
      _$jscoverage['/gregorian.js'].lineData[92]++;
      this.set.apply(this, args);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[96]++;
  S.mix(GregorianCalendar, Const);
  _$jscoverage['/gregorian.js'].lineData[98]++;
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
  _$jscoverage['/gregorian.js'].lineData[187]++;
  var fields = ['', 'Year', 'Month', 'DayOfMonth', 'HourOfDay', 'Minutes', 'Seconds', 'Milliseconds', 'WeekOfYear', 'WeekOfMonth', 'DayOfYear', 'DayOfWeek', 'DayOfWeekInMonth'];
  _$jscoverage['/gregorian.js'].lineData[195]++;
  var YEAR = GregorianCalendar.YEAR;
  _$jscoverage['/gregorian.js'].lineData[196]++;
  var MONTH = GregorianCalendar.MONTH;
  _$jscoverage['/gregorian.js'].lineData[197]++;
  var DAY_OF_MONTH = GregorianCalendar.DAY_OF_MONTH;
  _$jscoverage['/gregorian.js'].lineData[198]++;
  var HOUR_OF_DAY = GregorianCalendar.HOUR_OF_DAY;
  _$jscoverage['/gregorian.js'].lineData[199]++;
  var MINUTE = GregorianCalendar.MINUTES;
  _$jscoverage['/gregorian.js'].lineData[200]++;
  var SECONDS = GregorianCalendar.SECONDS;
  _$jscoverage['/gregorian.js'].lineData[202]++;
  var MILLISECONDS = GregorianCalendar.MILLISECONDS;
  _$jscoverage['/gregorian.js'].lineData[203]++;
  var DAY_OF_WEEK_IN_MONTH = GregorianCalendar.DAY_OF_WEEK_IN_MONTH;
  _$jscoverage['/gregorian.js'].lineData[204]++;
  var DAY_OF_YEAR = GregorianCalendar.DAY_OF_YEAR;
  _$jscoverage['/gregorian.js'].lineData[205]++;
  var DAY_OF_WEEK = GregorianCalendar.DAY_OF_WEEK;
  _$jscoverage['/gregorian.js'].lineData[207]++;
  var WEEK_OF_MONTH = GregorianCalendar.WEEK_OF_MONTH;
  _$jscoverage['/gregorian.js'].lineData[208]++;
  var WEEK_OF_YEAR = GregorianCalendar.WEEK_OF_YEAR;
  _$jscoverage['/gregorian.js'].lineData[210]++;
  var MONTH_LENGTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  _$jscoverage['/gregorian.js'].lineData[211]++;
  var LEAP_MONTH_LENGTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  _$jscoverage['/gregorian.js'].lineData[213]++;
  var ONE_SECOND = 1000;
  _$jscoverage['/gregorian.js'].lineData[214]++;
  var ONE_MINUTE = 60 * ONE_SECOND;
  _$jscoverage['/gregorian.js'].lineData[215]++;
  var ONE_HOUR = 60 * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[216]++;
  var ONE_DAY = 24 * ONE_HOUR;
  _$jscoverage['/gregorian.js'].lineData[217]++;
  var ONE_WEEK = ONE_DAY * 7;
  _$jscoverage['/gregorian.js'].lineData[219]++;
  var EPOCH_OFFSET = 719163;
  _$jscoverage['/gregorian.js'].lineData[221]++;
  var mod = Utils.mod, isLeapYear = Utils.isLeapYear, floorDivide = Math.floor;
  _$jscoverage['/gregorian.js'].lineData[226]++;
  var MIN_VALUES = [undefined, 1, GregorianCalendar.JANUARY, 1, 0, 0, 0, 0, 1, undefined, 1, GregorianCalendar.SUNDAY, 1];
  _$jscoverage['/gregorian.js'].lineData[244]++;
  var MAX_VALUES = [undefined, 292278994, GregorianCalendar.DECEMBER, undefined, 23, 59, 59, 999, undefined, undefined, undefined, GregorianCalendar.SATURDAY, undefined];
  _$jscoverage['/gregorian.js'].lineData[260]++;
  GregorianCalendar.prototype = {
  constructor: GregorianCalendar, 
  isLeapYear: function() {
  _$jscoverage['/gregorian.js'].functionData[2]++;
  _$jscoverage['/gregorian.js'].lineData[272]++;
  return isLeapYear(this.getYear());
}, 
  getLocale: function() {
  _$jscoverage['/gregorian.js'].functionData[3]++;
  _$jscoverage['/gregorian.js'].lineData[280]++;
  return this.locale;
}, 
  getActualMinimum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[4]++;
  _$jscoverage['/gregorian.js'].lineData[294]++;
  if (visit17_294_1(MIN_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[295]++;
    return MIN_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[298]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[299]++;
  if (visit18_299_1(field === WEEK_OF_MONTH)) {
    _$jscoverage['/gregorian.js'].lineData[300]++;
    var cal = new GregorianCalendar(fields[YEAR], fields[MONTH], 1);
    _$jscoverage['/gregorian.js'].lineData[301]++;
    return cal.get(WEEK_OF_MONTH);
  }
  _$jscoverage['/gregorian.js'].lineData[304]++;
  throw new Error('minimum value not defined!');
}, 
  getActualMaximum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[5]++;
  _$jscoverage['/gregorian.js'].lineData[317]++;
  if (visit19_317_1(MAX_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[318]++;
    return MAX_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[320]++;
  var value, fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[322]++;
  switch (field) {
    case DAY_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[324]++;
      value = getMonthLength(fields[YEAR], fields[MONTH]);
      _$jscoverage['/gregorian.js'].lineData[325]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[328]++;
      var endOfYear = new GregorianCalendar(fields[YEAR], GregorianCalendar.DECEMBER, 31);
      _$jscoverage['/gregorian.js'].lineData[329]++;
      value = endOfYear.get(WEEK_OF_YEAR);
      _$jscoverage['/gregorian.js'].lineData[330]++;
      if (visit20_330_1(value == 1)) {
        _$jscoverage['/gregorian.js'].lineData[331]++;
        value = 52;
      }
      _$jscoverage['/gregorian.js'].lineData[333]++;
      break;
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[336]++;
      var endOfMonth = new GregorianCalendar(fields[YEAR], fields[MONTH], getMonthLength(fields[YEAR], fields[MONTH]));
      _$jscoverage['/gregorian.js'].lineData[337]++;
      value = endOfMonth.get(WEEK_OF_MONTH);
      _$jscoverage['/gregorian.js'].lineData[338]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[341]++;
      value = getYearLength(fields[YEAR]);
      _$jscoverage['/gregorian.js'].lineData[342]++;
      break;
    case DAY_OF_WEEK_IN_MONTH:
      _$jscoverage['/gregorian.js'].lineData[345]++;
      value = toInt((getMonthLength(fields[YEAR], fields[MONTH]) - 1) / 7) + 1;
      _$jscoverage['/gregorian.js'].lineData[346]++;
      break;
  }
  _$jscoverage['/gregorian.js'].lineData[348]++;
  if (visit21_348_1(value === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[349]++;
    throw new Error('maximum value not defined!');
  }
  _$jscoverage['/gregorian.js'].lineData[351]++;
  return value;
}, 
  isSet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[6]++;
  _$jscoverage['/gregorian.js'].lineData[362]++;
  return visit22_362_1(this.fields[field] !== undefined);
}, 
  computeFields: function() {
  _$jscoverage['/gregorian.js'].functionData[7]++;
  _$jscoverage['/gregorian.js'].lineData[371]++;
  var time = this.time;
  _$jscoverage['/gregorian.js'].lineData[372]++;
  var timezoneOffset = this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[373]++;
  var fixedDate = toInt(timezoneOffset / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[374]++;
  var timeOfDay = timezoneOffset % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[375]++;
  fixedDate += toInt(time / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[376]++;
  timeOfDay += time % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[377]++;
  if (visit23_377_1(timeOfDay >= ONE_DAY)) {
    _$jscoverage['/gregorian.js'].lineData[378]++;
    timeOfDay -= ONE_DAY;
    _$jscoverage['/gregorian.js'].lineData[379]++;
    fixedDate++;
  } else {
    _$jscoverage['/gregorian.js'].lineData[381]++;
    while (visit24_381_1(timeOfDay < 0)) {
      _$jscoverage['/gregorian.js'].lineData[382]++;
      timeOfDay += ONE_DAY;
      _$jscoverage['/gregorian.js'].lineData[383]++;
      fixedDate--;
    }
  }
  _$jscoverage['/gregorian.js'].lineData[387]++;
  fixedDate += EPOCH_OFFSET;
  _$jscoverage['/gregorian.js'].lineData[389]++;
  var date = Utils.getGregorianDateFromFixedDate(fixedDate);
  _$jscoverage['/gregorian.js'].lineData[391]++;
  var year = date.year;
  _$jscoverage['/gregorian.js'].lineData[393]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[394]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[395]++;
  fields[MONTH] = date.month;
  _$jscoverage['/gregorian.js'].lineData[396]++;
  fields[DAY_OF_MONTH] = date.dayOfMonth;
  _$jscoverage['/gregorian.js'].lineData[397]++;
  fields[DAY_OF_WEEK] = date.dayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[399]++;
  if (visit25_399_1(timeOfDay != 0)) {
    _$jscoverage['/gregorian.js'].lineData[400]++;
    fields[HOUR_OF_DAY] = toInt(timeOfDay / ONE_HOUR);
    _$jscoverage['/gregorian.js'].lineData[401]++;
    var r = timeOfDay % ONE_HOUR;
    _$jscoverage['/gregorian.js'].lineData[402]++;
    fields[MINUTE] = toInt(r / ONE_MINUTE);
    _$jscoverage['/gregorian.js'].lineData[403]++;
    r %= ONE_MINUTE;
    _$jscoverage['/gregorian.js'].lineData[404]++;
    fields[SECONDS] = toInt(r / ONE_SECOND);
    _$jscoverage['/gregorian.js'].lineData[405]++;
    fields[MILLISECONDS] = r % ONE_SECOND;
  } else {
    _$jscoverage['/gregorian.js'].lineData[407]++;
    fields[HOUR_OF_DAY] = fields[MINUTE] = fields[SECONDS] = fields[MILLISECONDS] = 0;
  }
  _$jscoverage['/gregorian.js'].lineData[414]++;
  var fixedDateJan1 = Utils.getFixedDate(year, GregorianCalendar.JANUARY, 1);
  _$jscoverage['/gregorian.js'].lineData[415]++;
  var dayOfYear = fixedDate - fixedDateJan1 + 1;
  _$jscoverage['/gregorian.js'].lineData[416]++;
  var fixDateMonth1 = fixedDate - date.dayOfMonth + 1;
  _$jscoverage['/gregorian.js'].lineData[418]++;
  fields[DAY_OF_YEAR] = dayOfYear;
  _$jscoverage['/gregorian.js'].lineData[419]++;
  fields[DAY_OF_WEEK_IN_MONTH] = toInt((date.dayOfMonth - 1) / 7) + 1;
  _$jscoverage['/gregorian.js'].lineData[421]++;
  var weekOfYear = getWeekNumber(this, fixedDateJan1, fixedDate);
  _$jscoverage['/gregorian.js'].lineData[424]++;
  if (visit26_424_1(weekOfYear == 0)) {
    _$jscoverage['/gregorian.js'].lineData[428]++;
    var fixedDec31 = fixedDateJan1 - 1;
    _$jscoverage['/gregorian.js'].lineData[429]++;
    var prevJan1 = fixedDateJan1 - getYearLength(year - 1);
    _$jscoverage['/gregorian.js'].lineData[430]++;
    weekOfYear = getWeekNumber(this, prevJan1, fixedDec31);
  } else {
    _$jscoverage['/gregorian.js'].lineData[433]++;
    if (visit27_433_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[434]++;
      var nextJan1 = fixedDateJan1 + getYearLength(year);
      _$jscoverage['/gregorian.js'].lineData[435]++;
      var nextJan1st = getDayOfWeekDateOnOrBefore(nextJan1 + 6, this.firstDayOfWeek);
      _$jscoverage['/gregorian.js'].lineData[436]++;
      var nDays = nextJan1st - nextJan1;
      _$jscoverage['/gregorian.js'].lineData[438]++;
      if (visit28_438_1(visit29_438_2(nDays >= this.minimalDaysInFirstWeek) && visit30_440_1(fixedDate >= (nextJan1st - 7)))) {
        _$jscoverage['/gregorian.js'].lineData[442]++;
        weekOfYear = 1;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[446]++;
  fields[WEEK_OF_YEAR] = weekOfYear;
  _$jscoverage['/gregorian.js'].lineData[447]++;
  fields[WEEK_OF_MONTH] = getWeekNumber(this, fixDateMonth1, fixedDate);
  _$jscoverage['/gregorian.js'].lineData[449]++;
  this.fieldsComputed = true;
}, 
  'computeTime': function() {
  _$jscoverage['/gregorian.js'].functionData[8]++;
  _$jscoverage['/gregorian.js'].lineData[458]++;
  if (visit31_458_1(!this.isSet(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[459]++;
    throw new Error('year must be set for KISSY GregorianCalendar');
  }
  _$jscoverage['/gregorian.js'].lineData[462]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[464]++;
  var year = fields[YEAR];
  _$jscoverage['/gregorian.js'].lineData[465]++;
  var timeOfDay = 0;
  _$jscoverage['/gregorian.js'].lineData[466]++;
  if (visit32_466_1(this.isSet(HOUR_OF_DAY))) {
    _$jscoverage['/gregorian.js'].lineData[467]++;
    timeOfDay += fields[HOUR_OF_DAY];
  }
  _$jscoverage['/gregorian.js'].lineData[469]++;
  timeOfDay *= 60;
  _$jscoverage['/gregorian.js'].lineData[470]++;
  timeOfDay += visit33_470_1(fields[MINUTE] || 0);
  _$jscoverage['/gregorian.js'].lineData[471]++;
  timeOfDay *= 60;
  _$jscoverage['/gregorian.js'].lineData[472]++;
  timeOfDay += visit34_472_1(fields[SECONDS] || 0);
  _$jscoverage['/gregorian.js'].lineData[473]++;
  timeOfDay *= 1000;
  _$jscoverage['/gregorian.js'].lineData[474]++;
  timeOfDay += visit35_474_1(fields[MILLISECONDS] || 0);
  _$jscoverage['/gregorian.js'].lineData[476]++;
  var fixedDate = 0;
  _$jscoverage['/gregorian.js'].lineData[478]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[480]++;
  fixedDate = fixedDate + this.getFixedDate();
  _$jscoverage['/gregorian.js'].lineData[483]++;
  var millis = (fixedDate - EPOCH_OFFSET) * ONE_DAY + timeOfDay;
  _$jscoverage['/gregorian.js'].lineData[485]++;
  millis -= this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[487]++;
  this.time = millis;
  _$jscoverage['/gregorian.js'].lineData[489]++;
  this.computeFields();
}, 
  complete: function() {
  _$jscoverage['/gregorian.js'].functionData[9]++;
  _$jscoverage['/gregorian.js'].lineData[500]++;
  if (visit36_500_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[501]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[503]++;
  if (visit37_503_1(!this.fieldsComputed)) {
    _$jscoverage['/gregorian.js'].lineData[504]++;
    this.computeFields();
  }
}, 
  getFixedDate: function() {
  _$jscoverage['/gregorian.js'].functionData[10]++;
  _$jscoverage['/gregorian.js'].lineData[510]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[512]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[514]++;
  var firstDayOfWeekCfg = self.firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[516]++;
  var year = fields[YEAR];
  _$jscoverage['/gregorian.js'].lineData[518]++;
  var month = GregorianCalendar.JANUARY;
  _$jscoverage['/gregorian.js'].lineData[520]++;
  if (visit38_520_1(self.isSet(MONTH))) {
    _$jscoverage['/gregorian.js'].lineData[521]++;
    month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[522]++;
    if (visit39_522_1(month > GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[523]++;
      year += toInt(month / 12);
      _$jscoverage['/gregorian.js'].lineData[524]++;
      month %= 12;
    } else {
      _$jscoverage['/gregorian.js'].lineData[525]++;
      if (visit40_525_1(month < GregorianCalendar.JANUARY)) {
        _$jscoverage['/gregorian.js'].lineData[526]++;
        year += floorDivide(month / 12);
        _$jscoverage['/gregorian.js'].lineData[527]++;
        month = mod(month, 12);
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[533]++;
  var fixedDate = Utils.getFixedDate(year, month, 1);
  _$jscoverage['/gregorian.js'].lineData[535]++;
  var dayOfWeek = self.firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[537]++;
  if (visit41_537_1(self.isSet(DAY_OF_WEEK))) {
    _$jscoverage['/gregorian.js'].lineData[538]++;
    dayOfWeek = fields[DAY_OF_WEEK];
  }
  _$jscoverage['/gregorian.js'].lineData[541]++;
  if (visit42_541_1(self.isSet(MONTH))) {
    _$jscoverage['/gregorian.js'].lineData[542]++;
    if (visit43_542_1(self.isSet(DAY_OF_MONTH))) {
      _$jscoverage['/gregorian.js'].lineData[543]++;
      fixedDate += fields[DAY_OF_MONTH] - 1;
    } else {
      _$jscoverage['/gregorian.js'].lineData[545]++;
      if (visit44_545_1(self.isSet(WEEK_OF_MONTH))) {
        _$jscoverage['/gregorian.js'].lineData[546]++;
        var firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
        _$jscoverage['/gregorian.js'].lineData[550]++;
        if (visit45_550_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
          _$jscoverage['/gregorian.js'].lineData[551]++;
          firstDayOfWeek -= 7;
        }
        _$jscoverage['/gregorian.js'].lineData[554]++;
        if (visit46_554_1(dayOfWeek != firstDayOfWeekCfg)) {
          _$jscoverage['/gregorian.js'].lineData[555]++;
          firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
        }
        _$jscoverage['/gregorian.js'].lineData[558]++;
        fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_MONTH] - 1);
      } else {
        _$jscoverage['/gregorian.js'].lineData[560]++;
        var dowim;
        _$jscoverage['/gregorian.js'].lineData[561]++;
        if (visit47_561_1(self.isSet(DAY_OF_WEEK_IN_MONTH))) {
          _$jscoverage['/gregorian.js'].lineData[562]++;
          dowim = fields[DAY_OF_WEEK_IN_MONTH];
        } else {
          _$jscoverage['/gregorian.js'].lineData[564]++;
          dowim = 1;
        }
        _$jscoverage['/gregorian.js'].lineData[566]++;
        var lastDate = (7 * dowim);
        _$jscoverage['/gregorian.js'].lineData[567]++;
        if (visit48_567_1(dowim < 0)) {
          _$jscoverage['/gregorian.js'].lineData[568]++;
          lastDate = getMonthLength(year, month) + (7 * (dowim + 1));
        }
        _$jscoverage['/gregorian.js'].lineData[570]++;
        fixedDate = getDayOfWeekDateOnOrBefore(fixedDate + lastDate - 1, dayOfWeek);
      }
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[575]++;
    if (visit49_575_1(self.isSet(DAY_OF_YEAR))) {
      _$jscoverage['/gregorian.js'].lineData[576]++;
      fixedDate += fields[DAY_OF_YEAR] - 1;
    } else {
      _$jscoverage['/gregorian.js'].lineData[578]++;
      firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
      _$jscoverage['/gregorian.js'].lineData[581]++;
      if (visit50_581_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
        _$jscoverage['/gregorian.js'].lineData[582]++;
        firstDayOfWeek -= 7;
      }
      _$jscoverage['/gregorian.js'].lineData[584]++;
      if (visit51_584_1(dayOfWeek != firstDayOfWeekCfg)) {
        _$jscoverage['/gregorian.js'].lineData[585]++;
        firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
      }
      _$jscoverage['/gregorian.js'].lineData[587]++;
      fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_YEAR] - 1);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[591]++;
  return fixedDate;
}, 
  getTime: function() {
  _$jscoverage['/gregorian.js'].functionData[11]++;
  _$jscoverage['/gregorian.js'].lineData[600]++;
  if (visit52_600_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[601]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[603]++;
  return this.time;
}, 
  'setTime': function(time) {
  _$jscoverage['/gregorian.js'].functionData[12]++;
  _$jscoverage['/gregorian.js'].lineData[611]++;
  this.time = time;
  _$jscoverage['/gregorian.js'].lineData[612]++;
  this.fieldsComputed = false;
  _$jscoverage['/gregorian.js'].lineData[613]++;
  this.complete();
}, 
  get: function(field) {
  _$jscoverage['/gregorian.js'].functionData[13]++;
  _$jscoverage['/gregorian.js'].lineData[622]++;
  this.complete();
  _$jscoverage['/gregorian.js'].lineData[623]++;
  return this.fields[field];
}, 
  set: function(field, v) {
  _$jscoverage['/gregorian.js'].functionData[14]++;
  _$jscoverage['/gregorian.js'].lineData[712]++;
  var len = arguments.length;
  _$jscoverage['/gregorian.js'].lineData[713]++;
  if (visit53_713_1(len == 2)) {
    _$jscoverage['/gregorian.js'].lineData[714]++;
    this.fields[field] = v;
  } else {
    _$jscoverage['/gregorian.js'].lineData[715]++;
    if (visit54_715_1(len < MILLISECONDS + 1)) {
      _$jscoverage['/gregorian.js'].lineData[716]++;
      for (var i = 0; visit55_716_1(i < len); i++) {
        _$jscoverage['/gregorian.js'].lineData[717]++;
        this.fields[YEAR + i] = arguments[i];
      }
    } else {
      _$jscoverage['/gregorian.js'].lineData[720]++;
      throw new Error('illegal arguments for KISSY GregorianCalendar set');
    }
  }
  _$jscoverage['/gregorian.js'].lineData[722]++;
  this.time = undefined;
}, 
  add: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[15]++;
  _$jscoverage['/gregorian.js'].lineData[834]++;
  if (visit56_834_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[835]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[837]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[838]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[840]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[841]++;
  if (visit57_841_1(field === YEAR)) {
    _$jscoverage['/gregorian.js'].lineData[842]++;
    value += amount;
    _$jscoverage['/gregorian.js'].lineData[843]++;
    self.set(YEAR, value);
    _$jscoverage['/gregorian.js'].lineData[844]++;
    adjustDayOfMonth(self);
  } else {
    _$jscoverage['/gregorian.js'].lineData[845]++;
    if (visit58_845_1(field === MONTH)) {
      _$jscoverage['/gregorian.js'].lineData[846]++;
      value += amount;
      _$jscoverage['/gregorian.js'].lineData[847]++;
      var yearAmount = floorDivide(value / 12);
      _$jscoverage['/gregorian.js'].lineData[848]++;
      value = mod(value, 12);
      _$jscoverage['/gregorian.js'].lineData[849]++;
      if (visit59_849_1(yearAmount)) {
        _$jscoverage['/gregorian.js'].lineData[850]++;
        self.set(YEAR, fields[YEAR] + yearAmount);
      }
      _$jscoverage['/gregorian.js'].lineData[852]++;
      self.set(MONTH, value);
      _$jscoverage['/gregorian.js'].lineData[853]++;
      adjustDayOfMonth(self);
    } else {
      _$jscoverage['/gregorian.js'].lineData[855]++;
      switch (field) {
        case HOUR_OF_DAY:
          _$jscoverage['/gregorian.js'].lineData[857]++;
          amount *= ONE_HOUR;
          _$jscoverage['/gregorian.js'].lineData[858]++;
          break;
        case MINUTE:
          _$jscoverage['/gregorian.js'].lineData[860]++;
          amount *= ONE_MINUTE;
          _$jscoverage['/gregorian.js'].lineData[861]++;
          break;
        case SECONDS:
          _$jscoverage['/gregorian.js'].lineData[863]++;
          amount *= ONE_SECOND;
          _$jscoverage['/gregorian.js'].lineData[864]++;
          break;
        case MILLISECONDS:
          _$jscoverage['/gregorian.js'].lineData[866]++;
          break;
        case WEEK_OF_MONTH:
        case WEEK_OF_YEAR:
        case DAY_OF_WEEK_IN_MONTH:
          _$jscoverage['/gregorian.js'].lineData[870]++;
          amount *= ONE_WEEK;
          _$jscoverage['/gregorian.js'].lineData[871]++;
          break;
        case DAY_OF_WEEK:
        case DAY_OF_YEAR:
        case DAY_OF_MONTH:
          _$jscoverage['/gregorian.js'].lineData[875]++;
          amount *= ONE_DAY;
          _$jscoverage['/gregorian.js'].lineData[876]++;
          break;
        default:
          _$jscoverage['/gregorian.js'].lineData[878]++;
          throw new Error('illegal field for add');
          _$jscoverage['/gregorian.js'].lineData[879]++;
          break;
      }
      _$jscoverage['/gregorian.js'].lineData[881]++;
      self.setTime(self.time + amount);
    }
  }
}, 
  getRolledValue: function(value, amount, min, max) {
  _$jscoverage['/gregorian.js'].functionData[16]++;
  _$jscoverage['/gregorian.js'].lineData[966]++;
  var diff = value - min;
  _$jscoverage['/gregorian.js'].lineData[967]++;
  var range = max - min + 1;
  _$jscoverage['/gregorian.js'].lineData[968]++;
  amount %= range;
  _$jscoverage['/gregorian.js'].lineData[969]++;
  return min + (diff + amount + range) % range;
}, 
  roll: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[17]++;
  _$jscoverage['/gregorian.js'].lineData[994]++;
  if (visit60_994_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[995]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[997]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[999]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[1000]++;
  var min = self.getActualMinimum(field);
  _$jscoverage['/gregorian.js'].lineData[1001]++;
  var max = self.getActualMaximum(field);
  _$jscoverage['/gregorian.js'].lineData[1002]++;
  value = self.getRolledValue(value, amount, min, max);
  _$jscoverage['/gregorian.js'].lineData[1004]++;
  self.set(field, value);
  _$jscoverage['/gregorian.js'].lineData[1007]++;
  switch (field) {
    case MONTH:
      _$jscoverage['/gregorian.js'].lineData[1009]++;
      adjustDayOfMonth(self);
      _$jscoverage['/gregorian.js'].lineData[1010]++;
      break;
    default:
      _$jscoverage['/gregorian.js'].lineData[1013]++;
      self.updateFieldsBySet(field);
      _$jscoverage['/gregorian.js'].lineData[1014]++;
      break;
  }
}, 
  updateFieldsBySet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[18]++;
  _$jscoverage['/gregorian.js'].lineData[1099]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1100]++;
  switch (field) {
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[1102]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1103]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1105]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1106]++;
      break;
    case DAY_OF_WEEK:
      _$jscoverage['/gregorian.js'].lineData[1108]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1109]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1111]++;
      fields[DAY_OF_YEAR] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1112]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1113]++;
      break;
  }
}, 
  getTimezoneOffset: function() {
  _$jscoverage['/gregorian.js'].functionData[19]++;
  _$jscoverage['/gregorian.js'].lineData[1122]++;
  return this.timezoneOffset;
}, 
  'setTimezoneOffset': function(timezoneOffset) {
  _$jscoverage['/gregorian.js'].functionData[20]++;
  _$jscoverage['/gregorian.js'].lineData[1129]++;
  if (visit61_1129_1(this.timezoneOffset != timezoneOffset)) {
    _$jscoverage['/gregorian.js'].lineData[1130]++;
    this.fieldsComputed = undefined;
    _$jscoverage['/gregorian.js'].lineData[1131]++;
    this.timezoneOffset = timezoneOffset;
  }
}, 
  'setFirstDayOfWeek': function(firstDayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[21]++;
  _$jscoverage['/gregorian.js'].lineData[1139]++;
  if (visit62_1139_1(this.firstDayOfWeek != firstDayOfWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1140]++;
    this.firstDayOfWeek = firstDayOfWeek;
    _$jscoverage['/gregorian.js'].lineData[1141]++;
    this.fieldsComputed = false;
  }
}, 
  'getFirstDayOfWeek': function() {
  _$jscoverage['/gregorian.js'].functionData[22]++;
  _$jscoverage['/gregorian.js'].lineData[1150]++;
  return this.firstDayOfWeek;
}, 
  'setMinimalDaysInFirstWeek': function(minimalDaysInFirstWeek) {
  _$jscoverage['/gregorian.js'].functionData[23]++;
  _$jscoverage['/gregorian.js'].lineData[1161]++;
  if (visit63_1161_1(this.minimalDaysInFirstWeek != minimalDaysInFirstWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1162]++;
    this.minimalDaysInFirstWeek = minimalDaysInFirstWeek;
    _$jscoverage['/gregorian.js'].lineData[1163]++;
    this.fieldsComputed = false;
  }
}, 
  'getMinimalDaysInFirstWeek': function() {
  _$jscoverage['/gregorian.js'].functionData[24]++;
  _$jscoverage['/gregorian.js'].lineData[1175]++;
  return this.minimalDaysInFirstWeek;
}, 
  'getWeeksInWeekYear': function() {
  _$jscoverage['/gregorian.js'].functionData[25]++;
  _$jscoverage['/gregorian.js'].lineData[1192]++;
  var weekYear = this.getWeekYear();
  _$jscoverage['/gregorian.js'].lineData[1193]++;
  if (visit64_1193_1(weekYear == this.get(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[1194]++;
    return this.getActualMaximum(WEEK_OF_YEAR);
  }
  _$jscoverage['/gregorian.js'].lineData[1197]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1198]++;
  gc.setWeekDate(weekYear, 2, this.get(DAY_OF_WEEK));
  _$jscoverage['/gregorian.js'].lineData[1199]++;
  return gc.getActualMaximum(WEEK_OF_YEAR);
}, 
  getWeekYear: function() {
  _$jscoverage['/gregorian.js'].functionData[26]++;
  _$jscoverage['/gregorian.js'].lineData[1211]++;
  var year = this.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1212]++;
  var weekOfYear = this.get(WEEK_OF_YEAR);
  _$jscoverage['/gregorian.js'].lineData[1213]++;
  var month = this.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1214]++;
  if (visit65_1214_1(month == GregorianCalendar.JANUARY)) {
    _$jscoverage['/gregorian.js'].lineData[1215]++;
    if (visit66_1215_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[1216]++;
      --year;
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[1218]++;
    if (visit67_1218_1(month == GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[1219]++;
      if (visit68_1219_1(weekOfYear == 1)) {
        _$jscoverage['/gregorian.js'].lineData[1220]++;
        ++year;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1223]++;
  return year;
}, 
  'setWeekDate': function(weekYear, weekOfYear, dayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[27]++;
  _$jscoverage['/gregorian.js'].lineData[1235]++;
  if (visit69_1235_1(visit70_1235_2(dayOfWeek < GregorianCalendar.SUNDAY) || visit71_1235_3(dayOfWeek > GregorianCalendar.SATURDAY))) {
    _$jscoverage['/gregorian.js'].lineData[1236]++;
    throw new Error("invalid dayOfWeek: " + dayOfWeek);
  }
  _$jscoverage['/gregorian.js'].lineData[1238]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1241]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1242]++;
  gc.clear();
  _$jscoverage['/gregorian.js'].lineData[1243]++;
  gc.setTimezoneOffset(0);
  _$jscoverage['/gregorian.js'].lineData[1244]++;
  gc.set(YEAR, weekYear);
  _$jscoverage['/gregorian.js'].lineData[1245]++;
  gc.set(WEEK_OF_YEAR, 1);
  _$jscoverage['/gregorian.js'].lineData[1246]++;
  gc.set(DAY_OF_WEEK, this.getFirstDayOfWeek());
  _$jscoverage['/gregorian.js'].lineData[1247]++;
  var days = dayOfWeek - this.getFirstDayOfWeek();
  _$jscoverage['/gregorian.js'].lineData[1248]++;
  if (visit72_1248_1(days < 0)) {
    _$jscoverage['/gregorian.js'].lineData[1249]++;
    days += 7;
  }
  _$jscoverage['/gregorian.js'].lineData[1251]++;
  days += 7 * (weekOfYear - 1);
  _$jscoverage['/gregorian.js'].lineData[1252]++;
  if (visit73_1252_1(days != 0)) {
    _$jscoverage['/gregorian.js'].lineData[1253]++;
    gc.add(DAY_OF_YEAR, days);
  } else {
    _$jscoverage['/gregorian.js'].lineData[1255]++;
    gc.complete();
  }
  _$jscoverage['/gregorian.js'].lineData[1257]++;
  fields[YEAR] = gc.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1258]++;
  fields[MONTH] = gc.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1259]++;
  fields[DAY_OF_MONTH] = gc.get(DAY_OF_MONTH);
  _$jscoverage['/gregorian.js'].lineData[1260]++;
  this.complete();
}, 
  clone: function() {
  _$jscoverage['/gregorian.js'].functionData[28]++;
  _$jscoverage['/gregorian.js'].lineData[1267]++;
  if (visit74_1267_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1268]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[1270]++;
  var cal = new GregorianCalendar(this.timezoneOffset, this.locale);
  _$jscoverage['/gregorian.js'].lineData[1271]++;
  cal.setTime(this.time);
  _$jscoverage['/gregorian.js'].lineData[1272]++;
  return cal;
}, 
  equals: function(obj) {
  _$jscoverage['/gregorian.js'].functionData[29]++;
  _$jscoverage['/gregorian.js'].lineData[1284]++;
  return visit75_1284_1(visit76_1284_2(this.getTime() == obj.getTime()) && visit77_1285_1(visit78_1285_2(this.firstDayOfWeek == obj.firstDayOfWeek) && visit79_1286_1(visit80_1286_2(this.timezoneOffset == obj.timezoneOffset) && visit81_1287_1(this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek))));
}, 
  clear: function(field) {
  _$jscoverage['/gregorian.js'].functionData[30]++;
  _$jscoverage['/gregorian.js'].lineData[1298]++;
  if (visit82_1298_1(field === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1299]++;
    this.field = [];
  } else {
    _$jscoverage['/gregorian.js'].lineData[1301]++;
    this.fields[field] = undefined;
  }
  _$jscoverage['/gregorian.js'].lineData[1303]++;
  this.time = undefined;
  _$jscoverage['/gregorian.js'].lineData[1304]++;
  this.fieldsComputed = false;
}};
  _$jscoverage['/gregorian.js'].lineData[1308]++;
  var GregorianCalendarProto = GregorianCalendar.prototype;
  _$jscoverage['/gregorian.js'].lineData[1310]++;
  if (visit83_1310_1('@DEBUG@')) {
    _$jscoverage['/gregorian.js'].lineData[1312]++;
    GregorianCalendarProto.getDayOfMonth = GregorianCalendarProto.getHourOfDay = GregorianCalendarProto.getWeekOfYear = GregorianCalendarProto.getWeekOfMonth = GregorianCalendarProto.getDayOfYear = GregorianCalendarProto.getDayOfWeek = GregorianCalendarProto.getDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1320]++;
    GregorianCalendarProto.addDayOfMonth = GregorianCalendarProto.addMonth = GregorianCalendarProto.addYear = GregorianCalendarProto.addMinutes = GregorianCalendarProto.addSeconds = GregorianCalendarProto.addMilliSeconds = GregorianCalendarProto.addHourOfDay = GregorianCalendarProto.addWeekOfYear = GregorianCalendarProto.addWeekOfMonth = GregorianCalendarProto.addDayOfYear = GregorianCalendarProto.addDayOfWeek = GregorianCalendarProto.addDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1333]++;
    GregorianCalendarProto.isSetDayOfMonth = GregorianCalendarProto.isSetMonth = GregorianCalendarProto.isSetYear = GregorianCalendarProto.isSetMinutes = GregorianCalendarProto.isSetSeconds = GregorianCalendarProto.isSetMilliSeconds = GregorianCalendarProto.isSetHourOfDay = GregorianCalendarProto.isSetWeekOfYear = GregorianCalendarProto.isSetWeekOfMonth = GregorianCalendarProto.isSetDayOfYear = GregorianCalendarProto.isSetDayOfWeek = GregorianCalendarProto.isSetDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1345]++;
    GregorianCalendarProto.setDayOfMonth = GregorianCalendarProto.setHourOfDay = GregorianCalendarProto.setWeekOfYear = GregorianCalendarProto.setWeekOfMonth = GregorianCalendarProto.setDayOfYear = GregorianCalendarProto.setDayOfWeek = GregorianCalendarProto.setDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1353]++;
    GregorianCalendarProto.rollDayOfMonth = GregorianCalendarProto.rollMonth = GregorianCalendarProto.rollYear = GregorianCalendarProto.rollMinutes = GregorianCalendarProto.rollSeconds = GregorianCalendarProto.rollMilliSeconds = GregorianCalendarProto.rollHourOfDay = GregorianCalendarProto.rollWeekOfYear = GregorianCalendarProto.rollWeekOfMonth = GregorianCalendarProto.rollDayOfYear = GregorianCalendarProto.rollDayOfWeek = GregorianCalendarProto.rollDayOfWeekInMonth = S.noop;
  }
  _$jscoverage['/gregorian.js'].lineData[1366]++;
  S.each(fields, function(f, index) {
  _$jscoverage['/gregorian.js'].functionData[31]++;
  _$jscoverage['/gregorian.js'].lineData[1367]++;
  if (visit84_1367_1(f)) {
    _$jscoverage['/gregorian.js'].lineData[1368]++;
    GregorianCalendarProto['get' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[32]++;
  _$jscoverage['/gregorian.js'].lineData[1369]++;
  return this.get(index);
};
    _$jscoverage['/gregorian.js'].lineData[1372]++;
    GregorianCalendarProto['isSet' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[33]++;
  _$jscoverage['/gregorian.js'].lineData[1373]++;
  return this.isSet(index);
};
    _$jscoverage['/gregorian.js'].lineData[1376]++;
    GregorianCalendarProto['set' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[34]++;
  _$jscoverage['/gregorian.js'].lineData[1377]++;
  return this.set(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1380]++;
    GregorianCalendarProto['add' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[35]++;
  _$jscoverage['/gregorian.js'].lineData[1381]++;
  return this.add(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1384]++;
    GregorianCalendarProto['roll' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[36]++;
  _$jscoverage['/gregorian.js'].lineData[1385]++;
  return this.roll(index, v);
};
  }
});
  _$jscoverage['/gregorian.js'].lineData[1393]++;
  function adjustDayOfMonth(self) {
    _$jscoverage['/gregorian.js'].functionData[37]++;
    _$jscoverage['/gregorian.js'].lineData[1394]++;
    var fields = self.fields;
    _$jscoverage['/gregorian.js'].lineData[1395]++;
    var year = fields[YEAR];
    _$jscoverage['/gregorian.js'].lineData[1396]++;
    var month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[1397]++;
    var monthLen = getMonthLength(year, month);
    _$jscoverage['/gregorian.js'].lineData[1398]++;
    var dayOfMonth = fields[DAY_OF_MONTH];
    _$jscoverage['/gregorian.js'].lineData[1399]++;
    if (visit85_1399_1(dayOfMonth > monthLen)) {
      _$jscoverage['/gregorian.js'].lineData[1400]++;
      self.set(DAY_OF_MONTH, monthLen);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1404]++;
  function getMonthLength(year, month) {
    _$jscoverage['/gregorian.js'].functionData[38]++;
    _$jscoverage['/gregorian.js'].lineData[1405]++;
    return isLeapYear(year) ? LEAP_MONTH_LENGTH[month] : MONTH_LENGTH[month];
  }
  _$jscoverage['/gregorian.js'].lineData[1408]++;
  function getYearLength(year) {
    _$jscoverage['/gregorian.js'].functionData[39]++;
    _$jscoverage['/gregorian.js'].lineData[1409]++;
    return isLeapYear(year) ? 366 : 365;
  }
  _$jscoverage['/gregorian.js'].lineData[1412]++;
  function getWeekNumber(self, fixedDay1, fixedDate) {
    _$jscoverage['/gregorian.js'].functionData[40]++;
    _$jscoverage['/gregorian.js'].lineData[1413]++;
    var fixedDay1st = getDayOfWeekDateOnOrBefore(fixedDay1 + 6, self.firstDayOfWeek);
    _$jscoverage['/gregorian.js'].lineData[1414]++;
    var nDays = (fixedDay1st - fixedDay1);
    _$jscoverage['/gregorian.js'].lineData[1415]++;
    if (visit86_1415_1(nDays >= self.minimalDaysInFirstWeek)) {
      _$jscoverage['/gregorian.js'].lineData[1416]++;
      fixedDay1st -= 7;
    }
    _$jscoverage['/gregorian.js'].lineData[1418]++;
    var normalizedDayOfPeriod = (fixedDate - fixedDay1st);
    _$jscoverage['/gregorian.js'].lineData[1419]++;
    return floorDivide(normalizedDayOfPeriod / 7) + 1;
  }
  _$jscoverage['/gregorian.js'].lineData[1422]++;
  function getDayOfWeekDateOnOrBefore(fixedDate, dayOfWeek) {
    _$jscoverage['/gregorian.js'].functionData[41]++;
    _$jscoverage['/gregorian.js'].lineData[1425]++;
    return fixedDate - mod(fixedDate - dayOfWeek, 7);
  }
  _$jscoverage['/gregorian.js'].lineData[1430]++;
  return GregorianCalendar;
});
