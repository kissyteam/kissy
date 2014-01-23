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
  _$jscoverage['/base/style.js'].lineData[8] = 0;
  _$jscoverage['/base/style.js'].lineData[9] = 0;
  _$jscoverage['/base/style.js'].lineData[44] = 0;
  _$jscoverage['/base/style.js'].lineData[46] = 0;
  _$jscoverage['/base/style.js'].lineData[47] = 0;
  _$jscoverage['/base/style.js'].lineData[50] = 0;
  _$jscoverage['/base/style.js'].lineData[51] = 0;
  _$jscoverage['/base/style.js'].lineData[54] = 0;
  _$jscoverage['/base/style.js'].lineData[56] = 0;
  _$jscoverage['/base/style.js'].lineData[59] = 0;
  _$jscoverage['/base/style.js'].lineData[60] = 0;
  _$jscoverage['/base/style.js'].lineData[63] = 0;
  _$jscoverage['/base/style.js'].lineData[64] = 0;
  _$jscoverage['/base/style.js'].lineData[65] = 0;
  _$jscoverage['/base/style.js'].lineData[67] = 0;
  _$jscoverage['/base/style.js'].lineData[68] = 0;
  _$jscoverage['/base/style.js'].lineData[69] = 0;
  _$jscoverage['/base/style.js'].lineData[71] = 0;
  _$jscoverage['/base/style.js'].lineData[73] = 0;
  _$jscoverage['/base/style.js'].lineData[76] = 0;
  _$jscoverage['/base/style.js'].lineData[90] = 0;
  _$jscoverage['/base/style.js'].lineData[97] = 0;
  _$jscoverage['/base/style.js'].lineData[100] = 0;
  _$jscoverage['/base/style.js'].lineData[101] = 0;
  _$jscoverage['/base/style.js'].lineData[105] = 0;
  _$jscoverage['/base/style.js'].lineData[106] = 0;
  _$jscoverage['/base/style.js'].lineData[110] = 0;
  _$jscoverage['/base/style.js'].lineData[111] = 0;
  _$jscoverage['/base/style.js'].lineData[112] = 0;
  _$jscoverage['/base/style.js'].lineData[113] = 0;
  _$jscoverage['/base/style.js'].lineData[114] = 0;
  _$jscoverage['/base/style.js'].lineData[116] = 0;
  _$jscoverage['/base/style.js'].lineData[117] = 0;
  _$jscoverage['/base/style.js'].lineData[119] = 0;
  _$jscoverage['/base/style.js'].lineData[120] = 0;
  _$jscoverage['/base/style.js'].lineData[121] = 0;
  _$jscoverage['/base/style.js'].lineData[124] = 0;
  _$jscoverage['/base/style.js'].lineData[137] = 0;
  _$jscoverage['/base/style.js'].lineData[142] = 0;
  _$jscoverage['/base/style.js'].lineData[143] = 0;
  _$jscoverage['/base/style.js'].lineData[144] = 0;
  _$jscoverage['/base/style.js'].lineData[145] = 0;
  _$jscoverage['/base/style.js'].lineData[148] = 0;
  _$jscoverage['/base/style.js'].lineData[150] = 0;
  _$jscoverage['/base/style.js'].lineData[151] = 0;
  _$jscoverage['/base/style.js'].lineData[152] = 0;
  _$jscoverage['/base/style.js'].lineData[153] = 0;
  _$jscoverage['/base/style.js'].lineData[155] = 0;
  _$jscoverage['/base/style.js'].lineData[157] = 0;
  _$jscoverage['/base/style.js'].lineData[158] = 0;
  _$jscoverage['/base/style.js'].lineData[161] = 0;
  _$jscoverage['/base/style.js'].lineData[174] = 0;
  _$jscoverage['/base/style.js'].lineData[181] = 0;
  _$jscoverage['/base/style.js'].lineData[182] = 0;
  _$jscoverage['/base/style.js'].lineData[183] = 0;
  _$jscoverage['/base/style.js'].lineData[184] = 0;
  _$jscoverage['/base/style.js'].lineData[187] = 0;
  _$jscoverage['/base/style.js'].lineData[190] = 0;
  _$jscoverage['/base/style.js'].lineData[191] = 0;
  _$jscoverage['/base/style.js'].lineData[193] = 0;
  _$jscoverage['/base/style.js'].lineData[195] = 0;
  _$jscoverage['/base/style.js'].lineData[196] = 0;
  _$jscoverage['/base/style.js'].lineData[198] = 0;
  _$jscoverage['/base/style.js'].lineData[201] = 0;
  _$jscoverage['/base/style.js'].lineData[204] = 0;
  _$jscoverage['/base/style.js'].lineData[206] = 0;
  _$jscoverage['/base/style.js'].lineData[207] = 0;
  _$jscoverage['/base/style.js'].lineData[210] = 0;
  _$jscoverage['/base/style.js'].lineData[218] = 0;
  _$jscoverage['/base/style.js'].lineData[222] = 0;
  _$jscoverage['/base/style.js'].lineData[223] = 0;
  _$jscoverage['/base/style.js'].lineData[224] = 0;
  _$jscoverage['/base/style.js'].lineData[226] = 0;
  _$jscoverage['/base/style.js'].lineData[227] = 0;
  _$jscoverage['/base/style.js'].lineData[228] = 0;
  _$jscoverage['/base/style.js'].lineData[229] = 0;
  _$jscoverage['/base/style.js'].lineData[230] = 0;
  _$jscoverage['/base/style.js'].lineData[240] = 0;
  _$jscoverage['/base/style.js'].lineData[242] = 0;
  _$jscoverage['/base/style.js'].lineData[243] = 0;
  _$jscoverage['/base/style.js'].lineData[244] = 0;
  _$jscoverage['/base/style.js'].lineData[246] = 0;
  _$jscoverage['/base/style.js'].lineData[247] = 0;
  _$jscoverage['/base/style.js'].lineData[248] = 0;
  _$jscoverage['/base/style.js'].lineData[250] = 0;
  _$jscoverage['/base/style.js'].lineData[260] = 0;
  _$jscoverage['/base/style.js'].lineData[262] = 0;
  _$jscoverage['/base/style.js'].lineData[263] = 0;
  _$jscoverage['/base/style.js'].lineData[264] = 0;
  _$jscoverage['/base/style.js'].lineData[265] = 0;
  _$jscoverage['/base/style.js'].lineData[267] = 0;
  _$jscoverage['/base/style.js'].lineData[281] = 0;
  _$jscoverage['/base/style.js'].lineData[282] = 0;
  _$jscoverage['/base/style.js'].lineData[283] = 0;
  _$jscoverage['/base/style.js'].lineData[285] = 0;
  _$jscoverage['/base/style.js'].lineData[288] = 0;
  _$jscoverage['/base/style.js'].lineData[291] = 0;
  _$jscoverage['/base/style.js'].lineData[292] = 0;
  _$jscoverage['/base/style.js'].lineData[296] = 0;
  _$jscoverage['/base/style.js'].lineData[297] = 0;
  _$jscoverage['/base/style.js'].lineData[300] = 0;
  _$jscoverage['/base/style.js'].lineData[303] = 0;
  _$jscoverage['/base/style.js'].lineData[305] = 0;
  _$jscoverage['/base/style.js'].lineData[306] = 0;
  _$jscoverage['/base/style.js'].lineData[308] = 0;
  _$jscoverage['/base/style.js'].lineData[317] = 0;
  _$jscoverage['/base/style.js'].lineData[325] = 0;
  _$jscoverage['/base/style.js'].lineData[326] = 0;
  _$jscoverage['/base/style.js'].lineData[328] = 0;
  _$jscoverage['/base/style.js'].lineData[329] = 0;
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
  _$jscoverage['/base/style.js'].lineData[400] = 0;
  _$jscoverage['/base/style.js'].lineData[401] = 0;
  _$jscoverage['/base/style.js'].lineData[402] = 0;
  _$jscoverage['/base/style.js'].lineData[403] = 0;
  _$jscoverage['/base/style.js'].lineData[406] = 0;
  _$jscoverage['/base/style.js'].lineData[407] = 0;
  _$jscoverage['/base/style.js'].lineData[408] = 0;
  _$jscoverage['/base/style.js'].lineData[410] = 0;
  _$jscoverage['/base/style.js'].lineData[412] = 0;
  _$jscoverage['/base/style.js'].lineData[413] = 0;
  _$jscoverage['/base/style.js'].lineData[414] = 0;
  _$jscoverage['/base/style.js'].lineData[415] = 0;
  _$jscoverage['/base/style.js'].lineData[416] = 0;
  _$jscoverage['/base/style.js'].lineData[417] = 0;
  _$jscoverage['/base/style.js'].lineData[418] = 0;
  _$jscoverage['/base/style.js'].lineData[419] = 0;
  _$jscoverage['/base/style.js'].lineData[421] = 0;
  _$jscoverage['/base/style.js'].lineData[423] = 0;
  _$jscoverage['/base/style.js'].lineData[425] = 0;
  _$jscoverage['/base/style.js'].lineData[431] = 0;
  _$jscoverage['/base/style.js'].lineData[436] = 0;
  _$jscoverage['/base/style.js'].lineData[437] = 0;
  _$jscoverage['/base/style.js'].lineData[438] = 0;
  _$jscoverage['/base/style.js'].lineData[440] = 0;
  _$jscoverage['/base/style.js'].lineData[445] = 0;
  _$jscoverage['/base/style.js'].lineData[447] = 0;
  _$jscoverage['/base/style.js'].lineData[448] = 0;
  _$jscoverage['/base/style.js'].lineData[450] = 0;
  _$jscoverage['/base/style.js'].lineData[453] = 0;
  _$jscoverage['/base/style.js'].lineData[454] = 0;
  _$jscoverage['/base/style.js'].lineData[455] = 0;
  _$jscoverage['/base/style.js'].lineData[456] = 0;
  _$jscoverage['/base/style.js'].lineData[458] = 0;
  _$jscoverage['/base/style.js'].lineData[459] = 0;
  _$jscoverage['/base/style.js'].lineData[460] = 0;
  _$jscoverage['/base/style.js'].lineData[461] = 0;
  _$jscoverage['/base/style.js'].lineData[464] = 0;
  _$jscoverage['/base/style.js'].lineData[465] = 0;
  _$jscoverage['/base/style.js'].lineData[468] = 0;
  _$jscoverage['/base/style.js'].lineData[473] = 0;
  _$jscoverage['/base/style.js'].lineData[474] = 0;
  _$jscoverage['/base/style.js'].lineData[479] = 0;
  _$jscoverage['/base/style.js'].lineData[480] = 0;
  _$jscoverage['/base/style.js'].lineData[481] = 0;
  _$jscoverage['/base/style.js'].lineData[484] = 0;
  _$jscoverage['/base/style.js'].lineData[487] = 0;
  _$jscoverage['/base/style.js'].lineData[488] = 0;
  _$jscoverage['/base/style.js'].lineData[492] = 0;
  _$jscoverage['/base/style.js'].lineData[493] = 0;
  _$jscoverage['/base/style.js'].lineData[496] = 0;
  _$jscoverage['/base/style.js'].lineData[498] = 0;
  _$jscoverage['/base/style.js'].lineData[500] = 0;
  _$jscoverage['/base/style.js'].lineData[501] = 0;
  _$jscoverage['/base/style.js'].lineData[502] = 0;
  _$jscoverage['/base/style.js'].lineData[504] = 0;
  _$jscoverage['/base/style.js'].lineData[506] = 0;
  _$jscoverage['/base/style.js'].lineData[507] = 0;
  _$jscoverage['/base/style.js'].lineData[508] = 0;
  _$jscoverage['/base/style.js'].lineData[510] = 0;
  _$jscoverage['/base/style.js'].lineData[512] = 0;
  _$jscoverage['/base/style.js'].lineData[513] = 0;
  _$jscoverage['/base/style.js'].lineData[515] = 0;
  _$jscoverage['/base/style.js'].lineData[517] = 0;
  _$jscoverage['/base/style.js'].lineData[519] = 0;
  _$jscoverage['/base/style.js'].lineData[521] = 0;
  _$jscoverage['/base/style.js'].lineData[524] = 0;
  _$jscoverage['/base/style.js'].lineData[525] = 0;
  _$jscoverage['/base/style.js'].lineData[528] = 0;
  _$jscoverage['/base/style.js'].lineData[531] = 0;
  _$jscoverage['/base/style.js'].lineData[532] = 0;
  _$jscoverage['/base/style.js'].lineData[534] = 0;
  _$jscoverage['/base/style.js'].lineData[536] = 0;
  _$jscoverage['/base/style.js'].lineData[539] = 0;
  _$jscoverage['/base/style.js'].lineData[542] = 0;
  _$jscoverage['/base/style.js'].lineData[544] = 0;
  _$jscoverage['/base/style.js'].lineData[549] = 0;
  _$jscoverage['/base/style.js'].lineData[550] = 0;
  _$jscoverage['/base/style.js'].lineData[553] = 0;
  _$jscoverage['/base/style.js'].lineData[554] = 0;
  _$jscoverage['/base/style.js'].lineData[556] = 0;
  _$jscoverage['/base/style.js'].lineData[557] = 0;
  _$jscoverage['/base/style.js'].lineData[560] = 0;
  _$jscoverage['/base/style.js'].lineData[563] = 0;
  _$jscoverage['/base/style.js'].lineData[564] = 0;
  _$jscoverage['/base/style.js'].lineData[565] = 0;
  _$jscoverage['/base/style.js'].lineData[566] = 0;
  _$jscoverage['/base/style.js'].lineData[567] = 0;
  _$jscoverage['/base/style.js'].lineData[568] = 0;
  _$jscoverage['/base/style.js'].lineData[569] = 0;
  _$jscoverage['/base/style.js'].lineData[570] = 0;
  _$jscoverage['/base/style.js'].lineData[571] = 0;
  _$jscoverage['/base/style.js'].lineData[573] = 0;
  _$jscoverage['/base/style.js'].lineData[575] = 0;
  _$jscoverage['/base/style.js'].lineData[579] = 0;
  _$jscoverage['/base/style.js'].lineData[582] = 0;
  _$jscoverage['/base/style.js'].lineData[583] = 0;
  _$jscoverage['/base/style.js'].lineData[586] = 0;
  _$jscoverage['/base/style.js'].lineData[587] = 0;
  _$jscoverage['/base/style.js'].lineData[589] = 0;
  _$jscoverage['/base/style.js'].lineData[591] = 0;
  _$jscoverage['/base/style.js'].lineData[593] = 0;
  _$jscoverage['/base/style.js'].lineData[604] = 0;
  _$jscoverage['/base/style.js'].lineData[605] = 0;
  _$jscoverage['/base/style.js'].lineData[606] = 0;
  _$jscoverage['/base/style.js'].lineData[607] = 0;
  _$jscoverage['/base/style.js'].lineData[608] = 0;
  _$jscoverage['/base/style.js'].lineData[610] = 0;
  _$jscoverage['/base/style.js'].lineData[612] = 0;
  _$jscoverage['/base/style.js'].lineData[613] = 0;
  _$jscoverage['/base/style.js'].lineData[614] = 0;
  _$jscoverage['/base/style.js'].lineData[615] = 0;
  _$jscoverage['/base/style.js'].lineData[616] = 0;
  _$jscoverage['/base/style.js'].lineData[618] = 0;
  _$jscoverage['/base/style.js'].lineData[619] = 0;
  _$jscoverage['/base/style.js'].lineData[620] = 0;
  _$jscoverage['/base/style.js'].lineData[623] = 0;
  _$jscoverage['/base/style.js'].lineData[625] = 0;
  _$jscoverage['/base/style.js'].lineData[626] = 0;
  _$jscoverage['/base/style.js'].lineData[628] = 0;
  _$jscoverage['/base/style.js'].lineData[629] = 0;
  _$jscoverage['/base/style.js'].lineData[630] = 0;
  _$jscoverage['/base/style.js'].lineData[631] = 0;
  _$jscoverage['/base/style.js'].lineData[632] = 0;
  _$jscoverage['/base/style.js'].lineData[635] = 0;
  _$jscoverage['/base/style.js'].lineData[637] = 0;
  _$jscoverage['/base/style.js'].lineData[638] = 0;
  _$jscoverage['/base/style.js'].lineData[643] = 0;
  _$jscoverage['/base/style.js'].lineData[648] = 0;
  _$jscoverage['/base/style.js'].lineData[650] = 0;
  _$jscoverage['/base/style.js'].lineData[651] = 0;
  _$jscoverage['/base/style.js'].lineData[655] = 0;
  _$jscoverage['/base/style.js'].lineData[656] = 0;
  _$jscoverage['/base/style.js'].lineData[661] = 0;
  _$jscoverage['/base/style.js'].lineData[662] = 0;
  _$jscoverage['/base/style.js'].lineData[663] = 0;
  _$jscoverage['/base/style.js'].lineData[664] = 0;
  _$jscoverage['/base/style.js'].lineData[665] = 0;
  _$jscoverage['/base/style.js'].lineData[668] = 0;
  _$jscoverage['/base/style.js'].lineData[669] = 0;
  _$jscoverage['/base/style.js'].lineData[673] = 0;
  _$jscoverage['/base/style.js'].lineData[679] = 0;
  _$jscoverage['/base/style.js'].lineData[680] = 0;
  _$jscoverage['/base/style.js'].lineData[681] = 0;
  _$jscoverage['/base/style.js'].lineData[683] = 0;
  _$jscoverage['/base/style.js'].lineData[685] = 0;
  _$jscoverage['/base/style.js'].lineData[688] = 0;
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
  _$jscoverage['/base/style.js'].functionData[28] = 0;
  _$jscoverage['/base/style.js'].functionData[29] = 0;
}
if (! _$jscoverage['/base/style.js'].branchData) {
  _$jscoverage['/base/style.js'].branchData = {};
  _$jscoverage['/base/style.js'].branchData['17'] = [];
  _$jscoverage['/base/style.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['47'] = [];
  _$jscoverage['/base/style.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['63'] = [];
  _$jscoverage['/base/style.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['64'] = [];
  _$jscoverage['/base/style.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['100'] = [];
  _$jscoverage['/base/style.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['101'] = [];
  _$jscoverage['/base/style.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['105'] = [];
  _$jscoverage['/base/style.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['105'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['110'] = [];
  _$jscoverage['/base/style.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['142'] = [];
  _$jscoverage['/base/style.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['144'] = [];
  _$jscoverage['/base/style.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['150'] = [];
  _$jscoverage['/base/style.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['152'] = [];
  _$jscoverage['/base/style.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['157'] = [];
  _$jscoverage['/base/style.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['181'] = [];
  _$jscoverage['/base/style.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['183'] = [];
  _$jscoverage['/base/style.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['193'] = [];
  _$jscoverage['/base/style.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['196'] = [];
  _$jscoverage['/base/style.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['198'] = [];
  _$jscoverage['/base/style.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['198'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['198'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['199'] = [];
  _$jscoverage['/base/style.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['204'] = [];
  _$jscoverage['/base/style.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['206'] = [];
  _$jscoverage['/base/style.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['222'] = [];
  _$jscoverage['/base/style.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['224'] = [];
  _$jscoverage['/base/style.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['226'] = [];
  _$jscoverage['/base/style.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['242'] = [];
  _$jscoverage['/base/style.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['246'] = [];
  _$jscoverage['/base/style.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['247'] = [];
  _$jscoverage['/base/style.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['262'] = [];
  _$jscoverage['/base/style.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['264'] = [];
  _$jscoverage['/base/style.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['281'] = [];
  _$jscoverage['/base/style.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['291'] = [];
  _$jscoverage['/base/style.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['296'] = [];
  _$jscoverage['/base/style.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['305'] = [];
  _$jscoverage['/base/style.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['325'] = [];
  _$jscoverage['/base/style.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['328'] = [];
  _$jscoverage['/base/style.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['331'] = [];
  _$jscoverage['/base/style.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['333'] = [];
  _$jscoverage['/base/style.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['338'] = [];
  _$jscoverage['/base/style.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['403'] = [];
  _$jscoverage['/base/style.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['408'] = [];
  _$jscoverage['/base/style.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['410'] = [];
  _$jscoverage['/base/style.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['414'] = [];
  _$jscoverage['/base/style.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['415'] = [];
  _$jscoverage['/base/style.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['418'] = [];
  _$jscoverage['/base/style.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['425'] = [];
  _$jscoverage['/base/style.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['437'] = [];
  _$jscoverage['/base/style.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['453'] = [];
  _$jscoverage['/base/style.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['455'] = [];
  _$jscoverage['/base/style.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['459'] = [];
  _$jscoverage['/base/style.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['460'] = [];
  _$jscoverage['/base/style.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['460'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['464'] = [];
  _$jscoverage['/base/style.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['496'] = [];
  _$jscoverage['/base/style.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['496'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['497'] = [];
  _$jscoverage['/base/style.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['497'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['504'] = [];
  _$jscoverage['/base/style.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['506'] = [];
  _$jscoverage['/base/style.js'].branchData['506'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['506'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['506'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['508'] = [];
  _$jscoverage['/base/style.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['512'] = [];
  _$jscoverage['/base/style.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['515'] = [];
  _$jscoverage['/base/style.js'].branchData['515'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['524'] = [];
  _$jscoverage['/base/style.js'].branchData['524'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['524'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['528'] = [];
  _$jscoverage['/base/style.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['531'] = [];
  _$jscoverage['/base/style.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['539'] = [];
  _$jscoverage['/base/style.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['539'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['539'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['540'] = [];
  _$jscoverage['/base/style.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['544'] = [];
  _$jscoverage['/base/style.js'].branchData['544'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['553'] = [];
  _$jscoverage['/base/style.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['565'] = [];
  _$jscoverage['/base/style.js'].branchData['565'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['567'] = [];
  _$jscoverage['/base/style.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['568'] = [];
  _$jscoverage['/base/style.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['570'] = [];
  _$jscoverage['/base/style.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['575'] = [];
  _$jscoverage['/base/style.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['583'] = [];
  _$jscoverage['/base/style.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['589'] = [];
  _$jscoverage['/base/style.js'].branchData['589'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['605'] = [];
  _$jscoverage['/base/style.js'].branchData['605'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['606'] = [];
  _$jscoverage['/base/style.js'].branchData['606'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['607'] = [];
  _$jscoverage['/base/style.js'].branchData['607'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['608'] = [];
  _$jscoverage['/base/style.js'].branchData['608'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['610'] = [];
  _$jscoverage['/base/style.js'].branchData['610'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['611'] = [];
  _$jscoverage['/base/style.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['615'] = [];
  _$jscoverage['/base/style.js'].branchData['615'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['615'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['615'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['619'] = [];
  _$jscoverage['/base/style.js'].branchData['619'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['619'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['619'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['620'] = [];
  _$jscoverage['/base/style.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['623'] = [];
  _$jscoverage['/base/style.js'].branchData['623'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['625'] = [];
  _$jscoverage['/base/style.js'].branchData['625'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['628'] = [];
  _$jscoverage['/base/style.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['628'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['629'] = [];
  _$jscoverage['/base/style.js'].branchData['629'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['630'] = [];
  _$jscoverage['/base/style.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['631'] = [];
  _$jscoverage['/base/style.js'].branchData['631'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['637'] = [];
  _$jscoverage['/base/style.js'].branchData['637'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['638'] = [];
  _$jscoverage['/base/style.js'].branchData['638'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['639'] = [];
  _$jscoverage['/base/style.js'].branchData['639'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['655'] = [];
  _$jscoverage['/base/style.js'].branchData['655'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['664'] = [];
  _$jscoverage['/base/style.js'].branchData['664'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['665'] = [];
  _$jscoverage['/base/style.js'].branchData['665'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['668'] = [];
  _$jscoverage['/base/style.js'].branchData['668'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['669'] = [];
  _$jscoverage['/base/style.js'].branchData['669'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['680'] = [];
  _$jscoverage['/base/style.js'].branchData['680'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['680'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['681'] = [];
  _$jscoverage['/base/style.js'].branchData['681'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['681'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['682'] = [];
  _$jscoverage['/base/style.js'].branchData['682'][1] = new BranchData();
}
_$jscoverage['/base/style.js'].branchData['682'][1].init(52, 46, 'Dom.css(offsetParent, \'position\') === \'static\'');
function visit518_682_1(result) {
  _$jscoverage['/base/style.js'].branchData['682'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['681'][2].init(110, 99, '!ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit517_681_2(result) {
  _$jscoverage['/base/style.js'].branchData['681'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['681'][1].init(94, 115, 'offsetParent && !ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit516_681_1(result) {
  _$jscoverage['/base/style.js'].branchData['681'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['680'][2].init(48, 23, 'el.ownerDocument || doc');
function visit515_680_2(result) {
  _$jscoverage['/base/style.js'].branchData['680'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['680'][1].init(28, 49, 'el.offsetParent || (el.ownerDocument || doc).body');
function visit514_680_1(result) {
  _$jscoverage['/base/style.js'].branchData['680'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['669'][1].init(806, 42, 'parseFloat(Dom.css(el, \'marginLeft\')) || 0');
function visit513_669_1(result) {
  _$jscoverage['/base/style.js'].branchData['669'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['668'][1].init(740, 41, 'parseFloat(Dom.css(el, \'marginTop\')) || 0');
function visit512_668_1(result) {
  _$jscoverage['/base/style.js'].branchData['668'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['665'][1].init(438, 57, 'parseFloat(Dom.css(offsetParent, \'borderLeftWidth\')) || 0');
function visit511_665_1(result) {
  _$jscoverage['/base/style.js'].branchData['665'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['664'][1].init(347, 56, 'parseFloat(Dom.css(offsetParent, \'borderTopWidth\')) || 0');
function visit510_664_1(result) {
  _$jscoverage['/base/style.js'].branchData['664'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['655'][1].init(106, 35, 'Dom.css(el, \'position\') === \'fixed\'');
function visit509_655_1(result) {
  _$jscoverage['/base/style.js'].branchData['655'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['639'][1].init(45, 23, 'extra === PADDING_INDEX');
function visit508_639_1(result) {
  _$jscoverage['/base/style.js'].branchData['639'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['638'][1].init(27, 22, 'extra === BORDER_INDEX');
function visit507_638_1(result) {
  _$jscoverage['/base/style.js'].branchData['638'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['637'][1].init(1597, 27, 'borderBoxValueOrIsBorderBox');
function visit506_637_1(result) {
  _$jscoverage['/base/style.js'].branchData['637'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['631'][1].init(17, 27, 'borderBoxValueOrIsBorderBox');
function visit505_631_1(result) {
  _$jscoverage['/base/style.js'].branchData['631'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['630'][1].init(1319, 23, 'extra === CONTENT_INDEX');
function visit504_630_1(result) {
  _$jscoverage['/base/style.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['629'][1].init(1276, 29, 'borderBoxValue || cssBoxValue');
function visit503_629_1(result) {
  _$jscoverage['/base/style.js'].branchData['629'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['628'][2].init(1213, 28, 'borderBoxValue !== undefined');
function visit502_628_2(result) {
  _$jscoverage['/base/style.js'].branchData['628'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['628'][1].init(1213, 43, 'borderBoxValue !== undefined || isBorderBox');
function visit501_628_1(result) {
  _$jscoverage['/base/style.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['625'][1].init(1074, 19, 'extra === undefined');
function visit500_625_1(result) {
  _$jscoverage['/base/style.js'].branchData['625'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['623'][1].init(408, 28, 'parseFloat(cssBoxValue) || 0');
function visit499_623_1(result) {
  _$jscoverage['/base/style.js'].branchData['623'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['620'][1].init(31, 23, 'elem.style[name] || 0');
function visit498_620_1(result) {
  _$jscoverage['/base/style.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['619'][3].init(228, 24, '(Number(cssBoxValue)) < 0');
function visit497_619_3(result) {
  _$jscoverage['/base/style.js'].branchData['619'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['619'][2].init(204, 19, 'cssBoxValue == null');
function visit496_619_2(result) {
  _$jscoverage['/base/style.js'].branchData['619'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['619'][1].init(204, 48, 'cssBoxValue == null || (Number(cssBoxValue)) < 0');
function visit495_619_1(result) {
  _$jscoverage['/base/style.js'].branchData['619'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['615'][3].init(592, 19, 'borderBoxValue <= 0');
function visit494_615_3(result) {
  _$jscoverage['/base/style.js'].branchData['615'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['615'][2].init(566, 22, 'borderBoxValue == null');
function visit493_615_2(result) {
  _$jscoverage['/base/style.js'].branchData['615'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['615'][1].init(566, 45, 'borderBoxValue == null || borderBoxValue <= 0');
function visit492_615_1(result) {
  _$jscoverage['/base/style.js'].branchData['615'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['611'][1].init(96, 14, 'name === WIDTH');
function visit491_611_1(result) {
  _$jscoverage['/base/style.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['610'][1].init(271, 14, 'name === WIDTH');
function visit490_610_1(result) {
  _$jscoverage['/base/style.js'].branchData['610'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['608'][1].init(20, 14, 'name === WIDTH');
function visit489_608_1(result) {
  _$jscoverage['/base/style.js'].branchData['608'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['607'][1].init(141, 19, 'elem.nodeType === 9');
function visit488_607_1(result) {
  _$jscoverage['/base/style.js'].branchData['607'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['606'][1].init(20, 14, 'name === WIDTH');
function visit487_606_1(result) {
  _$jscoverage['/base/style.js'].branchData['606'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['605'][1].init(13, 16, 'S.isWindow(elem)');
function visit486_605_1(result) {
  _$jscoverage['/base/style.js'].branchData['605'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['589'][1].init(78, 15, 'doc.defaultView');
function visit485_589_1(result) {
  _$jscoverage['/base/style.js'].branchData['589'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['583'][1].init(16, 72, 'Dom._getComputedStyle(elem, \'boxSizing\', computedStyle) === \'border-box\'');
function visit484_583_1(result) {
  _$jscoverage['/base/style.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['575'][1].init(271, 68, 'parseFloat(Dom._getComputedStyle(elem, cssProp, computedStyle)) || 0');
function visit483_575_1(result) {
  _$jscoverage['/base/style.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['570'][1].init(58, 17, 'prop === \'border\'');
function visit482_570_1(result) {
  _$jscoverage['/base/style.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['568'][1].init(29, 16, 'i < which.length');
function visit481_568_1(result) {
  _$jscoverage['/base/style.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['567'][1].init(46, 4, 'prop');
function visit480_567_1(result) {
  _$jscoverage['/base/style.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['565'][1].init(56, 16, 'j < props.length');
function visit479_565_1(result) {
  _$jscoverage['/base/style.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['553'][1].init(124, 22, 'elem.offsetWidth !== 0');
function visit478_553_1(result) {
  _$jscoverage['/base/style.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['544'][1].init(326, 17, 'ret === undefined');
function visit477_544_1(result) {
  _$jscoverage['/base/style.js'].branchData['544'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['540'][1].init(33, 42, '(ret = hook.get(elem, false)) !== undefined');
function visit476_540_1(result) {
  _$jscoverage['/base/style.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['539'][3].init(103, 76, '\'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit475_539_3(result) {
  _$jscoverage['/base/style.js'].branchData['539'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['539'][2].init(95, 84, 'hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit474_539_2(result) {
  _$jscoverage['/base/style.js'].branchData['539'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['539'][1].init(93, 87, '!(hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined)');
function visit473_539_1(result) {
  _$jscoverage['/base/style.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['531'][1].init(137, 9, 'UA.webkit');
function visit472_531_1(result) {
  _$jscoverage['/base/style.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['528'][1].init(849, 16, '!elStyle.cssText');
function visit471_528_1(result) {
  _$jscoverage['/base/style.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['524'][2].init(301, 13, 'val === EMPTY');
function visit470_524_2(result) {
  _$jscoverage['/base/style.js'].branchData['524'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['524'][1].init(301, 40, 'val === EMPTY && elStyle.removeAttribute');
function visit469_524_1(result) {
  _$jscoverage['/base/style.js'].branchData['524'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['515'][1].init(385, 17, 'val !== undefined');
function visit468_515_1(result) {
  _$jscoverage['/base/style.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['512'][1].init(292, 16, 'hook && hook.set');
function visit467_512_1(result) {
  _$jscoverage['/base/style.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['508'][1].init(134, 39, '!isNaN(Number(val)) && !cssNumber[name]');
function visit466_508_1(result) {
  _$jscoverage['/base/style.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['506'][3].init(64, 13, 'val === EMPTY');
function visit465_506_3(result) {
  _$jscoverage['/base/style.js'].branchData['506'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['506'][2].init(48, 12, 'val === null');
function visit464_506_2(result) {
  _$jscoverage['/base/style.js'].branchData['506'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['506'][1].init(48, 29, 'val === null || val === EMPTY');
function visit463_506_1(result) {
  _$jscoverage['/base/style.js'].branchData['506'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['504'][1].init(330, 17, 'val !== undefined');
function visit462_504_1(result) {
  _$jscoverage['/base/style.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['497'][2].init(106, 19, 'elem.nodeType === 8');
function visit461_497_2(result) {
  _$jscoverage['/base/style.js'].branchData['497'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['497'][1].init(34, 46, 'elem.nodeType === 8 || !(elStyle = elem.style)');
function visit460_497_1(result) {
  _$jscoverage['/base/style.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['496'][2].init(69, 19, 'elem.nodeType === 3');
function visit459_496_2(result) {
  _$jscoverage['/base/style.js'].branchData['496'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['496'][1].init(69, 81, 'elem.nodeType === 3 || elem.nodeType === 8 || !(elStyle = elem.style)');
function visit458_496_1(result) {
  _$jscoverage['/base/style.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['464'][1].init(501, 37, 'isAutoPosition || NO_PX_REG.test(val)');
function visit457_464_1(result) {
  _$jscoverage['/base/style.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['460'][2].init(321, 23, 'position === \'relative\'');
function visit456_460_2(result) {
  _$jscoverage['/base/style.js'].branchData['460'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['460'][1].init(303, 41, 'isAutoPosition && position === \'relative\'');
function visit455_460_1(result) {
  _$jscoverage['/base/style.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['459'][1].init(263, 14, 'val === \'auto\'');
function visit454_459_1(result) {
  _$jscoverage['/base/style.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['455'][1].init(81, 21, 'position === \'static\'');
function visit453_455_1(result) {
  _$jscoverage['/base/style.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['453'][1].init(112, 8, 'computed');
function visit452_453_1(result) {
  _$jscoverage['/base/style.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['437'][1].init(46, 8, 'computed');
function visit451_437_1(result) {
  _$jscoverage['/base/style.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['425'][1].init(540, 53, 'elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX)');
function visit450_425_1(result) {
  _$jscoverage['/base/style.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['418'][1].init(163, 11, 'isBorderBox');
function visit449_418_1(result) {
  _$jscoverage['/base/style.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['415'][1].init(21, 4, 'elem');
function visit448_415_1(result) {
  _$jscoverage['/base/style.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['414'][1].init(59, 17, 'val !== undefined');
function visit447_414_1(result) {
  _$jscoverage['/base/style.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['410'][1].init(435, 14, 'name === WIDTH');
function visit446_410_1(result) {
  _$jscoverage['/base/style.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['408'][1].init(60, 79, 'el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX)');
function visit445_408_1(result) {
  _$jscoverage['/base/style.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['403'][1].init(60, 49, 'el && getWHIgnoreDisplay(el, name, PADDING_INDEX)');
function visit444_403_1(result) {
  _$jscoverage['/base/style.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['338'][1].init(33, 36, '!S.inArray(getNodeName(e), excludes)');
function visit443_338_1(result) {
  _$jscoverage['/base/style.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['333'][1].init(224, 5, 'UA.ie');
function visit442_333_1(result) {
  _$jscoverage['/base/style.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['331'][1].init(101, 27, 'userSelectProperty in style');
function visit441_331_1(result) {
  _$jscoverage['/base/style.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['328'][1].init(434, 6, 'j >= 0');
function visit440_328_1(result) {
  _$jscoverage['/base/style.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['325'][1].init(250, 32, 'userSelectProperty === undefined');
function visit439_325_1(result) {
  _$jscoverage['/base/style.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['305'][1].init(744, 15, 'elem.styleSheet');
function visit438_305_1(result) {
  _$jscoverage['/base/style.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['296'][1].init(489, 4, 'elem');
function visit437_296_1(result) {
  _$jscoverage['/base/style.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['291'][1].init(329, 35, 'id && (id = id.replace(\'#\', EMPTY))');
function visit436_291_1(result) {
  _$jscoverage['/base/style.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['281'][1].init(21, 26, 'typeof refWin === \'string\'');
function visit435_281_1(result) {
  _$jscoverage['/base/style.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['264'][1].init(60, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit434_264_1(result) {
  _$jscoverage['/base/style.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['262'][1].init(118, 6, 'i >= 0');
function visit433_262_1(result) {
  _$jscoverage['/base/style.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['247'][1].init(29, 3, 'old');
function visit432_247_1(result) {
  _$jscoverage['/base/style.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['246'][1].init(150, 12, 'old !== NONE');
function visit431_246_1(result) {
  _$jscoverage['/base/style.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['242'][1].init(118, 6, 'i >= 0');
function visit430_242_1(result) {
  _$jscoverage['/base/style.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['226'][1].init(201, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit429_226_1(result) {
  _$jscoverage['/base/style.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['224'][1].init(78, 36, 'Dom.data(elem, OLD_DISPLAY) || EMPTY');
function visit428_224_1(result) {
  _$jscoverage['/base/style.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['222'][1].init(172, 6, 'i >= 0');
function visit427_222_1(result) {
  _$jscoverage['/base/style.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['206'][1].init(46, 6, 'i >= 0');
function visit426_206_1(result) {
  _$jscoverage['/base/style.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['204'][1].init(482, 26, 'typeof ret === \'undefined\'');
function visit425_204_1(result) {
  _$jscoverage['/base/style.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['199'][1].init(45, 41, '(ret = hook.get(elem, true)) !== undefined');
function visit424_199_1(result) {
  _$jscoverage['/base/style.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['198'][3].init(123, 87, '\'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit423_198_3(result) {
  _$jscoverage['/base/style.js'].branchData['198'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['198'][2].init(115, 95, 'hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit422_198_2(result) {
  _$jscoverage['/base/style.js'].branchData['198'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['198'][1].init(113, 98, '!(hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined)');
function visit421_198_1(result) {
  _$jscoverage['/base/style.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['196'][1].init(114, 4, 'elem');
function visit420_196_1(result) {
  _$jscoverage['/base/style.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['193'][1].init(645, 17, 'val === undefined');
function visit419_193_1(result) {
  _$jscoverage['/base/style.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['183'][1].init(50, 6, 'i >= 0');
function visit418_183_1(result) {
  _$jscoverage['/base/style.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['181'][1].init(233, 21, 'S.isPlainObject(name)');
function visit417_181_1(result) {
  _$jscoverage['/base/style.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['157'][1].init(46, 6, 'i >= 0');
function visit416_157_1(result) {
  _$jscoverage['/base/style.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['152'][1].init(55, 4, 'elem');
function visit415_152_1(result) {
  _$jscoverage['/base/style.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['150'][1].init(493, 17, 'val === undefined');
function visit414_150_1(result) {
  _$jscoverage['/base/style.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['144'][1].init(50, 6, 'i >= 0');
function visit413_144_1(result) {
  _$jscoverage['/base/style.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['142'][1].init(187, 21, 'S.isPlainObject(name)');
function visit412_142_1(result) {
  _$jscoverage['/base/style.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['110'][1].init(758, 51, 'Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)');
function visit411_110_1(result) {
  _$jscoverage['/base/style.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['105'][2].init(575, 10, 'val === \'\'');
function visit410_105_2(result) {
  _$jscoverage['/base/style.js'].branchData['105'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['105'][1].init(575, 36, 'val === \'\' && !Dom.contains(d, elem)');
function visit409_105_1(result) {
  _$jscoverage['/base/style.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['101'][1].init(27, 59, 'computedStyle.getPropertyValue(name) || computedStyle[name]');
function visit408_101_1(result) {
  _$jscoverage['/base/style.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['100'][1].init(344, 59, 'computedStyle || d.defaultView.getComputedStyle(elem, null)');
function visit407_100_1(result) {
  _$jscoverage['/base/style.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['64'][1].init(20, 31, 'doc.body || doc.documentElement');
function visit406_64_1(result) {
  _$jscoverage['/base/style.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['63'][1].init(101, 26, '!defaultDisplay[tagName]');
function visit405_63_1(result) {
  _$jscoverage['/base/style.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['47'][1].init(16, 55, 'cssProps[name] || S.Features.getVendorCssPropName(name)');
function visit404_47_1(result) {
  _$jscoverage['/base/style.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['17'][1].init(260, 27, 'globalWindow.document || {}');
function visit403_17_1(result) {
  _$jscoverage['/base/style.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/style.js'].functionData[0]++;
  _$jscoverage['/base/style.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/style.js'].lineData[8]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/base/style.js'].lineData[9]++;
  var globalWindow = S.Env.host, UA = S.UA, BOX_MODELS = ['margin', 'border', 'padding'], CONTENT_INDEX = -1, PADDING_INDEX = 2, BORDER_INDEX = 1, MARGIN_INDEX = 0, getNodeName = Dom.nodeName, doc = visit403_17_1(globalWindow.document || {}), RE_MARGIN = /^margin/, WIDTH = 'width', HEIGHT = 'height', DISPLAY = 'display', OLD_DISPLAY = DISPLAY + S.now(), NONE = 'none', cssNumber = {
  fillOpacity: 1, 
  fontWeight: 1, 
  lineHeight: 1, 
  opacity: 1, 
  orphans: 1, 
  widows: 1, 
  zIndex: 1, 
  zoom: 1}, rmsPrefix = /^-ms-/, EMPTY = '', DEFAULT_UNIT = 'px', NO_PX_REG = /\d(?!px)[a-z%]+$/i, cssHooks = {}, cssProps = {}, userSelectProperty, defaultDisplay = {}, RE_DASH = /-([a-z])/ig;
  _$jscoverage['/base/style.js'].lineData[44]++;
  cssProps['float'] = 'cssFloat';
  _$jscoverage['/base/style.js'].lineData[46]++;
  function normalizeCssPropName(name) {
    _$jscoverage['/base/style.js'].functionData[1]++;
    _$jscoverage['/base/style.js'].lineData[47]++;
    return visit404_47_1(cssProps[name] || S.Features.getVendorCssPropName(name));
  }
  _$jscoverage['/base/style.js'].lineData[50]++;
  function upperCase() {
    _$jscoverage['/base/style.js'].functionData[2]++;
    _$jscoverage['/base/style.js'].lineData[51]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/base/style.js'].lineData[54]++;
  function camelCase(name) {
    _$jscoverage['/base/style.js'].functionData[3]++;
    _$jscoverage['/base/style.js'].lineData[56]++;
    return name.replace(rmsPrefix, 'ms-').replace(RE_DASH, upperCase);
  }
  _$jscoverage['/base/style.js'].lineData[59]++;
  function getDefaultDisplay(tagName) {
    _$jscoverage['/base/style.js'].functionData[4]++;
    _$jscoverage['/base/style.js'].lineData[60]++;
    var body, oldDisplay = defaultDisplay[tagName], elem;
    _$jscoverage['/base/style.js'].lineData[63]++;
    if (visit405_63_1(!defaultDisplay[tagName])) {
      _$jscoverage['/base/style.js'].lineData[64]++;
      body = visit406_64_1(doc.body || doc.documentElement);
      _$jscoverage['/base/style.js'].lineData[65]++;
      elem = doc.createElement(tagName);
      _$jscoverage['/base/style.js'].lineData[67]++;
      Dom.prepend(elem, body);
      _$jscoverage['/base/style.js'].lineData[68]++;
      oldDisplay = Dom.css(elem, 'display');
      _$jscoverage['/base/style.js'].lineData[69]++;
      body.removeChild(elem);
      _$jscoverage['/base/style.js'].lineData[71]++;
      defaultDisplay[tagName] = oldDisplay;
    }
    _$jscoverage['/base/style.js'].lineData[73]++;
    return oldDisplay;
  }
  _$jscoverage['/base/style.js'].lineData[76]++;
  S.mix(Dom, {
  _camelCase: camelCase, 
  _cssHooks: cssHooks, 
  _cssProps: cssProps, 
  _getComputedStyle: function(elem, name, computedStyle) {
  _$jscoverage['/base/style.js'].functionData[5]++;
  _$jscoverage['/base/style.js'].lineData[90]++;
  var val = '', width, minWidth, maxWidth, style, d = elem.ownerDocument;
  _$jscoverage['/base/style.js'].lineData[97]++;
  name = normalizeCssPropName(name);
  _$jscoverage['/base/style.js'].lineData[100]++;
  if ((computedStyle = (visit407_100_1(computedStyle || d.defaultView.getComputedStyle(elem, null))))) {
    _$jscoverage['/base/style.js'].lineData[101]++;
    val = visit408_101_1(computedStyle.getPropertyValue(name) || computedStyle[name]);
  }
  _$jscoverage['/base/style.js'].lineData[105]++;
  if (visit409_105_1(visit410_105_2(val === '') && !Dom.contains(d, elem))) {
    _$jscoverage['/base/style.js'].lineData[106]++;
    val = elem.style[name];
  }
  _$jscoverage['/base/style.js'].lineData[110]++;
  if (visit411_110_1(Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name))) {
    _$jscoverage['/base/style.js'].lineData[111]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[112]++;
    width = style.width;
    _$jscoverage['/base/style.js'].lineData[113]++;
    minWidth = style.minWidth;
    _$jscoverage['/base/style.js'].lineData[114]++;
    maxWidth = style.maxWidth;
    _$jscoverage['/base/style.js'].lineData[116]++;
    style.minWidth = style.maxWidth = style.width = val;
    _$jscoverage['/base/style.js'].lineData[117]++;
    val = computedStyle.width;
    _$jscoverage['/base/style.js'].lineData[119]++;
    style.width = width;
    _$jscoverage['/base/style.js'].lineData[120]++;
    style.minWidth = minWidth;
    _$jscoverage['/base/style.js'].lineData[121]++;
    style.maxWidth = maxWidth;
  }
  _$jscoverage['/base/style.js'].lineData[124]++;
  return val;
}, 
  style: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[6]++;
  _$jscoverage['/base/style.js'].lineData[137]++;
  var els = Dom.query(selector), k, ret, elem = els[0], i;
  _$jscoverage['/base/style.js'].lineData[142]++;
  if (visit412_142_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[143]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[144]++;
      for (i = els.length - 1; visit413_144_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[145]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[148]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[150]++;
  if (visit414_150_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[151]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[152]++;
    if (visit415_152_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[153]++;
      ret = style(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[155]++;
    return ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[157]++;
    for (i = els.length - 1; visit416_157_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[158]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[161]++;
  return undefined;
}, 
  css: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[7]++;
  _$jscoverage['/base/style.js'].lineData[174]++;
  var els = Dom.query(selector), elem = els[0], k, hook, ret, i;
  _$jscoverage['/base/style.js'].lineData[181]++;
  if (visit417_181_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[182]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[183]++;
      for (i = els.length - 1; visit418_183_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[184]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[187]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[190]++;
  name = camelCase(name);
  _$jscoverage['/base/style.js'].lineData[191]++;
  hook = cssHooks[name];
  _$jscoverage['/base/style.js'].lineData[193]++;
  if (visit419_193_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[195]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[196]++;
    if (visit420_196_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[198]++;
      if (visit421_198_1(!(visit422_198_2(hook && visit423_198_3('get' in hook && visit424_199_1((ret = hook.get(elem, true)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[201]++;
        ret = Dom._getComputedStyle(elem, name);
      }
    }
    _$jscoverage['/base/style.js'].lineData[204]++;
    return (visit425_204_1(typeof ret === 'undefined')) ? '' : ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[206]++;
    for (i = els.length - 1; visit426_206_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[207]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[210]++;
  return undefined;
}, 
  show: function(selector) {
  _$jscoverage['/base/style.js'].functionData[8]++;
  _$jscoverage['/base/style.js'].lineData[218]++;
  var els = Dom.query(selector), tagName, old, elem, i;
  _$jscoverage['/base/style.js'].lineData[222]++;
  for (i = els.length - 1; visit427_222_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[223]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[224]++;
    elem.style[DISPLAY] = visit428_224_1(Dom.data(elem, OLD_DISPLAY) || EMPTY);
    _$jscoverage['/base/style.js'].lineData[226]++;
    if (visit429_226_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[227]++;
      tagName = elem.tagName.toLowerCase();
      _$jscoverage['/base/style.js'].lineData[228]++;
      old = getDefaultDisplay(tagName);
      _$jscoverage['/base/style.js'].lineData[229]++;
      Dom.data(elem, OLD_DISPLAY, old);
      _$jscoverage['/base/style.js'].lineData[230]++;
      elem.style[DISPLAY] = old;
    }
  }
}, 
  hide: function(selector) {
  _$jscoverage['/base/style.js'].functionData[9]++;
  _$jscoverage['/base/style.js'].lineData[240]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[242]++;
  for (i = els.length - 1; visit430_242_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[243]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[244]++;
    var style = elem.style, old = style[DISPLAY];
    _$jscoverage['/base/style.js'].lineData[246]++;
    if (visit431_246_1(old !== NONE)) {
      _$jscoverage['/base/style.js'].lineData[247]++;
      if (visit432_247_1(old)) {
        _$jscoverage['/base/style.js'].lineData[248]++;
        Dom.data(elem, OLD_DISPLAY, old);
      }
      _$jscoverage['/base/style.js'].lineData[250]++;
      style[DISPLAY] = NONE;
    }
  }
}, 
  toggle: function(selector) {
  _$jscoverage['/base/style.js'].functionData[10]++;
  _$jscoverage['/base/style.js'].lineData[260]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[262]++;
  for (i = els.length - 1; visit433_262_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[263]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[264]++;
    if (visit434_264_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[265]++;
      Dom.show(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[267]++;
      Dom.hide(elem);
    }
  }
}, 
  addStyleSheet: function(refWin, cssText, id) {
  _$jscoverage['/base/style.js'].functionData[11]++;
  _$jscoverage['/base/style.js'].lineData[281]++;
  if (visit435_281_1(typeof refWin === 'string')) {
    _$jscoverage['/base/style.js'].lineData[282]++;
    id = cssText;
    _$jscoverage['/base/style.js'].lineData[283]++;
    cssText = refWin;
    _$jscoverage['/base/style.js'].lineData[285]++;
    refWin = globalWindow;
  }
  _$jscoverage['/base/style.js'].lineData[288]++;
  var doc = Dom.getDocument(refWin), elem;
  _$jscoverage['/base/style.js'].lineData[291]++;
  if (visit436_291_1(id && (id = id.replace('#', EMPTY)))) {
    _$jscoverage['/base/style.js'].lineData[292]++;
    elem = Dom.get('#' + id, doc);
  }
  _$jscoverage['/base/style.js'].lineData[296]++;
  if (visit437_296_1(elem)) {
    _$jscoverage['/base/style.js'].lineData[297]++;
    return;
  }
  _$jscoverage['/base/style.js'].lineData[300]++;
  elem = Dom.create('<style>', {
  id: id}, doc);
  _$jscoverage['/base/style.js'].lineData[303]++;
  Dom.get('head', doc).appendChild(elem);
  _$jscoverage['/base/style.js'].lineData[305]++;
  if (visit438_305_1(elem.styleSheet)) {
    _$jscoverage['/base/style.js'].lineData[306]++;
    elem.styleSheet.cssText = cssText;
  } else {
    _$jscoverage['/base/style.js'].lineData[308]++;
    elem.appendChild(doc.createTextNode(cssText));
  }
}, 
  unselectable: function(selector) {
  _$jscoverage['/base/style.js'].functionData[12]++;
  _$jscoverage['/base/style.js'].lineData[317]++;
  var _els = Dom.query(selector), elem, j, e, i = 0, excludes, style, els;
  _$jscoverage['/base/style.js'].lineData[325]++;
  if (visit439_325_1(userSelectProperty === undefined)) {
    _$jscoverage['/base/style.js'].lineData[326]++;
    userSelectProperty = S.Features.getVendorCssPropName('userSelect');
  }
  _$jscoverage['/base/style.js'].lineData[328]++;
  for (j = _els.length - 1; visit440_328_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[329]++;
    elem = _els[j];
    _$jscoverage['/base/style.js'].lineData[330]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[331]++;
    if (visit441_331_1(userSelectProperty in style)) {
      _$jscoverage['/base/style.js'].lineData[332]++;
      style[userSelectProperty] = 'none';
    } else {
      _$jscoverage['/base/style.js'].lineData[333]++;
      if (visit442_333_1(UA.ie)) {
        _$jscoverage['/base/style.js'].lineData[334]++;
        els = elem.getElementsByTagName('*');
        _$jscoverage['/base/style.js'].lineData[335]++;
        elem.setAttribute('unselectable', 'on');
        _$jscoverage['/base/style.js'].lineData[336]++;
        excludes = ['iframe', 'textarea', 'input', 'select'];
        _$jscoverage['/base/style.js'].lineData[337]++;
        while ((e = els[i++])) {
          _$jscoverage['/base/style.js'].lineData[338]++;
          if (visit443_338_1(!S.inArray(getNodeName(e), excludes))) {
            _$jscoverage['/base/style.js'].lineData[339]++;
            e.setAttribute('unselectable', 'on');
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
  _$jscoverage['/base/style.js'].lineData[400]++;
  S.each([WIDTH, HEIGHT], function(name) {
  _$jscoverage['/base/style.js'].functionData[13]++;
  _$jscoverage['/base/style.js'].lineData[401]++;
  Dom['inner' + S.ucfirst(name)] = function(selector) {
  _$jscoverage['/base/style.js'].functionData[14]++;
  _$jscoverage['/base/style.js'].lineData[402]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[403]++;
  return visit444_403_1(el && getWHIgnoreDisplay(el, name, PADDING_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[406]++;
  Dom['outer' + S.ucfirst(name)] = function(selector, includeMargin) {
  _$jscoverage['/base/style.js'].functionData[15]++;
  _$jscoverage['/base/style.js'].lineData[407]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[408]++;
  return visit445_408_1(el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[410]++;
  var which = visit446_410_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'];
  _$jscoverage['/base/style.js'].lineData[412]++;
  Dom[name] = function(selector, val) {
  _$jscoverage['/base/style.js'].functionData[16]++;
  _$jscoverage['/base/style.js'].lineData[413]++;
  var elem = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[414]++;
  if (visit447_414_1(val !== undefined)) {
    _$jscoverage['/base/style.js'].lineData[415]++;
    if (visit448_415_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[416]++;
      var computedStyle = getComputedStyle(elem);
      _$jscoverage['/base/style.js'].lineData[417]++;
      var isBorderBox = isBorderBoxFn(elem, computedStyle);
      _$jscoverage['/base/style.js'].lineData[418]++;
      if (visit449_418_1(isBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[419]++;
        val += getPBMWidth(elem, ['padding', 'border'], which, computedStyle);
      }
      _$jscoverage['/base/style.js'].lineData[421]++;
      return Dom.css(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[423]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[425]++;
  return visit450_425_1(elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[431]++;
  cssHooks[name] = {
  get: function(elem, computed) {
  _$jscoverage['/base/style.js'].functionData[17]++;
  _$jscoverage['/base/style.js'].lineData[436]++;
  var val;
  _$jscoverage['/base/style.js'].lineData[437]++;
  if (visit451_437_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[438]++;
    val = getWHIgnoreDisplay(elem, name) + 'px';
  }
  _$jscoverage['/base/style.js'].lineData[440]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[445]++;
  var cssShow = {
  position: 'absolute', 
  visibility: 'hidden', 
  display: 'block'};
  _$jscoverage['/base/style.js'].lineData[447]++;
  S.each(['left', 'top'], function(name) {
  _$jscoverage['/base/style.js'].functionData[18]++;
  _$jscoverage['/base/style.js'].lineData[448]++;
  cssHooks[name] = {
  get: function(el, computed) {
  _$jscoverage['/base/style.js'].functionData[19]++;
  _$jscoverage['/base/style.js'].lineData[450]++;
  var val, isAutoPosition, position;
  _$jscoverage['/base/style.js'].lineData[453]++;
  if (visit452_453_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[454]++;
    position = Dom.css(el, 'position');
    _$jscoverage['/base/style.js'].lineData[455]++;
    if (visit453_455_1(position === 'static')) {
      _$jscoverage['/base/style.js'].lineData[456]++;
      return 'auto';
    }
    _$jscoverage['/base/style.js'].lineData[458]++;
    val = Dom._getComputedStyle(el, name);
    _$jscoverage['/base/style.js'].lineData[459]++;
    isAutoPosition = visit454_459_1(val === 'auto');
    _$jscoverage['/base/style.js'].lineData[460]++;
    if (visit455_460_1(isAutoPosition && visit456_460_2(position === 'relative'))) {
      _$jscoverage['/base/style.js'].lineData[461]++;
      return '0px';
    }
    _$jscoverage['/base/style.js'].lineData[464]++;
    if (visit457_464_1(isAutoPosition || NO_PX_REG.test(val))) {
      _$jscoverage['/base/style.js'].lineData[465]++;
      val = getPosition(el)[name] + 'px';
    }
  }
  _$jscoverage['/base/style.js'].lineData[468]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[473]++;
  function swap(elem, options, callback) {
    _$jscoverage['/base/style.js'].functionData[20]++;
    _$jscoverage['/base/style.js'].lineData[474]++;
    var old = {}, style = elem.style, name;
    _$jscoverage['/base/style.js'].lineData[479]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[480]++;
      old[name] = style[name];
      _$jscoverage['/base/style.js'].lineData[481]++;
      style[name] = options[name];
    }
    _$jscoverage['/base/style.js'].lineData[484]++;
    callback.call(elem);
    _$jscoverage['/base/style.js'].lineData[487]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[488]++;
      style[name] = old[name];
    }
  }
  _$jscoverage['/base/style.js'].lineData[492]++;
  function style(elem, name, val) {
    _$jscoverage['/base/style.js'].functionData[21]++;
    _$jscoverage['/base/style.js'].lineData[493]++;
    var elStyle, ret, hook;
    _$jscoverage['/base/style.js'].lineData[496]++;
    if (visit458_496_1(visit459_496_2(elem.nodeType === 3) || visit460_497_1(visit461_497_2(elem.nodeType === 8) || !(elStyle = elem.style)))) {
      _$jscoverage['/base/style.js'].lineData[498]++;
      return undefined;
    }
    _$jscoverage['/base/style.js'].lineData[500]++;
    name = camelCase(name);
    _$jscoverage['/base/style.js'].lineData[501]++;
    hook = cssHooks[name];
    _$jscoverage['/base/style.js'].lineData[502]++;
    name = normalizeCssPropName(name);
    _$jscoverage['/base/style.js'].lineData[504]++;
    if (visit462_504_1(val !== undefined)) {
      _$jscoverage['/base/style.js'].lineData[506]++;
      if (visit463_506_1(visit464_506_2(val === null) || visit465_506_3(val === EMPTY))) {
        _$jscoverage['/base/style.js'].lineData[507]++;
        val = EMPTY;
      } else {
        _$jscoverage['/base/style.js'].lineData[508]++;
        if (visit466_508_1(!isNaN(Number(val)) && !cssNumber[name])) {
          _$jscoverage['/base/style.js'].lineData[510]++;
          val += DEFAULT_UNIT;
        }
      }
      _$jscoverage['/base/style.js'].lineData[512]++;
      if (visit467_512_1(hook && hook.set)) {
        _$jscoverage['/base/style.js'].lineData[513]++;
        val = hook.set(elem, val);
      }
      _$jscoverage['/base/style.js'].lineData[515]++;
      if (visit468_515_1(val !== undefined)) {
        _$jscoverage['/base/style.js'].lineData[517]++;
        try {
          _$jscoverage['/base/style.js'].lineData[519]++;
          elStyle[name] = val;
        }        catch (e) {
  _$jscoverage['/base/style.js'].lineData[521]++;
  logger.warn('css set error:' + e);
}
        _$jscoverage['/base/style.js'].lineData[524]++;
        if (visit469_524_1(visit470_524_2(val === EMPTY) && elStyle.removeAttribute)) {
          _$jscoverage['/base/style.js'].lineData[525]++;
          elStyle.removeAttribute(name);
        }
      }
      _$jscoverage['/base/style.js'].lineData[528]++;
      if (visit471_528_1(!elStyle.cssText)) {
        _$jscoverage['/base/style.js'].lineData[531]++;
        if (visit472_531_1(UA.webkit)) {
          _$jscoverage['/base/style.js'].lineData[532]++;
          elStyle = elem.outerHTML;
        }
        _$jscoverage['/base/style.js'].lineData[534]++;
        elem.removeAttribute('style');
      }
      _$jscoverage['/base/style.js'].lineData[536]++;
      return undefined;
    } else {
      _$jscoverage['/base/style.js'].lineData[539]++;
      if (visit473_539_1(!(visit474_539_2(hook && visit475_539_3('get' in hook && visit476_540_1((ret = hook.get(elem, false)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[542]++;
        ret = elStyle[name];
      }
      _$jscoverage['/base/style.js'].lineData[544]++;
      return visit477_544_1(ret === undefined) ? '' : ret;
    }
  }
  _$jscoverage['/base/style.js'].lineData[549]++;
  function getWHIgnoreDisplay(elem) {
    _$jscoverage['/base/style.js'].functionData[22]++;
    _$jscoverage['/base/style.js'].lineData[550]++;
    var val, args = arguments;
    _$jscoverage['/base/style.js'].lineData[553]++;
    if (visit478_553_1(elem.offsetWidth !== 0)) {
      _$jscoverage['/base/style.js'].lineData[554]++;
      val = getWH.apply(undefined, args);
    } else {
      _$jscoverage['/base/style.js'].lineData[556]++;
      swap(elem, cssShow, function() {
  _$jscoverage['/base/style.js'].functionData[23]++;
  _$jscoverage['/base/style.js'].lineData[557]++;
  val = getWH.apply(undefined, args);
});
    }
    _$jscoverage['/base/style.js'].lineData[560]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[563]++;
  function getPBMWidth(elem, props, which, computedStyle) {
    _$jscoverage['/base/style.js'].functionData[24]++;
    _$jscoverage['/base/style.js'].lineData[564]++;
    var value = 0, prop, j, i;
    _$jscoverage['/base/style.js'].lineData[565]++;
    for (j = 0; visit479_565_1(j < props.length); j++) {
      _$jscoverage['/base/style.js'].lineData[566]++;
      prop = props[j];
      _$jscoverage['/base/style.js'].lineData[567]++;
      if (visit480_567_1(prop)) {
        _$jscoverage['/base/style.js'].lineData[568]++;
        for (i = 0; visit481_568_1(i < which.length); i++) {
          _$jscoverage['/base/style.js'].lineData[569]++;
          var cssProp;
          _$jscoverage['/base/style.js'].lineData[570]++;
          if (visit482_570_1(prop === 'border')) {
            _$jscoverage['/base/style.js'].lineData[571]++;
            cssProp = prop + which[i] + 'Width';
          } else {
            _$jscoverage['/base/style.js'].lineData[573]++;
            cssProp = prop + which[i];
          }
          _$jscoverage['/base/style.js'].lineData[575]++;
          value += visit483_575_1(parseFloat(Dom._getComputedStyle(elem, cssProp, computedStyle)) || 0);
        }
      }
    }
    _$jscoverage['/base/style.js'].lineData[579]++;
    return value;
  }
  _$jscoverage['/base/style.js'].lineData[582]++;
  function isBorderBoxFn(elem, computedStyle) {
    _$jscoverage['/base/style.js'].functionData[25]++;
    _$jscoverage['/base/style.js'].lineData[583]++;
    return visit484_583_1(Dom._getComputedStyle(elem, 'boxSizing', computedStyle) === 'border-box');
  }
  _$jscoverage['/base/style.js'].lineData[586]++;
  function getComputedStyle(elem) {
    _$jscoverage['/base/style.js'].functionData[26]++;
    _$jscoverage['/base/style.js'].lineData[587]++;
    var doc = elem.ownerDocument, computedStyle;
    _$jscoverage['/base/style.js'].lineData[589]++;
    if (visit485_589_1(doc.defaultView)) {
      _$jscoverage['/base/style.js'].lineData[591]++;
      computedStyle = doc.defaultView.getComputedStyle(elem, null);
    }
    _$jscoverage['/base/style.js'].lineData[593]++;
    return computedStyle;
  }
  _$jscoverage['/base/style.js'].lineData[604]++;
  function getWH(elem, name, extra) {
    _$jscoverage['/base/style.js'].functionData[27]++;
    _$jscoverage['/base/style.js'].lineData[605]++;
    if (visit486_605_1(S.isWindow(elem))) {
      _$jscoverage['/base/style.js'].lineData[606]++;
      return visit487_606_1(name === WIDTH) ? Dom.viewportWidth(elem) : Dom.viewportHeight(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[607]++;
      if (visit488_607_1(elem.nodeType === 9)) {
        _$jscoverage['/base/style.js'].lineData[608]++;
        return visit489_608_1(name === WIDTH) ? Dom.docWidth(elem) : Dom.docHeight(elem);
      }
    }
    _$jscoverage['/base/style.js'].lineData[610]++;
    var which = visit490_610_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'], borderBoxValue = visit491_611_1(name === WIDTH) ? elem.offsetWidth : elem.offsetHeight;
    _$jscoverage['/base/style.js'].lineData[612]++;
    var computedStyle = getComputedStyle(elem);
    _$jscoverage['/base/style.js'].lineData[613]++;
    var isBorderBox = isBorderBoxFn(elem, computedStyle);
    _$jscoverage['/base/style.js'].lineData[614]++;
    var cssBoxValue = 0;
    _$jscoverage['/base/style.js'].lineData[615]++;
    if (visit492_615_1(visit493_615_2(borderBoxValue == null) || visit494_615_3(borderBoxValue <= 0))) {
      _$jscoverage['/base/style.js'].lineData[616]++;
      borderBoxValue = undefined;
      _$jscoverage['/base/style.js'].lineData[618]++;
      cssBoxValue = Dom._getComputedStyle(elem, name, computedStyle);
      _$jscoverage['/base/style.js'].lineData[619]++;
      if (visit495_619_1(visit496_619_2(cssBoxValue == null) || visit497_619_3((Number(cssBoxValue)) < 0))) {
        _$jscoverage['/base/style.js'].lineData[620]++;
        cssBoxValue = visit498_620_1(elem.style[name] || 0);
      }
      _$jscoverage['/base/style.js'].lineData[623]++;
      cssBoxValue = visit499_623_1(parseFloat(cssBoxValue) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[625]++;
    if (visit500_625_1(extra === undefined)) {
      _$jscoverage['/base/style.js'].lineData[626]++;
      extra = isBorderBox ? BORDER_INDEX : CONTENT_INDEX;
    }
    _$jscoverage['/base/style.js'].lineData[628]++;
    var borderBoxValueOrIsBorderBox = visit501_628_1(visit502_628_2(borderBoxValue !== undefined) || isBorderBox);
    _$jscoverage['/base/style.js'].lineData[629]++;
    var val = visit503_629_1(borderBoxValue || cssBoxValue);
    _$jscoverage['/base/style.js'].lineData[630]++;
    if (visit504_630_1(extra === CONTENT_INDEX)) {
      _$jscoverage['/base/style.js'].lineData[631]++;
      if (visit505_631_1(borderBoxValueOrIsBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[632]++;
        return val - getPBMWidth(elem, ['border', 'padding'], which, computedStyle);
      } else {
        _$jscoverage['/base/style.js'].lineData[635]++;
        return cssBoxValue;
      }
    } else {
      _$jscoverage['/base/style.js'].lineData[637]++;
      if (visit506_637_1(borderBoxValueOrIsBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[638]++;
        return val + (visit507_638_1(extra === BORDER_INDEX) ? 0 : (visit508_639_1(extra === PADDING_INDEX) ? -getPBMWidth(elem, ['border'], which, computedStyle) : getPBMWidth(elem, ['margin'], which, computedStyle)));
      } else {
        _$jscoverage['/base/style.js'].lineData[643]++;
        return cssBoxValue + getPBMWidth(elem, BOX_MODELS.slice(extra), which, computedStyle);
      }
    }
  }
  _$jscoverage['/base/style.js'].lineData[648]++;
  var ROOT_REG = /^(?:body|html)$/i;
  _$jscoverage['/base/style.js'].lineData[650]++;
  function getPosition(el) {
    _$jscoverage['/base/style.js'].functionData[28]++;
    _$jscoverage['/base/style.js'].lineData[651]++;
    var offsetParent, offset, parentOffset = {
  top: 0, 
  left: 0};
    _$jscoverage['/base/style.js'].lineData[655]++;
    if (visit509_655_1(Dom.css(el, 'position') === 'fixed')) {
      _$jscoverage['/base/style.js'].lineData[656]++;
      offset = el.getBoundingClientRect();
    } else {
      _$jscoverage['/base/style.js'].lineData[661]++;
      offsetParent = getOffsetParent(el);
      _$jscoverage['/base/style.js'].lineData[662]++;
      offset = Dom.offset(el);
      _$jscoverage['/base/style.js'].lineData[663]++;
      parentOffset = Dom.offset(offsetParent);
      _$jscoverage['/base/style.js'].lineData[664]++;
      parentOffset.top += visit510_664_1(parseFloat(Dom.css(offsetParent, 'borderTopWidth')) || 0);
      _$jscoverage['/base/style.js'].lineData[665]++;
      parentOffset.left += visit511_665_1(parseFloat(Dom.css(offsetParent, 'borderLeftWidth')) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[668]++;
    offset.top -= visit512_668_1(parseFloat(Dom.css(el, 'marginTop')) || 0);
    _$jscoverage['/base/style.js'].lineData[669]++;
    offset.left -= visit513_669_1(parseFloat(Dom.css(el, 'marginLeft')) || 0);
    _$jscoverage['/base/style.js'].lineData[673]++;
    return {
  top: offset.top - parentOffset.top, 
  left: offset.left - parentOffset.left};
  }
  _$jscoverage['/base/style.js'].lineData[679]++;
  function getOffsetParent(el) {
    _$jscoverage['/base/style.js'].functionData[29]++;
    _$jscoverage['/base/style.js'].lineData[680]++;
    var offsetParent = visit514_680_1(el.offsetParent || (visit515_680_2(el.ownerDocument || doc)).body);
    _$jscoverage['/base/style.js'].lineData[681]++;
    while (visit516_681_1(offsetParent && visit517_681_2(!ROOT_REG.test(offsetParent.nodeName) && visit518_682_1(Dom.css(offsetParent, 'position') === 'static')))) {
      _$jscoverage['/base/style.js'].lineData[683]++;
      offsetParent = offsetParent.offsetParent;
    }
    _$jscoverage['/base/style.js'].lineData[685]++;
    return offsetParent;
  }
  _$jscoverage['/base/style.js'].lineData[688]++;
  return Dom;
});
