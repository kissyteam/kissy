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
  _$jscoverage['/gregorian.js'].lineData[43] = 0;
  _$jscoverage['/gregorian.js'].lineData[45] = 0;
  _$jscoverage['/gregorian.js'].lineData[47] = 0;
  _$jscoverage['/gregorian.js'].lineData[48] = 0;
  _$jscoverage['/gregorian.js'].lineData[49] = 0;
  _$jscoverage['/gregorian.js'].lineData[50] = 0;
  _$jscoverage['/gregorian.js'].lineData[51] = 0;
  _$jscoverage['/gregorian.js'].lineData[54] = 0;
  _$jscoverage['/gregorian.js'].lineData[56] = 0;
  _$jscoverage['/gregorian.js'].lineData[58] = 0;
  _$jscoverage['/gregorian.js'].lineData[65] = 0;
  _$jscoverage['/gregorian.js'].lineData[71] = 0;
  _$jscoverage['/gregorian.js'].lineData[77] = 0;
  _$jscoverage['/gregorian.js'].lineData[85] = 0;
  _$jscoverage['/gregorian.js'].lineData[87] = 0;
  _$jscoverage['/gregorian.js'].lineData[89] = 0;
  _$jscoverage['/gregorian.js'].lineData[90] = 0;
  _$jscoverage['/gregorian.js'].lineData[94] = 0;
  _$jscoverage['/gregorian.js'].lineData[96] = 0;
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
  _$jscoverage['/gregorian.js'].lineData[222] = 0;
  _$jscoverage['/gregorian.js'].lineData[240] = 0;
  _$jscoverage['/gregorian.js'].lineData[256] = 0;
  _$jscoverage['/gregorian.js'].lineData[268] = 0;
  _$jscoverage['/gregorian.js'].lineData[276] = 0;
  _$jscoverage['/gregorian.js'].lineData[290] = 0;
  _$jscoverage['/gregorian.js'].lineData[291] = 0;
  _$jscoverage['/gregorian.js'].lineData[294] = 0;
  _$jscoverage['/gregorian.js'].lineData[295] = 0;
  _$jscoverage['/gregorian.js'].lineData[296] = 0;
  _$jscoverage['/gregorian.js'].lineData[297] = 0;
  _$jscoverage['/gregorian.js'].lineData[300] = 0;
  _$jscoverage['/gregorian.js'].lineData[313] = 0;
  _$jscoverage['/gregorian.js'].lineData[314] = 0;
  _$jscoverage['/gregorian.js'].lineData[316] = 0;
  _$jscoverage['/gregorian.js'].lineData[318] = 0;
  _$jscoverage['/gregorian.js'].lineData[320] = 0;
  _$jscoverage['/gregorian.js'].lineData[321] = 0;
  _$jscoverage['/gregorian.js'].lineData[324] = 0;
  _$jscoverage['/gregorian.js'].lineData[325] = 0;
  _$jscoverage['/gregorian.js'].lineData[326] = 0;
  _$jscoverage['/gregorian.js'].lineData[327] = 0;
  _$jscoverage['/gregorian.js'].lineData[329] = 0;
  _$jscoverage['/gregorian.js'].lineData[332] = 0;
  _$jscoverage['/gregorian.js'].lineData[333] = 0;
  _$jscoverage['/gregorian.js'].lineData[334] = 0;
  _$jscoverage['/gregorian.js'].lineData[337] = 0;
  _$jscoverage['/gregorian.js'].lineData[338] = 0;
  _$jscoverage['/gregorian.js'].lineData[341] = 0;
  _$jscoverage['/gregorian.js'].lineData[342] = 0;
  _$jscoverage['/gregorian.js'].lineData[344] = 0;
  _$jscoverage['/gregorian.js'].lineData[345] = 0;
  _$jscoverage['/gregorian.js'].lineData[347] = 0;
  _$jscoverage['/gregorian.js'].lineData[358] = 0;
  _$jscoverage['/gregorian.js'].lineData[367] = 0;
  _$jscoverage['/gregorian.js'].lineData[368] = 0;
  _$jscoverage['/gregorian.js'].lineData[369] = 0;
  _$jscoverage['/gregorian.js'].lineData[370] = 0;
  _$jscoverage['/gregorian.js'].lineData[371] = 0;
  _$jscoverage['/gregorian.js'].lineData[372] = 0;
  _$jscoverage['/gregorian.js'].lineData[373] = 0;
  _$jscoverage['/gregorian.js'].lineData[374] = 0;
  _$jscoverage['/gregorian.js'].lineData[375] = 0;
  _$jscoverage['/gregorian.js'].lineData[377] = 0;
  _$jscoverage['/gregorian.js'].lineData[378] = 0;
  _$jscoverage['/gregorian.js'].lineData[379] = 0;
  _$jscoverage['/gregorian.js'].lineData[383] = 0;
  _$jscoverage['/gregorian.js'].lineData[385] = 0;
  _$jscoverage['/gregorian.js'].lineData[387] = 0;
  _$jscoverage['/gregorian.js'].lineData[389] = 0;
  _$jscoverage['/gregorian.js'].lineData[390] = 0;
  _$jscoverage['/gregorian.js'].lineData[391] = 0;
  _$jscoverage['/gregorian.js'].lineData[392] = 0;
  _$jscoverage['/gregorian.js'].lineData[393] = 0;
  _$jscoverage['/gregorian.js'].lineData[395] = 0;
  _$jscoverage['/gregorian.js'].lineData[396] = 0;
  _$jscoverage['/gregorian.js'].lineData[397] = 0;
  _$jscoverage['/gregorian.js'].lineData[398] = 0;
  _$jscoverage['/gregorian.js'].lineData[399] = 0;
  _$jscoverage['/gregorian.js'].lineData[400] = 0;
  _$jscoverage['/gregorian.js'].lineData[401] = 0;
  _$jscoverage['/gregorian.js'].lineData[403] = 0;
  _$jscoverage['/gregorian.js'].lineData[409] = 0;
  _$jscoverage['/gregorian.js'].lineData[410] = 0;
  _$jscoverage['/gregorian.js'].lineData[411] = 0;
  _$jscoverage['/gregorian.js'].lineData[413] = 0;
  _$jscoverage['/gregorian.js'].lineData[414] = 0;
  _$jscoverage['/gregorian.js'].lineData[416] = 0;
  _$jscoverage['/gregorian.js'].lineData[419] = 0;
  _$jscoverage['/gregorian.js'].lineData[423] = 0;
  _$jscoverage['/gregorian.js'].lineData[424] = 0;
  _$jscoverage['/gregorian.js'].lineData[425] = 0;
  _$jscoverage['/gregorian.js'].lineData[428] = 0;
  _$jscoverage['/gregorian.js'].lineData[429] = 0;
  _$jscoverage['/gregorian.js'].lineData[430] = 0;
  _$jscoverage['/gregorian.js'].lineData[431] = 0;
  _$jscoverage['/gregorian.js'].lineData[433] = 0;
  _$jscoverage['/gregorian.js'].lineData[437] = 0;
  _$jscoverage['/gregorian.js'].lineData[441] = 0;
  _$jscoverage['/gregorian.js'].lineData[442] = 0;
  _$jscoverage['/gregorian.js'].lineData[444] = 0;
  _$jscoverage['/gregorian.js'].lineData[453] = 0;
  _$jscoverage['/gregorian.js'].lineData[454] = 0;
  _$jscoverage['/gregorian.js'].lineData[457] = 0;
  _$jscoverage['/gregorian.js'].lineData[459] = 0;
  _$jscoverage['/gregorian.js'].lineData[460] = 0;
  _$jscoverage['/gregorian.js'].lineData[461] = 0;
  _$jscoverage['/gregorian.js'].lineData[462] = 0;
  _$jscoverage['/gregorian.js'].lineData[464] = 0;
  _$jscoverage['/gregorian.js'].lineData[465] = 0;
  _$jscoverage['/gregorian.js'].lineData[466] = 0;
  _$jscoverage['/gregorian.js'].lineData[467] = 0;
  _$jscoverage['/gregorian.js'].lineData[468] = 0;
  _$jscoverage['/gregorian.js'].lineData[469] = 0;
  _$jscoverage['/gregorian.js'].lineData[471] = 0;
  _$jscoverage['/gregorian.js'].lineData[473] = 0;
  _$jscoverage['/gregorian.js'].lineData[475] = 0;
  _$jscoverage['/gregorian.js'].lineData[478] = 0;
  _$jscoverage['/gregorian.js'].lineData[480] = 0;
  _$jscoverage['/gregorian.js'].lineData[482] = 0;
  _$jscoverage['/gregorian.js'].lineData[484] = 0;
  _$jscoverage['/gregorian.js'].lineData[495] = 0;
  _$jscoverage['/gregorian.js'].lineData[496] = 0;
  _$jscoverage['/gregorian.js'].lineData[498] = 0;
  _$jscoverage['/gregorian.js'].lineData[499] = 0;
  _$jscoverage['/gregorian.js'].lineData[505] = 0;
  _$jscoverage['/gregorian.js'].lineData[507] = 0;
  _$jscoverage['/gregorian.js'].lineData[509] = 0;
  _$jscoverage['/gregorian.js'].lineData[511] = 0;
  _$jscoverage['/gregorian.js'].lineData[513] = 0;
  _$jscoverage['/gregorian.js'].lineData[515] = 0;
  _$jscoverage['/gregorian.js'].lineData[516] = 0;
  _$jscoverage['/gregorian.js'].lineData[517] = 0;
  _$jscoverage['/gregorian.js'].lineData[518] = 0;
  _$jscoverage['/gregorian.js'].lineData[519] = 0;
  _$jscoverage['/gregorian.js'].lineData[520] = 0;
  _$jscoverage['/gregorian.js'].lineData[521] = 0;
  _$jscoverage['/gregorian.js'].lineData[522] = 0;
  _$jscoverage['/gregorian.js'].lineData[528] = 0;
  _$jscoverage['/gregorian.js'].lineData[529] = 0;
  _$jscoverage['/gregorian.js'].lineData[530] = 0;
  _$jscoverage['/gregorian.js'].lineData[532] = 0;
  _$jscoverage['/gregorian.js'].lineData[533] = 0;
  _$jscoverage['/gregorian.js'].lineData[536] = 0;
  _$jscoverage['/gregorian.js'].lineData[537] = 0;
  _$jscoverage['/gregorian.js'].lineData[538] = 0;
  _$jscoverage['/gregorian.js'].lineData[540] = 0;
  _$jscoverage['/gregorian.js'].lineData[541] = 0;
  _$jscoverage['/gregorian.js'].lineData[545] = 0;
  _$jscoverage['/gregorian.js'].lineData[546] = 0;
  _$jscoverage['/gregorian.js'].lineData[549] = 0;
  _$jscoverage['/gregorian.js'].lineData[550] = 0;
  _$jscoverage['/gregorian.js'].lineData[553] = 0;
  _$jscoverage['/gregorian.js'].lineData[555] = 0;
  _$jscoverage['/gregorian.js'].lineData[556] = 0;
  _$jscoverage['/gregorian.js'].lineData[557] = 0;
  _$jscoverage['/gregorian.js'].lineData[559] = 0;
  _$jscoverage['/gregorian.js'].lineData[561] = 0;
  _$jscoverage['/gregorian.js'].lineData[562] = 0;
  _$jscoverage['/gregorian.js'].lineData[563] = 0;
  _$jscoverage['/gregorian.js'].lineData[565] = 0;
  _$jscoverage['/gregorian.js'].lineData[570] = 0;
  _$jscoverage['/gregorian.js'].lineData[571] = 0;
  _$jscoverage['/gregorian.js'].lineData[573] = 0;
  _$jscoverage['/gregorian.js'].lineData[576] = 0;
  _$jscoverage['/gregorian.js'].lineData[577] = 0;
  _$jscoverage['/gregorian.js'].lineData[579] = 0;
  _$jscoverage['/gregorian.js'].lineData[580] = 0;
  _$jscoverage['/gregorian.js'].lineData[582] = 0;
  _$jscoverage['/gregorian.js'].lineData[586] = 0;
  _$jscoverage['/gregorian.js'].lineData[595] = 0;
  _$jscoverage['/gregorian.js'].lineData[596] = 0;
  _$jscoverage['/gregorian.js'].lineData[598] = 0;
  _$jscoverage['/gregorian.js'].lineData[606] = 0;
  _$jscoverage['/gregorian.js'].lineData[607] = 0;
  _$jscoverage['/gregorian.js'].lineData[608] = 0;
  _$jscoverage['/gregorian.js'].lineData[617] = 0;
  _$jscoverage['/gregorian.js'].lineData[618] = 0;
  _$jscoverage['/gregorian.js'].lineData[699] = 0;
  _$jscoverage['/gregorian.js'].lineData[700] = 0;
  _$jscoverage['/gregorian.js'].lineData[701] = 0;
  _$jscoverage['/gregorian.js'].lineData[702] = 0;
  _$jscoverage['/gregorian.js'].lineData[703] = 0;
  _$jscoverage['/gregorian.js'].lineData[704] = 0;
  _$jscoverage['/gregorian.js'].lineData[707] = 0;
  _$jscoverage['/gregorian.js'].lineData[709] = 0;
  _$jscoverage['/gregorian.js'].lineData[808] = 0;
  _$jscoverage['/gregorian.js'].lineData[809] = 0;
  _$jscoverage['/gregorian.js'].lineData[811] = 0;
  _$jscoverage['/gregorian.js'].lineData[812] = 0;
  _$jscoverage['/gregorian.js'].lineData[814] = 0;
  _$jscoverage['/gregorian.js'].lineData[815] = 0;
  _$jscoverage['/gregorian.js'].lineData[816] = 0;
  _$jscoverage['/gregorian.js'].lineData[817] = 0;
  _$jscoverage['/gregorian.js'].lineData[818] = 0;
  _$jscoverage['/gregorian.js'].lineData[819] = 0;
  _$jscoverage['/gregorian.js'].lineData[820] = 0;
  _$jscoverage['/gregorian.js'].lineData[821] = 0;
  _$jscoverage['/gregorian.js'].lineData[822] = 0;
  _$jscoverage['/gregorian.js'].lineData[823] = 0;
  _$jscoverage['/gregorian.js'].lineData[824] = 0;
  _$jscoverage['/gregorian.js'].lineData[826] = 0;
  _$jscoverage['/gregorian.js'].lineData[827] = 0;
  _$jscoverage['/gregorian.js'].lineData[829] = 0;
  _$jscoverage['/gregorian.js'].lineData[831] = 0;
  _$jscoverage['/gregorian.js'].lineData[832] = 0;
  _$jscoverage['/gregorian.js'].lineData[834] = 0;
  _$jscoverage['/gregorian.js'].lineData[835] = 0;
  _$jscoverage['/gregorian.js'].lineData[837] = 0;
  _$jscoverage['/gregorian.js'].lineData[838] = 0;
  _$jscoverage['/gregorian.js'].lineData[840] = 0;
  _$jscoverage['/gregorian.js'].lineData[844] = 0;
  _$jscoverage['/gregorian.js'].lineData[845] = 0;
  _$jscoverage['/gregorian.js'].lineData[849] = 0;
  _$jscoverage['/gregorian.js'].lineData[850] = 0;
  _$jscoverage['/gregorian.js'].lineData[852] = 0;
  _$jscoverage['/gregorian.js'].lineData[854] = 0;
  _$jscoverage['/gregorian.js'].lineData[936] = 0;
  _$jscoverage['/gregorian.js'].lineData[937] = 0;
  _$jscoverage['/gregorian.js'].lineData[938] = 0;
  _$jscoverage['/gregorian.js'].lineData[939] = 0;
  _$jscoverage['/gregorian.js'].lineData[964] = 0;
  _$jscoverage['/gregorian.js'].lineData[965] = 0;
  _$jscoverage['/gregorian.js'].lineData[967] = 0;
  _$jscoverage['/gregorian.js'].lineData[969] = 0;
  _$jscoverage['/gregorian.js'].lineData[970] = 0;
  _$jscoverage['/gregorian.js'].lineData[971] = 0;
  _$jscoverage['/gregorian.js'].lineData[972] = 0;
  _$jscoverage['/gregorian.js'].lineData[974] = 0;
  _$jscoverage['/gregorian.js'].lineData[977] = 0;
  _$jscoverage['/gregorian.js'].lineData[979] = 0;
  _$jscoverage['/gregorian.js'].lineData[980] = 0;
  _$jscoverage['/gregorian.js'].lineData[983] = 0;
  _$jscoverage['/gregorian.js'].lineData[984] = 0;
  _$jscoverage['/gregorian.js'].lineData[1060] = 0;
  _$jscoverage['/gregorian.js'].lineData[1061] = 0;
  _$jscoverage['/gregorian.js'].lineData[1063] = 0;
  _$jscoverage['/gregorian.js'].lineData[1064] = 0;
  _$jscoverage['/gregorian.js'].lineData[1066] = 0;
  _$jscoverage['/gregorian.js'].lineData[1067] = 0;
  _$jscoverage['/gregorian.js'].lineData[1069] = 0;
  _$jscoverage['/gregorian.js'].lineData[1070] = 0;
  _$jscoverage['/gregorian.js'].lineData[1072] = 0;
  _$jscoverage['/gregorian.js'].lineData[1073] = 0;
  _$jscoverage['/gregorian.js'].lineData[1074] = 0;
  _$jscoverage['/gregorian.js'].lineData[1083] = 0;
  _$jscoverage['/gregorian.js'].lineData[1090] = 0;
  _$jscoverage['/gregorian.js'].lineData[1091] = 0;
  _$jscoverage['/gregorian.js'].lineData[1092] = 0;
  _$jscoverage['/gregorian.js'].lineData[1100] = 0;
  _$jscoverage['/gregorian.js'].lineData[1101] = 0;
  _$jscoverage['/gregorian.js'].lineData[1102] = 0;
  _$jscoverage['/gregorian.js'].lineData[1111] = 0;
  _$jscoverage['/gregorian.js'].lineData[1122] = 0;
  _$jscoverage['/gregorian.js'].lineData[1123] = 0;
  _$jscoverage['/gregorian.js'].lineData[1124] = 0;
  _$jscoverage['/gregorian.js'].lineData[1136] = 0;
  _$jscoverage['/gregorian.js'].lineData[1153] = 0;
  _$jscoverage['/gregorian.js'].lineData[1154] = 0;
  _$jscoverage['/gregorian.js'].lineData[1155] = 0;
  _$jscoverage['/gregorian.js'].lineData[1158] = 0;
  _$jscoverage['/gregorian.js'].lineData[1159] = 0;
  _$jscoverage['/gregorian.js'].lineData[1160] = 0;
  _$jscoverage['/gregorian.js'].lineData[1172] = 0;
  _$jscoverage['/gregorian.js'].lineData[1173] = 0;
  _$jscoverage['/gregorian.js'].lineData[1174] = 0;
  _$jscoverage['/gregorian.js'].lineData[1175] = 0;
  _$jscoverage['/gregorian.js'].lineData[1176] = 0;
  _$jscoverage['/gregorian.js'].lineData[1177] = 0;
  _$jscoverage['/gregorian.js'].lineData[1179] = 0;
  _$jscoverage['/gregorian.js'].lineData[1180] = 0;
  _$jscoverage['/gregorian.js'].lineData[1181] = 0;
  _$jscoverage['/gregorian.js'].lineData[1184] = 0;
  _$jscoverage['/gregorian.js'].lineData[1196] = 0;
  _$jscoverage['/gregorian.js'].lineData[1197] = 0;
  _$jscoverage['/gregorian.js'].lineData[1199] = 0;
  _$jscoverage['/gregorian.js'].lineData[1202] = 0;
  _$jscoverage['/gregorian.js'].lineData[1203] = 0;
  _$jscoverage['/gregorian.js'].lineData[1204] = 0;
  _$jscoverage['/gregorian.js'].lineData[1205] = 0;
  _$jscoverage['/gregorian.js'].lineData[1206] = 0;
  _$jscoverage['/gregorian.js'].lineData[1207] = 0;
  _$jscoverage['/gregorian.js'].lineData[1208] = 0;
  _$jscoverage['/gregorian.js'].lineData[1209] = 0;
  _$jscoverage['/gregorian.js'].lineData[1210] = 0;
  _$jscoverage['/gregorian.js'].lineData[1212] = 0;
  _$jscoverage['/gregorian.js'].lineData[1213] = 0;
  _$jscoverage['/gregorian.js'].lineData[1214] = 0;
  _$jscoverage['/gregorian.js'].lineData[1216] = 0;
  _$jscoverage['/gregorian.js'].lineData[1218] = 0;
  _$jscoverage['/gregorian.js'].lineData[1219] = 0;
  _$jscoverage['/gregorian.js'].lineData[1220] = 0;
  _$jscoverage['/gregorian.js'].lineData[1221] = 0;
  _$jscoverage['/gregorian.js'].lineData[1228] = 0;
  _$jscoverage['/gregorian.js'].lineData[1229] = 0;
  _$jscoverage['/gregorian.js'].lineData[1231] = 0;
  _$jscoverage['/gregorian.js'].lineData[1232] = 0;
  _$jscoverage['/gregorian.js'].lineData[1233] = 0;
  _$jscoverage['/gregorian.js'].lineData[1245] = 0;
  _$jscoverage['/gregorian.js'].lineData[1259] = 0;
  _$jscoverage['/gregorian.js'].lineData[1260] = 0;
  _$jscoverage['/gregorian.js'].lineData[1262] = 0;
  _$jscoverage['/gregorian.js'].lineData[1264] = 0;
  _$jscoverage['/gregorian.js'].lineData[1265] = 0;
  _$jscoverage['/gregorian.js'].lineData[1269] = 0;
  _$jscoverage['/gregorian.js'].lineData[1271] = 0;
  _$jscoverage['/gregorian.js'].lineData[1273] = 0;
  _$jscoverage['/gregorian.js'].lineData[1281] = 0;
  _$jscoverage['/gregorian.js'].lineData[1293] = 0;
  _$jscoverage['/gregorian.js'].lineData[1305] = 0;
  _$jscoverage['/gregorian.js'].lineData[1313] = 0;
  _$jscoverage['/gregorian.js'].lineData[1326] = 0;
  _$jscoverage['/gregorian.js'].lineData[1327] = 0;
  _$jscoverage['/gregorian.js'].lineData[1328] = 0;
  _$jscoverage['/gregorian.js'].lineData[1329] = 0;
  _$jscoverage['/gregorian.js'].lineData[1332] = 0;
  _$jscoverage['/gregorian.js'].lineData[1333] = 0;
  _$jscoverage['/gregorian.js'].lineData[1336] = 0;
  _$jscoverage['/gregorian.js'].lineData[1337] = 0;
  _$jscoverage['/gregorian.js'].lineData[1340] = 0;
  _$jscoverage['/gregorian.js'].lineData[1341] = 0;
  _$jscoverage['/gregorian.js'].lineData[1344] = 0;
  _$jscoverage['/gregorian.js'].lineData[1345] = 0;
  _$jscoverage['/gregorian.js'].lineData[1352] = 0;
  _$jscoverage['/gregorian.js'].lineData[1353] = 0;
  _$jscoverage['/gregorian.js'].lineData[1354] = 0;
  _$jscoverage['/gregorian.js'].lineData[1355] = 0;
  _$jscoverage['/gregorian.js'].lineData[1356] = 0;
  _$jscoverage['/gregorian.js'].lineData[1357] = 0;
  _$jscoverage['/gregorian.js'].lineData[1358] = 0;
  _$jscoverage['/gregorian.js'].lineData[1359] = 0;
  _$jscoverage['/gregorian.js'].lineData[1363] = 0;
  _$jscoverage['/gregorian.js'].lineData[1364] = 0;
  _$jscoverage['/gregorian.js'].lineData[1367] = 0;
  _$jscoverage['/gregorian.js'].lineData[1368] = 0;
  _$jscoverage['/gregorian.js'].lineData[1371] = 0;
  _$jscoverage['/gregorian.js'].lineData[1372] = 0;
  _$jscoverage['/gregorian.js'].lineData[1373] = 0;
  _$jscoverage['/gregorian.js'].lineData[1374] = 0;
  _$jscoverage['/gregorian.js'].lineData[1375] = 0;
  _$jscoverage['/gregorian.js'].lineData[1377] = 0;
  _$jscoverage['/gregorian.js'].lineData[1378] = 0;
  _$jscoverage['/gregorian.js'].lineData[1381] = 0;
  _$jscoverage['/gregorian.js'].lineData[1384] = 0;
  _$jscoverage['/gregorian.js'].lineData[1389] = 0;
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
  _$jscoverage['/gregorian.js'].branchData['47'] = [];
  _$jscoverage['/gregorian.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['50'] = [];
  _$jscoverage['/gregorian.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['54'] = [];
  _$jscoverage['/gregorian.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['71'] = [];
  _$jscoverage['/gregorian.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['89'] = [];
  _$jscoverage['/gregorian.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['290'] = [];
  _$jscoverage['/gregorian.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['295'] = [];
  _$jscoverage['/gregorian.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['313'] = [];
  _$jscoverage['/gregorian.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['326'] = [];
  _$jscoverage['/gregorian.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['344'] = [];
  _$jscoverage['/gregorian.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['358'] = [];
  _$jscoverage['/gregorian.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['373'] = [];
  _$jscoverage['/gregorian.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['377'] = [];
  _$jscoverage['/gregorian.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['395'] = [];
  _$jscoverage['/gregorian.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['419'] = [];
  _$jscoverage['/gregorian.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['428'] = [];
  _$jscoverage['/gregorian.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['433'] = [];
  _$jscoverage['/gregorian.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['433'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['435'] = [];
  _$jscoverage['/gregorian.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['453'] = [];
  _$jscoverage['/gregorian.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['461'] = [];
  _$jscoverage['/gregorian.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['465'] = [];
  _$jscoverage['/gregorian.js'].branchData['465'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['467'] = [];
  _$jscoverage['/gregorian.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['469'] = [];
  _$jscoverage['/gregorian.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['495'] = [];
  _$jscoverage['/gregorian.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['498'] = [];
  _$jscoverage['/gregorian.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['515'] = [];
  _$jscoverage['/gregorian.js'].branchData['515'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['517'] = [];
  _$jscoverage['/gregorian.js'].branchData['517'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['520'] = [];
  _$jscoverage['/gregorian.js'].branchData['520'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['532'] = [];
  _$jscoverage['/gregorian.js'].branchData['532'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['536'] = [];
  _$jscoverage['/gregorian.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['537'] = [];
  _$jscoverage['/gregorian.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['540'] = [];
  _$jscoverage['/gregorian.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['545'] = [];
  _$jscoverage['/gregorian.js'].branchData['545'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['549'] = [];
  _$jscoverage['/gregorian.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['556'] = [];
  _$jscoverage['/gregorian.js'].branchData['556'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['562'] = [];
  _$jscoverage['/gregorian.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['570'] = [];
  _$jscoverage['/gregorian.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['576'] = [];
  _$jscoverage['/gregorian.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['579'] = [];
  _$jscoverage['/gregorian.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['595'] = [];
  _$jscoverage['/gregorian.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['700'] = [];
  _$jscoverage['/gregorian.js'].branchData['700'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['702'] = [];
  _$jscoverage['/gregorian.js'].branchData['702'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['703'] = [];
  _$jscoverage['/gregorian.js'].branchData['703'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['808'] = [];
  _$jscoverage['/gregorian.js'].branchData['808'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['815'] = [];
  _$jscoverage['/gregorian.js'].branchData['815'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['819'] = [];
  _$jscoverage['/gregorian.js'].branchData['819'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['823'] = [];
  _$jscoverage['/gregorian.js'].branchData['823'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['964'] = [];
  _$jscoverage['/gregorian.js'].branchData['964'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1090'] = [];
  _$jscoverage['/gregorian.js'].branchData['1090'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1100'] = [];
  _$jscoverage['/gregorian.js'].branchData['1100'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1122'] = [];
  _$jscoverage['/gregorian.js'].branchData['1122'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1154'] = [];
  _$jscoverage['/gregorian.js'].branchData['1154'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1175'] = [];
  _$jscoverage['/gregorian.js'].branchData['1175'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1176'] = [];
  _$jscoverage['/gregorian.js'].branchData['1176'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1179'] = [];
  _$jscoverage['/gregorian.js'].branchData['1179'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1180'] = [];
  _$jscoverage['/gregorian.js'].branchData['1180'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1196'] = [];
  _$jscoverage['/gregorian.js'].branchData['1196'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1196'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1196'][3] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1209'] = [];
  _$jscoverage['/gregorian.js'].branchData['1209'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1213'] = [];
  _$jscoverage['/gregorian.js'].branchData['1213'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1228'] = [];
  _$jscoverage['/gregorian.js'].branchData['1228'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1245'] = [];
  _$jscoverage['/gregorian.js'].branchData['1245'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1245'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1246'] = [];
  _$jscoverage['/gregorian.js'].branchData['1246'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1246'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1247'] = [];
  _$jscoverage['/gregorian.js'].branchData['1247'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1247'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1248'] = [];
  _$jscoverage['/gregorian.js'].branchData['1248'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1259'] = [];
  _$jscoverage['/gregorian.js'].branchData['1259'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1271'] = [];
  _$jscoverage['/gregorian.js'].branchData['1271'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1327'] = [];
  _$jscoverage['/gregorian.js'].branchData['1327'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1358'] = [];
  _$jscoverage['/gregorian.js'].branchData['1358'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1374'] = [];
  _$jscoverage['/gregorian.js'].branchData['1374'][1] = new BranchData();
}
_$jscoverage['/gregorian.js'].branchData['1374'][1].init(153, 36, 'nDays >= self.minimalDaysInFirstWeek');
function visit86_1374_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1374'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1358'][1].init(220, 21, 'dayOfMonth > monthLen');
function visit85_1358_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1358'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1327'][1].init(14, 1, 'f');
function visit84_1327_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1327'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1271'][1].init(45896, 9, '\'@DEBUG@\'');
function visit83_1271_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1271'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1259'][1].init(18, 19, 'field === undefined');
function visit82_1259_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1259'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1248'][1].init(62, 58, 'this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek');
function visit81_1248_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1248'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1247'][2].init(140, 42, 'this.timezoneOffset === obj.timezoneOffset');
function visit80_1247_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1247'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1247'][1].init(62, 121, 'this.timezoneOffset === obj.timezoneOffset && this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek');
function visit79_1247_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1247'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1246'][2].init(76, 42, 'this.firstDayOfWeek === obj.firstDayOfWeek');
function visit78_1246_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1246'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1246'][1].init(52, 184, 'this.firstDayOfWeek === obj.firstDayOfWeek && this.timezoneOffset === obj.timezoneOffset && this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek');
function visit77_1246_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1246'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1245'][2].init(21, 32, 'this.getTime() === obj.getTime()');
function visit76_1245_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1245'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1245'][1].init(21, 237, 'this.getTime() === obj.getTime() && this.firstDayOfWeek === obj.firstDayOfWeek && this.timezoneOffset === obj.timezoneOffset && this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek');
function visit75_1245_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1245'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1228'][1].init(18, 23, 'this.time === undefined');
function visit74_1228_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1228'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1213'][1].init(782, 10, 'days !== 0');
function visit73_1213_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1213'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1209'][1].init(667, 8, 'days < 0');
function visit72_1209_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1209'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1196'][3].init(58, 38, 'dayOfWeek > GregorianCalendar.SATURDAY');
function visit71_1196_3(result) {
  _$jscoverage['/gregorian.js'].branchData['1196'][3].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1196'][2].init(18, 36, 'dayOfWeek < GregorianCalendar.SUNDAY');
function visit70_1196_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1196'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1196'][1].init(18, 78, 'dayOfWeek < GregorianCalendar.SUNDAY || dayOfWeek > GregorianCalendar.SATURDAY');
function visit69_1196_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1196'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1180'][1].init(22, 16, 'weekOfYear === 1');
function visit68_1180_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1180'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1179'][1].init(331, 36, 'month === GregorianCalendar.DECEMBER');
function visit67_1179_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1179'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1176'][1].init(22, 16, 'weekOfYear >= 52');
function visit66_1176_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1176'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1175'][1].init(178, 35, 'month === GregorianCalendar.JANUARY');
function visit65_1175_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1175'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1154'][1].init(66, 27, 'weekYear === this.get(YEAR)');
function visit64_1154_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1154'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1122'][1].init(18, 54, 'this.minimalDaysInFirstWeek !== minimalDaysInFirstWeek');
function visit63_1122_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1122'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1100'][1].init(18, 38, 'this.firstDayOfWeek !== firstDayOfWeek');
function visit62_1100_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1100'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1090'][1].init(18, 38, 'this.timezoneOffset !== timezoneOffset');
function visit61_1090_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1090'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['964'][1].init(18, 7, '!amount');
function visit60_964_1(result) {
  _$jscoverage['/gregorian.js'].branchData['964'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['823'][1].init(156, 10, 'yearAmount');
function visit59_823_1(result) {
  _$jscoverage['/gregorian.js'].branchData['823'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['819'][1].init(408, 15, 'field === MONTH');
function visit58_819_1(result) {
  _$jscoverage['/gregorian.js'].branchData['819'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['815'][1].init(250, 14, 'field === YEAR');
function visit57_815_1(result) {
  _$jscoverage['/gregorian.js'].branchData['815'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['808'][1].init(18, 7, '!amount');
function visit56_808_1(result) {
  _$jscoverage['/gregorian.js'].branchData['808'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['703'][1].init(34, 7, 'i < len');
function visit55_703_1(result) {
  _$jscoverage['/gregorian.js'].branchData['703'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['702'][1].init(138, 22, 'len < MILLISECONDS + 1');
function visit54_702_1(result) {
  _$jscoverage['/gregorian.js'].branchData['702'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['700'][1].init(59, 9, 'len === 2');
function visit53_700_1(result) {
  _$jscoverage['/gregorian.js'].branchData['700'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['595'][1].init(18, 23, 'this.time === undefined');
function visit52_595_1(result) {
  _$jscoverage['/gregorian.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['579'][1].init(405, 31, 'dayOfWeek !== firstDayOfWeekCfg');
function visit51_579_1(result) {
  _$jscoverage['/gregorian.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['576'][1].init(249, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
function visit50_576_1(result) {
  _$jscoverage['/gregorian.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['570'][1].init(79, 23, 'self.isSet(DAY_OF_YEAR)');
function visit49_570_1(result) {
  _$jscoverage['/gregorian.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['562'][1].init(352, 9, 'dowim < 0');
function visit48_562_1(result) {
  _$jscoverage['/gregorian.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['556'][1].init(66, 32, 'self.isSet(DAY_OF_WEEK_IN_MONTH)');
function visit47_556_1(result) {
  _$jscoverage['/gregorian.js'].branchData['556'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['549'][1].init(437, 31, 'dayOfWeek !== firstDayOfWeekCfg');
function visit46_549_1(result) {
  _$jscoverage['/gregorian.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['545'][1].init(267, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
function visit45_545_1(result) {
  _$jscoverage['/gregorian.js'].branchData['545'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['540'][1].init(26, 25, 'self.isSet(WEEK_OF_MONTH)');
function visit44_540_1(result) {
  _$jscoverage['/gregorian.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['537'][1].init(22, 24, 'self.isSet(DAY_OF_MONTH)');
function visit43_537_1(result) {
  _$jscoverage['/gregorian.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['536'][1].init(1070, 17, 'self.isSet(MONTH)');
function visit42_536_1(result) {
  _$jscoverage['/gregorian.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['532'][1].init(959, 23, 'self.isSet(DAY_OF_WEEK)');
function visit41_532_1(result) {
  _$jscoverage['/gregorian.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['520'][1].init(211, 33, 'month < GregorianCalendar.JANUARY');
function visit40_520_1(result) {
  _$jscoverage['/gregorian.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['517'][1].init(62, 34, 'month > GregorianCalendar.DECEMBER');
function visit39_517_1(result) {
  _$jscoverage['/gregorian.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['515'][1].init(247, 17, 'self.isSet(MONTH)');
function visit38_515_1(result) {
  _$jscoverage['/gregorian.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['498'][1].init(114, 20, '!this.fieldsComputed');
function visit37_498_1(result) {
  _$jscoverage['/gregorian.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['495'][1].init(18, 23, 'this.time === undefined');
function visit36_495_1(result) {
  _$jscoverage['/gregorian.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['469'][1].init(572, 25, 'fields[MILLISECONDS] || 0');
function visit35_469_1(result) {
  _$jscoverage['/gregorian.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['467'][1].init(492, 20, 'fields[SECONDS] || 0');
function visit34_467_1(result) {
  _$jscoverage['/gregorian.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['465'][1].init(415, 19, 'fields[MINUTE] || 0');
function visit33_465_1(result) {
  _$jscoverage['/gregorian.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['461'][1].init(266, 23, 'this.isSet(HOUR_OF_DAY)');
function visit32_461_1(result) {
  _$jscoverage['/gregorian.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['453'][1].init(18, 17, '!this.isSet(YEAR)');
function visit31_453_1(result) {
  _$jscoverage['/gregorian.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['435'][1].init(120, 29, 'fixedDate >= (nextJan1st - 7)');
function visit30_435_1(result) {
  _$jscoverage['/gregorian.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['433'][2].init(273, 36, 'nDays >= this.minimalDaysInFirstWeek');
function visit29_433_2(result) {
  _$jscoverage['/gregorian.js'].branchData['433'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['433'][1].init(273, 150, 'nDays >= this.minimalDaysInFirstWeek && fixedDate >= (nextJan1st - 7)');
function visit28_433_1(result) {
  _$jscoverage['/gregorian.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['428'][1].init(2485, 16, 'weekOfYear >= 52');
function visit27_428_1(result) {
  _$jscoverage['/gregorian.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['419'][1].init(2014, 16, 'weekOfYear === 0');
function visit26_419_1(result) {
  _$jscoverage['/gregorian.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['395'][1].init(988, 15, 'timeOfDay !== 0');
function visit25_395_1(result) {
  _$jscoverage['/gregorian.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['377'][1].init(25, 13, 'timeOfDay < 0');
function visit24_377_1(result) {
  _$jscoverage['/gregorian.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['373'][1].init(329, 20, 'timeOfDay >= ONE_DAY');
function visit23_373_1(result) {
  _$jscoverage['/gregorian.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['358'][1].init(21, 32, 'this.fields[field] !== undefined');
function visit22_358_1(result) {
  _$jscoverage['/gregorian.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['344'][1].init(1258, 19, 'value === undefined');
function visit21_344_1(result) {
  _$jscoverage['/gregorian.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['326'][1].init(207, 11, 'value === 1');
function visit20_326_1(result) {
  _$jscoverage['/gregorian.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['313'][1].init(18, 31, 'MAX_VALUES[field] !== undefined');
function visit19_313_1(result) {
  _$jscoverage['/gregorian.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['295'][1].init(169, 23, 'field === WEEK_OF_MONTH');
function visit18_295_1(result) {
  _$jscoverage['/gregorian.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['290'][1].init(18, 31, 'MIN_VALUES[field] !== undefined');
function visit17_290_1(result) {
  _$jscoverage['/gregorian.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['89'][1].init(1265, 21, 'arguments.length >= 3');
function visit16_89_1(result) {
  _$jscoverage['/gregorian.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['71'][1].init(731, 39, 'timezoneOffset || locale.timezoneOffset');
function visit15_71_1(result) {
  _$jscoverage['/gregorian.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['54'][1].init(310, 23, 'locale || defaultLocale');
function visit14_54_1(result) {
  _$jscoverage['/gregorian.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['50'][1].init(215, 16, 'args.length >= 3');
function visit13_50_1(result) {
  _$jscoverage['/gregorian.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['47'][1].init(65, 34, 'typeof timezoneOffset === \'object\'');
function visit12_47_1(result) {
  _$jscoverage['/gregorian.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/gregorian.js'].functionData[0]++;
  _$jscoverage['/gregorian.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/gregorian.js'].lineData[8]++;
  var toInt = parseInt;
  _$jscoverage['/gregorian.js'].lineData[9]++;
  var Utils = require('./gregorian/utils');
  _$jscoverage['/gregorian.js'].lineData[10]++;
  var defaultLocale = require('i18n!date');
  _$jscoverage['/gregorian.js'].lineData[11]++;
  var Const = require('./gregorian/const');
  _$jscoverage['/gregorian.js'].lineData[43]++;
  function GregorianCalendar(timezoneOffset, locale) {
    _$jscoverage['/gregorian.js'].functionData[1]++;
    _$jscoverage['/gregorian.js'].lineData[45]++;
    var args = util.makeArray(arguments);
    _$jscoverage['/gregorian.js'].lineData[47]++;
    if (visit12_47_1(typeof timezoneOffset === 'object')) {
      _$jscoverage['/gregorian.js'].lineData[48]++;
      locale = timezoneOffset;
      _$jscoverage['/gregorian.js'].lineData[49]++;
      timezoneOffset = locale.timezoneOffset;
    } else {
      _$jscoverage['/gregorian.js'].lineData[50]++;
      if (visit13_50_1(args.length >= 3)) {
        _$jscoverage['/gregorian.js'].lineData[51]++;
        timezoneOffset = locale = null;
      }
    }
    _$jscoverage['/gregorian.js'].lineData[54]++;
    locale = visit14_54_1(locale || defaultLocale);
    _$jscoverage['/gregorian.js'].lineData[56]++;
    this.locale = locale;
    _$jscoverage['/gregorian.js'].lineData[58]++;
    this.fields = [];
    _$jscoverage['/gregorian.js'].lineData[65]++;
    this.time = undefined;
    _$jscoverage['/gregorian.js'].lineData[71]++;
    this.timezoneOffset = visit15_71_1(timezoneOffset || locale.timezoneOffset);
    _$jscoverage['/gregorian.js'].lineData[77]++;
    this.firstDayOfWeek = locale.firstDayOfWeek;
    _$jscoverage['/gregorian.js'].lineData[85]++;
    this.minimalDaysInFirstWeek = locale.minimalDaysInFirstWeek;
    _$jscoverage['/gregorian.js'].lineData[87]++;
    this.fieldsComputed = false;
    _$jscoverage['/gregorian.js'].lineData[89]++;
    if (visit16_89_1(arguments.length >= 3)) {
      _$jscoverage['/gregorian.js'].lineData[90]++;
      this.set.apply(this, args);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[94]++;
  util.mix(GregorianCalendar, Const);
  _$jscoverage['/gregorian.js'].lineData[96]++;
  util.mix(GregorianCalendar, {
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
  _$jscoverage['/gregorian.js'].lineData[222]++;
  var MIN_VALUES = [undefined, 1, GregorianCalendar.JANUARY, 1, 0, 0, 0, 0, 1, undefined, 1, GregorianCalendar.SUNDAY, 1];
  _$jscoverage['/gregorian.js'].lineData[240]++;
  var MAX_VALUES = [undefined, 292278994, GregorianCalendar.DECEMBER, undefined, 23, 59, 59, 999, undefined, undefined, undefined, GregorianCalendar.SATURDAY, undefined];
  _$jscoverage['/gregorian.js'].lineData[256]++;
  GregorianCalendar.prototype = {
  constructor: GregorianCalendar, 
  isLeapYear: function() {
  _$jscoverage['/gregorian.js'].functionData[2]++;
  _$jscoverage['/gregorian.js'].lineData[268]++;
  return isLeapYear(this.getYear());
}, 
  getLocale: function() {
  _$jscoverage['/gregorian.js'].functionData[3]++;
  _$jscoverage['/gregorian.js'].lineData[276]++;
  return this.locale;
}, 
  getActualMinimum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[4]++;
  _$jscoverage['/gregorian.js'].lineData[290]++;
  if (visit17_290_1(MIN_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[291]++;
    return MIN_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[294]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[295]++;
  if (visit18_295_1(field === WEEK_OF_MONTH)) {
    _$jscoverage['/gregorian.js'].lineData[296]++;
    var cal = new GregorianCalendar(fields[YEAR], fields[MONTH], 1);
    _$jscoverage['/gregorian.js'].lineData[297]++;
    return cal.get(WEEK_OF_MONTH);
  }
  _$jscoverage['/gregorian.js'].lineData[300]++;
  throw new Error('minimum value not defined!');
}, 
  getActualMaximum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[5]++;
  _$jscoverage['/gregorian.js'].lineData[313]++;
  if (visit19_313_1(MAX_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[314]++;
    return MAX_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[316]++;
  var value, fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[318]++;
  switch (field) {
    case DAY_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[320]++;
      value = getMonthLength(fields[YEAR], fields[MONTH]);
      _$jscoverage['/gregorian.js'].lineData[321]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[324]++;
      var endOfYear = new GregorianCalendar(fields[YEAR], GregorianCalendar.DECEMBER, 31);
      _$jscoverage['/gregorian.js'].lineData[325]++;
      value = endOfYear.get(WEEK_OF_YEAR);
      _$jscoverage['/gregorian.js'].lineData[326]++;
      if (visit20_326_1(value === 1)) {
        _$jscoverage['/gregorian.js'].lineData[327]++;
        value = 52;
      }
      _$jscoverage['/gregorian.js'].lineData[329]++;
      break;
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[332]++;
      var endOfMonth = new GregorianCalendar(fields[YEAR], fields[MONTH], getMonthLength(fields[YEAR], fields[MONTH]));
      _$jscoverage['/gregorian.js'].lineData[333]++;
      value = endOfMonth.get(WEEK_OF_MONTH);
      _$jscoverage['/gregorian.js'].lineData[334]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[337]++;
      value = getYearLength(fields[YEAR]);
      _$jscoverage['/gregorian.js'].lineData[338]++;
      break;
    case DAY_OF_WEEK_IN_MONTH:
      _$jscoverage['/gregorian.js'].lineData[341]++;
      value = toInt((getMonthLength(fields[YEAR], fields[MONTH]) - 1) / 7) + 1;
      _$jscoverage['/gregorian.js'].lineData[342]++;
      break;
  }
  _$jscoverage['/gregorian.js'].lineData[344]++;
  if (visit21_344_1(value === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[345]++;
    throw new Error('maximum value not defined!');
  }
  _$jscoverage['/gregorian.js'].lineData[347]++;
  return value;
}, 
  isSet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[6]++;
  _$jscoverage['/gregorian.js'].lineData[358]++;
  return visit22_358_1(this.fields[field] !== undefined);
}, 
  computeFields: function() {
  _$jscoverage['/gregorian.js'].functionData[7]++;
  _$jscoverage['/gregorian.js'].lineData[367]++;
  var time = this.time;
  _$jscoverage['/gregorian.js'].lineData[368]++;
  var timezoneOffset = this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[369]++;
  var fixedDate = toInt(timezoneOffset / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[370]++;
  var timeOfDay = timezoneOffset % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[371]++;
  fixedDate += toInt(time / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[372]++;
  timeOfDay += time % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[373]++;
  if (visit23_373_1(timeOfDay >= ONE_DAY)) {
    _$jscoverage['/gregorian.js'].lineData[374]++;
    timeOfDay -= ONE_DAY;
    _$jscoverage['/gregorian.js'].lineData[375]++;
    fixedDate++;
  } else {
    _$jscoverage['/gregorian.js'].lineData[377]++;
    while (visit24_377_1(timeOfDay < 0)) {
      _$jscoverage['/gregorian.js'].lineData[378]++;
      timeOfDay += ONE_DAY;
      _$jscoverage['/gregorian.js'].lineData[379]++;
      fixedDate--;
    }
  }
  _$jscoverage['/gregorian.js'].lineData[383]++;
  fixedDate += EPOCH_OFFSET;
  _$jscoverage['/gregorian.js'].lineData[385]++;
  var date = Utils.getGregorianDateFromFixedDate(fixedDate);
  _$jscoverage['/gregorian.js'].lineData[387]++;
  var year = date.year;
  _$jscoverage['/gregorian.js'].lineData[389]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[390]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[391]++;
  fields[MONTH] = date.month;
  _$jscoverage['/gregorian.js'].lineData[392]++;
  fields[DAY_OF_MONTH] = date.dayOfMonth;
  _$jscoverage['/gregorian.js'].lineData[393]++;
  fields[DAY_OF_WEEK] = date.dayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[395]++;
  if (visit25_395_1(timeOfDay !== 0)) {
    _$jscoverage['/gregorian.js'].lineData[396]++;
    fields[HOUR_OF_DAY] = toInt(timeOfDay / ONE_HOUR);
    _$jscoverage['/gregorian.js'].lineData[397]++;
    var r = timeOfDay % ONE_HOUR;
    _$jscoverage['/gregorian.js'].lineData[398]++;
    fields[MINUTE] = toInt(r / ONE_MINUTE);
    _$jscoverage['/gregorian.js'].lineData[399]++;
    r %= ONE_MINUTE;
    _$jscoverage['/gregorian.js'].lineData[400]++;
    fields[SECONDS] = toInt(r / ONE_SECOND);
    _$jscoverage['/gregorian.js'].lineData[401]++;
    fields[MILLISECONDS] = r % ONE_SECOND;
  } else {
    _$jscoverage['/gregorian.js'].lineData[403]++;
    fields[HOUR_OF_DAY] = fields[MINUTE] = fields[SECONDS] = fields[MILLISECONDS] = 0;
  }
  _$jscoverage['/gregorian.js'].lineData[409]++;
  var fixedDateJan1 = Utils.getFixedDate(year, GregorianCalendar.JANUARY, 1);
  _$jscoverage['/gregorian.js'].lineData[410]++;
  var dayOfYear = fixedDate - fixedDateJan1 + 1;
  _$jscoverage['/gregorian.js'].lineData[411]++;
  var fixDateMonth1 = fixedDate - date.dayOfMonth + 1;
  _$jscoverage['/gregorian.js'].lineData[413]++;
  fields[DAY_OF_YEAR] = dayOfYear;
  _$jscoverage['/gregorian.js'].lineData[414]++;
  fields[DAY_OF_WEEK_IN_MONTH] = toInt((date.dayOfMonth - 1) / 7) + 1;
  _$jscoverage['/gregorian.js'].lineData[416]++;
  var weekOfYear = getWeekNumber(this, fixedDateJan1, fixedDate);
  _$jscoverage['/gregorian.js'].lineData[419]++;
  if (visit26_419_1(weekOfYear === 0)) {
    _$jscoverage['/gregorian.js'].lineData[423]++;
    var fixedDec31 = fixedDateJan1 - 1;
    _$jscoverage['/gregorian.js'].lineData[424]++;
    var prevJan1 = fixedDateJan1 - getYearLength(year - 1);
    _$jscoverage['/gregorian.js'].lineData[425]++;
    weekOfYear = getWeekNumber(this, prevJan1, fixedDec31);
  } else {
    _$jscoverage['/gregorian.js'].lineData[428]++;
    if (visit27_428_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[429]++;
      var nextJan1 = fixedDateJan1 + getYearLength(year);
      _$jscoverage['/gregorian.js'].lineData[430]++;
      var nextJan1st = getDayOfWeekDateOnOrBefore(nextJan1 + 6, this.firstDayOfWeek);
      _$jscoverage['/gregorian.js'].lineData[431]++;
      var nDays = nextJan1st - nextJan1;
      _$jscoverage['/gregorian.js'].lineData[433]++;
      if (visit28_433_1(visit29_433_2(nDays >= this.minimalDaysInFirstWeek) && visit30_435_1(fixedDate >= (nextJan1st - 7)))) {
        _$jscoverage['/gregorian.js'].lineData[437]++;
        weekOfYear = 1;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[441]++;
  fields[WEEK_OF_YEAR] = weekOfYear;
  _$jscoverage['/gregorian.js'].lineData[442]++;
  fields[WEEK_OF_MONTH] = getWeekNumber(this, fixDateMonth1, fixedDate);
  _$jscoverage['/gregorian.js'].lineData[444]++;
  this.fieldsComputed = true;
}, 
  computeTime: function() {
  _$jscoverage['/gregorian.js'].functionData[8]++;
  _$jscoverage['/gregorian.js'].lineData[453]++;
  if (visit31_453_1(!this.isSet(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[454]++;
    throw new Error('year must be set for KISSY GregorianCalendar');
  }
  _$jscoverage['/gregorian.js'].lineData[457]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[459]++;
  var year = fields[YEAR];
  _$jscoverage['/gregorian.js'].lineData[460]++;
  var timeOfDay = 0;
  _$jscoverage['/gregorian.js'].lineData[461]++;
  if (visit32_461_1(this.isSet(HOUR_OF_DAY))) {
    _$jscoverage['/gregorian.js'].lineData[462]++;
    timeOfDay += fields[HOUR_OF_DAY];
  }
  _$jscoverage['/gregorian.js'].lineData[464]++;
  timeOfDay *= 60;
  _$jscoverage['/gregorian.js'].lineData[465]++;
  timeOfDay += visit33_465_1(fields[MINUTE] || 0);
  _$jscoverage['/gregorian.js'].lineData[466]++;
  timeOfDay *= 60;
  _$jscoverage['/gregorian.js'].lineData[467]++;
  timeOfDay += visit34_467_1(fields[SECONDS] || 0);
  _$jscoverage['/gregorian.js'].lineData[468]++;
  timeOfDay *= 1000;
  _$jscoverage['/gregorian.js'].lineData[469]++;
  timeOfDay += visit35_469_1(fields[MILLISECONDS] || 0);
  _$jscoverage['/gregorian.js'].lineData[471]++;
  var fixedDate = 0;
  _$jscoverage['/gregorian.js'].lineData[473]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[475]++;
  fixedDate = fixedDate + this.getFixedDate();
  _$jscoverage['/gregorian.js'].lineData[478]++;
  var millis = (fixedDate - EPOCH_OFFSET) * ONE_DAY + timeOfDay;
  _$jscoverage['/gregorian.js'].lineData[480]++;
  millis -= this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[482]++;
  this.time = millis;
  _$jscoverage['/gregorian.js'].lineData[484]++;
  this.computeFields();
}, 
  complete: function() {
  _$jscoverage['/gregorian.js'].functionData[9]++;
  _$jscoverage['/gregorian.js'].lineData[495]++;
  if (visit36_495_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[496]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[498]++;
  if (visit37_498_1(!this.fieldsComputed)) {
    _$jscoverage['/gregorian.js'].lineData[499]++;
    this.computeFields();
  }
}, 
  getFixedDate: function() {
  _$jscoverage['/gregorian.js'].functionData[10]++;
  _$jscoverage['/gregorian.js'].lineData[505]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[507]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[509]++;
  var firstDayOfWeekCfg = self.firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[511]++;
  var year = fields[YEAR];
  _$jscoverage['/gregorian.js'].lineData[513]++;
  var month = GregorianCalendar.JANUARY;
  _$jscoverage['/gregorian.js'].lineData[515]++;
  if (visit38_515_1(self.isSet(MONTH))) {
    _$jscoverage['/gregorian.js'].lineData[516]++;
    month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[517]++;
    if (visit39_517_1(month > GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[518]++;
      year += toInt(month / 12);
      _$jscoverage['/gregorian.js'].lineData[519]++;
      month %= 12;
    } else {
      _$jscoverage['/gregorian.js'].lineData[520]++;
      if (visit40_520_1(month < GregorianCalendar.JANUARY)) {
        _$jscoverage['/gregorian.js'].lineData[521]++;
        year += floorDivide(month / 12);
        _$jscoverage['/gregorian.js'].lineData[522]++;
        month = mod(month, 12);
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[528]++;
  var fixedDate = Utils.getFixedDate(year, month, 1);
  _$jscoverage['/gregorian.js'].lineData[529]++;
  var firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[530]++;
  var dayOfWeek = self.firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[532]++;
  if (visit41_532_1(self.isSet(DAY_OF_WEEK))) {
    _$jscoverage['/gregorian.js'].lineData[533]++;
    dayOfWeek = fields[DAY_OF_WEEK];
  }
  _$jscoverage['/gregorian.js'].lineData[536]++;
  if (visit42_536_1(self.isSet(MONTH))) {
    _$jscoverage['/gregorian.js'].lineData[537]++;
    if (visit43_537_1(self.isSet(DAY_OF_MONTH))) {
      _$jscoverage['/gregorian.js'].lineData[538]++;
      fixedDate += fields[DAY_OF_MONTH] - 1;
    } else {
      _$jscoverage['/gregorian.js'].lineData[540]++;
      if (visit44_540_1(self.isSet(WEEK_OF_MONTH))) {
        _$jscoverage['/gregorian.js'].lineData[541]++;
        firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
        _$jscoverage['/gregorian.js'].lineData[545]++;
        if (visit45_545_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
          _$jscoverage['/gregorian.js'].lineData[546]++;
          firstDayOfWeek -= 7;
        }
        _$jscoverage['/gregorian.js'].lineData[549]++;
        if (visit46_549_1(dayOfWeek !== firstDayOfWeekCfg)) {
          _$jscoverage['/gregorian.js'].lineData[550]++;
          firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
        }
        _$jscoverage['/gregorian.js'].lineData[553]++;
        fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_MONTH] - 1);
      } else {
        _$jscoverage['/gregorian.js'].lineData[555]++;
        var dowim;
        _$jscoverage['/gregorian.js'].lineData[556]++;
        if (visit47_556_1(self.isSet(DAY_OF_WEEK_IN_MONTH))) {
          _$jscoverage['/gregorian.js'].lineData[557]++;
          dowim = fields[DAY_OF_WEEK_IN_MONTH];
        } else {
          _$jscoverage['/gregorian.js'].lineData[559]++;
          dowim = 1;
        }
        _$jscoverage['/gregorian.js'].lineData[561]++;
        var lastDate = (7 * dowim);
        _$jscoverage['/gregorian.js'].lineData[562]++;
        if (visit48_562_1(dowim < 0)) {
          _$jscoverage['/gregorian.js'].lineData[563]++;
          lastDate = getMonthLength(year, month) + (7 * (dowim + 1));
        }
        _$jscoverage['/gregorian.js'].lineData[565]++;
        fixedDate = getDayOfWeekDateOnOrBefore(fixedDate + lastDate - 1, dayOfWeek);
      }
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[570]++;
    if (visit49_570_1(self.isSet(DAY_OF_YEAR))) {
      _$jscoverage['/gregorian.js'].lineData[571]++;
      fixedDate += fields[DAY_OF_YEAR] - 1;
    } else {
      _$jscoverage['/gregorian.js'].lineData[573]++;
      firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
      _$jscoverage['/gregorian.js'].lineData[576]++;
      if (visit50_576_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
        _$jscoverage['/gregorian.js'].lineData[577]++;
        firstDayOfWeek -= 7;
      }
      _$jscoverage['/gregorian.js'].lineData[579]++;
      if (visit51_579_1(dayOfWeek !== firstDayOfWeekCfg)) {
        _$jscoverage['/gregorian.js'].lineData[580]++;
        firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
      }
      _$jscoverage['/gregorian.js'].lineData[582]++;
      fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_YEAR] - 1);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[586]++;
  return fixedDate;
}, 
  getTime: function() {
  _$jscoverage['/gregorian.js'].functionData[11]++;
  _$jscoverage['/gregorian.js'].lineData[595]++;
  if (visit52_595_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[596]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[598]++;
  return this.time;
}, 
  setTime: function(time) {
  _$jscoverage['/gregorian.js'].functionData[12]++;
  _$jscoverage['/gregorian.js'].lineData[606]++;
  this.time = time;
  _$jscoverage['/gregorian.js'].lineData[607]++;
  this.fieldsComputed = false;
  _$jscoverage['/gregorian.js'].lineData[608]++;
  this.complete();
}, 
  get: function(field) {
  _$jscoverage['/gregorian.js'].functionData[13]++;
  _$jscoverage['/gregorian.js'].lineData[617]++;
  this.complete();
  _$jscoverage['/gregorian.js'].lineData[618]++;
  return this.fields[field];
}, 
  set: function(field, v) {
  _$jscoverage['/gregorian.js'].functionData[14]++;
  _$jscoverage['/gregorian.js'].lineData[699]++;
  var len = arguments.length;
  _$jscoverage['/gregorian.js'].lineData[700]++;
  if (visit53_700_1(len === 2)) {
    _$jscoverage['/gregorian.js'].lineData[701]++;
    this.fields[field] = v;
  } else {
    _$jscoverage['/gregorian.js'].lineData[702]++;
    if (visit54_702_1(len < MILLISECONDS + 1)) {
      _$jscoverage['/gregorian.js'].lineData[703]++;
      for (var i = 0; visit55_703_1(i < len); i++) {
        _$jscoverage['/gregorian.js'].lineData[704]++;
        this.fields[YEAR + i] = arguments[i];
      }
    } else {
      _$jscoverage['/gregorian.js'].lineData[707]++;
      throw new Error('illegal arguments for KISSY GregorianCalendar set');
    }
  }
  _$jscoverage['/gregorian.js'].lineData[709]++;
  this.time = undefined;
}, 
  add: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[15]++;
  _$jscoverage['/gregorian.js'].lineData[808]++;
  if (visit56_808_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[809]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[811]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[812]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[814]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[815]++;
  if (visit57_815_1(field === YEAR)) {
    _$jscoverage['/gregorian.js'].lineData[816]++;
    value += amount;
    _$jscoverage['/gregorian.js'].lineData[817]++;
    self.set(YEAR, value);
    _$jscoverage['/gregorian.js'].lineData[818]++;
    adjustDayOfMonth(self);
  } else {
    _$jscoverage['/gregorian.js'].lineData[819]++;
    if (visit58_819_1(field === MONTH)) {
      _$jscoverage['/gregorian.js'].lineData[820]++;
      value += amount;
      _$jscoverage['/gregorian.js'].lineData[821]++;
      var yearAmount = floorDivide(value / 12);
      _$jscoverage['/gregorian.js'].lineData[822]++;
      value = mod(value, 12);
      _$jscoverage['/gregorian.js'].lineData[823]++;
      if (visit59_823_1(yearAmount)) {
        _$jscoverage['/gregorian.js'].lineData[824]++;
        self.set(YEAR, fields[YEAR] + yearAmount);
      }
      _$jscoverage['/gregorian.js'].lineData[826]++;
      self.set(MONTH, value);
      _$jscoverage['/gregorian.js'].lineData[827]++;
      adjustDayOfMonth(self);
    } else {
      _$jscoverage['/gregorian.js'].lineData[829]++;
      switch (field) {
        case HOUR_OF_DAY:
          _$jscoverage['/gregorian.js'].lineData[831]++;
          amount *= ONE_HOUR;
          _$jscoverage['/gregorian.js'].lineData[832]++;
          break;
        case MINUTE:
          _$jscoverage['/gregorian.js'].lineData[834]++;
          amount *= ONE_MINUTE;
          _$jscoverage['/gregorian.js'].lineData[835]++;
          break;
        case SECONDS:
          _$jscoverage['/gregorian.js'].lineData[837]++;
          amount *= ONE_SECOND;
          _$jscoverage['/gregorian.js'].lineData[838]++;
          break;
        case MILLISECONDS:
          _$jscoverage['/gregorian.js'].lineData[840]++;
          break;
        case WEEK_OF_MONTH:
        case WEEK_OF_YEAR:
        case DAY_OF_WEEK_IN_MONTH:
          _$jscoverage['/gregorian.js'].lineData[844]++;
          amount *= ONE_WEEK;
          _$jscoverage['/gregorian.js'].lineData[845]++;
          break;
        case DAY_OF_WEEK:
        case DAY_OF_YEAR:
        case DAY_OF_MONTH:
          _$jscoverage['/gregorian.js'].lineData[849]++;
          amount *= ONE_DAY;
          _$jscoverage['/gregorian.js'].lineData[850]++;
          break;
        default:
          _$jscoverage['/gregorian.js'].lineData[852]++;
          throw new Error('illegal field for add');
      }
      _$jscoverage['/gregorian.js'].lineData[854]++;
      self.setTime(self.time + amount);
    }
  }
}, 
  getRolledValue: function(value, amount, min, max) {
  _$jscoverage['/gregorian.js'].functionData[16]++;
  _$jscoverage['/gregorian.js'].lineData[936]++;
  var diff = value - min;
  _$jscoverage['/gregorian.js'].lineData[937]++;
  var range = max - min + 1;
  _$jscoverage['/gregorian.js'].lineData[938]++;
  amount %= range;
  _$jscoverage['/gregorian.js'].lineData[939]++;
  return min + (diff + amount + range) % range;
}, 
  roll: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[17]++;
  _$jscoverage['/gregorian.js'].lineData[964]++;
  if (visit60_964_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[965]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[967]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[969]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[970]++;
  var min = self.getActualMinimum(field);
  _$jscoverage['/gregorian.js'].lineData[971]++;
  var max = self.getActualMaximum(field);
  _$jscoverage['/gregorian.js'].lineData[972]++;
  value = self.getRolledValue(value, amount, min, max);
  _$jscoverage['/gregorian.js'].lineData[974]++;
  self.set(field, value);
  _$jscoverage['/gregorian.js'].lineData[977]++;
  switch (field) {
    case MONTH:
      _$jscoverage['/gregorian.js'].lineData[979]++;
      adjustDayOfMonth(self);
      _$jscoverage['/gregorian.js'].lineData[980]++;
      break;
    default:
      _$jscoverage['/gregorian.js'].lineData[983]++;
      self.updateFieldsBySet(field);
      _$jscoverage['/gregorian.js'].lineData[984]++;
      break;
  }
}, 
  updateFieldsBySet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[18]++;
  _$jscoverage['/gregorian.js'].lineData[1060]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1061]++;
  switch (field) {
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[1063]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1064]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1066]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1067]++;
      break;
    case DAY_OF_WEEK:
      _$jscoverage['/gregorian.js'].lineData[1069]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1070]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1072]++;
      fields[DAY_OF_YEAR] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1073]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1074]++;
      break;
  }
}, 
  getTimezoneOffset: function() {
  _$jscoverage['/gregorian.js'].functionData[19]++;
  _$jscoverage['/gregorian.js'].lineData[1083]++;
  return this.timezoneOffset;
}, 
  setTimezoneOffset: function(timezoneOffset) {
  _$jscoverage['/gregorian.js'].functionData[20]++;
  _$jscoverage['/gregorian.js'].lineData[1090]++;
  if (visit61_1090_1(this.timezoneOffset !== timezoneOffset)) {
    _$jscoverage['/gregorian.js'].lineData[1091]++;
    this.fieldsComputed = undefined;
    _$jscoverage['/gregorian.js'].lineData[1092]++;
    this.timezoneOffset = timezoneOffset;
  }
}, 
  setFirstDayOfWeek: function(firstDayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[21]++;
  _$jscoverage['/gregorian.js'].lineData[1100]++;
  if (visit62_1100_1(this.firstDayOfWeek !== firstDayOfWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1101]++;
    this.firstDayOfWeek = firstDayOfWeek;
    _$jscoverage['/gregorian.js'].lineData[1102]++;
    this.fieldsComputed = false;
  }
}, 
  getFirstDayOfWeek: function() {
  _$jscoverage['/gregorian.js'].functionData[22]++;
  _$jscoverage['/gregorian.js'].lineData[1111]++;
  return this.firstDayOfWeek;
}, 
  setMinimalDaysInFirstWeek: function(minimalDaysInFirstWeek) {
  _$jscoverage['/gregorian.js'].functionData[23]++;
  _$jscoverage['/gregorian.js'].lineData[1122]++;
  if (visit63_1122_1(this.minimalDaysInFirstWeek !== minimalDaysInFirstWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1123]++;
    this.minimalDaysInFirstWeek = minimalDaysInFirstWeek;
    _$jscoverage['/gregorian.js'].lineData[1124]++;
    this.fieldsComputed = false;
  }
}, 
  getMinimalDaysInFirstWeek: function() {
  _$jscoverage['/gregorian.js'].functionData[24]++;
  _$jscoverage['/gregorian.js'].lineData[1136]++;
  return this.minimalDaysInFirstWeek;
}, 
  getWeeksInWeekYear: function() {
  _$jscoverage['/gregorian.js'].functionData[25]++;
  _$jscoverage['/gregorian.js'].lineData[1153]++;
  var weekYear = this.getWeekYear();
  _$jscoverage['/gregorian.js'].lineData[1154]++;
  if (visit64_1154_1(weekYear === this.get(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[1155]++;
    return this.getActualMaximum(WEEK_OF_YEAR);
  }
  _$jscoverage['/gregorian.js'].lineData[1158]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1159]++;
  gc.setWeekDate(weekYear, 2, this.get(DAY_OF_WEEK));
  _$jscoverage['/gregorian.js'].lineData[1160]++;
  return gc.getActualMaximum(WEEK_OF_YEAR);
}, 
  getWeekYear: function() {
  _$jscoverage['/gregorian.js'].functionData[26]++;
  _$jscoverage['/gregorian.js'].lineData[1172]++;
  var year = this.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1173]++;
  var weekOfYear = this.get(WEEK_OF_YEAR);
  _$jscoverage['/gregorian.js'].lineData[1174]++;
  var month = this.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1175]++;
  if (visit65_1175_1(month === GregorianCalendar.JANUARY)) {
    _$jscoverage['/gregorian.js'].lineData[1176]++;
    if (visit66_1176_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[1177]++;
      --year;
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[1179]++;
    if (visit67_1179_1(month === GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[1180]++;
      if (visit68_1180_1(weekOfYear === 1)) {
        _$jscoverage['/gregorian.js'].lineData[1181]++;
        ++year;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1184]++;
  return year;
}, 
  setWeekDate: function(weekYear, weekOfYear, dayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[27]++;
  _$jscoverage['/gregorian.js'].lineData[1196]++;
  if (visit69_1196_1(visit70_1196_2(dayOfWeek < GregorianCalendar.SUNDAY) || visit71_1196_3(dayOfWeek > GregorianCalendar.SATURDAY))) {
    _$jscoverage['/gregorian.js'].lineData[1197]++;
    throw new Error('invalid dayOfWeek: ' + dayOfWeek);
  }
  _$jscoverage['/gregorian.js'].lineData[1199]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1202]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1203]++;
  gc.clear();
  _$jscoverage['/gregorian.js'].lineData[1204]++;
  gc.setTimezoneOffset(0);
  _$jscoverage['/gregorian.js'].lineData[1205]++;
  gc.set(YEAR, weekYear);
  _$jscoverage['/gregorian.js'].lineData[1206]++;
  gc.set(WEEK_OF_YEAR, 1);
  _$jscoverage['/gregorian.js'].lineData[1207]++;
  gc.set(DAY_OF_WEEK, this.getFirstDayOfWeek());
  _$jscoverage['/gregorian.js'].lineData[1208]++;
  var days = dayOfWeek - this.getFirstDayOfWeek();
  _$jscoverage['/gregorian.js'].lineData[1209]++;
  if (visit72_1209_1(days < 0)) {
    _$jscoverage['/gregorian.js'].lineData[1210]++;
    days += 7;
  }
  _$jscoverage['/gregorian.js'].lineData[1212]++;
  days += 7 * (weekOfYear - 1);
  _$jscoverage['/gregorian.js'].lineData[1213]++;
  if (visit73_1213_1(days !== 0)) {
    _$jscoverage['/gregorian.js'].lineData[1214]++;
    gc.add(DAY_OF_YEAR, days);
  } else {
    _$jscoverage['/gregorian.js'].lineData[1216]++;
    gc.complete();
  }
  _$jscoverage['/gregorian.js'].lineData[1218]++;
  fields[YEAR] = gc.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1219]++;
  fields[MONTH] = gc.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1220]++;
  fields[DAY_OF_MONTH] = gc.get(DAY_OF_MONTH);
  _$jscoverage['/gregorian.js'].lineData[1221]++;
  this.complete();
}, 
  clone: function() {
  _$jscoverage['/gregorian.js'].functionData[28]++;
  _$jscoverage['/gregorian.js'].lineData[1228]++;
  if (visit74_1228_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1229]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[1231]++;
  var cal = new GregorianCalendar(this.timezoneOffset, this.locale);
  _$jscoverage['/gregorian.js'].lineData[1232]++;
  cal.setTime(this.time);
  _$jscoverage['/gregorian.js'].lineData[1233]++;
  return cal;
}, 
  equals: function(obj) {
  _$jscoverage['/gregorian.js'].functionData[29]++;
  _$jscoverage['/gregorian.js'].lineData[1245]++;
  return visit75_1245_1(visit76_1245_2(this.getTime() === obj.getTime()) && visit77_1246_1(visit78_1246_2(this.firstDayOfWeek === obj.firstDayOfWeek) && visit79_1247_1(visit80_1247_2(this.timezoneOffset === obj.timezoneOffset) && visit81_1248_1(this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek))));
}, 
  clear: function(field) {
  _$jscoverage['/gregorian.js'].functionData[30]++;
  _$jscoverage['/gregorian.js'].lineData[1259]++;
  if (visit82_1259_1(field === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1260]++;
    this.field = [];
  } else {
    _$jscoverage['/gregorian.js'].lineData[1262]++;
    this.fields[field] = undefined;
  }
  _$jscoverage['/gregorian.js'].lineData[1264]++;
  this.time = undefined;
  _$jscoverage['/gregorian.js'].lineData[1265]++;
  this.fieldsComputed = false;
}};
  _$jscoverage['/gregorian.js'].lineData[1269]++;
  var GregorianCalendarProto = GregorianCalendar.prototype;
  _$jscoverage['/gregorian.js'].lineData[1271]++;
  if (visit83_1271_1('@DEBUG@')) {
    _$jscoverage['/gregorian.js'].lineData[1273]++;
    GregorianCalendarProto.getDayOfMonth = GregorianCalendarProto.getHourOfDay = GregorianCalendarProto.getWeekOfYear = GregorianCalendarProto.getWeekOfMonth = GregorianCalendarProto.getDayOfYear = GregorianCalendarProto.getDayOfWeek = GregorianCalendarProto.getDayOfWeekInMonth = util.noop;
    _$jscoverage['/gregorian.js'].lineData[1281]++;
    GregorianCalendarProto.addDayOfMonth = GregorianCalendarProto.addMonth = GregorianCalendarProto.addYear = GregorianCalendarProto.addMinutes = GregorianCalendarProto.addSeconds = GregorianCalendarProto.addMilliSeconds = GregorianCalendarProto.addHourOfDay = GregorianCalendarProto.addWeekOfYear = GregorianCalendarProto.addWeekOfMonth = GregorianCalendarProto.addDayOfYear = GregorianCalendarProto.addDayOfWeek = GregorianCalendarProto.addDayOfWeekInMonth = util.noop;
    _$jscoverage['/gregorian.js'].lineData[1293]++;
    GregorianCalendarProto.isSetDayOfMonth = GregorianCalendarProto.isSetMonth = GregorianCalendarProto.isSetYear = GregorianCalendarProto.isSetMinutes = GregorianCalendarProto.isSetSeconds = GregorianCalendarProto.isSetMilliSeconds = GregorianCalendarProto.isSetHourOfDay = GregorianCalendarProto.isSetWeekOfYear = GregorianCalendarProto.isSetWeekOfMonth = GregorianCalendarProto.isSetDayOfYear = GregorianCalendarProto.isSetDayOfWeek = GregorianCalendarProto.isSetDayOfWeekInMonth = util.noop;
    _$jscoverage['/gregorian.js'].lineData[1305]++;
    GregorianCalendarProto.setDayOfMonth = GregorianCalendarProto.setHourOfDay = GregorianCalendarProto.setWeekOfYear = GregorianCalendarProto.setWeekOfMonth = GregorianCalendarProto.setDayOfYear = GregorianCalendarProto.setDayOfWeek = GregorianCalendarProto.setDayOfWeekInMonth = util.noop;
    _$jscoverage['/gregorian.js'].lineData[1313]++;
    GregorianCalendarProto.rollDayOfMonth = GregorianCalendarProto.rollMonth = GregorianCalendarProto.rollYear = GregorianCalendarProto.rollMinutes = GregorianCalendarProto.rollSeconds = GregorianCalendarProto.rollMilliSeconds = GregorianCalendarProto.rollHourOfDay = GregorianCalendarProto.rollWeekOfYear = GregorianCalendarProto.rollWeekOfMonth = GregorianCalendarProto.rollDayOfYear = GregorianCalendarProto.rollDayOfWeek = GregorianCalendarProto.rollDayOfWeekInMonth = util.noop;
  }
  _$jscoverage['/gregorian.js'].lineData[1326]++;
  util.each(fields, function(f, index) {
  _$jscoverage['/gregorian.js'].functionData[31]++;
  _$jscoverage['/gregorian.js'].lineData[1327]++;
  if (visit84_1327_1(f)) {
    _$jscoverage['/gregorian.js'].lineData[1328]++;
    GregorianCalendarProto['get' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[32]++;
  _$jscoverage['/gregorian.js'].lineData[1329]++;
  return this.get(index);
};
    _$jscoverage['/gregorian.js'].lineData[1332]++;
    GregorianCalendarProto['isSet' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[33]++;
  _$jscoverage['/gregorian.js'].lineData[1333]++;
  return this.isSet(index);
};
    _$jscoverage['/gregorian.js'].lineData[1336]++;
    GregorianCalendarProto['set' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[34]++;
  _$jscoverage['/gregorian.js'].lineData[1337]++;
  return this.set(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1340]++;
    GregorianCalendarProto['add' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[35]++;
  _$jscoverage['/gregorian.js'].lineData[1341]++;
  return this.add(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1344]++;
    GregorianCalendarProto['roll' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[36]++;
  _$jscoverage['/gregorian.js'].lineData[1345]++;
  return this.roll(index, v);
};
  }
});
  _$jscoverage['/gregorian.js'].lineData[1352]++;
  function adjustDayOfMonth(self) {
    _$jscoverage['/gregorian.js'].functionData[37]++;
    _$jscoverage['/gregorian.js'].lineData[1353]++;
    var fields = self.fields;
    _$jscoverage['/gregorian.js'].lineData[1354]++;
    var year = fields[YEAR];
    _$jscoverage['/gregorian.js'].lineData[1355]++;
    var month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[1356]++;
    var monthLen = getMonthLength(year, month);
    _$jscoverage['/gregorian.js'].lineData[1357]++;
    var dayOfMonth = fields[DAY_OF_MONTH];
    _$jscoverage['/gregorian.js'].lineData[1358]++;
    if (visit85_1358_1(dayOfMonth > monthLen)) {
      _$jscoverage['/gregorian.js'].lineData[1359]++;
      self.set(DAY_OF_MONTH, monthLen);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1363]++;
  function getMonthLength(year, month) {
    _$jscoverage['/gregorian.js'].functionData[38]++;
    _$jscoverage['/gregorian.js'].lineData[1364]++;
    return isLeapYear(year) ? LEAP_MONTH_LENGTH[month] : MONTH_LENGTH[month];
  }
  _$jscoverage['/gregorian.js'].lineData[1367]++;
  function getYearLength(year) {
    _$jscoverage['/gregorian.js'].functionData[39]++;
    _$jscoverage['/gregorian.js'].lineData[1368]++;
    return isLeapYear(year) ? 366 : 365;
  }
  _$jscoverage['/gregorian.js'].lineData[1371]++;
  function getWeekNumber(self, fixedDay1, fixedDate) {
    _$jscoverage['/gregorian.js'].functionData[40]++;
    _$jscoverage['/gregorian.js'].lineData[1372]++;
    var fixedDay1st = getDayOfWeekDateOnOrBefore(fixedDay1 + 6, self.firstDayOfWeek);
    _$jscoverage['/gregorian.js'].lineData[1373]++;
    var nDays = (fixedDay1st - fixedDay1);
    _$jscoverage['/gregorian.js'].lineData[1374]++;
    if (visit86_1374_1(nDays >= self.minimalDaysInFirstWeek)) {
      _$jscoverage['/gregorian.js'].lineData[1375]++;
      fixedDay1st -= 7;
    }
    _$jscoverage['/gregorian.js'].lineData[1377]++;
    var normalizedDayOfPeriod = (fixedDate - fixedDay1st);
    _$jscoverage['/gregorian.js'].lineData[1378]++;
    return floorDivide(normalizedDayOfPeriod / 7) + 1;
  }
  _$jscoverage['/gregorian.js'].lineData[1381]++;
  function getDayOfWeekDateOnOrBefore(fixedDate, dayOfWeek) {
    _$jscoverage['/gregorian.js'].functionData[41]++;
    _$jscoverage['/gregorian.js'].lineData[1384]++;
    return fixedDate - mod(fixedDate - dayOfWeek, 7);
  }
  _$jscoverage['/gregorian.js'].lineData[1389]++;
  return GregorianCalendar;
});
