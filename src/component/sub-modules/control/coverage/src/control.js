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
if (! _$jscoverage['/control.js']) {
  _$jscoverage['/control.js'] = {};
  _$jscoverage['/control.js'].lineData = [];
  _$jscoverage['/control.js'].lineData[6] = 0;
  _$jscoverage['/control.js'].lineData[7] = 0;
  _$jscoverage['/control.js'].lineData[8] = 0;
  _$jscoverage['/control.js'].lineData[9] = 0;
  _$jscoverage['/control.js'].lineData[10] = 0;
  _$jscoverage['/control.js'].lineData[11] = 0;
  _$jscoverage['/control.js'].lineData[12] = 0;
  _$jscoverage['/control.js'].lineData[13] = 0;
  _$jscoverage['/control.js'].lineData[14] = 0;
  _$jscoverage['/control.js'].lineData[15] = 0;
  _$jscoverage['/control.js'].lineData[16] = 0;
  _$jscoverage['/control.js'].lineData[17] = 0;
  _$jscoverage['/control.js'].lineData[18] = 0;
  _$jscoverage['/control.js'].lineData[19] = 0;
  _$jscoverage['/control.js'].lineData[20] = 0;
  _$jscoverage['/control.js'].lineData[21] = 0;
  _$jscoverage['/control.js'].lineData[22] = 0;
  _$jscoverage['/control.js'].lineData[23] = 0;
  _$jscoverage['/control.js'].lineData[25] = 0;
  _$jscoverage['/control.js'].lineData[26] = 0;
  _$jscoverage['/control.js'].lineData[27] = 0;
  _$jscoverage['/control.js'].lineData[29] = 0;
  _$jscoverage['/control.js'].lineData[30] = 0;
  _$jscoverage['/control.js'].lineData[32] = 0;
  _$jscoverage['/control.js'].lineData[35] = 0;
  _$jscoverage['/control.js'].lineData[36] = 0;
  _$jscoverage['/control.js'].lineData[41] = 0;
  _$jscoverage['/control.js'].lineData[42] = 0;
  _$jscoverage['/control.js'].lineData[43] = 0;
  _$jscoverage['/control.js'].lineData[44] = 0;
  _$jscoverage['/control.js'].lineData[46] = 0;
  _$jscoverage['/control.js'].lineData[49] = 0;
  _$jscoverage['/control.js'].lineData[50] = 0;
  _$jscoverage['/control.js'].lineData[51] = 0;
  _$jscoverage['/control.js'].lineData[53] = 0;
  _$jscoverage['/control.js'].lineData[56] = 0;
  _$jscoverage['/control.js'].lineData[57] = 0;
  _$jscoverage['/control.js'].lineData[60] = 0;
  _$jscoverage['/control.js'].lineData[64] = 0;
  _$jscoverage['/control.js'].lineData[65] = 0;
  _$jscoverage['/control.js'].lineData[67] = 0;
  _$jscoverage['/control.js'].lineData[69] = 0;
  _$jscoverage['/control.js'].lineData[70] = 0;
  _$jscoverage['/control.js'].lineData[71] = 0;
  _$jscoverage['/control.js'].lineData[78] = 0;
  _$jscoverage['/control.js'].lineData[79] = 0;
  _$jscoverage['/control.js'].lineData[82] = 0;
  _$jscoverage['/control.js'].lineData[83] = 0;
  _$jscoverage['/control.js'].lineData[91] = 0;
  _$jscoverage['/control.js'].lineData[111] = 0;
  _$jscoverage['/control.js'].lineData[112] = 0;
  _$jscoverage['/control.js'].lineData[113] = 0;
  _$jscoverage['/control.js'].lineData[114] = 0;
  _$jscoverage['/control.js'].lineData[115] = 0;
  _$jscoverage['/control.js'].lineData[116] = 0;
  _$jscoverage['/control.js'].lineData[120] = 0;
  _$jscoverage['/control.js'].lineData[121] = 0;
  _$jscoverage['/control.js'].lineData[123] = 0;
  _$jscoverage['/control.js'].lineData[124] = 0;
  _$jscoverage['/control.js'].lineData[130] = 0;
  _$jscoverage['/control.js'].lineData[143] = 0;
  _$jscoverage['/control.js'].lineData[144] = 0;
  _$jscoverage['/control.js'].lineData[145] = 0;
  _$jscoverage['/control.js'].lineData[146] = 0;
  _$jscoverage['/control.js'].lineData[150] = 0;
  _$jscoverage['/control.js'].lineData[151] = 0;
  _$jscoverage['/control.js'].lineData[152] = 0;
  _$jscoverage['/control.js'].lineData[153] = 0;
  _$jscoverage['/control.js'].lineData[155] = 0;
  _$jscoverage['/control.js'].lineData[156] = 0;
  _$jscoverage['/control.js'].lineData[158] = 0;
  _$jscoverage['/control.js'].lineData[159] = 0;
  _$jscoverage['/control.js'].lineData[161] = 0;
  _$jscoverage['/control.js'].lineData[162] = 0;
  _$jscoverage['/control.js'].lineData[165] = 0;
  _$jscoverage['/control.js'].lineData[166] = 0;
  _$jscoverage['/control.js'].lineData[169] = 0;
  _$jscoverage['/control.js'].lineData[170] = 0;
  _$jscoverage['/control.js'].lineData[171] = 0;
  _$jscoverage['/control.js'].lineData[173] = 0;
  _$jscoverage['/control.js'].lineData[174] = 0;
  _$jscoverage['/control.js'].lineData[176] = 0;
  _$jscoverage['/control.js'].lineData[178] = 0;
  _$jscoverage['/control.js'].lineData[179] = 0;
  _$jscoverage['/control.js'].lineData[181] = 0;
  _$jscoverage['/control.js'].lineData[190] = 0;
  _$jscoverage['/control.js'].lineData[193] = 0;
  _$jscoverage['/control.js'].lineData[194] = 0;
  _$jscoverage['/control.js'].lineData[195] = 0;
  _$jscoverage['/control.js'].lineData[196] = 0;
  _$jscoverage['/control.js'].lineData[200] = 0;
  _$jscoverage['/control.js'].lineData[201] = 0;
  _$jscoverage['/control.js'].lineData[202] = 0;
  _$jscoverage['/control.js'].lineData[204] = 0;
  _$jscoverage['/control.js'].lineData[205] = 0;
  _$jscoverage['/control.js'].lineData[213] = 0;
  _$jscoverage['/control.js'].lineData[215] = 0;
  _$jscoverage['/control.js'].lineData[216] = 0;
  _$jscoverage['/control.js'].lineData[217] = 0;
  _$jscoverage['/control.js'].lineData[218] = 0;
  _$jscoverage['/control.js'].lineData[221] = 0;
  _$jscoverage['/control.js'].lineData[222] = 0;
  _$jscoverage['/control.js'].lineData[224] = 0;
  _$jscoverage['/control.js'].lineData[225] = 0;
  _$jscoverage['/control.js'].lineData[226] = 0;
  _$jscoverage['/control.js'].lineData[227] = 0;
  _$jscoverage['/control.js'].lineData[229] = 0;
  _$jscoverage['/control.js'].lineData[235] = 0;
  _$jscoverage['/control.js'].lineData[237] = 0;
  _$jscoverage['/control.js'].lineData[243] = 0;
  _$jscoverage['/control.js'].lineData[246] = 0;
  _$jscoverage['/control.js'].lineData[254] = 0;
  _$jscoverage['/control.js'].lineData[266] = 0;
  _$jscoverage['/control.js'].lineData[267] = 0;
  _$jscoverage['/control.js'].lineData[273] = 0;
  _$jscoverage['/control.js'].lineData[274] = 0;
  _$jscoverage['/control.js'].lineData[276] = 0;
  _$jscoverage['/control.js'].lineData[277] = 0;
  _$jscoverage['/control.js'].lineData[280] = 0;
  _$jscoverage['/control.js'].lineData[282] = 0;
  _$jscoverage['/control.js'].lineData[283] = 0;
  _$jscoverage['/control.js'].lineData[285] = 0;
  _$jscoverage['/control.js'].lineData[291] = 0;
  _$jscoverage['/control.js'].lineData[292] = 0;
  _$jscoverage['/control.js'].lineData[294] = 0;
  _$jscoverage['/control.js'].lineData[302] = 0;
  _$jscoverage['/control.js'].lineData[304] = 0;
  _$jscoverage['/control.js'].lineData[305] = 0;
  _$jscoverage['/control.js'].lineData[313] = 0;
  _$jscoverage['/control.js'].lineData[314] = 0;
  _$jscoverage['/control.js'].lineData[315] = 0;
  _$jscoverage['/control.js'].lineData[322] = 0;
  _$jscoverage['/control.js'].lineData[330] = 0;
  _$jscoverage['/control.js'].lineData[331] = 0;
  _$jscoverage['/control.js'].lineData[332] = 0;
  _$jscoverage['/control.js'].lineData[333] = 0;
  _$jscoverage['/control.js'].lineData[339] = 0;
  _$jscoverage['/control.js'].lineData[346] = 0;
  _$jscoverage['/control.js'].lineData[347] = 0;
  _$jscoverage['/control.js'].lineData[348] = 0;
  _$jscoverage['/control.js'].lineData[349] = 0;
  _$jscoverage['/control.js'].lineData[355] = 0;
  _$jscoverage['/control.js'].lineData[357] = 0;
  _$jscoverage['/control.js'].lineData[359] = 0;
  _$jscoverage['/control.js'].lineData[363] = 0;
  _$jscoverage['/control.js'].lineData[366] = 0;
  _$jscoverage['/control.js'].lineData[367] = 0;
  _$jscoverage['/control.js'].lineData[368] = 0;
  _$jscoverage['/control.js'].lineData[370] = 0;
  _$jscoverage['/control.js'].lineData[371] = 0;
  _$jscoverage['/control.js'].lineData[373] = 0;
  _$jscoverage['/control.js'].lineData[374] = 0;
  _$jscoverage['/control.js'].lineData[376] = 0;
  _$jscoverage['/control.js'].lineData[377] = 0;
  _$jscoverage['/control.js'].lineData[379] = 0;
  _$jscoverage['/control.js'].lineData[380] = 0;
  _$jscoverage['/control.js'].lineData[382] = 0;
  _$jscoverage['/control.js'].lineData[383] = 0;
  _$jscoverage['/control.js'].lineData[384] = 0;
  _$jscoverage['/control.js'].lineData[387] = 0;
  _$jscoverage['/control.js'].lineData[396] = 0;
  _$jscoverage['/control.js'].lineData[400] = 0;
  _$jscoverage['/control.js'].lineData[401] = 0;
  _$jscoverage['/control.js'].lineData[411] = 0;
  _$jscoverage['/control.js'].lineData[415] = 0;
  _$jscoverage['/control.js'].lineData[416] = 0;
  _$jscoverage['/control.js'].lineData[426] = 0;
  _$jscoverage['/control.js'].lineData[427] = 0;
  _$jscoverage['/control.js'].lineData[428] = 0;
  _$jscoverage['/control.js'].lineData[432] = 0;
  _$jscoverage['/control.js'].lineData[433] = 0;
  _$jscoverage['/control.js'].lineData[446] = 0;
  _$jscoverage['/control.js'].lineData[449] = 0;
  _$jscoverage['/control.js'].lineData[450] = 0;
  _$jscoverage['/control.js'].lineData[451] = 0;
  _$jscoverage['/control.js'].lineData[453] = 0;
  _$jscoverage['/control.js'].lineData[454] = 0;
  _$jscoverage['/control.js'].lineData[458] = 0;
  _$jscoverage['/control.js'].lineData[461] = 0;
  _$jscoverage['/control.js'].lineData[462] = 0;
  _$jscoverage['/control.js'].lineData[464] = 0;
  _$jscoverage['/control.js'].lineData[465] = 0;
  _$jscoverage['/control.js'].lineData[472] = 0;
  _$jscoverage['/control.js'].lineData[473] = 0;
  _$jscoverage['/control.js'].lineData[485] = 0;
  _$jscoverage['/control.js'].lineData[487] = 0;
  _$jscoverage['/control.js'].lineData[488] = 0;
  _$jscoverage['/control.js'].lineData[493] = 0;
  _$jscoverage['/control.js'].lineData[494] = 0;
  _$jscoverage['/control.js'].lineData[506] = 0;
  _$jscoverage['/control.js'].lineData[507] = 0;
  _$jscoverage['/control.js'].lineData[516] = 0;
  _$jscoverage['/control.js'].lineData[517] = 0;
  _$jscoverage['/control.js'].lineData[521] = 0;
  _$jscoverage['/control.js'].lineData[522] = 0;
  _$jscoverage['/control.js'].lineData[531] = 0;
  _$jscoverage['/control.js'].lineData[532] = 0;
  _$jscoverage['/control.js'].lineData[536] = 0;
  _$jscoverage['/control.js'].lineData[537] = 0;
  _$jscoverage['/control.js'].lineData[538] = 0;
  _$jscoverage['/control.js'].lineData[539] = 0;
  _$jscoverage['/control.js'].lineData[541] = 0;
  _$jscoverage['/control.js'].lineData[550] = 0;
  _$jscoverage['/control.js'].lineData[551] = 0;
  _$jscoverage['/control.js'].lineData[553] = 0;
  _$jscoverage['/control.js'].lineData[557] = 0;
  _$jscoverage['/control.js'].lineData[558] = 0;
  _$jscoverage['/control.js'].lineData[568] = 0;
  _$jscoverage['/control.js'].lineData[569] = 0;
  _$jscoverage['/control.js'].lineData[570] = 0;
  _$jscoverage['/control.js'].lineData[575] = 0;
  _$jscoverage['/control.js'].lineData[579] = 0;
  _$jscoverage['/control.js'].lineData[583] = 0;
  _$jscoverage['/control.js'].lineData[585] = 0;
  _$jscoverage['/control.js'].lineData[586] = 0;
  _$jscoverage['/control.js'].lineData[587] = 0;
  _$jscoverage['/control.js'].lineData[588] = 0;
  _$jscoverage['/control.js'].lineData[589] = 0;
  _$jscoverage['/control.js'].lineData[591] = 0;
  _$jscoverage['/control.js'].lineData[596] = 0;
  _$jscoverage['/control.js'].lineData[597] = 0;
  _$jscoverage['/control.js'].lineData[598] = 0;
  _$jscoverage['/control.js'].lineData[599] = 0;
  _$jscoverage['/control.js'].lineData[600] = 0;
  _$jscoverage['/control.js'].lineData[612] = 0;
  _$jscoverage['/control.js'].lineData[614] = 0;
  _$jscoverage['/control.js'].lineData[615] = 0;
  _$jscoverage['/control.js'].lineData[616] = 0;
  _$jscoverage['/control.js'].lineData[618] = 0;
  _$jscoverage['/control.js'].lineData[622] = 0;
  _$jscoverage['/control.js'].lineData[623] = 0;
  _$jscoverage['/control.js'].lineData[624] = 0;
  _$jscoverage['/control.js'].lineData[626] = 0;
  _$jscoverage['/control.js'].lineData[629] = 0;
  _$jscoverage['/control.js'].lineData[630] = 0;
  _$jscoverage['/control.js'].lineData[631] = 0;
  _$jscoverage['/control.js'].lineData[632] = 0;
  _$jscoverage['/control.js'].lineData[634] = 0;
  _$jscoverage['/control.js'].lineData[636] = 0;
  _$jscoverage['/control.js'].lineData[637] = 0;
  _$jscoverage['/control.js'].lineData[646] = 0;
  _$jscoverage['/control.js'].lineData[647] = 0;
  _$jscoverage['/control.js'].lineData[652] = 0;
  _$jscoverage['/control.js'].lineData[653] = 0;
  _$jscoverage['/control.js'].lineData[655] = 0;
  _$jscoverage['/control.js'].lineData[665] = 0;
  _$jscoverage['/control.js'].lineData[672] = 0;
  _$jscoverage['/control.js'].lineData[680] = 0;
  _$jscoverage['/control.js'].lineData[681] = 0;
  _$jscoverage['/control.js'].lineData[682] = 0;
  _$jscoverage['/control.js'].lineData[683] = 0;
  _$jscoverage['/control.js'].lineData[691] = 0;
  _$jscoverage['/control.js'].lineData[692] = 0;
  _$jscoverage['/control.js'].lineData[693] = 0;
  _$jscoverage['/control.js'].lineData[697] = 0;
  _$jscoverage['/control.js'].lineData[698] = 0;
  _$jscoverage['/control.js'].lineData[703] = 0;
  _$jscoverage['/control.js'].lineData[704] = 0;
  _$jscoverage['/control.js'].lineData[709] = 0;
  _$jscoverage['/control.js'].lineData[716] = 0;
  _$jscoverage['/control.js'].lineData[720] = 0;
  _$jscoverage['/control.js'].lineData[724] = 0;
  _$jscoverage['/control.js'].lineData[725] = 0;
  _$jscoverage['/control.js'].lineData[727] = 0;
  _$jscoverage['/control.js'].lineData[728] = 0;
  _$jscoverage['/control.js'].lineData[733] = 0;
  _$jscoverage['/control.js'].lineData[736] = 0;
  _$jscoverage['/control.js'].lineData[737] = 0;
  _$jscoverage['/control.js'].lineData[739] = 0;
  _$jscoverage['/control.js'].lineData[742] = 0;
  _$jscoverage['/control.js'].lineData[749] = 0;
  _$jscoverage['/control.js'].lineData[752] = 0;
  _$jscoverage['/control.js'].lineData[759] = 0;
  _$jscoverage['/control.js'].lineData[763] = 0;
  _$jscoverage['/control.js'].lineData[764] = 0;
  _$jscoverage['/control.js'].lineData[766] = 0;
  _$jscoverage['/control.js'].lineData[773] = 0;
  _$jscoverage['/control.js'].lineData[776] = 0;
  _$jscoverage['/control.js'].lineData[780] = 0;
  _$jscoverage['/control.js'].lineData[784] = 0;
  _$jscoverage['/control.js'].lineData[785] = 0;
  _$jscoverage['/control.js'].lineData[786] = 0;
  _$jscoverage['/control.js'].lineData[787] = 0;
  _$jscoverage['/control.js'].lineData[789] = 0;
  _$jscoverage['/control.js'].lineData[790] = 0;
  _$jscoverage['/control.js'].lineData[795] = 0;
  _$jscoverage['/control.js'].lineData[796] = 0;
  _$jscoverage['/control.js'].lineData[799] = 0;
  _$jscoverage['/control.js'].lineData[802] = 0;
  _$jscoverage['/control.js'].lineData[806] = 0;
  _$jscoverage['/control.js'].lineData[812] = 0;
  _$jscoverage['/control.js'].lineData[821] = 0;
  _$jscoverage['/control.js'].lineData[823] = 0;
  _$jscoverage['/control.js'].lineData[824] = 0;
  _$jscoverage['/control.js'].lineData[825] = 0;
  _$jscoverage['/control.js'].lineData[844] = 0;
  _$jscoverage['/control.js'].lineData[862] = 0;
  _$jscoverage['/control.js'].lineData[914] = 0;
  _$jscoverage['/control.js'].lineData[915] = 0;
  _$jscoverage['/control.js'].lineData[917] = 0;
  _$jscoverage['/control.js'].lineData[985] = 0;
  _$jscoverage['/control.js'].lineData[987] = 0;
  _$jscoverage['/control.js'].lineData[988] = 0;
  _$jscoverage['/control.js'].lineData[989] = 0;
  _$jscoverage['/control.js'].lineData[991] = 0;
  _$jscoverage['/control.js'].lineData[992] = 0;
  _$jscoverage['/control.js'].lineData[995] = 0;
  _$jscoverage['/control.js'].lineData[998] = 0;
  _$jscoverage['/control.js'].lineData[1116] = 0;
  _$jscoverage['/control.js'].lineData[1163] = 0;
  _$jscoverage['/control.js'].lineData[1164] = 0;
  _$jscoverage['/control.js'].lineData[1165] = 0;
  _$jscoverage['/control.js'].lineData[1166] = 0;
  _$jscoverage['/control.js'].lineData[1168] = 0;
  _$jscoverage['/control.js'].lineData[1171] = 0;
  _$jscoverage['/control.js'].lineData[1196] = 0;
  _$jscoverage['/control.js'].lineData[1211] = 0;
  _$jscoverage['/control.js'].lineData[1302] = 0;
  _$jscoverage['/control.js'].lineData[1303] = 0;
  _$jscoverage['/control.js'].lineData[1305] = 0;
  _$jscoverage['/control.js'].lineData[1306] = 0;
  _$jscoverage['/control.js'].lineData[1336] = 0;
  _$jscoverage['/control.js'].lineData[1338] = 0;
  _$jscoverage['/control.js'].lineData[1344] = 0;
  _$jscoverage['/control.js'].lineData[1345] = 0;
  _$jscoverage['/control.js'].lineData[1348] = 0;
  _$jscoverage['/control.js'].lineData[1350] = 0;
  _$jscoverage['/control.js'].lineData[1352] = 0;
  _$jscoverage['/control.js'].lineData[1353] = 0;
  _$jscoverage['/control.js'].lineData[1356] = 0;
  _$jscoverage['/control.js'].lineData[1359] = 0;
}
if (! _$jscoverage['/control.js'].functionData) {
  _$jscoverage['/control.js'].functionData = [];
  _$jscoverage['/control.js'].functionData[0] = 0;
  _$jscoverage['/control.js'].functionData[1] = 0;
  _$jscoverage['/control.js'].functionData[2] = 0;
  _$jscoverage['/control.js'].functionData[3] = 0;
  _$jscoverage['/control.js'].functionData[4] = 0;
  _$jscoverage['/control.js'].functionData[5] = 0;
  _$jscoverage['/control.js'].functionData[6] = 0;
  _$jscoverage['/control.js'].functionData[7] = 0;
  _$jscoverage['/control.js'].functionData[8] = 0;
  _$jscoverage['/control.js'].functionData[9] = 0;
  _$jscoverage['/control.js'].functionData[10] = 0;
  _$jscoverage['/control.js'].functionData[11] = 0;
  _$jscoverage['/control.js'].functionData[12] = 0;
  _$jscoverage['/control.js'].functionData[13] = 0;
  _$jscoverage['/control.js'].functionData[14] = 0;
  _$jscoverage['/control.js'].functionData[15] = 0;
  _$jscoverage['/control.js'].functionData[16] = 0;
  _$jscoverage['/control.js'].functionData[17] = 0;
  _$jscoverage['/control.js'].functionData[18] = 0;
  _$jscoverage['/control.js'].functionData[19] = 0;
  _$jscoverage['/control.js'].functionData[20] = 0;
  _$jscoverage['/control.js'].functionData[21] = 0;
  _$jscoverage['/control.js'].functionData[22] = 0;
  _$jscoverage['/control.js'].functionData[23] = 0;
  _$jscoverage['/control.js'].functionData[24] = 0;
  _$jscoverage['/control.js'].functionData[25] = 0;
  _$jscoverage['/control.js'].functionData[26] = 0;
  _$jscoverage['/control.js'].functionData[27] = 0;
  _$jscoverage['/control.js'].functionData[28] = 0;
  _$jscoverage['/control.js'].functionData[29] = 0;
  _$jscoverage['/control.js'].functionData[30] = 0;
  _$jscoverage['/control.js'].functionData[31] = 0;
  _$jscoverage['/control.js'].functionData[32] = 0;
  _$jscoverage['/control.js'].functionData[33] = 0;
  _$jscoverage['/control.js'].functionData[34] = 0;
  _$jscoverage['/control.js'].functionData[35] = 0;
  _$jscoverage['/control.js'].functionData[36] = 0;
  _$jscoverage['/control.js'].functionData[37] = 0;
  _$jscoverage['/control.js'].functionData[38] = 0;
  _$jscoverage['/control.js'].functionData[39] = 0;
  _$jscoverage['/control.js'].functionData[40] = 0;
  _$jscoverage['/control.js'].functionData[41] = 0;
  _$jscoverage['/control.js'].functionData[42] = 0;
  _$jscoverage['/control.js'].functionData[43] = 0;
  _$jscoverage['/control.js'].functionData[44] = 0;
  _$jscoverage['/control.js'].functionData[45] = 0;
  _$jscoverage['/control.js'].functionData[46] = 0;
  _$jscoverage['/control.js'].functionData[47] = 0;
  _$jscoverage['/control.js'].functionData[48] = 0;
  _$jscoverage['/control.js'].functionData[49] = 0;
  _$jscoverage['/control.js'].functionData[50] = 0;
  _$jscoverage['/control.js'].functionData[51] = 0;
  _$jscoverage['/control.js'].functionData[52] = 0;
  _$jscoverage['/control.js'].functionData[53] = 0;
  _$jscoverage['/control.js'].functionData[54] = 0;
  _$jscoverage['/control.js'].functionData[55] = 0;
  _$jscoverage['/control.js'].functionData[56] = 0;
  _$jscoverage['/control.js'].functionData[57] = 0;
  _$jscoverage['/control.js'].functionData[58] = 0;
  _$jscoverage['/control.js'].functionData[59] = 0;
  _$jscoverage['/control.js'].functionData[60] = 0;
  _$jscoverage['/control.js'].functionData[61] = 0;
  _$jscoverage['/control.js'].functionData[62] = 0;
  _$jscoverage['/control.js'].functionData[63] = 0;
  _$jscoverage['/control.js'].functionData[64] = 0;
  _$jscoverage['/control.js'].functionData[65] = 0;
  _$jscoverage['/control.js'].functionData[66] = 0;
  _$jscoverage['/control.js'].functionData[67] = 0;
  _$jscoverage['/control.js'].functionData[68] = 0;
  _$jscoverage['/control.js'].functionData[69] = 0;
  _$jscoverage['/control.js'].functionData[70] = 0;
  _$jscoverage['/control.js'].functionData[71] = 0;
}
if (! _$jscoverage['/control.js'].branchData) {
  _$jscoverage['/control.js'].branchData = {};
  _$jscoverage['/control.js'].branchData['26'] = [];
  _$jscoverage['/control.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['29'] = [];
  _$jscoverage['/control.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['41'] = [];
  _$jscoverage['/control.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['50'] = [];
  _$jscoverage['/control.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['67'] = [];
  _$jscoverage['/control.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['70'] = [];
  _$jscoverage['/control.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['79'] = [];
  _$jscoverage['/control.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['79'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['123'] = [];
  _$jscoverage['/control.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['145'] = [];
  _$jscoverage['/control.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['155'] = [];
  _$jscoverage['/control.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['158'] = [];
  _$jscoverage['/control.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['161'] = [];
  _$jscoverage['/control.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['165'] = [];
  _$jscoverage['/control.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['173'] = [];
  _$jscoverage['/control.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['176'] = [];
  _$jscoverage['/control.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['178'] = [];
  _$jscoverage['/control.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['217'] = [];
  _$jscoverage['/control.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['221'] = [];
  _$jscoverage['/control.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['224'] = [];
  _$jscoverage['/control.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['226'] = [];
  _$jscoverage['/control.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['237'] = [];
  _$jscoverage['/control.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['246'] = [];
  _$jscoverage['/control.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['267'] = [];
  _$jscoverage['/control.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['276'] = [];
  _$jscoverage['/control.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['282'] = [];
  _$jscoverage['/control.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['304'] = [];
  _$jscoverage['/control.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['368'] = [];
  _$jscoverage['/control.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['370'] = [];
  _$jscoverage['/control.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['373'] = [];
  _$jscoverage['/control.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['376'] = [];
  _$jscoverage['/control.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['379'] = [];
  _$jscoverage['/control.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['382'] = [];
  _$jscoverage['/control.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['383'] = [];
  _$jscoverage['/control.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['400'] = [];
  _$jscoverage['/control.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['415'] = [];
  _$jscoverage['/control.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['432'] = [];
  _$jscoverage['/control.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['448'] = [];
  _$jscoverage['/control.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['449'] = [];
  _$jscoverage['/control.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['450'] = [];
  _$jscoverage['/control.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['453'] = [];
  _$jscoverage['/control.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['458'] = [];
  _$jscoverage['/control.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['458'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['462'] = [];
  _$jscoverage['/control.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['464'] = [];
  _$jscoverage['/control.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['464'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['464'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['464'][4] = new BranchData();
  _$jscoverage['/control.js'].branchData['464'][5] = new BranchData();
  _$jscoverage['/control.js'].branchData['472'] = [];
  _$jscoverage['/control.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['487'] = [];
  _$jscoverage['/control.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['487'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['487'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['493'] = [];
  _$jscoverage['/control.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['506'] = [];
  _$jscoverage['/control.js'].branchData['506'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['521'] = [];
  _$jscoverage['/control.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['537'] = [];
  _$jscoverage['/control.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['550'] = [];
  _$jscoverage['/control.js'].branchData['550'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['557'] = [];
  _$jscoverage['/control.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['569'] = [];
  _$jscoverage['/control.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['583'] = [];
  _$jscoverage['/control.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['588'] = [];
  _$jscoverage['/control.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['597'] = [];
  _$jscoverage['/control.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['598'] = [];
  _$jscoverage['/control.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['614'] = [];
  _$jscoverage['/control.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['623'] = [];
  _$jscoverage['/control.js'].branchData['623'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['629'] = [];
  _$jscoverage['/control.js'].branchData['629'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['631'] = [];
  _$jscoverage['/control.js'].branchData['631'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['634'] = [];
  _$jscoverage['/control.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['652'] = [];
  _$jscoverage['/control.js'].branchData['652'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['672'] = [];
  _$jscoverage['/control.js'].branchData['672'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['697'] = [];
  _$jscoverage['/control.js'].branchData['697'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['703'] = [];
  _$jscoverage['/control.js'].branchData['703'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['727'] = [];
  _$jscoverage['/control.js'].branchData['727'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['736'] = [];
  _$jscoverage['/control.js'].branchData['736'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['764'] = [];
  _$jscoverage['/control.js'].branchData['764'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['785'] = [];
  _$jscoverage['/control.js'].branchData['785'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['795'] = [];
  _$jscoverage['/control.js'].branchData['795'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['824'] = [];
  _$jscoverage['/control.js'].branchData['824'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['914'] = [];
  _$jscoverage['/control.js'].branchData['914'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['917'] = [];
  _$jscoverage['/control.js'].branchData['917'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['987'] = [];
  _$jscoverage['/control.js'].branchData['987'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['988'] = [];
  _$jscoverage['/control.js'].branchData['988'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['991'] = [];
  _$jscoverage['/control.js'].branchData['991'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['1164'] = [];
  _$jscoverage['/control.js'].branchData['1164'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['1274'] = [];
  _$jscoverage['/control.js'].branchData['1274'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['1305'] = [];
  _$jscoverage['/control.js'].branchData['1305'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['1344'] = [];
  _$jscoverage['/control.js'].branchData['1344'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['1352'] = [];
  _$jscoverage['/control.js'].branchData['1352'][1] = new BranchData();
}
_$jscoverage['/control.js'].branchData['1352'][1].init(408, 6, 'xclass');
function visit91_1352_1(result) {
  _$jscoverage['/control.js'].branchData['1352'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['1344'][1].init(216, 30, 'last && (xclass = last.xclass)');
function visit90_1344_1(result) {
  _$jscoverage['/control.js'].branchData['1344'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['1305'][1].init(171, 1, 'p');
function visit89_1305_1(result) {
  _$jscoverage['/control.js'].branchData['1305'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['1274'][1].init(61, 40, 'S.config(\'component/prefixCls\') || \'ks-\'');
function visit88_1274_1(result) {
  _$jscoverage['/control.js'].branchData['1274'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['1164'][1].init(79, 3, '!id');
function visit87_1164_1(result) {
  _$jscoverage['/control.js'].branchData['1164'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['991'][1].init(176, 19, 'xy[1] !== undefined');
function visit86_991_1(result) {
  _$jscoverage['/control.js'].branchData['991'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['988'][1].init(34, 19, 'xy[0] !== undefined');
function visit85_988_1(result) {
  _$jscoverage['/control.js'].branchData['988'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['987'][1].init(122, 9, 'xy.length');
function visit84_987_1(result) {
  _$jscoverage['/control.js'].branchData['987'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['917'][1].init(163, 7, 'v || []');
function visit83_917_1(result) {
  _$jscoverage['/control.js'].branchData['917'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['914'][1].init(30, 21, 'typeof v === \'string\'');
function visit82_914_1(result) {
  _$jscoverage['/control.js'].branchData['914'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['824'][1].init(153, 8, 'self.$el');
function visit81_824_1(result) {
  _$jscoverage['/control.js'].branchData['824'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['795'][1].init(186, 45, 'target.ownerDocument.activeElement === target');
function visit80_795_1(result) {
  _$jscoverage['/control.js'].branchData['795'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['785'][1].init(81, 1, 'v');
function visit79_785_1(result) {
  _$jscoverage['/control.js'].branchData['785'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['764'][1].init(278, 21, 'self.get(\'focusable\')');
function visit78_764_1(result) {
  _$jscoverage['/control.js'].branchData['764'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['736'][1].init(159, 7, 'visible');
function visit77_736_1(result) {
  _$jscoverage['/control.js'].branchData['736'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['727'][1].init(158, 31, '!this.get(\'allowTextSelection\')');
function visit76_727_1(result) {
  _$jscoverage['/control.js'].branchData['727'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['703'][1].init(22, 21, 'this.get(\'focusable\')');
function visit75_703_1(result) {
  _$jscoverage['/control.js'].branchData['703'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['697'][1].init(22, 21, 'this.get(\'focusable\')');
function visit74_697_1(result) {
  _$jscoverage['/control.js'].branchData['697'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['672'][1].init(54, 14, 'parent || this');
function visit73_672_1(result) {
  _$jscoverage['/control.js'].branchData['672'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['652'][1].init(315, 5, 'i < l');
function visit72_652_1(result) {
  _$jscoverage['/control.js'].branchData['652'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['634'][1].init(186, 60, 'constructor.superclass && constructor.superclass.constructor');
function visit71_634_1(result) {
  _$jscoverage['/control.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['631'][1].init(76, 6, 'xclass');
function visit70_631_1(result) {
  _$jscoverage['/control.js'].branchData['631'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['629'][1].init(293, 65, 'constructor && !constructor.prototype.hasOwnProperty(\'isControl\')');
function visit69_629_1(result) {
  _$jscoverage['/control.js'].branchData['629'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['623'][1].init(56, 24, 'self.componentCssClasses');
function visit68_623_1(result) {
  _$jscoverage['/control.js'].branchData['623'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['614'][1].init(101, 3, 'cls');
function visit67_614_1(result) {
  _$jscoverage['/control.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['598'][1].init(130, 37, 'renderCommands || self.renderCommands');
function visit66_598_1(result) {
  _$jscoverage['/control.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['597'][1].init(65, 29, 'renderData || self.renderData');
function visit65_597_1(result) {
  _$jscoverage['/control.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['588'][1].init(147, 24, 'typeof node === \'string\'');
function visit64_588_1(result) {
  _$jscoverage['/control.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['583'][1].init(154, 47, 'childrenElSelectors || self.childrenElSelectors');
function visit63_583_1(result) {
  _$jscoverage['/control.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['569'][1].init(102, 21, 'self.get(\'focusable\')');
function visit62_569_1(result) {
  _$jscoverage['/control.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['557'][1].init(22, 21, '!this.get(\'disabled\')');
function visit61_557_1(result) {
  _$jscoverage['/control.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['550'][1].init(22, 33, 'ev.keyCode === Node.KeyCode.ENTER');
function visit60_550_1(result) {
  _$jscoverage['/control.js'].branchData['550'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['537'][1].init(56, 55, '!this.get(\'disabled\') && self.handleKeyDownInternal(ev)');
function visit59_537_1(result) {
  _$jscoverage['/control.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['521'][1].init(22, 21, '!this.get(\'disabled\')');
function visit58_521_1(result) {
  _$jscoverage['/control.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['506'][1].init(22, 21, '!this.get(\'disabled\')');
function visit57_506_1(result) {
  _$jscoverage['/control.js'].branchData['506'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['493'][1].init(22, 21, '!this.get(\'disabled\')');
function visit56_493_1(result) {
  _$jscoverage['/control.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['487'][3].init(102, 14, 'ev.which === 1');
function visit55_487_3(result) {
  _$jscoverage['/control.js'].branchData['487'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['487'][2].init(102, 41, 'ev.which === 1 || isTouchGestureSupported');
function visit54_487_2(result) {
  _$jscoverage['/control.js'].branchData['487'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['487'][1].init(79, 65, 'self.get(\'active\') && (ev.which === 1 || isTouchGestureSupported)');
function visit53_487_1(result) {
  _$jscoverage['/control.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['472'][1].init(22, 21, '!this.get(\'disabled\')');
function visit52_472_1(result) {
  _$jscoverage['/control.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['464'][5].init(360, 14, 'n !== \'button\'');
function visit51_464_5(result) {
  _$jscoverage['/control.js'].branchData['464'][5].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['464'][4].init(340, 16, 'n !== \'textarea\'');
function visit50_464_4(result) {
  _$jscoverage['/control.js'].branchData['464'][4].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['464'][3].init(340, 34, 'n !== \'textarea\' && n !== \'button\'');
function visit49_464_3(result) {
  _$jscoverage['/control.js'].branchData['464'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['464'][2].init(323, 13, 'n !== \'input\'');
function visit48_464_2(result) {
  _$jscoverage['/control.js'].branchData['464'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['464'][1].init(323, 51, 'n !== \'input\' && n !== \'textarea\' && n !== \'button\'');
function visit47_464_1(result) {
  _$jscoverage['/control.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['462'][1].init(192, 20, 'n && n.toLowerCase()');
function visit46_462_1(result) {
  _$jscoverage['/control.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['458'][2].init(417, 26, 'ev.gestureType === \'mouse\'');
function visit45_458_2(result) {
  _$jscoverage['/control.js'].branchData['458'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['458'][1].init(382, 61, '!self.get(\'allowTextSelection\') && ev.gestureType === \'mouse\'');
function visit44_458_1(result) {
  _$jscoverage['/control.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['453'][1].init(151, 21, 'self.get(\'focusable\')');
function visit43_453_1(result) {
  _$jscoverage['/control.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['450'][1].init(26, 22, 'self.get(\'activeable\')');
function visit42_450_1(result) {
  _$jscoverage['/control.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['449'][1].init(139, 46, 'isMouseActionButton || isTouchGestureSupported');
function visit41_449_1(result) {
  _$jscoverage['/control.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['448'][1].init(83, 14, 'ev.which === 1');
function visit40_448_1(result) {
  _$jscoverage['/control.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['432'][1].init(22, 21, '!this.get(\'disabled\')');
function visit39_432_1(result) {
  _$jscoverage['/control.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['415'][1].init(22, 21, '!this.get(\'disabled\')');
function visit38_415_1(result) {
  _$jscoverage['/control.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['400'][1].init(22, 21, '!this.get(\'disabled\')');
function visit37_400_1(result) {
  _$jscoverage['/control.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['383'][1].init(26, 17, 'p.pluginCreateDom');
function visit36_383_1(result) {
  _$jscoverage['/control.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['382'][1].init(796, 19, 'self.get(\'created\')');
function visit35_382_1(result) {
  _$jscoverage['/control.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['379'][1].init(433, 14, 'p.pluginSyncUI');
function visit34_379_1(result) {
  _$jscoverage['/control.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['376'][1].init(320, 14, 'p.pluginBindUI');
function visit33_376_1(result) {
  _$jscoverage['/control.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['373'][1].init(202, 16, 'p.pluginRenderUI');
function visit32_373_1(result) {
  _$jscoverage['/control.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['370'][1].init(83, 17, 'p.pluginCreateDom');
function visit31_370_1(result) {
  _$jscoverage['/control.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['368'][1].init(223, 20, 'self.get(\'rendered\')');
function visit30_368_1(result) {
  _$jscoverage['/control.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['304'][1].init(84, 21, '!self.get(\'rendered\')');
function visit29_304_1(result) {
  _$jscoverage['/control.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['282'][1].init(759, 8, '!srcNode');
function visit28_282_1(result) {
  _$jscoverage['/control.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['276'][1].init(412, 7, 'srcNode');
function visit27_276_1(result) {
  _$jscoverage['/control.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['267'][1].init(56, 20, '!self.get(\'created\')');
function visit26_267_1(result) {
  _$jscoverage['/control.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['246'][1].init(483, 31, 'self.get(\'handleGestureEvents\')');
function visit25_246_1(result) {
  _$jscoverage['/control.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['237'][1].init(58, 21, 'self.get(\'focusable\')');
function visit24_237_1(result) {
  _$jscoverage['/control.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['226'][1].init(259, 6, 'render');
function visit23_226_1(result) {
  _$jscoverage['/control.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['224'][1].init(142, 12, 'renderBefore');
function visit22_224_1(result) {
  _$jscoverage['/control.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['221'][1].init(344, 20, '!self.get(\'srcNode\')');
function visit21_221_1(result) {
  _$jscoverage['/control.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['217'][1].init(171, 31, '!self.get(\'allowTextSelection\')');
function visit20_217_1(result) {
  _$jscoverage['/control.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['178'][1].init(70, 13, 'UA.ieMode < 9');
function visit19_178_1(result) {
  _$jscoverage['/control.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['176'][1].init(1650, 21, 'self.get(\'focusable\')');
function visit18_176_1(result) {
  _$jscoverage['/control.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['173'][1].init(1517, 23, 'self.get(\'highlighted\')');
function visit17_173_1(result) {
  _$jscoverage['/control.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['165'][1].init(1194, 8, '!visible');
function visit16_165_1(result) {
  _$jscoverage['/control.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['161'][1].init(1092, 6, 'zIndex');
function visit15_161_1(result) {
  _$jscoverage['/control.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['158'][1].init(986, 6, 'height');
function visit14_158_1(result) {
  _$jscoverage['/control.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['155'][1].init(883, 5, 'width');
function visit13_155_1(result) {
  _$jscoverage['/control.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['145'][1].init(71, 11, 'attr.render');
function visit12_145_1(result) {
  _$jscoverage['/control.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['123'][1].init(114, 13, 'attr.selector');
function visit11_123_1(result) {
  _$jscoverage['/control.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['79'][2].init(56, 35, 'options.params && options.params[0]');
function visit10_79_2(result) {
  _$jscoverage['/control.js'].branchData['79'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['79'][1].init(55, 46, 'options && options.params && options.params[0]');
function visit9_79_1(result) {
  _$jscoverage['/control.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['70'][1].init(112, 17, 'ret !== undefined');
function visit8_70_1(result) {
  _$jscoverage['/control.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['67'][1].init(90, 10, 'attr.parse');
function visit7_67_1(result) {
  _$jscoverage['/control.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['50'][1].init(14, 21, 'typeof v === \'number\'');
function visit6_50_1(result) {
  _$jscoverage['/control.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['41'][1].init(156, 5, 'i < l');
function visit5_41_1(result) {
  _$jscoverage['/control.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['29'][1].init(77, 26, 'typeof extras === \'string\'');
function visit4_29_1(result) {
  _$jscoverage['/control.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['26'][1].init(14, 7, '!extras');
function visit3_26_1(result) {
  _$jscoverage['/control.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/control.js'].functionData[0]++;
  _$jscoverage['/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/control.js'].lineData[8]++;
  var BaseGesture = require('event/gesture/base');
  _$jscoverage['/control.js'].lineData[9]++;
  var TapGesture = require('event/gesture/tap');
  _$jscoverage['/control.js'].lineData[10]++;
  var Manager = require('component/manager');
  _$jscoverage['/control.js'].lineData[11]++;
  var Base = require('base');
  _$jscoverage['/control.js'].lineData[12]++;
  var RenderTpl = require('./control/render-xtpl');
  _$jscoverage['/control.js'].lineData[13]++;
  var UA = require('ua');
  _$jscoverage['/control.js'].lineData[14]++;
  var Feature = S.Feature;
  _$jscoverage['/control.js'].lineData[15]++;
  var __getHook = Base.prototype.__getHook;
  _$jscoverage['/control.js'].lineData[16]++;
  var startTpl = RenderTpl;
  _$jscoverage['/control.js'].lineData[17]++;
  var endTpl = '</div>';
  _$jscoverage['/control.js'].lineData[18]++;
  var isTouchGestureSupported = Feature.isTouchGestureSupported();
  _$jscoverage['/control.js'].lineData[19]++;
  var noop = S.noop;
  _$jscoverage['/control.js'].lineData[20]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/control.js'].lineData[21]++;
  var trim = S.trim;
  _$jscoverage['/control.js'].lineData[22]++;
  var $ = Node.all;
  _$jscoverage['/control.js'].lineData[23]++;
  var doc = S.Env.host.document;
  _$jscoverage['/control.js'].lineData[25]++;
  function normalExtras(extras) {
    _$jscoverage['/control.js'].functionData[1]++;
    _$jscoverage['/control.js'].lineData[26]++;
    if (visit3_26_1(!extras)) {
      _$jscoverage['/control.js'].lineData[27]++;
      extras = [''];
    }
    _$jscoverage['/control.js'].lineData[29]++;
    if (visit4_29_1(typeof extras === 'string')) {
      _$jscoverage['/control.js'].lineData[30]++;
      extras = extras.split(/\s+/);
    }
    _$jscoverage['/control.js'].lineData[32]++;
    return extras;
  }
  _$jscoverage['/control.js'].lineData[35]++;
  function prefixExtra(prefixCls, componentCls, extras) {
    _$jscoverage['/control.js'].functionData[2]++;
    _$jscoverage['/control.js'].lineData[36]++;
    var cls = '', i = 0, l = extras.length, e, prefix = prefixCls + componentCls;
    _$jscoverage['/control.js'].lineData[41]++;
    for (; visit5_41_1(i < l); i++) {
      _$jscoverage['/control.js'].lineData[42]++;
      e = extras[i];
      _$jscoverage['/control.js'].lineData[43]++;
      e = e ? ('-' + e) : e;
      _$jscoverage['/control.js'].lineData[44]++;
      cls += ' ' + prefix + e;
    }
    _$jscoverage['/control.js'].lineData[46]++;
    return cls;
  }
  _$jscoverage['/control.js'].lineData[49]++;
  function pxSetter(v) {
    _$jscoverage['/control.js'].functionData[3]++;
    _$jscoverage['/control.js'].lineData[50]++;
    if (visit6_50_1(typeof v === 'number')) {
      _$jscoverage['/control.js'].lineData[51]++;
      v += 'px';
    }
    _$jscoverage['/control.js'].lineData[53]++;
    return v;
  }
  _$jscoverage['/control.js'].lineData[56]++;
  function applyParser(srcNode) {
    _$jscoverage['/control.js'].functionData[4]++;
    _$jscoverage['/control.js'].lineData[57]++;
    var self = this, attr, attrName, ret;
    _$jscoverage['/control.js'].lineData[60]++;
    var attrs = self.getAttrs();
    _$jscoverage['/control.js'].lineData[64]++;
    for (attrName in attrs) {
      _$jscoverage['/control.js'].lineData[65]++;
      attr = attrs[attrName];
      _$jscoverage['/control.js'].lineData[67]++;
      if (visit7_67_1(attr.parse)) {
        _$jscoverage['/control.js'].lineData[69]++;
        ret = attr.parse.call(self, srcNode);
        _$jscoverage['/control.js'].lineData[70]++;
        if (visit8_70_1(ret !== undefined)) {
          _$jscoverage['/control.js'].lineData[71]++;
          self.setInternal(attrName, ret);
        }
      }
    }
  }
  _$jscoverage['/control.js'].lineData[78]++;
  function getBaseCssClassesCmd(_, options) {
    _$jscoverage['/control.js'].functionData[5]++;
    _$jscoverage['/control.js'].lineData[79]++;
    return this.config.control.getBaseCssClasses(visit9_79_1(options && visit10_79_2(options.params && options.params[0])));
  }
  _$jscoverage['/control.js'].lineData[82]++;
  function getBaseCssClassCmd() {
    _$jscoverage['/control.js'].functionData[6]++;
    _$jscoverage['/control.js'].lineData[83]++;
    return this.config.control.getBaseCssClass(arguments[1].params[0]);
  }
  _$jscoverage['/control.js'].lineData[91]++;
  var Control = Base.extend({
  isControl: true, 
  bindInternal: noop, 
  syncInternal: noop, 
  initializer: function() {
  _$jscoverage['/control.js'].functionData[7]++;
  _$jscoverage['/control.js'].lineData[111]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[112]++;
  var attrName, attr;
  _$jscoverage['/control.js'].lineData[113]++;
  var attrs = self.getAttrs();
  _$jscoverage['/control.js'].lineData[114]++;
  self.renderData = {};
  _$jscoverage['/control.js'].lineData[115]++;
  self.childrenElSelectors = {};
  _$jscoverage['/control.js'].lineData[116]++;
  self.renderCommands = {
  getBaseCssClasses: getBaseCssClassesCmd, 
  getBaseCssClass: getBaseCssClassCmd};
  _$jscoverage['/control.js'].lineData[120]++;
  for (attrName in attrs) {
    _$jscoverage['/control.js'].lineData[121]++;
    attr = attrs[attrName];
    _$jscoverage['/control.js'].lineData[123]++;
    if (visit11_123_1(attr.selector)) {
      _$jscoverage['/control.js'].lineData[124]++;
      self.childrenElSelectors[attrName] = attr.selector;
    }
  }
}, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/control.js'].functionData[8]++;
  _$jscoverage['/control.js'].lineData[130]++;
  var self = this, width, height, visible, elAttrs = self.get('elAttrs'), disabled, attrs = self.getAttrs(), attrName, attr, elStyle = self.get('elStyle'), zIndex, elCls = self.get('elCls');
  _$jscoverage['/control.js'].lineData[143]++;
  for (attrName in attrs) {
    _$jscoverage['/control.js'].lineData[144]++;
    attr = attrs[attrName];
    _$jscoverage['/control.js'].lineData[145]++;
    if (visit12_145_1(attr.render)) {
      _$jscoverage['/control.js'].lineData[146]++;
      renderData[attrName] = self.get(attrName);
    }
  }
  _$jscoverage['/control.js'].lineData[150]++;
  width = renderData.width;
  _$jscoverage['/control.js'].lineData[151]++;
  height = renderData.height;
  _$jscoverage['/control.js'].lineData[152]++;
  visible = renderData.visible;
  _$jscoverage['/control.js'].lineData[153]++;
  zIndex = renderData.zIndex;
  _$jscoverage['/control.js'].lineData[155]++;
  if (visit13_155_1(width)) {
    _$jscoverage['/control.js'].lineData[156]++;
    elStyle.width = pxSetter(width);
  }
  _$jscoverage['/control.js'].lineData[158]++;
  if (visit14_158_1(height)) {
    _$jscoverage['/control.js'].lineData[159]++;
    elStyle.height = pxSetter(height);
  }
  _$jscoverage['/control.js'].lineData[161]++;
  if (visit15_161_1(zIndex)) {
    _$jscoverage['/control.js'].lineData[162]++;
    elStyle['z-index'] = zIndex;
  }
  _$jscoverage['/control.js'].lineData[165]++;
  if (visit16_165_1(!visible)) {
    _$jscoverage['/control.js'].lineData[166]++;
    elCls.push(self.getBaseCssClasses('hidden'));
  }
  _$jscoverage['/control.js'].lineData[169]++;
  if ((disabled = self.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[170]++;
    elCls.push(self.getBaseCssClasses('disabled'));
    _$jscoverage['/control.js'].lineData[171]++;
    elAttrs['aria-disabled'] = 'true';
  }
  _$jscoverage['/control.js'].lineData[173]++;
  if (visit17_173_1(self.get('highlighted'))) {
    _$jscoverage['/control.js'].lineData[174]++;
    elCls.push(self.getBaseCssClasses('hover'));
  }
  _$jscoverage['/control.js'].lineData[176]++;
  if (visit18_176_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[178]++;
    if (visit19_178_1(UA.ieMode < 9)) {
      _$jscoverage['/control.js'].lineData[179]++;
      elAttrs.hideFocus = 'true';
    }
    _$jscoverage['/control.js'].lineData[181]++;
    elAttrs.tabindex = disabled ? '-1' : '0';
  }
}, 
  createDom: function() {
  _$jscoverage['/control.js'].functionData[9]++;
  _$jscoverage['/control.js'].lineData[190]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[193]++;
  var html = self.renderTpl(startTpl) + self.renderTpl(self.get('contentTpl')) + endTpl;
  _$jscoverage['/control.js'].lineData[194]++;
  self.$el = $(html);
  _$jscoverage['/control.js'].lineData[195]++;
  self.el = self.$el[0];
  _$jscoverage['/control.js'].lineData[196]++;
  self.fillChildrenElsBySelectors();
}, 
  decorateDom: function(srcNode) {
  _$jscoverage['/control.js'].functionData[10]++;
  _$jscoverage['/control.js'].lineData[200]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[201]++;
  self.$el = srcNode;
  _$jscoverage['/control.js'].lineData[202]++;
  self.el = srcNode[0];
  _$jscoverage['/control.js'].lineData[204]++;
  self.fillChildrenElsBySelectors();
  _$jscoverage['/control.js'].lineData[205]++;
  applyParser.call(self, srcNode);
}, 
  renderUI: function() {
  _$jscoverage['/control.js'].functionData[11]++;
  _$jscoverage['/control.js'].lineData[213]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[215]++;
  Manager.addComponent(self);
  _$jscoverage['/control.js'].lineData[216]++;
  var $el = self.$el;
  _$jscoverage['/control.js'].lineData[217]++;
  if (visit20_217_1(!self.get('allowTextSelection'))) {
    _$jscoverage['/control.js'].lineData[218]++;
    $el.unselectable();
  }
  _$jscoverage['/control.js'].lineData[221]++;
  if (visit21_221_1(!self.get('srcNode'))) {
    _$jscoverage['/control.js'].lineData[222]++;
    var render = self.get('render'), renderBefore = self.get('elBefore');
    _$jscoverage['/control.js'].lineData[224]++;
    if (visit22_224_1(renderBefore)) {
      _$jscoverage['/control.js'].lineData[225]++;
      $el.insertBefore(renderBefore, undefined);
    } else {
      _$jscoverage['/control.js'].lineData[226]++;
      if (visit23_226_1(render)) {
        _$jscoverage['/control.js'].lineData[227]++;
        $el.appendTo(render, undefined);
      } else {
        _$jscoverage['/control.js'].lineData[229]++;
        $el.appendTo(doc.body, undefined);
      }
    }
  }
}, 
  bindUI: function() {
  _$jscoverage['/control.js'].functionData[12]++;
  _$jscoverage['/control.js'].lineData[235]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[237]++;
  if (visit24_237_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[243]++;
    self.getKeyEventTarget().on('focus', self.handleFocus, self).on('blur', self.handleBlur, self).on('keydown', self.handleKeydown, self);
  }
  _$jscoverage['/control.js'].lineData[246]++;
  if (visit25_246_1(self.get('handleGestureEvents'))) {
    _$jscoverage['/control.js'].lineData[254]++;
    self.$el.on('mouseenter', self.handleMouseEnter, self).on('mouseleave', self.handleMouseLeave, self).on('contextmenu', self.handleContextMenu, self).on(BaseGesture.START, self.handleMouseDown, self).on(BaseGesture.END, self.handleMouseUp, self).on(TapGesture.TAP, self.handleClick, self);
  }
}, 
  syncUI: noop, 
  create: function() {
  _$jscoverage['/control.js'].functionData[13]++;
  _$jscoverage['/control.js'].lineData[266]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[267]++;
  if (visit26_267_1(!self.get('created'))) {
    _$jscoverage['/control.js'].lineData[273]++;
    self.fire('beforeCreateDom');
    _$jscoverage['/control.js'].lineData[274]++;
    var srcNode = self.get('srcNode');
    _$jscoverage['/control.js'].lineData[276]++;
    if (visit27_276_1(srcNode)) {
      _$jscoverage['/control.js'].lineData[277]++;
      self.decorateDom(srcNode);
    }
    _$jscoverage['/control.js'].lineData[280]++;
    self.beforeCreateDom(self.renderData, self.renderCommands, self.childrenElSelectors);
    _$jscoverage['/control.js'].lineData[282]++;
    if (visit28_282_1(!srcNode)) {
      _$jscoverage['/control.js'].lineData[283]++;
      self.createDom();
    }
    _$jscoverage['/control.js'].lineData[285]++;
    self.__callPluginsMethod('pluginCreateDom');
    _$jscoverage['/control.js'].lineData[291]++;
    self.fire('afterCreateDom');
    _$jscoverage['/control.js'].lineData[292]++;
    self.setInternal('created', true);
  }
  _$jscoverage['/control.js'].lineData[294]++;
  return self;
}, 
  render: function() {
  _$jscoverage['/control.js'].functionData[14]++;
  _$jscoverage['/control.js'].lineData[302]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[304]++;
  if (visit29_304_1(!self.get('rendered'))) {
    _$jscoverage['/control.js'].lineData[305]++;
    self.create();
    _$jscoverage['/control.js'].lineData[313]++;
    self.fire('beforeRenderUI');
    _$jscoverage['/control.js'].lineData[314]++;
    self.renderUI();
    _$jscoverage['/control.js'].lineData[315]++;
    self.__callPluginsMethod('pluginRenderUI');
    _$jscoverage['/control.js'].lineData[322]++;
    self.fire('afterRenderUI');
    _$jscoverage['/control.js'].lineData[330]++;
    self.fire('beforeBindUI');
    _$jscoverage['/control.js'].lineData[331]++;
    Control.superclass.bindInternal.call(self);
    _$jscoverage['/control.js'].lineData[332]++;
    self.bindUI();
    _$jscoverage['/control.js'].lineData[333]++;
    self.__callPluginsMethod('pluginBindUI');
    _$jscoverage['/control.js'].lineData[339]++;
    self.fire('afterBindUI');
    _$jscoverage['/control.js'].lineData[346]++;
    self.fire('beforeSyncUI');
    _$jscoverage['/control.js'].lineData[347]++;
    Control.superclass.syncInternal.call(self);
    _$jscoverage['/control.js'].lineData[348]++;
    self.syncUI();
    _$jscoverage['/control.js'].lineData[349]++;
    self.__callPluginsMethod('pluginSyncUI');
    _$jscoverage['/control.js'].lineData[355]++;
    self.fire('afterSyncUI');
    _$jscoverage['/control.js'].lineData[357]++;
    self.setInternal('rendered', true);
  }
  _$jscoverage['/control.js'].lineData[359]++;
  return self;
}, 
  plug: function(plugin) {
  _$jscoverage['/control.js'].functionData[15]++;
  _$jscoverage['/control.js'].lineData[363]++;
  var self = this, p, plugins = self.get('plugins');
  _$jscoverage['/control.js'].lineData[366]++;
  self.callSuper(plugin);
  _$jscoverage['/control.js'].lineData[367]++;
  p = plugins[plugins.length - 1];
  _$jscoverage['/control.js'].lineData[368]++;
  if (visit30_368_1(self.get('rendered'))) {
    _$jscoverage['/control.js'].lineData[370]++;
    if (visit31_370_1(p.pluginCreateDom)) {
      _$jscoverage['/control.js'].lineData[371]++;
      p.pluginCreateDom(self);
    }
    _$jscoverage['/control.js'].lineData[373]++;
    if (visit32_373_1(p.pluginRenderUI)) {
      _$jscoverage['/control.js'].lineData[374]++;
      p.pluginCreateDom(self);
    }
    _$jscoverage['/control.js'].lineData[376]++;
    if (visit33_376_1(p.pluginBindUI)) {
      _$jscoverage['/control.js'].lineData[377]++;
      p.pluginBindUI(self);
    }
    _$jscoverage['/control.js'].lineData[379]++;
    if (visit34_379_1(p.pluginSyncUI)) {
      _$jscoverage['/control.js'].lineData[380]++;
      p.pluginSyncUI(self);
    }
  } else {
    _$jscoverage['/control.js'].lineData[382]++;
    if (visit35_382_1(self.get('created'))) {
      _$jscoverage['/control.js'].lineData[383]++;
      if (visit36_383_1(p.pluginCreateDom)) {
        _$jscoverage['/control.js'].lineData[384]++;
        p.pluginCreateDom(self);
      }
    }
  }
  _$jscoverage['/control.js'].lineData[387]++;
  return self;
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/control.js'].functionData[16]++;
  _$jscoverage['/control.js'].lineData[396]++;
  return this.$el;
}, 
  handleMouseEnter: function(ev) {
  _$jscoverage['/control.js'].functionData[17]++;
  _$jscoverage['/control.js'].lineData[400]++;
  if (visit37_400_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[401]++;
    this.handleMouseEnterInternal(ev);
  }
}, 
  handleMouseEnterInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[18]++;
  _$jscoverage['/control.js'].lineData[411]++;
  this.set('highlighted', !!ev);
}, 
  handleMouseLeave: function(ev) {
  _$jscoverage['/control.js'].functionData[19]++;
  _$jscoverage['/control.js'].lineData[415]++;
  if (visit38_415_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[416]++;
    this.handleMouseLeaveInternal(ev);
  }
}, 
  handleMouseLeaveInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[20]++;
  _$jscoverage['/control.js'].lineData[426]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[427]++;
  self.set('active', false);
  _$jscoverage['/control.js'].lineData[428]++;
  self.set('highlighted', !ev);
}, 
  handleMouseDown: function(ev) {
  _$jscoverage['/control.js'].functionData[21]++;
  _$jscoverage['/control.js'].lineData[432]++;
  if (visit39_432_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[433]++;
    this.handleMouseDownInternal(ev);
  }
}, 
  handleMouseDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[22]++;
  _$jscoverage['/control.js'].lineData[446]++;
  var self = this, n, isMouseActionButton = visit40_448_1(ev.which === 1);
  _$jscoverage['/control.js'].lineData[449]++;
  if (visit41_449_1(isMouseActionButton || isTouchGestureSupported)) {
    _$jscoverage['/control.js'].lineData[450]++;
    if (visit42_450_1(self.get('activeable'))) {
      _$jscoverage['/control.js'].lineData[451]++;
      self.set('active', true);
    }
    _$jscoverage['/control.js'].lineData[453]++;
    if (visit43_453_1(self.get('focusable'))) {
      _$jscoverage['/control.js'].lineData[454]++;
      self.focus();
    }
    _$jscoverage['/control.js'].lineData[458]++;
    if (visit44_458_1(!self.get('allowTextSelection') && visit45_458_2(ev.gestureType === 'mouse'))) {
      _$jscoverage['/control.js'].lineData[461]++;
      n = ev.target.nodeName;
      _$jscoverage['/control.js'].lineData[462]++;
      n = visit46_462_1(n && n.toLowerCase());
      _$jscoverage['/control.js'].lineData[464]++;
      if (visit47_464_1(visit48_464_2(n !== 'input') && visit49_464_3(visit50_464_4(n !== 'textarea') && visit51_464_5(n !== 'button')))) {
        _$jscoverage['/control.js'].lineData[465]++;
        ev.preventDefault();
      }
    }
  }
}, 
  handleMouseUp: function(ev) {
  _$jscoverage['/control.js'].functionData[23]++;
  _$jscoverage['/control.js'].lineData[472]++;
  if (visit52_472_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[473]++;
    this.handleMouseUpInternal(ev);
  }
}, 
  handleMouseUpInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[24]++;
  _$jscoverage['/control.js'].lineData[485]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[487]++;
  if (visit53_487_1(self.get('active') && (visit54_487_2(visit55_487_3(ev.which === 1) || isTouchGestureSupported)))) {
    _$jscoverage['/control.js'].lineData[488]++;
    self.set('active', false);
  }
}, 
  handleContextMenu: function(ev) {
  _$jscoverage['/control.js'].functionData[25]++;
  _$jscoverage['/control.js'].lineData[493]++;
  if (visit56_493_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[494]++;
    this.handleContextMenuInternal(ev);
  }
}, 
  handleContextMenuInternal: function() {
  _$jscoverage['/control.js'].functionData[26]++;
}, 
  handleFocus: function() {
  _$jscoverage['/control.js'].functionData[27]++;
  _$jscoverage['/control.js'].lineData[506]++;
  if (visit57_506_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[507]++;
    this.handleFocusInternal();
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/control.js'].functionData[28]++;
  _$jscoverage['/control.js'].lineData[516]++;
  this.focus();
  _$jscoverage['/control.js'].lineData[517]++;
  this.fire('focus');
}, 
  handleBlur: function() {
  _$jscoverage['/control.js'].functionData[29]++;
  _$jscoverage['/control.js'].lineData[521]++;
  if (visit58_521_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[522]++;
    this.handleBlurInternal();
  }
}, 
  handleBlurInternal: function() {
  _$jscoverage['/control.js'].functionData[30]++;
  _$jscoverage['/control.js'].lineData[531]++;
  this.blur();
  _$jscoverage['/control.js'].lineData[532]++;
  this.fire('blur');
}, 
  handleKeydown: function(ev) {
  _$jscoverage['/control.js'].functionData[31]++;
  _$jscoverage['/control.js'].lineData[536]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[537]++;
  if (visit59_537_1(!this.get('disabled') && self.handleKeyDownInternal(ev))) {
    _$jscoverage['/control.js'].lineData[538]++;
    ev.halt();
    _$jscoverage['/control.js'].lineData[539]++;
    return true;
  }
  _$jscoverage['/control.js'].lineData[541]++;
  return undefined;
}, 
  handleKeyDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[32]++;
  _$jscoverage['/control.js'].lineData[550]++;
  if (visit60_550_1(ev.keyCode === Node.KeyCode.ENTER)) {
    _$jscoverage['/control.js'].lineData[551]++;
    return this.handleClickInternal(ev);
  }
  _$jscoverage['/control.js'].lineData[553]++;
  return undefined;
}, 
  handleClick: function(ev) {
  _$jscoverage['/control.js'].functionData[33]++;
  _$jscoverage['/control.js'].lineData[557]++;
  if (visit61_557_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[558]++;
    this.handleClickInternal(ev);
  }
}, 
  handleClickInternal: function() {
  _$jscoverage['/control.js'].functionData[34]++;
  _$jscoverage['/control.js'].lineData[568]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[569]++;
  if (visit62_569_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[570]++;
    self.focus();
  }
}, 
  $: function(selector) {
  _$jscoverage['/control.js'].functionData[35]++;
  _$jscoverage['/control.js'].lineData[575]++;
  return this.$el.all(selector);
}, 
  fillChildrenElsBySelectors: function(childrenElSelectors) {
  _$jscoverage['/control.js'].functionData[36]++;
  _$jscoverage['/control.js'].lineData[579]++;
  var self = this, el = self.$el, childName, selector;
  _$jscoverage['/control.js'].lineData[583]++;
  childrenElSelectors = visit63_583_1(childrenElSelectors || self.childrenElSelectors);
  _$jscoverage['/control.js'].lineData[585]++;
  for (childName in childrenElSelectors) {
    _$jscoverage['/control.js'].lineData[586]++;
    selector = childrenElSelectors[childName];
    _$jscoverage['/control.js'].lineData[587]++;
    var node = selector.call(self, el);
    _$jscoverage['/control.js'].lineData[588]++;
    if (visit64_588_1(typeof node === 'string')) {
      _$jscoverage['/control.js'].lineData[589]++;
      node = self.$(node);
    }
    _$jscoverage['/control.js'].lineData[591]++;
    self.setInternal(childName, node);
  }
}, 
  renderTpl: function(tpl, renderData, renderCommands) {
  _$jscoverage['/control.js'].functionData[37]++;
  _$jscoverage['/control.js'].lineData[596]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[597]++;
  renderData = visit65_597_1(renderData || self.renderData);
  _$jscoverage['/control.js'].lineData[598]++;
  renderCommands = visit66_598_1(renderCommands || self.renderCommands);
  _$jscoverage['/control.js'].lineData[599]++;
  var XTemplate = self.get('XTemplate');
  _$jscoverage['/control.js'].lineData[600]++;
  return new XTemplate(tpl, {
  control: self, 
  commands: renderCommands}).render(renderData);
}, 
  getComponentConstructorByNode: function(prefixCls, childNode) {
  _$jscoverage['/control.js'].functionData[38]++;
  _$jscoverage['/control.js'].lineData[612]++;
  var cls = childNode[0].className;
  _$jscoverage['/control.js'].lineData[614]++;
  if (visit67_614_1(cls)) {
    _$jscoverage['/control.js'].lineData[615]++;
    cls = cls.replace(new RegExp('\\b' + prefixCls, 'ig'), '');
    _$jscoverage['/control.js'].lineData[616]++;
    return Manager.getConstructorByXClass(cls);
  }
  _$jscoverage['/control.js'].lineData[618]++;
  return null;
}, 
  getComponentCssClasses: function() {
  _$jscoverage['/control.js'].functionData[39]++;
  _$jscoverage['/control.js'].lineData[622]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[623]++;
  if (visit68_623_1(self.componentCssClasses)) {
    _$jscoverage['/control.js'].lineData[624]++;
    return self.componentCssClasses;
  }
  _$jscoverage['/control.js'].lineData[626]++;
  var constructor = self.constructor, xclass, re = [];
  _$jscoverage['/control.js'].lineData[629]++;
  while (visit69_629_1(constructor && !constructor.prototype.hasOwnProperty('isControl'))) {
    _$jscoverage['/control.js'].lineData[630]++;
    xclass = constructor.xclass;
    _$jscoverage['/control.js'].lineData[631]++;
    if (visit70_631_1(xclass)) {
      _$jscoverage['/control.js'].lineData[632]++;
      re.push(xclass);
    }
    _$jscoverage['/control.js'].lineData[634]++;
    constructor = visit71_634_1(constructor.superclass && constructor.superclass.constructor);
  }
  _$jscoverage['/control.js'].lineData[636]++;
  self.componentCssClasses = re;
  _$jscoverage['/control.js'].lineData[637]++;
  return re;
}, 
  getBaseCssClasses: function(extras) {
  _$jscoverage['/control.js'].functionData[40]++;
  _$jscoverage['/control.js'].lineData[646]++;
  extras = normalExtras(extras);
  _$jscoverage['/control.js'].lineData[647]++;
  var componentCssClasses = this.getComponentCssClasses(), i = 0, cls = '', l = componentCssClasses.length, prefixCls = this.get('prefixCls');
  _$jscoverage['/control.js'].lineData[652]++;
  for (; visit72_652_1(i < l); i++) {
    _$jscoverage['/control.js'].lineData[653]++;
    cls += prefixExtra(prefixCls, componentCssClasses[i], extras);
  }
  _$jscoverage['/control.js'].lineData[655]++;
  return trim(cls);
}, 
  getBaseCssClass: function(extras) {
  _$jscoverage['/control.js'].functionData[41]++;
  _$jscoverage['/control.js'].lineData[665]++;
  return trim(prefixExtra(this.get('prefixCls'), this.getComponentCssClasses()[0], normalExtras(extras)));
}, 
  createComponent: function(cfg, parent) {
  _$jscoverage['/control.js'].functionData[42]++;
  _$jscoverage['/control.js'].lineData[672]++;
  return Manager.createComponent(cfg, visit73_672_1(parent || this));
}, 
  show: function() {
  _$jscoverage['/control.js'].functionData[43]++;
  _$jscoverage['/control.js'].lineData[680]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[681]++;
  self.render();
  _$jscoverage['/control.js'].lineData[682]++;
  self.set('visible', true);
  _$jscoverage['/control.js'].lineData[683]++;
  return self;
}, 
  hide: function() {
  _$jscoverage['/control.js'].functionData[44]++;
  _$jscoverage['/control.js'].lineData[691]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[692]++;
  self.set('visible', false);
  _$jscoverage['/control.js'].lineData[693]++;
  return self;
}, 
  focus: function() {
  _$jscoverage['/control.js'].functionData[45]++;
  _$jscoverage['/control.js'].lineData[697]++;
  if (visit74_697_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[698]++;
    this.set('focused', true);
  }
}, 
  blur: function() {
  _$jscoverage['/control.js'].functionData[46]++;
  _$jscoverage['/control.js'].lineData[703]++;
  if (visit75_703_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[704]++;
    this.set('focused', false);
  }
}, 
  move: function(x, y) {
  _$jscoverage['/control.js'].functionData[47]++;
  _$jscoverage['/control.js'].lineData[709]++;
  this.set({
  x: x, 
  y: y});
}, 
  _onSetWidth: function(w) {
  _$jscoverage['/control.js'].functionData[48]++;
  _$jscoverage['/control.js'].lineData[716]++;
  this.$el.width(w);
}, 
  _onSetHeight: function(h) {
  _$jscoverage['/control.js'].functionData[49]++;
  _$jscoverage['/control.js'].lineData[720]++;
  this.$el.height(h);
}, 
  _onSetContent: function(c) {
  _$jscoverage['/control.js'].functionData[50]++;
  _$jscoverage['/control.js'].lineData[724]++;
  var el = this.$el;
  _$jscoverage['/control.js'].lineData[725]++;
  el.html(c);
  _$jscoverage['/control.js'].lineData[727]++;
  if (visit76_727_1(!this.get('allowTextSelection'))) {
    _$jscoverage['/control.js'].lineData[728]++;
    el.unselectable();
  }
}, 
  _onSetVisible: function(visible) {
  _$jscoverage['/control.js'].functionData[51]++;
  _$jscoverage['/control.js'].lineData[733]++;
  var self = this, el = self.$el, hiddenCls = self.getBaseCssClasses('hidden');
  _$jscoverage['/control.js'].lineData[736]++;
  if (visit77_736_1(visible)) {
    _$jscoverage['/control.js'].lineData[737]++;
    el.removeClass(hiddenCls);
  } else {
    _$jscoverage['/control.js'].lineData[739]++;
    el.addClass(hiddenCls);
  }
  _$jscoverage['/control.js'].lineData[742]++;
  this.fire(visible ? 'show' : 'hide');
}, 
  _onSetHighlighted: function(v) {
  _$jscoverage['/control.js'].functionData[52]++;
  _$jscoverage['/control.js'].lineData[749]++;
  var self = this, componentCls = self.getBaseCssClasses('hover'), el = self.$el;
  _$jscoverage['/control.js'].lineData[752]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/control.js'].functionData[53]++;
  _$jscoverage['/control.js'].lineData[759]++;
  var self = this, componentCls = self.getBaseCssClasses('disabled'), el = self.$el;
  _$jscoverage['/control.js'].lineData[763]++;
  el[v ? 'addClass' : 'removeClass'](componentCls).attr('aria-disabled', v);
  _$jscoverage['/control.js'].lineData[764]++;
  if (visit78_764_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[766]++;
    self.getKeyEventTarget().attr('tabindex', v ? -1 : 0);
  }
}, 
  _onSetActive: function(v) {
  _$jscoverage['/control.js'].functionData[54]++;
  _$jscoverage['/control.js'].lineData[773]++;
  var self = this, componentCls = self.getBaseCssClasses('active');
  _$jscoverage['/control.js'].lineData[776]++;
  self.$el[v ? 'addClass' : 'removeClass'](componentCls).attr('aria-pressed', !!v);
}, 
  _onSetZIndex: function(v) {
  _$jscoverage['/control.js'].functionData[55]++;
  _$jscoverage['/control.js'].lineData[780]++;
  this.$el.css('z-index', v);
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/control.js'].functionData[56]++;
  _$jscoverage['/control.js'].lineData[784]++;
  var target = this.getKeyEventTarget()[0];
  _$jscoverage['/control.js'].lineData[785]++;
  if (visit79_785_1(v)) {
    _$jscoverage['/control.js'].lineData[786]++;
    try {
      _$jscoverage['/control.js'].lineData[787]++;
      target.focus();
    }    catch (e) {
  _$jscoverage['/control.js'].lineData[789]++;
  S.log(target);
  _$jscoverage['/control.js'].lineData[790]++;
  S.log('focus error', 'warn');
}
  } else {
    _$jscoverage['/control.js'].lineData[795]++;
    if (visit80_795_1(target.ownerDocument.activeElement === target)) {
      _$jscoverage['/control.js'].lineData[796]++;
      target.ownerDocument.body.focus();
    }
  }
  _$jscoverage['/control.js'].lineData[799]++;
  var self = this, el = self.$el, componentCls = self.getBaseCssClasses('focused');
  _$jscoverage['/control.js'].lineData[802]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  _onSetX: function(x) {
  _$jscoverage['/control.js'].functionData[57]++;
  _$jscoverage['/control.js'].lineData[806]++;
  this.$el.offset({
  left: x});
}, 
  _onSetY: function(y) {
  _$jscoverage['/control.js'].functionData[58]++;
  _$jscoverage['/control.js'].lineData[812]++;
  this.$el.offset({
  top: y});
}, 
  destructor: function() {
  _$jscoverage['/control.js'].functionData[59]++;
  _$jscoverage['/control.js'].lineData[821]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[823]++;
  Manager.removeComponent(self);
  _$jscoverage['/control.js'].lineData[824]++;
  if (visit81_824_1(self.$el)) {
    _$jscoverage['/control.js'].lineData[825]++;
    self.$el.remove();
  }
}}, {
  __hooks__: {
  beforeCreateDom: __getHook('__beforeCreateDom'), 
  createDom: __getHook('__createDom'), 
  decorateDom: __getHook('__decorateDom'), 
  renderUI: __getHook('__renderUI'), 
  bindUI: __getHook('__bindUI'), 
  syncUI: __getHook('__syncUI')}, 
  name: 'control', 
  ATTRS: {
  contentTpl: {
  value: function(scope, buffer) {
  _$jscoverage['/control.js'].functionData[60]++;
  _$jscoverage['/control.js'].lineData[844]++;
  return buffer.write(scope.get('content'));
}}, 
  content: {
  parse: function(el) {
  _$jscoverage['/control.js'].functionData[61]++;
  _$jscoverage['/control.js'].lineData[862]++;
  return el.html();
}, 
  render: 1, 
  sync: 0, 
  value: ''}, 
  width: {
  render: 1, 
  sync: 0}, 
  height: {
  render: 1, 
  sync: 0}, 
  elCls: {
  render: 1, 
  value: [], 
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[62]++;
  _$jscoverage['/control.js'].lineData[914]++;
  if (visit82_914_1(typeof v === 'string')) {
    _$jscoverage['/control.js'].lineData[915]++;
    v = v.split(/\s+/);
  }
  _$jscoverage['/control.js'].lineData[917]++;
  return visit83_917_1(v || []);
}}, 
  elStyle: {
  render: 1, 
  value: {}}, 
  elAttrs: {
  render: 1, 
  value: {}}, 
  x: {}, 
  y: {}, 
  xy: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[63]++;
  _$jscoverage['/control.js'].lineData[985]++;
  var self = this, xy = S.makeArray(v);
  _$jscoverage['/control.js'].lineData[987]++;
  if (visit84_987_1(xy.length)) {
    _$jscoverage['/control.js'].lineData[988]++;
    if (visit85_988_1(xy[0] !== undefined)) {
      _$jscoverage['/control.js'].lineData[989]++;
      self.set('x', xy[0]);
    }
    _$jscoverage['/control.js'].lineData[991]++;
    if (visit86_991_1(xy[1] !== undefined)) {
      _$jscoverage['/control.js'].lineData[992]++;
      self.set('y', xy[1]);
    }
  }
  _$jscoverage['/control.js'].lineData[995]++;
  return v;
}, 
  getter: function() {
  _$jscoverage['/control.js'].functionData[64]++;
  _$jscoverage['/control.js'].lineData[998]++;
  return [this.get('x'), this.get('y')];
}}, 
  zIndex: {
  render: 1, 
  sync: 0}, 
  visible: {
  render: 1, 
  sync: 0, 
  value: true}, 
  activeable: {
  value: true}, 
  focused: {}, 
  active: {
  value: false}, 
  highlighted: {
  render: 1, 
  sync: 0, 
  value: false}, 
  disabled: {
  render: 1, 
  sync: 0, 
  value: false, 
  parse: function(el) {
  _$jscoverage['/control.js'].functionData[65]++;
  _$jscoverage['/control.js'].lineData[1116]++;
  return el.hasClass(this.getBaseCssClass('disabled'));
}}, 
  rendered: {
  value: false}, 
  created: {
  value: false}, 
  render: {}, 
  id: {
  render: 1, 
  parse: function(el) {
  _$jscoverage['/control.js'].functionData[66]++;
  _$jscoverage['/control.js'].lineData[1163]++;
  var id = el.attr('id');
  _$jscoverage['/control.js'].lineData[1164]++;
  if (visit87_1164_1(!id)) {
    _$jscoverage['/control.js'].lineData[1165]++;
    id = S.guid('ks-component');
    _$jscoverage['/control.js'].lineData[1166]++;
    el.attr('id', id);
  }
  _$jscoverage['/control.js'].lineData[1168]++;
  return id;
}, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[67]++;
  _$jscoverage['/control.js'].lineData[1171]++;
  return S.guid('ks-component');
}}, 
  elBefore: {}, 
  el: {
  getter: function() {
  _$jscoverage['/control.js'].functionData[68]++;
  _$jscoverage['/control.js'].lineData[1196]++;
  return this.$el;
}}, 
  srcNode: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[69]++;
  _$jscoverage['/control.js'].lineData[1211]++;
  return $(v);
}}, 
  handleGestureEvents: {
  value: true}, 
  focusable: {
  value: true}, 
  allowTextSelection: {
  value: false}, 
  prefixCls: {
  render: 1, 
  value: visit88_1274_1(S.config('component/prefixCls') || 'ks-')}, 
  prefixXClass: {}, 
  parent: {
  setter: function(p, prev) {
  _$jscoverage['/control.js'].functionData[70]++;
  _$jscoverage['/control.js'].lineData[1302]++;
  if ((prev = this.get('parent'))) {
    _$jscoverage['/control.js'].lineData[1303]++;
    this.removeTarget(prev);
  }
  _$jscoverage['/control.js'].lineData[1305]++;
  if (visit89_1305_1(p)) {
    _$jscoverage['/control.js'].lineData[1306]++;
    this.addTarget(p);
  }
}}, 
  XTemplate: {
  value: XTemplateRuntime}}});
  _$jscoverage['/control.js'].lineData[1336]++;
  Control.extend = function extend(extensions, px, sx) {
  _$jscoverage['/control.js'].functionData[71]++;
  _$jscoverage['/control.js'].lineData[1338]++;
  var args = S.makeArray(arguments), self = this, xclass, argsLen = args.length, last = args[argsLen - 1];
  _$jscoverage['/control.js'].lineData[1344]++;
  if (visit90_1344_1(last && (xclass = last.xclass))) {
    _$jscoverage['/control.js'].lineData[1345]++;
    last.name = xclass;
  }
  _$jscoverage['/control.js'].lineData[1348]++;
  var NewClass = Base.extend.apply(self, arguments);
  _$jscoverage['/control.js'].lineData[1350]++;
  NewClass.extend = extend;
  _$jscoverage['/control.js'].lineData[1352]++;
  if (visit91_1352_1(xclass)) {
    _$jscoverage['/control.js'].lineData[1353]++;
    Manager.setConstructorByXClass(xclass, NewClass);
  }
  _$jscoverage['/control.js'].lineData[1356]++;
  return NewClass;
};
  _$jscoverage['/control.js'].lineData[1359]++;
  return Control;
});
