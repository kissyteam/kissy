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
  _$jscoverage['/gregorian.js'].lineData[183] = 0;
  _$jscoverage['/gregorian.js'].lineData[191] = 0;
  _$jscoverage['/gregorian.js'].lineData[192] = 0;
  _$jscoverage['/gregorian.js'].lineData[193] = 0;
  _$jscoverage['/gregorian.js'].lineData[194] = 0;
  _$jscoverage['/gregorian.js'].lineData[195] = 0;
  _$jscoverage['/gregorian.js'].lineData[196] = 0;
  _$jscoverage['/gregorian.js'].lineData[198] = 0;
  _$jscoverage['/gregorian.js'].lineData[199] = 0;
  _$jscoverage['/gregorian.js'].lineData[200] = 0;
  _$jscoverage['/gregorian.js'].lineData[201] = 0;
  _$jscoverage['/gregorian.js'].lineData[203] = 0;
  _$jscoverage['/gregorian.js'].lineData[204] = 0;
  _$jscoverage['/gregorian.js'].lineData[206] = 0;
  _$jscoverage['/gregorian.js'].lineData[207] = 0;
  _$jscoverage['/gregorian.js'].lineData[209] = 0;
  _$jscoverage['/gregorian.js'].lineData[210] = 0;
  _$jscoverage['/gregorian.js'].lineData[211] = 0;
  _$jscoverage['/gregorian.js'].lineData[212] = 0;
  _$jscoverage['/gregorian.js'].lineData[213] = 0;
  _$jscoverage['/gregorian.js'].lineData[215] = 0;
  _$jscoverage['/gregorian.js'].lineData[217] = 0;
  _$jscoverage['/gregorian.js'].lineData[221] = 0;
  _$jscoverage['/gregorian.js'].lineData[239] = 0;
  _$jscoverage['/gregorian.js'].lineData[255] = 0;
  _$jscoverage['/gregorian.js'].lineData[267] = 0;
  _$jscoverage['/gregorian.js'].lineData[275] = 0;
  _$jscoverage['/gregorian.js'].lineData[289] = 0;
  _$jscoverage['/gregorian.js'].lineData[290] = 0;
  _$jscoverage['/gregorian.js'].lineData[293] = 0;
  _$jscoverage['/gregorian.js'].lineData[294] = 0;
  _$jscoverage['/gregorian.js'].lineData[295] = 0;
  _$jscoverage['/gregorian.js'].lineData[296] = 0;
  _$jscoverage['/gregorian.js'].lineData[299] = 0;
  _$jscoverage['/gregorian.js'].lineData[312] = 0;
  _$jscoverage['/gregorian.js'].lineData[313] = 0;
  _$jscoverage['/gregorian.js'].lineData[315] = 0;
  _$jscoverage['/gregorian.js'].lineData[317] = 0;
  _$jscoverage['/gregorian.js'].lineData[319] = 0;
  _$jscoverage['/gregorian.js'].lineData[320] = 0;
  _$jscoverage['/gregorian.js'].lineData[323] = 0;
  _$jscoverage['/gregorian.js'].lineData[324] = 0;
  _$jscoverage['/gregorian.js'].lineData[325] = 0;
  _$jscoverage['/gregorian.js'].lineData[326] = 0;
  _$jscoverage['/gregorian.js'].lineData[328] = 0;
  _$jscoverage['/gregorian.js'].lineData[331] = 0;
  _$jscoverage['/gregorian.js'].lineData[332] = 0;
  _$jscoverage['/gregorian.js'].lineData[333] = 0;
  _$jscoverage['/gregorian.js'].lineData[336] = 0;
  _$jscoverage['/gregorian.js'].lineData[337] = 0;
  _$jscoverage['/gregorian.js'].lineData[340] = 0;
  _$jscoverage['/gregorian.js'].lineData[341] = 0;
  _$jscoverage['/gregorian.js'].lineData[343] = 0;
  _$jscoverage['/gregorian.js'].lineData[344] = 0;
  _$jscoverage['/gregorian.js'].lineData[346] = 0;
  _$jscoverage['/gregorian.js'].lineData[357] = 0;
  _$jscoverage['/gregorian.js'].lineData[366] = 0;
  _$jscoverage['/gregorian.js'].lineData[367] = 0;
  _$jscoverage['/gregorian.js'].lineData[368] = 0;
  _$jscoverage['/gregorian.js'].lineData[369] = 0;
  _$jscoverage['/gregorian.js'].lineData[370] = 0;
  _$jscoverage['/gregorian.js'].lineData[371] = 0;
  _$jscoverage['/gregorian.js'].lineData[372] = 0;
  _$jscoverage['/gregorian.js'].lineData[373] = 0;
  _$jscoverage['/gregorian.js'].lineData[374] = 0;
  _$jscoverage['/gregorian.js'].lineData[376] = 0;
  _$jscoverage['/gregorian.js'].lineData[377] = 0;
  _$jscoverage['/gregorian.js'].lineData[378] = 0;
  _$jscoverage['/gregorian.js'].lineData[382] = 0;
  _$jscoverage['/gregorian.js'].lineData[384] = 0;
  _$jscoverage['/gregorian.js'].lineData[386] = 0;
  _$jscoverage['/gregorian.js'].lineData[388] = 0;
  _$jscoverage['/gregorian.js'].lineData[389] = 0;
  _$jscoverage['/gregorian.js'].lineData[390] = 0;
  _$jscoverage['/gregorian.js'].lineData[391] = 0;
  _$jscoverage['/gregorian.js'].lineData[392] = 0;
  _$jscoverage['/gregorian.js'].lineData[394] = 0;
  _$jscoverage['/gregorian.js'].lineData[395] = 0;
  _$jscoverage['/gregorian.js'].lineData[396] = 0;
  _$jscoverage['/gregorian.js'].lineData[397] = 0;
  _$jscoverage['/gregorian.js'].lineData[398] = 0;
  _$jscoverage['/gregorian.js'].lineData[399] = 0;
  _$jscoverage['/gregorian.js'].lineData[400] = 0;
  _$jscoverage['/gregorian.js'].lineData[402] = 0;
  _$jscoverage['/gregorian.js'].lineData[408] = 0;
  _$jscoverage['/gregorian.js'].lineData[409] = 0;
  _$jscoverage['/gregorian.js'].lineData[410] = 0;
  _$jscoverage['/gregorian.js'].lineData[412] = 0;
  _$jscoverage['/gregorian.js'].lineData[413] = 0;
  _$jscoverage['/gregorian.js'].lineData[415] = 0;
  _$jscoverage['/gregorian.js'].lineData[418] = 0;
  _$jscoverage['/gregorian.js'].lineData[422] = 0;
  _$jscoverage['/gregorian.js'].lineData[423] = 0;
  _$jscoverage['/gregorian.js'].lineData[424] = 0;
  _$jscoverage['/gregorian.js'].lineData[427] = 0;
  _$jscoverage['/gregorian.js'].lineData[428] = 0;
  _$jscoverage['/gregorian.js'].lineData[429] = 0;
  _$jscoverage['/gregorian.js'].lineData[430] = 0;
  _$jscoverage['/gregorian.js'].lineData[432] = 0;
  _$jscoverage['/gregorian.js'].lineData[436] = 0;
  _$jscoverage['/gregorian.js'].lineData[440] = 0;
  _$jscoverage['/gregorian.js'].lineData[441] = 0;
  _$jscoverage['/gregorian.js'].lineData[443] = 0;
  _$jscoverage['/gregorian.js'].lineData[452] = 0;
  _$jscoverage['/gregorian.js'].lineData[453] = 0;
  _$jscoverage['/gregorian.js'].lineData[456] = 0;
  _$jscoverage['/gregorian.js'].lineData[458] = 0;
  _$jscoverage['/gregorian.js'].lineData[459] = 0;
  _$jscoverage['/gregorian.js'].lineData[460] = 0;
  _$jscoverage['/gregorian.js'].lineData[461] = 0;
  _$jscoverage['/gregorian.js'].lineData[463] = 0;
  _$jscoverage['/gregorian.js'].lineData[464] = 0;
  _$jscoverage['/gregorian.js'].lineData[465] = 0;
  _$jscoverage['/gregorian.js'].lineData[466] = 0;
  _$jscoverage['/gregorian.js'].lineData[467] = 0;
  _$jscoverage['/gregorian.js'].lineData[468] = 0;
  _$jscoverage['/gregorian.js'].lineData[470] = 0;
  _$jscoverage['/gregorian.js'].lineData[472] = 0;
  _$jscoverage['/gregorian.js'].lineData[474] = 0;
  _$jscoverage['/gregorian.js'].lineData[477] = 0;
  _$jscoverage['/gregorian.js'].lineData[479] = 0;
  _$jscoverage['/gregorian.js'].lineData[481] = 0;
  _$jscoverage['/gregorian.js'].lineData[483] = 0;
  _$jscoverage['/gregorian.js'].lineData[494] = 0;
  _$jscoverage['/gregorian.js'].lineData[495] = 0;
  _$jscoverage['/gregorian.js'].lineData[497] = 0;
  _$jscoverage['/gregorian.js'].lineData[498] = 0;
  _$jscoverage['/gregorian.js'].lineData[504] = 0;
  _$jscoverage['/gregorian.js'].lineData[506] = 0;
  _$jscoverage['/gregorian.js'].lineData[508] = 0;
  _$jscoverage['/gregorian.js'].lineData[510] = 0;
  _$jscoverage['/gregorian.js'].lineData[512] = 0;
  _$jscoverage['/gregorian.js'].lineData[514] = 0;
  _$jscoverage['/gregorian.js'].lineData[515] = 0;
  _$jscoverage['/gregorian.js'].lineData[516] = 0;
  _$jscoverage['/gregorian.js'].lineData[517] = 0;
  _$jscoverage['/gregorian.js'].lineData[518] = 0;
  _$jscoverage['/gregorian.js'].lineData[519] = 0;
  _$jscoverage['/gregorian.js'].lineData[520] = 0;
  _$jscoverage['/gregorian.js'].lineData[521] = 0;
  _$jscoverage['/gregorian.js'].lineData[527] = 0;
  _$jscoverage['/gregorian.js'].lineData[528] = 0;
  _$jscoverage['/gregorian.js'].lineData[529] = 0;
  _$jscoverage['/gregorian.js'].lineData[531] = 0;
  _$jscoverage['/gregorian.js'].lineData[532] = 0;
  _$jscoverage['/gregorian.js'].lineData[535] = 0;
  _$jscoverage['/gregorian.js'].lineData[536] = 0;
  _$jscoverage['/gregorian.js'].lineData[537] = 0;
  _$jscoverage['/gregorian.js'].lineData[539] = 0;
  _$jscoverage['/gregorian.js'].lineData[540] = 0;
  _$jscoverage['/gregorian.js'].lineData[544] = 0;
  _$jscoverage['/gregorian.js'].lineData[545] = 0;
  _$jscoverage['/gregorian.js'].lineData[548] = 0;
  _$jscoverage['/gregorian.js'].lineData[549] = 0;
  _$jscoverage['/gregorian.js'].lineData[552] = 0;
  _$jscoverage['/gregorian.js'].lineData[554] = 0;
  _$jscoverage['/gregorian.js'].lineData[555] = 0;
  _$jscoverage['/gregorian.js'].lineData[556] = 0;
  _$jscoverage['/gregorian.js'].lineData[558] = 0;
  _$jscoverage['/gregorian.js'].lineData[560] = 0;
  _$jscoverage['/gregorian.js'].lineData[561] = 0;
  _$jscoverage['/gregorian.js'].lineData[562] = 0;
  _$jscoverage['/gregorian.js'].lineData[564] = 0;
  _$jscoverage['/gregorian.js'].lineData[569] = 0;
  _$jscoverage['/gregorian.js'].lineData[570] = 0;
  _$jscoverage['/gregorian.js'].lineData[572] = 0;
  _$jscoverage['/gregorian.js'].lineData[575] = 0;
  _$jscoverage['/gregorian.js'].lineData[576] = 0;
  _$jscoverage['/gregorian.js'].lineData[578] = 0;
  _$jscoverage['/gregorian.js'].lineData[579] = 0;
  _$jscoverage['/gregorian.js'].lineData[581] = 0;
  _$jscoverage['/gregorian.js'].lineData[585] = 0;
  _$jscoverage['/gregorian.js'].lineData[594] = 0;
  _$jscoverage['/gregorian.js'].lineData[595] = 0;
  _$jscoverage['/gregorian.js'].lineData[597] = 0;
  _$jscoverage['/gregorian.js'].lineData[605] = 0;
  _$jscoverage['/gregorian.js'].lineData[606] = 0;
  _$jscoverage['/gregorian.js'].lineData[607] = 0;
  _$jscoverage['/gregorian.js'].lineData[616] = 0;
  _$jscoverage['/gregorian.js'].lineData[617] = 0;
  _$jscoverage['/gregorian.js'].lineData[698] = 0;
  _$jscoverage['/gregorian.js'].lineData[699] = 0;
  _$jscoverage['/gregorian.js'].lineData[700] = 0;
  _$jscoverage['/gregorian.js'].lineData[701] = 0;
  _$jscoverage['/gregorian.js'].lineData[702] = 0;
  _$jscoverage['/gregorian.js'].lineData[703] = 0;
  _$jscoverage['/gregorian.js'].lineData[706] = 0;
  _$jscoverage['/gregorian.js'].lineData[708] = 0;
  _$jscoverage['/gregorian.js'].lineData[807] = 0;
  _$jscoverage['/gregorian.js'].lineData[808] = 0;
  _$jscoverage['/gregorian.js'].lineData[810] = 0;
  _$jscoverage['/gregorian.js'].lineData[811] = 0;
  _$jscoverage['/gregorian.js'].lineData[813] = 0;
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
  _$jscoverage['/gregorian.js'].lineData[825] = 0;
  _$jscoverage['/gregorian.js'].lineData[826] = 0;
  _$jscoverage['/gregorian.js'].lineData[828] = 0;
  _$jscoverage['/gregorian.js'].lineData[830] = 0;
  _$jscoverage['/gregorian.js'].lineData[831] = 0;
  _$jscoverage['/gregorian.js'].lineData[833] = 0;
  _$jscoverage['/gregorian.js'].lineData[834] = 0;
  _$jscoverage['/gregorian.js'].lineData[836] = 0;
  _$jscoverage['/gregorian.js'].lineData[837] = 0;
  _$jscoverage['/gregorian.js'].lineData[839] = 0;
  _$jscoverage['/gregorian.js'].lineData[843] = 0;
  _$jscoverage['/gregorian.js'].lineData[844] = 0;
  _$jscoverage['/gregorian.js'].lineData[848] = 0;
  _$jscoverage['/gregorian.js'].lineData[849] = 0;
  _$jscoverage['/gregorian.js'].lineData[851] = 0;
  _$jscoverage['/gregorian.js'].lineData[853] = 0;
  _$jscoverage['/gregorian.js'].lineData[935] = 0;
  _$jscoverage['/gregorian.js'].lineData[936] = 0;
  _$jscoverage['/gregorian.js'].lineData[937] = 0;
  _$jscoverage['/gregorian.js'].lineData[938] = 0;
  _$jscoverage['/gregorian.js'].lineData[963] = 0;
  _$jscoverage['/gregorian.js'].lineData[964] = 0;
  _$jscoverage['/gregorian.js'].lineData[966] = 0;
  _$jscoverage['/gregorian.js'].lineData[968] = 0;
  _$jscoverage['/gregorian.js'].lineData[969] = 0;
  _$jscoverage['/gregorian.js'].lineData[970] = 0;
  _$jscoverage['/gregorian.js'].lineData[971] = 0;
  _$jscoverage['/gregorian.js'].lineData[973] = 0;
  _$jscoverage['/gregorian.js'].lineData[976] = 0;
  _$jscoverage['/gregorian.js'].lineData[978] = 0;
  _$jscoverage['/gregorian.js'].lineData[979] = 0;
  _$jscoverage['/gregorian.js'].lineData[982] = 0;
  _$jscoverage['/gregorian.js'].lineData[983] = 0;
  _$jscoverage['/gregorian.js'].lineData[1059] = 0;
  _$jscoverage['/gregorian.js'].lineData[1060] = 0;
  _$jscoverage['/gregorian.js'].lineData[1062] = 0;
  _$jscoverage['/gregorian.js'].lineData[1063] = 0;
  _$jscoverage['/gregorian.js'].lineData[1065] = 0;
  _$jscoverage['/gregorian.js'].lineData[1066] = 0;
  _$jscoverage['/gregorian.js'].lineData[1068] = 0;
  _$jscoverage['/gregorian.js'].lineData[1069] = 0;
  _$jscoverage['/gregorian.js'].lineData[1071] = 0;
  _$jscoverage['/gregorian.js'].lineData[1072] = 0;
  _$jscoverage['/gregorian.js'].lineData[1073] = 0;
  _$jscoverage['/gregorian.js'].lineData[1082] = 0;
  _$jscoverage['/gregorian.js'].lineData[1089] = 0;
  _$jscoverage['/gregorian.js'].lineData[1090] = 0;
  _$jscoverage['/gregorian.js'].lineData[1091] = 0;
  _$jscoverage['/gregorian.js'].lineData[1099] = 0;
  _$jscoverage['/gregorian.js'].lineData[1100] = 0;
  _$jscoverage['/gregorian.js'].lineData[1101] = 0;
  _$jscoverage['/gregorian.js'].lineData[1110] = 0;
  _$jscoverage['/gregorian.js'].lineData[1121] = 0;
  _$jscoverage['/gregorian.js'].lineData[1122] = 0;
  _$jscoverage['/gregorian.js'].lineData[1123] = 0;
  _$jscoverage['/gregorian.js'].lineData[1135] = 0;
  _$jscoverage['/gregorian.js'].lineData[1152] = 0;
  _$jscoverage['/gregorian.js'].lineData[1153] = 0;
  _$jscoverage['/gregorian.js'].lineData[1154] = 0;
  _$jscoverage['/gregorian.js'].lineData[1157] = 0;
  _$jscoverage['/gregorian.js'].lineData[1158] = 0;
  _$jscoverage['/gregorian.js'].lineData[1159] = 0;
  _$jscoverage['/gregorian.js'].lineData[1171] = 0;
  _$jscoverage['/gregorian.js'].lineData[1172] = 0;
  _$jscoverage['/gregorian.js'].lineData[1173] = 0;
  _$jscoverage['/gregorian.js'].lineData[1174] = 0;
  _$jscoverage['/gregorian.js'].lineData[1175] = 0;
  _$jscoverage['/gregorian.js'].lineData[1176] = 0;
  _$jscoverage['/gregorian.js'].lineData[1178] = 0;
  _$jscoverage['/gregorian.js'].lineData[1179] = 0;
  _$jscoverage['/gregorian.js'].lineData[1180] = 0;
  _$jscoverage['/gregorian.js'].lineData[1183] = 0;
  _$jscoverage['/gregorian.js'].lineData[1195] = 0;
  _$jscoverage['/gregorian.js'].lineData[1196] = 0;
  _$jscoverage['/gregorian.js'].lineData[1198] = 0;
  _$jscoverage['/gregorian.js'].lineData[1201] = 0;
  _$jscoverage['/gregorian.js'].lineData[1202] = 0;
  _$jscoverage['/gregorian.js'].lineData[1203] = 0;
  _$jscoverage['/gregorian.js'].lineData[1204] = 0;
  _$jscoverage['/gregorian.js'].lineData[1205] = 0;
  _$jscoverage['/gregorian.js'].lineData[1206] = 0;
  _$jscoverage['/gregorian.js'].lineData[1207] = 0;
  _$jscoverage['/gregorian.js'].lineData[1208] = 0;
  _$jscoverage['/gregorian.js'].lineData[1209] = 0;
  _$jscoverage['/gregorian.js'].lineData[1211] = 0;
  _$jscoverage['/gregorian.js'].lineData[1212] = 0;
  _$jscoverage['/gregorian.js'].lineData[1213] = 0;
  _$jscoverage['/gregorian.js'].lineData[1215] = 0;
  _$jscoverage['/gregorian.js'].lineData[1217] = 0;
  _$jscoverage['/gregorian.js'].lineData[1218] = 0;
  _$jscoverage['/gregorian.js'].lineData[1219] = 0;
  _$jscoverage['/gregorian.js'].lineData[1220] = 0;
  _$jscoverage['/gregorian.js'].lineData[1227] = 0;
  _$jscoverage['/gregorian.js'].lineData[1228] = 0;
  _$jscoverage['/gregorian.js'].lineData[1230] = 0;
  _$jscoverage['/gregorian.js'].lineData[1231] = 0;
  _$jscoverage['/gregorian.js'].lineData[1232] = 0;
  _$jscoverage['/gregorian.js'].lineData[1244] = 0;
  _$jscoverage['/gregorian.js'].lineData[1258] = 0;
  _$jscoverage['/gregorian.js'].lineData[1259] = 0;
  _$jscoverage['/gregorian.js'].lineData[1261] = 0;
  _$jscoverage['/gregorian.js'].lineData[1263] = 0;
  _$jscoverage['/gregorian.js'].lineData[1264] = 0;
  _$jscoverage['/gregorian.js'].lineData[1268] = 0;
  _$jscoverage['/gregorian.js'].lineData[1270] = 0;
  _$jscoverage['/gregorian.js'].lineData[1272] = 0;
  _$jscoverage['/gregorian.js'].lineData[1280] = 0;
  _$jscoverage['/gregorian.js'].lineData[1292] = 0;
  _$jscoverage['/gregorian.js'].lineData[1304] = 0;
  _$jscoverage['/gregorian.js'].lineData[1312] = 0;
  _$jscoverage['/gregorian.js'].lineData[1325] = 0;
  _$jscoverage['/gregorian.js'].lineData[1326] = 0;
  _$jscoverage['/gregorian.js'].lineData[1327] = 0;
  _$jscoverage['/gregorian.js'].lineData[1328] = 0;
  _$jscoverage['/gregorian.js'].lineData[1331] = 0;
  _$jscoverage['/gregorian.js'].lineData[1332] = 0;
  _$jscoverage['/gregorian.js'].lineData[1335] = 0;
  _$jscoverage['/gregorian.js'].lineData[1336] = 0;
  _$jscoverage['/gregorian.js'].lineData[1339] = 0;
  _$jscoverage['/gregorian.js'].lineData[1340] = 0;
  _$jscoverage['/gregorian.js'].lineData[1343] = 0;
  _$jscoverage['/gregorian.js'].lineData[1344] = 0;
  _$jscoverage['/gregorian.js'].lineData[1351] = 0;
  _$jscoverage['/gregorian.js'].lineData[1352] = 0;
  _$jscoverage['/gregorian.js'].lineData[1353] = 0;
  _$jscoverage['/gregorian.js'].lineData[1354] = 0;
  _$jscoverage['/gregorian.js'].lineData[1355] = 0;
  _$jscoverage['/gregorian.js'].lineData[1356] = 0;
  _$jscoverage['/gregorian.js'].lineData[1357] = 0;
  _$jscoverage['/gregorian.js'].lineData[1358] = 0;
  _$jscoverage['/gregorian.js'].lineData[1362] = 0;
  _$jscoverage['/gregorian.js'].lineData[1363] = 0;
  _$jscoverage['/gregorian.js'].lineData[1366] = 0;
  _$jscoverage['/gregorian.js'].lineData[1367] = 0;
  _$jscoverage['/gregorian.js'].lineData[1370] = 0;
  _$jscoverage['/gregorian.js'].lineData[1371] = 0;
  _$jscoverage['/gregorian.js'].lineData[1372] = 0;
  _$jscoverage['/gregorian.js'].lineData[1373] = 0;
  _$jscoverage['/gregorian.js'].lineData[1374] = 0;
  _$jscoverage['/gregorian.js'].lineData[1376] = 0;
  _$jscoverage['/gregorian.js'].lineData[1377] = 0;
  _$jscoverage['/gregorian.js'].lineData[1380] = 0;
  _$jscoverage['/gregorian.js'].lineData[1383] = 0;
  _$jscoverage['/gregorian.js'].lineData[1388] = 0;
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
  _$jscoverage['/gregorian.js'].branchData['289'] = [];
  _$jscoverage['/gregorian.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['294'] = [];
  _$jscoverage['/gregorian.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['312'] = [];
  _$jscoverage['/gregorian.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['325'] = [];
  _$jscoverage['/gregorian.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['343'] = [];
  _$jscoverage['/gregorian.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['357'] = [];
  _$jscoverage['/gregorian.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['372'] = [];
  _$jscoverage['/gregorian.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['376'] = [];
  _$jscoverage['/gregorian.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['394'] = [];
  _$jscoverage['/gregorian.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['418'] = [];
  _$jscoverage['/gregorian.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['427'] = [];
  _$jscoverage['/gregorian.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['432'] = [];
  _$jscoverage['/gregorian.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['432'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['434'] = [];
  _$jscoverage['/gregorian.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['452'] = [];
  _$jscoverage['/gregorian.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['460'] = [];
  _$jscoverage['/gregorian.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['464'] = [];
  _$jscoverage['/gregorian.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['466'] = [];
  _$jscoverage['/gregorian.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['468'] = [];
  _$jscoverage['/gregorian.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['494'] = [];
  _$jscoverage['/gregorian.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['497'] = [];
  _$jscoverage['/gregorian.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['514'] = [];
  _$jscoverage['/gregorian.js'].branchData['514'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['516'] = [];
  _$jscoverage['/gregorian.js'].branchData['516'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['519'] = [];
  _$jscoverage['/gregorian.js'].branchData['519'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['531'] = [];
  _$jscoverage['/gregorian.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['535'] = [];
  _$jscoverage['/gregorian.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['536'] = [];
  _$jscoverage['/gregorian.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['539'] = [];
  _$jscoverage['/gregorian.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['544'] = [];
  _$jscoverage['/gregorian.js'].branchData['544'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['548'] = [];
  _$jscoverage['/gregorian.js'].branchData['548'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['555'] = [];
  _$jscoverage['/gregorian.js'].branchData['555'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['561'] = [];
  _$jscoverage['/gregorian.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['569'] = [];
  _$jscoverage['/gregorian.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['575'] = [];
  _$jscoverage['/gregorian.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['578'] = [];
  _$jscoverage['/gregorian.js'].branchData['578'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['594'] = [];
  _$jscoverage['/gregorian.js'].branchData['594'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['699'] = [];
  _$jscoverage['/gregorian.js'].branchData['699'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['701'] = [];
  _$jscoverage['/gregorian.js'].branchData['701'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['702'] = [];
  _$jscoverage['/gregorian.js'].branchData['702'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['807'] = [];
  _$jscoverage['/gregorian.js'].branchData['807'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['814'] = [];
  _$jscoverage['/gregorian.js'].branchData['814'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['818'] = [];
  _$jscoverage['/gregorian.js'].branchData['818'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['822'] = [];
  _$jscoverage['/gregorian.js'].branchData['822'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['963'] = [];
  _$jscoverage['/gregorian.js'].branchData['963'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1089'] = [];
  _$jscoverage['/gregorian.js'].branchData['1089'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1099'] = [];
  _$jscoverage['/gregorian.js'].branchData['1099'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1121'] = [];
  _$jscoverage['/gregorian.js'].branchData['1121'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1153'] = [];
  _$jscoverage['/gregorian.js'].branchData['1153'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1174'] = [];
  _$jscoverage['/gregorian.js'].branchData['1174'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1175'] = [];
  _$jscoverage['/gregorian.js'].branchData['1175'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1178'] = [];
  _$jscoverage['/gregorian.js'].branchData['1178'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1179'] = [];
  _$jscoverage['/gregorian.js'].branchData['1179'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1195'] = [];
  _$jscoverage['/gregorian.js'].branchData['1195'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1195'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1195'][3] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1208'] = [];
  _$jscoverage['/gregorian.js'].branchData['1208'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1212'] = [];
  _$jscoverage['/gregorian.js'].branchData['1212'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1227'] = [];
  _$jscoverage['/gregorian.js'].branchData['1227'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1244'] = [];
  _$jscoverage['/gregorian.js'].branchData['1244'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1244'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1245'] = [];
  _$jscoverage['/gregorian.js'].branchData['1245'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1245'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1246'] = [];
  _$jscoverage['/gregorian.js'].branchData['1246'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1246'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1247'] = [];
  _$jscoverage['/gregorian.js'].branchData['1247'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1258'] = [];
  _$jscoverage['/gregorian.js'].branchData['1258'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1270'] = [];
  _$jscoverage['/gregorian.js'].branchData['1270'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1326'] = [];
  _$jscoverage['/gregorian.js'].branchData['1326'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1357'] = [];
  _$jscoverage['/gregorian.js'].branchData['1357'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1373'] = [];
  _$jscoverage['/gregorian.js'].branchData['1373'][1] = new BranchData();
}
_$jscoverage['/gregorian.js'].branchData['1373'][1].init(153, 36, 'nDays >= self.minimalDaysInFirstWeek');
function visit86_1373_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1373'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1357'][1].init(220, 21, 'dayOfMonth > monthLen');
function visit85_1357_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1357'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1326'][1].init(14, 1, 'f');
function visit84_1326_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1326'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1270'][1].init(45854, 9, '\'@DEBUG@\'');
function visit83_1270_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1270'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1258'][1].init(18, 19, 'field === undefined');
function visit82_1258_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1258'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1247'][1].init(62, 58, 'this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek');
function visit81_1247_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1247'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1246'][2].init(140, 42, 'this.timezoneOffset === obj.timezoneOffset');
function visit80_1246_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1246'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1246'][1].init(62, 121, 'this.timezoneOffset === obj.timezoneOffset && this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek');
function visit79_1246_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1246'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1245'][2].init(76, 42, 'this.firstDayOfWeek === obj.firstDayOfWeek');
function visit78_1245_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1245'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1245'][1].init(52, 184, 'this.firstDayOfWeek === obj.firstDayOfWeek && this.timezoneOffset === obj.timezoneOffset && this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek');
function visit77_1245_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1245'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1244'][2].init(21, 32, 'this.getTime() === obj.getTime()');
function visit76_1244_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1244'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1244'][1].init(21, 237, 'this.getTime() === obj.getTime() && this.firstDayOfWeek === obj.firstDayOfWeek && this.timezoneOffset === obj.timezoneOffset && this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek');
function visit75_1244_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1244'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1227'][1].init(18, 23, 'this.time === undefined');
function visit74_1227_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1227'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1212'][1].init(782, 10, 'days !== 0');
function visit73_1212_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1212'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1208'][1].init(667, 8, 'days < 0');
function visit72_1208_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1208'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1195'][3].init(58, 38, 'dayOfWeek > GregorianCalendar.SATURDAY');
function visit71_1195_3(result) {
  _$jscoverage['/gregorian.js'].branchData['1195'][3].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1195'][2].init(18, 36, 'dayOfWeek < GregorianCalendar.SUNDAY');
function visit70_1195_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1195'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1195'][1].init(18, 78, 'dayOfWeek < GregorianCalendar.SUNDAY || dayOfWeek > GregorianCalendar.SATURDAY');
function visit69_1195_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1195'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1179'][1].init(22, 16, 'weekOfYear === 1');
function visit68_1179_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1179'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1178'][1].init(331, 36, 'month === GregorianCalendar.DECEMBER');
function visit67_1178_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1178'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1175'][1].init(22, 16, 'weekOfYear >= 52');
function visit66_1175_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1175'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1174'][1].init(178, 35, 'month === GregorianCalendar.JANUARY');
function visit65_1174_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1174'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1153'][1].init(66, 27, 'weekYear === this.get(YEAR)');
function visit64_1153_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1153'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1121'][1].init(18, 54, 'this.minimalDaysInFirstWeek !== minimalDaysInFirstWeek');
function visit63_1121_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1121'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1099'][1].init(18, 38, 'this.firstDayOfWeek !== firstDayOfWeek');
function visit62_1099_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1099'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1089'][1].init(18, 38, 'this.timezoneOffset !== timezoneOffset');
function visit61_1089_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1089'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['963'][1].init(18, 7, '!amount');
function visit60_963_1(result) {
  _$jscoverage['/gregorian.js'].branchData['963'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['822'][1].init(156, 10, 'yearAmount');
function visit59_822_1(result) {
  _$jscoverage['/gregorian.js'].branchData['822'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['818'][1].init(408, 15, 'field === MONTH');
function visit58_818_1(result) {
  _$jscoverage['/gregorian.js'].branchData['818'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['814'][1].init(250, 14, 'field === YEAR');
function visit57_814_1(result) {
  _$jscoverage['/gregorian.js'].branchData['814'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['807'][1].init(18, 7, '!amount');
function visit56_807_1(result) {
  _$jscoverage['/gregorian.js'].branchData['807'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['702'][1].init(34, 7, 'i < len');
function visit55_702_1(result) {
  _$jscoverage['/gregorian.js'].branchData['702'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['701'][1].init(138, 22, 'len < MILLISECONDS + 1');
function visit54_701_1(result) {
  _$jscoverage['/gregorian.js'].branchData['701'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['699'][1].init(59, 9, 'len === 2');
function visit53_699_1(result) {
  _$jscoverage['/gregorian.js'].branchData['699'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['594'][1].init(18, 23, 'this.time === undefined');
function visit52_594_1(result) {
  _$jscoverage['/gregorian.js'].branchData['594'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['578'][1].init(405, 31, 'dayOfWeek !== firstDayOfWeekCfg');
function visit51_578_1(result) {
  _$jscoverage['/gregorian.js'].branchData['578'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['575'][1].init(249, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
function visit50_575_1(result) {
  _$jscoverage['/gregorian.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['569'][1].init(79, 23, 'self.isSet(DAY_OF_YEAR)');
function visit49_569_1(result) {
  _$jscoverage['/gregorian.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['561'][1].init(352, 9, 'dowim < 0');
function visit48_561_1(result) {
  _$jscoverage['/gregorian.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['555'][1].init(66, 32, 'self.isSet(DAY_OF_WEEK_IN_MONTH)');
function visit47_555_1(result) {
  _$jscoverage['/gregorian.js'].branchData['555'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['548'][1].init(437, 31, 'dayOfWeek !== firstDayOfWeekCfg');
function visit46_548_1(result) {
  _$jscoverage['/gregorian.js'].branchData['548'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['544'][1].init(267, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
function visit45_544_1(result) {
  _$jscoverage['/gregorian.js'].branchData['544'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['539'][1].init(26, 25, 'self.isSet(WEEK_OF_MONTH)');
function visit44_539_1(result) {
  _$jscoverage['/gregorian.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['536'][1].init(22, 24, 'self.isSet(DAY_OF_MONTH)');
function visit43_536_1(result) {
  _$jscoverage['/gregorian.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['535'][1].init(1070, 17, 'self.isSet(MONTH)');
function visit42_535_1(result) {
  _$jscoverage['/gregorian.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['531'][1].init(959, 23, 'self.isSet(DAY_OF_WEEK)');
function visit41_531_1(result) {
  _$jscoverage['/gregorian.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['519'][1].init(211, 33, 'month < GregorianCalendar.JANUARY');
function visit40_519_1(result) {
  _$jscoverage['/gregorian.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['516'][1].init(62, 34, 'month > GregorianCalendar.DECEMBER');
function visit39_516_1(result) {
  _$jscoverage['/gregorian.js'].branchData['516'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['514'][1].init(247, 17, 'self.isSet(MONTH)');
function visit38_514_1(result) {
  _$jscoverage['/gregorian.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['497'][1].init(114, 20, '!this.fieldsComputed');
function visit37_497_1(result) {
  _$jscoverage['/gregorian.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['494'][1].init(18, 23, 'this.time === undefined');
function visit36_494_1(result) {
  _$jscoverage['/gregorian.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['468'][1].init(572, 25, 'fields[MILLISECONDS] || 0');
function visit35_468_1(result) {
  _$jscoverage['/gregorian.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['466'][1].init(492, 20, 'fields[SECONDS] || 0');
function visit34_466_1(result) {
  _$jscoverage['/gregorian.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['464'][1].init(415, 19, 'fields[MINUTE] || 0');
function visit33_464_1(result) {
  _$jscoverage['/gregorian.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['460'][1].init(266, 23, 'this.isSet(HOUR_OF_DAY)');
function visit32_460_1(result) {
  _$jscoverage['/gregorian.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['452'][1].init(18, 17, '!this.isSet(YEAR)');
function visit31_452_1(result) {
  _$jscoverage['/gregorian.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['434'][1].init(120, 29, 'fixedDate >= (nextJan1st - 7)');
function visit30_434_1(result) {
  _$jscoverage['/gregorian.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['432'][2].init(273, 36, 'nDays >= this.minimalDaysInFirstWeek');
function visit29_432_2(result) {
  _$jscoverage['/gregorian.js'].branchData['432'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['432'][1].init(273, 150, 'nDays >= this.minimalDaysInFirstWeek && fixedDate >= (nextJan1st - 7)');
function visit28_432_1(result) {
  _$jscoverage['/gregorian.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['427'][1].init(2485, 16, 'weekOfYear >= 52');
function visit27_427_1(result) {
  _$jscoverage['/gregorian.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['418'][1].init(2014, 16, 'weekOfYear === 0');
function visit26_418_1(result) {
  _$jscoverage['/gregorian.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['394'][1].init(988, 15, 'timeOfDay !== 0');
function visit25_394_1(result) {
  _$jscoverage['/gregorian.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['376'][1].init(25, 13, 'timeOfDay < 0');
function visit24_376_1(result) {
  _$jscoverage['/gregorian.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['372'][1].init(329, 20, 'timeOfDay >= ONE_DAY');
function visit23_372_1(result) {
  _$jscoverage['/gregorian.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['357'][1].init(21, 32, 'this.fields[field] !== undefined');
function visit22_357_1(result) {
  _$jscoverage['/gregorian.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['343'][1].init(1258, 19, 'value === undefined');
function visit21_343_1(result) {
  _$jscoverage['/gregorian.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['325'][1].init(207, 11, 'value === 1');
function visit20_325_1(result) {
  _$jscoverage['/gregorian.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['312'][1].init(18, 31, 'MAX_VALUES[field] !== undefined');
function visit19_312_1(result) {
  _$jscoverage['/gregorian.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['294'][1].init(169, 23, 'field === WEEK_OF_MONTH');
function visit18_294_1(result) {
  _$jscoverage['/gregorian.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['289'][1].init(18, 31, 'MIN_VALUES[field] !== undefined');
function visit17_289_1(result) {
  _$jscoverage['/gregorian.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['88'][1].init(1262, 21, 'arguments.length >= 3');
function visit16_88_1(result) {
  _$jscoverage['/gregorian.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['70'][1].init(728, 39, 'timezoneOffset || locale.timezoneOffset');
function visit15_70_1(result) {
  _$jscoverage['/gregorian.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['53'][1].init(307, 23, 'locale || defaultLocale');
function visit14_53_1(result) {
  _$jscoverage['/gregorian.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['49'][1].init(212, 16, 'args.length >= 3');
function visit13_49_1(result) {
  _$jscoverage['/gregorian.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['46'][1].init(62, 34, 'typeof timezoneOffset === \'object\'');
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
    if (visit12_46_1(typeof timezoneOffset === 'object')) {
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
  _$jscoverage['/gregorian.js'].lineData[183]++;
  var fields = ['', 'Year', 'Month', 'DayOfMonth', 'HourOfDay', 'Minutes', 'Seconds', 'Milliseconds', 'WeekOfYear', 'WeekOfMonth', 'DayOfYear', 'DayOfWeek', 'DayOfWeekInMonth'];
  _$jscoverage['/gregorian.js'].lineData[191]++;
  var YEAR = GregorianCalendar.YEAR;
  _$jscoverage['/gregorian.js'].lineData[192]++;
  var MONTH = GregorianCalendar.MONTH;
  _$jscoverage['/gregorian.js'].lineData[193]++;
  var DAY_OF_MONTH = GregorianCalendar.DAY_OF_MONTH;
  _$jscoverage['/gregorian.js'].lineData[194]++;
  var HOUR_OF_DAY = GregorianCalendar.HOUR_OF_DAY;
  _$jscoverage['/gregorian.js'].lineData[195]++;
  var MINUTE = GregorianCalendar.MINUTES;
  _$jscoverage['/gregorian.js'].lineData[196]++;
  var SECONDS = GregorianCalendar.SECONDS;
  _$jscoverage['/gregorian.js'].lineData[198]++;
  var MILLISECONDS = GregorianCalendar.MILLISECONDS;
  _$jscoverage['/gregorian.js'].lineData[199]++;
  var DAY_OF_WEEK_IN_MONTH = GregorianCalendar.DAY_OF_WEEK_IN_MONTH;
  _$jscoverage['/gregorian.js'].lineData[200]++;
  var DAY_OF_YEAR = GregorianCalendar.DAY_OF_YEAR;
  _$jscoverage['/gregorian.js'].lineData[201]++;
  var DAY_OF_WEEK = GregorianCalendar.DAY_OF_WEEK;
  _$jscoverage['/gregorian.js'].lineData[203]++;
  var WEEK_OF_MONTH = GregorianCalendar.WEEK_OF_MONTH;
  _$jscoverage['/gregorian.js'].lineData[204]++;
  var WEEK_OF_YEAR = GregorianCalendar.WEEK_OF_YEAR;
  _$jscoverage['/gregorian.js'].lineData[206]++;
  var MONTH_LENGTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  _$jscoverage['/gregorian.js'].lineData[207]++;
  var LEAP_MONTH_LENGTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  _$jscoverage['/gregorian.js'].lineData[209]++;
  var ONE_SECOND = 1000;
  _$jscoverage['/gregorian.js'].lineData[210]++;
  var ONE_MINUTE = 60 * ONE_SECOND;
  _$jscoverage['/gregorian.js'].lineData[211]++;
  var ONE_HOUR = 60 * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[212]++;
  var ONE_DAY = 24 * ONE_HOUR;
  _$jscoverage['/gregorian.js'].lineData[213]++;
  var ONE_WEEK = ONE_DAY * 7;
  _$jscoverage['/gregorian.js'].lineData[215]++;
  var EPOCH_OFFSET = 719163;
  _$jscoverage['/gregorian.js'].lineData[217]++;
  var mod = Utils.mod, isLeapYear = Utils.isLeapYear, floorDivide = Math.floor;
  _$jscoverage['/gregorian.js'].lineData[221]++;
  var MIN_VALUES = [undefined, 1, GregorianCalendar.JANUARY, 1, 0, 0, 0, 0, 1, undefined, 1, GregorianCalendar.SUNDAY, 1];
  _$jscoverage['/gregorian.js'].lineData[239]++;
  var MAX_VALUES = [undefined, 292278994, GregorianCalendar.DECEMBER, undefined, 23, 59, 59, 999, undefined, undefined, undefined, GregorianCalendar.SATURDAY, undefined];
  _$jscoverage['/gregorian.js'].lineData[255]++;
  GregorianCalendar.prototype = {
  constructor: GregorianCalendar, 
  isLeapYear: function() {
  _$jscoverage['/gregorian.js'].functionData[2]++;
  _$jscoverage['/gregorian.js'].lineData[267]++;
  return isLeapYear(this.getYear());
}, 
  getLocale: function() {
  _$jscoverage['/gregorian.js'].functionData[3]++;
  _$jscoverage['/gregorian.js'].lineData[275]++;
  return this.locale;
}, 
  getActualMinimum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[4]++;
  _$jscoverage['/gregorian.js'].lineData[289]++;
  if (visit17_289_1(MIN_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[290]++;
    return MIN_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[293]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[294]++;
  if (visit18_294_1(field === WEEK_OF_MONTH)) {
    _$jscoverage['/gregorian.js'].lineData[295]++;
    var cal = new GregorianCalendar(fields[YEAR], fields[MONTH], 1);
    _$jscoverage['/gregorian.js'].lineData[296]++;
    return cal.get(WEEK_OF_MONTH);
  }
  _$jscoverage['/gregorian.js'].lineData[299]++;
  throw new Error('minimum value not defined!');
}, 
  getActualMaximum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[5]++;
  _$jscoverage['/gregorian.js'].lineData[312]++;
  if (visit19_312_1(MAX_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[313]++;
    return MAX_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[315]++;
  var value, fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[317]++;
  switch (field) {
    case DAY_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[319]++;
      value = getMonthLength(fields[YEAR], fields[MONTH]);
      _$jscoverage['/gregorian.js'].lineData[320]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[323]++;
      var endOfYear = new GregorianCalendar(fields[YEAR], GregorianCalendar.DECEMBER, 31);
      _$jscoverage['/gregorian.js'].lineData[324]++;
      value = endOfYear.get(WEEK_OF_YEAR);
      _$jscoverage['/gregorian.js'].lineData[325]++;
      if (visit20_325_1(value === 1)) {
        _$jscoverage['/gregorian.js'].lineData[326]++;
        value = 52;
      }
      _$jscoverage['/gregorian.js'].lineData[328]++;
      break;
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[331]++;
      var endOfMonth = new GregorianCalendar(fields[YEAR], fields[MONTH], getMonthLength(fields[YEAR], fields[MONTH]));
      _$jscoverage['/gregorian.js'].lineData[332]++;
      value = endOfMonth.get(WEEK_OF_MONTH);
      _$jscoverage['/gregorian.js'].lineData[333]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[336]++;
      value = getYearLength(fields[YEAR]);
      _$jscoverage['/gregorian.js'].lineData[337]++;
      break;
    case DAY_OF_WEEK_IN_MONTH:
      _$jscoverage['/gregorian.js'].lineData[340]++;
      value = toInt((getMonthLength(fields[YEAR], fields[MONTH]) - 1) / 7) + 1;
      _$jscoverage['/gregorian.js'].lineData[341]++;
      break;
  }
  _$jscoverage['/gregorian.js'].lineData[343]++;
  if (visit21_343_1(value === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[344]++;
    throw new Error('maximum value not defined!');
  }
  _$jscoverage['/gregorian.js'].lineData[346]++;
  return value;
}, 
  isSet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[6]++;
  _$jscoverage['/gregorian.js'].lineData[357]++;
  return visit22_357_1(this.fields[field] !== undefined);
}, 
  computeFields: function() {
  _$jscoverage['/gregorian.js'].functionData[7]++;
  _$jscoverage['/gregorian.js'].lineData[366]++;
  var time = this.time;
  _$jscoverage['/gregorian.js'].lineData[367]++;
  var timezoneOffset = this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[368]++;
  var fixedDate = toInt(timezoneOffset / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[369]++;
  var timeOfDay = timezoneOffset % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[370]++;
  fixedDate += toInt(time / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[371]++;
  timeOfDay += time % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[372]++;
  if (visit23_372_1(timeOfDay >= ONE_DAY)) {
    _$jscoverage['/gregorian.js'].lineData[373]++;
    timeOfDay -= ONE_DAY;
    _$jscoverage['/gregorian.js'].lineData[374]++;
    fixedDate++;
  } else {
    _$jscoverage['/gregorian.js'].lineData[376]++;
    while (visit24_376_1(timeOfDay < 0)) {
      _$jscoverage['/gregorian.js'].lineData[377]++;
      timeOfDay += ONE_DAY;
      _$jscoverage['/gregorian.js'].lineData[378]++;
      fixedDate--;
    }
  }
  _$jscoverage['/gregorian.js'].lineData[382]++;
  fixedDate += EPOCH_OFFSET;
  _$jscoverage['/gregorian.js'].lineData[384]++;
  var date = Utils.getGregorianDateFromFixedDate(fixedDate);
  _$jscoverage['/gregorian.js'].lineData[386]++;
  var year = date.year;
  _$jscoverage['/gregorian.js'].lineData[388]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[389]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[390]++;
  fields[MONTH] = date.month;
  _$jscoverage['/gregorian.js'].lineData[391]++;
  fields[DAY_OF_MONTH] = date.dayOfMonth;
  _$jscoverage['/gregorian.js'].lineData[392]++;
  fields[DAY_OF_WEEK] = date.dayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[394]++;
  if (visit25_394_1(timeOfDay !== 0)) {
    _$jscoverage['/gregorian.js'].lineData[395]++;
    fields[HOUR_OF_DAY] = toInt(timeOfDay / ONE_HOUR);
    _$jscoverage['/gregorian.js'].lineData[396]++;
    var r = timeOfDay % ONE_HOUR;
    _$jscoverage['/gregorian.js'].lineData[397]++;
    fields[MINUTE] = toInt(r / ONE_MINUTE);
    _$jscoverage['/gregorian.js'].lineData[398]++;
    r %= ONE_MINUTE;
    _$jscoverage['/gregorian.js'].lineData[399]++;
    fields[SECONDS] = toInt(r / ONE_SECOND);
    _$jscoverage['/gregorian.js'].lineData[400]++;
    fields[MILLISECONDS] = r % ONE_SECOND;
  } else {
    _$jscoverage['/gregorian.js'].lineData[402]++;
    fields[HOUR_OF_DAY] = fields[MINUTE] = fields[SECONDS] = fields[MILLISECONDS] = 0;
  }
  _$jscoverage['/gregorian.js'].lineData[408]++;
  var fixedDateJan1 = Utils.getFixedDate(year, GregorianCalendar.JANUARY, 1);
  _$jscoverage['/gregorian.js'].lineData[409]++;
  var dayOfYear = fixedDate - fixedDateJan1 + 1;
  _$jscoverage['/gregorian.js'].lineData[410]++;
  var fixDateMonth1 = fixedDate - date.dayOfMonth + 1;
  _$jscoverage['/gregorian.js'].lineData[412]++;
  fields[DAY_OF_YEAR] = dayOfYear;
  _$jscoverage['/gregorian.js'].lineData[413]++;
  fields[DAY_OF_WEEK_IN_MONTH] = toInt((date.dayOfMonth - 1) / 7) + 1;
  _$jscoverage['/gregorian.js'].lineData[415]++;
  var weekOfYear = getWeekNumber(this, fixedDateJan1, fixedDate);
  _$jscoverage['/gregorian.js'].lineData[418]++;
  if (visit26_418_1(weekOfYear === 0)) {
    _$jscoverage['/gregorian.js'].lineData[422]++;
    var fixedDec31 = fixedDateJan1 - 1;
    _$jscoverage['/gregorian.js'].lineData[423]++;
    var prevJan1 = fixedDateJan1 - getYearLength(year - 1);
    _$jscoverage['/gregorian.js'].lineData[424]++;
    weekOfYear = getWeekNumber(this, prevJan1, fixedDec31);
  } else {
    _$jscoverage['/gregorian.js'].lineData[427]++;
    if (visit27_427_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[428]++;
      var nextJan1 = fixedDateJan1 + getYearLength(year);
      _$jscoverage['/gregorian.js'].lineData[429]++;
      var nextJan1st = getDayOfWeekDateOnOrBefore(nextJan1 + 6, this.firstDayOfWeek);
      _$jscoverage['/gregorian.js'].lineData[430]++;
      var nDays = nextJan1st - nextJan1;
      _$jscoverage['/gregorian.js'].lineData[432]++;
      if (visit28_432_1(visit29_432_2(nDays >= this.minimalDaysInFirstWeek) && visit30_434_1(fixedDate >= (nextJan1st - 7)))) {
        _$jscoverage['/gregorian.js'].lineData[436]++;
        weekOfYear = 1;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[440]++;
  fields[WEEK_OF_YEAR] = weekOfYear;
  _$jscoverage['/gregorian.js'].lineData[441]++;
  fields[WEEK_OF_MONTH] = getWeekNumber(this, fixDateMonth1, fixedDate);
  _$jscoverage['/gregorian.js'].lineData[443]++;
  this.fieldsComputed = true;
}, 
  computeTime: function() {
  _$jscoverage['/gregorian.js'].functionData[8]++;
  _$jscoverage['/gregorian.js'].lineData[452]++;
  if (visit31_452_1(!this.isSet(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[453]++;
    throw new Error('year must be set for KISSY GregorianCalendar');
  }
  _$jscoverage['/gregorian.js'].lineData[456]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[458]++;
  var year = fields[YEAR];
  _$jscoverage['/gregorian.js'].lineData[459]++;
  var timeOfDay = 0;
  _$jscoverage['/gregorian.js'].lineData[460]++;
  if (visit32_460_1(this.isSet(HOUR_OF_DAY))) {
    _$jscoverage['/gregorian.js'].lineData[461]++;
    timeOfDay += fields[HOUR_OF_DAY];
  }
  _$jscoverage['/gregorian.js'].lineData[463]++;
  timeOfDay *= 60;
  _$jscoverage['/gregorian.js'].lineData[464]++;
  timeOfDay += visit33_464_1(fields[MINUTE] || 0);
  _$jscoverage['/gregorian.js'].lineData[465]++;
  timeOfDay *= 60;
  _$jscoverage['/gregorian.js'].lineData[466]++;
  timeOfDay += visit34_466_1(fields[SECONDS] || 0);
  _$jscoverage['/gregorian.js'].lineData[467]++;
  timeOfDay *= 1000;
  _$jscoverage['/gregorian.js'].lineData[468]++;
  timeOfDay += visit35_468_1(fields[MILLISECONDS] || 0);
  _$jscoverage['/gregorian.js'].lineData[470]++;
  var fixedDate = 0;
  _$jscoverage['/gregorian.js'].lineData[472]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[474]++;
  fixedDate = fixedDate + this.getFixedDate();
  _$jscoverage['/gregorian.js'].lineData[477]++;
  var millis = (fixedDate - EPOCH_OFFSET) * ONE_DAY + timeOfDay;
  _$jscoverage['/gregorian.js'].lineData[479]++;
  millis -= this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[481]++;
  this.time = millis;
  _$jscoverage['/gregorian.js'].lineData[483]++;
  this.computeFields();
}, 
  complete: function() {
  _$jscoverage['/gregorian.js'].functionData[9]++;
  _$jscoverage['/gregorian.js'].lineData[494]++;
  if (visit36_494_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[495]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[497]++;
  if (visit37_497_1(!this.fieldsComputed)) {
    _$jscoverage['/gregorian.js'].lineData[498]++;
    this.computeFields();
  }
}, 
  getFixedDate: function() {
  _$jscoverage['/gregorian.js'].functionData[10]++;
  _$jscoverage['/gregorian.js'].lineData[504]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[506]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[508]++;
  var firstDayOfWeekCfg = self.firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[510]++;
  var year = fields[YEAR];
  _$jscoverage['/gregorian.js'].lineData[512]++;
  var month = GregorianCalendar.JANUARY;
  _$jscoverage['/gregorian.js'].lineData[514]++;
  if (visit38_514_1(self.isSet(MONTH))) {
    _$jscoverage['/gregorian.js'].lineData[515]++;
    month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[516]++;
    if (visit39_516_1(month > GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[517]++;
      year += toInt(month / 12);
      _$jscoverage['/gregorian.js'].lineData[518]++;
      month %= 12;
    } else {
      _$jscoverage['/gregorian.js'].lineData[519]++;
      if (visit40_519_1(month < GregorianCalendar.JANUARY)) {
        _$jscoverage['/gregorian.js'].lineData[520]++;
        year += floorDivide(month / 12);
        _$jscoverage['/gregorian.js'].lineData[521]++;
        month = mod(month, 12);
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[527]++;
  var fixedDate = Utils.getFixedDate(year, month, 1);
  _$jscoverage['/gregorian.js'].lineData[528]++;
  var firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[529]++;
  var dayOfWeek = self.firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[531]++;
  if (visit41_531_1(self.isSet(DAY_OF_WEEK))) {
    _$jscoverage['/gregorian.js'].lineData[532]++;
    dayOfWeek = fields[DAY_OF_WEEK];
  }
  _$jscoverage['/gregorian.js'].lineData[535]++;
  if (visit42_535_1(self.isSet(MONTH))) {
    _$jscoverage['/gregorian.js'].lineData[536]++;
    if (visit43_536_1(self.isSet(DAY_OF_MONTH))) {
      _$jscoverage['/gregorian.js'].lineData[537]++;
      fixedDate += fields[DAY_OF_MONTH] - 1;
    } else {
      _$jscoverage['/gregorian.js'].lineData[539]++;
      if (visit44_539_1(self.isSet(WEEK_OF_MONTH))) {
        _$jscoverage['/gregorian.js'].lineData[540]++;
        firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
        _$jscoverage['/gregorian.js'].lineData[544]++;
        if (visit45_544_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
          _$jscoverage['/gregorian.js'].lineData[545]++;
          firstDayOfWeek -= 7;
        }
        _$jscoverage['/gregorian.js'].lineData[548]++;
        if (visit46_548_1(dayOfWeek !== firstDayOfWeekCfg)) {
          _$jscoverage['/gregorian.js'].lineData[549]++;
          firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
        }
        _$jscoverage['/gregorian.js'].lineData[552]++;
        fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_MONTH] - 1);
      } else {
        _$jscoverage['/gregorian.js'].lineData[554]++;
        var dowim;
        _$jscoverage['/gregorian.js'].lineData[555]++;
        if (visit47_555_1(self.isSet(DAY_OF_WEEK_IN_MONTH))) {
          _$jscoverage['/gregorian.js'].lineData[556]++;
          dowim = fields[DAY_OF_WEEK_IN_MONTH];
        } else {
          _$jscoverage['/gregorian.js'].lineData[558]++;
          dowim = 1;
        }
        _$jscoverage['/gregorian.js'].lineData[560]++;
        var lastDate = (7 * dowim);
        _$jscoverage['/gregorian.js'].lineData[561]++;
        if (visit48_561_1(dowim < 0)) {
          _$jscoverage['/gregorian.js'].lineData[562]++;
          lastDate = getMonthLength(year, month) + (7 * (dowim + 1));
        }
        _$jscoverage['/gregorian.js'].lineData[564]++;
        fixedDate = getDayOfWeekDateOnOrBefore(fixedDate + lastDate - 1, dayOfWeek);
      }
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[569]++;
    if (visit49_569_1(self.isSet(DAY_OF_YEAR))) {
      _$jscoverage['/gregorian.js'].lineData[570]++;
      fixedDate += fields[DAY_OF_YEAR] - 1;
    } else {
      _$jscoverage['/gregorian.js'].lineData[572]++;
      firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
      _$jscoverage['/gregorian.js'].lineData[575]++;
      if (visit50_575_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
        _$jscoverage['/gregorian.js'].lineData[576]++;
        firstDayOfWeek -= 7;
      }
      _$jscoverage['/gregorian.js'].lineData[578]++;
      if (visit51_578_1(dayOfWeek !== firstDayOfWeekCfg)) {
        _$jscoverage['/gregorian.js'].lineData[579]++;
        firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
      }
      _$jscoverage['/gregorian.js'].lineData[581]++;
      fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_YEAR] - 1);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[585]++;
  return fixedDate;
}, 
  getTime: function() {
  _$jscoverage['/gregorian.js'].functionData[11]++;
  _$jscoverage['/gregorian.js'].lineData[594]++;
  if (visit52_594_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[595]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[597]++;
  return this.time;
}, 
  setTime: function(time) {
  _$jscoverage['/gregorian.js'].functionData[12]++;
  _$jscoverage['/gregorian.js'].lineData[605]++;
  this.time = time;
  _$jscoverage['/gregorian.js'].lineData[606]++;
  this.fieldsComputed = false;
  _$jscoverage['/gregorian.js'].lineData[607]++;
  this.complete();
}, 
  get: function(field) {
  _$jscoverage['/gregorian.js'].functionData[13]++;
  _$jscoverage['/gregorian.js'].lineData[616]++;
  this.complete();
  _$jscoverage['/gregorian.js'].lineData[617]++;
  return this.fields[field];
}, 
  set: function(field, v) {
  _$jscoverage['/gregorian.js'].functionData[14]++;
  _$jscoverage['/gregorian.js'].lineData[698]++;
  var len = arguments.length;
  _$jscoverage['/gregorian.js'].lineData[699]++;
  if (visit53_699_1(len === 2)) {
    _$jscoverage['/gregorian.js'].lineData[700]++;
    this.fields[field] = v;
  } else {
    _$jscoverage['/gregorian.js'].lineData[701]++;
    if (visit54_701_1(len < MILLISECONDS + 1)) {
      _$jscoverage['/gregorian.js'].lineData[702]++;
      for (var i = 0; visit55_702_1(i < len); i++) {
        _$jscoverage['/gregorian.js'].lineData[703]++;
        this.fields[YEAR + i] = arguments[i];
      }
    } else {
      _$jscoverage['/gregorian.js'].lineData[706]++;
      throw new Error('illegal arguments for KISSY GregorianCalendar set');
    }
  }
  _$jscoverage['/gregorian.js'].lineData[708]++;
  this.time = undefined;
}, 
  add: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[15]++;
  _$jscoverage['/gregorian.js'].lineData[807]++;
  if (visit56_807_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[808]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[810]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[811]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[813]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[814]++;
  if (visit57_814_1(field === YEAR)) {
    _$jscoverage['/gregorian.js'].lineData[815]++;
    value += amount;
    _$jscoverage['/gregorian.js'].lineData[816]++;
    self.set(YEAR, value);
    _$jscoverage['/gregorian.js'].lineData[817]++;
    adjustDayOfMonth(self);
  } else {
    _$jscoverage['/gregorian.js'].lineData[818]++;
    if (visit58_818_1(field === MONTH)) {
      _$jscoverage['/gregorian.js'].lineData[819]++;
      value += amount;
      _$jscoverage['/gregorian.js'].lineData[820]++;
      var yearAmount = floorDivide(value / 12);
      _$jscoverage['/gregorian.js'].lineData[821]++;
      value = mod(value, 12);
      _$jscoverage['/gregorian.js'].lineData[822]++;
      if (visit59_822_1(yearAmount)) {
        _$jscoverage['/gregorian.js'].lineData[823]++;
        self.set(YEAR, fields[YEAR] + yearAmount);
      }
      _$jscoverage['/gregorian.js'].lineData[825]++;
      self.set(MONTH, value);
      _$jscoverage['/gregorian.js'].lineData[826]++;
      adjustDayOfMonth(self);
    } else {
      _$jscoverage['/gregorian.js'].lineData[828]++;
      switch (field) {
        case HOUR_OF_DAY:
          _$jscoverage['/gregorian.js'].lineData[830]++;
          amount *= ONE_HOUR;
          _$jscoverage['/gregorian.js'].lineData[831]++;
          break;
        case MINUTE:
          _$jscoverage['/gregorian.js'].lineData[833]++;
          amount *= ONE_MINUTE;
          _$jscoverage['/gregorian.js'].lineData[834]++;
          break;
        case SECONDS:
          _$jscoverage['/gregorian.js'].lineData[836]++;
          amount *= ONE_SECOND;
          _$jscoverage['/gregorian.js'].lineData[837]++;
          break;
        case MILLISECONDS:
          _$jscoverage['/gregorian.js'].lineData[839]++;
          break;
        case WEEK_OF_MONTH:
        case WEEK_OF_YEAR:
        case DAY_OF_WEEK_IN_MONTH:
          _$jscoverage['/gregorian.js'].lineData[843]++;
          amount *= ONE_WEEK;
          _$jscoverage['/gregorian.js'].lineData[844]++;
          break;
        case DAY_OF_WEEK:
        case DAY_OF_YEAR:
        case DAY_OF_MONTH:
          _$jscoverage['/gregorian.js'].lineData[848]++;
          amount *= ONE_DAY;
          _$jscoverage['/gregorian.js'].lineData[849]++;
          break;
        default:
          _$jscoverage['/gregorian.js'].lineData[851]++;
          throw new Error('illegal field for add');
      }
      _$jscoverage['/gregorian.js'].lineData[853]++;
      self.setTime(self.time + amount);
    }
  }
}, 
  getRolledValue: function(value, amount, min, max) {
  _$jscoverage['/gregorian.js'].functionData[16]++;
  _$jscoverage['/gregorian.js'].lineData[935]++;
  var diff = value - min;
  _$jscoverage['/gregorian.js'].lineData[936]++;
  var range = max - min + 1;
  _$jscoverage['/gregorian.js'].lineData[937]++;
  amount %= range;
  _$jscoverage['/gregorian.js'].lineData[938]++;
  return min + (diff + amount + range) % range;
}, 
  roll: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[17]++;
  _$jscoverage['/gregorian.js'].lineData[963]++;
  if (visit60_963_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[964]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[966]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[968]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[969]++;
  var min = self.getActualMinimum(field);
  _$jscoverage['/gregorian.js'].lineData[970]++;
  var max = self.getActualMaximum(field);
  _$jscoverage['/gregorian.js'].lineData[971]++;
  value = self.getRolledValue(value, amount, min, max);
  _$jscoverage['/gregorian.js'].lineData[973]++;
  self.set(field, value);
  _$jscoverage['/gregorian.js'].lineData[976]++;
  switch (field) {
    case MONTH:
      _$jscoverage['/gregorian.js'].lineData[978]++;
      adjustDayOfMonth(self);
      _$jscoverage['/gregorian.js'].lineData[979]++;
      break;
    default:
      _$jscoverage['/gregorian.js'].lineData[982]++;
      self.updateFieldsBySet(field);
      _$jscoverage['/gregorian.js'].lineData[983]++;
      break;
  }
}, 
  updateFieldsBySet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[18]++;
  _$jscoverage['/gregorian.js'].lineData[1059]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1060]++;
  switch (field) {
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[1062]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1063]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1065]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1066]++;
      break;
    case DAY_OF_WEEK:
      _$jscoverage['/gregorian.js'].lineData[1068]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1069]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1071]++;
      fields[DAY_OF_YEAR] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1072]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1073]++;
      break;
  }
}, 
  getTimezoneOffset: function() {
  _$jscoverage['/gregorian.js'].functionData[19]++;
  _$jscoverage['/gregorian.js'].lineData[1082]++;
  return this.timezoneOffset;
}, 
  setTimezoneOffset: function(timezoneOffset) {
  _$jscoverage['/gregorian.js'].functionData[20]++;
  _$jscoverage['/gregorian.js'].lineData[1089]++;
  if (visit61_1089_1(this.timezoneOffset !== timezoneOffset)) {
    _$jscoverage['/gregorian.js'].lineData[1090]++;
    this.fieldsComputed = undefined;
    _$jscoverage['/gregorian.js'].lineData[1091]++;
    this.timezoneOffset = timezoneOffset;
  }
}, 
  setFirstDayOfWeek: function(firstDayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[21]++;
  _$jscoverage['/gregorian.js'].lineData[1099]++;
  if (visit62_1099_1(this.firstDayOfWeek !== firstDayOfWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1100]++;
    this.firstDayOfWeek = firstDayOfWeek;
    _$jscoverage['/gregorian.js'].lineData[1101]++;
    this.fieldsComputed = false;
  }
}, 
  getFirstDayOfWeek: function() {
  _$jscoverage['/gregorian.js'].functionData[22]++;
  _$jscoverage['/gregorian.js'].lineData[1110]++;
  return this.firstDayOfWeek;
}, 
  setMinimalDaysInFirstWeek: function(minimalDaysInFirstWeek) {
  _$jscoverage['/gregorian.js'].functionData[23]++;
  _$jscoverage['/gregorian.js'].lineData[1121]++;
  if (visit63_1121_1(this.minimalDaysInFirstWeek !== minimalDaysInFirstWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1122]++;
    this.minimalDaysInFirstWeek = minimalDaysInFirstWeek;
    _$jscoverage['/gregorian.js'].lineData[1123]++;
    this.fieldsComputed = false;
  }
}, 
  getMinimalDaysInFirstWeek: function() {
  _$jscoverage['/gregorian.js'].functionData[24]++;
  _$jscoverage['/gregorian.js'].lineData[1135]++;
  return this.minimalDaysInFirstWeek;
}, 
  getWeeksInWeekYear: function() {
  _$jscoverage['/gregorian.js'].functionData[25]++;
  _$jscoverage['/gregorian.js'].lineData[1152]++;
  var weekYear = this.getWeekYear();
  _$jscoverage['/gregorian.js'].lineData[1153]++;
  if (visit64_1153_1(weekYear === this.get(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[1154]++;
    return this.getActualMaximum(WEEK_OF_YEAR);
  }
  _$jscoverage['/gregorian.js'].lineData[1157]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1158]++;
  gc.setWeekDate(weekYear, 2, this.get(DAY_OF_WEEK));
  _$jscoverage['/gregorian.js'].lineData[1159]++;
  return gc.getActualMaximum(WEEK_OF_YEAR);
}, 
  getWeekYear: function() {
  _$jscoverage['/gregorian.js'].functionData[26]++;
  _$jscoverage['/gregorian.js'].lineData[1171]++;
  var year = this.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1172]++;
  var weekOfYear = this.get(WEEK_OF_YEAR);
  _$jscoverage['/gregorian.js'].lineData[1173]++;
  var month = this.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1174]++;
  if (visit65_1174_1(month === GregorianCalendar.JANUARY)) {
    _$jscoverage['/gregorian.js'].lineData[1175]++;
    if (visit66_1175_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[1176]++;
      --year;
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[1178]++;
    if (visit67_1178_1(month === GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[1179]++;
      if (visit68_1179_1(weekOfYear === 1)) {
        _$jscoverage['/gregorian.js'].lineData[1180]++;
        ++year;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1183]++;
  return year;
}, 
  setWeekDate: function(weekYear, weekOfYear, dayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[27]++;
  _$jscoverage['/gregorian.js'].lineData[1195]++;
  if (visit69_1195_1(visit70_1195_2(dayOfWeek < GregorianCalendar.SUNDAY) || visit71_1195_3(dayOfWeek > GregorianCalendar.SATURDAY))) {
    _$jscoverage['/gregorian.js'].lineData[1196]++;
    throw new Error('invalid dayOfWeek: ' + dayOfWeek);
  }
  _$jscoverage['/gregorian.js'].lineData[1198]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1201]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1202]++;
  gc.clear();
  _$jscoverage['/gregorian.js'].lineData[1203]++;
  gc.setTimezoneOffset(0);
  _$jscoverage['/gregorian.js'].lineData[1204]++;
  gc.set(YEAR, weekYear);
  _$jscoverage['/gregorian.js'].lineData[1205]++;
  gc.set(WEEK_OF_YEAR, 1);
  _$jscoverage['/gregorian.js'].lineData[1206]++;
  gc.set(DAY_OF_WEEK, this.getFirstDayOfWeek());
  _$jscoverage['/gregorian.js'].lineData[1207]++;
  var days = dayOfWeek - this.getFirstDayOfWeek();
  _$jscoverage['/gregorian.js'].lineData[1208]++;
  if (visit72_1208_1(days < 0)) {
    _$jscoverage['/gregorian.js'].lineData[1209]++;
    days += 7;
  }
  _$jscoverage['/gregorian.js'].lineData[1211]++;
  days += 7 * (weekOfYear - 1);
  _$jscoverage['/gregorian.js'].lineData[1212]++;
  if (visit73_1212_1(days !== 0)) {
    _$jscoverage['/gregorian.js'].lineData[1213]++;
    gc.add(DAY_OF_YEAR, days);
  } else {
    _$jscoverage['/gregorian.js'].lineData[1215]++;
    gc.complete();
  }
  _$jscoverage['/gregorian.js'].lineData[1217]++;
  fields[YEAR] = gc.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1218]++;
  fields[MONTH] = gc.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1219]++;
  fields[DAY_OF_MONTH] = gc.get(DAY_OF_MONTH);
  _$jscoverage['/gregorian.js'].lineData[1220]++;
  this.complete();
}, 
  clone: function() {
  _$jscoverage['/gregorian.js'].functionData[28]++;
  _$jscoverage['/gregorian.js'].lineData[1227]++;
  if (visit74_1227_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1228]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[1230]++;
  var cal = new GregorianCalendar(this.timezoneOffset, this.locale);
  _$jscoverage['/gregorian.js'].lineData[1231]++;
  cal.setTime(this.time);
  _$jscoverage['/gregorian.js'].lineData[1232]++;
  return cal;
}, 
  equals: function(obj) {
  _$jscoverage['/gregorian.js'].functionData[29]++;
  _$jscoverage['/gregorian.js'].lineData[1244]++;
  return visit75_1244_1(visit76_1244_2(this.getTime() === obj.getTime()) && visit77_1245_1(visit78_1245_2(this.firstDayOfWeek === obj.firstDayOfWeek) && visit79_1246_1(visit80_1246_2(this.timezoneOffset === obj.timezoneOffset) && visit81_1247_1(this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek))));
}, 
  clear: function(field) {
  _$jscoverage['/gregorian.js'].functionData[30]++;
  _$jscoverage['/gregorian.js'].lineData[1258]++;
  if (visit82_1258_1(field === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1259]++;
    this.field = [];
  } else {
    _$jscoverage['/gregorian.js'].lineData[1261]++;
    this.fields[field] = undefined;
  }
  _$jscoverage['/gregorian.js'].lineData[1263]++;
  this.time = undefined;
  _$jscoverage['/gregorian.js'].lineData[1264]++;
  this.fieldsComputed = false;
}};
  _$jscoverage['/gregorian.js'].lineData[1268]++;
  var GregorianCalendarProto = GregorianCalendar.prototype;
  _$jscoverage['/gregorian.js'].lineData[1270]++;
  if (visit83_1270_1('@DEBUG@')) {
    _$jscoverage['/gregorian.js'].lineData[1272]++;
    GregorianCalendarProto.getDayOfMonth = GregorianCalendarProto.getHourOfDay = GregorianCalendarProto.getWeekOfYear = GregorianCalendarProto.getWeekOfMonth = GregorianCalendarProto.getDayOfYear = GregorianCalendarProto.getDayOfWeek = GregorianCalendarProto.getDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1280]++;
    GregorianCalendarProto.addDayOfMonth = GregorianCalendarProto.addMonth = GregorianCalendarProto.addYear = GregorianCalendarProto.addMinutes = GregorianCalendarProto.addSeconds = GregorianCalendarProto.addMilliSeconds = GregorianCalendarProto.addHourOfDay = GregorianCalendarProto.addWeekOfYear = GregorianCalendarProto.addWeekOfMonth = GregorianCalendarProto.addDayOfYear = GregorianCalendarProto.addDayOfWeek = GregorianCalendarProto.addDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1292]++;
    GregorianCalendarProto.isSetDayOfMonth = GregorianCalendarProto.isSetMonth = GregorianCalendarProto.isSetYear = GregorianCalendarProto.isSetMinutes = GregorianCalendarProto.isSetSeconds = GregorianCalendarProto.isSetMilliSeconds = GregorianCalendarProto.isSetHourOfDay = GregorianCalendarProto.isSetWeekOfYear = GregorianCalendarProto.isSetWeekOfMonth = GregorianCalendarProto.isSetDayOfYear = GregorianCalendarProto.isSetDayOfWeek = GregorianCalendarProto.isSetDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1304]++;
    GregorianCalendarProto.setDayOfMonth = GregorianCalendarProto.setHourOfDay = GregorianCalendarProto.setWeekOfYear = GregorianCalendarProto.setWeekOfMonth = GregorianCalendarProto.setDayOfYear = GregorianCalendarProto.setDayOfWeek = GregorianCalendarProto.setDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1312]++;
    GregorianCalendarProto.rollDayOfMonth = GregorianCalendarProto.rollMonth = GregorianCalendarProto.rollYear = GregorianCalendarProto.rollMinutes = GregorianCalendarProto.rollSeconds = GregorianCalendarProto.rollMilliSeconds = GregorianCalendarProto.rollHourOfDay = GregorianCalendarProto.rollWeekOfYear = GregorianCalendarProto.rollWeekOfMonth = GregorianCalendarProto.rollDayOfYear = GregorianCalendarProto.rollDayOfWeek = GregorianCalendarProto.rollDayOfWeekInMonth = S.noop;
  }
  _$jscoverage['/gregorian.js'].lineData[1325]++;
  S.each(fields, function(f, index) {
  _$jscoverage['/gregorian.js'].functionData[31]++;
  _$jscoverage['/gregorian.js'].lineData[1326]++;
  if (visit84_1326_1(f)) {
    _$jscoverage['/gregorian.js'].lineData[1327]++;
    GregorianCalendarProto['get' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[32]++;
  _$jscoverage['/gregorian.js'].lineData[1328]++;
  return this.get(index);
};
    _$jscoverage['/gregorian.js'].lineData[1331]++;
    GregorianCalendarProto['isSet' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[33]++;
  _$jscoverage['/gregorian.js'].lineData[1332]++;
  return this.isSet(index);
};
    _$jscoverage['/gregorian.js'].lineData[1335]++;
    GregorianCalendarProto['set' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[34]++;
  _$jscoverage['/gregorian.js'].lineData[1336]++;
  return this.set(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1339]++;
    GregorianCalendarProto['add' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[35]++;
  _$jscoverage['/gregorian.js'].lineData[1340]++;
  return this.add(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1343]++;
    GregorianCalendarProto['roll' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[36]++;
  _$jscoverage['/gregorian.js'].lineData[1344]++;
  return this.roll(index, v);
};
  }
});
  _$jscoverage['/gregorian.js'].lineData[1351]++;
  function adjustDayOfMonth(self) {
    _$jscoverage['/gregorian.js'].functionData[37]++;
    _$jscoverage['/gregorian.js'].lineData[1352]++;
    var fields = self.fields;
    _$jscoverage['/gregorian.js'].lineData[1353]++;
    var year = fields[YEAR];
    _$jscoverage['/gregorian.js'].lineData[1354]++;
    var month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[1355]++;
    var monthLen = getMonthLength(year, month);
    _$jscoverage['/gregorian.js'].lineData[1356]++;
    var dayOfMonth = fields[DAY_OF_MONTH];
    _$jscoverage['/gregorian.js'].lineData[1357]++;
    if (visit85_1357_1(dayOfMonth > monthLen)) {
      _$jscoverage['/gregorian.js'].lineData[1358]++;
      self.set(DAY_OF_MONTH, monthLen);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1362]++;
  function getMonthLength(year, month) {
    _$jscoverage['/gregorian.js'].functionData[38]++;
    _$jscoverage['/gregorian.js'].lineData[1363]++;
    return isLeapYear(year) ? LEAP_MONTH_LENGTH[month] : MONTH_LENGTH[month];
  }
  _$jscoverage['/gregorian.js'].lineData[1366]++;
  function getYearLength(year) {
    _$jscoverage['/gregorian.js'].functionData[39]++;
    _$jscoverage['/gregorian.js'].lineData[1367]++;
    return isLeapYear(year) ? 366 : 365;
  }
  _$jscoverage['/gregorian.js'].lineData[1370]++;
  function getWeekNumber(self, fixedDay1, fixedDate) {
    _$jscoverage['/gregorian.js'].functionData[40]++;
    _$jscoverage['/gregorian.js'].lineData[1371]++;
    var fixedDay1st = getDayOfWeekDateOnOrBefore(fixedDay1 + 6, self.firstDayOfWeek);
    _$jscoverage['/gregorian.js'].lineData[1372]++;
    var nDays = (fixedDay1st - fixedDay1);
    _$jscoverage['/gregorian.js'].lineData[1373]++;
    if (visit86_1373_1(nDays >= self.minimalDaysInFirstWeek)) {
      _$jscoverage['/gregorian.js'].lineData[1374]++;
      fixedDay1st -= 7;
    }
    _$jscoverage['/gregorian.js'].lineData[1376]++;
    var normalizedDayOfPeriod = (fixedDate - fixedDay1st);
    _$jscoverage['/gregorian.js'].lineData[1377]++;
    return floorDivide(normalizedDayOfPeriod / 7) + 1;
  }
  _$jscoverage['/gregorian.js'].lineData[1380]++;
  function getDayOfWeekDateOnOrBefore(fixedDate, dayOfWeek) {
    _$jscoverage['/gregorian.js'].functionData[41]++;
    _$jscoverage['/gregorian.js'].lineData[1383]++;
    return fixedDate - mod(fixedDate - dayOfWeek, 7);
  }
  _$jscoverage['/gregorian.js'].lineData[1388]++;
  return GregorianCalendar;
});
