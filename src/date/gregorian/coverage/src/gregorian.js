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
  _$jscoverage['/gregorian.js'].lineData[181] = 0;
  _$jscoverage['/gregorian.js'].lineData[189] = 0;
  _$jscoverage['/gregorian.js'].lineData[190] = 0;
  _$jscoverage['/gregorian.js'].lineData[191] = 0;
  _$jscoverage['/gregorian.js'].lineData[192] = 0;
  _$jscoverage['/gregorian.js'].lineData[193] = 0;
  _$jscoverage['/gregorian.js'].lineData[194] = 0;
  _$jscoverage['/gregorian.js'].lineData[196] = 0;
  _$jscoverage['/gregorian.js'].lineData[197] = 0;
  _$jscoverage['/gregorian.js'].lineData[198] = 0;
  _$jscoverage['/gregorian.js'].lineData[199] = 0;
  _$jscoverage['/gregorian.js'].lineData[201] = 0;
  _$jscoverage['/gregorian.js'].lineData[202] = 0;
  _$jscoverage['/gregorian.js'].lineData[204] = 0;
  _$jscoverage['/gregorian.js'].lineData[205] = 0;
  _$jscoverage['/gregorian.js'].lineData[207] = 0;
  _$jscoverage['/gregorian.js'].lineData[208] = 0;
  _$jscoverage['/gregorian.js'].lineData[209] = 0;
  _$jscoverage['/gregorian.js'].lineData[210] = 0;
  _$jscoverage['/gregorian.js'].lineData[211] = 0;
  _$jscoverage['/gregorian.js'].lineData[213] = 0;
  _$jscoverage['/gregorian.js'].lineData[215] = 0;
  _$jscoverage['/gregorian.js'].lineData[220] = 0;
  _$jscoverage['/gregorian.js'].lineData[238] = 0;
  _$jscoverage['/gregorian.js'].lineData[254] = 0;
  _$jscoverage['/gregorian.js'].lineData[266] = 0;
  _$jscoverage['/gregorian.js'].lineData[274] = 0;
  _$jscoverage['/gregorian.js'].lineData[288] = 0;
  _$jscoverage['/gregorian.js'].lineData[289] = 0;
  _$jscoverage['/gregorian.js'].lineData[292] = 0;
  _$jscoverage['/gregorian.js'].lineData[293] = 0;
  _$jscoverage['/gregorian.js'].lineData[294] = 0;
  _$jscoverage['/gregorian.js'].lineData[295] = 0;
  _$jscoverage['/gregorian.js'].lineData[298] = 0;
  _$jscoverage['/gregorian.js'].lineData[311] = 0;
  _$jscoverage['/gregorian.js'].lineData[312] = 0;
  _$jscoverage['/gregorian.js'].lineData[314] = 0;
  _$jscoverage['/gregorian.js'].lineData[316] = 0;
  _$jscoverage['/gregorian.js'].lineData[318] = 0;
  _$jscoverage['/gregorian.js'].lineData[319] = 0;
  _$jscoverage['/gregorian.js'].lineData[322] = 0;
  _$jscoverage['/gregorian.js'].lineData[323] = 0;
  _$jscoverage['/gregorian.js'].lineData[324] = 0;
  _$jscoverage['/gregorian.js'].lineData[325] = 0;
  _$jscoverage['/gregorian.js'].lineData[327] = 0;
  _$jscoverage['/gregorian.js'].lineData[330] = 0;
  _$jscoverage['/gregorian.js'].lineData[331] = 0;
  _$jscoverage['/gregorian.js'].lineData[332] = 0;
  _$jscoverage['/gregorian.js'].lineData[335] = 0;
  _$jscoverage['/gregorian.js'].lineData[336] = 0;
  _$jscoverage['/gregorian.js'].lineData[339] = 0;
  _$jscoverage['/gregorian.js'].lineData[340] = 0;
  _$jscoverage['/gregorian.js'].lineData[342] = 0;
  _$jscoverage['/gregorian.js'].lineData[343] = 0;
  _$jscoverage['/gregorian.js'].lineData[345] = 0;
  _$jscoverage['/gregorian.js'].lineData[356] = 0;
  _$jscoverage['/gregorian.js'].lineData[365] = 0;
  _$jscoverage['/gregorian.js'].lineData[366] = 0;
  _$jscoverage['/gregorian.js'].lineData[367] = 0;
  _$jscoverage['/gregorian.js'].lineData[368] = 0;
  _$jscoverage['/gregorian.js'].lineData[369] = 0;
  _$jscoverage['/gregorian.js'].lineData[370] = 0;
  _$jscoverage['/gregorian.js'].lineData[371] = 0;
  _$jscoverage['/gregorian.js'].lineData[372] = 0;
  _$jscoverage['/gregorian.js'].lineData[373] = 0;
  _$jscoverage['/gregorian.js'].lineData[375] = 0;
  _$jscoverage['/gregorian.js'].lineData[376] = 0;
  _$jscoverage['/gregorian.js'].lineData[377] = 0;
  _$jscoverage['/gregorian.js'].lineData[381] = 0;
  _$jscoverage['/gregorian.js'].lineData[383] = 0;
  _$jscoverage['/gregorian.js'].lineData[385] = 0;
  _$jscoverage['/gregorian.js'].lineData[387] = 0;
  _$jscoverage['/gregorian.js'].lineData[388] = 0;
  _$jscoverage['/gregorian.js'].lineData[389] = 0;
  _$jscoverage['/gregorian.js'].lineData[390] = 0;
  _$jscoverage['/gregorian.js'].lineData[391] = 0;
  _$jscoverage['/gregorian.js'].lineData[393] = 0;
  _$jscoverage['/gregorian.js'].lineData[394] = 0;
  _$jscoverage['/gregorian.js'].lineData[395] = 0;
  _$jscoverage['/gregorian.js'].lineData[396] = 0;
  _$jscoverage['/gregorian.js'].lineData[397] = 0;
  _$jscoverage['/gregorian.js'].lineData[398] = 0;
  _$jscoverage['/gregorian.js'].lineData[399] = 0;
  _$jscoverage['/gregorian.js'].lineData[401] = 0;
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
  _$jscoverage['/gregorian.js'].lineData[706] = 0;
  _$jscoverage['/gregorian.js'].lineData[707] = 0;
  _$jscoverage['/gregorian.js'].lineData[708] = 0;
  _$jscoverage['/gregorian.js'].lineData[709] = 0;
  _$jscoverage['/gregorian.js'].lineData[710] = 0;
  _$jscoverage['/gregorian.js'].lineData[711] = 0;
  _$jscoverage['/gregorian.js'].lineData[714] = 0;
  _$jscoverage['/gregorian.js'].lineData[716] = 0;
  _$jscoverage['/gregorian.js'].lineData[828] = 0;
  _$jscoverage['/gregorian.js'].lineData[829] = 0;
  _$jscoverage['/gregorian.js'].lineData[831] = 0;
  _$jscoverage['/gregorian.js'].lineData[832] = 0;
  _$jscoverage['/gregorian.js'].lineData[834] = 0;
  _$jscoverage['/gregorian.js'].lineData[835] = 0;
  _$jscoverage['/gregorian.js'].lineData[836] = 0;
  _$jscoverage['/gregorian.js'].lineData[837] = 0;
  _$jscoverage['/gregorian.js'].lineData[838] = 0;
  _$jscoverage['/gregorian.js'].lineData[839] = 0;
  _$jscoverage['/gregorian.js'].lineData[840] = 0;
  _$jscoverage['/gregorian.js'].lineData[841] = 0;
  _$jscoverage['/gregorian.js'].lineData[842] = 0;
  _$jscoverage['/gregorian.js'].lineData[843] = 0;
  _$jscoverage['/gregorian.js'].lineData[844] = 0;
  _$jscoverage['/gregorian.js'].lineData[846] = 0;
  _$jscoverage['/gregorian.js'].lineData[847] = 0;
  _$jscoverage['/gregorian.js'].lineData[849] = 0;
  _$jscoverage['/gregorian.js'].lineData[851] = 0;
  _$jscoverage['/gregorian.js'].lineData[852] = 0;
  _$jscoverage['/gregorian.js'].lineData[854] = 0;
  _$jscoverage['/gregorian.js'].lineData[855] = 0;
  _$jscoverage['/gregorian.js'].lineData[857] = 0;
  _$jscoverage['/gregorian.js'].lineData[858] = 0;
  _$jscoverage['/gregorian.js'].lineData[860] = 0;
  _$jscoverage['/gregorian.js'].lineData[864] = 0;
  _$jscoverage['/gregorian.js'].lineData[865] = 0;
  _$jscoverage['/gregorian.js'].lineData[869] = 0;
  _$jscoverage['/gregorian.js'].lineData[870] = 0;
  _$jscoverage['/gregorian.js'].lineData[872] = 0;
  _$jscoverage['/gregorian.js'].lineData[873] = 0;
  _$jscoverage['/gregorian.js'].lineData[875] = 0;
  _$jscoverage['/gregorian.js'].lineData[960] = 0;
  _$jscoverage['/gregorian.js'].lineData[961] = 0;
  _$jscoverage['/gregorian.js'].lineData[962] = 0;
  _$jscoverage['/gregorian.js'].lineData[963] = 0;
  _$jscoverage['/gregorian.js'].lineData[988] = 0;
  _$jscoverage['/gregorian.js'].lineData[989] = 0;
  _$jscoverage['/gregorian.js'].lineData[991] = 0;
  _$jscoverage['/gregorian.js'].lineData[993] = 0;
  _$jscoverage['/gregorian.js'].lineData[994] = 0;
  _$jscoverage['/gregorian.js'].lineData[995] = 0;
  _$jscoverage['/gregorian.js'].lineData[996] = 0;
  _$jscoverage['/gregorian.js'].lineData[998] = 0;
  _$jscoverage['/gregorian.js'].lineData[1001] = 0;
  _$jscoverage['/gregorian.js'].lineData[1003] = 0;
  _$jscoverage['/gregorian.js'].lineData[1004] = 0;
  _$jscoverage['/gregorian.js'].lineData[1007] = 0;
  _$jscoverage['/gregorian.js'].lineData[1008] = 0;
  _$jscoverage['/gregorian.js'].lineData[1093] = 0;
  _$jscoverage['/gregorian.js'].lineData[1094] = 0;
  _$jscoverage['/gregorian.js'].lineData[1096] = 0;
  _$jscoverage['/gregorian.js'].lineData[1097] = 0;
  _$jscoverage['/gregorian.js'].lineData[1099] = 0;
  _$jscoverage['/gregorian.js'].lineData[1100] = 0;
  _$jscoverage['/gregorian.js'].lineData[1102] = 0;
  _$jscoverage['/gregorian.js'].lineData[1103] = 0;
  _$jscoverage['/gregorian.js'].lineData[1105] = 0;
  _$jscoverage['/gregorian.js'].lineData[1106] = 0;
  _$jscoverage['/gregorian.js'].lineData[1107] = 0;
  _$jscoverage['/gregorian.js'].lineData[1116] = 0;
  _$jscoverage['/gregorian.js'].lineData[1123] = 0;
  _$jscoverage['/gregorian.js'].lineData[1124] = 0;
  _$jscoverage['/gregorian.js'].lineData[1125] = 0;
  _$jscoverage['/gregorian.js'].lineData[1133] = 0;
  _$jscoverage['/gregorian.js'].lineData[1134] = 0;
  _$jscoverage['/gregorian.js'].lineData[1135] = 0;
  _$jscoverage['/gregorian.js'].lineData[1144] = 0;
  _$jscoverage['/gregorian.js'].lineData[1155] = 0;
  _$jscoverage['/gregorian.js'].lineData[1156] = 0;
  _$jscoverage['/gregorian.js'].lineData[1157] = 0;
  _$jscoverage['/gregorian.js'].lineData[1169] = 0;
  _$jscoverage['/gregorian.js'].lineData[1186] = 0;
  _$jscoverage['/gregorian.js'].lineData[1187] = 0;
  _$jscoverage['/gregorian.js'].lineData[1188] = 0;
  _$jscoverage['/gregorian.js'].lineData[1191] = 0;
  _$jscoverage['/gregorian.js'].lineData[1192] = 0;
  _$jscoverage['/gregorian.js'].lineData[1193] = 0;
  _$jscoverage['/gregorian.js'].lineData[1205] = 0;
  _$jscoverage['/gregorian.js'].lineData[1206] = 0;
  _$jscoverage['/gregorian.js'].lineData[1207] = 0;
  _$jscoverage['/gregorian.js'].lineData[1208] = 0;
  _$jscoverage['/gregorian.js'].lineData[1209] = 0;
  _$jscoverage['/gregorian.js'].lineData[1210] = 0;
  _$jscoverage['/gregorian.js'].lineData[1212] = 0;
  _$jscoverage['/gregorian.js'].lineData[1213] = 0;
  _$jscoverage['/gregorian.js'].lineData[1214] = 0;
  _$jscoverage['/gregorian.js'].lineData[1217] = 0;
  _$jscoverage['/gregorian.js'].lineData[1229] = 0;
  _$jscoverage['/gregorian.js'].lineData[1230] = 0;
  _$jscoverage['/gregorian.js'].lineData[1232] = 0;
  _$jscoverage['/gregorian.js'].lineData[1235] = 0;
  _$jscoverage['/gregorian.js'].lineData[1236] = 0;
  _$jscoverage['/gregorian.js'].lineData[1237] = 0;
  _$jscoverage['/gregorian.js'].lineData[1238] = 0;
  _$jscoverage['/gregorian.js'].lineData[1239] = 0;
  _$jscoverage['/gregorian.js'].lineData[1240] = 0;
  _$jscoverage['/gregorian.js'].lineData[1241] = 0;
  _$jscoverage['/gregorian.js'].lineData[1242] = 0;
  _$jscoverage['/gregorian.js'].lineData[1243] = 0;
  _$jscoverage['/gregorian.js'].lineData[1245] = 0;
  _$jscoverage['/gregorian.js'].lineData[1246] = 0;
  _$jscoverage['/gregorian.js'].lineData[1247] = 0;
  _$jscoverage['/gregorian.js'].lineData[1249] = 0;
  _$jscoverage['/gregorian.js'].lineData[1251] = 0;
  _$jscoverage['/gregorian.js'].lineData[1252] = 0;
  _$jscoverage['/gregorian.js'].lineData[1253] = 0;
  _$jscoverage['/gregorian.js'].lineData[1254] = 0;
  _$jscoverage['/gregorian.js'].lineData[1261] = 0;
  _$jscoverage['/gregorian.js'].lineData[1262] = 0;
  _$jscoverage['/gregorian.js'].lineData[1264] = 0;
  _$jscoverage['/gregorian.js'].lineData[1265] = 0;
  _$jscoverage['/gregorian.js'].lineData[1266] = 0;
  _$jscoverage['/gregorian.js'].lineData[1278] = 0;
  _$jscoverage['/gregorian.js'].lineData[1292] = 0;
  _$jscoverage['/gregorian.js'].lineData[1293] = 0;
  _$jscoverage['/gregorian.js'].lineData[1295] = 0;
  _$jscoverage['/gregorian.js'].lineData[1297] = 0;
  _$jscoverage['/gregorian.js'].lineData[1298] = 0;
  _$jscoverage['/gregorian.js'].lineData[1302] = 0;
  _$jscoverage['/gregorian.js'].lineData[1304] = 0;
  _$jscoverage['/gregorian.js'].lineData[1306] = 0;
  _$jscoverage['/gregorian.js'].lineData[1314] = 0;
  _$jscoverage['/gregorian.js'].lineData[1327] = 0;
  _$jscoverage['/gregorian.js'].lineData[1339] = 0;
  _$jscoverage['/gregorian.js'].lineData[1347] = 0;
  _$jscoverage['/gregorian.js'].lineData[1360] = 0;
  _$jscoverage['/gregorian.js'].lineData[1361] = 0;
  _$jscoverage['/gregorian.js'].lineData[1362] = 0;
  _$jscoverage['/gregorian.js'].lineData[1363] = 0;
  _$jscoverage['/gregorian.js'].lineData[1366] = 0;
  _$jscoverage['/gregorian.js'].lineData[1367] = 0;
  _$jscoverage['/gregorian.js'].lineData[1370] = 0;
  _$jscoverage['/gregorian.js'].lineData[1371] = 0;
  _$jscoverage['/gregorian.js'].lineData[1374] = 0;
  _$jscoverage['/gregorian.js'].lineData[1375] = 0;
  _$jscoverage['/gregorian.js'].lineData[1378] = 0;
  _$jscoverage['/gregorian.js'].lineData[1379] = 0;
  _$jscoverage['/gregorian.js'].lineData[1387] = 0;
  _$jscoverage['/gregorian.js'].lineData[1388] = 0;
  _$jscoverage['/gregorian.js'].lineData[1389] = 0;
  _$jscoverage['/gregorian.js'].lineData[1390] = 0;
  _$jscoverage['/gregorian.js'].lineData[1391] = 0;
  _$jscoverage['/gregorian.js'].lineData[1392] = 0;
  _$jscoverage['/gregorian.js'].lineData[1393] = 0;
  _$jscoverage['/gregorian.js'].lineData[1394] = 0;
  _$jscoverage['/gregorian.js'].lineData[1398] = 0;
  _$jscoverage['/gregorian.js'].lineData[1399] = 0;
  _$jscoverage['/gregorian.js'].lineData[1402] = 0;
  _$jscoverage['/gregorian.js'].lineData[1403] = 0;
  _$jscoverage['/gregorian.js'].lineData[1406] = 0;
  _$jscoverage['/gregorian.js'].lineData[1407] = 0;
  _$jscoverage['/gregorian.js'].lineData[1408] = 0;
  _$jscoverage['/gregorian.js'].lineData[1409] = 0;
  _$jscoverage['/gregorian.js'].lineData[1410] = 0;
  _$jscoverage['/gregorian.js'].lineData[1412] = 0;
  _$jscoverage['/gregorian.js'].lineData[1413] = 0;
  _$jscoverage['/gregorian.js'].lineData[1416] = 0;
  _$jscoverage['/gregorian.js'].lineData[1419] = 0;
  _$jscoverage['/gregorian.js'].lineData[1424] = 0;
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
  _$jscoverage['/gregorian.js'].branchData['288'] = [];
  _$jscoverage['/gregorian.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['293'] = [];
  _$jscoverage['/gregorian.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['311'] = [];
  _$jscoverage['/gregorian.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['324'] = [];
  _$jscoverage['/gregorian.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['342'] = [];
  _$jscoverage['/gregorian.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['356'] = [];
  _$jscoverage['/gregorian.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['371'] = [];
  _$jscoverage['/gregorian.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['375'] = [];
  _$jscoverage['/gregorian.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['393'] = [];
  _$jscoverage['/gregorian.js'].branchData['393'][1] = new BranchData();
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
  _$jscoverage['/gregorian.js'].branchData['707'] = [];
  _$jscoverage['/gregorian.js'].branchData['707'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['709'] = [];
  _$jscoverage['/gregorian.js'].branchData['709'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['710'] = [];
  _$jscoverage['/gregorian.js'].branchData['710'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['828'] = [];
  _$jscoverage['/gregorian.js'].branchData['828'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['835'] = [];
  _$jscoverage['/gregorian.js'].branchData['835'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['839'] = [];
  _$jscoverage['/gregorian.js'].branchData['839'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['843'] = [];
  _$jscoverage['/gregorian.js'].branchData['843'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['988'] = [];
  _$jscoverage['/gregorian.js'].branchData['988'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1123'] = [];
  _$jscoverage['/gregorian.js'].branchData['1123'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1133'] = [];
  _$jscoverage['/gregorian.js'].branchData['1133'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1155'] = [];
  _$jscoverage['/gregorian.js'].branchData['1155'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1187'] = [];
  _$jscoverage['/gregorian.js'].branchData['1187'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1208'] = [];
  _$jscoverage['/gregorian.js'].branchData['1208'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1209'] = [];
  _$jscoverage['/gregorian.js'].branchData['1209'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1212'] = [];
  _$jscoverage['/gregorian.js'].branchData['1212'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1213'] = [];
  _$jscoverage['/gregorian.js'].branchData['1213'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1229'] = [];
  _$jscoverage['/gregorian.js'].branchData['1229'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1229'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1229'][3] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1242'] = [];
  _$jscoverage['/gregorian.js'].branchData['1242'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1246'] = [];
  _$jscoverage['/gregorian.js'].branchData['1246'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1261'] = [];
  _$jscoverage['/gregorian.js'].branchData['1261'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1278'] = [];
  _$jscoverage['/gregorian.js'].branchData['1278'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1278'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1279'] = [];
  _$jscoverage['/gregorian.js'].branchData['1279'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1279'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1280'] = [];
  _$jscoverage['/gregorian.js'].branchData['1280'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1280'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1281'] = [];
  _$jscoverage['/gregorian.js'].branchData['1281'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1292'] = [];
  _$jscoverage['/gregorian.js'].branchData['1292'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1304'] = [];
  _$jscoverage['/gregorian.js'].branchData['1304'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1361'] = [];
  _$jscoverage['/gregorian.js'].branchData['1361'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1393'] = [];
  _$jscoverage['/gregorian.js'].branchData['1393'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1409'] = [];
  _$jscoverage['/gregorian.js'].branchData['1409'][1] = new BranchData();
}
_$jscoverage['/gregorian.js'].branchData['1409'][1].init(153, 36, 'nDays >= self.minimalDaysInFirstWeek');
function visit86_1409_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1409'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1393'][1].init(220, 21, 'dayOfMonth > monthLen');
function visit85_1393_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1393'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1361'][1].init(14, 1, 'f');
function visit84_1361_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1361'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1304'][1].init(45780, 9, '\'@DEBUG@\'');
function visit83_1304_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1304'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1292'][1].init(18, 19, 'field === undefined');
function visit82_1292_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1292'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1281'][1].init(61, 57, 'this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit81_1281_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1281'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1280'][2].init(138, 41, 'this.timezoneOffset == obj.timezoneOffset');
function visit80_1280_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1280'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1280'][1].init(61, 119, 'this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit79_1280_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1280'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1279'][2].init(75, 41, 'this.firstDayOfWeek == obj.firstDayOfWeek');
function visit78_1279_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1279'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1279'][1].init(51, 181, 'this.firstDayOfWeek == obj.firstDayOfWeek && this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit77_1279_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1279'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1278'][2].init(21, 31, 'this.getTime() == obj.getTime()');
function visit76_1278_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1278'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1278'][1].init(21, 233, 'this.getTime() == obj.getTime() && this.firstDayOfWeek == obj.firstDayOfWeek && this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit75_1278_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1278'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1261'][1].init(18, 23, 'this.time === undefined');
function visit74_1261_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1261'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1246'][1].init(782, 9, 'days != 0');
function visit73_1246_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1246'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1242'][1].init(667, 8, 'days < 0');
function visit72_1242_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1242'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1229'][3].init(58, 38, 'dayOfWeek > GregorianCalendar.SATURDAY');
function visit71_1229_3(result) {
  _$jscoverage['/gregorian.js'].branchData['1229'][3].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1229'][2].init(18, 36, 'dayOfWeek < GregorianCalendar.SUNDAY');
function visit70_1229_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1229'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1229'][1].init(18, 78, 'dayOfWeek < GregorianCalendar.SUNDAY || dayOfWeek > GregorianCalendar.SATURDAY');
function visit69_1229_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1229'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1213'][1].init(22, 15, 'weekOfYear == 1');
function visit68_1213_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1213'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1212'][1].init(330, 35, 'month == GregorianCalendar.DECEMBER');
function visit67_1212_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1212'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1209'][1].init(22, 16, 'weekOfYear >= 52');
function visit66_1209_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1209'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1208'][1].init(178, 34, 'month == GregorianCalendar.JANUARY');
function visit65_1208_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1208'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1187'][1].init(66, 26, 'weekYear == this.get(YEAR)');
function visit64_1187_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1187'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1155'][1].init(18, 53, 'this.minimalDaysInFirstWeek != minimalDaysInFirstWeek');
function visit63_1155_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1155'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1133'][1].init(18, 37, 'this.firstDayOfWeek != firstDayOfWeek');
function visit62_1133_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1133'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1123'][1].init(18, 37, 'this.timezoneOffset != timezoneOffset');
function visit61_1123_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1123'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['988'][1].init(18, 7, '!amount');
function visit60_988_1(result) {
  _$jscoverage['/gregorian.js'].branchData['988'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['843'][1].init(156, 10, 'yearAmount');
function visit59_843_1(result) {
  _$jscoverage['/gregorian.js'].branchData['843'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['839'][1].init(408, 15, 'field === MONTH');
function visit58_839_1(result) {
  _$jscoverage['/gregorian.js'].branchData['839'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['835'][1].init(250, 14, 'field === YEAR');
function visit57_835_1(result) {
  _$jscoverage['/gregorian.js'].branchData['835'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['828'][1].init(18, 7, '!amount');
function visit56_828_1(result) {
  _$jscoverage['/gregorian.js'].branchData['828'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['710'][1].init(34, 7, 'i < len');
function visit55_710_1(result) {
  _$jscoverage['/gregorian.js'].branchData['710'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['709'][1].init(137, 22, 'len < MILLISECONDS + 1');
function visit54_709_1(result) {
  _$jscoverage['/gregorian.js'].branchData['709'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['707'][1].init(59, 8, 'len == 2');
function visit53_707_1(result) {
  _$jscoverage['/gregorian.js'].branchData['707'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['594'][1].init(18, 23, 'this.time === undefined');
function visit52_594_1(result) {
  _$jscoverage['/gregorian.js'].branchData['594'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['578'][1].init(405, 30, 'dayOfWeek != firstDayOfWeekCfg');
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
}_$jscoverage['/gregorian.js'].branchData['548'][1].init(441, 30, 'dayOfWeek != firstDayOfWeekCfg');
function visit46_548_1(result) {
  _$jscoverage['/gregorian.js'].branchData['548'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['544'][1].init(271, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
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
}_$jscoverage['/gregorian.js'].branchData['535'][1].init(1039, 17, 'self.isSet(MONTH)');
function visit42_535_1(result) {
  _$jscoverage['/gregorian.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['531'][1].init(928, 23, 'self.isSet(DAY_OF_WEEK)');
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
}_$jscoverage['/gregorian.js'].branchData['434'][1].init(119, 29, 'fixedDate >= (nextJan1st - 7)');
function visit30_434_1(result) {
  _$jscoverage['/gregorian.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['432'][2].init(273, 36, 'nDays >= this.minimalDaysInFirstWeek');
function visit29_432_2(result) {
  _$jscoverage['/gregorian.js'].branchData['432'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['432'][1].init(273, 149, 'nDays >= this.minimalDaysInFirstWeek && fixedDate >= (nextJan1st - 7)');
function visit28_432_1(result) {
  _$jscoverage['/gregorian.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['427'][1].init(2485, 16, 'weekOfYear >= 52');
function visit27_427_1(result) {
  _$jscoverage['/gregorian.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['418'][1].init(2015, 15, 'weekOfYear == 0');
function visit26_418_1(result) {
  _$jscoverage['/gregorian.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['393'][1].init(988, 14, 'timeOfDay != 0');
function visit25_393_1(result) {
  _$jscoverage['/gregorian.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['375'][1].init(25, 13, 'timeOfDay < 0');
function visit24_375_1(result) {
  _$jscoverage['/gregorian.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['371'][1].init(329, 20, 'timeOfDay >= ONE_DAY');
function visit23_371_1(result) {
  _$jscoverage['/gregorian.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['356'][1].init(21, 32, 'this.fields[field] !== undefined');
function visit22_356_1(result) {
  _$jscoverage['/gregorian.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['342'][1].init(1257, 19, 'value === undefined');
function visit21_342_1(result) {
  _$jscoverage['/gregorian.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['324'][1].init(207, 10, 'value == 1');
function visit20_324_1(result) {
  _$jscoverage['/gregorian.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['311'][1].init(18, 31, 'MAX_VALUES[field] !== undefined');
function visit19_311_1(result) {
  _$jscoverage['/gregorian.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['293'][1].init(169, 23, 'field === WEEK_OF_MONTH');
function visit18_293_1(result) {
  _$jscoverage['/gregorian.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['288'][1].init(18, 31, 'MIN_VALUES[field] !== undefined');
function visit17_288_1(result) {
  _$jscoverage['/gregorian.js'].branchData['288'][1].ranCondition(result);
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
  _$jscoverage['/gregorian.js'].lineData[181]++;
  var fields = ['', 'Year', 'Month', 'DayOfMonth', 'HourOfDay', 'Minutes', 'Seconds', 'Milliseconds', 'WeekOfYear', 'WeekOfMonth', 'DayOfYear', 'DayOfWeek', 'DayOfWeekInMonth'];
  _$jscoverage['/gregorian.js'].lineData[189]++;
  var YEAR = GregorianCalendar.YEAR;
  _$jscoverage['/gregorian.js'].lineData[190]++;
  var MONTH = GregorianCalendar.MONTH;
  _$jscoverage['/gregorian.js'].lineData[191]++;
  var DAY_OF_MONTH = GregorianCalendar.DAY_OF_MONTH;
  _$jscoverage['/gregorian.js'].lineData[192]++;
  var HOUR_OF_DAY = GregorianCalendar.HOUR_OF_DAY;
  _$jscoverage['/gregorian.js'].lineData[193]++;
  var MINUTE = GregorianCalendar.MINUTES;
  _$jscoverage['/gregorian.js'].lineData[194]++;
  var SECONDS = GregorianCalendar.SECONDS;
  _$jscoverage['/gregorian.js'].lineData[196]++;
  var MILLISECONDS = GregorianCalendar.MILLISECONDS;
  _$jscoverage['/gregorian.js'].lineData[197]++;
  var DAY_OF_WEEK_IN_MONTH = GregorianCalendar.DAY_OF_WEEK_IN_MONTH;
  _$jscoverage['/gregorian.js'].lineData[198]++;
  var DAY_OF_YEAR = GregorianCalendar.DAY_OF_YEAR;
  _$jscoverage['/gregorian.js'].lineData[199]++;
  var DAY_OF_WEEK = GregorianCalendar.DAY_OF_WEEK;
  _$jscoverage['/gregorian.js'].lineData[201]++;
  var WEEK_OF_MONTH = GregorianCalendar.WEEK_OF_MONTH;
  _$jscoverage['/gregorian.js'].lineData[202]++;
  var WEEK_OF_YEAR = GregorianCalendar.WEEK_OF_YEAR;
  _$jscoverage['/gregorian.js'].lineData[204]++;
  var MONTH_LENGTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  _$jscoverage['/gregorian.js'].lineData[205]++;
  var LEAP_MONTH_LENGTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  _$jscoverage['/gregorian.js'].lineData[207]++;
  var ONE_SECOND = 1000;
  _$jscoverage['/gregorian.js'].lineData[208]++;
  var ONE_MINUTE = 60 * ONE_SECOND;
  _$jscoverage['/gregorian.js'].lineData[209]++;
  var ONE_HOUR = 60 * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[210]++;
  var ONE_DAY = 24 * ONE_HOUR;
  _$jscoverage['/gregorian.js'].lineData[211]++;
  var ONE_WEEK = ONE_DAY * 7;
  _$jscoverage['/gregorian.js'].lineData[213]++;
  var EPOCH_OFFSET = 719163;
  _$jscoverage['/gregorian.js'].lineData[215]++;
  var mod = Utils.mod, isLeapYear = Utils.isLeapYear, floorDivide = Math.floor;
  _$jscoverage['/gregorian.js'].lineData[220]++;
  var MIN_VALUES = [undefined, 1, GregorianCalendar.JANUARY, 1, 0, 0, 0, 0, 1, undefined, 1, GregorianCalendar.SUNDAY, 1];
  _$jscoverage['/gregorian.js'].lineData[238]++;
  var MAX_VALUES = [undefined, 292278994, GregorianCalendar.DECEMBER, undefined, 23, 59, 59, 999, undefined, undefined, undefined, GregorianCalendar.SATURDAY, undefined];
  _$jscoverage['/gregorian.js'].lineData[254]++;
  GregorianCalendar.prototype = {
  constructor: GregorianCalendar, 
  isLeapYear: function() {
  _$jscoverage['/gregorian.js'].functionData[2]++;
  _$jscoverage['/gregorian.js'].lineData[266]++;
  return isLeapYear(this.getYear());
}, 
  getLocale: function() {
  _$jscoverage['/gregorian.js'].functionData[3]++;
  _$jscoverage['/gregorian.js'].lineData[274]++;
  return this.locale;
}, 
  getActualMinimum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[4]++;
  _$jscoverage['/gregorian.js'].lineData[288]++;
  if (visit17_288_1(MIN_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[289]++;
    return MIN_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[292]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[293]++;
  if (visit18_293_1(field === WEEK_OF_MONTH)) {
    _$jscoverage['/gregorian.js'].lineData[294]++;
    var cal = new GregorianCalendar(fields[YEAR], fields[MONTH], 1);
    _$jscoverage['/gregorian.js'].lineData[295]++;
    return cal.get(WEEK_OF_MONTH);
  }
  _$jscoverage['/gregorian.js'].lineData[298]++;
  throw new Error('minimum value not defined!');
}, 
  getActualMaximum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[5]++;
  _$jscoverage['/gregorian.js'].lineData[311]++;
  if (visit19_311_1(MAX_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[312]++;
    return MAX_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[314]++;
  var value, fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[316]++;
  switch (field) {
    case DAY_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[318]++;
      value = getMonthLength(fields[YEAR], fields[MONTH]);
      _$jscoverage['/gregorian.js'].lineData[319]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[322]++;
      var endOfYear = new GregorianCalendar(fields[YEAR], GregorianCalendar.DECEMBER, 31);
      _$jscoverage['/gregorian.js'].lineData[323]++;
      value = endOfYear.get(WEEK_OF_YEAR);
      _$jscoverage['/gregorian.js'].lineData[324]++;
      if (visit20_324_1(value == 1)) {
        _$jscoverage['/gregorian.js'].lineData[325]++;
        value = 52;
      }
      _$jscoverage['/gregorian.js'].lineData[327]++;
      break;
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[330]++;
      var endOfMonth = new GregorianCalendar(fields[YEAR], fields[MONTH], getMonthLength(fields[YEAR], fields[MONTH]));
      _$jscoverage['/gregorian.js'].lineData[331]++;
      value = endOfMonth.get(WEEK_OF_MONTH);
      _$jscoverage['/gregorian.js'].lineData[332]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[335]++;
      value = getYearLength(fields[YEAR]);
      _$jscoverage['/gregorian.js'].lineData[336]++;
      break;
    case DAY_OF_WEEK_IN_MONTH:
      _$jscoverage['/gregorian.js'].lineData[339]++;
      value = toInt((getMonthLength(fields[YEAR], fields[MONTH]) - 1) / 7) + 1;
      _$jscoverage['/gregorian.js'].lineData[340]++;
      break;
  }
  _$jscoverage['/gregorian.js'].lineData[342]++;
  if (visit21_342_1(value === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[343]++;
    throw new Error('maximum value not defined!');
  }
  _$jscoverage['/gregorian.js'].lineData[345]++;
  return value;
}, 
  isSet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[6]++;
  _$jscoverage['/gregorian.js'].lineData[356]++;
  return visit22_356_1(this.fields[field] !== undefined);
}, 
  computeFields: function() {
  _$jscoverage['/gregorian.js'].functionData[7]++;
  _$jscoverage['/gregorian.js'].lineData[365]++;
  var time = this.time;
  _$jscoverage['/gregorian.js'].lineData[366]++;
  var timezoneOffset = this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[367]++;
  var fixedDate = toInt(timezoneOffset / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[368]++;
  var timeOfDay = timezoneOffset % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[369]++;
  fixedDate += toInt(time / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[370]++;
  timeOfDay += time % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[371]++;
  if (visit23_371_1(timeOfDay >= ONE_DAY)) {
    _$jscoverage['/gregorian.js'].lineData[372]++;
    timeOfDay -= ONE_DAY;
    _$jscoverage['/gregorian.js'].lineData[373]++;
    fixedDate++;
  } else {
    _$jscoverage['/gregorian.js'].lineData[375]++;
    while (visit24_375_1(timeOfDay < 0)) {
      _$jscoverage['/gregorian.js'].lineData[376]++;
      timeOfDay += ONE_DAY;
      _$jscoverage['/gregorian.js'].lineData[377]++;
      fixedDate--;
    }
  }
  _$jscoverage['/gregorian.js'].lineData[381]++;
  fixedDate += EPOCH_OFFSET;
  _$jscoverage['/gregorian.js'].lineData[383]++;
  var date = Utils.getGregorianDateFromFixedDate(fixedDate);
  _$jscoverage['/gregorian.js'].lineData[385]++;
  var year = date.year;
  _$jscoverage['/gregorian.js'].lineData[387]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[388]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[389]++;
  fields[MONTH] = date.month;
  _$jscoverage['/gregorian.js'].lineData[390]++;
  fields[DAY_OF_MONTH] = date.dayOfMonth;
  _$jscoverage['/gregorian.js'].lineData[391]++;
  fields[DAY_OF_WEEK] = date.dayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[393]++;
  if (visit25_393_1(timeOfDay != 0)) {
    _$jscoverage['/gregorian.js'].lineData[394]++;
    fields[HOUR_OF_DAY] = toInt(timeOfDay / ONE_HOUR);
    _$jscoverage['/gregorian.js'].lineData[395]++;
    var r = timeOfDay % ONE_HOUR;
    _$jscoverage['/gregorian.js'].lineData[396]++;
    fields[MINUTE] = toInt(r / ONE_MINUTE);
    _$jscoverage['/gregorian.js'].lineData[397]++;
    r %= ONE_MINUTE;
    _$jscoverage['/gregorian.js'].lineData[398]++;
    fields[SECONDS] = toInt(r / ONE_SECOND);
    _$jscoverage['/gregorian.js'].lineData[399]++;
    fields[MILLISECONDS] = r % ONE_SECOND;
  } else {
    _$jscoverage['/gregorian.js'].lineData[401]++;
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
  if (visit26_418_1(weekOfYear == 0)) {
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
  'computeTime': function() {
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
        var firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
        _$jscoverage['/gregorian.js'].lineData[544]++;
        if (visit45_544_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
          _$jscoverage['/gregorian.js'].lineData[545]++;
          firstDayOfWeek -= 7;
        }
        _$jscoverage['/gregorian.js'].lineData[548]++;
        if (visit46_548_1(dayOfWeek != firstDayOfWeekCfg)) {
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
      if (visit51_578_1(dayOfWeek != firstDayOfWeekCfg)) {
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
  'setTime': function(time) {
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
  _$jscoverage['/gregorian.js'].lineData[706]++;
  var len = arguments.length;
  _$jscoverage['/gregorian.js'].lineData[707]++;
  if (visit53_707_1(len == 2)) {
    _$jscoverage['/gregorian.js'].lineData[708]++;
    this.fields[field] = v;
  } else {
    _$jscoverage['/gregorian.js'].lineData[709]++;
    if (visit54_709_1(len < MILLISECONDS + 1)) {
      _$jscoverage['/gregorian.js'].lineData[710]++;
      for (var i = 0; visit55_710_1(i < len); i++) {
        _$jscoverage['/gregorian.js'].lineData[711]++;
        this.fields[YEAR + i] = arguments[i];
      }
    } else {
      _$jscoverage['/gregorian.js'].lineData[714]++;
      throw new Error('illegal arguments for KISSY GregorianCalendar set');
    }
  }
  _$jscoverage['/gregorian.js'].lineData[716]++;
  this.time = undefined;
}, 
  add: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[15]++;
  _$jscoverage['/gregorian.js'].lineData[828]++;
  if (visit56_828_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[829]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[831]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[832]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[834]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[835]++;
  if (visit57_835_1(field === YEAR)) {
    _$jscoverage['/gregorian.js'].lineData[836]++;
    value += amount;
    _$jscoverage['/gregorian.js'].lineData[837]++;
    self.set(YEAR, value);
    _$jscoverage['/gregorian.js'].lineData[838]++;
    adjustDayOfMonth(self);
  } else {
    _$jscoverage['/gregorian.js'].lineData[839]++;
    if (visit58_839_1(field === MONTH)) {
      _$jscoverage['/gregorian.js'].lineData[840]++;
      value += amount;
      _$jscoverage['/gregorian.js'].lineData[841]++;
      var yearAmount = floorDivide(value / 12);
      _$jscoverage['/gregorian.js'].lineData[842]++;
      value = mod(value, 12);
      _$jscoverage['/gregorian.js'].lineData[843]++;
      if (visit59_843_1(yearAmount)) {
        _$jscoverage['/gregorian.js'].lineData[844]++;
        self.set(YEAR, fields[YEAR] + yearAmount);
      }
      _$jscoverage['/gregorian.js'].lineData[846]++;
      self.set(MONTH, value);
      _$jscoverage['/gregorian.js'].lineData[847]++;
      adjustDayOfMonth(self);
    } else {
      _$jscoverage['/gregorian.js'].lineData[849]++;
      switch (field) {
        case HOUR_OF_DAY:
          _$jscoverage['/gregorian.js'].lineData[851]++;
          amount *= ONE_HOUR;
          _$jscoverage['/gregorian.js'].lineData[852]++;
          break;
        case MINUTE:
          _$jscoverage['/gregorian.js'].lineData[854]++;
          amount *= ONE_MINUTE;
          _$jscoverage['/gregorian.js'].lineData[855]++;
          break;
        case SECONDS:
          _$jscoverage['/gregorian.js'].lineData[857]++;
          amount *= ONE_SECOND;
          _$jscoverage['/gregorian.js'].lineData[858]++;
          break;
        case MILLISECONDS:
          _$jscoverage['/gregorian.js'].lineData[860]++;
          break;
        case WEEK_OF_MONTH:
        case WEEK_OF_YEAR:
        case DAY_OF_WEEK_IN_MONTH:
          _$jscoverage['/gregorian.js'].lineData[864]++;
          amount *= ONE_WEEK;
          _$jscoverage['/gregorian.js'].lineData[865]++;
          break;
        case DAY_OF_WEEK:
        case DAY_OF_YEAR:
        case DAY_OF_MONTH:
          _$jscoverage['/gregorian.js'].lineData[869]++;
          amount *= ONE_DAY;
          _$jscoverage['/gregorian.js'].lineData[870]++;
          break;
        default:
          _$jscoverage['/gregorian.js'].lineData[872]++;
          throw new Error('illegal field for add');
          _$jscoverage['/gregorian.js'].lineData[873]++;
          break;
      }
      _$jscoverage['/gregorian.js'].lineData[875]++;
      self.setTime(self.time + amount);
    }
  }
}, 
  getRolledValue: function(value, amount, min, max) {
  _$jscoverage['/gregorian.js'].functionData[16]++;
  _$jscoverage['/gregorian.js'].lineData[960]++;
  var diff = value - min;
  _$jscoverage['/gregorian.js'].lineData[961]++;
  var range = max - min + 1;
  _$jscoverage['/gregorian.js'].lineData[962]++;
  amount %= range;
  _$jscoverage['/gregorian.js'].lineData[963]++;
  return min + (diff + amount + range) % range;
}, 
  roll: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[17]++;
  _$jscoverage['/gregorian.js'].lineData[988]++;
  if (visit60_988_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[989]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[991]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[993]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[994]++;
  var min = self.getActualMinimum(field);
  _$jscoverage['/gregorian.js'].lineData[995]++;
  var max = self.getActualMaximum(field);
  _$jscoverage['/gregorian.js'].lineData[996]++;
  value = self.getRolledValue(value, amount, min, max);
  _$jscoverage['/gregorian.js'].lineData[998]++;
  self.set(field, value);
  _$jscoverage['/gregorian.js'].lineData[1001]++;
  switch (field) {
    case MONTH:
      _$jscoverage['/gregorian.js'].lineData[1003]++;
      adjustDayOfMonth(self);
      _$jscoverage['/gregorian.js'].lineData[1004]++;
      break;
    default:
      _$jscoverage['/gregorian.js'].lineData[1007]++;
      self.updateFieldsBySet(field);
      _$jscoverage['/gregorian.js'].lineData[1008]++;
      break;
  }
}, 
  updateFieldsBySet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[18]++;
  _$jscoverage['/gregorian.js'].lineData[1093]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1094]++;
  switch (field) {
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[1096]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1097]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1099]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1100]++;
      break;
    case DAY_OF_WEEK:
      _$jscoverage['/gregorian.js'].lineData[1102]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1103]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1105]++;
      fields[DAY_OF_YEAR] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1106]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1107]++;
      break;
  }
}, 
  getTimezoneOffset: function() {
  _$jscoverage['/gregorian.js'].functionData[19]++;
  _$jscoverage['/gregorian.js'].lineData[1116]++;
  return this.timezoneOffset;
}, 
  'setTimezoneOffset': function(timezoneOffset) {
  _$jscoverage['/gregorian.js'].functionData[20]++;
  _$jscoverage['/gregorian.js'].lineData[1123]++;
  if (visit61_1123_1(this.timezoneOffset != timezoneOffset)) {
    _$jscoverage['/gregorian.js'].lineData[1124]++;
    this.fieldsComputed = undefined;
    _$jscoverage['/gregorian.js'].lineData[1125]++;
    this.timezoneOffset = timezoneOffset;
  }
}, 
  'setFirstDayOfWeek': function(firstDayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[21]++;
  _$jscoverage['/gregorian.js'].lineData[1133]++;
  if (visit62_1133_1(this.firstDayOfWeek != firstDayOfWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1134]++;
    this.firstDayOfWeek = firstDayOfWeek;
    _$jscoverage['/gregorian.js'].lineData[1135]++;
    this.fieldsComputed = false;
  }
}, 
  'getFirstDayOfWeek': function() {
  _$jscoverage['/gregorian.js'].functionData[22]++;
  _$jscoverage['/gregorian.js'].lineData[1144]++;
  return this.firstDayOfWeek;
}, 
  'setMinimalDaysInFirstWeek': function(minimalDaysInFirstWeek) {
  _$jscoverage['/gregorian.js'].functionData[23]++;
  _$jscoverage['/gregorian.js'].lineData[1155]++;
  if (visit63_1155_1(this.minimalDaysInFirstWeek != minimalDaysInFirstWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1156]++;
    this.minimalDaysInFirstWeek = minimalDaysInFirstWeek;
    _$jscoverage['/gregorian.js'].lineData[1157]++;
    this.fieldsComputed = false;
  }
}, 
  'getMinimalDaysInFirstWeek': function() {
  _$jscoverage['/gregorian.js'].functionData[24]++;
  _$jscoverage['/gregorian.js'].lineData[1169]++;
  return this.minimalDaysInFirstWeek;
}, 
  'getWeeksInWeekYear': function() {
  _$jscoverage['/gregorian.js'].functionData[25]++;
  _$jscoverage['/gregorian.js'].lineData[1186]++;
  var weekYear = this.getWeekYear();
  _$jscoverage['/gregorian.js'].lineData[1187]++;
  if (visit64_1187_1(weekYear == this.get(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[1188]++;
    return this.getActualMaximum(WEEK_OF_YEAR);
  }
  _$jscoverage['/gregorian.js'].lineData[1191]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1192]++;
  gc.setWeekDate(weekYear, 2, this.get(DAY_OF_WEEK));
  _$jscoverage['/gregorian.js'].lineData[1193]++;
  return gc.getActualMaximum(WEEK_OF_YEAR);
}, 
  getWeekYear: function() {
  _$jscoverage['/gregorian.js'].functionData[26]++;
  _$jscoverage['/gregorian.js'].lineData[1205]++;
  var year = this.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1206]++;
  var weekOfYear = this.get(WEEK_OF_YEAR);
  _$jscoverage['/gregorian.js'].lineData[1207]++;
  var month = this.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1208]++;
  if (visit65_1208_1(month == GregorianCalendar.JANUARY)) {
    _$jscoverage['/gregorian.js'].lineData[1209]++;
    if (visit66_1209_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[1210]++;
      --year;
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[1212]++;
    if (visit67_1212_1(month == GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[1213]++;
      if (visit68_1213_1(weekOfYear == 1)) {
        _$jscoverage['/gregorian.js'].lineData[1214]++;
        ++year;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1217]++;
  return year;
}, 
  'setWeekDate': function(weekYear, weekOfYear, dayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[27]++;
  _$jscoverage['/gregorian.js'].lineData[1229]++;
  if (visit69_1229_1(visit70_1229_2(dayOfWeek < GregorianCalendar.SUNDAY) || visit71_1229_3(dayOfWeek > GregorianCalendar.SATURDAY))) {
    _$jscoverage['/gregorian.js'].lineData[1230]++;
    throw new Error("invalid dayOfWeek: " + dayOfWeek);
  }
  _$jscoverage['/gregorian.js'].lineData[1232]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1235]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1236]++;
  gc.clear();
  _$jscoverage['/gregorian.js'].lineData[1237]++;
  gc.setTimezoneOffset(0);
  _$jscoverage['/gregorian.js'].lineData[1238]++;
  gc.set(YEAR, weekYear);
  _$jscoverage['/gregorian.js'].lineData[1239]++;
  gc.set(WEEK_OF_YEAR, 1);
  _$jscoverage['/gregorian.js'].lineData[1240]++;
  gc.set(DAY_OF_WEEK, this.getFirstDayOfWeek());
  _$jscoverage['/gregorian.js'].lineData[1241]++;
  var days = dayOfWeek - this.getFirstDayOfWeek();
  _$jscoverage['/gregorian.js'].lineData[1242]++;
  if (visit72_1242_1(days < 0)) {
    _$jscoverage['/gregorian.js'].lineData[1243]++;
    days += 7;
  }
  _$jscoverage['/gregorian.js'].lineData[1245]++;
  days += 7 * (weekOfYear - 1);
  _$jscoverage['/gregorian.js'].lineData[1246]++;
  if (visit73_1246_1(days != 0)) {
    _$jscoverage['/gregorian.js'].lineData[1247]++;
    gc.add(DAY_OF_YEAR, days);
  } else {
    _$jscoverage['/gregorian.js'].lineData[1249]++;
    gc.complete();
  }
  _$jscoverage['/gregorian.js'].lineData[1251]++;
  fields[YEAR] = gc.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1252]++;
  fields[MONTH] = gc.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1253]++;
  fields[DAY_OF_MONTH] = gc.get(DAY_OF_MONTH);
  _$jscoverage['/gregorian.js'].lineData[1254]++;
  this.complete();
}, 
  clone: function() {
  _$jscoverage['/gregorian.js'].functionData[28]++;
  _$jscoverage['/gregorian.js'].lineData[1261]++;
  if (visit74_1261_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1262]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[1264]++;
  var cal = new GregorianCalendar(this.timezoneOffset, this.locale);
  _$jscoverage['/gregorian.js'].lineData[1265]++;
  cal.setTime(this.time);
  _$jscoverage['/gregorian.js'].lineData[1266]++;
  return cal;
}, 
  equals: function(obj) {
  _$jscoverage['/gregorian.js'].functionData[29]++;
  _$jscoverage['/gregorian.js'].lineData[1278]++;
  return visit75_1278_1(visit76_1278_2(this.getTime() == obj.getTime()) && visit77_1279_1(visit78_1279_2(this.firstDayOfWeek == obj.firstDayOfWeek) && visit79_1280_1(visit80_1280_2(this.timezoneOffset == obj.timezoneOffset) && visit81_1281_1(this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek))));
}, 
  clear: function(field) {
  _$jscoverage['/gregorian.js'].functionData[30]++;
  _$jscoverage['/gregorian.js'].lineData[1292]++;
  if (visit82_1292_1(field === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1293]++;
    this.field = [];
  } else {
    _$jscoverage['/gregorian.js'].lineData[1295]++;
    this.fields[field] = undefined;
  }
  _$jscoverage['/gregorian.js'].lineData[1297]++;
  this.time = undefined;
  _$jscoverage['/gregorian.js'].lineData[1298]++;
  this.fieldsComputed = false;
}};
  _$jscoverage['/gregorian.js'].lineData[1302]++;
  var GregorianCalendarProto = GregorianCalendar.prototype;
  _$jscoverage['/gregorian.js'].lineData[1304]++;
  if (visit83_1304_1('@DEBUG@')) {
    _$jscoverage['/gregorian.js'].lineData[1306]++;
    GregorianCalendarProto.getDayOfMonth = GregorianCalendarProto.getHourOfDay = GregorianCalendarProto.getWeekOfYear = GregorianCalendarProto.getWeekOfMonth = GregorianCalendarProto.getDayOfYear = GregorianCalendarProto.getDayOfWeek = GregorianCalendarProto.getDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1314]++;
    GregorianCalendarProto.addDayOfMonth = GregorianCalendarProto.addMonth = GregorianCalendarProto.addYear = GregorianCalendarProto.addMinutes = GregorianCalendarProto.addSeconds = GregorianCalendarProto.addMilliSeconds = GregorianCalendarProto.addHourOfDay = GregorianCalendarProto.addWeekOfYear = GregorianCalendarProto.addWeekOfMonth = GregorianCalendarProto.addDayOfYear = GregorianCalendarProto.addDayOfWeek = GregorianCalendarProto.addDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1327]++;
    GregorianCalendarProto.isSetDayOfMonth = GregorianCalendarProto.isSetMonth = GregorianCalendarProto.isSetYear = GregorianCalendarProto.isSetMinutes = GregorianCalendarProto.isSetSeconds = GregorianCalendarProto.isSetMilliSeconds = GregorianCalendarProto.isSetHourOfDay = GregorianCalendarProto.isSetWeekOfYear = GregorianCalendarProto.isSetWeekOfMonth = GregorianCalendarProto.isSetDayOfYear = GregorianCalendarProto.isSetDayOfWeek = GregorianCalendarProto.isSetDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1339]++;
    GregorianCalendarProto.setDayOfMonth = GregorianCalendarProto.setHourOfDay = GregorianCalendarProto.setWeekOfYear = GregorianCalendarProto.setWeekOfMonth = GregorianCalendarProto.setDayOfYear = GregorianCalendarProto.setDayOfWeek = GregorianCalendarProto.setDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1347]++;
    GregorianCalendarProto.rollDayOfMonth = GregorianCalendarProto.rollMonth = GregorianCalendarProto.rollYear = GregorianCalendarProto.rollMinutes = GregorianCalendarProto.rollSeconds = GregorianCalendarProto.rollMilliSeconds = GregorianCalendarProto.rollHourOfDay = GregorianCalendarProto.rollWeekOfYear = GregorianCalendarProto.rollWeekOfMonth = GregorianCalendarProto.rollDayOfYear = GregorianCalendarProto.rollDayOfWeek = GregorianCalendarProto.rollDayOfWeekInMonth = S.noop;
  }
  _$jscoverage['/gregorian.js'].lineData[1360]++;
  S.each(fields, function(f, index) {
  _$jscoverage['/gregorian.js'].functionData[31]++;
  _$jscoverage['/gregorian.js'].lineData[1361]++;
  if (visit84_1361_1(f)) {
    _$jscoverage['/gregorian.js'].lineData[1362]++;
    GregorianCalendarProto['get' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[32]++;
  _$jscoverage['/gregorian.js'].lineData[1363]++;
  return this.get(index);
};
    _$jscoverage['/gregorian.js'].lineData[1366]++;
    GregorianCalendarProto['isSet' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[33]++;
  _$jscoverage['/gregorian.js'].lineData[1367]++;
  return this.isSet(index);
};
    _$jscoverage['/gregorian.js'].lineData[1370]++;
    GregorianCalendarProto['set' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[34]++;
  _$jscoverage['/gregorian.js'].lineData[1371]++;
  return this.set(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1374]++;
    GregorianCalendarProto['add' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[35]++;
  _$jscoverage['/gregorian.js'].lineData[1375]++;
  return this.add(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1378]++;
    GregorianCalendarProto['roll' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[36]++;
  _$jscoverage['/gregorian.js'].lineData[1379]++;
  return this.roll(index, v);
};
  }
});
  _$jscoverage['/gregorian.js'].lineData[1387]++;
  function adjustDayOfMonth(self) {
    _$jscoverage['/gregorian.js'].functionData[37]++;
    _$jscoverage['/gregorian.js'].lineData[1388]++;
    var fields = self.fields;
    _$jscoverage['/gregorian.js'].lineData[1389]++;
    var year = fields[YEAR];
    _$jscoverage['/gregorian.js'].lineData[1390]++;
    var month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[1391]++;
    var monthLen = getMonthLength(year, month);
    _$jscoverage['/gregorian.js'].lineData[1392]++;
    var dayOfMonth = fields[DAY_OF_MONTH];
    _$jscoverage['/gregorian.js'].lineData[1393]++;
    if (visit85_1393_1(dayOfMonth > monthLen)) {
      _$jscoverage['/gregorian.js'].lineData[1394]++;
      self.set(DAY_OF_MONTH, monthLen);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1398]++;
  function getMonthLength(year, month) {
    _$jscoverage['/gregorian.js'].functionData[38]++;
    _$jscoverage['/gregorian.js'].lineData[1399]++;
    return isLeapYear(year) ? LEAP_MONTH_LENGTH[month] : MONTH_LENGTH[month];
  }
  _$jscoverage['/gregorian.js'].lineData[1402]++;
  function getYearLength(year) {
    _$jscoverage['/gregorian.js'].functionData[39]++;
    _$jscoverage['/gregorian.js'].lineData[1403]++;
    return isLeapYear(year) ? 366 : 365;
  }
  _$jscoverage['/gregorian.js'].lineData[1406]++;
  function getWeekNumber(self, fixedDay1, fixedDate) {
    _$jscoverage['/gregorian.js'].functionData[40]++;
    _$jscoverage['/gregorian.js'].lineData[1407]++;
    var fixedDay1st = getDayOfWeekDateOnOrBefore(fixedDay1 + 6, self.firstDayOfWeek);
    _$jscoverage['/gregorian.js'].lineData[1408]++;
    var nDays = (fixedDay1st - fixedDay1);
    _$jscoverage['/gregorian.js'].lineData[1409]++;
    if (visit86_1409_1(nDays >= self.minimalDaysInFirstWeek)) {
      _$jscoverage['/gregorian.js'].lineData[1410]++;
      fixedDay1st -= 7;
    }
    _$jscoverage['/gregorian.js'].lineData[1412]++;
    var normalizedDayOfPeriod = (fixedDate - fixedDay1st);
    _$jscoverage['/gregorian.js'].lineData[1413]++;
    return floorDivide(normalizedDayOfPeriod / 7) + 1;
  }
  _$jscoverage['/gregorian.js'].lineData[1416]++;
  function getDayOfWeekDateOnOrBefore(fixedDate, dayOfWeek) {
    _$jscoverage['/gregorian.js'].functionData[41]++;
    _$jscoverage['/gregorian.js'].lineData[1419]++;
    return fixedDate - mod(fixedDate - dayOfWeek, 7);
  }
  _$jscoverage['/gregorian.js'].lineData[1424]++;
  return GregorianCalendar;
}, {
  requires: ['i18n!date', './gregorian/utils', './gregorian/const']});
