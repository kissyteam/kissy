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
  _$jscoverage['/editor.js'].lineData[30] = 0;
  _$jscoverage['/editor.js'].lineData[35] = 0;
  _$jscoverage['/editor.js'].lineData[37] = 0;
  _$jscoverage['/editor.js'].lineData[39] = 0;
  _$jscoverage['/editor.js'].lineData[40] = 0;
  _$jscoverage['/editor.js'].lineData[41] = 0;
  _$jscoverage['/editor.js'].lineData[43] = 0;
  _$jscoverage['/editor.js'].lineData[48] = 0;
  _$jscoverage['/editor.js'].lineData[49] = 0;
  _$jscoverage['/editor.js'].lineData[50] = 0;
  _$jscoverage['/editor.js'].lineData[51] = 0;
  _$jscoverage['/editor.js'].lineData[52] = 0;
  _$jscoverage['/editor.js'].lineData[56] = 0;
  _$jscoverage['/editor.js'].lineData[61] = 0;
  _$jscoverage['/editor.js'].lineData[64] = 0;
  _$jscoverage['/editor.js'].lineData[67] = 0;
  _$jscoverage['/editor.js'].lineData[68] = 0;
  _$jscoverage['/editor.js'].lineData[70] = 0;
  _$jscoverage['/editor.js'].lineData[71] = 0;
  _$jscoverage['/editor.js'].lineData[75] = 0;
  _$jscoverage['/editor.js'].lineData[76] = 0;
  _$jscoverage['/editor.js'].lineData[80] = 0;
  _$jscoverage['/editor.js'].lineData[82] = 0;
  _$jscoverage['/editor.js'].lineData[83] = 0;
  _$jscoverage['/editor.js'].lineData[86] = 0;
  _$jscoverage['/editor.js'].lineData[87] = 0;
  _$jscoverage['/editor.js'].lineData[94] = 0;
  _$jscoverage['/editor.js'].lineData[98] = 0;
  _$jscoverage['/editor.js'].lineData[100] = 0;
  _$jscoverage['/editor.js'].lineData[102] = 0;
  _$jscoverage['/editor.js'].lineData[103] = 0;
  _$jscoverage['/editor.js'].lineData[107] = 0;
  _$jscoverage['/editor.js'].lineData[110] = 0;
  _$jscoverage['/editor.js'].lineData[111] = 0;
  _$jscoverage['/editor.js'].lineData[112] = 0;
  _$jscoverage['/editor.js'].lineData[113] = 0;
  _$jscoverage['/editor.js'].lineData[116] = 0;
  _$jscoverage['/editor.js'].lineData[117] = 0;
  _$jscoverage['/editor.js'].lineData[118] = 0;
  _$jscoverage['/editor.js'].lineData[120] = 0;
  _$jscoverage['/editor.js'].lineData[121] = 0;
  _$jscoverage['/editor.js'].lineData[127] = 0;
  _$jscoverage['/editor.js'].lineData[129] = 0;
  _$jscoverage['/editor.js'].lineData[130] = 0;
  _$jscoverage['/editor.js'].lineData[135] = 0;
  _$jscoverage['/editor.js'].lineData[140] = 0;
  _$jscoverage['/editor.js'].lineData[143] = 0;
  _$jscoverage['/editor.js'].lineData[146] = 0;
  _$jscoverage['/editor.js'].lineData[147] = 0;
  _$jscoverage['/editor.js'].lineData[151] = 0;
  _$jscoverage['/editor.js'].lineData[153] = 0;
  _$jscoverage['/editor.js'].lineData[155] = 0;
  _$jscoverage['/editor.js'].lineData[157] = 0;
  _$jscoverage['/editor.js'].lineData[159] = 0;
  _$jscoverage['/editor.js'].lineData[162] = 0;
  _$jscoverage['/editor.js'].lineData[163] = 0;
  _$jscoverage['/editor.js'].lineData[164] = 0;
  _$jscoverage['/editor.js'].lineData[168] = 0;
  _$jscoverage['/editor.js'].lineData[169] = 0;
  _$jscoverage['/editor.js'].lineData[177] = 0;
  _$jscoverage['/editor.js'].lineData[185] = 0;
  _$jscoverage['/editor.js'].lineData[194] = 0;
  _$jscoverage['/editor.js'].lineData[204] = 0;
  _$jscoverage['/editor.js'].lineData[205] = 0;
  _$jscoverage['/editor.js'].lineData[207] = 0;
  _$jscoverage['/editor.js'].lineData[208] = 0;
  _$jscoverage['/editor.js'].lineData[222] = 0;
  _$jscoverage['/editor.js'].lineData[231] = 0;
  _$jscoverage['/editor.js'].lineData[241] = 0;
  _$jscoverage['/editor.js'].lineData[244] = 0;
  _$jscoverage['/editor.js'].lineData[245] = 0;
  _$jscoverage['/editor.js'].lineData[246] = 0;
  _$jscoverage['/editor.js'].lineData[247] = 0;
  _$jscoverage['/editor.js'].lineData[249] = 0;
  _$jscoverage['/editor.js'].lineData[250] = 0;
  _$jscoverage['/editor.js'].lineData[260] = 0;
  _$jscoverage['/editor.js'].lineData[264] = 0;
  _$jscoverage['/editor.js'].lineData[267] = 0;
  _$jscoverage['/editor.js'].lineData[269] = 0;
  _$jscoverage['/editor.js'].lineData[270] = 0;
  _$jscoverage['/editor.js'].lineData[272] = 0;
  _$jscoverage['/editor.js'].lineData[273] = 0;
  _$jscoverage['/editor.js'].lineData[276] = 0;
  _$jscoverage['/editor.js'].lineData[277] = 0;
  _$jscoverage['/editor.js'].lineData[288] = 0;
  _$jscoverage['/editor.js'].lineData[291] = 0;
  _$jscoverage['/editor.js'].lineData[292] = 0;
  _$jscoverage['/editor.js'].lineData[294] = 0;
  _$jscoverage['/editor.js'].lineData[295] = 0;
  _$jscoverage['/editor.js'].lineData[297] = 0;
  _$jscoverage['/editor.js'].lineData[300] = 0;
  _$jscoverage['/editor.js'].lineData[301] = 0;
  _$jscoverage['/editor.js'].lineData[303] = 0;
  _$jscoverage['/editor.js'].lineData[305] = 0;
  _$jscoverage['/editor.js'].lineData[309] = 0;
  _$jscoverage['/editor.js'].lineData[310] = 0;
  _$jscoverage['/editor.js'].lineData[312] = 0;
  _$jscoverage['/editor.js'].lineData[322] = 0;
  _$jscoverage['/editor.js'].lineData[330] = 0;
  _$jscoverage['/editor.js'].lineData[331] = 0;
  _$jscoverage['/editor.js'].lineData[340] = 0;
  _$jscoverage['/editor.js'].lineData[349] = 0;
  _$jscoverage['/editor.js'].lineData[353] = 0;
  _$jscoverage['/editor.js'].lineData[354] = 0;
  _$jscoverage['/editor.js'].lineData[355] = 0;
  _$jscoverage['/editor.js'].lineData[356] = 0;
  _$jscoverage['/editor.js'].lineData[357] = 0;
  _$jscoverage['/editor.js'].lineData[359] = 0;
  _$jscoverage['/editor.js'].lineData[367] = 0;
  _$jscoverage['/editor.js'].lineData[370] = 0;
  _$jscoverage['/editor.js'].lineData[371] = 0;
  _$jscoverage['/editor.js'].lineData[373] = 0;
  _$jscoverage['/editor.js'].lineData[374] = 0;
  _$jscoverage['/editor.js'].lineData[376] = 0;
  _$jscoverage['/editor.js'].lineData[379] = 0;
  _$jscoverage['/editor.js'].lineData[383] = 0;
  _$jscoverage['/editor.js'].lineData[385] = 0;
  _$jscoverage['/editor.js'].lineData[386] = 0;
  _$jscoverage['/editor.js'].lineData[390] = 0;
  _$jscoverage['/editor.js'].lineData[398] = 0;
  _$jscoverage['/editor.js'].lineData[400] = 0;
  _$jscoverage['/editor.js'].lineData[401] = 0;
  _$jscoverage['/editor.js'].lineData[411] = 0;
  _$jscoverage['/editor.js'].lineData[414] = 0;
  _$jscoverage['/editor.js'].lineData[415] = 0;
  _$jscoverage['/editor.js'].lineData[416] = 0;
  _$jscoverage['/editor.js'].lineData[417] = 0;
  _$jscoverage['/editor.js'].lineData[427] = 0;
  _$jscoverage['/editor.js'].lineData[436] = 0;
  _$jscoverage['/editor.js'].lineData[439] = 0;
  _$jscoverage['/editor.js'].lineData[440] = 0;
  _$jscoverage['/editor.js'].lineData[441] = 0;
  _$jscoverage['/editor.js'].lineData[442] = 0;
  _$jscoverage['/editor.js'].lineData[443] = 0;
  _$jscoverage['/editor.js'].lineData[444] = 0;
  _$jscoverage['/editor.js'].lineData[453] = 0;
  _$jscoverage['/editor.js'].lineData[456] = 0;
  _$jscoverage['/editor.js'].lineData[457] = 0;
  _$jscoverage['/editor.js'].lineData[458] = 0;
  _$jscoverage['/editor.js'].lineData[461] = 0;
  _$jscoverage['/editor.js'].lineData[463] = 0;
  _$jscoverage['/editor.js'].lineData[464] = 0;
  _$jscoverage['/editor.js'].lineData[475] = 0;
  _$jscoverage['/editor.js'].lineData[476] = 0;
  _$jscoverage['/editor.js'].lineData[477] = 0;
  _$jscoverage['/editor.js'].lineData[478] = 0;
  _$jscoverage['/editor.js'].lineData[488] = 0;
  _$jscoverage['/editor.js'].lineData[497] = 0;
  _$jscoverage['/editor.js'].lineData[498] = 0;
  _$jscoverage['/editor.js'].lineData[499] = 0;
  _$jscoverage['/editor.js'].lineData[502] = 0;
  _$jscoverage['/editor.js'].lineData[503] = 0;
  _$jscoverage['/editor.js'].lineData[504] = 0;
  _$jscoverage['/editor.js'].lineData[505] = 0;
  _$jscoverage['/editor.js'].lineData[507] = 0;
  _$jscoverage['/editor.js'].lineData[508] = 0;
  _$jscoverage['/editor.js'].lineData[509] = 0;
  _$jscoverage['/editor.js'].lineData[525] = 0;
  _$jscoverage['/editor.js'].lineData[526] = 0;
  _$jscoverage['/editor.js'].lineData[527] = 0;
  _$jscoverage['/editor.js'].lineData[536] = 0;
  _$jscoverage['/editor.js'].lineData[538] = 0;
  _$jscoverage['/editor.js'].lineData[539] = 0;
  _$jscoverage['/editor.js'].lineData[542] = 0;
  _$jscoverage['/editor.js'].lineData[544] = 0;
  _$jscoverage['/editor.js'].lineData[558] = 0;
  _$jscoverage['/editor.js'].lineData[559] = 0;
  _$jscoverage['/editor.js'].lineData[562] = 0;
  _$jscoverage['/editor.js'].lineData[564] = 0;
  _$jscoverage['/editor.js'].lineData[565] = 0;
  _$jscoverage['/editor.js'].lineData[568] = 0;
  _$jscoverage['/editor.js'].lineData[569] = 0;
  _$jscoverage['/editor.js'].lineData[572] = 0;
  _$jscoverage['/editor.js'].lineData[573] = 0;
  _$jscoverage['/editor.js'].lineData[577] = 0;
  _$jscoverage['/editor.js'].lineData[578] = 0;
  _$jscoverage['/editor.js'].lineData[581] = 0;
  _$jscoverage['/editor.js'].lineData[584] = 0;
  _$jscoverage['/editor.js'].lineData[585] = 0;
  _$jscoverage['/editor.js'].lineData[586] = 0;
  _$jscoverage['/editor.js'].lineData[587] = 0;
  _$jscoverage['/editor.js'].lineData[590] = 0;
  _$jscoverage['/editor.js'].lineData[593] = 0;
  _$jscoverage['/editor.js'].lineData[596] = 0;
  _$jscoverage['/editor.js'].lineData[597] = 0;
  _$jscoverage['/editor.js'].lineData[600] = 0;
  _$jscoverage['/editor.js'].lineData[601] = 0;
  _$jscoverage['/editor.js'].lineData[607] = 0;
  _$jscoverage['/editor.js'].lineData[608] = 0;
  _$jscoverage['/editor.js'].lineData[618] = 0;
  _$jscoverage['/editor.js'].lineData[622] = 0;
  _$jscoverage['/editor.js'].lineData[623] = 0;
  _$jscoverage['/editor.js'].lineData[626] = 0;
  _$jscoverage['/editor.js'].lineData[627] = 0;
  _$jscoverage['/editor.js'].lineData[630] = 0;
  _$jscoverage['/editor.js'].lineData[631] = 0;
  _$jscoverage['/editor.js'].lineData[635] = 0;
  _$jscoverage['/editor.js'].lineData[636] = 0;
  _$jscoverage['/editor.js'].lineData[637] = 0;
  _$jscoverage['/editor.js'].lineData[638] = 0;
  _$jscoverage['/editor.js'].lineData[640] = 0;
  _$jscoverage['/editor.js'].lineData[641] = 0;
  _$jscoverage['/editor.js'].lineData[643] = 0;
  _$jscoverage['/editor.js'].lineData[650] = 0;
  _$jscoverage['/editor.js'].lineData[651] = 0;
  _$jscoverage['/editor.js'].lineData[653] = 0;
  _$jscoverage['/editor.js'].lineData[656] = 0;
  _$jscoverage['/editor.js'].lineData[657] = 0;
  _$jscoverage['/editor.js'].lineData[659] = 0;
  _$jscoverage['/editor.js'].lineData[661] = 0;
  _$jscoverage['/editor.js'].lineData[662] = 0;
  _$jscoverage['/editor.js'].lineData[663] = 0;
  _$jscoverage['/editor.js'].lineData[665] = 0;
  _$jscoverage['/editor.js'].lineData[666] = 0;
  _$jscoverage['/editor.js'].lineData[668] = 0;
  _$jscoverage['/editor.js'].lineData[674] = 0;
  _$jscoverage['/editor.js'].lineData[675] = 0;
  _$jscoverage['/editor.js'].lineData[677] = 0;
  _$jscoverage['/editor.js'].lineData[689] = 0;
  _$jscoverage['/editor.js'].lineData[690] = 0;
  _$jscoverage['/editor.js'].lineData[691] = 0;
  _$jscoverage['/editor.js'].lineData[692] = 0;
  _$jscoverage['/editor.js'].lineData[693] = 0;
  _$jscoverage['/editor.js'].lineData[694] = 0;
  _$jscoverage['/editor.js'].lineData[695] = 0;
  _$jscoverage['/editor.js'].lineData[696] = 0;
  _$jscoverage['/editor.js'].lineData[697] = 0;
  _$jscoverage['/editor.js'].lineData[699] = 0;
  _$jscoverage['/editor.js'].lineData[700] = 0;
  _$jscoverage['/editor.js'].lineData[702] = 0;
  _$jscoverage['/editor.js'].lineData[703] = 0;
  _$jscoverage['/editor.js'].lineData[705] = 0;
  _$jscoverage['/editor.js'].lineData[706] = 0;
  _$jscoverage['/editor.js'].lineData[707] = 0;
  _$jscoverage['/editor.js'].lineData[708] = 0;
  _$jscoverage['/editor.js'].lineData[709] = 0;
  _$jscoverage['/editor.js'].lineData[716] = 0;
  _$jscoverage['/editor.js'].lineData[717] = 0;
  _$jscoverage['/editor.js'].lineData[723] = 0;
  _$jscoverage['/editor.js'].lineData[725] = 0;
  _$jscoverage['/editor.js'].lineData[727] = 0;
  _$jscoverage['/editor.js'].lineData[729] = 0;
  _$jscoverage['/editor.js'].lineData[751] = 0;
  _$jscoverage['/editor.js'].lineData[753] = 0;
  _$jscoverage['/editor.js'].lineData[756] = 0;
  _$jscoverage['/editor.js'].lineData[757] = 0;
  _$jscoverage['/editor.js'].lineData[758] = 0;
  _$jscoverage['/editor.js'].lineData[762] = 0;
  _$jscoverage['/editor.js'].lineData[764] = 0;
  _$jscoverage['/editor.js'].lineData[765] = 0;
  _$jscoverage['/editor.js'].lineData[767] = 0;
  _$jscoverage['/editor.js'].lineData[768] = 0;
  _$jscoverage['/editor.js'].lineData[770] = 0;
  _$jscoverage['/editor.js'].lineData[777] = 0;
  _$jscoverage['/editor.js'].lineData[788] = 0;
  _$jscoverage['/editor.js'].lineData[789] = 0;
  _$jscoverage['/editor.js'].lineData[796] = 0;
  _$jscoverage['/editor.js'].lineData[797] = 0;
  _$jscoverage['/editor.js'].lineData[798] = 0;
  _$jscoverage['/editor.js'].lineData[799] = 0;
  _$jscoverage['/editor.js'].lineData[806] = 0;
  _$jscoverage['/editor.js'].lineData[812] = 0;
  _$jscoverage['/editor.js'].lineData[821] = 0;
  _$jscoverage['/editor.js'].lineData[822] = 0;
  _$jscoverage['/editor.js'].lineData[823] = 0;
  _$jscoverage['/editor.js'].lineData[824] = 0;
  _$jscoverage['/editor.js'].lineData[825] = 0;
  _$jscoverage['/editor.js'].lineData[832] = 0;
  _$jscoverage['/editor.js'].lineData[833] = 0;
  _$jscoverage['/editor.js'].lineData[834] = 0;
  _$jscoverage['/editor.js'].lineData[838] = 0;
  _$jscoverage['/editor.js'].lineData[840] = 0;
  _$jscoverage['/editor.js'].lineData[842] = 0;
  _$jscoverage['/editor.js'].lineData[843] = 0;
  _$jscoverage['/editor.js'].lineData[844] = 0;
  _$jscoverage['/editor.js'].lineData[850] = 0;
  _$jscoverage['/editor.js'].lineData[851] = 0;
  _$jscoverage['/editor.js'].lineData[852] = 0;
  _$jscoverage['/editor.js'].lineData[855] = 0;
  _$jscoverage['/editor.js'].lineData[865] = 0;
  _$jscoverage['/editor.js'].lineData[866] = 0;
  _$jscoverage['/editor.js'].lineData[867] = 0;
  _$jscoverage['/editor.js'].lineData[869] = 0;
  _$jscoverage['/editor.js'].lineData[871] = 0;
  _$jscoverage['/editor.js'].lineData[872] = 0;
  _$jscoverage['/editor.js'].lineData[873] = 0;
  _$jscoverage['/editor.js'].lineData[875] = 0;
  _$jscoverage['/editor.js'].lineData[876] = 0;
  _$jscoverage['/editor.js'].lineData[882] = 0;
  _$jscoverage['/editor.js'].lineData[883] = 0;
  _$jscoverage['/editor.js'].lineData[884] = 0;
  _$jscoverage['/editor.js'].lineData[886] = 0;
  _$jscoverage['/editor.js'].lineData[891] = 0;
  _$jscoverage['/editor.js'].lineData[892] = 0;
  _$jscoverage['/editor.js'].lineData[902] = 0;
  _$jscoverage['/editor.js'].lineData[903] = 0;
  _$jscoverage['/editor.js'].lineData[904] = 0;
  _$jscoverage['/editor.js'].lineData[905] = 0;
  _$jscoverage['/editor.js'].lineData[906] = 0;
  _$jscoverage['/editor.js'].lineData[910] = 0;
  _$jscoverage['/editor.js'].lineData[911] = 0;
  _$jscoverage['/editor.js'].lineData[912] = 0;
  _$jscoverage['/editor.js'].lineData[913] = 0;
  _$jscoverage['/editor.js'].lineData[919] = 0;
  _$jscoverage['/editor.js'].lineData[920] = 0;
  _$jscoverage['/editor.js'].lineData[921] = 0;
  _$jscoverage['/editor.js'].lineData[928] = 0;
  _$jscoverage['/editor.js'].lineData[929] = 0;
  _$jscoverage['/editor.js'].lineData[931] = 0;
  _$jscoverage['/editor.js'].lineData[932] = 0;
  _$jscoverage['/editor.js'].lineData[933] = 0;
  _$jscoverage['/editor.js'].lineData[935] = 0;
  _$jscoverage['/editor.js'].lineData[936] = 0;
  _$jscoverage['/editor.js'].lineData[937] = 0;
  _$jscoverage['/editor.js'].lineData[941] = 0;
  _$jscoverage['/editor.js'].lineData[947] = 0;
  _$jscoverage['/editor.js'].lineData[948] = 0;
  _$jscoverage['/editor.js'].lineData[950] = 0;
  _$jscoverage['/editor.js'].lineData[951] = 0;
  _$jscoverage['/editor.js'].lineData[954] = 0;
  _$jscoverage['/editor.js'].lineData[957] = 0;
  _$jscoverage['/editor.js'].lineData[961] = 0;
  _$jscoverage['/editor.js'].lineData[962] = 0;
  _$jscoverage['/editor.js'].lineData[963] = 0;
  _$jscoverage['/editor.js'].lineData[968] = 0;
  _$jscoverage['/editor.js'].lineData[974] = 0;
  _$jscoverage['/editor.js'].lineData[975] = 0;
  _$jscoverage['/editor.js'].lineData[977] = 0;
  _$jscoverage['/editor.js'].lineData[978] = 0;
  _$jscoverage['/editor.js'].lineData[980] = 0;
  _$jscoverage['/editor.js'].lineData[982] = 0;
  _$jscoverage['/editor.js'].lineData[985] = 0;
  _$jscoverage['/editor.js'].lineData[987] = 0;
  _$jscoverage['/editor.js'].lineData[988] = 0;
  _$jscoverage['/editor.js'].lineData[989] = 0;
  _$jscoverage['/editor.js'].lineData[990] = 0;
  _$jscoverage['/editor.js'].lineData[998] = 0;
  _$jscoverage['/editor.js'].lineData[999] = 0;
  _$jscoverage['/editor.js'].lineData[1000] = 0;
  _$jscoverage['/editor.js'].lineData[1001] = 0;
  _$jscoverage['/editor.js'].lineData[1002] = 0;
  _$jscoverage['/editor.js'].lineData[1003] = 0;
  _$jscoverage['/editor.js'].lineData[1011] = 0;
  _$jscoverage['/editor.js'].lineData[1012] = 0;
  _$jscoverage['/editor.js'].lineData[1013] = 0;
  _$jscoverage['/editor.js'].lineData[1014] = 0;
  _$jscoverage['/editor.js'].lineData[1015] = 0;
  _$jscoverage['/editor.js'].lineData[1021] = 0;
  _$jscoverage['/editor.js'].lineData[1022] = 0;
  _$jscoverage['/editor.js'].lineData[1023] = 0;
  _$jscoverage['/editor.js'].lineData[1024] = 0;
  _$jscoverage['/editor.js'].lineData[1026] = 0;
  _$jscoverage['/editor.js'].lineData[1032] = 0;
  _$jscoverage['/editor.js'].lineData[1036] = 0;
  _$jscoverage['/editor.js'].lineData[1037] = 0;
  _$jscoverage['/editor.js'].lineData[1040] = 0;
  _$jscoverage['/editor.js'].lineData[1041] = 0;
  _$jscoverage['/editor.js'].lineData[1042] = 0;
  _$jscoverage['/editor.js'].lineData[1043] = 0;
  _$jscoverage['/editor.js'].lineData[1047] = 0;
  _$jscoverage['/editor.js'].lineData[1073] = 0;
  _$jscoverage['/editor.js'].lineData[1074] = 0;
  _$jscoverage['/editor.js'].lineData[1077] = 0;
  _$jscoverage['/editor.js'].lineData[1078] = 0;
  _$jscoverage['/editor.js'].lineData[1085] = 0;
  _$jscoverage['/editor.js'].lineData[1086] = 0;
  _$jscoverage['/editor.js'].lineData[1094] = 0;
  _$jscoverage['/editor.js'].lineData[1099] = 0;
  _$jscoverage['/editor.js'].lineData[1102] = 0;
  _$jscoverage['/editor.js'].lineData[1103] = 0;
  _$jscoverage['/editor.js'].lineData[1104] = 0;
  _$jscoverage['/editor.js'].lineData[1107] = 0;
  _$jscoverage['/editor.js'].lineData[1108] = 0;
  _$jscoverage['/editor.js'].lineData[1109] = 0;
  _$jscoverage['/editor.js'].lineData[1110] = 0;
  _$jscoverage['/editor.js'].lineData[1111] = 0;
  _$jscoverage['/editor.js'].lineData[1112] = 0;
  _$jscoverage['/editor.js'].lineData[1114] = 0;
  _$jscoverage['/editor.js'].lineData[1115] = 0;
  _$jscoverage['/editor.js'].lineData[1116] = 0;
  _$jscoverage['/editor.js'].lineData[1120] = 0;
  _$jscoverage['/editor.js'].lineData[1124] = 0;
  _$jscoverage['/editor.js'].lineData[1125] = 0;
  _$jscoverage['/editor.js'].lineData[1126] = 0;
  _$jscoverage['/editor.js'].lineData[1128] = 0;
  _$jscoverage['/editor.js'].lineData[1133] = 0;
  _$jscoverage['/editor.js'].lineData[1134] = 0;
  _$jscoverage['/editor.js'].lineData[1136] = 0;
  _$jscoverage['/editor.js'].lineData[1137] = 0;
  _$jscoverage['/editor.js'].lineData[1138] = 0;
  _$jscoverage['/editor.js'].lineData[1140] = 0;
  _$jscoverage['/editor.js'].lineData[1141] = 0;
  _$jscoverage['/editor.js'].lineData[1142] = 0;
  _$jscoverage['/editor.js'].lineData[1146] = 0;
  _$jscoverage['/editor.js'].lineData[1150] = 0;
  _$jscoverage['/editor.js'].lineData[1151] = 0;
  _$jscoverage['/editor.js'].lineData[1152] = 0;
  _$jscoverage['/editor.js'].lineData[1154] = 0;
  _$jscoverage['/editor.js'].lineData[1160] = 0;
  _$jscoverage['/editor.js'].lineData[1161] = 0;
  _$jscoverage['/editor.js'].lineData[1163] = 0;
  _$jscoverage['/editor.js'].lineData[1168] = 0;
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
  _$jscoverage['/editor.js'].functionData[75] = 0;
}
if (! _$jscoverage['/editor.js'].branchData) {
  _$jscoverage['/editor.js'].branchData = {};
  _$jscoverage['/editor.js'].branchData['61'] = [];
  _$jscoverage['/editor.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['62'] = [];
  _$jscoverage['/editor.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['70'] = [];
  _$jscoverage['/editor.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['76'] = [];
  _$jscoverage['/editor.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['100'] = [];
  _$jscoverage['/editor.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['101'] = [];
  _$jscoverage['/editor.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['110'] = [];
  _$jscoverage['/editor.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['116'] = [];
  _$jscoverage['/editor.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['129'] = [];
  _$jscoverage['/editor.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['140'] = [];
  _$jscoverage['/editor.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['141'] = [];
  _$jscoverage['/editor.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['146'] = [];
  _$jscoverage['/editor.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['163'] = [];
  _$jscoverage['/editor.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['246'] = [];
  _$jscoverage['/editor.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['267'] = [];
  _$jscoverage['/editor.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['272'] = [];
  _$jscoverage['/editor.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['291'] = [];
  _$jscoverage['/editor.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['294'] = [];
  _$jscoverage['/editor.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['294'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['300'] = [];
  _$jscoverage['/editor.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['309'] = [];
  _$jscoverage['/editor.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['353'] = [];
  _$jscoverage['/editor.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['370'] = [];
  _$jscoverage['/editor.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['376'] = [];
  _$jscoverage['/editor.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['379'] = [];
  _$jscoverage['/editor.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['379'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['383'] = [];
  _$jscoverage['/editor.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['413'] = [];
  _$jscoverage['/editor.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['416'] = [];
  _$jscoverage['/editor.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['457'] = [];
  _$jscoverage['/editor.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['463'] = [];
  _$jscoverage['/editor.js'].branchData['463'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['477'] = [];
  _$jscoverage['/editor.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['498'] = [];
  _$jscoverage['/editor.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['504'] = [];
  _$jscoverage['/editor.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['507'] = [];
  _$jscoverage['/editor.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['538'] = [];
  _$jscoverage['/editor.js'].branchData['538'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['550'] = [];
  _$jscoverage['/editor.js'].branchData['550'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['558'] = [];
  _$jscoverage['/editor.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['558'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['564'] = [];
  _$jscoverage['/editor.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['568'] = [];
  _$jscoverage['/editor.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['568'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['572'] = [];
  _$jscoverage['/editor.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['577'] = [];
  _$jscoverage['/editor.js'].branchData['577'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['584'] = [];
  _$jscoverage['/editor.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['587'] = [];
  _$jscoverage['/editor.js'].branchData['587'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['587'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['587'][3] = new BranchData();
  _$jscoverage['/editor.js'].branchData['590'] = [];
  _$jscoverage['/editor.js'].branchData['590'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['591'] = [];
  _$jscoverage['/editor.js'].branchData['591'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['600'] = [];
  _$jscoverage['/editor.js'].branchData['600'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['600'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['622'] = [];
  _$jscoverage['/editor.js'].branchData['622'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['626'] = [];
  _$jscoverage['/editor.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['635'] = [];
  _$jscoverage['/editor.js'].branchData['635'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['637'] = [];
  _$jscoverage['/editor.js'].branchData['637'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['656'] = [];
  _$jscoverage['/editor.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['659'] = [];
  _$jscoverage['/editor.js'].branchData['659'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['659'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['659'][3] = new BranchData();
  _$jscoverage['/editor.js'].branchData['661'] = [];
  _$jscoverage['/editor.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['690'] = [];
  _$jscoverage['/editor.js'].branchData['690'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['692'] = [];
  _$jscoverage['/editor.js'].branchData['692'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['696'] = [];
  _$jscoverage['/editor.js'].branchData['696'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['697'] = [];
  _$jscoverage['/editor.js'].branchData['697'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['699'] = [];
  _$jscoverage['/editor.js'].branchData['699'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['700'] = [];
  _$jscoverage['/editor.js'].branchData['700'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['702'] = [];
  _$jscoverage['/editor.js'].branchData['702'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['705'] = [];
  _$jscoverage['/editor.js'].branchData['705'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['751'] = [];
  _$jscoverage['/editor.js'].branchData['751'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['764'] = [];
  _$jscoverage['/editor.js'].branchData['764'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['767'] = [];
  _$jscoverage['/editor.js'].branchData['767'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['786'] = [];
  _$jscoverage['/editor.js'].branchData['786'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['797'] = [];
  _$jscoverage['/editor.js'].branchData['797'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['798'] = [];
  _$jscoverage['/editor.js'].branchData['798'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['821'] = [];
  _$jscoverage['/editor.js'].branchData['821'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['823'] = [];
  _$jscoverage['/editor.js'].branchData['823'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['840'] = [];
  _$jscoverage['/editor.js'].branchData['840'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['852'] = [];
  _$jscoverage['/editor.js'].branchData['852'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['853'] = [];
  _$jscoverage['/editor.js'].branchData['853'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['853'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['875'] = [];
  _$jscoverage['/editor.js'].branchData['875'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['886'] = [];
  _$jscoverage['/editor.js'].branchData['886'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['902'] = [];
  _$jscoverage['/editor.js'].branchData['902'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['905'] = [];
  _$jscoverage['/editor.js'].branchData['905'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['912'] = [];
  _$jscoverage['/editor.js'].branchData['912'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['919'] = [];
  _$jscoverage['/editor.js'].branchData['919'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['919'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['932'] = [];
  _$jscoverage['/editor.js'].branchData['932'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['947'] = [];
  _$jscoverage['/editor.js'].branchData['947'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['950'] = [];
  _$jscoverage['/editor.js'].branchData['950'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['957'] = [];
  _$jscoverage['/editor.js'].branchData['957'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['962'] = [];
  _$jscoverage['/editor.js'].branchData['962'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['968'] = [];
  _$jscoverage['/editor.js'].branchData['968'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['977'] = [];
  _$jscoverage['/editor.js'].branchData['977'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['980'] = [];
  _$jscoverage['/editor.js'].branchData['980'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['998'] = [];
  _$jscoverage['/editor.js'].branchData['998'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1001'] = [];
  _$jscoverage['/editor.js'].branchData['1001'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1011'] = [];
  _$jscoverage['/editor.js'].branchData['1011'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1014'] = [];
  _$jscoverage['/editor.js'].branchData['1014'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1021'] = [];
  _$jscoverage['/editor.js'].branchData['1021'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1024'] = [];
  _$jscoverage['/editor.js'].branchData['1024'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1024'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1042'] = [];
  _$jscoverage['/editor.js'].branchData['1042'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1051'] = [];
  _$jscoverage['/editor.js'].branchData['1051'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1058'] = [];
  _$jscoverage['/editor.js'].branchData['1058'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1102'] = [];
  _$jscoverage['/editor.js'].branchData['1102'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1124'] = [];
  _$jscoverage['/editor.js'].branchData['1124'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1125'] = [];
  _$jscoverage['/editor.js'].branchData['1125'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1133'] = [];
  _$jscoverage['/editor.js'].branchData['1133'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1140'] = [];
  _$jscoverage['/editor.js'].branchData['1140'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1151'] = [];
  _$jscoverage['/editor.js'].branchData['1151'][1] = new BranchData();
}
_$jscoverage['/editor.js'].branchData['1151'][1].init(14, 19, '!self.get(\'iframe\')');
function visit1251_1151_1(result) {
  _$jscoverage['/editor.js'].branchData['1151'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1140'][1].init(900, 31, 'UA[\'gecko\'] && !iframe.__loaded');
function visit1250_1140_1(result) {
  _$jscoverage['/editor.js'].branchData['1140'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1133'][1].init(568, 28, 'textarea.hasAttr(\'tabindex\')');
function visit1249_1133_1(result) {
  _$jscoverage['/editor.js'].branchData['1133'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1125'][1].init(266, 9, 'iframeSrc');
function visit1248_1125_1(result) {
  _$jscoverage['/editor.js'].branchData['1125'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1124'][1].init(216, 35, '$(window).getEmptyIframeSrc() || \'\'');
function visit1247_1124_1(result) {
  _$jscoverage['/editor.js'].branchData['1124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1102'][1].init(378, 9, 'IS_IE < 7');
function visit1246_1102_1(result) {
  _$jscoverage['/editor.js'].branchData['1102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1058'][1].init(539, 10, 'data || \'\'');
function visit1245_1058_1(result) {
  _$jscoverage['/editor.js'].branchData['1058'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1051'][1].init(236, 27, 'document.documentMode === 8');
function visit1244_1051_1(result) {
  _$jscoverage['/editor.js'].branchData['1051'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1042'][1].init(222, 21, 'i < customLink.length');
function visit1243_1042_1(result) {
  _$jscoverage['/editor.js'].branchData['1042'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1024'][2].init(74, 28, 'control.nodeName() === \'img\'');
function visit1242_1024_2(result) {
  _$jscoverage['/editor.js'].branchData['1024'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1024'][1].init(74, 64, 'control.nodeName() === \'img\' && /ke_/.test(control[0].className)');
function visit1241_1024_1(result) {
  _$jscoverage['/editor.js'].branchData['1024'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1021'][1].init(4965, 11, 'UA[\'gecko\']');
function visit1240_1021_1(result) {
  _$jscoverage['/editor.js'].branchData['1021'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1014'][1].init(74, 75, 'S.inArray(control.nodeName(), [\'img\', \'hr\', \'input\', \'textarea\', \'select\'])');
function visit1239_1014_1(result) {
  _$jscoverage['/editor.js'].branchData['1014'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1011'][1].init(4618, 12, 'UA[\'webkit\']');
function visit1238_1011_1(result) {
  _$jscoverage['/editor.js'].branchData['1011'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1001'][1].init(26, 29, 'evt.keyCode in pageUpDownKeys');
function visit1237_1001_1(result) {
  _$jscoverage['/editor.js'].branchData['1001'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['998'][1].init(1367, 30, 'doc.compatMode == \'CSS1Compat\'');
function visit1236_998_1(result) {
  _$jscoverage['/editor.js'].branchData['998'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['980'][1].init(139, 7, 'control');
function visit1235_980_1(result) {
  _$jscoverage['/editor.js'].branchData['980'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['977'][1].init(107, 26, 'keyCode in {\n  8: 1, \n  46: 1}');
function visit1234_977_1(result) {
  _$jscoverage['/editor.js'].branchData['977'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['968'][1].init(2722, 5, 'IS_IE');
function visit1233_968_1(result) {
  _$jscoverage['/editor.js'].branchData['968'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['962'][1].init(22, 19, '!self.__iframeFocus');
function visit1232_962_1(result) {
  _$jscoverage['/editor.js'].branchData['962'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['957'][1].init(2426, 11, 'UA[\'gecko\']');
function visit1231_957_1(result) {
  _$jscoverage['/editor.js'].branchData['957'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['950'][1].init(249, 11, 'UA[\'opera\']');
function visit1230_950_1(result) {
  _$jscoverage['/editor.js'].branchData['950'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['947'][1].init(154, 11, 'UA[\'gecko\']');
function visit1229_947_1(result) {
  _$jscoverage['/editor.js'].branchData['947'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['932'][1].init(22, 33, 'UA[\'gecko\'] && self.__iframeFocus');
function visit1228_932_1(result) {
  _$jscoverage['/editor.js'].branchData['932'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['919'][2].init(1120, 20, 'IS_IE || UA[\'opera\']');
function visit1227_919_2(result) {
  _$jscoverage['/editor.js'].branchData['919'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['919'][1].init(1105, 35, 'UA[\'gecko\'] || IS_IE || UA[\'opera\']');
function visit1226_919_1(result) {
  _$jscoverage['/editor.js'].branchData['919'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['912'][1].init(74, 52, 'S.inArray(control.nodeName(), [\'input\', \'textarea\'])');
function visit1225_912_1(result) {
  _$jscoverage['/editor.js'].branchData['912'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['905'][1].init(74, 50, 'S.inArray(control.nodeName(), [\'input\', \'select\'])');
function visit1224_905_1(result) {
  _$jscoverage['/editor.js'].branchData['905'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['902'][1].init(439, 12, 'UA[\'webkit\']');
function visit1223_902_1(result) {
  _$jscoverage['/editor.js'].branchData['902'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['886'][1].init(225, 29, '!retry && blinkCursor(doc, 1)');
function visit1222_886_1(result) {
  _$jscoverage['/editor.js'].branchData['886'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['875'][1].init(153, 23, '!arguments.callee.retry');
function visit1221_875_1(result) {
  _$jscoverage['/editor.js'].branchData['875'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['853'][2].init(54, 24, 't.nodeName() === \'table\'');
function visit1220_853_2(result) {
  _$jscoverage['/editor.js'].branchData['853'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['853'][1].init(54, 86, 't.nodeName() === \'table\' && disableInlineTableEditing');
function visit1219_853_1(result) {
  _$jscoverage['/editor.js'].branchData['853'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['852'][1].init(85, 142, 'disableObjectResizing || (t.nodeName() === \'table\' && disableInlineTableEditing)');
function visit1218_852_1(result) {
  _$jscoverage['/editor.js'].branchData['852'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['840'][1].init(326, 50, 'disableObjectResizing || disableInlineTableEditing');
function visit1217_840_1(result) {
  _$jscoverage['/editor.js'].branchData['840'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['823'][1].init(26, 3, 'doc');
function visit1216_823_1(result) {
  _$jscoverage['/editor.js'].branchData['823'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['821'][1].init(381, 5, 'IS_IE');
function visit1215_821_1(result) {
  _$jscoverage['/editor.js'].branchData['821'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['798'][1].init(26, 11, 'UA[\'gecko\']');
function visit1214_798_1(result) {
  _$jscoverage['/editor.js'].branchData['798'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['797'][1].init(327, 16, 't == htmlElement');
function visit1213_797_1(result) {
  _$jscoverage['/editor.js'].branchData['797'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['786'][1].init(372, 26, 'UA[\'gecko\'] || UA[\'opera\']');
function visit1212_786_1(result) {
  _$jscoverage['/editor.js'].branchData['786'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['767'][1].init(229, 12, 'UA[\'webkit\']');
function visit1211_767_1(result) {
  _$jscoverage['/editor.js'].branchData['767'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['764'][1].init(100, 26, 'UA[\'gecko\'] || UA[\'opera\']');
function visit1210_764_1(result) {
  _$jscoverage['/editor.js'].branchData['764'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['751'][1].init(1316, 5, 'IS_IE');
function visit1209_751_1(result) {
  _$jscoverage['/editor.js'].branchData['751'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['705'][1].init(523, 26, 'cfg.data || textarea.val()');
function visit1208_705_1(result) {
  _$jscoverage['/editor.js'].branchData['705'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['702'][1].init(444, 4, 'name');
function visit1207_702_1(result) {
  _$jscoverage['/editor.js'].branchData['702'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['700'][1].init(27, 20, 'cfg.height || height');
function visit1206_700_1(result) {
  _$jscoverage['/editor.js'].branchData['700'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['699'][1].init(362, 6, 'height');
function visit1205_699_1(result) {
  _$jscoverage['/editor.js'].branchData['699'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['697'][1].init(26, 18, 'cfg.width || width');
function visit1204_697_1(result) {
  _$jscoverage['/editor.js'].branchData['697'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['696'][1].init(284, 5, 'width');
function visit1203_696_1(result) {
  _$jscoverage['/editor.js'].branchData['696'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['692'][1].init(109, 23, 'cfg.textareaAttrs || {}');
function visit1202_692_1(result) {
  _$jscoverage['/editor.js'].branchData['692'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['690'][1].init(16, 9, 'cfg || {}');
function visit1201_690_1(result) {
  _$jscoverage['/editor.js'].branchData['690'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['661'][1].init(316, 5, '!node');
function visit1200_661_1(result) {
  _$jscoverage['/editor.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['659'][3].init(65, 33, 'el.nodeName.toLowerCase() != \'br\'');
function visit1199_659_3(result) {
  _$jscoverage['/editor.js'].branchData['659'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['659'][2].init(45, 16, 'el.nodeType == 1');
function visit1198_659_2(result) {
  _$jscoverage['/editor.js'].branchData['659'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['659'][1].init(45, 53, 'el.nodeType == 1 && el.nodeName.toLowerCase() != \'br\'');
function visit1197_659_1(result) {
  _$jscoverage['/editor.js'].branchData['659'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['656'][1].init(123, 43, 'self.getSelection().getRanges().length == 0');
function visit1196_656_1(result) {
  _$jscoverage['/editor.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['637'][1].init(71, 22, '$sel.type == \'Control\'');
function visit1195_637_1(result) {
  _$jscoverage['/editor.js'].branchData['637'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['635'][1].init(541, 5, 'IS_IE');
function visit1194_635_1(result) {
  _$jscoverage['/editor.js'].branchData['635'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['626'][1].init(236, 42, 'htmlDataProcessor = self.htmlDataProcessor');
function visit1193_626_1(result) {
  _$jscoverage['/editor.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['622'][1].init(140, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1192_622_1(result) {
  _$jscoverage['/editor.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['600'][2].init(2422, 22, 'clone[0].nodeType == 1');
function visit1191_600_2(result) {
  _$jscoverage['/editor.js'].branchData['600'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['600'][1].init(2413, 31, 'clone && clone[0].nodeType == 1');
function visit1190_600_1(result) {
  _$jscoverage['/editor.js'].branchData['600'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['591'][1].init(32, 83, 'xhtml_dtd.$block[nextName] && xhtml_dtd[nextName][\'#text\']');
function visit1189_591_1(result) {
  _$jscoverage['/editor.js'].branchData['591'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['590'][1].init(344, 116, 'nextName && xhtml_dtd.$block[nextName] && xhtml_dtd[nextName][\'#text\']');
function visit1188_590_1(result) {
  _$jscoverage['/editor.js'].branchData['590'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['587'][3].init(171, 41, 'next[0].nodeType == NodeType.ELEMENT_NODE');
function visit1187_587_3(result) {
  _$jscoverage['/editor.js'].branchData['587'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['587'][2].init(171, 81, 'next[0].nodeType == NodeType.ELEMENT_NODE && next.nodeName()');
function visit1186_587_2(result) {
  _$jscoverage['/editor.js'].branchData['587'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['587'][1].init(163, 89, 'next && next[0].nodeType == NodeType.ELEMENT_NODE && next.nodeName()');
function visit1185_587_1(result) {
  _$jscoverage['/editor.js'].branchData['587'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['584'][1].init(1629, 7, 'isBlock');
function visit1184_584_1(result) {
  _$jscoverage['/editor.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['577'][1].init(1313, 12, '!lastElement');
function visit1183_577_1(result) {
  _$jscoverage['/editor.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['572'][1].init(333, 12, '!lastElement');
function visit1182_572_1(result) {
  _$jscoverage['/editor.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['568'][2].init(116, 13, '!i && element');
function visit1181_568_2(result) {
  _$jscoverage['/editor.js'].branchData['568'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['568'][1].init(116, 39, '!i && element || element[\'clone\'](TRUE)');
function visit1180_568_1(result) {
  _$jscoverage['/editor.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['564'][1].init(855, 6, 'i >= 0');
function visit1179_564_1(result) {
  _$jscoverage['/editor.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['558'][2].init(699, 18, 'ranges.length == 0');
function visit1178_558_2(result) {
  _$jscoverage['/editor.js'].branchData['558'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['558'][1].init(688, 29, '!ranges || ranges.length == 0');
function visit1177_558_1(result) {
  _$jscoverage['/editor.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['550'][1].init(291, 34, 'selection && selection.getRanges()');
function visit1176_550_1(result) {
  _$jscoverage['/editor.js'].branchData['550'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['538'][1].init(50, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1175_538_1(result) {
  _$jscoverage['/editor.js'].branchData['538'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['507'][1].init(172, 65, '!self.__previousPath || !self.__previousPath.compare(currentPath)');
function visit1174_507_1(result) {
  _$jscoverage['/editor.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['504'][1].init(76, 33, 'selection && !selection.isInvalid');
function visit1173_504_1(result) {
  _$jscoverage['/editor.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['498'][1].init(48, 29, 'self.__checkSelectionChangeId');
function visit1172_498_1(result) {
  _$jscoverage['/editor.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['477'][1].init(88, 15, 'self.__docReady');
function visit1171_477_1(result) {
  _$jscoverage['/editor.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['463'][1].init(382, 9, 'ind != -1');
function visit1170_463_1(result) {
  _$jscoverage['/editor.js'].branchData['463'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['457'][1].init(22, 22, 'l.attr(\'href\') == link');
function visit1169_457_1(result) {
  _$jscoverage['/editor.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['416'][1].init(248, 3, 'win');
function visit1168_416_1(result) {
  _$jscoverage['/editor.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['413'][1].init(90, 29, 'self.get(\'customStyle\') || \'\'');
function visit1167_413_1(result) {
  _$jscoverage['/editor.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['383'][1].init(614, 18, 'win && win.focus()');
function visit1166_383_1(result) {
  _$jscoverage['/editor.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['379'][2].init(143, 32, 'win.parent && win.parent.focus()');
function visit1165_379_2(result) {
  _$jscoverage['/editor.js'].branchData['379'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['379'][1].init(136, 39, 'win && win.parent && win.parent.focus()');
function visit1164_379_1(result) {
  _$jscoverage['/editor.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['376'][1].init(307, 9, '!UA[\'ie\']');
function visit1163_376_1(result) {
  _$jscoverage['/editor.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['370'][1].init(132, 4, '!win');
function visit1162_370_1(result) {
  _$jscoverage['/editor.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['353'][1].init(164, 5, 'range');
function visit1161_353_1(result) {
  _$jscoverage['/editor.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['309'][1].init(794, 28, 'EMPTY_CONTENT_REG.test(html)');
function visit1160_309_1(result) {
  _$jscoverage['/editor.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['300'][1].init(510, 6, 'format');
function visit1159_300_1(result) {
  _$jscoverage['/editor.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['294'][2].init(227, 20, 'mode == WYSIWYG_MODE');
function visit1158_294_2(result) {
  _$jscoverage['/editor.js'].branchData['294'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['294'][1].init(227, 41, 'mode == WYSIWYG_MODE && self.isDocReady()');
function visit1157_294_1(result) {
  _$jscoverage['/editor.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['291'][1].init(132, 17, 'mode == undefined');
function visit1156_291_1(result) {
  _$jscoverage['/editor.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['272'][1].init(291, 42, 'htmlDataProcessor = self.htmlDataProcessor');
function visit1155_272_1(result) {
  _$jscoverage['/editor.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['267'][1].init(119, 32, 'self.get(\'mode\') != WYSIWYG_MODE');
function visit1154_267_1(result) {
  _$jscoverage['/editor.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['246'][1].init(202, 3, 'cmd');
function visit1153_246_1(result) {
  _$jscoverage['/editor.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['163'][1].init(22, 15, 'control.destroy');
function visit1152_163_1(result) {
  _$jscoverage['/editor.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['146'][1].init(368, 3, 'doc');
function visit1151_146_1(result) {
  _$jscoverage['/editor.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['141'][1].init(43, 61, '(form = textarea[0].form) && (form = $(form))');
function visit1150_141_1(result) {
  _$jscoverage['/editor.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['140'][1].init(168, 105, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1149_140_1(result) {
  _$jscoverage['/editor.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['129'][1].init(79, 20, 'v && self.__docReady');
function visit1148_129_1(result) {
  _$jscoverage['/editor.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['116'][1].init(67, 6, 'iframe');
function visit1147_116_1(result) {
  _$jscoverage['/editor.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['110'][1].init(144, 17, 'v == WYSIWYG_MODE');
function visit1146_110_1(result) {
  _$jscoverage['/editor.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['101'][2].init(62, 40, 'statusBarEl && statusBarEl.outerHeight()');
function visit1145_101_2(result) {
  _$jscoverage['/editor.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['101'][1].init(62, 45, 'statusBarEl && statusBarEl.outerHeight() || 0');
function visit1144_101_1(result) {
  _$jscoverage['/editor.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['100'][2].init(273, 36, 'toolBarEl && toolBarEl.outerHeight()');
function visit1143_100_2(result) {
  _$jscoverage['/editor.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['100'][1].init(273, 41, 'toolBarEl && toolBarEl.outerHeight() || 0');
function visit1142_100_1(result) {
  _$jscoverage['/editor.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['76'][1].init(74, 28, 'sel && sel.removeAllRanges()');
function visit1141_76_1(result) {
  _$jscoverage['/editor.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['70'][1].init(104, 19, 'self.get(\'focused\')');
function visit1140_70_1(result) {
  _$jscoverage['/editor.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['62'][1].init(43, 61, '(form = textarea[0].form) && (form = $(form))');
function visit1139_62_1(result) {
  _$jscoverage['/editor.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['61'][1].init(175, 105, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1138_61_1(result) {
  _$jscoverage['/editor.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].lineData[6]++;
KISSY.add('editor', function(S, Node, iframeContentTpl, Editor, Utils, focusManager, Styles, zIndexManger, clipboard, enterKey, htmlDataProcessor, selectionFix) {
  _$jscoverage['/editor.js'].functionData[0]++;
  _$jscoverage['/editor.js'].lineData[7]++;
  var TRUE = true, undefined = undefined, FALSE = false, NULL = null, logger = S.getLogger('s/editor'), window = S.Env.host, document = window.document, UA = S.UA, IS_IE = UA['ie'], NodeType = Node.NodeType, $ = Node.all, HEIGHT = 'height', tryThese = Utils.tryThese, IFRAME_TPL = '<iframe' + ' class="{prefixCls}editor-iframe"' + ' frameborder="0" ' + ' title="kissy-editor" ' + ' allowTransparency="true" ' + ' {iframeSrc} ' + '>' + '</iframe>', EMPTY_CONTENT_REG = /^(?:<(p)>)?(?:(?:&nbsp;)|\s|<br[^>]*>)*(?:<\/\1>)?$/i;
  _$jscoverage['/editor.js'].lineData[30]++;
  Editor.Mode = {
  SOURCE_MODE: 0, 
  WYSIWYG_MODE: 1};
  _$jscoverage['/editor.js'].lineData[35]++;
  var WYSIWYG_MODE = 1;
  _$jscoverage['/editor.js'].lineData[37]++;
  Editor.addMembers({
  initializer: function() {
  _$jscoverage['/editor.js'].functionData[1]++;
  _$jscoverage['/editor.js'].lineData[39]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[40]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[41]++;
  self.__controls = {};
  _$jscoverage['/editor.js'].lineData[43]++;
  focusManager.register(self);
}, 
  renderUI: function() {
  _$jscoverage['/editor.js'].functionData[2]++;
  _$jscoverage['/editor.js'].lineData[48]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[49]++;
  clipboard.init(self);
  _$jscoverage['/editor.js'].lineData[50]++;
  enterKey.init(self);
  _$jscoverage['/editor.js'].lineData[51]++;
  htmlDataProcessor.init(self);
  _$jscoverage['/editor.js'].lineData[52]++;
  selectionFix.init(self);
}, 
  bindUI: function() {
  _$jscoverage['/editor.js'].functionData[3]++;
  _$jscoverage['/editor.js'].lineData[56]++;
  var self = this, form, prefixCls = self.get('prefixCls'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[61]++;
  if (visit1138_61_1(self.get('attachForm') && visit1139_62_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[64]++;
    form.on('submit', self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[67]++;
  function docReady() {
    _$jscoverage['/editor.js'].functionData[4]++;
    _$jscoverage['/editor.js'].lineData[68]++;
    self.detach('docReady', docReady);
    _$jscoverage['/editor.js'].lineData[70]++;
    if (visit1140_70_1(self.get('focused'))) {
      _$jscoverage['/editor.js'].lineData[71]++;
      self.focus();
    } else {
      _$jscoverage['/editor.js'].lineData[75]++;
      var sel = self.getSelection();
      _$jscoverage['/editor.js'].lineData[76]++;
      visit1141_76_1(sel && sel.removeAllRanges());
    }
  }
  _$jscoverage['/editor.js'].lineData[80]++;
  self.on('docReady', docReady);
  _$jscoverage['/editor.js'].lineData[82]++;
  self.on('blur', function() {
  _$jscoverage['/editor.js'].functionData[5]++;
  _$jscoverage['/editor.js'].lineData[83]++;
  self.$el.removeClass(prefixCls + 'editor-focused');
});
  _$jscoverage['/editor.js'].lineData[86]++;
  self.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[6]++;
  _$jscoverage['/editor.js'].lineData[87]++;
  self.$el.addClass(prefixCls + 'editor-focused');
});
}, 
  _onSetHeight: function(v) {
  _$jscoverage['/editor.js'].functionData[7]++;
  _$jscoverage['/editor.js'].lineData[94]++;
  var self = this, textareaEl = self.get('textarea'), toolBarEl = self.get("toolBarEl"), statusBarEl = self.get("statusBarEl");
  _$jscoverage['/editor.js'].lineData[98]++;
  v = parseInt(v, 10);
  _$jscoverage['/editor.js'].lineData[100]++;
  v -= (visit1142_100_1(visit1143_100_2(toolBarEl && toolBarEl.outerHeight()) || 0)) + (visit1144_101_1(visit1145_101_2(statusBarEl && statusBarEl.outerHeight()) || 0));
  _$jscoverage['/editor.js'].lineData[102]++;
  textareaEl.parent().css(HEIGHT, v);
  _$jscoverage['/editor.js'].lineData[103]++;
  textareaEl.css(HEIGHT, v);
}, 
  _onSetMode: function(v) {
  _$jscoverage['/editor.js'].functionData[8]++;
  _$jscoverage['/editor.js'].lineData[107]++;
  var self = this, iframe = self.get('iframe'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[110]++;
  if (visit1146_110_1(v == WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[111]++;
    self.setData(textarea.val());
    _$jscoverage['/editor.js'].lineData[112]++;
    textarea.hide();
    _$jscoverage['/editor.js'].lineData[113]++;
    self.fire("wysiwygMode");
  } else {
    _$jscoverage['/editor.js'].lineData[116]++;
    if (visit1147_116_1(iframe)) {
      _$jscoverage['/editor.js'].lineData[117]++;
      textarea.val(self.getFormatData(WYSIWYG_MODE));
      _$jscoverage['/editor.js'].lineData[118]++;
      iframe.hide();
    }
    _$jscoverage['/editor.js'].lineData[120]++;
    textarea.show();
    _$jscoverage['/editor.js'].lineData[121]++;
    self.fire("sourceMode");
  }
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/editor.js'].functionData[9]++;
  _$jscoverage['/editor.js'].lineData[127]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[129]++;
  if (visit1148_129_1(v && self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[130]++;
    self.focus();
  }
}, 
  destructor: function() {
  _$jscoverage['/editor.js'].functionData[10]++;
  _$jscoverage['/editor.js'].lineData[135]++;
  var self = this, form, textarea = self.get('textarea'), doc = self.get('document');
  _$jscoverage['/editor.js'].lineData[140]++;
  if (visit1149_140_1(self.get('attachForm') && visit1150_141_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[143]++;
    form.detach("submit", self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[146]++;
  if (visit1151_146_1(doc)) {
    _$jscoverage['/editor.js'].lineData[147]++;
    var body = $(doc[0].body), documentElement = $(doc[0].documentElement), win = self.get('window');
    _$jscoverage['/editor.js'].lineData[151]++;
    focusManager.remove(self);
    _$jscoverage['/editor.js'].lineData[153]++;
    doc.detach();
    _$jscoverage['/editor.js'].lineData[155]++;
    documentElement.detach();
    _$jscoverage['/editor.js'].lineData[157]++;
    body.detach();
    _$jscoverage['/editor.js'].lineData[159]++;
    win.detach();
  }
  _$jscoverage['/editor.js'].lineData[162]++;
  S.each(self.__controls, function(control) {
  _$jscoverage['/editor.js'].functionData[11]++;
  _$jscoverage['/editor.js'].lineData[163]++;
  if (visit1152_163_1(control.destroy)) {
    _$jscoverage['/editor.js'].lineData[164]++;
    control.destroy();
  }
});
  _$jscoverage['/editor.js'].lineData[168]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[169]++;
  self.__controls = {};
}, 
  getControl: function(id) {
  _$jscoverage['/editor.js'].functionData[12]++;
  _$jscoverage['/editor.js'].lineData[177]++;
  return this.__controls[id];
}, 
  getControls: function() {
  _$jscoverage['/editor.js'].functionData[13]++;
  _$jscoverage['/editor.js'].lineData[185]++;
  return this.__controls;
}, 
  addControl: function(id, control) {
  _$jscoverage['/editor.js'].functionData[14]++;
  _$jscoverage['/editor.js'].lineData[194]++;
  this.__controls[id] = control;
}, 
  showDialog: function(name, args) {
  _$jscoverage['/editor.js'].functionData[15]++;
  _$jscoverage['/editor.js'].lineData[204]++;
  name += '/dialog';
  _$jscoverage['/editor.js'].lineData[205]++;
  var self = this, d = self.__controls[name];
  _$jscoverage['/editor.js'].lineData[207]++;
  d.show(args);
  _$jscoverage['/editor.js'].lineData[208]++;
  self.fire('dialogShow', {
  dialog: d.dialog, 
  "pluginDialog": d, 
  "dialogName": name});
}, 
  addCommand: function(name, obj) {
  _$jscoverage['/editor.js'].functionData[16]++;
  _$jscoverage['/editor.js'].lineData[222]++;
  this.__commands[name] = obj;
}, 
  hasCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[17]++;
  _$jscoverage['/editor.js'].lineData[231]++;
  return this.__commands[name];
}, 
  execCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[18]++;
  _$jscoverage['/editor.js'].lineData[241]++;
  var self = this, cmd = self.__commands[name], args = S.makeArray(arguments);
  _$jscoverage['/editor.js'].lineData[244]++;
  args.shift();
  _$jscoverage['/editor.js'].lineData[245]++;
  args.unshift(self);
  _$jscoverage['/editor.js'].lineData[246]++;
  if (visit1153_246_1(cmd)) {
    _$jscoverage['/editor.js'].lineData[247]++;
    return cmd.exec.apply(cmd, args);
  } else {
    _$jscoverage['/editor.js'].lineData[249]++;
    logger.error(name + ': command not found');
    _$jscoverage['/editor.js'].lineData[250]++;
    return undefined;
  }
}, 
  queryCommandValue: function(name) {
  _$jscoverage['/editor.js'].functionData[19]++;
  _$jscoverage['/editor.js'].lineData[260]++;
  return this.execCommand(Utils.getQueryCmd(name));
}, 
  'setData': function(data) {
  _$jscoverage['/editor.js'].functionData[20]++;
  _$jscoverage['/editor.js'].lineData[264]++;
  var self = this, htmlDataProcessor, afterData = data;
  _$jscoverage['/editor.js'].lineData[267]++;
  if (visit1154_267_1(self.get('mode') != WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[269]++;
    self.get('textarea').val(data);
    _$jscoverage['/editor.js'].lineData[270]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[272]++;
  if (visit1155_272_1(htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[273]++;
    afterData = htmlDataProcessor.toDataFormat(data);
  }
  _$jscoverage['/editor.js'].lineData[276]++;
  clearIframeDocContent(self);
  _$jscoverage['/editor.js'].lineData[277]++;
  createIframe(self, afterData);
}, 
  getData: function(format, mode) {
  _$jscoverage['/editor.js'].functionData[21]++;
  _$jscoverage['/editor.js'].lineData[288]++;
  var self = this, htmlDataProcessor = self.htmlDataProcessor, html;
  _$jscoverage['/editor.js'].lineData[291]++;
  if (visit1156_291_1(mode == undefined)) {
    _$jscoverage['/editor.js'].lineData[292]++;
    mode = self.get('mode');
  }
  _$jscoverage['/editor.js'].lineData[294]++;
  if (visit1157_294_1(visit1158_294_2(mode == WYSIWYG_MODE) && self.isDocReady())) {
    _$jscoverage['/editor.js'].lineData[295]++;
    html = self.get('document')[0].body.innerHTML;
  } else {
    _$jscoverage['/editor.js'].lineData[297]++;
    html = htmlDataProcessor.toDataFormat(self.get('textarea').val());
  }
  _$jscoverage['/editor.js'].lineData[300]++;
  if (visit1159_300_1(format)) {
    _$jscoverage['/editor.js'].lineData[301]++;
    html = htmlDataProcessor.toHtml(html);
  } else {
    _$jscoverage['/editor.js'].lineData[303]++;
    html = htmlDataProcessor.toServer(html);
  }
  _$jscoverage['/editor.js'].lineData[305]++;
  html = S.trim(html);
  _$jscoverage['/editor.js'].lineData[309]++;
  if (visit1160_309_1(EMPTY_CONTENT_REG.test(html))) {
    _$jscoverage['/editor.js'].lineData[310]++;
    html = '';
  }
  _$jscoverage['/editor.js'].lineData[312]++;
  return html;
}, 
  getFormatData: function(mode) {
  _$jscoverage['/editor.js'].functionData[22]++;
  _$jscoverage['/editor.js'].lineData[322]++;
  return this.getData(1, mode);
}, 
  getDocHtml: function() {
  _$jscoverage['/editor.js'].functionData[23]++;
  _$jscoverage['/editor.js'].lineData[330]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[331]++;
  return prepareIFrameHTML(0, self.get('customStyle'), self.get('customLink'), self.getFormatData());
}, 
  getSelection: function() {
  _$jscoverage['/editor.js'].functionData[24]++;
  _$jscoverage['/editor.js'].lineData[340]++;
  return Editor.Selection.getSelection(this.get('document')[0]);
}, 
  'getSelectedHtml': function() {
  _$jscoverage['/editor.js'].functionData[25]++;
  _$jscoverage['/editor.js'].lineData[349]++;
  var self = this, range = self.getSelection().getRanges()[0], contents, html = '';
  _$jscoverage['/editor.js'].lineData[353]++;
  if (visit1161_353_1(range)) {
    _$jscoverage['/editor.js'].lineData[354]++;
    contents = range.cloneContents();
    _$jscoverage['/editor.js'].lineData[355]++;
    html = self.get('document')[0].createElement('div');
    _$jscoverage['/editor.js'].lineData[356]++;
    html.appendChild(contents);
    _$jscoverage['/editor.js'].lineData[357]++;
    html = html.innerHTML;
  }
  _$jscoverage['/editor.js'].lineData[359]++;
  return html;
}, 
  focus: function() {
  _$jscoverage['/editor.js'].functionData[26]++;
  _$jscoverage['/editor.js'].lineData[367]++;
  var self = this, win = self.get('window');
  _$jscoverage['/editor.js'].lineData[370]++;
  if (visit1162_370_1(!win)) {
    _$jscoverage['/editor.js'].lineData[371]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[373]++;
  var doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[374]++;
  win = win[0];
  _$jscoverage['/editor.js'].lineData[376]++;
  if (visit1163_376_1(!UA['ie'])) {
    _$jscoverage['/editor.js'].lineData[379]++;
    visit1164_379_1(win && visit1165_379_2(win.parent && win.parent.focus()));
  }
  _$jscoverage['/editor.js'].lineData[383]++;
  visit1166_383_1(win && win.focus());
  _$jscoverage['/editor.js'].lineData[385]++;
  try {
    _$jscoverage['/editor.js'].lineData[386]++;
    doc.body.focus();
  }  catch (e) {
}
  _$jscoverage['/editor.js'].lineData[390]++;
  self.notifySelectionChange();
}, 
  blur: function() {
  _$jscoverage['/editor.js'].functionData[27]++;
  _$jscoverage['/editor.js'].lineData[398]++;
  var self = this, win = self.get('window')[0];
  _$jscoverage['/editor.js'].lineData[400]++;
  win.blur();
  _$jscoverage['/editor.js'].lineData[401]++;
  self.get('document')[0].body.blur();
}, 
  addCustomStyle: function(cssText, id) {
  _$jscoverage['/editor.js'].functionData[28]++;
  _$jscoverage['/editor.js'].lineData[411]++;
  var self = this, win = self.get('window'), customStyle = visit1167_413_1(self.get('customStyle') || '');
  _$jscoverage['/editor.js'].lineData[414]++;
  customStyle += "\n" + cssText;
  _$jscoverage['/editor.js'].lineData[415]++;
  self.set('customStyle', customStyle);
  _$jscoverage['/editor.js'].lineData[416]++;
  if (visit1168_416_1(win)) {
    _$jscoverage['/editor.js'].lineData[417]++;
    win.addStyleSheet(win, cssText, id);
  }
}, 
  removeCustomStyle: function(id) {
  _$jscoverage['/editor.js'].functionData[29]++;
  _$jscoverage['/editor.js'].lineData[427]++;
  this.get('document').on('#' + id).remove();
}, 
  addCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[30]++;
  _$jscoverage['/editor.js'].lineData[436]++;
  var self = this, customLink = self.get('customLink'), doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[439]++;
  customLink.push(link);
  _$jscoverage['/editor.js'].lineData[440]++;
  self.set('customLink', customLink);
  _$jscoverage['/editor.js'].lineData[441]++;
  var elem = doc.createElement('link');
  _$jscoverage['/editor.js'].lineData[442]++;
  elem.rel = 'stylesheet';
  _$jscoverage['/editor.js'].lineData[443]++;
  doc.getElementsByTagName('head')[0].appendChild(elem);
  _$jscoverage['/editor.js'].lineData[444]++;
  elem.href = link;
}, 
  removeCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[31]++;
  _$jscoverage['/editor.js'].lineData[453]++;
  var self = this, doc = self.get('document'), links = doc.all('link');
  _$jscoverage['/editor.js'].lineData[456]++;
  links.each(function(l) {
  _$jscoverage['/editor.js'].functionData[32]++;
  _$jscoverage['/editor.js'].lineData[457]++;
  if (visit1169_457_1(l.attr('href') == link)) {
    _$jscoverage['/editor.js'].lineData[458]++;
    l.remove();
  }
});
  _$jscoverage['/editor.js'].lineData[461]++;
  var cls = self.get('customLink'), ind = S.indexOf(link, cls);
  _$jscoverage['/editor.js'].lineData[463]++;
  if (visit1170_463_1(ind != -1)) {
    _$jscoverage['/editor.js'].lineData[464]++;
    cls.splice(ind, 1);
  }
}, 
  docReady: function(func) {
  _$jscoverage['/editor.js'].functionData[33]++;
  _$jscoverage['/editor.js'].lineData[475]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[476]++;
  self.on('docReady', func);
  _$jscoverage['/editor.js'].lineData[477]++;
  if (visit1171_477_1(self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[478]++;
    func.call(self);
  }
}, 
  isDocReady: function() {
  _$jscoverage['/editor.js'].functionData[34]++;
  _$jscoverage['/editor.js'].lineData[488]++;
  return this.__docReady;
}, 
  checkSelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[35]++;
  _$jscoverage['/editor.js'].lineData[497]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[498]++;
  if (visit1172_498_1(self.__checkSelectionChangeId)) {
    _$jscoverage['/editor.js'].lineData[499]++;
    clearTimeout(self.__checkSelectionChangeId);
  }
  _$jscoverage['/editor.js'].lineData[502]++;
  self.__checkSelectionChangeId = setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[36]++;
  _$jscoverage['/editor.js'].lineData[503]++;
  var selection = self.getSelection();
  _$jscoverage['/editor.js'].lineData[504]++;
  if (visit1173_504_1(selection && !selection.isInvalid)) {
    _$jscoverage['/editor.js'].lineData[505]++;
    var startElement = selection.getStartElement(), currentPath = new Editor.ElementPath(startElement);
    _$jscoverage['/editor.js'].lineData[507]++;
    if (visit1174_507_1(!self.__previousPath || !self.__previousPath.compare(currentPath))) {
      _$jscoverage['/editor.js'].lineData[508]++;
      self.__previousPath = currentPath;
      _$jscoverage['/editor.js'].lineData[509]++;
      self.fire('selectionChange', {
  selection: selection, 
  path: currentPath, 
  element: startElement});
    }
  }
}, 100);
}, 
  notifySelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[37]++;
  _$jscoverage['/editor.js'].lineData[525]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[526]++;
  self.__previousPath = NULL;
  _$jscoverage['/editor.js'].lineData[527]++;
  self.checkSelectionChange();
}, 
  insertElement: function(element) {
  _$jscoverage['/editor.js'].functionData[38]++;
  _$jscoverage['/editor.js'].lineData[536]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[538]++;
  if (visit1175_538_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[539]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[542]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[544]++;
  var clone, elementName = element['nodeName'](), xhtml_dtd = Editor.XHTML_DTD, isBlock = xhtml_dtd['$block'][elementName], KER = Editor.RangeType, selection = self.getSelection(), ranges = visit1176_550_1(selection && selection.getRanges()), range, notWhitespaceEval, i, next, nextName, lastElement;
  _$jscoverage['/editor.js'].lineData[558]++;
  if (visit1177_558_1(!ranges || visit1178_558_2(ranges.length == 0))) {
    _$jscoverage['/editor.js'].lineData[559]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[562]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[564]++;
  for (i = ranges.length - 1; visit1179_564_1(i >= 0); i--) {
    _$jscoverage['/editor.js'].lineData[565]++;
    range = ranges[i];
    _$jscoverage['/editor.js'].lineData[568]++;
    clone = visit1180_568_1(visit1181_568_2(!i && element) || element['clone'](TRUE));
    _$jscoverage['/editor.js'].lineData[569]++;
    range.insertNodeByDtd(clone);
    _$jscoverage['/editor.js'].lineData[572]++;
    if (visit1182_572_1(!lastElement)) {
      _$jscoverage['/editor.js'].lineData[573]++;
      lastElement = clone;
    }
  }
  _$jscoverage['/editor.js'].lineData[577]++;
  if (visit1183_577_1(!lastElement)) {
    _$jscoverage['/editor.js'].lineData[578]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[581]++;
  range.moveToPosition(lastElement, KER.POSITION_AFTER_END);
  _$jscoverage['/editor.js'].lineData[584]++;
  if (visit1184_584_1(isBlock)) {
    _$jscoverage['/editor.js'].lineData[585]++;
    notWhitespaceEval = Editor.Walker.whitespaces(true);
    _$jscoverage['/editor.js'].lineData[586]++;
    next = lastElement.next(notWhitespaceEval, 1);
    _$jscoverage['/editor.js'].lineData[587]++;
    nextName = visit1185_587_1(next && visit1186_587_2(visit1187_587_3(next[0].nodeType == NodeType.ELEMENT_NODE) && next.nodeName()));
    _$jscoverage['/editor.js'].lineData[590]++;
    if (visit1188_590_1(nextName && visit1189_591_1(xhtml_dtd.$block[nextName] && xhtml_dtd[nextName]['#text']))) {
      _$jscoverage['/editor.js'].lineData[593]++;
      range.moveToElementEditablePosition(next);
    }
  }
  _$jscoverage['/editor.js'].lineData[596]++;
  selection.selectRanges([range]);
  _$jscoverage['/editor.js'].lineData[597]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[600]++;
  if (visit1190_600_1(clone && visit1191_600_2(clone[0].nodeType == 1))) {
    _$jscoverage['/editor.js'].lineData[601]++;
    clone.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
  }
  _$jscoverage['/editor.js'].lineData[607]++;
  saveLater.call(self);
  _$jscoverage['/editor.js'].lineData[608]++;
  return clone;
}, 
  insertHtml: function(data, dataFilter) {
  _$jscoverage['/editor.js'].functionData[39]++;
  _$jscoverage['/editor.js'].lineData[618]++;
  var self = this, htmlDataProcessor, editorDoc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[622]++;
  if (visit1192_622_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[623]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[626]++;
  if (visit1193_626_1(htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[627]++;
    data = htmlDataProcessor.toDataFormat(data, dataFilter);
  }
  _$jscoverage['/editor.js'].lineData[630]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[631]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[635]++;
  if (visit1194_635_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[636]++;
    var $sel = editorDoc.selection;
    _$jscoverage['/editor.js'].lineData[637]++;
    if (visit1195_637_1($sel.type == 'Control')) {
      _$jscoverage['/editor.js'].lineData[638]++;
      $sel.clear();
    }
    _$jscoverage['/editor.js'].lineData[640]++;
    try {
      _$jscoverage['/editor.js'].lineData[641]++;
      $sel.createRange().pasteHTML(data);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[643]++;
  logger.error('insertHtml error in ie');
}
  } else {
    _$jscoverage['/editor.js'].lineData[650]++;
    try {
      _$jscoverage['/editor.js'].lineData[651]++;
      editorDoc.execCommand('inserthtml', FALSE, data);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[653]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[40]++;
  _$jscoverage['/editor.js'].lineData[656]++;
  if (visit1196_656_1(self.getSelection().getRanges().length == 0)) {
    _$jscoverage['/editor.js'].lineData[657]++;
    var r = new Editor.Range(editorDoc), node = $(editorDoc.body).first(function(el) {
  _$jscoverage['/editor.js'].functionData[41]++;
  _$jscoverage['/editor.js'].lineData[659]++;
  return visit1197_659_1(visit1198_659_2(el.nodeType == 1) && visit1199_659_3(el.nodeName.toLowerCase() != 'br'));
});
    _$jscoverage['/editor.js'].lineData[661]++;
    if (visit1200_661_1(!node)) {
      _$jscoverage['/editor.js'].lineData[662]++;
      node = $(editorDoc.createElement('p'));
      _$jscoverage['/editor.js'].lineData[663]++;
      node._4e_appendBogus().appendTo(editorDoc.body);
    }
    _$jscoverage['/editor.js'].lineData[665]++;
    r.setStartAt(node, Editor.RangeType.POSITION_AFTER_START);
    _$jscoverage['/editor.js'].lineData[666]++;
    r.select();
  }
  _$jscoverage['/editor.js'].lineData[668]++;
  editorDoc.execCommand('inserthtml', FALSE, data);
}, 50);
}
  }
  _$jscoverage['/editor.js'].lineData[674]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[42]++;
  _$jscoverage['/editor.js'].lineData[675]++;
  self.getSelection().scrollIntoView();
}, 50);
  _$jscoverage['/editor.js'].lineData[677]++;
  saveLater.call(self);
}});
  _$jscoverage['/editor.js'].lineData[689]++;
  Editor.decorate = function(textarea, cfg) {
  _$jscoverage['/editor.js'].functionData[43]++;
  _$jscoverage['/editor.js'].lineData[690]++;
  cfg = visit1201_690_1(cfg || {});
  _$jscoverage['/editor.js'].lineData[691]++;
  textarea = $(textarea);
  _$jscoverage['/editor.js'].lineData[692]++;
  var textareaAttrs = cfg.textareaAttrs = visit1202_692_1(cfg.textareaAttrs || {});
  _$jscoverage['/editor.js'].lineData[693]++;
  var width = textarea.style('width');
  _$jscoverage['/editor.js'].lineData[694]++;
  var height = textarea.style('height');
  _$jscoverage['/editor.js'].lineData[695]++;
  var name = textarea.attr('name');
  _$jscoverage['/editor.js'].lineData[696]++;
  if (visit1203_696_1(width)) {
    _$jscoverage['/editor.js'].lineData[697]++;
    cfg.width = visit1204_697_1(cfg.width || width);
  }
  _$jscoverage['/editor.js'].lineData[699]++;
  if (visit1205_699_1(height)) {
    _$jscoverage['/editor.js'].lineData[700]++;
    cfg.height = visit1206_700_1(cfg.height || height);
  }
  _$jscoverage['/editor.js'].lineData[702]++;
  if (visit1207_702_1(name)) {
    _$jscoverage['/editor.js'].lineData[703]++;
    textareaAttrs.name = name;
  }
  _$jscoverage['/editor.js'].lineData[705]++;
  cfg.data = visit1208_705_1(cfg.data || textarea.val());
  _$jscoverage['/editor.js'].lineData[706]++;
  cfg.elBefore = textarea;
  _$jscoverage['/editor.js'].lineData[707]++;
  var editor = new Editor(cfg).render();
  _$jscoverage['/editor.js'].lineData[708]++;
  textarea.remove();
  _$jscoverage['/editor.js'].lineData[709]++;
  return editor;
};
  _$jscoverage['/editor.js'].lineData[716]++;
  Editor["_initIframe"] = function(id) {
  _$jscoverage['/editor.js'].functionData[44]++;
  _$jscoverage['/editor.js'].lineData[717]++;
  var self = focusManager.getInstance(id), $doc = self.get('document'), doc = $doc[0], script = $doc.one('#ke_active_script');
  _$jscoverage['/editor.js'].lineData[723]++;
  script.remove();
  _$jscoverage['/editor.js'].lineData[725]++;
  fixByBindIframeDoc(self);
  _$jscoverage['/editor.js'].lineData[727]++;
  var body = doc.body;
  _$jscoverage['/editor.js'].lineData[729]++;
  var $body = $(body);
  _$jscoverage['/editor.js'].lineData[751]++;
  if (visit1209_751_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[753]++;
    body['hideFocus'] = TRUE;
    _$jscoverage['/editor.js'].lineData[756]++;
    body.disabled = TRUE;
    _$jscoverage['/editor.js'].lineData[757]++;
    body['contentEditable'] = TRUE;
    _$jscoverage['/editor.js'].lineData[758]++;
    body.removeAttribute('disabled');
  } else {
    _$jscoverage['/editor.js'].lineData[762]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[45]++;
  _$jscoverage['/editor.js'].lineData[764]++;
  if (visit1210_764_1(UA['gecko'] || UA['opera'])) {
    _$jscoverage['/editor.js'].lineData[765]++;
    body['contentEditable'] = TRUE;
  } else {
    _$jscoverage['/editor.js'].lineData[767]++;
    if (visit1211_767_1(UA['webkit'])) {
      _$jscoverage['/editor.js'].lineData[768]++;
      body.parentNode['contentEditable'] = TRUE;
    } else {
      _$jscoverage['/editor.js'].lineData[770]++;
      doc['designMode'] = 'on';
    }
  }
}, 0);
  }
  _$jscoverage['/editor.js'].lineData[777]++;
  if (visit1212_786_1(UA['gecko'] || UA['opera'])) {
    _$jscoverage['/editor.js'].lineData[788]++;
    var htmlElement = doc.documentElement;
    _$jscoverage['/editor.js'].lineData[789]++;
    $(htmlElement).on('mousedown', function(evt) {
  _$jscoverage['/editor.js'].functionData[46]++;
  _$jscoverage['/editor.js'].lineData[796]++;
  var t = evt.target;
  _$jscoverage['/editor.js'].lineData[797]++;
  if (visit1213_797_1(t == htmlElement)) {
    _$jscoverage['/editor.js'].lineData[798]++;
    if (visit1214_798_1(UA['gecko'])) {
      _$jscoverage['/editor.js'].lineData[799]++;
      blinkCursor(doc, FALSE);
    }
    _$jscoverage['/editor.js'].lineData[806]++;
    self.activateGecko();
  }
});
  }
  _$jscoverage['/editor.js'].lineData[812]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[47]++;
  _$jscoverage['/editor.js'].lineData[821]++;
  if (visit1215_821_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[822]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[48]++;
  _$jscoverage['/editor.js'].lineData[823]++;
  if (visit1216_823_1(doc)) {
    _$jscoverage['/editor.js'].lineData[824]++;
    body.runtimeStyle['marginBottom'] = '0px';
    _$jscoverage['/editor.js'].lineData[825]++;
    body.runtimeStyle['marginBottom'] = '';
  }
}, 1000);
  }
}, 0);
  _$jscoverage['/editor.js'].lineData[832]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[49]++;
  _$jscoverage['/editor.js'].lineData[833]++;
  self.__docReady = 1;
  _$jscoverage['/editor.js'].lineData[834]++;
  self.fire('docReady');
  _$jscoverage['/editor.js'].lineData[838]++;
  var disableObjectResizing = self.get('disableObjectResizing'), disableInlineTableEditing = self.get('disableInlineTableEditing');
  _$jscoverage['/editor.js'].lineData[840]++;
  if (visit1217_840_1(disableObjectResizing || disableInlineTableEditing)) {
    _$jscoverage['/editor.js'].lineData[842]++;
    try {
      _$jscoverage['/editor.js'].lineData[843]++;
      doc.execCommand('enableObjectResizing', FALSE, !disableObjectResizing);
      _$jscoverage['/editor.js'].lineData[844]++;
      doc.execCommand('enableInlineTableEditing', FALSE, !disableInlineTableEditing);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[850]++;
  $body.on(IS_IE ? 'resizestart' : 'resize', function(evt) {
  _$jscoverage['/editor.js'].functionData[50]++;
  _$jscoverage['/editor.js'].lineData[851]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor.js'].lineData[852]++;
  if (visit1218_852_1(disableObjectResizing || (visit1219_853_1(visit1220_853_2(t.nodeName() === 'table') && disableInlineTableEditing)))) {
    _$jscoverage['/editor.js'].lineData[855]++;
    evt.preventDefault();
  }
});
}
  }
}, 10);
};
  _$jscoverage['/editor.js'].lineData[865]++;
  function blinkCursor(doc, retry) {
    _$jscoverage['/editor.js'].functionData[51]++;
    _$jscoverage['/editor.js'].lineData[866]++;
    var body = doc.body;
    _$jscoverage['/editor.js'].lineData[867]++;
    tryThese(function() {
  _$jscoverage['/editor.js'].functionData[52]++;
  _$jscoverage['/editor.js'].lineData[869]++;
  doc['designMode'] = 'on';
  _$jscoverage['/editor.js'].lineData[871]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[53]++;
  _$jscoverage['/editor.js'].lineData[872]++;
  doc['designMode'] = 'off';
  _$jscoverage['/editor.js'].lineData[873]++;
  body.focus();
  _$jscoverage['/editor.js'].lineData[875]++;
  if (visit1221_875_1(!arguments.callee.retry)) {
    _$jscoverage['/editor.js'].lineData[876]++;
    arguments.callee.retry = TRUE;
  }
}, 50);
}, function() {
  _$jscoverage['/editor.js'].functionData[54]++;
  _$jscoverage['/editor.js'].lineData[882]++;
  doc['designMode'] = 'off';
  _$jscoverage['/editor.js'].lineData[883]++;
  body.setAttribute('contentEditable', false);
  _$jscoverage['/editor.js'].lineData[884]++;
  body.setAttribute('contentEditable', true);
  _$jscoverage['/editor.js'].lineData[886]++;
  visit1222_886_1(!retry && blinkCursor(doc, 1));
});
  }
  _$jscoverage['/editor.js'].lineData[891]++;
  function fixByBindIframeDoc(self) {
    _$jscoverage['/editor.js'].functionData[55]++;
    _$jscoverage['/editor.js'].lineData[892]++;
    var iframe = self.get('iframe'), textarea = self.get('textarea')[0], $win = self.get('window'), $doc = self.get('document'), doc = $doc[0];
    _$jscoverage['/editor.js'].lineData[902]++;
    if (visit1223_902_1(UA['webkit'])) {
      _$jscoverage['/editor.js'].lineData[903]++;
      $doc.on('click', function(ev) {
  _$jscoverage['/editor.js'].functionData[56]++;
  _$jscoverage['/editor.js'].lineData[904]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[905]++;
  if (visit1224_905_1(S.inArray(control.nodeName(), ['input', 'select']))) {
    _$jscoverage['/editor.js'].lineData[906]++;
    ev.preventDefault();
  }
});
      _$jscoverage['/editor.js'].lineData[910]++;
      $doc.on('mouseup', function(ev) {
  _$jscoverage['/editor.js'].functionData[57]++;
  _$jscoverage['/editor.js'].lineData[911]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[912]++;
  if (visit1225_912_1(S.inArray(control.nodeName(), ['input', 'textarea']))) {
    _$jscoverage['/editor.js'].lineData[913]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[919]++;
    if (visit1226_919_1(UA['gecko'] || visit1227_919_2(IS_IE || UA['opera']))) {
      _$jscoverage['/editor.js'].lineData[920]++;
      var focusGrabber;
      _$jscoverage['/editor.js'].lineData[921]++;
      focusGrabber = new Node('<span ' + 'tabindex="-1" ' + 'style="position:absolute; left:-10000"' + ' role="presentation"' + '></span>').insertAfter(textarea);
      _$jscoverage['/editor.js'].lineData[928]++;
      focusGrabber.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[58]++;
  _$jscoverage['/editor.js'].lineData[929]++;
  self.focus();
});
      _$jscoverage['/editor.js'].lineData[931]++;
      self.activateGecko = function() {
  _$jscoverage['/editor.js'].functionData[59]++;
  _$jscoverage['/editor.js'].lineData[932]++;
  if (visit1228_932_1(UA['gecko'] && self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[933]++;
    focusGrabber[0].focus();
  }
};
      _$jscoverage['/editor.js'].lineData[935]++;
      self.on('destroy', function() {
  _$jscoverage['/editor.js'].functionData[60]++;
  _$jscoverage['/editor.js'].lineData[936]++;
  focusGrabber.detach();
  _$jscoverage['/editor.js'].lineData[937]++;
  focusGrabber.remove();
});
    }
    _$jscoverage['/editor.js'].lineData[941]++;
    $win.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[61]++;
  _$jscoverage['/editor.js'].lineData[947]++;
  if (visit1229_947_1(UA['gecko'])) {
    _$jscoverage['/editor.js'].lineData[948]++;
    blinkCursor(doc, FALSE);
  } else {
    _$jscoverage['/editor.js'].lineData[950]++;
    if (visit1230_950_1(UA['opera'])) {
      _$jscoverage['/editor.js'].lineData[951]++;
      doc.body.focus();
    }
  }
  _$jscoverage['/editor.js'].lineData[954]++;
  self.notifySelectionChange();
});
    _$jscoverage['/editor.js'].lineData[957]++;
    if (visit1231_957_1(UA['gecko'])) {
      _$jscoverage['/editor.js'].lineData[961]++;
      $doc.on('mousedown', function() {
  _$jscoverage['/editor.js'].functionData[62]++;
  _$jscoverage['/editor.js'].lineData[962]++;
  if (visit1232_962_1(!self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[963]++;
    blinkCursor(doc, FALSE);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[968]++;
    if (visit1233_968_1(IS_IE)) {
      _$jscoverage['/editor.js'].lineData[974]++;
      $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[63]++;
  _$jscoverage['/editor.js'].lineData[975]++;
  var keyCode = evt.keyCode;
  _$jscoverage['/editor.js'].lineData[977]++;
  if (visit1234_977_1(keyCode in {
  8: 1, 
  46: 1})) {
    _$jscoverage['/editor.js'].lineData[978]++;
    var sel = self.getSelection(), control = sel.getSelectedElement();
    _$jscoverage['/editor.js'].lineData[980]++;
    if (visit1235_980_1(control)) {
      _$jscoverage['/editor.js'].lineData[982]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[985]++;
      var bookmark = sel.getRanges()[0].createBookmark();
      _$jscoverage['/editor.js'].lineData[987]++;
      control.remove();
      _$jscoverage['/editor.js'].lineData[988]++;
      sel.selectBookmarks([bookmark]);
      _$jscoverage['/editor.js'].lineData[989]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[990]++;
      evt.preventDefault();
    }
  }
});
      _$jscoverage['/editor.js'].lineData[998]++;
      if (visit1236_998_1(doc.compatMode == 'CSS1Compat')) {
        _$jscoverage['/editor.js'].lineData[999]++;
        var pageUpDownKeys = {
  33: 1, 
  34: 1};
        _$jscoverage['/editor.js'].lineData[1000]++;
        $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[64]++;
  _$jscoverage['/editor.js'].lineData[1001]++;
  if (visit1237_1001_1(evt.keyCode in pageUpDownKeys)) {
    _$jscoverage['/editor.js'].lineData[1002]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[65]++;
  _$jscoverage['/editor.js'].lineData[1003]++;
  self.getSelection().scrollIntoView();
}, 0);
  }
});
      }
    }
    _$jscoverage['/editor.js'].lineData[1011]++;
    if (visit1238_1011_1(UA['webkit'])) {
      _$jscoverage['/editor.js'].lineData[1012]++;
      $doc.on('mousedown', function(ev) {
  _$jscoverage['/editor.js'].functionData[66]++;
  _$jscoverage['/editor.js'].lineData[1013]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1014]++;
  if (visit1239_1014_1(S.inArray(control.nodeName(), ['img', 'hr', 'input', 'textarea', 'select']))) {
    _$jscoverage['/editor.js'].lineData[1015]++;
    self.getSelection().selectElement(control);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1021]++;
    if (visit1240_1021_1(UA['gecko'])) {
      _$jscoverage['/editor.js'].lineData[1022]++;
      $doc.on('dragstart', function(ev) {
  _$jscoverage['/editor.js'].functionData[67]++;
  _$jscoverage['/editor.js'].lineData[1023]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1024]++;
  if (visit1241_1024_1(visit1242_1024_2(control.nodeName() === 'img') && /ke_/.test(control[0].className))) {
    _$jscoverage['/editor.js'].lineData[1026]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1032]++;
    focusManager.add(self);
  }
  _$jscoverage['/editor.js'].lineData[1036]++;
  function prepareIFrameHTML(id, customStyle, customLink, data) {
    _$jscoverage['/editor.js'].functionData[68]++;
    _$jscoverage['/editor.js'].lineData[1037]++;
    var links = '', i, innerCssFile = Utils.debugUrl('theme/editor-iframe.css');
    _$jscoverage['/editor.js'].lineData[1040]++;
    customLink = customLink.concat([]);
    _$jscoverage['/editor.js'].lineData[1041]++;
    customLink.unshift(innerCssFile);
    _$jscoverage['/editor.js'].lineData[1042]++;
    for (i = 0; visit1243_1042_1(i < customLink.length); i++) {
      _$jscoverage['/editor.js'].lineData[1043]++;
      links += S.substitute('<link href="' + '{href}" rel="stylesheet" />', {
  href: customLink[i]});
    }
    _$jscoverage['/editor.js'].lineData[1047]++;
    return S.substitute(iframeContentTpl, {
  doctype: visit1244_1051_1(document.documentMode === 8) ? '<meta http-equiv="X-UA-Compatible" content="IE=7" />' : '', 
  title: '{title}', 
  links: links, 
  style: '<style>' + customStyle + '</style>', 
  data: visit1245_1058_1(data || ''), 
  script: id ? ('<script id="ke_active_script">' + ($(window).isCustomDomain() ? ('document.domain="' + document.domain + '";') : '') + 'parent.KISSY.require("editor")._initIframe("' + id + '");' + '</script>') : ''});
  }
  _$jscoverage['/editor.js'].lineData[1073]++;
  var saveLater = S.buffer(function() {
  _$jscoverage['/editor.js'].functionData[69]++;
  _$jscoverage['/editor.js'].lineData[1074]++;
  this.execCommand('save');
}, 50);
  _$jscoverage['/editor.js'].lineData[1077]++;
  function setUpIFrame(self, data) {
    _$jscoverage['/editor.js'].functionData[70]++;
    _$jscoverage['/editor.js'].lineData[1078]++;
    var iframe = self.get('iframe'), html = prepareIFrameHTML(self.get('id'), self.get('customStyle'), self.get('customLink'), data), iframeDom = iframe[0], win = iframeDom.contentWindow, doc;
    _$jscoverage['/editor.js'].lineData[1085]++;
    iframe.__loaded = 1;
    _$jscoverage['/editor.js'].lineData[1086]++;
    try {
      _$jscoverage['/editor.js'].lineData[1094]++;
      doc = win.document;
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[1099]++;
  iframeDom.src = iframeDom.src;
  _$jscoverage['/editor.js'].lineData[1102]++;
  if (visit1246_1102_1(IS_IE < 7)) {
    _$jscoverage['/editor.js'].lineData[1103]++;
    setTimeout(run, 10);
    _$jscoverage['/editor.js'].lineData[1104]++;
    return;
  }
}
    _$jscoverage['/editor.js'].lineData[1107]++;
    run();
    _$jscoverage['/editor.js'].lineData[1108]++;
    function run() {
      _$jscoverage['/editor.js'].functionData[71]++;
      _$jscoverage['/editor.js'].lineData[1109]++;
      doc = win.document;
      _$jscoverage['/editor.js'].lineData[1110]++;
      self.setInternal('document', new Node(doc));
      _$jscoverage['/editor.js'].lineData[1111]++;
      self.setInternal('window', new Node(win));
      _$jscoverage['/editor.js'].lineData[1112]++;
      iframe.detach();
      _$jscoverage['/editor.js'].lineData[1114]++;
      doc['open']('text/html', 'replace');
      _$jscoverage['/editor.js'].lineData[1115]++;
      doc.write(html);
      _$jscoverage['/editor.js'].lineData[1116]++;
      doc.close();
    }
  }
  _$jscoverage['/editor.js'].lineData[1120]++;
  function createIframe(self, afterData) {
    _$jscoverage['/editor.js'].functionData[72]++;
    _$jscoverage['/editor.js'].lineData[1124]++;
    var iframeSrc = visit1247_1124_1($(window).getEmptyIframeSrc() || '');
    _$jscoverage['/editor.js'].lineData[1125]++;
    if (visit1248_1125_1(iframeSrc)) {
      _$jscoverage['/editor.js'].lineData[1126]++;
      iframeSrc = ' src="' + iframeSrc + '" ';
    }
    _$jscoverage['/editor.js'].lineData[1128]++;
    var iframe = new Node(S.substitute(IFRAME_TPL, {
  iframeSrc: iframeSrc, 
  prefixCls: self.get('prefixCls')})), textarea = self.get('textarea');
    _$jscoverage['/editor.js'].lineData[1133]++;
    if (visit1249_1133_1(textarea.hasAttr('tabindex'))) {
      _$jscoverage['/editor.js'].lineData[1134]++;
      iframe.attr('tabindex', UA['webkit'] ? -1 : textarea.attr('tabindex'));
    }
    _$jscoverage['/editor.js'].lineData[1136]++;
    textarea.parent().prepend(iframe);
    _$jscoverage['/editor.js'].lineData[1137]++;
    self.set('iframe', iframe);
    _$jscoverage['/editor.js'].lineData[1138]++;
    self.__docReady = 0;
    _$jscoverage['/editor.js'].lineData[1140]++;
    if (visit1250_1140_1(UA['gecko'] && !iframe.__loaded)) {
      _$jscoverage['/editor.js'].lineData[1141]++;
      iframe.on('load', function() {
  _$jscoverage['/editor.js'].functionData[73]++;
  _$jscoverage['/editor.js'].lineData[1142]++;
  setUpIFrame(self, afterData);
}, self);
    } else {
      _$jscoverage['/editor.js'].lineData[1146]++;
      setUpIFrame(self, afterData);
    }
  }
  _$jscoverage['/editor.js'].lineData[1150]++;
  function clearIframeDocContent(self) {
    _$jscoverage['/editor.js'].functionData[74]++;
    _$jscoverage['/editor.js'].lineData[1151]++;
    if (visit1251_1151_1(!self.get('iframe'))) {
      _$jscoverage['/editor.js'].lineData[1152]++;
      return;
    }
    _$jscoverage['/editor.js'].lineData[1154]++;
    var iframe = self.get('iframe'), win = self.get('window'), doc = self.get('document'), domDoc = doc[0], documentElement = $(domDoc.documentElement), body = $(domDoc.body);
    _$jscoverage['/editor.js'].lineData[1160]++;
    S.each([doc, documentElement, body, win], function(el) {
  _$jscoverage['/editor.js'].functionData[75]++;
  _$jscoverage['/editor.js'].lineData[1161]++;
  el.detach();
});
    _$jscoverage['/editor.js'].lineData[1163]++;
    iframe.remove();
  }
  _$jscoverage['/editor.js'].lineData[1168]++;
  return Editor;
}, {
  requires: ['node', 'editor/iframe-content-tpl', 'editor/base', 'editor/utils', 'editor/focusManager', 'editor/styles', 'editor/zIndexManager', 'editor/clipboard', 'editor/enterKey', 'editor/htmlDataProcessor', 'editor/selectionFix', 'editor/plugin-meta']});
