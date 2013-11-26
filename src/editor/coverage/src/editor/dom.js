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
if (! _$jscoverage['/editor/dom.js']) {
  _$jscoverage['/editor/dom.js'] = {};
  _$jscoverage['/editor/dom.js'].lineData = [];
  _$jscoverage['/editor/dom.js'].lineData[10] = 0;
  _$jscoverage['/editor/dom.js'].lineData[11] = 0;
  _$jscoverage['/editor/dom.js'].lineData[12] = 0;
  _$jscoverage['/editor/dom.js'].lineData[13] = 0;
  _$jscoverage['/editor/dom.js'].lineData[14] = 0;
  _$jscoverage['/editor/dom.js'].lineData[57] = 0;
  _$jscoverage['/editor/dom.js'].lineData[65] = 0;
  _$jscoverage['/editor/dom.js'].lineData[73] = 0;
  _$jscoverage['/editor/dom.js'].lineData[88] = 0;
  _$jscoverage['/editor/dom.js'].lineData[91] = 0;
  _$jscoverage['/editor/dom.js'].lineData[96] = 0;
  _$jscoverage['/editor/dom.js'].lineData[97] = 0;
  _$jscoverage['/editor/dom.js'].lineData[98] = 0;
  _$jscoverage['/editor/dom.js'].lineData[103] = 0;
  _$jscoverage['/editor/dom.js'].lineData[104] = 0;
  _$jscoverage['/editor/dom.js'].lineData[109] = 0;
  _$jscoverage['/editor/dom.js'].lineData[113] = 0;
  _$jscoverage['/editor/dom.js'].lineData[114] = 0;
  _$jscoverage['/editor/dom.js'].lineData[117] = 0;
  _$jscoverage['/editor/dom.js'].lineData[121] = 0;
  _$jscoverage['/editor/dom.js'].lineData[124] = 0;
  _$jscoverage['/editor/dom.js'].lineData[126] = 0;
  _$jscoverage['/editor/dom.js'].lineData[127] = 0;
  _$jscoverage['/editor/dom.js'].lineData[130] = 0;
  _$jscoverage['/editor/dom.js'].lineData[136] = 0;
  _$jscoverage['/editor/dom.js'].lineData[137] = 0;
  _$jscoverage['/editor/dom.js'].lineData[138] = 0;
  _$jscoverage['/editor/dom.js'].lineData[140] = 0;
  _$jscoverage['/editor/dom.js'].lineData[147] = 0;
  _$jscoverage['/editor/dom.js'].lineData[148] = 0;
  _$jscoverage['/editor/dom.js'].lineData[151] = 0;
  _$jscoverage['/editor/dom.js'].lineData[153] = 0;
  _$jscoverage['/editor/dom.js'].lineData[154] = 0;
  _$jscoverage['/editor/dom.js'].lineData[157] = 0;
  _$jscoverage['/editor/dom.js'].lineData[160] = 0;
  _$jscoverage['/editor/dom.js'].lineData[163] = 0;
  _$jscoverage['/editor/dom.js'].lineData[164] = 0;
  _$jscoverage['/editor/dom.js'].lineData[167] = 0;
  _$jscoverage['/editor/dom.js'].lineData[168] = 0;
  _$jscoverage['/editor/dom.js'].lineData[170] = 0;
  _$jscoverage['/editor/dom.js'].lineData[172] = 0;
  _$jscoverage['/editor/dom.js'].lineData[179] = 0;
  _$jscoverage['/editor/dom.js'].lineData[180] = 0;
  _$jscoverage['/editor/dom.js'].lineData[181] = 0;
  _$jscoverage['/editor/dom.js'].lineData[182] = 0;
  _$jscoverage['/editor/dom.js'].lineData[183] = 0;
  _$jscoverage['/editor/dom.js'].lineData[185] = 0;
  _$jscoverage['/editor/dom.js'].lineData[190] = 0;
  _$jscoverage['/editor/dom.js'].lineData[195] = 0;
  _$jscoverage['/editor/dom.js'].lineData[196] = 0;
  _$jscoverage['/editor/dom.js'].lineData[198] = 0;
  _$jscoverage['/editor/dom.js'].lineData[199] = 0;
  _$jscoverage['/editor/dom.js'].lineData[200] = 0;
  _$jscoverage['/editor/dom.js'].lineData[203] = 0;
  _$jscoverage['/editor/dom.js'].lineData[205] = 0;
  _$jscoverage['/editor/dom.js'].lineData[208] = 0;
  _$jscoverage['/editor/dom.js'].lineData[210] = 0;
  _$jscoverage['/editor/dom.js'].lineData[213] = 0;
  _$jscoverage['/editor/dom.js'].lineData[218] = 0;
  _$jscoverage['/editor/dom.js'].lineData[220] = 0;
  _$jscoverage['/editor/dom.js'].lineData[221] = 0;
  _$jscoverage['/editor/dom.js'].lineData[224] = 0;
  _$jscoverage['/editor/dom.js'].lineData[226] = 0;
  _$jscoverage['/editor/dom.js'].lineData[227] = 0;
  _$jscoverage['/editor/dom.js'].lineData[228] = 0;
  _$jscoverage['/editor/dom.js'].lineData[231] = 0;
  _$jscoverage['/editor/dom.js'].lineData[232] = 0;
  _$jscoverage['/editor/dom.js'].lineData[245] = 0;
  _$jscoverage['/editor/dom.js'].lineData[247] = 0;
  _$jscoverage['/editor/dom.js'].lineData[248] = 0;
  _$jscoverage['/editor/dom.js'].lineData[249] = 0;
  _$jscoverage['/editor/dom.js'].lineData[256] = 0;
  _$jscoverage['/editor/dom.js'].lineData[258] = 0;
  _$jscoverage['/editor/dom.js'].lineData[259] = 0;
  _$jscoverage['/editor/dom.js'].lineData[264] = 0;
  _$jscoverage['/editor/dom.js'].lineData[265] = 0;
  _$jscoverage['/editor/dom.js'].lineData[266] = 0;
  _$jscoverage['/editor/dom.js'].lineData[267] = 0;
  _$jscoverage['/editor/dom.js'].lineData[270] = 0;
  _$jscoverage['/editor/dom.js'].lineData[279] = 0;
  _$jscoverage['/editor/dom.js'].lineData[280] = 0;
  _$jscoverage['/editor/dom.js'].lineData[281] = 0;
  _$jscoverage['/editor/dom.js'].lineData[282] = 0;
  _$jscoverage['/editor/dom.js'].lineData[285] = 0;
  _$jscoverage['/editor/dom.js'].lineData[291] = 0;
  _$jscoverage['/editor/dom.js'].lineData[292] = 0;
  _$jscoverage['/editor/dom.js'].lineData[293] = 0;
  _$jscoverage['/editor/dom.js'].lineData[294] = 0;
  _$jscoverage['/editor/dom.js'].lineData[296] = 0;
  _$jscoverage['/editor/dom.js'].lineData[303] = 0;
  _$jscoverage['/editor/dom.js'].lineData[304] = 0;
  _$jscoverage['/editor/dom.js'].lineData[305] = 0;
  _$jscoverage['/editor/dom.js'].lineData[306] = 0;
  _$jscoverage['/editor/dom.js'].lineData[310] = 0;
  _$jscoverage['/editor/dom.js'].lineData[315] = 0;
  _$jscoverage['/editor/dom.js'].lineData[316] = 0;
  _$jscoverage['/editor/dom.js'].lineData[318] = 0;
  _$jscoverage['/editor/dom.js'].lineData[320] = 0;
  _$jscoverage['/editor/dom.js'].lineData[323] = 0;
  _$jscoverage['/editor/dom.js'].lineData[326] = 0;
  _$jscoverage['/editor/dom.js'].lineData[327] = 0;
  _$jscoverage['/editor/dom.js'].lineData[329] = 0;
  _$jscoverage['/editor/dom.js'].lineData[332] = 0;
  _$jscoverage['/editor/dom.js'].lineData[333] = 0;
  _$jscoverage['/editor/dom.js'].lineData[336] = 0;
  _$jscoverage['/editor/dom.js'].lineData[337] = 0;
  _$jscoverage['/editor/dom.js'].lineData[340] = 0;
  _$jscoverage['/editor/dom.js'].lineData[341] = 0;
  _$jscoverage['/editor/dom.js'].lineData[344] = 0;
  _$jscoverage['/editor/dom.js'].lineData[350] = 0;
  _$jscoverage['/editor/dom.js'].lineData[351] = 0;
  _$jscoverage['/editor/dom.js'].lineData[352] = 0;
  _$jscoverage['/editor/dom.js'].lineData[353] = 0;
  _$jscoverage['/editor/dom.js'].lineData[357] = 0;
  _$jscoverage['/editor/dom.js'].lineData[362] = 0;
  _$jscoverage['/editor/dom.js'].lineData[363] = 0;
  _$jscoverage['/editor/dom.js'].lineData[365] = 0;
  _$jscoverage['/editor/dom.js'].lineData[367] = 0;
  _$jscoverage['/editor/dom.js'].lineData[370] = 0;
  _$jscoverage['/editor/dom.js'].lineData[373] = 0;
  _$jscoverage['/editor/dom.js'].lineData[374] = 0;
  _$jscoverage['/editor/dom.js'].lineData[375] = 0;
  _$jscoverage['/editor/dom.js'].lineData[378] = 0;
  _$jscoverage['/editor/dom.js'].lineData[379] = 0;
  _$jscoverage['/editor/dom.js'].lineData[382] = 0;
  _$jscoverage['/editor/dom.js'].lineData[383] = 0;
  _$jscoverage['/editor/dom.js'].lineData[386] = 0;
  _$jscoverage['/editor/dom.js'].lineData[387] = 0;
  _$jscoverage['/editor/dom.js'].lineData[390] = 0;
  _$jscoverage['/editor/dom.js'].lineData[397] = 0;
  _$jscoverage['/editor/dom.js'].lineData[399] = 0;
  _$jscoverage['/editor/dom.js'].lineData[400] = 0;
  _$jscoverage['/editor/dom.js'].lineData[403] = 0;
  _$jscoverage['/editor/dom.js'].lineData[404] = 0;
  _$jscoverage['/editor/dom.js'].lineData[407] = 0;
  _$jscoverage['/editor/dom.js'].lineData[409] = 0;
  _$jscoverage['/editor/dom.js'].lineData[410] = 0;
  _$jscoverage['/editor/dom.js'].lineData[411] = 0;
  _$jscoverage['/editor/dom.js'].lineData[415] = 0;
  _$jscoverage['/editor/dom.js'].lineData[421] = 0;
  _$jscoverage['/editor/dom.js'].lineData[422] = 0;
  _$jscoverage['/editor/dom.js'].lineData[423] = 0;
  _$jscoverage['/editor/dom.js'].lineData[424] = 0;
  _$jscoverage['/editor/dom.js'].lineData[430] = 0;
  _$jscoverage['/editor/dom.js'].lineData[431] = 0;
  _$jscoverage['/editor/dom.js'].lineData[433] = 0;
  _$jscoverage['/editor/dom.js'].lineData[435] = 0;
  _$jscoverage['/editor/dom.js'].lineData[436] = 0;
  _$jscoverage['/editor/dom.js'].lineData[440] = 0;
  _$jscoverage['/editor/dom.js'].lineData[443] = 0;
  _$jscoverage['/editor/dom.js'].lineData[444] = 0;
  _$jscoverage['/editor/dom.js'].lineData[448] = 0;
  _$jscoverage['/editor/dom.js'].lineData[456] = 0;
  _$jscoverage['/editor/dom.js'].lineData[458] = 0;
  _$jscoverage['/editor/dom.js'].lineData[459] = 0;
  _$jscoverage['/editor/dom.js'].lineData[464] = 0;
  _$jscoverage['/editor/dom.js'].lineData[465] = 0;
  _$jscoverage['/editor/dom.js'].lineData[469] = 0;
  _$jscoverage['/editor/dom.js'].lineData[471] = 0;
  _$jscoverage['/editor/dom.js'].lineData[472] = 0;
  _$jscoverage['/editor/dom.js'].lineData[475] = 0;
  _$jscoverage['/editor/dom.js'].lineData[476] = 0;
  _$jscoverage['/editor/dom.js'].lineData[479] = 0;
  _$jscoverage['/editor/dom.js'].lineData[480] = 0;
  _$jscoverage['/editor/dom.js'].lineData[490] = 0;
  _$jscoverage['/editor/dom.js'].lineData[495] = 0;
  _$jscoverage['/editor/dom.js'].lineData[496] = 0;
  _$jscoverage['/editor/dom.js'].lineData[497] = 0;
  _$jscoverage['/editor/dom.js'].lineData[503] = 0;
  _$jscoverage['/editor/dom.js'].lineData[511] = 0;
  _$jscoverage['/editor/dom.js'].lineData[515] = 0;
  _$jscoverage['/editor/dom.js'].lineData[516] = 0;
  _$jscoverage['/editor/dom.js'].lineData[517] = 0;
  _$jscoverage['/editor/dom.js'].lineData[520] = 0;
  _$jscoverage['/editor/dom.js'].lineData[526] = 0;
  _$jscoverage['/editor/dom.js'].lineData[527] = 0;
  _$jscoverage['/editor/dom.js'].lineData[528] = 0;
  _$jscoverage['/editor/dom.js'].lineData[530] = 0;
  _$jscoverage['/editor/dom.js'].lineData[531] = 0;
  _$jscoverage['/editor/dom.js'].lineData[534] = 0;
  _$jscoverage['/editor/dom.js'].lineData[536] = 0;
  _$jscoverage['/editor/dom.js'].lineData[542] = 0;
  _$jscoverage['/editor/dom.js'].lineData[543] = 0;
  _$jscoverage['/editor/dom.js'].lineData[549] = 0;
  _$jscoverage['/editor/dom.js'].lineData[550] = 0;
  _$jscoverage['/editor/dom.js'].lineData[551] = 0;
  _$jscoverage['/editor/dom.js'].lineData[552] = 0;
  _$jscoverage['/editor/dom.js'].lineData[555] = 0;
  _$jscoverage['/editor/dom.js'].lineData[556] = 0;
  _$jscoverage['/editor/dom.js'].lineData[557] = 0;
  _$jscoverage['/editor/dom.js'].lineData[559] = 0;
  _$jscoverage['/editor/dom.js'].lineData[560] = 0;
  _$jscoverage['/editor/dom.js'].lineData[562] = 0;
  _$jscoverage['/editor/dom.js'].lineData[565] = 0;
  _$jscoverage['/editor/dom.js'].lineData[572] = 0;
  _$jscoverage['/editor/dom.js'].lineData[573] = 0;
  _$jscoverage['/editor/dom.js'].lineData[574] = 0;
  _$jscoverage['/editor/dom.js'].lineData[575] = 0;
  _$jscoverage['/editor/dom.js'].lineData[577] = 0;
  _$jscoverage['/editor/dom.js'].lineData[578] = 0;
  _$jscoverage['/editor/dom.js'].lineData[579] = 0;
  _$jscoverage['/editor/dom.js'].lineData[580] = 0;
  _$jscoverage['/editor/dom.js'].lineData[581] = 0;
  _$jscoverage['/editor/dom.js'].lineData[584] = 0;
  _$jscoverage['/editor/dom.js'].lineData[587] = 0;
  _$jscoverage['/editor/dom.js'].lineData[590] = 0;
  _$jscoverage['/editor/dom.js'].lineData[591] = 0;
  _$jscoverage['/editor/dom.js'].lineData[592] = 0;
  _$jscoverage['/editor/dom.js'].lineData[595] = 0;
  _$jscoverage['/editor/dom.js'].lineData[603] = 0;
  _$jscoverage['/editor/dom.js'].lineData[606] = 0;
  _$jscoverage['/editor/dom.js'].lineData[609] = 0;
  _$jscoverage['/editor/dom.js'].lineData[612] = 0;
  _$jscoverage['/editor/dom.js'].lineData[615] = 0;
  _$jscoverage['/editor/dom.js'].lineData[621] = 0;
  _$jscoverage['/editor/dom.js'].lineData[627] = 0;
  _$jscoverage['/editor/dom.js'].lineData[628] = 0;
  _$jscoverage['/editor/dom.js'].lineData[632] = 0;
  _$jscoverage['/editor/dom.js'].lineData[633] = 0;
  _$jscoverage['/editor/dom.js'].lineData[634] = 0;
  _$jscoverage['/editor/dom.js'].lineData[640] = 0;
  _$jscoverage['/editor/dom.js'].lineData[641] = 0;
  _$jscoverage['/editor/dom.js'].lineData[643] = 0;
  _$jscoverage['/editor/dom.js'].lineData[644] = 0;
  _$jscoverage['/editor/dom.js'].lineData[646] = 0;
  _$jscoverage['/editor/dom.js'].lineData[647] = 0;
  _$jscoverage['/editor/dom.js'].lineData[648] = 0;
  _$jscoverage['/editor/dom.js'].lineData[649] = 0;
  _$jscoverage['/editor/dom.js'].lineData[656] = 0;
  _$jscoverage['/editor/dom.js'].lineData[657] = 0;
  _$jscoverage['/editor/dom.js'].lineData[658] = 0;
  _$jscoverage['/editor/dom.js'].lineData[660] = 0;
  _$jscoverage['/editor/dom.js'].lineData[663] = 0;
  _$jscoverage['/editor/dom.js'].lineData[668] = 0;
  _$jscoverage['/editor/dom.js'].lineData[669] = 0;
  _$jscoverage['/editor/dom.js'].lineData[672] = 0;
  _$jscoverage['/editor/dom.js'].lineData[673] = 0;
  _$jscoverage['/editor/dom.js'].lineData[676] = 0;
  _$jscoverage['/editor/dom.js'].lineData[678] = 0;
  _$jscoverage['/editor/dom.js'].lineData[679] = 0;
  _$jscoverage['/editor/dom.js'].lineData[680] = 0;
  _$jscoverage['/editor/dom.js'].lineData[682] = 0;
  _$jscoverage['/editor/dom.js'].lineData[687] = 0;
  _$jscoverage['/editor/dom.js'].lineData[688] = 0;
  _$jscoverage['/editor/dom.js'].lineData[695] = 0;
  _$jscoverage['/editor/dom.js'].lineData[699] = 0;
  _$jscoverage['/editor/dom.js'].lineData[704] = 0;
  _$jscoverage['/editor/dom.js'].lineData[706] = 0;
  _$jscoverage['/editor/dom.js'].lineData[707] = 0;
  _$jscoverage['/editor/dom.js'].lineData[709] = 0;
  _$jscoverage['/editor/dom.js'].lineData[710] = 0;
  _$jscoverage['/editor/dom.js'].lineData[711] = 0;
  _$jscoverage['/editor/dom.js'].lineData[714] = 0;
  _$jscoverage['/editor/dom.js'].lineData[716] = 0;
  _$jscoverage['/editor/dom.js'].lineData[717] = 0;
  _$jscoverage['/editor/dom.js'].lineData[719] = 0;
  _$jscoverage['/editor/dom.js'].lineData[723] = 0;
  _$jscoverage['/editor/dom.js'].lineData[726] = 0;
  _$jscoverage['/editor/dom.js'].lineData[728] = 0;
  _$jscoverage['/editor/dom.js'].lineData[729] = 0;
  _$jscoverage['/editor/dom.js'].lineData[730] = 0;
  _$jscoverage['/editor/dom.js'].lineData[735] = 0;
  _$jscoverage['/editor/dom.js'].lineData[739] = 0;
  _$jscoverage['/editor/dom.js'].lineData[740] = 0;
  _$jscoverage['/editor/dom.js'].lineData[742] = 0;
  _$jscoverage['/editor/dom.js'].lineData[746] = 0;
  _$jscoverage['/editor/dom.js'].lineData[748] = 0;
  _$jscoverage['/editor/dom.js'].lineData[749] = 0;
  _$jscoverage['/editor/dom.js'].lineData[750] = 0;
  _$jscoverage['/editor/dom.js'].lineData[751] = 0;
  _$jscoverage['/editor/dom.js'].lineData[752] = 0;
  _$jscoverage['/editor/dom.js'].lineData[756] = 0;
  _$jscoverage['/editor/dom.js'].lineData[759] = 0;
  _$jscoverage['/editor/dom.js'].lineData[762] = 0;
  _$jscoverage['/editor/dom.js'].lineData[763] = 0;
  _$jscoverage['/editor/dom.js'].lineData[766] = 0;
  _$jscoverage['/editor/dom.js'].lineData[767] = 0;
  _$jscoverage['/editor/dom.js'].lineData[770] = 0;
  _$jscoverage['/editor/dom.js'].lineData[771] = 0;
  _$jscoverage['/editor/dom.js'].lineData[777] = 0;
}
if (! _$jscoverage['/editor/dom.js'].functionData) {
  _$jscoverage['/editor/dom.js'].functionData = [];
  _$jscoverage['/editor/dom.js'].functionData[0] = 0;
  _$jscoverage['/editor/dom.js'].functionData[1] = 0;
  _$jscoverage['/editor/dom.js'].functionData[2] = 0;
  _$jscoverage['/editor/dom.js'].functionData[3] = 0;
  _$jscoverage['/editor/dom.js'].functionData[4] = 0;
  _$jscoverage['/editor/dom.js'].functionData[5] = 0;
  _$jscoverage['/editor/dom.js'].functionData[6] = 0;
  _$jscoverage['/editor/dom.js'].functionData[7] = 0;
  _$jscoverage['/editor/dom.js'].functionData[8] = 0;
  _$jscoverage['/editor/dom.js'].functionData[9] = 0;
  _$jscoverage['/editor/dom.js'].functionData[10] = 0;
  _$jscoverage['/editor/dom.js'].functionData[11] = 0;
  _$jscoverage['/editor/dom.js'].functionData[12] = 0;
  _$jscoverage['/editor/dom.js'].functionData[13] = 0;
  _$jscoverage['/editor/dom.js'].functionData[14] = 0;
  _$jscoverage['/editor/dom.js'].functionData[15] = 0;
  _$jscoverage['/editor/dom.js'].functionData[16] = 0;
  _$jscoverage['/editor/dom.js'].functionData[17] = 0;
  _$jscoverage['/editor/dom.js'].functionData[18] = 0;
  _$jscoverage['/editor/dom.js'].functionData[19] = 0;
  _$jscoverage['/editor/dom.js'].functionData[20] = 0;
  _$jscoverage['/editor/dom.js'].functionData[21] = 0;
  _$jscoverage['/editor/dom.js'].functionData[22] = 0;
  _$jscoverage['/editor/dom.js'].functionData[23] = 0;
  _$jscoverage['/editor/dom.js'].functionData[24] = 0;
  _$jscoverage['/editor/dom.js'].functionData[25] = 0;
  _$jscoverage['/editor/dom.js'].functionData[26] = 0;
  _$jscoverage['/editor/dom.js'].functionData[27] = 0;
  _$jscoverage['/editor/dom.js'].functionData[28] = 0;
  _$jscoverage['/editor/dom.js'].functionData[29] = 0;
  _$jscoverage['/editor/dom.js'].functionData[30] = 0;
  _$jscoverage['/editor/dom.js'].functionData[31] = 0;
  _$jscoverage['/editor/dom.js'].functionData[32] = 0;
}
if (! _$jscoverage['/editor/dom.js'].branchData) {
  _$jscoverage['/editor/dom.js'].branchData = {};
  _$jscoverage['/editor/dom.js'].branchData['88'] = [];
  _$jscoverage['/editor/dom.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['88'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['98'] = [];
  _$jscoverage['/editor/dom.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['98'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['104'] = [];
  _$jscoverage['/editor/dom.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['113'] = [];
  _$jscoverage['/editor/dom.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['117'] = [];
  _$jscoverage['/editor/dom.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['118'] = [];
  _$jscoverage['/editor/dom.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['118'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['119'] = [];
  _$jscoverage['/editor/dom.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['120'] = [];
  _$jscoverage['/editor/dom.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['126'] = [];
  _$jscoverage['/editor/dom.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['137'] = [];
  _$jscoverage['/editor/dom.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['147'] = [];
  _$jscoverage['/editor/dom.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['153'] = [];
  _$jscoverage['/editor/dom.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['163'] = [];
  _$jscoverage['/editor/dom.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['167'] = [];
  _$jscoverage['/editor/dom.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['170'] = [];
  _$jscoverage['/editor/dom.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['171'] = [];
  _$jscoverage['/editor/dom.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['179'] = [];
  _$jscoverage['/editor/dom.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['180'] = [];
  _$jscoverage['/editor/dom.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['183'] = [];
  _$jscoverage['/editor/dom.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['184'] = [];
  _$jscoverage['/editor/dom.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['195'] = [];
  _$jscoverage['/editor/dom.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['199'] = [];
  _$jscoverage['/editor/dom.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['203'] = [];
  _$jscoverage['/editor/dom.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['203'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['208'] = [];
  _$jscoverage['/editor/dom.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['208'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['208'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['209'] = [];
  _$jscoverage['/editor/dom.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['209'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['220'] = [];
  _$jscoverage['/editor/dom.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['226'] = [];
  _$jscoverage['/editor/dom.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['247'] = [];
  _$jscoverage['/editor/dom.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['258'] = [];
  _$jscoverage['/editor/dom.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['264'] = [];
  _$jscoverage['/editor/dom.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['264'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['279'] = [];
  _$jscoverage['/editor/dom.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['303'] = [];
  _$jscoverage['/editor/dom.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['306'] = [];
  _$jscoverage['/editor/dom.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['310'] = [];
  _$jscoverage['/editor/dom.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['315'] = [];
  _$jscoverage['/editor/dom.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['316'] = [];
  _$jscoverage['/editor/dom.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['316'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['317'] = [];
  _$jscoverage['/editor/dom.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['317'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['323'] = [];
  _$jscoverage['/editor/dom.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['326'] = [];
  _$jscoverage['/editor/dom.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['326'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['332'] = [];
  _$jscoverage['/editor/dom.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['336'] = [];
  _$jscoverage['/editor/dom.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['336'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['340'] = [];
  _$jscoverage['/editor/dom.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['340'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['350'] = [];
  _$jscoverage['/editor/dom.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['353'] = [];
  _$jscoverage['/editor/dom.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['357'] = [];
  _$jscoverage['/editor/dom.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['362'] = [];
  _$jscoverage['/editor/dom.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['363'] = [];
  _$jscoverage['/editor/dom.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['363'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['364'] = [];
  _$jscoverage['/editor/dom.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['364'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['370'] = [];
  _$jscoverage['/editor/dom.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['373'] = [];
  _$jscoverage['/editor/dom.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['373'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['378'] = [];
  _$jscoverage['/editor/dom.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['382'] = [];
  _$jscoverage['/editor/dom.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['382'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['386'] = [];
  _$jscoverage['/editor/dom.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['386'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['399'] = [];
  _$jscoverage['/editor/dom.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['403'] = [];
  _$jscoverage['/editor/dom.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['410'] = [];
  _$jscoverage['/editor/dom.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['419'] = [];
  _$jscoverage['/editor/dom.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['422'] = [];
  _$jscoverage['/editor/dom.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['430'] = [];
  _$jscoverage['/editor/dom.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['435'] = [];
  _$jscoverage['/editor/dom.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['443'] = [];
  _$jscoverage['/editor/dom.js'].branchData['443'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['458'] = [];
  _$jscoverage['/editor/dom.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['464'] = [];
  _$jscoverage['/editor/dom.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['469'] = [];
  _$jscoverage['/editor/dom.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['469'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['470'] = [];
  _$jscoverage['/editor/dom.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['471'] = [];
  _$jscoverage['/editor/dom.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['475'] = [];
  _$jscoverage['/editor/dom.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['479'] = [];
  _$jscoverage['/editor/dom.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['480'] = [];
  _$jscoverage['/editor/dom.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['480'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['480'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['482'] = [];
  _$jscoverage['/editor/dom.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['495'] = [];
  _$jscoverage['/editor/dom.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['496'] = [];
  _$jscoverage['/editor/dom.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['497'] = [];
  _$jscoverage['/editor/dom.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['503'] = [];
  _$jscoverage['/editor/dom.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['515'] = [];
  _$jscoverage['/editor/dom.js'].branchData['515'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['515'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['527'] = [];
  _$jscoverage['/editor/dom.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['528'] = [];
  _$jscoverage['/editor/dom.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['551'] = [];
  _$jscoverage['/editor/dom.js'].branchData['551'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['555'] = [];
  _$jscoverage['/editor/dom.js'].branchData['555'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['559'] = [];
  _$jscoverage['/editor/dom.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['574'] = [];
  _$jscoverage['/editor/dom.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['577'] = [];
  _$jscoverage['/editor/dom.js'].branchData['577'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['580'] = [];
  _$jscoverage['/editor/dom.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['590'] = [];
  _$jscoverage['/editor/dom.js'].branchData['590'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['592'] = [];
  _$jscoverage['/editor/dom.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['593'] = [];
  _$jscoverage['/editor/dom.js'].branchData['593'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['593'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['594'] = [];
  _$jscoverage['/editor/dom.js'].branchData['594'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['606'] = [];
  _$jscoverage['/editor/dom.js'].branchData['606'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['607'] = [];
  _$jscoverage['/editor/dom.js'].branchData['607'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['607'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['612'] = [];
  _$jscoverage['/editor/dom.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['613'] = [];
  _$jscoverage['/editor/dom.js'].branchData['613'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['613'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['614'] = [];
  _$jscoverage['/editor/dom.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['628'] = [];
  _$jscoverage['/editor/dom.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['630'] = [];
  _$jscoverage['/editor/dom.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['647'] = [];
  _$jscoverage['/editor/dom.js'].branchData['647'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['658'] = [];
  _$jscoverage['/editor/dom.js'].branchData['658'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['660'] = [];
  _$jscoverage['/editor/dom.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['668'] = [];
  _$jscoverage['/editor/dom.js'].branchData['668'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['672'] = [];
  _$jscoverage['/editor/dom.js'].branchData['672'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['672'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['676'] = [];
  _$jscoverage['/editor/dom.js'].branchData['676'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['677'] = [];
  _$jscoverage['/editor/dom.js'].branchData['677'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['677'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['677'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['679'] = [];
  _$jscoverage['/editor/dom.js'].branchData['679'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['687'] = [];
  _$jscoverage['/editor/dom.js'].branchData['687'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['696'] = [];
  _$jscoverage['/editor/dom.js'].branchData['696'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['697'] = [];
  _$jscoverage['/editor/dom.js'].branchData['697'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['699'] = [];
  _$jscoverage['/editor/dom.js'].branchData['699'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['706'] = [];
  _$jscoverage['/editor/dom.js'].branchData['706'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['706'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['709'] = [];
  _$jscoverage['/editor/dom.js'].branchData['709'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['716'] = [];
  _$jscoverage['/editor/dom.js'].branchData['716'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['719'] = [];
  _$jscoverage['/editor/dom.js'].branchData['719'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['719'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['720'] = [];
  _$jscoverage['/editor/dom.js'].branchData['720'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['720'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['721'] = [];
  _$jscoverage['/editor/dom.js'].branchData['721'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['722'] = [];
  _$jscoverage['/editor/dom.js'].branchData['722'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['728'] = [];
  _$jscoverage['/editor/dom.js'].branchData['728'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['742'] = [];
  _$jscoverage['/editor/dom.js'].branchData['742'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['742'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['748'] = [];
  _$jscoverage['/editor/dom.js'].branchData['748'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['751'] = [];
  _$jscoverage['/editor/dom.js'].branchData['751'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['756'] = [];
  _$jscoverage['/editor/dom.js'].branchData['756'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['770'] = [];
  _$jscoverage['/editor/dom.js'].branchData['770'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['770'][2] = new BranchData();
}
_$jscoverage['/editor/dom.js'].branchData['770'][2].init(682, 49, 'innerSibling[0].nodeType == NodeType.ELEMENT_NODE');
function visit208_770_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['770'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['770'][1].init(663, 68, 'innerSibling[0] && innerSibling[0].nodeType == NodeType.ELEMENT_NODE');
function visit207_770_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['770'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['756'][1].init(529, 43, 'element._4e_isIdentical(sibling, undefined)');
function visit206_756_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['756'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['751'][1].init(157, 8, '!sibling');
function visit205_751_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['751'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['748'][1].init(203, 77, 'sibling.attr(\'_ke_bookmark\') || sibling._4e_isEmptyInlineRemovable(undefined)');
function visit204_748_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['748'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['742'][2].init(96, 44, 'sibling[0].nodeType == NodeType.ELEMENT_NODE');
function visit203_742_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['742'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['742'][1].init(85, 55, 'sibling && sibling[0].nodeType == NodeType.ELEMENT_NODE');
function visit202_742_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['742'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['728'][1].init(429, 22, 'currentIndex == target');
function visit201_728_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['728'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['722'][1].init(56, 39, 'candidate.previousSibling.nodeType == 3');
function visit200_722_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['722'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['721'][1].init(54, 96, 'candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit199_721_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['721'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['720'][2].init(142, 23, 'candidate.nodeType == 3');
function visit198_720_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['720'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['720'][1].init(50, 151, 'candidate.nodeType == 3 && candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit197_720_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['720'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['719'][2].init(89, 19, 'normalized === TRUE');
function visit196_719_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['719'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['719'][1].init(89, 202, 'normalized === TRUE && candidate.nodeType == 3 && candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit195_719_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['719'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['716'][1].init(277, 23, 'j < $.childNodes.length');
function visit194_716_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['716'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['709'][1].init(73, 11, '!normalized');
function visit193_709_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['709'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['706'][2].init(84, 18, 'i < address.length');
function visit192_706_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['706'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['706'][1].init(79, 23, '$ && i < address.length');
function visit191_706_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['706'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['699'][1].init(324, 19, 'dtd && dtd[\'#text\']');
function visit190_699_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['699'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['697'][1].init(60, 38, 'xhtml_dtd[name] || xhtml_dtd["span"]');
function visit189_697_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['697'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['696'][1].init(54, 101, '!xhtml_dtd.$nonEditable[name] && (xhtml_dtd[name] || xhtml_dtd["span"])');
function visit188_696_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['696'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['687'][1].init(1442, 23, 'el.style.cssText !== \'\'');
function visit187_687_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['687'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['679'][1].init(89, 18, 'attrValue === NULL');
function visit186_679_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['679'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['677'][3].init(79, 19, 'attrName == \'value\'');
function visit185_677_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['677'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['677'][2].init(60, 38, 'attribute.value && attrName == \'value\'');
function visit184_677_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['677'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['677'][1].init(48, 50, 'UA[\'ie\'] && attribute.value && attrName == \'value\'');
function visit183_677_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['677'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['676'][1].init(783, 101, 'attribute.specified || (UA[\'ie\'] && attribute.value && attrName == \'value\')');
function visit182_676_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['676'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['672'][2].init(521, 21, 'attrName == \'checked\'');
function visit181_672_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['672'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['672'][1].init(521, 63, 'attrName == \'checked\' && (attrValue = Dom.attr(el, attrName))');
function visit180_672_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['672'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['668'][1].init(410, 26, 'attrName in skipAttributes');
function visit179_668_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['668'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['660'][1].init(180, 21, 'n < attributes.length');
function visit178_660_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['658'][1].init(125, 20, 'skipAttributes || {}');
function visit177_658_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['647'][1].init(343, 18, 'removeFromDatabase');
function visit176_647_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['647'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['630'][1].init(168, 127, 'element.data(\'list_marker_names\') || (element.data(\'list_marker_names\', {}).data(\'list_marker_names\'))');
function visit175_630_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['628'][1].init(71, 124, 'element.data(\'list_marker_id\') || (element.data(\'list_marker_id\', S.guid()).data(\'list_marker_id\'))');
function visit174_628_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['614'][1].init(67, 32, 'Dom.nodeName(lastChild) !== \'br\'');
function visit173_614_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['613'][2].init(390, 44, 'lastChild.nodeType == Dom.NodeType.TEXT_NODE');
function visit172_613_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['613'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['613'][1].init(33, 100, 'lastChild.nodeType == Dom.NodeType.TEXT_NODE || Dom.nodeName(lastChild) !== \'br\'');
function visit171_613_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['613'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['612'][1].init(354, 134, '!lastChild || lastChild.nodeType == Dom.NodeType.TEXT_NODE || Dom.nodeName(lastChild) !== \'br\'');
function visit170_612_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['607'][2].init(158, 44, 'lastChild.nodeType == Dom.NodeType.TEXT_NODE');
function visit169_607_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['607'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['607'][1].init(32, 96, 'lastChild.nodeType == Dom.NodeType.TEXT_NODE && !S.trim(lastChild.nodeValue)');
function visit168_607_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['607'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['606'][1].init(123, 129, 'lastChild && lastChild.nodeType == Dom.NodeType.TEXT_NODE && !S.trim(lastChild.nodeValue)');
function visit167_606_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['606'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['594'][1].init(46, 27, 'Dom.nodeName(child) == \'br\'');
function visit166_594_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['594'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['593'][2].init(102, 19, 'child.nodeType == 1');
function visit165_593_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['593'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['593'][1].init(32, 74, 'child.nodeType == 1 && Dom.nodeName(child) == \'br\'');
function visit164_593_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['593'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['592'][1].init(67, 107, 'child && child.nodeType == 1 && Dom.nodeName(child) == \'br\'');
function visit163_592_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['590'][1].init(852, 22, '!UA[\'ie\'] && !UA.opera');
function visit162_590_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['590'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['580'][1].init(303, 31, 'trimmed.length < originalLength');
function visit161_580_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['577'][1].init(166, 8, '!trimmed');
function visit160_577_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['574'][1].init(25, 36, 'child.type == Dom.NodeType.TEXT_NODE');
function visit159_574_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['559'][1].init(328, 31, 'trimmed.length < originalLength');
function visit158_559_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['555'][1].init(167, 8, '!trimmed');
function visit157_555_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['555'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['551'][1].init(25, 40, 'child.nodeType == Dom.NodeType.TEXT_NODE');
function visit156_551_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['551'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['528'][1].init(25, 16, 'preserveChildren');
function visit155_528_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['527'][1].init(65, 6, 'parent');
function visit154_527_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['515'][2].init(171, 24, 'node != $documentElement');
function visit153_515_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['515'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['515'][1].init(163, 32, 'node && node != $documentElement');
function visit152_515_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['503'][1].init(2109, 44, 'addressOfThis.length < addressOfOther.length');
function visit151_503_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['497'][1].init(32, 40, 'addressOfThis[i] < addressOfOther[i]');
function visit150_497_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['496'][1].init(25, 41, 'addressOfThis[i] != addressOfOther[i]');
function visit149_496_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['495'][1].init(1733, 17, 'i <= minLevel - 1');
function visit148_495_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['482'][1].init(134, 35, 'el.sourceIndex < $other.sourceIndex');
function visit147_482_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['480'][3].init(56, 22, '$other.sourceIndex < 0');
function visit146_480_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['480'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['480'][2].init(34, 18, 'el.sourceIndex < 0');
function visit145_480_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['480'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['480'][1].init(34, 44, 'el.sourceIndex < 0 || $other.sourceIndex < 0');
function visit144_480_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['479'][1].init(337, 19, '\'sourceIndex\' in el');
function visit143_479_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['475'][1].init(179, 24, 'Dom.contains($other, el)');
function visit142_475_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['471'][1].init(25, 24, 'Dom.contains(el, $other)');
function visit141_471_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['470'][1].init(59, 40, '$other.nodeType == NodeType.ELEMENT_NODE');
function visit140_470_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['469'][2].init(464, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit139_469_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['469'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['469'][1].init(464, 100, 'el.nodeType == NodeType.ELEMENT_NODE && $other.nodeType == NodeType.ELEMENT_NODE');
function visit138_469_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['464'][1].init(286, 12, 'el == $other');
function visit137_464_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['458'][1].init(75, 26, 'el.compareDocumentPosition');
function visit136_458_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['443'][1].init(57, 8, 'UA.gecko');
function visit135_443_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['443'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['435'][1].init(45, 19, 'attribute.specified');
function visit134_435_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['430'][1].init(434, 24, 'el.getAttribute(\'class\')');
function visit133_430_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['422'][1].init(89, 21, 'i < attributes.length');
function visit132_422_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['419'][1].init(11674, 13, 'UA.ieMode < 9');
function visit131_419_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['410'][1].init(25, 25, 'Dom.contains(start, node)');
function visit130_410_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['403'][1].init(150, 22, 'Dom.contains(node, el)');
function visit129_403_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['399'][1].init(65, 11, 'el === node');
function visit128_399_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['386'][2].init(1402, 25, 'node.nodeType != nodeType');
function visit127_386_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['386'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['386'][1].init(1390, 37, 'nodeType && node.nodeType != nodeType');
function visit126_386_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['382'][2].init(1293, 21, 'guard(node) === FALSE');
function visit125_382_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['382'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['382'][1].init(1284, 30, 'guard && guard(node) === FALSE');
function visit124_382_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['378'][1].init(1203, 5, '!node');
function visit123_378_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['373'][2].init(176, 29, 'guard(parent, TRUE) === FALSE');
function visit122_373_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['373'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['373'][1].init(167, 38, 'guard && guard(parent, TRUE) === FALSE');
function visit121_373_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['370'][1].init(827, 39, '!node && (parent = parent.parentNode)');
function visit120_370_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['364'][2].init(100, 25, 'guard(el, TRUE) === FALSE');
function visit119_364_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['364'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['364'][1].init(63, 34, 'guard && guard(el, TRUE) === FALSE');
function visit118_364_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['363'][2].init(25, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit117_363_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['363'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['363'][1].init(25, 98, 'el.nodeType == NodeType.ELEMENT_NODE && guard && guard(el, TRUE) === FALSE');
function visit116_363_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['362'][1].init(544, 5, '!node');
function visit115_362_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['357'][1].init(267, 33, '!startFromSibling && el.lastChild');
function visit114_357_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['353'][1].init(32, 18, 'node !== guardNode');
function visit113_353_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['350'][1].init(21, 20, 'guard && !guard.call');
function visit112_350_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['340'][2].init(1488, 25, 'nodeType != node.nodeType');
function visit111_340_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['340'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['340'][1].init(1476, 37, 'nodeType && nodeType != node.nodeType');
function visit110_340_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['336'][2].init(1379, 21, 'guard(node) === FALSE');
function visit109_336_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['336'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['336'][1].init(1370, 30, 'guard && guard(node) === FALSE');
function visit108_336_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['332'][1].init(1289, 5, '!node');
function visit107_332_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['326'][2].init(176, 29, 'guard(parent, TRUE) === FALSE');
function visit106_326_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['326'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['326'][1].init(167, 38, 'guard && guard(parent, TRUE) === FALSE');
function visit105_326_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['323'][1].init(894, 38, '!node && (parent = parent.parentNode)');
function visit104_323_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['317'][2].init(100, 25, 'guard(el, TRUE) === FALSE');
function visit103_317_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['317'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['317'][1].init(63, 34, 'guard && guard(el, TRUE) === FALSE');
function visit102_317_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['316'][2].init(25, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit101_316_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['316'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['316'][1].init(25, 98, 'el.nodeType == NodeType.ELEMENT_NODE && guard && guard(el, TRUE) === FALSE');
function visit100_316_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['315'][1].init(615, 5, '!node');
function visit99_315_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['310'][1].init(336, 34, '!startFromSibling && el.firstChild');
function visit98_310_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['306'][1].init(32, 18, 'node !== guardNode');
function visit97_306_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['303'][1].init(90, 20, 'guard && !guard.call');
function visit96_303_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['279'][1].init(1055, 20, '!!(doc.documentMode)');
function visit95_279_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['264'][2].init(388, 29, 'offset == el.nodeValue.length');
function visit94_264_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['264'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['264'][1].init(376, 41, 'UA[\'ie\'] && offset == el.nodeValue.length');
function visit93_264_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['258'][1].init(66, 37, 'el.nodeType != Dom.NodeType.TEXT_NODE');
function visit92_258_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['247'][1].init(108, 36, 'REMOVE_EMPTY[thisElement.nodeName()]');
function visit91_247_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['226'][1].init(188, 7, 'toStart');
function visit90_226_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['220'][1].init(68, 21, 'thisElement == target');
function visit89_220_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['209'][2].init(407, 34, 'nodeType == Dom.NodeType.TEXT_NODE');
function visit88_209_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['209'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['209'][1].init(102, 61, 'nodeType == Dom.NodeType.TEXT_NODE && S.trim(child.nodeValue)');
function visit87_209_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['208'][3].init(302, 33, 'nodeType == NodeType.ELEMENT_NODE');
function visit86_208_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['208'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['208'][2].init(302, 75, 'nodeType == NodeType.ELEMENT_NODE && !Dom._4e_isEmptyInlineRemovable(child)');
function visit85_208_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['208'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['208'][1].init(302, 164, 'nodeType == NodeType.ELEMENT_NODE && !Dom._4e_isEmptyInlineRemovable(child) || nodeType == Dom.NodeType.TEXT_NODE && S.trim(child.nodeValue)');
function visit84_208_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['203'][2].init(122, 33, 'nodeType == NodeType.ELEMENT_NODE');
function visit83_203_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['203'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['203'][1].init(122, 95, 'nodeType == NodeType.ELEMENT_NODE && child.getAttribute(\'_ke_bookmark\')');
function visit82_203_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['199'][1].init(239, 9, 'i < count');
function visit81_199_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['195'][1].init(21, 50, '!xhtml_dtd.$removeEmpty[Dom.nodeName(thisElement)]');
function visit80_195_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['184'][1].init(50, 59, 'Dom.attr(thisElement, name) != Dom.attr(otherElement, name)');
function visit79_184_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['183'][1].init(134, 110, 'attribute.specified && Dom.attr(thisElement, name) != Dom.attr(otherElement, name)');
function visit78_183_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['180'][1].init(33, 15, 'i < otherLength');
function visit77_180_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['179'][1].init(1207, 13, 'UA.ieMode < 8');
function visit76_179_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['171'][1].init(46, 59, 'Dom.attr(thisElement, name) != Dom.attr(otherElement, name)');
function visit75_171_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['170'][1].init(127, 106, 'attribute.specified && Dom.attr(thisElement, name) != Dom.attr(otherElement, name)');
function visit74_170_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['167'][1].init(656, 14, 'i < thisLength');
function visit73_167_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['163'][1].init(542, 25, 'thisLength != otherLength');
function visit72_163_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['153'][1].init(170, 55, 'Dom.nodeName(thisElement) != Dom.nodeName(otherElement)');
function visit71_153_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['147'][1].init(21, 13, '!otherElement');
function visit70_147_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['137'][1].init(67, 7, 'toStart');
function visit69_137_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['126'][1].init(408, 16, 'candidate === el');
function visit68_126_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['120'][1].init(52, 39, 'candidate.previousSibling.nodeType == 3');
function visit67_120_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['119'][1].init(50, 92, 'candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit66_119_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['118'][2].init(145, 23, 'candidate.nodeType == 3');
function visit65_118_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['118'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['118'][1].init(37, 143, 'candidate.nodeType == 3 && candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit64_118_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['117'][1].init(105, 181, 'normalized && candidate.nodeType == 3 && candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit63_117_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['113'][1].init(161, 19, 'i < siblings.length');
function visit62_113_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['104'][1].init(119, 90, 'blockBoundaryDisplayMatch[Dom.css(el, \'display\')] || nodeNameMatches[Dom.nodeName(el)]');
function visit61_104_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['98'][2].init(113, 21, 'e1p == el2.parentNode');
function visit60_98_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['98'][1].init(106, 28, 'e1p && e1p == el2.parentNode');
function visit59_98_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['88'][2].init(27, 11, 'el[0] || el');
function visit58_88_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['88'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['88'][1].init(20, 19, 'el && (el[0] || el)');
function visit57_88_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/dom.js'].functionData[0]++;
  _$jscoverage['/editor/dom.js'].lineData[11]++;
  var Node = require('node');
  _$jscoverage['/editor/dom.js'].lineData[12]++;
  var Editor = require('./base');
  _$jscoverage['/editor/dom.js'].lineData[13]++;
  var Utils = require('./utils');
  _$jscoverage['/editor/dom.js'].lineData[14]++;
  var TRUE = true, undefined = undefined, FALSE = false, NULL = null, xhtml_dtd = Editor.XHTML_DTD, Dom = S.DOM, NodeType = Dom.NodeType, UA = S.UA, REMOVE_EMPTY = {
  "a": 1, 
  "abbr": 1, 
  "acronym": 1, 
  "address": 1, 
  "b": 1, 
  "bdo": 1, 
  "big": 1, 
  "cite": 1, 
  "code": 1, 
  "del": 1, 
  "dfn": 1, 
  "em": 1, 
  "font": 1, 
  "i": 1, 
  "ins": 1, 
  "label": 1, 
  "kbd": 1, 
  "q": 1, 
  "s": 1, 
  "samp": 1, 
  "small": 1, 
  "span": 1, 
  "strike": 1, 
  "strong": 1, 
  "sub": 1, 
  "sup": 1, 
  "tt": 1, 
  "u": 1, 
  'var': 1};
  _$jscoverage['/editor/dom.js'].lineData[57]++;
  Editor.PositionType = {
  POSITION_IDENTICAL: 0, 
  POSITION_DISCONNECTED: 1, 
  POSITION_FOLLOWING: 2, 
  POSITION_PRECEDING: 4, 
  POSITION_IS_CONTAINED: 8, 
  POSITION_CONTAINS: 16};
  _$jscoverage['/editor/dom.js'].lineData[65]++;
  var KEP = Editor.PositionType;
  _$jscoverage['/editor/dom.js'].lineData[73]++;
  var blockBoundaryDisplayMatch = {
  "block": 1, 
  'list-item': 1, 
  "table": 1, 
  'table-row-group': 1, 
  'table-header-group': 1, 
  'table-footer-group': 1, 
  'table-row': 1, 
  'table-column-group': 1, 
  'table-column': 1, 
  'table-cell': 1, 
  'table-caption': 1}, blockBoundaryNodeNameMatch = {
  "hr": 1}, normalElDom = function(el) {
  _$jscoverage['/editor/dom.js'].functionData[1]++;
  _$jscoverage['/editor/dom.js'].lineData[88]++;
  return visit57_88_1(el && (visit58_88_2(el[0] || el)));
}, normalEl = function(el) {
  _$jscoverage['/editor/dom.js'].functionData[2]++;
  _$jscoverage['/editor/dom.js'].lineData[91]++;
  return new Node(el);
}, editorDom = {
  _4e_sameLevel: function(el1, el2) {
  _$jscoverage['/editor/dom.js'].functionData[3]++;
  _$jscoverage['/editor/dom.js'].lineData[96]++;
  el2 = normalElDom(el2);
  _$jscoverage['/editor/dom.js'].lineData[97]++;
  var e1p = el1.parentNode;
  _$jscoverage['/editor/dom.js'].lineData[98]++;
  return visit59_98_1(e1p && visit60_98_2(e1p == el2.parentNode));
}, 
  _4e_isBlockBoundary: function(el, customNodeNames) {
  _$jscoverage['/editor/dom.js'].functionData[4]++;
  _$jscoverage['/editor/dom.js'].lineData[103]++;
  var nodeNameMatches = S.merge(blockBoundaryNodeNameMatch, customNodeNames);
  _$jscoverage['/editor/dom.js'].lineData[104]++;
  return !!(visit61_104_1(blockBoundaryDisplayMatch[Dom.css(el, 'display')] || nodeNameMatches[Dom.nodeName(el)]));
}, 
  _4e_index: function(el, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[5]++;
  _$jscoverage['/editor/dom.js'].lineData[109]++;
  var siblings = el.parentNode.childNodes, candidate, currentIndex = -1;
  _$jscoverage['/editor/dom.js'].lineData[113]++;
  for (var i = 0; visit62_113_1(i < siblings.length); i++) {
    _$jscoverage['/editor/dom.js'].lineData[114]++;
    candidate = siblings[i];
    _$jscoverage['/editor/dom.js'].lineData[117]++;
    if (visit63_117_1(normalized && visit64_118_1(visit65_118_2(candidate.nodeType == 3) && visit66_119_1(candidate.previousSibling && visit67_120_1(candidate.previousSibling.nodeType == 3))))) {
      _$jscoverage['/editor/dom.js'].lineData[121]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[124]++;
    currentIndex++;
    _$jscoverage['/editor/dom.js'].lineData[126]++;
    if (visit68_126_1(candidate === el)) {
      _$jscoverage['/editor/dom.js'].lineData[127]++;
      return currentIndex;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[130]++;
  return -1;
}, 
  _4e_move: function(thisElement, target, toStart) {
  _$jscoverage['/editor/dom.js'].functionData[6]++;
  _$jscoverage['/editor/dom.js'].lineData[136]++;
  target = normalElDom(target);
  _$jscoverage['/editor/dom.js'].lineData[137]++;
  if (visit69_137_1(toStart)) {
    _$jscoverage['/editor/dom.js'].lineData[138]++;
    target.insertBefore(thisElement, target.firstChild);
  } else {
    _$jscoverage['/editor/dom.js'].lineData[140]++;
    target.appendChild(thisElement);
  }
}, 
  _4e_isIdentical: function(thisElement, otherElement) {
  _$jscoverage['/editor/dom.js'].functionData[7]++;
  _$jscoverage['/editor/dom.js'].lineData[147]++;
  if (visit70_147_1(!otherElement)) {
    _$jscoverage['/editor/dom.js'].lineData[148]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[151]++;
  otherElement = normalElDom(otherElement);
  _$jscoverage['/editor/dom.js'].lineData[153]++;
  if (visit71_153_1(Dom.nodeName(thisElement) != Dom.nodeName(otherElement))) {
    _$jscoverage['/editor/dom.js'].lineData[154]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[157]++;
  var thisAttributes = thisElement.attributes, otherAttributes = otherElement.attributes;
  _$jscoverage['/editor/dom.js'].lineData[160]++;
  var thisLength = thisAttributes.length, otherLength = otherAttributes.length;
  _$jscoverage['/editor/dom.js'].lineData[163]++;
  if (visit72_163_1(thisLength != otherLength)) {
    _$jscoverage['/editor/dom.js'].lineData[164]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[167]++;
  for (var i = 0; visit73_167_1(i < thisLength); i++) {
    _$jscoverage['/editor/dom.js'].lineData[168]++;
    var attribute = thisAttributes[i], name = attribute.name;
    _$jscoverage['/editor/dom.js'].lineData[170]++;
    if (visit74_170_1(attribute.specified && visit75_171_1(Dom.attr(thisElement, name) != Dom.attr(otherElement, name)))) {
      _$jscoverage['/editor/dom.js'].lineData[172]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[179]++;
  if (visit76_179_1(UA.ieMode < 8)) {
    _$jscoverage['/editor/dom.js'].lineData[180]++;
    for (i = 0; visit77_180_1(i < otherLength); i++) {
      _$jscoverage['/editor/dom.js'].lineData[181]++;
      attribute = otherAttributes[i];
      _$jscoverage['/editor/dom.js'].lineData[182]++;
      name = attribute.name;
      _$jscoverage['/editor/dom.js'].lineData[183]++;
      if (visit78_183_1(attribute.specified && visit79_184_1(Dom.attr(thisElement, name) != Dom.attr(otherElement, name)))) {
        _$jscoverage['/editor/dom.js'].lineData[185]++;
        return FALSE;
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[190]++;
  return TRUE;
}, 
  _4e_isEmptyInlineRemovable: function(thisElement) {
  _$jscoverage['/editor/dom.js'].functionData[8]++;
  _$jscoverage['/editor/dom.js'].lineData[195]++;
  if (visit80_195_1(!xhtml_dtd.$removeEmpty[Dom.nodeName(thisElement)])) {
    _$jscoverage['/editor/dom.js'].lineData[196]++;
    return false;
  }
  _$jscoverage['/editor/dom.js'].lineData[198]++;
  var children = thisElement.childNodes;
  _$jscoverage['/editor/dom.js'].lineData[199]++;
  for (var i = 0, count = children.length; visit81_199_1(i < count); i++) {
    _$jscoverage['/editor/dom.js'].lineData[200]++;
    var child = children[i], nodeType = child.nodeType;
    _$jscoverage['/editor/dom.js'].lineData[203]++;
    if (visit82_203_1(visit83_203_2(nodeType == NodeType.ELEMENT_NODE) && child.getAttribute('_ke_bookmark'))) {
      _$jscoverage['/editor/dom.js'].lineData[205]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[208]++;
    if (visit84_208_1(visit85_208_2(visit86_208_3(nodeType == NodeType.ELEMENT_NODE) && !Dom._4e_isEmptyInlineRemovable(child)) || visit87_209_1(visit88_209_2(nodeType == Dom.NodeType.TEXT_NODE) && S.trim(child.nodeValue)))) {
      _$jscoverage['/editor/dom.js'].lineData[210]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[213]++;
  return TRUE;
}, 
  _4e_moveChildren: function(thisElement, target, toStart) {
  _$jscoverage['/editor/dom.js'].functionData[9]++;
  _$jscoverage['/editor/dom.js'].lineData[218]++;
  target = normalElDom(target);
  _$jscoverage['/editor/dom.js'].lineData[220]++;
  if (visit89_220_1(thisElement == target)) {
    _$jscoverage['/editor/dom.js'].lineData[221]++;
    return;
  }
  _$jscoverage['/editor/dom.js'].lineData[224]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[226]++;
  if (visit90_226_1(toStart)) {
    _$jscoverage['/editor/dom.js'].lineData[227]++;
    while (child = thisElement.lastChild) {
      _$jscoverage['/editor/dom.js'].lineData[228]++;
      target.insertBefore(thisElement.removeChild(child), target.firstChild);
    }
  } else {
    _$jscoverage['/editor/dom.js'].lineData[231]++;
    while (child = thisElement.firstChild) {
      _$jscoverage['/editor/dom.js'].lineData[232]++;
      target.appendChild(thisElement.removeChild(child));
    }
  }
}, 
  _4e_mergeSiblings: function(thisElement) {
  _$jscoverage['/editor/dom.js'].functionData[10]++;
  _$jscoverage['/editor/dom.js'].lineData[245]++;
  thisElement = normalEl(thisElement);
  _$jscoverage['/editor/dom.js'].lineData[247]++;
  if (visit91_247_1(REMOVE_EMPTY[thisElement.nodeName()])) {
    _$jscoverage['/editor/dom.js'].lineData[248]++;
    mergeElements(thisElement, TRUE);
    _$jscoverage['/editor/dom.js'].lineData[249]++;
    mergeElements(thisElement);
  }
}, 
  _4e_splitText: function(el, offset) {
  _$jscoverage['/editor/dom.js'].functionData[11]++;
  _$jscoverage['/editor/dom.js'].lineData[256]++;
  var doc = el.ownerDocument;
  _$jscoverage['/editor/dom.js'].lineData[258]++;
  if (visit92_258_1(el.nodeType != Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/dom.js'].lineData[259]++;
    return;
  }
  _$jscoverage['/editor/dom.js'].lineData[264]++;
  if (visit93_264_1(UA['ie'] && visit94_264_2(offset == el.nodeValue.length))) {
    _$jscoverage['/editor/dom.js'].lineData[265]++;
    var next = doc.createTextNode("");
    _$jscoverage['/editor/dom.js'].lineData[266]++;
    Dom.insertAfter(next, el);
    _$jscoverage['/editor/dom.js'].lineData[267]++;
    return next;
  }
  _$jscoverage['/editor/dom.js'].lineData[270]++;
  var ret = el.splitText(offset);
  _$jscoverage['/editor/dom.js'].lineData[279]++;
  if (visit95_279_1(!!(doc.documentMode))) {
    _$jscoverage['/editor/dom.js'].lineData[280]++;
    var workaround = doc.createTextNode("");
    _$jscoverage['/editor/dom.js'].lineData[281]++;
    Dom.insertAfter(workaround, ret);
    _$jscoverage['/editor/dom.js'].lineData[282]++;
    Dom.remove(workaround);
  }
  _$jscoverage['/editor/dom.js'].lineData[285]++;
  return ret;
}, 
  _4e_parents: function(node, closerFirst) {
  _$jscoverage['/editor/dom.js'].functionData[12]++;
  _$jscoverage['/editor/dom.js'].lineData[291]++;
  var parents = [];
  _$jscoverage['/editor/dom.js'].lineData[292]++;
  parents.__IS_NODELIST = 1;
  _$jscoverage['/editor/dom.js'].lineData[293]++;
  do {
    _$jscoverage['/editor/dom.js'].lineData[294]++;
    parents[closerFirst ? 'push' : 'unshift'](node);
  } while (node = node.parentNode);
  _$jscoverage['/editor/dom.js'].lineData[296]++;
  return parents;
}, 
  _4e_nextSourceNode: function(el, startFromSibling, nodeType, guard) {
  _$jscoverage['/editor/dom.js'].functionData[13]++;
  _$jscoverage['/editor/dom.js'].lineData[303]++;
  if (visit96_303_1(guard && !guard.call)) {
    _$jscoverage['/editor/dom.js'].lineData[304]++;
    var guardNode = normalElDom(guard);
    _$jscoverage['/editor/dom.js'].lineData[305]++;
    guard = function(node) {
  _$jscoverage['/editor/dom.js'].functionData[14]++;
  _$jscoverage['/editor/dom.js'].lineData[306]++;
  return visit97_306_1(node !== guardNode);
};
  }
  _$jscoverage['/editor/dom.js'].lineData[310]++;
  var node = visit98_310_1(!startFromSibling && el.firstChild), parent = el;
  _$jscoverage['/editor/dom.js'].lineData[315]++;
  if (visit99_315_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[316]++;
    if (visit100_316_1(visit101_316_2(el.nodeType == NodeType.ELEMENT_NODE) && visit102_317_1(guard && visit103_317_2(guard(el, TRUE) === FALSE)))) {
      _$jscoverage['/editor/dom.js'].lineData[318]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[320]++;
    node = el.nextSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[323]++;
  while (visit104_323_1(!node && (parent = parent.parentNode))) {
    _$jscoverage['/editor/dom.js'].lineData[326]++;
    if (visit105_326_1(guard && visit106_326_2(guard(parent, TRUE) === FALSE))) {
      _$jscoverage['/editor/dom.js'].lineData[327]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[329]++;
    node = parent.nextSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[332]++;
  if (visit107_332_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[333]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[336]++;
  if (visit108_336_1(guard && visit109_336_2(guard(node) === FALSE))) {
    _$jscoverage['/editor/dom.js'].lineData[337]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[340]++;
  if (visit110_340_1(nodeType && visit111_340_2(nodeType != node.nodeType))) {
    _$jscoverage['/editor/dom.js'].lineData[341]++;
    return Dom._4e_nextSourceNode(node, FALSE, nodeType, guard);
  }
  _$jscoverage['/editor/dom.js'].lineData[344]++;
  return node;
}, 
  _4e_previousSourceNode: function(el, startFromSibling, nodeType, guard) {
  _$jscoverage['/editor/dom.js'].functionData[15]++;
  _$jscoverage['/editor/dom.js'].lineData[350]++;
  if (visit112_350_1(guard && !guard.call)) {
    _$jscoverage['/editor/dom.js'].lineData[351]++;
    var guardNode = normalElDom(guard);
    _$jscoverage['/editor/dom.js'].lineData[352]++;
    guard = function(node) {
  _$jscoverage['/editor/dom.js'].functionData[16]++;
  _$jscoverage['/editor/dom.js'].lineData[353]++;
  return visit113_353_1(node !== guardNode);
};
  }
  _$jscoverage['/editor/dom.js'].lineData[357]++;
  var node = visit114_357_1(!startFromSibling && el.lastChild), parent = el;
  _$jscoverage['/editor/dom.js'].lineData[362]++;
  if (visit115_362_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[363]++;
    if (visit116_363_1(visit117_363_2(el.nodeType == NodeType.ELEMENT_NODE) && visit118_364_1(guard && visit119_364_2(guard(el, TRUE) === FALSE)))) {
      _$jscoverage['/editor/dom.js'].lineData[365]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[367]++;
    node = el.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[370]++;
  while (visit120_370_1(!node && (parent = parent.parentNode))) {
    _$jscoverage['/editor/dom.js'].lineData[373]++;
    if (visit121_373_1(guard && visit122_373_2(guard(parent, TRUE) === FALSE))) {
      _$jscoverage['/editor/dom.js'].lineData[374]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[375]++;
    node = parent.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[378]++;
  if (visit123_378_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[379]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[382]++;
  if (visit124_382_1(guard && visit125_382_2(guard(node) === FALSE))) {
    _$jscoverage['/editor/dom.js'].lineData[383]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[386]++;
  if (visit126_386_1(nodeType && visit127_386_2(node.nodeType != nodeType))) {
    _$jscoverage['/editor/dom.js'].lineData[387]++;
    return Dom._4e_previousSourceNode(node, FALSE, nodeType, guard);
  }
  _$jscoverage['/editor/dom.js'].lineData[390]++;
  return node;
}, 
  _4e_commonAncestor: function(el, node) {
  _$jscoverage['/editor/dom.js'].functionData[17]++;
  _$jscoverage['/editor/dom.js'].lineData[397]++;
  node = normalElDom(node);
  _$jscoverage['/editor/dom.js'].lineData[399]++;
  if (visit128_399_1(el === node)) {
    _$jscoverage['/editor/dom.js'].lineData[400]++;
    return el;
  }
  _$jscoverage['/editor/dom.js'].lineData[403]++;
  if (visit129_403_1(Dom.contains(node, el))) {
    _$jscoverage['/editor/dom.js'].lineData[404]++;
    return node;
  }
  _$jscoverage['/editor/dom.js'].lineData[407]++;
  var start = el;
  _$jscoverage['/editor/dom.js'].lineData[409]++;
  do {
    _$jscoverage['/editor/dom.js'].lineData[410]++;
    if (visit130_410_1(Dom.contains(start, node))) {
      _$jscoverage['/editor/dom.js'].lineData[411]++;
      return start;
    }
  } while (start = start.parentNode);
  _$jscoverage['/editor/dom.js'].lineData[415]++;
  return NULL;
}, 
  _4e_hasAttributes: visit131_419_1(UA.ieMode < 9) ? function(el) {
  _$jscoverage['/editor/dom.js'].functionData[18]++;
  _$jscoverage['/editor/dom.js'].lineData[421]++;
  var attributes = el.attributes;
  _$jscoverage['/editor/dom.js'].lineData[422]++;
  for (var i = 0; visit132_422_1(i < attributes.length); i++) {
    _$jscoverage['/editor/dom.js'].lineData[423]++;
    var attribute = attributes[i];
    _$jscoverage['/editor/dom.js'].lineData[424]++;
    switch (attribute.name) {
      case 'class':
        _$jscoverage['/editor/dom.js'].lineData[430]++;
        if (visit133_430_1(el.getAttribute('class'))) {
          _$jscoverage['/editor/dom.js'].lineData[431]++;
          return TRUE;
        }
        _$jscoverage['/editor/dom.js'].lineData[433]++;
        break;
      default:
        _$jscoverage['/editor/dom.js'].lineData[435]++;
        if (visit134_435_1(attribute.specified)) {
          _$jscoverage['/editor/dom.js'].lineData[436]++;
          return TRUE;
        }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[440]++;
  return FALSE;
} : function(el) {
  _$jscoverage['/editor/dom.js'].functionData[19]++;
  _$jscoverage['/editor/dom.js'].lineData[443]++;
  if (visit135_443_1(UA.gecko)) {
    _$jscoverage['/editor/dom.js'].lineData[444]++;
    el.removeAttribute("_moz_dirty");
  }
  _$jscoverage['/editor/dom.js'].lineData[448]++;
  return el.hasAttributes();
}, 
  _4e_position: function(el, otherNode) {
  _$jscoverage['/editor/dom.js'].functionData[20]++;
  _$jscoverage['/editor/dom.js'].lineData[456]++;
  var $other = normalElDom(otherNode);
  _$jscoverage['/editor/dom.js'].lineData[458]++;
  if (visit136_458_1(el.compareDocumentPosition)) {
    _$jscoverage['/editor/dom.js'].lineData[459]++;
    return el.compareDocumentPosition($other);
  }
  _$jscoverage['/editor/dom.js'].lineData[464]++;
  if (visit137_464_1(el == $other)) {
    _$jscoverage['/editor/dom.js'].lineData[465]++;
    return KEP.POSITION_IDENTICAL;
  }
  _$jscoverage['/editor/dom.js'].lineData[469]++;
  if (visit138_469_1(visit139_469_2(el.nodeType == NodeType.ELEMENT_NODE) && visit140_470_1($other.nodeType == NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/dom.js'].lineData[471]++;
    if (visit141_471_1(Dom.contains(el, $other))) {
      _$jscoverage['/editor/dom.js'].lineData[472]++;
      return KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING;
    }
    _$jscoverage['/editor/dom.js'].lineData[475]++;
    if (visit142_475_1(Dom.contains($other, el))) {
      _$jscoverage['/editor/dom.js'].lineData[476]++;
      return KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
    }
    _$jscoverage['/editor/dom.js'].lineData[479]++;
    if (visit143_479_1('sourceIndex' in el)) {
      _$jscoverage['/editor/dom.js'].lineData[480]++;
      return (visit144_480_1(visit145_480_2(el.sourceIndex < 0) || visit146_480_3($other.sourceIndex < 0))) ? KEP.POSITION_DISCONNECTED : (visit147_482_1(el.sourceIndex < $other.sourceIndex)) ? KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[490]++;
  var addressOfThis = Dom._4e_address(el), addressOfOther = Dom._4e_address($other), minLevel = Math.min(addressOfThis.length, addressOfOther.length);
  _$jscoverage['/editor/dom.js'].lineData[495]++;
  for (var i = 0; visit148_495_1(i <= minLevel - 1); i++) {
    _$jscoverage['/editor/dom.js'].lineData[496]++;
    if (visit149_496_1(addressOfThis[i] != addressOfOther[i])) {
      _$jscoverage['/editor/dom.js'].lineData[497]++;
      return visit150_497_1(addressOfThis[i] < addressOfOther[i]) ? KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[503]++;
  return (visit151_503_1(addressOfThis.length < addressOfOther.length)) ? KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING : KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
}, 
  _4e_address: function(el, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[21]++;
  _$jscoverage['/editor/dom.js'].lineData[511]++;
  var address = [], $documentElement = el.ownerDocument.documentElement, node = el;
  _$jscoverage['/editor/dom.js'].lineData[515]++;
  while (visit152_515_1(node && visit153_515_2(node != $documentElement))) {
    _$jscoverage['/editor/dom.js'].lineData[516]++;
    address.unshift(Dom._4e_index(node, normalized));
    _$jscoverage['/editor/dom.js'].lineData[517]++;
    node = node.parentNode;
  }
  _$jscoverage['/editor/dom.js'].lineData[520]++;
  return address;
}, 
  _4e_remove: function(el, preserveChildren) {
  _$jscoverage['/editor/dom.js'].functionData[22]++;
  _$jscoverage['/editor/dom.js'].lineData[526]++;
  var parent = el.parentNode;
  _$jscoverage['/editor/dom.js'].lineData[527]++;
  if (visit154_527_1(parent)) {
    _$jscoverage['/editor/dom.js'].lineData[528]++;
    if (visit155_528_1(preserveChildren)) {
      _$jscoverage['/editor/dom.js'].lineData[530]++;
      for (var child; child = el.firstChild; ) {
        _$jscoverage['/editor/dom.js'].lineData[531]++;
        parent.insertBefore(el.removeChild(child), el);
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[534]++;
    parent.removeChild(el);
  }
  _$jscoverage['/editor/dom.js'].lineData[536]++;
  return el;
}, 
  _4e_trim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[23]++;
  _$jscoverage['/editor/dom.js'].lineData[542]++;
  Dom._4e_ltrim(el);
  _$jscoverage['/editor/dom.js'].lineData[543]++;
  Dom._4e_rtrim(el);
}, 
  _4e_ltrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[24]++;
  _$jscoverage['/editor/dom.js'].lineData[549]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[550]++;
  while (child = el.firstChild) {
    _$jscoverage['/editor/dom.js'].lineData[551]++;
    if (visit156_551_1(child.nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/dom.js'].lineData[552]++;
      var trimmed = Utils.ltrim(child.nodeValue), originalLength = child.nodeValue.length;
      _$jscoverage['/editor/dom.js'].lineData[555]++;
      if (visit157_555_1(!trimmed)) {
        _$jscoverage['/editor/dom.js'].lineData[556]++;
        el.removeChild(child);
        _$jscoverage['/editor/dom.js'].lineData[557]++;
        continue;
      } else {
        _$jscoverage['/editor/dom.js'].lineData[559]++;
        if (visit158_559_1(trimmed.length < originalLength)) {
          _$jscoverage['/editor/dom.js'].lineData[560]++;
          Dom._4e_splitText(child, originalLength - trimmed.length);
          _$jscoverage['/editor/dom.js'].lineData[562]++;
          el.removeChild(el.firstChild);
        }
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[565]++;
    break;
  }
}, 
  _4e_rtrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[25]++;
  _$jscoverage['/editor/dom.js'].lineData[572]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[573]++;
  while (child = el.lastChild) {
    _$jscoverage['/editor/dom.js'].lineData[574]++;
    if (visit159_574_1(child.type == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/dom.js'].lineData[575]++;
      var trimmed = Utils.rtrim(child.nodeValue), originalLength = child.nodeValue.length;
      _$jscoverage['/editor/dom.js'].lineData[577]++;
      if (visit160_577_1(!trimmed)) {
        _$jscoverage['/editor/dom.js'].lineData[578]++;
        el.removeChild(child);
        _$jscoverage['/editor/dom.js'].lineData[579]++;
        continue;
      } else {
        _$jscoverage['/editor/dom.js'].lineData[580]++;
        if (visit161_580_1(trimmed.length < originalLength)) {
          _$jscoverage['/editor/dom.js'].lineData[581]++;
          Dom._4e_splitText(child, trimmed.length);
          _$jscoverage['/editor/dom.js'].lineData[584]++;
          el.removeChild(el.lastChild);
        }
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[587]++;
    break;
  }
  _$jscoverage['/editor/dom.js'].lineData[590]++;
  if (visit162_590_1(!UA['ie'] && !UA.opera)) {
    _$jscoverage['/editor/dom.js'].lineData[591]++;
    child = el.lastChild;
    _$jscoverage['/editor/dom.js'].lineData[592]++;
    if (visit163_592_1(child && visit164_593_1(visit165_593_2(child.nodeType == 1) && visit166_594_1(Dom.nodeName(child) == 'br')))) {
      _$jscoverage['/editor/dom.js'].lineData[595]++;
      el.removeChild(child);
    }
  }
}, 
  _4e_appendBogus: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[26]++;
  _$jscoverage['/editor/dom.js'].lineData[603]++;
  var lastChild = el.lastChild, bogus;
  _$jscoverage['/editor/dom.js'].lineData[606]++;
  while (visit167_606_1(lastChild && visit168_607_1(visit169_607_2(lastChild.nodeType == Dom.NodeType.TEXT_NODE) && !S.trim(lastChild.nodeValue)))) {
    _$jscoverage['/editor/dom.js'].lineData[609]++;
    lastChild = lastChild.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[612]++;
  if (visit170_612_1(!lastChild || visit171_613_1(visit172_613_2(lastChild.nodeType == Dom.NodeType.TEXT_NODE) || visit173_614_1(Dom.nodeName(lastChild) !== 'br')))) {
    _$jscoverage['/editor/dom.js'].lineData[615]++;
    bogus = UA.opera ? el.ownerDocument.createTextNode('') : el.ownerDocument.createElement('br');
    _$jscoverage['/editor/dom.js'].lineData[621]++;
    el.appendChild(bogus);
  }
}, 
  _4e_setMarker: function(element, database, name, value) {
  _$jscoverage['/editor/dom.js'].functionData[27]++;
  _$jscoverage['/editor/dom.js'].lineData[627]++;
  element = normalEl(element);
  _$jscoverage['/editor/dom.js'].lineData[628]++;
  var id = visit174_628_1(element.data('list_marker_id') || (element.data('list_marker_id', S.guid()).data('list_marker_id'))), markerNames = visit175_630_1(element.data('list_marker_names') || (element.data('list_marker_names', {}).data('list_marker_names')));
  _$jscoverage['/editor/dom.js'].lineData[632]++;
  database[id] = element;
  _$jscoverage['/editor/dom.js'].lineData[633]++;
  markerNames[name] = 1;
  _$jscoverage['/editor/dom.js'].lineData[634]++;
  return element.data(name, value);
}, 
  _4e_clearMarkers: function(element, database, removeFromDatabase) {
  _$jscoverage['/editor/dom.js'].functionData[28]++;
  _$jscoverage['/editor/dom.js'].lineData[640]++;
  element = normalEl(element);
  _$jscoverage['/editor/dom.js'].lineData[641]++;
  var names = element.data('list_marker_names'), id = element.data('list_marker_id');
  _$jscoverage['/editor/dom.js'].lineData[643]++;
  for (var i in names) {
    _$jscoverage['/editor/dom.js'].lineData[644]++;
    element.removeData(i);
  }
  _$jscoverage['/editor/dom.js'].lineData[646]++;
  element.removeData('list_marker_names');
  _$jscoverage['/editor/dom.js'].lineData[647]++;
  if (visit176_647_1(removeFromDatabase)) {
    _$jscoverage['/editor/dom.js'].lineData[648]++;
    element.removeData('list_marker_id');
    _$jscoverage['/editor/dom.js'].lineData[649]++;
    delete database[id];
  }
}, 
  _4e_copyAttributes: function(el, target, skipAttributes) {
  _$jscoverage['/editor/dom.js'].functionData[29]++;
  _$jscoverage['/editor/dom.js'].lineData[656]++;
  target = normalEl(target);
  _$jscoverage['/editor/dom.js'].lineData[657]++;
  var attributes = el.attributes;
  _$jscoverage['/editor/dom.js'].lineData[658]++;
  skipAttributes = visit177_658_1(skipAttributes || {});
  _$jscoverage['/editor/dom.js'].lineData[660]++;
  for (var n = 0; visit178_660_1(n < attributes.length); n++) {
    _$jscoverage['/editor/dom.js'].lineData[663]++;
    var attribute = attributes[n], attrName = attribute.name.toLowerCase(), attrValue;
    _$jscoverage['/editor/dom.js'].lineData[668]++;
    if (visit179_668_1(attrName in skipAttributes)) {
      _$jscoverage['/editor/dom.js'].lineData[669]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[672]++;
    if (visit180_672_1(visit181_672_2(attrName == 'checked') && (attrValue = Dom.attr(el, attrName)))) {
      _$jscoverage['/editor/dom.js'].lineData[673]++;
      target.attr(attrName, attrValue);
    } else {
      _$jscoverage['/editor/dom.js'].lineData[676]++;
      if (visit182_676_1(attribute.specified || (visit183_677_1(UA['ie'] && visit184_677_2(attribute.value && visit185_677_3(attrName == 'value')))))) {
        _$jscoverage['/editor/dom.js'].lineData[678]++;
        attrValue = Dom.attr(el, attrName);
        _$jscoverage['/editor/dom.js'].lineData[679]++;
        if (visit186_679_1(attrValue === NULL)) {
          _$jscoverage['/editor/dom.js'].lineData[680]++;
          attrValue = attribute.nodeValue;
        }
        _$jscoverage['/editor/dom.js'].lineData[682]++;
        target.attr(attrName, attrValue);
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[687]++;
  if (visit187_687_1(el.style.cssText !== '')) {
    _$jscoverage['/editor/dom.js'].lineData[688]++;
    target[0].style.cssText = el.style.cssText;
  }
}, 
  _4e_isEditable: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[30]++;
  _$jscoverage['/editor/dom.js'].lineData[695]++;
  var name = Dom.nodeName(el), dtd = visit188_696_1(!xhtml_dtd.$nonEditable[name] && (visit189_697_1(xhtml_dtd[name] || xhtml_dtd["span"])));
  _$jscoverage['/editor/dom.js'].lineData[699]++;
  return visit190_699_1(dtd && dtd['#text']);
}, 
  _4e_getByAddress: function(doc, address, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[31]++;
  _$jscoverage['/editor/dom.js'].lineData[704]++;
  var $ = doc.documentElement;
  _$jscoverage['/editor/dom.js'].lineData[706]++;
  for (var i = 0; visit191_706_1($ && visit192_706_2(i < address.length)); i++) {
    _$jscoverage['/editor/dom.js'].lineData[707]++;
    var target = address[i];
    _$jscoverage['/editor/dom.js'].lineData[709]++;
    if (visit193_709_1(!normalized)) {
      _$jscoverage['/editor/dom.js'].lineData[710]++;
      $ = $.childNodes[target];
      _$jscoverage['/editor/dom.js'].lineData[711]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[714]++;
    var currentIndex = -1;
    _$jscoverage['/editor/dom.js'].lineData[716]++;
    for (var j = 0; visit194_716_1(j < $.childNodes.length); j++) {
      _$jscoverage['/editor/dom.js'].lineData[717]++;
      var candidate = $.childNodes[j];
      _$jscoverage['/editor/dom.js'].lineData[719]++;
      if (visit195_719_1(visit196_719_2(normalized === TRUE) && visit197_720_1(visit198_720_2(candidate.nodeType == 3) && visit199_721_1(candidate.previousSibling && visit200_722_1(candidate.previousSibling.nodeType == 3))))) {
        _$jscoverage['/editor/dom.js'].lineData[723]++;
        continue;
      }
      _$jscoverage['/editor/dom.js'].lineData[726]++;
      currentIndex++;
      _$jscoverage['/editor/dom.js'].lineData[728]++;
      if (visit201_728_1(currentIndex == target)) {
        _$jscoverage['/editor/dom.js'].lineData[729]++;
        $ = candidate;
        _$jscoverage['/editor/dom.js'].lineData[730]++;
        break;
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[735]++;
  return $;
}};
  _$jscoverage['/editor/dom.js'].lineData[739]++;
  function mergeElements(element, isNext) {
    _$jscoverage['/editor/dom.js'].functionData[32]++;
    _$jscoverage['/editor/dom.js'].lineData[740]++;
    var sibling = element[isNext ? "next" : "prev"](undefined, 1);
    _$jscoverage['/editor/dom.js'].lineData[742]++;
    if (visit202_742_1(sibling && visit203_742_2(sibling[0].nodeType == NodeType.ELEMENT_NODE))) {
      _$jscoverage['/editor/dom.js'].lineData[746]++;
      var pendingNodes = [];
      _$jscoverage['/editor/dom.js'].lineData[748]++;
      while (visit204_748_1(sibling.attr('_ke_bookmark') || sibling._4e_isEmptyInlineRemovable(undefined))) {
        _$jscoverage['/editor/dom.js'].lineData[749]++;
        pendingNodes.push(sibling);
        _$jscoverage['/editor/dom.js'].lineData[750]++;
        sibling = isNext ? sibling.next(undefined, 1) : sibling.prev(undefined, 1);
        _$jscoverage['/editor/dom.js'].lineData[751]++;
        if (visit205_751_1(!sibling)) {
          _$jscoverage['/editor/dom.js'].lineData[752]++;
          return;
        }
      }
      _$jscoverage['/editor/dom.js'].lineData[756]++;
      if (visit206_756_1(element._4e_isIdentical(sibling, undefined))) {
        _$jscoverage['/editor/dom.js'].lineData[759]++;
        var innerSibling = new Node(isNext ? element[0].lastChild : element[0].firstChild);
        _$jscoverage['/editor/dom.js'].lineData[762]++;
        while (pendingNodes.length) {
          _$jscoverage['/editor/dom.js'].lineData[763]++;
          pendingNodes.shift()._4e_move(element, !isNext, undefined);
        }
        _$jscoverage['/editor/dom.js'].lineData[766]++;
        sibling._4e_moveChildren(element, !isNext, undefined);
        _$jscoverage['/editor/dom.js'].lineData[767]++;
        sibling.remove();
        _$jscoverage['/editor/dom.js'].lineData[770]++;
        if (visit207_770_1(innerSibling[0] && visit208_770_2(innerSibling[0].nodeType == NodeType.ELEMENT_NODE))) {
          _$jscoverage['/editor/dom.js'].lineData[771]++;
          innerSibling._4e_mergeSiblings();
        }
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[777]++;
  Utils.injectDom(editorDom);
});
