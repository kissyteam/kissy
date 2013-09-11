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
  _$jscoverage['/editor.js'].lineData[138] = 0;
  _$jscoverage['/editor.js'].lineData[140] = 0;
  _$jscoverage['/editor.js'].lineData[141] = 0;
  _$jscoverage['/editor.js'].lineData[143] = 0;
  _$jscoverage['/editor.js'].lineData[144] = 0;
  _$jscoverage['/editor.js'].lineData[147] = 0;
  _$jscoverage['/editor.js'].lineData[148] = 0;
  _$jscoverage['/editor.js'].lineData[152] = 0;
  _$jscoverage['/editor.js'].lineData[157] = 0;
  _$jscoverage['/editor.js'].lineData[160] = 0;
  _$jscoverage['/editor.js'].lineData[163] = 0;
  _$jscoverage['/editor.js'].lineData[164] = 0;
  _$jscoverage['/editor.js'].lineData[168] = 0;
  _$jscoverage['/editor.js'].lineData[170] = 0;
  _$jscoverage['/editor.js'].lineData[172] = 0;
  _$jscoverage['/editor.js'].lineData[174] = 0;
  _$jscoverage['/editor.js'].lineData[176] = 0;
  _$jscoverage['/editor.js'].lineData[179] = 0;
  _$jscoverage['/editor.js'].lineData[180] = 0;
  _$jscoverage['/editor.js'].lineData[181] = 0;
  _$jscoverage['/editor.js'].lineData[185] = 0;
  _$jscoverage['/editor.js'].lineData[186] = 0;
  _$jscoverage['/editor.js'].lineData[194] = 0;
  _$jscoverage['/editor.js'].lineData[202] = 0;
  _$jscoverage['/editor.js'].lineData[211] = 0;
  _$jscoverage['/editor.js'].lineData[221] = 0;
  _$jscoverage['/editor.js'].lineData[222] = 0;
  _$jscoverage['/editor.js'].lineData[224] = 0;
  _$jscoverage['/editor.js'].lineData[225] = 0;
  _$jscoverage['/editor.js'].lineData[239] = 0;
  _$jscoverage['/editor.js'].lineData[248] = 0;
  _$jscoverage['/editor.js'].lineData[258] = 0;
  _$jscoverage['/editor.js'].lineData[261] = 0;
  _$jscoverage['/editor.js'].lineData[262] = 0;
  _$jscoverage['/editor.js'].lineData[263] = 0;
  _$jscoverage['/editor.js'].lineData[264] = 0;
  _$jscoverage['/editor.js'].lineData[266] = 0;
  _$jscoverage['/editor.js'].lineData[267] = 0;
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
  _$jscoverage['/editor.js'].lineData[718] = 0;
  _$jscoverage['/editor.js'].lineData[724] = 0;
  _$jscoverage['/editor.js'].lineData[726] = 0;
  _$jscoverage['/editor.js'].lineData[728] = 0;
  _$jscoverage['/editor.js'].lineData[730] = 0;
  _$jscoverage['/editor.js'].lineData[752] = 0;
  _$jscoverage['/editor.js'].lineData[754] = 0;
  _$jscoverage['/editor.js'].lineData[757] = 0;
  _$jscoverage['/editor.js'].lineData[758] = 0;
  _$jscoverage['/editor.js'].lineData[759] = 0;
  _$jscoverage['/editor.js'].lineData[763] = 0;
  _$jscoverage['/editor.js'].lineData[765] = 0;
  _$jscoverage['/editor.js'].lineData[766] = 0;
  _$jscoverage['/editor.js'].lineData[768] = 0;
  _$jscoverage['/editor.js'].lineData[769] = 0;
  _$jscoverage['/editor.js'].lineData[771] = 0;
  _$jscoverage['/editor.js'].lineData[778] = 0;
  _$jscoverage['/editor.js'].lineData[789] = 0;
  _$jscoverage['/editor.js'].lineData[790] = 0;
  _$jscoverage['/editor.js'].lineData[797] = 0;
  _$jscoverage['/editor.js'].lineData[798] = 0;
  _$jscoverage['/editor.js'].lineData[799] = 0;
  _$jscoverage['/editor.js'].lineData[800] = 0;
  _$jscoverage['/editor.js'].lineData[807] = 0;
  _$jscoverage['/editor.js'].lineData[813] = 0;
  _$jscoverage['/editor.js'].lineData[822] = 0;
  _$jscoverage['/editor.js'].lineData[823] = 0;
  _$jscoverage['/editor.js'].lineData[824] = 0;
  _$jscoverage['/editor.js'].lineData[825] = 0;
  _$jscoverage['/editor.js'].lineData[826] = 0;
  _$jscoverage['/editor.js'].lineData[833] = 0;
  _$jscoverage['/editor.js'].lineData[834] = 0;
  _$jscoverage['/editor.js'].lineData[835] = 0;
  _$jscoverage['/editor.js'].lineData[839] = 0;
  _$jscoverage['/editor.js'].lineData[841] = 0;
  _$jscoverage['/editor.js'].lineData[843] = 0;
  _$jscoverage['/editor.js'].lineData[844] = 0;
  _$jscoverage['/editor.js'].lineData[845] = 0;
  _$jscoverage['/editor.js'].lineData[851] = 0;
  _$jscoverage['/editor.js'].lineData[852] = 0;
  _$jscoverage['/editor.js'].lineData[853] = 0;
  _$jscoverage['/editor.js'].lineData[856] = 0;
  _$jscoverage['/editor.js'].lineData[866] = 0;
  _$jscoverage['/editor.js'].lineData[867] = 0;
  _$jscoverage['/editor.js'].lineData[868] = 0;
  _$jscoverage['/editor.js'].lineData[870] = 0;
  _$jscoverage['/editor.js'].lineData[872] = 0;
  _$jscoverage['/editor.js'].lineData[873] = 0;
  _$jscoverage['/editor.js'].lineData[874] = 0;
  _$jscoverage['/editor.js'].lineData[876] = 0;
  _$jscoverage['/editor.js'].lineData[877] = 0;
  _$jscoverage['/editor.js'].lineData[883] = 0;
  _$jscoverage['/editor.js'].lineData[884] = 0;
  _$jscoverage['/editor.js'].lineData[885] = 0;
  _$jscoverage['/editor.js'].lineData[887] = 0;
  _$jscoverage['/editor.js'].lineData[892] = 0;
  _$jscoverage['/editor.js'].lineData[893] = 0;
  _$jscoverage['/editor.js'].lineData[903] = 0;
  _$jscoverage['/editor.js'].lineData[904] = 0;
  _$jscoverage['/editor.js'].lineData[905] = 0;
  _$jscoverage['/editor.js'].lineData[906] = 0;
  _$jscoverage['/editor.js'].lineData[907] = 0;
  _$jscoverage['/editor.js'].lineData[911] = 0;
  _$jscoverage['/editor.js'].lineData[912] = 0;
  _$jscoverage['/editor.js'].lineData[913] = 0;
  _$jscoverage['/editor.js'].lineData[914] = 0;
  _$jscoverage['/editor.js'].lineData[920] = 0;
  _$jscoverage['/editor.js'].lineData[921] = 0;
  _$jscoverage['/editor.js'].lineData[922] = 0;
  _$jscoverage['/editor.js'].lineData[929] = 0;
  _$jscoverage['/editor.js'].lineData[930] = 0;
  _$jscoverage['/editor.js'].lineData[932] = 0;
  _$jscoverage['/editor.js'].lineData[933] = 0;
  _$jscoverage['/editor.js'].lineData[934] = 0;
  _$jscoverage['/editor.js'].lineData[936] = 0;
  _$jscoverage['/editor.js'].lineData[937] = 0;
  _$jscoverage['/editor.js'].lineData[938] = 0;
  _$jscoverage['/editor.js'].lineData[942] = 0;
  _$jscoverage['/editor.js'].lineData[948] = 0;
  _$jscoverage['/editor.js'].lineData[949] = 0;
  _$jscoverage['/editor.js'].lineData[951] = 0;
  _$jscoverage['/editor.js'].lineData[952] = 0;
  _$jscoverage['/editor.js'].lineData[955] = 0;
  _$jscoverage['/editor.js'].lineData[958] = 0;
  _$jscoverage['/editor.js'].lineData[962] = 0;
  _$jscoverage['/editor.js'].lineData[963] = 0;
  _$jscoverage['/editor.js'].lineData[964] = 0;
  _$jscoverage['/editor.js'].lineData[969] = 0;
  _$jscoverage['/editor.js'].lineData[975] = 0;
  _$jscoverage['/editor.js'].lineData[976] = 0;
  _$jscoverage['/editor.js'].lineData[978] = 0;
  _$jscoverage['/editor.js'].lineData[979] = 0;
  _$jscoverage['/editor.js'].lineData[981] = 0;
  _$jscoverage['/editor.js'].lineData[983] = 0;
  _$jscoverage['/editor.js'].lineData[986] = 0;
  _$jscoverage['/editor.js'].lineData[988] = 0;
  _$jscoverage['/editor.js'].lineData[989] = 0;
  _$jscoverage['/editor.js'].lineData[990] = 0;
  _$jscoverage['/editor.js'].lineData[991] = 0;
  _$jscoverage['/editor.js'].lineData[999] = 0;
  _$jscoverage['/editor.js'].lineData[1000] = 0;
  _$jscoverage['/editor.js'].lineData[1001] = 0;
  _$jscoverage['/editor.js'].lineData[1002] = 0;
  _$jscoverage['/editor.js'].lineData[1003] = 0;
  _$jscoverage['/editor.js'].lineData[1004] = 0;
  _$jscoverage['/editor.js'].lineData[1012] = 0;
  _$jscoverage['/editor.js'].lineData[1013] = 0;
  _$jscoverage['/editor.js'].lineData[1014] = 0;
  _$jscoverage['/editor.js'].lineData[1015] = 0;
  _$jscoverage['/editor.js'].lineData[1016] = 0;
  _$jscoverage['/editor.js'].lineData[1022] = 0;
  _$jscoverage['/editor.js'].lineData[1023] = 0;
  _$jscoverage['/editor.js'].lineData[1024] = 0;
  _$jscoverage['/editor.js'].lineData[1025] = 0;
  _$jscoverage['/editor.js'].lineData[1027] = 0;
  _$jscoverage['/editor.js'].lineData[1033] = 0;
  _$jscoverage['/editor.js'].lineData[1037] = 0;
  _$jscoverage['/editor.js'].lineData[1038] = 0;
  _$jscoverage['/editor.js'].lineData[1041] = 0;
  _$jscoverage['/editor.js'].lineData[1042] = 0;
  _$jscoverage['/editor.js'].lineData[1043] = 0;
  _$jscoverage['/editor.js'].lineData[1044] = 0;
  _$jscoverage['/editor.js'].lineData[1048] = 0;
  _$jscoverage['/editor.js'].lineData[1074] = 0;
  _$jscoverage['/editor.js'].lineData[1075] = 0;
  _$jscoverage['/editor.js'].lineData[1078] = 0;
  _$jscoverage['/editor.js'].lineData[1079] = 0;
  _$jscoverage['/editor.js'].lineData[1086] = 0;
  _$jscoverage['/editor.js'].lineData[1087] = 0;
  _$jscoverage['/editor.js'].lineData[1095] = 0;
  _$jscoverage['/editor.js'].lineData[1100] = 0;
  _$jscoverage['/editor.js'].lineData[1103] = 0;
  _$jscoverage['/editor.js'].lineData[1104] = 0;
  _$jscoverage['/editor.js'].lineData[1105] = 0;
  _$jscoverage['/editor.js'].lineData[1108] = 0;
  _$jscoverage['/editor.js'].lineData[1109] = 0;
  _$jscoverage['/editor.js'].lineData[1110] = 0;
  _$jscoverage['/editor.js'].lineData[1111] = 0;
  _$jscoverage['/editor.js'].lineData[1112] = 0;
  _$jscoverage['/editor.js'].lineData[1113] = 0;
  _$jscoverage['/editor.js'].lineData[1115] = 0;
  _$jscoverage['/editor.js'].lineData[1116] = 0;
  _$jscoverage['/editor.js'].lineData[1117] = 0;
  _$jscoverage['/editor.js'].lineData[1121] = 0;
  _$jscoverage['/editor.js'].lineData[1125] = 0;
  _$jscoverage['/editor.js'].lineData[1126] = 0;
  _$jscoverage['/editor.js'].lineData[1127] = 0;
  _$jscoverage['/editor.js'].lineData[1129] = 0;
  _$jscoverage['/editor.js'].lineData[1134] = 0;
  _$jscoverage['/editor.js'].lineData[1135] = 0;
  _$jscoverage['/editor.js'].lineData[1137] = 0;
  _$jscoverage['/editor.js'].lineData[1138] = 0;
  _$jscoverage['/editor.js'].lineData[1139] = 0;
  _$jscoverage['/editor.js'].lineData[1141] = 0;
  _$jscoverage['/editor.js'].lineData[1142] = 0;
  _$jscoverage['/editor.js'].lineData[1143] = 0;
  _$jscoverage['/editor.js'].lineData[1147] = 0;
  _$jscoverage['/editor.js'].lineData[1151] = 0;
  _$jscoverage['/editor.js'].lineData[1152] = 0;
  _$jscoverage['/editor.js'].lineData[1153] = 0;
  _$jscoverage['/editor.js'].lineData[1155] = 0;
  _$jscoverage['/editor.js'].lineData[1161] = 0;
  _$jscoverage['/editor.js'].lineData[1162] = 0;
  _$jscoverage['/editor.js'].lineData[1164] = 0;
  _$jscoverage['/editor.js'].lineData[1169] = 0;
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
  _$jscoverage['/editor.js'].branchData['138'] = [];
  _$jscoverage['/editor.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['143'] = [];
  _$jscoverage['/editor.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['157'] = [];
  _$jscoverage['/editor.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['158'] = [];
  _$jscoverage['/editor.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['163'] = [];
  _$jscoverage['/editor.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['180'] = [];
  _$jscoverage['/editor.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['263'] = [];
  _$jscoverage['/editor.js'].branchData['263'][1] = new BranchData();
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
  _$jscoverage['/editor.js'].branchData['752'] = [];
  _$jscoverage['/editor.js'].branchData['752'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['765'] = [];
  _$jscoverage['/editor.js'].branchData['765'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['768'] = [];
  _$jscoverage['/editor.js'].branchData['768'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['787'] = [];
  _$jscoverage['/editor.js'].branchData['787'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['798'] = [];
  _$jscoverage['/editor.js'].branchData['798'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['799'] = [];
  _$jscoverage['/editor.js'].branchData['799'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['822'] = [];
  _$jscoverage['/editor.js'].branchData['822'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['824'] = [];
  _$jscoverage['/editor.js'].branchData['824'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['841'] = [];
  _$jscoverage['/editor.js'].branchData['841'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['853'] = [];
  _$jscoverage['/editor.js'].branchData['853'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['854'] = [];
  _$jscoverage['/editor.js'].branchData['854'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['854'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['876'] = [];
  _$jscoverage['/editor.js'].branchData['876'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['887'] = [];
  _$jscoverage['/editor.js'].branchData['887'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['903'] = [];
  _$jscoverage['/editor.js'].branchData['903'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['906'] = [];
  _$jscoverage['/editor.js'].branchData['906'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['913'] = [];
  _$jscoverage['/editor.js'].branchData['913'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['920'] = [];
  _$jscoverage['/editor.js'].branchData['920'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['920'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['933'] = [];
  _$jscoverage['/editor.js'].branchData['933'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['948'] = [];
  _$jscoverage['/editor.js'].branchData['948'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['951'] = [];
  _$jscoverage['/editor.js'].branchData['951'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['958'] = [];
  _$jscoverage['/editor.js'].branchData['958'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['963'] = [];
  _$jscoverage['/editor.js'].branchData['963'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['969'] = [];
  _$jscoverage['/editor.js'].branchData['969'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['978'] = [];
  _$jscoverage['/editor.js'].branchData['978'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['981'] = [];
  _$jscoverage['/editor.js'].branchData['981'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['999'] = [];
  _$jscoverage['/editor.js'].branchData['999'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1002'] = [];
  _$jscoverage['/editor.js'].branchData['1002'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1012'] = [];
  _$jscoverage['/editor.js'].branchData['1012'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1015'] = [];
  _$jscoverage['/editor.js'].branchData['1015'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1022'] = [];
  _$jscoverage['/editor.js'].branchData['1022'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1025'] = [];
  _$jscoverage['/editor.js'].branchData['1025'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1025'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1043'] = [];
  _$jscoverage['/editor.js'].branchData['1043'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1052'] = [];
  _$jscoverage['/editor.js'].branchData['1052'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1059'] = [];
  _$jscoverage['/editor.js'].branchData['1059'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1103'] = [];
  _$jscoverage['/editor.js'].branchData['1103'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1125'] = [];
  _$jscoverage['/editor.js'].branchData['1125'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1126'] = [];
  _$jscoverage['/editor.js'].branchData['1126'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1134'] = [];
  _$jscoverage['/editor.js'].branchData['1134'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1141'] = [];
  _$jscoverage['/editor.js'].branchData['1141'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1152'] = [];
  _$jscoverage['/editor.js'].branchData['1152'][1] = new BranchData();
}
_$jscoverage['/editor.js'].branchData['1152'][1].init(14, 19, '!self.get(\'iframe\')');
function visit1251_1152_1(result) {
  _$jscoverage['/editor.js'].branchData['1152'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1141'][1].init(900, 31, 'UA[\'gecko\'] && !iframe.__loaded');
function visit1250_1141_1(result) {
  _$jscoverage['/editor.js'].branchData['1141'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1134'][1].init(568, 28, 'textarea.hasAttr(\'tabindex\')');
function visit1249_1134_1(result) {
  _$jscoverage['/editor.js'].branchData['1134'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1126'][1].init(266, 9, 'iframeSrc');
function visit1248_1126_1(result) {
  _$jscoverage['/editor.js'].branchData['1126'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1125'][1].init(216, 35, '$(window).getEmptyIframeSrc() || \'\'');
function visit1247_1125_1(result) {
  _$jscoverage['/editor.js'].branchData['1125'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1103'][1].init(378, 9, 'IS_IE < 7');
function visit1246_1103_1(result) {
  _$jscoverage['/editor.js'].branchData['1103'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1059'][1].init(515, 10, 'data || \'\'');
function visit1245_1059_1(result) {
  _$jscoverage['/editor.js'].branchData['1059'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1052'][1].init(236, 27, 'document.documentMode === 8');
function visit1244_1052_1(result) {
  _$jscoverage['/editor.js'].branchData['1052'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1043'][1].init(222, 21, 'i < customLink.length');
function visit1243_1043_1(result) {
  _$jscoverage['/editor.js'].branchData['1043'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1025'][2].init(74, 28, 'control.nodeName() === \'img\'');
function visit1242_1025_2(result) {
  _$jscoverage['/editor.js'].branchData['1025'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1025'][1].init(74, 64, 'control.nodeName() === \'img\' && /ke_/.test(control[0].className)');
function visit1241_1025_1(result) {
  _$jscoverage['/editor.js'].branchData['1025'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1022'][1].init(4970, 11, 'UA[\'gecko\']');
function visit1240_1022_1(result) {
  _$jscoverage['/editor.js'].branchData['1022'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1015'][1].init(74, 75, 'S.inArray(control.nodeName(), [\'img\', \'hr\', \'input\', \'textarea\', \'select\'])');
function visit1239_1015_1(result) {
  _$jscoverage['/editor.js'].branchData['1015'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1012'][1].init(4623, 12, 'UA[\'webkit\']');
function visit1238_1012_1(result) {
  _$jscoverage['/editor.js'].branchData['1012'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1002'][1].init(26, 29, 'evt.keyCode in pageUpDownKeys');
function visit1237_1002_1(result) {
  _$jscoverage['/editor.js'].branchData['1002'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['999'][1].init(1368, 30, 'doc.compatMode == \'CSS1Compat\'');
function visit1236_999_1(result) {
  _$jscoverage['/editor.js'].branchData['999'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['981'][1].init(139, 7, 'control');
function visit1235_981_1(result) {
  _$jscoverage['/editor.js'].branchData['981'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['978'][1].init(107, 26, 'keyCode in {\n  8: 1, \n  46: 1}');
function visit1234_978_1(result) {
  _$jscoverage['/editor.js'].branchData['978'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['969'][1].init(2726, 5, 'IS_IE');
function visit1233_969_1(result) {
  _$jscoverage['/editor.js'].branchData['969'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['963'][1].init(22, 19, '!self.__iframeFocus');
function visit1232_963_1(result) {
  _$jscoverage['/editor.js'].branchData['963'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['958'][1].init(2429, 11, 'UA[\'gecko\']');
function visit1231_958_1(result) {
  _$jscoverage['/editor.js'].branchData['958'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['951'][1].init(252, 11, 'UA[\'opera\']');
function visit1230_951_1(result) {
  _$jscoverage['/editor.js'].branchData['951'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['948'][1].init(157, 11, 'UA[\'gecko\']');
function visit1229_948_1(result) {
  _$jscoverage['/editor.js'].branchData['948'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['933'][1].init(22, 33, 'UA[\'gecko\'] && self.__iframeFocus');
function visit1228_933_1(result) {
  _$jscoverage['/editor.js'].branchData['933'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['920'][2].init(1120, 20, 'IS_IE || UA[\'opera\']');
function visit1227_920_2(result) {
  _$jscoverage['/editor.js'].branchData['920'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['920'][1].init(1105, 35, 'UA[\'gecko\'] || IS_IE || UA[\'opera\']');
function visit1226_920_1(result) {
  _$jscoverage['/editor.js'].branchData['920'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['913'][1].init(74, 52, 'S.inArray(control.nodeName(), [\'input\', \'textarea\'])');
function visit1225_913_1(result) {
  _$jscoverage['/editor.js'].branchData['913'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['906'][1].init(74, 50, 'S.inArray(control.nodeName(), [\'input\', \'select\'])');
function visit1224_906_1(result) {
  _$jscoverage['/editor.js'].branchData['906'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['903'][1].init(439, 12, 'UA[\'webkit\']');
function visit1223_903_1(result) {
  _$jscoverage['/editor.js'].branchData['903'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['887'][1].init(225, 29, '!retry && blinkCursor(doc, 1)');
function visit1222_887_1(result) {
  _$jscoverage['/editor.js'].branchData['887'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['876'][1].init(153, 23, '!arguments.callee.retry');
function visit1221_876_1(result) {
  _$jscoverage['/editor.js'].branchData['876'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['854'][2].init(54, 24, 't.nodeName() === \'table\'');
function visit1220_854_2(result) {
  _$jscoverage['/editor.js'].branchData['854'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['854'][1].init(54, 86, 't.nodeName() === \'table\' && disableInlineTableEditing');
function visit1219_854_1(result) {
  _$jscoverage['/editor.js'].branchData['854'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['853'][1].init(85, 142, 'disableObjectResizing || (t.nodeName() === \'table\' && disableInlineTableEditing)');
function visit1218_853_1(result) {
  _$jscoverage['/editor.js'].branchData['853'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['841'][1].init(326, 50, 'disableObjectResizing || disableInlineTableEditing');
function visit1217_841_1(result) {
  _$jscoverage['/editor.js'].branchData['841'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['824'][1].init(26, 3, 'doc');
function visit1216_824_1(result) {
  _$jscoverage['/editor.js'].branchData['824'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['822'][1].init(381, 5, 'IS_IE');
function visit1215_822_1(result) {
  _$jscoverage['/editor.js'].branchData['822'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['799'][1].init(26, 11, 'UA[\'gecko\']');
function visit1214_799_1(result) {
  _$jscoverage['/editor.js'].branchData['799'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['798'][1].init(327, 16, 't == htmlElement');
function visit1213_798_1(result) {
  _$jscoverage['/editor.js'].branchData['798'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['787'][1].init(372, 26, 'UA[\'gecko\'] || UA[\'opera\']');
function visit1212_787_1(result) {
  _$jscoverage['/editor.js'].branchData['787'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['768'][1].init(229, 12, 'UA[\'webkit\']');
function visit1211_768_1(result) {
  _$jscoverage['/editor.js'].branchData['768'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['765'][1].init(100, 26, 'UA[\'gecko\'] || UA[\'opera\']');
function visit1210_765_1(result) {
  _$jscoverage['/editor.js'].branchData['765'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['752'][1].init(1320, 5, 'IS_IE');
function visit1209_752_1(result) {
  _$jscoverage['/editor.js'].branchData['752'][1].ranCondition(result);
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
}_$jscoverage['/editor.js'].branchData['353'][1].init(162, 5, 'range');
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
}_$jscoverage['/editor.js'].branchData['263'][1].init(202, 3, 'cmd');
function visit1155_263_1(result) {
  _$jscoverage['/editor.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['180'][1].init(22, 15, 'control.destroy');
function visit1154_180_1(result) {
  _$jscoverage['/editor.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['163'][1].init(368, 3, 'doc');
function visit1153_163_1(result) {
  _$jscoverage['/editor.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['158'][1].init(43, 61, '(form = textarea[0].form) && (form = $(form))');
function visit1152_158_1(result) {
  _$jscoverage['/editor.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['157'][1].init(168, 105, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1151_157_1(result) {
  _$jscoverage['/editor.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['143'][1].init(291, 42, 'htmlDataProcessor = self.htmlDataProcessor');
function visit1150_143_1(result) {
  _$jscoverage['/editor.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['138'][1].init(119, 32, 'self.get(\'mode\') != WYSIWYG_MODE');
function visit1149_138_1(result) {
  _$jscoverage['/editor.js'].branchData['138'][1].ranCondition(result);
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
  'setData': function(data) {
  _$jscoverage['/editor.js'].functionData[10]++;
  _$jscoverage['/editor.js'].lineData[135]++;
  var self = this, htmlDataProcessor, afterData = data;
  _$jscoverage['/editor.js'].lineData[138]++;
  if (visit1149_138_1(self.get('mode') != WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[140]++;
    self.get('textarea').val(data);
    _$jscoverage['/editor.js'].lineData[141]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[143]++;
  if (visit1150_143_1(htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[144]++;
    afterData = htmlDataProcessor.toDataFormat(data);
  }
  _$jscoverage['/editor.js'].lineData[147]++;
  clearIframeDocContent(self);
  _$jscoverage['/editor.js'].lineData[148]++;
  createIframe(self, afterData);
}, 
  destructor: function() {
  _$jscoverage['/editor.js'].functionData[11]++;
  _$jscoverage['/editor.js'].lineData[152]++;
  var self = this, form, textarea = self.get('textarea'), doc = self.get('document');
  _$jscoverage['/editor.js'].lineData[157]++;
  if (visit1151_157_1(self.get('attachForm') && visit1152_158_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[160]++;
    form.detach("submit", self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[163]++;
  if (visit1153_163_1(doc)) {
    _$jscoverage['/editor.js'].lineData[164]++;
    var body = $(doc[0].body), documentElement = $(doc[0].documentElement), win = self.get('window');
    _$jscoverage['/editor.js'].lineData[168]++;
    focusManager.remove(self);
    _$jscoverage['/editor.js'].lineData[170]++;
    doc.detach();
    _$jscoverage['/editor.js'].lineData[172]++;
    documentElement.detach();
    _$jscoverage['/editor.js'].lineData[174]++;
    body.detach();
    _$jscoverage['/editor.js'].lineData[176]++;
    win.detach();
  }
  _$jscoverage['/editor.js'].lineData[179]++;
  S.each(self.__controls, function(control) {
  _$jscoverage['/editor.js'].functionData[12]++;
  _$jscoverage['/editor.js'].lineData[180]++;
  if (visit1154_180_1(control.destroy)) {
    _$jscoverage['/editor.js'].lineData[181]++;
    control.destroy();
  }
});
  _$jscoverage['/editor.js'].lineData[185]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[186]++;
  self.__controls = {};
}, 
  getControl: function(id) {
  _$jscoverage['/editor.js'].functionData[13]++;
  _$jscoverage['/editor.js'].lineData[194]++;
  return this.__controls[id];
}, 
  getControls: function() {
  _$jscoverage['/editor.js'].functionData[14]++;
  _$jscoverage['/editor.js'].lineData[202]++;
  return this.__controls;
}, 
  addControl: function(id, control) {
  _$jscoverage['/editor.js'].functionData[15]++;
  _$jscoverage['/editor.js'].lineData[211]++;
  this.__controls[id] = control;
}, 
  showDialog: function(name, args) {
  _$jscoverage['/editor.js'].functionData[16]++;
  _$jscoverage['/editor.js'].lineData[221]++;
  name += '/dialog';
  _$jscoverage['/editor.js'].lineData[222]++;
  var self = this, d = self.__controls[name];
  _$jscoverage['/editor.js'].lineData[224]++;
  d.show(args);
  _$jscoverage['/editor.js'].lineData[225]++;
  self.fire('dialogShow', {
  dialog: d.dialog, 
  "pluginDialog": d, 
  "dialogName": name});
}, 
  addCommand: function(name, obj) {
  _$jscoverage['/editor.js'].functionData[17]++;
  _$jscoverage['/editor.js'].lineData[239]++;
  this.__commands[name] = obj;
}, 
  hasCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[18]++;
  _$jscoverage['/editor.js'].lineData[248]++;
  return this.__commands[name];
}, 
  execCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[19]++;
  _$jscoverage['/editor.js'].lineData[258]++;
  var self = this, cmd = self.__commands[name], args = S.makeArray(arguments);
  _$jscoverage['/editor.js'].lineData[261]++;
  args.shift();
  _$jscoverage['/editor.js'].lineData[262]++;
  args.unshift(self);
  _$jscoverage['/editor.js'].lineData[263]++;
  if (visit1155_263_1(cmd)) {
    _$jscoverage['/editor.js'].lineData[264]++;
    return cmd.exec.apply(cmd, args);
  } else {
    _$jscoverage['/editor.js'].lineData[266]++;
    logger.error(name + ': command not found');
    _$jscoverage['/editor.js'].lineData[267]++;
    return undefined;
  }
}, 
  queryCommandValue: function(name) {
  _$jscoverage['/editor.js'].functionData[20]++;
  _$jscoverage['/editor.js'].lineData[277]++;
  return this.execCommand(Utils.getQueryCmd(name));
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
  _$jscoverage['/editor.js'].lineData[718]++;
  var self = focusManager.getInstance(id), $doc = self.get('document'), doc = $doc[0], script = $doc.one('#ke_active_script');
  _$jscoverage['/editor.js'].lineData[724]++;
  script.remove();
  _$jscoverage['/editor.js'].lineData[726]++;
  fixByBindIframeDoc(self);
  _$jscoverage['/editor.js'].lineData[728]++;
  var body = doc.body;
  _$jscoverage['/editor.js'].lineData[730]++;
  var $body = $(body);
  _$jscoverage['/editor.js'].lineData[752]++;
  if (visit1209_752_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[754]++;
    body['hideFocus'] = TRUE;
    _$jscoverage['/editor.js'].lineData[757]++;
    body.disabled = TRUE;
    _$jscoverage['/editor.js'].lineData[758]++;
    body['contentEditable'] = TRUE;
    _$jscoverage['/editor.js'].lineData[759]++;
    body.removeAttribute('disabled');
  } else {
    _$jscoverage['/editor.js'].lineData[763]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[45]++;
  _$jscoverage['/editor.js'].lineData[765]++;
  if (visit1210_765_1(UA['gecko'] || UA['opera'])) {
    _$jscoverage['/editor.js'].lineData[766]++;
    body['contentEditable'] = TRUE;
  } else {
    _$jscoverage['/editor.js'].lineData[768]++;
    if (visit1211_768_1(UA['webkit'])) {
      _$jscoverage['/editor.js'].lineData[769]++;
      body.parentNode['contentEditable'] = TRUE;
    } else {
      _$jscoverage['/editor.js'].lineData[771]++;
      doc['designMode'] = 'on';
    }
  }
}, 0);
  }
  _$jscoverage['/editor.js'].lineData[778]++;
  if (visit1212_787_1(UA['gecko'] || UA['opera'])) {
    _$jscoverage['/editor.js'].lineData[789]++;
    var htmlElement = doc.documentElement;
    _$jscoverage['/editor.js'].lineData[790]++;
    $(htmlElement).on('mousedown', function(evt) {
  _$jscoverage['/editor.js'].functionData[46]++;
  _$jscoverage['/editor.js'].lineData[797]++;
  var t = evt.target;
  _$jscoverage['/editor.js'].lineData[798]++;
  if (visit1213_798_1(t == htmlElement)) {
    _$jscoverage['/editor.js'].lineData[799]++;
    if (visit1214_799_1(UA['gecko'])) {
      _$jscoverage['/editor.js'].lineData[800]++;
      blinkCursor(doc, FALSE);
    }
    _$jscoverage['/editor.js'].lineData[807]++;
    self.activateGecko();
  }
});
  }
  _$jscoverage['/editor.js'].lineData[813]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[47]++;
  _$jscoverage['/editor.js'].lineData[822]++;
  if (visit1215_822_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[823]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[48]++;
  _$jscoverage['/editor.js'].lineData[824]++;
  if (visit1216_824_1(doc)) {
    _$jscoverage['/editor.js'].lineData[825]++;
    body.runtimeStyle['marginBottom'] = '0px';
    _$jscoverage['/editor.js'].lineData[826]++;
    body.runtimeStyle['marginBottom'] = '';
  }
}, 1000);
  }
}, 0);
  _$jscoverage['/editor.js'].lineData[833]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[49]++;
  _$jscoverage['/editor.js'].lineData[834]++;
  self.__docReady = 1;
  _$jscoverage['/editor.js'].lineData[835]++;
  self.fire('docReady');
  _$jscoverage['/editor.js'].lineData[839]++;
  var disableObjectResizing = self.get('disableObjectResizing'), disableInlineTableEditing = self.get('disableInlineTableEditing');
  _$jscoverage['/editor.js'].lineData[841]++;
  if (visit1217_841_1(disableObjectResizing || disableInlineTableEditing)) {
    _$jscoverage['/editor.js'].lineData[843]++;
    try {
      _$jscoverage['/editor.js'].lineData[844]++;
      doc.execCommand('enableObjectResizing', FALSE, !disableObjectResizing);
      _$jscoverage['/editor.js'].lineData[845]++;
      doc.execCommand('enableInlineTableEditing', FALSE, !disableInlineTableEditing);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[851]++;
  $body.on(IS_IE ? 'resizestart' : 'resize', function(evt) {
  _$jscoverage['/editor.js'].functionData[50]++;
  _$jscoverage['/editor.js'].lineData[852]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor.js'].lineData[853]++;
  if (visit1218_853_1(disableObjectResizing || (visit1219_854_1(visit1220_854_2(t.nodeName() === 'table') && disableInlineTableEditing)))) {
    _$jscoverage['/editor.js'].lineData[856]++;
    evt.preventDefault();
  }
});
}
  }
}, 10);
};
  _$jscoverage['/editor.js'].lineData[866]++;
  function blinkCursor(doc, retry) {
    _$jscoverage['/editor.js'].functionData[51]++;
    _$jscoverage['/editor.js'].lineData[867]++;
    var body = doc.body;
    _$jscoverage['/editor.js'].lineData[868]++;
    tryThese(function() {
  _$jscoverage['/editor.js'].functionData[52]++;
  _$jscoverage['/editor.js'].lineData[870]++;
  doc['designMode'] = 'on';
  _$jscoverage['/editor.js'].lineData[872]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[53]++;
  _$jscoverage['/editor.js'].lineData[873]++;
  doc['designMode'] = 'off';
  _$jscoverage['/editor.js'].lineData[874]++;
  body.focus();
  _$jscoverage['/editor.js'].lineData[876]++;
  if (visit1221_876_1(!arguments.callee.retry)) {
    _$jscoverage['/editor.js'].lineData[877]++;
    arguments.callee.retry = TRUE;
  }
}, 50);
}, function() {
  _$jscoverage['/editor.js'].functionData[54]++;
  _$jscoverage['/editor.js'].lineData[883]++;
  doc['designMode'] = 'off';
  _$jscoverage['/editor.js'].lineData[884]++;
  body.setAttribute('contentEditable', false);
  _$jscoverage['/editor.js'].lineData[885]++;
  body.setAttribute('contentEditable', true);
  _$jscoverage['/editor.js'].lineData[887]++;
  visit1222_887_1(!retry && blinkCursor(doc, 1));
});
  }
  _$jscoverage['/editor.js'].lineData[892]++;
  function fixByBindIframeDoc(self) {
    _$jscoverage['/editor.js'].functionData[55]++;
    _$jscoverage['/editor.js'].lineData[893]++;
    var iframe = self.get('iframe'), textarea = self.get('textarea')[0], $win = self.get('window'), $doc = self.get('document'), doc = $doc[0];
    _$jscoverage['/editor.js'].lineData[903]++;
    if (visit1223_903_1(UA['webkit'])) {
      _$jscoverage['/editor.js'].lineData[904]++;
      $doc.on('click', function(ev) {
  _$jscoverage['/editor.js'].functionData[56]++;
  _$jscoverage['/editor.js'].lineData[905]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[906]++;
  if (visit1224_906_1(S.inArray(control.nodeName(), ['input', 'select']))) {
    _$jscoverage['/editor.js'].lineData[907]++;
    ev.preventDefault();
  }
});
      _$jscoverage['/editor.js'].lineData[911]++;
      $doc.on('mouseup', function(ev) {
  _$jscoverage['/editor.js'].functionData[57]++;
  _$jscoverage['/editor.js'].lineData[912]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[913]++;
  if (visit1225_913_1(S.inArray(control.nodeName(), ['input', 'textarea']))) {
    _$jscoverage['/editor.js'].lineData[914]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[920]++;
    if (visit1226_920_1(UA['gecko'] || visit1227_920_2(IS_IE || UA['opera']))) {
      _$jscoverage['/editor.js'].lineData[921]++;
      var focusGrabber;
      _$jscoverage['/editor.js'].lineData[922]++;
      focusGrabber = new Node('<span ' + 'tabindex="-1" ' + 'style="position:absolute; left:-10000"' + ' role="presentation"' + '></span>').insertAfter(textarea);
      _$jscoverage['/editor.js'].lineData[929]++;
      focusGrabber.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[58]++;
  _$jscoverage['/editor.js'].lineData[930]++;
  self.focus();
});
      _$jscoverage['/editor.js'].lineData[932]++;
      self.activateGecko = function() {
  _$jscoverage['/editor.js'].functionData[59]++;
  _$jscoverage['/editor.js'].lineData[933]++;
  if (visit1228_933_1(UA['gecko'] && self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[934]++;
    focusGrabber[0].focus();
  }
};
      _$jscoverage['/editor.js'].lineData[936]++;
      self.on('destroy', function() {
  _$jscoverage['/editor.js'].functionData[60]++;
  _$jscoverage['/editor.js'].lineData[937]++;
  focusGrabber.detach();
  _$jscoverage['/editor.js'].lineData[938]++;
  focusGrabber.remove();
});
    }
    _$jscoverage['/editor.js'].lineData[942]++;
    $win.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[61]++;
  _$jscoverage['/editor.js'].lineData[948]++;
  if (visit1229_948_1(UA['gecko'])) {
    _$jscoverage['/editor.js'].lineData[949]++;
    blinkCursor(doc, FALSE);
  } else {
    _$jscoverage['/editor.js'].lineData[951]++;
    if (visit1230_951_1(UA['opera'])) {
      _$jscoverage['/editor.js'].lineData[952]++;
      doc.body.focus();
    }
  }
  _$jscoverage['/editor.js'].lineData[955]++;
  self.notifySelectionChange();
});
    _$jscoverage['/editor.js'].lineData[958]++;
    if (visit1231_958_1(UA['gecko'])) {
      _$jscoverage['/editor.js'].lineData[962]++;
      $doc.on('mousedown', function() {
  _$jscoverage['/editor.js'].functionData[62]++;
  _$jscoverage['/editor.js'].lineData[963]++;
  if (visit1232_963_1(!self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[964]++;
    blinkCursor(doc, FALSE);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[969]++;
    if (visit1233_969_1(IS_IE)) {
      _$jscoverage['/editor.js'].lineData[975]++;
      $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[63]++;
  _$jscoverage['/editor.js'].lineData[976]++;
  var keyCode = evt.keyCode;
  _$jscoverage['/editor.js'].lineData[978]++;
  if (visit1234_978_1(keyCode in {
  8: 1, 
  46: 1})) {
    _$jscoverage['/editor.js'].lineData[979]++;
    var sel = self.getSelection(), control = sel.getSelectedElement();
    _$jscoverage['/editor.js'].lineData[981]++;
    if (visit1235_981_1(control)) {
      _$jscoverage['/editor.js'].lineData[983]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[986]++;
      var bookmark = sel.getRanges()[0].createBookmark();
      _$jscoverage['/editor.js'].lineData[988]++;
      control.remove();
      _$jscoverage['/editor.js'].lineData[989]++;
      sel.selectBookmarks([bookmark]);
      _$jscoverage['/editor.js'].lineData[990]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[991]++;
      evt.preventDefault();
    }
  }
});
      _$jscoverage['/editor.js'].lineData[999]++;
      if (visit1236_999_1(doc.compatMode == 'CSS1Compat')) {
        _$jscoverage['/editor.js'].lineData[1000]++;
        var pageUpDownKeys = {
  33: 1, 
  34: 1};
        _$jscoverage['/editor.js'].lineData[1001]++;
        $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[64]++;
  _$jscoverage['/editor.js'].lineData[1002]++;
  if (visit1237_1002_1(evt.keyCode in pageUpDownKeys)) {
    _$jscoverage['/editor.js'].lineData[1003]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[65]++;
  _$jscoverage['/editor.js'].lineData[1004]++;
  self.getSelection().scrollIntoView();
}, 0);
  }
});
      }
    }
    _$jscoverage['/editor.js'].lineData[1012]++;
    if (visit1238_1012_1(UA['webkit'])) {
      _$jscoverage['/editor.js'].lineData[1013]++;
      $doc.on('mousedown', function(ev) {
  _$jscoverage['/editor.js'].functionData[66]++;
  _$jscoverage['/editor.js'].lineData[1014]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1015]++;
  if (visit1239_1015_1(S.inArray(control.nodeName(), ['img', 'hr', 'input', 'textarea', 'select']))) {
    _$jscoverage['/editor.js'].lineData[1016]++;
    self.getSelection().selectElement(control);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1022]++;
    if (visit1240_1022_1(UA['gecko'])) {
      _$jscoverage['/editor.js'].lineData[1023]++;
      $doc.on('dragstart', function(ev) {
  _$jscoverage['/editor.js'].functionData[67]++;
  _$jscoverage['/editor.js'].lineData[1024]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1025]++;
  if (visit1241_1025_1(visit1242_1025_2(control.nodeName() === 'img') && /ke_/.test(control[0].className))) {
    _$jscoverage['/editor.js'].lineData[1027]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1033]++;
    focusManager.add(self);
  }
  _$jscoverage['/editor.js'].lineData[1037]++;
  function prepareIFrameHTML(id, customStyle, customLink, data) {
    _$jscoverage['/editor.js'].functionData[68]++;
    _$jscoverage['/editor.js'].lineData[1038]++;
    var links = '', i, innerCssFile = Utils.debugUrl('theme/editor-iframe.css');
    _$jscoverage['/editor.js'].lineData[1041]++;
    customLink = customLink.concat([]);
    _$jscoverage['/editor.js'].lineData[1042]++;
    customLink.unshift(innerCssFile);
    _$jscoverage['/editor.js'].lineData[1043]++;
    for (i = 0; visit1243_1043_1(i < customLink.length); i++) {
      _$jscoverage['/editor.js'].lineData[1044]++;
      links += S.substitute('<link href="' + '{href}" rel="stylesheet" />', {
  href: customLink[i]});
    }
    _$jscoverage['/editor.js'].lineData[1048]++;
    return S.substitute(iframeContentTpl, {
  doctype: visit1244_1052_1(document.documentMode === 8) ? '<meta http-equiv="X-UA-Compatible" content="IE=7" />' : '', 
  title: '${title}', 
  links: links, 
  style: customStyle, 
  data: visit1245_1059_1(data || ''), 
  script: id ? ('<script id="ke_active_script">' + ($(window).isCustomDomain() ? ('document.domain="' + document.domain + '";') : '') + 'parent.KISSY.require("editor")._initIframe("' + id + '");' + '</script>') : ''});
  }
  _$jscoverage['/editor.js'].lineData[1074]++;
  var saveLater = S.buffer(function() {
  _$jscoverage['/editor.js'].functionData[69]++;
  _$jscoverage['/editor.js'].lineData[1075]++;
  this.execCommand('save');
}, 50);
  _$jscoverage['/editor.js'].lineData[1078]++;
  function setUpIFrame(self, data) {
    _$jscoverage['/editor.js'].functionData[70]++;
    _$jscoverage['/editor.js'].lineData[1079]++;
    var iframe = self.get('iframe'), html = prepareIFrameHTML(self.get('id'), self.get('customStyle'), self.get('customLink'), data), iframeDom = iframe[0], win = iframeDom.contentWindow, doc;
    _$jscoverage['/editor.js'].lineData[1086]++;
    iframe.__loaded = 1;
    _$jscoverage['/editor.js'].lineData[1087]++;
    try {
      _$jscoverage['/editor.js'].lineData[1095]++;
      doc = win.document;
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[1100]++;
  iframeDom.src = iframeDom.src;
  _$jscoverage['/editor.js'].lineData[1103]++;
  if (visit1246_1103_1(IS_IE < 7)) {
    _$jscoverage['/editor.js'].lineData[1104]++;
    setTimeout(run, 10);
    _$jscoverage['/editor.js'].lineData[1105]++;
    return;
  }
}
    _$jscoverage['/editor.js'].lineData[1108]++;
    run();
    _$jscoverage['/editor.js'].lineData[1109]++;
    function run() {
      _$jscoverage['/editor.js'].functionData[71]++;
      _$jscoverage['/editor.js'].lineData[1110]++;
      doc = win.document;
      _$jscoverage['/editor.js'].lineData[1111]++;
      self.setInternal('document', new Node(doc));
      _$jscoverage['/editor.js'].lineData[1112]++;
      self.setInternal('window', new Node(win));
      _$jscoverage['/editor.js'].lineData[1113]++;
      iframe.detach();
      _$jscoverage['/editor.js'].lineData[1115]++;
      doc['open']('text/html', 'replace');
      _$jscoverage['/editor.js'].lineData[1116]++;
      doc.write(html);
      _$jscoverage['/editor.js'].lineData[1117]++;
      doc.close();
    }
  }
  _$jscoverage['/editor.js'].lineData[1121]++;
  function createIframe(self, afterData) {
    _$jscoverage['/editor.js'].functionData[72]++;
    _$jscoverage['/editor.js'].lineData[1125]++;
    var iframeSrc = visit1247_1125_1($(window).getEmptyIframeSrc() || '');
    _$jscoverage['/editor.js'].lineData[1126]++;
    if (visit1248_1126_1(iframeSrc)) {
      _$jscoverage['/editor.js'].lineData[1127]++;
      iframeSrc = ' src="' + iframeSrc + '" ';
    }
    _$jscoverage['/editor.js'].lineData[1129]++;
    var iframe = new Node(S.substitute(IFRAME_TPL, {
  iframeSrc: iframeSrc, 
  prefixCls: self.get('prefixCls')})), textarea = self.get('textarea');
    _$jscoverage['/editor.js'].lineData[1134]++;
    if (visit1249_1134_1(textarea.hasAttr('tabindex'))) {
      _$jscoverage['/editor.js'].lineData[1135]++;
      iframe.attr('tabindex', UA['webkit'] ? -1 : textarea.attr('tabindex'));
    }
    _$jscoverage['/editor.js'].lineData[1137]++;
    textarea.parent().prepend(iframe);
    _$jscoverage['/editor.js'].lineData[1138]++;
    self.set('iframe', iframe);
    _$jscoverage['/editor.js'].lineData[1139]++;
    self.__docReady = 0;
    _$jscoverage['/editor.js'].lineData[1141]++;
    if (visit1250_1141_1(UA['gecko'] && !iframe.__loaded)) {
      _$jscoverage['/editor.js'].lineData[1142]++;
      iframe.on('load', function() {
  _$jscoverage['/editor.js'].functionData[73]++;
  _$jscoverage['/editor.js'].lineData[1143]++;
  setUpIFrame(self, afterData);
}, self);
    } else {
      _$jscoverage['/editor.js'].lineData[1147]++;
      setUpIFrame(self, afterData);
    }
  }
  _$jscoverage['/editor.js'].lineData[1151]++;
  function clearIframeDocContent(self) {
    _$jscoverage['/editor.js'].functionData[74]++;
    _$jscoverage['/editor.js'].lineData[1152]++;
    if (visit1251_1152_1(!self.get('iframe'))) {
      _$jscoverage['/editor.js'].lineData[1153]++;
      return;
    }
    _$jscoverage['/editor.js'].lineData[1155]++;
    var iframe = self.get('iframe'), win = self.get('window'), doc = self.get('document'), domDoc = doc[0], documentElement = $(domDoc.documentElement), body = $(domDoc.body);
    _$jscoverage['/editor.js'].lineData[1161]++;
    S.each([doc, documentElement, body, win], function(el) {
  _$jscoverage['/editor.js'].functionData[75]++;
  _$jscoverage['/editor.js'].lineData[1162]++;
  el.detach();
});
    _$jscoverage['/editor.js'].lineData[1164]++;
    iframe.remove();
  }
  _$jscoverage['/editor.js'].lineData[1169]++;
  return Editor;
}, {
  requires: ['node', 'editor/iframe-content-tpl', 'editor/base', 'editor/utils', 'editor/focusManager', 'editor/styles', 'editor/zIndexManager', 'editor/clipboard', 'editor/enterKey', 'editor/htmlDataProcessor', 'editor/selectionFix', 'editor/plugin-meta']});
